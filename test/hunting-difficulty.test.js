import { test } from 'node:test';
import assert from 'node:assert/strict';

import { HUNTING_DIFFICULTIES, MonsterAIEngine } from '../lineage-idle/src/engine/MonsterAIEngine.js';

test('difficulty locks, state selection, and spawned-monster rewards follow the configured tiers', () => {
  for (const difficulty of Object.values(HUNTING_DIFFICULTIES)) {
    const lockedState = { level: Math.max(1, difficulty.minLvl - 1) };
    const allowedState = { level: difficulty.minLvl };

    if (difficulty.minLvl > 1) {
      const locked = MonsterAIEngine.setDifficulty(lockedState, difficulty.id);
      assert.equal(locked.success, false, `${difficulty.id} should stay locked below level ${difficulty.minLvl}`);
      assert.equal(lockedState.huntingDifficulty, undefined);
    }

    const allowed = MonsterAIEngine.setDifficulty(allowedState, difficulty.id);
    assert.equal(allowed.success, true, `${difficulty.id} should unlock at level ${difficulty.minLvl}`);
    assert.equal(MonsterAIEngine.getDifficulty(allowedState).id, difficulty.id);

    const monster = { hp: 100, atk: 100, def: 100, matk: 100, mdef: 100, xp: 100, gold: [10, 20] };
    MonsterAIEngine.applyDifficultyToMonster(monster, allowed.difficulty);
    assert.equal(monster.hp, Math.floor(100 * difficulty.hpMult));
    assert.equal(monster.atk, Math.floor(100 * difficulty.atkMult));
    assert.equal(monster.def, Math.floor(100 * difficulty.defMult));
    assert.equal(monster.xp, Math.floor(100 * difficulty.xpMult));
    assert.deepEqual(monster.gold, [Math.floor(10 * difficulty.goldMult), Math.floor(20 * difficulty.goldMult)]);
    assert.equal(monster.difficulty, difficulty.id);
  }
});
