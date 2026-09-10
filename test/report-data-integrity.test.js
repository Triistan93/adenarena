import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  CANONICAL_VARIABLES,
  statisticalMedian,
  sampleVariance,
  sampleStdDev,
  standardError,
  wilsonScoreInterval,
  studentTConfidenceInterval,
  deterministicPercentile,
  validateOutcomeConsistency,
  HARD_CRITERIA,
  SOFT_CRITERIA,
  evaluateBoundary
} from '../lineage-idle/src/data/balance/phase4Model.js';

describe('MASTER GAME BALANCE — STATISTICAL METHODOLOGY & DATA INTEGRITY AUDIT', () => {
  test('4.1. Canonical Variables Registered: All 40+ formal balance variables defined and frozen', () => {
    assert.ok(Object.isFrozen(CANONICAL_VARIABLES), 'CANONICAL_VARIABLES must be frozen');
    const requiredVars = [
      'C', 'K', 'L', 'CP', 'PS', 'B', 'R', 'S', 'N',
      'PATK', 'MATK', 'CR', 'CM', 'AS', 'CS', 'ACC',
      'PDEF', 'MDEF', 'HP', 'MaxHP', 'MP', 'MaxMP', 'EVA', 'RES', 'DR', 'SH',
      'TTK', 'TTD', 'PST_VAR', 'CT',
      'D', 'H', 'DPS', 'HPS',
      'MPSpent', 'PotionUsed', 'PotionStock', 'PotionCost',
      'XP', 'Adena', 'RewardValue', 'GuaranteedReward'
    ];

    for (const v of requiredVars) {
      assert.ok(v in CANONICAL_VARIABLES, `Variable ${v} must be formally registered`);
      assert.ok(CANONICAL_VARIABLES[v].name, `Variable ${v} must have a descriptive name`);
    }
  });

  test('4.2. Exact Median: Evaluates correctly for odd and even sample sizes', () => {
    // Odd N = 5 -> sorted: [10, 20, 30, 40, 50] -> middle is 30
    assert.equal(statisticalMedian([50, 10, 30, 20, 40]), 30);

    // Even N = 4 -> sorted: [10, 20, 30, 40] -> average of 20 and 30 is 25
    assert.equal(statisticalMedian([40, 10, 30, 20]), 25);

    // Single element
    assert.equal(statisticalMedian([42]), 42);

    // Empty array
    assert.equal(statisticalMedian([]), 0);
  });

  test('4.3. Sample Variance & Standard Error: Strict N-1 divisor enforcement', () => {
    const sample = [10, 12, 23, 23, 16, 23, 21, 16];
    // n = 8, sum = 144, mean = 18
    // sum of sq dev: (10-18)^2 + (12-18)^2 + 3*(23-18)^2 + 2*(16-18)^2 + (21-18)^2
    // = 64 + 36 + 3*25 + 2*4 + 9 = 64 + 36 + 75 + 8 + 9 = 192
    // s^2 = 192 / (8 - 1) = 192 / 7 = 27.42857...
    const variance = sampleVariance(sample);
    const expectedVar = 192 / 7;
    assert.ok(Math.abs(variance - expectedVar) <= 1e-10, `Variance (${variance}) must use N-1 divisor (${expectedVar})`);

    const se = standardError(sample);
    const expectedSE = Math.sqrt(expectedVar) / Math.sqrt(8);
    assert.ok(Math.abs(se - expectedSE) <= 1e-10, `Standard error (${se}) must equal ${expectedSE}`);
  });

  test('4.4. Wilson Score 95% Confidence Interval: Asymmetric formula with z=1.95996', () => {
    // 5000/5000 wins
    const ci5000 = wilsonScoreInterval(5000, 5000);
    assert.equal(ci5000.method, 'Wilson');
    assert.equal(ci5000.upperPct, 100);
    // Lower CI for 5000/5000 is approximately 99.92%
    assert.ok(ci5000.lowerPct >= 99.90 && ci5000.lowerPct <= 99.95, `Lower CI (${ci5000.lowerPct}) must be ~99.92%`);

    // 0/1000 wins
    const ci0 = wilsonScoreInterval(0, 1000);
    assert.equal(ci0.lowerPct, 0);
    assert.ok(ci0.upperPct > 0 && ci0.upperPct < 0.5, 'Upper CI for 0 wins must be small but positive');

    // 983/1000 wins
    const ci983 = wilsonScoreInterval(983, 1000);
    assert.ok(ci983.lowerPct > 97.0 && ci983.upperPct <= 99.0, `Wilson interval for 983/1000: [${ci983.lowerPct.toFixed(2)}%, ${ci983.upperPct.toFixed(2)}%]`);
  });

  test('4.5. Student\'s t Confidence Interval: Computes symmetric interval centered on sample mean', () => {
    const sample = [58.2, 60.1, 59.8, 62.4, 61.0, 59.5, 60.8, 61.2];
    const ci = studentTConfidenceInterval(sample);
    assert.ok(ci.mean > 60.0 && ci.mean < 61.0, `Mean (${ci.mean}) within expected range`);
    assert.ok(ci.lower < ci.mean, 'Lower CI must be below mean');
    assert.ok(ci.upper > ci.mean, 'Upper CI must be above mean');
    assert.ok(Math.abs((ci.upper - ci.mean) - (ci.mean - ci.lower)) <= 1e-10, 'Student t CI must be symmetric about mean');
  });

  test('4.6. Deterministic Percentile: Linear interpolation between sample elements', () => {
    const arr = [10, 20, 30, 40, 50];
    assert.equal(deterministicPercentile(arr, 0.0), 10);
    assert.equal(deterministicPercentile(arr, 0.5), 30);
    assert.equal(deterministicPercentile(arr, 1.0), 50);
    assert.equal(deterministicPercentile(arr, 0.25), 20);
    assert.equal(deterministicPercentile(arr, 0.75), 40);
  });

  test('4.7. Outcome Consistency Verification: WR + LR + DR + TR == 1.0 within 1e-12', () => {
    assert.equal(validateOutcomeConsistency(0.95, 0.05, 0.0, 0.0), true);
    assert.equal(validateOutcomeConsistency(0.70, 0.20, 0.05, 0.05), true);
    assert.equal(validateOutcomeConsistency(0.95, 0.06, 0.0, 0.0), false); // Sum = 1.01
  });

  test('4.8. Frozen Criteria Matrices: Hard and Soft criteria strictly match specification', () => {
    assert.ok(Object.isFrozen(HARD_CRITERIA), 'HARD_CRITERIA must be frozen');
    assert.ok(Object.isFrozen(SOFT_CRITERIA), 'SOFT_CRITERIA must be frozen');

    assert.equal(HARD_CRITERIA.MINIMUM_WR_LOWER_CI, 50.0);
    assert.equal(HARD_CRITERIA.RECOMMENDED_WR_LOWER_CI, 95.0);
    assert.equal(HARD_CRITERIA.FARM_WR_LOWER_CI, 99.5);
    assert.equal(HARD_CRITERIA.MINIMUM_SM, 1.00);
    assert.equal(HARD_CRITERIA.RECOMMENDED_SM, 1.50);
    assert.equal(HARD_CRITERIA.FARM_TTK_RATIO_MAX, 0.5000);
    assert.equal(HARD_CRITERIA.NORMAL_MONSTER_TTK_MAX, 15.0);

    assert.equal(SOFT_CRITERIA.CP_GAP_MIN, 1.25);
    assert.equal(SOFT_CRITERIA.CP_GAP_MAX, 1.75);
    assert.equal(SOFT_CRITERIA.SLOT_POWER_RATIO_MIN, 0.85);
    assert.equal(SOFT_CRITERIA.SLOT_POWER_RATIO_MAX, 1.15);
    assert.equal(SOFT_CRITERIA.ENCHANT_SPIKE_REVIEW, 2.0);
    assert.equal(SOFT_CRITERIA.ENCHANT_SPIKE_FAIL, 3.0);
  });

  test('4.9. Boundary Operator Evaluator: Precision boundary testing without tolerance leaks', () => {
    assert.equal(evaluateBoundary(50.0, 50.0, '>='), true);
    assert.equal(evaluateBoundary(49.999999, 50.0, '>='), false);
    assert.equal(evaluateBoundary(90.0, 90.0, '<='), true);
    assert.equal(evaluateBoundary(90.000001, 90.0, '<='), false);
  });
});
