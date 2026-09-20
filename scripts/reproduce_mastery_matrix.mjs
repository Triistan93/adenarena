/**
 * scripts/reproduce_mastery_matrix.mjs
 * Teste exaustivo da matriz de Armor Mastery e Weapon Mastery no motor StatsEngine.js.
 */

import { getStats } from '../lineage-idle/src/engine/StatsEngine.js';

console.log('================================================================');
console.log('MATRIZ DE REPRODUÇÃO: BUG FUNCIONAL 01 — ARMOR MASTERY');
console.log('================================================================');

function evalArmorMastery(skillId, armorItem) {
  const state = {
    class: 'knight',
    race: 'human',
    level: 40,
    skills: skillId ? { [skillId]: 1 } : {},
    equipment: armorItem ? { armor: 'test_armor', chest: 'test_armor' } : {},
    inventory: armorItem ? [{ uid: 'test_armor', itemId: armorItem.id, ...armorItem }] : []
  };
  return getStats(state).def;
}

const noArmorBase = evalArmorMastery(null, null);
const heavyItem = { id: 'full_plate_heavy_armor', name: 'Full Plate Heavy Armor', def: 74, armorType: 'heavy' };
const lightItem = { id: 'theca_light_armor', name: 'Theca Light Armor', def: 50, armorType: 'light' };
const robeItem  = { id: 'karmian_robe_armor', name: 'Karmian Robe Armor', def: 30, armorType: 'robe' };

const heavyItemBaseDef = evalArmorMastery(null, heavyItem) - 74; // should equal noArmorBase
const lightItemBaseDef = evalArmorMastery(null, lightItem) - 50;
const robeItemBaseDef  = evalArmorMastery(null, robeItem) - 30;

console.log(`Base Character DEF (sem skill, sem armor): ${noArmorBase}`);

const masteriesToTest = [
  { id: 'heavy_armor_mastery', name: 'Heavy Armor Mastery', expectedBonus: 12, validArmor: 'heavy' },
  { id: 'light_armor_mastery', name: 'Light Armor Mastery', expectedBonus: 6,  validArmor: 'light' },
  { id: 'armor_mastery',       name: 'Armor Mastery',       expectedBonus: 8,  validArmor: 'any' }
];

const armorMatrixResults = [];

for (const m of masteriesToTest) {
  const defNoArmor = evalArmorMastery(m.id, null);
  const defHeavy   = evalArmorMastery(m.id, heavyItem) - 74;
  const defLight   = evalArmorMastery(m.id, lightItem) - 50;
  const defRobe    = evalArmorMastery(m.id, robeItem) - 30;

  const deltaNoArmor = defNoArmor - noArmorBase;
  const deltaHeavy   = defHeavy - noArmorBase;
  const deltaLight   = defLight - noArmorBase;
  const deltaRobe    = defRobe - noArmorBase;

  armorMatrixResults.push({
    mastery: m.name,
    id: m.id,
    deltaNoArmor,
    deltaHeavy,
    deltaLight,
    deltaRobe,
    expectedWhenCompatible: m.expectedBonus,
    expectedWhenIncompatible: 0,
    bugDetected: m.validArmor === 'heavy' ? (deltaNoArmor > 0 || deltaRobe > 0 || deltaLight > 0) : (m.validArmor === 'light' ? (deltaNoArmor > 0 || deltaHeavy > 0 || deltaRobe > 0) : false)
  });
}

console.table(armorMatrixResults);

console.log('\n================================================================');
console.log('MATRIZ DE REPRODUÇÃO: BUG FUNCIONAL 02 — WEAPON MASTERY');
console.log('================================================================');

function evalWeaponMastery(skillId, weaponItem) {
  const state = {
    class: 'warrior',
    race: 'human',
    level: 40,
    skills: skillId ? { [skillId]: 1 } : {},
    equipment: weaponItem ? { weapon: 'test_wpn' } : {},
    inventory: weaponItem ? [{ uid: 'test_wpn', itemId: weaponItem.id, ...weaponItem }] : []
  };
  return getStats(state).atk;
}

const noWpnBase = evalWeaponMastery(null, null);

const swordItem   = { id: 'saber_sword', name: 'Saber Sword', atk: 60, weaponType: 'sword' };
const bluntItem   = { id: 'warhammer', name: 'Warhammer', atk: 60, weaponType: 'blunt' };
const daggerItem  = { id: 'darkelven_dagger', name: 'Darkelven Dagger', atk: 60, weaponType: 'dagger' };
const bowItem     = { id: 'elven_bow', name: 'Elven Bow', atk: 60, weaponType: 'bow' };
const spearItem   = { id: 'short_spear', name: 'Short Spear', atk: 60, weaponType: 'spear' };
const dualItem    = { id: 'dual_bastard_sword', name: 'Dual Bastard Sword', atk: 60, weaponType: 'dual' };
const staffItem   = { id: 'mystic_staff', name: 'Mystic Staff', atk: 24, weaponType: 'staff' };

const wpnMasteriesToTest = [
  { id: 'sword_blunt_mastery', name: 'Sword/Blunt Mastery', expectedBonus: 5, valid: ['sword', 'blunt'] },
  { id: 'dagger_mastery',      name: 'Dagger Mastery',      expectedBonus: 5, valid: ['dagger'] },
  { id: 'bow_mastery',         name: 'Bow Mastery',         expectedBonus: 5, valid: ['bow'] },
  { id: 'polearm_mastery',     name: 'Polearm Mastery',     expectedBonus: 5, valid: ['spear'] },
  { id: 'dual_weapon_mastery', name: 'Dual Weapon Mastery', expectedBonus: 5, valid: ['dual'] },
  { id: 'weapon_mastery',      name: 'Weapon Mastery',      expectedBonus: 5, valid: ['any'] }
];

const wpnMatrixResults = [];

for (const m of wpnMasteriesToTest) {
  const deltaNoWpn  = evalWeaponMastery(m.id, null) - noWpnBase;
  const deltaSword  = (evalWeaponMastery(m.id, swordItem) - 60) - noWpnBase;
  const deltaBlunt  = (evalWeaponMastery(m.id, bluntItem) - 60) - noWpnBase;
  const deltaDagger = (evalWeaponMastery(m.id, daggerItem) - 60) - noWpnBase;
  const deltaBow    = (evalWeaponMastery(m.id, bowItem) - 60) - noWpnBase;
  const deltaSpear  = (evalWeaponMastery(m.id, spearItem) - 60) - noWpnBase;
  const deltaDual   = (evalWeaponMastery(m.id, dualItem) - 60) - noWpnBase;
  const deltaStaff  = (evalWeaponMastery(m.id, staffItem) - 24) - noWpnBase;

  wpnMatrixResults.push({
    mastery: m.name,
    deltaNoWpn,
    deltaSword,
    deltaBlunt,
    deltaDagger,
    deltaBow,
    deltaSpear,
    deltaDual,
    deltaStaff,
    bugDetected: m.valid.includes('any') ? false : (deltaNoWpn > 0 || (m.valid.includes('sword') && deltaBow > 0))
  });
}

console.table(wpnMatrixResults);
