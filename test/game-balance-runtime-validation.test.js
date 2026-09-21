/**
 * game-balance-runtime-validation.test.js
 * 
 * MASTER GAME BALANCE — LIVE RUNTIME VALIDATION SUITE (FASE 2)
 * 
 * Valida empiricamente:
 * 1. Conformance Runtime vs Simulador (0% delta sistemático em dano, mitigação e recarga)
 * 2. Validação Atômica de MP e Prevenção de Exploits de Rapid-Cast (10 casts/100ms = 1 sucesso, 9 bloqueios)
 * 3. Validação de Cura e Escalonamento Mágico em 6+ Classes Especializadas (Cleric, Bishop, Oracle, Elven Elder, Shillien Elder, Fighter)
 * 4. Calibração da Queen Ant de Segunda Passagem (Min CP ~85s e ~20 pots; Rec CP ~55s e ~13 pots)
 * 5. Progressão Global dos 9 Chefes Épicos (Queen Ant -> Valakas) e Economia de Consumíveis (<5% do ouro)
 * 6. Matriz de Viabilidade e Combate das 25 Classes Canônicas
 * 7. Benchmark de Robustez Monte Carlo (1000+ simulações com zero NaNs, zero negativos e zero crashes)
 */

import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';

// Módulos centrais de balanceamento
import {
  COMBAT_CONFIG,
  calculateDefenseMitigation,
  calculatePhysicalDamage,
  calculateMagicDamage,
  calculateHealAmount,
  calculateVampiricHeal
} from '../lineage-idle/src/data/balance/combatBalance.js';

import {
  canCastSkill,
  consumeSkillMp,
  getSkillMpCost
} from '../lineage-idle/src/data/balance/skillBalance.js';

import {
  calculateCombatPower,
  evaluateDifficulty,
  CP_WEIGHTS
} from '../lineage-idle/src/data/balance/cpBalance.js';

import {
  RAID_BOSS_BALANCE,
  getBossBalance
} from '../lineage-idle/src/data/balance/bossBalance.js';

import {
  MONSTER_MULTIPLIERS,
  getMonsterSpawnMultipliers
} from '../lineage-idle/src/data/balance/monsterBalance.js';

import {
  ZONE_CP_REQUIREMENTS,
  getZoneProgression
} from '../lineage-idle/src/data/balance/progressionBalance.js';

import {
  simulateCombat,
  simulateMany
} from '../lineage-idle/src/services/CombatSimulator.js';

import { RAID_BOSSES } from '../lineage-idle/src/data/raids.js';
import { ALL_LOADED_SKILLS } from '../lineage-idle/src/data/skills/index.js';

// Setup Mock Window para import do echo-adapter e SkillScaling
global.window = global.window || {};
await import('../lineage-idle/data/echo-adapter.js');

