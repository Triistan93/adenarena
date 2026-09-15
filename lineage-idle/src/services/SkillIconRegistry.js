/**
 * SkillIconRegistry.js — Central Semantic Icon Registry for Aden Arena Idle
 *
 * Game Data Contract 3.3.0: Skill Icon Identity & Uniqueness System
 *
 * Maps every active, passive, and ultimate skill to an authentic, distinct asset
 * from /assets/skills/icons/ (or /assets/skills/), establishing visual identity
 * based on element, role, and class fantasy.
 */

export const ICON_STATUS = Object.freeze({
  UNIQUE: 'UNIQUE',
  INTENTIONAL_SHARED: 'INTENTIONAL_SHARED',
  SUSPICIOUS: 'SUSPICIOUS',
  MISSING: 'MISSING',
  WRONG: 'WRONG'
});

/**
 * Authoritative dictionary of canonical skill icon registrations.
 */
export const SKILL_ICON_REGISTRY = Object.freeze({
  // ─── Shared Generalist Skills (Lv 1–39 Pool) ──────────────────────────────
  wind_strike: {
    skillId: 'wind_strike',
    iconId: 'wind_strike',
    iconPath: '/assets/skills/icons/wind_strike.png',
    source: 'shared',
    semanticCategory: 'wind_magic',
    element: 'Wind',
    role: 'damage',
    shared: true
  },
  flame_strike: {
    skillId: 'flame_strike',
    iconId: 'flame_strike',
    iconPath: '/assets/skills/icons/flame_strike.png',
    source: 'shared',
    semanticCategory: 'fire_magic',
    element: 'Fire',
    role: 'damage',
    shared: true
  },
  hydro_strike: {
    skillId: 'hydro_strike',
    iconId: 'water_wave',
    iconPath: '/assets/skills/water_wave.jpg',
    source: 'shared',
    semanticCategory: 'water_magic',
    element: 'Water',
    role: 'damage',
    shared: true
  },
  heal_light: {
    skillId: 'heal_light',
    iconId: 'holy_light',
    iconPath: '/assets/skills/icons/holy_light.png',
    source: 'shared',
    semanticCategory: 'holy_heal',
    element: 'Holy',
    role: 'heal',
    shared: true
  },
  ice_bolt: {
    skillId: 'ice_bolt',
    iconId: 'ice_bolt',
    iconPath: '/assets/skills/icons/ice_bolt.png',
    source: 'shared',
    semanticCategory: 'water_ice',
    element: 'Water',
    role: 'control',
    shared: true
  },
  power_strike: {
    skillId: 'power_strike',
    iconId: 'power_strike',
    iconPath: '/assets/skills/icons/power_strike.png',
    source: 'shared',
    semanticCategory: 'physical_melee',
    element: 'Physical',
    role: 'damage',
    shared: true
  },
  mortal_blow: {
    skillId: 'mortal_blow',
    iconId: 'mortal_blow',
    iconPath: '/assets/skills/icons/mortal_blow.png',
    source: 'shared',
    semanticCategory: 'dagger_assassin',
    element: 'Physical',
    role: 'burst',
    shared: true
  },
  iron_punch: {
    skillId: 'iron_punch',
    iconId: 'iron_punch',
    iconPath: '/assets/skills/icons/iron_punch.png',
    source: 'shared',
    semanticCategory: 'physical_brawler',
    element: 'Physical',
    role: 'control',
    shared: true
  },
  energy_burst: {
    skillId: 'energy_burst',
    iconId: 'energy_blast',
    iconPath: '/assets/skills/icons/energy_blast.png',
    source: 'shared',
    semanticCategory: 'energy_strike',
    element: 'Physical',
    role: 'burst',
    shared: true
  },
  power_shot: {
    skillId: 'power_shot',
    iconId: 'archery_bow',
    iconPath: '/assets/skills/icons/archery_bow.png',
    source: 'shared',
    semanticCategory: 'physical_ranged',
    element: 'Physical',
    role: 'damage',
    shared: true
  },

  // ─── Human Assassin (6) ───────────────────────────────────────────────────
  shadow_clone: {
    skillId: 'shadow_clone',
    iconId: 'shadow_blades',
    iconPath: '/assets/skills/icons/shadow_blades.png',
    source: 'l2_authentic',
    semanticCategory: 'dagger_clone',
    element: 'Dark',
    role: 'burst',
    shared: false
  },
  gloom_strike: {
    skillId: 'gloom_strike',
    iconId: 'assassination',
    iconPath: '/assets/skills/icons/assassination.png',
    source: 'l2_authentic',
    semanticCategory: 'dagger_strike',
    element: 'Dark',
    role: 'burst',
    shared: false
  },
  veil_step: {
    skillId: 'veil_step',
    iconId: 'shadow_dash',
    iconPath: '/assets/skills/icons/shadow_dash.png',
    source: 'l2_authentic',
    semanticCategory: 'dagger_mobility',
    element: 'Dark',
    role: 'mobility',
    shared: false
  },
  night_execution: {
    skillId: 'night_execution',
    iconId: 'deadly_blow',
    iconPath: '/assets/skills/icons/deadly_blow.png',
    source: 'l2_authentic',
    semanticCategory: 'dagger_lethal',
    element: 'Dark',
    role: 'finisher',
    shared: false
  },
  nightfall_execution: {
    skillId: 'nightfall_execution',
    iconId: 'assassin_blades',
    iconPath: '/assets/skills/icons/assassin_blades.png',
    source: 'l2_authentic',
    semanticCategory: 'ultimate_assassin',
    element: 'Dark',
    role: 'finisher',
    shared: false
  },
  master_nightfall_execution: {
    skillId: 'master_nightfall_execution',
    iconId: 'assassin_harmony',
    iconPath: '/assets/skills/icons/assassin_harmony.png',
    source: 'l2_authentic',
    semanticCategory: 'master_ultimate',
    element: 'Dark',
    role: 'finisher',
    shared: false
  },

  // ─── Human Death Knight (6) ───────────────────────────────────────────────
  cinderblade: {
    skillId: 'cinderblade',
    iconId: 'bloody_strike',
    iconPath: '/assets/skills/icons/bloody_strike.png',
    source: 'l2_authentic',
    semanticCategory: 'dark_blood',
    element: 'Dark',
    role: 'burst',
    shared: false
  },
  hellfire_grasp: {
    skillId: 'hellfire_grasp',
    iconId: 'death_spike',
    iconPath: '/assets/skills/icons/death_spike.png',
    source: 'l2_authentic',
    semanticCategory: 'dark_control',
    element: 'Dark',
    role: 'control',
    shared: false
  },
  ashen_shroud: {
    skillId: 'ashen_shroud',
    iconId: 'defend',
    iconPath: '/assets/skills/icons/defend.png',
    source: 'l2_authentic',
    semanticCategory: 'dark_tank',
    element: 'Dark',
    role: 'tank',
    shared: false
  },
  infernal_judgment: {
    skillId: 'infernal_judgment',
    iconId: 'heavy_slash',
    iconPath: '/assets/skills/icons/heavy_slash.png',
    source: 'l2_authentic',
    semanticCategory: 'dark_slash',
    element: 'Dark',
    role: 'finisher',
    shared: false
  },
  infernal_apocalypse: {
    skillId: 'infernal_apocalypse',
    iconId: 'death_raid',
    iconPath: '/assets/skills/icons/death_raid.png',
    source: 'l2_authentic',
    semanticCategory: 'ultimate_dark',
    element: 'Dark',
    role: 'area',
    shared: false
  },
  master_infernal_apocalypse: {
    skillId: 'master_infernal_apocalypse',
    iconId: 'ultimate_force',
    iconPath: '/assets/skills/icons/ultimate_force.png',
    source: 'l2_authentic',
    semanticCategory: 'master_ultimate',
    element: 'Dark',
    role: 'area',
    shared: false
  },

  // ─── Human Fighter (6) ────────────────────────────────────────────────────
  shield_bash: {
    skillId: 'shield_bash',
    iconId: 'cross_shield',
    iconPath: '/assets/skills/icons/cross_shield.png',
    source: 'l2_authentic',
    semanticCategory: 'shield_strike',
    element: 'Physical',
    role: 'control',
    shared: false
  },
  cleave_strike: {
    skillId: 'cleave_strike',
    iconId: 'human_power_strike',
    iconPath: '/assets/skills/icons/human_power_strike.png',
    source: 'l2_authentic',
    semanticCategory: 'physical_cleave',
    element: 'Physical',
    role: 'area',
    shared: false
  },
  iron_stance: {
    skillId: 'iron_stance',
    iconId: 'iron_wall',
    iconPath: '/assets/skills/icons/iron_wall.png',
    source: 'l2_authentic',
    semanticCategory: 'physical_tank',
    element: 'Physical',
    role: 'tank',
    shared: false
  },
  concussive_stun: {
    skillId: 'concussive_stun',
    iconId: 'retaliation_counter',
    iconPath: '/assets/skills/icons/retaliation_counter.png',
    source: 'l2_authentic',
    semanticCategory: 'physical_stun',
    element: 'Physical',
    role: 'control',
    shared: false
  },
  titanbreaker: {
    skillId: 'titanbreaker',
    iconId: 'heroic_might',
    iconPath: '/assets/skills/icons/heroic_might.png',
    source: 'l2_authentic',
    semanticCategory: 'ultimate_physical',
    element: 'Physical',
    role: 'finisher',
    shared: false
  },
  master_titanbreaker: {
    skillId: 'master_titanbreaker',
    iconId: 'heroic_spirit',
    iconPath: '/assets/skills/icons/heroic_spirit.png',
    source: 'l2_authentic',
    semanticCategory: 'master_ultimate',
    element: 'Physical',
    role: 'finisher',
    shared: false
  },

  // ─── Human Sorcerer (6) ───────────────────────────────────────────────────
  fireball: {
    skillId: 'fireball',
    iconId: 'phoenix_flame',
    iconPath: '/assets/skills/icons/phoenix_flame.png',
    source: 'l2_authentic',
    semanticCategory: 'fire_magic',
    element: 'Fire',
    role: 'area',
    shared: false
  },
  magma_spike: {
    skillId: 'magma_spike',
    iconId: 'fire_strike',
    iconPath: '/assets/skills/icons/fire_strike.png',
    source: 'l2_authentic',
    semanticCategory: 'fire_strike',
    element: 'Fire',
    role: 'burst',
    shared: false
  },
  holy_bolt: {
    skillId: 'holy_bolt',
    iconId: 'holy_strike',
    iconPath: '/assets/skills/icons/holy_strike.png',
    source: 'l2_authentic',
    semanticCategory: 'holy_magic',
    element: 'Holy',
    role: 'burst',
    shared: false
  },
  flame_nova: {
    skillId: 'flame_nova',
    iconId: 'sorcerer_harmony',
    iconPath: '/assets/skills/icons/sorcerer_harmony.png',
    source: 'l2_authentic',
    semanticCategory: 'fire_aoe',
    element: 'Fire',
    role: 'area',
    shared: false
  },
  meteor: {
    skillId: 'meteor',
    iconId: 'spirit_of_phoenix',
    iconPath: '/assets/skills/icons/spirit_of_phoenix.png',
    source: 'l2_authentic',
    semanticCategory: 'ultimate_fire',
    element: 'Fire',
    role: 'area',
    shared: false
  },
  master_meteor: {
    skillId: 'master_meteor',
    iconId: 'transcendence',
    iconPath: '/assets/skills/icons/transcendence.png',
    source: 'l2_authentic',
    semanticCategory: 'master_ultimate',
    element: 'Fire',
    role: 'area',
    shared: false
  },

  // ─── Human Warg (6) ───────────────────────────────────────────────────────
  savage_bite: {
    skillId: 'savage_bite',
    iconId: 'vampiric_feral_bite',
    iconPath: '/assets/skills/icons/vampiric_feral_bite.png',
    source: 'l2_authentic',
    semanticCategory: 'beast_strike',
    element: 'Physical',
    role: 'burst',
    shared: false
  },
  pack_howl: {
    skillId: 'pack_howl',
    iconId: 'ancestral_wolf',
    iconPath: '/assets/skills/icons/ancestral_wolf.png',
    source: 'l2_authentic',
    semanticCategory: 'beast_buff',
    element: 'Physical',
    role: 'buff',
    shared: false
  },
  feral_pounce: {
    skillId: 'feral_pounce',
    iconId: 'beast_claw',
    iconPath: '/assets/skills/icons/beast_claw.png',
    source: 'l2_authentic',
    semanticCategory: 'beast_bleed',
    element: 'Physical',
    role: 'burst',
    shared: false
  },
  beast_form: {
    skillId: 'beast_form',
    iconId: 'battle_mount',
    iconPath: '/assets/skills/icons/battle_mount.png',
    source: 'l2_authentic',
    semanticCategory: 'beast_mobility',
    element: 'Physical',
    role: 'mobility',
    shared: false
  },
  primal_overrun: {
    skillId: 'primal_overrun',
    iconId: 'feral_strike',
    iconPath: '/assets/skills/icons/feral_strike.png',
    source: 'l2_authentic',
    semanticCategory: 'ultimate_beast',
    element: 'Physical',
    role: 'burst',
    shared: false
  },
  master_primal_overrun: {
    skillId: 'master_primal_overrun',
    iconId: 'battle_recovery',
    iconPath: '/assets/skills/icons/battle_recovery.png',
    source: 'l2_authentic',
    semanticCategory: 'master_ultimate',
    element: 'Physical',
    role: 'burst',
    shared: false
  },

  // ─── Elf Death Knight (6) ─────────────────────────────────────────────────
  frost_edge: {
    skillId: 'frost_edge',
    iconId: 'frost_bolt',
    iconPath: '/assets/skills/icons/frost_bolt.png',
    source: 'l2_authentic',
    semanticCategory: 'ice_slash',
    element: 'Water',
    role: 'burst',
    shared: false
  },
  shattering_gaze: {
    skillId: 'shattering_gaze',
    iconId: 'curved_dagger',
    iconPath: '/assets/skills/icons/curved_dagger.png',
    source: 'l2_authentic',
    semanticCategory: 'ice_control',
    element: 'Water',
    role: 'control',
    shared: false
  },
  cursed_frost_veil: {
    skillId: 'cursed_frost_veil',
    iconId: 'energy_shield',
    iconPath: '/assets/skills/icons/energy_shield.png',
    source: 'l2_authentic',
    semanticCategory: 'ice_tank',
    element: 'Water',
    role: 'tank',
    shared: false
  },
  glacial_judgment: {
    skillId: 'glacial_judgment',
    iconId: 'ice_weave',
    iconPath: '/assets/skills/icons/ice_weave.png',
    source: 'l2_authentic',
    semanticCategory: 'ice_finisher',
    element: 'Water',
    role: 'finisher',
    shared: false
  },
  frostmourne_judgment: {
    skillId: 'frostmourne_judgment',
    iconId: 'ultimate_barrier',
    iconPath: '/assets/skills/icons/ultimate_barrier.png',
    source: 'l2_authentic',
    semanticCategory: 'ultimate_ice',
    element: 'Water',
    role: 'finisher',
    shared: false
  },
  master_frostmourne_judgment: {
    skillId: 'master_frostmourne_judgment',
    iconId: 'spark_barrier',
    iconPath: '/assets/skills/icons/spark_barrier.png',
    source: 'l2_authentic',
    semanticCategory: 'master_ultimate',
    element: 'Water',
    role: 'finisher',
    shared: false
  },

  // ─── Elf Fighter (6) ──────────────────────────────────────────────────────
  aqua_arrow: {
    skillId: 'aqua_arrow',
    iconId: 'sharpshooter_aim',
    iconPath: '/assets/skills/icons/sharpshooter_aim.png',
    source: 'l2_authentic',
    semanticCategory: 'elven_shot',
    element: 'Physical',
    role: 'burst',
    shared: false
  },
  tide_step: {
    skillId: 'tide_step',
    iconId: 'evasion',
    iconPath: '/assets/skills/icons/evasion.png',
    source: 'l2_authentic',
    semanticCategory: 'elven_evasion',
    element: 'Physical',
    role: 'buff',
    shared: false
  },
  mist_guard: {
    skillId: 'mist_guard',
    iconId: 'aegis_shield',
    iconPath: '/assets/skills/icons/aegis_shield.png',
    source: 'l2_authentic',
    semanticCategory: 'elven_shield',
    element: 'Physical',
    role: 'tank',
    shared: false
  },
  riptide_volley: {
    skillId: 'riptide_volley',
    iconId: 'evasive_shot',
    iconPath: '/assets/skills/icons/evasive_shot.png',
    source: 'l2_authentic',
    semanticCategory: 'elven_volley',
    element: 'Physical',
    role: 'area',
    shared: false
  },
  tidal_ascension: {
    skillId: 'tidal_ascension',
    iconId: 'blade_spirit',
    iconPath: '/assets/skills/icons/blade_spirit.png',
    source: 'l2_authentic',
    semanticCategory: 'ultimate_elven',
    element: 'Physical',
    role: 'burst',
    shared: false
  },
  master_tidal_ascension: {
    skillId: 'master_tidal_ascension',
    iconId: 'elven_spirit',
    iconPath: '/assets/skills/icons/elven_spirit.png',
    source: 'l2_authentic',
    semanticCategory: 'master_ultimate',
    element: 'Physical',
    role: 'burst',
    shared: false
  },

  // ─── Elf Mage (6) ─────────────────────────────────────────────────────────
  hydro_blast: {
    skillId: 'hydro_blast',
    iconId: 'fairy_spirit',
    iconPath: '/assets/skills/icons/fairy_spirit.png',
    source: 'l2_authentic',
    semanticCategory: 'water_magic',
    element: 'Water',
    role: 'burst',
    shared: false
  },
  blizzard: {
    skillId: 'blizzard',
    iconId: 'elven_spirit_buff',
    iconPath: '/assets/skills/icons/elven_spirit_buff.png',
    source: 'l2_authentic',
    semanticCategory: 'water_ice',
    element: 'Water',
    role: 'area',
    shared: false
  },
  healing_wave: {
    skillId: 'healing_wave',
    iconId: 'pixie_blessing',
    iconPath: '/assets/skills/icons/pixie_blessing.png',
    source: 'l2_authentic',
    semanticCategory: 'elven_heal',
    element: 'Water',
    role: 'heal',
    shared: false
  },
  tidal_surge: {
    skillId: 'tidal_surge',
    iconId: 'elven_spirit_blade',
    iconPath: '/assets/skills/icons/elven_spirit_blade.png',
    source: 'l2_authentic',
    semanticCategory: 'water_surge',
    element: 'Water',
    role: 'area',
    shared: false
  },
  glacial_cataclysm: {
    skillId: 'glacial_cataclysm',
    iconId: 'mystic_muse_harmony',
    iconPath: '/assets/skills/icons/mystic_muse_harmony.png',
    source: 'l2_authentic',
    semanticCategory: 'ultimate_water',
    element: 'Water',
    role: 'area',
    shared: false
  },
  master_glacial_cataclysm: {
    skillId: 'master_glacial_cataclysm',
    iconId: 'winged_barrier',
    iconPath: '/assets/skills/icons/winged_barrier.png',
    source: 'l2_authentic',
    semanticCategory: 'master_ultimate',
    element: 'Water',
    role: 'area',
    shared: false
  },

  // ─── Dark Elf Assassin (6) ────────────────────────────────────────────────
  toxic_flurry: {
    skillId: 'toxic_flurry',
    iconId: 'dark_dagger',
    iconPath: '/assets/skills/icons/dark_dagger.png',
    source: 'l2_authentic',
    semanticCategory: 'dark_dagger',
    element: 'Dark',
    role: 'burst',
    shared: false
  },
  venom_fang: {
    skillId: 'venom_fang',
    iconId: 'shadow_step',
    iconPath: '/assets/skills/icons/shadow_step.png',
    source: 'l2_authentic',
    semanticCategory: 'dark_fang',
    element: 'Dark',
    role: 'burst',
    shared: false
  },
  shadow_toxin: {
    skillId: 'shadow_toxin',
    iconId: 'ninja_dash',
    iconPath: '/assets/skills/icons/ninja_dash.png',
    source: 'l2_authentic',
    semanticCategory: 'dark_poison',
    element: 'Dark',
    role: 'debuff',
    shared: false
  },
  lethal_dose: {
    skillId: 'lethal_dose',
    iconId: 'critical_chance',
    iconPath: '/assets/skills/icons/critical_chance.png',
    source: 'l2_authentic',
    semanticCategory: 'dark_lethal',
    element: 'Dark',
    role: 'finisher',
    shared: false
  },
  venomous_eclipse: {
    skillId: 'venomous_eclipse',
    iconId: 'abyss_walker_harmony',
    iconPath: '/assets/skills/icons/abyss_walker_harmony.png',
    source: 'l2_authentic',
    semanticCategory: 'ultimate_dark',
    element: 'Dark',
    role: 'finisher',
    shared: false
  },
  master_venomous_eclipse: {
    skillId: 'master_venomous_eclipse',
    iconId: 'ghost_hunter_harmony',
    iconPath: '/assets/skills/icons/ghost_hunter_harmony.png',
    source: 'l2_authentic',
    semanticCategory: 'master_ultimate',
    element: 'Dark',
    role: 'finisher',
    shared: false
  },

  // ─── Dark Elf Blood Rose (6) ──────────────────────────────────────────────
  thorned_hex: {
    skillId: 'thorned_hex',
    iconId: 'rose_petal_strike',
    iconPath: '/assets/skills/icons/rose_petal_strike.png',
    source: 'l2_authentic',
    semanticCategory: 'blood_rose',
    element: 'Dark',
    role: 'burst',
    shared: false
  },
  crimson_drain: {
    skillId: 'crimson_drain',
    iconId: 'vampiric_pulse',
    iconPath: '/assets/skills/icons/vampiric_pulse.png',
    source: 'l2_authentic',
    semanticCategory: 'blood_rose_drain',
    element: 'Dark',
    role: 'drain',
    shared: false
  },
  wilting_touch: {
    skillId: 'wilting_touch',
    iconId: 'dark_thorn_shield',
    iconPath: '/assets/skills/icons/dark_thorn_shield.png',
    source: 'l2_authentic',
    semanticCategory: 'blood_rose_tank',
    element: 'Dark',
    role: 'tank',
    shared: false
  },
  rose_requiem: {
    skillId: 'rose_requiem',
    iconId: 'sanguine_pulse',
    iconPath: '/assets/skills/icons/sanguine_pulse.png',
    source: 'l2_authentic',
    semanticCategory: 'blood_rose_debuff',
    element: 'Dark',
    role: 'debuff',
    shared: false
  },
  crimson_requiem: {
    skillId: 'crimson_requiem',
    iconId: 'blood_rose_harmony',
    iconPath: '/assets/skills/icons/blood_rose_harmony.png',
    source: 'l2_authentic',
    semanticCategory: 'ultimate_blood_rose',
    element: 'Dark',
    role: 'debuff',
    shared: false
  },
  master_crimson_requiem: {
    skillId: 'master_crimson_requiem',
    iconId: 'vampiric_shield',
    iconPath: '/assets/skills/icons/vampiric_shield.png',
    source: 'l2_authentic',
    semanticCategory: 'master_ultimate',
    element: 'Dark',
    role: 'debuff',
    shared: false
  },

  // ─── Dark Elf Death Knight (6) ────────────────────────────────────────────
  voltaic_edge: {
    skillId: 'voltaic_edge',
    iconId: 'lightning_barrier',
    iconPath: '/assets/skills/icons/lightning_barrier.png',
    source: 'l2_authentic',
    semanticCategory: 'lightning_strike',
    element: 'Lightning',
    role: 'burst',
    shared: false
  },
  storm_judgment: {
    skillId: 'storm_judgment',
    iconId: 'thunder_barrier',
    iconPath: '/assets/skills/icons/thunder_barrier.png',
    source: 'l2_authentic',
    semanticCategory: 'lightning_judgment',
    element: 'Lightning',
    role: 'finisher',
    shared: false
  },
  thunder_veil: {
    skillId: 'thunder_veil',
    iconId: 'lightning_step',
    iconPath: '/assets/skills/icons/lightning_step.png',
    source: 'l2_authentic',
    semanticCategory: 'lightning_tank',
    element: 'Lightning',
    role: 'tank',
    shared: false
  },
  shocking_grasp: {
    skillId: 'shocking_grasp',
    iconId: 'storm_barrier',
    iconPath: '/assets/skills/icons/storm_barrier.png',
    source: 'l2_authentic',
    semanticCategory: 'lightning_control',
    element: 'Lightning',
    role: 'control',
    shared: false
  },
  voltaic_requiem: {
    skillId: 'voltaic_requiem',
    iconId: 'storm_screamer_harmony',
    iconPath: '/assets/skills/icons/storm_screamer_harmony.png',
    source: 'l2_authentic',
    semanticCategory: 'ultimate_lightning',
    element: 'Lightning',
    role: 'burst',
    shared: false
  },
  master_voltaic_requiem: {
    skillId: 'master_voltaic_requiem',
    iconId: 'dark_mages_will',
    iconPath: '/assets/skills/icons/dark_mages_will.png',
    source: 'l2_authentic',
    semanticCategory: 'master_ultimate',
    element: 'Lightning',
    role: 'burst',
    shared: false
  },

  // ─── Dark Elf Fighter (6) ─────────────────────────────────────────────────
  venom_edge: {
    skillId: 'venom_edge',
    iconId: 'cure_poison',
    iconPath: '/assets/skills/icons/cure_poison.png',
    source: 'l2_authentic',
    semanticCategory: 'dark_poison',
    element: 'Dark',
    role: 'burst',
    shared: false
  },
  life_siphon: {
    skillId: 'life_siphon',
    iconId: 'dark_drain',
    iconPath: '/assets/skills/icons/dark_drain.png',
    source: 'l2_authentic',
    semanticCategory: 'dark_drain',
    element: 'Dark',
    role: 'heal',
    shared: false
  },
  umbral_dash: {
    skillId: 'umbral_dash',
    iconId: 'haste_step',
    iconPath: '/assets/skills/icons/haste_step.png',
    source: 'l2_authentic',
    semanticCategory: 'dark_mobility',
    element: 'Dark',
    role: 'mobility',
    shared: false
  },
  crippling_slash: {
    skillId: 'crippling_slash',
    iconId: 'dark_weapon',
    iconPath: '/assets/skills/icons/dark_weapon.png',
    source: 'l2_authentic',
    semanticCategory: 'dark_debuff',
    element: 'Dark',
    role: 'debuff',
    shared: false
  },
  abyssal_rupture: {
    skillId: 'abyssal_rupture',
    iconId: 'shillien_knight_harmony',
    iconPath: '/assets/skills/icons/shillien_knight_harmony.png',
    source: 'l2_authentic',
    semanticCategory: 'ultimate_dark',
    element: 'Dark',
    role: 'damage',
    shared: false
  },
  master_abyssal_rupture: {
    skillId: 'master_abyssal_rupture',
    iconId: 'palus_knight_defense',
    iconPath: '/assets/skills/icons/palus_knight_defense.png',
    source: 'l2_authentic',
    semanticCategory: 'master_ultimate',
    element: 'Dark',
    role: 'damage',
    shared: false
  },

  // ─── Dark Elf Mage (6) ────────────────────────────────────────────────────
  hurricane: {
    skillId: 'hurricane',
    iconId: 'cyclone',
    iconPath: '/assets/skills/icons/cyclone.png',
    source: 'l2_authentic',
    semanticCategory: 'wind_dark_magic',
    element: 'Wind',
    role: 'area',
    shared: false
  },
  chain_lightning: {
    skillId: 'chain_lightning',
    iconId: 'tornado_vortex',
    iconPath: '/assets/skills/icons/tornado_vortex.png',
    source: 'l2_authentic',
    semanticCategory: 'lightning_burst',
    element: 'Lightning',
    role: 'burst',
    shared: false
  },
  curse_of_shadow: {
    skillId: 'curse_of_shadow',
    iconId: 'dark_wizard_harmony',
    iconPath: '/assets/skills/icons/dark_wizard_harmony.png',
    source: 'l2_authentic',
    semanticCategory: 'dark_curse',
    element: 'Dark',
    role: 'debuff',
    shared: false
  },
  gale_slash: {
    skillId: 'gale_slash',
    iconId: 'focus',
    iconPath: '/assets/skills/icons/focus.png',
    source: 'l2_authentic',
    semanticCategory: 'wind_blade',
    element: 'Wind',
    role: 'burst',
    shared: false
  },
  tempest_of_the_abyss: {
    skillId: 'tempest_of_the_abyss',
    iconId: 'skull_construct',
    iconPath: '/assets/skills/icons/skull_construct.png',
    source: 'l2_authentic',
    semanticCategory: 'ultimate_wind_dark',
    element: 'Wind',
    role: 'area',
    shared: false
  },
  master_tempest_of_the_abyss: {
    skillId: 'master_tempest_of_the_abyss',
    iconId: 'shillien_saint_cross',
    iconPath: '/assets/skills/icons/shillien_saint_cross.png',
    source: 'l2_authentic',
    semanticCategory: 'master_ultimate',
    element: 'Wind',
    role: 'area',
    shared: false
  },

  // ─── Orc Fighter (6) ──────────────────────────────────────────────────────
  totem_rage: {
    skillId: 'totem_rage',
    iconId: 'orc_ferocity',
    iconPath: '/assets/skills/icons/orc_ferocity.png',
    source: 'l2_authentic',
    semanticCategory: 'orc_buff',
    element: 'Fire',
    role: 'buff',
    shared: false
  },
  brutal_cleave: {
    skillId: 'brutal_cleave',
    iconId: 'orc_power_strike',
    iconPath: '/assets/skills/icons/orc_power_strike.png',
    source: 'l2_authentic',
    semanticCategory: 'orc_cleave',
    element: 'Physical',
    role: 'area',
    shared: false
  },
  war_stomp: {
    skillId: 'war_stomp',
    iconId: 'pummel_strike',
    iconPath: '/assets/skills/icons/pummel_strike.png',
    source: 'l2_authentic',
    semanticCategory: 'orc_stomp',
    element: 'Physical',
    role: 'control',
    shared: false
  },
  blood_frenzy: {
    skillId: 'blood_frenzy',
    iconId: 'orc_spirit',
    iconPath: '/assets/skills/icons/orc_spirit.png',
    source: 'l2_authentic',
    semanticCategory: 'orc_frenzy',
    element: 'Physical',
    role: 'buff',
    shared: false
  },
  worldbreaker_roar: {
    skillId: 'worldbreaker_roar',
    iconId: 'destroyer_harmony',
    iconPath: '/assets/skills/icons/destroyer_harmony.png',
    source: 'l2_authentic',
    semanticCategory: 'ultimate_orc',
    element: 'Physical',
    role: 'finisher',
    shared: false
  },
  master_worldbreaker_roar: {
    skillId: 'master_worldbreaker_roar',
    iconId: 'titan_harmony',
    iconPath: '/assets/skills/icons/titan_harmony.png',
    source: 'l2_authentic',
    semanticCategory: 'master_ultimate',
    element: 'Physical',
    role: 'finisher',
    shared: false
  },

  // ─── Orc Shaman (6) ───────────────────────────────────────────────────────
  flame_totem: {
    skillId: 'flame_totem',
    iconId: 'orc_face',
    iconPath: '/assets/skills/icons/orc_face.png',
    source: 'l2_authentic',
    semanticCategory: 'shaman_totem',
    element: 'Fire',
    role: 'buff',
    shared: false
  },
  war_chant: {
    skillId: 'war_chant',
    iconId: 'group_blessing',
    iconPath: '/assets/skills/icons/group_blessing.png',
    source: 'l2_authentic',
    semanticCategory: 'shaman_chant',
    element: 'Fire',
    role: 'buff',
    shared: false
  },
  ember_bolt: {
    skillId: 'ember_bolt',
    iconId: 'burst_fire_dual',
    iconPath: '/assets/skills/icons/burst_fire_dual.png',
    source: 'l2_authentic',
    semanticCategory: 'shaman_fire',
    element: 'Fire',
    role: 'burst',
    shared: false
  },
  scorching_ground: {
    skillId: 'scorching_ground',
    iconId: 'archmage_harmony',
    iconPath: '/assets/skills/icons/archmage_harmony.png',
    source: 'l2_authentic',
    semanticCategory: 'shaman_aoe',
    element: 'Fire',
    role: 'area',
    shared: false
  },
  apocalypse_totem: {
    skillId: 'apocalypse_totem',
    iconId: 'tyrant_harmony',
    iconPath: '/assets/skills/icons/tyrant_harmony.png',
    source: 'l2_authentic',
    semanticCategory: 'ultimate_totem',
    element: 'Fire',
    role: 'buff',
    shared: false
  },
  master_apocalypse_totem: {
    skillId: 'master_apocalypse_totem',
    iconId: 'grand_khavatari_harmony',
    iconPath: '/assets/skills/icons/grand_khavatari_harmony.png',
    source: 'l2_authentic',
    semanticCategory: 'master_ultimate',
    element: 'Fire',
    role: 'buff',
    shared: false
  },

  // ─── Orc Vanguard Rider (6) ───────────────────────────────────────────────
  flaming_charge: {
    skillId: 'flaming_charge',
    iconId: 'spear_mastery',
    iconPath: '/assets/skills/icons/spear_mastery.png',
    source: 'l2_authentic',
    semanticCategory: 'lance_charge',
    element: 'Physical',
    role: 'mobility',
    shared: false
  },
  spear_of_embers: {
    skillId: 'spear_of_embers',
    iconId: 'vanguard_harmony',
    iconPath: '/assets/skills/icons/vanguard_harmony.png',
    source: 'l2_authentic',
    semanticCategory: 'lance_thrust',
    element: 'Physical',
    role: 'burst',
    shared: false
  },
  trample: {
    skillId: 'trample',
    iconId: 'dragoon_harmony',
    iconPath: '/assets/skills/icons/dragoon_harmony.png',
    source: 'l2_authentic',
    semanticCategory: 'lance_control',
    element: 'Physical',
    role: 'control',
    shared: false
  },
  wildfire_lance: {
    skillId: 'wildfire_lance',
    iconId: 'warlord_harmony',
    iconPath: '/assets/skills/icons/warlord_harmony.png',
    source: 'l2_authentic',
    semanticCategory: 'lance_finisher',
    element: 'Fire',
    role: 'finisher',
    shared: false
  },
  inferno_charge: {
    skillId: 'inferno_charge',
    iconId: 'dreadnought_harmony',
    iconPath: '/assets/skills/icons/dreadnought_harmony.png',
    source: 'l2_authentic',
    semanticCategory: 'ultimate_lance',
    element: 'Physical',
    role: 'mobility',
    shared: false
  },
  master_inferno_charge: {
    skillId: 'master_inferno_charge',
    iconId: 'fortress_defense',
    iconPath: '/assets/skills/icons/fortress_defense.png',
    source: 'l2_authentic',
    semanticCategory: 'master_ultimate',
    element: 'Physical',
    role: 'mobility',
    shared: false
  },

  // ─── Dwarf Artisan (6) ────────────────────────────────────────────────────
  hammer_slam: {
    skillId: 'hammer_slam',
    iconId: 'artisan_hammer',
    iconPath: '/assets/skills/icons/artisan_hammer.png',
    source: 'l2_authentic',
    semanticCategory: 'dwarf_hammer',
    element: 'Earth',
    role: 'burst',
    shared: false
  },
  construct_summon: {
    skillId: 'construct_summon',
    iconId: 'summon_golem',
    iconPath: '/assets/skills/icons/summon_golem.png',
    source: 'l2_authentic',
    semanticCategory: 'dwarf_golem',
    element: 'Earth',
    role: 'buff',
    shared: false
  },
  reinforced_plating: {
    skillId: 'reinforced_plating',
    iconId: 'plate_mastery',
    iconPath: '/assets/skills/icons/plate_mastery.png',
    source: 'l2_authentic',
    semanticCategory: 'dwarf_plating',
    element: 'Metal',
    role: 'tank',
    shared: false
  },
  seismic_stun: {
    skillId: 'seismic_stun',
    iconId: 'golem_power',
    iconPath: '/assets/skills/icons/golem_power.png',
    source: 'l2_authentic',
    semanticCategory: 'dwarf_stun',
    element: 'Earth',
    role: 'control',
    shared: false
  },
  forge_colossus: {
    skillId: 'forge_colossus',
    iconId: 'warsmith_harmony',
    iconPath: '/assets/skills/icons/warsmith_harmony.png',
    source: 'l2_authentic',
    semanticCategory: 'ultimate_golem',
    element: 'Earth',
    role: 'damage',
    shared: false
  },
  master_forge_colossus: {
    skillId: 'master_forge_colossus',
    iconId: 'maestro_harmony',
    iconPath: '/assets/skills/icons/maestro_harmony.png',
    source: 'l2_authentic',
    semanticCategory: 'master_ultimate',
    element: 'Earth',
    role: 'damage',
    shared: false
  },

  // ─── Dwarf Mage (6) ───────────────────────────────────────────────────────
  terremoto: {
    skillId: 'terremoto',
    iconId: 'distortion_punch',
    iconPath: '/assets/skills/icons/distortion_punch.png',
    source: 'l2_authentic',
    semanticCategory: 'earth_quake',
    element: 'Earth',
    role: 'area',
    shared: false
  },
  rochedo: {
    skillId: 'rochedo',
    iconId: 'dwarf_forge',
    iconPath: '/assets/skills/icons/dwarf_forge.png',
    source: 'l2_authentic',
    semanticCategory: 'earth_rock',
    element: 'Earth',
    role: 'burst',
    shared: false
  },
  golem_de_metal: {
    skillId: 'golem_de_metal',
    iconId: 'golem_mastery',
    iconPath: '/assets/skills/icons/golem_mastery.png',
    source: 'l2_authentic',
    semanticCategory: 'metal_golem',
    element: 'Metal',
    role: 'buff',
    shared: false
  },
  garra_metalica: {
    skillId: 'garra_metalica',
    iconId: 'blacksmith_hammer',
    iconPath: '/assets/skills/icons/blacksmith_hammer.png',
    source: 'l2_authentic',
    semanticCategory: 'metal_strike',
    element: 'Metal',
    role: 'burst',
    shared: false
  },
  earthforge_cataclysm: {
    skillId: 'earthforge_cataclysm',
    iconId: 'dwarf_craft',
    iconPath: '/assets/skills/icons/dwarf_craft.png',
    source: 'l2_authentic',
    semanticCategory: 'ultimate_earthforge',
    element: 'Earth',
    role: 'area',
    shared: false
  },
  master_earthforge_cataclysm: {
    skillId: 'master_earthforge_cataclysm',
    iconId: 'master_craft',
    iconPath: '/assets/skills/icons/master_craft.png',
    source: 'l2_authentic',
    semanticCategory: 'master_ultimate',
    element: 'Earth',
    role: 'area',
    shared: false
  },

  // ─── Dwarf ShineMaker (6) ─────────────────────────────────────────────────
  radiant_hammer: {
    skillId: 'radiant_hammer',
    iconId: 'shinemaker_harmony',
    iconPath: '/assets/skills/icons/shinemaker_harmony.png',
    source: 'l2_authentic',
    semanticCategory: 'holy_hammer',
    element: 'Holy',
    role: 'burst',
    shared: false
  },
  guiding_light: {
    skillId: 'guiding_light',
    iconId: 'bounty_hunter_harmony',
    iconPath: '/assets/skills/icons/bounty_hunter_harmony.png',
    source: 'l2_authentic',
    semanticCategory: 'holy_light',
    element: 'Holy',
    role: 'buff',
    shared: false
  },
  celestial_forge: {
    skillId: 'celestial_forge',
    iconId: 'fortune_seeker_harmony',
    iconPath: '/assets/skills/icons/fortune_seeker_harmony.png',
    source: 'l2_authentic',
    semanticCategory: 'holy_forge',
    element: 'Holy',
    role: 'buff',
    shared: false
  },
  sunfall_smash: {
    skillId: 'sunfall_smash',
    iconId: 'spoil',
    iconPath: '/assets/skills/icons/spoil.png',
    source: 'l2_authentic',
    semanticCategory: 'holy_smash',
    element: 'Holy',
    role: 'finisher',
    shared: false
  },
  divine_forge: {
    skillId: 'divine_forge',
    iconId: 'scavenger_loot',
    iconPath: '/assets/skills/icons/scavenger_loot.png',
    source: 'l2_authentic',
    semanticCategory: 'ultimate_divine_forge',
    element: 'Holy',
    role: 'buff',
    shared: false
  },
  master_divine_forge: {
    skillId: 'master_divine_forge',
    iconId: 'golden_shield',
    iconPath: '/assets/skills/icons/golden_shield.png',
    source: 'l2_authentic',
    semanticCategory: 'master_ultimate',
    element: 'Holy',
    role: 'buff',
    shared: false
  },

  // ─── Kamael Samurai (6) ───────────────────────────────────────────────────
  iaijutsu_strike: {
    skillId: 'iaijutsu_strike',
    iconId: 'iaijutsu_slash',
    iconPath: '/assets/skills/icons/iaijutsu_slash.png',
    source: 'l2_authentic',
    semanticCategory: 'katana_slash',
    element: 'Physical',
    role: 'burst',
    shared: false
  },
  gale_step: {
    skillId: 'gale_step',
    iconId: 'speed_boost',
    iconPath: '/assets/skills/icons/speed_boost.png',
    source: 'l2_authentic',
    semanticCategory: 'katana_mobility',
    element: 'Wind',
    role: 'mobility',
    shared: false
  },
  silent_edge: {
    skillId: 'silent_edge',
    iconId: 'katana_focus',
    iconPath: '/assets/skills/icons/katana_focus.png',
    source: 'l2_authentic',
    semanticCategory: 'katana_focus',
    element: 'Physical',
    role: 'burst',
    shared: false
  },
  tempest_form: {
    skillId: 'tempest_form',
    iconId: 'katana_mastery',
    iconPath: '/assets/skills/icons/katana_mastery.png',
    source: 'l2_authentic',
    semanticCategory: 'katana_form',
    element: 'Wind',
    role: 'buff',
    shared: false
  },
  heaven_cutting_tempest: {
    skillId: 'heaven_cutting_tempest',
    iconId: 'samurai_harmony',
    iconPath: '/assets/skills/icons/samurai_harmony.png',
    source: 'l2_authentic',
    semanticCategory: 'ultimate_samurai',
    element: 'Physical',
    role: 'burst',
    shared: false
  },
  master_heaven_cutting_tempest: {
    skillId: 'master_heaven_cutting_tempest',
    iconId: 'way_of_the_blade',
    iconPath: '/assets/skills/icons/way_of_the_blade.png',
    source: 'l2_authentic',
    semanticCategory: 'master_ultimate',
    element: 'Physical',
    role: 'burst',
    shared: false
  },

  // ─── Kamael Soulbreaker (6) ───────────────────────────────────────────────
  soul_rend: {
    skillId: 'soul_rend',
    iconId: 'soul_strike',
    iconPath: '/assets/skills/icons/soul_strike.png',
    source: 'l2_authentic',
    semanticCategory: 'soul_rend',
    element: 'Dark',
    role: 'burst',
    shared: false
  },
  abyssal_pierce: {
    skillId: 'abyssal_pierce',
    iconId: 'soul_crystal',
    iconPath: '/assets/skills/icons/soul_crystal.png',
    source: 'l2_authentic',
    semanticCategory: 'soul_pierce',
    element: 'Dark',
    role: 'burst',
    shared: false
  },
  essence_drain: {
    skillId: 'essence_drain',
    iconId: 'soul_drain',
    iconPath: '/assets/skills/icons/soul_drain.png',
    source: 'l2_authentic',
    semanticCategory: 'soul_drain',
    element: 'Dark',
    role: 'heal',
    shared: false
  },
  shadowmark: {
    skillId: 'shadowmark',
    iconId: 'soul_gem',
    iconPath: '/assets/skills/icons/soul_gem.png',
    source: 'l2_authentic',
    semanticCategory: 'soul_mark',
    element: 'Dark',
    role: 'debuff',
    shared: false
  },
  soul_devastation: {
    skillId: 'soul_devastation',
    iconId: 'soul_hound_harmony',
    iconPath: '/assets/skills/icons/soul_hound_harmony.png',
    source: 'l2_authentic',
    semanticCategory: 'ultimate_soul',
    element: 'Dark',
    role: 'heal',
    shared: false
  },
  master_soul_devastation: {
    skillId: 'master_soul_devastation',
    iconId: 'doombringer_harmony',
    iconPath: '/assets/skills/icons/doombringer_harmony.png',
    source: 'l2_authentic',
    semanticCategory: 'master_ultimate',
    element: 'Dark',
    role: 'heal',
    shared: false
  },

  // ─── Ertheia Marauder (6) ─────────────────────────────────────────────────
  whirlwind_dash: {
    skillId: 'whirlwind_dash',
    iconId: 'wind_step',
    iconPath: '/assets/skills/icons/wind_step.png',
    source: 'l2_authentic',
    semanticCategory: 'wind_dash',
    element: 'Wind',
    role: 'mobility',
    shared: false
  },
  spirit_gale: {
    skillId: 'spirit_gale',
    iconId: 'wind_veil',
    iconPath: '/assets/skills/icons/wind_veil.png',
    source: 'l2_authentic',
    semanticCategory: 'wind_gale',
    element: 'Wind',
    role: 'burst',
    shared: false
  },
  twin_gust_slash: {
    skillId: 'twin_gust_slash',
    iconId: 'wind_walker',
    iconPath: '/assets/skills/icons/wind_walker.png',
    source: 'l2_authentic',
    semanticCategory: 'wind_slash',
    element: 'Wind',
    role: 'burst',
    shared: false
  },
  tempest_veil: {
    skillId: 'tempest_veil',
    iconId: 'sayha_wind',
    iconPath: '/assets/skills/icons/sayha_wind.png',
    source: 'l2_authentic',
    semanticCategory: 'wind_veil',
    element: 'Wind',
    role: 'buff',
    shared: false
  },
  tempest_breaker: {
    skillId: 'tempest_breaker',
    iconId: 'eviscerator_harmony',
    iconPath: '/assets/skills/icons/eviscerator_harmony.png',
    source: 'l2_authentic',
    semanticCategory: 'ultimate_tempest',
    element: 'Wind',
    role: 'mobility',
    shared: false
  },
  master_tempest_breaker: {
    skillId: 'master_tempest_breaker',
    iconId: 'sayha_wind_step',
    iconPath: '/assets/skills/icons/sayha_wind_step.png',
    source: 'l2_authentic',
    semanticCategory: 'master_ultimate',
    element: 'Wind',
    role: 'mobility',
    shared: false
  },

  // ─── Ertheia Storm Blaster (6) ────────────────────────────────────────────
  gale_shot: {
    skillId: 'gale_shot',
    iconId: 'gun_snipe',
    iconPath: '/assets/skills/icons/gun_snipe.png',
    source: 'l2_authentic',
    semanticCategory: 'gun_shot',
    element: 'Wind',
    role: 'burst',
    shared: false
  },
  cyclone_trap: {
    skillId: 'cyclone_trap',
    iconId: 'quick_shot',
    iconPath: '/assets/skills/icons/quick_shot.png',
    source: 'l2_authentic',
    semanticCategory: 'gun_trap',
    element: 'Wind',
    role: 'control',
    shared: false
  },
  sky_dance: {
    skillId: 'sky_dance',
    iconId: 'sylph_grace',
    iconPath: '/assets/skills/icons/sylph_grace.png',
    source: 'l2_authentic',
    semanticCategory: 'gun_mobility',
    element: 'Wind',
    role: 'mobility',
    shared: false
  },
  tempest_barrage: {
    skillId: 'tempest_barrage',
    iconId: 'burst_fire',
    iconPath: '/assets/skills/icons/burst_fire.png',
    source: 'l2_authentic',
    semanticCategory: 'gun_barrage',
    element: 'Wind',
    role: 'area',
    shared: false
  },
  cyclone_barrage: {
    skillId: 'cyclone_barrage',
    iconId: 'storm_blaster',
    iconPath: '/assets/skills/icons/storm_blaster.png',
    source: 'l2_authentic',
    semanticCategory: 'ultimate_gun',
    element: 'Wind',
    role: 'area',
    shared: false
  },
  master_cyclone_barrage: {
    skillId: 'master_cyclone_barrage',
    iconId: 'storm_blaster_harmony',
    iconPath: '/assets/skills/icons/storm_blaster_harmony.png',
    source: 'l2_authentic',
    semanticCategory: 'master_ultimate',
    element: 'Wind',
    role: 'area',
    shared: false
  },

  // ─── High Elf Divine Templar (6) ──────────────────────────────────────────
  divine_bulwark: {
    skillId: 'divine_bulwark',
    iconId: 'divine_barrier',
    iconPath: '/assets/skills/icons/divine_barrier.png',
    source: 'l2_authentic',
    semanticCategory: 'holy_barrier',
    element: 'Holy',
    role: 'tank',
    shared: false
  },
  retribution_flare: {
    skillId: 'retribution_flare',
    iconId: 'divine_cross',
    iconPath: '/assets/skills/icons/divine_cross.png',
    source: 'l2_authentic',
    semanticCategory: 'holy_flare',
    element: 'Holy',
    role: 'burst',
    shared: false
  },
  sacred_ward: {
    skillId: 'sacred_ward',
    iconId: 'shield_of_light',
    iconPath: '/assets/skills/icons/shield_of_light.png',
    source: 'l2_authentic',
    semanticCategory: 'holy_ward',
    element: 'Holy',
    role: 'tank',
    shared: false
  },
  light_point_judgment: {
    skillId: 'light_point_judgment',
    iconId: 'holy_cross',
    iconPath: '/assets/skills/icons/holy_cross.png',
    source: 'l2_authentic',
    semanticCategory: 'holy_judgment',
    element: 'Holy',
    role: 'finisher',
    shared: false
  },
  heavens_aegis: {
    skillId: 'heavens_aegis',
    iconId: 'divine_templar_harmony',
    iconPath: '/assets/skills/icons/divine_templar_harmony.png',
    source: 'l2_authentic',
    semanticCategory: 'ultimate_holy',
    element: 'Holy',
    role: 'tank',
    shared: false
  },
  master_heavens_aegis: {
    skillId: 'master_heavens_aegis',
    iconId: 'light_templar_harmony',
    iconPath: '/assets/skills/icons/light_templar_harmony.png',
    source: 'l2_authentic',
    semanticCategory: 'master_ultimate',
    element: 'Holy',
    role: 'tank',
    shared: false
  },

  // ─── High Elf Element Weaver (6) ──────────────────────────────────────────
  triad_combo: {
    skillId: 'triad_combo',
    iconId: 'element_weaver_harmony',
    iconPath: '/assets/skills/icons/element_weaver_harmony.png',
    source: 'l2_authentic',
    semanticCategory: 'elemental_triad',
    element: 'Fire',
    role: 'burst',
    shared: false
  },
  elemental_fusion: {
    skillId: 'elemental_fusion',
    iconId: 'mystic_burst',
    iconPath: '/assets/skills/icons/mystic_burst.png',
    source: 'l2_authentic',
    semanticCategory: 'elemental_fusion',
    element: 'Fire',
    role: 'area',
    shared: false
  },
  cascading_storm: {
    skillId: 'cascading_storm',
    iconId: 'world_tree',
    iconPath: '/assets/skills/icons/world_tree.png',
    source: 'l2_authentic',
    semanticCategory: 'elemental_storm',
    element: 'Water',
    role: 'area',
    shared: false
  },
  phoenix_tide: {
    skillId: 'phoenix_tide',
    iconId: 'tree_of_life',
    iconPath: '/assets/skills/icons/tree_of_life.png',
    source: 'l2_authentic',
    semanticCategory: 'elemental_tide',
    element: 'Fire',
    role: 'finisher',
    shared: false
  },
  prismatic_genesis: {
    skillId: 'prismatic_genesis',
    iconId: 'divine_light',
    iconPath: '/assets/skills/icons/divine_light.png',
    source: 'l2_authentic',
    semanticCategory: 'ultimate_prismatic',
    element: 'Fire',
    role: 'area',
    shared: false
  },
  master_prismatic_genesis: {
    skillId: 'master_prismatic_genesis',
    iconId: 'holy_slash',
    iconPath: '/assets/skills/icons/holy_slash.png',
    source: 'l2_authentic',
    semanticCategory: 'master_ultimate',
    element: 'Fire',
    role: 'area',
    shared: false
  },
});

