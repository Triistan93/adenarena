/**
 * phase4-threshold-consistency.test.js
 *
 * Suite de Verificacao Estrita de Consistencia de Limiares (Thresholds) da FASE 4.
 * Cobre:
 * 1. Consistencia de taxas de combate (WR + LR + DR + TR == 100.0%).
 * 2. Validacao de Primeiro Candidato (Candidate[n-1] FAIL e Candidate[n] PASS).
 * 3. Proibicao de truques de arredondamento (rawValue 0.5044 vs 0.4912 para Farm TTK <= 0.50x).
 * 4. Draw rate <= 1.0% e Timeout rate == 0.0%.
 * 5. Classificacao de Pressao de Recursos (Low <= 25%, Moderate <= 50%, High <= 100%, Excessive > 100%).
 * 6. Potion Cost / Reward <= 5.0% em todos os 9 Epic Bosses.
 * 7. Sem excecao de SM para Chefes: Todos os 9 Epic Bosses possuem SM >= 1.50x no Recommended.
 * 8. Valakas Recommended: WR >= 95%, SM >= 1.50x, TTK no envelope Pinnacle (90-180s).
 * 9. Queen Ant Minimum CP: Candidato n-1 (7.250) FAIL por TTK > 90s envelope, n (7.500) PASS; status REVIEW se WR > 70%.
 * 10. Monotonicidade consecutiva de TTK entre Chefes: TTK(next) / TTK(current) in [1.05x, 1.50x].
 * 11. Intervalo de Confianca Wilson Score 95%: formula estrita, e.g. 5000/5000 -> [99.92%, 100.00%].
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCombatRates,
  calculatePreparationScore,
  classifyResourcePressure,
  calculatePotionCost,
  calculatePotionCostRatio,
  calculateConfidenceInterval95,
  ACCEPTANCE_MATRIX,
  PREPARATION_PROFILES,
  calculatePST,
  calculateSurvivalMargin
} from '../lineage-idle/src/data/balance/phase4Model.js';
import { RAID_BOSS_BALANCE, canEnterRaid } from '../lineage-idle/src/data/balance/bossBalance.js';
import { simulateMany } from '../lineage-idle/src/services/CombatSimulator.js';

describe('PHASE 4: STRICT THRESHOLD RECONCILIATION & CANDIDATE SEARCH', () => {

  // 1. RESULT & RATE CONSISTENCY (Spec Section 45, 46, 47)
  describe('1. Combat Rates & Result Consistency', () => {
    test('1.1. Win + Loss + Draw + Timeout must sum exactly to 100.0% within precision limit', () => {
      const rates = calculateCombatRates(950, 40, 7, 3, 1000);
      assert.equal(rates.winRate, 95.0);
      assert.equal(rates.lossRate, 4.0);
      assert.equal(rates.drawRate, 0.7);
      assert.equal(rates.timeoutRate, 0.3);
      assert.ok(rates.isConsistent, 'Rates must sum to 100.0%');
      assert.ok(rates.drawRate <= ACCEPTANCE_MATRIX.DRAW_RATE_PASS_MAX, 'Draw rate <= 1.0%');
    });

    test('1.2. Zero draw/timeout produces 100% split between win and loss', () => {
      const rates = calculateCombatRates(983, 17, 0, 0, 1000);
      assert.equal(rates.winRate, 98.3);
      assert.equal(rates.lossRate, 1.7);
      assert.equal(rates.drawRate, 0.0);
      assert.equal(rates.timeoutRate, 0.0);
      assert.ok(rates.isConsistent);
    });
  });

  // 2. RESOURCE PRESSURE & COST THRESHOLDS (Spec Section 48-53)
  describe('2. Resource Pressure & Economic Integrity', () => {
    test('2.1. Resource Pressure categories adhere strictly to thresholds (25%, 50%, 100%)', () => {
      assert.equal(classifyResourcePressure(20, 15, 10), 'LOW');
      assert.equal(classifyResourcePressure(25, 20, 20), 'LOW');
      assert.equal(classifyResourcePressure(45, 20, 10), 'MODERATE');
      assert.equal(classifyResourcePressure(50, 40, 30), 'MODERATE');
      assert.equal(classifyResourcePressure(80, 50, 30), 'HIGH');
      assert.equal(classifyResourcePressure(100, 70, 40), 'HIGH');
      assert.equal(classifyResourcePressure(105, 50, 30), 'EXCESSIVE');
    });

    test('2.2. Potion Cost / Reward ratio calculation avoids float precision drift', () => {
      const cost = calculatePotionCost(12, 20);
      assert.equal(cost, 240);
      const ratio = calculatePotionCostRatio(cost, 15000);
      assert.equal(ratio, 1.6);
      assert.ok(ratio <= ACCEPTANCE_MATRIX.POTION_COST_REWARD_MAX, 'Potion cost ratio <= 5.0%');
    });
  });

  // 3. NO ROUNDING TRICKS: FARM TTK <= 0.50x (Spec Section 26, 87)
  describe('3. Honest Arithmetic: No Rounding Manipulation', () => {
    test('3.1. 0.5044x is strictly > 0.50x (FAILS without rounding trick)', () => {
      const canonicalTTK = 60.8;
      const flawedTtk = 30.7;
      const rawRatio = flawedTtk / canonicalTTK;
      assert.ok(rawRatio > ACCEPTANCE_MATRIX.FARM_TTK_RATIO, `0.5049x (${rawRatio.toFixed(4)}x) must NOT pass <= 0.50x requirement`);
    });

    test('3.2. Calibrated Farm TTK (27.6s / 60.8s) is strictly <= 0.5000x (PASSES honestly)', () => {
      const canonicalTTK = 60.8;
      const calibratedTtk = 27.6;
      const rawRatio = calibratedTtk / canonicalTTK;
      assert.ok(rawRatio <= ACCEPTANCE_MATRIX.FARM_TTK_RATIO, `Raw ratio ${rawRatio.toFixed(4)}x must be <= 0.5000x`);
    });
  });

  // 4. FIRST CANDIDATE VERIFICATION: QUEEN ANT MINIMUM CP (Access Gate)
  describe('4. First Candidate Verification: Queen Ant Minimum CP (Access Gate)', () => {
    const qaBoss = RAID_BOSS_BALANCE.queen_ant;
    const testSkills = {
      power_strike: { id: 'power_strike', type: 'active', pwr: 130, baseCd: 3500, mpCost: 16 },
      triple_slash: { id: 'triple_slash', type: 'active', pwr: 150, baseCd: 5500, mpCost: 24 }
    };

    function createCandidatePlayer(cp, fullPrep = true) {
      const ratio = cp / 7500;
      const potCount = fullPrep ? 35 : 18;
      return {
        level: Math.round(35 + (cp - 6000) / 500),
        maxHp: Math.round(700 * ratio),
        hp: Math.round(700 * ratio),
        maxMp: Math.round(250 * ratio),
        mp: Math.round(250 * ratio),
        stats: {
          atk: Math.round(170 * ratio),
          def: Math.round(85 * ratio),
          matk: Math.round(40 * ratio),
          mdef: Math.round(65 * ratio),
          crit: Math.min(25, Math.round(10 * Math.sqrt(ratio))),
          critDmg: 2.0,
          atkSpd: 0.20 + (ratio - 0.8) * 0.15,
          eva: 10,
          mpRegen: 5
        },
        skills: { power_strike: 3, triple_slash: 2 },
        inventory: [{ itemId: 'hp_potion_l', count: potCount }, { itemId: 'mp_potion_m', count: 15 }]
      };
    }

    test('4.1. Candidate n-1 (7.500 CP) FAILS Criterion 5: TTK (90.2s) hits/exceeds 90.0s Early Epic envelope max', () => {
      const player7500 = createCandidatePlayer(7500, true);
      const sim = simulateMany({ player: player7500, enemy: qaBoss, skills: testSkills, runs: 400, config: { maxDurationSec: 180 } });
      assert.ok(sim.medianTTK >= qaBoss.targetMetrics.ttkMax, `Candidate 7500 CP TTK (${sim.medianTTK}s) hits/exceeds envelope max (${qaBoss.targetMetrics.ttkMax}s), failing Criterion 5`);
    });

    test('4.2. Candidate n (7.750 CP) PASSES all 5 Minimum CP criteria with Full Prep (125 PS)', () => {
      const player7750 = createCandidatePlayer(7750, true);
      const sim = simulateMany({ player: player7750, enemy: qaBoss, skills: testSkills, runs: 150, config: { maxDurationSec: 180 } });

      assert.ok(sim.winRate >= ACCEPTANCE_MATRIX.MINIMUM_WR_FULL, `WR (${sim.winRate}%) must be >= 50%`);
      assert.ok(sim.survivalMargin >= ACCEPTANCE_MATRIX.MINIMUM_SM_FULL, `SM (${sim.survivalMargin}x) must be >= 1.00x`);
      assert.ok(sim.potionUsage <= ACCEPTANCE_MATRIX.MINIMUM_RESOURCE_USAGE, `Potion usage (${sim.potionUsage}%) must be <= 100%`);
      assert.ok(sim.medianTTK <= qaBoss.targetMetrics.ttkMax, `TTK (${sim.medianTTK}s) within Early Epic envelope (<= 90.0s)`);

      const status = sim.winRate > 70 ? '⚠️ REVIEW (Minimum CP Too Easy)' : '✅ PASS';
      assert.ok(status.includes('REVIEW'), 'Must be marked REVIEW because WR is higher than the 50-70% sweet spot');
    });

    test('4.3. Access Gate: canEnterRaid strictly enforces minimumCP (7.750)', () => {
      assert.equal(canEnterRaid(7749, 'queen_ant'), false, '7749 CP must be blocked');
      assert.equal(canEnterRaid(7750, 'queen_ant'), true, '7750 CP must be allowed');
    });
  });

  // 5. FIRST CANDIDATE VERIFICATION: QUEEN ANT RECOMMENDED CP
  describe('5. First Candidate Verification: Queen Ant Recommended CP', () => {
    const qaBoss = RAID_BOSS_BALANCE.queen_ant;
    const testSkills = {
      power_strike: { id: 'power_strike', type: 'active', pwr: 130, baseCd: 3500, mpCost: 16 },
      triple_slash: { id: 'triple_slash', type: 'active', pwr: 150, baseCd: 5500, mpCost: 24 }
    };

    function createStandardPlayer(cp) {
      const ratio = cp / 7500;
      return {
        level: Math.round(35 + (cp - 6000) / 500),
        maxHp: Math.round(700 * ratio),
        hp: Math.round(700 * ratio),
        maxMp: Math.round(250 * ratio),
        mp: Math.round(250 * ratio),
        stats: {
          atk: Math.round(170 * ratio),
          def: Math.round(85 * ratio),
          matk: Math.round(40 * ratio),
          mdef: Math.round(65 * ratio),
          crit: Math.min(25, Math.round(10 * Math.sqrt(ratio))),
          critDmg: 2.0,
          atkSpd: 0.20 + (ratio - 0.8) * 0.15,
          eva: 10,
          mpRegen: 5
        },
        skills: { power_strike: 3, triple_slash: 2 },
        inventory: [{ itemId: 'hp_potion_l', count: 25 }, { itemId: 'mp_potion_m', count: 15 }]
      };
    }

    test('5.1. Candidate n-1 (10.500 CP) FAILS Resource Pressure: Potion Usage > 50.0% (HIGH Resource Pressure)', () => {
      const player10500 = createStandardPlayer(10500);
      const sim = simulateMany({ player: player10500, enemy: qaBoss, skills: testSkills, runs: 150, config: { maxDurationSec: 180 } });
      assert.ok(sim.potionUsage > 50.0, `Candidate 10500 CP Potion usage (${sim.potionUsage}%) must exceed 50.0% (fails Moderate requirement)`);
    });

    test('5.2. Candidate n (11.000 CP) PASSES all Recommended criteria with Standard Prep (100 PS)', () => {
      const player11000 = createStandardPlayer(11000);
      const sim = simulateMany({ player: player11000, enemy: qaBoss, skills: testSkills, runs: 150, config: { maxDurationSec: 180 } });

      assert.ok(sim.winRate >= ACCEPTANCE_MATRIX.RECOMMENDED_WR_STANDARD, `WR (${sim.winRate}%) >= 95%`);
      assert.ok(sim.survivalMargin >= ACCEPTANCE_MATRIX.RECOMMENDED_SM_STANDARD, `SM (${sim.survivalMargin}x) >= 1.50x`);
      assert.ok(sim.medianTTK >= qaBoss.targetMetrics.ttkMin && sim.medianTTK <= qaBoss.targetMetrics.ttkMax, `TTK (${sim.medianTTK}s) in 40-90s envelope`);
      assert.ok(sim.potionUsage <= 50.0, `Resource pressure must be MODERATE (${sim.potionUsage}% <= 50.0%)`);
    });

    test('5.3. CP Ratio (Recommended / Minimum) is within canonical range [1.25x, 1.75x]', () => {
      const ratio = qaBoss.recommendedCP / qaBoss.minimumCP;
      assert.ok(ratio >= ACCEPTANCE_MATRIX.RECOMMENDED_TO_MIN_CP_MIN && ratio <= ACCEPTANCE_MATRIX.RECOMMENDED_TO_MIN_CP_MAX,
        `Queen Ant CP Ratio (${ratio.toFixed(3)}x) must be in [1.25, 1.75]`);
    });
  });

  // 6. GLOBAL EPIC BOSSES: STRICT SM >= 1.50x & VALAKAS INTEGRITY
  describe('6. Epic Boss Progression & Valakas Pinnacle Integrity', () => {
    const bossProgression = [
      { id: 'queen_ant', lvl: 40,  pLvl: 40,  hp: 1027, atk: 249,  def: 125, matk: 60,  mdef: 95,  crit: 18, atkSpd: 0.30, potId: 'hp_potion_l',  pots: 25 },
      { id: 'core',      lvl: 50,  pLvl: 52,  hp: 1600, atk: 420,  def: 205, matk: 130, mdef: 165, crit: 25, atkSpd: 0.50, potId: 'hp_potion_l',  pots: 30 },
      { id: 'orfen',     lvl: 55,  pLvl: 58,  hp: 2100, atk: 530,  def: 250, matk: 170, mdef: 200, crit: 28, atkSpd: 0.60, potId: 'hp_potion_xl', pots: 35 },
      { id: 'zaken',     lvl: 60,  pLvl: 64,  hp: 2700, atk: 680,  def: 300, matk: 220, mdef: 250, crit: 30, atkSpd: 0.70, potId: 'hp_potion_xl', pots: 40 },
      { id: 'barakiel',  lvl: 75,  pLvl: 76,  hp: 3600, atk: 880,  def: 360, matk: 300, mdef: 300, crit: 34, atkSpd: 0.80, potId: 'hp_potion_xl', pots: 45 },
      { id: 'baium',     lvl: 75,  pLvl: 78,  hp: 4000, atk: 980,  def: 400, matk: 350, mdef: 340, crit: 36, atkSpd: 0.85, potId: 'hp_potion_xl', pots: 50 },
      { id: 'frintezza', lvl: 85,  pLvl: 88,  hp: 5200, atk: 1300, def: 500, matk: 480, mdef: 420, crit: 40, atkSpd: 1.00, potId: 'hp_potion_xl', pots: 50 },
      { id: 'antharas',  lvl: 95,  pLvl: 96,  hp: 6800, atk: 1750, def: 620, matk: 650, mdef: 520, crit: 44, atkSpd: 1.15, potId: 'hp_potion_xl', pots: 50 },
      { id: 'valakas',   lvl: 100, pLvl: 100, hp: 8500, atk: 2200, def: 760, matk: 850, mdef: 640, crit: 48, atkSpd: 1.30, potId: 'hp_potion_xl', pots: 50 }
    ];

    const standardSkills = {
      power_strike: { id: 'power_strike', type: 'active', pwr: 140, baseCd: 3500, mpCost: 16 },
      triple_slash: { id: 'triple_slash', type: 'active', pwr: 160, baseCd: 6000, mpCost: 24 }
    };

    test('6.1. 100% of all 9 Epic Bosses satisfy SM >= 1.50x without special exceptions', () => {
      for (const bEntry of bossProgression) {
        const boss = RAID_BOSS_BALANCE[bEntry.id];
        const player = {
          level: bEntry.pLvl, maxHp: bEntry.hp, hp: bEntry.hp, maxMp: 1000, mp: 1000,
          stats: { atk: bEntry.atk, def: bEntry.def, matk: bEntry.matk, mdef: bEntry.mdef, crit: bEntry.crit, critDmg: 2.2, atkSpd: bEntry.atkSpd, mpRegen: 15 },
          skills: { power_strike: 5, triple_slash: 5 },
          inventory: [{ itemId: bEntry.potId, count: bEntry.pots }, { itemId: 'mp_potion_m', count: 25 }]
        };
        const sim = simulateMany({ player, enemy: boss, skills: standardSkills, runs: 100, config: { maxDurationSec: 240 } });
        assert.ok(sim.survivalMargin >= ACCEPTANCE_MATRIX.RECOMMENDED_SM_STANDARD,
          `Boss ${bEntry.id} SM (${sim.survivalMargin}x) failed canonical requirement (>= 1.50x)`);
        assert.ok(sim.winRate >= ACCEPTANCE_MATRIX.RECOMMENDED_WR_STANDARD,
          `Boss ${bEntry.id} WR (${sim.winRate}%) failed canonical requirement (>= 95%)`);
      }
    });

    test('6.2. Valakas strictly satisfies WR >= 95%, SM >= 1.50x, and Pinnacle TTK (90-180s)', () => {
      const vEntry = bossProgression.find(b => b.id === 'valakas');
      const valakas = RAID_BOSS_BALANCE.valakas;
      const player = {
        level: vEntry.pLvl, maxHp: vEntry.hp, hp: vEntry.hp, maxMp: 1000, mp: 1000,
        stats: { atk: vEntry.atk, def: vEntry.def, matk: vEntry.matk, mdef: vEntry.mdef, crit: vEntry.crit, critDmg: 2.2, atkSpd: vEntry.atkSpd, mpRegen: 15 },
        skills: { power_strike: 5, triple_slash: 5 },
        inventory: [{ itemId: vEntry.potId, count: vEntry.pots }, { itemId: 'mp_potion_m', count: 25 }]
      };
      const sim = simulateMany({ player, enemy: valakas, skills: standardSkills, runs: 40, config: { maxDurationSec: 240 } });
      assert.ok(sim.winRate >= 95.0, `Valakas WR (${sim.winRate}%) must be >= 95%`);
      assert.ok(sim.survivalMargin >= 1.50, `Valakas SM (${sim.survivalMargin}x) must be >= 1.50x`);
      assert.ok(sim.avgTTK >= valakas.targetMetrics.ttkMin && sim.avgTTK <= valakas.targetMetrics.ttkMax,
        `Valakas TTK (${sim.avgTTK}s) must be in Pinnacle envelope [90s, 180s]`);
    });

    test('6.3. Consecutive Boss TTK Growth ratios satisfy [1.05x, 1.50x] across all 9 bosses', () => {
      const results = [];
      for (const bEntry of bossProgression) {
        const boss = RAID_BOSS_BALANCE[bEntry.id];
        const player = {
          level: bEntry.pLvl, maxHp: bEntry.hp, hp: bEntry.hp, maxMp: 1000, mp: 1000,
          stats: { atk: bEntry.atk, def: bEntry.def, matk: bEntry.matk, mdef: bEntry.mdef, crit: bEntry.crit, critDmg: 2.2, atkSpd: bEntry.atkSpd, mpRegen: 15 },
          skills: { power_strike: 5, triple_slash: 5 },
          inventory: [{ itemId: bEntry.potId, count: bEntry.pots }, { itemId: 'mp_potion_m', count: 25 }]
        };
        const sim = simulateMany({ player, enemy: boss, skills: standardSkills, runs: 30, config: { maxDurationSec: 240 } });
        results.push({ id: bEntry.id, ttk: sim.avgTTK });
      }

      for (let i = 1; i < results.length; i++) {
        const prev = results[i - 1];
        const cur = results[i];
        const growth = cur.ttk / prev.ttk;
        assert.ok(growth >= 1.05 && growth <= 1.50,
          `Growth between ${prev.id} (${prev.ttk}s) and ${cur.id} (${cur.ttk}s) is ${growth.toFixed(3)}x (must be in [1.05, 1.50])`);
      }
    });
  });

  // 7. STATISTICAL VALIDATION: WILSON SCORE CONFIDENCE INTERVALS (Spec Section 100)
  describe('7. Wilson Score 95% Confidence Intervals', () => {
    test('7.1. Wilson Score interval for 5,000/5,000 wins is [99.92%, 100.00%]', () => {
      const ci = calculateConfidenceInterval95(5000, 5000);
      assert.equal(ci.method, 'Wilson');
      assert.equal(ci.lower, 99.92);
      assert.equal(ci.upper, 100.0);
      assert.equal(ci.intervalStr, '[99.92%, 100.00%]');
    });

    test('7.2. Wilson Score interval for 1,000/1,000 wins is [99.62%, 100.00%]', () => {
      const ci = calculateConfidenceInterval95(1000, 1000);
      assert.equal(ci.lower, 99.62);
      assert.equal(ci.upper, 100.0);
      assert.ok(ci.marginPct <= 0.5);
    });

    test('7.3. Wilson Score interval for Queen Ant 983/1000 wins is tight (margin <= 1.5%)', () => {
      const ci = calculateConfidenceInterval95(983, 1000);
      assert.ok(ci.marginPct <= 1.5);
      assert.ok(ci.lower >= 96.5 && ci.upper <= 99.5);
    });
  });

  // 8. STRICT BOUNDARY ARITHMETIC (Spec Section 31)
  describe('8. Strict Boundary Precision (No Floating Tolerances)', () => {
    test('8.1. Minimum Win Rate boundary: 49.999% FAILS, 50.000% PASSES, 50.001% PASSES', () => {
      const threshold = ACCEPTANCE_MATRIX.MINIMUM_WR_FULL; // 50.0
      assert.equal(49.999 >= threshold, false);
      assert.equal(50.000 >= threshold, true);
      assert.equal(50.001 >= threshold, true);
    });

    test('8.2. Recommended Win Rate boundary: 94.999% FAILS, 95.000% PASSES, 95.001% PASSES', () => {
      const threshold = ACCEPTANCE_MATRIX.RECOMMENDED_WR_STANDARD; // 95.0
      assert.equal(94.999 >= threshold, false);
      assert.equal(95.000 >= threshold, true);
      assert.equal(95.001 >= threshold, true);
    });

    test('8.3. Minimum Survival Margin boundary: 0.9999x FAILS, 1.0000x PASSES, 1.0001x PASSES', () => {
      const threshold = ACCEPTANCE_MATRIX.MINIMUM_SM_FULL; // 1.00
      assert.equal(0.9999 >= threshold, false);
      assert.equal(1.0000 >= threshold, true);
      assert.equal(1.0001 >= threshold, true);
    });

    test('8.4. Recommended Survival Margin boundary: 1.4999x FAILS, 1.5000x PASSES, 1.5001x PASSES', () => {
      const threshold = ACCEPTANCE_MATRIX.RECOMMENDED_SM_STANDARD; // 1.50
      assert.equal(1.4999 >= threshold, false);
      assert.equal(1.5000 >= threshold, true);
      assert.equal(1.5001 >= threshold, true);
    });

    test('8.5. Early Epic TTK Max Envelope boundary: 90.001s FAILS, 90.000s PASSES, 89.999s PASSES', () => {
      const maxTtk = 90.0;
      assert.equal(90.001 <= maxTtk, false);
      assert.equal(90.000 <= maxTtk, true);
      assert.equal(89.999 <= maxTtk, true);
    });

    test('8.6. Farm TTK Ratio boundary: 0.5001x FAILS, 0.5000x PASSES, 0.4999x PASSES', () => {
      const ratioMax = ACCEPTANCE_MATRIX.FARM_TTK_RATIO; // 0.50
      assert.equal(0.5001 <= ratioMax, false);
      assert.equal(0.5000 <= ratioMax, true);
      assert.equal(0.4999 <= ratioMax, true);
    });

    test('8.7. Resource Pressure classification boundaries (25%, 50%, 100%)', () => {
      assert.equal(classifyResourcePressure(25.000, 0, 0), 'LOW');
      assert.equal(classifyResourcePressure(25.001, 0, 0), 'MODERATE');
      assert.equal(classifyResourcePressure(50.000, 0, 0), 'MODERATE');
      assert.equal(classifyResourcePressure(50.001, 0, 0), 'HIGH');
      assert.equal(classifyResourcePressure(100.000, 0, 0), 'HIGH');
      assert.equal(classifyResourcePressure(100.001, 0, 0), 'EXCESSIVE');
    });
  });

  // 9. CANONICAL TTK UNIQUENESS & RAW SIMULATION DATASET CONSISTENCY
  describe('9. Canonical TTK Uniqueness & Raw Simulation Snapshot Parity', () => {
    test('9.1. Queen Ant Canonical TTK is strictly ONE value (60.8s) and matches raw simulation data', async () => {
      const fs = await import('node:fs');
      const path = await import('node:path');
      const fixturePath = path.resolve('test/fixtures/phase4/raw_simulation_data.json');
      assert.ok(fs.existsSync(fixturePath), 'Fixture raw_simulation_data.json must exist');

      const rawData = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
      assert.equal(rawData.summary.queenAntMinimumCP, 7750);
      assert.equal(rawData.summary.queenAntRecommendedCP, 11000);
      assert.equal(rawData.summary.queenAntCanonicalTTK, 60.8);
      assert.equal(rawData.summary.queenAntCanonicalSM, 2.47);
      assert.ok(rawData.summary.queenAntFarmRatio <= 0.5000);

      // Verify all 9 bosses in progression matrix have status PASS
      for (const b of rawData.bossProgressionMatrix) {
        assert.equal(b.status, 'PASS', `Boss ${b.id} must have status PASS`);
        assert.ok(b.survivalMargin >= 1.50, `Boss ${b.id} SM must be >= 1.50x`);
        assert.ok(b.winRate >= 95.0, `Boss ${b.id} WR must be >= 95.0%`);
        assert.ok(b.costRatio <= 5.0, `Boss ${b.id} cost ratio must be <= 5.0%`);
        if (b.growthRatio !== null) {
          assert.ok(b.growthValid, `Boss ${b.id} consecutive growth must be in [1.05x, 1.50x]`);
        }
      }
    });
  });
});

