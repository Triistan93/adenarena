import * as ART from "./art.js";

// ========================================
// Lineage Idle - Main Game Logic
// ========================================

const SAVE_KEY = 'lineageIdleSave_v2';
// Lazy accessor — window.GameData is set by items.js side-effects which
// run at module-evaluation time.  Accessing D() instead of D ensures we
// always read the value AFTER all imports have been fully evaluated.
const D = () => window.GameData;

// --------------------------- RACES & CLASSES ---------------------------
const RACES = {
  human: { name: 'Human', desc: 'Balanced in all disciplines.', stats: { atk: 0, def: 0, eva: 0, matk: 0, mdef: 0 }, startZone: 'talkingIsland' },
  elf: { name: 'Elf', desc: 'Graceful and evasive.', stats: { atk: 0, def: -2, eva: 8, matk: 0, mdef: 0 }, startZone: 'elvenForest' },
  darkelf: { name: 'Dark Elf', desc: 'Deadly spellcasters.', stats: { atk: 2, def: -2, eva: 4, matk: 6, mdef: 2 }, startZone: 'darkForest' },
  orc: { name: 'Orc', desc: 'Tough and resilient.', stats: { atk: 4, def: 6, eva: -4, matk: -2, mdef: -2 }, startZone: 'orcVillage' },
  dwarf: { name: 'Dwarf', desc: 'Masters of craft and loot.', stats: { atk: 0, def: 4, eva: -2, matk: 0, mdef: 0, lootBonus: 0.15 }, startZone: 'dwarvenMine' },
  kamael: { name: 'Kamael', desc: 'Swift and deadly.', stats: { atk: 6, def: -2, eva: 6, matk: 0, mdef: 0 }, startZone: 'kamaelLair' },
  ertheia: { name: 'Ertheia', desc: 'Agile dragon-touched warriors.', stats: { atk: 2, def: 0, eva: 10, matk: 4, mdef: 0 }, startZone: 'talkingIsland' }
};

const CLASSES = {
  // Base Tier 0 (Level 1)
  fighter: { name: 'Fighter', archetype: 'fighter', stage: 0, desc: 'A melee warrior with high attack and defense.', base: { atk: 10, def: 5, mdef: 0 } },
  mage: { name: 'Mage', archetype: 'mage', stage: 0, desc: 'A spellcaster with powerful magic attacks.', base: { atk: 0, def: 0, matk: 10, mdef: 5 } },
  artisan: { name: 'Artisan', archetype: 'artisan', stage: 0, desc: 'A master craftsman with bonus loot.', base: { atk: 6, def: 6, matk: 0, mdef: 0, lootBonus: 0.2 } },
  soulbreaker: { name: 'Soulbreaker', archetype: 'soulbreaker', stage: 0, desc: 'A dual-wielding Kamael warrior.', base: { atk: 12, def: -2, eva: 8, matk: 0, mdef: 0 } },

  // Human 1st Transfer (Lv 20)
  warrior: { name: 'Warrior', archetype: 'fighter', stage: 1, parent: 'fighter', race: 'human', desc: 'Master of heavy blades and physical power.', base: { atk: 25, def: 12, hp: 50, mdef: 5 } },
  knight: { name: 'Knight', archetype: 'fighter', stage: 1, parent: 'fighter', race: 'human', desc: 'Shield-bearer devoted to protecting allies.', base: { atk: 15, def: 28, hp: 120, mdef: 15 } },
  rogue: { name: 'Rogue', archetype: 'fighter', stage: 1, parent: 'fighter', race: 'human', desc: 'Swift assassin favoring critical blows and agility.', base: { atk: 22, def: 10, eva: 12, crit: 8, mdef: 5 } },
  wizard: { name: 'Wizard', archetype: 'mage', stage: 1, parent: 'mage', race: 'human', desc: 'Master of elemental destruction spells.', base: { matk: 32, mdef: 18, mp: 80, atk: 5 } },
  cleric: { name: 'Cleric', archetype: 'mage', stage: 1, parent: 'mage', race: 'human', desc: 'Holy servant capable of divine healing and buffs.', base: { matk: 20, mdef: 25, def: 18, hp: 40, mp: 60 } },

  // Elven 1st Transfer (Lv 20)
  elvenKnight: { name: 'Elven Knight', archetype: 'fighter', stage: 1, parent: 'fighter', race: 'elf', desc: 'Noble defender combining high evasion and divine shield prowess.', base: { atk: 18, def: 25, eva: 10, hp: 100, mdef: 12 } },
  elvenScout: { name: 'Elven Scout', archetype: 'fighter', stage: 1, parent: 'fighter', race: 'elf', desc: 'Agile wilderness scout specializing in swift bows and daggers.', base: { atk: 24, def: 8, eva: 18, crit: 10 } },
  elvenWizard: { name: 'Elven Wizard', archetype: 'mage', stage: 1, parent: 'mage', race: 'elf', desc: 'Scholar of light and water elemental destruction.', base: { matk: 34, mdef: 20, mp: 90, eva: 5 } },
  oracle: { name: 'Oracle', archetype: 'mage', stage: 1, parent: 'mage', race: 'elf', desc: 'Priestess of Eva casting sacred speed and protection chants.', base: { matk: 22, mdef: 28, def: 16, hp: 50, mp: 80 } },

  // Dark Elven 1st Transfer (Lv 20)
  palusKnight: { name: 'Palus Knight', archetype: 'fighter', stage: 1, parent: 'fighter', race: 'darkelf', desc: 'Shadow knight harnessing dark curses and counter-strikes.', base: { atk: 24, def: 22, hp: 90, mdef: 14 } },
  assassin: { name: 'Assassin', archetype: 'fighter', stage: 1, parent: 'fighter', race: 'darkelf', desc: 'Deadly shadow killer dealing unmatched critical strikes.', base: { atk: 30, def: 6, eva: 14, crit: 15 } },
  darkWizard: { name: 'Dark Wizard', archetype: 'mage', stage: 1, parent: 'mage', race: 'darkelf', desc: 'Destructive black mage wielding wind and dark curses.', base: { matk: 40, mdef: 15, mp: 75, atk: 8 } },
  shillienOracle: { name: 'Shillien Oracle', archetype: 'mage', stage: 1, parent: 'mage', race: 'darkelf', desc: 'Priest of Shillien empowering allies with dark strength buffs.', base: { matk: 26, mdef: 24, def: 14, hp: 45, mp: 70 } },

  // Orc 1st Transfer (Lv 20)
  orcRaider: { name: 'Orc Raider', archetype: 'fighter', stage: 1, parent: 'fighter', race: 'orc', desc: 'Brutal warrior swinging massive two-handed blades and axes.', base: { atk: 32, def: 18, hp: 140, mdef: 4 } },
  monk: { name: 'Monk', archetype: 'fighter', stage: 1, parent: 'fighter', race: 'orc', desc: 'Martial artist striking with lightning-fast fist weapons.', base: { atk: 28, def: 14, eva: 8, hp: 120, crit: 6 } },
  orcShaman: { name: 'Orc Shaman', archetype: 'mage', stage: 1, parent: 'mage', race: 'orc', desc: 'Tribal mystic chanting ancient totem buffs and curses.', base: { matk: 24, mdef: 22, def: 20, hp: 90, mp: 60 } },

  // Dwarven 1st Transfer (Lv 20)
  scavenger: { name: 'Scavenger', archetype: 'artisan', stage: 1, parent: 'artisan', race: 'dwarf', desc: 'Expert scavenger uncovering rare spoils.', base: { atk: 18, def: 18, lootBonus: 0.35 } },
  artisanClass: { name: 'Artisan Master', archetype: 'artisan', stage: 1, parent: 'artisan', race: 'dwarf', desc: 'Skilled blacksmith crafting heavy armor and siege tools.', base: { atk: 20, def: 22, lootBonus: 0.25, hp: 60 } },

  // Kamael 1st Transfer (Lv 20)
  trooper: { name: 'Trooper', archetype: 'soulbreaker', stage: 1, parent: 'soulbreaker', race: 'kamael', desc: 'Kamael blade master with dark burst potential.', base: { atk: 30, eva: 12, crit: 10 } },
  warder: { name: 'Warder', archetype: 'soulbreaker', stage: 1, parent: 'soulbreaker', race: 'kamael', desc: 'Swift crossbow warden piercing armor from afar.', base: { atk: 28, def: 8, eva: 14, crit: 12 } },

  // Ertheia 1st Transfer (Lv 20)
  marauder: { name: 'Marauder', archetype: 'fighter', stage: 1, parent: 'fighter', race: 'ertheia', desc: 'Wind dancer striking with hurricane fists.', base: { atk: 26, def: 10, eva: 16, crit: 10 } },
  sayhaSeer: { name: 'Sayha Seer', archetype: 'mage', stage: 1, parent: 'mage', race: 'ertheia', desc: 'Oracle of Sayha commanding wind spirits.', base: { matk: 36, mdef: 18, mp: 85 } },

  // Human 2nd Transfer (Lv 40)
  gladiator: { name: 'Gladiator', archetype: 'fighter', stage: 2, parent: 'warrior', desc: 'Dual-blade champion devastating foes in close combat.', base: { atk: 55, def: 25, hp: 150, crit: 12 } },
  warlord: { name: 'Warlord', archetype: 'fighter', stage: 2, parent: 'warrior', desc: 'Polearm master striking multiple enemies at once.', base: { atk: 48, def: 35, hp: 180, mdef: 20 } },
  paladin: { name: 'Paladin', archetype: 'fighter', stage: 2, parent: 'knight', desc: 'Holy defender infused with sacred light.', base: { atk: 32, def: 60, hp: 280, mdef: 35 } },
  darkAvenger: { name: 'Dark Avenger', archetype: 'fighter', stage: 2, parent: 'knight', desc: 'Dread knight commanding dark aura and punishment.', base: { atk: 45, def: 50, hp: 220, mdef: 30 } },
  treasureHunter: { name: 'Treasure Hunter', archetype: 'fighter', stage: 2, parent: 'rogue', desc: 'Deadly assassin executing lethal strikes.', base: { atk: 50, def: 18, eva: 25, crit: 20 } },
  sagittarius: { name: 'Sagittarius', archetype: 'fighter', stage: 2, parent: 'rogue', desc: 'Master archer striking from maximum distance.', base: { atk: 58, def: 15, eva: 18, crit: 18 } },
  sorcerer: { name: 'Sorcerer', archetype: 'mage', stage: 2, parent: 'wizard', desc: 'Archon of fire unleashing apocalyptic blazes.', base: { matk: 70, mdef: 40, mp: 180 } },
  necromancer: { name: 'Necromancer', archetype: 'mage', stage: 2, parent: 'wizard', desc: 'Dark lord summoning undead and draining vitality.', base: { matk: 65, mdef: 35, mp: 150, hp: 80 } },
  bishop: { name: 'Bishop', archetype: 'mage', stage: 2, parent: 'cleric', desc: 'Supreme healer capable of miraculous restoration.', base: { matk: 45, mdef: 55, def: 30, mp: 160 } },
  prophet: { name: 'Prophet', archetype: 'mage', stage: 2, parent: 'cleric', desc: 'Grand buffer empowering allies with ancient chants.', base: { matk: 40, mdef: 45, def: 40, hp: 100 } },
  deathKnight: { name: 'Death Knight', archetype: 'fighter', stage: 2, parent: 'knight', desc: 'Hellbound knight commanding elemental fire, ice, and darkness.', base: { atk: 65, def: 55, hp: 260, mdef: 40 } },

  // Elven 2nd Transfer (Lv 40)
  templeKnight: { name: 'Temple Knight', archetype: 'fighter', stage: 2, parent: 'elvenKnight', desc: 'Ethereal guardian with divine defense and high evasion.', base: { atk: 35, def: 58, hp: 240, eva: 15, mdef: 32 } },
  swordsinger: { name: 'Sword Singer', archetype: 'fighter', stage: 2, parent: 'elvenKnight', desc: 'Bard knight chanting songs of haste, defense, and power.', base: { atk: 45, def: 40, hp: 200, eva: 12, crit: 10 } },
  plainsWalker: { name: 'Plains Walker', archetype: 'fighter', stage: 2, parent: 'elvenScout', desc: 'Swift assassin using extreme evasion and fatal thrusts.', base: { atk: 52, def: 16, eva: 30, crit: 22 } },
  silverRanger: { name: 'Silver Ranger', archetype: 'fighter', stage: 2, parent: 'elvenScout', desc: 'Master elven sniper firing rapid lunar arrows.', base: { atk: 60, def: 14, eva: 22, crit: 20 } },
  spellsinger: { name: 'Spellsinger', archetype: 'mage', stage: 2, parent: 'elvenWizard', desc: 'Fastest archmage casting water and light torrents.', base: { matk: 72, mdef: 42, mp: 190, eva: 8 } },
  elementalSummoner: { name: 'Elemental Summoner', archetype: 'mage', stage: 2, parent: 'elvenWizard', desc: 'Summoner of spirit unicorns and elemental forces.', base: { matk: 62, mdef: 38, mp: 170, hp: 60 } },
  elder: { name: 'Elven Elder', archetype: 'mage', stage: 2, parent: 'oracle', desc: 'High priestess of Eva providing supreme mana and speed buffs.', base: { matk: 48, mdef: 58, def: 28, mp: 200 } },

  // Dark Elven 2nd Transfer (Lv 40)
  shillienKnight: { name: 'Shillien Knight', archetype: 'fighter', stage: 2, parent: 'palusKnight', desc: 'Dark defender summoning cubic curses and vampiric shields.', base: { atk: 48, def: 52, hp: 210, mdef: 35 } },
  bladedancer: { name: 'Blade Dancer', archetype: 'fighter', stage: 2, parent: 'palusKnight', desc: 'Dual-sword dancer unleashing ferocious attack and crit songs.', base: { atk: 56, def: 32, hp: 190, crit: 14 } },
  abyssWalker: { name: 'Abyss Walker', archetype: 'fighter', stage: 2, parent: 'assassin', desc: 'Lethal dark assassin inflicting devastating bleeding stabs.', base: { atk: 62, def: 14, eva: 20, crit: 26 } },
  phantomRanger: { name: 'Phantom Ranger', archetype: 'fighter', stage: 2, parent: 'assassin', desc: 'Sniper of the abyss dealing immense single-target arrow damage.', base: { atk: 66, def: 12, eva: 16, crit: 24 } },
  spellhowler: { name: 'Spellhowler', archetype: 'mage', stage: 2, parent: 'darkWizard', desc: 'Highest M.Atk archmage unleashing wind hurricanes.', base: { matk: 85, mdef: 38, mp: 175 } },
  phantomSummoner: { name: 'Phantom Summoner', archetype: 'mage', stage: 2, parent: 'darkWizard', desc: 'Summoner of shadow demons and dark specters.', base: { matk: 66, mdef: 36, mp: 160, hp: 70 } },
  shillienElder: { name: 'Shillien Elder', archetype: 'mage', stage: 2, parent: 'shillienOracle', desc: 'Dark priestess granting empowering magic attack buffs.', base: { matk: 52, mdef: 50, def: 26, mp: 180 } },

  // Orc 2nd Transfer (Lv 40)
  destroyer: { name: 'Destroyer', archetype: 'fighter', stage: 2, parent: 'orcRaider', desc: 'Colossal berserker entering Frenzy for insane damage when wounded.', base: { atk: 68, def: 35, hp: 320, mdef: 15 } },
  tyrant: { name: 'Tyrant', archetype: 'fighter', stage: 2, parent: 'monk', desc: 'Pummeling martial titan channeling bison spirit power.', base: { atk: 60, def: 28, eva: 14, hp: 260, crit: 12 } },
  overlord: { name: 'Overlord', archetype: 'mage', stage: 2, parent: 'orcShaman', desc: 'Ruler of clans casting mass seal curses and clan buffs.', base: { matk: 50, mdef: 48, def: 45, hp: 180, mp: 140 } },
  warcryer: { name: 'Warcryer', archetype: 'mage', stage: 2, parent: 'orcShaman', desc: 'Chanter empowering entire parties with attack and haste chants.', base: { matk: 46, mdef: 44, def: 40, hp: 160, mp: 150 } },

  // Dwarven 2nd Transfer (Lv 40)
  bountyHunter: { name: 'Bounty Hunter', archetype: 'artisan', stage: 2, parent: 'scavenger', desc: 'Fortune hunter maximizing spoils and rare drops.', base: { atk: 40, def: 40, lootBonus: 0.5 } },
  warsmith: { name: 'Warsmith', archetype: 'artisan', stage: 2, parent: 'artisanClass', desc: 'Master engineer forging Golem automatons and masterwork gear.', base: { atk: 44, def: 48, hp: 160, lootBonus: 0.35 } },

  // Kamael 2nd Transfer (Lv 40)
  berserker: { name: 'Berserker', archetype: 'soulbreaker', stage: 2, parent: 'trooper', desc: 'Two-handed sword fighter crushing lines with soul charges.', base: { atk: 64, def: 20, eva: 16, crit: 16 } },
  soulhound: { name: 'Soulhound', archetype: 'soulbreaker', stage: 2, parent: 'trooper', desc: 'Master of rapier and dark souls.', base: { atk: 62, eva: 20, crit: 18 } },
  arbalester: { name: 'Arbalester', archetype: 'soulbreaker', stage: 2, parent: 'warder', desc: 'Master of heavy crossbow traps and rapid soul bolts.', base: { atk: 60, def: 16, eva: 22, crit: 20 } },

  // Ertheia 2nd Transfer (Lv 40)
  ertheiaWarrior: { name: 'Eviscerator', archetype: 'fighter', stage: 2, parent: 'marauder', desc: 'Wind dancer executing airborne hurricane combos.', base: { atk: 62, def: 22, eva: 28, crit: 18 } },
  windRider: { name: 'Sayha Seeker', archetype: 'mage', stage: 2, parent: 'sayhaSeer', desc: 'Archon of wind unleashing elemental tornadoes.', base: { matk: 74, mdef: 40, mp: 185 } }
};

const DWARF_CLASS = CLASSES.artisan;
const KAMAEL_CLASS = CLASSES.soulbreaker;

