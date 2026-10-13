// Verified Cloudflare Access JWT; all failures deny access.
// The stage-only diagnostic provides a NON-SENSITIVE reason code, never claims or tokens.
const ALG="RS256";
const JWKS_TTL_MS=5*60*1000;
const MAX_TOKEN_CHARS=16000;
let cachedKeys=null,cachedIssuer=null,cacheUntil=0;

function teamIssuer(env){
  const candidate=env?.ACCESS_TEAM_DOMAIN;
  if(typeof candidate!=="string")return null;
  try{
    const u=new URL(candidate);
    if(u.protocol!=="https:"||!/^[a-z0-9-]+\.cloudflareaccess\.com$/.test(u.hostname)||
      u.port||u.username||u.password||u.pathname!=="/"||u.search||u.hash)return null;
    return u.origin;
  }catch{return null}
}
function decodeBase64url(value){
  if(typeof value!=="string"||!value||!/^[A-Za-z0-9_-]+$/.test(value))throw Error("encoding");
  const raw=atob(value.replace(/-/g,"+").replace(/_/g,"/")+"=".repeat((4-value.length%4)%4));
  return Uint8Array.from(raw,c=>c.charCodeAt(0));
}
function parsePart(value){
  const parsed=JSON.parse(new TextDecoder().decode(decodeBase64url(value)));
  if(!parsed||typeof parsed!=="object"||Array.isArray(parsed))throw Error("invalid JWT part");
  return parsed;
}
function claimStatus(claims,env,now,issuer){
  if(claims.iss!==issuer&&claims.iss!==issuer+"/")return "issuer";
  if(!(claims.aud===env.ACCESS_APP_AUD||(Array.isArray(claims.aud)&&claims.aud.includes(env.ACCESS_APP_AUD))))return "aud";
  if(typeof claims.sub!=="string"||!claims.sub.trim())return "subject";
  if(typeof claims.email!=="string"||claims.email.trim().toLowerCase()!==env.ACCESS_OWNER_EMAIL.trim().toLowerCase())return "owner";
  const time=Math.floor(now/1000);
  if(!Number.isInteger(claims.iat)||claims.iat>time+30||
     !Number.isInteger(claims.exp)||claims.exp<=time||
     (claims.nbf!==undefined&&(!Number.isInteger(claims.nbf)||claims.nbf>time)))return "clock";
  return "ok";
}
function certsError(code){
  // Fixed, non-sensitive classification. Never attach network error body,
  // certificate material, JWT or credentials to the user-facing response.
  const e=new Error("Access certificate lookup failed");
  e.code=code;
  return e;
}
async function publicKeys(issuer,now,fetcher){
  if(cachedKeys&&cachedIssuer===issuer&&now<cacheUntil)return cachedKeys;
  let r;
  try{
    r=await fetcher(issuer+"/cdn-cgi/access/certs",{
      headers:{Accept:"application/json"},
      redirect:"error"
    });
  }catch{
    throw certsError("cert-fetch");
  }
  if(!r||!r.ok)throw certsError("cert-http");
  let body;
  try{body=await r.text();}
  catch{throw certsError("cert-body")}
  if(body.length>120000)throw certsError("cert-size");
  let json;
  try{json=JSON.parse(body)}
  catch{throw certsError("cert-json")}
  if(!Array.isArray(json.keys)||json.keys.length>25)throw certsError("cert-schema");
  const keys=json.keys.filter(k=>k&&k.kty==="RSA"&&typeof k.kid==="string"&&
    typeof k.n==="string"&&typeof k.e==="string"&&
    (k.use===undefined||k.use==="sig")&&(k.alg===undefined||k.alg===ALG));
  if(!keys.length)throw certsError("cert-keys");
  cachedKeys=keys;cachedIssuer=issuer;cacheUntil=now+JWKS_TTL_MS;
  return keys;
}
/** Error codes are coarse, safe for authenticated staging diagnosis. */
export async function evaluateAccessRequest(request,env,fetcher=fetch,now=Date.now()){
  const issuer=teamIssuer(env);
  if(!issuer||!/^[0-9a-f]{64}$/i.test(env?.ACCESS_APP_AUD||"")||
     typeof env.ACCESS_OWNER_EMAIL!=="string"||!env.ACCESS_OWNER_EMAIL.includes("@"))
    return {ok:false,code:"configuration"};
  const token=request.headers.get("cf-access-jwt-assertion");
  if(!token||token.length>MAX_TOKEN_CHARS)return {ok:false,code:"no-assertion"};
  const pieces=token.split(".");
  if(pieces.length!==3)return {ok:false,code:"format"};
  let header,claims;
  try{header=parsePart(pieces[0]);claims=parsePart(pieces[1]);}
  catch{return {ok:false,code:"format"}}
  if(header.alg!==ALG||typeof header.kid!=="string"||!header.kid)return{ok:false,code:"algorithm"};
  const status=claimStatus(claims,env,now,issuer);
  if(status!=="ok")return {ok:false,code:status};
  let keys;
  try{keys=await publicKeys(issuer,now,fetcher);}
  catch(e){return {ok:false,code:e.code||"certificates"}}
  let key=keys.find(k=>k.kid===header.kid);
  if(!key){
    cacheUntil=0;
    try{keys=await publicKeys(issuer,now,fetcher);key=keys.find(k=>k.kid===header.kid);}
    catch(e){return{ok:false,code:e.code||"certificates"}}
  }
  if(!key)return{ok:false,code:"signing-key"};
  try{
    const pub=await crypto.subtle.importKey("jwk",key,{name:"RSASSA-PKCS1-v1_5",hash:"SHA-256"},false,["verify"]);
    const signed=new TextEncoder().encode(pieces[0]+"."+pieces[1]);
    const verified=await crypto.subtle.verify("RSASSA-PKCS1-v1_5",pub,decodeBase64url(pieces[2]),signed);
    return verified?{ok:true,code:"ok"}:{ok:false,code:"signature"};
  }catch{return {ok:false,code:"signature"}}
}
export async function verifyAccessRequest(request,env,fetcher=fetch,now=Date.now()){
  return (await evaluateAccessRequest(request,env,fetcher,now)).ok;
}
