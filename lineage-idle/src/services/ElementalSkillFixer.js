/**
 * ElementalSkillFixer.js — Game Data Contract 3.2.1 Atomic Skill Fixer & Safe Rollback Engine
 * 
 * Executes atomic skill remediation according to an approved audit plan:
 * 1. Pre-fix verification and immutability snapshot
 * 2. Strict replacement application from NATIVE_SKILL_TREES[classId]
 * 3. Mandatory post-fix re-audit
 * 4. Automatic atomic rollback if post-audit detects any remaining violation or invalid state
 * 5. Zero accidental skill loss and zero unauthorized modification of game truth
 */

import { auditCharacterSkills } from './ElementalSkillAuditor.js';
import { validateElementalSkillMatrix } from './ElementalSkillMatrixValidator.js';
import { validateSkillVfx } from './SkillVfxValidator.js';

/**
 * Deep clones an object safely.
 * @param {*} obj
 * @returns {*}
 */
function cloneState(obj) {
  if (typeof structuredClone === 'function') {
    return structuredClone(obj);
  }
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Restores a character object to a previous snapshot state.
 * @param {object} character
 * @param {object} snapshot
 */
function restoreSnapshot(character, snapshot) {
  for (const key of Object.keys(character)) {
    delete character[key];
  }
  Object.assign(character, cloneState(snapshot));
}

/**
 * Applies a verified audit fix plan to a character atomically.
 * 
 * @param {object} character - Mutable character object
 * @param {object} [options] - { dryRun: boolean, plan: object, skipContractGate: boolean }
 * @returns {object} Fix operation result with certificate or rollback reason
 */
export function applySkillFix(character, options = {}) {
  // ─── 1. Contract Gatekeeper ───────────────────────────────────────────────
  if (!options.skipContractGate) {
    const matrixCheck = validateElementalSkillMatrix();
    const vfxCheck = validateSkillVfx();
    if (!matrixCheck.valid || !vfxCheck.valid) {
      return {
        success: false,
        fixed: false,
        rolledBack: false,
        status: 'BLOCKED',
        reason: 'CONTRACT_INVALID',
        message: 'Underlying Game Data Contract 3.2.1 is invalid or corrupted. Fix execution is blocked.'
      };
    }
  }

  // ─── 2. Initial Audit & Plan Resolution ───────────────────────────────────
  const preAudit = options.plan || auditCharacterSkills(character, options);

  // If already completely valid
  if (preAudit.status === 'VALID' && preAudit.summary.invalid === 0) {
    return {
      success: true,
      fixed: false,
      rolledBack: false,
      status: 'VALID',
      message: 'Character skills are already valid. No fix required.',
      preAudit,
      postAudit: preAudit,
      diff: preAudit.diff
    };
  }

  // If blocked by safety rules or exception class
  if (preAudit.safety.blocked) {
    return {
      success: false,
      fixed: false,
      rolledBack: false,
      status: 'BLOCKED',
      reason: preAudit.safety.blockedReason || 'SAFETY_BLOCK',
      message: `Correction blocked by safety policy: ${preAudit.safety.blockedReason}`,
      preAudit,
      diff: preAudit.diff
    };
  }

  // Dry Run check
  if (options.dryRun) {
    return {
      success: true,
      fixed: false,
      dryRun: true,
      status: 'DRY_RUN_PLAN_READY',
      plan: preAudit.actions,
      diff: preAudit.diff,
      preAudit
    };
  }

  // ─── 3. Immutability Snapshot for Rollback ─────────────────────────────────
  const snapshot = cloneState(character);

  try {
    // ─── 4. Atomic Application ──────────────────────────────────────────────
    const targetEquipped = [...preAudit.diff.after];

    if (Array.isArray(character.equippedSkills)) {
      character.equippedSkills = targetEquipped;
    } else if (Array.isArray(character.skills)) {
      character.skills = targetEquipped;
    } else if (character.skills && typeof character.skills === 'object') {
      // Map dictionary format
      const newSkillsDict = {};
      for (const sId of targetEquipped) {
        newSkillsDict[sId] = character.skills[sId] || 1;
      }
      character.skills = newSkillsDict;
      character.equippedSkills = targetEquipped;
    } else {
      character.equippedSkills = targetEquipped;
    }

    // ─── 5. Mandatory Immediate Re-Audit ────────────────────────────────────
    const postAudit = auditCharacterSkills(character, options);

    // Rollback Condition: Re-audit fails, reports invalid skills, or triggers safety block
    const isReAuditValid = postAudit.status === 'VALID' &&
      postAudit.summary.invalid === 0 &&
      !postAudit.safety.blocked;

    if (!isReAuditValid) {
      // Execute Rollback
      restoreSnapshot(character, snapshot);
      return {
        success: false,
        fixed: false,
        rolledBack: true,
        status: 'ROLLBACK_TRIGGERED',
        reason: 'RE_AUDIT_FAILED',
        message: 'Post-fix re-audit detected remaining violations. Atomic rollback executed.',
        preAudit,
        postAudit,
        diff: preAudit.diff
      };
    }

    // ─── 6. Fix Successful and Certified ────────────────────────────────────
    return {
      success: true,
      fixed: true,
      rolledBack: false,
      status: 'SUCCESS',
      message: 'Character skills repaired atomically and certified by post-fix re-audit.',
      preAudit,
      postAudit,
      diff: preAudit.diff
    };
  } catch (err) {
    // Any unhandled exception triggers immediate atomic rollback
    restoreSnapshot(character, snapshot);
    return {
      success: false,
      fixed: false,
      rolledBack: true,
      status: 'ROLLBACK_TRIGGERED',
      reason: 'EXCEPTION_THROWN',
      message: `Unexpected exception during fix application: ${err.message}. Atomic rollback executed.`,
      error: err.message
    };
  }
}
