import { CANONICAL_CLASS_REGISTRY } from '../lineage-idle/src/data/classes/CanonicalClassRegistry.js';
import { CANONICAL_CLASS_REGISTRY_V2 } from '../lineage-idle/src/data/classes/CanonicalClassRegistryV2.js';

console.log('=== LINEAGE RECONCILIATION ===');
const v1Lineages = {};
for (const [id, c] of Object.entries(CANONICAL_CLASS_REGISTRY)) {
  const lid = c.lineageId || 'unknown';
  if (!v1Lineages[lid]) v1Lineages[lid] = { race: c.race, count: 0, classes: [] };
  v1Lineages[lid].count++;
  v1Lineages[lid].classes.push({ id, stage: c.stage });
}

const v2Lineages = {};
for (const [id, c] of Object.entries(CANONICAL_CLASS_REGISTRY_V2)) {
  const lid = c.lineageId || 'unknown';
  if (!v2Lineages[lid]) v2Lineages[lid] = { count: 0, classes: [] };
  v2Lineages[lid].count++;
  v2Lineages[lid].classes.push({ id, stage: c.stage });
}

console.log('Total V1 Lineages:', Object.keys(v1Lineages).length);
console.log('Total V2 Lineages:', Object.keys(v2Lineages).length);

const onlyInV1Lids = Object.keys(v1Lineages).filter(k => !v2Lineages[k]);
console.log('Lineages in V1 but not in V2:', onlyInV1Lids);

for (const lid of Object.keys(v1Lineages)) {
  const v1 = v1Lineages[lid];
  const v2 = v2Lineages[lid];
  if (!v2) {
    console.log(`[V1 ONLY] Lineage ${lid} (${v1.race}): ${v1.classes.map(c => c.id).join(' -> ')}`);
  } else {
    // Check stages
    const v1Stages = v1.classes.map(c => `s${c.stage}:${c.id}`).join(', ');
    const v2Stages = v2.classes.map(c => `s${c.stage}:${c.id}`).join(', ');
    if (v1.count !== v2.count) {
      console.log(`[DIFF COUNT] Lineage ${lid}: V1 (${v1.count}): [${v1Stages}] vs V2 (${v2.count}): [${v2Stages}]`);
    }
  }
}
