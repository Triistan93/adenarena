import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  applyElementalInfusion,
  removeElementalInfusion,
  applySoulCrystalToWeapon,
  removeSoulCrystalFromWeapon,
  calculateArmorElementalMitigation,
  calculatePlayerElementalDamage,
  getItemElementalAttribute,
  ELEMENT_DEFINITIONS
} from '../lineage-idle/src/services/ElementalService.js';
import { applyElementalStone } from '../lineage-idle/src/services/CraftService.js';
import { MONSTERS } from '../lineage-idle/src/data/monsters.js';
import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';
import { pickRandomMonster } from '../lineage-idle/src/engine/CombatEngine.js';

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
  it('elemental and SA payments reject malformed Adena without consuming items or clearing effects', () => {
    const infusion = createEquippedState('weapon', 'test_s_weapon');
    infusion.gold = 'invalid-wallet';
    assert.equal(applyElementalInfusion(infusion, 'test-weapon', 'fire'), false);
    assert.equal(infusion.inventory[0].elementalAttribute, undefined);

    const purification = createEquippedState('weapon', 'test_s_weapon');
    purification.gold = 'invalid-wallet';
    purification.inventory[0].elementalAttribute = { element: 'fire', val: 100 };
    assert.equal(removeElementalInfusion(purification, 'test-weapon'), false);
    assert.deepEqual(purification.inventory[0].elementalAttribute, { element: 'fire', val: 100 });

    const sa = createEquippedState('weapon', 'test_s_weapon');
    sa.gold = 'invalid-wallet';
    sa.inventory.push({ uid: 'crystal', itemId: 'soul_crystal_red_stage1', count: 1 });
    assert.equal(applySoulCrystalToWeapon(sa, 'test-weapon', 'red', 'focus'), false);
    assert.equal(sa.inventory[0].soulCrystal, undefined);
    assert.equal(sa.inventory[1].count, 1);

    sa.inventory[0].soulCrystal = { name: 'Focus' };
    assert.equal(removeSoulCrystalFromWeapon(sa, 'test-weapon'), false);
    assert.deepEqual(sa.inventory[0].soulCrystal, { name: 'Focus' });
  });

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

  it('applies the documented holy bonus to demons and undead before generic opposition', () => {
    const state = createEquippedState('weapon', 'test_s_weapon');
    state.inventory[0].elementalAttribute = { element: 'holy', val: 300 };

    const demon = calculatePlayerElementalDamage(state, { category: 'demon' }, 1_000);
    const undead = calculatePlayerElementalDamage(state, { category: 'undead' }, 1_000);
    const catalogDemon = calculatePlayerElementalDamage(state, MONSTERS.flamingDemonLord, 1_000);
    const catalogHellHound = calculatePlayerElementalDamage(state, MONSTERS.infernalHound, 1_000);
    const catalogUndead = calculatePlayerElementalDamage(state, MONSTERS.lichLord, 1_000);

    assert.equal(demon.finalDamage, 1_700);
    assert.equal(undead.finalDamage, 1_700);
    assert.equal(catalogDemon.finalDamage, 1_700);
    assert.equal(catalogHellHound.finalDamage, 1_700);
    assert.equal(catalogUndead.finalDamage, 1_700);
    assert.equal(demon.multiplier, 1.7);
    assert.equal(undead.multiplier, 1.7);
  });

  it('applies holy damage to every bestiary entry explicitly marked demon or undead', () => {
    const markedCreatures = Object.entries(MONSTERS).filter(([, monster]) => monster.isDemon || monster.isUndead);
    assert.ok(markedCreatures.length >= 10, 'the bestiary should retain the reviewed semantic flags');

    for (const [id, monster] of markedCreatures) {
      const state = createEquippedState('weapon', 'test_s_weapon');
      state.inventory[0].elementalAttribute = { element: 'holy', val: 300 };
      const result = calculatePlayerElementalDamage(state, monster, 1_000);
      assert.equal(result.finalDamage, 1_700, `${id} receives the documented holy bonus`);
    }
  });

  it('preserves demon classification from real zone spawn through final holy damage', () => {
    const state = DEFAULT_STATE();
    state.level = 80;
    state.zone = 'underworldGate';
    state.isCombatActive = true;
    const originalRandom = Math.random;
    try {
      Math.random = () => 0.999;
      pickRandomMonster(state);
    } finally {
      Math.random = originalRandom;
    }

    assert.equal(state.activeMonster.id, 'flameOverlordDemon');
    assert.equal(state.activeMonster.isDemon, true);
    const combatState = createEquippedState('weapon', 'test_s_weapon');
    combatState.inventory[0].elementalAttribute = { element: 'holy', val: 300 };
    assert.equal(calculatePlayerElementalDamage(combatState, state.activeMonster, 1_000).finalDamage, 1_700);
  });

  it('applies cataloged monster resistance to matching elemental damage', () => {
    const state = createEquippedState('weapon', 'test_s_weapon');
    state.inventory[0].elementalAttribute = { element: 'fire', val: 300 };

    const result = calculatePlayerElementalDamage(state, MONSTERS.crimsonBabyDragon, 1_000);

    assert.equal(result.finalDamage, 900, '1.2 same-element multiplier is reduced by the cataloged 0.75 fire resistance');
    assert.equal(result.resistanceMultiplier, 0.75);
  });

  it('covers same-element and opposed-element outcomes for every canonical element', () => {
    for (const [element, definition] of Object.entries(ELEMENT_DEFINITIONS)) {
      const state = createEquippedState('weapon', 'test_s_weapon');
      state.inventory[0].elementalAttribute = { element, val: 300 };

      const sameElement = calculatePlayerElementalDamage(state, { element }, 1_000);
      assert.equal(sameElement.finalDamage, 1_200, `${element} against same element keeps the 20% resistance rule`);

      const opposedElement = calculatePlayerElementalDamage(state, { element: definition.opposed }, 1_000);
      const expected = element === 'holy' ? 1_700 : 1_600;
      assert.equal(opposedElement.finalDamage, expected, `${element} receives its declared opposition/category bonus`);
    }
  });

  it('applies absorbed Codex elemental damage to the production attack calculation', () => {
    const state = createEquippedState('weapon', 'test_s_weapon');
    state.codex = { card_valakas: { count: 1, rank: 1 } };

    const result = calculatePlayerElementalDamage(state, { element: 'water' }, 1_000);

    assert.equal(result.element, 'fire');
    assert.equal(result.finalDamage, 1_036, 'Valakas fire damage is added and receives the opposed-element bonus');
  });

  it('applies elemental damage and resistance from cards socketed on equipped gear', () => {
    const weaponState = createEquippedState('weapon', 'test_s_weapon');
    weaponState.inventory[0].slottedCards = ['card_valakas'];
    const weaponResult = calculatePlayerElementalDamage(weaponState, { element: 'wind' }, 1_000);
    assert.equal(weaponResult.element, 'fire');
    assert.equal(weaponResult.finalDamage, 1_050);

    const armorState = createEquippedState('helmet', 'test_s_helmet');
    armorState.inventory[0].slottedCards = ['card_antharas'];
    const armorDamage = calculateArmorElementalMitigation(armorState, { element: 'earth' }, 1_000);
    assert.equal(armorDamage, 933);
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

  it('includes the legacy head equipment slot in specific elemental mitigation', () => {
    const state = createEquippedState('head', 'test_s_helmet');
    state.inventory[0].elementalAttribute = { element: 'fire', val: 120 };

    assert.equal(calculateArmorElementalMitigation(state, { element: 'fire' }, 1_000), 800);
  });

  it('treats isUndead as dark when resolving defensive elemental mitigation', () => {
    const state = createEquippedState('helmet', 'test_s_helmet');
    state.inventory[0].elementalAttribute = { element: 'dark', val: 120 };

    assert.equal(calculateArmorElementalMitigation(state, { isUndead: true }, 1_000), 800);
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
