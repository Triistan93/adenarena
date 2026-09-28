import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { assessEffect, assessEffectCoverage, EFFECT_CONTRACTS, summarizeAudit } from '../scripts/lib/functional-evidence.mjs';

const actionLockConsumerProof = Object.freeze({
  basicDamageBefore: 100, basicDamageWhileDisabled: 0, basicDamageAfterExpiry: 100,
  skillDamageBefore: 140, skillDamageWhileDisabled: 0, skillDamageAfterExpiry: 140,
  skillCooldownWhileDisabled: 0
});

test('the functional evidence catalog has unique top-level skill contracts', () => {
  const source = readFileSync(new URL('../scripts/lib/functional-evidence.mjs', import.meta.url), 'utf8');
  const ids = [...source.matchAll(/^  "([^"]+)": \{$/gm)].map(match => match[1]);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  assert.deepEqual(duplicates, []);
  assert.equal(EFFECT_CONTRACTS.fast_spell_casting.stat, 'cdr');
  assert.equal(EFFECT_CONTRACTS.boost_attack_speed.stat, 'cdr');
});

test('metadata and unrelated damage cannot prove an effect', () => {
  assert.equal(assessEffect({ kind: 'passive', stat: 'crit' }, { before: { crit: 5 }, after: { crit: 5 }, def: { effect: 'stat' } }).pass, false);
  assert.equal(assessEffect({ kind: 'damage' }, { skillId: 'power_strike', hpBefore: 100, hpAfter: 90, events: [] }).pass, false);
  assert.equal(assessEffect(null, { hpBefore: 100, hpAfter: 90 }).status, 'NOT_VALIDATED');
});

test('Quick Step passive proof requires both movement stats and a shorter production attack interval', () => {
  const contract = {
    kind: 'passive',
    expectedDeltas: [{ stat: 'movementSpeedPercent', direction: 'increase' }],
    consumer: 'basic_attack_interval'
  };
  const evidence = {
    before: { movementSpeedPercent: 0, atkSpd: 100 },
    after: { movementSpeedPercent: 0.15, atkSpd: 100 },
    consumerProof: {
      baselineIntervalMs: 1_000,
      reducedIntervalMs: 870,
      productionConsumer: 'main.resolvePlayerBasicAttackIntervalMs'
    }
  };
  assert.equal(assessEffect(contract, evidence).pass, true);
  assert.equal(assessEffect(contract, { ...evidence, consumerProof: { ...evidence.consumerProof, reducedIntervalMs: 1_000 } }).pass, false);
  assert.equal(assessEffect(contract, { ...evidence, after: { ...evidence.after, movementSpeedPercent: 0 } }).pass, false);
});

test('Inferno and Touch of Death have effect-specific production contracts', () => {
  assert.equal(EFFECT_CONTRACTS.inferno.kind, 'damage_over_time');
  assert.equal(EFFECT_CONTRACTS.inferno.expectedTicks, 10);
  assert.equal(EFFECT_CONTRACTS.touch_of_death.kind, 'target_debuff');
  assert.deepEqual(EFFECT_CONTRACTS.touch_of_death.expectedDeltas, [{ stat: 'damageTakenPercent', direction: 'increase' }]);
  const contract = EFFECT_CONTRACTS.touch_of_death;
  const measured = {
    before: { damageTakenPercent: 0 }, after: { damageTakenPercent: 0.1 }, expired: { damageTakenPercent: 0 },
    applied: true, expiresInMs: 20_000, hpBefore: 1_000, hpAfter: 900, maxHp: 1_000
  };
  assert.equal(assessEffect(contract, measured).pass, true);
  assert.equal(assessEffect(contract, { ...measured, hpAfter: 950 }).pass, false, 'target vulnerability alone does not prove the self-sacrifice cost');
});

test('warrior buff adaptations have independent stat and expiry contracts', () => {
  const contracts = {
    rage: [
      { stat: 'atk', direction: 'increase' },
      { stat: 'cdr', direction: 'increase' }
    ],
    soul_roar: [
      { stat: 'atk', direction: 'increase' },
      { stat: 'debuffResistancePercent', direction: 'increase' }
    ],
    soul_guard: [
      { stat: 'def', direction: 'increase' },
      { stat: 'mdef', direction: 'increase' },
      { stat: 'debuffResistancePercent', direction: 'increase' }
    ]
  };
  for (const [id, expectedDeltas] of Object.entries(contracts)) {
    const contract = EFFECT_CONTRACTS[id];
    assert.deepEqual(contract.expectedDeltas, expectedDeltas);
    assert.match(contract.source, /Aden Arena (?:adaptation:|adapts)/);
    const stats = Object.fromEntries([...expectedDeltas.map(({ stat }) => [stat, 10]), ['atkSpd', 0]]);
    const before = Object.fromEntries([...expectedDeltas.map(({ stat }) => [stat, 0]), ['atkSpd', 0]]);
    assert.equal(assessEffect(contract, {
      before,
      after: stats,
      expired: before,
      applied: true,
      expiresInMs: 8_000
    }).pass, true, `${id} accepts its measured timed stat changes`);
    assert.equal(assessEffect(contract, {
      before,
      after: before,
      expired: before,
      applied: true,
      expiresInMs: 8_000
    }).pass, false, `${id} rejects a buff without measurable effects`);
  }
  assert.deepEqual(EFFECT_CONTRACTS.rage.unchangedStats, ['atkSpd']);
});

