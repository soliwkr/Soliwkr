import test from "node:test";
import assert from "node:assert/strict";
import { collectGithubEvents,normalizeGithubEvent,sourceEventResponse } from "../src/observations.js";

function dbMock() {
 const events=new Map(),checks=new Map();
 return {events,checks,prepare(sql){
   let args=[];
   return {bind(...values){args=values;return this},
     async run(){
       if(sql.startsWith("INSERT OR IGNORE INTO source_events")){
         const [provider,event_id,source_key,event_type,summary,occurred_at,observed_at,source_url]=args;
         const key=provider+":"+event_id;
         if(events.has(key))return {meta:{changes:0}};
         events.set(key,{provider,event_id,source_key,event_type,summary,occurred_at,observed_at,source_url});
         return {meta:{changes:1}};
       }
       if(sql.startsWith("INSERT INTO source_checks")){
         const [source_key,checked_at,status,error_code,events_seen]=args;
         checks.set(source_key,{source_key,checked_at,status,error_code,events_seen});
         return {meta:{changes:1}};
       }
       throw new Error("Unimplemented SQL "+sql);
     },
     async all(){
       if(sql.includes("FROM source_events"))return {results:[...events.values()].sort((a,b)=>b.occurred_at.localeCompare(a.occurred_at)).slice(0,25)};
       if(sql.includes("FROM source_checks"))return {results:[...checks.values()]};
       throw new Error("Unimplemented SQL");
     }
   }
 }};
}
const SAMPLE=[
 {id:"24601",type:"PushEvent",created_at:"2026-10-13T11:00:00Z",payload:{head:"abc123456789abcdef0123456789abcdef012345"}},
 {id:"24602",type:"PullRequestEvent",created_at:"2026-10-13T11:30:00Z",payload:{action:"closed",pull_request:{merged:true,html_url:"https://github.com/soliwkr/Soliwkr/pull/19"}}},
 {id:"24603",type:"WatchEvent",created_at:"2026-10-13T11:59:00Z",payload:{}},
 {id:"bad",type:"PushEvent",created_at:"2026-10-13T12:01:00Z",payload:{head:"abcdef0123456"}},
 {id:"24604",type:"IssuesEvent",created_at:"2026-10-13T12:02:00Z",payload:{action:"opened",issue:{html_url:"https://evil.example/steal"}}}
];
const REPOS=[["soliwkr/Soliwkr","SOLIWKR","AIOS"]];
const clock=new Date("2026-10-13T13:05:00Z");
const goodFetch=async()=>Response.json(SAMPLE);

test("normalization accepts precise public source references, never generic simulated facts",()=>{
 let record=normalizeGithubEvent(SAMPLE[0],"soliwkr/Soliwkr","SOLIWKR",clock.toISOString());
 assert.equal(record.event_type,"PushEvent");
 assert.ok(record.source_url.includes("/commit/"));
 assert.equal(record.provider,"github");
 assert.equal(record.occurred_at,"2026-10-13T11:00:00.000Z");
 assert.equal(normalizeGithubEvent(SAMPLE[2],"soliwkr/Soliwkr","SOLIWKR",clock.toISOString()),null);
 assert.equal(normalizeGithubEvent(SAMPLE[4],"soliwkr/Soliwkr","SOLIWKR",clock.toISOString()),null);
 assert.equal(normalizeGithubEvent({...SAMPLE[0],created_at:"not a date"},"soliwkr/Soliwkr","SOLIWKR",clock.toISOString()),null);
});

test("hourly collector is idempotent and evidence points to exact events",async()=>{
 const db=dbMock();
 let receipt=await collectGithubEvents(db,REPOS,goodFetch,clock);
 assert.deepEqual(receipt,{sources:1,new_events:2,failed:0});
 assert.equal(db.events.size,2);
 receipt=await collectGithubEvents(db,REPOS,goodFetch,clock);
 assert.deepEqual(receipt,{sources:1,new_events:0,failed:0});
 assert.equal(db.events.size,2);
 let api=await sourceEventResponse(db),data=await api.json();
 assert.equal(api.status,200);
 assert.equal(data.events.length,2);
 assert.equal(data.sources[0].status,"ok");
 assert.ok(data.events.every(x=>x.source_url.startsWith("https://github.com/")));
 assert.ok(data.events.every(x=>x.occurred_at&&x.observed_at));
 assert.ok(data.events.some(x=>x.summary.includes("PR merged")));
});

test("upstream error produces stale/unknown connector state, not fake success",async()=>{
 const db=dbMock();
 await collectGithubEvents(db,REPOS,goodFetch,clock);
 const failed=await collectGithubEvents(db,REPOS,async()=>new Response("Not authorized",{status:403}),new Date("2026-10-13T14:05:00Z"));
 assert.deepEqual(failed,{sources:1,new_events:0,failed:1});
 const response=await (await sourceEventResponse(db)).json();
 assert.equal(response.sources[0].status,"error");
 assert.equal(response.sources[0].error_code,"http_403");
 assert.equal(response.events.length,2,"historical receipts must not be erased by provider outage");
});

test("no table migration yet means the private API shows unavailable, not empty events",async()=>{
 const noDb={prepare(){throw Error("table missing")}};
 const response=await sourceEventResponse(noDb);
 assert.equal(response.status,503);
 assert.equal((await response.json()).error,"Evidence ledger unavailable");
});
