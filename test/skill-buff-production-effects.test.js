import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';
import { getEquippedArmorType, getEquippedWeaponInfo, getStats } from '../lineage-idle/src/engine/StatsEngine.js';
import { canCastSkill, getSkillMpCost } from '../lineage-idle/src/data/balance/skillBalance.js';
import { calculateDefenseMitigation, calculatePlayerMissChance, resolvePlayerBlock } from '../lineage-idle/src/data/balance/combatBalance.js';
import { applyPlayerBasicAttackDamageBonus, applyPlayerBuffHitControlProc, applyPlayerBuffHitHealProc, applyPlayerDamageTakenReduction, applyPlayerHealingReceivedBonus, applyPlayerPveDamageBonus, applyPlayerSkillPowerBonus, applySkillBuffDurationBonus, applySkillDamageOverTime, applySkillTargetDebuff, applyTargetDamageTakenBonus, clearPlayerCombatDebuffs, getActiveSkillDebuffStats, getDebuffedMonsterAttack, getDebuffedMonsterAttackSpeed, getDebuffedMonsterDefense, getDebuffedMonsterSkillCooldownMultiplier, getHpPotionHealAmount, getPlayerBuffShockChanceBonus, isHpRecoveryPotion, isMonsterActionDisabled, isMonsterMagicSkillSilenced, processSkillDamageOverTime, resolveDebuffedMonsterSkillCooldownMs, resolveDwarvenRecoveryMasteryBonuses, resolveDwarvenWeaponMasteryStunChancePercent, resolveMechanicalMasterpieceHit, resolvePlayerBasicAttackIntervalMs, resolvePlayerDamageReflection, resolveSkillBuffDurationMs, resolveSkillBuffStats, resolveSkillCooldownReduction, resolveSkillDamageOverTime, resolveSkillFixedHeal, resolveSkillHealPower, resolveSkillHpSacrificeCost, resolveSkillMpRecoveryAmount, resolveSkillSpeedCooldownReduction, resolveSkillTargetDebuffApplication, resolveSkillTargetDebuffDurationMs, resolveSkillTargetDebuffStatDurationsMs, resolveSkillTargetDebuffStats, shouldEvadeMonsterSkill } from '../lineage-idle/src/services/SkillEffectService.js';
import { CANONICAL_SKILL_REGISTRY_V2 } from '../lineage-idle/src/data/skills/CanonicalSkillRegistryV2.js';
import { simulateCombat } from '../lineage-idle/src/services/CombatSimulator.js';
import { MONSTER_ARCHETYPES, MonsterAIEngine } from '../lineage-idle/src/engine/MonsterAIEngine.js';
import { MONSTERS } from '../lineage-idle/src/data/monsters.js';
import * as SkillEffectService from '../lineage-idle/src/services/SkillEffectService.js';

