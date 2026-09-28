import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.window = globalThis.window || {};
await import('../lineage-idle/data/echo-adapter.js');

const { DEFAULT_STATE } = await import('../lineage-idle/src/core/StateManager.js');
const { getVisibleSkillsForCharacter } = await import('../lineage-idle/src/services/SkillEligibility.js');
const { spendSP } = await import('../lineage-idle/src/engine/SkillEngine.js');
const { removeFromInventory } = await import('../lineage-idle/src/services/InventoryService.js');
const { CANONICAL_CLASS_REGISTRY_V2 } = await import('../lineage-idle/src/data/classes/CanonicalClassRegistryV2.js');

test('Armor Care is assigned to both Templar trees and rank 2 is level-gated at 84', () => {
  const callbacksFor = state => ({
    removeFromInventory: (uid, count) => removeFromInventory(state, uid, count)
  });

  assert.ok(CANONICAL_CLASS_REGISTRY_V2.evaTemplar.skillIds.includes('armor_care'));
  assert.ok(CANONICAL_CLASS_REGISTRY_V2.shillienTemplar.skillIds.includes('armor_care'));

  for (const [classId, race, rank1SpCost] of [['evaTemplar', 'elf', 5_800], ['shillienTemplar', 'dark_elf', 4_900]]) {
    const state = DEFAULT_STATE();
    state.class = classId;
    state.race = race;
    state.level = 76;
    state.sp = 500_000;
    state.inventory = [{ uid: `armor-care-book-${classId}`, itemId: 'book_3star', count: 3 }];

    const visible = getVisibleSkillsForCharacter(state).visibleList.map(skill => skill.skillId);
    assert.ok(visible.includes('armor_care'), `${classId} should see Armor Care in its skill tree`);
    const rank1SpBefore = state.sp;
    assert.equal(spendSP(state, 'armor_care', callbacksFor(state)), true, `${classId} learns rank 1 at level 76`);
    assert.equal(rank1SpBefore - state.sp, rank1SpCost, `${classId} pays its source-confirmed rank 1 SP cost`);
    assert.equal(state.skills.armor_care, 1);
    state.level = 83;
    const spBeforeLockedRank = state.sp;
    assert.equal(spendSP(state, 'armor_care', callbacksFor(state)), false, `${classId} cannot learn rank 2 before level 84`);
    assert.equal(state.skills.armor_care, 1);
    assert.equal(state.sp, spBeforeLockedRank, 'a rejected rank must not consume SP');

    state.level = 84;
    const rank2SpBefore = state.sp;
    assert.equal(spendSP(state, 'armor_care', callbacksFor(state)), true, `${classId} learns rank 2 at level 84`);
    assert.equal(rank2SpBefore - state.sp, 240_000, `${classId} pays the source-confirmed rank 2 SP cost`);
    assert.equal(state.skills.armor_care, 2);
    assert.equal(spendSP(state, 'armor_care', callbacksFor(state)), false, `${classId} cannot exceed rank 2`);
  }
});
