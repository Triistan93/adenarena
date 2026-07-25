import * as ART from "./art.js";

// ========================================
// Lineage Idle - Main Game Logic
// ========================================

const SAVE_KEY = 'lineageIdleSave_v2';
const D = window.GameData; 

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
  fighter: { name: 'Fighter', desc: 'A melee warrior with high attack and defense.', base: { atk: 10, def: 5, mdef: 0 } },
  mage: { name: 'Mage', desc: 'A spellcaster with powerful magic attacks.', base: { atk: 0, def: 0, matk: 10, mdef: 5 } }
};

const DWARF_CLASS = { name: 'Artisan', desc: 'A master craftsman with bonus loot.', base: { atk: 6, def: 6, matk: 0, mdef: 0, lootBonus: 0.2 } };
const KAMAEL_CLASS = { name: 'Soulbreaker', desc: 'A dual-wielding warrior with high burst.', base: { atk: 12, def: -2, eva: 8, matk: 0, mdef: 0 } };

// --------------------------- SKILLS & TALENT TREES ---------------------------
const SKILL_DEFS = {
  weaponMastM:  { name: 'Weapon Mastery', info: '+1.5 ATK, +2.5 MATK / lvl', cost: 5, max: 10, type: 'stat', classReq: 'mage', reqLvl: 1, icon: '📖', tier: 0, desc: 'Increases P. Atk. and M. Atk.' },
  energyBolt:   { name: 'Energy Bolt', info: 'Auto-cast: 13 Power non-attr dmg', cost: 5, max: 5, type: 'proc', baseCd: 4000, pwr: 13, effect: 'dmg', classReq: 'mage', reqLvl: 1, icon: '✨', tier: 0, desc: 'Inflicts non-attribute damage.' },
  robeMast:     { name: 'Robe Mastery', info: '+1.7 DEF / lvl', cost: 10, max: 10, type: 'stat', classReq: 'mage', reqLvl: 5, icon: '👘', tier: 1, desc: 'P. Def. increases when a robe is equipped.' },
  iceBolt:      { name: 'Ice Bolt', info: 'Auto-cast: 14 Pwr Water dmg + slow', cost: 15, max: 5, type: 'proc', baseCd: 6000, pwr: 14, effect: 'dmg', classReq: 'mage', reqLvl: 10, icon: '❄', tier: 1, desc: 'Cools and freezes the surrounding air momentarily.' },
  antiMagic:    { name: 'Anti Magic', info: '+18 MDEF, +5% Magic Resist', cost: 20, max: 5, type: 'stat', classReq: 'mage', reqLvl: 15, icon: '🛡', tier: 2, desc: 'Resistance to damage magic increases.' },
  auraBurn:     { name: 'Aura Burn', info: 'Auto-cast: 19 Pwr close-range dmg', cost: 25, max: 5, type: 'proc', baseCd: 7000, pwr: 19, effect: 'dmg', classReq: 'mage', reqLvl: 15, icon: '💥', tier: 2, desc: 'Inflicts non-attribute damage on the enemy.' },
  higherMana:   { name: 'Higher Mana Gain', info: '+2 MP Regen / tick', cost: 30, max: 5, type: 'stat', classReq: 'mage', reqLvl: 20, icon: '💧', tier: 3, desc: 'Increases the recovery rate of MP.' },
  blaze:        { name: 'Blaze', info: 'Auto-cast: 23 Pwr Fire dmg', cost: 35, max: 5, type: 'proc', baseCd: 8000, pwr: 23, effect: 'dmg', classReq: 'mage', reqLvl: 20, icon: '🔥', tier: 3, desc: 'Flames erupt from your body.' },
  boostMana:    { name: 'Boost Mana', info: '+30 Max MP / lvl', cost: 40, max: 10, type: 'stat', classReq: 'mage', reqLvl: 25, icon: '🧠', tier: 3, desc: 'Max MP increases.' },
  quickRecycle: { name: 'Quick Recycle', info: 'Magic Re-use time -10% / lvl', cost: 50, max: 3, type: 'stat', classReq: 'mage', reqLvl: 30, icon: '⏳', tier: 4, desc: 'Upon use of magic, re-use time decreases.' },
  vampiric:     { name: 'Vampiric Touch', info: '23 Pwr Dark dmg, absorbs 40%', cost: 60, max: 5, type: 'proc', baseCd: 12000, pwr: 23, effect: 'vampiric', classReq: 'mage', reqLvl: 35, icon: '🦇', tier: 4, desc: 'Absorbs 40% of the damage as HP.' },
  flameStrike:  { name: 'Flame Strike', info: 'AoE Fire dmg (13 Pwr)', cost: 80, max: 5, type: 'proc', baseCd: 15000, pwr: 13, effect: 'dmg', classReq: 'mage', reqLvl: 40, icon: '☄', tier: 4, desc: 'Launches a fireball with a wide range.' },

  armorMast:    { name: 'Armor Mastery', info: '+11 DEF & +10% MP Regen / lvl', cost: 5, max: 10, type: 'stat', classReq: 'fighter', reqLvl: 1, icon: '🛡', tier: 0, desc: 'P. Def. increases and MP recovery bonus.' },
  mortalBlow:   { name: 'Mortal Blow', info: 'Auto-cast: High crit physical dmg', cost: 5, max: 5, type: 'proc', baseCd: 5000, pwr: 10, effect: 'dmg', classReq: 'fighter', reqLvl: 1, icon: '🗡', tier: 0, desc: 'Tries powerful attacks on vital parts.' },
  wpnMastF:     { name: 'Weapon Mastery', info: '+4.5 ATK / lvl', cost: 10, max: 10, type: 'stat', classReq: 'fighter', reqLvl: 5, icon: '⚔', tier: 1, desc: 'P. Atk. increases when using a weapon.' },
  powerSmash:   { name: 'Power Smash', info: 'Auto-cast: Strong physical dmg', cost: 15, max: 5, type: 'proc', baseCd: 6000, pwr: 18, effect: 'dmg', classReq: 'fighter', reqLvl: 10, icon: '💥', tier: 1, desc: 'Strong pounding attack.' },
  lightArmor:   { name: 'Light Armor Mast.', info: '+4.2 DEF, +3 EVA / lvl', cost: 20, max: 5, type: 'stat', classReq: 'fighter', reqLvl: 15, icon: '🪶', tier: 2, desc: 'Increases P. Def. and evasion.' },
  stunAttack:   { name: 'Stun Attack', info: 'Physical dmg + Stun chance', cost: 25, max: 5, type: 'proc', baseCd: 8000, pwr: 20, effect: 'stun', classReq: 'fighter', reqLvl: 15, icon: '💫', tier: 2, desc: 'Attacks the enemy and causes stun.' },
  heavyArmor:   { name: 'Heavy Armor Mast.', info: '+1.9 DEF mult / lvl', cost: 30, max: 5, type: 'stat', classReq: 'fighter', reqLvl: 20, icon: '🪨', tier: 3, desc: 'P. Def. increases heavily.' },
  boostHp:      { name: 'Boost HP', info: '+60 Max HP / lvl', cost: 35, max: 10, type: 'stat', classReq: 'fighter', reqLvl: 25, icon: '❤', tier: 3, desc: 'Max HP increases.' },
  wildSweep:    { name: 'Wild Sweep', info: 'Auto-cast: Cleave Physical dmg', cost: 40, max: 5, type: 'proc', baseCd: 10000, pwr: 25, effect: 'dmg', classReq: 'fighter', reqLvl: 25, icon: '🌪', tier: 3, desc: 'Attacks a multitude of enemies.' },
  warCry:       { name: 'War Cry', info: '+20% ATK for 60s (Auto-buff)', cost: 50, max: 3, type: 'proc', baseCd: 65000, pwr: 0, effect: 'warcry', classReq: 'fighter', reqLvl: 30, icon: '🗣', tier: 4, desc: 'Increases P. Atk. by 20%.' },
  fatalStrike:  { name: 'Fatal Strike', info: 'High dmg, ignores defense', cost: 60, max: 5, type: 'proc', baseCd: 12000, pwr: 35, effect: 'dmg', classReq: 'fighter', reqLvl: 35, icon: '🩸', tier: 4, desc: 'Strong attack ignoring defense.' },
  powerCrush:   { name: 'Power Crush', info: '664 Power massive hit', cost: 80, max: 5, type: 'proc', baseCd: 18000, pwr: 66, effect: 'dmg', classReq: 'fighter', reqLvl: 40, icon: '☄', tier: 4, desc: 'Attacks the enemy with massive power.' }
};

const SKILL_REQS = {
  robeMast: { weaponMastM: 1 }, iceBolt: { energyBolt: 1 }, antiMagic: { robeMast: 1 },
  auraBurn: { iceBolt: 2 }, higherMana: { antiMagic: 2 }, blaze: { auraBurn: 2 },
  boostMana: { antiMagic: 1 }, quickRecycle: { higherMana: 1, blaze: 1 },
  vampiric: { blaze: 3 }, flameStrike: { vampiric: 1, boostMana: 1 },
  wpnMastF: { armorMast: 1 }, powerSmash: { mortalBlow: 1 }, lightArmor: { wpnMastF: 1 },
  stunAttack: { powerSmash: 2 }, heavyArmor: { lightArmor: 2 }, wildSweep: { stunAttack: 2 },
  boostHp: { lightArmor: 1 }, warCry: { heavyArmor: 1, wildSweep: 1 },
  fatalStrike: { wildSweep: 3 }, powerCrush: { fatalStrike: 1, boostHp: 1 }
};