test('Samurai elemental stances have four distinct measured production contracts', () => {
  const expected = {
    fire: ['atk'],
    wind: ['cdr'],
    mountain: ['def', 'mdef'],
    forest: ['eva', 'debuffResistancePercent']
  };
  for (const [id, stats] of Object.entries(expected)) {
    const contract = EFFECT_CONTRACTS[id];
    assert.deepEqual(contract.expectedDeltas.map(delta => delta.stat), stats);
    assert.match(contract.source, /Aden Arena (?:adaptation:|adapts)/);
    const before = Object.fromEntries(stats.map(stat => [stat, 0]));
    if (contract.unchangedStats) for (const stat of contract.unchangedStats) before[stat] = 0;
    const after = Object.fromEntries(stats.map(stat => [stat, 1]));
    if (contract.unchangedStats) for (const stat of contract.unchangedStats) after[stat] = 0;
    assert.equal(assessEffect(contract, { before, after, expired: before, applied: true, expiresInMs: 8_000 }).pass, true, `${id} validates only its actual stats and expiry`);
    assert.equal(assessEffect(contract, { before, after: before, expired: before, applied: true, expiresInMs: 8_000 }).pass, false, `${id} rejects a missing stat change`);
  }
  assert.deepEqual(EFFECT_CONTRACTS.wind.unchangedStats, ['atkSpd']);
});

test('creative fear and shadow-step adaptations require measurable target deltas and expiry', () => {
  const fear = EFFECT_CONTRACTS.word_of_fear;
  assert.deepEqual(fear.expectedDeltas, [
    { stat: 'atk', direction: 'decrease' },
    { stat: 'matk', direction: 'decrease' }
  ]);
  assert.equal(assessEffect(fear, {
    before: { atk: 100, matk: 120 }, after: { atk: 88, matk: 105 }, expired: { atk: 100, matk: 120 },
    applied: true, expiresInMs: 5_000, consumerProof: actionLockConsumerProof
  }).pass, true);
  assert.equal(assessEffect(fear, {
    before: { atk: 100, matk: 120 }, after: { atk: 100, matk: 120 }, expired: { atk: 100, matk: 120 },
    applied: true, expiresInMs: 5_000
  }).pass, false);

  const shadowStep = EFFECT_CONTRACTS.shadow_step;
  assert.deepEqual(shadowStep.expectedDeltas, [{ stat: 'movementSpeedPercent', direction: 'decrease' }]);
  assert.equal(assessEffect(shadowStep, {
    before: { movementSpeedPercent: 0 }, after: { movementSpeedPercent: -0.30 }, expired: { movementSpeedPercent: 0 },
    applied: true, expiresInMs: 5_000,
    consumerProof: {
      basicAttackIntervalBefore: 1_500, basicAttackIntervalAfter: 1_875,
      skillCooldownBefore: 1, skillCooldownAfter: 1,
      productionConsumer: 'main.attackMonster.enemyAttackInterval'
    }
  }).pass, true);
});

test('Freezing Flame requires its full timed-damage sequence in production combat', () => {
  const contract = EFFECT_CONTRACTS.freezing_flame;
  assert.equal(contract.kind, 'damage_over_time');
  assert.equal(contract.expectedTicks, 10);
  assert.equal(contract.expectedDurationMs, 10_000);
  const events = Array.from({ length: 10 }, (_, index) => ({
    skillId: 'freezing_flame', source: 'damage_over_time', damage: 10,
    hpBefore: 1_000 - index * 10, hpAfter: 990 - index * 10
  }));
  assert.equal(assessEffect(contract, {
    skillId: 'freezing_flame', events, cast: true, applied: true,
    expired: true, expiresInMs: 10_000
  }).pass, true);
  assert.equal(assessEffect(contract, {
    skillId: 'freezing_flame', events: events.slice(1), cast: true, applied: true,
    expired: true, expiresInMs: 10_000
  }).pass, false);
});

test('Freezing Wound requires production damage, target slowdown, and debuff expiry', () => {
  const contract = {
    kind: 'damage_and_target_debuff',
    expectedDeltas: [
      { stat: 'attackSpeed', direction: 'decrease' },
      { stat: 'skillCooldown', direction: 'increase' }
    ]
  };
  const evidence = {
    cast: true,
    skillId: 'freezing_wound',
    hpBefore: 1_000,
    hpAfter: 880,
    events: [{ skillId: 'freezing_wound', damage: 120 }],
    before: { attackSpeed: 2, skillCooldown: 1 },
    after: { attackSpeed: 1.6, skillCooldown: 1.2 },
    expired: { attackSpeed: 2, skillCooldown: 1 },
    applied: true,
    expiresInMs: 3_000
  };
  assert.equal(assessEffect(contract, evidence).pass, true);
  assert.equal(assessEffect(contract, { ...evidence, events: [] }).pass, false);
  assert.equal(assessEffect(contract, { ...evidence, after: evidence.before }).pass, false);
  assert.equal(assessEffect(contract, { ...evidence, expiresInMs: null }).pass, false);
});

test('PvP-only Disarm and Shillien Stigma validate through timed PvE target consumers', () => {
  const disarm = EFFECT_CONTRACTS.disarm;
  assert.deepEqual(disarm.expectedDeltas, [{ stat: 'atk', direction: 'decrease' }]);
  assert.equal(assessEffect(disarm, {
    before: { atk: 100 }, after: { atk: 80 }, expired: { atk: 100 }, applied: true, expiresInMs: 2_000
  }).pass, true);

  const stigma = EFFECT_CONTRACTS.shillien_s_stigma;
  assert.deepEqual(stigma.expectedDeltas, [
    { stat: 'damageTakenPercent', direction: 'increase' },
    { stat: 'mdef', direction: 'decrease' }
  ]);
  assert.equal(assessEffect(stigma, {
    before: { damageTakenPercent: 0, mdef: 200 },
    after: { damageTakenPercent: 0.10, mdef: 180 },
    expired: { damageTakenPercent: 0, mdef: 200 }, applied: true, expiresInMs: 8_000
  }).pass, true);
});

