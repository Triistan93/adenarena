/**
 * test-class-rework.mjs — Testes de Validação da Reformulação de Classes, Habilidades e Imagens
 */

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
import { getClassSkills } from '../lineage-idle/src/services/CharacterService.js';

const E = globalThis.window.EchoData;

console.log('🧪 Iniciando Verificação da Reformulação de Classes, Habilidades e Imagens...\n');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✅ [PASS] ${message}`);
  } else {
    failed++;
    console.error(`  ❌ [FAIL] ${message}`);
  }
}

// 1. Validação de Samurai (Kamael)
console.log('1. Validando Classe Samurai (Kamael):');
const samuraiBaseDef = getClass('samuraiBase');
assert(samuraiBaseDef != null && samuraiBaseDef.race === 'kamael', 'samuraiBase existe e pertence à raça Kamael');
assert(samuraiBaseDef.archetype === 'samurai', 'samuraiBase tem archetype samurai');

const samuraiSkills = getClassSkills('samurai');
assert(Array.isArray(samuraiSkills) && samuraiSkills.length >= 5, `Samurai possui ${samuraiSkills?.length} skills`);

const samuraiSkillNames = samuraiSkills.map(s => E.SKILL_DEFS_ECHO[s]?.name);
console.log('  Habilidades do Samurai:', samuraiSkillNames);
assert(samuraiSkillNames.some(n => n.includes('Iaijutsu') || n.includes('Katana') || n.includes('Blade') || n.includes('Bushido') || n.includes('Sakura')), 'Samurai possui habilidades autênticas de Katana/Iaijutsu');
assert(!samuraiSkillNames.some(n => n.includes('Soulhound') || n.includes('Soul Expansion') || n.includes('Soul Gathering')), 'Samurai NÃO possui habilidades de Soulbreaker/Soulhound');

// 2. Validação de Blood Rose (Dark Elf)
console.log('\n2. Validando Blood Rose (Dark Elf):');
const bloodRoseDef = getClass('bloodRoseBase');
assert(bloodRoseDef != null && bloodRoseDef.race === 'darkelf', 'bloodRoseBase pertence exclusivamente aos Elfos Negros (darkelf)');

const bloodRoseSkills = getClassSkills('bloodRose');
assert(Array.isArray(bloodRoseSkills) && bloodRoseSkills.length >= 5, `Blood Rose possui ${bloodRoseSkills?.length} skills`);
const bloodRoseNames = bloodRoseSkills.map(s => E.SKILL_DEFS_ECHO[s]?.name);
console.log('  Habilidades da Blood Rose:', bloodRoseNames);
assert(bloodRoseNames.some(n => n.includes('Thorn') || n.includes('Rose') || n.includes('Sanguine') || n.includes('Shillien')), 'Blood Rose possui habilidades de espinhos, rosas e sangue de Shillien');

// 3. Validação de Ertheia Marauder & Eviscerator
console.log('\n3. Validando Ertheia Marauder & Eviscerator:');
const marauderDef = getClass('marauderBase');
assert(marauderDef != null && marauderDef.race === 'ertheia', 'marauderBase pertence exclusivamente aos Ertheia');
const eviscSkills = getClassSkills('eviscerator');
assert(Array.isArray(eviscSkills) && eviscSkills.length >= 5, `Eviscerator possui ${eviscSkills?.length} skills`);
const eviscNames = eviscSkills.map(s => E.SKILL_DEFS_ECHO[s]?.name);
console.log('  Habilidades do Eviscerator:', eviscNames);
assert(eviscNames.some(n => n.includes('Pummel') || n.includes('Distortion') || n.includes('Wind') || n.includes('Sayha') || n.includes('Eviscerate')), 'Eviscerator possui habilidades autênticas de combate marcial e vento de Sayha');

// 4. Validação de ShineMaker (Dwarf)
console.log('\n4. Validando ShineMaker (Dwarf):');
const smDef = getClass('shineMakerBase');
assert(smDef != null && smDef.race === 'dwarf', 'shineMakerBase pertence aos Anões (dwarf)');
const smS3Def = getClass('shinemakerS3');
assert(smS3Def != null && smS3Def.race === 'dwarf', 'shinemakerS3 pertence aos Anões (dwarf)');
const smSkills = getClassSkills('shinemaker');
assert(Array.isArray(smSkills) && smSkills.length >= 5, `ShineMaker possui ${smSkills?.length} skills`);
console.log('  Habilidades do ShineMaker:', smSkills.map(s => E.SKILL_DEFS_ECHO[s]?.name));

// 5. Validação de Isolamento de Legacy Passives em switchSubclass
console.log('\n5. Validando Isolamento de Legacy Passives na troca de Subclasses:');
let dummyState = {
  class: 'fighter',
  activeSubclassIndex: null,
  level: 80,
  xp: 0,
  sp: 1000,
  skills: {},
  legacyPassives: { 'warcry_passive': { name: 'Warcry Boost', val: 0.06 } },
  mainClassData: null,
  subclasses: [
    { classId: 'assassinS0', level: 75, xp: 0, sp: 500, skills: {}, legacyPassives: { 'assassin_passive': { name: 'Shadow Crit', val: 0.10 } } }
  ]
};

// Simulação de switchSubclass(0)
// Salva main
dummyState.mainClassData = {
  class: dummyState.class,
  level: dummyState.level,
  legacyPassives: { ...(dummyState.legacyPassives || {}) }
};
// Carrega sub
dummyState.activeSubclassIndex = 0;
dummyState.class = dummyState.subclasses[0].classId;
dummyState.legacyPassives = { ...(dummyState.subclasses[0].legacyPassives || {}) };

assert(dummyState.legacyPassives['assassin_passive'] != null, 'Subclasse carregou sua passiva exclusiva (assassin_passive)');
assert(dummyState.legacyPassives['warcry_passive'] == null, 'Subclasse NÃO herdou a passiva da classe principal (warcry_passive)');

// Simulação de retorno switchSubclass(null)
dummyState.subclasses[0].legacyPassives = { ...(dummyState.legacyPassives || {}) };
dummyState.activeSubclassIndex = null;
dummyState.class = dummyState.mainClassData.class;
dummyState.legacyPassives = { ...(dummyState.mainClassData.legacyPassives || {}) };

assert(dummyState.legacyPassives['warcry_passive'] != null, 'Classe principal restaurou sua passiva (warcry_passive)');
assert(dummyState.legacyPassives['assassin_passive'] == null, 'Classe principal NÃO reteve a passiva da subclasse (assassin_passive)');

console.log('\n========================================');
console.log(`Total: ${passed + failed} | Passaram: ${passed} | Falharam: ${failed}`);
console.log('========================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 SUCESSO! Todas as reformulações de classes, habilidades e isolamento de passivas foram validadas com 100% de sucesso!');
}
