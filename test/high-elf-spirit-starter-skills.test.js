import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveV2ClassContext, getVisibleSkillsForCharacter, isSkillAvailableForCharacter } from '../lineage-idle/src/services/SkillEligibility.js';
import { getSkillTreeViewModel } from '../lineage-idle/src/services/SkillTreeViewModel.js';
import { applyStarterKit } from '../lineage-idle/src/core/StateManager.js';

test('High Elf Element Weaver Stage 0 resolves its source-listed skills in the V2 class DAG', () => {
  const context = resolveV2ClassContext('spirit_0', 'highelf');

  assert.equal(context.status, 'RESOLVED');
  assert.equal(context.v2ClassId, 'spirit_0');
  assert.deepEqual(context.v2ClassDef.skillIds, ['fire_sphere', 'ice_sphere']);
  assert.deepEqual(context.authorizedSkillIds.slice().sort(), ['fire_sphere', 'ice_sphere']);
});

test('Level 1 High Elf Element Weaver displays and can use both Stage 0 sphere skills', () => {
  const character = { class: 'spirit_0', race: 'highelf', level: 1, sp: 500, skills: {} };
  const visible = getVisibleSkillsForCharacter(character);
  const tree = getSkillTreeViewModel(character);

  assert.deepEqual(visible.visibleList.map(({ skillId }) => skillId).sort(), ['fire_sphere', 'ice_sphere']);
  assert.deepEqual(tree.tabs.active.skills.map(({ skillId }) => skillId).sort(), ['fire_sphere', 'ice_sphere']);
  assert.equal(isSkillAvailableForCharacter(character, 'fire_sphere'), true);
  assert.equal(isSkillAvailableForCharacter(character, 'ice_sphere'), true);
});

test('Production character creation grants both Element Weaver Stage 0 skills', () => {
  const character = {};

  applyStarterKit(character, 'highelf', 'spirit_0', 'Test High Elf');

  assert.equal(character.class, 'spirit_0');
  assert.deepEqual(Object.keys(character.skills).sort(), ['fire_sphere', 'ice_sphere']);
  assert.equal(character.selectedSkill, 'fire_sphere');
});

test('Element Weaver promotion inherits the Stage 0 spheres without exposing the High Elf Templar branch', () => {
  const character = { class: 'spirit_1', race: 'highelf', level: 20, sp: 500, skills: {} };
  const context = resolveV2ClassContext(character.class, character.race);
  const tree = getSkillTreeViewModel(character);
  const visibleIds = tree.allVisibleSkills.map(({ skillId }) => skillId);

  assert.equal(context.status, 'RESOLVED');
  assert.equal(context.v2ClassDef.parentClass, 'spirit_0');
  assert.ok(visibleIds.includes('fire_sphere'));
  assert.ok(visibleIds.includes('ice_sphere'));
  assert.ok(!visibleIds.includes('sacral_strike'));
});
