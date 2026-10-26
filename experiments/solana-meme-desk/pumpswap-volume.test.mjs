import test from 'node:test';
import assert from 'node:assert/strict';
import {PUMP_AMM_PROGRAM,WSOL,toBase58,fromBase58} from './pumpswap-pool.mjs';
import {hourlyCoverage,swapQuoteDelta,boundedOneHourTurnover,parsePumpSwapTradeEvents} from './pumpswap-volume.mjs';
const proof={pool:'P',baseVault:'BVAULT',quoteVault:'QVAULT',baseMint:'BASE',quoteMint:WSOL};
const entry=(accountIndex,mint,amount,decimals)=>({accountIndex,mint,uiTokenAmount:{amount:String(amount),decimals}});
function tx(baseFrom,baseTo,quoteFrom,quoteTo,{logs=true,failed=false}={}){
 const [b0,b1,q0,q1]=[baseFrom,baseTo,quoteFrom,quoteTo].map(x=>BigInt(x));
 return {blockTime:2000000,meta:{err:failed?{InstructionError:[1,'Custom']}:null,
   logMessages:logs?['Program '+PUMP_AMM_PROGRAM+' invoke [1]','Program log: Instruction: BuyV2']:[],
   preTokenBalances:[entry(1,proof.baseMint,b0,6),entry(2,proof.quoteMint,q0,9)],
   postTokenBalances:[entry(1,proof.baseMint,b1,6),entry(2,proof.quoteMint,q1,9)]},
  transaction:{message:{accountKeys:[{pubkey:proof.pool},{pubkey:proof.baseVault},{pubkey:proof.quoteVault}]}}};
}
test('valid BUY changes vault base and quote oppositely',()=>{
 const d=swapQuoteDelta(tx('2000000','1000000','500000000','1500000000'),proof);
 assert.equal(d.swap,true);assert.equal(d.quoteAbsRaw,1000000000n);
});
test('liquidity deposit without Buy/Sell log ignored',()=>{
 assert.equal(swapQuoteDelta(tx('1000000','2000000','500000000','1500000000',{logs:false}),proof).swap,false);
});
test('failed transaction never counted',()=>{
 assert.throws(()=>swapQuoteDelta(tx('2000000','1000000','500000000','1500000000',{failed:true}),proof),/TX_FAILED/);
});
test('strict full window proof if fewer than page or crosses cutoff',()=>{
 let r=hourlyCoverage([{signature:'a',blockTime:1999999}],2000000,16,6);
 assert.equal(r.complete,true);
 r=hourlyCoverage(Array.from({length:16},(_,i)=>({signature:String(i),blockTime:1999999-i})),2000000,16,6);
 assert.equal(r.complete,false);assert.equal(r.reason,'ADDRESS_HISTORY_PAGINATION_REQUIRED');
 r=hourlyCoverage([{signature:'a',blockTime:2000000}],2000000,16,0);
 assert.equal(r.complete,false);assert.equal(r.reason,'TX_FETCH_BUDGET_EXCEEDED');
});
test('missing timestamps fail closed',()=>assert.equal(hourlyCoverage([{signature:'a',blockTime:null}],2000000).complete,false));
test('bounded full snapshot returns research-only approximate value, never gate proof',async()=>{
 const rpc=async method=>method==='getSignaturesForAddress'?{result:[{signature:'a',blockTime:2000000}]}:{result:tx('2000000','1000000','500000000','1500000000')};
 const r=await boundedOneHourTurnover(rpc,proof,{nowSeconds:2000001});
 assert.equal(r.volumeNative,1);
 assert.equal(r.swaps,1);assert.equal(r.usableForHardVolumeGate,false);assert.equal(r.verified,false);
});
test('many transactions within hour block expensive RPC lookups',async()=>{
 let requested=0;
 const rpc=async method=>{if(method==='getSignaturesForAddress')return {result:Array.from({length:9},(_,i)=>({signature:String(i),blockTime:2000000}))};requested++;throw Error('RPC over budget')};
 const r=await boundedOneHourTurnover(rpc,proof,{nowSeconds:2000001,maxTransactions:6});
 assert.equal(r.verified,false);assert.equal(r.reason,'TX_FETCH_BUDGET_EXCEEDED');assert.equal(requested,0);
});
test('missing transaction data invalidates volume',async()=>{
 const rpc=async method=>method==='getSignaturesForAddress'?{result:[{signature:'a',blockTime:2000000}]}:{result:null};
 const r=await boundedOneHourTurnover(rpc,proof,{nowSeconds:2000001});
 assert.equal(r.verified,false);assert.equal(r.volumeNative,null);
});

test('official BuyEvent quote amount, correct pool, negative reserve fee-independent',()=>{
 const pool=toBase58(new Uint8Array(32).fill(1));
 const raw=Buffer.alloc(152);
 Buffer.from([103,244,82,31,44,245,119,119]).copy(raw,0);
 raw.writeBigInt64LE(2000000n,8);
 raw.writeBigUInt64LE(1000000000n,64);
 Buffer.from(fromBase58(pool)).copy(raw,120);
 const x={meta:{logMessages:['Program '+PUMP_AMM_PROGRAM+' invoke [1]','Program log: Instruction: BuyV2','Program data: '+raw.toString('base64')]}};
 const events=parsePumpSwapTradeEvents(x,pool);
 assert.equal(events.length,1);assert.equal(events[0].side,'BUY');
 assert.equal(events[0].quoteRaw,1000000000n);
 assert.equal(parsePumpSwapTradeEvents(x,toBase58(new Uint8Array(32).fill(2))).length,0);
});
test('unrelated event data never becomes a PumpSwap trade',()=>{
 const x={meta:{logMessages:['Program data: '+Buffer.from('unrelated text').toString('base64')]}};
 assert.deepEqual(parsePumpSwapTradeEvents(x,'P'),[]);
});
