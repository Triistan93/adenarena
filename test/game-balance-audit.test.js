/**
 * test/game-balance-audit.test.js — Master Game Balance Audit & Calibration Test Suite
 */

import test from 'node:test';
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
  SKILL_TIER_MP_COSTS,
  getSkillMpCost,
  canCastSkill,
  consumeSkillMp
} from '../lineage-idle/src/data/balance/skillBalance.js';

import {
  CP_WEIGHTS,
  calculateCombatPower,
  evaluateDifficulty
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
import { canEnterRaid } from '../lineage-idle/src/services/RaidService.js';

// ─── 1. MP ATOMICITY & GATING ──────────────────────────────────────────────
test('1.1. canCastSkill validates MP requirements atomically', () => {
  const char = { mp: 15, level: 40, stats: { cdr: 0 } };
  const cheapSkill = { id: 'strike', type: 'active', tier: 0, baseCd: 3000, mpCost: 10 };
  const expensiveSkill = { id: 'meteor', type: 'active', tier: 2, baseCd: 8000, mpCost: 35 };
  const passiveSkill = { id: 'armor_mastery', type: 'passive', tier: 1 };
  const now = 100000;
  const cds = {};
  const check1 = canCastSkill(char, cheapSkill, now, cds);
  assert.equal(check1.canCast, true);
  assert.equal(check1.mpCost, 10);
  const check2 = canCastSkill(char, expensiveSkill, now, cds);
  assert.equal(check2.canCast, false);
  assert.equal(check2.mpCost, 35);
  assert.match(check2.reason, /MP insuficiente/);
  const check3 = canCastSkill(char, passiveSkill, now, cds);
  assert.equal(check3.canCast, false);
});

test('1.2. consumeSkillMp executes exact atomic deduction and prevents negative MP', () => {
  const char = { mp: 25, level: 40 };
  const skill = { id: 'flame_strike', type: 'active', tier: 1, baseCd: 4000, mpCost: 20 };
  const now = 200000;
  const cds = {};
  const res1 = consumeSkillMp(char, skill, now, cds);
  assert.equal(res1.success, true);
  assert.equal(res1.mpSpent, 20);
  assert.equal(res1.remainingMp, 5);
  assert.equal(char.mp, 5);
  assert.equal(cds['flame_strike'], now);
  const res2 = consumeSkillMp(char, skill, now + 5000, cds);
  assert.equal(res2.success, false);
  assert.equal(res2.mpSpent, 0);
  assert.equal(char.mp, 5, 'MP must not change on failed cast');
  assert.ok(char.mp >= 0, 'MP must never be negative');
});

test('1.3. getSkillMpCost defaults smoothly by tier and returns 0 for passives', () => {
  assert.equal(getSkillMpCost({ type: 'passive' }), 0);
  assert.equal(getSkillMpCost({ type: 'stat' }), 0);
  assert.equal(getSkillMpCost({ type: 'active', tier: 0 }), 8);
  assert.equal(getSkillMpCost({ type: 'active', tier: 1 }), 16);
  assert.equal(getSkillMpCost({ type: 'active', tier: 2 }), 32);
  assert.equal(getSkillMpCost({ type: 'active', tier: 3 }), 60);
  assert.equal(getSkillMpCost({ type: 'active', tier: 4 }), 95);
  assert.equal(getSkillMpCost({ type: 'active', isUltimate: true }), 95);
});

// ─── 2. HP, HEALING & VAMPIRIC CAP ──────────────────────────────────────────
test('2.1. calculateHealAmount combines Max HP% and M.Atk scaling', () => {
  const heal1 = calculateHealAmount({ maxHp: 1000, matk: 100, skillLvl: 1 });
  const heal2 = calculateHealAmount({ maxHp: 1000, matk: 900, skillLvl: 1 });
  assert.ok(heal1 > 150, 'Heal must provide at least baseline 15% Max HP');
  assert.ok(heal2 > heal1, 'Heal must scale positively with higher M.Atk');
});

test('2.2. calculateVampiricHeal caps strictly at 30% Max HP to prevent infinite sustain', () => {
  const maxHp = 1000;
  const massiveDamage = 50000;
  const heal = calculateVampiricHeal(massiveDamage, maxHp, 0.20);
  const maxAllowed = Math.floor(maxHp * COMBAT_CONFIG.lifestealMaxPercentOfMaxHp);
  assert.equal(heal, maxAllowed, 'Vampiric heal must not exceed 30% of target Max HP');
});

// ─── 3. DAMAGE & MITIGATION ────────────────────────────────────────────────
test('3.1. calculateDefenseMitigation uses calibrated k=250 curve without zero bottlenecks', () => {
  const raw = 1000;
  assert.equal(calculateDefenseMitigation(raw, 0, false), 1000);
  assert.equal(calculateDefenseMitigation(raw, 250, false), 500);
  assert.equal(calculateDefenseMitigation(raw, 500, false), 333);
  let prev = 1000;
  for (let def = 50; def <= 1000; def += 50) {
    const dmg = calculateDefenseMitigation(raw, def, false);
    assert.ok(dmg < prev, 'Mitigation must decrease monotonically with higher defense');
    assert.ok(dmg >= COMBAT_CONFIG.minimumDamage, 'Damage must never drop below minimumDamage');
    prev = dmg;
  }
});

test('3.2. calculatePhysicalDamage and calculateMagicDamage produce finite, non-NaN results', () => {
  const pDmg = calculatePhysicalDamage({ atk: 300, def: 120, pwr: 120, isCrit: true });
  assert.ok(Number.isFinite(pDmg) && !Number.isNaN(pDmg) && pDmg > 0);
  const mDmg = calculateMagicDamage({ matk: 450, mdef: 180, pwr: 110, isCrit: false });
  assert.ok(Number.isFinite(mDmg) && !Number.isNaN(mDmg) && mDmg > 0);
});

// ─── 4. COOLDOWNS & POTION GCD ──────────────────────────────────────────────
test('4.1. canCastSkill blocks re-cast during active cooldown', () => {
  const char = { mp: 100, level: 50 };
  const skill = { id: 'triple_slash', type: 'active', tier: 1, baseCd: 4000, mpCost: 15 };
  const now = 500000;
  const cds = { triple_slash: now - 2000 };
  const check = canCastSkill(char, skill, now, cds);
  assert.equal(check.canCast, false);
  assert.match(check.reason, /cooldown ativo/);
  const checkAfter = canCastSkill(char, skill, now + 2500, cds);
  assert.equal(checkAfter.canCast, true);
});

test('4.2. COMBAT_CONFIG enforces 1500ms Potion GCD', () => {
  assert.equal(COMBAT_CONFIG.potionCooldownMs, 1500);
});

// ─── 5. COMBAT POWER DETERMINISM & PROGRESSION ───────────────────────────────
test('5.1. calculateCombatPower produces deterministic and positive CP across standard stats', () => {
  const testStats = {
    level: 40,
    classTier: 2,
    atk: 180, matk: 20, def: 95, mdef: 80, maxHp: 1200, maxMp: 300,
    crit: 15, critDmg: 2.0, atkSpd: 1.2, cdr: 0.10, accuracy: 90, eva: 25, penetration: 10, lifesteal: 0.05
  };
  const cp1 = calculateCombatPower(testStats);
  const cp2 = calculateCombatPower(testStats);
  assert.equal(cp1, cp2, 'CP must be strictly deterministic');
  assert.ok(cp1 > 3000 && cp1 < 12000, 'CP is in expected Lv. 40 range');
});

test('5.2. evaluateDifficulty correctly categorizes zone and boss CP thresholds', () => {
  const playerCP = 10000;
  assert.equal(evaluateDifficulty(playerCP, 4000, 2400).id, 'overpowered');
  assert.equal(evaluateDifficulty(playerCP, 7000, 4200).id, 'favorable');
  assert.equal(evaluateDifficulty(playerCP, 10000, 6000).id, 'recommended');
  assert.equal(evaluateDifficulty(playerCP, 12500, 7500).id, 'challenging');
  assert.equal(evaluateDifficulty(playerCP, 16000, 9500).id, 'extreme');
  assert.equal(evaluateDifficulty(playerCP, 25000, 15000).id, 'locked');
});

test('5.3. All 32 hunting zones have defined CP progression entries', () => {
  const zones = Object.keys(ZONE_CP_REQUIREMENTS);
  assert.ok(zones.length >= 30, 'Must have at least 30 balanced zones');
  for (const z of zones) {
    const req = getZoneProgression(z);
    assert.ok(req.minCp > 0, 'Zone must have positive minCp');
    assert.ok(req.recCp >= req.minCp, 'Zone recCp must be >= minCp');
  }
});

// ─── 6. RAID BOSS GATING & QUEEN ANT SIMULATION CALIBRATION ──────────────────
test('6.1. Queen Ant and all Raid Bosses have calibrated minimumCP and recommendedCP', () => {
  for (const [id, boss] of Object.entries(RAID_BOSS_BALANCE)) {
    assert.ok(boss.minimumCP > 0, 'Boss must declare minimumCP');
    assert.ok(boss.recommendedCP > boss.minimumCP, 'Boss recommendedCP must exceed minimumCP');
    assert.ok(boss.hp > 0, 'Boss must declare HP');
    assert.ok(boss.atk > 0, 'Boss must declare ATK');
    assert.ok(boss.fatalSkill, 'Boss must have fatalSkill');
  }
});

test('6.2. canEnterRaid blocks entry if hero CP is below minimumCP', () => {
  const undergearedState = { level: 40, combatPower: 5000, dailyRaidTickets: 3 };
  const checkUnder = canEnterRaid(undergearedState, 'queen_ant');
  assert.equal(checkUnder.canEnter, false);
  assert.match(checkUnder.reason, /Poder de Combate insuficiente/);

  const readyState = { level: 40, combatPower: 8500, dailyRaidTickets: 3 };
  const checkReady = canEnterRaid(readyState, 'queen_ant');
  assert.equal(checkReady.canEnter, true);
});

test('6.3. Headless Simulator: Queen Ant calibration matches target win rates across CP tiers', () => {
  const boss = RAID_BOSSES.queen_ant;

  const skillsMap = {
    power_strike: { id: 'power_strike', type: 'active', pwr: 130, baseCd: 3500, mpCost: 16 },
    holy_blade: { id: 'holy_blade', type: 'active', pwr: 150, baseCd: 6000, mpCost: 24 }
  };

  // Tier A: Below minimum CP (< 7.5k) — Undergeared
  const simUnder = simulateMany({
    player: {
      name: 'Undergeared Knight',
      maxHp: 450, hp: 450, maxMp: 180, mp: 180,
      stats: { atk: 90, def: 45, matk: 10, mdef: 35, crit: 8, critDmg: 1.5, atkSpd: 0.1, eva: 8, mpRegen: 3 },
      inventory: [{ itemId: 'hp_potion_m', count: 10 }]
    },
    enemy: boss,
    skills: skillsMap,
    runs: 5,
    config: { maxDurationSec: 150 }
  });
  assert.equal(simUnder.winRate, 0, 'Undergeared hero should not defeat Queen Ant');

  // Tier B: Recommended CP (~12.5k) — Geared Lv. 40 Gladiator/Knight
  const simRecommended = simulateMany({
    player: {
      name: 'Geared Knight',
      maxHp: 1250, hp: 1250, maxMp: 400, mp: 400,
      stats: { atk: 280, def: 145, matk: 80, mdef: 115, crit: 22, critDmg: 2.1, atkSpd: 0.45, eva: 18, mpRegen: 8 },
      skills: { power_strike: 5, holy_blade: 4 },
      inventory: [
        { itemId: 'hp_potion_l', count: 40 },
        { itemId: 'mp_potion_m', count: 20 }
      ]
    },
    enemy: boss,
    skills: skillsMap,
    runs: 5,
    config: { maxDurationSec: 180 }
  });

  assert.equal(simRecommended.winRate, 100, 'Recommended CP hero must defeat Queen Ant with 100% win rate');
  assert.ok(simRecommended.avgTTK >= 40 && simRecommended.avgTTK <= 140, 'TTK in expected range');
  assert.ok(simRecommended.avgHpPotionsUsed > 0, 'Recommended fight consumes potions');
});