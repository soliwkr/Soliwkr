// G2 read-only evidence briefing. No LLM, no fabricated agent capabilities.
const HEADERS={'content-type':'application/json; charset=utf-8','cache-control':'no-store, private'};
export async function evidenceBrief(request,db,now=new Date()){
 if(request.method!=='POST')return new Response(JSON.stringify({error:'Method not allowed'}),{status:405,headers:HEADERS});
 if(request.headers.get('origin')!==new URL(request.url).origin || request.headers.get('x-control-room')!=='1' || !request.headers.get('content-type')?.startsWith('application/json'))return new Response(JSON.stringify({error:'Invalid origin'}),{status:403,headers:HEADERS});
 let body;try{if(Number(request.headers.get('content-length'))>2048)return new Response(JSON.stringify({error:'Too large'}),{status:413,headers:HEADERS});body=await request.text();if(body.length>2048)throw Error();body=JSON.parse(body);}catch{return new Response(JSON.stringify({error:'Invalid JSON'}),{status:400,headers:HEADERS});}
 if(typeof body?.question!=='string'||body.question.length>500||!body.question.trim())return new Response(JSON.stringify({error:'Question required'}),{status:400,headers:HEADERS});
 const end=now.toISOString(),start=new Date(now.getTime()-86400000).toISOString();
 try{
 const [events,checks]=await Promise.all([
 db.prepare('SELECT provider,event_id,source_key,event_type,summary,occurred_at,observed_at,source_url FROM source_events WHERE provider=? AND occurred_at>=? AND occurred_at<=? ORDER BY occurred_at DESC,event_id DESC LIMIT 25').bind('github',start,end).all(),
 db.prepare('SELECT source_key,checked_at,status FROM source_checks WHERE provider=? ORDER BY checked_at DESC LIMIT 30').bind('github').all()
 ]);
 const rows=(events.results||[]).filter(x=>x.source_url?.startsWith('https://github.com/')&&Number.isFinite(Date.parse(x.occurred_at))&&Number.isFinite(Date.parse(x.observed_at)));
 const sources=checks.results||[];
 const status=sources.length===0?'unknown':sources.some(x=>x.status!=='ok'||!Number.isFinite(Date.parse(x.checked_at))||now.getTime()-Date.parse(x.checked_at)>7200000)?'partial':'ok';
 const lines=rows.map(x=>({text:x.summary,repo:x.source_key,occurred_at:x.occurred_at,observed_at:x.observed_at,url:x.source_url}));
 const answer=lines.length?`Nelle ultime 24 ore risultano ${lines.length} eventi GitHub verificabili nel registro (massimo 25 mostrati). ${status==='ok'?'Le sorgenti controllate risultano aggiornate.':'Alcune sorgenti sono assenti, non aggiornate o in errore: il riepilogo potrebbe essere incompleto.'}`:`Non risultano eventi GitHub verificabili nelle ultime 24 ore nel registro. ${status==='ok'?'Questo non dimostra che non ci sia stata attività fuori dalle sorgenti monitorate.':'Le sorgenti non sono tutte aggiornate: non posso concludere che non ci sia stata attività.'}`;
 return new Response(JSON.stringify({mode:'deterministic_evidence_brief',question:body.question,answer,window:{from:start,to:end},source_status:status,events:lines}),{headers:HEADERS});
 }catch{return new Response(JSON.stringify({error:'Evidence ledger unavailable'}),{status:503,headers:HEADERS});}
}
