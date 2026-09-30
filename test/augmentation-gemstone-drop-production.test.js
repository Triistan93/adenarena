import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { ALL_ITEMS } from '../lineage-idle/src/data/items/index.js';
import { MONSTER_DROPS, rollDrop } from '../lineage-idle/src/data/items/recipes_drops.js';
import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';
import { AugmentationService } from '../lineage-idle/src/services/AugmentationService.js';

describe('graded augmentation gemstones on the production drop path', () => {
  it('registers separate D, C, B, A and S gemstone materials', () => {
    for (const grade of ['d', 'c', 'b', 'a', 's']) {
      const item = ALL_ITEMS[`gemstone_${grade}`];
      assert.ok(item, `Gemstone ${grade.toUpperCase()} must be in the item catalog`);
      assert.equal(item.slot, 'material');
      assert.equal(item.grade, grade.toUpperCase());
    }
  });

  it('rolls only the gemstone matching the monster level tier', () => {
    const originalRandom = Math.random;
    const expected = {
      zone1: 'gemstone_d', zone2: 'gemstone_d', zone3: 'gemstone_c',
      zone4: 'gemstone_b', zone5: 'gemstone_a', zone6: 'gemstone_s', zone7: 'gemstone_s'
    };
    try {
      for (const [tier, expectedId] of Object.entries(expected)) {
        const rolls = [0.99, 0, 0.99];
        Math.random = () => rolls.shift() ?? 0.99;
        const drops = rollDrop(tier, 0, false, ALL_ITEMS);
        assert.ok(drops.some(drop => drop.itemId === expectedId), `${tier} should award ${expectedId}`);
        assert.equal(drops.some(drop => drop.itemId?.startsWith('gemstone_') && drop.itemId !== expectedId), false);
      }
    } finally {
      Math.random = originalRandom;
    }
  });

  it('does not apply the level-one equipment filter when production passes a high-level tier key', () => {
    const originalRandom = Math.random;
    const validHighLevelItem = MONSTER_DROPS.zone6.find(id => ALL_ITEMS[id]?.req?.level >= 20);
    assert.ok(validHighLevelItem, 'zone6 fixture must include a level-gated equipment item');
    const rolls = [0.99, 0.99, 0, 0, 0];
    Math.random = () => rolls.shift() ?? 0;
    try {
      const drops = rollDrop('zone6', 0, false, {
        [validHighLevelItem]: ALL_ITEMS[validHighLevelItem],
        gemstone_s: ALL_ITEMS.gemstone_s
      });
      assert.ok(drops.some(drop => drop.itemId === validHighLevelItem), 'the high-level item should remain eligible');
    } finally {
      Math.random = originalRandom;
    }
  });

  it('requires the actual matching Gemstone instead of an ordinary Crystal of the same grade', () => {
    const state = DEFAULT_STATE();
    state.class = 'gladiator';
    state.gold = 1_000_000;
    const weapon = { uid: 'grade-check-weapon', itemId: 'weapon_test', slot: 'weapon' };
    const stone = { uid: 'grade-check-stone', itemId: 'life_stone_40', count: 1 };
    const crystal = { uid: 'grade-check-crystal', itemId: 'crystal_c', count: 10 };
    state.inventory = [weapon, stone, crystal];

    const result = AugmentationService.augmentWeapon(state, weapon, 'life_stone_40', { log: () => {} });

    assert.equal(result.reason, 'insufficient_gemstones');
    assert.equal(state.gold, 1_000_000);
    assert.equal(state.inventory.includes(stone), true);
    assert.equal(crystal.count, 10);
  });
});
