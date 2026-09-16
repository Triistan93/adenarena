/**
 * SkillEligibility.js — Game Data Contract 3.2.2: Universal Skill Eligibility & Visibility Engine
 *
 * Single Source of Truth for skill authorization, lifecycle states, and progression gating.
 * Pure logic layer consumed by GameUI, SkillEngine, CharacterService, StateManager, CombatEngine, and Auditors.
 *
 * Four Non-Overlapping States:
 * - HIDDEN: Skill does NOT belong to the character's class lineage, branch, or archetype. (Omitted from DOM)
 * - LOCKED: Skill belongs to the character's progression path, but prerequisites (level, stage, class transfer) are not yet fulfilled.
 * - AVAILABLE: Prerequisites fulfilled; skill can be learned/equipped now with SP.
 * - LEARNED: Skill already learned and owned by character (state.skills[skillId] > 0).
 */

import { D } from '../core/GameConfig.js';
import { getClass } from '../engine/StatsEngine.js';
import { resolveCanonicalClassId, resolveCanonicalDagClassId, getCanonicalCharacterClass } from '../data/classes/class_aliases.js';
import {
  PROGRESSION_STAGES,
  STAGE_LEVEL_THRESHOLDS,
  getProgressionStage,
  isSkillNativeToClass
} from '../data/elemental/SkillProgression.js';
import {
  getAncestors,
  getDescendants,
  getLineage,
  getSuccessors,
  canAdvance,
  getClassEntity
} from '../data/elemental/ClassLineage.js';
import { CLASS_IDENTITIES } from '../data/elemental/ClassIdentity.js';
import { NATIVE_SKILL_TREES, ALL_NATIVE_SKILLS } from '../data/elemental/NativeSkillTrees.js';
import { HISTORICAL_CLASSES } from '../data/elemental/HistoricalClasses.js';
import { CANONICAL_SKILL_REGISTRY_V2 } from '../data/skills/CanonicalSkillRegistryV2.js';
import { CANONICAL_CLASS_REGISTRY_V2 } from '../data/classes/CanonicalClassRegistryV2.js';

// ─── Shared Skills Taxonomy (Lv 1–39 Generalist Pool) ──────────────────────────

export const SHARED_MAGE_SKILL_IDS = Object.freeze([
  'wind_strike',
  'flame_strike',
  'hydro_strike',
  'heal_light',
  'ice_bolt'
]);

export const SHARED_FIGHTER_SKILL_IDS = Object.freeze([
  'power_strike',
  'mortal_blow',
  'iron_punch',
  'energy_burst',
  'power_shot'
]);

export const SHARED_SKILL_IDS = Object.freeze([
  ...SHARED_MAGE_SKILL_IDS,
  ...SHARED_FIGHTER_SKILL_IDS
]);

export const SKILL_VISIBILITY_STATES = Object.freeze({
  HIDDEN: 'HIDDEN',
  LOCKED: 'LOCKED',
  AVAILABLE: 'AVAILABLE',
  LEARNED: 'LEARNED'
});

export const SKILL_DETAILED_VISIBILITY_STATES = Object.freeze({
  HIDDEN: 'HIDDEN',
  HIDDEN_FUTURE: 'HIDDEN_FUTURE',
  HIDDEN_FOREIGN: 'HIDDEN_FOREIGN',
  HIDDEN_SIBLING_BRANCH: 'HIDDEN_SIBLING_BRANCH',
  LOCKED: 'LOCKED',
  AVAILABLE: 'AVAILABLE',
  LEARNED: 'LEARNED'
});

export const HIDDEN_FUTURE = 'HIDDEN_FUTURE';
export const HIDDEN_FOREIGN = 'HIDDEN_FOREIGN';
export const HIDDEN_SIBLING_BRANCH = 'HIDDEN_SIBLING_BRANCH';


// ─── Archetype & Sibling Branch Detectors ──────────────────────────────────────

/**
 * Determines whether a class belongs to the Mage / Mystic archetype.
 * @param {string} classId
 * @returns {boolean}
 */
export function isMageClass(classId) {
  if (!classId) return false;
  const raw = String(classId).trim().toLowerCase();
  const canonical = (resolveCanonicalClassId(raw) || raw).toLowerCase();

  const def = getClass(raw) || getClass(canonical);
  if (def?.archetype) {
    const arch = def.archetype.toLowerCase();
    if (['mage', 'caster', 'healer', 'buffer', 'summoner', 'support', 'shaman', 'cleric', 'mystic'].includes(arch)) {
      return true;
    }
    if (['fighter', 'warrior', 'knight', 'rogue', 'archer', 'tank', 'berserker', 'assassin'].includes(arch)) {
      return false;
    }
  }

  const mageKeywords = [
    'mage', 'wizard', 'sorcerer', 'cleric', 'bishop', 'oracle', 'elder',
    'shaman', 'summoner', 'saint', 'hierophant', 'cardinal', 'soultaker',
    'screamer', 'archmage', 'spellsinger', 'spellhowler', 'mystic', 'warlock',
    'necromancer', 'storm_screamer', 'elemental_master', 'arcana_lord', 'spectral_master',
    'eva_saint', 'shillien_saint', 'dominator', 'doomcryer', 'soulbreaker', 'prophet', 'warcryer', 'overlord'
  ];

  return mageKeywords.some(k => raw.includes(k) || canonical.includes(k));
}

