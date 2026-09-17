/**
 * SkillConditionService.js — Game Data Contract 4.1: Intelligent Auto-Battle Conditions
 *
 * Provides condition evaluation for auto-battle skill execution.
 * Allows skills to be cast conditionally based on:
 * - Player HP % (e.g. Heal when HP < 60%, Panic defense when HP < 30%)
 * - Target HP % (e.g. Execute/finisher when Enemy HP < 30%)
 * - Enemy Count (e.g. AoE attacks only when fighting 2+ or 3+ monsters)
 * - Boss Target (e.g. Save ultimate/burst for Bosses/Raids, or use only on minions)
 * - Target Status (e.g. Target is Stunned, Target is Bleeding)
 *
 * ZERO NEW SKILLS RULE: Evaluates existing skills only — alters no base damage or formulas.
 */

import { getSkillTags, SKILL_TAGS } from './SkillTagService.js';

/**
 * Standard condition presets/defaults
 */
export const DEFAULT_CONDITION = Object.freeze({
  hpTrigger: 'none',     // 'none' | 'self_below_75' | 'self_below_50' | 'self_below_30' | 'target_below_30'
  bossTarget: 'any',     // 'any' | 'boss_only' | 'normal_only'
  minEnemies: 1,         // 1 | 2 | 3
  statusReq: 'any'       // 'any' | 'stunned' | 'bleeding'
});

/**
 * Evaluates whether a monster is a Boss or Elite.
 * @param {Object} monster
 * @param {Object} [state]
 * @returns {boolean}
 */
export function isBossOrElite(monster, state = null) {
  if (!monster) return false;
  return Boolean(
    monster.boss ||
    monster.isBoss ||
    monster.isRaid ||
    monster.isTower ||
    monster.isChaosBoss ||
    monster.isElite ||
    monster.champion ||
    state?.isRaidActive ||
    state?.towerCombatActive
  );
}

/**
 * Extracts normalized combat context for condition checking.
 * @param {Object} state
 * @param {Object} monster
 * @returns {Object}
 */
export function getCombatContext(state, monster) {
  const maxHp = Math.max(1, state.maxHp || state.stats?.maxHp || 100);
  const curHp = Math.max(0, state.hp ?? maxHp);
  const playerHpPct = Math.round((curHp / maxHp) * 100);

  const monMaxHp = Math.max(1, monster?._maxHp || monster?.maxHp || monster?.hp || 100);
  const monHp = Math.max(0, monster?.hp ?? monMaxHp);
  const targetHpPct = Math.round((monHp / monMaxHp) * 100);

  const enemyCount = Array.isArray(state.activeMonsters)
    ? state.activeMonsters.filter(m => m && m.hp > 0).length
    : (state.nearbyEnemies || (monster && monster.hp > 0 ? 1 : 0));

  const isStunned = Boolean(monster?._stunnedUntil && monster._stunnedUntil > Date.now());
  const isBleeding = Boolean(monster?._bleedTicks && monster._bleedTicks > 0);

  return {
    playerHpPct,
    targetHpPct,
    isBoss: isBossOrElite(monster, state),
    enemyCount: Math.max(1, enemyCount),
    isStunned,
    isBleeding
  };
}

/**
 * Checks if a specific condition is satisfied by the combat context.
 * @param {Object} condition
 * @param {Object} context
 * @returns {boolean}
 */
export function evaluateCondition(condition, context) {
  if (!condition) return true;

  // 1. Boss Target filter
  if (condition.bossTarget === 'boss_only' && !context.isBoss) {
    return false;
  }
  if (condition.bossTarget === 'normal_only' && context.isBoss) {
    return false;
  }

  // 2. Minimum Enemies filter (AoE tactics)
  const minEnemies = Number(condition.minEnemies) || 1;
  if (minEnemies > 1 && context.enemyCount < minEnemies) {
    return false;
  }

  // 3. HP Trigger filter
  switch (condition.hpTrigger) {
    case 'self_below_75':
      if (context.playerHpPct >= 75) return false;
      break;
    case 'self_below_50':
      if (context.playerHpPct >= 50) return false;
      break;
    case 'self_below_30':
      if (context.playerHpPct >= 30) return false;
      break;
    case 'target_below_30':
      if (context.targetHpPct >= 30) return false;
      break;
    case 'target_below_50':
      if (context.targetHpPct >= 50) return false;
      break;
    default:
      break;
  }

  // 4. Target Status filter
  if (condition.statusReq === 'stunned' && !context.isStunned) {
    return false;
  }
  if (condition.statusReq === 'bleeding' && !context.isBleeding) {
    return false;
  }

  return true;
}

