// Read-only System Map inside the existing private SOLIWKR Control Room.
// Project and connection names remain in private D1: never compile them into the public repo.
const MAP_VIEW=[
  '<section class="view" id="view-mappa" data-page="mappa" hidden>',
  '<header class="view-head"><div class="eyebrow">SOLIWKR · SYSTEM MAP</div><h1>L’intero sistema.<br><span style="color:var(--blue)">Una sola casa.</span></h1><p>Grafo di navigazione costruito dall’inventario privato esistente. Le linee rappresentano appartenenza al registro, non relazioni operative inventate.</p></header>',
  '<div class="sm-summary"><span id="sm-summary">In attesa dei registri privati…</span><button class="button small soft" id="sm-refresh" type="button">↻ Aggiorna</button></div>',
  '<div class="sm-controls"><input class="field" id="sm-search" type="search" placeholder="Cerca progetti, servizi, repository…" aria-label="Cerca nodi"><div class="sm-tabs" role="group" aria-label="Filtro mappa"><button type="button" class="filter active" data-sm-filter="all">Tutto</button><button type="button" class="filter" data-sm-filter="projects">Progetti</button><button type="button" class="filter" data-sm-filter="connections">Sistemi</button><button type="button" class="filter" data-sm-filter="unverified">Da verificare</button></div></div>',
  '<div class="sm-board"><div class="sm-scroll"><svg id="sm-svg" viewBox="0 0 1180 630" role="group" aria-label="Mappa del portafoglio e delle connessioni SOLIWKR"></svg></div></div>',
  '<div class="sm-inspector" aria-live="polite"><div><div class="eyebrow">NODO SELEZIONATO</div><h2 id="sm-node">SOLIWKR</h2><p id="sm-description">Seleziona un nodo per vedere fonte, stato e collegamenti.</p><small id="sm-source">Inventario D1 privato</small></div><a id="sm-link" class="button lime" target="_blank" rel="noopener noreferrer" hidden>Apri fonte ↗</a></div>',
  '<p class="sm-footnote">I dati si aggiornano alla richiesta tramite <code>/api/projects</code> e <code>/api/context</code> già autenticati. La disponibilità del registro non certifica né ricavi né stato di produzione. PaperClip, Google Drive e Cloudflare richiedono ancora adattatori server-side dedicati: nessuna credenziale viene trasferita dal browser.</p>',
  '</section>'
].join('');
const MAP_STYLE=[
  '.sm-summary{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:12px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line);font-size:11px;color:var(--muted)}',
  '.sm-controls{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin:16px 0}',
  '.sm-controls .field{flex:1;min-width:210px;max-width:390px}',
  '.sm-tabs{display:flex;flex-wrap:wrap;gap:6px}.sm-tabs .filter{padding:9px 11px}',
  '.sm-board{border:1px solid #3e5548;border-radius:17px;background:radial-gradient(ellipse at 51% 8%,#1e352a,#101a16 58%,#0d1312);overflow:hidden}',
  '.sm-scroll{width:100%;overflow:auto;scrollbar-color:#59795e #17211b}',
  '#sm-svg{display:block;width:1180px;min-width:1180px;max-width:none}',
  '.sm-edge{stroke:#658674;stroke-width:1.3;opacity:.20;fill:none;pointer-events:none}',
  '.sm-edge.focus{stroke:var(--accent);opacity:.9;stroke-width:2.3}',
  '.sm-dot{cursor:pointer}.sm-dot circle{fill:#183029;stroke:#94c6a8;stroke-width:2}',
  '.sm-dot.project circle{fill:#1b3443;stroke:#9dd6e8}',
  '.sm-dot.connection circle{fill:#332b43;stroke:#bfa9ff}',
  '.sm-dot.root circle{fill:#c7f778;stroke:#e6ffcb}',
  '.sm-dot text{fill:#e8efe7;font:600 11px system-ui,sans-serif;pointer-events:none}',
  '.sm-dot.selected circle,.sm-dot:focus-visible circle{stroke:#fff;stroke-width:3}',
  '.sm-dot.dim{opacity:.17}',
  '.sm-inspector{display:flex;justify-content:space-between;align-items:center;gap:22px;border:1px solid var(--line);border-radius:15px;padding:20px;margin-top:14px;background:var(--panel)}',
  '.sm-inspector h2{font-size:22px;margin:7px 0 3px}.sm-inspector p{color:var(--muted);font-size:12px;margin:0 0 8px;overflow-wrap:anywhere}',
  '.sm-inspector small{color:#9db2a4;font-size:10px;overflow-wrap:anywhere}',
  '.sm-footnote{color:#829589;font-size:11px;line-height:1.7;max-width:900px;margin-top:19px}',
  '@media(max-width:700px){.sm-summary{align-items:flex-start}.sm-inspector{flex-direction:column;align-items:stretch}.sm-inspector a{text-align:center}.sm-controls{align-items:stretch}}'
].join('\n');