test('Flame Grip has an independent five-second monster action-lock contract', () => {
  const contract = EFFECT_CONTRACTS.flame_grip;
  assert.equal(contract.kind, 'target_debuff');
  assert.deepEqual(contract.expectedDeltas, [{ stat: 'actionsDisabled', direction: 'increase' }]);
  assert.match(contract.source, /action lock prevents monster basic attacks and skills/);
  const evidence = {
    before: { actionsDisabled: 0 }, after: { actionsDisabled: 1 }, expired: { actionsDisabled: 0 },
    applied: true, expiresInMs: 5_000,
    consumerProof: actionLockConsumerProof
  };
  assert.equal(assessEffect(contract, evidence).pass, true);
  assert.equal(assessEffect(contract, { ...evidence, expiresInMs: 0 }).pass, false);
  assert.equal(assessEffect(contract, { ...evidence, after: evidence.before }).pass, false);
});

test('Blazing Fury contract covers all documented combat stats and adapted duration', () => {
  const contract = EFFECT_CONTRACTS.blazing_fury;
  assert.equal(contract.kind, 'buff');
  assert.deepEqual(contract.expectedDeltas.map(({ stat }) => stat), ['atk', 'def', 'maxHp', 'pSkillPowerPercent']);
  assert.match(contract.source, /L2Wiki Lineage II Essence Blazing Fury Lv\. 1/);
  const evidence = {
    before: { atk: 100, def: 100, maxHp: 1_000, pSkillPowerPercent: 0 },
    after: { atk: 110, def: 110, maxHp: 1_100, pSkillPowerPercent: 0.05 },
    expired: { atk: 100, def: 100, maxHp: 1_000, pSkillPowerPercent: 0 },
    applied: true, expiresInMs: 20_000
  };
  assert.equal(assessEffect(contract, evidence).pass, true);
  assert.equal(assessEffect(contract, { ...evidence, after: { ...evidence.after, maxHp: 1_000 } }).pass, false);
});

test('Elemental Wind Walk proves a shorter production basic-attack interval without changing speed or cooldown', () => {
  const contract = EFFECT_CONTRACTS.elemental_wind_walk;
  assert.deepEqual(contract.expectedDeltas, [{ stat: 'movementSpeedPercent', direction: 'increase' }]);
  assert.deepEqual(contract.unchangedStats, ['atkSpd', 'cdr']);
  assert.equal(contract.consumer, 'basic_attack_interval');
  assert.equal(assessEffect(contract, {
    before: { movementSpeedPercent: 0, atkSpd: 1.02, cdr: 0.10 },
    after: { movementSpeedPercent: 0.05, atkSpd: 1.02, cdr: 0.10 },
    expired: { movementSpeedPercent: 0, atkSpd: 1.02, cdr: 0.10 },
    applied: true, expiresInMs: 10_000,
    consumerProof: { baselineIntervalMs: 388, reducedIntervalMs: 370, productionConsumer: 'main.resolvePlayerBasicAttackIntervalMs' }
  }).pass, true);
  assert.equal(assessEffect(contract, {
    before: { movementSpeedPercent: 0, atkSpd: 1.02, cdr: 0.10 },
    after: { movementSpeedPercent: 0.05, atkSpd: 1.02, cdr: 0.10 },
    expired: { movementSpeedPercent: 0, atkSpd: 1.02, cdr: 0.10 },
    applied: true, expiresInMs: 10_000,
    consumerProof: { baselineIntervalMs: 388, reducedIntervalMs: 388, productionConsumer: 'main.resolvePlayerBasicAttackIntervalMs' }
  }).pass, false);
});

test('Sylph and Kamael wind buffs have distinct measured production contracts', () => {
  const expected = {
    elemental_magic_barrier: ['mdef', 'debuffResistancePercent'],
    elemental_insight: ['matk', 'mSkillCdr'],
    soul_wind_walk: ['movementSpeedPercent'],
    blessing_of_winds: ['movementSpeedPercent', 'debuffResistancePercent']
  };
  const durations = {
    elemental_magic_barrier: 8_000,
    elemental_insight: 8_000,
    soul_wind_walk: 10_000,
    blessing_of_winds: 10_000
  };
  for (const [id, stats] of Object.entries(expected)) {
    const contract = EFFECT_CONTRACTS[id];
    assert.deepEqual(contract.expectedDeltas.map(delta => delta.stat), stats);
    assert.match(contract.source, /Aden Arena (?:adaptation:|adapts)/);
    const before = Object.fromEntries(stats.map(stat => [stat, 0]));
    before.atkSpd = 0;
    before.cdr = 0;
    const after = Object.fromEntries(stats.map(stat => [stat, 1]));
    after.atkSpd = 0;
    after.cdr = 0;
    assert.equal(assessEffect(contract, {
      before, after, expired: before, applied: true, expiresInMs: durations[id],
      ...(contract.consumer === 'basic_attack_interval' ? {
        consumerProof: { baselineIntervalMs: 1_000, reducedIntervalMs: 333, productionConsumer: 'main.resolvePlayerBasicAttackIntervalMs' }
      } : {})
    }).pass, true, `${id} validates the measured buff and expiration`);
    assert.equal(assessEffect(contract, {
      before, after: before, expired: before, applied: true, expiresInMs: durations[id]
    }).pass, false, `${id} rejects a missing combat effect`);
  }
  assert.deepEqual(EFFECT_CONTRACTS.elemental_insight.unchangedStats, ['atkSpd']);
  for (const id of ['soul_wind_walk', 'blessing_of_winds']) {
    assert.deepEqual(EFFECT_CONTRACTS[id].unchangedStats, ['atkSpd', 'cdr']);
    assert.equal(EFFECT_CONTRACTS[id].consumer, 'basic_attack_interval');
  }
});

