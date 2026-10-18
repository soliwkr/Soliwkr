import test from 'node:test';
import assert from 'node:assert/strict';
import { Script } from 'node:vm';
import { HTML } from '../src/experience.js';
import { injectAtlas } from '../src/atlas.js';
import { injectMemory } from '../src/memory-ui.js';
import { injectCockpit } from '../src/cockpit.js';
import { injectPortfolio } from '../src/portfolio.js';
import { injectConnections } from '../src/context.js';
import { injectSystemMap } from '../src/system-map.js';

test('System Map integrates into the one existing authenticated Control Room',()=>{
 const html=injectSystemMap(injectConnections(injectPortfolio(injectCockpit(injectMemory(injectAtlas(HTML))))));
 assert.equal(html.split('id="view-mappa"').length-1,1);
 assert.match(html,/data-nav="mappa"/);
 assert.match(html,/mappa:'System Map'/);
 assert.match(html,/api\/projects/);
 assert.match(html,/api\/context\?destination=connections/);
 assert.match(html,/nessuna credenziale/i);
 const script=html.match(/<script>([\s\S]*?)<\/script>/);
 assert.ok(script);
 assert.doesNotThrow(()=>new Script(script[1]));
});
test('System Map leaves project inventory private and does not claim direct provider sync',()=>{
 const html=injectSystemMap(injectAtlas(HTML));
 assert.ok(!html.includes('info@trovatemi.it'));
 assert.ok(!html.includes('cloudflare_api_token'));
 assert.match(html,/adattatori server-side dedicati/);
 assert.match(html,/non certifica né ricavi/);
});
