/**
 * ClassIdentityAuditor.js — Game Data Contract 3.2.1 / Deploy 3.1
 * 
 * Class Identity Fingerprinting & Mechanical Uniqueness Auditor:
 * 
 * Rules:
 * 1. GameplayIdentityFingerprint must NEVER include classId.
 * 2. Fingerprint composition:
 *    - Race: 10%
 *    - Primary Role: 15%
 *    - Lv40 Elements: 20%
 *    - Lv76 Elements: 15%
 *    - Signature Skills: 20%
 *    - Skill Profile: 10%
 *    - Progression: 10%
 *    Total: 100%
 * 
 * 3. Classification:
 *    - 100% -> DUPLICATE
 *    - >= 90% -> REVIEW
 *    - < 90% -> UNIQUE
 * 
 * 4. FullIdentityFingerprint incorporates visual/art and VFX layers,
 *    but visual differences cannot excuse gameplay duplication.
 */

import { CLASS_IDENTITIES, getAllClassIdentities, getClassIdentity } from '../data/elemental/ClassIdentity.js';
import { ACTIVE_CLASSES } from '../data/elemental/ElementMatrix.js';
import { getNativeSkillsByClass, getNativeSkillById } from '../data/elemental/NativeSkillTrees.js';
import { getSkillVfx } from '../data/vfx/SkillVfxRegistry.js';

/**
 * Calculates the Jaccard similarity between two arrays/sets of strings.
 * @param {string[]} a
 * @param {string[]} b
 * @returns {number} 0.0 to 1.0
 */
function jaccardSimilarity(a = [], b = []) {
  const setA = new Set(a);
  const setB = new Set(b);
  if (setA.size === 0 && setB.size === 0) return 1.0;
  
  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 1.0 : intersection / union;
}

/**
 * Computes the pure GameplayIdentityFingerprint for a class.
 * CRITICAL RULE: classId is strictly EXCLUDED.
 * 
 * @param {string} classId
 * @returns {object} Normalized gameplay features
 */
export function computeGameplayIdentityFingerprint(classId) {
  const identity = getClassIdentity(classId);
  if (!identity) return null;

  return {
    race: identity.race,
    primaryRole: identity.primaryRole,
    lv40Elements: [...(identity.allowedElementsByLevel[40] || [])].sort(),
    lv76Elements: [...(identity.allowedElementsByLevel[76] || [])].sort(),
    signatureSkills: [...(identity.signatureSkills || [])].sort(),
    skillPool40: [...(identity.skillPools[40] || [])].sort(),
    ultimateSkill: identity.ultimateSkill,
    masterUltimateSkill: identity.masterUltimateSkill,
    baseArchetype: identity.baseClass
  };
}

/**
 * Computes the full identity fingerprint including audio/visual and VFX bindings.
 * @param {string} classId
 * @returns {object}
 */
export function computeFullIdentityFingerprint(classId) {
  const gameplay = computeGameplayIdentityFingerprint(classId);
  if (!gameplay) return null;

  const identity = getClassIdentity(classId);
  const nativeSkills = getNativeSkillsByClass(classId);
  const vfxBindings = nativeSkills.map(s => {
    const vfx = getSkillVfx(s.id);
    return vfx ? vfx.vfxId : null;
  }).filter(Boolean);

  return {
    classId: identity.classId,
    gameplay,
    vfxBindings: vfxBindings.sort(),
    portraitMale: identity.portraitMale || `portraits/${identity.classId}_m.png`,
    portraitFemale: identity.portraitFemale || `portraits/${identity.classId}_f.png`
  };
}

/**
 * Compares two classes and computes gameplay similarity score (0.0 to 1.0).
 * Weights:
 * - Race: 10%
 * - Primary Role: 15%
 * - Lv40 Elements: 20%
 * - Lv76 Elements: 15%
 * - Signature Skills: 20%
 * - Skill Profile (Lv40 pool): 10%
 * - Progression / Ultimates: 10%
 * 
 * @param {string} classIdA
 * @param {string} classIdB
 * @returns {{ similarity: number, classification: 'UNIQUE' | 'REVIEW' | 'DUPLICATE', breakdown: object }}
 */
