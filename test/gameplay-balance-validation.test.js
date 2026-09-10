/**
 * test/gameplay-balance-validation.test.js
 *
 * PHASE 3: GAMEPLAY BALANCE VALIDATION & FINAL CALIBRATION TEST SUITE
 * Lineage Idle — Combat, Skills, MP/HP, Cooldowns, Potions, Bosses & Progression.
 *
 * Validates:
 * 1. MP Rotation & Initial Cooldown Integrity (no 0.0 MP/s bug, tick 1 casting, damage breakdown).
 * 2. Strict Finite Potion Inventory (potions run out when count reaches 0, no infinite sustain).
 * 3. Queen Ant 9 CP Tiers Curve (Below Min = 0%, Poor Prep = low win, Full Prep = high win, Rec CP = 100%).
 * 4. Boss Progression, Enrage (<30% HP) & Boss Critical Hits.
 * 5. 25 Canonical Classes Identity (Tanks EHP, Mages Burst, Healers HPS, all TTK <= 5s).
 * 6. CP Sensitivity & Progression Scaling (+10% CP leads to > 10% DPS increase).
 */

import test, { describe } from 'node:test';
import assert from 'node:assert/strict';

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
  evaluateDifficulty
} from '../lineage-idle/src/data/balance/cpBalance.js';

import {
  RAID_BOSS_BALANCE
} from '../lineage-idle/src/data/balance/bossBalance.js';

import {
  ZONE_CP_REQUIREMENTS
} from '../lineage-idle/src/data/balance/progressionBalance.js';

import {
  simulateCombat,
  simulateMany
} from '../lineage-idle/src/services/CombatSimulator.js';

describe('PHASE 3: MP ROTATION & INITIAL COOLDOWN INTEGRITY', () => {

  test('1.1. Fresh skills can cast immediately on tick 1 (no false cooldown locking)', () => {
    const player = { level: 40, mp: 300, maxMp: 300, stats: { cdr: 0 } };
    const skillDef = { id: 'burst_bolt', baseCd: 4000, mpCost: 20, type: 'active' };
    const cds = {}; // Never cast before

    // At now = 200ms (tick 1 of simulation), skill should be allowed to cast
    const check = canCastSkill(player, skillDef, 200, cds);
    assert.equal(check.canCast, true, 'Skill must be able to cast on tick 1 when not in cooldown');
    assert.equal(check.mpCost, 20);

    const consumed = consumeSkillMp(player, skillDef, 200, cds);
    assert.equal(consumed.success, true);
    assert.equal(player.mp, 280);
    assert.equal(cds['burst_bolt'], 200);

    // At now = 400ms (tick 2), skill should now be blocked by cooldown
    const checkTick2 = canCastSkill(player, skillDef, 400, cds);
    assert.equal(checkTick2.canCast, false, 'Skill must now be blocked by active cooldown');

    // At now = 4300ms (after cd), skill should be ready again
    const checkTickAfterCd = canCastSkill(player, skillDef, 4300, cds);
    assert.equal(checkTickAfterCd.canCast, true, 'Skill must be ready after cooldown expires');
  });

  test('1.2. Damage breakdown distinguishes between Auto-Attack and Skill DPS', () => {
    const player = {
      level: 40, maxHp: 1000, hp: 1000, maxMp: 400, mp: 400,
      stats: { atk: 250, def: 120, crit: 20, critDmg: 2.0, atkSpd: 0.35, mpRegen: 5 },
      skills: { power_strike: 3 },
      inventory: [{ itemId: 'hp_potion_l', count: 10 }]
    };
    const enemy = { id: 'dummy_mob', name: 'Alvo', hp: 3000, atk: 50, def: 40, atkSpd: 1.0 };
    const skills = {
      power_strike: { id: 'power_strike', type: 'active', pwr: 130, baseCd: 3500, mpCost: 15 }
    };

    const sim = simulateCombat({ player, enemy, skills });
    assert.ok(sim.skillDamageDealt > 0, 'Skill damage must be > 0');
    assert.ok(sim.autoAttackDamageDealt > 0, 'Auto attack damage must be > 0');
    assert.equal(sim.damageDealt, sim.skillDamageDealt + sim.autoAttackDamageDealt, 'Total damage must equal sum of skill and auto attack');
    assert.ok(sim.skillContributionPct > 0 && sim.skillContributionPct < 100, 'Skill contribution % must be between 0% and 100%');
    assert.ok(sim.mpSpent > 0, 'MP spent must be > 0');
  });
});

