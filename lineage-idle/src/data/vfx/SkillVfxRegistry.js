/**
 * SkillVfxRegistry.js — Game Data Contract 3.2.1: Skill Visual Effects Catalog
 * 
 * Canonical registry mapping each of the 100 native active skills to a unique visual effect identity.
 * Strictly decoupled from gameplay logic and elemental math.
 * 
 * Contract 3.2.1 Architectural Classification:
 * - VFX_VISUAL_IMPLEMENTATION: 'STRUCTURAL_ONLY'
 * 
 * 4-Layer Architectural Distinction:
 * - VFX_IDENTITY: Unique key mapped 1:1 per native skill (100 distinct identities).
 * - VFX_PROFILE: Visual parameter profile (colors, particles, timing, animation intent).
 * - VFX_RENDER_FAMILY: Graphic primitive family handled by the rendering engine (projectile, slash, impact, aoe, buff).
 * - VFX_RENDER_IMPLEMENTATION: Low-level drawing pipeline (LineageVFX canvas primitives / particles).
 */

export const VFX_VISUAL_IMPLEMENTATION = 'STRUCTURAL_ONLY';

export const VFX_RENDER_FAMILIES = {
  PROJECTILE: 'projectile',
  SLASH: 'slash',
  IMPACT: 'impact',
  AOE: 'aoe',
  BUFF: 'buff'
};

