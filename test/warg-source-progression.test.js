import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.window ||= {};
await import('../lineage-idle/data/echo-adapter.js');

import { CANONICAL_CLASS_REGISTRY_V2 } from '../lineage-idle/src/data/classes/CanonicalClassRegistryV2.js';
import { resolveV2ClassContext } from '../lineage-idle/src/services/SkillEligibility.js';
import { CANONICAL_SKILL_REGISTRY_V2 } from '../lineage-idle/src/data/skills/CanonicalSkillRegistryV2.js';
import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';
import { getStats } from '../lineage-idle/src/engine/StatsEngine.js';
import { resolvePlayerBasicAttackIntervalMs, resolveSkillBuffDurationMs, resolveSkillBuffStats } from '../lineage-idle/src/services/SkillEffectService.js';
import { getSkillTreeViewModel } from '../lineage-idle/src/services/SkillTreeViewModel.js';

test('Warg stages follow the L2Wiki Essence class pages without importing unrelated buffs', () => {
  const base = resolveV2ClassContext('werewolf_0', 'human');
  const first = resolveV2ClassContext('werewolf_1', 'human');
  const second = resolveV2ClassContext('werewolf_2', 'human');

  assert.equal(base.status, 'RESOLVED');
  assert.equal(base.v2ClassId, 'wargS0');
  assert.deepEqual(base.authorizedSkillIds, ['direct_strike']);
  const baseTree = getSkillTreeViewModel({ class: 'werewolf_0', race: 'human', level: 1, skills: {}, sp: 100 });
  assert.deepEqual(baseTree.tabs.passive.skills.map(skill => skill.skillId), [], 'stage 0 must not show masteries assigned to later Warg classes');

  assert.equal(first.status, 'RESOLVED');
  assert.equal(first.v2ClassId, 'wargS1');
  assert.ok(first.authorizedSkillIds.includes('armor_mastery'));
  assert.ok(first.authorizedSkillIds.includes('weapon_mastery'));
  const firstTree = getSkillTreeViewModel({ class: 'werewolf_1', race: 'human', level: 20, skills: {}, sp: 100 });
  assert.deepEqual(firstTree.tabs.passive.skills.map(skill => skill.skillId).sort(), ['armor_mastery', 'hp_recovery', 'mp_recovery', 'weapon_mastery']);
  for (const id of ['direct_strike', 'quick_dash', 'wind_walk', 'acumen', 'haste', 'hp_recovery', 'mp_recovery', 'wild_magic', 'magic_barrier', 'berserker_spirit']) {
    assert.ok(first.authorizedSkillIds.includes(id), `${id} is listed on the Warg stage-1 source page`);
  }
  assert.equal(first.authorizedSkillIds.includes('death_whisper'), false);
  assert.equal(first.authorizedSkillIds.includes('clarity'), false);

  assert.equal(second.status, 'RESOLVED');
  assert.equal(second.v2ClassId, 'wargS2');
  for (const id of ['upward_strike', 'howling', 'young_moon_s_grace', 'moon_s_grace', 'full_moon_s_grace']) {
    assert.ok(second.authorizedSkillIds.includes(id), `${id} is listed on the Warg stage-2 source page`);
  }
  assert.equal(CANONICAL_CLASS_REGISTRY_V2.warg.parentClass, 'wargS2');
  assert.equal(first.authorizedSkillIds.includes('moon_s_grace'), false, 'stage 1 does not authorize a skill introduced in stage 2');
  assert.equal(second.authorizedSkillIds.includes('moon_s_grace'), true, 'stage 2 authorizes Moon\'s Grace');
});

test('Warg sourced speed and moon buffs affect cooldowns and basic-attack timing in production stats', () => {
  const haste = CANONICAL_SKILL_REGISTRY_V2.haste;
  const windWalk = CANONICAL_SKILL_REGISTRY_V2.wind_walk;
  assert.equal(resolveSkillBuffStats(haste).cdr, 0.15);
  assert.equal(resolveSkillBuffStats(windWalk).movementSpeedPercent, 0.05);

  const base = { ...DEFAULT_STATE(), class: 'warg', level: 76, buffs: {} };
  const baseStats = getStats(base);
  const hasteStats = getStats({ ...base, buffs: { haste: { skillBuffStats: resolveSkillBuffStats(haste), until: Date.now() + 20_000 } } });
  const windWalkStats = getStats({ ...base, buffs: { wind_walk: { skillBuffStats: resolveSkillBuffStats(windWalk), until: Date.now() + 20_000 } } });
  assert.ok(hasteStats.cdr > baseStats.cdr, 'Haste reduces skill reuse in production stats');
  assert.ok(resolvePlayerBasicAttackIntervalMs(windWalkStats) < resolvePlayerBasicAttackIntervalMs(baseStats), 'Wind Walk also shortens the basic-attack interval');

  const youngMoon = CANONICAL_SKILL_REGISTRY_V2.young_moon_s_grace;
  const moon = CANONICAL_SKILL_REGISTRY_V2.moon_s_grace;
  const fullMoon = CANONICAL_SKILL_REGISTRY_V2.full_moon_s_grace;
  const moonEffects = [youngMoon, moon, fullMoon].map(skill => resolveSkillBuffStats(skill));
  const moonStats = [youngMoon, moon, fullMoon].map((skill, index) => getStats({
    ...base,
    buffs: { [skill.id]: { skillBuffStats: moonEffects[index], until: Date.now() + 1_200_000 } }
  }));
  assert.ok(moonStats[0].cdr > baseStats.cdr, 'Young Moon attack speed reduces skill reuse');
  assert.ok(moonStats[1].cdr > moonStats[0].cdr, 'Moon Grace has a stronger cooldown effect');
  assert.ok(moonStats[2].cdr > moonStats[1].cdr, 'Full Moon Grace has the strongest cooldown effect');
  assert.equal(resolveSkillBuffDurationMs(youngMoon), 1_200_000);
  assert.equal(resolveSkillBuffDurationMs(moon), 1_200_000);
  assert.equal(resolveSkillBuffDurationMs(fullMoon), 1_200_000);
  assert.ok(resolvePlayerBasicAttackIntervalMs(moonStats[0]) < resolvePlayerBasicAttackIntervalMs(baseStats));
});
