/**
 * test-alchemy-system.mjs — Testes Automatizados de Alquimia, Cadinho e Invocação do Chaos Boss
 */

import { ALL_ITEMS } from '../lineage-idle/src/data/items/index.js';
import {
  ALCHEMY_RECIPES,
  dissolveItem,
  dissolveItemsByGrade,
  dissolveAllJunkEquipment,
  craftElixir,
  useChaosBossSummonStone,
  processChaosBossLoot
} from '../lineage-idle/src/services/AlchemyService.js';
import { getStats } from '../lineage-idle/src/engine/StatsEngine.js';

let passed = 0;
let failed = 0;

function assert(desc, condition) {
  if (condition) {
    console.log(`  ✅ [PASS] ${desc}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${desc}`);
    failed++;
  }
}

console.log('\n🧪 Iniciando Testes do Sistema de Alquimia, Cadinho & Chaos Boss...\n');

// 1. Setup do Estado Inicial
const state = {
  characterClass: 'gladiator',
  level: 60,
  gold: 500000,
  inventory: [
    { uid: 'item_ng_sword', itemId: 'knight_sword', count: 1, equipped: false },
    { uid: 'item_d_armor', itemId: 'crimson_sword', count: 1, equipped: false },
    { uid: 'item_c_ring', itemId: 'bow_of_silence', count: 1, equipped: false },
    { uid: 'item_equipped_sword', itemId: 'knight_sword', count: 1, equipped: true },
    { uid: 'item_locked_armor', itemId: 'crimson_sword', count: 1, equipped: false }
  ],
  equipment: { weapon: 'item_equipped_sword' },
  lockedItems: ['item_locked_armor'],
  essences: { fire: 0, earth: 0, wind: 0, astral: 0 },
  activeElixirs: {},
  randomCraftCharge: 0
};

// 2. Teste: Dissolução Individual de Equipamento No-Grade
console.log('--- 🔥 1. Cadinho de Almas: Dissolução Individual ---');
const res1 = dissolveItem(state, 'item_ng_sword', {});
assert('Dissolveu espada No-Grade com sucesso', res1 === true);
assert('Recebeu Essência de Fogo', (state.essences.fire || 0) >= 1);
assert('Item foi removido da mochila', !state.inventory.find(i => i.uid === 'item_ng_sword'));

// 3. Teste: Proteção Anti-Perda (Item Equipado e Item Bloqueado)
console.log('\n--- 🔒 2. Proteção Anti-Perda no Cadinho ---');
const resEquipped = dissolveItem(state, 'item_equipped_sword', {});
assert('Recusou dissolver equipamento equipado', resEquipped === false);
assert('Item equipado continua intacto no inventário', !!state.inventory.find(i => i.uid === 'item_equipped_sword'));

const resLocked = dissolveItem(state, 'item_locked_armor', {});
assert('Recusou dissolver equipamento bloqueado (lockedItems)', resLocked === false);
assert('Item bloqueado continua intacto no inventário', !!state.inventory.find(i => i.uid === 'item_locked_armor'));

// 4. Teste: Dissolução em Lote por Grau
console.log('\n--- 🌪️ 3. Dissolução em Lote por Grau ---');
state.inventory.push(
  { uid: 'd_1', itemId: 'crimson_sword', count: 1, equipped: false },
  { uid: 'd_2', itemId: 'bow_of_silence', count: 1, equipped: false }
);
const dissolvedD = dissolveItemsByGrade(state, 'd', {});
assert('Dissolveu 2 equipamentos D-Grade em lote', dissolvedD >= 2);

// 5. Teste: Fabricação de Elixires Alquímicos
console.log('\n--- 🧪 4. Fabricação de Elixires Alquímicos ---');
state.essences = { fire: 100, earth: 100, wind: 100, astral: 100 };
const craftBerserk = craftElixir(state, 'elixir_berserker', 1, {});
assert('Fabricou Elixir do Berserker', craftBerserk === true);
assert('Buff de Berserker registrado em activeElixirs', !!state.activeElixirs['elixir_berserker']);

// Teste de bônus no StatsEngine
const stats = getStats(state);
assert('StatsEngine calculou atributos com bônus de Elixir ativo', (stats.atk || 0) > 0);

// 6. Teste: Fabricação da Pedra de Invocação do Caos
console.log('\n--- 🌀 5. Fabricação da Pedra de Invocação Abissal ---');
const craftSummonStone = craftElixir(state, 'boss_summon_stone', 1, {});
assert('Fabricou Pedra de Convocação Abissal', craftSummonStone === true);
assert('Pedra de Convocação guardada na mochila', !!state.inventory.find(i => i.itemId === 'boss_summon_stone'));

// 7. Teste: Invocação do Chaos Boss
console.log('\n--- 🐉 6. Invocação do Chefe do Caos no Modo Idle ---');
const summonSuccess = useChaosBossSummonStone(state, {});
assert('Invocou o Chaos Boss com sucesso', summonSuccess === true);
assert('Boss ativo no combate é um Chaos Boss', state.activeMonster && state.activeMonster.isChaosBoss === true);
assert('Nome do Boss contém [CHAOS]', state.activeMonster.name.includes('[CHAOS]'));
assert('HP do Chaos Boss foi escalado (+150%)', state.activeMonster.hp > 100000);
assert('Pedra de Convocação foi consumida da mochila', !state.inventory.find(i => i.itemId === 'boss_summon_stone' && (i.count || 1) > 0));

// 8. Teste: Derrota do Chaos Boss e Drops Especiais
console.log('\n--- 👑 7. Abate do Chaos Boss & Drops Abissais ---');
const prevInvCount = state.inventory.length;
processChaosBossLoot(state, state.activeMonster, {});
assert('Concedeu drops especiais no inventário', state.inventory.length > prevInvCount);
assert('Carga do Random Craft preenchida em 100%', state.randomCraftCharge === 100);

console.log('\n========================================');
console.log(`Total: ${passed + failed} | Passaram: ${passed} | Falharam: ${failed}`);
console.log('========================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 SUCESSO! Sistema de Alquimia, Cadinho e Chaos Boss 100% aprovado!\n');
}
