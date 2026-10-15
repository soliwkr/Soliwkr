import test from 'node:test';
import assert from 'node:assert/strict';
import { Script } from 'node:vm';
import { HTML } from '../src/experience.js';
import { injectAtlas } from '../src/atlas.js';
import { injectMemory } from '../src/memory-ui.js';
import { injectCockpit } from '../src/cockpit.js';

test('G2 evidence action is present in the existing cockpit and browser script parses',()=>{
 const html=injectCockpit(injectMemory(injectAtlas(HTML)));
 assert.match(html,/id="soliwkr-brief"/);
 assert.match(html,/id="soliwkr-brief-result"/);
 assert.match(html,/\/api\/agent\/brief/);
 assert.equal((html.match(/id="mission-control"/g)||[]).length,1);
 const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
 assert.ok(scripts.length>=2);
 for(const match of scripts)assert.doesNotThrow(()=>new Script(match[1]));
});
