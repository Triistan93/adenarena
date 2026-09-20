import fs from 'fs';
import { CANONICAL_CLASS_REGISTRY } from '../lineage-idle/src/data/classes/CanonicalClassRegistry.js';
import { CANONICAL_CLASS_REGISTRY_V2 } from '../lineage-idle/src/data/classes/CanonicalClassRegistryV2.js';

const manifest = JSON.parse(fs.readFileSync('./docs/INDEPENDENT_CLASS_EXPECTATIONS_MANIFEST.json', 'utf8'));
const links = manifest.classSkillLinks;

// For each class in CANONICAL_CLASS_REGISTRY, let's track its lineage from root to leaf
const classLineageMap = {};
for (const [id, c] of Object.entries(CANONICAL_CLASS_REGISTRY)) {
  const ancestors = [];
  let curr = c;
  while (curr.parentClass) {
    ancestors.push(curr.parentClass);
    curr = CANONICAL_CLASS_REGISTRY[curr.parentClass];
  }
  classLineageMap[id] = ancestors;
}

// Let's check skills introduced at each stage
// A skill is "introduced" at the lowest stage class in the lineage where it appears.
// If it also appears in child classes, in those child classes it is "inherited".
const skillIntroducedAt = {}; // skillId -> first classId where it appears
const ertheiaClasses = new Set(['marauder', 'ertheiaWarrior', 'eviscerator', 'sayhaSeer', 'windRiderErth', 'sayhaSeeker', 'marauderBase', 'sayhaMageBase']);

// Check each link
const ownProvenLinks = [];
const inheritedLinks = [];
const unprovenLinks = [];

// Track skills per class in stage order
const stageSortedClasses = Object.values(CANONICAL_CLASS_REGISTRY).sort((a, b) => a.stage - b.stage);

for (const c of stageSortedClasses) {
  const classLinks = links.filter(l => l.classId === c.id);
  const isErtheia = ertheiaClasses.has(c.id);

  for (const l of classLinks) {
    if (isErtheia) {
      unprovenLinks.push(l);
    } else {
      // Check if skill was seen in an ancestor
      const ancestors = classLineageMap[c.id];
      let inheritedFrom = null;
      for (const anc of ancestors) {
        const ancLinks = links.filter(al => al.classId === anc);
        if (ancLinks.some(al => al.skillId === l.skillId)) {
          inheritedFrom = anc;
          break;
        }
      }

      if (inheritedFrom) {
        inheritedLinks.push({ ...l, inheritedFrom });
      } else {
        ownProvenLinks.push(l);
      }
    }
  }
}

console.log('--- LINK PROVENANCE BREAKDOWN ---');
console.log('Vínculos próprios comprovados:', ownProvenLinks.length);
console.log('Vínculos parciais/herdados:', inheritedLinks.length);
console.log('Vínculos sem proveniência (Ertheia):', unprovenLinks.length);
console.log('Total de vínculos existentes:', ownProvenLinks.length + inheritedLinks.length + unprovenLinks.length);

// Missing positions (posições de conteúdo previstas mas ainda inexistentes)
// Denominator: 159 classes * 5 slots = 795 positions
const totalTheoreticalPositions = 159 * 5;
const missingPositionsCount = totalTheoreticalPositions - links.length;
console.log('Posições de conteúdo previstas, mas inexistentes:', missingPositionsCount);
console.log('Total teórico (Denominador Universal):', totalTheoreticalPositions);

// Let's list the missing positions by class:
const missingByClass = {};
for (const id of Object.keys(CANONICAL_CLASS_REGISTRY)) {
  const count = links.filter(l => l.classId === id).length;
  if (count < 5) {
    missingByClass[id] = { existing: count, missing: 5 - count };
  }
}
console.log('\nMissing positions by class:');
console.log(JSON.stringify(missingByClass, null, 2));
