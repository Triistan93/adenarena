/**
 * PrototypeVisualIdentityValidator.js
 * 
 * Verifies that each of the 8 classes has a unique and distinct visual identity.
 * Validates race, visual profile, animation set, weapon profile, and asset exclusivity.
 * Direct implementation of Section 57, 59, 64, 68.
 */

import { getAllClassIds } from '../data/classes/ClassIdentity.js';
import { CHARACTER_VISUAL_REGISTRY } from '../data/characters/CharacterVisualRegistry.js';

export function validateVisualIdentities() {
  const classIds = getAllClassIds();
  const seenSignatures = new Map();
  const duplicateSignatures = [];

  const results = {
    totalClasses: classIds.length,
    uniqueIdentities: 0,
    conflicts: [],
    details: {}
  };

  classIds.forEach(classId => {
    const profile = CHARACTER_VISUAL_REGISTRY[classId];
    if (!profile) {
      results.conflicts.push(`Missing visual profile for ${classId}`);
      return;
    }

    // Unique Identity Signature
    const signature = `${profile.race}|${profile.visualProfile}|${profile.animationSet}|${profile.weaponProfile}|${profile.assets.master}`;

    if (seenSignatures.has(signature)) {
      const prevClass = seenSignatures.get(signature);
      results.conflicts.push(`Visual Identity Duplicate detected between '${classId}' and '${prevClass}'`);
    } else {
      seenSignatures.set(signature, classId);
      results.uniqueIdentities++;
    }

    results.details[classId] = {
      race: profile.race,
      visualProfile: profile.visualProfile,
      animationSet: profile.animationSet,
      weaponProfile: profile.weaponProfile,
      signature
    };
  });

  results.status = results.conflicts.length === 0 ? 'PASS' : 'FAIL';
  return results;
}
