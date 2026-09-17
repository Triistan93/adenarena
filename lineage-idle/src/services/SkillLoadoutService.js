/**
 * SkillLoadoutService.js — Game Data Contract 4.0: Skill Loadout Management
 *
 * Central service for the 7-slot skill loadout system.
 * Manages equipping, unequipping, auto-fill, and validation.
 *
 * ZERO NEW SKILLS RULE: This service only organizes existing canonical skills
 * into slots — it never creates, invents, or synthesizes new skills.
 *
 * Loadout Schema:
 * state.skillLoadout = {
 *   basic: string|null,     // skill ID
 *   core1: string|null,
 *   core2: string|null,
 *   special1: string|null,
 *   special2: string|null,
 *   signature: string|null,
 *   ultimate: string|null
 * }
 */

import { getSkillSlotCategory, isPurgedSkill, SLOT_CATEGORIES } from './SkillTagService.js';
import { ALL_SLOT_NAMES, getUnlockedSlots, SLOT_PRIORITY_ORDER } from '../data/balance/SkillUnlockSchedule.js';

/**
 * Default empty loadout — all slots null.
 */
export const EMPTY_LOADOUT = Object.freeze({
  basic: null,
  core1: null,
  core2: null,
  special1: null,
  special2: null,
  signature: null,
  ultimate: null
});

/**
 * Maps slot categories to their available slot names.
 * Some categories have 2 slots (core, special), others have 1.
 */
const CATEGORY_SLOT_MAP = {
  basic: ['basic'],
  core: ['core1', 'core2'],
  special: ['special1', 'special2'],
  signature: ['signature'],
  ultimate: ['ultimate']
};

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Returns the current loadout from state, creating it if missing.
 * @param {Object} state — Game state
 * @returns {Object} — The skillLoadout object (reference into state)
 */
export function getLoadout(state) {
  if (!state.skillLoadout) {
    state.skillLoadout = { ...EMPTY_LOADOUT };
  }
  return state.skillLoadout;
}

/**
 * Returns an array of all equipped skill IDs (non-null slots).
 * @param {Object} state
 * @returns {string[]}
 */
export function getEquippedSkillIds(state) {
  const loadout = getLoadout(state);
  return ALL_SLOT_NAMES
    .map(slot => loadout[slot])
    .filter(id => id != null);
}

/**
 * Checks if a specific skill is currently equipped in any slot.
 * @param {Object} state
 * @param {string} skillId
 * @returns {boolean}
 */
export function isSkillEquipped(state, skillId) {
  if (!skillId) return false;
  const loadout = getLoadout(state);
  return ALL_SLOT_NAMES.some(slot => loadout[slot] === skillId);
}

/**
 * Returns the slot name where a skill is equipped, or null.
 * @param {Object} state
 * @param {string} skillId
 * @returns {string|null}
 */
export function getSkillSlot(state, skillId) {
  if (!skillId) return null;
  const loadout = getLoadout(state);
  for (const slot of ALL_SLOT_NAMES) {
    if (loadout[slot] === skillId) return slot;
  }
  return null;
}

/**
 * Equips a skill into a specific loadout slot.
 *
 * Validates:
 * - Skill must be learned (state.skills[skillId] > 0)
 * - Skill must not be passive (passives are always active, not slotted)
 * - Skill must not be purged (mount/appearance)
 * - Slot must be unlocked for the character's level
 * - If skill is already in another slot, it's moved (swap)
 *
 * @param {Object} state — Mutable game state
 * @param {string} slotName — Target slot name (e.g., 'core1', 'signature')
 * @param {string} skillId — Canonical skill ID to equip
 * @param {Object} [skillDefs] — Skill definitions lookup (SKILL_DEFS or CANONICAL_SKILL_REGISTRY_V2)
 * @returns {{ success: boolean, error?: string }}
 */