function installSystemMap(){
  var svg=document.getElementById('sm-svg'),selected='root',filter='all',query='',records={projects:[],connections:[]},failure=[];
  function el(tag){return document.createElementNS('http://www.w3.org/2000/svg',tag)}
  function safeUrl(value){try{var u=new URL(value);return u.protocol==='https:'?u.href:null}catch{return null}}
  function clean(value){return String(value==null?'':value)}
  function routeData(){
    var p=records.projects.map(function(x,i){return {id:'project:'+clean(x.id||i),kind:'project',name:clean(x.name||'Senza nome'),group:'projects',detail:clean(x.category||x.group||x.kind)+' · '+clean(x.status||'unknown'),source:clean(x.source||'non indicata'),sourceStatus:clean(x.source_status||'unknown'),at:clean(x.observed_at||x.updated_at||'non datata'),url:safeUrl(x.url),repository:clean(x.repository)}});
    var c=records.connections.map(function(x,i){return {id:'connection:'+clean(x.id||i),kind:'connection',name:clean(x.name||'Senza nome'),group:'connections',detail:clean(x.detail||x.item_type||'Servizio')+' · '+clean(x.status||'unknown'),source:clean(x.source||'non indicata'),sourceStatus:clean(x.source_status||'unknown'),at:clean(x.observed_at||x.updated_at||'non datata'),url:safeUrl(x.url),repository:''}});
    return {projects:p,connections:c};
  }
  function choose(n){
    selected=n.id;
    document.getElementById('sm-node').textContent=n.name;
    document.getElementById('sm-description').textContent=n.detail+(n.repository?' · '+n.repository:'');
    document.getElementById('sm-source').textContent='Fonte: '+n.source+' · evidenza '+n.sourceStatus+' · osservato '+n.at;
    var link=document.getElementById('sm-link');
    link.hidden=!n.url;
    if(n.url)link.href=n.url;else link.removeAttribute('href');
  }
  function draw(){
    var groups=routeData(),projects=groups.projects.filter(match),connections=groups.connections.filter(match);
    var height=Math.max(590,300+55*Math.max(Math.ceil(projects.length/3),Math.ceil(connections.length/2)));
    svg.setAttribute('viewBox','0 0 1180 '+height);
    svg.style.height=height+'px';
    svg.replaceChildren();
    var lines=el('g'),dots=el('g'),nodes=[
      {id:'root',name:'SOLIWKR',kind:'root',group:'root',x:582,y:50,detail:'Sistema di governo, non un prodotto.',source:'Governance',sourceStatus:'strutturale',at:'—'},
      {id:'hub:p',name:'Studio',kind:'root',group:'projects',x:300,y:160,detail:'Registro progetti privato.',source:'D1',sourceStatus:'strutturale',at:'—'},
      {id:'hub:c',name:'Sistemi',kind:'root',group:'connections',x:890,y:160,detail:'Registro connessioni privato.',source:'D1',sourceStatus:'strutturale',at:'—'}
    ];
    projects.forEach(function(x,i){nodes.push({...x,x:[85,300,515][i%3],y:265+55*Math.floor(i/3)})});
    connections.forEach(function(x,i){nodes.push({...x,x:[742,976][i%2],y:265+55*Math.floor(i/2)})});
    var ids=new Map(nodes.map(function(n){return [n.id,n]}));
    function edge(from,to){
      var a=ids.get(from),b=ids.get(to);if(!a||!b)return;
      var path=el('path');
      path.setAttribute('d','M'+a.x+' '+a.y+' C'+a.x+' '+((a.y+b.y)/2)+' '+b.x+' '+((a.y+b.y)/2)+' '+b.x+' '+b.y);
      path.setAttribute('class','sm-edge'+(selected===a.id||selected===b.id?' focus':''));
      lines.append(path);
    }
    edge('root','hub:p');edge('root','hub:c');
    projects.forEach(function(x){edge('hub:p',x.id)});
    connections.forEach(function(x){edge('hub:c',x.id)});
    nodes.forEach(function(n){
      var g=el('g'),circle=el('circle'),label=el('text'),title=el('title');
      var dim=filter==='projects'&&n.group==='connections'||filter==='connections'&&n.group==='projects';
      g.setAttribute('class','sm-dot '+n.kind+(n.id===selected?' selected':'')+(dim?' dim':''));
      g.setAttribute('role','button');g.setAttribute('tabindex','0');g.setAttribute('aria-label',n.name);
      circle.setAttribute('cx',n.x);circle.setAttribute('cy',n.y);circle.setAttribute('r',n.id==='root'?19:n.kind==='root'?12:7);
      label.setAttribute('x',n.x);label.setAttribute('y',n.y+(n.kind==='root'?34:23));label.setAttribute('text-anchor','middle');
      label.textContent=n.name.length>21?n.name.slice(0,20)+'…':n.name;title.textContent=n.name;
      g.append(circle,label,title);
      g.addEventListener('click',function(){choose(n);draw()});
      g.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(n);draw()}});
      dots.append(g);
    });
    svg.append(lines,dots);
    var current=ids.get(selected);if(current)choose(current);else choose(ids.get('root'));
  }
  function match(n){
    if(filter==='projects'&&n.group!=='projects')return false;
    if(filter==='connections'&&n.group!=='connections')return false;
    if(filter==='unverified'&&n.sourceStatus==='verified')return false;
    return !query||(n.name+' '+n.detail+' '+n.repository).toLocaleLowerCase('it').includes(query);
  }
  async function refresh(){
    var status=document.getElementById('sm-summary'),button=document.getElementById('sm-refresh');
    status.textContent='Aggiorno i registri privati…';button.disabled=true;
    failure=[];
    var sources=[['projects','/api/projects','projects'],['connections','/api/context?destination=connections','items']];
    await Promise.all(sources.map(async function(s){
      try{
        var response=await fetch(s[1],{cache:'no-store'});
        if(!response.ok)throw Error('HTTP '+response.status);
        var data=await response.json();
        if(!Array.isArray(data[s[2]]))throw Error('Formato incompleto');
        records[s[0]]=data[s[2]];
      }catch(e){records[s[0]]=[];failure.push(s[0]+': '+e.message)}
    }));
    status.textContent=failure.length?'Fonte non disponibile · '+failure.join(' · '):records.projects.length+' progetti · '+records.connections.length+' sistemi · D1 · aggiornato '+new Date().toLocaleTimeString('it-IT');
    draw();button.disabled=false;
  }
  document.getElementById('sm-refresh').addEventListener('click',refresh);
  document.getElementById('sm-search').addEventListener('input',function(e){query=String(e.target.value||'').toLocaleLowerCase('it').trim();draw()});
  document.querySelectorAll('[data-sm-filter]').forEach(function(b){b.addEventListener('click',function(){filter=b.dataset.smFilter;document.querySelectorAll('[data-sm-filter]').forEach(function(x){x.classList.toggle('active',x===b)});draw()})});
  window.addEventListener('hashchange',function(){if(location.hash==='#mappa')refresh()});
  draw();if(location.hash==='#mappa')refresh();
}
export function injectSystemMap(html){
  if(!html.includes('init();\n})();'))throw Error('Unsupported Control Room template');
  const anchor='<section class="view" id="view-rituali"';
  if(!html.includes(anchor)||!html.includes('href="#grafo" data-nav="grafo"'))throw Error('System Map anchors missing');
  html=html.replace(anchor,MAP_VIEW+anchor);
  html=html.replace('<a class="nav-item" href="#grafo" data-nav="grafo"', '<a class="nav-item" href="#mappa" data-nav="mappa"><span class="nav-ico">⌘</span> System Map</a><a class="nav-item" href="#grafo" data-nav="grafo"');
  html=html.replace('</style>',MAP_STYLE+'</style>');
  html=html.replace(/(const|var) VIEWS=\{([^}]+)\}/,function(_,word,content){return word+' VIEWS={'+content.replace("grafo:","mappa:'System Map',grafo:")+'}'});
  html=html.replace('init();\n})();','('+installSystemMap.toString()+')();\ninit();\n})();');
  return html;
}
