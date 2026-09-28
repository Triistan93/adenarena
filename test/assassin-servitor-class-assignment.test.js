import test from 'node:test';
import assert from 'node:assert/strict';
import { CANONICAL_CLASS_REGISTRY_V2 } from '../lineage-idle/src/data/classes/CanonicalClassRegistryV2.js';
import { CANONICAL_SKILL_REGISTRY_V2 } from '../lineage-idle/src/data/skills/CanonicalSkillRegistryV2.js';
import { isSkillNativeOrAvailableNow } from '../lineage-idle/src/services/SkillEligibility.js';

test('Assassin Servitor belongs to Spectral Master and is unavailable to the Assassin branch', () => {
  const skill = CANONICAL_SKILL_REGISTRY_V2.assassin_servitor;
  assert.ok(skill, 'Assassin Servitor must exist in the canonical skill registry');

  assert.deepEqual(skill.classes, ['spectralMaster']);
  assert.ok(CANONICAL_CLASS_REGISTRY_V2.spectralMaster.skillIds.includes(skill.id));
  assert.ok(!CANONICAL_CLASS_REGISTRY_V2.assassinS2.skillIds.includes(skill.id));
  assert.equal(CANONICAL_CLASS_REGISTRY_V2.assassinS2.skillIds.length, 5);
  assert.ok(CANONICAL_CLASS_REGISTRY_V2.assassinS2.skillIds.includes('assassin_s_secret_notes_2nd_page'));

  assert.equal(isSkillNativeOrAvailableNow('spectralMaster', skill), true);
  assert.equal(isSkillNativeOrAvailableNow('assassinS2', skill), false);
});
