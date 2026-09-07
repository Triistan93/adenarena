/**
 * SkillVfxValidator.js — Game Data Contract 3.2.1 Skill VFX Catalog Validator
 * 
 * Validates the 4-layer architectural decoupling of VFX from gameplay & elemental logic:
 * 1. VFX_IDENTITY (100 distinct keys mapped 1:1 to native active skills)
 * 2. VFX_PROFILE (color, particle, anim, duration)
 * 3. VFX_RENDER_FAMILY (graphic primitive category)
 * 4. VFX_RENDER_IMPLEMENTATION (STRUCTURAL_ONLY)
 * 
 * Ensures no orphan VFX, no missing bindings, and no fraudulent declaration
 * of 100 visual shader implementations when renderer uses structural canvas primitives.
 */

import { ALL_NATIVE_SKILLS } from '../data/elemental/NativeSkillTrees.js';
import {
  SKILL_VFX_REGISTRY,
  VFX_VISUAL_IMPLEMENTATION,
  VFX_RENDER_FAMILIES,
  getSkillVfx,
  hasSkillVfx,
  getAllVfxDefinitions,
  getVfxArchitecture,
  getVfxStats
} from '../data/vfx/SkillVfxRegistry.js';

/**
 * Validates the complete VFX registry against active skills.
 * @returns {object} Validation report
 */
export function validateSkillVfx() {
  const errors = [];
  const warnings = [];

  const allVfx = getAllVfxDefinitions();
  const vfxIds = new Set();
  const duplicateVfxIds = [];

  // 1. Check VFX Registration Uniqueness and Completeness
  for (const vfx of allVfx) {
    if (!vfx.vfxId) {
      errors.push(`VFX entry missing vfxId: ${JSON.stringify(vfx)}`);
      continue;
    }
    if (vfxIds.has(vfx.vfxId)) {
      duplicateVfxIds.push(vfx.vfxId);
      errors.push(`Duplicate VFX ID detected: ${vfx.vfxId}`);
    }
    vfxIds.add(vfx.vfxId);

    // Profile parameters validation
    if (!vfx.color || !vfx.particle || !vfx.anim || typeof vfx.duration !== 'number') {
      errors.push(`VFX entry ${vfx.vfxId} has incomplete profile parameters`);
    }

    // Render family validation
    if (!vfx.type || typeof vfx.type !== 'string') {
      errors.push(`VFX entry ${vfx.vfxId} missing render family type`);
    }
  }

  // 2. Check 100 Active Skills Mapping (1:1 Binding)
  const missingBindings = [];
  const mismatchedIds = [];

  for (const skill of ALL_NATIVE_SKILLS) {
    if (!skill.vfxId) {
      missingBindings.push(skill.id);
      errors.push(`Active skill ${skill.id} does not declare a vfxId`);
      continue;
    }

    const vfxDef = getSkillVfx(skill.id);
    if (!vfxDef) {
      missingBindings.push(skill.id);
      errors.push(`Skill ${skill.id} (vfxId: ${skill.vfxId}) has no entry in SKILL_VFX_REGISTRY`);
    } else if (vfxDef.vfxId !== skill.vfxId) {
      mismatchedIds.push({ skillId: skill.id, declared: skill.vfxId, registered: vfxDef.vfxId });
      errors.push(`Skill ${skill.id} declared vfxId ${skill.vfxId} but registered ${vfxDef.vfxId}`);
    }
  }

  // 3. Check for Orphan VFX in Registry
  const activeSkillIds = new Set(ALL_NATIVE_SKILLS.map(s => s.id));
  const orphanVfx = [];
  for (const [skillIdKey, vfx] of Object.entries(SKILL_VFX_REGISTRY)) {
    if (!activeSkillIds.has(skillIdKey)) {
      orphanVfx.push(skillIdKey);
      warnings.push(`Orphan VFX entry registered for non-active skill ID: ${skillIdKey}`);
    }
  }

  // 4. Distinction between Identity Uniqueness and Visual Implementation Uniqueness
  const vfxStats = getVfxStats();
  const isStructuralOnly = VFX_VISUAL_IMPLEMENTATION === 'STRUCTURAL_ONLY';
  if (!isStructuralOnly) {
    errors.push(`Contract 3.2.1 requires VFX_VISUAL_IMPLEMENTATION to be STRUCTURAL_ONLY`);
  }

  return {
    valid: errors.length === 0,
    status: errors.length === 0 ? 'PASS' : 'FAIL',
    totalActiveSkills: ALL_NATIVE_SKILLS.length,
    registeredVfxCount: allVfx.length,
    uniqueIdentitiesCount: vfxIds.size,
    isIdentityUnique: vfxIds.size === ALL_NATIVE_SKILLS.length,
    visualImplementationStatus: VFX_VISUAL_IMPLEMENTATION,
    isVisualImplementationUnique: false, // Architectural principle: structural canvas primitives, not 100 bespoke shaders
    renderFamilyBreakdown: vfxStats.renderFamilyBreakdown,
    missingBindings,
    orphanVfx,
    errors,
    warnings
  };
}
