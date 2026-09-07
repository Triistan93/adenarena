/**
 * ClassIdentity.js — Game Data Contract 3.2.1 / Deploy 3.1
 * 
 * Normative definitions for all 25 active combat classes:
 * - Racial lineage & archetype base
 * - Primary gameplay role (closed taxonomy)
 * - Level 40 Specialization Identity & Elements
 * - Level 76 Mastery Identity & Elements
 * - Level 80 Ultimate (★★★★) & Level 90 Master Ultimate
 * - Multi-stage Skill Pools & Signature Skills
 * - Derived forbidden elements (Single source of truth in allowedElementsByLevel)
 */

import { ALL_ELEMENTS, expandElement } from './ElementHierarchy.js';
import { CLASS_ALIASES } from '../classes/class_aliases.js';

export const CLASS_IDENTITIES = Object.freeze({
  // ─── Human (5 classes) ──────────────────────────────────────────────────────
  human_fighter: {
    classId: 'human_fighter',
    race: 'Human',
    baseClass: 'human_fighter',
    primaryRole: 'burst_damage',
    lv40Identity: 'Physical Combat Specialist',
    lv76Identity: 'Physical Mastery',
    allowedElementsByLevel: {
      1: ['Physical'],
      40: ['Physical'],
      76: ['Physical'],
      80: ['Physical'],
      90: ['Physical']
    },
    skillPools: {
      1: ['shield_bash'],
      40: ['shield_bash', 'cleave_strike', 'iron_stance', 'concussive_stun'],
      76: ['shield_bash', 'cleave_strike', 'iron_stance', 'concussive_stun'],
      80: ['titanbreaker'],
      90: ['master_titanbreaker']
    },
    signatureSkills: ['shield_bash', 'cleave_strike'],
    ultimateSkill: 'titanbreaker',
    masterUltimateSkill: 'master_titanbreaker'
  },

  human_sorcerer: {
    classId: 'human_sorcerer',
    race: 'Human',
    baseClass: 'human_mystic',
    primaryRole: 'burst_damage',
    lv40Identity: 'Fire Specialist',
    lv76Identity: 'Fire + Magma Mastery',
    allowedElementsByLevel: {
      1: ['*magic*'],
      40: ['Fire'],
      76: ['Fire', 'Magma'],
      80: ['Fire', 'Magma'],
      90: ['Fire', 'Magma']
    },
    skillPools: {
      1: ['wind_strike'],
      40: ['fireball', 'flame_nova'],
      76: ['magma_spike'],
      80: ['meteor'],
      90: ['master_meteor']
    },
    signatureSkills: ['fireball', 'flame_nova'],
    ultimateSkill: 'meteor',
    masterUltimateSkill: 'master_meteor'
  },

  human_death_knight: {
    classId: 'human_death_knight',
    race: 'Human',
    baseClass: 'human_fighter',
    primaryRole: 'finisher',
    lv40Identity: 'Infernal Dark Knight',
    lv76Identity: 'Fire + Dark Mastery',
    allowedElementsByLevel: {
      1: ['Physical', 'Dark'],
      40: ['Fire', 'Dark'],
      76: ['Fire', 'Dark'],
      80: ['Fire', 'Dark'],
      90: ['Fire', 'Dark']
    },
    skillPools: {
      1: ['cinderblade'],
      40: ['cinderblade', 'hellfire_grasp', 'ashen_shroud', 'infernal_judgment'],
      76: ['cinderblade', 'hellfire_grasp', 'ashen_shroud', 'infernal_judgment'],
      80: ['infernal_apocalypse'],
      90: ['master_infernal_apocalypse']
    },
    signatureSkills: ['cinderblade', 'infernal_judgment'],
    ultimateSkill: 'infernal_apocalypse',
    masterUltimateSkill: 'master_infernal_apocalypse'
  },

  human_warg: {
    classId: 'human_warg',
    race: 'Human',
    baseClass: 'human_fighter',
    primaryRole: 'mobility',
    lv40Identity: 'Primal Beast Combat',
    lv76Identity: 'Primal Physical Mastery',
    allowedElementsByLevel: {
      1: ['Physical'],
      40: ['Physical'],
      76: ['Physical'],
      80: ['Physical'],
      90: ['Physical']
    },
    skillPools: {
      1: ['savage_bite'],
      40: ['savage_bite', 'pack_howl', 'feral_pounce', 'beast_form'],
      76: ['savage_bite', 'pack_howl', 'feral_pounce', 'beast_form'],
      80: ['primal_overrun'],
      90: ['master_primal_overrun']
    },
    signatureSkills: ['savage_bite', 'feral_pounce'],
    ultimateSkill: 'primal_overrun',
    masterUltimateSkill: 'master_primal_overrun'
  },

  human_assassin: {
    classId: 'human_assassin',
    race: 'Human',
    baseClass: 'human_fighter',
    primaryRole: 'finisher',
    lv40Identity: 'Shadow Assassin',
    lv76Identity: 'Dark + Physical Mastery',
    allowedElementsByLevel: {
      1: ['Physical'],
      40: ['Dark', 'Physical'],
      76: ['Dark', 'Physical'],
      80: ['Dark', 'Physical'],
      90: ['Dark', 'Physical']
    },
    skillPools: {
      1: ['gloom_strike'],
      40: ['shadow_clone', 'gloom_strike', 'veil_step', 'night_execution'],
      76: ['shadow_clone', 'gloom_strike', 'veil_step', 'night_execution'],
      80: ['nightfall_execution'],
      90: ['master_nightfall_execution']
    },
    signatureSkills: ['shadow_clone', 'night_execution'],
    ultimateSkill: 'nightfall_execution',
    masterUltimateSkill: 'master_nightfall_execution'
  },

  // ─── Elf (3 classes) ────────────────────────────────────────────────────────
  elf_fighter: {
    classId: 'elf_fighter',
    race: 'Elf',
    baseClass: 'elf_fighter',
    primaryRole: 'mobility',
    lv40Identity: 'Tidal Warrior',
    lv76Identity: 'Water + Ice',
    allowedElementsByLevel: {
      1: ['Physical'],
      40: ['Water', 'Physical'],
      76: ['Water', 'Ice', 'Physical'],
      80: ['Water', 'Ice', 'Physical'],
      90: ['Water', 'Ice', 'Physical']
    },
    skillPools: {
      1: ['aqua_arrow'],
      40: ['aqua_arrow', 'tide_step', 'mist_guard', 'riptide_volley'],
      76: ['aqua_arrow', 'tide_step', 'mist_guard', 'riptide_volley'],
      80: ['tidal_ascension'],
      90: ['master_tidal_ascension']
    },
    signatureSkills: ['aqua_arrow', 'riptide_volley'],
    ultimateSkill: 'tidal_ascension',
    masterUltimateSkill: 'master_tidal_ascension'
  },

  elf_mage: {
    classId: 'elf_mage',
    race: 'Elf',
    baseClass: 'elven_mystic',
    primaryRole: 'aoe_damage',
    lv40Identity: 'Water Mage',
    lv76Identity: 'Water + Ice',
    allowedElementsByLevel: {
      1: ['*magic*'],
      40: ['Water'],
      76: ['Water', 'Ice'],
      80: ['Water', 'Ice'],
      90: ['Water', 'Ice']
    },
    skillPools: {
      1: ['hydro_blast'],
      40: ['hydro_blast', 'tidal_surge'],
      76: ['blizzard'],
      80: ['glacial_cataclysm'],
      90: ['master_glacial_cataclysm']
    },
    signatureSkills: ['hydro_blast', 'tidal_surge'],
    ultimateSkill: 'glacial_cataclysm',
    masterUltimateSkill: 'master_glacial_cataclysm'
  },

  elf_death_knight: {
    classId: 'elf_death_knight',
    race: 'Elf',
    baseClass: 'elf_fighter',
    primaryRole: 'finisher',
    lv40Identity: 'Frost Death Knight',
    lv76Identity: 'Ice + Dark Mastery',
    allowedElementsByLevel: {
      1: ['Physical', 'Dark'],
      40: ['Ice', 'Dark'],
      76: ['Ice', 'Dark'],
      80: ['Ice', 'Dark'],
      90: ['Ice', 'Dark']
    },
    skillPools: {
      1: ['frost_edge'],
      40: ['frost_edge', 'shattering_gaze', 'cursed_frost_veil', 'glacial_judgment'],
      76: ['frost_edge', 'shattering_gaze', 'cursed_frost_veil', 'glacial_judgment'],
      80: ['frostmourne_judgment'],
      90: ['master_frostmourne_judgment']
    },
    signatureSkills: ['frost_edge', 'glacial_judgment'],
    ultimateSkill: 'frostmourne_judgment',
    masterUltimateSkill: 'master_frostmourne_judgment'
  },

  // ─── Dark Elf (5 classes) ───────────────────────────────────────────────────
  dark_elf_fighter: {
    classId: 'dark_elf_fighter',
    race: 'Dark Elf',
    baseClass: 'dark_fighter',
    primaryRole: 'dot',
    lv40Identity: 'Venomous Dark Warrior',
    lv76Identity: 'Dark + Poison Mastery',
    allowedElementsByLevel: {
      1: ['Physical'],
      40: ['Dark', 'Poison'],
      76: ['Dark', 'Poison'],
      80: ['Dark', 'Poison'],
      90: ['Dark', 'Poison']
    },
    skillPools: {
      1: ['venom_edge'],
      40: ['venom_edge', 'life_siphon', 'umbral_dash', 'crippling_slash'],
      76: ['venom_edge', 'life_siphon', 'umbral_dash', 'crippling_slash'],
      80: ['abyssal_rupture'],
      90: ['master_abyssal_rupture']
    },
    signatureSkills: ['venom_edge', 'crippling_slash'],
    ultimateSkill: 'abyssal_rupture',
    masterUltimateSkill: 'master_abyssal_rupture'
  },

  dark_elf_mage: {
    classId: 'dark_elf_mage',
    race: 'Dark Elf',
    baseClass: 'dark_mystic',
    primaryRole: 'aoe_damage',
    lv40Identity: 'Abyssal Storm Mage',
    lv76Identity: 'Wind + Lightning + Dark',
    allowedElementsByLevel: {
      1: ['*magic*'],
      40: ['Wind', 'Dark'],
      76: ['Wind', 'Lightning', 'Dark'],
      80: ['Wind', 'Lightning', 'Dark'],
      90: ['Wind', 'Lightning', 'Dark']
    },
    skillPools: {
      1: ['hurricane'],
      40: ['hurricane', 'curse_of_shadow', 'gale_slash'],
      76: ['chain_lightning'],
      80: ['tempest_of_the_abyss'],
      90: ['master_tempest_of_the_abyss']
    },
    signatureSkills: ['hurricane', 'curse_of_shadow'],
    ultimateSkill: 'tempest_of_the_abyss',
    masterUltimateSkill: 'master_tempest_of_the_abyss'
  },

  dark_elf_death_knight: {
    classId: 'dark_elf_death_knight',
    race: 'Dark Elf',
    baseClass: 'dark_fighter',
    primaryRole: 'burst_damage',
    lv40Identity: 'Voltaic Death Knight',
    lv76Identity: 'Lightning + Dark Mastery',
    allowedElementsByLevel: {
      1: ['Physical', 'Dark'],
      40: ['Lightning', 'Dark'],
      76: ['Lightning', 'Dark'],
      80: ['Lightning', 'Dark'],
      90: ['Lightning', 'Dark']
    },
    skillPools: {
      1: ['voltaic_edge'],
      40: ['voltaic_edge', 'storm_judgment', 'thunder_veil', 'shocking_grasp'],
      76: ['voltaic_edge', 'storm_judgment', 'thunder_veil', 'shocking_grasp'],
      80: ['voltaic_requiem'],
      90: ['master_voltaic_requiem']
    },
    signatureSkills: ['voltaic_edge', 'storm_judgment'],
    ultimateSkill: 'voltaic_requiem',
    masterUltimateSkill: 'master_voltaic_requiem'
  },

  dark_elf_assassin: {
    classId: 'dark_elf_assassin',
    race: 'Dark Elf',
    baseClass: 'dark_fighter',
    primaryRole: 'dot',
    lv40Identity: 'Venomous Assassin',
    lv76Identity: 'Dark + Poison Mastery',
    allowedElementsByLevel: {
      1: ['Physical'],
      40: ['Dark', 'Poison'],
      76: ['Dark', 'Poison'],
      80: ['Dark', 'Poison'],
      90: ['Dark', 'Poison']
    },
    skillPools: {
      1: ['venom_fang'],
      40: ['toxic_flurry', 'venom_fang', 'shadow_toxin', 'lethal_dose'],
      76: ['toxic_flurry', 'venom_fang', 'shadow_toxin', 'lethal_dose'],
      80: ['venomous_eclipse'],
      90: ['master_venomous_eclipse']
    },
    signatureSkills: ['toxic_flurry', 'lethal_dose'],
    ultimateSkill: 'venomous_eclipse',
    masterUltimateSkill: 'master_venomous_eclipse'
  },

  dark_elf_blood_rose: {
    classId: 'dark_elf_blood_rose',
    race: 'Dark Elf',
    baseClass: 'dark_mystic',
    primaryRole: 'debuff_hex',
    lv40Identity: 'Crimson Curse',
    lv76Identity: 'Dark + Blood Mastery',
    allowedElementsByLevel: {
      1: ['Dark'],
      40: ['Dark', 'Blood'],
      76: ['Dark', 'Blood'],
      80: ['Dark', 'Blood'],
      90: ['Dark', 'Blood']
    },
    skillPools: {
      1: ['thorned_hex'],
      40: ['thorned_hex', 'crimson_drain', 'wilting_touch', 'rose_requiem'],
      76: ['thorned_hex', 'crimson_drain', 'wilting_touch', 'rose_requiem'],
      80: ['crimson_requiem'],
      90: ['master_crimson_requiem']
    },
    signatureSkills: ['thorned_hex', 'rose_requiem'],
    ultimateSkill: 'crimson_requiem',
    masterUltimateSkill: 'master_crimson_requiem'
  },

  // ─── Orc (3 classes) ────────────────────────────────────────────────────────
  orc_fighter: {
    classId: 'orc_fighter',
    race: 'Orc',
    baseClass: 'orc_fighter',
    primaryRole: 'finisher',
    lv40Identity: 'Fire Berserker',
    lv76Identity: 'Physical + Fire Mastery',
    allowedElementsByLevel: {
      1: ['Physical'],
      40: ['Physical', 'Fire'],
      76: ['Physical', 'Fire'],
      80: ['Physical', 'Fire'],
      90: ['Physical', 'Fire']
    },
    skillPools: {
      1: ['brutal_cleave'],
      40: ['totem_rage', 'brutal_cleave', 'war_stomp', 'blood_frenzy'],
      76: ['totem_rage', 'brutal_cleave', 'war_stomp', 'blood_frenzy'],
      80: ['worldbreaker_roar'],
      90: ['master_worldbreaker_roar']
    },
    signatureSkills: ['brutal_cleave', 'war_stomp'],
    ultimateSkill: 'worldbreaker_roar',
    masterUltimateSkill: 'master_worldbreaker_roar'
  },

  orc_shaman: {
    classId: 'orc_shaman',
    race: 'Orc',
    baseClass: 'orc_mage',
    primaryRole: 'buff_support',
    lv40Identity: 'Fire Shaman',
    lv76Identity: 'Fire Mastery',
    allowedElementsByLevel: {
      1: ['*magic*'],
      40: ['Fire'],
      76: ['Fire'],
      80: ['Fire'],
      90: ['Fire']
    },
    skillPools: {
      1: ['ember_bolt'],
      40: ['flame_totem', 'war_chant', 'ember_bolt', 'scorching_ground'],
      76: ['flame_totem', 'war_chant', 'ember_bolt', 'scorching_ground'],
      80: ['apocalypse_totem'],
      90: ['master_apocalypse_totem']
    },
    signatureSkills: ['flame_totem', 'war_chant'],
    ultimateSkill: 'apocalypse_totem',
    masterUltimateSkill: 'master_apocalypse_totem'
  },

  orc_vanguard_rider: {
    classId: 'orc_vanguard_rider',
    race: 'Orc',
    baseClass: 'orc_fighter',
    primaryRole: 'mobility',
    lv40Identity: 'Infernal Rider',
    lv76Identity: 'Physical + Fire Mastery',
    allowedElementsByLevel: {
      1: ['Physical'],
      40: ['Physical', 'Fire'],
      76: ['Physical', 'Fire'],
      80: ['Physical', 'Fire'],
      90: ['Physical', 'Fire']
    },
    skillPools: {
      1: ['flaming_charge'],
      40: ['flaming_charge', 'spear_of_embers', 'trample', 'wildfire_lance'],
      76: ['flaming_charge', 'spear_of_embers', 'trample', 'wildfire_lance'],
      80: ['inferno_charge'],
      90: ['master_inferno_charge']
    },
    signatureSkills: ['flaming_charge', 'wildfire_lance'],
    ultimateSkill: 'inferno_charge',
    masterUltimateSkill: 'master_inferno_charge'
  },

  // ─── Dwarf (3 classes) ──────────────────────────────────────────────────────
  dwarf_artisan: {
    classId: 'dwarf_artisan',
    race: 'Dwarf',
    baseClass: 'dwarven_fighter',
    primaryRole: 'utility',
    lv40Identity: 'Earthforged Artisan',
    lv76Identity: 'Earth + Metal',
    allowedElementsByLevel: {
      1: ['Physical'],
      40: ['Earth', 'Physical'],
      76: ['Earth', 'Metal', 'Physical'],
      80: ['Earth', 'Metal', 'Physical'],
      90: ['Earth', 'Metal', 'Physical']
    },
    skillPools: {
      1: ['hammer_slam'],
      40: ['hammer_slam', 'construct_summon', 'reinforced_plating', 'seismic_stun'],
      76: ['hammer_slam', 'construct_summon', 'reinforced_plating', 'seismic_stun'],
      80: ['forge_colossus'],
      90: ['master_forge_colossus']
    },
    signatureSkills: ['hammer_slam', 'construct_summon'],
    ultimateSkill: 'forge_colossus',
    masterUltimateSkill: 'master_forge_colossus'
  },

  dwarf_mage: {
    classId: 'dwarf_mage',
    race: 'Dwarf',
    baseClass: 'dwarven_fighter',
    primaryRole: 'aoe_damage',
    lv40Identity: 'Earthforge Sage',
    lv76Identity: 'Earth + Metal + Crystal',
    allowedElementsByLevel: {
      1: ['Earth'],
      40: ['Earth', 'Metal'],
      76: ['Earth', 'Metal', 'Crystal'],
      80: ['Earth', 'Metal', 'Crystal'],
      90: ['Earth', 'Metal', 'Crystal']
    },
    skillPools: {
      1: ['rochedo'],
      40: ['terremoto', 'rochedo', 'golem_de_metal', 'garra_metalica'],
      76: ['terremoto', 'rochedo', 'golem_de_metal', 'garra_metalica'],
      80: ['earthforge_cataclysm'],
      90: ['master_earthforge_cataclysm']
    },
    signatureSkills: ['terremoto', 'golem_de_metal'],
    ultimateSkill: 'earthforge_cataclysm',
    masterUltimateSkill: 'master_earthforge_cataclysm'
  },

  dwarf_shinemaker: {
    classId: 'dwarf_shinemaker',
    race: 'Dwarf',
    baseClass: 'dwarven_fighter',
    primaryRole: 'buff_support',
    lv40Identity: 'Holy Forge',
    lv76Identity: 'Holy Mastery',
    allowedElementsByLevel: {
      1: ['Physical'],
      40: ['Holy'],
      76: ['Holy'],
      80: ['Holy'],
      90: ['Holy']
    },
    skillPools: {
      1: ['radiant_hammer'],
      40: ['radiant_hammer', 'guiding_light', 'celestial_forge', 'sunfall_smash'],
      76: ['radiant_hammer', 'guiding_light', 'celestial_forge', 'sunfall_smash'],
      80: ['divine_forge'],
      90: ['master_divine_forge']
    },
    signatureSkills: ['radiant_hammer', 'celestial_forge'],
    ultimateSkill: 'divine_forge',
    masterUltimateSkill: 'master_divine_forge'
  },

  // ─── Kamael (2 classes) ─────────────────────────────────────────────────────
  kamael_soulbreaker: {
    classId: 'kamael_soulbreaker',
    race: 'Kamael',
    baseClass: 'kamael_soldier',
    primaryRole: 'sustain_heal',
    lv40Identity: 'Soul Reaver',
    lv76Identity: 'Dark + Physical Mastery',
    allowedElementsByLevel: {
      1: ['Physical'],
      40: ['Dark', 'Physical'],
      76: ['Dark', 'Physical'],
      80: ['Dark', 'Physical'],
      90: ['Dark', 'Physical']
    },
    skillPools: {
      1: ['soul_rend'],
      40: ['soul_rend', 'abyssal_pierce', 'essence_drain', 'shadowmark'],
      76: ['soul_rend', 'abyssal_pierce', 'essence_drain', 'shadowmark'],
      80: ['soul_devastation'],
      90: ['master_soul_devastation']
    },
    signatureSkills: ['soul_rend', 'essence_drain'],
    ultimateSkill: 'soul_devastation',
    masterUltimateSkill: 'master_soul_devastation'
  },

  kamael_samurai: {
    classId: 'kamael_samurai',
    race: 'Kamael',
    baseClass: 'kamael_soldier',
    primaryRole: 'burst_damage',
    lv40Identity: 'Tempest Blade',
    lv76Identity: 'Physical + Wind Mastery',
    allowedElementsByLevel: {
      1: ['Physical'],
      40: ['Physical', 'Wind'],
      76: ['Physical', 'Wind'],
      80: ['Physical', 'Wind'],
      90: ['Physical', 'Wind']
    },
    skillPools: {
      1: ['iaijutsu_strike'],
      40: ['iaijutsu_strike', 'gale_step', 'silent_edge', 'tempest_form'],
      76: ['iaijutsu_strike', 'gale_step', 'silent_edge', 'tempest_form'],
      80: ['heaven_cutting_tempest'],
      90: ['master_heaven_cutting_tempest']
    },
    signatureSkills: ['iaijutsu_strike', 'tempest_form'],
    ultimateSkill: 'heaven_cutting_tempest',
    masterUltimateSkill: 'master_heaven_cutting_tempest'
  },

  // ─── Ertheia / Sylph (2 classes) ───────────────────────────────────────────
  ertheia_storm_blaster: {
    classId: 'ertheia_storm_blaster',
    race: 'Ertheia',
    baseClass: 'sylph_gunner',
    primaryRole: 'aoe_damage',
    lv40Identity: 'Storm Gunner',
    lv76Identity: 'Wind Mastery',
    allowedElementsByLevel: {
      1: ['Wind'],
      40: ['Wind'],
      76: ['Wind'],
      80: ['Wind'],
      90: ['Wind']
    },
    skillPools: {
      1: ['gale_shot'],
      40: ['gale_shot', 'cyclone_trap', 'sky_dance', 'tempest_barrage'],
      76: ['gale_shot', 'cyclone_trap', 'sky_dance', 'tempest_barrage'],
      80: ['cyclone_barrage'],
      90: ['master_cyclone_barrage']
    },
    signatureSkills: ['gale_shot', 'tempest_barrage'],
    ultimateSkill: 'cyclone_barrage',
    masterUltimateSkill: 'master_cyclone_barrage'
  },

  ertheia_marauder: {
    classId: 'ertheia_marauder',
    race: 'Ertheia',
    baseClass: 'ertheia_fighter',
    primaryRole: 'mobility',
    lv40Identity: 'Tempest Seeker',
    lv76Identity: 'Wind Mastery',
    allowedElementsByLevel: {
      1: ['Physical'],
      40: ['Wind', 'Physical'],
      76: ['Wind', 'Physical'],
      80: ['Wind', 'Physical'],
      90: ['Wind', 'Physical']
    },
    skillPools: {
      1: ['whirlwind_dash'],
      40: ['whirlwind_dash', 'spirit_gale', 'twin_gust_slash', 'tempest_veil'],
      76: ['whirlwind_dash', 'spirit_gale', 'twin_gust_slash', 'tempest_veil'],
      80: ['tempest_breaker'],
      90: ['master_tempest_breaker']
    },
    signatureSkills: ['whirlwind_dash', 'tempest_veil'],
    ultimateSkill: 'tempest_breaker',
    masterUltimateSkill: 'master_tempest_breaker'
  },

  // ─── High Elf (2 classes) ──────────────────────────────────────────────────
  high_elf_divine_templar: {
    classId: 'high_elf_divine_templar',
    race: 'High Elf',
    baseClass: 'high_elf_templar',
    primaryRole: 'defensive_shield',
    lv40Identity: 'Holy Templar',
    lv76Identity: 'Holy Mastery',
    allowedElementsByLevel: {
      1: ['Holy'],
      40: ['Holy'],
      76: ['Holy'],
      80: ['Holy'],
      90: ['Holy']
    },
    skillPools: {
      1: ['divine_bulwark'],
      40: ['divine_bulwark', 'retribution_flare', 'sacred_ward', 'light_point_judgment'],
      76: ['divine_bulwark', 'retribution_flare', 'sacred_ward', 'light_point_judgment'],
      80: ['heavens_aegis'],
      90: ['master_heavens_aegis']
    },
    signatureSkills: ['divine_bulwark', 'sacred_ward'],
    ultimateSkill: 'heavens_aegis',
    masterUltimateSkill: 'master_heavens_aegis'
  },

  high_elf_element_weaver: {
    classId: 'high_elf_element_weaver',
    race: 'High Elf',
    baseClass: 'high_elf_mystic',
    primaryRole: 'aoe_damage',
    lv40Identity: 'Prismatic Weaver',
    lv76Identity: 'Fire, Water, Wind',
    allowedElementsByLevel: {
      1: ['Fire', 'Water', 'Wind'],
      40: ['Fire', 'Water', 'Wind'],
      76: ['Fire', 'Water', 'Wind'],
      80: ['Fire', 'Water', 'Wind'],
      90: ['Fire', 'Water', 'Wind']
    },
    skillPools: {
      1: ['triad_combo'],
      40: ['triad_combo', 'elemental_fusion', 'cascading_storm', 'phoenix_tide'],
      76: ['triad_combo', 'elemental_fusion', 'cascading_storm', 'phoenix_tide'],
      80: ['prismatic_genesis'],
      90: ['master_prismatic_genesis']
    },
    signatureSkills: ['triad_combo', 'elemental_fusion'],
    ultimateSkill: 'prismatic_genesis',
    masterUltimateSkill: 'master_prismatic_genesis',
    isException: true
  }
});

