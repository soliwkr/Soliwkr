import test from 'node:test';
import assert from 'node:assert/strict';
import { evidenceBrief } from '../src/evidence-brief.js';

const now=new Date('2026-10-15T12:00:00Z');
const url='https://aios.soliwkr.pro/api/agent/brief';
const headers={origin:'https://aios.soliwkr.pro','content-type':'application/json','x-control-room':'1'};
const request=(h=headers)=>new Request(url,{method:'POST',headers:h,body:JSON.stringify({question:'Cosa è successo oggi?'})});
function db(events=[],sources=[]){return{prepare(sql){let params=[];return{bind(...v){params=v;return this},async all(){if(sql.includes('FROM source_events')){assert.equal(params[0],'github');return{results:events.filter(e=>e.occurred_at>=params[1]&&e.occurred_at<=params[2])}}return{results:sources}}}}}}
const e=(time,seen='2026-10-15T11:00:00Z')=>({provider:'github',event_id:'1',source_key:'soliwkr/Soliwkr',event_type:'PushEvent',summary:'AIOS · Nuovo push',occurred_at:time,observed_at:seen,source_url:'https://github.com/soliwkr/Soliwkr/commit/abc'});
test('same origin and custom header required',async()=>{assert.equal((await evidenceBrief(request({...headers,origin:'https://evil.example'}),db(),now)).status,403);assert.equal((await evidenceBrief(request({...headers,'x-control-room':'0'}),db(),now)).status,403)});
test('24h window uses occurred_at, not backfill observed_at',async()=>{const response=await evidenceBrief(request(),db([e('2026-10-14T11:00:00Z'),e('2026-10-15T10:00:00Z')],[{status:'ok',checked_at:'2026-10-15T11:30:00Z'}]),now);assert.equal(response.status,200);const data=await response.json();assert.equal(data.events.length,1);assert.equal(data.events[0].occurred_at,'2026-10-15T10:00:00Z');assert.equal(data.events[0].observed_at,'2026-10-15T11:00:00Z');assert.equal(data.source_status,'ok')});
test('unknown source never claims no activity',async()=>{const d=await(await evidenceBrief(request(),db(),now)).json();assert.equal(d.source_status,'unknown');assert.match(d.answer,/non posso concludere/)});
test('stale sources are partial',async()=>{const d=await(await evidenceBrief(request(),db([],[{status:'ok',checked_at:'2026-10-14T12:00:00Z'}]),now)).json();assert.equal(d.source_status,'partial')});
test('ledger failure is 503',async()=>{const broken={prepare(){throw Error('missing migration')}};assert.equal((await evidenceBrief(request(),broken,now)).status,503)});

test('AI synthesis is bounded and retains server-owned citations',async()=>{
 let called=0;
 const ai={async run(model,input){called++;assert.equal(input.temperature,0);assert.equal(input.max_tokens,220);return{response:'Un push GitHub verificato.'}}};
 const d=await(await evidenceBrief(request(),db([e('2026-10-15T10:00:00Z')],[{status:'ok',checked_at:'2026-10-15T11:00:00Z'}]),now,ai)).json();
 assert.equal(called,1);assert.equal(d.mode,'ai_grounded_brief');assert.equal(d.events.length,1);assert.equal(d.events[0].url,'https://github.com/soliwkr/Soliwkr/commit/abc');
});
test('AI failure returns deterministic answer without losing sources',async()=>{
 const ai={async run(){throw Error('rate limited')}};
 const d=await(await evidenceBrief(request(),db([e('2026-10-15T10:00:00Z')]),now,ai)).json();
 assert.equal(d.mode,'deterministic_evidence_brief');assert.equal(d.events.length,1);
});
