import test from 'node:test';
import assert from 'node:assert/strict';
import {HTML} from '../src/experience.js';
import {injectAtlas} from '../src/atlas.js';
import {injectMemory} from '../src/memory-ui.js';
import {knowledgeRequest,readKnowledge} from '../src/knowledge.js';
import {createVaultArchive} from '../src/vault.js';
import {Script} from 'node:vm';

const base='https://aios.soliwkr.pro';
function database(text='Una decisione importante'){
 let note={id:'note-1',text},sources=[],cards=[],events=[];
 return {
  data:{sources,cards,events},
  prepare(sql){
   let params=[];
   return {
    bind(...values){params=values;return this},
    async first(){
     if(sql.includes('SELECT payload FROM private_state'))
      return {payload:JSON.stringify({inbox:[note]})};
     if(sql.includes('FROM knowledge_sources WHERE note_ref='))
      return sources.find(x=>x.note_ref===params[0])||null;
     if(sql.includes('SELECT source_id FROM knowledge_cards'))
      return cards.find(x=>x.id===params[0])||null;
     return null;
    },
    async all(){
     return {results:cards.map(c=>({...c,...sources.find(s=>s.id===c.source_id)}))};
    },
    async run(){
     if(sql.startsWith('INSERT INTO knowledge_sources')){
      if(sources.find(x=>x.note_ref===params[1]))throw Error('unique');
      sources.push({id:params[0],note_ref:params[1],raw_text:params[2],sha256:params[3],created_at:'2026-10-12 19:00:00'});return{meta:{changes:1}};
     }
     if(sql.startsWith('INSERT INTO knowledge_cards')){
      cards.push({id:params[0],source_id:params[1],title:params[2],kind:params[3],domain:params[4],created_at:'2026-10-12 19:00:00'});return{meta:{changes:1}};
     }
     if(sql.startsWith('DELETE FROM knowledge_cards')){
      const i=cards.findIndex(x=>x.id===params[0]);if(i>=0)cards.splice(i,1);return{meta:{changes:1}};
     }
     if(sql.startsWith('DELETE FROM knowledge_sources')){
      const i=sources.findIndex(x=>x.id===params[0]);if(i>=0)sources.splice(i,1);return{meta:{changes:1}};
     }
     if(sql.startsWith('INSERT INTO change_events')){events.push(sql);return{meta:{changes:1}}}
     throw Error('Unsupported SQL '+sql);
    }
   }
  },
  async batch(statements){for(const p of statements)await p.run()}
 };
}
function fakeRequest(path,opts={}){
 return new Request(base+path,opts);
}
const route=(req,db)=>knowledgeRequest(req,{LIFE_DB:db},new URL(req.url));
const opts=(body,origin=base)=>({method:'POST',headers:{'origin':origin,'content-type':'application/json','x-control-room':'1'},body:JSON.stringify(body)});
test('Cervello knowledge UI remains a single routed view and parses',()=>{
 const html=injectMemory(injectAtlas(HTML));
 assert.match(html,/id="knowledge-form"/);
 assert.match(html,/id="view-grafo"/);
 assert.match(html,/lifeos:knowledge-changed/);
 assert.doesNotThrow(()=>new Script(html.match(/<script>([\s\S]*?)<\/script>/)[1]));
});
test('User explicitly approves a real source; source text cannot be spoofed',async()=>{
 const db=database('Fonte originale D1 privata');
 const fake={noteId:'note-1',title:'Il primo apprendimento',kind:'lesson',domain:'progetti',raw_text:'Attacco: testo falso'};
 let res=await route(fakeRequest('/api/knowledge',opts(fake)),db);
 assert.equal(res.status,201);
 let result=await res.json();
 assert.ok(result.source_sha256.length===64);
 assert.equal(db.data.sources[0].raw_text,'Fonte originale D1 privata');
 assert.equal(db.data.cards[0].title,'Il primo apprendimento');
 assert.equal(db.data.cards[0].domain,'progetti');
 assert.equal(db.data.events.length,1);
 res=await route(fakeRequest('/api/knowledge',opts(fake)),db);
 assert.equal(res.status,409,'immutable source cannot be replayed');
 res=await route(fakeRequest('/api/knowledge',opts({...fake,domain:'wrong'})),db);
 assert.equal(res.status,400,'arbitrary connections are rejected');
 res=await route(fakeRequest('/api/knowledge',opts({...fake,noteId:'forged'})),db);
 assert.equal(res.status,404,'a nonexistent source cannot be ingested');
 res=await route(fakeRequest('/api/knowledge',opts(fake,'https://evil.example')),db);
 assert.equal(res.status,403,'origin pin protects writes');
 const list=await readKnowledge(db);
 assert.equal(list.length,1);
 assert.ok(list[0].raw_text.includes('Fonte originale D1'));
 const zip=createVaultArchive({focus:'Today',inbox:[],pillars:{},goals:[]},2,new Date('2026-10-12T16:00:00Z'),list);
 const archiveText=new TextDecoder().decode(zip);
 assert.match(archiveText,/Fonte originale D1 privata/);
 assert.match(archiveText,/Il primo apprendimento/);
 assert.match(archiveText,/wiki\/Knowledge/);
 const id=result.id;
 res=await route(fakeRequest('/api/knowledge/'+id,{method:'DELETE',headers:{origin:base,'x-control-room':'1'}}),db);
 assert.equal(res.status,200);
 assert.equal(db.data.cards.length,0);
 assert.equal(db.data.sources.length,0);
 assert.equal(db.data.events.length,2);
 res=await route(fakeRequest('/api/knowledge/'+id,{method:'DELETE',headers:{origin:base,'x-control-room':'1'}}),db);
 assert.equal(res.status,404);
});
