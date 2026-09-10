/**
 * equipmentBalance.js — Equipment Ecosystem, Slot Power Budgets & Canonical Loadouts
 *
 * Defines target power budgets per equipment slot, grade power expectations,
 * canonical loadout definitions, and validation helpers for the
 * Master Game Balance — Phase 4 audit.
 */

// 1. SLOT POWER BUDGET — Target relative power contribution per slot
// Weapon is the reference (1.00). Other slots are proportional.
export const SLOT_POWER_BUDGET = Object.freeze({
  weapon: 1.00,
  armor: 0.70,    // Chest armor
  legs: 0.50,
  helmet: 0.35,
  gloves: 0.35,
  boots: 0.35,
  shield: 0.40,
  sigil: 0.30,
  necklace: 0.30,
  earring: 0.25,
  ring: 0.20,
  belt: 0.25,
  cloak: 0.25,
  hair: 0.15,
  agathion: 0.20,
});

// 2. SLOT POWER RATIO THRESHOLDS (Section 56)
export const SLOT_POWER_THRESHOLDS = Object.freeze({
  PASS_MIN: 0.85,
  PASS_MAX: 1.15,
  REVIEW_MIN: 0.70,
  REVIEW_MAX: 1.50,
  // Below REVIEW_MIN or above REVIEW_MAX → FAIL
});

// 3. GRADE DEFINITIONS
export const GRADES = Object.freeze([
  { id: 1, name: 'No-Grade', label: 'NG', levelRange: [1, 19] },
  { id: 2, name: 'D-Grade', label: 'D', levelRange: [20, 39] },
  { id: 3, name: 'C-Grade', label: 'C', levelRange: [40, 51] },
  { id: 4, name: 'B-Grade', label: 'B', levelRange: [52, 61] },
  { id: 5, name: 'A-Grade', label: 'A', levelRange: [62, 75] },
  { id: 6, name: 'S-Grade', label: 'S', levelRange: [76, 100] },
]);

// 4. GRADE POWER RATIO THRESHOLDS (Section 68)
export const GRADE_POWER_THRESHOLDS = Object.freeze({
  PASS_MIN: 1.00,
  REVIEW_MAX: 1.50,
  FAIL_MAX: 2.00,
});

// 5. ENCHANT CONFIGURATION
export const ENCHANT_CONFIG = Object.freeze({
  MAX_ENCHANT: 16,
  SPIKE_REVIEW_MULT: 2.0,  // MG > 2× median → REVIEW
  SPIKE_FAIL_MULT: 3.0,    // MG > 3× median → FAIL
});

/**
 * Calculates the stat multiplier for a given enchant level.
 * Fix applied: +4 (2.40×) > +3 (1.90×) — corrects the 0.36 typo.
 * @param {number} enchant — Enchant level (0–16)
 * @returns {number} Stat multiplier
 */
export function getEnchantMultiplier(enchant) {
  const e = Math.max(0, Math.min(16, Math.floor(Number(enchant) || 0)));
  if (e === 0) return 1.0;
  if (e <= 3) return 1 + e * 0.30; // +1=1.30, +2=1.60, +3=1.90
  return 1 + 0.90 + (e - 3) * 0.50; // +4=2.40, +5=2.90, ..., +16=8.40
}

/**
 * Calculates marginal gain between enchant levels.
 * @param {number} enchantN — Current enchant level
 * @returns {{ statMult: number, prevMult: number, marginalGain: number }}
 */
export function getEnchantMarginalGain(enchantN) {
  const current = getEnchantMultiplier(enchantN);
  const prev = enchantN > 0 ? getEnchantMultiplier(enchantN - 1) : 1.0;
  const marginalGain = prev > 0 ? (current / prev) - 1 : 0;
  return { statMult: current, prevMult: prev, marginalGain };
}

/**
 * Validates the full enchant progression curve for spikes.
 * @returns {{ curve: Array, medianMG: number, spikes: Array, fails: Array, isMonotonic: boolean }}
 */
