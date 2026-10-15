// SOLIWKR home: one calm entrance, rooms first, diagnostics compressed into one status table.
// No new datastore, no fabricated integrations, manual planning remains optional and collapsed.
const COCKPIT = [
  '<div class="home-shell" id="mission-control">',
  '<header class="home-hero">',
  '<div class="home-kicker"><span>SOLIWKR</span><span class="home-kicker-dot">•</span><span id="date">—</span></div>',
  '<h1><span id="greeting">Bentornato.</span><br><em>Una porta. Il resto nelle sue stanze.</em></h1>',
  '<p>Non serve guardare tutta la macchina per usarla. Entra dove serve; lo stato tecnico resta disponibile, ma non occupa la casa.</p>',
  '<nav class="home-rooms" aria-label="Stanze principali">',
  '<button type="button" class="home-room" data-go="vita"><span>♡</span><b>Vita</b><small>Quello che conta fuori dai progetti</small></button>',
  '<button type="button" class="home-room" data-go="studio"><span>▦</span><b>Studio</b><small>Progetti, lavoro, costruzione</small></button>',
  '<button type="button" class="home-room" data-go="mente"><span>✳</span><b>Cervello</b><small>Memoria, note, conoscenza</small></button>',
  '<button type="button" class="home-room" data-go="rituali"><span>☼</span><b>Rituali</b><small>Aprire e chiudere il giorno</small></button>',
  '<button type="button" class="home-room" data-go="grafo"><span>◎</span><b>Atlante</b><small>Relazioni e provenienza</small></button>',
  '</nav>',
  '</header>',
  '<details class="status-panel" id="system-status">',
  '<summary><span class="status-summary"><span class="status-lamp" id="mc-lamp"></span><b>Stato sistema</b><span id="mc-readiness">Verifico le fonti…</span></span><span class="status-summary-meta"><span id="mc-stamp">—</span><span class="status-chevron">⌄</span></span></summary>',
  '<div class="status-body">',
  '<div class="status-toolbar"><span>Fatti verificabili · assente ≠ zero · attività ≠ risultato</span><button class="status-refresh" id="mc-refresh" type="button">↻ Aggiorna</button></div>',
  '<div class="status-table" role="table" aria-label="Stato dei sistemi">',
  '<div class="status-row status-head" role="row"><span role="columnheader">Area</span><span role="columnheader">Segnale</span><span role="columnheader">Stato</span></div>',
  '<div class="status-row" role="row"><span role="cell">Runtime</span><span role="cell">Worker</span><b id="mc-worker" role="cell">In verifica</b></div>',
  '<div class="status-row" role="row"><span role="cell">Storage</span><span role="cell">D1 privato</span><b id="mc-d1" role="cell">In verifica</b></div>',
  '<div class="status-row" role="row"><span role="cell">Fonti</span><span role="cell">GitHub</span><b id="mc-github" role="cell">In verifica</b></div>',
  '<div class="status-row" role="row"><span role="cell">Autonomia</span><span role="cell">Eventi automatici</span><b id="mc-events-status" role="cell">In attesa</b></div>',
  '<div class="status-row" role="row"><span role="cell">Memoria</span><span role="cell">Conoscenze approvate</span><b id="mc-knowledge" role="cell">—</b></div>',
  '<div class="status-row" role="row"><span role="cell">Memoria</span><span role="cell">Note private</span><b id="mc-notes" role="cell">In verifica</b></div>',
  '<div class="status-row" role="row"><span role="cell">Agente</span><span role="cell">SOLIWKR · Cloudflare Think</span><b class="status-warm" id="mc-agent" role="cell">Non deployato</b></div>',
  '<div class="status-row" role="row"><span role="cell">Messaggi</span><span role="cell">Telegram · SOLIWKR</span><b class="status-warm" role="cell">Non collegato</b></div>',
  '<div class="status-row" role="row"><span role="cell">Compute</span><span role="cell">Hermes · VPS</span><b class="status-unknown" role="cell">Non verificato</b></div>',
  '<div class="status-row" role="row"><span role="cell">Compute</span><span role="cell">Laptop</span><b class="status-neutral" role="cell">Opzionale</b></div>',
  '<div class="status-row" role="row"><span role="cell">Knowledge</span><span role="cell">Obsidian</span><b class="status-neutral" role="cell">Export manuale</b></div>',
  '</div>',
  '<div class="status-last"><span>Ultimo segnale verificabile</span><span id="mc-events">In attesa del primo ciclo</span></div>',
  '<div class="status-foot"><span>Ultima verifica: <span id="mc-source-time">—</span></span><button type="button" class="status-link" data-go="sistemi">Apri Connessioni ↗</button></div>',
  '</div>',
  '</details>',
  '</div>'
].join('');

