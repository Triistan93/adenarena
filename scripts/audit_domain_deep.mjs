import fs from 'node:fs';
import path from 'node:path';

// Load registries and data files
import { CANONICAL_CLASS_REGISTRY } from '../lineage-idle/src/data/classes/CanonicalClassRegistry.js';
import { CANONICAL_CLASS_REGISTRY_V2 } from '../lineage-idle/src/data/classes/CanonicalClassRegistryV2.js';
import { CANONICAL_SKILL_REGISTRY_V2 } from '../lineage-idle/src/data/skills/CanonicalSkillRegistryV2.js';
import { resolveV2ClassContext, isSkillInProgressionPath } from '../lineage-idle/src/services/SkillEligibility.js';
import { CLASS_ALIASES } from '../lineage-idle/src/data/classes/class_aliases.js';

const wikiClassesTree = JSON.parse(fs.readFileSync('scraped_data_wiki/classes_tree_canonical.json', 'utf-8'));
const wikiSkills = fs.existsSync('scraped_data_wiki/skills_detailed.json') 
  ? JSON.parse(fs.readFileSync('scraped_data_wiki/skills_detailed.json', 'utf-8'))
  : [];

console.log('=== 1. WIKI CANONICAL TREE DATASET ===');
console.log('Races count:', wikiClassesTree.length);
let totalWikiBranches = 0;
let wikiClassesSet = new Set();
wikiClassesTree.forEach(r => {
  totalWikiBranches += r.branches.length;
  r.branches.forEach(b => {
    if (b.base) wikiClassesSet.add(b.base);
    if (b.first) wikiClassesSet.add(b.first);
    if (b.second) wikiClassesSet.add(b.second);
    if (b.third) wikiClassesSet.add(b.third);
  });
});
console.log('Total Branches:', totalWikiBranches);
console.log('Total Unique Classes in Wiki Tree JSON:', wikiClassesSet.size);

console.log('\n=== 2. RUNTIME CANONICAL GRAPH (159) ===');
const v1Keys = Object.keys(CANONICAL_CLASS_REGISTRY);
console.log('Total V1 Classes:', v1Keys.length);

console.log('\n=== 3. RUNTIME V2 CATALOG (142) ===');
const v2Keys = Object.keys(CANONICAL_CLASS_REGISTRY_V2);
console.log('Total V2 Classes:', v2Keys.length);

// Compare Wiki Tree vs V1
const inWikiNotV1 = [...wikiClassesSet].filter(k => !CANONICAL_CLASS_REGISTRY[k]);
const inV1NotWiki = v1Keys.filter(k => !wikiClassesSet.has(k));
console.log('Classes in Wiki Tree not in V1:', inWikiNotV1);
console.log('Classes in V1 not in Wiki Tree:', inV1NotWiki);

// Let's check races in V1
const racesV1 = {};
v1Keys.forEach(k => {
  const c = CANONICAL_CLASS_REGISTRY[k];
  racesV1[c.race] = (racesV1[c.race] || 0) + 1;
});
console.log('\nClasses by Race in V1 (159):', racesV1);

// Let's check lineages and stages in V2
const stagesV2 = { 0: 0, 1: 0, 2: 0, 3: 0 };
const lineagesV2 = new Set();
v2Keys.forEach(k => {
  const c = CANONICAL_CLASS_REGISTRY_V2[k];
  stagesV2[c.stage] = (stagesV2[c.stage] || 0) + 1;
  if (c.lineageId) lineagesV2.add(c.lineageId);
});
console.log('\nStages Breakdown in V2 (142):', stagesV2);
console.log('Unique Lineages in V2:', lineagesV2.size);

// Check how many of the 159 V1 classes resolve to a V2 context
let resolvedCount = 0;
let contentGapCount = 0;
let unresolvedCount = 0;
const resolutionReport = [];

v1Keys.forEach(k => {
  const c = CANONICAL_CLASS_REGISTRY[k];
  const ctx = resolveV2ClassContext(k, c.race);
  if (ctx.status === 'RESOLVED') resolvedCount++;
  else if (ctx.status === 'CONTENT_GAP') contentGapCount++;
  else unresolvedCount++;
  resolutionReport.push({ id: k, race: c.race, stage: c.stage, status: ctx.status, v2ClassId: ctx.v2ClassId, skillsCount: ctx.authorizedSkillIds?.length || 0 });
});

console.log('\n=== 4. RESOLUTION OF V1 (159) TO V2 ===');
console.log('RESOLVED:', resolvedCount);
console.log('CONTENT_GAP:', contentGapCount);
console.log('UNRESOLVED:', unresolvedCount);

fs.writeFileSync('scripts/audit_classes_resolution_dump.json', JSON.stringify(resolutionReport, null, 2), 'utf-8');
console.log('Dump written to scripts/audit_classes_resolution_dump.json');
