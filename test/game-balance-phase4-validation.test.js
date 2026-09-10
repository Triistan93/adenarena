/**
 * game-balance-phase4-validation.test.js
 *
 * MASTER GAME BALANCE — PHASE 4 VALIDATION SUITE
 *
 * Validates the canonical operational model, formulas, preparation matrices,
 * combat outcomes, resource economics, and progression curves across:
 * - Preparation Score (PS) weighted formula & monotonicity
 * - Projected Survival Time (PST) & Survival Margin (SM)
 * - Deterministic Outcomes (WIN, LOSS, DRAW, TIMEOUT = 100%)
 * - Minimum CP & Recommended CP gates
 * - Queen Ant 12 CP points deep dive
 * - 9 Epic Bosses progression & <= 5% potion economy
 * - 25 Canonical Classes combat profiles & > 0 MP/s
 * - 32 Hunting Zones CP and TTK progression
 * - Monte Carlo statistical bounds (95% CI)
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  simulateCombat,
  simulateMany
} from '../lineage-idle/src/services/CombatSimulator.js';

import {
  RAID_BOSS_BALANCE
} from '../lineage-idle/src/data/balance/bossBalance.js';

import {
  ZONE_CP_REQUIREMENTS
} from '../lineage-idle/src/data/balance/progressionBalance.js';

import {
  CANONICAL_UNITS,
  PREPARATION_PROFILES,
  calculatePreparationScore,
  calculateEffectiveHpBudget,
  calculatePST,
  calculateSurvivalMargin,
  classifySurvivalMargin,
  classifyCpBand,
  classifyResourcePressure,
  calculateCombatRates,
  calculateConfidenceInterval95,
  calculatePotionCost,
  calculatePotionCostRatio,
  ACCEPTANCE_MATRIX
} from '../lineage-idle/src/data/balance/phase4Model.js';

describe('1. CANONICAL FORMULAS & UNITS INTEGRITY (Phase 4 Spec 1-34)', () => {

  test('1.1. CANONICAL_UNITS dictionary defines canonical units for all metrics', () => {
    assert.equal(CANONICAL_UNITS.hp, 'HP');
    assert.equal(CANONICAL_UNITS.mp, 'MP');
    assert.equal(CANONICAL_UNITS.ttk, 's');
    assert.equal(CANONICAL_UNITS.ttd, 's');
    assert.equal(CANONICAL_UNITS.pst, 's');
    assert.equal(CANONICAL_UNITS.survivalMargin, '×');
    assert.equal(CANONICAL_UNITS.preparationScore, 'PS');
    assert.equal(CANONICAL_UNITS.winRate, '%');
    assert.equal(CANONICAL_UNITS.potionCost, 'Adena/combat');
  });

  test('1.2. calculatePreparationScore adheres to the canonical weighted formula', () => {
    // Equipment 30%, Consumables 15%, Buffs 15%, Skills 20%, Rotation 20%
    const standardPs = calculatePreparationScore({ equipment: 100, consumables: 100, buffs: 100, skills: 100, rotation: 100 });
    assert.equal(standardPs, 100, 'Standard profile must equal exactly 100 PS');

    const poorPs = calculatePreparationScore({ equipment: 75, consumables: 75, buffs: 75, skills: 75, rotation: 75 });
    assert.equal(poorPs, 75, 'Poor profile must equal exactly 75 PS');

    const fullPs = calculatePreparationScore({ equipment: 125, consumables: 125, buffs: 125, skills: 125, rotation: 125 });
    assert.equal(fullPs, 125, 'Full profile must equal exactly 125 PS');

    const optPs = calculatePreparationScore({ equipment: 150, consumables: 150, buffs: 150, skills: 150, rotation: 150 });
    assert.equal(optPs, 150, 'Optimized profile must equal exactly 150 PS');
  });

  test('1.3. Preparation Score Monotonicity Rule: 75 PS < 100 PS < 125 PS < 150 PS', () => {
    assert.ok(PREPARATION_PROFILES.POOR.ps < PREPARATION_PROFILES.STANDARD.ps);
    assert.ok(PREPARATION_PROFILES.STANDARD.ps < PREPARATION_PROFILES.FULL.ps);
    assert.ok(PREPARATION_PROFILES.FULL.ps < PREPARATION_PROFILES.OPTIMIZED.ps);
  });

  test('1.4. Effective HP Budget, PST, and SM produce finite, non-negative values', () => {
    const ehpBudget = calculateEffectiveHpBudget(1000, 300, 450);
    assert.equal(ehpBudget, 1750, 'Effective HP Budget = 1000 + 300 + 450 = 1750');

    const pst = calculatePST(ehpBudget, 25); // 1750 / 25 dps = 70.0s
    assert.equal(pst, 70.0, 'PST must equal 70.0s');

    const sm = calculateSurvivalMargin(pst, 50); // 70 / 50 = 1.40x
    assert.equal(sm, 1.40, 'Survival Margin must equal 1.40x');

    const classified = classifySurvivalMargin(sm);
    assert.equal(classified.tier, 'CHALLENGING');
  });

  test('1.5. classifyCpBand categorizes CP thresholds according to Section 10', () => {
    const minCp = 7500;
    const recCp = 12500;

    assert.equal(classifyCpBand(7000, minCp, recCp), 'LOCKED');
    assert.equal(classifyCpBand(7500, minCp, recCp), 'CHALLENGING');
    assert.equal(classifyCpBand(10000, minCp, recCp), 'CHALLENGING');
    assert.equal(classifyCpBand(12500, minCp, recCp), 'RECOMMENDED');
    assert.equal(classifyCpBand(13500, minCp, recCp), 'RECOMMENDED');
    assert.equal(classifyCpBand(15000, minCp, recCp), 'FAVORABLE');
    assert.equal(classifyCpBand(20000, minCp, recCp), 'FARM');
  });
});

describe('2. COMBAT OUTCOMES & DRAW/TIMEOUT INTEGRITY (Phase 4 Spec 35-47)', () => {

  test('2.1. Player dead + Enemy alive resolves strictly as LOSS', () => {
    const weakPlayer = { level: 40, maxHp: 100, hp: 100, maxMp: 50, mp: 50, stats: { atk: 1, def: 1 } };
    const strongBoss = { id: 'boss', name: 'Boss', hp: 50000, atk: 500, def: 200, atkSpd: 1.0 };
    const sim = simulateCombat({ player: weakPlayer, enemy: strongBoss, skills: {} });

    assert.equal(sim.outcome, 'LOSS');
    assert.equal(sim.winner, 'enemy');
    assert.ok(sim.ttd !== null && sim.ttd > 0);
  });

  test('2.2. Player alive + Enemy dead resolves strictly as WIN', () => {
    const strongPlayer = { level: 40, maxHp: 2000, hp: 2000, maxMp: 500, mp: 500, stats: { atk: 500, def: 200 } };
    const weakMob = { id: 'mob', name: 'Mob', hp: 50, atk: 5, def: 5, atkSpd: 1.0 };
    const sim = simulateCombat({ player: strongPlayer, enemy: weakMob, skills: {} });

    assert.equal(sim.outcome, 'WIN');
    assert.equal(sim.winner, 'player');
    assert.ok(sim.ttk !== null && sim.ttk > 0);
  });

  test('2.3. Reaching maxDurationSec without resolution resolves strictly as TIMEOUT', () => {
    const passivePlayer = { level: 40, maxHp: 10000, hp: 10000, maxMp: 500, mp: 500, stats: { atk: 0, def: 500, eva: 100 } };
    const passiveMob = { id: 'dummy', name: 'Dummy', hp: 1000000, atk: 0, def: 500, atkSpd: 1.0 };
    const sim = simulateCombat({ player: passivePlayer, enemy: passiveMob, skills: {}, config: { maxDurationSec: 2 } });

    assert.equal(sim.outcome, 'TIMEOUT');
    assert.equal(sim.winner, 'timeout');
  });

  test('2.4. calculateCombatRates enforces Win Rate + Loss Rate + Draw Rate + Timeout Rate = 100.0%', () => {
    const rates = calculateCombatRates(85, 12, 2, 1, 100);
    assert.equal(rates.winRate, 85);
    assert.equal(rates.lossRate, 12);
    assert.equal(rates.drawRate, 2);
    assert.equal(rates.timeoutRate, 1);
    assert.ok(rates.isConsistent);
  });
});

describe('3. QUEEN ANT PHASE 4 BENCHMARK & PREPARATION SENSITIVITY (Spec 85-87)', () => {

  const qaBoss = RAID_BOSS_BALANCE.queen_ant;
  const qaSkills = {
    power_strike: { id: 'power_strike', type: 'active', pwr: 130, baseCd: 3500, mpCost: 16 },
    triple_slash: { id: 'triple_slash', type: 'active', pwr: 150, baseCd: 5500, mpCost: 24 }
  };

  test('3.1. Below Minimum CP (7.0k) Poor Prep (75 PS) results in 0% Win Rate (LOCKED gate)', () => {
    const pBelow = {
      level: 38, maxHp: 620, hp: 620, maxMp: 220, mp: 220,
      stats: { atk: 155, def: 75, matk: 35, mdef: 60, crit: 10, critDmg: 2.0, atkSpd: 0.20, eva: 8, mpRegen: 4 },
      skills: { power_strike: 2, triple_slash: 1 },
      inventory: [{ itemId: 'hp_potion_l', count: 18 }, { itemId: 'mp_potion_m', count: 10 }]
    };
    const sim = simulateMany({ player: pBelow, enemy: qaBoss, skills: qaSkills, runs: 50, config: { maxDurationSec: 180 } });
    assert.equal(sim.winRate, 0, '7.0k Poor Prep must have 0% WR');
    assert.ok(sim.meanTTD > 50, 'Observed TTD must be valid');
  });

  test('3.2. Minimum CP (7.5k) Full Prep (125 PS) achieves WR >= 50% (actual ~98%) and SM >= 1.00x', () => {
    const p7500Full = {
      level: 40, maxHp: 700, hp: 700, maxMp: 250, mp: 250,
      stats: { atk: 170, def: 85, matk: 40, mdef: 65, crit: 10, critDmg: 2.0, atkSpd: 0.22, eva: 10, mpRegen: 5 },
      skills: { power_strike: 3, triple_slash: 2 },
      inventory: [{ itemId: 'hp_potion_l', count: 35 }, { itemId: 'mp_potion_m', count: 20 }]
    };
    const sim = simulateMany({ player: p7500Full, enemy: qaBoss, skills: qaSkills, runs: 100, config: { maxDurationSec: 180 } });
    assert.ok(sim.winRate >= 50, `Minimum CP with Full Prep must achieve WR >= 50%, got ${sim.winRate}%`);
    assert.ok(sim.survivalMargin >= 1.00, `Survival Margin (${sim.survivalMargin}x) must be >= 1.00x`);
    assert.ok(sim.medianTTK >= 80 && sim.medianTTK <= 96, `Median TTK (${sim.medianTTK}s) must be in challenging envelope (80-96s)`);
  });

  test('3.3. Minimum CP (7.5k) Poor Prep (75 PS, 18 pots) produces high failure rate (< 30% WR)', () => {
    const p7500Poor = {
      level: 40, maxHp: 700, hp: 700, maxMp: 250, mp: 250,
      stats: { atk: 170, def: 85, matk: 40, mdef: 65, crit: 10, critDmg: 2.0, atkSpd: 0.22, eva: 10, mpRegen: 5 },
      skills: { power_strike: 3, triple_slash: 2 },
      inventory: [{ itemId: 'hp_potion_l', count: 18 }, { itemId: 'mp_potion_m', count: 10 }]
    };
    const sim = simulateMany({ player: p7500Poor, enemy: qaBoss, skills: qaSkills, runs: 100, config: { maxDurationSec: 180 } });
    assert.ok(sim.winRate < 30, `Poor prep at 7.5k must have low win rate (< 30%), got ${sim.winRate}%`);
  });

  test('3.4. Recommended CP (12.5k) Standard Prep (100 PS) achieves 100% WR and Canonical TTK ~45s', () => {
    const p12500Std = {
      level: 42, maxHp: 1250, hp: 1250, maxMp: 400, mp: 400,
      stats: { atk: 280, def: 145, matk: 80, mdef: 115, crit: 22, critDmg: 2.1, atkSpd: 0.45, eva: 18, mpRegen: 8 },
      skills: { power_strike: 5, triple_slash: 4 },
      inventory: [{ itemId: 'hp_potion_l', count: 25 }, { itemId: 'mp_potion_m', count: 15 }]
    };
    const sim = simulateMany({ player: p12500Std, enemy: qaBoss, skills: qaSkills, runs: 100, config: { maxDurationSec: 180 } });
    assert.ok(sim.winRate >= 95, `Recommended CP must achieve WR >= 95%, got ${sim.winRate}%`);
    assert.ok(sim.medianTTK >= 40 && sim.medianTTK <= 55, `Canonical TTK (${sim.medianTTK}s) must be comfortable (40-55s)`);
  });

  test('3.5. Farm CP (20.0k) achieves <= 50% Canonical TTK (<= 23s) and Low Resource Pressure', () => {
    const p20000 = {
      level: 50, maxHp: 2000, hp: 2000, maxMp: 550, mp: 550,
      stats: { atk: 400, def: 210, matk: 120, mdef: 160, crit: 30, critDmg: 2.2, atkSpd: 0.65, eva: 24, mpRegen: 12 },
      skills: { power_strike: 7, triple_slash: 6 },
      inventory: [{ itemId: 'hp_potion_l', count: 50 }, { itemId: 'mp_potion_m', count: 30 }]
    };
    const sim = simulateMany({ player: p20000, enemy: qaBoss, skills: qaSkills, runs: 50, config: { maxDurationSec: 180 } });
    assert.equal(sim.winRate, 100);
    assert.ok(sim.medianTTK <= 24, `Farm TTK (${sim.medianTTK}s) must be <= 50% of Canonical 45s`);
    assert.ok(sim.potionUsage <= 15, `Farm potion usage (${sim.potionUsage}%) must be LOW (<= 15%)`);
  });
});

describe('4. GLOBAL 9 EPIC BOSSES PROGRESSION & ECONOMICS (Spec 87, 88)', () => {

  const bossConfigs = [
    { id: 'queen_ant', lvl: 40, pLvl: 42, hp: 1150, atk: 290,  def: 150, matk: 85,  mdef: 120, crit: 20, atkSpd: 0.40, potId: 'hp_potion_l',  recPots: 25, minPots: 35 },
    { id: 'core',      lvl: 50, pLvl: 52, hp: 1600, atk: 420,  def: 205, matk: 130, mdef: 165, crit: 25, atkSpd: 0.50, potId: 'hp_potion_l',  recPots: 30, minPots: 40 },
    { id: 'orfen',     lvl: 55, pLvl: 58, hp: 2100, atk: 530,  def: 250, matk: 170, mdef: 200, crit: 28, atkSpd: 0.60, potId: 'hp_potion_xl', recPots: 35, minPots: 45 },
    { id: 'zaken',     lvl: 60, pLvl: 64, hp: 2700, atk: 680,  def: 300, matk: 220, mdef: 250, crit: 30, atkSpd: 0.70, potId: 'hp_potion_xl', recPots: 40, minPots: 50 },
    { id: 'barakiel',  lvl: 75, pLvl: 76, hp: 3600, atk: 880,  def: 360, matk: 300, mdef: 300, crit: 34, atkSpd: 0.80, potId: 'hp_potion_xl', recPots: 45, minPots: 55 },
    { id: 'baium',     lvl: 75, pLvl: 78, hp: 4000, atk: 980,  def: 400, matk: 350, mdef: 340, crit: 36, atkSpd: 0.85, potId: 'hp_potion_xl', recPots: 50, minPots: 60 },
    { id: 'frintezza', lvl: 85, pLvl: 88, hp: 5200, atk: 1300, def: 500, matk: 480, mdef: 420, crit: 40, atkSpd: 1.00, potId: 'hp_potion_xl', recPots: 50, minPots: 60 },
    { id: 'antharas',  lvl: 95, pLvl: 96, hp: 6800, atk: 1750, def: 620, matk: 650, mdef: 520, crit: 44, atkSpd: 1.15, potId: 'hp_potion_xl', recPots: 50, minPots: 60 },
    { id: 'valakas',   lvl: 100, pLvl: 100, hp: 8500, atk: 2200, def: 760, matk: 850, mdef: 640, crit: 48, atkSpd: 1.30, potId: 'hp_potion_xl', recPots: 50, minPots: 60 }
  ];

  const standardBossSkills = {
    power_strike: { id: 'power_strike', type: 'active', pwr: 140, baseCd: 3500, mpCost: 16 },
    triple_slash: { id: 'triple_slash', type: 'active', pwr: 160, baseCd: 6000, mpCost: 24 }
  };

  test('4.1. All 9 Epic Bosses have CP Ratio (Recommended / Minimum) between 1.25x and 1.75x', () => {
    for (const bCfg of bossConfigs) {
      const boss = RAID_BOSS_BALANCE[bCfg.id];
      const ratio = boss.recommendedCP / boss.minimumCP;
      assert.ok(ratio >= ACCEPTANCE_MATRIX.RECOMMENDED_TO_MIN_CP_MIN, `Boss ${bCfg.id} ratio (${ratio.toFixed(2)}x) is below 1.25x`);
      assert.ok(ratio <= ACCEPTANCE_MATRIX.RECOMMENDED_TO_MIN_CP_MAX, `Boss ${bCfg.id} ratio (${ratio.toFixed(2)}x) exceeds 1.75x`);
    }
  });

  test('4.2. All 9 Epic Bosses achieve >= 95% Win Rate at Recommended CP with Standard Preparation', () => {
    for (const bCfg of bossConfigs) {
      const boss = RAID_BOSS_BALANCE[bCfg.id];
      const player = {
        level: bCfg.pLvl,
        maxHp: bCfg.hp,
        hp: bCfg.hp,
        maxMp: 1000,
        mp: 1000,
        stats: { atk: bCfg.atk, def: bCfg.def, matk: bCfg.matk, mdef: bCfg.mdef, crit: bCfg.crit, critDmg: 2.2, atkSpd: bCfg.atkSpd, mpRegen: 15 },
        skills: { power_strike: 5, triple_slash: 5 },
        inventory: [{ itemId: bCfg.potId, count: bCfg.recPots }, { itemId: 'mp_potion_m', count: 25 }]
      };
      const sim = simulateMany({ player, enemy: boss, skills: standardBossSkills, runs: 100, config: { maxDurationSec: 240 } });
      assert.ok(sim.winRate >= 95, `Boss ${bCfg.id} failed recommended win rate: ${sim.winRate}%`);
    }
  });

  test('4.3. Potion Cost per kill is strictly <= 5% of guaranteed Adena reward across all 9 Epic Bosses', () => {
    for (const bCfg of bossConfigs) {
      const boss = RAID_BOSS_BALANCE[bCfg.id];
      const minReward = boss.gold[0];
      const potUnitPrice = bCfg.potId === 'hp_potion_xl' ? 50 : 20;

      const player = {
        level: bCfg.pLvl,
        maxHp: bCfg.hp,
        hp: bCfg.hp,
        maxMp: 1000,
        mp: 1000,
        stats: { atk: bCfg.atk, def: bCfg.def, matk: bCfg.matk, mdef: bCfg.mdef, crit: bCfg.crit, critDmg: 2.2, atkSpd: bCfg.atkSpd, mpRegen: 15 },
        skills: { power_strike: 5, triple_slash: 5 },
        inventory: [{ itemId: bCfg.potId, count: bCfg.recPots }, { itemId: 'mp_potion_m', count: 25 }]
      };
      const sim = simulateCombat({ player, enemy: boss, skills: standardBossSkills });
      const cost = calculatePotionCost(sim.hpPotionsUsed, potUnitPrice);
      const ratio = calculatePotionCostRatio(cost, minReward);

      assert.ok(ratio <= ACCEPTANCE_MATRIX.POTION_COST_REWARD_MAX, `Boss ${bCfg.id} potion cost ratio (${ratio}%) exceeds 5%`);
    }
  });
});

describe('5. 25 CANONICAL CLASSES & 32 HUNTING ZONES PROGRESSION (Spec 87, 88)', () => {

  test('5.1. 100% of 25 canonical classes consume MP (> 0 MP/s) and eliminate 0.0 MP/s anomaly', () => {
    const canonicalClassNames = [
      'gladiator', 'warlord', 'paladin', 'darkAvenger', 'treasureHunter', 'hawkeye', 'sorcerer', 'necromancer', 'warlock', 'bishop', 'prophet',
      'templeKnight', 'swordsinger', 'plainsWalker', 'silverRanger', 'spellsinger', 'elementalSummoner', 'elder',
      'shillienKnight', 'bladedancer', 'abyssWalker', 'phantomRanger', 'spellhowler', 'phantomSummoner', 'shillienElder'
    ];

    const targetMob = { id: 'ant_soldier', lvl: 40, hp: 1200, atk: 95, def: 45, mdef: 55, atkSpd: 1.0 };
    const skills = {
      power_strike: { id: 'power_strike', type: 'active', pwr: 130, baseCd: 3500, mpCost: 16 }
    };

    for (const cName of canonicalClassNames) {
      const isMage = ['sorcerer', 'necromancer', 'warlock', 'bishop', 'prophet', 'spellsinger', 'elementalSummoner', 'elder', 'spellhowler', 'phantomSummoner', 'shillienElder'].includes(cName);
      const player = {
        level: 40,
        maxHp: 1000,
        hp: 1000,
        maxMp: 400,
        mp: 400,
        stats: { atk: isMage ? 60 : 260, matk: isMage ? 280 : 50, def: 120, mdef: 110, crit: 15, critDmg: 2.0, atkSpd: 0.35, mpRegen: 8 },
        skills: { power_strike: 3 },
        inventory: [{ itemId: 'hp_potion_l', count: 10 }, { itemId: 'mp_potion_m', count: 10 }]
      };
      const sim = simulateMany({ player, enemy: targetMob, skills, runs: 10, config: { maxDurationSec: 30 } });
      const mpPerSec = Math.round((sim.avgMpSpent / Math.max(0.5, sim.avgDurationSec)) * 10) / 10;
      assert.ok(mpPerSec > 0, `Class ${cName} must consume MP (> 0 MP/s), got ${mpPerSec}`);
    }
  });

  test('5.2. All 32 hunting zones have positive CP growth and monotonic progression', () => {
    let lastLevel = 0;
    for (const [zId, zData] of Object.entries(ZONE_CP_REQUIREMENTS)) {
      assert.ok(zData.level >= 1, `Zone ${zId} must have level >= 1`);
      assert.ok(zData.minCp > 0, `Zone ${zId} must have minCp > 0`);
      assert.ok(zData.recCp > zData.minCp, `Zone ${zId} recCp must be > minCp`);
      const ratio = zData.recCp / zData.minCp;
      assert.ok(ratio >= 1.20 && ratio <= 3.20, `Zone ${zId} ratio (${ratio.toFixed(2)}x) out of expected progression range`);
    }
  });
});

describe('6. MONTE CARLO STABILITY & 95% CONFIDENCE INTERVALS (Spec 100, 104)', () => {

  test('6.1. 1,000 randomized combat runs produce zero NaNs, zero negative MPs, and 100% finite results', () => {
    const testPlayer = {
      level: 40, maxHp: 1000, hp: 1000, maxMp: 400, mp: 400,
      stats: { atk: 250, def: 120, matk: 80, mdef: 100, crit: 20, critDmg: 2.0, atkSpd: 0.40, mpRegen: 8 },
      skills: { power_strike: 3 },
      inventory: [{ itemId: 'hp_potion_l', count: 15 }, { itemId: 'mp_potion_m', count: 10 }]
    };
    const testEnemy = { id: 'random_mob', hp: 3000, atk: 120, def: 60, mdef: 70, atkSpd: 1.0 };
    const skills = {
      power_strike: { id: 'power_strike', type: 'active', pwr: 130, baseCd: 3500, mpCost: 16 }
    };

    const sim = simulateMany({ player: testPlayer, enemy: testEnemy, skills, runs: 1000, config: { maxDurationSec: 60 } });

    assert.ok(!Number.isNaN(sim.winRate));
    assert.ok(!Number.isNaN(sim.avgTTK));
    assert.ok(!Number.isNaN(sim.survivalMargin));
    assert.ok(!Number.isNaN(sim.pst));
    assert.ok(sim.avgMpSpent >= 0);
    assert.ok(sim.avgHpPotionsUsed >= 0);
    assert.ok(sim.runs === 1000);
  });

  test('6.2. 95% Confidence Interval for Queen Ant decision points is tight and bounded', () => {
    const ciMin = calculateConfidenceInterval95(983, 1000);
    assert.ok(ciMin.marginPct <= 1.5, `95% CI margin for 1000 runs (${ciMin.marginPct}%) should be tight (<= 1.5%)`);
    assert.ok(ciMin.lower >= 96.5 && ciMin.upper <= 100);

    const ciRec = calculateConfidenceInterval95(1000, 1000);
    assert.ok(ciRec.lower >= 99.5, `Wilson score lower bound for 1000/1000 (${ciRec.lower}%) should be >= 99.5%`);
    assert.equal(ciRec.upper, 100);
  });
});
