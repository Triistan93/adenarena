import test from 'node:test';
import assert from 'node:assert/strict';
import { CANONICAL_CLASS_REGISTRY_V2 } from '../lineage-idle/src/data/classes/CanonicalClassRegistryV2.js';
import { CANONICAL_SKILL_REGISTRY_V2 } from '../lineage-idle/src/data/skills/CanonicalSkillRegistryV2.js';
import {
  getVisibleSkillsForCharacter,
  isSkillInProgressionPath,
  isSkillAvailableForCharacter,
  isSkillNativeOrAvailableNow,
  resolveV2ClassContext
} from '../lineage-idle/src/services/SkillEligibility.js';
import { getSkillTreeViewModel } from '../lineage-idle/src/services/SkillTreeViewModel.js';

test('Ertheia Marauder Base shows its authorized starter skills at level 1', () => {
  const character = { class: 'marauderBase', race: 'ertheia', level: 1, skills: {}, sp: 12000 };
  const context = resolveV2ClassContext(character.class, character.race);
  const visibility = getVisibleSkillsForCharacter(character);
  const tree = getSkillTreeViewModel(character);

  assert.equal(context.status, 'CONTENT_GAP');
  assert.deepEqual(context.authorizedSkillIds.slice().sort(), ['fist_mastery', 'iron_punch', 'light_armor_mastery']);
  assert.deepEqual(visibility.visibleList.map(({ skillId }) => skillId).sort(), context.authorizedSkillIds.slice().sort());
  assert.deepEqual(tree.tabs.active.skills.map(({ skillId }) => skillId), ['iron_punch']);
  assert.deepEqual(tree.tabs.passive.skills.map(({ skillId }) => skillId).sort(), ['fist_mastery', 'light_armor_mastery']);
  assert.equal(isSkillAvailableForCharacter(character, 'iron_punch'), true);
  assert.equal(tree.tabs.active.count, 1);
  assert.equal(tree.tabs.passive.count, 2);
});

test('Kamael Death Mark is not assigned to Ertheia Marauder Base', () => {
  const context = resolveV2ClassContext('marauderBase', 'ertheia');
  const deathMark = CANONICAL_SKILL_REGISTRY_V2.death_mark;

  assert.ok(!CANONICAL_CLASS_REGISTRY_V2.marauderBase.skillIds.includes('death_mark'));
  assert.ok(!deathMark.classes.includes('marauderBase'));
  assert.equal(context.authorizedSkillIds.includes('death_mark'), false);
  assert.equal(isSkillInProgressionPath({ class: 'marauderBase', race: 'ertheia' }, deathMark), false);
});

test('Kamael-specific skills are not assigned to the Ertheia Fighter tree', () => {
  const ertheiaFighter = CANONICAL_CLASS_REGISTRY_V2.marauderBase;

  assert.ok(ertheiaFighter, 'the persisted Ertheia Fighter class ID remains available');
  assert.ok(!ertheiaFighter.skillIds.includes('kamael_s_dignity'));
  assert.ok(!ertheiaFighter.skillIds.includes('pride_of_kamael'));

  for (const skillId of ['kamael_s_dignity', 'pride_of_kamael']) {
    const skill = CANONICAL_SKILL_REGISTRY_V2[skillId];
    assert.ok(
      !skill?.classes?.includes('marauderBase'),
      `${skillId} must not be eligible for the Ertheia Fighter class`
    );
    assert.equal(isSkillNativeOrAvailableNow('marauderBase', skill), false, `${skillId} must be rejected by production eligibility`);
  }
});

test('Overwhelming Power is restricted to Doombringer and Titan keeps its Frenzy skill', () => {
  const skill = CANONICAL_SKILL_REGISTRY_V2.overwhelming_power;

  assert.deepEqual(skill.classes, ['doombringer']);
  assert.ok(!CANONICAL_CLASS_REGISTRY_V2.titan.skillIds.includes(skill.id));
  assert.ok(CANONICAL_CLASS_REGISTRY_V2.titan.skillIds.includes('frenzy'));
  assert.ok(!CANONICAL_CLASS_REGISTRY_V2.eviscerator.skillIds.includes(skill.id));
  assert.equal(isSkillNativeOrAvailableNow('titan', skill), false);
  assert.equal(isSkillNativeOrAvailableNow('eviscerator', skill), false);
  assert.equal(isSkillNativeOrAvailableNow('doombringer', skill), true);
});