export function validateEnchantProgression() {
  const curve = [];
  const marginalGains = [];

  for (let e = 0; e <= ENCHANT_CONFIG.MAX_ENCHANT; e++) {
    const data = getEnchantMarginalGain(e);
    curve.push({ enchant: e, ...data });
    if (e > 0) marginalGains.push(data.marginalGain);
  }

  // Median marginal gain
  const sorted = [...marginalGains].sort((a, b) => a - b);
  const n = sorted.length;
  const medianMG = n % 2 === 1 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;

  const spikes = [];
  const fails = [];
  let isMonotonic = true;

  for (let i = 1; i < curve.length; i++) {
    if (curve[i].statMult < curve[i - 1].statMult) {
      isMonotonic = false;
    }
    const mg = curve[i].marginalGain;
    if (mg > ENCHANT_CONFIG.SPIKE_FAIL_MULT * medianMG) {
      fails.push({ enchant: i, mg, threshold: ENCHANT_CONFIG.SPIKE_FAIL_MULT * medianMG });
    } else if (mg > ENCHANT_CONFIG.SPIKE_REVIEW_MULT * medianMG) {
      spikes.push({ enchant: i, mg, threshold: ENCHANT_CONFIG.SPIKE_REVIEW_MULT * medianMG });
    }
  }

  return { curve, medianMG, spikes, fails, isMonotonic };
}

// 6. CANONICAL LOADOUT DEFINITIONS
export const CANONICAL_LOADOUTS = Object.freeze({
  STARTER: {
    id: 'STARTER',
    name: 'Starter',
    level: 1,
    grade: 1,
    desc: 'Starting equipment, No-Grade',
    expectedCP: [800, 1500],
    enchant: 0,
  },
  EARLY: {
    id: 'EARLY',
    name: 'Early',
    level: 20,
    grade: 2,
    desc: 'D-Grade equipment, 1st class transfer',
    expectedCP: [3500, 5000],
    enchant: 0,
  },
  MID: {
    id: 'MID',
    name: 'Mid',
    level: 40,
    grade: 3,
    desc: 'C-Grade equipment, 2nd class transfer',
    expectedCP: [8000, 14000],
    enchant: 3,
  },
  LATE: {
    id: 'LATE',
    name: 'Late',
    level: 61,
    grade: 4,
    desc: 'B/A-Grade equipment',
    expectedCP: [30000, 50000],
    enchant: 6,
  },
  ENDGAME: {
    id: 'ENDGAME',
    name: 'Endgame',
    level: 76,
    grade: 5,
    desc: 'S-Grade equipment, 3rd class transfer',
    expectedCP: [80000, 130000],
    enchant: 10,
  },
  OPTIMIZED: {
    id: 'OPTIMIZED',
    name: 'Optimized',
    level: 85,
    grade: 6,
    desc: 'S-Grade +10 with SA, Augmentation, Epic Jewels',
    expectedCP: [150000, 250000],
    enchant: 12,
  },
});

/**
 * Validates that loadout progression is strictly monotonic in CP.
 * @param {Object} loadoutCPs — { STARTER: cp, EARLY: cp, MID: cp, ... }
 * @returns {{ isMonotonic: boolean, violations: Array }}
 */
export function validateLoadoutMonotonicity(loadoutCPs) {
  const order = ['STARTER', 'EARLY', 'MID', 'LATE', 'ENDGAME', 'OPTIMIZED'];
  const violations = [];
  let isMonotonic = true;

  for (let i = 1; i < order.length; i++) {
    const prev = loadoutCPs[order[i - 1]];
    const curr = loadoutCPs[order[i]];
    if (prev !== undefined && curr !== undefined && curr <= prev) {
      isMonotonic = false;
      violations.push({
        from: order[i - 1],
        to: order[i],
        fromCP: prev,
        toCP: curr,
        issue: `${order[i]} CP (${curr}) <= ${order[i - 1]} CP (${prev})`
      });
    }
  }

  return { isMonotonic, violations };
}