describe('Buff skill effects follow their canonical behavior', () => {
  it('applies Increase Power offense and routes Shock Attack Rate to combat stun chance', () => {
    const def = CANONICAL_SKILL_REGISTRY_V2.increase_power;
    const effect = resolveSkillBuffStats(def);
    assert.deepEqual(effect, { pAtkPercent: 0.20, mAtkPercent: 0.20, shockAttackRatePercent: 0.20 });
    const state = { ...DEFAULT_STATE(), level: 76, buffs: { increase_power: { skillBuffStats: effect, until: Date.now() + 20_000 } } };
    const before = getStats({ ...state, buffs: {} });
    const after = getStats(state);
    assert.ok(after.atk > before.atk);
    assert.ok(after.matk > before.matk);
    assert.equal(getPlayerBuffShockChanceBonus(state.buffs, Date.now()), 20);
    assert.equal(getPlayerBuffShockChanceBonus(state.buffs, state.buffs.increase_power.until), 0);
  });

  it('converts Body to Mind HP sacrifice into capped MP recovery without an MP fee', () => {
    const def = CANONICAL_SKILL_REGISTRY_V2.body_to_mind;
    assert.equal(getSkillMpCost(def), 0);
    assert.equal(resolveSkillHpSacrificeCost(def, 1_000, 1_000), 100);
    assert.equal(resolveSkillHpSacrificeCost(def, 1_000, 100), 0);
    assert.equal(resolveSkillMpRecoveryAmount(def, 1_000, 400), 90);
    assert.equal(resolveSkillMpRecoveryAmount(def, 1_000, 950), 50);
    assert.equal(resolveSkillMpRecoveryAmount(def, 1_000, 1_000), 0);
  });

  it('routes Inferno through fire damage and its documented ten-second burn', () => {
    const inferno = CANONICAL_SKILL_REGISTRY_V2.inferno;
    assert.equal(inferno.type, 'active');
    assert.equal(inferno.effect, 'dmg');
    assert.equal(inferno.pwr, 150);
    assert.deepEqual(resolveSkillDamageOverTime(inferno), { durationMs: 10_000, intervalMs: 1_000 });
  });

  it('adapts Touch of Death into a timed vulnerability with a real HP payment', () => {
    const touch = CANONICAL_SKILL_REGISTRY_V2.touch_of_death;
    assert.deepEqual(resolveSkillTargetDebuffStats(touch), { damageTakenPercent: 0.10 });
    assert.equal(resolveSkillTargetDebuffDurationMs(touch), 20_000);
    assert.equal(resolveSkillHpSacrificeCost(touch, 1_000, 1_000), 100);
    assert.equal(resolveSkillHpSacrificeCost(touch, 1_000, 100), 0);
  });

  it("routes Pa'agrio's Glory through magic offense, defense, and magic cooldown stats", () => {
    const glory = CANONICAL_SKILL_REGISTRY_V2.pa_agrio_s_glory;
    const skillBuffStats = resolveSkillBuffStats(glory, 1);
    assert.deepEqual(skillBuffStats, { matk: 100, mAtkPercent: 0.34, def: 100, pDefPercent: 0.29, mdef: 100, mDefPercent: 0.34, mSkillCdr: 0.15 });
    const state = { ...DEFAULT_STATE(), class: 'dominator', level: 85, buffs: {} };
    const before = getStats(state);
    state.buffs.pa_agrio_s_glory = { skillBuffStats, until: Date.now() + 20_000, source: 'class_skill' };
    const after = getStats(state);
    assert.ok(after.matk > before.matk);
    assert.ok(after.def > before.def);
    assert.ok(after.mdef > before.mdef);
    assert.ok(after.mSkillCdr > before.mSkillCdr);
  });

  it('executes sourced Doomcryer, Soul Hound, Maestro, and Doombringer buffs', () => {
    const expected = {
      chant_of_glory: { matk: 100, mAtkPercent: 0.34, def: 100, pDefPercent: 0.29, mdef: 100, mDefPercent: 0.34, mSkillCdr: 0.15, mSkillPowerPercent: 0.05, maxMpFlat: 300, mSkillMpCostReduction: 0.15 },
      soul_blade: { pAtkPercent: 0.30, crit: 15, pSkillPowerPercent: 0.10 },
      prime_master: { maxHpPercent: 0.15, pAtkPercent: 0.10, crit: 10, pSkillPowerPercent: 0.10, debuffResistancePercent: 0.10 },
      powerful_rush: { pAtkPercent: 0.40, pveDamagePercent: 0.17, movementSpeedPercent: 0.10 }
    };
    for (const [id, effect] of Object.entries(expected)) {
      assert.deepEqual(resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2[id]), effect, `${id} has an explicit supported effect`);
      assert.equal(resolveSkillBuffDurationMs(CANONICAL_SKILL_REGISTRY_V2[id]), 20_000, `${id} expires after its adapted combat window`);
      const state = { ...DEFAULT_STATE(), level: 85, buffs: {} };
      const before = getStats(state);
      state.buffs[id] = { skillBuffStats: effect, until: Date.now() + 20_000 };
      const after = getStats(state);
      assert.ok(after.atk > before.atk || after.matk > before.matk, `${id} reaches an offensive production stat`);
    }
    const chantState = { ...DEFAULT_STATE(), level: 85, buffs: {} };
    const beforeChant = getStats(chantState);
    chantState.buffs.chant_of_glory = { skillBuffStats: expected.chant_of_glory, until: Date.now() + 20_000 };
    const afterChant = getStats(chantState);
    assert.ok(afterChant.def > beforeChant.def);
    assert.ok(afterChant.mdef > beforeChant.mdef);
    assert.ok(afterChant.maxMp > beforeChant.maxMp);
    assert.ok(afterChant.mSkillCdr > beforeChant.mSkillCdr);
    assert.ok(afterChant.mSkillMpCostReduction > beforeChant.mSkillMpCostReduction);
    assert.equal(afterChant.atkSpd, beforeChant.atkSpd, 'the source does not grant attack speed');
  });

  it('applies Sword Symphony and Bleeding Rose effects through production stats', () => {
    const expected = {
      sword_symphony: { pAtkPercent: 0.10, pveDamagePercent: 0.10, damageTakenReductionPercent: 0.10 },
      bleeding_rose: { mAtkPercent: 0.05, crit: 5, mSkillPowerPercent: 0.05, pveDamagePercent: 0.10 }
    };
    for (const [id, effect] of Object.entries(expected)) {
      assert.deepEqual(resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2[id]), effect);
      assert.equal(resolveSkillBuffDurationMs(CANONICAL_SKILL_REGISTRY_V2[id]), 20_000);
      const state = { ...DEFAULT_STATE(), level: 85, buffs: {} };
      const before = getStats(state);
      state.buffs[id] = { skillBuffStats: effect, until: Date.now() + 20_000 };
      const after = getStats(state);
      assert.ok(after.atk > before.atk || after.matk > before.matk);
      assert.ok(after.pveDamagePercent > before.pveDamagePercent);
    }
  });

  it('executes Reflecting Illusion as a timed ward and reflects received damage', () => {
    const def = CANONICAL_SKILL_REGISTRY_V2.reflecting_illusion;
    const effect = resolveSkillBuffStats(def);
    assert.deepEqual(effect, { def: 3_000, mdef: 3_000, debuffResistancePercent: 0.15, damageTakenReductionPercent: 0.10, reflectDamagePercent: 0.10 });
    assert.equal(resolveSkillBuffDurationMs(def), 15_000);
    const state = { ...DEFAULT_STATE(), level: 85, buffs: {} };
    const before = getStats(state);
    state.buffs.reflecting_illusion = { skillBuffStats: effect, until: Date.now() + 15_000 };
    const after = getStats(state);
    assert.ok(after.def > before.def);
    assert.ok(after.mdef > before.mdef);
    assert.ok(after.debuffResistancePercent > before.debuffResistancePercent);
    assert.equal(applyPlayerDamageTakenReduction(1_000, after), 900);
    assert.equal(resolvePlayerDamageReflection(state.buffs, 1_000), 100);
  });

  it('applies Crimson Rose Lv. 2 magic offense and MP recovery', () => {
    const def = CANONICAL_SKILL_REGISTRY_V2.crimson_rose;
    const effect = resolveSkillBuffStats(def);
    assert.deepEqual(effect, { mAtkPercent: 0.10, crit: 5, mSkillPowerPercent: 0.02, pveDamagePercent: 0.05, mpRegen: 10 });
    assert.equal(resolveSkillBuffDurationMs(def), 20_000);
    const state = { ...DEFAULT_STATE(), level: 85, buffs: {} };
    const before = getStats(state);
    state.buffs.crimson_rose = { skillBuffStats: effect, until: Date.now() + 20_000 };
    const after = getStats(state);
    assert.ok(after.matk > before.matk);
    assert.ok(after.mSkillPowerPercent > before.mSkillPowerPercent);
    assert.ok(after.pveDamagePercent > before.pveDamagePercent);
    assert.ok(after.mpRegen > before.mpRegen);
  });

  it('wires Tenacity recovery to actual hits with chance, cooldown, and expiry', () => {
    const effect = resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.tenacity);
    assert.deepEqual(effect, { debuffResistancePercent: 0.10, hitHealProcChance: 0.20, hitHealProcPercent: 0.05, hitHealProcCooldownMs: 5_000 });
    const state = { hp: 400, buffs: { tenacity: { skillBuffStats: effect, until: 20_000 } } };
    assert.equal(applyPlayerBuffHitHealProc(state, 1_000, 10_000, () => 0.19), 50);
    assert.equal(state.hp, 450);
    assert.equal(applyPlayerBuffHitHealProc(state, 1_000, 12_000, () => 0), 0, 'proc lock prevents a second immediate recovery');
    assert.equal(applyPlayerBuffHitHealProc(state, 1_000, 15_000, () => 0.20), 0, 'chance boundary fails');
    assert.equal(applyPlayerBuffHitHealProc(state, 1_000, 20_000, () => 0), 0, 'expired buff cannot trigger');
  });

  it('resolves Mechanical Masterpiece extra blows and the golem one-second lock', () => {
    const effect = resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.mechanical_masterpiece);
    assert.deepEqual(effect, { pveDamagePercent: 0.05, mechanicalMasterpieceProcChance: 0.15, mechanicalMasterpieceExtraDamagePercent: 0.20 });
    assert.equal(resolveSkillBuffDurationMs(CANONICAL_SKILL_REGISTRY_V2.mechanical_masterpiece), 20_000);
    const state = { buffs: { mechanical_masterpiece: { skillBuffStats: effect, until: 20_000 } } };
    const target = { hp: 10_000 };
    const proc = resolveMechanicalMasterpieceHit(state, target, 500, 10_000, () => 0.14);
    assert.deepEqual(proc, { extraDamage: 100, stunned: true });
    assert.equal(isMonsterActionDisabled(target, 10_500), true);
    assert.equal(isMonsterActionDisabled(target, 11_001), false);
    assert.deepEqual(resolveMechanicalMasterpieceHit(state, target, 500, 10_000, () => 0.15), { extraDamage: 0, stunned: false });
  });

  it('applies critical damage and received-healing bonuses to real derived stats', () => {
    const deadEye = resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.dead_eye);
    assert.deepEqual(deadEye, { pAccuracy: 1, atk: 140, critDmgPercent: 0.20, cdr: -0.05 });
    const enlightenment = resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.enlightenment);
    assert.deepEqual(enlightenment, { mAtkPercent: 0.10, cdr: 0.30, crit: 50, mSkillPowerPercent: 0.10, healingReceivedPercent: 0.20, movementSpeedPercent: 0.15 });
    const state = { ...DEFAULT_STATE(), level: 85, buffs: {} };
    const before = getStats(state);
    state.buffs.dead_eye = { skillBuffStats: deadEye, until: Date.now() + 20_000 };
    state.buffs.enlightenment = { skillBuffStats: enlightenment, until: Date.now() + 20_000 };
    const after = getStats(state);
    assert.ok(after.critDmg > before.critDmg);
    assert.equal(after.healingReceivedPercent, 0.20);
    assert.equal(applyPlayerHealingReceivedBonus(500, after), 600);
    assert.equal(getHpPotionHealAmount(500, after), 600);
  });

  it('maps sourced Samurai and Divine Templar buffs to combat cadence, attack, MP, and reflection', () => {
    const atsumori = resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.atsumori);
    assert.deepEqual(atsumori, { maxHpPercent: 0.15, mpRegen: 5, atk: 300, pAtkPercent: 0.08, pSkillMpCostReduction: 0.15, pSkillCdr: 0.01 });
    const sacral = resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.sacral_power);
    assert.deepEqual(sacral, { pAtkPercent: 0.20, crit: 5, movementSpeedPercent: 0.20 });
    assert.deepEqual(resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.fragarach), { reflectDamagePercent: 0.10, debuffResistancePercent: 0.10 });
    assert.deepEqual(resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.light_counter), { reflectDamagePercent: 0.15 });
    for (const id of ['atsumori', 'sacral_power', 'fragarach', 'light_counter']) assert.equal(resolveSkillBuffDurationMs(CANONICAL_SKILL_REGISTRY_V2[id]), id === 'fragarach' ? 30_000 : 20_000);
    assert.deepEqual(resolveSkillTargetDebuffStats(CANONICAL_SKILL_REGISTRY_V2.wild_dance), { actionsDisabled: 1 });
    assert.equal(resolveSkillTargetDebuffDurationMs(CANONICAL_SKILL_REGISTRY_V2.wild_dance), 1_000);
    assert.deepEqual(resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.collect_shadow_souls), { pSkillPowerPercent: 0.05 });
    assert.deepEqual(resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.collect_light_souls), { mSkillPowerPercent: 0.05, mSkillCdr: 0.05 });
    const reflectingBuffs = {
      fragarach: { skillBuffStats: resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.fragarach), until: 40_000 },
      light_counter: { skillBuffStats: resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.light_counter), until: 40_000 }
    };
    assert.equal(resolvePlayerDamageReflection(reflectingBuffs, 1_000, 10_000), 250);
    assert.equal(resolvePlayerDamageReflection(reflectingBuffs, 1_000, 40_000), 0);
  });

  it('maps sourced fighter and caster buffs to stats consumed by combat', () => {
    assert.deepEqual(resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.bison_spirit_totem, 1), { pAtkPercent: 0.10, cdr: 0.10, pDefPercent: 0.05, crit: 50 });
    assert.deepEqual(resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.synchro_freedom, 1), { pSkillPowerPercent: 0.02, maxHpFlat: 1_500, debuffResistancePercent: 0.30 });
    assert.deepEqual(resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.elemental_mastership, 1), { matk: 500, mSkillPowerPercent: 0.15, maxMpPercent: 0.20 });
    assert.deepEqual(resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.soul_weapon, 1), { pAtkPercent: 0.20, crit: 10, pveDamagePercent: 0.05 });
  });

  it('executes sourced defensive, knockdown, and healing skill adaptations', () => {
    assert.deepEqual(resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.flamenco, 1), { maxHpFlat: 1_000, atk: 1_000, def: 1_000, mdef: 1_000, pveDamagePercent: 0.10, cdr: 0.15, movementSpeedPercent: 0.15 });
    assert.deepEqual(resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.ogre_s_essence, 1), { def: 300, mdef: 300, damageTakenReductionPercent: 0.05 });
    assert.deepEqual(resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.wondrous_power, 1), { def: 2_000, mdef: 2_000, debuffResistancePercent: 0.30 });
    assert.deepEqual(resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.final_secret, 1), { pSkillPowerPercent: 0.10, damageTakenReductionPercent: 0.10 });
    const stomp = CANONICAL_SKILL_REGISTRY_V2.giant_s_stomp;
    const target = { _skillDebuffs: { giant_s_stomp: { stats: resolveSkillTargetDebuffStats(stomp), until: 4_000 } } };
    assert.deepEqual(resolveSkillTargetDebuffStats(stomp), { actionsDisabled: 1 });
    assert.equal(resolveSkillTargetDebuffDurationMs(stomp), 3_000);
    assert.equal(isMonsterActionDisabled(target, 2_000), true);
    assert.equal(isMonsterActionDisabled(target, 4_001), false);
    assert.equal(resolveSkillFixedHeal(CANONICAL_SKILL_REGISTRY_V2.pa_agrio_s_cure), 1_800);
  });

  it('applies researched wolf, archer, song, rose, and assassin effects', () => {
    assert.deepEqual(resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.howling, 1), { pAtkPercent: 0.20 });
    assert.deepEqual(resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.eliminate_obstruction, 1), { debuffResistancePercent: 0.10 });
    assert.deepEqual(resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.kingdom_of_plants, 1), { mAtkPercent: 0.10, crit: 5, pveDamagePercent: 0.10, mpRegen: 10 });
    const focus = CANONICAL_SKILL_REGISTRY_V2.focus_power;
    assert.equal(focus.requiredWeapon, 'dagger', 'the production cast gate enforces the source weapon condition');
    assert.deepEqual(resolveSkillBuffStats(focus, 1), { pAtkPercent: 0.10 });
    const curse = CANONICAL_SKILL_REGISTRY_V2.murder_attempt;
    assert.deepEqual(resolveSkillTargetDebuffStats(curse), { pDefPercent: -0.10, mDefPercent: -0.10 });
    assert.equal(resolveSkillTargetDebuffDurationMs(curse), 10_000);
  });

  it('routes Freezing Wound as damage with a short monster cooldown and attack-rate slow', () => {
    const def = CANONICAL_SKILL_REGISTRY_V2.freezing_wound;
    assert.equal(def.type, 'active');
    assert.deepEqual(resolveSkillTargetDebuffStats(def), {
      atkSpdPercent: -0.20,
      cooldownPercent: 0.20
    });
    assert.equal(resolveSkillTargetDebuffDurationMs(def), 3_000);
  });

  it('adapts Chant of Vampire speed, resistance, and probabilistic life drain for card combat', () => {
    const effect = resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.chant_of_vampire, 1);
    assert.deepEqual(effect, {
      movementSpeedPercent: 0.02,
      debuffResistancePercent: 0.10,
      lifeDrainProcChance: 0.80,
      lifeDrainProcPercent: 0.07
    });
    const state = DEFAULT_STATE();
    const before = getStats(state);
    state.buffs.chant_of_vampire = { until: Date.now() + 60_000, skillBuffStats: effect };
    const after = getStats(state);
    assert.equal(after.cdr, before.cdr);
    assert.equal(after.movementSpeedPercent, before.movementSpeedPercent + 0.02);
    assert.equal(after.debuffResistancePercent, before.debuffResistancePercent + 0.10);
    assert.equal(after.atkSpd, before.atkSpd);
  });

  it('applies Chant of Vampire life drain only on a successful proc and respects HP limits and expiry', () => {
    const applyLifeDrain = SkillEffectService.applyPlayerBuffLifeDrainProc;
    assert.equal(typeof applyLifeDrain, 'function');
    const now = 10_000;
    const buffs = {
      chant_of_vampire: {
        until: now + 5_000,
        skillBuffStats: { lifeDrainProcChance: 0.80, lifeDrainProcPercent: 0.07 }
      }
    };
    const procState = { hp: 500, buffs };
    assert.equal(applyLifeDrain(1_000, procState, 1_000, now, () => 0.79), 70);
    assert.equal(procState.hp, 570);

    const boundaryState = { hp: 500, buffs };
    assert.equal(applyLifeDrain(1_000, boundaryState, 1_000, now, () => 0.80), 0);
    assert.equal(boundaryState.hp, 500);

    const cappedState = { hp: 950, buffs };
    assert.equal(applyLifeDrain(1_000, cappedState, 1_000, now, () => 0), 50);
    assert.equal(cappedState.hp, 1_000);
    assert.equal(applyLifeDrain(1_000, { hp: 500, buffs }, 1_000, now + 5_000, () => 0), 0);
  });

  it('adapts Sacrifice to a production self-heal with a meaningful HP payment', () => {
    const def = CANONICAL_SKILL_REGISTRY_V2.sacrifice;
    assert.equal(resolveSkillHealPower(def), 350);
    assert.equal(resolveSkillHpSacrificeCost(def, 1000), 100);
    assert.equal(resolveSkillHpSacrificeCost(def, 1000, 50), 0);
    assert.equal(resolveSkillHpSacrificeCost(CANONICAL_SKILL_REGISTRY_V2.greater_heal, 1000), 0);
  });

  it('routes Unleashed Power defense and physical skill power through combat consumers', () => {
    const def = CANONICAL_SKILL_REGISTRY_V2.unleashed_power;
    const effect = resolveSkillBuffStats(def);
    assert.deepEqual(effect, {
      damageTakenReductionPercent: 0.03,
      debuffResistancePercent: 0.05,
      pSkillPowerPercent: 0.01
    });
    assert.equal(resolveSkillBuffDurationMs(def), 10_000);

    const state = DEFAULT_STATE();
    state.level = 75;
    const baseline = getStats(state);
    state.buffs.unleashed_power = { until: Date.now() + 10_000, skillBuffStats: effect };
    const empowered = getStats(state);
    assert.equal(empowered.damageTakenReductionPercent, 0.03);
    assert.equal(empowered.debuffResistancePercent, baseline.debuffResistancePercent + 0.05);
    assert.equal(empowered.pSkillPowerPercent, 0.01);
    assert.equal(applyPlayerSkillPowerBonus(1000, empowered, 'physical'), 1010);
    assert.equal(applyPlayerSkillPowerBonus(1000, empowered, 'magical'), 1000);
    assert.equal(applyPlayerDamageTakenReduction(1000, empowered), 970);
    assert.equal(applyPlayerDamageTakenReduction(1, empowered), 1);
    assert.equal(applyPlayerDamageTakenReduction(0, empowered), 0);
  });

  it('routes HP Recovery and MP Recovery passives into the stats consumed by combat ticks', () => {
    const hpState = DEFAULT_STATE();
    const baseHpRegen = getStats(hpState).regenHp;
    hpState.skills.hp_recovery = 1;
    assert.equal(getStats(hpState).regenHp, baseHpRegen + 0.01);

    const mpState = DEFAULT_STATE();
    const baseMpRegen = getStats(mpState).mpRegen;
    mpState.skills.mp_recovery = 1;
    assert.equal(getStats(mpState).mpRegen, baseMpRegen + 0.5);
  });

  it('applies Glorious Warrior CON and MEN through primary attributes and derived combat stats', () => {
    const def = CANONICAL_SKILL_REGISTRY_V2.glorious_warrior_enhanced_abilities;
    assert.deepEqual(resolveSkillBuffStats(def), { con: 1, men: 1 });
    assert.equal(resolveSkillBuffDurationMs(def), 10_000);
    const state = DEFAULT_STATE();
    state.level = 100;
    const baseStats = getStats(state);
    const basePrimary = { ...state.primaryStats };
    state.buffs.glorious_warrior_enhanced_abilities = {
      until: Date.now() + 10_000,
      skillBuffStats: resolveSkillBuffStats(def)
    };
    const buffedStats = getStats(state);
    assert.equal(state.primaryStats.con, basePrimary.con + 1);
    assert.equal(state.primaryStats.men, basePrimary.men + 1);
    assert.ok(buffedStats.maxHp > baseStats.maxHp);
    assert.ok(buffedStats.maxMp > baseStats.maxMp);
    assert.ok(buffedStats.mdef > baseStats.mdef);
  });

  it('adapts Berserker Spirit as a timed offense-for-defense tradeoff', () => {
    assert.deepEqual(resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.berserker_spirit), {
      pAtkPercent: 0.05,
      mAtkPercent: 0.10,
      cdr: 0.10,
      pDefPercent: -0.05,
      mDefPercent: -0.10,
      eva: -2
    });
    assert.equal(resolveSkillBuffDurationMs(CANONICAL_SKILL_REGISTRY_V2.berserker_spirit), 8_000);
  });

  it('adapts Wild Magic into the shared critical chance stat used by the combat loop', () => {
    assert.deepEqual(resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.wild_magic), { crit: 5 });
    assert.equal(resolveSkillBuffDurationMs(CANONICAL_SKILL_REGISTRY_V2.wild_magic), 8_000);
    const state = DEFAULT_STATE();
    state.buffs.wild_magic = { until: Date.now() + 8_000, skillBuffStats: resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.wild_magic) };
    assert.equal(getStats(state).crit, getStats({ ...state, buffs: {} }).crit + 5);
  });

  it('adapts Improved Speed into a brief cooldown window for card combat', () => {
    assert.deepEqual(resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.improved_speed), { cdr: 0.10 });
    assert.equal(resolveSkillBuffDurationMs(CANONICAL_SKILL_REGISTRY_V2.improved_speed), 12_000);
  });

  it('adapts the missing warrior buffs into distinct timed offense and defense effects', () => {
    assert.deepEqual(resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.rage), {
      pAtkPercent: 0.10,
      cdr: 0.05
    });
    assert.deepEqual(resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.soul_roar), {
      pAtkPercent: 0.08,
      debuffResistancePercent: 0.10
    });
    assert.deepEqual(resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.soul_guard), {
      pDefPercent: 0.15,
      mDefPercent: 0.10,
      debuffResistancePercent: 0.10
    });
    for (const id of ['rage', 'soul_roar', 'soul_guard']) {
      assert.equal(resolveSkillBuffDurationMs(CANONICAL_SKILL_REGISTRY_V2[id]), 8_000);
    }

    const state = DEFAULT_STATE();
    state.level = 80;
    const baseline = getStats(state);
    state.buffs.rage = {
      until: Date.now() + 8_000,
      skillBuffStats: resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.rage)
    };
    const enraged = getStats(state);
    assert.ok(enraged.atk > baseline.atk);
    assert.equal(enraged.cdr, baseline.cdr + 0.05);
    assert.equal(enraged.atkSpd, baseline.atkSpd);

    state.buffs = {
      soul_roar: { until: Date.now() + 8_000, skillBuffStats: resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.soul_roar) },
      soul_guard: { until: Date.now() + 8_000, skillBuffStats: resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.soul_guard) }
    };
    const guarded = getStats(state);
    assert.ok(guarded.atk > baseline.atk);
    assert.ok(guarded.def > baseline.def);
    assert.ok(guarded.mdef > baseline.mdef);
    assert.equal(guarded.debuffResistancePercent, baseline.debuffResistancePercent + 0.20);
  });

  it('adapts the four Samurai elemental stances into distinct timed combat stats', () => {
    const expected = {
      fire: { pAtkPercent: 0.10 },
      wind: { cdr: 0.08 },
      mountain: { pDefPercent: 0.15, mDefPercent: 0.10 },
      forest: { eva: 15, debuffResistancePercent: 0.10 }
    };
    for (const [id, stats] of Object.entries(expected)) {
      const def = CANONICAL_SKILL_REGISTRY_V2[id];
      const effect = resolveSkillBuffStats(def);
      assert.deepEqual(effect, stats, `${id} has a distinct documented combat mapping`);
      assert.equal(resolveSkillBuffDurationMs(def), 8_000);
      const state = DEFAULT_STATE();
      state.level = 70;
      const baseline = getStats(state);
      state.buffs[id] = { until: Date.now() + 8_000, skillBuffStats: effect };
      const active = getStats(state);
      if (stats.pAtkPercent) assert.ok(active.atk > baseline.atk);
      if (stats.cdr) {
        assert.equal(active.cdr, baseline.cdr + stats.cdr);
        assert.equal(active.atkSpd, baseline.atkSpd);
      }
      if (stats.pDefPercent) assert.ok(active.def > baseline.def);
      if (stats.mDefPercent) assert.ok(active.mdef > baseline.mdef);
      if (stats.eva) assert.equal(active.eva, baseline.eva + stats.eva);
      if (stats.debuffResistancePercent) assert.equal(active.debuffResistancePercent, baseline.debuffResistancePercent + stats.debuffResistancePercent);
    }
  });

  it('adapts the Sylph, wind-walker, and wind-blessing buffs to real combat stats', () => {
    const expected = {
      elemental_magic_barrier: { mDefPercent: 0.15, debuffResistancePercent: 0.10 },
      elemental_insight: { mAtkPercent: 0.10, mSkillCdr: 0.05 },
      soul_wind_walk: { movementSpeedPercent: 0.06 },
      blessing_of_winds: { movementSpeedPercent: 0.08, debuffResistancePercent: 0.10 }
    };
    const durations = { elemental_magic_barrier: 8_000, elemental_insight: 8_000, soul_wind_walk: 10_000, blessing_of_winds: 10_000 };
    for (const [id, stats] of Object.entries(expected)) {
      const def = CANONICAL_SKILL_REGISTRY_V2[id];
      const effect = resolveSkillBuffStats(def);
      assert.deepEqual(effect, stats, `${id} has a distinct combat mapping`);
      assert.equal(resolveSkillBuffDurationMs(def), durations[id]);
      const state = DEFAULT_STATE();
      state.level = 80;
      const baseline = getStats(state);
      state.buffs[id] = { until: Date.now() + durations[id], skillBuffStats: effect };
      const active = getStats(state);
      if (stats.mDefPercent) assert.ok(active.mdef > baseline.mdef);
      if (stats.mAtkPercent) assert.ok(active.matk > baseline.matk);
      if (stats.cdr) assert.equal(active.cdr, baseline.cdr + stats.cdr);
      if (stats.movementSpeedPercent) {
        assert.equal(active.movementSpeedPercent, baseline.movementSpeedPercent + stats.movementSpeedPercent);
        assert.equal(active.cdr, baseline.cdr);
      }
      if (stats.mSkillCdr) assert.equal(active.mSkillCdr, baseline.mSkillCdr + stats.mSkillCdr);
      if (stats.eva) assert.equal(active.eva, baseline.eva + stats.eva);
      if (stats.debuffResistancePercent) assert.equal(active.debuffResistancePercent, baseline.debuffResistancePercent + stats.debuffResistancePercent);
      assert.equal(active.atkSpd, baseline.atkSpd);
    }
  });

  it('resolves Sharp Blade by its three official levels and preserves the cooldown stat', () => {
    const def = CANONICAL_SKILL_REGISTRY_V2.sharp_blade;
    const expected = [
      { pAtkPercent: 0.05 },
      { pAtkPercent: 0.07, crit: 2, pveDamagePercent: 0.03 },
      { pAtkPercent: 0.10, crit: 5, pveDamagePercent: 0.05 }
    ];
    for (let level = 1; level <= 3; level++) {
      const effect = resolveSkillBuffStats(def, level);
      assert.deepEqual(effect, expected[level - 1]);
      const state = DEFAULT_STATE();
      state.level = 80;
      const baseline = getStats(state);
      state.buffs.sharp_blade = { until: Date.now() + 8_000, skillBuffStats: effect };
      const active = getStats(state);
      assert.ok(active.atk > baseline.atk);
      if (effect.crit) assert.equal(active.crit, baseline.crit + effect.crit);
      if (effect.pveDamagePercent) assert.equal(active.pveDamagePercent, baseline.pveDamagePercent + effect.pveDamagePercent);
      assert.equal(active.atkSpd, baseline.atkSpd);
      assert.equal(resolveSkillBuffDurationMs(def), 8_000);
    }
  });

  it('applies Frost Flame damage once per second for its canonical 15-second duration', () => {
    const def = CANONICAL_SKILL_REGISTRY_V2.frost_flame;
    assert.deepEqual(resolveSkillDamageOverTime(def), { durationMs: 15_000, intervalMs: 1_000 });
    assert.equal(resolveSkillDamageOverTime(CANONICAL_SKILL_REGISTRY_V2.power_strike), null);

    const target = { hp: 10_000 };
    const effect = applySkillDamageOverTime(target, def, 300, 5_000);
    assert.equal(effect.damagePerTick, 20);
    assert.equal(effect.until, 20_000);
    assert.deepEqual(processSkillDamageOverTime(target, 5_999), []);
    assert.deepEqual(processSkillDamageOverTime(target, 6_000), [{ skillId: 'frost_flame', damage: 20 }]);
    target.hp -= 20;
    assert.deepEqual(processSkillDamageOverTime(target, 7_000), [{ skillId: 'frost_flame', damage: 20 }]);
    target.hp -= 20;

    // A recast refreshes duration without postponing the periodic tick.
    const refreshed = applySkillDamageOverTime(target, def, 300, 7_000);
    assert.equal(refreshed.nextTickAt, 8_000);
    assert.equal(refreshed.until, 22_000);
    for (let now = 8_000; now <= 22_000; now += 1_000) {
      for (const tick of processSkillDamageOverTime(target, now)) target.hp -= tick.damage;
    }
    assert.equal(target.hp, 9_660);
    assert.deepEqual(target._skillDots, {});

    const delayedFinalTick = {};
    applySkillDamageOverTime(delayedFinalTick, def, 300, 0);
    for (let now = 1_000; now < 15_000; now += 1_000) processSkillDamageOverTime(delayedFinalTick, now);
    assert.deepEqual(processSkillDamageOverTime(delayedFinalTick, 15_010), [{ skillId: 'frost_flame', damage: 20 }]);
    assert.deepEqual(delayedFinalTick._skillDots, {});
  });

  it('adapts Freezing Flame into ten seconds of timed damage in card combat', () => {
    const def = CANONICAL_SKILL_REGISTRY_V2.freezing_flame;
    assert.deepEqual(resolveSkillDamageOverTime(def), { durationMs: 10_000, intervalMs: 1_000 });
    const target = { hp: 1_000 };
    const dot = applySkillDamageOverTime(target, def, 200, 0);
    assert.equal(dot.damagePerTick, 20);
    assert.equal(dot.until, 10_000);
    assert.deepEqual(processSkillDamageOverTime(target, 1_000), [{ skillId: 'freezing_flame', damage: 20 }]);
    for (let now = 2_000; now <= 10_000; now += 1_000) {
      assert.deepEqual(processSkillDamageOverTime(target, now), [{ skillId: 'freezing_flame', damage: 20 }]);
    }
    assert.deepEqual(target._skillDots, {});
  });

  it('resolves Vitalize power as healing and removes only monster combat debuffs', () => {
    assert.equal(resolveSkillHealPower(CANONICAL_SKILL_REGISTRY_V2.vitalize), 460);
    assert.equal(resolveSkillHealPower(CANONICAL_SKILL_REGISTRY_V2.power_strike), null);

    const state = DEFAULT_STATE();
    state.buffs = {
      monster_hex: { amount: 20, until: Date.now() + 10_000 },
      monster_gloom: { amount: 20, until: Date.now() + 10_000 },
      monster_friendly: { amount: 10, until: Date.now() + 10_000 },
      haste: { until: Date.now() + 10_000, skillBuffStats: { cdr: 0.15 } }
    };
    assert.deepEqual(clearPlayerCombatDebuffs(state), ['monster_hex', 'monster_gloom']);
    assert.deepEqual(Object.keys(state.buffs), ['monster_friendly', 'haste']);
  });

  it('applies and expires the Hex and Gloom defense penalties generated by monster combat', () => {
    const state = DEFAULT_STATE();
    state.class = 'mage';
    state.level = 40;
    const before = getStats(state);
    const monster = { atk: 100, matk: 100, hp: 1000, _maxHp: 1000, _aiState: { archetype: MONSTER_ARCHETYPES.SUPPORT } };
    const originalRandom = Math.random;
    const rolls = [0.5, 0.1, 0.25, 0.5, 0.1, 0.75];
    let rollIndex = 0;
    try {
      Math.random = () => rolls[rollIndex++] ?? 0.5;
      const hex = MonsterAIEngine.processMonsterAttack(monster, before, state);
      assert.equal(hex.appliedDebuff.type, 'hex');
      const hexStats = getStats(state);
      assert.ok(hexStats.def < before.def, 'Hex reduces physical defense');
      assert.ok(calculateDefenseMitigation(10_000, hexStats.def) > calculateDefenseMitigation(10_000, before.def));

      const gloom = MonsterAIEngine.processMonsterAttack(monster, hexStats, state);
      assert.equal(gloom.appliedDebuff.type, 'gloom');
      const weakened = getStats(state);
      assert.ok(weakened.mdef < before.mdef, 'Gloom reduces magic defense');
      assert.ok(calculateDefenseMitigation(10_000, weakened.mdef) > calculateDefenseMitigation(10_000, before.mdef));
    } finally {
      Math.random = originalRandom;
    }
    state.buffs.monster_hex.until = Date.now() - 1;
    state.buffs.monster_gloom.until = Date.now() - 1;
    const expired = getStats(state);
    assert.equal(expired.def, before.def);
    assert.equal(expired.mdef, before.mdef);
  });

  it('reflects the canonical Blazing Skin percentage through active buff state', () => {
    const effect = resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.blazing_skin);
    assert.deepEqual(effect, { reflectDamagePercent: 0.03 });
    assert.equal(resolvePlayerDamageReflection({ blazing_skin: { until: 10_000, skillBuffStats: effect } }, 100, 9_999), 3);
    assert.equal(resolvePlayerDamageReflection({ blazing_skin: { until: 9_999, skillBuffStats: effect } }, 100, 9_999), 0);
  });

  it('resolves Acumen cooldown effects from canonical skill data', () => {
    assert.deepEqual(resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.acumen), { cdr: 0.15 });
  });

  it('applies Blessed Shield to the real shield-block stat and requires an equipped shield', () => {
    const effect = resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.blessed_shield, 1, { hasShield: true });
    assert.deepEqual(effect, { blockRate: 5 });
    assert.equal(resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.blessed_shield, 1, { hasShield: false }), null);

    const state = DEFAULT_STATE();
    state.class = 'prophet';
    state.level = 42;
    state.inventory.push({ uid: 'test-shield', itemId: 'test_shield', type: 'shield', slot: 'shield', def: 20, count: 1 });
    state.equipment.shield = 'test-shield';
    const baseline = getStats(state);
    state.buffs.blessed_shield = { until: Date.now() + 60_000, skillBuffStats: effect };
    const activeStats = getStats(state);
    assert.equal(activeStats.block, baseline.block + 5);
    assert.deepEqual(resolvePlayerBlock(100, activeStats.block, 'physical', 0.03), { blocked: true, damage: 50 });
    assert.deepEqual(resolvePlayerBlock(100, activeStats.block, 'magical', 0.03), { blocked: false, damage: 100 });

    state.equipment.shield = null;
    const withoutShield = getStats(state);
    assert.equal(withoutShield.block, baseline.block);
    assert.deepEqual(resolvePlayerBlock(100, withoutShield.block, 'physical', 0.03), { blocked: false, damage: 100 });
  });

  it('applies Advanced Block to equipped shield defense and real incoming-damage mitigation', () => {
    const effect = resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.advanced_block, 1, { hasShield: true });
    assert.deepEqual(effect, { shieldDefPercent: 0.10 });
    assert.equal(resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.advanced_block, 1, { hasShield: false }), null);

    const state = DEFAULT_STATE();
    state.class = 'prophet';
    state.level = 42;
    state.inventory.push({ uid: 'test-shield', itemId: 'test_shield', type: 'shield', slot: 'shield', def: 20, count: 1 });
    state.equipment.shield = 'test-shield';
    const baseline = getStats(state);
    state.buffs.advanced_block = { until: Date.now() + 60_000, skillBuffStats: effect };
    const active = getStats(state);
    assert.equal(active.def, baseline.def + 2);
    assert.ok(calculateDefenseMitigation(10_000, active.def) < calculateDefenseMitigation(10_000, baseline.def));

    state.equipment.shield = null;
    const noShieldBaseline = getStats(state);
    const withoutShield = getStats(state);
    assert.equal(withoutShield.def, noShieldBaseline.def);
    assert.equal(calculateDefenseMitigation(10_000, withoutShield.def), calculateDefenseMitigation(10_000, noShieldBaseline.def));
  });

  it('converts Haste speed into cooldown reduction through production skill casting', () => {
    const effect = resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.haste);
    assert.deepEqual(effect, { cdr: 0.15 });

    const plain = DEFAULT_STATE();
    plain.level = 80;
    plain.class = 'gladiator';
    const buffed = structuredClone(plain);
    buffed.buffs = { haste: { until: Date.now() + 60_000, skillBuffStats: effect } };

    const plainStats = getStats(plain);
    const buffedStats = getStats(buffed);
    assert.equal(buffedStats.cdr, plainStats.cdr + 0.15);
    assert.equal(buffedStats.atkSpd, plainStats.atkSpd);
    const skill = { id: 'haste_cooldown_test', type: 'active', baseCd: 10_000, gameplay: { mpCost: 1 } };
    assert.equal(canCastSkill({ mp: 100, stats: plainStats }, skill, 9_000, { [skill.id]: 0 }).canCast, false);
    assert.equal(canCastSkill({ mp: 100, stats: buffedStats }, skill, 9_000, { [skill.id]: 0 }).canCast, true);
    buffed.buffs.haste.until = Date.now() - 1;
    assert.equal(getStats(buffed).cdr, plainStats.cdr);
  });

  it('resolves all canonical Haste and Acumen variants to their stage-specific cooldown bonuses', () => {
    const variants = [
      ['chant_of_haste', 0.15],
      ['elemental_haste', 0.15],
      ['maphr_s_haste', 0.35],
      ['soul_haste', 0.35],
      ['chant_of_acumen', 0.15],
      ['maphr_s_acumen', 0.33],
      ['soul_acumen', 0.33]
    ];

    for (const [skillId, expectedCdr] of variants) {
      const effect = resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2[skillId]);
      assert.deepEqual(effect, { cdr: expectedCdr }, `${skillId} resolved effect`);

      const state = DEFAULT_STATE();
      state.level = 80;
      state.class = 'sorcerer';
      const baseline = getStats(state);
      state.buffs[skillId] = { until: Date.now() + 60_000, skillBuffStats: effect };
      const active = getStats(state);
      assert.equal(active.cdr, baseline.cdr + expectedCdr, `${skillId} cooldown reduction`);
      assert.equal(active.atkSpd, baseline.atkSpd, `${skillId} does not increase attack speed`);

      const skill = { id: `${skillId}_gate`, type: 'active', baseCd: 10_000, gameplay: { mpCost: 1 } };
      const availableAt = Math.ceil(10_000 * (1 - expectedCdr)) + 1;
      assert.equal(canCastSkill({ mp: 100, stats: active }, skill, availableAt, { [skill.id]: 0 }).canCast, true, `${skillId} shortens the real cooldown gate`);
    }
  });

  it('converts Concentration into resistance against real monster combat debuffs', () => {
    const effect = resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.concentration);
    assert.deepEqual(effect, { debuffResistancePercent: 0.36 });

    const unprotected = DEFAULT_STATE();
    const protectedState = DEFAULT_STATE();
    protectedState.buffs.concentration = { until: Date.now() + 60_000, skillBuffStats: effect };
    const unprotectedStats = getStats(unprotected);
    const protectedStats = getStats(protectedState);
    assert.equal(protectedStats.debuffResistancePercent, 0.36);

    const monster = { atk: 100, matk: 100, hp: 1000, _maxHp: 1000, _aiState: { archetype: MONSTER_ARCHETYPES.SUPPORT } };
    const originalRandom = Math.random;
    try {
      // Same successful 25% debuff roll in both cases; Concentration reduces
      // the final application chance to 16%, so this roll is resisted.
      const rolls = [0.5, 0.2, 0.5, 0.2];
      let index = 0;
      Math.random = () => rolls[index++] ?? 0.5;
      const exposedResult = MonsterAIEngine.processMonsterAttack(structuredClone(monster), unprotectedStats, unprotected);
      const protectedResult = MonsterAIEngine.processMonsterAttack(structuredClone(monster), protectedStats, protectedState);
      assert.ok(exposedResult.appliedDebuff, 'the unprotected character receives the debuff');
      assert.equal(protectedResult.appliedDebuff, null, 'Concentration resists the same debuff roll');
      assert.equal(protectedState.buffs.monster_hex, undefined);
      assert.equal(protectedState.buffs.monster_gloom, undefined);
    } finally {
      Math.random = originalRandom;
    }
  });

  it('applies Tough Skin passive debuff resistance to real monster debuff rolls', () => {
    const def = CANONICAL_SKILL_REGISTRY_V2.tough_skin;
    assert.equal(def.type, 'passive');
    assert.match(def.canonicalEffect, /20%.*debuff resistance/i);

    const unprotected = DEFAULT_STATE();
    const protectedState = DEFAULT_STATE();
    protectedState.skills.tough_skin = 1;
    const unprotectedStats = getStats(unprotected);
    const protectedStats = getStats(protectedState);
    assert.equal(unprotectedStats.debuffResistancePercent, 0);
    assert.equal(protectedStats.debuffResistancePercent, 0.20);

    const monster = { atk: 100, matk: 100, hp: 1000, _maxHp: 1000, _aiState: { archetype: MONSTER_ARCHETYPES.SUPPORT } };
    const originalRandom = Math.random;
    try {
      // Roll 0.22 applies the 25% unprotected debuff but is resisted at 20% resistance.
      Math.random = () => 0.22;
      const exposedResult = MonsterAIEngine.processMonsterAttack(structuredClone(monster), unprotectedStats, unprotected);
      const protectedResult = MonsterAIEngine.processMonsterAttack(structuredClone(monster), protectedStats, protectedState);
      assert.ok(exposedResult.appliedDebuff);
      assert.equal(protectedResult.appliedDebuff, null);
      assert.equal(protectedState.buffs.monster_hex, undefined);
      assert.equal(protectedState.buffs.monster_gloom, undefined);
    } finally {
      Math.random = originalRandom;
    }
  });

  it('adapts Confused Mind transformation into a temporary defensive stance', () => {
    const def = CANONICAL_SKILL_REGISTRY_V2.confused_mind;
    assert.deepEqual(resolveSkillBuffStats(def), {
      pDefPercent: 0.10,
      mDefPercent: 0.10,
      cdr: 0.05
    });
    assert.equal(resolveSkillBuffDurationMs(def), 8_000);

    const state = DEFAULT_STATE();
    const base = getStats(state);
    state.buffs.confused_mind = {
      until: Date.now() + 8_000,
      skillBuffStats: resolveSkillBuffStats(def)
    };
    const active = getStats(state);
    assert.ok(active.def > base.def);
    assert.ok(active.mdef > base.mdef);
    assert.equal(active.cdr, base.cdr + 0.05);
    assert.equal(active.atkSpd, base.atkSpd);
  });

  it('routes Assassin Secret Notes pages through the buff path with stage-specific stats', () => {
    const pages = [
      { id: 'assassin_s_secret_notes_1st_page', hp: 0.03, mp: 0.03, atk: 0.02, def: 0.02, crit: 10, cdr: 0.02, accuracy: 1 },
      { id: 'assassin_s_secret_notes_2nd_page', hp: 0.05, mp: 0.05, atk: 0.02, def: 0.02, crit: 10, cdr: 0.03, accuracy: 1 },
      { id: 'assassin_s_secret_notes_3rd_page', hp: 0.07, mp: 0.07, atk: 0.03, def: 0.03, crit: 20, cdr: 0.05, accuracy: 2 }
    ];
    for (const page of pages) {
      const def = CANONICAL_SKILL_REGISTRY_V2[page.id];
      assert.equal(def.type, 'buff', `${page.id} is a self-buff in the source data`);
      const effect = resolveSkillBuffStats(def);
      assert.deepEqual(effect, {
        maxHpPercent: page.hp,
        maxMpPercent: page.mp,
        pAtkPercent: page.atk,
        mAtkPercent: page.atk,
        pDefPercent: page.def,
        mDefPercent: page.def,
        pAccuracy: page.accuracy,
        mAccuracy: page.accuracy,
        crit: page.crit,
        cdr: page.cdr,
        movementSpeedPercent: page.id.endsWith('1st_page') ? 0.03 : page.id.endsWith('2nd_page') ? 0.04 : 0.05
      });
      assert.equal(resolveSkillBuffDurationMs(def), 15_000);

      const state = DEFAULT_STATE();
      state.level = 100;
      const before = getStats(state);
      state.buffs[page.id] = { until: Date.now() + 15_000, skillBuffStats: effect };
      const after = getStats(state);
      assert.ok(after.maxHp > before.maxHp);
      assert.ok(after.maxMp > before.maxMp);
      assert.ok(after.atk > before.atk);
      assert.ok(after.matk > before.matk);
      assert.ok(after.def > before.def);
      assert.ok(after.mdef > before.mdef);
      assert.equal(after.crit, before.crit + page.crit);
      assert.equal(after.cdr, before.cdr + page.cdr);
      assert.equal(after.pAccuracy, page.accuracy);
      assert.equal(after.mAccuracy, page.accuracy);
      assert.equal(after.atkSpd, before.atkSpd);
    }
  });

  it('lets the Assassin notes accuracy analogue counter level-gap misses in the production combat formula', () => {
    assert.equal(calculatePlayerMissChance(3, 0), 0.15);
    assert.ok(Math.abs(calculatePlayerMissChance(3, 1) - 0.10) < 1e-12);
    assert.equal(calculatePlayerMissChance(5, 2), 0.25);
    assert.equal(calculatePlayerMissChance(10, 2), 0.60);
    assert.equal(calculatePlayerMissChance(10, 20), 0);
  });

  it('adapts Warg movement, disarm, armor-break, and transformation skills to live card-combat effects', () => {
    const dash = CANONICAL_SKILL_REGISTRY_V2.quick_dash;
    assert.equal(dash.type, 'buff');
    assert.deepEqual(resolveSkillBuffStats(dash), { cdr: 0.05 });
    assert.equal(resolveSkillBuffDurationMs(dash), 2_000);

    const moon = CANONICAL_SKILL_REGISTRY_V2.moon_influence;
    assert.deepEqual(resolveSkillBuffStats(moon), {
      pAtkPercent: 0.15,
      pDefPercent: 0.10,
      mDefPercent: 0.10,
      cdr: 0.10,
      debuffResistancePercent: 0.10
    });
    assert.equal(resolveSkillBuffDurationMs(moon), 12_000);

    const state = DEFAULT_STATE();
    state.level = 100;
    const before = getStats(state);
    state.buffs.moon_influence = {
      until: Date.now() + 12_000,
      skillBuffStats: resolveSkillBuffStats(moon)
    };
    const after = getStats(state);
    assert.ok(after.atk > before.atk);
    assert.ok(after.def > before.def);
    assert.ok(after.mdef > before.mdef);
    assert.equal(after.cdr, before.cdr + 0.10);
    assert.equal(after.debuffResistancePercent, before.debuffResistancePercent + 0.10);
    assert.equal(after.atkSpd, before.atkSpd);

    const artful = CANONICAL_SKILL_REGISTRY_V2.artful_disarm;
    const piercing = CANONICAL_SKILL_REGISTRY_V2.imminent_piercing;
    assert.deepEqual(resolveSkillTargetDebuffStats(artful), { pAtkPercent: -0.20 });
    assert.deepEqual(resolveSkillTargetDebuffStats(piercing), { pDefPercent: -0.15 });
    assert.equal(resolveSkillTargetDebuffDurationMs(artful), 5_000);
    assert.equal(resolveSkillTargetDebuffDurationMs(piercing), 5_000);

    const target = {
      atk: 100,
      def: 100,
      _skillDebuffs: {
        artful_disarm: { stats: resolveSkillTargetDebuffStats(artful), until: Date.now() + 5_000 },
        imminent_piercing: { stats: resolveSkillTargetDebuffStats(piercing), until: Date.now() + 5_000 }
      }
    };
    assert.equal(getDebuffedMonsterAttack(target, target.atk), 80);
    assert.equal(getDebuffedMonsterDefense(target).def, 85);
    assert.equal(getDebuffedMonsterAttack(target, target.atk, 'physical', Date.now() + 5_001), 100);
    assert.equal(getDebuffedMonsterDefense(target, Date.now() + 5_001).def, 100);
  });

  it('adapts Warg transformation and extra buff-slot passives to durable card-combat bonuses', () => {
    const state = DEFAULT_STATE();
    state.class = null;
    state.level = 100;
    const base = getStats(state);
    state.skills.unleashed_potential = 1;
    const awakened = getStats(state);
    assert.ok(awakened.atk > base.atk);
    assert.equal(awakened.cdr, base.cdr + 0.05);
    assert.equal(awakened.debuffResistancePercent, base.debuffResistancePercent + 0.05);

    const beforeInspiration = getStats(state);
    state.skills.divine_inspiration = 1;
    const inspired = getStats(state);
    assert.equal(inspired.buffDurationPercent, 0.10);
    assert.equal(applySkillBuffDurationBonus(10_000, inspired), 11_000);
    assert.equal(applySkillBuffDurationBonus(10_000, beforeInspiration), 10_000);
  });

  it('resolves Detect Weakness as a short vulnerability mark instead of an unsupported self-buff', () => {
    assert.deepEqual(resolveSkillTargetDebuffStats(CANONICAL_SKILL_REGISTRY_V2.detect_weakness), {
      damageTakenPercent: 0.08
    });
    const target = {
      atk: 100,
      _skillDebuffs: {
        detect_weakness: { stats: { damageTakenPercent: 0.08 }, until: Date.now() + 8_000 }
      }
    };
    assert.equal(applyTargetDamageTakenBonus(100, target), 108);
    target._skillDebuffs.detect_weakness.until = Date.now() - 1;
    assert.equal(applyTargetDamageTakenBonus(100, target), 100);
  });

  it('adapts Provoke into a timed vulnerability mark in single-target combat', () => {
    const effect = resolveSkillTargetDebuffStats(CANONICAL_SKILL_REGISTRY_V2.provoke);
    assert.deepEqual(effect, { damageTakenPercent: 0.05 });
    assert.equal(resolveSkillTargetDebuffDurationMs(CANONICAL_SKILL_REGISTRY_V2.provoke), 10_000);

    const target = {
      _skillDebuffs: {
        provoke: { stats: effect, until: 5_000 }
      }
    };
    assert.equal(applyTargetDamageTakenBonus(100, target, 4_999), 105);
    assert.equal(applyTargetDamageTakenBonus(100, target, 5_000), 100);
  });

  it('adapts PvP-only Disarm and weapon resistance marking to measurable PvE target effects', () => {
    const disarm = CANONICAL_SKILL_REGISTRY_V2.disarm;
    const disarmEffect = resolveSkillTargetDebuffStats(disarm);
    assert.deepEqual(disarmEffect, { pAtkPercent: -0.20 });
    assert.equal(resolveSkillTargetDebuffDurationMs(disarm), 2_000);

    const stigma = CANONICAL_SKILL_REGISTRY_V2.shillien_s_stigma;
    const stigmaEffect = resolveSkillTargetDebuffStats(stigma);
    assert.deepEqual(stigmaEffect, { damageTakenPercent: 0.10, mDefPercent: -0.10 });
    assert.equal(resolveSkillTargetDebuffDurationMs(stigma), 8_000);

    const target = {
      atk: 100,
      mdef: 200,
      _skillDebuffs: {
        disarm: { stats: disarmEffect, until: 2_000 },
        shillien_s_stigma: { stats: stigmaEffect, until: 8_000 }
      }
    };
    assert.equal(getDebuffedMonsterAttack(target, 100, 'physical', 1_999), 80);
    assert.deepEqual(getDebuffedMonsterDefense(target, 7_999), { def: 0, mdef: 180 });
    assert.equal(applyTargetDamageTakenBonus(100, target, 7_999), 110);
    assert.equal(getDebuffedMonsterAttack(target, 100, 'physical', 2_000), 100);
    assert.equal(getDebuffedMonsterDefense(target, 8_000).mdef, 200);
    assert.equal(applyTargetDamageTakenBonus(100, target, 8_000), 100);
  });

  it('adapts Dreaming Spirit sleep into a five-second action lock', () => {
    const effect = resolveSkillTargetDebuffStats(CANONICAL_SKILL_REGISTRY_V2.dreaming_spirit);
    assert.deepEqual(effect, { actionsDisabled: 1 });
    assert.equal(resolveSkillTargetDebuffDurationMs(CANONICAL_SKILL_REGISTRY_V2.dreaming_spirit), 5_000);

    const target = { _skillDebuffs: { dreaming_spirit: { stats: effect, until: 5_000 } } };
    assert.equal(isMonsterActionDisabled(target, 4_999), true);
    assert.equal(isMonsterActionDisabled(target, 5_000), false);
  });

  it('adapts Hamstring movement slow into a timed reduction of the monster attack cadence', () => {
    const effect = resolveSkillTargetDebuffStats(CANONICAL_SKILL_REGISTRY_V2.hamstring);
    assert.deepEqual(effect, { movementSpeedPercent: -0.30 });
    assert.equal(resolveSkillTargetDebuffDurationMs(CANONICAL_SKILL_REGISTRY_V2.hamstring), 30_000);

    const target = {
      atkSpd: 1,
      _skillDebuffs: { hamstring: { stats: effect, until: 30_000 } }
    };
    assert.equal(getDebuffedMonsterAttackSpeed(target, 29_999), 0.7);
    assert.equal(getDebuffedMonsterAttackSpeed(target, 30_000), 1);
  });

  it('routes Confusion immobilization to a timed monster action lock', () => {
    const effect = resolveSkillTargetDebuffStats(CANONICAL_SKILL_REGISTRY_V2.confusion);
    assert.deepEqual(effect, { actionsDisabled: 1 });
    assert.equal(resolveSkillTargetDebuffDurationMs(CANONICAL_SKILL_REGISTRY_V2.confusion), 5_000);

    const target = { _skillDebuffs: { confusion: { stats: effect, until: 5_000 } } };
    assert.equal(isMonsterActionDisabled(target, 4_999), true);
    assert.equal(isMonsterActionDisabled(target, 5_000), false);
  });

  it('routes Shining Prison Hold to a five-second monster action lock', () => {
    const effect = resolveSkillTargetDebuffStats(CANONICAL_SKILL_REGISTRY_V2.shining_prison);
    assert.deepEqual(effect, { actionsDisabled: 1 });
    assert.equal(resolveSkillTargetDebuffDurationMs(CANONICAL_SKILL_REGISTRY_V2.shining_prison), 5_000);

    const target = { _skillDebuffs: { shining_prison: { stats: effect, until: 5_000 } } };
    assert.equal(isMonsterActionDisabled(target, 4_999), true);
    assert.equal(isMonsterActionDisabled(target, 5_000), false);
  });

  it('routes Anchor paralysis to a three-second monster action lock', () => {
    const effect = resolveSkillTargetDebuffStats(CANONICAL_SKILL_REGISTRY_V2.anchor);
    assert.deepEqual(effect, { actionsDisabled: 1 });
    assert.equal(resolveSkillTargetDebuffDurationMs(CANONICAL_SKILL_REGISTRY_V2.anchor), 3_000);

    const target = { _skillDebuffs: { anchor: { stats: effect, until: 3_000 } } };
    assert.equal(isMonsterActionDisabled(target, 2_999), true);
    assert.equal(isMonsterActionDisabled(target, 3_000), false);
  });

  it('routes Shackle and Dryad Root immobilization to timed monster action locks', () => {
    for (const id of ['shackle', 'dryad_root']) {
      const def = CANONICAL_SKILL_REGISTRY_V2[id];
      const effect = resolveSkillTargetDebuffStats(def);
      assert.deepEqual(effect, { actionsDisabled: 1 }, id);
      assert.equal(resolveSkillTargetDebuffDurationMs(def), 4_000, id);

      const target = { _skillDebuffs: { [id]: { stats: effect, until: 4_000 } } };
      assert.equal(isMonsterActionDisabled(target, 3_999), true, id);
      assert.equal(isMonsterActionDisabled(target, 4_000), false, id);
    }
  });

  it('maps Entangle movement slow to the target basic-attack interval', () => {
    const effect = resolveSkillTargetDebuffStats(CANONICAL_SKILL_REGISTRY_V2.entangle);
    assert.deepEqual(effect, { movementSpeedPercent: -0.70 });
    assert.equal(resolveSkillTargetDebuffDurationMs(CANONICAL_SKILL_REGISTRY_V2.entangle), 3_000);

    const target = { atkSpd: 1, _skillDebuffs: { entangle: { stats: effect, until: 3_000 } } };
    assert.ok(Math.abs(getDebuffedMonsterAttackSpeed(target, 2_999) - 0.3) < 1e-12);
    assert.equal(Math.round(1_500 / getDebuffedMonsterAttackSpeed(target, 2_999)), 5_000);
    assert.equal(getDebuffedMonsterSkillCooldownMultiplier(target, 2_999), 1);
    assert.equal(Math.round(1_500 / getDebuffedMonsterAttackSpeed(target, 2_999)), 5_000);
    assert.equal(getDebuffedMonsterAttackSpeed(target, 3_000), 1);
    assert.equal(getDebuffedMonsterSkillCooldownMultiplier(target, 3_000), 1);
  });

  it('maps a target movement-speed debuff to slower basic attacks without changing skill cooldown', () => {
    const def = CANONICAL_SKILL_REGISTRY_V2.ice_bolt;
    const effect = resolveSkillTargetDebuffStats(def);
    assert.deepEqual(effect, { movementSpeedPercent: -0.20 });
    assert.equal(resolveSkillTargetDebuffDurationMs(def), 30_000);

    const target = { atkSpd: 1, _skillDebuffs: { ice_bolt: { stats: effect, until: 30_000 } } };
    const slowedAttackSpeed = getDebuffedMonsterAttackSpeed(target, 29_999);
    assert.equal(slowedAttackSpeed, 0.8);
    assert.equal(Math.round(1_500 / slowedAttackSpeed), 1_875);
    assert.equal(getDebuffedMonsterSkillCooldownMultiplier(target, 29_999), 1);
    assert.equal(getDebuffedMonsterAttackSpeed(target, 30_000), 1);

    const adaptedProductionDef = {
      id: 'ice_bolt', type: 'active',
      desc: 'Dispara uma flecha de gelo congelante que causa dano mágico e reduz a velocidade do alvo.',
      canonicalEffect: 'Freezes the air around the target.Deals M. damage. Power 11.For 30 sec., the tar'
    };
    const adaptedEffect = resolveSkillTargetDebuffStats(adaptedProductionDef);
    assert.deepEqual(adaptedEffect, { movementSpeedPercent: -0.20 }, 'localized adapter data must retain the source-confirmed slow');
    assert.equal(resolveSkillTargetDebuffDurationMs(adaptedProductionDef), 30_000);
    const adaptedTarget = { atkSpd: 1, _skillDebuffs: { ice_bolt: { stats: adaptedEffect, until: 30_000 } } };
    assert.equal(Math.round(1_500 / getDebuffedMonsterAttackSpeed(adaptedTarget, 29_999)), 1_875);
    assert.equal(getDebuffedMonsterSkillCooldownMultiplier(adaptedTarget, 29_999), 1);
  });

  it('adapts Silent Move stealth into timed evasion against monster special skills', () => {
    const def = CANONICAL_SKILL_REGISTRY_V2.silent_move;
    const effect = resolveSkillBuffStats(def);
    assert.deepEqual(effect, { pSkillEvasionPercent: 0.10, mSkillEvasionPercent: 0.10 });
    assert.equal(resolveSkillBuffDurationMs(def), 8_000);

    const state = DEFAULT_STATE();
    const before = getStats(state);
    state.buffs.silent_move = { until: Date.now() + 8_000, skillBuffStats: effect };
    const hidden = getStats(state);
    assert.equal(hidden.pSkillEvasionPercent, before.pSkillEvasionPercent + 0.10);
    assert.equal(hidden.mSkillEvasionPercent, before.mSkillEvasionPercent + 0.10);
    assert.equal(shouldEvadeMonsterSkill(hidden, 'physical', 0.09), true);
    assert.equal(shouldEvadeMonsterSkill(hidden, 'magical', 0.09), true);
    assert.equal(shouldEvadeMonsterSkill(hidden, 'physical', 0.10), false);

    state.buffs.silent_move.until = Date.now() - 1;
    const expired = getStats(state);
    assert.equal(expired.pSkillEvasionPercent, before.pSkillEvasionPercent);
    assert.equal(expired.mSkillEvasionPercent, before.mSkillEvasionPercent);
  });

  it('adapts Fake Death into a short defensive feint consumed by player combat stats', () => {
    const def = CANONICAL_SKILL_REGISTRY_V2.fake_death;
    const effect = resolveSkillBuffStats(def);
    assert.deepEqual(effect, { pDefPercent: 0.15, mDefPercent: 0.15, debuffResistancePercent: 0.10 });
    assert.equal(resolveSkillBuffDurationMs(def), 4_000);

    const state = DEFAULT_STATE();
    const before = getStats(state);
    state.buffs.fake_death = { until: Date.now() + 4_000, skillBuffStats: effect };
    const feinting = getStats(state);
    assert.ok(feinting.def > before.def);
    assert.ok(feinting.mdef > before.mdef);
    assert.equal(feinting.debuffResistancePercent, before.debuffResistancePercent + 0.10);

    state.buffs.fake_death.until = Date.now() - 1;
    const expired = getStats(state);
    assert.equal(expired.def, before.def);
    assert.equal(expired.mdef, before.mdef);
    assert.equal(expired.debuffResistancePercent, before.debuffResistancePercent);
  });

  it('adapts racial Call skills to combat effects supported by the current game loop', () => {
    const flame = CANONICAL_SKILL_REGISTRY_V2.call_of_flame;
    const flameEffect = resolveSkillTargetDebuffStats(flame);
    assert.deepEqual(flameEffect, { pDefPercent: -0.15, mDefPercent: -0.15 });
    assert.equal(resolveSkillTargetDebuffDurationMs(flame), 5_000);
    const armoredTarget = { def: 100, mdef: 100, _skillDebuffs: { call_of_flame: { stats: flameEffect, until: 5_000 } } };
    assert.deepEqual(getDebuffedMonsterDefense(armoredTarget, 4_999), { def: 85, mdef: 85 });
    assert.deepEqual(getDebuffedMonsterDefense(armoredTarget, 5_000), { def: 100, mdef: 100 });

    const frost = CANONICAL_SKILL_REGISTRY_V2.call_of_frost;
    const frostEffect = resolveSkillBuffStats(frost);
    assert.deepEqual(frostEffect, { pAtkPercent: 0.05, pveDamagePercent: 0.02 });
    assert.equal(resolveSkillBuffDurationMs(frost), 10_000);
    const frostState = DEFAULT_STATE();
    frostState.level = 76;
    const frostBaseStats = getStats(frostState);
    frostState.buffs.call_of_frost = { until: Date.now() + 10_000, skillBuffStats: frostEffect };
    assert.ok(getStats(frostState).atk > frostBaseStats.atk);
    assert.equal(applyPlayerPveDamageBonus(100, getStats(frostState)), 102);

    const lightning = CANONICAL_SKILL_REGISTRY_V2.call_of_lightning;
    const lightningEffect = resolveSkillTargetDebuffStats(lightning);
    assert.deepEqual(lightningEffect, { actionsDisabled: 1 });
    assert.equal(resolveSkillTargetDebuffDurationMs(lightning), 1_000);
    const stunnedTarget = { _skillDebuffs: { call_of_lightning: { stats: lightningEffect, until: 1_000 } } };
    assert.equal(isMonsterActionDisabled(stunnedTarget, 999), true);
    assert.equal(isMonsterActionDisabled(stunnedTarget, 1_000), false);
  });

  it('turns Ultimate Defense into a timed high-cooldown defensive stance', () => {
    const def = CANONICAL_SKILL_REGISTRY_V2.ultimate_defense;
    const effect = resolveSkillBuffStats(def);
    assert.deepEqual(effect, { pDefPercent: 0.60, mDefPercent: 0.60 });
    assert.equal(resolveSkillBuffDurationMs(def), 10_000);

    const state = DEFAULT_STATE();
    state.level = 76;
    const before = getStats(state);
    state.buffs.ultimate_defense = { until: Date.now() + 10_000, skillBuffStats: effect };
    const guarded = getStats(state);
    assert.ok(guarded.def > before.def);
    assert.ok(guarded.mdef > before.mdef);
    state.buffs.ultimate_defense.until = Date.now() - 1;
    assert.equal(getStats(state).def, before.def);
    assert.equal(getStats(state).mdef, before.mdef);
  });

  it('adapts Shelter Master into a timed defensive sanctuary consumed by combat', () => {
    const def = CANONICAL_SKILL_REGISTRY_V2.shelter_master;
    const effect = resolveSkillBuffStats(def);
    assert.deepEqual(effect, { pDefPercent: 0.60, mDefPercent: 0.60, debuffResistancePercent: 0.25 });
    assert.equal(resolveSkillBuffDurationMs(def), 10_000);

    const state = DEFAULT_STATE();
    state.level = 90;
    const baseline = getStats(state);
    state.buffs.shelter_master = { until: Date.now() + 10_000, skillBuffStats: effect };
    const sheltered = getStats(state);
    assert.ok(sheltered.def > baseline.def);
    assert.ok(sheltered.mdef > baseline.mdef);
    assert.equal(sheltered.debuffResistancePercent, baseline.debuffResistancePercent + 0.25);
    assert.ok(calculateDefenseMitigation(1000, sheltered.def) < calculateDefenseMitigation(1000, baseline.def));

    const monster = { atk: 100, matk: 100, _aiState: { archetype: MONSTER_ARCHETYPES.SUPPORT } };
    const originalRandom = Math.random;
    try {
      Math.random = () => 0.2;
      const baselineDebuff = MonsterAIEngine.processMonsterAttack(monster, baseline, { buffs: {} });
      const resistedDebuff = MonsterAIEngine.processMonsterAttack(monster, sheltered, { buffs: {} });
      assert.ok(baselineDebuff.appliedDebuff);
      assert.equal(resistedDebuff.appliedDebuff, null);
    } finally {
      Math.random = originalRandom;
    }
  });

  it('keeps Guts physical defense, defense rate, and combat-debuff resistance', () => {
    const effect = resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.guts);
    assert.deepEqual(effect, { def: 400, pDefPercent: 0.35, debuffResistancePercent: 0.25, movementSpeedPercent: 0.10 });
    const state = DEFAULT_STATE();
    state.level = 76;
    const before = getStats(state);
    state.buffs.guts = { until: Date.now() + 10_000, skillBuffStats: effect };
    const hardened = getStats(state);
    assert.ok(hardened.def > before.def + 400);
    assert.equal(hardened.debuffResistancePercent, before.debuffResistancePercent + 0.25);
  });

  it('adapts Dark Panther summon damage into a short, single-target PvE damage window', () => {
    const def = CANONICAL_SKILL_REGISTRY_V2.dark_panther_s_help;
    const effect = resolveSkillBuffStats(def);
    assert.deepEqual(effect, { pveDamagePercent: 0.05 });
    assert.equal(resolveSkillBuffDurationMs(def), 6_000);

    const state = DEFAULT_STATE();
    const before = getStats(state);
    state.buffs.dark_panther_s_help = { until: Date.now() + 6_000, skillBuffStats: effect };
    const assisted = getStats(state);
    assert.equal(assisted.pveDamagePercent, before.pveDamagePercent + 0.05);
    assert.equal(applyPlayerPveDamageBonus(100, assisted), 105);
    state.buffs.dark_panther_s_help.until = Date.now() - 1;
    assert.equal(getStats(state).pveDamagePercent, before.pveDamagePercent);
  });

  it('resolves Silence against magical monster skills only and expires it', () => {
    const effect = resolveSkillTargetDebuffStats(CANONICAL_SKILL_REGISTRY_V2.silence);
    assert.deepEqual(effect, { magicSkillsSilenced: 1 });
    assert.equal(resolveSkillTargetDebuffDurationMs(CANONICAL_SKILL_REGISTRY_V2.silence), 6_000);
    const target = { _skillDebuffs: { silence: { stats: effect, until: 6_000 } } };
    assert.equal(isMonsterMagicSkillSilenced(target, 5_999), true);
    assert.equal(isMonsterMagicSkillSilenced(target, 6_000), false);
  });

  it('adapts Curse Fear into a temporary reduction to both monster damage types', () => {
    const def = CANONICAL_SKILL_REGISTRY_V2.curse_fear;
    const effect = resolveSkillTargetDebuffStats(def);
    assert.deepEqual(effect, { pAtkPercent: -0.15, mAtkPercent: -0.15 });
    assert.equal(resolveSkillTargetDebuffDurationMs(def), 5_000);
    const target = { atk: 100, matk: 120, _skillDebuffs: { curse_fear: { stats: effect, until: 5_000 } } };
    assert.equal(getDebuffedMonsterAttack(target, 100, 'physical', 4_999), 85);
    assert.equal(getDebuffedMonsterAttack(target, 120, 'magical', 4_999), 102);
    assert.equal(getDebuffedMonsterAttack(target, 100, 'physical', 5_000), 100);
  });

  it('adapts fear and shadow repositioning into short combat-relevant monster disruption', () => {
    const fear = CANONICAL_SKILL_REGISTRY_V2.word_of_fear;
    const fearEffect = resolveSkillTargetDebuffStats(fear);
    assert.deepEqual(fearEffect, { pAtkPercent: -0.12, mAtkPercent: -0.12 });
    assert.equal(resolveSkillTargetDebuffDurationMs(fear), 5_000);

    const shadowStep = CANONICAL_SKILL_REGISTRY_V2.shadow_step;
    const shadowEffect = resolveSkillTargetDebuffStats(shadowStep);
    assert.deepEqual(shadowEffect, { movementSpeedPercent: -0.30 });
    assert.equal(resolveSkillTargetDebuffDurationMs(shadowStep), 5_000);

    const target = {
      atk: 100,
      matk: 120,
      atkSpd: 1,
      _skillDebuffs: {
        word_of_fear: { stats: fearEffect, until: 5_000 },
        shadow_step: { stats: shadowEffect, until: 5_000 }
      }
    };
    assert.equal(getDebuffedMonsterAttack(target, 100, 'physical', 4_999), 88);
    assert.equal(getDebuffedMonsterAttack(target, 120, 'magical', 4_999), 105);
    assert.equal(getDebuffedMonsterAttackSpeed(target, 4_999), 0.7);
    assert.equal(getDebuffedMonsterAttack(target, 100, 'physical', 5_000), 100);
    assert.equal(getDebuffedMonsterAttackSpeed(target, 5_000), 1);
  });

  it('adapts Sleep into a short monster action lock and expires it', () => {
    const def = CANONICAL_SKILL_REGISTRY_V2.sleep;
    const effect = resolveSkillTargetDebuffStats(def);
    assert.deepEqual(effect, { actionsDisabled: 1 });
    assert.equal(resolveSkillTargetDebuffDurationMs(def), 2_000);
    const target = { _skillDebuffs: { sleep: { stats: effect, until: 2_000 } } };
    assert.equal(isMonsterActionDisabled(target, 1_999), true);
    assert.equal(isMonsterActionDisabled(target, 2_000), false);
  });

  it('routes Flame Grip as the documented five-second hold through target combat state', () => {
    const def = CANONICAL_SKILL_REGISTRY_V2.flame_grip;
    const effect = resolveSkillTargetDebuffStats(def);
    assert.deepEqual(effect, { actionsDisabled: 1 });
    assert.equal(resolveSkillTargetDebuffDurationMs(def), 5_000);
    const target = { _skillDebuffs: { flame_grip: { stats: effect, until: 5_000 } } };
    assert.equal(isMonsterActionDisabled(target, 4_999), true);
    assert.equal(isMonsterActionDisabled(target, 5_000), false);
  });

  it('applies Blazing Fury to real physical stats and skill damage, then expires the bonus', () => {
    const def = CANONICAL_SKILL_REGISTRY_V2.blazing_fury;
    const effect = resolveSkillBuffStats(def);
    assert.deepEqual(effect, {
      pAtkPercent: 0.10,
      pDefPercent: 0.10,
      maxHpPercent: 0.10,
      pSkillPowerPercent: 0.05
    });
    assert.equal(resolveSkillBuffDurationMs(def), 20_000);

    const state = DEFAULT_STATE();
    const now = Date.now();
    const before = getStats(state, { now });
    state.buffs.blazing_fury = { until: now + 20_000, skillBuffStats: effect };
    const active = getStats(state, { now });
    assert.ok(active.atk > before.atk);
    assert.ok(active.def > before.def);
    assert.ok(active.maxHp > before.maxHp);
    assert.equal(active.pSkillPowerPercent, before.pSkillPowerPercent + 0.05);
    assert.ok(applyPlayerSkillPowerBonus(100, active, 'physical') > applyPlayerSkillPowerBonus(100, before, 'physical'));

    state.buffs.blazing_fury.until = Date.now() - 1;
    const expired = getStats(state, { now: Date.now() });
    assert.equal(expired.atk, before.atk);
    assert.equal(expired.def, before.def);
    assert.equal(expired.maxHp, before.maxHp);
    assert.equal(expired.pSkillPowerPercent, before.pSkillPowerPercent);
  });

  it('adapts Erosion into a timed defense reduction consumed by physical and magical damage', () => {
    const def = CANONICAL_SKILL_REGISTRY_V2.erosion;
    const effect = resolveSkillTargetDebuffStats(def);
    assert.deepEqual(effect, { pDefPercent: -0.10, mDefPercent: -0.10 });
    assert.equal(resolveSkillTargetDebuffDurationMs(def), 5_000);
    const target = { def: 200, mdef: 160, _skillDebuffs: { erosion: { stats: effect, until: 5_000 } } };
    assert.deepEqual(getDebuffedMonsterDefense(target, 4_999), { def: 180, mdef: 144 });
    assert.ok(calculateDefenseMitigation(10_000, 180) > calculateDefenseMitigation(10_000, 200));
    assert.ok(calculateDefenseMitigation(10_000, 144, true) > calculateDefenseMitigation(10_000, 160, true));
    assert.deepEqual(getDebuffedMonsterDefense(target, 5_000), { def: 200, mdef: 160 });
  });

  it('adapts Vampiric Rage into life drain that feeds the effective player stat', () => {
    const effect = resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.vampiric_rage);
    assert.deepEqual(effect, { lifeDrain: 0.05 });

    const state = DEFAULT_STATE();
    state.buffs.vampiric_rage = { until: Date.now() + 5_000, skillBuffStats: effect };
    const activeStats = getStats(state);
    assert.equal(activeStats.lifeDrain, 0.05);
    state.buffs.vampiric_rage.until = Date.now() - 1;
    const expiredStats = getStats(state);
    assert.equal(expiredStats.lifeDrain, 0);
  });

  it('applies Mana Effect Boost max MP and recovery rate to production stats', () => {
    const effect = resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.mana_effect_boost);
    assert.deepEqual(effect, { maxMpPercent: 0.20, mpRegen: 5.1 });

    const state = DEFAULT_STATE();
    state.buffs.mana_effect_boost = { until: Date.now() + 60_000, skillBuffStats: effect };
    const plainStats = getStats(DEFAULT_STATE());
    const buffedStats = getStats(state);
    assert.ok(buffedStats.maxMp > plainStats.maxMp, 'maximum MP increases while Mana Effect Boost is active');
    assert.equal(buffedStats.mpRegen, plainStats.mpRegen + 5.1);
  });

  it('adapts Long Shot range into a bow-gated attack bonus consumed by combat stats', () => {
    const equip = (state, type, uid) => {
      state.inventory.push({ uid, itemId: uid, type, weaponType: type, slot: 'weapon', atk: 10, matk: 0, count: 1 });
      state.equipment.weapon = uid;
    };
    const bow = DEFAULT_STATE();
    bow.class = 'hawkeye';
    bow.level = 80;
    equip(bow, 'bow', 'long-shot-bow');
    const bowWithPassive = structuredClone(bow);
    bowWithPassive.skills.long_shot = 1;
    assert.ok(getStats(bowWithPassive).atk > getStats(bow).atk);

    const sword = DEFAULT_STATE();
    sword.class = 'hawkeye';
    sword.level = 80;
    equip(sword, 'sword', 'long-shot-sword');
    const swordWithPassive = structuredClone(sword);
    swordWithPassive.skills.long_shot = 1;
    assert.equal(getStats(swordWithPassive).atk, getStats(sword).atk, 'Long Shot requires a bow or crossbow');
  });

  it('resolves Roar of Death as a temporary reduction to the target physical and magic attack', () => {
    assert.deepEqual(resolveSkillTargetDebuffStats(CANONICAL_SKILL_REGISTRY_V2.roar_of_death), {
      pAtkPercent: -0.15,
      mAtkPercent: -0.15
    });
    const target = {
      atk: 100,
      matk: 120,
      _skillDebuffs: {
        roar_of_death: { stats: { pAtkPercent: -0.15, mAtkPercent: -0.15 }, until: Date.now() + 10_000 }
      }
    };
    assert.equal(getDebuffedMonsterAttack(target, target.atk, 'physical'), 85);
    assert.equal(getDebuffedMonsterAttack(target, target.matk, 'magical'), 102);
    target._skillDebuffs.roar_of_death.until = Date.now() - 1;
    assert.equal(getDebuffedMonsterAttack(target, target.atk, 'physical'), 100);
    assert.equal(getDebuffedMonsterAttack(target, target.matk, 'magical'), 120);
    assert.equal(resolveSkillTargetDebuffDurationMs(CANONICAL_SKILL_REGISTRY_V2.roar_of_death), 10_000);
  });

  it('converts legacy active attack and casting speed fields to cooldown without increasing attack speed', () => {
    const state = DEFAULT_STATE();
    state.level = 80;
    state.class = 'gladiator';
    const baseline = getStats(state);
    state.buffs.legacy_haste = {
      until: Date.now() + 60_000,
      skillBuffStats: { atkSpd: 15, atkSpdPercent: 0.10, castSpd: 20 }
    };

    const active = getStats(state);
    assert.equal(active.cdr, baseline.cdr + 0.45);
    assert.equal(active.atkSpd, baseline.atkSpd);
  });

  it('routes explicit attack and casting speed buffs into cooldown reduction', () => {
    assert.equal(resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.thrill_fight).cdr, 0.05);
    assert.equal(resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.prophecy_of_fire).cdr, 0.20);
    assert.equal(resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.wind_shackles), null);

    for (const [skillId, expectedCdr] of [['thrill_fight', 0.05], ['prophecy_of_fire', 0.20]]) {
      const state = DEFAULT_STATE();
      state.level = 80;
      state.class = 'warrior';
      const baseline = getStats(state);
      state.buffs[skillId] = {
        until: Date.now() + 60_000,
        skillBuffStats: resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2[skillId])
      };
      const activeStats = getStats(state);
      assert.equal(activeStats.cdr, baseline.cdr + expectedCdr, `${skillId} cooldown reduction`);
      assert.equal(activeStats.atkSpd, baseline.atkSpd, `${skillId} must not increase attack speed`);
    }
  });

  it('combines a buff speed conversion with its separately declared cooldown reduction', () => {
    const alacrity = CANONICAL_SKILL_REGISTRY_V2.alacrity;
    assert.equal(resolveSkillSpeedCooldownReduction(alacrity), 0.10);
    assert.deepEqual(resolveSkillCooldownReduction(alacrity), { cdr: 0, pSkillCdr: 0.05, mSkillCdr: 0 });
    assert.deepEqual(resolveSkillBuffStats(alacrity), { movementSpeedPercent: 0.07, cdr: 0.10, pSkillCdr: 0.05, atk: 1000, critPercent: 0.03 });

    const state = DEFAULT_STATE();
    state.level = 80;
    state.class = 'moonlightSentinel';
    state.buffs.alacrity = {
      until: Date.now() + 60_000,
      skillBuffStats: resolveSkillBuffStats(alacrity)
    };
    const base = getStats({ ...state, buffs: {} });
    const buffed = getStats(state);
    assert.equal(buffed.cdr, base.cdr + 0.10);
    assert.equal(buffed.pSkillCdr, 0.05);
    assert.equal(buffed.atkSpd, base.atkSpd);

    const physical = { id: 'alacrity_physical_cd', type: 'active', damageType: 'physical', baseCd: 10_000, gameplay: { mpCost: 1 } };
    const magical = { ...physical, id: 'alacrity_magic_cd', damageType: 'magic' };
    assert.equal(canCastSkill({ mp: 100, stats: buffed }, physical, 8_500, { [physical.id]: 0 }).canCast, true);
    assert.equal(canCastSkill({ mp: 100, stats: buffed }, magical, 8_500, { [magical.id]: 0 }).canCast, false);
  });

  it('applies an explicitly declared cooldown passive through the real cooldown gate', () => {
    const recovery = CANONICAL_SKILL_REGISTRY_V2.quick_recovery;
    assert.deepEqual(resolveSkillCooldownReduction(recovery), { cdr: 0, pSkillCdr: 0, mSkillCdr: 0.10 });
    for (const classId of recovery.classes) {
      const state = DEFAULT_STATE();
      state.level = 80;
      state.class = classId;
      state.skills.quick_recovery = 1;
      const stats = getStats(state);
      assert.equal(stats.cdr, 0, `${classId} receives no global CDR from a magic-only passive`);
      assert.equal(stats.mSkillCdr, 0.10, `${classId} receives the documented M. Skill CDR`);
    }

    const state = DEFAULT_STATE();
    state.level = 80;
    state.class = recovery.classes[0];
    state.skills.quick_recovery = 1;
    const stats = getStats(state);
    const magic = { id: 'quick_recovery_cooldown_test', type: 'active', damageType: 'magic', baseCd: 10_000, gameplay: { mpCost: 1 } };
    const physical = { ...magic, id: 'quick_recovery_physical_test', damageType: 'physical' };
    assert.equal(canCastSkill({ mp: 100, stats }, magic, 8_999, { [magic.id]: 0 }).canCast, false);
    assert.equal(canCastSkill({ mp: 100, stats }, magic, 9_000, { [magic.id]: 0 }).canCast, true);
    assert.equal(canCastSkill({ mp: 100, stats }, physical, 9_999, { [physical.id]: 0 }).canCast, false);
  });

  it('covers every unconditional numeric cooldown-reduction clause in the canonical catalog', () => {
    const pattern = /(?:(?:[PM]\s*\.?\s*(?:\/\s*[PM]\s*\.?\s*)?)?Skill\s+Cooldown|(?<![A-Za-z])Cooldown)\s*-\s*\d+(?:\.\d+)?\s*%/gi;
    const contexts = [{}, { armorType: 'light' }, { armorType: 'robe' }];
    for (const def of Object.values(CANONICAL_SKILL_REGISTRY_V2)) {
      const source = [def.canonicalEffect, def.desc, def.effectText, def.info, def.effect]
        .filter(value => typeof value === 'string').join(' ');
      if (![...source.matchAll(pattern)].length) continue;
      const effects = contexts.map(context => resolveSkillCooldownReduction(def, context));
      const maximumReduction = Math.max(...effects.map(effect => Math.max(effect.cdr, effect.pSkillCdr, effect.mSkillCdr)));
      if (/current hp|depending on your hp|based on your hp/i.test(source)) {
        assert.equal(maximumReduction, 0, `${def.id} must stay conditional until its HP threshold is executable`);
      } else {
        assert.ok(maximumReduction > 0, `${def.id} declares cooldown reduction but has no runtime mapping`);
      }
    }
  });

  it('routes conditional weapon speed buffs into cooldown only for a matching equipped weapon', () => {
    const skill = CANONICAL_SKILL_REGISTRY_V2.angelic_archon;
    assert.deepEqual(resolveSkillBuffStats(skill, 1, { weaponCategory: 'sword' }), { movementSpeedPercent: 0.06, cdr: 0.10, pDefPercent: 0.20, mDefPercent: 0.20, pAccuracy: 4, crit: 20 });
    assert.deepEqual(resolveSkillBuffStats(skill, 1, { weaponCategory: 'blunt' }), { movementSpeedPercent: 0.06, cdr: 0.10, pDefPercent: 0.20, mDefPercent: 0.20, pAccuracy: 4, crit: 20 });
    assert.deepEqual(resolveSkillBuffStats(skill, 1, { weaponCategory: 'dagger' }), { pDefPercent: 0.20, mDefPercent: 0.20, pAccuracy: 4, crit: 20, movementSpeedPercent: 0.06 });

    const state = DEFAULT_STATE();
    state.level = 80;
    state.class = 'paladin';
    state.inventory.push({ uid: 'archon-sword', id: 'weapon_test_sword', itemId: 'weapon_test_sword', name: 'Test Sword', type: 'weapon', weaponType: 'sword' });
    state.equipment.weapon = 'archon-sword';
    const weapon = getEquippedWeaponInfo(state);
    const gearContext = {
      armorType: getEquippedArmorType(state), weaponCategory: weapon.category,
      isTwoHanded: weapon.isTwoHanded, weaponId: weapon.weaponId, weaponName: weapon.weaponName
    };
    state.buffs.angelic_archon = {
      until: Date.now() + 60_000,
      skillBuffStats: resolveSkillBuffStats(skill, 1, gearContext)
    };
    const base = getStats({ ...state, buffs: {} });
    const withBuff = getStats(state);
    assert.equal(withBuff.cdr, base.cdr + 0.10);
    assert.equal(withBuff.atkSpd, base.atkSpd);

    const testSkill = { id: 'angelic_archon_cooldown_test', type: 'active', baseCd: 10_000, gameplay: { mpCost: 1 } };
    assert.equal(canCastSkill({ mp: 100, stats: withBuff }, testSkill, 9_000, { [testSkill.id]: 0 }).canCast, true);
  });

  it('converts every canonical positive numeric attack/casting speed effect to cooldown reduction when its gear condition is met', () => {
    const speedPattern = /(?:Atk\.?\s*Spd\.?|Attack\s*Speed|Cast(?:ing)?\.?\s*Spd\.?|Cast(?:ing)?\s*Speed)\s*[: ]*\s*([+-]?\s*\d+(?:\.\d+)?)\s*(%)?/gi;
    const contexts = [
      { armorType: 'light' }, { armorType: 'robe' },
      { weaponCategory: 'sword', isTwoHanded: true, weaponId: 'ancient_sword', weaponName: 'Ancient Sword' },
      { weaponCategory: 'blunt' }, { weaponCategory: 'staff' }, { weaponCategory: 'spear' },
      { weaponCategory: 'bow' }, { weaponCategory: 'dual' }, { weaponCategory: 'fist' }
    ];

    for (const def of Object.values(CANONICAL_SKILL_REGISTRY_V2)) {
      const source = [def.desc, def.canonicalEffect, def.effectText, def.info, def.effect]
        .filter(value => typeof value === 'string').join(' ');
      const positiveSpeed = [...source.matchAll(speedPattern)].some(match => Number(match[1].replace(/\s/g, '')) > 0);
      if (!positiveSpeed) continue;
      const maximumCdr = Math.max(...contexts.map(context => resolveSkillSpeedCooldownReduction(def, context)));
      assert.ok(maximumCdr > 0, `${def.id} has a positive numeric speed effect but no cooldown conversion`);
    }
  });

  it('routes learned attack-speed and cast-speed passives into cooldown, not attack speed', () => {
    for (const [classId, skillId, expectedCdr] of [
      ['dragoon', 'boost_attack_speed', 0.10],
      ['wizard', 'fast_spell_casting', 0.15],
      ['wizard', 'fast_spellcasting', 0.30]
    ]) {
      const state = DEFAULT_STATE();
      state.level = 80;
      state.class = classId;
      state.skills[skillId] = 1;
      const baseline = structuredClone(state);
      baseline.skills[skillId] = 0;
      const baselineStats = getStats(baseline);
      const skillStats = getStats(state);
      assert.equal(skillStats.cdr, baselineStats.cdr + expectedCdr, `${skillId} cooldown bonus`);
      assert.equal(skillStats.atkSpd, baselineStats.atkSpd, `${skillId} must not increase attack speed`);
    }
  });

  it('resolves passive speed effects by their declared values and equipment conditions', () => {
    assert.equal(resolveSkillSpeedCooldownReduction(CANONICAL_SKILL_REGISTRY_V2.fast_spellcasting), 0.30);
    assert.equal(resolveSkillSpeedCooldownReduction(CANONICAL_SKILL_REGISTRY_V2.light_armor_mastery), 0);
    assert.equal(resolveSkillSpeedCooldownReduction(CANONICAL_SKILL_REGISTRY_V2.light_armor_mastery, { armorType: 'light' }), 0.05);
    assert.equal(resolveSkillSpeedCooldownReduction(CANONICAL_SKILL_REGISTRY_V2.robe_mastery, { armorType: 'robe' }), 0.10);
    assert.equal(resolveSkillSpeedCooldownReduction(CANONICAL_SKILL_REGISTRY_V2.enhanced_weapon), 0);
    assert.equal(resolveSkillSpeedCooldownReduction(CANONICAL_SKILL_REGISTRY_V2.enhanced_weapon, { weaponCategory: 'fist' }), 0.05);
  });

  it('applies armor-gated attack and casting speed mastery as cooldown reduction', () => {
    for (const [skillId, armorType, expectedCdr] of [
      ['light_armor_mastery', 'light', 0.05],
      ['robe_mastery', 'robe', 0.10]
    ]) {
      const state = DEFAULT_STATE();
      state.class = CANONICAL_SKILL_REGISTRY_V2[skillId].classes[0];
      state.level = 80;
      state.skills[skillId] = 1;
      state.inventory.push({ uid: `speed-test-${armorType}`, type: 'armor', armorType });
      state.equipment.armor = `speed-test-${armorType}`;
      const stats = getStats(state);
      assert.equal(stats.cdr, expectedCdr, skillId);
      assert.equal(stats.atkSpd, 0, `${skillId} must not change attack speed`);
    }
  });

  it('resolves the explicit mixed defensive, HP, evasion, and MP-cost effects of canonical buffs', () => {
    assert.deepEqual(resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.majesty), {
      def: 50, maxHpFlat: 200, eva: -4
    });
    assert.deepEqual(resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.arcane_power), {
      mAtkPercent: 0.1, mpCostReduction: -0.05
    });
  });

  it('does not route target debuffs through the self-buff resolver', () => {
    assert.equal(resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.weakness), null);
    assert.deepEqual(resolveSkillTargetDebuffStats(CANONICAL_SKILL_REGISTRY_V2.weakness), { pAtkPercent: -0.23, mAtkPercent: -0.23 });
    assert.deepEqual(resolveSkillTargetDebuffStats(CANONICAL_SKILL_REGISTRY_V2.hex), { pDefPercent: -0.23 });
    assert.deepEqual(resolveSkillTargetDebuffStats(CANONICAL_SKILL_REGISTRY_V2.power_break), { pAtkPercent: -0.23 });
    assert.deepEqual(resolveSkillTargetDebuffStats(CANONICAL_SKILL_REGISTRY_V2.wind_shackles), {
      atkSpdPercent: -0.23, cooldownPercent: 0.23
    });
    assert.deepEqual(resolveSkillTargetDebuffStats(CANONICAL_SKILL_REGISTRY_V2.cripple), {
      atkSpdPercent: -0.15, cooldownPercent: 0.15, movementSpeedPercent: -0.15
    });
    const target = { _skillDebuffs: { weakness: { until: 5000, stats: { pAtkPercent: -0.23 } } } };
    assert.deepEqual(getActiveSkillDebuffStats(target, 4000), { pAtkPercent: -0.23 });
    assert.deepEqual(getActiveSkillDebuffStats(target, 6000), {});
    assert.equal(getDebuffedMonsterAttack(target, 100, 'physical', 4000), 77);
    const shackled = { atkSpd: 2, skill: { cd: 10 }, _skillDebuffs: { wind_shackles: { until: 5000, stats: { atkSpdPercent: -0.23, cooldownPercent: 0.23 } } } };
    assert.equal(getDebuffedMonsterAttackSpeed(shackled, 4000), 1.54);
    assert.equal(getDebuffedMonsterSkillCooldownMultiplier(shackled, 4000), 1.23);
    const hexed = { def: 100, mdef: 80, _skillDebuffs: { hex: { until: 5000, stats: { pDefPercent: -0.23 } } } };
    assert.deepEqual(getDebuffedMonsterDefense(hexed, 4000), { def: 77, mdef: 80 });
  });

  it('parses documented defensive and offensive flat-stat buffs', () => {
    assert.deepEqual(resolveSkillBuffStats({
      id: 'runtime_guard', type: 'buff', canonicalEffect: 'P. Def. +50 M. Def. +25'
    }), { def: 50, mdef: 25 });
  });

  it('keeps War Cry as an attack buff without applying that effect to every other buff', () => {
    assert.deepEqual(resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.war_cry, 3), { pAtkPercent: 0.35 });
  });

  it('maps Lionheart status resistances to monster-debuff resistance and preserves its PvE damage bonus', () => {
    assert.deepEqual(resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.lionheart), {
      pveDamagePercent: 0.03,
      debuffResistancePercent: 0.25
    });

    const state = DEFAULT_STATE();
    state.level = 80;
    state.class = 'gladiator';
    const buffed = structuredClone(state);
    buffed.buffs = {
      lionheart: { until: Date.now() + 60_000, skillBuffStats: resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.lionheart) }
    };

    const plainStats = getStats(state);
    const buffedStats = getStats(buffed);
    assert.equal(plainStats.pveDamagePercent, 0);
    assert.equal(buffedStats.pveDamagePercent, 0.03);
    assert.equal(buffedStats.debuffResistancePercent, 0.25);
    assert.equal(buffedStats.atk, plainStats.atk);
    assert.equal(applyPlayerPveDamageBonus(100, plainStats), 100);
    assert.equal(applyPlayerPveDamageBonus(100, buffedStats), 103);

    const monster = { atk: 100, matk: 100, hp: 1000, _maxHp: 1000, _aiState: { archetype: MONSTER_ARCHETYPES.SUPPORT } };
    const originalRandom = Math.random;
    try {
      const rolls = [0.5, 0.2, 0.5, 0.2];
      let index = 0;
      Math.random = () => rolls[index++] ?? 0.5;
      const exposed = MonsterAIEngine.processMonsterAttack(structuredClone(monster), plainStats, state);
      const protectedState = structuredClone(buffed);
      const protectedResult = MonsterAIEngine.processMonsterAttack(structuredClone(monster), buffedStats, protectedState);
      assert.ok(exposed.appliedDebuff, 'same monster roll applies a debuff without Lionheart');
      assert.equal(protectedResult.appliedDebuff, null, 'Lionheart resists the same monster debuff roll');
    } finally {
      Math.random = originalRandom;
    }
  });

  it('applies Death Whisper critical damage to eligible learned passives', () => {
    const state = DEFAULT_STATE();
    state.level = 80;
    state.class = 'gladiator';
    const plainStats = getStats(state);
    state.skills.death_whisper = 1;
    const empoweredStats = getStats(state);
    assert.equal(empoweredStats.critDmg, plainStats.critDmg + 0.25);
  });

  it('applies Clarity physical and magical MP discounts to the corresponding skill costs', () => {
    const state = DEFAULT_STATE();
    state.level = 80;
    state.class = 'gladiator';
    state.skills.clarity = 1;
    const stats = getStats(state);
    assert.equal(stats.pSkillMpCostReduction, 0.10);
    assert.equal(stats.mSkillMpCostReduction, 0.04);

    const physical = { id: 'physical_cost', type: 'active', damageType: 'physical', gameplay: { mpCost: 100 } };
    const magical = { id: 'magical_cost', type: 'active', damageType: 'magic', gameplay: { mpCost: 100 } };
    assert.equal(canCastSkill({ mp: 100, stats }, physical).mpCost, 90);
    assert.equal(canCastSkill({ mp: 100, stats }, magical).mpCost, 96);
  });

  it('applies Potion Mastery only to HP recovery potions', () => {
    const state = DEFAULT_STATE();
    state.level = 80;
    state.class = 'gladiator';
    state.skills.potion_mastery = 1;
    const stats = getStats(state);
    assert.equal(stats.hpPotionEffectPercent, 0.10);
    assert.equal(isHpRecoveryPotion('hp_potion_m', { healAmt: 150 }), true);
    assert.equal(isHpRecoveryPotion('greater_healing_potion', { healAmt: 850 }), true);
    assert.equal(isHpRecoveryPotion('mp_potion_l', { healAmt: 300 }), false);
    assert.equal(isHpRecoveryPotion('attack_potion', { healAmt: 0 }), false);
    assert.equal(getHpPotionHealAmount(150, stats), 165);
    assert.equal(getHpPotionHealAmount(850, stats), 935);
    assert.equal(getHpPotionHealAmount(150, {}), 150);
  });

  it('preserves Potion Mastery healing in headless auto-potion combat', () => {
    const simulatePotion = (itemId, bonus) => simulateCombat({
      player: {
        hp: 100, maxHp: 1_000, mp: 100, maxMp: 100, level: 80, skills: {},
        stats: { atk: 1, matk: 1, def: 1, mdef: 1, maxHp: 1_000, maxMp: 100, mpRegen: 0, crit: 0, critDmg: 1, hpPotionEffectPercent: bonus },
        inventory: [{ itemId, count: 1 }]
      },
      enemy: { hp: 1_000_000, maxHp: 1_000_000, atk: 0, matk: 0, def: 1, mdef: 1 },
      config: { maxDurationMs: 200, applyVariance: false }
    });

    for (const [itemId, heal] of [['hp_potion_m', 150], ['greater_healing_potion', 850]]) {
      const control = simulatePotion(itemId, 0);
      const mastered = simulatePotion(itemId, 0.10);
      assert.equal(control.hpPotionsUsed, 1);
      assert.equal(mastered.hpPotionsUsed, 1);
      assert.equal(control.healingDone, heal);
      assert.equal(mastered.healingDone, Math.floor(heal * 1.10));
    }
  });

  it('resolves Ultimate Evasion Lv.2 effects and its 30-second duration', () => {
    assert.deepEqual(resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.ultimate_evasion), {
      eva: 25, pSkillEvasionPercent: 0.4, debuffResistancePercent: 0.8
    });
    assert.equal(resolveSkillBuffDurationMs(CANONICAL_SKILL_REGISTRY_V2.ultimate_evasion), 30_000);
    assert.equal(shouldEvadeMonsterSkill({ pSkillEvasionPercent: 0.4 }, 'physical', 0.39), true);
    assert.equal(shouldEvadeMonsterSkill({ pSkillEvasionPercent: 0.4 }, 'physical', 0.4), false);
    assert.equal(shouldEvadeMonsterSkill({ pSkillEvasionPercent: 0.4 }, 'magical', 0.39), false);
  });

  it('adapts Wind Walk movement speed into a faster basic attack interval', () => {
    assert.deepEqual(resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.wind_walk), { movementSpeedPercent: 0.05 });
    assert.equal(resolveSkillBuffDurationMs(CANONICAL_SKILL_REGISTRY_V2.wind_walk), 10_000);
    assert.equal(resolveSkillBuffStats({ id: 'unknown_buff', type: 'buff', canonicalEffect: 'Unknown skill effect' }), null);
  });

  it('adapts Elemental Wind Walk into a faster basic interval without changing attack or skill speed', () => {
    const def = CANONICAL_SKILL_REGISTRY_V2.elemental_wind_walk;
    assert.deepEqual(resolveSkillBuffStats(def), { movementSpeedPercent: 0.05 });
    assert.equal(resolveSkillBuffDurationMs(def), 10_000);
    const state = DEFAULT_STATE();
    const before = getStats(state);
    state.buffs.elemental_wind_walk = {
      until: Date.now() + 10_000,
      skillBuffStats: resolveSkillBuffStats(def)
    };
    const after = getStats(state);
    assert.equal(after.cdr, before.cdr);
    assert.equal(after.atkSpd, before.atkSpd);
    assert.ok(resolvePlayerBasicAttackIntervalMs(after) < resolvePlayerBasicAttackIntervalMs(before));
  });

  it('uses movement speed to change the production interval between basic attacks', () => {
    assert.equal(resolvePlayerBasicAttackIntervalMs({ atkSpd: 0 }), 1_000);
    assert.equal(resolvePlayerBasicAttackIntervalMs({ atkSpd: 0, movementSpeedPercent: 0.20 }), 833);
    assert.equal(resolvePlayerBasicAttackIntervalMs({ atkSpd: 0, movementSpeedPercent: -0.20 }), 1_250);
    assert.equal(resolvePlayerBasicAttackIntervalMs({ atkSpd: 0, movementSpeedPercent: 0.20 }), Math.round(1_000 / 1.2));
  });

  it('routes generic movement-speed buffs and passives to basic-attack cadence', () => {
    assert.deepEqual(resolveSkillBuffStats({
      id: 'runtime_movement_blessing',
      type: 'buff',
      canonicalEffect: 'Movement Speed +20%'
    }), { movementSpeedPercent: 0.20 });

    const state = DEFAULT_STATE();
    state.level = 40;
    state.class = CANONICAL_SKILL_REGISTRY_V2.quick_step.classes[0];
    state.race = 'human';
    state.skills.quick_step = 1;
    const baseline = structuredClone(state);
    baseline.skills.quick_step = 0;
    const baselineStats = getStats(baseline);
    const boostedStats = getStats(state);
    assert.equal(boostedStats.atkSpd, baselineStats.atkSpd);
    assert.equal(boostedStats.movementSpeedPercent, 0.15);
    assert.ok(resolvePlayerBasicAttackIntervalMs(boostedStats) < resolvePlayerBasicAttackIntervalMs(baselineStats));
  });

  it('adapts Magic Barrier into a timed M. Def bonus used by combat stats', () => {
    assert.deepEqual(resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.magic_barrier), { mDefPercent: 0.10 });
    assert.equal(resolveSkillBuffDurationMs(CANONICAL_SKILL_REGISTRY_V2.magic_barrier), 10_000);
    const state = DEFAULT_STATE();
    state.buffs.magic_barrier = { until: Date.now() + 10_000, skillBuffStats: resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.magic_barrier) };
    assert.ok(getStats(state).mdef > getStats({ ...state, buffs: {} }).mdef);
  });

  it('does not convert unknown or non-combat movement buffs into a free attack bonus', () => {
    assert.equal(resolveSkillBuffStats({ id: 'unknown_buff', type: 'buff', canonicalEffect: 'Unknown skill effect' }), null);
  });

  it('recognizes only canonical fixed-amount healing effects', () => {
    assert.equal(resolveSkillFixedHeal(CANONICAL_SKILL_REGISTRY_V2.life_rescue), 127);
    assert.equal(resolveSkillFixedHeal(CANONICAL_SKILL_REGISTRY_V2.vitalize), null);
  });

  it('applies the active Acumen buff to production stats and the cooldown gate', () => {
    const plain = DEFAULT_STATE();
    plain.level = 80;
    plain.class = 'spellsinger';
    const buffed = structuredClone(plain);
    buffed.buffs = {
      acumen: { until: Date.now() + 60_000, skillBuffStats: { cdr: 0.15 } }
    };

    const plainStats = getStats(plain);
    const buffedStats = getStats(buffed);
    assert.equal(buffedStats.cdr, plainStats.cdr + 0.15);
    assert.equal(buffedStats.atk, plainStats.atk);

    const skill = { id: 'cooldown_test', type: 'active', baseCd: 10_000, gameplay: { mpCost: 1 } };
    const readyAt = 9_000;
    assert.equal(canCastSkill({ mp: 100, stats: plainStats }, skill, readyAt, { cooldown_test: 0 }).canCast, false);
    assert.equal(canCastSkill({ mp: 100, stats: buffedStats }, skill, readyAt, { cooldown_test: 0 }).canCast, true);
  });

  it('applies Majesty defensive and maximum-HP effects through production stats', () => {
    const plain = DEFAULT_STATE();
    plain.level = 80;
    plain.class = 'phoenix_knight';
    const buffed = structuredClone(plain);
    buffed.buffs = {
      majesty: { until: Date.now() + 60_000, skillBuffStats: resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.majesty) }
    };
    const plainStats = getStats(plain);
    const buffedStats = getStats(buffed);
    assert.equal(buffedStats.def, plainStats.def + 50);
    assert.equal(buffedStats.maxHp, plainStats.maxHp + 200);
    assert.equal(buffedStats.eva, Math.max(0, plainStats.eva - 4));
  });

  it('exposes Ultimate Evasion stats through production calculations and expires them', () => {
    const plain = DEFAULT_STATE();
    plain.level = 80;
    plain.class = 'treasureHunter';
    const buffed = structuredClone(plain);
    const effect = resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.ultimate_evasion);
    buffed.buffs = {
      ultimate_evasion: { until: Date.now() + 30_000, skillBuffStats: effect }
    };
    const plainStats = getStats(plain);
    const buffedStats = getStats(buffed);
    assert.equal(buffedStats.eva, plainStats.eva + 25);
    assert.equal(buffedStats.pSkillEvasionPercent, 0.4);
    assert.equal(buffedStats.debuffResistancePercent, 0.8);
    buffed.buffs.ultimate_evasion.until = Date.now() - 1;
    const expiredStats = getStats(buffed);
    assert.equal(expiredStats.eva, plainStats.eva);
    assert.equal(expiredStats.pSkillEvasionPercent, 0);
    assert.equal(expiredStats.debuffResistancePercent, 0);

    const supportMonster = { atk: 100, matk: 100, hp: 1000, _maxHp: 1000, _aiState: { archetype: MONSTER_ARCHETYPES.SUPPORT } };
    const originalRandom = Math.random;
    try {
      const rolls = [0.5, 0.2, 0.5, 0.2];
      let index = 0;
      Math.random = () => rolls[index++] ?? 0.5;
      const exposed = MonsterAIEngine.processMonsterAttack(structuredClone(supportMonster), plainStats, plain);
      const protectedState = structuredClone(buffed);
      const protectedResult = MonsterAIEngine.processMonsterAttack(structuredClone(supportMonster), buffedStats, protectedState);
      assert.ok(exposed.appliedDebuff);
      assert.equal(protectedResult.appliedDebuff, null, 'Ultimate Evasion resists the same monster debuff roll');
    } finally {
      Math.random = originalRandom;
    }
  });

  it('applies Arcane Power to magic attack and skill MP consumption', () => {
    const plain = DEFAULT_STATE();
    plain.level = 80;
    plain.class = 'archmage';
    const buffed = structuredClone(plain);
    buffed.buffs = {
      arcane_power: { until: Date.now() + 60_000, skillBuffStats: resolveSkillBuffStats(CANONICAL_SKILL_REGISTRY_V2.arcane_power) }
    };
    const plainStats = getStats(plain);
    const buffedStats = getStats(buffed);
    assert.ok(buffedStats.matk > plainStats.matk);
    const skill = { id: 'mana_test', type: 'active', baseCd: 10_000, gameplay: { mpCost: 20 } };
    assert.equal(canCastSkill({ mp: 100, stats: plainStats }, skill, 0, {}).mpCost, 20);
    assert.equal(canCastSkill({ mp: 100, stats: buffedStats }, skill, 0, {}).mpCost, 21);
  });
});