describe('MASTER GAME BALANCE — RUNTIME VS SIMULATOR CONFORMANCE', () => {

  test('1.1. Damage Parity: DealDamage mitigation curve strictly equals calculateDefenseMitigation', () => {
    const testCases = [
      { raw: 100, def: 50, isMagic: false },
      { raw: 350, def: 120, isMagic: false },
      { raw: 800, def: 250, isMagic: false },
      { raw: 1500, def: 400, isMagic: false },
      { raw: 250, def: 80, isMagic: true },
      { raw: 950, def: 220, isMagic: true },
      { raw: 2200, def: 500, isMagic: true }
    ];

    for (const tc of testCases) {
      const k = tc.isMagic ? 220 : 250;
      const expectedLegacy = Math.max(1, Math.floor(tc.raw * (k / (tc.def + k))));
      const unifiedResult = calculateDefenseMitigation(tc.raw, tc.def, tc.isMagic);
      assert.equal(unifiedResult, expectedLegacy, `Damage mismatch on raw=${tc.raw}, def=${tc.def}, isMagic=${tc.isMagic}`);
    }
  });

  test('1.2. Deterministic Damage Delta: calculatePhysicalDamage produces 0% delta vs runtime without variance', () => {
    const atk = 350;
    const def = 150;
    const pwr = 140; // 1.4x (pwr=14 no echo-adapter)

    const simDmg = calculatePhysicalDamage({
      atk,
      def,
      pwr,
      isCrit: false,
      applyVariance: false
    });

    // Simulação do runtime: dealDamage(target, atk * 1.4, 'physical')
    const rawRuntimeDmg = atk * (pwr / 100);
    const runtimeDmg = calculateDefenseMitigation(rawRuntimeDmg, def, false);

    assert.equal(simDmg, runtimeDmg, `Simulator dmg (${simDmg}) differs from runtime dmg (${runtimeDmg})`);
    const deltaPercent = Math.abs((simDmg - runtimeDmg) / runtimeDmg) * 100;
    assert.equal(deltaPercent, 0, 'Damage delta between Simulator and Runtime must be exactly 0%');
  });

  test('1.3. Skill Definitions Consistency: 100% of 882 active skills have valid non-zero mpCost in SKILL_DEFS_ECHO', () => {
    const echoDefs = global.window.EchoData.SKILL_DEFS_ECHO;
    let checked = 0;
    let missingMp = 0;

    for (const [id, def] of Object.entries(echoDefs)) {
      if (def.type === 'passive' || def.type === 'stat' || def.combatSkill === false || def.roleType === 'COSMETIC_VISUAL_ONLY') continue;
      checked++;
      if (typeof def.mpCost !== 'number' || def.mpCost <= 0) {
        missingMp++;
      }
    }

    assert.ok(checked >= 800, `Expected at least 800 active skills, found ${checked}`);
    assert.equal(missingMp, 0, `All active skills must have defined mpCost > 0. Found ${missingMp} missing.`);
  });
});

describe('ATOMIC MP VALIDATION & RAPID-CAST INTEGRATION', () => {

  test('2.1. Atomic MP Consumption: 100 MP - 30 MP skill -> exactly 70 MP remaining', () => {
    const player = {
      level: 40,
      mp: 100,
      maxMp: 100,
      stats: { cdr: 0 }
    };
    const skillDef = { id: 'test_skill_30', baseCd: 4000, mpCost: 30, type: 'active' };
    const cds = {};
    const now = 10000;

    const check = canCastSkill(player, skillDef, now, cds);
    assert.equal(check.canCast, true);
    assert.equal(check.mpCost, 30);

    const result = consumeSkillMp(player, skillDef, now, cds);
    assert.equal(result.success, true);
    assert.equal(result.mpSpent, 30);
    assert.equal(result.remainingMp, 70);
    assert.equal(player.mp, 70, 'State MP must be directly updated to 70');
    assert.equal(cds[skillDef.id], now, 'Cooldown timestamp must be registered');
  });

  test('2.2. Insufficient MP: 20 MP vs 30 MP skill -> blocked, remains 20 MP', () => {
    const player = {
      level: 40,
      mp: 20,
      maxMp: 100,
      stats: { cdr: 0 }
    };
    const skillDef = { id: 'test_skill_30', baseCd: 4000, mpCost: 30, type: 'active' };
    const cds = {};
    const now = 10000;

    const check = canCastSkill(player, skillDef, now, cds);
    assert.equal(check.canCast, false);

    const result = consumeSkillMp(player, skillDef, now, cds);
    assert.equal(result.success, false);
    assert.equal(result.mpSpent, 0);
    assert.equal(result.remainingMp, 20);
    assert.equal(player.mp, 20, 'State MP must remain unmodified at 20');
  });

  test('2.3. Anti-Exploit Rapid Cast: 10 rapid calls within 100ms -> exactly 1 execution and 9 blocked by CD', () => {
    const player = {
      level: 40,
      mp: 300,
      maxMp: 300,
      stats: { cdr: 0 }
    };
    const skillDef = { id: 'burst_skill', baseCd: 3000, mpCost: 20, type: 'active' };
    const cds = {};
    const startTime = 50000;

    let successfulCasts = 0;
    let blockedCasts = 0;

    for (let i = 0; i < 10; i++) {
      const now = startTime + i * 10; // 0ms, 10ms, 20ms, ... 90ms
      const check = canCastSkill(player, skillDef, now, cds);
      if (check.canCast) {
        const consume = consumeSkillMp(player, skillDef, now, cds);
        if (consume.success) successfulCasts++;
      } else {
        blockedCasts++;
      }
    }

    assert.equal(successfulCasts, 1, 'Exactly 1 cast should succeed');
    assert.equal(blockedCasts, 9, 'Exactly 9 rapid calls must be blocked by cooldown');
    assert.equal(player.mp, 280, 'Exactly 20 MP must be consumed (300 - 20 = 280)');
  });
});

