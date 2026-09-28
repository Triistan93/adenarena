import test from 'node:test';
import assert from 'node:assert/strict';
import { applyStarterKit } from '../lineage-idle/src/core/StateManager.js';
import { CANONICAL_CLASS_REGISTRY_V2 } from '../lineage-idle/src/data/classes/CanonicalClassRegistryV2.js';
import { CANONICAL_SKILL_REGISTRY_V2 } from '../lineage-idle/src/data/skills/CanonicalSkillRegistryV2.js';
import {
  getVisibleSkillsForCharacter,
  resolveV2ClassContext
} from '../lineage-idle/src/services/SkillEligibility.js';
import { getSkillTreeViewModel } from '../lineage-idle/src/services/SkillTreeViewModel.js';
import { transformV2SkillToEcho } from '../lineage-idle/data/echo-adapter.js';

function createErtheiaCharacter(classId) {
  const state = {};
  applyStarterKit(state, 'ertheia', classId, 'Skill Audit', 'F');
  return state;
}

test('Ertheia Fighter starter kit grants only its configured class skills and renders them', () => {
  const character = createErtheiaCharacter('marauderBase');
  const visible = getVisibleSkillsForCharacter(character);
  const tree = getSkillTreeViewModel(character);

  assert.equal(character.class, 'marauderBase');
  assert.ok(Object.keys(character.skills).length > 0, 'starter kit must not leave the class without skills');
  assert.deepEqual(Object.keys(character.skills).sort(), CANONICAL_CLASS_REGISTRY_V2.marauderBase.skillIds.slice().sort());
  assert.deepEqual(visible.visibleList.map(({ skillId }) => skillId).sort(), Object.keys(character.skills).sort());
  assert.equal(tree.tabs.active.skills.some(({ skillId }) => character.skills[skillId] > 0), true);
});

test('Ertheia class display names resolve to the same guarded skill context as canonical IDs', () => {
  for (const [displayName, canonicalId] of [
    ['Ertheia Marauder Base', 'marauderBase'],
    ['Ertheia Mage', 'sayhaMageBase']
  ]) {
    const context = resolveV2ClassContext(displayName, 'ertheia');
    const canonicalContext = resolveV2ClassContext(canonicalId, 'ertheia');
    const character = createErtheiaCharacter(displayName);

    assert.equal(context.status, canonicalContext.status, `${displayName} must not bypass its content guard`);
    assert.deepEqual(context.authorizedSkillIds.slice().sort(), canonicalContext.authorizedSkillIds.slice().sort());
    assert.deepEqual(Object.keys(character.skills).sort(), canonicalContext.authorizedSkillIds.slice().sort());
  }
});

test('Ertheia Wizard starts with an Ertheia-specific offensive spell visible in the active tree', () => {
  const character = createErtheiaCharacter('sayhaMageBase');
  const context = resolveV2ClassContext(character.class, character.race);
  const visible = getVisibleSkillsForCharacter(character);
  const tree = getSkillTreeViewModel(character);
  const starterIds = Object.keys(character.skills);

  assert.ok(starterIds.length > 0, 'Ertheia Wizard starter kit must not be empty');
  assert.ok(starterIds.includes('hydro_attack'), 'Ertheia Wizard must receive its researched Hydro Attack starter');
  assert.deepEqual(starterIds.slice().sort(), context.authorizedSkillIds.slice().sort());
  assert.ok(visible.visibleList.some(({ skillId }) => skillId === 'hydro_attack'));
  assert.ok(tree.tabs.active.skills.some(({ skillId }) => skillId === 'hydro_attack'));

  const hydroAttack = CANONICAL_SKILL_REGISTRY_V2.hydro_attack;
  assert.ok(hydroAttack, 'Hydro Attack must resolve through the canonical skill registry');
  assert.ok(hydroAttack.classes.includes('sayhaMageBase'));
  assert.equal(hydroAttack.type, 'active');
  assert.equal(character.inventory.find(({ equippedSlot }) => equippedSlot === 'weapon')?.itemId, 'weapon_crucifix_of_blessing_magicblunt');
  assert.ok(character.inventory.some(({ itemId }) => itemId === 'spiritshot_ng'));

  const runtimeSkill = transformV2SkillToEcho('hydro_attack', hydroAttack);
  assert.equal(runtimeSkill.type, 'active');
  assert.equal(runtimeSkill.effect, 'dmg');
  assert.equal(runtimeSkill.damageType, 'magic');
  assert.equal(runtimeSkill.isMagic, true);
  assert.equal(runtimeSkill.reqLvl, 1);
  assert.equal(runtimeSkill.mpCost, hydroAttack.balance.mpCost);
  assert.equal(runtimeSkill.baseCd, hydroAttack.canonicalCooldownMs);
});

