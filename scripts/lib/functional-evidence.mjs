// Explicit behavioral contracts. Never infer a successful effect from production metadata.
export const EFFECT_CONTRACTS = Object.freeze({
  "power_strike": {
    "kind": "damage",
    "source": "Ataque Poderoso: deal combat damage with MP and cooldown"
  },
  "mortal_blow": {
    "kind": "damage",
    "source": "Golpe Mortal: deal combat damage with MP and cooldown"
  },
  "power_shot": {
    "kind": "damage",
    "source": "Disparo Poderoso: deal combat damage with MP and cooldown"
  },
  "weapon_mastery": {
    "kind": "passive",
    "stat": "atk",
    "source": "Weapon Mastery: increase atk"
  },
  "armor_mastery": {
    "kind": "passive",
    "stat": "def",
    "source": "Armor Mastery: increase def"
  },
  "armor_care": {
    "kind": "passive",
    "expectedDeltas": [
      { "stat": "pSkillCritRate", "direction": "increase" },
      { "stat": "pSkillCritDamagePercent", "direction": "increase" },
      { "stat": "receivedCritDamageReductionPercent", "direction": "increase" },
      { "stat": "block", "direction": "increase" }
    ],
    "source": "L2Wiki Armor Care ranks 1-2: skill critical, received critical damage reduction, and shield-ignore removal adapted to actual shield block chance; rank-2 values and real physical-skill critical path are also tested separately"
  },
  "wild_sweep": {
    "kind": "damage",
    "source": "Wild Sweep: deal combat damage with MP and cooldown"
  },
  "detect_weakness": {
    "kind": "target_debuff",
    "expectedDeltas": [
      {
        "stat": "damageTakenPercent",
        "direction": "increase"
      }
    ],
    "source": "Aden Arena adaptation: marks the current target for 8% increased damage taken over 8 seconds"
  },
  "war_cry": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "atk",
        "direction": "increase"
      }
    ],
    "source": "War Cry: known attack buff with duration and expiration"
  },
  "sword_blunt_mastery": {
    "kind": "passive",
    "stat": "atk",
    "source": "Sword/Blunt Weapon Mastery: increase atk"
  },
  "heavy_armor_mastery": {
    "kind": "passive",
    "stat": "def",
    "source": "Heavy Armor Mastery: increase def"
  },
  "blade_strike": {
    "kind": "damage",
    "source": "Blade Strike: deal combat damage with MP and cooldown"
  },
  "slashing_blade": {
    "kind": "damage",
    "source": "Slashing Blade: deal combat damage with MP and cooldown"
  },
  "rush": {
    "kind": "damage",
    "source": "Rush: deal combat damage with MP and cooldown"
  },
  "battle_roar": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "maxHp",
        "direction": "increase"
      }
    ],
    "source": "Battle Roar: canonical described effects with duration and expiration"
  },
  "dual_weapon_mastery": {
    "kind": "passive",
    "stat": "atk",
    "source": "Dual Weapon Mastery: increase atk"
  },
  "indestructible_blade": {
    "kind": "damage",
    "source": "Indestructible Blade: deal combat damage with MP and cooldown"
  },
  "blade_punishment": {
    "kind": "damage",
    "source": "Blade Punishment: deal combat damage with MP and cooldown"
  },
  "blade_storm_dance": {
    "kind": "damage",
    "source": "Blade Storm Dance: deal combat damage with MP and cooldown"
  },
  "lionheart": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "pveDamagePercent",
        "direction": "increase"
      },
      {
        "stat": "debuffResistancePercent",
        "direction": "increase"
      }
    ],
    "source": "Lionheart: canonical described effects with duration and expiration"
  },
  "master_of_combat": {
    "kind": "passive",
    "stat": "atk",
    "source": "Master of Combat: increase atk"
  },
  "vortex": {
    "kind": "damage",
    "source": "Vortex: deal combat damage with MP and cooldown"
  },
  "thunder_storm": {
    "kind": "damage",
    "source": "Thunder Storm: deal combat damage with MP and cooldown"
  },
  "quick_spear": {
    "kind": "damage",
    "source": "Quick Spear: deal combat damage with MP and cooldown"
  },
  "provoke": {
    "kind": "target_debuff",
    "expectedDeltas": [
      {
        "stat": "damageTakenPercent",
        "direction": "increase"
      }
    ],
    "source": "Provoke: adapted 5% target vulnerability for 10 seconds"
  },
  "polearm_mastery": {
    "kind": "passive",
    "stat": "atk",
    "source": "Polearm Mastery: increase atk"
  },
  "unleashed_power": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "damageTakenReductionPercent",
        "direction": "increase"
      },
      {
        "stat": "debuffResistancePercent",
        "direction": "increase"
      },
      {
        "stat": "pSkillPowerPercent",
        "direction": "increase"
      }
    ],
    "consumer": "incoming_damage_reduction",
    "incomingDamageReductionPercent": 0.03,
    "physicalSkillPowerPercent": 0.01,
    "source": "Aden Arena adaptation: 3% less received damage, 5% combat-debuff resistance, and 1% physical skill power"
  },
  "shocking_burst": {
    "kind": "damage",
    "source": "Shocking Burst: deal combat damage with MP and cooldown"
  },
  "spear_cage": {
    "kind": "damage",
    "source": "Spear Cage: deal combat damage with MP and cooldown"
  },
  "spear_howl": {
    "kind": "damage",
    "source": "Spear Howl: deal combat damage with MP and cooldown"
  },
  "shield_strike": {
    "kind": "damage",
    "source": "Shield Strike: deal combat damage with MP and cooldown"
  },
  "shield_stun": {
    "kind": "damage",
    "source": "Shield Stun: deal combat damage with MP and cooldown"
  },
  "majesty": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "def",
        "direction": "increase"
      },
      {
        "stat": "maxHp",
        "direction": "increase"
      },
      {
        "stat": "eva",
        "direction": "decrease"
      }
    ],
    "source": "Majesty: canonical described effects with duration and expiration"
  },
  "holy_strike": {
    "kind": "damage",
    "source": "Holy Strike: deal combat damage with MP and cooldown"
  },
  "knight_s_protection": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "maxHp",
        "direction": "increase"
      }
    ],
    "source": "L2Wiki Lineage II Essence knight s protection; unsupported multi-target and hit-counter mechanics are represented by the available solo-combat stats"
  },
  "shackle": {
    "kind": "target_debuff",
    "expectedDeltas": [
      {
        "stat": "actionsDisabled",
        "direction": "increase"
      }
    ],
    "expectedDurationMs": 4000,
    "consumer": "monster_action_lock",
    "source": "Shackle: target action lock prevents monster basic attacks and skills for 4 seconds"
  },
  "sacrifice": {
    "kind": "sacrifice_heal",
    "power": 350,
    "hpCostPercent": 0.1,
    "source": "Aden Arena solo adaptation: pay 10% Max HP to self-heal with canonical Power 350"
  },
  "shield_mastery": {
    "kind": "passive",
    "stat": "def",
    "source": "Shield Mastery: increase def"
  },
  "holy_circle": {
    "kind": "damage",
    "source": "Holy Circle: deal combat damage with MP and cooldown"
  },
  "phoenix_strike": {
    "kind": "damage",
    "source": "Phoenix Strike: deal combat damage with MP and cooldown"
  },
  "knight_s_assault": {
    "kind": "damage",
    "source": "Knight's Assault: deal combat damage with MP and cooldown"
  },
  "ultimate_defense": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "def",
        "direction": "increase"
      },
      {
        "stat": "mdef",
        "direction": "increase"
      }
    ],
    "source": "Aden Arena adaptation: high-cooldown Ultimate Defense grants +60% P./M. Def for 10 seconds"
  },
  "dark_strike": {
    "kind": "damage",
    "source": "Dark Strike: deal combat damage with MP and cooldown"
  },
  "dark_panther_s_help": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "pveDamagePercent",
        "direction": "increase"
      }
    ],
    "source": "Aden Arena adaptation: Dark Panther's additional hit becomes +5% owner PvE damage for 6 seconds"
  },
  "damage_reflection": {
    "kind": "damage_reflection",
    "reflectPercent": 0.03,
    "source": "Damage Reflection: reflect 3% of incoming damage through production monsterAttack"
  },
  "hamstring": {
    "kind": "target_debuff",
    "expectedDeltas": [
      {
        "stat": "movementSpeedPercent",
        "direction": "decrease"
      }
    ],
    "expectedDurationMs": 30000,
    "consumer": "monster_movement_slow",
    "source": "Aden Arena maps Hamstring movement-speed reduction to a slower monster basic-attack interval"
  },
  "condemnation": {
    "kind": "damage",
    "source": "Condemnation: deal combat damage with MP and cooldown"
  },
  "hell": {
    "kind": "damage",
    "source": "Hell: deal combat damage with MP and cooldown"
  },
  "dark_knight_s_break": {
    "kind": "damage",
    "source": "Dark Knight's Break: deal combat damage with MP and cooldown"
  },
  "touch_of_death": {
    "kind": "target_debuff",
    "expectedDeltas": [
      {
        "stat": "damageTakenPercent",
        "direction": "increase"
      }
    ],
    "expectedDurationMs": 20000,
    "hpCostPercent": 0.1,
    "source": "L2Wiki Lineage II Essence Touch of Death: self-sacrifice and timed enemy vulnerability adapted to 10% Max HP and +10% damage taken for 20 seconds"
  },
  "ultimate_evasion": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "eva",
        "direction": "increase"
      },
      {
        "stat": "pSkillEvasionPercent",
        "direction": "increase"
      },
      {
        "stat": "debuffResistancePercent",
        "direction": "increase"
      }
    ],
    "source": "Ultimate Evasion: Evasion +25, 40% physical skill evasion and adapted 80% monster-debuff resistance; 30s duration"
  },
  "open": {
    "kind": "damage",
    "source": "Open: deal combat damage with MP and cooldown"
  },
  "quick_step": {
    "kind": "passive",
    "expectedDeltas": [
      {
        "stat": "movementSpeedPercent",
        "direction": "increase"
      }
    ],
    "consumer": "basic_attack_interval",
    "source": "Canonical effect Speed +15: movement speed shortens the production basic-attack interval"
  },
  "dagger_mastery": {
    "kind": "passive",
    "stat": "atk",
    "source": "Dagger Mastery: increase atk"
  },
  "light_armor_mastery": {
    "kind": "passive",
    "stat": "def",
    "source": "Light Armor Mastery: increase def"
  },
  "deadly_blow": {
    "kind": "damage",
    "source": "Deadly Blow: deal combat damage with MP and cooldown"
  },
  "backstab": {
    "kind": "damage",
    "source": "Backstab: deal combat damage with MP and cooldown"
  },
  "fake_death": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "def",
        "direction": "increase"
      },
      {
        "stat": "mdef",
        "direction": "increase"
      },
      {
        "stat": "debuffResistancePercent",
        "direction": "increase"
      }
    ],
    "source": "Aden Arena adaptation: feigning death grants +15% P./M. Def and +10% debuff resistance for 4 seconds"
  },
  "silent_move": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "pSkillEvasionPercent",
        "direction": "increase"
      },
      {
        "stat": "mSkillEvasionPercent",
        "direction": "increase"
      }
    ],
    "source": "Aden Arena adaptation: stealth grants 10% evasion against physical and magical monster skills for 8 seconds"
  },
  "critical_power": {
    "kind": "passive",
    "stat": "critDmg",
    "source": "Critical Power: increase critDmg"
  },
  "shadow_step": {
    "kind": "target_debuff",
    "expectedDeltas": [
      {
        "stat": "movementSpeedPercent",
        "direction": "decrease"
      }
    ],
    "expectedDurationMs": 5000,
    "consumer": "monster_movement_slow",
    "source": "L2 skill text: target Speed -30%; Aden Arena maps movement suppression to basic-attack cadence"
  },
  "lethal_blow": {
    "kind": "damage",
    "source": "Lethal Blow: deal combat damage with MP and cooldown"
  },
  "critical_assault": {
    "kind": "damage",
    "source": "Critical Assault: deal combat damage with MP and cooldown"
  },
  "exciting_adventure": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "atk",
        "direction": "increase"
      },
      {
        "stat": "movementSpeedPercent",
        "direction": "increase"
      },
      {
        "stat": "eva",
        "direction": "increase"
      },
      {
        "stat": "crit",
        "direction": "increase"
      },
      {
        "stat": "pSkillEvasionPercent",
        "direction": "increase"
      },
      {
        "stat": "buffCancelResistancePercent",
        "direction": "increase"
      },
      {
        "stat": "debuffResistancePercent",
        "direction": "increase"
      }
    ],
    "consumer": "basic_attack_interval",
    "source": "L2Wiki Lineage II Essence exciting adventure; unsupported multi-target and hit-counter mechanics are represented by the available solo-combat stats"
  },
  "critical_chance": {
    "kind": "passive",
    "stat": "crit",
    "source": "Critical Chance: increase crit"
  },
  "double_shot": {
    "kind": "damage",
    "source": "Double Shot: deal combat damage with MP and cooldown"
  },
  "vortex_shot": {
    "kind": "damage",
    "source": "Vortex Shot: deal combat damage with MP and cooldown"
  },
  "snipe": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "pAccuracy",
        "direction": "increase"
      },
      {
        "stat": "atk",
        "direction": "increase"
      },
      {
        "stat": "crit",
        "direction": "increase"
      }
    ],
    "source": "L2Wiki Lineage II Essence snipe; unsupported multi-target and hit-counter mechanics are represented by the available solo-combat stats"
  },
  "bow_mastery": {
    "kind": "passive",
    "stat": "atk",
    "source": "Bow Mastery: increase atk"
  },
  "legendary_archer": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "maxHp",
        "direction": "increase"
      },
      {
        "stat": "atk",
        "direction": "increase"
      },
      {
        "stat": "crit",
        "direction": "increase"
      },
      {
        "stat": "pSkillPowerPercent",
        "direction": "increase"
      },
      {
        "stat": "pveDamagePercent",
        "direction": "increase"
      }
    ],
    "source": "L2Wiki Lineage II Essence legendary archer; unsupported multi-target and hit-counter mechanics are represented by the available solo-combat stats"
  },
  "flame_arrow_rain": {
    "kind": "damage",
    "source": "Flame Arrow Rain: deal combat damage with MP and cooldown"
  },
  "spiral_shot": {
    "kind": "damage",
    "source": "Spiral Shot: deal combat damage with MP and cooldown"
  },
  "lethal_shot": {
    "kind": "damage",
    "source": "Lethal Shot: deal combat damage with MP and cooldown"
  },
  "eye_of_slayer": {
    "kind": "passive",
    "stat": "atk",
    "source": "Eye of Slayer: increase atk"
  },
  "fireball": {
    "kind": "damage",
    "source": "Bola de Fogo: deal combat damage with MP and cooldown"
  },
  "wind_strike": {
    "kind": "damage",
    "source": "Golpe de Vento: deal combat damage with MP and cooldown"
  },
  "self_heal": {
    "kind": "heal",
    "source": "Self Heal: restore HP without exceeding maxHp"
  },
  "magic_mastery": {
    "kind": "passive",
    "stat": "matk",
    "source": "Magic Mastery: increase matk"
  },
  "robe_mastery": {
    "kind": "passive",
    "stat": "matk",
    "source": "Robe Mastery: increase matk"
  },
  "ice_bolt": {
    "kind": "damage_and_target_debuff",
    "expectedDeltas": [
      {
        "stat": "movementSpeedPercent",
        "direction": "decrease"
      }
    ],
    "expectedDurationMs": 30000,
    "consumer": "monster_movement_slow",
    "source": "Ice Bolt: damage plus target Speed -20%; movement slow lengthens basic-attack cadence"
  },
  "concentration": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "debuffResistancePercent",
        "direction": "increase"
      }
    ],
    "unchangedStats": [
      "cdr",
      "atkSpd"
    ],
    "source": "Aden Arena adaptation: 36-point casting-interruption reduction grants 36% resistance to combat debuffs"
  },
  "weakness": {
    "kind": "target_debuff",
    "expectedDeltas": [
      {
        "stat": "atk",
        "direction": "decrease"
      },
      {
        "stat": "matk",
        "direction": "decrease"
      }
    ],
    "source": "Weakness: canonical target debuff with timed stat effects"
  },
  "fast_spell_casting": {
    "kind": "passive",
    "stat": "cdr",
    "source": "Aden Arena runtime rule: Fast Spell Casting +15% maps to cooldown reduction"
  },
  "anti_magic": {
    "kind": "passive",
    "stat": "mdef",
    "source": "Anti Magic: increase mdef"
  },
  "prominence": {
    "kind": "damage",
    "source": "Prominence: deal combat damage with MP and cooldown"
  },
  "rain_of_fire": {
    "kind": "damage",
    "source": "Rain of Fire: deal combat damage with MP and cooldown"
  },
  "blazing_skin": {
    "kind": "damage_reflection",
    "reflectPercent": 0.03,
    "source": "Blazing Skin: reflect 3% of damage received, measured in production combat"
  },
  "inferno": {
    "kind": "damage_over_time",
    "expectedTicks": 10,
    "expectedDurationMs": 10000,
    "source": "L2Wiki Lineage II Essence Inferno: Fire damage, Power 150, then 10 seconds of damage over time; browser harness measures all production ticks"
  },
  "spellcraft": {
    "kind": "passive",
    "stat": "matk",
    "source": "Spellcraft: increase matk"
  },
  "meteor": {
    "kind": "damage",
    "source": "Meteor: deal combat damage with MP and cooldown"
  },
  "fire_vortex": {
    "kind": "damage",
    "source": "Fire Vortex: deal combat damage with MP and cooldown"
  },
  "mystic_meteor_master": {
    "kind": "damage",
    "source": "Mystic Meteor: Master: deal combat damage with MP and cooldown"
  },
  "arcane_power": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "matk",
        "direction": "increase"
      },
      {
        "stat": "mpCostReduction",
        "direction": "decrease"
      }
    ],
    "source": "Arcane Power: canonical described effects with duration and expiration"
  },
  "focus_mind": {
    "kind": "passive",
    "stat": "mpRegen",
    "source": "Focus Mind: increase mpRegen"
  },
  "death_spike": {
    "kind": "damage",
    "source": "Death Spike: deal combat damage with MP and cooldown"
  },
  "dark_burst": {
    "kind": "damage",
    "source": "Dark Burst: deal combat damage with MP and cooldown"
  },
  "curse_fear": {
    "kind": "target_debuff",
    "expectedDeltas": [
      {
        "stat": "atk",
        "direction": "decrease"
      },
      {
        "stat": "matk",
        "direction": "decrease"
      }
    ],
    "source": "Aden Arena adaptation: fear reduces target physical and magic attack by 15% for 5 seconds"
  },
  "anchor": {
    "kind": "target_debuff",
    "expectedDeltas": [
      {
        "stat": "actionsDisabled",
        "direction": "increase"
      }
    ],
    "expectedDurationMs": 3000,
    "consumer": "monster_action_lock",
    "source": "Anchor: target action lock prevents monster basic attacks and skills for 3 seconds"
  },
  "dark_vortex": {
    "kind": "damage",
    "source": "Dark Vortex: deal combat damage with MP and cooldown"
  },
  "void_explosion": {
    "kind": "damage",
    "source": "Void Explosion: deal combat damage with MP and cooldown"
  },
  "soul_guardian": {
    "kind": "damage",
    "source": "Soul Guardian: deal combat damage with MP and cooldown"
  },
  "summon_cursed_man": {
    "kind": "damage",
    "source": "Summon Cursed Man: deal combat damage with MP and cooldown"
  },
  "blaze": {
    "kind": "damage",
    "source": "Blaze: deal combat damage with MP and cooldown"
  },
  "summon_kat_the_cat": {
    "kind": "damage",
    "source": "Summon Kat the Cat: deal combat damage with MP and cooldown"
  },
  "servitor_share": {
    "kind": "damage",
    "source": "Servitor Share: deal combat damage with MP and cooldown"
  },
  "servitor_heal": {
    "kind": "heal",
    "source": "Servitor Heal: restore HP without exceeding maxHp"
  },
  "sigil_mastery": {
    "kind": "passive",
    "stat": "matk",
    "source": "Sigil Mastery: increase matk"
  },
  "ethereal_strike": {
    "kind": "damage",
    "source": "Ethereal Strike: deal combat damage with MP and cooldown"
  },
  "ray_of_light": {
    "kind": "damage",
    "source": "Ray of Light: deal combat damage with MP and cooldown"
  },
  "summon_feline_king": {
    "kind": "damage",
    "source": "Summon Feline King: deal combat damage with MP and cooldown"
  },
  "powerful_servitor_share": {
    "kind": "damage",
    "source": "Powerful Servitor Share: deal combat damage with MP and cooldown"
  },
  "battle_heal": {
    "kind": "heal",
    "source": "Battle Heal: restore HP without exceeding maxHp"
  },
  "divine_strike": {
    "kind": "damage",
    "source": "Divine Strike: deal combat damage with MP and cooldown"
  },
  "might": {
    "kind": "damage",
    "source": "Might: deal combat damage with MP and cooldown"
  },
  "greater_heal": {
    "kind": "heal",
    "source": "Greater Heal: restore HP without exceeding maxHp"
  },
  "purify": {
    "kind": "damage",
    "source": "Purify: deal combat damage with MP and cooldown"
  },
  "resurrection": {
    "kind": "damage",
    "source": "Resurrection: deal combat damage with MP and cooldown"
  },
  "group_heal": {
    "kind": "heal",
    "source": "Group Heal: restore HP without exceeding maxHp"
  },
  "higher_mana_gain": {
    "kind": "passive",
    "stat": "mpRegen",
    "source": "Higher Mana Gain: increase mpRegen"
  },
  "shelter": {
    "kind": "damage",
    "source": "Shelter: deal combat damage with MP and cooldown"
  },
  "cleanse": {
    "kind": "damage",
    "source": "Cleanse: deal combat damage with MP and cooldown"
  },
  "cure": {
    "kind": "damage",
    "source": "Cure: deal combat damage with MP and cooldown"
  },
  "peace": {
    "kind": "damage",
    "source": "Peace: deal combat damage with MP and cooldown"
  },
  "fatal_strike": {
    "kind": "damage",
    "source": "Fatal Strike: deal combat damage with MP and cooldown"
  },
  "might_of_heaven": {
    "kind": "damage",
    "source": "Might of Heaven: deal combat damage with MP and cooldown"
  },
  "blessed_shield": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "block",
        "direction": "increase"
      }
    ],
    "source": "Blessed Shield: +5 percentage points of shield block rate while a shield is equipped"
  },
  "dryad_root": {
    "kind": "target_debuff",
    "expectedDeltas": [
      {
        "stat": "actionsDisabled",
        "direction": "increase"
      }
    ],
    "expectedDurationMs": 4000,
    "consumer": "monster_action_lock",
    "source": "Dryad Root: target action lock prevents monster basic attacks and skills for 4 seconds"
  },
  "sephiroth": {
    "kind": "damage",
    "source": "Sephiroth: deal combat damage with MP and cooldown"
  },
  "exclusion": {
    "kind": "damage",
    "source": "Exclusion: deal combat damage with MP and cooldown"
  },
  "advanced_block": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "def",
        "direction": "increase"
      }
    ],
    "source": "Advanced Block: increases the equipped shield's physical defense by 10%"
  },
  "word_of_fear": {
    "kind": "target_debuff",
    "expectedDeltas": [
      {
        "stat": "atk",
        "direction": "decrease"
      },
      {
        "stat": "matk",
        "direction": "decrease"
      }
    ],
    "source": "Aden Arena adaptation: converts fear into a brief reduction to monster physical and magical attacks"
  },
  "hellfire": {
    "kind": "damage",
    "source": "Hellfire: deal combat damage with MP and cooldown"
  },
  "change_armor": {
    "kind": "damage",
    "source": "Change Armor: deal combat damage with MP and cooldown"
  },
  "boost_hp": {
    "kind": "passive",
    "stat": "maxHp",
    "source": "Boost HP: increase maxHp"
  },
  "punishment": {
    "kind": "damage",
    "source": "Punishment: deal combat damage with MP and cooldown"
  },
  "roar_of_death": {
    "kind": "target_debuff",
    "expectedDeltas": [
      {
        "stat": "atk",
        "direction": "decrease"
      },
      {
        "stat": "matk",
        "direction": "decrease"
      }
    ],
    "source": "Aden Arena adaptation: reduces the marked target physical and magic attack by 15% for 10 seconds"
  },
  "fist_of_fury": {
    "kind": "damage",
    "source": "Fist of Fury: deal combat damage with MP and cooldown"
  },
  "vital_force": {
    "kind": "passive",
    "stat": "maxHp",
    "source": "Vital Force: increase maxHp"
  },
  "wipeout": {
    "kind": "damage",
    "source": "Wipeout: deal combat damage with MP and cooldown"
  },
  "deadly_pull": {
    "kind": "damage",
    "source": "Deadly Pull: deal combat damage with MP and cooldown"
  },
  "stigma_of_death": {
    "kind": "damage",
    "source": "Stigma of Death: deal combat damage with MP and cooldown"
  },
  "call_of_flame": {
    "kind": "target_debuff",
    "expectedDeltas": [
      {
        "stat": "def",
        "direction": "decrease"
      },
      {
        "stat": "mdef",
        "direction": "decrease"
      }
    ],
    "source": "Aden Arena adaptation: Human Call of Flame lowers target P./M. Def by 15% for 5 seconds"
  },
  "two_handed_weapon_mastery": {
    "kind": "passive",
    "stat": "atk",
    "source": "Two-handed Weapon Mastery: increase atk"
  },
  "ultimate_death_knight": {
    "kind": "damage",
    "source": "Ultimate Death Knight: deal combat damage with MP and cooldown"
  },
  "burning_field": {
    "kind": "damage",
    "source": "Burning Field: deal combat damage with MP and cooldown"
  },
  "stigma_of_evil": {
    "kind": "damage",
    "source": "Stigma of Evil: deal combat damage with MP and cooldown"
  },
  "flame_grip": {
    "kind": "target_debuff",
    "expectedDeltas": [
      {
        "stat": "actionsDisabled",
        "direction": "increase"
      }
    ],
    "expectedDurationMs": 5000,
    "consumer": "monster_action_lock",
    "source": "Flame Grip: target action lock prevents monster basic attacks and skills for 5 seconds"
  },
  "blow": {
    "kind": "damage",
    "source": "Blow: deal combat damage with MP and cooldown"
  },
  "bandage": {
    "kind": "heal",
    "source": "Bandage: restore HP without exceeding maxHp"
  },
  "shadow_attack": {
    "kind": "damage",
    "source": "Shadow Attack: deal combat damage with MP and cooldown"
  },
  "boost_evasion": {
    "kind": "passive",
    "stat": "eva",
    "source": "Boost Evasion: increase eva"
  },
  "forward_move": {
    "kind": "damage",
    "source": "Forward Move: deal combat damage with MP and cooldown"
  },
  "sharp_blade": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "atk",
        "direction": "increase"
      }
    ],
    "unchangedStats": [
      "atkSpd"
    ],
    "source": "Lineage II Essence Assassin notes: Sharp Blade Lv. 1 gives 5% P. Atk.; Aden Arena adapts it to an 8-second buff"
  },
  "assassin_servitor": {
    "kind": "damage",
    "source": "Assassin Servitor: deal combat damage with MP and cooldown"
  },
  "assassin_s_secret_notes_1st_page": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "maxHp",
        "direction": "increase"
      },
      {
        "stat": "maxMp",
        "direction": "increase"
      },
      {
        "stat": "atk",
        "direction": "increase"
      },
      {
        "stat": "matk",
        "direction": "increase"
      },
      {
        "stat": "def",
        "direction": "increase"
      },
      {
        "stat": "mdef",
        "direction": "increase"
      },
      {
        "stat": "crit",
        "direction": "increase"
      },
      {
        "stat": "cdr",
        "direction": "increase"
      },
      {
        "stat": "pAccuracy",
        "direction": "increase"
      },
      {
        "stat": "mAccuracy",
        "direction": "increase"
      }
    ],
    "unchangedStats": [
      "atkSpd"
    ],
    "source": "Publisher patch notes: self-buff. Aden Arena maps Attack Speed to cooldown reduction, leaves Movement Speed unused, and maps accuracy to reduced level-gap miss chance; duration 15s is local balance."
  },
  "erosion": {
    "kind": "target_debuff",
    "expectedDeltas": [
      {
        "stat": "def",
        "direction": "decrease"
      },
      {
        "stat": "mdef",
        "direction": "decrease"
      }
    ],
    "source": "Aden Arena adaptation: reduces target P. Def and M. Def by 10% for 5 seconds"
  },
  "murder_attempt": {
    "kind": "target_debuff",
    "expectedDeltas": [
      {
        "stat": "def",
        "direction": "decrease"
      },
      {
        "stat": "mdef",
        "direction": "decrease"
      }
    ],
    "expectedDurationMs": 10000,
    "source": "L2Wiki Lineage II Essence Murder Attempt curse stacks to -10% P./M. Def.; Aden Arena applies its cap as a timed single-target curse"
  },
  "shadow_blast": {
    "kind": "damage",
    "source": "Shadow Blast: deal combat damage with MP and cooldown"
  },
  "clone_dance": {
    "kind": "damage",
    "source": "Clone Dance: deal combat damage with MP and cooldown"
  },
  "direct_strike": {
    "kind": "damage",
    "source": "Direct Strike: deal combat damage with MP and cooldown"
  },
  "enormous_wolf": {
    "kind": "damage",
    "source": "Enormous Wolf: deal combat damage with MP and cooldown"
  },
  "upward_strike": {
    "kind": "damage",
    "source": "Upward Strike: deal combat damage with MP and cooldown"
  },
  "devastating_assault": {
    "kind": "damage",
    "source": "Devastating Assault: deal combat damage with MP and cooldown"
  },
  "howling": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "atk",
        "direction": "increase"
      }
    ],
    "source": "L2Wiki Lineage II Essence Howling: P. Atk. +20%; Aden Arena adapts the 15 MP on-kill proc separately"
  },
  "aqua_strike": {
    "kind": "damage",
    "source": "Aqua Strike: deal combat damage with MP and cooldown"
  },
  "shield_bash": {
    "kind": "damage",
    "source": "Investida de Escudo: deal combat damage with MP and cooldown"
  },
  "battle_training": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "atk",
        "direction": "increase"
      },
      {
        "stat": "cdr",
        "direction": "increase"
      }
    ],
    "source": "L2Wiki Lineage II Essence battle training; unsupported multi-target and hit-counter mechanics are represented by the available solo-combat stats"
  },
  "life_magic_harmony_defense": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "def",
        "direction": "increase"
      },
      {
        "stat": "mdef",
        "direction": "increase"
      },
      {
        "stat": "maxHp",
        "direction": "increase"
      },
      {
        "stat": "mpRegen",
        "direction": "increase"
      }
    ],
    "source": "L2Wiki Lineage II Essence life magic harmony defense; unsupported multi-target and hit-counter mechanics are represented by the available solo-combat stats"
  },
  "supernova": {
    "kind": "damage",
    "source": "Supernova: deal combat damage with MP and cooldown"
  },
  "templar_s_rush": {
    "kind": "damage",
    "source": "Templar's Rush: deal combat damage with MP and cooldown"
  },
  "templar_s_assault": {
    "kind": "damage",
    "source": "Templar's Assault: deal combat damage with MP and cooldown"
  },
  "water_shield_throwing": {
    "kind": "damage",
    "source": "Water Shield Throwing: deal combat damage with MP and cooldown"
  },
  "guard_crush": {
    "kind": "damage",
    "source": "Guard Crush: deal combat damage with MP and cooldown"
  },
  "song_of_hunter": {
    "kind": "damage",
    "source": "Song of Hunter: deal combat damage with MP and cooldown"
  },
  "song_of_wind": {
    "kind": "damage",
    "source": "Song of Wind: deal combat damage with MP and cooldown"
  },
  "song_of_earth": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "atk",
        "direction": "increase"
      },
      {
        "stat": "def",
        "direction": "increase"
      },
      {
        "stat": "mdef",
        "direction": "increase"
      },
      {
        "stat": "crit",
        "direction": "increase"
      },
      {
        "stat": "movementSpeedPercent",
        "direction": "increase"
      },
      {
        "stat": "pSkillPowerPercent",
        "direction": "increase"
      }
    ],
    "consumer": "basic_attack_interval",
    "source": "L2Wiki Lineage II Essence song of earth; unsupported multi-target and hit-counter mechanics are represented by the available solo-combat stats"
  },
  "symphony": {
    "kind": "damage",
    "source": "Symphony: deal combat damage with MP and cooldown"
  },
  "sword_symphony": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "atk",
        "direction": "increase"
      },
      {
        "stat": "pveDamagePercent",
        "direction": "increase"
      },
      {
        "stat": "damageTakenReductionPercent",
        "direction": "increase"
      }
    ],
    "source": "L2Wiki Lineage II Essence Sword Symphony: +10% P. Atk., +10% PvE skill damage, and -10% received skill damage; sword-specific proc effects remain outside the simulator"
  },
  "song_of_cosmos": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "atk",
        "direction": "increase"
      },
      {
        "stat": "crit",
        "direction": "increase"
      },
      {
        "stat": "pSkillPowerPercent",
        "direction": "increase"
      },
      {
        "stat": "pveDamagePercent",
        "direction": "increase"
      }
    ],
    "source": "L2Wiki Lineage II Essence song of cosmos; unsupported multi-target and hit-counter mechanics are represented by the available solo-combat stats"
  },
  "eliminate_obstruction": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "debuffResistancePercent",
        "direction": "increase"
      }
    ],
    "source": "L2Wiki Lineage II Essence Eliminate Obstruction: +10% Debuff/Anomaly Resistance; on-hit cleanse chance is adapted to this solo-combat resistance"
  },
  "entangle": {
    "kind": "target_debuff",
    "expectedDeltas": [
      {
        "stat": "movementSpeedPercent",
        "direction": "decrease"
      }
    ],
    "expectedDurationMs": 3000,
    "consumer": "monster_movement_slow",
    "source": "L2Wiki Lineage II Essence Entangle Lv. 1: target Speed -70% for 3 seconds; Aden Arena maps the slow to slower basic attacks and longer monster skill cooldowns"
  },
  "fury_blade": {
    "kind": "damage",
    "source": "Fury Blade: deal combat damage with MP and cooldown"
  },
  "wind_riding": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "atk",
        "direction": "increase"
      },
      {
        "stat": "movementSpeedPercent",
        "direction": "increase"
      },
      {
        "stat": "eva",
        "direction": "increase"
      },
      {
        "stat": "crit",
        "direction": "increase"
      },
      {
        "stat": "pSkillEvasionPercent",
        "direction": "increase"
      },
      {
        "stat": "buffCancelResistancePercent",
        "direction": "increase"
      },
      {
        "stat": "debuffResistancePercent",
        "direction": "increase"
      }
    ],
    "consumer": "basic_attack_interval",
    "source": "L2Wiki Lineage II Essence wind riding; unsupported multi-target and hit-counter mechanics are represented by the available solo-combat stats"
  },
  "synchro_freedom": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "pSkillPowerPercent",
        "direction": "increase"
      },
      {
        "stat": "maxHp",
        "direction": "increase"
      },
      {
        "stat": "debuffResistancePercent",
        "direction": "increase"
      }
    ],
    "source": "L2Wiki Lineage II Essence Synchro Freedom Lv. 1, adapted to the solo combat model"
  },
  "evasion": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "pSkillEvasionPercent",
        "direction": "increase"
      },
      {
        "stat": "mSkillEvasionPercent",
        "direction": "increase"
      }
    ],
    "source": "L2Wiki Lineage II Essence evasion; unsupported multi-target and hit-counter mechanics are represented by the available solo-combat stats"
  },
  "clear_movements": {
    "kind": "damage",
    "source": "Clear Movements: deal combat damage with MP and cooldown"
  },
  "rapid_fire": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "atk",
        "direction": "increase"
      },
      {
        "stat": "cdr",
        "direction": "increase"
      }
    ],
    "source": "L2Wiki Lineage II Essence rapid fire; unsupported multi-target and hit-counter mechanics are represented by the available solo-combat stats"
  },
  "water_arrow_rain": {
    "kind": "damage",
    "source": "Water Arrow Rain: deal combat damage with MP and cooldown"
  },
  "freezing_shot": {
    "kind": "damage",
    "source": "Freezing Shot: deal combat damage with MP and cooldown"
  },
  "aqua_swirl": {
    "kind": "damage",
    "source": "Aqua Swirl: deal combat damage with MP and cooldown"
  },
  "hydro_blast": {
    "kind": "damage",
    "source": "Explosão Hídrica: deal combat damage with MP and cooldown"
  },
  "freezing_skin": {
    "kind": "buff",
    "expectedDeltas": [],
    "reflectPercent": 0.03,
    "expectedDurationMs": 20000,
    "source": "L2Wiki Lineage II Essence Freezing Skin reflects 3% of received damage; verified through the production reflection consumer"
  },
  "sleep": {
    "kind": "target_debuff",
    "expectedDeltas": [
      {
        "stat": "actionsDisabled",
        "direction": "increase"
      }
    ],
    "expectedDurationMs": 2000,
    "consumer": "monster_action_lock",
    "source": "Sleep: target action lock prevents monster basic attacks and skills for 2 seconds"
  },
  "aqua_splash": {
    "kind": "damage",
    "source": "Aqua Splash: deal combat damage with MP and cooldown"
  },
  "blizzard": {
    "kind": "damage",
    "source": "Nevasca: deal combat damage with MP and cooldown"
  },
  "ice_vortex": {
    "kind": "damage",
    "source": "Ice Vortex: deal combat damage with MP and cooldown"
  },
  "mystic_explosion": {
    "kind": "damage",
    "source": "Mystic Explosion: deal combat damage with MP and cooldown"
  },
  "mystic_freeze": {
    "kind": "damage",
    "source": "Mystic Freeze: deal combat damage with MP and cooldown"
  },
  "elemental_discharge": {
    "kind": "damage",
    "source": "Elemental Discharge: deal combat damage with MP and cooldown"
  },
  "summon_elemental_unicorn": {
    "kind": "damage",
    "source": "Summon Elemental Unicorn: deal combat damage with MP and cooldown"
  },
  "wind_shackles": {
    "kind": "target_debuff",
    "expectedDeltas": [
      {
        "stat": "attackSpeed",
        "direction": "decrease"
      },
      {
        "stat": "skillCooldown",
        "direction": "increase"
      }
    ],
    "source": "Wind Shackles: canonical target debuff with timed stat effects"
  },
  "elemental_strike": {
    "kind": "damage",
    "source": "Elemental Strike: deal combat damage with MP and cooldown"
  },
  "elemental_vortex": {
    "kind": "damage",
    "source": "Elemental Vortex: deal combat damage with MP and cooldown"
  },
  "over_the_rainbow": {
    "kind": "damage",
    "source": "Over the Rainbow: deal combat damage with MP and cooldown"
  },
  "elemental_mastership": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "matk",
        "direction": "increase"
      },
      {
        "stat": "mSkillPowerPercent",
        "direction": "increase"
      },
      {
        "stat": "maxMp",
        "direction": "increase"
      }
    ],
    "source": "L2Wiki Lineage II Essence Elemental Mastership Lv. 1, adapted to a 20-second solo-combat buff"
  },
  "heal": {
    "kind": "heal",
    "source": "Heal: restore HP without exceeding maxHp"
  },
  "mana_effect_boost": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "maxMp",
        "direction": "increase"
      },
      {
        "stat": "mpRegen",
        "direction": "increase"
      }
    ],
    "source": "Mana Effect Boost: +20% Max MP and +5.1 MP recovery rate"
  },
  "vitalize": {
    "kind": "heal_and_cleanse",
    "power": 460,
    "source": "Vitalize: recover HP using canonical power and remove active monster combat debuffs"
  },
  "eva_s_serenade": {
    "kind": "damage",
    "source": "Eva's Serenade: deal combat damage with MP and cooldown"
  },
  "shelter_master": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "def",
        "direction": "increase"
      },
      {
        "stat": "mdef",
        "direction": "increase"
      },
      {
        "stat": "debuffResistancePercent",
        "direction": "increase"
      }
    ],
    "source": "Aden Arena solo adaptation: timed physical/magic defense and combat-debuff resistance"
  },
  "divine_beam": {
    "kind": "damage",
    "source": "Divine Beam: deal combat damage with MP and cooldown"
  },
  "prophecy_of_water": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "matk",
        "direction": "increase"
      },
      {
        "stat": "cdr",
        "direction": "increase"
      },
      {
        "stat": "def",
        "direction": "increase"
      },
      {
        "stat": "mdef",
        "direction": "increase"
      },
      {
        "stat": "maxMp",
        "direction": "increase"
      },
      {
        "stat": "mpRegen",
        "direction": "increase"
      }
    ],
    "source": "L2Wiki Lineage II Essence prophecy of water; unsupported multi-target and hit-counter mechanics are represented by the available solo-combat stats"
  },
  "enlightenment": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "matk",
        "direction": "increase"
      },
      {
        "stat": "cdr",
        "direction": "increase"
      },
      {
        "stat": "crit",
        "direction": "increase"
      },
      {
        "stat": "mSkillPowerPercent",
        "direction": "increase"
      },
      {
        "stat": "healingReceivedPercent",
        "direction": "increase"
      }
    ],
    "source": "L2Wiki Lineage II Essence enlightenment; unsupported multi-target and hit-counter mechanics are represented by the available solo-combat stats"
  },
  "drain_hp": {
    "kind": "damage",
    "source": "Drain HP: deal combat damage with MP and cooldown"
  },
  "confusion": {
    "kind": "target_debuff",
    "expectedDeltas": [
      {
        "stat": "actionsDisabled",
        "direction": "increase"
      }
    ],
    "expectedDurationMs": 5000,
    "consumer": "monster_action_lock",
    "source": "Confusion: target action lock prevents monster basic attacks and skills for 5 seconds"
  },
  "abyss_strike": {
    "kind": "damage",
    "source": "Abyss Strike: deal combat damage with MP and cooldown"
  },
  "lightning_strike": {
    "kind": "damage",
    "source": "Lightning Strike: deal combat damage with MP and cooldown"
  },
  "life_leech": {
    "kind": "damage",
    "source": "Life Leech: deal combat damage with MP and cooldown"
  },
  "hex": {
    "kind": "target_debuff",
    "expectedDeltas": [
      {
        "stat": "def",
        "direction": "decrease"
      }
    ],
    "source": "Hex: canonical target debuff with timed stat effects"
  },
  "shillien_s_curse": {
    "kind": "damage",
    "source": "Shillien's Curse: deal combat damage with MP and cooldown"
  },
  "mass_lightning_strike": {
    "kind": "damage",
    "source": "Mass Lightning Strike: deal combat damage with MP and cooldown"
  },
  "lightning_wave_break": {
    "kind": "damage",
    "source": "Lightning Wave Break: deal combat damage with MP and cooldown"
  },
  "dance_of_fire": {
    "kind": "damage",
    "source": "Dance of Fire: deal combat damage with MP and cooldown"
  },
  "dance_of_warrior": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "atk",
        "direction": "increase"
      },
      {
        "stat": "def",
        "direction": "increase"
      },
      {
        "stat": "mdef",
        "direction": "increase"
      },
      {
        "stat": "pSkillPowerPercent",
        "direction": "increase"
      },
      {
        "stat": "cdr",
        "direction": "increase"
      }
    ],
    "source": "L2Wiki Lineage II Essence dance of warrior; unsupported multi-target and hit-counter mechanics are represented by the available solo-combat stats"
  },
  "dance_of_fury": {
    "kind": "damage",
    "source": "Dance of Fury: deal combat damage with MP and cooldown"
  },
  "flamenco": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "maxHp",
        "direction": "increase"
      },
      {
        "stat": "atk",
        "direction": "increase"
      },
      {
        "stat": "def",
        "direction": "increase"
      },
      {
        "stat": "mdef",
        "direction": "increase"
      },
      {
        "stat": "pveDamagePercent",
        "direction": "increase"
      },
      {
        "stat": "cdr",
        "direction": "increase"
      }
    ],
    "source": "L2Wiki Lineage II Essence Flamenco Lv. 1 caster effects adapted to solo card combat"
  },
  "deadly_rhythm": {
    "kind": "damage",
    "source": "Deadly Rhythm: deal combat damage with MP and cooldown"
  },
  "crazy_waltz": {
    "kind": "damage",
    "source": "Crazy Waltz: deal combat damage with MP and cooldown"
  },
  "frantic_pace": {
    "kind": "damage",
    "source": "Frantic Pace: deal combat damage with MP and cooldown"
  },
  "poison_blade_dance": {
    "kind": "damage",
    "source": "Poison Blade Dance: deal combat damage with MP and cooldown"
  },
  "power_break": {
    "kind": "target_debuff",
    "expectedDeltas": [
      {
        "stat": "atk",
        "direction": "decrease"
      }
    ],
    "source": "Power Break: reduces target P. Atk. by 23%; canonical text repeats the minus sign"
  },
  "dark_blow": {
    "kind": "damage",
    "source": "Dark Blow: deal combat damage with MP and cooldown"
  },
  "focus_power": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "atk",
        "direction": "increase"
      }
    ],
    "source": "L2Wiki Lineage II Essence Focus Power: dagger damage +10%, adapted to physical attack while a dagger is equipped"
  },
  "dead_eye": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "pAccuracy",
        "direction": "increase"
      },
      {
        "stat": "atk",
        "direction": "increase"
      },
      {
        "stat": "critDmg",
        "direction": "increase"
      },
      {
        "stat": "cdr",
        "direction": "decrease"
      }
    ],
    "source": "L2Wiki Lineage II Essence dead eye; unsupported multi-target and hit-counter mechanics are represented by the available solo-combat stats"
  },
  "storm_arrow_rain": {
    "kind": "damage",
    "source": "Storm Arrow Rain: deal combat damage with MP and cooldown"
  },
  "wind_shot": {
    "kind": "damage",
    "source": "Wind Shot: deal combat damage with MP and cooldown"
  },
  "twister": {
    "kind": "damage",
    "source": "Twister: deal combat damage with MP and cooldown"
  },
  "hurricane": {
    "kind": "damage",
    "source": "Furacão: deal combat damage with MP and cooldown"
  },
  "demon_wind": {
    "kind": "damage",
    "source": "Demon Wind: deal combat damage with MP and cooldown"
  },
  "silence": {
    "kind": "target_debuff",
    "expectedDeltas": [
      {
        "stat": "magicSkillsSilenced",
        "direction": "increase"
      }
    ],
    "consumer": "monster_magic_skill",
    "source": "Aden Arena adaptation: Silence blocks a monster's magical special skill for 6 seconds"
  },
  "wind_spiral": {
    "kind": "damage",
    "source": "Wind Spiral: deal combat damage with MP and cooldown"
  },
  "tempest": {
    "kind": "damage",
    "source": "Tempest: deal combat damage with MP and cooldown"
  },
  "wind_vortex": {
    "kind": "damage",
    "source": "Wind Vortex: deal combat damage with MP and cooldown"
  },
  "thunder_explosion": {
    "kind": "damage",
    "source": "Thunder Explosion: deal combat damage with MP and cooldown"
  },
  "summon_shadow": {
    "kind": "damage",
    "source": "Summon Shadow: deal combat damage with MP and cooldown"
  },
  "summon_silhouette": {
    "kind": "damage",
    "source": "Summon Silhouette: deal combat damage with MP and cooldown"
  },
  "summon_spectral_lord": {
    "kind": "damage",
    "source": "Summon Spectral Lord: deal combat damage with MP and cooldown"
  },
  "chains_of_pain": {
    "kind": "damage",
    "source": "Chains of Pain: deal combat damage with MP and cooldown"
  },
  "vampiric_rage": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "lifeDrain",
        "direction": "increase"
      }
    ],
    "source": "Vampiric Rage: adapted +5% life drain for 10 seconds"
  },
  "shillien_s_stigma": {
    "kind": "target_debuff",
    "expectedDeltas": [
      {
        "stat": "damageTakenPercent",
        "direction": "increase"
      },
      {
        "stat": "mdef",
        "direction": "decrease"
      }
    ],
    "source": "Aden Arena adaptation: translates weapon resistance marking into a short damage vulnerability and M. Def reduction"
  },
  "dark_disruption": {
    "kind": "damage",
    "source": "Dark Disruption: deal combat damage with MP and cooldown"
  },
  "nemesis": {
    "kind": "damage",
    "source": "Nemesis: deal combat damage with MP and cooldown"
  },
  "prophecy_of_wind": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "crit",
        "direction": "increase"
      },
      {
        "stat": "mSkillPowerPercent",
        "direction": "increase"
      },
      {
        "stat": "movementSpeedPercent",
        "direction": "increase"
      },
      {
        "stat": "pveDamagePercent",
        "direction": "increase"
      }
    ],
    "consumer": "basic_attack_interval",
    "source": "L2Wiki Lineage II Essence prophecy of wind; unsupported multi-target and hit-counter mechanics are represented by the available solo-combat stats"
  },
  "rose_attack": {
    "kind": "damage",
    "source": "Rose Attack: deal combat damage with MP and cooldown"
  },
  "briar_vortex": {
    "kind": "damage",
    "source": "Briar Vortex: deal combat damage with MP and cooldown"
  },
  "vine_embrace": {
    "kind": "damage",
    "source": "Vine Embrace: deal combat damage with MP and cooldown"
  },
  "enchanted_rose_s_assault": {
    "kind": "damage",
    "source": "Enchanted Rose's Assault: deal combat damage with MP and cooldown"
  },
  "aroma_of_death": {
    "kind": "damage",
    "source": "Aroma of Death: deal combat damage with MP and cooldown"
  },
  "parasite_rose": {
    "kind": "damage",
    "source": "Parasite Rose: deal combat damage with MP and cooldown"
  },
  "blooming_nightmare": {
    "kind": "damage",
    "source": "Blooming Nightmare: deal combat damage with MP and cooldown"
  },
  "bleeding_rose": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "matk",
        "direction": "increase"
      },
      {
        "stat": "crit",
        "direction": "increase"
      },
      {
        "stat": "mSkillPowerPercent",
        "direction": "increase"
      },
      {
        "stat": "pveDamagePercent",
        "direction": "increase"
      }
    ],
    "source": "L2Wiki Lineage II Essence Bleeding Rose: +5% M. Atk., M. Skill Critical Rate, M. Skill Power, and +10% PvE damage"
  },
  "kingdom_of_plants": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "matk",
        "direction": "increase"
      },
      {
        "stat": "crit",
        "direction": "increase"
      },
      {
        "stat": "pveDamagePercent",
        "direction": "increase"
      },
      {
        "stat": "mpRegen",
        "direction": "increase"
      }
    ],
    "source": "L2Wiki Lineage II Essence Kingdom of Plants Lv. 1: +10% M. Atk., +5 shared critical chance, +10% PvE damage, and +10 MP recovery"
  },
  "reflecting_illusion": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "def",
        "direction": "increase"
      },
      {
        "stat": "mdef",
        "direction": "increase"
      },
      {
        "stat": "debuffResistancePercent",
        "direction": "increase"
      },
      {
        "stat": "damageTakenReductionPercent",
        "direction": "increase"
      }
    ],
    "healPercent": 0.5,
    "reflectPercent": 0.1,
    "source": "L2Wiki Lineage II Essence Reflecting Illusion: restores 50% Max HP, adds P./M. Def. +3000, resistance +15%, reflects 10%; magic-counter reduction is adapted to general mitigation"
  },
  "crimson_rose": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "matk",
        "direction": "increase"
      },
      {
        "stat": "crit",
        "direction": "increase"
      },
      {
        "stat": "mSkillPowerPercent",
        "direction": "increase"
      },
      {
        "stat": "pveDamagePercent",
        "direction": "increase"
      },
      {
        "stat": "mpRegen",
        "direction": "increase"
      }
    ],
    "source": "L2Wiki Lineage II Essence Crimson Rose Lv. 2: +10% M. Atk., +5% magic skill crit, +2% M. Skill Power, +5% PvE damage, +10 MP recovery"
  },
  "rose_thorns": {
    "kind": "damage",
    "source": "Rose Thorns: deal combat damage with MP and cooldown"
  },
  "iron_punch": {
    "kind": "damage",
    "source": "Soco de Ferro: deal combat damage with MP and cooldown"
  },
  "rage": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "atk",
        "direction": "increase"
      },
      {
        "stat": "cdr",
        "direction": "increase"
      }
    ],
    "unchangedStats": [
      "atkSpd"
    ],
    "source": "Aden Arena adaptation: 10% physical attack and 5% cooldown reduction for 8 seconds"
  },
  "frenzy": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "atk",
        "direction": "increase"
      },
      {
        "stat": "cdr",
        "direction": "increase"
      },
      {
        "stat": "crit",
        "direction": "increase"
      },
      {
        "stat": "pSkillPowerPercent",
        "direction": "increase"
      }
    ],
    "source": "L2Wiki Lineage II Essence frenzy; unsupported multi-target and hit-counter mechanics are represented by the available solo-combat stats"
  },
  "power_crash": {
    "kind": "damage",
    "source": "Power Crash: deal combat damage with MP and cooldown"
  },
  "guts": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "def",
        "direction": "increase"
      },
      {
        "stat": "debuffResistancePercent",
        "direction": "increase"
      }
    ],
    "source": "Aden Arena adaptation: Guts preserves +400 P. Def, +35% P. Def and +25% debuff resistance for 10 seconds"
  },
  "titan_champion": {
    "kind": "damage",
    "source": "Titan Champion: deal combat damage with MP and cooldown"
  },
  "overwhelming_power": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "atk",
        "direction": "increase"
      },
      {
        "stat": "cdr",
        "direction": "increase"
      },
      {
        "stat": "crit",
        "direction": "increase"
      },
      {
        "stat": "pSkillPowerPercent",
        "direction": "increase"
      }
    ],
    "source": "L2Wiki Lineage II Essence overwhelming power; unsupported multi-target and hit-counter mechanics are represented by the available solo-combat stats"
  },
  "excruciating_strike": {
    "kind": "damage",
    "source": "Excruciating Strike: deal combat damage with MP and cooldown"
  },
  "zealot": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "cdr",
        "direction": "increase"
      },
      {
        "stat": "crit",
        "direction": "increase"
      },
      {
        "stat": "pSkillPowerPercent",
        "direction": "increase"
      }
    ],
    "source": "L2Wiki Lineage II Essence zealot; unsupported multi-target and hit-counter mechanics are represented by the available solo-combat stats"
  },
  "force_blaster": {
    "kind": "damage",
    "source": "Force Blaster: deal combat damage with MP and cooldown"
  },
  "cripple": {
    "kind": "target_debuff",
    "expectedDeltas": [
      {
        "stat": "attackSpeed",
        "direction": "decrease"
      },
      {
        "stat": "skillCooldown",
        "direction": "increase"
      },
      {
        "stat": "movementSpeedPercent",
        "direction": "decrease"
      }
    ],
    "source": "Cripple: attack/casting-speed penalties lengthen skill cooldown; movement-speed penalty slows basic attacks"
  },
  "fist_mastery": {
    "kind": "passive",
    "stat": "atk",
    "source": "Fist Mastery: increase atk"
  },
  "burning_fist": {
    "kind": "damage",
    "source": "Burning Fist: deal combat damage with MP and cooldown"
  },
  "iron_fist": {
    "kind": "damage",
    "source": "Iron Fist: deal combat damage with MP and cooldown"
  },
  "bison_spirit_totem": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "atk",
        "direction": "increase"
      },
      {
        "stat": "cdr",
        "direction": "increase"
      },
      {
        "stat": "def",
        "direction": "increase"
      },
      {
        "stat": "crit",
        "direction": "increase"
      }
    ],
    "unchangedStats": [
      "atkSpd"
    ],
    "source": "L2Wiki Lineage II Essence Bison Spirit Totem Lv. 1: P. Atk. +10%, Atk. Spd. +10%, P. Def. +5%, P. Skill Critical Rate +50; attack speed maps to cooldown reduction"
  },
  "ogre_s_essence": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "def",
        "direction": "increase"
      },
      {
        "stat": "mdef",
        "direction": "increase"
      },
      {
        "stat": "damageTakenReductionPercent",
        "direction": "increase"
      }
    ],
    "source": "L2Wiki Lineage II Essence Ogre's Essence: +300 P./M. Def. and 5% less received damage for 10 seconds"
  },
  "boost_attack_speed": {
    "kind": "passive",
    "stat": "cdr",
    "source": "Aden Arena runtime rule: Boost Attack Speed +10% maps to cooldown reduction"
  },
  "raging_force": {
    "kind": "damage",
    "source": "Raging Force: deal combat damage with MP and cooldown"
  },
  "burning_assault": {
    "kind": "damage",
    "source": "Burning Assault: deal combat damage with MP and cooldown"
  },
  "wondrous_power": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "def",
        "direction": "increase"
      },
      {
        "stat": "mdef",
        "direction": "increase"
      },
      {
        "stat": "debuffResistancePercent",
        "direction": "increase"
      }
    ],
    "source": "L2Wiki Lineage II Essence Wondrous Power: +2000 P./M. Def. and 30% combat-debuff resistance for 15 seconds"
  },
  "cacophony_of_war": {
    "kind": "damage",
    "source": "Cacophony of War: deal combat damage with MP and cooldown"
  },
  "inferno_strike": {
    "kind": "damage",
    "source": "Inferno Strike: deal combat damage with MP and cooldown"
  },
  "vortex_of_fire": {
    "kind": "damage",
    "source": "Vortex of Fire: deal combat damage with MP and cooldown"
  },
  "dreaming_spirit": {
    "kind": "target_debuff",
    "expectedDeltas": [
      {
        "stat": "actionsDisabled",
        "direction": "increase"
      }
    ],
    "expectedDurationMs": 5000,
    "consumer": "monster_action_lock",
    "source": "Dreaming Spirit: target action lock prevents monster basic attacks and skills for 5 seconds"
  },
  "frost_flame": {
    "kind": "damage_over_time",
    "expectedTicks": 15,
    "expectedDurationMs": 15000,
    "source": "Frost Flame: production combat applies 15 one-second damage ticks over 15 seconds"
  },
  "shining_prison": {
    "kind": "target_debuff",
    "expectedDeltas": [
      {
        "stat": "actionsDisabled",
        "direction": "increase"
      }
    ],
    "expectedDurationMs": 5000,
    "consumer": "monster_action_lock",
    "source": "Shining Prison: target action lock prevents monster basic attacks and skills for 5 seconds"
  },
  "life_rescue": {
    "kind": "heal",
    "expectedAmount": 127,
    "source": "Life Rescue: restore HP without exceeding maxHp"
  },
  "swap_attack": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "atk",
        "direction": "increase"
      },
      {
        "stat": "matk",
        "direction": "decrease"
      }
    ],
    "source": "Swap Attack: canonical described effects with duration and expiration"
  },
  "swap_defense": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "def",
        "direction": "increase"
      },
      {
        "stat": "mdef",
        "direction": "decrease"
      }
    ],
    "source": "Swap Defense: canonical described effects with duration and expiration"
  },
  "pa_agrio_s_glory": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "matk",
        "direction": "increase"
      },
      {
        "stat": "def",
        "direction": "increase"
      },
      {
        "stat": "mdef",
        "direction": "increase"
      },
      {
        "stat": "mSkillCdr",
        "direction": "increase"
      }
    ],
    "source": "L2Wiki Lineage II Essence Pa'agrio's Glory Lv. 3: magic attack/defense, physical defense and 15% magic-skill cooldown reduction; Aden Arena adapts its duration to 20 seconds"
  },
  "pa_agrio_s_immunity": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "matk",
        "direction": "increase"
      },
      {
        "stat": "def",
        "direction": "increase"
      },
      {
        "stat": "crit",
        "direction": "increase"
      },
      {
        "stat": "damageTakenReductionPercent",
        "direction": "increase"
      },
      {
        "stat": "debuffResistancePercent",
        "direction": "increase"
      }
    ],
    "source": "L2Wiki Lineage II Essence pa agrio s immunity; unsupported multi-target and hit-counter mechanics are represented by the available solo-combat stats"
  },
  "pa_agrio_s_touch": {
    "kind": "damage",
    "source": "Pa'agrio's Touch: deal combat damage with MP and cooldown"
  },
  "pa_agrio_s_cure": {
    "kind": "heal",
    "expectedAmount": 1800,
    "source": "L2Wiki Lineage II Essence Pa'agrio's Cure Lv. 1: 600 HP plus an additional 1200 HP, adapted to one target; CP recovery is not modeled"
  },
  "seal_of_despair": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "atk",
        "direction": "decrease"
      },
      {
        "stat": "cdr",
        "direction": "decrease"
      },
      {
        "stat": "crit",
        "direction": "decrease"
      },
      {
        "stat": "mdef",
        "direction": "decrease"
      }
    ],
    "source": "L2Wiki Lineage II Essence seal of despair; unsupported multi-target and hit-counter mechanics are represented by the available solo-combat stats"
  },
  "prophecy_of_pa_agrio": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "maxCp",
        "direction": "increase"
      },
      {
        "stat": "movementSpeedPercent",
        "direction": "increase"
      },
      {
        "stat": "cdr",
        "direction": "increase"
      },
      {
        "stat": "crit",
        "direction": "increase"
      },
      {
        "stat": "mSkillPowerPercent",
        "direction": "increase"
      }
    ],
    "source": "L2Wiki Lineage II Essence prophecy of pa agrio; unsupported multi-target and hit-counter mechanics are represented by the available solo-combat stats"
  },
  "chant_of_vampire": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "movementSpeedPercent",
        "direction": "increase"
      },
      {
        "stat": "debuffResistancePercent",
        "direction": "increase"
      }
    ],
    "unchangedStats": [
      "atkSpd",
      "cdr"
    ],
    "consumer": "chant_vampire_lifedrain",
    "requiresAttackInterval": true,
    "lifeDrainProcChance": 0.8,
    "lifeDrainProcPercent": 0.07,
    "source": "NC Essence skill table: Speed +2, Debuff/Mez Resistance +10%, and 80% chance to absorb 7% of inflicted damage; movement Speed shortens basic-attack intervals in card combat"
  },
  "chant_of_glory": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "matk",
        "direction": "increase"
      },
      {
        "stat": "def",
        "direction": "increase"
      },
      {
        "stat": "mdef",
        "direction": "increase"
      },
      {
        "stat": "mSkillCdr",
        "direction": "increase"
      },
      {
        "stat": "mSkillPowerPercent",
        "direction": "increase"
      },
      {
        "stat": "maxMp",
        "direction": "increase"
      },
      {
        "stat": "mSkillMpCostReduction",
        "direction": "increase"
      }
    ],
    "source": "L2Wiki Lineage II Essence Chant of Glory Lv. 3; source effects are adapted to a 20-second solo-combat buff"
  },
  "freezing_flame": {
    "kind": "damage_over_time",
    "expectedTicks": 10,
    "expectedDurationMs": 10000,
    "source": "Aden Arena adaptation: converts Freezing Flame's ten-second damage effect into one-second burn ticks"
  },
  "convert": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "maxHp",
        "direction": "increase"
      },
      {
        "stat": "maxMp",
        "direction": "decrease"
      }
    ],
    "source": "Convert: canonical described effects with duration and expiration"
  },
  "blood_bond": {
    "kind": "damage",
    "source": "Blood Bond: deal combat damage with MP and cooldown"
  },
  "cold_flames": {
    "kind": "damage",
    "source": "Cold Flames: deal combat damage with MP and cooldown"
  },
  "chant_of_prophecy": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "cdr",
        "direction": "increase"
      },
      {
        "stat": "movementSpeedPercent",
        "direction": "increase"
      },
      {
        "stat": "crit",
        "direction": "increase"
      },
      {
        "stat": "mSkillPowerPercent",
        "direction": "increase"
      }
    ],
    "source": "L2Wiki Lineage II Essence chant of prophecy; unsupported multi-target and hit-counter mechanics are represented by the available solo-combat stats"
  },
  "blazing_fury": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "atk",
        "direction": "increase"
      },
      {
        "stat": "def",
        "direction": "increase"
      },
      {
        "stat": "maxHp",
        "direction": "increase"
      },
      {
        "stat": "pSkillPowerPercent",
        "direction": "increase"
      }
    ],
    "source": "L2Wiki Lineage II Essence Blazing Fury Lv. 1: P. Atk., P. Def., Max HP +10%, P. Skill Power +5%; Aden Arena adapts the 20-minute source duration to 20 seconds"
  },
  "wild_rush": {
    "kind": "damage",
    "source": "Wild Rush: deal combat damage with MP and cooldown"
  },
  "piercing": {
    "kind": "damage",
    "source": "Piercing: deal combat damage with MP and cooldown"
  },
  "wild_assault": {
    "kind": "damage",
    "source": "Wild Assault: deal combat damage with MP and cooldown"
  },
  "threatening_swing": {
    "kind": "damage",
    "source": "Threatening Swing: deal combat damage with MP and cooldown"
  },
  "wild_scratch": {
    "kind": "damage",
    "source": "Wild Scratch: deal combat damage with MP and cooldown"
  },
  "wild_charge": {
    "kind": "damage",
    "source": "Wild Charge: deal combat damage with MP and cooldown"
  },
  "amazing_piercing": {
    "kind": "damage",
    "source": "Amazing Piercing: deal combat damage with MP and cooldown"
  },
  "wide_threatening_swing": {
    "kind": "damage",
    "source": "Wide Threatening Swing: deal combat damage with MP and cooldown"
  },
  "giant_s_stomp": {
    "kind": "target_debuff",
    "expectedDeltas": [
      {
        "stat": "actionsDisabled",
        "direction": "increase"
      }
    ],
    "expectedDurationMs": 3000,
    "consumer": "monster_action_lock",
    "source": "L2Wiki Lineage II Essence Giant's Stomp: three-second knockdown adapted to block target attacks and skills"
  },
  "spoil": {
    "kind": "damage",
    "source": "Spoil: deal combat damage with MP and cooldown"
  },
  "spoil_festival": {
    "kind": "damage",
    "source": "Spoil Festival: deal combat damage with MP and cooldown"
  },
  "sweeper_festival": {
    "kind": "damage",
    "source": "Sweeper Festival: deal combat damage with MP and cooldown"
  },
  "body_crush": {
    "kind": "damage",
    "source": "Body Crush: deal combat damage with MP and cooldown"
  },
  "tenacity": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "debuffResistancePercent",
        "direction": "increase"
      }
    ],
    "source": "L2Wiki Lineage II Essence Tenacity Lv. 4: +10% Shock Resistance; the five-second chance-based on-hit HP recovery is implemented in production and unit-tested"
  },
  "weapon_reinforcement": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "atk",
        "direction": "increase"
      }
    ],
    "source": "L2Wiki Lineage II Essence weapon reinforcement; unsupported multi-target and hit-counter mechanics are represented by the available solo-combat stats"
  },
  "golden_stone": {
    "kind": "damage",
    "source": "Golden Stone: deal combat damage with MP and cooldown"
  },
  "trophy_thief": {
    "kind": "damage",
    "source": "Trophy Thief: deal combat damage with MP and cooldown"
  },
  "crushing_leap": {
    "kind": "damage",
    "source": "Crushing Leap: deal combat damage with MP and cooldown"
  },
  "adena_stun": {
    "kind": "damage",
    "source": "Adena Stun: deal combat damage with MP and cooldown"
  },
  "summon_mechanic_golem": {
    "kind": "damage",
    "source": "Summon Mechanic Golem: deal combat damage with MP and cooldown"
  },
  "summon_siege_golem": {
    "kind": "damage",
    "source": "Summon Siege Golem: deal combat damage with MP and cooldown"
  },
  "repair_golem": {
    "kind": "damage",
    "source": "Repair Golem: deal combat damage with MP and cooldown"
  },
  "leopold": {
    "kind": "damage",
    "source": "Leopold: deal combat damage with MP and cooldown"
  },
  "earthquake": {
    "kind": "damage",
    "source": "Earthquake: deal combat damage with MP and cooldown"
  },
  "hammer_rumble": {
    "kind": "damage",
    "source": "Hammer Rumble: deal combat damage with MP and cooldown"
  },
  "prime_master": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "maxHp",
        "direction": "increase"
      },
      {
        "stat": "atk",
        "direction": "increase"
      },
      {
        "stat": "crit",
        "direction": "increase"
      },
      {
        "stat": "pSkillPowerPercent",
        "direction": "increase"
      },
      {
        "stat": "debuffResistancePercent",
        "direction": "increase"
      }
    ],
    "source": "L2Wiki Lineage II Essence Prime Master adapted from siege-scale bonuses to a short solo PvE stance"
  },
  "mechanical_masterpiece": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "pveDamagePercent",
        "direction": "increase"
      }
    ],
    "consumer": "mechanical_masterpiece_proc",
    "source": "L2Wiki Lineage II Essence Mechanical Masterpiece: chance-based additional attack and Mechanical Golem stun for 1 sec.; Aden Arena adapts the proc to +20% damage on a 15% attack roll and a 1-second action lock"
  },
  "earth_tremor": {
    "kind": "damage",
    "source": "Earth Tremor: deal combat damage with MP and cooldown"
  },
  "final_secret": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "pSkillPowerPercent",
        "direction": "increase"
      },
      {
        "stat": "damageTakenReductionPercent",
        "direction": "increase"
      }
    ],
    "source": "L2Wiki Lineage II Essence Final Secret: +10% physical skill power; unsupported bow/magic resistance becomes 10% incoming damage reduction for 30 seconds"
  },
  "pride_of_kamael": {
    "kind": "damage",
    "source": "Pride of Kamael: deal combat damage with MP and cooldown"
  },
  "kamael_s_dignity": {
    "kind": "damage",
    "source": "Kamael's Dignity: deal combat damage with MP and cooldown"
  },
  "death_mark": {
    "kind": "damage",
    "source": "Death Mark: deal combat damage with MP and cooldown"
  },
  "soul_smash": {
    "kind": "damage",
    "source": "Soul Smash: deal combat damage with MP and cooldown"
  },
  "soul_roar": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "atk",
        "direction": "increase"
      },
      {
        "stat": "debuffResistancePercent",
        "direction": "increase"
      }
    ],
    "source": "Aden Arena adaptation: 8% physical attack and 10% combat-debuff resistance for 8 seconds"
  },
  "soul_guard": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "def",
        "direction": "increase"
      },
      {
        "stat": "mdef",
        "direction": "increase"
      },
      {
        "stat": "debuffResistancePercent",
        "direction": "increase"
      }
    ],
    "source": "Aden Arena adaptation: 15% physical defense, 10% magic defense, and 10% combat-debuff resistance for 8 seconds"
  },
  "soul_impulse": {
    "kind": "damage",
    "source": "Soul Impulse: deal combat damage with MP and cooldown"
  },
  "enuma_elish": {
    "kind": "damage",
    "source": "Enuma Elish: deal combat damage with MP and cooldown"
  },
  "rush_impact": {
    "kind": "damage",
    "source": "Rush Impact: deal combat damage with MP and cooldown"
  },
  "powerful_rush": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "atk",
        "direction": "increase"
      },
      {
        "stat": "pveDamagePercent",
        "direction": "increase"
      },
      {
        "stat": "movementSpeedPercent",
        "direction": "increase"
      }
    ],
    "source": "L2Wiki Lineage II Essence Powerful Rush: P. Atk. +40%, PvE damage +17%, Speed +10; speed maps to basic-attack cadence"
  },
  "soul_weapon": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "atk",
        "direction": "increase"
      },
      {
        "stat": "crit",
        "direction": "increase"
      },
      {
        "stat": "pveDamagePercent",
        "direction": "increase"
      }
    ],
    "source": "L2Wiki Lineage II Essence Soul Weapon Lv. 1, adapted to the solo combat model"
  },
  "disarm": {
    "kind": "target_debuff",
    "expectedDeltas": [
      {
        "stat": "atk",
        "direction": "decrease"
      }
    ],
    "source": "Aden Arena adaptation: PvP-only disarm briefly suppresses the PvE monster's physical attack"
  },
  "through_strike": {
    "kind": "damage",
    "source": "Through Strike: deal combat damage with MP and cooldown"
  },
  "soul_haste": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "cdr",
        "direction": "increase"
      }
    ],
    "unchangedStats": [
      "atkSpd"
    ],
    "source": "Essence level-76 Haste grants +35% attack speed, mapped to +35% cooldown reduction"
  },
  "flash_dash": {
    "kind": "damage",
    "source": "Flash Dash: deal combat damage with MP and cooldown"
  },
  "soul_reinforcement": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "maxHp",
        "direction": "increase"
      },
      {
        "stat": "atk",
        "direction": "increase"
      },
      {
        "stat": "pveDamagePercent",
        "direction": "increase"
      }
    ],
    "source": "L2Wiki Lineage II Essence soul reinforcement; unsupported multi-target and hit-counter mechanics are represented by the available solo-combat stats"
  },
  "collect_shadow_souls": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "pSkillPowerPercent",
        "direction": "increase"
      }
    ],
    "source": "L2Wiki Lineage II Essence Collect Shadow Souls grants 100 Shadow Souls momentarily; Aden Arena maps the missing soul-transformation resource to a 10-second physical-skill burst"
  },
  "time_distortion_master": {
    "kind": "damage",
    "source": "Time Distortion: Master: deal combat damage with MP and cooldown"
  },
  "chain_lightning": {
    "kind": "damage",
    "source": "Corrente de Raios: deal combat damage with MP and cooldown"
  },
  "fragarach": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "debuffResistancePercent",
        "direction": "increase"
      }
    ],
    "reflectPercent": 0.1,
    "expectedDurationMs": 30000,
    "source": "L2Wiki Lineage II Essence fragarach: timed reflection adapted to modeled combat damage; https://l2wiki.com/essence/skills/soul_hound/47981_1_0.html"
  },
  "soul_blade": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "atk",
        "direction": "increase"
      },
      {
        "stat": "crit",
        "direction": "increase"
      },
      {
        "stat": "pSkillPowerPercent",
        "direction": "increase"
      }
    ],
    "source": "L2Wiki Lineage II Essence Soul Blade Lv. 1: P. Atk. +30%, skill critical rate +15%, skill critical damage +10%, skill power +10%"
  },
  "cunning_shot": {
    "kind": "damage",
    "source": "Cunning Shot: deal combat damage with MP and cooldown"
  },
  "cunning_throw": {
    "kind": "damage",
    "source": "Cunning Throw: deal combat damage with MP and cooldown"
  },
  "soul_wind_walk": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "movementSpeedPercent",
        "direction": "increase"
      }
    ],
    "unchangedStats": [
      "atkSpd",
      "cdr"
    ],
    "consumer": "basic_attack_interval",
    "source": "L2Wiki Lineage II Essence Soul Wind Walk Lv. 3: Speed +35; Aden Arena adapts movement to 6% faster basic-attack cadence for 10 seconds"
  },
  "cunning_arrow": {
    "kind": "damage",
    "source": "Cunning Arrow: deal combat damage with MP and cooldown"
  },
  "soul_wound": {
    "kind": "damage",
    "source": "Soul Wound: deal combat damage with MP and cooldown"
  },
  "collect_light_souls": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "mSkillPowerPercent",
        "direction": "increase"
      },
      {
        "stat": "mSkillCdr",
        "direction": "increase"
      }
    ],
    "source": "L2Wiki Lineage II Essence Collect Light Souls grants 100 Light Souls momentarily; Aden Arena maps the missing soul-transformation resource to a 10-second magical-skill burst"
  },
  "cunning_arrest": {
    "kind": "damage",
    "source": "Cunning Arrest: deal combat damage with MP and cooldown"
  },
  "force_unleashed": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "maxHp",
        "direction": "increase"
      },
      {
        "stat": "def",
        "direction": "increase"
      },
      {
        "stat": "mdef",
        "direction": "increase"
      },
      {
        "stat": "debuffResistancePercent",
        "direction": "increase"
      }
    ],
    "source": "L2Wiki Lineage II Essence force unleashed; unsupported multi-target and hit-counter mechanics are represented by the available solo-combat stats"
  },
  "legendary_cloak": {
    "kind": "damage",
    "source": "Legendary Cloak: deal combat damage with MP and cooldown"
  },
  "ruse": {
    "kind": "damage",
    "source": "Ruse: deal combat damage with MP and cooldown"
  },
  "single_flash": {
    "kind": "damage",
    "source": "Single Flash: deal combat damage with MP and cooldown"
  },
  "pursuit": {
    "kind": "damage",
    "source": "Pursuit: deal combat damage with MP and cooldown"
  },
  "wind": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "cdr",
        "direction": "increase"
      }
    ],
    "unchangedStats": [
      "atkSpd"
    ],
    "source": "Aden Arena adaptation: 8% cooldown reduction for 8 seconds"
  },
  "forest": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "eva",
        "direction": "increase"
      },
      {
        "stat": "debuffResistancePercent",
        "direction": "increase"
      }
    ],
    "source": "Aden Arena adaptation: 15 evasion and 10% combat-debuff resistance for 8 seconds"
  },
  "strike": {
    "kind": "damage",
    "source": "Strike: deal combat damage with MP and cooldown"
  },
  "fire": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "atk",
        "direction": "increase"
      }
    ],
    "source": "Aden Arena adaptation: 10% physical attack for 8 seconds"
  },
  "mountain": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "def",
        "direction": "increase"
      },
      {
        "stat": "mdef",
        "direction": "increase"
      }
    ],
    "source": "Aden Arena adaptation: 15% physical defense and 10% magic defense for 8 seconds"
  },
  "atsumori": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "maxHp",
        "direction": "increase"
      },
      {
        "stat": "mpRegen",
        "direction": "increase"
      },
      {
        "stat": "atk",
        "direction": "increase"
      },
      {
        "stat": "pSkillMpCostReduction",
        "direction": "increase"
      },
      {
        "stat": "pSkillCdr",
        "direction": "increase"
      }
    ],
    "source": "L2Wiki Lineage II Essence Atsumori Lv. 2: Max HP +15%, MP recovery +5, P. Atk. +8%/+300, P. Skill MP consumption -15%, P. Skill cooldown -1%"
  },
  "battojutsu": {
    "kind": "damage",
    "source": "Battojutsu: deal combat damage with MP and cooldown"
  },
  "thousand_wounds": {
    "kind": "damage",
    "source": "Thousand Wounds: deal combat damage with MP and cooldown"
  },
  "adamant_will": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "atk",
        "direction": "increase"
      },
      {
        "stat": "pSkillPowerPercent",
        "direction": "increase"
      }
    ],
    "source": "L2Wiki Lineage II Essence adamant will; unsupported multi-target and hit-counter mechanics are represented by the available solo-combat stats"
  },
  "determination": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "atk",
        "direction": "increase"
      },
      {
        "stat": "crit",
        "direction": "increase"
      },
      {
        "stat": "def",
        "direction": "increase"
      },
      {
        "stat": "debuffResistancePercent",
        "direction": "increase"
      }
    ],
    "source": "L2Wiki Lineage II Essence determination; unsupported multi-target and hit-counter mechanics are represented by the available solo-combat stats"
  },
  "take_life": {
    "kind": "damage",
    "source": "Take Life: deal combat damage with MP and cooldown"
  },
  "dual_blow": {
    "kind": "damage",
    "source": "Dual Blow: deal combat damage with MP and cooldown"
  },
  "elemental_care": {
    "kind": "damage",
    "source": "Elemental Care: deal combat damage with MP and cooldown"
  },
  "elemental_haste": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "cdr",
        "direction": "increase"
      }
    ],
    "unchangedStats": [
      "atkSpd"
    ],
    "source": "Aden Arena runtime rule: Elemental Haste maps its base attack-speed bonus to +15% cooldown reduction"
  },
  "elemental_wind_walk": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "movementSpeedPercent",
        "direction": "increase"
      }
    ],
    "unchangedStats": [
      "atkSpd",
      "cdr"
    ],
    "consumer": "basic_attack_interval",
    "source": "Aden Arena adaptation: movement speed shortens the interval between basic attacks without changing attack speed or skill cooldown"
  },
  "elemental_insight": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "matk",
        "direction": "increase"
      },
      {
        "stat": "mSkillCdr",
        "direction": "increase"
      }
    ],
    "unchangedStats": [
      "atkSpd"
    ],
    "source": "Aden Arena adaptation: 10% magic attack and 5% magic-skill cooldown reduction for 8 seconds"
  },
  "elemental_magic_barrier": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "mdef",
        "direction": "increase"
      },
      {
        "stat": "debuffResistancePercent",
        "direction": "increase"
      }
    ],
    "source": "Aden Arena adaptation: 15% magic defense and 10% debuff resistance for 8 seconds"
  },
  "fire_explosion": {
    "kind": "damage",
    "source": "Fire Explosion: deal combat damage with MP and cooldown"
  },
  "freezing_wound": {
    "kind": "damage_and_target_debuff",
    "expectedDeltas": [
      {
        "stat": "attackSpeed",
        "direction": "decrease"
      },
      {
        "stat": "skillCooldown",
        "direction": "increase"
      }
    ],
    "source": "Freezing Wound: 120% single-target damage plus a 3-second balanced attack-cadence and skill-cooldown slow"
  },
  "blessing_of_winds": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "movementSpeedPercent",
        "direction": "increase"
      },
      {
        "stat": "debuffResistancePercent",
        "direction": "increase"
      }
    ],
    "unchangedStats": [
      "atkSpd",
      "cdr"
    ],
    "consumer": "basic_attack_interval",
    "source": "Aden Arena adaptation: 8% movement speed shortens basic-attack interval and 10% debuff resistance for 10 seconds"
  },
  "greater_wind_shot": {
    "kind": "damage",
    "source": "Greater Wind Shot: deal combat damage with MP and cooldown"
  },
  "frosty_sting": {
    "kind": "damage",
    "source": "Frosty Sting: deal combat damage with MP and cooldown"
  },
  "goring_charge": {
    "kind": "damage",
    "source": "Goring Charge: deal combat damage with MP and cooldown"
  },
  "dragon_strike": {
    "kind": "damage",
    "source": "Dragon Strike: deal combat damage with MP and cooldown"
  },
  "wild_dance": {
    "kind": "target_debuff",
    "expectedDeltas": [
      {
        "stat": "actionsDisabled",
        "direction": "increase"
      }
    ],
    "expectedDurationMs": 1000,
    "consumer": "monster_action_lock",
    "source": "L2Wiki Lineage II Essence Wild Dance: knocks nearby targets back for 1 second; adapted to block target actions in the solo combat loop"
  },
  "destiny": {
    "kind": "damage",
    "source": "Destiny: deal combat damage with MP and cooldown"
  },
  "lord_knight": {
    "kind": "damage",
    "source": "Lord Knight: deal combat damage with MP and cooldown"
  },
  "shield": {
    "kind": "damage",
    "source": "Shield: deal combat damage with MP and cooldown"
  },
  "sacral_strike": {
    "kind": "damage",
    "source": "Sacral Strike: deal combat damage with MP and cooldown"
  },
  "small_protection_of_light": {
    "kind": "damage",
    "source": "Small Protection of Light: deal combat damage with MP and cooldown"
  },
  "sacral_power": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "atk",
        "direction": "increase"
      },
      {
        "stat": "crit",
        "direction": "increase"
      },
      {
        "stat": "movementSpeedPercent",
        "direction": "increase"
      }
    ],
    "consumer": "basic_attack_interval",
    "source": "L2Wiki Lineage II Essence Sacral Power Lv. 2: P. Atk. +20%, P. Skill Critical Rate +5%, Speed +20 adapted to basic-attack cadence"
  },
  "protection_of_light": {
    "kind": "damage",
    "source": "Protection of Light: deal combat damage with MP and cooldown"
  },
  "large_protection_of_light": {
    "kind": "damage",
    "source": "Large Protection of Light: deal combat damage with MP and cooldown"
  },
  "judgment": {
    "kind": "damage",
    "source": "Judgment: deal combat damage with MP and cooldown"
  },
  "flying_leap": {
    "kind": "damage",
    "source": "Flying Leap: deal combat damage with MP and cooldown"
  },
  "light_counter": {
    "kind": "buff",
    "expectedDeltas": [],
    "reflectPercent": 0.15,
    "expectedDurationMs": 20000,
    "source": "L2Wiki Lineage II Essence light_counter: timed reflection adapted to modeled combat damage; https://l2wiki.com/essence/skills/sacred_templar_3/87841_1_0.html"
  },
  "divine_guardian": {
    "kind": "damage",
    "source": "Divine Guardian: deal combat damage with MP and cooldown"
  },
  "fire_sphere": {
    "kind": "damage",
    "source": "Fire Sphere: deal combat damage with MP and cooldown"
  },
  "ice_sphere": {
    "kind": "damage",
    "source": "Ice Sphere: deal combat damage with MP and cooldown"
  },
  "bright_dance": {
    "kind": "damage",
    "source": "Bright Dance: deal combat damage with MP and cooldown"
  },
  "blazing_tempest": {
    "kind": "damage",
    "source": "Blazing Tempest: deal combat damage with MP and cooldown"
  },
  "glacier_strike": {
    "kind": "damage",
    "source": "Glacier Strike: deal combat damage with MP and cooldown"
  },
  "claidheamh_soluis": {
    "kind": "damage",
    "source": "Claidheamh Soluis: deal combat damage with MP and cooldown"
  },
  "florescence": {
    "kind": "damage",
    "source": "Florescence: deal combat damage with MP and cooldown"
  },
  "increase_power": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "atk",
        "direction": "increase"
      },
      {
        "stat": "matk",
        "direction": "increase"
      }
    ],
    "consumer": "stun_attack_proc",
    "source": "L2Wiki Lineage II Essence Trooper Increase Power Lv. 1: increases M. Atk., P. Atk. and Shock Atk. Rate by 20%; the shock bonus uses the modeled stun proc; https://l2wiki.com/essence/skills/trooper/1432_1_0.html"
  },
  "body_to_mind": {
    "kind": "resource_trade",
    "hpCostPercent": 0.1,
    "mpRecoveryPower": 90,
    "source": "L2Wiki Lineage II Essence Body to Mind Lv. 1 confirms HP sacrifice for MP recovery; Aden Arena uses its local canonical Power 90, capped at 90 MP, with a 10% Max HP cost; https://l2wiki.com/essence/skills/dark_wizard/1157_1_0.html"
  },
  "mystic_spiral": {
    "kind": "damage",
    "source": "Mystic Spiral: deal combat damage with MP and cooldown"
  },
  "growing_potential": {
    "kind": "passive",
    "expectedDeltas": [
      {
        "stat": "atk",
        "direction": "increase"
      },
      {
        "stat": "def",
        "direction": "increase"
      },
      {
        "stat": "mdef",
        "direction": "increase"
      }
    ],
    "source": "L2Wiki Essence Warg Growing Potential (88454), adapted to +5% P. Atk., P. Def., and M. Def. in card combat"
  },
  "shineMakerBase_light_spark": {
    "kind": "damage",
    "source": "Local ShineMaker base skill: holy magical damage with MP and cooldown"
  },
  "shineMakerBase_luminary_glow": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "matk",
        "direction": "increase"
      },
      {
        "stat": "def",
        "direction": "increase"
      }
    ],
    "expectedDurationMs": 8000,
    "source": "Local solo-combat adaptation: +15% M. Atk. and +10% P. Def. for eight seconds"
  },
  "shineMakerBase_crystal_weapon_mastery": {
    "kind": "passive",
    "expectedDeltas": [
      {
        "stat": "atk",
        "direction": "increase"
      }
    ],
    "source": "Local passive: +15% physical attack while a blunt weapon is equipped"
  },
  "shineMakerBase_shinemakers_harmony": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "matk",
        "direction": "increase"
      },
      {
        "stat": "def",
        "direction": "increase"
      }
    ],
    "expectedDurationMs": 1800000,
    "source": "Local authored ShineMaker harmony: +20% M. Atk. and +20% P. Def. for 30 minutes"
  },
  "shineMakerS1_light_burst": {
    "kind": "damage",
    "source": "Local Aden Arena ShineMaker skill: magical damage with MP cost and cooldown"
  },
  "shineMakerS1_radiant_strike": {
    "kind": "damage_and_target_debuff",
    "expectedDeltas": [
      {
        "stat": "atk",
        "direction": "decrease"
      },
      {
        "stat": "matk",
        "direction": "decrease"
      }
    ],
    "expectedDurationMs": 2000,
    "source": "Local Aden Arena adaptation: holy damage plus a two-second attack-pressure reduction in place of blind"
  },
  "shineMakerS1_purifying_light": {
    "kind": "cleanse",
    "source": "Local Aden Arena single-hero adaptation: heal the caster and remove one active monster debuff"
  },
  "shineMakerS1_shining_barrier": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "def",
        "direction": "increase"
      },
      {
        "stat": "mdef",
        "direction": "increase"
      }
    ],
    "expectedDurationMs": 120000,
    "source": "Local authored ShineMaker skill: +15% physical and magical defense for 120 seconds"
  },
  "shineMakerS2_prismatic_ray": {
    "kind": "damage_and_target_debuff",
    "expectedDeltas": [
      {
        "stat": "attackSpeed",
        "direction": "decrease"
      },
      {
        "stat": "skillCooldown",
        "direction": "increase"
      }
    ],
    "expectedDurationMs": 4000,
    "consumer": "monster_speed_slow",
    "source": "Local Aden Arena adaptation: holy damage plus a four-second slow that delays monster attacks and skill reuse"
  },
  "shineMakerS2_shining_nova": {
    "kind": "damage_and_self_heal",
    "healPercent": 0.1,
    "source": "Local solo adaptation: area damage focuses the encounter target and redirects the ten-percent group heal to the caster"
  },
  "shineMakerS2_crystal_arrow": {
    "kind": "damage",
    "source": "Local ShineMaker magical projectile: damage with MP cost and cooldown"
  },
  "shineMakerS2_light_of_creation": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "matk",
        "direction": "increase"
      }
    ],
    "expectedDurationMs": 120000,
    "source": "Local solo adaptation: +25% M. Atk. and +10% magic-skill power for 120 seconds; unsupported healing-power is mapped to magic-skill power"
  },
  "shineMakerS2_brilliant_aura": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "atk",
        "direction": "increase"
      },
      {
        "stat": "matk",
        "direction": "increase"
      },
      {
        "stat": "def",
        "direction": "increase"
      },
      {
        "stat": "mdef",
        "direction": "increase"
      }
    ],
    "expectedDurationMs": 300000,
    "source": "Local solo adaptation: party aura applies ten-percent offense and defense bonuses to its owner"
  },
  "shineMakerS2_shinemaker_harmony_s2": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "matk",
        "direction": "increase"
      },
      {
        "stat": "mdef",
        "direction": "increase"
      }
    ],
    "expectedDurationMs": 1500000,
    "source": "Local solo adaptation: +35% M. Atk., +20% M. Def. and +10% magic-skill power for 25 minutes"
  },
  "shinemaker_star_fall": {
    "kind": "damage_and_target_debuff",
    "expectedDeltas": [
      {
        "stat": "actionsDisabled",
        "direction": "increase"
      }
    ],
    "expectedDurationMs": 3000,
    "consumer": "monster_action_lock",
    "source": "Local authored skill: holy damage plus a three-second stun that prevents monster basic and skill actions"
  },
  "shinemaker_transcendent_star_fall": {
    "kind": "damage_and_target_debuff",
    "expectedDeltas": [
      {
        "stat": "atk",
        "direction": "decrease"
      },
      {
        "stat": "matk",
        "direction": "decrease"
      }
    ],
    "expectedDurationMs": 5000,
    "healPercent": 0.3,
    "source": "Local solo adaptation: holy damage, a five-second attack reduction in place of blind, and the group heal redirected to its caster"
  },
  "shinemaker_divine_crystal_aegis": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "damageTakenReductionPercent",
        "direction": "increase"
      }
    ],
    "expectedDurationMs": 8000,
    "incomingDamageReductionPercent": 0.35,
    "physicalSkillPowerPercent": 0,
    "consumer": "incoming_damage_reduction",
    "source": "Local solo adaptation: the shield reduces incoming damage by 35% for eight seconds"
  },
  "shinemaker_shinemakers_ultimate_harmony": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "matk",
        "direction": "increase"
      },
      {
        "stat": "def",
        "direction": "increase"
      },
      {
        "stat": "cdr",
        "direction": "increase"
      }
    ],
    "expectedDurationMs": 1800000,
    "source": "Local solo adaptation: +30% M. Atk., +20% P. Def. and +10% cooldown reduction for 30 minutes"
  },
  "powerful_fists": {
    "kind": "multi_hit_damage",
    "expectedHits": 2,
    "defenseIgnorePercent": 0.25,
    "source": "Powerful Fists: two physical hits; each hit resolves against 25% lower target P. Def"
  },
  "glorious_warrior_enhanced_abilities": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "con",
        "direction": "increase"
      },
      {
        "stat": "men",
        "direction": "increase"
      },
      {
        "stat": "maxHp",
        "direction": "increase"
      },
      {
        "stat": "maxMp",
        "direction": "increase"
      },
      {
        "stat": "mdef",
        "direction": "increase"
      }
    ],
    "source": "Aden Arena adaptation: CON +1 and MEN +1 feed their existing primary-stat scaling for 10 seconds"
  },
  "tough_skin": {
    "kind": "passive",
    "expectedDeltas": [
      {
        "stat": "debuffResistancePercent",
        "direction": "increase"
      }
    ],
    "source": "Local Warg skill catalog: +20% debuff resistance, consumed by monster Hex/Gloom application"
  },
  "confused_mind": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "def",
        "direction": "increase"
      },
      {
        "stat": "mdef",
        "direction": "increase"
      },
      {
        "stat": "cdr",
        "direction": "increase"
      }
    ],
    "unchangedStats": [
      "atkSpd"
    ],
    "source": "Aden Arena adaptation: instant wolf transformation becomes an 8-second defensive stance; movement speed maps to cooldown reduction"
  },
  "wind_walk": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "movementSpeedPercent",
        "direction": "increase"
      }
    ],
    "unchangedStats": [
      "atkSpd",
      "cdr"
    ],
    "consumer": "basic_attack_interval",
    "source": "Aden Arena adaptation: movement speed shortens the interval between basic attacks without changing attack speed or skill cooldown"
  },
  "magic_barrier": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "mdef",
        "direction": "increase"
      }
    ],
    "source": "Aden Arena adaptation: Magic Barrier grants +10% M. Def for 10 seconds"
  },
  "berserker_spirit": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "atk",
        "direction": "increase"
      },
      {
        "stat": "matk",
        "direction": "increase"
      },
      {
        "stat": "cdr",
        "direction": "increase"
      },
      {
        "stat": "def",
        "direction": "decrease"
      },
      {
        "stat": "mdef",
        "direction": "decrease"
      },
      {
        "stat": "eva",
        "direction": "decrease"
      }
    ],
    "unchangedStats": [
      "atkSpd"
    ],
    "source": "Aden Arena adaptation of Berserker Spirit's offense/defense tradeoff; attack/cast speed bonuses become +10% cooldown reduction for 8 seconds"
  },
  "wild_magic": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "crit",
        "direction": "increase"
      }
    ],
    "source": "Aden Arena adaptation: maps Wild Magic's magic critical chance to +5 shared critical chance for 8 seconds"
  },
  "improved_speed": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "cdr",
        "direction": "increase"
      }
    ],
    "unchangedStats": [
      "atkSpd"
    ],
    "source": "Aden Arena adaptation: unused movement speed becomes +10% cooldown reduction for 12 seconds"
  },
  "hp_recovery": {
    "kind": "periodic_regen",
    "stat": "regenHp",
    "resource": "hp",
    "ticks": 50,
    "source": "HP Recovery adds +1% max HP to the production 10-second recovery tick per learned level"
  },
  "mp_recovery": {
    "kind": "periodic_regen",
    "stat": "mpRegen",
    "resource": "mp",
    "ticks": 50,
    "source": "MP Recovery adds +0.5 MP to each production 5-second recovery tick per learned level"
  },
  "call_of_frost": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "atk",
        "direction": "increase"
      },
      {
        "stat": "pveDamagePercent",
        "direction": "increase"
      }
    ],
    "source": "Aden Arena adaptation: Elf Call of Frost grants +5% P. Atk and +2% PvE damage for 10 seconds"
  },
  "call_of_lightning": {
    "kind": "target_debuff",
    "expectedDeltas": [
      {
        "stat": "actionsDisabled",
        "direction": "increase"
      }
    ],
    "source": "Aden Arena adaptation: Dark Elf Call of Lightning interrupts the target for 1 second"
  },
  "assassin_s_secret_notes_2nd_page": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "maxHp",
        "direction": "increase"
      },
      {
        "stat": "maxMp",
        "direction": "increase"
      },
      {
        "stat": "atk",
        "direction": "increase"
      },
      {
        "stat": "matk",
        "direction": "increase"
      },
      {
        "stat": "def",
        "direction": "increase"
      },
      {
        "stat": "mdef",
        "direction": "increase"
      },
      {
        "stat": "crit",
        "direction": "increase"
      },
      {
        "stat": "cdr",
        "direction": "increase"
      },
      {
        "stat": "pAccuracy",
        "direction": "increase"
      },
      {
        "stat": "mAccuracy",
        "direction": "increase"
      }
    ],
    "unchangedStats": [
      "atkSpd"
    ],
    "source": "Publisher patch notes: self-buff. Aden Arena maps Attack Speed to cooldown reduction, leaves Movement Speed unused, and maps accuracy to reduced level-gap miss chance; duration 15s is local balance."
  },
  "assassin_s_secret_notes_3rd_page": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "maxHp",
        "direction": "increase"
      },
      {
        "stat": "maxMp",
        "direction": "increase"
      },
      {
        "stat": "atk",
        "direction": "increase"
      },
      {
        "stat": "matk",
        "direction": "increase"
      },
      {
        "stat": "def",
        "direction": "increase"
      },
      {
        "stat": "mdef",
        "direction": "increase"
      },
      {
        "stat": "crit",
        "direction": "increase"
      },
      {
        "stat": "cdr",
        "direction": "increase"
      },
      {
        "stat": "pAccuracy",
        "direction": "increase"
      },
      {
        "stat": "mAccuracy",
        "direction": "increase"
      }
    ],
    "unchangedStats": [
      "atkSpd"
    ],
    "source": "Publisher patch notes: self-buff. Aden Arena maps Attack Speed to cooldown reduction, leaves Movement Speed unused, and maps accuracy to reduced level-gap miss chance; duration 15s is local balance."
  },
  "quick_dash": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "cdr",
        "direction": "increase"
      }
    ],
    "unchangedStats": [
      "atkSpd"
    ],
    "source": "Aden Arena adaptation: movement becomes +5% skill cooldown reduction for 2 seconds"
  },
  "moon_influence": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "atk",
        "direction": "increase"
      },
      {
        "stat": "def",
        "direction": "increase"
      },
      {
        "stat": "mdef",
        "direction": "increase"
      },
      {
        "stat": "cdr",
        "direction": "increase"
      },
      {
        "stat": "debuffResistancePercent",
        "direction": "increase"
      }
    ],
    "unchangedStats": [
      "atkSpd"
    ],
    "source": "Aden Arena adaptation: Moon Influence replaces an unavailable WP transformation with a 12-second stance"
  },
  "artful_disarm": {
    "kind": "target_debuff",
    "expectedDeltas": [
      {
        "stat": "atk",
        "direction": "decrease"
      }
    ],
    "source": "Aden Arena adaptation: reduces target P. Atk. by 20% for 5 seconds"
  },
  "imminent_piercing": {
    "kind": "target_debuff",
    "expectedDeltas": [
      {
        "stat": "def",
        "direction": "decrease"
      }
    ],
    "source": "Aden Arena adaptation: reduces target P. Def. by 15% for 5 seconds"
  },
  "unleashed_potential": {
    "kind": "passive",
    "expectedDeltas": [
      {
        "stat": "atk",
        "direction": "increase"
      },
      {
        "stat": "cdr",
        "direction": "increase"
      },
      {
        "stat": "debuffResistancePercent",
        "direction": "increase"
      }
    ],
    "source": "Aden Arena adaptation: the unsupported WP/form cycle becomes a modest passive combat core"
  },
  "divine_inspiration": {
    "kind": "passive",
    "expectedDeltas": [
      {
        "stat": "buffDurationPercent",
        "direction": "increase"
      }
    ],
    "source": "Aden Arena adaptation: +1 buff slot becomes +10% player self-buff duration because combat has no slot cap"
  },
  "long_shot": {
    "kind": "passive",
    "stat": "atk",
    "source": "Long Shot: adapted bow/crossbow range bonus to +5% physical attack"
  },
  "death_whisper": {
    "kind": "passive",
    "stat": "critDmg",
    "source": "Death Whisper: canonical Basic Critical Damage +25%"
  },
  "clarity": {
    "kind": "passive",
    "expectedDeltas": [
      {
        "stat": "pSkillMpCostReduction",
        "direction": "increase"
      },
      {
        "stat": "mSkillMpCostReduction",
        "direction": "increase"
      }
    ],
    "source": "Clarity: P. Skill MP Consumption -10%; M. Skill MP Consumption -4%"
  },
  "haste": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "cdr",
        "direction": "increase"
      }
    ],
    "unchangedStats": [
      "atkSpd"
    ],
    "source": "Aden Arena runtime rule: Haste maps its +15% attack speed to +15% cooldown reduction"
  },
  "acumen": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "cdr",
        "direction": "increase"
      }
    ],
    "unchangedStats": [
      "atkSpd"
    ],
    "source": "Aden Arena runtime rule: Acumen grants +15% cooldown reduction"
  },
  "young_moon_s_grace": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "maxHp",
        "direction": "increase"
      },
      {
        "stat": "maxMp",
        "direction": "increase"
      },
      {
        "stat": "atk",
        "direction": "increase"
      },
      {
        "stat": "cdr",
        "direction": "increase"
      }
    ],
    "unchangedStats": [
      "atkSpd"
    ],
    "expectedDurationMs": 1200000,
    "consumer": "basic_attack_interval",
    "source": "L2Wiki Essence Warg skill 88477: +3% Max HP/MP, +2% P./M. Atk./Def., +2% Atk. Spd. and +3 Speed; speed maps to skill cooldown and basic-attack interval in Aden Arena"
  },
  "moon_s_grace": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "maxHp",
        "direction": "increase"
      },
      {
        "stat": "maxMp",
        "direction": "increase"
      },
      {
        "stat": "atk",
        "direction": "increase"
      },
      {
        "stat": "cdr",
        "direction": "increase"
      }
    ],
    "unchangedStats": [
      "atkSpd"
    ],
    "expectedDurationMs": 1200000,
    "consumer": "basic_attack_interval",
    "source": "L2Wiki Essence Warg skill 88478: +5% Max HP/MP, +2% P./M. Atk./Def., +3% Atk. Spd. and +4 Speed; speed maps to skill cooldown and basic-attack interval in Aden Arena"
  },
  "full_moon_s_grace": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "maxHp",
        "direction": "increase"
      },
      {
        "stat": "maxMp",
        "direction": "increase"
      },
      {
        "stat": "atk",
        "direction": "increase"
      },
      {
        "stat": "cdr",
        "direction": "increase"
      }
    ],
    "unchangedStats": [
      "atkSpd"
    ],
    "expectedDurationMs": 1200000,
    "consumer": "basic_attack_interval",
    "source": "L2Wiki Essence Warg skill 88479: +7% Max HP/MP, +3% P./M. Atk./Def., +5% Atk. Spd. and +5 Speed; speed maps to skill cooldown and basic-attack interval in Aden Arena"
  },
  "potion_mastery": {
    "kind": "passive",
    "stat": "hpPotionEffectPercent",
    "source": "Potion Mastery: HP Recovery Potions' Effect +10%"
  },
  "chant_of_haste": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "cdr",
        "direction": "increase"
      }
    ],
    "unchangedStats": [
      "atkSpd"
    ],
    "source": "Aden Arena runtime rule: Chant of Haste attack-speed bonus maps to +15% cooldown reduction"
  },
  "maphr_s_haste": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "cdr",
        "direction": "increase"
      }
    ],
    "unchangedStats": [
      "atkSpd"
    ],
    "source": "Essence level-76 Maphr's Haste grants +35% attack speed, mapped to +35% cooldown reduction"
  },
  "chant_of_acumen": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "cdr",
        "direction": "increase"
      }
    ],
    "unchangedStats": [
      "atkSpd"
    ],
    "source": "Aden Arena runtime rule: Chant of Acumen casting-speed bonus maps to +15% cooldown reduction"
  },
  "maphr_s_acumen": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "cdr",
        "direction": "increase"
      }
    ],
    "unchangedStats": [
      "atkSpd"
    ],
    "source": "Essence level-76 Maphr's Acumen grants +33% casting speed, mapped to +33% cooldown reduction"
  },
  "soul_acumen": {
    "kind": "buff",
    "expectedDeltas": [
      {
        "stat": "cdr",
        "direction": "increase"
      }
    ],
    "unchangedStats": [
      "atkSpd"
    ],
    "source": "Essence level-76 Soul Acumen grants +33% casting speed, mapped to +33% cooldown reduction"
  }
});