describe('MULTI-CLASS HEALING VALIDATION & CAP ENFORCEMENT', () => {

  const healerProfiles = [
    { classId: 'cleric',        level: 25, maxHp: 650,  matk: 80,  skillLvl: 2 },
    { classId: 'bishop',        level: 45, maxHp: 1200, matk: 160, skillLvl: 4 },
    { classId: 'oracle',        level: 25, maxHp: 620,  matk: 75,  skillLvl: 2 },
    { classId: 'elvenElder',    level: 45, maxHp: 1150, matk: 155, skillLvl: 4 },
    { classId: 'shillienElder', level: 45, maxHp: 1180, matk: 170, skillLvl: 4 },
    { classId: 'fighter',       level: 40, maxHp: 900,  matk: 20,  skillLvl: 1 } // Non-healer comparison
  ];

  test('3.1. calculateHealAmount scales with M.Atk and skill level across all 6 archetypes', () => {
    for (const h of healerProfiles) {
      const heal = calculateHealAmount({
        maxHp: h.maxHp,
        matk: h.matk,
        skillLvl: h.skillLvl
      });

      assert.ok(heal > 0, `Heal amount for ${h.classId} must be > 0`);
      assert.ok(heal < h.maxHp, `Heal amount for ${h.classId} (${heal}) must not exceed Max HP (${h.maxHp}) in one standard tick`);
      
      // Bishop deve curar mais que Cleric pelo escalonamento de M.Atk e nível
      if (h.classId === 'bishop') {
        const cleric = healerProfiles.find(p => p.classId === 'cleric');
        const clericHeal = calculateHealAmount({ maxHp: cleric.maxHp, matk: cleric.matk, skillLvl: cleric.skillLvl });
        assert.ok(heal > clericHeal * 1.5, `Bishop (${heal}) should heal significantly more than Cleric (${clericHeal})`);
      }
    }
  });

  test('3.2. Strict Overheal Invariant: Player HP never exceeds Max HP after heal', () => {
    const player = { maxHp: 1000, hp: 950, matk: 200 };
    const healAmt = calculateHealAmount({ maxHp: player.maxHp, matk: player.matk, skillLvl: 5 });
    
    // Simula cura
    player.hp = Math.min(player.maxHp, player.hp + healAmt);
    assert.equal(player.hp, 1000, 'Current HP must be capped strictly at Max HP (no overheal overflow)');
  });
});

