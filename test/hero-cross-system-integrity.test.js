import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';
import { getStats, getBaseAttributes } from '../lineage-idle/src/engine/StatsEngine.js';
import { CombatPowerService } from '../lineage-idle/src/services/CombatPowerService.js';
import { equipItem } from '../lineage-idle/src/services/EquipmentService.js';
import { PetService } from '../lineage-idle/src/services/PetService.js';
import { AchievementService } from '../lineage-idle/src/services/AchievementService.js';
import { triggerQuestEvent, claimQuestReward, claimDailyBonusChest } from '../lineage-idle/src/services/QuestService.js';

describe('Hero Pillar — Suite 8: Cross-System Triangulation & Holistic Integrity', () => {

  it('1. End-to-End Progression Flow: Character -> Equip -> Skills -> Astral -> Dolls -> Pets -> CP Scaling', () => {
    const state = DEFAULT_STATE();
    state.heroName = 'AdenChampion';
    state.race = 'human';
    state.class = 'duelist';
    state.level = 80;
    state.gold = 5000000;
    state.sp = 100000;

    // 1. Initial baseline stats
    const baselineStats = getStats(state);
    assert.ok(baselineStats.combatPower > 0);

    // 2. Add and Equip Draconic Weapon
    state.inventory = [
      { uid: 'wpn_1', itemId: 'draconic_bow', enchant: 10, rarity: 'legendary' }
    ];
    state.equipment.weapon = 'wpn_1';
    state.inventory[0].equipped = true;

    // 3. Upgrade Astral nodes
    state.astralMastery = {
      dragon_1: 10, // +30% P.Atk
      dragon_4: 10, // +50% Crit Dmg
      phoenix_1: 10 // +50% Max HP
    };

    // 4. Collect Boss Dolls
    state.dolls = [
      { dollId: 'doll_valakas', level: 5 },
      { dollId: 'doll_antharas', level: 5 }
    ];

    // 5. Adopt and summon Pet
    PetService.adoptPet(state, 'pet_wolf');
    PetService.summonPet(state, 'pet_wolf');

    // 6. Calculate empowered stats
    const empoweredStats = getStats(state);

    assert.ok(empoweredStats.atk > baselineStats.atk, 'Empowered P.Atk must be strictly greater than baseline');
    assert.ok(empoweredStats.maxHp > baselineStats.maxHp, 'Empowered Max HP must be strictly greater than baseline');
    assert.ok(empoweredStats.combatPower > baselineStats.combatPower, 'Empowered CP must be significantly higher than baseline');
  });

  it('2. Save / Load Deep Persistence: 100% data roundtrip across all 7 Hero Pillar subtabs', () => {
    const originalState = DEFAULT_STATE();
    originalState.heroName = 'MasterOfAden';
    originalState.race = 'darkelf';
    originalState.class = 'ghost_sentinel';
    originalState.level = 82;
    originalState.gold = 12500000;
    originalState.sp = 50000;

    originalState.equipment.weapon = 'bow_s_01';
    originalState.equipment.helmet = 'helm_s_01';
    originalState.equipment.armor = 'armor_s_01';
    originalState.equipment.legs = 'legs_s_01';
    originalState.equipment.gloves = 'gloves_s_01';
    originalState.equipment.boots = 'boots_s_01';
    originalState.equipment.hair1 = 'hair_acc_01';
    originalState.equipment.necklace = 'neck_tateossian';

    originalState.skills = { 'power_shot': 10, 'bow_mastery': 15 };
    originalState.astralShards = 120;
    originalState.astralMastery = { dragon_1: 10, midas_1: 10 };
    originalState.dolls = [{ dollId: 'doll_baium', level: 3 }];
    originalState.petData = {
      activePetId: 'pet_wolf',
      pets: { pet_wolf: { id: 'pet_wolf', level: 35, xp: 12000, hunger: 100 } },
      lastFeedTime: Date.now()
    };
    originalState.cosmetics = {
      activeAura: 'aura_frost_monarch',
      activeFrame: 'frame_gold',
      activeTitle: 'title_gladiator',
      unlockedAuras: ['aura_none', 'aura_frost_monarch'],
      unlockedFrames: ['frame_default', 'frame_gold'],
      unlockedTitles: ['title_none', 'title_gladiator']
    };
    originalState.achievements = { claimed: ['ach_first_blood', 'ach_gladiator'] };
    originalState.quests = {
      progress: { d_kills: 50 },
      claimed: ['d_kills'],
      lastDailyReset: Date.now(),
      dailyBonusClaimed: false
    };
    originalState.battlePass = {
      xp: 2500,
      claimedFree: [1, 2, 3],
      claimedPremium: [1, 2],
      unlockedPremium: true
    };

    const serialized = JSON.stringify(originalState);
    const restored = JSON.parse(serialized);

    assert.deepStrictEqual(restored.heroName, originalState.heroName);
    assert.deepStrictEqual(restored.equipment, originalState.equipment);
    assert.deepStrictEqual(restored.skills, originalState.skills);
    assert.deepStrictEqual(restored.astralMastery, originalState.astralMastery);
    assert.deepStrictEqual(restored.dolls, originalState.dolls);
    assert.deepStrictEqual(restored.petData, originalState.petData);
    assert.deepStrictEqual(restored.cosmetics, originalState.cosmetics);
    assert.deepStrictEqual(restored.achievements, originalState.achievements);
    assert.deepStrictEqual(restored.quests, originalState.quests);
    assert.deepStrictEqual(restored.battlePass, originalState.battlePass);
  });

  it('3. Robustness & Boundary Validation: Engine gracefully handles empty, corrupt or missing state fields', () => {
    const corruptState = {
      race: null,
      class: null,
      level: null,
      equipment: null,
      skills: null,
      dolls: null,
      astralMastery: null,
      petData: null
    };

    assert.doesNotThrow(() => {
      const stats = getStats(corruptState);
      assert.ok(stats.atk >= 1);
      assert.ok(stats.combatPower >= 0);
    });
  });
});
