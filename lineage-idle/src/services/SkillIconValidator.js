/**
 * SkillIconValidator.js — Forensic Validator and Auditor for Skill Icons
 *
 * Game Data Contract 3.3.0: Icon Uniqueness & Semantic Asset Audit
 *
 * Validates:
 * - Every skill has an iconId and iconPath
 * - Target asset file exists in the filesystem
 * - Detects suspicious collisions across distinct class skills
 * - Classifies into: UNIQUE, INTENTIONAL_SHARED, SUSPICIOUS, MISSING, WRONG
 * - Produces comprehensive Skill Icon Audit Reports
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SKILL_ICON_REGISTRY, ICON_STATUS, getSkillIcon } from './SkillIconRegistry.js';
import { SHARED_SKILL_IDS } from './SkillEligibility.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..', '..');

/**
 * Checks if a relative public asset file exists on disk.
 * @param {string} assetPath e.g. '/assets/skills/icons/flame_strike.png'
 * @returns {boolean}
 */
export function doesAssetExist(assetPath) {
  if (!assetPath || typeof assetPath !== 'string') return false;
  const clean = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;
  const fullPath = path.join(rootDir, 'public', clean);
  return fs.existsSync(fullPath);
}

/**
 * Audits a single skill icon registration.
 *
 * @param {string} skillId
 * @param {object} [def]
 * @returns {{ skillId: string, iconId: string, iconPath: string, exists: boolean, status: string, duplicateWith: string[] }}
 */
export function auditSkillIcon(skillId, def = null) {
  const iconData = getSkillIcon(skillId, def);
  const exists = doesAssetExist(iconData.iconPath);

  if (!iconData.iconId || !iconData.iconPath) {
    return {
      skillId,
      iconId: iconData.iconId || 'NONE',
      iconPath: iconData.iconPath || 'NONE',
      exists: false,
      status: ICON_STATUS.WRONG,
      duplicateWith: []
    };
  }

  if (!exists) {
    return {
      skillId,
      iconId: iconData.iconId,
      iconPath: iconData.iconPath,
      exists: false,
      status: ICON_STATUS.MISSING,
      duplicateWith: []
    };
  }

  return {
    skillId,
    iconId: iconData.iconId,
    iconPath: iconData.iconPath,
    exists: true,
    status: iconData.status || ICON_STATUS.UNIQUE,
    duplicateWith: []
  };
}

/**
 * Audits all skills across the provided skill catalog or ALL_LOADED_SKILLS.
 *
 * @param {Map|object|Array} skillsCatalog
 * @returns {{
 *   totalAudited: number,
 *   uniqueCount: number,
 *   intentionalSharedCount: number,
 *   suspiciousCount: number,
 *   missingCount: number,
 *   wrongCount: number,
 *   results: Array<object>,
 *   collisionMap: Record<string, string[]>
 * }}
 */
