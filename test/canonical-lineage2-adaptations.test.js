import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { CollectionService } from '../lineage-idle/src/services/CollectionService.js';
import * as CraftService from '../lineage-idle/src/services/CraftService.js';
import { AugmentationService } from '../lineage-idle/src/services/AugmentationService.js';
import { SynthesisService } from '../lineage-idle/src/services/SynthesisService.js';
import { RefineryService } from '../lineage-idle/src/services/lifeActivities/RefineryService.js';
import { resolveSoulshotEffect } from '../lineage-idle/src/engine/CombatEngine.js';
import { CRAFTING_RECIPES } from '../lineage-idle/src/data/items/recipes_drops.js';
import { ALL_ITEMS } from '../lineage-idle/src/data/items/index.js';
import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';

describe('Lineage II Canonical Adaptations Suite (Season 1)', () => {
  describe('1. Gear Collection System (Codex Sink)', () => {
    it('initializes and lists Season 1 collections', () => {
      const state = DEFAULT_STATE();
      const list = CollectionService.getCollections(state);
      assert.ok(Array.isArray(list));
      assert.ok(list.length >= 10);
      const noviceWeapons = list.find(c => c.id === 'novice_weapons');
      assert.ok(noviceWeapons);
      assert.equal(noviceWeapons.totalItems, 3);
      assert.equal(noviceWeapons.registeredCount, 0);
      assert.equal(noviceWeapons.isComplete, false);
    });

    it('sacrifices and registers item from inventory permanently', () => {
      const state = DEFAULT_STATE();
      state.inventory = [
        { id: 'item_1', itemId: 'knight_sword', count: 1 }
      ];

      const res = CollectionService.registerItem(state, 'novice_weapons', 'knight_sword');
      assert.equal(res.success, true);
      assert.equal(state.inventory.length, 0); // Item consumed/destroyed
      assert.ok(state.codex['novice_weapons'].includes('knight_sword'));

      // Check stats after completing partial collection
      const stats = CollectionService.getCollectionStats(state);
      assert.ok(stats);
    });

    it('prevents registering duplicate or non-matching items', () => {
      const state = DEFAULT_STATE();
      state.inventory = [
        { id: 'item_1', itemId: 'knight_sword', count: 2 },
        { id: 'item_2', itemId: 'random_invalid_item', count: 1 }
      ];

      CollectionService.registerItem(state, 'novice_weapons', 'knight_sword');
      // Attempt duplicate
      const dupRes = CollectionService.registerItem(state, 'novice_weapons', 'knight_sword');
      assert.equal(dupRes.success, false);
      assert.equal(dupRes.reason, 'already_registered');

      // Attempt invalid
      const invRes = CollectionService.registerItem(state, 'novice_weapons', 'random_invalid_item');
      assert.equal(invRes.success, false);
      assert.equal(invRes.reason, 'not_in_collection');
    });

    it('completes collection and activates full bonus', () => {
      const state = DEFAULT_STATE();
      state.inventory = [
        { id: 'i1', itemId: 'knight_sword', count: 1 },
        { id: 'i2', itemId: 'crucifix_of_blessing_magicblunt', count: 1 },
        { id: 'i3', itemId: 'hunting_bow', count: 1 }
      ];

      CollectionService.registerItem(state, 'novice_weapons', 'knight_sword');
      CollectionService.registerItem(state, 'novice_weapons', 'crucifix_of_blessing_magicblunt');
      const finalRes = CollectionService.registerItem(state, 'novice_weapons', 'hunting_bow');

      assert.equal(finalRes.success, true);
      assert.equal(finalRes.isCompleted, true);

      const stats = CollectionService.getCollectionStats(state);
      assert.equal(stats.atk, 25);
      assert.equal(stats.matk, 25);
    });
  });

  describe('2. Canonical D-Grade & C-Grade Crafting Loop', () => {
    it('registers authentic recipes for shots, weapons, and consumables', () => {
      assert.ok(CRAFTING_RECIPES['recipe_soulshot_d']);
      assert.ok(CRAFTING_RECIPES['recipe_spiritshot_d']);
      assert.ok(CRAFTING_RECIPES['recipe_soulshot_c']);
      assert.ok(CRAFTING_RECIPES['weapon_crimson_sword']);
      assert.ok(CRAFTING_RECIPES['weapon_samurai_longsword']);
      assert.ok(CRAFTING_RECIPES['recipe_stew_fish']);
      assert.ok(CRAFTING_RECIPES['recipe_greater_healing_potion']);
    });

    it('crafts 500 Soulshots D consuming crystal_d and soul_ore', () => {
      const state = DEFAULT_STATE();
      state.gold = 100000;
      state.inventory = [
        { id: 'inv_cryst', itemId: 'crystal_d', count: 10 },
        { id: 'inv_ore', itemId: 'soul_ore', count: 50 }
      ];
      state.level = 25;

      const craftRes = CraftService.craftItem(state, 'recipe_soulshot_d', 1);
      assert.equal(craftRes, true);

      const shotsInInv = state.inventory.find(i => i.itemId === 'soulshot_d');
      assert.ok(shotsInInv);
      assert.ok(shotsInInv.count >= 500);
    });
  });

  describe('3. Augmentation System (Life Stone requirement)', () => {
    it('strictly requires a Life Stone in inventory to augment', () => {
      const state = DEFAULT_STATE();
      state.gold = 1000000;
      state.inventory = [
        { id: 'w1', itemId: 'weapon_crimson_sword', name: 'Crimson Sword', type: 'weapon', grade: 'D' }
      ];

      const res = AugmentationService.augmentWeapon(state, 'w1', 'life_stone_28', {});
      assert.equal(res.success, false);
      assert.equal(res.reason, 'missing_life_stone');
    });

    it('successfully augments weapon with Life Stone and Gemstone/Crystal fee', () => {
      const state = DEFAULT_STATE();
      state.gold = 100000;
      state.inventory = [
        { id: 'w1', itemId: 'weapon_crimson_sword', name: 'Crimson Sword', type: 'weapon', grade: 'D' },
        { id: 'ls1', itemId: 'life_stone_28', count: 1 },
        { id: 'cr1', itemId: 'crystal_d', count: 10 }
      ];

      const res = AugmentationService.augmentWeapon(state, 'w1', 'life_stone_28', {});
      assert.equal(res.success, true);
      assert.ok(res.item.augmentation);
      assert.ok(res.item.augmentation.stats);
      assert.equal(state.inventory.find(i => i.itemId === 'life_stone_28'), undefined);
    });
  });

  describe('4. Synthesis & Brooch Jewels System', () => {
    it('restricts synthesis eligibility to artifacts and blocks standard weapons', () => {
      const sword = { id: 's1', itemId: 'weapon_crimson_sword', type: 'weapon' };
      assert.equal(SynthesisService.isEligible(sword), false);

      const jewel = { id: 'j1', itemId: 'jewel_ruby_1', type: 'brooch_jewel', jewelType: 'ruby', level: 1 };
      assert.equal(SynthesisService.isEligible(jewel), true);
    });

    it('advances jewel level upon successful synthesis', () => {
      const state = DEFAULT_STATE();
      state.gold = 1000000;
      const primary = { id: 'j1', uid: 'u_j1', itemId: 'jewel_ruby_1', jewelType: 'ruby', level: 1, type: 'brooch_jewel' };
      const sacrifice = { id: 'j2', uid: 'u_j2', itemId: 'jewel_ruby_1', jewelType: 'ruby', level: 1, type: 'brooch_jewel' };

      state.inventory = [primary, sacrifice];

      // Force deterministic success for test
      const origRandom = Math.random;
      Math.random = () => 0.01;
      try {
        const res = SynthesisService.synthesize(state, 'u_j1', 'u_j2');
        assert.equal(res.success, true);
        assert.equal(res.resultItem.level, 2);
        assert.equal(res.resultItem.itemId, 'jewel_ruby_2');
      } finally {
        Math.random = origRandom;
      }
    });

    it('verifies brooch and jewel catalog presence in ALL_ITEMS', () => {
      assert.ok(ALL_ITEMS['brooch_d']);
      assert.ok(ALL_ITEMS['jewel_ruby_1']);
      assert.ok(ALL_ITEMS['jewel_diamond_5']);
      assert.ok(ALL_ITEMS['greater_healing_potion']);
      assert.ok(ALL_ITEMS['stew_fish']);
    });
  });

  describe('5. Life Activities Refinery Fish Oil', () => {
    it('refines generic raw fish into canonical fish_oil', () => {
      const state = DEFAULT_STATE();
      state.gold = 10000;
      state.inventory = [
        { id: 'f1', itemId: 'fish_raw', count: 10 }
      ];

      const res = RefineryService.refine(state, 'refine_fish_oil', 1);
      assert.equal(res.success, true);
      assert.ok(state.inventory.some(i => i.itemId === 'fish_oil'));
    });
  });

  describe('6. Authentic Soulshot Economics: Grade Matching (+100%) vs Universal Wildcard (+30%)', () => {
    it('activates dedicated matching shot with +100% damage and 1-to-1 consumption', () => {
      const state = DEFAULT_STATE();
      state.soulshotActive = true;
      state.inventory = [
        { id: 'ss_d', itemId: 'soulshot_d', count: 100 }
      ];
      const weaponDef = { id: 'weapon_crimson_sword', grade: 'D', tier: 2 };

      const res = resolveSoulshotEffect(state, weaponDef, false);
      assert.ok(res.shotItem);
      assert.equal(res.shotItem.itemId, 'soulshot_d');
      assert.equal(res.isUniversal, false);
      assert.equal(res.multiplier, 2.0); // +100% bonus
      assert.equal(res.label, 'SS (+100%)');
    });

    it('activates universal shot as wildcard with +30% damage when matching shot is absent', () => {
      const state = DEFAULT_STATE();
      state.soulshotActive = true;
      state.inventory = [
        { id: 'ss_u', itemId: 'soulshot_universal', count: 100 }
      ];
      const weaponDef = { id: 'weapon_crimson_sword', grade: 'D', tier: 2 };

      const res = resolveSoulshotEffect(state, weaponDef, false);
      assert.ok(res.shotItem);
      assert.equal(res.shotItem.itemId, 'soulshot_universal');
      assert.equal(res.isUniversal, true);
      assert.equal(res.multiplier, 1.30); // +30% bonus
      assert.equal(res.label, 'SS Univ (+30%)');
    });

    it('does NOT activate lower grade shot on higher grade weapon (preserves shot, 1.0x damage)', () => {
      const state = DEFAULT_STATE();
      state.soulshotActive = true;
      state.inventory = [
        { id: 'ss_ng', itemId: 'soulshot_ng', count: 500 }
      ];
      // D-Grade weapon cannot use No-Grade shots
      const weaponDef = { id: 'weapon_crimson_sword', grade: 'D', tier: 2 };

      const res = resolveSoulshotEffect(state, weaponDef, false);
      assert.equal(res.shotItem, null);
      assert.equal(res.multiplier, 1.0);
      assert.equal(res.label, null);
    });

    it('prioritizes dedicated matching shot (+100%) over universal wildcard (+30%) when both are present', () => {
      const state = DEFAULT_STATE();
      state.soulshotActive = true;
      state.inventory = [
        { id: 'ss_u', itemId: 'soulshot_universal', count: 50 },
        { id: 'ss_d', itemId: 'soulshot_d', count: 20 }
      ];
      const weaponDef = { id: 'weapon_crimson_sword', grade: 'D', tier: 2 };

      const res = resolveSoulshotEffect(state, weaponDef, false);
      assert.ok(res.shotItem);
      assert.equal(res.shotItem.itemId, 'soulshot_d');
      assert.equal(res.isUniversal, false);
      assert.equal(res.multiplier, 2.0);
    });

    it('supports magic weapons with dedicated spiritshot (+100%) and universal spiritshot (+30%)', () => {
      const state = DEFAULT_STATE();
      state.soulshotActive = true;
      const weaponDef = { id: 'staff_of_life', grade: 'D', tier: 2 };

      // Dedicated match
      state.inventory = [{ id: 'sps_d', itemId: 'spiritshot_d', count: 50 }];
      const resDedicated = resolveSoulshotEffect(state, weaponDef, true);
      assert.equal(resDedicated.multiplier, 2.0);
      assert.equal(resDedicated.label, 'SPS (+100%)');

      // Universal wildcard
      state.inventory = [{ id: 'sps_u', itemId: 'spiritshot_universal', count: 50 }];
      const resUniversal = resolveSoulshotEffect(state, weaponDef, true);
      assert.equal(resUniversal.multiplier, 1.30);
      assert.equal(resUniversal.label, 'SPS Univ (+30%)');
    });

    it('does not apply bonus if soulshotActive is false', () => {
      const state = DEFAULT_STATE();
      state.soulshotActive = false;
      state.inventory = [{ id: 'ss_d', itemId: 'soulshot_d', count: 100 }];
      const weaponDef = { id: 'weapon_crimson_sword', grade: 'D', tier: 2 };

      const res = resolveSoulshotEffect(state, weaponDef, false);
      assert.equal(res.shotItem, null);
      assert.equal(res.multiplier, 1.0);
    });
  });
});
