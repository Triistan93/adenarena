import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';
import { getStats, getTotalEquipBonuses } from '../lineage-idle/src/engine/StatsEngine.js';
import { canCastSkill } from '../lineage-idle/src/data/balance/skillBalance.js';
import { calculatePhysicalDamage, resolvePlayerBlock } from '../lineage-idle/src/data/balance/combatBalance.js';
import { polishMasterwork } from '../lineage-idle/src/services/CraftService.js';
import { WEAPONS } from '../lineage-idle/src/data/items/weapons.js';
import { RINGS } from '../lineage-idle/src/data/items/jewels.js';
import { HEIRLOOM_ITEMS } from '../lineage-idle/src/data/items/heirloom_items.js';

function withEquippedItem(slot, item) {
  const state = DEFAULT_STATE();
  state.race = 'human';
  state.class = 'gladiator';
  state.level = 40;
  state.inventory = [{ uid: 'test_item', ...item }];
  state.equipment = { ...state.equipment, [slot]: 'test_item' };
  return state;
}

describe('Equipment effects through the production StatsEngine path', () => {
  it('Foundation improves the equipped armor defense returned by getStats', () => {
    const plain = withEquippedItem('armor', {
      itemId: 'runtime_test_armor', slot: 'armor', def: 100, mdef: 50
    });
    const foundation = withEquippedItem('armor', {
      itemId: 'runtime_test_armor', slot: 'armor', def: 100, mdef: 50, foundation: true
    });

    const plainStats = getStats(plain);
    const foundationStats = getStats(foundation);

    assert.ok(foundationStats.def > plainStats.def);
    assert.ok(foundationStats.mdef > plainStats.mdef);
  });

  it('feeds the heirloom shield block rate into the player combat block stat', () => {
    const shield = withEquippedItem('shield', {
      ...HEIRLOOM_ITEMS.shield_heirloom_aegis, uid: 'test_item', itemId: 'shield_heirloom_aegis'
    });

    const stats = getStats(shield);
    assert.equal(stats.block, 25);
    assert.deepEqual(resolvePlayerBlock(100, stats.block, 'physical', 0.24), { blocked: true, damage: 50 });
    assert.deepEqual(resolvePlayerBlock(100, stats.block, 'physical', 0.25), { blocked: false, damage: 100 });
    assert.deepEqual(resolvePlayerBlock(100, stats.block, 'magical', 0), { blocked: false, damage: 100 });
    const originalRandom = Math.random;
    Math.random = () => { throw new Error('unused block chance must not consume the combat RNG'); };
    try {
      assert.deepEqual(resolvePlayerBlock(100, 0, 'physical'), { blocked: false, damage: 100 });
      assert.deepEqual(resolvePlayerBlock(100, 25, 'magical'), { blocked: false, damage: 100 });
    } finally {
      Math.random = originalRandom;
    }
  });

  it('applies cataloged equipment cast speed, attack speed, MP regeneration, and critical damage', () => {
    const baseline = withEquippedItem('weapon', {
      itemId: 'runtime_test_weapon', slot: 'weapon', atk: 100, matk: 100
    });
    const baselineStats = getStats(baseline);

    const infinityRod = withEquippedItem('weapon', {
      ...WEAPONS.weapon_infinity_rod, uid: 'test_item', itemId: 'weapon_infinity_rod'
    });
    const rodStats = getStats(infinityRod);
    assert.ok(rodStats.cdr > baselineStats.cdr, 'cataloged Cast Spd. should reduce skill cooldown');
    assert.ok(rodStats.mpRegen > baselineStats.mpRegen, 'the cataloged MP regeneration should be applied');
    assert.ok(rodStats.maxMp > baselineStats.maxMp, 'the cataloged MP bonus should remain applied');
    const longCooldownSkill = { id: 'catalog_rod_cooldown', type: 'active', baseCd: 10_000 };
    assert.equal(canCastSkill({ mp: 100, stats: baselineStats }, longCooldownSkill, 9_000, { catalog_rod_cooldown: 0 }).canCast, false);
    assert.equal(canCastSkill({ mp: 100, stats: rodStats }, longCooldownSkill, 9_000, { catalog_rod_cooldown: 0 }).canCast, true);

    const infinityDuals = withEquippedItem('weapon', {
      ...WEAPONS.weapon_infinity_duals, uid: 'test_item', itemId: 'weapon_infinity_duals'
    });
    assert.ok(getStats(infinityDuals).atkSpd > baselineStats.atkSpd, 'cataloged Atk Spd. should affect attack cadence');

    const infinityCleaver = withEquippedItem('weapon', {
      ...WEAPONS.weapon_infinity_cleaver, uid: 'test_item', itemId: 'weapon_infinity_cleaver'
    });
    const cleaverStats = getStats(infinityCleaver);
    assert.ok(cleaverStats.critDmg > baselineStats.critDmg, 'cataloged critical damage should be applied');
    const critDamageWithoutItem = calculatePhysicalDamage({ atk: 200, def: 0, isCrit: true, critDmgMult: baselineStats.critDmg, applyVariance: false });
    const critDamageWithItem = calculatePhysicalDamage({ atk: 200, def: 0, isCrit: true, critDmgMult: cleaverStats.critDmg, applyVariance: false });
    assert.ok(critDamageWithItem > critDamageWithoutItem, 'critical damage from the weapon must reach the combat formula');

    const infinityAxe = withEquippedItem('weapon', {
      ...WEAPONS.weapon_infinity_axe, uid: 'test_item', itemId: 'weapon_infinity_axe'
    });
    assert.equal(getTotalEquipBonuses(infinityAxe).stunChance, 25, 'the cataloged 25% weapon stun chance must reach combat proc aggregation');

    const baiumRing = withEquippedItem('ring1', {
      ...RINGS.jewel_ring_of_baium, uid: 'test_item', itemId: 'jewel_ring_of_baium'
    });
    const baiumStats = getStats(baiumRing);
    assert.ok(baiumStats.cdr > baselineStats.cdr, 'Baium ring Casting Speed should reduce cooldown');
    assert.ok(baiumStats.atkSpd > baselineStats.atkSpd, 'Baium ring Attack Speed should affect attack cadence');
    assert.equal(baiumStats.critDmg - baselineStats.critDmg, 0, 'Baium ring should not invent a critical-damage bonus');
  });

  it('an equipped weapon soul crystal changes the actual combat stats', () => {
    const plain = withEquippedItem('weapon', {
      itemId: 'runtime_test_weapon', slot: 'weapon', atk: 100
    });
    const withMight = withEquippedItem('weapon', {
      itemId: 'runtime_test_weapon', slot: 'weapon', atk: 100,
      soulCrystal: { stat: 'patk', val: 0.10 }
    });

    const plainStats = getStats(plain);
    const mightStats = getStats(withMight);

    assert.ok(mightStats.atk > plainStats.atk);
  });

  it('each socketed soul crystal effect changes its intended combat stat', () => {
    const effectStat = {
      focus: 'crit',
      haste: 'speed',
      acumen: 'cdr',
      health: 'maxHp',
      might: 'atk',
      empower: 'matk'
    };
    const baseState = withEquippedItem('weapon', {
      itemId: 'runtime_test_weapon', slot: 'weapon', atk: 100
    });
    const baseStats = getStats(baseState);

    for (const [effect, stat] of Object.entries(effectStat)) {
      const state = withEquippedItem('weapon', {
        itemId: 'runtime_test_weapon', slot: 'weapon', atk: 100
      });
      state.weaponSockets.test_item = { stage: 1, effect };
      const stats = getStats(state);
      assert.ok(stats[stat] > baseStats[stat], `${effect} should increase ${stat}`);
    }
  });

  it('Masterwork cast speed reduces skill cooldown without changing attack speed', () => {
    const plain = withEquippedItem('armor', {
      itemId: 'runtime_test_masterwork', slot: 'armor', def: 100
    });
    const masterwork = withEquippedItem('armor', {
      itemId: 'runtime_test_masterwork', slot: 'armor', def: 100,
      isMasterwork: true, masterworkBonus: { castSpdPct: 0.05 }
    });

    const plainStats = getStats(plain);
    const masterworkStats = getStats(masterwork);

    assert.equal(masterworkStats.cdr, plainStats.cdr + 0.05);
    assert.equal(masterworkStats.atkSpd, plainStats.atkSpd);
    const skill = { id: 'test_cast', type: 'active', baseCd: 10_000 };
    assert.equal(canCastSkill({ mp: 100, stats: masterworkStats }, skill, 5_000, { test_cast: 0 }).canCast, false);
    assert.equal(canCastSkill({ mp: 100, stats: masterworkStats }, skill, 9_500, { test_cast: 0 }).canCast, true);
  });

  it('polishing Foundation grants the stated flat 250 HP in production stats', () => {
    const state = withEquippedItem('armor', {
      itemId: 'runtime_test_masterwork_hp', slot: 'armor', def: 100, foundation: true
    });
    state.gold = 100_000;
    const before = getStats(state);

    assert.equal(polishMasterwork(state, 'test_item'), true);
    assert.equal(state.gold, 0);
    assert.equal(state.inventory[0].masterworkBonus.hpBonus, 250);

    const after = getStats(state);
    assert.equal(after.maxHp - before.maxHp, 250);
    assert.equal(after.cdr - before.cdr, 0.05, 'Masterwork cast speed reduces cooldown');
    assert.equal(after.atkSpd - before.atkSpd, 0.04, 'Masterwork attack speed remains attack speed');
    assert.equal(after.mpRegen - before.mpRegen, 0.08, 'Masterwork MP regeneration bonus is applied');
  });

  it('Acumen SA and socket bonuses reduce skill cooldown instead of attack speed', () => {
    const plain = withEquippedItem('weapon', {
      itemId: 'runtime_test_weapon', slot: 'weapon', atk: 100
    });
    const weaponSa = withEquippedItem('weapon', {
      itemId: 'runtime_test_weapon', slot: 'weapon', atk: 100,
      soulCrystal: { stat: 'castSpd', val: 0.15 }
    });
    const socketed = withEquippedItem('weapon', {
      itemId: 'runtime_test_weapon', slot: 'weapon', atk: 100
    });
    socketed.weaponSockets.test_item = { stage: 1, effect: 'acumen' };

    const plainStats = getStats(plain);
    const weaponSaStats = getStats(weaponSa);
    const socketStats = getStats(socketed);

    assert.ok(weaponSaStats.cdr > plainStats.cdr);
    assert.equal(weaponSaStats.atkSpd, plainStats.atkSpd);
    assert.ok(socketStats.cdr > plainStats.cdr);
    assert.equal(socketStats.atkSpd, plainStats.atkSpd);
  });
});
