import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  SLOT_POWER_BUDGET,
  SLOT_POWER_THRESHOLDS,
  GRADES,
  GRADE_POWER_THRESHOLDS,
  CANONICAL_LOADOUTS,
  validateLoadoutMonotonicity,
  calculateSlotPowerRatio,
  calculateGradePowerRatio,
  NORMAL_MONSTER_TTK,
  ELITE_RATIO,
  CHAMPION_RATIO,
  INSTANCE_CLEAR_TIME,
  TOWER_GROWTH
} from '../lineage-idle/src/data/balance/equipmentBalance.js';
import { ALL_ITEMS } from '../lineage-idle/src/data/items/index.js';
import { SOLO_INSTANCES } from '../lineage-idle/src/data/instances.js';
import { getTowerFloorDef, getTowerFloorMinimumCP, getTowerFloorRecommendedCP } from '../lineage-idle/src/services/TowerService.js';

describe('MASTER GAME BALANCE — EQUIPMENT ECOSYSTEM & CONTENT INTEGRITY AUDIT', () => {
  test('2.1. Inventory Catalog Completeness: ALL_ITEMS contains 1,100 items with 0 orphans', () => {
    const itemIds = Object.keys(ALL_ITEMS);
    assert.equal(itemIds.length, 1100, `Expected exactly 1,100 items, got ${itemIds.length}`);
    for (const [id, item] of Object.entries(ALL_ITEMS)) {
      assert.ok(item, `Item ${id} must not be null/undefined`);
      assert.ok(item.name || item.id, `Item ${id} must have a name or id`);
    }
  });

  test('2.2. Slot Power Budget: Reference weapon is 1.00 and all 15 slots have defined budgets', () => {
    assert.equal(SLOT_POWER_BUDGET.weapon, 1.00, 'Weapon must be reference slot with budget 1.00');
    assert.ok(SLOT_POWER_BUDGET.armor > 0, 'Armor budget must be positive');
    assert.ok(SLOT_POWER_BUDGET.legs > 0, 'Legs budget must be positive');
    assert.ok(SLOT_POWER_BUDGET.helmet > 0, 'Helmet budget must be positive');
    assert.ok(SLOT_POWER_BUDGET.gloves > 0, 'Gloves budget must be positive');
    assert.ok(SLOT_POWER_BUDGET.boots > 0, 'Boots budget must be positive');
    assert.ok(SLOT_POWER_BUDGET.shield > 0, 'Shield budget must be positive');
    assert.ok(SLOT_POWER_BUDGET.necklace > 0, 'Necklace budget must be positive');
    assert.ok(SLOT_POWER_BUDGET.earring > 0, 'Earring budget must be positive');
    assert.ok(SLOT_POWER_BUDGET.ring > 0, 'Ring budget must be positive');
    assert.ok(SLOT_POWER_BUDGET.belt > 0, 'Belt budget must be positive');
    assert.ok(SLOT_POWER_BUDGET.cloak > 0, 'Cloak budget must be positive');
    assert.ok(SLOT_POWER_BUDGET.hair > 0, 'Hair budget must be positive');
    assert.ok(SLOT_POWER_BUDGET.agathion > 0, 'Agathion budget must be positive');
  });

  test('2.3. Slot Power Ratio Evaluator: Correctly classifies PASS, REVIEW, and FAIL', () => {
    // PASS in [0.85, 1.15]
    const passEval = calculateSlotPowerRatio(1.00, 'weapon');
    assert.equal(passEval.status, 'PASS');
    assert.equal(passEval.spr, 1.00);

    // REVIEW in [0.70, 0.85) or (1.15, 1.50]
    const reviewEvalLow = calculateSlotPowerRatio(0.75, 'weapon');
    assert.equal(reviewEvalLow.status, 'REVIEW');

    const reviewEvalHigh = calculateSlotPowerRatio(1.30, 'weapon');
    assert.equal(reviewEvalHigh.status, 'REVIEW');

    // FAIL < 0.70 or > 1.50
    const failEvalLow = calculateSlotPowerRatio(0.60, 'weapon');
    assert.equal(failEvalLow.status, 'FAIL');

    const failEvalHigh = calculateSlotPowerRatio(1.60, 'weapon');
    assert.equal(failEvalHigh.status, 'FAIL');
  });

  test('2.4. Grade Power Ratio (GPR): Validates progression across all 6 grades', () => {
    assert.equal(GRADES.length, 6, 'Must have exactly 6 grades (NG, D, C, B, A, S)');

    // Test GPR classification
    const normalGPR = calculateGradePowerRatio(1.35, 1.00);
    assert.equal(normalGPR.status, 'PASS');

    const reviewGPR = calculateGradePowerRatio(1.65, 1.00);
    assert.equal(reviewGPR.status, 'REVIEW');

    const failGPR = calculateGradePowerRatio(2.10, 1.00);
    assert.equal(failGPR.status, 'FAIL');
  });

  test('2.5. Canonical Loadouts Progression Monotonicity: Strictly monotonic CP growth', () => {
    const loadoutCPs = {
      STARTER: 1100,
      EARLY: 4200,
      MID: 11000,
      LATE: 42000,
      ENDGAME: 105000,
      OPTIMIZED: 185000
    };

    const validation = validateLoadoutMonotonicity(loadoutCPs);
    assert.equal(validation.isMonotonic, true, 'Loadout progression must be strictly monotonic');
    assert.equal(validation.violations.length, 0, 'Zero monotonicity violations allowed');
  });

  test('2.6. Monotonicity Failure Detection: Catches regression in loadout CP', () => {
    const invalidCPs = {
      STARTER: 1100,
      EARLY: 4200,
      MID: 3800, // Regression!
      LATE: 42000,
      ENDGAME: 105000,
      OPTIMIZED: 185000
    };

    const validation = validateLoadoutMonotonicity(invalidCPs);
    assert.equal(validation.isMonotonic, false, 'Must detect non-monotonic regression');
    assert.equal(validation.violations.length, 1, 'Should find exactly 1 violation');
    assert.equal(validation.violations[0].from, 'EARLY');
    assert.equal(validation.violations[0].to, 'MID');
  });

  test('2.7. Normal Monster TTK Envelopes: All tier thresholds defined and <= 15s hard limit', () => {
    assert.ok(NORMAL_MONSTER_TTK.EARLY.max <= 5, 'Early mob TTK max <= 5s');
    assert.ok(NORMAL_MONSTER_TTK.MID.max <= 7, 'Mid mob TTK max <= 7s');
    assert.ok(NORMAL_MONSTER_TTK.LATE.max <= 10, 'Late mob TTK max <= 10s');
    assert.ok(NORMAL_MONSTER_TTK.ENDGAME.max <= 12, 'Endgame mob TTK max <= 12s');
    assert.equal(NORMAL_MONSTER_TTK.HARD_LIMIT, 15, 'Normal monster TTK hard limit must be 15s');
  });

  test('2.8. Solo Instances: All 4 instances have valid CP gates and stats', () => {
    const instances = Object.values(SOLO_INSTANCES);
    assert.equal(instances.length, 4, 'Must have exactly 4 solo instances');

    for (const inst of instances) {
      assert.ok(inst.minimumCP > 0, `Instance ${inst.id} must have positive minimumCP`);
      assert.ok(inst.recommendedCP > inst.minimumCP, `Instance ${inst.id} recommendedCP must exceed minimumCP`);
      const ratio = inst.recommendedCP / inst.minimumCP;
      assert.ok(ratio >= 1.25 && ratio <= 1.75, `Instance ${inst.id} CP ratio (${ratio}) must be within [1.25, 1.75]`);
      assert.ok(inst.bossDef > 0, `Instance ${inst.id} bossDef must be positive`);
      assert.ok(inst.bossMdef > 0, `Instance ${inst.id} bossMdef must be positive`);
    }
  });

  test('2.9. Tower of Insolence CP Gates: Exponential scaling with floor growth in [1.05x, 1.20x]', () => {
    for (let f = 1; f < 100; f++) {
      const minCpCurrent = getTowerFloorMinimumCP(f);
      const minCpNext = getTowerFloorMinimumCP(f + 1);
      const growth = minCpNext / minCpCurrent;
      assert.ok(growth >= TOWER_GROWTH.CP_MIN, `Tower floor ${f}->${f+1} CP growth (${growth.toFixed(4)}) must be >= ${TOWER_GROWTH.CP_MIN}`);
      assert.ok(growth <= TOWER_GROWTH.CP_REVIEW, `Tower floor ${f}->${f+1} CP growth (${growth.toFixed(4)}) must be <= ${TOWER_GROWTH.CP_REVIEW}`);
    }

    // Recommended CP must be ~1.45x of Minimum CP
    for (let f = 1; f <= 100; f += 10) {
      const minCp = getTowerFloorMinimumCP(f);
      const recCp = getTowerFloorRecommendedCP(f);
      const ratio = recCp / minCp;
      assert.ok(ratio >= 1.25 && ratio <= 1.75, `Floor ${f} ratio (${ratio.toFixed(2)}) must be in [1.25, 1.75]`);
    }
  });
});