test('Sharp Blade contract proves the documented level-one attack bonus without speed inflation', () => {
  const contract = EFFECT_CONTRACTS.sharp_blade;
  assert.deepEqual(contract.expectedDeltas, [{ stat: 'atk', direction: 'increase' }]);
  assert.deepEqual(contract.unchangedStats, ['atkSpd']);
  assert.match(contract.source, /Sharp Blade Lv\. 1 gives 5% P\. Atk\./);
  assert.equal(assessEffect(contract, {
    before: { atk: 100, atkSpd: 0 },
    after: { atk: 105, atkSpd: 0 },
    expired: { atk: 100, atkSpd: 0 },
    applied: true,
    expiresInMs: 8_000
  }).pass, true);
  assert.equal(assessEffect(contract, {
    before: { atk: 100, atkSpd: 0 },
    after: { atk: 100, atkSpd: 0 },
    expired: { atk: 100, atkSpd: 0 },
    applied: true,
    expiresInMs: 8_000
  }).pass, false);
});

test('Powerful Fists evidence requires two damaging hits and measured defense penetration', () => {
  const contract = { kind: 'multi_hit_damage', expectedHits: 2, defenseIgnorePercent: 0.25 };
  const evidence = {
    cast: true,
    hpBefore: 10_000,
    hpAfter: 9_800,
    skillId: 'powerful_fists',
    events: [
      { skillId: 'powerful_fists', damage: 100, hitIndex: 1, hitCount: 2, targetDefenseBefore: 100, effectiveDefense: 75, defenseIgnorePercent: 0.25 },
      { skillId: 'powerful_fists', damage: 100, hitIndex: 2, hitCount: 2, targetDefenseBefore: 100, effectiveDefense: 75, defenseIgnorePercent: 0.25 }
    ]
  };
  assert.equal(assessEffect(contract, evidence).pass, true);
  assert.equal(assessEffect(contract, { ...evidence, events: evidence.events.slice(0, 1) }).pass, false);
  assert.equal(assessEffect(contract, { ...evidence, events: evidence.events.map(hit => ({ ...hit, effectiveDefense: 100 })) }).pass, false);
});

test('verifies reflected damage against the documented active effect percentage', () => {
  const contract = EFFECT_CONTRACTS.blazing_skin;
  assert.equal(contract.kind, 'damage_reflection');
  assert.equal(contract.reflectPercent, 0.03);
  assert.equal(assessEffect(contract, { applied: true, expiresInMs: 10_000, receivedDamage: 101, reflectedDamage: 3 }).pass, true);
  assert.equal(assessEffect(contract, { applied: true, expiresInMs: 10_000, receivedDamage: 101, reflectedDamage: 4 }).pass, false);
});

test('effects are not evaluated when learning or equipping the audited skill failed', () => {
  const result = assessEffect(
    { kind: 'damage' },
    {
      preconditionsMet: false,
      skillId: 'hellfire',
      hpBefore: 100,
      hpAfter: 50,
      events: [{ skillId: 'wipeout', damage: 50 }]
    }
  );

  assert.equal(result.status, 'NOT_EXECUTED');
  assert.equal(result.pass, null);
});

test('fixed Life Rescue healing is audited as HP recovery, not as an unmeasured buff', () => {
  assert.equal(EFFECT_CONTRACTS.life_rescue.kind, 'heal');
  assert.equal(assessEffect(EFFECT_CONTRACTS.life_rescue, {
    cast: true, hpBefore: 100, hpAfter: 227, maxHp: 500, expectedHeal: 127
  }).pass, true);
  assert.equal(assessEffect(EFFECT_CONTRACTS.life_rescue, {
    cast: true, hpBefore: 100, hpAfter: 300, maxHp: 500, expectedHeal: 127
  }).pass, false);
});

test('Sacrifice audit requires the canonical heal, paid HP cost, and net healing in production', () => {
  const contract = EFFECT_CONTRACTS.sacrifice;
  assert.equal(contract.kind, 'sacrifice_heal');
  const evidence = {
    cast: true, hpBefore: 500, hpAfter: 800, maxHp: 1000,
    hpCost: 100, healPower: 350, expectedHeal: 400
  };
  assert.equal(assessEffect(contract, evidence).pass, true);
  assert.equal(assessEffect(contract, { ...evidence, hpCost: 0 }).pass, false);
  assert.equal(assessEffect(contract, { ...evidence, hpAfter: 900 }).pass, false);
  assert.equal(assessEffect(contract, { ...evidence, healPower: 100 }).pass, false);
});

test('Vitalize effect proof requires both actual healing and removed combat debuffs', () => {
  const contract = EFFECT_CONTRACTS.vitalize;
  assert.equal(contract.kind, 'heal_and_cleanse');
  const evidence = {
    cast: true,
    hpBefore: 100,
    hpAfter: 180,
    maxHp: 500,
    healPower: 460,
    expectedHeal: 80,
    cleansedDebuffs: ['monster_hex', 'monster_gloom']
  };
  assert.equal(assessEffect(contract, evidence).pass, true);
  assert.equal(assessEffect(contract, { ...evidence, hpAfter: 100 }).pass, false);
  assert.equal(assessEffect(contract, { ...evidence, healPower: 100 }).pass, false);
  assert.equal(assessEffect(contract, { ...evidence, expectedHeal: 81 }).pass, false);
  assert.equal(assessEffect(contract, { ...evidence, cleansedDebuffs: [] }).pass, false);
});

