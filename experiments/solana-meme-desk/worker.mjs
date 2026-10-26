import {inspectPumpSwapPool} from './pumpswap-pool.mjs';
import {boundedOneHourTurnover} from './pumpswap-volume.mjs';
import {indicativeSolUsd,pumpSwapFeeFloor,inspectToken2022Mint,convertNativeQuoteToUsd} from './pumpswap-quality.mjs';
// SOLIWKR MEME DESK — PAPER MODE ONLY — independent Cloudflare Worker.
// NO PRIVATE KEY. NO REAL EXECUTION PATH. All validation fails closed.
const DASHBOARD="<!doctype html>\n<html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><meta name=\"theme-color\" content=\"#080d15\"><title>SOLIWKR // Solana Desk</title><style>\n:root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,sans-serif;color:#e4edf5;background:#080d15;font-size:14px}*{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 80% -10%,#153d3c 0,transparent 35%),#080d15}header{padding:22px 4vw;border-bottom:1px solid #25313e;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}.brand{font-weight:800;letter-spacing:.17em;font-size:13px}.brand b{color:#55efc4}.status{color:#74e1c5;border:1px solid #306653;background:#0c3129;border-radius:30px;padding:8px 12px;font-size:11px;letter-spacing:.12em}main{max-width:1500px;padding:24px 4vw 70px;margin:auto}h1{font-size:30px;letter-spacing:-.05em;margin:6px 0 5px;font-weight:750}h2{font-size:12px;text-transform:uppercase;color:#a5b8cd;letter-spacing:.14em;font-weight:700;margin:0 0 18px}.sub{color:#859ab0;font-size:12px;margin-bottom:25px}.stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:13px}.panel,.stat{border:1px solid #273545;background:#0e1723e8;border-radius:13px;padding:19px;min-width:0}.stat .label{font-size:11px;color:#8ca4ba;letter-spacing:.12em;text-transform:uppercase}.big{font-size:30px;font-weight:730;letter-spacing:-.05em;margin-top:10px}.small{font-size:11px;color:#91aac0;margin-top:6px}.green{color:#52e1b7}.red{color:#fa8b95}.amber{color:#f2c078}.layout{display:grid;grid-template-columns:1.6fr 1fr;gap:14px;margin-top:14px}.chart{height:270px;width:100%;display:block}svg{width:100%;height:100%;overflow:visible}.agents{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}.agent{border:1px solid #273545;background:#111f2c;border-radius:9px;padding:12px}.agent strong{font-size:13px}.agent .dot{height:7px;width:7px;border-radius:50%;display:inline-block;background:#46dfb3;margin-right:7px;box-shadow:0 0 8px #46dfb355}.agent p{font-size:11px;color:#8199af;min-height:25px;margin-bottom:0;line-height:1.5}.logs{max-height:325px;overflow:auto}.event{padding:10px 2px;border-bottom:1px solid #223140;display:grid;grid-template-columns:70px 82px 1fr;gap:8px;align-items:start;font-size:11px}.event .time,.event .tag{color:#849caf;font-variant-numeric:tabular-nums}.reason{overflow-wrap:anywhere;line-height:1.4}.table{width:100%;border-collapse:collapse;font-size:12px;table-layout:fixed}.table th{text-align:left;color:#7f95aa;letter-spacing:.08em;font-size:10px;padding:9px;border-bottom:1px solid #283747}.table td{padding:11px 9px;border-bottom:1px solid #22303d;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.foot{margin-top:20px;color:#6f869b;font-size:11px;line-height:1.7}.pill{font-size:10px;color:#76dfc4;border:1px solid #346a59;padding:4px 8px;border-radius:20px}a{color:#79d9ca}code{font-size:11px;color:#9ad7ce}@media(max-width:800px){.stats{grid-template-columns:repeat(2,1fr)}.layout{grid-template-columns:1fr}.agents{grid-template-columns:repeat(2,1fr)}.big{font-size:25px}.event{grid-template-columns:60px 70px 1fr}.chart{height:210px}}</style></head>\n<body><header><div class=\"brand\"><b>◉</b> SOLIWKR <span style=\"color:#73899c\">/</span> MEME DESK</div><div class=\"status\" id=\"system\">● INITIALIZING · PAPER ONLY</div></header><main><h1>Autonomous trading desk</h1><div class=\"sub\">SOLANA MAINNET INTELLIGENCE · VIRTUAL FUNDS ONLY · 1-MINUTE SCHEDULE · FAIL-CLOSED</div><section class=\"stats\"><div class=\"stat\"><div class=\"label\">Total equity</div><div id=\"equity\" class=\"big\">$—</div><div class=\"small\" id=\"pnl\">Starting capital $1,000</div></div><div class=\"stat\"><div class=\"label\">Available cash</div><div id=\"cash\" class=\"big\">$—</div><div class=\"small\">Paper USD · not a wallet</div></div><div class=\"stat\"><div class=\"label\">Open exposure</div><div id=\"exposure\" class=\"big\">$—</div><div class=\"small\" id=\"positionsCount\">— positions</div></div><div class=\"stat\"><div class=\"label\">Screened / rejected</div><div id=\"screened\" class=\"big\">—</div><div class=\"small\" id=\"rejections\">Awaiting scanner</div></div></section>\n<div class=\"layout\"><section class=\"panel\"><h2>Equity curve · recorded snapshots</h2><svg class=\"chart\" viewBox=\"0 0 700 250\" preserveAspectRatio=\"none\" id=\"curve\"><text x=\"20\" y=\"130\" fill=\"#688096\" font-size=\"14\">No equity samples yet</text></svg><div class=\"small\" id=\"curveInfo\">No synthetic performance data</div></section><section class=\"panel\"><h2>6-agent status</h2><div class=\"agents\" id=\"agents\"></div><div class=\"small\" id=\"cycleInfo\" style=\"margin-top:15px\">Awaiting first scheduled cycle</div></section></div>\n<div class=\"layout\"><section class=\"panel\"><h2>Decision log · all rejects and trade reasons</h2><div class=\"logs\" id=\"log\"><div class=\"small\">No events recorded</div></div></section><section class=\"panel\"><h2>Positions & execution audit</h2><div style=\"overflow:auto\"><table class=\"table\"><thead><tr><th>Asset</th><th>Entry</th><th>Mark</th><th>PnL</th></tr></thead><tbody id=\"pos\"><tr><td colspan=\"4\">No open positions</td></tr></tbody></table></div><h2 style=\"margin-top:30px\">Latest paper trades</h2><div style=\"overflow:auto\"><table class=\"table\"><thead><tr><th>Side</th><th>Asset</th><th>Net</th><th>Reason</th></tr></thead><tbody id=\"trades\"><tr><td colspan=\"4\">No trades</td></tr></tbody></table></div></section></div>\n<div class=\"foot\">Safety rules: mint + freeze authority disabled · LP lock/burn proven for the actual pool · top-10 concentration ≤25% · 1h volume ≥$40k · max position size 10% equity · 8% stop trigger · trail activation at +15% · fail closed on missing data. Poll-based simulation is not tick-level execution; prices, slippage and pool exits may differ sharply from real trading.<div>Raw report: <a href=\"/api/recap\">/api/recap</a> · Data endpoint: <a href=\"/api/state\">/api/state</a> · No wallet, keys or swap transaction capabilities in this deployment.</div></div></main>\n<script>\nconst $=s=>document.getElementById(s),usd=v=>'$'+Number(v||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}),pct=v=>(v>=0?'+':'')+Number(v||0).toFixed(2)+'%',esc=s=>String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c])),tm=x=>x?new Date(x+'Z'.replace('ZZ','Z')).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',second:'2-digit',timeZone:'UTC'}):'—';\nfunction draw(points){const svg=$('curve');if(!points.length)return;const a=points.map(x=>Number(x.equity));let lo=Math.min(...a),hi=Math.max(...a);const pad=Math.max(4,(hi-lo)*.18);lo-=pad;hi+=pad;const coords=a.map((v,i)=>[18+i*(664/Math.max(1,a.length-1)),225-(v-lo)/(hi-lo)*195]);let p=coords.map((q,i)=>(i?'L':'M')+q[0].toFixed(2)+' '+q[1].toFixed(2)).join(' ');let area=p+' L '+coords[coords.length-1][0]+' 225 L18 225 Z';svg.innerHTML='<defs><linearGradient id=\"fill\" x1=\"0\" x2=\"0\" y1=\"0\" y2=\"1\"><stop stop-color=\"#47e2b5\" stop-opacity=\".28\"/><stop offset=\"1\" stop-color=\"#47e2b5\" stop-opacity=\".01\"/></linearGradient></defs><path d=\"'+area+'\" fill=\"url(#fill)\"/><path d=\"'+p+'\" fill=\"none\" stroke=\"#54e5bd\" stroke-width=\"2.5\"/><text x=\"18\" y=\"18\" fill=\"#8aa5b8\" font-size=\"12\">'+usd(hi)+'</text><text x=\"18\" y=\"245\" fill=\"#8aa5b8\" font-size=\"12\">'+usd(lo)+'</text>'; $('curveInfo').textContent=points.length+' actual snapshots · last '+String(points[points.length-1].ts);}\nasync function update(){try{const res=await fetch('/api/state',{cache:'no-store'});if(!res.ok)throw Error('HTTP '+res.status);const d=await res.json();const eq=Number(d.equity);$('system').textContent='● '+(d.state?.paused?'HALTED':(d.state?.feed_health||'UNVERIFIED'))+' · PAPER ONLY';$('equity').textContent=d.pricesFresh?usd(eq):'UNAVAILABLE';$('cash').textContent=usd(d.state?.cash);$('exposure').textContent=d.pricesFresh?usd(d.exposure):'STALE';$('positionsCount').textContent=(d.positions||[]).length+' position(s)';const p=eq-Number(d.state?.initial||1000);$('pnl').textContent=d.pricesFresh?(pct(p/Number(d.state?.initial||1000)*100)+' · '+usd(p)+' simulated PnL'):'Cannot value position: last quote is stale';$('pnl').className='small '+(p>=0?'green':'red');$('screened').textContent=Number(d.counts?.screened||0).toLocaleString();$('rejections').textContent=Number(d.counts?.rejected||0)+' rejected / '+Number(d.counts?.data_errors||0)+' data errors / '+Number(d.counts?.trades||0)+' trades';$('cycleInfo').textContent='Cycles: '+d.state.cycles+' · last run '+(d.state.last_cycle||'none')+(d.state.last_error?' · last error: '+d.state.last_error:'');draw(d.equityPoints||[]);if(!d.pricesFresh){$('curveInfo').textContent='STALE: curve contains old quotes; current equity cannot be verified';}const agents=['Scout','Filter','Analyst','Executor','Risk','Logger'];$('agents').innerHTML=agents.map(n=>{const e=(d.events||[]).find(x=>x.agent===n);return '<div class=\"agent\"><strong><span class=\"dot\"></span>'+n+'</strong><p>'+(e?esc(e.kind+' · '+e.reason).slice(0,125):'Idle / awaiting data')+'</p></div>'}).join('');$('log').innerHTML=(d.events||[]).map(e=>'<div class=\"event\"><span class=\"time\">'+esc((e.ts||'').slice(11,19))+'</span><span class=\"tag\">'+esc(e.agent)+'</span><span class=\"reason\">'+esc(e.kind)+': '+esc(e.reason)+(e.symbol?' · '+esc(e.symbol):'')+'</span></div>').join('')||'<div class=\"small\">No events yet</div>';$('pos').innerHTML=(d.positions||[]).map(x=>{let gain=(Number(x.mark||x.entry)*Number(x.units)-Number(x.cost))/Number(x.cost)*100;return '<tr><td>'+esc(x.symbol)+'</td><td>'+usd(x.entry)+'</td><td>'+usd(x.mark||x.entry)+'</td><td class=\"'+(gain>=0?'green':'red')+'\">'+pct(gain)+'</td></tr>'}).join('')||'<tr><td colspan=\"4\">No open positions</td></tr>';$('trades').innerHTML=(d.trades||[]).slice(0,10).map(x=>'<tr><td class=\"'+(x.side==='BUY'?'green':'amber')+'\">'+esc(x.side)+'</td><td>'+esc(x.symbol)+'</td><td>'+usd(x.net)+'</td><td title=\"'+esc(x.reason)+'\">'+esc(x.reason)+'</td></tr>').join('')||'<tr><td colspan=\"4\">No trades</td></tr>';}catch(e){$('system').textContent='● DATA OFFLINE / PAPER ONLY';$('cycleInfo').textContent=String(e)}}\nupdate();setInterval(update,20000);\n</script></body></html>";
const CFG={initial:1000,maxTrade:0.10,maxExposure:0.20,maxPositions:2,stopLoss:0.08,trailActivation:0.15,trailingGap:0.08,maxTop10Pct:25,minH1Volume:40000,minLiquidity:10000,entryFriction:0.01,exitFriction:0.01,scanPerCycle:9};
const agents=['Scout','Filter','Analyst','Executor','Risk','Logger'];
const now=()=>new Date().toISOString();
const qs=(s)=>String(s||'').slice(0,500);
const fin=n=>Number.isFinite(Number(n))?Number(n):NaN;
const usdN=n=>Math.round(Number(n)*1e8)/1e8;
async function sql(env,query,...params){return env.DB.prepare(query).bind(...params).all()}
async function first(env,query,...params){return env.DB.prepare(query).bind(...params).first()}
async function event(env,agent,kind,mint,symbol,reason,detail){await env.DB.prepare('INSERT INTO events(ts,agent,kind,mint,symbol,reason,detail) VALUES(?,?,?,?,?,?,?)').bind(now(),agent,kind,mint||null,symbol||null,qs(reason),detail?JSON.stringify(detail).slice(0,6000):null).run()}
async function readJson(url,options){const r=await fetch(url,{...options,signal:AbortSignal.timeout(11000),headers:{'accept':'application/json',...(options?.headers||{})}});if(!r.ok)throw Error('SOURCE_HTTP_'+r.status+' '+new URL(url).hostname);return r.json()}
function poolAddr(s){return String(s||'').replace(/^solana_/,'')}
function mintAddr(s){return String(s||'').replace(/^solana_/,'')}
function goodAddress(s){return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(s)}
const QUOTE=new Set(['So11111111111111111111111111111111111111112','EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v','Es9vMFrzaCERURFykUWrW7Gziydn5uuZeZvVDjjZS4u']);
// Source-health ledger: avoid retry storms and never treat a limited discovery sample as exhaustive.
async function sourcePull(env,name,loader){
 const status=await first(env,'SELECT blocked_until FROM scout_sources WHERE source=?',name);
 if(status?.blocked_until&&Date.parse(status.blocked_until)>Date.now())return {ok:false,skipped:true,error:'COOLDOWN_ACTIVE',data:[]};
 try{
  const data=await loader();
  if(!Array.isArray(data))throw Error('INVALID_PROVIDER_SHAPE');
  await env.DB.prepare("INSERT INTO scout_sources(source,last_checked,last_success,last_error,blocked_until,error_count,ok_count,last_count) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(source) DO UPDATE SET last_checked=excluded.last_checked,last_success=excluded.last_success,last_error=NULL,blocked_until=NULL,ok_count=scout_sources.ok_count+1,last_count=excluded.last_count")
  .bind(name,now(),now(),null,null,0,1,data.length).run();
  return {ok:true,skipped:false,error:null,data};
 }catch(e){
  const err=qs(e.message);
  const hold=err.includes('HTTP_429')?30*60*1000:5*60*1000;
  await env.DB.prepare("INSERT INTO scout_sources(source,last_checked,last_error,blocked_until,error_count,ok_count,last_count) VALUES(?,?,?,?,?,?,?) ON CONFLICT(source) DO UPDATE SET last_checked=excluded.last_checked,last_error=excluded.last_error,blocked_until=excluded.blocked_until,error_count=scout_sources.error_count+1,last_count=0")
   .bind(name,now(),err,new Date(Date.now()+hold).toISOString(),1,0,0).run();
  return {ok:false,skipped:false,error:err,data:[]};
 }
}
function recentlyOpened(value){
 const stamp=typeof value==='number'||/^[0-9]+$/.test(String(value||''))?Number(value)*1000:Date.parse(String(value||''));
 return Number.isFinite(stamp)&&stamp<=Date.now()+60*1000&&Date.now()-stamp<=30*60*1000?new Date(stamp).toISOString():null;
}
function parseRaydiumPools(payload){
 if(payload?.success!==true||!Array.isArray(payload?.data?.data))throw Error('RAYDIUM_RESPONSE_UNVERIFIABLE');
 const found=[];
 for(const p of payload.data.data){
  const opened=recentlyOpened(p.openTime),pool=p.id;
  const firstMint=p.mintA?.address,secondMint=p.mintB?.address;
  if(!opened||!goodAddress(pool)||!goodAddress(firstMint)||!goodAddress(secondMint))continue;
  const base=QUOTE.has(firstMint)?secondMint:firstMint;
  if(QUOTE.has(base)||!goodAddress(base))continue;
  found.push({pool,mint:base,symbol:String(firstMint===base?p.mintA?.symbol:p.mintB?.symbol||base.slice(0,8)).slice(0,45),dex:'raydium',created:opened,volume:NaN,price:NaN});
 }
 return found;
}
// Anonymous snapshot source, discoveredAt is the time the provider found a pool,
// NOT verified on-chain creation time. Every candidate still needs all mandatory gates.
function parseVenumNewPools(payload){
 if(!payload||!Array.isArray(payload.pools))throw Error('VENUM_BAD_NEW_POOLS_RESPONSE');
 const out=new Map();
 for(const p of payload.pools){
  const pool=p?.address,mA=p?.mintA,mB=p?.mintB,dex=String(p?.dex||'').toLowerCase();
  if(!/(raydium|pumpswap|pump-swap|pump_swap)/.test(dex))continue;
  if(!goodAddress(pool)||!goodAddress(mA)||!goodAddress(mB))continue;
  const mint=QUOTE.has(mA)?mB:mA;
  if(QUOTE.has(mint)||!goodAddress(mint))continue;
  const raw=Number(p.discoveredAt);
  const seconds=raw>=1e12?raw/1000:raw;
  const seen=recentlyOpened(seconds);
  if(!seen)continue;
  const symbol=mint===mA?p.symbolA:p.symbolB;
  out.set(pool,{pool,mint,symbol:String(symbol||mint.slice(0,7)).slice(0,45),dex,created:seen,
   volume:NaN,price:NaN,discoveryKind:'PROVIDER_DISCOVERED_AT_NOT_POOL_CREATED_AT'});
 }
 return [...out.values()];
}
async function scoutVenumNewPools(){
 const result=await readJson('https://api.venum.dev/v1/pools/new?limit=200');
 return parseVenumNewPools(result);
}
async function scoutRaydiumFeed(){
 const payload=await readJson('https://api-v3.raydium.io/pools/info/list?poolType=standard&poolSortField=apr24h&sortType=desc&pageSize=100&page=1');
 return parseRaydiumPools(payload);
}
// Volume-ranked Raydium pools are another incomplete sample, not a new-pool feed.
async function scoutRaydiumVolumeFeed(){
 const payload=await readJson('https://api-v3.raydium.io/pools/info/list?poolType=standard&poolSortField=volume24h&sortType=desc&pageSize=500&page=1');
 return parseRaydiumPools(payload);
}
async function scoutGeckoFeed(){
 const payload=await readJson('https://api.geckoterminal.com/api/v2/networks/solana/new_pools?page=1&include=base_token,quote_token,dex');
 if(!Array.isArray(payload?.data))throw Error('GECKO_RESPONSE_UNVERIFIABLE');
 const found=[];
 for(const x of payload.data){
  const dex=String(x.relationships?.dex?.data?.id||'').toLowerCase();
  if(!/(raydium|pumpswap|pump-swap|pumpfun)/.test(dex))continue;
  const baseMint=mintAddr(x.relationships?.base_token?.data?.id),quoteMint=mintAddr(x.relationships?.quote_token?.data?.id);
  const mint=QUOTE.has(baseMint)?quoteMint:baseMint,pool=poolAddr(x.id),created=recentlyOpened(x.attributes?.pool_created_at);
  if(!created||!goodAddress(mint)||!goodAddress(pool)||QUOTE.has(mint))continue;
  found.push({pool,mint,dex,created,symbol:String(x.attributes?.name||mint.slice(0,8)).slice(0,45),volume:NaN,price:NaN});
 }
 return found;
}
async function scoutDexSample(){
 const p=await Promise.allSettled([readJson('https://api.dexscreener.com/token-profiles/latest/v1'),readJson('https://api.dexscreener.com/token-boosts/latest/v1')]);
 const mints=new Set(); for(const x of p){if(x.status!=='fulfilled'||!Array.isArray(x.value))continue;for(const y of x.value){if(y.chainId==='solana'&&goodAddress(y.tokenAddress)&&!QUOTE.has(y.tokenAddress))mints.add(y.tokenAddress);if(mints.size>=30)break;}}
 if(!mints.size)throw Error('DEX_PROFILE_SOURCE_EMPTY_OR_RATE_LIMITED');
 const pairs=await readJson('https://api.dexscreener.com/tokens/v1/solana/'+[...mints].join(','));
 if(!Array.isArray(pairs))throw Error('DEX_PAIRS_BAD_SHAPE');
 return pairs.filter(x=>x.chainId==='solana'&&/(raydium|pumpswap|pumpfun)/i.test(x.dexId||'')&&recentlyOpened(Number(x.pairCreatedAt||0)/1000)&&goodAddress(x.pairAddress)&&goodAddress(x.baseToken?.address)&&!QUOTE.has(x.baseToken.address)).map(x=>({
  pool:x.pairAddress,mint:x.baseToken.address,dex:String(x.dexId).toLowerCase(),symbol:String(x.baseToken.symbol||'UNKNOWN').slice(0,45),created:recentlyOpened(Number(x.pairCreatedAt)/1000),volume:NaN,price:NaN}));
}
async function scout(env){
 const providers=[
  ['VENUM_NEW_POOL_SNAPSHOT',scoutVenumNewPools],
  ['RAYDIUM_APR_SAMPLE',scoutRaydiumFeed],
  ['RAYDIUM_VOLUME_SAMPLE',scoutRaydiumVolumeFeed],
  ['GECKO_NEW_POOLS_PAGE1',scoutGeckoFeed]
 ];
 const outcomes=[];
 for(const [name,loader] of providers){
  const r=await sourcePull(env,name,loader);
  outcomes.push({name,ok:r.ok,skipped:r.skipped,count:r.data.length,error:r.error,data:r.data});
 }
 if(outcomes.reduce((sum,x)=>sum+x.count,0)<3){
  const f=await sourcePull(env,'DEX_PROMOTED_SAMPLE',scoutDexSample);
  outcomes.push({name:'DEX_PROMOTED_SAMPLE',ok:f.ok,skipped:f.skipped,count:f.data.length,error:f.error,data:f.data});
 }
 const pools=new Map();
 for(const x of outcomes)for(const y of x.data){if(!pools.has(y.pool))pools.set(y.pool,y)}
 const hasPrimary=outcomes.some(x=>['VENUM_NEW_POOL_SNAPSHOT','GECKO_NEW_POOLS_PAGE1'].includes(x.name)&&x.ok);
 const anySucceeded=outcomes.some(x=>x.ok);
 const status=!anySucceeded?'BLOCKED':hasPrimary?'PARTIAL_COVERAGE':'DEGRADED';
 const errors=outcomes.filter(x=>!x.ok).map(x=>x.name+':'+x.error);
 await env.DB.prepare('UPDATE state SET feed_health=?,last_error=?,last_feed_ok=CASE WHEN ? THEN ? ELSE last_feed_ok END WHERE id=1')
   .bind(status,errors.length?errors.join(' | ').slice(0,450):null,anySucceeded?1:0,now()).run();
 await event(env,'Scout','SOURCE_STATUS',null,null,'Discovery '+status+' · '+pools.size+' new candidate pool(s); all feeds are samples',
   {sources:outcomes.map(({name,ok,skipped,count,error})=>({name,ok,skipped,count,error})),coverage:'NON_EXHAUSTIVE'});
 return [...pools.values()];
}
function exactPoolMarket(c,pairs){
 if(!Array.isArray(pairs))throw Error('DEX_PAIRS_INVALID');
 const p=pairs.find(p=>p.pairAddress===c.pool&&p.chainId==='solana');
 if(!p)throw Error('EXACT_POOL_NOT_LISTED');
 if(p.baseToken?.address!==c.mint)throw Error('BASE_ASSET_PRICE_AMBIGUOUS');
 return {price:fin(p.priceUsd),volume:fin(p.volume?.h1),liquidity:fin(p.liquidity?.usd),pair:p,dex:p.dexId};
}
async function market(env,c){
 const pairs=await readJson('https://api.dexscreener.com/token-pairs/v1/solana/'+encodeURIComponent(c.mint));
 return exactPoolMarket(c,pairs);
}
async function batchMarket(pools){
 const mints=[...new Set(pools.map(c=>c.mint).filter(goodAddress))].slice(0,30);
 if(!mints.length)return {mints:new Set(),pairs:[]};
 const pairs=await readJson('https://api.dexscreener.com/tokens/v1/solana/'+mints.join(','));
 if(!Array.isArray(pairs))throw Error('DEX_BATCH_RESPONSE_INVALID');
 return {mints:new Set(mints),pairs};
}
async function markForRisk(env,c){
  let errors=[];
  try{return {...await market(env,c),source:'DEXSCREENER_EXACT_POOL'}}catch(e){errors.push('DEX:'+qs(e.message))}
  try{
    const r=await readJson('https://api.geckoterminal.com/api/v2/networks/solana/pools/'+encodeURIComponent(c.pool));
    const base=String(r?.data?.relationships?.base_token?.data?.id||'').replace(/^solana_/,'');
    const quote=String(r?.data?.relationships?.quote_token?.data?.id||'').replace(/^solana_/,'');
    const a=r?.data?.attributes||{};
    if(base!==c.mint&&quote!==c.mint)throw Error('GECKO_MINT_PAIR_MISMATCH');
    const price=fin(base===c.mint?a.base_token_price_usd:a.quote_token_price_usd);
    if(!Number.isFinite(price)||price<=0)throw Error('GECKO_NO_VERIFIABLE_PRICE');
    await event(env,'Risk','PRICE_FALLBACK',c.mint,c.symbol,'GeckoTerminal exact-pool price, DexScreener unavailable',{errors});
    return {price,liquidity:fin(a.reserve_in_usd),source:'GECKOTERMINAL_EXACT_POOL'};
  }catch(e){errors.push('GECKO:'+qs(e.message))}
  try{
    const asset=await heliusRpc(env,'getAsset',{id:c.mint,displayOptions:{showFungible:true}});
    const val=asset?.result?.token_info?.price_info;
    const currency=String(val?.currency||'').toUpperCase();
    const price=fin(val?.price_per_token);
    if(asset?.result?.id!==c.mint||!['USD','USDC'].includes(currency)||!Number.isFinite(price)||price<=0)throw Error('HELIUS_USD_PRICE_NOT_VERIFIED');
    await event(env,'Risk','PRICE_FALLBACK',c.mint,c.symbol,'Helius token indicative USD valuation; NOT exact pool executable price',{errors});
    return {price,source:'HELIUS_DAS_INDICATIVE'};
  }catch(e){errors.push('HELIUS:'+qs(e.message))}
  try{
    const r=await readJson('https://api.jup.ag/price/v3?ids='+encodeURIComponent(c.mint));
    const price=fin(r?.[c.mint]?.usdPrice);
    if(!Number.isFinite(price)||price<=0)throw Error('JUPITER_PRICE_MISSING_OR_KEY_REQUIRED');
    await event(env,'Risk','PRICE_FALLBACK',c.mint,c.symbol,'Jupiter aggregate mint price; NOT exact-pool execution quote',{errors});
    return {price,source:'JUPITER_AGGREGATE_INDICATIVE'};
  }catch(e){errors.push('JUPITER:'+qs(e.message))}
  throw Error('ALL_RISK_PRICE_FEEDS_FAILED: '+errors.map(qs).join(' | ').slice(0,320));
}
async function heliusRpc(env,method,params){
 if(!env.HELIUS_API_KEY)throw Error('HELIUS_SECRET_NOT_CONFIGURED');
 const r=await readJson('https://mainnet.helius-rpc.com/?api-key='+encodeURIComponent(env.HELIUS_API_KEY),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params})});
 if(r?.error)throw Error('HELIUS_RPC_ERROR_'+String(r.error.code??'unknown'));
 return r;
}
async function mintInfo(env,c){
 const r=await heliusRpc(env,'getAccountInfo',[c.mint,{encoding:'jsonParsed',commitment:'confirmed'}]);
 const d=r?.result?.value?.data?.parsed;
 if(d?.type!=='mint'||!d?.info||!Object.prototype.hasOwnProperty.call(d.info,'mintAuthority')||!Object.prototype.hasOwnProperty.call(d.info,'freezeAuthority'))throw Error('HELIUS_MINT_PROOF_MISSING');
 return {mintRevoked:d.info.mintAuthority===null,freezeRevoked:d.info.freezeAuthority===null,decimals:d.info.decimals,supply:d.info.supply,authoritySource:'HELIUS_MAINNET_RPC'};
}
async function rugInfo(c,cachedReport){const r=cachedReport||await readJson('https://api.rugcheck.xyz/v1/tokens/'+encodeURIComponent(c.mint)+'/report');if(!r||!Array.isArray(r.topHolders)||!Array.isArray(r.markets))throw Error('RUGCHECK_EVIDENCE_MISSING');const hs=r.topHolders.slice(0,10);if(!hs.length||hs.some(h=>!Number.isFinite(fin(h.pct))))throw Error('TOP_HOLDER_DATA_MISSING');const top10=hs.reduce((s,h)=>s+Number(h.pct),0);const pool=r.markets.find(m=>[m.pubkey,m.market,m.id,m.address].some(x=>x===c.pool));if(!pool)throw Error('POOL_LP_PROOF_MISSING');const pct=fin(pool.lp?.lpLockedPct??pool.lpLockedPct);if(!Number.isFinite(pct))throw Error('LP_LOCK_PCT_UNVERIFIABLE');return {top10Pct:top10,lpLockedPct:pct,marketId:c.pool,holdersMeasured:hs.length};}
function checklist(mint,mkt,rug){const checks={mintRevoked:mint.mintRevoked,freezeRevoked:mint.freezeRevoked,lpLocked: rug.lpLockedPct>=99,holders: rug.top10Pct<=CFG.maxTop10Pct,volume:mkt.volume>=CFG.minH1Volume};const reasons=Object.entries(checks).filter(([_,v])=>!v).map(([k])=>k);return {pass:reasons.length===0,checks,reasons,mint,rug,volume_h1:mkt.volume}}
async function reject(env,c,who,reason,detail,temporary=false){await env.DB.prepare('UPDATE candidates SET verdict=?,reason=?,audit=?,retry_after=? WHERE pool=?').bind(temporary?'DATA_ERROR':'REJECTED',qs(reason),JSON.stringify(detail||{}).slice(0,6000),temporary?new Date(Date.now()+900000).toISOString():null,c.pool).run();await event(env,who,'REJECT',c.mint,c.symbol,reason,detail)}
function analyst(c,mkt,checks){const issues=[];if(!Number.isFinite(mkt.price)||mkt.price<=0)issues.push('INVALID_PRICE');if(!Number.isFinite(mkt.liquidity)||mkt.liquidity<CFG.minLiquidity)issues.push('LIQUIDITY_LT_10000');if(!checks.pass)issues.push('FILTER_NOT_PASSED');return {pass:issues.length===0,issues,score:Math.round((Math.min(100,mkt.volume/1000)+Math.min(100,mkt.liquidity/1000))/2)}}
async function value(env){const s=await first(env,'SELECT * FROM state WHERE id=1');const p=(await sql(env,'SELECT * FROM positions')).results||[];const exposure=p.reduce((sum,x)=>sum+Number(x.units)*Number(x.mark||x.entry),0);return {state:s,positions:p,exposure,equity:Number(s.cash)+exposure}}
async function executor(env,c,mkt,proof,analysis){if(!proof?.pass||!analysis?.pass)throw Error('EXECUTOR_GATE_REFUSED');const v=await value(env);const s=v.state;if(s.paused||v.equity<CFG.initial*.95){await event(env,'Risk','KILL',c.mint,c.symbol,'System paused or equity drawdown >=5%',{equity:v.equity});return}
if(v.positions.length>=CFG.maxPositions||v.exposure/v.equity>=CFG.maxExposure||v.positions.some(p=>p.mint===c.mint)){await event(env,'Risk','NO_ENTRY',c.mint,c.symbol,'Portfolio exposure/position cap reached');return}
const size=Math.min(v.equity*CFG.maxTrade,v.equity*CFG.maxExposure-v.exposure,Number(s.cash)*0.98);if(size<10){await event(env,'Risk','NO_ENTRY',c.mint,c.symbol,'Size below $10');return}
const units=size/(mkt.price*(1+CFG.entryFriction));const ts=now();await env.DB.batch([
 env.DB.prepare('UPDATE state SET cash=cash-? WHERE id=1 AND cash>=?').bind(size,size),
 env.DB.prepare('INSERT INTO positions(mint,pool,symbol,units,entry,peak,cost,opened_at,mark,quote_ts,mark_source) VALUES(?,?,?,?,?,?,?,?,?,?,?)').bind(c.mint,c.pool,c.symbol,units,mkt.price,mkt.price,size,ts,mkt.price,ts,'DEXSCREENER_EXACT_POOL'),
 env.DB.prepare('INSERT INTO trades(ts,mint,symbol,side,price,units,gross,net,reason,evidence,realized_pnl,fill_quality) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)').bind(ts,c.mint,c.symbol,'BUY',mkt.price,units,size,size,'ALL_FILTERS_PASS + ANALYST_PASS + RISK_AUTHORIZED',JSON.stringify({proof,analysis,slippage:CFG.entryFriction}),null,'PAPER_POOL_MODEL')
]);await event(env,'Executor','BUY',c.mint,c.symbol,'Paper entry '+size.toFixed(2)+' USD; all gates passed',{proof,analysis})}
function exitDecision(position, marketPrice){
 const entry=Number(position.entry),previousPeak=Number(position.peak),price=Number(marketPrice);
 if(!Number.isFinite(entry)||entry<=0||!Number.isFinite(previousPeak)||previousPeak<=0||!Number.isFinite(price)||price<=0)throw Error('INVALID_PAPER_MARK');
 const peak=Math.max(previousPeak,price);
 const trailing=peak>=entry*(1+CFG.trailActivation);
 const stop=trailing?Math.max(entry*(1-CFG.stopLoss),peak*(1-CFG.trailingGap)):entry*(1-CFG.stopLoss);
 return {shouldExit:price<=stop,stop,peak,trailing,reason:trailing?'TRAILING_8PCT_FROM_PEAK_AFTER_15PCT_GAIN':'STOP_LOSS_8PCT_TRIGGER'};
}
function paperRegressions(){
 const base={entry:100,peak:100},tests=[],check=(id,ok)=>{tests.push({id,pass:Boolean(ok)});};
 let d=exitDecision(base,91);check('hard_stop_minus_8',d.shouldExit&&d.stop===92&&!d.trailing);
 d=exitDecision(base,93);check('no_early_stop',!d.shouldExit&&d.stop===92);
 d=exitDecision({entry:100,peak:120},110);check('trailing_exits_after_15_activation',d.shouldExit&&d.trailing&&Math.abs(d.stop-110.4)<0.001);
 d=exitDecision({entry:100,peak:120},114);check('trailing_keeps_winner',!d.shouldExit&&d.trailing);
 d=exitDecision({entry:100,peak:112},114);check('trail_not_premature',!d.shouldExit&&!d.trailing);
 try{exitDecision(base,NaN);check('invalid_price_fail_closed',false)}catch(e){check('invalid_price_fail_closed',e.message==='INVALID_PAPER_MARK')}
 const positive=checklist({mintRevoked:true,freezeRevoked:true},{volume:40000},{lpLockedPct:100,top10Pct:25});
 const negative=checklist({mintRevoked:false,freezeRevoked:true},{volume:39999},{lpLockedPct:90,top10Pct:26});
 check('filter_boundaries',positive.pass&&!negative.pass&&negative.reasons.length===4);
 check('executor_gate_closed',!negative.pass);
 const verdict={passed:tests.every(x=>x.pass),tests,count:tests.length};
 return verdict;
}
async function risk(env){
 const positions=(await sql(env,'SELECT * FROM positions')).results||[];
 const failures=[];
 for(const pos of positions){
  try{
   const mark=await markForRisk(env,pos);
   const d=exitDecision(pos,mark.price);
   const ts=now();
   await env.DB.prepare('UPDATE positions SET peak=?,mark=?,quote_ts=?,mark_source=? WHERE mint=?')
    .bind(d.peak,mark.price,ts,mark.source||'UNKNOWN',pos.mint).run();
   const poolPrice=['DEXSCREENER_EXACT_POOL','GECKOTERMINAL_EXACT_POOL'].includes(mark.source);
   const liquidity=fin(mark.liquidity);
   const notional=Number(pos.units)*mark.price;
   const liquidEnough=Number.isFinite(liquidity)&&liquidity>=CFG.minLiquidity&&notional<=liquidity*0.05;
   if(!poolPrice||!liquidEnough){
    const issue=!poolPrice?'INDICATIVE_ONLY_NOT_EXECUTABLE':'POOL_LIQUIDITY_NOT_VERIFIED';
    failures.push({mint:pos.mint,error:issue,source:mark.source,liquidity:Number.isFinite(liquidity)?liquidity:null});
    await event(env,'Risk',d.shouldExit?'EXIT_SIGNAL_UNFILLED':'MARK_UNVERIFIED',pos.mint,pos.symbol,
     issue+'; keep virtual position open, no invented fill',{source:mark.source,mark:mark.price,stop:d.stop,liquidity:Number.isFinite(liquidity)?liquidity:null});
    continue;
   }
   if(!d.shouldExit)continue;
   const impact=Math.min(0.30,notional/Math.max(liquidity,1)); // conservative liquidity-aware impact approximation
   const friction=Math.min(0.5,CFG.exitFriction+impact);
   const fill=mark.price*(1-friction);
   const realized=pos.units*fill;
   const pnl=realized-Number(pos.cost);
   await env.DB.batch([
     env.DB.prepare('UPDATE state SET cash=cash+? WHERE id=1').bind(realized),
     env.DB.prepare('DELETE FROM positions WHERE mint=?').bind(pos.mint),
     env.DB.prepare('INSERT INTO trades(ts,mint,symbol,side,price,units,gross,net,reason,evidence,realized_pnl,fill_quality) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)')
      .bind(ts,pos.mint,pos.symbol,'SELL',fill,pos.units,pos.units*mark.price,realized,d.reason,
      JSON.stringify({classification:'PAPER_MODEL_ONLY_NOT_EXECUTABLE',poolSource:mark.source,poolMark:mark.price,modelFill:fill,liquidity,impact,friction,stop:d.stop,peak:d.peak}),pnl,'PAPER_POOL_MODEL')
   ]);
   await event(env,'Risk','PAPER_EXIT',pos.mint,pos.symbol,d.reason+' · modeled PnL '+pnl.toFixed(2),
    {mark:mark.price,fill,liquidity,friction,pnl});
  }catch(e){
   failures.push({mint:pos.mint,error:qs(e.message)});
   await event(env,'Risk','DATA_ERROR',pos.mint,pos.symbol,qs(e.message));
  }
 }
 return {ok:failures.length===0,failures,positionsChecked:positions.length};
}
async function snapshot(env){const v=await value(env);await env.DB.prepare('INSERT OR REPLACE INTO equity(ts,equity,cash,exposure,source) VALUES(?,?,?,?,?)').bind(now(),usdN(v.equity),usdN(v.state.cash),usdN(v.exposure),'last_verified_marks_or_entry').run();return v}
async function cycle(env){const start=Date.now();const lock=await env.DB.prepare('UPDATE state SET lease_until=? WHERE id=1 AND lease_until<?').bind(start+55000,start).run();if((lock.meta?.changes||0)!==1)return;try{const s=await first(env,'SELECT * FROM state WHERE id=1');const riskResult=await risk(env);if(!riskResult.ok){await event(env,'Risk','ENTRY_BLOCKED',null,null,'No new entries: unable to monitor existing position prices',riskResult);await env.DB.prepare("UPDATE state SET feed_health='DEGRADED',last_error=?,cycles_degraded=cycles_degraded+1 WHERE id=1").bind('RISK_MARK_UNAVAILABLE').run();return;}if(s.paused){const elapsed=s.last_scout_started?Date.now()-Date.parse(s.last_scout_started):Infinity;if(Number.isFinite(elapsed)&&elapsed<300000)return;await env.DB.prepare('UPDATE state SET last_scout_started=? WHERE id=1').bind(now()).run();try{const sample=await scout(env);await event(env,'Scout','DIAGNOSTIC_ONLY',null,null,'Scanner remains paused; '+sample.length+' pools discovered, zero orders possible',{count:sample.length});}catch(e){await env.DB.prepare("UPDATE state SET feed_health='BLOCKED',last_error=? WHERE id=1").bind(qs(e.message)).run();await event(env,'Scout','DIAGNOSTIC_ERROR',null,null,qs(e.message));}return;}const age=s.last_scout_started?Date.now()-Date.parse(s.last_scout_started):Infinity;if(Number.isFinite(age)&&age<300000)return;await env.DB.prepare('UPDATE state SET last_scout_started=? WHERE id=1').bind(now()).run();const poolList=(await scout(env)).slice(0,30);let handled=0,unverified=0,batch=null,marketBlocked=false;
 for(const c of poolList){if(handled>=CFG.scanPerCycle)break;let candidate=await first(env,'SELECT verdict,retry_after FROM candidates WHERE pool=?',c.pool);if(candidate&&!['DATA_ERROR','PENDING_INDEX'].includes(candidate.verdict))continue;if(candidate?.retry_after&&Date.parse(candidate.retry_after)>Date.now())continue;const age=c.created?Date.now()-Date.parse(c.created):0;if(Number.isFinite(age)&&age>30*60*1000)continue;if(!batch){
   const result=await sourcePull(env,'DEX_MARKET_BATCH',async()=> (await batchMarket(poolList)).pairs);
   if(!result.ok){
    marketBlocked=true;
    await env.DB.prepare("UPDATE state SET feed_health='BLOCKED_MARKET',last_error=? WHERE id=1").bind('DEX_MARKET_BATCH:'+result.error).run();
    await event(env,'Scout','MARKET_SOURCE_BLOCKED',null,null,'Market checks deferred; no new paper entries or candidate data errors',{error:result.error,cooldown:result.skipped,source:'DEX_MARKET_BATCH'});
    break;
   }
   batch={mints:new Set(poolList.map(x=>x.mint)),pairs:result.data};
  }
  handled++;
  await env.DB.prepare('INSERT OR IGNORE INTO candidates(pool,mint,symbol,dex,created_at,seen_at,volume_h1,verdict,reason) VALUES(?,?,?,?,?,?,?,?,?)').bind(c.pool,c.mint,c.symbol,c.dex,c.created,now(),Number.isFinite(c.volume)?c.volume:null,'NEW','DISCOVERED').run();
  await event(env,'Scout','CANDIDATE',c.mint,c.symbol,'New scoped pool '+c.dex,{pool:c.pool});
  try{
   let m;
   try{m=exactPoolMarket(c,batch.pairs)}catch(e){
    if(e.message!=='EXACT_POOL_NOT_LISTED')throw e;
    await env.DB.prepare("UPDATE candidates SET verdict='PENDING_INDEX',reason='EXACT_POOL_NOT_YET_INDEXED',retry_after=? WHERE pool=?").bind(new Date(Date.now()+300000).toISOString(),c.pool).run();
    await event(env,'Filter','PENDING_INDEX',c.mint,c.symbol,'New pool missing from DexScreener index; will retry, never trade',{pool:c.pool});
    continue;
   }
   if(!Number.isFinite(m.volume)||m.volume<CFG.minH1Volume){await reject(env,c,'Filter','VOLUME_H1_LT_40000_OR_UNKNOWN',{volume_h1:m.volume});continue}const {rugReport,...mint}=await mintInfo(env,c);if(!mint.mintRevoked||!mint.freezeRevoked){await reject(env,c,'Filter','MINT_OR_FREEZE_AUTHORITY_ACTIVE',mint);continue}const rug=await rugInfo(c,rugReport);const check=checklist(mint,m,rug);if(!check.pass){await reject(env,c,'Filter',check.reasons.join('|'),check);continue}await event(env,'Filter','PASS',c.mint,c.symbol,'All four mandatory gates passed',{check});const decision=analyst(c,m,check);if(!decision.pass){await reject(env,c,'Analyst',decision.issues.join('|'),{check,decision});continue}await event(env,'Analyst','PASS',c.mint,c.symbol,'Evidence-based score '+decision.score,{analysis:decision});await env.DB.prepare('UPDATE candidates SET verdict=?,reason=?,audit=? WHERE pool=?').bind('ACCEPTED','ALL_GATES_PASS',JSON.stringify({check,decision}).slice(0,6000),c.pool).run();await executor(env,c,m,check,decision);}catch(e){unverified++;await reject(env,c,'Filter','SOURCE_UNVERIFIABLE: '+qs(e.message),{error:String(e.message),pool:c.pool},true);}}if(marketBlocked)return;const current=await first(env,'SELECT feed_health,last_error FROM state WHERE id=1');if(unverified>0){await env.DB.prepare("UPDATE state SET feed_health='DEGRADED',last_error=?,cycles_degraded=cycles_degraded+1 WHERE id=1").bind('Failed required checks for '+unverified+' pool(s); see audit').run();await event(env,'Logger','PARTIAL_CYCLE',null,null,'Attempted '+handled+' candidates; '+unverified+' data errors',{feed:poolList.length,handled,unverified});}else if(current.feed_health!=='SOURCE_UP'){await env.DB.prepare('UPDATE state SET cycles_degraded=cycles_degraded+1 WHERE id=1').run();await event(env,'Logger','DEGRADED_CYCLE',null,null,'Primary discovery unavailable; backup is non-exhaustive',{feed:poolList.length,handled});}else{await event(env,'Logger','CYCLE',null,null,'Checked '+handled+' candidates without source errors',{feed:poolList.length,handled});}}catch(e){await event(env,'Logger','ERROR',null,null,'Cycle error: '+qs(e.message));await env.DB.prepare("UPDATE state SET feed_health='BLOCKED',cycles_degraded=cycles_degraded+1,last_error=? WHERE id=1").bind(qs(e.message)).run()}finally{try{await snapshot(env)}catch(e){await event(env,'Logger','ERROR',null,null,'Equity snapshot failed: '+qs(e.message))}await env.DB.prepare('UPDATE state SET last_cycle=?,cycles=cycles+1,lease_until=0 WHERE id=1').bind(now()).run()}}