export const SKILL_VFX_REGISTRY = {
  // ─── Human Fighter ─────────────────────────────────────────────────────────
  shield_bash: {
    vfxId: 'vfx_shield_bash',
    skillId: 'shield_bash',
    type: 'impact',
    color: '#c9c9c9',
    particle: 'impact_dust',
    anim: 'shield_slam',
    duration: 500
  },
  cleave_strike: {
    vfxId: 'vfx_cleave_strike',
    skillId: 'cleave_strike',
    type: 'slash',
    color: '#d4d4d4',
    particle: 'steel_arc',
    anim: 'wide_swing',
    duration: 450
  },
  iron_stance: {
    vfxId: 'vfx_iron_stance',
    skillId: 'iron_stance',
    type: 'buff',
    color: '#8a8a8a',
    particle: 'armor_glint',
    anim: 'brace',
    duration: 600
  },
  concussive_stun: {
    vfxId: 'vfx_concussive_stun',
    skillId: 'concussive_stun',
    type: 'impact',
    color: '#e0e0e0',
    particle: 'shock_ring',
    anim: 'overhead_smash',
    duration: 600
  },

  // ─── Human Sorcerer ────────────────────────────────────────────────────────
  fireball: {
    vfxId: 'vfx_fireball',
    skillId: 'fireball',
    type: 'projectile',
    color: '#ff5a1f',
    particle: 'flame_orb_trail',
    anim: 'cast_forward',
    duration: 650
  },
  magma_spike: {
    vfxId: 'vfx_magma_spike',
    skillId: 'magma_spike',
    type: 'aoe',
    color: '#ff2d00',
    particle: 'ground_eruption',
    anim: 'cast_downward',
    duration: 700
  },
  holy_bolt: {
    vfxId: 'vfx_holy_bolt',
    skillId: 'holy_bolt',
    type: 'projectile',
    color: '#fff2b0',
    particle: 'light_beam',
    anim: 'cast_overhead',
    duration: 500
  },
  flame_nova: {
    vfxId: 'vfx_flame_nova',
    skillId: 'flame_nova',
    type: 'aoe',
    color: '#ff7a00',
    particle: 'radial_burst',
    anim: 'cast_aoe',
    duration: 750
  },

  // ─── Human Death Knight ────────────────────────────────────────────────────
  cinderblade: {
    vfxId: 'vfx_cinderblade',
    skillId: 'cinderblade',
    type: 'slash',
    color: '#7a1f1f',
    particle: 'smoldering_edge',
    anim: 'slash_dark',
    duration: 500
  },
  hellfire_grasp: {
    vfxId: 'vfx_hellfire_grasp',
    skillId: 'hellfire_grasp',
    type: 'impact',
    color: '#4a0f0f',
    particle: 'dark_flame_hand',
    anim: 'grab_pull',
    duration: 600
  },
  ashen_shroud: {
    vfxId: 'vfx_ashen_shroud',
    skillId: 'ashen_shroud',
    type: 'buff',
    color: '#3a2a2a',
    particle: 'ash_swirl',
    anim: 'self_buff',
    duration: 650
  },
  infernal_judgment: {
    vfxId: 'vfx_infernal_judgment',
    skillId: 'infernal_judgment',
    type: 'finisher',
    color: '#8b0000',
    particle: 'meteor_dark',
    anim: 'cast_overhead_heavy',
    duration: 800
  },

  // ─── Human Warg ────────────────────────────────────────────────────────────
  savage_bite: {
    vfxId: 'vfx_savage_bite',
    skillId: 'savage_bite',
    type: 'slash',
    color: '#a35b2b',
    particle: 'blood_spray',
    anim: 'lunge_bite',
    duration: 400
  },
  pack_howl: {
    vfxId: 'vfx_pack_howl',
    skillId: 'pack_howl',
    type: 'buff',
    color: '#c98a4b',
    particle: 'sound_wave',
    anim: 'howl',
    duration: 600
  },
  feral_pounce: {
    vfxId: 'vfx_feral_pounce',
    skillId: 'feral_pounce',
    type: 'impact',
    color: '#8a5a2b',
    particle: 'dust_leap',
    anim: 'pounce',
    duration: 500
  },
  beast_form: {
    vfxId: 'vfx_beast_form',
    skillId: 'beast_form',
    type: 'buff',
    color: '#6b4423',
    particle: 'fur_shift',
    anim: 'transform',
    duration: 700
  },

  // ─── Human Assassin ────────────────────────────────────────────────────────
  shadow_clone: {
    vfxId: 'vfx_shadow_clone',
    skillId: 'shadow_clone',
    type: 'buff',
    color: '#2b1a3a',
    particle: 'smoke_split',
    anim: 'blink_duplicate',
    duration: 600
  },
  gloom_strike: {
    vfxId: 'vfx_gloom_strike',
    skillId: 'gloom_strike',
    type: 'slash',
    color: '#1a0f2a',
    particle: 'dark_slash',
    anim: 'backstab',
    duration: 450
  },
  veil_step: {
    vfxId: 'vfx_veil_step',
    skillId: 'veil_step',
    type: 'buff',
    color: '#221133',
    particle: 'fade_trail',
    anim: 'vanish',
    duration: 500
  },
  night_execution: {
    vfxId: 'vfx_night_execution',
    skillId: 'night_execution',
    type: 'finisher',
    color: '#150a20',
    particle: 'shadow_burst',
    anim: 'finisher',
    duration: 700
  },

  // ─── Elven Fighter ─────────────────────────────────────────────────────────
  aqua_arrow: {
    vfxId: 'vfx_aqua_arrow',
    skillId: 'aqua_arrow',
    type: 'projectile',
    color: '#4fc3f7',
    particle: 'water_trail_arrow',
    anim: 'bow_shot',
    duration: 500
  },
  tide_step: {
    vfxId: 'vfx_tide_step',
    skillId: 'tide_step',
    type: 'buff',
    color: '#81d4fa',
    particle: 'ripple_dash',
    anim: 'evade',
    duration: 450
  },
  mist_guard: {
    vfxId: 'vfx_mist_guard',
    skillId: 'mist_guard',
    type: 'buff',
    color: '#b3e5fc',
    particle: 'mist_shield',
    anim: 'defensive_stance',
    duration: 600
  },
  riptide_volley: {
    vfxId: 'vfx_riptide_volley',
    skillId: 'riptide_volley',
    type: 'aoe',
    color: '#29b6f6',
    particle: 'arrow_rain_water',
    anim: 'multi_shot',
    duration: 650
  },

  // ─── Elven Mage ────────────────────────────────────────────────────────────
  hydro_blast: {
    vfxId: 'vfx_hydro_blast',
    skillId: 'hydro_blast',
    type: 'projectile',
    color: '#00acc1',
    particle: 'water_orb_burst',
    anim: 'cast_forward',
    duration: 600
  },
  blizzard: {
    vfxId: 'vfx_blizzard',
    skillId: 'blizzard',
    type: 'aoe',
    color: '#b3e0ff',
    particle: 'snow_swirl_aoe',
    anim: 'cast_aoe',
    duration: 800
  },
  healing_wave: {
    vfxId: 'vfx_healing_wave',
    skillId: 'healing_wave',
    type: 'buff',
    color: '#c8f7ff',
    particle: 'light_ripple',
    anim: 'cast_support',
    duration: 600
  },
  tidal_surge: {
    vfxId: 'vfx_tidal_surge',
    skillId: 'tidal_surge',
    type: 'finisher',
    color: '#0288d1',
    particle: 'wave_crash',
    anim: 'cast_forward_heavy',
    duration: 750
  },

  // ─── Elven Death Knight ────────────────────────────────────────────────────
  frost_edge: {
    vfxId: 'vfx_frost_edge',
    skillId: 'frost_edge',
    type: 'slash',
    color: '#5ec8d8',
    particle: 'frost_crack',
    anim: 'slash_dark',
    duration: 500
  },
  shattering_gaze: {
    vfxId: 'vfx_shattering_gaze',
    skillId: 'shattering_gaze',
    type: 'debuff',
    color: '#3a6a7a',
    particle: 'ice_shard_burst',
    anim: 'cast_gaze',
    duration: 550
  },
  cursed_frost_veil: {
    vfxId: 'vfx_cursed_frost_veil',
    skillId: 'cursed_frost_veil',
    type: 'buff',
    color: '#2a4a5a',
    particle: 'frozen_mist',
    anim: 'self_buff',
    duration: 600
  },
  glacial_judgment: {
    vfxId: 'vfx_glacial_judgment',
    skillId: 'glacial_judgment',
    type: 'finisher',
    color: '#1a3a4a',
    particle: 'ice_spike_dark',
    anim: 'cast_overhead_heavy',
    duration: 800
  },

  // ─── Dark Elven Fighter ────────────────────────────────────────────────────
  venom_edge: {
    vfxId: 'vfx_venom_edge',
    skillId: 'venom_edge',
    type: 'slash',
    color: '#5a1f5a',
    particle: 'poison_drip_blade',
    anim: 'slash',
    duration: 450
  },
  life_siphon: {
    vfxId: 'vfx_life_siphon',
    skillId: 'life_siphon',
    type: 'channel',
    color: '#7a0f4a',
    particle: 'blood_drain',
    anim: 'vampiric_strike',
    duration: 600
  },
  umbral_dash: {
    vfxId: 'vfx_umbral_dash',
    skillId: 'umbral_dash',
    type: 'impact',
    color: '#3a0f3a',
    particle: 'shadow_dash',
    anim: 'dash_attack',
    duration: 400
  },
  crippling_slash: {
    vfxId: 'vfx_crippling_slash',
    skillId: 'crippling_slash',
    type: 'slash',
    color: '#4a0f4a',
    particle: 'dark_gash',
    anim: 'heavy_slash',
    duration: 500
  },

  // ─── Dark Elven Mage ───────────────────────────────────────────────────────
  hurricane: {
    vfxId: 'vfx_hurricane',
    skillId: 'hurricane',
    type: 'aoe',
    color: '#8e44ad',
    particle: 'cyclone_debris',
    anim: 'cast_aoe',
    duration: 750
  },
  chain_lightning: {
    vfxId: 'vfx_chain_lightning',
    skillId: 'chain_lightning',
    type: 'projectile',
    color: '#a463f2',
    particle: 'electric_arc_chain',
    anim: 'cast_forward',
    duration: 600
  },
  curse_of_shadow: {
    vfxId: 'vfx_curse_of_shadow',
    skillId: 'curse_of_shadow',
    type: 'debuff',
    color: '#4a1a5a',
    particle: 'curse_sigil',
    anim: 'cast_debuff',
    duration: 550
  },
  gale_slash: {
    vfxId: 'vfx_gale_slash',
    skillId: 'gale_slash',
    type: 'slash',
    color: '#9b59b6',
    particle: 'wind_blade',
    anim: 'cast_slash',
    duration: 450
  },

  // ─── Dark Elven Death Knight ───────────────────────────────────────────────
  voltaic_edge: {
    vfxId: 'vfx_voltaic_edge',
    skillId: 'voltaic_edge',
    type: 'slash',
    color: '#b388ff',
    particle: 'static_crackle_blade',
    anim: 'slash_dark',
    duration: 500
  },
  storm_judgment: {
    vfxId: 'vfx_storm_judgment',
    skillId: 'storm_judgment',
    type: 'finisher',
    color: '#7e57c2',
    particle: 'lightning_pillar',
    anim: 'cast_overhead_heavy',
    duration: 800
  },
  thunder_veil: {
    vfxId: 'vfx_thunder_veil',
    skillId: 'thunder_veil',
    type: 'buff',
    color: '#5e35b1',
    particle: 'static_field',
    anim: 'self_buff',
    duration: 600
  },
  shocking_grasp: {
    vfxId: 'vfx_shocking_grasp',
    skillId: 'shocking_grasp',
    type: 'impact',
    color: '#673ab7',
    particle: 'arc_hand',
    anim: 'grab_pull',
    duration: 550
  },

  // ─── Dark Elven Assassin ───────────────────────────────────────────────────
  toxic_flurry: {
    vfxId: 'vfx_toxic_flurry',
    skillId: 'toxic_flurry',
    type: 'aoe',
    color: '#6a1b9a',
    particle: 'poison_cloud_burst',
    anim: 'flurry',
    duration: 600
  },
  venom_fang: {
    vfxId: 'vfx_venom_fang',
    skillId: 'venom_fang',
    type: 'slash',
    color: '#4a148c',
    particle: 'fang_drip',
    anim: 'backstab',
    duration: 450
  },
  shadow_toxin: {
    vfxId: 'vfx_shadow_toxin',
    skillId: 'shadow_toxin',
    type: 'projectile',
    color: '#38006b',
    particle: 'dark_vial_throw',
    anim: 'throw',
    duration: 500
  },
  lethal_dose: {
    vfxId: 'vfx_lethal_dose',
    skillId: 'lethal_dose',
    type: 'finisher',
    color: '#2a004b',
    particle: 'poison_execution',
    anim: 'finisher',
    duration: 700
  },

  // ─── Dark Elven Blood Rose ─────────────────────────────────────────────────
  thorned_hex: {
    vfxId: 'vfx_thorned_hex',
    skillId: 'thorned_hex',
    type: 'debuff',
    color: '#7a0020',
    particle: 'thorn_vine_dark',
    anim: 'cast_debuff',
    duration: 600
  },
  crimson_drain: {
    vfxId: 'vfx_crimson_drain',
    skillId: 'crimson_drain',
    type: 'channel',
    color: '#9a0030',
    particle: 'blood_tendrils',
    anim: 'drain_channel',
    duration: 650
  },
  wilting_touch: {
    vfxId: 'vfx_wilting_touch',
    skillId: 'wilting_touch',
    type: 'debuff',
    color: '#5a0020',
    particle: 'withering_petals',
    anim: 'cast_touch',
    duration: 500
  },
  rose_requiem: {
    vfxId: 'vfx_rose_requiem',
    skillId: 'rose_requiem',
    type: 'finisher',
    color: '#4a0018',
    particle: 'petal_explosion_dark',
    anim: 'cast_ultimate',
    duration: 850
  },

  // ─── Orc Fighter ───────────────────────────────────────────────────────────
  totem_rage: {
    vfxId: 'vfx_totem_rage',
    skillId: 'totem_rage',
    type: 'buff',
    color: '#e65100',
    particle: 'totem_flame_aura',
    anim: 'self_buff',
    duration: 600
  },
  brutal_cleave: {
    vfxId: 'vfx_brutal_cleave',
    skillId: 'brutal_cleave',
    type: 'slash',
    color: '#bf360c',
    particle: 'heavy_impact',
    anim: 'wide_swing',
    duration: 500
  },
  war_stomp: {
    vfxId: 'vfx_war_stomp',
    skillId: 'war_stomp',
    type: 'impact',
    color: '#d84315',
    particle: 'ground_crack_fire',
    anim: 'stomp',
    duration: 550
  },
  blood_frenzy: {
    vfxId: 'vfx_blood_frenzy',
    skillId: 'blood_frenzy',
    type: 'buff',
    color: '#8d2f0f',
    particle: 'red_aura',
    anim: 'self_buff_heavy',
    duration: 650
  },

  // ─── Orc Shaman ────────────────────────────────────────────────────────────
  flame_totem: {
    vfxId: 'vfx_flame_totem',
    skillId: 'flame_totem',
    type: 'summon',
    color: '#ff6f00',
    particle: 'totem_summon_fire',
    anim: 'cast_summon',
    duration: 600
  },
  war_chant: {
    vfxId: 'vfx_war_chant',
    skillId: 'war_chant',
    type: 'buff',
    color: '#ff9800',
    particle: 'aura_pulse_group',
    anim: 'cast_group_buff',
    duration: 550
  },
  ember_bolt: {
    vfxId: 'vfx_ember_bolt',
    skillId: 'ember_bolt',
    type: 'projectile',
    color: '#ff5722',
    particle: 'ember_projectile',
    anim: 'cast_forward',
    duration: 500
  },
  scorching_ground: {
    vfxId: 'vfx_scorching_ground',
    skillId: 'scorching_ground',
    type: 'aoe',
    color: '#e64a19',
    particle: 'fire_field',
    anim: 'cast_aoe',
    duration: 700
  },

  // ─── Orc Vanguard Rider ────────────────────────────────────────────────────
  flaming_charge: {
    vfxId: 'vfx_flaming_charge',
    skillId: 'flaming_charge',
    type: 'impact',
    color: '#ff3d00',
    particle: 'fire_trail_charge',
    anim: 'mounted_charge',
    duration: 550
  },
  spear_of_embers: {
    vfxId: 'vfx_spear_of_embers',
    skillId: 'spear_of_embers',
    type: 'slash',
    color: '#f4511e',
    particle: 'ember_spear',
    anim: 'thrust',
    duration: 450
  },
  trample: {
    vfxId: 'vfx_trample',
    skillId: 'trample',
    type: 'impact',
    color: '#bf360c',
    particle: 'dust_trample',
    anim: 'mounted_trample',
    duration: 500
  },
  wildfire_lance: {
    vfxId: 'vfx_wildfire_lance',
    skillId: 'wildfire_lance',
    type: 'finisher',
    color: '#dd2c00',
    particle: 'fire_lance_impact',
    anim: 'mounted_thrust_heavy',
    duration: 750
  },

  // ─── Dwarven Artisan ───────────────────────────────────────────────────────
  hammer_slam: {
    vfxId: 'vfx_hammer_slam',
    skillId: 'hammer_slam',
    type: 'impact',
    color: '#795548',
    particle: 'ground_shatter',
    anim: 'hammer_swing',
    duration: 500
  },
  construct_summon: {
    vfxId: 'vfx_construct_summon',
    skillId: 'construct_summon',
    type: 'summon',
    color: '#8d6e63',
    particle: 'assembly_sparks',
    anim: 'cast_summon',
    duration: 650
  },
  reinforced_plating: {
    vfxId: 'vfx_reinforced_plating',
    skillId: 'reinforced_plating',
    type: 'buff',
    color: '#9e9e9e',
    particle: 'metal_plate_shine',
    anim: 'self_buff',
    duration: 600
  },
  seismic_stun: {
    vfxId: 'vfx_seismic_stun',
    skillId: 'seismic_stun',
    type: 'impact',
    color: '#6d4c41',
    particle: 'shockwave_ground',
    anim: 'ground_slam',
    duration: 550
  },

  // ─── Dwarven Mage ──────────────────────────────────────────────────────────
  terremoto: {
    vfxId: 'vfx_terremoto',
    skillId: 'terremoto',
    type: 'aoe',
    color: '#5d4037',
    particle: 'fissure_shockwave',
    anim: 'cast_aoe_ground',
    duration: 700
  },
  rochedo: {
    vfxId: 'vfx_rochedo',
    skillId: 'rochedo',
    type: 'projectile',
    color: '#6d5a4a',
    particle: 'boulder_slam',
    anim: 'cast_forward_heavy',
    duration: 650
  },
  golem_de_metal: {
    vfxId: 'vfx_golem_de_metal',
    skillId: 'golem_de_metal',
    type: 'summon',
    color: '#78909c',
    particle: 'molten_metal_assembly',
    anim: 'cast_summon',
    duration: 700
  },
  garra_metalica: {
    vfxId: 'vfx_garra_metalica',
    skillId: 'garra_metalica',
    type: 'slash',
    color: '#607d8b',
    particle: 'metal_claw_swipe',
    anim: 'cast_slash',
    duration: 450
  },

  // ─── Dwarven ShineMaker ────────────────────────────────────────────────────
  radiant_hammer: {
    vfxId: 'vfx_radiant_hammer',
    skillId: 'radiant_hammer',
    type: 'impact',
    color: '#fff59d',
    particle: 'light_hammer_glow',
    anim: 'hammer_swing_holy',
    duration: 500
  },
  guiding_light: {
    vfxId: 'vfx_guiding_light',
    skillId: 'guiding_light',
    type: 'buff',
    color: '#ffee58',
    particle: 'light_beam_support',
    anim: 'cast_support',
    duration: 600
  },
  celestial_forge: {
    vfxId: 'vfx_celestial_forge',
    skillId: 'celestial_forge',
    type: 'buff',
    color: '#ffd54f',
    particle: 'forge_light_sparks',
    anim: 'cast_buff_group',
    duration: 650
  },
  sunfall_smash: {
    vfxId: 'vfx_sunfall_smash',
    skillId: 'sunfall_smash',
    type: 'finisher',
    color: '#ffca28',
    particle: 'solar_impact',
    anim: 'hammer_slam_holy',
    duration: 750
  },

  // ─── Kamael Soulbreaker ────────────────────────────────────────────────────
  soul_rend: {
    vfxId: 'vfx_soul_rend',
    skillId: 'soul_rend',
    type: 'slash',
    color: '#4a148c',
    particle: 'soul_wisp_tear',
    anim: 'rapier_thrust',
    duration: 450
  },
  abyssal_pierce: {
    vfxId: 'vfx_abyssal_pierce',
    skillId: 'abyssal_pierce',
    type: 'slash',
    color: '#311b92',
    particle: 'void_piercing',
    anim: 'lunge_thrust',
    duration: 500
  },
  essence_drain: {
    vfxId: 'vfx_essence_drain',
    skillId: 'essence_drain',
    type: 'channel',
    color: '#5e35b1',
    particle: 'essence_orb_pull',
    anim: 'drain_channel',
    duration: 650
  },
  shadowmark: {
    vfxId: 'vfx_shadowmark',
    skillId: 'shadowmark',
    type: 'debuff',
    color: '#1a0033',
    particle: 'dark_sigil_mark',
    anim: 'cast_debuff',
    duration: 550
  },

  // ─── Kamael Samurai ────────────────────────────────────────────────────────
  iaijutsu_strike: {
    vfxId: 'vfx_iaijutsu_strike',
    skillId: 'iaijutsu_strike',
    type: 'slash',
    color: '#cfd8dc',
    particle: 'wind_slash_flash',
    anim: 'quickdraw',
    duration: 400
  },
  gale_step: {
    vfxId: 'vfx_gale_step',
    skillId: 'gale_step',
    type: 'impact',
    color: '#eceff1',
    particle: 'wind_dash',
    anim: 'dash_slash',
    duration: 450
  },
  silent_edge: {
    vfxId: 'vfx_silent_edge',
    skillId: 'silent_edge',
    type: 'slash',
    color: '#b0bec5',
    particle: 'swift_slash',
    anim: 'precision_strike',
    duration: 400
  },
  tempest_form: {
    vfxId: 'vfx_tempest_form',
    skillId: 'tempest_form',
    type: 'buff',
    color: '#90a4ae',
    particle: 'wind_aura_spin',
    anim: 'self_buff',
    duration: 650
  },

  // ─── Sylph Storm Blaster ───────────────────────────────────────────────────
  gale_shot: {
    vfxId: 'vfx_gale_shot',
    skillId: 'gale_shot',
    type: 'projectile',
    color: '#26a69a',
    particle: 'wind_bullet',
    anim: 'cast_forward_fast',
    duration: 400
  },
  cyclone_trap: {
    vfxId: 'vfx_cyclone_trap',
    skillId: 'cyclone_trap',
    type: 'aoe',
    color: '#00897b',
    particle: 'vortex_field',
    anim: 'cast_ground_trap',
    duration: 600
  },
  sky_dance: {
    vfxId: 'vfx_sky_dance',
    skillId: 'sky_dance',
    type: 'buff',
    color: '#4db6ac',
    particle: 'feather_swirl',
    anim: 'aerial_evade',
    duration: 500
  },
  tempest_barrage: {
    vfxId: 'vfx_tempest_barrage',
    skillId: 'tempest_barrage',
    type: 'aoe',
    color: '#00695c',
    particle: 'multi_wind_bolt',
    anim: 'cast_aoe_rapid',
    duration: 700
  },

  // ─── High Elf Divine Templar ───────────────────────────────────────────────
  divine_bulwark: {
    vfxId: 'vfx_divine_bulwark',
    skillId: 'divine_bulwark',
    type: 'buff',
    color: '#fff8e1',
    particle: 'light_shield_dome',
    anim: 'cast_shield',
    duration: 600
  },
  retribution_flare: {
    vfxId: 'vfx_retribution_flare',
    skillId: 'retribution_flare',
    type: 'slash',
    color: '#ffe082',
    particle: 'light_counter_flash',
    anim: 'counter_strike',
    duration: 500
  },
  sacred_ward: {
    vfxId: 'vfx_sacred_ward',
    skillId: 'sacred_ward',
    type: 'buff',
    color: '#fff3c4',
    particle: 'holy_barrier',
    anim: 'cast_support',
    duration: 600
  },
  light_point_judgment: {
    vfxId: 'vfx_light_point_judgment',
    skillId: 'light_point_judgment',
    type: 'finisher',
    color: '#ffd740',
    particle: 'light_pillar_strike',
    anim: 'cast_ultimate',
    duration: 800
  },

  // ─── High Elf Element Weaver ───────────────────────────────────────────────
  triad_combo: {
    vfxId: 'vfx_triad_combo',
    skillId: 'triad_combo',
    type: 'projectile',
    color: '#ce93d8',
    particle: 'tri_element_swirl',
    anim: 'cast_combo',
    duration: 650
  },
  elemental_fusion: {
    vfxId: 'vfx_elemental_fusion',
    skillId: 'elemental_fusion',
    type: 'aoe',
    color: '#ba68c8',
    particle: 'fusion_core_burst',
    anim: 'cast_forward_charged',
    duration: 750
  },
  cascading_storm: {
    vfxId: 'vfx_cascading_storm',
    skillId: 'cascading_storm',
    type: 'aoe',
    color: '#9575cd',
    particle: 'storm_wave',
    anim: 'cast_aoe',
    duration: 700
  },
  phoenix_tide: {
    vfxId: 'vfx_phoenix_tide',
    skillId: 'phoenix_tide',
    type: 'finisher',
    color: '#f06292',
    particle: 'steam_flame_burst',
    anim: 'cast_ultimate',
    duration: 850
  },

  // ─── Ertheia Marauder ──────────────────────────────────────────────────────
  whirlwind_dash: {
    vfxId: 'vfx_whirlwind_dash',
    skillId: 'whirlwind_dash',
    type: 'impact',
    color: '#80cbc4',
    particle: 'wind_slash_dash',
    anim: 'dash_attack',
    duration: 450
  },
  spirit_gale: {
    vfxId: 'vfx_spirit_gale',
    skillId: 'spirit_gale',
    type: 'projectile',
    color: '#4db6ac',
    particle: 'spirit_wind_orb',
    anim: 'cast_forward',
    duration: 500
  },
  twin_gust_slash: {
    vfxId: 'vfx_twin_gust_slash',
    skillId: 'twin_gust_slash',
    type: 'slash',
    color: '#26a69a',
    particle: 'double_wind_arc',
    anim: 'double_slash',
    duration: 450
  },
  tempest_veil: {
    vfxId: 'vfx_tempest_veil',
    skillId: 'tempest_veil',
    type: 'buff',
    color: '#00897b',
    particle: 'wind_cloak',
    anim: 'self_buff',
    duration: 600
  }
};

