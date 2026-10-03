/**
 * SeasonAvailabilityService.js — Centralized Season Availability and Gating Engine
 * 
 * Single Source of Truth for Season 1 Class and Content Gating.
 * Eliminates scattered level checks across the codebase.
 */

import { CanonicalClassGraph } from '../data/classes/CanonicalClassGraph.js';
import { getCurrentSeasonId } from '../core/SeasonConfig.js';

export class SeasonAvailabilityService {
  static CURRENT_SEASON = 1;
  static SEASON_LEVEL_CAP = 40;

  /**
   * Returns whether a class is available in the specified season.
   * @param {string} classId
   * @param {number} [season=1]
   * @returns {{ available: boolean, reason: string|null, minLevel: number }}
   */
  static getClassAvailability(classId, season = null) {
    const node = CanonicalClassGraph.getClassNode(classId);
    if (!node) {
      return { available: false, reason: 'unknown_class', minLevel: 1 };
    }

    const effectiveSeason = (season !== null && season !== undefined)
      ? Number(season)
      : getCurrentSeasonId();

    // Seasons 1 and 2 stop before the level-76 third class; Season 3 releases it.
    if (effectiveSeason < 3) {
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