describe("Element Weaver's Armor Mastery production effects", () => {
  function makeElementWeaverState(withRobe) {
    const state = DEFAULT_STATE();
    state.class = 'spirit_1';
    state.race = 'high_elf';
    state.level = 20;
    state.skills.element_weaver_s_armor_mastery = 1;
    if (withRobe) {
      state.inventory.push({ uid: 'element-weaver-test-robe', type: 'armor', armorType: 'robe', def: 0 });
      state.equipment.chest = 'element-weaver-test-robe';
    }
    return state;
  }

  it('applies robe-only P./M. Defense, max HP, MP recovery, and magic cooldown effects', () => {
    const plain = makeElementWeaverState(false);
    const plainWithoutMastery = structuredClone(plain);
    delete plainWithoutMastery.skills.element_weaver_s_armor_mastery;
    const plainStats = getStats(plain);
    const plainBaseline = getStats(plainWithoutMastery);

    // The mastery is inactive without a robe, even though it is learned.
    assert.equal(plainStats.def, plainBaseline.def);
    assert.equal(plainStats.mdef, plainBaseline.mdef);
    assert.equal(plainStats.maxHp, plainBaseline.maxHp);
    assert.equal(plainStats.mpRegen, plainBaseline.mpRegen);
    assert.equal(plainStats.mSkillCdr, plainBaseline.mSkillCdr);

    const robed = makeElementWeaverState(true);
    const robedWithoutMastery = structuredClone(robed);
    delete robedWithoutMastery.skills.element_weaver_s_armor_mastery;
    const robeStats = getStats(robed);
    const robeBaseline = getStats(robedWithoutMastery);

    assert.ok(robeStats.def - robeBaseline.def >= 20, 'robe mastery grants at least the documented +20 P. Def.');
    assert.ok(robeStats.mdef - robeBaseline.mdef >= 30, 'robe mastery grants at least the documented +30 M. Def.');
    const expectedHpDelta = Math.floor(100 * (1 + (Number(robed.primaryStats?.con) || 0) * 0.01));
    assert.ok(robeStats.maxHp - robeBaseline.maxHp >= expectedHpDelta && robeStats.maxHp - robeBaseline.maxHp <= expectedHpDelta + 1,
      'robe mastery grants +100 base Max HP, then the existing CON multiplier applies');
    assert.equal(robeStats.mpRegen - robeBaseline.mpRegen, 3, 'robe mastery grants +3 MP Recovery Rate');
    assert.equal(robeStats.mSkillCdr - robeBaseline.mSkillCdr, 0.15, 'robe mastery reduces magic skill cooldown by 15%');

    const magic = { id: 'element_weaver_mastery_magic_cd', type: 'active', damageType: 'magic', baseCd: 10_000, gameplay: { mpCost: 1 } };
    const physical = { ...magic, id: 'element_weaver_mastery_physical_cd', damageType: 'physical' };
    assert.equal(canCastSkill({ mp: 100, stats: robeStats }, magic, 8_500, { [magic.id]: 0 }).canCast, true);
    assert.equal(canCastSkill({ mp: 100, stats: robeStats }, physical, 8_500, { [physical.id]: 0 }).canCast, false);
  });
});

