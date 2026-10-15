import test from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import { evaluateAccessRequest } from "../src/access-auth.js";
import { createToken, ENV_AUTH, JWKS } from "./auth-fixture.mjs";

const issuer="https://probe-stage.cloudflareaccess.com";
const when=Date.now();
const actualToken=createToken({iss:issuer});
const request=(token=actualToken)=>new Request("https://aios-stage.soliwkr.pro/api/health",{
  headers:{"cf-access-jwt-assertion":token}
});
const noNetwork=async()=>{throw new Error("unreachable")};
const pinned=Object.freeze({
  ...ENV_AUTH,ACCESS_TEAM_DOMAIN:issuer,AIOS_HOST:"aios-stage.soliwkr.pro",
  STAGE_JWKS_FALLBACK:"enabled",
  STAGE_ACCESS_JWKS:JSON.stringify({issuer,captured_at:new Date(when).toISOString(),keys:JWKS.keys})
});
const evalWith=(token,env=pinned,fetcher=noNetwork,now=when)=>
  evaluateAccessRequest(request(token),env,fetcher,now);

test("stage-specific pinned JWKS retains cryptographic RS256 verification during certificate fetch failure",async()=>{
  const result=await evalWith(actualToken);
  assert.deepEqual(result,{ok:true,code:"ok"});
});

test("a forged token is still denied when stage uses pinned public signing keys",async()=>{
  const wrongPrivate=generateKeyPairSync("rsa",{modulusLength:2048}).privateKey;
  const forged=createToken({iss:issuer},wrongPrivate);
  assert.deepEqual(await evalWith(forged),{ok:false,code:"signature"});
});

test("pin cannot be used on production, other hosts or without opt-in",async()=>{
  for(const patch of [
    {AIOS_HOST:"aios.soliwkr.pro"},
    {AIOS_HOST:"other-stage.soliwkr.pro"},
    {STAGE_JWKS_FALLBACK:"disabled"},
    {STAGE_JWKS_FALLBACK:""},
    {STAGE_ACCESS_JWKS:""},
  ]){
    const r=await evalWith(actualToken,{...pinned,...patch});
    assert.deepEqual(r,{ok:false,code:"cert-fetch"},JSON.stringify(patch));
  }
});

test("pin is denied when outdated, future-dated, wrong issuer or no valid keys",async()=>{
  const manifests=[
    {issuer,captured_at:new Date(when-25*60*60*1000).toISOString(),keys:JWKS.keys},
    {issuer,captured_at:new Date(when+360000).toISOString(),keys:JWKS.keys},
    {issuer:"https://unrelated.cloudflareaccess.com",captured_at:new Date(when).toISOString(),keys:JWKS.keys},
    {issuer,captured_at:new Date(when).toISOString(),keys:[]},
    {issuer,captured_at:new Date(when).toISOString(),keys:[{kty:"oct",kid:"fake",k:"aaa"}]},
  ];
  for(const manifest of manifests){
    const result=await evalWith(actualToken,{...pinned,STAGE_ACCESS_JWKS:JSON.stringify(manifest)});
    assert.deepEqual(result,{ok:false,code:"cert-fetch"},JSON.stringify({issuer:manifest.issuer,len:manifest.keys?.length}));
  }
});

test("a pinned public key never overrides issuer, audience, or owner claims",async()=>{
  for(const overrides of [{aud:"wrong"},{email:"not-owner@example.test"},{iss:"https://wrong.cloudflareaccess.com"},{exp:Math.floor(when/1000)-60}]){
    const r=await evalWith(createToken({iss:issuer,...overrides}));
    assert.equal(r.ok,false,JSON.stringify(overrides));
    assert.notEqual(r.code,"ok");
  }
});

test("certificate fetch failures return stable, safe diagnostic codes",async()=>{
  const cases=[
    [async()=>{throw new Error("includes sensitive network details")},"cert-fetch"],
    [async()=>new Response("blocked",{status:403}),"cert-http"],
    [async()=>new Response("{not-json",{status:200}),"cert-json"],
    [async()=>Response.json({keys:[]}),"cert-keys"],
    [async()=>Response.json({unknown:true}),"cert-schema"]
  ];
  for(const [fetcher,code] of cases){
    const r=await evalWith(actualToken,{...pinned,STAGE_JWKS_FALLBACK:"disabled"},fetcher);
    assert.deepEqual(r,{ok:false,code});
  }
});