/**
 * Resolves a class ID through canonical definitions and aliases to its ClassIdentity.
 * @param {string} rawClassId
 * @returns {object|null}
 */
export function getClassIdentity(rawClassId) {
  if (!rawClassId || typeof rawClassId !== 'string') return null;

  if (CLASS_IDENTITIES[rawClassId]) {
    return CLASS_IDENTITIES[rawClassId];
  }

  const normalized = rawClassId.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  if (CLASS_IDENTITIES[normalized]) {
    return CLASS_IDENTITIES[normalized];
  }

  // Alias lookup
  const aliasTarget = CLASS_ALIASES[rawClassId] || CLASS_ALIASES[normalized];
  if (aliasTarget) {
    if (CLASS_IDENTITIES[aliasTarget]) return CLASS_IDENTITIES[aliasTarget];
    const aliasNorm = aliasTarget.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    if (CLASS_IDENTITIES[aliasNorm]) return CLASS_IDENTITIES[aliasNorm];
  }

  return null;
}

/**
 * Returns the elements available to a class at a given level.
 * Single source of truth: allowedElementsByLevel (Option A).
 * @param {string} classId
 * @param {number} level
 * @returns {string[]}
 */
export function getAllowedElements(classId, level = 80) {
  const identity = getClassIdentity(classId);
  if (!identity || !identity.allowedElementsByLevel) {
    return ['Physical'];
  }

  const lvl = Number(level) || 1;
  const thresholds = [90, 80, 76, 40, 1];

  for (const t of thresholds) {
    if (lvl >= t && identity.allowedElementsByLevel[t]) {
      return identity.allowedElementsByLevel[t];
    }
  }

  return identity.allowedElementsByLevel[1] || ['Physical'];
}

