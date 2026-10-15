// One *existing* Life OS cockpit: automatic source summary, no new datastore,
// no fabricated connected services, manual planning remains optional.
const COCKPIT = [
  '<div class="mc-shell" id="mission-control">',
  '<div class="mc-head"><div><div class="eyebrow">MISSION CONTROL · SOLIWKR · <span id="date">—</span></div><h2><span id="greeting">Bentornato.</span> <span>Il quadro completo.</span></h2><p>Fatti dalle fonti disponibili, memoria personale e capacità operative. Nessun dato richiesto per iniziare.</p></div><button class="mc-refresh" id="mc-refresh" type="button" aria-label="Aggiorna stato delle fonti">↻ Aggiorna</button></div>',
  '<div class="mc-ribbon" aria-live="polite"><span class="mc-lamp" id="mc-lamp"></span><b id="mc-readiness">Verifico le fonti…</b><span class="mc-stamp" id="mc-stamp">Nessuna verifica completata</span><span class="mc-legend">Sconosciuto ≠ zero · Attività ≠ risultato</span></div>',
  '<div class="mc-layout">',
  '<article class="mc-card mc-source"><div class="mc-card-title"><div><small>01 / INFRASTRUTTURA</small><h3>Il sistema</h3></div><span class="mc-mark">◈</span></div>',
  '<div class="mc-stack"><div class="mc-line"><span>Life OS · Worker</span><b id="mc-worker">In verifica</b></div><div class="mc-line"><span>Archivio personale · D1</span><b id="mc-d1">In verifica</b></div><div class="mc-line"><span>Fonti GitHub</span><b id="mc-github">In verifica</b></div><div class="mc-line"><span>Eventi automatici</span><b class="mc-unlinked" id="mc-events-status">Non verificati</b></div></div>',
  '<div class="mc-end"><span>Ultimo segnale: <span id="mc-source-time">non verificato</span></span><button data-go="sistemi" class="mc-go">Connessioni ↗</button></div></article>',
  '<article class="mc-card mc-agents"><div class="mc-card-title"><div><small>02 / AGENTI</small><h3>SOLIWKR & capacità</h3></div><span class="mc-mark">✳</span></div>',
  '<div class="mc-stack"><div class="mc-line"><span>SOLIWKR · Cloudflare Think</span><b class="mc-unlinked">Da attivare</b></div><div class="mc-line"><span>Hermes · VPS</span><b class="mc-unknown">Non verificato</b></div><div class="mc-line"><span>Hermes · laptop</span><b class="mc-neutral">Opzionale</b></div><div class="mc-line"><span>Telegram · SOLIWKR</span><b class="mc-unlinked">Non collegato</b></div></div>',
  '<div class="mc-stack"><button type="button" class="mc-refresh" id="soliwkr-brief">Cosa è successo nelle ultime 24 ore?</button><div id="soliwkr-brief-result" role="status" aria-live="polite"></div></div>',
  '<div class="mc-end"><span>Nessun agente riceve dati privati automaticamente</span><a href="https://github.com/soliwkr/Soliwkr/issues/16" rel="noopener noreferrer" target="_blank" class="mc-go">Piano SOLIWKR ↗</a></div></article>',
  '<article class="mc-card mc-brain"><div class="mc-card-title"><div><small>03 / MEMORIA</small><h3>Il Cervello</h3></div><span class="mc-mark">◇</span></div>',
  '<p class="mc-number" id="mc-knowledge">—</p><p class="mc-number-label">conoscenze approvate</p>',
  '<div class="mc-stack"><div class="mc-line"><span>Note originali</span><b id="mc-notes">In verifica</b></div><div class="mc-line"><span>Sincronizzazione Obsidian</span><b class="mc-unlinked">Solo export</b></div></div>',
  '<div class="mc-end"><span>Memorie dichiarate, non interpretazioni AI</span><button data-go="mente" class="mc-go">Cervello ↗</button></div></article>',
  '<article class="mc-card mc-portfolio"><div class="mc-card-title"><div><small>04 / STUDIO</small><h3>Portfolio osservabile</h3></div><span class="mc-mark">↗</span></div>',
  '<p class="mc-note">Ultima attività dei repository pubblici collegati. Non misura clienti, ricavi o successo commerciale.</p>',
  '<div class="mc-events" id="mc-events"><span>Ultimo evento: in verifica</span></div><div class="mc-projects" id="mc-projects"><div class="mc-row"><span>Verifico GitHub…</span></div></div>',
  '<div class="mc-end"><span id="mc-project-time">Fonte: GitHub · attendo</span><button data-go="studio" class="mc-go">Tutti i progetti ↗</button></div></article>',
  '<article class="mc-card mc-next"><div class="mc-card-title"><div><small>05 / PROSSIMO GATE</small><h3>Da stabilizzare</h3></div><span class="mc-mark">◎</span></div>',
  '<div class="mc-gate"><b>Identità → Release → Eventi → SOLIWKR</b><p>Verifica JWT e backup prima di autorizzare agenti e fonti private. Poi ingestion automatica e briefing.</p></div>',
  '<div class="mc-end"><span>Implementazione e rilascio sono stati diversi</span><a class="mc-go" href="https://github.com/soliwkr/Soliwkr/issues/14" target="_blank" rel="noopener noreferrer">Gate G0 ↗</a></div></article>',
  '<article class="mc-card mc-map"><div class="mc-card-title"><div><small>06 / ATLANTE</small><h3>Tutto è collegabile.</h3></div><span class="mc-mark">◎</span></div><p class="mc-map-copy">Esplora le relazioni strutturali e quelle dichiarate. Le ipotesi non sono verità.</p><div class="mc-map-visual" aria-hidden="true"><span>✳</span><i></i><span>◈</span><i></i><span>◇</span></div><div class="mc-end"><span>Source-aware · Obsidian export</span><button data-go="grafo" class="mc-go">Apri Atlante ↗</button></div></article>',
  '</div>',
  '<div class="mc-privacy"><span>🔒 Schermata privata</span><span>SOLIWKR non ancora attivo · VPS non ancora verificata · Nessun evento inventato.</span></div>',
  '</div>'
].join('');