describe('Elemental Acumen production effects', () => {
  function makeElementalMasterState(withLightArmor) {
    const state = DEFAULT_STATE();
    state.class = 'elemental_master';
    state.race = 'elf';
    state.level = 76;
    state.skills.elemental_acumen = 1;
    if (withLightArmor) {
      state.inventory.push({ uid: 'elemental-acumen-test-light', type: 'armor', armorType: 'light', def: 0 });
      state.equipment.chest = 'elemental-acumen-test-light';
    }
    return state;
  }

  it('applies its light-armor HP, MP, WIT, and cooldown effects through production stats', () => {
    const noArmor = makeElementalMasterState(false);
    const noArmorBaseline = structuredClone(noArmor);
    delete noArmorBaseline.skills.elemental_acumen;
    const noArmorStats = getStats(noArmor);
    const noArmorBaseStats = getStats(noArmorBaseline);
    assert.equal(noArmorStats.maxHp, noArmorBaseStats.maxHp);
    assert.equal(noArmorStats.maxMp, noArmorBaseStats.maxMp);
    assert.equal(noArmor.primaryStats.wit, noArmorBaseline.primaryStats.wit);
    assert.equal(noArmorStats.cdr, noArmorBaseStats.cdr);
    assert.equal(noArmorStats.mSkillCdr, noArmorBaseStats.mSkillCdr);

    const lightArmor = makeElementalMasterState(true);
    const lightArmorBaseline = structuredClone(lightArmor);
    delete lightArmorBaseline.skills.elemental_acumen;
    const activeStats = getStats(lightArmor);
    const baselineStats = getStats(lightArmorBaseline);
    const expectedHpDelta = Math.floor(700 * (1 + (Number(lightArmor.primaryStats?.con) || 0) * 0.01));
    assert.ok(activeStats.maxHp - baselineStats.maxHp >= expectedHpDelta);
    assert.ok(activeStats.maxMp - baselineStats.maxMp >= 700);
    assert.equal(lightArmor.primaryStats.wit, lightArmorBaseline.primaryStats.wit + 1);
    assert.ok(activeStats.cdr > baselineStats.cdr, 'casting speed reduces skill cooldown');
    assert.equal(activeStats.mSkillCdr, baselineStats.mSkillCdr + 0.03, 'explicit M. Skill Cooldown -3% is retained');

    const magic = { id: 'elemental_acumen_magic_cd', type: 'active', damageType: 'magic', baseCd: 10_000, gameplay: { mpCost: 1 } };
    assert.equal(canCastSkill({ mp: 100, stats: activeStats }, magic, 8_000, { [magic.id]: 0 }).canCast, true);
  });
});