/**
 * Determines whether two classes are sibling branches (share an ancestor, but neither is ancestor of the other).
 * @param {string} classA
 * @param {string} classB
 * @returns {boolean}
 */
export function areSiblingBranches(classA, classB) {
  if (!classA || !classB || classA === classB) return false;
  const canonA = resolveCanonicalClassId(classA) || classA;
  const canonB = resolveCanonicalClassId(classB) || classB;
  if (classA === classB || (canonA && canonA === canonB)) return false;

  const getLineageAncestors = (cls, canon) => {
    let list = getAncestors(cls);
    if (list && list.length > 0) return list;
    if (canon && canon !== cls) {
      list = getAncestors(canon);
      if (list && list.length > 0) return list;
    }
    for (const c of HISTORICAL_CLASSES) {
      if (c.sourceClassId === cls || c.sourceClassId === canon || c.id === cls || c.id === canon || c.id.endsWith('_' + cls) || c.id.endsWith('_' + canon)) {
        list = getAncestors(c.id);
        if (list && list.length > 0) return list;
      }
    }
    return [];
  };

  const ancA = getLineageAncestors(classA, canonA);
  const ancB = getLineageAncestors(classB, canonB);

  if (!ancA.length || !ancB.length) return false;

  // If either is in the other's lineage, they are direct ancestor/descendant, not siblings
  if (ancA.includes(classB) || ancA.includes(canonB) || ancB.includes(classA) || ancB.includes(canonA)) {
    return false;
  }

// Sibling branches share at least one ancestor
  return ancA.some(a => ancB.includes(a));
}

/**
 * Resolves the required level for a skill specifically in the context of the given class lineage.
 * Prevents skills belonging to advanced promotions (e.g. Necromancer Lv 40) from being treated
 * as Lv 1 when another independent base class (e.g. Death Pilgrim) has a lower-tier version.
 * 
 * @param {string} classId
 * @param {string} skillId
 * @returns {number}
 */
export function getSkillUnlockLevelForClass(classId, skillId) {
  if (!classId || !skillId || !CANONICAL_CLASS_REGISTRY_V2) return 1;
  const canonical = resolveCanonicalClassId(classId) || classId;
  const v2Class = CANONICAL_CLASS_REGISTRY_V2[classId] || CANONICAL_CLASS_REGISTRY_V2[canonical];
  if (!v2Class) return 1;

  // Ultimate gating (Lv 80 / Lv 90)
  const def = typeof window !== 'undefined' ? window.EchoData?.SKILL_DEFS_ECHO?.[skillId] : null;
  if (def) {
    if (def.starRank === 5 || def.tier === 5 || def.reqLvl >= 90) return 90;
    if (def.isUltimate || def.starRank === 4 || def.tier === 4 || def.reqLvl >= 80) return 80;
  }

  // 1. Current class
  if (v2Class.skillIds?.includes(skillId)) {
    return v2Class.minLevel;
  }

  // 2. Ancestor class
  let curr = v2Class;
  const visited = new Set([curr.id]);
  while (curr.parentClass && CANONICAL_CLASS_REGISTRY_V2[curr.parentClass] && !visited.has(curr.parentClass)) {
    visited.add(curr.parentClass);
    curr = CANONICAL_CLASS_REGISTRY_V2[curr.parentClass];
    if (curr.skillIds?.includes(skillId)) {
      return curr.minLevel;
    }
  }

  // 3. Descendant classes
  const queue = [v2Class.id];
  const visitedDesc = new Set(queue);
  while (queue.length > 0) {
    const parentId = queue.shift();
    for (const candidate of Object.values(CANONICAL_CLASS_REGISTRY_V2)) {
      if (candidate.parentClass === parentId && !visitedDesc.has(candidate.id)) {
        visitedDesc.add(candidate.id);
        queue.push(candidate.id);
        if (candidate.skillIds?.includes(skillId)) {
          return candidate.minLevel;
        }
      }
    }
  }

  return 1;
}

// ─── Starter Skills Resolution ────────────────────────────────────────────────

/**
 * Dynamically resolves the canonical starter skills for a class using:
 * ClassIdentity -> base archetype -> starterSkillIds fallback.
 * @param {string} classId
 * @returns {string[]} Array of starter skill IDs
 */
export function getStarterSkillsForClass(classId) {
  if (!classId) return ['power_strike'];
  const canonical = resolveCanonicalClassId(classId) || classId;

  // 1. Check ClassIdentity.js skillPools[1]
  const identity = CLASS_IDENTITIES[canonical] || CLASS_IDENTITIES[classId];
  if (identity?.skillPools?.[1] && Array.isArray(identity.skillPools[1]) && identity.skillPools[1].length > 0) {
    return [...identity.skillPools[1]];
  }

  // 2. Check class definition starterSkills / starterSkillIds
  const classDef = getClass(classId) || getClass(canonical);
  if (Array.isArray(classDef?.starterSkillIds) && classDef.starterSkillIds.length > 0) {
    return [...classDef.starterSkillIds];
  }
  if (Array.isArray(classDef?.starterSkills) && classDef.starterSkills.length > 0) {
    return [...classDef.starterSkills];
  }

  // 3. Fallback based on base archetype / isMageClass
  return isMageClass(classId) ? ['wind_strike'] : ['power_strike'];
}

// ─── Skill Definition Lookup Helper ───────────────────────────────────────────

/**
 * Resolves a full skill definition object by ID from all authoritative registries.
 * @param {string|object} skillOrId
 * @returns {object|null}
 */
