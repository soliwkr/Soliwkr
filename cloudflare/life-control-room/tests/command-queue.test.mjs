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
  native.exec(readFileSync(new URL('../migrations/0007_command_priority_audit.sql',import.meta.url),'utf8'));
  native.exec(readFileSync(new URL('../migrations/0008_command_intake_receipts.sql',import.meta.url),'utf8'));
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

// Explicit executor selection prevents intake from silently creating a human obligation.
test('capture requires an explicit executor and creates no records when omitted',async()=>{
  const db=sqliteDB();
  const payload=fixture('Synthetic explicit executor',10);
  delete payload.assignee;
  const result=await send(db,'/api/command-queue','POST',payload);
  assert.equal(result.status,400);
  assert.equal(db.native.prepare('SELECT count(*) AS n FROM command_tasks').get().n,0);
  assert.equal(db.native.prepare('SELECT count(*) AS n FROM command_history').get().n,0);
});
test('failed audit writes roll back intake and return sanitized 503 on every write route',async()=>{
  const db=sqliteDB();
  db.native.exec("CREATE TRIGGER fail_audit BEFORE INSERT ON command_history BEGIN SELECT RAISE(ABORT, 'synthetic audit failure'); END");
  const result=await send(db,'/api/command-queue','POST',fixture('Synthetic rollback',10));
  assert.equal(result.status,503);
  assert.deepEqual(result.body,{error:'Command queue storage unavailable'});
  assert.equal(db.native.prepare('SELECT count(*) AS n FROM command_tasks').get().n,0);
  const unavailable={async batch(){throw Error('synthetic private storage detail')}};
  for(const action of ['ready','finish']){
    unavailable.prepare=()=>({bind(){return this}});
    const response=await send(unavailable,'/api/command-queue/00000000-0000-0000-0000-000000000001/'+action,'POST',
      {version:1,reason:'Synthetic reason',status:'DONE',evidence:'Synthetic evidence'});
    assert.equal(response.status,503);
    assert.deepEqual(response.body,{error:'Command queue storage unavailable'});
  }
});

test('committed READY and finish survive failed promotion and explicit next recovers once',async()=>{
  for(const status of ['READY','DONE','BLOCKED','PARKED']){
    const db=sqliteDB();
    const a=await send(db,'/api/command-queue','POST',fixture('Synthetic A',20));
    const b=await send(db,'/api/command-queue','POST',fixture('Synthetic B',10));
    if(status!=='READY'){
      await send(db,'/api/command-queue/'+a.body.id+'/ready','POST',{version:1,reason:'Synthetic direction'});
      await send(db,'/api/command-queue/'+b.body.id+'/ready','POST',{version:1,reason:'Synthetic direction'});
    }
    db.native.exec("CREATE TRIGGER fail_promote BEFORE UPDATE ON command_tasks WHEN NEW.status='ACTIVE' BEGIN SELECT RAISE(ABORT,'synthetic promotion failure'); END");
    const action=status==='READY'?'ready':'finish';
    const result=await send(db,'/api/command-queue/'+a.body.id+'/'+action,'POST',
      {version:status==='READY'?1:3,status,reason:'Synthetic rationale',evidence:'Synthetic evidence'});
    assert.equal(result.status,202);
    assert.deepEqual(result.body,{transition:{id:a.body.id,status,committed:true},promotion_pending:true});
    assert.equal(db.native.prepare('SELECT status FROM command_tasks WHERE id=?').get(a.body.id).status,status);
    assert.equal(db.native.prepare('SELECT count(*) AS n FROM command_history WHERE task_id=? AND action=?').get(a.body.id,status).n,1);
    db.native.exec('DROP TRIGGER fail_promote');
    const snapshot=await send(db,'/api/command-queue');
    assert.equal(snapshot.body.active,null);assert.equal(snapshot.body.ready,1);
    const next=await send(db,'/api/command-queue/next','POST',{});
    assert.equal(next.status,200);assert.equal(next.body.active.id,status==='READY'?a.body.id:b.body.id);
    const count=db.native.prepare('SELECT count(*) AS n FROM command_history').get().n;
    await send(db,'/api/command-queue/next','POST',{});
    assert.equal(db.native.prepare('SELECT count(*) AS n FROM command_history').get().n,count);
  }
});

