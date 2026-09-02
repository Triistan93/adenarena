import { CLASSES_ECHO, RACES_ECHO } from '../lineage-idle/src/data/classes/classes_echo_defs.js';
import { CLASS_ALIASES, resolveCanonicalClassId } from '../lineage-idle/src/data/classes/class_aliases.js';

// Setup window.EchoData
globalThis.window = {
  EchoData: {
    CLASSES_ECHO,
    RACES_ECHO,
    CLASS_ALIASES,
    resolveCanonicalClassId
  }
};

await import('../lineage-idle/data/echo-adapter.js');

import { getClass } from '../lineage-idle/src/engine/StatsEngine.js';
import { getClassSkills, promoteClass } from '../lineage-idle/src/services/CharacterService.js';

const E = globalThis.window.EchoData;
const allClasses = E.CLASSES_ECHO;

console.log('🧪 Testando Fluxo Completo de Evolução de Classe para Assassin e todas as classes...');

let state = {
  name: 'Zephyr',
  race: 'human',
  class: 'assassinS0', // or human_assassinbase
  level: 76,
  skills: { 'assassin_harmony': 1 }
};

// 1. Stage 0 -> Stage 1
console.log('\n1. Evolução Stage 0 -> Stage 1:');
const currentClassDef0 = getClass(state.class);
console.log('Current Class:', state.class, 'Def:', currentClassDef0?.name, 'Stage:', currentClassDef0?.stage);

const canon0 = resolveCanonicalClassId(state.class);
const cands1 = [];
for (const [clsId, clsDef] of Object.entries(allClasses)) {
  if (!clsDef || clsDef.stage !== 1) continue;
  if (clsDef.race && clsDef.race !== state.race) continue;
  const parentCanon = resolveCanonicalClassId(clsDef.parent);
  const clsCanon = resolveCanonicalClassId(clsId);
  if (clsDef.parent === state.class || clsDef.parent === canon0 || parentCanon === canon0 || parentCanon === state.class) {
    if (!cands1.some(c => c.id === clsCanon)) {
      cands1.push({ id: clsCanon, def: clsDef });
    }
  }
}
console.log('Candidatos Stage 1:', cands1.map(c => `${c.id} (${c.def.name})`));

if (cands1.length === 0) {
  throw new Error('Falha ao encontrar candidatos para Stage 1');
}

// Promote to Stage 1
promoteClass(state, cands1[0].id, { log: console.log });
console.log('Novo state.class após 1ª Troca:', state.class, 'Stage:', getClass(state.class)?.stage);

// 2. Stage 1 -> Stage 2
console.log('\n2. Evolução Stage 1 -> Stage 2:');
const canon1 = resolveCanonicalClassId(state.class);
const cands2 = [];
for (const [clsId, clsDef] of Object.entries(allClasses)) {
  if (!clsDef || clsDef.stage !== 2) continue;
  if (clsDef.race && clsDef.race !== state.race) continue;
  const parentCanon = resolveCanonicalClassId(clsDef.parent);
  const clsCanon = resolveCanonicalClassId(clsId);
  if (clsDef.parent === state.class || clsDef.parent === canon1 || parentCanon === canon1 || parentCanon === state.class) {
    if (!cands2.some(c => c.id === clsCanon)) {
      cands2.push({ id: clsCanon, def: clsDef });
    }
  }
}
console.log('Candidatos Stage 2:', cands2.map(c => `${c.id} (${c.def.name})`));
if (cands2.length === 0) {
  throw new Error('Falha ao encontrar candidatos para Stage 2');
}

// Promote to Stage 2
promoteClass(state, cands2[0].id, { log: console.log });
console.log('Novo state.class após 2ª Troca:', state.class, 'Stage:', getClass(state.class)?.stage);

// 3. Stage 2 -> Stage 3
console.log('\n3. Evolução Stage 2 -> Stage 3:');
const canon2 = resolveCanonicalClassId(state.class);
const cands3 = [];
for (const [clsId, clsDef] of Object.entries(allClasses)) {
  if (!clsDef || clsDef.stage !== 3) continue;
  if (clsDef.race && clsDef.race !== state.race) continue;
  const parentCanon = resolveCanonicalClassId(clsDef.parent);
  const clsCanon = resolveCanonicalClassId(clsId);
  if (clsDef.parent === state.class || clsDef.parent === canon2 || parentCanon === canon2 || parentCanon === state.class) {
    if (!cands3.some(c => c.id === clsCanon)) {
      cands3.push({ id: clsCanon, def: clsDef });
    }
  }
}
console.log('Candidatos Stage 3:', cands3.map(c => `${c.id} (${c.def.name})`));
if (cands3.length === 0) {
  throw new Error('Falha ao encontrar candidatos para Stage 3');
}

// Promote to Stage 3
promoteClass(state, cands3[0].id, { log: console.log });
console.log('Novo state.class após 3ª Troca (3rd Job):', state.class, 'Stage:', getClass(state.class)?.stage);

console.log('\n🎉 SUCESSO! Fluxo de 1ª, 2ª e 3ª Troca de Classe concluído sem erros!');