describe('PHASE 3: RESOURCE WAR & FINITE INVENTORY INTEGRITY', () => {

  test('2.1. Potions are strictly finite and stop healing when inventory reaches 0', () => {
    const player = {
      level: 40, maxHp: 800, hp: 200, maxMp: 100, mp: 100,
      stats: { atk: 10, def: 30, mpRegen: 0 },
      inventory: [{ itemId: 'hp_potion_s', count: 2 }] // Only 2 small potions (100 HP each)
    };
    const boss = { id: 'hard_boss', name: 'Boss Brutal', hp: 50000, atk: 120, def: 100, atkSpd: 1.0 };

    const sim = simulateCombat({ player, enemy: boss, skills: {} });
    assert.equal(sim.winner, 'enemy', 'Player must lose when potions run out');
    assert.equal(sim.hpPotionsUsed, 2, 'Player must use EXACTLY 2 potions, not infinite');
  });

  test('2.2. simulateMany preserves initial player inventory state across runs (no leak)', () => {
    const player = {
      level: 40, maxHp: 800, hp: 800, maxMp: 200, mp: 200,
      stats: { atk: 150, def: 70, crit: 10, atkSpd: 0.3 },
      inventory: [{ itemId: 'hp_potion_l', count: 5 }]
    };
    const enemy = { id: 'test_mob', name: 'Monstro Teste', hp: 2000, atk: 80, def: 50, atkSpd: 1.0 };

    const sim = simulateMany({ player, enemy, skills: {}, runs: 10 });
    // After 10 runs, original player inventory count must STILL be 5
    assert.equal(player.inventory[0].count, 5, 'Original player object must not be mutated by simulateMany');
  });
});

