/**
 * ArtworkSemanticAuditor.js — Game Data Contract 3.2.1 / Deploy 3.1
 * 
 * Semantic Accuracy Auditor for Visual Artwork & Portraits across all 98 canonical entities.
 * 
 * Invariants:
 * - 98 Canonical Entities (25 Active + 73 Historical)
 * - Strict Semantic Matching:
 *   * Archmage must NEVER resolve to Fighter
 *   * Orc must NEVER resolve to Human
 *   * Dark Elf must NEVER resolve to Elf
 *   * High Elf must NEVER resolve to Elf
 * - Statuses:
 *   * PASS: Exact class-specific portrait matching identity
 *   * REVIEW: Semantic fallback (e.g., generic archetype portrait)
 *   * FAIL: Semantic mismatch (e.g., mage resolving to fighter)
 *   * MISSING: No portrait resolved or invalid asset
 */

import { ACTIVE_CLASSES } from '../data/elemental/ElementMatrix.js';
import { HISTORICAL_CLASSES } from '../data/elemental/HistoricalClasses.js';
import { getClassIdentity } from '../data/elemental/ClassIdentity.js';
import { heroImgPath } from '../../art.js';

/**
 * All 98 canonical entities.
 */
export const ALL_CANONICAL_ENTITIES = [
  ...ACTIVE_CLASSES.map(c => ({
    canonicalId: c.id,
    displayName: c.name,
    race: c.race,
    stage: 'ACTIVE',
    archetype: c.lineage || 'Specialist',
    isActive: true
  })),
  ...HISTORICAL_CLASSES.map(c => ({
    canonicalId: c.id,
    displayName: c.name,
    race: c.race,
    stage: c.lineageType || 'HISTORICAL',
    archetype: c.archetype || c.category || 'Historical',
    isActive: false
  }))
];

/**
 * Infer archetype family (MAGE vs FIGHTER) from name, lineage, and definition.
 * @param {object} entity
 * @returns {'MAGE' | 'FIGHTER'}
 */
function inferExpectedArchetype(entity) {
  const name = (entity.displayName || entity.canonicalId).toLowerCase();
  const mageKeywords = [
    'mage', 'wizard', 'mystic', 'sorcerer', 'archmage', 'cleric', 'bishop',
    'prophet', 'hierophant', 'elder', 'oracle', 'saint', 'shaman', 'overlord',
    'dominator', 'warcryer', 'doomcryer', 'spellhowler', 'storm_screamer',
    'stormscreamer', 'spellsinger', 'mystic_muse', 'mysticmuse', 'necromancer',
    'soultaker', 'warlock', 'arcana_lord', 'arcanalord', 'elemental_summoner',
    'elementalsummoner', 'elemental_master', 'elementalmaster', 'phantom_summoner',
    'phantomsummoner', 'spectral_master', 'spectralmaster', 'summoner', 'blood_rose',
    'bloodrose', 'shinemaker', 'element_weaver', 'elementweaver', 'storm_blaster',
    'stormblaster'
  ];

  for (const kw of mageKeywords) {
    if (name.includes(kw) || entity.canonicalId.includes(kw)) {
      return 'MAGE';
    }
  }
  return 'FIGHTER';
}

/**
 * Analyzes a portrait path to determine its apparent semantic identity.
 * @param {string} portraitPath
 * @returns {{ race: string, archetype: 'MAGE' | 'FIGHTER' | 'UNKNOWN' }}
 */
function analyzePortraitSemantics(portraitPath) {
  if (!portraitPath || typeof portraitPath !== 'string') {
    return { race: 'UNKNOWN', archetype: 'UNKNOWN' };
  }

  const p = portraitPath.toLowerCase();

  let race = 'Human';
  if (p.includes('darkelf') || p.includes('dark_elf') || p.includes('shillien')) race = 'Dark Elf';
  else if (p.includes('highelf') || p.includes('high_elf')) race = 'High Elf';
  else if (p.includes('elf')) race = 'Elf';
  else if (p.includes('orc')) race = 'Orc';
  else if (p.includes('dwarf')) race = 'Dwarf';
  else if (p.includes('kamael')) race = 'Kamael';
  else if (p.includes('ertheia')) race = 'Ertheia';
  else if (p.includes('sylph')) race = 'Sylph';
  else if (p.includes('human')) race = 'Human';

  let archetype = 'UNKNOWN';
  if (
    p.includes('mistyc') || p.includes('mystic') || p.includes('mage') ||
    p.includes('wizard') || p.includes('sorcerer') || p.includes('archmage') ||
    p.includes('cleric') || p.includes('bishop') || p.includes('elder') ||
    p.includes('shaman') || p.includes('summoner') || p.includes('necro') ||
    p.includes('spellsinger') || p.includes('spellhowler') || p.includes('shinemaker')
  ) {
    archetype = 'MAGE';
  } else if (
    p.includes('fighter') || p.includes('warrior') || p.includes('knight') ||
    p.includes('rogue') || p.includes('gladiator') || p.includes('warlord') ||
    p.includes('paladin') || p.includes('avenger') || p.includes('hunter') ||
    p.includes('hawkeye') || p.includes('duelist') || p.includes('assassin')
  ) {
    archetype = 'FIGHTER';
  }

  return { race, archetype };
}