describe("Rogue's Armor Mastery production effects", () => {
  it('applies all light-armor effects to every listed Rogue class and no effects without light armor', () => {
    const skill = CANONICAL_SKILL_REGISTRY_V2.rogue_s_armor_mastery;
    for (const classId of skill.classes) {
      const state = DEFAULT_STATE();
      state.class = classId;
      state.race = 'human';
      state.level = 40;
      state.skills.rogue_s_armor_mastery = 1;
      state.inventory.push({ uid: `rogue-mastery-light-${classId}`, type: 'armor', armorType: 'light', def: 0 });
      state.equipment.chest = `rogue-mastery-light-${classId}`;
      const baselineState = structuredClone(state);
      delete baselineState.skills.rogue_s_armor_mastery;
      const active = getStats(state);
      const baseline = getStats(baselineState);

      assert.ok(active.def - baseline.def >= 150, `${classId} gains P. Def. with light armor`);
      assert.equal(active.eva - baseline.eva, 9, `${classId} gains P. Evasion with light armor`);
      assert.equal(active.receivedCritRateReductionPercent - baseline.receivedCritRateReductionPercent, 0.10, `${classId} reduces received critical rate`);
      assert.equal(active.pSkillPowerPercent - baseline.pSkillPowerPercent, 0.01, `${classId} gains physical skill power`);
      assert.equal(active.mSkillPowerPercent - baseline.mSkillPowerPercent, 0.01, `${classId} gains magical skill power`);
      assert.equal(applyPlayerSkillPowerBonus(1_000, active, 'physical') - applyPlayerSkillPowerBonus(1_000, baseline, 'physical'), 10);
      assert.equal(applyPlayerSkillPowerBonus(1_000, active, 'magical') - applyPlayerSkillPowerBonus(1_000, baseline, 'magical'), 10);

      const noArmorState = structuredClone(state);
      noArmorState.equipment.chest = null;
      const noArmorBaselineState = structuredClone(noArmorState);
      delete noArmorBaselineState.skills.rogue_s_armor_mastery;
      const noArmor = getStats(noArmorState);
      const noArmorBaseline = getStats(noArmorBaselineState);
      assert.equal(noArmor.def, noArmorBaseline.def, `${classId} receives no P. Def. without light armor`);
      assert.equal(noArmor.eva, noArmorBaseline.eva, `${classId} receives no evasion without light armor`);
      assert.equal(noArmor.receivedCritRateReductionPercent, noArmorBaseline.receivedCritRateReductionPercent, `${classId} receives no critical resistance without light armor`);
      assert.equal(noArmor.pSkillPowerPercent, noArmorBaseline.pSkillPowerPercent, `${classId} receives no physical skill power without light armor`);
      assert.equal(noArmor.mSkillPowerPercent, noArmorBaseline.mSkillPowerPercent, `${classId} receives no magical skill power without light armor`);
    }

    const combatState = DEFAULT_STATE();
    combatState.class = skill.classes[0];
    combatState.race = 'human';
    combatState.level = 40;
    combatState.skills.rogue_s_armor_mastery = 1;
    combatState.inventory.push({ uid: 'rogue-mastery-combat-light', type: 'armor', armorType: 'light', def: 0 });
    combatState.equipment.chest = 'rogue-mastery-combat-light';
    const monster = { atk: 100, _aiState: { archetype: MONSTER_ARCHETYPES.BERSERKER } };
    const originalRandom = Math.random;
    try {
      Math.random = () => 0.075;
      assert.equal(MonsterAIEngine.processMonsterAttack(monster, {}, {}).isCrit, true);
      assert.equal(MonsterAIEngine.processMonsterAttack(monster, getStats(combatState), {}).isCrit, false);
    } finally {
      Math.random = originalRandom;
    }
  });
});

