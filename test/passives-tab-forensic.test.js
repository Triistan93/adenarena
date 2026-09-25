/**
 * test/passives-tab-forensic.test.js — Test Suite for Canonical Passives Display & Learning in Skill Tree
 *
 * Verifies User Requirement:
 * 1. 🛡️ Exibição e Aprendizado de Passivas Autênticas na Skill Tree (Aba PASSIVAS)
 *    - All authentic canonical passives belonging to a class and its lineage are displayed.
 *    - Examples tested: Death Points, Appetite for Destruction, Dwarven Mastery, Titan Spirit, Sacral Mastery.
 *    - Organized into 4 distinct stage/level sections:
 *      * Passivas Básicas (Lv. 1–19)
 *      * Passivas de 1ª Transferência (Lv. 20–39)
 *      * Passivas de Especialização (Lv. 40–75)
 *      * Maestrias Supremas (Lv. 76+)
 *    - Direct learning and leveling up with SP via spendSP with instant visual feedback.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

if (typeof window === 'undefined') {
  global.window = {};
}

await import('../lineage-idle/data/echo-adapter.js');

import {
  getSkillTreeViewModel,
  SKILL_TABS
} from '../lineage-idle/src/services/SkillTreeViewModel.js';

import {
  spendSP
} from '../lineage-idle/src/engine/SkillEngine.js';

import {
  isSkillAvailableForCharacter,
  isSkillNativeOrAvailableNow
} from '../lineage-idle/src/services/SkillEligibility.js';

import {
  updateSkillUI
} from '../lineage-idle/src/ui/GameUI.js';

test('1. Death Knight: Authentic passives (Death Points & Appetite for Destruction) display and learn with SP', () => {
  const state = {
    class: 'human_deathknight_0',
    race: 'human',
    level: 20,
    sp: 500,
    skills: {},
    activeSkillTab: SKILL_TABS.PASSIVE,
    inventory: []
  };

  const vm = getSkillTreeViewModel(state, { activeTab: SKILL_TABS.PASSIVE });
  const passiveTab = vm.tabs[SKILL_TABS.PASSIVE];
  assert.ok(passiveTab, 'Aba PASSIVAS deve existir no ViewModel');
  assert.ok(passiveTab.skills.length > 0, 'Aba PASSIVAS deve conter habilidades passivas');

  const dpSkill = passiveTab.skills.find(s => s.skillId === 'death_points');
  assert.ok(dpSkill, 'Death Points deve estar presente na aba PASSIVAS para Death Knight');
  assert.equal(dpSkill.name, 'Death Points');
  assert.equal(dpSkill.tab, 'passive');

  const appSkill = passiveTab.skills.find(s => s.skillId === 'appetite_for_destruction');
  assert.ok(appSkill, 'Appetite for Destruction deve estar presente na aba PASSIVAS para Death Knight');
  assert.equal(appSkill.name, 'Appetite for Destruction');

  // Verify spendSP on Death Points
  const spBefore = state.sp;
  const learned = spendSP(state, 'death_points');
  assert.equal(learned, true, 'spendSP em death_points deve retornar true');
  assert.equal(state.skills['death_points'], 1, 'death_points deve estar no nível 1');
  assert.ok(state.sp < spBefore, 'SP deve ser debitado');

  // Verify level up (rank 2)
  const spAfterRank1 = state.sp;
  const leveledUp = spendSP(state, 'death_points');
  assert.equal(leveledUp, true, 'spendSP de nível 2 em death_points deve retornar true');
  assert.equal(state.skills['death_points'], 2, 'death_points deve estar no nível 2');
  assert.ok(state.sp < spAfterRank1, 'SP deve ser debitado no rank 2');
});

test('2. Titan: Authentic Lv 76 passives (Titan Spirit) grouped under Maestrias Supremas (Lv. 76+)', () => {
  const state = {
    class: 'titan',
    race: 'orc',
    level: 76,
    sp: 5000,
    skills: {},
    activeSkillTab: SKILL_TABS.PASSIVE,
    inventory: [{ itemId: 'book_3star', count: 1 }]
  };

  const vm = getSkillTreeViewModel(state, { activeTab: SKILL_TABS.PASSIVE });
  const passiveTab = vm.tabs[SKILL_TABS.PASSIVE];

  const titanSpirit = passiveTab.skills.find(s => s.skillId === 'titan_spirit');
  assert.ok(titanSpirit, 'Titan Spirit deve estar presente na aba PASSIVAS para Titan');
  assert.equal(titanSpirit.requiredLevel, 76);

  // Verify category organization
  const supremeCategory = passiveTab.categories.find(c => c.id === 'PASSIVE_THIRD');
  assert.ok(supremeCategory, 'Seção Maestrias Supremas (Lv. 76+) deve existir para Titan Lv 76');
  assert.equal(supremeCategory.title, 'Maestrias Supremas (Lv. 76+)');
  assert.ok(supremeCategory.skills.some(s => s.skillId === 'titan_spirit'), 'Titan Spirit deve estar dentro da seção Maestrias Supremas');

  // Verify learning Titan Spirit
  const learned = spendSP(state, 'titan_spirit');
  assert.equal(learned, true, 'Titan Spirit deve ser aprendida com SP');
  assert.equal(state.skills['titan_spirit'], 1);
});

test('3. Dwarf Maestro: Authentic passives (Dwarven Weapon & Armor Mastery) grouped under Maestrias Supremas', () => {
  const state = {
    class: 'maestro',
    race: 'dwarf',
    level: 76,
    sp: 5000,
    skills: {},
    activeSkillTab: SKILL_TABS.PASSIVE,
    inventory: []
  };

  const vm = getSkillTreeViewModel(state, { activeTab: SKILL_TABS.PASSIVE });
  const passiveTab = vm.tabs[SKILL_TABS.PASSIVE];

  const wpnMastery = passiveTab.skills.find(s => s.skillId === 'dwarven_weapon_mastery');
  assert.ok(wpnMastery, 'Dwarven Weapon Mastery deve estar na aba PASSIVAS do Maestro');

  const armMastery = passiveTab.skills.find(s => s.skillId === 'dwarven_armor_mastery');
  assert.ok(armMastery, 'Dwarven Armor Mastery deve estar na aba PASSIVAS do Maestro');

  const supremeCategory = passiveTab.categories.find(c => c.id === 'PASSIVE_THIRD');
  assert.ok(supremeCategory.skills.some(s => s.skillId === 'dwarven_weapon_mastery'));
  assert.ok(supremeCategory.skills.some(s => s.skillId === 'dwarven_armor_mastery'));
});

test('4. Sacred Templar: Authentic passives (Sacral Weapon & Armor Mastery) in Passivas de 1ª Transferência', () => {
  const state = {
    class: 'sacred_templar_1',
    race: 'human',
    level: 20,
    sp: 1000,
    skills: {},
    activeSkillTab: SKILL_TABS.PASSIVE,
    inventory: []
  };

  const vm = getSkillTreeViewModel(state, { activeTab: SKILL_TABS.PASSIVE });
  const passiveTab = vm.tabs[SKILL_TABS.PASSIVE];

  const sacralWpn = passiveTab.skills.find(s => s.skillId === 'sacral_weapon_mastery');
  assert.ok(sacralWpn, 'Sacral Weapon Mastery deve estar na aba PASSIVAS do Sacred Templar');

  const firstCategory = passiveTab.categories.find(c => c.id === 'PASSIVE_FIRST');
  assert.ok(firstCategory, 'Seção Passivas de 1ª Transferência deve existir para Lv 20');
  assert.equal(firstCategory.title, 'Passivas de 1ª Transferência (Lv. 20–39)');
  assert.ok(firstCategory.skills.some(s => s.skillId === 'sacral_weapon_mastery'));
});

test('5. 4 Canonical Stage Sections: Categorization and progression thresholds', () => {
  const state = {
    class: 'duelist',
    race: 'human',
    level: 76,
    sp: 10000,
    skills: {},
    activeSkillTab: SKILL_TABS.PASSIVE,
    inventory: []
  };

  const vm = getSkillTreeViewModel(state, { activeTab: SKILL_TABS.PASSIVE });
  const cats = vm.tabs[SKILL_TABS.PASSIVE].categories;

  const expectedCategories = [
    { id: 'PASSIVE_BASE', title: 'Passivas Básicas (Lv. 1–19)' },
    { id: 'PASSIVE_FIRST', title: 'Passivas de 1ª Transferência (Lv. 20–39)' },
    { id: 'PASSIVE_SECOND', title: 'Passivas de Especialização (Lv. 40–75)' },
    { id: 'PASSIVE_THIRD', title: 'Maestrias Supremas (Lv. 76+)' }
  ];

  for (const exp of expectedCategories) {
    const found = cats.find(c => c.id === exp.id);
    assert.ok(found, `Categoria ${exp.id} (${exp.title}) deve estar presente no Duelist Lv 76`);
    assert.equal(found.title, exp.title);
    assert.ok(found.skills.length > 0, `Categoria ${exp.id} deve ter habilidades passivas`);
  }
});

test('6. DOM Rendering Simulation: updateSkillUI mounts all passive category blocks with headers and cards', () => {
  const elements = {};
  function createMockElement(id, tag = 'div') {
    const el = {
      id,
      tagName: tag.toUpperCase(),
      style: {},
      innerHTML: '',
      children: [],
      classList: {
        classes: new Set(),
        add(c) { this.classes.add(c); },
        remove(c) { this.classes.delete(c); },
        contains(c) { return this.classes.has(c); },
        toggle(c, force) {
          if (force !== undefined) {
            if (force) this.classes.add(c); else this.classes.delete(c);
            return force;
          }
          if (this.classes.has(c)) { this.classes.delete(c); return false; }
          this.classes.add(c); return true;
        }
      },
      dataset: {},
      querySelector: (sel) => null,
      querySelectorAll: (sel) => []
    };
    elements[id] = el;
    return el;
  }

  global.document = {
    getElementById: (id) => elements[id] || null,
    querySelector: (sel) => null,
    querySelectorAll: (sel) => []
  };

  const tree = createMockElement('skill-tree');

  const state = {
    class: 'titan',
    race: 'orc',
    level: 76,
    sp: 5000,
    skills: {},
    activeSkillTab: SKILL_TABS.PASSIVE,
    inventory: []
  };

  let spSpentSkill = null;
  const callbacks = {
    spendSP: (sId) => { spSpentSkill = sId; }
  };

  updateSkillUI(state, callbacks);
  assert.ok(tree.innerHTML.includes('Maestrias Supremas (Lv. 76+)'), 'DOM deve renderizar o cabeçalho Maestrias Supremas');
  assert.ok(tree.innerHTML.includes('Titan Spirit'), 'DOM deve renderizar o card de Titan Spirit');
});
