/**
 * ElementalSkillAuditor.js — Game Data Contract 3.2.1 Pure Elemental Skill Auditor
 * 
 * Performs deterministic, read-only (Dry-Run by default) auditing of character skill configurations.
 * Evaluates:
 * - Class validity & canonical resolution
 * - Skill existence & definition lookup
 * - Reverse ownership (Native vs Shared Skills)
 * - Elemental compatibility with strict ALL TAGS rule (Array.every())
 * - Role & Tier compatibility
 * - Exception class detection (e.g., high_elf_element_weaver -> NEEDS_REVIEW, never auto-fix)
 * - VFX catalog binding & identity uniqueness
 * - Safety blocks (never reduce character to 0 skills; verify valid replacements from NATIVE_SKILL_TREES)
 * - Full before/after diff and actions generation
 */

import {
  CONTRACT_VERSION,
  BASE_ELEMENTS,
  PHYSICAL_ELEMENT,
  MAGIC_WILDCARD,
  ELEMENT_HIERARCHY,
  ALL_ELEMENTS,
  resolveBaseElement,
  expandElement,
  validateElementalTags
} from '../data/elemental/ElementHierarchy.js';

import {
  ACTIVE_CLASSES,
  ELEMENT_MATRIX,
  getActiveClass,
  isActiveClass
} from '../data/elemental/ElementMatrix.js';

import {
  ALL_NATIVE_SKILLS,
  NATIVE_SKILL_TREES,
  NATIVE_SKILLS_BY_ID,
  CANONICAL_SKILL_ROLES,
  ALL_ENDGAME_SKILLS,
  ALL_CANONICAL_ACTIVE_SKILLS,
  getAllSkillsForClass,
  getNativeSkillsByClass,
  getNativeSkillById,
  isNativeToClass
} from '../data/elemental/NativeSkillTrees.js';

import {
  getProgressionStage,
  PROGRESSION_STAGES,
  ROLE_REGISTRY,
  normalizeRole
} from '../data/elemental/SkillProgression.js';

import {
  getClassIdentity,
  getAllowedElementsByLevel,
  getSignatureSkills,
  getForbiddenElements
} from '../data/elemental/ClassIdentity.js';

import {
  getSkillVfx,
  hasSkillVfx
} from '../data/vfx/SkillVfxRegistry.js';

import {
  getSkill,
  getSkillStats
} from '../data/elemental/SkillRegistry.js';

import { CLASS_ALIASES } from '../data/classes/class_aliases.js';
import { validateElementalSkillMatrix } from './ElementalSkillMatrixValidator.js';
import { validateSkillVfx } from './SkillVfxValidator.js';

// ─── Reverse Ownership & Shared Skill Index ─────────────────────────────────
const REVERSE_OWNERSHIP_INDEX = new Map();
const DYNAMIC_SHARED_SKILLS = new Map();

// Initialize reverse index from all native active skills and endgame skills
for (const skill of [...ALL_NATIVE_SKILLS, ...ALL_ENDGAME_SKILLS]) {
  if (!REVERSE_OWNERSHIP_INDEX.has(skill.id)) {
    REVERSE_OWNERSHIP_INDEX.set(skill.id, new Set());
  }
  if (Array.isArray(skill.nativeClasses)) {
    for (const c of skill.nativeClasses) REVERSE_OWNERSHIP_INDEX.get(skill.id).add(c);
  }
  if (Array.isArray(skill.availableTo)) {
    for (const c of skill.availableTo) REVERSE_OWNERSHIP_INDEX.get(skill.id).add(c);
  }
  if (skill.classId) {
    REVERSE_OWNERSHIP_INDEX.get(skill.id).add(skill.classId);
  }
}

/**
 * Registers an authorized shared ownership mapping for a skill.
 * Allows extending shared skills dynamically while preserving strict validation.
 * @param {string} skillId
 * @param {string} classId
 */
export function registerSharedSkillOwnership(skillId, classId) {
  if (!DYNAMIC_SHARED_SKILLS.has(skillId)) {
    DYNAMIC_SHARED_SKILLS.set(skillId, new Set());
  }
  DYNAMIC_SHARED_SKILLS.get(skillId).add(classId);

  if (!REVERSE_OWNERSHIP_INDEX.has(skillId)) {
    REVERSE_OWNERSHIP_INDEX.set(skillId, new Set());
  }
  REVERSE_OWNERSHIP_INDEX.get(skillId).add(classId);
}

