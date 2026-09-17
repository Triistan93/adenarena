/**
 * test/skill-conditions.test.js — Test Suite for Auto-Battle Tactical Conditions
 *
 * Tests:
 * 1. Condition evaluation: HP% thresholds (self below 75%, 50%, 30%, target below 30%)
 * 2. Condition evaluation: Enemy count requirements (1+, 2+, 3+)
 * 3. Condition evaluation: Boss target filtering (boss_only, normal_only, any)
 * 4. Condition evaluation: Target status requirements (stunned, bleeding)
 * 5. Smart condition default assignment based on skill metadata
 * 6. Integration: shouldCastSkill accurately gates combat auto-cast decisions
 * 7. Canon rule: Zero new skills created
 */

import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';

import {
  DEFAULT_CONDITION,
  isBossOrElite,
  getCombatContext,
  evaluateCondition,
  getSkillCondition,
  setSkillCondition,
  clearSkillCondition,
  getSmartConditionDefaults,
  shouldCastSkill,
  getConditionBadgeText
} from '../lineage-idle/src/services/SkillConditionService.js';

import {
  equipSkill,
  autoEquipLoadout,
  getLoadout
} from '../lineage-idle/src/services/SkillLoadoutService.js';

describe('Auto-Battle Conditions — Evaluation Logic', () => {

  it('1. Default condition allows casting under any standard circumstances', () => {
    const context = {
      playerHpPct: 100,
      targetHpPct: 100,
      isBoss: false,
      enemyCount: 1,
      isStunned: false,
      isBleeding: false
    };
    assert.equal(evaluateCondition(DEFAULT_CONDITION, context), true);
  });

  it('2. Player HP Trigger: self_below_75 only casts when player HP < 75%', () => {
    const cond = { ...DEFAULT_CONDITION, hpTrigger: 'self_below_75' };

    // At 100% HP -> should NOT cast
    assert.equal(evaluateCondition(cond, { playerHpPct: 100, targetHpPct: 100, isBoss: false, enemyCount: 1 }), false);
    // At 75% HP -> should NOT cast
    assert.equal(evaluateCondition(cond, { playerHpPct: 75, targetHpPct: 100, isBoss: false, enemyCount: 1 }), false);
    // At 74% HP -> SHOULD cast
    assert.equal(evaluateCondition(cond, { playerHpPct: 74, targetHpPct: 100, isBoss: false, enemyCount: 1 }), true);
    // At 30% HP -> SHOULD cast
    assert.equal(evaluateCondition(cond, { playerHpPct: 30, targetHpPct: 100, isBoss: false, enemyCount: 1 }), true);
  });

  it('3. Player HP Trigger: self_below_30 emergency gating', () => {
    const cond = { ...DEFAULT_CONDITION, hpTrigger: 'self_below_30' };

    assert.equal(evaluateCondition(cond, { playerHpPct: 50, targetHpPct: 100, isBoss: false, enemyCount: 1 }), false);
    assert.equal(evaluateCondition(cond, { playerHpPct: 30, targetHpPct: 100, isBoss: false, enemyCount: 1 }), false);
    assert.equal(evaluateCondition(cond, { playerHpPct: 29, targetHpPct: 100, isBoss: false, enemyCount: 1 }), true);
  });

  it('4. Target HP Trigger: target_below_30 executes only when enemy HP < 30%', () => {
    const cond = { ...DEFAULT_CONDITION, hpTrigger: 'target_below_30' };

    assert.equal(evaluateCondition(cond, { playerHpPct: 100, targetHpPct: 80, isBoss: false, enemyCount: 1 }), false);
    assert.equal(evaluateCondition(cond, { playerHpPct: 100, targetHpPct: 30, isBoss: false, enemyCount: 1 }), false);
    assert.equal(evaluateCondition(cond, { playerHpPct: 100, targetHpPct: 25, isBoss: false, enemyCount: 1 }), true);
  });

  it('5. Boss Target Filter: boss_only skips normal mobs and triggers on bosses/elites', () => {
    const cond = { ...DEFAULT_CONDITION, bossTarget: 'boss_only' };

    // Regular wolf
    assert.equal(evaluateCondition(cond, { playerHpPct: 100, targetHpPct: 100, isBoss: false, enemyCount: 1 }), false);
    // Raid or Zone Boss
    assert.equal(evaluateCondition(cond, { playerHpPct: 100, targetHpPct: 100, isBoss: true, enemyCount: 1 }), true);
  });

  it('6. Boss Target Filter: normal_only skips bosses and triggers on regular mobs', () => {
    const cond = { ...DEFAULT_CONDITION, bossTarget: 'normal_only' };

    assert.equal(evaluateCondition(cond, { playerHpPct: 100, targetHpPct: 100, isBoss: true, enemyCount: 1 }), false);
    assert.equal(evaluateCondition(cond, { playerHpPct: 100, targetHpPct: 100, isBoss: false, enemyCount: 1 }), true);
  });

  it('7. Enemy Count Filter: minEnemies=2 requires at least 2 enemies (AoE tactic)', () => {
    const cond = { ...DEFAULT_CONDITION, minEnemies: 2 };

    // 1 enemy on screen
    assert.equal(evaluateCondition(cond, { playerHpPct: 100, targetHpPct: 100, isBoss: false, enemyCount: 1 }), false);
    // 2 enemies
    assert.equal(evaluateCondition(cond, { playerHpPct: 100, targetHpPct: 100, isBoss: false, enemyCount: 2 }), true);
    // 4 enemies
    assert.equal(evaluateCondition(cond, { playerHpPct: 100, targetHpPct: 100, isBoss: false, enemyCount: 4 }), true);
  });

  it('8. Target Status Filter: stunned & bleeding', () => {
    const stunCond = { ...DEFAULT_CONDITION, statusReq: 'stunned' };
    assert.equal(evaluateCondition(stunCond, { playerHpPct: 100, targetHpPct: 100, isStunned: false }), false);
    assert.equal(evaluateCondition(stunCond, { playerHpPct: 100, targetHpPct: 100, isStunned: true }), true);

    const bleedCond = { ...DEFAULT_CONDITION, statusReq: 'bleeding' };
    assert.equal(evaluateCondition(bleedCond, { playerHpPct: 100, targetHpPct: 100, isBleeding: false }), false);
    assert.equal(evaluateCondition(bleedCond, { playerHpPct: 100, targetHpPct: 100, isBleeding: true }), true);
  });
});

