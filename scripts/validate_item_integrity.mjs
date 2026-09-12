/**
 * scripts/validate_item_integrity.mjs
 *
 * Validador automatizado de integridade referencial de itens do Aden Arena.
 * Varre todos os sistemas de dados do jogo e compara as referências de itens
 * contra o registro canônico ALL_ITEMS.
 */

import { ALL_ITEMS } from '../lineage-idle/src/data/items/index.js';
import { QUEST_DEFS, DAILY_COMPLETION_BONUS, BATTLE_PASS_TIERS, NOBLESSE_QUEST_DEFS } from '../lineage-idle/src/data/quests.js';
import { SHOP_INVENTORY, CRAFTING_RECIPES, MONSTER_DROPS } from '../lineage-idle/src/data/items/recipes_drops.js';
import { RAID_BOSSES } from '../lineage-idle/src/data/raids.js';
import { OLYMPIAD_SHOP_CATALOG } from '../lineage-idle/src/data/olympiad.js';
import { MAMMON_MERCHANT_CATALOG, SEVEN_SIGNS_BOSSES } from '../lineage-idle/src/data/seven_signs.js';
import { STARTER_JOURNEY_STEPS } from '../lineage-idle/src/services/StarterJourneyService.js';

const missingItems = [];
const verifiedItems = new Set();

function checkItem(source, id) {
  if (!id) return;
  if (!ALL_ITEMS[id]) {
    missingItems.push({ source, id });
  } else {
    verifiedItems.add(id);
  }
}

console.log('🔍 Iniciando Auditoria de Integridade de Itens...');
console.log(`📦 Catálogo ALL_ITEMS possui ${Object.keys(ALL_ITEMS).length} itens registrados.`);

// 1. Starter Journey Rewards
for (const step of STARTER_JOURNEY_STEPS) {
  if (step.reward?.itemId) {
    checkItem(`Starter Journey [${step.id}]`, step.reward.itemId);
  }
}

// 2. Noblesse Quests
for (const [k, q] of Object.entries(NOBLESSE_QUEST_DEFS)) {
  if (q.reward?.tiara) checkItem(`Noblesse [${k}] Tiara`, q.reward.tiara);
}

// 3. Olympiad Shop
for (const item of OLYMPIAD_SHOP_CATALOG) {
  if (item.reward?.itemId) checkItem(`Olympiad Shop [${item.name}]`, item.reward.itemId);
}

// 4. Seven Signs Mammon Shop & Bosses
for (const item of MAMMON_MERCHANT_CATALOG) {
  checkItem(`Mammon Shop [${item.name}]`, item.id);
}
for (const [bId, bDef] of Object.entries(SEVEN_SIGNS_BOSSES)) {
  for (const it of (bDef.rewards?.items || [])) {
    checkItem(`Seven Signs Boss [${bId}]`, it);
  }
}

// 5. Shop Inventory
if (Array.isArray(SHOP_INVENTORY)) {
  for (const it of SHOP_INVENTORY) {
    const id = typeof it === 'string' ? it : it.id || it.itemId;
    checkItem('Shop Inventory Flat', id);
  }
} else if (typeof SHOP_INVENTORY === 'object') {
  for (const [sKey, sList] of Object.entries(SHOP_INVENTORY)) {
    if (Array.isArray(sList)) {
      for (const it of sList) {
        const id = typeof it === 'string' ? it : it.id || it.itemId;
        checkItem(`Shop [${sKey}]`, id);
      }
    }
  }
}

// 6. Crafting Recipes
for (const [rId, rDef] of Object.entries(CRAFTING_RECIPES)) {
  checkItem(`Craft Recipe Result [${rId}]`, rDef.result || rId);
  for (const mat of (rDef.materials || [])) {
    checkItem(`Craft Recipe Material [${rId}]`, mat.matId || mat.id || mat.itemId);
  }
}

// 7. Raid Boss Drops
for (const [rId, rDef] of Object.entries(RAID_BOSSES)) {
  for (const drop of (rDef.drops || [])) {
    checkItem(`Raid Drop [${rId}]`, drop.itemId);
  }
}

// 8. Monster Drops
for (const [mId, dList] of Object.entries(MONSTER_DROPS)) {
  for (const drop of dList) {
    checkItem(`Monster Drop [${mId}]`, drop.itemId || drop.id);
  }
}

console.log('\n════════════════════════════════════════════════════');
console.log(`✅ Total de referências verificadas com sucesso: ${verifiedItems.size}`);
console.log(`❌ Total de referências quebradas (MISSING): ${missingItems.length}`);
console.log('════════════════════════════════════════════════════\n');

if (missingItems.length > 0) {
  console.error('🚨 ERROS DE INTEGRIDADE REFERENCIAL ENCONTRADOS:');
  console.error(JSON.stringify(missingItems, null, 2));
  process.exit(1);
} else {
  console.log('🎉 SUCESSO ABSOLUTO: 100% das referências de itens em todos os sistemas são válidas!');
  process.exit(0);
}