const CANONICAL_SHARED_MAGE_SKILL_IDS = new Set([
  'wind_strike', 'flame_strike', 'hydro_strike', 'heal_light', 'ice_bolt'
]);

const CANONICAL_SHARED_FIGHTER_SKILL_IDS = new Set([
  'power_strike', 'mortal_blow', 'iron_punch', 'energy_burst', 'power_shot'
]);

const CANONICAL_SHARED_SKILL_IDS = new Set([
  ...CANONICAL_SHARED_MAGE_SKILL_IDS,
  ...CANONICAL_SHARED_FIGHTER_SKILL_IDS
]);

/**
 * Checks if a skill is native or shared-authorized for a given class ID.
 * @param {string} skillId
 * @param {string} classId
 * @returns {{ isAllowed: boolean, ownershipType: 'NATIVE' | 'SHARED' | 'NONE' }}
 */
export function checkSkillOwnership(skillId, classId, level = 80) {
  if (CANONICAL_SHARED_SKILL_IDS.has(skillId)) {
    const raw = String(classId || '').toLowerCase();
    const isMage = raw.includes('mage') || raw.includes('wizard') || raw.includes('sorcerer') || raw.includes('cleric') || raw.includes('bishop') || raw.includes('oracle') || raw.includes('elder') || raw.includes('shaman') || raw.includes('summoner') || raw.includes('saint') || raw.includes('hierophant') || raw.includes('cardinal') || raw.includes('soultaker') || raw.includes('screamer') || raw.includes('archmage') || raw.includes('spellsinger') || raw.includes('spellhowler') || raw.includes('mystic') || raw.includes('warlock') || raw.includes('weaver') || raw.includes('necromancer');
    
    if (CANONICAL_SHARED_MAGE_SKILL_IDS.has(skillId) && !isMage) {
      return { isAllowed: false, ownershipType: 'NONE' };
    }
    if (CANONICAL_SHARED_FIGHTER_SKILL_IDS.has(skillId) && isMage) {
      return { isAllowed: false, ownershipType: 'NONE' };
    }
    return { isAllowed: true, ownershipType: 'SHARED' };
  }

  const nativeClasses = REVERSE_OWNERSHIP_INDEX.get(skillId);
  if (nativeClasses && nativeClasses.has(classId)) {
    const isDirectNative = isNativeToClass(skillId, classId);
    return {
      isAllowed: true,
      ownershipType: (nativeClasses.size > 1 && !isDirectNative) ? 'SHARED' : (isDirectNative ? 'NATIVE' : 'SHARED')
    };
  }

  // Check ClassIdentity skill pools
  const classIdentity = getClassIdentity(classId);
  if (classIdentity?.skillPools) {
    for (const [poolLvl, skills] of Object.entries(classIdentity.skillPools)) {
      if (Array.isArray(skills) && skills.includes(skillId)) {
        if (Number(poolLvl) <= level) {
          return { isAllowed: true, ownershipType: 'NATIVE' };
        }
      }
    }
  }

  return { isAllowed: false, ownershipType: 'NONE' };
}

/**
 * Resolves a raw class identifier to its canonical active class definition.
 * @param {string} rawClassId
 * @returns {object|null}
 */
export function resolveActiveClass(rawClassId) {
  if (!rawClassId || typeof rawClassId !== 'string') return null;

  // Direct active check
  if (isActiveClass(rawClassId)) {
    return getActiveClass(rawClassId);
  }

  // Normalized snake_case check
  const normalized = rawClassId.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  if (isActiveClass(normalized)) {
    return getActiveClass(normalized);
  }

  // Check aliases dictionary
  const aliased = CLASS_ALIASES[rawClassId] || CLASS_ALIASES[normalized];
  if (aliased) {
    if (isActiveClass(aliased)) return getActiveClass(aliased);
    const aliasedNorm = aliased.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    if (isActiveClass(aliasedNorm)) return getActiveClass(aliasedNorm);
    // Reverse check: find which active class maps to this alias target
    for (const act of ACTIVE_CLASSES) {
      const actAlias = CLASS_ALIASES[act.id];
      if (actAlias && actAlias.toLowerCase() === aliased.toLowerCase()) {
        return act;
      }
    }
  }

  // Reverse check across active classes for rawClassId as alias value
  for (const act of ACTIVE_CLASSES) {
    const actAlias = CLASS_ALIASES[act.id];
    if (actAlias && (actAlias.toLowerCase() === rawClassId.toLowerCase() || actAlias.toLowerCase() === normalized)) {
      return act;
    }
  }

  // Fallback: check if rawClassId matches active class name or startsWith
  for (const act of ACTIVE_CLASSES) {
    if (act.id === rawClassId || act.name.toLowerCase() === rawClassId.toLowerCase()) {
      return act;
    }
  }

  return null;
}