export function resolveSkillDef(skillOrId) {
  if (!skillOrId) return null;
  if (typeof skillOrId === 'object' && skillOrId.id) return skillOrId;

  const sId = String(skillOrId);
  const echoDefs = (typeof window !== 'undefined' && window.EchoData) ? window.EchoData.SKILL_DEFS_ECHO : null;
  if (echoDefs?.[sId]) return echoDefs[sId];

  if (CANONICAL_SKILL_REGISTRY_V2 && CANONICAL_SKILL_REGISTRY_V2[sId]) {
    const s = CANONICAL_SKILL_REGISTRY_V2[sId];
    return {
      id: s.id,
      name: s.name,
      type: s.type,
      tier: s.starRank || 1,
      starRank: s.starRank || 1,
      cost: s.starRank >= 4 ? 100 : (s.starRank >= 3 ? 60 : 30),
      max: 5,
      pwr: s.balance?.pwr || 20,
      baseCd: s.canonicalCooldownMs || 8000,
      mpCost: s.balance?.mpCost || 15,
      effect: s.type === 'buff' ? 'warcry' : (s.type === 'passive' ? 'stat' : (s.type === 'toggle' ? 'toggle' : (s.name.toLowerCase().includes('heal') ? 'heal' : 'dmg'))),
      icon: s.icon,
      iconGap: s.iconGap,
      iconGapReason: s.iconGapReason,
      vfxGap: s.vfxGap,
      sfxGap: s.sfxGap,
      classes: s.classes || [],
      reqLvl: 1
    };
  }

  const dDefs = D()?.SKILL_DEFS;
  if (dDefs?.[sId]) return dDefs[sId];

  const nativeDef = ALL_NATIVE_SKILLS.find(s => s.id === sId);
  if (nativeDef) return nativeDef;

  if (SHARED_MAGE_SKILL_IDS.includes(sId)) {
    return { id: sId, name: sId, type: 'magic', reqLvl: 1, availableTo: ['mage', 'wizard', 'cleric', 'oracle', 'shaman'] };
  }
  if (SHARED_FIGHTER_SKILL_IDS.includes(sId)) {
    return { id: sId, name: sId, type: 'physical', reqLvl: 1, availableTo: ['fighter', 'warrior', 'knight', 'rogue'] };
  }

  return null;
}

// ─── Progression Path & Immediate Class Compatibility ─────────────────────────

/**
 * Checks if a skill is native or directly available to the character's CURRENT class (ignoring level).
 * @param {string} classId
 * @param {object} def
 * @returns {boolean}
 */
function isSkillNativeOrAvailableNow(classId, def) {
  if (!classId || !def) return false;
  const canonical = resolveCanonicalClassId(classId) || classId;

  // Shared skills check
  if (SHARED_MAGE_SKILL_IDS.includes(def.id)) {
    return isMageClass(classId);
  }
  if (SHARED_FIGHTER_SKILL_IDS.includes(def.id)) {
    return !isMageClass(classId);
  }

  // Explicit availableTo list
  if (Array.isArray(def.availableTo) && def.availableTo.length > 0) {
    return def.availableTo.includes(classId) || def.availableTo.includes(canonical);
  }

  // Explicit nativeClasses list
  if (Array.isArray(def.nativeClasses) && def.nativeClasses.length > 0) {
    return def.nativeClasses.includes(classId) || def.nativeClasses.includes(canonical);
  }

  // Class ID equality
  if (def.classId) {
    const sCanon = resolveCanonicalClassId(def.classId) || def.classId;
    return def.classId === classId || sCanon === canonical;
  }

  // Class requirement equality
  if (def.classReq && def.classReq !== 'all' && def.classReq !== 'shared') {
    const rCanon = resolveCanonicalClassId(def.classReq) || def.classReq;
    if (def.classReq === classId || rCanon === canonical) return true;
  }

  // Explicit CLASS_SKILLS_ECHO mapping
  if (typeof window !== 'undefined' && window.EchoData?.CLASS_SKILLS_ECHO) {
    const echoSkills = window.EchoData.CLASS_SKILLS_ECHO[classId] || window.EchoData.CLASS_SKILLS_ECHO[canonical] || [];
    if (echoSkills.includes(def.id)) return true;
  }

  // Canonical V2 class skill check
  if (CANONICAL_CLASS_REGISTRY_V2) {
    if (CANONICAL_CLASS_REGISTRY_V2[classId]?.skillIds?.includes(def.id)) return true;
    if (CANONICAL_CLASS_REGISTRY_V2[canonical]?.skillIds?.includes(def.id)) return true;
  }

  // Ancestor inheritance: Promoted classes (e.g. Archmage) inherit and can learn prior stage skills (e.g. Sorcerer)
  const ancestors = getAncestors(canonical).concat(getAncestors(classId));
  const skillOwner = def.classReq || def.classId || (Array.isArray(def.nativeClasses) ? def.nativeClasses[0] : null);
  if (skillOwner && skillOwner !== 'all' && skillOwner !== 'shared') {
    const canonOwner = resolveCanonicalClassId(skillOwner) || skillOwner;
    if (ancestors.includes(canonOwner) || ancestors.includes(skillOwner)) {
      return true;
    }
  }

  return false;
}

/**
 * Verifies if a skill belongs to the canonical V2 lineage DAG of a class (class + ancestors + descendants).
 * @param {string} classId
 * @param {string} skillId
 * @returns {boolean}
 */
