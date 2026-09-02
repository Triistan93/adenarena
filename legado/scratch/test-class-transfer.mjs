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

const E = globalThis.window.EchoData;
const allClasses = E.CLASSES_ECHO;

function getCandidates(stateClass, stateRace, targetStage) {
  const canonStateClass = resolveCanonicalClassId(stateClass);
  const candidates = [];
  
  for (const [clsId, clsDef] of Object.entries(allClasses)) {
    if (!clsDef || clsDef.stage !== targetStage) continue;
    if (clsDef.race && clsDef.race !== stateRace) continue;

    const parentCanon = resolveCanonicalClassId(clsDef.parent);
    
    // Check match
    const matches = (clsDef.parent === stateClass)
      || (clsDef.parent === canonStateClass)
      || (parentCanon === canonStateClass)
      || (parentCanon === stateClass);

    if (matches) {
      if (!candidates.some(c => c.id === clsId || c.def.name === clsDef.name)) {
        candidates.push({ id: clsId, def: clsDef });
      }
    }
  }
  return candidates;
}

console.log('--- TESTE DE TRANSFERÊNCIA DE CLASSE ---');
const testStates = [
  { class: 'assassinS0', race: 'human', stage: 1 },
  { class: 'human_assassinbase', race: 'human', stage: 1 },
  { class: 'assassinBase', race: 'human', stage: 1 },
  { class: 'assassin', race: 'human', stage: 1 },
  { class: 'assassinS1', race: 'human', stage: 2 },
  { class: 'assassinS2', race: 'human', stage: 3 },
  { class: 'fighter', race: 'human', stage: 1 },
  { class: 'wargBase', race: 'human', stage: 1 },
  { class: 'deathPilgrim', race: 'human', stage: 1 },
  { class: 'orcFighter', race: 'orc', stage: 1 },
  { class: 'dwarfFighter', race: 'dwarf', stage: 1 },
  { class: 'highElfBase', race: 'highelf', stage: 1 },
  { class: 'bloodRoseBase', race: 'ertheia', stage: 1 }
];

for (const ts of testStates) {
  const cands = getCandidates(ts.class, ts.race, ts.stage);
  console.log(`Class: "${ts.class}" (Race: ${ts.race}) -> Stage ${ts.stage} Candidates:`, cands.map(c => `${c.id} (${c.def.name})`));
  if (cands.length === 0) {
    console.error(`  ❌ FALHA: Nenhuma opção encontrada para "${ts.class}" no stage ${ts.stage}!`);
  }
}
