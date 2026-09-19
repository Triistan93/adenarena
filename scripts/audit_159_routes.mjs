import fs from 'node:fs';
import { CANONICAL_CLASS_REGISTRY } from '../lineage-idle/src/data/classes/CanonicalClassRegistry.js';
import { CANONICAL_CLASS_REGISTRY_V2 } from '../lineage-idle/src/data/classes/CanonicalClassRegistryV2.js';
import { resolveCanonicalClassId, resolveCanonicalDagClassId } from '../lineage-idle/src/data/classes/class_aliases.js';
import { resolveV2ClassContext } from '../lineage-idle/src/services/SkillEligibility.js';

const report = [];

for (const [id, node] of Object.entries(CANONICAL_CLASS_REGISTRY)) {
  const race = node.race;
  const stage = node.stage;
  const parent = node.parentClass;

  const resolvedAlias = resolveCanonicalClassId(id, race);
  const resolvedDag = resolveCanonicalDagClassId(id, race);
  const v2Ctx = resolveV2ClassContext(id, race);

  // Check race consistency
  let raceIssue = null;
  if (resolvedAlias.startsWith('human_') && race !== 'human') {
    raceIssue = `Alias maps to ${resolvedAlias} (human prefix for ${race})`;
  } else if (resolvedAlias.startsWith('elf_') && race !== 'elf') {
    raceIssue = `Alias maps to ${resolvedAlias} (elf prefix for ${race})`;
  } else if (resolvedAlias.startsWith('dark_elf_') && race !== 'darkelf') {
    raceIssue = `Alias maps to ${resolvedAlias} (darkelf prefix for ${race})`;
  }

  // Check V2 resolution
  let v2Note = v2Ctx.status;
  if (v2Ctx.status === 'RESOLVED') {
    const v2Node = CANONICAL_CLASS_REGISTRY_V2[v2Ctx.v2ClassId];
    if (v2Node && v2Node.stage !== stage) {
      v2Note += ` [STAGE MISMATCH: V1 stage ${stage} vs V2 stage ${v2Node.stage}]`;
    }
  }

  report.push({
    id,
    race,
    stage,
    parent,
    resolvedAlias,
    resolvedDag,
    v2Status: v2Ctx.status,
    v2ClassId: v2Ctx.v2ClassId,
    v2Note,
    skillsCount: v2Ctx.authorizedSkillIds?.length || 0,
    raceIssue
  });
}

fs.writeFileSync('scripts/audit_159_routes.json', JSON.stringify(report, null, 2), 'utf-8');

const raceIssues = report.filter(r => r.raceIssue);
console.log('=== RACE ISOLATION ISSUES IN ALIASES (' + raceIssues.length + ') ===');
raceIssues.forEach(r => console.log(`[VIOLATION] ${r.id} (${r.race}): ${r.raceIssue}`));

const stageMismatches = report.filter(r => r.v2Note.includes('STAGE MISMATCH'));
console.log('\n=== STAGE MISMATCHES IN V2 RESOLUTION (' + stageMismatches.length + ') ===');
stageMismatches.forEach(r => console.log(`[VIOLATION] ${r.id}: ${r.v2Note}`));

const unresolved = report.filter(r => r.v2Status === 'UNRESOLVED');
console.log('\n=== UNRESOLVED IN V2 (' + unresolved.length + ') ===');
unresolved.forEach(r => console.log(`[UNRESOLVED] ${r.id} (${r.race}, stage ${r.stage})`));

const contentGaps = report.filter(r => r.v2Status === 'CONTENT_GAP');
console.log('\n=== CONTENT_GAP IN V2 (' + contentGaps.length + ') ===');
contentGaps.forEach(r => console.log(`[CONTENT_GAP] ${r.id} (${r.race}, stage ${r.stage}) skills: ${r.skillsCount}`));