// --------------------------- SKILLS & TALENT TREES ---------------------------
const SKILL_DEFS = {
  // === 1. SORCERER / ARCHMAGE (Humano Mago de Fogo) ===
  sorcerer_fire_mastery: { name: 'Fire Spell Mastery', info: '+25% M. Atk & +15% Cast Speed', cost: 5, max: 10, type: 'stat', classReq: 'wizard', reqLvl: 1, icon: '🔥', tier: 0, desc: 'Increases Fire M. Atk. and casting speed.' },
  blaze_sorc: { name: 'Blaze', info: 'Auto-cast: 23 Pwr Fire dmg', cost: 5, max: 5, type: 'proc', baseCd: 4000, pwr: 23, effect: 'dmg', classReq: 'wizard', reqLvl: 1, icon: '💥🔥', tier: 0, desc: 'Erupts intense flames at the target.' },
  robe_mastery_sorc: { name: 'Robe Mastery', info: '+1.7 DEF / lvl', cost: 10, max: 5, type: 'stat', classReq: 'wizard', reqLvl: 10, icon: '👘', tier: 1, desc: 'Increases P. Def when wearing robes.' },
  prominence_sorc: { name: 'Prominence', info: 'Auto-cast: 55 Pwr Solar Fire pillar', cost: 15, max: 5, type: 'proc', baseCd: 6000, pwr: 55, effect: 'dmg', classReq: 'sorcerer', reqLvl: 20, icon: '☀️🔥', tier: 1, desc: 'Summons a pillar of intense solar heat.' },
  anti_magic_sorc: { name: 'Anti Magic', info: '+18 MDEF, +5% Magic Resist', cost: 20, max: 5, type: 'stat', classReq: 'wizard', reqLvl: 25, icon: '🛡️', tier: 2, desc: 'Resistance to magic attacks increases.' },
  flame_strike_sorc: { name: 'Flame Strike', info: 'Auto-cast: 28 Pwr Fire AoE fireball', cost: 25, max: 5, type: 'proc', baseCd: 8000, pwr: 28, effect: 'dmg', classReq: 'sorcerer', reqLvl: 35, icon: '☄️', tier: 2, desc: 'Launches a fireball covering a wide area.' },
  rainOfFire: { name: 'Rain of Fire ⭐', info: '48 Pwr Fire AoE storm (1-Star ⭐)', cost: 100, max: 5, type: 'proc', baseCd: 5000, pwr: 48, effect: 'dmg', classReq: 'sorcerer', reqLvl: 76, starRank: 1, icon: '🌧️🔥', tier: 3, desc: 'Torrential fire storm reducing fire resistance.' },
  arcanePowerMastery: { name: 'Arcane Power Mastery ⭐⭐', info: '+30% MATK, +25% MCrit Dmg (2-Star ⭐⭐)', cost: 150, max: 5, type: 'proc', baseCd: 45000, pwr: 0, effect: 'warcry', classReq: 'sorcerer', reqLvl: 80, starRank: 2, icon: '✨', tier: 3, desc: 'Supreme arcane posture without HP drain.' },
  meteorMastery: { name: 'Meteor Mastery ⭐⭐⭐', info: '72 Pwr Meteor + 3s Stun (3-Star ⭐⭐⭐)', cost: 250, max: 5, type: 'proc', baseCd: 15000, pwr: 72, effect: 'stun', classReq: 'sorcerer', reqLvl: 84, starRank: 3, icon: '☄️', tier: 3, desc: 'Giant meteor cataclysm knocking down targets.' },
  phoenixFlameAura: { name: 'Phoenix Flame Aura ⭐⭐⭐⭐', info: '+45% MATK, 100% MCrit (4-Star ⭐⭐⭐⭐)', cost: 500, max: 5, type: 'proc', baseCd: 90000, pwr: 0, effect: 'warcry', classReq: 'sorcerer', reqLvl: 90, starRank: 4, icon: '🦅🔥', tier: 4, desc: 'Phoenix flame aura unleashing solar eruptions.' },

  // === 2. SPELLSINGER / MYSTIC MUSE (Mago Elfo de Água, Gelo e Luz) ===
  spellsinger_water_mastery: { name: 'Water & Light Mastery', info: '+25% M. Atk & +20% Cast Speed', cost: 5, max: 10, type: 'stat', classReq: 'elvenWizard', reqLvl: 1, icon: '🌊', tier: 0, desc: 'Increases Water M. Atk and casting speed.' },
  ice_bolt_sp: { name: 'Ice Bolt', info: 'Auto-cast: 18 Pwr Water dmg + slow', cost: 5, max: 5, type: 'proc', baseCd: 3500, pwr: 18, effect: 'dmg', classReq: 'elvenWizard', reqLvl: 1, icon: '❄️', tier: 0, desc: 'Freezes target slowing down movement.' },
  frost_shield_sp: { name: 'Frost Shield', info: '+20% P. Def & slows attackers', cost: 10, max: 5, type: 'proc', baseCd: 30000, pwr: 0, effect: 'warcry', classReq: 'spellsinger', reqLvl: 10, icon: '🛡️❄️', tier: 1, desc: 'Shield of ice protecting against physical attacks.' },
  hydro_blast_sp: { name: 'Hydro Blast', info: 'Auto-cast: 52 Pwr Water torrent blast', cost: 15, max: 5, type: 'proc', baseCd: 5500, pwr: 52, effect: 'dmg', classReq: 'spellsinger', reqLvl: 20, icon: '💦', tier: 1, desc: 'Fires a high-pressure blast of water.' },
  solar_flare_sp: { name: 'Solar Flare', info: 'Auto-cast: 64 Pwr Holy light beam', cost: 25, max: 5, type: 'proc', baseCd: 8000, pwr: 64, effect: 'dmg', classReq: 'spellsinger', reqLvl: 40, icon: '🌞', tier: 2, desc: 'Unleashes intense holy light radiation.' },
  frost_wall_sp: { name: 'Frost Wall', info: 'Auto-cast: 36 Pwr Water/Ice AoE wave', cost: 40, max: 5, type: 'proc', baseCd: 9000, pwr: 36, effect: 'dmg', classReq: 'spellsinger', reqLvl: 45, icon: '🧊', tier: 2, desc: 'Summons a wave of freezing ice.' },
  blizzard_star_sp: { name: 'Blizzard ⭐', info: '48 Pwr Water AoE frost wave (1-Star ⭐)', cost: 100, max: 5, type: 'proc', baseCd: 5000, pwr: 48, effect: 'dmg', classReq: 'spellsinger', reqLvl: 76, starRank: 1, icon: '🌧️❄️', tier: 3, desc: 'Blizzard storm freezing all targets in range.' },
  light_speed_aura_sp: { name: 'Light Speed Aura ⭐⭐', info: '+35% MATK, +30% Cast Speed (2-Star ⭐⭐)', cost: 150, max: 5, type: 'proc', baseCd: 45000, pwr: 0, effect: 'warcry', classReq: 'spellsinger', reqLvl: 80, starRank: 2, icon: '⚡✨', tier: 3, desc: 'Aura of light granting maximum cast speed.' },
  hydro_cataclysm_sp: { name: 'Hydro Cataclysm ⭐⭐⭐', info: '72 Pwr Water torrent + 3s Freeze (3-Star ⭐⭐⭐)', cost: 250, max: 5, type: 'proc', baseCd: 14000, pwr: 72, effect: 'stun', classReq: 'spellsinger', reqLvl: 84, starRank: 3, icon: '🌊⚡', tier: 3, desc: 'Devastating water cataclysm freezing targets.' },
  mystic_muse_aura_sp: { name: 'Mystic Muse Supreme Aura ⭐⭐⭐⭐', info: '+50% MATK, Max Cast Speed (4-Star ⭐⭐⭐⭐)', cost: 500, max: 5, type: 'proc', baseCd: 90000, pwr: 0, effect: 'warcry', classReq: 'spellsinger', reqLvl: 90, starRank: 4, icon: '👑🌊', tier: 4, desc: 'Supreme elven mage aura with max casting speed.' },

  // === 3. SPELLHOWLER (Mago Elfo Negro de Vento, Raios e Escuridão) ===
  spellhowler_dark_mastery: { name: 'Wind & Dark Mastery', info: '+30% M. Atk & +15% M. Crit Dmg', cost: 5, max: 10, type: 'stat', classReq: 'darkWizard', reqLvl: 1, icon: '🌪️', tier: 0, desc: 'Increases Wind and Dark M. Atk.' },
  shadow_spark_sh: { name: 'Shadow Spark', info: 'Auto-cast: 22 Pwr Dark blast', cost: 5, max: 5, type: 'proc', baseCd: 4000, pwr: 22, effect: 'dmg', classReq: 'darkWizard', reqLvl: 1, icon: '💀✨', tier: 0, desc: 'Inflicts dark attribute magic damage.' },
  shadow_robe_sh: { name: 'Shadow Robe Mastery', info: '+22% P. Def with Robes', cost: 10, max: 5, type: 'stat', classReq: 'spellhowler', reqLvl: 10, icon: '👘🖤', tier: 1, desc: 'Increases P. Def when wearing dark robes.' },
  hurricane: { name: 'Hurricane', info: 'Auto-cast: 70 Pwr Windstorm destruction', cost: 15, max: 5, type: 'proc', baseCd: 6000, pwr: 70, effect: 'dmg', classReq: 'spellhowler', reqLvl: 20, icon: '🌪️⚡', tier: 1, desc: 'Summons a devastating windstorm.' },
  deathSpike: { name: 'Death Spike', info: 'Auto-cast: 60 Pwr Dark bone missile', cost: 25, max: 5, type: 'proc', baseCd: 7000, pwr: 60, effect: 'dmg', classReq: 'spellhowler', reqLvl: 35, icon: '💀', tier: 2, desc: 'Fires a bone missile imbued with dark curses.' },
  corpse_burst_sh: { name: 'Corpse Burst', info: 'Auto-cast: 38 Pwr Dark AoE explosion', cost: 40, max: 5, type: 'proc', baseCd: 8000, pwr: 38, effect: 'dmg', classReq: 'spellhowler', reqLvl: 45, icon: '💥💀', tier: 2, desc: 'Explodes dark magic across nearby targets.' },
  tempest_star_sh: { name: 'Tempest ⭐', info: '48 Pwr Wind AoE storm (1-Star ⭐)', cost: 100, max: 5, type: 'proc', baseCd: 5000, pwr: 48, effect: 'dmg', classReq: 'spellhowler', reqLvl: 76, starRank: 1, icon: '🌧️🌪️', tier: 3, desc: 'Wind tempest tearing through enemy lines.' },
  dark_lord_star_sh: { name: 'Dark Lord Posture ⭐⭐', info: '+35% MATK, +25% MCrit Dmg (2-Star ⭐⭐)', cost: 150, max: 5, type: 'proc', baseCd: 45000, pwr: 0, effect: 'warcry', classReq: 'spellhowler', reqLvl: 80, starRank: 2, icon: '👑🖤', tier: 3, desc: 'Posture of the dark lord boosting critical magic.' },
  dark_vortex_star_sh: { name: 'Dark Vortex Cataclysm ⭐⭐⭐', info: '72 Pwr Dark Vortex hit (3-Star ⭐⭐⭐)', cost: 250, max: 5, type: 'proc', baseCd: 12000, pwr: 72, effect: 'vampiric', classReq: 'spellhowler', reqLvl: 84, starRank: 3, icon: '🌀💀', tier: 3, desc: 'Dark vortex absorbing HP from the target.' },
  goddess_shillien_star: { name: 'Goddess Shillien Supreme Aura ⭐⭐⭐⭐', info: '+50% MATK, 100% MCrit Rate (4-Star ⭐⭐⭐⭐)', cost: 500, max: 5, type: 'proc', baseCd: 90000, pwr: 0, effect: 'warcry', classReq: 'spellhowler', reqLvl: 90, starRank: 4, icon: '👑🖤⚡', tier: 4, desc: 'Supreme dark goddess aura granting 100% crit.' },

  // === 4. SAGITTARIUS (Arqueiro Humano - Snipe & Alcance) ===
  sagittarius_bow_mast: { name: 'Bow Mastery', info: '+18% P. Atk & +15 Accuracy', cost: 5, max: 10, type: 'stat', classReq: 'rogue', reqLvl: 1, icon: '🏹', tier: 0, desc: 'Increases P. Atk. and accuracy with bows.' },
  double_shot_sag: { name: 'Double Shot', info: 'Auto-cast: 24 Pwr 2-arrow burst', cost: 5, max: 5, type: 'proc', baseCd: 2500, pwr: 24, effect: 'dmg', classReq: 'rogue', reqLvl: 1, icon: '🎯', tier: 0, desc: 'Fires two rapid arrows at the target.' },
  rapid_shot_sag: { name: 'Rapid Shot', info: '+20% Attack Speed with Bows', cost: 10, max: 5, type: 'proc', baseCd: 30000, pwr: 0, effect: 'warcry', classReq: 'rogue', reqLvl: 10, icon: '⚡🏹', tier: 1, desc: 'Increases bow attack speed.' },
  hamstring_shot_sag: { name: 'Hamstring Shot', info: 'Auto-cast: 28 Pwr physical + 40% slow', cost: 15, max: 5, type: 'proc', baseCd: 8000, pwr: 28, effect: 'dmg', classReq: 'rogue', reqLvl: 15, icon: '🦵', tier: 1, desc: 'Slows down the target upon impact.' },
  sagittarius_eye: { name: 'Eagle Eye', info: '+15% P. Crit Rate & +100 Range', cost: 20, max: 5, type: 'proc', baseCd: 30000, pwr: 0, effect: 'warcry', classReq: 'sagittarius', reqLvl: 25, icon: '🦅', tier: 2, desc: 'Sharpens vision for higher crit rate and range.' },
  stun_shot_sag: { name: 'Stun Shot', info: 'Auto-cast: 32 Pwr physical + 3s Stun', cost: 25, max: 5, type: 'proc', baseCd: 10000, pwr: 32, effect: 'stun', classReq: 'sagittarius', reqLvl: 35, icon: '💫🏹', tier: 2, desc: 'Stuns target with a heavy arrow hit.' },
  multipleArrow: { name: 'Multiple Arrow ⭐', info: '42 Pwr 5-arrow AoE rain (1-Star ⭐)', cost: 100, max: 5, type: 'proc', baseCd: 4500, pwr: 42, effect: 'dmg', classReq: 'sagittarius', reqLvl: 76, starRank: 1, icon: '🌧️', tier: 3, desc: 'Rains arrows on enemies in range.' },
  snipeMastery: { name: 'Snipe Mastery ⭐⭐', info: '+25% ATK, +200 Range mobile (2-Star ⭐⭐)', cost: 150, max: 5, type: 'proc', baseCd: 40000, pwr: 0, effect: 'warcry', classReq: 'sagittarius', reqLvl: 80, starRank: 2, icon: '🔭', tier: 3, desc: 'Mobile sniper posture boosting ATK and range.' },
  lethalShotSag: { name: 'Lethal Shot ⭐⭐⭐', info: '65 Pwr Armor Pierce (3-Star ⭐⭐⭐)', cost: 250, max: 5, type: 'proc', baseCd: 8000, pwr: 65, effect: 'dmg', classReq: 'sagittarius', reqLvl: 84, starRank: 3, icon: '⚡', tier: 3, desc: 'Surgical precision shot ignoring defense.' },
  sagittariusAura: { name: 'Sagittarius Supreme Aura ⭐⭐⭐⭐', info: '+40% ATK, 1000 Range, 100% Crit (4-Star ⭐⭐⭐⭐)', cost: 500, max: 5, type: 'proc', baseCd: 90000, pwr: 0, effect: 'warcry', classReq: 'sagittarius', reqLvl: 90, starRank: 4, icon: '🌟', tier: 4, desc: 'Celestial archer aura granting max range and 100% crit.' },

  // === 5. MOONLIGHT SENTINEL / SILVER RANGER (Arqueiro Elfo - Velocidade Lunar) ===
  elven_bow_mastery_sr: { name: 'Elven Bow Mastery', info: '+22% P. Atk & +20% Atk Speed', cost: 5, max: 10, type: 'stat', classReq: 'elvenScout', reqLvl: 1, icon: '🏹🌙', tier: 0, desc: 'Increases P. Atk and attack speed with bows.' },
  double_shot_sr: { name: 'Double Shot', info: 'Auto-cast: 24 Pwr 2-arrow burst', cost: 5, max: 5, type: 'proc', baseCd: 2200, pwr: 24, effect: 'dmg', classReq: 'elvenScout', reqLvl: 1, icon: '🎯🌙', tier: 0, desc: 'Fires two rapid arrows infused with moonlight.' },
  rapid_fire_sr: { name: 'Rapid Fire', info: '+35% Attack Speed for 60s', cost: 10, max: 5, type: 'proc', baseCd: 30000, pwr: 0, effect: 'warcry', classReq: 'silverRanger', reqLvl: 10, icon: '⚡🌙', tier: 1, desc: 'Rapidly fires arrows with elven agility.' },
  entangle_arrow_sr: { name: 'Entangle Arrow', info: 'Auto-cast: 26 Pwr physical + 50% slow', cost: 15, max: 5, type: 'proc', baseCd: 7000, pwr: 26, effect: 'dmg', classReq: 'silverRanger', reqLvl: 20, icon: '🌿🏹', tier: 1, desc: 'Entangles enemy feet with spirit vines.' },
  spirit_of_sagittarius_sr: { name: 'Spirit of Moon', info: '+20% Crit Rate & +15 Evasion', cost: 20, max: 5, type: 'stat', classReq: 'silverRanger', reqLvl: 25, icon: '🌕', tier: 2, desc: 'Blessed by moonlight increasing evasion and criticals.' },
  lunar_shot_sr: { name: 'Lunar Shot', info: 'Auto-cast: 36 Pwr Starlight arrow', cost: 25, max: 5, type: 'proc', baseCd: 6000, pwr: 36, effect: 'dmg', classReq: 'silverRanger', reqLvl: 35, icon: '✨🏹', tier: 2, desc: 'Fires a glowing arrow of silver light.' },
  starlight_arrow_star_sr: { name: 'Starlight Arrow Rain ⭐', info: '42 Pwr Starlight AoE rain (1-Star ⭐)', cost: 100, max: 5, type: 'proc', baseCd: 4500, pwr: 42, effect: 'dmg', classReq: 'silverRanger', reqLvl: 76, starRank: 1, icon: '🌧️✨', tier: 3, desc: 'Rains down glowing starlight arrows.' },
  lunar_speed_star_sr: { name: 'Lunar Speed Stance ⭐⭐', info: '+30% ATK, +30% Atk Speed (2-Star ⭐⭐)', cost: 150, max: 5, type: 'proc', baseCd: 40000, pwr: 0, effect: 'warcry', classReq: 'silverRanger', reqLvl: 80, starRank: 2, icon: '🏃🌙', tier: 3, desc: 'Agile lunar stance increasing attack speed.' },
  lethal_lunar_shot_star_sr: { name: 'Lethal Lunar Shot ⭐⭐⭐', info: '65 Pwr Armor Pierce (3-Star ⭐⭐⭐)', cost: 250, max: 5, type: 'proc', baseCd: 7500, pwr: 65, effect: 'dmg', classReq: 'silverRanger', reqLvl: 84, starRank: 3, icon: '⚡🌙', tier: 3, desc: 'Surgical lunar shot penetrating enemy armor.' },
  moonlight_sentinel_aura_star: { name: 'Moonlight Sentinel Supreme Aura ⭐⭐⭐⭐', info: '+40% ATK, Max Atk Speed, 100% Crit (4-Star ⭐⭐⭐⭐)', cost: 500, max: 5, type: 'proc', baseCd: 90000, pwr: 0, effect: 'warcry', classReq: 'silverRanger', reqLvl: 90, starRank: 4, icon: '👑🌙', tier: 4, desc: 'Supreme moonlight aura granting max attack speed.' },

  // === 6. PHANTOM RANGER / GHOST SENTINEL (Arqueiro Elfo Negro - Hex Ranged & Maior Dano STR 41) ===
  dark_bow_mastery_pr: { name: 'Dark Bow Mastery', info: '+25% P. Atk & +25% Crit Dmg', cost: 5, max: 10, type: 'stat', classReq: 'assassin', reqLvl: 1, icon: '🏹🖤', tier: 0, desc: 'Increases P. Atk and critical damage with bows.' },
  double_shot_pr: { name: 'Double Shot', info: 'Auto-cast: 26 Pwr Dark 2-arrow burst', cost: 5, max: 5, type: 'proc', baseCd: 2500, pwr: 26, effect: 'dmg', classReq: 'assassin', reqLvl: 1, icon: '🎯🖤', tier: 0, desc: 'Fires two dark-infused arrows at target.' },
  rapid_shot_pr: { name: 'Rapid Shot', info: '+20% Attack Speed with Bows', cost: 10, max: 5, type: 'proc', baseCd: 30000, pwr: 0, effect: 'warcry', classReq: 'phantomRanger', reqLvl: 10, icon: '⚡🖤', tier: 1, desc: 'Increases attack speed of dark archer.' },
  fatal_shot_pr: { name: 'Fatal Shot', info: 'Auto-cast: 45 Pwr heavy dark shot', cost: 15, max: 5, type: 'proc', baseCd: 6000, pwr: 45, effect: 'dmg', classReq: 'phantomRanger', reqLvl: 20, icon: '💀🏹', tier: 1, desc: 'Heavy dark arrow thrust at target.' },
  ranged_hex_pr: { name: 'Ranged Hex', info: '-20% Target P. Def for 30s', cost: 20, max: 5, type: 'proc', baseCd: 15000, pwr: 0, effect: 'warcry', classReq: 'phantomRanger', reqLvl: 25, icon: '🔮', tier: 2, desc: 'Curses the target from afar reducing P. Def.' },
  stun_shot_pr: { name: 'Stun Shot', info: 'Auto-cast: 34 Pwr physical + 3s Stun', cost: 25, max: 5, type: 'proc', baseCd: 10000, pwr: 34, effect: 'stun', classReq: 'phantomRanger', reqLvl: 35, icon: '💫🖤', tier: 2, desc: 'Stuns the target with a shadowy arrow hit.' },
  phantom_burst_essence_pr: { name: 'Phantom Burst ⭐', info: '44 Pwr Dark AoE arrow rain (1-Star ⭐)', cost: 100, max: 5, type: 'proc', baseCd: 4500, pwr: 44, effect: 'dmg', classReq: 'phantomRanger', reqLvl: 76, starRank: 1, icon: '🌧️💀', tier: 3, desc: 'Rains dark shadow arrows on targets.' },
  dead_eye_mastery_pr: { name: 'Dead Eye Stance ⭐⭐', info: '+40% ATK, +35% Crit Dmg (2-Star ⭐⭐)', cost: 150, max: 5, type: 'proc', baseCd: 40000, pwr: 0, effect: 'warcry', classReq: 'phantomRanger', reqLvl: 80, starRank: 2, icon: '🎯🖤', tier: 3, desc: 'Deadly sniper stance boosting raw P. Atk.' },
  fatal_shot_mastery_pr: { name: 'Fatal Shot Mastery ⭐⭐⭐', info: '70 Pwr Armor Pierce (3-Star ⭐⭐⭐)', cost: 250, max: 5, type: 'proc', baseCd: 8000, pwr: 70, effect: 'dmg', classReq: 'phantomRanger', reqLvl: 84, starRank: 3, icon: '⚡💀', tier: 3, desc: 'Devastating dark shot ignoring armor.' },
  phantom_ranger_aura_pr: { name: 'Ghost Sentinel Supreme Aura ⭐⭐⭐⭐', info: '+50% ATK, 100% Crit Rate (4-Star ⭐⭐⭐⭐)', cost: 500, max: 5, type: 'proc', baseCd: 90000, pwr: 0, effect: 'warcry', classReq: 'phantomRanger', reqLvl: 90, starRank: 4, icon: '👑💀', tier: 4, desc: 'Supreme phantom aura unleashing fatal strikes.' },

  // === 7. TREASURE HUNTER / ADVENTURER (Assassino Humano - Mirage & Backstab) ===
  dagger_mastery_th: { name: 'Dagger Mastery', info: '+20% P. Atk & +25% Blow Rate', cost: 5, max: 10, type: 'stat', classReq: 'rogue', reqLvl: 1, icon: '🗡️', tier: 0, desc: 'Increases P. Atk. and blow success rate.' },
  mortalBlow: { name: 'Mortal Blow', info: 'Auto-cast: 26 Pwr vital spot blow', cost: 5, max: 5, type: 'proc', baseCd: 4000, pwr: 26, effect: 'dmg', classReq: 'rogue', reqLvl: 1, icon: '🗡️⚡', tier: 0, desc: 'Strikes vital points with dagger.' },
  assassin_speed_th: { name: 'Assassin Speed', info: '+25% Move Speed & +15 Evasion', cost: 10, max: 5, type: 'stat', classReq: 'rogue', reqLvl: 10, icon: '💨', tier: 1, desc: 'Increases movement speed and evasion.' },
  backstab_th: { name: 'Backstab', info: 'Auto-cast: 40 Pwr lethal backstab hit', cost: 15, max: 5, type: 'proc', baseCd: 5000, pwr: 40, effect: 'dmg', classReq: 'rogue', reqLvl: 15, icon: '🩸', tier: 1, desc: 'Stabs the target from behind for massive damage.' },
  critical_chance_th: { name: 'Critical Chance', info: '+20% Critical Rate', cost: 20, max: 5, type: 'stat', classReq: 'treasureHunter', reqLvl: 25, icon: '💥', tier: 2, desc: 'Increases physical critical rate.' },
  bluff_strike_th: { name: 'Bluff Strike', info: 'Auto-cast: 38 Pwr strike + 2s Stun', cost: 25, max: 5, type: 'proc', baseCd: 9000, pwr: 38, effect: 'stun', classReq: 'treasureHunter', reqLvl: 35, icon: '🌀', tier: 2, desc: 'Disorients the target causing stun.' },
  shadowStepEssence: { name: 'Shadow Step ⭐', info: '15 Pwr shadow teleport + 30% Backstab (1-Star ⭐)', cost: 100, max: 5, type: 'proc', baseCd: 6000, pwr: 15, effect: 'dmg', classReq: 'treasureHunter', reqLvl: 76, starRank: 1, icon: '👤', tier: 3, desc: 'Teleports behind target boosting next backstab.' },
  bluffMastery: { name: 'Bluff Mastery ⭐⭐', info: 'Clears target + 3s Stun (2-Star ⭐⭐)', cost: 150, max: 5, type: 'proc', baseCd: 10000, pwr: 0, effect: 'stun', classReq: 'treasureHunter', reqLvl: 80, starRank: 2, icon: '🌀✨', tier: 3, desc: 'Turns target around removing aggro with stun.' },
  lethalBlowMastery: { name: 'Lethal Blow Mastery ⭐⭐⭐', info: '68 Pwr armor pierce + lifesteal (3-Star ⭐⭐⭐)', cost: 250, max: 5, type: 'proc', baseCd: 7000, pwr: 68, effect: 'vampiric', classReq: 'treasureHunter', reqLvl: 84, starRank: 3, icon: '🩸', tier: 3, desc: 'Deadly dagger strike with lifesteal.' },
  shadowMasteryAura: { name: 'Shadow Mastery Aura ⭐⭐⭐⭐', info: '+40% Blow Dmg, 80% Mirage (4-Star ⭐⭐⭐⭐)', cost: 500, max: 5, type: 'proc', baseCd: 90000, pwr: 0, effect: 'warcry', classReq: 'treasureHunter', reqLvl: 90, starRank: 4, icon: '🌌', tier: 4, desc: 'Shadow assassin aura granting mirage protection.' },

  // === 8. PALADIN / PHOENIX KNIGHT (Tanque Humano - Luz Sagrada & Fênix) ===
  paladin_shield_mast: { name: 'Paladin Shield Mastery', info: '+25% P. Def & +18% Block Rate', cost: 5, max: 10, type: 'stat', classReq: 'knight', reqLvl: 1, icon: '🛡️✨', tier: 0, desc: 'Increases P. Def and shield block rate.' },
  shield_bash_pal: { name: 'Shield Bash', info: 'Auto-cast: 25 Pwr hit + 3s Stun', cost: 5, max: 5, type: 'proc', baseCd: 7500, pwr: 25, effect: 'stun', classReq: 'knight', reqLvl: 1, icon: '🛡️💥', tier: 0, desc: 'Stuns enemy using heavy shield.' },
  fortress_guard_pal: { name: 'Fortress Guard', info: '+20% P. Def & +20% M. Def', cost: 10, max: 5, type: 'stat', classReq: 'knight', reqLvl: 10, icon: '🏰', tier: 1, desc: 'Increases P. Def and M. Def.' },
  tribunal_pal: { name: 'Tribunal Strike', info: 'Auto-cast: 30 Pwr Holy strike', cost: 15, max: 5, type: 'proc', baseCd: 6000, pwr: 30, effect: 'dmg', classReq: 'paladin', reqLvl: 20, icon: '⚔️✨', tier: 1, desc: 'Strikes enemy with holy light.' },
  sacred_light_pal: { name: 'Sacred Light Shield', info: '+15% M. Def & +10% HP Heal', cost: 20, max: 5, type: 'stat', classReq: 'paladin', reqLvl: 25, icon: '🕊️', tier: 2, desc: 'Divine light increasing magic defense and healing.' },
  judgment_pal: { name: 'Judgment', info: 'Auto-cast: 35 Pwr hit & -15% P. Def', cost: 25, max: 5, type: 'proc', baseCd: 8000, pwr: 35, effect: 'dmg', classReq: 'paladin', reqLvl: 35, icon: '⚖️', tier: 2, desc: 'Strikes enemy and degrades defense.' },
  holy_shield_wave_star_pal: { name: 'Sacred Shield Wave ⭐', info: '39 Pwr Holy AoE wave (1-Star ⭐)', cost: 100, max: 5, type: 'proc', baseCd: 5000, pwr: 39, effect: 'dmg', classReq: 'paladin', reqLvl: 76, starRank: 1, icon: '🌊✨', tier: 3, desc: 'Wave of holy light damaging surrounding foes.' },
  phoenix_blessing_star: { name: 'Phoenix Blessing ⭐⭐', info: '+35% P. Def, Auto-Heal 30% (2-Star ⭐⭐)', cost: 150, max: 5, type: 'proc', baseCd: 45000, pwr: 0, effect: 'warcry', classReq: 'paladin', reqLvl: 80, starRank: 2, icon: '🦅✨', tier: 3, desc: 'Blessing of the Phoenix restoring health.' },
  phoenix_smite_star_pal: { name: 'Phoenix Holy Smite ⭐⭐⭐', info: '70 Pwr Holy Strike + 3s Stun (3-Star ⭐⭐⭐)', cost: 250, max: 5, type: 'proc', baseCd: 12000, pwr: 70, effect: 'stun', classReq: 'paladin', reqLvl: 84, starRank: 3, icon: '⚡🦅', tier: 3, desc: 'Smite infused with Phoenix flames.' },
  paladin_avatar_star_pal: { name: 'Phoenix Knight Supreme Avatar ⭐⭐⭐⭐', info: '+50% P. Def, 100% Block & Lifesteal (4-Star ⭐⭐⭐⭐)', cost: 500, max: 5, type: 'proc', baseCd: 90000, pwr: 0, effect: 'warcry', classReq: 'paladin', reqLvl: 90, starRank: 4, icon: '👑🛡️', tier: 4, desc: 'Supreme holy knight avatar with 100% shield block.' },

  // === 9. DEATH KNIGHT (Especial - Fogo / Gelo / Escuridão) ===
  death_knight_mastery: { name: 'Death Knight Mastery', info: '+25% P. Atk & +20% P. Def', cost: 5, max: 10, type: 'stat', classReq: 'deathKnight', reqLvl: 1, icon: '💀⚔️', tier: 0, desc: 'Increases P. Atk and P. Def for Death Knights.' },
  elemental_slash_dk: { name: 'Elemental Slash', info: 'Auto-cast: 28 Pwr Elemental slash', cost: 5, max: 5, type: 'proc', baseCd: 4000, pwr: 28, effect: 'dmg', classReq: 'deathKnight', reqLvl: 1, icon: '🔥⚔️', tier: 0, desc: 'Slashes target with fire/ice/dark energy.' },
  death_shield_dk: { name: 'Death Shield', info: '+20% Def & +15 Dark Attribute', cost: 10, max: 5, type: 'stat', classReq: 'deathKnight', reqLvl: 10, icon: '🛡️💀', tier: 1, desc: 'Shield of death boosting defense.' },
  bone_cage_dk: { name: 'Bone Cage', info: 'Auto-cast: 32 Pwr hit + 4s Cage Stun', cost: 15, max: 5, type: 'proc', baseCd: 7000, pwr: 32, effect: 'stun', classReq: 'deathKnight', reqLvl: 20, icon: '🦴', tier: 1, desc: 'Traps target inside a cage of bones.' },
  hellbound_power_dk: { name: 'Hellbound Power', info: '+20% P. Atk & +15% Crit Dmg', cost: 20, max: 5, type: 'stat', classReq: 'deathKnight', reqLvl: 25, icon: '🔥👑', tier: 2, desc: 'Power of hellbound boosting critical strikes.' },
  death_flare_dk: { name: 'Death Flare', info: 'Auto-cast: 40 Pwr Elemental burst', cost: 25, max: 5, type: 'proc', baseCd: 8000, pwr: 40, effect: 'dmg', classReq: 'deathKnight', reqLvl: 35, icon: '💥💀', tier: 2, desc: 'Fires an elemental flare of death.' },
  deathHuger: { name: 'Death Hug ⭐', info: 'Chain pull + 2s Stun (1-Star ⭐)', cost: 100, max: 5, type: 'proc', baseCd: 6000, pwr: 20, effect: 'stun', classReq: 'deathKnight', reqLvl: 76, starRank: 1, icon: '⛓️💀', tier: 3, desc: 'Pulls distant target inflicting stun.' },
  deathKnightAura2: { name: 'Death Knight Aura ⭐⭐', info: '+35% ATK, +30% Crit Dmg (2-Star ⭐⭐)', cost: 150, max: 5, type: 'proc', baseCd: 40000, pwr: 0, effect: 'warcry', classReq: 'deathKnight', reqLvl: 80, starRank: 2, icon: '👑💀', tier: 3, desc: 'Aura of death boosting physical attack.' },
  deathExecution: { name: 'Death Execution ⭐⭐⭐', info: '72 Pwr execution + heal block (3-Star ⭐⭐⭐)', cost: 250, max: 5, type: 'proc', baseCd: 8000, pwr: 72, effect: 'dmg', classReq: 'deathKnight', reqLvl: 84, starRank: 3, icon: '💀🗡️', tier: 3, desc: 'Slay target ignoring defense and blocking healing.' },
  hellboundDeathAura: { name: 'Hellbound Death Aura ⭐⭐⭐⭐', info: '+50% ATK/DEF, 100% Crit (4-Star ⭐⭐⭐⭐)', cost: 500, max: 5, type: 'proc', baseCd: 90000, pwr: 0, effect: 'warcry', classReq: 'deathKnight', reqLvl: 90, starRank: 4, icon: '👑🔥💀', tier: 4, desc: 'Hellbound knight transformation with elemental slashes.' },

  // Essence 1-Star to 4-Star Star Skills
  tripleSonicSlash: { name: 'Triple Sonic Slash ⭐', info: '58 Pwr armor piercing 3-hit slash (1-Star ⭐)', cost: 100, max: 5, type: 'proc', baseCd: 6000, pwr: 58, effect: 'dmg', classReq: 'gladiator', reqLvl: 76, starRank: 1, icon: '🗡️', tier: 3, desc: 'Devastating 3-hit sonic slash ignoring defense.' },
  sonicRage:        { name: 'Sonic Rage ⭐⭐', info: '21 Pwr auto-proc wind blades (2-Star ⭐⭐)', cost: 150, max: 5, type: 'proc', baseCd: 800, pwr: 21, effect: 'dmg', classReq: 'gladiator', reqLvl: 80, starRank: 2, icon: '⚡', tier: 3, desc: 'Continuous wind blades building sonic charges.' },
  rushImpact:       { name: 'Rush Impact ⭐⭐⭐', info: '42 Pwr charge + 3s Stun (3-Star ⭐⭐⭐)', cost: 250, max: 5, type: 'proc', baseCd: 12000, pwr: 42, effect: 'stun', classReq: 'gladiator', reqLvl: 84, starRank: 3, icon: '💨', tier: 3, desc: 'Rushes to target inflicting AoE damage and stun.' },
  duelistAura:      { name: 'Master of Dual Swords ⭐⭐⭐⭐', info: '+35% ATK, Max Charges (4-Star ⭐⭐⭐⭐)', cost: 500, max: 5, type: 'proc', baseCd: 90000, pwr: 0, effect: 'warcry', classReq: 'gladiator', reqLvl: 90, starRank: 4, icon: '👑', tier: 4, desc: 'Supreme dual blade posture maintaining max charges.' },

  // === GENERIC BASE SKILLS — Fighter Archetype (classReq: 'fighter') ===
  armorMast:    { name: 'Armor Mastery', info: '+11 DEF / lvl', cost: 5, max: 10, type: 'stat', classReq: 'fighter', reqLvl: 1, icon: '🛡️', tier: 0, desc: 'Increases physical defense through armor training.' },
  mortalBlow:   { name: 'Mortal Blow', info: 'Auto-cast: 26 Pwr vital spot blow', cost: 5, max: 5, type: 'proc', baseCd: 4000, pwr: 26, effect: 'dmg', classReq: 'fighter', reqLvl: 1, icon: '🗡️⚡', tier: 0, desc: 'Strikes vital points with weapon.' },
  wpnMastF:     { name: 'Weapon Mastery', info: '+4.5 ATK / lvl', cost: 5, max: 10, type: 'stat', classReq: 'fighter', reqLvl: 1, icon: '⚔️', tier: 0, desc: 'Increases physical attack through weapon training.' },
  powerSmash:   { name: 'Power Smash', info: 'Auto-cast: 32 Pwr heavy smash', cost: 10, max: 5, type: 'proc', baseCd: 5000, pwr: 32, effect: 'dmg', classReq: 'fighter', reqLvl: 5, icon: '💥', tier: 0, desc: 'Delivers a crushing power blow.' },
  lightArmor:   { name: 'Light Armor Mastery', info: '+4.2 DEF, +3 EVA / lvl', cost: 10, max: 5, type: 'stat', classReq: 'fighter', reqLvl: 10, icon: '🥷', tier: 1, desc: 'Light armor training improving defense and evasion.' },
  stunAttack:   { name: 'Stun Attack', info: 'Auto-cast: 28 Pwr hit + 2s Stun', cost: 15, max: 5, type: 'proc', baseCd: 8000, pwr: 28, effect: 'stun', classReq: 'fighter', reqLvl: 15, icon: '💫', tier: 1, desc: 'Stuns the target with a heavy blow.' },
  heavyArmor:   { name: 'Heavy Armor Mastery', info: '+8 DEF, +5 HP / lvl', cost: 15, max: 5, type: 'stat', classReq: 'fighter', reqLvl: 20, icon: '🏰', tier: 2, desc: 'Heavy armor training maximizing physical defense.' },
  shieldStun:   { name: 'Shield Bash', info: 'Auto-cast: 25 Pwr hit + 3s Stun', cost: 15, max: 5, type: 'proc', baseCd: 7500, pwr: 25, effect: 'stun', classReq: 'fighter', reqLvl: 20, icon: '🛡️💥', tier: 2, desc: 'Stuns enemy using a heavy shield bash.' },
  wildSweep:    { name: 'Wild Sweep', info: 'Auto-cast: 36 Pwr AoE sweep', cost: 20, max: 5, type: 'proc', baseCd: 6500, pwr: 36, effect: 'dmg', classReq: 'fighter', reqLvl: 25, icon: '🌀⚔️', tier: 2, desc: 'Sweeps weapon across multiple targets.' },
  tripleSlash:  { name: 'Triple Slash', info: 'Auto-cast: 18 Pwr x3 rapid slashes', cost: 20, max: 5, type: 'proc', baseCd: 3500, pwr: 18, effect: 'dmg', classReq: 'fighter', reqLvl: 25, icon: '🗡️🗡️🗡️', tier: 2, desc: 'Three consecutive slashes in quick succession.' },
  boostHp:      { name: 'Boost HP', info: '+50 Max HP / lvl', cost: 10, max: 5, type: 'stat', classReq: 'fighter', reqLvl: 15, icon: '❤️', tier: 1, desc: 'Increases maximum HP through physical conditioning.' },
  warCry:       { name: 'War Cry', info: '+15% ATK for 30s warcry', cost: 25, max: 5, type: 'proc', baseCd: 30000, pwr: 0, effect: 'warcry', classReq: 'fighter', reqLvl: 30, icon: '📯', tier: 2, desc: 'Battle cry that boosts physical attack power.' },
  lethalBlow:   { name: 'Lethal Blow', info: 'Auto-cast: 45 Pwr critical thrust', cost: 30, max: 5, type: 'proc', baseCd: 9000, pwr: 45, effect: 'dmg', classReq: 'fighter', reqLvl: 35, icon: '🩸', tier: 2, desc: 'Delivers a powerful lethal thrust.' },
  frenzy:       { name: 'Frenzy', info: '+30% ATK when below 40% HP', cost: 25, max: 5, type: 'proc', baseCd: 60000, pwr: 0, effect: 'warcry', classReq: 'fighter', reqLvl: 30, icon: '🔥💢', tier: 2, desc: 'Unleashes berserk power when gravely wounded.' },
  bisonPummel:  { name: 'Bison Pummel', info: 'Auto-cast: 42 Pwr charge + knockback', cost: 30, max: 5, type: 'proc', baseCd: 10000, pwr: 42, effect: 'stun', classReq: 'fighter', reqLvl: 35, icon: '🐂', tier: 2, desc: 'Charges into enemy with massive force.' },
  fatalStrike:  { name: 'Fatal Strike', info: 'Auto-cast: 55 Pwr armor-pierce hit', cost: 35, max: 5, type: 'proc', baseCd: 11000, pwr: 55, effect: 'dmg', classReq: 'fighter', reqLvl: 40, icon: '☠️', tier: 2, desc: 'A lethal strike that bypasses armor.' },
  danceOfFire:  { name: 'Dance of Fire', info: '+20% ATK for party (Dance)', cost: 25, max: 5, type: 'proc', baseCd: 30000, pwr: 0, effect: 'warcry', classReq: 'fighter', reqLvl: 30, icon: '🔥💃', tier: 2, desc: 'Fire dance that boosts entire party attack.' },
  powerCrush:   { name: 'Power Crush', info: 'Auto-cast: 50 Pwr brutal overhead', cost: 35, max: 5, type: 'proc', baseCd: 12000, pwr: 50, effect: 'dmg', classReq: 'fighter', reqLvl: 40, icon: '💪💥', tier: 2, desc: 'Crushes foe with overwhelming brute force.' },

  // === GENERIC BASE SKILLS — Mage Archetype (classReq: 'mage') ===
  weaponMastM:  { name: 'Magical Weapon Mastery', info: '+1.5 ATK, +2.5 MATK / lvl', cost: 5, max: 10, type: 'stat', classReq: 'mage', reqLvl: 1, icon: '🔮', tier: 0, desc: 'Increases magical and physical attack through staff training.' },
  energyBolt:   { name: 'Energy Bolt', info: 'Auto-cast: 20 Pwr magic bolt', cost: 5, max: 5, type: 'proc', baseCd: 3000, pwr: 20, effect: 'dmg', classReq: 'mage', reqLvl: 1, icon: '⚡🔮', tier: 0, desc: 'Fires a bolt of pure magical energy.' },
  robeMast:     { name: 'Robe Mastery', info: '+1.7 DEF / lvl', cost: 10, max: 5, type: 'stat', classReq: 'mage', reqLvl: 5, icon: '👘', tier: 0, desc: 'Increases physical defense when wearing robes.' },
  iceBolt:      { name: 'Ice Bolt', info: 'Auto-cast: 18 Pwr Ice bolt + slow', cost: 10, max: 5, type: 'proc', baseCd: 3500, pwr: 18, effect: 'dmg', classReq: 'mage', reqLvl: 5, icon: '❄️⚡', tier: 0, desc: 'Fires an ice bolt that slows the target.' },
  antiMagic:    { name: 'Anti Magic', info: '+18 MDEF, +5% Magic Resist / lvl', cost: 15, max: 5, type: 'stat', classReq: 'mage', reqLvl: 10, icon: '🛡️✨', tier: 1, desc: 'Resistance to magic attacks increases.' },
  auraBurn:     { name: 'Aura Burn', info: 'Auto-cast: 30 Pwr fire aura burst', cost: 15, max: 5, type: 'proc', baseCd: 5000, pwr: 30, effect: 'dmg', classReq: 'mage', reqLvl: 10, icon: '🔥✨', tier: 1, desc: 'Ignites target in magical flames.' },
  higherMana:   { name: 'Higher Mana', info: '+2 MP regen / lvl', cost: 15, max: 5, type: 'stat', classReq: 'mage', reqLvl: 15, icon: '💧', tier: 1, desc: 'Increases mana regeneration rate.' },
  blaze:        { name: 'Blaze', info: 'Auto-cast: 23 Pwr fire damage burst', cost: 15, max: 5, type: 'proc', baseCd: 4000, pwr: 23, effect: 'dmg', classReq: 'mage', reqLvl: 15, icon: '🔥💥', tier: 1, desc: 'Erupts intense flames at the target.' },
  greaterHeal:  { name: 'Greater Heal', info: 'Heals 15% Max HP every 30s', cost: 20, max: 5, type: 'proc', baseCd: 30000, pwr: 0, effect: 'warcry', classReq: 'mage', reqLvl: 20, icon: '💚', tier: 2, desc: 'Channels healing light to restore HP.' },
  prominence:   { name: 'Prominence', info: 'Auto-cast: 55 Pwr fire pillar', cost: 20, max: 5, type: 'proc', baseCd: 6000, pwr: 55, effect: 'dmg', classReq: 'mage', reqLvl: 20, icon: '☀️🔥', tier: 2, desc: 'Summons a pillar of intense solar fire.' },
  boostMana:    { name: 'Boost Mana', info: '+40 Max MP / lvl', cost: 10, max: 5, type: 'stat', classReq: 'mage', reqLvl: 15, icon: '🌊', tier: 1, desc: 'Increases maximum mana capacity.' },
  quickRecycle: { name: 'Quick Recharge', info: '-15% Skill cooldowns / lvl', cost: 25, max: 5, type: 'stat', classReq: 'mage', reqLvl: 25, icon: '⏩', tier: 2, desc: 'Reduces cooldown time for magical skills.' },
  vampiric:     { name: 'Vampiric Aura', info: 'Auto-cast: 28 Pwr magic + 10% lifesteal', cost: 25, max: 5, type: 'proc', baseCd: 7000, pwr: 28, effect: 'vampiric', classReq: 'mage', reqLvl: 25, icon: '🧛', tier: 2, desc: 'Drains life force from the target.' },
  flameStrike:  { name: 'Flame Strike', info: 'Auto-cast: 28 Pwr fire AoE fireball', cost: 30, max: 5, type: 'proc', baseCd: 8000, pwr: 28, effect: 'dmg', classReq: 'mage', reqLvl: 30, icon: '☄️', tier: 2, desc: 'Launches a fireball covering a wide area.' },
  solarFlare:   { name: 'Solar Flare', info: 'Auto-cast: 64 Pwr Holy light beam', cost: 30, max: 5, type: 'proc', baseCd: 8000, pwr: 64, effect: 'dmg', classReq: 'mage', reqLvl: 30, icon: '🌞', tier: 2, desc: 'Unleashes intense holy light radiation.' },
  deathSpike:   { name: 'Death Spike', info: 'Auto-cast: 60 Pwr dark bone missile', cost: 30, max: 5, type: 'proc', baseCd: 7000, pwr: 60, effect: 'dmg', classReq: 'mage', reqLvl: 35, icon: '💀', tier: 2, desc: 'Fires a bone missile imbued with dark curses.' },
  hurricane:    { name: 'Hurricane', info: 'Auto-cast: 70 Pwr windstorm', cost: 35, max: 5, type: 'proc', baseCd: 6000, pwr: 70, effect: 'dmg', classReq: 'mage', reqLvl: 35, icon: '🌪️⚡', tier: 2, desc: 'Summons a devastating windstorm.' }
};

const SKILL_REQS = {
  // Mage
  robeMast: { weaponMastM: 1 }, iceBolt: { energyBolt: 1 }, antiMagic: { robeMast: 1 },
  auraBurn: { iceBolt: 2 }, higherMana: { antiMagic: 2 }, blaze: { auraBurn: 2 },
  greaterHeal: { higherMana: 1 }, prominence: { blaze: 2 }, boostMana: { antiMagic: 1 },
  quickRecycle: { higherMana: 1, blaze: 1 }, vampiric: { blaze: 3 }, deathSpike: { prominence: 2 },
  flameStrike: { vampiric: 1, boostMana: 1 },

  // Fighter
  wpnMastF: { armorMast: 1 }, powerSmash: { mortalBlow: 1 }, lightArmor: { wpnMastF: 1 },
  stunAttack: { powerSmash: 2 }, heavyArmor: { lightArmor: 2 }, shieldStun: { heavyArmor: 1 },
  tripleSlash: { stunAttack: 2 }, wildSweep: { stunAttack: 2 }, boostHp: { lightArmor: 1 },
  warCry: { heavyArmor: 1, wildSweep: 1 }, lethalBlow: { tripleSlash: 2 },
  fatalStrike: { wildSweep: 3 }, powerCrush: { fatalStrike: 1, boostHp: 1 }
};

const SKILL_TREE_LAYOUT = {
  // Mage
  weaponMastM: { col: 0, row: 1 }, energyBolt: { col: 0, row: 3 },
  robeMast: { col: 1, row: 0 }, iceBolt: { col: 1, row: 2 },
  antiMagic: { col: 2, row: 1 }, auraBurn: { col: 2, row: 3 },
  higherMana: { col: 3, row: 0 }, greaterHeal: { col: 3, row: 1 }, blaze: { col: 3, row: 2 }, prominence: { col: 3, row: 3 }, boostMana: { col: 3, row: 4 },
  solarFlare: { col: 4, row: 0 }, quickRecycle: { col: 4, row: 1 }, deathSpike: { col: 4, row: 2 }, vampiric: { col: 4, row: 3 }, flameStrike: { col: 4, row: 4 }, hurricane: { col: 4, row: 5 },

  // Fighter
  armorMast: { col: 0, row: 1 }, mortalBlow: { col: 0, row: 3 },
  wpnMastF: { col: 1, row: 0 }, powerSmash: { col: 1, row: 2 },
  lightArmor: { col: 2, row: 1 }, stunAttack: { col: 2, row: 3 },
  heavyArmor: { col: 3, row: 0 }, shieldStun: { col: 3, row: 1 }, wildSweep: { col: 3, row: 2 }, tripleSlash: { col: 3, row: 3 }, boostHp: { col: 3, row: 4 },
  frenzy: { col: 4, row: 0 }, warCry: { col: 4, row: 1 }, bisonPummel: { col: 4, row: 2 }, danceOfFire: { col: 4, row: 3 }, lethalBlow: { col: 4, row: 4 }, fatalStrike: { col: 4, row: 5 }, powerCrush: { col: 4, row: 6 }
};
const TIER_NAMES = ['Foundation', 'Discipline', 'Mastery', 'Ascendancy', 'Legend'];

// --------------------------- ZONES & MONSTERS ---------------------------
const SAGAS = [
  { id: 'interlude', name: 'Interlude', level: 0, unlocksAt: 0, zones: ['talkingIsland', 'elvenForest', 'darkForest', 'orcVillage', 'dwarvenMine', 'kamaelLair', 'ruinedOutpost', 'howlingMoor'] },
  { id: 'prelude', name: 'Prelude of War', level: 1, unlocksAt: 20, zones: ['giranOutskirts', 'orcenRuins', 'forsakenCrypt', 'blackCitadel'] },
  { id: 'saga1', name: 'Saga I: The Awakening', level: 2, unlocksAt: 40, zones: ['gludioCastle', 'wolfMountain', 'riftOfTheVoid', 'emeraldGrove', 'underworldGate'] },
  { id: 'saga2', name: 'Saga II: The Shadow', level: 3, unlocksAt: 76, zones: ['adenCity', 'dragonValley'] },
  { id: 'saga3', name: 'Saga III: Realm of the Gods', level: 4, unlocksAt: 85, zones: ['imperialTomb', 'antharasLair', 'forgeOfGods'] }
];

const ZONES = {
  talkingIsland: { name: 'Talking Island', level: 1, monsters: ['goblin'], shop: 'talkingIsland', town: true },
  elvenForest: { name: 'Elven Forest', level: 3, monsters: ['goblin', 'wolf'], shop: 'talkingIsland' },
  darkForest: { name: 'Dark Forest', level: 5, monsters: ['goblin', 'spider'], shop: 'talkingIsland' },
  orcVillage: { name: 'Orc Village', level: 7, monsters: ['goblin', 'orc'], shop: 'talkingIsland' },
  dwarvenMine: { name: 'Dwarven Mine', level: 9, monsters: ['goblin', 'kobold'], shop: 'talkingIsland' },
  kamaelLair: { name: 'Kamael Lair', level: 11, monsters: ['goblin', 'kamaelScout'], shop: 'talkingIsland' },
  giranOutskirts: { name: 'Giran Outskirts', level: 20, monsters: ['goblin', 'wolf', 'skeleton'], shop: 'giranOutskirts', town: true },
  orcenRuins: { name: 'Orcen Ruins', level: 25, monsters: ['orc', 'skeleton', 'goblinKing'], shop: 'giranOutskirts' },
  gludioCastle: { name: 'Gludio Castle', level: 40, monsters: ['knight', 'skeleton', 'wolf'], shop: 'gludioCastle', town: true },
  wolfMountain: { name: 'Wolf Mountain', level: 45, monsters: ['wolf', 'wolfAlpha', 'goblin'], shop: 'gludioCastle' },
  adenCity: { name: 'Aden City', level: 76, monsters: ['knight', 'mage', 'dragon'], shop: 'adenCity', town: true },
  dragonValley: { name: 'Dragon Valley', level: 80, monsters: ['dragon', 'dragonKnight'], shop: 'dragonValley', town: true },
  ruinedOutpost:   { name: 'Ruined Outpost', level: 5, monsters: ['goblinThief', 'orc', 'koboldLeader'], shop: 'talkingIsland', town: false },
  howlingMoor:     { name: 'Howling Moor', level: 15, monsters: ['direWolf', 'crimsonBabyDragon', 'alphaWolf'], shop: 'gludioCastle', town: false },
  forsakenCrypt:   { name: 'Forsaken Crypt', level: 27, monsters: ['darkMage', 'devilBone', 'skeleton'], shop: 'gludioCastle', town: false },
  blackCitadel:    { name: 'Black Citadel', level: 35, monsters: ['devilBone', 'darkMage', 'deathKnight'], shop: 'dragonValley', town: true },
  riftOfTheVoid:   { name: 'Rift of the Void', level: 42, monsters: ['voidCreature', 'deathKnight'], shop: 'dragonValley', town: false },
  emeraldGrove:    { name: 'Emerald Grove', level: 48, monsters: ['emeraldDragon', 'voidCreature'], shop: 'dragonValley', town: false },
  underworldGate:  { name: 'Gates of the Underworld', level: 50, monsters: ['cerberus'], shop: 'dragonValley', town: false },
  imperialTomb:    { name: 'Imperial Tomb', level: 85, monsters: ['tombGuardian', 'sepulcherArchon', 'undeadKnight'], shop: 'adenCity', town: false },
  antharasLair:    { name: 'Antharas\' Lair', level: 90, monsters: ['caveDrake', 'magmaBeast', 'earthDrake'], shop: 'dragonValley', town: false },
  forgeOfGods:     { name: 'Forge of the Gods', level: 95, monsters: ['lavaGolem', 'flameArchon', 'vulcanLord'], shop: 'dragonValley', town: false }
};

