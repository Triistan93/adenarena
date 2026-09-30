import test from 'node:test';
import assert from 'node:assert/strict';
import { applyStarterKit } from '../lineage-idle/src/core/StateManager.js';
import { getStats, getEquippedWeaponInfo } from '../lineage-idle/src/engine/StatsEngine.js';

function makeCharacter(weaponType, learnsMastery) {
  const state = {};
  applyStarterKit(state, 'dwarf', 'shineMakerBase', 'Mastery audit', 'F');
  const weapon = { uid: 'audit-weapon', itemId: `audit_${weaponType}`, name: 'Audit Weapon', type: weaponType, weaponType, slot: 'weapon', atk: 10, matk: 0, count: 1 };
  state.inventory.push(weapon);
  state.equipment.weapon = weapon.uid;
  state.skills = learnsMastery ? { shineMakerBase_crystal_weapon_mastery: 1 } : {};
  return state;
}

test('Crystal Weapon Mastery increases production attack only while a blunt weapon is equipped', () => {
  const bluntWithout = makeCharacter('blunt', false);
  const bluntWith = makeCharacter('blunt', true);
  const swordWithout = makeCharacter('sword', false);
  const swordWith = makeCharacter('sword', true);

  assert.equal(getEquippedWeaponInfo(bluntWith).category, 'blunt');
  assert.ok(getStats(bluntWith).atk > getStats(bluntWithout).atk, 'the declared +15% blunt mastery should reach production stats');
  assert.equal(getStats(swordWith).atk, getStats(swordWithout).atk, 'the mastery must not leak to an incompatible sword');
});