describe('Combat Armor Mastery production effects', () => {
  it('applies sourced defense, evasion, and MP recovery to every listed class with heavy/light armor', () => {
    const skill = CANONICAL_SKILL_REGISTRY_V2.combat_armor_mastery;
    for (const classId of skill.classes) {
      for (const armorType of ['heavy', 'light']) {
        const state = DEFAULT_STATE();
        state.class = classId;
        state.race = 'human';
        state.level = 40;
        state.skills.combat_armor_mastery = 1;
        state.inventory.push({ uid: `combat-mastery-${classId}-${armorType}`, type: 'armor', armorType, def: 0 });
        state.equipment.chest = `combat-mastery-${classId}-${armorType}`;
        const baselineState = structuredClone(state);
        delete baselineState.skills.combat_armor_mastery;
        const active = getStats(state);
        const baseline = getStats(baselineState);

        assert.ok(active.def - baseline.def >= 135, `${classId}/${armorType} gains P. Def.`);
        assert.ok(active.mdef - baseline.mdef >= 60, `${classId}/${armorType} gains M. Def.`);
        assert.equal(active.eva - baseline.eva, 10, `${classId}/${armorType} gains P. Evasion`);
        assert.equal(active.mpRegen - baseline.mpRegen, 0.10, `${classId}/${armorType} gains +10% MP recovery in the game's per-tick unit`);
      }

      const robe = DEFAULT_STATE();
      robe.class = classId;
      robe.race = 'human';
      robe.level = 40;
      robe.skills.combat_armor_mastery = 1;
      robe.inventory.push({ uid: `combat-mastery-robe-${classId}`, type: 'armor', armorType: 'robe', def: 0 });
      robe.equipment.chest = `combat-mastery-robe-${classId}`;
      const robeBaseline = structuredClone(robe);
      delete robeBaseline.skills.combat_armor_mastery;
      const withRobe = getStats(robe);
      const withoutMastery = getStats(robeBaseline);
      assert.equal(withRobe.def, withoutMastery.def, `${classId} gets no P. Def. with robe`);
      assert.equal(withRobe.mdef, withoutMastery.mdef, `${classId} gets no M. Def. with robe`);
      assert.equal(withRobe.eva, withoutMastery.eva, `${classId} gets no evasion with robe`);
      assert.equal(withRobe.mpRegen, withoutMastery.mpRegen, `${classId} gets no MP recovery with robe`);
    }
  });
});

