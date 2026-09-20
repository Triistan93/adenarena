import { test } from 'node:test';
import assert from 'node:assert/strict';
globalThis.window = globalThis;
await import('../lineage-idle/data/echo-adapter.js');
const { spendSP } = await import('../lineage-idle/src/engine/SkillEngine.js');
const { removeFromInventory } = await import('../lineage-idle/src/services/InventoryService.js');
const { getSkillUnlockLevelForClass } = await import('../lineage-idle/src/services/SkillEligibility.js');
const makeState = () => ({ class: 'warrior', race: 'human', level: 20, sp: 1000, hp: 100, mp: 100, skills: {}, equipment: {}, inventory: [{ uid: 'book', itemId: 'book_2star', count: 1 }] });

test('learning consumes required book even without a UI callback', () => {
  const state = makeState();
  assert.equal(spendSP(state, 'war_cry'), true);
  assert.equal(state.inventory.length, 0);
});

test('failed prerequisite does not consume book or SP', () => {
  const state = makeState();
  const reqs = window.EchoData.SKILL_REQS_ECHO;
  const previous = reqs.war_cry;
  reqs.war_cry = { ...previous, power_strike: 1 };
  try {
    const initial = JSON.stringify(state);
    assert.equal(spendSP(state, 'war_cry', { removeFromInventory: (uid, count) => removeFromInventory(state, uid, count) }), false);
    assert.equal(JSON.stringify(state), initial);
  } finally { reqs.war_cry = previous; }
});

test('a zero-count spellbook cannot unlock a skill', () => {
  const state = makeState(); state.inventory[0].count = 0;
  assert.equal(spendSP(state, 'war_cry'), false);
  assert.equal(state.sp, 1000);
});

test('explicit DK starter remains level one throughout all three race lineages', () => {
  for (const race of ['human', 'elf', 'delf']) for (let stage = 0; stage <= 3; stage++) {
    assert.equal(getSkillUnlockLevelForClass(`${race}_deathknight_${stage}`, 'hellfire'), 1, `${race} stage ${stage}`);
  }
  assert.equal(getSkillUnlockLevelForClass('sagittarius', 'legendary_archer'), 80);
});

test('Self Heal is dispatched as healing, never an attack buff', () => {
  const def = window.EchoData.SKILL_DEFS_ECHO.self_heal;
  assert.equal(def.effect, 'heal');
  assert.notEqual(def.type, 'buff');
});