test('priority decisions retain initial, changed and unchanged rank with transition versions',async()=>{
  const db=sqliteDB();
  const a=await send(db,'/api/command-queue','POST',fixture('Synthetic audited rank',10));
  const id=a.body.id;
  const history=()=>db.native.prepare('SELECT id,action,previous_priority,resulting_priority,task_version FROM command_history WHERE task_id=? ORDER BY rowid').all(id);
  assert.deepEqual({...history()[0],id:undefined},{id:undefined,action:'CAPTURED',previous_priority:null,resulting_priority:10,task_version:1});
  assert.equal(db.native.prepare('SELECT last_transition FROM command_tasks WHERE id=?').get(id).last_transition,history()[0].id);
  const ready=await send(db,`/api/command-queue/${id}/ready`,'POST',{version:1,priority:90,reason:'Synthetic owner decision'});
  assert.equal(ready.status,200);
  assert.deepEqual(history().map(({action,previous_priority,resulting_priority,task_version})=>[action,previous_priority,resulting_priority,task_version]),[
    ['CAPTURED',null,10,1],['READY',10,90,2],['ACTIVE',90,90,3]
  ]);
  assert.equal(db.native.prepare('SELECT last_transition FROM command_tasks WHERE id=?').get(id).last_transition,history()[2].id);
  const count=history().length;
  assert.equal((await send(db,`/api/command-queue/${id}/ready`,'POST',{version:1,priority:5,reason:'Stale synthetic decision'})).status,409);
  assert.equal(history().length,count);
  assert.equal((await send(db,`/api/command-queue/${id}/finish`,'POST',{version:3,status:'BLOCKED',reason:'Synthetic blocker'})).status,200);
  // A stale request in an eligible status must also leave both state and audit untouched.
  assert.equal((await send(db,`/api/command-queue/${id}/ready`,'POST',{version:3,priority:5,reason:'Stale eligible decision'})).status,409);
  assert.equal(history().length,count+1);
  assert.equal((await send(db,`/api/command-queue/${id}/ready`,'POST',{version:4,reason:'Unchanged synthetic decision'})).status,200);
  assert.deepEqual(history().slice(3).map(({action,previous_priority,resulting_priority,task_version})=>[action,previous_priority,resulting_priority,task_version]),[
    ['BLOCKED',90,90,4],['READY',90,90,5],['ACTIVE',90,90,6]
  ]);
});

test('failed READY audit or guarded update leaves rank, version and history unchanged',async()=>{
  for(const failure of ['audit','update']){
    const db=sqliteDB();
    const a=await send(db,'/api/command-queue','POST',fixture('Synthetic atomic rank',10));
    const id=a.body.id;
    const before=db.native.prepare('SELECT * FROM command_tasks WHERE id=?').get(id);
    const events=db.native.prepare('SELECT * FROM command_history').all();
    db.native.exec(failure==='audit'
      ? "CREATE TRIGGER fail_ready BEFORE INSERT ON command_history WHEN NEW.action='READY' BEGIN SELECT RAISE(ABORT,'synthetic audit failure'); END"
      : "CREATE TRIGGER fail_ready BEFORE UPDATE ON command_tasks WHEN NEW.status='READY' BEGIN SELECT RAISE(ABORT,'synthetic update failure'); END");
    assert.equal((await send(db,`/api/command-queue/${id}/ready`,'POST',{version:1,priority:90,reason:'Synthetic rollback'})).status,503);
    assert.deepEqual(db.native.prepare('SELECT * FROM command_tasks WHERE id=?').get(id),before);
    assert.deepEqual(db.native.prepare('SELECT * FROM command_history').all(),events);
  }
});

