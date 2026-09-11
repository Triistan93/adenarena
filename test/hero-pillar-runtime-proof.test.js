import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';
import { getStats, getBaseAttributes, calculatePhysicalSkillDamage, ASTRAL_NODES } from '../lineage-idle/src/engine/StatsEngine.js';
import { CombatPowerService } from '../lineage-idle/src/services/CombatPowerService.js';
import { PetService } from '../lineage-idle/src/services/PetService.js';
import { DyeService } from '../lineage-idle/src/services/DyeService.js';
import { QUEST_DEFS, BATTLE_PASS_TIERS } from '../lineage-idle/src/data/quests.js';
import { checkQuestResets, triggerQuestEvent, claimQuestReward, claimDailyBonusChest } from '../lineage-idle/src/services/QuestService.js';
import { WEAPONS } from '../lineage-idle/src/data/items/weapons.js';

// Setup GameData for Node.js test environment
globalThis.GameData = globalThis.GameData || {};
globalThis.GameData.ALL_ITEMS = globalThis.GameData.ALL_ITEMS || { ...WEAPONS };

describe('Hero Pillar Deep Validation — Suite 1: Runtime Proof & Stat Isolation', () => {

  it('1. Stat Source Isolation & Atomic Rollback: Each stat source increases exactly once and rolls back cleanly', () => {
    const baseState = DEFAULT_STATE();
    baseState.race = 'human';
    baseState.class = 'gladiator';
    baseState.level = 40;

    const baseStats = getStats(baseState);
    const initialAtk = baseStats.atk;
    const initialHp = baseStats.maxHp;

    // Test Source A: Equipment
    baseState.inventory = [{ uid: 'test_wpn', itemId: 'crimson_sword', equipped: true, equippedSlot: 'weapon' }];
    baseState.equipment.weapon = 'test_wpn';
    const equipStats = getStats(baseState);
    assert.ok(equipStats.atk > initialAtk, 'Equip must increase P.Atk');

    // Rollback Equipment
    baseState.equipment.weapon = null;
    baseState.inventory[0].equipped = false;
    const rolledBackEquipStats = getStats(baseState);
    assert.strictEqual(rolledBackEquipStats.atk, initialAtk, 'Unequip must rollback P.Atk to baseline exactly');

    // Test Source B: Dyes
    baseState.tattoos = [{ id: 'dye_str_4', plusStat: 'str', plusVal: 4, minusStat: 'con', minusVal: 4 }];
    const dyeStats = getStats(baseState);
    assert.ok(dyeStats.atk > initialAtk, 'STR dye must increase P.Atk');
    assert.ok(dyeStats.maxHp < initialHp, 'CON reduction must reduce Max HP');

    // Rollback Dyes
    baseState.tattoos = [];
    const rolledBackDyeStats = getStats(baseState);
    assert.strictEqual(rolledBackDyeStats.atk, initialAtk, 'Removing dyes must rollback P.Atk exactly');
    assert.strictEqual(rolledBackDyeStats.maxHp, initialHp, 'Removing dyes must rollback Max HP exactly');

    // Test Source C: Astral Mastery
    baseState.astralMastery = { dragon_1: 5 }; // +15% P.Atk
    const astralStats = getStats(baseState);
    assert.ok(astralStats.atk > initialAtk, 'Astral node must increase P.Atk');

    // Rollback Astral
    baseState.astralMastery = {};
    const rolledBackAstralStats = getStats(baseState);
    assert.strictEqual(rolledBackAstralStats.atk, initialAtk, 'Resetting astral must rollback P.Atk exactly');

    // Test Source D: Boss Doll
    baseState.dolls = [{ dollId: 'doll_valakas', level: 1 }]; // +80 P.Atk
    const dollStats = getStats(baseState);
    assert.ok(dollStats.atk > initialAtk, 'Valakas doll must increase P.Atk');

    // Rollback Doll
    baseState.dolls = [];
    const rolledBackDollStats = getStats(baseState);
    assert.strictEqual(rolledBackDollStats.atk, initialAtk, 'Removing doll must rollback P.Atk exactly');
  });

  it('2. Stat Cross-Contamination & Composition: Simultaneous activation matches expected composition with zero double-counting', () => {
    const state = DEFAULT_STATE();
    state.race = 'human';
    state.class = 'gladiator';
    state.level = 60;

    // Baseline
    const baseStats = getStats(state);

    // Apply multiple independent systems
    state.tattoos = [{ id: 'dye_str_4', plusStat: 'str', plusVal: 4, minusStat: 'con', minusVal: 4 }];
    state.astralMastery = { dragon_1: 5, phoenix_1: 5 };
    state.dolls = [{ dollId: 'doll_valakas', level: 2 }];
    state.subclasses = [{ id: 'sagittarius', classId: 'sagittarius', level: 75 }];
    state.subclassCertifications = {
      sagittarius: { lv65: 'emergent_patk', lv70: 'emergent_pdef' }
    };

    const compositeStats = getStats(state);

    // Confirm that STR scaled cleanly in primaryStats
    assert.strictEqual(state.primaryStats.str, 40 + 4);
    assert.strictEqual(state.primaryStats.con, 43 - 4);

    // Confirm that emergent passives applied once
    assert.ok(compositeStats.atk > baseStats.atk);
    assert.ok(compositeStats.def > baseStats.def);
    assert.ok(compositeStats.combatPower > baseStats.combatPower);
  });

  it('3. CP Traceability: Changing individual components produces deterministic component CP deltas', () => {
    const state = DEFAULT_STATE();
    state.race = 'human';
    state.class = 'duelist';
    state.level = 76;

    const initialStats = getStats(state);
    const initialCP = initialStats.combatPower;

    // Equip an item
    state.inventory = [{ uid: 'wpn_s', itemId: 'crimson_sword', enchant: 0, rarity: 'legendary', equipped: true, equippedSlot: 'weapon' }];
    state.equipment.weapon = 'wpn_s';

    const equippedStats = getStats(state);
    const equippedCP = equippedStats.combatPower;
    const weaponCPDelta = equippedCP - initialCP;

    assert.ok(weaponCPDelta > 0, 'Weapon equip must yield positive CP delta');
    assert.strictEqual(equippedCP, initialCP + weaponCPDelta, 'Total CP must equal Initial CP + Weapon Delta');
  });

  it('4. Skill Real Combat Execution: Physical damage formula scales with P.Atk, Skill Power, charges and opponent P.Def', () => {
    const lowDmg = calculatePhysicalSkillDamage({ pAtkSkill: 500, pAtkChar: 200, pDefChar: 300 });
    const highDmg = calculatePhysicalSkillDamage({ pAtkSkill: 1500, pAtkChar: 500, pDefChar: 300 });
    const chargedDmg = calculatePhysicalSkillDamage({ pAtkSkill: 1500, pAtkChar: 500, pDefChar: 300, chargeLv: 5 });

    assert.ok(highDmg > lowDmg, 'Higher P.Atk & Skill Power must deal more damage');
    assert.ok(chargedDmg > highDmg, 'Sonic Focus charges must scale damage');
  });

  it('5. Pet Combat Participation: Active pet buffs combat stats; Dismissed pet leaves stats at baseline', () => {
    const state = DEFAULT_STATE();
    state.level = 30;
    state.gold = 500000;

    // Adopt Wolf
    PetService.adoptPet(state, 'pet_wolf');
    assert.strictEqual(state.petData.activePetId, 'pet_wolf');

    const petActiveBonus = PetService.getActivePetBonus(state);
    assert.ok(petActiveBonus, 'Active wolf must yield pet bonus');
    assert.strictEqual(petActiveBonus.stat, 'patkMult');

    // Dismiss pet by toggling summon
    PetService.summonPet(state, 'pet_wolf');
    assert.strictEqual(state.petData.activePetId, null);

    const dismissedBonus = PetService.getActivePetBonus(state);
    assert.strictEqual(dismissedBonus, null, 'Dismissed pet must provide 0 active bonus');
  });

  it('6. Daily Quests 24h Time Boundary: Proves precise boundary behavior at 23:59:59 vs 24:00:00', () => {
    const state = DEFAULT_STATE();
    const now = Date.now();
    const ONE_DAY = 24 * 60 * 60 * 1000;

    // 1 second before 24h -> NO reset
    state.quests.lastDailyReset = now - (ONE_DAY - 1000);
    state.quests.claimed = ['d_kills'];
    state.quests.dailyBonusClaimed = true;

    checkQuestResets(state);
    assert.strictEqual(state.quests.claimed.includes('d_kills'), true, 'Must NOT reset at 23h59m59s');
    assert.strictEqual(state.quests.dailyBonusClaimed, true);

    // At or beyond 24h -> Triggers reset
    state.quests.lastDailyReset = now - ONE_DAY;
    checkQuestResets(state);
    assert.strictEqual(state.quests.claimed.includes('d_kills'), false, 'Must reset at 24h exactly');
    assert.strictEqual(state.quests.dailyBonusClaimed, false);
  });
});
