import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';
import { ALL_ITEMS, RARITY, MYSTIC_POOL } from '../lineage-idle/src/data/items/index.js';
import { buyItem, buyMysticItem, sellItem, sellAllJunk, buybackItem, rerollMysticStock, rollMysticStock, MYSTIC_REROLL_COST } from '../lineage-idle/src/services/ShopService.js';
import { getMaxInventorySlots } from '../lineage-idle/src/services/InventoryService.js';

function withShopData(run) {
  const previousWindow = globalThis.window;
  globalThis.window = { GameData: { ALL_ITEMS, RARITY } };
  try { return run(); }
  finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
}

describe('Mercador — economic safeguards with disposable state', () => {
  it('tooltip sale handler from main.js rejects a malformed wallet before removing the item', () => withShopData(() => {
    const mainSource = readFileSync(new URL('../lineage-idle/main.js', import.meta.url), 'utf8');
    const start = mainSource.indexOf('export function sellItem(uid) {');
    const end = mainSource.indexOf('// --------------------------- CRAFTING', start);
    assert.notEqual(start, -1);
    assert.ok(end > start);
    const handlerSource = mainSource.slice(start, end).replace('export function sellItem(uid)', 'function sellItem(uid)');
    const state = DEFAULT_STATE();
    const item = { uid: 'tooltip-invalid-wallet', itemId: 'short_sword', count: 1, rarity: 'common', equipped: false };
    state.inventory = [item];
    state.gold = 'invalid-balance';
    const runHandler = new Function('state', 'window', 'isHighValueItem', 'confirm', 'D', 'serviceSellItem', 'log', 'updateAllUI', 'save', 'hideItemTooltip', `${handlerSource}; return sellItem;`)(
      state,
      {},
      () => false,
      () => true,
      () => ({ ALL_ITEMS: { short_sword: { name: 'Short Sword' } }, RARITY: {} }),
      sellItem,
      () => {},
      () => {},
      () => {},
      () => {},
    );

    assert.equal(runHandler(item.uid), false);
    assert.equal(state.inventory[0].uid, item.uid);
    assert.equal(state.gold, 'invalid-balance');
    assert.equal(state.buybackQueue, undefined);
  }));

  it('bulk purchase debits the exact price and grants the requested stack quantity', () => withShopData(() => {
    const state = DEFAULT_STATE();
    const itemId = 'hp_potion_s';
    const quantity = 10;
    const price = ALL_ITEMS[itemId].price;
    state.gold = 1_000_000;

    assert.equal(buyItem(state, itemId, quantity), true);
    assert.equal(state.gold, 1_000_000 - (price * quantity));
    assert.equal(state.inventory.reduce((total, item) => total + (item.itemId === itemId ? item.count || 1 : 0), 0), quantity);
  }));

  it('normal and mystic purchases reject malformed wallets without granting items or removing stock', () => withShopData(() => {
    for (const purchase of [
      (state) => buyItem(state, 'hp_potion_s', 1),
      (state) => buyMysticItem(state, 'hp_potion_s', 'common'),
    ]) {
      const state = DEFAULT_STATE();
      state.gold = 'invalid-balance';
      state.mysticShopInventory = [{ id: 'hp_potion_s', itemId: 'hp_potion_s', rarity: 'common', amount: 1 }];
      const inventoryBefore = structuredClone(state.inventory);
      const stockBefore = structuredClone(state.mysticShopInventory);

      assert.equal(purchase(state), false);
      assert.equal(state.gold, 'invalid-balance');
      assert.deepEqual(state.inventory, inventoryBefore);
      assert.deepEqual(state.mysticShopInventory, stockBefore);
    }
  }));

  it('mystic stock reroll rejects a malformed wallet without rotating stock or saving', () => {
    const state = DEFAULT_STATE();
    state.gold = 'invalid-balance';
    state.mysticShopInventory = [{ itemId: 'old_stock', rarity: 'rare' }];
    let rerolls = 0;
    let saves = 0;

    assert.equal(rerollMysticStock(state, () => { rerolls += 1; return [{ itemId: 'new_stock', rarity: 'epic' }]; }, { save: () => { saves += 1; } }), false);
    assert.equal(state.gold, 'invalid-balance');
    assert.deepEqual(state.mysticShopInventory, [{ itemId: 'old_stock', rarity: 'rare' }]);
    assert.equal(rerolls, 0);
    assert.equal(saves, 0);

    state.gold = MYSTIC_REROLL_COST;
    assert.equal(rerollMysticStock(state, () => [], { save: () => { saves += 1; } }), false);
    assert.equal(state.gold, MYSTIC_REROLL_COST);
    assert.deepEqual(state.mysticShopInventory, [{ itemId: 'old_stock', rarity: 'rare' }]);
    assert.equal(saves, 0);
    assert.equal(rerollMysticStock(state, () => { rerolls += 1; return Array.from({ length: 6 }, (_, index) => ({ itemId: `new_stock_${index}`, rarity: 'epic' })); }), true);
    assert.equal(state.gold, 0);
    assert.equal(state.mysticShopInventory[0].itemId, 'new_stock_0');
    assert.equal(rerolls, 1);
  });

  it('mystic stock keeps six distinct offers and never falls back to ineligible grades', () => {
    const previousWindow = globalThis.window;
    const previousRandom = Math.random;
    const allItems = Object.fromEntries([
      ...Array.from({ length: 8 }, (_, index) => [`eligible_${index}`, { id: `eligible_${index}`, grade: 'ng' }]),
      ['high_1', { id: 'high_1', grade: 's' }],
      ['high_2', { id: 'high_2', grade: 's84' }],
      ...['scroll_of_enchant_weapon_', 'scroll_of_enchant_armor', 'scroll_of_resurrection', 'teleport_scroll'].map(id => [id, { id, grade: 'ng' }]),
    ]);
    globalThis.window = { GameData: { ALL_ITEMS: allItems, MYSTIC_POOL: Array.from({ length: 8 }, (_, index) => `eligible_${index}`), RARITY: {} } };
    Math.random = () => 0;
    try {
      const stock = rollMysticStock(1);
      assert.equal(stock.length, 6);
      assert.equal(new Set(stock.map(item => item.itemId)).size, 6);

      globalThis.window.GameData.MYSTIC_POOL = ['high_1', 'high_2'];
      const lowLevelStock = rollMysticStock(1);
      assert.equal(lowLevelStock.length, 6);
      assert.ok(lowLevelStock.every(item => ['scroll_of_enchant_weapon_', 'scroll_of_enchant_armor', 'scroll_of_resurrection', 'teleport_scroll'].includes(item.itemId)));
    } finally {
      Math.random = previousRandom;
      if (previousWindow === undefined) delete globalThis.window;
      else globalThis.window = previousWindow;
    }
  });

  it('real catalog stock respects every mystic shop grade boundary', () => {
    const previousWindow = globalThis.window;
    const previousRandom = Math.random;
    const maxGradeByLevel = [[1, 'ng'], [20, 'd'], [39, 'd'], [40, 'c'], [51, 'c'], [52, 'b'], [61, 'b'], [62, 'a'], [75, 'a'], [76, 's'], [80, 's'], [81, 's84']];
    const gradeOrder = { ng: 0, d: 1, c: 2, b: 3, a: 4, s: 5, s80: 6, s84: 7 };
    globalThis.window = { GameData: { ALL_ITEMS, RARITY, MYSTIC_POOL } };
    Math.random = () => 0;
    try {
      for (const [level, maxGrade] of maxGradeByLevel) {
        const stock = rollMysticStock(level);
        assert.equal(stock.length, 6, `level ${level} should show six offers`);
        for (const offer of stock) {
          const item = ALL_ITEMS[offer.itemId];
          if (!item || !MYSTIC_POOL.includes(offer.itemId)) continue;
          const grade = String(item.grade || 'ng').toLowerCase();
          assert.ok((gradeOrder[grade] ?? 0) <= gradeOrder[maxGrade], `level ${level} must not offer ${grade}-grade ${offer.itemId}`);
        }
      }
    } finally {
      Math.random = previousRandom;
      if (previousWindow === undefined) delete globalThis.window;
      else globalThis.window = previousWindow;
    }
  });

  it('full bag blocks normal and mystic purchases without charging or removing stock', () => withShopData(() => {
    const state = DEFAULT_STATE();
    const maxSlots = getMaxInventorySlots(state);
    state.inventory = Array.from({ length: maxSlots }, (_, index) => ({ uid: `disposable-filler-${index}`, itemId: 'short_sword', count: 1 }));
    state.gold = 1_000_000;
    state.mysticShopInventory = [{ id: 'hp_potion_s', itemId: 'hp_potion_s', rarity: 'common', amount: 1 }];
    const goldBefore = state.gold;

    assert.equal(buyItem(state, 'hp_potion_s', 1), false);
    assert.equal(buyMysticItem(state, 'hp_potion_s', 'common'), false);
    assert.equal(state.gold, goldBefore);
    assert.equal(state.mysticShopInventory.length, 1);
  }));

  it('individual sale rejects an item equipped by the canonical equipment slots', () => {
    const state = DEFAULT_STATE();
    const equippedItem = { uid: 'discarded-equipped-weapon', itemId: 'short_sword', count: 1, rarity: 'common', equipped: false };
    state.inventory = [equippedItem];
    state.equipment.weapon = equippedItem.uid;
    state.gold = 0;

    assert.equal(sellItem(state, equippedItem.uid), false);
    assert.equal(state.inventory.length, 1);
    assert.equal(state.gold, 0);
  });

  it('sales and buyback reject malformed wallets without changing inventory or queues', () => withShopData(() => {
    const item = { uid: 'invalid-wallet-sale', itemId: 'short_sword', count: 1, rarity: 'common', equipped: false };
    const operations = [
      { run: (state) => sellItem(state, item.uid), expected: false },
      { run: (state) => sellAllJunk(state), expected: { count: 0, goldGained: 0 } },
      { run: (state) => buybackItem(state, 0), expected: false },
    ];

    for (let index = 0; index < operations.length; index += 1) {
      const state = DEFAULT_STATE();
      state.gold = 'invalid-balance';
      state.inventory = [{ ...item, uid: `${item.uid}-${index}` }];
      state.buybackQueue = [{ itemCopy: { ...item, uid: `buyback-${index}` }, sellPrice: 10 }];
      const inventoryBefore = structuredClone(state.inventory);
      const queueBefore = structuredClone(state.buybackQueue);

      assert.deepEqual(operations[index].run(state), operations[index].expected);
      assert.equal(state.gold, 'invalid-balance');
      assert.deepEqual(state.inventory, inventoryBefore);
      assert.deepEqual(state.buybackQueue, queueBefore);
    }
  }));

  it('buyback rejection does not initialize a missing inventory as a side effect', () => {
    const state = { gold: 'invalid-balance', buybackQueue: [{ itemCopy: { uid: 'pending-return', itemId: 'short_sword', count: 1 }, sellPrice: 10 }] };

    assert.equal(buybackItem(state, 0), false);
    assert.equal(Object.hasOwn(state, 'inventory'), false);
    assert.equal(state.buybackQueue.length, 1);
    assert.equal(state.gold, 'invalid-balance');
  });

  it('junk sale preserves items equipped by equipment slots even if the legacy flag is missing', () => {
    const state = DEFAULT_STATE();
    const equippedItem = { uid: 'discarded-equipped-junk', itemId: 'short_sword', count: 1, rarity: 'common', equipped: false };
    state.inventory = [equippedItem];
    state.equipment.weapon = equippedItem.uid;
    state.gold = 0;

    assert.deepEqual(sellAllJunk(state), { count: 0, goldGained: 0 });
    assert.equal(state.inventory[0].uid, equippedItem.uid);
    assert.equal(state.gold, 0);
  });

  it('partial-stack buyback never creates duplicate inventory UIDs', () => {
    const state = DEFAULT_STATE();
    const stack = { uid: 'discarded-stack-uid', itemId: 'healing_potion', count: 4, rarity: null, equipped: false };
    state.inventory = [stack];
    state.gold = 0;

    assert.equal(sellItem(state, stack.uid, 1), true);
    assert.equal(state.inventory[0].count, 3);
    assert.equal(buybackItem(state, 0), true);
    assert.equal(state.inventory.length, 1, 'buyback should restore the sold quantity to the original partial stack');
    assert.equal(new Set(state.inventory.map(item => item.uid)).size, state.inventory.length);
    assert.equal(state.inventory.reduce((total, item) => total + item.count, 0), 4);
  });

  it('buyback rejects a full bag without charging or consuming the queued item', () => {
    const state = DEFAULT_STATE();
    const maxSlots = getMaxInventorySlots(state);
    state.inventory = Array.from({ length: maxSlots }, (_, index) => ({ uid: `filler-${index}`, itemId: 'healing_potion', count: 1 }));
    state.buybackQueue = [{ itemCopy: { uid: 'discarded-return', itemId: 'short_sword', count: 1 }, sellPrice: 25 }];
    state.gold = 100;

    assert.equal(buybackItem(state, 0), false);
    assert.equal(state.inventory.length, maxSlots);
    assert.equal(state.buybackQueue.length, 1);
    assert.equal(state.gold, 100);
  });
});