export function isSkillInV2Lineage(classId, skillId) {
  if (!CANONICAL_CLASS_REGISTRY_V2 || !classId || !skillId) return false;
  const canonical = resolveCanonicalClassId(classId) || classId;
  const v2Class = CANONICAL_CLASS_REGISTRY_V2[classId] || CANONICAL_CLASS_REGISTRY_V2[canonical];
  if (!v2Class) return false;

  // 1. Direct class ownership
  if (v2Class.skillIds?.includes(skillId)) return true;

  // 2. Ancestor inheritance (parentClass chain)
  let curr = v2Class;
  const visitedParents = new Set([curr.id]);
  while (curr.parentClass && CANONICAL_CLASS_REGISTRY_V2[curr.parentClass] && !visitedParents.has(curr.parentClass)) {
    visitedParents.add(curr.parentClass);
    curr = CANONICAL_CLASS_REGISTRY_V2[curr.parentClass];
    if (curr.skillIds?.includes(skillId)) return true;
  }

  // 3. Descendant promotions
  const queue = [v2Class.id];
  const visitedDesc = new Set(queue);
  while (queue.length > 0) {
    const parentId = queue.shift();
    for (const candidate of Object.values(CANONICAL_CLASS_REGISTRY_V2)) {
      if (candidate.parentClass === parentId && !visitedDesc.has(candidate.id)) {
        visitedDesc.add(candidate.id);
        queue.push(candidate.id);
        if (candidate.skillIds?.includes(skillId)) return true;
      }
    }
  }

  return false;
}

/**
 * Verifies if a skill belongs to the character's legitimate progression path (past, present, or future).
 * Rejects foreign classes, sibling branches, and opposite archetypes.
 *
 * @param {string|object} character — Character state or class ID string
 * @param {object|string} skill — Skill definition or skill ID
 * @returns {boolean}
 */
export function isSkillInProgressionPath(character, skill) {
  const def = resolveSkillDef(skill);
  if (!def) return false;

  const charClass = (typeof character === 'string') ? character : character?.class;
  if (!charClass) return false;
  const canonicalCharClass = resolveCanonicalClassId(charClass) || charClass;
  const charIsMage = isMageClass(charClass);

  // 1. Shared skills isolation
  if (SHARED_MAGE_SKILL_IDS.includes(def.id)) {
    return charIsMage;
  }
  if (SHARED_FIGHTER_SKILL_IDS.includes(def.id)) {
    return !charIsMage;
  }

  // 2. Class Identity skill pools (Active classes 1-90)
  const identity = CLASS_IDENTITIES[canonicalCharClass] || CLASS_IDENTITIES[charClass];
  if (identity?.skillPools) {
    for (const pool of Object.values(identity.skillPools)) {
      if (Array.isArray(pool) && pool.includes(def.id)) {
        return true;
      }
    }
  }

  // 3. Sibling Branch Rejection
  const skillClass = def.classId || (Array.isArray(def.nativeClasses) ? def.nativeClasses[0] : null);
  if (skillClass) {
    const canonSkillClass = resolveCanonicalClassId(skillClass) || skillClass;
    if (areSiblingBranches(canonicalCharClass, canonSkillClass)) {
      // Check if explicitly authorized via availableTo
      if (Array.isArray(def.availableTo) && (def.availableTo.includes(charClass) || def.availableTo.includes(canonicalCharClass))) {
        return true;
      }
      return false;
    }
  }

  // 4. Current class direct ownership
  if (isSkillNativeOrAvailableNow(charClass, def)) {
    return true;
  }

  // 5. Future Descendants (Future promotions in character's DAG branch)
  const descendants = getDescendants(canonicalCharClass);
  if (Array.isArray(def.availableTo)) {
    if (def.availableTo.some(c => descendants.includes(resolveCanonicalClassId(c) || c))) {
      return true;
    }
  }
  if (skillClass && descendants.includes(resolveCanonicalClassId(skillClass) || skillClass)) {
    return true;
  }

  // 6. Past Ancestors & Lineage Inheritance (Archmage inherits Sorcerer/Wizard/Mage skills)
  const ancestors = getAncestors(canonicalCharClass).concat(getAncestors(charClass));
  const skillOwnerClass = def.classReq || def.classId || (Array.isArray(def.nativeClasses) ? def.nativeClasses[0] : null);
  if (skillOwnerClass && skillOwnerClass !== 'all' && skillOwnerClass !== 'shared') {
    const canonOwner = resolveCanonicalClassId(skillOwnerClass) || skillOwnerClass;
    if (ancestors.includes(canonOwner) || ancestors.includes(skillOwnerClass)) {
      return true;
    }
  }

  if (Array.isArray(def.availableTo) && def.availableTo.some(c => c === charClass || c === canonicalCharClass)) {
    return true;
  }
  if (Array.isArray(def.inheritedBy) && def.inheritedBy.some(c => c === charClass || c === canonicalCharClass)) {
    return true;
  }

  // 8. Canonical V2 Lineage and Ancestor / Descendant progression check
  if (CANONICAL_CLASS_REGISTRY_V2) {
    const v2Class = CANONICAL_CLASS_REGISTRY_V2[charClass] || CANONICAL_CLASS_REGISTRY_V2[canonicalCharClass];
    if (v2Class) {
      if (v2Class.skillIds?.includes(def.id)) return true;

      // Ancestor inheritance (parentClass chain)
      let curr = v2Class;
      const visitedParents = new Set([curr.id]);
      while (curr.parentClass && CANONICAL_CLASS_REGISTRY_V2[curr.parentClass] && !visitedParents.has(curr.parentClass)) {
        visitedParents.add(curr.parentClass);
        curr = CANONICAL_CLASS_REGISTRY_V2[curr.parentClass];
        if (curr.skillIds?.includes(def.id)) return true;
      }

      // Descendant promotions
      const queue = [v2Class.id];
      const visitedDesc = new Set(queue);
      while (queue.length > 0) {
        const parentId = queue.shift();
        for (const candidate of Object.values(CANONICAL_CLASS_REGISTRY_V2)) {
          if (candidate.parentClass === parentId && !visitedDesc.has(candidate.id)) {
            visitedDesc.add(candidate.id);
            queue.push(candidate.id);
            if (candidate.skillIds?.includes(def.id)) return true;
          }
        }
      }
    }
  }

  return false;
}