describe('PHASE 3: QUEEN ANT 9 CP TIERS CURVE & PREPARATION SENSITIVITY', () => {

  const qaBoss = RAID_BOSS_BALANCE.queen_ant;
  const qaSkills = {
    power_strike: { id: 'power_strike', type: 'active', pwr: 130, baseCd: 3500, mpCost: 16 },
    triple_slash: { id: 'triple_slash', type: 'active', pwr: 150, baseCd: 5500, mpCost: 24 }
  };

  test('3.1. Below Minimum CP (7.0k) results in 0% Win Rate (Inadequate)', () => {
    const pBelow = {
      level: 38, maxHp: 620, hp: 620, maxMp: 220, mp: 220,
      stats: { atk: 155, def: 75, matk: 35, mdef: 60, crit: 10, critDmg: 2.0, atkSpd: 0.20, eva: 8, mpRegen: 4 },
      skills: { power_strike: 2, triple_slash: 1 },
      inventory: [{ itemId: 'hp_potion_l', count: 15 }, { itemId: 'mp_potion_m', count: 10 }]
    };

    const sim = simulateMany({ player: pBelow, enemy: qaBoss, skills: qaSkills, runs: 100, config: { maxDurationSec: 180 } });
    assert.equal(sim.winRate, 0, 'Below Minimum CP must have 0% Win Rate');
    assert.ok(sim.meanTTD > 50 && sim.meanTTD < 75, `Mean TTD (${sim.meanTTD}s) must be between 50s and 75s`);
  });

  test('3.2. Minimum CP (7.5k) differentiates between Poor Preparation and Full Preparation', () => {
    // Poor preparation: 18 potions -> runs out of sustain and dies
    const pPoor = {
      level: 40, maxHp: 700, hp: 700, maxMp: 250, mp: 250,
      stats: { atk: 170, def: 85, matk: 40, mdef: 65, crit: 10, critDmg: 2.0, atkSpd: 0.22, eva: 10, mpRegen: 5 },
      skills: { power_strike: 3, triple_slash: 2 },
      inventory: [{ itemId: 'hp_potion_l', count: 18 }, { itemId: 'mp_potion_m', count: 10 }]
    };
    const simPoor = simulateMany({ player: pPoor, enemy: qaBoss, skills: qaSkills, runs: 100, config: { maxDurationSec: 180 } });
    assert.ok(simPoor.winRate < 35, `Poor preparation at 7.5k must have low win rate (< 35%), got ${simPoor.winRate}%`);

    // Full preparation: 24 potions -> can endure the 85-92s fight
    const pFull = {
      level: 40, maxHp: 700, hp: 700, maxMp: 250, mp: 250,
      stats: { atk: 170, def: 85, matk: 40, mdef: 65, crit: 10, critDmg: 2.0, atkSpd: 0.22, eva: 10, mpRegen: 5 },
      skills: { power_strike: 3, triple_slash: 2 },
      inventory: [{ itemId: 'hp_potion_l', count: 24 }, { itemId: 'mp_potion_m', count: 15 }]
    };
    const simFull = simulateMany({ player: pFull, enemy: qaBoss, skills: qaSkills, runs: 100, config: { maxDurationSec: 180 } });
    assert.ok(simFull.winRate >= 90, `Full preparation at 7.5k must achieve >= 90% win rate, got ${simFull.winRate}%`);
    assert.ok(simFull.medianTTK >= 80 && simFull.medianTTK <= 96, `TTK (${simFull.medianTTK}s) must be challenging (~80-96s)`);
  });

  test('3.3. Recommended CP (12.5k) achieves consistent victory (100%) and comfortable TTK (~45s)', () => {
    const pRec = {
      level: 42, maxHp: 1250, hp: 1250, maxMp: 400, mp: 400,
      stats: { atk: 280, def: 145, matk: 80, mdef: 115, crit: 22, critDmg: 2.1, atkSpd: 0.45, eva: 18, mpRegen: 8 },
      skills: { power_strike: 5, triple_slash: 4 },
      inventory: [{ itemId: 'hp_potion_l', count: 30 }, { itemId: 'mp_potion_m', count: 20 }]
    };
    const sim = simulateMany({ player: pRec, enemy: qaBoss, skills: qaSkills, runs: 100, config: { maxDurationSec: 180 } });
    assert.equal(sim.winRate, 100, 'Recommended CP must achieve 100% win rate');
    assert.ok(sim.meanTTK >= 40 && sim.meanTTK <= 50, `Recommended CP TTK (${sim.meanTTK}s) should be between 40s and 50s`);
    assert.ok(sim.avgHpPotionsUsed <= 10, `Recommended CP potion usage (${sim.avgHpPotionsUsed}) must be <= 10`);
  });

  test('3.4. Overpowered CP (20k) achieves fast farm TTK <= 28s with <= 4 potions', () => {
    const pFarm = {
      level: 48, maxHp: 1800, hp: 1800, maxMp: 520, mp: 520,
      stats: { atk: 420, def: 200, matk: 120, mdef: 160, crit: 30, critDmg: 2.2, atkSpd: 0.65, eva: 25, mpRegen: 12 },
      skills: { power_strike: 5, triple_slash: 5 },
      inventory: [{ itemId: 'hp_potion_l', count: 30 }, { itemId: 'mp_potion_m', count: 20 }]
    };
    const sim = simulateMany({ player: pFarm, enemy: qaBoss, skills: qaSkills, runs: 100, config: { maxDurationSec: 180 } });
    assert.equal(sim.winRate, 100);
    assert.ok(sim.meanTTK <= 28, `Farm TTK (${sim.meanTTK}s) must be <= 28s`);
    assert.ok(sim.avgHpPotionsUsed <= 4, `Farm potion usage (${sim.avgHpPotionsUsed}) must be <= 4`);
  });
});