/**
 * Selects an optimal, deterministic substitute skill strictly from the class's native tree.
 * Priority:
 * 1. Same class native tree (NATIVE_SKILL_TREES[classId])
 * 2. Not currently equipped
 * 3. Same Tier
 * 4. Compatible Role
 * 5. Compatible Elements (ALL TAGS pass)
 * 
 * @param {string} classId
 * @param {string[]} currentlyEquippedIds
 * @param {object} targetSkillDef - The skill being replaced
 * @returns {object|null} The chosen substitute skill definition or null
 */
export function findBestSubstituteSkill(classId, currentlyEquippedIds, targetSkillDef = null, options = {}) {
  const charLevel = Number(options.level ?? 76);
  const classIdentity = getClassIdentity(classId);
  const classDef = getActiveClass(classId);
  if (!classDef) return null;

  const allowedElements = classIdentity ? getAllowedElementsByLevel(classId, charLevel) : classDef.allowedElements;
  const equippedSet = new Set(currentlyEquippedIds);
  const targetStage = targetSkillDef?.progressionStage;

  // Anti-downgrade (Section 44):
  // An Ultimate cannot be replaced by a normal skill.
  // A Master Ultimate cannot be replaced by an Ultimate or normal skill.
  let pool = getNativeSkillsByClass(classId);
  if (targetStage === 'ULTIMATE' || targetStage === 'MASTER_ULTIMATE') {
    pool = getAllSkillsForClass(classId).filter(s => s.progressionStage === targetStage);
    if (pool.length === 0) {
      return null; // CONTENT_GAP
    }
  }

  // Filter available candidates not yet equipped and matching level
  const candidates = pool.filter(s => {
    if (equippedSet.has(s.id)) return false;
    if (s.requiredLevel && charLevel < s.requiredLevel) return false;
    return true;
  });
  if (candidates.length === 0) return null;

  // Score each candidate
  let bestCandidate = null;
  let highestScore = -1;

  for (const cand of candidates) {
    // Candidates MUST pass element validation against the class at character level
    const elementPass = validateElementalTags(cand.elements, allowedElements);
    if (!elementPass) continue;

    let score = 0;
    if (targetSkillDef) {
      // Stage match priority (only when level is explicitly provided)
      if (options.level !== undefined && cand.progressionStage === targetSkillDef.progressionStage) score += 200;
      // Tier match priority
      if (cand.tier === targetSkillDef.tier) score += 100;
      // Role match priority
      if (cand.role === targetSkillDef.role || (normalizeRole(cand.role) === normalizeRole(targetSkillDef.role))) score += 50;
      // Elemental tags similarity
      if (Array.isArray(targetSkillDef.elements)) {
        const sharedTags = cand.elements.filter(e => targetSkillDef.elements.includes(e));
        score += sharedTags.length * 10;
      }
    } else {
      score = 10;
    }

    if (score > highestScore) {
      highestScore = score;
      bestCandidate = cand;
    }
  }

  return bestCandidate;
}

/**
 * Audits a character's equipped skills with forensic precision and safety boundaries.
 * 
 * @param {object} character - { id, class_id (or classId), equippedSkills: string[] | object[] }
 * @param {object} [options] - { skipContractGate: boolean, strictRoles: boolean }
 * @returns {object} JSON Contract 3.2.1 Audit Report & Plan
 */
