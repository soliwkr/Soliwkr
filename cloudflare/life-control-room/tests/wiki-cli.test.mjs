import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {WIKI_CLI} from '../src/wiki-cli-bundle.js';
import {createVaultArchive} from '../src/vault.js';

async function unzipStoredArchive(bytes,output){
 const dv=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),decode=new TextDecoder();
 let pos=0,count=0;
 while(pos+4<bytes.length&&dv.getUint32(pos,true)===0x04034b50){
  assert.equal(dv.getUint16(pos+8,true),0,'ZIP files should not require decompression');
  const size=dv.getUint32(pos+18,true),filenameLength=dv.getUint16(pos+26,true),extra=dv.getUint16(pos+28,true);
  const filename=decode.decode(bytes.slice(pos+30,pos+30+filenameLength));
  assert.ok(filename.startsWith('Soliwkr-Wiki/'));
  assert.ok(!filename.includes('..'));
  const start=pos+30+filenameLength+extra;
  const target=path.join(output,filename);
  await fs.mkdir(path.dirname(target),{recursive:true});
  await fs.writeFile(target,bytes.slice(start,start+size));
  pos=start+size;count++;
 }
 assert.ok(count>=30,'CLI included in the vault');
 return path.join(output,'Soliwkr-Wiki');
}
function cli(vault,...args){
 return spawnSync(process.execPath,[path.join(vault,'tools/wiki.mjs'),...args,'--vault',vault],{encoding:'utf8',timeout:10000});
}
test('Obsidian vault exports a runnable offline CLI and executes Ingest, Query, Lint without network',async()=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'soliwkr-wiki-'));
 try{
  const buf=createVaultArchive({focus:'Chiudere una cosa',notDoing:'Nuovi progetti',pillars:{},goals:[],inbox:[]},3,new Date('2026-10-12T17:00:00Z'));
  const vault=await unzipStoredArchive(buf,root);
  assert.equal((await fs.readFile(path.join(vault,'tools/wiki.mjs'),'utf8')).trim(),WIKI_CLI.trim());
  let result=cli(vault,'status');assert.equal(result.status,0,result.stderr);
  assert.equal(JSON.parse(result.stdout).offline,true);
  const source=path.join(root,'daily-report.md');
  await fs.writeFile(source,'# Decisione sulle priorità\n\nPreferisco consolidare la settimana prima di aggiungere altro.','utf8');
  result=cli(vault,'ingest',source);assert.equal(result.status,0,result.stderr);
  assert.equal(JSON.parse(result.stdout).mode,'dry-run');
  assert.equal((await fs.readdir(path.join(vault,'raw'))).includes('imports'),false);
  result=cli(vault,'ingest',source,'--apply');assert.equal(result.status,0,result.stderr);
  const manifest=JSON.parse(result.stdout.slice(0,result.stdout.indexOf('\nDraft created.')));
  const raw=path.join(vault,manifest.raw),wiki=path.join(vault,manifest.wiki);
  assert.match(await fs.readFile(raw,'utf8'),/consolidare la settimana/);
  assert.match(await fs.readFile(wiki,'utf8'),/review_status: draft/);
  assert.match(await fs.readFile(path.join(vault,'LOG.md'),'utf8'),/Ingest \(DRAFT\)/);
  result=cli(vault,'ingest',source,'--apply');assert.equal(result.status,1,'no overwrite of original sources');
  result=cli(vault,'query','consolidare');assert.equal(result.status,0,result.stderr);
  const matches=JSON.parse(result.stdout).results;
  assert.ok(matches.some(m=>m.source===manifest.raw));
  result=cli(vault,'lint');assert.ok([0,2].includes(result.status),result.stderr);
  const report=JSON.parse(result.stdout);
  assert.ok(report.scanned>=26);
  const clean=report.issues.filter(i=>i.kind==='unresolved_wikilink');
  assert.deepEqual(clean,[],'starter wiki should not create broken links');
  await fs.appendFile(wiki,'\n[[NON_EXISTENT_85492]]\n');
  result=cli(vault,'lint');assert.equal(result.status,2);
  assert.ok(JSON.parse(result.stdout).issues.some(x=>x.target==='NON_EXISTENT_85492'));
 }finally{await fs.rm(root,{recursive:true,force:true})}
});
