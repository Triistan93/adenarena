// ═══════════════════════════════════════════
// SKILLS — Human Mage tree (skills DISTINTAS por subclasse)
// ═══════════════════════════════════════════

export const MAGE_SKILLS = {
  // ─── MAGE (base) ───
  mage_wind_strike: {
    id: "mage_wind_strike", name: "Wind Strike", icon: "mage_wind_strike",
    type: "active", tier: 0, rarity: 1, maxLevel: 20, requiredLevel: 1,
    requiredClass: "mage", target: "enemy", range: 600, cooldown: 6,
    mpCost: 12, castTime: 1, animation: "wind_bolt", element: "wind",
    desc: "Projétil de vento básico.",
    effect: { damage: 140 }
  },
  mage_flame_strike: {
    id: "mage_flame_strike", name: "Flame Strike", icon: "mage_flame_strike",
    type: "active", tier: 0, rarity: 1, maxLevel: 20, requiredLevel: 1,
    requiredClass: "mage", target: "enemy", range: 600, cooldown: 8,
    mpCost: 18, castTime: 1.2, animation: "fire_bolt", element: "fire",
    desc: "Projétil de fogo básico.",
    effect: { damage: 160 }
  },
  mage_self_heal: {
    id: "mage_self_heal", name: "Self Heal", icon: "mage_self_heal",
    type: "active", tier: 0, rarity: 1, maxLevel: 20, requiredLevel: 1,
    requiredClass: "mage", target: "self", range: 0, cooldown: 15,
    mpCost: 25, castTime: 2, animation: "heal_glow", element: "holy",
    desc: "Cura básica a si mesmo.",
    effect: { healPercent: 15 }
  },
  mage_robe_mastery: {
    id: "mage_robe_mastery", name: "Robe Mastery", icon: "mage_robe_mastery",
    type: "passive", tier: 0, rarity: 1, maxLevel: 20, requiredLevel: 1,
    requiredClass: "mage", target: "self", range: 0, cooldown: null,
    mpCost: 0, castTime: 0, animation: null, element: null,
    desc: "Aumenta M.ATK com robe.",
    effect: { matkPercent: 8 }
  },

  // ─── WIZARD (1ª) ───
  wizard_blaze: {
    id: "wizard_blaze", name: "Blaze", icon: "wizard_blaze",
    type: "active", tier: 1, rarity: 1, maxLevel: 25, requiredLevel: 20,
    requiredClass: "wizard", target: "enemy", range: 600, cooldown: 8,
    mpCost: 30, castTime: 1, animation: "fire_blast", element: "fire",
    desc: "Explosão de fogo.",
    effect: { damage: 200 }
  },
  wizard_aqua_swirl: {
    id: "wizard_aqua_swirl", name: "Aqua Swirl", icon: "wizard_aqua_swirl",
    type: "active", tier: 1, rarity: 1, maxLevel: 25, requiredLevel: 20,
    requiredClass: "wizard", target: "enemy", range: 600, cooldown: 8,
    mpCost: 28, castTime: 1, animation: "water_swirl", element: "water",
    desc: "Redemoinho aquático.",
    effect: { damage: 190 }
  },

  // ─── SORCERER (2ª — foco FOGO) ───
  sorcerer_prominence: {
    id: "sorcerer_prominence", name: "Prominence", icon: "sorcerer_prominence",
    type: "active", tier: 2, rarity: 2, maxLevel: 30, requiredLevel: 40,
    requiredClass: "sorcerer", target: "enemy", range: 600, cooldown: 16,
    mpCost: 65, castTime: 1.5, animation: "fire_pillar", element: "fire",
    desc: "Pilar de fogo emergente.",
    effect: { damage: 280 }
  },
  sorcerer_blizzard: {
    id: "sorcerer_blizzard", name: "Blizzard", icon: "sorcerer_blizzard",
    type: "active", tier: 2, rarity: 2, maxLevel: 30, requiredLevel: 44,
    requiredClass: "sorcerer", target: "enemy_aoe", range: 600, cooldown: 20,
    mpCost: 80, castTime: 2, animation: "ice_storm", element: "water",
    desc: "Nevasca AoE congelante.",
    effect: { damage: 260, slow: { percent: 30, duration: 4 }, targets: 5 }
  },
  sorcerer_arcane_power: {
    id: "sorcerer_arcane_power", name: "Arcane Power", icon: "sorcerer_arcane_power",
    type: "self-buff", tier: 2, rarity: 3, maxLevel: 10, requiredLevel: 48,
    requiredClass: "sorcerer", target: "self", range: 0, cooldown: 120,
    mpCost: 100, castTime: 2, animation: "arcane_aura", element: null,
    desc: "Poder arcano — aumenta dano mágico massivamente.",
    effect: { matkPercent: 40, castSpeedPercent: 20 },
    duration: 30
  },

  // ─── ARCHMAGE (3ª — skills EXCLUSIVAS fogo) ───
  archmage_meteor: {
    id: "archmage_meteor", name: "Meteor", icon: "archmage_meteor",
    type: "active", tier: 3, rarity: 4, maxLevel: 10, requiredLevel: 80,
    requiredClass: "archmage", target: "enemy_aoe", range: 900, cooldown: 180,
    mpCost: 250, castTime: 3, animation: "meteor_fall", element: "fire",
    desc: "Meteoro devastador — a skill mais poderosa de fogo.",
    effect: { damage: 680, burn: { duration: 8, damagePerTick: 40 }, targets: 10 }
  },
  archmage_hell_inferno: {
    id: "archmage_hell_inferno", name: "Hell Inferno", icon: "archmage_hell_inferno",
    type: "active", tier: 3, rarity: 3, maxLevel: 30, requiredLevel: 76,
    requiredClass: "archmage", target: "enemy", range: 600, cooldown: 25,
    mpCost: 120, castTime: 2, animation: "hell_fire", element: "fire",
    desc: "Inferno das profundezas.",
    effect: { damage: 420, burn: { duration: 6, damagePerTick: 30 } }
  },
  archmage_flame_explosion: {
    id: "archmage_flame_explosion", name: "Flame Explosion", icon: "archmage_flame_explosion",
    type: "active", tier: 3, rarity: 3, maxLevel: 30, requiredLevel: 76,
    requiredClass: "archmage", target: "enemy_aoe", range: 600, cooldown: 35,
    mpCost: 140, castTime: 2, animation: "fire_explosion", element: "fire",
    desc: "Explosão flamejante de 2 hits.",
    effect: { damage: 420, hits: 2, targets: 6 }
  },
  archmage_harmony: {
    id: "archmage_harmony", name: "Archmage's Harmony", icon: "archmage_harmony",
    type: "self-buff", tier: 3, rarity: 4, maxLevel: 5, requiredLevel: 76,
    requiredClass: "archmage", target: "self", range: 0, cooldown: 4200,
    mpCost: 200, castTime: 2, animation: "buff_glow_fire", element: null,
    desc: "Harmony do Arquimago.",
    effect: { matkPercent: 50, castSpeedPercent: 35 },
    duration: 1500
  },

  // ─── NECROMANCER (2ª — skills EXCLUSIVAS dark/undead) ───
  necro_death_spike: {
    id: "necro_death_spike", name: "Death Spike", icon: "necro_death_spike",
    type: "active", tier: 2, rarity: 2, maxLevel: 30, requiredLevel: 40,
    requiredClass: "necromancer", target: "enemy", range: 600, cooldown: 12,
    mpCost: 55, castTime: 1.2, animation: "dark_spike", element: "dark",
    desc: "Estaca da morte — dano dark + drain HP.",
    effect: { damage: 240, drain: { hpPercent: 15 } }
  },
  necro_corpse_plague: {
    id: "necro_corpse_plague", name: "Corpse Plague", icon: "necro_corpse_plague",
    type: "active", tier: 2, rarity: 2, maxLevel: 30, requiredLevel: 44,
    requiredClass: "necromancer", target: "enemy_aoe", range: 600, cooldown: 22,
    mpCost: 75, castTime: 2, animation: "plague_cloud", element: "dark",
    desc: "Praga cadavérica — AoE + poison.",
    effect: { damage: 260, poison: { duration: 8, damagePerTick: 20 }, targets: 5 }
  },
  necro_vampiric_claw: {
    id: "necro_vampiric_claw", name: "Vampiric Claw", icon: "necro_vampiric_claw",
    type: "active", tier: 2, rarity: 3, maxLevel: 30, requiredLevel: 48,
    requiredClass: "necromancer", target: "enemy", range: 600, cooldown: 18,
    mpCost: 65, castTime: 1.5, animation: "vampire_claw", element: "dark",
    desc: "Garras vampíricas — dano + heal.",
    effect: { damage: 280, drain: { hpPercent: 25 } }
  },

  // ─── SOULTAKER (3ª — skills EXCLUSIVAS soul/dark) ───
  soultaker_soul_vortex: {
    id: "soultaker_soul_vortex", name: "Soul Vortex", icon: "soultaker_soul_vortex",
    type: "active", tier: 3, rarity: 3, maxLevel: 30, requiredLevel: 76,
    requiredClass: "soultaker", target: "enemy", range: 600, cooldown: 30,
    mpCost: 120, castTime: 2, animation: "soul_tornado", element: "dark",
    desc: "Vórtice de almas — drena vida.",
    effect: { damage: 380, drain: { hpPercent: 30 } }
  },
  soultaker_void_explosion: {
    id: "soultaker_void_explosion", name: "Void Explosion", icon: "soultaker_void_explosion",
    type: "active", tier: 3, rarity: 4, maxLevel: 10, requiredLevel: 80,
    requiredClass: "soultaker", target: "enemy_aoe", range: 600, cooldown: 140,
    mpCost: 220, castTime: 2.5, animation: "void_blast", element: "dark",
    desc: "Explosão do vazio — 2 hits dark devastadores.",
    effect: { damage: 550, hits: 2, targets: 8 }
  },

  // ─── WARLOCK (2ª — skills EXCLUSIVAS summon) ───
  warlock_summon_soulless: {
    id: "warlock_summon_soulless", name: "Summon Soulless", icon: "warlock_summon_soulless",
    type: "active", tier: 2, rarity: 2, maxLevel: 30, requiredLevel: 40,
    requiredClass: "warlock", target: "self", range: 0, cooldown: 45,
    mpCost: 100, castTime: 3, animation: "summon_dark", element: "dark",
    desc: "Invoca um Soulless para lutar ao lado.",
    effect: { summon: { id: "soulless", atkPercent: 60, hpPercent: 50, duration: 300 } }
  },
  warlock_transfer_pain: {
    id: "warlock_transfer_pain", name: "Transfer Pain", icon: "warlock_transfer_pain",
    type: "toggle", tier: 2, rarity: 2, maxLevel: 20, requiredLevel: 44,
    requiredClass: "warlock", target: "self", range: 0, cooldown: 5,
    mpCost: 2, castTime: 0, animation: "link_aura", element: null,
    desc: "Transfere dano recebido para o summon.",
    effect: { damageTransferPercent: 50 },
    duration: null
  },

  // ─── ARCANA LORD (3ª — skills EXCLUSIVAS summon avançado) ───
  arcanalord_summon_feline_king: {
    id: "arcanalord_summon_feline_king", name: "Summon Feline King", icon: "arcanalord_summon_feline_king",
    type: "active", tier: 3, rarity: 3, maxLevel: 10, requiredLevel: 76,
    requiredClass: "arcanaLord", target: "self", range: 0, cooldown: 90,
    mpCost: 180, castTime: 4, animation: "summon_king", element: "dark",
    desc: "Invoca o Rei Felino lendário.",
    effect: { summon: { id: "feline_king", atkPercent: 100, hpPercent: 80, duration: 600 } }
  },
  arcanalord_servitor_empowerment: {
    id: "arcanalord_servitor_empowerment", name: "Servitor Empowerment", icon: "arcanalord_servitor_empowerment",
    type: "self-buff", tier: 3, rarity: 4, maxLevel: 5, requiredLevel: 80,
    requiredClass: "arcanaLord", target: "self", range: 0, cooldown: 3300,
    mpCost: 160, castTime: 2, animation: "buff_summon", element: null,
    desc: "Empodera todos os summons ativos.",
    effect: { summonAtkPercent: 60, summonDefPercent: 40 },
    duration: 1200
  }
};
