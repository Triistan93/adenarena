/**
 * ClassLineage.js — Game Data Contract 3.2: Class Progression & Lineage Graph
 * 
 * Derived progression graph built dynamically from ACTIVE_CLASSES and HISTORICAL_CLASSES.
 * Governs class transfers, ancestor/descendant traversal, level gating, and skill preservation.
 */

import { ACTIVE_CLASSES, ELEMENT_MATRIX } from './ElementMatrix.js';
import { HISTORICAL_CLASSES, HISTORICAL_CLASS_MAP } from './HistoricalClasses.js';
import { resolveCanonicalDagClassId } from '../classes/class_aliases.js';


export const LINEAGE_LEVEL_THRESHOLDS = {
  BASE_CLASS: 1,
  FIRST_CLASS_TRANSFER: 20,
  SECOND_CLASS_TRANSFER: 40,
  THIRD_CLASS_AWAKENING: 76
};

// Build adjacency structures for the combined lineage graph
const graphPredecessors = new Map();
const graphSuccessors = new Map();
const allKnownEntities = new Map();

// Register all Active Classes
for (const cls of ACTIVE_CLASSES) {
  allKnownEntities.set(cls.id, {
    ...cls,
    lineageType: 'BASE_CLASS',
    requiredLevel: 1,
    predecessor: null,
    status: 'active'
  });
  graphSuccessors.set(cls.id, new Set());
}

// Register all Historical Classes
for (const cls of HISTORICAL_CLASSES) {
  allKnownEntities.set(cls.id, cls);
  if (!graphSuccessors.has(cls.id)) {
    graphSuccessors.set(cls.id, new Set());
  }
}

// Link graph edges
for (const cls of HISTORICAL_CLASSES) {
  if (cls.predecessor) {
    graphPredecessors.set(cls.id, cls.predecessor);
    if (!graphSuccessors.has(cls.predecessor)) {
      graphSuccessors.set(cls.predecessor, new Set());
    }
    graphSuccessors.get(cls.predecessor).add(cls.id);
  }
  if (Array.isArray(cls.successors)) {
    for (const succ of cls.successors) {
      graphSuccessors.get(cls.id).add(succ);
      if (!graphPredecessors.has(succ)) {
        graphPredecessors.set(succ, cls.id);
      }
    }
  }
}

// Sync predecessors and advancement metadata into allKnownEntities
for (const [entityId, predId] of graphPredecessors.entries()) {
  const entity = allKnownEntities.get(entityId);
  if (entity) {
    entity.predecessor = predId;
    if (entityId === 'orc_shaman') {
      entity.lineageType = 'FIRST_CLASS_TRANSFER';
      entity.requiredLevel = 20;
    }
  }
}

/**
 * Retrieves the direct predecessor of a class entity.
 * @param {string} classId
 * @param {string} [race]
 * @returns {string|null}
 */
export function getPredecessor(classId, race = null) {
  const canonId = resolveCanonicalDagClassId(classId, race);
  return graphPredecessors.get(canonId) || graphPredecessors.get(classId) || null;
}

/**
 * Retrieves all direct successors (next advancement options) for a class entity.
 * @param {string} classId
 * @param {string} [race]
 * @returns {string[]}
 */
export function getSuccessors(classId, race = null) {
  const canonId = resolveCanonicalDagClassId(classId, race);
  const succSet = graphSuccessors.get(canonId) || graphSuccessors.get(classId);
  const result = succSet ? Array.from(succSet) : [];

  // Also include direct children from CLASSES_ECHO if not already present
  const echoClasses = (typeof window !== 'undefined' && window.EchoData?.CLASSES_ECHO) ? window.EchoData.CLASSES_ECHO : null;
  if (echoClasses) {
    const shortId = String(classId || '').replace(/^[a-z]+_/, '');
    for (const [echoId, echoDef] of Object.entries(echoClasses)) {
      if (!echoDef || !echoDef.parent) continue;
      if (echoDef.race && race && echoDef.race !== race) continue;
      if (echoDef.parent === classId || echoDef.parent === shortId || echoDef.parent === canonId) {
        const canonSuccId = resolveCanonicalDagClassId(echoId, race || echoDef.race) || echoId;
        if (!result.includes(canonSuccId) && !result.includes(echoId)) {
          result.push(canonSuccId);
        }
      }
    }
  }

  return result;
}

