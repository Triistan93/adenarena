/**
 * scripts/reproduce_mastery_and_damage_bugs.mjs
 * Reprodução e documentação dos 3 bugs funcionais apontados na Auditoria 2.1:
 * 1. Armor Mastery incondicional
 * 2. Weapon Mastery incondicional
 * 3. Damage Type determinado por stats.matk > stats.atk
 */

import { getStats } from '../lineage-idle/src/engine/StatsEngine.js';
import { attackMonster } from '../lineage-idle/main.js';
import { getState, DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';
import { combatEvents, CombatEventType } from '../lineage-idle/src/vfx/CombatEvent.js';

console.log('=== 1. REPRODUÇÃO: BUG FUNCIONAL 01 — ARMOR MASTERY ===');

function testArmorMastery(armorItem) {
  const state = {
    class: 'knight',
    race: 'human',
    level: 40,
    skills: { heavy_armor_mastery: 1 },
    equipment: armorItem ? { armor: 'test_armor', chest: 'test_armor' } : {},
    inventory: armorItem ? [{ uid: 'test_armor', itemId: armorItem.id, ...armorItem }] : []
  };
  return getStats(state).def;
}

const noSkillState = {
  class: 'knight',
  race: 'human',
  level: 40,
  skills: {},
  equipment: {},
  inventory: []
};

const defBaseNoSkill = getStats(noSkillState).def;
const defLearnedNoArmor = testArmorMastery(null);
const defLearnedHeavy = testArmorMastery({ id: 'full_plate_heavy_armor', name: 'Full Plate Heavy Armor', def: 74, armorType: 'heavy' });
const defLearnedLight = testArmorMastery({ id: 'theca_light_armor', name: 'Theca Light Armor', def: 50, armorType: 'light' });
const defLearnedRobe  = testArmorMastery({ id: 'karmian_robe_armor', name: 'Karmian Robe Armor', def: 30, armorType: 'robe' });

console.log('Base DEF (sem skill, sem armor):', defBaseNoSkill);
console.log('DEF com Heavy Mastery (SEM armor):', defLearnedNoArmor, '-> Bônus da Mastery:', defLearnedNoArmor - defBaseNoSkill, '(ESPERADO: 0, OBSERVADO:', defLearnedNoArmor - defBaseNoSkill, ')');
console.log('DEF com Heavy Mastery (com Robe):', defLearnedRobe, '-> Inclui item (30) + Mastery:', defLearnedRobe - (defBaseNoSkill + 30), '(ESPERADO: 0 bônus de heavy, OBSERVADO:', defLearnedRobe - (defBaseNoSkill + 30), ')');
console.log('DEF com Heavy Mastery (com Light):', defLearnedLight, '-> Inclui item (50) + Mastery:', defLearnedLight - (defBaseNoSkill + 50), '(ESPERADO: 0 bônus de heavy, OBSERVADO:', defLearnedLight - (defBaseNoSkill + 50), ')');
console.log('DEF com Heavy Mastery (com Heavy):', defLearnedHeavy, '-> Inclui item (74) + Mastery:', defLearnedHeavy - (defBaseNoSkill + 74), '(ESPERADO: 12, OBSERVADO:', defLearnedHeavy - (defBaseNoSkill + 74), ')');

console.log('\n=== 2. REPRODUÇÃO: BUG FUNCIONAL 02 — WEAPON MASTERY ===');

function testWeaponMastery(skillId, weaponItem) {
  const state = {
    class: 'warrior',
    race: 'human',
    level: 40,
    skills: { [skillId]: 1 },
    equipment: weaponItem ? { weapon: 'test_wpn' } : {},
    inventory: weaponItem ? [{ uid: 'test_wpn', itemId: weaponItem.id, ...weaponItem }] : []
  };
  return getStats(state).atk;
}

const noSkillAtkState = {
  class: 'warrior',
  race: 'human',
  level: 40,
  skills: {},
  equipment: {},
  inventory: []
};

const baseAtkNoSkill = getStats(noSkillAtkState).atk;
const atkSwordMasteryNoWpn = testWeaponMastery('sword_blunt_mastery', null);
const atkSwordMasteryBow   = testWeaponMastery('sword_blunt_mastery', { id: 'crystallized_ice_bow', name: 'Crystallized Ice Bow', atk: 86, weaponType: 'bow' });
const atkSwordMasterySword = testWeaponMastery('sword_blunt_mastery', { id: 'battle_axe', name: 'Battle Axe', atk: 86, weaponType: 'blunt' });

console.log('Base ATK (sem skill, sem arma):', baseAtkNoSkill);
console.log('ATK com Sword/Blunt Mastery (SEM arma):', atkSwordMasteryNoWpn, '-> Bônus da Mastery:', atkSwordMasteryNoWpn - baseAtkNoSkill, '(ESPERADO: 0, OBSERVADO:', atkSwordMasteryNoWpn - baseAtkNoSkill, ')');
console.log('ATK com Sword/Blunt Mastery (com Arco):', atkSwordMasteryBow, '-> Inclui item (86) + Mastery:', atkSwordMasteryBow - (baseAtkNoSkill + 86), '(ESPERADO: 0 bônus de sword, OBSERVADO:', atkSwordMasteryBow - (baseAtkNoSkill + 86), ')');
console.log('ATK com Sword/Blunt Mastery (com Espada/Clava):', atkSwordMasterySword, '-> Inclui item (86) + Mastery:', atkSwordMasterySword - (baseAtkNoSkill + 86), '(ESPERADO: 5, OBSERVADO:', atkSwordMasterySword - (baseAtkNoSkill + 86), ')');

console.log('\n=== 3. REPRODUÇÃO: BUG FUNCIONAL 03 — DAMAGE TYPE DISPATCH ===');

// Test adversarial dispatch on Power Strike
const stateObj = getState();
for (const k of Object.keys(stateObj)) delete stateObj[k];
Object.assign(stateObj, DEFAULT_STATE(), {
  class: 'fighter',
  race: 'human',
  level: 20,
  skills: { power_strike: 1 },
  skillLoadout: { core1: 'power_strike' },
  isCombatActive: true,
  zone: null,
  isRaidActive: true,
  target: 'target1',
  activeMonster: { id: 'target1', name: 'Target', hp: 10000, maxHp: 10000, def: 10, mdef: 10, atk: 1, atkSpd: 0.1 },
  equipment: { weapon: 'wpn_test' },
  inventory: [{ uid: 'wpn_test', itemId: 'high_matk_staff', slot: 'weapon', atk: 10, matk: 500, count: 1 }]
});

const emittedEvents = [];
const listener = ev => emittedEvents.push(ev);
combatEvents.on(CombatEventType.SKILL_DAMAGE, listener);

const statsP = getStats(stateObj);
console.log('Fighter com cajado mágico -> P.Atk:', statsP.atk, 'M.Atk:', statsP.matk);
console.log('Condição stats.matk > stats.atk:', statsP.matk > statsP.atk);

attackMonster();

console.log('Eventos SKILL_DAMAGE emitidos:', emittedEvents.length);
if (emittedEvents.length > 0) {
  console.log('Último evento:', emittedEvents[emittedEvents.length - 1]);
}
combatEvents.off(CombatEventType.SKILL_DAMAGE, listener);