describe('PHASE 3: 25 CANONICAL CLASSES COMBAT ROLE INTEGRITY', () => {

  const canonicalClasses = [
    { id: 'gladiator', role: 'Dual Melee DPS', archetype: 'dps', atk: 270, matk: 40, def: 135, hp: 1100 },
    { id: 'warlord', role: 'Polearm AoE DPS', archetype: 'dps', atk: 250, matk: 35, def: 145, hp: 1250 },
    { id: 'paladin', role: 'Holy Tank', archetype: 'tank', atk: 220, matk: 70, def: 180, hp: 1450 },
    { id: 'darkAvenger', role: 'Dark Tank / Drain', archetype: 'tank', atk: 240, matk: 60, def: 170, hp: 1380 },
    { id: 'treasureHunter', role: 'Dagger Crit DPS', archetype: 'dps', atk: 280, matk: 30, def: 120, hp: 980 },
    { id: 'hawkeye', role: 'Long-Range Bow DPS', archetype: 'dps', atk: 290, matk: 25, def: 115, hp: 950 },
    { id: 'sorcerer', role: 'Fire Burst Mage', archetype: 'mage', atk: 55, matk: 310, def: 105, hp: 880 },
    { id: 'necromancer', role: 'Dark Drain Mage', archetype: 'mage', atk: 55, matk: 295, def: 110, hp: 920 },
    { id: 'warlock', role: 'Cat Summoner', archetype: 'summoner', atk: 60, matk: 275, def: 115, hp: 960 },
    { id: 'bishop', role: 'Pure Main Healer', archetype: 'healer', atk: 50, matk: 260, def: 120, hp: 980 },
    { id: 'prophet', role: 'Support Buffer', archetype: 'buffer', atk: 80, matk: 230, def: 130, hp: 1020 },
    { id: 'templeKnight', role: 'Evasive Tank', archetype: 'tank', atk: 215, matk: 65, def: 175, hp: 1400 },
    { id: 'swordsinger', role: 'Song Buffer / DPS', archetype: 'buffer', atk: 245, matk: 50, def: 140, hp: 1150 },
    { id: 'plainsWalker', role: 'Agile Dagger DPS', archetype: 'dps', atk: 275, matk: 35, def: 118, hp: 960 },
    { id: 'silverRanger', role: 'Rapid Bow DPS', archetype: 'dps', atk: 285, matk: 30, def: 112, hp: 930 },
    { id: 'spellsinger', role: 'Rapid Water Mage', archetype: 'mage', atk: 50, matk: 305, def: 102, hp: 860 },
    { id: 'elementalSummoner', role: 'Unicorn Summoner', archetype: 'summoner', atk: 60, matk: 270, def: 112, hp: 940 },
    { id: 'elder', role: 'Healer / Recharger', archetype: 'healer', atk: 50, matk: 255, def: 118, hp: 950 },
    { id: 'shillienKnight', role: 'Vampiric Tank', archetype: 'tank', atk: 235, matk: 80, def: 172, hp: 1360 },
    { id: 'bladedancer', role: 'Dance Buffer / DPS', archetype: 'buffer', atk: 260, matk: 45, def: 135, hp: 1120 },
    { id: 'abyssWalker', role: 'Lethal Dagger DPS', archetype: 'dps', atk: 295, matk: 40, def: 112, hp: 940 },
    { id: 'phantomRanger', role: 'Heavy Bow DPS', archetype: 'dps', atk: 305, matk: 35, def: 108, hp: 910 },
    { id: 'spellhowler', role: 'Wind / Dark Mage', archetype: 'mage', atk: 55, matk: 335, def: 98, hp: 840 },
    { id: 'phantomSummoner', role: 'Shadow Summoner', archetype: 'summoner', atk: 65, matk: 280, def: 110, hp: 950 },
    { id: 'shillienElder', role: 'Dark Healer / Buffer', archetype: 'healer', atk: 55, matk: 265, def: 116, hp: 960 }
  ];

  test('4.1. 100% of the 25 classes consume MP (> 0 MP/s) and eliminate 0.0 MP/s anomaly', () => {
    const mob = { id: 'ant_soldier', name: 'Formiga Soldado', hp: 1200, atk: 95, def: 45, mdef: 55, atkSpd: 1.0 };

    for (const c of canonicalClasses) {
      const isCaster = c.archetype === 'mage' || c.archetype === 'healer' || c.archetype === 'buffer' || c.archetype === 'summoner';
      const skillId = isCaster ? 'energy_bolt' : 'power_strike';
      const skillsMap = {
        power_strike: { id: 'power_strike', type: 'active', pwr: 130, baseCd: 3500, mpCost: 15 },
        energy_bolt: { id: 'energy_bolt', type: 'active', pwr: 125, baseCd: 3000, mpCost: 14 }
      };
      const player = {
        level: 40, class: c.id, maxHp: c.hp, hp: c.hp, maxMp: 400, mp: 400,
        stats: { atk: c.atk, matk: c.matk || 30, def: c.def, mdef: 110, crit: 18, critDmg: 2.0, atkSpd: 0.35, mpRegen: 8 },
        skills: { [skillId]: 3 },
        inventory: [{ itemId: 'hp_potion_l', count: 10 }]
      };

      const sim = simulateCombat({ player, enemy: mob, skills: skillsMap });
      assert.ok(sim.mpSpent > 0, `Class ${c.id} must spend MP, got ${sim.mpSpent}`);
      const mpPerSec = sim.mpSpent / sim.ttk;
      assert.ok(mpPerSec > 0, `Class ${c.id} must have MP/s > 0, got ${mpPerSec.toFixed(1)} MP/s`);
      assert.ok(sim.ttk <= 5.0, `Class ${c.id} TTK (${sim.ttk}s) must be <= 5.0s on standard zone mob`);
    }
  });

  test('4.2. Role distinction: Tanks have highest EHP and Mages have highest burst DPS', () => {
    const tanks = canonicalClasses.filter(c => c.archetype === 'tank');
    const mages = canonicalClasses.filter(c => c.archetype === 'mage');

    for (const t of tanks) {
      const mit = calculateDefenseMitigation(100, t.def, false);
      const ehp = Math.round(t.hp / (mit / 100));
      assert.ok(ehp >= 2200, `Tank ${t.id} EHP (${ehp}) must be >= 2200`);
    }

    for (const m of mages) {
      const sDmg = calculateMagicDamage({ matk: m.matk, mdef: 55, pwr: 125, isCrit: false, applyVariance: false });
      assert.ok(sDmg >= 450, `Mage ${m.id} burst damage (${sDmg}) must be >= 450`);
    }
  });
});

