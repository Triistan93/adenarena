import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCombatPower,
  calculateDetailedCombatPower
} from '../lineage-idle/src/data/balance/cpBalance.js';
import { CombatPowerService } from '../lineage-idle/src/services/CombatPowerService.js';
import {
  calculateRealPowerScore,
  calculateOffensiveDelta,
  calculateDefensiveDelta,
  calculateHealingDelta,
  calculateTTKImprovement,
  calculateCPEfficiency,
  detectCPInflation,
  detectCPUndervaluation,
  detectCPRepresentationFailure
} from '../lineage-idle/src/data/balance/phase4Model.js';

describe('MASTER GAME BALANCE — CP & EQUIPMENT INTEGRITY AUDIT', () => {
  const baseState = {
    level: 40,
    classTier: 2,
    stats: { atk: 250, def: 130, matk: 180, mdef: 110, maxHp: 1000, maxMp: 400, crit: 15, speed: 100, eva: 15 }
  };

  test('3.1. Single Source of Truth: CombatPowerService strictly equals calculateDetailedCombatPower', () => {
    const cpsResult = CombatPowerService.calculateCombatPower(baseState);
    const detailed = calculateDetailedCombatPower(baseState);

    assert.equal(cpsResult, detailed.totalCp, 'CombatPowerService must yield identical CP to detailed breakdown');
    assert.equal(detailed.auditPass, true, 'Additive audit must pass (totalCp == sum of components)');
  });

  test('3.2. 15-Component Additive Invariant: totalCp === sum of all 15 discrete components', () => {
    const equippedState = {
      ...baseState,
      equipment: {
        weapon: 'w_test',
        armor: 'a_test',
        necklace: 'n_test',
        cloak: 'c_test',
        belt: 'b_test'
      },
      inventory: [
        { uid: 'w_test', itemId: 'weapon_sword_1', tier: 3, enchant: 4, sa: true },
        { uid: 'a_test', itemId: 'armor_heavy_1', tier: 3, enchant: 3 },
        { uid: 'n_test', itemId: 'jewel_necklace_1', tier: 2 },
        { uid: 'c_test', itemId: 'cloak_1', tier: 2 },
        { uid: 'b_test', itemId: 'belt_1', tier: 2 }
      ],
      clan: { level: 4, castle: true },
      noblesse: { isNoblesse: true },
      olympiad: { isHero: true },
      fortresses: {
        owned: ['fort_dion'],
        equippedBracelet: 'bracelet_silver',
        equippedTalismans: ['tal_power', 'tal_defense']
      },
      codexUnlockedSets: ['set_gludio', 'set_dion'],
      bossDolls: ['doll_queen_ant']
    };

    const detailed = calculateDetailedCombatPower(equippedState);
    const cpsCp = CombatPowerService.calculateCombatPower(equippedState);

    assert.equal(detailed.totalCp, cpsCp, 'Single source of truth parity');
    assert.equal(detailed.auditPass, true, 'Detailed audit pass flag must be true');

    const expectedKeys = [
      'baseCp', 'equipmentCp', 'enchantCp', 'setBonusCp', 'jewelryCp',
      'accessoryCp', 'agathionCp', 'beltCp', 'braceletCp', 'talismanCp',
      'artifactCp', 'jewelBroochCp', 'passiveCp', 'skillCp', 'specialEffectCp'
    ];

    for (const key of expectedKeys) {
      assert.ok(key in detailed.components, `Missing component: ${key}`);
      assert.ok(typeof detailed.components[key] === 'number', `Component ${key} must be a number`);
    }

    const sum = Object.values(detailed.components).reduce((s, v) => s + v, 0);
    assert.equal(Math.floor(sum), detailed.totalCp, 'Sum of components must strictly equal totalCp');
  });

  test('3.3. Real Power Score (RPS) Calculation: Strict weighted formula verification', () => {
    // RPS = 0.45 * OD + 0.30 * DD + 0.10 * HD + 0.15 * RD
    const od = 0.20; // +20% DPS
    const dd = 0.15; // +15% PST
    const hd = 0.10; // +10% HPS
    const rd = 0.25; // 25% TTK reduction

    const rps = calculateRealPowerScore(od, dd, hd, rd);
    const expected = 0.45 * 0.20 + 0.30 * 0.15 + 0.10 * 0.10 + 0.15 * 0.25;
    assert.ok(Math.abs(rps - expected) <= 1e-12, `RPS ${rps} must equal expected ${expected}`);
    assert.equal(Math.round(rps * 1000) / 1000, 0.183);
  });

  test('3.4. CP Efficiency (CPE) Metric: RPS normalized by CP delta', () => {
    const rps = 0.183;
    const cpDelta = 0.15; // +15% CP
    const cpe = calculateCPEfficiency(rps, cpDelta);
    assert.equal(Math.round(cpe * 100) / 100, 1.22);
  });

  test('3.5. CP Inflation Detection: Flags CP diff > 20% with Real Power < 5%', () => {
    // 25% CP increase, but only 3% real power gain -> INFLATION
    assert.equal(detectCPInflation(25, 3), true, 'Should detect CP inflation');

    // 25% CP increase with 18% real power gain -> NORMAL
    assert.equal(detectCPInflation(25, 18), false, 'Normal progression should not trigger inflation');

    // Boundary: 20% CP increase is NOT > 20% -> false
    assert.equal(detectCPInflation(20, 3), false, 'Boundary 20% should not trigger inflation');
  });

  test('3.6. CP Undervaluation Detection: Flags CP diff <= 5% with Real Power > 20%', () => {
    // 3% CP increase, but 25% real power gain -> UNDERVALUED
    assert.equal(detectCPUndervaluation(3, 25), true, 'Should detect CP undervaluation');

    // 10% CP increase with 25% real power gain -> NORMAL
    assert.equal(detectCPUndervaluation(10, 25), false, 'Normal progression should not trigger undervaluation');

    // Boundary: 5% CP diff is <= 5% -> true
    assert.equal(detectCPUndervaluation(5, 22), true, 'Boundary 5% should trigger undervaluation');
  });

  test('3.7. CP Representation Failure: Symmetric detection of large real power disparity', () => {
    assert.equal(detectCPRepresentationFailure(4, 25), true, 'Should detect representation failure (+25% vs +4%)');
    assert.equal(detectCPRepresentationFailure(-3, -22), true, 'Should detect representation failure (-22% vs -3%)');
    assert.equal(detectCPRepresentationFailure(15, 18), false, 'Aligned CP and real power should pass');
  });
});
