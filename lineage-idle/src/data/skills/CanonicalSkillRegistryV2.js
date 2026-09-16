/**
 * CanonicalSkillRegistryV2.js — Single Source of Truth for Skills (Lineage II Essence - Celestial Destiny 3629)
 * 
 * Major Version Update V2.
 * Total Unique Semantic Skills: 825
 * Audited: 100%
 */

export const CANONICAL_SKILL_REGISTRY_V2 = Object.freeze({
  "power_strike": {
      "id": "power_strike",
      "name": "Power Strike",
      "slug": "power_strike",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0003.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano físico 150%",
      "canonicalCooldown": "8s",
      "canonicalCooldownMs": 8000,
      "desc": "Golpe concentrado no alvo.",
      "balance": {
          "mpCost": 18,
          "pwr": 15,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_power_strike",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "fighter",
          "elfFighter",
          "darkElfFighter",
          "orcFighter",
          "dwarfFighter"
      ]
  },
  "mortal_blow": {
      "id": "mortal_blow",
      "name": "Mortal Blow",
      "slug": "mortal_blow",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0016.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano 170% + chance crit 20%",
      "canonicalCooldown": "10s",
      "canonicalCooldownMs": 10000,
      "desc": "Golpe com chance de crítico elevada.",
      "balance": {
          "mpCost": 20,
          "pwr": 17,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_mortal_blow",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "fighter",
          "elfFighter",
          "darkElfFighter"
      ]
  },
  "power_shot": {
      "id": "power_shot",
      "name": "Power Shot",
      "slug": "power_shot",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0056.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano à distância 140%",
      "canonicalCooldown": "9s",
      "canonicalCooldownMs": 9000,
      "desc": "Disparo concentrado.",
      "balance": {
          "mpCost": 17,
          "pwr": 14,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_power_shot",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "fighter",
          "elfFighter",
          "darkElfFighter"
      ]
  },
  "rush": {
      "id": "rush",
      "name": "Rush",
      "slug": "rush",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Avança ao alvo + dano 120%",
      "canonicalCooldown": "15s",
      "canonicalCooldownMs": 15000,
      "desc": "Investida rápida contra o inimigo.",
      "balance": {
          "mpCost": 14,
          "pwr": 12,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_rush",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "fighter",
          "destroyer",
          "trooper"
      ]
  },
  "bandage": {
      "id": "bandage",
      "name": "Bandage",
      "slug": "bandage",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0034.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Cura 15% HP",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "Curativo de emergência.",
      "balance": {
          "mpCost": 5,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_bandage",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "fighter",
          "darkElfFighter",
          "orcFighter",
          "dwarfFighter"
      ]
  },
  "fighters_will": {
      "id": "fighters_will",
      "name": "Fighter's Will",
      "slug": "fighters_will",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+10% ATK e +10% DEF por 15 min",
      "canonicalCooldown": "30 min",
      "canonicalCooldownMs": 1800000,
      "desc": "Determinação do guerreiro.",
      "balance": {
          "mpCost": 40,
          "pwr": 1,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_fighters_will",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "fighter"
      ]
  },
  "hp_increase_lv1": {
      "id": "hp_increase_lv1",
      "name": "HP Increase Lv1",
      "slug": "hp_increase_lv1",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0211.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+5% Max HP",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Constituição reforçada.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_hp_increase_lv1",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "fighter",
          "elfFighter"
      ]
  },
  "light_armor_mastery": {
      "id": "light_armor_mastery",
      "name": "Light Armor Mastery",
      "slug": "light_armor_mastery",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0233.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+8% DEF com armadura leve",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Maestria em armaduras leves.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_light_armor_mastery",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "fighter",
          "rogue",
          "assassinS0",
          "elfFighter",
          "elfScout",
          "darkElfFighter",
          "assassinDE",
          "orcFighter",
          "monk",
          "dwarfFighter",
          "kamaelSoldier",
          "sylphGunner"
      ]
  },
  "power_smash": {
      "id": "power_smash",
      "name": "Power Smash",
      "slug": "power_smash",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0255.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano 190% + knockback",
      "canonicalCooldown": "10s",
      "canonicalCooldownMs": 10000,
      "desc": "Golpe esmagador.",
      "balance": {
          "mpCost": 23,
          "pwr": 19,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_power_smash",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "warrior",
          "raider"
      ]
  },
  "spinning_slash": {
      "id": "spinning_slash",
      "name": "Spinning Slash",
      "slug": "spinning_slash",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano AoE 160% ao redor",
      "canonicalCooldown": "12s",
      "canonicalCooldownMs": 12000,
      "desc": "Giro cortante ao redor.",
      "balance": {
          "mpCost": 19,
          "pwr": 16,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_spinning_slash",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "warrior",
          "raider"
      ]
  },
  "stun_attack": {
      "id": "stun_attack",
      "name": "Stun Attack",
      "slug": "stun_attack",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0100.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano 175% + stun 2s",
      "canonicalCooldown": "18s",
      "canonicalCooldownMs": 18000,
      "desc": "Golpe atordoante.",
      "balance": {
          "mpCost": 22,
          "pwr": 18,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_stun_attack",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "warrior",
          "raider",
          "scavenger",
          "artisanDwarf"
      ]
  },
  "iron_will": {
      "id": "iron_will",
      "name": "Iron Will",
      "slug": "iron_will",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0072.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+30% DEF por 30s",
      "canonicalCooldown": "45s",
      "canonicalCooldownMs": 45000,
      "desc": "Vontade de ferro temporária.",
      "balance": {
          "mpCost": 5,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_iron_will",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "warrior",
          "raider"
      ]
  },
  "war_cry": {
      "id": "war_cry",
      "name": "War Cry",
      "slug": "war_cry",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0078.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+20% ATK para si por 60s",
      "canonicalCooldown": "60s",
      "canonicalCooldownMs": 60000,
      "desc": "Grito de guerra que inspira força.",
      "balance": {
          "mpCost": 5,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_war_cry",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "warrior",
          "warlord",
          "destroyer"
      ]
  },
  "battle_roar": {
      "id": "battle_roar",
      "name": "Battle Roar",
      "slug": "battle_roar",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0121.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+25% ATK e +15% HP por 20 min",
      "canonicalCooldown": "45 min",
      "canonicalCooldownMs": 2700000,
      "desc": "Rugido de batalha.",
      "balance": {
          "mpCost": 40,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_battle_roar",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "warrior"
      ]
  },
  "sword_blunt_mastery": {
      "id": "sword_blunt_mastery",
      "name": "Sword/Blunt Mastery",
      "slug": "sword_blunt_mastery",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+12% ATK com espada/blunt",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Maestria em espadas e maças.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_sword_blunt_mastery",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "warrior",
          "knight",
          "elvenKnight",
          "palusKnight",
          "raider",
          "artisanDwarf"
      ]
  },
  "polearm_mastery": {
      "id": "polearm_mastery",
      "name": "Polearm Mastery",
      "slug": "polearm_mastery",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0216.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+12% ATK com polearm",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Maestria em lanças.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_polearm_mastery",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "warrior",
          "raider"
      ]
  },
  "heavy_armor_mastery": {
      "id": "heavy_armor_mastery",
      "name": "Heavy Armor Mastery",
      "slug": "heavy_armor_mastery",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0231.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+12% DEF com armadura pesada",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Maestria em armaduras pesadas.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_heavy_armor_mastery",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "warrior",
          "knight",
          "elvenKnight",
          "swordSinger",
          "palusKnight",
          "bladeDancer",
          "raider",
          "artisanDwarf",
          "trooper",
          "lightTemplar"
      ]
  },
  "hp_increase_lv2": {
      "id": "hp_increase_lv2",
      "name": "HP Increase Lv2",
      "slug": "hp_increase_lv2",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0211.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+10% Max HP",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Constituição de guerreiro.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_hp_increase_lv2",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "warrior",
          "knight",
          "elvenKnight"
      ]
  },
  "weight_limit": {
      "id": "weight_limit",
      "name": "Weight Limit",
      "slug": "weight_limit",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0150.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+15% capacidade de carga",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Corpo treinado para suportar peso.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_weight_limit",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "warrior"
      ]
  },
  "triple_slash": {
      "id": "triple_slash",
      "name": "Triple Slash",
      "slug": "triple_slash",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0007.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "3 golpes, dano total 300%",
      "canonicalCooldown": "14s",
      "canonicalCooldownMs": 14000,
      "desc": "Três cortes rápidos consecutivos.",
      "balance": {
          "mpCost": 36,
          "pwr": 30,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_triple_slash",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "gladiator"
      ]
  },
  "sonic_blaster": {
      "id": "sonic_blaster",
      "name": "Sonic Blaster",
      "slug": "sonic_blaster",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0006.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano 240% + stun 2s",
      "canonicalCooldown": "16s",
      "canonicalCooldownMs": 16000,
      "desc": "Onda sônica que atordoa.",
      "balance": {
          "mpCost": 29,
          "pwr": 24,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_sonic_blaster",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "gladiator"
      ]
  },
  "sonic_storm": {
      "id": "sonic_storm",
      "name": "Sonic Storm",
      "slug": "sonic_storm",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0007.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano AoE 320% (8 alvos)",
      "canonicalCooldown": "25s",
      "canonicalCooldownMs": 25000,
      "desc": "Tempestade sônica devastadora.",
      "balance": {
          "mpCost": 38,
          "pwr": 32,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_sonic_storm",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "gladiator"
      ]
  },
  "sonic_buster": {
      "id": "sonic_buster",
      "name": "Sonic Buster",
      "slug": "sonic_buster",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0009.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano 260% + pushback",
      "canonicalCooldown": "18s",
      "canonicalCooldownMs": 18000,
      "desc": "Explosão sônica frontal.",
      "balance": {
          "mpCost": 31,
          "pwr": 26,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_sonic_buster",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "gladiator"
      ]
  },
  "double_sonic_slash": {
      "id": "double_sonic_slash",
      "name": "Double Sonic Slash",
      "slug": "double_sonic_slash",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0005.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano 350% em 2 hits",
      "canonicalCooldown": "22s",
      "canonicalCooldownMs": 22000,
      "desc": "Duplo corte sônico.",
      "balance": {
          "mpCost": 42,
          "pwr": 35,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_double_sonic_slash",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "gladiator"
      ]
  },
  "hammer_crush": {
      "id": "hammer_crush",
      "name": "Hammer Crush",
      "slug": "hammer_crush",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0260.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano 230% + stun 3s",
      "canonicalCooldown": "20s",
      "canonicalCooldownMs": 20000,
      "desc": "Esmagamento com martelo.",
      "balance": {
          "mpCost": 28,
          "pwr": 23,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_hammer_crush",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "gladiator",
          "destroyer"
      ]
  },
  "sonic_move": {
      "id": "sonic_move",
      "name": "Sonic Move",
      "slug": "sonic_move",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0451.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Teleporte curto + 180% dano",
      "canonicalCooldown": "20s",
      "canonicalCooldownMs": 20000,
      "desc": "Movimento sônico instantâneo.",
      "balance": {
          "mpCost": 22,
          "pwr": 18,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_sonic_move",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "gladiator"
      ]
  },
  "lionheart": {
      "id": "lionheart",
      "name": "Lionheart",
      "slug": "lionheart",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0287.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Imune a medo/stun por 15s",
      "canonicalCooldown": "120s",
      "canonicalCooldownMs": 120000,
      "desc": "Coração de leão — coragem inabalável.",
      "balance": {
          "mpCost": 40,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_lionheart",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "gladiator",
          "dreadnought"
      ]
  },
  "war_frenzy": {
      "id": "war_frenzy",
      "name": "War Frenzy",
      "slug": "war_frenzy",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0424.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+20% ATK Speed por 60s",
      "canonicalCooldown": "90s",
      "canonicalCooldownMs": 90000,
      "desc": "Frenesi de combate.",
      "balance": {
          "mpCost": 40,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_war_frenzy",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "gladiator",
          "dreadnought"
      ]
  },
  "vicious_stance": {
      "id": "vicious_stance",
      "name": "Vicious Stance",
      "slug": "vicious_stance",
      "type": "toggle",
      "rawType": "Toggle",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0312.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+25% Crit Rate, -10% DEF",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Postura agressiva permanente.",
      "balance": {
          "mpCost": 2,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_vicious_stance",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "gladiator"
      ]
  },
  "gladiators_harmony": {
      "id": "gladiators_harmony",
      "name": "Gladiator's Harmony",
      "slug": "gladiators_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+35% ATK e +20% Crit por 25 min",
      "canonicalCooldown": "60 min",
      "canonicalCooldownMs": 3600000,
      "desc": "Harmonia do gladiador.",
      "balance": {
          "mpCost": 40,
          "pwr": 4,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_gladiators_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "gladiator"
      ]
  },
  "dual_weapon_mastery": {
      "id": "dual_weapon_mastery",
      "name": "Dual Weapon Mastery",
      "slug": "dual_weapon_mastery",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0144.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+18% ATK com dual weapons",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Maestria em armas duplas.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_dual_weapon_mastery",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "gladiator",
          "bladeDancer"
      ]
  },
  "focus": {
      "id": "focus",
      "name": "Focus",
      "slug": "focus",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill1077.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+8% Crit Rate",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Concentração em pontos vitais.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_focus",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "gladiator",
          "warlord",
          "treasureHunter",
          "hawkeye",
          "prophet",
          "plainsWalker",
          "silverRanger",
          "abyssWalker",
          "phantomRanger",
          "destroyer",
          "monk",
          "bountyHunter",
          "berserker",
          "soulRanger"
      ]
  },
  "critical_power": {
      "id": "critical_power",
      "name": "Critical Power",
      "slug": "critical_power",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill4085.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+15% Crit Damage",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Poder crítico aumentado.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_critical_power",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "gladiator",
          "treasureHunter",
          "hawkeye",
          "plainsWalker",
          "silverRanger",
          "abyssWalker",
          "phantomRanger",
          "bountyHunter",
          "soulRanger"
      ]
  },
  "boost_hp": {
      "id": "boost_hp",
      "name": "Boost HP",
      "slug": "boost_hp",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0211.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+12% Max HP",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "HP reforçado do gladiador.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_boost_hp",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "gladiator",
          "warlord",
          "paladin",
          "darkAvenger",
          "templeKnight",
          "swordSinger",
          "shillienKnight",
          "bladeDancer",
          "destroyer",
          "overlord",
          "bountyHunter",
          "trooper",
          "warder"
      ]
  },
  "sonic_focus": {
      "id": "sonic_focus",
      "name": "Sonic Focus",
      "slug": "sonic_focus",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0008.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano 380% + ignora 30% DEF",
      "canonicalCooldown": "28s",
      "canonicalCooldownMs": 28000,
      "desc": "Foco sônico devastador.",
      "balance": {
          "mpCost": 46,
          "pwr": 38,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_sonic_focus",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "duelist"
      ]
  },
  "force_blaster": {
      "id": "force_blaster",
      "name": "Force Blaster",
      "slug": "force_blaster",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0054.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano 340% à distância",
      "canonicalCooldown": "20s",
      "canonicalCooldownMs": 20000,
      "desc": "Projétil de força sônica.",
      "balance": {
          "mpCost": 41,
          "pwr": 34,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_force_blaster",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "duelist",
          "tyrant"
      ]
  },
  "dual_blow": {
      "id": "dual_blow",
      "name": "Dual Blow",
      "slug": "dual_blow",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano 400% + bleed 8s",
      "canonicalCooldown": "24s",
      "canonicalCooldownMs": 24000,
      "desc": "Golpe duplo sangrento.",
      "balance": {
          "mpCost": 48,
          "pwr": 40,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_dual_blow",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "duelist"
      ]
  },
  "rushing_force": {
      "id": "rushing_force",
      "name": "Rushing Force",
      "slug": "rushing_force",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Rush + 320% dano + stun 2s",
      "canonicalCooldown": "22s",
      "canonicalCooldownMs": 22000,
      "desc": "Avanço forçado.",
      "balance": {
          "mpCost": 38,
          "pwr": 32,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_rushing_force",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "duelist"
      ]
  },
  "long_blow": {
      "id": "long_blow",
      "name": "Long Blow",
      "slug": "long_blow",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano 280% alcance estendido",
      "canonicalCooldown": "16s",
      "canonicalCooldownMs": 16000,
      "desc": "Golpe de longo alcance.",
      "balance": {
          "mpCost": 34,
          "pwr": 28,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_long_blow",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "duelist"
      ]
  },
  "force_buster": {
      "id": "force_buster",
      "name": "Force Buster",
      "slug": "force_buster",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano AoE 360% frontal",
      "canonicalCooldown": "26s",
      "canonicalCooldownMs": 26000,
      "desc": "Explosão de força frontal.",
      "balance": {
          "mpCost": 43,
          "pwr": 36,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_force_buster",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "duelist",
          "tyrant"
      ]
  },
  "earthquake": {
      "id": "earthquake",
      "name": "Earthquake",
      "slug": "earthquake",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano AoE 420% + knockdown 3s",
      "canonicalCooldown": "35s",
      "canonicalCooldownMs": 35000,
      "desc": "Terremoto devastador.",
      "balance": {
          "mpCost": 50,
          "pwr": 42,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_earthquake",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "duelist",
          "titan"
      ]
  },
  "real_target": {
      "id": "real_target",
      "name": "Real Target",
      "slug": "real_target",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Marca alvo: +30% dano contra ele 10s",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "Identifica ponto fraco.",
      "balance": {
          "mpCost": 5,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_real_target",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "duelist",
          "titan"
      ]
  },
  "thrill_fight": {
      "id": "thrill_fight",
      "name": "Thrill Fight",
      "slug": "thrill_fight",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0130.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+40% ATK por 30s quando HP < 30%",
      "canonicalCooldown": "120s",
      "canonicalCooldownMs": 120000,
      "desc": "Adrenalina em estado crítico.",
      "balance": {
          "mpCost": 40,
          "pwr": 4,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_thrill_fight",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "duelist"
      ]
  },
  "sonic_rage": {
      "id": "sonic_rage",
      "name": "Sonic Rage",
      "slug": "sonic_rage",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0345.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano 450% + AoE 5 alvos",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "Fúria sônica descontrolada.",
      "balance": {
          "mpCost": 54,
          "pwr": 45,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_sonic_rage",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "duelist"
      ]
  },
  "transcendent_dual_blow": {
      "id": "transcendent_dual_blow",
      "name": "Transcendent Dual Blow",
      "slug": "transcendent_dual_blow",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano 620% + bleed 12s + ignora DEF",
      "canonicalCooldown": "150s",
      "canonicalCooldownMs": 150000,
      "desc": "Golpe duplo transcendente.",
      "balance": {
          "mpCost": 40,
          "pwr": 62,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_transcendent_dual_blow",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "duelist"
      ]
  },
  "duelists_harmony": {
      "id": "duelists_harmony",
      "name": "Duelist's Harmony",
      "slug": "duelists_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+55% ATK, +40% Crit, +20% Speed 30min",
      "canonicalCooldown": "90 min",
      "canonicalCooldownMs": 5400000,
      "desc": "Harmonia suprema do duelista.",
      "balance": {
          "mpCost": 40,
          "pwr": 6,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_duelists_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "duelist"
      ]
  },
  "master_of_combat": {
      "id": "master_of_combat",
      "name": "Master of Combat",
      "slug": "master_of_combat",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0430.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+10% ATK, +10% Crit, +5% PvE dmg",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Mestre do combate.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_master_of_combat",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "duelist",
          "dreadnought",
          "phoenixKnight",
          "hellKnight",
          "adventurer",
          "sagittarius",
          "deathKnight",
          "assassinS3",
          "evaTemplar",
          "windRider",
          "moonlightSentinel",
          "shillienTemplar",
          "spectralDancer",
          "ghostHunter",
          "ghostSentinel",
          "spectralMaster",
          "fortuneSeeker",
          "maestro",
          "doombringer",
          "soulHound",
          "trickster",
          "samurai",
          "stormBlaster"
      ]
  },
  "duelist_spirit": {
      "id": "duelist_spirit",
      "name": "Duelist Spirit",
      "slug": "duelist_spirit",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0297.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+15% dual weapon ATK",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Espírito do duelista.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_duelist_spirit",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "duelist"
      ]
  },
  "blade_of_the_duelist": {
      "id": "blade_of_the_duelist",
      "name": "Blade of the Duelist",
      "slug": "blade_of_the_duelist",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+12% P.Skill Power",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Lâmina imbuída de poder.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_blade_of_the_duelist",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "duelist"
      ]
  },
  "whirlwind": {
      "id": "whirlwind",
      "name": "Whirlwind",
      "slug": "whirlwind",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0036.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano AoE 280% (10 alvos)",
      "canonicalCooldown": "18s",
      "canonicalCooldownMs": 18000,
      "desc": "Redemoinho de lança.",
      "balance": {
          "mpCost": 34,
          "pwr": 28,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_whirlwind",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "warlord",
          "destroyer"
      ]
  },
  "thunder_storm": {
      "id": "thunder_storm",
      "name": "Thunder Storm",
      "slug": "thunder_storm",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0048.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano AoE 340% + stun 2s",
      "canonicalCooldown": "25s",
      "canonicalCooldownMs": 25000,
      "desc": "Tempestade trovejante.",
      "balance": {
          "mpCost": 41,
          "pwr": 34,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_thunder_storm",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "warlord",
          "destroyer"
      ]
  },
  "howl": {
      "id": "howl",
      "name": "Howl",
      "slug": "howl",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0116.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "AoE taunt + -15% ATK inimigos 10s",
      "canonicalCooldown": "20s",
      "canonicalCooldownMs": 20000,
      "desc": "Uivo ameaçador.",
      "balance": {
          "mpCost": 5,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_howl",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "warlord",
          "destroyer"
      ]
  },
  "provoke": {
      "id": "provoke",
      "name": "Provoke",
      "slug": "provoke",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0286.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Taunt single + dano 120%",
      "canonicalCooldown": "10s",
      "canonicalCooldownMs": 10000,
      "desc": "Provocação direta.",
      "balance": {
          "mpCost": 14,
          "pwr": 12,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_provoke",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "warlord",
          "paladin",
          "templeKnight",
          "shillienKnight",
          "overlord"
      ]
  },
  "fellswoop": {
      "id": "fellswoop",
      "name": "Fellswoop",
      "slug": "fellswoop",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano 250% + knockdown 2s",
      "canonicalCooldown": "20s",
      "canonicalCooldownMs": 20000,
      "desc": "Golpe varredor.",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_fellswoop",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "warlord"
      ]
  },
  "freezing_strike": {
      "id": "freezing_strike",
      "name": "Freezing Strike",
      "slug": "freezing_strike",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0105.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano 220% + slow 30% por 8s",
      "canonicalCooldown": "18s",
      "canonicalCooldownMs": 18000,
      "desc": "Golpe congelante.",
      "balance": {
          "mpCost": 26,
          "pwr": 22,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_freezing_strike",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "warlord"
      ]
  },
  "burning_chop": {
      "id": "burning_chop",
      "name": "Burning Chop",
      "slug": "burning_chop",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano 240% + burn 8s",
      "canonicalCooldown": "18s",
      "canonicalCooldownMs": 18000,
      "desc": "Golpe flamejante.",
      "balance": {
          "mpCost": 29,
          "pwr": 24,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_burning_chop",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "warlord",
          "destroyer"
      ]
  },
  "shock_stomp": {
      "id": "shock_stomp",
      "name": "Shock Stomp",
      "slug": "shock_stomp",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0452.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "AoE 200% + stun 2s (perto)",
      "canonicalCooldown": "22s",
      "canonicalCooldownMs": 22000,
      "desc": "Pisão sísmico.",
      "balance": {
          "mpCost": 24,
          "pwr": 20,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_shock_stomp",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "warlord"
      ]
  },
  "warlords_harmony": {
      "id": "warlords_harmony",
      "name": "Warlord's Harmony",
      "slug": "warlords_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+30% ATK, +25% HP por 25 min",
      "canonicalCooldown": "60 min",
      "canonicalCooldownMs": 3600000,
      "desc": "Harmonia do senhor da guerra.",
      "balance": {
          "mpCost": 40,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_warlords_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "warlord"
      ]
  },
  "vital_force": {
      "id": "vital_force",
      "name": "Vital Force",
      "slug": "vital_force",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0148.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+10% HP Regen",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Força vital.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_vital_force",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "warlord"
      ]
  },
  "rush_impact": {
      "id": "rush_impact",
      "name": "Rush Impact",
      "slug": "rush_impact",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Rush + 350% dano + stun 3s",
      "canonicalCooldown": "25s",
      "canonicalCooldownMs": 25000,
      "desc": "Investida devastadora.",
      "balance": {
          "mpCost": 42,
          "pwr": 35,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_rush_impact",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "dreadnought",
          "berserker"
      ]
  },
  "dread_pool": {
      "id": "dread_pool",
      "name": "Dread Pool",
      "slug": "dread_pool",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "AoE contínuo 200%/s por 5s (8 alvos)",
      "canonicalCooldown": "35s",
      "canonicalCooldownMs": 35000,
      "desc": "Área de terror.",
      "balance": {
          "mpCost": 24,
          "pwr": 20,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_dread_pool",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "dreadnought"
      ]
  },
  "spike": {
      "id": "spike",
      "name": "Spike",
      "slug": "spike",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano 380% + penetra DEF 40%",
      "canonicalCooldown": "28s",
      "canonicalCooldownMs": 28000,
      "desc": "Estocada penetrante.",
      "balance": {
          "mpCost": 46,
          "pwr": 38,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_spike",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "dreadnought"
      ]
  },
  "anti_magic_armor": {
      "id": "anti_magic_armor",
      "name": "Anti-Magic Armor",
      "slug": "anti_magic_armor",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+50% M.DEF por 20s",
      "canonicalCooldown": "60s",
      "canonicalCooldownMs": 60000,
      "desc": "Armadura anti-mágica.",
      "balance": {
          "mpCost": 6,
          "pwr": 5,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_anti_magic_armor",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "dreadnought",
          "titan"
      ]
  },
  "weapon_blockade": {
      "id": "weapon_blockade",
      "name": "Weapon Blockade",
      "slug": "weapon_blockade",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Desarma inimigo por 5s",
      "canonicalCooldown": "45s",
      "canonicalCooldownMs": 45000,
      "desc": "Bloqueio de arma.",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_weapon_blockade",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "dreadnought"
      ]
  },
  "transcendent_whirlwind": {
      "id": "transcendent_whirlwind",
      "name": "Transcendent Whirlwind",
      "slug": "transcendent_whirlwind",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano AoE 600% + knockdown (12 alvos)",
      "canonicalCooldown": "160s",
      "canonicalCooldownMs": 160000,
      "desc": "Redemoinho transcendente.",
      "balance": {
          "mpCost": 40,
          "pwr": 60,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_transcendent_whirlwind",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "dreadnought"
      ]
  },
  "dreadnoughts_harmony": {
      "id": "dreadnoughts_harmony",
      "name": "Dreadnought's Harmony",
      "slug": "dreadnoughts_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+50% ATK, +35% HP, +20% DEF 30min",
      "canonicalCooldown": "90 min",
      "canonicalCooldownMs": 5400000,
      "desc": "Harmonia do encouraçado.",
      "balance": {
          "mpCost": 40,
          "pwr": 5,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_dreadnoughts_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "dreadnought"
      ]
  },
  "dreadnought_spirit": {
      "id": "dreadnought_spirit",
      "name": "Dreadnought Spirit",
      "slug": "dreadnought_spirit",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% Polearm ATK",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Espírito do encouraçado.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_dreadnought_spirit",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "dreadnought"
      ]
  },
  "body_of_the_dreadnought": {
      "id": "body_of_the_dreadnought",
      "name": "Body of the Dreadnought",
      "slug": "body_of_the_dreadnought",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+10% Max HP, +10% DEF",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Corpo indestrutível.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_body_of_the_dreadnought",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "dreadnought"
      ]
  },
  "shield_strike": {
      "id": "shield_strike",
      "name": "Shield Strike",
      "slug": "shield_strike",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano 170% + taunt 5s",
      "canonicalCooldown": "10s",
      "canonicalCooldownMs": 10000,
      "desc": "Golpe de escudo.",
      "balance": {
          "mpCost": 20,
          "pwr": 17,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_shield_strike",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "knight",
          "elvenKnight",
          "palusKnight"
      ]
  },
  "hate": {
      "id": "hate",
      "name": "Hate",
      "slug": "hate",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Taunt alvo + aggro máximo",
      "canonicalCooldown": "8s",
      "canonicalCooldownMs": 8000,
      "desc": "Gera ódio no alvo.",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_hate",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "knight",
          "elvenKnight",
          "palusKnight"
      ]
  },
  "aura_of_hate": {
      "id": "aura_of_hate",
      "name": "Aura of Hate",
      "slug": "aura_of_hate",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0018.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "AoE taunt (5 alvos) 8s",
      "canonicalCooldown": "18s",
      "canonicalCooldownMs": 18000,
      "desc": "Aura de ódio.",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_aura_of_hate",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "knight"
      ]
  },
  "power_break": {
      "id": "power_break",
      "name": "Power Break",
      "slug": "power_break",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0115.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano 150% + -20% ATK inimigo 8s",
      "canonicalCooldown": "14s",
      "canonicalCooldownMs": 14000,
      "desc": "Quebra de poder.",
      "balance": {
          "mpCost": 18,
          "pwr": 15,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_power_break",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "knight",
          "elvenKnight",
          "palusKnight"
      ]
  },
  "divine_heal": {
      "id": "divine_heal",
      "name": "Divine Heal",
      "slug": "divine_heal",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0045.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Cura 20% HP próprio",
      "canonicalCooldown": "25s",
      "canonicalCooldownMs": 25000,
      "desc": "Cura divina.",
      "balance": {
          "mpCost": 5,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_divine_heal",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "knight"
      ]
  },
  "knights_harmony": {
      "id": "knights_harmony",
      "name": "Knight's Harmony",
      "slug": "knights_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+25% DEF e +20% HP por 20 min",
      "canonicalCooldown": "45 min",
      "canonicalCooldownMs": 2700000,
      "desc": "Harmonia do cavaleiro.",
      "balance": {
          "mpCost": 40,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_knights_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "knight"
      ]
  },
  "shield_mastery": {
      "id": "shield_mastery",
      "name": "Shield Mastery",
      "slug": "shield_mastery",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0153.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+15% Block Rate",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Maestria em escudos.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_shield_mastery",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "knight",
          "elvenKnight",
          "palusKnight"
      ]
  },
  "deflect_arrow": {
      "id": "deflect_arrow",
      "name": "Deflect Arrow",
      "slug": "deflect_arrow",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0112.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+10% chance desviar projéteis",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Desvio de projéteis.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_deflect_arrow",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "knight",
          "elvenKnight",
          "palusKnight"
      ]
  },
  "shield_stun": {
      "id": "shield_stun",
      "name": "Shield Stun",
      "slug": "shield_stun",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0092.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano 210% + stun 3s",
      "canonicalCooldown": "18s",
      "canonicalCooldownMs": 18000,
      "desc": "Escudada atordoante.",
      "balance": {
          "mpCost": 25,
          "pwr": 21,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_shield_stun",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "paladin",
          "darkAvenger",
          "templeKnight",
          "shillienKnight"
      ]
  },
  "holy_blade": {
      "id": "holy_blade",
      "name": "Holy Blade",
      "slug": "holy_blade",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0196.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano sagrado 260%",
      "canonicalCooldown": "16s",
      "canonicalCooldownMs": 16000,
      "desc": "Lâmina sagrada.",
      "balance": {
          "mpCost": 31,
          "pwr": 26,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_holy_blade",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "paladin",
          "templeKnight"
      ]
  },
  "holy_strike": {
      "id": "holy_strike",
      "name": "Holy Strike",
      "slug": "holy_strike",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill1027.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano sagrado 320% + undead 2x",
      "canonicalCooldown": "20s",
      "canonicalCooldownMs": 20000,
      "desc": "Golpe sagrado devastador.",
      "balance": {
          "mpCost": 38,
          "pwr": 32,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_holy_strike",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "paladin",
          "bishop",
          "prophet",
          "lightTemplar"
      ]
  },
  "majesty": {
      "id": "majesty",
      "name": "Majesty",
      "slug": "majesty",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0082.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Não pode morrer por 7s (HP min 1)",
      "canonicalCooldown": "180s",
      "canonicalCooldownMs": 180000,
      "desc": "Majestade divina.",
      "balance": {
          "mpCost": 40,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_majesty",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "paladin"
      ]
  },
  "angelic_icon": {
      "id": "angelic_icon",
      "name": "Angelic Icon",
      "slug": "angelic_icon",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0406.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+30% DEF, +30% M.DEF por 30s",
      "canonicalCooldown": "120s",
      "canonicalCooldownMs": 120000,
      "desc": "Ícone angelical.",
      "balance": {
          "mpCost": 40,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_angelic_icon",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "paladin"
      ]
  },
  "sacrifice": {
      "id": "sacrifice",
      "name": "Sacrifice",
      "slug": "sacrifice",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0069.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Cura aliado 30% HP (gasta 10% próprio)",
      "canonicalCooldown": "25s",
      "canonicalCooldownMs": 25000,
      "desc": "Sacrifício pelo aliado.",
      "balance": {
          "mpCost": 5,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_sacrifice",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "paladin",
          "templeKnight",
          "shillienKnight"
      ]
  },
  "aegis": {
      "id": "aegis",
      "name": "Aegis",
      "slug": "aegis",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0316.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+60% Block Rate por 15s",
      "canonicalCooldown": "45s",
      "canonicalCooldownMs": 45000,
      "desc": "Aegis defensivo.",
      "balance": {
          "mpCost": 7,
          "pwr": 6,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_aegis",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "paladin",
          "templeKnight",
          "shillienKnight"
      ]
  },
  "vengeance": {
      "id": "vengeance",
      "name": "Vengeance",
      "slug": "vengeance",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0368.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Reflete 30% dano recebido por 15s",
      "canonicalCooldown": "60s",
      "canonicalCooldownMs": 60000,
      "desc": "Vingança sagrada.",
      "balance": {
          "mpCost": 5,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_vengeance",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "paladin"
      ]
  },
  "ultimate_defense": {
      "id": "ultimate_defense",
      "name": "Ultimate Defense",
      "slug": "ultimate_defense",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0110.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+80% DEF, -50% ATK por 15s",
      "canonicalCooldown": "120s",
      "canonicalCooldownMs": 120000,
      "desc": "Defesa absoluta.",
      "balance": {
          "mpCost": 40,
          "pwr": 8,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_ultimate_defense",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "paladin",
          "templeKnight",
          "shillienKnight"
      ]
  },
  "holy_blessing": {
      "id": "holy_blessing",
      "name": "Holy Blessing",
      "slug": "holy_blessing",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0262.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Remove 2 debuffs",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "Bênção purificadora.",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_holy_blessing",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "paladin"
      ]
  },
  "summon_storm_cubic": {
      "id": "summon_storm_cubic",
      "name": "Summon Storm Cubic",
      "slug": "summon_storm_cubic",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0010.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Invoca cubic de dano lightning",
      "canonicalCooldown": "60s",
      "canonicalCooldownMs": 60000,
      "desc": "Cubic de tempestade.",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_summon_storm_cubic",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "paladin",
          "templeKnight"
      ]
  },
  "paladins_harmony": {
      "id": "paladins_harmony",
      "name": "Paladin's Harmony",
      "slug": "paladins_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+40% DEF, +30% HP, +20% M.DEF 25min",
      "canonicalCooldown": "60 min",
      "canonicalCooldownMs": 3600000,
      "desc": "Harmonia do paladino.",
      "balance": {
          "mpCost": 40,
          "pwr": 4,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_paladins_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "paladin"
      ]
  },
  "resist_holy_dark": {
      "id": "resist_holy_dark",
      "name": "Resist Holy/Dark",
      "slug": "resist_holy_dark",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% resist holy/dark",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Resistência sagrada.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_resist_holy_dark",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "paladin"
      ]
  },
  "touch_of_life": {
      "id": "touch_of_life",
      "name": "Touch of Life",
      "slug": "touch_of_life",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0341.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Cura AoE 25% HP (party)",
      "canonicalCooldown": "35s",
      "canonicalCooldownMs": 35000,
      "desc": "Toque vital da fênix.",
      "balance": {
          "mpCost": 5,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_touch_of_life",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "phoenixKnight"
      ]
  },
  "phoenix_aura": {
      "id": "phoenix_aura",
      "name": "Phoenix Aura",
      "slug": "phoenix_aura",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+45% DEF, +HP Regen 3%/s por 25min",
      "canonicalCooldown": "60 min",
      "canonicalCooldownMs": 3600000,
      "desc": "Aura da fênix.",
      "balance": {
          "mpCost": 40,
          "pwr": 5,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_phoenix_aura",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "phoenixKnight"
      ]
  },
  "shield_of_faith": {
      "id": "shield_of_faith",
      "name": "Shield of Faith",
      "slug": "shield_of_faith",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Absorve 5000 dano por 15s",
      "canonicalCooldown": "90s",
      "canonicalCooldownMs": 90000,
      "desc": "Escudo de fé.",
      "balance": {
          "mpCost": 40,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_shield_of_faith",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "phoenixKnight"
      ]
  },
  "flame_icon": {
      "id": "flame_icon",
      "name": "Flame Icon",
      "slug": "flame_icon",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+35% ATK para party por 30s",
      "canonicalCooldown": "120s",
      "canonicalCooldownMs": 120000,
      "desc": "Ícone de chamas.",
      "balance": {
          "mpCost": 40,
          "pwr": 4,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_flame_icon",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "phoenixKnight"
      ]
  },
  "celestial_shield": {
      "id": "celestial_shield",
      "name": "Celestial Shield",
      "slug": "celestial_shield",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill1418.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Party imune a dano por 5s",
      "canonicalCooldown": "300s",
      "canonicalCooldownMs": 300000,
      "desc": "Escudo celestial absoluto.",
      "balance": {
          "mpCost": 40,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_celestial_shield",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "phoenixKnight",
          "evaTemplar",
          "shillienTemplar"
      ]
  },
  "summon_imperial_phoenix": {
      "id": "summon_imperial_phoenix",
      "name": "Summon Imperial Phoenix",
      "slug": "summon_imperial_phoenix",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Invoca fênix (dano+cura contínua 30s)",
      "canonicalCooldown": "180s",
      "canonicalCooldownMs": 180000,
      "desc": "Fênix Imperial.",
      "balance": {
          "mpCost": 40,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_summon_imperial_phoenix",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "phoenixKnight"
      ]
  },
  "transcendent_shield_charge": {
      "id": "transcendent_shield_charge",
      "name": "Transcendent Shield Charge",
      "slug": "transcendent_shield_charge",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Rush + 500% dano + AoE taunt 10s",
      "canonicalCooldown": "160s",
      "canonicalCooldownMs": 160000,
      "desc": "Investida transcendente.",
      "balance": {
          "mpCost": 40,
          "pwr": 50,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_transcendent_shield_charge",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "phoenixKnight",
          "evaTemplar"
      ]
  },
  "phoenix_knights_harmony": {
      "id": "phoenix_knights_harmony",
      "name": "Phoenix Knight's Harmony",
      "slug": "phoenix_knights_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+60% DEF, +40% HP, +30% M.DEF 30min",
      "canonicalCooldown": "90 min",
      "canonicalCooldownMs": 5400000,
      "desc": "Harmonia suprema.",
      "balance": {
          "mpCost": 40,
          "pwr": 6,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_phoenix_knights_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "phoenixKnight"
      ]
  },
  "spirit_of_phoenix": {
      "id": "spirit_of_phoenix",
      "name": "Spirit of Phoenix",
      "slug": "spirit_of_phoenix",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Ao morrer: revive com 30% HP (1x/30min)",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Espírito da fênix — auto-ressurreição.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_spirit_of_phoenix",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "phoenixKnight"
      ]
  },
  "protection_of_faith": {
      "id": "protection_of_faith",
      "name": "Protection of Faith",
      "slug": "protection_of_faith",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+12% resist all",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Proteção da fé.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_protection_of_faith",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "phoenixKnight"
      ]
  },
  "body_of_the_phoenix": {
      "id": "body_of_the_phoenix",
      "name": "Body of the Phoenix",
      "slug": "body_of_the_phoenix",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% Max HP, +10% DEF",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Corpo da fênix.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_body_of_the_phoenix",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "phoenixKnight"
      ]
  },
  "summon_dark_panther": {
      "id": "summon_dark_panther",
      "name": "Summon Dark Panther",
      "slug": "summon_dark_panther",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0283.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Invoca pantera (ATK 60% do dono)",
      "canonicalCooldown": "90s",
      "canonicalCooldownMs": 90000,
      "desc": "Pantera das trevas.",
      "balance": {
          "mpCost": 40,
          "pwr": 6,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_summon_dark_panther",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "darkAvenger"
      ]
  },
  "drain_health": {
      "id": "drain_health",
      "name": "Drain Health",
      "slug": "drain_health",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0070.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano 220% + drena 30% como HP",
      "canonicalCooldown": "15s",
      "canonicalCooldownMs": 15000,
      "desc": "Drena vida do inimigo.",
      "balance": {
          "mpCost": 26,
          "pwr": 22,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_drain_health",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "darkAvenger",
          "shillienKnight"
      ]
  },
  "horror": {
      "id": "horror",
      "name": "Horror",
      "slug": "horror",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0065.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Medo no alvo por 5s",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "Terror sombrio.",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_horror",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "darkAvenger",
          "shillienKnight"
      ]
  },
  "judgment": {
      "id": "judgment",
      "name": "Judgment",
      "slug": "judgment",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0401.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano dark 300% + -20% DEF 10s",
      "canonicalCooldown": "22s",
      "canonicalCooldownMs": 22000,
      "desc": "Julgamento sombrio.",
      "balance": {
          "mpCost": 36,
          "pwr": 30,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_judgment",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "darkAvenger",
          "shillienKnight"
      ]
  },
  "touch_of_death": {
      "id": "touch_of_death",
      "name": "Touch of Death",
      "slug": "touch_of_death",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0342.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano 280% + poison 10s",
      "canonicalCooldown": "20s",
      "canonicalCooldownMs": 20000,
      "desc": "Toque mortal.",
      "balance": {
          "mpCost": 34,
          "pwr": 28,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_touch_of_death",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "darkAvenger",
          "shillienKnight"
      ]
  },
  "dark_flame": {
      "id": "dark_flame",
      "name": "Dark Flame",
      "slug": "dark_flame",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano AoE dark 240%",
      "canonicalCooldown": "18s",
      "canonicalCooldownMs": 18000,
      "desc": "Chamas sombrias.",
      "balance": {
          "mpCost": 29,
          "pwr": 24,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_dark_flame",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "darkAvenger",
          "necromancer",
          "shillienKnight"
      ]
  },
  "doom_shield": {
      "id": "doom_shield",
      "name": "Doom Shield",
      "slug": "doom_shield",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Absorve 3000 dano + reflete 15%",
      "canonicalCooldown": "60s",
      "canonicalCooldownMs": 60000,
      "desc": "Escudo da perdição.",
      "balance": {
          "mpCost": 5,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_doom_shield",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "darkAvenger"
      ]
  },
  "seed_of_revenge": {
      "id": "seed_of_revenge",
      "name": "Seed of Revenge",
      "slug": "seed_of_revenge",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Marca: ao morrer causa 500% dano",
      "canonicalCooldown": "120s",
      "canonicalCooldownMs": 120000,
      "desc": "Semente da vingança.",
      "balance": {
          "mpCost": 40,
          "pwr": 50,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_seed_of_revenge",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "darkAvenger"
      ]
  },
  "dark_avengers_harmony": {
      "id": "dark_avengers_harmony",
      "name": "Dark Avenger's Harmony",
      "slug": "dark_avengers_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+35% ATK, +30% DEF, +20% drain 25min",
      "canonicalCooldown": "60 min",
      "canonicalCooldownMs": 3600000,
      "desc": "Harmonia sombria.",
      "balance": {
          "mpCost": 40,
          "pwr": 4,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_dark_avengers_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "darkAvenger"
      ]
  },
  "reflect_damage": {
      "id": "reflect_damage",
      "name": "Reflect Damage",
      "slug": "reflect_damage",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0086.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Reflete 8% dano recebido",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Reflexo de dano.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_reflect_damage",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "darkAvenger"
      ]
  },
  "insane_crusher": {
      "id": "insane_crusher",
      "name": "Insane Crusher",
      "slug": "insane_crusher",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano 420% + stun 4s",
      "canonicalCooldown": "28s",
      "canonicalCooldownMs": 28000,
      "desc": "Esmagamento insano.",
      "balance": {
          "mpCost": 50,
          "pwr": 42,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_insane_crusher",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "hellKnight",
          "soulBreakerKamael"
      ]
  },
  "panther_cancel": {
      "id": "panther_cancel",
      "name": "Panther Cancel",
      "slug": "panther_cancel",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Pantera explode: AoE 350% + fear 3s",
      "canonicalCooldown": "60s",
      "canonicalCooldownMs": 60000,
      "desc": "Explosão da pantera.",
      "balance": {
          "mpCost": 42,
          "pwr": 35,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_panther_cancel",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "hellKnight"
      ]
  },
  "anthem_of_hell": {
      "id": "anthem_of_hell",
      "name": "Anthem of Hell",
      "slug": "anthem_of_hell",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+40% ATK, +20% drain HP por 30s",
      "canonicalCooldown": "90s",
      "canonicalCooldownMs": 90000,
      "desc": "Hino infernal.",
      "balance": {
          "mpCost": 40,
          "pwr": 4,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_anthem_of_hell",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "hellKnight"
      ]
  },
  "gehenna": {
      "id": "gehenna",
      "name": "Gehenna",
      "slug": "gehenna",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "AoE dark 500% + -30% heal recebida 10s",
      "canonicalCooldown": "120s",
      "canonicalCooldownMs": 120000,
      "desc": "Portão do inferno.",
      "balance": {
          "mpCost": 40,
          "pwr": 50,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_gehenna",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "hellKnight"
      ]
  },
  "touch_of_darkness": {
      "id": "touch_of_darkness",
      "name": "Touch of Darkness",
      "slug": "touch_of_darkness",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano 380% + silence 5s",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "Toque das trevas.",
      "balance": {
          "mpCost": 46,
          "pwr": 38,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_touch_of_darkness",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "hellKnight"
      ]
  },
  "summon_dark_panther_enhanced": {
      "id": "summon_dark_panther_enhanced",
      "name": "Summon Dark Panther Enhanced",
      "slug": "summon_dark_panther_enhanced",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Pantera aprimorada (ATK 80% do dono)",
      "canonicalCooldown": "120s",
      "canonicalCooldownMs": 120000,
      "desc": "Pantera das trevas aprimorada.",
      "balance": {
          "mpCost": 40,
          "pwr": 8,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_summon_dark_panther_enhanced",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "hellKnight"
      ]
  },
  "transcendent_dark_strike": {
      "id": "transcendent_dark_strike",
      "name": "Transcendent Dark Strike",
      "slug": "transcendent_dark_strike",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano 580% dark + drain 40% como HP",
      "canonicalCooldown": "150s",
      "canonicalCooldownMs": 150000,
      "desc": "Golpe sombrio transcendente.",
      "balance": {
          "mpCost": 40,
          "pwr": 58,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_transcendent_dark_strike",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "hellKnight"
      ]
  },
  "hell_knights_harmony": {
      "id": "hell_knights_harmony",
      "name": "Hell Knight's Harmony",
      "slug": "hell_knights_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+55% ATK, +40% DEF, +30% drain 30min",
      "canonicalCooldown": "90 min",
      "canonicalCooldownMs": 5400000,
      "desc": "Harmonia infernal.",
      "balance": {
          "mpCost": 40,
          "pwr": 6,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_hell_knights_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "hellKnight"
      ]
  },
  "hell_knight_spirit": {
      "id": "hell_knight_spirit",
      "name": "Hell Knight Spirit",
      "slug": "hell_knight_spirit",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% dark ATK",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Espírito do cavaleiro infernal.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_hell_knight_spirit",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "hellKnight"
      ]
  },
  "body_of_the_hell_knight": {
      "id": "body_of_the_hell_knight",
      "name": "Body of the Hell Knight",
      "slug": "body_of_the_hell_knight",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+12% Max HP, +10% DEF",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Corpo infernal.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_body_of_the_hell_knight",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "hellKnight"
      ]
  },
  "protection_of_darkness": {
      "id": "protection_of_darkness",
      "name": "Protection of Darkness",
      "slug": "protection_of_darkness",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% dark resist",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Proteção das trevas.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_protection_of_darkness",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "hellKnight"
      ]
  },
  "double_shot": {
      "id": "double_shot",
      "name": "Double Shot",
      "slug": "double_shot",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0019.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "2 disparos, dano total 200%",
      "canonicalCooldown": "10s",
      "canonicalCooldownMs": 10000,
      "desc": "Duplo disparo.",
      "balance": {
          "mpCost": 24,
          "pwr": 20,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_double_shot",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "rogue",
          "hawkeye",
          "elfScout",
          "silverRanger",
          "phantomRanger",
          "soulRanger"
      ]
  },
  "backstab": {
      "id": "backstab",
      "name": "Backstab",
      "slug": "backstab",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0030.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano 250% por trás + crit garantido",
      "canonicalCooldown": "14s",
      "canonicalCooldownMs": 14000,
      "desc": "Punhalada nas costas.",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_backstab",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "rogue",
          "elfScout",
          "assassinDE",
          "bountyHunter"
      ]
  },
  "dash": {
      "id": "dash",
      "name": "Dash",
      "slug": "dash",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0004.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+50% Speed por 8s",
      "canonicalCooldown": "20s",
      "canonicalCooldownMs": 20000,
      "desc": "Corrida rápida.",
      "balance": {
          "mpCost": 6,
          "pwr": 5,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_dash",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "rogue",
          "elfScout",
          "assassinDE"
      ]
  },
  "unlock": {
      "id": "unlock",
      "name": "Unlock",
      "slug": "unlock",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0027.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Abre baús/portas",
      "canonicalCooldown": "5s",
      "canonicalCooldownMs": 5000,
      "desc": "Destravar.",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_unlock",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "rogue"
      ]
  },
  "rogues_harmony": {
      "id": "rogues_harmony",
      "name": "Rogue's Harmony",
      "slug": "rogues_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+20% EVA, +15% Crit por 20 min",
      "canonicalCooldown": "45 min",
      "canonicalCooldownMs": 2700000,
      "desc": "Harmonia do ladino.",
      "balance": {
          "mpCost": 40,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_rogues_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "rogue"
      ]
  },
  "dagger_mastery": {
      "id": "dagger_mastery",
      "name": "Dagger Mastery",
      "slug": "dagger_mastery",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0209.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+12% ATK com dagger",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Maestria em adagas.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_dagger_mastery",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "rogue",
          "assassinS0",
          "elfScout",
          "assassinDE",
          "scavenger"
      ]
  },
  "bow_mastery": {
      "id": "bow_mastery",
      "name": "Bow Mastery",
      "slug": "bow_mastery",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0208.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+12% ATK com arco",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Maestria em arcos.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_bow_mastery",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "rogue",
          "hawkeye",
          "elfScout",
          "silverRanger",
          "phantomRanger"
      ]
  },
  "critical_chance": {
      "id": "critical_chance",
      "name": "Critical Chance",
      "slug": "critical_chance",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill4086.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+8% Crit Rate",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Senso para pontos vitais.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_critical_chance",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "rogue",
          "elfScout",
          "assassinDE"
      ]
  },
  "deadly_blow": {
      "id": "deadly_blow",
      "name": "Deadly Blow",
      "slug": "deadly_blow",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0263.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano 280% + crit garantido",
      "canonicalCooldown": "14s",
      "canonicalCooldownMs": 14000,
      "desc": "Golpe mortal.",
      "balance": {
          "mpCost": 34,
          "pwr": 28,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_deadly_blow",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "treasureHunter",
          "plainsWalker",
          "abyssWalker"
      ]
  },
  "lethal_blow": {
      "id": "lethal_blow",
      "name": "Lethal Blow",
      "slug": "lethal_blow",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0344.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano 350% + chance kill 5%",
      "canonicalCooldown": "22s",
      "canonicalCooldownMs": 22000,
      "desc": "Golpe letal.",
      "balance": {
          "mpCost": 42,
          "pwr": 35,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_lethal_blow",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "treasureHunter",
          "plainsWalker",
          "abyssWalker"
      ]
  },
  "sand_bomb": {
      "id": "sand_bomb",
      "name": "Sand Bomb",
      "slug": "sand_bomb",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0412.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "AoE blind 5s + dano 150%",
      "canonicalCooldown": "20s",
      "canonicalCooldownMs": 20000,
      "desc": "Bomba de areia.",
      "balance": {
          "mpCost": 18,
          "pwr": 15,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_sand_bomb",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "treasureHunter",
          "plainsWalker",
          "abyssWalker",
          "bountyHunter"
      ]
  },
  "blinding_blow": {
      "id": "blinding_blow",
      "name": "Blinding Blow",
      "slug": "blinding_blow",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0321.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano 240% + blind 4s",
      "canonicalCooldown": "18s",
      "canonicalCooldownMs": 18000,
      "desc": "Golpe cegante.",
      "balance": {
          "mpCost": 29,
          "pwr": 24,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_blinding_blow",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "treasureHunter",
          "plainsWalker",
          "abyssWalker",
          "bountyHunter"
      ]
  },
  "shadow_step": {
      "id": "shadow_step",
      "name": "Shadow Step",
      "slug": "shadow_step",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Teleporta atrás do alvo",
      "canonicalCooldown": "15s",
      "canonicalCooldownMs": 15000,
      "desc": "Passo sombrio.",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_shadow_step",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "treasureHunter",
          "assassinS2",
          "plainsWalker",
          "abyssWalker"
      ]
  },
  "switch": {
      "id": "switch",
      "name": "Switch",
      "slug": "switch",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0012.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Troca posição com alvo",
      "canonicalCooldown": "25s",
      "canonicalCooldownMs": 25000,
      "desc": "Troca de posição.",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_switch",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "treasureHunter",
          "plainsWalker",
          "abyssWalker",
          "bountyHunter"
      ]
  },
  "fake_death": {
      "id": "fake_death",
      "name": "Fake Death",
      "slug": "fake_death",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0060.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Finge morte, perde aggro",
      "canonicalCooldown": "60s",
      "canonicalCooldownMs": 60000,
      "desc": "Morte falsa.",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_fake_death",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "treasureHunter",
          "plainsWalker",
          "bountyHunter"
      ]
  },
  "trick": {
      "id": "trick",
      "name": "Trick",
      "slug": "trick",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0011.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Remove alvo do inimigo",
      "canonicalCooldown": "20s",
      "canonicalCooldownMs": 20000,
      "desc": "Truque evasivo.",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_trick",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "treasureHunter",
          "plainsWalker",
          "abyssWalker"
      ]
  },
  "mirage": {
      "id": "mirage",
      "name": "Mirage",
      "slug": "mirage",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0445.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+80% EVA por 8s",
      "canonicalCooldown": "45s",
      "canonicalCooldownMs": 45000,
      "desc": "Ilusão de espelhos.",
      "balance": {
          "mpCost": 10,
          "pwr": 8,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_mirage",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "treasureHunter"
      ]
  },
  "detect_remove_trap": {
      "id": "detect_remove_trap",
      "name": "Detect/Remove Trap",
      "slug": "detect_remove_trap",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Detecta e remove armadilhas",
      "canonicalCooldown": "10s",
      "canonicalCooldownMs": 10000,
      "desc": "Detectar armadilhas.",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_detect_remove_trap",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "treasureHunter"
      ]
  },
  "ths_harmony": {
      "id": "ths_harmony",
      "name": "TH's Harmony",
      "slug": "ths_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+35% Crit, +25% EVA, +20% ATK 25min",
      "canonicalCooldown": "60 min",
      "canonicalCooldownMs": 3600000,
      "desc": "Harmonia do caçador.",
      "balance": {
          "mpCost": 40,
          "pwr": 4,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_ths_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "treasureHunter"
      ]
  },
  "evasion": {
      "id": "evasion",
      "name": "Evasion",
      "slug": "evasion",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill4093.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+12% EVA",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Evasão aprimorada.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_evasion",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "treasureHunter",
          "hawkeye",
          "plainsWalker",
          "silverRanger",
          "abyssWalker",
          "phantomRanger",
          "scavenger"
      ]
  },
  "exciting_adventure": {
      "id": "exciting_adventure",
      "name": "Exciting Adventure",
      "slug": "exciting_adventure",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+45% EVA, +30% Crit, +20% ATK 20min",
      "canonicalCooldown": "55 min",
      "canonicalCooldownMs": 3300000,
      "desc": "Aventura emocionante.",
      "balance": {
          "mpCost": 40,
          "pwr": 5,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_exciting_adventure",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "adventurer",
          "windRider",
          "ghostHunter"
      ]
  },
  "wind_riding": {
      "id": "wind_riding",
      "name": "Wind Riding",
      "slug": "wind_riding",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+80% Speed + invisível por 10s",
      "canonicalCooldown": "60s",
      "canonicalCooldownMs": 60000,
      "desc": "Cavalgando o vento.",
      "balance": {
          "mpCost": 10,
          "pwr": 8,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_wind_riding",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "adventurer",
          "windRider",
          "ghostHunter"
      ]
  },
  "lucky_strike": {
      "id": "lucky_strike",
      "name": "Lucky Strike",
      "slug": "lucky_strike",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano 420% + chance loot 2x",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "Golpe de sorte.",
      "balance": {
          "mpCost": 50,
          "pwr": 42,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_lucky_strike",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "adventurer",
          "windRider",
          "ghostHunter"
      ]
  },
  "detection": {
      "id": "detection",
      "name": "Detection",
      "slug": "detection",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Revela invisíveis em área",
      "canonicalCooldown": "20s",
      "canonicalCooldownMs": 20000,
      "desc": "Detecção de ocultos.",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_detection",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "adventurer"
      ]
  },
  "transcendent_deadly_blow": {
      "id": "transcendent_deadly_blow",
      "name": "Transcendent Deadly Blow",
      "slug": "transcendent_deadly_blow",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano 650% + ignora EVA + bleed 12s",
      "canonicalCooldown": "150s",
      "canonicalCooldownMs": 150000,
      "desc": "Golpe mortal transcendente.",
      "balance": {
          "mpCost": 40,
          "pwr": 65,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_transcendent_deadly_blow",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "adventurer",
          "windRider",
          "ghostHunter"
      ]
  },
  "adventurers_harmony": {
      "id": "adventurers_harmony",
      "name": "Adventurer's Harmony",
      "slug": "adventurers_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+55% Crit, +45% EVA, +35% ATK 30min",
      "canonicalCooldown": "90 min",
      "canonicalCooldownMs": 5400000,
      "desc": "Harmonia suprema.",
      "balance": {
          "mpCost": 40,
          "pwr": 6,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_adventurers_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "adventurer"
      ]
  },
  "shadow_sense": {
      "id": "shadow_sense",
      "name": "Shadow Sense",
      "slug": "shadow_sense",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0294.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+15% EVA à noite / dungeon",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Sentido das sombras.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_shadow_sense",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "adventurer",
          "windRider",
          "ghostHunter"
      ]
  },
  "adventurer_spirit": {
      "id": "adventurer_spirit",
      "name": "Adventurer Spirit",
      "slug": "adventurer_spirit",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+12% dagger ATK",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Espírito aventureiro.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_adventurer_spirit",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "adventurer"
      ]
  },
  "body_of_the_adventurer": {
      "id": "body_of_the_adventurer",
      "name": "Body of the Adventurer",
      "slug": "body_of_the_adventurer",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+10% Max HP, +8% EVA",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Corpo ágil.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_body_of_the_adventurer",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "adventurer"
      ]
  },
  "final_frenzy": {
      "id": "final_frenzy",
      "name": "Final Frenzy",
      "slug": "final_frenzy",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0290.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+25% ATK quando HP < 30%",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Frenesi final.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_final_frenzy",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "adventurer",
          "windRider",
          "ghostHunter",
          "grandKhavatari"
      ]
  },
  "burst_shot": {
      "id": "burst_shot",
      "name": "Burst Shot",
      "slug": "burst_shot",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0024.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano 280% + knockback",
      "canonicalCooldown": "14s",
      "canonicalCooldownMs": 14000,
      "desc": "Disparo explosivo.",
      "balance": {
          "mpCost": 34,
          "pwr": 28,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_burst_shot",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "hawkeye",
          "silverRanger",
          "phantomRanger",
          "soulRanger"
      ]
  },
  "stun_shot": {
      "id": "stun_shot",
      "name": "Stun Shot",
      "slug": "stun_shot",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano 220% + stun 3s",
      "canonicalCooldown": "18s",
      "canonicalCooldownMs": 18000,
      "desc": "Disparo atordoante.",
      "balance": {
          "mpCost": 26,
          "pwr": 22,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_stun_shot",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "hawkeye",
          "silverRanger",
          "phantomRanger",
          "soulRanger"
      ]
  },
  "arrow_rain": {
      "id": "arrow_rain",
      "name": "Arrow Rain",
      "slug": "arrow_rain",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano AoE 320% (8 alvos)",
      "canonicalCooldown": "22s",
      "canonicalCooldownMs": 22000,
      "desc": "Chuva de flechas.",
      "balance": {
          "mpCost": 38,
          "pwr": 32,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_arrow_rain",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "hawkeye",
          "silverRanger",
          "phantomRanger",
          "soulRanger"
      ]
  },
  "rapid_fire": {
      "id": "rapid_fire",
      "name": "Rapid Fire",
      "slug": "rapid_fire",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0413.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+50% ATK Speed arco por 15s",
      "canonicalCooldown": "45s",
      "canonicalCooldownMs": 45000,
      "desc": "Disparo rápido.",
      "balance": {
          "mpCost": 6,
          "pwr": 5,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_rapid_fire",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "hawkeye",
          "silverRanger",
          "phantomRanger",
          "soulRanger",
          "windSniper"
      ]
  },
  "cheap_shot": {
      "id": "cheap_shot",
      "name": "Cheap Shot",
      "slug": "cheap_shot",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano 200% + slow 30% por 8s",
      "canonicalCooldown": "16s",
      "canonicalCooldownMs": 16000,
      "desc": "Disparo sujo.",
      "balance": {
          "mpCost": 24,
          "pwr": 20,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_cheap_shot",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "hawkeye"
      ]
  },
  "hawkeyes_harmony": {
      "id": "hawkeyes_harmony",
      "name": "Hawkeye's Harmony",
      "slug": "hawkeyes_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+35% ATK, +25% Crit, +15% Range 25min",
      "canonicalCooldown": "60 min",
      "canonicalCooldownMs": 3600000,
      "desc": "Harmonia do olho de falcão.",
      "balance": {
          "mpCost": 40,
          "pwr": 4,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_hawkeyes_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "hawkeye"
      ]
  },
  "long_shot": {
      "id": "long_shot",
      "name": "Long Shot",
      "slug": "long_shot",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0113.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+30% Range",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Tiro de longo alcance.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_long_shot",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "hawkeye",
          "silverRanger",
          "phantomRanger",
          "soulRanger"
      ]
  },
  "seven_arrow": {
      "id": "seven_arrow",
      "name": "Seven Arrow",
      "slug": "seven_arrow",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "7 flechas, dano total 480%",
      "canonicalCooldown": "25s",
      "canonicalCooldownMs": 25000,
      "desc": "Sete flechas consecutivas.",
      "balance": {
          "mpCost": 58,
          "pwr": 48,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_seven_arrow",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "sagittarius",
          "moonlightSentinel",
          "ghostSentinel"
      ]
  },
  "arrow_flare": {
      "id": "arrow_flare",
      "name": "Arrow Flare",
      "slug": "arrow_flare",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano AoE 380% + burn 8s",
      "canonicalCooldown": "22s",
      "canonicalCooldownMs": 22000,
      "desc": "Explosão de flechas.",
      "balance": {
          "mpCost": 46,
          "pwr": 38,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_arrow_flare",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "sagittarius"
      ]
  },
  "dead_eye": {
      "id": "dead_eye",
      "name": "Dead Eye",
      "slug": "dead_eye",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0414.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+50% ATK, +40% Range por 20min",
      "canonicalCooldown": "55 min",
      "canonicalCooldownMs": 3300000,
      "desc": "Olho mortal — mira perfeita.",
      "balance": {
          "mpCost": 40,
          "pwr": 5,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_dead_eye",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "sagittarius",
          "moonlightSentinel",
          "ghostSentinel",
          "trickster"
      ]
  },
  "pinpoint_shot": {
      "id": "pinpoint_shot",
      "name": "Pinpoint Shot",
      "slug": "pinpoint_shot",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano 400% + ignora 50% DEF",
      "canonicalCooldown": "28s",
      "canonicalCooldownMs": 28000,
      "desc": "Tiro preciso.",
      "balance": {
          "mpCost": 48,
          "pwr": 40,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_pinpoint_shot",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "sagittarius",
          "moonlightSentinel",
          "ghostSentinel",
          "trickster"
      ]
  },
  "triple_shot": {
      "id": "triple_shot",
      "name": "Triple Shot",
      "slug": "triple_shot",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "3 disparos, dano total 360%",
      "canonicalCooldown": "14s",
      "canonicalCooldownMs": 14000,
      "desc": "Tiro triplo.",
      "balance": {
          "mpCost": 43,
          "pwr": 36,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_triple_shot",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "sagittarius",
          "moonlightSentinel",
          "ghostSentinel"
      ]
  },
  "thorn_shot": {
      "id": "thorn_shot",
      "name": "Thorn Shot",
      "slug": "thorn_shot",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano 260% + bleed 10s",
      "canonicalCooldown": "12s",
      "canonicalCooldownMs": 12000,
      "desc": "Flecha de espinhos.",
      "balance": {
          "mpCost": 31,
          "pwr": 26,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_thorn_shot",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "sagittarius",
          "moonlightSentinel",
          "ghostSentinel"
      ]
  },
  "binding_shot": {
      "id": "binding_shot",
      "name": "Binding Shot",
      "slug": "binding_shot",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano 220% + root 4s",
      "canonicalCooldown": "18s",
      "canonicalCooldownMs": 18000,
      "desc": "Flecha aprisionadora.",
      "balance": {
          "mpCost": 26,
          "pwr": 22,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_binding_shot",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "sagittarius",
          "moonlightSentinel",
          "ghostSentinel"
      ]
  },
  "incendiary_shot": {
      "id": "incendiary_shot",
      "name": "Incendiary Shot",
      "slug": "incendiary_shot",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano fogo 280% + burn 8s",
      "canonicalCooldown": "16s",
      "canonicalCooldownMs": 16000,
      "desc": "Flecha incendiária.",
      "balance": {
          "mpCost": 34,
          "pwr": 28,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_incendiary_shot",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "sagittarius"
      ]
  },
  "freezing_shot": {
      "id": "freezing_shot",
      "name": "Freezing Shot",
      "slug": "freezing_shot",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano gelo 260% + slow 40% 6s",
      "canonicalCooldown": "16s",
      "canonicalCooldownMs": 16000,
      "desc": "Flecha congelante.",
      "balance": {
          "mpCost": 31,
          "pwr": 26,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_freezing_shot",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "sagittarius",
          "moonlightSentinel"
      ]
  },
  "wind_shot": {
      "id": "wind_shot",
      "name": "Wind Shot",
      "slug": "wind_shot",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano vento 270% + knockback",
      "canonicalCooldown": "16s",
      "canonicalCooldownMs": 16000,
      "desc": "Flecha do vento.",
      "balance": {
          "mpCost": 32,
          "pwr": 27,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_wind_shot",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "sagittarius",
          "ghostSentinel"
      ]
  },
  "flame_arrow_rain": {
      "id": "flame_arrow_rain",
      "name": "Flame Arrow Rain",
      "slug": "flame_arrow_rain",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "AoE fogo 380% (10 alvos) + burn",
      "canonicalCooldown": "28s",
      "canonicalCooldownMs": 28000,
      "desc": "Chuva de flechas flamejantes.",
      "balance": {
          "mpCost": 46,
          "pwr": 38,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_flame_arrow_rain",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "sagittarius"
      ]
  },
  "water_arrow_rain": {
      "id": "water_arrow_rain",
      "name": "Water Arrow Rain",
      "slug": "water_arrow_rain",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "AoE gelo 360% (10 alvos) + slow",
      "canonicalCooldown": "28s",
      "canonicalCooldownMs": 28000,
      "desc": "Chuva de flechas gélidas.",
      "balance": {
          "mpCost": 43,
          "pwr": 36,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_water_arrow_rain",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "sagittarius"
      ]
  },
  "storm_arrow_rain": {
      "id": "storm_arrow_rain",
      "name": "Storm Arrow Rain",
      "slug": "storm_arrow_rain",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "AoE vento 370% (10 alvos) + stun 2s",
      "canonicalCooldown": "28s",
      "canonicalCooldownMs": 28000,
      "desc": "Chuva de flechas tempestuosas.",
      "balance": {
          "mpCost": 44,
          "pwr": 37,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_storm_arrow_rain",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "sagittarius"
      ]
  },
  "spiral_shot": {
      "id": "spiral_shot",
      "name": "Spiral Shot",
      "slug": "spiral_shot",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano 420% + penetra múltiplos alvos",
      "canonicalCooldown": "24s",
      "canonicalCooldownMs": 24000,
      "desc": "Tiro espiral perfurante.",
      "balance": {
          "mpCost": 50,
          "pwr": 42,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_spiral_shot",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "sagittarius",
          "moonlightSentinel",
          "ghostSentinel"
      ]
  },
  "target_lock": {
      "id": "target_lock",
      "name": "Target Lock",
      "slug": "target_lock",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Marca alvo: +40% dano contra ele 12s",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "Trava de mira.",
      "balance": {
          "mpCost": 5,
          "pwr": 4,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_target_lock",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "sagittarius",
          "moonlightSentinel",
          "ghostSentinel"
      ]
  },
  "transcendent_seven_arrow": {
      "id": "transcendent_seven_arrow",
      "name": "Transcendent Seven Arrow",
      "slug": "transcendent_seven_arrow",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano 700% + elemental + ignora DEF",
      "canonicalCooldown": "180s",
      "canonicalCooldownMs": 180000,
      "desc": "Sete flechas transcendentes.",
      "balance": {
          "mpCost": 40,
          "pwr": 70,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_transcendent_seven_arrow",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "sagittarius",
          "moonlightSentinel",
          "ghostSentinel",
          "trickster"
      ]
  },
  "sagittarius_harmony": {
      "id": "sagittarius_harmony",
      "name": "Sagittarius' Harmony",
      "slug": "sagittarius_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+60% ATK, +50% Crit, +40% Range 30min",
      "canonicalCooldown": "90 min",
      "canonicalCooldownMs": 5400000,
      "desc": "Harmonia do sagitário.",
      "balance": {
          "mpCost": 40,
          "pwr": 6,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_sagittarius_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "sagittarius"
      ]
  },
  "sagittarius_spirit": {
      "id": "sagittarius_spirit",
      "name": "Sagittarius Spirit",
      "slug": "sagittarius_spirit",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% Bow ATK",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Espírito do sagitário.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_sagittarius_spirit",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "sagittarius"
      ]
  },
  "body_of_the_sagittarius": {
      "id": "body_of_the_sagittarius",
      "name": "Body of the Sagittarius",
      "slug": "body_of_the_sagittarius",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+10% Max HP, +8% EVA",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Corpo do sagitário.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_body_of_the_sagittarius",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "sagittarius"
      ]
  },
  "wind_strike": {
      "id": "wind_strike",
      "name": "Wind Strike",
      "slug": "wind_strike",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill1177.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano vento 160%",
      "canonicalCooldown": "8s",
      "canonicalCooldownMs": 8000,
      "desc": "Rajada de vento.",
      "balance": {
          "mpCost": 19,
          "pwr": 16,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_wind_strike",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "mage",
          "elfMage",
          "darkElfMage",
          "orcMage"
      ]
  },
  "flame_strike": {
      "id": "flame_strike",
      "name": "Flame Strike",
      "slug": "flame_strike",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill1181.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano fogo 170%",
      "canonicalCooldown": "9s",
      "canonicalCooldownMs": 9000,
      "desc": "Chama ardente.",
      "balance": {
          "mpCost": 20,
          "pwr": 17,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_flame_strike",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "mage",
          "darkWizard",
          "shaman"
      ]
  },
  "ice_bolt": {
      "id": "ice_bolt",
      "name": "Ice Bolt",
      "slug": "ice_bolt",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill1184.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano gelo 155% + slow 15% 4s",
      "canonicalCooldown": "8s",
      "canonicalCooldownMs": 8000,
      "desc": "Projétil de gelo.",
      "balance": {
          "mpCost": 19,
          "pwr": 16,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_ice_bolt",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "mage",
          "elfMage",
          "darkElfMage"
      ]
  },
  "self_heal": {
      "id": "self_heal",
      "name": "Self Heal",
      "slug": "self_heal",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill1216.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Cura 20% HP",
      "canonicalCooldown": "25s",
      "canonicalCooldownMs": 25000,
      "desc": "Autocura básica.",
      "balance": {
          "mpCost": 5,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_self_heal",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "mage",
          "elfMage",
          "darkElfMage",
          "orcMage"
      ]
  },
  "sleep": {
      "id": "sleep",
      "name": "Sleep",
      "slug": "sleep",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill1069.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Adormece alvo 8s (cancela dano)",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "Sono mágico.",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_sleep",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "mage",
          "elfMage",
          "darkElfMage"
      ]
  },
  "mages_will": {
      "id": "mages_will",
      "name": "Mage's Will",
      "slug": "mages_will",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+10% M.ATK, +10% M.DEF 15min",
      "canonicalCooldown": "30 min",
      "canonicalCooldownMs": 1800000,
      "desc": "Vontade do mago.",
      "balance": {
          "mpCost": 40,
          "pwr": 1,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_mages_will",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "mage"
      ]
  },
  "robe_mastery": {
      "id": "robe_mastery",
      "name": "Robe Mastery",
      "slug": "robe_mastery",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0234.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+10% M.DEF, +8% Cast Speed com robe",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Maestria em vestes.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_robe_mastery",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "mage",
          "elfMage",
          "darkElfMage",
          "orcMage",
          "elementWeaverS1"
      ]
  },
  "mp_increase": {
      "id": "mp_increase",
      "name": "MP Increase",
      "slug": "mp_increase",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0213.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+8% Max MP",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Reserva mágica.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_mp_increase",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "mage",
          "elfMage",
          "darkElfMage",
          "orcMage",
          "highElfBase"
      ]
  },
  "blaze": {
      "id": "blaze",
      "name": "Blaze",
      "slug": "blaze",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill1220.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano fogo 210%",
      "canonicalCooldown": "10s",
      "canonicalCooldownMs": 10000,
      "desc": "Chamas ardentes.",
      "balance": {
          "mpCost": 25,
          "pwr": 21,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_blaze",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "wizard",
          "elvenWizard"
      ]
  },
  "aqua_swirl": {
      "id": "aqua_swirl",
      "name": "Aqua Swirl",
      "slug": "aqua_swirl",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill1175.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano água 200% + slow 20% 5s",
      "canonicalCooldown": "10s",
      "canonicalCooldownMs": 10000,
      "desc": "Turbilhão aquático.",
      "balance": {
          "mpCost": 24,
          "pwr": 20,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_aqua_swirl",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "wizard",
          "elvenWizard"
      ]
  },
  "twister": {
      "id": "twister",
      "name": "Twister",
      "slug": "twister",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill1178.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano vento 195%",
      "canonicalCooldown": "10s",
      "canonicalCooldownMs": 10000,
      "desc": "Tornado menor.",
      "balance": {
          "mpCost": 24,
          "pwr": 20,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_twister",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "wizard",
          "darkWizard"
      ]
  },
  "aura_burn": {
      "id": "aura_burn",
      "name": "Aura Burn",
      "slug": "aura_burn",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1172.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "AoE fogo 180% ao redor",
      "canonicalCooldown": "14s",
      "canonicalCooldownMs": 14000,
      "desc": "Queimadura áurica.",
      "balance": {
          "mpCost": 22,
          "pwr": 18,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_aura_burn",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "wizard",
          "elvenWizard"
      ]
  },
  "life_drain": {
      "id": "life_drain",
      "name": "Life Drain",
      "slug": "life_drain",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1090.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano dark 190% + drena 25% como HP",
      "canonicalCooldown": "15s",
      "canonicalCooldownMs": 15000,
      "desc": "Dreno vital.",
      "balance": {
          "mpCost": 23,
          "pwr": 19,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_life_drain",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "wizard",
          "elvenWizard",
          "darkWizard"
      ]
  },
  "surrender_to_fire": {
      "id": "surrender_to_fire",
      "name": "Surrender to Fire",
      "slug": "surrender_to_fire",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill4279_new.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "-20% Fire Resist no alvo 15s",
      "canonicalCooldown": "25s",
      "canonicalCooldownMs": 25000,
      "desc": "Vulnerabilidade ao fogo.",
      "balance": {
          "mpCost": 5,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_surrender_to_fire",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "wizard"
      ]
  },
  "surrender_to_water": {
      "id": "surrender_to_water",
      "name": "Surrender to Water",
      "slug": "surrender_to_water",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill4280_new.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "-20% Water Resist no alvo 15s",
      "canonicalCooldown": "25s",
      "canonicalCooldownMs": 25000,
      "desc": "Vulnerabilidade à água.",
      "balance": {
          "mpCost": 5,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_surrender_to_water",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "wizard"
      ]
  },
  "surrender_to_wind": {
      "id": "surrender_to_wind",
      "name": "Surrender to Wind",
      "slug": "surrender_to_wind",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill4281_new.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "-20% Wind Resist no alvo 15s",
      "canonicalCooldown": "25s",
      "canonicalCooldownMs": 25000,
      "desc": "Vulnerabilidade ao vento.",
      "balance": {
          "mpCost": 5,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_surrender_to_wind",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "wizard"
      ]
  },
  "wizards_harmony": {
      "id": "wizards_harmony",
      "name": "Wizard's Harmony",
      "slug": "wizards_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+25% M.ATK, +15% Cast Speed 20min",
      "canonicalCooldown": "45 min",
      "canonicalCooldownMs": 2700000,
      "desc": "Harmonia do mago.",
      "balance": {
          "mpCost": 40,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_wizards_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "wizard",
          "elvenWizard"
      ]
  },
  "boost_mana": {
      "id": "boost_mana",
      "name": "Boost Mana",
      "slug": "boost_mana",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0213.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+12% Max MP",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Reserva mágica aprimorada.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_boost_mana",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "wizard",
          "elvenWizard",
          "darkWizard",
          "shaman",
          "soulFinder"
      ]
  },
  "prominence": {
      "id": "prominence",
      "name": "Prominence",
      "slug": "prominence",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1230.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano fogo 300%",
      "canonicalCooldown": "16s",
      "canonicalCooldownMs": 16000,
      "desc": "Coluna de fogo.",
      "balance": {
          "mpCost": 36,
          "pwr": 30,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_prominence",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "sorcerer"
      ]
  },
  "blizzard": {
      "id": "blizzard",
      "name": "Blizzard",
      "slug": "blizzard",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill1290.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano gelo AoE 340% + slow 30% 6s",
      "canonicalCooldown": "22s",
      "canonicalCooldownMs": 22000,
      "desc": "Nevasca arrasadora.",
      "balance": {
          "mpCost": 41,
          "pwr": 34,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_blizzard",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "sorcerer",
          "spellsinger"
      ]
  },
  "hurricane": {
      "id": "hurricane",
      "name": "Hurricane",
      "slug": "hurricane",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1239.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano vento 290%",
      "canonicalCooldown": "16s",
      "canonicalCooldownMs": 16000,
      "desc": "Furacão devastador.",
      "balance": {
          "mpCost": 35,
          "pwr": 29,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_hurricane",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "sorcerer",
          "spellhowler"
      ]
  },
  "hydro_blast": {
      "id": "hydro_blast",
      "name": "Hydro Blast",
      "slug": "hydro_blast",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1235.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano água 280% + knockback",
      "canonicalCooldown": "15s",
      "canonicalCooldownMs": 15000,
      "desc": "Explosão hídrica.",
      "balance": {
          "mpCost": 34,
          "pwr": 28,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_hydro_blast",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "sorcerer",
          "spellsinger"
      ]
  },
  "solar_flare": {
      "id": "solar_flare",
      "name": "Solar Flare",
      "slug": "solar_flare",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill1265.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano fogo 360% + blind 4s",
      "canonicalCooldown": "25s",
      "canonicalCooldownMs": 25000,
      "desc": "Explosão solar.",
      "balance": {
          "mpCost": 43,
          "pwr": 36,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_solar_flare",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "sorcerer",
          "spellsinger"
      ]
  },
  "tempest": {
      "id": "tempest",
      "name": "Tempest",
      "slug": "tempest",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill1176.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano vento AoE 350% (8 alvos)",
      "canonicalCooldown": "25s",
      "canonicalCooldownMs": 25000,
      "desc": "Tempestade elemental.",
      "balance": {
          "mpCost": 42,
          "pwr": 35,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_tempest",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "sorcerer",
          "spellhowler"
      ]
  },
  "aura_flash": {
      "id": "aura_flash",
      "name": "Aura Flash",
      "slug": "aura_flash",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1417.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "AoE 240% + knockback ao redor",
      "canonicalCooldown": "18s",
      "canonicalCooldownMs": 18000,
      "desc": "Flash áurico.",
      "balance": {
          "mpCost": 29,
          "pwr": 24,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_aura_flash",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "sorcerer"
      ]
  },
  "arcane_power": {
      "id": "arcane_power",
      "name": "Arcane Power",
      "slug": "arcane_power",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0337.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+40% M.ATK por 30s",
      "canonicalCooldown": "90s",
      "canonicalCooldownMs": 90000,
      "desc": "Poder arcano concentrado.",
      "balance": {
          "mpCost": 40,
          "pwr": 4,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_arcane_power",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "sorcerer",
          "spellsinger",
          "spellhowler"
      ]
  },
  "freezing_skin": {
      "id": "freezing_skin",
      "name": "Freezing Skin",
      "slug": "freezing_skin",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1238.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Quem ataca recebe slow 20% por 15s",
      "canonicalCooldown": "45s",
      "canonicalCooldownMs": 45000,
      "desc": "Pele congelante.",
      "balance": {
          "mpCost": 5,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_freezing_skin",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "sorcerer",
          "spellsinger"
      ]
  },
  "cancel": {
      "id": "cancel",
      "name": "Cancel",
      "slug": "cancel",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Remove 3 buffs do alvo",
      "canonicalCooldown": "40s",
      "canonicalCooldownMs": 40000,
      "desc": "Cancelamento mágico.",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_cancel",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "sorcerer",
          "spellsinger",
          "spellhowler"
      ]
  },
  "body_to_mind": {
      "id": "body_to_mind",
      "name": "Body to Mind",
      "slug": "body_to_mind",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1157.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Converte 15% HP em 30% MP",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "Corpo em mente.",
      "balance": {
          "mpCost": 5,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_body_to_mind",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "sorcerer",
          "spellsinger",
          "spellhowler"
      ]
  },
  "anti_magic": {
      "id": "anti_magic",
      "name": "Anti-Magic",
      "slug": "anti_magic",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Silence no alvo por 8s",
      "canonicalCooldown": "45s",
      "canonicalCooldownMs": 45000,
      "desc": "Anti-magia.",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_anti_magic",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "sorcerer"
      ]
  },
  "sorcerers_harmony": {
      "id": "sorcerers_harmony",
      "name": "Sorcerer's Harmony",
      "slug": "sorcerers_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+35% M.ATK, +20% Cast Speed 25min",
      "canonicalCooldown": "60 min",
      "canonicalCooldownMs": 3600000,
      "desc": "Harmonia do feiticeiro.",
      "balance": {
          "mpCost": 40,
          "pwr": 4,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_sorcerers_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "sorcerer"
      ]
  },
  "elemental_assault": {
      "id": "elemental_assault",
      "name": "Elemental Assault",
      "slug": "elemental_assault",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1292.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+12% elemental damage",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Assalto elemental.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_elemental_assault",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "sorcerer",
          "spellsinger",
          "spellhowler"
      ]
  },
  "meteor": {
      "id": "meteor",
      "name": "Meteor",
      "slug": "meteor",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano fogo AoE 750% + burn 12s + knockdown",
      "canonicalCooldown": "180s",
      "canonicalCooldownMs": 180000,
      "desc": "METEORO — devastação absoluta.",
      "balance": {
          "mpCost": 40,
          "pwr": 75,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_meteor",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "archmage"
      ]
  },
  "hell_inferno": {
      "id": "hell_inferno",
      "name": "Hell Inferno",
      "slug": "hell_inferno",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano fogo 450% + burn 10s",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "Inferno ardente.",
      "balance": {
          "mpCost": 54,
          "pwr": 45,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_hell_inferno",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "archmage"
      ]
  },
  "flame_explosion": {
      "id": "flame_explosion",
      "name": "Flame Explosion",
      "slug": "flame_explosion",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano fogo 420% + 2 hits",
      "canonicalCooldown": "25s",
      "canonicalCooldownMs": 25000,
      "desc": "Explosão flamejante (2 hits).",
      "balance": {
          "mpCost": 50,
          "pwr": 42,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_flame_explosion",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "archmage"
      ]
  },
  "fire_spiral": {
      "id": "fire_spiral",
      "name": "Fire Spiral",
      "slug": "fire_spiral",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano fogo 380% + penetra alvos",
      "canonicalCooldown": "22s",
      "canonicalCooldownMs": 22000,
      "desc": "Espiral de fogo perfurante.",
      "balance": {
          "mpCost": 46,
          "pwr": 38,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_fire_spiral",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "archmage"
      ]
  },
  "blazing_circle": {
      "id": "blazing_circle",
      "name": "Blazing Circle",
      "slug": "blazing_circle",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill1171.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "AoE fogo 400% ao redor (10 alvos)",
      "canonicalCooldown": "28s",
      "canonicalCooldownMs": 28000,
      "desc": "Círculo flamejante.",
      "balance": {
          "mpCost": 48,
          "pwr": 40,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_blazing_circle",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "archmage"
      ]
  },
  "seed_of_fire": {
      "id": "seed_of_fire",
      "name": "Seed of Fire",
      "slug": "seed_of_fire",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1285.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Planta semente: explode 300% após 5s",
      "canonicalCooldown": "20s",
      "canonicalCooldownMs": 20000,
      "desc": "Semente de fogo.",
      "balance": {
          "mpCost": 36,
          "pwr": 30,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_seed_of_fire",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "archmage"
      ]
  },
  "elemental_burst": {
      "id": "elemental_burst",
      "name": "Elemental Burst",
      "slug": "elemental_burst",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Explode Seeds: dano 500%",
      "canonicalCooldown": "18s",
      "canonicalCooldownMs": 18000,
      "desc": "Explosão elemental (combo com Seeds).",
      "balance": {
          "mpCost": 60,
          "pwr": 50,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_elemental_burst",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "archmage",
          "mysticMuse",
          "stormScreamer"
      ]
  },
  "elemental_storm": {
      "id": "elemental_storm",
      "name": "Elemental Storm",
      "slug": "elemental_storm",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill1294.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "AoE multi-element 440% (8 alvos)",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "Tempestade elemental.",
      "balance": {
          "mpCost": 53,
          "pwr": 44,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_elemental_storm",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "archmage",
          "mysticMuse",
          "stormScreamer"
      ]
  },
  "mana_burn": {
      "id": "mana_burn",
      "name": "Mana Burn",
      "slug": "mana_burn",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1398.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Drena 30% MP do alvo + dano = MP drenado",
      "canonicalCooldown": "25s",
      "canonicalCooldownMs": 25000,
      "desc": "Queima de mana.",
      "balance": {
          "mpCost": 5,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_mana_burn",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "archmage"
      ]
  },
  "mystic_immunity": {
      "id": "mystic_immunity",
      "name": "Mystic Immunity",
      "slug": "mystic_immunity",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill1411.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Imune a magia por 8s, não pode atacar",
      "canonicalCooldown": "180s",
      "canonicalCooldownMs": 180000,
      "desc": "Imunidade mística.",
      "balance": {
          "mpCost": 40,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_mystic_immunity",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "archmage",
          "hierophant",
          "mysticMuse",
          "stormScreamer"
      ]
  },
  "empowering_echo": {
      "id": "empowering_echo",
      "name": "Empowering Echo",
      "slug": "empowering_echo",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Próxima skill: +50% dano",
      "canonicalCooldown": "45s",
      "canonicalCooldownMs": 45000,
      "desc": "Eco potencializador.",
      "balance": {
          "mpCost": 6,
          "pwr": 5,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_empowering_echo",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "archmage",
          "mysticMuse",
          "stormScreamer"
      ]
  },
  "transcendent_hell_inferno": {
      "id": "transcendent_hell_inferno",
      "name": "Transcendent Hell Inferno",
      "slug": "transcendent_hell_inferno",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano fogo 800% + ignora M.DEF + burn 15s",
      "canonicalCooldown": "200s",
      "canonicalCooldownMs": 200000,
      "desc": "Inferno transcendente.",
      "balance": {
          "mpCost": 40,
          "pwr": 80,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_transcendent_hell_inferno",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "archmage"
      ]
  },
  "archmages_harmony": {
      "id": "archmages_harmony",
      "name": "Archmage's Harmony",
      "slug": "archmages_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+55% M.ATK, +35% Cast Speed, +20% MP 30min",
      "canonicalCooldown": "90 min",
      "canonicalCooldownMs": 5400000,
      "desc": "Harmonia do arquimago.",
      "balance": {
          "mpCost": 40,
          "pwr": 6,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_archmages_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "archmage"
      ]
  },
  "master_of_magic": {
      "id": "master_of_magic",
      "name": "Master of Magic",
      "slug": "master_of_magic",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+10% M.ATK, +10% fire dmg, +5% PvE",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Mestre da magia.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_master_of_magic",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "archmage",
          "mysticMuse"
      ]
  },
  "spell_mastery": {
      "id": "spell_mastery",
      "name": "Spell Mastery",
      "slug": "spell_mastery",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+12% M. Skill Power",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Maestria em feitiços.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_spell_mastery",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "archmage",
          "soultaker",
          "mysticMuse",
          "stormScreamer"
      ]
  },
  "magic_focus": {
      "id": "magic_focus",
      "name": "Magic Focus",
      "slug": "magic_focus",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+8% M. Crit Rate",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Foco mágico.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_magic_focus",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "archmage",
          "mysticMuse",
          "stormScreamer"
      ]
  },
  "archmage_spirit": {
      "id": "archmage_spirit",
      "name": "Archmage Spirit",
      "slug": "archmage_spirit",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% fire magic ATK",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Espírito do arquimago.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_archmage_spirit",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "archmage"
      ]
  },
  "body_of_the_archmage": {
      "id": "body_of_the_archmage",
      "name": "Body of the Archmage",
      "slug": "body_of_the_archmage",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+10% Max MP, +8% M.DEF",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Corpo arcano.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_body_of_the_archmage",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "archmage"
      ]
  },
  "death_spike": {
      "id": "death_spike",
      "name": "Death Spike",
      "slug": "death_spike",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1148.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano dark 260% + drain 25% HP",
      "canonicalCooldown": "12s",
      "canonicalCooldownMs": 12000,
      "desc": "Estaca mortal.",
      "balance": {
          "mpCost": 31,
          "pwr": 26,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_death_spike",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "necromancer",
          "deathPilgrim"
      ]
  },
  "corpse_plague": {
      "id": "corpse_plague",
      "name": "Corpse Plague",
      "slug": "corpse_plague",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0103.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "AoE dark 280% + poison 10s",
      "canonicalCooldown": "20s",
      "canonicalCooldownMs": 20000,
      "desc": "Praga cadavérica.",
      "balance": {
          "mpCost": 34,
          "pwr": 28,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_corpse_plague",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "necromancer"
      ]
  },
  "vampiric_claw": {
      "id": "vampiric_claw",
      "name": "Vampiric Claw",
      "slug": "vampiric_claw",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1159.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano 240% + drain 35% HP",
      "canonicalCooldown": "14s",
      "canonicalCooldownMs": 14000,
      "desc": "Garra vampírica.",
      "balance": {
          "mpCost": 29,
          "pwr": 24,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_vampiric_claw",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "necromancer"
      ]
  },
  "anchor": {
      "id": "anchor",
      "name": "Anchor",
      "slug": "anchor",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1170.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Root no alvo 6s + dano 180%",
      "canonicalCooldown": "22s",
      "canonicalCooldownMs": 22000,
      "desc": "Âncora sombria.",
      "balance": {
          "mpCost": 22,
          "pwr": 18,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_anchor",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "necromancer"
      ]
  },
  "curse_gloom": {
      "id": "curse_gloom",
      "name": "Curse: Gloom",
      "slug": "curse_gloom",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "-25% ATK e M.ATK do alvo 12s",
      "canonicalCooldown": "25s",
      "canonicalCooldownMs": 25000,
      "desc": "Maldição da melancolia.",
      "balance": {
          "mpCost": 5,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_curse_gloom",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "necromancer"
      ]
  },
  "corpse_burst": {
      "id": "corpse_burst",
      "name": "Corpse Burst",
      "slug": "corpse_burst",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill1157.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Explode cadáver: AoE 350% dark",
      "canonicalCooldown": "25s",
      "canonicalCooldownMs": 25000,
      "desc": "Explosão de cadáver.",
      "balance": {
          "mpCost": 42,
          "pwr": 35,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_corpse_burst",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "necromancer"
      ]
  },
  "summon_reanimated_man": {
      "id": "summon_reanimated_man",
      "name": "Summon Reanimated Man",
      "slug": "summon_reanimated_man",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1129.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Invoca morto-vivo (ATK 50% do dono)",
      "canonicalCooldown": "60s",
      "canonicalCooldownMs": 60000,
      "desc": "Reanimar morto.",
      "balance": {
          "mpCost": 6,
          "pwr": 5,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_summon_reanimated_man",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "necromancer"
      ]
  },
  "summon_cursed_bone": {
      "id": "summon_cursed_bone",
      "name": "Summon Cursed Bone",
      "slug": "summon_cursed_bone",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Invoca esqueleto (ATK 40% do dono)",
      "canonicalCooldown": "45s",
      "canonicalCooldownMs": 45000,
      "desc": "Esqueleto amaldiçoado.",
      "balance": {
          "mpCost": 5,
          "pwr": 4,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_summon_cursed_bone",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "necromancer"
      ]
  },
  "surrender_to_unholy": {
      "id": "surrender_to_unholy",
      "name": "Surrender to Unholy",
      "slug": "surrender_to_unholy",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "-25% Dark Resist no alvo 15s",
      "canonicalCooldown": "25s",
      "canonicalCooldownMs": 25000,
      "desc": "Vulnerabilidade ao dark.",
      "balance": {
          "mpCost": 5,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_surrender_to_unholy",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "necromancer"
      ]
  },
  "curse_fear": {
      "id": "curse_fear",
      "name": "Curse Fear",
      "slug": "curse_fear",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill1169.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Medo AoE 5s (3 alvos)",
      "canonicalCooldown": "40s",
      "canonicalCooldownMs": 40000,
      "desc": "Medo amaldiçoado.",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_curse_fear",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "necromancer"
      ]
  },
  "necros_harmony": {
      "id": "necros_harmony",
      "name": "Necro's Harmony",
      "slug": "necros_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+30% M.ATK, +20% drain, +15% HP 25min",
      "canonicalCooldown": "60 min",
      "canonicalCooldownMs": 3600000,
      "desc": "Harmonia do necromante.",
      "balance": {
          "mpCost": 40,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_necros_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "necromancer"
      ]
  },
  "bone_armor": {
      "id": "bone_armor",
      "name": "Bone Armor",
      "slug": "bone_armor",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% DEF, +10% dark resist",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Armadura de ossos.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_bone_armor",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "necromancer"
      ]
  },
  "soul_vortex": {
      "id": "soul_vortex",
      "name": "Soul Vortex",
      "slug": "soul_vortex",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano dark 420% + soul drain",
      "canonicalCooldown": "25s",
      "canonicalCooldownMs": 25000,
      "desc": "Vórtice de almas.",
      "balance": {
          "mpCost": 50,
          "pwr": 42,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_soul_vortex",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "soultaker",
          "soulBreakerKamael"
      ]
  },
  "soul_vortex_destruction": {
      "id": "soul_vortex_destruction",
      "name": "Soul Vortex Destruction",
      "slug": "soul_vortex_destruction",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano dark AoE 650% + drain 30% HP",
      "canonicalCooldown": "160s",
      "canonicalCooldownMs": 160000,
      "desc": "Destruição do vórtice de almas.",
      "balance": {
          "mpCost": 40,
          "pwr": 65,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_soul_vortex_destruction",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "soultaker",
          "soulHound"
      ]
  },
  "void_explosion": {
      "id": "void_explosion",
      "name": "Void Explosion",
      "slug": "void_explosion",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano dark 700% + 2 hits + silence 5s",
      "canonicalCooldown": "180s",
      "canonicalCooldownMs": 180000,
      "desc": "Explosão do vazio.",
      "balance": {
          "mpCost": 40,
          "pwr": 70,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_void_explosion",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "soultaker"
      ]
  },
  "mass_curse_gloom": {
      "id": "mass_curse_gloom",
      "name": "Mass Curse: Gloom",
      "slug": "mass_curse_gloom",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "AoE -30% ATK/M.ATK (8 alvos) 12s",
      "canonicalCooldown": "35s",
      "canonicalCooldownMs": 35000,
      "desc": "Maldição em massa.",
      "balance": {
          "mpCost": 5,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_mass_curse_gloom",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "soultaker"
      ]
  },
  "soul_absorption": {
      "id": "soul_absorption",
      "name": "Soul Absorption",
      "slug": "soul_absorption",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Drena 40% MP do alvo como MP próprio",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "Absorção de almas.",
      "balance": {
          "mpCost": 5,
          "pwr": 4,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_soul_absorption",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "soultaker"
      ]
  },
  "summon_dark_curse": {
      "id": "summon_dark_curse",
      "name": "Summon Dark Curse",
      "slug": "summon_dark_curse",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Invoca entidade dark (ATK 70% do dono)",
      "canonicalCooldown": "90s",
      "canonicalCooldownMs": 90000,
      "desc": "Maldição sombria viva.",
      "balance": {
          "mpCost": 40,
          "pwr": 7,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_summon_dark_curse",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "soultaker"
      ]
  },
  "dark_burden": {
      "id": "dark_burden",
      "name": "Dark Burden",
      "slug": "dark_burden",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "-40% Speed no alvo 10s + dano 300%",
      "canonicalCooldown": "28s",
      "canonicalCooldownMs": 28000,
      "desc": "Fardo das trevas.",
      "balance": {
          "mpCost": 5,
          "pwr": 4,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_dark_burden",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "soultaker"
      ]
  },
  "transcendent_soul_vortex": {
      "id": "transcendent_soul_vortex",
      "name": "Transcendent Soul Vortex",
      "slug": "transcendent_soul_vortex",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano dark 850% + drain todo MP + stun 4s",
      "canonicalCooldown": "200s",
      "canonicalCooldownMs": 200000,
      "desc": "Vórtice de almas transcendente.",
      "balance": {
          "mpCost": 40,
          "pwr": 85,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_transcendent_soul_vortex",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "soultaker",
          "soulHound"
      ]
  },
  "soultakers_harmony": {
      "id": "soultakers_harmony",
      "name": "Soultaker's Harmony",
      "slug": "soultakers_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+55% M.ATK, +40% drain, +25% HP 30min",
      "canonicalCooldown": "90 min",
      "canonicalCooldownMs": 5400000,
      "desc": "Harmonia do ceifador.",
      "balance": {
          "mpCost": 40,
          "pwr": 6,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_soultakers_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "soultaker"
      ]
  },
  "master_of_dark_magic": {
      "id": "master_of_dark_magic",
      "name": "Master of Dark Magic",
      "slug": "master_of_dark_magic",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+10% M.ATK, +10% dark dmg, +5% PvE",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Mestre da magia negra.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_master_of_dark_magic",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "soultaker"
      ]
  },
  "soultaker_spirit": {
      "id": "soultaker_spirit",
      "name": "Soultaker Spirit",
      "slug": "soultaker_spirit",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% dark magic ATK",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Espírito do ceifador.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_soultaker_spirit",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "soultaker"
      ]
  },
  "body_of_the_soultaker": {
      "id": "body_of_the_soultaker",
      "name": "Body of the Soultaker",
      "slug": "body_of_the_soultaker",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+12% Max MP, +10% HP",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Corpo do ceifador.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_body_of_the_soultaker",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "soultaker"
      ]
  },
  "summon_shadow": {
      "id": "summon_shadow",
      "name": "Summon Shadow",
      "slug": "summon_shadow",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1128.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Invoca sombra (ATK 45% do dono)",
      "canonicalCooldown": "60s",
      "canonicalCooldownMs": 60000,
      "desc": "Sombra combatente.",
      "balance": {
          "mpCost": 6,
          "pwr": 5,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_summon_shadow",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "warlock"
      ]
  },
  "summon_silhouette": {
      "id": "summon_silhouette",
      "name": "Summon Silhouette",
      "slug": "summon_silhouette",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1228.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Invoca silhueta (tank, DEF 60%)",
      "canonicalCooldown": "60s",
      "canonicalCooldownMs": 60000,
      "desc": "Silhueta defensiva.",
      "balance": {
          "mpCost": 7,
          "pwr": 6,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_summon_silhouette",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "warlock"
      ]
  },
  "summon_soulless": {
      "id": "summon_soulless",
      "name": "Summon Soulless",
      "slug": "summon_soulless",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill1278.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Invoca sem-alma (ATK 65% do dono)",
      "canonicalCooldown": "90s",
      "canonicalCooldownMs": 90000,
      "desc": "Criatura sem alma — forte.",
      "balance": {
          "mpCost": 40,
          "pwr": 7,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_summon_soulless",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "warlock"
      ]
  },
  "servitor_heal": {
      "id": "servitor_heal",
      "name": "Servitor Heal",
      "slug": "servitor_heal",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1127.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Cura summon 35% HP",
      "canonicalCooldown": "12s",
      "canonicalCooldownMs": 12000,
      "desc": "Cura do servitor.",
      "balance": {
          "mpCost": 5,
          "pwr": 4,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_servitor_heal",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "warlock",
          "elementalSummoner",
          "phantomSummoner"
      ]
  },
  "servitor_recharge": {
      "id": "servitor_recharge",
      "name": "Servitor Recharge",
      "slug": "servitor_recharge",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1126.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Restaura 30% MP do summon",
      "canonicalCooldown": "15s",
      "canonicalCooldownMs": 15000,
      "desc": "Recarga do servitor.",
      "balance": {
          "mpCost": 5,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_servitor_recharge",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "warlock",
          "elementalSummoner",
          "phantomSummoner"
      ]
  },
  "transfer_pain": {
      "id": "transfer_pain",
      "name": "Transfer Pain",
      "slug": "transfer_pain",
      "type": "toggle",
      "rawType": "Toggle",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1262.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "50% dano recebido vai pro summon",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Transferência de dor.",
      "balance": {
          "mpCost": 2,
          "pwr": 5,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_transfer_pain",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "warlock",
          "elementalSummoner",
          "phantomSummoner"
      ]
  },
  "summon_binding_cubic": {
      "id": "summon_binding_cubic",
      "name": "Summon Binding Cubic",
      "slug": "summon_binding_cubic",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1279.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Cubic que causa root em inimigos",
      "canonicalCooldown": "45s",
      "canonicalCooldownMs": 45000,
      "desc": "Cubic aprisionador.",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_summon_binding_cubic",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "warlock",
          "phantomSummoner"
      ]
  },
  "summon_phantom_cubic": {
      "id": "summon_phantom_cubic",
      "name": "Summon Phantom Cubic",
      "slug": "summon_phantom_cubic",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0033.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Cubic que causa dano dark contínuo",
      "canonicalCooldown": "45s",
      "canonicalCooldownMs": 45000,
      "desc": "Cubic fantasma.",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_summon_phantom_cubic",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "warlock",
          "phantomSummoner"
      ]
  },
  "life_cubic": {
      "id": "life_cubic",
      "name": "Life Cubic",
      "slug": "life_cubic",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Cubic que cura dono 5%/5s",
      "canonicalCooldown": "45s",
      "canonicalCooldownMs": 45000,
      "desc": "Cubic vital.",
      "balance": {
          "mpCost": 5,
          "pwr": 1,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_life_cubic",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "warlock"
      ]
  },
  "warlocks_harmony": {
      "id": "warlocks_harmony",
      "name": "Warlock's Harmony",
      "slug": "warlocks_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+30% M.ATK, +25% Summon ATK 25min",
      "canonicalCooldown": "60 min",
      "canonicalCooldownMs": 3600000,
      "desc": "Harmonia do warlock.",
      "balance": {
          "mpCost": 40,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_warlocks_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "warlock"
      ]
  },
  "servitor_physical_atk": {
      "id": "servitor_physical_atk",
      "name": "Servitor Physical ATK",
      "slug": "servitor_physical_atk",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% Summon ATK",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Poder do servitor.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_servitor_physical_atk",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "warlock",
          "elementalSummoner"
      ]
  },
  "summon_feline_king": {
      "id": "summon_feline_king",
      "name": "Summon Feline King",
      "slug": "summon_feline_king",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill1406.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Invoca Rei Felino (ATK 90% do dono)",
      "canonicalCooldown": "120s",
      "canonicalCooldownMs": 120000,
      "desc": "Rei dos felinos — summon supremo.",
      "balance": {
          "mpCost": 40,
          "pwr": 9,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_summon_feline_king",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "arcanaLord"
      ]
  },
  "summon_magnus": {
      "id": "summon_magnus",
      "name": "Summon Magnus",
      "slug": "summon_magnus",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Invoca Magnus (AoE ATK 70% do dono)",
      "canonicalCooldown": "90s",
      "canonicalCooldownMs": 90000,
      "desc": "Magnus elemental.",
      "balance": {
          "mpCost": 40,
          "pwr": 7,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_summon_magnus",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "arcanaLord"
      ]
  },
  "servitor_barrier": {
      "id": "servitor_barrier",
      "name": "Servitor Barrier",
      "slug": "servitor_barrier",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Summon ganha escudo 5000 HP por 15s",
      "canonicalCooldown": "60s",
      "canonicalCooldownMs": 60000,
      "desc": "Barreira do servitor.",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_servitor_barrier",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "arcanaLord",
          "elementalMaster",
          "spectralMaster"
      ]
  },
  "mass_servitor_heal": {
      "id": "mass_servitor_heal",
      "name": "Mass Servitor Heal",
      "slug": "mass_servitor_heal",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Cura todos summons 40% HP",
      "canonicalCooldown": "25s",
      "canonicalCooldownMs": 25000,
      "desc": "Cura em massa dos servitors.",
      "balance": {
          "mpCost": 5,
          "pwr": 4,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_mass_servitor_heal",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "arcanaLord",
          "elementalMaster",
          "spectralMaster"
      ]
  },
  "servitor_empowerment": {
      "id": "servitor_empowerment",
      "name": "Servitor Empowerment",
      "slug": "servitor_empowerment",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill1299.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+50% Summon ATK/DEF por 30s",
      "canonicalCooldown": "90s",
      "canonicalCooldownMs": 90000,
      "desc": "Empoderamento do servitor.",
      "balance": {
          "mpCost": 40,
          "pwr": 5,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_servitor_empowerment",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "arcanaLord"
      ]
  },
  "final_servitor": {
      "id": "final_servitor",
      "name": "Final Servitor",
      "slug": "final_servitor",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill1349.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Summon sacrifica: AoE 600% + cura 50% HP",
      "canonicalCooldown": "180s",
      "canonicalCooldownMs": 180000,
      "desc": "Sacrifício final do servitor.",
      "balance": {
          "mpCost": 40,
          "pwr": 60,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_final_servitor",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "arcanaLord",
          "elementalMaster",
          "spectralMaster"
      ]
  },
  "transcendent_summon_burst": {
      "id": "transcendent_summon_burst",
      "name": "Transcendent Summon Burst",
      "slug": "transcendent_summon_burst",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Todos summons atacam: dano 800% total",
      "canonicalCooldown": "200s",
      "canonicalCooldownMs": 200000,
      "desc": "Explosão de invocações.",
      "balance": {
          "mpCost": 40,
          "pwr": 80,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_transcendent_summon_burst",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "arcanaLord",
          "elementalMaster",
          "spectralMaster"
      ]
  },
  "arcana_lords_harmony": {
      "id": "arcana_lords_harmony",
      "name": "Arcana Lord's Harmony",
      "slug": "arcana_lords_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+50% M.ATK, +60% Summon Power 30min",
      "canonicalCooldown": "90 min",
      "canonicalCooldownMs": 5400000,
      "desc": "Harmonia do senhor arcano.",
      "balance": {
          "mpCost": 40,
          "pwr": 5,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_arcana_lords_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "arcanaLord"
      ]
  },
  "master_of_summoning": {
      "id": "master_of_summoning",
      "name": "Master of Summoning",
      "slug": "master_of_summoning",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% Summon ATK/DEF, +5% PvE",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Mestre da invocação.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_master_of_summoning",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "arcanaLord"
      ]
  },
  "arcana_lord_spirit": {
      "id": "arcana_lord_spirit",
      "name": "Arcana Lord Spirit",
      "slug": "arcana_lord_spirit",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+12% M.ATK, +10% Summon HP",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Espírito do senhor arcano.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_arcana_lord_spirit",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "arcanaLord"
      ]
  },
  "body_of_the_arcana_lord": {
      "id": "body_of_the_arcana_lord",
      "name": "Body of the Arcana Lord",
      "slug": "body_of_the_arcana_lord",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+10% Max MP, +8% Max HP",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Corpo arcano reforçado.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_body_of_the_arcana_lord",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "arcanaLord"
      ]
  },
  "heal": {
      "id": "heal",
      "name": "Heal",
      "slug": "heal",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill1011.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Cura 25% HP alvo",
      "canonicalCooldown": "8s",
      "canonicalCooldownMs": 8000,
      "desc": "Cura básica.",
      "balance": {
          "mpCost": 5,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_heal",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "cleric",
          "elfOracle",
          "shillienOracle",
          "shaman"
      ]
  },
  "battle_heal": {
      "id": "battle_heal",
      "name": "Battle Heal",
      "slug": "battle_heal",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill1015.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Cura 20% HP + remove 1 debuff",
      "canonicalCooldown": "10s",
      "canonicalCooldownMs": 10000,
      "desc": "Cura de combate.",
      "balance": {
          "mpCost": 5,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_battle_heal",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "cleric",
          "elfOracle",
          "shillienOracle"
      ]
  },
  "might": {
      "id": "might",
      "name": "Might",
      "slug": "might",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill1068.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+15% ATK para party 10 min",
      "canonicalCooldown": "25 min",
      "canonicalCooldownMs": 1500000,
      "desc": "Bênção de força.",
      "balance": {
          "mpCost": 40,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_might",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "cleric",
          "elfOracle",
          "shillienOracle",
          "shaman"
      ]
  },
  "shield_buff": {
      "id": "shield_buff",
      "name": "Shield (Buff)",
      "slug": "shield_buff",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% DEF para party 10 min",
      "canonicalCooldown": "25 min",
      "canonicalCooldownMs": 1500000,
      "desc": "Bênção de proteção.",
      "balance": {
          "mpCost": 40,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_shield_buff",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "cleric",
          "elfOracle"
      ]
  },
  "wind_walk": {
      "id": "wind_walk",
      "name": "Wind Walk",
      "slug": "wind_walk",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill1204.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+20% Speed para party 10 min",
      "canonicalCooldown": "25 min",
      "canonicalCooldownMs": 1500000,
      "desc": "Caminhada do vento.",
      "balance": {
          "mpCost": 40,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_wind_walk",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "cleric"
      ]
  },
  "cure_poison": {
      "id": "cure_poison",
      "name": "Cure Poison",
      "slug": "cure_poison",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill1012.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Remove poison",
      "canonicalCooldown": "5s",
      "canonicalCooldownMs": 5000,
      "desc": "Cura veneno.",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_cure_poison",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "cleric",
          "elfOracle",
          "shillienOracle",
          "shaman"
      ]
  },
  "cure_bleed": {
      "id": "cure_bleed",
      "name": "Cure Bleed",
      "slug": "cure_bleed",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Remove bleed",
      "canonicalCooldown": "5s",
      "canonicalCooldownMs": 5000,
      "desc": "Estanca sangramento.",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_cure_bleed",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "cleric",
          "elfOracle",
          "shillienOracle",
          "shaman"
      ]
  },
  "turn_undead": {
      "id": "turn_undead",
      "name": "Turn Undead",
      "slug": "turn_undead",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1400.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano holy 200% vs undead",
      "canonicalCooldown": "12s",
      "canonicalCooldownMs": 12000,
      "desc": "Repelir mortos-vivos.",
      "balance": {
          "mpCost": 24,
          "pwr": 20,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_turn_undead",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "cleric"
      ]
  },
  "recharge": {
      "id": "recharge",
      "name": "Recharge",
      "slug": "recharge",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill1013.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Restaura 20% MP do alvo",
      "canonicalCooldown": "12s",
      "canonicalCooldownMs": 12000,
      "desc": "Recarrega mana.",
      "balance": {
          "mpCost": 5,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_recharge",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "cleric",
          "elfOracle",
          "shillienOracle"
      ]
  },
  "clerics_harmony": {
      "id": "clerics_harmony",
      "name": "Cleric's Harmony",
      "slug": "clerics_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+20% M.ATK, +20% Heal Power 20min",
      "canonicalCooldown": "45 min",
      "canonicalCooldownMs": 2700000,
      "desc": "Harmonia do clérigo.",
      "balance": {
          "mpCost": 40,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_clerics_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "cleric"
      ]
  },
  "greater_heal": {
      "id": "greater_heal",
      "name": "Greater Heal",
      "slug": "greater_heal",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1217.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Cura 40% HP alvo",
      "canonicalCooldown": "10s",
      "canonicalCooldownMs": 10000,
      "desc": "Cura avançada.",
      "balance": {
          "mpCost": 5,
          "pwr": 4,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_greater_heal",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "bishop",
          "elfElder",
          "shillienElder"
      ]
  },
  "greater_group_heal": {
      "id": "greater_group_heal",
      "name": "Greater Group Heal",
      "slug": "greater_group_heal",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill1219.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Cura 30% HP party",
      "canonicalCooldown": "18s",
      "canonicalCooldownMs": 18000,
      "desc": "Cura em grupo.",
      "balance": {
          "mpCost": 5,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_greater_group_heal",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "bishop",
          "elfElder",
          "shillienElder"
      ]
  },
  "resurrection": {
      "id": "resurrection",
      "name": "Resurrection",
      "slug": "resurrection",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill1016.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Ressuscita aliado com 30% HP",
      "canonicalCooldown": "120s",
      "canonicalCooldownMs": 120000,
      "desc": "Ressurreição.",
      "balance": {
          "mpCost": 40,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_resurrection",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "bishop",
          "elfElder",
          "shillienElder"
      ]
  },
  "greater_might": {
      "id": "greater_might",
      "name": "Greater Might",
      "slug": "greater_might",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1388.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+25% ATK party 12 min",
      "canonicalCooldown": "30 min",
      "canonicalCooldownMs": 1800000,
      "desc": "Bênção de força maior.",
      "balance": {
          "mpCost": 40,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_greater_might",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "bishop"
      ]
  },
  "greater_shield": {
      "id": "greater_shield",
      "name": "Greater Shield",
      "slug": "greater_shield",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1389.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+25% DEF party 12 min",
      "canonicalCooldown": "30 min",
      "canonicalCooldownMs": 1800000,
      "desc": "Bênção de proteção maior.",
      "balance": {
          "mpCost": 40,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_greater_shield",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "bishop"
      ]
  },
  "blessed_body": {
      "id": "blessed_body",
      "name": "Blessed Body",
      "slug": "blessed_body",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1045.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+20% Max HP party 12 min",
      "canonicalCooldown": "30 min",
      "canonicalCooldownMs": 1800000,
      "desc": "Corpo abençoado.",
      "balance": {
          "mpCost": 40,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_blessed_body",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "bishop"
      ]
  },
  "blessed_soul": {
      "id": "blessed_soul",
      "name": "Blessed Soul",
      "slug": "blessed_soul",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1048.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+20% Max MP party 12 min",
      "canonicalCooldown": "30 min",
      "canonicalCooldownMs": 1800000,
      "desc": "Alma abençoada.",
      "balance": {
          "mpCost": 40,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_blessed_soul",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "bishop"
      ]
  },
  "holy_weapon": {
      "id": "holy_weapon",
      "name": "Holy Weapon",
      "slug": "holy_weapon",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+15% Holy ATK party 12 min",
      "canonicalCooldown": "30 min",
      "canonicalCooldownMs": 1800000,
      "desc": "Arma sagrada.",
      "balance": {
          "mpCost": 40,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_holy_weapon",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "bishop"
      ]
  },
  "purify": {
      "id": "purify",
      "name": "Purify",
      "slug": "purify",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1018.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Remove 3 debuffs do alvo",
      "canonicalCooldown": "20s",
      "canonicalCooldownMs": 20000,
      "desc": "Purificação.",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_purify",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "bishop",
          "elfElder",
          "shillienElder"
      ]
  },
  "cleanse": {
      "id": "cleanse",
      "name": "Cleanse",
      "slug": "cleanse",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill1409.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Remove TODOS debuffs do alvo",
      "canonicalCooldown": "45s",
      "canonicalCooldownMs": 45000,
      "desc": "Limpeza total.",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_cleanse",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "bishop",
          "elfElder",
          "shillienElder"
      ]
  },
  "mental_shield": {
      "id": "mental_shield",
      "name": "Mental Shield",
      "slug": "mental_shield",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1035.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+20% M.DEF party 12 min",
      "canonicalCooldown": "30 min",
      "canonicalCooldownMs": 1800000,
      "desc": "Escudo mental.",
      "balance": {
          "mpCost": 40,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_mental_shield",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "bishop",
          "elfElder",
          "shillienElder"
      ]
  },
  "inquisitor": {
      "id": "inquisitor",
      "name": "Inquisitor",
      "slug": "inquisitor",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano holy 250%",
      "canonicalCooldown": "14s",
      "canonicalCooldownMs": 14000,
      "desc": "Poder inquisitorial.",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_inquisitor",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "bishop"
      ]
  },
  "divine_punishment": {
      "id": "divine_punishment",
      "name": "Divine Punishment",
      "slug": "divine_punishment",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano holy 360% + stun 3s",
      "canonicalCooldown": "22s",
      "canonicalCooldownMs": 22000,
      "desc": "Punição divina.",
      "balance": {
          "mpCost": 43,
          "pwr": 36,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_divine_punishment",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "bishop"
      ]
  },
  "major_heal": {
      "id": "major_heal",
      "name": "Major Heal",
      "slug": "major_heal",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill1401.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Cura 55% HP alvo",
      "canonicalCooldown": "15s",
      "canonicalCooldownMs": 15000,
      "desc": "Cura maior.",
      "balance": {
          "mpCost": 7,
          "pwr": 6,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_major_heal",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "bishop"
      ]
  },
  "party_recall": {
      "id": "party_recall",
      "name": "Party Recall",
      "slug": "party_recall",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1255.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Teleporta party para cidade",
      "canonicalCooldown": "300s",
      "canonicalCooldownMs": 300000,
      "desc": "Recall do grupo.",
      "balance": {
          "mpCost": 40,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_party_recall",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "bishop"
      ]
  },
  "bishops_harmony": {
      "id": "bishops_harmony",
      "name": "Bishop's Harmony",
      "slug": "bishops_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+35% Heal, +25% M.ATK, +20% M.DEF 25min",
      "canonicalCooldown": "60 min",
      "canonicalCooldownMs": 3600000,
      "desc": "Harmonia do bispo.",
      "balance": {
          "mpCost": 40,
          "pwr": 4,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_bishops_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "bishop"
      ]
  },
  "mana_regeneration": {
      "id": "mana_regeneration",
      "name": "Mana Regeneration",
      "slug": "mana_regeneration",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1047.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+15% MP Regen",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Regeneração de mana.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_mana_regeneration",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "bishop"
      ]
  },
  "miracle": {
      "id": "miracle",
      "name": "Miracle",
      "slug": "miracle",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill1426.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Cura party 80% HP + ressurge mortos",
      "canonicalCooldown": "300s",
      "canonicalCooldownMs": 300000,
      "desc": "MILAGRE — cura suprema + ressurreição.",
      "balance": {
          "mpCost": 40,
          "pwr": 8,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_miracle",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "cardinal",
          "evaSaint",
          "shillienSaint"
      ]
  },
  "sublime_self_sacrifice": {
      "id": "sublime_self_sacrifice",
      "name": "Sublime Self-Sacrifice",
      "slug": "sublime_self_sacrifice",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Morre para curar party 100% HP+MP",
      "canonicalCooldown": "300s",
      "canonicalCooldownMs": 300000,
      "desc": "Auto-sacrifício sublime.",
      "balance": {
          "mpCost": 40,
          "pwr": 10,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_sublime_self_sacrifice",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "cardinal",
          "evaSaint",
          "shillienSaint"
      ]
  },
  "balance_life": {
      "id": "balance_life",
      "name": "Balance Life",
      "slug": "balance_life",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill1335.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Equaliza HP de toda party",
      "canonicalCooldown": "60s",
      "canonicalCooldownMs": 60000,
      "desc": "Equilíbrio vital.",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_balance_life",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "cardinal",
          "evaSaint",
          "shillienSaint"
      ]
  },
  "mass_resurrection": {
      "id": "mass_resurrection",
      "name": "Mass Resurrection",
      "slug": "mass_resurrection",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill1254.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Ressuscita toda party com 40% HP",
      "canonicalCooldown": "300s",
      "canonicalCooldownMs": 300000,
      "desc": "Ressurreição em massa.",
      "balance": {
          "mpCost": 40,
          "pwr": 4,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_mass_resurrection",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "cardinal",
          "evaSaint",
          "shillienSaint"
      ]
  },
  "lord_of_vampire": {
      "id": "lord_of_vampire",
      "name": "Lord of Vampire",
      "slug": "lord_of_vampire",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+10% lifesteal para party 12 min",
      "canonicalCooldown": "30 min",
      "canonicalCooldownMs": 1800000,
      "desc": "Senhor dos vampiros.",
      "balance": {
          "mpCost": 40,
          "pwr": 1,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_lord_of_vampire",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "cardinal",
          "shillienSaint"
      ]
  },
  "blessing_of_eva": {
      "id": "blessing_of_eva",
      "name": "Blessing of Eva",
      "slug": "blessing_of_eva",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+25% M.DEF e resist debuff party 12min",
      "canonicalCooldown": "30 min",
      "canonicalCooldownMs": 1800000,
      "desc": "Bênção de Eva.",
      "balance": {
          "mpCost": 40,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_blessing_of_eva",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "cardinal",
          "evaSaint"
      ]
  },
  "trance": {
      "id": "trance",
      "name": "Trance",
      "slug": "trance",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill1394.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Channeling: cura 8%/s por 10s",
      "canonicalCooldown": "45s",
      "canonicalCooldownMs": 45000,
      "desc": "Transe curativo.",
      "balance": {
          "mpCost": 5,
          "pwr": 1,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_trance",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "cardinal"
      ]
  },
  "dark_side": {
      "id": "dark_side",
      "name": "Dark Side",
      "slug": "dark_side",
      "type": "toggle",
      "rawType": "Toggle",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Troca: -60% Heal, +80% M.ATK holy",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "LADO SOMBRIO — transforma healer em DPS.",
      "balance": {
          "mpCost": 2,
          "pwr": 6,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_dark_side",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "cardinal",
          "evaSaint",
          "shillienSaint"
      ]
  },
  "holy_burst": {
      "id": "holy_burst",
      "name": "Holy Burst",
      "slug": "holy_burst",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano holy AoE 400% (Dark Side only)",
      "canonicalCooldown": "20s",
      "canonicalCooldownMs": 20000,
      "desc": "Explosão sagrada (apenas Dark Side).",
      "balance": {
          "mpCost": 48,
          "pwr": 40,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_holy_burst",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "cardinal"
      ]
  },
  "divine_nova": {
      "id": "divine_nova",
      "name": "Divine Nova",
      "slug": "divine_nova",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano holy AoE 450% + blind 5s",
      "canonicalCooldown": "25s",
      "canonicalCooldownMs": 25000,
      "desc": "Nova divina (Dark Side amplifica).",
      "balance": {
          "mpCost": 54,
          "pwr": 45,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_divine_nova",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "cardinal",
          "evaSaint",
          "shillienSaint"
      ]
  },
  "transcendent_holy_strike": {
      "id": "transcendent_holy_strike",
      "name": "Transcendent Holy Strike",
      "slug": "transcendent_holy_strike",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano holy 750% + stun 5s",
      "canonicalCooldown": "180s",
      "canonicalCooldownMs": 180000,
      "desc": "Golpe sagrado transcendente.",
      "balance": {
          "mpCost": 40,
          "pwr": 75,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_transcendent_holy_strike",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "cardinal"
      ]
  },
  "cardinals_harmony": {
      "id": "cardinals_harmony",
      "name": "Cardinal's Harmony",
      "slug": "cardinals_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+55% Heal, +40% M.ATK, +30% M.DEF 30min",
      "canonicalCooldown": "90 min",
      "canonicalCooldownMs": 5400000,
      "desc": "Harmonia do cardeal.",
      "balance": {
          "mpCost": 40,
          "pwr": 6,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_cardinals_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "cardinal"
      ]
  },
  "master_of_healing": {
      "id": "master_of_healing",
      "name": "Master of Healing",
      "slug": "master_of_healing",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% Heal Power, +5% PvE",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Mestre da cura.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_master_of_healing",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "cardinal",
          "evaSaint"
      ]
  },
  "cardinal_spirit": {
      "id": "cardinal_spirit",
      "name": "Cardinal Spirit",
      "slug": "cardinal_spirit",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+12% holy magic ATK",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Espírito do cardeal.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_cardinal_spirit",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "cardinal"
      ]
  },
  "body_of_the_cardinal": {
      "id": "body_of_the_cardinal",
      "name": "Body of the Cardinal",
      "slug": "body_of_the_cardinal",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+12% Max MP, +10% M.DEF",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Corpo sagrado.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_body_of_the_cardinal",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "cardinal"
      ]
  },
  "haste": {
      "id": "haste",
      "name": "Haste",
      "slug": "haste",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1086.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+30% ATK Speed por 20 min",
      "canonicalCooldown": "50 min",
      "canonicalCooldownMs": 3000000,
      "desc": "Aceleração.",
      "balance": {
          "mpCost": 40,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_haste",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "prophet",
          "elfElder"
      ]
  },
  "berserker_spirit": {
      "id": "berserker_spirit",
      "name": "Berserker Spirit",
      "slug": "berserker_spirit",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1062.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+20% ATK, +20% M.ATK, -10% DEF 20min",
      "canonicalCooldown": "50 min",
      "canonicalCooldownMs": 3000000,
      "desc": "Espírito berserker.",
      "balance": {
          "mpCost": 40,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_berserker_spirit",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "prophet"
      ]
  },
  "vampiric_rage": {
      "id": "vampiric_rage",
      "name": "Vampiric Rage",
      "slug": "vampiric_rage",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1268.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+10% lifesteal por 20 min",
      "canonicalCooldown": "50 min",
      "canonicalCooldownMs": 3000000,
      "desc": "Fúria vampírica.",
      "balance": {
          "mpCost": 40,
          "pwr": 1,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_vampiric_rage",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "prophet",
          "shillienElder"
      ]
  },
  "empower": {
      "id": "empower",
      "name": "Empower",
      "slug": "empower",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1059.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+25% M.ATK por 20 min",
      "canonicalCooldown": "50 min",
      "canonicalCooldownMs": 3000000,
      "desc": "Empoderamento mágico.",
      "balance": {
          "mpCost": 40,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_empower",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "prophet",
          "elfElder",
          "shillienElder"
      ]
  },
  "acumen": {
      "id": "acumen",
      "name": "Acumen",
      "slug": "acumen",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1085.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+25% Cast Speed por 20 min",
      "canonicalCooldown": "50 min",
      "canonicalCooldownMs": 3000000,
      "desc": "Acuidade mágica.",
      "balance": {
          "mpCost": 40,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_acumen",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "prophet",
          "elfElder",
          "shillienElder"
      ]
  },
  "concentration": {
      "id": "concentration",
      "name": "Concentration",
      "slug": "concentration",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1078.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+20% M.DEF por 20 min",
      "canonicalCooldown": "50 min",
      "canonicalCooldownMs": 3000000,
      "desc": "Concentração mágica.",
      "balance": {
          "mpCost": 40,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_concentration",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "prophet"
      ]
  },
  "death_whisper": {
      "id": "death_whisper",
      "name": "Death Whisper",
      "slug": "death_whisper",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1242.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+20% Crit Damage por 20 min",
      "canonicalCooldown": "50 min",
      "canonicalCooldownMs": 3000000,
      "desc": "Sussurro da morte.",
      "balance": {
          "mpCost": 40,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_death_whisper",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "prophet"
      ]
  },
  "guidance": {
      "id": "guidance",
      "name": "Guidance",
      "slug": "guidance",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1240.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+15% Accuracy por 20 min",
      "canonicalCooldown": "50 min",
      "canonicalCooldownMs": 3000000,
      "desc": "Guia divina.",
      "balance": {
          "mpCost": 40,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_guidance",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "prophet"
      ]
  },
  "bless_shield": {
      "id": "bless_shield",
      "name": "Bless Shield",
      "slug": "bless_shield",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1243.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+25% Block Rate por 20 min",
      "canonicalCooldown": "50 min",
      "canonicalCooldownMs": 3000000,
      "desc": "Escudo abençoado.",
      "balance": {
          "mpCost": 40,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_bless_shield",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "prophet",
          "shillienElder"
      ]
  },
  "resist_fire": {
      "id": "resist_fire",
      "name": "Resist Fire",
      "slug": "resist_fire",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill4009.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+20% Fire Resist por 20 min",
      "canonicalCooldown": "50 min",
      "canonicalCooldownMs": 3000000,
      "desc": "Resistência ao fogo.",
      "balance": {
          "mpCost": 40,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_resist_fire",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "prophet"
      ]
  },
  "resist_water": {
      "id": "resist_water",
      "name": "Resist Water",
      "slug": "resist_water",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill4010.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+20% Water Resist por 20 min",
      "canonicalCooldown": "50 min",
      "canonicalCooldownMs": 3000000,
      "desc": "Resistência à água.",
      "balance": {
          "mpCost": 40,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_resist_water",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "prophet"
      ]
  },
  "resist_wind": {
      "id": "resist_wind",
      "name": "Resist Wind",
      "slug": "resist_wind",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill4011.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+20% Wind Resist por 20 min",
      "canonicalCooldown": "50 min",
      "canonicalCooldownMs": 3000000,
      "desc": "Resistência ao vento.",
      "balance": {
          "mpCost": 40,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_resist_wind",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "prophet"
      ]
  },
  "prophets_harmony": {
      "id": "prophets_harmony",
      "name": "Prophet's Harmony",
      "slug": "prophets_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+30% ATK, +25% M.ATK, +20% DEF 25min",
      "canonicalCooldown": "60 min",
      "canonicalCooldownMs": 3600000,
      "desc": "Harmonia do profeta.",
      "balance": {
          "mpCost": 40,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_prophets_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "prophet"
      ]
  },
  "prophecy_of_fire": {
      "id": "prophecy_of_fire",
      "name": "Prophecy of Fire",
      "slug": "prophecy_of_fire",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill1356.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+30% ATK, +15% Crit party 12 min",
      "canonicalCooldown": "30 min",
      "canonicalCooldownMs": 1800000,
      "desc": "Profecia do fogo.",
      "balance": {
          "mpCost": 40,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_prophecy_of_fire",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "hierophant"
      ]
  },
  "prophecy_of_wind": {
      "id": "prophecy_of_wind",
      "name": "Prophecy of Wind",
      "slug": "prophecy_of_wind",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill1357.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+25% Speed, +20% EVA party 12 min",
      "canonicalCooldown": "30 min",
      "canonicalCooldownMs": 1800000,
      "desc": "Profecia do vento.",
      "balance": {
          "mpCost": 40,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_prophecy_of_wind",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "hierophant"
      ]
  },
  "prophecy_of_water": {
      "id": "prophecy_of_water",
      "name": "Prophecy of Water",
      "slug": "prophecy_of_water",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill1355.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+30% M.ATK, +20% M.DEF party 12 min",
      "canonicalCooldown": "30 min",
      "canonicalCooldownMs": 1800000,
      "desc": "Profecia da água.",
      "balance": {
          "mpCost": 40,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_prophecy_of_water",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "hierophant",
          "elfElder",
          "shillienElder"
      ]
  },
  "mass_prophecy": {
      "id": "mass_prophecy",
      "name": "Mass Prophecy",
      "slug": "mass_prophecy",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Todas profecias de uma vez 8 min",
      "canonicalCooldown": "60 min",
      "canonicalCooldownMs": 3600000,
      "desc": "Profecia em massa.",
      "balance": {
          "mpCost": 40,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_mass_prophecy",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "hierophant"
      ]
  },
  "holy_punishment": {
      "id": "holy_punishment",
      "name": "Holy Punishment",
      "slug": "holy_punishment",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano holy 400% + silence 5s",
      "canonicalCooldown": "22s",
      "canonicalCooldownMs": 22000,
      "desc": "Punição sagrada.",
      "balance": {
          "mpCost": 48,
          "pwr": 40,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_holy_punishment",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "hierophant"
      ]
  },
  "blessing_of_nobility": {
      "id": "blessing_of_nobility",
      "name": "Blessing of Nobility",
      "slug": "blessing_of_nobility",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% all stats party 10 min",
      "canonicalCooldown": "30 min",
      "canonicalCooldownMs": 1800000,
      "desc": "Bênção da nobreza.",
      "balance": {
          "mpCost": 40,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_blessing_of_nobility",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "hierophant"
      ]
  },
  "transcendent_holy_burst": {
      "id": "transcendent_holy_burst",
      "name": "Transcendent Holy Burst",
      "slug": "transcendent_holy_burst",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano holy AoE 650% + stun 4s + purge",
      "canonicalCooldown": "180s",
      "canonicalCooldownMs": 180000,
      "desc": "Explosão sagrada transcendente.",
      "balance": {
          "mpCost": 40,
          "pwr": 65,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_transcendent_holy_burst",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "hierophant"
      ]
  },
  "hierophants_harmony": {
      "id": "hierophants_harmony",
      "name": "Hierophant's Harmony",
      "slug": "hierophants_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+50% ATK, +45% M.ATK, +35% DEF 30min",
      "canonicalCooldown": "90 min",
      "canonicalCooldownMs": 5400000,
      "desc": "Harmonia do hierofante.",
      "balance": {
          "mpCost": 40,
          "pwr": 5,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_hierophants_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "hierophant"
      ]
  },
  "master_of_prophecy": {
      "id": "master_of_prophecy",
      "name": "Master of Prophecy",
      "slug": "master_of_prophecy",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% buff duration, +5% PvE",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Mestre das profecias.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_master_of_prophecy",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "hierophant"
      ]
  },
  "hierophant_spirit": {
      "id": "hierophant_spirit",
      "name": "Hierophant Spirit",
      "slug": "hierophant_spirit",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+12% holy ATK, +8% Heal",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Espírito do hierofante.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_hierophant_spirit",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "hierophant"
      ]
  },
  "body_of_the_hierophant": {
      "id": "body_of_the_hierophant",
      "name": "Body of the Hierophant",
      "slug": "body_of_the_hierophant",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+10% Max HP, +10% Max MP",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Corpo do hierofante.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_body_of_the_hierophant",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "hierophant"
      ]
  },
  "soul_drain": {
      "id": "soul_drain",
      "name": "Soul Drain",
      "slug": "soul_drain",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano 140% + drain 20% HP",
      "canonicalCooldown": "12s",
      "canonicalCooldownMs": 12000,
      "desc": "",
      "balance": {
          "mpCost": 17,
          "pwr": 14,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_soul_drain",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "deathPilgrim"
      ]
  },
  "dp_mastery": {
      "id": "dp_mastery",
      "name": "DP Mastery",
      "slug": "dp_mastery",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Gera Death Points ao atacar/matar",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_dp_mastery",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "deathPilgrim"
      ]
  },
  "death_raid": {
      "id": "death_raid",
      "name": "Death Raid",
      "slug": "death_raid",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano dark 200% + knockback",
      "canonicalCooldown": "12s",
      "canonicalCooldownMs": 12000,
      "desc": "",
      "balance": {
          "mpCost": 24,
          "pwr": 20,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_death_raid",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "deathBlade"
      ]
  },
  "dark_shield": {
      "id": "dark_shield",
      "name": "Dark Shield",
      "slug": "dark_shield",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Absorve 2000 dano dark por 12s",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_dark_shield",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "deathBlade"
      ]
  },
  "dark_weapon": {
      "id": "dark_weapon",
      "name": "Dark Weapon",
      "slug": "dark_weapon",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+20% Dark Damage por 20 min",
      "canonicalCooldown": "45 min",
      "canonicalCooldownMs": 2700000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_dark_weapon",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "deathBlade"
      ]
  },
  "dark_explosion": {
      "id": "dark_explosion",
      "name": "Dark Explosion",
      "slug": "dark_explosion",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano AoE dark 300% + poison 6s",
      "canonicalCooldown": "22s",
      "canonicalCooldownMs": 22000,
      "desc": "",
      "balance": {
          "mpCost": 36,
          "pwr": 30,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_dark_explosion",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "deathMessenger"
      ]
  },
  "death_mark": {
      "id": "death_mark",
      "name": "Death Mark",
      "slug": "death_mark",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Marca alvo: +30% Dark Damage recebido 10s",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_death_mark",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "deathMessenger"
      ]
  },
  "abyss_gaze": {
      "id": "abyss_gaze",
      "name": "Abyss Gaze",
      "slug": "abyss_gaze",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano dark 260% + fear 3s",
      "canonicalCooldown": "25s",
      "canonicalCooldownMs": 25000,
      "desc": "",
      "balance": {
          "mpCost": 31,
          "pwr": 26,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_abyss_gaze",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "deathMessenger"
      ]
  },
  "dark_armor": {
      "id": "dark_armor",
      "name": "Dark Armor",
      "slug": "dark_armor",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+25% DEF e +15% Dark Resist por 20 min",
      "canonicalCooldown": "50 min",
      "canonicalCooldownMs": 3000000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_dark_armor",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "deathMessenger"
      ]
  },
  "death_messengers_harmony": {
      "id": "death_messengers_harmony",
      "name": "Death Messenger's Harmony",
      "slug": "death_messengers_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+35% ATK, +25% Dark Damage, +20% DEF por 25 min",
      "canonicalCooldown": "60 min",
      "canonicalCooldownMs": 3600000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 4,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_death_messengers_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "deathMessenger"
      ]
  },
  "death_storm": {
      "id": "death_storm",
      "name": "Death Storm",
      "slug": "death_storm",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano AoE dark 450% + drain HP AoE 20%",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "",
      "balance": {
          "mpCost": 54,
          "pwr": 45,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_death_storm",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "deathKnight"
      ]
  },
  "deadly_counter": {
      "id": "deadly_counter",
      "name": "Deadly Counter",
      "slug": "deadly_counter",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Contra-ataque dark 400% quando bloqueado",
      "canonicalCooldown": "25s",
      "canonicalCooldownMs": 25000,
      "desc": "",
      "balance": {
          "mpCost": 48,
          "pwr": 40,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_deadly_counter",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "deathKnight"
      ]
  },
  "ultimate_death_knight": {
      "id": "ultimate_death_knight",
      "name": "Ultimate Death Knight",
      "slug": "ultimate_death_knight",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0176.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+80% ATK e Dark Damage por 30s (consume todos DP)",
      "canonicalCooldown": "120s",
      "canonicalCooldownMs": 120000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 8,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_ultimate_death_knight",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "deathKnight"
      ]
  },
  "transcendent_death_spike": {
      "id": "transcendent_death_spike",
      "name": "Transcendent Death Spike",
      "slug": "transcendent_death_spike",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano dark 720% + ignore DEF + drain 40% HP",
      "canonicalCooldown": "180s",
      "canonicalCooldownMs": 180000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 72,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_transcendent_death_spike",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "deathKnight"
      ]
  },
  "death_knights_will": {
      "id": "death_knights_will",
      "name": "Death Knight's Will",
      "slug": "death_knights_will",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+25% ATK, +20% Dark Damage, +15% Max HP",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_death_knights_will",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "deathKnight"
      ]
  },
  "death_knight_harmony": {
      "id": "death_knight_harmony",
      "name": "Death Knight Harmony",
      "slug": "death_knight_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+60% ATK, +50% Dark Damage, +35% DEF por 30 min",
      "canonicalCooldown": "90 min",
      "canonicalCooldownMs": 5400000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 6,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_death_knight_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "deathKnight"
      ]
  },
  "beast_claw": {
      "id": "beast_claw",
      "name": "Beast Claw",
      "slug": "beast_claw",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano físico 260% com garras ancestrais",
      "canonicalCooldown": "6s",
      "canonicalCooldownMs": 6000,
      "desc": "",
      "balance": {
          "mpCost": 31,
          "pwr": 26,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_beast_claw",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "warg"
      ]
  },
  "wolf_pack_rush": {
      "id": "wolf_pack_rush",
      "name": "Wolf Pack Rush",
      "slug": "wolf_pack_rush",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Investida brutal 360% + atordoa por 3s",
      "canonicalCooldown": "12s",
      "canonicalCooldownMs": 12000,
      "desc": "",
      "balance": {
          "mpCost": 43,
          "pwr": 36,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_wolf_pack_rush",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "warg"
      ]
  },
  "beast_howl": {
      "id": "beast_howl",
      "name": "Beast Howl",
      "slug": "beast_howl",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+35% ATK, +25% Atk Speed por 120s",
      "canonicalCooldown": "45s",
      "canonicalCooldownMs": 45000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 4,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_beast_howl",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "warg"
      ]
  },
  "ancestral_wolf_transformation": {
      "id": "ancestral_wolf_transformation",
      "name": "Ancestral Wolf Transformation",
      "slug": "ancestral_wolf_transformation",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Transformação em Lobo Ancestral: +60% ATK, +45% Crit Dmg por 60s",
      "canonicalCooldown": "90s",
      "canonicalCooldownMs": 90000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 6,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_ancestral_wolf_transformation",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "warg"
      ]
  },
  "vampiric_feral_bite": {
      "id": "vampiric_feral_bite",
      "name": "Vampiric Feral Bite",
      "slug": "vampiric_feral_bite",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Mordida vampírica 320% + recupera 50% do dano em HP",
      "canonicalCooldown": "14s",
      "canonicalCooldownMs": 14000,
      "desc": "",
      "balance": {
          "mpCost": 38,
          "pwr": 32,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_vampiric_feral_bite",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "warg"
      ]
  },
  "assassination": {
      "id": "assassination",
      "name": "Assassination",
      "slug": "assassination",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0432.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano 170% + gera 1 Assassin Dagger",
      "canonicalCooldown": "8s",
      "canonicalCooldownMs": 8000,
      "desc": "",
      "balance": {
          "mpCost": 20,
          "pwr": 17,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_assassination",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "assassinS0"
      ]
  },
  "shadow_dash": {
      "id": "shadow_dash",
      "name": "Shadow Dash",
      "slug": "shadow_dash",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Teleporta curta distância + invisibilidade 2s",
      "canonicalCooldown": "15s",
      "canonicalCooldownMs": 15000,
      "desc": "",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_shadow_dash",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "assassinS0"
      ]
  },
  "shadow_strike": {
      "id": "shadow_strike",
      "name": "Shadow Strike",
      "slug": "shadow_strike",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano 240% por trás + crit garantido",
      "canonicalCooldown": "14s",
      "canonicalCooldownMs": 14000,
      "desc": "",
      "balance": {
          "mpCost": 29,
          "pwr": 24,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_shadow_strike",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "assassinS1"
      ]
  },
  "blade_rush": {
      "id": "blade_rush",
      "name": "Blade Rush",
      "slug": "blade_rush",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Avança 200% + gera 1 Assassin Dagger",
      "canonicalCooldown": "12s",
      "canonicalCooldownMs": 12000,
      "desc": "",
      "balance": {
          "mpCost": 24,
          "pwr": 20,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_blade_rush",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "assassinS1"
      ]
  },
  "path_of_the_assassin": {
      "id": "path_of_the_assassin",
      "name": "Path of the Assassin",
      "slug": "path_of_the_assassin",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Gera Assassin Daggers ao matar (max 5)",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_path_of_the_assassin",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "assassinS1"
      ]
  },
  "assassins_focus": {
      "id": "assassins_focus",
      "name": "Assassin's Focus",
      "slug": "assassins_focus",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+10% Crit Rate, +10% Crit Power",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_assassins_focus",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "assassinS1"
      ]
  },
  "phantom_strike": {
      "id": "phantom_strike",
      "name": "Phantom Strike",
      "slug": "phantom_strike",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano 280% + invoca sombra no local",
      "canonicalCooldown": "16s",
      "canonicalCooldownMs": 16000,
      "desc": "",
      "balance": {
          "mpCost": 34,
          "pwr": 28,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_phantom_strike",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "assassinS2"
      ]
  },
  "lethal_shadow": {
      "id": "lethal_shadow",
      "name": "Lethal Shadow",
      "slug": "lethal_shadow",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano 340% + sombra ataca junto (340%)",
      "canonicalCooldown": "22s",
      "canonicalCooldownMs": 22000,
      "desc": "",
      "balance": {
          "mpCost": 41,
          "pwr": 34,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_lethal_shadow",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "assassinS2"
      ]
  },
  "resolve_to_kill": {
      "id": "resolve_to_kill",
      "name": "Resolve to Kill",
      "slug": "resolve_to_kill",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Ativa Brutality: +40% ATK por 20s (requer 3 Daggers)",
      "canonicalCooldown": "60s",
      "canonicalCooldownMs": 60000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 4,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_resolve_to_kill",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "assassinS2"
      ]
  },
  "chain_kill": {
      "id": "chain_kill",
      "name": "Chain Kill",
      "slug": "chain_kill",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano 260% + reset Assassination CD se matar",
      "canonicalCooldown": "18s",
      "canonicalCooldownMs": 18000,
      "desc": "",
      "balance": {
          "mpCost": 31,
          "pwr": 26,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_chain_kill",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "assassinS2"
      ]
  },
  "assassins_mark": {
      "id": "assassins_mark",
      "name": "Assassin's Mark",
      "slug": "assassins_mark",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Marca alvo: +25% dano contra ele 10s",
      "canonicalCooldown": "25s",
      "canonicalCooldownMs": 25000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_assassins_mark",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "assassinS2"
      ]
  },
  "brutality": {
      "id": "brutality",
      "name": "Brutality",
      "slug": "brutality",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Auto-buff +15% ATK quando tem 5 Daggers",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_brutality",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "assassinS2"
      ]
  },
  "assassins_evasion": {
      "id": "assassins_evasion",
      "name": "Assassin's Evasion",
      "slug": "assassins_evasion",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% EVA, +10% Debuff Resist",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_assassins_evasion",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "assassinS2"
      ]
  },
  "assassin_harmony_stage_2": {
      "id": "assassin_harmony_stage_2",
      "name": "Assassin Harmony (Stage 2)",
      "slug": "assassin_harmony_stage_2",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+35% ATK, +30% Crit, +25% EVA por 25 min",
      "canonicalCooldown": "60 min",
      "canonicalCooldownMs": 3600000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 4,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_assassin_harmony_stage_2",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "assassinS2"
      ]
  },
  "shadow_blast": {
      "id": "shadow_blast",
      "name": "Shadow Blast",
      "slug": "shadow_blast",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0016.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Todas as sombras explodem: dano AoE 450% cada",
      "canonicalCooldown": "35s",
      "canonicalCooldownMs": 35000,
      "desc": "",
      "balance": {
          "mpCost": 54,
          "pwr": 45,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_shadow_blast",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "assassinS3"
      ]
  },
  "transcendent_assassination": {
      "id": "transcendent_assassination",
      "name": "Transcendent Assassination",
      "slug": "transcendent_assassination",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0030.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano 700% + invoca 3 sombras + crit garantido",
      "canonicalCooldown": "180s",
      "canonicalCooldownMs": 180000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 70,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_transcendent_assassination",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "assassinS3"
      ]
  },
  "change_appearance": {
      "id": "change_appearance",
      "name": "Change Appearance",
      "slug": "change_appearance",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Visual exclusivo + invisibilidade 10s",
      "canonicalCooldown": "120s",
      "canonicalCooldownMs": 120000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_change_appearance",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "assassinS3"
      ]
  },
  "master_of_shadows": {
      "id": "master_of_shadows",
      "name": "Master of Shadows",
      "slug": "master_of_shadows",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0430.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+25% ATK, +20% Crit, sombras ganham +50% dano",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_master_of_shadows",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "assassinS3"
      ]
  },
  "assassins_harmony": {
      "id": "assassins_harmony",
      "name": "Assassin's Harmony",
      "slug": "assassins_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+60% ATK, +50% Crit, +40% EVA por 30 min",
      "canonicalCooldown": "90 min",
      "canonicalCooldownMs": 5400000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 6,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_assassins_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "assassinS3"
      ]
  },
  "elven_spirit": {
      "id": "elven_spirit",
      "name": "Elven Spirit",
      "slug": "elven_spirit",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+10% EVA, +10% Speed por 15 min",
      "canonicalCooldown": "30 min",
      "canonicalCooldownMs": 1800000,
      "desc": "Espírito élfico.",
      "balance": {
          "mpCost": 40,
          "pwr": 1,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_elven_spirit",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "elfFighter"
      ]
  },
  "tribunal": {
      "id": "tribunal",
      "name": "Tribunal",
      "slug": "tribunal",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0400.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano 240% + -20% DEF 10s",
      "canonicalCooldown": "20s",
      "canonicalCooldownMs": 20000,
      "desc": "Julgamento do templo.",
      "balance": {
          "mpCost": 29,
          "pwr": 24,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_tribunal",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "templeKnight"
      ]
  },
  "evas_will": {
      "id": "evas_will",
      "name": "Eva's Will",
      "slug": "evas_will",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+30% water resist + cura 15% HP",
      "canonicalCooldown": "45s",
      "canonicalCooldownMs": 45000,
      "desc": "Vontade de Eva.",
      "balance": {
          "mpCost": 5,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_evas_will",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "templeKnight"
      ]
  },
  "summon_life_cubic": {
      "id": "summon_life_cubic",
      "name": "Summon Life Cubic",
      "slug": "summon_life_cubic",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0067.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Cubic que cura 5%/5s",
      "canonicalCooldown": "45s",
      "canonicalCooldownMs": 45000,
      "desc": "Cubic vital.",
      "balance": {
          "mpCost": 5,
          "pwr": 1,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_summon_life_cubic",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "templeKnight",
          "elementalSummoner"
      ]
  },
  "tks_harmony": {
      "id": "tks_harmony",
      "name": "TK's Harmony",
      "slug": "tks_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+35% DEF, +25% HP, +15% EVA 25min",
      "canonicalCooldown": "60 min",
      "canonicalCooldownMs": 3600000,
      "desc": "Harmonia do cavaleiro do templo.",
      "balance": {
          "mpCost": 40,
          "pwr": 4,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_tks_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "templeKnight"
      ]
  },
  "resist_aqua": {
      "id": "resist_aqua",
      "name": "Resist Aqua",
      "slug": "resist_aqua",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill1182.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+10% Water Resist",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Resistência aquática.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_resist_aqua",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "templeKnight",
          "elfElder"
      ]
  },
  "touch_of_eva": {
      "id": "touch_of_eva",
      "name": "Touch of Eva",
      "slug": "touch_of_eva",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Cura AoE 25% HP party + cleanse 1 debuff",
      "canonicalCooldown": "35s",
      "canonicalCooldownMs": 35000,
      "desc": "Toque de Eva.",
      "balance": {
          "mpCost": 5,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_touch_of_eva",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "evaTemplar"
      ]
  },
  "shield_of_eva": {
      "id": "shield_of_eva",
      "name": "Shield of Eva",
      "slug": "shield_of_eva",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Absorve 5000 dano por 15s",
      "canonicalCooldown": "90s",
      "canonicalCooldownMs": 90000,
      "desc": "Escudo de Eva.",
      "balance": {
          "mpCost": 40,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_shield_of_eva",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "evaTemplar"
      ]
  },
  "aqua_strike": {
      "id": "aqua_strike",
      "name": "Aqua Strike",
      "slug": "aqua_strike",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano water 380% + slow 40% 6s",
      "canonicalCooldown": "22s",
      "canonicalCooldownMs": 22000,
      "desc": "Golpe aquático.",
      "balance": {
          "mpCost": 46,
          "pwr": 38,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_aqua_strike",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "evaTemplar",
          "evaSaint"
      ]
  },
  "summon_guardian_agathion": {
      "id": "summon_guardian_agathion",
      "name": "Summon Guardian Agathion",
      "slug": "summon_guardian_agathion",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Invoca agathion protetor (+15% DEF)",
      "canonicalCooldown": "120s",
      "canonicalCooldownMs": 120000,
      "desc": "Agathion guardião.",
      "balance": {
          "mpCost": 40,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_summon_guardian_agathion",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "evaTemplar",
          "shillienTemplar"
      ]
  },
  "evas_templar_harmony": {
      "id": "evas_templar_harmony",
      "name": "Eva's Templar Harmony",
      "slug": "evas_templar_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+55% DEF, +40% HP, +25% M.DEF 30min",
      "canonicalCooldown": "90 min",
      "canonicalCooldownMs": 5400000,
      "desc": "Harmonia suprema.",
      "balance": {
          "mpCost": 40,
          "pwr": 6,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_evas_templar_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "evaTemplar"
      ]
  },
  "evas_templar_spirit": {
      "id": "evas_templar_spirit",
      "name": "Eva's Templar Spirit",
      "slug": "evas_templar_spirit",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% water ATK, +10% Block",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Espírito do templário.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_evas_templar_spirit",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "evaTemplar"
      ]
  },
  "body_of_evas_templar": {
      "id": "body_of_evas_templar",
      "name": "Body of Eva's Templar",
      "slug": "body_of_evas_templar",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% Max HP, +10% DEF",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Corpo do templário.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_body_of_evas_templar",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "evaTemplar"
      ]
  },
  "protection_of_eva": {
      "id": "protection_of_eva",
      "name": "Protection of Eva",
      "slug": "protection_of_eva",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% water resist",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Proteção de Eva.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_protection_of_eva",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "evaTemplar"
      ]
  },
  "evas_help": {
      "id": "evas_help",
      "name": "Eva's Help",
      "slug": "evas_help",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "10% chance ao ser atacado: cura 5% HP",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Ajuda de Eva (trigger).",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_evas_help",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "evaTemplar",
          "evaSaint"
      ]
  },
  "song_of_earth": {
      "id": "song_of_earth",
      "name": "Song of Earth",
      "slug": "song_of_earth",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0264.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+20% DEF por 20 min",
      "canonicalCooldown": "50 min",
      "canonicalCooldownMs": 3000000,
      "desc": "Canção da terra.",
      "balance": {
          "mpCost": 40,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_song_of_earth",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "swordSinger"
      ]
  },
  "song_of_life": {
      "id": "song_of_life",
      "name": "Song of Life",
      "slug": "song_of_life",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0265.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+15% HP Regen por 20 min",
      "canonicalCooldown": "50 min",
      "canonicalCooldownMs": 3000000,
      "desc": "Canção da vida.",
      "balance": {
          "mpCost": 40,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_song_of_life",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "swordSinger"
      ]
  },
  "song_of_water": {
      "id": "song_of_water",
      "name": "Song of Water",
      "slug": "song_of_water",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0266.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+20% Water Resist por 20 min",
      "canonicalCooldown": "50 min",
      "canonicalCooldownMs": 3000000,
      "desc": "Canção da água.",
      "balance": {
          "mpCost": 40,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_song_of_water",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "swordSinger"
      ]
  },
  "song_of_warding": {
      "id": "song_of_warding",
      "name": "Song of Warding",
      "slug": "song_of_warding",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0267.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+20% M.DEF por 20 min",
      "canonicalCooldown": "50 min",
      "canonicalCooldownMs": 3000000,
      "desc": "Canção de proteção.",
      "balance": {
          "mpCost": 40,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_song_of_warding",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "swordSinger"
      ]
  },
  "song_of_wind": {
      "id": "song_of_wind",
      "name": "Song of Wind",
      "slug": "song_of_wind",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0268.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+20% ATK Speed por 20 min",
      "canonicalCooldown": "50 min",
      "canonicalCooldownMs": 3000000,
      "desc": "Canção do vento.",
      "balance": {
          "mpCost": 40,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_song_of_wind",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "swordSinger"
      ]
  },
  "song_of_hunter": {
      "id": "song_of_hunter",
      "name": "Song of Hunter",
      "slug": "song_of_hunter",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0269.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+15% Crit Rate por 20 min",
      "canonicalCooldown": "50 min",
      "canonicalCooldownMs": 3000000,
      "desc": "Canção do caçador.",
      "balance": {
          "mpCost": 40,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_song_of_hunter",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "swordSinger"
      ]
  },
  "song_of_invocation": {
      "id": "song_of_invocation",
      "name": "Song of Invocation",
      "slug": "song_of_invocation",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0270.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+15% MP Regen por 20 min",
      "canonicalCooldown": "50 min",
      "canonicalCooldownMs": 3000000,
      "desc": "Canção da invocação.",
      "balance": {
          "mpCost": 40,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_song_of_invocation",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "swordSinger"
      ]
  },
  "song_of_vitality": {
      "id": "song_of_vitality",
      "name": "Song of Vitality",
      "slug": "song_of_vitality",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0304.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+15% Max HP por 20 min",
      "canonicalCooldown": "50 min",
      "canonicalCooldownMs": 3000000,
      "desc": "Canção da vitalidade.",
      "balance": {
          "mpCost": 40,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_song_of_vitality",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "swordSinger"
      ]
  },
  "song_of_vengeance": {
      "id": "song_of_vengeance",
      "name": "Song of Vengeance",
      "slug": "song_of_vengeance",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0305.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+8% reflect damage por 20 min",
      "canonicalCooldown": "50 min",
      "canonicalCooldownMs": 3000000,
      "desc": "Canção da vingança.",
      "balance": {
          "mpCost": 40,
          "pwr": 1,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_song_of_vengeance",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "swordSinger"
      ]
  },
  "song_of_flame_guard": {
      "id": "song_of_flame_guard",
      "name": "Song of Flame Guard",
      "slug": "song_of_flame_guard",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0306.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+20% Fire Resist por 20 min",
      "canonicalCooldown": "50 min",
      "canonicalCooldownMs": 3000000,
      "desc": "Canção da chama.",
      "balance": {
          "mpCost": 40,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_song_of_flame_guard",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "swordSinger"
      ]
  },
  "song_of_champion": {
      "id": "song_of_champion",
      "name": "Song of Champion",
      "slug": "song_of_champion",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0364.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+20% ATK por 20 min",
      "canonicalCooldown": "50 min",
      "canonicalCooldownMs": 3000000,
      "desc": "Canção do campeão.",
      "balance": {
          "mpCost": 40,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_song_of_champion",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "swordSinger"
      ]
  },
  "song_of_renewal": {
      "id": "song_of_renewal",
      "name": "Song of Renewal",
      "slug": "song_of_renewal",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0349.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+10% HP+MP Regen por 20 min",
      "canonicalCooldown": "50 min",
      "canonicalCooldownMs": 3000000,
      "desc": "Canção da renovação.",
      "balance": {
          "mpCost": 40,
          "pwr": 1,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_song_of_renewal",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "swordSinger"
      ]
  },
  "sss_harmony": {
      "id": "sss_harmony",
      "name": "SS's Harmony",
      "slug": "sss_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+30% ATK, +20% DEF, +15% Speed 25min",
      "canonicalCooldown": "60 min",
      "canonicalCooldownMs": 3600000,
      "desc": "Harmonia do bardo.",
      "balance": {
          "mpCost": 40,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_sss_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "swordSinger",
          "spellsinger"
      ]
  },
  "song_of_purification": {
      "id": "song_of_purification",
      "name": "Song of Purification",
      "slug": "song_of_purification",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+25% Debuff Resist por 20 min",
      "canonicalCooldown": "50 min",
      "canonicalCooldownMs": 3000000,
      "desc": "Canção de purificação.",
      "balance": {
          "mpCost": 40,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_song_of_purification",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "swordMuse"
      ]
  },
  "song_of_elemental": {
      "id": "song_of_elemental",
      "name": "Song of Elemental",
      "slug": "song_of_elemental",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+20% all elemental ATK por 20 min",
      "canonicalCooldown": "50 min",
      "canonicalCooldownMs": 3000000,
      "desc": "Canção elemental.",
      "balance": {
          "mpCost": 40,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_song_of_elemental",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "swordMuse"
      ]
  },
  "song_of_storm_guard": {
      "id": "song_of_storm_guard",
      "name": "Song of Storm Guard",
      "slug": "song_of_storm_guard",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0308.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+20% Wind Resist por 20 min",
      "canonicalCooldown": "50 min",
      "canonicalCooldownMs": 3000000,
      "desc": "Canção da tempestade.",
      "balance": {
          "mpCost": 40,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_song_of_storm_guard",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "swordMuse"
      ]
  },
  "mass_song": {
      "id": "mass_song",
      "name": "Mass Song",
      "slug": "mass_song",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Aplica todas Songs na party 8 min",
      "canonicalCooldown": "60 min",
      "canonicalCooldownMs": 3600000,
      "desc": "Canção em massa.",
      "balance": {
          "mpCost": 40,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_mass_song",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "swordMuse"
      ]
  },
  "final_song": {
      "id": "final_song",
      "name": "Final Song",
      "slug": "final_song",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Party +50% all stats por 20s",
      "canonicalCooldown": "300s",
      "canonicalCooldownMs": 300000,
      "desc": "Canção final — buff supremo.",
      "balance": {
          "mpCost": 40,
          "pwr": 5,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_final_song",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "swordMuse"
      ]
  },
  "sonic_slash": {
      "id": "sonic_slash",
      "name": "Sonic Slash",
      "slug": "sonic_slash",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano 380% + AoE 5 alvos",
      "canonicalCooldown": "20s",
      "canonicalCooldownMs": 20000,
      "desc": "Corte sônico.",
      "balance": {
          "mpCost": 46,
          "pwr": 38,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_sonic_slash",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "swordMuse"
      ]
  },
  "melody_strike": {
      "id": "melody_strike",
      "name": "Melody Strike",
      "slug": "melody_strike",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano 350% + stun 2s",
      "canonicalCooldown": "18s",
      "canonicalCooldownMs": 18000,
      "desc": "Golpe melódico.",
      "balance": {
          "mpCost": 42,
          "pwr": 35,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_melody_strike",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "swordMuse"
      ]
  },
  "transcendent_melody": {
      "id": "transcendent_melody",
      "name": "Transcendent Melody",
      "slug": "transcendent_melody",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano AoE 550% + all songs refreshed",
      "canonicalCooldown": "180s",
      "canonicalCooldownMs": 180000,
      "desc": "Melodia transcendente.",
      "balance": {
          "mpCost": 40,
          "pwr": 55,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_transcendent_melody",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "swordMuse"
      ]
  },
  "sword_muse_harmony": {
      "id": "sword_muse_harmony",
      "name": "Sword Muse Harmony",
      "slug": "sword_muse_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+50% ATK, +40% DEF, +30% Song Power 30min",
      "canonicalCooldown": "90 min",
      "canonicalCooldownMs": 5400000,
      "desc": "Harmonia da musa.",
      "balance": {
          "mpCost": 40,
          "pwr": 5,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_sword_muse_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "swordMuse"
      ]
  },
  "sword_muse_spirit": {
      "id": "sword_muse_spirit",
      "name": "Sword Muse Spirit",
      "slug": "sword_muse_spirit",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% Song effectiveness",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Espírito da musa.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_sword_muse_spirit",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "swordMuse"
      ]
  },
  "body_of_sword_muse": {
      "id": "body_of_sword_muse",
      "name": "Body of Sword Muse",
      "slug": "body_of_sword_muse",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+10% Max HP, +10% Max MP",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Corpo da musa.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_body_of_sword_muse",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "swordMuse"
      ]
  },
  "pws_harmony": {
      "id": "pws_harmony",
      "name": "PW's Harmony",
      "slug": "pws_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+35% Crit, +25% EVA, +20% ATK 25min",
      "canonicalCooldown": "60 min",
      "canonicalCooldownMs": 3600000,
      "desc": "Harmonia do caminhante.",
      "balance": {
          "mpCost": 40,
          "pwr": 4,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_pws_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "plainsWalker"
      ]
  },
  "wind_rider_harmony": {
      "id": "wind_rider_harmony",
      "name": "Wind Rider Harmony",
      "slug": "wind_rider_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+55% Crit, +45% EVA, +35% ATK 30min",
      "canonicalCooldown": "90 min",
      "canonicalCooldownMs": 5400000,
      "desc": "Harmonia suprema.",
      "balance": {
          "mpCost": 40,
          "pwr": 6,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_wind_rider_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "windRider"
      ]
  },
  "wind_rider_spirit": {
      "id": "wind_rider_spirit",
      "name": "Wind Rider Spirit",
      "slug": "wind_rider_spirit",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+12% dagger ATK",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Espírito do cavaleiro do vento.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_wind_rider_spirit",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "windRider"
      ]
  },
  "body_of_wind_rider": {
      "id": "body_of_wind_rider",
      "name": "Body of Wind Rider",
      "slug": "body_of_wind_rider",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+10% Max HP, +8% EVA",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Corpo do vento.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_body_of_wind_rider",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "windRider"
      ]
  },
  "srs_harmony": {
      "id": "srs_harmony",
      "name": "SR's Harmony",
      "slug": "srs_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+35% ATK, +25% Crit, +15% Range 25min",
      "canonicalCooldown": "60 min",
      "canonicalCooldownMs": 3600000,
      "desc": "Harmonia do ranger.",
      "balance": {
          "mpCost": 40,
          "pwr": 4,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_srs_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "silverRanger"
      ]
  },
  "ice_arrow_rain": {
      "id": "ice_arrow_rain",
      "name": "Ice Arrow Rain",
      "slug": "ice_arrow_rain",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "AoE GELO 380% (10 alvos) + freeze",
      "canonicalCooldown": "28s",
      "canonicalCooldownMs": 28000,
      "desc": "Condensa o ar em volta das flechas congelando-as.",
      "balance": {
          "mpCost": 46,
          "pwr": 38,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_ice_arrow_rain",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "moonlightSentinel"
      ]
  },
  "moonlight_harmony": {
      "id": "moonlight_harmony",
      "name": "Moonlight Harmony",
      "slug": "moonlight_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+60% ATK, +50% Crit, +40% Range 30min",
      "canonicalCooldown": "90 min",
      "canonicalCooldownMs": 5400000,
      "desc": "Harmonia do luar.",
      "balance": {
          "mpCost": 40,
          "pwr": 6,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_moonlight_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "moonlightSentinel"
      ]
  },
  "moonlight_sentinel_spirit": {
      "id": "moonlight_sentinel_spirit",
      "name": "Moonlight Sentinel Spirit",
      "slug": "moonlight_sentinel_spirit",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% Bow ATK",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Espírito do sentinela.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_moonlight_sentinel_spirit",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "moonlightSentinel"
      ]
  },
  "body_of_moonlight_sentinel": {
      "id": "body_of_moonlight_sentinel",
      "name": "Body of Moonlight Sentinel",
      "slug": "body_of_moonlight_sentinel",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+10% Max HP, +8% EVA",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Corpo do sentinela.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_body_of_moonlight_sentinel",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "moonlightSentinel"
      ]
  },
  "elemental_symphony": {
      "id": "elemental_symphony",
      "name": "Elemental Symphony",
      "slug": "elemental_symphony",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill1293.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano multi-element 380%",
      "canonicalCooldown": "24s",
      "canonicalCooldownMs": 24000,
      "desc": "Sinfonia elemental.",
      "balance": {
          "mpCost": 46,
          "pwr": 38,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_elemental_symphony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "spellsinger"
      ]
  },
  "aqua_splash": {
      "id": "aqua_splash",
      "name": "Aqua Splash",
      "slug": "aqua_splash",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill1295.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano water 420% + AoE splash",
      "canonicalCooldown": "22s",
      "canonicalCooldownMs": 22000,
      "desc": "Respingo aquático massivo.",
      "balance": {
          "mpCost": 50,
          "pwr": 42,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_aqua_splash",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "mysticMuse"
      ]
  },
  "water_spiral": {
      "id": "water_spiral",
      "name": "Water Spiral",
      "slug": "water_spiral",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano water 400% + penetra alvos",
      "canonicalCooldown": "20s",
      "canonicalCooldownMs": 20000,
      "desc": "Espiral de água perfurante.",
      "balance": {
          "mpCost": 48,
          "pwr": 40,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_water_spiral",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "mysticMuse"
      ]
  },
  "aqua_explosion": {
      "id": "aqua_explosion",
      "name": "Aqua Explosion",
      "slug": "aqua_explosion",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano water AoE 680% + freeze 4s",
      "canonicalCooldown": "160s",
      "canonicalCooldownMs": 160000,
      "desc": "EXPLOSÃO AQUÁTICA — devastação total.",
      "balance": {
          "mpCost": 40,
          "pwr": 68,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_aqua_explosion",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "mysticMuse"
      ]
  },
  "seed_of_water": {
      "id": "seed_of_water",
      "name": "Seed of Water",
      "slug": "seed_of_water",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1286.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Planta semente: explode 300% água após 5s",
      "canonicalCooldown": "20s",
      "canonicalCooldownMs": 20000,
      "desc": "Semente de água.",
      "balance": {
          "mpCost": 36,
          "pwr": 30,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_seed_of_water",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "mysticMuse"
      ]
  },
  "transcendent_aqua_explosion": {
      "id": "transcendent_aqua_explosion",
      "name": "Transcendent Aqua Explosion",
      "slug": "transcendent_aqua_explosion",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano water 850% + freeze 6s + AoE",
      "canonicalCooldown": "200s",
      "canonicalCooldownMs": 200000,
      "desc": "Explosão aquática transcendente.",
      "balance": {
          "mpCost": 40,
          "pwr": 85,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_transcendent_aqua_explosion",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "mysticMuse"
      ]
  },
  "mystic_muse_harmony": {
      "id": "mystic_muse_harmony",
      "name": "Mystic Muse Harmony",
      "slug": "mystic_muse_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+55% M.ATK, +35% Cast Speed, +20% MP 30min",
      "canonicalCooldown": "90 min",
      "canonicalCooldownMs": 5400000,
      "desc": "Harmonia da musa.",
      "balance": {
          "mpCost": 40,
          "pwr": 6,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_mystic_muse_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "mysticMuse"
      ]
  },
  "mystic_muse_spirit": {
      "id": "mystic_muse_spirit",
      "name": "Mystic Muse Spirit",
      "slug": "mystic_muse_spirit",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% water magic ATK",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Espírito da musa.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_mystic_muse_spirit",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "mysticMuse"
      ]
  },
  "body_of_the_mystic_muse": {
      "id": "body_of_the_mystic_muse",
      "name": "Body of the Mystic Muse",
      "slug": "body_of_the_mystic_muse",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+10% Max MP, +8% M.DEF",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Corpo da musa.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_body_of_the_mystic_muse",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "mysticMuse"
      ]
  },
  "summon_unicorn_boxer": {
      "id": "summon_unicorn_boxer",
      "name": "Summon Unicorn Boxer",
      "slug": "summon_unicorn_boxer",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Invoca unicórnio fighter (ATK 50%)",
      "canonicalCooldown": "60s",
      "canonicalCooldownMs": 60000,
      "desc": "Unicórnio lutador.",
      "balance": {
          "mpCost": 6,
          "pwr": 5,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_summon_unicorn_boxer",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "elementalSummoner"
      ]
  },
  "summon_unicorn_mirage": {
      "id": "summon_unicorn_mirage",
      "name": "Summon Unicorn Mirage",
      "slug": "summon_unicorn_mirage",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Invoca unicórnio mago (M.ATK 50%)",
      "canonicalCooldown": "60s",
      "canonicalCooldownMs": 60000,
      "desc": "Unicórnio ilusório.",
      "balance": {
          "mpCost": 6,
          "pwr": 5,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_summon_unicorn_mirage",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "elementalSummoner"
      ]
  },
  "summon_unicorn_merrow": {
      "id": "summon_unicorn_merrow",
      "name": "Summon Unicorn Merrow",
      "slug": "summon_unicorn_merrow",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Invoca merrow (ATK 65%, tank)",
      "canonicalCooldown": "90s",
      "canonicalCooldownMs": 90000,
      "desc": "Merrow aquático.",
      "balance": {
          "mpCost": 40,
          "pwr": 7,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_summon_unicorn_merrow",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "elementalSummoner"
      ]
  },
  "ess_harmony": {
      "id": "ess_harmony",
      "name": "ES's Harmony",
      "slug": "ess_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+30% M.ATK, +25% Summon ATK 25min",
      "canonicalCooldown": "60 min",
      "canonicalCooldownMs": 3600000,
      "desc": "Harmonia do invocador.",
      "balance": {
          "mpCost": 40,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_ess_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "elementalSummoner"
      ]
  },
  "summon_seraphim": {
      "id": "summon_seraphim",
      "name": "Summon Seraphim",
      "slug": "summon_seraphim",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Invoca Serafim (cura+suporte 60%)",
      "canonicalCooldown": "90s",
      "canonicalCooldownMs": 90000,
      "desc": "Serafim celestial.",
      "balance": {
          "mpCost": 40,
          "pwr": 6,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_summon_seraphim",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "elementalMaster"
      ]
  },
  "elemental_master_harmony": {
      "id": "elemental_master_harmony",
      "name": "Elemental Master Harmony",
      "slug": "elemental_master_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+50% M.ATK, +60% Summon Power 30min",
      "canonicalCooldown": "90 min",
      "canonicalCooldownMs": 5400000,
      "desc": "Harmonia suprema.",
      "balance": {
          "mpCost": 40,
          "pwr": 5,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_elemental_master_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "elementalMaster"
      ]
  },
  "unicorns_friendship": {
      "id": "unicorns_friendship",
      "name": "Unicorn's Friendship",
      "slug": "unicorns_friendship",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+20% Summon ATK/DEF",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Amizade dos unicórnios.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_unicorns_friendship",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "elementalMaster"
      ]
  },
  "elemental_concentration": {
      "id": "elemental_concentration",
      "name": "Elemental Concentration",
      "slug": "elemental_concentration",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+10% M.ATK, +10% Summon HP",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Concentração elemental.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_elemental_concentration",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "elementalMaster"
      ]
  },
  "elemental_master_spirit": {
      "id": "elemental_master_spirit",
      "name": "Elemental Master Spirit",
      "slug": "elemental_master_spirit",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+12% M.ATK, +8% Summon Speed",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Espírito do mestre elemental.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_elemental_master_spirit",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "elementalMaster"
      ]
  },
  "body_of_the_elemental_master": {
      "id": "body_of_the_elemental_master",
      "name": "Body of the Elemental Master",
      "slug": "body_of_the_elemental_master",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+10% Max MP, +8% Max HP",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Corpo do mestre.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_body_of_the_elemental_master",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "elementalMaster"
      ]
  },
  "clarity": {
      "id": "clarity",
      "name": "Clarity",
      "slug": "clarity",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1397.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+20% MP Regen por 20 min",
      "canonicalCooldown": "50 min",
      "canonicalCooldownMs": 3000000,
      "desc": "Clareza mágica.",
      "balance": {
          "mpCost": 40,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_clarity",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "elfElder"
      ]
  },
  "elders_harmony": {
      "id": "elders_harmony",
      "name": "Elder's Harmony",
      "slug": "elders_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+35% Heal, +25% M.ATK 25min",
      "canonicalCooldown": "60 min",
      "canonicalCooldownMs": 3600000,
      "desc": "Harmonia do ancião.",
      "balance": {
          "mpCost": 40,
          "pwr": 4,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_elders_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "elfElder"
      ]
  },
  "evas_saint_harmony": {
      "id": "evas_saint_harmony",
      "name": "Eva's Saint Harmony",
      "slug": "evas_saint_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+55% Heal, +40% M.ATK, +30% M.DEF 30min",
      "canonicalCooldown": "90 min",
      "canonicalCooldownMs": 5400000,
      "desc": "Harmonia suprema.",
      "balance": {
          "mpCost": 40,
          "pwr": 6,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_evas_saint_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "evaSaint"
      ]
  },
  "evas_saint_spirit": {
      "id": "evas_saint_spirit",
      "name": "Eva's Saint Spirit",
      "slug": "evas_saint_spirit",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+12% holy magic ATK",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Espírito da santa.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_evas_saint_spirit",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "evaSaint"
      ]
  },
  "body_of_evas_saint": {
      "id": "body_of_evas_saint",
      "name": "Body of Eva's Saint",
      "slug": "body_of_evas_saint",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+12% Max MP, +10% M.DEF",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "Corpo da santa.",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_body_of_evas_saint",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "evaSaint"
      ]
  },
  "hp_increase": {
      "id": "hp_increase",
      "name": "HP Increase",
      "slug": "hp_increase",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0211.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+10% Max HP",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_hp_increase",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "darkElfFighter",
          "orcFighter",
          "dwarfFighter"
      ]
  },
  "dark_spirit": {
      "id": "dark_spirit",
      "name": "Dark Spirit",
      "slug": "dark_spirit",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+10% ATK e +8% Crit por 15 min",
      "canonicalCooldown": "30 min",
      "canonicalCooldownMs": 1800000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 1,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_dark_spirit",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "darkElfFighter"
      ]
  },
  "lightning_strike": {
      "id": "lightning_strike",
      "name": "Lightning Strike",
      "slug": "lightning_strike",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0279.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano elétrico 240% + stun 1s",
      "canonicalCooldown": "16s",
      "canonicalCooldownMs": 16000,
      "desc": "",
      "balance": {
          "mpCost": 29,
          "pwr": 24,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_lightning_strike",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "shillienKnight"
      ]
  },
  "summon_dark_cubic": {
      "id": "summon_dark_cubic",
      "name": "Summon Dark Cubic",
      "slug": "summon_dark_cubic",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Cubo dark que ataca 130%/6s",
      "canonicalCooldown": "45s",
      "canonicalCooldownMs": 45000,
      "desc": "",
      "balance": {
          "mpCost": 16,
          "pwr": 13,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_summon_dark_cubic",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "shillienKnight"
      ]
  },
  "shillien_knights_harmony": {
      "id": "shillien_knights_harmony",
      "name": "Shillien Knight's Harmony",
      "slug": "shillien_knights_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+35% DEF, +25% ATK, +20% Dark Damage por 25 min",
      "canonicalCooldown": "60 min",
      "canonicalCooldownMs": 3600000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 4,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_shillien_knights_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "shillienKnight"
      ]
  },
  "touch_of_shillien": {
      "id": "touch_of_shillien",
      "name": "Touch of Shillien",
      "slug": "touch_of_shillien",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano dark 350% + drain 35% HP",
      "canonicalCooldown": "25s",
      "canonicalCooldownMs": 25000,
      "desc": "",
      "balance": {
          "mpCost": 42,
          "pwr": 35,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_touch_of_shillien",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "shillienTemplar"
      ]
  },
  "shield_of_shillien": {
      "id": "shield_of_shillien",
      "name": "Shield of Shillien",
      "slug": "shield_of_shillien",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Absorve 5000 dano + reflete 20% dark por 15s",
      "canonicalCooldown": "60s",
      "canonicalCooldownMs": 60000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_shield_of_shillien",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "shillienTemplar"
      ]
  },
  "abyss_strike": {
      "id": "abyss_strike",
      "name": "Abyss Strike",
      "slug": "abyss_strike",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano dark AoE 400% + slow 40%",
      "canonicalCooldown": "25s",
      "canonicalCooldownMs": 25000,
      "desc": "",
      "balance": {
          "mpCost": 48,
          "pwr": 40,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_abyss_strike",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "shillienTemplar"
      ]
  },
  "shilliens_curse": {
      "id": "shilliens_curse",
      "name": "Shillien's Curse",
      "slug": "shilliens_curse",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano dark AoE 360% + reduz DEF 20%",
      "canonicalCooldown": "28s",
      "canonicalCooldownMs": 28000,
      "desc": "",
      "balance": {
          "mpCost": 43,
          "pwr": 36,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_shilliens_curse",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "shillienTemplar"
      ]
  },
  "transcendent_abyss_strike": {
      "id": "transcendent_abyss_strike",
      "name": "Transcendent Abyss Strike",
      "slug": "transcendent_abyss_strike",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano dark AoE 600% + fear 3s + drain 30%",
      "canonicalCooldown": "160s",
      "canonicalCooldownMs": 160000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 60,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_transcendent_abyss_strike",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "shillienTemplar"
      ]
  },
  "shilliens_help": {
      "id": "shilliens_help",
      "name": "Shillien's Help",
      "slug": "shilliens_help",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Ao bloquear: 20% chance contra-ataque dark 200%",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_shilliens_help",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "shillienTemplar",
          "shillienSaint"
      ]
  },
  "shillien_templar_spirit": {
      "id": "shillien_templar_spirit",
      "name": "Shillien Templar Spirit",
      "slug": "shillien_templar_spirit",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+25% DEF, +20% Max HP, +15% Dark Damage",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_shillien_templar_spirit",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "shillienTemplar"
      ]
  },
  "body_of_shillien_templar": {
      "id": "body_of_shillien_templar",
      "name": "Body of Shillien Templar",
      "slug": "body_of_shillien_templar",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+20% Dark Resist, +15% HP Regen",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_body_of_shillien_templar",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "shillienTemplar"
      ]
  },
  "protection_of_shillien": {
      "id": "protection_of_shillien",
      "name": "Protection of Shillien",
      "slug": "protection_of_shillien",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% All Resist",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_protection_of_shillien",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "shillienTemplar"
      ]
  },
  "shillien_templar_harmony": {
      "id": "shillien_templar_harmony",
      "name": "Shillien Templar Harmony",
      "slug": "shillien_templar_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+55% DEF, +40% Max HP, +30% Dark Damage por 30 min",
      "canonicalCooldown": "90 min",
      "canonicalCooldownMs": 5400000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 6,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_shillien_templar_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "shillienTemplar"
      ]
  },
  "dance_of_fire": {
      "id": "dance_of_fire",
      "name": "Dance of Fire",
      "slug": "dance_of_fire",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+20% ATK para o grupo",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_dance_of_fire",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "bladeDancer"
      ]
  },
  "dance_of_fury": {
      "id": "dance_of_fury",
      "name": "Dance of Fury",
      "slug": "dance_of_fury",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0275.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+20% ATK Speed para o grupo",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_dance_of_fury",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "bladeDancer"
      ]
  },
  "dance_of_concentration": {
      "id": "dance_of_concentration",
      "name": "Dance of Concentration",
      "slug": "dance_of_concentration",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0276.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+20% Cast Speed para o grupo",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_dance_of_concentration",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "bladeDancer"
      ]
  },
  "dance_of_light": {
      "id": "dance_of_light",
      "name": "Dance of Light",
      "slug": "dance_of_light",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0277.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+15% Crit Rate para o grupo",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_dance_of_light",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "bladeDancer"
      ]
  },
  "dance_of_mystic": {
      "id": "dance_of_mystic",
      "name": "Dance of Mystic",
      "slug": "dance_of_mystic",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0273.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+20% M.ATK para o grupo",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_dance_of_mystic",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "bladeDancer"
      ]
  },
  "dance_of_warrior": {
      "id": "dance_of_warrior",
      "name": "Dance of Warrior",
      "slug": "dance_of_warrior",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0271.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+15% P.ATK e DEF para o grupo",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_dance_of_warrior",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "bladeDancer"
      ]
  },
  "dance_of_aqua_guard": {
      "id": "dance_of_aqua_guard",
      "name": "Dance of Aqua Guard",
      "slug": "dance_of_aqua_guard",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0307.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+20% Water Resist para o grupo",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_dance_of_aqua_guard",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "bladeDancer"
      ]
  },
  "dance_of_inspiration": {
      "id": "dance_of_inspiration",
      "name": "Dance of Inspiration",
      "slug": "dance_of_inspiration",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0272.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+15% All Stats para o grupo",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_dance_of_inspiration",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "bladeDancer"
      ]
  },
  "dance_of_vampire": {
      "id": "dance_of_vampire",
      "name": "Dance of Vampire",
      "slug": "dance_of_vampire",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0310.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Drain 8% dano causado como HP para o grupo",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 1,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_dance_of_vampire",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "bladeDancer"
      ]
  },
  "dance_of_protection": {
      "id": "dance_of_protection",
      "name": "Dance of Protection",
      "slug": "dance_of_protection",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0311.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+15% DEF para o grupo",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_dance_of_protection",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "bladeDancer"
      ]
  },
  "dance_of_shadow": {
      "id": "dance_of_shadow",
      "name": "Dance of Shadow",
      "slug": "dance_of_shadow",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% EVA para o grupo",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_dance_of_shadow",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "bladeDancer"
      ]
  },
  "dance_of_siren": {
      "id": "dance_of_siren",
      "name": "Dance of Siren",
      "slug": "dance_of_siren",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0365.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+20% MP Regen para o grupo",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_dance_of_siren",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "bladeDancer"
      ]
  },
  "blade_dancers_harmony": {
      "id": "blade_dancers_harmony",
      "name": "Blade Dancer's Harmony",
      "slug": "blade_dancers_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+30% ATK, +20% ATK Speed, +15% EVA por 25 min",
      "canonicalCooldown": "60 min",
      "canonicalCooldownMs": 3600000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_blade_dancers_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "bladeDancer"
      ]
  },
  "dance_of_berserker": {
      "id": "dance_of_berserker",
      "name": "Dance of Berserker",
      "slug": "dance_of_berserker",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+25% ATK, +20% ATK Speed, -10% DEF para o grupo",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_dance_of_berserker",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "spectralDancer"
      ]
  },
  "dance_of_blade_storm": {
      "id": "dance_of_blade_storm",
      "name": "Dance of Blade Storm",
      "slug": "dance_of_blade_storm",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+20% Crit Power para o grupo",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_dance_of_blade_storm",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "spectralDancer"
      ]
  },
  "mass_dance": {
      "id": "mass_dance",
      "name": "Mass Dance",
      "slug": "mass_dance",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Ativa todas as danças ativas por 60s",
      "canonicalCooldown": "120s",
      "canonicalCooldownMs": 120000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_mass_dance",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "spectralDancer"
      ]
  },
  "final_dance": {
      "id": "final_dance",
      "name": "Final Dance",
      "slug": "final_dance",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Todas as danças em potência máxima por 30s + imunidade debuff",
      "canonicalCooldown": "300s",
      "canonicalCooldownMs": 300000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_final_dance",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "spectralDancer"
      ]
  },
  "shadow_slash": {
      "id": "shadow_slash",
      "name": "Shadow Slash",
      "slug": "shadow_slash",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano dark 380% + bleed 6s",
      "canonicalCooldown": "18s",
      "canonicalCooldownMs": 18000,
      "desc": "",
      "balance": {
          "mpCost": 46,
          "pwr": 38,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_shadow_slash",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "spectralDancer"
      ]
  },
  "dark_dance_strike": {
      "id": "dark_dance_strike",
      "name": "Dark Dance Strike",
      "slug": "dark_dance_strike",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano AoE dark 420% + slow 40% 5s",
      "canonicalCooldown": "25s",
      "canonicalCooldownMs": 25000,
      "desc": "",
      "balance": {
          "mpCost": 50,
          "pwr": 42,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_dark_dance_strike",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "spectralDancer"
      ]
  },
  "transcendent_dance": {
      "id": "transcendent_dance",
      "name": "Transcendent Dance",
      "slug": "transcendent_dance",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano AoE dark 580% + silence 4s",
      "canonicalCooldown": "160s",
      "canonicalCooldownMs": 160000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 58,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_transcendent_dance",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "spectralDancer"
      ]
  },
  "spectral_dancer_spirit": {
      "id": "spectral_dancer_spirit",
      "name": "Spectral Dancer Spirit",
      "slug": "spectral_dancer_spirit",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+20% ATK, +15% EVA, +15% Dark Damage",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_spectral_dancer_spirit",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "spectralDancer"
      ]
  },
  "body_of_spectral_dancer": {
      "id": "body_of_spectral_dancer",
      "name": "Body of Spectral Dancer",
      "slug": "body_of_spectral_dancer",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% Crit Rate, +10% HP Regen",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_body_of_spectral_dancer",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "spectralDancer"
      ]
  },
  "spectral_dancer_harmony": {
      "id": "spectral_dancer_harmony",
      "name": "Spectral Dancer Harmony",
      "slug": "spectral_dancer_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+50% ATK, +35% ATK Speed, +30% EVA por 30 min",
      "canonicalCooldown": "90 min",
      "canonicalCooldownMs": 5400000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 5,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_spectral_dancer_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "spectralDancer"
      ]
  },
  "double_strike": {
      "id": "double_strike",
      "name": "Double Strike",
      "slug": "double_strike",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano duplo 170% (2 hits)",
      "canonicalCooldown": "10s",
      "canonicalCooldownMs": 10000,
      "desc": "",
      "balance": {
          "mpCost": 20,
          "pwr": 17,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_double_strike",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "assassinDE"
      ]
  },
  "silent_move": {
      "id": "silent_move",
      "name": "Silent Move",
      "slug": "silent_move",
      "type": "toggle",
      "rawType": "Toggle",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0221.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Invisibilidade (move lento), cancela ao atacar",
      "canonicalCooldown": "5s",
      "canonicalCooldownMs": 5000,
      "desc": "",
      "balance": {
          "mpCost": 2,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_silent_move",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "abyssWalker"
      ]
  },
  "abyss_walkers_harmony": {
      "id": "abyss_walkers_harmony",
      "name": "Abyss Walker's Harmony",
      "slug": "abyss_walkers_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+35% ATK, +25% Crit, +20% EVA por 25 min",
      "canonicalCooldown": "60 min",
      "canonicalCooldownMs": 3600000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 4,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_abyss_walkers_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "abyssWalker"
      ]
  },
  "ghost_hunter_spirit": {
      "id": "ghost_hunter_spirit",
      "name": "Ghost Hunter Spirit",
      "slug": "ghost_hunter_spirit",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+20% ATK, +20% Crit Power, +15% EVA",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_ghost_hunter_spirit",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "ghostHunter"
      ]
  },
  "body_of_ghost_hunter": {
      "id": "body_of_ghost_hunter",
      "name": "Body of Ghost Hunter",
      "slug": "body_of_ghost_hunter",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% Max HP, +10% HP Regen",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_body_of_ghost_hunter",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "ghostHunter"
      ]
  },
  "ghost_hunter_harmony": {
      "id": "ghost_hunter_harmony",
      "name": "Ghost Hunter Harmony",
      "slug": "ghost_hunter_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+55% ATK, +45% Crit, +35% EVA por 30 min",
      "canonicalCooldown": "90 min",
      "canonicalCooldownMs": 5400000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 6,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_ghost_hunter_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "ghostHunter"
      ]
  },
  "hex_shot": {
      "id": "hex_shot",
      "name": "Hex Shot",
      "slug": "hex_shot",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano 220% + curse (reduz DEF 20%)",
      "canonicalCooldown": "16s",
      "canonicalCooldownMs": 16000,
      "desc": "",
      "balance": {
          "mpCost": 26,
          "pwr": 22,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_hex_shot",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "phantomRanger"
      ]
  },
  "phantom_rangers_harmony": {
      "id": "phantom_rangers_harmony",
      "name": "Phantom Ranger's Harmony",
      "slug": "phantom_rangers_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+35% ATK, +25% Crit, +20% Range por 25 min",
      "canonicalCooldown": "60 min",
      "canonicalCooldownMs": 3600000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 4,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_phantom_rangers_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "phantomRanger"
      ]
  },
  "ghost_sentinel_spirit": {
      "id": "ghost_sentinel_spirit",
      "name": "Ghost Sentinel Spirit",
      "slug": "ghost_sentinel_spirit",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+20% ATK, +20% Crit Power, +15% Range",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_ghost_sentinel_spirit",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "ghostSentinel"
      ]
  },
  "body_of_ghost_sentinel": {
      "id": "body_of_ghost_sentinel",
      "name": "Body of Ghost Sentinel",
      "slug": "body_of_ghost_sentinel",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% Max HP, +10% EVA",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_body_of_ghost_sentinel",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "ghostSentinel"
      ]
  },
  "ghost_sentinel_harmony": {
      "id": "ghost_sentinel_harmony",
      "name": "Ghost Sentinel Harmony",
      "slug": "ghost_sentinel_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+55% ATK, +45% Crit, +35% Range por 30 min",
      "canonicalCooldown": "90 min",
      "canonicalCooldownMs": 5400000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 6,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_ghost_sentinel_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "ghostSentinel"
      ]
  },
  "dark_mages_will": {
      "id": "dark_mages_will",
      "name": "Dark Mage's Will",
      "slug": "dark_mages_will",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+10% M.ATK e +8% Cast Speed por 15 min",
      "canonicalCooldown": "30 min",
      "canonicalCooldownMs": 1800000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 1,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_dark_mages_will",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "darkElfMage"
      ]
  },
  "dark_wizards_harmony": {
      "id": "dark_wizards_harmony",
      "name": "Dark Wizard's Harmony",
      "slug": "dark_wizards_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+20% M.ATK, +15% Cast Speed por 20 min",
      "canonicalCooldown": "50 min",
      "canonicalCooldownMs": 3000000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_dark_wizards_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "darkWizard"
      ]
  },
  "spellhowlers_harmony": {
      "id": "spellhowlers_harmony",
      "name": "Spellhowler's Harmony",
      "slug": "spellhowlers_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+35% M.ATK, +25% Cast Speed, +15% Wind Damage por 25 min",
      "canonicalCooldown": "60 min",
      "canonicalCooldownMs": 3600000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 4,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_spellhowlers_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "spellhowler"
      ]
  },
  "demon_wind": {
      "id": "demon_wind",
      "name": "Demon Wind",
      "slug": "demon_wind",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill1291.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano vento 400% + knockback",
      "canonicalCooldown": "28s",
      "canonicalCooldownMs": 28000,
      "desc": "",
      "balance": {
          "mpCost": 48,
          "pwr": 40,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_demon_wind",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "stormScreamer"
      ]
  },
  "seed_of_wind": {
      "id": "seed_of_wind",
      "name": "Seed of Wind",
      "slug": "seed_of_wind",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill1287.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Marca alvo: +25% Wind Damage recebido 10s",
      "canonicalCooldown": "20s",
      "canonicalCooldownMs": 20000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_seed_of_wind",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "stormScreamer"
      ]
  },
  "wind_spiral": {
      "id": "wind_spiral",
      "name": "Wind Spiral",
      "slug": "wind_spiral",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano vento 360% + penetra alvos em linha",
      "canonicalCooldown": "22s",
      "canonicalCooldownMs": 22000,
      "desc": "",
      "balance": {
          "mpCost": 43,
          "pwr": 36,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_wind_spiral",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "stormScreamer"
      ]
  },
  "thunder_explosion": {
      "id": "thunder_explosion",
      "name": "Thunder Explosion",
      "slug": "thunder_explosion",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano trovão AoE 520% (2 hits) + stun 2s",
      "canonicalCooldown": "35s",
      "canonicalCooldownMs": 35000,
      "desc": "",
      "balance": {
          "mpCost": 62,
          "pwr": 52,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_thunder_explosion",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "stormScreamer"
      ]
  },
  "transcendent_thunder_explosion": {
      "id": "transcendent_thunder_explosion",
      "name": "Transcendent Thunder Explosion",
      "slug": "transcendent_thunder_explosion",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano trovão AoE 720% (3 hits) + paralysis 3s",
      "canonicalCooldown": "180s",
      "canonicalCooldownMs": 180000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 72,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_transcendent_thunder_explosion",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "stormScreamer"
      ]
  },
  "mastery_rare": {
      "id": "mastery_rare",
      "name": "Mastery (Rare)",
      "slug": "mastery_rare",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+10% M.Skill Power, +15% PvE Damage, +15% Max MP",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_mastery_rare",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "stormScreamer"
      ]
  },
  "storm_screamer_spirit": {
      "id": "storm_screamer_spirit",
      "name": "Storm Screamer Spirit",
      "slug": "storm_screamer_spirit",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+20% M.ATK, +15% Wind Damage, +10% Cast Speed",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_storm_screamer_spirit",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "stormScreamer"
      ]
  },
  "body_of_storm_screamer": {
      "id": "body_of_storm_screamer",
      "name": "Body of Storm Screamer",
      "slug": "body_of_storm_screamer",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% Max MP, +10% MP Regen",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_body_of_storm_screamer",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "stormScreamer"
      ]
  },
  "storm_screamer_harmony": {
      "id": "storm_screamer_harmony",
      "name": "Storm Screamer Harmony",
      "slug": "storm_screamer_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+55% M.ATK, +40% Cast Speed, +30% Wind Damage por 30 min",
      "canonicalCooldown": "90 min",
      "canonicalCooldownMs": 5400000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 6,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_storm_screamer_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "stormScreamer"
      ]
  },
  "summon_nightmare": {
      "id": "summon_nightmare",
      "name": "Summon Nightmare",
      "slug": "summon_nightmare",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Invoca Nightmare (ATK alto, tanque médio)",
      "canonicalCooldown": "45s",
      "canonicalCooldownMs": 45000,
      "desc": "",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_summon_nightmare",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "phantomSummoner"
      ]
  },
  "summon_wraith": {
      "id": "summon_wraith",
      "name": "Summon Wraith",
      "slug": "summon_wraith",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Invoca Wraith (ATK médio, drain HP)",
      "canonicalCooldown": "45s",
      "canonicalCooldownMs": 45000,
      "desc": "",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_summon_wraith",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "phantomSummoner"
      ]
  },
  "summon_spectral_lord": {
      "id": "summon_spectral_lord",
      "name": "Summon Spectral Lord",
      "slug": "summon_spectral_lord",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Invoca Spectral Lord (AoE + tanque)",
      "canonicalCooldown": "60s",
      "canonicalCooldownMs": 60000,
      "desc": "",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_summon_spectral_lord",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "phantomSummoner"
      ]
  },
  "servitor_physical_attack": {
      "id": "servitor_physical_attack",
      "name": "Servitor Physical Attack",
      "slug": "servitor_physical_attack",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+20% ATK dos summons",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_servitor_physical_attack",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "phantomSummoner"
      ]
  },
  "phantom_summoners_harmony": {
      "id": "phantom_summoners_harmony",
      "name": "Phantom Summoner's Harmony",
      "slug": "phantom_summoners_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+35% Summon Power, +20% M.ATK por 25 min",
      "canonicalCooldown": "60 min",
      "canonicalCooldownMs": 3600000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 4,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_phantom_summoners_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "phantomSummoner"
      ]
  },
  "summon_spectral_lord_enhanced": {
      "id": "summon_spectral_lord_enhanced",
      "name": "Summon Spectral Lord (Enhanced)",
      "slug": "summon_spectral_lord_enhanced",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Spectral Lord aprimorado (+50% ATK/HP)",
      "canonicalCooldown": "90s",
      "canonicalCooldownMs": 90000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 5,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_summon_spectral_lord_enhanced",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "spectralMaster"
      ]
  },
  "spectral_master_spirit": {
      "id": "spectral_master_spirit",
      "name": "Spectral Master Spirit",
      "slug": "spectral_master_spirit",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+25% Summon Power, +15% M.ATK",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_spectral_master_spirit",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "spectralMaster"
      ]
  },
  "body_of_the_spectral_master": {
      "id": "body_of_the_spectral_master",
      "name": "Body of the Spectral Master",
      "slug": "body_of_the_spectral_master",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% Max HP/MP, +10% MP Regen",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_body_of_the_spectral_master",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "spectralMaster"
      ]
  },
  "spectral_master_harmony": {
      "id": "spectral_master_harmony",
      "name": "Spectral Master Harmony",
      "slug": "spectral_master_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+60% Summon Power, +40% M.ATK por 30 min",
      "canonicalCooldown": "90 min",
      "canonicalCooldownMs": 5400000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 6,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_spectral_master_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "spectralMaster"
      ]
  },
  "shield": {
      "id": "shield",
      "name": "Shield",
      "slug": "shield",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill1040.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+10% DEF para o grupo",
      "canonicalCooldown": "20s",
      "canonicalCooldownMs": 20000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 1,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_shield",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "shillienOracle",
          "shaman"
      ]
  },
  "stigma_of_shillien": {
      "id": "stigma_of_shillien",
      "name": "Stigma of Shillien",
      "slug": "stigma_of_shillien",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Marca alvo: recebe +25% dano por 10s",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_stigma_of_shillien",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "shillienElder"
      ]
  },
  "shillien_elders_harmony": {
      "id": "shillien_elders_harmony",
      "name": "Shillien Elder's Harmony",
      "slug": "shillien_elders_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+30% Heal Power, +25% M.ATK, +20% M.DEF por 25 min",
      "canonicalCooldown": "60 min",
      "canonicalCooldownMs": 3600000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_shillien_elders_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "shillienElder"
      ]
  },
  "blessing_of_shillien": {
      "id": "blessing_of_shillien",
      "name": "Blessing of Shillien",
      "slug": "blessing_of_shillien",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+25% All Stats para o grupo por 10 min",
      "canonicalCooldown": "60s",
      "canonicalCooldownMs": 60000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_blessing_of_shillien",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "shillienSaint"
      ]
  },
  "dark_disruption": {
      "id": "dark_disruption",
      "name": "Dark Disruption",
      "slug": "dark_disruption",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano dark 360% (só em Dark Side)",
      "canonicalCooldown": "15s",
      "canonicalCooldownMs": 15000,
      "desc": "",
      "balance": {
          "mpCost": 43,
          "pwr": 36,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_dark_disruption",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "shillienSaint"
      ]
  },
  "shillien_saint_spirit": {
      "id": "shillien_saint_spirit",
      "name": "Shillien Saint Spirit",
      "slug": "shillien_saint_spirit",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+25% Heal Power, +20% M.ATK, +15% M.DEF",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_shillien_saint_spirit",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "shillienSaint"
      ]
  },
  "body_of_shillien_saint": {
      "id": "body_of_shillien_saint",
      "name": "Body of Shillien Saint",
      "slug": "body_of_shillien_saint",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+20% Max MP, +15% MP Regen, +10% Max HP",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_body_of_shillien_saint",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "shillienSaint"
      ]
  },
  "shillien_saint_harmony": {
      "id": "shillien_saint_harmony",
      "name": "Shillien Saint Harmony",
      "slug": "shillien_saint_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+50% Heal Power, +40% M.ATK, +30% M.DEF por 30 min",
      "canonicalCooldown": "90 min",
      "canonicalCooldownMs": 5400000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 5,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_shillien_saint_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "shillienSaint"
      ]
  },
  "rose_petal_strike": {
      "id": "rose_petal_strike",
      "name": "Rose Petal Strike",
      "slug": "rose_petal_strike",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0016.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano de trevas 160% lançando pétalas cortantes",
      "canonicalCooldown": "6s",
      "canonicalCooldownMs": 6000,
      "desc": "",
      "balance": {
          "mpCost": 19,
          "pwr": 16,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_rose_petal_strike",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "bloodRoseBase"
      ]
  },
  "dark_thorn_shield": {
      "id": "dark_thorn_shield",
      "name": "Dark Thorn Shield",
      "slug": "dark_thorn_shield",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% M.DEF e reflete 10% do dano físico em espinhos",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_dark_thorn_shield",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "bloodRoseBase"
      ]
  },
  "sanguine_pulse": {
      "id": "sanguine_pulse",
      "name": "Sanguine Pulse",
      "slug": "sanguine_pulse",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Pulso de sangue: dano 140% + drena 30% em HP",
      "canonicalCooldown": "8s",
      "canonicalCooldownMs": 8000,
      "desc": "",
      "balance": {
          "mpCost": 17,
          "pwr": 14,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_sanguine_pulse",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "bloodRoseBase"
      ]
  },
  "blood_rose_harmony": {
      "id": "blood_rose_harmony",
      "name": "Blood Rose Harmony",
      "slug": "blood_rose_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+20% M.ATK, +15% Vampirismo por 30 min",
      "canonicalCooldown": "30 min",
      "canonicalCooldownMs": 1800000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_blood_rose_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "bloodRoseBase"
      ]
  },
  "crimson_thorns": {
      "id": "crimson_thorns",
      "name": "Crimson Thorns",
      "slug": "crimson_thorns",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0263.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Erupção de espinhos: dano mágico 210% + sangramento 5s",
      "canonicalCooldown": "8s",
      "canonicalCooldownMs": 8000,
      "desc": "",
      "balance": {
          "mpCost": 25,
          "pwr": 21,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_crimson_thorns",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "bloodRoseS1"
      ]
  },
  "sanguine_drain": {
      "id": "sanguine_drain",
      "name": "Sanguine Drain",
      "slug": "sanguine_drain",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano sombrio 200% + absorve 50% do dano em HP",
      "canonicalCooldown": "10s",
      "canonicalCooldownMs": 10000,
      "desc": "",
      "balance": {
          "mpCost": 24,
          "pwr": 20,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_sanguine_drain",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "bloodRoseS1"
      ]
  },
  "thorn_armor_mastery": {
      "id": "thorn_armor_mastery",
      "name": "Thorn Armor Mastery",
      "slug": "thorn_armor_mastery",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% M.ATK de Trevas e +10% Esquiva",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_thorn_armor_mastery",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "bloodRoseS1"
      ]
  },
  "curse_of_shillien": {
      "id": "curse_of_shillien",
      "name": "Curse of Shillien",
      "slug": "curse_of_shillien",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Maldição das trevas: reduz P.DEF e M.DEF do alvo em 20%",
      "canonicalCooldown": "16s",
      "canonicalCooldownMs": 16000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_curse_of_shillien",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "bloodRoseS1"
      ]
  },
  "black_rose_petal_dance": {
      "id": "black_rose_petal_dance",
      "name": "Black Rose Petal Dance",
      "slug": "black_rose_petal_dance",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano AoE profano 360% com tempestade de rosas negras",
      "canonicalCooldown": "18s",
      "canonicalCooldownMs": 18000,
      "desc": "",
      "balance": {
          "mpCost": 43,
          "pwr": 36,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_black_rose_petal_dance",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "bloodRoseS2"
      ]
  },
  "thorn_embrace": {
      "id": "thorn_embrace",
      "name": "Thorn Embrace",
      "slug": "thorn_embrace",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Aprisiona o alvo em espinhos sombrios: dano 320% + imobilização 3s",
      "canonicalCooldown": "16s",
      "canonicalCooldownMs": 16000,
      "desc": "",
      "balance": {
          "mpCost": 38,
          "pwr": 32,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_thorn_embrace",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "bloodRoseS2"
      ]
  },
  "vampiric_blossom": {
      "id": "vampiric_blossom",
      "name": "Vampiric Blossom",
      "slug": "vampiric_blossom",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Desabrochar vampírico: dano 300% + roubo de vida massivo de 60%",
      "canonicalCooldown": "15s",
      "canonicalCooldownMs": 15000,
      "desc": "",
      "balance": {
          "mpCost": 36,
          "pwr": 30,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_vampiric_blossom",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "bloodRoseS2"
      ]
  },
  "bleeding_thorn_mastery": {
      "id": "bleeding_thorn_mastery",
      "name": "Bleeding Thorn Mastery",
      "slug": "bleeding_thorn_mastery",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+20% Dano Crítico Mágico e +15% Efeito de Sangramento",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_bleeding_thorn_mastery",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "bloodRoseS2"
      ]
  },
  "rose_garden_burst": {
      "id": "rose_garden_burst",
      "name": "Rose Garden Burst",
      "slug": "rose_garden_burst",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Explosão do Jardim Negro: dano AoE 680% + drena 35% do dano total para curar o herói",
      "canonicalCooldown": "60s",
      "canonicalCooldownMs": 60000,
      "desc": "",
      "balance": {
          "mpCost": 80,
          "pwr": 68,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_rose_garden_burst",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "bloodRose"
      ]
  },
  "blood_thorn_storm": {
      "id": "blood_thorn_storm",
      "name": "Blood Thorn Storm",
      "slug": "blood_thorn_storm",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Tempestade cataclísmica de espinhos sangrentos 820% + sangramento profundo 10s",
      "canonicalCooldown": "120s",
      "canonicalCooldownMs": 120000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 82,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_blood_thorn_storm",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "bloodRose"
      ]
  },
  "queen_of_thorns_aura": {
      "id": "queen_of_thorns_aura",
      "name": "Queen of Thorns Aura",
      "slug": "queen_of_thorns_aura",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+25% Dano Mágico de Trevas, +20% Roubo de Vida Permanente",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_queen_of_thorns_aura",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "bloodRose"
      ]
  },
  "blood_rose_ultimate_harmony": {
      "id": "blood_rose_ultimate_harmony",
      "name": "Blood Rose Ultimate Harmony",
      "slug": "blood_rose_ultimate_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+65% M.ATK, +40% Roubo de Vida, +30% Velocidade de Cast por 30 min",
      "canonicalCooldown": "90 min",
      "canonicalCooldownMs": 5400000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 7,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_blood_rose_ultimate_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "bloodRose"
      ]
  },
  "iron_punch": {
      "id": "iron_punch",
      "name": "Iron Punch",
      "slug": "iron_punch",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0029.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano 140% + stun 1s",
      "canonicalCooldown": "10s",
      "canonicalCooldownMs": 10000,
      "desc": "",
      "balance": {
          "mpCost": 17,
          "pwr": 14,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_iron_punch",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "orcFighter",
          "monk"
      ]
  },
  "orc_spirit": {
      "id": "orc_spirit",
      "name": "Orc Spirit",
      "slug": "orc_spirit",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+12% ATK e +10% HP por 15 min",
      "canonicalCooldown": "30 min",
      "canonicalCooldownMs": 1800000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 1,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_orc_spirit",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "orcFighter"
      ]
  },
  "frenzy": {
      "id": "frenzy",
      "name": "Frenzy",
      "slug": "frenzy",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0176.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+100% ATK quando HP < 30%, dura 30s",
      "canonicalCooldown": "120s",
      "canonicalCooldownMs": 120000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 10,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_frenzy",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "destroyer",
          "tyrant",
          "berserker"
      ]
  },
  "guts": {
      "id": "guts",
      "name": "Guts",
      "slug": "guts",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0139.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Sobrevive com 1 HP por 10s (não pode morrer)",
      "canonicalCooldown": "180s",
      "canonicalCooldownMs": 180000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_guts",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "destroyer",
          "berserker"
      ]
  },
  "zealot": {
      "id": "zealot",
      "name": "Zealot",
      "slug": "zealot",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0420.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+50% ATK Speed por 15s, -20% DEF",
      "canonicalCooldown": "60s",
      "canonicalCooldownMs": 60000,
      "desc": "",
      "balance": {
          "mpCost": 6,
          "pwr": 5,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_zealot",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "destroyer",
          "tyrant"
      ]
  },
  "destroyers_harmony": {
      "id": "destroyers_harmony",
      "name": "Destroyer's Harmony",
      "slug": "destroyers_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+35% ATK, +20% HP, +15% ATK Speed por 25 min",
      "canonicalCooldown": "60 min",
      "canonicalCooldownMs": 3600000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 4,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_destroyers_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "destroyer"
      ]
  },
  "fists_of_fury": {
      "id": "fists_of_fury",
      "name": "Fists of Fury",
      "slug": "fists_of_fury",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano 350% (5 hits rápidos)",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "",
      "balance": {
          "mpCost": 42,
          "pwr": 35,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_fists_of_fury",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "titan"
      ]
  },
  "soul_breaker": {
      "id": "soul_breaker",
      "name": "Soul Breaker",
      "slug": "soul_breaker",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0281.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano 360% + drain MP alvo",
      "canonicalCooldown": "28s",
      "canonicalCooldownMs": 28000,
      "desc": "",
      "balance": {
          "mpCost": 43,
          "pwr": 36,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_soul_breaker",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "titan",
          "berserker"
      ]
  },
  "blazing_strike": {
      "id": "blazing_strike",
      "name": "Blazing Strike",
      "slug": "blazing_strike",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano fogo 420% single target",
      "canonicalCooldown": "22s",
      "canonicalCooldownMs": 22000,
      "desc": "",
      "balance": {
          "mpCost": 50,
          "pwr": 42,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_blazing_strike",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "titan"
      ]
  },
  "transcendent_earthquake": {
      "id": "transcendent_earthquake",
      "name": "Transcendent Earthquake",
      "slug": "transcendent_earthquake",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano AoE 680% + knockdown + stun 4s",
      "canonicalCooldown": "180s",
      "canonicalCooldownMs": 180000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 68,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_transcendent_earthquake",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "titan"
      ]
  },
  "pride_of_titan": {
      "id": "pride_of_titan",
      "name": "Pride of Titan",
      "slug": "pride_of_titan",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+20% ATK, +15% Max HP, +100% Crit Power com 2H sword",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_pride_of_titan",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "titan"
      ]
  },
  "titan_spirit": {
      "id": "titan_spirit",
      "name": "Titan Spirit",
      "slug": "titan_spirit",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+25% ATK, +20% HP, +10% ATK Speed",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_titan_spirit",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "titan"
      ]
  },
  "body_of_the_titan": {
      "id": "body_of_the_titan",
      "name": "Body of the Titan",
      "slug": "body_of_the_titan",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+20% Max HP, +15% HP Regen",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_body_of_the_titan",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "titan"
      ]
  },
  "master_of_combat_orc": {
      "id": "master_of_combat_orc",
      "name": "Master of Combat: Orc",
      "slug": "master_of_combat_orc",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+12% All Stats, +18% PvE Damage",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_master_of_combat_orc",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "titan",
          "grandKhavatari",
          "grandVanguard"
      ]
  },
  "titans_harmony": {
      "id": "titans_harmony",
      "name": "Titan's Harmony",
      "slug": "titans_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+60% ATK, +40% HP, +30% ATK Speed por 30 min",
      "canonicalCooldown": "90 min",
      "canonicalCooldownMs": 5400000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 6,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_titans_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "titan"
      ]
  },
  "punch_of_doom": {
      "id": "punch_of_doom",
      "name": "Punch of Doom",
      "slug": "punch_of_doom",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0081.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano 190% + stun 2s",
      "canonicalCooldown": "14s",
      "canonicalCooldownMs": 14000,
      "desc": "",
      "balance": {
          "mpCost": 23,
          "pwr": 19,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_punch_of_doom",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "monk"
      ]
  },
  "fist_mastery": {
      "id": "fist_mastery",
      "name": "Fist Mastery",
      "slug": "fist_mastery",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0210.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+15% ATK com fist weapons",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_fist_mastery",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "monk",
          "marauderBase"
      ]
  },
  "force_storm": {
      "id": "force_storm",
      "name": "Force Storm",
      "slug": "force_storm",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0035.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano AoE 320%",
      "canonicalCooldown": "22s",
      "canonicalCooldownMs": 22000,
      "desc": "",
      "balance": {
          "mpCost": 38,
          "pwr": 32,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_force_storm",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "tyrant"
      ]
  },
  "burning_fist": {
      "id": "burning_fist",
      "name": "Burning Fist",
      "slug": "burning_fist",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0280.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano fogo 250% + burn 5s",
      "canonicalCooldown": "14s",
      "canonicalCooldownMs": 14000,
      "desc": "",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_burning_fist",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "tyrant"
      ]
  },
  "hurricane_assault": {
      "id": "hurricane_assault",
      "name": "Hurricane Assault",
      "slug": "hurricane_assault",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0284.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano 340% (combo 4 hits)",
      "canonicalCooldown": "25s",
      "canonicalCooldownMs": 25000,
      "desc": "",
      "balance": {
          "mpCost": 41,
          "pwr": 34,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_hurricane_assault",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "tyrant"
      ]
  },
  "cripple": {
      "id": "cripple",
      "name": "Cripple",
      "slug": "cripple",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0095.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano 220% + slow 40% 6s",
      "canonicalCooldown": "18s",
      "canonicalCooldownMs": 18000,
      "desc": "",
      "balance": {
          "mpCost": 26,
          "pwr": 22,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_cripple",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "tyrant"
      ]
  },
  "totem_spirit": {
      "id": "totem_spirit",
      "name": "Totem Spirit",
      "slug": "totem_spirit",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+20% ATK, +15% ATK Speed por 120s",
      "canonicalCooldown": "60s",
      "canonicalCooldownMs": 60000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_totem_spirit",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "tyrant"
      ]
  },
  "fist_fury": {
      "id": "fist_fury",
      "name": "Fist Fury",
      "slug": "fist_fury",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0222.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano 240% + cancel target",
      "canonicalCooldown": "20s",
      "canonicalCooldownMs": 20000,
      "desc": "",
      "balance": {
          "mpCost": 29,
          "pwr": 24,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_fist_fury",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "tyrant"
      ]
  },
  "tyrants_harmony": {
      "id": "tyrants_harmony",
      "name": "Tyrant's Harmony",
      "slug": "tyrants_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+35% ATK, +25% Crit, +20% ATK Speed por 25 min",
      "canonicalCooldown": "60 min",
      "canonicalCooldownMs": 3600000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 4,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_tyrants_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "tyrant"
      ]
  },
  "force_focus": {
      "id": "force_focus",
      "name": "Force Focus",
      "slug": "force_focus",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano 400% + crit garantido",
      "canonicalCooldown": "28s",
      "canonicalCooldownMs": 28000,
      "desc": "",
      "balance": {
          "mpCost": 48,
          "pwr": 40,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_force_focus",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "grandKhavatari"
      ]
  },
  "soul_of_the_phoenix": {
      "id": "soul_of_the_phoenix",
      "name": "Soul of the Phoenix",
      "slug": "soul_of_the_phoenix",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0438.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Revive com 50% HP ao morrer (1x)",
      "canonicalCooldown": "300s",
      "canonicalCooldownMs": 300000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 5,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_soul_of_the_phoenix",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "grandKhavatari"
      ]
  },
  "rapid_attack": {
      "id": "rapid_attack",
      "name": "Rapid Attack",
      "slug": "rapid_attack",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "5 hits rápidos 80% cada",
      "canonicalCooldown": "20s",
      "canonicalCooldownMs": 20000,
      "desc": "",
      "balance": {
          "mpCost": 10,
          "pwr": 8,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_rapid_attack",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "grandKhavatari"
      ]
  },
  "ogres_essence": {
      "id": "ogres_essence",
      "name": "Ogre's Essence",
      "slug": "ogres_essence",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+40% ATK, +30% Max HP por 60s",
      "canonicalCooldown": "120s",
      "canonicalCooldownMs": 120000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 4,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_ogres_essence",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "grandKhavatari"
      ]
  },
  "rabbit_spirit_totem": {
      "id": "rabbit_spirit_totem",
      "name": "Rabbit Spirit Totem",
      "slug": "rabbit_spirit_totem",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0298.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+60% ATK Speed por 30s",
      "canonicalCooldown": "90s",
      "canonicalCooldownMs": 90000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 6,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_rabbit_spirit_totem",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "grandKhavatari"
      ]
  },
  "transcendent_hurricane": {
      "id": "transcendent_hurricane",
      "name": "Transcendent Hurricane",
      "slug": "transcendent_hurricane",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano 650% (8 hits) + knockdown",
      "canonicalCooldown": "180s",
      "canonicalCooldownMs": 180000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 65,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_transcendent_hurricane",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "grandKhavatari"
      ]
  },
  "grand_khavatari_spirit": {
      "id": "grand_khavatari_spirit",
      "name": "Grand Khavatari Spirit",
      "slug": "grand_khavatari_spirit",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+20% ATK, +15% Crit Rate, +15% ATK Speed",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_grand_khavatari_spirit",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "grandKhavatari"
      ]
  },
  "body_of_grand_khavatari": {
      "id": "body_of_grand_khavatari",
      "name": "Body of Grand Khavatari",
      "slug": "body_of_grand_khavatari",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+20% Max HP, +15% HP Regen",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_body_of_grand_khavatari",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "grandKhavatari"
      ]
  },
  "grand_khavatari_harmony": {
      "id": "grand_khavatari_harmony",
      "name": "Grand Khavatari Harmony",
      "slug": "grand_khavatari_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+55% ATK, +40% Crit, +35% ATK Speed por 30 min",
      "canonicalCooldown": "90 min",
      "canonicalCooldownMs": 5400000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 6,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_grand_khavatari_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "grandKhavatari"
      ]
  },
  "lance_charge": {
      "id": "lance_charge",
      "name": "Lance Charge",
      "slug": "lance_charge",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano 160% + avanço montado",
      "canonicalCooldown": "10s",
      "canonicalCooldownMs": 10000,
      "desc": "",
      "balance": {
          "mpCost": 19,
          "pwr": 16,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_lance_charge",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "rider"
      ]
  },
  "mounted_thrust": {
      "id": "mounted_thrust",
      "name": "Mounted Thrust",
      "slug": "mounted_thrust",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano 140%",
      "canonicalCooldown": "8s",
      "canonicalCooldownMs": 8000,
      "desc": "",
      "balance": {
          "mpCost": 17,
          "pwr": 14,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_mounted_thrust",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "rider"
      ]
  },
  "lance_mastery": {
      "id": "lance_mastery",
      "name": "Lance Mastery",
      "slug": "lance_mastery",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+10% ATK com lança",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_lance_mastery",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "rider"
      ]
  },
  "battle_mount": {
      "id": "battle_mount",
      "name": "Battle Mount",
      "slug": "battle_mount",
      "type": "toggle",
      "rawType": "Toggle",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Monta na criatura (+15% Move Speed)",
      "canonicalCooldown": "10s",
      "canonicalCooldownMs": 10000,
      "desc": "",
      "balance": {
          "mpCost": 2,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_battle_mount",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "rider"
      ]
  },
  "trample": {
      "id": "trample",
      "name": "Trample",
      "slug": "trample",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano AoE montado 220%",
      "canonicalCooldown": "16s",
      "canonicalCooldownMs": 16000,
      "desc": "",
      "balance": {
          "mpCost": 26,
          "pwr": 22,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_trample",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "dragoon"
      ]
  },
  "battle_rush": {
      "id": "battle_rush",
      "name": "Battle Rush",
      "slug": "battle_rush",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Charge 200% + stun 2s",
      "canonicalCooldown": "14s",
      "canonicalCooldownMs": 14000,
      "desc": "",
      "balance": {
          "mpCost": 24,
          "pwr": 20,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_battle_rush",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "dragoon"
      ]
  },
  "mounted_whirlwind": {
      "id": "mounted_whirlwind",
      "name": "Mounted Whirlwind",
      "slug": "mounted_whirlwind",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano AoE 240%",
      "canonicalCooldown": "18s",
      "canonicalCooldownMs": 18000,
      "desc": "",
      "balance": {
          "mpCost": 29,
          "pwr": 24,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_mounted_whirlwind",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "dragoon"
      ]
  },
  "beast_roar": {
      "id": "beast_roar",
      "name": "Beast Roar",
      "slug": "beast_roar",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Reduz ATK inimigos AoE -15% 8s + taunt",
      "canonicalCooldown": "22s",
      "canonicalCooldownMs": 22000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_beast_roar",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "dragoon"
      ]
  },
  "dragoons_harmony": {
      "id": "dragoons_harmony",
      "name": "Dragoon's Harmony",
      "slug": "dragoons_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+20% ATK, +15% DEF, +10% HP por 20 min",
      "canonicalCooldown": "45 min",
      "canonicalCooldownMs": 2700000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_dragoons_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "dragoon"
      ]
  },
  "devastating_charge": {
      "id": "devastating_charge",
      "name": "Devastating Charge",
      "slug": "devastating_charge",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano 320% + knockdown",
      "canonicalCooldown": "22s",
      "canonicalCooldownMs": 22000,
      "desc": "",
      "balance": {
          "mpCost": 38,
          "pwr": 32,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_devastating_charge",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "vanguardRider"
      ]
  },
  "thunder_crash": {
      "id": "thunder_crash",
      "name": "Thunder Crash",
      "slug": "thunder_crash",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano AoE 380% + stun 3s",
      "canonicalCooldown": "28s",
      "canonicalCooldownMs": 28000,
      "desc": "",
      "balance": {
          "mpCost": 46,
          "pwr": 38,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_thunder_crash",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "vanguardRider"
      ]
  },
  "mounted_slam": {
      "id": "mounted_slam",
      "name": "Mounted Slam",
      "slug": "mounted_slam",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano 340% + knockdown + bleed 6s",
      "canonicalCooldown": "22s",
      "canonicalCooldownMs": 22000,
      "desc": "",
      "balance": {
          "mpCost": 41,
          "pwr": 34,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_mounted_slam",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "vanguardRider"
      ]
  },
  "war_banner": {
      "id": "war_banner",
      "name": "War Banner",
      "slug": "war_banner",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+20% ATK e DEF para o grupo por 120s",
      "canonicalCooldown": "60s",
      "canonicalCooldownMs": 60000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_war_banner",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "vanguardRider"
      ]
  },
  "riders_mastery": {
      "id": "riders_mastery",
      "name": "Rider's Mastery",
      "slug": "riders_mastery",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+20% ATK montado, +15% DEF montado",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_riders_mastery",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "vanguardRider"
      ]
  },
  "mounted_combat": {
      "id": "mounted_combat",
      "name": "Mounted Combat",
      "slug": "mounted_combat",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% ATK Speed enquanto montado",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_mounted_combat",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "vanguardRider"
      ]
  },
  "dragons_breath": {
      "id": "dragons_breath",
      "name": "Dragon's Breath",
      "slug": "dragons_breath",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano fogo AoE 550% + burn 8s",
      "canonicalCooldown": "60s",
      "canonicalCooldownMs": 60000,
      "desc": "",
      "balance": {
          "mpCost": 66,
          "pwr": 55,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_dragons_breath",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "grandVanguard"
      ]
  },
  "transcendent_charge": {
      "id": "transcendent_charge",
      "name": "Transcendent Charge",
      "slug": "transcendent_charge",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Charge dano 680% + knockback + stun 4s",
      "canonicalCooldown": "180s",
      "canonicalCooldownMs": 180000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 68,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_transcendent_charge",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "grandVanguard"
      ]
  },
  "bp_mastery": {
      "id": "bp_mastery",
      "name": "BP Mastery",
      "slug": "bp_mastery",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Gera Battle Points ao atacar, +5% ATK por BP (max 5)",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_bp_mastery",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "grandVanguard"
      ]
  },
  "vanguard_spirit": {
      "id": "vanguard_spirit",
      "name": "Vanguard Spirit",
      "slug": "vanguard_spirit",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+25% ATK, +20% DEF, +15% HP",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_vanguard_spirit",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "grandVanguard"
      ]
  },
  "body_of_the_vanguard": {
      "id": "body_of_the_vanguard",
      "name": "Body of the Vanguard",
      "slug": "body_of_the_vanguard",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+20% Max HP, +15% HP Regen, +10% Move Speed",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_body_of_the_vanguard",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "grandVanguard"
      ]
  },
  "vanguards_harmony": {
      "id": "vanguards_harmony",
      "name": "Vanguard's Harmony",
      "slug": "vanguards_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+55% ATK, +45% DEF, +35% HP por 30 min",
      "canonicalCooldown": "90 min",
      "canonicalCooldownMs": 5400000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 6,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_vanguards_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "grandVanguard"
      ]
  },
  "riders_will": {
      "id": "riders_will",
      "name": "Rider's Will",
      "slug": "riders_will",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+30% ATK Speed montado, +20% Move Speed por 20 min",
      "canonicalCooldown": "55 min",
      "canonicalCooldownMs": 3300000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_riders_will",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "grandVanguard"
      ]
  },
  "clan_might": {
      "id": "clan_might",
      "name": "Clan Might",
      "slug": "clan_might",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0376.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+15% ATK para o grupo",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_clan_might",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "overlord"
      ]
  },
  "clan_shield": {
      "id": "clan_shield",
      "name": "Clan Shield",
      "slug": "clan_shield",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% DEF para o grupo",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_clan_shield",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "overlord"
      ]
  },
  "clan_body": {
      "id": "clan_body",
      "name": "Clan Body",
      "slug": "clan_body",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% Max HP para o grupo",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_clan_body",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "overlord"
      ]
  },
  "clan_soul": {
      "id": "clan_soul",
      "name": "Clan Soul",
      "slug": "clan_soul",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% Max MP para o grupo",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_clan_soul",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "overlord"
      ]
  },
  "clan_spirit": {
      "id": "clan_spirit",
      "name": "Clan Spirit",
      "slug": "clan_spirit",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% M.ATK para o grupo",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_clan_spirit",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "overlord"
      ]
  },
  "seal_of_winter": {
      "id": "seal_of_winter",
      "name": "Seal of Winter",
      "slug": "seal_of_winter",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1104.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Reduz ATK Speed alvo -30% 10s",
      "canonicalCooldown": "20s",
      "canonicalCooldownMs": 20000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_seal_of_winter",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "overlord"
      ]
  },
  "seal_of_flame": {
      "id": "seal_of_flame",
      "name": "Seal of Flame",
      "slug": "seal_of_flame",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1108.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano fogo 220% + burn 8s",
      "canonicalCooldown": "15s",
      "canonicalCooldownMs": 15000,
      "desc": "",
      "balance": {
          "mpCost": 26,
          "pwr": 22,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_seal_of_flame",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "overlord"
      ]
  },
  "seal_of_gloom": {
      "id": "seal_of_gloom",
      "name": "Seal of Gloom",
      "slug": "seal_of_gloom",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1210.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Reduz M.DEF alvo -25% 10s",
      "canonicalCooldown": "20s",
      "canonicalCooldownMs": 20000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_seal_of_gloom",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "overlord"
      ]
  },
  "seal_of_silence": {
      "id": "seal_of_silence",
      "name": "Seal of Silence",
      "slug": "seal_of_silence",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill1246.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Silence alvo 5s",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_seal_of_silence",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "overlord"
      ]
  },
  "seal_of_slow": {
      "id": "seal_of_slow",
      "name": "Seal of Slow",
      "slug": "seal_of_slow",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1099.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Slow alvo -40% 8s",
      "canonicalCooldown": "18s",
      "canonicalCooldownMs": 18000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 4,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_seal_of_slow",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "overlord"
      ]
  },
  "overlords_harmony": {
      "id": "overlords_harmony",
      "name": "Overlord's Harmony",
      "slug": "overlords_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+30% M.ATK, +25% HP, +20% M.DEF por 25 min",
      "canonicalCooldown": "60 min",
      "canonicalCooldownMs": 3600000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_overlords_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "overlord"
      ]
  },
  "seal_of_limit": {
      "id": "seal_of_limit",
      "name": "Seal of Limit",
      "slug": "seal_of_limit",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Reduz All Stats alvo -15% 12s",
      "canonicalCooldown": "35s",
      "canonicalCooldownMs": 35000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_seal_of_limit",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "dominator"
      ]
  },
  "clan_imperium": {
      "id": "clan_imperium",
      "name": "Clan Imperium",
      "slug": "clan_imperium",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0391.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Buff supremo: +25% All Stats para o grupo 120s",
      "canonicalCooldown": "120s",
      "canonicalCooldownMs": 120000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_clan_imperium",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "dominator"
      ]
  },
  "victoria_of_paagrio": {
      "id": "victoria_of_paagrio",
      "name": "Victoria of Pa'agrio",
      "slug": "victoria_of_paagrio",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+20% ATK e +15% Crit para o grupo",
      "canonicalCooldown": "60s",
      "canonicalCooldownMs": 60000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_victoria_of_paagrio",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "dominator"
      ]
  },
  "glory_of_paagrio": {
      "id": "glory_of_paagrio",
      "name": "Glory of Pa'agrio",
      "slug": "glory_of_paagrio",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+20% DEF e +15% M.DEF para o grupo",
      "canonicalCooldown": "60s",
      "canonicalCooldownMs": 60000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_glory_of_paagrio",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "dominator"
      ]
  },
  "blessing_of_paagrio": {
      "id": "blessing_of_paagrio",
      "name": "Blessing of Pa'agrio",
      "slug": "blessing_of_paagrio",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% Max HP/MP para o grupo",
      "canonicalCooldown": "60s",
      "canonicalCooldownMs": 60000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_blessing_of_paagrio",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "dominator"
      ]
  },
  "mass_seal_of_gloom": {
      "id": "mass_seal_of_gloom",
      "name": "Mass Seal of Gloom",
      "slug": "mass_seal_of_gloom",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Reduz M.DEF inimigos AoE -25% 10s",
      "canonicalCooldown": "35s",
      "canonicalCooldownMs": 35000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_mass_seal_of_gloom",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "dominator"
      ]
  },
  "flame_burst": {
      "id": "flame_burst",
      "name": "Flame Burst",
      "slug": "flame_burst",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano fogo AoE 380% + burn 6s",
      "canonicalCooldown": "22s",
      "canonicalCooldownMs": 22000,
      "desc": "",
      "balance": {
          "mpCost": 46,
          "pwr": 38,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_flame_burst",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "dominator"
      ]
  },
  "prophecy_of_paagrio": {
      "id": "prophecy_of_paagrio",
      "name": "Prophecy of Pa'agrio",
      "slug": "prophecy_of_paagrio",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+30% ATK, +25% M.ATK, +20% PvE Damage por 20 min",
      "canonicalCooldown": "55 min",
      "canonicalCooldownMs": 3300000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_prophecy_of_paagrio",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "dominator"
      ]
  },
  "transcendent_flame_burst": {
      "id": "transcendent_flame_burst",
      "name": "Transcendent Flame Burst",
      "slug": "transcendent_flame_burst",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano fogo AoE 620% (10 alvos) + burn 10s",
      "canonicalCooldown": "160s",
      "canonicalCooldownMs": 160000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 62,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_transcendent_flame_burst",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "dominator"
      ]
  },
  "dominator_spirit": {
      "id": "dominator_spirit",
      "name": "Dominator Spirit",
      "slug": "dominator_spirit",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+20% M.ATK, +15% HP, +10% All Resist",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_dominator_spirit",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "dominator"
      ]
  },
  "body_of_the_dominator": {
      "id": "body_of_the_dominator",
      "name": "Body of the Dominator",
      "slug": "body_of_the_dominator",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% Max MP, +15% HP Regen, +10% MP Regen",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_body_of_the_dominator",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "dominator"
      ]
  },
  "dominator_harmony": {
      "id": "dominator_harmony",
      "name": "Dominator Harmony",
      "slug": "dominator_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+50% M.ATK, +40% HP, +30% All Resist por 30 min",
      "canonicalCooldown": "90 min",
      "canonicalCooldownMs": 5400000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 5,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_dominator_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "dominator"
      ]
  },
  "chant_of_fire": {
      "id": "chant_of_fire",
      "name": "Chant of Fire",
      "slug": "chant_of_fire",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1006.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+15% ATK para o grupo",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_chant_of_fire",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "warcryer"
      ]
  },
  "chant_of_battle": {
      "id": "chant_of_battle",
      "name": "Chant of Battle",
      "slug": "chant_of_battle",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1007.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+15% ATK Speed para o grupo",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_chant_of_battle",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "warcryer"
      ]
  },
  "chant_of_shielding": {
      "id": "chant_of_shielding",
      "name": "Chant of Shielding",
      "slug": "chant_of_shielding",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1009.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+15% DEF para o grupo",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_chant_of_shielding",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "warcryer"
      ]
  },
  "chant_of_vampire": {
      "id": "chant_of_vampire",
      "name": "Chant of Vampire",
      "slug": "chant_of_vampire",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill1310.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Drain 8% dano como HP para o grupo",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 1,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_chant_of_vampire",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "warcryer"
      ]
  },
  "chant_of_fury": {
      "id": "chant_of_fury",
      "name": "Chant of Fury",
      "slug": "chant_of_fury",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1251.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+15% Crit Rate para o grupo",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_chant_of_fury",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "warcryer"
      ]
  },
  "chant_of_evasion": {
      "id": "chant_of_evasion",
      "name": "Chant of Evasion",
      "slug": "chant_of_evasion",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1252.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+15% EVA para o grupo",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_chant_of_evasion",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "warcryer"
      ]
  },
  "chant_of_rage": {
      "id": "chant_of_rage",
      "name": "Chant of Rage",
      "slug": "chant_of_rage",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill1253.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+20% Crit Power para o grupo",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_chant_of_rage",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "warcryer"
      ]
  },
  "chant_of_predator": {
      "id": "chant_of_predator",
      "name": "Chant of Predator",
      "slug": "chant_of_predator",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1308.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+10% ATK e Accuracy para o grupo",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 1,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_chant_of_predator",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "warcryer"
      ]
  },
  "chant_of_eagle": {
      "id": "chant_of_eagle",
      "name": "Chant of Eagle",
      "slug": "chant_of_eagle",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1309.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+15% Crit Rate para o grupo",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_chant_of_eagle",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "warcryer"
      ]
  },
  "chant_of_victory": {
      "id": "chant_of_victory",
      "name": "Chant of Victory",
      "slug": "chant_of_victory",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill1363.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+15% All Stats para o grupo",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_chant_of_victory",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "warcryer"
      ]
  },
  "chant_of_revenge": {
      "id": "chant_of_revenge",
      "name": "Chant of Revenge",
      "slug": "chant_of_revenge",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill1284.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+10% Reflect Damage para o grupo",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 1,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_chant_of_revenge",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "warcryer"
      ]
  },
  "warcryers_harmony": {
      "id": "warcryers_harmony",
      "name": "Warcryer's Harmony",
      "slug": "warcryers_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+30% M.ATK, +25% HP, +20% M.DEF por 25 min",
      "canonicalCooldown": "60 min",
      "canonicalCooldownMs": 3600000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_warcryers_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "warcryer"
      ]
  },
  "chant_of_magnus": {
      "id": "chant_of_magnus",
      "name": "Chant of Magnus",
      "slug": "chant_of_magnus",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+20% M.ATK e +15% Cast Speed para o grupo",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_chant_of_magnus",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "doomcryer"
      ]
  },
  "chant_of_berserker": {
      "id": "chant_of_berserker",
      "name": "Chant of Berserker",
      "slug": "chant_of_berserker",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+25% ATK, +20% ATK Speed, -10% DEF para o grupo",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_chant_of_berserker",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "doomcryer"
      ]
  },
  "mass_chant": {
      "id": "mass_chant",
      "name": "Mass Chant",
      "slug": "mass_chant",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Ativa todos os cânticos por 60s",
      "canonicalCooldown": "120s",
      "canonicalCooldownMs": 120000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_mass_chant",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "doomcryer"
      ]
  },
  "final_chant": {
      "id": "final_chant",
      "name": "Final Chant",
      "slug": "final_chant",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Todos os cânticos em potência máxima por 30s + imunidade debuff",
      "canonicalCooldown": "300s",
      "canonicalCooldownMs": 300000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_final_chant",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "doomcryer"
      ]
  },
  "war_chant": {
      "id": "war_chant",
      "name": "War Chant",
      "slug": "war_chant",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill1390.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano AoE 340% + taunt AoE",
      "canonicalCooldown": "22s",
      "canonicalCooldownMs": 22000,
      "desc": "",
      "balance": {
          "mpCost": 41,
          "pwr": 34,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_war_chant",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "doomcryer"
      ]
  },
  "blood_bond": {
      "id": "blood_bond",
      "name": "Blood Bond",
      "slug": "blood_bond",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano AoE dark 380% + drain HP para grupo",
      "canonicalCooldown": "25s",
      "canonicalCooldownMs": 25000,
      "desc": "",
      "balance": {
          "mpCost": 46,
          "pwr": 38,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_blood_bond",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "doomcryer"
      ]
  },
  "prophecy_of_victory": {
      "id": "prophecy_of_victory",
      "name": "Prophecy of Victory",
      "slug": "prophecy_of_victory",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+30% ATK, +25% Crit, +20% PvE Damage por 20 min",
      "canonicalCooldown": "55 min",
      "canonicalCooldownMs": 3300000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_prophecy_of_victory",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "doomcryer"
      ]
  },
  "cacophony_of_war": {
      "id": "cacophony_of_war",
      "name": "Cacophony of War",
      "slug": "cacophony_of_war",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano AoE 320% + reduz HP/MP inimigos -15%",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "",
      "balance": {
          "mpCost": 38,
          "pwr": 32,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_cacophony_of_war",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "doomcryer"
      ]
  },
  "doomcryer_spirit": {
      "id": "doomcryer_spirit",
      "name": "Doomcryer Spirit",
      "slug": "doomcryer_spirit",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+20% M.ATK, +15% HP, +10% All Resist",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_doomcryer_spirit",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "doomcryer"
      ]
  },
  "body_of_the_doomcryer": {
      "id": "body_of_the_doomcryer",
      "name": "Body of the Doomcryer",
      "slug": "body_of_the_doomcryer",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% Max MP, +15% HP Regen",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_body_of_the_doomcryer",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "doomcryer"
      ]
  },
  "doomcryer_harmony": {
      "id": "doomcryer_harmony",
      "name": "Doomcryer Harmony",
      "slug": "doomcryer_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+50% M.ATK, +40% HP, +30% All Resist por 30 min",
      "canonicalCooldown": "90 min",
      "canonicalCooldownMs": 5400000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 5,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_doomcryer_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "doomcryer"
      ]
  },
  "spoil": {
      "id": "spoil",
      "name": "Spoil",
      "slug": "spoil",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0254.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Marca alvo para loot extra",
      "canonicalCooldown": "10s",
      "canonicalCooldownMs": 10000,
      "desc": "",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_spoil",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "dwarfFighter",
          "scavenger"
      ]
  },
  "sweeper": {
      "id": "sweeper",
      "name": "Sweeper",
      "slug": "sweeper",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0042.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Coleta loot de alvo marcado com Spoil",
      "canonicalCooldown": "3s",
      "canonicalCooldownMs": 3000,
      "desc": "",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_sweeper",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "scavenger"
      ]
  },
  "plunder": {
      "id": "plunder",
      "name": "Plunder",
      "slug": "plunder",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano 160% + chance loot direto",
      "canonicalCooldown": "14s",
      "canonicalCooldownMs": 14000,
      "desc": "",
      "balance": {
          "mpCost": 19,
          "pwr": 16,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_plunder",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "scavenger"
      ]
  },
  "spoil_festival": {
      "id": "spoil_festival",
      "name": "Spoil Festival",
      "slug": "spoil_festival",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0302.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Marca todos inimigos AoE para loot",
      "canonicalCooldown": "25s",
      "canonicalCooldownMs": 25000,
      "desc": "",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_spoil_festival",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "bountyHunter"
      ]
  },
  "spoil_crush": {
      "id": "spoil_crush",
      "name": "Spoil Crush",
      "slug": "spoil_crush",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0348.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano 240% + Spoil + Sweep automático",
      "canonicalCooldown": "18s",
      "canonicalCooldownMs": 18000,
      "desc": "",
      "balance": {
          "mpCost": 29,
          "pwr": 24,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_spoil_crush",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "bountyHunter"
      ]
  },
  "bounty_hunters_harmony": {
      "id": "bounty_hunters_harmony",
      "name": "Bounty Hunter's Harmony",
      "slug": "bounty_hunters_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+30% ATK, +25% Crit, +20% Loot Bonus por 25 min",
      "canonicalCooldown": "60 min",
      "canonicalCooldownMs": 3600000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_bounty_hunters_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "bountyHunter"
      ]
  },
  "mass_spoil": {
      "id": "mass_spoil",
      "name": "Mass Spoil",
      "slug": "mass_spoil",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Marca todos inimigos em tela para loot",
      "canonicalCooldown": "35s",
      "canonicalCooldownMs": 35000,
      "desc": "",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_mass_spoil",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "fortuneSeeker"
      ]
  },
  "aura_of_fortune": {
      "id": "aura_of_fortune",
      "name": "Aura of Fortune",
      "slug": "aura_of_fortune",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+30% Loot Rate, +20% Adena Drop por 30 min",
      "canonicalCooldown": "60 min",
      "canonicalCooldownMs": 3600000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_aura_of_fortune",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "fortuneSeeker"
      ]
  },
  "artisans_golem": {
      "id": "artisans_golem",
      "name": "Artisan's Golem",
      "slug": "artisans_golem",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Invoca golem que luta (ATK 200%)",
      "canonicalCooldown": "60s",
      "canonicalCooldownMs": 60000,
      "desc": "",
      "balance": {
          "mpCost": 24,
          "pwr": 20,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_artisans_golem",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "fortuneSeeker"
      ]
  },
  "transcendent_spoil_crush": {
      "id": "transcendent_spoil_crush",
      "name": "Transcendent Spoil Crush",
      "slug": "transcendent_spoil_crush",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano AoE 500% + Spoil + Sweep todos",
      "canonicalCooldown": "160s",
      "canonicalCooldownMs": 160000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 50,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_transcendent_spoil_crush",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "fortuneSeeker"
      ]
  },
  "lucky": {
      "id": "lucky",
      "name": "Lucky",
      "slug": "lucky",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0194.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "+15% chance loot raro, +10% chance loot épico",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_lucky",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "fortuneSeeker"
      ]
  },
  "fortune_seeker_spirit": {
      "id": "fortune_seeker_spirit",
      "name": "Fortune Seeker Spirit",
      "slug": "fortune_seeker_spirit",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+20% ATK, +15% Crit, +20% Loot Bonus",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_fortune_seeker_spirit",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "fortuneSeeker"
      ]
  },
  "body_of_fortune_seeker": {
      "id": "body_of_fortune_seeker",
      "name": "Body of Fortune Seeker",
      "slug": "body_of_fortune_seeker",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% Max HP, +10% EVA",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_body_of_fortune_seeker",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "fortuneSeeker"
      ]
  },
  "fortune_seeker_harmony": {
      "id": "fortune_seeker_harmony",
      "name": "Fortune Seeker Harmony",
      "slug": "fortune_seeker_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+50% ATK, +40% Crit, +35% Loot Bonus por 30 min",
      "canonicalCooldown": "90 min",
      "canonicalCooldownMs": 5400000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 5,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_fortune_seeker_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "fortuneSeeker"
      ]
  },
  "create_item": {
      "id": "create_item",
      "name": "Create Item",
      "slug": "create_item",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0172.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Crafta item do recipe",
      "canonicalCooldown": "5s",
      "canonicalCooldownMs": 5000,
      "desc": "",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_create_item",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "artisanDwarf"
      ]
  },
  "summon_golem": {
      "id": "summon_golem",
      "name": "Summon Golem",
      "slug": "summon_golem",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Invoca golem de combate básico",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_summon_golem",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "artisanDwarf"
      ]
  },
  "create_item_lv2_7": {
      "id": "create_item_lv2_7",
      "name": "Create Item Lv2-7",
      "slug": "create_item_lv2_7",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Crafta itens avançados",
      "canonicalCooldown": "5s",
      "canonicalCooldownMs": 5000,
      "desc": "",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_create_item_lv2_7",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "warsmith"
      ]
  },
  "summon_siege_golem": {
      "id": "summon_siege_golem",
      "name": "Summon Siege Golem",
      "slug": "summon_siege_golem",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0013.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Golem forte (ATK 250%, HP alto)",
      "canonicalCooldown": "60s",
      "canonicalCooldownMs": 60000,
      "desc": "",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_summon_siege_golem",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "warsmith"
      ]
  },
  "summon_mechanic_golem": {
      "id": "summon_mechanic_golem",
      "name": "Summon Mechanic Golem",
      "slug": "summon_mechanic_golem",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0025.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Golem mecânico (ATK ranged 200%)",
      "canonicalCooldown": "60s",
      "canonicalCooldownMs": 60000,
      "desc": "",
      "balance": {
          "mpCost": 24,
          "pwr": 20,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_summon_mechanic_golem",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "warsmith"
      ]
  },
  "summon_wild_hog_cannon": {
      "id": "summon_wild_hog_cannon",
      "name": "Summon Wild Hog Cannon",
      "slug": "summon_wild_hog_cannon",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0299.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Canhão AoE (dano 300%/10s)",
      "canonicalCooldown": "90s",
      "canonicalCooldownMs": 90000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 30,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_summon_wild_hog_cannon",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "warsmith"
      ]
  },
  "share_craft": {
      "id": "share_craft",
      "name": "Share Craft",
      "slug": "share_craft",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Permite craftar para outros jogadores",
      "canonicalCooldown": "5s",
      "canonicalCooldownMs": 5000,
      "desc": "",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_share_craft",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "warsmith"
      ]
  },
  "crystal_mastery": {
      "id": "crystal_mastery",
      "name": "Crystal Mastery",
      "slug": "crystal_mastery",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+20% chance cristalização bem-sucedida",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_crystal_mastery",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "warsmith"
      ]
  },
  "golem_armor": {
      "id": "golem_armor",
      "name": "Golem Armor",
      "slug": "golem_armor",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+30% DEF do golem por 60s",
      "canonicalCooldown": "60s",
      "canonicalCooldownMs": 60000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_golem_armor",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "warsmith"
      ]
  },
  "warsmiths_harmony": {
      "id": "warsmiths_harmony",
      "name": "Warsmith's Harmony",
      "slug": "warsmiths_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+30% ATK, +25% Golem Power, +20% Craft Success por 25 min",
      "canonicalCooldown": "60 min",
      "canonicalCooldownMs": 3600000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_warsmiths_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "warsmith"
      ]
  },
  "summon_enhanced_golem": {
      "id": "summon_enhanced_golem",
      "name": "Summon Enhanced Golem",
      "slug": "summon_enhanced_golem",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Golem aprimorado (ATK 400%, AoE)",
      "canonicalCooldown": "90s",
      "canonicalCooldownMs": 90000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 40,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_summon_enhanced_golem",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "maestro"
      ]
  },
  "summon_big_boom": {
      "id": "summon_big_boom",
      "name": "Summon Big Boom",
      "slug": "summon_big_boom",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0301.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Explosivo: dano AoE 550%",
      "canonicalCooldown": "120s",
      "canonicalCooldownMs": 120000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 55,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_summon_big_boom",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "maestro"
      ]
  },
  "mass_crystal": {
      "id": "mass_crystal",
      "name": "Mass Crystal",
      "slug": "mass_crystal",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Cristaliza vários itens de uma vez",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_mass_crystal",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "maestro"
      ]
  },
  "final_form": {
      "id": "final_form",
      "name": "Final Form",
      "slug": "final_form",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Golem evolui: +100% ATK/HP por 60s",
      "canonicalCooldown": "180s",
      "canonicalCooldownMs": 180000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 10,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_final_form",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "maestro"
      ]
  },
  "craft_mastery": {
      "id": "craft_mastery",
      "name": "Craft Mastery",
      "slug": "craft_mastery",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+30% Craft Success Rate",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_craft_mastery",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "maestro"
      ]
  },
  "maestro_spirit": {
      "id": "maestro_spirit",
      "name": "Maestro Spirit",
      "slug": "maestro_spirit",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+20% ATK, +15% Golem Power, +15% DEF",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_maestro_spirit",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "maestro"
      ]
  },
  "body_of_the_maestro": {
      "id": "body_of_the_maestro",
      "name": "Body of the Maestro",
      "slug": "body_of_the_maestro",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% Max HP, +10% HP Regen",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_body_of_the_maestro",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "maestro"
      ]
  },
  "maestro_harmony": {
      "id": "maestro_harmony",
      "name": "Maestro Harmony",
      "slug": "maestro_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+50% ATK, +40% Golem Power, +30% Craft Success por 30 min",
      "canonicalCooldown": "90 min",
      "canonicalCooldownMs": 5400000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 5,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_maestro_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "maestro"
      ]
  },
  "holy_light": {
      "id": "holy_light",
      "name": "Holy Light",
      "slug": "holy_light",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano sagrado 150%",
      "canonicalCooldown": "8s",
      "canonicalCooldownMs": 8000,
      "desc": "",
      "balance": {
          "mpCost": 18,
          "pwr": 15,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_holy_light",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "highElfBase"
      ]
  },
  "elemental_weave": {
      "id": "elemental_weave",
      "name": "Elemental Weave",
      "slug": "elemental_weave",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano elemental 140%",
      "canonicalCooldown": "8s",
      "canonicalCooldownMs": 8000,
      "desc": "",
      "balance": {
          "mpCost": 17,
          "pwr": 14,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_elemental_weave",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "highElfBase"
      ]
  },
  "high_elf_mastery": {
      "id": "high_elf_mastery",
      "name": "High Elf Mastery",
      "slug": "high_elf_mastery",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+10% P.ATK e M.ATK",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_high_elf_mastery",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "highElfBase"
      ]
  },
  "light_burst": {
      "id": "light_burst",
      "name": "Light Burst",
      "slug": "light_burst",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano sagrado 190%",
      "canonicalCooldown": "10s",
      "canonicalCooldownMs": 10000,
      "desc": "",
      "balance": {
          "mpCost": 23,
          "pwr": 19,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_light_burst",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "shineMakerS1"
      ]
  },
  "radiant_strike": {
      "id": "radiant_strike",
      "name": "Radiant Strike",
      "slug": "radiant_strike",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano sagrado 170% + blind 2s",
      "canonicalCooldown": "12s",
      "canonicalCooldownMs": 12000,
      "desc": "",
      "balance": {
          "mpCost": 20,
          "pwr": 17,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_radiant_strike",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "shineMakerS1"
      ]
  },
  "purifying_light": {
      "id": "purifying_light",
      "name": "Purifying Light",
      "slug": "purifying_light",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Remove 1 debuff do aliado",
      "canonicalCooldown": "12s",
      "canonicalCooldownMs": 12000,
      "desc": "",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_purifying_light",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "shineMakerS1"
      ]
  },
  "shining_barrier": {
      "id": "shining_barrier",
      "name": "Shining Barrier",
      "slug": "shining_barrier",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% DEF e M.DEF por 120s",
      "canonicalCooldown": "60s",
      "canonicalCooldownMs": 60000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_shining_barrier",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "shineMakerS1"
      ]
  },
  "prismatic_ray": {
      "id": "prismatic_ray",
      "name": "Prismatic Ray",
      "slug": "prismatic_ray",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano sagrado 280% + slow 30% 4s",
      "canonicalCooldown": "16s",
      "canonicalCooldownMs": 16000,
      "desc": "",
      "balance": {
          "mpCost": 34,
          "pwr": 28,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_prismatic_ray",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "shineMakerS2"
      ]
  },
  "shining_nova": {
      "id": "shining_nova",
      "name": "Shining Nova",
      "slug": "shining_nova",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano AoE sagrado 320% + heal aliados 10%",
      "canonicalCooldown": "22s",
      "canonicalCooldownMs": 22000,
      "desc": "",
      "balance": {
          "mpCost": 38,
          "pwr": 32,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_shining_nova",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "shineMakerS2"
      ]
  },
  "crystal_arrow": {
      "id": "crystal_arrow",
      "name": "Crystal Arrow",
      "slug": "crystal_arrow",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano sagrado 260%",
      "canonicalCooldown": "14s",
      "canonicalCooldownMs": 14000,
      "desc": "",
      "balance": {
          "mpCost": 31,
          "pwr": 26,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_crystal_arrow",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "shineMakerS2"
      ]
  },
  "light_of_creation": {
      "id": "light_of_creation",
      "name": "Light of Creation",
      "slug": "light_of_creation",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+25% M.ATK, +15% Heal Power por 120s",
      "canonicalCooldown": "120s",
      "canonicalCooldownMs": 120000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_light_of_creation",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "shineMakerS2"
      ]
  },
  "brilliant_aura": {
      "id": "brilliant_aura",
      "name": "Brilliant Aura",
      "slug": "brilliant_aura",
      "type": "buff",
      "rawType": "Party-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% All Stats para o grupo por 300s",
      "canonicalCooldown": "60s",
      "canonicalCooldownMs": 60000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_brilliant_aura",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "shineMakerS2"
      ]
  },
  "shinemaker_harmony_s2": {
      "id": "shinemaker_harmony_s2",
      "name": "ShineMaker Harmony (S2)",
      "slug": "shinemaker_harmony_s2",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+35% M.ATK, +25% Heal Power, +20% M.DEF por 25 min",
      "canonicalCooldown": "60 min",
      "canonicalCooldownMs": 3600000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 4,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_shinemaker_harmony_s2",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "shineMakerS2"
      ]
  },
  "star_fall": {
      "id": "star_fall",
      "name": "Star Fall",
      "slug": "star_fall",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill1230.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano AoE sagrado 580% + stun 3s",
      "canonicalCooldown": "45s",
      "canonicalCooldownMs": 45000,
      "desc": "",
      "balance": {
          "mpCost": 70,
          "pwr": 58,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_star_fall",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "shinemaker"
      ]
  },
  "transcendent_star_fall": {
      "id": "transcendent_star_fall",
      "name": "Transcendent Star Fall",
      "slug": "transcendent_star_fall",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill1235.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano AoE sagrado 750% + blind 5s",
      "canonicalCooldown": "120s",
      "canonicalCooldownMs": 120000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 75,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_transcendent_star_fall",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "shinemaker"
      ]
  },
  "divine_crystal_aegis": {
      "id": "divine_crystal_aegis",
      "name": "Divine Crystal Aegis",
      "slug": "divine_crystal_aegis",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Barreira protetora sagrada que absorve 35% do dano máximo",
      "canonicalCooldown": "60s",
      "canonicalCooldownMs": 60000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 4,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_divine_crystal_aegis",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "shinemaker"
      ]
  },
  "shinemakers_ultimate_harmony": {
      "id": "shinemakers_ultimate_harmony",
      "name": "ShineMaker's Ultimate Harmony",
      "slug": "shinemakers_ultimate_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+60% M.ATK, +50% P.DEF, +40% Cura por 30 min",
      "canonicalCooldown": "90 min",
      "canonicalCooldownMs": 5400000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 6,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_shinemakers_ultimate_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "shinemaker"
      ]
  },
  "soul_strike": {
      "id": "soul_strike",
      "name": "Soul Strike",
      "slug": "soul_strike",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano soul 160%",
      "canonicalCooldown": "8s",
      "canonicalCooldownMs": 8000,
      "desc": "",
      "balance": {
          "mpCost": 19,
          "pwr": 16,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_soul_strike",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "kamaelSoldier"
      ]
  },
  "energy_blast": {
      "id": "energy_blast",
      "name": "Energy Blast",
      "slug": "energy_blast",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano AoE soul 140%",
      "canonicalCooldown": "12s",
      "canonicalCooldownMs": 12000,
      "desc": "",
      "balance": {
          "mpCost": 17,
          "pwr": 14,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_energy_blast",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "kamaelSoldier"
      ]
  },
  "steal_divinity": {
      "id": "steal_divinity",
      "name": "Steal Divinity",
      "slug": "steal_divinity",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Absorve buff inimigo",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_steal_divinity",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "kamaelSoldier"
      ]
  },
  "ancient_sword_mastery": {
      "id": "ancient_sword_mastery",
      "name": "Ancient Sword Mastery",
      "slug": "ancient_sword_mastery",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+12% ATK com ancient sword",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_ancient_sword_mastery",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "kamaelSoldier"
      ]
  },
  "soul_mastery": {
      "id": "soul_mastery",
      "name": "Soul Mastery",
      "slug": "soul_mastery",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+10% Soul Damage",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_soul_mastery",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "kamaelSoldier"
      ]
  },
  "soul_charge": {
      "id": "soul_charge",
      "name": "Soul Charge",
      "slug": "soul_charge",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Carrega Soul Points (+1 SP)",
      "canonicalCooldown": "10s",
      "canonicalCooldownMs": 10000,
      "desc": "",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_soul_charge",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "trooper",
          "soulRanger"
      ]
  },
  "lightning_shock": {
      "id": "lightning_shock",
      "name": "Lightning Shock",
      "slug": "lightning_shock",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano elétrico 190% + stun 1s",
      "canonicalCooldown": "12s",
      "canonicalCooldownMs": 12000,
      "desc": "",
      "balance": {
          "mpCost": 23,
          "pwr": 19,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_lightning_shock",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "trooper"
      ]
  },
  "triple_thrust": {
      "id": "triple_thrust",
      "name": "Triple Thrust",
      "slug": "triple_thrust",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano 180% (3 hits)",
      "canonicalCooldown": "12s",
      "canonicalCooldownMs": 12000,
      "desc": "",
      "balance": {
          "mpCost": 22,
          "pwr": 18,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_triple_thrust",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "trooper"
      ]
  },
  "soul_rage": {
      "id": "soul_rage",
      "name": "Soul Rage",
      "slug": "soul_rage",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+60% ATK por 20s, consume Soul Points",
      "canonicalCooldown": "60s",
      "canonicalCooldownMs": 60000,
      "desc": "",
      "balance": {
          "mpCost": 7,
          "pwr": 6,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_soul_rage",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "berserker"
      ]
  },
  "decimate": {
      "id": "decimate",
      "name": "Decimate",
      "slug": "decimate",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano AoE 260%",
      "canonicalCooldown": "18s",
      "canonicalCooldownMs": 18000,
      "desc": "",
      "balance": {
          "mpCost": 31,
          "pwr": 26,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_decimate",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "berserker"
      ]
  },
  "hurricane_rush": {
      "id": "hurricane_rush",
      "name": "Hurricane Rush",
      "slug": "hurricane_rush",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano AoE 320% + knockback",
      "canonicalCooldown": "25s",
      "canonicalCooldownMs": 25000,
      "desc": "",
      "balance": {
          "mpCost": 38,
          "pwr": 32,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_hurricane_rush",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "berserker"
      ]
  },
  "soul_piercing": {
      "id": "soul_piercing",
      "name": "Soul Piercing",
      "slug": "soul_piercing",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano 250% + ignore DEF",
      "canonicalCooldown": "16s",
      "canonicalCooldownMs": 16000,
      "desc": "",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_soul_piercing",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "berserker"
      ]
  },
  "berserkers_harmony": {
      "id": "berserkers_harmony",
      "name": "Berserker's Harmony",
      "slug": "berserkers_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+35% ATK, +25% Crit, +20% Soul Damage por 25 min",
      "canonicalCooldown": "60 min",
      "canonicalCooldownMs": 3600000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 4,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_berserkers_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "berserker"
      ]
  },
  "doom_blade": {
      "id": "doom_blade",
      "name": "Doom Blade",
      "slug": "doom_blade",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano soul 420% + bleed 8s",
      "canonicalCooldown": "25s",
      "canonicalCooldownMs": 25000,
      "desc": "",
      "balance": {
          "mpCost": 50,
          "pwr": 42,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_doom_blade",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "doombringer"
      ]
  },
  "soul_explosion": {
      "id": "soul_explosion",
      "name": "Soul Explosion",
      "slug": "soul_explosion",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano AoE soul 550% + consume todos Soul Points",
      "canonicalCooldown": "90s",
      "canonicalCooldownMs": 90000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 55,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_soul_explosion",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "doombringer"
      ]
  },
  "dissonance": {
      "id": "dissonance",
      "name": "Dissonance",
      "slug": "dissonance",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Silence AoE 5s",
      "canonicalCooldown": "40s",
      "canonicalCooldownMs": 40000,
      "desc": "",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_dissonance",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "doombringer"
      ]
  },
  "betrayal_mark": {
      "id": "betrayal_mark",
      "name": "Betrayal Mark",
      "slug": "betrayal_mark",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Marca alvo: +30% dano contra ele 12s",
      "canonicalCooldown": "35s",
      "canonicalCooldownMs": 35000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_betrayal_mark",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "doombringer"
      ]
  },
  "soul_rage_enhanced": {
      "id": "soul_rage_enhanced",
      "name": "Soul Rage (Enhanced)",
      "slug": "soul_rage_enhanced",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+80% ATK por 25s",
      "canonicalCooldown": "90s",
      "canonicalCooldownMs": 90000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 8,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_soul_rage_enhanced",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "doombringer"
      ]
  },
  "transcendent_doom_blade": {
      "id": "transcendent_doom_blade",
      "name": "Transcendent Doom Blade",
      "slug": "transcendent_doom_blade",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano soul 680% + ignore DEF + drain soul",
      "canonicalCooldown": "180s",
      "canonicalCooldownMs": 180000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 68,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_transcendent_doom_blade",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "doombringer"
      ]
  },
  "pride_of_kamael": {
      "id": "pride_of_kamael",
      "name": "Pride of Kamael",
      "slug": "pride_of_kamael",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+20% ATK, +15% Soul Damage, +10% Crit Rate",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_pride_of_kamael",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "doombringer"
      ]
  },
  "doombringer_spirit": {
      "id": "doombringer_spirit",
      "name": "Doombringer Spirit",
      "slug": "doombringer_spirit",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+25% ATK, +20% Crit Power",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_doombringer_spirit",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "doombringer"
      ]
  },
  "body_of_doombringer": {
      "id": "body_of_doombringer",
      "name": "Body of Doombringer",
      "slug": "body_of_doombringer",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+20% Max HP, +15% HP Regen",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_body_of_doombringer",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "doombringer"
      ]
  },
  "doombringer_harmony": {
      "id": "doombringer_harmony",
      "name": "Doombringer Harmony",
      "slug": "doombringer_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+55% ATK, +45% Crit, +35% Soul Damage por 30 min",
      "canonicalCooldown": "90 min",
      "canonicalCooldownMs": 5400000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 6,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_doombringer_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "doombringer"
      ]
  },
  "soul_strike_enhanced": {
      "id": "soul_strike_enhanced",
      "name": "Soul Strike (Enhanced)",
      "slug": "soul_strike_enhanced",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano soul 180%",
      "canonicalCooldown": "8s",
      "canonicalCooldownMs": 8000,
      "desc": "",
      "balance": {
          "mpCost": 22,
          "pwr": 18,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_soul_strike_enhanced",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "soulFinder"
      ]
  },
  "double_thrust": {
      "id": "double_thrust",
      "name": "Double Thrust",
      "slug": "double_thrust",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano 170% (2 hits)",
      "canonicalCooldown": "10s",
      "canonicalCooldownMs": 10000,
      "desc": "",
      "balance": {
          "mpCost": 20,
          "pwr": 17,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_double_thrust",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "soulFinder"
      ]
  },
  "rapier_mastery": {
      "id": "rapier_mastery",
      "name": "Rapier Mastery",
      "slug": "rapier_mastery",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+12% ATK com rapier",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_rapier_mastery",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "soulFinder"
      ]
  },
  "dark_curse": {
      "id": "dark_curse",
      "name": "Dark Curse",
      "slug": "dark_curse",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano dark 240% + reduz M.DEF 20%",
      "canonicalCooldown": "18s",
      "canonicalCooldownMs": 18000,
      "desc": "",
      "balance": {
          "mpCost": 29,
          "pwr": 24,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_dark_curse",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "soulBreakerKamael"
      ]
  },
  "soul_breakers_harmony": {
      "id": "soul_breakers_harmony",
      "name": "Soul Breaker's Harmony",
      "slug": "soul_breakers_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+30% ATK, +25% M.ATK, +20% Soul Damage por 25 min",
      "canonicalCooldown": "60 min",
      "canonicalCooldownMs": 3600000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_soul_breakers_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "soulBreakerKamael"
      ]
  },
  "lightning_barrier": {
      "id": "lightning_barrier",
      "name": "Lightning Barrier",
      "slug": "lightning_barrier",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Escudo elétrico: absorve 3000 + reflete 25%",
      "canonicalCooldown": "60s",
      "canonicalCooldownMs": 60000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_lightning_barrier",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "soulHound"
      ]
  },
  "soul_ignition": {
      "id": "soul_ignition",
      "name": "Soul Ignition",
      "slug": "soul_ignition",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+50% ATK e M.ATK por 20s (drena HP 3%/s)",
      "canonicalCooldown": "90s",
      "canonicalCooldownMs": 90000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 5,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_soul_ignition",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "soulHound"
      ]
  },
  "dark_smash": {
      "id": "dark_smash",
      "name": "Dark Smash",
      "slug": "dark_smash",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano dark 380% + silence 3s",
      "canonicalCooldown": "22s",
      "canonicalCooldownMs": 22000,
      "desc": "",
      "balance": {
          "mpCost": 46,
          "pwr": 38,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_dark_smash",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "soulHound"
      ]
  },
  "soul_hound_spirit": {
      "id": "soul_hound_spirit",
      "name": "Soul Hound Spirit",
      "slug": "soul_hound_spirit",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+20% ATK, +20% M.ATK, +15% Soul Damage",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_soul_hound_spirit",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "soulHound"
      ]
  },
  "body_of_soul_hound": {
      "id": "body_of_soul_hound",
      "name": "Body of Soul Hound",
      "slug": "body_of_soul_hound",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% Max HP/MP, +10% Regen",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_body_of_soul_hound",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "soulHound"
      ]
  },
  "soul_hound_harmony": {
      "id": "soul_hound_harmony",
      "name": "Soul Hound Harmony",
      "slug": "soul_hound_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+50% ATK, +45% M.ATK, +35% Soul Damage por 30 min",
      "canonicalCooldown": "90 min",
      "canonicalCooldownMs": 5400000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 5,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_soul_hound_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "soulHound"
      ]
  },
  "rapid_shot": {
      "id": "rapid_shot",
      "name": "Rapid Shot",
      "slug": "rapid_shot",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0099.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano 170% rápido",
      "canonicalCooldown": "8s",
      "canonicalCooldownMs": 8000,
      "desc": "",
      "balance": {
          "mpCost": 20,
          "pwr": 17,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_rapid_shot",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "warder"
      ]
  },
  "crossbow_mastery": {
      "id": "crossbow_mastery",
      "name": "Crossbow Mastery",
      "slug": "crossbow_mastery",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+12% ATK com crossbow",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_crossbow_mastery",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "warder"
      ]
  },
  "soul_rangers_harmony": {
      "id": "soul_rangers_harmony",
      "name": "Soul Ranger's Harmony",
      "slug": "soul_rangers_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+35% ATK, +25% Crit, +20% Range por 25 min",
      "canonicalCooldown": "60 min",
      "canonicalCooldownMs": 3600000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 4,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_soul_rangers_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "soulRanger"
      ]
  },
  "seven_arrow_crossbow": {
      "id": "seven_arrow_crossbow",
      "name": "Seven Arrow (Crossbow)",
      "slug": "seven_arrow_crossbow",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano 420% (7 hits crossbow)",
      "canonicalCooldown": "28s",
      "canonicalCooldownMs": 28000,
      "desc": "",
      "balance": {
          "mpCost": 50,
          "pwr": 42,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_seven_arrow_crossbow",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "trickster"
      ]
  },
  "install_trap": {
      "id": "install_trap",
      "name": "Install Trap",
      "slug": "install_trap",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Instala armadilha: dano AoE 300% + stun 3s quando ativada",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "",
      "balance": {
          "mpCost": 36,
          "pwr": 30,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_install_trap",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "trickster"
      ]
  },
  "soul_of_the_trickster": {
      "id": "soul_of_the_trickster",
      "name": "Soul of the Trickster",
      "slug": "soul_of_the_trickster",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+40% EVA e invisibilidade 8s",
      "canonicalCooldown": "90s",
      "canonicalCooldownMs": 90000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 4,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_soul_of_the_trickster",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "trickster"
      ]
  },
  "trickster_spirit": {
      "id": "trickster_spirit",
      "name": "Trickster Spirit",
      "slug": "trickster_spirit",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+20% ATK, +20% Crit, +15% Range",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_trickster_spirit",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "trickster"
      ]
  },
  "body_of_trickster": {
      "id": "body_of_trickster",
      "name": "Body of Trickster",
      "slug": "body_of_trickster",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% Max HP, +10% EVA",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_body_of_trickster",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "trickster"
      ]
  },
  "trickster_harmony": {
      "id": "trickster_harmony",
      "name": "Trickster Harmony",
      "slug": "trickster_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+55% ATK, +45% Crit, +35% Range por 30 min",
      "canonicalCooldown": "90 min",
      "canonicalCooldownMs": 5400000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 6,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_trickster_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "trickster"
      ]
  },
  "iaijutsu_slash": {
      "id": "iaijutsu_slash",
      "name": "Iaijutsu Slash",
      "slug": "iaijutsu_slash",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0003.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano físico rápido 160% ao desembainhar a espada",
      "canonicalCooldown": "8s",
      "canonicalCooldownMs": 8000,
      "desc": "",
      "balance": {
          "mpCost": 19,
          "pwr": 16,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_iaijutsu_slash",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "samuraiBase"
      ]
  },
  "crescent_blade": {
      "id": "crescent_blade",
      "name": "Crescent Blade",
      "slug": "crescent_blade",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano de corte 140% + bleed 4s",
      "canonicalCooldown": "10s",
      "canonicalCooldownMs": 10000,
      "desc": "",
      "balance": {
          "mpCost": 17,
          "pwr": 14,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_crescent_blade",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "samuraiBase"
      ]
  },
  "katana_mastery": {
      "id": "katana_mastery",
      "name": "Katana Mastery",
      "slug": "katana_mastery",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% P.ATK com Katana/Espadas",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_katana_mastery",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "samuraiBase"
      ]
  },
  "bushido_spirit": {
      "id": "bushido_spirit",
      "name": "Bushido Spirit",
      "slug": "bushido_spirit",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+10% Taxa de Crítico e +8% Esquiva",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_bushido_spirit",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "samuraiBase"
      ]
  },
  "samurais_harmony": {
      "id": "samurais_harmony",
      "name": "Samurai's Harmony",
      "slug": "samurais_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+20% P.ATK, +15% Crit Rate por 30 min",
      "canonicalCooldown": "30 min",
      "canonicalCooldownMs": 1800000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_samurais_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "samuraiBase"
      ]
  },
  "whirlwind_cut": {
      "id": "whirlwind_cut",
      "name": "Whirlwind Cut",
      "slug": "whirlwind_cut",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano giratório AoE 210%",
      "canonicalCooldown": "12s",
      "canonicalCooldownMs": 12000,
      "desc": "",
      "balance": {
          "mpCost": 25,
          "pwr": 21,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_whirlwind_cut",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "hatamoto"
      ]
  },
  "focused_strike": {
      "id": "focused_strike",
      "name": "Focused Strike",
      "slug": "focused_strike",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Estocada concentrada: dano 250% + 30% bônus de dano crítico",
      "canonicalCooldown": "14s",
      "canonicalCooldownMs": 14000,
      "desc": "",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_focused_strike",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "hatamoto"
      ]
  },
  "bushido_stance": {
      "id": "bushido_stance",
      "name": "Bushido Stance",
      "slug": "bushido_stance",
      "type": "toggle",
      "rawType": "Toggle",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+20% P.ATK, +15% Crit Rate, -10% P.DEF",
      "canonicalCooldown": "5s",
      "canonicalCooldownMs": 5000,
      "desc": "",
      "balance": {
          "mpCost": 2,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_bushido_stance",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "hatamoto"
      ]
  },
  "katana_focus": {
      "id": "katana_focus",
      "name": "Katana Focus",
      "slug": "katana_focus",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+18% Taxa de Crítico com Katana",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_katana_focus",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "hatamoto"
      ]
  },
  "sakura_storm": {
      "id": "sakura_storm",
      "name": "Sakura Storm",
      "slug": "sakura_storm",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano AoE pétalas cortantes 360% + sangramento contínuo 6s",
      "canonicalCooldown": "18s",
      "canonicalCooldownMs": 18000,
      "desc": "",
      "balance": {
          "mpCost": 43,
          "pwr": 36,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_sakura_storm",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "ronin"
      ]
  },
  "rising_dragon": {
      "id": "rising_dragon",
      "name": "Rising Dragon",
      "slug": "rising_dragon",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Corte ascendente do dragão: dano 340% + knockup 2s",
      "canonicalCooldown": "16s",
      "canonicalCooldownMs": 16000,
      "desc": "",
      "balance": {
          "mpCost": 41,
          "pwr": 34,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_rising_dragon",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "ronin"
      ]
  },
  "counter_slash": {
      "id": "counter_slash",
      "name": "Counter Slash",
      "slug": "counter_slash",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Contra-ataque letal: dano 380% e absorve 20% do dano recebido",
      "canonicalCooldown": "20s",
      "canonicalCooldownMs": 20000,
      "desc": "",
      "balance": {
          "mpCost": 46,
          "pwr": 38,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_counter_slash",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "ronin"
      ]
  },
  "honor_code": {
      "id": "honor_code",
      "name": "Honor Code",
      "slug": "honor_code",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+30% P.ATK, +25% Crit Power, +15% Velocidade de Ataque por 120s",
      "canonicalCooldown": "120s",
      "canonicalCooldownMs": 120000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 3,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_honor_code",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "ronin"
      ]
  },
  "way_of_the_blade": {
      "id": "way_of_the_blade",
      "name": "Way of the Blade",
      "slug": "way_of_the_blade",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+20% P.ATK, +15% Crit Power com lâminas",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_way_of_the_blade",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "ronin"
      ]
  },
  "final_cut": {
      "id": "final_cut",
      "name": "Final Cut",
      "slug": "final_cut",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Golpe de execução: dano 580% (dobra o dano se o alvo tiver menos de 30% HP)",
      "canonicalCooldown": "45s",
      "canonicalCooldownMs": 45000,
      "desc": "",
      "balance": {
          "mpCost": 70,
          "pwr": 58,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_final_cut",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "samurai"
      ]
  },
  "transcendent_iaijutsu": {
      "id": "transcendent_iaijutsu",
      "name": "Transcendent Iaijutsu",
      "slug": "transcendent_iaijutsu",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Corte supremo dimensional 750% + ignora 40% da defesa do alvo + sangramento 10s",
      "canonicalCooldown": "120s",
      "canonicalCooldownMs": 120000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 75,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_transcendent_iaijutsu",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "samurai"
      ]
  },
  "samurai_spirit": {
      "id": "samurai_spirit",
      "name": "Samurai Spirit",
      "slug": "samurai_spirit",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+25% P.ATK, +20% Crit Power, +15% Esquiva",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_samurai_spirit",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "samurai"
      ]
  },
  "body_of_the_samurai": {
      "id": "body_of_the_samurai",
      "name": "Body of the Samurai",
      "slug": "body_of_the_samurai",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+20% Max HP, +25% Regeneração de HP",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_body_of_the_samurai",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "samurai"
      ]
  },
  "samurais_ultimate_harmony": {
      "id": "samurais_ultimate_harmony",
      "name": "Samurai's Ultimate Harmony",
      "slug": "samurais_ultimate_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+60% P.ATK, +50% Crit Rate, +35% Velocidade de Ataque por 30 min",
      "canonicalCooldown": "90 min",
      "canonicalCooldownMs": 5400000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 6,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_samurais_ultimate_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "samurai"
      ]
  },
  "quick_shot": {
      "id": "quick_shot",
      "name": "Quick Shot",
      "slug": "quick_shot",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano 150% rápido",
      "canonicalCooldown": "6s",
      "canonicalCooldownMs": 6000,
      "desc": "",
      "balance": {
          "mpCost": 18,
          "pwr": 15,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_quick_shot",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "sylphGunner"
      ]
  },
  "gun_mastery": {
      "id": "gun_mastery",
      "name": "Gun Mastery",
      "slug": "gun_mastery",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+12% ATK com arma de fogo",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_gun_mastery",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "sylphGunner"
      ]
  },
  "burst_fire": {
      "id": "burst_fire",
      "name": "Burst Fire",
      "slug": "burst_fire",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano 200% (3 tiros rápidos)",
      "canonicalCooldown": "10s",
      "canonicalCooldownMs": 10000,
      "desc": "",
      "balance": {
          "mpCost": 24,
          "pwr": 20,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_burst_fire",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "sharpshooter"
      ]
  },
  "piercing_shot": {
      "id": "piercing_shot",
      "name": "Piercing Shot",
      "slug": "piercing_shot",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano 220% + penetra alvos em linha",
      "canonicalCooldown": "14s",
      "canonicalCooldownMs": 14000,
      "desc": "",
      "balance": {
          "mpCost": 26,
          "pwr": 22,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_piercing_shot",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "sharpshooter"
      ]
  },
  "evasive_shot": {
      "id": "evasive_shot",
      "name": "Evasive Shot",
      "slug": "evasive_shot",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano 170% + esquiva para trás",
      "canonicalCooldown": "12s",
      "canonicalCooldownMs": 12000,
      "desc": "",
      "balance": {
          "mpCost": 20,
          "pwr": 17,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_evasive_shot",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "sharpshooter"
      ]
  },
  "wind_walker": {
      "id": "wind_walker",
      "name": "Wind Walker",
      "slug": "wind_walker",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% Move Speed",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_wind_walker",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "sharpshooter"
      ]
  },
  "snipe": {
      "id": "snipe",
      "name": "Snipe",
      "slug": "snipe",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0313.webp",
      "iconGap": false,
      "iconGapReason": null,
      "canonicalEffect": "Dano 380% long range + crit bônus",
      "canonicalCooldown": "22s",
      "canonicalCooldownMs": 22000,
      "desc": "",
      "balance": {
          "mpCost": 46,
          "pwr": 38,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_snipe",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "windSniper"
      ]
  },
  "explosive_shot": {
      "id": "explosive_shot",
      "name": "Explosive Shot",
      "slug": "explosive_shot",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano AoE 280%",
      "canonicalCooldown": "18s",
      "canonicalCooldownMs": 18000,
      "desc": "",
      "balance": {
          "mpCost": 34,
          "pwr": 28,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_explosive_shot",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "windSniper"
      ]
  },
  "chain_shot": {
      "id": "chain_shot",
      "name": "Chain Shot",
      "slug": "chain_shot",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano 260% + reset Quick Shot CD",
      "canonicalCooldown": "16s",
      "canonicalCooldownMs": 16000,
      "desc": "",
      "balance": {
          "mpCost": 31,
          "pwr": 26,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_chain_shot",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "windSniper"
      ]
  },
  "aimed_shot": {
      "id": "aimed_shot",
      "name": "Aimed Shot",
      "slug": "aimed_shot",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano 340% + ignore DEF",
      "canonicalCooldown": "20s",
      "canonicalCooldownMs": 20000,
      "desc": "",
      "balance": {
          "mpCost": 41,
          "pwr": 34,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_aimed_shot",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "windSniper"
      ]
  },
  "sylphs_grace": {
      "id": "sylphs_grace",
      "name": "Sylph's Grace",
      "slug": "sylphs_grace",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% EVA, +10% Move Speed",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_sylphs_grace",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "windSniper"
      ]
  },
  "wind_sniper_harmony": {
      "id": "wind_sniper_harmony",
      "name": "Wind Sniper Harmony",
      "slug": "wind_sniper_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+35% ATK, +25% Crit, +20% Range por 25 min",
      "canonicalCooldown": "60 min",
      "canonicalCooldownMs": 3600000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 4,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_wind_sniper_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "windSniper"
      ]
  },
  "storm_shot": {
      "id": "storm_shot",
      "name": "Storm Shot",
      "slug": "storm_shot",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano vento 420% + knockback",
      "canonicalCooldown": "25s",
      "canonicalCooldownMs": 25000,
      "desc": "",
      "balance": {
          "mpCost": 50,
          "pwr": 42,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_storm_shot",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "stormBlaster"
      ]
  },
  "wind_barrage": {
      "id": "wind_barrage",
      "name": "Wind Barrage",
      "slug": "wind_barrage",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano AoE vento 380%",
      "canonicalCooldown": "22s",
      "canonicalCooldownMs": 22000,
      "desc": "",
      "balance": {
          "mpCost": 46,
          "pwr": 38,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_wind_barrage",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "stormBlaster"
      ]
  },
  "transcendent_storm_shot": {
      "id": "transcendent_storm_shot",
      "name": "Transcendent Storm Shot",
      "slug": "transcendent_storm_shot",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano vento 680% + stun 3s + AoE",
      "canonicalCooldown": "180s",
      "canonicalCooldownMs": 180000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 68,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_transcendent_storm_shot",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "stormBlaster"
      ]
  },
  "storm_blaster_spirit": {
      "id": "storm_blaster_spirit",
      "name": "Storm Blaster Spirit",
      "slug": "storm_blaster_spirit",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+25% ATK, +20% Crit, +15% Wind Damage",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_storm_blaster_spirit",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "stormBlaster"
      ]
  },
  "body_of_the_storm_blaster": {
      "id": "body_of_the_storm_blaster",
      "name": "Body of the Storm Blaster",
      "slug": "body_of_the_storm_blaster",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% Max HP, +10% EVA, +10% Move Speed",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_body_of_the_storm_blaster",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "stormBlaster"
      ]
  },
  "storm_blaster_harmony": {
      "id": "storm_blaster_harmony",
      "name": "Storm Blaster Harmony",
      "slug": "storm_blaster_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+60% ATK, +50% Crit, +35% Wind Damage por 30 min",
      "canonicalCooldown": "90 min",
      "canonicalCooldownMs": 5400000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 6,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_storm_blaster_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "stormBlaster"
      ]
  },
  "shield_of_light": {
      "id": "shield_of_light",
      "name": "Shield of Light",
      "slug": "shield_of_light",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Absorve 2500 dano + reflete holy",
      "canonicalCooldown": "30s",
      "canonicalCooldownMs": 30000,
      "desc": "",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_shield_of_light",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "lightTemplar"
      ]
  },
  "holy_shield_mastery": {
      "id": "holy_shield_mastery",
      "name": "Holy Shield Mastery",
      "slug": "holy_shield_mastery",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% DEF com escudo",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_holy_shield_mastery",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "lightTemplar"
      ]
  },
  "divine_charge": {
      "id": "divine_charge",
      "name": "Divine Charge",
      "slug": "divine_charge",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Charge 260% + taunt AoE",
      "canonicalCooldown": "18s",
      "canonicalCooldownMs": 18000,
      "desc": "",
      "balance": {
          "mpCost": 31,
          "pwr": 26,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_divine_charge",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "holyTemplar"
      ]
  },
  "sacred_aegis": {
      "id": "sacred_aegis",
      "name": "Sacred Aegis",
      "slug": "sacred_aegis",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+60% Block Rate + reflete holy 15s",
      "canonicalCooldown": "60s",
      "canonicalCooldownMs": 60000,
      "desc": "",
      "balance": {
          "mpCost": 7,
          "pwr": 6,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_sacred_aegis",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "holyTemplar",
          "divineTemplar"
      ]
  },
  "celestial_punishment": {
      "id": "celestial_punishment",
      "name": "Celestial Punishment",
      "slug": "celestial_punishment",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano sagrado 280% + silence 3s",
      "canonicalCooldown": "20s",
      "canonicalCooldownMs": 20000,
      "desc": "",
      "balance": {
          "mpCost": 34,
          "pwr": 28,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_celestial_punishment",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "holyTemplar"
      ]
  },
  "holy_chain": {
      "id": "holy_chain",
      "name": "Holy Chain",
      "slug": "holy_chain",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Taunt + root alvo 4s",
      "canonicalCooldown": "22s",
      "canonicalCooldownMs": 22000,
      "desc": "",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_holy_chain",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "holyTemplar"
      ]
  },
  "divine_templar_harmony_s2": {
      "id": "divine_templar_harmony_s2",
      "name": "Divine Templar Harmony (S2)",
      "slug": "divine_templar_harmony_s2",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+35% DEF, +25% ATK, +20% M.DEF por 25 min",
      "canonicalCooldown": "60 min",
      "canonicalCooldownMs": 3600000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 4,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_divine_templar_harmony_s2",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "holyTemplar"
      ]
  },
  "lord_knight": {
      "id": "lord_knight",
      "name": "Lord Knight",
      "slug": "lord_knight",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Forma divina: +50% DEF e ATK por 30s + regen MP",
      "canonicalCooldown": "120s",
      "canonicalCooldownMs": 120000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 5,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_lord_knight",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "divineTemplar"
      ]
  },
  "ultimate_divine_defense": {
      "id": "ultimate_divine_defense",
      "name": "Ultimate Divine Defense",
      "slug": "ultimate_divine_defense",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Imunidade total 10s + taunt AoE massivo",
      "canonicalCooldown": "300s",
      "canonicalCooldownMs": 300000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_ultimate_divine_defense",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "divineTemplar"
      ]
  },
  "divine_templar_harmony": {
      "id": "divine_templar_harmony",
      "name": "Divine Templar Harmony",
      "slug": "divine_templar_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+60% DEF, +45% Max HP, +35% Holy Damage por 30 min",
      "canonicalCooldown": "90 min",
      "canonicalCooldownMs": 5400000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 6,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_divine_templar_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "divineTemplar"
      ]
  },
  "fire_weave": {
      "id": "fire_weave",
      "name": "Fire Weave",
      "slug": "fire_weave",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano fogo 200%",
      "canonicalCooldown": "10s",
      "canonicalCooldownMs": 10000,
      "desc": "",
      "balance": {
          "mpCost": 24,
          "pwr": 20,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_fire_weave",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "elementWeaverS1"
      ]
  },
  "ice_weave": {
      "id": "ice_weave",
      "name": "Ice Weave",
      "slug": "ice_weave",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano gelo 190% + slow 20% 3s",
      "canonicalCooldown": "10s",
      "canonicalCooldownMs": 10000,
      "desc": "",
      "balance": {
          "mpCost": 23,
          "pwr": 19,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_ice_weave",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "elementWeaverS1"
      ]
  },
  "wind_weave": {
      "id": "wind_weave",
      "name": "Wind Weave",
      "slug": "wind_weave",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano vento 190%",
      "canonicalCooldown": "10s",
      "canonicalCooldownMs": 10000,
      "desc": "",
      "balance": {
          "mpCost": 23,
          "pwr": 19,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_wind_weave",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "elementWeaverS1"
      ]
  },
  "elemental_blast": {
      "id": "elemental_blast",
      "name": "Elemental Blast",
      "slug": "elemental_blast",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano elemental 280%",
      "canonicalCooldown": "16s",
      "canonicalCooldownMs": 16000,
      "desc": "",
      "balance": {
          "mpCost": 34,
          "pwr": 28,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_elemental_blast",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "elementWeaverS2"
      ]
  },
  "elemental_convergence": {
      "id": "elemental_convergence",
      "name": "Elemental Convergence",
      "slug": "elemental_convergence",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano AoE all-element 340%",
      "canonicalCooldown": "25s",
      "canonicalCooldownMs": 25000,
      "desc": "",
      "balance": {
          "mpCost": 41,
          "pwr": 34,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_elemental_convergence",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "elementWeaverS2"
      ]
  },
  "ultimate_dispel": {
      "id": "ultimate_dispel",
      "name": "Ultimate Dispel",
      "slug": "ultimate_dispel",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Remove todos os buffs do alvo",
      "canonicalCooldown": "60s",
      "canonicalCooldownMs": 60000,
      "desc": "",
      "balance": {
          "mpCost": 30,
          "pwr": 25,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_ultimate_dispel",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "elementWeaverS2"
      ]
  },
  "elemental_mastery": {
      "id": "elemental_mastery",
      "name": "Elemental Mastery",
      "slug": "elemental_mastery",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% All Elemental Damage",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_elemental_mastery",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "elementWeaverS2"
      ]
  },
  "element_weaver_harmony_s2": {
      "id": "element_weaver_harmony_s2",
      "name": "Element Weaver Harmony (S2)",
      "slug": "element_weaver_harmony_s2",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+35% M.ATK, +25% Cast Speed, +20% Elemental Damage por 25 min",
      "canonicalCooldown": "60 min",
      "canonicalCooldownMs": 3600000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 4,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_element_weaver_harmony_s2",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "elementWeaverS2"
      ]
  },
  "elemental_overload": {
      "id": "elemental_overload",
      "name": "Elemental Overload",
      "slug": "elemental_overload",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano AoE all-element 580%",
      "canonicalCooldown": "60s",
      "canonicalCooldownMs": 60000,
      "desc": "",
      "balance": {
          "mpCost": 70,
          "pwr": 58,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_elemental_overload",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "elementWeaver"
      ]
  },
  "tri_element_storm": {
      "id": "tri_element_storm",
      "name": "Tri-Element Storm",
      "slug": "tri_element_storm",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano AoE 650%",
      "canonicalCooldown": "120s",
      "canonicalCooldownMs": 120000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 65,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_tri_element_storm",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "elementWeaver"
      ]
  },
  "element_weaver_harmony": {
      "id": "element_weaver_harmony",
      "name": "Element Weaver Harmony",
      "slug": "element_weaver_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+60% M.ATK, +50% Elemental Damage por 30 min",
      "canonicalCooldown": "90 min",
      "canonicalCooldownMs": 5400000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 6,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_element_weaver_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "elementWeaver"
      ]
  },
  "pummel_strike": {
      "id": "pummel_strike",
      "name": "Pummel Strike",
      "slug": "pummel_strike",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Golpe rápido de punho: dano físico 160%",
      "canonicalCooldown": "6s",
      "canonicalCooldownMs": 6000,
      "desc": "",
      "balance": {
          "mpCost": 19,
          "pwr": 16,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_pummel_strike",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "marauderBase"
      ]
  },
  "sayha_wind_step": {
      "id": "sayha_wind_step",
      "name": "Sayha Wind Step",
      "slug": "sayha_wind_step",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% Esquiva e +15% Velocidade de Movimento",
      "canonicalCooldown": "45s",
      "canonicalCooldownMs": 45000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_sayha_wind_step",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "marauderBase"
      ]
  },
  "sayhas_harmony": {
      "id": "sayhas_harmony",
      "name": "Sayha's Harmony",
      "slug": "sayhas_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+20% P.ATK, +15% Velocidade de Ataque por 30 min",
      "canonicalCooldown": "30 min",
      "canonicalCooldownMs": 1800000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_sayhas_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "marauderBase"
      ]
  },
  "distortion_punch": {
      "id": "distortion_punch",
      "name": "Distortion Punch",
      "slug": "distortion_punch",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Punho de distorção: dano 220% + atordoamento 1.5s",
      "canonicalCooldown": "8s",
      "canonicalCooldownMs": 8000,
      "desc": "",
      "balance": {
          "mpCost": 26,
          "pwr": 22,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_distortion_punch",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "marauder"
      ]
  },
  "wind_blend_strike": {
      "id": "wind_blend_strike",
      "name": "Wind Blend Strike",
      "slug": "wind_blend_strike",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Investida com vento: dano 240% com +30% chance crítica",
      "canonicalCooldown": "10s",
      "canonicalCooldownMs": 10000,
      "desc": "",
      "balance": {
          "mpCost": 29,
          "pwr": 24,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_wind_blend_strike",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "marauder"
      ]
  },
  "aerial_combo": {
      "id": "aerial_combo",
      "name": "Aerial Combo",
      "slug": "aerial_combo",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Combo aéreo: dano 260% + lança o inimigo ao ar",
      "canonicalCooldown": "12s",
      "canonicalCooldownMs": 12000,
      "desc": "",
      "balance": {
          "mpCost": 31,
          "pwr": 26,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_aerial_combo",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "marauder"
      ]
  },
  "retaliation_counter": {
      "id": "retaliation_counter",
      "name": "Retaliation Counter",
      "slug": "retaliation_counter",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% Esquiva e contra-ataca com 100% de dano ao esquivar",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_retaliation_counter",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "marauder"
      ]
  },
  "gravity_shockwave": {
      "id": "gravity_shockwave",
      "name": "Gravity Shockwave",
      "slug": "gravity_shockwave",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Onda de choque gravitacional: dano AoE 360% + knockback",
      "canonicalCooldown": "16s",
      "canonicalCooldownMs": 16000,
      "desc": "",
      "balance": {
          "mpCost": 43,
          "pwr": 36,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_gravity_shockwave",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "ertheiaWarrior"
      ]
  },
  "eviscerate_slash": {
      "id": "eviscerate_slash",
      "name": "Eviscerate Slash",
      "slug": "eviscerate_slash",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Corte visceral: dano físico 380% com alto bônus crítico",
      "canonicalCooldown": "14s",
      "canonicalCooldownMs": 14000,
      "desc": "",
      "balance": {
          "mpCost": 46,
          "pwr": 38,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_eviscerate_slash",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "ertheiaWarrior"
      ]
  },
  "hurricane_spin_kick": {
      "id": "hurricane_spin_kick",
      "name": "Hurricane Spin Kick",
      "slug": "hurricane_spin_kick",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Chute furacão 360º: dano 340% em área",
      "canonicalCooldown": "15s",
      "canonicalCooldownMs": 15000,
      "desc": "",
      "balance": {
          "mpCost": 41,
          "pwr": 34,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_hurricane_spin_kick",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "ertheiaWarrior"
      ]
  },
  "wind_fighter_mastery": {
      "id": "wind_fighter_mastery",
      "name": "Wind Fighter Mastery",
      "slug": "wind_fighter_mastery",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+20% P.ATK, +20% Taxa de Crítico e +15% Velocidade de Ataque",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_wind_fighter_mastery",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "ertheiaWarrior"
      ]
  },
  "ultimate_eviscerate_combo": {
      "id": "ultimate_eviscerate_combo",
      "name": "Ultimate Eviscerate Combo",
      "slug": "ultimate_eviscerate_combo",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Combo supremo de 10 golpes marciais 800% + 100% Taxa de Crítico",
      "canonicalCooldown": "60s",
      "canonicalCooldownMs": 60000,
      "desc": "",
      "balance": {
          "mpCost": 80,
          "pwr": 80,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_ultimate_eviscerate_combo",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "eviscerator"
      ]
  },
  "spacetime_annihilation": {
      "id": "spacetime_annihilation",
      "name": "Spacetime Annihilation",
      "slug": "spacetime_annihilation",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Distorção dimensional devastadora: dano AoE 880% + quebra de defesa 30%",
      "canonicalCooldown": "120s",
      "canonicalCooldownMs": 120000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 88,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_spacetime_annihilation",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "eviscerator"
      ]
  },
  "sayhas_divine_protection": {
      "id": "sayhas_divine_protection",
      "name": "Sayha's Divine Protection",
      "slug": "sayhas_divine_protection",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+25% Esquiva, +20% Redução de Dano Físico recebido",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_sayhas_divine_protection",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "eviscerator"
      ]
  },
  "eviscerator_ultimate_harmony": {
      "id": "eviscerator_ultimate_harmony",
      "name": "Eviscerator Ultimate Harmony",
      "slug": "eviscerator_ultimate_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+60% P.ATK, +40% Crit Power, +35% Velocidade de Ataque por 30 min",
      "canonicalCooldown": "90 min",
      "canonicalCooldownMs": 5400000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 6,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_eviscerator_ultimate_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "eviscerator"
      ]
  },
  "sayhas_wind": {
      "id": "sayhas_wind",
      "name": "Sayha's Wind",
      "slug": "sayhas_wind",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Rajada de vento cortante: dano mágico 160%",
      "canonicalCooldown": "6s",
      "canonicalCooldownMs": 6000,
      "desc": "",
      "balance": {
          "mpCost": 19,
          "pwr": 16,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_sayhas_wind",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "sayhaMageBase"
      ]
  },
  "wind_veil": {
      "id": "wind_veil",
      "name": "Wind Veil",
      "slug": "wind_veil",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% M.ATK e +12% Esquiva por 60s",
      "canonicalCooldown": "45s",
      "canonicalCooldownMs": 45000,
      "desc": "",
      "balance": {
          "mpCost": 5,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_wind_veil",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "sayhaMageBase"
      ]
  },
  "ertheia_magic_mastery": {
      "id": "ertheia_magic_mastery",
      "name": "Ertheia Magic Mastery",
      "slug": "ertheia_magic_mastery",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% M.ATK com Cajados",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_ertheia_magic_mastery",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "sayhaMageBase"
      ]
  },
  "sayha_seers_harmony": {
      "id": "sayha_seers_harmony",
      "name": "Sayha Seer's Harmony",
      "slug": "sayha_seers_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+20% M.ATK, +20% Dano de Vento por 30 min",
      "canonicalCooldown": "30 min",
      "canonicalCooldownMs": 1800000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 2,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_sayha_seers_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "sayhaMageBase"
      ]
  },
  "sayhas_wind_strike": {
      "id": "sayhas_wind_strike",
      "name": "Sayha's Wind Strike",
      "slug": "sayhas_wind_strike",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Dano de vento concentrado 210%",
      "canonicalCooldown": "7s",
      "canonicalCooldownMs": 7000,
      "desc": "",
      "balance": {
          "mpCost": 25,
          "pwr": 21,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_sayhas_wind_strike",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "sayhaSeer"
      ]
  },
  "gale_burst": {
      "id": "gale_burst",
      "name": "Gale Burst",
      "slug": "gale_burst",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "2★",
      "starRank": 2,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Rajada explosiva de ar: dano 240% + retarda inimigo 3s",
      "canonicalCooldown": "10s",
      "canonicalCooldownMs": 10000,
      "desc": "",
      "balance": {
          "mpCost": 29,
          "pwr": 24,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_gale_burst",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "sayhaSeer"
      ]
  },
  "eye_of_the_storm": {
      "id": "eye_of_the_storm",
      "name": "Eye of the Storm",
      "slug": "eye_of_the_storm",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "1★",
      "starRank": 1,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+15% Velocidade de Cast e +10% M.DEF",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_eye_of_the_storm",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "sayhaSeer"
      ]
  },
  "typhoon_strike": {
      "id": "typhoon_strike",
      "name": "Typhoon Strike",
      "slug": "typhoon_strike",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Tufão cortante: dano AoE de vento 360%",
      "canonicalCooldown": "16s",
      "canonicalCooldownMs": 16000,
      "desc": "",
      "balance": {
          "mpCost": 43,
          "pwr": 36,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_typhoon_strike",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "windRiderErth"
      ]
  },
  "cyclone_blast": {
      "id": "cyclone_blast",
      "name": "Cyclone Blast",
      "slug": "cyclone_blast",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Ciclone ascendente: dano 340% + knockup 2s",
      "canonicalCooldown": "14s",
      "canonicalCooldownMs": 14000,
      "desc": "",
      "balance": {
          "mpCost": 41,
          "pwr": 34,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_cyclone_blast",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "windRiderErth"
      ]
  },
  "wind_domain": {
      "id": "wind_domain",
      "name": "Wind Domain",
      "slug": "wind_domain",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "3★",
      "starRank": 3,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+20% Dano Elemental de Vento e +15% Taxa de Crítico Mágico",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_wind_domain",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "windRiderErth"
      ]
  },
  "sayha_ultimate_tempest": {
      "id": "sayha_ultimate_tempest",
      "name": "Sayha Ultimate Tempest",
      "slug": "sayha_ultimate_tempest",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Tempestade Suprema de Sayha: dano AoE 820% + dispersão e retardo em massa",
      "canonicalCooldown": "60s",
      "canonicalCooldownMs": 60000,
      "desc": "",
      "balance": {
          "mpCost": 80,
          "pwr": 82,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_sayha_ultimate_tempest",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "sayhaSeeker"
      ]
  },
  "spacetime_vortex": {
      "id": "spacetime_vortex",
      "name": "Spacetime Vortex",
      "slug": "spacetime_vortex",
      "type": "active",
      "rawType": "Ativo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "Vórtice dimensional de vento: dano 860% com alta penetração mágica",
      "canonicalCooldown": "120s",
      "canonicalCooldownMs": 120000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 86,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_spacetime_vortex",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "sayhaSeeker"
      ]
  },
  "wind_spirit_transcendence": {
      "id": "wind_spirit_transcendence",
      "name": "Wind Spirit Transcendence",
      "slug": "wind_spirit_transcendence",
      "type": "passive",
      "rawType": "Passivo",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+25% M.ATK, +20% Dano Crítico Mágico, +20% Esquiva Permanente",
      "canonicalCooldown": "N/A",
      "canonicalCooldownMs": 0,
      "desc": "",
      "balance": {
          "mpCost": 0,
          "pwr": 0,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_wind_spirit_transcendence",
      "vfxGap": true,
      "sfxId": "sfx_passive",
      "sfxGap": false,
      "classes": [
          "sayhaSeeker"
      ]
  },
  "sayha_seeker_ultimate_harmony": {
      "id": "sayha_seeker_ultimate_harmony",
      "name": "Sayha Seeker Ultimate Harmony",
      "slug": "sayha_seeker_ultimate_harmony",
      "type": "buff",
      "rawType": "Self-Buff",
      "rarity": "4★",
      "starRank": 4,
      "icon": "/icons/skill0000.webp",
      "iconGap": true,
      "iconGapReason": "ASSET_NOT_IN_LIBRARY",
      "canonicalEffect": "+65% M.ATK, +45% Dano de Vento, +35% Velocidade de Cast por 30 min",
      "canonicalCooldown": "90 min",
      "canonicalCooldownMs": 5400000,
      "desc": "",
      "balance": {
          "mpCost": 40,
          "pwr": 7,
          "pveMultiplier": 1,
          "pvpMultiplier": 0.85
      },
      "vfxId": "vfx_sayha_seeker_ultimate_harmony",
      "vfxGap": true,
      "sfxId": "sfx_action",
      "sfxGap": false,
      "classes": [
          "sayhaSeeker"
      ]
  },
});

export const ALL_CANONICAL_SKILL_IDS = Object.freeze(Object.keys(CANONICAL_SKILL_REGISTRY_V2));
