import { it } from 'node:test';
import assert from 'node:assert/strict';
import { LifeActivityCore, LIFE_ACTIVITY_LEVEL_TABLE } from '../lineage-idle/src/services/lifeActivities/LifeActivityCore.js';

it('requires increasing mastery XP at every level', () => {
  for (let level = 2; level <= 40; level++) {
    assert.ok(LIFE_ACTIVITY_LEVEL_TABLE[level] > LIFE_ACTIVITY_LEVEL_TABLE[level - 1], `level ${level}`);
  }
});

it('advances from mastery 23 to 24 without skipping to 25', () => {
  const state = { lifeActivities: { fishing: { level: 23, xp: 111599 } } };
  assert.deepEqual(LifeActivityCore.addXp(state, 'fishing', 1), { levelUp: true, level: 24 });
  LifeActivityCore.addXp(state, 'fishing', 19399);
  assert.equal(state.lifeActivities.fishing.level, 24);
  LifeActivityCore.addXp(state, 'fishing', 1);
  assert.equal(state.lifeActivities.fishing.level, 25);
});

it('preserves earned levels in legacy saves and requires the next threshold', () => {
  const state = { lifeActivities: { fishing: { level: 25, xp: 111600 } } };
  LifeActivityCore.addXp(state, 'fishing', 1);
  assert.deepEqual(state.lifeActivities.fishing, { level: 25, xp: 111601 });
  LifeActivityCore.addXp(state, 'fishing', 41399);
  assert.equal(state.lifeActivities.fishing.level, 26);
});
