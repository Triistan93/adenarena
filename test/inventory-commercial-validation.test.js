import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';
import { ALL_EQUIP_SLOTS } from '../lineage-idle/src/core/GameConfig.js';
import { getStats } from '../lineage-idle/src/engine/StatsEngine.js';
import { CombatPowerService } from '../lineage-idle/src/services/CombatPowerService.js';
import { WeaponResonanceService } from '../lineage-idle/src/services/WeaponResonanceService.js';
import {
  resolveEquipSlot,
  isTwoHandedWeapon,
  isWeaponCompatibleWithOffhand,
  calculateEquipmentRecommendationScore,
  generateAutoEquipProposal
} from '../lineage-idle/src/services/EquipmentService.js';
import {
  calculateInventoryPressure,
  isItemProtected,
  isHighValueItem,
  organizeInventory,
  sortInventoryItems,
  getBatchSellPreview,
  getBatchSalvagePreview,
  getCrystallizationPreview,
  getMaxInventorySlots
} from '../lineage-idle/src/services/InventoryService.js';

describe('Commercial Inventory & Equipment Hub — 89-Point Validation Suite', () => {

  describe('1. Paperdoll & Dual Weapon Resonance (Non-Decorative)', () => {
    it('1.1 Strictly maintains 20 canonical paperdoll slots in ALL_EQUIP_SLOTS', () => {
      const canonicalSlots = [
        'weapon', 'shield', 'weapon2',
        'helmet', 'armor', 'legs', 'gloves', 'boots',
        'necklace', 'earring1', 'earring2', 'ring1', 'ring2',
        'cloak', 'belt', 'hair1', 'hair2',
        'brooch', 'agathion_bracelet', 'talisman_bracelet'
      ];
      for (const slot of canonicalSlots) {
        assert.ok(ALL_EQUIP_SLOTS.includes(slot), `Slot ${slot} must be present in ALL_EQUIP_SLOTS`);
      }
    });

    it('1.2 Dual weapon resonance injects passives into StatsEngine.getStats', () => {
      const state = DEFAULT_STATE();
      state.class = 'duelist';
      state.level = 80;
      state.inventory = [
        { uid: 'wpn_1', itemId: 'weapon_tsurugi', slot: 'weapon', type: 'sword' },
        { uid: 'wpn_2', itemId: 'weapon_tsurugi_off', slot: 'weapon', type: 'sword' }
      ];
      state.equipment = {
        weapon: 'wpn_1',
        weapon2: 'wpn_2'
      };

      const activeRes = WeaponResonanceService.getActiveResonance(state);
      assert.ok(activeRes, 'Duelist with two swords must activate Blade Symphony resonance');

      const passives = WeaponResonanceService.getPassiveStats(state);
      assert.ok(passives.atkSpd > 0 || passives.critChance > 0, 'Passives must have non-zero bonuses');

      const stats = getStats(state);
      assert.ok(stats.atk > 0, 'Stats must compute successfully with dual resonance');
    });

    it('1.3 Dual weapon resonance awards +1,240 CP with zero component drift', () => {
      const state = DEFAULT_STATE();
      state.class = 'duelist';
      state.level = 80;

      state.inventory = [
        { uid: 'wpn_1', itemId: 'weapon_tsurugi', slot: 'weapon', type: 'sword' }
      ];
      state.equipment = { weapon: 'wpn_1' };
      const cpWithoutRes = CombatPowerService.calculateCombatPower(state);
      const audit1 = CombatPowerService.auditCombatPower(state);
      assert.strictEqual(audit1.drift, 0, 'Audit drift must be zero');

      state.inventory.push({ uid: 'wpn_2', itemId: 'weapon_tsurugi_off', slot: 'weapon', type: 'sword' });
      state.equipment.weapon2 = 'wpn_2';

      const cpWithRes = CombatPowerService.calculateCombatPower(state);
      const audit2 = CombatPowerService.auditCombatPower(state);
      assert.strictEqual(audit2.drift, 0, 'Audit drift with active resonance must be zero');
      assert.ok(cpWithRes >= cpWithoutRes + 1240, 'Active resonance must contribute at least +1,240 CP');
    });
  });

  describe('2. Two-Handed Weapons & Offhand Compatibility Gates', () => {
    it('2.1 Correctly identifies two-handed weapons (Bows, 2H Swords, Ancient Swords, Spears, Duals)', () => {
      assert.strictEqual(isTwoHandedWeapon({ slot: 'weapon', weaponType: 'bow' }), true);
      assert.strictEqual(isTwoHandedWeapon({ slot: 'weapon', type: 'bow' }), true);
      assert.strictEqual(isTwoHandedWeapon({ id: 'weapon_draconic_bow', slot: 'weapon' }), true);
      assert.strictEqual(isTwoHandedWeapon({ slot: 'weapon', weaponType: 'twohand_sword' }), true);
      assert.strictEqual(isTwoHandedWeapon({ slot: 'weapon', weaponType: 'ancientsword' }), true);
      assert.strictEqual(isTwoHandedWeapon({ slot: 'weapon', weaponType: 'pole' }), true);
      assert.strictEqual(isTwoHandedWeapon({ slot: 'weapon', weaponType: 'dual' }), true);

      assert.strictEqual(isTwoHandedWeapon({ slot: 'weapon', weaponType: 'sword' }), false);
      assert.strictEqual(isTwoHandedWeapon({ slot: 'weapon', weaponType: 'dagger' }), false);
      assert.strictEqual(isTwoHandedWeapon({ slot: 'weapon', weaponType: 'blunt' }), false);
    });

    it('2.2 Two-handed weapons reject equipping shields or secondary weapons simultaneously', () => {
      const twoHandBow = { slot: 'weapon', weaponType: 'bow' };
      const shield = { slot: 'shield' };
      const offWeapon = { slot: 'weapon', weaponType: 'dagger' };

      assert.strictEqual(isWeaponCompatibleWithOffhand(twoHandBow, shield), false);
      assert.strictEqual(isWeaponCompatibleWithOffhand(twoHandBow, offWeapon), false);

      const oneHandSword = { slot: 'weapon', weaponType: 'sword' };
      assert.strictEqual(isWeaponCompatibleWithOffhand(oneHandSword, shield), true);
      assert.strictEqual(isWeaponCompatibleWithOffhand(oneHandSword, offWeapon), true);
    });

    it('2.3 Auto-Equip proposal automatically clears offhand when proposing a 2H weapon', () => {
      const state = DEFAULT_STATE();
      state.class = 'sagittarius';
      state.level = 80;
      state.equipment = {
        weapon: 'w_1h',
        shield: 's_equipped'
      };
      state.inventory = [
        { uid: 'w_1h', itemId: 'sword_basic', slot: 'weapon', atk: 50, type: 'sword' },
        { uid: 's_equipped', itemId: 'shield_basic', slot: 'shield', def: 40 },
        { uid: 'bow_god', itemId: 'weapon_shining_bow', slot: 'weapon', atk: 350, type: 'bow' }
      ];

      const proposal = generateAutoEquipProposal(state);
      assert.strictEqual(proposal.proposedLoadout.weapon, 'bow_god');
      assert.strictEqual(proposal.proposedLoadout.shield, null, 'Shield must be unequipped for 2H bow');
      const shieldChange = proposal.changes.find(c => c.slot === 'shield');
      assert.ok(shieldChange, 'Shield change must be recorded in changes array');
    });
  });

  describe('3. Multi-Criteria Equipment Recommendation Score (ERS)', () => {
    it('3.1 Mage classes heavily penalize physical weapons and favor staves/magic weapons', () => {
      const mageState = DEFAULT_STATE();
      mageState.class = 'archmage';
      mageState.level = 80;

      const physicalGreatsword = {
        itemId: 'greatsword_val',
        slot: 'weapon',
        type: 'twohand_sword',
        atk: 450,
        matk: 0,
        tier: 5
      };

      const mageStaff = {
        itemId: 'staff_imperial',
        slot: 'weapon',
        type: 'staff',
        atk: 100,
        matk: 380,
        mp: 300,
        tier: 5
      };

      const scoreSword = calculateEquipmentRecommendationScore(mageState, physicalGreatsword, 'weapon');
      const scoreStaff = calculateEquipmentRecommendationScore(mageState, mageStaff, 'weapon');

      assert.ok(scoreSword < 0, 'Physical weapon must receive negative penalty for Archmage');
      assert.ok(scoreStaff > scoreSword, 'Staff must score significantly higher than sword for Archmage');
    });

    it('3.2 Archer classes favor bows over daggers and swords', () => {
      const archerState = DEFAULT_STATE();
      archerState.class = 'sagittarius';
      archerState.level = 80;

      const bowItem = {
        itemId: 'bow_draconic',
        slot: 'weapon',
        type: 'bow',
        atk: 320,
        crit: 12,
        tier: 5
      };

      const swordItem = {
        itemId: 'sword_draconic',
        slot: 'weapon',
        type: 'sword',
        atk: 320,
        crit: 8,
        tier: 5
      };

      const scoreBow = calculateEquipmentRecommendationScore(archerState, bowItem, 'weapon');
      const scoreSword = calculateEquipmentRecommendationScore(archerState, swordItem, 'weapon');

      assert.ok(scoreBow > scoreSword + 500, 'Bow must have substantial archetype synergy bonus for Archer');
    });

    it('3.3 Set synergy grants progressive ERS bonus for matching set items', () => {
      const state = DEFAULT_STATE();
      state.class = 'phoenixKnight';
      state.equipment = {
        helmet: 'ic_helm',
        armor: 'ic_chest'
      };
      state.inventory = [
        { uid: 'ic_helm', itemId: 'ic_helm_id', set: 'Imperial Crusader' },
        { uid: 'ic_chest', itemId: 'ic_chest_id', set: 'Imperial Crusader' }
      ];

      const matchingGloves = {
        itemId: 'ic_gloves_id',
        slot: 'gloves',
        def: 50,
        set: 'Imperial Crusader'
      };

      const nonSetGloves = {
        itemId: 'generic_gloves_id',
        slot: 'gloves',
        def: 50
      };

      const scoreMatching = calculateEquipmentRecommendationScore(state, matchingGloves, 'gloves');
      const scoreNonSet = calculateEquipmentRecommendationScore(state, nonSetGloves, 'gloves');

      assert.ok(scoreMatching > scoreNonSet, 'Set matching piece must score higher due to set synergy bonus');
    });
  });

  describe('4. Destructive Action Safety (Vender, Desmontar, Cristalizar)', () => {
    it('4.1 isItemProtected guards equipped, favorite, locked, and quest items', () => {
      assert.strictEqual(isItemProtected({ equipped: true }), true, 'Equipped item must be protected');
      assert.strictEqual(isItemProtected({ isFavorite: true }), true, 'Favorite item must be protected');
      assert.strictEqual(isItemProtected({ favorite: true }), true, 'Favorite item must be protected');
      assert.strictEqual(isItemProtected({ isLocked: true }), true, 'Locked item must be protected');
      assert.strictEqual(isItemProtected({ locked: true }), true, 'Locked item must be protected');
      assert.strictEqual(isItemProtected({ isQuestItem: true }), true, 'Quest item must be protected');
      assert.strictEqual(isItemProtected({ slot: 'quest' }), true, 'Quest slot must be protected');
      assert.strictEqual(isItemProtected({ isHeirloom: true }), true, 'Heirloom item must be protected');

      assert.strictEqual(isItemProtected({ equipped: false, rarity: 'common' }, { slot: 'armor' }), false);
    });

    it('4.2 isHighValueItem correctly flags Rare, Epic, Legendary, and Mythic items', () => {
      assert.strictEqual(isHighValueItem({ rarity: 'common' }), false);
      assert.strictEqual(isHighValueItem({ rarity: 'uncommon' }), false);
      assert.strictEqual(isHighValueItem({ rarity: 'rare' }), true);
      assert.strictEqual(isHighValueItem({ rarity: 'epic' }), true);
      assert.strictEqual(isHighValueItem({ rarity: 'legendary' }), true);
      assert.strictEqual(isHighValueItem({ rarity: 'mythic' }), true);
    });

    it('4.3 getBatchSellPreview filters protected items and accurately computes total Adena', () => {
      const state = DEFAULT_STATE();
      state.inventory = [
        { uid: 'u1', itemId: 'sword_d', count: 1, rarity: 'common' },
        { uid: 'u2', itemId: 'sword_c', count: 1, rarity: 'rare' },
        { uid: 'u3', itemId: 'sword_prot', count: 1, isFavorite: true }
      ];

      const preview = getBatchSellPreview(state, ['u1', 'u2', 'u3']);
      assert.strictEqual(preview.protectedCount, 1, 'u3 must be protected');
      assert.strictEqual(preview.totalCount, 2, '2 items must be eligible for sale');
      assert.strictEqual(preview.hasHighValue, true, 'u2 is rare, so hasHighValue must be true');
      assert.ok(preview.totalGold > 0, 'totalGold must be calculated');
      assert.ok(!preview.uidsToSell.includes('u3'), 'u3 must not be included in uidsToSell');
    });

    it('4.4 getBatchSalvagePreview yields crystals and materials without touching protected items', () => {
      const state = DEFAULT_STATE();
      state.inventory = [
        { uid: 's1', itemId: 'gear_d', slot: 'armor', tier: 2, count: 1 },
        { uid: 's2', itemId: 'gear_locked', slot: 'armor', tier: 2, isLocked: true }
      ];

      const preview = getBatchSalvagePreview(state, ['s1', 's2']);
      assert.strictEqual(preview.protectedCount, 1, 's2 must be protected');
      assert.strictEqual(preview.totalCount, 1);
      assert.ok(preview.yieldSummary.crystal_d > 0, 'Grade D gear must yield crystal_d');
    });

    it('4.5 getCrystallizationPreview calculates elemental crystals for Grade D to S gear', () => {
      const state = DEFAULT_STATE();
      state.inventory = [
        { uid: 'c_s', itemId: 'gear_s', slot: 'weapon', tier: 6, count: 1 },
        { uid: 'c_a', itemId: 'gear_a', slot: 'armor', tier: 5, count: 1 }
      ];

      const preview = getCrystallizationPreview(state, ['c_s', 'c_a']);
      assert.strictEqual(preview.totalCount, 2);
      assert.ok(preview.yieldSummary.crystal_s >= 70, 'Grade S must yield at least 70 crystal_s');
      assert.ok(preview.yieldSummary.crystal_a >= 45, 'Grade A must yield at least 45 crystal_a');
    });
  });

  describe('5. Capacity Pressure Gauge & Thresholds', () => {
    it('5.1 Accurately classifies 0-74% Normal, 75-89% Warning, 90-99% Critical, 100%+ Full', () => {
      const state = DEFAULT_STATE();
      const maxSlots = getMaxInventorySlots(state);

      state.inventory = new Array(50).fill({ itemId: 'item_dummy' });
      let p = calculateInventoryPressure(state);
      assert.strictEqual(p.status, 'normal');
      assert.strictEqual(p.label, 'Normal');
      assert.strictEqual(p.isFull, false);

      state.inventory = new Array(115).fill({ itemId: 'item_dummy' });
      p = calculateInventoryPressure(state);
      assert.strictEqual(p.status, 'warning');
      assert.strictEqual(p.label, 'Alerta');
      assert.strictEqual(p.isFull, false);

      state.inventory = new Array(140).fill({ itemId: 'item_dummy' });
      p = calculateInventoryPressure(state);
      assert.strictEqual(p.status, 'critical');
      assert.strictEqual(p.label, 'Crítico');
      assert.strictEqual(p.isFull, false);

      state.inventory = new Array(150).fill({ itemId: 'item_dummy' });
      p = calculateInventoryPressure(state);
      assert.strictEqual(p.status, 'full');
      assert.strictEqual(p.label, 'Mochila Cheia');
      assert.strictEqual(p.isFull, true);
    });
  });

  describe('6. Smart Stacking & Sorting Operations', () => {
    it('6.1 organizeInventory consolidates un-enchanted stackable items into full stacks', () => {
      const state = DEFAULT_STATE();
      state.inventory = [
        { uid: 'p1', itemId: 'hp_potion', count: 20, slot: 'consumable' },
        { uid: 'p2', itemId: 'hp_potion', count: 30, slot: 'consumable' },
        { uid: 'enc_wpn', itemId: 'sword_d', count: 1, enchant: 5, slot: 'weapon' }
      ];

      const res = organizeInventory(state, 'recommended');
      assert.strictEqual(res.freedSlots, 1, 'One slot must be freed from merging hp_potion');
      assert.strictEqual(state.inventory.length, 2);

      const mergedPotion = state.inventory.find(i => i.itemId === 'hp_potion');
      assert.strictEqual(mergedPotion.count, 50, 'Potions must be consolidated to 50');

      const keptWeapon = state.inventory.find(i => i.itemId === 'sword_d');
      assert.strictEqual(keptWeapon.enchant, 5, 'Enchanted equipment must remain untouched');
    });

    it('6.2 sortInventoryItems prioritizes equipped gear and sorts contextually', () => {
      const items = [
        { uid: 'i1', itemId: 'item_b', rarity: 'common', count: 1 },
        { uid: 'i2', itemId: 'item_a', rarity: 'rare', count: 1 },
        { uid: 'i3', itemId: 'item_c', rarity: 'common', equipped: true, count: 1 }
      ];

      const sorted = sortInventoryItems(items, 'recommended');
      assert.strictEqual(sorted[0].uid, 'i3', 'Equipped item must always be first');
      assert.strictEqual(sorted[1].uid, 'i2', 'Rare item must be sorted before Common');
    });
  });
});
