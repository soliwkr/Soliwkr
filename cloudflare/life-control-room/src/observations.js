// Read-only GitHub source collector for the existing SOLIWKR portfolio.
// Records only public technical events and source pointers; never stores raw payloads.
// NOT a measure of revenue, business success, or personal wellbeing.
const SUPPORTED = new Set(["PushEvent","PullRequestEvent","IssuesEvent","ReleaseEvent","CreateEvent"]);
const MAX_EVENTS_PER_REPO = 6;
const RESPONSE_HEADERS = { "cache-control": "no-store, private", "content-type": "application/json; charset=utf-8" };

function safeText(input,max=150){return typeof input==="string"?input.replace(/[\r\n\t]/g," ").slice(0,max):"";}
function parsedDate(value) {
  if (typeof value!=="string" || value.length>40) return null;
  const date=new Date(value);
  return Number.isFinite(date.getTime())?date.toISOString():null;
}
function gitUrl(candidate,slug) {
  try {
    const u=new URL(candidate);
    if (u.protocol!=="https:" || u.hostname!=="github.com" ||
        !u.pathname.startsWith("/"+slug+"/")) return null;
    return u.href;
  } catch { return null; }
}
export function normalizeGithubEvent(input,slug,label,seenAt) {
  if (!input || !SUPPORTED.has(input.type) || !/^\d{1,24}$/.test(String(input.id||""))) return null;
  const occurred_at=parsedDate(input.created_at);
  if (!occurred_at) return null;
  const p=input.payload||{};
  let url=null,summary="";
  if(input.type==="PushEvent"){
    const head=typeof p.head==="string" && /^[0-9a-f]{7,40}$/i.test(p.head)?p.head:null;
    url=head?"https://github.com/"+slug+"/commit/"+head:null;
    summary="Nuovo push";
  }else if(input.type==="PullRequestEvent"){
    url=gitUrl(p.pull_request?.html_url,slug);
    summary="PR "+safeText(p.action||"aggiornata",40);
    if(p.action==="closed"&&p.pull_request?.merged===true)summary="PR merged";
  }else if(input.type==="IssuesEvent"){
    url=gitUrl(p.issue?.html_url,slug);
    summary="Issue "+safeText(p.action||"aggiornata",40);
  }else if(input.type==="ReleaseEvent"){
    url=gitUrl(p.release?.html_url,slug);
    summary="Release "+safeText(p.action||"pubblicata",40);
  }else if(input.type==="CreateEvent"){
    if(p.ref_type!=="branch"||typeof p.ref!=="string"||p.ref.length>150)return null;
    url="https://github.com/"+slug+"/tree/"+p.ref.split("/").map(encodeURIComponent).join("/");
    summary="Nuovo branch";
  }
  if(!url)return null; // No precise source reference, don't fabricate one.
  return {
    provider:"github",event_id:String(input.id),source_key:slug,
    event_type:input.type,summary:safeText(label+" · "+summary,150),
    occurred_at,observed_at:seenAt,source_url:url
  };
}
const url=slug=>"https://api.github.com/repos/"+slug+"/events?per_page=15";
export async function collectGithubEvents(db,repos,fetcher=fetch,now=new Date(),githubToken=null) {
  const seenAt=now.toISOString();
  const receipts=[];
  for(const [slug,label] of repos){
    // Explicit repo allowlist passed by the canonical portfolio registry.
    if(!/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(slug))continue;
    let status="unknown",seen=0,added=0,code="none";
    try {
      const r=await fetcher(url(slug),{
        headers:{"accept":"application/vnd.github+json","user-agent":"soliwkr-aios-events",...(githubToken?{"authorization":"Bearer "+githubToken}:{})},
        cf:{cacheTtl:0}
      });
      if(!r.ok)throw Error("http_"+r.status);
      const json=await r.json();
      if(!Array.isArray(json)||json.length>100)throw Error("invalid_source");
      for(const event of json){
        const row=normalizeGithubEvent(event,slug,label,seenAt);
        if(!row)continue;
        if(++seen>MAX_EVENTS_PER_REPO)break;
        const result=await db.prepare(
          "INSERT OR IGNORE INTO source_events "+
          "(provider,event_id,source_key,event_type,summary,occurred_at,observed_at,source_url) "+
          "VALUES(?,?,?,?,?,?,?,?)"
        ).bind(row.provider,row.event_id,row.source_key,row.event_type,row.summary,row.occurred_at,row.observed_at,row.source_url).run();
        added+=result.meta?.changes||0;
      }
      status="ok";code="none";
    }catch(e){status="error";code=/^http_\d{3}$/.test(e.message)?e.message:"unavailable";}
    await db.prepare(
      "INSERT INTO source_checks(provider,source_key,checked_at,status,error_code,events_seen) VALUES('github',?,?,?,?,?) "+
      "ON CONFLICT(provider,source_key) DO UPDATE SET checked_at=excluded.checked_at,status=excluded.status,error_code=excluded.error_code,events_seen=excluded.events_seen"
    ).bind(slug,seenAt,status,code,seen).run();
    receipts.push({source:slug,status,added,seen});
  }
  return {sources:receipts.length,new_events:receipts.reduce((sum,x)=>sum+x.added,0),failed:receipts.filter(x=>x.status!=="ok").length};
}

export async function sourceEventResponse(db) {
  try{
    const [history,checks]=await Promise.all([
      db.prepare("SELECT provider,event_id,source_key,event_type,summary,occurred_at,observed_at,source_url FROM source_events ORDER BY occurred_at DESC,event_id DESC LIMIT 25").all(),
      db.prepare("SELECT source_key,checked_at,status,error_code,events_seen FROM source_checks ORDER BY source_key LIMIT 30").all()
    ]);
    return new Response(JSON.stringify({events:history.results||[],sources:checks.results||[]}),{status:200,headers:RESPONSE_HEADERS});
  }catch{
    return new Response(JSON.stringify({error:"Evidence ledger unavailable"}),{status:503,headers:RESPONSE_HEADERS});
  }
}