const MC_STYLE = [
  '#mission-control{margin:0 0 28px}',
  '.home-hero{min-height:min(560px,62vh);display:flex;flex-direction:column;justify-content:center;max-width:1080px;padding:46px 0 38px}',
  '.home-kicker{display:flex;align-items:center;gap:9px;color:#8da093;font-size:10px;font-weight:820;letter-spacing:.17em;text-transform:uppercase}',
  '.home-kicker>span:first-child{color:var(--accent)}',
  '.home-kicker-dot{color:#52675a}',
  '.home-hero h1{font-size:clamp(46px,7vw,92px);line-height:.98;letter-spacing:-.068em;margin:20px 0 20px;font-weight:820;max-width:1000px}',
  '.home-hero h1 em{font-style:normal;color:var(--accent)}',
  '.home-hero>p{max-width:650px;margin:0;color:var(--muted);font-size:14px;line-height:1.7}',
  '.home-rooms{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:1px;margin-top:44px;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}',
  '.home-room{min-width:0;background:transparent;border:0;border-right:1px solid var(--line);color:var(--text);padding:18px 17px;text-align:left;display:grid;grid-template-columns:auto 1fr;grid-template-rows:auto auto;column-gap:11px;row-gap:2px;transition:background .15s}',
  '.home-room:last-child{border-right:0}',
  '.home-room:hover{background:#17211c}',
  '.home-room>span{grid-row:1/3;font-size:20px;color:var(--accent);align-self:center}',
  '.home-room b{font-size:13px;letter-spacing:-.01em}',
  '.home-room small{font-size:10px;color:#7f9386;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
  '.status-panel{border-top:1px solid var(--line);border-bottom:1px solid var(--line);background:transparent}',
  '.status-panel>summary{list-style:none;display:flex;align-items:center;justify-content:space-between;gap:18px;padding:18px 0;cursor:pointer}',
  '.status-panel>summary::-webkit-details-marker{display:none}',
  '.status-summary,.status-summary-meta{display:flex;align-items:center;gap:10px;min-width:0}',
  '.status-summary b{font-size:12px}',
  '.status-summary #mc-readiness,.status-summary-meta{font-size:10px;color:#829589}',
  '.status-summary #mc-readiness{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
  '.status-lamp{width:7px;height:7px;border-radius:50%;background:#819286;flex-shrink:0}',
  '.status-lamp.good{background:var(--accent);box-shadow:0 0 0 4px #c7f7780d}',
  '.status-chevron{font-size:15px;transition:transform .18s}',
  '.status-panel[open] .status-chevron{transform:rotate(180deg)}',
  '.status-body{padding:3px 0 22px}',
  '.status-toolbar{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:0 0 12px;color:#778c7e;font-size:10px}',
  '.status-refresh,.status-link{border:0;background:transparent;color:var(--accent);font-size:10px;font-weight:800;padding:6px 0}',
  '.status-table{border-top:1px solid #26342d}',
  '.status-row{display:grid;grid-template-columns:minmax(85px,.55fr) minmax(180px,1.35fr) minmax(110px,.7fr);align-items:center;gap:14px;min-height:39px;border-bottom:1px solid #26342d;font-size:11px;color:#a8b8ad}',
  '.status-row>span:first-child{color:#718578;font-size:9px;font-weight:830;letter-spacing:.11em;text-transform:uppercase}',
  '.status-row b{text-align:right;color:var(--accent);font-size:10px;font-weight:760}',
  '.status-row b.status-warm{color:#d9bea1}.status-row b.status-unknown{color:#d9b37c}.status-row b.status-neutral{color:#9eb8c8}',
  '.status-head{min-height:31px;color:#667a6d;font-size:9px;text-transform:uppercase;letter-spacing:.09em}',
  '.status-head>span:first-child{font-size:9px;color:#667a6d}',
  '.status-head>span:last-child{text-align:right}',
  '.status-last{display:grid;grid-template-columns:minmax(130px,.55fr) minmax(0,2.05fr);gap:14px;padding:14px 0;border-bottom:1px solid #26342d;font-size:10px;color:#7d9184}',
  '#mc-events{color:#b7c7bb;overflow-wrap:anywhere}',
  '#mc-events a{color:var(--accent);text-decoration:none}',
  '.status-foot{display:flex;justify-content:space-between;align-items:center;gap:12px;padding-top:13px;color:#6e8375;font-size:9px}',
  '.manual-archive{margin:30px 0 12px;border-top:1px solid #26342d;border-bottom:1px solid #26342d;background:transparent}',
  '.manual-archive>summary{padding:17px 0;cursor:pointer;font-size:11px;font-weight:730;color:#819487}',
  '.manual-archive>summary small{font-size:10px;color:#65796d;margin-left:9px;font-weight:450}',
  '.manual-archive[open]>.grid{padding:15px 0 20px}',
  '@media(max-width:1000px){.home-rooms{grid-template-columns:repeat(3,1fr)}.home-room:nth-child(3){border-right:0}.home-room:nth-child(n+4){border-top:1px solid var(--line)}}',
  '@media(max-width:720px){.home-hero{min-height:auto;padding:38px 0 28px}.home-hero h1{font-size:48px}.home-hero>p{font-size:12px}.home-rooms{grid-template-columns:1fr 1fr;margin-top:31px}.home-room{border-top:1px solid var(--line);padding:15px 10px}.home-room:nth-child(odd){border-right:1px solid var(--line)}.home-room:nth-child(even){border-right:0}.home-room:first-child,.home-room:nth-child(2){border-top:0}.home-room small{display:none}.status-panel>summary{align-items:flex-start}.status-summary{align-items:flex-start;flex-wrap:wrap}.status-summary #mc-readiness{width:100%;padding-left:17px}.status-summary-meta #mc-stamp{display:none}.status-row{grid-template-columns:70px minmax(0,1fr) 98px;gap:9px}.status-row>span:nth-child(2){overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.status-last{grid-template-columns:1fr;gap:5px}.manual-archive>summary small{display:block;margin:3px 0 0}}',
  '@media(prefers-reduced-motion:reduce){.home-room,.status-chevron{transition:none!important}}'
].join('\n');

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
    if(busy)return;
    busy=true;
    text('mc-readiness','Aggiorno le fonti…');
    $('mc-refresh').disabled=true;
    var results=await Promise.allSettled([read('/api/health'),read('/api/state'),read('/api/knowledge'),read('/api/projects'),read('/api/observations')]);
    var good=0;
    if(results[0].status==='fulfilled'){
      good++;
      text('mc-worker','Risponde');
      text('mc-d1',results[0].value.storage?'Binding presente':'Non disponibile');
    }else{
      text('mc-worker','Non verificato');
      text('mc-d1','Non verificato');
    }
    if(results[1].status==='fulfilled'){
      good++;
      text('mc-notes',String((results[1].value.state?.inbox||[]).length)+' note');
      text('mc-d1','Lettura riuscita');
    }else{
      text('mc-notes','Non verificato');
    }
    if(results[2].status==='fulfilled'){
      good++;
      var knowledge=results[2].value.items;
      text('mc-knowledge',Array.isArray(knowledge)?String(knowledge.length):'—');
    }else{
      text('mc-knowledge','—');
    }
    if(results[3].status==='fulfilled'){
      var projects=results[3].value.projects;
      if(Array.isArray(projects)){
        good++;
        var actual=projects.filter(function(p){return typeof p.pushed_at==='string'&&Number.isFinite(new Date(p.pushed_at).getTime())});
        text('mc-github',actual.length+' fonti attive');
      }else{
        text('mc-github','Non verificato');
      }
    }else{
      text('mc-github','Non verificato');
    }
    var ehost=$('mc-events');
    ehost.replaceChildren();
    if(results[4].status==='fulfilled'){
      var ledger=results[4].value;
      var checks=Array.isArray(ledger.sources)?ledger.sources:[];
      var list=Array.isArray(ledger.events)?ledger.events:[];
      var ok=checks.filter(function(x){return x.status==='ok'}).length;
      if(ok)good++;
      text('mc-events-status',ok?ok+' sorgenti aggiornate':checks.length?'Fonte in errore':'In attesa del primo ciclo');
      if(list.length){
        var last=list[0],source;
        try{source=new URL(last.source_url)}catch(e){source=null}
        var label=String(last.summary||'Evento tecnico').slice(0,130)+' · '+date(last.occurred_at);
        if(source&&source.protocol==='https:'&&source.hostname==='github.com'){
          var link=item('a','',label+' ↗');
          link.href=source.href;
          link.target='_blank';
          link.rel='noopener noreferrer';
          ehost.append(link);
        }else{
          ehost.append(item('span','',label));
        }
      }else{
        ehost.append(item('span','',checks.length?'Nessun evento verificabile nell’ultimo ciclo':'In attesa del primo ciclo'));
      }
    }else{
      text('mc-events-status','Non verificati');
      ehost.append(item('span','','Ledger non disponibile'));
    }
    var complete=new Date().toISOString();
    text('mc-stamp',date(complete));
    text('mc-source-time',date(complete));
    text('mc-readiness',good===5?'Operativo · 5 fonti verificate':good>0?good+' / 5 fonti verificate':'Fonti non verificabili');
    $('mc-lamp').classList.toggle('good',good===5);
    busy=false;
    $('mc-refresh').disabled=false;
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
  html=html.slice(0,i)+COCKPIT+'<details class="manual-archive" id="manual-planning"><summary>Modalità manuale <small>Focus e tre mosse restano disponibili, ma non sono la home.</small></summary>\n'+html.slice(j);
  html=html.replace(end,'</div></div></details>\n</section>\n<section class="view" id="view-vita"');
  html=html.replace('</style>',MC_STYLE+'</style>');
  html=html.replace('init();\n})();','('+installMissionControl.toString()+')();\ninit();\n})();');
  return html;
}