test('Ultimate Evasion contract validates evasion and adapted monster-debuff resistance', () => {
  const contract = EFFECT_CONTRACTS.ultimate_evasion;
  assert.equal(contract.kind, 'buff');
  assert.deepEqual(contract.expectedDeltas.map(delta => delta.stat), [
    'eva', 'pSkillEvasionPercent', 'debuffResistancePercent'
  ]);
  assert.equal(assessEffect(contract, {
    before: { eva: 20, pSkillEvasionPercent: 0, debuffResistancePercent: 0 },
    after: { eva: 45, pSkillEvasionPercent: 0.4, debuffResistancePercent: 0.8 },
    expired: { eva: 20, pSkillEvasionPercent: 0, debuffResistancePercent: 0 },
    applied: true,
    expiresInMs: 30_000
  }).status, 'PASS');
});

test('effect-contract coverage is derived from observed unique skills, including missing contracts', () => {
  const coverage = assessEffectCoverage(
    ['strike', 'missing_skill', 'long_shot', 'strike'],
    {
      strike: { kind: 'damage' },
      long_shot: { kind: 'defined_not_implemented', status: 'DEFINED_BUT_NOT_IMPLEMENTED' }
    }
  );

  assert.equal(coverage.totalUniqueSkills, 3);
  assert.equal(coverage.contractsConfigured, 2);
  assert.equal(coverage.implementedContracts, 1);
  assert.deepEqual(coverage.unmappedSkills, ['missing_skill']);
  assert.deepEqual(coverage.unimplementedSkills, ['long_shot']);
  assert.equal(coverage.pass, false);
});

test('buff proof requires the expected attribute and expiration, not just a buff field', () => {
  const contract = { kind: 'buff', stat: 'atk' };
  const evidence = { before: { atk: 10 }, after: { atk: 12 }, expired: { atk: 10 }, applied: true, expiresInMs: 60000 };
  assert.equal(assessEffect(contract, evidence).pass, true);
  assert.equal(assessEffect(contract, { ...evidence, after: { atk: 10 } }).pass, false);
  assert.equal(assessEffect(contract, { ...evidence, expired: { atk: 12 } }).pass, false);
});

test('Acumen contract validates cooldown reduction and its expiration', () => {
  const evidence = {
    before: { cdr: 0, atkSpd: 0 },
    after: { cdr: 0.15, atkSpd: 0 },
    expired: { cdr: 0, atkSpd: 0 },
    applied: true,
    expiresInMs: 60_000
  };
  assert.equal(assessEffect(EFFECT_CONTRACTS.acumen, evidence).pass, true);
  assert.equal(assessEffect(EFFECT_CONTRACTS.acumen, { ...evidence, after: { cdr: 0, atkSpd: 0 } }).pass, false);
  assert.equal(assessEffect(EFFECT_CONTRACTS.acumen, { ...evidence, expired: { cdr: 0.15, atkSpd: 0 } }).pass, false);
});

test('Unleashed Power contract requires all three active stats and expiration', () => {
  const contract = EFFECT_CONTRACTS.unleashed_power;
  assert.deepEqual(contract.expectedDeltas.map(delta => delta.stat), [
    'damageTakenReductionPercent', 'debuffResistancePercent', 'pSkillPowerPercent'
  ]);
  assert.equal(assessEffect(contract, {
    before: { damageTakenReductionPercent: 0, debuffResistancePercent: 0, pSkillPowerPercent: 0 },
    after: { damageTakenReductionPercent: 0.03, debuffResistancePercent: 0.05, pSkillPowerPercent: 0.01 },
    expired: { damageTakenReductionPercent: 0, debuffResistancePercent: 0, pSkillPowerPercent: 0 },
    applied: true, expiresInMs: 10_000,
    consumerProof: { baselineDamage: 1000, reducedDamage: 970, physicalSkillDamageBefore: 1000, physicalSkillDamageAfter: 1010 }
  }).pass, true);
  assert.equal(assessEffect(contract, {
    before: { damageTakenReductionPercent: 0, debuffResistancePercent: 0, pSkillPowerPercent: 0 },
    after: { damageTakenReductionPercent: 0.03, debuffResistancePercent: 0.05, pSkillPowerPercent: 0.01 },
    expired: { damageTakenReductionPercent: 0, debuffResistancePercent: 0, pSkillPowerPercent: 0 },
    applied: true, expiresInMs: 10_000,
    consumerProof: { baselineDamage: 1000, reducedDamage: 970, physicalSkillDamageBefore: 1000, physicalSkillDamageAfter: 1000 }
  }).pass, false);
});

test('Blessed Shield contract requires its measured block-rate increase and expiration', () => {
  const evidence = {
    before: { block: 10 },
    after: { block: 15 },
    expired: { block: 10 },
    applied: true,
    expiresInMs: 60_000
  };
  assert.equal(assessEffect(EFFECT_CONTRACTS.blessed_shield, evidence).pass, true);
  assert.equal(assessEffect(EFFECT_CONTRACTS.blessed_shield, { ...evidence, after: { block: 10 } }).pass, false);
  assert.equal(assessEffect(EFFECT_CONTRACTS.blessed_shield, { ...evidence, expired: { block: 15 } }).pass, false);
});