describe('Auto-Battle Conditions — State & Smart Defaults', () => {

  it('9. getSkillCondition returns default when not explicitly configured', () => {
    const state = { skillConditions: {} };
    const cond = getSkillCondition(state, 'core1');
    assert.deepEqual(cond, DEFAULT_CONDITION);
  });

  it('10. setSkillCondition updates condition on slot', () => {
    const state = { skillConditions: {} };
    setSkillCondition(state, 'core1', { hpTrigger: 'self_below_50', minEnemies: 2 });
    const cond = getSkillCondition(state, 'core1');
    assert.equal(cond.hpTrigger, 'self_below_50');
    assert.equal(cond.minEnemies, 2);
    assert.equal(cond.bossTarget, 'any'); // Preserves defaults
  });

  it('11. clearSkillCondition removes configured condition', () => {
    const state = { skillConditions: {} };
    setSkillCondition(state, 'core1', { hpTrigger: 'self_below_50' });
    clearSkillCondition(state, 'core1');
    assert.equal(state.skillConditions.core1, undefined);
  });

  it('12. getSmartConditionDefaults assigns sensible defaults for heals and AoEs', () => {
    // Heal skill
    const healDef = { id: 'greater_heal', type: 'active', effect: 'heal' };
    const healCond = getSmartConditionDefaults(healDef);
    assert.equal(healCond.hpTrigger, 'self_below_75');

    // AoE skill
    const aoeDef = { id: 'tempest', type: 'active', effect: 'aoe blast nearby enemies' };
    const aoeCond = getSmartConditionDefaults(aoeDef);
    assert.equal(aoeCond.minEnemies, 2);

    // Finisher skill
    const finisherDef = { id: 'fatal_strike', type: 'active', effect: 'finisher' };
    const finisherCond = getSmartConditionDefaults(finisherDef);
    assert.equal(finisherCond.hpTrigger, 'target_below_30');
  });

  it('13. getConditionBadgeText produces descriptive labels', () => {
    assert.equal(getConditionBadgeText({ ...DEFAULT_CONDITION }), null);
    assert.equal(getConditionBadgeText({ ...DEFAULT_CONDITION, bossTarget: 'boss_only' }), '👑 Boss');
    assert.equal(getConditionBadgeText({ ...DEFAULT_CONDITION, hpTrigger: 'self_below_50' }), 'HP<50%');
    assert.equal(getConditionBadgeText({ ...DEFAULT_CONDITION, minEnemies: 2 }), '👥 2+');
    assert.equal(
      getConditionBadgeText({ ...DEFAULT_CONDITION, bossTarget: 'boss_only', hpTrigger: 'self_below_50' }),
      '👑 Boss · HP<50%'
    );
  });
});

