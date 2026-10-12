// Private source ledger: source text comes from the existing user's D1 note.
const KINDS=new Set(['observation','decision','lesson','question']);
const DOMAINS=new Set(['general','studio','corpo','relazioni','fede','denaro','progetti','tempo']);
const HEADERS={'content-type':'application/json; charset=utf-8','cache-control':'no-store, private','x-content-type-options':'nosniff','referrer-policy':'no-referrer'};
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:HEADERS});
const str=(value,length)=>typeof value==='string'?value.trim().slice(0,length):'';
function mutationAllowed(request,url){
 return request.headers.get('origin')===url.origin
  &&request.headers.get('x-control-room')==='1'
  &&request.headers.get('content-type')?.startsWith('application/json');
}
async function getCards(db){
 const query='SELECT k.id,k.title,k.kind,k.domain,k.created_at,s.note_ref,s.raw_text,s.sha256 '
   +'FROM knowledge_cards k JOIN knowledge_sources s ON s.id=k.source_id '
   +'ORDER BY k.created_at DESC,k.id DESC LIMIT 100';
 return (await db.prepare(query).all()).results||[];
}
export async function readKnowledge(db){return getCards(db)}
export async function knowledgeRequest(request,env,url){
 const db=env.LIFE_DB,path=url.pathname,method=request.method;
 try{
  if(path==='/api/knowledge'&&method==='GET')return json({items:await getCards(db)});
  if(path==='/api/knowledge'&&method==='POST'){
   if(!mutationAllowed(request,url))return json({error:'Invalid origin'},403);
   const body=await request.text();if(body.length>3000)return json({error:'Too large'},413);
   let incoming;try{incoming=JSON.parse(body)}catch{return json({error:'Bad JSON'},400)}
   const noteId=str(incoming?.noteId,80),title=str(incoming?.title,140),
    kind=str(incoming?.kind,30),domain=str(incoming?.domain,30);
   if(!noteId||!title||!KINDS.has(kind)||!DOMAINS.has(domain))
     return json({error:'Invalid knowledge input'},400);
   const row=await db.prepare("SELECT payload FROM private_state WHERE id='main'").first();
   const current=row?JSON.parse(row.payload):{inbox:[]};
   const note=(Array.isArray(current.inbox)?current.inbox:[]).find(x=>x.id===noteId);
   if(!note||typeof note.text!=='string'||!note.text.trim())
     return json({error:'Original note missing'},404);
   const text=note.text;
   const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text))))
    .map(n=>n.toString(16).padStart(2,'0')).join('');
   const old=await db.prepare('SELECT id FROM knowledge_sources WHERE note_ref=?').bind(noteId).first();
   if(old)return json({error:'This note is already in the knowledge vault'},409);
   const sourceId=crypto.randomUUID(),id=crypto.randomUUID();
   try{
    await db.batch([
     db.prepare('INSERT INTO knowledge_sources(id,note_ref,raw_text,sha256) VALUES(?,?,?,?)')
      .bind(sourceId,noteId,text,hash),
     db.prepare('INSERT INTO knowledge_cards(id,source_id,title,kind,domain) VALUES(?,?,?,?,?)')
      .bind(id,sourceId,title,kind,domain)
    ]);
   }catch(e){return json({error:'Duplicate source or write failed'},409)}
   await db.prepare("INSERT INTO change_events (event_type) VALUES ('knowledge_approved')").run();
   return json({id,source_sha256:hash,status:'approved'},201);
  }
  if(path.startsWith('/api/knowledge/')&&method==='DELETE'){
   if(request.headers.get('origin')!==url.origin||request.headers.get('x-control-room')!=='1')
    return json({error:'Invalid origin'},403);
   const id=path.slice('/api/knowledge/'.length);
   if(!/^[0-9a-f-]{36}$/i.test(id))return json({error:'Invalid ID'},400);
   const target=await db.prepare('SELECT source_id FROM knowledge_cards WHERE id=?').bind(id).first();
   if(!target)return json({error:'Not found'},404);
   // Deliberate erasure by owner overrides immutability.
   await db.batch([
    db.prepare('DELETE FROM knowledge_cards WHERE id=?').bind(id),
    db.prepare('DELETE FROM knowledge_sources WHERE id=?').bind(target.source_id)
   ]);
   await db.prepare("INSERT INTO change_events (event_type) VALUES ('knowledge_erased')").run();
   return json({deleted:true});
  }
  return json({error:'Not found'},404);
 }catch(e){return json({error:'Knowledge storage unavailable'},503)}
}
