// Private owner-gated SOLIWKR command queue. No autonomous CEO or agent dispatch is claimed.
const H = {
  'content-type':'application/json; charset=utf-8',
  'cache-control':'no-store, private',
  'x-content-type-options':'nosniff',
  'referrer-policy':'no-referrer'
};
const STATUSES = ['CAPTURED','READY','ACTIVE','DONE','BLOCKED','PARKED','CANCELLED'];
function reply(value,status=200) { return new Response(JSON.stringify(value),{status,headers:H}); }
function validText(v,max) { return typeof v==='string' && v.trim().length>0 && v.trim().length<=max; }
function trim(v) { return typeof v==='string'?v.trim():''; }
function validUrl(value) {
  if(value==='')return true;
  try { const u=new URL(value);return u.protocol==='https:'&&u.username===''&&u.password===''&&value.length<=500; }
  catch { return false; }
}
function validAssignee(v) { return v==='human'||(typeof v==='string'&&/^agent:[a-z0-9-]{1,40}$/.test(v)); }
function validReview(v) { return v==='' || (typeof v==='string'&&v.length<=35&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/.test(v)&&Number.isFinite(Date.parse(v))); }
function changed(result) { return (result?.meta?.changes||0)>0; }
async function batchTransition(db,update,audit) {
  const results=await db.batch([update,audit]);
  return changed(results[0]);
}
async function readQueue(db) {
  const active=await db.prepare("SELECT id,title,outcome,why_now,done_when,source_kind,source_url,source_status,assignee,privacy_class,status,priority,review_at,version,created_at,updated_at FROM command_tasks WHERE assignee='human' AND status='ACTIVE' LIMIT 1").first();
  const summary=await db.prepare("SELECT SUM(CASE WHEN status='READY' AND assignee='human' THEN 1 ELSE 0 END) AS ready, SUM(CASE WHEN status='CAPTURED' THEN 1 ELSE 0 END) AS captured, SUM(CASE WHEN status='BLOCKED' THEN 1 ELSE 0 END) AS blocked FROM command_tasks").first();
  return {active:active||null,ready:Number(summary?.ready||0),captured:Number(summary?.captured||0),blocked:Number(summary?.blocked||0),policy:'human-wip-1',selection:'priority-desc-created-asc',agent_dispatch:'not_connected'};
}
export async function promoteNext(db) {
  const transition=crypto.randomUUID();
  try {
    await db.batch([
      db.prepare("UPDATE command_tasks SET status='ACTIVE', version=version+1, updated_at=datetime('now'), last_transition=? WHERE id=(SELECT id FROM command_tasks WHERE assignee='human' AND status='READY' ORDER BY priority DESC,created_at ASC,id ASC LIMIT 1) AND NOT EXISTS (SELECT 1 FROM command_tasks WHERE assignee='human' AND status='ACTIVE')").bind(transition),
      db.prepare("INSERT INTO command_history(id,task_id,action,reason,evidence) SELECT ?,id,'ACTIVE','Deterministic next READY task','' FROM command_tasks WHERE last_transition=?").bind(transition,transition)
    ]);
  } catch (error) {
    // A simultaneous claimant may have won. The partial UNIQUE index is authoritative.
    const current=await db.prepare("SELECT id FROM command_tasks WHERE assignee='human' AND status='ACTIVE' LIMIT 1").first();
    if(!current)throw error;
  }
  return readQueue(db);
}
async function capture(db,data) {
  if(!data||typeof data!=='object'||Array.isArray(data))return reply({error:'Invalid task'},400);
  const title=trim(data.title),outcome=trim(data.outcome),why=trim(data.why_now),done=trim(data.done_when);
  const assignee=data.assignee,kind=data.source_kind??'owner',source=trim(data.source_url??'');
  const sourceStatus=data.source_status??'needs_verification',privacy=data.privacy_class??'private';
  const review=trim(data.review_at??''),priority=data.priority??50;
  if(!validText(title,180)||!validText(outcome,600)||!validText(why,600)||!validText(done,600)||
    !validAssignee(assignee)||!['owner','github','system','external'].includes(kind)||
    !['verified','owner_decision','needs_verification'].includes(sourceStatus)||
    !['private','sensitive','public_meta'].includes(privacy)||!validUrl(source)||
    !Number.isInteger(priority)||priority<0||priority>100||!validReview(review))
    return reply({error:'Invalid task fields'},400);
  if(kind==='github'&&!source.startsWith('https://github.com/'))return reply({error:'GitHub provenance required'},400);
  const id=crypto.randomUUID(),event=crypto.randomUUID();
  await db.batch([
    db.prepare("INSERT INTO command_tasks (id,title,outcome,why_now,done_when,source_kind,source_url,source_status,assignee,privacy_class,priority,review_at,last_transition) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)").bind(id,title,outcome,why,done,kind,source,sourceStatus,assignee,privacy,priority,review,event),
    db.prepare("INSERT INTO command_history (id,task_id,action,reason) VALUES (?,?,'CAPTURED','Inbox: no automatic activation')").bind(event,id)
  ]);
  return reply({id,status:'CAPTURED',message:'Captured; direction decision required'},201);
}
async function ready(db,id,data) {
  if(!Number.isInteger(data?.version)||data.version<1||!validText(data?.reason,700))
    return reply({error:'Version and direction rationale required'},400);
  const priority=data.priority??null;
  if(priority!==null&&(!Number.isInteger(priority)||priority<0||priority>100))
    return reply({error:'Invalid priority'},400);
  const event=crypto.randomUUID();
  const ok=await batchTransition(db,
    db.prepare("UPDATE command_tasks SET status='READY',priority=COALESCE(?,priority),version=version+1,updated_at=datetime('now'),last_transition=? WHERE id=? AND version=? AND status IN ('CAPTURED','BLOCKED','PARKED')").bind(priority,event,id,data.version),
    db.prepare("INSERT INTO command_history(id,task_id,action,reason) SELECT ?,id,'READY',? FROM command_tasks WHERE last_transition=?").bind(event,trim(data.reason),event)
  );
  if(!ok)return reply({error:'Version conflict or transition disallowed'},409);
  const snapshot=await promoteNext(db);
  return reply(snapshot);
}
async function finish(db,id,data) {
  const status=data?.status;
  if(!Number.isInteger(data?.version)||data.version<1||!['DONE','BLOCKED','PARKED'].includes(status))
    return reply({error:'Invalid transition'},400);
  const evidence=trim(data.evidence),reason=trim(data.reason);
  if((status==='DONE'&&!validText(evidence,1500))||(status!=='DONE'&&!validText(reason,700))||
    evidence.length>1500||reason.length>700) return reply({error:'Evidence or blocker rationale required'},400);
  const event=crypto.randomUUID();
  const ok=await batchTransition(db,
    db.prepare("UPDATE command_tasks SET status=?,version=version+1,updated_at=datetime('now'),last_transition=? WHERE id=? AND version=? AND status='ACTIVE' AND assignee='human'").bind(status,event,id,data.version),
    db.prepare("INSERT INTO command_history(id,task_id,action,reason,evidence) SELECT ?,id,?,?,? FROM command_tasks WHERE last_transition=?").bind(event,status,reason,evidence,event)
  );
  if(!ok)return reply({error:'Version conflict or task not ACTIVE'},409);
  return reply(await promoteNext(db));
}
export async function commandQueueRequest(request,db,url) {
  try {
    if(request.method==='GET'&&url.pathname==='/api/command-queue')return reply(await readQueue(db));
    if(request.method!=='POST')return reply({error:'Method not allowed'},405);
    if(request.headers.get('origin')!==url.origin||
       request.headers.get('x-control-room')!=='1'||
       !request.headers.get('content-type')?.startsWith('application/json'))
      return reply({error:'Invalid origin'},403);
    const raw=await request.text();
    if(raw.length>6500)return reply({error:'Too large'},413);
    let data;
    try { data=JSON.parse(raw); }catch { return reply({error:'Invalid JSON'},400); }
    if(url.pathname==='/api/command-queue')return await capture(db,data);
    if(url.pathname==='/api/command-queue/next')return reply(await promoteNext(db));
    const path=/^\/api\/command-queue\/([0-9a-f-]{36})\/(ready|finish)$/.exec(url.pathname);
    if(!path)return reply({error:'Not found'},404);
    if(path[2]==='ready')return await ready(db,path[1],data);
    return await finish(db,path[1],data);
  } catch {
    // Missing migration and infrastructure failures are not disguised as an empty queue.
    return reply({error:'Command queue storage unavailable'},503);
  }
}
