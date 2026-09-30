import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { getItemGradeCode } from '../lineage-idle/src/data/items/item_grade.js';
import { WEAPONS } from '../lineage-idle/src/data/items/weapons.js';
import { ARMORS } from '../lineage-idle/src/data/items/armors.js';
import { RINGS, NECKLACES } from '../lineage-idle/src/data/items/jewels.js';
import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';
import { getStats } from '../lineage-idle/src/engine/StatsEngine.js';
import { calculatePhysicalDamage, calculateMagicDamage } from '../lineage-idle/src/data/balance/combatBalance.js';
import { getElementalGating } from '../lineage-idle/src/services/ElementalService.js';
import { applyElementalInfusion, applySoulCrystalToWeapon } from '../lineage-idle/src/services/ElementalService.js';
import { resolveSoulshotEffect } from '../lineage-idle/src/engine/CombatEngine.js';
import { getEnchantPreview } from '../lineage-idle/src/services/EnchantmentService.js';
import { isItemCompatibleWithScroll } from '../lineage-idle/src/services/ItemClassificationService.js';
import { ALL_ITEMS } from '../lineage-idle/src/data/items/index.js';
import { BELT_ITEMS } from '../lineage-idle/src/data/items/attributes_belts.js';
import {
  applyPlayerPveDamageBonus,
  applyPlayerSkillPowerBonus,
  applyPlayerDamageTakenReduction
} from '../lineage-idle/src/services/SkillEffectService.js';

function statsWithEquipped(slot, itemDef) {
  const state = DEFAULT_STATE();
  state.race = 'human';
  state.class = 'hawkeye';
  state.level = 90;
  const uid = 'grade-regression-item';
  state.inventory = [{ ...itemDef, uid, itemId: itemDef.id || itemDef.itemId }];
  state.equipment = { ...state.equipment, [slot]: uid };
  return getStats(state);
}