const SKILL_TREE_LAYOUT = {
  weaponMastM: { col: 0, row: 1 }, energyBolt: { col: 0, row: 3 }, robeMast: { col: 1, row: 0 },
  iceBolt: { col: 1, row: 2 }, antiMagic: { col: 2, row: 1 }, auraBurn: { col: 2, row: 3 },
  higherMana: { col: 3, row: 0 }, blaze: { col: 3, row: 2 }, boostMana: { col: 3, row: 4 },
  quickRecycle: { col: 4, row: 1 }, vampiric: { col: 4, row: 3 }, flameStrike: { col: 4, row: 4 },
  armorMast: { col: 0, row: 1 }, mortalBlow: { col: 0, row: 3 }, wpnMastF: { col: 1, row: 0 },
  powerSmash: { col: 1, row: 2 }, lightArmor: { col: 2, row: 1 }, stunAttack: { col: 2, row: 3 },
  heavyArmor: { col: 3, row: 0 }, wildSweep: { col: 3, row: 2 }, boostHp: { col: 3, row: 4 },
  warCry: { col: 4, row: 1 }, fatalStrike: { col: 4, row: 3 }, powerCrush: { col: 4, row: 4 }
};
const TIER_NAMES = ['Foundation', 'Discipline', 'Mastery', 'Ascendancy', 'Legend'];

// --------------------------- ZONES & MONSTERS ---------------------------
const SAGAS = [
  { id: 'interlude', name: 'Interlude', level: 0, unlocksAt: 0, zones: ['talkingIsland', 'elvenForest', 'darkForest', 'orcVillage', 'dwarvenMine', 'kamaelLair', 'ruinedOutpost', 'howlingMoor'] },
  { id: 'prelude', name: 'Prelude of War', level: 1, unlocksAt: 20, zones: ['giranOutskirts', 'orcenRuins', 'forsakenCrypt', 'blackCitadel'] },
  { id: 'saga1', name: 'Saga I: The Awakening', level: 2, unlocksAt: 40, zones: ['gludioCastle', 'wolfMountain', 'riftOfTheVoid', 'emeraldGrove', 'underworldGate'] },
  { id: 'saga2', name: 'Saga II: The Shadow', level: 3, unlocksAt: 76, zones: ['adenCity', 'dragonValley'] }
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
  underworldGate:  { name: 'Gates of the Underworld', level: 50, monsters: ['cerberus'], shop: 'dragonValley', town: false }
};

const MONSTERS = {
  goblin: { name: 'Goblin', hp: 30, atk: 5, def: 2, eva: 2, matk: 0, mdef: 0, xp: 10, sp: 0, gold: [5, 15] },
  wolf: { name: 'Wolf', hp: 45, atk: 8, def: 1, eva: 5, matk: 0, mdef: 0, xp: 15, sp: 1, gold: [8, 20] },
  spider: { name: 'Spider', hp: 35, atk: 6, def: 1, eva: 8, matk: 0, mdef: 0, xp: 12, sp: 0, gold: [6, 18] },
  kobold: { name: 'Kobold', hp: 25, atk: 4, def: 3, eva: 3, matk: 0, mdef: 0, xp: 8, sp: 0, gold: [4, 12] },
  kamaelScout: { name: 'Kamael Scout', hp: 55, atk: 12, def: 2, eva: 8, matk: 0, mdef: 0, xp: 25, sp: 2, gold: [12, 30] },
  skeleton: { name: 'Skeleton', hp: 50, atk: 9, def: 5, eva: 1, matk: 0, mdef: 0, xp: 18, sp: 1, gold: [8, 22] },
  goblinKing: { name: 'Goblin King', hp: 120, atk: 15, def: 8, eva: 3, matk: 0, mdef: 0, xp: 50, sp: 5, gold: [25, 50], boss: true },
  wolfAlpha: { name: 'Wolf Alpha', hp: 100, atk: 18, def: 3, eva: 10, matk: 0, mdef: 0, xp: 40, sp: 3, gold: [20, 40], boss: true },
  knight: { name: 'Knight', hp: 150, atk: 20, def: 12, eva: 2, matk: 0, mdef: 5, xp: 60, sp: 5, gold: [30, 60] },
  mage: { name: 'Mage', hp: 80, atk: 5, def: 2, eva: 3, matk: 25, mdef: 8, xp: 55, sp: 5, gold: [25, 55] },
  dragon: { name: 'Dragon', hp: 300, atk: 30, def: 15, eva: 5, matk: 20, mdef: 10, xp: 120, sp: 10, gold: [80, 150], boss: true },
  dragonKnight: { name: 'Dragon Knight', hp: 500, atk: 40, def: 25, eva: 8, matk: 15, mdef: 15, xp: 200, sp: 15, gold: [150, 300], boss: true },
  goblinThief: { name: 'Goblin Thief', lvl: 2, hp: 45, atk: 9, def: 3, eva: 12, xp: 18, sp: 1, gold: [8, 20], element: 'none', traits: ['ambush', 'packTactics'], stealsGold: 0.15 },
  orc: { name: 'Orc', lvl: 5, hp: 140, atk: 20, def: 10, eva: 4, xp: 45, sp: 2, gold: [20, 45], element: 'none', traits: ['enrage'] },
  koboldLeader: { name: 'Kobold Leader', lvl: 8, hp: 260, atk: 30, def: 14, eva: 8, xp: 110, sp: 5, gold: [60, 120], element: 'none', traits: ['packLeader', 'trap'], elite: true },
  direWolf: { name: 'Dire Wolf', lvl: 12, hp: 420, atk: 52, def: 18, eva: 18, xp: 220, sp: 7, gold: [80, 160], element: 'none', traits: ['bleed', 'firstStrike'], atkSpd: 1.35 },
  crimsonBabyDragon: { name: 'Crimson Baby Dragon', lvl: 15, hp: 620, atk: 70, def: 26, eva: 10, xp: 340, sp: 10, gold: [120, 240], element: 'fire', resist: { fire: 0.75, water: 1.3 }, traits: ['fireBreath'] },
  alphaWolf: { name: 'Alpha Wolf', lvl: 18, hp: 900, atk: 85, def: 30, eva: 20, xp: 520, sp: 14, gold: [180, 340], element: 'none', traits: ['packLeader', 'bleed', 'howl'], elite: true },
  darkMage: { name: 'Dark Mage', lvl: 25, hp: 1150, atk: 145, def: 28, eva: 14, xp: 1100, sp: 26, gold: [300, 600], element: 'dark', magic: true, resist: { dark: 0.5, holy: 1.5 }, traits: ['curse', 'manaBurn'], atkSpd: 0.75 },
  devilBone: { name: 'Devil Bone', lvl: 28, hp: 2400, atk: 120, def: 78, eva: 3, xp: 1400, sp: 30, gold: [350, 700], element: 'dark', resist: { physical: 0.7, magic: 1.25 }, traits: ['boneArmor', 'reassemble'] },
  deathKnight: { name: 'Death Knight', lvl: 35, boss: true, hp: 4200, atk: 210, def: 90, eva: 12, xp: 3200, sp: 55, gold: [900, 1800], element: 'dark', resist: { dark: 0.3, holy: 1.6 }, traits: ['lifesteal', 'deathCoil', 'enrage'] },
  voidCreature: { name: 'Void Creature', lvl: 42, boss: true, hp: 5600, atk: 280, def: 60, eva: 30, xp: 5200, sp: 80, gold: [1200, 2400], element: 'void', resist: { physical: 0.85, magic: 0.85 }, traits: ['voidPierce', 'phaseShift', 'distort'] },
  emeraldDragon: { name: 'Emerald Dragon', lvl: 48, boss: true, hp: 9800, atk: 330, def: 120, eva: 8, xp: 9000, sp: 120, gold: [2500, 5000], element: 'earth', resist: { poison: 0.0, fire: 1.2 }, traits: ['poison', 'wingBuffet', 'regen'] },
  cerberus: { name: 'Cerberus', lvl: 50, boss: true, finalBoss: true, hp: 15000, atk: 400, def: 140, eva: 14, xp: 15000, sp: 180, gold: [5000, 10000], element: 'chaos', resist: { fire: 0.5, dark: 0.5, holy: 1.25 }, traits: ['multiHead', 'lifesteal', 'enrage', 'hellChain'] }
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
    weaponMastM: 0, energyBolt: 1, robeMast: 0, iceBolt: 0, antiMagic: 0, auraBurn: 0, higherMana: 0, blaze: 0, boostMana: 0, quickRecycle: 0, vampiric: 0, flameStrike: 0,
    armorMast: 0, mortalBlow: 1, wpnMastF: 0, powerSmash: 0, lightArmor: 0, stunAttack: 0, heavyArmor: 0, wildSweep: 0, boostHp: 0, warCry: 0, fatalStrike: 0, powerCrush: 0
  },
  zone: null, currentSaga: 0, gold: 0, inventory: [], 
  equipment: { weapon: null, armor: null, helmet: null, gloves: null, boots: null, ring: null },
  craftLevel: 1, craftXp: 0, shopTab: 'gear', selectedSkill: null, filter: 'all',
  totalPlaytime: 0, buffs: {}, _cds: {}, gameMode: 'idle'
});

let state = DEFAULT_STATE();

