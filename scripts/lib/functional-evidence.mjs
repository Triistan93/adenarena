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
  "wild_sweep": {
    "kind": "damage",
    "source": "Wild Sweep: deal combat damage with MP and cooldown"
  },
  "detect_weakness": {
    "kind": "buff",
    "stat": "atk",
    "source": "Detect Weakness: attack buff with duration and expiration"
  },
  "war_cry": {
    "kind": "buff",
    "stat": "atk",
    "source": "War Cry: attack buff with duration and expiration"
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
    "stat": "atk",
    "source": "Battle Roar: attack buff with duration and expiration"
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
    "stat": "atk",
    "source": "Lionheart: attack buff with duration and expiration"
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
    "kind": "buff",
    "stat": "atk",
    "source": "Provoke: attack buff with duration and expiration"
  },
  "polearm_mastery": {
    "kind": "passive",
    "stat": "atk",
    "source": "Polearm Mastery: increase atk"
  },
  "unleashed_power": {
    "kind": "buff",
    "stat": "atk",
    "source": "Unleashed Power: attack buff with duration and expiration"
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
    "stat": "atk",
    "source": "Majesty: attack buff with duration and expiration"
  },
  "holy_strike": {
    "kind": "damage",
    "source": "Holy Strike: deal combat damage with MP and cooldown"
  },
  "knight_s_protection": {
    "kind": "buff",
    "stat": "atk",
    "source": "Knight's Protection: attack buff with duration and expiration"
  },
  "shackle": {
    "kind": "buff",
    "stat": "atk",
    "source": "Shackle: attack buff with duration and expiration"
  },
  "sacrifice": {
    "kind": "buff",
    "stat": "atk",
    "source": "Sacrifice: attack buff with duration and expiration"
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
    "stat": "atk",
    "source": "Ultimate Defense: attack buff with duration and expiration"
  },
  "dark_strike": {
    "kind": "damage",
    "source": "Dark Strike: deal combat damage with MP and cooldown"
  },
  "dark_panther_s_help": {
    "kind": "buff",
    "stat": "atk",
    "source": "Dark Panther's Help: attack buff with duration and expiration"
  },
  "damage_reflection": {
    "kind": "buff",
    "stat": "atk",
    "source": "Damage Reflection: attack buff with duration and expiration"
  },
  "hamstring": {
    "kind": "buff",
    "stat": "atk",
    "source": "Hamstring: attack buff with duration and expiration"
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
    "kind": "buff",
    "stat": "atk",
    "source": "Touch of Death: attack buff with duration and expiration"
  },
  "ultimate_evasion": {
    "kind": "buff",
    "stat": "atk",
    "source": "Ultimate Evasion: attack buff with duration and expiration"
  },
  "open": {
    "kind": "damage",
    "source": "Open: deal combat damage with MP and cooldown"
  },
  "quick_step": {
    "kind": "passive",
    "stat": "speed",
    "source": "Quick Step: increase speed"
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
    "stat": "atk",
    "source": "Fake Death: attack buff with duration and expiration"
  },
  "silent_move": {
    "kind": "buff",
    "stat": "atk",
    "source": "Silent Move: attack buff with duration and expiration"
  },
  "critical_power": {
    "kind": "passive",
    "stat": "critDmg",
    "source": "Critical Power: increase critDmg"
  },
  "shadow_step": {
    "kind": "buff",
    "stat": "atk",
    "source": "Shadow Step: attack buff with duration and expiration"
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
    "stat": "atk",
    "source": "Exciting Adventure: attack buff with duration and expiration"
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
    "stat": "atk",
    "source": "Snipe: attack buff with duration and expiration"
  },
  "bow_mastery": {
    "kind": "passive",
    "stat": "atk",
    "source": "Bow Mastery: increase atk"
  },
  "legendary_archer": {
    "kind": "buff",
    "stat": "atk",
    "source": "Legendary Archer: attack buff with duration and expiration"
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
    "kind": "damage",
    "source": "Dardo de Gelo: deal combat damage with MP and cooldown"
  },
  "concentration": {
    "kind": "buff",
    "stat": "atk",
    "source": "Concentration: attack buff with duration and expiration"
  },
  "weakness": {
    "kind": "buff",
    "stat": "atk",
    "source": "Weakness: attack buff with duration and expiration"
  },
  "fast_spell_casting": {
    "kind": "passive",
    "stat": "speed",
    "source": "Fast Spell Casting: increase speed"
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
    "kind": "buff",
    "stat": "atk",
    "source": "Blazing Skin: attack buff with duration and expiration"
  },
  "inferno": {
    "kind": "buff",
    "stat": "atk",
    "source": "Inferno: attack buff with duration and expiration"
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
    "stat": "atk",
    "source": "Arcane Power: attack buff with duration and expiration"
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
    "kind": "buff",
    "stat": "atk",
    "source": "Curse Fear: attack buff with duration and expiration"
  },
  "anchor": {
    "kind": "buff",
    "stat": "atk",
    "source": "Anchor: attack buff with duration and expiration"
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
    "kind": "buff",
    "stat": "atk",
    "source": "Battle Heal: attack buff with duration and expiration"
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
    "kind": "buff",
    "stat": "atk",
    "source": "Greater Heal: attack buff with duration and expiration"
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
    "kind": "buff",
    "stat": "atk",
    "source": "Group Heal: attack buff with duration and expiration"
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
    "stat": "atk",
    "source": "Blessed Shield: attack buff with duration and expiration"
  },
  "dryad_root": {
    "kind": "buff",
    "stat": "atk",
    "source": "Dryad Root: attack buff with duration and expiration"
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
    "stat": "atk",
    "source": "Advanced Block: attack buff with duration and expiration"
  },
  "word_of_fear": {
    "kind": "buff",
    "stat": "atk",
    "source": "Word of Fear: attack buff with duration and expiration"
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
    "kind": "buff",
    "stat": "atk",
    "source": "Roar of Death: attack buff with duration and expiration"
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
    "kind": "buff",
    "stat": "atk",
    "source": "Call of Flame: attack buff with duration and expiration"
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
    "kind": "buff",
    "stat": "atk",
    "source": "Flame Grip: attack buff with duration and expiration"
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
    "stat": "atk",
    "source": "Sharp Blade: attack buff with duration and expiration"
  },
  "assassin_servitor": {
    "kind": "damage",
    "source": "Assassin Servitor: deal combat damage with MP and cooldown"
  },
  "assassin_s_secret_notes_1st_page": {
    "kind": "damage",
    "source": "Assassin's Secret Notes - 1st Page: deal combat damage with MP and cooldown"
  },
  "erosion": {
    "kind": "buff",
    "stat": "atk",
    "source": "Erosion: attack buff with duration and expiration"
  },
  "murder_attempt": {
    "kind": "buff",
    "stat": "atk",
    "source": "Murder Attempt: attack buff with duration and expiration"
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
    "stat": "atk",
    "source": "Howling: attack buff with duration and expiration"
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
    "stat": "atk",
    "source": "Battle Training: attack buff with duration and expiration"
  },
  "life_magic_harmony_defense": {
    "kind": "buff",
    "stat": "atk",
    "source": "Life Magic Harmony - Defense: attack buff with duration and expiration"
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
    "stat": "atk",
    "source": "Song of Earth: attack buff with duration and expiration"
  },
  "symphony": {
    "kind": "damage",
    "source": "Symphony: deal combat damage with MP and cooldown"
  },
  "sword_symphony": {
    "kind": "buff",
    "stat": "atk",
    "source": "Sword Symphony: attack buff with duration and expiration"
  },
  "song_of_cosmos": {
    "kind": "buff",
    "stat": "atk",
    "source": "Song of Cosmos: attack buff with duration and expiration"
  },
  "eliminate_obstruction": {
    "kind": "buff",
    "stat": "atk",
    "source": "Eliminate Obstruction: attack buff with duration and expiration"
  },
  "entangle": {
    "kind": "buff",
    "stat": "atk",
    "source": "Entangle: attack buff with duration and expiration"
  },
  "fury_blade": {
    "kind": "damage",
    "source": "Fury Blade: deal combat damage with MP and cooldown"
  },
  "wind_riding": {
    "kind": "buff",
    "stat": "atk",
    "source": "Wind Riding: attack buff with duration and expiration"
  },
  "synchro_freedom": {
    "kind": "buff",
    "stat": "atk",
    "source": "Synchro Freedom: attack buff with duration and expiration"
  },
  "evasion": {
    "kind": "buff",
    "stat": "atk",
    "source": "Evasion: attack buff with duration and expiration"
  },
  "clear_movements": {
    "kind": "damage",
    "source": "Clear Movements: deal combat damage with MP and cooldown"
  },
  "rapid_fire": {
    "kind": "buff",
    "stat": "atk",
    "source": "Rapid Fire: attack buff with duration and expiration"
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
    "stat": "atk",
    "source": "Freezing Skin: attack buff with duration and expiration"
  },
  "sleep": {
    "kind": "buff",
    "stat": "atk",
    "source": "Sleep: attack buff with duration and expiration"
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
    "kind": "buff",
    "stat": "atk",
    "source": "Wind Shackles: attack buff with duration and expiration"
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
    "stat": "atk",
    "source": "Elemental Mastership: attack buff with duration and expiration"
  },
  "heal": {
    "kind": "buff",
    "stat": "atk",
    "source": "Heal: attack buff with duration and expiration"
  },
  "mana_effect_boost": {
    "kind": "buff",
    "stat": "atk",
    "source": "Mana Effect Boost: attack buff with duration and expiration"
  },
  "vitalize": {
    "kind": "buff",
    "stat": "atk",
    "source": "Vitalize: attack buff with duration and expiration"
  },
  "eva_s_serenade": {
    "kind": "damage",
    "source": "Eva's Serenade: deal combat damage with MP and cooldown"
  },
  "shelter_master": {
    "kind": "buff",
    "stat": "atk",
    "source": "Shelter: Master: attack buff with duration and expiration"
  },
  "divine_beam": {
    "kind": "damage",
    "source": "Divine Beam: deal combat damage with MP and cooldown"
  },
  "prophecy_of_water": {
    "kind": "buff",
    "stat": "atk",
    "source": "Prophecy of Water: attack buff with duration and expiration"
  },
  "enlightenment": {
    "kind": "buff",
    "stat": "atk",
    "source": "Enlightenment: attack buff with duration and expiration"
  },
  "drain_hp": {
    "kind": "damage",
    "source": "Drain HP: deal combat damage with MP and cooldown"
  },
  "confusion": {
    "kind": "buff",
    "stat": "atk",
    "source": "Confusion: attack buff with duration and expiration"
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
    "kind": "buff",
    "stat": "atk",
    "source": "Hex: attack buff with duration and expiration"
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
    "stat": "atk",
    "source": "Dance of Warrior: attack buff with duration and expiration"
  },
  "dance_of_fury": {
    "kind": "damage",
    "source": "Dance of Fury: deal combat damage with MP and cooldown"
  },
  "flamenco": {
    "kind": "buff",
    "stat": "atk",
    "source": "Flamenco: attack buff with duration and expiration"
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
    "kind": "buff",
    "stat": "atk",
    "source": "Power Break: attack buff with duration and expiration"
  },
  "dark_blow": {
    "kind": "damage",
    "source": "Dark Blow: deal combat damage with MP and cooldown"
  },
  "focus_power": {
    "kind": "buff",
    "stat": "atk",
    "source": "Focus Power: attack buff with duration and expiration"
  },
  "dead_eye": {
    "kind": "buff",
    "stat": "atk",
    "source": "Dead Eye: attack buff with duration and expiration"
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
    "kind": "buff",
    "stat": "atk",
    "source": "Silence: attack buff with duration and expiration"
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
    "stat": "atk",
    "source": "Vampiric Rage: attack buff with duration and expiration"
  },
  "shillien_s_stigma": {
    "kind": "buff",
    "stat": "atk",
    "source": "Shillien's Stigma: attack buff with duration and expiration"
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
    "stat": "atk",
    "source": "Prophecy of Wind: attack buff with duration and expiration"
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
    "stat": "atk",
    "source": "Bleeding Rose: attack buff with duration and expiration"
  },
  "kingdom_of_plants": {
    "kind": "buff",
    "stat": "atk",
    "source": "Kingdom of Plants: attack buff with duration and expiration"
  },
  "reflecting_illusion": {
    "kind": "buff",
    "stat": "atk",
    "source": "Reflecting Illusion: attack buff with duration and expiration"
  },
  "crimson_rose": {
    "kind": "buff",
    "stat": "atk",
    "source": "Crimson Rose: attack buff with duration and expiration"
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
    "stat": "atk",
    "source": "Rage: attack buff with duration and expiration"
  },
  "frenzy": {
    "kind": "buff",
    "stat": "atk",
    "source": "Frenzy: attack buff with duration and expiration"
  },
  "power_crash": {
    "kind": "damage",
    "source": "Power Crash: deal combat damage with MP and cooldown"
  },
  "guts": {
    "kind": "buff",
    "stat": "atk",
    "source": "Guts: attack buff with duration and expiration"
  },
  "titan_champion": {
    "kind": "damage",
    "source": "Titan Champion: deal combat damage with MP and cooldown"
  },
  "overwhelming_power": {
    "kind": "buff",
    "stat": "atk",
    "source": "Overwhelming Power: attack buff with duration and expiration"
  },
  "excruciating_strike": {
    "kind": "damage",
    "source": "Excruciating Strike: deal combat damage with MP and cooldown"
  },
  "zealot": {
    "kind": "buff",
    "stat": "atk",
    "source": "Zealot: attack buff with duration and expiration"
  },
  "force_blaster": {
    "kind": "damage",
    "source": "Force Blaster: deal combat damage with MP and cooldown"
  },
  "cripple": {
    "kind": "buff",
    "stat": "atk",
    "source": "Cripple: attack buff with duration and expiration"
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
    "stat": "atk",
    "source": "Bison Spirit Totem: attack buff with duration and expiration"
  },
  "ogre_s_essence": {
    "kind": "buff",
    "stat": "atk",
    "source": "Ogre's Essence: attack buff with duration and expiration"
  },
  "boost_attack_speed": {
    "kind": "passive",
    "stat": "speed",
    "source": "Boost Attack Speed: increase speed"
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
    "stat": "atk",
    "source": "Wondrous Power: attack buff with duration and expiration"
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
    "kind": "buff",
    "stat": "atk",
    "source": "Dreaming Spirit: attack buff with duration and expiration"
  },
  "frost_flame": {
    "kind": "buff",
    "stat": "atk",
    "source": "Frost Flame: attack buff with duration and expiration"
  },
  "shining_prison": {
    "kind": "buff",
    "stat": "atk",
    "source": "Shining Prison: attack buff with duration and expiration"
  },
  "life_rescue": {
    "kind": "buff",
    "stat": "atk",
    "source": "Life Rescue: attack buff with duration and expiration"
  },
  "swap_attack": {
    "kind": "buff",
    "stat": "atk",
    "source": "Swap Attack: attack buff with duration and expiration"
  },
  "swap_defense": {
    "kind": "buff",
    "stat": "atk",
    "source": "Swap Defense: attack buff with duration and expiration"
  },
  "pa_agrio_s_glory": {
    "kind": "buff",
    "stat": "atk",
    "source": "Pa'agrio's Glory: attack buff with duration and expiration"
  },
  "pa_agrio_s_immunity": {
    "kind": "buff",
    "stat": "atk",
    "source": "Pa'agrio's Immunity: attack buff with duration and expiration"
  },
  "pa_agrio_s_touch": {
    "kind": "damage",
    "source": "Pa'agrio's Touch: deal combat damage with MP and cooldown"
  },
  "pa_agrio_s_cure": {
    "kind": "buff",
    "stat": "atk",
    "source": "Pa'agrio's Cure: attack buff with duration and expiration"
  },
  "seal_of_despair": {
    "kind": "buff",
    "stat": "atk",
    "source": "Seal of Despair: attack buff with duration and expiration"
  },
  "prophecy_of_pa_agrio": {
    "kind": "buff",
    "stat": "atk",
    "source": "Prophecy of Pa'agrio: attack buff with duration and expiration"
  },
  "chant_of_vampire": {
    "kind": "buff",
    "stat": "atk",
    "source": "Chant of Vampire: attack buff with duration and expiration"
  },
  "chant_of_glory": {
    "kind": "buff",
    "stat": "atk",
    "source": "Chant of Glory: attack buff with duration and expiration"
  },
  "freezing_flame": {
    "kind": "buff",
    "stat": "atk",
    "source": "Freezing Flame: attack buff with duration and expiration"
  },
  "convert": {
    "kind": "buff",
    "stat": "atk",
    "source": "Convert: attack buff with duration and expiration"
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
    "stat": "atk",
    "source": "Chant of Prophecy: attack buff with duration and expiration"
  },
  "blazing_fury": {
    "kind": "buff",
    "stat": "atk",
    "source": "Blazing Fury: attack buff with duration and expiration"
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
    "kind": "buff",
    "stat": "atk",
    "source": "Giant's Stomp: attack buff with duration and expiration"
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
    "stat": "atk",
    "source": "Tenacity: attack buff with duration and expiration"
  },
  "weapon_reinforcement": {
    "kind": "buff",
    "stat": "atk",
    "source": "Weapon Reinforcement: attack buff with duration and expiration"
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
    "stat": "atk",
    "source": "Prime Master: attack buff with duration and expiration"
  },
  "mechanical_masterpiece": {
    "kind": "buff",
    "stat": "atk",
    "source": "Mechanical Masterpiece: attack buff with duration and expiration"
  },
  "earth_tremor": {
    "kind": "damage",
    "source": "Earth Tremor: deal combat damage with MP and cooldown"
  },
  "final_secret": {
    "kind": "buff",
    "stat": "atk",
    "source": "Final Secret: attack buff with duration and expiration"
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
    "stat": "atk",
    "source": "Soul Roar: attack buff with duration and expiration"
  },
  "soul_guard": {
    "kind": "buff",
    "stat": "atk",
    "source": "Soul Guard: attack buff with duration and expiration"
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
    "stat": "atk",
    "source": "Powerful Rush: attack buff with duration and expiration"
  },
  "soul_weapon": {
    "kind": "buff",
    "stat": "atk",
    "source": "Soul Weapon: attack buff with duration and expiration"
  },
  "disarm": {
    "kind": "buff",
    "stat": "atk",
    "source": "Disarm: attack buff with duration and expiration"
  },
  "through_strike": {
    "kind": "damage",
    "source": "Through Strike: deal combat damage with MP and cooldown"
  },
  "soul_haste": {
    "kind": "buff",
    "stat": "atk",
    "source": "Soul Haste: attack buff with duration and expiration"
  },
  "flash_dash": {
    "kind": "damage",
    "source": "Flash Dash: deal combat damage with MP and cooldown"
  },
  "soul_reinforcement": {
    "kind": "buff",
    "stat": "atk",
    "source": "Soul Reinforcement: attack buff with duration and expiration"
  },
  "collect_shadow_souls": {
    "kind": "buff",
    "stat": "atk",
    "source": "Collect Shadow Souls: attack buff with duration and expiration"
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
    "stat": "atk",
    "source": "Fragarach: attack buff with duration and expiration"
  },
  "soul_blade": {
    "kind": "buff",
    "stat": "atk",
    "source": "Soul Blade: attack buff with duration and expiration"
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
    "stat": "atk",
    "source": "Soul Wind Walk: attack buff with duration and expiration"
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
    "stat": "atk",
    "source": "Collect Light Souls: attack buff with duration and expiration"
  },
  "cunning_arrest": {
    "kind": "damage",
    "source": "Cunning Arrest: deal combat damage with MP and cooldown"
  },
  "force_unleashed": {
    "kind": "buff",
    "stat": "atk",
    "source": "Force Unleashed: attack buff with duration and expiration"
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
    "stat": "atk",
    "source": "Wind: attack buff with duration and expiration"
  },
  "forest": {
    "kind": "buff",
    "stat": "atk",
    "source": "Forest: attack buff with duration and expiration"
  },
  "strike": {
    "kind": "damage",
    "source": "Strike: deal combat damage with MP and cooldown"
  },
  "fire": {
    "kind": "buff",
    "stat": "atk",
    "source": "Fire: attack buff with duration and expiration"
  },
  "mountain": {
    "kind": "buff",
    "stat": "atk",
    "source": "Mountain: attack buff with duration and expiration"
  },
  "atsumori": {
    "kind": "buff",
    "stat": "atk",
    "source": "Atsumori: attack buff with duration and expiration"
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
    "stat": "atk",
    "source": "Adamant Will: attack buff with duration and expiration"
  },
  "determination": {
    "kind": "buff",
    "stat": "atk",
    "source": "Determination: attack buff with duration and expiration"
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
    "stat": "atk",
    "source": "Elemental Haste: attack buff with duration and expiration"
  },
  "elemental_wind_walk": {
    "kind": "buff",
    "stat": "atk",
    "source": "Elemental Wind Walk: attack buff with duration and expiration"
  },
  "elemental_insight": {
    "kind": "buff",
    "stat": "atk",
    "source": "Elemental Insight: attack buff with duration and expiration"
  },
  "elemental_magic_barrier": {
    "kind": "buff",
    "stat": "atk",
    "source": "Elemental Magic Barrier: attack buff with duration and expiration"
  },
  "fire_explosion": {
    "kind": "damage",
    "source": "Fire Explosion: deal combat damage with MP and cooldown"
  },
  "freezing_wound": {
    "kind": "buff",
    "stat": "atk",
    "source": "Freezing Wound: attack buff with duration and expiration"
  },
  "blessing_of_winds": {
    "kind": "buff",
    "stat": "atk",
    "source": "Blessing of Winds: attack buff with duration and expiration"
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
    "kind": "buff",
    "stat": "atk",
    "source": "Wild Dance: attack buff with duration and expiration"
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
    "stat": "atk",
    "source": "Sacral Power: attack buff with duration and expiration"
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
    "stat": "atk",
    "source": "Light Counter: attack buff with duration and expiration"
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
    "stat": "atk",
    "source": "Increase Power: attack buff with duration and expiration"
  },
  "body_to_mind": {
    "kind": "buff",
    "stat": "atk",
    "source": "Body to Mind: attack buff with duration and expiration"
  },
  "mystic_spiral": {
    "kind": "damage",
    "source": "Mystic Spiral: deal combat damage with MP and cooldown"
  }
});

