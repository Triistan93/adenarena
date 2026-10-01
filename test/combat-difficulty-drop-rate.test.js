import { test } from 'node:test';
import assert from 'node:assert/strict';

import { calculateConfiguredDropChance } from '../lineage-idle/src/engine/CombatEngine.js';

test('hunting difficulty multiplies configured monster drops with level-gap and item drop rates', () => {
  assert.equal(calculateConfiguredDropChance(0.2, 0.5, 0.25, 1), 0.025);
  assert.equal(calculateConfiguredDropChance(0.2, 0.5, 0.25, 1.35), 0.03375);
  assert.equal(calculateConfiguredDropChance(0.2, 0.5, 0.25, 2.5), 0.0625);
});