const MONSTERS = {
  goblin: { name: 'Goblin', hp: 30, atk: 5, def: 2, eva: 2, matk: 0, mdef: 0, xp: 10, sp: 1, gold: [5, 15] },
  wolf: { name: 'Wolf', hp: 45, atk: 8, def: 1, eva: 5, matk: 0, mdef: 0, xp: 15, sp: 1, gold: [8, 20] },
  spider: { name: 'Spider', hp: 35, atk: 6, def: 1, eva: 8, matk: 0, mdef: 0, xp: 12, sp: 1, gold: [6, 18] },
  kobold: { name: 'Kobold', hp: 25, atk: 4, def: 3, eva: 3, matk: 0, mdef: 0, xp: 8, sp: 1, gold: [4, 12] },
  kamaelScout: { name: 'Kamael Scout', hp: 55, atk: 12, def: 2, eva: 8, matk: 0, mdef: 0, xp: 25, sp: 2, gold: [12, 30] },
  skeleton: { name: 'Skeleton', hp: 50, atk: 9, def: 5, eva: 1, matk: 0, mdef: 0, xp: 18, sp: 2, gold: [8, 22] },
  goblinKing: { name: 'Goblin King', hp: 120, atk: 15, def: 8, eva: 3, matk: 0, mdef: 0, xp: 50, sp: 5, gold: [25, 50], boss: true },
  wolfAlpha: { name: 'Wolf Alpha', hp: 100, atk: 18, def: 3, eva: 10, matk: 0, mdef: 0, xp: 40, sp: 4, gold: [20, 40], boss: true },
  knight: { name: 'Knight', hp: 150, atk: 20, def: 12, eva: 2, matk: 0, mdef: 5, xp: 60, sp: 3, gold: [30, 60] },
  mage: { name: 'Mage', hp: 80, atk: 5, def: 2, eva: 3, matk: 25, mdef: 8, xp: 55, sp: 3, gold: [25, 55] },
  dragon: { name: 'Dragon', hp: 300, atk: 30, def: 15, eva: 5, matk: 20, mdef: 10, xp: 120, sp: 8, gold: [80, 150], boss: true },
  dragonKnight: { name: 'Dragon Knight', hp: 500, atk: 40, def: 25, eva: 8, matk: 15, mdef: 15, xp: 200, sp: 10, gold: [150, 300], boss: true },
  goblinThief: { name: 'Goblin Thief', lvl: 2, hp: 45, atk: 9, def: 3, eva: 12, xp: 18, sp: 1, gold: [8, 20], element: 'none', traits: ['ambush', 'packTactics'], stealsGold: 0.15 },
  orc: { name: 'Orc', lvl: 5, hp: 140, atk: 20, def: 10, eva: 4, xp: 45, sp: 2, gold: [20, 45], element: 'none', traits: ['enrage'] },
  koboldLeader: { name: 'Kobold Leader', lvl: 8, hp: 260, atk: 30, def: 14, eva: 8, xp: 110, sp: 4, gold: [60, 120], element: 'none', traits: ['packLeader', 'trap'], elite: true },
  direWolf: { name: 'Dire Wolf', lvl: 12, hp: 420, atk: 52, def: 18, eva: 18, xp: 220, sp: 3, gold: [80, 160], element: 'none', traits: ['bleed', 'firstStrike'], atkSpd: 1.35 },
  crimsonBabyDragon: { name: 'Crimson Baby Dragon', lvl: 15, hp: 620, atk: 70, def: 26, eva: 10, xp: 340, sp: 5, gold: [120, 240], element: 'fire', resist: { fire: 0.75, water: 1.3 }, traits: ['fireBreath'] },
  alphaWolf: { name: 'Alpha Wolf', lvl: 18, hp: 900, atk: 85, def: 30, eva: 20, xp: 520, sp: 6, gold: [180, 340], element: 'none', traits: ['packLeader', 'bleed', 'howl'], elite: true },
  darkMage: { name: 'Dark Mage', lvl: 25, hp: 1150, atk: 145, def: 28, eva: 14, xp: 1100, sp: 8, gold: [300, 600], element: 'dark', magic: true, resist: { dark: 0.5, holy: 1.5 }, traits: ['curse', 'manaBurn'], atkSpd: 0.75 },
  devilBone: { name: 'Devil Bone', lvl: 28, hp: 2400, atk: 120, def: 78, eva: 3, xp: 1400, sp: 10, gold: [350, 700], element: 'dark', resist: { physical: 0.7, magic: 1.25 }, traits: ['boneArmor', 'reassemble'] },
  deathKnight: { name: 'Death Knight', lvl: 35, boss: true, hp: 4200, atk: 210, def: 90, eva: 12, xp: 3200, sp: 15, gold: [900, 1800], element: 'dark', resist: { dark: 0.3, holy: 1.6 }, traits: ['lifesteal', 'deathCoil', 'enrage'] },
  voidCreature: { name: 'Void Creature', lvl: 42, boss: true, hp: 5600, atk: 280, def: 60, eva: 30, xp: 5200, sp: 18, gold: [1200, 2400], element: 'void', resist: { physical: 0.85, magic: 0.85 }, traits: ['voidPierce', 'phaseShift', 'distort'] },
  emeraldDragon: { name: 'Emerald Dragon', lvl: 48, boss: true, hp: 9800, atk: 330, def: 120, eva: 8, xp: 9000, sp: 22, gold: [2500, 5000], element: 'earth', resist: { poison: 0.0, fire: 1.2 }, traits: ['poison', 'wingBuffet', 'regen'] },
  cerberus: { name: 'Cerberus', lvl: 50, boss: true, finalBoss: true, hp: 15000, atk: 400, def: 140, eva: 14, xp: 15000, sp: 30, gold: [5000, 10000], element: 'chaos', resist: { fire: 0.5, dark: 0.5, holy: 1.25 }, traits: ['multiHead', 'lifesteal', 'enrage', 'hellChain'] },
  tombGuardian:    { name: 'Tomb Guardian', lvl: 85, hp: 12000, atk: 450, def: 180, eva: 10, xp: 8500, sp: 25, gold: [1500, 3000], element: 'dark', traits: ['boneArmor'] },
  sepulcherArchon: { name: 'Sepulcher Archon', lvl: 88, hp: 16000, atk: 520, def: 210, eva: 12, xp: 11000, sp: 30, gold: [2000, 4000], element: 'dark', magic: true, traits: ['curse'] },
  undeadKnight:    { name: 'Undead Knight', lvl: 90, hp: 22000, atk: 600, def: 260, eva: 8, xp: 14000, sp: 35, gold: [2500, 5000], element: 'dark', traits: ['shieldBlock'] },
  caveDrake:       { name: 'Cave Drake', lvl: 91, hp: 25000, atk: 680, def: 280, eva: 15, xp: 16000, sp: 40, gold: [3000, 6000], element: 'earth', traits: ['tailWhip'] },
  magmaBeast:      { name: 'Magma Beast', lvl: 93, hp: 30000, atk: 750, def: 310, eva: 10, xp: 19000, sp: 45, gold: [3500, 7000], element: 'fire', traits: ['burn'] },
  earthDrake:      { name: 'Earth Drake', lvl: 95, hp: 38000, atk: 850, def: 350, eva: 12, xp: 23000, sp: 50, gold: [4200, 8500], element: 'earth', boss: true, traits: ['earthquake'] },
  lavaGolem:       { name: 'Lava Golem', lvl: 96, hp: 45000, atk: 920, def: 400, eva: 5, xp: 27000, sp: 55, gold: [5000, 10000], element: 'fire', traits: ['ironBody'] },
  flameArchon:     { name: 'Flame Archon', lvl: 98, hp: 55000, atk: 1050, def: 450, eva: 14, xp: 32000, sp: 60, gold: [6000, 12000], element: 'fire', magic: true, traits: ['meteor'] },
  vulcanLord:      { name: 'Vulcan Lord', lvl: 100, hp: 75000, atk: 1250, def: 520, eva: 18, xp: 45000, sp: 80, gold: [8000, 16000], element: 'fire', boss: true, traits: ['cataclysm'] }
};

function getXPForLevel(lvl) { return Math.floor(100 * Math.pow(1.8, lvl - 1)); }
function getTotalXP(lvl) { let total = 0; for (let i = 1; i <= lvl; i++) total += getXPForLevel(i); return total; }

// --------------------------- STATE ---------------------------
const DEFAULT_STATE = () => ({
  race: null, class: null,
  level: 1, xp: 0, sp: 0,
  maxHp: 100, hp: 100, maxMp: 50, mp: 50,
  base: { atk: 0, def: 0, eva: 0, matk: 0, mdef: 0 },
  skills: {
    // Generic Fighter skills
    armorMast: 0, mortalBlow: 0, wpnMastF: 0, powerSmash: 0, lightArmor: 0, stunAttack: 0,
    heavyArmor: 0, shieldStun: 0, wildSweep: 0, tripleSlash: 0, boostHp: 0, warCry: 0,
    frenzy: 0, bisonPummel: 0, danceOfFire: 0, lethalBlow: 0, fatalStrike: 0, powerCrush: 0,
    // Generic Mage skills
    weaponMastM: 0, energyBolt: 0, robeMast: 0, iceBolt: 0, antiMagic: 0, auraBurn: 0,
    higherMana: 0, blaze: 0, greaterHeal: 0, prominence: 0, boostMana: 0, quickRecycle: 0,
    vampiric: 0, flameStrike: 0, solarFlare: 0, deathSpike: 0, hurricane: 0
  },
  quests: { progress: {}, claimed: [], lastDailyReset: 0, lastWeeklyReset: 0 },
  battlePass: { xp: 0, claimedFree: [], claimedPremium: [], unlockedPremium: false },
  tower: { highestFloor: 0, currentFloor: 1, lastSweepTime: 0 },
  zone: 'talkingIsland', currentSaga: 0, gold: 1000, inventory: [], 
  equipment: {
    weapon: null, shield: null, helmet: null, armor: null, legs: null, gloves: null, boots: null,
    hair: null, hair2: null, necklace: null, earring1: null, earring2: null, ring: null, ring2: null,
    belt: null, cloak: null, talisman: null, agathion: null
  },
  codex: {}, dolls: [], synthSelected: [null, null],
  magicLampExp: 0, magicLamps: 0, craftPoints: 0, craftCharges: 0, randomCraftWheel: [],
  subclasses: [], activeSubclassIndex: null, certifications: {}, mainClassData: null,
  craftLevel: 1, craftXp: 0, shopTab: 'gear', selectedSkill: null, filter: 'all',
  craftTab: 'recipes', zoneTab: 'map', soulshotActive: false, combatSpeed: 1,
  totalPlaytime: 0, buffs: {}, _cds: {}, gameMode: 'idle', privilegeLevel: 0
});

let state = DEFAULT_STATE();

// FUNÇÃO DE SAVE/LOAD COM DEEP MERGE PARA IMPEDIR RESET DE SKILLS
function save(manual = false) {
  const data = { 
    ...state, 
    totalPlaytime: state.totalPlaytime + (Date.now() - state.startTime), 
    lastSaveTime: Date.now(),
    selectedUids: Array.from(getSelectedSet())
  };
  delete data.startTime;
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  if (manual) {
    log('Game saved successfully.', 'system');
    floatText('SAVED', 'float-gold');
  }
}

function load() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return false;
  try {
    const data = JSON.parse(raw);
    const def = DEFAULT_STATE();
    const safeInventory = Array.isArray(data.inventory)
      ? data.inventory.filter(item => item && item.itemId && D().ALL_ITEMS[item.itemId])
      : [];
    
    // Deep merge to preserve ALL user progress while adding newly introduced state keys
    state = { ...def, ...data };
    
    state.skills = { ...def.skills, ...(data.skills || {}) };
    state.equipment = { ...def.equipment, ...(data.equipment || {}) };
    state.base = { ...def.base, ...(data.base || {}) };
    state.inventory = safeInventory;
    state.selectedUids = new Set(Array.isArray(data.selectedUids) ? data.selectedUids : []);
    
    // Safely migrate progression modules if missing from older save
    state.codex = data.codex && typeof data.codex === 'object' ? data.codex : {};
    state.dolls = Array.isArray(data.dolls) ? data.dolls : [];
    state.synthSelected = Array.isArray(data.synthSelected) ? data.synthSelected : [null, null];
    state.magicLampExp = Number(data.magicLampExp) || 0;
    state.magicLamps = Number(data.magicLamps) || 0;
    state.craftPoints = Number(data.craftPoints) || 0;
    state.craftCharges = Number(data.craftCharges) || 0;
    state.randomCraftWheel = Array.isArray(data.randomCraftWheel) ? data.randomCraftWheel : [];

    state.subclasses = Array.isArray(data.subclasses) ? data.subclasses : [];
    state.activeSubclassIndex = data.activeSubclassIndex !== undefined ? data.activeSubclassIndex : null;
    state.certifications = data.certifications && typeof data.certifications === 'object' ? data.certifications : {};
    state.mainClassData = data.mainClassData || null;

    state.quests = data.quests && typeof data.quests === 'object' ? data.quests : { progress: {}, claimed: [], lastDailyReset: 0, lastWeeklyReset: 0 };
    state.battlePass = data.battlePass && typeof data.battlePass === 'object' ? data.battlePass : { xp: 0, claimedFree: [], claimedPremium: [], unlockedPremium: false };
    state.tower = data.tower && typeof data.tower === 'object' ? data.tower : { highestFloor: 0, currentFloor: 1, lastSweepTime: 0 };
    checkQuestResets();

    state.buffs = data.buffs || {};
    state.filter = data.filter || 'all';
    state.gameMode = data.gameMode === 'arena' ? 'arena' : 'idle';
    state.shopTab = data.shopTab || 'gear';
    state.craftTab = data.craftTab || 'recipes';
    state.zoneTab = data.zoneTab || 'map';
    state.soulshotActive = !!data.soulshotActive;
    state.autoPotionActive = !!data.autoPotionActive;
    state.combatSpeed = data.combatSpeed === 2 ? 2 : 1;
    state.selectedSkill = data.selectedSkill || null;
    state.startTime = Date.now();
    
    updateSagaProgress(true);
    log('✨ Atualização de versão carregada com sucesso! Seu progresso e itens foram 100% mantidos.', 'rarity-legendary');

    if (data.lastSaveTime) {
      setTimeout(() => checkOfflineProgress(data.lastSaveTime), 600);
    }
    return true;
  } catch (err) {
    console.error('Error loading save data:', err);
    state = DEFAULT_STATE();
    state.startTime = Date.now();
    return false;
  }
}

function resetSave() {
  if (confirm('Reset all progress? This cannot be undone.')) {
    localStorage.removeItem(SAVE_KEY);
    state = DEFAULT_STATE();
    state.startTime = Date.now();
    location.reload();
  }
}

// --------------------------- STATS CALC ---------------------------
function getEquipBonus(slot) {
  const itemId = state.equipment[slot];
  if (!itemId) return null;
  const inv = state.inventory.find(i => i.uid === itemId);
  if (!inv) return null;
  const def = D().ALL_ITEMS[inv.itemId];
  if (!def) return null;
  const rarityMult = inv.rarity ? D().RARITY[inv.rarity].mult : 1;
  const enchantMult = 1 + (inv.enchant || 0) * 0.10;
  const out = { ...def };
  ['atk','def','matk','mdef','hp','mp','eva','crit','speed','lifesteal'].forEach(k => {
    if (out[k]) out[k] = Math.floor(Number(out[k]) * rarityMult * enchantMult);
  });
  return out;
}

function getTotalEquipBonuses() {
  const totals = { atk: 0, def: 0, matk: 0, mdef: 0, hp: 0, mp: 0, eva: 0, crit: 0, speed: 0, lifesteal: 0 };
  for (const slot of Object.keys(state.equipment)) {
    const b = getEquipBonus(slot);
    if (!b) continue;
    for (const k of Object.keys(totals)) { 
      if (b[k] !== undefined && b[k] !== null) totals[k] += Number(b[k]) || 0; 
    }
  }
  return totals;
}

function getCertificationsBonuses() {
  const certs = state.certifications || {};
  return {
    atk: (certs.emergent_atk || 0) * 20,
    def: (certs.emergent_def || 0) * 20,
    matk: (certs.emergent_matk || 0) * 25,
    mdef: (certs.emergent_mdef || 0) * 25,
    crit: (certs.master_crit || 0) * 5,
    celestial: certs.celestial_shield ? true : false
  };
}

function getStats() {
  const race = state.race ? RACES[state.race] : null;
  const cls = getClass(state.class);
  const skills = state.skills || {};

  // sk() reads skill level; works for both legacy generic and new class-specific skills
  const sk = (id) => Number(skills[id]) || 0;
  
  let baseAtk = Number(state.base.atk) || 0;
  let baseDef = Number(state.base.def) || 0;
  let baseEva = Number(state.base.eva) || 0;
  let baseMatk = Number(state.base.matk) || 0;
  let baseMdef = Number(state.base.mdef) || 0;

  baseAtk += sk('wpnMastF') * 4.5;
  baseAtk += sk('weaponMastM') * 1.5;
  baseMatk += sk('weaponMastM') * 2.5;
  baseDef += sk('armorMast') * 11;
  baseDef += sk('robeMast') * 1.7;
  baseDef += sk('lightArmor') * 4.2;
  baseEva += sk('lightArmor') * 3;
  baseMdef += sk('antiMagic') * 18;
  const mpRegenBonus = sk('higherMana') * 2;

  const eb = getTotalEquipBonuses();
  let itemCraftBonus = 0, itemLootBonus = 0;
  for (const slot of Object.keys(state.equipment)) {
    const it = getEquipBonus(slot);
    if (!it) continue;
    if (it.craftBonus) itemCraftBonus += Number(it.craftBonus) || 0;
    if (it.lootBonus) itemLootBonus += Number(it.lootBonus) || 0;
  }

  const now = Date.now();
  let buffAtk = 0, buffDef = 0, buffSpd = 0, buffMatk = 0, buffAtkMult = 0;
  let xpBoost = 0, goldBoost = 0, luckBoost = 0, autoPotion = false;
  state.buffs = state.buffs || {};
  for (const k of Object.keys(state.buffs)) {
    if (state.buffs[k].until < now) { delete state.buffs[k]; continue; }
    const b = state.buffs[k];
    if (k === 'atk') buffAtk += Number(b.amount) || 0;
    else if (k === 'def') buffDef += Number(b.amount) || 0;
    else if (k === 'speed') buffSpd += Number(b.amount) || 0;
    else if (k === 'matk') buffMatk += Number(b.amount) || 0;
    else if (k === 'warcry') buffAtkMult = Math.max(buffAtkMult, Number(b.amount) || 0);
    else if (k === 'xpBoost') xpBoost = Math.max(xpBoost, Number(b.amount) || 0);
    else if (k === 'goldBoost') goldBoost = Math.max(goldBoost, Number(b.amount) || 0);
    else if (k === 'luckBoost') luckBoost = Math.max(luckBoost, Number(b.amount) || 0);
    else if (k === 'autoPotion') autoPotion = true;
  }

  // Agathion Passive Companions Boosts
  const agathionUid = state.equipment.agathion;
  const agathionItem = agathionUid ? state.inventory.find(i => i.uid === agathionUid) : null;
  const agathionDef = agathionItem ? D().ALL_ITEMS[agathionItem.itemId] : null;

  if (agathionDef) {
    if (agathionItem.itemId === 'agathion_pegasus') { xpBoost += 0.10; buffSpd += 10; }
    else if (agathionItem.itemId === 'agathion_valakas_mini') { buffAtk += Math.floor(baseAtk * 0.15); buffMatk += Math.floor(baseMatk * 0.15); }
    else if (agathionItem.itemId === 'agathion_rudolph') { goldBoost += 0.20; }
    else if (agathionItem.itemId === 'agathion_angel') { buffDef += Math.floor(baseDef * 0.20); }
    else if (agathionItem.itemId === 'agathion_dragon_child') { buffAtkMult += 0.25; }
  }

  const atkMult = 1 + buffAtkMult;
  const defMult = 1 + sk('heavyArmor') * 0.05;
  const cdr = sk('quickRecycle') * 0.10;

  const codexB = getCodexBonuses();
  const dollsB = getDollsBonuses();
  const certB = getCertificationsBonuses();
  const towerMult = 1 + ((state.tower?.highestFloor || 0) * 0.01);

  const finalAtk  = Math.floor((baseAtk + (Number(eb.atk) || 0) + buffAtk + codexB.atk + dollsB.atk + certB.atk) * atkMult * towerMult);
  const finalDef  = Math.floor((baseDef + (Number(eb.def) || 0) + buffDef + codexB.def + dollsB.def + certB.def) * defMult * towerMult);
  const finalEva  = Math.floor(baseEva + (Number(eb.eva) || 0) + codexB.eva + dollsB.eva);
  const finalMatk = Math.floor((baseMatk + (Number(eb.matk) || 0) + buffMatk + codexB.matk + dollsB.matk + certB.matk) * towerMult);
  const finalMdef = Math.floor((baseMdef + (Number(eb.mdef) || 0) + codexB.mdef + dollsB.mdef + certB.mdef) * towerMult);
  const finalCrit = (Number(eb.crit) || 0) + codexB.crit + dollsB.crit + certB.crit;
  
  const lootBonus = (Number(race?.stats?.lootBonus) || 0) + (Number(cls?.base?.lootBonus) || 0) + itemLootBonus + luckBoost;
  const atkSpd    = (buffSpd + (dollsB.speed || 0)) / 100;
  const lifeDrain = ((Number(eb.lifesteal) || 0) + (dollsB.lifesteal || 0)) / 100;
  const craftBonus = itemCraftBonus;

  const critDmg = 1 + sk('executioner') * 0.15;
  const regenHp = sk('holylight') * 0.01;
  const meteorLvl = sk('meteor');
  const execute = sk('assassinate') * 0.02;
  const block = sk('divineshield') * 0.05;

  const maxHp = Math.floor(100 + state.level * 10 + sk('boostHp') * 60 + (Number(eb.hp) || 0) + codexB.hp + dollsB.hp);
  const maxMp = Math.floor(50 + state.level * 5 + sk('boostMana') * 30 + (Number(eb.mp) || 0) + codexB.mp + dollsB.mp);
  
  return {
    atk: finalAtk || 1, def: finalDef || 0, eva: finalEva || 0, matk: finalMatk || 1, mdef: finalMdef || 0,
    crit: finalCrit, critDmg, loot: 1 + lootBonus, speed: 1 + buffSpd / 100, cdr,
    atkSpd, lifeDrain, craftBonus, mpRegen: mpRegenBonus,
    xpBoost, goldBoost, luckBoost, autoPotion, maxHp, maxMp,
    regenHp, meteorLvl, execute, block
  };
}

function getClass(c) {
  if (!c) return null;
  return CLASSES[c] || null;
}

function classSatisfies(playerClass, reqClass) {
  if (!reqClass) return true;
  if (!playerClass) return false;
  if (playerClass === reqClass) return true;
  const pDef = getClass(playerClass);
  if (!pDef) return false;
  if (pDef.archetype === reqClass) return true;
  if (pDef.parent === reqClass) return true;
  if (pDef.parent) {
    const parentDef = getClass(pDef.parent);
    if (parentDef && (parentDef.archetype === reqClass || parentDef.parent === reqClass)) return true;
  }
  return false;
}

function checkClassAdvancement() {
  const currentClassDef = getClass(state.class);
  const currentStage = currentClassDef?.stage || 0;
  const banner = el('class-advancement-banner');
  if (!banner) return;

  let canAdvance = false;
  let advTitle = '';
  let advSub = '';

  if (state.level >= 20 && currentStage === 0) {
    canAdvance = true;
    advTitle = '⚡ 1ª Troca de Classe Disponível!';
    advSub = `Atingiu o Nível ${state.level}! Escolha o caminho de evolução para a Ordem de ${currentClassDef.name}.`;
  } else if (state.level >= 40 && currentStage === 1) {
    canAdvance = true;
    advTitle = '⚔️ 2ª Troca de Classe Disponível!';
    advSub = `Atingiu o Nível ${state.level}! Escolha a sua Classe Épica de Noblesses.`;
  }

  if (canAdvance) {
    banner.style.display = 'flex';
    const titleEl = el('class-advancement-title');
    const subEl = el('class-advancement-sub');
    if (titleEl) titleEl.textContent = advTitle;
    if (subEl) subEl.textContent = advSub;
    const btn = el('class-advancement-btn');
    if (btn) btn.onclick = openClassTransferModal;
  } else {
    banner.style.display = 'none';
  }
}

function openClassTransferModal() {
  const currentClassDef = getClass(state.class);
  const currentStage = currentClassDef?.stage || 0;
  const targetStage = currentStage + 1;
  const modal = el('class-transfer-modal');
  const container = el('class-options-container');
  if (!modal || !container) return;

  container.innerHTML = '';

  const availableOptions = Object.entries(CLASSES).filter(([id, def]) => {
    if (def.stage !== targetStage) return false;
    if (def.race && def.race !== state.race) return false;
    if (targetStage === 1) return (def.parent === state.class || def.archetype === state.class);
    if (targetStage === 2) return (def.parent === state.class);
    return false;
  });

  if (!availableOptions.length) {
    container.innerHTML = '<p class="shop-empty">Nenhum caminho de promoção disponível.</p>';
    modal.classList.add('active');
    return;
  }

  for (const [classId, def] of availableOptions) {
    const card = mkEl('div'); card.className = 'class-option-card';
    const statsStr = Object.entries(def.base || {}).map(([k, v]) => `+${v} ${k.toUpperCase()}`).join(' · ');
    card.innerHTML = `
      <div class="class-opt-header">
        <div class="class-opt-name">🎖️ ${def.name}</div>
        <span class="rarity-tag" style="color:#ffe082;">${targetStage === 1 ? '1ª Classe' : '2ª Classe Épica'}</span>
      </div>
      <div class="class-opt-desc">${def.desc}</div>
      <div class="class-opt-bonus">✨ Bônus de Atributos: ${statsStr}</div>
      <button class="class-opt-promote-btn" data-promote="${classId}">Promover a ${def.name}</button>
    `;
    container.appendChild(card);
  }

  container.querySelectorAll('[data-promote]').forEach(btn => {
    btn.onclick = () => promoteClass(btn.dataset.promote);
  });

  const closeBtn = el('close-class-modal-btn');
  if (closeBtn) closeBtn.onclick = () => modal.classList.remove('active');

  modal.classList.add('active');
}

function promoteClass(newClassId) {
  const newClassDef = getClass(newClassId);
  if (!newClassDef) return;

  state.class = newClassId;
  
  const race = RACES[state.race];
  state.base = { atk: 0, def: 0, eva: 0, matk: 0, mdef: 0 };
  if (race) {
    for (const k of ['atk','def','eva','matk','mdef']) {
      state.base[k] = (race.stats[k] || 0) + (newClassDef.base[k] || 0);
    }
  }

  // Reembolso automático de SP para redistribuição na nova árvore exclusiva
  let totalRefunded = 0;
  for (const [sId, lvl] of Object.entries(state.skills)) {
    if (lvl > 0 && SKILL_DEFS[sId]) {
      const def = SKILL_DEFS[sId];
      if (!classSatisfies(newClassId, def.classReq)) {
        for (let l = 0; l < lvl; l++) {
          totalRefunded += getSkillCost(sId, l);
        }
        state.skills[sId] = 0;
      }
    }
  }
  if (totalRefunded > 0) {
    state.sp += totalRefunded;
    log(`🔄 ${totalRefunded.toLocaleString()} SP foram reembolsados para distribuição na nova árvore exclusiva de ${newClassDef.name}!`, 'rarity-legendary');
    floatText(`+${totalRefunded.toLocaleString()} SP`, 'float-jackpot');
  }

  log(`🎉 PARABÉNS! Você concluiu a Cerimônia e agora é um **${newClassDef.name}**!`, 'rarity-legendary');
  floatText(`🎉 ${newClassDef.name.toUpperCase()}!`, 'float-jackpot');

  const modal = el('class-transfer-modal');
  if (modal) modal.classList.remove('active');

  updateAllUI();
  save();
}

// --------------------------- INVENTORY / SALVAGE ---------------------------
function getInventoryCount(itemId) {
  return state.inventory.filter(i => i.itemId === itemId && !i.equipped).reduce((s, i) => s + (i.count || 1), 0);
}

function addToInventory(itemId, amount = 1, rarity = null) {
  const def = D().ALL_ITEMS[itemId];
  if (!def) return false;

  if (def.stack && (def.slot === 'consumable' || def.slot === 'material' || def.slot === 'scroll' || def.slot === 'powerup') && !rarity) {
    let remaining = amount;
    while (remaining > 0) {
      const existing = state.inventory.find(i => i.itemId === itemId && !i.rarity && (i.count || 1) < def.stack);
      if (existing) {
        const space = def.stack - (existing.count || 1);
        const add = Math.min(space, remaining);
        existing.count = (existing.count || 1) + add;
        remaining -= add;
      } else {
        if (state.inventory.length >= 50) { log('Inventory full!', 'system'); return false; }
        const add = Math.min(def.stack, remaining);
        state.inventory.push({ uid: Date.now() + '_' + Math.random().toString(36).slice(2, 8), itemId, count: add, rarity: null, equipped: false });
        remaining -= add;
      }
    }
    return true;
  }

  for (let i = 0; i < amount; i++) {
    if (state.inventory.length >= 50) { log('Inventory full!', 'system'); return false; }
    state.inventory.push({ uid: Date.now() + '_' + Math.random().toString(36).slice(2, 8), itemId, count: 1, rarity, equipped: false });
  }
  return true;
}

function removeFromInventory(uid, amount = 1) {
  const idx = state.inventory.findIndex(i => i.uid === uid);
  if (idx < 0) return false;
  const item = state.inventory[idx];
  if (item.count > amount) { item.count -= amount; return true; }
  state.inventory.splice(idx, 1);
  return true;
}

const ALL_EQUIP_SLOTS = [
  'weapon', 'shield', 'helmet', 'armor', 'legs', 'gloves', 'boots',
  'hair', 'hair2', 'necklace', 'earring1', 'earring2', 'ring', 'ring2',
  'belt', 'cloak', 'talisman', 'agathion'
];

function resolveEquipSlot(slot) {
  if (slot === 'agathion') return 'agathion';
  if (['shield', 'offhand', 'sigil'].includes(slot)) return 'shield';
  if (['legs', 'gaiters', 'pants'].includes(slot)) return 'legs';
  if (['hair', 'headgear'].includes(slot)) return 'hair';
  if (['hair2', 'mask'].includes(slot)) return 'hair2';
  if (slot === 'earring') {
    if (!state.equipment.earring1) return 'earring1';
    if (!state.equipment.earring2) return 'earring2';
    return 'earring1';
  }
  if (slot === 'ring') {
    if (!state.equipment.ring) return 'ring';
    if (!state.equipment.ring2) return 'ring2';
    return 'ring';
  }
  if (slot === 'ring1') return 'ring';
  return slot;
}

function equipItem(uid) {
  const item = state.inventory.find(i => i.uid === uid);
  if (!item) return;
  const def = D().ALL_ITEMS[item.itemId];
  if (!def) return;
  const targetSlot = resolveEquipSlot(def.slot);
  if (!ALL_EQUIP_SLOTS.includes(targetSlot)) { log(`${def.name} não pode ser equipado.`, 'system'); return; }
  if (def.req && def.req.level > state.level) { log(`Nível ${def.req.level} necessário para equipar ${def.name}`, 'system'); return; }
  if (def.classReq && !classSatisfies(state.class, def.classReq)) { log(`${def.name} exige a classe: ${getClass(def.classReq)?.name || def.classReq}`, 'system'); return; }
  
  const currentUid = state.equipment[targetSlot];
  if (currentUid) { const current = state.inventory.find(i => i.uid === currentUid); if (current) current.equipped = false; }
  state.equipment[targetSlot] = uid; item.equipped = true;
  log(`Equipou ${def.name}${item.rarity ? ' [' + D().RARITY[item.rarity].name + ']' : ''}`, 'loot');
  
  const stats = getStats();
  state.maxHp = stats.maxHp; state.maxMp = stats.maxMp;
  state.hp = Math.min(state.hp, state.maxHp); state.mp = Math.min(state.mp, state.maxMp);
  updateAllUI(); save();
}

function unequipItem(slot) {
  const uid = state.equipment[slot];
  if (!uid) return;
  const item = state.inventory.find(i => i.uid === uid);
  if (item) item.equipped = false;
  state.equipment[slot] = null;
  const stats = getStats();
  state.maxHp = stats.maxHp; state.maxMp = stats.maxMp;
  state.hp = Math.min(state.hp, state.maxHp); state.mp = Math.min(state.mp, state.maxMp);
  log(`Unequipped ${D().ALL_ITEMS[item ? item.itemId : '']?.name || slot}`, 'system');
  updateAllUI(); save();
}

function sellItem(uid) {
  const idx = state.inventory.findIndex(i => i.uid === uid);
  if (idx < 0) return;
  const item = state.inventory[idx];
  if (item.equipped) { log('Unequip first!', 'system'); return; }
  const def = D().ALL_ITEMS[item.itemId];
  const mult = item.rarity ? D().RARITY[item.rarity].mult : 1;
  const price = Math.floor((def.price || 10) * 0.4 * mult);
  state.gold += price * (item.count || 1);
  log(`Sold ${def.name} for ${price}g`, 'loot');
  state.inventory.splice(idx, 1);
  updateAllUI(); save();
}

function getItemGrade(lvl) {
  if (!lvl || lvl < 20) return 'No Grade';
  if (lvl < 40) return 'D Grade';
  if (lvl < 52) return 'C Grade';
  if (lvl < 62) return 'B Grade';
  if (lvl < 76) return 'A Grade';
  return 'S Grade';
}

function salvageItem(uid) {
  const idx = state.inventory.findIndex(i => i.uid === uid);
  if (idx < 0) return;
  const item = state.inventory[idx];
  if (item.equipped) { log('Unequip first!', 'system'); return; }
  const def = D().ALL_ITEMS[item.itemId];
  if (!def || !ALL_EQUIP_SLOTS.includes(resolveEquipSlot(def.slot))) return;

  const reqLvl = def.req ? def.req.level : 1;
  const grade = getItemGrade(reqLvl);
  const rarityMult = item.rarity ? D().RARITY[item.rarity].mult : 1;

  let matId = 'iron_ore';
  if (grade === 'S Grade') matId = 'crystal_s';
  else if (grade === 'A Grade') matId = 'crystal_a';
  else if (grade === 'B Grade') matId = 'crystal_b';
  else if (grade === 'C Grade') matId = 'crystal_c';
  else if (grade === 'D Grade') matId = 'crystal_d';
  else matId = (def.slot === 'weapon') ? 'iron_ore' : 'cloth';

  const amount = Math.max(1, Math.floor((reqLvl / 5 + 1) * rarityMult));
  state.inventory.splice(idx, 1);
  addToInventory(matId, amount);
  log(`Broke ${def.name} into ${amount}x ${D().ALL_ITEMS[matId].name}`, 'loot');
  updateAllUI(); save();
}

function getSelectedSet() {
  if (!(state.selectedUids instanceof Set)) {
    if (Array.isArray(state.selectedUids)) {
      state.selectedUids = new Set(state.selectedUids);
    } else {
      state.selectedUids = new Set();
    }
  }
  return state.selectedUids;
}

function toggleSelectItem(uid) {
  const set = getSelectedSet();
  if (set.has(uid)) set.delete(uid);
  else set.add(uid);
  updateInventoryUI();
}

function selectItemsByFilter(filterFn) {
  const set = getSelectedSet();
  for (const item of state.inventory) {
    if (item && !item.equipped && filterFn(item)) {
      set.add(item.uid);
    }
  }
  updateInventoryUI();
}

function clearItemSelection() {
  const set = getSelectedSet();
  set.clear();
  updateInventoryUI();
}

function sellSelectedItems() {
  const set = getSelectedSet();
  if (set.size === 0) return;
  let totalGold = 0, count = 0;
  const toDelete = Array.from(set);
  
  for (const uid of toDelete) {
    const item = state.inventory.find(i => i.uid === uid);
    if (!item || item.equipped) continue;
    const def = D().ALL_ITEMS[item.itemId];
    if (!def) continue;
    const itemQty = item.count || 1;
    const basePrice = def.price || 10;
    const mult = item.rarity ? D().RARITY[item.rarity].mult : 1;
    const enchantMult = 1 + (item.enchant || 0) * 0.1;
    const goldEarned = Math.floor(basePrice * mult * enchantMult * 0.4) * itemQty;
    
    totalGold += goldEarned;
    count += itemQty;
    removeFromInventory(uid, itemQty);
  }
  
  set.clear();
  state.gold += totalGold;
  log(`💰 Sold ${count} selected item(s) for ${totalGold.toLocaleString()}g!`, 'loot');
  updateAllUI();
  save();
}

function salvageSelectedItems() {
  const set = getSelectedSet();
  if (set.size === 0) return;
  let count = 0;
  const toDelete = Array.from(set);
  
  for (const uid of toDelete) {
    const item = state.inventory.find(i => i.uid === uid);
    if (!item || item.equipped) continue;
    const def = D().ALL_ITEMS[item.itemId];
    if (!def || !['weapon','armor','helmet','gloves','boots','ring'].includes(def.slot)) continue;
    
    const matYield = Math.max(1, Math.floor((item.rarity ? D().RARITY[item.rarity].mult : 1) * 2));
    addToInventory('iron_ore', matYield, null);
    removeFromInventory(uid, item.count || 1);
    count++;
  }
  
  set.clear();
  log(`🔨 Salvaged ${count} selected equipment(s) into Iron Ore!`, 'loot');
  updateAllUI();
  save();
}

