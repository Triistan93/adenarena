/**
 * ClassLineage.js — Game Data Contract 3.2: Class Progression & Lineage Graph
 * 
 * Derived progression graph built dynamically from ACTIVE_CLASSES and HISTORICAL_CLASSES.
 * Governs class transfers, ancestor/descendant traversal, level gating, and skill preservation.
 */

import { ACTIVE_CLASSES, ELEMENT_MATRIX } from './ElementMatrix.js';
import { HISTORICAL_CLASSES, HISTORICAL_CLASS_MAP } from './HistoricalClasses.js';

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
 * @returns {string|null}
 */
export function getPredecessor(classId) {
  return graphPredecessors.get(classId) || null;
}

/**
 * Retrieves all direct successors (next advancement options) for a class entity.
 * @param {string} classId
 * @returns {string[]}
 */
export function getSuccessors(classId) {
  const succSet = graphSuccessors.get(classId);
  return succSet ? Array.from(succSet) : [];
}

/**
 * Returns all ancestor class IDs ordered from root to immediate parent.
 * @param {string} classId
 * @returns {string[]}
 */
export function getAncestors(classId) {
  const ancestors = [];
  let curr = getPredecessor(classId);
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
 * @returns {string[]}
 */
export function getDescendants(classId) {
  const descendants = [];
  const queue = [...getSuccessors(classId)];
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
 * @returns {string[]}
 */
export function getLineage(classId) {
  return [...getAncestors(classId), classId];
}

/**
 * Determines whether a character of classId at currentLevel can advance to any successor class.
 * Returns an array of eligible target class objects.
 * 
 * @param {string} classId
 * @param {number} currentLevel
 * @returns {object[]} Eligible successor class objects
 */
export function canAdvance(classId, currentLevel) {
  const successors = getSuccessors(classId);
  if (successors.length === 0) return [];

  const eligible = [];
  for (const succId of successors) {
    const entity = allKnownEntities.get(succId);
    if (entity && currentLevel >= entity.requiredLevel) {
      eligible.push(entity);
    }
  }
  return eligible;
}

/**
 * Retrieves full entity information for any active or historical class.
 * @param {string} classId
 * @returns {object|null}
 */
export function getClassEntity(classId) {
  return allKnownEntities.get(classId) || null;
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
