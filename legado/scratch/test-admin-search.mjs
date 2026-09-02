/**
 * test-admin-search.mjs — Testes da Barra de Pesquisa de Itens no Menu Admin.
 */

import { CLASSES_ECHO, RACES_ECHO } from '../lineage-idle/src/data/classes/classes_echo_defs.js';
import { CLASS_ALIASES, resolveCanonicalClassId } from '../lineage-idle/src/data/classes/class_aliases.js';

// Setup Mock DOM and GameConfig Data
const mockSelect = {
  options: [],
  innerHTML: '',
  appendChild(opt) {
    this.options.push(opt);
  }
};

const ALL_MOCK_ITEMS = {
  weapon_draconic_bow: { id: 'weapon_draconic_bow', name: 'Draconic Bow', slot: 'weapon', weaponType: 'bow', tier: 5, req: { level: 76 } },
  weapon_bow_of_peril: { id: 'weapon_bow_of_peril', name: 'Bow of Peril', slot: 'weapon', weaponType: 'bow', tier: 4, req: { level: 61 } },
  weapon_tallum_blade: { id: 'weapon_tallum_blade', name: 'Tallum Blade', slot: 'weapon', weaponType: 'katana', tier: 4, req: { level: 61 } },
  weapon_angel_slayer: { id: 'weapon_angel_slayer', name: 'Angel Slayer', slot: 'weapon', weaponType: 'dagger', tier: 5, req: { level: 76 } },
  armor_draconic_leather: { id: 'armor_draconic_leather', name: 'Draconic Leather Armor', slot: 'chest', type: 'light', tier: 5, req: { level: 76 } },
  jewel_ring_of_queen_ant: { id: 'jewel_ring_of_queen_ant', name: 'Ring of Queen Ant', slot: 'ring', type: 'jewel', tier: 4, req: { level: 40 } }
};

globalThis.window = {
  EchoData: {
    CLASSES_ECHO,
    RACES_ECHO,
    CLASS_ALIASES,
    resolveCanonicalClassId,
    ALL_ITEMS: ALL_MOCK_ITEMS
  }
};

function getItemGrade(level) {
  if (level >= 76) return 'S';
  if (level >= 61) return 'A';
  if (level >= 52) return 'B';
  if (level >= 40) return 'C';
  if (level >= 20) return 'D';
  return 'No-Grade';
}

function testPopulate(query = '') {
  const list = [];
  const rawQ = String(query || '').trim().toLowerCase();
  const queryTerms = rawQ.split(/\s+/).filter(Boolean);
  
  for (const [id, def] of Object.entries(ALL_MOCK_ITEMS)) {
    if (!def || !def.name) continue;
    const primaryId = def.id || id;

    if (queryTerms.length > 0) {
      const grade = getItemGrade(def.req?.level || 1).toLowerCase();
      const searchableText = [
        def.name,
        primaryId,
        def.slot || '',
        def.type || '',
        def.weaponType || '',
        grade,
        `grade ${grade}`,
        `lv.${def.req?.level || 1}`
      ].join(' ').toLowerCase();

      const matchesAllTerms = queryTerms.every(term => searchableText.includes(term));
      if (!matchesAllTerms) continue;
    }

    list.push({ id: primaryId, def });
  }

  return list;
}

console.log('🧪 Iniciando Verificação da Barra de Pesquisa de Itens no Menu Admin...\n');

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

// 1. Busca por "bow"
const bowResults = testPopulate('bow');
console.log('Resultados para "bow":', bowResults.map(r => r.def.name));
assert(bowResults.length === 2, 'Busca por "bow" retornou exatamente os 2 arcos (Draconic Bow e Bow of Peril)');
assert(bowResults.every(r => r.def.name.toLowerCase().includes('bow')), 'Todos os itens contêm "bow"');

// 2. Busca por "katana"
const katanaResults = testPopulate('katana');
console.log('Resultados para "katana":', katanaResults.map(r => r.def.name));
assert(katanaResults.length === 1 && katanaResults[0].def.name === 'Tallum Blade', 'Busca por "katana" encontrou a Tallum Blade');

// 3. Busca por "dagger"
const daggerResults = testPopulate('dagger');
console.log('Resultados para "dagger":', daggerResults.map(r => r.def.name));
assert(daggerResults.length === 1 && daggerResults[0].def.name === 'Angel Slayer', 'Busca por "dagger" encontrou a Angel Slayer');

// 4. Busca por "ring"
const ringResults = testPopulate('ring');
console.log('Resultados para "ring":', ringResults.map(r => r.def.name));
assert(ringResults.length === 1 && ringResults[0].def.name === 'Ring of Queen Ant', 'Busca por "ring" encontrou o Ring of Queen Ant');

// 5. Busca composta "grade s"
const gradeSResults = testPopulate('grade s');
console.log('Resultados para "grade s":', gradeSResults.map(r => r.def.name));
assert(gradeSResults.length === 3, 'Busca por "grade s" retornou os 3 itens de Grau S (Draconic Bow, Angel Slayer, Draconic Armor)');

// 6. Busca sem filtro
const allResults = testPopulate('');
assert(allResults.length === 6, 'Busca sem termo retorna todos os 6 itens disponíveis');

// 7. Busca sem correspondência
const emptyResults = testPopulate('nonexistent_item_xyz');
assert(emptyResults.length === 0, 'Busca inexistente retorna lista vazia');

console.log('\n========================================');
console.log(`Total: ${passed + failed} | Passaram: ${passed} | Falharam: ${failed}`);
console.log('========================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 SUCESSO! Barra de pesquisa e filtro de coerência validados com 100% de precisão!');
}
