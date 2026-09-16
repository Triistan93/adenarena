/**
 * SkillTreeViewModel.js — ViewModel & Presentation Model for Skill Window
 *
 * Game Data Contract 3.3.0: Forensic Skill Window ViewModel
 *
 * Architectural Pipeline:
 * Character -> Canonical Class -> Progression State -> Eligible Skills -> Skill Classification -> Skill Presentation Model -> Skill Window
 *
 * Strict Gating Invariant:
 * Future skills (requiredLevel > character.level), foreign skills, and sibling branch skills
 * are strictly NEVER included in the presentation model.
 */

import {
  getVisibleSkillsForCharacter,
  getSkillDetailedVisibility,
  SKILL_DETAILED_VISIBILITY_STATES,
  SKILL_VISIBILITY_STATES,
  SHARED_MAGE_SKILL_IDS,
  SHARED_FIGHTER_SKILL_IDS,
  isMageClass,
  resolveSkillDef,
  getSkillUnlockLevelForClass
} from './SkillEligibility.js';

import {
  resolveCanonicalClassId,
  resolveCanonicalDagClassId,
  getCanonicalCharacterClass
} from '../data/classes/class_aliases.js';

import {
  PROGRESSION_STAGES,
  STAGE_LEVEL_THRESHOLDS,
  getProgressionStage
} from '../data/elemental/SkillProgression.js';

import { getSkillIcon, getSkillSemanticData } from './SkillIconRegistry.js';

export const SKILL_CATEGORIES = Object.freeze({
  CORE: 'CORE',
  CLASS: 'CLASS',
  SPECIALIZATION: 'SPECIALIZATION',
  MASTERY: 'MASTERY',
  ULTIMATE: 'ULTIMATE',
  PASSIVE: 'PASSIVE'
});

export const SKILL_TABS = Object.freeze({
  ACTIVE: 'active',
  PASSIVE: 'passive',
  ULTIMATE: 'ultimate'
});

/**
 * Returns descriptive theme and elemental accents for a class.
 */
export function getClassTheme(canonicalClass, race) {
  const c = String(canonicalClass || '').toLowerCase();
  const r = String(race || '').toLowerCase();

  if (c.includes('sorcerer') || c.includes('archmage')) {
    return { name: 'Fogo & Magma', accent: '#f97316', bgGlow: 'rgba(249,115,22,0.15)', icon: '🔥' };
  }
  if (c.includes('death_knight') || c.includes('hell_knight') || c.includes('soultaker') || c.includes('necromancer')) {
    return { name: 'Trevas & Morte', accent: '#a855f7', bgGlow: 'rgba(168,85,247,0.15)', icon: '💀' };
  }
  if (c.includes('assassin') || c.includes('abyss') || c.includes('ghost')) {
    return { name: 'Sombras & Veneno', accent: '#8b5cf6', bgGlow: 'rgba(139,92,246,0.15)', icon: '🗡️' };
  }
  if (c.includes('blood_rose')) {
    return { name: 'Espinhos Carmesins', accent: '#ec4899', bgGlow: 'rgba(236,72,153,0.15)', icon: '🌹' };
  }
  if (c.includes('spellsinger') || c.includes('mystic_muse') || (r === 'elf' && isMageClass(c))) {
    return { name: 'Água & Gelo', accent: '#38bdf8', bgGlow: 'rgba(56,189,248,0.15)', icon: '❄️' };
  }
  if (c.includes('spellhowler') || c.includes('storm_screamer') || c.includes('storm_blaster') || c.includes('marauder')) {
    return { name: 'Vento & Tempestade', accent: '#22c55e', bgGlow: 'rgba(34,197,94,0.15)', icon: '🌪️' };
  }
  if (c.includes('bishop') || c.includes('cardinal') || c.includes('templar') || c.includes('paladin') || c.includes('shinemaker')) {
    return { name: 'Luz Sagrada & Divindade', accent: '#facc15', bgGlow: 'rgba(250,204,21,0.15)', icon: '✝️' };
  }
  if (c.includes('artisan') || c.includes('warsmith') || c.includes('maestro') || r === 'dwarf') {
    return { name: 'Terra & Metalurgia', accent: '#eab308', bgGlow: 'rgba(234,179,8,0.15)', icon: '⚙️' };
  }
  if (c.includes('shaman') || c.includes('overlord') || c.includes('warcryer') || c.includes('vanguard')) {
    return { name: 'Fogo Totêmico & Guerra', accent: '#ef4444', bgGlow: 'rgba(239,68,68,0.15)', icon: '🪓' };
  }
  if (c.includes('samurai') || c.includes('soulbreaker')) {
    return { name: 'Corte da Alma & Katana', accent: '#06b6d4', bgGlow: 'rgba(6,182,212,0.15)', icon: '⚡' };
  }
  if (c.includes('warg')) {
    return { name: 'Fera Ancestral & Fúria', accent: '#f59e0b', bgGlow: 'rgba(245,158,11,0.15)', icon: '🐺' };
  }
  if (isMageClass(c)) {
    return { name: 'Arcano & Mistério', accent: '#818cf8', bgGlow: 'rgba(129,140,248,0.15)', icon: '🔮' };
  }
  return { name: 'Combate Físico', accent: '#e2e8f0', bgGlow: 'rgba(226,232,240,0.10)', icon: '⚔️' };
}