export function assessEffect(contract, evidence) {
  if (!contract) return { status: "NOT_VALIDATED", pass: null, reason: "Independent effect contract missing", evidence };
  if (contract.kind === "defined_not_implemented" || contract.status === "DEFINED_BUT_NOT_IMPLEMENTED") {
    return { status: "NOT_VALIDATED", pass: null, reason: contract.reason || "Skill is explicitly defined but has no production effect", contract, evidence };
  }
  if (evidence.preconditionsMet === false) return { status: "NOT_EXECUTED", pass: null, reason: "Effect was not evaluated because learning or execution preconditions failed", contract, evidence };
  let pass = false;
  const expectedDeltas = contract.expectedDeltas || (contract.stat ? [{ stat: contract.stat, direction: "increase" }] : []);
  if (contract.kind === "buff" && (contract.unsupportedEffects?.length || (!expectedDeltas.length && !Number.isFinite(contract.reflectPercent)))) return { status: "NOT_VALIDATED", pass: null, reason: "Buff contains effects without a supported independent contract", contract, evidence };
  if (contract.kind === "target_debuff" && (contract.unsupportedEffects?.length || !expectedDeltas.length)) return { status: "NOT_VALIDATED", pass: null, reason: "Target effect contains behavior without a supported independent contract", contract, evidence };
  if (contract.kind === "damage_and_target_debuff" && (contract.unsupportedEffects?.length || !expectedDeltas.length)) return { status: "NOT_VALIDATED", pass: null, reason: "Combined damage and target effect lacks a complete independent contract", contract, evidence };
  const deltasMatch = (before, after, expired, deltas) => deltas.every(({ stat, direction }) => { const start = before?.[stat], active = after?.[stat], end = expired?.[stat]; return Number.isFinite(start) && Number.isFinite(active) && (direction === "increase" ? active > start : active < start) && (expired == null || (Number.isFinite(end) && end === start)); });
  const unchangedStatsMatch = (stats = []) => stats.every(stat => { const before = evidence.before?.[stat], after = evidence.after?.[stat], expired = evidence.expired?.[stat]; return Number.isFinite(before) && Number.isFinite(after) && Number.isFinite(expired) && before === after && before === expired; });
  if (contract.kind === "passive") {
    let consumerPassed = true;
    if (contract.consumer === "basic_attack_interval") {
      consumerPassed = evidence.consumerProof?.baselineIntervalMs > evidence.consumerProof?.reducedIntervalMs &&
        evidence.consumerProof?.productionConsumer === "main.resolvePlayerBasicAttackIntervalMs";
    }
    pass = expectedDeltas.length > 0 && deltasMatch(evidence.before, evidence.after, null, expectedDeltas) && consumerPassed;
  }
  if (contract.kind === "periodic_regen") {
    pass = Number(evidence.before?.[contract.stat]) >= 0 && Number(evidence.after?.[contract.stat]) > Number(evidence.before?.[contract.stat]) &&
      evidence.ticks === contract.ticks && Number.isFinite(evidence.resourceBefore) && Number.isFinite(evidence.resourceAfter) &&
      evidence.resourceAfter > evidence.resourceBefore && evidence.resourceGained === evidence.resourceAfter - evidence.resourceBefore;
  }
  if (contract.kind === "buff") {
    let consumerPassed = true;
    if (contract.consumer === "basic_attack_interval") {
      consumerPassed = evidence.consumerProof?.baselineIntervalMs > evidence.consumerProof?.reducedIntervalMs &&
        evidence.consumerProof?.productionConsumer === "main.resolvePlayerBasicAttackIntervalMs";
    } else if (contract.consumer === "incoming_damage_reduction") {
      consumerPassed = evidence.consumerProof?.baselineDamage > 0 && evidence.consumerProof?.reducedDamage === Math.floor(evidence.consumerProof.baselineDamage * (1 - contract.incomingDamageReductionPercent));
      consumerPassed = consumerPassed && evidence.consumerProof?.physicalSkillDamageBefore > 0 && evidence.consumerProof?.physicalSkillDamageAfter === Math.floor(evidence.consumerProof.physicalSkillDamageBefore * (1 + contract.physicalSkillPowerPercent));
    } else if (contract.consumer === "chant_vampire_lifedrain") {
      consumerPassed = evidence.consumerProof?.procDamage > 0 &&
        evidence.consumerProof?.procHealing === Math.floor(evidence.consumerProof.procDamage * contract.lifeDrainProcPercent) &&
        evidence.consumerProof?.controlDamage > 0 && evidence.consumerProof?.controlHealing === 0 &&
        (!contract.requiresAttackInterval || evidence.consumerProof?.baselineIntervalMs > evidence.consumerProof?.reducedIntervalMs);
    } else if (Number.isFinite(contract.reflectPercent)) {
      consumerPassed = evidence.consumerProof?.receivedDamage > 0 &&
        evidence.consumerProof?.reflectedDamage >= Math.floor(evidence.consumerProof.receivedDamage * contract.reflectPercent) &&
        evidence.consumerProof?.productionConsumer === "main.monsterAttack -> resolvePlayerDamageReflection";
    } else if (contract.consumer === "mechanical_masterpiece_proc") {
      consumerPassed = evidence.consumerProof?.bonusDamage > 0 && evidence.consumerProof?.targetLocked === true &&
        evidence.consumerProof?.productionConsumer === "main.attackMonster -> resolveMechanicalMasterpieceHit";
    } else if (contract.consumer === "stun_attack_proc") {
      consumerPassed = evidence.consumerProof?.targetStunned === true &&
        evidence.consumerProof?.productionConsumer === "main.attackMonster -> getEquippedProcBonuses";
    }
    const durationPassed = !Number.isFinite(contract.expectedDurationMs) || Math.abs(evidence.expiresInMs - contract.expectedDurationMs) <= 100;
    const healPassed = !Number.isFinite(contract.healPercent) || evidence.healAmount === Math.min(evidence.maxHp - evidence.hpBefore, Math.floor(evidence.maxHp * contract.healPercent));
    pass = evidence.applied === true && evidence.expiresInMs > 0 && durationPassed && healPassed && deltasMatch(evidence.before, evidence.after, evidence.expired, expectedDeltas) && unchangedStatsMatch(contract.unchangedStats) && consumerPassed;
  }
  if (contract.kind === "target_debuff") {
    let consumerPassed = true;
    if (contract.consumer === "monster_magic_skill") {
      consumerPassed = evidence.consumerProof?.controlCooldown > 0 && evidence.consumerProof?.silencedCooldown === 0 && evidence.consumerProof?.controlDamage > evidence.consumerProof?.silencedDamage;
    } else if (contract.consumer === "monster_action") {
      consumerPassed = evidence.consumerProof?.controlCooldown > 0 && evidence.consumerProof?.sleepCooldown === 0 && evidence.consumerProof?.controlDamage > 0 && evidence.consumerProof?.sleepDamage === 0 && evidence.consumerProof?.wakeDamage > 0 && evidence.consumerProof?.wakeCooldown > 0;
    } else if (contract.consumer === "monster_action_lock") {
      const proof = evidence.consumerProof;
      consumerPassed = proof?.basicDamageBefore > 0 && proof.basicDamageWhileDisabled === 0 && proof.basicDamageAfterExpiry > 0 &&
        proof.skillDamageBefore > 0 && proof.skillDamageWhileDisabled === 0 && proof.skillDamageAfterExpiry > 0 && proof.skillCooldownWhileDisabled === 0;
    } else if (contract.consumer === "monster_speed_slow") {
      const proof = evidence.consumerProof;
      consumerPassed = proof?.basicAttackSpeedBefore > proof?.basicAttackSpeedAfter &&
        proof?.skillCooldownBefore > 0 && proof.skillCooldownAfter > proof.skillCooldownBefore &&
        proof?.productionConsumer === "main.monsterAttack";
    } else if (contract.consumer === "monster_movement_slow") {
      const proof = evidence.consumerProof;
      consumerPassed = proof?.basicAttackIntervalAfter > proof?.basicAttackIntervalBefore &&
        proof?.skillCooldownBefore === proof?.skillCooldownAfter &&
        proof?.productionConsumer === "main.attackMonster.enemyAttackInterval";
    }
    const hpCostPassed = !Number.isFinite(contract.hpCostPercent) || (evidence.hpBefore > Math.floor(evidence.maxHp * contract.hpCostPercent) && evidence.hpBefore - evidence.hpAfter === Math.floor(evidence.maxHp * contract.hpCostPercent));
    pass = evidence.applied === true && evidence.expiresInMs > 0 && (!Number.isFinite(contract.expectedDurationMs) || Math.abs(evidence.expiresInMs - contract.expectedDurationMs) <= 100) && deltasMatch(evidence.before, evidence.after, evidence.expired, expectedDeltas) && consumerPassed && hpCostPassed;
  }
  if (contract.kind === "damage_and_target_debuff") {
    const damage = (evidence.events || []).filter(event => event.skillId === evidence.skillId).reduce((sum, event) => sum + (Number(event.damage) || 0), 0);
    const selfHeal = Number.isFinite(contract.healPercent)
      ? evidence.playerHpAfterCast - evidence.playerHpBeforeCast === Math.min(evidence.maxHp - evidence.playerHpBeforeCast, Math.floor(evidence.maxHp * contract.healPercent))
      : true;
    const movementConsumerPassed = contract.consumer !== "monster_movement_slow" ||
      (evidence.consumerProof?.basicAttackIntervalAfter > evidence.consumerProof?.basicAttackIntervalBefore &&
       evidence.consumerProof?.skillCooldownBefore === evidence.consumerProof?.skillCooldownAfter &&
       evidence.consumerProof?.productionConsumer === "main.attackMonster.enemyAttackInterval");
    pass = evidence.cast === true && evidence.applied === true && evidence.expiresInMs > 0 && selfHeal && movementConsumerPassed &&
      deltasMatch(evidence.before, evidence.after, evidence.expired, expectedDeltas) &&
      damage > 0 && evidence.hpBefore - evidence.hpAfter === damage;
  }
  if (contract.kind === "damage_and_self_heal") {
    const damage = (evidence.events || []).filter(event => event.skillId === evidence.skillId).reduce((sum, event) => sum + (Number(event.damage) || 0), 0);
    const expectedHeal = Math.min(evidence.maxHp - evidence.playerHpBeforeCast, Math.floor(evidence.maxHp * contract.healPercent));
    pass = evidence.cast === true && damage > 0 && evidence.hpBefore - evidence.hpAfter === damage &&
      evidence.selfHealPercent === contract.healPercent && evidence.playerHpAfterCast - evidence.playerHpBeforeCast === expectedHeal && expectedHeal > 0;
  }
  if (contract.kind === "damage") {
    const damage = (evidence.events || []).filter(e => e.skillId === evidence.skillId).reduce((n, e) => n + (e.damage || 0), 0);
    pass = damage > 0 && evidence.hpBefore - evidence.hpAfter === damage;
  }
  if (contract.kind === "multi_hit_damage") {
    const hits = (evidence.events || []).filter(event => event.skillId === evidence.skillId);
    const damage = hits.reduce((sum, event) => sum + (Number(event.damage) || 0), 0);
    const hitIndexes = new Set(hits.map(event => event.hitIndex));
    pass = evidence.cast === true && hits.length === contract.expectedHits && hitIndexes.size === contract.expectedHits &&
      hits.every(event => event.hitCount === contract.expectedHits && event.defenseIgnorePercent === contract.defenseIgnorePercent &&
        Number.isFinite(event.targetDefenseBefore) && Number.isFinite(event.effectiveDefense) &&
        event.effectiveDefense === Math.floor(event.targetDefenseBefore * (1 - contract.defenseIgnorePercent))) &&
      damage > 0 && evidence.hpBefore - evidence.hpAfter === damage;
  }
  if (contract.kind === "damage_over_time") {
    const ticks = (evidence.events || []).filter(e => e.skillId === evidence.skillId && e.source === "damage_over_time");
    const totalTickDamage = ticks.reduce((sum, event) => sum + (event.damage || 0), 0);
    pass = evidence.cast === true && evidence.applied === true && evidence.expired === true && ticks.length === contract.expectedTicks && evidence.expiresInMs === contract.expectedDurationMs && totalTickDamage > 0 && ticks.every(tick => tick.hpBefore - tick.hpAfter === tick.damage);
  }
  if (contract.kind === "damage_reflection") pass = evidence.applied === true && evidence.expiresInMs > 0 && Number.isFinite(evidence.receivedDamage) && evidence.receivedDamage > 0 && evidence.reflectedDamage === Math.floor(evidence.receivedDamage * contract.reflectPercent);
  if (contract.kind === "heal") {
    const healed = evidence.hpAfter - evidence.hpBefore;
    const expected = Number.isFinite(contract.expectedAmount) ? Math.min(contract.expectedAmount, Math.max(0, evidence.maxHp - evidence.hpBefore)) : null;
    pass = evidence.cast === true && healed > 0 && evidence.hpAfter <= evidence.maxHp && (expected === null || healed === expected);
  }
  if (contract.kind === "heal_and_cleanse") {
    const healed = evidence.hpAfter - evidence.hpBefore;
    pass = evidence.cast === true && evidence.healPower === contract.power && healed > 0 && healed === evidence.expectedHeal && evidence.hpAfter <= evidence.maxHp && Array.isArray(evidence.cleansedDebuffs) && evidence.cleansedDebuffs.length > 0;
  }
  if (contract.kind === "cleanse") {
    pass = evidence.cast === true && Array.isArray(evidence.debuffsBefore) && evidence.debuffsBefore.length > 0 &&
      Array.isArray(evidence.cleansedDebuffs) && evidence.cleansedDebuffs.length === evidence.debuffsBefore.length;
  }
  if (contract.kind === "sacrifice_heal") {
    const hpCost = Math.floor(evidence.maxHp * contract.hpCostPercent);
    const expectedAfter = Math.min(evidence.maxHp, evidence.hpBefore - hpCost + evidence.expectedHeal);
    pass = evidence.cast === true && evidence.healPower === contract.power && evidence.hpCost === hpCost && evidence.hpBefore > hpCost && evidence.hpAfter === expectedAfter && evidence.hpAfter > evidence.hpBefore && evidence.hpAfter <= evidence.maxHp;
  }
  if (contract.kind === "resource_trade") {
    const expectedHpCost = Math.floor(evidence.maxHp * contract.hpCostPercent);
    const expectedMpRecovery = Math.min(evidence.maxMp - evidence.mpBefore, contract.mpRecoveryPower);
    pass = evidence.cast === true && evidence.hpCost === expectedHpCost && evidence.hpBefore > expectedHpCost &&
      evidence.hpAfter === evidence.hpBefore - expectedHpCost && evidence.mpRecovered === expectedMpRecovery && expectedMpRecovery > 0;
  }
  return { status: pass ? "PASS" : "FAIL", pass, contract, evidence };
}