export function assessEffect(contract, evidence) {
  if (!contract) return { status: "NOT_VALIDATED", pass: null, reason: "Independent effect contract missing", evidence };
  let pass = false;
  if (contract.kind === "passive") pass = Number.isFinite(evidence.after?.[contract.stat]) && evidence.after[contract.stat] > evidence.before?.[contract.stat];
  if (contract.kind === "buff") pass = evidence.applied === true && evidence.expiresInMs > 0 && evidence.after?.[contract.stat] > evidence.before?.[contract.stat] && evidence.expired?.[contract.stat] === evidence.before?.[contract.stat];
  if (contract.kind === "damage") {
    const damage = (evidence.events || []).filter(e => e.skillId === evidence.skillId).reduce((n, e) => n + (e.damage || 0), 0);
    pass = damage > 0 && evidence.hpBefore - evidence.hpAfter === damage;
  }
  if (contract.kind === "heal") pass = evidence.cast === true && evidence.hpAfter > evidence.hpBefore && evidence.hpAfter <= evidence.maxHp;
  return { status: pass ? "PASS" : "FAIL", pass, contract, evidence };
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
    failedAssertions: failed.length, unvalidatedAssertions: missing.length,
    contentBlockedClassIds: blocked.map(c => c.classId), requiredCoverage,
  };
}
