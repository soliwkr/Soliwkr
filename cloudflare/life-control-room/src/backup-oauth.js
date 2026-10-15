// Owner authentication is enforced by index.js before dispatching these routes.
// This module NEVER creates a Drive folder/file or exports production data.
const BASE = '/api/backup/google';
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
const COOKIE = '__Host-aios-backup-oauth';
const te = new TextEncoder();
const td = new TextDecoder();
const headers = {'cache-control':'no-store, private','referrer-policy':'no-referrer',
  'x-content-type-options':'nosniff','x-frame-options':'DENY'};
const clearCookie = `${COOKIE}=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0`;
function json(body,status=200,extra={}) {
  return new Response(JSON.stringify(body),{status,headers:{...headers,'content-type':'application/json',...extra}});
}
function b64(bytes) { return btoa(String.fromCharCode(...bytes)); }
function un64(s) { return Uint8Array.from(atob(s),c=>c.charCodeAt(0)); }
function random() { return b64(crypto.getRandomValues(new Uint8Array(32))).replaceAll('+','-').replaceAll('/','_').replaceAll('=',''); }
async function digest(s) { return b64(new Uint8Array(await crypto.subtle.digest('SHA-256',te.encode(s)))); }
function email(s) {
  const value = String(s||'').trim().toLowerCase();
  const parts = value.split('@');
  if(parts.length!==2||!parts[0]||!parts[1]) throw new Error('configuration');
  if(['gmail.com','googlemail.com'].includes(parts[1])) return parts[0].split('+')[0].replaceAll('.','')+'@gmail.com';
  return value;
}
async function key(env) {
  const bytes=un64(env.BACKUP_OAUTH_SEAL_KEY||'');
  if(bytes.length!==32) throw new Error('configuration');
  return crypto.subtle.importKey('raw',bytes,'AES-GCM',false,['encrypt','decrypt']);
}
export async function sealToken(token,accountId,env) {
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const data=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:te.encode('aios-drive-refresh:v1:'+accountId)},await key(env),te.encode(token));
  return JSON.stringify({v:1,iv:b64(iv),data:b64(new Uint8Array(data))});
}
export async function openToken(sealed,accountId,env) {
  const x=JSON.parse(sealed);
  if(x.v!==1) throw new Error('format');
  return td.decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:un64(x.iv),additionalData:te.encode('aios-drive-refresh:v1:'+accountId)},await key(env),un64(x.data)));
}
function configured(env) {
  return env.BACKUP_GOOGLE_OAUTH_ENABLED==='enabled'&&!!env.LIFE_DB&&
    !!env.BACKUP_GOOGLE_CLIENT_ID&&!!env.BACKUP_GOOGLE_CLIENT_SECRET&&
    !!env.BACKUP_TARGET_EMAIL&&!!env.BACKUP_FORBIDDEN_EMAIL&&!!env.BACKUP_OAUTH_SEAL_KEY;
}
function validateConfig(env) {
  if(email(env.BACKUP_TARGET_EMAIL)===email(env.BACKUP_FORBIDDEN_EMAIL)) throw new Error('configuration');
  // Callback is fixed by operator configuration, never derived from Host/user input.
  const origin=new URL('https://'+env.AIOS_HOST);
  if(origin.hostname!==env.AIOS_HOST||origin.port||origin.pathname!=='/') throw new Error('configuration');
  return origin.origin+BASE+'/callback';
}
async function googleJson(url,init,fetcher) {
  const response=await fetcher(url,{...init,redirect:'error',signal:AbortSignal.timeout(15000)});
  // Bound upstream reads; do not echo Google errors or tokens in responses/logs.
  if(!response.ok||!response.body) throw new Error('upstream');
  const reader=response.body.getReader();let size=0;const chunks=[];
  try { while(true) { const {done,value}=await reader.read();if(done)break;
    size+=value.length;if(size>32768) { await reader.cancel();throw new Error('upstream'); } chunks.push(value); }
  } finally { reader.releaseLock(); }
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  return JSON.parse(td.decode(bytes));
}
async function verifyAccount(accessToken,env,fetcher) {
  const about=await googleJson('https://www.googleapis.com/drive/v3/about?fields=user(emailAddress,permissionId)',
    {headers:{authorization:'Bearer '+accessToken}},fetcher);
  const user=about.user;
  if(!user?.permissionId||email(user.emailAddress)!==email(env.BACKUP_TARGET_EMAIL)||
     email(user.emailAddress)===email(env.BACKUP_FORBIDDEN_EMAIL)||
     (env.BACKUP_FORBIDDEN_ACCOUNT_ID&&user.permissionId===env.BACKUP_FORBIDDEN_ACCOUNT_ID)) throw new Error('account');
  return user.permissionId;
}
// Future uploader must call this immediately before any Drive write. Not a backup PASS.
export async function verifiedDriveAccess(env,fetcher=fetch) {
  if(!configured(env)) throw new Error('configuration');validateConfig(env);
  const row=await env.LIFE_DB.prepare("SELECT account_id,sealed_refresh_token FROM backup_oauth_connection WHERE id='drive'").first();
  if(!row) throw new Error('disconnected');
  const token=await googleJson('https://oauth2.googleapis.com/token',{method:'POST',
    headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({
      client_id:env.BACKUP_GOOGLE_CLIENT_ID,client_secret:env.BACKUP_GOOGLE_CLIENT_SECRET,
      grant_type:'refresh_token',refresh_token:await openToken(row.sealed_refresh_token,row.account_id,env)})},fetcher);
  if(!token.access_token||token.token_type?.toLowerCase()!=='bearer')throw new Error('upstream');
  if(await verifyAccount(token.access_token,env,fetcher)!==row.account_id) throw new Error('account');
  return token.access_token;
}
export async function backupOAuthRequest(request,env,url=new URL(request.url),fetcher=fetch) {
  const callback=url.pathname===BASE+'/callback';
  const fail=(status=400)=>json({error:'Backup authorization failed',backup:'HOLD'},status,callback?{'set-cookie':clearCookie}:{});
  if(!configured(env))return json({status:'configuration_required',backup:'HOLD'},503);
  let redirect;
  try { redirect=validateConfig(env);await key(env); } catch {return fail(503);}
  if(url.origin!==new URL(redirect).origin)return fail(404);
  try {
    if(url.pathname===BASE+'/status'&&request.method==='GET') {
      const row=await env.LIFE_DB.prepare("SELECT verified_at FROM backup_oauth_connection WHERE id='drive'").first();
      return json({status:row?'authorized_at_callback':'disconnected',verified_at:row?.verified_at||null,backup:'HOLD'});
    }
    if(url.pathname===BASE+'/start'&&request.method==='POST') {
      if(request.headers.get('origin')!==url.origin||request.headers.get('x-control-room')!=='1')return fail(403);
      const state=random(),browser=random(),now=Math.floor(Date.now()/1000);
      await env.LIFE_DB.prepare('DELETE FROM backup_oauth_states WHERE expires_at <= ?').bind(now).run();
      await env.LIFE_DB.prepare('INSERT INTO backup_oauth_states(state_hash,browser_hash,expires_at) VALUES(?,?,?)')
        .bind(await digest(state),await digest(browser),now+600).run();
      const auth=new URL('https://accounts.google.com/o/oauth2/v2/auth');
      auth.search=new URLSearchParams({client_id:env.BACKUP_GOOGLE_CLIENT_ID,redirect_uri:redirect,
        response_type:'code',scope:DRIVE_SCOPE,access_type:'offline',prompt:'consent select_account',
        include_granted_scopes:'false',state}).toString();
      return json({url:auth.href},200,{'set-cookie':`${COOKIE}=${browser}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=600`});
    }
    if(callback&&request.method==='GET') {
      const state=url.searchParams.get('state');
      const browser=(request.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);
      if(!state||!browser||state.length>100||browser.length>100)return fail();
      const row=await env.LIFE_DB.prepare('DELETE FROM backup_oauth_states WHERE state_hash=? AND browser_hash=? AND expires_at>? RETURNING state_hash')
        .bind(await digest(state),await digest(browser),Math.floor(Date.now()/1000)).first();
      if(!row||url.searchParams.has('error'))return fail();
      const code=url.searchParams.get('code');if(!code||code.length>4096)return fail();
      const token=await googleJson('https://oauth2.googleapis.com/token',{method:'POST',
        headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({
          client_id:env.BACKUP_GOOGLE_CLIENT_ID,client_secret:env.BACKUP_GOOGLE_CLIENT_SECRET,
          code,grant_type:'authorization_code',redirect_uri:redirect})},fetcher);
      if(!token.access_token||!token.refresh_token||token.token_type?.toLowerCase()!=='bearer'||
         !String(token.scope||'').split(' ').includes(DRIVE_SCOPE))return fail();
      const accountId=await verifyAccount(token.access_token,env,fetcher);
      const sealed=await sealToken(token.refresh_token,accountId,env);
      await env.LIFE_DB.prepare("INSERT INTO backup_oauth_connection(id,account_id,sealed_refresh_token,verified_at) VALUES('drive',?,?,?) ON CONFLICT(id) DO UPDATE SET account_id=excluded.account_id,sealed_refresh_token=excluded.sealed_refresh_token,verified_at=excluded.verified_at")
        .bind(accountId,sealed,new Date().toISOString()).run();
      // Strip code/state from the address bar; no third-party assets on callback.
      return new Response(null,{status:303,headers:{...headers,location:'/backup/google', 'set-cookie':clearCookie}});
    }
    return fail(404);
  } catch {return fail(502);}
}
export function backupConnectPage() {
  return new Response(`<!doctype html><html lang="it"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Backup SOLIWKR</title><h1>Collega il Drive per i backup</h1><p>Scegli il Google personale SOLIWKR. L'account viene verificato prima di qualsiasi upload.</p><button id="connect">Collega Google Drive</button><p id="status">Backup: HOLD. Il collegamento non prova il recupero dei dati.</p><script>
const button=document.querySelector('#connect'),status=document.querySelector('#status');
fetch('${BASE}/status').then(r=>r.json()).then(x=>{status.textContent=x.status==='authorized_at_callback'?'Account verificato al collegamento. Backup ancora HOLD.':'Collegamento da completare. Backup HOLD.'}).catch(()=>{status.textContent='Verifica non disponibile. Backup HOLD.'});
button.onclick=async()=>{button.disabled=true;try{const r=await fetch('${BASE}/start',{method:'POST',headers:{'x-control-room':'1'}});const x=await r.json();if(!r.ok||!x.url)throw Error();location.assign(x.url)}catch{status.textContent='Configurazione Google non disponibile. Backup HOLD.';button.disabled=false}};
</script></html>`,{headers:{...headers,'content-type':'text/html; charset=utf-8',
    'content-security-policy':"default-src 'none'; script-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'"}});
}
