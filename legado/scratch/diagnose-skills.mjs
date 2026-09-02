import { CLASSES_ECHO, RACES_ECHO } from '../lineage-idle/src/data/classes/classes_echo_defs.js';
import { CLASS_ALIASES, resolveCanonicalClassId } from '../lineage-idle/src/data/classes/class_aliases.js';

// Setup mock window.EchoData
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
console.log('Total Classes in CLASSES_ECHO:', Object.keys(E.CLASSES_ECHO).length);
console.log('Total in CLASS_SKILLS_ECHO:', Object.keys(E.CLASS_SKILLS_ECHO).length);
console.log('Total in SKILL_DEFS_ECHO:', Object.keys(E.SKILL_DEFS_ECHO).length);

const testClasses = [
  'human_assassinbase',
  'assassinbase',
  'assassinBase',
  'assassinS0',
  'assassin',
  'darkelf_assassin',
  'fighter',
  'mage',
  'deathPilgrim',
  'wargBase',
  'wargS0',
  'orcFighter',
  'rider',
  'sylphGunner',
  'bloodRoseBase',
  'highElfBase',
  'shineMakerS1',
  'kamaelSoldier'
];

import { getClassSkills } from '../lineage-idle/src/services/CharacterService.js';
import { getClass } from '../lineage-idle/src/engine/StatsEngine.js';

console.log('\n--- DIAGNÓSTICO DE SKILLS POR CLASSE ---');
for (const c of testClasses) {
  const canon = resolveCanonicalClassId(c);
  const def = getClass(c);
  const skills = getClassSkills(c);
  const skillDefs = skills ? skills.map(s => E.SKILL_DEFS_ECHO[s]).filter(Boolean) : [];
  console.log(`Class: "${c}" -> Canon: "${canon}" | Found Def: ${!!def} | Skills Count: ${skills?.length || 0} | Valid SkillDefs: ${skillDefs.length}`);
  if (!skills || skills.length === 0 || skillDefs.length === 0) {
    console.error(`  ❌ FALHA: ${c} não possui skills válidas!`);
  }
}