// ─── Four-State Visibility & Availability Gate ────────────────────────────────

/**
 * Computes the fine-grained internal lifecycle visibility state for a skill on a character.
 * Returns: 'LEARNED' | 'AVAILABLE' | 'LOCKED' | 'HIDDEN_FUTURE' | 'HIDDEN_FOREIGN' | 'HIDDEN_SIBLING_BRANCH'
 *
 * Evaluates simultaneously: level + progressionStage + canonicalClass + lineage + availability.
 *
 * @param {object|string} character — Character state object { class, race, level, skills, ... }
 * @param {object|string} skill — Skill definition or ID
 * @returns {string} One of SKILL_DETAILED_VISIBILITY_STATES
 */
export function getSkillDetailedVisibility(character, skill) {
  const def = resolveSkillDef(skill);
  if (!def) return SKILL_DETAILED_VISIBILITY_STATES.HIDDEN_FOREIGN;

  const charClass = (typeof character === 'string') ? character : character?.class;
  if (!charClass) return SKILL_DETAILED_VISIBILITY_STATES.HIDDEN_FOREIGN;

  const charRace = (typeof character === 'object' && character?.race) ? character.race : null;
  const charLevel = (typeof character === 'object' && typeof character.level === 'number') ? character.level : 1;
  const charSkills = (typeof character === 'object' && character.skills) ? character.skills : {};

  // 1. LEARNED check (owned by character)
  if ((charSkills[def.id] || 0) > 0 || (def.name && (charSkills[def.name] || 0) > 0)) {
    const canonical = resolveCanonicalClassId(charClass) || charClass;
    const isV2Class = !!(CANONICAL_CLASS_REGISTRY_V2 && (CANONICAL_CLASS_REGISTRY_V2[charClass] || CANONICAL_CLASS_REGISTRY_V2[canonical]));
    if (isV2Class && !isSkillInV2Lineage(charClass, def.id)) {
      return SKILL_DETAILED_VISIBILITY_STATES.HIDDEN_FOREIGN;
    }
    return SKILL_DETAILED_VISIBILITY_STATES.LEARNED;
  }

  // 2. Foreign Archetype check
  const charIsMage = isMageClass(charClass);
  if (SHARED_MAGE_SKILL_IDS.includes(def.id) && !charIsMage) {
    return SKILL_DETAILED_VISIBILITY_STATES.HIDDEN_FOREIGN;
  }
  if (SHARED_FIGHTER_SKILL_IDS.includes(def.id) && charIsMage) {
    return SKILL_DETAILED_VISIBILITY_STATES.HIDDEN_FOREIGN;
  }

  // 3. Sibling Branch check
  const canonicalDagClass = resolveCanonicalDagClassId(charClass, charRace);
  const skillClass = def.classId || (Array.isArray(def.nativeClasses) ? def.nativeClasses[0] : null);
  if (skillClass) {
    const canonSkillClass = resolveCanonicalDagClassId(skillClass);
    if (areSiblingBranches(canonicalDagClass, canonSkillClass)) {
      const isAllowedExplicitly = Array.isArray(def.availableTo) && (def.availableTo.includes(charClass) || def.availableTo.includes(canonicalDagClass));
      if (!isAllowedExplicitly) {
        return SKILL_DETAILED_VISIBILITY_STATES.HIDDEN_SIBLING_BRANCH;
      }
    }
  }

  // 4. Progression Path check
  if (!isSkillInProgressionPath(character, def)) {
    return SKILL_DETAILED_VISIBILITY_STATES.HIDDEN_FOREIGN;
  }

  // 5. Level & Stage Gate -> HIDDEN_FUTURE (Zero vazamento para DOM)
  const classSpecificReq = getSkillUnlockLevelForClass(charClass, def.id);
  const baseReq = Number(def.requiredLevel || def.reqLvl || def.identity?.unlockLevel) || 1;
  const reqLvl = Math.max(classSpecificReq, baseReq);
  const skillStage = def.progressionStage || def.identity?.progressionStage;
  const stageReq = (skillStage && STAGE_LEVEL_THRESHOLDS[skillStage]) ? STAGE_LEVEL_THRESHOLDS[skillStage] : 1;

  if (charLevel < reqLvl || charLevel < stageReq) {
    return SKILL_DETAILED_VISIBILITY_STATES.HIDDEN_FUTURE;
  }

  // 6. Immediate Class Authorization Gate (e.g. 2nd Job skill before transfer)
  const isImmediatelyEligible = isSkillNativeOrAvailableNow(charClass, def);
  if (!isImmediatelyEligible) {
    return SKILL_DETAILED_VISIBILITY_STATES.LOCKED;
  }

  return SKILL_DETAILED_VISIBILITY_STATES.AVAILABLE;
}

