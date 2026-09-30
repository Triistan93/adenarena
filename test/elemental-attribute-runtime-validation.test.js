import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  applyElementalInfusion,
  removeElementalInfusion,
  calculateArmorElementalMitigation,
  calculatePlayerElementalDamage,
  getItemElementalAttribute
} from '../lineage-idle/src/services/ElementalService.js';
import { applyElementalStone } from '../lineage-idle/src/services/CraftService.js';

function createEquippedState(slot, itemId) {
  const uid = `test-${slot}`;
  return {
    level: 80,
    gold: 1_000_000,
    inventory: [{ uid, itemId, slot, grade: 's', name: itemId }],
    equipment: { [slot]: uid }
  };
}

describe('Elemental attributes through production services', () => {
  it('rejects an unknown element without spending Adena or mutating the item', () => {
    const state = createEquippedState('weapon', 'test_s_weapon');
    const beforeGold = state.gold;

    const applied = applyElementalInfusion(state, 'test-weapon', 'lightning');

    assert.equal(applied, false);
    assert.equal(state.gold, beforeGold);
    assert.equal(state.inventory[0].elementalAttribute, undefined);
  });

  it('routes a valid weapon infusion into the final elemental attack calculation', () => {
    const state = createEquippedState('weapon', 'test_s_weapon');
    const rawDamage = 1_000;

    assert.equal(applyElementalInfusion(state, 'test-weapon', 'fire'), true);
    const result = calculatePlayerElementalDamage(state, { element: 'water' }, rawDamage);

    assert.equal(state.inventory[0].elementalAttribute.element, 'fire');
    assert.equal(state.inventory[0].elementalAttribute.val, 20);
    assert.ok(result.finalDamage > rawDamage, 'opposed fire attribute increases the final attack damage');
  });

  it('continues applying legacy save attributes without rewriting them', () => {
    const weaponState = createEquippedState('weapon', 'test_s_weapon');
    weaponState.inventory[0].elemental = { type: 'fire', val: 300 };
    const weaponResult = calculatePlayerElementalDamage(weaponState, { element: 'water' }, 1_000);
    assert.ok(weaponResult.finalDamage > 1_000, 'legacy weapon elemental attribute reaches final attack damage');
    assert.deepEqual(weaponState.inventory[0].elemental, { type: 'fire', val: 300 });

    const armorState = createEquippedState('armor', 'test_s_armor');
    armorState.inventory[0].elemental = { type: 'fire', val: 120 };
    const armorDamage = calculateArmorElementalMitigation(armorState, { element: 'fire' }, 1_000);
    assert.ok(armorDamage < 1_000, 'legacy armor elemental attribute reaches final mitigation');
    assert.equal(getItemElementalAttribute(armorState.inventory[0]).element, 'fire');
    assert.deepEqual(armorState.inventory[0].elemental, { type: 'fire', val: 120 });
  });

  it('lets the player remove a legacy elemental infusion with the normal service cost', () => {
    const state = createEquippedState('weapon', 'test_s_weapon');
    state.gold = 25_000;
    state.inventory[0].elemental = { type: 'fire', val: 120 };
    let saveCalls = 0;

    assert.equal(removeElementalInfusion(state, 'test-weapon', { save: () => saveCalls++ }), true);
    assert.equal(state.gold, 0);
    assert.equal(state.inventory[0].elementalAttribute.val, 0);
    assert.equal('elemental' in state.inventory[0], false);
    assert.equal(saveCalls, 1);
  });

  it('ignores invalid elemental values already present in an item', () => {
    const state = createEquippedState('weapon', 'test_s_weapon');
    state.inventory[0].elementalAttribute = { element: 'lightning', val: 300 };
    const result = calculatePlayerElementalDamage(state, { element: 'water' }, 1_000);

    assert.equal(result.finalDamage, 1_000);
    assert.equal(result.element, 'none');
  });

  it('routes a valid armor infusion into final mitigation against that element', () => {
    const state = createEquippedState('armor', 'test_s_armor');
    const incomingDamage = 1_000;

    assert.equal(applyElementalInfusion(state, 'test-armor', 'fire'), true);
    const finalDamage = calculateArmorElementalMitigation(state, { element: 'fire' }, incomingDamage);

    assert.equal(state.inventory[0].elementalAttribute.val, 6);
    assert.ok(finalDamage < incomingDamage, 'matching armor attribute reduces final elemental damage');
  });

  it('keeps the craft-service entry point on the same guarded production contract', () => {
    const state = createEquippedState('weapon', 'test_s_weapon');
    const beforeGold = state.gold;

    assert.equal(applyElementalStone(state, 'test-weapon', 'water'), true);
    assert.equal(state.gold, beforeGold - 250_000);
    assert.equal(state.inventory[0].elementalAttribute.element, 'water');
    assert.equal(applyElementalStone(state, 'test-weapon', 'plasma'), false);
    assert.equal(state.gold, beforeGold - 250_000, 'invalid elements do not charge again');
  });
});