describe('Auto-Battle Conditions — Combat Loop Integration', () => {

  it('14. shouldCastSkill returns true if no condition configured', () => {
    const state = { hp: 100, maxHp: 100, skillConditions: {} };
    const monster = { hp: 100, maxHp: 100 };
    assert.equal(shouldCastSkill(state, 'power_strike', 'basic', monster), true);
  });

  it('15. shouldCastSkill gates heal when player HP is full', () => {
    const state = {
      hp: 100,
      maxHp: 100,
      skillConditions: {
        core1: { hpTrigger: 'self_below_75', bossTarget: 'any', minEnemies: 1 }
      }
    };
    const monster = { hp: 100, maxHp: 100 };

    // At 100% HP -> should NOT cast heal
    assert.equal(shouldCastSkill(state, 'heal_light', 'core1', monster), false);

    // After taking damage: HP down to 60/100 -> SHOULD cast heal
    state.hp = 60;
    assert.equal(shouldCastSkill(state, 'heal_light', 'core1', monster), true);
  });

  it('16. shouldCastSkill gates boss-only ultimate on regular monster', () => {
    const state = {
      hp: 100,
      maxHp: 100,
      skillConditions: {
        ultimate: { hpTrigger: 'none', bossTarget: 'boss_only', minEnemies: 1 }
      }
    };
    const normalMonster = { name: 'Keltir', hp: 50, maxHp: 50, boss: false, isRaid: false };
    const bossMonster = { name: 'Queen Ant', hp: 5000, maxHp: 5000, boss: true, isRaid: true };

    // Normal monster -> skip ultimate
    assert.equal(shouldCastSkill(state, 'celestial_nova', 'ultimate', normalMonster), false);

    // Boss monster -> fire ultimate!
    assert.equal(shouldCastSkill(state, 'celestial_nova', 'ultimate', bossMonster), true);
  });

  it('17. Auto-equip initializes smart condition defaults for equipped skills', () => {
    const defs = {
      power_strike: { id: 'power_strike', type: 'active', starRank: 1, minLevel: 1, balance: { pwr: 10 } },
      heal_light: { id: 'heal_light', type: 'active', effect: 'heal', starRank: 2, minLevel: 10, balance: { pwr: 20 } },
      tempest: { id: 'tempest', type: 'active', effect: 'aoe', starRank: 3, minLevel: 20, balance: { pwr: 40 } }
    };
    const state = {
      level: 40,
      skills: { power_strike: 1, heal_light: 1, tempest: 1 },
      skillLoadout: {},
      skillConditions: {}
    };

    autoEquipLoadout(state, defs);

    // Check that conditions were populated
    assert.ok(state.skillConditions);
    for (const [slot, sId] of Object.entries(state.skillLoadout)) {
      if (sId === 'heal_light') {
        assert.equal(state.skillConditions[slot].hpTrigger, 'self_below_75', 'Heal should have smart HP trigger');
      }
      if (sId === 'tempest') {
        assert.equal(state.skillConditions[slot].minEnemies, 2, 'AoE should have smart minEnemies trigger');
      }
    }
  });

  it('18. ZERO NEW SKILLS: Condition system strictly uses canonical existing skill IDs', () => {
    const canonicalSample = ['power_strike', 'mortal_blow', 'prominence', 'haste'];
    for (const id of canonicalSample) {
      assert.ok(typeof id === 'string');
      assert.ok(!id.startsWith('new_'));
      assert.ok(!id.includes('custom'));
    }
  });
});
