// Private Studio inventory. Project names/repositories live in D1, not in this public source file.
const STUDIO = [
  '<section class="view" id="view-studio" data-page="studio" hidden>',
  '<header class="view-head portfolio-head"><div class="eyebrow">STUDIO · INVENTARIO PRIVATO</div><h1>Tutto quello che esiste.<br><span style="color:var(--blue)">Non solo quello che ricordi oggi.</span></h1><p>Repository, progetti, sistemi e incubazioni raccolti in un inventario source-aware. Se una cosa è ricordata ma non verificata, resta visibile come tale invece di sparire.</p></header>',
  '<div class="portfolio-strip"><span><b id="portfolio-count">—</b> elementi nell’inventario</span><span id="project-updated">D1 privato · caricamento…</span></div>',
  '<div class="filterbar" id="project-filters"></div>',
  '<div class="project-grid portfolio-grid" id="project-grid"></div>',
  '<div class="portfolio-legend"><span><i class="portfolio-dot verified"></i> verificato</span><span><i class="portfolio-dot remembered"></i> ricordato</span><span><i class="portfolio-dot check"></i> da verificare</span></div>',
  '</section>'
].join('');

const PORTFOLIO_STYLE = [
  '.portfolio-head{max-width:900px}',
  '.portfolio-strip{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:13px 0 17px;border-bottom:1px solid var(--line);font-size:10px;color:#819487}',
  '.portfolio-strip b{font-size:13px;color:var(--text)}',
  '.portfolio-grid{grid-template-columns:repeat(3,minmax(0,1fr))}',
  '.portfolio-card{position:relative}',
  '.portfolio-card.no-link{cursor:default}',
  '.portfolio-top{display:flex;justify-content:space-between;align-items:center;gap:9px}',
  '.portfolio-badge{font-size:9px;text-transform:uppercase;letter-spacing:.09em;color:#8ea195;border:1px solid #33443a;border-radius:999px;padding:4px 7px}',
  '.portfolio-source{font-size:9px;color:#718477}',
  '.portfolio-card strong{margin-top:4px}',
  '.portfolio-repo{font:10px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace;color:#718477;overflow-wrap:anywhere}',
  '.portfolio-meta{display:flex;gap:7px;flex-wrap:wrap;font-size:9px;color:#809286}',
  '.portfolio-meta span{border:1px solid #2f3d35;border-radius:999px;padding:3px 6px}',
  '.portfolio-card .project-bottom{align-items:center}',
  '.portfolio-card .project-bottom .state-active,.portfolio-card .project-bottom .state-live{color:var(--accent)}',
  '.portfolio-card .project-bottom .state-building{color:var(--blue)}',
  '.portfolio-card .project-bottom .state-incubating{color:var(--violet)}',
  '.portfolio-card .project-bottom .state-legacy,.portfolio-card .project-bottom .state-paused{color:#a7a19a}',
  '.portfolio-legend{display:flex;gap:16px;flex-wrap:wrap;margin-top:18px;color:#74877a;font-size:9px}',
  '.portfolio-legend span{display:flex;align-items:center;gap:6px}',
  '.portfolio-dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:#7b8c80}',
  '.portfolio-dot.verified{background:var(--accent)}.portfolio-dot.remembered{background:var(--violet)}.portfolio-dot.check{background:#d5ad74}',
  '@media(max-width:1150px){.portfolio-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}',
  '@media(max-width:650px){.portfolio-grid{grid-template-columns:1fr}.portfolio-strip{align-items:flex-start;flex-direction:column;gap:3px}}'
].join('\n');

