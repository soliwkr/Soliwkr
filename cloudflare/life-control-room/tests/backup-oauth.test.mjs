import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { backupOAuthRequest, sealToken, openToken, verifiedDriveAccess } from '../src/backup-oauth.js';
const base='https://aios.soliwkr.pro/api/backup/google';
function setup() {
  const db=new DatabaseSync(':memory:');
  db.exec(readFileSync(new URL('../migrations/0006_backup_oauth.sql',import.meta.url),'utf8'));
  const env={AIOS_HOST:'aios.soliwkr.pro',BACKUP_GOOGLE_OAUTH_ENABLED:'enabled',BACKUP_GOOGLE_CLIENT_ID:'test-client',
    BACKUP_GOOGLE_CLIENT_SECRET:'test-secret',BACKUP_TARGET_EMAIL:'target@example.test',BACKUP_FORBIDDEN_EMAIL:'forbidden@example.test',
    BACKUP_OAUTH_SEAL_KEY:Buffer.alloc(32,1).toString('base64'),LIFE_DB:{prepare(sql){const stmt=db.prepare(sql);let values=[];
      return {bind(...args){values=args;return this;},async run(){return stmt.run(...values);},async first(){return stmt.get(...values)||null;}};}}};
  return {db,env};
}
async function start(env,origin='https://aios.soliwkr.pro') {
  const r=await backupOAuthRequest(new Request(base+'/start',{method:'POST',headers:{origin,'x-control-room':'1'}}),env);
  const data=await r.json();return {r,data,state:data.url&&new URL(data.url).searchParams.get('state'),cookie:r.headers.get('set-cookie')?.split(';')[0]};
}
function fakeGoogle(account='target@example.test',extra={}) {
  const calls=[];
  const fetcher=async(url,init)=>{calls.push({url,method:init?.method||'GET'});
    return Response.json(url.includes('/token')?{access_token:'access-test',refresh_token:'refresh-test',token_type:'Bearer',scope:'https://www.googleapis.com/auth/drive.file',...extra}:
      {user:{emailAddress:account,permissionId:'target-id'}});};
  return {calls,fetcher};
}
async function callback(env,s,fetcher,change={}) {
  const u=new URL(base+'/callback');u.search=new URLSearchParams({state:change.state||s.state,code:'code-test'});
  return backupOAuthRequest(new Request(u,{headers:{cookie:change.cookie??s.cookie}}),env,u,fetcher);
}
test('disabled or conflicting identities fail closed before network/storage writes',async()=>{
  const {env,db}=setup();env.BACKUP_GOOGLE_OAUTH_ENABLED='disabled';assert.equal((await start(env)).r.status,503);
  env.BACKUP_GOOGLE_OAUTH_ENABLED='enabled';env.BACKUP_TARGET_EMAIL='first.last+backup@gmail.com';env.BACKUP_FORBIDDEN_EMAIL='firstlast@googlemail.com';
  assert.equal((await start(env)).r.status,503);assert.equal(db.prepare('SELECT count(*) AS n FROM backup_oauth_states').get().n,0);
});
test('start checks origin, requests only drive.file, sets secure browser cookie',async()=>{
  const {env}=setup();assert.equal((await start(env,'https://evil.example')).r.status,403);
  const s=await start(env);assert.equal(s.r.status,200);const u=new URL(s.data.url);
  assert.equal(u.origin,'https://accounts.google.com');assert.equal(u.searchParams.get('scope'),'https://www.googleapis.com/auth/drive.file');
  assert.equal(u.searchParams.get('redirect_uri'),base+'/callback');assert.match(s.r.headers.get('set-cookie'),/Secure; HttpOnly; SameSite=Lax/);
});
test('valid callback stores encrypted token, strips code, cannot replay, never writes Drive',async()=>{
  const {env,db}=setup(),s=await start(env),g=fakeGoogle();const r=await callback(env,s,g.fetcher);
  assert.equal(r.status,303);assert.equal(r.headers.get('location'),'/backup/google');
  const row=db.prepare('SELECT * FROM backup_oauth_connection').get();assert.ok(row);assert.ok(!row.sealed_refresh_token.includes('refresh-test'));
  assert.equal(await openToken(row.sealed_refresh_token,row.account_id,env),'refresh-test');
  assert.equal((await callback(env,s,g.fetcher)).status,400);assert.equal(g.calls.length,2);
  assert.ok(g.calls.every(x=>x.url.includes('/token')||x.url.includes('/about?')));
  assert.equal((await verifiedDriveAccess(env,g.fetcher)),'access-test');
  await assert.rejects(verifiedDriveAccess(env,fakeGoogle('forbidden@example.test').fetcher));
});
test('wrong identity, missing scope/refresh token never create a connection',async()=>{
  for(const [account,extra] of [['forbidden@example.test',{}],['unknown@example.test',{}],['target@example.test',{refresh_token:null}],['target@example.test',{scope:''}]]) {
    const {env,db}=setup(),s=await start(env),g=fakeGoogle(account,extra);assert.notEqual((await callback(env,s,g.fetcher)).status,303);
    assert.equal(db.prepare('SELECT count(*) AS n FROM backup_oauth_connection').get().n,0);
  }
});
test('wrong browser, expired state and replay fail before token exchange',async()=>{
  const {env,db}=setup(),g=fakeGoogle();let s=await start(env);
  assert.equal((await callback(env,s,g.fetcher,{cookie:'__Host-aios-backup-oauth=wrong'})).status,400);
  db.exec('UPDATE backup_oauth_states SET expires_at=0');assert.equal((await callback(env,s,g.fetcher)).status,400);
  assert.equal(g.calls.length,0);
});
test('ciphertext tampering and wrong account/key fail authentication',async()=>{
  const {env}=setup();const sealed=await sealToken('secret-token','account-a',env);
  await assert.rejects(openToken(sealed,'account-b',env));
  await assert.rejects(openToken(sealed,'account-a',{...env,BACKUP_OAUTH_SEAL_KEY:Buffer.alloc(32,2).toString('base64')}));
  const x=JSON.parse(sealed);const data=Buffer.from(x.data,'base64');data[0]^=1;x.data=data.toString('base64');
  await assert.rejects(openToken(JSON.stringify(x),'account-a',env));
});
test('upstream errors do not expose tokens or alter an existing connection',async()=>{
  const {env,db}=setup(),s=await start(env),g=fakeGoogle();await callback(env,s,g.fetcher);
  const before=db.prepare('SELECT sealed_refresh_token FROM backup_oauth_connection').get().sealed_refresh_token;
  const next=await start(env);const r=await callback(env,next,async()=>new Response('sensitive upstream body',{status:500}));
  assert.equal(r.status,502);assert.ok(!(await r.text()).includes('sensitive'));
  assert.equal(db.prepare('SELECT sealed_refresh_token FROM backup_oauth_connection').get().sealed_refresh_token,before);
});
