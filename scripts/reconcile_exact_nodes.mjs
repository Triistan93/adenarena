import fs from 'node:fs';
import { CANONICAL_CLASS_REGISTRY } from '../lineage-idle/src/data/classes/CanonicalClassRegistry.js';
import { CANONICAL_CLASS_REGISTRY_V2 } from '../lineage-idle/src/data/classes/CanonicalClassRegistryV2.js';
import { resolveV2ClassContext } from '../lineage-idle/src/services/SkillEligibility.js';

const v1 = CANONICAL_CLASS_REGISTRY;
const v2 = CANONICAL_CLASS_REGISTRY_V2;

console.log('V1 keys count:', Object.keys(v1).length); // 159
console.log('V2 keys count:', Object.keys(v2).length); // 142

// Let's inspect the 136 RESOLVED count from earlier
let resolved = [];
let contentGap = [];
let unresolved = [];

for (const [id, node] of Object.entries(v1)) {
  const ctx = resolveV2ClassContext(id, node.race);
  if (ctx.status === 'RESOLVED') resolved.push({ id, v2ClassId: ctx.v2ClassId, race: node.race, stage: node.stage });
  else if (ctx.status === 'CONTENT_GAP') contentGap.push({ id, race: node.race, stage: node.stage, reason: ctx.contentGapReason });
  else unresolved.push({ id, race: node.race, stage: node.stage });
}

console.log(`\nStatus distribution of the 159 V1 classes against current resolveV2ClassContext:`);
console.log(`RESOLVED: ${resolved.length}`);
console.log(`CONTENT_GAP: ${contentGap.length}`);
console.log(`UNRESOLVED: ${unresolved.length}`);
console.log(`Total: ${resolved.length + contentGap.length + unresolved.length}`);

// Which V2 classes are mapped by the 136 resolved V1 classes?
const mappedV2Ids = new Set(resolved.map(r => r.v2ClassId));
console.log(`Unique V2 classes mapped by the 136 resolved V1 classes: ${mappedV2Ids.size}`);

// Which V2 classes are NOT mapped by any of the 136 resolved V1 classes?
const unmappedV2 = Object.keys(v2).filter(k => !mappedV2Ids.has(k));
console.log(`\nV2 classes NOT mapped by the 136 resolved classes (${unmappedV2.length}):`);
console.log(unmappedV2);

// Now let's find the exact node-by-node correspondence between the 159 V1 classes and 142 V2 classes:
// Let's create an exact mapping table
