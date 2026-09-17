/**
 * SkillUnlockSchedule.js — Game Data Contract 4.0: Progressive Slot Unlock
 *
 * Defines which loadout slots are available at each character level.
 * Uses global level thresholds aligned with class transfer milestones.
 *
 * Slot unlock progression:
 *   Lv  1 → basic, core1                    (2 slots)
 *   Lv 10 → + core2                         (3 slots)
 *   Lv 20 → + special1  (1st class transfer) (4 slots)
 *   Lv 30 → + special2                      (5 slots)
 *   Lv 40 → + signature (2nd class transfer) (6 slots)
 *   Lv 76 → + ultimate  (3rd class transfer) (7 slots — full loadout)
 */

/**
 * All possible loadout slot names in priority order (highest first for combat).
 */
export const ALL_SLOT_NAMES = Object.freeze([
  'basic', 'core1', 'core2', 'special1', 'special2', 'signature', 'ultimate'
]);

/**
 * Combat execution priority order: strongest skills attempted first.
 * The auto-battle loop iterates in this order.
 */
export const SLOT_PRIORITY_ORDER = Object.freeze([
  'ultimate', 'signature', 'special1', 'special2', 'core1', 'core2', 'basic'
]);

/**
 * Progressive unlock schedule: each entry defines the level threshold
 * and the cumulative set of slots available at that level.
 * Sorted ascending by level.
 */
export const UNLOCK_SCHEDULE = Object.freeze([
  { level: 1,  slots: Object.freeze(['basic', 'core1']),                                                                label: 'Novice' },
  { level: 10, slots: Object.freeze(['basic', 'core1', 'core2']),                                                       label: 'Apprentice' },
  { level: 20, slots: Object.freeze(['basic', 'core1', 'core2', 'special1']),                                            label: '1st Class Transfer' },
  { level: 30, slots: Object.freeze(['basic', 'core1', 'core2', 'special1', 'special2']),                                label: 'Specialist' },
  { level: 40, slots: Object.freeze(['basic', 'core1', 'core2', 'special1', 'special2', 'signature']),                   label: '2nd Class Transfer' },
  { level: 76, slots: Object.freeze(['basic', 'core1', 'core2', 'special1', 'special2', 'signature', 'ultimate']),       label: '3rd Class Transfer' }
]);

/**
 * Returns the set of unlocked slot names for a given character level.
 * @param {number} level — Character level (1-85+)
 * @returns {string[]} — Array of unlocked slot names
 */
export function getUnlockedSlots(level) {
  const lvl = Number(level) || 1;
  let result = UNLOCK_SCHEDULE[0].slots;
  for (const entry of UNLOCK_SCHEDULE) {
    if (lvl >= entry.level) {
      result = entry.slots;
    } else {
      break;
    }
  }
  return [...result]; // Return mutable copy
}

/**
 * Returns the total number of unlocked slots for a given level.
 * @param {number} level
 * @returns {number}
 */
export function getUnlockedSlotCount(level) {
  return getUnlockedSlots(level).length;
}

/**
 * Checks whether a specific slot is unlocked at a given level.
 * @param {string} slotName — One of ALL_SLOT_NAMES
 * @param {number} level — Character level
 * @returns {boolean}
 */
export function isSlotUnlocked(slotName, level) {
  return getUnlockedSlots(level).includes(slotName);
}

/**
 * Returns the level required to unlock a specific slot.
 * @param {string} slotName — One of ALL_SLOT_NAMES
 * @returns {number} — Level threshold, or Infinity if slot doesn't exist
 */
export function getSlotUnlockLevel(slotName) {
  for (const entry of UNLOCK_SCHEDULE) {
    if (entry.slots.includes(slotName)) {
      return entry.level;
    }
  }
  return Infinity;
}

/**
 * Returns the unlock schedule label for the current level.
 * @param {number} level
 * @returns {string}
 */
export function getProgressionLabel(level) {
  const lvl = Number(level) || 1;
  let label = UNLOCK_SCHEDULE[0].label;
  for (const entry of UNLOCK_SCHEDULE) {
    if (lvl >= entry.level) {
      label = entry.label;
    } else {
      break;
    }
  }
  return label;
}