/**
 * Retrieves the stored condition for a slot or skillId.
 * @param {Object} state
 * @param {string} slotOrSkillId
 * @returns {Object}
 */
export function getSkillCondition(state, slotOrSkillId) {
  if (!state.skillConditions) {
    state.skillConditions = {};
  }
  return state.skillConditions[slotOrSkillId] || { ...DEFAULT_CONDITION };
}

/**
 * Sets or updates a condition for a given slot or skillId.
 * @param {Object} state
 * @param {string} slotOrSkillId
 * @param {Object} condition
 */
export function setSkillCondition(state, slotOrSkillId, condition) {
  if (!state.skillConditions) {
    state.skillConditions = {};
  }
  state.skillConditions[slotOrSkillId] = {
    ...DEFAULT_CONDITION,
    ...state.skillConditions[slotOrSkillId],
    ...condition
  };
}

/**
 * Resets condition to default for a slot or skillId.
 * @param {Object} state
 * @param {string} slotOrSkillId
 */
export function clearSkillCondition(state, slotOrSkillId) {
  if (state.skillConditions) {
    delete state.skillConditions[slotOrSkillId];
  }
}

/**
 * Computes recommended smart condition defaults based on skill metadata.
 * E.g. Heals default to HP < 75%, executes default to Enemy HP < 30%.
 * @param {Object} skillDef
 * @returns {Object}
 */
export function getSmartConditionDefaults(skillDef) {
  if (!skillDef) return { ...DEFAULT_CONDITION };

  const tags = getSkillTags(skillDef);
  const cond = { ...DEFAULT_CONDITION };

  if (tags.has(SKILL_TAGS.SUSTAIN) || skillDef.effect === 'heal' || skillDef.id?.includes('heal')) {
    cond.hpTrigger = 'self_below_75';
  } else if (tags.has(SKILL_TAGS.AOE)) {
    cond.minEnemies = 2;
  } else if (skillDef.effect === 'finisher' || skillDef.id?.includes('execute') || skillDef.id?.includes('fatal')) {
    cond.hpTrigger = 'target_below_30';
  }

  return cond;
}

/**
 * Master check used inside the combat auto-battle loop:
 * Evaluates whether an equipped skill should cast this tick based on its condition.
 * @param {Object} state
 * @param {string} skillId
 * @param {string} [slotName]
 * @param {Object} monster
 * @returns {boolean}
 */
export function shouldCastSkill(state, skillId, slotName, monster) {
  if (!state || !skillId || !monster) return true;

  // Retrieve condition by slot name first, then fallback to skillId
  const cond = (slotName && state.skillConditions?.[slotName]) ||
               state.skillConditions?.[skillId];

  // If no custom condition configured, skill is free to cast
  if (!cond) return true;

  const context = getCombatContext(state, monster);
  return evaluateCondition(cond, context);
}

/**
 * Returns human-readable badges/labels for a condition.
 * @param {Object} condition
 * @returns {string|null}
 */
export function getConditionBadgeText(condition) {
  if (!condition) return null;
  const parts = [];

  if (condition.bossTarget === 'boss_only') parts.push('👑 Boss');
  else if (condition.bossTarget === 'normal_only') parts.push('🐺 Mobs');

  if (condition.minEnemies >= 2) parts.push(`👥 ${condition.minEnemies}+`);

  if (condition.hpTrigger === 'self_below_75') parts.push('HP<75%');
  else if (condition.hpTrigger === 'self_below_50') parts.push('HP<50%');
  else if (condition.hpTrigger === 'self_below_30') parts.push('HP<30%');
  else if (condition.hpTrigger === 'target_below_30') parts.push('Foe<30%');
  else if (condition.hpTrigger === 'target_below_50') parts.push('Foe<50%');

  if (condition.statusReq === 'stunned') parts.push('💫 Stun');
  else if (condition.statusReq === 'bleeding') parts.push('🩸 Bleed');

  return parts.length > 0 ? parts.join(' · ') : null;
}