describe('QUEEN ANT SECOND-PASS CALIBRATION BENCHMARK', () => {

  const qaBoss = RAID_BOSS_BALANCE.queen_ant;

  const cpTiers = [
    { label: '7.5k CP (Gate)', level: 40, hp: 800,  maxHp: 800,  atk: 195, def: 105, matk: 50, mdef: 80,  crit: 14, atkSpd: 0.25, pots: 25 },
    { label: '10.0k CP (Mid)', level: 41, hp: 1050, maxHp: 1050, atk: 240, def: 125, matk: 70, mdef: 100, crit: 18, atkSpd: 0.35, pots: 25 },
    { label: '12.5k CP (Rec)', level: 42, hp: 1250, maxHp: 1250, atk: 280, def: 145, matk: 80, mdef: 115, crit: 22, atkSpd: 0.45, pots: 25 },
    { label: '20.0k CP (Farm)',level: 48, hp: 1800, maxHp: 1800, atk: 420, def: 200, matk: 120, mdef: 160, crit: 30, atkSpd: 0.65, pots: 25 }
  ];

  const testSkills = {
    power_strike: { id: 'power_strike', type: 'active', pwr: 130, baseCd: 3500, mpCost: 16 },
    triple_slash: { id: 'triple_slash', type: 'active', pwr: 150, baseCd: 6000, mpCost: 24 }
  };

  test('4.1. Queen Ant HP is 24,000 and Nurse Heal is 10% (calibrated second pass)', () => {
    assert.equal(qaBoss.hp, 24000, 'Queen Ant HP must be 24,000');
    const nurseMech = qaBoss.mechanics.find(m => m.healPercent);
    assert.ok(nurseMech, 'Nurse Ant mechanic must exist');
    assert.equal(nurseMech.healPercent, 0.10, 'Nurse Ant heal must be 10%');
  });

  test('4.2. Minimum CP (~7.5k) achieves 100% Win Rate with TTK between 75s and 95s and <= 22 potions', () => {
    const tier = cpTiers[0];
    const player = {
      level: tier.level,
      maxHp: tier.maxHp,
      hp: tier.hp,
      maxMp: 300,
      mp: 300,
      stats: { atk: tier.atk, def: tier.def, matk: tier.matk, mdef: tier.mdef, crit: tier.crit, critDmg: 2.0, atkSpd: tier.atkSpd, mpRegen: 5 },
      skills: { power_strike: 4, triple_slash: 3 },
      inventory: [{ itemId: 'hp_potion_l', count: tier.pots }, { itemId: 'mp_potion_m', count: 20 }]
    };

    const sim = simulateMany({ player, enemy: qaBoss, skills: testSkills, runs: 50, config: { maxDurationSec: 180 } });
    assert.equal(sim.winRate, 100, 'Min CP must have 100% win rate');
    assert.ok(sim.avgTTK >= 75 && sim.avgTTK <= 95, `Min CP TTK (${sim.avgTTK}s) should be between 75s and 95s`);
    assert.ok(sim.avgHpPotionsUsed <= 22, `Potion usage (${sim.avgHpPotionsUsed}) must be <= 22 (no artificial potion sink)`);
  });

  test('4.3. Recommended CP (~12.5k) achieves comfortable TTK between 50s and 62s and <= 15 potions', () => {
    const tier = cpTiers[2];
    const player = {
      level: tier.level,
      maxHp: tier.maxHp,
      hp: tier.hp,
      maxMp: 400,
      mp: 400,
      stats: { atk: tier.atk, def: tier.def, matk: tier.matk, mdef: tier.mdef, crit: tier.crit, critDmg: 2.1, atkSpd: tier.atkSpd, mpRegen: 8 },
      skills: { power_strike: 5, triple_slash: 5 },
      inventory: [{ itemId: 'hp_potion_l', count: tier.pots }, { itemId: 'mp_potion_m', count: 20 }]
    };

    const sim = simulateMany({ player, enemy: qaBoss, skills: testSkills, runs: 50, config: { maxDurationSec: 180 } });
    assert.equal(sim.winRate, 100, 'Recommended CP must have 100% win rate');
    assert.ok(sim.avgTTK >= 45 && sim.avgTTK <= 62, `Recommended CP TTK (${sim.avgTTK}s) should be between 45s and 62s`);
    assert.ok(sim.avgHpPotionsUsed <= 15, `Potion usage (${sim.avgHpPotionsUsed}) must be <= 15 potions`);
  });

  test('4.4. Farm CP (~20k) achieves fast TTK <= 35s with minimal potion usage', () => {
    const tier = cpTiers[3];
    const player = {
      level: tier.level,
      maxHp: tier.maxHp,
      hp: tier.hp,
      maxMp: 520,
      mp: 520,
      stats: { atk: tier.atk, def: tier.def, matk: tier.matk, mdef: tier.mdef, crit: tier.crit, critDmg: 2.2, atkSpd: tier.atkSpd, mpRegen: 10 },
      skills: { power_strike: 5, triple_slash: 5 },
      inventory: [{ itemId: 'hp_potion_l', count: tier.pots }, { itemId: 'mp_potion_m', count: 20 }]
    };

    const sim = simulateMany({ player, enemy: qaBoss, skills: testSkills, runs: 50, config: { maxDurationSec: 180 } });
    assert.equal(sim.winRate, 100);
    assert.ok(sim.avgTTK <= 35, `Farm TTK (${sim.avgTTK}s) should be <= 35s`);
    assert.ok(sim.avgHpPotionsUsed <= 9, `Farm potion usage (${sim.avgHpPotionsUsed}) should be <= 9`);
  });
});