export function auditAllSkillIcons(skillsCatalog = null) {
  let entries = [];
  if (skillsCatalog instanceof Map) {
    entries = Array.from(skillsCatalog.entries()).map(([id, s]) => ({ id, def: s }));
  } else if (Array.isArray(skillsCatalog)) {
    entries = skillsCatalog.map(s => ({ id: s.id || s.identity?.id, def: s }));
  } else if (skillsCatalog && typeof skillsCatalog === 'object') {
    entries = Object.entries(skillsCatalog).map(([id, s]) => ({ id, def: s }));
  } else {
    // Default to registered entries
    entries = Object.keys(SKILL_ICON_REGISTRY).map(id => ({ id, def: null }));
  }

  const iconUsage = new Map(); // iconPath -> Array<{ skillId, isShared }>

  // Pass 1: populate usage
  for (const { id, def } of entries) {
    const iconData = getSkillIcon(id, def);
    const isShared = SHARED_SKILL_IDS.includes(id) || SKILL_ICON_REGISTRY[id]?.shared === true;
    if (!iconUsage.has(iconData.iconPath)) {
      iconUsage.set(iconData.iconPath, []);
    }
    iconUsage.get(iconData.iconPath).push({ skillId: id, isShared });
  }

  // Pass 2: evaluate statuses
  const results = [];
  let uniqueCount = 0;
  let intentionalSharedCount = 0;
  let suspiciousCount = 0;
  let missingCount = 0;
  let wrongCount = 0;

  for (const { id, def } of entries) {
    const base = auditSkillIcon(id, def);
    const users = iconUsage.get(base.iconPath) || [];
    const otherUsers = users.filter(u => u.skillId !== id).map(u => u.skillId);

    if (base.status === ICON_STATUS.MISSING) {
      missingCount++;
    } else if (base.status === ICON_STATUS.WRONG) {
      wrongCount++;
    } else if (otherUsers.length === 0) {
      base.status = ICON_STATUS.UNIQUE;
      uniqueCount++;
    } else {
      const allIntentionallyShared = (SHARED_SKILL_IDS.includes(id) || SKILL_ICON_REGISTRY[id]?.shared) &&
        otherUsers.every(uid => SHARED_SKILL_IDS.includes(uid) || SKILL_ICON_REGISTRY[uid]?.shared);

      if (allIntentionallyShared) {
        base.status = ICON_STATUS.INTENTIONAL_SHARED;
        intentionalSharedCount++;
      } else {
        base.status = ICON_STATUS.SUSPICIOUS;
        suspiciousCount++;
      }
    }

    base.duplicateWith = otherUsers;
    results.push(base);
  }

  const collisionMap = {};
  for (const [iconPath, users] of iconUsage.entries()) {
    if (users.length > 1) {
      collisionMap[iconPath] = users.map(u => u.skillId);
    }
  }

  return {
    totalAudited: entries.length,
    uniqueCount,
    intentionalSharedCount,
    suspiciousCount,
    missingCount,
    wrongCount,
    results,
    collisionMap
  };
}

/**
 * Generates markdown formatted Skill Icon Audit Report.
 * @param {Map|object|Array} [skillsCatalog]
 * @returns {string} Markdown text
 */
export function generateSkillIconAuditReport(skillsCatalog = null) {
  const audit = auditAllSkillIcons(skillsCatalog);

  let md = `# SKILL ICON AUDIT REPORT\n\n`;
  md += `- **Total Audited Skills**: ${audit.totalAudited}\n`;
  md += `- **Unique Dedicated Icons**: ${audit.uniqueCount}\n`;
  md += `- **Intentional Shared Icons**: ${audit.intentionalSharedCount}\n`;
  md += `- **Suspicious Collisions**: ${audit.suspiciousCount}\n`;
  md += `- **Missing Assets**: ${audit.missingCount}\n`;
  md += `- **Malformed Registrations**: ${audit.wrongCount}\n\n`;

  md += `| Skill ID | Icon ID | Asset Path | Exists | Status | Duplicates |\n`;
  md += `| :--- | :--- | :--- | :---: | :---: | :--- |\n`;

  for (const item of audit.results) {
    const dupStr = item.duplicateWith.length > 0 ? item.duplicateWith.join(', ') : 'None';
    md += `| \`${item.skillId}\` | \`${item.iconId}\` | \`${item.iconPath}\` | ${item.exists ? '✅' : '❌'} | **${item.status}** | ${dupStr} |\n`;
  }

  return md;
}

/**
 * Validates the skill icon registry and returns a concise validation summary.
 * @param {Map|object|Array} [skillsCatalog]
 */
export function validateSkillIconRegistry(skillsCatalog = null) {
  const audit = auditAllSkillIcons(skillsCatalog);
  return {
    isValid: audit.missingCount === 0 && audit.wrongCount === 0 && audit.suspiciousCount === 0,
    unresolvedAssets: audit.results.filter(r => !r.exists),
    collisions: Object.entries(audit.collisionMap).map(([iconPath, skills]) => ({ iconPath, skills })),
    audit
  };
}

/**
 * Returns a high-level metrics summary of icon coverage and uniqueness.
 * @param {Map|object|Array} [skillsCatalog]
 */
export function getSkillIconSummary(skillsCatalog = null) {
  const audit = auditAllSkillIcons(skillsCatalog);
  return {
    totalSkills: audit.totalAudited,
    uniqueCount: audit.uniqueCount,
    missingCount: audit.missingCount,
    wrongCount: audit.wrongCount,
    collisionCount: audit.suspiciousCount,
    uniquenessRate: ((audit.uniqueCount / (audit.totalAudited || 1)) * 100).toFixed(1) + '%'
  };
}
