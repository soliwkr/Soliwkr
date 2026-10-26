// Read-only PumpSwap pool pricing adapter for SOLIWKR paper research.
// Based on pump-fun/pump-public-docs (Oct 2026) and chainstacklabs/pumpfun-bonkfun-bot.
// NO signatures, wallets, transactions, or trade instructions.
// A reserve ratio is NOT an executable fill, and it does NOT prove 1h volume.
export const PUMP_AMM_PROGRAM='pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA';
export const WSOL='So11111111111111111111111111111111111111112';
export const USDC='EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
// Only SPL Token classic is accepted here until Token-2022 layouts and extensions are audited.
const B58='123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
function validAddress(s){return typeof s==='string'&&s.length>=32&&s.length<=44&&[...s].every(c=>B58.includes(c))}
export function toBase58(bytes){
 const a=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes);
 let x=0n;for(const b of a)x=x*256n+BigInt(b);
 let out='';while(x>0n){out=B58[Number(x%58n)]+out;x/=58n}
 let zeros=0;for(const b of a){if(b!==0)break;zeros++}
 return '1'.repeat(zeros)+out;
}
export function fromBase58(input){
 if(!validAddress(input))throw Error('ADDRESS_BASE58_INVALID');
 let n=0n;for(const c of input)n=n*58n+BigInt(B58.indexOf(c));
 const buf=new Uint8Array(32);
 for(let i=31;i>=0;i--){buf[i]=Number(n&255n);n>>=8n}
 if(n!==0n||toBase58(buf)!==input)throw Error('ADDRESS_OUT_OF_RANGE');
 return buf;
}
export function u64(bytes,offset){
 if(bytes.length<offset+8)throw Error('TRUNCATED_U64');
 let n=0n;for(let i=7;i>=0;i--)n=(n<<8n)+BigInt(bytes[offset+i]);return n;
}
export function i128(bytes,offset){
 if(bytes.length<offset+16)throw Error('TRUNCATED_I128');
 let n=0n;for(let i=15;i>=0;i--)n=(n<<8n)+BigInt(bytes[offset+i]);
 return n >= (1n<<127n)? n-(1n<<128n):n;
}
const addressAt=(b,o)=>{if(b.length<o+32)throw Error('POOL_ACCOUNT_TRUNCATED');return toBase58(b.slice(o,o+32))};
export function parsePumpPool(bytes){
 const b=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes);
 if(b.length<243)throw Error('POOL_ACCOUNT_TRUNCATED');
 const pool={
  index: Number(b[9]+(b[10]<<8)),
  creator:addressAt(b,11),baseMint:addressAt(b,43),quoteMint:addressAt(b,75),
  lpMint:addressAt(b,107),baseVault:addressAt(b,139),quoteVault:addressAt(b,171),
  lpSupply:u64(b,203),coinCreator:addressAt(b,211),
  isMayhem:b.length>243?b[243]!==0:false,
  isCashback:b.length>244?b[244]!==0:false,
  virtualQuote:b.length>=261?i128(b,245):0n
 };
 return pool;
}
export function parseTokenAccount(bytes){
 const b=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes);
 if(b.length<165)throw Error('TOKEN_ACCOUNT_TRUNCATED');
 return {mint:addressAt(b,0),owner:addressAt(b,32),amount:u64(b,64)};
}
export function parseMintDecimals(bytes){
 const b=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes);
 if(b.length<82)throw Error('MINT_ACCOUNT_TRUNCATED');
 const decimals=b[44];if(decimals>18)throw Error('MINT_DECIMALS_UNSUPPORTED');
 return decimals;
}
export function quoteFromReserves({baseRaw,quoteRaw,virtualQuote=0n,baseDecimals,quoteDecimals}){
 const base=BigInt(baseRaw),effective=BigInt(quoteRaw)+BigInt(virtualQuote);
 if(base<=0n||effective<=0n)throw Error('EMPTY_OR_NEGATIVE_EFFECTIVE_RESERVES');
 if(!Number.isInteger(baseDecimals)||!Number.isInteger(quoteDecimals)||baseDecimals<0||quoteDecimals<0||baseDecimals>18||quoteDecimals>18)throw Error('BAD_DECIMALS');
 // Fixed-point BigInt quote/base with 18-digit precision, no raw 64/128-bit float math.
 const numerator=effective*10n**BigInt(baseDecimals+18);
 const denominator=base*10n**BigInt(quoteDecimals);
 const fixed=numerator/denominator;
 const price=Number(fixed)/1e18;
 if(!Number.isFinite(price)||price<=0)throw Error('PRICE_BELOW_1E_MINUS_18_OR_INVALID');
 return {priceInQuote:price,priceFixed18:fixed.toString(),effectiveQuoteRaw:effective.toString(),baseReserveRaw:base.toString(),virtualQuoteRaw:BigInt(virtualQuote).toString(),quoteReserveRaw:BigInt(quoteRaw).toString(),model:'POOL_SPOT_RATIO_NOT_EXECUTABLE'};
}
const byteData=(v)=>{
 if(!v||!Array.isArray(v.data)||v.data[1]!=='base64'||typeof v.data[0]!=='string')throw Error('RPC_BASE64_PROOF_MISSING');
 const raw=atob(v.data[0]);return Uint8Array.from(raw,c=>c.charCodeAt(0));
};
// rpc(method,params) is injected; caller can use Helius without exposing secrets.
export async function inspectPumpSwapPool(rpc,poolAddress,expectedBaseMint){
 if(!validAddress(poolAddress)||!validAddress(expectedBaseMint))throw Error('UNTRUSTED_ADDRESS');
 const poolResponse=await rpc('getAccountInfo',[poolAddress,{encoding:'base64',commitment:'confirmed'}]);
 const poolAcc=poolResponse?.result?.value;
 if(!poolAcc||poolAcc.owner!==PUMP_AMM_PROGRAM)throw Error('WRONG_POOL_PROGRAM_OR_NOT_FOUND');
 const pool=parsePumpPool(byteData(poolAcc));
 if(pool.baseMint!==expectedBaseMint)throw Error('POOL_BASE_MINT_MISMATCH');
 if(![WSOL,USDC].includes(pool.quoteMint))throw Error('UNSUPPORTED_QUOTE_ASSET');
 const keys=[pool.baseVault,pool.quoteVault,pool.baseMint,pool.quoteMint];
 const response=await rpc('getMultipleAccounts',[keys,{encoding:'base64',commitment:'confirmed',minContextSlot:poolResponse?.result?.context?.slot||0}]);
 const records=response?.result?.value;
 if(!Array.isArray(records)||records.length!==4||records.some(x=>!x))throw Error('VAULT_OR_MINT_UNAVAILABLE');
 const [baseVault,quoteVault,baseMint,quoteMint]=records;
 // Strictly verify the two vault owners, vault account token mints and the SPL program.
 const SPL='TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
 if(baseVault.owner!==SPL||quoteVault.owner!==SPL||baseMint.owner!==SPL||quoteMint.owner!==SPL)throw Error('TOKEN_PROGRAM_UNSUPPORTED');
 const baseToken=parseTokenAccount(byteData(baseVault)),quoteToken=parseTokenAccount(byteData(quoteVault));
 if(baseToken.owner!==poolAddress||quoteToken.owner!==poolAddress||baseToken.mint!==pool.baseMint||quoteToken.mint!==pool.quoteMint)throw Error('VAULT_ADDRESS_OR_MINT_PROOF_FAILED');
 const baseDecimals=parseMintDecimals(byteData(baseMint)),quoteDecimals=parseMintDecimals(byteData(quoteMint));
 const price=quoteFromReserves({baseRaw:baseToken.amount,quoteRaw:quoteToken.amount,virtualQuote:pool.virtualQuote,baseDecimals,quoteDecimals});
 return {pool:poolAddress,mint:expectedBaseMint,quoteMint:pool.quoteMint,baseDecimals,quoteDecimals,
  ...price,slot:response?.result?.context?.slot||null,
  source:'HELIUS_PUMPSWAP_POOL_ACCOUNTS',status:'ONCHAIN_SPOT_ONLY_VOLUME_UNKNOWN',mode:'READ_ONLY_PAPER_RESEARCH'};
}