describe('Death Armor Mastery production effects', () => {
  it('grants the sourced +15 P. Def. to all listed Death Knight classes with heavy/light armor only', () => {
    const skill = CANONICAL_SKILL_REGISTRY_V2.death_armor_mastery;
    for (const classId of skill.classes) {
      for (const armorType of ['heavy', 'light']) {
        const state = DEFAULT_STATE();
        state.class = classId;
        state.race = 'human';
        state.level = 20;
        state.skills.death_armor_mastery = 1;
        state.inventory.push({ uid: `death-mastery-${classId}-${armorType}`, type: 'armor', armorType, def: 0 });
        state.equipment.chest = `death-mastery-${classId}-${armorType}`;
        const baselineState = structuredClone(state);
        delete baselineState.skills.death_armor_mastery;
        assert.equal(getStats(state).def - getStats(baselineState).def, 15, `${classId}/${armorType} receives the sourced defense`);
      }

      const robe = DEFAULT_STATE();
      robe.class = classId;
      robe.race = 'human';
      robe.level = 20;
      robe.skills.death_armor_mastery = 1;
      robe.inventory.push({ uid: `death-mastery-robe-${classId}`, type: 'armor', armorType: 'robe', def: 0 });
      robe.equipment.chest = `death-mastery-robe-${classId}`;
      const baselineState = structuredClone(robe);
      delete baselineState.skills.death_armor_mastery;
      assert.equal(getStats(robe).def, getStats(baselineState).def, `${classId} gets no bonus with robe`);
    }
  });
});

describe('Expert Armor Mastery production effects', () => {
  it('applies light-armor HP, P./M. Defense, and evasion to all listed Kamael classes only', () => {
    const skill = CANONICAL_SKILL_REGISTRY_V2.expert_armor_mastery;
    for (const classId of skill.classes) {
      const state = DEFAULT_STATE();
      state.class = classId;
      state.race = 'kamael';
      state.level = 20;
      state.skills.expert_armor_mastery = 1;
      state.inventory.push({ uid: `expert-mastery-light-${classId}`, type: 'armor', armorType: 'light', def: 0 });
      state.equipment.chest = `expert-mastery-light-${classId}`;
      const baselineState = structuredClone(state);
      delete baselineState.skills.expert_armor_mastery;
      const active = getStats(state);
      const baseline = getStats(baselineState);
      const expectedHpDelta = Math.floor(200 * (1 + (Number(state.primaryStats?.con) || 0) * 0.01));

      assert.ok(active.maxHp - baseline.maxHp >= expectedHpDelta, `${classId} gains +200 base Max HP`);
      assert.ok(active.def - baseline.def >= 100, `${classId} gains +100 P. Def.`);
      assert.ok(active.mdef - baseline.mdef >= 100, `${classId} gains +100 M. Def.`);
      assert.equal(active.eva - baseline.eva, 5, `${classId} gains +5 P. Evasion`);

      const noArmorState = structuredClone(state);
      noArmorState.equipment.chest = null;
      const noArmorBaselineState = structuredClone(noArmorState);
      delete noArmorBaselineState.skills.expert_armor_mastery;
      const noArmor = getStats(noArmorState);
      const noArmorBaseline = getStats(noArmorBaselineState);
      assert.equal(noArmor.maxHp, noArmorBaseline.maxHp, `${classId} receives no HP bonus without light armor`);
      assert.equal(noArmor.def, noArmorBaseline.def, `${classId} receives no P. Def. without light armor`);
      assert.equal(noArmor.mdef, noArmorBaseline.mdef, `${classId} receives no M. Def. without light armor`);
      assert.equal(noArmor.eva, noArmorBaseline.eva, `${classId} receives no evasion without light armor`);
    }
  });
});

describe('Wizard and Summoner Armor Mastery production effects', () => {
  it('applies magic resistance to the real magical-damage path and armor bonuses only to compatible gear', () => {
    const masteries = [
      { id: 'wizard_s_armor_mastery', armorTypes: ['robe'] },
      { id: 'summoner_s_armor_mastery', armorTypes: ['robe', 'light'] }
    ];

    for (const { id, armorTypes } of masteries) {
      const skill = CANONICAL_SKILL_REGISTRY_V2[id];
      for (const classId of skill.classes) {
        const state = DEFAULT_STATE();
        state.class = classId;
        state.level = 40;
        state.skills[id] = 1;
        const baselineState = structuredClone(state);
        delete baselineState.skills[id];
        const active = getStats(state);
        const baseline = getStats(baselineState);

        assert.ok(active.mdef - baseline.mdef >= 30, `${classId} gains the unconditional +30 M. Def.`);
        assert.equal(active.magicDamageTakenReductionPercent - baseline.magicDamageTakenReductionPercent, 0.15, `${classId} gains 15% magic damage resistance`);
        assert.equal(active.def, baseline.def, `${classId} has no conditional P. Def. without matching armor`);
        assert.equal(active.maxHp, baseline.maxHp, `${classId} has no conditional HP without matching armor`);

        for (const armorType of armorTypes) {
          const geared = structuredClone(state);
          geared.inventory.push({ uid: `${id}-${classId}-${armorType}`, type: 'armor', armorType, def: 0 });
          geared.equipment.chest = `${id}-${classId}-${armorType}`;
          const gearedBaseline = structuredClone(geared);
          delete gearedBaseline.skills[id];
          const gearedStats = getStats(geared);
          const gearedBaseStats = getStats(gearedBaseline);
          const expectedHpDelta = Math.floor(60 * (1 + (Number(geared.primaryStats?.con) || 0) * 0.01));
          assert.ok(gearedStats.def - gearedBaseStats.def >= 30, `${classId}/${armorType} gains +30 P. Def.`);
          assert.ok(gearedStats.maxHp - gearedBaseStats.maxHp >= expectedHpDelta, `${classId}/${armorType} gains +60 base Max HP`);
        }

        const incompatibleGear = structuredClone(state);
        incompatibleGear.inventory.push({ uid: `${id}-${classId}-heavy`, type: 'armor', armorType: 'heavy', def: 0 });
        incompatibleGear.equipment.chest = `${id}-${classId}-heavy`;
        const incompatibleBaseline = structuredClone(incompatibleGear);
        delete incompatibleBaseline.skills[id];
        const incompatibleStats = getStats(incompatibleGear);
        const incompatibleBaseStats = getStats(incompatibleBaseline);
        assert.equal(incompatibleStats.def, incompatibleBaseStats.def, `${classId} gets no P. Def. bonus with heavy armor`);
        assert.equal(incompatibleStats.maxHp, incompatibleBaseStats.maxHp, `${classId} gets no HP bonus with heavy armor`);
        assert.equal(incompatibleStats.magicDamageTakenReductionPercent, 0.15, `${classId} retains unconditional magic resistance with heavy armor`);

        assert.equal(applyPlayerDamageTakenReduction(1_000, active, 'physical'), 1_000, `${classId} does not reduce physical damage`);
        assert.equal(applyPlayerDamageTakenReduction(1_000, active, 'magical'), 850, `${classId} reduces magical damage by 15%`);

        const caster = { atk: 100, matk: 200, magic: true, element: 'fire', _aiState: { archetype: MONSTER_ARCHETYPES.CASTER } };
        const originalRandom = Math.random;
        try {
          Math.random = () => 0.99;
          const attack = MonsterAIEngine.processMonsterAttack(caster, active, {});
          const rawMitigated = calculateDefenseMitigation(attack.baseAtk, active.mdef, true);
          assert.equal(attack.atkType, 'magical');
          assert.equal(applyPlayerDamageTakenReduction(rawMitigated, active, attack.atkType), Math.floor(rawMitigated * 0.85));
        } finally {
          Math.random = originalRandom;
        }
      }
    }
  });
});

describe('Khavatari Armor Mastery production effects', () => {
  it('applies light-armor defense, evasion, critical resistance, and MP recovery to Grand Khavatari', () => {
    const state = DEFAULT_STATE();
    state.class = 'grand_khavatari';
    state.race = 'orc';
    state.level = 76;
    state.skills.khavatari_s_armor_mastery = 1;
    state.inventory.push({ uid: 'khavatari-mastery-light', type: 'armor', armorType: 'light', def: 0 });
    state.equipment.chest = 'khavatari-mastery-light';
    const baselineState = structuredClone(state);
    delete baselineState.skills.khavatari_s_armor_mastery;
    const active = getStats(state);
    const baseline = getStats(baselineState);

    assert.ok(active.def - baseline.def >= 119, 'light armor receives +119 P. Def.');
    assert.ok(active.mdef - baseline.mdef >= 60, 'light armor receives +60 M. Def.');
    assert.equal(active.eva - baseline.eva, 12, 'light armor receives +12 P. Evasion');
    assert.equal(active.receivedCritRateReductionPercent - baseline.receivedCritRateReductionPercent, 0.35);
    assert.equal(active.mpRegen - baseline.mpRegen, 0.10);

    const monster = { atk: 100, _aiState: { archetype: MONSTER_ARCHETYPES.BERSERKER } };
    const originalRandom = Math.random;
    try {
      Math.random = () => 0.06;
      assert.equal(MonsterAIEngine.processMonsterAttack(monster, baseline, {}).isCrit, true);
      assert.equal(MonsterAIEngine.processMonsterAttack(monster, active, {}).isCrit, false);
    } finally {
      Math.random = originalRandom;
    }

    for (const armorType of ['heavy', 'robe']) {
      const incompatible = structuredClone(state);
      incompatible.inventory[0].armorType = armorType;
      const incompatibleBaseline = structuredClone(incompatible);
      delete incompatibleBaseline.skills.khavatari_s_armor_mastery;
      const gearStats = getStats(incompatible);
      const gearBaseline = getStats(incompatibleBaseline);
      assert.equal(gearStats.def, gearBaseline.def, `${armorType} does not activate P. Def.`);
      assert.equal(gearStats.mdef, gearBaseline.mdef, `${armorType} does not activate M. Def.`);
      assert.equal(gearStats.eva, gearBaseline.eva, `${armorType} does not activate evasion`);
      assert.equal(gearStats.receivedCritRateReductionPercent, gearBaseline.receivedCritRateReductionPercent, `${armorType} does not activate critical resistance`);
      assert.equal(gearStats.mpRegen, gearBaseline.mpRegen, `${armorType} does not activate MP recovery`);
    }
  });
});

describe("Templar's Armor Mastery production effects", () => {
  it('also activates for Shillien Templar with heavy armor', () => {
    const state = DEFAULT_STATE();
    state.class = 'shillien_templar';
    state.level = 76;
    state.skills.templar_s_armor_mastery = 1;
    state.inventory.push({ uid: 'shillien-templar-mastery-heavy', type: 'armor', armorType: 'heavy', def: 0 });
    state.equipment.chest = 'shillien-templar-mastery-heavy';
    const baselineState = structuredClone(state);
    delete baselineState.skills.templar_s_armor_mastery;
    const active = getStats(state);
    const baseline = getStats(baselineState);

    assert.ok(active.def - baseline.def >= 320);
    assert.ok(active.mdef - baseline.mdef >= 160);
    assert.equal(active.receivedBasicCritDamageReductionPercent, 0.35);
    assert.equal(active.bowResistancePercent, 0.05);
    assert.equal(active.firearmsResistancePercent, 0.05);
    assert.equal(active.mpRegen - baseline.mpRegen, 0.10);
  });

  it('applies heavy-armor defense, shield defense, received basic critical reduction, and MP recovery', () => {
    const state = DEFAULT_STATE();
    state.class = 'evas_templar';
    state.level = 76;
    state.skills.templar_s_armor_mastery = 1;
    state.inventory.push(
      { uid: 'templar-mastery-heavy', type: 'armor', armorType: 'heavy', def: 0 },
      { uid: 'templar-mastery-shield', type: 'shield', slot: 'shield', def: 0 }
    );
    state.equipment.chest = 'templar-mastery-heavy';
    state.equipment.shield = 'templar-mastery-shield';
    const baselineState = structuredClone(state);
    delete baselineState.skills.templar_s_armor_mastery;
    const active = getStats(state);
    const baseline = getStats(baselineState);

    assert.ok(active.def - baseline.def >= 320, 'heavy armor receives +320 P. Def.');
    assert.ok(active.mdef - baseline.mdef >= 160, 'heavy armor receives +160 M. Def.');
    assert.equal(active.block - baseline.block, 5, 'equipped shield gains +5 percentage points of block chance');
    assert.equal(resolvePlayerBlock(100, active.block, 'physical', 0.04).blocked, true, 'the extra shield defense reaches the real block roll');
    assert.equal(resolvePlayerBlock(100, baseline.block, 'physical', 0.04).blocked, false, 'the same roll does not block without the passive bonus');
    assert.equal(active.receivedBasicCritDamageReductionPercent, 0.35);
    assert.equal(active.bowResistancePercent, 0.05);
    assert.equal(active.firearmsResistancePercent, 0.05);
    assert.equal(active.mpRegen - baseline.mpRegen, 0.10);
    assert.equal(SkillEffectService.applyPlayerWeaponDamageReduction(1_000, active, 'bow'), 950);
    assert.equal(SkillEffectService.applyPlayerWeaponDamageReduction(1_000, active, 'crossbow'), 950);
    assert.equal(SkillEffectService.applyPlayerWeaponDamageReduction(1_000, active, 'firearm'), 950);
    assert.equal(SkillEffectService.applyPlayerWeaponDamageReduction(1_000, active, 'sword'), 1_000);
    for (const [monsterId, weaponType] of Object.entries({
      kashaOrcArcher: 'bow', outpostMarksman: 'bow', skeletonArcher: 'bow',
      gludioRoyalArcher: 'bow', adenCrossbowman: 'crossbow'
    })) {
      assert.equal(MONSTERS[monsterId].weaponType, weaponType, `${monsterId} declares its ranged weapon family`);
      assert.equal(MonsterAIEngine.processMonsterAttack(MONSTERS[monsterId], active, {}).weaponType, weaponType, `${monsterId} preserves weapon family in its attack`);
    }
    assert.equal(SkillEffectService.applyPlayerBasicCriticalDamageReduction(1_600, active), 1_040);
    assert.equal(SkillEffectService.applyPlayerBasicCriticalDamageReduction(1_600, active, false), 1_600, 'basic-critical reduction does not affect skill attacks');
    const monster = { atk: 1_000, _aiState: { archetype: MONSTER_ARCHETYPES.BERSERKER } };
    const originalRandom = Math.random;
    try {
      Math.random = () => 0.01;
      const attack = MonsterAIEngine.processMonsterAttack(monster, active, {});
      assert.equal(attack.isCrit, true, 'the production monster attack path produces the basic critical');
      const baseDamage = calculateDefenseMitigation(attack.baseAtk, active.def);
      const criticalDamage = Math.floor(baseDamage * attack.critMultiplier);
      assert.equal(SkillEffectService.applyPlayerBasicCriticalDamageReduction(criticalDamage, active), Math.floor(criticalDamage * 0.65));
    } finally {
      Math.random = originalRandom;
    }

    const noShield = structuredClone(state);
    noShield.equipment.shield = null;
    const noShieldBaseline = structuredClone(noShield);
    delete noShieldBaseline.skills.templar_s_armor_mastery;
    assert.equal(getStats(noShield).block, getStats(noShieldBaseline).block, 'shield defense requires an equipped shield');

    for (const armorType of ['light', 'robe']) {
      const incompatible = structuredClone(state);
      incompatible.inventory[0].armorType = armorType;
      const incompatibleBaseline = structuredClone(incompatible);
      delete incompatibleBaseline.skills.templar_s_armor_mastery;
      const gearStats = getStats(incompatible);
      const gearBaseline = getStats(incompatibleBaseline);
      assert.equal(gearStats.def, gearBaseline.def, `${armorType} does not activate P. Def.`);
      assert.equal(gearStats.mdef, gearBaseline.mdef, `${armorType} does not activate M. Def.`);
      assert.equal(gearStats.block, gearBaseline.block, `${armorType} does not activate shield defense`);
      assert.equal(gearStats.mpRegen, gearBaseline.mpRegen, `${armorType} does not activate MP recovery`);
      assert.equal(gearStats.receivedBasicCritDamageReductionPercent, 0, `${armorType} does not activate critical resistance`);
      assert.equal(gearStats.bowResistancePercent, 0, `${armorType} does not activate bow resistance`);
      assert.equal(gearStats.firearmsResistancePercent, 0, `${armorType} does not activate firearms resistance`);
    }
  });
});

