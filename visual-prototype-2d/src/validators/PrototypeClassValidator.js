/**
 * PrototypeClassValidator.js
 * 
 * Verifies that all 8 classes have complete data contracts across:
 * ClassIdentity, VisualProfile, AnimationSet, WeaponProfile, SkillPools, Ultimates, and Master Ultimates.
 * Direct implementation of Section 66.
 */

import { getAllClassIds, getClassIdentity } from '../data/classes/ClassIdentity.js';
import { CHARACTER_VISUAL_REGISTRY } from '../data/characters/CharacterVisualRegistry.js';
import { ANIMATION_REGISTRY } from '../data/characters/AnimationRegistry.js';
import { CLASS_WEAPON_MAP } from '../data/characters/WeaponRegistry.js';
import { getClassSkillPool } from '../data/skills/SkillProgression.js';
import { getClassUltimate } from '../data/skills/UltimateRegistry.js';

export function validateAllClasses() {
  const classIds = getAllClassIds();
  const results = {
    totalClasses: classIds.length,
    passed: 0,
    failed: 0,
    errors: [],
    details: {}
  };

  classIds.forEach(classId => {
    const classErrors = [];

    // 1. Identity
    const identity = getClassIdentity(classId);
    if (!identity) classErrors.push('Missing ClassIdentity');

    // 2. Visual Profile
    const visual = CHARACTER_VISUAL_REGISTRY[classId];
    if (!visual) classErrors.push('Missing CharacterVisualProfile');

    // 3. Animation Set
    const anim = visual ? ANIMATION_REGISTRY[visual.animationSet] : null;
    if (!anim) classErrors.push(`Missing AnimationSet '${visual?.animationSet}'`);

    // 4. Weapon Profile
    const weapon = CLASS_WEAPON_MAP[classId];
    if (!weapon) classErrors.push('Missing WeaponProfile mapping');

    // 5. Skill Pool at Level 90 (all stages unlocked)
    const skills = getClassSkillPool(classId, 90);
    if (!skills || skills.length < 5) {
      classErrors.push(`Insufficient skill pool: found ${skills?.length || 0} skills, expected at least 5`);
    }

    // 6. Ultimate
    const ultimate = getClassUltimate(classId);
    if (!ultimate || !ultimate.ultimateId || !ultimate.masterUltimateId) {
      classErrors.push('Missing Ultimate or Master Ultimate declaration');
    }

    if (classErrors.length === 0) {
      results.passed++;
    } else {
      results.failed++;
      results.errors.push(`[${classId}] ` + classErrors.join(', '));
    }

    results.details[classId] = {
      status: classErrors.length === 0 ? 'PASS' : 'FAIL',
      errors: classErrors,
      skillCount: skills?.length || 0,
      ultimate: ultimate?.ultimateId,
      masterUltimate: ultimate?.masterUltimateId
    };
  });

  results.status = results.failed === 0 ? 'PASS' : 'FAIL';
  return results;
}