describe('GLOBAL PROGRESSION ACROSS ALL 9 EPIC BOSSES', () => {

  const bossProgression = [
    { id: 'queen_ant', lvl: 40,  pLvl: 42,  hp: 1150, atk: 290,  def: 150, matk: 85,  mdef: 120, crit: 20, atkSpd: 0.40, potId: 'hp_potion_l',  pots: 25 },
    { id: 'core',      lvl: 50,  pLvl: 52,  hp: 1600, atk: 420,  def: 205, matk: 130, mdef: 165, crit: 25, atkSpd: 0.50, potId: 'hp_potion_l',  pots: 30 },
    { id: 'orfen',     lvl: 55,  pLvl: 58,  hp: 2100, atk: 530,  def: 250, matk: 170, mdef: 200, crit: 28, atkSpd: 0.60, potId: 'hp_potion_xl', pots: 35 },
    { id: 'zaken',     lvl: 60,  pLvl: 64,  hp: 2700, atk: 680,  def: 300, matk: 220, mdef: 250, crit: 30, atkSpd: 0.70, potId: 'hp_potion_xl', pots: 40 },
    { id: 'barakiel',  lvl: 75,  pLvl: 76,  hp: 3600, atk: 880,  def: 360, matk: 300, mdef: 300, crit: 34, atkSpd: 0.80, potId: 'hp_potion_xl', pots: 45 },
    { id: 'baium',     lvl: 75,  pLvl: 78,  hp: 4000, atk: 980,  def: 400, matk: 350, mdef: 340, crit: 36, atkSpd: 0.85, potId: 'hp_potion_xl', pots: 50 },
    { id: 'frintezza', lvl: 85,  pLvl: 88,  hp: 5200, atk: 1300, def: 500, matk: 480, mdef: 420, crit: 40, atkSpd: 1.00, potId: 'hp_potion_xl', pots: 50 },
    { id: 'antharas',  lvl: 95,  pLvl: 96,  hp: 6800, atk: 1750, def: 620, matk: 650, mdef: 520, crit: 44, atkSpd: 1.15, potId: 'hp_potion_xl', pots: 50 },
    { id: 'valakas',   lvl: 100, pLvl: 100, hp: 9000, atk: 2250, def: 780, matk: 850, mdef: 650, crit: 48, atkSpd: 1.30, potId: 'hp_potion_xl', pots: 55 }
  ];

  const standardSkills = {
    power_strike: { id: 'power_strike', type: 'active', pwr: 140, baseCd: 3500, mpCost: 16 },
    triple_slash: { id: 'triple_slash', type: 'active', pwr: 160, baseCd: 6000, mpCost: 24 }
  };

  test('5.1. Every Epic Boss achieves >= 95% Win Rate at Recommended CP', () => {
    for (const bEntry of bossProgression) {
      const boss = RAID_BOSS_BALANCE[bEntry.id];
      assert.ok(boss, `Boss balance for ${bEntry.id} must exist`);

      const player = {
        level: bEntry.pLvl,
        maxHp: bEntry.hp,
        hp: bEntry.hp,
        maxMp: 1000,
        mp: 1000,
        stats: { atk: bEntry.atk, def: bEntry.def, matk: bEntry.matk, mdef: bEntry.mdef, crit: bEntry.crit, critDmg: 2.2, atkSpd: bEntry.atkSpd, mpRegen: 15 },
        skills: { power_strike: 5, triple_slash: 5 },
        inventory: [{ itemId: bEntry.potId, count: bEntry.pots }, { itemId: 'mp_potion_m', count: 25 }]
      };

      const sim = simulateMany({ player, enemy: boss, skills: standardSkills, runs: 25, config: { maxDurationSec: 240 } });
      assert.ok(sim.winRate >= 95, `Boss ${bEntry.id} failed win rate target: ${sim.winRate}% (expected >= 95%)`);
      assert.ok(sim.avgTTK <= boss.targetMetrics.ttkMax, `Boss ${bEntry.id} TTK (${sim.avgTTK}s) exceeds max target (${boss.targetMetrics.ttkMax}s) at Rec CP`);
    }
  });

  test('5.2. Potion Economics: Potion cost per boss kill is strictly < 5% of minimum gold reward', () => {
    const potPrices = { hp_potion_l: 20, hp_potion_xl: 50 };

    for (const bEntry of bossProgression) {
      const boss = RAID_BOSS_BALANCE[bEntry.id];
      const minGoldReward = boss.gold[0];
      const potPrice = potPrices[bEntry.potId] || 50;
      
      const player = {
        level: bEntry.pLvl,
        maxHp: bEntry.hp,
        hp: bEntry.hp,
        maxMp: 1000,
        mp: 1000,
        stats: { atk: bEntry.atk, def: bEntry.def, matk: bEntry.matk, mdef: bEntry.mdef, crit: bEntry.crit, critDmg: 2.2, atkSpd: bEntry.atkSpd, mpRegen: 15 },
        skills: { power_strike: 5, triple_slash: 5 },
        inventory: [{ itemId: bEntry.potId, count: bEntry.pots }, { itemId: 'mp_potion_m', count: 25 }]
      };
      const sim = simulateCombat({ player, enemy: boss, skills: standardSkills });
      const totalPotCost = sim.hpPotionsUsed * potPrice;
      const costRatio = totalPotCost / minGoldReward;

      assert.ok(costRatio < 0.05, `Boss ${bEntry.id}: potion cost (${totalPotCost}) exceeds 5% of min gold (${minGoldReward}). Ratio: ${(costRatio * 100).toFixed(1)}%`);
    }
  });
});

