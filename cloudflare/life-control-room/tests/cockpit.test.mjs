import test from 'node:test';
import assert from 'node:assert/strict';
import { Script } from 'node:vm';
import { HTML } from '../src/experience.js';
import { injectAtlas } from '../src/atlas.js';
import { injectMemory } from '../src/memory-ui.js';
import { injectCockpit } from '../src/cockpit.js';

test('minimal home keeps one entrance, all rooms, and existing state controls',()=>{
 const html=injectCockpit(injectMemory(injectAtlas(HTML)));
 assert.match(html,/id="mission-control"/);
 assert.match(html,/Una porta\. Il resto nelle sue stanze\./);
 assert.match(html,/class="status-table"/);
 assert.match(html,/Stato sistema/);
 assert.ok(!html.includes('MISSION CONTROL'),'home must not look like a wall of operational cards');
 for(const id of ['view-oggi','view-vita','view-studio','view-mente','view-grafo','view-rituali','view-sistemi']) {
   assert.equal(html.split('id="'+id+'"').length-1,1,id+' must exist exactly once');
 }
 for(const id of ['date','greeting','focus-home','focus-ritual','not-doing','tasks-home','task-count','progress-bar','inbox-form','review-form','command-btn','project-grid','atlas-svg','knowledge-list']) {
   assert.equal(html.split('id="'+id+'"').length-1,1,id+' preserved exactly once');
 }
 for(const id of ['mc-worker','mc-d1','mc-github','mc-knowledge','mc-notes','mc-events-status','mc-events','mc-readiness','mc-refresh']) {
   assert.equal(html.split('id="'+id+'"').length-1,1,id+' single status value');
 }
 assert.match(html,/<details class="manual-archive"/);
 assert.match(html,/<summary>Modalità manuale/);
 const home=html.indexOf('id="mission-control"');
 const manual=html.indexOf('id="manual-planning"');
 assert.ok(home>0&&manual>home,'minimal home must precede optional manual planning');
 const inline=html.match(/<script>([\s\S]*?)<\/script>/);
 assert.ok(inline);
 assert.doesNotThrow(()=>new Script(inline[1]));
});

test('status table is factual and uses SOLIWKR canonical agent name',()=>{
 const html=injectCockpit(injectMemory(injectAtlas(HTML)));
 assert.match(html,/SOLIWKR · Cloudflare Think/);
 assert.match(html,/Non deployato/);
 assert.match(html,/Hermes · VPS/);
 assert.match(html,/Non verificato/);
 assert.match(html,/Eventi automatici/);
 assert.match(html,/In attesa/);
 assert.match(html,/assente ≠ zero/);
 assert.match(html,/attività ≠ risultato/);
 assert.ok(!html.includes('Jarvis'),'legacy agent name must not appear on the home surface');
});