/**
 * Returns all ancestor class IDs ordered from root to immediate parent.
 * @param {string} classId
 * @param {string} [race]
 * @returns {string[]}
 */
export function getAncestors(classId, race = null) {
  const canonId = resolveCanonicalDagClassId(classId, race);
  const ancestors = [];
  let curr = getPredecessor(canonId);
  const visited = new Set();
  while (curr && !visited.has(curr)) {
    visited.add(curr);
    ancestors.unshift(curr);
    curr = getPredecessor(curr);
  }
  return ancestors;
}

/**
 * Returns all descendant class IDs (direct and indirect) branching from classId.
 * @param {string} classId
 * @param {string} [race]
 * @returns {string[]}
 */
export function getDescendants(classId, race = null) {
  const canonId = resolveCanonicalDagClassId(classId, race);
  const descendants = [];
  const queue = [...getSuccessors(canonId)];
  const visited = new Set(queue);

  while (queue.length > 0) {
    const node = queue.shift();
    descendants.push(node);
    for (const next of getSuccessors(node)) {
      if (!visited.has(next)) {
        visited.add(next);
        queue.push(next);
      }
    }
  }
  return descendants;
}

/**
 * Returns the complete progression lineage from root ancestor up to classId.
 * @param {string} classId
 * @param {string} [race]
 * @returns {string[]}
 */
export function getLineage(classId, race = null) {
  const canonId = resolveCanonicalDagClassId(classId, race);
  return [...getAncestors(canonId), canonId];
}

/**
 * Determines whether a character of classId at currentLevel can advance to any successor class.
 * Returns an array of eligible target class objects.
 * 
 * @param {string|object} classId
 * @param {number} [currentLevel]
 * @param {string} [race]
 * @returns {object[]} Eligible successor class objects
 */
export function canAdvance(classId, currentLevel, race = null) {
  if (typeof classId === 'object' && classId !== null) {
    race = race || classId.race;
    currentLevel = typeof currentLevel === 'number' ? currentLevel : classId.level;
    classId = classId.class;
  }
  const successors = getSuccessors(classId, race);
  if (successors.length === 0) return [];

  const eligible = [];
  const canonId = resolveCanonicalDagClassId(classId, race);
  const shortId = String(classId || '').replace(/^[a-z]+_/, '');
  const echoClasses = (typeof window !== 'undefined' && window.EchoData?.CLASSES_ECHO) ? window.EchoData.CLASSES_ECHO : null;

  for (const succId of successors) {
    const entity = allKnownEntities.get(succId);
    if (entity && currentLevel >= entity.requiredLevel) {
      eligible.push(entity);
    } else if (!entity && echoClasses) {
      // Find definition in echoClasses
      const echoDef = echoClasses[succId] || Object.values(echoClasses).find(c => c.name?.toLowerCase().replace(/[^a-z]/g, '_') === succId);
      if (echoDef) {
        const requiredLevel = echoDef.stage === 1 ? 20 : echoDef.stage === 2 ? 40 : echoDef.stage === 3 ? 76 : 1;
        if (currentLevel >= requiredLevel) {
          eligible.push({
            id: succId,
            name: echoDef.name || succId,
            race: echoDef.race || race || 'Human',
            lineageType: echoDef.stage === 1 ? 'FIRST_CLASS_TRANSFER' : echoDef.stage === 2 ? 'SECOND_CLASS_TRANSFER' : 'THIRD_CLASS_AWAKENING',
            requiredLevel,
            predecessor: classId,
            sourceClassId: succId,
            status: 'echo'
          });
        }
      }
    }
  }
  return eligible;
}

/**
 * Retrieves full entity information for any active or historical class.
 * @param {string} classId
 * @param {string} [race]
 * @returns {object|null}
 */
export function getClassEntity(classId, race = null) {
  const canonId = resolveCanonicalDagClassId(classId, race);
  return allKnownEntities.get(canonId) || allKnownEntities.get(classId) || null;
}

/**
 * Returns total count of lineage relations (edges in the progression DAG).
 * @returns {number}
 */
export function getLineageRelationsCount() {
  let count = 0;
  for (const succs of graphSuccessors.values()) {
    count += succs.size;
  }
  return count;
}
