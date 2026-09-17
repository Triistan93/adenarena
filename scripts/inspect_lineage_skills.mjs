import { CANONICAL_CLASS_REGISTRY } from '../lineage-idle/src/data/classes/CanonicalClassRegistry.js';
import { CANONICAL_CLASS_REGISTRY_V2 } from '../lineage-idle/src/data/classes/CanonicalClassRegistryV2.js';
import { CANONICAL_SKILL_REGISTRY_V2 } from '../lineage-idle/src/data/skills/CanonicalSkillRegistryV2.js';
import { CanonicalClassGraph } from '../lineage-idle/src/data/classes/CanonicalClassGraph.js';

console.log('Total Lineages in CanonicalClassGraph:', CanonicalClassGraph.getLineagesCount());

const terminals = CanonicalClassGraph.getTerminalClasses();
console.log('Total 3rd Classes (Terminals):', terminals.length);

let totalSkillsMapped = 0;
let lineagesSummary = [];

for (const term of terminals) {
  const chain = CanonicalClassGraph.getLineageChain(term.id);
  const lineageInfo = {
    race: term.race,
    lineageId: term.lineageId || term.id,
    terminalName: term.name,
    chain: []
  };

  for (const node of chain) {
    const v2Node = CANONICAL_CLASS_REGISTRY_V2[node.id];
    const skillIds = v2Node?.skillIds || [];
    lineageInfo.chain.push({
      stage: node.stage,
      stageName: node.stageName,
      classId: node.id,
      className: node.name,
      skillCount: skillIds.length
    });
  }
  lineagesSummary.push(lineageInfo);
}

console.log('Lineages Overview:');
for (const lin of lineagesSummary.slice(0, 10)) {
  console.log(`[${lin.race.toUpperCase()}] ${lin.terminalName} (${lin.lineageId}):`);
  for (const step of lin.chain) {
    console.log(`   Stage ${step.stage} (${step.stageName}): ${step.className} [${step.classId}] -> ${step.skillCount} skills`);
  }
}