test('Advanced Block contract requires measured shield defense and expiration', () => {
  const evidence = {
    before: { def: 100 },
    after: { def: 102 },
    expired: { def: 100 },
    applied: true,
    expiresInMs: 60_000
  };
  assert.equal(assessEffect(EFFECT_CONTRACTS.advanced_block, evidence).pass, true);
  assert.equal(assessEffect(EFFECT_CONTRACTS.advanced_block, { ...evidence, after: { def: 100 } }).pass, false);
  assert.equal(assessEffect(EFFECT_CONTRACTS.advanced_block, { ...evidence, expired: { def: 102 } }).pass, false);
});

test('Haste-family contracts require cooldown reduction without an attack-speed increase', () => {
  const variants = [
    ['haste', 0.15],
    ['chant_of_haste', 0.15],
    ['elemental_haste', 0.15],
    ['maphr_s_haste', 0.35],
    ['soul_haste', 0.35],
    ['acumen', 0.15],
    ['chant_of_acumen', 0.15],
    ['maphr_s_acumen', 0.33],
    ['soul_acumen', 0.33]
  ];

  for (const [skillId, amount] of variants) {
    const contract = EFFECT_CONTRACTS[skillId];
    assert.deepEqual(contract.expectedDeltas, [{ stat: 'cdr', direction: 'increase' }], `${skillId} CDR contract`);
    assert.deepEqual(contract.unchangedStats, ['atkSpd'], `${skillId} unchanged attack speed`);
    const evidence = {
      before: { cdr: 0, atkSpd: 0 },
      after: { cdr: amount, atkSpd: 0 },
      expired: { cdr: 0, atkSpd: 0 },
      applied: true,
      expiresInMs: 60_000
    };
    assert.equal(assessEffect(contract, evidence).pass, true, `${skillId} valid evidence`);
    assert.equal(assessEffect(contract, { ...evidence, after: { ...evidence.after, atkSpd: 0.15 } }).pass, false, `${skillId} rejects attack-speed side effect`);
  }
});

test('Chant of Vampire requires movement cadence, resistance, and chance-based healing in production combat', () => {
  const contract = EFFECT_CONTRACTS.chant_of_vampire;
  assert.equal(contract.kind, 'buff');
  assert.equal(contract.consumer, 'chant_vampire_lifedrain');
  const evidence = {
    applied: true,
    expiresInMs: 60_000,
    before: { movementSpeedPercent: 0, debuffResistancePercent: 0, cdr: 0, atkSpd: 0 },
    after: { movementSpeedPercent: 0.02, debuffResistancePercent: 0.10, cdr: 0, atkSpd: 0 },
    expired: { movementSpeedPercent: 0, debuffResistancePercent: 0, cdr: 0, atkSpd: 0 },
    consumerProof: { procDamage: 1000, procHealing: 70, controlDamage: 1000, controlHealing: 0, baselineIntervalMs: 1_000, reducedIntervalMs: 980 }
  };
  assert.equal(assessEffect(contract, evidence).pass, true);
  assert.equal(assessEffect(contract, { ...evidence, consumerProof: { ...evidence.consumerProof, procHealing: 69 } }).pass, false);
  assert.equal(assessEffect(contract, { ...evidence, consumerProof: { ...evidence.consumerProof, reducedIntervalMs: 1_000 } }).pass, false);
  assert.equal(assessEffect(contract, { ...evidence, after: { ...evidence.after, atkSpd: 2 } }).pass, false);
});

test('Concentration contract validates debuff resistance, not cooldown or attack speed', () => {
  const contract = EFFECT_CONTRACTS.concentration;
  assert.equal(contract.kind, 'buff');
  assert.deepEqual(contract.expectedDeltas, [{ stat: 'debuffResistancePercent', direction: 'increase' }]);
  const evidence = {
    before: { debuffResistancePercent: 0, cdr: 0, atkSpd: 0 },
    after: { debuffResistancePercent: 0.36, cdr: 0, atkSpd: 0 },
    expired: { debuffResistancePercent: 0, cdr: 0, atkSpd: 0 },
    applied: true,
    expiresInMs: 60_000
  };
  assert.equal(assessEffect(contract, evidence).pass, true);
  assert.equal(assessEffect(contract, { ...evidence, after: { ...evidence.after, cdr: 0.36 } }).pass, false);
});

test('Detect Weakness contract validates the timed damage-taken increase on its target', () => {
  const contract = EFFECT_CONTRACTS.detect_weakness;
  assert.equal(contract.kind, 'target_debuff');
  assert.deepEqual(contract.expectedDeltas, [{ stat: 'damageTakenPercent', direction: 'increase' }]);
  const evidence = {
    before: { damageTakenPercent: 0 },
    after: { damageTakenPercent: 0.08 },
    expired: { damageTakenPercent: 0 },
    applied: true,
    expiresInMs: 8_000
  };
  assert.equal(assessEffect(contract, evidence).pass, true);
  assert.equal(assessEffect(contract, { ...evidence, expired: { damageTakenPercent: 0.08 } }).pass, false);
});

test('Roar of Death contract validates reductions to both target attack types', () => {
  const contract = EFFECT_CONTRACTS.roar_of_death;
  assert.equal(contract.kind, 'target_debuff');
  assert.deepEqual(contract.expectedDeltas, [
    { stat: 'atk', direction: 'decrease' },
    { stat: 'matk', direction: 'decrease' }
  ]);
  const evidence = {
    before: { atk: 100, matk: 120 },
    after: { atk: 85, matk: 102 },
    expired: { atk: 100, matk: 120 },
    applied: true,
    expiresInMs: 10_000
  };
  assert.equal(assessEffect(contract, evidence).pass, true);
  assert.equal(assessEffect(contract, { ...evidence, after: { atk: 85, matk: 120 } }).pass, false);
});

