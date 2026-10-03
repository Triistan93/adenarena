import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';
import { canCraft, craftItem } from '../lineage-idle/src/services/CraftService.js';
import { getMaxInventorySlots } from '../lineage-idle/src/services/InventoryService.js';
import { triggerQuestEvent } from '../lineage-idle/src/services/QuestService.js';

describe('Craft output transaction', () => {
  it('does not spend Adena, ingredients or forge progress when the output cannot fit', () => {
    const previousGameData = globalThis.GameData;
    globalThis.GameData = {
      ALL_ITEMS: {
        ore_test: { id: 'ore_test', name: 'Test Ore', slot: 'material', stack: 20 },
        blade_test: { id: 'blade_test', name: 'Test Blade', slot: 'weapon', atk: 10 }
      },
      CRAFTING_RECIPES: {
        recipe_blade_test: {
          id: 'recipe_blade_test',
          result: 'blade_test',
          level: 1,
          gold: 500,
          materials: [{ id: 'ore_test', count: 1 }]
        }
      }
    };

    try {
      const state = DEFAULT_STATE();
      const maxSlots = getMaxInventorySlots(state);
      state.gold = 10_000;
      state.inventory = Array.from({ length: maxSlots - 1 }, (_, index) => ({ uid: `filler-${index}`, itemId: `filler-${index}` }));
      state.inventory.push({ uid: 'ore-stack', itemId: 'ore_test', count: 2 });
      const beforeInventory = structuredClone(state.inventory);
      const beforeForge = { level: state.accountForgeLevel, exp: state.accountForgeExp, pity: state.craftFoundationPity };

      const crafted = craftItem(state, 'recipe_blade_test');

      assert.equal(crafted, false);
      assert.equal(state.gold, 10_000);
      assert.deepEqual(state.inventory, beforeInventory);
      assert.deepEqual({ level: state.accountForgeLevel, exp: state.accountForgeExp, pity: state.craftFoundationPity }, beforeForge);
    } finally {
      if (previousGameData === undefined) delete globalThis.GameData;
      else globalThis.GameData = previousGameData;
    }
  });

  it('rejects zero, negative, fractional and non-finite batch quantities without crafting one by accident', () => {
    const previousGameData = globalThis.GameData;
    globalThis.GameData = {
      ALL_ITEMS: {
        ore_test: { id: 'ore_test', name: 'Test Ore', slot: 'material', stack: 20 },
        blade_test: { id: 'blade_test', name: 'Test Blade', slot: 'weapon', atk: 10 }
      },
      CRAFTING_RECIPES: {
        recipe_blade_test: {
          id: 'recipe_blade_test',
          result: 'blade_test',
          level: 1,
          gold: 500,
          materials: [{ id: 'ore_test', count: 1 }]
        }
      }
    };

    try {
      for (const quantity of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
        const state = DEFAULT_STATE();
        state.gold = 10_000;
        state.inventory = [{ uid: 'ore-stack', itemId: 'ore_test', count: 10 }];
        const beforeInventory = structuredClone(state.inventory);

        assert.equal(canCraft(state, 'recipe_blade_test', quantity), false);
        assert.equal(craftItem(state, 'recipe_blade_test', quantity), false);
        assert.equal(state.gold, 10_000);
        assert.deepEqual(state.inventory, beforeInventory);
      }
    } finally {
      if (previousGameData === undefined) delete globalThis.GameData;
      else globalThis.GameData = previousGameData;
    }
  });

  it('commits the ingredient, Adena, output and forge experience together on a valid craft', () => {
    const previousGameData = globalThis.GameData;
    const previousRandom = Math.random;
    globalThis.GameData = {
      ALL_ITEMS: {
        ore_test: { id: 'ore_test', name: 'Test Ore', slot: 'material', stack: 20 },
        blade_test: { id: 'blade_test', name: 'Test Blade', slot: 'weapon', atk: 10 }
      },
      CRAFTING_RECIPES: {
        recipe_blade_test: {
          id: 'recipe_blade_test',
          result: 'blade_test',
          level: 1,
          gold: 500,
          materials: [{ id: 'ore_test', count: 1 }]
        }
      }
    };
    Math.random = () => 0.99;

    try {
      const state = DEFAULT_STATE();
      state.gold = 10_000;
      state.inventory = [{ uid: 'ore-stack', itemId: 'ore_test', count: 2 }];

      assert.equal(craftItem(state, 'recipe_blade_test'), true);
      assert.equal(state.gold, 9_500);
      assert.equal(state.inventory.find(item => item.uid === 'ore-stack').count, 1);
      assert.equal(state.inventory.filter(item => item.itemId === 'blade_test').length, 1);
      assert.ok(state.accountForgeExp > 0);
    } finally {
      Math.random = previousRandom;
      if (previousGameData === undefined) delete globalThis.GameData;
      else globalThis.GameData = previousGameData;
    }
  });

  it('reports only successfully committed crafts to the quest progress callback', () => {
    const previousGameData = globalThis.GameData;
    const previousRandom = Math.random;
    globalThis.GameData = {
      ALL_ITEMS: {
        ore_test: { id: 'ore_test', name: 'Test Ore', slot: 'material', stack: 20 },
        blade_test: { id: 'blade_test', name: 'Test Blade', slot: 'weapon', atk: 10 }
      },
      CRAFTING_RECIPES: {
        recipe_blade_test: {
          id: 'recipe_blade_test',
          result: 'blade_test',
          level: 1,
          gold: 500,
          materials: [{ id: 'ore_test', count: 1 }]
        }
      }
    };
    Math.random = () => 0.99;

    try {
      const state = DEFAULT_STATE();
      state.level = 10;
      state.gold = 10_000;
      state.inventory = [{ uid: 'ore-stack', itemId: 'ore_test', count: 3 }];
      const progress = [];

      assert.equal(craftItem(state, 'recipe_blade_test', 2, {
        onCraftSuccess: (count) => {
          progress.push(count);
          triggerQuestEvent(state, 'craft', count);
        }
      }), true);
      assert.deepEqual(progress, [2]);
      assert.equal(state.quests.progress.d_craft, 2, 'missão diária conta cada criação confirmada');

      const rejectedState = DEFAULT_STATE();
      rejectedState.level = 10;
      rejectedState.gold = 10_000;
      rejectedState.inventory = [{ uid: 'ore-stack', itemId: 'ore_test', count: 1 }];
      assert.equal(craftItem(rejectedState, 'recipe_blade_test', 2, {
        onCraftSuccess: (count) => {
          progress.push(count);
          triggerQuestEvent(rejectedState, 'craft', count);
        }
      }), false);
      assert.deepEqual(progress, [2], 'craft rejeitado não pode avançar a missão');
      assert.equal(rejectedState.quests?.progress?.d_craft, undefined);
    } finally {
      Math.random = previousRandom;
      if (previousGameData === undefined) delete globalThis.GameData;
      else globalThis.GameData = previousGameData;
    }
  });
});
