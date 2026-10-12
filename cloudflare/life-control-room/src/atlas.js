// Source-aware graph: structure, not psychological inference.
const markup=[
'<section class="view" id="view-grafo" data-page="grafo" hidden>',
'<header class="view-head"><div class="eyebrow">KNOWLEDGE ATLAS</div><h1>Il tuo mondo.<br><span style="color:var(--accent)">Non una lista infinita.</span></h1><p>Esplora vita, progetti e conoscenza. I collegamenti sono strutturali: non inventano rapporti tra le persone.</p></header>',
'<div class="atlas-top"><span class="eyebrow">SOLIWKR · GRAFO VIVO</span><button class="button lime" id="vault-export">↧ Vault Obsidian</button></div>',
'<div class="atlas-board"><div class="atlas-filters"><button class="filter active" data-atlas-filter="all">Tutti</button><button class="filter" data-atlas-filter="life">Vita</button><button class="filter" data-atlas-filter="studio">Studio</button><button class="filter" data-atlas-filter="knowledge">Conoscenza</button><span style="flex:1"></span><button class="button small soft" id="atlas-out" aria-label="Riduci">−</button><button class="button small soft" id="atlas-in" aria-label="Ingrandisci">+</button></div>',
'<div class="atlas-scroll"><svg id="atlas-svg" viewBox="0 0 1060 620" role="group" aria-label="Nodi interattivi del grafo di vita, studio e conoscenza"></svg></div>',
'<div class="atlas-bottom">● Vita &nbsp; <span style="color:#9dd6e8">● Studio</span> &nbsp; <span style="color:#bfa9ff">● Conoscenza</span><span>Su mobile scorri lateralmente.</span></div></div>',
'<div class="atlas-selected"><div><div class="eyebrow">NODO SELEZIONATO</div><h2 id="atlas-title">SOLIWKR</h2><p class="sub" id="atlas-description">Un ingresso. Tante stanze.</p><span class="caption" id="atlas-source">Fonte: governance</span></div><button class="button lime" id="atlas-open">Apri ↗</button></div>',
'<div class="sectionrow"><h3>Il metodo Karpathy in Obsidian</h3><span class="chip">Markdown · Portabile</span></div>',
'<div class="atlas-trio"><div class="card smallcard"><div class="eyebrow">01 / FONTI</div><h2 class="secondary-head">raw/</h2><p class="sub">Gli originali sono immutabili.</p></div><div class="card smallcard"><div class="eyebrow" style="color:var(--violet)">02 / WIKI</div><h2 class="secondary-head">wiki/</h2><p class="sub">Una rete di note con wikilink.</p></div><div class="card smallcard"><div class="eyebrow" style="color:var(--blue)">03 / REGOLE</div><h2 class="secondary-head">AGENTS.md</h2><p class="sub">Ingest · Query · Lint · LOG.</p></div></div>',
'<div class="intro-strip" style="margin-top:18px"><span>⚿</span><span><strong>Export privato, non sync automatico.</strong> Il tuo ZIP include uno snapshot D1 personale. Non pubblicarlo su GitHub.</span></div>',
'</section>'
].join('');
const style=[
'.atlas-top{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:18px}.atlas-board{border:1px solid #446048;border-radius:20px;background:radial-gradient(ellipse at center,#223829,#15241c 62%,#101a16 100%);overflow:hidden}.atlas-filters{display:flex;gap:8px;padding:13px;border-bottom:1px solid #344b38;align-items:center;overflow:auto;white-space:nowrap}.atlas-filters .filter{padding:8px 12px}.atlas-scroll{overflow:auto;scrollbar-color:#557a57 #111e17}#atlas-svg{display:block;width:100%;height:545px}.atlas-bottom{display:flex;justify-content:space-between;gap:12px;padding:13px 16px;font-size:11px;color:var(--muted);border-top:1px solid #344b38}.atlas-selected{display:flex;align-items:center;justify-content:space-between;gap:17px;padding:22px;margin-top:14px;border:1px solid #47614b;border-radius:17px;background:#1b2c22}.atlas-selected h2{font-size:27px;margin:9px 0 5px;letter-spacing:-.03em}.atlas-selected p{margin:0 0 7px}.atlas-trio{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:13px}.atlas-trio h2{margin:10px 0}.atlas-edge{stroke:#749277;opacity:.3;stroke-width:1.6;fill:none}.atlas-edge.hot{stroke:var(--accent);opacity:.9;stroke-width:2.3}.atlas-edge.dim{opacity:.035}.atlas-node{cursor:pointer}.atlas-node circle{stroke-width:2;fill:#25352a;stroke:#79a07c}.atlas-node.life circle{stroke:#a7d28b}.atlas-node.studio circle{stroke:#9dd6e8;fill:#22323c}.atlas-node.knowledge circle{stroke:#bfa9ff;fill:#332d42}.atlas-node.root circle{stroke:#dcffab;fill:#c7f778}.atlas-node text{fill:#e7eee5;font:650 12px system-ui,sans-serif;pointer-events:none}.atlas-node.root text{font-weight:850;font-size:15px;fill:#e8ffcd}.atlas-node.active circle,.atlas-node:focus-visible circle{stroke:#fff9c6;stroke-width:3;filter:drop-shadow(0 0 6px #c7f778)}.atlas-node.dim{opacity:.16}',
'@media(max-width:850px){#atlas-svg{width:875px;min-width:875px;height:520px}.atlas-bottom{flex-wrap:wrap}}@media(max-width:650px){.atlas-top{flex-wrap:wrap}.atlas-top .button{width:100%}.atlas-selected{flex-direction:column;align-items:stretch}.atlas-selected .button{width:100%}.atlas-trio{grid-template-columns:1fr}}'
].join('\n');
function installGraph(){
 var N=[
 ['root','SOLIWKR',515,290,'root','Il tuo ingresso: ogni dominio conserva la propria fonte.','oggi','AIOS'],
 ['today','Oggi',515,95,'life','Focus e tre mosse.','oggi','D1 personale'],
 ['life','Vita',265,255,'life','Le aree umane non sono KPI.','vita','D1 personale'],
 ['studio','Studio',778,245,'studio','Portafoglio con repository autonomi.','studio','GitHub'],
 ['brain','Cervello',510,480,'knowledge','Note personali senza inferenze.','mente','D1 privato'],
 ['body','Corpo',110,100,'life','Corpo ed energia.','vita','D1 dichiarato'],
 ['relations','Relazioni',80,240,'life','Nessuna inferenza su altre persone.','vita','D1 dichiarato'],
 ['faith','Fede',108,410,'life','Spazio interiore.','vita','D1 dichiarato'],
 ['money','Denaro',315,105,'life','Stabilità personale.','vita','D1 dichiarato'],
 ['time','Tempo',265,540,'life','Tempo, casa e respiro.','vita','D1 dichiarato'],
 ['ritual','Rituali',355,430,'knowledge','Inizio e fine giornata.','rituali','D1 privato'],
 ['karpathy','Metodo Karpathy',595,570,'knowledge','Raw, Wiki e AGENTS; Ingest, Query, Lint.','grafo','Karpathy gist'],
 ['obsidian','Obsidian',765,525,'knowledge','Wikilink e graph view locale.','grafo','Vault esportato'],
 ['bo','Black Office',785,74,'studio','Esperimenti economici con metriche proprietarie.','studio','GitHub: black-office'],
 ['trovatemi','Trovatemi',950,122,'studio','Business OS e mercato locale.','studio','GitHub: trovatemi-os'],
 ['workprint','Workprint',960,245,'studio','Prodotto autonomo.','studio','GitHub: workprint'],
 ['esim','SenzaRoaming',962,350,'studio','Servizio eSIM.','studio','GitHub: esim'],
 ['gara','Gara Radar',940,450,'studio','Utility professionale.','studio','GitHub: gara-radar'],
 ['sud','Sud Pontino',845,565,'studio','Iniziativa territoriale.','studio','GitHub: sudpontino'],
 ['raccolto','Raccolto',710,396,'studio','App foto eventi.','studio','GitHub: raccolto-app'],
 ['rank','RankEmpire',675,142,'studio','Factory, asset e acquisizione.','studio','GitHub: rankempire-italia']
 ];
 var E=[['root','today'],['root','life'],['root','studio'],['root','brain'],['root','karpathy'],['life','body'],['life','relations'],['life','faith'],['life','money'],['life','time'],['life','ritual'],['brain','ritual'],['brain','karpathy'],['karpathy','obsidian'],['studio','bo'],['studio','trovatemi'],['studio','workprint'],['studio','esim'],['studio','gara'],['studio','sud'],['studio','raccolto'],['studio','rank']];
 var chosen='root',filter='all',zoom=1,svg=document.getElementById('atlas-svg');
 function item(id){return N.find(function(n){return n[0]===id})}
 function se(tag){return document.createElementNS('http://www.w3.org/2000/svg',tag)}
 function select(n){chosen=n[0];q('atlas-title').textContent=n[1];q('atlas-description').textContent=n[5]+(chosen==='brain'?' Note registrate: '+state.inbox.length+'.':'');q('atlas-source').textContent='Fonte: '+n[7];q('atlas-open').onclick=function(){if(n[6]==='grafo')q('vault-export').focus();else route(n[6])}}
 function draw(){svg.replaceChildren();var lines=se('g'),dots=se('g');
 E.forEach(function(e){var a=item(e[0]),b=item(e[1]),m=(a[2]+b[2])/2,p=se('path');p.setAttribute('d','M'+a[2]+' '+a[3]+' C'+m+' '+a[3]+' '+m+' '+b[3]+' '+b[2]+' '+b[3]);p.setAttribute('class','atlas-edge'+(e.includes(chosen)?' hot':'')+(filter!=='all'&&a[4]!==filter&&b[4]!==filter?' dim':''));lines.append(p)});
 N.forEach(function(n){var g=se('g'),c=se('circle'),t=se('text'),hub=['root','life','studio','brain'].includes(n[0]);g.setAttribute('class','atlas-node '+n[4]+(n[0]===chosen?' active':'')+(filter!=='all'&&n[4]!==filter&&n[4]!=='root'?' dim':''));g.setAttribute('transform','translate('+n[2]+' '+n[3]+')');g.setAttribute('role','button');g.setAttribute('tabindex','0');g.setAttribute('aria-label',n[1]+': '+n[5]);c.setAttribute('r',n[0]==='root'?28:hub?20:9);t.textContent=n[1];t.setAttribute('y',n[0]==='root'?54:hub?42:28);t.setAttribute('text-anchor','middle');g.append(c,t);g.addEventListener('click',function(){select(n);draw()});g.addEventListener('keydown',function(ev){if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();select(n);draw()}});dots.append(g)});
 svg.append(lines,dots);svg.setAttribute('viewBox',((1060-1060/zoom)/2)+' '+((620-620/zoom)/2)+' '+(1060/zoom)+' '+(620/zoom));
 }
 select(N[0]);draw();
 document.querySelectorAll('[data-atlas-filter]').forEach(function(b){b.addEventListener('click',function(){filter=b.dataset.atlasFilter;document.querySelectorAll('[data-atlas-filter]').forEach(function(x){x.classList.toggle('active',x===b)});draw()})});
 q('atlas-in').addEventListener('click',function(){zoom=Math.min(1.7,zoom+.15);draw()});q('atlas-out').addEventListener('click',function(){zoom=Math.max(.8,zoom-.15);draw()});
 function centerMap(){var s=document.querySelector('.atlas-scroll');if(s&&s.scrollWidth>s.clientWidth)s.scrollLeft=Math.round((s.scrollWidth-s.clientWidth)*.48)}
 window.addEventListener('hashchange',function(){if(location.hash==='#grafo'){select(item(chosen));draw();setTimeout(centerMap,120)}});
 if(location.hash==='#grafo')setTimeout(centerMap,900);
 q('vault-export').addEventListener('click',async function(){if(!ready){toast('D1 non disponibile, non posso esportare.');return}if(dirty){await save();if(dirty){toast('Prima completa il salvataggio.');return}}var b=q('vault-export'),before=b.textContent;b.disabled=true;b.textContent='Preparo il vault...';try{var res=await fetch('/api/vault',{cache:'no-store'});if(!res.ok)throw Error('Errore di export HTTP '+res.status);var blob=await res.blob();if(blob.size<400)throw Error('Archivio incompleto');var url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Soliwkr-Wiki-'+new Date().toISOString().slice(0,10)+'.zip';document.body.append(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url)},15000);toast('ZIP privato pronto per Obsidian.')}catch(e){toast(e.message)}finally{b.disabled=false;b.textContent=before}});
}
export function injectAtlas(html){
 if(!html.includes('init();\n})();'))throw Error('Unsupported app');
 html=html.replace('<div class="nav-label">IL SISTEMA</div>','<a class="nav-item" href="#grafo" data-nav="grafo"><span class="nav-ico">◈</span> Atlante</a><div class="nav-label">IL SISTEMA</div>');
 html=html.replace('<button class="quicklink" data-go="rituali"><span>☼</span><strong>Chiudi il giorno ↗</strong></button>','<button class="quicklink" data-go="grafo"><span>◈</span><strong>Esplora l’Atlante ↗</strong></button>');
 html=html.replace('<section class="view" id="view-rituali"',markup+'<section class="view" id="view-rituali"');
 html=html.replace('</style>',style+'</style>');
 html=html.replace(/(const|var) VIEWS=\{([^}]+)\}/,function(_,word,content){return word+' VIEWS={'+content.replace('rituali:',"grafo:'Atlante',rituali:")+'}'});
 html=html.replace('init();\n})();','('+installGraph.toString()+')();\ninit();\n})();');
 return html;
}
