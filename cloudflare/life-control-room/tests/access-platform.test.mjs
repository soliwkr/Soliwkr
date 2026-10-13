import test from "node:test";
import assert from "node:assert/strict";
import { evaluatePlatformAccess } from "../src/access-platform.js";
import worker from "../src/index.js";
import { ENV_AUTH, createToken, installJwksFixture } from "./auth-fixture.mjs";

installJwksFixture();
const makeContext=(email=ENV_AUTH.ACCESS_OWNER_EMAIL,aud=ENV_AUTH.ACCESS_APP_AUD)=>({
  access:{aud,getIdentity:async()=>({email})}
});
const makeRequest=(jwt)=>new Request("https://aios.soliwkr.pro/api/health",
  jwt?{headers:{"cf-access-jwt-assertion":jwt}}:{});
const env={...ENV_AUTH,AIOS_HOST:"aios.soliwkr.pro",LIFE_DB:{}};

test("no native Access context is unavailable, never automatically authenticated",async()=>{
  assert.deepEqual(await evaluatePlatformAccess(undefined,ENV_AUTH),
    {available:false,ok:false,code:"platform-unavailable"});
  assert.deepEqual(await evaluatePlatformAccess({},ENV_AUTH),
    {available:false,ok:false,code:"platform-unavailable"});
});
test("real platform-provided audience + verified owner identity is accepted",async()=>{
  assert.deepEqual(await evaluatePlatformAccess(makeContext(),ENV_AUTH),
    {available:true,ok:true,code:"platform"});
  assert.deepEqual(await evaluatePlatformAccess(makeContext(ENV_AUTH.ACCESS_OWNER_EMAIL.toUpperCase()),ENV_AUTH),
    {available:true,ok:true,code:"platform"});
});
test("platform rejects wrong audience, wrong owner, absent identity and unexpected provider failure",async()=>{
  for(const context of [
    makeContext(ENV_AUTH.ACCESS_OWNER_EMAIL,"wrong-aud"),
    makeContext("other@example.test"),
    {access:{aud:ENV_AUTH.ACCESS_APP_AUD,getIdentity:async()=>null}},
    {access:{aud:ENV_AUTH.ACCESS_APP_AUD,getIdentity:async()=>{throw Error("unavailable")}}},
    {access:{aud:ENV_AUTH.ACCESS_APP_AUD}},
  ]){
    const r=await evaluatePlatformAccess(context,ENV_AUTH);
    assert.equal(r.available,true);
    assert.equal(r.ok,false);
  }
});
test("native Access can serve only correctly authenticated owner when explicitly enabled",async()=>{
  const configured={...env,AIOS_PLATFORM_AUTH:"enabled"};
  assert.equal((await worker.fetch(makeRequest(),configured,makeContext())).status,200);
  assert.equal((await worker.fetch(makeRequest(),configured,makeContext("unapproved@example.test"))).status,401);
  assert.equal((await worker.fetch(makeRequest(),configured,makeContext(ENV_AUTH.ACCESS_OWNER_EMAIL,"wrong-aud"))).status,401);
});
test("native mode still enforces signed Access JWT if platform context is unavailable",async()=>{
  const configured={...env,AIOS_PLATFORM_AUTH:"enabled"};
  assert.equal((await worker.fetch(makeRequest(),configured,{})).status,401);
  assert.equal((await worker.fetch(makeRequest(createToken()),configured,{})).status,200);
});
test("observation does not bypass JWT validation even with correct ctx.access",async()=>{
  const configured={...env,AIOS_PLATFORM_AUTH:"observe"};
  assert.equal((await worker.fetch(makeRequest(),configured,makeContext())).status,401);
  assert.equal((await worker.fetch(makeRequest(createToken()),configured,makeContext())).status,200);
});
