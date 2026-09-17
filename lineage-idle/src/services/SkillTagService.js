/**
 * SkillTagService.js — Game Data Contract 4.0: Skill Metadata Classification
 *
 * Tags are metadata classifications applied to EXISTING canonical skills.
 * NO new skills are created. Tags are derived deterministically from
 * existing fields in CanonicalSkillRegistryV2.
 *
 * ZERO NEW SKILLS RULE: This service only classifies — never invents.
 */

/**
 * Closed set of skill classification tags.
 * These are metadata labels, NOT new skill types.
 */
export const SKILL_TAGS = Object.freeze({
  CORE: 'CORE',
  SPECIAL: 'SPECIAL',
  SIGNATURE: 'SIGNATURE',
  ULTIMATE: 'ULTIMATE',
  PASSIVE: 'PASSIVE',
  BUFF: 'BUFF',
  TOGGLE: 'TOGGLE',
  UTILITY: 'UTILITY',
  CONTROL: 'CONTROL',
  AOE: 'AOE',
  BURST: 'BURST',
  SUSTAIN: 'SUSTAIN',
  BASIC: 'BASIC'
});

/**
 * Loadout slot categories — maps to the 7-slot loadout system.
 */
export const SLOT_CATEGORIES = Object.freeze({
  BASIC: 'basic',
  CORE: 'core',
  SPECIAL: 'special',
  SIGNATURE: 'signature',
  ULTIMATE: 'ultimate'
});

/**
 * Purged skill IDs that should never appear in loadout or classification.
 */
const PURGED_SKILL_IDS = new Set([
  'mount_golden_lion', 'dragon_slayer_appearance', 'detection',
  'mount_glorious_steed', 'mount_shining_lady', 'change_appearance',
  'mount_night_mare', 'mount_pegasus', 'mount_saber_toothed_cougar',
  'mount_black_bear', 'mount_kukuru', 'mount_griffin',
  'mount_elemental_lyn_draco', 'mount_unicorn',
  'white_guardian_transformation', 'transformation_pirate',
  'dark_assassin_transformation', 'light_assassin_transformation',
  'assassinS3_change_appearance', 'change_appearance_rose_vain',
  'adventurer_detection', 'warg_transformation'
]);

/**
 * Determines if a skill ID is purged (mount/appearance/cosmetic/transformation).
 * @param {string} skillId
 * @returns {boolean}
 */
export function isPurgedSkill(skillId) {
  if (!skillId) return true;
  const s = String(skillId).toLowerCase().trim();
  if (PURGED_SKILL_IDS.has(s)) return true;
  if (s.startsWith('mount_') || s.includes('appearance') || s.includes('transformation') || s === 'detection' || s.endsWith('_detection')) {
    return true;
  }
  return false;
}

/**
 * Derives classification tags from existing skill metadata.
 * Pure function — no side effects, no new skills created.
 *
 * @param {Object} skillDef — Skill definition from CanonicalSkillRegistryV2
 * @returns {Set<string>} — Set of SKILL_TAGS values
 */