function useItem(uid) {
  const idx = state.inventory.findIndex(i => i.uid === uid);
  if (idx < 0) return;
  const item = state.inventory[idx];
  const def = D().ALL_ITEMS[item.itemId];
  if (!def) return;
  const usable = def.slot === 'consumable' || def.slot === 'scroll' || def.slot === 'powerup';
  if (!usable) { if (ALL_EQUIP_SLOTS.includes(resolveEquipSlot(def.slot))) equipItem(uid); return; }
  
  state.buffs = state.buffs || {};
  const applyBuff = (key, amt, dur) => {
    const existing = state.buffs[key];
    const newUntil = Date.now() + dur * 1000;
    if (existing && existing.until > Date.now()) {
      existing.until = Math.min(existing.until + dur * 1000, Date.now() + 8 * 3600 * 1000); 
      existing.amount = Math.max(existing.amount, amt);
    } else { state.buffs[key] = { amount: amt, until: newUntil }; }
  };
  const fmtDur = (s) => s >= 3600 ? `${(s/3600).toFixed(s%3600?1:0)}h` : s >= 60 ? `${Math.round(s/60)}m` : `${s}s`;
  
  if (def.type === 'heal') { state.hp = Math.min(state.maxHp, state.hp + def.amount); log(`Used ${def.name}: +${def.amount} HP`, 'heal'); } 
  else if (def.type === 'mana') { state.mp = Math.min(state.maxMp, state.mp + def.amount); log(`Used ${def.name}: +${def.amount} MP`, 'heal'); } 
  else if (def.type === 'buff') { applyBuff(def.stat, def.amount, def.duration); log(`Used ${def.name}: +${def.amount} ${def.stat.toUpperCase()} for ${fmtDur(def.duration)}`, 'heal'); } 
  else if (def.type === 'xpBoost') { applyBuff('xpBoost', def.amount, def.duration); log(`Used ${def.name}: +${Math.round(def.amount*100)}% XP for ${fmtDur(def.duration)}`, 'xp'); } 
  else if (def.type === 'goldBoost') { applyBuff('goldBoost', def.amount, def.duration); log(`Used ${def.name}: +${Math.round(def.amount*100)}% gold for ${fmtDur(def.duration)}`, 'loot'); } 
  else if (def.type === 'luckBoost') { applyBuff('luckBoost', def.amount, def.duration); log(`Used ${def.name}: +${Math.round(def.amount*100)}% luck for ${fmtDur(def.duration)}`, 'loot'); } 
  else if (def.type === 'autoPotion') { applyBuff('autoPotion', 1, def.duration); log(`Used ${def.name}: auto-potion active for ${fmtDur(def.duration)}`, 'heal'); } 
  else if (def.type === 'teleport') {
    state.hp = state.maxHp; state.mp = state.maxMp;
    const town = state.race ? RACES[state.race].startZone : 'talkingIsland';
    if (state.zone !== town) { state.zone = town; el('zone-name').textContent = ZONES[state.zone].name; stopCombat(); setTimeout(startCombat, 300); }
    log(`Used ${def.name}: returned to ${ZONES[town].name}, fully healed.`, 'heal');
  } else if (def.type === 'resurrect') { log('Scrolls auto-use on death.', 'system'); return; } 
  else { log(`Used ${def.name}`, 'heal'); }
  
  if (item.count > 1) item.count--; else state.inventory.splice(idx, 1);
  updateAllUI(); save();
}

// --------------------------- CRAFTING ---------------------------
function getCraftLevelReq(recipeLevel) { return Math.max(1, Math.floor(recipeLevel / 10) + 1); }
function canCraft(recipeId) {
  const recipe = D().CRAFTING_RECIPES[recipeId];
  if (!recipe || getCraftLevelReq(recipe.level) > state.craftLevel) return false;
  for (const [matId, qty] of Object.entries(recipe.materials)) { if (getInventoryCount(matId) < qty) return false; }
  return true;
}
function craftItem(recipeId) {
  const recipe = D().CRAFTING_RECIPES[recipeId];
  if (!recipe || !canCraft(recipeId)) { log('Missing materials or craft level too low.', 'system'); return; }
  for (const [matId, qty] of Object.entries(recipe.materials)) {
    let remaining = qty;
    for (let i = state.inventory.length - 1; i >= 0 && remaining > 0; i--) {
      const it = state.inventory[i];
      if (it.itemId === matId && !it.equipped && !it.rarity) {
        const take = Math.min(it.count || 1, remaining);
        if (it.count > take) { it.count -= take; remaining = 0; } else { state.inventory.splice(i, 1); remaining -= take; }
      }
    }
  }
  const rarityBoost = state.race === 'dwarf' ? 1 : 0;
  const rarity = D().rollRarity(rarityBoost);
  addToInventory(recipeId, 1, rarity);
  log(`Crafted ${D().ALL_ITEMS[recipeId].name} [${D().RARITY[rarity].name}]!`, 'rarity-' + rarity);
  state.craftXp += 10 + (D().ALL_ITEMS[recipeId].tier || 1) * 5;
  while (state.craftXp >= state.craftLevel * 50) { state.craftXp -= state.craftLevel * 50; state.craftLevel++; log(`Crafting Level Up! Now Lv.${state.craftLevel}`, 'xp'); }
  updateAllUI(); save();
}

// --------------------------- UI HELPERS ---------------------------
let ROOT = document; let _intervals = []; let _listeners = [];
export function setRoot(r) { ROOT = r || document; }
export function addTrackedListener(target, event, handler, opts) {
  if (target && target.addEventListener) {
    target.addEventListener(event, handler, opts);
    _listeners.push({ target, event, handler, opts });
  }
}
export function destroy() {
  try { stopCombat(); } catch (e) {}
  _intervals.forEach(id => clearInterval(id));
  _intervals = [];
  _listeners.forEach(({ target, event, handler, opts }) => {
    try { target.removeEventListener(event, handler, opts); } catch(e) {}
  });
  _listeners = [];
}

function playSfx(type, arg) {
  try {
    if (typeof window !== 'undefined' && window.idleAudio) {
      if (type === 'click') window.idleAudio.playClick();
      else if (type === 'upgrade') window.idleAudio.playUpgrade();
      else if (type === 'hit') window.idleAudio.playHit();
      else if (type === 'critical') window.idleAudio.playCritical();
      else if (type === 'drop') window.idleAudio.playDrop(arg);
      else if (type === 'levelUp') window.idleAudio.playLevelUp();
    }
  } catch(e) {}
}
const el = id => (ROOT && ROOT.getElementById ? ROOT.getElementById(id) : null) || (ROOT && ROOT.querySelector ? ROOT.querySelector('#' + id) : null) || (document.getElementById(id));
const qs = sel => (ROOT && ROOT.querySelector ? ROOT.querySelector(sel) : null) || (document.querySelector(sel));
const qsa = sel => (ROOT && ROOT.querySelectorAll ? ROOT.querySelectorAll(sel) : []) || (document.querySelectorAll(sel));
// Always create elements in the same document as ROOT so Shadow DOM styles apply.
const doc = () => (ROOT && ROOT.ownerDocument) ? ROOT.ownerDocument : document;
const mkEl = tag => doc().createElement(tag);
const mkNS = (ns, tag) => doc().createElementNS(ns, tag);

function updateBar(id, cur, max) {
  const bar = el(id); const text = el(id.replace('-bar', '-text'));
  if (bar) bar.style.width = `${Math.max(0, (cur / max) * 100)}%`;
  if (text) text.textContent = `${Math.floor(cur)} / ${Math.floor(max)}`;
}
function log(msg, type = 'system') {
  const logEl = el('log');
  if (!logEl) return;
  const entry = mkEl('p');
  entry.className = `log-entry ${type}`;
  entry.textContent = msg;

  const currentFilter = state.logFilter || 'all';
  if (currentFilter !== 'all') {
    if (currentFilter === 'combat') {
      const isCombat = type === 'combat' || type === 'damage' || type === 'heal';
      if (!isCombat) entry.style.display = 'none';
    } else if (currentFilter === 'loot') {
      const isLoot = type === 'loot' || type === 'xp' || type === 'saga' || type.startsWith('rarity-');
      if (!isLoot) entry.style.display = 'none';
    } else if (currentFilter === 'system') {
      const isSys = type === 'system';
      if (!isSys) entry.style.display = 'none';
    }
  }

  logEl.appendChild(entry);
  logEl.scrollTop = logEl.scrollHeight;
  while (logEl.children.length > 100) logEl.removeChild(logEl.firstChild);
}

function safeUiUpdate(label, fn) {
  try {
    fn();
  } catch (err) {
    console.warn(`UI update failed (${label}):`, err);
  }
}

function updateStatsUI() {
  const stats = getStats();
  updateBar('hp-bar', state.hp, stats.maxHp); updateBar('mp-bar', state.mp, stats.maxMp);
  state.maxHp = stats.maxHp; state.maxMp = stats.maxMp;
  const xpForLevel = getXPForLevel(state.level);
  updateBar('xp-bar', state.xp - getTotalXP(state.level - 1), xpForLevel);
  const _xtEl = el('xp-text'); if (_xtEl) _xtEl.textContent = `${state.xp - getTotalXP(state.level - 1)} / ${xpForLevel}`;
  const _spEl = el('sp-text'); if (_spEl) _spEl.textContent = state.sp;
  const _lvEl = el('level-text'); if (_lvEl) _lvEl.textContent = state.level;
  const _atkEl = el('atk-text'); if (_atkEl) _atkEl.textContent = stats.atk;
  const _defEl = el('def-text'); if (_defEl) _defEl.textContent = stats.def;
  const _evaEl = el('eva-text'); if (_evaEl) _evaEl.textContent = stats.eva;
  const _matkEl = el('matk-text'); if (_matkEl) _matkEl.textContent = stats.matk;
  const _mdefEl = el('mdef-text'); if (_mdefEl) _mdefEl.textContent = stats.mdef;
  const _critEl = el('crit-text'); if (_critEl) _critEl.textContent = `${stats.crit}%`;
  const _lootEl = el('loot-text'); if (_lootEl) _lootEl.textContent = `${Math.round(stats.loot * 100)}%`;
  
  const _gEl = el('gold-text-stat');
  if (_gEl) { _gEl.textContent = state.gold.toLocaleString(); if (_gEl._lastGold != null && state.gold > _gEl._lastGold) { _gEl.classList.remove('pulse'); void _gEl.offsetWidth; _gEl.classList.add('pulse'); } _gEl._lastGold = state.gold; }
  const gps = getGoldPerSec();
  const gpsEl = el('gps-text'); if (gpsEl) gpsEl.textContent = gps > 0 ? `${gps.toFixed(1)}/s` : '—';
  
  const _clEl = el('craft-level-stat'); if (_clEl) _clEl.textContent = state.craftLevel;
  const _rcEl = el('race-text'); if (_rcEl) _rcEl.textContent = state.race ? RACES[state.race].name : '-';
  const _csEl = el('class-text'); if (_csEl) _csEl.textContent = state.class ? getClass(state.class).name : '-';
  const _sgEl = el('saga-text'); if (_sgEl) _sgEl.textContent = SAGAS[state.currentSaga].name;
  const _sz = el('stage-zone');
  if (_sz) { const _t = state.zone ? ZONES[state.zone].name + (ZONES[state.zone].town ? ' · town' : '') : '—'; if (_sz.textContent !== _t) _sz.textContent = _t; }
  const _spaEl = el('sp-available'); if (_spaEl) _spaEl.textContent = state.sp;
  const _gtEl = el('gold-text'); if (_gtEl) _gtEl.textContent = state.gold.toLocaleString();
  const _sgdEl = el('shop-gold'); if (_sgdEl) _sgdEl.textContent = state.gold.toLocaleString();
  const _cl2El = el('craft-level'); if (_cl2El) _cl2El.textContent = state.craftLevel;
  const _isEl = el('inv-slots'); if (_isEl) _isEl.textContent = `${state.inventory.length}/50`;

  const abEl = el('active-buffs');
  if (abEl) {
    const now = Date.now();
    const items = Object.entries(state.buffs || {}).filter(([,b]) => b.until > now).map(([k,b]) => {
      const map = { xpBoost: ['📘', `+${Math.round(b.amount*100)}% XP`], goldBoost: ['🪙', `+${Math.round(b.amount*100)}% G`], luckBoost: ['🍀', `+${Math.round(b.amount*100)}% L`], autoPotion: ['🧪', 'Auto-Heal'], atk: ['⚔', `+${b.amount} ATK`], def: ['🛡', `+${b.amount} DEF`], matk: ['✦', `+${b.amount} MATK`], speed: ['⚡', `+${b.amount} SPD`], warcry: ['🗣', `+${b.amount*100}% ATK`] };
      const e = map[k]; if (!e) return null;
      return `<span class="ab-chip" title="${e[1]} · ${fmtCountdown(b.until-now)}">${e[0]}<em>${fmtCountdown(b.until-now)}</em></span>`;
    }).filter(Boolean);
    abEl.innerHTML = items.length ? items.join('') : '<span class="ab-empty">No active buffs</span>';
  }
}

function updateEquipmentUI() {
  const stats = getStats();
  const atkEl = el('l2stat-atk'); if (atkEl) atkEl.textContent = stats.atk;
  const defEl = el('l2stat-def'); if (defEl) defEl.textContent = stats.def;
  const matkEl = el('l2stat-matk'); if (matkEl) matkEl.textContent = stats.matk;
  const mdefEl = el('l2stat-mdef'); if (mdefEl) mdefEl.textContent = stats.mdef;
  const critEl = el('l2stat-crit'); if (critEl) critEl.textContent = `${stats.crit}%`;
  const spdEl = el('l2stat-speed'); if (spdEl) spdEl.textContent = stats.speed;

  for (const slot of ALL_EQUIP_SLOTS) {
    const uid = state.equipment[slot];
    const itemLabel = el(`pd-item-${slot}`);
    const pdSlots = qsa(`.l2inv-pd-slot[data-slot="${slot}"]`);
    const pdSlot = pdSlots && pdSlots.length ? pdSlots[0] : null;
    const elem = el(`equip-${slot}`);
    const wrap = elem && elem.closest ? elem.closest('.equip-slot') : null;
    
    if (!uid) {
      if (itemLabel) itemLabel.textContent = '';
      if (pdSlot) { pdSlot.classList.remove('has-item', 'rarity-common', 'rarity-uncommon', 'rarity-rare', 'rarity-epic', 'rarity-legendary'); pdSlot.title = `${slot} · vazio`; }
      if (elem) { elem.textContent = 'Empty'; elem.style.color = ''; elem.title = ''; }
      if (wrap) { wrap.style.borderColor = ''; wrap.title = slot + ' · empty'; }
      continue;
    }

    const item = state.inventory.find(i => i.uid === uid);
    if (!item) {
      state.equipment[slot] = null;
      if (itemLabel) itemLabel.textContent = '';
      if (pdSlot) { pdSlot.classList.remove('has-item', 'rarity-common', 'rarity-uncommon', 'rarity-rare', 'rarity-epic', 'rarity-legendary'); pdSlot.title = `${slot} · vazio`; }
      if (elem) { elem.textContent = 'Empty'; elem.style.color = ''; elem.title = ''; }
      if (wrap) { wrap.style.borderColor = ''; wrap.title = slot + ' · empty'; }
      continue;
    }

    const def = D().ALL_ITEMS[item.itemId]; if (!def) continue;
    const rarity = item.rarity || 'common';
    const enchantStr = item.enchant ? `+${item.enchant}` : '';
    const full = (enchantStr ? enchantStr + ' ' : '') + def.name + (item.rarity ? ' [' + D().RARITY[item.rarity].name + ']' : '');
    const col = item.rarity ? D().RARITY[rarity]?.color : 'var(--gilt)';

    if (itemLabel) itemLabel.textContent = enchantStr;
    if (pdSlot) {
      pdSlot.className = `l2inv-pd-slot equip-slot has-item rarity-${rarity}`;
      pdSlot.title = `${enchantStr ? enchantStr + ' ' : ''}${def.name} (${slot})`;
      pdSlot.onmouseenter = (e) => { cancelHideTooltip(); showItemTooltip(item, e); };
      pdSlot.onmouseleave = scheduleHideTooltip;
    }
    if (elem) {
      elem.textContent = (enchantStr ? enchantStr + ' ' : '') + def.name;
      elem.style.color = col;
      elem.title = full;
    }
    if (wrap) {
      wrap.style.borderColor = col;
      wrap.title = full;
    }
  }

  const eb = getTotalEquipBonuses(); const list = el('bonus-list');
  if (list) {
    list.innerHTML = '';
    const labels = { atk: 'ATK', def: 'DEF', matk: 'MATK', mdef: 'MDEF', hp: 'HP', mp: 'MP', eva: 'EVA', crit: 'CRIT', speed: 'SPD', lifesteal: 'LIFE STEAL' };
    for (const [k, label] of Object.entries(labels)) { if (eb[k]) { const div = mkEl('div'); div.innerHTML = `<span>${label}</span><span class="bonus-val">+${eb[k]}${k==='crit'?'%':''}</span>`; list.appendChild(div); } }
    if (!list.children.length) list.innerHTML = '<div style="color:var(--text-muted)">No equipment</div>';
  }
  renderStageHero();
}

const TREE_NODE_W = 110; const TREE_NODE_H = 78; const TREE_PAD_X = 14; const TREE_PAD_Y = 14;

function updateSkillUI() {
  const wrap = el('skill-tree');
  if (!wrap) return;
  const cols = 5, rows = 7;
  const W = cols * TREE_NODE_W + TREE_PAD_X * 2;
  const H = rows * TREE_NODE_H + TREE_PAD_Y * 2;
  wrap.style.width = W + 'px'; wrap.style.height = H + 'px';

  const pDef = getClass(state.class);
  const activeTreeClass = pDef?.archetype || 'fighter';

  const pos = {};
  const classSkills = Object.entries(SKILL_DEFS).filter(([id, def]) => classSatisfies(state.class, def.classReq));
  const skillsByTier = { 0: [], 1: [], 2: [], 3: [], 4: [] };
  for (const [id, def] of classSkills) {
    const t = def.tier !== undefined ? def.tier : 0;
    if (skillsByTier[t]) skillsByTier[t].push([id, def]);
  }

  for (let c = 0; c < 5; c++) {
    const list = skillsByTier[c] || [];
    list.forEach(([id, def], idx) => {
      const explicit = SKILL_TREE_LAYOUT[id];
      const col = (explicit && explicit.col !== undefined) ? explicit.col : c;
      const row = (explicit && explicit.row !== undefined) ? explicit.row : idx;
      pos[id] = {
        x: TREE_PAD_X + col * TREE_NODE_W + TREE_NODE_W / 2,
        y: TREE_PAD_Y + row * TREE_NODE_H + TREE_NODE_H / 2
      };
    });
  }

  let lines = '';
  for (const [id, reqs] of Object.entries(SKILL_REQS)) {
    const childPos = pos[id];
    if (!childPos) continue;
    for (const parentId of Object.keys(reqs)) {
      const parentPos = pos[parentId];
      if (!parentPos) continue;
      const owned = (state.skills[parentId] || 0) >= reqs[parentId];
      const cls = owned ? 'link link-owned' : 'link';
      if (parentPos.y === childPos.y) {
        const cy = parentPos.y - 26; lines += `<path class="${cls}" d="M ${parentPos.x} ${parentPos.y} Q ${(parentPos.x+childPos.x)/2} ${cy} ${childPos.x} ${childPos.y}" />`;
      } else { lines += `<line class="${cls}" x1="${parentPos.x}" y1="${parentPos.y}" x2="${childPos.x}" y2="${childPos.y}" />`; }
    }
  }
  
  let tierLabels = '';
  for (let c = 0; c < cols; c++) { const x = TREE_PAD_X + c * TREE_NODE_W + TREE_NODE_W / 2; tierLabels += `<text class="tier-label" x="${x}" y="${H - 4}">${TIER_NAMES[c] || ''}</text>`; }
  wrap.querySelector('svg')?.remove();
  const svg = mkNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'skill-tree-svg'); svg.setAttribute('width', W); svg.setAttribute('height', H); svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = lines + tierLabels; wrap.insertBefore(svg, wrap.firstChild);

  let nodesLayer = wrap.querySelector('.skill-tree-nodes');
  if (!nodesLayer) { nodesLayer = mkEl('div'); nodesLayer.className = 'skill-tree-nodes'; wrap.appendChild(nodesLayer); }
  nodesLayer.innerHTML = '';
  
  for (const [id, def] of Object.entries(SKILL_DEFS)) {
    if (!classSatisfies(state.class, def.classReq)) continue;
    const p = pos[id]; if (!p) continue;
    const lvl = state.skills[id] || 0, max = def.max;
    const node = mkEl('div'); node.className = `skill-node tier-${def.tier}` + (lvl > 0 ? ' owned' : '') + (lvl === max ? ' maxed' : '');
    node.style.left = (p.x - TREE_NODE_W / 2) + 'px'; node.style.top = (p.y - TREE_NODE_H / 2) + 'px';
    node.style.width = TREE_NODE_W + 'px'; node.style.height = TREE_NODE_H + 'px';
    const reqs = SKILL_REQS[id], reqOk = !reqs || Object.entries(reqs).every(([s, v]) => (state.skills[s] || 0) >= v);
    const lvlOk = state.level >= (def.reqLvl || 1), canBuy = reqOk && lvlOk && state.sp >= getSkillCost(id, lvl) && lvl < max;
    const btnClass = canBuy ? 'skill-btn can-buy' : 'skill-btn';
    node.innerHTML = `
      <button class="${btnClass}" data-skill="${id}">
        <span class="skill-icon">${def.icon || '✦'}</span>
        <span class="skill-name">${def.name}</span>
        <span class="skill-lvl-num">${lvl}/${max}</span>
      </button>
    `;
    nodesLayer.appendChild(node);
  }

  qsa('.skill-btn').forEach(btn => {
    const sId = btn.dataset.skill, def = SKILL_DEFS[sId]; if (!def) return;
    btn.onmouseenter = (e) => showSkillTooltip(sId, e); btn.onmouseleave = hideSkillTooltip;
    btn.onclick = () => spendSP(sId);
  });
  updateSkillInfoPanel();
}

function buySkill(sId) {
  spendSP(sId);
}

function getSkillCost(skillId, currentLvl) {
  const def = SKILL_DEFS[skillId];
  if (!def) return 0;
  const baseCost = def.cost || 5;
  return Math.floor(baseCost * Math.pow(1.4, currentLvl || 0));
}

function updateSkillInfoPanel() {
  const panel = el('skill-info-panel'); if (!panel) return;
  // Find the first applicable skill for the current class as fallback
  let id = state.selectedSkill;
  if (!id || !SKILL_DEFS[id]) {
    const firstApplicable = Object.keys(SKILL_DEFS).find(sid =>
      classSatisfies(state.class, SKILL_DEFS[sid].classReq) && (state.skills[sid] || 0) > 0
    ) || Object.keys(SKILL_DEFS).find(sid =>
      classSatisfies(state.class, SKILL_DEFS[sid].classReq)
    );
    id = firstApplicable || null;
  }
  const def = id ? SKILL_DEFS[id] : null;
  if (!def) { panel.innerHTML = '<p style="color:var(--text-muted);padding:12px">Select a skill to view details.</p>'; return; }
  const lvl = state.skills[id] || 0;
  const maxed = lvl >= def.max;
  const cost = getSkillCost(id, lvl);
  const reqs = SKILL_REQS[id];
  const meetsReqs = !reqs || Object.entries(reqs).every(([s, v]) => (state.skills[s] || 0) >= v);
  const lvlOk = state.level >= def.reqLvl;
  const canAfford = state.sp >= cost && !maxed;
  
  let reqHtml = reqs ? Object.entries(reqs).map(([s, v]) => { const ok = (state.skills[s] || 0) >= v; return `<span class="req ${ok ? 'ok' : 'no'}">${SKILL_DEFS[s]?.name || s} ${v}</span>`; }).join('') : '';
  reqHtml += `<span class="req ${lvlOk ? 'ok' : 'no'}">Level ${def.reqLvl}</span>`;

  const tier = TIER_NAMES[def.tier] || '';
  panel.innerHTML = `
    <div class="si-head"><span class="si-icon">${def.icon || '✦'}</span><div class="si-title"><h3>${def.name}</h3><p class="si-tier">${tier} · Lv.${lvl}/${def.max}</p></div></div>
    <p class="si-desc">${def.desc}</p><div class="si-effect">${def.info}</div>
    <div class="si-reqs"><span class="si-label">Requires</span>${reqHtml}</div>
    <button class="si-btn" data-skillup="${id}" ${(!canAfford || !meetsReqs || !lvlOk) ? 'disabled' : ''}>${maxed ? '✦ MAXED' : `Invest ${cost.toLocaleString()} SP`}</button>
    <p class="si-sp">SP available: <strong>${state.sp.toLocaleString()}</strong></p>
  `;
  const btn = panel.querySelector('[data-skillup]'); if (btn) btn.onclick = () => spendSP(btn.dataset.skillup);
}

function updateInventoryUI() {
  updateEquipmentUI();
  const grid = el('inventory-grid'); if (!grid) return; grid.innerHTML = '';
  const selectedSet = getSelectedSet();
  const filter = state.filter || 'all';
  const rarityFilter = state.rarityFilter || 'all';
  const equipFilter = state.equipFilter || 'all';

  const sorted = [...state.inventory]
    .filter(i => i && i.itemId && D().ALL_ITEMS[i.itemId])
    .sort((a, b) => { const da = D().ALL_ITEMS[a.itemId], db = D().ALL_ITEMS[b.itemId]; if (!da || !db) return 0; return (db.tier || 0) - (da.tier || 0); });
    
  let shown = 0;
  let selectedValue = 0;
  let salvageableCount = 0;

  for (const item of sorted) {
    const def = D().ALL_ITEMS[item.itemId]; if (!def) continue;
    
    // Category Filter matching L2 Tabs
    if (filter !== 'all') {
      if (filter === 'gear' && !['weapon','armor','helmet','gloves','boots','ring'].includes(def.slot)) continue;
      else if (filter === 'consumable' && !['consumable','potion','scroll','powerup'].includes(def.slot)) continue;
      else if (filter === 'material' && !['material','gem','craft'].includes(def.slot)) continue;
      else if (filter === 'scroll' && !['scroll','quest'].includes(def.slot)) continue;
      else if (!['gear','consumable','material','scroll'].includes(filter) && def.slot !== filter) continue;
    }

    const rarity = item.rarity || 'common';
    if (rarityFilter !== 'all' && rarity !== rarityFilter) continue;
    if (equipFilter === 'equipped' && !item.equipped) continue;
    if (equipFilter === 'bag' && item.equipped) continue;

    const isSelected = selectedSet.has(item.uid);
    if (isSelected && !item.equipped) {
      const qty = item.count || 1;
      const basePrice = def.price || 10;
      const rarityDef = item.rarity ? D().RARITY[item.rarity] : null;
      const mult = rarityDef ? rarityDef.mult : 1;
      const enchantMult = 1 + (item.enchant || 0) * 0.1;
      selectedValue += Math.floor(basePrice * mult * enchantMult * 0.4) * qty;
      if (['weapon','armor','helmet','gloves','boots','ring'].includes(def.slot)) {
        salvageableCount += qty;
      }
    }

    const slot = mkEl('div');
    slot.className = `inv-slot rarity-${rarity}` + (item.equipped ? ' is-equipped' : '') + (isSelected ? ' is-selected' : '');
    const qty = (item.count || 1) > 1 ? `<span class="qty">${item.count}</span>` : '';
    const tag = item.equipped ? `<span class="equipped-badge">E</span>` : '';
    const enchantStr = item.enchant ? `+${item.enchant} ` : '';
    const checkHtml = `<div class="slot-select-checkbox">${isSelected ? '✓' : ''}</div>`;
    slot.innerHTML = `${checkHtml}<span style="font-size:18px">${getItemIcon(def)}</span><span class="name">${enchantStr}${def.name}</span>${qty}${tag}`;
    
    // Hover tooltips for backpack items with smooth grace period
    slot.onmouseenter = (e) => { cancelHideTooltip(); showItemTooltip(item, e); };
    slot.onmouseleave = scheduleHideTooltip;

    slot.onclick = (e) => {
      e.stopPropagation();
      toggleSelectItem(item.uid);
    };

    slot.ondblclick = (e) => {
      e.stopPropagation();
      if (['weapon','armor','helmet','gloves','boots','ring'].includes(def.slot)) {
        equipItem(item.uid);
      } else if (['consumable','scroll','powerup'].includes(def.slot)) {
        useItem(item.uid);
      }
    };

    slot.oncontextmenu = (e) => {
      e.preventDefault();
      toggleSelectItem(item.uid);
    };

    grid.appendChild(slot); shown++;
  }

  const sellBtn = el('sell-selected-btn');
  if (sellBtn) {
    sellBtn.disabled = selectedSet.size === 0;
    sellBtn.textContent = selectedSet.size > 0 ? `💰 Vender (${selectedValue.toLocaleString()}g)` : `💰 Vender`;
  }
  const salvageBtn = el('salvage-selected-btn');
  if (salvageBtn) {
    salvageBtn.disabled = selectedSet.size === 0 || salvageableCount === 0;
    salvageBtn.textContent = salvageableCount > 0 ? `🔨 Desmontar (${salvageableCount})` : `🔨 Desmontar`;
  }

  const slotCount = el('inv-slots'); if (slotCount) slotCount.textContent = `${state.inventory.length}/50`;
  const slotCountVal = el('inv-slots-count'); if (slotCountVal) slotCountVal.textContent = state.inventory.length;
  const goldCount = el('gold-text'); if (goldCount) goldCount.textContent = state.gold.toLocaleString();

  if (shown === 0) grid.innerHTML = '<div class="inv-empty-msg">Nenhum item encontrado nesta categoria</div>';
}

function getItemIcon(def) { const icons = { weapon: '⚔️', armor: '🛡️', helmet: '⛑️', gloves: '🧤', boots: '👢', ring: '💍', consumable: '🧪', material: '💎', scroll: '📜' }; return icons[def.slot] || '📦'; }

let tooltipTimer = null;

function scheduleHideTooltip() {
  if (tooltipTimer) clearTimeout(tooltipTimer);
  tooltipTimer = setTimeout(() => {
    hideItemTooltip();
  }, 220);
}

function cancelHideTooltip() {
  if (tooltipTimer) {
    clearTimeout(tooltipTimer);
    tooltipTimer = null;
  }
}

function showItemTooltip(item, e) {
  cancelHideTooltip();
  const def = D().ALL_ITEMS[item.itemId]; if (!def) return;
  const tt = el('item-tooltip'), rarity = item.rarity || 'common', mult = D().RARITY[rarity]?.mult || 1, rc = D().RARITY[rarity]?.color || '#c8a84e';
  const enchantStr = item.enchant ? `+${item.enchant} ` : '';
  let html = `<div class="tt-name" style="color:${rc}">${enchantStr}${def.name}</div>`;
  if (item.rarity) html += `<div class="tt-rarity" style="color:${rc}">${D().RARITY[rarity]?.name || rarity}</div>`;
  const reqLvl = def.req ? def.req.level : 1; const grade = getItemGrade(reqLvl);
  html += `<div style="color:var(--text-muted);font-size:10px;text-transform:capitalize;">${def.slot} · <span style="font-weight:bold; color:var(--gilt);">${grade}</span></div>`;
  if (def.req) html += `<div class="tt-req">Req: Lv.${def.req.level}</div>`;
  if (def.classReq) { const cls = getClass(def.classReq); const ok = classSatisfies(state.class, def.classReq); html += `<div class="tt-req ${ok?'ok':'no'}">Class: ${cls?.name || def.classReq}${ok?' ✓':''}</div>`; }
  if (def.desc) html += `<div class="tt-desc">${def.desc}</div>`;
  const stats = ['atk','def','matk','mdef','hp','mp','eva','crit','speed','lifesteal'];
  for (const s of stats) { if (def[s]) { const v = Math.floor(def[s] * mult); html += `<div class="tt-stat"><span>${s.toUpperCase()}</span><span class="v">+${v}${s === 'crit' ? '%' : ''}</span></div>`; } }
  if (def.craftBonus) html += `<div class="tt-stat"><span>CRAFT XP</span><span class="v">+${Math.round(def.craftBonus*mult*100)}%</span></div>`;
  if (def.lootBonus) html += `<div class="tt-stat"><span>LOOT</span><span class="v">+${Math.round(def.lootBonus*mult*100)}%</span></div>`;
  if (def.stack) html += `<div class="tt-stat"><span>Stack</span><span class="v">${item.count || 1}</span></div>`;
  if (item.equipped) html += `<div class="tt-equipped">[ EQUIPPED ]</div>`;
  
  const canEquipLvl = !def.req || state.level >= def.req.level;
  const canEquipCls = classSatisfies(state.class, def.classReq);
  const canEquip = canEquipLvl && canEquipCls;
  
  html += `<div class="tt-actions">`;
  if (item.equipped) html += `<button class="item-action" data-action="unequip" data-uid="${item.uid}">Unequip</button>`;
  else if (['weapon','armor','helmet','gloves','boots','ring'].includes(def.slot)) {
    html += `<button class="item-action" data-action="equip" data-uid="${item.uid}" ${!canEquip ? 'disabled title="Nível ou classe incompatível"' : ''}>Equip</button>`;
    html += `<button class="item-action" data-action="salvage" data-uid="${item.uid}">Break</button>`;
  }
  if (def.slot === 'consumable' || def.slot === 'scroll' || def.slot === 'powerup') html += `<button class="item-action" data-action="use" data-uid="${item.uid}">Use</button>`;
  const sellPrice = Math.floor((def.price||10)*0.4*(item.rarity?D().RARITY[item.rarity].mult:1));
  html += `<button class="item-action sell" data-action="sell" data-uid="${item.uid}">Sell ${sellPrice}g</button></div>`;
  
  tt.innerHTML = html; tt.style.display = 'block'; 
  
  tt.onmouseenter = cancelHideTooltip;
  tt.onmouseleave = scheduleHideTooltip;
  tt.onclick = (ev) => ev.stopPropagation();

  if (e && e.currentTarget) {
    const rect = e.currentTarget.getBoundingClientRect(); 
    let leftPos = rect.right + 6;
    if (leftPos + 270 > window.innerWidth) leftPos = rect.left - 275; 
    tt.style.left = Math.max(10, leftPos) + 'px'; 
    tt.style.top = Math.max(10, rect.top - 10) + 'px';
  } else if (e && e.clientX) {
    tt.style.left = Math.min(window.innerWidth - 270, e.clientX + 15) + 'px';
    tt.style.top = Math.min(window.innerHeight - 300, e.clientY + 15) + 'px';
  }
  
  tt.querySelectorAll('.item-action').forEach(btn => {
    btn.onclick = (ev) => { 
      ev.stopPropagation(); 
      const action = btn.dataset.action, uid = btn.dataset.uid;
      if (action === 'equip') equipItem(uid); 
      else if (action === 'unequip') { for (const slot of Object.keys(state.equipment)) { if (state.equipment[slot] === uid) { unequipItem(slot); break; } } }
      else if (action === 'use') useItem(uid); 
      else if (action === 'sell') sellItem(uid); 
      else if (action === 'salvage') salvageItem(uid);
      hideItemTooltip();
    };
  });
}

function hideItemTooltip() { 
  cancelHideTooltip();
  const tt = el('item-tooltip');
  if (tt) tt.style.display = 'none'; 
}

function hideSkillTooltip() {
  hideItemTooltip();
}

function showSkillTooltip(skillId, e) {
  state.selectedSkill = skillId;
  updateSkillInfoPanel();
  cancelHideTooltip();
  const def = SKILL_DEFS[skillId];
  if (!def) return;
  
  const tt = el('item-tooltip');
  if (!tt) return;

  const lvl = state.skills[skillId] || 0;
  const max = def.max;
  const reqs = SKILL_REQS[skillId];
  const reqText = reqs ? Object.entries(reqs).map(([s, v]) => `${SKILL_DEFS[s]?.name || s} ${v}`).join(', ') : 'Nenhum';
  const tier = TIER_NAMES[def.tier] || '';

  tt.innerHTML = `
    <div class="tt-header rarity-epic">
      <span class="tt-icon">${def.icon || '✦'}</span>
      <div class="tt-title">
        <div class="tt-name" style="color:var(--gilt); font-weight:700;">${def.name}</div>
        <div class="tt-slot">${tier} · Lv.${lvl}/${max}</div>
      </div>
    </div>
    <div class="tt-body" style="padding-top:6px;">
      <p class="tt-desc">${def.desc || ''}</p>
      <div class="tt-effect" style="margin-top:6px; color:#f0d080; font-weight:600;">${def.info || ''}</div>
      <div style="margin-top:6px; font-size:10px; color:#888;">Requisitos: ${reqText} (Lv.${def.reqLvl || 1})</div>
    </div>
  `;

  tt.style.display = 'block';
  tt.style.zIndex = '999999';
  tt.onmouseenter = cancelHideTooltip;
  tt.onmouseleave = scheduleHideTooltip;
}