test('buff contracts validate their declared stats rather than assuming every buff increases attack', () => {
  const contract = { kind: 'buff', expectedDeltas: [{ stat: 'def', direction: 'increase' }, { stat: 'maxHp', direction: 'increase' }] };
  const evidence = {
    before: { atk: 10, def: 20, maxHp: 500 },
    after: { atk: 10, def: 25, maxHp: 700 },
    expired: { atk: 10, def: 20, maxHp: 500 },
    applied: true,
    expiresInMs: 60_000
  };
  assert.equal(assessEffect(contract, evidence).pass, true);
  assert.equal(assessEffect(contract, { ...evidence, after: { ...evidence.after, maxHp: 500 } }).pass, false);
  assert.equal(assessEffect({ kind: 'buff', unsupportedEffects: ['unparsed shield behavior'] }, evidence).status, 'NOT_VALIDATED');
});

test('passive contracts verify every declared stat delta', () => {
  const contract = EFFECT_CONTRACTS.clarity;
  const evidence = {
    before: { pSkillMpCostReduction: 0, mSkillMpCostReduction: 0 },
    after: { pSkillMpCostReduction: 0.1, mSkillMpCostReduction: 0.04 }
  };
  assert.equal(assessEffect(contract, evidence).pass, true);
  assert.equal(assessEffect(contract, {
    ...evidence,
    after: { ...evidence.after, mSkillMpCostReduction: 0 }
  }).pass, false);
});

test('periodic recovery contracts require resource restoration through production ticks', () => {
  const contract = { kind: 'periodic_regen', stat: 'regenHp', resource: 'hp', ticks: 50 };
  const evidence = { before: { regenHp: 0 }, after: { regenHp: 0.01 }, resourceBefore: 900, resourceAfter: 912, resourceGained: 12, ticks: 50 };
  assert.equal(assessEffect(contract, evidence).pass, true);
  assert.equal(assessEffect(contract, { ...evidence, resourceAfter: 900, resourceGained: 0 }).pass, false);
  assert.equal(assessEffect(contract, { ...evidence, ticks: 1 }).pass, false);
});