/**
 * Computes the exact, non-overlapping 4-state lifecycle visibility state for a skill on a character.
 * Returns: 'HIDDEN' | 'LOCKED' | 'AVAILABLE' | 'LEARNED'
 *
 * @param {object} character — Character state object { class, level, skills, ... }
 * @param {object|string} skill — Skill definition or ID
 * @returns {string} One of SKILL_VISIBILITY_STATES
 */
export function getSkillVisibility(character, skill) {
  const detailed = getSkillDetailedVisibility(character, skill);
  if (detailed === SKILL_DETAILED_VISIBILITY_STATES.LEARNED) return SKILL_VISIBILITY_STATES.LEARNED;
  if (detailed === SKILL_DETAILED_VISIBILITY_STATES.AVAILABLE) return SKILL_VISIBILITY_STATES.AVAILABLE;
  if (detailed === SKILL_DETAILED_VISIBILITY_STATES.LOCKED) return SKILL_VISIBILITY_STATES.LOCKED;
  if (detailed === SKILL_DETAILED_VISIBILITY_STATES.HIDDEN_FUTURE) {
    // In canonical 4-state contract, skills in progression path but gated by level are classified as LOCKED
    return SKILL_VISIBILITY_STATES.LOCKED;
  }
  return SKILL_VISIBILITY_STATES.HIDDEN;
}

/**
 * Determines whether a skill is currently available to be learned or cast by the character.
 * Returns true only if visibility is AVAILABLE or LEARNED.
 *
 * @param {object} character
 * @param {object|string} skill
 * @returns {boolean}
 */
export function isSkillAvailableForCharacter(character, skill) {
  const detailed = getSkillDetailedVisibility(character, skill);
  return detailed === SKILL_DETAILED_VISIBILITY_STATES.AVAILABLE || detailed === SKILL_DETAILED_VISIBILITY_STATES.LEARNED;
}

// ─── Character Skill Partitioning & Aggregation ────────────────────────────────

/**
 * Builds the authoritative skill partition for a character's UI and engine queries.
 *
 * Architectural Invariant: Never iterates Object.values(SKILL_REGISTRY) directly.
 * Traverses: Character -> ClassIdentity -> Lineage -> Stage -> Eligibility -> Skill Pool.
 *
 * Strict Visibility Rule: HIDDEN_FUTURE, HIDDEN_FOREIGN, and HIDDEN_SIBLING_BRANCH
 * NEVER enter visibleList.
 *
 * @param {object} character
 * @returns {{ learned: object[], available: object[], locked: object[], future: object[], hidden: object[], visibleList: object[] }}
 */