export function assessEffectCoverage(observedSkillIds, contracts) {
  const unique = [...new Set(observedSkillIds)];
  const unmappedSkills = unique.filter(id => !contracts[id]);
  const unimplementedSkills = unique.filter(id => contracts[id]?.kind === "defined_not_implemented" || contracts[id]?.kind === "unimplemented");
  const implementedContracts = unique.filter(id => contracts[id] && !unmappedSkills.includes(id) && !unimplementedSkills.includes(id)).length;
  const contractsConfigured = unique.length - unmappedSkills.length;
  return { totalUniqueSkills: unique.length, contractsConfigured, implementedContracts, unmappedSkills, unimplementedSkills, pass: unique.length > 0 && !unmappedSkills.length && !unimplementedSkills.length };
}

export function summarizeAudit(classes, proofs, requiredCoverage = []) {
  const checks = [...classes.flatMap(c => [...(c.checks || []), ...(c.skills || []).flatMap(s => [...(s.checks || []), s.effect].filter(Boolean))]), ...proofs];
  const failed = checks.filter(c => c.pass === false);
  const missing = checks.filter(c => c.pass === null || c.status === "NOT_VALIDATED");
  const blocked = classes.filter(c => c.contentStatus?.startsWith("BLOCKED"));
  const completeCoverage = requiredCoverage.length > 0 && requiredCoverage.every(c => c.executed === true && c.pass === true);
  return {
    overallStatus: failed.length ? "FAIL" : (blocked.length || missing.length || !completeCoverage ? "APPROVAL_BLOCKED" : "PASS"),
    classCount: classes.length, skillCaseCount: classes.reduce((n, c) => n + (c.skills?.length || 0), 0),
    blockedSkillAssignments: classes.reduce((n, c) => n + (c.skills || []).filter(skill =>
      skill.classAssignment?.validated === false || (!skill.classAssignment && c.contentStatus?.startsWith("BLOCKED"))
    ).length, 0),
    failedAssertions: failed.length, unvalidatedAssertions: missing.length,
    contentBlockedClassIds: blocked.map(c => c.classId), requiredCoverage,
  };
}
