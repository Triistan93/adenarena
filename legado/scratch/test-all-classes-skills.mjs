/**
 * test-all-classes-skills.mjs — Teste de Validação Universal de Todas as Classes e Habilidades
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

import { getClassSkills } from '../lineage-idle/src/services/CharacterService.js';
import { getClass } from '../lineage-idle/src/engine/StatsEngine.js';

const E = globalThis.window.EchoData;

console.log('🧪 Iniciando Verificação de 100% das Classes e Árvores de Habilidades...\n');

let totalTested = 0;
let passed = 0;
let failed = 0;

function assert(condition, message) {
  totalTested++;
  if (condition) {
    passed++;
  } else {
    failed++;
    console.error(`  ❌ [FAIL] ${message}`);
  }
}

// 1. Teste de todas as 225 classes definidas no CLASSES_ECHO
console.log(`1. Testando todas as ${Object.keys(CLASSES_ECHO).length} classes em CLASSES_ECHO:`);
for (const classId of Object.keys(CLASSES_ECHO)) {
  const def = getClass(classId);
  assert(def != null, `Definição de classe para "${classId}" encontrada`);

  const skills = getClassSkills(classId);
  assert(Array.isArray(skills) && skills.length >= 5, `Classe "${classId}" possui no mínimo 5 skills (recebeu: ${skills?.length || 0})`);

  if (skills && skills.length > 0) {
    for (const sId of skills) {
      const sDef = E.SKILL_DEFS_ECHO[sId];
      assert(sDef != null, `Skill "${sId}" da classe "${classId}" existe em SKILL_DEFS_ECHO`);
      assert(sDef?.name && sDef?.type && sDef?.icon, `Skill "${sId}" possui name, type e icon`);
    }
  }
}
console.log(`  ✅ Verificadas todas as ${Object.keys(CLASSES_ECHO).length} classes de CLASSES_ECHO.`);

// 2. Teste de todas as variantes de criação de personagem de todas as raças
console.log('\n2. Testando todas as classes de criação de personagens e variações de identificador:');
const creationVariants = [
  // Human
  'fighter', 'human_fighter', 'human_Fighter', 'mage', 'human_mage', 'deathPilgrim', 'human_deathpilgrim', 'wargBase', 'human_wargbase', 'human_warg', 'assassinS0', 'assassinBase', 'human_assassinbase', 'human_assassinBase', 'HUMAN_ASSASSINBASE', 'assassinbase',
  // Elf
  'elfFighter', 'elf_fighter', 'elfMage', 'elf_mage',
  // Dark Elf
  'darkElfFighter', 'darkelf_fighter', 'darkElfMage', 'darkelf_mage', 'darkelf_assassinbase', 'darkelf_deathpilgrim',
  // Orc
  'orcFighter', 'orc_fighter', 'orcMage', 'orc_mage', 'rider', 'orcRider', 'orc_rider', 'orc_vanguardbase', 'vanguardRider',
  // Dwarf
  'dwarfFighter', 'dwarf_fighter', 'artisan', 'dwarf_artisan', 'scavenger', 'dwarf_scavenger', 'shineMakerS1', 'dwarf_shinemakerbase', 'shinemakers1',
  // Kamael
  'kamaelSoldier', 'kamael_soldier', 'kamael_samuraibase', 'trooper', 'warder', 'soulBreakerKamael',
  // Sylph
  'sylphGunner', 'sylph_gunner', 'sharpshooter', 'windSniper', 'stormBlaster',
  // High Elf
  'highElfBase', 'highelf_base', 'highelf_templarbase', 'divineTemplarS1', 'elementWeaverS1',
  // Ertheia
  'bloodRoseBase', 'ertheia_bloodrosebase', 'marauder', 'eviscerator', 'sayhaSeer'
];

for (const variant of creationVariants) {
  const canon = resolveCanonicalClassId(variant);
  const def = getClass(variant);
  const skills = getClassSkills(variant);
  
  assert(canon != null && canon !== '', `Variante "${variant}" resolveu para ID canônico: "${canon}"`);
  assert(def != null, `Variante "${variant}" possui objeto de classe válido`);
  assert(Array.isArray(skills) && skills.length >= 5, `Variante "${variant}" (Canon: ${canon}) possui árvore com ${skills?.length || 0} skills`);

  if (!skills || skills.length === 0) {
    console.error(`  ❌ ERRO CRÍTICO: Variante "${variant}" resultou em árvore vazia!`);
  }
}
console.log(`  ✅ Verificadas todas as ${creationVariants.length} variantes de criação de personagem.`);

// 3. Teste de consistência do SKILL_TREE_LAYOUT_ECHO
console.log('\n3. Testando consistência do layout da árvore de talentos (SKILL_TREE_LAYOUT_ECHO):');
for (const variant of ['human_assassinbase', 'fighter', 'mage', 'wargBase', 'deathPilgrim', 'rider', 'shineMakerS1']) {
  const canon = resolveCanonicalClassId(variant);
  const layoutByClass = E.SKILL_TREE_LAYOUT_ECHO[canon] || E.SKILL_TREE_LAYOUT_ECHO[variant];
  assert(layoutByClass != null, `Layout existe para classe "${variant}" (Canon: ${canon})`);

  const skills = getClassSkills(variant) || [];
  for (const sId of skills) {
    const pos = E.SKILL_TREE_LAYOUT_ECHO[sId] || layoutByClass?.[sId];
    assert(pos != null && pos.col !== undefined && pos.row !== undefined, `Posição no layout da skill "${sId}" é válida: col ${pos?.col}, row ${pos?.row}`);
  }
}
console.log('  ✅ Layout de árvore de habilidades verificado.');

console.log('\n========================================');
console.log(`Total de Asserções: ${totalTested} | Passaram: ${passed} | Falharam: ${failed}`);
console.log('========================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 SUCESSO TOTAL! Todas as classes e variações possuem árvores de habilidades 100% populadas e válidas!');
}
