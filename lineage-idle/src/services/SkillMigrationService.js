/**
 * SkillMigrationService.js — Deterministic Save Migration & SP Refund Ledger (Skill System V2)
 * 
 * Migrates player state from V1 to Canonical V2:
 * 1. Checks state.skillSystemVersion. If >= 2, no-op.
 * 2. Translates legacy / synthetic skill IDs into canonical V2 semantic IDs.
 * 3. Calculates the exact historical SP invested for removed/obsolete skills and refunds 100% to state.sp.
 * 4. Produces an audit-grade ledger in state.migrationLedger.
 * 5. Sets state.skillSystemVersion = 2.
 */

import { CANONICAL_SKILL_REGISTRY_V2 } from '../data/skills/CanonicalSkillRegistryV2.js';
import { CANONICAL_CLASS_REGISTRY_V2 } from '../data/classes/CanonicalClassRegistryV2.js';
import { isPurgedSkill } from './SkillTagService.js';

// Historical skill cost formula from SkillEngine.js: baseCost * 1.4^lvl
export function calculateHistoricalSpSpent(baseCost = 5, level = 1) {
  let total = 0;
  for (let l = 0; l < level; l++) {
    total += Math.floor(baseCost * Math.pow(1.4, l));
  }
  return total;
}

// Deterministic mapping of old V1 synthetic / legacy skill IDs to V2 Canonical IDs
export const OLD_TO_NEW_SKILL_MAP = Object.freeze({
  // V1 synthetic shared skills
  'hydro_strike': 'ice_bolt',
  'heal_light': 'self_heal',
  'energy_burst': 'power_shot',

  // Human Fighter V1 synthetic
  'shield_bash': 'shield_stun',
  'cleave_strike': 'spinning_slash',
  'iron_stance': 'iron_will',
  'concussive_stun': 'stun_attack',

  // Sorcerer V1 synthetic
  'fireball': 'prominence',
  'magma_spike': 'fire_vortex',
  'holy_bolt': 'solar_spark',
  'flame_nova': 'blazing_circle',

  // Death Knight V1 synthetic
  'cinderblade': 'hellfire',
  'hellfire_grasp': 'death_mark',
  'ashen_shroud': 'dark_shield',
  'infernal_judgment': 'ultimate_death_knight',

  // Warg V1 synthetic
  'savage_bite': 'beast_claw',
  'pack_howl': 'beast_howl',
  'feral_pounce': 'wild_rush',
  'beast_form': 'werewolf_transformation',

  // Assassin V1 synthetic
  'gloom_strike': 'shadow_slash',
  'veil_step': 'shadow_veil',
  'night_execution': 'transcendent_assassination',

  // Elf Fighter V1 synthetic
  'aqua_arrow': 'power_shot',
  'tide_step': 'sprint',
  'mist_guard': 'deflect_arrow',
  'riptide_volley': 'double_shot',

  // Elf Mage V1 synthetic
  'water_whip': 'hydro_blast',
  'frost_nova': 'frost_bolt',
  'soothing_rain': 'greater_heal',
  'blizzard': 'blizzard',

  // Dark Elf V1 synthetic
  'shadow_blade': 'deadly_blow',
  'night_veil': 'shadow_step',
  'gloom_burst': 'corpse_burst',
  'abyssal_strike': 'critical_blow',

  // Dark Elf Mage V1 synthetic
  'shadow_bolt': 'hurricane',
  'curse_of_agony': 'decay',
  'vampiric_drain': 'death_spike',
  'abyssal_flare': 'shadow_flare',

  // Orc Fighter V1 synthetic
  'crushing_blow': 'fatal_strike',
  'war_stomp': 'crush_pain',
  'blood_frenzy': 'frenzy',
  'titan_slam': 'demolition_impact',

  // Orc Shaman V1 synthetic
  'flame_burst': 'frost_flame',
  'totem_seal': 'seal_of_chaos',
  'spirit_roar': 'flames_of_paagrio',
  'ancestral_surge': 'seal_of_blockade',

  // Dwarf V1 synthetic
  'heavy_hammer': 'iron_hammer',
  'ore_crusher': 'spoil_crush',
  'golem_armor': 'mechanical_armor',
  'master_forge': 'overhaul',

  // Kamael V1 synthetic
  'rapier_thrust': 'spread_wing',
  'soul_pierce': 'soul_vortex',
  'soul_shroud': 'soul_cleanse',
  'tempest_edge': 'lightning_leap'
});

