import { CLASSES_ECHO } from '../lineage-idle/src/data/classes/classes_echo_defs.js';
import { CLASSES as FRONTEND_CLASSES } from '../src/data/index.js';

console.log('=== AUDITORIA COMPLETA DE CLASSES & ÁRVORES DE SKILLS ===\n');

console.log(`Total de classes no FRONTEND (src/data): ${Object.keys(FRONTEND_CLASSES).length}`);
console.log(`Total de classes no BACKEND/ECHO (classes_echo_defs): ${Object.keys(CLASSES_ECHO).length}\n`);

// 1. Verificar classes do FRONTEND que não existem no CLASSES_ECHO
const missingInEcho = [];
for (const [key, def] of Object.entries(FRONTEND_CLASSES)) {
  if (!CLASSES_ECHO[key]) {
    missingInEcho.push({ key, name: def.name, race: def.race });
  }
}

console.log(`❌ Classes do Frontend ausentes no CLASSES_ECHO (${missingInEcho.length}):`);
missingInEcho.forEach(m => console.log(`  - [${m.key}] "${m.name}" (${m.race})`));

// 2. Verificar classes no CLASSES_ECHO com 0 skills
const emptySkillsInEcho = [];
for (const [key, def] of Object.entries(CLASSES_ECHO)) {
  const skillCount = (def.skills || []).length;
  if (skillCount === 0) {
    emptySkillsInEcho.push({ key, name: def.name, race: def.race });
  }
}

console.log(`\n⚠️ Classes no CLASSES_ECHO com 0 skills (${emptySkillsInEcho.length}):`);
emptySkillsInEcho.forEach(e => console.log(`  - [${e.key}] "${e.name}" (${e.race})`));

// 3. Verificar classes do CharacterCreation.tsx
const creationClasses = [
  // Human
  'fighter', 'mage',
  // Elf
  'elfFighter', 'elfMage',
  // Dark Elf
  'darkFighter', 'darkMage', 'assassin',
  // Orc
  'orcFighter', 'orcMage', 'orcRider', 'raider', 'orcRaider',
  // Dwarf
  'artisan', 'scavenger',
  // Kamael
  'trooper', 'warder',
  // Sylph
  'sylphGunner',
  // High Elf
  'divineTemplar', 'spiritMaster',
  // Ertheia
  'ertheiaFighter', 'ertheiaMage'
];

console.log('\n🔍 Verificação específica das classes iniciais do Criador de Personagens:');
creationClasses.forEach(cls => {
  const echoDef = CLASSES_ECHO[cls];
  const count = echoDef ? (echoDef.skills || []).length : 0;
  const status = echoDef ? (count > 0 ? `✅ OK (${count} skills)` : '⚠️ 0 SKILLS') : '❌ NÃO ENCONTRADO NO CLASSES_ECHO';
  console.log(`  - ${cls}: ${status}`);
});
