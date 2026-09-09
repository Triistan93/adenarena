/**
 * AssetResolver.js
 * 
 * Strict resolver for character visual assets.
 * Enforces Contract: unknown classes produce explicit MISSING_ASSET, NEVER silent fallback to Fighter.
 */

import { getCharacterVisualProfile } from '../data/characters/CharacterVisualRegistry.js';

export function resolveCharacterVisual(classId, gender = 'm') {
  if (!classId || typeof classId !== 'string') {
    const errorMsg = `[AssetResolver] MISSING_ASSET: classId is invalid or undefined (${classId})`;
    console.error(errorMsg);
    return {
      status: 'MISSING_ASSET',
      error: errorMsg,
      visualProfile: null,
      animationSet: null,
      weaponProfile: null,
      assets: null
    };
  }

  const profile = getCharacterVisualProfile(classId);

  if (!profile) {
    const errorMsg = `[AssetResolver] MISSING_ASSET: No visual profile registered for classId '${classId}'. Strict mode: No fallback allowed.`;
    console.error(errorMsg);
    return {
      status: 'MISSING_ASSET',
      error: errorMsg,
      classId,
      visualProfile: null,
      animationSet: null,
      weaponProfile: null,
      assets: null
    };
  }

  return {
    status: 'RESOLVED',
    classId,
    visualProfile: profile.visualProfile,
    animationSet: profile.animationSet,
    weaponProfile: profile.weaponProfile,
    archetype: profile.archetype,
    race: profile.race,
    name: profile.name,
    assets: { ...profile.assets },
    metrics: { ...profile.metrics }
  };
}