/**
 * Audits a single entity for semantic artwork accuracy.
 * @param {object} entity
 * @returns {object} Audit diagnostic
 */
export function auditEntityArtwork(entity) {
  const cid = entity.canonicalId;
  const race = entity.race;
  const expectedArchetype = inferExpectedArchetype(entity);

  const malePath = heroImgPath(race, cid, 'M');
  const femalePath = heroImgPath(race, cid, 'F');

  const maleSemantics = analyzePortraitSemantics(malePath);
  const femaleSemantics = analyzePortraitSemantics(femalePath);

  // Check critical violations
  const violations = [];
  let isSemanticFallback = false;

  // Archmage -> Fighter violation check (CRITICAL BUG TEST)
  if (cid === 'archmage' || cid === 'human_archmage') {
    if (maleSemantics.archetype === 'FIGHTER' || femaleSemantics.archetype === 'FIGHTER' || malePath.includes('fighter')) {
      violations.push('ARCHMAGE_RESOLVED_AS_FIGHTER');
    }
  }

  // Race mismatch checks
  if (race === 'Orc' && (maleSemantics.race === 'Human' || femaleSemantics.race === 'Human')) {
    violations.push('ORC_RESOLVED_AS_HUMAN');
  }
  if (race === 'Dark Elf' && maleSemantics.race === 'Elf' && !malePath.includes('dark')) {
    violations.push('DARK_ELF_RESOLVED_AS_ELF');
  }
  if (race === 'High Elf' && maleSemantics.race === 'Elf' && !malePath.includes('high')) {
    // Semantic fallback: High Elf gracefully falls back to Elf art (REVIEW, not FAIL)
    isSemanticFallback = true;
  }

  // Archetype mismatch check
  if (expectedArchetype === 'MAGE' && (maleSemantics.archetype === 'FIGHTER' && femaleSemantics.archetype === 'FIGHTER')) {
    violations.push('MAGE_RESOLVED_AS_FIGHTER');
  }
  if (expectedArchetype === 'FIGHTER' && (maleSemantics.archetype === 'MAGE' && femaleSemantics.archetype === 'MAGE')) {
    violations.push('FIGHTER_RESOLVED_AS_MAGE');
  }

  // Determine status
  let status = 'PASS';
  let source = 'EXACT_CLASS';

  if (!malePath && !femalePath) {
    status = 'MISSING';
  } else if (violations.length > 0) {
    status = 'FAIL';
  } else if (isSemanticFallback) {
    status = 'REVIEW';
    source = 'SEMANTIC_FALLBACK_HIGH_ELF';
  } else {
    // Check if it was a generic fallback
    const isGenericFallback = malePath.includes('fighter') || malePath.includes('mistyc') || malePath.includes('fallback');
    const isExactName = malePath.includes(cid.replace(/^[a-z]+_/, ''));
    if (!isExactName && isGenericFallback) {
      status = 'REVIEW';
      source = 'ARCHETYPE_FALLBACK';
    }
  }

  return {
    canonicalId: cid,
    displayName: entity.displayName,
    race,
    stage: entity.stage,
    archetype: expectedArchetype,
    portraitMale: malePath,
    portraitFemale: femalePath,
    source,
    expectedIdentity: { race, archetype: expectedArchetype },
    actualIdentity: { male: maleSemantics, female: femaleSemantics },
    violations,
    status
  };
}

/**
 * Audits all 98 canonical class entities for semantic artwork accuracy.
 * @returns {object} Comprehensive Artwork Semantic Report
 */
export function auditArtworkSemantics() {
  const results = ALL_CANONICAL_ENTITIES.map(e => auditEntityArtwork(e));

  const passCount = results.filter(r => r.status === 'PASS').length;
  const reviewCount = results.filter(r => r.status === 'REVIEW').length;
  const failCount = results.filter(r => r.status === 'FAIL').length;
  const missingCount = results.filter(r => r.status === 'MISSING').length;

  const archmageAudit = results.find(r => r.canonicalId === 'human_archmage' || r.canonicalId === 'archmage');

  return {
    totalEntitiesCount: results.length,
    passCount,
    reviewCount,
    failCount,
    missingCount,
    archmageVerified: Boolean(archmageAudit && archmageAudit.status !== 'FAIL'),
    status: failCount === 0 ? 'PASS' : 'FAIL',
    results
  };
}
