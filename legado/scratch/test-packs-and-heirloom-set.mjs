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

// 1. Testar Compra do Pack 1 no Nível 1 (Guerreiro / Heavy)
const statePack1 = {
  class: 'paladin',
  adenCoins: 500,
  inventory: [],
  equipment: {},
  level: 1
};

const ok1 = CashShopService.buyStarterPack(statePack1, 'starter_pack_tier1', { log: () => {} });
assert(ok1, 'Compra do Starter Pack 1 realizada com sucesso no Nível 1');
assert(statePack1.inventory.length >= 8, 'Inventário recebeu armaduras de herança, arma, shots e poções do Pack 1');

for (const invItem of statePack1.inventory) {
  const def = ALL_ITEMS[invItem.itemId];
  assert(!!def, `Item do Pack 1 '${invItem.itemId}' existe em ALL_ITEMS`);
  const equipSlots = ['weapon', 'armor', 'legs', 'helmet', 'gloves', 'boots', 'necklace', 'earring', 'earring1', 'earring2', 'ring', 'ring1', 'ring2', 'cloak', 'belt', 'hair', 'shield'];
  if (def.slot && equipSlots.includes(def.slot)) {
    assert(invItem.isHeirloom || def.isHeirloom, `Equipamento do Pack 1 '${def.name}' é Item de Herança (Lv. 1 ao 40)`);
  }
}

// Equipar itens do Pack 1 no Level 1
const p1Armor = statePack1.inventory.find(i => i.itemId === 'armor_heirloom_chest_heavy');
assert(!!p1Armor, 'Armadura de Herança entregue no Pack 1');
statePack1.equipment.armor = p1Armor.uid;
const statsP1 = getStats(statePack1);
assert(statsP1.def > 0, `Armadura de Herança equipada com sucesso no Nível 1 (P.Def: ${statsP1.def})`);

// 2. Testar Compra do Pack 2 no Nível 1 (Mago / Robe)
const statePack2 = {
  class: 'sorcerer',
  adenCoins: 500,
  inventory: [],
  equipment: {},
  level: 1
};

const ok2 = CashShopService.buyStarterPack(statePack2, 'starter_pack_tier2', { log: () => {} });
assert(ok2, 'Compra do Starter Pack 2 realizada com sucesso no Nível 1');
assert(statePack2.title === 'Pioneiro', 'Título [Pioneiro] desbloqueado e ativado');

for (const invItem of statePack2.inventory) {
  const def = ALL_ITEMS[invItem.itemId];
  assert(!!def, `Item do Pack 2 '${invItem.itemId}' existe em ALL_ITEMS`);
  const equipSlots = ['weapon', 'armor', 'legs', 'helmet', 'gloves', 'boots', 'necklace', 'earring', 'earring1', 'earring2', 'ring', 'ring1', 'ring2', 'cloak', 'belt', 'hair', 'shield'];
  if (def.slot && equipSlots.includes(def.slot)) {
    assert(invItem.isHeirloom || def.isHeirloom, `Equipamento/Joia do Pack 2 '${def.name}' é Item de Herança (Lv. 1 ao 40)`);
  }
}

// Equipar Joias e Robe do Pack 2 no Level 1
const p2Necklace = statePack2.inventory.find(i => i.itemId === 'jewelry_heirloom_necklace');
assert(!!p2Necklace, 'Colar de Herança entregue no Pack 2');
statePack2.equipment.necklace = p2Necklace.uid;
const statsP2 = getStats(statePack2);
assert(statsP2.mdef > 0, `Colar de Herança equipado com sucesso no Nível 1 (M.Def: ${statsP2.mdef})`);

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