export function auditCharacterSkills(character, options = {}) {
  // ─── Forensic Contract Gate ───────────────────────────────────────────────
  if (!options.skipContractGate) {
    const matrixCheck = validateElementalSkillMatrix();
    const vfxCheck = validateSkillVfx();
    if (!matrixCheck.valid || !vfxCheck.valid) {
      return {
        version: CONTRACT_VERSION,
        characterId: character?.id || 'unknown',
        classId: character?.class_id || character?.classId || 'unknown',
        status: 'BLOCKED',
        allowedElements: [],
        summary: { total: 0, valid: 0, invalid: 0, needsReview: 1 },
        diagnostics: [{
          skillId: null,
          code: 'CONTRACT_INVALID',
          message: 'Underlying Game Data Contract 3.2.1 matrix or VFX validation failed. Auditor execution blocked.'
        }],
        actions: { keep: [], remove: [], add: [] },
        diff: { before: [], after: [] },
        safety: { fixable: false, blocked: true, blockedReason: 'CONTRACT_INVALID' },
        needs_review: true
      };
    }
  }

  // ─── Input Validation ─────────────────────────────────────────────────────
  if (!character || typeof character !== 'object') {
    return {
      version: CONTRACT_VERSION,
      characterId: 'unknown',
      classId: 'unknown',
      status: 'BLOCKED',
      allowedElements: [],
      summary: { total: 0, valid: 0, invalid: 0, needsReview: 0 },
      diagnostics: [{ skillId: null, code: 'INVALID_INPUT', message: 'Character input must be a valid object' }],
      actions: { keep: [], remove: [], add: [] },
      diff: { before: [], after: [] },
      safety: { fixable: false, blocked: true, blockedReason: 'INVALID_INPUT' },
      needs_review: false
    };
  }

  const rawCharId = character.id || character.characterId || 'char_anonymous';
  const rawClassId = character.class_id || character.classId || character.class;
  const rawEquipped = character.equippedSkills || character.skills || [];

  if (!Array.isArray(rawEquipped)) {
    return {
      version: CONTRACT_VERSION,
      characterId: rawCharId,
      classId: rawClassId || 'unknown',
      status: 'BLOCKED',
      allowedElements: [],
      summary: { total: 0, valid: 0, invalid: 0, needsReview: 0 },
      diagnostics: [{ skillId: null, code: 'INVALID_INPUT', message: 'character.equippedSkills must be an array' }],
      actions: { keep: [], remove: [], add: [] },
      diff: { before: [], after: [] },
      safety: { fixable: false, blocked: true, blockedReason: 'INVALID_INPUT' },
      needs_review: false
    };
  }

  // Normalize equipped skill IDs (supporting both string IDs and { id: ... } objects)
  const equippedSkillIds = rawEquipped.map(s => {
    if (typeof s === 'string') return s;
    if (s && typeof s === 'object' && s.id) return s.id;
    return String(s);
  });

  // Resolve Class
  const classDef = resolveActiveClass(rawClassId);
  if (!classDef) {
    return {
      version: CONTRACT_VERSION,
      characterId: rawCharId,
      classId: rawClassId || 'unknown',
      status: 'BLOCKED',
      allowedElements: [],
      summary: { total: equippedSkillIds.length, valid: 0, invalid: equippedSkillIds.length, needsReview: 0 },
      diagnostics: [{
        skillId: null,
        code: 'UNKNOWN_CLASS',
        message: `Class identifier '${rawClassId}' cannot be resolved to any active canonical class entity.`
      }],
      actions: { keep: [], remove: [...equippedSkillIds], add: [] },
      diff: { before: [...equippedSkillIds], after: [] },
      safety: { fixable: false, blocked: true, blockedReason: 'UNKNOWN_CLASS' },
      needs_review: false
    };
  }

  const canonicalClassId = classDef.id;
  const isExceptionClass = Boolean(classDef.isException);
  const hasExplicitLevel = Boolean(options.level !== undefined || character.level !== undefined);
  const charLevel = hasExplicitLevel ? Number(options.level ?? character.level) : 76;
  const progressionStage = getProgressionStage(charLevel);
  const classIdentity = getClassIdentity(canonicalClassId);
  const allowedAtLevel = (hasExplicitLevel && classIdentity)
    ? getAllowedElementsByLevel(canonicalClassId, charLevel)
    : classDef.allowedElements;
  const maxAllowedElements = classIdentity ? getAllowedElementsByLevel(canonicalClassId, 90) : classDef.allowedElements;

  // ─── Per-Skill Evaluation ─────────────────────────────────────────────────
  const diagnostics = [];
  const validSkills = [];
  const invalidSkills = [];
  const seenSkillIds = new Set();
  const duplicateIds = new Set();

  for (const skillId of equippedSkillIds) {
    const skillDiags = [];

    // Duplicate Detection
    if (seenSkillIds.has(skillId)) {
      duplicateIds.add(skillId);
      skillDiags.push({
        skillId,
        code: 'DUPLICATE_SKILL',
        message: `Skill '${skillId}' is equipped multiple times.`
      });
    }
    seenSkillIds.add(skillId);

    // Skill Definition Lookup
    const skillDef = getNativeSkillById(skillId) || getSkill(skillId);
    if (!skillDef) {
      skillDiags.push({
        skillId,
        code: 'UNKNOWN_SKILL',
        message: `Skill '${skillId}' does not exist in any canonical skill registry.`
      });
      invalidSkills.push({ skillId, skillDef: null, diags: skillDiags });
      diagnostics.push(...skillDiags);
      continue;
    }

    // Stage & Required Level Check
    if (hasExplicitLevel && skillDef.requiredLevel && charLevel < skillDef.requiredLevel) {
      skillDiags.push({
        skillId,
        code: 'STAGE_REQUIREMENT',
        message: `Skill '${skillId}' requires level ${skillDef.requiredLevel} (${skillDef.progressionStage || 'STAGE'}). Character is Lv${charLevel} (${progressionStage}).`
      });
    }

    // Availability & Ownership Check
    const ownership = checkSkillOwnership(skillId, canonicalClassId, charLevel);
    if (!ownership.isAllowed) {
      skillDiags.push({
        skillId,
        code: 'OWNERSHIP_MISMATCH',
        message: `Skill '${skillId}' is not native or authorized for class '${canonicalClassId}'.`
      });
    } else if (hasExplicitLevel && skillDef.availableTo && Array.isArray(skillDef.availableTo) && !skillDef.availableTo.includes(canonicalClassId)) {
      skillDiags.push({
        skillId,
        code: 'AVAILABILITY_MISMATCH',
        message: `Skill '${skillId}' is not available to class '${canonicalClassId}'.`
      });
    }

    // Elemental Compatibility Check — ALL TAGS Strict Rule (.every())
    const skillElements = skillDef.elements || (skillDef.tags ? skillDef.tags : ['Physical']);
    const passesAtLevel = validateElementalTags(skillElements, allowedAtLevel);
    if (!passesAtLevel) {
      const passesAtMax = validateElementalTags(skillElements, maxAllowedElements);
      if (passesAtMax) {
        skillDiags.push({
          skillId,
          code: 'STAGE_REQUIREMENT',
          message: `Skill '${skillId}' required elements [${skillElements.join(', ')}] require higher progression stage/level. Unlocked at Lv76+. Character is Lv${charLevel} (${progressionStage}).`
        });
      } else {
        skillDiags.push({
          skillId,
          code: 'ELEMENT_MISMATCH',
          message: `Skill '${skillId}' required elements [${skillElements.join(', ')}] violate class '${canonicalClassId}' allowed elements [${allowedAtLevel.join(', ')}].`
        });
      }
    }

    // Role Validation
    if (skillDef.role) {
      const normRole = normalizeRole(skillDef.role);
      const isAllowedRole = CANONICAL_SKILL_ROLES.includes(normRole) || ROLE_REGISTRY[normRole] || CANONICAL_SKILL_ROLES.includes(skillDef.role);
      if (!isAllowedRole) {
        skillDiags.push({
          skillId,
          code: 'ROLE_MISMATCH',
          message: `Skill '${skillId}' declares unknown role '${skillDef.role}'.`
        });
      }
    }

    // Item / Book Requirements Check
    if (skillDef.bookRequirement) {
      const bookRequired = options.requireBooks || options.checkBooks || character.checkBooks || (options.hasBook === false);
      const hasBook = options.hasBook ?? character.hasUltimateBook ?? character.unlockedBooks?.includes(skillDef.bookRequirement) ?? (!bookRequired);
      if (bookRequired && !hasBook) {
        skillDiags.push({
          skillId,
          code: 'REQUIREMENT_UNMET',
          message: `Skill '${skillId}' requires item '${skillDef.bookRequirement}' (Tomo Sagrado ★★★★) to unlock.`
        });
      }
    }

    // VFX Reference Check
    if (!hasSkillVfx(skillId)) {
      skillDiags.push({
        skillId,
        code: 'MISSING_VFX',
        message: `Skill '${skillId}' has no registered VFX identity in SKILL_VFX_REGISTRY.`
      });
    }

    // Exception Class Annotation
    if (isExceptionClass) {
      skillDiags.push({
        skillId,
        code: 'EXCEPTION_CLASS',
        message: `Class '${canonicalClassId}' is flagged as isException. Requires manual designer review.`
      });
    }

    diagnostics.push(...skillDiags);

    if (skillDiags.length === 0 || (isExceptionClass && skillDiags.length === 1 && skillDiags[0].code === 'EXCEPTION_CLASS')) {
      validSkills.push({ skillId, skillDef, diags: skillDiags });
    } else {
      invalidSkills.push({ skillId, skillDef, diags: skillDiags });
    }
  }

  // ─── Fix Planning & Replacement Strategy ──────────────────────────────────
  const keepSkills = validSkills.map(v => v.skillId);
  const removeSkills = invalidSkills.map(iv => iv.skillId);
  const addSkills = [];

  // If class is an exception, NO AUTO-FIX is permitted
  let blockedReason = null;
  let isBlocked = false;
  let needsReview = isExceptionClass;

  if (isExceptionClass && invalidSkills.length > 0) {
    isBlocked = true;
    blockedReason = 'EXCEPTION_CLASS_NO_AUTOFIX';
    needsReview = true;
  }

  // Plan replacements for invalid skills
  const plannedEquipped = [...keepSkills];
  for (const inv of invalidSkills) {
    if (isBlocked) break;
    const substitute = findBestSubstituteSkill(canonicalClassId, plannedEquipped, inv.skillDef, hasExplicitLevel ? { level: charLevel } : {});
    if (substitute) {
      addSkills.push(substitute.id);
      plannedEquipped.push(substitute.id);
    } else {
      // Cannot safely replace
      isBlocked = true;
      const isUlt = inv.skillDef?.progressionStage === 'ULTIMATE' || inv.skillDef?.progressionStage === 'MASTER_ULTIMATE';
      blockedReason = isUlt ? 'CONTENT_GAP' : `NO_ELIGIBLE_NATIVE_SUBSTITUTE_FOR_${inv.skillId}`;
      break;
    }
  }

  // Safety Block: Never leave a character with 0 skills
  if (!isBlocked && plannedEquipped.length === 0) {
    isBlocked = true;
    blockedReason = 'SAFETY_BLOCK_ZERO_SKILLS';
  }

  // Calculate Overall Status
  let overallStatus = 'VALID';
  if (isBlocked) {
    overallStatus = 'BLOCKED';
  } else if (needsReview) {
    overallStatus = 'NEEDS_REVIEW';
  } else if (invalidSkills.length > 0) {
    overallStatus = 'FIXABLE';
  }

  // Generate Diff
  const diffBefore = [...equippedSkillIds];
  const diffAfter = isBlocked ? [...equippedSkillIds] : [...plannedEquipped];

  return {
    version: CONTRACT_VERSION,
    characterId: rawCharId,
    classId: canonicalClassId,
    level: charLevel,
    progressionStage,
    status: overallStatus,
    allowedElements: allowedAtLevel,
    summary: {
      total: equippedSkillIds.length,
      valid: validSkills.length,
      invalid: invalidSkills.length,
      needsReview: needsReview ? 1 : 0
    },
    diagnostics,
    actions: {
      keep: keepSkills,
      remove: isBlocked ? [] : removeSkills,
      add: isBlocked ? [] : addSkills
    },
    diff: {
      before: diffBefore,
      after: diffAfter
    },
    safety: {
      fixable: !isBlocked && invalidSkills.length > 0,
      blocked: isBlocked,
      blockedReason
    },
    needs_review: needsReview
  };
}