export function equipSkill(state, slotName, skillId, skillDefs) {
  const loadout = getLoadout(state);

  // Validate slot name
  if (!ALL_SLOT_NAMES.includes(slotName)) {
    return { success: false, error: `Invalid slot: ${slotName}` };
  }

  // Validate slot is unlocked
  const unlockedSlots = getUnlockedSlots(state.level || 1);
  if (!unlockedSlots.includes(slotName)) {
    return { success: false, error: `Slot "${slotName}" is locked at level ${state.level}` };
  }

  // Validate skill is learned
  if (!state.skills || !state.skills[skillId] || state.skills[skillId] <= 0) {
    return { success: false, error: `Skill "${skillId}" is not learned` };
  }

  // Validate skill is not purged
  if (isPurgedSkill(skillId)) {
    return { success: false, error: `Skill "${skillId}" is purged (mount/appearance)` };
  }

  // Validate skill is not passive
  const def = skillDefs ? (skillDefs[skillId] || (typeof skillDefs === 'function' ? skillDefs(skillId) : null)) : null;
  if (def) {
    const type = String(def.type || '').toLowerCase();
    if (type === 'passive' || type === 'stat') {
      return { success: false, error: `Passive skills cannot be equipped in loadout slots` };
    }
  }

  // If skill is already in another slot, remove it from there (move)
  for (const slot of ALL_SLOT_NAMES) {
    if (loadout[slot] === skillId && slot !== slotName) {
      loadout[slot] = null;
      break;
    }
  }

  // Equip
  loadout[slotName] = skillId;
  return { success: true };
}

/**
 * Removes a skill from a specific loadout slot.
 * @param {Object} state — Mutable game state
 * @param {string} slotName — Slot to clear
 */
export function unequipSkill(state, slotName) {
  const loadout = getLoadout(state);
  if (ALL_SLOT_NAMES.includes(slotName)) {
    loadout[slotName] = null;
  }
}

/**
 * Unequips a skill by ID (finds its slot and clears it).
 * @param {Object} state
 * @param {string} skillId
 */
export function unequipSkillById(state, skillId) {
  const slot = getSkillSlot(state, skillId);
  if (slot) {
    unequipSkill(state, slot);
  }
}

/**
 * Auto-equips the best learned skills into unlocked loadout slots.
 * Called on:
 *   - New character creation
 *   - Save migration (v2 → v3)
 *   - Class transfer (re-equip with new class skills)
 *
 * Algorithm:
 *   1. Collect all learned non-passive non-purged skills
 *   2. Classify each by slot category using SkillTagService
 *   3. Sort within each category by starRank (desc), then minLevel (desc)
 *   4. Fill unlocked slots in priority order
 *
 * @param {Object} state — Mutable game state
 * @param {Object} skillDefs — Skill definitions lookup (keyed by skill ID)
 * @param {Function} [classFilter] — Optional (classId, skillId) => boolean filter
 */
export function autoEquipLoadout(state, skillDefs, classFilter) {
  const loadout = getLoadout(state);
  const unlockedSlots = getUnlockedSlots(state.level || 1);

  // Clear all slots first
  for (const slot of ALL_SLOT_NAMES) {
    loadout[slot] = null;
  }

  // 1. Collect eligible skills
  const candidates = [];
  if (!state.skills || !skillDefs) return;

  for (const [skillId, lvl] of Object.entries(state.skills)) {
    if (lvl <= 0) continue;
    if (isPurgedSkill(skillId)) continue;

    const def = skillDefs[skillId];
    if (!def) continue;

    const type = String(def.type || '').toLowerCase();
    if (type === 'passive' || type === 'stat') continue;

    // Optional class filter
    if (classFilter && !classFilter(state.class, skillId)) continue;

    const category = getSkillSlotCategory(def);
    const star = def.starRank || 0;
    const minLevel = def.minLevel || 1;
    const pwr = def.balance?.pwr || 0;

    candidates.push({ skillId, def, category, star, minLevel, pwr });
  }

  // 2. Sort by quality: starRank desc, then pwr desc, then minLevel desc
  candidates.sort((a, b) => {
    if (b.star !== a.star) return b.star - a.star;
    if (b.pwr !== a.pwr) return b.pwr - a.pwr;
    return b.minLevel - a.minLevel;
  });

  // 3. Fill slots by category
  const usedSkills = new Set();

  // Helper: try to fill a slot from candidates of a given category
  const fillSlot = (slotName, preferredCategories) => {
    if (!unlockedSlots.includes(slotName)) return;
    if (loadout[slotName]) return;

    // First pass: try preferred categories
    for (const cat of preferredCategories) {
      for (const c of candidates) {
        if (usedSkills.has(c.skillId)) continue;
        if (c.category === cat) {
          loadout[slotName] = c.skillId;
          usedSkills.add(c.skillId);
          return;
        }
      }
    }

    // Second pass: any remaining non-passive skill
    for (const c of candidates) {
      if (usedSkills.has(c.skillId)) continue;
      loadout[slotName] = c.skillId;
      usedSkills.add(c.skillId);
      return;
    }
  };

  // Fill in priority order: ultimates first (most valuable), basics last
  fillSlot('ultimate', [SLOT_CATEGORIES.ULTIMATE]);
  fillSlot('signature', [SLOT_CATEGORIES.SIGNATURE, SLOT_CATEGORIES.ULTIMATE]);
  fillSlot('special1', [SLOT_CATEGORIES.SPECIAL, SLOT_CATEGORIES.SIGNATURE]);
  fillSlot('special2', [SLOT_CATEGORIES.SPECIAL, SLOT_CATEGORIES.CORE]);
  fillSlot('core1', [SLOT_CATEGORIES.CORE]);
  fillSlot('core2', [SLOT_CATEGORIES.CORE, SLOT_CATEGORIES.BASIC]);
  fillSlot('basic', [SLOT_CATEGORIES.BASIC, SLOT_CATEGORIES.CORE]);
}

