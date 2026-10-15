// Private AIOS context registry: one source-aware place for remembered/verified operational context.
// No secrets or sensitive personal content belong here.
const CONNECTIONS = [
  '<section class="view" id="view-sistemi" data-page="sistemi" hidden>',
  '<header class="view-head context-head"><div class="eyebrow">CONNESSIONI · REGISTRO PRIVATO</div><h1>Quello che SOLIWKR<br><span style="color:var(--blue)">sa di poter raggiungere.</span></h1><p>Sistemi, runtime e fonti reali. Una cosa ricordata resta visibile ma non viene spacciata per verificata.</p></header>',
  '<div class="context-strip"><span><b id="context-count">—</b> connessioni e runtime</span><span id="context-updated">D1 privato · caricamento…</span></div>',
  '<div class="context-groups" id="context-groups"></div>',
  '<div class="context-legend"><span><i class="context-dot verified"></i> verificato</span><span><i class="context-dot remembered"></i> ricordato</span><span><i class="context-dot check"></i> da verificare</span></div>',
  '</section>'
].join('');

const CONTEXT_STYLE = [
  '.context-head{max-width:860px}',
  '.context-strip{display:flex;justify-content:space-between;gap:14px;align-items:center;padding:13px 0 18px;border-bottom:1px solid var(--line);font-size:10px;color:#819487}',
  '.context-strip b{font-size:13px;color:var(--text)}',
  '.context-groups{display:grid;gap:27px;margin-top:24px}',
  '.context-section h3{font-size:12px;text-transform:uppercase;letter-spacing:.12em;color:#7f9386;margin:0 0 9px}',
  '.context-list{border-top:1px solid var(--line)}',
  '.context-row{display:grid;grid-template-columns:minmax(160px,.9fr) minmax(220px,1.6fr) 110px 92px;gap:14px;align-items:center;min-height:56px;border-bottom:1px solid var(--line);font-size:11px}',
  '.context-name{font-weight:750;color:#dce8df;min-width:0;overflow-wrap:anywhere}',
  '.context-detail{color:#8fa296;min-width:0;overflow-wrap:anywhere}',
  '.context-status{justify-self:end;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:#aab9af}',
  '.context-status.active,.context-status.connected,.context-status.available{color:var(--accent)}',
  '.context-status.needs_verification,.context-status.remembered{color:#d7b17c}',
  '.context-status.planned{color:var(--violet)}',
  '.context-source{justify-self:end;color:#6f8276;font-size:9px;text-transform:uppercase;letter-spacing:.06em}',
  '.context-row a{color:var(--accent);text-decoration:none}',
  '.context-legend{display:flex;gap:16px;flex-wrap:wrap;margin-top:18px;color:#74877a;font-size:9px}',
  '.context-legend span{display:flex;align-items:center;gap:6px}',
  '.context-dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:#7b8c80}',
  '.context-dot.verified{background:var(--accent)}.context-dot.remembered{background:var(--violet)}.context-dot.check{background:#d5ad74}',
  '@media(max-width:760px){.context-strip{flex-direction:column;align-items:flex-start;gap:3px}.context-row{grid-template-columns:1fr auto;gap:5px 12px;padding:12px 0}.context-detail{grid-column:1/3}.context-status{grid-column:1/2;justify-self:start}.context-source{grid-column:2/3;grid-row:3;align-self:center}}'
].join('\n');

function installConnections() {
  var groupNames={connection:'Servizi e account',runtime:'Runtime e compute',source:'Fonti dati',workflow:'Workflow',resource:'Risorse',preference:'Preferenze operative',routine:'Routine',other:'Altro'};
  function sourceLabel(x){
    if(x.source_status==='verified')return 'verificato';
    if(x.source_status==='remembered')return 'ricordato';
    return 'da verificare';
  }
  function safeUrl(value){
    try{var u=new URL(value);return u.protocol==='https:'?u.href:null}catch{return null}
  }
  async function loadConnections(){
    q('context-updated').textContent='D1 privato · verifica in corso…';
    try{
      var r=await fetch('/api/context?destination=connections',{cache:'no-store'});
      if(!r.ok)throw Error('HTTP '+r.status);
      var data=await r.json();
      var items=Array.isArray(data.items)?data.items:[];
      q('context-count').textContent=String(items.length);
      q('context-updated').textContent='Registro privato · '+items.length+' elementi';
      var host=q('context-groups');
      host.replaceChildren();
      var groups={};
      items.forEach(function(x){(groups[x.item_type]||(groups[x.item_type]=[])).push(x)});
      Object.keys(groupNames).forEach(function(kind){
        var list=groups[kind]||[];
        if(!list.length)return;
        var section=node('section','context-section');
        section.append(node('h3','',groupNames[kind]));
        var rows=node('div','context-list');
        list.sort(function(a,b){return String(a.name).localeCompare(String(b.name),'it')});
        list.forEach(function(x){
          var row=node('div','context-row');
          var name=node('div','context-name');
          var href=safeUrl(x.url);
          if(href){var link=node('a','',x.name);link.href=href;link.target='_blank';link.rel='noopener noreferrer';name.append(link)}
          else name.textContent=x.name;
          row.append(name,node('div','context-detail',x.detail||'—'),node('div','context-status '+x.status,x.status.replaceAll('_',' ')),node('div','context-source',sourceLabel(x)));
          rows.append(row);
        });
        section.append(rows);
        host.append(section);
      });
      if(!host.children.length)host.append(node('div','empty','Nessuna connessione registrata.'));
    }catch(e){
      q('context-count').textContent='0';
      q('context-updated').textContent='Registro non verificabile';
      q('context-groups').replaceChildren(node('div','empty','Registro Connessioni non disponibile.'));
    }
  }
  window.addEventListener('hashchange',function(){if(location.hash==='#sistemi')loadConnections()});
  if(location.hash==='#sistemi')loadConnections();
}

const DESTINATIONS=new Set(['studio','connections','brain','rituals','life','atlas']);

export async function contextInventoryResponse(db,destination) {
  if(!DESTINATIONS.has(destination)){
    return new Response(JSON.stringify({error:'Invalid destination'}),{status:400,headers:{'cache-control':'no-store, private','content-type':'application/json; charset=utf-8'}});
  }
  try{
    const result=await db.prepare(
      "SELECT id,destination,item_type,name,status,detail,url,source,source_status,observed_at,updated_at "+
      "FROM context_inventory WHERE destination=? ORDER BY item_type,name COLLATE NOCASE"
    ).bind(destination).all();
    return new Response(JSON.stringify({items:result.results||[]}),{
      status:200,
      headers:{'cache-control':'no-store, private','content-type':'application/json; charset=utf-8','x-content-type-options':'nosniff'}
    });
  }catch{
    return new Response(JSON.stringify({error:'Context inventory unavailable'}),{
      status:503,
      headers:{'cache-control':'no-store, private','content-type':'application/json; charset=utf-8','x-content-type-options':'nosniff'}
    });
  }
}

export function injectConnections(html) {
  const start='<section class="view" id="view-sistemi" data-page="sistemi" hidden>';
  const next='<div class="foot">';
  const i=html.indexOf(start),j=html.indexOf(next,i);
  if(i<0||j<0)throw new Error('Connections anchors not found');
  html=html.slice(0,i)+CONNECTIONS+'\n'+html.slice(j);
  html=html.replace('</style>',CONTEXT_STYLE+'</style>');
  html=html.replace('init();\n})();','('+installConnections.toString()+')();\ninit();\n})();');
  return html;
}
