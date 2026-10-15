import test from 'node:test';
import assert from 'node:assert/strict';
import { Script } from 'node:vm';
import { HTML } from '../src/experience.js';
import { injectAtlas } from '../src/atlas.js';
import { injectMemory } from '../src/memory-ui.js';
import { injectCockpit } from '../src/cockpit.js';

test('one cockpit, existing views, and preserved state-bound DOM controls',()=>{
 const html=injectCockpit(injectMemory(injectAtlas(HTML)));
 assert.match(html,/id="mission-control"/);
 assert.match(html,/MISSION CONTROL/);
 for(const id of ['view-oggi','view-vita','view-studio','view-mente','view-grafo','view-rituali','view-sistemi']) {
   assert.equal(html.split('id="'+id+'"').length-1,1,id+' must exist exactly once');
 }
 for(const id of ['date','greeting','focus-home','focus-ritual','not-doing','tasks-home','task-count','progress-bar','inbox-form','review-form','command-btn','project-grid','atlas-svg','knowledge-list']) {
   assert.equal(html.split('id="'+id+'"').length-1,1,id+' preserved exactly once');
 }
 for(const id of ['mc-worker','mc-d1','mc-github','mc-projects','mc-knowledge','mc-notes','mc-readiness','mc-refresh']) {
   assert.equal(html.split('id="'+id+'"').length-1,1,id+' single source status');
 }
 assert.match(html,/<details class="manual-archive"/);
 assert.match(html,/<summary>Pianificazione volontaria/);
 const index=html.indexOf('id="mission-control"');
 const manual=html.indexOf('id="manual-planning"');
 assert.ok(index>0&&manual>index,'observable overview before optional input');
 const inline=html.match(/<script>([\s\S]*?)<\/script>/);
 assert.ok(inline);
 assert.doesNotThrow(()=>new Script(inline[1]));
});

test('no unconnected feature is advertised as online or synthetic business success',()=>{
 const html=injectCockpit(injectMemory(injectAtlas(HTML)));
 assert.match(html,/Hermes · VPS/);
 assert.match(html,/Non verificato/);
 assert.match(html,/Jarvis · Cloudflare Think/);
 assert.match(html,/Da attivare/);
 assert.match(html,/Eventi automatici/);
 assert.match(html,/Non verificati/);
 assert.match(html,/id="mc-events-status"/);
 assert.match(html,/id="mc-events"/);
 assert.match(html,/Attività ≠ risultato/);
 assert.match(html,/Sconosciuto ≠ zero/);
 assert.ok(!html.includes('Jarvis online'));
});