function updateShopUI() {
  if (!state.zone && state.race && RACES[state.race]?.startZone) state.zone = RACES[state.race].startZone;
  if (!state.zone) state.zone = 'talkingIsland';
  qsa('.shop-subtab').forEach(b => { b.classList.toggle('active', b.dataset.shoptab === state.shopTab); b.onclick = () => { state.shopTab = b.dataset.shoptab; updateShopUI(); }; });
  const list = el('shop-list'); if (!list) return; list.innerHTML = '';
  if (state.shopTab === 'gear') renderShopGear(list); else if (state.shopTab === 'potions') renderShopPotions(list); else if (state.shopTab === 'powerups') renderShopPowerups(list); else if (state.shopTab === 'class') renderShopClass(list); else if (state.shopTab === 'mystic') renderShopMystic(list);
  list.querySelectorAll('[data-buy]').forEach(btn => btn.onclick = () => buyItem(btn.dataset.buy, parseInt(btn.dataset.qty || 1)));
  list.querySelectorAll('[data-buy-rarity]').forEach(btn => btn.onclick = () => buyMysticItem(btn.dataset.buyRarity, btn.dataset.rarity));
}

function shopRow(def, id, price, extra = '') {
  const canAfford = state.gold >= price; 
  const statsLine = buildStatLine(def);
  const lockLvl = def.req && def.req.level > state.level; 
  const lockCls = def.classReq && def.classReq !== state.class;
  const lockReason = lockLvl ? `Lv.${def.req.level}` : lockCls ? `Needs ${getClass(def.classReq)?.name}` : '';
  const row = mkEl('div'); 
  row.className = 'shop-item' + (lockLvl || lockCls ? ' locked' : '');

  const isStackable = def.slot === 'consumable' || def.slot === 'scroll' || def.slot === 'powerup' || def.stack;

  let buyActionHtml = '';
  if (isStackable && !lockLvl && !lockCls) {
    buyActionHtml = `
      <div class="shop-bulk-actions">
        <button class="item-action" data-buy="${id}" data-qty="1" ${state.gold < price ? 'disabled' : ''}>1x (${price}g)</button>
        <button class="item-action" data-buy="${id}" data-qty="10" ${state.gold < price * 10 ? 'disabled' : ''}>10x (${(price * 10).toLocaleString()}g)</button>
        <button class="item-action" data-buy="${id}" data-qty="100" ${state.gold < price * 100 ? 'disabled' : ''}>100x (${(price * 100).toLocaleString()}g)</button>
        <button class="item-action" data-buy="${id}" data-qty="1000" ${state.gold < price * 1000 ? 'disabled' : ''}>1000x (${(price * 1000).toLocaleString()}g)</button>
      </div>
    `;
  } else {
    buyActionHtml = `<button class="item-action" data-buy="${id}" data-qty="1" ${(!canAfford || lockLvl || lockCls) ? 'disabled' : ''}>${price.toLocaleString()}g</button>`;
  }

  row.innerHTML = `<div class="item-info"><div class="item-name">${def.name}${def.tier ? ' <span class="tier-tag">T'+def.tier+'</span>' : ''}</div><div class="item-desc">${def.desc || ''}</div>${statsLine ? `<div class="item-stats">${statsLine}</div>` : ''}${lockReason ? `<div class="lock-reason">🔒 ${lockReason}</div>` : ''}</div>${buyActionHtml}${extra}`;
  return row;
}

function buildStatLine(def) {
  const parts = [];
  if (def.atk) parts.push(`⚔${def.atk}`); if (def.matk) parts.push(`✦${def.matk}`); if (def.def) parts.push(`🛡${def.def}`); if (def.mdef) parts.push(`🔷${def.mdef}`); if (def.hp) parts.push(`❤${def.hp}`); if (def.mp) parts.push(`💧${def.mp}`); if (def.eva) parts.push(`🏃${def.eva}`); if (def.crit) parts.push(`💥${def.crit}%`); if (def.lifesteal) parts.push(`🩸${def.lifesteal}%`); if (def.speed) parts.push(`⚡${def.speed}`); if (def.craftBonus) parts.push(`🔨+${Math.round(def.craftBonus*100)}%`); if (def.lootBonus) parts.push(`💰+${Math.round(def.lootBonus*100)}%`);
  return parts.join(' · ');
}

function renderShopGear(list) {
  const zone = ZONES[state.zone], shopId = zone?.shop, items = shopId ? D().SHOP_INVENTORY[shopId] : null;
  if (!items) { list.innerHTML = '<p class="shop-empty">No gear merchant in this area.</p>'; return; }
  let count = 0;
  for (const shopItem of items) { 
    const def = D().ALL_ITEMS[shopItem.id]; 
    if (!def || def.slot === 'consumable' || def.slot === 'scroll' || def.slot === 'powerup' || def.classReq) continue; 
    list.appendChild(shopRow(def, shopItem.id, def.price)); 
    count++; 
  }
  if (!count) list.innerHTML = '<p class="shop-empty">The merchant has no gear for you yet.</p>';
}
function renderShopPotions(list) {
  const zone = ZONES[state.zone], shopId = zone?.shop, items = shopId ? D().SHOP_INVENTORY[shopId] : null;
  const base = ['soulshot_ng','spiritshot_ng','hp_potion_s','hp_potion_m','hp_potion_l','hp_potion_xl','mp_potion_s','mp_potion_m','mp_potion_l','mp_potion_xl','antidote','scroll_of_resurrection','scroll_of_rebirth','spellbook_1star','spellbook_2star','spellbook_3star','spellbook_4star'];
  const shown = new Set(), list2 = [...base, ...(items || []).map(i => i.id)]; let count = 0;
  for (const id of list2) { if (shown.has(id)) continue; const def = D().ALL_ITEMS[id]; if (!def || (def.slot !== 'consumable' && def.slot !== 'scroll') || (def.req && def.req.level > state.level)) continue; shown.add(id); list.appendChild(shopRow(def, id, def.price)); count++; }
  if (!count) list.innerHTML = '<p class="shop-empty">No potions in stock.</p>';
}
function renderShopPowerups(list) {
  const powerupIds = ['xp_boost_1h','xp_boost_4h','gold_boost_1h','gold_boost_4h','luck_boost_1h','auto_potion_1h','teleport_scroll','berserker_elixir','aegis_draught','sages_tea'];
  const activeBuffs = Object.entries(state.buffs || {}).filter(([k,b]) => ['xpBoost','goldBoost','luckBoost','autoPotion'].includes(k) && b.until > Date.now());
  if (activeBuffs.length) {
    const hdr = mkEl('div'); hdr.className = 'shop-header'; hdr.innerHTML = '<h4>Active Powerups</h4>'; list.appendChild(hdr);
    for (const [k, b] of activeBuffs) { const remaining = Math.max(0, b.until - Date.now()); const names = { xpBoost: '📘 XP Boost', goldBoost: '🪙 Gold Boost', luckBoost: '🍀 Luck Boost', autoPotion: '🧪 Auto-Potion' }; const row = mkEl('div'); row.className = 'shop-item active-buff'; row.innerHTML = `<div class="item-info"><div class="item-name">${names[k] || k}</div><div class="item-desc">+${Math.round(b.amount*100)}% · ${fmtCountdown(remaining)}</div></div><div class="buff-pulse"></div>`; list.appendChild(row); }
    const sep = mkEl('div'); sep.className = 'shop-header'; sep.innerHTML = '<h4>Buy More</h4>'; list.appendChild(sep);
  }
  for (const id of powerupIds) { const def = D().ALL_ITEMS[id]; if (def) list.appendChild(shopRow(def, id, def.price)); }
}
function renderShopClass(list) {
  const clsName = state.class ? (getClass(state.class)?.name || state.class) : 'Aventureiro';
  const hdr = mkEl('div'); hdr.className = 'shop-header';
  hdr.innerHTML = `<h4>🎖️ ${clsName} Exclusivos &amp; Avanço de Ordem</h4><p>Equipamentos mestres e emblemas da sua ordem.</p>`;
  list.appendChild(hdr);
  
  let count = 0;
  for (const id of Object.keys(D().ALL_ITEMS)) {
    const def = D().ALL_ITEMS[id];
    if (!def) continue;
    if (def.classReq && def.classReq === state.class) {
      list.appendChild(shopRow(def, id, def.price));
      count++;
    }
  }
  
  // Show high-level class weapons if none available
  if (count === 0) {
    const fallbackClassItems = ['arcane_wand', 'council_staff', 'starfall_staff', 'shadow_fangs', 'wraith_reavers', 'void_talons', 'warlords_plate', 'arcane_vestments'];
    for (const id of fallbackClassItems) {
      const def = D().ALL_ITEMS[id];
      if (def) { list.appendChild(shopRow(def, id, def.price)); count++; }
    }
  }
}

function renderShopMystic(list) {
  const rot = D().getMysticRotation(), hdr = mkEl('div'); hdr.className = 'shop-header mystic-header';
  hdr.innerHTML = `<h4>✦ Relíquias &amp; Tesouros Místicos ✦</h4><p>Ofertas raras e encantos ancestrais. Renovação em <span id="mystic-timer">${fmtCountdown(rot[0]?.msLeft || 0)}</span></p>`;
  list.appendChild(hdr);
  
  for (const pick of rot) {
    const def = D().ALL_ITEMS[pick.id]; if (!def) continue;
    const price = Math.floor((def.price || 500) * D().RARITY[pick.rarity].mult * 2);
    const cloned = D().rollItemWithRarity(pick.id, pick.rarity);
    const canAfford = state.gold >= price;
    const lockLvl = def.req && def.req.level > state.level;
    const lockCls = def.classReq && def.classReq !== state.class;
    const row = mkEl('div');
    row.className = `shop-item rarity-${pick.rarity}` + (lockLvl || lockCls ? ' locked' : '');
    const statsLine = buildStatLine(cloned);
    row.innerHTML = `<div class="item-info"><div class="item-name rarity-${pick.rarity}">${def.name} <span class="rarity-tag">${D().RARITY[pick.rarity].name}</span></div><div class="item-desc">${def.desc || ''}</div>${statsLine ? `<div class="item-stats">${statsLine}</div>` : ''}</div><button class="item-action mystic-buy" data-buy-rarity="${pick.id}" data-rarity="${pick.rarity}" ${(!canAfford || lockLvl || lockCls) ? 'disabled' : ''}>${price.toLocaleString()}g</button>`;
    list.appendChild(row);
  }

  // Mystic Enchant Scrolls & Artifacts
  const mysticArtifacts = ['enchant_weapon_scroll', 'enchant_armor_scroll', 'scroll_of_resurrection', 'teleport_scroll'];
  const sep = mkEl('div'); sep.className = 'shop-header'; sep.innerHTML = '<h4>✦ Pergaminhos Místicos Ancestrais</h4>'; list.appendChild(sep);
  for (const id of mysticArtifacts) {
    const def = D().ALL_ITEMS[id]; if (def) list.appendChild(shopRow(def, id, Math.floor(def.price * 1.2)));
  }
}

function fmtCountdown(ms) { const s = Math.max(0, Math.floor(ms / 1000)), m = Math.floor(s / 60), ss = s % 60; return `${m}:${ss.toString().padStart(2,'0')}`; }

function buyItem(itemId, qty = 1) {
  const def = D().ALL_ITEMS[itemId]; if (!def) return;
  const count = Math.max(1, parseInt(qty) || 1);
  const totalPrice = (def.price || 10) * count;
  if (state.gold < totalPrice) { log(`Ouro insuficiente (${totalPrice.toLocaleString()}g necessário).`, 'system'); return; }
  if (def.req && def.req.level > state.level) { log('Level too low.', 'system'); return; }
  if (def.classReq && !classSatisfies(state.class, def.classReq)) { log('Wrong class for this item.', 'system'); return; }
  if (!addToInventory(itemId, count, null)) return;
  state.gold -= totalPrice; 
  log(`Comprado x${count} ${def.name} por ${totalPrice.toLocaleString()}g`, 'loot'); 
  updateAllUI(); 
  save();
}

function buyMysticItem(itemId, rarity) {
  const def = D().ALL_ITEMS[itemId]; if (!def) return;
  const price = Math.floor((def.price || 500) * D().RARITY[rarity].mult * 2);
  if (state.gold < price) { log('Not enough gold!', 'system'); return; }
  if (def.req && def.req.level > state.level) { log('Level too low.', 'system'); return; }
  if (def.classReq && !classSatisfies(state.class, def.classReq)) { log('Wrong class for this item.', 'system'); return; }
  if (!addToInventory(itemId, 1, rarity)) return;
  state.gold -= price; log(`Mystic purchase: ${def.name} [${D().RARITY[rarity].name}] for ${price}g`, 'rarity-' + rarity); updateAllUI(); save();
}

const RAID_BOSSES = {
  queen_ant: { id: 'queen_ant', name: 'Queen Ant 👑', lvl: 40, hp: 12000, atk: 180, def: 60, eva: 10, xp: 8000, sp: 80, gold: [4000, 8000], boss: true, raid: true, reqLvl: 30, desc: 'Rainha Formiga dos Ermos de Gludio. Drop: Ring of Queen Ant' },
  zaken: { id: 'zaken', name: 'Zaken o Pirata 🏴‍☠️', lvl: 60, hp: 35000, atk: 320, def: 110, eva: 15, xp: 25000, sp: 200, gold: [15000, 30000], boss: true, raid: true, reqLvl: 50, desc: 'Capitão pirata da Ilha do Diabo. Drop: Earring of Zaken' },
  baium: { id: 'baium', name: 'Imperador Baium ⚡', lvl: 80, hp: 90000, atk: 580, def: 180, eva: 12, xp: 90000, sp: 500, gold: [40000, 80000], boss: true, raid: true, reqLvl: 70, desc: 'Imperador aprisionado na Torre. Drop: Ring of Baium' },
  antharas: { id: 'antharas', name: 'Dragão Antharas 🐉', lvl: 95, hp: 220000, atk: 850, def: 280, eva: 10, xp: 300000, sp: 1500, gold: [150000, 350000], boss: true, raid: true, reqLvl: 85, desc: 'Dragão da Terra. Drops: Earring of Antharas & Dragon Slayer' },
  valakas: { id: 'valakas', name: 'Dragão Valakas 🔥', lvl: 100, hp: 450000, atk: 1200, def: 380, eva: 8, xp: 750000, sp: 3500, gold: [400000, 800000], boss: true, raid: true, reqLvl: 90, desc: 'Senhor do Vulcão. Drops: Facemask & Necklace of Valakas' }
};

function toggleSoulshot() {
  state.soulshotActive = !state.soulshotActive;
  updateCombatControlsUI();
  log(`Soulshots ${state.soulshotActive ? 'ATIVADOS (Consome soulshots para +100% DANO)' : 'DESATIVADOS'}.`, 'system');
  save();
}

function toggleAutoPotion() {
  state.autoPotionActive = !state.autoPotionActive;
  updateCombatControlsUI();
  log(`Auto-Poção ${state.autoPotionActive ? 'ATIVADA (Bebe poção quando HP < 50%)' : 'DESATIVADA'}.`, 'system');
  save();
}

function toggleCombatSpeed() {
  state.combatSpeed = state.combatSpeed === 1 ? 2 : 1;
  updateCombatControlsUI();
  if (state.combatActive) {
    if (combatInterval) clearInterval(combatInterval);
    combatInterval = setInterval(attackMonster, Math.round(200 / state.combatSpeed));
  }
  log(`Velocidade de combate: ${state.combatSpeed}x ${state.combatSpeed === 2 ? 'TURBO ⏩' : 'Normal'}.`, 'system');
  save();
}

function updateCombatControlsUI() {
  const ssBtn = el('soulshot-toggle-btn');
  if (ssBtn) {
    ssBtn.classList.toggle('active', !!state.soulshotActive);
    const isMage = state.class === 'mage' || state.class === 'soulbreaker';
    const shotId = isMage ? 'spiritshot_ng' : 'soulshot_ng';
    const count = getInventoryCount(shotId);
    ssBtn.textContent = `⚡ Soulshot: ${state.soulshotActive ? 'ON' : 'OFF'} (${count})`;
  }
  const apBtn = el('autopotion-toggle-btn');
  if (apBtn) {
    apBtn.classList.toggle('active', !!state.autoPotionActive);
    const potCount = getInventoryCount('hp_potion_s') + getInventoryCount('hp_potion_m') + getInventoryCount('hp_potion_l') + getInventoryCount('hp_potion_xl');
    apBtn.textContent = `🧪 Auto-Poção: ${state.autoPotionActive ? 'ON' : 'OFF'} (${potCount})`;
  }
  const spdBtn = el('speed-toggle-btn');
  if (spdBtn) {
    spdBtn.classList.toggle('active', state.combatSpeed === 2);
    spdBtn.textContent = `⏩ Velocidade: ${state.combatSpeed || 1}x`;
  }
}

function clearLog() {
  const logEl = el('log');
  if (logEl) {
    logEl.innerHTML = '<p class="log-entry system">Histórico de log limpo.</p>';
  }
}

function setLogFilter(filterType) {
  state.logFilter = filterType;
  qsa('.log-filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.logfilter === filterType);
  });
  const entries = qsa('#log .log-entry');
  entries.forEach(entry => {
    if (filterType === 'all') {
      entry.style.display = 'block';
    } else if (filterType === 'combat') {
      const isCombat = entry.classList.contains('combat') || entry.classList.contains('damage') || entry.classList.contains('heal');
      entry.style.display = isCombat ? 'block' : 'none';
    } else if (filterType === 'loot') {
      const isLoot = entry.classList.contains('loot') || entry.classList.contains('xp') || entry.classList.contains('saga') || Array.from(entry.classList).some(c => c.startsWith('rarity-'));
      entry.style.display = isLoot ? 'block' : 'none';
    } else if (filterType === 'system') {
      const isSys = entry.classList.contains('system');
      entry.style.display = isSys ? 'block' : 'none';
    }
  });
}

function checkOfflineProgress(lastTime) {
  if (!lastTime) return;
  const elapsedMs = Date.now() - lastTime;
  if (elapsedMs < 60000) return;
  
  const minutesOffline = Math.min(480, Math.floor(elapsedMs / 60000));
  if (minutesOffline < 1) return;
  
  const OFFLINE_EFFICIENCY = 0.30; // Auto-Hunt Offline limit de 30%
  const rawKills = minutesOffline * 10;
  const kills = Math.floor(rawKills * OFFLINE_EFFICIENCY);
  const goldEarned = Math.floor(kills * (state.level * 6 + 10));
  const xpEarned = Math.floor(kills * (state.level * 12 + 15));
  const spEarned = Math.floor(kills * (state.level * 4 + 5));
  
  state.gold += goldEarned;
  state.xp += xpEarned;
  state.sp += spEarned;
  checkLevelUp();
  
  const rewardsEl = el('offline-rewards');
  const modalEl = el('offline-modal');
  if (rewardsEl && modalEl) {
    rewardsEl.innerHTML = `
      <div style="color:var(--rarity-epic); font-weight:bold; margin-bottom:8px;">🌙 Eficiência Auto-Hunt Offline: 30% (vs 100% Online)</div>
      <div>⏱️ Tempo Ausente: <strong>${minutesOffline} minutos</strong></div>
      <div>⚔️ Monstros Derrotados (30%): <strong>~${kills}</strong></div>
      <div>💰 Ouro Ganho: <strong style="color:var(--gilt-bright);">+${goldEarned.toLocaleString()}g</strong></div>
      <div>📘 XP Ganho: <strong style="color:#60a5fa;">+${xpEarned.toLocaleString()} XP</strong></div>
      <div>✨ SP Ganho: <strong style="color:#a855f7;">+${spEarned.toLocaleString()} SP</strong></div>
    `;
    modalEl.classList.add('active');
  }
}

function updateCraftUI() {
  qsa('.craft-subtab').forEach(b => {
    b.classList.toggle('active', b.dataset.crafttab === state.craftTab);
    b.onclick = () => { state.craftTab = b.dataset.crafttab; updateCraftUI(); };
  });
  const recipesView = el('craft-recipes-view');
  const enchantView = el('craft-enchant-view');
  if (recipesView) recipesView.classList.toggle('active', state.craftTab === 'recipes');
  if (enchantView) enchantView.classList.toggle('active', state.craftTab === 'enchant');

  if (state.craftTab === 'recipes') renderCraftRecipes();
  else if (state.craftTab === 'enchant') updateEnchantUI();
}

function renderCraftRecipes() {
  const list = el('craft-list'); if (!list) return; list.innerHTML = '';
  for (const [recipeId, recipe] of Object.entries(D().CRAFTING_RECIPES)) {
    const def = D().ALL_ITEMS[recipeId]; if (!def || (def.req && def.req.level > state.level)) continue;
    const canCraft = canCraftRecipe(recipeId), item = mkEl('div'); item.className = 'craft-item' + (canCraft ? '' : ' locked'); const reqLevel = getCraftLevelReq(recipe.level);
    const matHtml = Object.entries(recipe.materials).map(([matId, qty]) => { const have = getInventoryCount(matId), matDef = D().ALL_ITEMS[matId], cls = have >= qty ? 'have' : 'need'; return `<span class="${cls}">${matDef.name} ${have}/${qty}</span>`; }).join(', ');
    item.innerHTML = `<div class="item-info"><div class="item-name">${def.name}</div><div class="item-mats">${matHtml}</div><div class="item-desc">Req: Craft Lv.${reqLevel}</div></div><button class="item-action" data-craft="${recipeId}" ${!canCraft ? 'disabled' : ''}>Craft</button>`; list.appendChild(item);
  }
  qsa('[data-craft]').forEach(btn => btn.onclick = () => craftItem(btn.dataset.craft));
}

function updateEnchantUI() {
  const wsList = [el('enchant-workspace'), el('enchant-workspace-dedicated')].filter(Boolean);
  if (!wsList.length) return;
  
  for (const ws of wsList) {
    ws.innerHTML = '';
    const equippable = state.inventory.filter(i => {
      const def = D().ALL_ITEMS[i.itemId];
      return def && ['weapon','armor','helmet','gloves','boots','ring'].includes(def.slot);
    });
    
    if (!equippable.length) {
      ws.innerHTML = '<p class="shop-empty">Você não possui equipamentos na mochila para encantar.</p>';
      continue;
    }

    for (const item of equippable) {
      const def = D().ALL_ITEMS[item.itemId];
      const isWeapon = def.slot === 'weapon';
      const scrollId = isWeapon ? 'enchant_weapon_scroll' : 'enchant_armor_scroll';
      const scrollDef = D().ALL_ITEMS[scrollId];
      const count = getInventoryCount(scrollId);
      const enchant = item.enchant || 0;
      const rarityColor = item.rarity ? D().RARITY[item.rarity].color : 'var(--gilt)';
      
      const card = mkEl('div'); card.className = 'enchant-card';
      const title = (enchant > 0 ? `+${enchant} ` : '') + def.name + (item.rarity ? ` [${D().RARITY[item.rarity].name}]` : '');
      const safeMsg = enchant < 3 ? '100% Seguro (Até +3)' : `Sucesso: ${Math.max(30, 100 - (enchant - 3) * 10)}%`;
      
      card.innerHTML = `
        <div class="enchant-card-info">
          <div class="enchant-item-title" style="color:${rarityColor}">${title} ${item.equipped ? '⚡ (EQUIPADO)' : ''}</div>
          <div class="enchant-item-sub">Req: ${scrollDef ? scrollDef.name : scrollId} (Possui: ${count}) · ${safeMsg}</div>
        </div>
        <button class="item-action" data-enchant="${item.uid}" ${count < 1 ? 'disabled title="Sem pergaminhos de encantamento"' : ''}>Encantar (+1)</button>
      `;
      ws.appendChild(card);
    }

    ws.querySelectorAll('[data-enchant]').forEach(btn => {
      btn.onclick = () => enchantItem(btn.dataset.enchant);
    });
  }
}

function enchantItem(uid) {
  const item = state.inventory.find(i => i.uid === uid); if (!item) return;
  const def = D().ALL_ITEMS[item.itemId]; if (!def) return;
  const isWeapon = def.slot === 'weapon';
  const scrollId = isWeapon ? 'enchant_weapon_scroll' : 'enchant_armor_scroll';
  const scrollItem = state.inventory.find(i => i.itemId === scrollId && (i.count || 1) > 0);
  if (!scrollItem) { log('Pergaminho de encantamento necessário!', 'system'); return; }
  
  if (scrollItem.count > 1) scrollItem.count--;
  else removeFromInventory(scrollItem.uid, 1);

  const currentEnchant = item.enchant || 0;
  const chance = currentEnchant < 3 ? 1.0 : Math.max(0.3, 1.0 - (currentEnchant - 3) * 0.1);
  
  if (Math.random() < chance) {
    item.enchant = currentEnchant + 1;
    log(`✨ ENCHANT SUCCESS! ${def.name} is now +${item.enchant}!`, 'rarity-legendary');
    floatText(`✨ +${item.enchant} SUCESSO!`, 'float-jackpot');
  } else {
    item.enchant = Math.max(0, currentEnchant - 1);
    log(`💥 Enchant Failed! ${def.name} reduced to +${item.enchant}.`, 'system');
    floatText(`💥 FALHOU (-1)`, 'float-crit');
  }
  
  updateAllUI(); save();
}

function canCraftRecipe(id) { return canCraft(id); }

function updateZoneUI() {
  qsa('.zone-subtab').forEach(b => {
    b.classList.toggle('active', b.dataset.zonetab === state.zoneTab);
    b.onclick = () => { state.zoneTab = b.dataset.zonetab; updateZoneUI(); };
  });
  const mapView = el('zone-map-view');
  const raidsView = el('zone-raids-view');
  if (mapView) mapView.classList.toggle('active', state.zoneTab === 'map');
  if (raidsView) raidsView.classList.toggle('active', state.zoneTab === 'raids');

  if (state.zoneTab === 'map') renderZoneMap();
  else if (state.zoneTab === 'raids') updateRaidUI();
}

function renderZoneMap() {
  const list = el('zone-list'); if (!list) return;
  updateSagaProgress(true);
  const coords = ART.ZONE_COORDS, order = ART.ZONE_ORDER, unlocked = {};
  SAGAS.slice(0, (state.currentSaga || 0) + 1).forEach(s => s.zones.forEach(z => { unlocked[z] = true; }));
  let routes = '', nodes = '';
  for (let i = 1; i < order.length; i++) { 
    const prevId = order[i - 1], currId = order[i];
    const a = coords[prevId], b = coords[currId]; 
    if (!a || !b) continue; 
    const open = (unlocked[prevId] || ZONES[prevId]?.level <= state.level) && (unlocked[currId] || ZONES[currId]?.level <= state.level); 
    routes += `<line class="zm-route ${open ? 'open' : ''}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>`; 
  }
  for (const id of order) {
    const z = ZONES[id], c = coords[id]; if (!z || !c) continue; 
    const reachable = (unlocked[id] || z.level <= state.level) && z.level <= state.level;
    const cls = state.zone === id ? 'current' : (reachable ? 'open' : 'locked');
    nodes += `<g class="zm-node ${cls}" data-zone="${id}" transform="translate(${c.x},${c.y})"><title>${z.name} — Lv.${z.level}+${z.town ? ' (town)' : ''}</title><circle class="zm-ring" r="11"/><circle class="zm-dot" r="5"/>${z.town ? '<text class="zm-town" y="1">⌂</text>' : ''}${!reachable ? '<text class="zm-lock" y="3">🔒</text>' : ''}<text class="zm-label" y="23">${z.name}</text></g>`;
  }
  list.innerHTML = `<svg class="zone-map" viewBox="0 0 360 240" preserveAspectRatio="xMidYMid meet">${ART.mapBackdrop()}<g class="zm-routes">${routes}</g><g class="zm-nodes">${nodes}</g></svg>`;
  list.querySelectorAll('.zm-node').forEach(n => { 
    n.onclick = () => { 
      const id = n.dataset.zone, z = ZONES[id]; 
      if ((unlocked[id] || z.level <= state.level) && z.level <= state.level) selectZone(id); 
    }; 
  });
}

function updateRaidUI() {
  const list = el('raid-boss-list'); if (!list) return; list.innerHTML = '';
  for (const [id, boss] of Object.entries(RAID_BOSSES)) {
    const card = mkEl('div'); card.className = 'raid-card';
    const reqOk = state.level >= boss.reqLvl;
    card.innerHTML = `
      <div>
        <div class="raid-card-title">${boss.name}</div>
        <div class="raid-card-desc">${boss.desc} · Lv.${boss.lvl}</div>
      </div>
      <button class="raid-btn" data-raid="${id}" ${!reqOk ? 'disabled' : ''}>${reqOk ? 'Desafiar Raid ⚔️' : `Lv.${boss.reqLvl} Req`}</button>
    `;
    list.appendChild(card);
  }
  list.querySelectorAll('[data-raid]').forEach(btn => {
    btn.onclick = () => startRaidBoss(btn.dataset.raid);
  });
}

function startRaidBoss(raidId) {
  const bossTemplate = RAID_BOSSES[raidId]; if (!bossTemplate) return;
  if (state.level < bossTemplate.reqLvl) { log(`Level ${bossTemplate.reqLvl} required for this Raid!`, 'system'); return; }
  
  state.zone = null;
  state.target = raidId;
  MONSTERS[raidId] = bossTemplate;
  state.activeMonster = {
    ...bossTemplate,
    _maxHp: bossTemplate.hp,
    hp: bossTemplate.hp,
    _stunnedUntil: 0
  };
  
  const sz = el('stage-zone');
  if (sz) sz.textContent = `🐉 RAID · ${bossTemplate.name}`;
  stopCombat();
  state.combatActive = true;
  log(`⚔️ EPIC RAID: Challenge against ${bossTemplate.name} initiated!`, 'rarity-legendary');
  renderStageMonster();
  combatTick = 0;
  state._cds = {};
  if (combatInterval) clearInterval(combatInterval);
  combatInterval = setInterval(attackMonster, Math.round(200 / (state.combatSpeed || 1)));
}

function updateRaceClassUI() {
  qsa('.race-btn').forEach(btn => { const r = btn.dataset.race; btn.disabled = (r === 'ertheia' && state.level < 10); btn.classList.toggle('selected', r === state.race); });
  qsa('.class-btn').forEach(btn => { const c = btn.dataset.class; btn.disabled = (state.race === 'dwarf' || state.race === 'kamael'); btn.classList.toggle('selected', c === state.class); });
  const rd = qs('.race-desc'); if (rd) rd.textContent = state.race ? (RACES[state.race]?.desc || '') : 'Select a race.';
  const cd = qs('.class-desc'); if (cd) cd.textContent = state.class ? (getClass(state.class)?.desc || '') : 'Select a class.';
  renderStageHero(); updateSkillUI(); checkClassAdvancement();
}

