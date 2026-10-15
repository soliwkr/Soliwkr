// G2 read-only evidence briefing. Optional bounded LLM; no fabricated agent capabilities.
const HEADERS={'content-type':'application/json; charset=utf-8','cache-control':'no-store, private'};
export async function evidenceBrief(request,db,now=new Date(),ai=null){
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
 const unavailable_sources=sources.filter(x=>x.status!=='ok'||!Number.isFinite(Date.parse(x.checked_at))||now.getTime()-Date.parse(x.checked_at)>7200000).map(x=>({repo:x.source_key,status:x.status==='ok'?'stale':'unavailable'}));
 const lines=rows.map(x=>({text:x.summary,repo:x.source_key,occurred_at:x.occurred_at,observed_at:x.observed_at,url:x.source_url}));
 const answer=lines.length?`Nelle ultime 24 ore risultano ${lines.length} eventi GitHub verificabili nel registro (massimo 25 mostrati). ${status==='ok'?'Le sorgenti controllate risultano aggiornate.':'Alcune sorgenti sono assenti, non aggiornate o in errore: il riepilogo potrebbe essere incompleto.'}`:`Non risultano eventi GitHub verificabili nelle ultime 24 ore nel registro. ${status==='ok'?'Questo non dimostra che non ci sia stata attività fuori dalle sorgenti monitorate.':'Le sorgenti non sono tutte aggiornate: non posso concludere che non ci sia stata attività.'}`;
 const safeAnswer=unavailable_sources.length?answer+` Copertura incompleta: ${unavailable_sources.length} sorgenti non accessibili o non aggiornate (${unavailable_sources.map(x=>x.repo).join(', ')}).`:answer;
 let finalAnswer=safeAnswer,mode='deterministic_evidence_brief';
 let aiDiagnostic=ai?'not_attempted':'disabled',aiDurationMs=null;
 // Optional bounded Workers AI synthesis: source references remain server-owned.
 if(ai&&lines.length){
  const aiStarted=Date.now();
  try{
   const facts=lines.slice(0,12).map((x,i)=>({id:i+1,summary:x.text,repo:x.repo,occurred_at:x.occurred_at}));
   const output=await ai.run('@cf/meta/llama-3.1-8b-instruct-fast',{messages:[
    {role:'system',content:'Sei un selettore di evidenze, non un narratore. Restituisci SOLO JSON valido: {"ids":[numeri interi]} con ID presenti nei fatti. Ordina gli eventi più rilevanti per la domanda. Non produrre testo, spiegazioni o altri campi.'},
    {role:'user',content:JSON.stringify({question:body.question,facts})}
   ],temperature:0,max_tokens:220});
   aiDiagnostic='invalid_output';
   const candidate=typeof output?.response==='string'?output.response:typeof output?.result?.response==='string'?output.result.response:typeof output?.output_text==='string'?output.output_text:typeof output?.choices?.[0]?.message?.content==='string'?output.choices[0].message.content:null;
   if(!candidate&&output?.errors?.length)aiDiagnostic='provider_error_response';
   const raw=candidate?.trim()||'';
   let parsed=null;
   if(!candidate&&aiDiagnostic!=='provider_error_response')aiDiagnostic='missing_response_field';
   else if(!raw)aiDiagnostic='empty_response';
   else if(raw.length>600)aiDiagnostic='oversized_response';
   else {try{parsed=JSON.parse(raw);}catch{aiDiagnostic='invalid_json';}}
   const ids=parsed?.ids;
   if(parsed&&Object.keys(parsed).length===1&&Array.isArray(ids)&&ids.length>0&&ids.length<=facts.length&&ids.every(id=>Number.isInteger(id)&&id>=1&&id<=facts.length)&&new Set(ids).size===ids.length){
    const selected=ids.map(id=>lines[id-1]);
    const byRepo=new Map();
    for(const event of selected)byRepo.set(event.repo,(byRepo.get(event.repo)||0)+1);
    finalAnswer=`Nelle ultime 24 ore: ${selected.length} eventi selezionati e verificabili. `+[...byRepo].map(([repo,count])=>`${repo}: ${count} ${count===1?'evento':'eventi'}`).join('; ')+'. '+(unavailable_sources.length?`Copertura incompleta: ${unavailable_sources.length} sorgenti non accessibili o non aggiornate (${unavailable_sources.map(x=>x.repo).join(', ')}).`:'Le sorgenti controllate risultano aggiornate.')+' I collegamenti alle evidenze sono riportati sotto.';
    mode='ai_evidence_selection';
    aiDiagnostic='validated';
   }
  }catch{aiDiagnostic='inference_error';/* Fail closed to deterministic evidence brief. */}
  finally{aiDurationMs=Date.now()-aiStarted;}
 }
 const next_action=unavailable_sources.length?{status:'blocked',title:'Ripristinare la copertura delle fonti GitHub',reason:`${unavailable_sources.length} sorgenti non accessibili o non aggiornate impediscono un briefing completo.`,evidence:unavailable_sources.map(x=>x.repo),completion:'Tutte le sorgenti configurate risultano aggiornate e accessibili al prossimo controllo.'}:{status:'review',title:'Verificare gli eventi prima di assegnare lavoro',reason:'Il registro dimostra attività, non dimostra automaticamente priorità o task completati.',evidence:lines.map(x=>x.url),completion:'Decisione e responsabile registrati nella coda operativa canonica.'};
 return new Response(JSON.stringify({next_action,mode,ai_diagnostic:aiDiagnostic,ai_duration_ms:aiDurationMs,question:body.question,answer:finalAnswer,window:{from:start,to:end},source_status:status,unavailable_sources,events:lines}),{headers:HEADERS});
 }catch{return new Response(JSON.stringify({error:'Evidence ledger unavailable'}),{status:503,headers:HEADERS});}
}