export const getAllowedElementsByLevel = getAllowedElements;

/**
 * Returns signature skills for a class.
 * @param {string} classId
 * @returns {string[]}
 */
export function getSignatureSkills(classId) {
  const identity = getClassIdentity(classId);
  return identity?.signatureSkills || [];
}

/**
 * Derives forbidden elements directly from ALL_ELEMENTS - allowedElements.
 * Never stores a duplicated forbidden list.
 * @param {string} classId
 * @param {number} level
 * @returns {string[]}
 */
export function getForbiddenElements(classId, level = 80) {
  const allowed = getAllowedElements(classId, level);
  const expandedAllowed = new Set();
  for (const elem of allowed) {
    expandElement(elem).forEach(e => expandedAllowed.add(e));
  }
  return ALL_ELEMENTS.filter(e => !expandedAllowed.has(e));
}

/**
 * Returns the skill pool for a given class and stage.
 * @param {string} classId
 * @param {string} stage - GENERALIST | SPECIALIZATION | MASTERY | ULTIMATE | MASTER_ULTIMATE
 * @returns {string[]}
 */
export function getSkillPoolForStage(classId, stage) {
  const identity = getClassIdentity(classId);
  if (!identity || !identity.skillPools) return [];

  switch (stage) {
    case 'GENERALIST':
      return identity.skillPools[1] || [];
    case 'SPECIALIZATION':
      return identity.skillPools[40] || [];
    case 'MASTERY':
      return identity.skillPools[76] || [];
    case 'ULTIMATE':
      return identity.skillPools[80] || [];
    case 'MASTER_ULTIMATE':
      return identity.skillPools[90] || [];
    default:
      return [];
  }
}

/**
 * Returns the canonical Lv80 Ultimate skill ID for a class.
 * @param {string} classId
 * @returns {string|null}
 */
export function getUltimateSkill(classId) {
  const identity = getClassIdentity(classId);
  return identity?.ultimateSkill || null;
}

/**
 * Returns the canonical Lv90 Master Ultimate skill ID for a class.
 * @param {string} classId
 * @returns {string|null}
 */
export function getMasterUltimateSkill(classId) {
  const identity = getClassIdentity(classId);
  return identity?.masterUltimateSkill || null;
}

/**
 * Returns all 25 canonical active class identities.
 * @returns {object[]}
 */
export function getAllClassIdentities() {
  return Object.values(CLASS_IDENTITIES);
}
