import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveSkillBuffStats,
  resolveSkillBuffDurationMs,
  resolveSkillTargetDebuffStats,
  resolveSkillTargetDebuffDurationMs,
  resolveSkillSelfHealPercent
} from '../lineage-idle/src/services/SkillEffectService.js';

test('ShineMaker authored buffs resolve to supported combat stats and bounded durations', () => {
  const cases = [
    ['shineMakerBase_luminary_glow', { mAtkPercent: 0.15, pDefPercent: 0.10 }, 8_000],
    ['shineMakerBase_shinemakers_harmony', { mAtkPercent: 0.20, pDefPercent: 0.20 }, 1_800_000],
    ['shineMakerS1_shining_barrier', { pDefPercent: 0.15, mDefPercent: 0.15 }, 120_000],
    ['shineMakerS2_light_of_creation', { mAtkPercent: 0.25, mSkillPowerPercent: 0.10 }, 120_000],
    ['shineMakerS2_brilliant_aura', { pAtkPercent: 0.10, mAtkPercent: 0.10, pDefPercent: 0.10, mDefPercent: 0.10 }, 300_000],
    ['shineMakerS2_shinemaker_harmony_s2', { mAtkPercent: 0.35, mDefPercent: 0.20, mSkillPowerPercent: 0.10 }, 1_500_000],
    ['shinemaker_shinemakers_ultimate_harmony', { mAtkPercent: 0.30, pDefPercent: 0.20, cdr: 0.10 }, 1_800_000],
    ['shinemaker_divine_crystal_aegis', { damageTakenReductionPercent: 0.35 }, 8_000]
  ];

  for (const [id, expectedStats, expectedDuration] of cases) {
    const definition = { id, type: 'buff', effect: 'buff' };
    assert.deepEqual(resolveSkillBuffStats(definition), expectedStats, `${id} should resolve its explicit adaptation`);
    assert.equal(resolveSkillBuffDurationMs(definition), expectedDuration, `${id} should use its combat-scale duration`);
  }
});

test('ShineMaker control skills resolve the target-side combat behavior described by their adaptation', () => {
  const cases = [
    ['shineMakerS1_radiant_strike', { pAtkPercent: -0.10, mAtkPercent: -0.10 }, 2_000],
    ['shineMakerS2_prismatic_ray', { atkSpdPercent: -0.30, cooldownPercent: 0.30 }, 4_000],
    ['shinemaker_star_fall', { actionsDisabled: 1 }, 3_000],
    ['shinemaker_transcendent_star_fall', { pAtkPercent: -0.15, mAtkPercent: -0.15 }, 5_000]
  ];

  for (const [id, expectedStats, expectedDuration] of cases) {
    const definition = { id, type: 'active', effect: 'dmg' };
    assert.deepEqual(resolveSkillTargetDebuffStats(definition), expectedStats, `${id} should resolve its target effect`);
    assert.equal(resolveSkillTargetDebuffDurationMs(definition), expectedDuration, `${id} should have a bounded duration`);
  }
});

test('ShineMaker party heals adapt to measured self-heals in solo combat', () => {
  assert.equal(resolveSkillSelfHealPercent({ id: 'shineMakerS2_shining_nova' }), 0.10);
  assert.equal(resolveSkillSelfHealPercent({ id: 'shinemaker_transcendent_star_fall' }), 0.30);
  assert.equal(resolveSkillSelfHealPercent({ id: 'shineMakerS2_crystal_arrow' }), 0);
});
