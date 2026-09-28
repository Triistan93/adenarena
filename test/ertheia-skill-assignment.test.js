import test from 'node:test';
import assert from 'node:assert/strict';
import { CANONICAL_CLASS_REGISTRY_V2 } from '../lineage-idle/src/data/classes/CanonicalClassRegistryV2.js';
import { CANONICAL_SKILL_REGISTRY_V2 } from '../lineage-idle/src/data/skills/CanonicalSkillRegistryV2.js';
import { isSkillNativeOrAvailableNow } from '../lineage-idle/src/services/SkillEligibility.js';

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