async function state(env){const v=await value(env);const stalePositions=v.positions.filter(p=>!p.quote_ts||Date.now()-Date.parse(p.quote_ts)>120000||!Number.isFinite(Date.parse(p.quote_ts))||!['DEXSCREENER_EXACT_POOL','GECKOTERMINAL_EXACT_POOL'].includes(p.mark_source));const pricesFresh=stalePositions.length===0;const events=(await sql(env,'SELECT * FROM events ORDER BY id DESC LIMIT 75')).results||[];const trades=(await sql(env,'SELECT * FROM trades ORDER BY id DESC LIMIT 25')).results||[];const equityPoints=(await sql(env,'SELECT * FROM (SELECT * FROM equity ORDER BY ts DESC LIMIT 250) ORDER BY ts ASC')).results||[];const sources=(await sql(env,'SELECT source,last_checked,last_success,last_error,blocked_until,error_count,ok_count,last_count FROM scout_sources ORDER BY source')).results||[];const counts=await first(env,"SELECT (SELECT count(*) FROM candidates) screened,(SELECT count(*) FROM candidates WHERE verdict='REJECTED') rejected,(SELECT count(*) FROM candidates WHERE verdict='DATA_ERROR') data_errors,(SELECT count(*) FROM trades) trades");return {...v,events,trades,equityPoints,counts,sources,scoutCoverage:'NON_EXHAUSTIVE_SAMPLES',pricesFresh,stalePositions:stalePositions.map(x=>({mint:x.mint,symbol:x.symbol,quote_ts:x.quote_ts})),mode:'PAPER',timestamp:now()}}
async function recap(env){const d=await state(env);const rejectionBreakdown=(await sql(env,"SELECT reason,count(*) n FROM candidates WHERE verdict='REJECTED' GROUP BY reason ORDER BY n DESC LIMIT 30")).results||[];const questionable=(await sql(env,"SELECT id,side,symbol,fill_quality,realized_pnl FROM trades WHERE fill_quality='UNVERIFIED_INDICATIVE_FILL'")).results||[];const recentTrades=(await sql(env,"SELECT * FROM trades WHERE datetime(ts)>=datetime('now','-12 hours') ORDER BY id DESC LIMIT 150")).results||[];const recentEvents=(await sql(env,"SELECT * FROM events WHERE datetime(ts)>=datetime('now','-12 hours') ORDER BY id DESC LIMIT 250")).results||[];return {asOf:now(),windowHours:12,mode:'PAPER',scoutCoverage:d.scoutCoverage,sources:d.sources,qualityFlags:questionable,paperEquityQuality:questionable.length?'CONTAINS_UNVERIFIED_INDICATIVE_FILL':'MODEL_ONLY',initial:d.state.initial,cash:d.state.cash,equity:d.equity,unrealizedExposure:d.exposure,unrealizedAndRealizedPnL:d.pricesFresh?d.equity-d.state.initial:null,valuationStatus:d.pricesFresh?'CURRENT':'STALE_MARKS_UNVERIFIABLE',stalePositions:d.stalePositions,cycles:d.state.cycles,lastCycle:d.state.last_cycle,lastError:d.state.last_error,counts:d.counts,rejectionBreakdown,recentTrades,recentEvents,openPositions:d.positions,warning:'Paper fills are modeled, never executed. Exit signals on Helius/Jupiter indicative prices remain unfilled. Existing historic Ginnan virtual exit relied on an indicative Helius mark, not a pool fill. One-minute polling cannot guarantee an 8% stop.'}}
function response(data){return new Response(JSON.stringify(data),{headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','access-control-allow-origin':'*'}})}
// One-shot, read-only benchmark on an official public PumpSwap sample pool.
// Does not affect the trading decision, scheduler, balances, or entry permissions.
async function onchainProbe(env){
 let created;
 try{
  created=await env.DB.prepare("INSERT OR IGNORE INTO onchain_quote_probes(id,ts,pool,mint,status,evidence) VALUES(2,?,?,?,?,?)")
   .bind(now(),'GseMAnNDvntR5uFePZ51yZBXzNSn7GdFPkfHwfr6d77J',
    '7LSsEoJGhLeZzGvDofTdNg7M3JttxQqGWNLo6vWMpump','RUNNING','Read-only first-principles Helius quote').run();
  if((created.meta?.changes||0)!==1)return;
  try{
   const price=await inspectPumpSwapPool((method,params)=>heliusRpc(env,method,params),
    'GseMAnNDvntR5uFePZ51yZBXzNSn7GdFPkfHwfr6d77J','7LSsEoJGhLeZzGvDofTdNg7M3JttxQqGWNLo6vWMpump');
   await env.DB.prepare("UPDATE onchain_quote_probes SET ts=?,status='PASS',evidence=? WHERE id=2")
    .bind(now(),JSON.stringify(price)).run();
  }catch(e){
   await env.DB.prepare("UPDATE onchain_quote_probes SET ts=?,status='FAIL',evidence=? WHERE id=2")
    .bind(now(),String(e?.message||e).slice(0,600)).run();
  }
 }catch(e){
  // Experimental diagnostics must never prevent a normal paper Cron invocation.
  return;
 }
}
// Separate sample of a recently discovered PumpSwap candidate, still read-only.
async function onchainCandidateProbe(env){
 try{
  const already=await first(env,'SELECT id FROM onchain_quote_probes WHERE id=4');
  if(already)return;
  const c=await first(env,"SELECT pool,mint FROM candidates WHERE lower(dex)='pumpswap' AND LENGTH(mint)>=32 ORDER BY seen_at DESC LIMIT 1");
  if(!c)return;
  const inserted=await env.DB.prepare('INSERT OR IGNORE INTO onchain_quote_probes(id,ts,pool,mint,status,evidence) VALUES(4,?,?,?,?,?)')
   .bind(now(),c.pool,c.mint,'RUNNING','Read-only new-pool spot probe').run();
  if((inserted.meta?.changes||0)!==1)return;
  try{
   const result=await inspectPumpSwapPool((method,params)=>heliusRpc(env,method,params),c.pool,c.mint);
   await env.DB.prepare("UPDATE onchain_quote_probes SET ts=?,status='PASS',evidence=? WHERE id=4")
    .bind(now(),JSON.stringify(result)).run();
  }catch(e){
   await env.DB.prepare("UPDATE onchain_quote_probes SET ts=?,status='FAIL',evidence=? WHERE id=4")
    .bind(now(),String(e.message||e).slice(0,600)).run();
  }
 }catch(e){return}
}
// Single bounded on-chain market-quality probe. Strictly separate from trading.
async function onchainMarketProof(env){
 try{
  const existing=await first(env,'SELECT id FROM onchain_market_probes WHERE id=2');
  if(existing)return;
  const candidate=await first(env,"SELECT pool,mint FROM onchain_quote_probes WHERE id=4 AND status='PASS'");
  if(!candidate)return;
  const x=await env.DB.prepare('INSERT OR IGNORE INTO onchain_market_probes(id,ts,pool,mint,status,evidence) VALUES(2,?,?,?,?,?)')
   .bind(now(),candidate.pool,candidate.mint,'RUNNING','{}').run();
  if((x.meta?.changes||0)!==1)return;
  const rpc=(method,params)=>heliusRpc(env,method,params);
  const measures={spot:null,usd:null,fees:null,extensions:null,hourlyTurnover:null,
   tradingGatePassed:false,mode:'RESEARCH_ONLY',notes:'Never count a sample as verified hourly volume or executable swap quote'};
  try{
   const spot=await inspectPumpSwapPool(rpc,candidate.pool,candidate.mint);
   measures.spot=spot;
   const [usd,fees,extensions,volume]=await Promise.allSettled([
    indicativeSolUsd(rpc,url=>readJson(url)),
    pumpSwapFeeFloor(rpc),
    inspectToken2022Mint(rpc,candidate.mint),
    boundedOneHourTurnover(rpc,spot,{maxTransactions:6,signatureLimit:16})
   ]);
   measures.usd=usd.status==='fulfilled'?{...usd.value,spotUsd:convertNativeQuoteToUsd(spot,usd.value)}:{verified:false,error:qs(usd.reason?.message)};
   measures.fees=fees.status==='fulfilled'?fees.value:{verified:false,error:qs(fees.reason?.message)};
   measures.extensions=extensions.status==='fulfilled'?extensions.value:{audited:false,error:qs(extensions.reason?.message)};
   measures.hourlyTurnover=volume.status==='fulfilled'?volume.value:{verified:false,error:qs(volume.reason?.message),usableForHardVolumeGate:false};
   await env.DB.prepare("UPDATE onchain_market_probes SET ts=?,status='MEASURED_INCOMPLETE',evidence=? WHERE id=2")
    .bind(now(),JSON.stringify(measures)).run();
  }catch(e){
   measures.fatal=qs(e.message);
   await env.DB.prepare("UPDATE onchain_market_probes SET ts=?,status='FAIL',evidence=? WHERE id=2")
    .bind(now(),JSON.stringify(measures)).run();
  }
 }catch(e){return}
}
export default {async fetch(req,env){try{const p=new URL(req.url).pathname;if(p==='/')return new Response(DASHBOARD,{headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-cache','x-content-type-options':'nosniff'}});if(p==='/api/state')return response(await state(env));if(p==='/api/recap')return response(await recap(env));if(p==='/api/selftest')return response({...paperRegressions(),mode:'PAPER',writes:false});if(p==='/api/market-proof'){const r=await first(env,'SELECT id,ts,pool,mint,status,evidence FROM onchain_market_probes ORDER BY id DESC LIMIT 1');return response({mode:'PAPER',scope:'RESEARCH_READ_ONLY_NO_TRADE_DECISIONS',proof:r?{...r,evidence:JSON.parse(r.evidence||'{}')}:null})}if(p==='/api/onchain-proof'){const probe=await first(env,'SELECT id,ts,pool,mint,status,evidence FROM onchain_quote_probes ORDER BY id DESC LIMIT 1');return response({mode:'PAPER',scope:'READ_ONLY_POOL_SPOT_NO_VOLUME',probe:probe||null})}if(p==='/health'){const s=await first(env,'SELECT * FROM state WHERE id=1');let probe=null;if(new URL(req.url).searchParams.get('rpc')==='1'){try{const rpc=await heliusRpc(env,'getSlot',[{commitment:'confirmed'}]);probe={ok:Number.isSafeInteger(rpc?.result)&&rpc.result>0,slot:rpc.result};}catch(e){probe={ok:false,error:qs(e.message)}}}return response({service:'soliwkr-meme-desk',mode:'PAPER',worker:'ready',paused:!!s.paused,feedHealth:s.feed_health,heliusSecretConfigured:!!env.HELIUS_API_KEY,rpc:probe,lastCycle:s.last_cycle,cycles:s.cycles,lastError:s.last_error});}return response({error:'NOT_FOUND',mode:'PAPER'});}catch(e){return new Response(JSON.stringify({error:qs(e.message),mode:'PAPER'}),{status:503,headers:{'content-type':'application/json'}})}},async scheduled(controller,env,ctx){ctx.waitUntil(cycle(env));ctx.waitUntil(onchainProbe(env));ctx.waitUntil(onchainCandidateProbe(env));ctx.waitUntil(onchainMarketProof(env))}};