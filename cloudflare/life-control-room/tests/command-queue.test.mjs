import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';
import { DatabaseSync } from 'node:sqlite';
import worker from '../src/index.js';
import { HTML } from '../src/experience.js';
import { injectAtlas } from '../src/atlas.js';
import { injectMemory } from '../src/memory-ui.js';
import { injectCockpit } from '../src/cockpit.js';
import { injectPortfolio } from '../src/portfolio.js';
import { injectConnections } from '../src/context.js';
import { injectCommandQueue } from '../src/command-queue-ui.js';
import { promoteNext } from '../src/command-queue.js';
import { ENV_AUTH, signedSession, installJwksFixture } from './auth-fixture.mjs';
installJwksFixture();
const base='https://aios.soliwkr.pro';
const session=signedSession();
const headers={'content-type':'application/json','x-control-room':'1',origin:base};
const idPattern=/^[0-9a-f-]{36}$/;
function sqliteDB() {
  const native=new DatabaseSync(':memory:');
  native.exec(readFileSync(new URL('../migrations/0006_command_queue.sql',import.meta.url),'utf8'));
  const adapter={
    prepare(sql){
      let params=[];
      return {
        bind(...args){params=args;return this},
        async first(){return native.prepare(sql).get(...params)||null},
        async all(){return {results:native.prepare(sql).all(...params)}},
        _run(){return {meta:{changes:Number(native.prepare(sql).run(...params).changes)}}},
        async run(){return this._run()}
      };
    },
    async batch(statements){
      native.exec('BEGIN IMMEDIATE');
      try {
        const results=statements.map(s=>s._run());
        native.exec('COMMIT');
        return results;
      }catch(e){native.exec('ROLLBACK');throw e}
    },
    native
  };
  return adapter;
}
function request(path,method='GET',payload,auth=session,requestHeaders=headers){
  return new Request(base+path,{method,headers:{...auth,...(method==='POST'?requestHeaders:{})},body:method==='POST'?JSON.stringify(payload):undefined});
}
async function send(db,path,method='GET',payload,auth=session,requestHeaders=headers){
  const response=await worker.fetch(request(path,method,payload,auth,requestHeaders),{...ENV_AUTH,LIFE_DB:db});
  return {status:response.status,body:response.headers.get('content-type')?.includes('application/json')?await response.json():{message:await response.text()}};
}
const fixture=(title,priority)=>({
  title,outcome:'A verifiable external result',why_now:'Direction approved work for next',
  done_when:'Evidence recorded with an authentic artifact reference',
  source_kind:'github',source_url:'https://github.com/example/demo/issues/1',source_status:'verified',
  assignee:'human',privacy_class:'private',priority
});
test('Oggi shows a single factual NEXT before the existing rooms; inline JS parses',()=>{
  const html=injectCommandQueue(injectConnections(injectPortfolio(injectCockpit(injectMemory(injectAtlas(HTML))))));
  assert.equal(html.split('id="command-sheet"').length-1,1);
  assert.ok(html.indexOf('id="command-sheet"')<html.indexOf('class="home-hero"'));
  assert.match(html,/Cosa fai adesso/);
  assert.match(html,/Nessuna assegnazione attiva/);
  assert.match(html,/La delega agli agenti non è ancora attiva/);
  for(const room of ['view-oggi','view-vita','view-studio','view-rituali','view-grafo'])assert.equal(html.split('id="'+room+'"').length-1,1);
  const script=html.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(script);
  assert.doesNotThrow(()=>new Script(script[1]));
});
test('SQLite enforces human WIP 1 even under direct concurrent-looking claims',()=>{
  const db=sqliteDB();
  db.native.prepare("INSERT INTO command_tasks (id,title,outcome,why_now,done_when,source_kind,source_status,assignee,status,priority) VALUES (?,?,?,?,?,?,?,'human','READY',?)")
    .run('1','One','Result','Why','Done','owner','owner_decision',10);
  db.native.prepare("INSERT INTO command_tasks (id,title,outcome,why_now,done_when,source_kind,source_status,assignee,status,priority) VALUES (?,?,?,?,?,?,?,'human','READY',?)")
    .run('2','Two','Result','Why','Done','owner','owner_decision',20);
  return Promise.all([promoteNext(db),promoteNext(db)]).then(results=>{
    const active=db.native.prepare("SELECT id FROM command_tasks WHERE status='ACTIVE' AND assignee='human'").all();
    assert.equal(active.length,1);
    assert.equal(active[0].id,'2');
    assert.equal(results[1].active.id,'2');
    assert.throws(()=>db.native.prepare("UPDATE command_tasks SET status='ACTIVE' WHERE id='1'").run(),/UNIQUE constraint/);
    assert.equal(db.native.prepare("SELECT count(*) AS n FROM command_history WHERE action='ACTIVE'").get().n,1);
  });
});
test('authenticated capture stays parked until direction approves; evidence advances once',async()=>{
  const db=sqliteDB();
  const empty=await send(db,'/api/command-queue');
  assert.equal(empty.status,200); assert.equal(empty.body.active,null);
  const a=await send(db,'/api/command-queue','POST',fixture('First verified task',20));
  const b=await send(db,'/api/command-queue','POST',fixture('Second verified task',90));
  assert.equal(a.status,201); assert.equal(b.status,201);
  assert.match(a.body.id,idPattern);
  assert.equal((await send(db,'/api/command-queue')).body.active,null,'captured items must not silently activate');
  const ready1=await send(db,'/api/command-queue/'+a.body.id+'/ready','POST',{version:1,reason:'Direction selection backed by source'});
  assert.equal(ready1.status,200);assert.equal(ready1.body.active.id,a.body.id);
  const ready2=await send(db,'/api/command-queue/'+b.body.id+'/ready','POST',{version:1,reason:'Direction selection backed by source'});
  assert.equal(ready2.status,200);assert.equal(ready2.body.active.id,a.body.id,'new higher score cannot preempt ACTIVE');
  assert.equal(ready2.body.ready,1);
  const insufficient=await send(db,'/api/command-queue/'+a.body.id+'/finish','POST',{version:3,status:'DONE',evidence:''});
  assert.equal(insufficient.status,400);
  const done=await send(db,'/api/command-queue/'+a.body.id+'/finish','POST',{version:3,status:'DONE',evidence:'https://github.com/example/demo/pull/2'});
  assert.equal(done.status,200);assert.equal(done.body.active.id,b.body.id);
  const repeat=await send(db,'/api/command-queue/'+a.body.id+'/finish','POST',{version:3,status:'DONE',evidence:'https://github.com/example/demo/pull/2'});
  assert.equal(repeat.status,409);
  const noReason=await send(db,'/api/command-queue/'+b.body.id+'/finish','POST',{version:3,status:'BLOCKED',reason:''});
  assert.equal(noReason.status,400);
  const blocked=await send(db,'/api/command-queue/'+b.body.id+'/finish','POST',{version:3,status:'BLOCKED',reason:'Waiting for reviewed artifact'});
  assert.equal(blocked.status,200);assert.equal(blocked.body.active,null);assert.equal(blocked.body.blocked,1);
  const history=db.native.prepare("SELECT action,evidence,reason FROM command_history WHERE task_id=? ORDER BY rowid").all(a.body.id);
  assert.deepEqual(history.map(x=>x.action),['CAPTURED','READY','ACTIVE','DONE']);
  assert.equal(history[3].evidence,'https://github.com/example/demo/pull/2');
});
test('nonowner rejected, forged origin rejected, unavailable schema is 503 not false empty',async()=>{
  const db=sqliteDB();
  const anon=await send(db,'/api/command-queue','GET',null,{});
  assert.equal(anon.status,401);
  const forged=await send(db,'/api/command-queue','POST',fixture('No forgery',10),session,{...headers,origin:'https://attacker.example'});
  assert.equal(forged.status,403);
  const unavailable=await worker.fetch(request('/api/command-queue'),{...ENV_AUTH,LIFE_DB:{prepare(){throw Error('no table')}}});
  assert.equal(unavailable.status,503);
  assert.equal((await unavailable.json()).error,'Command queue storage unavailable');
});