/**
 * Returns human-readable stage name for a stage number.
 */
export function getStageTitle(stageNum) {
  switch (stageNum) {
    case 0: return 'Estágio 0 — Base / Aprendiz';
    case 1: return 'Estágio 1 — 1ª Transferência';
    case 2: return 'Estágio 2 — Especialização';
    case 3: return 'Estágio 3 — Maestria Arcana';
    case 4: return 'Estágio 4 — Despertar Supremo';
    case 5: return 'Estágio 5 — Mestre Supremo';
    default: return `Estágio ${stageNum}`;
  }
}

/**
 * Determines functional category for an eligible skill.
 */
export function determineSkillCategory(def, characterLevel, isShared) {
  const reqLvl = Number(def.requiredLevel || def.reqLvl || def.identity?.unlockLevel) || 1;
  const isPassive = def.type === 'passive' || def.type === 'stat';
  const isUlt = def.tier >= 4 || def.starRank >= 4 || def.isUltimate || reqLvl >= 80;

  if (isPassive) return SKILL_CATEGORIES.PASSIVE;
  if (isUlt) return SKILL_CATEGORIES.ULTIMATE;
  if (isShared || reqLvl <= 19 || def.tier === 0 || def.identity?.tier === 'shared') {
    return SKILL_CATEGORIES.CORE;
  }
  if (reqLvl < 40 || def.tier === 1 || def.identity?.tier === 'core_1' || def.identity?.tier === 'core_2') {
    return SKILL_CATEGORIES.CLASS;
  }
  if (reqLvl < 76 || def.tier === 2 || def.identity?.tier?.includes('specialization')) {
    return SKILL_CATEGORIES.SPECIALIZATION;
  }
  return SKILL_CATEGORIES.MASTERY;
}

/**
 * Calculates SP cost to level up or acquire a skill.
 */
export function calculateSkillCost(skillId, currentLevel, def) {
  const baseCost = Number(def?.cost) || 10;
  return baseCost * (Math.max(0, currentLevel) + 1);
}

/**
 * Builds the complete, authoritative ViewModel for the Skill Window.
 *
 * @param {object} character - Current character state { class, race, level, skills, sp, ... }
 * @param {object} [options] - Optional view configuration { activeTab: 'active', selectedSkillId: null }
 * @returns {object} SkillTreeViewModel
 */