test('additive audit migration preserves old history as unknown rather than inventing rank',()=>{
  const native=new DatabaseSync(':memory:');
  native.exec(readFileSync(new URL('../migrations/0006_command_queue.sql',import.meta.url),'utf8'));
  native.exec("INSERT INTO command_tasks(id,title,outcome,why_now,done_when,source_kind,source_status,assignee) VALUES ('legacy-task','Synthetic legacy','Result','Why','Done','owner','owner_decision','human')");
  native.exec("INSERT INTO command_history(id,task_id,action,reason) VALUES ('legacy','legacy-task','READY','Legacy synthetic decision')");
  native.exec(readFileSync(new URL('../migrations/0007_command_priority_audit.sql',import.meta.url),'utf8'));
  const row=native.prepare('SELECT * FROM command_history').get();
  assert.equal(row.reason,'Legacy synthetic decision');
  for(const key of ['previous_priority','resulting_priority','task_version'])assert.equal(row[key],null);
  native.close();
});


test('intake replay returns one task and one audit, including overlapping POSTs',async()=>{
  const db=sqliteDB(),payload=fixture('Synthetic replay',10);
  const a=await send(db,'/api/command-queue','POST',payload);
  const b=await send(db,'/api/command-queue','POST',payload);
  assert.equal(a.status,201); assert.equal(b.status,200);
  assert.equal(b.body.id,a.body.id);
  const results=await Promise.all(Array.from({length:6},()=>send(db,'/api/command-queue','POST',payload)));
  for(const result of results){assert.equal(result.status,200);assert.equal(result.body.id,a.body.id);}
  assert.equal(db.native.prepare('SELECT count(*) AS n FROM command_tasks').get().n,1);
  assert.equal(db.native.prepare('SELECT count(*) AS n FROM command_history').get().n,1);
  await send(db,'/api/command-queue/'+a.body.id+'/ready','POST',{version:1,reason:'Synthetic selection'});
  const replay=await send(db,'/api/command-queue','POST',payload);
  assert.equal(replay.body.id,a.body.id);assert.equal(replay.body.status,'ACTIVE');
  assert.equal(db.native.prepare('SELECT count(*) AS n FROM command_history').get().n,3);
});


test('intake identity scopes source and normalized payload without collapsing manual captures',async()=>{
 const db=sqliteDB(),payload=fixture('Synthetic scoped intake',10);
 const first=await send(db,'/api/command-queue','POST',payload);
 const normalized=await send(db,'/api/command-queue','POST',{...payload,title:'  '+payload.title+'  '});
 assert.equal(normalized.status,200);assert.equal(normalized.body.id,first.body.id);
 for(const delta of [{source_url:'https://github.com/example/demo/issues/2'},{title:'Different obligation'},{assignee:'agent:qa'},{source_kind:'external'}]){
  const result=await send(db,'/api/command-queue','POST',{...payload,...delta});
  assert.equal(result.status,201);assert.notEqual(result.body.id,first.body.id);
 }
 const manual={...payload,source_kind:'owner',source_url:''};
 const a=await send(db,'/api/command-queue','POST',manual),b=await send(db,'/api/command-queue','POST',manual);
 assert.equal(a.status,201);assert.equal(b.status,201);assert.notEqual(a.body.id,b.body.id);
});

test('failed intake audit rolls back receipt so a retry can create exactly once',async()=>{
 const db=sqliteDB(),payload=fixture('Synthetic receipt rollback',10);
 db.native.exec("CREATE TRIGGER fail_receipt_audit BEFORE INSERT ON command_history BEGIN SELECT RAISE(ABORT,'synthetic'); END");
 assert.equal((await send(db,'/api/command-queue','POST',payload)).status,503);
 assert.equal(db.native.prepare('SELECT count(*) AS n FROM command_intake_receipts').get().n,0);
 db.native.exec('DROP TRIGGER fail_receipt_audit');
 assert.equal((await send(db,'/api/command-queue','POST',payload)).status,201);
 assert.equal((await send(db,'/api/command-queue','POST',payload)).status,200);
 assert.equal(db.native.prepare('SELECT count(*) AS n FROM command_history').get().n,1);
});
