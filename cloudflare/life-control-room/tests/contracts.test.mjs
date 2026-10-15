import test from 'node:test';
import assert from 'node:assert/strict';
import { Script } from 'node:vm';
import worker from '../src/index.js';
import { HTML } from '../src/experience.js';
import { injectAtlas } from '../src/atlas.js';
import { createVaultArchive } from '../src/vault.js';
import { ENV_AUTH, signedSession, installJwksFixture } from './auth-fixture.mjs';
installJwksFixture();

const base='https://aios.soliwkr.pro';
const session=signedSession();

function database(){
 let state=null,logs=0;
 return {
  prepare(sql){let params=[];return{
   bind(...v){params=v;return this},
   async first(){return state},
   async all(){return {results:[]}},
   async run(){
    if(sql.includes('INSERT OR IGNORE')){if(state)return {meta:{changes:0}};state={payload:params[0],version:1,updated_at:'2026-10-12 17:00:00'};return {meta:{changes:1}}}
    if(sql.includes('UPDATE private_state')){if(!state||state.version!==params[1])return {meta:{changes:0}};state={payload:params[0],version:state.version+1,updated_at:'2026-10-12 17:01:00'};return {meta:{changes:1}}}
    if(sql.includes('INSERT INTO change_events')){logs++;return {meta:{changes:1}}}
    throw Error('Unexpected SQL: '+sql);
   }
  }},
  get writes(){return logs}
 };
}
const req=(url,init={})=>new Request(base+url,{...init,headers:{...session,...init.headers}});

test('Atlas adds a seventh view without removing the six V1 views',()=>{
 const html=injectAtlas(HTML);
 for(const name of ['oggi','vita','studio','mente','rituali','sistemi','grafo'])assert.match(html,new RegExp('data-page="'+name+'"'));
 assert.match(html,/id="vault-export"/);
 assert.match(html,/data-nav="grafo"/);
 const match=html.match(/<script>([\s\S]*?)<\/script>/);
 assert.ok(match);
 assert.doesNotThrow(()=>new Script(match[1]));
});

test('Auth is required for private vault, wrong hostname is rejected',async()=>{
 const env={LIFE_DB:database(),...ENV_AUTH};
 assert.equal((await worker.fetch(new Request(base+'/api/vault'),env)).status,401);
 assert.equal((await worker.fetch(new Request('https://wrong.example/api/vault',{headers:session}),env)).status,404);
 assert.equal((await worker.fetch(req('/api/health'),env)).status,200);
});

test('State V0 contract, roundtrip, optimistic write conflict and origin',async()=>{
 const env={LIFE_DB:database(),...ENV_AUTH};
 let a=await worker.fetch(req('/api/state'),env),first=await a.json();
 assert.equal(first.version,0);
 const payload={version:0,state:{focus:'Focus',goals:[{id:'1',text:'Una mossa',done:false}],inbox:[{id:'2',text:'Private idea'}],notDoing:'Fermare distrazioni',pillars:{corpo:{signal:'watch',next:'Camminare'}}}};
 const headers={'content-type':'application/json','x-control-room':'1',origin:base};
 a=await worker.fetch(req('/api/state',{method:'PUT',headers,body:JSON.stringify(payload)}),env);
 assert.equal(a.status,200);
 const b=await (await worker.fetch(req('/api/state'),env)).json();
 assert.equal(b.version,1);assert.equal(b.state.focus,'Focus');assert.equal(b.state.pillars.corpo.next,'Camminare');
 assert.equal(env.LIFE_DB.writes,1);
 const conflict=await worker.fetch(req('/api/state',{method:'PUT',headers,body:JSON.stringify(payload)}),env);
 assert.equal(conflict.status,409);
 const bad=await worker.fetch(req('/api/state',{method:'PUT',headers:{...headers,origin:'https://evil.example'},body:JSON.stringify(payload)}),env);
 assert.equal(bad.status,403);
});

test('Authenticated ZIP is private, valid, unicode and portable',async()=>{
 const env={LIFE_DB:database(),...ENV_AUTH};
 let zip=await worker.fetch(req('/api/vault'),env);
 assert.equal(zip.status,200);
 assert.equal(zip.headers.get('content-type'),'application/zip');
 assert.equal(zip.headers.get('cache-control'),'no-store, private');
 const buffer=await zip.arrayBuffer(),bytes=new Uint8Array(buffer),dv=new DataView(buffer);
 const end=bytes.length-22;
 assert.equal(dv.getUint32(end,true),0x06054b50);
 const n=dv.getUint16(end+10,true);
 assert.ok(n>=25);
 const cd=dv.getUint32(end+16,true);
 let offset=cd;const paths=[];
 for(let i=0;i<n;i++){
  assert.equal(dv.getUint32(offset,true),0x02014b50);
  const size=dv.getUint16(offset+28,true),extra=dv.getUint16(offset+30,true),comment=dv.getUint16(offset+32,true);
  paths.push(new TextDecoder().decode(bytes.slice(offset+46,offset+46+size)));
  offset+=46+size+extra+comment;
 }
 assert.ok(paths.includes('Soliwkr-Wiki/AGENTS.md'));
 assert.ok(paths.includes('Soliwkr-Wiki/INDEX.md'));
 assert.ok(paths.includes('Soliwkr-Wiki/wiki/Metodo Karpathy.md'));
 assert.ok(paths.includes('Soliwkr-Wiki/wiki/Aree/Fede e interiorità.md'));
 assert.ok(paths.some(x=>x.startsWith('Soliwkr-Wiki/raw/snapshots/')));
 const archiveText=new TextDecoder().decode(bytes);
 assert.match(archiveText,/INGEST/);assert.match(archiveText,/Wiki/);
});

test('Vault generator works independently with no D1 mutation',()=>{
 const buf=createVaultArchive({focus:'Piccolo passo',goals:[],inbox:[],pillars:{},notDoing:''},42,new Date('2026-10-12T16:00:00Z'));
 assert.equal(new DataView(buf.buffer).getUint32(0,true),0x04034b50);
 assert.ok(buf.byteLength>2000);
});