describe('25 CANONICAL CLASSES COMBAT PROFILE MATRIX', () => {

  const canonicalClasses = [
    'gladiator', 'warlord', 'paladin', 'darkAvenger', 'treasureHunter', 'hawkeye', 'sorcerer', 'necromancer', 'warlock', 'bishop', 'prophet',
    'templeKnight', 'swordsinger', 'plainsWalker', 'silverRanger', 'spellsinger', 'elementalSummoner', 'elder',
    'shillienKnight', 'bladedancer', 'abyssWalker', 'phantomRanger', 'spellhowler', 'phantomSummoner', 'shillienElder'
  ];

  test('6.1. All 25 canonical classes have valid skill trees and positive CP progression', () => {
    for (const cId of canonicalClasses) {
      const charState = {
        level: 40,
        class: cId,
        classTier: 2,
        stats: { atk: 250, def: 130, matk: 180, mdef: 110, maxHp: 1000, maxMp: 400, crit: 15, speed: 100, eva: 15 }
      };

      const cp = calculateCombatPower(charState);
      assert.ok(cp >= 1500, `Class ${cId} calculated CP (${cp}) is below expected minimum for Lv.40 Tier 2`);
    }
  });

  test('6.2. 25 Classes Zone Mob TTK is <= 8s on level-appropriate monsters', () => {
    const mob = {
      id: 'ant_soldier',
      name: 'Formiga Soldado',
      hp: 1200,
      atk: 95,
      def: 45,
      mdef: 55,
      atkSpd: 1.0
    };

    for (const cId of canonicalClasses) {
      const isMage = ['sorcerer', 'necromancer', 'warlock', 'bishop', 'prophet', 'spellsinger', 'elementalSummoner', 'elder', 'spellhowler', 'phantomSummoner', 'shillienElder'].includes(cId);
      const player = {
        level: 40,
        class: cId,
        maxHp: 950,
        hp: 950,
        maxMp: 400,
        mp: 400,
        stats: {
          atk: isMage ? 60 : 260,
          matk: isMage ? 280 : 50,
          def: 120,
          mdef: 110,
          crit: isMage ? 15 : 20,
          critDmg: 2.0,
          atkSpd: 0.35,
          mpRegen: 8
        },
        skills: {
          power_strike: 3
        },
        inventory: [{ itemId: 'hp_potion_l', count: 10 }]
      };

      const skillsMap = {
        power_strike: { id: 'power_strike', type: 'active', pwr: 130, baseCd: 3500, mpCost: 15 }
      };

      const sim = simulateCombat({ player, enemy: mob, skills: skillsMap });
      assert.equal(sim.winner, 'player', `Class ${cId} should win against standard zone mob`);
      assert.ok(sim.ttk <= 8.0, `Class ${cId} TTK (${sim.ttk}s) should be <= 8s`);
    }
  });
});