/**
 * Validates the current loadout for integrity.
 *
 * Checks:
 * - All equipped skills exist in state.skills with lvl > 0
 * - No purged skills are equipped
 * - No passive skills are equipped
 * - No skill appears in multiple slots
 * - Locked slots are empty
 *
 * @param {Object} state
 * @param {Object} [skillDefs] — Optional skill definitions lookup
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateLoadout(state, skillDefs) {
  const loadout = getLoadout(state);
  const errors = [];
  const unlockedSlots = getUnlockedSlots(state.level || 1);
  const seenSkills = new Set();

  for (const slot of ALL_SLOT_NAMES) {
    const skillId = loadout[slot];
    if (!skillId) continue;

    // Check locked slots are empty
    if (!unlockedSlots.includes(slot)) {
      errors.push(`Slot "${slot}" is locked but has skill "${skillId}"`);
    }

    // Check skill is learned
    if (!state.skills || !state.skills[skillId] || state.skills[skillId] <= 0) {
      errors.push(`Skill "${skillId}" in slot "${slot}" is not learned`);
    }

    // Check not purged
    if (isPurgedSkill(skillId)) {
      errors.push(`Purged skill "${skillId}" in slot "${slot}"`);
    }

    // Check not passive
    if (skillDefs) {
      const def = skillDefs[skillId];
      if (def) {
        const type = String(def.type || '').toLowerCase();
        if (type === 'passive' || type === 'stat') {
          errors.push(`Passive skill "${skillId}" in slot "${slot}"`);
        }
      }
    }

    // Check no duplicates
    if (seenSkills.has(skillId)) {
      errors.push(`Skill "${skillId}" appears in multiple slots`);
    }
    seenSkills.add(skillId);
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Cleans up the loadout after class transfer.
 * Removes skills that no longer belong to the new class.
 *
 * @param {Object} state
 * @param {Function} isSkillAllowed — (classId, skillId) => boolean
 * @param {Object} skillDefs — Skill definitions lookup
 */
export function cleanLoadoutForClassChange(state, isSkillAllowed, skillDefs) {
  const loadout = getLoadout(state);

  for (const slot of ALL_SLOT_NAMES) {
    const skillId = loadout[slot];
    if (!skillId) continue;
    if (!isSkillAllowed(state.class, skillId)) {
      loadout[slot] = null;
    }
  }

  // Auto-fill empty slots with new class skills
  autoEquipLoadout(state, skillDefs, isSkillAllowed);
}

/**
 * Returns the loadout as an ordered array for combat iteration.
 * Follows SLOT_PRIORITY_ORDER (ultimate → basic).
 *
 * @param {Object} state
 * @returns {Array<{slot: string, skillId: string}>}
 */
export function getLoadoutForCombat(state) {
  const loadout = getLoadout(state);
  const result = [];
  for (const slot of SLOT_PRIORITY_ORDER) {
    const skillId = loadout[slot];
    if (skillId) {
      result.push({ slot, skillId });
    }
  }
  return result;
}
