import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';
import {
  addToInventory,
  getMaxInventorySlots,
  removeFromInventory,
  removeFromInventoryByItemId
} from '../lineage-idle/src/services/InventoryService.js';

describe('Inventory addition atomicity', () => {
  it('does not partially fill an existing stack when the required new slot is unavailable', () => {
    const previousGameData = globalThis.GameData;
    globalThis.GameData = {
      ALL_ITEMS: {
        potion_test: { id: 'potion_test', name: 'Test Potion', slot: 'consumable', type: 'consumable', stack: 2 }
      }
    };

    try {
      const state = DEFAULT_STATE();
      const maxSlots = getMaxInventorySlots(state);
      state.inventory = Array.from({ length: maxSlots - 1 }, (_, index) => ({ uid: `filler-${index}`, itemId: `filler-${index}` }));
      state.inventory.push({ uid: 'partial-stack', itemId: 'potion_test', count: 1 });

      const before = structuredClone(state.inventory);
      const added = addToInventory(state, 'potion_test', 2);

      assert.equal(added, false);
      assert.deepEqual(state.inventory, before, 'a failed addition must leave every stack unchanged');
    } finally {
      if (previousGameData === undefined) delete globalThis.GameData;
      else globalThis.GameData = previousGameData;
    }
  });

  it('does not insert part of a non-stackable reward when all required slots do not fit', () => {
    const previousGameData = globalThis.GameData;
    globalThis.GameData = {
      ALL_ITEMS: {
        blade_test: { id: 'blade_test', name: 'Test Blade', slot: 'weapon', type: 'sword' }
      }
    };

    try {
      const state = DEFAULT_STATE();
      const maxSlots = getMaxInventorySlots(state);
      state.inventory = Array.from({ length: maxSlots - 1 }, (_, index) => ({ uid: `filler-${index}`, itemId: `filler-${index}` }));
      const before = structuredClone(state.inventory);

      const added = addToInventory(state, 'blade_test', 2, null, false, {}, true);

      assert.equal(added, false);
      assert.deepEqual(state.inventory, before, 'a failed addition must not leave a partial reward');
    } finally {
      if (previousGameData === undefined) delete globalThis.GameData;
      else globalThis.GameData = previousGameData;
    }
  });

  it('rejects zero, negative, fractional and non-finite item quantities without mutating inventory', () => {
    const previousGameData = globalThis.GameData;
    globalThis.GameData = {
      ALL_ITEMS: {
        potion_test: { id: 'potion_test', name: 'Test Potion', slot: 'consumable', type: 'consumable', stack: 20 }
      }
    };

    try {
      for (const amount of [0, -1, 0.5, Number.NaN, Number.POSITIVE_INFINITY]) {
        const state = DEFAULT_STATE();
        state.inventory = [{ uid: 'existing', itemId: 'potion_test', count: 4 }];
        const before = structuredClone(state.inventory);

        assert.equal(addToInventory(state, 'potion_test', amount), false);
        assert.deepEqual(state.inventory, before, `quantity ${String(amount)} must be rejected without mutation`);
      }
    } finally {
      if (previousGameData === undefined) delete globalThis.GameData;
      else globalThis.GameData = previousGameData;
    }
  });

  it('does not partially consume stacks when the requested total is unavailable', () => {
    const state = DEFAULT_STATE();
    state.inventory = [
      { uid: 'pot-a', itemId: 'potion', count: 2 },
      { uid: 'pot-b', itemId: 'potion', count: 3 }
    ];
    const before = structuredClone(state.inventory);

    assert.equal(removeFromInventoryByItemId(state, 'potion', 6), false);
    assert.deepEqual(state.inventory, before);
  });

  it('rejects invalid removal quantities and preserves the selected stack', () => {
    for (const amount of [0, -1, 0.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      const state = DEFAULT_STATE();
      state.inventory = [{ uid: 'pot', itemId: 'potion', count: 4 }];
      const before = structuredClone(state.inventory);
      assert.equal(removeFromInventory(state, 'pot', amount), false);
      assert.deepEqual(state.inventory, before);
      assert.equal(removeFromInventoryByItemId(state, 'potion', amount), false);
      assert.deepEqual(state.inventory, before);
    }
  });

  it('does not consume an item still referenced by an equipment slot when its legacy flag is false', () => {
    const state = DEFAULT_STATE();
    state.inventory = [{ uid: 'equipped-resource', itemId: 'resource', count: 3, equipped: false }];
    state.equipment = { weapon: 'equipped-resource' };
    const before = structuredClone(state.inventory);

    assert.equal(removeFromInventory(state, 'equipped-resource'), false);
    assert.equal(removeFromInventoryByItemId(state, 'resource', 1), false);
    assert.deepEqual(state.inventory, before);
  });
});