// ─── 50 Dedicated Endgame VFX Identities (25 Ultimates + 25 Master Ultimates) ──
export const ENDGAME_VFX_REGISTRY = {
  // Human Fighter
  titanbreaker: {
    vfxId: 'vfx_titanbreaker',
    skillId: 'titanbreaker',
    type: 'impact',
    color: '#f59e0b',
    colorFamily: 'amber_earth',
    particle: 'crater_shockwave',
    anim: 'colossal_hammer_drop',
    duration: 950,
    shape: 'seismic_fault',
    motion: 'vertical_smash',
    scale: 2.2,
    spawnPattern: 'ground_burst',
    trajectory: 'descending',
    impactBehavior: 'screen_shake_radial',
    phases: [
      { phase: 1, name: 'momentum_charge', duration: 250, visual: 'golden_aura_swell' },
      { phase: 2, name: 'colossal_impact', duration: 400, visual: 'ground_fissure_burst' },
      { phase: 3, name: 'seismic_shockwave', duration: 300, visual: 'dust_ring_expansion' }
    ]
  },
  master_titanbreaker: {
    vfxId: 'vfx_master_titanbreaker',
    skillId: 'master_titanbreaker',
    type: 'impact',
    color: '#d97706',
    colorFamily: 'ancient_gold',
    particle: 'titan_core_implosion',
    anim: 'sky_rend_crush',
    duration: 1200,
    shape: 'tectonic_chasm',
    motion: 'dual_impact_rebound',
    scale: 2.8,
    spawnPattern: 'multi_ground_eruption',
    trajectory: 'cataclysmic_slam',
    impactBehavior: 'heavy_screen_shake_and_flash',
    phases: [
      { phase: 1, name: 'titan_awakening', duration: 300, visual: 'sky_crack_energy' },
      { phase: 2, name: 'tectonic_crush', duration: 500, visual: 'magma_fault_rupture' },
      { phase: 3, name: 'shatter_resonance', duration: 400, visual: 'golden_debris_ring' }
    ]
  },

  // Human Sorcerer
  meteor: {
    vfxId: 'vfx_meteor',
    skillId: 'meteor',
    type: 'aoe',
    color: '#ef4444',
    colorFamily: 'fire_magma',
    particle: 'celestial_fireball_trail',
    anim: 'meteor_orbital_strike',
    duration: 1100,
    shape: 'incandescent_sphere',
    motion: 'diagonal_plunge',
    scale: 2.5,
    spawnPattern: 'sky_portal_summon',
    trajectory: 'high_arc_impact',
    impactBehavior: 'firestorm_crater',
    phases: [
      { phase: 1, name: 'celestial_calling', duration: 300, visual: 'burning_sky_glyph' },
      { phase: 2, name: 'meteor_descent', duration: 400, visual: 'flaming_meteor_streak' },
      { phase: 3, name: 'caldera_eruption', duration: 400, visual: 'magma_splash_zone' }
    ]
  },
  master_meteor: {
    vfxId: 'vfx_master_meteor',
    skillId: 'master_meteor',
    type: 'aoe',
    color: '#b91c1c',
    colorFamily: 'supernova_magma',
    particle: 'twin_meteor_cluster',
    anim: 'supernova_cataclysm',
    duration: 1400,
    shape: 'apocalyptic_caldera',
    motion: 'twin_orbital_barrage',
    scale: 3.2,
    spawnPattern: 'dual_rift_opening',
    trajectory: 'multi_meteor_rain',
    impactBehavior: 'volcanic_annihilation',
    phases: [
      { phase: 1, name: 'firmament_shatter', duration: 350, visual: 'crimson_sky_fissure' },
      { phase: 2, name: 'twin_comet_dive', duration: 550, visual: 'dual_incandescent_bolides' },
      { phase: 3, name: 'volcanic_aftermath', duration: 500, visual: 'persistent_magma_lake' }
    ]
  },

  // Human Death Knight
  infernal_apocalypse: {
    vfxId: 'vfx_infernal_apocalypse',
    skillId: 'infernal_apocalypse',
    type: 'aoe',
    color: '#7f1d1d',
    colorFamily: 'dark_hellfire',
    particle: 'black_fire_vortex',
    anim: 'infernal_abyss_rise',
    duration: 1000,
    shape: 'hellgate_pentagram',
    motion: 'upward_geyser',
    scale: 2.3,
    spawnPattern: 'ground_sigil_ignite',
    trajectory: 'ground_to_air_eruption',
    impactBehavior: 'dark_flame_pillars',
    phases: [
      { phase: 1, name: 'hellgate_opening', duration: 250, visual: 'ashen_circle_glow' },
      { phase: 2, name: 'infernal_surge', duration: 450, visual: 'black_red_fire_column' },
      { phase: 3, name: 'souls_implosion', duration: 300, visual: 'shadow_smoke_drain' }
    ]
  },
  master_infernal_apocalypse: {
    vfxId: 'vfx_master_infernal_apocalypse',
    skillId: 'master_infernal_apocalypse',
    type: 'aoe',
    color: '#450a0a',
    colorFamily: 'apocalyptic_shadow',
    particle: 'abyssal_inferno_spiral',
    anim: 'pandemonium_unleashed',
    duration: 1350,
    shape: 'abyssal_ring_of_fire',
    motion: 'swirling_dark_cataclysm',
    scale: 3.0,
    spawnPattern: 'hexagonal_hell_gates',
    trajectory: 'converging_pillars',
    impactBehavior: 'field_wide_cremation',
    phases: [
      { phase: 1, name: 'pandemonium_break', duration: 350, visual: 'void_chains_breaking' },
      { phase: 2, name: 'six_pillar_eruption', duration: 600, visual: 'hexagonal_flame_towers' },
      { phase: 3, name: 'ashen_singularity', duration: 400, visual: 'black_hole_flare' }
    ]
  },

  // Human Warg
  primal_overrun: {
    vfxId: 'vfx_primal_overrun',
    skillId: 'primal_overrun',
    type: 'slash',
    color: '#b45309',
    colorFamily: 'feral_amber',
    particle: 'predator_claw_slashes',
    anim: 'pack_beast_rush',
    duration: 900,
    shape: 'tri_claw_tear',
    motion: 'forward_pounce_sequence',
    scale: 2.1,
    spawnPattern: 'phantom_pack_sprint',
    trajectory: 'linear_dash_barrage',
    impactBehavior: 'carnage_splatter',
    phases: [
      { phase: 1, name: 'alpha_howl', duration: 200, visual: 'soundwave_distortion' },
      { phase: 2, name: 'stampede_frenzy', duration: 450, visual: 'spectral_warg_shadows' },
      { phase: 3, name: 'rending_climax', duration: 250, visual: 'massive_x_slash' }
    ]
  },
  master_primal_overrun: {
    vfxId: 'vfx_master_primal_overrun',
    skillId: 'master_primal_overrun',
    type: 'slash',
    color: '#78350f',
    colorFamily: 'primal_bloodstone',
    particle: 'behemoth_dire_claws',
    anim: 'apex_predator_rampage',
    duration: 1250,
    shape: 'five_fold_dire_maul',
    motion: 'blitz_rending_storm',
    scale: 2.7,
    spawnPattern: 'spectral_pack_surround',
    trajectory: 'omnidirectional_pounce',
    impactBehavior: 'shattering_bite_resonance',
    phases: [
      { phase: 1, name: 'bloodmoon_roar', duration: 300, visual: 'crimson_shockwave' },
      { phase: 2, name: 'pack_flank_assault', duration: 550, visual: 'four_corner_warg_slashes' },
      { phase: 3, name: 'apex_jaw_crush', duration: 400, visual: 'massive_spectral_fangs' }
    ]
  },

  // Human Assassin
  nightfall_execution: {
    vfxId: 'vfx_nightfall_execution',
    skillId: 'nightfall_execution',
    type: 'impact',
    color: '#312e81',
    colorFamily: 'midnight_void',
    particle: 'shadow_blade_daggers',
    anim: 'shadow_step_strike',
    duration: 850,
    shape: 'shadow_x_cut',
    motion: 'teleport_assassination',
    scale: 2.0,
    spawnPattern: 'shadow_veil_fade',
    trajectory: 'instantaneous_cross',
    impactBehavior: 'dark_blood_burst',
    phases: [
      { phase: 1, name: 'umbral_fade', duration: 150, visual: 'silhouette_dissolve' },
      { phase: 2, name: 'cross_throat_rend', duration: 400, visual: 'twin_purple_razors' },
      { phase: 3, name: 'shadow_smoke_veil', duration: 300, visual: 'smoke_puff_reappear' }
    ]
  },
  master_nightfall_execution: {
    vfxId: 'vfx_master_nightfall_execution',
    skillId: 'master_nightfall_execution',
    type: 'impact',
    color: '#1e1b4b',
    colorFamily: 'abyssal_obsidian',
    particle: 'void_phantom_blades',
    anim: 'thousand_cuts_execution',
    duration: 1200,
    shape: 'death_mark_seal',
    motion: 'multi_mirror_assassination',
    scale: 2.6,
    spawnPattern: 'eight_shadow_clones',
    trajectory: 'omnipresent_daggers',
    impactBehavior: 'oblivion_heart_pierce',
    phases: [
      { phase: 1, name: 'clone_circle_manifest', duration: 250, visual: 'circle_of_eight_shades' },
      { phase: 2, name: 'synchronous_strike', duration: 550, visual: 'blinding_matrix_cuts' },
      { phase: 3, name: 'soul_dissipation', duration: 400, visual: 'black_feather_fall' }
    ]
  },

  // Elf Fighter
  tidal_ascension: {
    vfxId: 'vfx_tidal_ascension',
    skillId: 'tidal_ascension',
    type: 'projectile',
    color: '#0284c7',
    colorFamily: 'ocean_azure',
    particle: 'water_dragon_spiral',
    anim: 'geyser_leap_strike',
    duration: 950,
    shape: 'hydro_spiral_arrow',
    motion: 'ascending_vortex',
    scale: 2.2,
    spawnPattern: 'surface_splash',
    trajectory: 'vertical_then_dive',
    impactBehavior: 'tsunami_burst',
    phases: [
      { phase: 1, name: 'whirlpool_gather', duration: 250, visual: 'water_ring_surge' },
      { phase: 2, name: 'leviathan_leap', duration: 450, visual: 'azure_dragon_rise' },
      { phase: 3, name: 'deluge_impact', duration: 250, visual: 'foaming_wave_crash' }
    ]
  },
  master_tidal_ascension: {
    vfxId: 'vfx_master_tidal_ascension',
    skillId: 'master_tidal_ascension',
    type: 'projectile',
    color: '#0369a1',
    colorFamily: 'abyssal_marine',
    particle: 'glacier_tide_tempest',
    anim: 'sovereign_ocean_burst',
    duration: 1300,
    shape: 'hydra_water_spout',
    motion: 'triple_tidal_wave',
    scale: 2.9,
    spawnPattern: 'deep_sea_maelstrom',
    trajectory: 'multi_surge_torrent',
    impactBehavior: 'cataclysmic_deluge',
    phases: [
      { phase: 1, name: 'maelstrom_core', duration: 300, visual: 'spinning_ocean_trench' },
      { phase: 2, name: 'triple_spout_clash', duration: 600, visual: 'three_water_serpents' },
      { phase: 3, name: 'arctic_deluge_freeze', duration: 400, visual: 'subzero_ice_mist' }
    ]
  },

  // Elf Mage
  glacial_cataclysm: {
    vfxId: 'vfx_glacial_cataclysm',
    skillId: 'glacial_cataclysm',
    type: 'aoe',
    color: '#38bdf8',
    colorFamily: 'glacial_cyan',
    particle: 'frost_iceberg_spikes',
    anim: 'permafrost_bloom',
    duration: 1050,
    shape: 'shattering_ice_lotus',
    motion: 'crystallization_burst',
    scale: 2.4,
    spawnPattern: 'ground_frost_creep',
    trajectory: 'subzero_eruption',
    impactBehavior: 'flash_freeze_shock',
    phases: [
      { phase: 1, name: 'absolute_zero_chill', duration: 250, visual: 'hoarfrost_circle' },
      { phase: 2, name: 'glacier_pillar_sprout', duration: 500, visual: 'crystalline_ice_spires' },
      { phase: 3, name: 'shatter_avalanche', duration: 300, visual: 'diamond_dust_cloud' }
    ]
  },
  master_glacial_cataclysm: {
    vfxId: 'vfx_master_glacial_cataclysm',
    skillId: 'master_glacial_cataclysm',
    type: 'aoe',
    color: '#0284c7',
    colorFamily: 'hyperborean_ice',
    particle: 'zero_kelvin_singularity',
    anim: 'supercooled_supernova',
    duration: 1400,
    shape: 'fractal_frost_dome',
    motion: 'implosion_then_shatter',
    scale: 3.1,
    spawnPattern: 'rime_glyph_constellation',
    trajectory: 'space_freezing_wave',
    impactBehavior: 'glacial_tomb_shatter',
    phases: [
      { phase: 1, name: 'rime_domain_lock', duration: 350, visual: 'frozen_space_cracks' },
      { phase: 2, name: 'colossal_berg_crush', duration: 600, visual: 'gigantic_ice_monolith' },
      { phase: 3, name: 'absolute_freeze_nova', duration: 450, visual: 'blizzard_whiteout' }
    ]
  },

  // Elf Death Knight
  frostmourne_judgment: {
    vfxId: 'vfx_frostmourne_judgment',
    skillId: 'frostmourne_judgment',
    type: 'slash',
    color: '#06b6d4',
    colorFamily: 'spectral_ice',
    particle: 'dark_ice_soul_runes',
    anim: 'death_blade_cleave',
    duration: 950,
    shape: 'frost_rune_cross',
    motion: 'overhead_reaper_swing',
    scale: 2.3,
    spawnPattern: 'soul_rime_vortex',
    trajectory: 'heavy_vertical_slice',
    impactBehavior: 'chilled_soul_break',
    phases: [
      { phase: 1, name: 'rune_blade_empower', duration: 250, visual: 'cyan_runic_flames' },
      { phase: 2, name: 'abyssal_cleave', duration: 450, visual: 'spectral_ice_blade_arc' },
      { phase: 3, name: 'soul_frost_freeze', duration: 250, visual: 'black_frost_chains' }
    ]
  },
  master_frostmourne_judgment: {
    vfxId: 'vfx_master_frostmourne_judgment',
    skillId: 'master_frostmourne_judgment',
    type: 'slash',
    color: '#0891b2',
    colorFamily: 'dread_rime',
    particle: 'undead_glacier_phalanx',
    anim: 'lich_king_finality',
    duration: 1300,
    shape: 'crown_of_frost_cleave',
    motion: 'twin_spectral_scythes',
    scale: 2.9,
    spawnPattern: 'frozen_graveyard_spires',
    trajectory: 'cross_cleave_rupture',
    impactBehavior: 'permafrost_oblivion',
    phases: [
      { phase: 1, name: 'wraith_choir', duration: 300, visual: 'screaming_frost_ghosts' },
      { phase: 2, name: 'twin_frost_execution', duration: 600, visual: 'dual_reaper_arcs' },
      { phase: 3, name: 'absolute_soul_freeze', duration: 400, visual: 'black_crystal_coffin' }
    ]
  },

  // Dark Elf Fighter
  abyssal_rupture: {
    vfxId: 'vfx_abyssal_rupture',
    skillId: 'abyssal_rupture',
    type: 'slash',
    color: '#6d28d9',
    colorFamily: 'toxic_shadow',
    particle: 'venom_shadow_fissures',
    anim: 'dual_dagger_tear',
    duration: 900,
    shape: 'corrosive_v_rift',
    motion: 'scissor_cut_forward',
    scale: 2.1,
    spawnPattern: 'creeping_miasma',
    trajectory: 'horizontal_scissor',
    impactBehavior: 'acidic_blood_spray',
    phases: [
      { phase: 1, name: 'blade_coating', duration: 200, visual: 'bubbling_green_black_aura' },
      { phase: 2, name: 'scissor_rupture', duration: 450, visual: 'purple_venom_clash' },
      { phase: 3, name: 'corrosive_afterburn', duration: 250, visual: 'smoking_acid_pools' }
    ]
  },
  master_abyssal_rupture: {
    vfxId: 'vfx_master_abyssal_rupture',
    skillId: 'master_abyssal_rupture',
    type: 'slash',
    color: '#4c1d95',
    colorFamily: 'virulent_nether',
    particle: 'hydra_toxin_eruption',
    anim: 'abyssal_decay_frenzy',
    duration: 1250,
    shape: 'six_fold_caustic_wound',
    motion: 'hexagonal_blade_matrix',
    scale: 2.7,
    spawnPattern: 'bubbling_void_fountain',
    trajectory: 'multi_angle_amputation',
    impactBehavior: 'necrotic_tissue_decay',
    phases: [
      { phase: 1, name: 'virulent_plague_infuse', duration: 250, visual: 'dark_mist_vortex' },
      { phase: 2, name: 'hex_claw_rend', duration: 600, visual: 'six_dark_purple_arcs' },
      { phase: 3, name: 'toxic_geyser_outburst', duration: 400, visual: 'bubbling_rot_pillars' }
    ]
  },

  // Dark Elf Mage
  tempest_of_the_abyss: {
    vfxId: 'vfx_tempest_of_the_abyss',
    skillId: 'tempest_of_the_abyss',
    type: 'aoe',
    color: '#7c3aed',
    colorFamily: 'violet_cyclone',
    particle: 'dark_lightning_twister',
    anim: 'abyssal_cyclone_cast',
    duration: 1100,
    shape: 'black_tornado_core',
    motion: 'upward_vortical_pull',
    scale: 2.5,
    spawnPattern: 'eye_of_the_storm',
    trajectory: 'spinning_conical_storm',
    impactBehavior: 'plasma_arc_discharge',
    phases: [
      { phase: 1, name: 'barometric_drop', duration: 250, visual: 'inward_sucking_winds' },
      { phase: 2, name: 'cyclonic_fury', duration: 550, visual: 'black_violet_funnel' },
      { phase: 3, name: 'thunder_cross_burst', duration: 300, visual: 'purple_lightning_detonation' }
    ]
  },
  master_tempest_of_the_abyss: {
    vfxId: 'vfx_master_tempest_of_the_abyss',
    skillId: 'master_tempest_of_the_abyss',
    type: 'aoe',
    color: '#5b21b6',
    colorFamily: 'cosmic_dark_storm',
    particle: 'antimatter_lightning_mesh',
    anim: 'cataclysm_maelstrom_birth',
    duration: 1450,
    shape: 'hurricane_eye_void',
    motion: 'dual_contra_rotating_twisters',
    scale: 3.3,
    spawnPattern: 'spherical_pressure_wave',
    trajectory: 'twin_vortex_fusion',
    impactBehavior: 'electromagnetic_rupture',
    phases: [
      { phase: 1, name: 'antimatter_charge', duration: 350, visual: 'space_rippling_sparks' },
      { phase: 2, name: 'twin_cyclone_collision', duration: 650, visual: 'intersecting_black_hurricanes' },
      { phase: 3, name: 'gamma_lightning_storm', duration: 450, visual: 'cage_of_violet_arcs' }
    ]
  },

  // Dark Elf Death Knight
  voltaic_requiem: {
    vfxId: 'vfx_voltaic_requiem',
    skillId: 'voltaic_requiem',
    type: 'impact',
    color: '#9333ea',
    colorFamily: 'high_voltage_purple',
    particle: 'plasma_sword_discharge',
    anim: 'lightning_fall_execution',
    duration: 950,
    shape: 'lightning_spear_pillar',
    motion: 'celestial_downward_bolt',
    scale: 2.3,
    spawnPattern: 'charged_ground_ring',
    trajectory: 'straight_sky_bolt',
    impactBehavior: 'electrified_crater',
    phases: [
      { phase: 1, name: 'cloud_ionization', duration: 200, visual: 'purple_sky_glow' },
      { phase: 2, name: 'megavolt_strike', duration: 500, visual: 'massive_lightning_spear' },
      { phase: 3, name: 'arc_dispersion', duration: 250, visual: 'ground_current_crawl' }
    ]
  },
  master_voltaic_requiem: {
    vfxId: 'vfx_master_voltaic_requiem',
    skillId: 'master_voltaic_requiem',
    type: 'impact',
    color: '#6b21a8',
    colorFamily: 'hyper_charge_dark',
    particle: 'gigavolt_abyssal_lance',
    anim: 'ragnarok_storm_judgment',
    duration: 1300,
    shape: 'quad_lightning_fissure',
    motion: 'staccato_thunder_barrage',
    scale: 3.0,
    spawnPattern: 'electromagnetic_pulsar',
    trajectory: 'four_converging_lances',
    impactBehavior: 'atomic_plasma_ionization',
    phases: [
      { phase: 1, name: 'pulsar_concurrence', duration: 300, visual: 'four_quadrant_sparks' },
      { phase: 2, name: 'quad_thunder_hammer', duration: 600, visual: 'four_bolts_striking_center' },
      { phase: 3, name: 'plasma_field_aftershock', duration: 400, visual: 'ionized_ground_plasma' }
    ]
  },

  // Dark Elf Assassin
  venomous_eclipse: {
    vfxId: 'vfx_venomous_eclipse',
    skillId: 'venomous_eclipse',
    type: 'aoe',
    color: '#15803d',
    colorFamily: 'toxic_emerald_void',
    particle: 'shadow_venom_cloud',
    anim: 'smoke_screen_execution',
    duration: 1000,
    shape: 'eclipsed_moon_glyph',
    motion: 'expanding_black_green_orb',
    scale: 2.3,
    spawnPattern: 'corrosive_mist_burst',
    trajectory: 'radial_fog_shroud',
    impactBehavior: 'neurotoxic_paralysis',
    phases: [
      { phase: 1, name: 'eclipse_casting', duration: 250, visual: 'sunken_dark_circle' },
      { phase: 2, name: 'venom_gas_expansion', duration: 450, visual: 'green_black_fog_roll' },
      { phase: 3, name: 'phantom_blade_strikes', duration: 300, visual: 'flashing_slashes_in_smoke' }
    ]
  },
  master_venomous_eclipse: {
    vfxId: 'vfx_master_venomous_eclipse',
    skillId: 'master_venomous_eclipse',
    type: 'aoe',
    color: '#14532d',
    colorFamily: 'black_jade_plague',
    particle: 'virulent_miasma_nova',
    anim: 'total_solar_eclipse_kill',
    duration: 1350,
    shape: 'corrosive_ouroboros',
    motion: 'suffocating_dark_sphere',
    scale: 3.0,
    spawnPattern: 'poison_rain_droplets',
    trajectory: 'expanding_dead_zone',
    impactBehavior: 'systemic_organ_rot',
    phases: [
      { phase: 1, name: 'total_blackout', duration: 300, visual: 'screen_tint_pitch_black' },
      { phase: 2, name: 'ouroboros_constriction', duration: 650, visual: 'toxic_snake_shadows' },
      { phase: 3, name: 'emerald_acid_geysers', duration: 400, visual: 'bubbling_necrotic_bursts' }
    ]
  },

  // Dark Elf Blood Rose
  crimson_requiem: {
    vfxId: 'vfx_crimson_requiem',
    skillId: 'crimson_requiem',
    type: 'aoe',
    color: '#dc2626',
    colorFamily: 'sanguine_ruby',
    particle: 'blood_petal_blizzard',
    anim: 'thorn_rose_bloom',
    duration: 1050,
    shape: 'blooming_blood_rose',
    motion: 'unfolding_petal_waves',
    scale: 2.4,
    spawnPattern: 'sanguine_pool_surface',
    trajectory: 'expanding_spiral_petals',
    impactBehavior: 'life_leech_convergence',
    phases: [
      { phase: 1, name: 'bud_appearance', duration: 250, visual: 'crimson_seed_sprout' },
      { phase: 2, name: 'full_rose_blossom', duration: 500, visual: 'giant_blood_petal_burst' },
      { phase: 3, name: 'thorn_whip_lash', duration: 300, visual: 'crimson_brambles_snap' }
    ]
  },
  master_crimson_requiem: {
    vfxId: 'vfx_master_crimson_requiem',
    skillId: 'master_crimson_requiem',
    type: 'aoe',
    color: '#991b1b',
    colorFamily: 'dracula_carmine',
    particle: 'vampiric_blood_cathedral',
    anim: 'sanguine_genesis_ritual',
    duration: 1400,
    shape: 'cathedral_stained_glass_cross',
    motion: 'aerial_blood_chalice_drain',
    scale: 3.1,
    spawnPattern: 'sacrificial_chalice_spill',
    trajectory: 'ascending_blood_towers',
    impactBehavior: 'mass_exsanguination',
    phases: [
      { phase: 1, name: 'cathedral_spires_rise', duration: 350, visual: 'stained_glass_light_beams' },
      { phase: 2, name: 'exsanguination_tide', duration: 650, visual: 'torrents_of_siphoned_blood' },
      { phase: 3, name: 'black_thorn_crown', duration: 400, visual: 'impalement_rose_garden' }
    ]
  },

  // Orc Fighter
  worldbreaker_roar: {
    vfxId: 'vfx_worldbreaker_roar',
    skillId: 'worldbreaker_roar',
    type: 'impact',
    color: '#ea580c',
    colorFamily: 'volcanic_orange',
    particle: 'soundwave_fire_concussion',
    anim: 'berserker_war_roar',
    duration: 950,
    shape: 'concentric_shock_rings',
    motion: 'forward_cone_blast',
    scale: 2.4,
    spawnPattern: 'vocal_distortion_emitter',
    trajectory: 'directional_sound_cannon',
    impactBehavior: 'eardrum_ground_rupture',
    phases: [
      { phase: 1, name: 'lung_expansion', duration: 200, visual: 'orange_chest_glow' },
      { phase: 2, name: 'sound_cannon_discharge', duration: 500, visual: 'concentric_fiery_shockwaves' },
      { phase: 3, name: 'ground_splinter', duration: 250, visual: 'flying_rock_chunks' }
    ]
  },
  master_worldbreaker_roar: {
    vfxId: 'vfx_master_worldbreaker_roar',
    skillId: 'master_worldbreaker_roar',
    type: 'impact',
    color: '#c2410c',
    colorFamily: 'primal_magma_orange',
    particle: 'titan_vocal_devastation',
    anim: 'continent_shattering_shout',
    duration: 1300,
    shape: 'spherical_sonic_caldera',
    motion: '360_degree_shock_ring',
    scale: 3.2,
    spawnPattern: 'epicenter_implosion',
    trajectory: 'omnidirectional_shockwave',
    impactBehavior: 'total_seismic_disintegration',
    phases: [
      { phase: 1, name: 'primal_fury_gather', duration: 250, visual: 'vortex_sucking_dust_in' },
      { phase: 2, name: 'continental_roar', duration: 650, visual: 'triple_fire_sound_rings' },
      { phase: 3, name: 'crust_uplift', duration: 400, visual: 'floating_shattered_boulders' }
    ]
  },

  // Orc Shaman
  apocalypse_totem: {
    vfxId: 'vfx_apocalypse_totem',
    skillId: 'apocalypse_totem',
    type: 'buff',
    color: '#f97316',
    colorFamily: 'ancestral_flame',
    particle: 'totem_carving_fire',
    anim: 'totem_ground_plant',
    duration: 1000,
    shape: 'carved_stone_pillar',
    motion: 'pulsing_fire_aura',
    scale: 2.2,
    spawnPattern: 'ground_carving_circle',
    trajectory: 'stationary_pulse',
    impactBehavior: 'totemic_empowerment',
    phases: [
      { phase: 1, name: 'totem_summon', duration: 300, visual: 'fire_pillar_descending' },
      { phase: 2, name: 'ancestor_eyes_ignite', duration: 450, visual: 'glowing_totem_carvings' },
      { phase: 3, name: 'buff_pulse_burst', duration: 250, visual: 'expanding_flame_carpet' }
    ]
  },
  master_apocalypse_totem: {
    vfxId: 'vfx_master_apocalypse_totem',
    skillId: 'master_apocalypse_totem',
    type: 'buff',
    color: '#ea580c',
    colorFamily: 'elder_god_totem',
    particle: 'ancestral_spirit_fire',
    anim: 'elder_totem_phalanx',
    duration: 1350,
    shape: 'four_totem_sanctuary',
    motion: 'tetrahedral_flame_lattice',
    scale: 3.0,
    spawnPattern: 'four_point_totem_slam',
    trajectory: 'interlocking_beam_matrix',
    impactBehavior: 'field_wide_spiritual_fervor',
    phases: [
      { phase: 1, name: 'quad_totem_drop', duration: 350, visual: 'four_pillars_smashing_down' },
      { phase: 2, name: 'ancestral_beam_link', duration: 600, visual: 'fire_laser_connections' },
      { phase: 3, name: 'paagrio_avatar_manifest', duration: 400, visual: 'colossal_orc_god_spectre' }
    ]
  },

  // Orc Vanguard Rider
  inferno_charge: {
    vfxId: 'vfx_inferno_charge',
    skillId: 'inferno_charge',
    type: 'mobility',
    color: '#f97316',
    colorFamily: 'mounted_wildfire',
    particle: 'flaming_hoofprints',
    anim: 'mounted_beast_stampede',
    duration: 950,
    shape: 'spear_flame_cone',
    motion: 'high_velocity_ram',
    scale: 2.3,
    spawnPattern: 'ground_tire_fire_trench',
    trajectory: 'linear_joust_streak',
    impactBehavior: 'spear_ram_explosion',
    phases: [
      { phase: 1, name: 'beast_rev_up', duration: 200, visual: 'paw_sparks_and_snort' },
      { phase: 2, name: 'blazing_trample', duration: 500, visual: 'streaking_fire_trail_charge' },
      { phase: 3, name: 'spear_point_breach', duration: 250, visual: 'directional_fire_cone' }
    ]
  },
  master_inferno_charge: {
    vfxId: 'vfx_master_inferno_charge',
    skillId: 'master_inferno_charge',
    type: 'mobility',
    color: '#c2410c',
    colorFamily: 'juggernaut_hellfire',
    particle: 'meteor_hoof_trench',
    anim: 'dread_chariot_crush',
    duration: 1300,
    shape: 'colossal_flame_wedge',
    motion: 'unbreakable_ramming_force',
    scale: 3.0,
    spawnPattern: 'twin_magma_ruts',
    trajectory: 'unstoppable_express_lance',
    impactBehavior: 'fortress_wall_demolition',
    phases: [
      { phase: 1, name: 'iron_hide_ignite', duration: 250, visual: 'metal_plates_turning_red_hot' },
      { phase: 2, name: 'sonic_joust', duration: 650, visual: 'supersonic_fire_cone_dash' },
      { phase: 3, name: 'nuclear_spear_tip', duration: 400, visual: 'atomic_fireball_impact' }
    ]
  },

  // Dwarf Artisan
  forge_colossus: {
    vfxId: 'vfx_forge_colossus',
    skillId: 'forge_colossus',
    type: 'buff',
    color: '#78716c',
    colorFamily: 'bronze_iron',
    particle: 'steampunk_gear_steam',
    anim: 'iron_golem_assembly',
    duration: 1050,
    shape: 'clockwork_colossus_frame',
    motion: 'mechanical_lock_in',
    scale: 2.5,
    spawnPattern: 'parts_dropping_from_sky',
    trajectory: 'assembly_slam',
    impactBehavior: 'mechanical_steam_blast',
    phases: [
      { phase: 1, name: 'blueprint_hologram', duration: 250, visual: 'golden_wireframe_cube' },
      { phase: 2, name: 'iron_plates_converge', duration: 500, visual: 'clanging_armor_assembly' },
      { phase: 3, name: 'steam_boiler_vent', duration: 300, visual: 'pressurized_white_steam' }
    ]
  },
  master_forge_colossus: {
    vfxId: 'vfx_master_forge_colossus',
    skillId: 'master_forge_colossus',
    type: 'buff',
    color: '#57534e',
    colorFamily: 'adamantine_dreadnought',
    particle: 'runic_reactor_exhaust',
    anim: 'siege_titan_drop',
    duration: 1400,
    shape: 'adamantite_siege_mech',
    motion: 'heavy_hydraulic_impact',
    scale: 3.3,
    spawnPattern: 'orbital_drop_pod',
    trajectory: 'meteor_mech_crash',
    impactBehavior: 'hydraulic_seismic_stomp',
    phases: [
      { phase: 1, name: 'warning_siren_drop', duration: 300, visual: 'target_red_landing_cross' },
      { phase: 2, name: 'dreadnought_touchdown', duration: 650, visual: 'titan_mech_knee_drop' },
      { phase: 3, name: 'overclock_reactor_pulse', duration: 450, visual: 'electric_steam_emp' }
    ]
  },

  // Dwarf Mage
  earthforge_cataclysm: {
    vfxId: 'vfx_earthforge_cataclysm',
    skillId: 'earthforge_cataclysm',
    type: 'aoe',
    color: '#a8a29e',
    colorFamily: 'crystal_granite',
    particle: 'quartz_boulder_spikes',
    anim: 'geomantic_fissure_heave',
    duration: 1100,
    shape: 'fault_line_grid',
    motion: 'crustal_heave',
    scale: 2.5,
    spawnPattern: 'ground_fault_lines',
    trajectory: 'upward_stone_pillars',
    impactBehavior: 'stone_shatter_rebound',
    phases: [
      { phase: 1, name: 'geomantic_tuning', duration: 250, visual: 'ground_crystals_resonating' },
      { phase: 2, name: 'pillar_eruption', duration: 550, visual: 'jagged_crystal_rock_burst' },
      { phase: 3, name: 'shatter_fallout', duration: 300, visual: 'quartz_shrapnel_spray' }
    ]
  },
  master_earthforge_cataclysm: {
    vfxId: 'vfx_master_earthforge_cataclysm',
    skillId: 'master_earthforge_cataclysm',
    type: 'aoe',
    color: '#78716c',
    colorFamily: 'obsidian_adamantine',
    particle: 'tectonic_plate_collision',
    anim: 'earth_core_rupture',
    duration: 1450,
    shape: 'subduction_chasm',
    motion: 'inverted_gravity_quake',
    scale: 3.3,
    spawnPattern: 'cross_canyon_split',
    trajectory: 'magma_rock_catapult',
    impactBehavior: 'catastrophic_crust_collapse',
    phases: [
      { phase: 1, name: 'core_frequency_pulse', duration: 350, visual: 'black_mineral_resonator' },
      { phase: 2, name: 'chasm_swallow', duration: 650, visual: 'gaping_canyon_fissures' },
      { phase: 3, name: 'gemstone_supernova', duration: 450, visual: 'blinding_diamond_fragment_burst' }
    ]
  },

  // Dwarf ShineMaker
  divine_forge: {
    vfxId: 'vfx_divine_forge',
    skillId: 'divine_forge',
    type: 'buff',
    color: '#facc15',
    colorFamily: 'celestial_gold',
    particle: 'holy_anvil_sparks',
    anim: 'solar_anvil_strike',
    duration: 1000,
    shape: 'celestial_anvil_hologram',
    motion: 'golden_hammer_drop',
    scale: 2.3,
    spawnPattern: 'golden_circle_of_creation',
    trajectory: 'hammer_to_anvil_burst',
    impactBehavior: 'holy_sanctuary_ring',
    phases: [
      { phase: 1, name: 'solar_anvil_summon', duration: 250, visual: 'translucent_gold_anvil' },
      { phase: 2, name: 'creation_strike', duration: 500, visual: 'blinding_gold_sparks' },
      { phase: 3, name: 'sacred_hardening_glow', duration: 250, visual: 'protective_golden_dome' }
    ]
  },
  master_divine_forge: {
    vfxId: 'vfx_master_divine_forge',
    skillId: 'master_divine_forge',
    type: 'buff',
    color: '#eab308',
    colorFamily: 'archangel_aurum',
    particle: 'seraphic_ingot_light',
    anim: 'god_smith_consecration',
    duration: 1350,
    shape: 'seven_tiered_golden_shrine',
    motion: 'triple_creation_hammering',
    scale: 3.0,
    spawnPattern: 'sacred_geometric_mandala',
    trajectory: 'three_rapid_sacred_strikes',
    impactBehavior: 'unbreakable_divine_bastion',
    phases: [
      { phase: 1, name: 'mandala_projection', duration: 300, visual: 'spinning_golden_runes' },
      { phase: 2, name: 'trinity_hammer_sequence', duration: 650, visual: 'three_massive_solar_hits' },
      { phase: 3, name: 'seraphic_shield_manifest', duration: 400, visual: 'golden_wing_barricade' }
    ]
  },

  // Kamael Soulbreaker
  soul_devastation: {
    vfxId: 'vfx_soul_devastation',
    skillId: 'soul_devastation',
    type: 'slash',
    color: '#6366f1',
    colorFamily: 'spectral_indigo',
    particle: 'rapier_soul_thrusts',
    anim: 'flurry_soul_harvest',
    duration: 900,
    shape: 'soul_constellation_pierce',
    motion: 'rapid_fencing_barrage',
    scale: 2.1,
    spawnPattern: 'spectral_feathers_gather',
    trajectory: 'multi_point_lunge',
    impactBehavior: 'soul_extraction_beam',
    phases: [
      { phase: 1, name: 'single_wing_unfurl', duration: 200, visual: 'indigo_feather_wing' },
      { phase: 2, name: 'hundred_needle_lunge', duration: 450, visual: 'blinding_needle_flurry' },
      { phase: 3, name: 'soul_heart_snatch', duration: 250, visual: 'siphoned_blue_orb_absorb' }
    ]
  },
  master_soul_devastation: {
    vfxId: 'vfx_master_soul_devastation',
    skillId: 'master_soul_devastation',
    type: 'slash',
    color: '#4338ca',
    colorFamily: 'void_indigo_abyss',
    particle: 'abyssal_wing_cleave',
    anim: 'fallen_angel_oblivion',
    duration: 1250,
    shape: 'black_feather_scythe',
    motion: 'aerial_dive_execution',
    scale: 2.8,
    spawnPattern: 'soul_drain_well',
    trajectory: 'spiral_dive_then_reap',
    impactBehavior: 'complete_spiritual_hollowing',
    phases: [
      { phase: 1, name: 'fallen_seraph_wings', duration: 300, visual: 'six_indigo_wings_spread' },
      { phase: 2, name: 'void_rapier_crescendo', duration: 550, visual: 'strobe_soul_pierce_matrix' },
      { phase: 3, name: 'absolute_soul_harvest', duration: 400, visual: 'imploding_spirit_vortex' }
    ]
  },

  // Kamael Samurai
  heaven_cutting_tempest: {
    vfxId: 'vfx_heaven_cutting_tempest',
    skillId: 'heaven_cutting_tempest',
    type: 'slash',
    color: '#0284c7',
    colorFamily: 'wind_katana_cyan',
    particle: 'vacuum_blade_arcs',
    anim: 'iaido_heaven_sheathe',
    duration: 950,
    shape: 'dimension_cut_line',
    motion: 'subtle_draw_instant_cleave',
    scale: 2.3,
    spawnPattern: 'cherry_petal_vacuum',
    trajectory: 'instant_spatial_line',
    impactBehavior: 'delayed_cross_cut',
    phases: [
      { phase: 1, name: 'blade_thumb_click', duration: 200, visual: 'scabbard_spark_flash' },
      { phase: 2, name: 'dimension_slice', duration: 450, visual: 'white_laser_cut_across_screen' },
      { phase: 3, name: 'sheathing_detonation', duration: 300, visual: 'delayed_multi_wind_rupture' }
    ]
  },
  master_heaven_cutting_tempest: {
    vfxId: 'vfx_master_heaven_cutting_tempest',
    skillId: 'master_heaven_cutting_tempest',
    type: 'slash',
    color: '#0369a1',
    colorFamily: 'void_cutter_sapphire',
    particle: 'spatial_fracture_blades',
    anim: 'omnipresent_katana_domain',
    duration: 1300,
    shape: 'shattered_sky_web',
    motion: 'thousand_iaido_strikes',
    scale: 3.0,
    spawnPattern: 'frozen_time_cherry_blossoms',
    trajectory: 'geometric_slash_cage',
    impactBehavior: 'space_time_collapse',
    phases: [
      { phase: 1, name: 'domain_of_the_blade', duration: 250, visual: 'desaturated_world_filter' },
      { phase: 2, name: 'infinite_slash_matrix', duration: 650, visual: 'geometric_laser_cuts_crossing' },
      { phase: 3, name: 'blade_click_snap', duration: 400, visual: 'screen_glass_shatter_effect' }
    ]
  },

  // Ertheia Storm Blaster
  cyclone_barrage: {
    vfxId: 'vfx_cyclone_barrage',
    skillId: 'cyclone_barrage',
    type: 'projectile',
    color: '#14b8a6',
    colorFamily: 'gale_teal',
    particle: 'wind_cannon_slugs',
    anim: 'dual_blaster_overdrive',
    duration: 950,
    shape: 'conical_bullet_cone',
    motion: 'gatling_spray',
    scale: 2.2,
    spawnPattern: 'gun_barrel_flash',
    trajectory: 'rapid_fire_stream',
    impactBehavior: 'air_pressure_implosions',
    phases: [
      { phase: 1, name: 'barrel_spin_up', duration: 200, visual: 'green_plasma_muzzle_sparks' },
      { phase: 2, name: 'typhoon_gatling_fire', duration: 550, visual: 'stream_of_wind_slugs' },
      { phase: 3, name: 'overheat_venting', duration: 200, visual: 'cyclonic_vapor_ring' }
    ]
  },
  master_cyclone_barrage: {
    vfxId: 'vfx_master_cyclone_barrage',
    skillId: 'master_cyclone_barrage',
    type: 'projectile',
    color: '#0f766e',
    colorFamily: 'tempest_emerald',
    particle: 'sonic_railgun_projectiles',
    anim: 'aerial_orbital_gunship',
    duration: 1350,
    shape: 'six_barrel_rail_cannonade',
    motion: 'saturation_carpet_bombardment',
    scale: 3.1,
    spawnPattern: 'hover_drone_blaster_ring',
    trajectory: 'converging_sonic_beams',
    impactBehavior: 'vacuum_bomb_carpet',
    phases: [
      { phase: 1, name: 'sylph_drones_deploy', duration: 300, visual: 'six_floating_blaster_wings' },
      { phase: 2, name: 'synchronized_barrage', duration: 650, visual: 'laser_stream_carpet_strike' },
      { phase: 3, name: 'singularity_bullet_drop', duration: 400, visual: 'massive_vacuum_detonation' }
    ]
  },

  // Ertheia Marauder
  tempest_breaker: {
    vfxId: 'vfx_tempest_breaker',
    skillId: 'tempest_breaker',
    type: 'mobility',
    color: '#0d9488',
    colorFamily: 'tornado_turquoise',
    particle: 'whirlwind_kick_arcs',
    anim: 'flying_tornado_dropkick',
    duration: 900,
    shape: 'drill_tornado_cone',
    motion: 'corkscrew_torpedo_dive',
    scale: 2.2,
    spawnPattern: 'jump_propulsion_ring',
    trajectory: 'corkscrew_dive',
    impactBehavior: 'air_cannon_crater',
    phases: [
      { phase: 1, name: 'skyward_launch', duration: 200, visual: 'ground_pressure_indent' },
      { phase: 2, name: 'drill_dive', duration: 450, visual: 'spinning_teal_torpedo' },
      { phase: 3, name: 'shockwave_drop', duration: 250, visual: '360_degree_air_blade_ring' }
    ]
  },
  master_tempest_breaker: {
    vfxId: 'vfx_master_tempest_breaker',
    skillId: 'master_tempest_breaker',
    type: 'mobility',
    color: '#115e59',
    colorFamily: 'hurricane_deep_teal',
    particle: 'typhoon_fist_afterimages',
    anim: 'god_hand_tempest_meteor',
    duration: 1250,
    shape: 'fist_imprint_meteor',
    motion: 'mach_5_divebomb',
    scale: 2.9,
    spawnPattern: 'sonic_boom_rings',
    trajectory: 'vertical_meteor_drop',
    impactBehavior: 'superheated_vacuum_crater',
    phases: [
      { phase: 1, name: 'mesosphere_leap', duration: 250, visual: 'silhouette_eclipsing_moon' },
      { phase: 2, name: 'mach_speed_plunge', duration: 600, visual: 'friction_heated_air_arrow' },
      { phase: 3, name: 'continent_quake_stomp', duration: 400, visual: 'colossal_fist_crater' }
    ]
  },

  // High Elf Divine Templar
  heavens_aegis: {
    vfxId: 'vfx_heavens_aegis',
    skillId: 'heavens_aegis',
    type: 'buff',
    color: '#e2e8f0',
    colorFamily: 'pure_silver_light',
    particle: 'angelic_feather_shield',
    anim: 'divine_shield_stand',
    duration: 1000,
    shape: 'prismatic_diamond_aegis',
    motion: 'unyielding_bastion_lock',
    scale: 2.4,
    spawnPattern: 'celestial_pillar_descent',
    trajectory: 'sky_to_earth_column',
    impactBehavior: 'holy_barrier_pulse',
    phases: [
      { phase: 1, name: 'angelic_choir_beam', duration: 250, visual: 'ray_of_pure_white_light' },
      { phase: 2, name: 'diamond_aegis_lock', duration: 500, visual: 'faceted_crystal_shield' },
      { phase: 3, name: 'radiance_reflection', duration: 250, visual: 'reflective_mirror_flare' }
    ]
  },
  master_heavens_aegis: {
    vfxId: 'vfx_master_heavens_aegis',
    skillId: 'master_heavens_aegis',
    type: 'buff',
    color: '#f8fafc',
    colorFamily: 'seraphim_platinum',
    particle: 'archangel_aegis_wings',
    anim: 'fortress_of_the_seraphim',
    duration: 1400,
    shape: 'six_winged_dome_of_light',
    motion: 'sanctuary_dome_lock',
    scale: 3.2,
    spawnPattern: 'heaven_gate_aperture',
    trajectory: 'holy_domain_expansion',
    impactBehavior: 'invulnerable_sanctuary',
    phases: [
      { phase: 1, name: 'heavenly_gate_open', duration: 350, visual: 'golden_clouds_parting' },
      { phase: 2, name: 'seraphic_wing_enclosure', duration: 650, visual: 'six_enormous_folded_wings' },
      { phase: 3, name: 'glory_of_the_heavens', duration: 400, visual: 'blinding_white_peace_shockwave' }
    ]
  },

  // High Elf Element Weaver
  prismatic_genesis: {
    vfxId: 'vfx_prismatic_genesis',
    skillId: 'prismatic_genesis',
    type: 'aoe',
    color: '#f43f5e',
    colorFamily: 'rainbow_prismatic',
    particle: 'tri_element_supernova',
    anim: 'prismatic_fusion_cast',
    duration: 1150,
    shape: 'triple_spiral_galaxy',
    motion: 'fire_water_wind_trinity',
    scale: 2.6,
    spawnPattern: 'trinity_convergence_ring',
    trajectory: 'tri_element_spiral',
    impactBehavior: 'elemental_supernova',
    phases: [
      { phase: 1, name: 'element_trinity_gather', duration: 300, visual: 'three_colored_orbs_orbiting' },
      { phase: 2, name: 'prismatic_collision', duration: 550, visual: 'rainbow_spiral_implosion' },
      { phase: 3, name: 'genesis_explosion', duration: 300, visual: 'chromatic_shockwave' }
    ]
  },
  master_prismatic_genesis: {
    vfxId: 'vfx_master_prismatic_genesis',
    skillId: 'master_prismatic_genesis',
    type: 'aoe',
    color: '#e11d48',
    colorFamily: 'cosmic_prismatic_omniverse',
    particle: 'big_bang_elemental_nebula',
    anim: 'cosmic_creation_unravel',
    duration: 1500,
    shape: 'cosmic_ouroboros_mandala',
    motion: 'universal_expansion_pulse',
    scale: 3.5,
    spawnPattern: 'kaleidoscopic_singularity',
    trajectory: 'omnidirectional_chromatic_wave',
    impactBehavior: 'elemental_re-creation',
    phases: [
      { phase: 1, name: 'kaleidoscope_aperture', duration: 400, visual: 'fractal_geometry_expansion' },
      { phase: 2, name: 'cosmic_trinity_fusion', duration: 700, visual: 'blinding_prismatic_hypercube' },
      { phase: 3, name: 'genesis_big_bang', duration: 400, visual: 'infinite_spectrum_detonation' }
    ]
  }
};

