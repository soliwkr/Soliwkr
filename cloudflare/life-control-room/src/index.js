import { HTML } from './experience.js';
import { evaluateAccessRequest } from './access-auth.js';
import { evaluatePlatformAccess } from './access-platform.js';
import { collectGithubEvents, sourceEventResponse } from './observations.js';
import { injectAtlas } from './atlas.js';
import { injectMemory } from './memory-ui.js';
import { injectCockpit } from './cockpit.js';
import { knowledgeRequest, readKnowledge } from './knowledge.js';
import { createVaultArchive } from './vault.js';
const REPOS = [
['soliwkr/Soliwkr','AIOS / Soliwkr','Governance'],
['soliwkr/black-office','Black Office','Motore economico'],
['soliwkr/workprint','Workprint','Consumer product'],
['soliwkr/trovatemi-os','Trovatemi OS','Business OS'],
['soliwkr/trovatemi-web','Trovatemi Web','Acquisizione'],
['soliwkr/esim','SenzaRoaming','E-commerce'],
['soliwkr/gara-radar','Gara Radar','Utility'],
['soliwkr/sudpontino','Sud Pontino','Territorio'],
['soliwkr/raccolto-app','Raccolto','Eventi'],
['soliwkr/rankempire-italia','RankEmpire Italia','Factory']
];
const DEFAULT={focus:'',goals:[],inbox:[],notDoing:'',pillars:{}};
const headers={'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer','x-frame-options':'DENY','content-security-policy':"default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; base-uri 'none'; frame-ancestors 'none'; form-action 'self'"};
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers});}
function normalize(v){if(!v||typeof v!=='object'||Array.isArray(v))throw new Error('Formato non valido');
const text=(x,n)=>typeof x==='string'?x.slice(0,n):'';
const p={};for(const k of ['corpo','relazioni','fede','denaro','progetti','tempo']){const pv=(v.pillars&&typeof v.pillars[k]==='object')?v.pillars[k]:{};p[k]={signal:['ok','watch','urgent'].includes(pv.signal)?pv.signal:'',next:text(pv.next,180)}}
return {focus:text(v.focus,240),notDoing:text(v.notDoing,700),pillars:p,goals:(Array.isArray(v.goals)?v.goals:[]).slice(0,3).map(x=>({id:text(x.id,50),text:text(x.text,160),done:x.done===true})).filter(x=>x.text),inbox:(Array.isArray(v.inbox)?v.inbox:[]).slice(0,30).map(x=>({id:text(x.id,50),text:text(x.text,750)})).filter(x=>x.text)}}
async function getState(env){const x=await env.LIFE_DB.prepare("SELECT payload,version,updated_at FROM private_state WHERE id='main'").first();return x?{state:JSON.parse(x.payload),version:x.version,updated_at:x.updated_at}:{state:DEFAULT,version:0,updated_at:null}}
async function repoProjects(){return Promise.all(REPOS.map(async ([slug,label,group])=>{try{const r=await fetch('https://api.github.com/repos/'+slug,{headers:{'Accept':'application/vnd.github+json','User-Agent':'soliwkr-aios-life-room'},cf:{cacheTtl:900,cacheEverything:true}});if(!r.ok)throw Error();const d=await r.json();return {label,group,url:'https://github.com/'+slug,pushed_at:d.pushed_at||null}}catch{return {label,group,url:'https://github.com/'+slug,pushed_at:null}}}))}
export default {async fetch(request,env,ctx){try{const url=new URL(request.url);if(url.hostname!==(env.AIOS_HOST||'aios.soliwkr.pro'))return new Response('Not found',{status:404});// Native Access is Cloudflare runtime-attested; observe it in stage before
// enabling it as the primary authentication path. JWT remains verified now.
const platform=await evaluatePlatformAccess(ctx,env);
const usePlatform=env.AIOS_PLATFORM_AUTH==='enabled';
const authorization=(usePlatform&&platform.available)
  ? platform
  : await evaluateAccessRequest(request,env);
if(!authorization.ok){
const stagingOnly=env.AIOS_HOST==='aios-stage.soliwkr.pro'&&env.AIOS_AUTH_DIAGNOSTICS==='enabled';
const message=stagingOnly?'Access authentication required [stage-check: '+authorization.code+']':'Access authentication required';
return new Response(message,{status:401,headers:{'cache-control':'no-store','x-content-type-options':'nosniff'}});
}
if(env.AIOS_HOST==='aios-stage.soliwkr.pro'&&
   env.AIOS_PLATFORM_AUTH==='observe'&&env.LIFE_DB&&typeof ctx?.waitUntil==='function'){
  // Only a boolean readiness signal in fixture-only stage D1. No user identity,
  // token, IP, session, or personal data are collected.
  const status=platform.ok?'ok':platform.available?'error':'unknown';
  ctx.waitUntil(env.LIFE_DB.prepare(
    "INSERT INTO source_checks(provider,source_key,checked_at,status,error_code,events_seen) VALUES('access_runtime','ctx_access',?,?,?,0) "+
    "ON CONFLICT(provider,source_key) DO UPDATE SET checked_at=excluded.checked_at,status=excluded.status,error_code=excluded.error_code,events_seen=0"
  ).bind(new Date().toISOString(),status,platform.code).run().catch(()=>{}));
}
if(url.pathname==='/'&&request.method==='GET')return new Response(injectCockpit(injectMemory(injectAtlas(HTML))),{headers:{...headers,'content-type':'text/html; charset=utf-8'}});if(url.pathname==='/api/health'&&request.method==='GET')return json({status:'ok',storage:!!env.LIFE_DB,privacy:'Cloudflare Access'});if(!env.LIFE_DB)return json({error:'Storage unavailable'},503);if(url.pathname==='/api/knowledge'||url.pathname.startsWith('/api/knowledge/'))return knowledgeRequest(request,env,url);if(url.pathname==='/api/state'&&request.method==='GET')return json(await getState(env));if(url.pathname==='/api/projects'&&request.method==='GET')return json({projects:await repoProjects()});if(url.pathname==='/api/observations'&&request.method==='GET')return sourceEventResponse(env.LIFE_DB);if(url.pathname==='/api/vault'&&request.method==='GET'){const snapshot=await getState(env);const knowledge=await readKnowledge(env.LIFE_DB);const bytes=createVaultArchive(snapshot.state,snapshot.version,new Date(),knowledge);return new Response(bytes,{status:200,headers:{'content-type':'application/zip','content-disposition':'attachment; filename="Soliwkr-Wiki.zip"','cache-control':'no-store, private','x-content-type-options':'nosniff','referrer-policy':'no-referrer','x-frame-options':'DENY'}});}if(url.pathname==='/api/state'&&request.method==='PUT'){if(request.headers.get('origin')!==url.origin||request.headers.get('x-control-room')!=='1'||!request.headers.get('content-type')?.startsWith('application/json'))return json({error:'Invalid origin'},403);const body=await request.text();if(body.length>40000)return json({error:'Too large'},413);let x;try{x=JSON.parse(body)}catch{return json({error:'Invalid JSON'},400)}if(!Number.isInteger(x.version)||x.version<0)return json({error:'Invalid version'},400);let payload;try{payload=JSON.stringify(normalize(x.state))}catch{return json({error:'Invalid state'},400)}let result;if(x.version===0){result=await env.LIFE_DB.prepare("INSERT OR IGNORE INTO private_state (id,payload,version,updated_at) VALUES ('main',?,1,datetime('now'))").bind(payload).run()}else{result=await env.LIFE_DB.prepare("UPDATE private_state SET payload=?,version=version+1,updated_at=datetime('now') WHERE id='main' AND version=?").bind(payload,x.version).run()}if(!result.meta?.changes)return json({error:'Version conflict'},409);await env.LIFE_DB.prepare("INSERT INTO change_events (event_type) VALUES ('state_updated')").run();const fresh=await getState(env);return json({version:fresh.version,updated_at:fresh.updated_at})}return json({error:'Not found'},404)}catch(e){return json({error:'Internal server error'},500)}},async scheduled(controller,env,ctx){if(!env.LIFE_DB)return;ctx.waitUntil(collectGithubEvents(env.LIFE_DB,REPOS));}};