describe('Equipment grade classification from item identity', () => {
  it('keeps ordinary S-grade equipment out of the boss grade because its art is in gradespecial', () => {
    assert.equal(getItemGradeCode(WEAPONS.draconic_bow), 's');
    assert.equal(getItemGradeCode(ARMORS.armor_draconic_armor), 's');
  });

  it('does not classify an Olympiad hero weapon as Frost Lord because it reuses Frost Lord artwork', () => {
    assert.equal(getItemGradeCode(WEAPONS.weapon_infinity_axe), 'boss');
  });

  it('keeps explicit Frost Lord equipment at its own grade', () => {
    assert.equal(getItemGradeCode(WEAPONS.weapon_frost_lord_bow), 'frostlord');
  });

  it('classifies every unique weapon marked S Grade as S even when its icon reuses the special-art folder', () => {
    const sWeapons = [...new Map(Object.values(WEAPONS)
      .filter(item => item.desc?.includes('(S Grade)'))
      .map(item => [item.id, item])).values()];
    assert.ok(sWeapons.length > 0);
    for (const weapon of sWeapons) assert.equal(getItemGradeCode(weapon), 's', weapon.name);
    assert.equal(getElementalGating(WEAPONS.draconic_bow).grade, 's');
  });

  it('keeps common S weapons below Frost Lord at final player stats and physical damage', () => {
    const uniqueWeapons = [...new Map(Object.values(WEAPONS).map(item => [item.id, item])).values()];
    const sWeapons = uniqueWeapons.filter(item => getItemGradeCode(item) === 's');
    const frostWeapons = uniqueWeapons.filter(item => getItemGradeCode(item) === 'frostlord');
    const commonPhysical = sWeapons.filter(item => (Number(item.atk) || 0) > 0 && !(Number(item.matk) > 0));
    const frostPhysical = frostWeapons.filter(item => (Number(item.atk) || 0) > 0 && !(Number(item.matk) > 0));
    const commonMagic = sWeapons.filter(item => (Number(item.matk) || 0) > 0);
    const frostMagic = frostWeapons.filter(item => (Number(item.matk) || 0) > 0);
    assert.ok(commonPhysical.length && frostPhysical.length && commonMagic.length && frostMagic.length);

    const commonPhysicalResults = commonPhysical.map(item => {
      const stats = statsWithEquipped('weapon', item);
      return { item, stats, damage: calculatePhysicalDamage({ atk: stats.atk, def: 100, applyVariance: false }) };
    });
    const frostPhysicalResults = frostPhysical.map(item => {
      const stats = statsWithEquipped('weapon', item);
      return { item, stats, damage: calculatePhysicalDamage({ atk: stats.atk, def: 100, applyVariance: false }) };
    });
    const commonMagicResults = commonMagic.map(item => {
      const stats = statsWithEquipped('weapon', item);
      return { item, stats, damage: calculateMagicDamage({ matk: stats.matk, mdef: 100, applyVariance: false }) };
    });
    const frostMagicResults = frostMagic.map(item => {
      const stats = statsWithEquipped('weapon', item);
      return { item, stats, damage: calculateMagicDamage({ matk: stats.matk, mdef: 100, applyVariance: false }) };
    });
    const maximum = rows => Math.max(...rows.map(row => row.damage));
    const minimum = rows => Math.min(...rows.map(row => row.damage));
    assert.ok(maximum(commonPhysicalResults) < minimum(frostPhysicalResults), 'every common S physical weapon must remain below the weakest Frost Lord physical weapon in final damage');
    assert.ok(maximum(commonMagicResults) < minimum(frostMagicResults), 'every common S magic weapon must remain below the weakest Frost Lord magic weapon in final damage');
  });

  it('keeps S armor below A armor progression and all S jewelry below matching Epic Boss jewelry in effective stats', () => {
    const sArmor = statsWithEquipped('armor', ARMORS.armor_draconic_armor);
    const aArmor = statsWithEquipped('armor', ARMORS.armor_dark_crystal_heavy_armor);
    assert.ok(sArmor.def > aArmor.def);

    const compareEverySItemToBosses = (catalog, slot) => {
      const unique = [...new Map(Object.values(catalog).map(item => [item.id, item])).values()];
      const sItems = unique.filter(item => getItemGradeCode(item) === 's');
      const bossItems = unique.filter(item => getItemGradeCode(item) === 'boss');
      assert.ok(sItems.length && bossItems.length, `${slot} needs S and boss catalog coverage`);
      const fields = ['atk', 'matk', 'def', 'mdef', 'hp', 'mp', 'crit', 'cdr'];
      for (const sItem of sItems) {
        const sStats = statsWithEquipped(slot, sItem);
        for (const bossItem of bossItems) {
          const bossStats = statsWithEquipped(slot, bossItem);
          const improvedFields = fields.filter(field => (bossStats[field] || 0) > (sStats[field] || 0));
          assert.ok(improvedFields.length, `${bossItem.name} should improve at least one effective stat over ${sItem.name}`);
        }
      }
    };
    compareEverySItemToBosses(RINGS, 'ring1');
    compareEverySItemToBosses(NECKLACES, 'necklace');
  });

  it('preserves S-over-A progression across every armor piece slot with comparable catalog coverage', () => {
    const armorSlots = ['armor', 'helmet', 'gloves', 'legs', 'boots', 'cloak', 'belt', 'shield'];
    const uniqueItems = [...new Map(Object.values(ALL_ITEMS)
      .filter(item => item?.id && armorSlots.includes(item.slot))
      .map(item => [item.id, item])).values()];
    const fields = ['atk', 'matk', 'def', 'mdef', 'hp', 'mp', 'crit', 'cdr', 'eva', 'hit'];

    for (const slot of armorSlots) {
      const items = uniqueItems.filter(item => item.slot === slot);
      const sItems = items.filter(item => getItemGradeCode(item) === 's');
      const aItems = items.filter(item => getItemGradeCode(item) === 'a');
      if (!sItems.length || !aItems.length) continue;

      const effective = new Map([...sItems, ...aItems].map(item => [item.id, statsWithEquipped(slot, item)]));
      for (const sItem of sItems) {
        const sStats = effective.get(sItem.id);
        const improvesAnAItem = aItems.some(aItem => {
          const aStats = effective.get(aItem.id);
          return fields.some(field => (sStats[field] || 0) > (aStats[field] || 0));
        });
        assert.ok(improvesAnAItem, `${sItem.name} should improve at least one effective stat over an A-grade ${slot}`);
      }
    }
  });

  it('applies the top-grade magic belt bonuses to PvE damage, skill damage, and incoming damage in production', () => {
    const lowGradeDefense = [
      BELT_ITEMS.belt_cloth,
      BELT_ITEMS.belt_leather,
      BELT_ITEMS.belt_iron,
      BELT_ITEMS.belt_mithril
    ].map(belt => statsWithEquipped('belt', belt).def);
    assert.ok(lowGradeDefense[0] < lowGradeDefense[1] && lowGradeDefense[1] < lowGradeDefense[2] && lowGradeDefense[2] < lowGradeDefense[3]);

    const topBeltStats = statsWithEquipped('belt', BELT_ITEMS.belt_blessed_top);
    assert.equal(topBeltStats.damageTakenReductionPercent, 0.072);
    assert.equal(topBeltStats.pveDamagePercent, 0.06);
    assert.equal(topBeltStats.pSkillPowerPercent, 0.06);
    assert.equal(applyPlayerPveDamageBonus(100, topBeltStats), 106);
    assert.equal(applyPlayerSkillPowerBonus(100, topBeltStats, 'physical'), 106);
    assert.equal(applyPlayerDamageTakenReduction(1000, topBeltStats), 928);

    const commonSBeltItems = [...new Map(Object.values(ALL_ITEMS)
      .filter(item => item?.slot === 'belt' && getItemGradeCode(item) === 's')
      .map(item => [item.id, item])).values()];
    assert.ok(commonSBeltItems.length > 0);
    for (const belt of commonSBeltItems) {
      assert.equal(getItemGradeCode(belt), 's');
      const commonStats = statsWithEquipped('belt', belt);
      assert.ok(topBeltStats.damageTakenReductionPercent > (commonStats.damageTakenReductionPercent || 0), `${belt.name} should be below the top belt defensively`);
      assert.ok(topBeltStats.pveDamagePercent > (commonStats.pveDamagePercent || 0), `${belt.name} should be below the top belt in PvE damage`);
      assert.ok(topBeltStats.pSkillPowerPercent > (commonStats.pSkillPowerPercent || 0), `${belt.name} should be below the top belt in skill power`);
    }
  });

  it('uses S-grade soulshots for ordinary S weapons in the production combat resolver', () => {
    const state = {
      class: 'hawkeye',
      soulshotActive: true,
      inventory: [
        { itemId: 'soulshot_a', count: 2 },
        { itemId: 'soulshot_s', count: 3 }
      ]
    };
    const result = resolveSoulshotEffect(state, WEAPONS.draconic_bow, false);
    assert.equal(result.shotItem.itemId, 'soulshot_s');
    assert.equal(result.multiplier, 2);
  });

  it('accepts an S enchant scroll and uses the S success/crystal table for an S weapon', () => {
    const weapon = { ...WEAPONS.draconic_bow, uid: 'grade-s-bow', itemId: WEAPONS.draconic_bow.id, enchant: 4 };
    const scroll = { ...ALL_ITEMS.scroll_enchant_weapon_s, uid: 's-scroll', itemId: 'scroll_enchant_weapon_s', count: 1 };
    assert.equal(isItemCompatibleWithScroll(WEAPONS.draconic_bow, ALL_ITEMS.scroll_enchant_weapon_s).ok, true);

    const preview = getEnchantPreview({ inventory: [weapon, scroll] }, weapon.uid, scroll.uid);
    assert.equal(preview.targetItem.grade, 'S');
    assert.equal(preview.successChance, 0.5);
  });

  it('lets Frost Lord weapons use the existing S elemental band without lowering their level requirement', () => {
    const weaponDef = WEAPONS.weapon_frost_lord_sword;
    const item = { ...weaponDef, uid: 'frost-sword', itemId: weaponDef.id };
    const state = { level: 79, gold: 1_000_000, inventory: [item], equipment: { weapon: item.uid } };
    const gating = getElementalGating(item);
    const beforeGold = state.gold;

    assert.equal(gating.grade, 'frostlord');
    assert.equal(gating.eligible, true);
    assert.equal(gating.minLevel, 80);
    assert.equal(applyElementalInfusion(state, item.uid, 'fire'), false);
    assert.equal(state.gold, beforeGold);

    state.level = 80;
    assert.equal(applyElementalInfusion(state, item.uid, 'fire'), true);
    assert.equal(item.elementalAttribute.val, 20);
    assert.equal(state.gold, beforeGold - 250_000);
  });

  it('allows SA on a Frost Lord weapon with the S-grade crystal cost and resource consumption', () => {
    const weaponDef = WEAPONS.weapon_frost_lord_sword;
    const item = { ...weaponDef, uid: 'frost-sa-sword', itemId: weaponDef.id };
    const crystal = { uid: 'red-stage-13', itemId: 'soul_crystal_red_stage13', color: 'red', stage: 13, count: 1 };
    const state = { level: 80, gold: 500_000, inventory: [item, crystal], equipment: { weapon: item.uid } };

    assert.equal(applySoulCrystalToWeapon(state, item.uid, 'red', 'focus'), true);
    assert.equal(state.gold, 0);
    assert.equal(state.inventory.some(entry => entry.uid === crystal.uid), false);
    assert.equal(item.soulCrystal.level, 13);
    assert.ok(item.soulCrystal.val > 0);
  });
});