// 7. SLOT POWER RATIO CALCULATION
/**
 * Calculates the Slot Power Ratio for a given slot.
 * SPR = Median(SlotRealPower) / TargetSlotPower
 * @param {number} medianSlotRealPower — Observed median real power for this slot
 * @param {string} slot — Slot name
 * @returns {{ spr: number, status: string }}
 */
export function calculateSlotPowerRatio(medianSlotRealPower, slot) {
  const target = SLOT_POWER_BUDGET[slot];
  if (!target || target <= 0) return { spr: 0, status: 'UNKNOWN_SLOT' };
  const spr = medianSlotRealPower / target;
  let status = 'PASS';
  if (spr < SLOT_POWER_THRESHOLDS.REVIEW_MIN || spr > SLOT_POWER_THRESHOLDS.REVIEW_MAX) {
    status = 'FAIL';
  } else if (spr < SLOT_POWER_THRESHOLDS.PASS_MIN || spr > SLOT_POWER_THRESHOLDS.PASS_MAX) {
    status = 'REVIEW';
  }
  return { spr: Math.round(spr * 100) / 100, status };
}

// 8. GRADE POWER RATIO CALCULATION
/**
 * Calculates Grade Power Ratio.
 * GPR = Median(RPS_next_grade) / Median(RPS_current_grade)
 * @param {number} medianRPSNext
 * @param {number} medianRPSCurrent
 * @returns {{ gpr: number, status: string }}
 */
export function calculateGradePowerRatio(medianRPSNext, medianRPSCurrent) {
  if (!medianRPSCurrent || medianRPSCurrent <= 0) return { gpr: 0, status: 'NO_DATA' };
  const gpr = medianRPSNext / medianRPSCurrent;
  let status = 'PASS';
  if (gpr > GRADE_POWER_THRESHOLDS.FAIL_MAX) status = 'FAIL';
  else if (gpr > GRADE_POWER_THRESHOLDS.REVIEW_MAX) status = 'REVIEW';
  else if (gpr < GRADE_POWER_THRESHOLDS.PASS_MIN) status = 'FAIL';
  return { gpr: Math.round(gpr * 100) / 100, status };
}

// 9. NORMAL MONSTER TTK THRESHOLDS (Section 69)
export const NORMAL_MONSTER_TTK = Object.freeze({
  EARLY: { min: 2, max: 5 },   // Lv 1-20
  MID: { min: 3, max: 7 },     // Lv 20-40
  LATE: { min: 5, max: 10 },   // Lv 40-75
  ENDGAME: { min: 6, max: 12 }, // Lv 75+
  HARD_LIMIT: 15,               // Absolute maximum for NORMAL mobs
});

// 10. ELITE AND CHAMPION RATIO TARGETS (Sections 70, 71)
export const ELITE_RATIO = Object.freeze({ min: 1.50, max: 2.50 });
export const CHAMPION_RATIO = Object.freeze({ min: 2.00, max: 4.00, hardLimit: 4.00 });

// 11. INSTANCE CLEAR TIME TARGETS (Section 72)
export const INSTANCE_CLEAR_TIME = Object.freeze({
  SHORT: { min: 3, max: 8 },     // minutes
  MEDIUM: { min: 8, max: 15 },
  LONG: { min: 15, max: 30 },
  HARD_LIMIT: 45,                // minutes
});

// 12. TOWER CP/TTK GROWTH TARGETS (Sections 74, 75)
export const TOWER_GROWTH = Object.freeze({
  CP_MIN: 1.05,
  CP_MAX: 1.20,
  CP_REVIEW: 1.35,
  TTK_MIN: 1.00,
  TTK_MAX: 1.25,
  TTK_FAIL: 1.50,
});
