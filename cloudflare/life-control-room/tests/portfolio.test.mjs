import test from 'node:test';
import assert from 'node:assert/strict';
import { Script } from 'node:vm';
import { HTML } from '../src/experience.js';
import { injectAtlas } from '../src/atlas.js';
import { injectMemory } from '../src/memory-ui.js';
import { injectCockpit } from '../src/cockpit.js';
import { injectPortfolio, projectInventoryResponse } from '../src/portfolio.js';

test('Studio becomes a single private source-aware inventory surface',()=>{
 const html=injectPortfolio(injectCockpit(injectMemory(injectAtlas(HTML))));
 assert.equal(html.split('id="view-studio"').length-1,1);
 assert.match(html,/STUDIO · INVENTARIO PRIVATO/);
 assert.match(html,/Tutto quello che esiste/);
 assert.match(html,/id="portfolio-count"/);
 assert.match(html,/id="project-grid"/);
 assert.match(html,/memoria ChatGPT/);
 const inline=html.match(/<script>([\s\S]*?)<\/script>/);
 assert.ok(inline);
 assert.doesNotThrow(()=>new Script(inline[1]));
});

test('project inventory API returns D1 rows without fabricating activity',async()=>{
 const db={
  prepare(sql){
   assert.match(sql,/FROM project_inventory/);
   return {async all(){return {results:[{
    id:'repo:example/demo',name:'Demo',kind:'project',status:'building',group:'Product',
    repository:'example/demo',url:'https://github.com/example/demo',visibility:'private',
    source:'github',source_status:'verified',observed_at:'2026-10-15T07:00:00Z',updated_at:'2026-10-15 07:00:00'
   }]}}};
  }
 };
 const response=await projectInventoryResponse(db);
 assert.equal(response.status,200);
 const body=await response.json();
 assert.equal(body.projects.length,1);
 assert.equal(body.projects[0].name,'Demo');
 assert.equal(body.projects[0].pushed_at,null);
 assert.equal(body.projects[0].source_status,'verified');
});

test('public source file does not seed private portfolio names',()=>{
 const text=injectPortfolio.toString()+projectInventoryResponse.toString();
 for(const privateName of ['black-office','workprint','sudpontino','lucedestino','varco']) {
   assert.ok(!text.includes(privateName),privateName+' must remain data, not public source');
 }
});
