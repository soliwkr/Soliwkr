// G3 queue: one active task, immutable evidence reference, no automatic completion.
const H={'content-type':'application/json; charset=utf-8','cache-control':'no-store, private'};
const respond=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:H});
export async function taskQueue(request,db){
 if(request.method==='GET'){
  const rows=await db.prepare("SELECT id,title,reason,evidence_url,owner,due_at,status,completion_proof,created_at,completed_at FROM task_queue ORDER BY CASE status WHEN 'active' THEN 0 ELSE 1 END, created_at DESC LIMIT 30").all();
  return respond({tasks:rows.results||[],active:(rows.results||[]).find(x=>x.status==='active')||null});
 }
 if(request.method!=='POST')return respond({error:'Method not allowed'},405);
 if(request.headers.get('origin')!==new URL(request.url).origin||request.headers.get('x-control-room')!=='1'||!request.headers.get('content-type')?.startsWith('application/json'))return respond({error:'Invalid origin'},403);
 const raw=await request.text();if(raw.length>2048)return respond({error:'Too large'},413);
 let x;try{x=JSON.parse(raw)}catch{return respond({error:'Invalid JSON'},400)}
 if(x.action==='complete'){
  if(!Number.isInteger(x.id)||typeof x.proof!=='string'||x.proof.trim().length<12||x.proof.length>700)return respond({error:'Completion proof required'},400);
  const result=await db.prepare("UPDATE task_queue SET status='done',completion_proof=?,completed_at=datetime('now') WHERE id=? AND status='active'").bind(x.proof.trim(),x.id).run();
  return result.meta?.changes?respond({completed:true}):respond({error:'Active task not found'},409);
 }
 if(x.action==='activate'){
  if(typeof x.title!=='string'||!x.title.trim()||x.title.length>180||typeof x.reason!=='string'||x.reason.length>500||typeof x.evidence_url!=='string'||!/^https:\/\/github\.com\//.test(x.evidence_url)||typeof x.owner!=='string'||!['user','soliwkr'].includes(x.owner)||typeof x.due_at!=='string'||!/^\d{4}-\d{2}-\d{2}T/.test(x.due_at)||!Number.isFinite(Date.parse(x.due_at)))return respond({error:'Invalid task'},400);
  const result=await db.prepare("INSERT OR IGNORE INTO task_queue(title,reason,evidence_url,owner,due_at,status,created_at) VALUES(?,?,?,?,?,'active',datetime('now'))").bind(x.title.trim(),x.reason,x.evidence_url,x.owner,x.due_at).run();
  return result.meta?.changes?respond({activated:true}):respond({error:'An active task already exists'},409);
 }
 return respond({error:'Unknown action'},400);
}