const MC_STYLE = `
#mission-control{margin:0 0 26px}
.mc-head{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:17px}
.mc-head h2{font-size:clamp(27px,3.8vw,44px);line-height:1.1;letter-spacing:-.046em;margin:7px 0;font-weight:790}
.mc-head h2 span{color:var(--accent)}
.mc-head p{font-size:12px;color:var(--muted);margin:0}
.mc-refresh{flex-shrink:0;border:1px solid #465b49;background:#25372a;color:var(--accent);padding:10px 14px;border-radius:12px;font-size:12px;font-weight:750}
.mc-ribbon{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:11px 15px;margin-bottom:13px;background:#17251c;border:1px solid #324636;border-radius:12px;font-size:11px}
.mc-ribbon b{color:#e7f4e5}.mc-ribbon .mc-stamp,.mc-ribbon .mc-legend{color:var(--muted)}.mc-legend{margin-left:auto}
.mc-lamp{height:8px;width:8px;border-radius:50%;background:#a8b9aa;flex-shrink:0}
.mc-lamp.good{background:var(--accent)}
.mc-layout{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.mc-card{min-width:0;min-height:204px;border:1px solid #334238;border-radius:17px;padding:18px;background:linear-gradient(160deg,#1a2520,#131b17);display:flex;flex-direction:column;gap:12px}
.mc-agents{background:radial-gradient(ellipse at 100% 0,#46385646,transparent 55%),#181d1c}
.mc-brain{background:radial-gradient(ellipse at 100% 0,#37305546,transparent 55%),#181b20}
.mc-map{background:linear-gradient(145deg,#213624,#151e18)}
.mc-card-title{display:flex;justify-content:space-between;align-items:start;gap:12px}
.mc-card-title small{color:#9cb69e;letter-spacing:.13em;font-size:9px;font-weight:850}
.mc-card-title h3{font-size:20px;margin:5px 0 0;line-height:1.1;letter-spacing:-.03em}
.mc-mark{display:grid;place-items:center;width:35px;height:35px;background:#2e4632;border:1px solid #4c674c;border-radius:11px;font-size:19px;color:var(--accent)}
.mc-stack{display:grid;gap:7px}
.mc-line{display:flex;align-items:center;justify-content:space-between;gap:6px;border-bottom:1px solid #3440388f;padding:4px 0;font-size:11px;color:#bccbbf}
.mc-line b{font-size:10px;font-weight:730;color:var(--accent);text-align:right}
.mc-line b.mc-unlinked{color:#c8b8a4}.mc-line b.mc-unknown{color:#ddbe9b}.mc-line b.mc-neutral{color:#a5bed7}
.mc-end{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:auto;font-size:10px;color:#8fa293;line-height:1.4}
.mc-end > span{max-width:60%}
.mc-go{font-size:11px;color:var(--accent);font-weight:790;text-decoration:none;border:0;background:transparent;white-space:nowrap;padding:7px 1px}
.mc-number{font-size:43px;font-weight:790;letter-spacing:-.06em;line-height:1;margin:2px 0 0;color:var(--violet)}
.mc-number-label{font-size:11px;color:#b3a7ce;margin:-7px 0 4px}
.mc-note{font-size:11px;color:#9bad9e;margin:0}
.mc-events{background:#202b24;border:1px solid #334637;border-radius:9px;padding:9px;font-size:10px;color:#bdcabe}.mc-events a{color:var(--accent);text-decoration:none}.mc-projects{display:grid;gap:1px;max-height:115px;overflow-y:auto}
.mc-row{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:5px 0;border-bottom:1px solid #33443870;color:#ced8cc;font-size:11px;text-decoration:none}
.mc-row em{font-style:normal;color:#93a795;font-size:10px}
.mc-row:hover{color:var(--accent)}
.mc-gate{padding:12px 13px;background:#213123;border:1px solid #3c4b3e;border-radius:12px}
.mc-gate b{font-size:13px}.mc-gate p{font-size:11px;color:#a3b7a6;margin:6px 0 0}
.mc-map-copy{color:#b6c6b8;font-size:11px;margin:0}
.mc-map-visual{display:flex;align-items:center;justify-content:center;gap:5px;color:#c7f778;font-size:27px;margin:2px 0}
.mc-map-visual span{background:#293e2b;border:1px solid #4c664d;border-radius:50%;width:42px;height:42px;display:grid;place-items:center}
.mc-map-visual span:last-child{color:var(--violet)}
.mc-map-visual i{width:31px;height:1px;background:#60765d;transform:rotate(-14deg)}
.mc-privacy{display:flex;justify-content:space-between;gap:12px;padding:10px 2px;color:#829789;font-size:10px}
.manual-archive{margin:22px 0 12px;border:1px solid #324337;border-radius:15px;background:#151f18;overflow:hidden}
.manual-archive>summary{padding:18px 22px;cursor:pointer;font-size:13px;font-weight:760;color:#dcebd8}
.manual-archive>summary small{font-size:11px;color:#8fa795;margin-left:11px;font-weight:450}
.manual-archive[open]>.grid{padding:8px 15px 19px}
@media(max-width:1150px){.mc-layout{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:720px){.mc-layout{grid-template-columns:1fr}.mc-card{min-height:175px}.mc-head{align-items:flex-start}.mc-head h2{font-size:30px}.mc-legend{width:100%;margin-left:0}.mc-privacy{flex-direction:column}.manual-archive>summary small{display:block;margin-left:0}}
@media(prefers-reduced-motion:reduce){.mc-card,.mc-refresh{transition:none!important}}
`;