// FUNÇÃO DE SAVE/LOAD COM DEEP MERGE PARA IMPEDIR RESET DE SKILLS
function save(manual = false) {
  const data = { ...state, totalPlaytime: state.totalPlaytime + (Date.now() - state.startTime) };
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
      ? data.inventory.filter(item => item && item.itemId && D.ALL_ITEMS[item.itemId])
      : [];
    state = { ...def, ...data };
    
    // Deep Merge crucial para não perder as skills padrão ou níveis ganhos
    state.skills = { ...def.skills, ...(data.skills || {}) };
    state.equipment = { ...def.equipment, ...(data.equipment || {}) };
    state.base = { ...def.base, ...(data.base || {}) };
    state.inventory = safeInventory;
    state.buffs = data.buffs || {};
    state.filter = data.filter || 'all';
    state.gameMode = data.gameMode === 'arena' ? 'arena' : 'idle';
    state.shopTab = data.shopTab || 'gear';
    state.selectedSkill = data.selectedSkill || null;
    state.startTime = Date.now();
    return true;
  } catch {
    localStorage.removeItem(SAVE_KEY);
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
  const def = D.ALL_ITEMS[inv.itemId];
  if (!def) return null;
  const mult = inv.rarity ? D.RARITY[inv.rarity].mult : 1;
  const out = { ...def };
  ['atk','def','matk','mdef','hp','mp','eva','crit','speed','lifesteal'].forEach(k => {
    if (out[k]) out[k] = Math.floor(Number(out[k]) * mult);
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

function getStats() {
  const race = state.race ? RACES[state.race] : null;
  const cls = getClass(state.class);
  const skills = state.skills || {};
  
  let baseAtk = Number(state.base.atk) || 0;
  let baseDef = Number(state.base.def) || 0;
  let baseEva = Number(state.base.eva) || 0;
  let baseMatk = Number(state.base.matk) || 0;
  let baseMdef = Number(state.base.mdef) || 0;

  baseAtk += (Number(skills.wpnMastF) || 0) * 4.5;
  baseAtk += (Number(skills.weaponMastM) || 0) * 1.5;
  baseMatk += (Number(skills.weaponMastM) || 0) * 2.5;
  baseDef += (Number(skills.armorMast) || 0) * 11;
  baseDef += (Number(skills.robeMast) || 0) * 1.7;
  baseDef += (Number(skills.lightArmor) || 0) * 4.2;
  baseEva += (Number(skills.lightArmor) || 0) * 3;
  baseMdef += (Number(skills.antiMagic) || 0) * 18;
  const mpRegenBonus = (Number(skills.higherMana) || 0) * 2;

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

  const atkMult = 1 + buffAtkMult;
  const defMult = 1 + (Number(skills.heavyArmor) || 0) * 0.05;
  const cdr = (Number(skills.quickRecycle) || 0) * 0.10;

  const finalAtk  = Math.floor((baseAtk + (Number(eb.atk) || 0) + buffAtk) * atkMult);
  const finalDef  = Math.floor((baseDef + (Number(eb.def) || 0) + buffDef) * defMult);
  const finalEva  = Math.floor(baseEva + (Number(eb.eva) || 0));
  const finalMatk = Math.floor(baseMatk + (Number(eb.matk) || 0) + buffMatk);
  const finalMdef = Math.floor(baseMdef + (Number(eb.mdef) || 0));
  const finalCrit = Number(eb.crit) || 0;
  
  const lootBonus = (Number(race?.stats?.lootBonus) || 0) + (Number(cls?.base?.lootBonus) || 0) + itemLootBonus + luckBoost;
  const atkSpd    = buffSpd / 100;
  const lifeDrain = (Number(eb.lifesteal) || 0) / 100;
  const craftBonus = itemCraftBonus;

  const critDmg = 1 + (Number(skills.executioner) || 0) * 0.15;
  const regenHp = (Number(skills.holylight) || 0) * 0.01;
  const meteorLvl = Number(skills.meteor) || 0;
  const execute = (Number(skills.assassinate) || 0) * 0.02;
  const block = (Number(skills.divineshield) || 0) * 0.05;

  const maxHp = Math.floor(100 + state.level * 10 + (Number(skills.boostHp) || 0) * 60 + (Number(eb.hp) || 0));
  const maxMp = Math.floor(50 + state.level * 5 + (Number(skills.boostMana) || 0) * 30 + (Number(eb.mp) || 0));
  
  return {
    atk: finalAtk || 1, def: finalDef || 0, eva: finalEva || 0, matk: finalMatk || 1, mdef: finalMdef || 0,
    crit: finalCrit, critDmg, loot: 1 + lootBonus, speed: 1 + buffSpd / 100, cdr,
    atkSpd, lifeDrain, craftBonus, mpRegen: mpRegenBonus,
    xpBoost, goldBoost, luckBoost, autoPotion, maxHp, maxMp,
    regenHp, meteorLvl, execute, block
  };
}

function getClass(c) {
  if (c === 'artisan') return DWARF_CLASS;
  if (c === 'soulbreaker') return KAMAEL_CLASS;
  return CLASSES[c];
}

// --------------------------- INVENTORY / SALVAGE ---------------------------
function getInventoryCount(itemId) {
  return state.inventory.filter(i => i.itemId === itemId && !i.equipped).reduce((s, i) => s + (i.count || 1), 0);
}

function addToInventory(itemId, amount = 1, rarity = null) {
  const def = D.ALL_ITEMS[itemId];
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

function equipItem(uid) {
  const item = state.inventory.find(i => i.uid === uid);
  if (!item) return;
  const def = D.ALL_ITEMS[item.itemId];
  if (!def || !['weapon','armor','helmet','gloves','boots','ring'].includes(def.slot)) { log(`${def.name} cannot be equipped.`, 'system'); return; }
  if (def.req && def.req.level > state.level) { log(`Level ${def.req.level} required for ${def.name}`, 'system'); return; }
  if (def.classReq && def.classReq !== state.class) { log(`${def.name} requires class: ${getClass(def.classReq)?.name || def.classReq}`, 'system'); return; }
  
  const currentUid = state.equipment[def.slot];
  if (currentUid) { const current = state.inventory.find(i => i.uid === currentUid); if (current) current.equipped = false; }
  state.equipment[def.slot] = uid; item.equipped = true;
  log(`Equipped ${def.name}${item.rarity ? ' [' + D.RARITY[item.rarity].name + ']' : ''}`, 'loot');
  
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
  log(`Unequipped ${D.ALL_ITEMS[item ? item.itemId : '']?.name || slot}`, 'system');
  updateAllUI(); save();
}

function sellItem(uid) {
  const idx = state.inventory.findIndex(i => i.uid === uid);
  if (idx < 0) return;
  const item = state.inventory[idx];
  if (item.equipped) { log('Unequip first!', 'system'); return; }
  const def = D.ALL_ITEMS[item.itemId];
  const mult = item.rarity ? D.RARITY[item.rarity].mult : 1;
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
  const def = D.ALL_ITEMS[item.itemId];
  if (!def || !['weapon','armor','helmet','gloves','boots','ring'].includes(def.slot)) return;

  const reqLvl = def.req ? def.req.level : 1;
  const grade = getItemGrade(reqLvl);
  const rarityMult = item.rarity ? D.RARITY[item.rarity].mult : 1;

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
  log(`Broke ${def.name} into ${amount}x ${D.ALL_ITEMS[matId].name}`, 'loot');
  updateAllUI(); save();
}

function useItem(uid) {
  const idx = state.inventory.findIndex(i => i.uid === uid);
  if (idx < 0) return;
  const item = state.inventory[idx];
  const def = D.ALL_ITEMS[item.itemId];
  if (!def) return;
  const usable = def.slot === 'consumable' || def.slot === 'scroll' || def.slot === 'powerup';
  if (!usable) { if (['weapon','armor','helmet','gloves','boots','ring'].includes(def.slot)) equipItem(uid); return; }
  
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
  const recipe = D.CRAFTING_RECIPES[recipeId];
  if (!recipe || getCraftLevelReq(recipe.level) > state.craftLevel) return false;
  for (const [matId, qty] of Object.entries(recipe.materials)) { if (getInventoryCount(matId) < qty) return false; }
  return true;
}
function craftItem(recipeId) {
  const recipe = D.CRAFTING_RECIPES[recipeId];
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
  const rarity = D.rollRarity(rarityBoost);
  addToInventory(recipeId, 1, rarity);
  log(`Crafted ${D.ALL_ITEMS[recipeId].name} [${D.RARITY[rarity].name}]!`, 'rarity-' + rarity);
  state.craftXp += 10 + (D.ALL_ITEMS[recipeId].tier || 1) * 5;
  while (state.craftXp >= state.craftLevel * 50) { state.craftXp -= state.craftLevel * 50; state.craftLevel++; log(`Crafting Level Up! Now Lv.${state.craftLevel}`, 'xp'); }
  updateAllUI(); save();
}

// --------------------------- UI HELPERS ---------------------------
let ROOT = document; let _intervals = [];
export function setRoot(r) { ROOT = r || document; }
export function destroy() { try { stopCombat(); } catch (e) {} _intervals.forEach(id => clearInterval(id)); _intervals = []; }
const el = id => ROOT.getElementById(id);
const qs = sel => ROOT.querySelector(sel);
const qsa = sel => ROOT.querySelectorAll(sel);

function updateBar(id, cur, max) {
  const bar = el(id); const text = el(id.replace('-bar', '-text'));
  if (bar) bar.style.width = `${Math.max(0, (cur / max) * 100)}%`;
  if (text) text.textContent = `${Math.floor(cur)} / ${Math.floor(max)}`;
}
function log(msg, type = 'system') {
  const logEl = el('log');
  if (!logEl) return;
  const entry = document.createElement('p');
  entry.className = `log-entry ${type}`; entry.textContent = msg;
  logEl.appendChild(entry); logEl.scrollTop = logEl.scrollHeight;
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
  el('xp-text').textContent = `${state.xp - getTotalXP(state.level - 1)} / ${xpForLevel}`;
  el('sp-text').textContent = state.sp; el('level-text').textContent = state.level;
  el('atk-text').textContent = stats.atk; el('def-text').textContent = stats.def;
  el('eva-text').textContent = stats.eva; el('matk-text').textContent = stats.matk;
  el('mdef-text').textContent = stats.mdef; el('crit-text').textContent = `${stats.crit}%`;
  el('loot-text').textContent = `${Math.round(stats.loot * 100)}%`;
  
  const _gEl = el('gold-text-stat');
  if (_gEl) { _gEl.textContent = state.gold.toLocaleString(); if (_gEl._lastGold != null && state.gold > _gEl._lastGold) { _gEl.classList.remove('pulse'); void _gEl.offsetWidth; _gEl.classList.add('pulse'); } _gEl._lastGold = state.gold; }
  const gps = getGoldPerSec();
  const gpsEl = el('gps-text'); if (gpsEl) gpsEl.textContent = gps > 0 ? `${gps.toFixed(1)}/s` : '—';
  
  el('craft-level-stat').textContent = state.craftLevel;
  el('race-text').textContent = state.race ? RACES[state.race].name : '-';
  el('class-text').textContent = state.class ? getClass(state.class).name : '-';
  el('saga-text').textContent = SAGAS[state.currentSaga].name;
  const _sz = el('stage-zone');
  if (_sz) { const _t = state.zone ? ZONES[state.zone].name + (ZONES[state.zone].town ? ' · town' : '') : '—'; if (_sz.textContent !== _t) _sz.textContent = _t; }
  el('sp-available').textContent = state.sp; el('gold-text').textContent = state.gold.toLocaleString();
  el('shop-gold').textContent = state.gold.toLocaleString(); el('craft-level').textContent = state.craftLevel;
  el('inv-slots').textContent = `${state.inventory.length}/50`;

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
  for (const slot of Object.keys(state.equipment)) {
    const uid = state.equipment[slot]; const elem = el(`equip-${slot}`);
    if (!elem) continue; const wrap = elem.closest ? elem.closest('.equip-slot') : null;
    if (!uid) { elem.textContent = 'Empty'; elem.style.color = ''; elem.title = ''; if (wrap) { wrap.style.borderColor = ''; wrap.title = slot + ' · empty'; } continue; }
    const item = state.inventory.find(i => i.uid === uid);
    if (!item) { state.equipment[slot] = null; elem.textContent = 'Empty'; elem.title = ''; if (wrap) { wrap.style.borderColor = ''; wrap.title = slot + ' · empty'; } continue; }
    const def = D.ALL_ITEMS[item.itemId];
    const full = def.name + (item.rarity ? ' [' + D.RARITY[item.rarity].name + ']' : '');
    elem.textContent = def.name; const col = item.rarity ? D.RARITY[item.rarity].color : 'var(--gilt)';
    elem.style.color = col; elem.title = full; if (wrap) { wrap.style.borderColor = col; wrap.title = full; }
  }
  const eb = getTotalEquipBonuses(); const list = el('bonus-list'); list.innerHTML = '';
  const labels = { atk: 'ATK', def: 'DEF', matk: 'MATK', mdef: 'MDEF', hp: 'HP', mp: 'MP', eva: 'EVA', crit: 'CRIT', speed: 'SPD', lifesteal: 'LIFE STEAL' };
  for (const [k, label] of Object.entries(labels)) { if (eb[k]) { const div = document.createElement('div'); div.innerHTML = `<span>${label}</span><span class="bonus-val">+${eb[k]}${k==='crit'?'%':''}</span>`; list.appendChild(div); } }
  if (!list.children.length) list.innerHTML = '<div style="color:var(--text-muted)">No equipment</div>';
  renderStageHero();
}

const TREE_NODE_W = 110; const TREE_NODE_H = 78; const TREE_PAD_X = 14; const TREE_PAD_Y = 14;

function updateSkillUI() {
  const wrap = el('skill-tree');
  if (!wrap) return;
  const cols = 5, rows = 5;
  const W = cols * TREE_NODE_W + TREE_PAD_X * 2;
  const H = rows * TREE_NODE_H + TREE_PAD_Y * 2;
  wrap.style.width = W + 'px'; wrap.style.height = H + 'px';

  const isMage = state.class === 'mage' || state.class === 'soulbreaker';
  const activeTreeClass = isMage ? 'mage' : 'fighter';

  const pos = {};
  for (const [id, layout] of Object.entries(SKILL_TREE_LAYOUT)) {
    if (SKILL_DEFS[id] && SKILL_DEFS[id].classReq === activeTreeClass) {
      pos[id] = { x: TREE_PAD_X + layout.col * TREE_NODE_W + TREE_NODE_W / 2, y: TREE_PAD_Y + layout.row * TREE_NODE_H + TREE_NODE_H / 2 };
    }
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
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'skill-tree-svg'); svg.setAttribute('width', W); svg.setAttribute('height', H); svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = lines + tierLabels; wrap.insertBefore(svg, wrap.firstChild);

  let nodesLayer = wrap.querySelector('.skill-tree-nodes');
  if (!nodesLayer) { nodesLayer = document.createElement('div'); nodesLayer.className = 'skill-tree-nodes'; wrap.appendChild(nodesLayer); }
  nodesLayer.innerHTML = '';
  
  if (!state.selectedSkill || SKILL_DEFS[state.selectedSkill]?.classReq !== activeTreeClass) {
    state.selectedSkill = isMage ? 'weaponMastM' : 'armorMast';
  }

  for (const [id, def] of Object.entries(SKILL_DEFS)) {
    if (def.classReq !== activeTreeClass) continue;
    const layout = SKILL_TREE_LAYOUT[id];
    if (!layout) continue;
    const lvl = state.skills[id] || 0;
    const maxed = lvl >= def.max;
    const reqs = SKILL_REQS[id];
    const meetsReqs = (!reqs || Object.entries(reqs).every(([s, v]) => (state.skills[s] || 0) >= v)) && (state.level >= def.reqLvl);
    const isSelected = state.selectedSkill === id;
    const state_ = maxed ? 'maxed' : (lvl > 0 ? 'owned' : (meetsReqs ? 'available' : 'locked'));
    
    const node = document.createElement('button');
    node.className = `skill-node ${state_} ${isSelected ? 'selected' : ''}`;
    const NODE_PX_W = 86, NODE_PX_H = 62;
    node.style.left = (TREE_PAD_X + layout.col * TREE_NODE_W + (TREE_NODE_W - NODE_PX_W) / 2) + 'px';
    node.style.top  = (TREE_PAD_Y + layout.row * TREE_NODE_H + (TREE_NODE_H - NODE_PX_H) / 2) + 'px';
    node.innerHTML = `<span class="skill-icon">${def.icon || '✦'}</span><span class="skill-lvl-ring" style="--p:${(lvl/def.max)*100}"></span><span class="skill-lvl-num">${lvl}/${def.max}</span>`;
    node.title = def.name; node.onclick = () => { state.selectedSkill = id; updateSkillUI(); };
    nodesLayer.appendChild(node);
  }
  updateSkillInfoPanel();
}

function updateSkillInfoPanel() {
  const panel = el('skill-info-panel'); if (!panel) return;
  const isMage = state.class === 'mage' || state.class === 'soulbreaker';
  const id = state.selectedSkill || (isMage ? 'weaponMastM' : 'armorMast');
  const def = SKILL_DEFS[id];
  if (!def) { panel.innerHTML = ''; return; }
  const lvl = state.skills[id] || 0;
  const maxed = lvl >= def.max;
  const reqs = SKILL_REQS[id];
  const meetsReqs = !reqs || Object.entries(reqs).every(([s, v]) => (state.skills[s] || 0) >= v);
  const lvlOk = state.level >= def.reqLvl;
  const canAfford = state.sp >= def.cost && !maxed;
  
  let reqHtml = reqs ? Object.entries(reqs).map(([s, v]) => { const ok = (state.skills[s] || 0) >= v; return `<span class="req ${ok ? 'ok' : 'no'}">${SKILL_DEFS[s]?.name || s} ${v}</span>`; }).join('') : '';
  reqHtml += `<span class="req ${lvlOk ? 'ok' : 'no'}">Level ${def.reqLvl}</span>`;

  const tier = TIER_NAMES[def.tier] || '';
  panel.innerHTML = `
    <div class="si-head"><span class="si-icon">${def.icon || '✦'}</span><div class="si-title"><h3>${def.name}</h3><p class="si-tier">${tier} · Lv.${lvl}/${def.max}</p></div></div>
    <p class="si-desc">${def.desc}</p><div class="si-effect">${def.info}</div>
    <div class="si-reqs"><span class="si-label">Requires</span>${reqHtml}</div>
    <button class="si-btn" data-skillup="${id}" ${(!canAfford || !meetsReqs || !lvlOk) ? 'disabled' : ''}>${maxed ? '✦ MAXED' : `Invest ${def.cost} SP`}</button>
    <p class="si-sp">SP available: <strong>${state.sp}</strong></p>
  `;
  const btn = panel.querySelector('[data-skillup]'); if (btn) btn.onclick = () => spendSP(btn.dataset.skillup);
}

function updateInventoryUI() {
  const grid = el('inventory-grid'); grid.innerHTML = ''; const filter = state.filter;
  const sorted = [...state.inventory].sort((a, b) => { const da = D.ALL_ITEMS[a.itemId], db = D.ALL_ITEMS[b.itemId]; if (!da || !db) return 0; return (db.tier || 0) - (da.tier || 0); });
  let shown = 0;
  for (const item of sorted) {
    const def = D.ALL_ITEMS[item.itemId]; if (!def) continue; if (filter !== 'all' && def.slot !== filter) continue;
    const slot = document.createElement('div'); const rarity = item.rarity || 'common';
    slot.className = `inv-slot rarity-${rarity}`; if (item.equipped) slot.style.opacity = '0.5';
    const qty = (item.count || 1) > 1 ? `<span class="qty">${item.count}</span>` : '';
    slot.innerHTML = `<span style="font-size:18px">${getItemIcon(def)}</span><span class="name">${def.name}</span>${qty}`;
    
    slot.onclick = (e) => {
      e.stopPropagation(); 
      showItemTooltip(item, e);
    };

    grid.appendChild(slot); shown++;
  }
  if (shown === 0) grid.innerHTML = '<div style="grid-column:1/-1;color:var(--text-muted);text-align:center;padding:20px;">No items</div>';
}

function getItemIcon(def) { const icons = { weapon: '⚔️', armor: '🛡️', helmet: '⛑️', gloves: '🧤', boots: '👢', ring: '💍', consumable: '🧪', material: '💎', scroll: '📜' }; return icons[def.slot] || '📦'; }

function showItemTooltip(item, e) {
  const def = D.ALL_ITEMS[item.itemId]; if (!def) return;
  const tt = el('item-tooltip'), rarity = item.rarity || 'common', mult = D.RARITY[rarity].mult, rc = D.RARITY[rarity].color;
  let html = `<div class="tt-name" style="color:${rc}">${def.name}</div>`;
  if (item.rarity) html += `<div class="tt-rarity" style="color:${rc}">${D.RARITY[rarity].name}</div>`;
  const reqLvl = def.req ? def.req.level : 1; const grade = getItemGrade(reqLvl);
  html += `<div style="color:var(--text-muted);font-size:10px;text-transform:capitalize;">${def.slot} · <span style="font-weight:bold; color:var(--gilt);">${grade}</span></div>`;
  if (def.req) html += `<div class="tt-req">Req: Lv.${def.req.level}</div>`;
  if (def.classReq) { const cls = getClass(def.classReq); const ok = def.classReq === state.class; html += `<div class="tt-req ${ok?'ok':'no'}">Class: ${cls?.name || def.classReq}${ok?' ✓':''}</div>`; }
  if (def.desc) html += `<div class="tt-desc">${def.desc}</div>`;
  const stats = ['atk','def','matk','mdef','hp','mp','eva','crit','speed','lifesteal'];
  for (const s of stats) { if (def[s]) { const v = Math.floor(def[s] * mult); html += `<div class="tt-stat"><span>${s.toUpperCase()}</span><span class="v">+${v}${s === 'crit' ? '%' : ''}</span></div>`; } }
  if (def.craftBonus) html += `<div class="tt-stat"><span>CRAFT XP</span><span class="v">+${Math.round(def.craftBonus*mult*100)}%</span></div>`;
  if (def.lootBonus) html += `<div class="tt-stat"><span>LOOT</span><span class="v">+${Math.round(def.lootBonus*mult*100)}%</span></div>`;
  if (def.stack) html += `<div class="tt-stat"><span>Stack</span><span class="v">${item.count || 1}</span></div>`;
  if (item.equipped) html += `<div class="tt-equipped">[ EQUIPPED ]</div>`;
  
  html += `<div class="tt-actions">`;
  if (item.equipped) html += `<button class="item-action" data-action="unequip" data-uid="${item.uid}">Unequip</button>`;
  else if (['weapon','armor','helmet','gloves','boots','ring'].includes(def.slot)) { html += `<button class="item-action" data-action="equip" data-uid="${item.uid}">Equip</button>`; html += `<button class="item-action" data-action="salvage" data-uid="${item.uid}">Break</button>`; }
  if (def.slot === 'consumable' || def.slot === 'scroll' || def.slot === 'powerup') html += `<button class="item-action" data-action="use" data-uid="${item.uid}">Use</button>`;
  const sellPrice = Math.floor((def.price||10)*0.4*(item.rarity?D.RARITY[item.rarity].mult:1));
  html += `<button class="item-action sell" data-action="sell" data-uid="${item.uid}">Sell ${sellPrice}g</button></div>`;
  
  tt.innerHTML = html; tt.style.display = 'block'; 
  
  tt.onclick = (ev) => ev.stopPropagation();

  const rect = e.currentTarget.getBoundingClientRect(); 
  let leftPos = rect.right + 10;
  if (leftPos + 260 > window.innerWidth) leftPos = rect.left - 270; 
  tt.style.left = leftPos + 'px'; 
  tt.style.top = rect.top + 'px';
  
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
  const tt = el('item-tooltip');
  if (tt) tt.style.display = 'none'; 
}

function updateShopUI() {
  qsa('.shop-subtab').forEach(b => { b.classList.toggle('active', b.dataset.shoptab === state.shopTab); b.onclick = () => { state.shopTab = b.dataset.shoptab; updateShopUI(); }; });
  const list = el('shop-list'); if (!list) return; list.innerHTML = '';
  if (!state.zone && state.shopTab !== 'powerups' && state.shopTab !== 'mystic') { list.innerHTML = '<p class="shop-empty">Travel to a zone to visit the merchant.</p>'; return; }
  if (state.shopTab === 'gear') renderShopGear(list); else if (state.shopTab === 'potions') renderShopPotions(list); else if (state.shopTab === 'powerups') renderShopPowerups(list); else if (state.shopTab === 'class') renderShopClass(list); else if (state.shopTab === 'mystic') renderShopMystic(list);
  list.querySelectorAll('[data-buy]').forEach(btn => btn.onclick = () => buyItem(btn.dataset.buy));
  list.querySelectorAll('[data-buy-rarity]').forEach(btn => btn.onclick = () => buyMysticItem(btn.dataset.buyRarity, btn.dataset.rarity));
}

function shopRow(def, id, price, extra = '') {
  const canAfford = state.gold >= price; const statsLine = buildStatLine(def);
  const lockLvl = def.req && def.req.level > state.level; const lockCls = def.classReq && def.classReq !== state.class;
  const lockReason = lockLvl ? `Lv.${def.req.level}` : lockCls ? `Needs ${getClass(def.classReq)?.name}` : '';
  const row = document.createElement('div'); row.className = 'shop-item' + (lockLvl || lockCls ? ' locked' : '');
  row.innerHTML = `<div class="item-info"><div class="item-name">${def.name}${def.tier ? ' <span class="tier-tag">T'+def.tier+'</span>' : ''}</div><div class="item-desc">${def.desc || ''}</div>${statsLine ? `<div class="item-stats">${statsLine}</div>` : ''}${lockReason ? `<div class="lock-reason">🔒 ${lockReason}</div>` : ''}</div><button class="item-action" data-buy="${id}" ${(!canAfford || lockLvl || lockCls) ? 'disabled' : ''}>${price}g</button>${extra}`;
  return row;
}

function buildStatLine(def) {
  const parts = [];
  if (def.atk) parts.push(`⚔${def.atk}`); if (def.matk) parts.push(`✦${def.matk}`); if (def.def) parts.push(`🛡${def.def}`); if (def.mdef) parts.push(`🔷${def.mdef}`); if (def.hp) parts.push(`❤${def.hp}`); if (def.mp) parts.push(`💧${def.mp}`); if (def.eva) parts.push(`🏃${def.eva}`); if (def.crit) parts.push(`💥${def.crit}%`); if (def.lifesteal) parts.push(`🩸${def.lifesteal}%`); if (def.speed) parts.push(`⚡${def.speed}`); if (def.craftBonus) parts.push(`🔨+${Math.round(def.craftBonus*100)}%`); if (def.lootBonus) parts.push(`💰+${Math.round(def.lootBonus*100)}%`);
  return parts.join(' · ');
}

function renderShopGear(list) {
  const zone = ZONES[state.zone], shopId = zone?.shop, items = shopId ? D.SHOP_INVENTORY[shopId] : null;
  if (!items) { list.innerHTML = '<p class="shop-empty">No gear merchant in this area.</p>'; return; }
  let count = 0;
  for (const shopItem of items) { const def = D.ALL_ITEMS[shopItem.id]; if (!def || def.slot === 'consumable' || def.slot === 'scroll' || def.slot === 'powerup' || def.classReq || (def.req && def.req.level > state.level + 5)) continue; list.appendChild(shopRow(def, shopItem.id, def.price)); count++; }
  if (!count) list.innerHTML = '<p class="shop-empty">The merchant has no gear for you yet.</p>';
}
function renderShopPotions(list) {
  const zone = ZONES[state.zone], shopId = zone?.shop, items = shopId ? D.SHOP_INVENTORY[shopId] : null;
  const base = ['hp_potion_s','hp_potion_m','hp_potion_l','hp_potion_xl','mp_potion_s','mp_potion_m','mp_potion_l','mp_potion_xl','antidote','scroll_of_resurrection','scroll_of_rebirth'];
  const shown = new Set(), list2 = [...(items || []).map(i => i.id), ...base]; let count = 0;
  for (const id of list2) { if (shown.has(id)) continue; const def = D.ALL_ITEMS[id]; if (!def || (def.slot !== 'consumable' && def.slot !== 'scroll') || (def.req && def.req.level > state.level)) continue; shown.add(id); list.appendChild(shopRow(def, id, def.price)); count++; }
  if (!count) list.innerHTML = '<p class="shop-empty">No potions in stock.</p>';
}
function renderShopPowerups(list) {
  const powerupIds = ['xp_boost_1h','xp_boost_4h','gold_boost_1h','gold_boost_4h','luck_boost_1h','auto_potion_1h','teleport_scroll','berserker_elixir','aegis_draught','sages_tea'];
  const activeBuffs = Object.entries(state.buffs || {}).filter(([k,b]) => ['xpBoost','goldBoost','luckBoost','autoPotion'].includes(k) && b.until > Date.now());
  if (activeBuffs.length) {
    const hdr = document.createElement('div'); hdr.className = 'shop-header'; hdr.innerHTML = '<h4>Active Powerups</h4>'; list.appendChild(hdr);
    for (const [k, b] of activeBuffs) { const remaining = Math.max(0, b.until - Date.now()); const names = { xpBoost: '📘 XP Boost', goldBoost: '🪙 Gold Boost', luckBoost: '🍀 Luck Boost', autoPotion: '🧪 Auto-Potion' }; const row = document.createElement('div'); row.className = 'shop-item active-buff'; row.innerHTML = `<div class="item-info"><div class="item-name">${names[k] || k}</div><div class="item-desc">+${Math.round(b.amount*100)}% · ${fmtCountdown(remaining)}</div></div><div class="buff-pulse"></div>`; list.appendChild(row); }
    const sep = document.createElement('div'); sep.className = 'shop-header'; sep.innerHTML = '<h4>Buy More</h4>'; list.appendChild(sep);
  }
  for (const id of powerupIds) { const def = D.ALL_ITEMS[id]; if (def) list.appendChild(shopRow(def, id, def.price)); }
}
function renderShopClass(list) {
  if (!state.class) { list.innerHTML = '<p class="shop-empty">Choose a class to see exclusive gear.</p>'; return; }
  const clsName = getClass(state.class)?.name || state.class, hdr = document.createElement('div'); hdr.className = 'shop-header'; hdr.innerHTML = `<h4>${clsName} Exclusive</h4><p>Masterwork gear forged for your order.</p>`; list.appendChild(hdr);
  let count = 0; for (const id of Object.keys(D.ALL_ITEMS)) { const def = D.ALL_ITEMS[id]; if (def.classReq !== state.class || (def.req && def.req.level > state.level + 5)) continue; list.appendChild(shopRow(def, id, def.price)); count++; }
  if (!count) list.innerHTML += '<p class="shop-empty">No exclusive gear available at your level.</p>';
}
function renderShopMystic(list) {
  const rot = D.getMysticRotation(), hdr = document.createElement('div'); hdr.className = 'shop-header mystic-header'; hdr.innerHTML = `<h4>✦ Mystic Curio ✦</h4><p>Rotating rare offerings. Next refresh in <span id="mystic-timer">${fmtCountdown(rot[0]?.msLeft || 0)}</span></p>`; list.appendChild(hdr);
  for (const pick of rot) {
    const def = D.ALL_ITEMS[pick.id]; if (!def) continue; const price = Math.floor((def.price || 500) * D.RARITY[pick.rarity].mult * 2), cloned = D.rollItemWithRarity(pick.id, pick.rarity), canAfford = state.gold >= price, lockLvl = def.req && def.req.level > state.level, lockCls = def.classReq && def.classReq !== state.class, row = document.createElement('div'); row.className = `shop-item rarity-${pick.rarity}` + (lockLvl || lockCls ? ' locked' : ''); const statsLine = buildStatLine(cloned);
    row.innerHTML = `<div class="item-info"><div class="item-name rarity-${pick.rarity}">${def.name} <span class="rarity-tag">${D.RARITY[pick.rarity].name}</span></div><div class="item-desc">${def.desc || ''}</div>${statsLine ? `<div class="item-stats">${statsLine}</div>` : ''}</div><button class="item-action mystic-buy" data-buy-rarity="${pick.id}" data-rarity="${pick.rarity}" ${(!canAfford || lockLvl || lockCls) ? 'disabled' : ''}>${price}g</button>`; list.appendChild(row);
  }
}

function fmtCountdown(ms) { const s = Math.max(0, Math.floor(ms / 1000)), m = Math.floor(s / 60), ss = s % 60; return `${m}:${ss.toString().padStart(2,'0')}`; }

function buyItem(itemId) {
  const def = D.ALL_ITEMS[itemId]; if (!def) return;
  if (state.gold < def.price) { log('Not enough gold!', 'system'); return; }
  if (def.req && def.req.level > state.level) { log('Level too low.', 'system'); return; }
  if (def.classReq && def.classReq !== state.class) { log('Wrong class for this item.', 'system'); return; }
  state.gold -= def.price; addToInventory(itemId, 1, null); log(`Bought ${def.name} for ${def.price}g`, 'loot'); updateAllUI(); save();
}

function buyMysticItem(itemId, rarity) {
  const def = D.ALL_ITEMS[itemId]; if (!def) return;
  const price = Math.floor((def.price || 500) * D.RARITY[rarity].mult * 2);
  if (state.gold < price) { log('Not enough gold!', 'system'); return; }
  if (def.req && def.req.level > state.level) { log('Level too low.', 'system'); return; }
  if (def.classReq && def.classReq !== state.class) { log('Wrong class for this item.', 'system'); return; }
  state.gold -= price; addToInventory(itemId, 1, rarity); log(`Mystic purchase: ${def.name} [${D.RARITY[rarity].name}] for ${price}g`, 'rarity-' + rarity); updateAllUI(); save();
}

function updateCraftUI() {
  const list = el('craft-list'); list.innerHTML = '';
  for (const [recipeId, recipe] of Object.entries(D.CRAFTING_RECIPES)) {
    const def = D.ALL_ITEMS[recipeId]; if (!def || (def.req && def.req.level > state.level)) continue;
    const canCraft = canCraftRecipe(recipeId), item = document.createElement('div'); item.className = 'craft-item' + (canCraft ? '' : ' locked'); const reqLevel = getCraftLevelReq(recipe.level);
    const matHtml = Object.entries(recipe.materials).map(([matId, qty]) => { const have = getInventoryCount(matId), matDef = D.ALL_ITEMS[matId], cls = have >= qty ? 'have' : 'need'; return `<span class="${cls}">${matDef.name} ${have}/${qty}</span>`; }).join(', ');
    item.innerHTML = `<div class="item-info"><div class="item-name">${def.name}</div><div class="item-mats">${matHtml}</div><div class="item-desc">Req: Craft Lv.${reqLevel}</div></div><button class="item-action" data-craft="${recipeId}" ${!canCraft ? 'disabled' : ''}>Craft</button>`; list.appendChild(item);
  }
  qsa('[data-craft]').forEach(btn => btn.onclick = () => craftItem(btn.dataset.craft));
}

function canCraftRecipe(id) { return canCraft(id); }

function updateZoneUI() {
  const list = el('zone-list'); if (!list) return;
  const coords = ART.ZONE_COORDS, order = ART.ZONE_ORDER, unlocked = {};
  SAGAS.slice(0, state.currentSaga + 1).forEach(s => s.zones.forEach(z => { unlocked[z] = true; }));
  let routes = '', nodes = '';
  for (let i = 1; i < order.length; i++) { const a = coords[order[i - 1]], b = coords[order[i]]; if (!a || !b) continue; const open = unlocked[order[i - 1]] && unlocked[order[i]]; routes += `<line class="zm-route ${open ? 'open' : ''}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>`; }
  for (const id of order) {
    const z = ZONES[id], c = coords[id]; if (!z || !c) continue; const reachable = unlocked[id] && z.level <= state.level, cls = state.zone === id ? 'current' : (reachable ? 'open' : 'locked');
    nodes += `<g class="zm-node ${cls}" data-zone="${id}" transform="translate(${c.x},${c.y})"><title>${z.name} — Lv.${z.level}+${z.town ? ' (town)' : ''}</title><circle class="zm-ring" r="11"/><circle class="zm-dot" r="5"/>${z.town ? '<text class="zm-town" y="1">⌂</text>' : ''}${!reachable ? '<text class="zm-lock" y="3">🔒</text>' : ''}<text class="zm-label" y="23">${z.name}</text></g>`;
  }
  list.innerHTML = `<svg class="zone-map" viewBox="0 0 360 240" preserveAspectRatio="xMidYMid meet">${ART.mapBackdrop()}<g class="zm-routes">${routes}</g><g class="zm-nodes">${nodes}</g></svg>`;
  list.querySelectorAll('.zm-node').forEach(n => { n.onclick = () => { const id = n.dataset.zone, z = ZONES[id]; if (unlocked[id] && z.level <= state.level) selectZone(id); }; });
}

function updateRaceClassUI() {
  qsa('.race-btn').forEach(btn => { const r = btn.dataset.race; btn.disabled = (r === 'ertheia' && state.level < 10); btn.classList.toggle('selected', r === state.race); });
  qsa('.class-btn').forEach(btn => { const c = btn.dataset.class; btn.disabled = (state.race === 'dwarf' || state.race === 'kamael'); btn.classList.toggle('selected', c === state.class); });
  qs('.race-desc').textContent = state.race ? RACES[state.race].desc : 'Select a race.';
  qs('.class-desc').textContent = state.class ? getClass(state.class).desc : 'Select a class.';
  renderStageHero(); updateSkillUI();
}

function updateClock() { const now = Date.now(), elapsed = Math.floor((now - state.startTime + (state.totalPlaytime || 0)) / 1000), h = Math.floor(elapsed / 3600), m = Math.floor((elapsed % 3600) / 60), s = elapsed % 60; el('clock').textContent = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`; }

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

function updateAllUI() {
  updateGameModeUI();
  safeUiUpdate('stats', updateStatsUI);
  safeUiUpdate('equipment', updateEquipmentUI);
  safeUiUpdate('skills', updateSkillUI);
  safeUiUpdate('inventory', updateInventoryUI);
  safeUiUpdate('shop', updateShopUI);
  safeUiUpdate('craft', updateCraftUI);
  safeUiUpdate('zone', updateZoneUI);
  safeUiUpdate('race-class', updateRaceClassUI);
}

// --------------------------- VISUALS / STAGE ---------------------------
function topEquipRarityColor() { const rank = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 }; let best = -1, col = ''; for (const s of Object.keys(state.equipment)) { const uid = state.equipment[s]; if (!uid) continue; const it = state.inventory.find(i => i.uid === uid); if (!it || !it.rarity) continue; const r = rank[it.rarity] ?? -1; if (r > best) { best = r; col = D.RARITY[it.rarity].color; } } return col; }
function renderStageHero() {
  const hero = el('stage-hero'), pArt = el('portrait-art'), dArt = el('doll-art');
  if (!state.race || !state.class) { if (hero) hero.innerHTML = ''; if (pArt) pArt.innerHTML = ''; if (dArt) dArt.innerHTML = ''; return; }
  const aura = topEquipRarityColor();
  if (hero) hero.innerHTML = ART.heroSVG(state.race, state.class, aura); if (dArt) dArt.innerHTML = ART.heroSVG(state.race, state.class, aura); if (pArt) pArt.innerHTML = ART.heroSVG(state.race, state.class, aura, 'bust');
  const pn = el('portrait-name'), ps = el('portrait-sub'), pau = el('portrait-aura');
  if (pn) pn.textContent = ((RACES[state.race]?.name || '') + ' ' + (getClass(state.class)?.name || '')).trim(); if (ps) ps.textContent = state.zone ? ('Hunting · ' + ZONES[state.zone].name) : 'Awaiting the road'; if (pau) pau.style.setProperty('--aura', aura ? aura + '55' : 'rgba(212,167,68,0.0)');
}
function updateMonsterHP() { const fill = el('m-hp-fill'), mon = state.target ? MONSTERS[state.target] : null; if (!fill) return; if (!mon || !mon._maxHp) { fill.style.width = '100%'; return; } fill.style.width = Math.max(0, (mon.hp / mon._maxHp) * 100) + '%'; }
function renderStageMonster() {
  const art = el('m-art'), nm = el('m-name'), box = el('stage-monster'), mon = state.target ? MONSTERS[state.target] : null;
  if (box) box.classList.remove('hurt', 'lunge');
  if (!mon) { if (art) art.innerHTML = ''; if (nm) nm.textContent = ''; return; }
  if (art) { art.innerHTML = ART.monsterSVG(state.target, { crown: !!mon.boss }); art.classList.remove('swap'); void art.offsetWidth; art.classList.add('swap'); }
  if (nm) nm.textContent = mon.name + (mon.boss ? ' ★' : ''); updateMonsterHP();
}
function reflow(n) { void n.offsetWidth; }
function stageHeroAttack() { const st = el('stage'); if (!st) return; st.classList.remove('is-hero-atk'); reflow(st); st.classList.add('is-hero-atk'); }
function stageMonsterHurt(dmg, crit) { updateMonsterHP(); const m = el('stage-monster'); if (m) { m.classList.remove('hurt'); reflow(m); m.classList.add('hurt'); setTimeout(() => m.classList.remove('hurt'), 420); } stageFloat((crit ? 'CRIT ' : '') + Math.round(dmg), crit ? 'sf-crit' : 'sf-dmg', 'right'); }
function stageMonsterDie() { const fill = el('m-hp-fill'); if (fill) fill.style.width = '0%'; const st = el('stage'); if (st) { st.classList.remove('kill-flash'); reflow(st); st.classList.add('kill-flash'); } stageFloat('SLAIN', 'sf-slain', 'right'); }
function stageMonsterLunge() { const m = el('stage-monster'); if (!m) return; m.classList.remove('lunge'); reflow(m); m.classList.add('lunge'); setTimeout(() => m.classList.remove('lunge'), 440); }
function stageHeroHurt(dmg) { const h = el('stage-hero'); if (h) { h.classList.remove('hurt'); reflow(h); h.classList.add('hurt'); setTimeout(() => h.classList.remove('hurt'), 420); } stageFloat('-' + Math.round(dmg), 'sf-hurt', 'left'); }
function stageHeroBlock() { stageFloat('BLOCK', 'sf-block', 'left'); }
function stageFloat(text, cls, side) { const c = el('stage-floats'); if (!c) return; const s = document.createElement('span'); s.className = 'sf ' + cls; s.textContent = text; s.style.left = (side === 'left' ? (16 + Math.random() * 8) : (68 + Math.random() * 12)) + '%'; c.appendChild(s); setTimeout(() => s.remove(), 1100); }

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
function floatText(text, cls = 'float-gold') { const layer = el('float-layer'); if (!layer) return; const span = document.createElement('span'); span.className = 'float-text ' + cls; span.textContent = text; const rect = layer.getBoundingClientRect(); span.style.left = (rect.width * (0.35 + Math.random() * 0.3)) + 'px'; span.style.top = (rect.height * 0.55 + (Math.random() * 60 - 30)) + 'px'; layer.appendChild(span); setTimeout(() => span.remove(), 1400); }

function attackMonster() {
  if (!state.zone || !state.target) return;
  const stats = getStats(), monster = MONSTERS[state.target]; if (!monster) return;
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
  const activeTreeClass = isMage ? 'mage' : 'fighter';
  
  if (!state._cds) state._cds = {};
  const now = combatTick * 200; 
  
  const activeSkills = [];
  for(const [sId, lvl] of Object.entries(state.skills)) {
    const def = SKILL_DEFS[sId];
    if(lvl > 0 && def && def.type === 'proc' && def.classReq === activeTreeClass) {
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
           monster._stunnedUntil = now + 3000;
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
    const zoneMult = D.ZONE_GOLD_MULT[state.zone] || 1, xpMult = 1 + (stats.xpBoost || 0);
    const xpGain = Math.floor(monster.xp * xpMult), spGain = monster.sp + (monster.boss ? 2 : 0);
    state.xp += xpGain; state.sp += spGain;
    log(`Defeated ${monster.name}! +${xpGain} XP, +${spGain} SP`, 'xp');

    const baseGold = monster.gold[0] + Math.random() * (monster.gold[1] - monster.gold[0]), jackpot = Math.random() < (monster.boss ? 0.08 : 0.015);
    const goldMult = zoneMult * (1 + (stats.goldBoost || 0)) * (jackpot ? 10 : 1);
    let gold = Math.floor(baseGold * stats.loot * goldMult); if (gold < 1) gold = 1;
    state.gold += gold; trackGold(gold);
    if (jackpot) { log(`💰 JACKPOT! +${gold} Gold (×10)`, 'rarity-legendary'); floatText(`💰 +${gold}g`, 'float-jackpot'); } else { log(`+${gold} Gold`, 'loot'); if (gold >= 20) floatText(`+${gold}g`, 'float-gold'); }

    const drops = D.rollDrop(state.target, stats.loot);
    for (const drop of drops) {
      if (drop.isEquipment) { addToInventory(drop.id, 1, drop.rarity); log(`✦ ${D.ALL_ITEMS[drop.id].name} [${D.RARITY[drop.rarity].name}]`, 'rarity-' + drop.rarity); floatText(`✦ ${D.RARITY[drop.rarity].name}!`, 'float-' + drop.rarity); } 
      else { addToInventory(drop.id, drop.amount); log(`+ ${drop.amount}× ${D.ALL_ITEMS[drop.id].name}`, 'loot'); }
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
  if (damage > 0) { state.hp -= damage; log(`${monster.name} hits for ${damage}`, 'damage'); stageHeroHurt(damage); }
  if (state.hp <= 0) { state.hp = 0; playerDeath(monster); }
  updateStatsUI();
}

function startCombat() { if (state.combatActive) return; if (!state.zone) return; state.combatActive = true; log(`Entering ${ZONES[state.zone].name}...`, 'system'); pickRandomMonster(); combatTick = 0; state._cds = {}; if (combatInterval) clearInterval(combatInterval); combatInterval = setInterval(attackMonster, 200); }
function stopCombat() { state.combatActive = false; if (combatInterval) { clearInterval(combatInterval); combatInterval = null; } }
function pickRandomMonster() { const zone = ZONES[state.zone], available = zone.monsters.filter(m => { const mon = MONSTERS[m]; return mon && (mon.xp / 10) <= state.level + 5; }); if (available.length === 0) { state.target = zone.monsters[0]; } else { state.target = available[Math.floor(Math.random() * available.length)]; } const mon = MONSTERS[state.target]; if (mon) { if (mon._maxHp == null) mon._maxHp = mon.hp; mon.hp = mon._maxHp; log(`A wild ${mon.name} appears!`, 'combat'); renderStageMonster(); } }
function selectZone(zoneId) { const zone = ZONES[zoneId]; if (zone.level > state.level) { log(`Level ${zone.level} required.`, 'system'); return; } state.zone = zoneId; el('zone-name').textContent = zone.name; stopCombat(); startCombat(); updateAllUI(); save(); }

function checkLevelUp() {
  while (state.xp >= getTotalXP(state.level)) {
    state.level++; const stats = getStats(); state.maxHp = stats.maxHp; state.maxMp = stats.maxMp; state.hp = state.maxHp; state.mp = state.maxMp; 
    
    const spReward = state.level * 3;
    state.sp += spReward;
    log(`LEVEL UP! Now Lv.${state.level}! (+${spReward} SP)`, 'xp');
    
    for (const saga of SAGAS) { if (saga.unlocksAt === state.level && !SAGAS.slice(0, saga.level).includes(saga)) { state.currentSaga = saga.level; showSagaModal(saga); break; } }
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
  if (lvl >= def.max) { log(`${def.name} already mastered.`, 'system'); return; }
  if (state.sp < def.cost) { log('Not enough SP.', 'system'); return; }
  if (state.level < def.reqLvl) { log(`Level ${def.reqLvl} required.`, 'system'); return; }
  const reqs = SKILL_REQS[skillId]; if (reqs && !Object.entries(reqs).every(([s, v]) => (state.skills[s] || 0) >= v)) { log('Requirements not met.', 'system'); return; }
  state.sp -= def.cost; state.skills[skillId] = lvl + 1; const newLvl = state.skills[skillId], tier = TIER_NAMES[def.tier] || '';
  log(`✦ ${def.name} → Lv.${newLvl}  [${tier}]`, newLvl === def.max ? 'saga' : 'xp');
  const stats = getStats(); state.maxHp = stats.maxHp; state.maxMp = stats.maxMp; state.hp = Math.min(state.hp + 20, state.maxHp); state.mp = Math.min(state.mp + 10, state.maxMp);
  updateAllUI(); save();
}

function setRace(raceId) { state.race = raceId; if (raceId === 'dwarf') state.class = 'artisan'; else if (raceId === 'kamael') state.class = 'soulbreaker'; else if (state.class === 'artisan' || state.class === 'soulbreaker') state.class = 'fighter'; const race = RACES[raceId]; state.base = { ...race.stats }; const cls = getClass(state.class); if (cls) { for (const k of ['atk','def','eva','matk','mdef']) { state.base[k] = (state.base[k] || 0) + (cls.base[k] || 0); } } updateRaceClassUI(); updateStatsUI(); }
function setClass(classId) { if (state.race === 'dwarf' || state.race === 'kamael') return; state.class = classId; const race = RACES[state.race]; if (race) state.base = { ...race.stats }; const cls = getClass(classId); if (cls && race) { for (const k of ['atk','def','eva','matk','mdef']) { state.base[k] = (state.base[k] || 0) + (cls.base[k] || 0); } } updateRaceClassUI(); updateStatsUI(); }
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

function attachGlobalErrorHandlers() {
  window.addEventListener('error', (event) => {
    console.error('Global runtime error:', event.error || event.message);
    const logEl = el('log');
    if (logEl) {
      const entry = document.createElement('p');
      entry.className = 'log-entry system';
      entry.textContent = 'A non-fatal game error occurred. The interface will keep trying to recover.';
      logEl.appendChild(entry);
    }
  });
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    event.preventDefault();
  });
}

export function init() {
  try {
    attachGlobalErrorHandlers();
    state.startTime = Date.now(); const hasSave = load();
    updateGameModeUI();
    if (hasSave) { updateAllUI(); if (state.zone) startCombat(); } 
    else { state.race = 'human'; state.class = 'fighter'; const race = RACES.human, cls = CLASSES.fighter; state.base = { atk: 0, def: 0, eva: 0, matk: 0, mdef: 0 }; for (const k of ['atk','def','eva','matk','mdef']) { state.base[k] = (race.stats[k] || 0) + (cls.base[k] || 0); } updateRaceClassUI(); updateStatsUI(); }
    
    ROOT.addEventListener('click', hideItemTooltip);

    const saveBtn = el('save-btn');
    if(saveBtn) saveBtn.onclick = () => save(true);

    const gameModeSwitch = el('game-mode-switch');
    if (gameModeSwitch) {
      gameModeSwitch.onclick = (event) => { event.stopPropagation(); toggleGameModeMenu(); };
      gameModeSwitch.onkeydown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          event.stopPropagation();
          toggleGameModeMenu();
        }
      };
    }
    document.addEventListener('click', () => closeGameModeMenu());
    qsa('.mode-option').forEach(btn => {
      btn.onclick = (event) => { event.stopPropagation(); setGameMode(btn.dataset.mode); closeGameModeMenu(); };
    });

    qsa('.tab-btn').forEach(btn => { btn.onclick = () => { qsa('.tab-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); qsa('.tab-pane').forEach(p => p.classList.remove('active')); const pane = el(`tab-${btn.dataset.tab}`); if (pane) pane.classList.add('active'); }; });
    qsa('.race-btn').forEach(btn => btn.onclick = () => setRace(btn.dataset.race)); qsa('.class-btn').forEach(btn => btn.onclick = () => setClass(btn.dataset.class));
    qsa('.filter-btn').forEach(btn => { btn.onclick = () => { state.filter = btn.dataset.filter; qsa('.filter-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); updateInventoryUI(); }; });
    const startBtn = el('start-btn'); if (startBtn) startBtn.onclick = startGame;
    const resetBtn = el('reset-btn'); if (resetBtn) resetBtn.onclick = resetSave;
    const resFree = el('res-free'); if (resFree) resFree.onclick = () => resurrect(false);
    const resScroll = el('res-scroll'); if (resScroll) resScroll.onclick = () => resurrect(true);
    const sagaOk = el('saga-ok'); if (sagaOk) sagaOk.onclick = () => { const modal = el('saga-modal'); if (modal) modal.classList.remove('active'); };
    const unequipBtn = el('unequip-all-btn'); if (unequipBtn) unequipBtn.onclick = () => { for (const slot of Object.keys(state.equipment)) unequipItem(slot); };
    qsa('.equip-slot').forEach(slot => { slot.onclick = () => { const s = slot.dataset.slot, uid = state.equipment[s]; if (uid) unequipItem(s); }; });
    _intervals.push(setInterval(updateClock, 1000)); _intervals.push(setInterval(save, 30000)); _intervals.push(setInterval(tickUI, 1000));
  } catch (err) {
    console.error('Game init failed:', err);
    const logEl = el('log');
    if (logEl) {
      const entry = document.createElement('p');
      entry.className = 'log-entry system';
      entry.textContent = 'The game encountered a startup issue. Please refresh the page.';
      logEl.appendChild(entry);
    }
  }

  const saveBtn = el('save-btn');
  if(saveBtn) saveBtn.onclick = () => save(true);

  const gameModeSwitch = el('game-mode-switch');
  if (gameModeSwitch) {
    gameModeSwitch.onclick = (event) => { event.stopPropagation(); toggleGameModeMenu(); };
    gameModeSwitch.onkeydown = (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        event.stopPropagation();
        toggleGameModeMenu();
      }
    };
  }
  document.addEventListener('click', () => closeGameModeMenu());
  qsa('.mode-option').forEach(btn => {
    btn.onclick = (event) => { event.stopPropagation(); setGameMode(btn.dataset.mode); closeGameModeMenu(); };
  });

  qsa('.tab-btn').forEach(btn => { btn.onclick = () => { qsa('.tab-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); qsa('.tab-pane').forEach(p => p.classList.remove('active')); el(`tab-${btn.dataset.tab}`).classList.add('active'); }; });
  qsa('.race-btn').forEach(btn => btn.onclick = () => setRace(btn.dataset.race)); qsa('.class-btn').forEach(btn => btn.onclick = () => setClass(btn.dataset.class));
  qsa('.filter-btn').forEach(btn => { btn.onclick = () => { state.filter = btn.dataset.filter; qsa('.filter-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); updateInventoryUI(); }; });
  el('start-btn').onclick = startGame; el('reset-btn').onclick = resetSave; el('res-free').onclick = () => resurrect(false); el('res-scroll').onclick = () => resurrect(true); el('saga-ok').onclick = () => el('saga-modal').classList.remove('active');
  el('unequip-all-btn').onclick = () => { for (const slot of Object.keys(state.equipment)) unequipItem(slot); };
  qsa('.equip-slot').forEach(slot => { slot.onclick = () => { const s = slot.dataset.slot, uid = state.equipment[s]; if (uid) unequipItem(s); }; });
  _intervals.push(setInterval(updateClock, 1000)); _intervals.push(setInterval(save, 30000)); _intervals.push(setInterval(tickUI, 1000));
}

function tickUI() {
  const now = Date.now(); let buffChanged = false;
  for (const k of Object.keys(state.buffs || {})) { if (state.buffs[k].until < now) { delete state.buffs[k]; buffChanged = true; } }
  const gpsEl = el('gps-text'); if (gpsEl) { gpsEl.textContent = getGoldPerSec() > 0 ? `${getGoldPerSec().toFixed(1)}/s` : '—'; }
  updateStatsUI(); 
  const mt = el('mystic-timer'); if (mt) { mt.textContent = fmtCountdown(D.getMysticRotation()[0]?.msLeft || 0); }
  if (buffChanged) { updateShopUI(); }
}