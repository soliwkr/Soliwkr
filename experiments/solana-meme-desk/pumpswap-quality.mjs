// Read-only research: quote currency conversion, PumpSwap base fee floor,
// and conservative Token-2022 extension gate. Never a trade fill quotation.
import {PUMP_AMM_PROGRAM,WSOL,USDC,u64} from './pumpswap-pool.mjs';
export const PUMP_GLOBAL_CONFIG='ADyA8hdefvWN2dbGGWFotbzWxrAvLW83WG6QCVXvJKqw';
export const TOKEN_2022='TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';
const validate=(n)=>Number.isFinite(n)&&n>1&&n<10000;
export async function indicativeSolUsd(rpc,loadPublic){
 const attempts=[];
 try{
  const a=(await rpc('getAsset',{id:WSOL,displayOptions:{showFungible:true}}))?.result;
  const usd=Number(a?.token_info?.price_info?.price_per_token);
  const currency=String(a?.token_info?.price_info?.currency||'').toUpperCase();
  if(a?.id===WSOL&&['USD','USDC'].includes(currency)&&validate(usd))
   return {usd,source:'HELIUS_DAS_WSOL_PRICE_INFO',observedAt:new Date().toISOString(),type:'INDICATIVE_NOT_EXECUTABLE',verified:true};
  attempts.push('HELIUS_PRICE_UNVERIFIABLE');
 }catch(e){attempts.push('HELIUS_PRICE_UNAVAILABLE')}
 try{
  const data=await loadPublic('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
  const usd=Number(data?.solana?.usd);
  if(validate(usd))return {usd,source:'COINGECKO_PUBLIC_SPOT_SOLUSD',observedAt:new Date().toISOString(),type:'INDICATIVE_NOT_EXECUTABLE',verified:true};
  attempts.push('PUBLIC_USD_PRICE_MISSING');
 }catch(e){attempts.push('PUBLIC_USD_PRICE_UNAVAILABLE')}
 return {usd:null,source:null,type:'NOT_AVAILABLE',verified:false,errors:attempts};
}
const decode=(value)=>{
 if(!value||!Array.isArray(value.data)||value.data[1]!=='base64')throw Error('BINARY_CONFIG_REQUIRED');
 const raw=atob(value.data[0]);return Uint8Array.from(raw,c=>c.charCodeAt(0));
};
export async function pumpSwapFeeFloor(rpc){
 const x=(await rpc('getAccountInfo',[PUMP_GLOBAL_CONFIG,{encoding:'base64',commitment:'confirmed'}]))?.result?.value;
 if(!x||x.owner!==PUMP_AMM_PROGRAM)throw Error('WRONG_GLOBAL_CONFIG_OWNER');
 const b=decode(x);
 if(b.length<57)throw Error('GLOBAL_CONFIG_TRUNCATED');
 const lp=u64(b,40),protocol=u64(b,48);
 if(lp>10000n||protocol>10000n||lp+protocol>=10000n)throw Error('INVALID_FEE_BPS');
 return {lpBps:Number(lp),protocolBps:Number(protocol),minimumKnownBps:Number(lp+protocol),
   completeness:'BASE_FEE_FLOOR_ONLY_CREATOR_FEE_DYNAMIC_AND_TOKEN_2022_UNAUDITED',
   executableQuote:false,account:PUMP_GLOBAL_CONFIG};
}
export async function inspectToken2022Mint(rpc,mint){
 const r=(await rpc('getAccountInfo',[mint,{encoding:'jsonParsed',commitment:'confirmed'}]))?.result?.value;
 if(!r)throw Error('TOKEN_MINT_UNAVAILABLE');
 if(r.owner!==TOKEN_2022)return {owner:r.owner,kind:'CLASSIC_OR_UNSUPPORTED',audited:false,blocking:['NOT_TOKEN_2022_MINT']};
 const info=r.data?.parsed?.info;
 if(r.data?.parsed?.type!=='mint'||!info||!Array.isArray(info.extensions))
  return {owner:r.owner,kind:'TOKEN_2022',audited:false,blocking:['EXTENSION_LIST_UNAVAILABLE']};
 const names=info.extensions.map(e=>String(e.extension||e.type||'UNRECOGNIZED'));
 const blocking=names.map(x=>'TOKEN_2022_EXTENSION_'+x);
 return {owner:r.owner,kind:'TOKEN_2022',extensions:names,blocking,
  audited:names.length===0,transferFeeRisk:names.some(x=>/transferFee/i.test(x)),
  transferHookRisk:names.some(x=>/transferHook/i.test(x)),
  // Even if no extensions are present, the on-chain adapter is currently only a spot model.
  executableQuote:false};
}
export function convertNativeQuoteToUsd(spot,fx){
 if(!spot||!fx?.verified||!Number.isFinite(spot.priceInQuote)||!validate(fx.usd)||spot.quoteMint!==WSOL)
  return {usable:false,reason:'USD_CONVERSION_NOT_VERIFIED',priceUsd:null};
 const priceUsd=spot.priceInQuote*fx.usd;
 if(!Number.isFinite(priceUsd)||priceUsd<=0)return {usable:false,reason:'USD_PRICE_UNAVAILABLE',priceUsd:null};
 return {usable:true,priceUsd,source:spot.source+' + '+fx.source,model:'SPOT_INDICATIVE_NO_FEE_OR_SLIPPAGE',executableQuote:false};
}
