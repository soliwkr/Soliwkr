// Minimal, consent-based memory UI: promote an existing note, never infer a private fact.
const SECTION=[
'<section class="card" id="knowledge-room" style="margin-top:20px">',
'<div class="card-head"><div><div class="eyebrow" style="color:var(--violet)">SORGENTI → MEMORIA</div><h2 class="secondary-head" style="margin:8px 0 0">Consolida ciò che conta.</h2></div><span class="chip" id="knowledge-count">0 memorie</span></div>',
'<p class="sub">Una nota è materiale grezzo. Solo tu puoi decidere cosa diventa una conoscenza e a quale area collegarla. L’originale resta conservato.</p>',
'<form id="knowledge-form" class="knowledge-form">',
'<label class="form-label" for="knowledge-note">SCEGLI LA NOTA ORIGINALE</label><select id="knowledge-note" class="select" required><option value="">Apri la tua inbox...</option></select>',
'<label class="form-label" for="knowledge-title">TITOLO CHE VUOI RICORDARE</label><input id="knowledge-title" class="field" maxlength="140" required placeholder="Una decisione, un apprendimento, una domanda...">',
'<div class="knowledge-row"><div><label class="form-label" for="knowledge-kind">TIPO</label><select id="knowledge-kind" class="select"><option value="observation">Osservazione</option><option value="decision">Decisione</option><option value="lesson">Lezione</option><option value="question">Domanda</option></select></div>',
'<div><label class="form-label" for="knowledge-domain">COLLEGA A</label><select id="knowledge-domain" class="select"><option value="general">Cervello</option><option value="studio">Studio</option><option value="corpo">Corpo</option><option value="relazioni">Relazioni</option><option value="fede">Fede</option><option value="denaro">Denaro</option><option value="progetti">Creazione</option><option value="tempo">Tempo</option></select></div></div>',
'<div class="knowledge-row"><button class="button lime" type="submit" id="knowledge-submit">Consolida nell’Atlante ✳</button><button type="button" class="button soft" id="knowledge-refresh">Aggiorna note ↻</button></div></form>',
'<div class="sectionrow"><h3>Memorie approvate da te</h3><button class="ghostlink" data-go="grafo">Apri il grafo →</button></div>',
'<div id="knowledge-list" class="knowledge-list"><div class="empty">Ancora nessuna conoscenza approvata.</div></div>',
'<p class="caption" style="margin-top:12px">Provenienza: nota originale D1, hash SHA-256, data e collegamento scelto da te. Puoi cancellare definitivamente una memoria. Nessun LLM interpreta le tue note.</p>',
'</section>'
].join('');
const css=[
'.knowledge-form{margin:19px 0 27px;border:1px solid #435449;border-radius:15px;padding:18px;background:#16231b}',
'.knowledge-form .select{width:100%}.knowledge-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}.knowledge-row .button{margin-top:17px}',
'.knowledge-list{display:grid;gap:9px}.knowledge-record{display:flex;justify-content:space-between;align-items:flex-start;gap:13px;padding:15px;border:1px solid #35483a;border-radius:13px;background:#111c16}',
'.knowledge-record strong{font-size:14px;display:block;overflow-wrap:anywhere}.knowledge-record small{display:block;color:#9bb09b;font-size:11px;margin:5px 0 8px}.knowledge-record p{font-size:12px;color:#aec1b2;margin:0;white-space:pre-wrap;overflow-wrap:anywhere;max-width:600px}',
'.knowledge-record .knowledge-actions{display:flex;gap:4px;flex-shrink:0}.knowledge-record button{padding:8px;border:1px solid #364d3d;border-radius:9px;background:#263628;color:#d2e8ca}.knowledge-record button:hover{border-color:var(--accent)}',
'@media(max-width:650px){.knowledge-row{grid-template-columns:1fr}.knowledge-record{flex-direction:column}.knowledge-record .knowledge-actions{align-self:flex-end}}'
].join('\n');
function initMemory(){
 let items=[],stateNotes=[];
 const notes=q('knowledge-note'),title=q('knowledge-title'),cards=q('knowledge-list');
 function mk(tag,cls,text){var el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el}
 function changed(){window.dispatchEvent(new Event('lifeos:knowledge-changed'))}
 async function refresh(){
  try{
   var responses=await Promise.all([fetch('/api/state',{cache:'no-store'}),fetch('/api/knowledge',{cache:'no-store'})]);
   if(!responses.every(r=>r.ok))throw Error('Non disponibile');
   var st=await responses[0].json(),kn=await responses[1].json();
   stateNotes=Array.isArray(st.state?.inbox)?st.state.inbox:[];
   items=Array.isArray(kn.items)?kn.items:[];
   var old=notes.value,known=new Set(items.map(x=>x.note_ref));
   notes.replaceChildren(mk('option','',stateNotes.length?'Seleziona una nota...':'Prima cattura una nota nel Cervello.'));
   notes.firstChild.value='';
   stateNotes.forEach(function(n){if(known.has(n.id))return;var op=mk('option','',String(n.text).slice(0,110));op.value=n.id;notes.append(op)});
   if(stateNotes.some(n=>n.id===old&&!known.has(n.id)))notes.value=old;
   draw();
  }catch(e){cards.replaceChildren(mk('div','empty','Non riesco a leggere la memoria adesso.'));q('knowledge-count').textContent='Scollegato'}
 }
 function draw(){
  q('knowledge-count').textContent=items.length+' '+(items.length===1?'memoria':'memorie');
  cards.replaceChildren();
  if(!items.length){cards.append(mk('div','empty','Per ora nessuna memoria approvata. Le tue note originali restano nella inbox.'));return}
  items.forEach(function(n){
   var row=mk('div','knowledge-record'),content=mk('div'),name=mk('strong','',n.title),meta=mk('small','',n.kind+' · '+n.domain+' · '+n.created_at),excerpt=mk('p','',String(n.raw_text||'').slice(0,230)),actions=mk('div','knowledge-actions');
   content.append(name,meta,excerpt);
   var go=mk('button','','↗');go.type='button';go.title='Porta questa scelta in Oggi';go.setAttribute('aria-label','Porta in Oggi: '+n.title);go.onclick=function(){window.dispatchEvent(new CustomEvent('lifeos:add-task',{detail:{title:n.title}}))};
   var erase=mk('button','','×');erase.type='button';erase.title='Elimina definitivamente memoria e copia originale';erase.setAttribute('aria-label','Elimina definitivamente memoria '+n.title);
   erase.onclick=async function(){if(!confirm('Eliminare definitivamente la memoria e il suo originale conservato? La nota nella inbox resterà, ma il ricordo consolidato sparirà.'))return;
    try{var r=await fetch('/api/knowledge/'+encodeURIComponent(n.id),{method:'DELETE',headers:{'x-control-room':'1'}});if(!r.ok)throw Error('Eliminazione non riuscita');toast('Memoria eliminata');await refresh();changed()}catch(e){toast(e.message)}};
   actions.append(go,erase);row.append(content,actions);cards.append(row);
  });
 }
 q('knowledge-note').addEventListener('change',function(){
  var n=stateNotes.find(x=>x.id===notes.value);
  if(n)title.value=String(n.text).split('\n')[0].slice(0,100).trim()||'Nota importante';
 });
 q('knowledge-form').addEventListener('submit',async function(event){
  event.preventDefault();if(!notes.value){toast('Scegli prima una nota originale');return}
  var b=q('knowledge-submit');b.disabled=true;b.textContent='Registro la fonte...';
  try{
   var r=await fetch('/api/knowledge',{method:'POST',headers:{'content-type':'application/json','x-control-room':'1'},
    body:JSON.stringify({noteId:notes.value,title:title.value,kind:q('knowledge-kind').value,domain:q('knowledge-domain').value})});
   var v=await r.json();if(!r.ok)throw Error(v.error||'Errore');
   title.value='';toast('Memoria approvata e collegata all’Atlante ✳');await refresh();changed();
  }catch(e){toast(e.message)}finally{b.disabled=false;b.textContent='Consolida nell’Atlante ✳'}
 });
 q('knowledge-refresh').addEventListener('click',refresh);
 window.addEventListener('hashchange',function(){if(location.hash==='#mente')setTimeout(refresh,220)});
 var input=document.getElementById('inbox-form');if(input)input.addEventListener('submit',function(){setTimeout(refresh,1200)});
 // The existing Life OS JS keeps the latest goals state and handles the 3-item rule.
 refresh();
}
export function injectMemory(html){
 if(!html.includes('<section class="view" id="view-mente"')||!html.includes('init();\n})();'))throw Error('Unsupported app layout');
 html=html.replace('<section class="view" id="view-rituali"', '<section class="view" id="view-rituali"');
 const anchor='<section class="view" id="view-grafo"';
 if(html.includes(anchor)){
  const brainEnd='</section>\n'+anchor;
  if(!html.includes(brainEnd))throw Error('Cannot find brain section end');
  html=html.replace(brainEnd,SECTION+'</section>\n'+anchor);
 }else throw Error('Atlas view missing');
 html=html.replace('</style>',css+'</style>');
 html=html.replace('init();\n})();',
  "window.addEventListener('lifeos:add-task',function(event){if(!ready)return;addTask(event.detail?.title||'');route('oggi')});\n"+
  '('+initMemory.toString()+')();\ninit();\n})();');
 return html;
}