// Previous Aden Arena Ertheia trees contained synthetic IDs that are not
// equivalents of the European class roster. Only exact Hydro Attack remains
// in the new roster; removed investments are refunded rather than guessed.
const LEGACY_ERTHEIA_SKILL_IDS = new Set([
  'iron_punch', 'fist_mastery', 'light_armor_mastery', 'hydro_attack',
  'soul_smash', 'increase_power', 'soul_guard', 'boost_attack_speed', 'bandage',
  'soul_impulse', 'enuma_elish', 'rush', 'rush_impact', 'critical_power',
  'powerful_rush', 'soul_weapon', 'disarm', 'master_of_combat',
  'aqua_swirl', 'concentration', 'body_to_mind', 'fast_spell_casting', 'anti_magic',
  'hydro_blast', 'aqua_splash', 'freezing_skin', 'blizzard', 'spellcraft',
  'ice_vortex', 'mystic_explosion', 'mystic_spiral', 'meteor', 'mystic_freeze'
]);

function migrateLegacyErtheiaRoster(state) {
  if (state.ertheiaRosterMigrationVersion >= 1) return;
  const race = String(state.race || '').toLowerCase();
  if (race !== 'ertheia') return;

  const classId = state.class;
  const classDef = CANONICAL_CLASS_REGISTRY_V2[classId];
  const allowed = new Set();
  let cursor = classDef;
  while (cursor) {
    for (const skillId of cursor.skillIds || []) allowed.add(skillId);
    cursor = cursor.parentClass ? CANONICAL_CLASS_REGISTRY_V2[cursor.parentClass] : null;
  }

  const removed = [];
  for (const skillId of LEGACY_ERTHEIA_SKILL_IDS) {
    if (allowed.has(skillId) || !(Number(state.skills?.[skillId]) > 0)) continue;
    const rank = Number(state.skills[skillId]) || 0;
    const refundedSp = calculateHistoricalSpSpent(5, rank);
    delete state.skills[skillId];
    state.sp = (Number(state.sp) || 0) + refundedSp;
    removed.push({ skillId, rank, refundedSp });
    if (state.skillLoadout && typeof state.skillLoadout === 'object') {
      for (const [slot, equippedId] of Object.entries(state.skillLoadout)) {
        if (equippedId === skillId) state.skillLoadout[slot] = null;
      }
    }
    if (Array.isArray(state.hotbar)) {
      state.hotbar = state.hotbar.map(slot => slot === skillId ? null : slot);
    }
    if (state.skillAutoCast && typeof state.skillAutoCast === 'object') {
      delete state.skillAutoCast[skillId];
    }
    if (state.selectedSkill === skillId) state.selectedSkill = null;
  }

  state.ertheiaRosterMigrationVersion = 1;
  if (removed.length) {
    state.migrationLedger = state.migrationLedger || {};
    state.migrationLedger.ertheiaRoster = {
      version: 1,
      classId: classId || 'unknown',
      removed,
      totalSpRefunded: removed.reduce((total, entry) => total + entry.refundedSp, 0)
    };
  }
}

/**
 * Migrates a character state object to Skill System V2.
 * Deterministic and safe to run on any save (local or Firestore).
 * 
 * @param {Object} state - The character state to migrate (mutated in place)
 * @returns {Object} The migration summary ledger
 */