export function getVisibleSkillsForCharacter(character) {
  const charClass = (typeof character === 'string') ? character : character?.class;
  const charRace = (typeof character === 'object' && character?.race) ? character.race : null;
  const canonicalClass = resolveCanonicalClassId(charClass, charRace) || charClass;
  const canonicalDagClass = resolveCanonicalDagClassId(charClass, charRace);
  const charLevel = (typeof character === 'object' && typeof character.level === 'number') ? character.level : 1;

  // Build targeted candidate list from:
  const candidateIds = new Set();

  const v2Class = CANONICAL_CLASS_REGISTRY_V2 && (CANONICAL_CLASS_REGISTRY_V2[charClass] || CANONICAL_CLASS_REGISTRY_V2[canonicalClass] || CANONICAL_CLASS_REGISTRY_V2[canonicalDagClass]);
  if (v2Class) {
    if (Array.isArray(v2Class.skillIds)) {
      for (const sid of v2Class.skillIds) candidateIds.add(sid);
    }
    // Ancestors
    let curr = v2Class;
    const visitedParents = new Set([curr.id]);
    while (curr.parentClass && CANONICAL_CLASS_REGISTRY_V2[curr.parentClass] && !visitedParents.has(curr.parentClass)) {
      visitedParents.add(curr.parentClass);
      curr = CANONICAL_CLASS_REGISTRY_V2[curr.parentClass];
      if (Array.isArray(curr.skillIds)) {
        for (const sid of curr.skillIds) candidateIds.add(sid);
      }
    }
    // Descendants
    const queue = [v2Class.id];
    const visitedDesc = new Set(queue);
    while (queue.length > 0) {
      const parentId = queue.shift();
      for (const candidate of Object.values(CANONICAL_CLASS_REGISTRY_V2)) {
        if (candidate.parentClass === parentId && !visitedDesc.has(candidate.id)) {
          visitedDesc.add(candidate.id);
          queue.push(candidate.id);
          if (Array.isArray(candidate.skillIds)) {
            for (const sid of candidate.skillIds) candidateIds.add(sid);
          }
        }
      }
    }
    if (typeof window !== 'undefined' && window.EchoData?.CLASS_SKILLS_ECHO?.[charClass]) {
      for (const sid of window.EchoData.CLASS_SKILLS_ECHO[charClass]) candidateIds.add(sid);
    }
  } else {
    // 1. Shared skills for character's archetype
    const sharedIds = isMageClass(charClass) ? SHARED_MAGE_SKILL_IDS : SHARED_FIGHTER_SKILL_IDS;
    for (const sid of sharedIds) candidateIds.add(sid);

    // 2. ClassIdentity skillPools for character's class
    const identity = CLASS_IDENTITIES[canonicalDagClass] || CLASS_IDENTITIES[canonicalClass] || CLASS_IDENTITIES[charClass];
    if (identity?.skillPools) {
      for (const pool of Object.values(identity.skillPools)) {
        if (Array.isArray(pool)) {
          for (const sid of pool) candidateIds.add(sid);
        }
      }
    }

    // 3. Native skill trees for character's class
    const nativeSkills = NATIVE_SKILL_TREES[canonicalDagClass] || NATIVE_SKILL_TREES[canonicalClass] || NATIVE_SKILL_TREES[charClass] || [];
    for (const s of nativeSkills) {
      candidateIds.add(s.id);
    }

    // 4. Lineage progression path (ancestors + current + descendants) from CLASS_SKILLS_ECHO
    if (typeof window !== 'undefined' && window.EchoData?.CLASS_SKILLS_ECHO) {
      const classSet = new Set([
        charClass,
        canonicalClass,
        canonicalDagClass,
        ...getLineage(charClass, charRace),
        ...getLineage(canonicalDagClass, charRace),
        ...getDescendants(charClass, charRace),
        ...getDescendants(canonicalDagClass, charRace)
      ]);
      for (const c of classSet) {
        const skills = window.EchoData.CLASS_SKILLS_ECHO[c] || [];
        for (const sid of skills) candidateIds.add(sid);
      }
    }
  }

  // 5. Any skills already learned on character state (for verification/safe rendering)
  if (typeof character === 'object' && character.skills) {
    const canonical = resolveCanonicalClassId(charClass) || charClass;
    const isV2Class = !!(CANONICAL_CLASS_REGISTRY_V2 && (CANONICAL_CLASS_REGISTRY_V2[charClass] || CANONICAL_CLASS_REGISTRY_V2[canonical]));
    for (const sid of Object.keys(character.skills)) {
      if (isV2Class && !isSkillInV2Lineage(charClass, sid)) {
        continue;
      }
      candidateIds.add(sid);
    }
  }

  const result = {
    learned: [],
    available: [],
    locked: [],
    future: [],
    hidden: []
  };

  for (const sId of candidateIds) {
    const def = resolveSkillDef(sId);
    if (!def) continue;

    const detailed = getSkillDetailedVisibility(character, def);
    if (detailed === SKILL_DETAILED_VISIBILITY_STATES.LEARNED) {
      result.learned.push(def);
    } else if (detailed === SKILL_DETAILED_VISIBILITY_STATES.AVAILABLE) {
      result.available.push(def);
    } else if (detailed === SKILL_DETAILED_VISIBILITY_STATES.LOCKED) {
      result.locked.push(def);
    } else if (detailed === SKILL_DETAILED_VISIBILITY_STATES.HIDDEN_FUTURE) {
      result.future.push(def);
    } else {
      result.hidden.push(def);
    }
  }

  // visibleList contains STRICTLY skills that are learned, available, or current-level locked.
  // Future skills (requiredLevel > charLevel) and hidden skills NEVER enter visibleList.
  result.visibleList = [
    ...result.learned.map(def => ({ skillId: def.id, skillDef: def, visibility: SKILL_VISIBILITY_STATES.LEARNED })),
    ...result.available.map(def => ({ skillId: def.id, skillDef: def, visibility: SKILL_VISIBILITY_STATES.AVAILABLE })),
    ...result.locked.filter(def => {
      const reqLvl = Number(def.requiredLevel || def.reqLvl || def.identity?.unlockLevel) || 1;
      return charLevel >= reqLvl;
    }).map(def => ({ skillId: def.id, skillDef: def, visibility: SKILL_VISIBILITY_STATES.LOCKED }))
  ];

  // Make result directly iterable and Array-compatible over visible skills [learned, available, locked]
  result[Symbol.iterator] = function* () {
    for (const item of this.visibleList) yield item;
  };
  result.filter = function (fn) { return this.visibleList.filter(fn); };
  result.map = function (fn) { return this.visibleList.map(fn); };
  result.forEach = function (fn) { return this.visibleList.forEach(fn); };
  result.some = function (fn) { return this.visibleList.some(fn); };
  result.find = function (fn) { return this.visibleList.find(fn); };
  result.length = result.visibleList.length;

  return result;
}

export function getLearnableSkillsForCharacter(character) {
  return getVisibleSkillsForCharacter(character).available;
}

export function getLockedSkillsForCharacter(character) {
  return getVisibleSkillsForCharacter(character).locked;
}

export function getHiddenSkillsForCharacter(character) {
  const hidden = [];
  const echoDefs = (typeof window !== 'undefined' && window.EchoData?.SKILL_DEFS_ECHO) ? window.EchoData.SKILL_DEFS_ECHO : {};
  const allIds = new Set([...Object.keys(echoDefs), ...SHARED_MAGE_SKILL_IDS, ...SHARED_FIGHTER_SKILL_IDS]);
  for (const sId of allIds) {
    const def = resolveSkillDef(sId);
    if (!def) continue;
    if (getSkillVisibility(character, def) === SKILL_VISIBILITY_STATES.HIDDEN) {
      hidden.push(def);
    }
  }
  return hidden;
}

// ─── Canonical Character Progression State ─────────────────────────────────────

/**
 * Returns the unified canonical Progression State snapshot consumed identically
 * by UI, SkillEngine, and Evolution Modal.
 *
 * @param {object} character
 * @returns {object} Canonical Progression State
 */
