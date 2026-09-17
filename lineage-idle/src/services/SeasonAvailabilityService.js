/**
 * SeasonAvailabilityService.js — Centralized Season Availability and Gating Engine
 * 
 * Single Source of Truth for Season 1 Class and Content Gating.
 * Eliminates scattered level checks across the codebase.
 */

import { CanonicalClassGraph } from '../data/classes/CanonicalClassGraph.js';

export class SeasonAvailabilityService {
  static CURRENT_SEASON = 1;
  static SEASON_LEVEL_CAP = 40;

  /**
   * Returns whether a class is available in the specified season.
   * @param {string} classId
   * @param {number} [season=1]
   * @returns {{ available: boolean, reason: string|null, minLevel: number }}
   */
  static getClassAvailability(classId, season = SeasonAvailabilityService.CURRENT_SEASON) {
    const node = CanonicalClassGraph.getClassNode(classId);
    if (!node) {
      return { available: false, reason: 'unknown_class', minLevel: 1 };
    }

    // Season 1: Stages 0, 1, and 2 are fully playable (Levels 1 to 40)
    // Stage 3 (Lv 76+ 3rd Class) is canonical, but gated for Season 1
    if (season === 1) {
      if (node.stage >= 3 || node.minLevel >= 76) {
        return {
          available: false,
          reason: 'season_gate_lv76',
          minLevel: node.minLevel
        };
      }
      return {
        available: true,
        reason: null,
        minLevel: node.minLevel
      };
    }

    return {
      available: true,
      reason: null,
      minLevel: node.minLevel
    };
  }

  /**
   * Checks if a class is available in the current season.
   * @param {string} classId
   * @returns {boolean}
   */
  static isClassAvailable(classId) {
    return SeasonAvailabilityService.getClassAvailability(classId).available;
  }
}

export default SeasonAvailabilityService;