export const GENERALIST_VFX_REGISTRY = {
  wind_strike: {
    vfxId: 'vfx_wind_strike',
    skillId: 'wind_strike',
    type: 'projectile',
    color: '#72f3ca',
    particle: 'wind_gust',
    anim: 'gust',
    duration: 750
  }
};

/**
 * Retrieves the VFX metadata for a specific skill.
 * Checks baseline registry first, then dedicated endgame registry, then generalist registry.
 * @param {string} skillId
 * @returns {object|null}
 */
export function getSkillVfx(skillId) {
  return SKILL_VFX_REGISTRY[skillId] || ENDGAME_VFX_REGISTRY[skillId] || GENERALIST_VFX_REGISTRY[skillId] || null;
}

/**
 * Checks if a skill has a registered unique VFX definition.
 * @param {string} skillId
 * @returns {boolean}
 */
export function hasSkillVfx(skillId) {
  return Boolean(SKILL_VFX_REGISTRY[skillId] || ENDGAME_VFX_REGISTRY[skillId] || GENERALIST_VFX_REGISTRY[skillId]);
}

/**
 * Returns all registered baseline VFX definitions (100 identities).
 * @returns {object[]}
 */
export function getAllVfxDefinitions() {
  return Object.values(SKILL_VFX_REGISTRY);
}