export function compareClassPair(classIdA, classIdB) {
  if (classIdA === classIdB) {
    return {
      similarity: 1.0,
      classification: 'DUPLICATE',
      breakdown: { race: 1, role: 1, lv40Elem: 1, lv76Elem: 1, sigSkills: 1, skillPool: 1, progression: 1 }
    };
  }

  const fpA = computeGameplayIdentityFingerprint(classIdA);
  const fpB = computeGameplayIdentityFingerprint(classIdB);
  if (!fpA || !fpB) {
    return { similarity: 0, classification: 'UNIQUE', breakdown: {} };
  }

  // 1. Race (10%)
  const raceScore = fpA.race === fpB.race ? 1.0 : 0.0;

  // 2. Primary Role (15%)
  const roleScore = fpA.primaryRole === fpB.primaryRole ? 1.0 : 0.0;

  // 3. Lv40 Elements (20%)
  const lv40ElemScore = jaccardSimilarity(fpA.lv40Elements, fpB.lv40Elements);

  // 4. Lv76 Elements (15%)
  const lv76ElemScore = jaccardSimilarity(fpA.lv76Elements, fpB.lv76Elements);

  // 5. Signature Skills (20%)
  const sigSkillsScore = jaccardSimilarity(fpA.signatureSkills, fpB.signatureSkills);

  // 6. Skill Profile Lv40 (10%)
  const skillPoolScore = jaccardSimilarity(fpA.skillPool40, fpB.skillPool40);

  // 7. Progression / Ultimates (10%)
  const ultScore = (fpA.ultimateSkill === fpB.ultimateSkill ? 0.5 : 0.0) +
                   (fpA.masterUltimateSkill === fpB.masterUltimateSkill ? 0.5 : 0.0);

  const weightedSimilarity = (
    raceScore * 0.10 +
    roleScore * 0.15 +
    lv40ElemScore * 0.20 +
    lv76ElemScore * 0.15 +
    sigSkillsScore * 0.20 +
    skillPoolScore * 0.10 +
    ultScore * 0.10
  );

  let classification = 'UNIQUE';
  if (weightedSimilarity >= 1.0) {
    classification = 'DUPLICATE';
  } else if (weightedSimilarity >= 0.90) {
    classification = 'REVIEW';
  }

  return {
    classIdA,
    classIdB,
    similarity: Number(weightedSimilarity.toFixed(4)),
    classification,
    breakdown: {
      race: raceScore,
      role: roleScore,
      lv40Elem: lv40ElemScore,
      lv76Elem: lv76ElemScore,
      sigSkills: sigSkillsScore,
      skillPool: skillPoolScore,
      progression: ultScore
    }
  };
}

/**
 * Audits all 25 active classes for mechanical identity, uniqueness, and completeness.
 * @returns {object} Comprehensive Class Identity Audit Report
 */
export function auditClassIdentities() {
  const activeList = ACTIVE_CLASSES.map(c => c.id);
  const profiles = [];
  const pairwiseComparisons = [];
  let duplicateCount = 0;
  let reviewCount = 0;
  let uniqueCount = 0;

  // 1. Audit each class profile
  for (const cid of activeList) {
    const identity = getClassIdentity(cid);
    const gameplayFp = computeGameplayIdentityFingerprint(cid);
    const fullFp = computeFullIdentityFingerprint(cid);

    const hasLv40Specialization = Boolean(identity && identity.lv40Identity && identity.allowedElementsByLevel[40]);
    const hasLv76Mastery = Boolean(identity && identity.lv76Identity && identity.allowedElementsByLevel[76]);
    const hasUltimate = Boolean(identity && identity.ultimateSkill);
    const hasMasterUltimate = Boolean(identity && identity.masterUltimateSkill);

    profiles.push({
      classId: cid,
      name: identity?.name || cid,
      race: identity?.race,
      primaryRole: identity?.primaryRole,
      hasLv40Specialization,
      hasLv76Mastery,
      hasUltimate,
      hasMasterUltimate,
      gameplayFingerprint: gameplayFp,
      fullFingerprint: fullFp,
      status: (hasLv40Specialization && hasLv76Mastery && hasUltimate && hasMasterUltimate) ? 'COMPLETE' : 'INCOMPLETE'
    });
  }

  // 2. Pairwise uniqueness check across all combinations (25 * 24 / 2 = 300 pairs)
  for (let i = 0; i < activeList.length; i++) {
    for (let j = i + 1; j < activeList.length; j++) {
      const comparison = compareClassPair(activeList[i], activeList[j]);
      pairwiseComparisons.push(comparison);

      if (comparison.classification === 'DUPLICATE') duplicateCount++;
      else if (comparison.classification === 'REVIEW') reviewCount++;
      else uniqueCount++;
    }
  }

  const isAllUnique = duplicateCount === 0 && reviewCount === 0;

  return {
    totalActiveClasses: activeList.length,
    profilesCompleteCount: profiles.filter(p => p.status === 'COMPLETE').length,
    isAllUnique,
    uniquePairsCount: uniqueCount,
    reviewPairsCount: reviewCount,
    duplicatePairsCount: duplicateCount,
    status: isAllUnique ? 'PASS' : (duplicateCount > 0 ? 'FAIL' : 'REVIEW'),
    profiles,
    pairwiseComparisons
  };
}
