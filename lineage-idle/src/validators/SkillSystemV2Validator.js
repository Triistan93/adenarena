/**
 * SkillSystemV2Validator.js — Comprehensive Auditor & Integrity Validator for Skill System V2
 * 
 * Lineage II Essence — Celestial Destiny (Patch 3629, 29/07/2026)
 * Major Version 2 Authority Auditor
 */

import { CANONICAL_SKILL_REGISTRY_V2 } from '../data/skills/CanonicalSkillRegistryV2.js';
import { CANONICAL_CLASS_REGISTRY_V2 } from '../data/classes/CanonicalClassRegistryV2.js';
import { migrateCharacterSave, calculateHistoricalSpSpent } from '../services/SkillMigrationService.js';

export class SkillSystemV2Validator {
  /**
   * Performs a complete audit of the Canonical V2 catalogs.
   * @returns {Object} Full audit report with status, metrics, and error details
   */
  static validateCanonicalCatalog() {
    const errors = [];
    const warnings = [];

    const totalSkills = Object.keys(CANONICAL_SKILL_REGISTRY_V2).length;
    const totalClasses = Object.keys(CANONICAL_CLASS_REGISTRY_V2).length;

    // 1. Lineage and Stage Distribution
    const lineages = new Set();
    const stageCounts = { BASE: 0, FIRST_CLASS: 0, SECOND_CLASS: 0, THIRD_CLASS: 0 };

    for (const [cId, cls] of Object.entries(CANONICAL_CLASS_REGISTRY_V2)) {
      if (cls.lineageId) lineages.add(cls.lineageId);
      if (cls.stageName && stageCounts[cls.stageName] !== undefined) {
        stageCounts[cls.stageName]++;
      } else {
        errors.push(`Class ${cId} has invalid stageName: ${cls.stageName}`);
      }

      // Check parent DAG edge
      if (cls.parentClass && !CANONICAL_CLASS_REGISTRY_V2[cls.parentClass]) {
        errors.push(`Class ${cId} references missing parentClass: ${cls.parentClass}`);
      }

      // Verify skills belong to V2 registry
      if (!Array.isArray(cls.skillIds) || cls.skillIds.length === 0) {
        errors.push(`Class ${cId} has no skills registered`);
      } else {
        for (const sId of cls.skillIds) {
          if (!CANONICAL_SKILL_REGISTRY_V2[sId]) {
            errors.push(`Class ${cId} references unregistered skillId: ${sId}`);
          }
        }
      }
    }

    if (lineages.size < 46) {
      errors.push(`Expected 46 lineages, found ${lineages.size}`);
    }

    // 2. Audit Skills: 0 Silent Gaps
    let iconGaps = 0;
    let vfxGaps = 0;
    let sfxGaps = 0;
    const typeDistribution = {};

    for (const [sId, s] of Object.entries(CANONICAL_SKILL_REGISTRY_V2)) {
      if (!s.id || s.id !== sId) {
        errors.push(`Skill key mismatch: key=${sId}, id=${s.id}`);
      }
      if (!s.name) errors.push(`Skill ${sId} is missing name`);
      if (!s.type) errors.push(`Skill ${sId} is missing type`);
      typeDistribution[s.type] = (typeDistribution[s.type] || 0) + 1;

      // Icon Gap Classification
      if (s.iconGap === undefined || s.iconGap === null) {
        errors.push(`Skill ${sId} has silent icon gap (iconGap boolean undefined)`);
      } else if (s.iconGap === true) {
        iconGaps++;
        if (!s.iconGapReason) {
          errors.push(`Skill ${sId} is flagged with iconGap=true but missing iconGapReason`);
        }
      }

      // VFX Gap Classification
      if (s.vfxGap === undefined || s.vfxGap === null) {
        errors.push(`Skill ${sId} has silent VFX gap (vfxGap boolean undefined)`);
      } else if (s.vfxGap === true) {
        vfxGaps++;
      }

      // SFX Gap Classification
      if (s.sfxGap === undefined || s.sfxGap === null) {
        errors.push(`Skill ${sId} has silent SFX gap (sfxGap boolean undefined)`);
      } else if (s.sfxGap === true) {
        sfxGaps++;
      }

      // Balance & Cooldown presence
      if (!s.balance || typeof s.balance.pwr !== 'number' || typeof s.balance.mpCost !== 'number') {
        errors.push(`Skill ${sId} is missing valid balance profile`);
      }
      if (!s.canonicalCooldownMs) {
        warnings.push(`Skill ${sId} has missing or 0 canonicalCooldownMs`);
      }
    }

    return {
      valid: errors.length === 0,
      timestamp: Date.now(),
      metrics: {
        totalSkills,
        totalClasses,
        totalLineages: lineages.size,
        stageCounts,
        typeDistribution,
        auditedGaps: {
          iconGaps,
          vfxGaps,
          sfxGaps
        }
      },
      errors,
      warnings
    };
  }

  /**
   * Validates deterministic save migration and historical SP refund math.
   * @param {Object} rawFixture 
   * @returns {Object} Verification result
   */
  static validateSaveMigration(rawFixture) {
    const originalSp = rawFixture.sp || 0;
    const originalSkills = { ...(rawFixture.skills || {}) };

    const stateToMigrate = JSON.parse(JSON.stringify(rawFixture));
    const ledger = migrateCharacterSave(stateToMigrate);

    // Verify version updated
    const versionOk = stateToMigrate.skillSystemVersion === 2;

    // Verify mathematical SP refund accuracy
    let expectedRefund = 0;
    for (const item of ledger.refunds) {
      const calculated = calculateHistoricalSpSpent(5, item.oldRank);
      if (calculated !== item.spRefunded) {
        return {
          valid: false,
          error: `SP refund mismatch for ${item.oldSkillId}: expected ${calculated}, got ${item.spRefunded}`
        };
      }
      expectedRefund += item.spRefunded;
    }

    const spOk = stateToMigrate.sp === (originalSp + expectedRefund);
    const ledgerOk = ledger.totalSpRefunded === expectedRefund;

    return {
      valid: versionOk && spOk && ledgerOk,
      ledger,
      originalSkills,
      migratedSkills: stateToMigrate.skills,
      spGained: expectedRefund,
      finalSp: stateToMigrate.sp
    };
  }
}