export function getCharacterProgressionState(character) {
  const charClass = (typeof character === 'string') ? character : character?.class;
  const level = (typeof character === 'object' && typeof character.level === 'number') ? character.level : 1;
  const race = (typeof character === 'object' && character?.race) ? character.race : null;
  const canonicalId = resolveCanonicalClassId(charClass, race) || charClass;
  const canonicalDagId = resolveCanonicalDagClassId(charClass, race);
  const stage = getProgressionStage(level);
  const stageNumber = level >= 90 ? 5 : level >= 80 ? 4 : level >= 76 ? 3 : level >= 40 ? 2 : level >= 20 ? 1 : 0;
  const lineageNode = getClassEntity(canonicalDagId, race) || getClassEntity(canonicalId) || getClass(charClass) || null;
  const availableAdvancements = canAdvance(canonicalDagId, level, race);
  const canAdvanceNow = availableAdvancements.length > 0;

  const classIdentity = CLASS_IDENTITIES[canonicalDagId] || CLASS_IDENTITIES[canonicalId] || CLASS_IDENTITIES[charClass] || null;
  const ultimateSkill = classIdentity?.ultimateSkill || null;
  const masterUltimateSkill = classIdentity?.masterUltimateSkill || null;

  const skillsByState = getVisibleSkillsForCharacter(character);
  const skillPool = [
    ...skillsByState.learned,
    ...skillsByState.available,
    ...skillsByState.locked
  ];

  const charSkills = (typeof character === 'object' && character?.skills) ? character.skills : {};
  const isUltimateUnlocked = !!(ultimateSkill && (charSkills[ultimateSkill] || 0) > 0);
  const isMasterUltimateUnlocked = !!(masterUltimateSkill && (charSkills[masterUltimateSkill] || 0) > 0);

  return {
    level,
    classId: charClass,
    canonicalClassId: canonicalDagId || canonicalId,
    stage,
    stageName: stage,
    stageNumber,
    currentStage: stageNumber,
    lineageNode,
    availableAdvancements,
    canAdvanceNow,
    skillPool,
    skillsByState,
    ultimateState: {
      ultimateSkill,
      masterUltimateSkill,
      isUltimateUnlocked,
      isMasterUltimateUnlocked,
      isUltimateEligible: level >= 80,
      isMasterUltimateEligible: level >= 90
    }
  };
}

/**
 * Normalizes and audits character skills upon save loading.
 * Removes illegally learned skills (LOCKED or HIDDEN) and refunds 100% SP safely.
 * Ensures the character has their valid starter skill equipped.
 *
 * @param {object} state — Mutable game state
 * @param {object} [callbacks] — Optional callbacks { log }
 * @returns {object} Updated state
 */
export function normalizeAndValidateSkills(state, callbacks = {}) {
  if (!state || !state.skills) return state;
  const originalSkills = { ...state.skills };
  const validSkills = {};
  let spRefunded = 0;

  for (const [sId, lvl] of Object.entries(originalSkills)) {
    if (!lvl || lvl <= 0) continue;
    const def = resolveSkillDef(sId);
    if (!def) continue;

    // Check progression path and stage/level eligibility
    const canonical = resolveCanonicalClassId(state.class) || state.class;
    const isV2Class = !!(CANONICAL_CLASS_REGISTRY_V2 && (CANONICAL_CLASS_REGISTRY_V2[state.class] || CANONICAL_CLASS_REGISTRY_V2[canonical]));
    const inV2Lineage = isSkillInV2Lineage(state.class, sId);
    const inPath = inV2Lineage || isSkillInProgressionPath(state, def);
    const reqLvl = Number(def.requiredLevel || def.reqLvl || def.identity?.unlockLevel) || 1;
    const skillStage = def.progressionStage || def.identity?.progressionStage;
    const stageReq = skillStage ? (STAGE_LEVEL_THRESHOLDS[skillStage] || 1) : reqLvl;
    const isLevelOk = (state.level || 1) >= reqLvl && (state.level || 1) >= stageReq;

    if (inPath && isLevelOk && (!isV2Class || inV2Lineage)) {
      validSkills[sId] = lvl;
    } else {
      // Skill was illegally acquired by save corruption or legacy bug
      for (let l = 0; l < lvl; l++) {
        const baseCost = def.cost || 5;
        spRefunded += Math.floor(baseCost * Math.pow(1.4, l));
      }
      if (callbacks.log) {
        callbacks.log(`🛡️ Habilidade [${def.name || sId}] foi corrigida e removida por incompatibilidade com o nível/classe atual (+${spRefunded} SP reembolsados).`, 'system');
      }
    }
  }

  // Ensure starter skill exists if character has no valid skills left
  const starterSkills = getStarterSkillsForClass(state.class);
  if (Object.keys(validSkills).length === 0) {
    starterSkills.forEach(s => { validSkills[s] = 1; });
  }

  state.skills = validSkills;
  state.sp = (state.sp || 0) + spRefunded;

  if (!state.selectedSkill || !state.skills[state.selectedSkill]) {
    state.selectedSkill = starterSkills[0] || Object.keys(state.skills)[0] || null;
  }

  const report = {
    state,
    fixed: spRefunded > 0,
    refundedSp: spRefunded,
    quarantinedCount: Object.keys(originalSkills).length - Object.keys(validSkills).length
  };
  Object.assign(report, state);
  return report;
}
