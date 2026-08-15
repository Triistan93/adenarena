// test-packs-and-heirloom-set.mjs
import fs from 'node:fs';
import path from 'node:path';

let passed = 0;
let failed = 0;
function assert(condition, name) {
  if (condition) {
    console.log(`  ✓ ${name}`);
    passed++;
  } else {
    console.error(`  ❌ FALHA: ${name}`);
    failed++;
  }
}

globalThis.window = globalThis;
globalThis.window.EchoData = {};
globalThis.window.GameData = {};

await import('../lineage-idle/data/echo-adapter.js');
await import('../lineage-idle/src/data/items/index.js');
const { ALL_ITEMS } = await import('../lineage-idle/src/data/items/index.js');
const { CashShopService } = await import('../lineage-idle/src/services/CashShopService.js');
const { getStats, getActiveSetBonuses } = await import('../lineage-idle/src/engine/StatsEngine.js');

console.log('🧪 TESTANDO COMPRA DOS PACKS 1 E 2 E VALIDAÇÃO DOS ITENS...\n');

// 1. Testar Compra do Pack 1 (Guerreiro / Heavy)
const statePack1 = {
  class: 'paladin',
  adenCoins: 500,
  inventory: [],
  equipment: {},
  level: 20
};

const ok1 = CashShopService.buyStarterPack(statePack1, 'starter_pack_tier1', { log: () => {} });
assert(ok1, 'Compra do Starter Pack 1 realizada com sucesso');
assert(statePack1.inventory.length >= 8, 'Inventário recebeu armaduras, arma, shots e poções do Pack 1');

for (const invItem of statePack1.inventory) {
  const def = ALL_ITEMS[invItem.itemId];
  assert(!!def, `Item do Pack 1 '${invItem.itemId}' existe em ALL_ITEMS`);
}

// 2. Testar Compra do Pack 2 (Mago / Robe)
const statePack2 = {
  class: 'sorcerer',
  adenCoins: 500,
  inventory: [],
  equipment: {},
  level: 20
};

const ok2 = CashShopService.buyStarterPack(statePack2, 'starter_pack_tier2', { log: () => {} });
assert(ok2, 'Compra do Starter Pack 2 realizada com sucesso');
assert(statePack2.title === 'Pioneiro', 'Título [Pioneiro] desbloqueado e ativado');

for (const invItem of statePack2.inventory) {
  const def = ALL_ITEMS[invItem.itemId];
  assert(!!def, `Item do Pack 2 '${invItem.itemId}' existe em ALL_ITEMS`);
}

console.log('\n🧪 TESTANDO BÔNUS DE SET COMPLETO DE HERANÇA (XP/ADENA/STATS)...\n');

// 3. Testar Bônus de Set de Armadura de Herança (5 Peças)
const stateHeirloom5 = {
  class: 'warlord',
  level: 25,
  adenCoins: 1000,
  inventory: [],
  equipment: {}
};

CashShopService.buyStarterPack(stateHeirloom5, 'starter_pack_tier3', { log: () => {} });

// Equipar as 5 peças de armadura
const armorSlots = ['armor', 'legs', 'helmet', 'gloves', 'boots'];
for (const s of armorSlots) {
  const item = stateHeirloom5.inventory.find(i => {
    const def = ALL_ITEMS[i.itemId];
    return def && (def.slot === s || (s === 'armor' && def.slot === 'armor'));
  });
  if (item) {
    stateHeirloom5.equipment[s] = item.uid;
  }
}

const setRes5 = getActiveSetBonuses(stateHeirloom5);
const heirloomArmorBonus = setRes5.activeBonuses.find(b => b.setId === 'heirloom_set');
assert(!!heirloomArmorBonus, 'Conjunto Herança Soberana detectado em getActiveSetBonuses');
assert(heirloomArmorBonus?.equippedCount === 5, 'Contagem de 5 peças de armadura de herança confirmada');

const stats5 = getStats(stateHeirloom5);
assert(stats5.xpBoost >= 0.25, `Bônus de XP do Set 5 peças >= +25% (Atual: +${Math.round(stats5.xpBoost*100)}%)`);
assert(stats5.goldBoost >= 0.25, `Bônus de Adena do Set 5 peças >= +25% (Atual: +${Math.round(stats5.goldBoost*100)}%)`);

// 4. Testar Bônus de Lorde Soberano Full Set (12+ Peças de Herança Equipadas)
// Equipar Arma, Joias (Colar, 2 Brincos, 2 Anéis), Capa, Cinto, Coroa
const equipMapping = [
  { slot: 'weapon', itemId: 'weapon_heirloom_spear' },
  { slot: 'necklace', itemId: 'jewelry_heirloom_necklace' },
  { slot: 'earring1', itemId: 'jewelry_heirloom_earring_1' },
  { slot: 'earring2', itemId: 'jewelry_heirloom_earring_2' },
  { slot: 'ring1', itemId: 'jewelry_heirloom_ring_1' },
  { slot: 'ring2', itemId: 'jewelry_heirloom_ring_2' },
  { slot: 'cloak', itemId: 'cloak_heirloom_royal' },
  { slot: 'belt', itemId: 'belt_heirloom_champion' },
  { slot: 'hair', itemId: 'hair_heirloom_crown' }
];

for (const eq of equipMapping) {
  const it = stateHeirloom5.inventory.find(i => i.itemId === eq.itemId);
  if (it) {
    stateHeirloom5.equipment[eq.slot] = it.uid;
  }
}

const statsFull = getStats(stateHeirloom5);
assert(statsFull.xpBoost >= 0.60, `👑 Lorde Soberano Full Set (12+ pçs) concede +60% XP ou superior! (Atual: +${Math.round(statsFull.xpBoost*100)}%)`);
assert(statsFull.goldBoost >= 0.60, `👑 Lorde Soberano Full Set (12+ pçs) concede +60% Adena ou superior! (Atual: +${Math.round(statsFull.goldBoost*100)}%)`);
assert(statsFull.speed >= 1.25, `👑 Lorde Soberano Full Set concede velocidade de movimento adicional (Atual: ${statsFull.speed})`);

console.log(`\n========================================`);
console.log(`RESULTADO: ${passed} PASSARAM, ${failed} FALHARAM`);
console.log(`========================================\n`);

if (failed > 0) process.exit(1);
