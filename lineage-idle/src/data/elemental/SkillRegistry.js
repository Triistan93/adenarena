/**
 * SkillRegistry.js — Game Data Contract 3.2: Universal Skill Index & Catalog
 * 
 * Official central registry cataloging both active native skills (100 slots across 25 classes)
 * and historical class skill instances from CLASSES_ECHO.
 * 
 * Distinguishes:
 * - Skill Definition: Canonical entity identity
 * - Skill Class Instance: Implementation of a skill within a specific class context
 * - Category: ACTIVE, HISTORICAL, SHARED
 */

import { CLASSES_ECHO } from '../classes/classes_echo_defs.js';
import { ALL_NATIVE_SKILLS, NATIVE_SKILL_TREES, NATIVE_SKILLS_BY_ID } from './NativeSkillTrees.js';

// Index structures
const activeSkillsMap = new Map();
const historicalInstances = [];
const instancesBySkillId = new Map();
const instancesByClassId = new Map();
const uniqueDefinitions = new Map();

// 1. Ingest Active Skills
for (const skill of ALL_NATIVE_SKILLS) {
  const activeDef = {
    ...skill,
    category: 'ACTIVE',
    instanceCount: 1
  };
  activeSkillsMap.set(skill.id, activeDef);
  uniqueDefinitions.set(skill.id, activeDef);

  instancesBySkillId.set(skill.id, [{
    skillId: skill.id,
    classId: skill.classId,
    sourceSkillName: skill.name,
    tier: skill.tier,
    role: skill.role,
    tags: skill.tags,
    elements: skill.elements,
    vfxId: skill.vfxId,
    category: 'ACTIVE'
  }]);
}

// 2. Ingest Historical Classes Skills from CLASSES_ECHO
if (CLASSES_ECHO && typeof CLASSES_ECHO === 'object') {
  for (const [classKey, classObj] of Object.entries(CLASSES_ECHO)) {
    if (!classObj || !Array.isArray(classObj.skills)) continue;

    for (const s of classObj.skills) {
      if (!s || !s.name) continue;
      const normalizedId = s.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

      const instance = {
        skillId: normalizedId,
        classId: classKey,
        sourceSkillName: s.name,
        type: s.type || 'Ativo',
        rarity: s.rarity || '1★',
        effect: s.effect || '',
        cooldown: s.cooldown || '',
        desc: s.desc || '',
        category: 'HISTORICAL'
      };

      historicalInstances.push(instance);

      // Track by class
      if (!instancesByClassId.has(classKey)) {
        instancesByClassId.set(classKey, []);
      }
      instancesByClassId.get(classKey).push(instance);

      // Track instances by skill ID
      if (!instancesBySkillId.has(normalizedId)) {
        instancesBySkillId.set(normalizedId, []);
      }
      instancesBySkillId.get(normalizedId).push(instance);

      // Update definition registry
      if (!uniqueDefinitions.has(normalizedId)) {
        uniqueDefinitions.set(normalizedId, {
          id: normalizedId,
          name: s.name,
          type: s.type || 'Ativo',
          category: 'HISTORICAL',
          instanceCount: 1
        });
      } else {
        const def = uniqueDefinitions.get(normalizedId);
        def.instanceCount = (def.instanceCount || 1) + 1;
        if (def.category === 'ACTIVE') {
          def.category = 'SHARED';
        }
      }
    }
  }
}

/**
 * Retrieves a skill definition by ID (checks active first, then historical/shared).
 * @param {string} skillId
 * @returns {object|null}
 */
export function getSkill(skillId) {
  return uniqueDefinitions.get(skillId) || null;
}

/**
 * Retrieves all skills belonging to a given class ID.
 * Returns native active skills if classId is an active class, or historical instances if historical.
 * @param {string} classId
 * @returns {object[]}
 */
export function getSkillsByClass(classId) {
  if (NATIVE_SKILL_TREES[classId]) {
    return NATIVE_SKILL_TREES[classId];
  }
  return instancesByClassId.get(classId) || [];
}

/**
 * Returns all 100 active skills.
 * @returns {object[]}
 */
export function getActiveSkills() {
  return ALL_NATIVE_SKILLS;
}

/**
 * Returns all historical skill instances.
 * @returns {object[]}
 */
export function getHistoricalSkills() {
  return historicalInstances;
}

/**
 * Returns all class instances where a specific skill appears.
 * @param {string} skillId
 * @returns {object[]}
 */
export function getSkillInstances(skillId) {
  return instancesBySkillId.get(skillId) || [];
}

/**
 * Returns statistical counters verifying catalog numbers.
 * @returns {object}
 */
export function getSkillStats() {
  let sharedCount = 0;
  for (const def of uniqueDefinitions.values()) {
    if (def.category === 'SHARED') sharedCount++;
  }

  return {
    activeSkillsCount: ALL_NATIVE_SKILLS.length,
    historicalInstancesCount: historicalInstances.length,
    uniqueDefinitionsCount: uniqueDefinitions.size,
    sharedCount
  };
}