describe('Armor Care skill critical effects', () => {
  it('applies sourced rank 1 and 2 effects to both Templars and resolves physical skill criticals', () => {
    assert.deepEqual(CANONICAL_SKILL_REGISTRY_V2.armor_care.wikiSkillIdsByClass, {
      evas_templar: 88053,
      shillien_templar: 88055
    });
    for (const [classId, rank, expected] of [
      ['evas_templar', 1, { pSkillCritRate: 1, pSkillCritDamagePercent: 0.03, receivedCritDamageReductionPercent: 0.02, shieldBlockBonus: 3, pveDamagePercent: 0 }],
      ['shillien_templar', 2, { pSkillCritRate: 3, pSkillCritDamagePercent: 0.08, receivedCritDamageReductionPercent: 0.04, shieldBlockBonus: 8, pveDamagePercent: 0.10 }]
    ]) {
      const state = DEFAULT_STATE();
      state.class = classId;
      state.level = rank === 1 ? 76 : 84;
      state.skills.armor_care = rank;
      state.inventory.push({ uid: 'armor-care-shield', itemId: 'armor-care-shield', type: 'shield', slot: 'shield', def: 100, count: 1 });
      state.equipment.shield = 'armor-care-shield';
      const stats = getStats(state);
      const baseline = structuredClone(state);
      delete baseline.skills.armor_care;
      const baselineStats = getStats(baseline);
      for (const [key, value] of Object.entries(expected).filter(([key]) => key !== 'shieldBlockBonus')) {
        assert.equal(stats[key] || 0, value, `${classId} rank ${rank} has ${key}`);
      }
      assert.equal(stats.block - baselineStats.block, expected.shieldBlockBonus, `${classId} rank ${rank} converts shield-ignore removal to usable shield block chance`);
      assert.equal(resolvePlayerBlock(100, stats.block, 'physical', expected.shieldBlockBonus / 100 - 0.001).blocked, true, 'the adapted shield bonus reaches the actual block resolver');
      assert.equal(resolvePlayerBlock(100, baselineStats.block, 'physical', 0).blocked, false, 'the block resolver does not receive the Armor Care bonus without the passive');
      assert.equal(SkillEffectService.applyPlayerBasicCriticalDamageReduction(1_000, stats, false), Math.floor(1_000 * (1 - expected.receivedCritDamageReductionPercent)));
      const noShield = structuredClone(state);
      noShield.equipment.shield = null;
      const noShieldBaseline = structuredClone(noShield);
      delete noShieldBaseline.skills.armor_care;
      assert.equal(getStats(noShield).block, getStats(noShieldBaseline).block, 'the shield adaptation requires an equipped shield');
    }

    const rank1 = { pSkillCritRate: 1, pSkillCritDamagePercent: 0.03 };
    assert.deepEqual(SkillEffectService.resolvePhysicalSkillCriticalDamage(1_000, rank1, 0.009), { damage: 1_545, isCrit: true });
    assert.deepEqual(SkillEffectService.resolvePhysicalSkillCriticalDamage(1_000, rank1, 0.01), { damage: 1_000, isCrit: false });
    const rank2 = { pSkillCritRate: 3, pSkillCritDamagePercent: 0.08 };
    assert.deepEqual(SkillEffectService.resolvePhysicalSkillCriticalDamage(1_000, rank2, 0.029), { damage: 1_620, isCrit: true });
  });
});

describe('canonical control skills disable monster actions for their sourced durations', () => {
  it('resolves crowd-control effects instead of silently dropping them', () => {
    const expected = {
      thunder_storm: 3_000,
      power_crash: 3_000,
      quick_spear: 3_000,
      shield_charge: 3_000,
      shocking_burst: 3_000,
      heavy_sleep: 5_000,
      improved_sleep: 5_000,
      paralysis: 3_000,
      wild_beat: 3_000,
      shield_bash: 3_000,
      elemental_roots: 5_000,
      lightning_strike: 3_000,
      mass_lightning_strike: 3_000,
      mass_dryad_root: 5_000,
      mass_shackling: 5_000,
      duress: 5_000,
      spear_cage: 3_000,
      vine_embrace: 3_000,
      queen_s_garden: 4_000,
      armor_crush: 3_000,
      iron_fist: 3_000,
      adena_stun: 3_000,
      body_crush: 3_000,
      rush_impact: 2_000,
      blacksmith_s_attack: 3_000,
      indestructible_seal: 10_000,
      indestructible_blade: 5_000,
      light_discharge: 3_000
    };
    for (const [id, durationMs] of Object.entries(expected)) {
      const effect = resolveSkillTargetDebuffStats(CANONICAL_SKILL_REGISTRY_V2[id]);
      assert.ok(effect?.actionsDisabled > 0, `${id} must block target actions`);
      assert.equal(resolveSkillTargetDebuffDurationMs(CANONICAL_SKILL_REGISTRY_V2[id]), durationMs, `${id} duration`);
    }
    assert.deepEqual(resolveSkillTargetDebuffStats(CANONICAL_SKILL_REGISTRY_V2.shocking_burst), {
      actionsDisabled: 1, pDefPercent: -0.30, mDefPercent: -0.30
    });
    assert.deepEqual(resolveSkillTargetDebuffStats(CANONICAL_SKILL_REGISTRY_V2.armor_crush), {
      actionsDisabled: 1, pDefPercent: -0.30, mDefPercent: -0.30
    });
    assert.deepEqual(resolveSkillTargetDebuffStats(CANONICAL_SKILL_REGISTRY_V2.duress), {
      actionsDisabled: 1, pAtkPercent: -0.30, mAtkPercent: -0.30
    });
  });

  it('makes the production action-lock consumer reject actions only until expiry', () => {
    const monster = { _skillDebuffs: { heavy_sleep: {
      stats: resolveSkillTargetDebuffStats(CANONICAL_SKILL_REGISTRY_V2.heavy_sleep),
      until: 5_000
    } } };
    assert.equal(isMonsterActionDisabled(monster, 4_999), true);
    assert.equal(isMonsterActionDisabled(monster, 5_000), false);
  });

  it('keeps Spear Cage control and defense-break durations independent', () => {
    const def = CANONICAL_SKILL_REGISTRY_V2.spear_cage;
    const monster = { _skillDebuffs: { spear_cage: {
      stats: resolveSkillTargetDebuffStats(def),
      until: 3_000,
      appliedAt: 0,
      statDurationsMs: resolveSkillTargetDebuffStatDurationsMs(def)
    } } };
    assert.equal(isMonsterActionDisabled(monster, 2_999), true);
    assert.equal(isMonsterActionDisabled(monster, 3_000), false);
    assert.equal(getActiveSkillDebuffStats(monster, 9_999).pDefPercent, -0.30);
    assert.equal(getActiveSkillDebuffStats(monster, 10_000).pDefPercent, undefined);
  });

  it('translates Time Distortion into a timed movement slow and a flat monster-skill cooldown penalty', () => {
    const def = CANONICAL_SKILL_REGISTRY_V2.time_distortion_master;
    const stats = resolveSkillTargetDebuffStats(def);
    assert.deepEqual(stats, { movementSpeedPercent: -0.80, skillCooldownFlatMs: 30_000 });
    assert.equal(resolveSkillTargetDebuffDurationMs(def), 5_000);
    assert.equal(resolveDebuffedMonsterSkillCooldownMs({ _skillDebuffs: {
      time_distortion_master: { stats, until: 5_000 }
    } }, 4_000, 4_999), 34_000);
    assert.equal(resolveDebuffedMonsterSkillCooldownMs({ _skillDebuffs: {
      time_distortion_master: { stats, until: 5_000 }
    } }, 4_000, 5_000), 4_000);
  });

  it('preserves chance-based control procs and keeps unconditional parts of hybrid skills', () => {
    const shockingBurst = CANONICAL_SKILL_REGISTRY_V2.shocking_burst;
    const proc = resolveSkillTargetDebuffApplication(shockingBurst, 0.29);
    assert.equal(proc.procSucceeded, true);
    assert.deepEqual(proc.stats, { actionsDisabled: 1, pDefPercent: -0.30, mDefPercent: -0.30 });

    const failedStun = resolveSkillTargetDebuffApplication(shockingBurst, 0.30);
    assert.equal(failedStun.procSucceeded, false);
    assert.deepEqual(failedStun.stats, { pDefPercent: -0.30, mDefPercent: -0.30 });

    const improvedSleep = CANONICAL_SKILL_REGISTRY_V2.improved_sleep;
    assert.equal(resolveSkillTargetDebuffApplication(improvedSleep, 0.69).procSucceeded, true);
    const missedSleep = resolveSkillTargetDebuffApplication(improvedSleep, 0.70);
    assert.equal(missedSleep.procSucceeded, false);
    assert.equal(missedSleep.stats, null);

    const bonusProc = resolveSkillTargetDebuffApplication(shockingBurst, 0.45, 20);
    assert.equal(bonusProc.procSucceeded, true);
    assert.equal(resolveSkillTargetDebuffApplication(improvedSleep, 0.69, 20).procSucceeded, true);
    assert.equal(resolveSkillTargetDebuffApplication(improvedSleep, 0.70, 20).procSucceeded, false);
  });

  it('stores only successful chance controls in the same debuff state combat consumes', () => {
    const monster = {};
    const def = CANONICAL_SKILL_REGISTRY_V2.shocking_burst;
    const missed = applySkillTargetDebuff(monster, def, 1_000, 0.30);
    assert.equal(missed.procSucceeded, false);
    assert.equal(isMonsterActionDisabled(monster, 1_001), false);
    assert.deepEqual(getActiveSkillDebuffStats(monster, 1_001), { pDefPercent: -0.30, mDefPercent: -0.30 });

    const landed = applySkillTargetDebuff(monster, def, 2_000, 0.29);
    assert.equal(landed.procSucceeded, true);
    assert.equal(isMonsterActionDisabled(monster, 2_001), true);
    assert.equal(isMonsterActionDisabled(monster, 5_000), false);

    const guaranteed = {};
    applySkillTargetDebuff(guaranteed, CANONICAL_SKILL_REGISTRY_V2.thunder_storm, 1_000, 0.999);
    assert.equal(isMonsterActionDisabled(guaranteed, 1_001), true);
  });

  it('starts Indestructible Seal defense break after its sourced imprisonment ends', () => {
    const missedMonster = {};
    applySkillTargetDebuff(missedMonster, CANONICAL_SKILL_REGISTRY_V2.indestructible_seal, 5_000, 0.30);
    assert.equal(isMonsterActionDisabled(missedMonster, 5_001), false);
    assert.deepEqual(getActiveSkillDebuffStats(missedMonster, 5_001), {});

    const monster = {};
    const seal = CANONICAL_SKILL_REGISTRY_V2.indestructible_seal;
    const result = applySkillTargetDebuff(monster, seal, 10_000, 0.1);
    assert.equal(result.procSucceeded, true);
    assert.equal(isMonsterActionDisabled(monster, 14_999), true);
    assert.equal(getActiveSkillDebuffStats(monster, 14_999).pDefPercent, undefined);
    assert.equal(isMonsterActionDisabled(monster, 15_000), false);
    assert.equal(getActiveSkillDebuffStats(monster, 15_000).pDefPercent, -0.10);
    assert.equal(getActiveSkillDebuffStats(monster, 19_999).pDefPercent, -0.10);
    assert.equal(getActiveSkillDebuffStats(monster, 20_000).pDefPercent, undefined);
  });

  it('activates Winter Skin paralysis only on a successful reactive proc while the buff is active', () => {
    const inactiveTarget = {};
    const inactive = applyPlayerBuffHitControlProc(inactiveTarget, { winter_skin: { until: 999 } }, 1_000, 0);
    assert.equal(inactive.procSucceeded, false);
    assert.equal(isMonsterActionDisabled(inactiveTarget, 1_001), false);

    const activeTarget = {};
    const missed = applyPlayerBuffHitControlProc(activeTarget, { winter_skin: { until: 5_000 } }, 1_000, 0.30);
    assert.equal(missed.procSucceeded, false);
    assert.equal(isMonsterActionDisabled(activeTarget, 1_001), false);

    const proc = applyPlayerBuffHitControlProc(activeTarget, { winter_skin: { until: 5_000 } }, 2_000, 0.29);
    assert.equal(proc.procSucceeded, true);
    assert.equal(isMonsterActionDisabled(activeTarget, 4_999), true);
    assert.equal(isMonsterActionDisabled(activeTarget, 5_000), false);
  });
});

describe('Dwarven Weapon Mastery source effects reach combat stats and skill costs', () => {
  const dwarfState = (level, mastery, weaponType = 'sword') => {
    const state = {
      ...DEFAULT_STATE(),
      class: 'fortuneSeeker',
      race: 'dwarf',
      level,
      skills: mastery ? { dwarven_weapon_mastery: 1 } : {},
      equipment: { weapon: 'dwarf-weapon' },
      inventory: [{ uid: 'dwarf-weapon', itemId: `audit_${weaponType}`, weaponType, type: weaponType }],
      buffs: {}
    };
    return state;
  };

  it('scales the sourced physical attack value across its level 8 and level 15 source entries', () => {
    const level76 = getStats(dwarfState(76, true));
    const level76Base = getStats(dwarfState(76, false));
    const level90 = getStats(dwarfState(90, true));
    const level90Base = getStats(dwarfState(90, false));
    const level76Gain = level76.atk - level76Base.atk;
    const level90Gain = level90.atk - level90Base.atk;
    // Derived P. Atk. includes the character's production multipliers, so test
    // both the sourced floor and the ratio of the two source rank values.
    assert.ok(level76Gain >= 420);
    assert.ok(level90Gain > level76Gain);
    assert.ok(Math.abs(level90Gain / level76Gain - (650 / 420)) < 0.01);
  });

  it('applies the 60% physical skill MP reduction through the real cast-cost gate', () => {
    const stats = getStats(dwarfState(76, true));
    assert.equal(stats.pSkillMpCostReduction, 0.60);
    const skill = { id: 'dwarf_physical_cost_test', type: 'active', damageType: 'physical', gameplay: { mpCost: 100 }, baseCd: 1_000 };
    assert.equal(canCastSkill({ mp: 100, stats }, skill).mpCost, 40);
  });

  it('maps the Stun proc only to swords and blunt weapons', () => {
    assert.equal(resolveDwarvenWeaponMasteryStunChancePercent(1, 'sword'), 30);
    assert.equal(resolveDwarvenWeaponMasteryStunChancePercent(1, 'blunt'), 30);
    assert.equal(resolveDwarvenWeaponMasteryStunChancePercent(1, 'spear'), 0);
    assert.equal(resolveDwarvenWeaponMasteryStunChancePercent(0, 'sword'), 0);
  });

  it('adapts the spear multi-target clause as basic-attack-only damage in the single-target game', () => {
    const spear = getStats(dwarfState(76, true, 'spear'));
    const sword = getStats(dwarfState(76, true, 'sword'));
    const unlearnedSpear = getStats(dwarfState(76, false, 'spear'));
    assert.equal(spear.basicAttackDamagePercent, 0.10);
    assert.equal(sword.basicAttackDamagePercent, 0);
    assert.equal(unlearnedSpear.basicAttackDamagePercent, 0);
    assert.equal(applyPlayerBasicAttackDamageBonus(1_000, spear), 1_100);
    assert.equal(applyPlayerBasicAttackDamageBonus(1_000, sword), 1_000);
  });
});

describe('Dwarven Armor Mastery source effects reach defense and incoming critical checks', () => {
  const dwarfArmorState = (armorType, mastery = true) => ({
    ...DEFAULT_STATE(),
    class: 'fortuneSeeker',
    race: 'dwarf',
    level: 76,
    skills: mastery ? { dwarven_armor_mastery: 1 } : {},
    equipment: { armor: 'dwarf-armor' },
    inventory: [{ uid: 'dwarf-armor', itemId: `audit_${armorType}`, type: armorType }],
    buffs: {}
  });

  it('applies the sourced +160 P. Def., +10 evasion, and 5% received critical-rate reduction with heavy/light armor', () => {
    for (const armorType of ['heavy', 'light']) {
      const state = dwarfArmorState(armorType);
      const base = getStats(dwarfArmorState(armorType, false));
      const stats = getStats(state);
      assert.equal(stats.def - base.def, 160, `${armorType} armor gets the sourced defense`);
      assert.equal(stats.eva - base.eva, 10, `${armorType} armor gets the sourced evasion`);
      assert.equal(stats.receivedCritRateReductionPercent, 0.05);
    }
  });

  it('does not apply armor mastery with robe and lowers the real monster critical roll when active', () => {
    const robe = getStats(dwarfArmorState('robe'));
    const noRobePassive = getStats(dwarfArmorState('robe', false));
    assert.equal(robe.def, noRobePassive.def);
    assert.equal(robe.eva, noRobePassive.eva);
    assert.equal(robe.receivedCritRateReductionPercent, 0);

    const monster = { atk: 100, _aiState: { archetype: MONSTER_ARCHETYPES.BERSERKER } };
    const originalRandom = Math.random;
    try {
      Math.random = () => 0.078;
      assert.equal(MonsterAIEngine.processMonsterAttack(monster, {}, {}).isCrit, true);
      const heavyStats = getStats(dwarfArmorState('heavy'));
      assert.equal(MonsterAIEngine.processMonsterAttack(monster, heavyStats, {}).isCrit, false);
    } finally {
      Math.random = originalRandom;
    }
  });
});

describe('Dwarven Recovery Mastery feeds real HP and MP recovery ticks', () => {
  const dwarfRecoveryState = (level, learned = true) => ({
    ...DEFAULT_STATE(),
    class: 'fortuneSeeker',
    race: 'dwarf',
    level,
    skills: learned ? { dwarven_recovery_mastery: 1 } : {},
    buffs: {}
  });

  it('uses source-confirmed values at each level boundary', () => {
    const sourceStages = [
      [77, 13, 4], [82, 14, 4], [84, 15, 4],
      [86, 16, 5], [88, 18, 5], [90, 20, 5]
    ];
    for (const [level, hpRecoveryFlat, mpRecovery] of sourceStages) {
      assert.deepEqual(resolveDwarvenRecoveryMasteryBonuses(level, 1), { hpRecoveryFlat, mpRecovery });
      const stats = getStats(dwarfRecoveryState(level));
      const baseline = getStats(dwarfRecoveryState(level, false));
      assert.equal(stats.hpRegenFlat, hpRecoveryFlat);
      assert.equal(stats.mpRegen - baseline.mpRegen, mpRecovery);
    }
    assert.deepEqual(resolveDwarvenRecoveryMasteryBonuses(90, 0), { hpRecoveryFlat: 0, mpRecovery: 0 });
    assert.deepEqual(resolveDwarvenRecoveryMasteryBonuses(76, 1), { hpRecoveryFlat: 0, mpRecovery: 0 });
  });
});

describe('Sacral Masteries honor sourced level values and equipment conditions', () => {
  const templarState = (level, skills, weapon = 'one-handed', armor = 'heavy', shield = true) => {
    const inventory = [
      { uid: 'audit-sword', itemId: weapon === 'two-handed' ? 'audit_great_sword' : weapon === 'blunt' ? 'audit_blunt' : 'audit_one_hand_sword', type: weapon === 'blunt' ? 'blunt' : 'sword', isTwoHanded: weapon === 'two-handed' },
      { uid: 'audit-armor', itemId: `audit_${armor}`, type: armor, armorType: armor, def: 20, mdef: 10 }
    ];
    const equipment = { weapon: 'audit-sword', armor: 'audit-armor' };
    if (shield) {
      inventory.push({ uid: 'audit-shield', itemId: 'audit_shield', type: 'shield', def: 12 });
      equipment.shield = 'audit-shield';
    }
    return {
      ...DEFAULT_STATE(),
      class: 'divineTemplar',
      race: 'highelf',
      level,
      skills,
      equipment,
      inventory,
      buffs: {}
    };
  };

  it('applies sword-and-shield P. Atk. values at the sourced character-level thresholds', () => {
    const stages = [[20, 60], [40, 120], [63, 200], [70, 300]];
    for (const [level, expectedMinimum] of stages) {
      const enabled = getStats(templarState(level, { sacral_weapon_mastery: 1 }));
      const baseline = getStats(templarState(level, {}));
      assert.ok(enabled.atk - baseline.atk >= expectedMinimum, `level ${level} applies at least the sourced P. Atk. ${expectedMinimum}`);
    }
  });

  it('does not grant Sacral Weapon Mastery without a one-handed sword and shield', () => {
    for (const [weapon, shield] of [['one-handed', false], ['blunt', true], ['two-handed', true]]) {
      const state = templarState(70, { sacral_weapon_mastery: 1 }, weapon, 'heavy', shield);
      const baseline = templarState(70, {}, weapon, 'heavy', shield);
      assert.equal(getStats(state).atk, getStats(baseline).atk, `${weapon} weapon / shield=${shield}`);
    }
  });

  it('applies source P./M. Def. by level only with heavy armor', () => {
    const stages = [[20, 50], [40, 100], [63, 150], [70, 200]];
    for (const [level, expected] of stages) {
      const enabled = getStats(templarState(level, { sacral_armor_mastery: 1 }, 'one-handed', 'heavy'));
      const baseline = getStats(templarState(level, {}, 'one-handed', 'heavy'));
      assert.ok(enabled.def - baseline.def >= expected, `level ${level} P. Def follows the source floor ${expected}`);
      assert.ok(enabled.mdef - baseline.mdef >= expected, `level ${level} M. Def follows the source floor ${expected}`);
    }
    const robe = getStats(templarState(70, { sacral_armor_mastery: 1 }, 'one-handed', 'robe'));
    const robeBaseline = getStats(templarState(70, {}, 'one-handed', 'robe'));
    assert.equal(robe.def, robeBaseline.def);
    assert.equal(robe.mdef, robeBaseline.mdef);
  });
});
