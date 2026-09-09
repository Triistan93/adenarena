/**
 * SkillProgression.js
 * 
 * Level-Aware Skill Validation and Progression Engine.
 * Direct implementation of Section 29, 30, 55, 56.
 */

import { getClassIdentity, getProgressionStage, getAllowedElements } from '../classes/ClassIdentity.js';
import { getSkill, getAllSkills } from './SkillRegistry.js';

export function validateSkillAvailability(classId, level, skillId) {
  const identity = getClassIdentity(classId);
  if (!identity) {
    return { status: 'INVALID', reason: 'UNKNOWN_CLASS', classId };
  }

  const skill = getSkill(skillId);
  if (!skill) {
    return { status: 'INVALID', reason: 'SKILL_NOT_FOUND', skillId };
  }

  const stage = getProgressionStage(level);
  const allowedElements = getAllowedElements(classId, level);

  // 1. Element Compatibility Check (Section 30, 55: Sorcerer Lv40 + Ice -> ELEMENT_MISMATCH)
  const hasValidElement = skill.elements.some(elem => allowedElements.includes(elem));
  if (!hasValidElement) {
    return {
      status: 'INVALID',
      reason: 'ELEMENT_MISMATCH',
      classId,
      level,
      allowedElements,
      skillElements: skill.elements
    };
  }

  // 2. Class Lineage Check (Section 56: Isolation)
  const isAvailable = (skill.availableTo && skill.availableTo.includes(classId)) ||
                      (skill.nativeClasses && skill.nativeClasses.includes(classId));
  if (!isAvailable) {
    return { status: 'INVALID', reason: 'CLASS_MISMATCH', classId, skillId };
  }

  // 3. Stage & Level Requirement Check (Section 30, 55: Sorcerer Lv40 + Magma Spike -> STAGE_REQUIREMENT)
  if (level < skill.requiredLevel) {
    return {
      status: 'INVALID',
      reason: 'STAGE_REQUIREMENT',
      classId,
      currentLevel: level,
      requiredLevel: skill.requiredLevel,
      currentStage: stage,
      requiredStage: skill.progressionStage
    };
  }

  return {
    status: 'VALID',
    classId,
    level,
    stage,
    skill
  };
}

export function getClassSkillPool(classId, level) {
  const all = getAllSkills();
  return all.filter(s => {
    const res = validateSkillAvailability(classId, level, s.id);
    return res.status === 'VALID';
  });
}