function updateClock() { const now = Date.now(), elapsed = Math.floor((now - state.startTime + (state.totalPlaytime || 0)) / 1000), h = Math.floor(elapsed / 3600), m = Math.floor((elapsed % 3600) / 60), s = elapsed % 60; const _ck = el('clock'); if (_ck) _ck.textContent = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`; }

function updateGameModeUI() {
  const switchEl = el('game-mode-switch');
  const currentEl = el('game-mode-current');
  const gameEl = el('game');
  const currentMode = state.gameMode === 'arena' ? 'arena' : 'idle';
  if (currentEl) currentEl.textContent = currentMode === 'arena' ? 'Arena' : 'Idle';
  if (switchEl) switchEl.classList.toggle('arena', currentMode === 'arena');
  if (gameEl) {
    gameEl.classList.remove('mode-idle', 'mode-arena');
    gameEl.classList.add(`mode-${currentMode}`);
  }
  qsa('.mode-option').forEach(btn => {
    const active = btn.dataset.mode === currentMode;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
}

function setGameMode(mode) {
  const nextMode = mode === 'arena' ? 'arena' : 'idle';
  state.gameMode = nextMode;
  updateGameModeUI();
  log(`Game mode switched to ${nextMode === 'arena' ? 'Arena' : 'Idle'}.`, 'system');
  save();
}

function closeGameModeMenu() {
  const switchEl = el('game-mode-switch');
  if (switchEl) {
    switchEl.classList.remove('open');
    switchEl.setAttribute('aria-expanded', 'false');
  }
}

function toggleGameModeMenu() {
  const switchEl = el('game-mode-switch');
  if (!switchEl) return;
  const willOpen = !switchEl.classList.contains('open');
  switchEl.classList.toggle('open', willOpen);
  switchEl.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
}

// --------------------------- QUESTS & BATTLE PASS ---------------------------
const QUEST_DEFS = {
  daily: [
    { id: 'd_kills', name: 'Caçador de Monstros', desc: 'Derrote 50 monstros nas zonas de caça', target: 50, type: 'kill', reward: { gold: 5000, sp: 25, passXp: 100 }, icon: '⚔️' },
    { id: 'd_boss', name: 'Desafiador de Elites', desc: 'Derrote 1 Chefe ou Monstro de Elite', target: 1, type: 'boss', reward: { gold: 10000, sp: 50, passXp: 150 }, icon: '🐉' },
    { id: 'd_craft', name: 'Mestre da Forja', desc: 'Realize 1 criação no Craft ou roleta', target: 1, type: 'craft', reward: { gold: 3000, craftPoints: 15, passXp: 100 }, icon: '🔨' },
    { id: 'd_codex', name: 'Relíquia de Aden', desc: 'Obtenha 1 Doll ou registre item no Codex', target: 1, type: 'codex', reward: { gold: 5000, magicLamps: 1, passXp: 100 }, icon: '📜' }
  ],
  weekly: [
    { id: 'w_kills', name: 'Exterminador de Aden', desc: 'Derrote 400 monstros', target: 400, type: 'kill', reward: { gold: 40000, sp: 250, passXp: 500 }, icon: '☠️' },
    { id: 'w_bosses', name: 'Caçador de Lendas', desc: 'Derrote 8 Chefes de Raid ou Elites', target: 8, type: 'boss', reward: { gold: 75000, sp: 500, passXp: 600 }, icon: '👑' },
    { id: 'w_gold', name: 'Acumulador de Fortunas', desc: 'Ganhe 100.000 de Gold', target: 100000, type: 'gold', reward: { gold: 50000, magicLamps: 3, passXp: 500 }, icon: '💰' }
  ]
};

const BATTLE_PASS_TIERS = [
  { level: 1, reqXp: 100, free: { gold: 5000 }, premium: { magicLamps: 2 } },
  { level: 2, reqXp: 250, free: { sp: 50 }, premium: { gold: 20000 } },
  { level: 3, reqXp: 450, free: { craftPoints: 20 }, premium: { magicLamps: 3 } },
  { level: 4, reqXp: 700, free: { gold: 15000 }, premium: { sp: 150 } },
  { level: 5, reqXp: 1000, free: { magicLamps: 2 }, premium: { gold: 50000, title: 'Barão de Aden' } },
  { level: 6, reqXp: 1350, free: { sp: 100 }, premium: { magicLamps: 3 } },
  { level: 7, reqXp: 1750, free: { gold: 25000 }, premium: { craftPoints: 100 } },
  { level: 8, reqXp: 2200, free: { magicLamps: 3 }, premium: { gold: 100000 } },
  { level: 9, reqXp: 2700, free: { sp: 250 }, premium: { magicLamps: 5 } },
  { level: 10, reqXp: 3300, free: { gold: 50000, magicLamps: 5 }, premium: { title: 'Lorde de Aden', gold: 200000 } }
];

function checkQuestResets() {
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const ONE_WEEK = 7 * ONE_DAY;

  if (!state.quests) {
    state.quests = { progress: {}, claimed: [], lastDailyReset: now, lastWeeklyReset: now };
  }
  if (!state.quests.progress) state.quests.progress = {};
  if (!state.quests.claimed) state.quests.claimed = [];

  if (!state.quests.lastDailyReset || (now - state.quests.lastDailyReset) >= ONE_DAY) {
    state.quests.lastDailyReset = now;
    QUEST_DEFS.daily.forEach(q => {
      delete state.quests.progress[q.id];
      state.quests.claimed = state.quests.claimed.filter(id => id !== q.id);
    });
    log('📜 Missões Diárias foram renovadas!', 'rarity-legendary');
  }

  if (!state.quests.lastWeeklyReset || (now - state.quests.lastWeeklyReset) >= ONE_WEEK) {
    state.quests.lastWeeklyReset = now;
    QUEST_DEFS.weekly.forEach(q => {
      delete state.quests.progress[q.id];
      state.quests.claimed = state.quests.claimed.filter(id => id !== q.id);
    });
    log('📅 Missões Semanais foram renovadas!', 'rarity-legendary');
  }
}

const PASS_DEFS = BATTLE_PASS_TIERS;
function checkDailyReset() { checkQuestResets(); }
function checkQuestProgress(type, count = 1) { triggerQuestEvent(type, count); }

function triggerQuestEvent(type, amount = 1) {
  if (!state.quests) checkQuestResets();
  let updated = false;

  const allQuests = [...QUEST_DEFS.daily, ...QUEST_DEFS.weekly];
  for (const q of allQuests) {
    if (q.type === type) {
      if (state.quests.claimed && state.quests.claimed.includes(q.id)) continue;
      const current = state.quests.progress[q.id] || 0;
      if (current < q.target) {
        state.quests.progress[q.id] = Math.min(q.target, current + amount);
        updated = true;
        if (state.quests.progress[q.id] === q.target) {
          log(`🎯 Missão Concluída: **${q.name}**! Reclame sua recompensa.`, 'rarity-rare');
          floatText('MISSAO CONCLUIDA!', 'float-jackpot');
        }
      }
    }
  }
  if (updated) {
    safeUiUpdate('quests', updateQuestsUI);
  }
}

function claimQuestReward(questId) {
  if (!state.quests) return;
  const allQuests = [...QUEST_DEFS.daily, ...QUEST_DEFS.weekly];
  const q = allQuests.find(item => item.id === questId);
  if (!q) return;

  const progress = state.quests.progress[q.id] || 0;
  if (progress < q.target) {
    log('Esta missão ainda não foi concluída!', 'system');
    return;
  }

  if (state.quests.claimed.includes(q.id)) {
    log('Você já reclamou esta recompensa!', 'system');
    return;
  }

  state.quests.claimed.push(q.id);

  if (q.reward.gold) { state.gold += q.reward.gold; }
  if (q.reward.sp) { state.sp += q.reward.sp; }
  if (q.reward.craftPoints) { state.craftPoints = (state.craftPoints || 0) + q.reward.craftPoints; }
  if (q.reward.magicLamps) { state.magicLamps = (state.magicLamps || 0) + q.reward.magicLamps; }

  if (q.reward.passXp) {
    if (!state.battlePass) state.battlePass = { xp: 0, claimedFree: [], claimedPremium: [], unlockedPremium: false };
    state.battlePass.xp = (state.battlePass.xp || 0) + q.reward.passXp;
    log(`🎫 +${q.reward.passXp} XP do Passe de Batalha!`, 'rarity-legendary');
  }

  log(`🎁 Recompensa da missão **${q.name}** recebida!`, 'rarity-epic');
  floatText('RECOMPENSA!', 'float-gold');
  updateAllUI();
  save();
}

function claimPassReward(level, type = 'free') {
  if (!state.battlePass) state.battlePass = { xp: 0, claimedFree: [], claimedPremium: [], unlockedPremium: false };
  const tier = BATTLE_PASS_TIERS.find(t => t.level === level);
  if (!tier) return;

  if (state.battlePass.xp < tier.reqXp) {
    log('XP do Passe insuficiente para este nível!', 'system');
    return;
  }

  if (type === 'premium' && !state.battlePass.unlockedPremium) {
    log('Ative o Passe Premium para desbloquear estas recompensas!', 'system');
    return;
  }

  const claimedArr = type === 'free' ? state.battlePass.claimedFree : state.battlePass.claimedPremium;
  if (claimedArr.includes(level)) {
    log('Recompensa já coletada!', 'system');
    return;
  }

  claimedArr.push(level);

  const reward = type === 'free' ? tier.free : tier.premium;
  if (reward.gold) state.gold += reward.gold;
  if (reward.sp) state.sp += reward.sp;
  if (reward.craftPoints) state.craftPoints = (state.craftPoints || 0) + reward.craftPoints;
  if (reward.magicLamps) state.magicLamps = (state.magicLamps || 0) + reward.magicLamps;

  log(`🎁 Recompensa do Passe Nível ${level} recebida!`, 'rarity-legendary');
  floatText('PASSE RECOMPENSA!', 'float-jackpot');
  updateAllUI();
  save();
}

function unlockPremiumPass() {
  if (!state.battlePass) state.battlePass = { xp: 0, claimedFree: [], claimedPremium: [], unlockedPremium: false };
  if (state.battlePass.unlockedPremium) {
    log('Passe Premium já está ativo!', 'system');
    return;
  }
  const COST = 100000;
  if (state.gold < COST) {
    log(`O Passe Premium custa ${COST.toLocaleString()} Gold. Gold insuficiente!`, 'system');
    return;
  }
  state.gold -= COST;
  state.battlePass.unlockedPremium = true;
  log('✨ PASSE PREMIUM DE ADENA ATIVADO COM SUCESSO!', 'rarity-legendary');
  floatText('PREMIUM ATIVO!', 'float-jackpot');
  updateAllUI();
  save();
}

function updateQuestsUI() {
  checkQuestResets();

  const dailyContainer = el('daily-quests-list');
  const weeklyContainer = el('weekly-quests-list');
  const dailyBadge = el('daily-progress-badge');
  const weeklyBadge = el('weekly-progress-badge');

  if (dailyContainer) {
    let dailyClaimedCount = 0;
    dailyContainer.innerHTML = QUEST_DEFS.daily.map(q => {
      const progress = Math.min(q.target, state.quests.progress[q.id] || 0);
      const isCompleted = progress >= q.target;
      const isClaimed = state.quests.claimed.includes(q.id);
      if (isClaimed) dailyClaimedCount++;

      const pct = Math.floor((progress / q.target) * 100);
      const cardClass = isClaimed ? 'quest-card completed' : (isCompleted ? 'quest-card can-claim' : 'quest-card');

      const rewardsText = [];
      if (q.reward.gold) rewardsText.push(`💰 +${q.reward.gold.toLocaleString()}g`);
      if (q.reward.sp) rewardsText.push(`✦ +${q.reward.sp} SP`);
      if (q.reward.craftPoints) rewardsText.push(`⚒️ +${q.reward.craftPoints} Craft`);
      if (q.reward.magicLamps) rewardsText.push(`🪔 +${q.reward.magicLamps} Lâmpada`);
      if (q.reward.passXp) rewardsText.push(`🎫 +${q.reward.passXp} XP Passe`);

      const btnLabel = isClaimed ? '✓ Reclamado' : (isCompleted ? '🎁 Reclamar' : 'Em Progresso');
      const btnDisabled = !isCompleted || isClaimed ? 'disabled' : '';

      return `
        <div class="${cardClass}">
          <div class="quest-info-group">
            <span class="quest-icon">${q.icon}</span>
            <div class="quest-details">
              <span class="quest-name">${q.name}</span>
              <span class="quest-desc">${q.desc}</span>
              <div class="quest-rewards-line">${rewardsText.join(' · ')}</div>
            </div>
          </div>
          <div class="quest-action-group">
            <span class="quest-progress-num">${progress.toLocaleString()} / ${q.target.toLocaleString()} (${pct}%)</span>
            <button class="claim-quest-btn" data-quest="${q.id}" ${btnDisabled}>${btnLabel}</button>
          </div>
        </div>
      `;
    }).join('');

    if (dailyBadge) dailyBadge.textContent = `${dailyClaimedCount}/${QUEST_DEFS.daily.length} Concluídas`;

    dailyContainer.querySelectorAll('[data-quest]').forEach(btn => {
      btn.onclick = () => claimQuestReward(btn.dataset.quest);
    });
  }

  if (weeklyContainer) {
    let weeklyClaimedCount = 0;
    weeklyContainer.innerHTML = QUEST_DEFS.weekly.map(q => {
      const progress = Math.min(q.target, state.quests.progress[q.id] || 0);
      const isCompleted = progress >= q.target;
      const isClaimed = state.quests.claimed.includes(q.id);
      if (isClaimed) weeklyClaimedCount++;

      const pct = Math.floor((progress / q.target) * 100);
      const cardClass = isClaimed ? 'quest-card completed' : (isCompleted ? 'quest-card can-claim' : 'quest-card');

      const rewardsText = [];
      if (q.reward.gold) rewardsText.push(`💰 +${q.reward.gold.toLocaleString()}g`);
      if (q.reward.sp) rewardsText.push(`✦ +${q.reward.sp} SP`);
      if (q.reward.magicLamps) rewardsText.push(`🪔 +${q.reward.magicLamps} Lâmpadas`);
      if (q.reward.passXp) rewardsText.push(`🎫 +${q.reward.passXp} XP Passe`);

      const btnLabel = isClaimed ? '✓ Reclamado' : (isCompleted ? '🎁 Reclamar' : 'Em Progresso');
      const btnDisabled = !isCompleted || isClaimed ? 'disabled' : '';

      return `
        <div class="${cardClass}">
          <div class="quest-info-group">
            <span class="quest-icon">${q.icon}</span>
            <div class="quest-details">
              <span class="quest-name">${q.name}</span>
              <span class="quest-desc">${q.desc}</span>
              <div class="quest-rewards-line">${rewardsText.join(' · ')}</div>
            </div>
          </div>
          <div class="quest-action-group">
            <span class="quest-progress-num">${progress.toLocaleString()} / ${q.target.toLocaleString()} (${pct}%)</span>
            <button class="claim-quest-btn" data-quest="${q.id}" ${btnDisabled}>${btnLabel}</button>
          </div>
        </div>
      `;
    }).join('');

    if (weeklyBadge) weeklyBadge.textContent = `${weeklyClaimedCount}/${QUEST_DEFS.weekly.length} Concluídas`;

    weeklyContainer.querySelectorAll('[data-quest]').forEach(btn => {
      btn.onclick = () => claimQuestReward(btn.dataset.quest);
    });
  }

  renderBattlePassUI();
}

function renderBattlePassUI() {
  if (!state.battlePass) state.battlePass = { xp: 0, claimedFree: [], claimedPremium: [], unlockedPremium: false };

  const currentXp = state.battlePass.xp || 0;
  let currentLvl = 1;
  let currentTier = BATTLE_PASS_TIERS[0];
  for (let i = BATTLE_PASS_TIERS.length - 1; i >= 0; i--) {
    if (currentXp >= BATTLE_PASS_TIERS[i].reqXp) {
      currentLvl = BATTLE_PASS_TIERS[i].level;
      currentTier = BATTLE_PASS_TIERS[i];
      break;
    }
  }

  const nextTierIndex = BATTLE_PASS_TIERS.findIndex(t => t.level === currentLvl + 1);
  const nextReqXp = nextTierIndex !== -1 ? BATTLE_PASS_TIERS[nextTierIndex].reqXp : currentTier.reqXp;
  const prevReqXp = currentTier.reqXp;
  const pct = nextTierIndex !== -1 ? Math.min(100, Math.floor(((currentXp - prevReqXp) / Math.max(1, nextReqXp - prevReqXp)) * 100)) : 100;

  const lvlText = el('pass-level-text');
  if (lvlText) lvlText.textContent = `Nível ${currentLvl}`;

  const statusText = el('pass-status-text');
  if (statusText) statusText.textContent = state.battlePass.unlockedPremium ? '👑 Passe Premium Ativo' : 'Passe de Batalha Grátis';

  const xpText = el('pass-xp-text');
  if (xpText) xpText.textContent = `${currentXp.toLocaleString()} / ${nextReqXp.toLocaleString()} XP do Passe`;

  const xpBar = el('pass-xp-bar');
  if (xpBar) xpBar.style.width = `${pct}%`;

  const unlockBtn = el('unlock-premium-pass-btn');
  if (unlockBtn) {
    if (state.battlePass.unlockedPremium) {
      unlockBtn.textContent = '👑 Passe Premium Ativo';
      unlockBtn.disabled = true;
      unlockBtn.style.opacity = '0.7';
    } else {
      unlockBtn.textContent = '👑 Ativar Passe Premium (100.000g)';
      unlockBtn.disabled = false;
      unlockBtn.onclick = () => unlockPremiumPass();
    }
  }

  const trackList = el('pass-track-list');
  if (trackList) {
    trackList.innerHTML = BATTLE_PASS_TIERS.map(tier => {
      const isUnlocked = currentXp >= tier.reqXp;
      const freeClaimed = state.battlePass.claimedFree.includes(tier.level);
      const premClaimed = state.battlePass.claimedPremium.includes(tier.level);

      const freeLabel = freeClaimed ? '✓' : (isUnlocked ? 'Reclamar' : 'Tranca');
      const premLabel = premClaimed ? '✓' : (isUnlocked && state.battlePass.unlockedPremium ? 'Reclamar' : (state.battlePass.unlockedPremium ? 'Tranca' : '👑 Premium'));

      const freeRewardStr = Object.entries(tier.free).map(([k, v]) => `${k === 'gold' ? '💰 ' + v : k === 'sp' ? '✦ ' + v : v}`).join(', ');
      const premRewardStr = Object.entries(tier.premium).map(([k, v]) => `${k === 'gold' ? '💰 ' + v : k === 'title' ? '🏷️ ' + v : v}`).join(', ');

      return `
        <div class="pass-tier-card ${isUnlocked ? 'unlocked' : ''}">
          <span class="pass-tier-lvl">Nv. ${tier.level}</span>
          <div class="pass-reward-box">
            <span style="font-weight:bold;color:var(--gilt);">Grátis</span><br/>
            <span>${freeRewardStr}</span><br/>
            <button class="inv-batch-btn" data-pass-free="${tier.level}" ${!isUnlocked || freeClaimed ? 'disabled' : ''} style="margin-top:4px;font-size:9px;">${freeLabel}</button>
          </div>
          <div class="pass-reward-box premium">
            <span style="font-weight:bold;color:#fef08a;">👑 Premium</span><br/>
            <span>${premRewardStr}</span><br/>
            <button class="inv-batch-btn gold-glow-btn" data-pass-prem="${tier.level}" ${!isUnlocked || !state.battlePass.unlockedPremium || premClaimed ? 'disabled' : ''} style="margin-top:4px;font-size:9px;">${premLabel}</button>
          </div>
        </div>
      `;
    }).join('');

    trackList.querySelectorAll('[data-pass-free]').forEach(btn => {
      btn.onclick = () => claimPassReward(Number(btn.dataset.passFree), 'free');
    });
    trackList.querySelectorAll('[data-pass-prem]').forEach(btn => {
      btn.onclick = () => claimPassReward(Number(btn.dataset.passPrem), 'premium');
    });
  }
}

// --------------------------- TOWER OF INSOLENCE ---------------------------
function getTowerFloorDef(floorNum) {
  const f = Math.max(1, Math.min(100, Number(floorNum) || 1));
  const isBoss = f % 10 === 0;

  const names = {
    10: 'Hallate, o Guardião da Torre (Boss)',
    20: 'Kernea, a Imperatriz de Sangue (Boss)',
    30: 'Varan, o Arquiduque Sombrio (Boss)',
    40: 'Kavatan, o Guardião de Elmore (Boss)',
    50: 'Baium, o Imperador Imortal (Boss)',
    60: 'Galaxia, a Primordial (Boss)',
    70: 'Shielhead, o Titã de Aço (Boss)',
    80: 'Golkonda, o Destruidor de Reinos (Boss)',
    90: 'Verdelet, o Demônio Guardião (Boss)',
    100: 'Arcanjo da Insolência (Final Boss)'
  };

  const name = names[f] || (isBoss ? `Guardião do Andar ${f} (Boss)` : `Guerreiro de Insolência Nv.${f}`);
  const reqLvl = Math.min(100, Math.floor(f * 0.95) + 1);

  const baseHp = Math.floor(120 * Math.pow(1.12, f - 1) * (isBoss ? 2.5 : 1));
  const baseAtk = Math.floor(18 * Math.pow(1.09, f - 1) * (isBoss ? 1.4 : 1));
  const baseDef = Math.floor(10 * Math.pow(1.08, f - 1));

  const goldReward = Math.floor(300 * Math.pow(1.10, f - 1) * (isBoss ? 3 : 1));
  const spReward = Math.floor(12 * f * (isBoss ? 2 : 1));

  return {
    floor: f,
    name,
    isBoss,
    reqLvl,
    hp: baseHp,
    atk: baseAtk,
    def: baseDef,
    xp: Math.floor(120 * f * 1.5),
    sp: spReward,
    gold: goldReward,
    rewardLamps: isBoss ? Math.floor(f / 10) : 0,
    rewardCrystals: isBoss ? (f >= 50 ? 'crystal_s' : 'crystal_a') : null
  };
}

function challengeTowerFloor() {
  if (!state.tower) state.tower = { highestFloor: 0, currentFloor: 1, lastSweepTime: 0 };
  const targetFloor = (state.tower.highestFloor || 0) + 1;
  if (targetFloor > 100) {
    log('🏆 Você já conquistou todos os 100 Andares da Torre da Insolência!', 'rarity-legendary');
    return;
  }

  const fDef = getTowerFloorDef(targetFloor);

  if (state.level < fDef.reqLvl) {
    log(`⚠️ Nível insuficiente! O Andar ${targetFloor} requer Nível ${fDef.reqLvl}.`, 'system');
    return;
  }

  log(`🏰 Desafiando Andar ${targetFloor}: **${fDef.name}**!`, 'rarity-legendary');
  floatText(`ANDAR ${targetFloor}!`, 'float-jackpot');

  const towerMonsterId = `tower_floor_${targetFloor}`;
  const monsterObj = {
    id: towerMonsterId,
    name: fDef.name,
    hp: fDef.hp,
    _maxHp: fDef.hp,
    maxHp: fDef.hp,
    atk: fDef.atk,
    def: fDef.def,
    eva: Math.min(20, Math.floor(fDef.floor / 5)),
    xp: fDef.xp,
    sp: fDef.sp,
    gold: [fDef.gold, Math.floor(fDef.gold * 1.3)],
    boss: fDef.isBoss,
    isTower: true,
    towerFloor: targetFloor,
    _stunnedUntil: 0
  };

  MONSTERS[towerMonsterId] = monsterObj;
  state.target = towerMonsterId;
  state.activeMonster = monsterObj;
  if (!state.zone) state.zone = 'talkingIsland';

  const sz = el('stage-zone');
  if (sz) sz.textContent = `🏰 TORRE · Andar ${targetFloor}`;

  state.combatActive = true;
  renderStageMonster();
  combatTick = 0;
  state._cds = {};
  if (combatInterval) clearInterval(combatInterval);
  combatInterval = setInterval(attackMonster, Math.round(200 / (state.combatSpeed || 1)));
}

function onTowerFloorVictory(floorNum) {
  if (!state.tower) state.tower = { highestFloor: 0, currentFloor: 1, lastSweepTime: 0 };
  if (floorNum > state.tower.highestFloor) {
    state.tower.highestFloor = floorNum;
    state.tower.currentFloor = Math.min(100, floorNum + 1);

    const fDef = getTowerFloorDef(floorNum);
    log(`🏆 VITORIA! Andar ${floorNum} Conquistado! Bônus Permanente ATK/DEF +${floorNum}%!`, 'rarity-legendary');
    floatText(`ANDAR ${floorNum} CONQUISTADO!`, 'float-jackpot');

    if (fDef.rewardLamps > 0) {
      state.magicLamps = (state.magicLamps || 0) + fDef.rewardLamps;
      log(`🪔 Recompensa de Primeiro Abate: +${fDef.rewardLamps} Lâmpadas Mágicas!`, 'rarity-epic');
    }
    if (fDef.rewardCrystals) {
      addToInventory(fDef.rewardCrystals, 3);
      log(`✨ Recompensa de Primeiro Abate: +3x ${D().ALL_ITEMS[fDef.rewardCrystals]?.name || fDef.rewardCrystals}!`, 'rarity-legendary');
    }

    triggerQuestEvent('boss', 1);
  }
  updateAllUI();
  save();
}

function sweepTowerDaily() {
  if (!state.tower) state.tower = { highestFloor: 0, currentFloor: 1, lastSweepTime: 0 };
  const highest = state.tower.highestFloor || 0;
  if (highest < 1) {
    log('Conquiste ao menos 1 Andar da Torre para realizar a Varredura Diária!', 'system');
    return;
  }

  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  if (state.tower.lastSweepTime && (now - state.tower.lastSweepTime) < ONE_DAY) {
    log('A Varredura Diária já foi realizada hoje! Tente novamente amanhã.', 'system');
    return;
  }

  state.tower.lastSweepTime = now;

  let totalGold = 0;
  let totalSp = 0;
  for (let i = 1; i <= highest; i++) {
    const fDef = getTowerFloorDef(i);
    totalGold += Math.floor(fDef.gold * 0.5);
    totalSp += Math.floor(fDef.sp * 0.5);
  }

  state.gold += totalGold;
  state.sp += totalSp;

  log(`🧹 VARREDURA DA TORRE! Reclamou recompensas de ${highest} andares: +${totalGold.toLocaleString()} Gold, +${totalSp.toLocaleString()} SP!`, 'rarity-legendary');
  floatText(`+${totalGold.toLocaleString()}g VARREDURA!`, 'float-jackpot');

  updateAllUI();
  save();
}

function updateTowerUI() {
  if (!state.tower) state.tower = { highestFloor: 0, currentFloor: 1, lastSweepTime: 0 };
  const highest = state.tower.highestFloor || 0;
  const nextFloor = Math.min(100, highest + 1);

  const highestText = el('tower-highest-floor-text');
  if (highestText) highestText.textContent = `Andar Atual: ${highest} / 100`;

  const bonusText = el('tower-bonus-text');
  if (bonusText) bonusText.textContent = `Bônus Passivo Ativo: +${highest}% ATK, DEF & MATK`;

  const nextNumText = el('tower-next-floor-num');
  if (nextNumText) nextNumText.textContent = `${nextFloor}`;

  const challengeBtn = el('tower-challenge-btn');
  if (challengeBtn) {
    if (highest >= 100) {
      challengeBtn.textContent = '🏆 Torre 100% Concluída';
      challengeBtn.disabled = true;
    } else {
      challengeBtn.textContent = `⚔️ Desafiar Andar ${nextFloor}`;
      challengeBtn.disabled = false;
      challengeBtn.onclick = () => challengeTowerFloor();
    }
  }

  const sweepBtn = el('tower-sweep-btn');
  if (sweepBtn) {
    const now = Date.now();
    const isSweepAvailable = highest >= 1 && (!state.tower.lastSweepTime || (now - state.tower.lastSweepTime) >= (24 * 60 * 60 * 1000));
    sweepBtn.disabled = !isSweepAvailable;
    sweepBtn.onclick = () => sweepTowerDaily();
  }

  const nextDef = getTowerFloorDef(nextFloor);
  const recommendEl = el('tower-floor-recommend');
  if (recommendEl) recommendEl.textContent = `Lv. Requerido: ${nextDef.reqLvl}`;

  const detailsCard = el('tower-floor-details-card');
  if (detailsCard) {
    const rewardsStr = [];
    rewardsStr.push(`💰 +${nextDef.gold.toLocaleString()}g`);
    rewardsStr.push(`✦ +${nextDef.sp} SP`);
    if (nextDef.rewardLamps > 0) rewardsStr.push(`🪔 +${nextDef.rewardLamps} Lâmpadas`);
    if (nextDef.rewardCrystals) rewardsStr.push(`✨ +3x ${D().ALL_ITEMS[nextDef.rewardCrystals]?.name || nextDef.rewardCrystals}`);

    detailsCard.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-weight:bold; font-size:13px; color:var(--gilt-bright);">${nextDef.name}</span>
        <span style="font-size:11px; color:#fb7185;">HP: ${nextDef.hp.toLocaleString()} · ATK: ${nextDef.atk.toLocaleString()}</span>
      </div>
      <div style="font-size:11px; color:var(--text-muted); margin-top:4px;">Recompensas de Primeiro Abate: ${rewardsStr.join(' · ')}</div>
    `;
  }

  const grid = el('tower-floors-grid');
  if (grid) {
    let html = '';
    for (let f = 1; f <= 100; f++) {
      const isCleared = f <= highest;
      const isCurrent = f === nextFloor;
      const isBoss = f % 10 === 0;

      let cls = 'tower-floor-pill';
      if (isCleared) cls += ' cleared';
      else if (isCurrent) cls += ' current';
      if (isBoss) cls += ' boss-floor';

      html += `<div class="${cls}"><span>${isBoss ? '👑' : '🏰'} Andar ${f}</span><span style="font-size:9px;opacity:0.8;">${isCleared ? '✓ Cleared' : (isCurrent ? '★ Desafio' : `Nv.${getTowerFloorDef(f).reqLvl}`)}</span></div>`;
    }
    grid.innerHTML = html;
  }
}

function updateAllUI() {
  updateGameModeUI();
  safeUiUpdate('zone-bg', updateZoneBackground);
  safeUiUpdate('stats', updateStatsUI);
  safeUiUpdate('equipment', updateEquipmentUI);
  safeUiUpdate('skills', updateSkillUI);
  safeUiUpdate('inventory', updateInventoryUI);
  safeUiUpdate('shop', updateShopUI);
  safeUiUpdate('craft', updateCraftUI);
  safeUiUpdate('zone', updateZoneUI);
  safeUiUpdate('race-class', updateRaceClassUI);
  safeUiUpdate('combat-controls', updateCombatControlsUI);
  safeUiUpdate('subclasses', renderSubclassesUI);
  safeUiUpdate('quests', updateQuestsUI);
  safeUiUpdate('tower', updateTowerUI);
}