export function migrateCharacterSave(state) {
  if (!state || typeof state !== 'object') return null;

  migrateLegacyErtheiaRoster(state);

  // Always scrub any purged skills even on current version saves
  if (state.skills) {
    for (const sid of Object.keys(state.skills)) {
      if (isPurgedSkill(sid) || CANONICAL_SKILL_REGISTRY_V2[sid]?.disabled) {
        delete state.skills[sid];
      }
    }
  }
  if (state.skillLoadout) {
    for (const [slot, sid] of Object.entries(state.skillLoadout)) {
      if (sid && (isPurgedSkill(sid) || CANONICAL_SKILL_REGISTRY_V2[sid]?.disabled)) {
        state.skillLoadout[slot] = null;
      }
    }
  }

  // Already on V2
  if (state.skillSystemVersion && state.skillSystemVersion >= 2) {
    return state.migrationLedger || null;
  }

  const rawSkills = state.skills || {};
  const migratedSkills = {};
  const refunds = [];
  let totalSpRefunded = 0;
  const migratedMappings = [];

  for (const [oldId, rank] of Object.entries(rawSkills)) {
    const numRank = Number(rank) || 0;
    if (numRank <= 0) continue;

    // Purged / cosmetic / mount skills are never kept — full refund
    if (isPurgedSkill(oldId) || CANONICAL_SKILL_REGISTRY_V2[oldId]?.disabled) {
      const baseCost = 5;
      const spRefund = calculateHistoricalSpSpent(baseCost, numRank);
      totalSpRefunded += spRefund;
      refunds.push({
        oldSkillId: oldId,
        oldRank: numRank,
        spRefunded: spRefund,
        reason: 'PURGED_COSMETIC_MOUNT_REFUND'
      });
      continue;
    }

    // 1. Explicit Mapped Replacement
    const mappedTarget = OLD_TO_NEW_SKILL_MAP[oldId];
    if (mappedTarget && CANONICAL_SKILL_REGISTRY_V2[mappedTarget] && !CANONICAL_SKILL_REGISTRY_V2[mappedTarget].disabled && !isPurgedSkill(mappedTarget)) {
      migratedSkills[mappedTarget] = Math.max(migratedSkills[mappedTarget] || 0, numRank);
      migratedMappings.push({ from: oldId, to: mappedTarget, rank: numRank, type: 'CANONICAL_REPLACED' });
      continue;
    }

    // 2. Direct Canonical Match in V2
    if (CANONICAL_SKILL_REGISTRY_V2[oldId] && !CANONICAL_SKILL_REGISTRY_V2[oldId].disabled && !isPurgedSkill(oldId)) {
      migratedSkills[oldId] = numRank;
      migratedMappings.push({ from: oldId, to: oldId, rank: numRank, type: 'CANONICAL_MATCH' });
      continue;
    }

    // 3. Prefix strip match (e.g. fighter_power_strike -> power_strike)
    const strippedId = oldId.replace(/^[a-zA-Z0-9]+_/, '');
    if (CANONICAL_SKILL_REGISTRY_V2[strippedId] && !CANONICAL_SKILL_REGISTRY_V2[strippedId].disabled && !isPurgedSkill(strippedId)) {
      migratedSkills[strippedId] = Math.max(migratedSkills[strippedId] || 0, numRank);
      migratedMappings.push({ from: oldId, to: strippedId, rank: numRank, type: 'PREFIX_STRIPPED_MATCH' });
      continue;
    }

    // 4. Removed skill with No V2 Equivalent -> 100% SP Refund
    const baseCost = 5; // Default base cost
    const spRefund = calculateHistoricalSpSpent(baseCost, numRank);
    totalSpRefunded += spRefund;

    refunds.push({
      oldSkillId: oldId,
      oldRank: numRank,
      spRefunded: spRefund,
      reason: 'REMOVED_NO_V2_EQUIVALENT'
    });
  }

  // Apply state mutations
  state.skills = migratedSkills;
  state.sp = (Number(state.sp) || 0) + totalSpRefunded;
  state.skillSystemVersion = 2;

  const ledger = {
    migrationVersion: 2,
    timestamp: Date.now(),
    characterClass: state.class || 'unknown',
    characterLevel: state.level || 1,
    migratedSkillsCount: Object.keys(migratedSkills).length,
    totalSpRefunded,
    refunds,
    migratedMappings
  };

  state.migrationLedger = ledger;

  // Also clean active action bar / hotbar from obsolete IDs
  if (Array.isArray(state.hotbar)) {
    state.hotbar = state.hotbar.map(slot => {
      if (!slot) return null;
      if (typeof slot === 'string') {
        return migratedSkills[slot] ? slot : (OLD_TO_NEW_SKILL_MAP[slot] || null);
      }
      return slot;
    });
  }

  if (state.skillAutoCast && typeof state.skillAutoCast === 'object') {
    const cleanedAutoCast = {};
    for (const [k, v] of Object.entries(state.skillAutoCast)) {
      if (migratedSkills[k]) cleanedAutoCast[k] = v;
      else if (OLD_TO_NEW_SKILL_MAP[k] && migratedSkills[OLD_TO_NEW_SKILL_MAP[k]]) {
        cleanedAutoCast[OLD_TO_NEW_SKILL_MAP[k]] = v;
      }
    }
    state.skillAutoCast = cleanedAutoCast;
  }

  return ledger;
}