/**
 * Returns all registered endgame VFX definitions (50 identities).
 * @returns {object[]}
 */
export function getAllEndgameVfxDefinitions() {
  return Object.values(ENDGAME_VFX_REGISTRY);
}

/**
 * Returns all registered active and endgame VFX definitions (150 identities).
 * @returns {object[]}
 */
export function getAllActiveAndEndgameVfxDefinitions() {
  return [...Object.values(SKILL_VFX_REGISTRY), ...Object.values(ENDGAME_VFX_REGISTRY)];
}

/**
 * Returns structural VFX metadata decomposed into 4-layer architectural abstraction.
 * @param {string} skillId
 * @returns {object|null}
 */
export function getVfxArchitecture(skillId) {
  const vfx = getSkillVfx(skillId);
  if (!vfx) return null;
  return {
    identity: vfx.vfxId,
    profile: {
      color: vfx.color,
      particle: vfx.particle,
      anim: vfx.anim,
      duration: vfx.duration,
      phases: vfx.phases || []
    },
    renderFamily: vfx.type,
    renderImplementation: VFX_VISUAL_IMPLEMENTATION
  };
}

/**
 * Returns aggregate metrics for the VFX Catalog.
 * Preserves totalIdentities: 100 for backward compatibility with Contract 3.2.1 suite.
 * @returns {object}
 */
export function getVfxStats() {
  const allDefs = getAllVfxDefinitions();
  const endgameDefs = getAllEndgameVfxDefinitions();
  const familyCounts = {};
  for (const def of allDefs) {
    familyCounts[def.type] = (familyCounts[def.type] || 0) + 1;
  }
  return {
    totalIdentities: allDefs.length, // 100 baseline
    endgameIdentities: endgameDefs.length, // 50 endgame
    allIdentities: allDefs.length + endgameDefs.length, // 150 total
    distinctVfxIds: new Set(allDefs.map(d => d.vfxId)).size,
    renderFamilyBreakdown: familyCounts,
    implementationStatus: VFX_VISUAL_IMPLEMENTATION
  };
}
