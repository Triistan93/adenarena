/**
 * SkillProgression.js — Game Data Contract 3.2.1 / Deploy 3.1
 * 
 * Formal architecture for character progression stages, skill lifecycles,
 * closed role taxonomy, and multi-stage skill availability.
 */

export const PROGRESSION_STAGES = Object.freeze({
  GENERALIST: 'GENERALIST',
  SPECIALIZATION: 'SPECIALIZATION',
  MASTERY: 'MASTERY',
  ULTIMATE: 'ULTIMATE',
  MASTER_ULTIMATE: 'MASTER_ULTIMATE'
});

export const STAGE_LEVEL_THRESHOLDS = Object.freeze({
  GENERALIST: 1,
  SPECIALIZATION: 40,
  MASTERY: 76,
  ULTIMATE: 80,
  MASTER_ULTIMATE: 90
});

export const STAGE_LEVELS = STAGE_LEVEL_THRESHOLDS;

/**
 * Deterministically computes the progression stage from character level.
 * @param {number} level
 * @returns {string}
 */
export function getProgressionStage(level) {
  const lvl = Number(level) || 1;
  if (lvl < 40) return PROGRESSION_STAGES.GENERALIST;
  if (lvl < 76) return PROGRESSION_STAGES.SPECIALIZATION;
  if (lvl < 80) return PROGRESSION_STAGES.MASTERY;
  if (lvl < 90) return PROGRESSION_STAGES.ULTIMATE;
  return PROGRESSION_STAGES.MASTER_ULTIMATE;
}

/**
 * Skill Lifecycle formal metadata.
 */
export const SKILL_LIFECYCLE = Object.freeze({
  INTRODUCED: 'INTRODUCED',
  INHERITED: 'INHERITED',
  UPGRADED: 'UPGRADED',
  EXCLUSIVE: 'EXCLUSIVE',
  RETIRED: 'RETIRED'
});

/**
 * Closed and immutable canonical role registry.
 */
export const ROLE_REGISTRY = Object.freeze([
  'burst_damage',
  'aoe_damage',
  'crowd_control',
  'defensive_shield',
  'finisher',
  'buff_support',
  'mobility',
  'sustain_heal',
  'debuff_hex',
  'dot'
]);

/**
 * Normalizes any free-text or legacy role string into the closed canonical taxonomy.
 * @param {string} rawRole
 * @returns {string}
 */
export function normalizeRole(rawRole) {
  if (!rawRole || typeof rawRole !== 'string') return 'burst_damage';
  const clean = rawRole.toLowerCase().trim();

  if (clean.includes('area') || clean.includes('aoe')) return 'aoe_damage';
  if (clean.includes('burst')) return 'burst_damage';
  if (clean.includes('crowd') || clean.includes('control') || clean.includes('stun')) return 'crowd_control';
  if (clean.includes('defensive') || clean.includes('shield') || clean.includes('tank')) return 'defensive_shield';
  if (clean.includes('finisher') || clean.includes('execution')) return 'finisher';
  if (clean.includes('buff') || clean.includes('support') || clean.includes('chant')) return 'buff_support';
  if (clean.includes('mobility') || clean.includes('engage') || clean.includes('dash')) return 'mobility';
  if (clean.includes('sustain') || clean.includes('heal') || clean.includes('drain')) return 'sustain_heal';
  if (clean.includes('debuff') || clean.includes('hex') || clean.includes('curse')) return 'debuff_hex';
  if (clean.includes('dot') || clean.includes('poison') || clean.includes('bleed') || clean.includes('burn')) return 'dot';

  // Direct match in registry
  if (ROLE_REGISTRY.includes(clean)) return clean;
  return 'burst_damage';
}

/**
 * Checks if a skill is native (created by) a class.
 * @param {object} skillDef
 * @param {string} classId
 * @returns {boolean}
 */
export function isSkillNativeToClass(skillDef, classId) {
  if (!skillDef || !classId) return false;
  if (Array.isArray(skillDef.nativeClasses)) {
    return skillDef.nativeClasses.includes(classId);
  }
  return skillDef.classId === classId;
}

/**
 * Checks if a skill is available to a class at a given level.
 * @param {object} skillDef
 * @param {string} classId
 * @param {number} level
 * @returns {boolean}
 */
export function isSkillAvailableToClass(skillDef, classId, level = 80) {
  if (!skillDef || !classId) return false;

  // 1. Level Requirement
  const reqLvl = Number(skillDef.requiredLevel) || 1;
  if (level < reqLvl) return false;

  // 2. Direct Availability Check
  if (Array.isArray(skillDef.availableTo)) {
    return skillDef.availableTo.includes(classId);
  }

  // 3. Fallback to native ownership if availableTo not explicitly populated
  return isSkillNativeToClass(skillDef, classId);
}

/**
 * Checks if a skill is inherited by a class.
 * @param {object} skillDef
 * @param {string} classId
 * @returns {boolean}
 */
export function isSkillInheritedBy(skillDef, classId) {
  if (!skillDef || !classId) return false;
  if (Array.isArray(skillDef.inheritedBy)) {
    return skillDef.inheritedBy.includes(classId);
  }
  return false;
}

/**
 * Validates a skill's progression lifecycle metadata.
 * @param {object} skillDef
 * @returns {{valid: boolean, error?: string}}
 */
export function validateSkillLifecycle(skillDef) {
  if (!skillDef) return { valid: false, error: 'Skill definition is required' };
  const stage = skillDef.progressionStage;
  if (stage && !PROGRESSION_STAGES[stage]) {
    return { valid: false, error: `Invalid progressionStage: ${stage}` };
  }
  return { valid: true };
}

