import test from 'node:test';
import assert from 'node:assert/strict';
import {PUMP_AMM_PROGRAM,WSOL,USDC,toBase58,fromBase58,i128,parsePumpPool,quoteFromReserves,inspectPumpSwapPool} from './pumpswap-pool.mjs';
const key=n=>toBase58(new Uint8Array(32).fill(n));
const A={pool:key(1),base:key(2),baseVault:key(3),quoteVault:key(4),quote:WSOL};
const spl='TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
function putKey(b,off,s){b.set(fromBase58(s),off)}
function write(b,off,num,size){let n=BigInt(num);if(n<0)n+=(1n<<BigInt(size*8));for(let i=0;i<size;i++){b[off+i]=Number(n&255n);n>>=8n}}
function account(bytes,owner){return {owner,data:[Buffer.from(bytes).toString('base64'),'base64']}}
function fixture({virtual=-500000000n,baseVaultOwner=A.pool,quoteVaultOwner=A.pool,quoteMint=WSOL,program=PUMP_AMM_PROGRAM}={}){
 const pool=new Uint8Array(301);putKey(pool,43,A.base);putKey(pool,75,quoteMint);putKey(pool,139,A.baseVault);putKey(pool,171,A.quoteVault);write(pool,245,virtual,16);
 const vault=(mint,owner,amount)=>{const b=new Uint8Array(165);putKey(b,0,mint);putKey(b,32,owner);write(b,64,amount,8);return b};
 const mint=decimal=>{const b=new Uint8Array(82);b[44]=decimal;return b};
 const rpc=async (method,params)=>{
  if(method==='getAccountInfo'){assert.equal(params[0],A.pool);return {result:{context:{slot:1234},value:account(pool,program)}}}
  if(method==='getMultipleAccounts'){assert.deepEqual(params[0],[A.baseVault,A.quoteVault,A.base,quoteMint]);return {result:{context:{slot:1234},value:[
   account(vault(A.base,baseVaultOwner,1000000n),spl),account(vault(quoteMint,quoteVaultOwner,1500000000n),spl),account(mint(6),spl),account(mint(9),spl)
  ]}}}
  throw Error('Unexpected RPC '+method);
 };
 return rpc;
}
test('standard base58 roundtrip and SPL zero key',()=>{
 assert.equal(toBase58(new Uint8Array(32)),'11111111111111111111111111111111');
 for(const k of [A.pool,A.base,A.baseVault,WSOL,USDC])assert.equal(toBase58(fromBase58(k)),k);
});
test('real-layout signed i128 negative and missing virtual field',()=>{
 const full=new Uint8Array(301);write(full,245,-500000000n,16);
 assert.equal(i128(full,245),-500000000n);
 assert.equal(parsePumpPool(full).virtualQuote,-500000000n);
 assert.equal(parsePumpPool(new Uint8Array(243)).virtualQuote,0n);
});
test('price uses effective quote reserve, not raw vault',()=>{
 const result=quoteFromReserves({baseRaw:1000000n,quoteRaw:1500000000n,virtualQuote:-500000000n,baseDecimals:6,quoteDecimals:9});
 assert.equal(result.priceInQuote,1);assert.equal(result.effectiveQuoteRaw,'1000000000');assert.equal(result.model,'POOL_SPOT_RATIO_NOT_EXECUTABLE');
});
test('invalid reserve values never get a price',()=>{
 assert.throws(()=>quoteFromReserves({baseRaw:1n,quoteRaw:2n,virtualQuote:-3n,baseDecimals:6,quoteDecimals:9}),/EMPTY_OR_NEGATIVE/);
 assert.throws(()=>quoteFromReserves({baseRaw:0n,quoteRaw:2n,baseDecimals:6,quoteDecimals:9}),/EMPTY_OR_NEGATIVE/);
});
test('read-only RPC quote verifies program, mints, vaults and raw decimals',async()=>{
 const data=await inspectPumpSwapPool(fixture(),A.pool,A.base);
 assert.equal(data.priceInQuote,1);assert.equal(data.mode,'READ_ONLY_PAPER_RESEARCH');
 assert.equal(data.status,'ONCHAIN_SPOT_ONLY_VOLUME_UNKNOWN');
 assert.equal(data.slot,1234);
});
test('wrong program is rejected',async()=>{
 await assert.rejects(()=>inspectPumpSwapPool(fixture({program:A.base}),A.pool,A.base),/WRONG_POOL_PROGRAM/);
});
test('wrong vault owner is rejected',async()=>{
 await assert.rejects(()=>inspectPumpSwapPool(fixture({baseVaultOwner:A.base}),A.pool,A.base),/VAULT_ADDRESS/);
});
test('wrong user-supplied base mint is rejected',async()=>{
 await assert.rejects(()=>inspectPumpSwapPool(fixture(),A.pool,A.baseVault),/POOL_BASE_MINT_MISMATCH/);
});
test('arbitrary quote assets rejected until routing/decimals audited',async()=>{
 await assert.rejects(()=>inspectPumpSwapPool(fixture({quoteMint:A.baseVault}),A.pool,A.base),/UNSUPPORTED_QUOTE_ASSET/);
});
