import test from 'node:test';
import assert from 'node:assert/strict';
import { Script } from 'node:vm';
import { HTML } from '../src/experience.js';
import { injectAtlas } from '../src/atlas.js';
import { injectMemory } from '../src/memory-ui.js';
import { injectCockpit } from '../src/cockpit.js';
import { injectPortfolio } from '../src/portfolio.js';
import { injectConnections, contextInventoryResponse } from '../src/context.js';

test('Connections becomes one private source-aware registry',()=>{
 const html=injectConnections(injectPortfolio(injectCockpit(injectMemory(injectAtlas(HTML)))));
 assert.equal(html.split('id="view-sistemi"').length-1,1);
 assert.match(html,/CONNESSIONI · REGISTRO PRIVATO/);
 assert.match(html,/id="context-count"/);
 assert.match(html,/id="context-groups"/);
 assert.match(html,/Una cosa ricordata resta visibile/);
 const inline=html.match(/<script>([\s\S]*?)<\/script>/);
 assert.ok(inline);
 assert.doesNotThrow(()=>new Script(inline[1]));
});

test('context API is destination-scoped and provenance-aware',async()=>{
 const db={
  prepare(sql){
   assert.match(sql,/FROM context_inventory WHERE destination=\?/);
   return {
    bind(destination){assert.equal(destination,'connections');return this},
    async all(){return {results:[{
      id:'conn:test',destination:'connections',item_type:'connection',name:'Test',
      status:'connected',detail:'Fixture',url:'',source:'live',source_status:'verified',
      observed_at:'2026-10-15T07:00:00Z',updated_at:'2026-10-15 07:00:00'
    }]}}
   };
  }
 };
 const response=await contextInventoryResponse(db,'connections');
 assert.equal(response.status,200);
 const body=await response.json();
 assert.equal(body.items.length,1);
 assert.equal(body.items[0].source_status,'verified');
 const bad=await contextInventoryResponse(db,'secrets');
 assert.equal(bad.status,400);
});

test('public context module contains no private account seeds or secrets',()=>{
 const source=injectConnections.toString()+contextInventoryResponse.toString();
 for(const term of ['TELEGRAM_BOT_TOKEN','ACCESS_OWNER_EMAIL','@gmail.com','password','secret key']) {
   assert.ok(!source.toLowerCase().includes(term.toLowerCase()),term+' must not be seeded in source');
 }
});
