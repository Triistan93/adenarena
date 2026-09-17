/**
 * ClassSaveMigrator.js — One-Way Legacy Profile & Save State Migrator
 * 
 * Strict compliance with User Directive 12 & 13:
 * Pipeline: OLD SAVE -> MIGRATOR -> CANONICAL SAVE -> NORMAL GAME
 * Eliminates runtime alias fallback in game logic.
 */

import { CLASS_SAVE_MIGRATION_MAP } from './ClassSaveMigrationMap.js';
import { CanonicalClassGraph } from '../data/classes/CanonicalClassGraph.js';

export class ClassSaveMigrator {
  /**
   * Migrates a loaded character state object in-place to canonical class IDs.
   * @param {Object} state — Mutable game state
   * @returns {{ migrated: boolean, originalClass: string|null, canonicalClass: string|null, log: string[] }}
   */
  static migrateState(state) {
    if (!state || typeof state !== 'object') {
      return { migrated: false, originalClass: null, canonicalClass: null, log: [] };
    }

    const log = [];
    let migrated = false;
    const rawClass = state.class;

    if (rawClass) {
      const mapping = CLASS_SAVE_MIGRATION_MAP[rawClass] || CLASS_SAVE_MIGRATION_MAP[String(rawClass).toLowerCase()];
      if (mapping) {
        if (mapping.canonicalId !== rawClass) {
          state.class = mapping.canonicalId;
          migrated = true;
          log.push(`[ClassSaveMigrator] Migrated main class "${rawClass}" -> "${mapping.canonicalId}" (${mapping.confidence}: ${mapping.reason})`);
        }
      } else {
        log.push(`[MIGRATION CONFLICT] Unrecognized legacy class ID: "${rawClass}". No unambiguous canonical mapping found.`);
      }
    }

    // Migrate subclasses if present
    if (Array.isArray(state.subclasses)) {
      state.subclasses.forEach((sub, idx) => {
        if (sub && sub.classId) {
          const subMapping = CLASS_SAVE_MIGRATION_MAP[sub.classId] || CLASS_SAVE_MIGRATION_MAP[String(sub.classId).toLowerCase()];
          if (subMapping && subMapping.canonicalId !== sub.classId) {
            const oldId = sub.classId;
            sub.classId = subMapping.canonicalId;
            migrated = true;
            log.push(`[ClassSaveMigrator] Migrated subclass #${idx} "${oldId}" -> "${subMapping.canonicalId}" (${subMapping.confidence}: ${subMapping.reason})`);
          }
        }
      });
    }

    // Verify canonical existence
    if (state.class && !CanonicalClassGraph.hasNode(state.class)) {
      log.push(`[MIGRATION CONFLICT] State class "${state.class}" is not a node in CanonicalClassGraph.`);
    }

    return {
      migrated,
      originalClass: rawClass,
      canonicalClass: state.class,
      log
    };
  }
}

export default ClassSaveMigrator;