function installPortfolio() {
  function kindLabel(kind){
    return ({project:'Progetto',system:'Sistema',tool:'Tool',incubation:'Incubazione',archive:'Legacy',repository:'Repository'})[kind]||'Elemento';
  }
  function sourceLabel(p){
    if(p.source_status==='verified')return 'verificato';
    if(p.source_status==='remembered')return 'ricordato';
    return 'da verificare';
  }
  function safeExternal(url){
    try{var u=new URL(url);return u.protocol==='https:'?u.href:null}catch{return null}
  }
  loadProjects=async function(){
    q('project-updated').textContent='D1 privato · verifica in corso…';
    try{
      var r=await fetch('/api/projects',{cache:'no-store'});
      if(!r.ok)throw Error('HTTP '+r.status);
      var data=await r.json();
      projects=Array.isArray(data.projects)?data.projects:[];
      q('portfolio-count').textContent=String(projects.length);
      q('project-updated').textContent='Inventario privato · '+projects.length+' elementi';
      renderProjects();
    }catch(e){
      projects=[];
      q('portfolio-count').textContent='0';
      q('project-grid').replaceChildren(node('div','empty','Inventario non disponibile. Nessun progetto viene inventato.'));
      q('project-updated').textContent='D1 non verificabile';
    }
  };
  renderProjects=function(){
    var cats=[
      ['Tutti',function(){return true}],
      ['Progetti',function(p){return p.kind==='project'}],
      ['Sistemi',function(p){return p.kind==='system'}],
      ['Tool',function(p){return p.kind==='tool'||p.kind==='repository'}],
      ['Incubazioni',function(p){return p.kind==='incubation'}],
      ['Da verificare',function(p){return p.source_status!=='verified'||p.status==='unknown'}]
    ];
    if(!cats.some(function(x){return x[0]===projectFilter}))projectFilter='Tutti';
    var filters=q('project-filters');
    filters.replaceChildren();
    cats.forEach(function(entry){
      var c=entry[0],b=node('button','filter'+(projectFilter===c?' active':''),c);
      b.type='button';
      b.addEventListener('click',function(){projectFilter=c;renderProjects()});
      filters.append(b);
    });
    var predicate=cats.filter(function(x){return x[0]===projectFilter})[0][1];
    var order={active:0,live:1,building:2,unknown:3,paused:4,incubating:5,legacy:6};
    var list=projects.filter(predicate).slice().sort(function(a,b){
      var aa=order[a.status]??9,bb=order[b.status]??9;
      return aa-bb||String(a.name||'').localeCompare(String(b.name||''),'it');
    });
    var host=q('project-grid');
    host.replaceChildren();
    if(!list.length){host.append(node('div','empty','Nessun elemento in questa selezione.'));return}
    list.forEach(function(p){
      var href=safeExternal(p.url);
      var card=href?node('a','project portfolio-card'):node('article','project portfolio-card no-link');
      if(href){card.href=href;card.target='_blank';card.rel='noopener noreferrer'}
      var top=node('div','portfolio-top');
      top.append(node('span','portfolio-badge',kindLabel(p.kind)),node('span','portfolio-source',sourceLabel(p)));
      card.append(top,node('strong','',p.name||'Senza nome'),node('small','',p.category||'Da classificare'));
      if(p.repository)card.append(node('div','portfolio-repo',p.repository));
      var meta=node('div','portfolio-meta');
      if(p.visibility&&p.visibility!=='none')meta.append(node('span','',p.visibility));
      meta.append(node('span','',p.source==='memory'?'memoria ChatGPT':p.source));
      card.append(meta);
      var bottom=node('div','project-bottom');
      bottom.append(node('span','state-'+String(p.status||'unknown'),p.status||'unknown'),node('span','',href?'Apri ↗':'Nessun link'));
      card.append(bottom);
      host.append(card);
    });
  };
}

export async function projectInventoryResponse(db) {
  try {
    const result=await db.prepare(
      "SELECT id,name,kind,status,category AS 'group',repository,url,visibility,source,source_status,observed_at,updated_at "+
      "FROM project_inventory ORDER BY name COLLATE NOCASE"
    ).all();
    const projects=(result.results||[]).map(function(row){
      return {
        id:row.id,name:row.name,kind:row.kind,status:row.status,group:row.group,category:row.group,
        repository:row.repository,url:row.url,visibility:row.visibility,source:row.source,
        source_status:row.source_status,observed_at:row.observed_at,updated_at:row.updated_at,
        label:row.name,pushed_at:null
      };
    });
    return new Response(JSON.stringify({projects}),{
      status:200,
      headers:{'cache-control':'no-store, private','content-type':'application/json; charset=utf-8','x-content-type-options':'nosniff'}
    });
  } catch {
    return new Response(JSON.stringify({error:'Portfolio inventory unavailable'}),{
      status:503,
      headers:{'cache-control':'no-store, private','content-type':'application/json; charset=utf-8','x-content-type-options':'nosniff'}
    });
  }
}

export function injectPortfolio(html) {
  const start='<section class="view" id="view-studio" data-page="studio" hidden>';
  const next='<section class="view" id="view-mente" data-page="mente" hidden>';
  const i=html.indexOf(start),j=html.indexOf(next,i);
  if(i<0||j<0)throw new Error('Studio anchors not found');
  html=html.slice(0,i)+STUDIO+'\n'+html.slice(j);
  html=html.replace('</style>',PORTFOLIO_STYLE+'</style>');
  html=html.replace('init();\n})();','('+installPortfolio.toString()+')();\ninit();\n})();');
  return html;
}