export function getSkillTags(skillDef) {
  if (!skillDef) return new Set();
  const tags = new Set();
  const type = String(skillDef.type || skillDef.rawType || '').toLowerCase();
  const effect = String(skillDef.effect || skillDef.canonicalEffect || '').toLowerCase();
  const name = String(skillDef.name || skillDef.id || '').toLowerCase();
  const star = skillDef.starRank || 0;

  // Primary type classification
  if (type === 'passive' || type === 'stat') {
    tags.add(SKILL_TAGS.PASSIVE);
    return tags; // Passives get no other combat tags
  }
  if (type === 'buff' || type === 'harmony' || effect.includes('warcry')) {
    tags.add(SKILL_TAGS.BUFF);
  }
  if (type === 'toggle') {
    tags.add(SKILL_TAGS.TOGGLE);
  }

  // Combat role classification (from effect text and name)
  if (effect.includes('stun') || effect.includes('root') || effect.includes('sleep') ||
      effect.includes('silence') || effect.includes('hold') || effect.includes('paralyze') ||
      name.includes('stun') || name.includes('root') || name.includes('sleep')) {
    tags.add(SKILL_TAGS.CONTROL);
  }
  if (effect.includes('area') || effect.includes('aoe') || effect.includes('nearby') ||
      effect.includes('enemies in range') || effect.includes('surrounding') ||
      name.includes('storm') || name.includes('rain') || name.includes('whirlwind') ||
      name.includes('hurricane') || name.includes('nova') || name.includes('explosion')) {
    tags.add(SKILL_TAGS.AOE);
  }
  if (effect.includes('heal') || effect.includes('vampir') || effect.includes('drain') ||
      effect.includes('regenerat') || effect.includes('restore') ||
      type === 'heal' || name.includes('heal') || name.includes('curation')) {
    tags.add(SKILL_TAGS.SUSTAIN);
  }

  // Tier / slot classification (from starRank and minLevel)
  const slotCat = getSkillSlotCategory(skillDef);
  if (slotCat === SLOT_CATEGORIES.BASIC) tags.add(SKILL_TAGS.BASIC);
  else if (slotCat === SLOT_CATEGORIES.CORE) tags.add(SKILL_TAGS.CORE);
  else if (slotCat === SLOT_CATEGORIES.SPECIAL) tags.add(SKILL_TAGS.SPECIAL);
  else if (slotCat === SLOT_CATEGORIES.SIGNATURE) tags.add(SKILL_TAGS.SIGNATURE);
  else if (slotCat === SLOT_CATEGORIES.ULTIMATE) tags.add(SKILL_TAGS.ULTIMATE);

  // Default burst for non-classified active damage skills
  if (tags.size === 0 || (tags.size === 1 && (tags.has(SKILL_TAGS.CORE) || tags.has(SKILL_TAGS.SPECIAL)))) {
    if (type === 'active' || type === 'attack' || !tags.has(SKILL_TAGS.BUFF)) {
      tags.add(SKILL_TAGS.BURST);
    }
  }

  return tags;
}

/**
 * Determines the natural loadout slot category for a skill.
 * Based on starRank and minLevel — existing metadata only.
 *
 * @param {Object} skillDef — Skill definition from CanonicalSkillRegistryV2
 * @returns {string} — One of SLOT_CATEGORIES values
 */
export function getSkillSlotCategory(skillDef) {
  if (!skillDef) return SLOT_CATEGORIES.BASIC;

  const type = String(skillDef.type || '').toLowerCase();
  if (type === 'passive' || type === 'stat') return SLOT_CATEGORIES.BASIC; // won't be slotted anyway

  const star = skillDef.starRank || 0;
  const minLevel = skillDef.minLevel || skillDef.requiredLevel || 1;

  // 5★ skills at level 76+ → Ultimate
  if (star >= 5 && minLevel >= 76) return SLOT_CATEGORIES.ULTIMATE;
  // 5★ skills or stage 2+ skills → Signature
  if (star >= 5 || minLevel >= 58) return SLOT_CATEGORIES.SIGNATURE;
  // 4★ skills or level 40+ → Special
  if (star >= 4 || minLevel >= 40) return SLOT_CATEGORIES.SPECIAL;
  // 2-3★ or level 10+ → Core
  if (star >= 2 || minLevel >= 10) return SLOT_CATEGORIES.CORE;
  // 1★ or base level → Basic
  return SLOT_CATEGORIES.BASIC;
}

/**
 * Returns a human-readable label for a slot category.
 * @param {string} slotCategory
 * @returns {string}
 */
export function getSlotLabel(slotCategory) {
  const labels = {
    basic: 'Basic',
    core: 'Core',
    special: 'Special',
    signature: 'Signature',
    ultimate: 'Ultimate'
  };
  return labels[slotCategory] || 'Unknown';
}
