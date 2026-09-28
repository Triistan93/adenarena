import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.window ||= {};
await import('../lineage-idle/data/echo-adapter.js');

import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';
import { getStats } from '../lineage-idle/src/engine/StatsEngine.js';
import { isSkillInProgressionPath, normalizeAndValidateSkills } from '../lineage-idle/src/services/SkillEligibility.js';
import { CANONICAL_CLASS_REGISTRY_V2 } from '../lineage-idle/src/data/classes/CanonicalClassRegistryV2.js';
import { CANONICAL_SKILL_REGISTRY_V2 } from '../lineage-idle/src/data/skills/CanonicalSkillRegistryV2.js';

test('Warg uses the source-confirmed Growing Potential skill, not the missing 88453 entry', () => {
  const warg = CANONICAL_CLASS_REGISTRY_V2.warg;
  const growing = CANONICAL_SKILL_REGISTRY_V2.growing_potential;
  assert.ok(warg.skillIds.includes('growing_potential'));
  assert.ok(!warg.skillIds.includes('unleashed_potential'));
  assert.equal(growing.wikiSkillId, 88454);
  assert.ok(growing.classes.includes('warg'));
  assert.equal(isSkillInProgressionPath('warg', 'growing_potential'), true);
  assert.equal(isSkillInProgressionPath('warg', 'unleashed_potential'), false);
  assert.equal(isSkillInProgressionPath('werewolf_2', 'unleashed_potential'), false);
});

test('Growing Potential changes effective attack and both defenses through StatsEngine', () => {
  const state = Object.assign(DEFAULT_STATE(), {
    class: 'warg',
    race: 'human',
    level: 76,
    skills: {}
  });
  const before = getStats(state);
  state.skills.growing_potential = 1;
  const after = getStats(state);

  assert.ok(after.atk > before.atk, `expected attack to rise (${before.atk} -> ${after.atk})`);
  assert.ok(after.def > before.def, `expected defense to rise (${before.def} -> ${after.def})`);
  assert.ok(after.mdef > before.mdef, `expected magic defense to rise (${before.mdef} -> ${after.mdef})`);
});

test('an old Warg Unleashed Potential save is corrected with the invested SP refunded', () => {
  const state = Object.assign(DEFAULT_STATE(), {
    class: 'warg',
    race: 'human',
    level: 76,
    sp: 10,
    skills: { unleashed_potential: 1, direct_strike: 1 }
  });
  const normalized = normalizeAndValidateSkills(state);

  assert.equal(state.skills.unleashed_potential, undefined);
  assert.equal(state.skills.direct_strike, 1);
  assert.equal(normalized.refundedSp, 30);
  assert.equal(state.sp, 10 + normalized.refundedSp);
});
