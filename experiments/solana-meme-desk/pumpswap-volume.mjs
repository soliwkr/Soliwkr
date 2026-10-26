// Bounded, fail-closed, read-only Solana PumpSwap volume research.
// Native RPC getSignaturesForAddress + getTransaction(jsonParsed) only.
// This code NEVER declares a tradable one-hour volume when a response is missing
// or scan coverage cannot be proved. Vault turnover is an approximation, not
// equivalent to the exact swap user's spend after fee/transfer extensions.
import {PUMP_AMM_PROGRAM,WSOL,USDC} from './pumpswap-pool.mjs';

export function vaultAmount(tx, vault) {
 const keys=tx?.transaction?.message?.accountKeys;
 if(!Array.isArray(keys))throw Error('TX_ACCOUNT_KEYS_UNAVAILABLE');
 const index=keys.findIndex(k=>(typeof k==='string'?k:k?.pubkey)===vault);
 if(index<0)throw Error('VAULT_NOT_IN_TRANSACTION');
 const meta=tx?.meta;
 if(!Array.isArray(meta?.preTokenBalances)||!Array.isArray(meta?.postTokenBalances))throw Error('TX_TOKEN_BALANCES_UNAVAILABLE');
 const before=meta.preTokenBalances.find(b=>b.accountIndex===index);
 const after=meta.postTokenBalances.find(b=>b.accountIndex===index);
 if(!before||!after||!before.uiTokenAmount?.amount||!after.uiTokenAmount?.amount)throw Error('TX_VAULT_BALANCES_INCOMPLETE');
 if(before.mint!==after.mint)throw Error('VAULT_MINT_CHANGED');
 if(before.uiTokenAmount.decimals!==after.uiTokenAmount.decimals)throw Error('VAULT_DECIMALS_CHANGED');
 return {mint:before.mint,decimals:before.uiTokenAmount.decimals,delta:BigInt(after.uiTokenAmount.amount)-BigInt(before.uiTokenAmount.amount)};
}
export function swapQuoteDelta(tx,{pool,baseVault,quoteVault,baseMint,quoteMint}){
 if(tx?.meta?.err!==null)throw Error('TX_FAILED_OR_STATUS_UNKNOWN');
 const logs=tx?.meta?.logMessages||[];
 // Only explicit Pump AMM buy/sell instructions count; pool account alone also
 // appears in deposits, withdrawals, and configuration transactions.
 const invocation=logs.some(x=>typeof x==='string'&&x.startsWith('Program '+PUMP_AMM_PROGRAM+' invoke'));
 const trade=logs.some(x=>/Program log: Instruction: (Buy|Sell)(?:V[0-9]+)?\b/i.test(x));
 if(!invocation||!trade) return {swap:false,reason:'NOT_PUMPSWAP_BUY_OR_SELL'};
 const keys=tx?.transaction?.message?.accountKeys||[];
 if(!keys.some(k=>(typeof k==='string'?k:k?.pubkey)===pool))throw Error('EXPECTED_POOL_ABSENT');
 const base=vaultAmount(tx,baseVault),quote=vaultAmount(tx,quoteVault);
 if(base.mint!==baseMint||quote.mint!==quoteMint)throw Error('TX_VAULT_MINT_MISMATCH');
 if(base.delta===0n||quote.delta===0n||Math.sign(Number(base.delta))===Math.sign(Number(quote.delta)))throw Error('TX_VAULT_DELTA_NOT_SWAP');
 return {swap:true,quoteAbsRaw:quote.delta<0n?-quote.delta:quote.delta,quoteDecimals:quote.decimals,baseRaw:base.delta.toString(),quoteRaw:quote.delta.toString()};
}
export function hourlyCoverage(signatures,nowSeconds=Math.floor(Date.now()/1000),limit=16,maxTransactions=6){
 if(!Array.isArray(signatures)||signatures.length>limit)throw Error('BAD_SIGNATURES_SHAPE');
 const cutoff=nowSeconds-3600;
 const unknown=signatures.some(s=>!Number.isInteger(s?.blockTime));
 if(unknown)return {complete:false,reason:'TIMESTAMP_UNAVAILABLE',selection:[]};
 const newer=signatures.filter(s=>s.blockTime>=cutoff);
 const crossed=signatures.some(s=>s.blockTime<cutoff);
 // A shorter-than-limit page proves all signatures (the address had fewer).
 const historyComplete=crossed||signatures.length<limit;
 const withinBudget=newer.length<=maxTransactions;
 return {complete:historyComplete&&withinBudget,reason:!historyComplete?'ADDRESS_HISTORY_PAGINATION_REQUIRED':!withinBudget?'TX_FETCH_BUDGET_EXCEEDED':'COMPLETE_SIGNATURE_WINDOW',selection:newer.slice(0,maxTransactions),windowStart:cutoff,knownTransactions:newer.length};
}
export async function boundedOneHourTurnover(rpc,proof,{nowSeconds=Math.floor(Date.now()/1000),maxTransactions=6,signatureLimit=16}={}){
 if(!proof?.pool||!proof?.baseVault||!proof?.quoteVault||!proof?.baseMint||!proof?.quoteMint)throw Error('POOL_PROOF_INCOMPLETE');
 const response=await rpc('getSignaturesForAddress',[proof.pool,{limit:signatureLimit,commitment:'confirmed'}]);
 const signatures=response?.result;
 const coverage=hourlyCoverage(signatures,nowSeconds,signatureLimit,maxTransactions);
 if(!coverage.complete)return {verified:false,reason:coverage.reason,knownTransactions:coverage.knownTransactions,windowStart:coverage.windowStart,volumeNative:null,swaps:0,rpcTxBudget:maxTransactions};
 let total=0n,swaps=0,unknown=0;
 for(const sig of coverage.selection){
  const tx=(await rpc('getTransaction',[sig.signature,{encoding:'jsonParsed',commitment:'confirmed',maxSupportedTransactionVersion:1}]))?.result;
  if(!tx||!Number.isInteger(tx.blockTime)||tx.blockTime<coverage.windowStart){unknown++;continue}
  try{
   const x=swapQuoteDelta(tx,proof);
   if(x.swap){
    if(x.quoteDecimals!==(proof.quoteMint===WSOL?9:proof.quoteMint===USDC?6:-1))throw Error('QUOTE_DECIMALS_MISMATCH');
    total+=x.quoteAbsRaw;swaps++;
   }
  }catch(e){unknown++;}
 }
 if(unknown)return {verified:false,reason:'UNCLASSIFIABLE_TX_OR_MISSING_PROOF',unknown,knownTransactions:coverage.knownTransactions,swaps,volumeNative:null};
 if(coverage.selection.length!==coverage.knownTransactions)return {verified:false,reason:'COVERAGE_CAPPED',volumeNative:null,swaps};
 const decimals=proof.quoteMint===WSOL?9:proof.quoteMint===USDC?6:null;
 if(decimals===null)return {verified:false,reason:'USD_QUOTE_CONVERSION_UNSUPPORTED',volumeNative:null,swaps};
 // note: THIS IS VAULT TURNOVER (approx), not exact economic trade notional
 const whole=total/10n**BigInt(decimals),fract=total%10n**BigInt(decimals);
 const value=Number(whole)+Number(fract)/10**decimals;
 return {verified:false,reason:'VAULT_DELTA_APPROX_NOT_YET_AUDITED',source:'HELIUS_TX_VAULT_NET_DELTA',windowStart:coverage.windowStart,knownTransactions:coverage.knownTransactions,swaps,unknown:0,volumeNative:value,quoteMint:proof.quoteMint,quoteDecimals:decimals,pricing:'EXCLUDES_TRANSFER_FEE_AND_CREATOR_FEE_PROOF',usableForHardVolumeGate:false};
}
