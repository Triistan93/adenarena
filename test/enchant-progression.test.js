import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  getEnchantMultiplier,
  getEnchantMarginalGain,
  validateEnchantProgression,
  ENCHANT_CONFIG
} from '../lineage-idle/src/data/balance/equipmentBalance.js';

describe('MASTER GAME BALANCE — ENCHANT PROGRESSION (+0 TO +16) & +4 FIX AUDIT', () => {
  test('1.1. Monotonic Stat Growth: Mult(e) strictly increases from +0 to +16', () => {
    let prevMult = 0;
    for (let e = 0; e <= 16; e++) {
      const mult = getEnchantMultiplier(e);
      assert.ok(mult > prevMult, `Enchant +${e} mult (${mult}) must be strictly greater than +${e-1} (${prevMult})`);
      prevMult = mult;
    }
  });

  test('1.2. The +4 Fix: Mult(4) (2.40x) is strictly greater than Mult(3) (1.90x) and eliminates 0.36 typo', () => {
    const mult3 = getEnchantMultiplier(3);
    const mult4 = getEnchantMultiplier(4);
    assert.equal(mult3, 1.90, 'Enchant +3 multiplier must be exactly 1.90');
    assert.equal(mult4, 2.40, 'Enchant +4 multiplier must be exactly 2.40');
    assert.ok(mult4 > mult3, 'Enchant +4 must be strictly greater than +3');
    assert.notEqual(mult4, 1.86, 'Enchant +4 must NOT equal the old buggy value 1.86');
  });

  test('1.3. Full Progression Curve Values match exact specification', () => {
    const expected = [
      1.0, 1.3, 1.6, 1.9, 2.4, 2.9, 3.4, 3.9, 4.4, 4.9, 5.4, 5.9, 6.4, 6.9, 7.4, 7.9, 8.4
    ];
    for (let e = 0; e <= 16; e++) {
      const mult = Math.round(getEnchantMultiplier(e) * 100) / 100;
      assert.equal(mult, expected[e], `Enchant +${e} expected ${expected[e]} but got ${mult}`);
    }
  });

  test('1.4. Marginal Gain Curve Validation: Zero critical spikes (> 3.0x median)', () => {
    const validation = validateEnchantProgression();
    assert.equal(validation.isMonotonic, true, 'Enchant curve must be strictly monotonic');
    assert.equal(validation.fails.length, 0, `No enchant level should exceed 3.0x median marginal gain. Found: ${JSON.stringify(validation.fails)}`);
    assert.ok(validation.medianMG > 0, 'Median marginal gain must be positive');
  });

  test('1.5. Marginal gain boundary tests for all 16 enchant transitions', () => {
    for (let e = 1; e <= 16; e++) {
      const gain = getEnchantMarginalGain(e);
      assert.ok(gain.marginalGain > 0, `Marginal gain for +${e} must be positive`);
      assert.ok(gain.marginalGain < 1.0, `Marginal gain for +${e} must not exceed 100%`);
    }
  });
});
