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

/**
 * Retrieves the VFX metadata for a specific skill.
 * @param {string} skillId
 * @returns {object|null}
 */
export function getSkillVfx(skillId) {
  return SKILL_VFX_REGISTRY[skillId] || null;
}

/**
 * Checks if a skill has a registered unique VFX definition.
 * @param {string} skillId
 * @returns {boolean}
 */
export function hasSkillVfx(skillId) {
  return Boolean(SKILL_VFX_REGISTRY[skillId]);
}

/**
 * Returns all registered VFX definitions.
 * @returns {object[]}
 */
export function getAllVfxDefinitions() {
  return Object.values(SKILL_VFX_REGISTRY);
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
      duration: vfx.duration
    },
    renderFamily: vfx.type,
    renderImplementation: VFX_VISUAL_IMPLEMENTATION
  };
}

/**
 * Returns aggregate metrics for the VFX Catalog.
 * @returns {object}
 */
export function getVfxStats() {
  const allDefs = getAllVfxDefinitions();
  const familyCounts = {};
  for (const def of allDefs) {
    familyCounts[def.type] = (familyCounts[def.type] || 0) + 1;
  }
  return {
    totalIdentities: allDefs.length,
    distinctVfxIds: new Set(allDefs.map(d => d.vfxId)).size,
    renderFamilyBreakdown: familyCounts,
    implementationStatus: VFX_VISUAL_IMPLEMENTATION
  };
}