function renderSubclassesUI() {
  const container = el('subclass-list-container'); if (!container) return;
  const summaryEl = el('certifications-summary');
  const countBadge = el('subclass-count-badge');
  const addBtn = el('add-subclass-btn');

  const activeMainLevel = state.activeSubclassIndex === null ? state.level : (state.mainClassData?.level || 1);
  if (countBadge) {
    countBadge.textContent = `Subclasses (${(state.subclasses || []).length}/3)`;
  }

  if (addBtn) {
    const isMain75 = activeMainLevel >= 75;
    const isMax = (state.subclasses || []).length >= 3;
    addBtn.disabled = !isMain75 || isMax;
    addBtn.textContent = isMax ? '🔒 Limite Máximo Atingido (3/3 Subclasses)' : (!isMain75 ? '🔒 Nível 75 Requerido na Classe Principal' : '➕ Adicionar Nova Subclasse');
    addBtn.onclick = openAddSubclassModal;
  }

  container.innerHTML = '';

  // Main Class Card
  const mainClassId = state.activeSubclassIndex === null ? state.class : (state.mainClassData?.class || 'fighter');
  const isMainActive = state.activeSubclassIndex === null;

  const mainCard = mkEl('div');
  mainCard.style.cssText = `border: 1px solid ${isMainActive ? 'var(--gilt-bright)' : 'var(--line)'}; padding: 10px; border-radius: 8px; background: ${isMainActive ? 'rgba(138,106,36,0.3)' : 'rgba(15,20,30,0.8)'}; display:flex; justify-content:space-between; align-items:center;`;
  mainCard.innerHTML = `
    <div>
      <div style="font-weight:bold; color:${isMainActive ? 'var(--gilt-bright)' : 'var(--bone)'}; font-size:12px;">
        👑 Classe Principal: ${getClass(mainClassId)?.name || mainClassId} <span style="color:#60a5fa;">Lv.${activeMainLevel}</span>
      </div>
      <div style="font-size:10px; color:var(--text-muted);">Sua ordem de origem primária</div>
    </div>
    <button class="action-btn" style="padding:4px 10px; font-size:11px;" ${isMainActive ? 'disabled' : ''} onclick="switchSubclass(null)">
      ${isMainActive ? '✓ Ativa' : 'Alternar 👑'}
    </button>
  `;
  container.appendChild(mainCard);

  // Subclasses Cards
  (state.subclasses || []).forEach((sub, idx) => {
    const isSubActive = state.activeSubclassIndex === idx;
    const subClassDef = getClass(sub.classId);
    
    const cert65 = sub.level >= 65;
    const cert70 = sub.level >= 70;
    const cert75 = sub.level >= 75;

    const card = mkEl('div');
    card.style.cssText = `border: 1px solid ${isSubActive ? 'var(--gilt-bright)' : 'var(--line)'}; padding: 10px; border-radius: 8px; background: ${isSubActive ? 'rgba(138,106,36,0.3)' : 'rgba(15,20,30,0.8)'}; display:flex; flex-direction:column; gap:6px;`;
    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-weight:bold; color:${isSubActive ? 'var(--gilt-bright)' : '#10b981'}; font-size:12px;">
            ⚔️ Subclasse ${idx + 1}: ${subClassDef?.name || sub.classId} <span style="color:#60a5fa;">Lv.${sub.level}</span>
          </div>
          <div style="font-size:10px; color:var(--text-muted);">Progresso independente &amp; Certificações</div>
        </div>
        <button class="action-btn" style="padding:4px 10px; font-size:11px;" ${isSubActive ? 'disabled' : ''} onclick="switchSubclass(${idx})">
          ${isSubActive ? '✓ Ativa' : 'Alternar ⚔️'}
        </button>
      </div>
      <div style="display:flex; gap:6px; font-size:10px;">
        <button class="action-btn" style="padding:2px 6px; font-size:9.5px;" ${!cert65 ? 'disabled' : ''} onclick="claimCert('${sub.id}', 'emergent', ${idx})">${cert65 ? (state.certifications[sub.id + '_emergent'] ? '✓ Cert. Lv 65' : 'Obter Cert. Lv 65 📜') : '🔒 Lv 65 Req'}</button>
        <button class="action-btn" style="padding:2px 6px; font-size:9.5px;" ${!cert70 ? 'disabled' : ''} onclick="claimCert('${sub.id}', 'master', ${idx})">${cert70 ? (state.certifications[sub.id + '_master'] ? '✓ Cert. Lv 70' : 'Obter Cert. Lv 70 📜') : '🔒 Lv 70 Req'}</button>
        <button class="action-btn" style="padding:2px 6px; font-size:9.5px;" ${!cert75 ? 'disabled' : ''} onclick="claimCert('${sub.id}', 'celestial', ${idx})">${cert75 ? (state.certifications[sub.id + '_celestial'] ? '✓ Cert. Lv 75' : 'Obter Cert. Lv 75 🛡️') : '🔒 Lv 75 Req'}</button>
      </div>
    `;
    container.appendChild(card);
  });

  if (summaryEl) {
    const certB = getCertificationsBonuses();
    summaryEl.innerHTML = `Bônus Acumulados: <strong style="color:var(--gilt-bright);">+${certB.atk} P.Atk, +${certB.def} P.Def, +${certB.matk} M.Atk, +${certB.mdef} M.Def, +${certB.crit}% Crit Rate</strong> ${certB.celestial ? '· 🛡️ <span style="color:#60a5fa;">Escudo Celestial Ativo!</span>' : ''}`;
  }
}

function openAddSubclassModal() {
  const currentClass = state.class;
  const availableClasses = Object.keys(CLASSES).filter(cId => cId !== currentClass && !(state.subclasses || []).some(s => s.classId === cId));
  
  if (availableClasses.length === 0) return;
  const choice = prompt(`Escolha sua Subclasse:\n\nOpções disponíveis:\n${availableClasses.map((c, i) => `${i + 1}. ${CLASSES[c].name}`).join('\n')}\n\nDigite o número da classe desejada:`);
  
  if (!choice) return;
  const selectedIdx = parseInt(choice, 10) - 1;
  if (isNaN(selectedIdx) || selectedIdx < 0 || selectedIdx >= availableClasses.length) {
    log('Opção de subclasse inválida.', 'system');
    return;
  }
  
  const chosenClassId = availableClasses[selectedIdx];
  state.subclasses = state.subclasses || [];
  state.subclasses.push({
    id: 'sub_' + Date.now(),
    classId: chosenClassId,
    level: 40,
    xp: 0,
    sp: 50,
    skills: {}
  });

  log(`🌟 Parabéns! Você aprendeu a Subclasse **${CLASSES[chosenClassId].name}** (Nível 40)!`, 'rarity-legendary');
  floatText(`🌟 SUBCLASSE APRENDIDA!`, 'float-jackpot');
  updateAllUI(); save();
}

function switchSubclass(targetIndex) {
  if (state.activeSubclassIndex === targetIndex) return;

  if (state.activeSubclassIndex === null) {
    state.mainClassData = {
      level: state.level,
      xp: state.xp,
      sp: state.sp,
      class: state.class,
      skills: { ...state.skills }
    };
  } else {
    const activeSub = state.subclasses[state.activeSubclassIndex];
    if (activeSub) {
      activeSub.level = state.level;
      activeSub.xp = state.xp;
      activeSub.sp = state.sp;
      activeSub.skills = { ...state.skills };
    }
  }

  if (targetIndex === null) {
    state.activeSubclassIndex = null;
    const main = state.mainClassData || { level: 75, xp: 0, sp: 50, class: 'fighter', skills: {} };
    state.level = main.level;
    state.xp = main.xp;
    state.sp = main.sp;
    state.class = main.class;
    state.skills = { ...(main.skills || {}) };
    log(`👑 Alternado para a Classe Principal (**${getClass(state.class).name}**)!`, 'system');
  } else {
    const targetSub = state.subclasses[targetIndex];
    if (targetSub) {
      state.activeSubclassIndex = targetIndex;
      state.level = targetSub.level;
      state.xp = targetSub.xp;
      state.sp = targetSub.sp;
      state.class = targetSub.classId;
      state.skills = { ...(targetSub.skills || {}) };
      log(`⚔️ Alternado para a Subclasse **${getClass(state.class).name}** (Lv.${state.level})!`, 'rarity-rare');
    }
  }

  const race = state.race ? RACES[state.race] : RACES.human;
  const cls = getClass(state.class);
  state.base = { atk: 0, def: 0, eva: 0, matk: 0, mdef: 0 };
  for (const k of ['atk','def','eva','matk','mdef']) {
    state.base[k] = (race?.stats[k] || 0) + (cls?.base[k] || 0);
  }

  updateAllUI(); save();
}

function claimCert(subId, certType, subIndex) {
  state.certifications = state.certifications || {};
  const certKey = subId + '_' + certType;
  if (state.certifications[certKey]) {
    log('Você já adquiriu esta Certificação de Subclasse.', 'system');
    return;
  }
  state.certifications[certKey] = true;
  if (certType === 'emergent') {
    state.certifications['emergent_atk'] = (state.certifications['emergent_atk'] || 0) + 1;
    state.certifications['emergent_def'] = (state.certifications['emergent_def'] || 0) + 1;
    log('📜 Certificação Nível 65 Adquirida! (+20 P.Atk, +20 P.Def permanente)', 'rarity-legendary');
  } else if (certType === 'master') {
    state.certifications['master_crit'] = (state.certifications['master_crit'] || 0) + 1;
    state.certifications['master_matk'] = (state.certifications['master_matk'] || 0) + 1;
    log('📜 Certificação Nível 70 Adquirida! (+5% Crit Rate, +25 M.Atk permanente)', 'rarity-legendary');
  } else if (certType === 'celestial') {
    state.certifications['celestial_shield'] = (state.certifications['celestial_shield'] || 0) + 1;
    log('🛡️ Certificação Nível 75 Adquirida! (Escudo Celestial ativado permanente!)', 'rarity-legendary');
  }
  floatText('✨ CERTIFICAÇÃO ADQUIRIDA!', 'float-jackpot');
  updateAllUI(); save();
}

// --------------------------- VISUALS / STAGE ---------------------------
const ZONE_BACKGROUNDS = {
  orcVillage: '/img/orcVillage.png',
  dwarvenMine: '/img/dwarvenMine.png',
  kamaelLair: '/img/kamaelLair.png',

  // Zone Mappings
  talkingIsland: '/img/talkingIsland.png',
  elvenForest: '/img/elvenForest.png',
  darkForest: '/img/darkForest.png',
  ruinedOutpost: '/img/ruinedOutpost.png',
  howlingMoor: '/img/howlingMoor.png',
  giranOutskirts: '/img/giranOutskirts.png',
  orcenRuins: '/img/orcenRuins.png',
  forsakenCrypt: '/img/forsakenCrypt.png',
  blackCitadel: '/img/blackCitadel.png',
  gludioCastle: '/img/gludioCastle.png',
  wolfMountain: '/img/wolfMountain.png',
  riftOfTheVoid: '/img/riftOfTheVoid.png',
  emeraldGrove: '/img/emeraldGrove.png',
  underworldGate: '/img/underworldGate.png',
  adenCity: '/img/adenCity.png',
  dragonValley: '/img/dragonValley.png',

  // Raid Bosses
  queen_ant: '/img/queen_ant.png',
  zaken: '/img/zaken.png',
  frintezza: '/img/frintezza.png',
  baium: '/img/baium.png',
  antharas: '/img/antharas.png',
  valakas: '/img/valakas.png'
};

function updateZoneBackground() {
  const currentKey = state.target && RAID_BOSSES[state.target] ? state.target : (state.zone || 'orcVillage');
  const bgPath = ZONE_BACKGROUNDS[currentKey] || '/img/' + currentKey + '.png';

  const stageEl = el('stage');
  const logEl = el('log');
  const stageZone = el('stage-zone');

  if (stageEl) {
    stageEl.style.backgroundImage = `linear-gradient(180deg, rgba(8,10,16,0.15) 0%, rgba(8,10,16,0.60) 100%), url('${bgPath}')`;
  }

  if (logEl) {
    logEl.style.backgroundImage = `linear-gradient(180deg, rgba(10,13,20,0.85), rgba(10,13,20,0.95)), url('${bgPath}')`;
  }

  if (stageZone) {
    let name = '';
    if (state.target && RAID_BOSSES[state.target]) {
      name = RAID_BOSSES[state.target].name;
    } else if (state.zone && ZONES[state.zone]) {
      name = ZONES[state.zone].name;
    }
    if (name) stageZone.textContent = name.toUpperCase();
  }
}

function topEquipRarityColor() { const rank = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 }; let best = -1, col = ''; for (const s of Object.keys(state.equipment)) { const uid = state.equipment[s]; if (!uid) continue; const it = state.inventory.find(i => i.uid === uid); if (!it || !it.rarity) continue; const r = rank[it.rarity] ?? -1; if (r > best) { best = r; col = D().RARITY[it.rarity].color; } } return col; }
function renderStageHero() {
  const hero = el('stage-hero'), pArt = el('portrait-art'), dArt = el('doll-art');
  if (!state.race || !state.class) { if (hero) hero.innerHTML = ''; if (pArt) pArt.innerHTML = ''; if (dArt) dArt.innerHTML = ''; return; }
  const aura = topEquipRarityColor();
  if (hero) {
    hero.innerHTML = ART.heroSVG(state.race, state.class, aura);
    hero.setAttribute('data-label', (getClass(state.class)?.name || state.class).toUpperCase());
  }
  if (dArt) dArt.innerHTML = ART.heroSVG(state.race, state.class, aura);
  if (pArt) pArt.innerHTML = ART.heroSVG(state.race, state.class, aura, 'bust');
  const pn = el('portrait-name'), ps = el('portrait-sub'), pau = el('portrait-aura');
  if (pn) pn.textContent = ((RACES[state.race]?.name || '') + ' ' + (getClass(state.class)?.name || '')).trim();
  if (ps) ps.textContent = state.zone ? ('Hunting · ' + ZONES[state.zone].name) : 'Awaiting the road';
  if (pau) pau.style.setProperty('--aura', aura ? aura + '55' : 'rgba(212,167,68,0.0)');
  updateZoneBackground();
}
function updateMonsterHP() { const fill = el('m-hp-fill'), mon = state.activeMonster; if (!fill) return; if (!mon || !mon._maxHp) { fill.style.width = '100%'; return; } fill.style.width = Math.max(0, (mon.hp / mon._maxHp) * 100) + '%'; }
function renderStageMonster() {
  const art = el('m-art'), nm = el('m-name'), box = el('stage-monster'), mon = state.activeMonster;
  if (box) box.classList.remove('hurt', 'lunge');
  if (!mon) { if (art) art.innerHTML = ''; if (nm) nm.textContent = ''; return; }
  if (box) box.setAttribute('data-label', (mon.name || '').toUpperCase());
  if (art) { 
    const artKey = (mon.isTower) ? (mon.boss ? 'dragon' : 'knight') : state.target;
    art.innerHTML = ART.monsterSVG(artKey, { crown: !!mon.boss }); 
    art.classList.remove('swap'); void art.offsetWidth; art.classList.add('swap'); 
  }
  if (nm) nm.textContent = mon.name + (mon.boss ? ' ★' : ''); updateMonsterHP();
  updateZoneBackground();
}
function reflow(n) { void n.offsetWidth; }
function stageHeroAttack() { const st = el('stage'); if (!st) return; st.classList.remove('is-hero-atk'); reflow(st); st.classList.add('is-hero-atk'); }
function stageMonsterHurt(dmg, crit) { updateMonsterHP(); const m = el('stage-monster'); if (m) { m.classList.remove('hurt'); reflow(m); m.classList.add('hurt'); setTimeout(() => m.classList.remove('hurt'), 420); } stageFloat((crit ? 'CRIT ' : '') + Math.round(dmg), crit ? 'sf-crit' : 'sf-dmg', 'right'); }
function stageMonsterDie() { const fill = el('m-hp-fill'); if (fill) fill.style.width = '0%'; const st = el('stage'); if (st) { st.classList.remove('kill-flash'); reflow(st); st.classList.add('kill-flash'); } stageFloat('SLAIN', 'sf-slain', 'right'); }
function stageMonsterLunge() { const m = el('stage-monster'); if (!m) return; m.classList.remove('lunge'); reflow(m); m.classList.add('lunge'); setTimeout(() => m.classList.remove('lunge'), 440); }
function stageHeroHurt(dmg) { const h = el('stage-hero'); if (h) { h.classList.remove('hurt'); reflow(h); h.classList.add('hurt'); setTimeout(() => h.classList.remove('hurt'), 420); } stageFloat('-' + Math.round(dmg), 'sf-hurt', 'left'); }
function stageHeroBlock() { stageFloat('BLOCK', 'sf-block', 'left'); }
function stageFloat(text, cls, side) { const c = el('stage-floats'); if (!c) return; const s = mkEl('span'); s.className = 'sf ' + cls; s.textContent = text; s.style.left = (side === 'left' ? (16 + Math.random() * 8) : (68 + Math.random() * 12)) + '%'; c.appendChild(s); setTimeout(() => s.remove(), 1100); }

// --------------------------- COMBAT ---------------------------
let combatInterval = null; let combatTick = 0;

function dealDamage(target, amount, type = 'physical') { 
  const rawAmount = Number(amount) || 0;
  const def = type === 'physical' ? (Number(target.def) || 0) : (Number(target.mdef) || 0); 
  return Math.max(1, Math.floor(rawAmount * (1 - def / (def + 50)))); 
}

const goldEvents = []; 
function trackGold(amount) { goldEvents.push({ t: Date.now(), v: amount }); }
function getGoldPerSec() { const now = Date.now(); while (goldEvents.length && now - goldEvents[0].t > 30000) goldEvents.shift(); if (!goldEvents.length) return 0; return goldEvents.reduce((s, e) => s + e.v, 0) / 30; }
function floatText(text, cls = 'float-gold') { const layer = el('float-layer'); if (!layer) return; const span = mkEl('span'); span.className = 'float-text ' + cls; span.textContent = text; const rect = layer.getBoundingClientRect(); span.style.left = (rect.width * (0.35 + Math.random() * 0.3)) + 'px'; span.style.top = (rect.height * 0.55 + (Math.random() * 60 - 30)) + 'px'; layer.appendChild(span); setTimeout(() => span.remove(), 1400); }

function attackMonster() {
  if (!state.zone || !state.target) return;
  const stats = getStats(), monster = state.activeMonster || MONSTERS[state.target]; if (!monster) return;
  combatTick++;

  if (stats.regenHp > 0) {
    state._regenAcc = (state._regenAcc || 0) + 0.2; 
    if (state._regenAcc >= 10) { state._regenAcc = 0; const heal = Math.max(1, Math.floor(state.maxHp * stats.regenHp)); if (state.hp < state.maxHp) { state.hp = Math.min(state.maxHp, state.hp + heal); log(`Holy Light: +${heal} HP`, 'heal'); } }
  }
  if (stats.mpRegen > 0) {
    state._mpRegenAcc = (state._mpRegenAcc || 0) + 0.2;
    if (state._mpRegenAcc >= 5) { state._mpRegenAcc = 0; if (state.mp < state.maxMp) { state.mp = Math.min(state.maxMp, state.mp + stats.mpRegen); } }
  }
  if (stats.autoPotion && state.hp < state.maxHp * 0.3) {
    const potIds = ['hp_potion_xl','hp_potion_l','hp_potion_m','hp_potion_s'];
    for (const pid of potIds) { const it = state.inventory.find(i => i.itemId === pid && (i.count || 1) > 0); if (it) { useItem(it.uid); break; } }
  }

  const isMage = state.class === 'mage' || state.class === 'soulbreaker';
  
  if (state.autoPotionActive && state.hp < state.maxHp * 0.5) {
    const pots = ['hp_potion_xl','hp_potion_l','hp_potion_m','hp_potion_s'];
    for (const pId of pots) {
      const item = state.inventory.find(i => i.itemId === pId && (i.count || 1) > 0);
      if (item) {
        useItem(item.uid);
        break;
      }
    }
  }
  
  if (!state._cds) state._cds = {};
  const now = combatTick * 200; 
  
  const activeSkills = [];
  for(const [sId, lvl] of Object.entries(state.skills)) {
    const def = SKILL_DEFS[sId];
    if(lvl > 0 && def && def.type === 'proc' && classSatisfies(state.class, def.classReq)) {
      activeSkills.push({ id: sId, lvl, def });
    }
  }

  activeSkills.sort((a, b) => b.def.tier - a.def.tier);

  let castedSkillThisTick = false;
  for(const skill of activeSkills) {
    const cd = skill.def.baseCd * (1 - stats.cdr); 
    if ((now - (state._cds[skill.id] || -99999)) >= cd) {
      state._cds[skill.id] = now;
      
      if (skill.def.effect === 'warcry') {
        state.buffs = state.buffs || {};
        state.buffs['warcry'] = { amount: 0.2, until: Date.now() + 60000 };
        log(`🗣 War Cry! ATK +20% for 60s`, 'rarity-rare');
      } else if (skill.def.effect === 'heal') {
        const healAmt = Math.floor(stats.maxHp * (0.35 + skill.lvl * 0.05));
        state.hp = Math.min(stats.maxHp, state.hp + healAmt);
        log(`✨ ${skill.def.name}! Curou ${healAmt} HP`, 'heal');
        floatText(`+${healAmt} HP`, 'sf-heal');
      } else {
        const type = isMage ? 'magic' : 'physical';
        const baseSkillDmg = isMage ? stats.matk : stats.atk;
        const skillPwr = Number(skill.def.pwr) || 0;
        const sDmg = dealDamage(monster, baseSkillDmg * (skillPwr / 10), type);
        
        monster.hp -= sDmg;
        stageHeroAttack();
        stageMonsterHurt(sDmg, false);
        
        log(`💥 ${skill.def.name}! ${sDmg} ${type} damage`, 'rarity-epic');
        floatText(skill.def.name, 'float-epic');
        
        if (skill.def.effect === 'vampiric') {
          const heal = Math.floor(sDmg * 0.4);
          state.hp = Math.min(state.maxHp, state.hp + heal);
          log(`🦇 Absorbed ${heal} HP`, 'heal');
        }
        if (skill.def.effect === 'stun') {
           monster._stunnedUntil = now + 3500;
           log(`💫 ${monster.name} foi Atordoado!`, 'rarity-rare');
        }
      }
      
      castedSkillThisTick = true;
      break; 
    }
  }

  const atkInterval = Math.max(200, 1000 - stats.atkSpd * 600);
  if (combatTick % Math.max(1, Math.round(atkInterval / 200)) !== 0) return;
  if (!castedSkillThisTick) stageHeroAttack();

  const useMagic = stats.matk > stats.atk;
  const atkVal = useMagic ? stats.matk : stats.atk;
  const atkType = useMagic ? 'magic' : 'physical';
  
  let damage = dealDamage(monster, atkVal, atkType);
  let wasCrit = false;
  
  if (state.soulshotActive) {
    const isMageClass = state.class === 'mage' || state.class === 'soulbreaker' || (getClass(state.class)?.archetype === 'mage');
    const shotId = isMageClass ? 'spiritshot_ng' : 'soulshot_ng';
    const shotItem = state.inventory.find(i => (i.itemId === shotId || i.itemId.startsWith('soulshot') || i.itemId.startsWith('spiritshot')) && (i.count || 1) > 0);
    if (shotItem) {
      if ((shotItem.count || 1) > 1) shotItem.count--;
      else removeFromInventory(shotItem.uid, 1);
      damage = Math.floor(damage * 2);
      stageFloat('⚡ SHOT', 'sf-crit', 'left');
      updateCombatControlsUI();
    }
  }

  if (Math.random() < stats.crit / 100) { 
    damage = Math.floor(damage * 1.5 * stats.critDmg); 
    wasCrit = true; 
    log(`CRIT! ${damage} damage to ${monster.name}`, 'combat'); 
  } else { 
    log(`${damage} basic damage to ${monster.name}`, 'damage'); 
  }
  
  if (stats.lifeDrain > 0) { const heal = Math.floor(damage * stats.lifeDrain); if (heal > 0) { state.hp = Math.min(state.maxHp, state.hp + heal); } }
  
  monster.hp -= damage;
  if (monster.hp <= 0 && !castedSkillThisTick) stageMonsterDie(); else if (!castedSkillThisTick) stageMonsterHurt(damage, wasCrit);
  
  if (monster.hp <= 0) {
    const zoneMult = D().ZONE_GOLD_MULT[state.zone] || 1, xpMult = 1 + (stats.xpBoost || 0);
    const xpGain = Math.floor(monster.xp * xpMult), spGain = monster.sp + (monster.boss ? 2 : 0);
    state.xp += xpGain; state.sp += spGain;
    log(`Defeated ${monster.name}! +${xpGain} XP, +${spGain} SP`, 'xp');

    const baseGold = monster.gold[0] + Math.random() * (monster.gold[1] - monster.gold[0]), jackpot = Math.random() < (monster.boss ? 0.08 : 0.015);
    const goldMult = zoneMult * (1 + (stats.goldBoost || 0)) * (jackpot ? 10 : 1);
    let gold = Math.floor(baseGold * stats.loot * goldMult); if (gold < 1) gold = 1;
    state.gold += gold; trackGold(gold);
    if (jackpot) { log(`💰 JACKPOT! +${gold} Gold (×10)`, 'rarity-legendary'); floatText(`💰 +${gold}g`, 'float-jackpot'); } else { log(`+${gold} Gold`, 'loot'); if (gold >= 20) floatText(`+${gold}g`, 'float-gold'); }

    const drops = D().rollDrop(state.target, stats.loot);
    for (const drop of drops) {
      if (drop.isEquipment) { addToInventory(drop.id, 1, drop.rarity); log(`✦ ${D().ALL_ITEMS[drop.id].name} [${D().RARITY[drop.rarity].name}]`, 'rarity-' + drop.rarity); floatText(`✦ ${D().RARITY[drop.rarity].name}!`, 'float-' + drop.rarity); } 
      else { addToInventory(drop.id, drop.amount); log(`+ ${drop.amount}× ${D().ALL_ITEMS[drop.id].name}`, 'loot'); }
    }
    triggerQuestEvent('kill', 1);
    if (monster.boss || monster.elite) triggerQuestEvent('boss', 1);
    triggerQuestEvent('gold', gold);

    if (monster.isTower) {
      onTowerFloorVictory(monster.towerFloor);
    }

    checkLevelUp(); pickRandomMonster();
  } else { setTimeout(() => monsterAttack(monster), 500); }
  updateStatsUI();
}

function monsterAttack(monster) {
  if (!state.combatActive || !state.target || state.hp <= 0) return;
  const now = combatTick * 200;
  if (monster._stunnedUntil && monster._stunnedUntil > now) return; 
  
  const stats = getStats(); stageMonsterLunge();
  if (Math.random() < stats.eva / 100) { log(`${monster.name} missed!`, 'combat'); stageFloat('DODGE', 'sf-miss', 'left'); return; }
  
  let damage = dealDamage({ atk: 0, def: 0 }, monster.atk);
  if (state.godMode) damage = 0;
  if (damage > 0) { state.hp -= damage; log(`${monster.name} hits for ${damage}`, 'damage'); stageHeroHurt(damage); }
  if (state.hp <= 0) { state.hp = 0; playerDeath(monster); }
  updateStatsUI();
}

// --------------------------- GM ADMIN & CHAT CONSOLE ---------------------------
function generateUid() { return 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9); }

function spawnAdminItem(itemId, qty = 1, rarity = 'common', enchant = 0) {
  const def = D().ALL_ITEMS[itemId];
  if (!def) { log(`[Admin] Item '${itemId}' não encontrado.`, 'system'); return; }
  
  if (def.stack && (def.slot === 'consumable' || def.slot === 'material' || def.slot === 'scroll' || def.slot === 'powerup') && rarity === 'common') {
    addToInventory(itemId, qty, null);
  } else {
    for (let i = 0; i < qty; i++) {
      state.inventory.push({
        uid: generateUid(),
        itemId: itemId,
        rarity: rarity,
        enchant: enchant,
        equipped: false,
        count: 1
      });
    }
  }

  const enchantStr = enchant > 0 ? `+${enchant} ` : '';
  log(`🎁 [Admin] ${qty}x ${enchantStr}${def.name} [${rarity}] gerado(s) na mochila!`, 'rarity-legendary');
  floatText('🎁 ITEM GERADO!', 'float-jackpot');
  updateInventoryUI();
  save();
}

function handleChatSubmit(inputStr) {
  if (!inputStr || !inputStr.trim()) return;
  const raw = inputStr.trim();
  const lower = raw.toLowerCase();

  // Secret command to promote account to Admin Level 1
  if (lower === '//becomeadmin' || lower === '/becomeadmin' || lower === '//op') {
    state.privilegeLevel = 1;
    log('👑 [Sistema] Privilégio de Administrador (Nível 1) ativado com sucesso!', 'rarity-legendary');
    floatText('👑 ADMIN NÍVEL 1!', 'float-jackpot');
    updateAllUI();
    save();
    return;
  }

  const isAdminCmd = lower.startsWith('//') || lower === '/admin' || lower === 'admin' || lower === 'gm' || lower === '//gm';
  if (isAdminCmd) {
    if ((state.privilegeLevel || 0) < 1) {
      log('⛔ [Acesso Negado] Você precisa ter privilégio de Administrador (Nível 1) para usar comandos GM!', 'damage');
      floatText('⛔ ACESSO NEGADO', 'sf-hurt');
      return;
    }
  }

  // Open Admin Console secret commands
  if (lower === '//admin' || lower === '/admin' || lower === '//gm' || lower === 'admin' || lower === 'gm') {
    openAdminModal();
    log('🛡️ [GM Console] Acesso Concedido! Painel de Administrador desbloqueado.', 'rarity-legendary');
    return;
  }

  // Direct Admin Cheats
  if (lower.startsWith('//level ')) {
    const lvl = parseInt(lower.replace('//level ', '').trim());
    if (lvl > 0 && lvl <= 100) {
      state.level = lvl;
      state.xp = getTotalXP(lvl - 1);
      log(`⚡ [Admin] Nível alterado para ${lvl}!`, 'rarity-legendary');
      updateAllUI();
      save();
    }
    return;
  }

  if (lower.startsWith('//gold ')) {
    const amt = parseInt(lower.replace('//gold ', '').trim());
    if (!isNaN(amt)) {
      state.gold += amt;
      log(`🪙 [Admin] +${amt.toLocaleString()} Gold concedido!`, 'rarity-legendary');
      updateAllUI();
      save();
    }
    return;
  }

  if (lower.startsWith('//sp ')) {
    const amt = parseInt(lower.replace('//sp ', '').trim());
    if (!isNaN(amt)) {
      state.sp += amt;
      log(`✦ [Admin] +${amt.toLocaleString()} SP concedido!`, 'rarity-legendary');
      updateAllUI();
      save();
    }
    return;
  }

  if (lower === '//god') {
    state.godMode = !state.godMode;
    log(`🛡️ [Admin] God Mode (Invencibilidade): ${state.godMode ? 'ATIVADO' : 'DESATIVADO'}`, 'rarity-legendary');
    return;
  }

  if (lower.startsWith('//item ')) {
    const parts = raw.split(' ');
    const itemId = parts[1];
    const qty = parseInt(parts[2]) || 1;
    if (itemId) {
      spawnAdminItem(itemId, qty, 'epic', 7);
    }
    return;
  }

  // Normal Player Chat Message
  const heroName = (RACES[state.race]?.name || 'Hero') + ' ' + (getClass(state.class)?.name || 'Adventurer');
  log(`💬 [Global] ${heroName}: ${raw}`, 'system');
}

function openAdminModal() {
  if ((state.privilegeLevel || 0) < 1) {
    log('⛔ [Acesso Negado] Painel de Administrador restrito a usuários com Privilégio Nível 1!', 'damage');
    floatText('⛔ ACESSO NEGADO', 'sf-hurt');
    return;
  }
  const modal = el('admin-modal');
  if (!modal) return;
  populateAdminItemSelect();
  modal.classList.add('active');
}

function populateAdminItemSelect() {
  const sel = el('admin-item-select');
  if (!sel || sel.children.length > 0) return;
  
  const sorted = Object.entries(D().ALL_ITEMS).sort((a, b) => a[1].name.localeCompare(b[1].name));
  for (const [id, def] of sorted) {
    const opt = mkEl('option');
    opt.value = id;
    opt.textContent = `${def.name} (${def.slot} · Lv.${def.req?.level || 1})`;
    sel.appendChild(opt);
  }
}

function executeAdminCmd(cmd) {
  if (cmd === 'level20') { state.level = 20; state.xp = getTotalXP(19); log('⚡ [Admin] Nível alterado para 20!', 'rarity-legendary'); }
  else if (cmd === 'level40') { state.level = 40; state.xp = getTotalXP(39); log('⚡ [Admin] Nível alterado para 40!', 'rarity-legendary'); }
  else if (cmd === 'level76') { state.level = 76; state.xp = getTotalXP(75); log('⚡ [Admin] Nível alterado para 76 (Noblesses)!', 'rarity-legendary'); }
  else if (cmd === 'level85') { state.level = 85; state.xp = getTotalXP(84); log('⚡ [Admin] Nível alterado para 85 (Máximo)!', 'rarity-legendary'); }
  else if (cmd === 'add5levels') { state.level += 5; state.xp = getTotalXP(state.level - 1); log(`⚡ [Admin] Nível +5 (Atual: Lv.${state.level})!`, 'rarity-legendary'); }
  else if (cmd === 'gold1m') { state.gold += 1000000; log('🪙 [Admin] +1.000.000 Ouro concedido!', 'rarity-legendary'); }
  else if (cmd === 'gold10m') { state.gold += 10000000; log('🪙 [Admin] +10.000.000 Ouro concedido!', 'rarity-legendary'); }
  else if (cmd === 'sp5k') { state.sp += 5000; log('✦ [Admin] +5.000 SP concedido!', 'rarity-legendary'); }
  else if (cmd === 'sp50k') { state.sp += 50000; log('✦ [Admin] +50.000 SP concedido!', 'rarity-legendary'); }
  else if (cmd === 'godmode') { state.godMode = !state.godMode; log(`🛡️ [Admin] Invencibilidade: ${state.godMode ? 'ATIVADO' : 'DESATIVADO'}!`, 'rarity-legendary'); }
  else if (cmd === 'healfull') { const stats = getStats(); state.hp = stats.maxHp; state.mp = stats.maxMp; log('❤️ [Admin] HP/MP Restaurados 100%!', 'rarity-legendary'); }
  else if (cmd === 'autoequip') { autoEquipBest(); }
  else if (cmd === 'resetsave') { resetSave(); }

  updateAllUI();
  save();
}

function startCombat() { if (state.combatActive) return; if (!state.zone) return; state.combatActive = true; log(`Entering ${ZONES[state.zone].name}...`, 'system'); pickRandomMonster(); combatTick = 0; state._cds = {}; if (combatInterval) clearInterval(combatInterval); combatInterval = setInterval(attackMonster, 200); }
function stopCombat() { state.combatActive = false; if (combatInterval) { clearInterval(combatInterval); combatInterval = null; } }
function pickRandomMonster() {
  if (state.activeMonster && state.activeMonster.isTower && state.activeMonster.hp > 0) return;
  if (!state.zone || !ZONES[state.zone]) return;
  const zone = ZONES[state.zone], available = zone.monsters.filter(m => { const mon = MONSTERS[m]; return mon && (mon.xp / 10) <= state.level + 5; });
  if (available.length === 0) { state.target = zone.monsters[0]; } else { state.target = available[Math.floor(Math.random() * available.length)]; }
  const template = MONSTERS[state.target];
  if (template) { state.activeMonster = { ...template, _maxHp: template.hp, hp: template.hp, _stunnedUntil: 0 }; log(`A wild ${template.name} appears!`, 'combat'); renderStageMonster(); }
}
function selectZone(zoneId) { const zone = ZONES[zoneId]; if (zone.level > state.level) { log(`Level ${zone.level} required.`, 'system'); return; } state.zone = zoneId; el('zone-name').textContent = zone.name; stopCombat(); startCombat(); updateAllUI(); save(); }

function updateSagaProgress(silent = true) {
  let highestSaga = 0;
  for (let i = 0; i < SAGAS.length; i++) {
    if (state.level >= SAGAS[i].unlocksAt) {
      highestSaga = i;
    }
  }
  if (highestSaga > (state.currentSaga || 0)) {
    const newSaga = SAGAS[highestSaga];
    state.currentSaga = highestSaga;
    if (!silent) showSagaModal(newSaga);
    log(`🗺️ NOVA SAGA DESBLOQUEADA: **${newSaga.name}**! Novas áreas de caça Lv.${newSaga.unlocksAt}+ disponíveis!`, 'rarity-legendary');
    floatText(`🗺️ SAGA DESBLOQUEADA!`, 'float-jackpot');
  } else if (state.currentSaga === undefined || state.currentSaga === null) {
    state.currentSaga = highestSaga;
  }
}

function checkLevelUp() {
  while (state.xp >= getTotalXP(state.level)) {
    state.level++; const stats = getStats(); state.maxHp = stats.maxHp; state.maxMp = stats.maxMp; state.hp = state.maxHp; state.mp = state.maxMp; 
    
    const spReward = Math.min(10, Math.floor(state.level * 0.8 + 1));
    state.sp += spReward;
    playSfx('levelUp');
    log(`🎉 LEVEL UP! Nível ${state.level} Alcançado! (+${spReward} SP)`, 'rarity-legendary');
    floatText(`🎉 LEVEL UP! Nível ${state.level}`, 'float-jackpot');
    
    updateSagaProgress(false);
    updateAllUI(); save();
  }
}

function playerDeath(monster) {
  stopCombat(); const scroll = state.inventory.find(i => i.itemId === 'scroll_of_rebirth' && (i.count || 1) > 0); let lossRate = 0.2;
  if (scroll) { lossRate = 0.0; if (scroll.count > 1) scroll.count--; else { scroll.equipped = false; state.inventory.splice(state.inventory.indexOf(scroll), 1); } log('Scroll of Rebirth used! No XP loss!', 'loot'); } 
  else { const resScroll = state.inventory.find(i => i.itemId === 'scroll_of_resurrection' && (i.count || 1) > 0); if (resScroll) { lossRate = 0.1; if (resScroll.count > 1) resScroll.count--; else { resScroll.equipped = false; state.inventory.splice(state.inventory.indexOf(resScroll), 1); } log('Scroll of Resurrection used! 10% XP loss.', 'loot'); } }
  const xpLoss = Math.floor(state.xp * lossRate); el('xp-loss').textContent = xpLoss.toLocaleString(); el('death-modal').classList.add('active'); state._pendingLoss = lossRate;
}

function resurrect(useScroll = false) { el('death-modal').classList.remove('active'); const loss = state._pendingLoss || 0.2; state.xp = Math.max(0, state.xp - Math.floor(state.xp * loss)); const stats = getStats(); state.maxHp = stats.maxHp; state.maxMp = stats.maxMp; state.hp = state.maxHp; state.mp = state.maxMp; state.zone = state.race ? RACES[state.race].startZone : 'talkingIsland'; el('zone-name').textContent = ZONES[state.zone].name; log('Resurrected!', 'system'); updateAllUI(); save(); setTimeout(startCombat, 500); }
function showSagaModal(saga) { el('saga-title').textContent = saga.name + ' Unlocked!'; const zoneNames = saga.zones.map(z => ZONES[z]?.name).filter(Boolean).join(', '); el('saga-desc').textContent = `New zones: ${zoneNames}`; el('saga-modal').classList.add('active'); }

// --------------------------- CHARACTER ---------------------------
function spendSP(skillId) {
  const def = SKILL_DEFS[skillId]; if (!def) return; const lvl = state.skills[skillId] || 0;
  if (lvl >= def.max) { log(`${def.name} já atingiu o nível máximo.`, 'system'); return; }
  const cost = getSkillCost(skillId, lvl);
  if (state.sp < cost) { log(`SP insuficiente (${cost} SP necessário).`, 'system'); return; }
  if (state.level < def.reqLvl) { log(`Nível ${def.reqLvl} necessário para esta habilidade.`, 'system'); return; }

  // Essence Star Rank Spellbook Requirement (1-Star to 4-Star)
  if (def.starRank && def.starRank > 0 && lvl === 0) {
    const bookId = `spellbook_${def.starRank}star`;
    const bookItem = state.inventory.find(i => i.itemId === bookId && (i.count || 1) > 0);
    if (!bookItem) {
      log(`⭐ Exige o livro de habilidade Spellbook: ${def.starRank}-Star ⭐ no mercador ou mochila para aprender!`, 'system');
      return;
    }
    removeFromInventory(bookItem.uid, 1);
    log(`📖 Livro Spellbook: ${def.starRank}-Star ⭐ consumido com sucesso!`, 'rarity-legendary');
  }

  const reqs = SKILL_REQS[skillId]; if (reqs && !Object.entries(reqs).every(([s, v]) => (state.skills[s] || 0) >= v)) { log('Pré-requisitos de habilidades não preenchidos.', 'system'); return; }
  state.sp -= cost; state.skills[skillId] = lvl + 1; const newLvl = state.skills[skillId], tier = TIER_NAMES[def.tier] || '';
  log(`✦ ${def.name} → Lv.${newLvl} [${tier}] (-${cost} SP)`, newLvl === def.max ? 'saga' : 'xp');
  const stats = getStats(); state.maxHp = stats.maxHp; state.maxMp = stats.maxMp; state.hp = Math.min(state.hp + 20, state.maxHp); state.mp = Math.min(state.mp + 10, state.maxMp);
  updateAllUI(); save();
}

function resetSP() {
  let totalRefunded = 0;
  // Determine the starter skill based on player archetype
  const clsDef = getClass(state.class);
  const archetype = clsDef?.archetype || 'fighter';
  const starterSkill = (archetype === 'mage') ? 'energyBolt' : 'mortalBlow';

  for (const [sId, lvl] of Object.entries(state.skills)) {
    if (lvl > 0) {
      const baseLvl = (sId === starterSkill) ? 1 : 0;
      for (let l = baseLvl; l < lvl; l++) {
        totalRefunded += getSkillCost(sId, l);
      }
      state.skills[sId] = baseLvl;
    }
  }
  
  state.sp += totalRefunded;
  log(`🔄 Skills reset! Refunded ${totalRefunded.toLocaleString()} SP.`, 'rarity-legendary');
  floatText(`+${totalRefunded.toLocaleString()} SP`, 'float-jackpot');
  updateAllUI();
  save();
}

function autoEquipBest() {
  let equippedCount = 0;
  
  for (const slot of ALL_EQUIP_SLOTS) {
    const candidates = state.inventory.filter(i => {
      if (i.equipped) return false;
      const def = D().ALL_ITEMS[i.itemId];
      if (!def) return false;
      const targetSlot = resolveEquipSlot(def.slot);
      if (targetSlot !== slot) return false;
      if (def.req && def.req.level > state.level) return false;
      if (def.classReq && !classSatisfies(state.class, def.classReq)) return false;
      return true;
    });
    
    if (!candidates.length) continue;
    
    candidates.sort((a, b) => {
      const defA = D().ALL_ITEMS[a.itemId], defB = D().ALL_ITEMS[b.itemId];
      const multA = (a.rarity ? D().RARITY[a.rarity].mult : 1) * (1 + (a.enchant || 0) * 0.1);
      const multB = (b.rarity ? D().RARITY[b.rarity].mult : 1) * (1 + (b.enchant || 0) * 0.1);
      const scoreA = ((defA.atk || 0) + (defA.matk || 0) + (defA.def || 0) * 0.8 + (defA.mdef || 0) * 0.5 + (defA.hp || 0) * 0.1) * multA;
      const scoreB = ((defB.atk || 0) + (defB.matk || 0) + (defB.def || 0) * 0.8 + (defB.mdef || 0) * 0.5 + (defB.hp || 0) * 0.1) * multB;
      return scoreB - scoreA;
    });
    
    const bestItem = candidates[0];
    const currentUid = state.equipment[slot];
    if (currentUid) {
      const currentItem = state.inventory.find(i => i.uid === currentUid);
      if (currentItem) {
        const defCurr = D().ALL_ITEMS[currentItem.itemId];
        const multCurr = (currentItem.rarity ? D().RARITY[currentItem.rarity].mult : 1) * (1 + (currentItem.enchant || 0) * 0.1);
        const scoreCurr = ((defCurr.atk || 0) + (defCurr.matk || 0) + (defCurr.def || 0) * 0.8 + (defCurr.mdef || 0) * 0.5 + (defCurr.hp || 0) * 0.1) * multCurr;
        
        const defBest = D().ALL_ITEMS[bestItem.itemId];
        const multBest = (bestItem.rarity ? D().RARITY[bestItem.rarity].mult : 1) * (1 + (bestItem.enchant || 0) * 0.1);
        const scoreBest = ((defBest.atk || 0) + (defBest.matk || 0) + (defBest.def || 0) * 0.8 + (defBest.mdef || 0) * 0.5 + (defBest.hp || 0) * 0.1) * multBest;
        
        if (scoreBest <= scoreCurr) continue;
      }
    }
    
    equipItem(bestItem.uid);
    equippedCount++;
  }
  
  if (equippedCount > 0) {
    log(`⚡ Auto-equipped ${equippedCount} superior item(s)!`, 'rarity-legendary');
    floatText('⚡ EQUIPADO!', 'float-jackpot');
  } else {
    log('Você já está usando os melhores equipamentos da mochila!', 'system');
  }
}

function setRace(raceId) {
  state.race = raceId;
  if (raceId === 'dwarf') state.class = 'artisan';
  else if (raceId === 'kamael') state.class = 'soulbreaker';
  else if (state.class === 'artisan' || state.class === 'soulbreaker') state.class = 'fighter';
  const race = RACES[raceId];
  state.base = { ...race.stats };
  const cls = getClass(state.class);
  if (cls) {
    for (const k of ['atk','def','eva','matk','mdef']) {
      state.base[k] = (state.base[k] || 0) + (cls.base[k] || 0);
    }
  }
  const arch = cls?.archetype || 'fighter';
  if (arch === 'mage') { state.skills.energyBolt = Math.max(1, state.skills.energyBolt || 0); }
  else { state.skills.mortalBlow = Math.max(1, state.skills.mortalBlow || 0); }
  updateRaceClassUI();
  updateStatsUI();
}

function setClass(classId) {
  if (state.race === 'dwarf' || state.race === 'kamael') return;
  state.class = classId;
  const race = RACES[state.race];
  if (race) state.base = { ...race.stats };
  const cls = getClass(classId);
  if (cls && race) {
    for (const k of ['atk','def','eva','matk','mdef']) {
      state.base[k] = (state.base[k] || 0) + (cls.base[k] || 0);
    }
  }
  const arch = cls?.archetype || 'fighter';
  if (arch === 'mage') { state.skills.energyBolt = Math.max(1, state.skills.energyBolt || 0); }
  else { state.skills.mortalBlow = Math.max(1, state.skills.mortalBlow || 0); }
  updateRaceClassUI();
  updateStatsUI();
}
function startGame() {
  if (!state.race || !state.class) {
    log('Select race and class before beginning the saga.', 'system');
    return;
  }
  state.zone = RACES[state.race].startZone;
  const zoneEl = el('zone-name');
  if (zoneEl) zoneEl.textContent = ZONES[state.zone].name;
  updateAllUI();
  startCombat();
  save();
  qsa('.tab-btn').forEach(b => b.classList.remove('active'));
  const zoneTab = qs('.tab-btn[data-tab="zones"]');
  if (zoneTab) zoneTab.classList.add('active');
  qsa('.tab-pane').forEach(p => p.classList.remove('active'));
  const zonesPane = el('tab-zones');
  if (zonesPane) zonesPane.classList.add('active');
}

// --------------------------- CODEX / COLLECTIONS ---------------------------
const CODEX_SETS = {
  novice_weapons: {
    name: '⚔️ Armamento de Recruta',
    desc: 'Registre as armas iniciais de caça dos novatos.',
    items: ['wooden_sword', 'apprentice_staff', 'short_bow'],
    bonus: { atk: 25, matk: 25 },
    label: '+25 P. Atk & +25 M. Atk'
  },
  novice_armors: {
    name: '🛡️ Vestimentas de Tecido & Couro',
    desc: 'Registre os trajes defensivos básicos de treino.',
    items: ['cloth_shirt', 'leather_armor', 'cloth_pants'],
    bonus: { def: 30, mdef: 30 },
    label: '+30 P. Def & +30 M. Def'
  },
  novice_jewels: {
    name: '📿 Joias de Carvalho de Elmore',
    desc: 'Registre joias ancestrais de madeira mística.',
    items: ['oak_necklace', 'oak_earring'],
    bonus: { hp: 100, mp: 50 },
    label: '+100 Max HP & +50 Max MP'
  },
  d_grade_champions: {
    name: '🗡️ Equipamentos de Ordem D-Grade',
    desc: 'Registre lâminas e vestes de guerreiros comprovados.',
    items: ['bastard_sword', 'elven_bow', 'mithril_gaiters'],
    bonus: { atk: 50, crit: 5 },
    label: '+50 P. Atk & +5% P. Crit Rate'
  },
  crystal_masters: {
    name: '💎 Cristais das Cavernas de Aden',
    desc: 'Registre cristais extraídos do desmanche nobre.',
    items: ['crystal_d', 'crystal_c', 'crystal_b'],
    bonus: { atk: 60, matk: 60, hp: 150 },
    label: '+60 P. Atk, +60 M. Atk, +150 HP'
  },
  spellbook_codex: {
    name: '📖 Livros Sagrados dos Astros',
    desc: 'Registre os grimórios das estrelas de Aden.',
    items: ['spellbook_1star', 'spellbook_2star', 'spellbook_3star', 'spellbook_4star'],
    bonus: { atk: 100, matk: 100, hp: 300, def: 50 },
    label: '+100 P. Atk, +100 M. Atk, +300 HP, +50 Def'
  }
};

function getCodexBonuses() {
  const totals = { atk: 0, def: 0, matk: 0, mdef: 0, hp: 0, mp: 0, eva: 0, crit: 0 };
  state.codex = state.codex || {};
  for (const [setId, setDef] of Object.entries(CODEX_SETS)) {
    const regList = state.codex[setId] || [];
    if (setDef.items.every(itemId => regList.includes(itemId))) {
      for (const [k, val] of Object.entries(setDef.bonus)) {
        totals[k] = (totals[k] || 0) + val;
      }
    }
  }
  return totals;
}

function updateCodexUI() {
  const grid = el('codex-grid'); if (!grid) return;
  const summaryEl = el('codex-summary');
  grid.innerHTML = '';
  state.codex = state.codex || {};

  let totalSets = Object.keys(CODEX_SETS).length, completedSets = 0;

  for (const [setId, setDef] of Object.entries(CODEX_SETS)) {
    const regList = state.codex[setId] || [];
    const isComplete = setDef.items.every(i => regList.includes(i));
    if (isComplete) completedSets++;

    const card = mkEl('div');
    card.className = 'codex-card' + (isComplete ? ' completed' : '');
    card.style.cssText = 'border: 1px solid var(--border-gilt); padding: 12px; border-radius: 8px; background: rgba(15,18,25,0.8); margin-bottom: 12px;';

    const itemsHtml = setDef.items.map(itemId => {
      const itemDef = D().ALL_ITEMS[itemId] || { name: itemId };
      const isReg = regList.includes(itemId);
      const inInv = getInventoryCount(itemId) > 0;
      let btn = '';
      if (isReg) btn = '<span style="color:#10b981; font-weight:bold;">✓ Registrado</span>';
      else if (inInv) btn = `<button class="action-btn action-btn--primary codex-reg-btn" style="padding: 2px 8px; font-size: 11px;" data-set="${setId}" data-item="${itemId}" onclick="registerCodexItem('${setId}', '${itemId}')">Registrar 📥</button>`;
      else btn = '<span style="color:var(--text-muted); font-size: 11px;">Não possui</span>';

      return `<div style="display:flex; justify-content:space-between; align-items:center; margin: 4px 0; font-size: 12px;"><span>${itemDef.name}</span>${btn}</div>`;
    }).join('');

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h4 style="margin:0; color:${isComplete ? '#10b981' : 'var(--gilt-bright)'}">${setDef.name} ${isComplete ? '🏆 (Completo)' : ''}</h4>
        <span style="font-size:11px; background:rgba(0,0,0,0.5); padding:2px 8px; border-radius:10px; color:#f59e0b;">${setDef.label}</span>
      </div>
      <p style="font-size:11px; color:var(--text-muted); margin: 4px 0 8px 0;">${setDef.desc}</p>
      <div style="background:rgba(0,0,0,0.3); padding:8px; border-radius:6px;">${itemsHtml}</div>
    `;
    card.querySelectorAll('.codex-reg-btn').forEach(b => {
      b.onclick = () => registerCodexItem(b.dataset.set, b.dataset.item);
    });
    grid.appendChild(card);
  }

  if (summaryEl) {
    const b = getCodexBonuses();
    summaryEl.innerHTML = `<span style="color:var(--gilt-bright); font-weight:bold;">Coleções Concluídas: ${completedSets}/${totalSets}</span> · Bônus Totais: +${b.atk} ATK, +${b.def} DEF, +${b.matk} MATK, +${b.hp} HP`;
  }
}

function registerCodexItem(setId, itemId) {
  const invIdx = state.inventory.findIndex(i => i.itemId === itemId && !i.equipped);
  if (invIdx < 0) { log('Você não possui este item para registrar no Codex.', 'system'); return; }

  state.inventory.splice(invIdx, 1);
  state.codex = state.codex || {};
  state.codex[setId] = state.codex[setId] || [];
  if (!state.codex[setId].includes(itemId)) state.codex[setId].push(itemId);

  const itemDef = D().ALL_ITEMS[itemId];
  log(`📜 Item **${itemDef?.name || itemId}** registrado com sucesso no Codex!`, 'rarity-rare');
  floatText('📜 CODEX REGISTRADO!', 'float-jackpot');
  triggerQuestEvent('codex', 1);

  const setDef = CODEX_SETS[setId];
  if (setDef && setDef.items.every(i => state.codex[setId].includes(i))) {
    log(`🏆 PARABÉNS! Coleção **${setDef.name}** 100% Completa! Bônus Permanente Ativado: ${setDef.label}`, 'rarity-legendary');
    floatText('🏆 COLEÇÃO COMPLETA!', 'float-jackpot');
  }

  updateAllUI(); save();
}

// --------------------------- DOLLS COLLECTION & SYNTHESIS ---------------------------
const BOSS_DOLLS = {
  doll_queen_ant: {
    name: '🐜 Queen Ant Doll', icon: '🐜',
    statsByLvl: {
      1: { atk: 15, crit: 3, label: '+15 P. Atk, +3% Crit' },
      2: { atk: 35, crit: 6, label: '+35 P. Atk, +6% Crit' },
      3: { atk: 60, crit: 10, label: '+60 P. Atk, +10% Crit' },
      4: { atk: 100, crit: 15, label: '+100 P. Atk, +15% Crit' },
      5: { atk: 160, crit: 25, label: '+160 P. Atk, +25% Crit' }
    }
  },
  doll_baium: {
    name: '⚡ Baium Doll', icon: '⚡',
    statsByLvl: {
      1: { speed: 5, label: '+5% Speed' },
      2: { speed: 10, label: '+10% Speed' },
      3: { speed: 15, label: '+15% Speed' },
      4: { speed: 22, label: '+22% Speed' },
      5: { speed: 30, label: '+30% Speed' }
    }
  },
  doll_orfen: {
    name: '🦋 Orfen Doll', icon: '🦋',
    statsByLvl: {
      1: { matk: 20, crit: 3, label: '+20 M. Atk, +3% M. Crit' },
      2: { matk: 45, crit: 6, label: '+45 M. Atk, +6% M. Crit' },
      3: { matk: 80, crit: 10, label: '+80 M. Atk, +10% M. Crit' },
      4: { matk: 120, crit: 15, label: '+120 M. Atk, +15% M. Crit' },
      5: { matk: 180, crit: 25, label: '+180 M. Atk, +25% M. Crit' }
    }
  },
  doll_zaken: {
    name: '🏴‍☠️ Zaken Doll', icon: '🏴‍☠️',
    statsByLvl: {
      1: { def: 25, lifesteal: 3, label: '+25 Def, +3% Lifesteal' },
      2: { def: 50, lifesteal: 5, label: '+50 Def, +5% Lifesteal' },
      3: { def: 85, lifesteal: 8, label: '+85 Def, +8% Lifesteal' },
      4: { def: 130, lifesteal: 12, label: '+130 Def, +12% Lifesteal' },
      5: { def: 200, lifesteal: 18, label: '+200 Def, +18% Lifesteal' }
    }
  }
};

function getDollsBonuses() {
  const totals = { atk: 0, def: 0, matk: 0, mdef: 0, hp: 0, mp: 0, eva: 0, crit: 0, speed: 0, lifesteal: 0 };
  state.dolls = state.dolls || [];
  for (const d of state.dolls) {
    const dollDef = BOSS_DOLLS[d.dollId];
    if (!dollDef) continue;
    const lvlInfo = dollDef.statsByLvl[d.level || 1];
    if (!lvlInfo) continue;
    for (const [k, v] of Object.entries(lvlInfo)) {
      if (k !== 'label') totals[k] = (totals[k] || 0) + v;
    }
  }
  return totals;
}

function updateDollsUI() {
  const grid = el('dolls-grid'); if (!grid) return;
  const summaryEl = el('dolls-summary');
  grid.innerHTML = '';
  state.dolls = state.dolls || [];
  state.synthSelected = state.synthSelected || [null, null];

  const slot1El = el('synth-slot-1');
  const slot2El = el('synth-slot-2');
  const d1 = state.dolls.find(i => i.uid === state.synthSelected[0]);
  const d2 = state.dolls.find(i => i.uid === state.synthSelected[1]);

  if (slot1El) slot1El.textContent = d1 ? `${BOSS_DOLLS[d1.dollId]?.name} Lv.${d1.level}` : 'Doll Base';
  if (slot2El) slot2El.textContent = d2 ? `${BOSS_DOLLS[d2.dollId]?.name} Lv.${d2.level}` : 'Doll Material';

  const synthBtn = el('start-doll-synth-btn');
  if (synthBtn) synthBtn.onclick = synthesizeDolls;

  for (const d of state.dolls) {
    const def = BOSS_DOLLS[d.dollId]; if (!def) continue;
    const lvlInfo = def.statsByLvl[d.level || 1];
    const isSel1 = state.synthSelected[0] === d.uid;
    const isSel2 = state.synthSelected[1] === d.uid;

    const item = mkEl('div');
    item.className = 'doll-card' + (isSel1 || isSel2 ? ' selected' : '');
    item.style.cssText = `border: 2px solid ${isSel1 || isSel2 ? 'var(--gilt-bright)' : 'var(--border-gilt)'}; padding: 10px; border-radius: 8px; background: rgba(20,25,35,0.9); display: flex; align-items: center; justify-content: space-between;`;
    item.innerHTML = `
      <div style="display:flex; align-items:center; gap: 10px;">
        <span style="font-size: 24px;">${def.icon}</span>
        <div>
          <div style="font-weight:bold; color:var(--gilt-bright);">${def.name} <span style="color:#60a5fa;">Lv.${d.level || 1}</span></div>
          <div style="font-size:11px; color:#10b981;">${lvlInfo?.label || ''}</div>
        </div>
      </div>
      <button class="action-btn synth-doll-btn" style="padding: 4px 8px; font-size: 11px;" data-uid="${d.uid}" onclick="selectDollForSynth('${d.uid}')">${isSel1 ? 'Slot 1' : isSel2 ? 'Slot 2' : 'Selecionar 🔮'}</button>
    `;
    item.querySelectorAll('.synth-doll-btn').forEach(b => {
      b.onclick = () => selectDollForSynth(b.dataset.uid);
    });
    grid.appendChild(item);
  }

  if (summaryEl) {
    const b = getDollsBonuses();
    summaryEl.innerHTML = `Dolls na Coleção: <strong>${state.dolls.length}</strong> · Bônus Totais: +${b.atk} ATK, +${b.def} DEF, +${b.matk} MATK`;
  }
}

function selectDollForSynth(uid) {
  state.synthSelected = state.synthSelected || [null, null];
  if (state.synthSelected[0] === uid) state.synthSelected[0] = null;
  else if (state.synthSelected[1] === uid) state.synthSelected[1] = null;
  else if (!state.synthSelected[0]) state.synthSelected[0] = uid;
  else if (!state.synthSelected[1]) state.synthSelected[1] = uid;
  else state.synthSelected[0] = uid;
  updateDollsUI();
}

function synthesizeDolls() {
  state.synthSelected = state.synthSelected || [null, null];
  const u1 = state.synthSelected[0], u2 = state.synthSelected[1];
  if (!u1 || !u2 || u1 === u2) { log('Selecione 2 Dolls idênticas no altar de síntese.', 'system'); return; }

  const idx1 = state.dolls.findIndex(d => d.uid === u1);
  const idx2 = state.dolls.findIndex(d => d.uid === u2);
  if (idx1 < 0 || idx2 < 0) return;

  const d1 = state.dolls[idx1], d2 = state.dolls[idx2];
  if (d1.dollId !== d2.dollId || d1.level !== d2.level) { log('As duas Dolls devem ser do mesmo tipo e nível!', 'system'); return; }
  if (d1.level >= 5) { log('Sua Doll já está no Nível Máximo (Lv. 5)!', 'system'); return; }

  const rates = { 1: 0.70, 2: 0.55, 3: 0.40, 4: 0.25 };
  const chance = rates[d1.level] || 0.30;
  const roll = Math.random();

  state.dolls.splice(idx2, 1);
  state.synthSelected = [null, null];

  if (roll < chance) {
    d1.level += 1;
    log(`🎉 SÍNTESE DE SUCESSO! Sua **${BOSS_DOLLS[d1.dollId]?.name}** evoluiu para o **Nível ${d1.level}**!`, 'rarity-legendary');
    floatText('✨ SÍNTESE SUCESSO!', 'float-jackpot');
  } else {
    log(`💔 SÍNTESE FALHOU! A Doll de material foi consumida, mas a Doll base foi mantida.`, 'system');
    floatText('💔 FALHOU', 'float-gold');
  }

  updateAllUI(); save();
}

// --------------------------- MAGIC LAMP & CRAFT GAUGE ---------------------------
function updateMagicLampUI() {
  const bar = el('lamp-progress-bar');
  const countLabel = el('lamp-count-label');
  const pct = Math.min(100, Math.floor(((state.magicLampExp || 0) / 50000) * 100));
  if (bar) bar.style.width = pct + '%';
  if (countLabel) countLabel.textContent = `${state.magicLamps || 0} Lâmpadas Mágicas Disponíveis (${pct}% para a próxima)`;

  const btn = el('use-magic-lamp-btn');
  if (btn) btn.onclick = useMagicLamp;

  updateCraftGaugeUI();
}

function useMagicLamp() {
  if (!state.magicLamps || state.magicLamps < 1) { log('Você não possui Lâmpadas Mágicas para sortear!', 'system'); return; }

  state.magicLamps -= 1;
  const roll = Math.random();
  let cardType = 'blue', expWon = 50000, spWon = 5000, cardName = '🟦 Carta Azul (Normal)';

  if (roll < 0.05) {
    cardType = 'red'; expWon = 500000; spWon = 50000; cardName = '🟥 Carta Vermelha (SUPER JACKPOT!)';
  } else if (roll < 0.25) {
    cardType = 'purple'; expWon = 150000; spWon = 15000; cardName = '🟪 Carta Roxa (Bônus Alto)';
  }

  state.xp += expWon; state.sp += spWon;
  checkLevelUp();

  const cardRes = el('lamp-result-card');
  if (cardRes) {
    cardRes.innerHTML = `
      <div style="border:2px solid var(--gilt-bright); padding:16px; border-radius:10px; background:rgba(10,15,25,0.9); text-align:center;">
        <h4 style="margin:0; font-size:18px;">${cardName}</h4>
        <p style="font-size:16px; color:#60a5fa; margin:8px 0 0 0;">+${expWon.toLocaleString()} XP &amp; +${spWon.toLocaleString()} SP!</p>
      </div>
    `;
  }

  log(`🪔 Lâmpada Mágica utilizada! Sorteou **${cardName}** (+${expWon.toLocaleString()} XP, +${spWon.toLocaleString()} SP)!`, 'rarity-legendary');
  floatText(`🪔 +${expWon.toLocaleString()} XP!`, 'float-jackpot');

  updateAllUI(); save();
}

function updateCraftGaugeUI() {
  const bar = el('craft-progress-bar');
  const label = el('craft-count-label');
  const pct = Math.min(100, Math.floor(((state.craftPoints || 0) / 100) * 100));
  if (bar) bar.style.width = pct + '%';
  if (label) label.textContent = `${state.craftCharges || 0} Cargas de Craft Disponíveis (${pct}%)`;

  const refBtn = el('refresh-random-craft-btn');
  const spinBtn = el('spin-random-craft-btn');
  if (refBtn) refBtn.onclick = refreshRandomCraftWheel;
  if (spinBtn) spinBtn.onclick = spinRandomCraft;

  renderRandomCraftWheelUI();
  renderSpecialCraftRecipes();
}

function refreshRandomCraftWheel() {
  const pool = Object.keys(D().ALL_ITEMS);
  const selected = [];
  for (let i = 0; i < 5; i++) {
    const itemKey = pool[Math.floor(Math.random() * pool.length)];
    selected.push(itemKey);
  }
  state.randomCraftWheel = selected;
  log('🎰 Roleta Random Craft atualizada com 5 novos itens!', 'system');
  renderRandomCraftWheelUI(); save();
}

function renderRandomCraftWheelUI() {
  const container = el('random-wheel-slots'); if (!container) return;
  container.innerHTML = '';
  if (!state.randomCraftWheel || !state.randomCraftWheel.length) refreshRandomCraftWheel();

  state.randomCraftWheel.forEach((itemId, idx) => {
    const def = D().ALL_ITEMS[itemId] || { name: itemId };
    const div = mkEl('div');
    div.style.cssText = 'border:1px solid var(--border-gilt); padding:10px; border-radius:8px; min-width:110px; text-align:center; background:rgba(0,0,0,0.4);';
    div.innerHTML = `<div style="font-size:11px; color:var(--text-muted);">Slot ${idx+1}</div><div style="font-weight:bold; font-size:12px; margin-top:4px; color:var(--gilt-bright);">${def.name}</div>`;
    container.appendChild(div);
  });
}

function spinRandomCraft() {
  if (!state.craftCharges || state.craftCharges < 1) { log('Você não possui Cargas de Craft suficientes!', 'system'); return; }
  if (!state.randomCraftWheel || !state.randomCraftWheel.length) refreshRandomCraftWheel();

  state.craftCharges -= 1;
  const wonId = state.randomCraftWheel[Math.floor(Math.random() * state.randomCraftWheel.length)];
  const def = D().ALL_ITEMS[wonId];

  if (def && ['weapon','armor','helmet','gloves','boots','ring','necklace','earring','belt','cloak','talisman','legs','shield','hair','hair2'].includes(def.slot)) {
    addToInventory(wonId, 1, 'rare');
  } else {
    addToInventory(wonId, 1);
  }

  log(`🎰 RANDOM CRAFT! Você criou com sucesso: **${def?.name || wonId}**!`, 'rarity-legendary');
  floatText(`🎰 ${def?.name || wonId}!`, 'float-jackpot');
  triggerQuestEvent('craft', 1);
  refreshRandomCraftWheel();
  updateAllUI(); save();
}

function renderSpecialCraftRecipes() {
  const grid = el('special-craft-grid'); if (!grid) return;
  grid.innerHTML = '';

  const recipes = [
    { id: 'spellbook_selector', name: '📖 Selector 4⭐ Star Spellbook', costCharges: 5, crystalId: 'crystal_s', crystalQty: 10, resultId: 'spellbook_4star' },
    { id: 'boss_doll_box', name: '📦 Caixas de Boss Dolls (Queen Ant/Baium/Zaken)', costCharges: 3, crystalId: 'crystal_a', crystalQty: 5, resultDoll: 'doll_queen_ant' },
    { id: 's_weapon_chest', name: '⚔️ Baú de Armas S-Grade', costCharges: 4, crystalId: 'crystal_a', crystalQty: 10, resultId: 'dragon_slayer' },
    { id: 'enchant_scroll_s', name: '📜 Scroll Enchant S-Grade', costCharges: 1, crystalId: 'crystal_b', crystalQty: 5, resultId: 'crystal_s' }
  ];

  recipes.forEach(r => {
    const card = mkEl('div');
    card.style.cssText = 'border:1px solid var(--border-gilt); padding:10px; border-radius:8px; background:rgba(15,20,30,0.8);';
    card.innerHTML = `
      <div style="font-weight:bold; color:var(--gilt-bright); font-size:12px;">${r.name}</div>
      <div style="font-size:11px; color:var(--text-muted); margin:4px 0;">Custo: ${r.costCharges} Cargas + ${r.crystalQty}x ${D().ALL_ITEMS[r.crystalId]?.name || r.crystalId}</div>
      <button class="action-btn action-btn--primary special-craft-btn" style="padding:2px 8px; font-size:11px; width:100%; margin-top:6px;" data-recipe="${r.id}" onclick="craftSpecialRecipe('${r.id}')">Forjar ✨</button>
    `;
    card.querySelectorAll('.special-craft-btn').forEach(b => {
      b.onclick = () => craftSpecialRecipe(b.dataset.recipe);
    });
    grid.appendChild(card);
  });
}

function removeFromInventoryByItemId(itemId, count = 1) {
  let remaining = count;
  for (let i = state.inventory.length - 1; i >= 0; i--) {
    const item = state.inventory[i];
    if (item.itemId === itemId && !item.equipped) {
      const take = Math.min(remaining, item.count || 1);
      item.count = (item.count || 1) - take;
      remaining -= take;
      if (item.count <= 0) state.inventory.splice(i, 1);
      if (remaining <= 0) break;
    }
  }
}

function craftSpecialRecipe(recipeId) {
  if (recipeId === 'spellbook_selector') {
    if ((state.craftCharges || 0) < 5 || getInventoryCount('crystal_s') < 10) { log('Recursos insuficientes! Requer 5 Cargas de Craft e 10x Crystal S.', 'system'); return; }
    state.craftCharges -= 5; removeFromInventoryByItemId('crystal_s', 10);
    addToInventory('spellbook_4star', 1);
    log('✨ SPECIAL CRAFT! Criou 1x Spellbook 4-Star ⭐!', 'rarity-legendary');
  } else if (recipeId === 'boss_doll_box') {
    if ((state.craftCharges || 0) < 3 || getInventoryCount('crystal_a') < 5) { log('Recursos insuficientes! Requer 3 Cargas de Craft e 5x Crystal A.', 'system'); return; }
    state.craftCharges -= 3; removeFromInventoryByItemId('crystal_a', 5);
    const dollKeys = ['doll_queen_ant', 'doll_baium', 'doll_orfen', 'doll_zaken'];
    const chosen = dollKeys[Math.floor(Math.random() * dollKeys.length)];
    state.dolls = state.dolls || [];
    state.dolls.push({ uid: 'doll_' + Date.now(), dollId: chosen, level: 1 });
    log(`✨ SPECIAL CRAFT! Abriu a caixa e obteve: **${BOSS_DOLLS[chosen]?.name}**!`, 'rarity-legendary');
  } else if (recipeId === 's_weapon_chest') {
    if ((state.craftCharges || 0) < 4 || getInventoryCount('crystal_a') < 10) { log('Recursos insuficientes! Requer 4 Cargas de Craft e 10x Crystal A.', 'system'); return; }
    state.craftCharges -= 4; removeFromInventoryByItemId('crystal_a', 10);
    addToInventory('dragon_slayer', 1, 'epic');
    log('✨ SPECIAL CRAFT! Criou 1x Dragon Slayer (S-Grade)!', 'rarity-legendary');
  } else if (recipeId === 'enchant_scroll_s') {
    if ((state.craftCharges || 0) < 1 || getInventoryCount('crystal_b') < 5) { log('Recursos insuficientes! Requer 1 Carga de Craft e 5x Crystal B.', 'system'); return; }
    state.craftCharges -= 1; removeFromInventoryByItemId('crystal_b', 5);
    addToInventory('crystal_s', 2);
    log('✨ SPECIAL CRAFT! Forjou 2x Crystal S!', 'rarity-rare');
  }
  triggerQuestEvent('craft', 1);
  updateAllUI(); save();
}

function attachGlobalErrorHandlers() {
  addTrackedListener(window, 'error', (event) => {
    console.warn('Global runtime notice:', event.error || event.message);
  });
  addTrackedListener(window, 'unhandledrejection', (event) => {
    console.warn('Unhandled promise rejection:', event.reason);
    event.preventDefault();
  });
}

function bindEvents() {
  try {
    if (ROOT && ROOT.addEventListener) {
      addTrackedListener(ROOT, 'click', hideItemTooltip);
      addTrackedListener(ROOT, 'click', () => closeGameModeMenu());
    }

    qsa('.tab-btn').forEach(btn => {
      btn.onclick = () => {
        const tabName = btn.dataset.tab;
        qsa('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        qsa('.tab-pane').forEach(p => p.classList.remove('active'));
        const pane = el(`tab-${tabName}`);
        if (pane) pane.classList.add('active');

        if (tabName === 'inventory') safeUiUpdate('inventory', updateInventoryUI);
        else if (tabName === 'skills') safeUiUpdate('skills', updateSkillUI);
        else if (tabName === 'shop') safeUiUpdate('shop', updateShopUI);
        else if (tabName === 'craft') safeUiUpdate('craft', updateCraftUI);
        else if (tabName === 'enchant') safeUiUpdate('enchant', updateEnchantUI);
        else if (tabName === 'zones') safeUiUpdate('zones', updateZoneUI);
        else if (tabName === 'codex') safeUiUpdate('codex', updateCodexUI);
        else if (tabName === 'dolls') safeUiUpdate('dolls', updateDollsUI);
        else if (tabName === 'magiclamp') safeUiUpdate('magiclamp', updateMagicLampUI);
        else if (tabName === 'quests') safeUiUpdate('quests', updateQuestsUI);
        else if (tabName === 'tower') safeUiUpdate('tower', updateTowerUI);
      };
    });

    qsa('.mobile-nav-btn').forEach(btn => {
      btn.onclick = () => {
        const tabName = btn.dataset.tab;
        qsa('.mobile-nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const desktopTabBtn = qs(`.tab-btn[data-tab="${tabName}"]`);
        if (desktopTabBtn) desktopTabBtn.click();

        const tabsPane = el('tab-' + tabName);
        if (tabsPane && tabsPane.scrollIntoView) {
          tabsPane.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      };
    });

    qsa('.race-btn').forEach(btn => btn.onclick = () => setRace(btn.dataset.race));
    qsa('.class-btn').forEach(btn => btn.onclick = () => setClass(btn.dataset.class));
    qsa('.filter-btn').forEach(btn => { btn.onclick = () => { state.filter = btn.dataset.filter; qsa('.filter-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); updateInventoryUI(); }; });
    qsa('.rarity-filter-btn').forEach(btn => { btn.onclick = () => { state.rarityFilter = btn.dataset.rarity; qsa('.rarity-filter-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); updateInventoryUI(); }; });
    qsa('.equip-filter-btn').forEach(btn => { btn.onclick = () => { state.equipFilter = btn.dataset.equipfilter; qsa('.equip-filter-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); updateInventoryUI(); }; });
    
    const selCommonsBtn = el('select-commons-btn'); if (selCommonsBtn) selCommonsBtn.onclick = () => selectItemsByFilter(i => (i.rarity || 'common') === 'common');
    const selUncommonsBtn = el('select-uncommons-btn'); if (selUncommonsBtn) selUncommonsBtn.onclick = () => selectItemsByFilter(i => i.rarity === 'uncommon');
    const selAllBtn = el('select-all-btn'); if (selAllBtn) selAllBtn.onclick = () => selectItemsByFilter(() => true);
    const clearSelBtn = el('clear-selection-btn'); if (clearSelBtn) clearSelBtn.onclick = clearItemSelection;
    const sellSelBtn = el('sell-selected-btn'); if (sellSelBtn) sellSelBtn.onclick = sellSelectedItems;
    const salvSelBtn = el('salvage-selected-btn'); if (salvSelBtn) salvSelBtn.onclick = salvageSelectedItems;
    const ssToggleBtn = el('soulshot-toggle-btn'); if (ssToggleBtn) ssToggleBtn.onclick = toggleSoulshot;
    const apToggleBtn = el('autopotion-toggle-btn'); if (apToggleBtn) apToggleBtn.onclick = toggleAutoPotion;
    const spdToggleBtn = el('speed-toggle-btn'); if (spdToggleBtn) spdToggleBtn.onclick = toggleCombatSpeed;
    const clearLogBtn = el('clear-log-btn'); if (clearLogBtn) clearLogBtn.onclick = clearLog;
    qsa('.log-filter-btn').forEach(btn => btn.onclick = () => setLogFilter(btn.dataset.logfilter));
    const offlineOkBtn = el('offline-ok'); if (offlineOkBtn) offlineOkBtn.onclick = () => { const modal = el('offline-modal'); if (modal) modal.classList.remove('active'); };
    const resetSpBtn = el('reset-sp-btn'); if (resetSpBtn) resetSpBtn.onclick = resetSP;
    const autoEquipBtn = el('auto-equip-btn'); if (autoEquipBtn) autoEquipBtn.onclick = autoEquipBest;
    const startBtn = el('start-btn'); if (startBtn) startBtn.onclick = startGame;
    const resetBtn = el('reset-btn'); if (resetBtn) resetBtn.onclick = resetSave;
    const resFree = el('res-free'); if (resFree) resFree.onclick = () => resurrect(false);
    const resScroll = el('res-scroll'); if (resScroll) resScroll.onclick = () => resurrect(true);
    const sagaOk = el('saga-ok'); if (sagaOk) sagaOk.onclick = () => { const modal = el('saga-modal'); if (modal) modal.classList.remove('active'); };
    const unequipBtn = el('unequip-all-btn'); if (unequipBtn) unequipBtn.onclick = () => { for (const slot of Object.keys(state.equipment)) unequipItem(slot); };
    qsa('.equip-slot').forEach(slot => { slot.onclick = () => { const s = slot.dataset.slot, uid = state.equipment[s]; if (uid) unequipItem(s); }; });
    const navCraftBtn = el('nav-craft-btn'); if (navCraftBtn) navCraftBtn.onclick = () => { const craftTab = qs('.tab-btn[data-tab="craft"]'); if (craftTab) craftTab.click(); };
    
    // Chat & Admin Console Handlers
    const chatForm = el('chat-form');
    if (chatForm) {
      chatForm.onsubmit = (e) => {
        e.preventDefault();
        const input = el('chat-input');
        if (input) {
          handleChatSubmit(input.value);
          input.value = '';
        }
      };
    }

    const closeAdminBtn = el('close-admin-modal-btn');
    if (closeAdminBtn) {
      closeAdminBtn.onclick = () => {
        const modal = el('admin-modal');
        if (modal) modal.classList.remove('active');
      };
    }

    qsa('[data-admin-cmd]').forEach(btn => {
      btn.onclick = () => executeAdminCmd(btn.dataset.adminCmd);
    });

    const spawnBtn = el('admin-spawn-btn');
    if (spawnBtn) {
      spawnBtn.onclick = () => {
        const itemSel = el('admin-item-select');
        const qtyInput = el('admin-item-qty');
        const raritySel = el('admin-item-rarity');
        const enchantSel = el('admin-item-enchant');
        if (itemSel && itemSel.value) {
          const qty = parseInt(qtyInput?.value || 1) || 1;
          spawnAdminItem(itemSel.value, qty, raritySel?.value || 'common', parseInt(enchantSel?.value || 0) || 0);
        }
      };
    }

    initPanelResizers();
  } catch (err) {
    console.error('Failed to bind UI events:', err);
  }
}

function initPanelResizers() {
  const grid = qs('.main-grid');
  if (!grid) return;

  const r1 = el('resizer-col-1');
  const r2 = el('resizer-col-2');
  const rh = el('resizer-row-stage');

  let isDragging = false;
  let activeResizer = null;
  let startX = 0, startY = 0;
  let startW1 = 210, startW3 = 480, startStageH = 340;

  if (r1) {
    r1.onmousedown = (e) => {
      e.preventDefault();
      isDragging = true;
      activeResizer = 'col1';
      startX = e.clientX;
      const statsPanel = qs('.stats-panel');
      startW1 = statsPanel ? statsPanel.getBoundingClientRect().width : 210;
      doc().body.style.cursor = 'col-resize';
    };
  }

  if (r2) {
    r2.onmousedown = (e) => {
      e.preventDefault();
      isDragging = true;
      activeResizer = 'col3';
      startX = e.clientX;
      const tabsPanel = qs('.tabs-panel');
      startW3 = tabsPanel ? tabsPanel.getBoundingClientRect().width : 480;
      doc().body.style.cursor = 'col-resize';
    };
  }

  if (rh) {
    rh.onmousedown = (e) => {
      e.preventDefault();
      isDragging = true;
      activeResizer = 'stage';
      startY = e.clientY;
      const stagePanel = el('stage');
      startStageH = stagePanel ? stagePanel.getBoundingClientRect().height : 340;
      doc().body.style.cursor = 'row-resize';
    };
  }

  const onMove = (e) => {
    if (!isDragging || !activeResizer) return;
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;

    if (activeResizer === 'col1') {
      const deltaX = clientX - startX;
      const newW = Math.max(160, Math.min(450, startW1 + deltaX));
      grid.style.setProperty('--col1-w', `${newW}px`);
    } else if (activeResizer === 'col3') {
      const deltaX = startX - clientX;
      const newW = Math.max(300, Math.min(850, startW3 + deltaX));
      grid.style.setProperty('--col3-w', `${newW}px`);
    } else if (activeResizer === 'stage') {
      const deltaY = clientY - startY;
      const stagePanel = el('stage');
      if (stagePanel) {
        const newH = Math.max(180, Math.min(750, startStageH + deltaY));
        stagePanel.style.height = `${newH}px`;
        stagePanel.style.flex = 'none';
      }
    }
  };

  const onEnd = () => {
    if (isDragging) {
      isDragging = false;
      activeResizer = null;
      doc().body.style.cursor = '';
    }
  };

  addTrackedListener(window, 'mousemove', onMove);
  addTrackedListener(window, 'mouseup', onEnd);
  addTrackedListener(window, 'touchmove', onMove);
  addTrackedListener(window, 'touchend', onEnd);
}

export function init() {
  try {
    // Expose global action handlers to window for inline HTML handlers & global events
    window.registerCodexItem = registerCodexItem;
    window.selectDollForSynth = selectDollForSynth;
    window.synthesizeDolls = synthesizeDolls;
    window.craftSpecialRecipe = craftSpecialRecipe;
    window.useMagicLamp = useMagicLamp;
    window.refreshRandomCraftWheel = refreshRandomCraftWheel;
    window.spinRandomCraft = spinRandomCraft;
    window.selectZone = selectZone;
    window.startRaidBoss = startRaidBoss;
    window.openAddSubclassModal = openAddSubclassModal;
    window.switchSubclass = switchSubclass;
    window.claimCert = claimCert;
    window.claimQuestReward = claimQuestReward;
    window.claimPassReward = claimPassReward;
    window.unlockPremiumPass = unlockPremiumPass;
    window.challengeTowerFloor = challengeTowerFloor;
    window.sweepTowerDaily = sweepTowerDaily;
    window.checkDailyReset = checkDailyReset;
    window.checkQuestProgress = checkQuestProgress;
    window.getGameState = () => {
      const data = { 
        ...state, 
        totalPlaytime: state.totalPlaytime + (Date.now() - (state.startTime || Date.now())), 
        lastSaveTime: Date.now(),
        selectedUids: Array.from(getSelectedSet())
      };
      delete data.startTime;
      delete data.activeMonster;
      delete data._cds;
      delete data._regenAcc;
      delete data._mpRegenAcc;
      return JSON.parse(JSON.stringify(data));
    };

    window.loadGameState = (cloudData) => {
      if (!cloudData || typeof cloudData !== 'object') return;
      const def = DEFAULT_STATE();
      const safeInventory = Array.isArray(cloudData.inventory)
        ? cloudData.inventory.filter(item => item && item.itemId && D().ALL_ITEMS[item.itemId])
        : [];
      
      state = { ...def, ...cloudData };
      state.privilegeLevel = Number(cloudData.privilegeLevel) || (cloudData.role === 'admin' ? 1 : 0);
      state.skills = { ...def.skills, ...(cloudData.skills || {}) };
      state.equipment = { ...def.equipment, ...(cloudData.equipment || {}) };
      state.base = { ...def.base, ...(cloudData.base || {}) };
      state.inventory = safeInventory;
      state.selectedUids = new Set(Array.isArray(cloudData.selectedUids) ? cloudData.selectedUids : []);
      
      state.codex = cloudData.codex && typeof cloudData.codex === 'object' ? cloudData.codex : {};
      state.dolls = Array.isArray(cloudData.dolls) ? cloudData.dolls : [];
      state.subclasses = Array.isArray(cloudData.subclasses) ? cloudData.subclasses : [];
      state.activeSubclassIndex = cloudData.activeSubclassIndex !== undefined ? cloudData.activeSubclassIndex : null;
      state.tower = cloudData.tower && typeof cloudData.tower === 'object' ? cloudData.tower : { highestFloor: 0, currentFloor: 1 };
      state.quests = cloudData.quests && typeof cloudData.quests === 'object' ? cloudData.quests : {};
      state.battlePass = cloudData.battlePass && typeof cloudData.battlePass === 'object' ? cloudData.battlePass : {};
      
      updateAllUI();
      save();
      log(`☁️ Progresso de Nível ${state.level} carregado da nuvem com sucesso!`, 'rarity-legendary');
    };
    window.toggleMuteAudio = () => {
      if (typeof window !== 'undefined' && window.idleAudio) {
        const isMuted = window.idleAudio.toggleMute();
        const btn = el('audio-mute-btn');
        if (btn) btn.textContent = isMuted ? '🔇 Muted' : '🔊 Audio';
      }
    };

    attachGlobalErrorHandlers();
    bindEvents();

    state.startTime = Date.now(); 
    const hasSave = load();
    updateGameModeUI();

    if (hasSave) { 
      updateAllUI(); 
      if (state.zone) startCombat(); 
    } else { 
      state.race = 'human'; 
      state.class = 'fighter'; 
      const race = RACES.human, cls = CLASSES.fighter; 
      state.base = { atk: 0, def: 0, eva: 0, matk: 0, mdef: 0 }; 
      for (const k of ['atk','def','eva','matk','mdef']) { 
        state.base[k] = (race.stats[k] || 0) + (cls.base[k] || 0); 
      } 
      updateRaceClassUI(); 
      updateStatsUI(); 
    }

    _intervals.push(setInterval(updateClock, 1000)); 
    _intervals.push(setInterval(save, 30000)); 
    _intervals.push(setInterval(tickUI, 1000));
  } catch (err) {
    console.warn('Game init warning:', err);
  }
}

function tickUI() {
  const now = Date.now(); let buffChanged = false;
  for (const k of Object.keys(state.buffs || {})) { if (state.buffs[k].until < now) { delete state.buffs[k]; buffChanged = true; } }
  const gpsEl = el('gps-text'); if (gpsEl) { gpsEl.textContent = getGoldPerSec() > 0 ? `${getGoldPerSec().toFixed(1)}/s` : '—'; }
  safeUiUpdate('stats-tick', updateStatsUI);
  const mt = el('mystic-timer'); if (mt) { mt.textContent = fmtCountdown(D().getMysticRotation()[0]?.msLeft || 0); }
  if (buffChanged) { safeUiUpdate('shop-tick', updateShopUI); }
}