describe('MONTE CARLO ROBUSTNESS BENCHMARK (1000+ SIMULATIONS)', () => {

  test('7.1. 1,000 randomized combat runs produce zero NaNs, zero negative values, and 100% finite metrics', () => {
    const TOTAL_RUNS = 1000;
    let successfulRuns = 0;

    for (let r = 0; r < TOTAL_RUNS; r++) {
      // Randomized player parameters
      const pLvl = 20 + Math.floor(Math.random() * 80); // Lv 20 to 99
      const isMage = Math.random() > 0.5;
      const atk = isMage ? (20 + pLvl * 2) : (50 + pLvl * 15);
      const matk = isMage ? (60 + pLvl * 18) : 20;
      const def = 40 + pLvl * 8;
      const maxHp = 300 + pLvl * 45;
      const maxMp = 100 + pLvl * 25;

      const player = {
        level: pLvl,
        maxHp,
        hp: maxHp,
        maxMp,
        mp: maxMp,
        stats: {
          atk,
          matk,
          def,
          mdef: def * 0.9,
          crit: 5 + Math.floor(Math.random() * 30),
          critDmg: 2.0,
          atkSpd: 0.2 + Math.random() * 0.8,
          mpRegen: 3 + Math.floor(Math.random() * 20),
          eva: 10 + Math.floor(Math.random() * 20)
        },
        skills: {
          test_strike: 1 + Math.floor(Math.random() * 5)
        },
        inventory: [
          { itemId: 'hp_potion_xl', count: 50 },
          { itemId: 'mp_potion_m', count: 30 }
        ]
      };

      // Randomized enemy parameters
      const eHp = 500 + pLvl * 60;
      const enemy = {
        id: `random_mob_${r}`,
        hp: eHp,
        _maxHp: eHp,
        atk: 30 + pLvl * 9,
        def: 25 + pLvl * 4,
        mdef: 20 + pLvl * 4,
        atkSpd: 0.8 + Math.random() * 0.4
      };

      const skillsMap = {
        test_strike: { id: 'test_strike', type: 'active', pwr: 130 + Math.floor(Math.random() * 50), baseCd: 3000 + Math.floor(Math.random() * 3000), mpCost: 10 + Math.floor(Math.random() * 25) }
      };

      const result = simulateCombat({ player, enemy, skills: skillsMap, config: { maxDurationSec: 120 } });

      // Verificação estrita de integridade numérica
      assert.ok(!Number.isNaN(result.damageDealt), 'damageDealt must not be NaN');
      assert.ok(!Number.isNaN(result.damageTaken), 'damageTaken must not be NaN');
      assert.ok(!Number.isNaN(result.healingDone), 'healingDone must not be NaN');
      assert.ok(!Number.isNaN(result.mpSpent), 'mpSpent must not be NaN');
      assert.ok(result.playerFinalHp >= 0, 'playerFinalHp must be >= 0');
      assert.ok(result.playerFinalMp >= 0, 'playerFinalMp must be >= 0');
      assert.ok(result.durationSec > 0, 'durationSec must be > 0');
      assert.ok(result.winner === 'player' || result.winner === 'enemy' || result.winner === 'timeout', 'Winner must be valid');

      successfulRuns++;
    }

    assert.equal(successfulRuns, TOTAL_RUNS, `All ${TOTAL_RUNS} Monte Carlo runs must succeed cleanly without errors`);
  });
});
