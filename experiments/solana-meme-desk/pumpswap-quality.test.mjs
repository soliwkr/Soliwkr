import test from 'node:test';
import assert from 'node:assert/strict';
import {PUMP_AMM_PROGRAM,WSOL} from './pumpswap-pool.mjs';
import {indicativeSolUsd,convertNativeQuoteToUsd,pumpSwapFeeFloor,inspectToken2022Mint,TOKEN_2022} from './pumpswap-quality.mjs';
test('WSOL/USD uses Helius documented USD price and no secondary fetch',async()=>{
 let called=false;
 const usd=await indicativeSolUsd(async()=>({result:{id:WSOL,token_info:{price_info:{currency:'USD',price_per_token:150}}}}),async()=>{called=true});
 assert.equal(usd.usd,150);assert.equal(usd.verified,true);assert.equal(called,false);
});
test('USD conversion is indicative and not an executable swap fill',()=>{
 const v=convertNativeQuoteToUsd({priceInQuote:0.0001,quoteMint:WSOL,source:'ONCHAIN'},{verified:true,usd:150,source:'HELIUS'});
 assert.ok(Math.abs(v.priceUsd-0.015)<1e-12);assert.equal(v.executableQuote,false);
});
test('null/implausible FX never creates a price',()=>{
 assert.equal(convertNativeQuoteToUsd({priceInQuote:1,quoteMint:WSOL},{verified:false,usd:200}).priceUsd,null);
});
test('on-chain base fee floor includes LP and protocol but not invented creator fee',async()=>{
 const d=Buffer.alloc(400);d.writeBigUInt64LE(20n,40);d.writeBigUInt64LE(5n,48);
 const result=await pumpSwapFeeFloor(async()=>({result:{value:{owner:PUMP_AMM_PROGRAM,data:[d.toString('base64'),'base64']}}}));
 assert.equal(result.minimumKnownBps,25);assert.equal(result.executableQuote,false);
 assert.match(result.completeness,/CREATOR_FEE_DYNAMIC/);
});
test('Token-2022 transfer fee blocks executable model',async()=>{
 const result=await inspectToken2022Mint(async()=>({result:{value:{owner:TOKEN_2022,data:{parsed:{type:'mint',info:{extensions:[{extension:'transferFeeConfig'}]}}}}}}),'token');
 assert.equal(result.transferFeeRisk,true);assert.equal(result.audited,false);assert.equal(result.executableQuote,false);
});
test('missing Token-2022 extension list fails closed',async()=>{
 const result=await inspectToken2022Mint(async()=>({result:{value:{owner:TOKEN_2022,data:{parsed:{type:'mint',info:{}}}}}}),'token');
 assert.equal(result.audited,false);assert.deepEqual(result.blocking,['EXTENSION_LIST_UNAVAILABLE']);
});
