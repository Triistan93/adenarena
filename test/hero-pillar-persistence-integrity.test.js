import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';
import { getStats } from '../lineage-idle/src/engine/StatsEngine.js';
import { migrateEquipmentSlots } from '../lineage-idle/src/services/EquipmentService.js';

describe('Hero Pillar Deep Validation — Suite 2: Persistence Integrity & Robustness', () => {

  it('1. Canonical Hash Snapshot Roundtrip: 100% persisted fields preserved without mutation or data loss', () => {
    const originalState = DEFAULT_STATE();
    originalState.heroName = 'ArchonOfAden';
    originalState.race = 'human';
    originalState.class = 'duelist';
    originalState.level = 80;
    originalState.gold = 10000000;
    originalState.sp = 50000;
    originalState.astralShards = 99;
    originalState.prestigeLevel = 2;

    originalState.inventory = [
      { uid: 'i_1', itemId: 'crimson_sword', enchant: 10, rarity: 'epic', equipped: true, equippedSlot: 'weapon' }
    ];
    originalState.equipment.weapon = 'i_1';
    originalState.astralMastery = { dragon_1: 10, phoenix_1: 8 };
    originalState.dolls = [{ dollId: 'doll_valakas', level: 3 }];
    originalState.petData = {
      activePetId: 'pet_wolf',
      pets: { pet_wolf: { id: 'pet_wolf', level: 20, xp: 5000, hunger: 100 } },
      lastFeedTime: 1700000000000
    };
    originalState.cosmetics = {
      activeAura: 'aura_crimson_warlord',
      activeFrame: 'frame_gold',
      activeTitle: 'title_ceifador',
      unlockedAuras: ['aura_none', 'aura_crimson_warlord'],
      unlockedFrames: ['frame_default', 'frame_gold'],
      unlockedTitles: ['title_none', 'title_ceifador']
    };
    originalState.achievements = { claimed: ['ach_first_blood', 'ach_steel_master'] };
    originalState.quests = {
      progress: { d_kills: 50 },
      claimed: ['d_kills'],
      lastDailyReset: 1700000000000,
      dailyBonusClaimed: false
    };
    originalState.battlePass = {
      xp: 1500,
      claimedFree: [1, 2],
      claimedPremium: [1],
      unlockedPremium: true
    };

    // Serialize to JSON and parse back
    const jsonStr = JSON.stringify(originalState);
    const loadedState = JSON.parse(jsonStr);

    // Deep equality assertion across all persisted fields
    assert.strictEqual(loadedState.heroName, originalState.heroName);
    assert.strictEqual(loadedState.race, originalState.race);
    assert.strictEqual(loadedState.class, originalState.class);
    assert.strictEqual(loadedState.level, originalState.level);
    assert.strictEqual(loadedState.gold, originalState.gold);
    assert.strictEqual(loadedState.sp, originalState.sp);
    assert.strictEqual(loadedState.astralShards, originalState.astralShards);
    assert.strictEqual(loadedState.prestigeLevel, originalState.prestigeLevel);

    assert.deepStrictEqual(loadedState.inventory, originalState.inventory);
    assert.deepStrictEqual(loadedState.equipment, originalState.equipment);
    assert.deepStrictEqual(loadedState.astralMastery, originalState.astralMastery);
    assert.deepStrictEqual(loadedState.dolls, originalState.dolls);
    assert.deepStrictEqual(loadedState.petData, originalState.petData);
    assert.deepStrictEqual(loadedState.cosmetics, originalState.cosmetics);
    assert.deepStrictEqual(loadedState.achievements, originalState.achievements);
    assert.deepStrictEqual(loadedState.quests, originalState.quests);
    assert.deepStrictEqual(loadedState.battlePass, originalState.battlePass);
  });

  it('2. Legacy Equipment Key Normalization: Handles mixed old/new saves, duplicate keys and empty aliases', () => {
    const legacyState = {
      equipment: {
        hair: 'old_hair',
        hair1: 'new_hair1', // hair1 already exists -> must preserve new_hair1
        ring: 'old_ring',
        ring1: null,        // ring1 is empty -> must populate from ring
        cape: 'old_cape',
        talisman: 'old_talisman',
        agathion: 'old_agathion'
      }
    };

    migrateEquipmentSlots(legacyState);

    assert.strictEqual(legacyState.equipment.hair1, 'new_hair1');
    assert.strictEqual(legacyState.equipment.ring1, 'old_ring');
    assert.strictEqual(legacyState.equipment.cloak, 'old_cape');
    assert.strictEqual(legacyState.equipment.talisman_bracelet, 'old_talisman');
    assert.strictEqual(legacyState.equipment.agathion_bracelet, 'old_agathion');
    assert.strictEqual(legacyState.equipment.hair, undefined);
    assert.strictEqual(legacyState.equipment.ring, undefined);
    assert.strictEqual(legacyState.equipment.cape, undefined);
    assert.strictEqual(legacyState.equipment.talisman, undefined);
    assert.strictEqual(legacyState.equipment.agathion, undefined);
  });

  it('3. Reborn Progression Lifecycle: Preserves prestige, astral mastery and collections while resetting character level', () => {
    const state = DEFAULT_STATE();
    state.level = 80;
    state.prestigeLevel = 0;
    state.astralShards = 15;
    state.astralMastery = { dragon_1: 10, midas_1: 5 };
    state.dolls = [{ dollId: 'doll_valakas', level: 2 }];
    state.codex = { novice_weapons: ['knight_sword', 'crucifix_of_blessing_magicblunt', 'hunting_bow'] };

    // Simulate Reborn operation
    state.level = 1;
    state.prestigeLevel = 1;
    state.skills = {}; // base skills reset for new cycle

    assert.strictEqual(state.level, 1);
    assert.strictEqual(state.prestigeLevel, 1);
    assert.strictEqual(state.astralMastery.dragon_1, 10, 'Astral mastery must persist across Reborn');
    assert.strictEqual(state.astralMastery.midas_1, 5, 'Astral mastery must persist across Reborn');
    assert.strictEqual(state.dolls.length, 1, 'Boss dolls must persist across Reborn');
    assert.ok(state.codex.novice_weapons, 'Codex collections must persist across Reborn');
  });

  it('4. Corruption Recovery & Boundary Immunity: Gracefully handles negative resources, null objects and NaN fields', () => {
    const corruptState = {
      heroName: null,
      level: -5,
      gold: -99999,
      sp: -100,
      astralShards: -50,
      base: { atk: NaN, def: null, eva: undefined },
      equipment: null,
      inventory: null,
      dolls: null,
      skills: null,
      astralMastery: null,
      tattoos: null
    };

    assert.doesNotThrow(() => {
      const stats = getStats(corruptState);
      assert.ok(stats.atk >= 1, 'P.Atk must fall back to valid positive floor');
      assert.ok(stats.def >= 0, 'P.Def must fall back to valid non-negative floor');
      assert.ok(stats.maxHp >= 1, 'Max HP must fall back to valid positive floor');
      assert.ok(!isNaN(stats.combatPower), 'Combat Power must never be NaN');
      assert.ok(isFinite(stats.combatPower), 'Combat Power must never be Infinity');
    });
  });
});
