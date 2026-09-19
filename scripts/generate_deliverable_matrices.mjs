import fs from 'node:fs';
import { CANONICAL_CLASS_REGISTRY } from '../lineage-idle/src/data/classes/CanonicalClassRegistry.js';
import { CANONICAL_CLASS_REGISTRY_V2 } from '../lineage-idle/src/data/classes/CanonicalClassRegistryV2.js';
import { resolveV2ClassContext } from '../lineage-idle/src/services/SkillEligibility.js';
import { CanonicalClassGraph } from '../lineage-idle/src/data/classes/CanonicalClassGraph.js';

const graph = CanonicalClassGraph;

const matrixA = [];

for (const [id, c] of Object.entries(CANONICAL_CLASS_REGISTRY)) {
  const race = c.race;
  const stage = c.stage;
  const parent = c.parentClass || 'null';
  
  // Transitions/children in DAG
  const children = Array.from(graph.edges.get(id) || []);
  const promotions = children.length > 0 ? children.join(', ') : 'TERMINAL';

  const v2Ctx = resolveV2ClassContext(id, race);
  const v2ClassId = v2Ctx.v2ClassId || 'null';
  const v2Status = v2Ctx.status;

  let ownSkills = [];
  if (v2Ctx.v2ClassDef?.skillIds) {
    ownSkills = v2Ctx.v2ClassDef.skillIds;
  } else if (v2Ctx.authorizedSkillIds) {
    ownSkills = v2Ctx.authorizedSkillIds;
  }

  const skillsStr = `Próprias (${ownSkills.length}): [${ownSkills.slice(0, 3).join(', ')}${ownSkills.length > 3 ? '...' : ''}] / Acumuladas: ${v2Ctx.authorizedSkillIds?.length || 0}`;

  let evidence = '';
  let status = 'PASS';

  if (v2Status === 'CONTENT_GAP') {
    status = 'CONTENT_GAP';
    evidence = v2Ctx.contentGapReason || 'Lacuna canônica de estágio 0 documentada no dataset L2Wiki';
  } else if (v2Status === 'UNRESOLVED') {
    status = 'VIOLATION';
    evidence = 'Classe não resolvida para o catálogo V2';
  } else {
    status = 'PASS';
    evidence = `L2Wiki Essence / CanonicalClassRegistryV2 (${v2ClassId})`;
  }

  matrixA.push({
    id,
    race,
    stage,
    parent,
    promotions,
    v2Context: `${v2Status} (${v2ClassId})`,
    skillsStr,
    evidence,
    status
  });
}

fs.writeFileSync('scripts/matrix_a_dump.json', JSON.stringify(matrixA, null, 2), 'utf-8');

console.log('Matrix A generated. Total classes:', matrixA.length);
console.log('PASS count:', matrixA.filter(x => x.status === 'PASS').length);
console.log('CONTENT_GAP count:', matrixA.filter(x => x.status === 'CONTENT_GAP').length);
console.log('VIOLATION count:', matrixA.filter(x => x.status === 'VIOLATION').length);
