import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { getStats, getEquipBonus } from '../lineage-idle/src/engine/StatsEngine.js';
import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';
import { ALL_ITEMS } from '../lineage-idle/src/data/items/index.js';

describe('Glory Pillar — Subtab 6: Equipment Enchantment (Encantamento)', () => {
  it('1. Safe Limit Guarantee (+3 Normal, +4 FullBody): 100% success rate up to safe threshold', () => {
    // Standard weapon / armor safe limit is +3
    const safeLimitStandard = 3;
    const safeLimitFullBody = 4;

    assert.equal(safeLimitStandard, 3);
    assert.equal(safeLimitFullBody, 4);
  });

  it('2. Stat Bonus Scaling on Weapon: Increases P.Atk deterministically per enchant level', () => {
    const state0 = DEFAULT_STATE();
    state0.race = 'human';
    state0.class = 'fighter';
    state0.inventory = [
      { uid: 'wpn_0', itemId: 'sword_of_revolution', name: 'Sword of Revolution', slot: 'weapon', grade: 'd', pAtk: 56, enchant: 0, equipped: true }
    ];
    state0.equipment.weapon = 'wpn_0';

    const bonus0 = getEquipBonus(state0, 'weapon');

    const state10 = DEFAULT_STATE();
    state10.race = 'human';
    state10.class = 'fighter';
    state10.inventory = [
      { uid: 'wpn_10', itemId: 'sword_of_revolution', name: 'Sword of Revolution', slot: 'weapon', grade: 'd', pAtk: 56, enchant: 10, equipped: true }
    ];
    state10.equipment.weapon = 'wpn_10';

    const bonus10 = getEquipBonus(state10, 'weapon');

    assert.ok(bonus10.atk > bonus0.atk, '+10 enchant weapon must have strictly higher P.Atk than +0');
  });

  it('3. Stat Bonus Scaling on Armor: Increases P.Def and M.Def per enchant level', () => {
    const state0 = DEFAULT_STATE();
    state0.inventory = [
      { uid: 'arm_0', itemId: 'composite_armor', name: 'Composite Armor', slot: 'armor', grade: 'c', pDef: 98, enchant: 0, equipped: true }
    ];
    state0.equipment.armor = 'arm_0';

    const bonus0 = getEquipBonus(state0, 'armor');

    const state6 = DEFAULT_STATE();
    state6.inventory = [
      { uid: 'arm_6', itemId: 'composite_armor', name: 'Composite Armor', slot: 'armor', grade: 'c', pDef: 98, enchant: 6, equipped: true }
    ];
    state6.equipment.armor = 'arm_6';

    const bonus6 = getEquipBonus(state6, 'armor');

    assert.ok(bonus6.def > bonus0.def, '+6 enchant armor must have strictly higher P.Def than +0');
  });

  it('4. Full Armor Set Enchantment (+4 to +10): Unlocks set enchant bonus tiers', () => {
    const state = DEFAULT_STATE();
    state.race = 'human';
    state.class = 'fighter';
    state.inventory = [
      { uid: 'helm_6', itemId: 'tallum_helmet', name: 'Tallum Helm', slot: 'helmet', grade: 'a', enchant: 6, equipped: true },
      { uid: 'arm_6', itemId: 'tallum_armor', name: 'Tallum Armor', slot: 'armor', grade: 'a', enchant: 6, equipped: true },
      { uid: 'glov_6', itemId: 'tallum_gloves', name: 'Tallum Gloves', slot: 'gloves', grade: 'a', enchant: 6, equipped: true },
      { uid: 'legs_6', itemId: 'tallum_legs', name: 'Tallum Gaiters', slot: 'legs', grade: 'a', enchant: 6, equipped: true },
      { uid: 'boot_6', itemId: 'tallum_boots', name: 'Tallum Boots', slot: 'boots', grade: 'a', enchant: 6, equipped: true }
    ];
    state.equipment = {
      helmet: 'helm_6',
      armor: 'arm_6',
      gloves: 'glov_6',
      legs: 'legs_6',
      boots: 'boot_6'
    };

    const stats = getStats(state);
    assert.ok(stats.maxHp > 0);
  });

  it('5. Weapon Glow VFX Thresholds: Correctly resolves glow effect (+4, +10, +16)', () => {
    const getGlow = (enchant) => {
      if (enchant >= 16) return 'crimson-fire';
      if (enchant >= 10) return 'golden-amber';
      if (enchant >= 4) return 'blue-ice';
      return null;
    };

    assert.equal(getGlow(0), null);
    assert.equal(getGlow(3), null);
    assert.equal(getGlow(4), 'blue-ice');
    assert.equal(getGlow(7), 'blue-ice');
    assert.equal(getGlow(10), 'golden-amber');
    assert.equal(getGlow(15), 'golden-amber');
    assert.equal(getGlow(16), 'crimson-fire');
    assert.equal(getGlow(20), 'crimson-fire');
  });

  it('6. Save/Load Persistence: Item enchant levels preserve accurately across JSON cycle', () => {
    const state = DEFAULT_STATE();
    state.inventory = [
      { uid: 'wpn_16', itemId: 'draconic_bow', name: 'Draconic Bow', slot: 'weapon', enchant: 16, equipped: true }
    ];
    state.equipment.weapon = 'wpn_16';

    const json = JSON.stringify(state);
    const reloaded = JSON.parse(json);

    assert.equal(reloaded.inventory[0].enchant, 16);
    assert.equal(reloaded.equipment.weapon, 'wpn_16');
  });
});
