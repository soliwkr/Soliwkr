// One-task command surface in the existing Oggi. Never render a fabricated assignment.
const COMMAND_HTML = [
  '<section class="command-sheet" id="command-sheet" aria-labelledby="command-heading">',
  '<div class="command-kicker"><span class="command-led"></span> DIREZIONE / ESECUZIONE <span id="command-policy">WIP UMANO = 1</span></div>',
  '<div class="command-top"><div><h2 id="command-heading">Cosa fai adesso.</h2><p id="command-state" role="status">Verifico la coda privata…</p></div><button type="button" id="command-reload" class="command-reload">↻ Verifica</button></div>',
  '<div id="command-current" hidden>',
  '<div class="command-main" id="command-title"></div>',
  '<div class="command-meta"><span id="command-provenance"></span><span id="command-review"></span></div>',
  '<div class="command-reason"><strong>PERCHÉ ORA</strong><p id="command-why"></p></div>',
  '<div class="command-columns"><div><strong>RISULTATO ATTESO</strong><p id="command-outcome"></p></div><div><strong>DEFINIZIONE DI FATTO</strong><p id="command-done-when"></p></div></div>',
  '<div class="command-submit">',
  '<label for="command-evidence">Evidenza concreta per dichiarare concluso</label>',
  '<textarea id="command-evidence" rows="2" maxlength="1500" placeholder="Link, identificativo di prova o risultato verificabile. Non basta premere un pulsante."></textarea>',
  '<div class="command-actions"><button type="button" class="command-primary" id="command-done">Concludi con evidenza ↗</button><button type="button" id="command-block-toggle">Sono bloccato</button></div>',
  '<div id="command-block-panel" hidden><label for="command-block-reason">Perché sei bloccato o vuoi mettere in pausa?</label><textarea id="command-block-reason" rows="2" maxlength="700"></textarea><div class="command-actions"><button type="button" id="command-block-submit">Registra blocco → prossimo NEXT</button><button type="button" id="command-park-submit">Metti in pausa con motivo</button></div></div>',
  '</div></div>',
  '<button type="button" id="command-next" class="command-reload" hidden>Riprova prossimo NEXT</button>',
  '<p class="command-empty" id="command-empty" hidden>Nessuna assegnazione attiva. Non invento una priorità: la direzione deve approvare almeno un task READY. La cattura delle idee non ti assegna automaticamente altro lavoro.</p>',
  '<p class="command-failure" id="command-failure" hidden>Coda non verificabile: controllo migrazione D1, autenticazione o servizio. Nessun falso stato vuoto.</p>',
  '<div class="command-foot"><span id="command-count">In verifica</span><span>Un solo incarico umano. La delega agli agenti non è ancora attiva.</span></div>',
  '</section>'
].join('');
const COMMAND_CSS = [
  '.command-sheet{border:1px solid #34463a;background:linear-gradient(135deg,#15221b,#101914);border-radius:22px;padding:clamp(20px,3vw,37px);margin:15px 0 0}',
  '.command-kicker{color:var(--accent);font-size:10px;font-weight:850;letter-spacing:.12em;display:flex;align-items:center;gap:10px}',
  '.command-led{height:8px;width:8px;border-radius:100%;background:var(--accent)}',
  '#command-policy{margin-left:auto;color:#809585;letter-spacing:.04em}',
  '.command-top{display:flex;justify-content:space-between;gap:16px;align-items:center;margin-top:13px}',
  '.command-top h2{font-size:clamp(29px,4vw,48px);letter-spacing:-.05em;margin:0}',
  '#command-state{font-size:16px;margin:10px 0 0;color:#9caf9f}',
  '.command-reload{border:1px solid #344a3b;background:transparent;color:var(--accent);padding:9px 12px;border-radius:11px;white-space:nowrap}',
  '.command-main{margin-top:24px;font-size:clamp(23px,3vw,38px);line-height:1.18;letter-spacing:-.025em;font-weight:750;overflow-wrap:anywhere}',
  '.command-meta{margin:11px 0 22px;display:flex;gap:15px;flex-wrap:wrap;color:#849b89;font-size:11px}',
  '.command-meta a{color:var(--accent);text-decoration:underline}',
  '.command-reason,.command-columns>div{border-top:1px solid #314638;padding-top:15px}',
  '.command-reason strong,.command-columns strong{color:#83a391;font-size:10px;letter-spacing:.09em}',
  '.command-reason p,.command-columns p{font-size:16px;line-height:1.65;margin:7px 0 17px;white-space:pre-wrap;overflow-wrap:anywhere}',
  '.command-columns{display:grid;grid-template-columns:1fr 1fr;gap:20px}',
  '.command-submit{border-top:1px solid #314638;padding-top:17px}',
  '.command-submit label{font-size:11px;color:#adc7ae;display:block;margin-bottom:9px}',
  '.command-submit textarea{box-sizing:border-box;width:100%;background:#0f1912;border:1px solid #405346;color:#efffea;border-radius:10px;padding:12px;font:inherit;font-size:16px;resize:vertical}',
  '.command-actions{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:11px}',
  '.command-actions button{border:1px solid #536454;background:transparent;color:#d5e5d2;border-radius:10px;padding:11px 14px;font-size:12px;font-weight:750}',
  '.command-actions .command-primary{background:var(--accent);color:#17231b;border-color:var(--accent)}',
  '.command-actions button:disabled{opacity:.45;cursor:not-allowed}',
  '#command-block-panel{margin-top:20px}',
  '.command-empty,.command-failure{margin:20px 0;color:#b5c9b9;font-size:16px;line-height:1.7;max-width:730px}',
  '.command-failure{color:#e0b2a1}',
  '.command-foot{display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px;border-top:1px solid #314638;margin-top:24px;padding-top:13px;font-size:10px;color:#7c9481}',
  '#mission-control .home-hero{min-height:unset;padding-top:38px}',
  '@media(max-width:650px){.command-sheet{border-radius:16px;padding:18px}.command-columns{grid-template-columns:1fr;gap:3px}.command-top{align-items:flex-start}.command-reload{padding:7px}.command-actions button{width:100%}}'
].join('\n');
function installCommandQueue() {
  var root=document.getElementById('command-sheet');
  if(!root)return;
  var $=function(id){return document.getElementById(id)};
  var current=null,busy=false;
  var label=function(id,value){$(id).textContent=String(value||'')};
  function toggle(id,show){$(id).hidden=!show}
  function safeSource(src) {
    try{var u=new URL(src);return u.protocol==='https:'?u.href:null}catch{return null}
  }
  function render(data){
    current=data.active||null;
    toggle('command-current',!!current);
    toggle('command-empty',!current && !data.ready);
    toggle('command-next',!current && data.ready>0);
    toggle('command-failure',false);
    label('command-count',(data.ready||0)+' in attesa · '+(data.captured||0)+' catturati · '+(data.blocked||0)+' bloccati');
    if(!current){label('command-state',data.ready?'Task READY disponibili · riprova prossimo NEXT':'Nessun task attivo · direzione richiesta');return}
    label('command-state','Unico incarico umano · versione '+current.version);
    label('command-title',current.title);
    label('command-why',current.why_now);
    label('command-outcome',current.outcome);
    label('command-done-when',current.done_when);
    label('command-review',current.review_at?'Revisione: '+new Date(current.review_at).toLocaleDateString('it-IT'):'');
    var source=$('command-provenance');
    source.replaceChildren();
    source.append(document.createTextNode('Fonte: '+current.source_kind+' · '+current.source_status));
    var href=safeSource(current.source_url);
    if(href){var a=document.createElement('a');a.href=href;a.target='_blank';a.rel='noopener noreferrer';a.textContent=' Apri evidenza ↗';source.append(a)}
    $('command-evidence').value='';
    $('command-block-reason').value='';
    toggle('command-block-panel',false);
  }
  async function read(){
    var response=await fetch('/api/command-queue',{cache:'no-store'});
    if(!response.ok)throw Error('HTTP '+response.status);
    return response.json();
  }
  async function refresh(){
    if(busy)return;
    busy=true;$('command-reload').disabled=true;
    try{render(await read())}
    catch{current=null;toggle('command-current',false);toggle('command-empty',false);toggle('command-next',false);toggle('command-failure',true);label('command-state','Coda non verificabile');label('command-count','Servizio non verificabile')}
    finally{busy=false;$('command-reload').disabled=false}
  }
  async function post(url,payload){
    if(busy)return;
    busy=true;
    for(var id of ['command-next','command-reload','command-done','command-block-submit','command-park-submit'])$(id).disabled=true;
    try{
      var response=await fetch(url,{method:'POST',headers:{'content-type':'application/json','x-control-room':'1'},body:JSON.stringify(payload)});
      if(!response.ok){var error=await response.json().catch(function(){return {error:'Request rejected'}});throw Error(error.error||'Errore')}
      var data=await response.json();
      if(data.promotion_pending){
        try{render(await read())}catch{current=null;toggle('command-current',false);toggle('command-empty',false);toggle('command-failure',true);toggle('command-next',true)}
        label('command-state','Transizione '+data.transition.status+' registrata. Prossimo NEXT da verificare: riprova.');
      }else{render(data)}
    }catch(e){label('command-state','Esito da verificare: '+e.message+'. Ricarica per verificare.')}
    finally{busy=false;for(var id of ['command-next','command-reload','command-done','command-block-submit','command-park-submit'])$(id).disabled=false}
  }
  function finish(status) {
    if(!current)return;
    var evidence=$('command-evidence').value.trim(),reason=$('command-block-reason').value.trim();
    if(status==='DONE'&&!evidence){label('command-state','Servono prove concrete prima di dichiarare DONE');return}
    if(status!=='DONE'&&!reason){label('command-state','Descrivi il blocco o il motivo della pausa');return}
    post('/api/command-queue/'+encodeURIComponent(current.id)+'/finish',{version:current.version,status:status,evidence:evidence,reason:reason});
  }
  $('command-next').addEventListener('click',function(){post('/api/command-queue/next',{})});
  $('command-done').addEventListener('click',function(){finish('DONE')});
  $('command-block-toggle').addEventListener('click',function(){toggle('command-block-panel',$('command-block-panel').hidden)});
  $('command-block-submit').addEventListener('click',function(){finish('BLOCKED')});
  $('command-park-submit').addEventListener('click',function(){finish('PARKED')});
  $('command-reload').addEventListener('click',refresh);
  window.addEventListener('hashchange',function(){if(location.hash==='#oggi')refresh()});
  refresh();
}
export function injectCommandQueue(html) {
  const anchor='<div class="home-shell" id="mission-control">';
  if(!html.includes(anchor)||!html.includes('init();\n})();'))throw new Error('Oggi command anchors unavailable');
  html=html.replace(anchor,anchor+COMMAND_HTML);
  html=html.replace('</style>',COMMAND_CSS+'</style>');
  html=html.replace('init();\n})();','('+installCommandQueue.toString()+')();\ninit();\n})();');
  return html;
}