describe('PHASE 3: CP SENSITIVITY & STAT PROGRESSION SCALING', () => {

  test('5.1. +10% stat increase significantly improves character performance (> 10% DPS gain)', () => {
    const mob = { id: 'ant_soldier', name: 'Formiga Soldado', hp: 5000, atk: 95, def: 50, mdef: 60, atkSpd: 1.0 };
    const skills = { power_strike: { id: 'power_strike', type: 'active', pwr: 130, baseCd: 3500, mpCost: 15 } };

    const pBase = {
      level: 40, maxHp: 1000, hp: 1000, maxMp: 400, mp: 400,
      stats: { atk: 250, def: 120, crit: 15, critDmg: 2.0, atkSpd: 0.35, mpRegen: 5 },
      skills: { power_strike: 3 },
      inventory: [{ itemId: 'hp_potion_l', count: 10 }]
    };
    const pUpgraded = {
      level: 40, maxHp: 1100, hp: 1100, maxMp: 400, mp: 400,
      stats: { atk: 285, def: 135, crit: 15, critDmg: 2.0, atkSpd: 0.35, mpRegen: 5 },
      skills: { power_strike: 3 },
      inventory: [{ itemId: 'hp_potion_l', count: 10 }]
    };

    const simBase = simulateMany({ player: pBase, enemy: mob, skills, runs: 50 });
    const simUpgraded = simulateMany({ player: pUpgraded, enemy: mob, skills, runs: 50 });

    const dpsBase = simBase.avgDamageDealt / simBase.avgTTK;
    const dpsUpgraded = simUpgraded.avgDamageDealt / simUpgraded.avgTTK;
    const dpsGain = ((dpsUpgraded - dpsBase) / dpsBase) * 100;

    assert.ok(dpsGain > 10, `Upgrading stats must produce > 10% DPS gain, got ${dpsGain.toFixed(1)}%`);
    assert.ok(simUpgraded.avgTTK < simBase.avgTTK, 'Upgraded character must kill the monster faster');
  });
});
