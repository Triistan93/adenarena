import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';
import { getMaxInventorySlots } from '../lineage-idle/src/services/InventoryService.js';
import { spinRandomCraft } from '../lineage-idle/src/services/CraftService.js';

describe('Random Craft — prêmio transacional', () => {
  it('preserves the charge, prize slots and history when a full bag cannot accept the reward', () => {
    const previousGameData = globalThis.GameData;
    const previousRandom = Math.random;
    globalThis.GameData = {
      ALL_ITEMS: {
        filler: { id: 'filler', name: 'Disposable Filler', slot: 'weapon' },
        blade_reward: { id: 'blade_reward', name: 'Disposable Reward Blade', slot: 'weapon' }
      }
    };
    Math.random = () => 0;

    try {
      const state = DEFAULT_STATE();
      const maxSlots = getMaxInventorySlots(state);
      state.inventory = Array.from({ length: maxSlots }, (_, index) => ({
        uid: `filler-${index}`, itemId: 'filler', count: 1, rarity: 'common'
      }));
      state.randomCraft = {
        points: 0,
        charge: 1,
        slots: Array.from({ length: 5 }, () => ({ itemId: 'blade_reward', count: 1, rarity: 'rare' })),
        history: []
      };
      const beforeSlots = structuredClone(state.randomCraft.slots);

      const result = spinRandomCraft(state, { log() {}, updateAllUI() {}, save() {} });

      assert.equal(result, false);
      assert.equal(state.randomCraft.charge, 1);
      assert.deepEqual(state.randomCraft.slots, beforeSlots);
      assert.deepEqual(state.randomCraft.history, []);
      assert.equal(state.inventory.length, maxSlots);
    } finally {
      Math.random = previousRandom;
      if (previousGameData === undefined) delete globalThis.GameData;
      else globalThis.GameData = previousGameData;
    }
  });
});