export function getSkillTreeViewModel(character, options = {}) {
  const charClass = (typeof character === 'string') ? character : character?.class || 'fighter';
  const charRace = (typeof character === 'object' && character?.race) ? character.race : 'human';
  const charLevel = (typeof character === 'object' && typeof character.level === 'number') ? character.level : 1;
  const charSp = (typeof character === 'object' && typeof character.sp === 'number') ? character.sp : 0;
  const charSkills = (typeof character === 'object' && character.skills) ? character.skills : {};

  const canonicalClass = resolveCanonicalClassId(charClass, charRace) || charClass;
  const canonicalDagClass = resolveCanonicalDagClassId(charClass, charRace);
  const stageNum = getProgressionStage(charLevel);
  const theme = getClassTheme(canonicalClass, charRace);
  const activeTab = options.activeTab || SKILL_TABS.ACTIVE;

  // Header presentation data
  const header = {
    race: String(charRace).charAt(0).toUpperCase() + String(charRace).slice(1),
    className: String(charClass).charAt(0).toUpperCase() + String(charClass).slice(1),
    canonicalClass,
    level: charLevel,
    sp: charSp,
    stageNumber: stageNum,
    stageTitle: getStageTitle(stageNum),
    elementalTheme: theme.name,
    accentColor: theme.accent,
    bgGlow: theme.bgGlow,
    icon: theme.icon
  };

  // Query eligible visible skills from single source of truth
  const visibleItems = getVisibleSkillsForCharacter(character);
  const visibleList = Array.isArray(visibleItems)
    ? visibleItems
    : (visibleItems?.visibleList || []);

  const sharedIds = new Set(isMageClass(charClass) ? SHARED_MAGE_SKILL_IDS : SHARED_FIGHTER_SKILL_IDS);

  const presentationModels = [];

  for (const item of visibleList) {
    const sId = item.skillId;
    const def = item.skillDef || resolveSkillDef(sId);
    if (!def) continue;

    // Strict future check: requiredLevel > charLevel must NEVER be presented
    const classSpecificReq = getSkillUnlockLevelForClass(charClass, sId);
    const baseReq = Number(def.requiredLevel || def.reqLvl || def.identity?.unlockLevel) || 1;
    const reqLvl = Math.max(classSpecificReq, baseReq);
    if (charLevel < reqLvl) continue;

    const currentRank = charSkills[sId] || 0;
    const maxRank = Number(def.max || def.maxLevel) || 5;
    const isLearned = currentRank > 0;
    const state = isLearned ? 'LEARNED' : 'AVAILABLE';

    const isShared = sharedIds.has(sId) || def.identity?.tier === 'shared';
    const isPassive = def.type === 'passive' || def.type === 'stat';
    const isUlt = def.tier >= 4 || def.starRank >= 4 || def.isUltimate || reqLvl >= 80;

    let tab = SKILL_TABS.ACTIVE;
    if (isPassive) tab = SKILL_TABS.PASSIVE;
    else if (isUlt) tab = SKILL_TABS.ULTIMATE;

    const category = determineSkillCategory(def, charLevel, isShared);
    const iconData = getSkillIcon(sId, def);
    const semantic = getSkillSemanticData(sId);

    const spCost = calculateSkillCost(sId, currentRank, def);
    const canAfford = charSp >= spCost && currentRank < maxRank;

    // Check book requirement
    const bookReq = def.requiredItemToUnlock || ((def.starRank === 4 || def.tier === 4) ? 'book_4star' : (def.starRank === 5 || def.tier === 5) ? 'book_5star' : null);
    const hasBook = bookReq ? character.inventory?.some?.(i => (i.itemId === bookReq || i.itemId === bookReq.replace('book_', 'spellbook_')) && (i.count || 1) > 0) : true;
    const isBookLocked = Boolean(bookReq && currentRank === 0 && !hasBook);

    presentationModels.push({
      skillId: sId,
      name: def.name || sId,
      category,
      tab,
      role: semantic.role || def.identity?.role || (def.type === 'buff' ? 'buff' : 'damage'),
      element: semantic.element || def.identity?.element || def.element || 'Physical',
      iconId: iconData.iconId,
      iconPath: iconData.iconPath,
      requiredLevel: reqLvl,
      progressionStage: def.progressionStage || def.identity?.progressionStage || stageNum,
      state,
      isLearned,
      native: !isShared,
      inherited: false,
      shared: isShared,
      ultimate: isUlt,
      starRank: def.starRank || (isUlt ? (def.tier === 5 ? 5 : 4) : 1),
      rank: {
        current: currentRank,
        max: maxRank,
        isMaxed: currentRank >= maxRank
      },
      cost: {
        sp: spCost,
        canAfford,
        itemReq: bookReq,
        isBookLocked
      },
      cooldown: def.baseCd || def.gameplay?.cooldown || 5000,
      description: def.desc || def.info || def.identity?.description || def.name,
      effectText: def.effectText || `Multiplicador: ${(def.pwr ? def.pwr / 10 : 1.4).toFixed(1)}x`,
      classReq: def.classReq || def.identity?.classId || canonicalClass
    });
  }

  // Group presentation models into tabs and categories
  const activeSkills = presentationModels.filter(m => m.tab === SKILL_TABS.ACTIVE);
  const passiveSkills = presentationModels.filter(m => m.tab === SKILL_TABS.PASSIVE);
  const ultimateSkills = presentationModels.filter(m => m.tab === SKILL_TABS.ULTIMATE);

  // Group Active tab skills by category
  const activeCategories = [
    {
      id: SKILL_CATEGORIES.CORE,
      title: 'Habilidades Fundamentais & Gerais (Lv. 1+)',
      skills: activeSkills.filter(s => s.category === SKILL_CATEGORIES.CORE)
    },
    {
      id: SKILL_CATEGORIES.CLASS,
      title: 'Habilidades de Classe (1ª Transferência · Lv. 20+)',
      skills: activeSkills.filter(s => s.category === SKILL_CATEGORIES.CLASS)
    },
    {
      id: SKILL_CATEGORIES.SPECIALIZATION,
      title: 'Especialização Elemental & Combate (2ª Transferência · Lv. 40+)',
      skills: activeSkills.filter(s => s.category === SKILL_CATEGORIES.SPECIALIZATION)
    },
    {
      id: SKILL_CATEGORIES.MASTERY,
      title: 'Maestria Suprema (3ª Transferência · Lv. 76+)',
      skills: activeSkills.filter(s => s.category === SKILL_CATEGORIES.MASTERY)
    }
  ].filter(cat => cat.skills.length > 0); // Omit empty categories

  // Append legacy lineage passives if present on character
  const legacyPassives = Object.values(character?.legacyPassives || {});

  const tabs = {
    [SKILL_TABS.ACTIVE]: {
      id: SKILL_TABS.ACTIVE,
      label: 'Ativas',
      icon: '⚔️',
      count: activeSkills.length,
      categories: activeCategories,
      skills: activeSkills
    },
    [SKILL_TABS.PASSIVE]: {
      id: SKILL_TABS.PASSIVE,
      label: 'Passivas',
      icon: '🛡️',
      count: passiveSkills.length + legacyPassives.length,
      skills: passiveSkills,
      legacyPassives
    },
    [SKILL_TABS.ULTIMATE]: {
      id: SKILL_TABS.ULTIMATE,
      label: 'Supremas',
      icon: '🌟',
      count: ultimateSkills.length,
      skills: ultimateSkills,
      isUnlocked: charLevel >= 80,
      unlockLevel: 80
    }
  };

  return {
    header,
    activeTab,
    tabs,
    allVisibleSkills: presentationModels,
    totalVisibleCount: presentationModels.length,
    selectedSkillId: options.selectedSkillId || presentationModels[0]?.skillId || null
  };
}
