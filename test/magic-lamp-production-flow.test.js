import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';
import { MAGIC_LAMP_EXP_THRESHOLD } from '../lineage-idle/src/data/economy/magicLampBalance.js';
import { consumeMagicLamp, grantMagicLampProgressFromKill } from '../lineage-idle/src/services/MagicLampService.js';

describe('Lâmpada Mágica — production economy flow with disposable state', () => {
  it('the production button handler consumes one lamp, applies the result, updates and saves', () => {
    const source = readFileSync(new URL('../lineage-idle/main.js', import.meta.url), 'utf8');
    const start = source.indexOf('function useMagicLamp(');
    const end = source.indexOf('function updateCraftGaugeUI(', start);
    assert.ok(start >= 0 && end > start, 'production useMagicLamp handler must exist');
    const handlerSource = source.slice(start, end);
    const state = DEFAULT_STATE();
    state.level = 40;
    state.magicLamps = 1;
    state.xp = 10;
    state.sp = 20;
    const calls = { levelUp: 0, update: 0, save: 0 };
    const createHandler = new Function(
      'state', 'consumeMagicLamp', 'checkLevelUp', 'el', 'log', 'floatText', 'updateAllUI', 'save',
      `${handlerSource}; return useMagicLamp;`
    );
    const handler = createHandler(
      state, consumeMagicLamp,
      () => { calls.levelUp += 1; },
      () => null,
      () => {},
      () => {},
      () => { calls.update += 1; },
      () => { calls.save += 1; }
    );
    const originalRandom = Math.random;
    try {
      Math.random = () => 0.999;
      handler();
    } finally {
      Math.random = originalRandom;
    }

    assert.equal(state.magicLamps, 0);
    assert.ok(state.xp > 10);
    assert.ok(state.sp > 20);
    assert.deepEqual(calls, { levelUp: 1, update: 1, save: 1 });
  });

  it('converts all threshold crossings from one high-XP kill into lamps and retains the remainder', () => {
    const state = DEFAULT_STATE();
    state.magicLamps = 2;
    state.magicLampExp = 0;
    const events = [];

    const result = grantMagicLampProgressFromKill(state, 400_000, {
      log: message => events.push(message),
      floatText: message => events.push(message)
    });

    assert.equal(result.progressAdded, 160_000);
    assert.equal(result.lampsEarned, 3);
    assert.equal(state.magicLamps, 5);
    assert.equal(state.magicLampExp, 10_000);
    assert.equal(events.length, 2);
  });

  it('consumes exactly one lamp and credits the rolled EXP/SP; empty inventory cannot roll', () => {
    const state = DEFAULT_STATE();
    state.level = 40;
    state.magicLamps = 1;
    state.xp = 10;
    state.sp = 20;
    const deterministicCard = { cardType: 'purple', expWon: 75_000, spWon: 7_500, cardName: 'Disposable purple card', bracket: '40-51' };

    const used = consumeMagicLamp(state, () => deterministicCard);
    assert.deepEqual(used, { success: true, result: deterministicCard });
    assert.equal(state.magicLamps, 0);
    assert.equal(state.xp, 75_010);
    assert.equal(state.sp, 7_520);
    assert.equal(consumeMagicLamp(state, () => deterministicCard).reason, 'no_lamps');
    assert.equal(state.xp, 75_010);
    assert.equal(state.sp, 7_520);
  });
});