function installMissionControl() {
  var root=document.getElementById('mission-control');
  if(!root)return;
  var $=function(id){return document.getElementById(id)};
  var busy=false;
  var date=function(value){
    if(!value)return 'Non verificato';
    var d=new Date(value);
    return Number.isFinite(d.getTime())?new Intl.DateTimeFormat('it-IT',{timeZone:'Europe/Rome',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}).format(d):'Non verificato';
  };
  var text=function(id,value){var e=$(id);if(e)e.textContent=value};
  async function read(url){
    var response=await fetch(url,{cache:'no-store'});
    if(!response.ok)throw new Error('HTTP '+response.status);
    return response.json();
  }
  function item(tag,cls,value){
    var e=document.createElement(tag);
    if(cls)e.className=cls;
    if(value!==undefined)e.textContent=value;
    return e;
  }
  async function refreshMissionControl(){
    if(busy)return;busy=true;text('mc-readiness','Aggiorno le fonti…');
    $('mc-refresh').disabled=true;
    var results=await Promise.allSettled([read('/api/health'),read('/api/state'),read('/api/knowledge'),read('/api/projects'),read('/api/observations')]);
    var good=0;
    var health=results[0];
    if(health.status==='fulfilled'){
      good++;
      text('mc-worker','Risponde');
      text('mc-d1',health.value.storage?'Binding presente':'Non disponibile');
    }else{ text('mc-worker','Non verificato');text('mc-d1','Non verificato');}
    if(results[1].status==='fulfilled'){
      good++;
      text('mc-notes',String((results[1].value.state?.inbox||[]).length)+' note');
      text('mc-d1','Lettura riuscita');
    }else{text('mc-notes','Non verificato');}
    if(results[2].status==='fulfilled'){
      good++;
      var k=results[2].value.items;
      text('mc-knowledge',Array.isArray(k)?String(k.length):'—');
    }else{text('mc-knowledge','—');}
    var host=$('mc-projects');
    host.replaceChildren();
    if(results[3].status==='fulfilled'){
      var projects=results[3].value.projects;
      if(Array.isArray(projects)){
        good++;
        var actual=projects.filter(function(p){return typeof p.pushed_at==='string'&&Number.isFinite(new Date(p.pushed_at).getTime())});
        text('mc-github',actual.length+' fonti di attività');
        actual.sort(function(a,b){return new Date(b.pushed_at)-new Date(a.pushed_at)});
        actual.slice(0,5).forEach(function(p){
          var link=item('a','mc-row');var source;
          try{source=new URL(p.url);}catch{return}
          if(source.protocol!=='https:'||source.hostname!=='github.com')return;
          link.href=source.href;link.target='_blank';link.rel='noopener noreferrer';
          link.append(item('span','',String(p.label||'Repository').slice(0,45)),item('em','',date(p.pushed_at)));
          host.append(link);
        });
        if(!host.children.length)host.append(item('div','mc-row','Attività pubblica non verificata'));
        text('mc-project-time','Metadati GitHub · '+actual.length+' su '+projects.length);
      }
    }
    if(results[3].status!=='fulfilled'){host.append(item('div','mc-row','Fonte GitHub non verificata'));text('mc-github','Non verificato');text('mc-project-time','Fonte: non disponibile');}
    var ehost=$('mc-events');
    ehost.replaceChildren();
    if(results[4].status==='fulfilled'){
      var ledger=results[4].value,checks=Array.isArray(ledger.sources)?ledger.sources:[],list=Array.isArray(ledger.events)?ledger.events:[];
      var ok=checks.filter(function(x){return x.status==='ok'}).length;
      if(ok)good++;
      text('mc-events-status',ok?ok+' sorgenti aggiornate':checks.length?'Fonti non disponibili':'In attesa del primo ciclo');
      if(list.length){
        var last=list[0],source;
        try{source=new URL(last.source_url);}catch(e){source=null}
        var label=String(last.summary||'Evento tecnico').slice(0,110)+' · '+date(last.occurred_at);
        if(source&&source.protocol==='https:'&&source.hostname==='github.com'){
          var a=item('a','',label+' ↗');a.href=source.href;a.target='_blank';a.rel='noopener noreferrer';ehost.append(a);
        }else ehost.append(item('span','',label));
      }else ehost.append(item('span','',checks.length?'Nessun evento verificabile nell’ultimo ciclo':'L’acquisizione automatica non è ancora partita'));
    }else{
      text('mc-events-status','Non verificati');ehost.append(item('span','','Cron/source ledger non disponibili'));
    }
    var complete=new Date();
    text('mc-stamp','Verifica: '+date(complete.toISOString()));
    text('mc-source-time',date(complete.toISOString()));
    text('mc-readiness',good===5?'5 fonti interrogate · AIOS accessibile':good>0?good+' fonti interrogate · altre da verificare':'Impossibile leggere le fonti');
    $('mc-lamp').classList.toggle('good',good===5);
    busy=false;$('mc-refresh').disabled=false;
  }
  $('mc-refresh').addEventListener('click',refreshMissionControl);
  window.addEventListener('hashchange',function(){if(location.hash==='#oggi')refreshMissionControl()});
  refreshMissionControl();
}

