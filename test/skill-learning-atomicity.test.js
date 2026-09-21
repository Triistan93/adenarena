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

// [AUDIT 3.0] Obsolete Expectation Update:
// OLD_EXPECTATION: getSkillUnlockLevelForClass(`${race}_deathknight_${stage}`, 'hellfire') === 1
// CANONICAL_EVIDENCE: skills_detailed.json proves Human Hellfire (45312), Elf Hellfire (47511),
//   and Dark Elf Hellfire (47513) are all minLevel 76 (Stage 3). Stage 0 starter is Change Armor (45355).
// NEW_EXPECTATION: Change Armor unlocks at Lv 1 for Stage 0; Hellfire is strictly Stage 3 Lv 76+.
test('canonical DK starter is Change Armor (Lv 1) and Hellfire is Stage 3 (Lv 76)', () => {
  for (const race of ['human', 'elf', 'delf']) {
    // Stage 0 canonical starter is change_armor at Lv 1
    assert.equal(getSkillUnlockLevelForClass(`${race}_deathknight_0`, 'change_armor'), 1, `${race} stage 0 starter`);
    // Stage 3 unlocks hellfire at Lv 76+
    assert.equal(getSkillUnlockLevelForClass(`${race}_deathknight_3`, 'hellfire'), 76, `${race} stage 3 hellfire`);
  }
  assert.equal(getSkillUnlockLevelForClass('sagittarius', 'legendary_archer'), 76);
});

test('Self Heal is dispatched as healing, never an attack buff', () => {
  const def = window.EchoData.SKILL_DEFS_ECHO.self_heal;
  assert.equal(def.effect, 'heal');
  assert.notEqual(def.type, 'buff');
});