test('target-debuff evidence proves its combat stat reduction and expiry on the target', () => {
  const contract = { kind: 'target_debuff', expectedDeltas: [{ stat: 'atk', direction: 'decrease' }] };
  const evidence = { before: { atk: 100 }, after: { atk: 77 }, expired: { atk: 100 }, applied: true, expiresInMs: 60_000 };
  assert.equal(assessEffect(contract, evidence).pass, true);
  assert.equal(assessEffect(contract, { ...evidence, after: { atk: 100 } }).pass, false);
  const erosionEvidence = {
    before: { def: 200, mdef: 160 },
    after: { def: 180, mdef: 144 },
    expired: { def: 200, mdef: 160 },
    applied: true,
    expiresInMs: 5_000
  };
  assert.equal(assessEffect(EFFECT_CONTRACTS.erosion, erosionEvidence).pass, true);
  assert.equal(assessEffect(EFFECT_CONTRACTS.erosion, { ...erosionEvidence, after: { def: 200, mdef: 144 } }).pass, false);
  assert.equal(assessEffect({ ...contract, unsupportedEffects: ['unknown debuff'] }, evidence).status, 'NOT_VALIDATED');
  const slowContract = { kind: 'target_debuff', expectedDeltas: [{ stat: 'attackSpeed', direction: 'decrease' }, { stat: 'skillCooldown', direction: 'increase' }] };
  const slowEvidence = { before: { attackSpeed: 2, skillCooldown: 1 }, after: { attackSpeed: 1.54, skillCooldown: 1.23 }, expired: { attackSpeed: 2, skillCooldown: 1 }, applied: true, expiresInMs: 60_000 };
  assert.equal(assessEffect(slowContract, slowEvidence).pass, true);
  assert.equal(assessEffect(EFFECT_CONTRACTS.power_break, {
    before: { atk: 100 }, after: { atk: 77 }, expired: { atk: 100 }, applied: true, expiresInMs: 60_000
  }).pass, true);
  const crippleEvidence = {
    before: { attackSpeed: 2, skillCooldown: 1, movementSpeedPercent: 0 },
    after: { attackSpeed: 1.7, skillCooldown: 1.15, movementSpeedPercent: -0.15 },
    expired: { attackSpeed: 2, skillCooldown: 1, movementSpeedPercent: 0 },
    applied: true,
    expiresInMs: 60_000
  };
  assert.equal(assessEffect(EFFECT_CONTRACTS.cripple, crippleEvidence).pass, true);
  assert.equal(assessEffect(EFFECT_CONTRACTS.shining_prison, {
    before: { actionsDisabled: 0 }, after: { actionsDisabled: 1 }, expired: { actionsDisabled: 0 }, applied: true, expiresInMs: 5_000, consumerProof: actionLockConsumerProof
  }).pass, true);
  assert.equal(assessEffect(EFFECT_CONTRACTS.anchor, {
    before: { actionsDisabled: 0 }, after: { actionsDisabled: 1 }, expired: { actionsDisabled: 0 }, applied: true, expiresInMs: 3_000, consumerProof: actionLockConsumerProof
  }).pass, true);
  for (const id of ['shackle', 'dryad_root']) {
    assert.equal(assessEffect(EFFECT_CONTRACTS[id], {
      before: { actionsDisabled: 0 }, after: { actionsDisabled: 1 }, expired: { actionsDisabled: 0 }, applied: true, expiresInMs: 4_000, consumerProof: actionLockConsumerProof
    }).pass, true);
  }
  assert.equal(assessEffect(EFFECT_CONTRACTS.dreaming_spirit, {
    before: { actionsDisabled: 0 }, after: { actionsDisabled: 1 }, expired: { actionsDisabled: 0 }, applied: true, expiresInMs: 5_000, consumerProof: actionLockConsumerProof
  }).pass, true);
  assert.equal(assessEffect(EFFECT_CONTRACTS.entangle, {
    before: { movementSpeedPercent: 0 }, after: { movementSpeedPercent: -0.7 }, expired: { movementSpeedPercent: 0 }, applied: true, expiresInMs: 2_999,
    consumerProof: { basicAttackIntervalBefore: 1_500, basicAttackIntervalAfter: 5_000, skillCooldownBefore: 1, skillCooldownAfter: 1, productionConsumer: 'main.attackMonster.enemyAttackInterval' }
  }).pass, true);
  const movementSlowProof = {
    basicAttackIntervalBefore: 1_500,
    basicAttackIntervalAfter: 1_875,
    skillCooldownBefore: 1,
    skillCooldownAfter: 1,
    productionConsumer: 'main.attackMonster.enemyAttackInterval'
  };
  for (const id of ['hamstring', 'shadow_step']) {
    const contract = EFFECT_CONTRACTS[id];
    assert.equal(assessEffect(contract, {
      before: { movementSpeedPercent: 0 },
      after: { movementSpeedPercent: -0.30 },
      expired: { movementSpeedPercent: 0 },
      applied: true,
      expiresInMs: contract.expectedDurationMs,
      consumerProof: movementSlowProof
    }).pass, true, id);
  }
  assert.equal(assessEffect(EFFECT_CONTRACTS.ice_bolt, {
    cast: true,
    skillId: 'ice_bolt',
    applied: true,
    expiresInMs: 30_000,
    before: { movementSpeedPercent: 0 },
    after: { movementSpeedPercent: -0.20 },
    expired: { movementSpeedPercent: 0 },
    events: [{ skillId: 'ice_bolt', damage: 11 }],
    hpBefore: 100,
    hpAfter: 89,
    consumerProof: movementSlowProof
  }).pass, true);
  assert.equal(assessEffect(EFFECT_CONTRACTS.entangle, {
    before: { attackSpeed: 1 }, after: { attackSpeed: 0.3 }, expired: { attackSpeed: 1 }, applied: true, expiresInMs: 2_850,
    consumerProof: { basicAttackSpeedBefore: 1, basicAttackSpeedAfter: 0.3, skillCooldownBefore: 1, skillCooldownAfter: 1, productionConsumer: 'main.monsterAttack' }
  }).pass, false);
  const silenceEvidence = {
    before: { magicSkillsSilenced: 0 }, after: { magicSkillsSilenced: 1 }, expired: { magicSkillsSilenced: 0 },
    applied: true, expiresInMs: 6_000,
    consumerProof: { controlDamage: 140, silencedDamage: 100, controlCooldown: 4_000, silencedCooldown: 0 }
  };
  assert.equal(assessEffect(EFFECT_CONTRACTS.silence, silenceEvidence).pass, true);
  assert.equal(assessEffect(EFFECT_CONTRACTS.silence, {
    ...silenceEvidence, consumerProof: { ...silenceEvidence.consumerProof, silencedCooldown: 4_000 }
  }).pass, false);
  assert.equal(assessEffect(EFFECT_CONTRACTS.curse_fear, {
    before: { atk: 100, matk: 120 }, after: { atk: 85, matk: 102 }, expired: { atk: 100, matk: 120 }, applied: true, expiresInMs: 5_000
  }).pass, true);
  const sleepEvidence = {
    before: { actionsDisabled: 0 }, after: { actionsDisabled: 1 }, expired: { actionsDisabled: 0 }, applied: true, expiresInMs: 2_000,
    consumerProof: actionLockConsumerProof
  };
  assert.equal(assessEffect(EFFECT_CONTRACTS.sleep, sleepEvidence).pass, true);
  assert.equal(assessEffect(EFFECT_CONTRACTS.sleep, {
    ...sleepEvidence, consumerProof: { ...sleepEvidence.consumerProof, basicDamageWhileDisabled: 100 }
  }).pass, false);
});

test('technical failures in content-blocked classes and special proofs fail globally', () => {
  const failed = { classId: 'gap', contentStatus: 'BLOCKED_CONTENT_GAP', checks: [{ pass: false }], skills: [] };
  assert.equal(summarizeAudit([failed], []).overallStatus, 'FAIL');
  assert.equal(summarizeAudit([], [{ pass: false }]).overallStatus, 'FAIL');
  assert.equal(summarizeAudit([{ ...failed, checks: [] }], []).overallStatus, 'APPROVAL_BLOCKED');
  assert.equal(summarizeAudit([{ classId: 'normal', checks: [], skills: [{ effect: { status: 'NOT_VALIDATED' } }] }], []).overallStatus, 'APPROVAL_BLOCKED');
});

test('blocked class assignment stays separate from a measured skill effect', () => {
  const report = summarizeAudit([{
    classId: 'marauder',
    contentStatus: 'BLOCKED_UNPROVEN_PROVENANCE',
    checks: [],
    skills: [{
      skillId: 'soul_smash',
      classAssignment: { status: 'BLOCKED_UNPROVEN_PROVENANCE', validated: false },
      effect: { status: 'PASS', pass: true }
    }]
  }], []);

  assert.equal(report.overallStatus, 'APPROVAL_BLOCKED', 'effect proof cannot certify the class roster');
  assert.equal(report.unvalidatedAssertions, 0, 'the executed effect must not remain mislabeled as unvalidated');
  assert.equal(report.blockedSkillAssignments, 1, 'the unverified relation remains visible in a separate count');
});