export function injectCockpit(html){
  if (!html.includes('id="view-oggi"') || !html.includes('<div class="grid home-grid">') || !html.includes('init();\n})();')) throw new Error("Unsupported Life OS experience");
  const start='<header class="view-head"><div class="eyebrow">LA BASE';
  const end='</div></div>\n</section>\n<section class="view" id="view-vita"';
  const i=html.indexOf(start),j=html.indexOf('<div class="grid home-grid">',i);
  if(i<0||j<0||!html.includes(end))throw new Error("Home anchors not found");
  html=html.slice(0,i)+COCKPIT+'<details class="manual-archive" id="manual-planning"><summary>Pianificazione volontaria <small>La tua vecchia modalità resta disponibile, ma non è obbligatoria</small></summary>\n'+html.slice(j);
  html=html.replace(end,'</div></div></details>\n</section>\n<section class="view" id="view-vita"');
  html=html.replace('</style>',MC_STYLE+'</style>');
  html=html.replace('init();\n})();','('+installMissionControl.toString()+')();\ninit();\n})();');
  if(!html.includes('</body>'))throw new Error('Missing HTML body anchor');
  return html.replace('</body>',G2_SCRIPT+'</body>');
}

const G2_SCRIPT = `<script>(function(){const b=document.getElementById('soliwkr-brief'),o=document.getElementById('soliwkr-brief-result');if(!b||!o)return;b.addEventListener('click',async()=>{b.disabled=true;o.textContent='Leggo le fonti…';try{const r=await fetch('/api/agent/brief',{method:'POST',headers:{'content-type':'application/json','x-control-room':'1'},body:JSON.stringify({question:'Cosa è successo nei miei progetti nelle ultime 24 ore?'})});if(!r.ok)throw Error('Fonte non disponibile ('+r.status+')');const d=await r.json();o.replaceChildren();const p=document.createElement('p');p.textContent=d.answer;o.append(p);for(const e of d.events||[]){const a=document.createElement('a');a.href=e.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=e.text+' · '+new Date(e.occurred_at).toLocaleString('it-IT')+' (acquisito '+new Date(e.observed_at).toLocaleString('it-IT')+')';const row=document.createElement('p');row.append(a);o.append(row)}}catch(e){o.textContent=e.message}finally{b.disabled=false}})})()</script>`;
