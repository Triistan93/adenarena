/**
 * ClassValidationService.js — Pure Validation & Semantic Classification Service
 * 
 * Single Source of Truth for class validity, archetypes, and combat groups.
 * Replaces all legacy substring sniffing ('includes("mage")', 'class === "fighter"').
 */

import { CanonicalClassGraph } from '../data/classes/CanonicalClassGraph.js';

export class ClassValidationService {
  /**
   * Checks if an ID represents a valid node in the canonical graph.
   * @param {string} classId
   * @returns {boolean}
   */
  static isValidClassId(classId) {
    if (!classId) return false;
    return CanonicalClassGraph.hasNode(classId);
  }

  /**
   * Deterministically returns whether the class belongs to the magic archetype group.
   * Based 100% on canonical node metadata, ZERO substring sniffing.
   * @param {string} classId
   * @returns {boolean}
   */
  static isMageClass(classId) {
    if (!classId) return false;
    const node = CanonicalClassGraph.getClassNode(classId);
    if (!node) return false;
    return node.archetypeGroup === 'mage';
  }

  /**
   * Returns the macro archetype group ('fighter' | 'mage').
   * @param {string} classId
   * @returns {'fighter'|'mage'|null}
   */
  static getArchetypeGroup(classId) {
    if (!classId) return null;
    const node = CanonicalClassGraph.getClassNode(classId);
    return node ? node.archetypeGroup : null;
  }

  /**
   * Returns the canonical role of the class.
   * @param {string} classId
   * @returns {string|null}
   */
  static getClassRole(classId) {
    const node = CanonicalClassGraph.getClassNode(classId);
    return node ? node.role : null;
  }

  /**
   * Returns the stage of the class (0, 1, 2, 3).
   * @param {string} classId
   * @returns {number|null}
   */
  static getClassStage(classId) {
    const node = CanonicalClassGraph.getClassNode(classId);
    return node ? node.stage : null;
  }

  /**
   * Returns the canonical race of the class.
   * @param {string} classId
   * @returns {string|null}
   */
  static getClassRace(classId) {
    const node = CanonicalClassGraph.getClassNode(classId);
    return node ? node.race : null;
  }
}

export default ClassValidationService;