/**
 * Resolves a semantic skill icon representation for any skill ID or definition.
 *
 * @param {string|object} skillOrId
 * @param {object} [def]
 * @returns {{ iconId: string, iconPath: string, source: string, element: string, role: string, status: string }}
 */
export function getSkillIcon(skillOrId, def = null) {
  const skillId = typeof skillOrId === 'string' ? skillOrId : (skillOrId?.id || '');
  const skillDef = def || (typeof skillOrId === 'object' ? skillOrId : null);

  // 1. Direct registry hit
  if (SKILL_ICON_REGISTRY[skillId]) {
    const entry = SKILL_ICON_REGISTRY[skillId];
    return {
      ...entry,
      status: entry.shared ? ICON_STATUS.INTENTIONAL_SHARED : ICON_STATUS.UNIQUE
    };
  }

  // 2. Definition explicit icon (if already valid path)
  if (skillDef?.icon && typeof skillDef.icon === 'string' && (skillDef.icon.endsWith('.png') || skillDef.icon.endsWith('.jpg'))) {
    const path = skillDef.icon.startsWith('/') ? skillDef.icon : `/assets/skills/icons/${skillDef.icon}`;
    return {
      skillId,
      iconId: skillId,
      iconPath: path,
      source: 'l2_authentic',
      element: skillDef.element || 'Physical',
      role: skillDef.role || 'damage',
      status: ICON_STATUS.UNIQUE
    };
  }

  // 3. Fallback based on name semantics
  const name = String(skillDef?.name || skillId).toLowerCase().replace(/[^a-z0-9]+/g, '_');
  let iconId = 'power_strike';
  let element = 'Physical';
  let role = 'damage';

  if (/fire|flame|blaze|burn|meteor|inferno/.test(name)) {
    iconId = 'flame_strike';
    element = 'Fire';
  } else if (/water|aqua|hydro|wave|ocean|ice|frost/.test(name)) {
    iconId = 'ice_bolt';
    element = 'Water';
  } else if (/wind|gale|tornado|cyclone|twister/.test(name)) {
    iconId = 'wind_strike';
    element = 'Wind';
  } else if (/holy|divine|light|angel|saint|cure|heal/.test(name)) {
    iconId = 'holy_light';
    element = 'Holy';
  } else if (/dark|shadow|death|drain|vampir|blood/.test(name)) {
    iconId = 'death_spike';
    element = 'Dark';
  } else if (/lightning|thunder|shock|volt/.test(name)) {
    iconId = 'thunder_barrier';
    element = 'Lightning';
  } else if (/earth|ground|stone|rock|hammer|forge|golem/.test(name)) {
    iconId = 'artisan_hammer';
    element = 'Earth';
  } else if (/dagger|assassin|stealth|backstab/.test(name)) {
    iconId = 'deadly_blow';
    element = 'Physical';
    role = 'burst';
  } else if (/bow|shot|arrow|snipe|gun/.test(name)) {
    iconId = 'archery_bow';
    element = 'Physical';
    role = 'damage';
  } else if (/shield|guard|barrier|defend|wall/.test(name)) {
    iconId = 'aegis_shield';
    element = 'Physical';
    role = 'tank';
  } else if (/harmony|will|buff|chant|blessing/.test(name)) {
    iconId = 'group_blessing';
    element = 'Arcane';
    role = 'buff';
  }

  return {
    skillId,
    iconId,
    iconPath: `/assets/skills/icons/${iconId}.png`,
    source: 'l2_authentic',
    element,
    role,
    status: ICON_STATUS.INTENTIONAL_SHARED
  };
}

/**
 * Returns semantic element, role, and category for a skill.
 * @param {string} skillId
 * @returns {{ element: string, role: string, semanticCategory: string }}
 */
export function getSkillSemanticData(skillId) {
  if (SKILL_ICON_REGISTRY[skillId]) {
    return {
      element: SKILL_ICON_REGISTRY[skillId].element,
      role: SKILL_ICON_REGISTRY[skillId].role,
      semanticCategory: SKILL_ICON_REGISTRY[skillId].semanticCategory,
      starRank: typeof SKILL_ICON_REGISTRY[skillId].starRank === 'number' ? SKILL_ICON_REGISTRY[skillId].starRank : 1
    };
  }
  return {
    element: 'Physical',
    role: 'damage',
    semanticCategory: 'general',
    starRank: 1
  };
}
