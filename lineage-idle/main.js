import * as ART from "./art.js";
// echo-adapter garante que SKILL_DEFS_ECHO, CLASS_SKILLS_ECHO e SKILL_TREE_LAYOUT_ECHO
// existam em window.EchoData antes das constantes globais serem lidas abaixo.
import "./data/echo-adapter.js";
import "./data/affixes.js";

// Carregamento síncrono de icon_index.json antes de qualquer renderização de itens
try {
  const _res = await fetch("./img/icons/icon_index.json", { cache: "no-cache" });
  if (_res.ok) {
    window.IconIndex = await _res.json();
  }
} catch (e) {
  console.warn("[main] Não foi possível carregar icon_index.json — usando fallback ICON_MAP:", e?.message || e);
}
// ========================================
// Lineage Idle - Main Game Logic
// ========================================

const SAVE_KEY = 'lineageIdleSave_v2';
// Lazy accessor — window.GameData is set by items.js side-effects which
// run at module-evaluation time.  Accessing D() instead of D ensures we
// always read the value AFTER all imports have been fully evaluated.
const D = () => window.GameData;

// --------------------------- RACES & CLASSES ---------------------------
const RACE_BASE_ATTRIBUTES = {
  // Fighters
  darkelf_fighter: { str: 41, con: 32, dex: 34, wit: 12, int: 25, men: 26 },
  human_fighter:   { str: 40, con: 43, dex: 30, wit: 11, int: 21, men: 25 },
  elf_fighter:     { str: 36, con: 36, dex: 35, wit: 14, int: 23, men: 26 },
  orc_fighter:     { str: 40, con: 47, dex: 26, wit: 12, int: 18, men: 27 },
  dwarf_fighter:   { str: 39, con: 45, dex: 29, wit: 10, int: 20, men: 27 },
  kamael_male:     { str: 41, con: 31, dex: 33, wit: 11, int: 29, men: 25 },
  kamael_female:   { str: 39, con: 30, dex: 35, wit: 11, int: 28, men: 27 },

  // Mages
  darkelf_mage:    { str: 23, con: 24, dex: 23, wit: 19, int: 44, men: 37 },
  human_mage:      { str: 22, con: 27, dex: 21, wit: 20, int: 41, men: 39 },
  elf_mage:        { str: 21, con: 25, dex: 24, wit: 23, int: 37, men: 40 },
  orc_mage:        { str: 25, con: 31, dex: 20, wit: 21, int: 31, men: 42 }
};

// ========== ECHO OF ELEMENTS UPDATE ==========
// All class/skill data loaded from lineage-idle/data/classes_echo.js
const RACES = (typeof window !== 'undefined' && window.EchoData) ? window.EchoData.RACES_ECHO : {};
const CLASSES = (typeof window !== 'undefined' && window.EchoData) ? window.EchoData.CLASSES_ECHO : {};
const SKILL_DEFS = (typeof window !== 'undefined' && window.EchoData) ? window.EchoData.SKILL_DEFS_ECHO : {};
const SKILL_REQS = (typeof window !== 'undefined' && window.EchoData) ? window.EchoData.SKILL_REQS_ECHO : {};
const SKILL_TREE_LAYOUT = (typeof window !== 'undefined' && window.EchoData) ? window.EchoData.SKILL_TREE_LAYOUT_ECHO : {};
const TIER_NAMES = ['Foundation', 'Discipline', 'Mastery', 'Ascendancy', 'Legend'];
const DWARF_CLASS = CLASSES.artisan;
const KAMAEL_CLASS = CLASSES.soulbreaker;
// ==============================================

// --------------------------- ZONES & MONSTERS ---------------------------
const SAGAS = [
  { id: 'interlude', name: 'Interlude', level: 0, unlocksAt: 0, zones: ['talkingIsland', 'elvenForest', 'darkForest', 'orcVillage', 'dwarvenMine', 'kamaelLair', 'ruinedOutpost', 'howlingMoor'] },
  { id: 'prelude', name: 'Prelude of War', level: 1, unlocksAt: 20, zones: ['giranOutskirts', 'orcenRuins', 'forsakenCrypt', 'blackCitadel'] },
  { id: 'saga1', name: 'Saga I: The Awakening', level: 2, unlocksAt: 40, zones: ['gludioCastle', 'wolfMountain', 'riftOfTheVoid', 'emeraldGrove', 'underworldGate'] },
  { id: 'saga2', name: 'Saga II: The Shadow', level: 3, unlocksAt: 76, zones: ['adenCity', 'dragonValley'] },
  { id: 'saga3', name: 'Saga III: Realm of the Gods', level: 4, unlocksAt: 85, zones: ['imperialTomb', 'antharasLair', 'forgeOfGods'] }
];

const ZONES = {
  talkingIsland: { name: 'Talking Island', level: 1, monsters: ['goblin', 'goblinThief', 'armoredGoblin', 'goblinMage'], boss: 'goblinKing', shop: 'talkingIsland', town: true },
  elvenForest: { name: 'Elven Forest', level: 3, monsters: ['wolf', 'rootWitch'], boss: 'deathTrent', shop: 'talkingIsland' },
  darkForest: { name: 'Dark Forest', level: 5, monsters: ['spider', 'swampWalker'], boss: 'spider', shop: 'talkingIsland' },
  orcVillage: { name: 'Orc Village', level: 7, monsters: ['goblin', 'orc'], boss: 'orc', shop: 'talkingIsland' },
  dwarvenMine: { name: 'Dwarven Mine', level: 9, monsters: ['kobold'], boss: 'koboldLeader', shop: 'talkingIsland' },
  kamaelLair: { name: 'Kamael Lair', level: 11, monsters: ['kamaelScout'], boss: 'kamaelScout', shop: 'talkingIsland' },
  ruinedOutpost:   { name: 'Ruined Outpost', level: 15, monsters: ['goblinThief', 'orc', 'shadowMercenary'], boss: 'shadowMercenary', shop: 'talkingIsland', town: false },
  howlingMoor:     { name: 'Howling Moor', level: 20, monsters: ['direWolf', 'babyTiamat', 'crimsonBabyDragon', 'ancientSatyr'], boss: 'alphaWolf', shop: 'gludioCastle', town: false },
  giranOutskirts: { name: 'Giran Outskirts', level: 25, monsters: ['skeleton', 'deathRider'], boss: 'minotaurKnight', shop: 'giranOutskirts', town: true },
  orcenRuins: { name: 'Orcen Ruins', level: 30, monsters: ['orc', 'cursedWarrior'], boss: 'goblinKing', shop: 'giranOutskirts' },
  forsakenCrypt:   { name: 'Forsaken Crypt', level: 35, monsters: ['darkMage', 'corpseWorm', 'furiousSouls', 'cryptVampire', 'devilBone'], boss: 'cryptLord', shop: 'gludioCastle', town: false },
  blackCitadel:    { name: 'Black Citadel', level: 40, monsters: ['deathKnight', 'deathWizard', 'blackDragon'], boss: 'flamingDemonLord', shop: 'dragonValley', town: true },
  gludioCastle: { name: 'Gludio Castle', level: 45, monsters: ['knight', 'cursedKnight'], boss: 'cursedKnight', shop: 'gludioCastle', town: true },
  wolfMountain: { name: 'Wolf Mountain', level: 48, monsters: ['wolf', 'direWolf'], boss: 'alphaWolf', shop: 'gludioCastle' },
  riftOfTheVoid:   { name: 'Rift of the Void', level: 50, monsters: ['voidCreature', 'voidBrute', 'voidStalker', 'beholder'], boss: 'voidDragonLord', shop: 'dragonValley', town: false },
  emeraldGrove:    { name: 'Emerald Grove', level: 60, monsters: ['emeraldSnake', 'emeraldDragon'], boss: 'fafurion', shop: 'dragonValley', town: false },
  underworldGate:  { name: 'Gates of the Underworld', level: 70, monsters: ['blazingWerewolf', 'swiftBlaze'], boss: 'cerberus', shop: 'dragonValley', town: false },
  adenCity: { name: 'Aden City', level: 76, monsters: ['knight', 'mage'], boss: 'knight', shop: 'adenCity', town: true },
  dragonValley: { name: 'Dragon Valley', level: 80, monsters: ['dragon', 'dragonKnight', 'frostKnight', 'frostLordDragon'], boss: 'lindvior', shop: 'dragonValley', town: true },
  imperialTomb:    { name: 'Imperial Tomb', level: 85, monsters: ['tombGuardian', 'sepulcherArchon', 'undeadKnight', 'lichLord'], boss: 'deathKing', shop: 'adenCity', town: false },
  antharasLair:    { name: 'Antharas\' Lair', level: 90, monsters: ['caveDrake', 'magmaBeast', 'earthDrake'], boss: 'antharas', shop: 'dragonValley', town: false },
  forgeOfGods:     { name: 'Forge of the Gods', level: 95, monsters: ['valakasMinion', 'lavaGolem', 'flameArchon', 'flameGiantDragon', 'vulcanLord'], boss: 'valakas', shop: 'dragonValley', town: false }
};

const MONSTERS = {
  goblin: { name: 'Goblin', hp: 30, atk: 5, def: 2, eva: 2, matk: 0, mdef: 0, xp: 10, sp: 1, gold: [5, 15] },
  armoredGoblin: { name: 'Armored Goblin', hp: 45, atk: 7, def: 5, eva: 2, matk: 0, mdef: 1, xp: 14, sp: 1, gold: [7, 18] },
  goblinMage: { name: 'Goblin Mage', hp: 35, atk: 4, def: 2, eva: 3, matk: 12, mdef: 5, xp: 15, sp: 1, gold: [8, 20] },
  goblinThief: { name: 'Goblin Thief', lvl: 2, hp: 45, atk: 9, def: 3, eva: 12, xp: 18, sp: 1, gold: [8, 20], element: 'none', traits: ['ambush', 'packTactics'], stealsGold: 0.15 },
  goblinKing: { name: 'Goblin King', hp: 120, atk: 15, def: 8, eva: 3, matk: 0, mdef: 0, xp: 50, sp: 5, gold: [25, 50], boss: true },

  wolf: { name: 'Wolf', hp: 45, atk: 8, def: 1, eva: 5, matk: 0, mdef: 0, xp: 15, sp: 1, gold: [8, 20] },
  rootWitch: { name: 'Root Witch', hp: 55, atk: 10, def: 3, eva: 4, matk: 15, mdef: 8, xp: 22, sp: 2, gold: [12, 25] },
  deathTrent: { name: 'Death Treant', hp: 200, atk: 22, def: 12, eva: 2, matk: 10, mdef: 10, xp: 80, sp: 6, gold: [40, 85], boss: true },

  spider: { name: 'Spider', hp: 35, atk: 6, def: 1, eva: 8, matk: 0, mdef: 0, xp: 12, sp: 1, gold: [6, 18] },
  swampWalker: { name: 'Swamp Walker', hp: 85, atk: 14, def: 6, eva: 5, matk: 8, mdef: 6, xp: 32, sp: 2, gold: [15, 32] },

  orc: { name: 'Orc', lvl: 5, hp: 140, atk: 20, def: 10, eva: 4, xp: 45, sp: 2, gold: [20, 45], element: 'none', traits: ['enrage'] },

  kobold: { name: 'Kobold', hp: 25, atk: 4, def: 3, eva: 3, matk: 0, mdef: 0, xp: 8, sp: 1, gold: [4, 12] },
  koboldLeader: { name: 'Kobold Leader', lvl: 8, hp: 260, atk: 30, def: 14, eva: 8, xp: 110, sp: 4, gold: [60, 120], element: 'none', traits: ['packLeader', 'trap'], elite: true },

  kamaelScout: { name: 'Kamael Scout', hp: 55, atk: 12, def: 2, eva: 8, matk: 0, mdef: 0, xp: 25, sp: 2, gold: [12, 30] },

  shadowMercenary: { name: 'Shadow Mercenary', hp: 280, atk: 32, def: 15, eva: 10, xp: 130, sp: 4, gold: [70, 140], elite: true },

  direWolf: { name: 'Dire Wolf', lvl: 12, hp: 420, atk: 52, def: 18, eva: 18, xp: 220, sp: 3, gold: [80, 160], element: 'none', traits: ['bleed', 'firstStrike'], atkSpd: 1.35 },
  babyTiamat: { name: 'Baby Tiamat', hp: 500, atk: 58, def: 22, eva: 10, matk: 35, mdef: 20, xp: 280, sp: 4, gold: [100, 200] },
  ancientSatyr: { name: 'Ancient Satyr', hp: 550, atk: 62, def: 24, eva: 12, xp: 300, sp: 5, gold: [110, 220] },
  crimsonBabyDragon: { name: 'Crimson Baby Dragon', lvl: 15, hp: 620, atk: 70, def: 26, eva: 10, xp: 340, sp: 5, gold: [120, 240], element: 'fire', resist: { fire: 0.75, water: 1.3 }, traits: ['fireBreath'] },
  alphaWolf: { name: 'Alpha Wolf', lvl: 18, hp: 900, atk: 85, def: 30, eva: 20, xp: 520, sp: 6, gold: [180, 340], element: 'none', traits: ['packLeader', 'bleed', 'howl'], elite: true },

  skeleton: { name: 'Skeleton', hp: 50, atk: 9, def: 5, eva: 1, matk: 0, mdef: 0, xp: 18, sp: 2, gold: [8, 22] },
  deathRider: { name: 'Death Rider', hp: 750, atk: 95, def: 35, eva: 12, xp: 600, sp: 7, gold: [200, 400] },
  minotaurKnight: { name: 'Minotaur Knight', hp: 1400, atk: 120, def: 48, eva: 6, xp: 950, sp: 9, gold: [300, 600], boss: true },

  cursedWarrior: { name: 'Cursed Warrior', hp: 850, atk: 105, def: 40, eva: 8, xp: 750, sp: 8, gold: [220, 450] },

  darkMage: { name: 'Dark Mage', lvl: 25, hp: 1150, atk: 145, def: 28, eva: 14, xp: 1100, sp: 8, gold: [300, 600], element: 'dark', magic: true, resist: { dark: 0.5, holy: 1.5 }, traits: ['curse', 'manaBurn'], atkSpd: 0.75 },
  corpseWorm: { name: 'Corpse Worm', hp: 1300, atk: 110, def: 50, eva: 4, xp: 1200, sp: 8, gold: [280, 550] },
  furiousSouls: { name: 'Furious Souls', hp: 1000, atk: 130, def: 30, eva: 16, matk: 90, mdef: 45, xp: 1150, sp: 8, gold: [300, 580] },
  cryptVampire: { name: 'Crypt Vampire', hp: 1800, atk: 160, def: 45, eva: 18, xp: 1600, sp: 11, gold: [400, 800], traits: ['lifesteal'] },
  devilBone: { name: 'Devil Bone', lvl: 28, hp: 2400, atk: 120, def: 78, eva: 3, xp: 1400, sp: 10, gold: [350, 700], element: 'dark', resist: { physical: 0.7, magic: 1.25 }, traits: ['boneArmor', 'reassemble'] },
  cryptLord: { name: 'Crypt Lord', hp: 3800, atk: 210, def: 85, eva: 8, xp: 3000, sp: 16, gold: [800, 1600], boss: true },

  deathKnight: { name: 'Death Knight', lvl: 35, boss: true, hp: 4200, atk: 210, def: 90, eva: 12, xp: 3200, sp: 15, gold: [900, 1800], element: 'dark', resist: { dark: 0.3, holy: 1.6 }, traits: ['lifesteal', 'deathCoil', 'enrage'] },
  deathWizard: { name: 'Death Wizard', hp: 3200, atk: 90, def: 40, eva: 10, matk: 240, mdef: 95, xp: 3100, sp: 15, gold: [850, 1700] },
  blackDragon: { name: 'Black Dragon', hp: 5500, atk: 290, def: 110, eva: 10, xp: 5000, sp: 20, gold: [1500, 3000], boss: true },
  flamingDemonLord: { name: 'Flaming Demon Lord', hp: 8500, atk: 350, def: 130, eva: 12, xp: 7500, sp: 25, gold: [2200, 4500], boss: true },

  knight: { name: 'Knight', hp: 150, atk: 20, def: 12, eva: 2, matk: 0, mdef: 5, xp: 60, sp: 3, gold: [30, 60] },
  cursedKnight: { name: 'Cursed Knight', hp: 2800, atk: 180, def: 95, eva: 6, xp: 2500, sp: 14, gold: [700, 1400] },

  voidCreature: { name: 'Void Creature', lvl: 42, boss: true, hp: 5600, atk: 280, def: 60, eva: 30, xp: 5200, sp: 18, gold: [1200, 2400], element: 'void', resist: { physical: 0.85, magic: 0.85 }, traits: ['voidPierce', 'phaseShift', 'distort'] },
  voidBrute: { name: 'Void Brute', hp: 6200, atk: 310, def: 100, eva: 10, xp: 6000, sp: 20, gold: [1400, 2800] },
  voidStalker: { name: 'Void Stalker', hp: 4800, atk: 340, def: 50, eva: 35, xp: 5800, sp: 19, gold: [1350, 2700] },
  beholder: { name: 'Beholder', hp: 5000, atk: 150, def: 60, eva: 15, matk: 320, mdef: 120, xp: 6200, sp: 21, gold: [1500, 3000] },
  voidDragonLord: { name: 'Void Dragon Lord', hp: 12000, atk: 420, def: 140, eva: 15, xp: 12000, sp: 30, gold: [3500, 7000], boss: true },

  emeraldSnake: { name: 'Emerald Snake', hp: 6000, atk: 320, def: 80, eva: 25, xp: 6500, sp: 20, gold: [1600, 3200] },
  emeraldDragon: { name: 'Emerald Dragon', lvl: 48, boss: true, hp: 9800, atk: 330, def: 120, eva: 8, xp: 9000, sp: 22, gold: [2500, 5000], element: 'earth', resist: { poison: 0.0, fire: 1.2 }, traits: ['poison', 'wingBuffet', 'regen'] },
  fafurion: { name: 'Fafurion Water Dragon', hp: 22000, atk: 520, def: 180, eva: 12, xp: 20000, sp: 40, gold: [6000, 12000], boss: true },

  blazingWerewolf: { name: 'Blazing Werewolf', hp: 8500, atk: 410, def: 110, eva: 22, xp: 9000, sp: 25, gold: [2200, 4400] },
  swiftBlaze: { name: 'Swift Blaze', hp: 7500, atk: 450, def: 90, eva: 30, xp: 8800, sp: 24, gold: [2100, 4200] },
  cerberus: { name: 'Cerberus', lvl: 50, boss: true, finalBoss: true, hp: 15000, atk: 400, def: 140, eva: 14, xp: 15000, sp: 30, gold: [5000, 10000], element: 'chaos', resist: { fire: 0.5, dark: 0.5, holy: 1.25 }, traits: ['multiHead', 'lifesteal', 'enrage', 'hellChain'] },

  mage: { name: 'Mage', hp: 80, atk: 5, def: 2, eva: 3, matk: 25, mdef: 8, xp: 55, sp: 3, gold: [25, 55] },

  dragon: { name: 'Dragon', hp: 300, atk: 30, def: 15, eva: 5, matk: 20, mdef: 10, xp: 120, sp: 8, gold: [80, 150], boss: true },
  dragonKnight: { name: 'Dragon Knight', hp: 500, atk: 40, def: 25, eva: 8, matk: 15, mdef: 15, xp: 200, sp: 10, gold: [150, 300], boss: true },
  frostKnight: { name: 'Frost Knight', hp: 14000, atk: 550, def: 220, eva: 10, xp: 15000, sp: 35, gold: [3500, 7000] },
  frostLordDragon: { name: 'Frost Lord Dragon', hp: 28000, atk: 650, def: 250, eva: 12, xp: 25000, sp: 45, gold: [6500, 13000], boss: true },
  lindvior: { name: 'Lindvior Wind Dragon', hp: 45000, atk: 850, def: 320, eva: 25, xp: 40000, sp: 60, gold: [10000, 20000], boss: true },

  tombGuardian:    { name: 'Tomb Guardian', lvl: 85, hp: 12000, atk: 450, def: 180, eva: 10, xp: 8500, sp: 25, gold: [1500, 3000], element: 'dark', traits: ['boneArmor'] },
  sepulcherArchon: { name: 'Sepulcher Archon', lvl: 88, hp: 16000, atk: 520, def: 210, eva: 12, xp: 11000, sp: 30, gold: [2000, 4000], element: 'dark', magic: true, traits: ['curse'] },
  undeadKnight:    { name: 'Undead Knight', lvl: 90, hp: 22000, atk: 600, def: 260, eva: 8, xp: 14000, sp: 35, gold: [2500, 5000], element: 'dark', traits: ['shieldBlock'] },
  lichLord: { name: 'Lich Lord Archmage', hp: 35000, atk: 300, def: 180, eva: 15, matk: 800, mdef: 400, xp: 32000, sp: 50, gold: [8000, 16000], boss: true },
  deathKing: { name: 'Death King Supreme', hp: 60000, atk: 980, def: 420, eva: 15, xp: 55000, sp: 75, gold: [15000, 30000], boss: true },

  caveDrake:       { name: 'Cave Drake', lvl: 91, hp: 25000, atk: 680, def: 280, eva: 15, xp: 16000, sp: 40, gold: [3000, 6000], element: 'earth', traits: ['tailWhip'] },
  magmaBeast:      { name: 'Magma Beast', lvl: 93, hp: 30000, atk: 750, def: 310, eva: 10, xp: 19000, sp: 45, gold: [3500, 7000], element: 'fire', traits: ['burn'] },
  earthDrake:      { name: 'Earth Drake', lvl: 95, hp: 38000, atk: 850, def: 350, eva: 12, xp: 23000, sp: 50, gold: [4200, 8500], element: 'earth', boss: true, traits: ['earthquake'] },
  antharas: { name: 'Antharas Earth Dragon Lord', hp: 120000, atk: 1400, def: 600, eva: 15, xp: 100000, sp: 120, gold: [25000, 50000], boss: true },

  valakasMinion: { name: 'Valakas Minion', hp: 28000, atk: 700, def: 280, eva: 12, matk: 450, mdef: 250, xp: 22000, sp: 45, gold: [4000, 8000] },
  lavaGolem:       { name: 'Lava Golem', lvl: 96, hp: 45000, atk: 920, def: 400, eva: 5, xp: 27000, sp: 55, gold: [5000, 10000], element: 'fire', traits: ['ironBody'] },
  flameArchon:     { name: 'Flame Archon', lvl: 98, hp: 55000, atk: 1050, def: 450, eva: 14, xp: 32000, sp: 60, gold: [6000, 12000], element: 'fire', magic: true, traits: ['meteor'] },
  flameGiantDragon: { name: 'Flame Giant Dragon', hp: 80000, atk: 1200, def: 500, eva: 15, xp: 60000, sp: 80, gold: [12000, 24000], boss: true },
  vulcanLord:      { name: 'Vulcan Lord', lvl: 100, hp: 75000, atk: 1250, def: 520, eva: 18, xp: 45000, sp: 80, gold: [8000, 16000], element: 'fire', boss: true, traits: ['cataclysm'] },
  valakas: { name: 'Valakas Fire Sovereign Dragon', hp: 200000, atk: 1800, def: 850, eva: 20, xp: 200000, sp: 200, gold: [50000, 100000], boss: true }
};

function getXPForLevel(lvl) { return Math.floor(100 * Math.pow(1.8, lvl - 1)); }
function getTotalXP(lvl) { let total = 0; for (let i = 1; i <= lvl; i++) total += getXPForLevel(i); return total; }

// --------------------------- STATE ---------------------------
const DEFAULT_STATE = () => ({
  race: null, class: null,
  level: 1, xp: 0, sp: 10,
  maxHp: 100, hp: 100, maxMp: 50, mp: 50,
  base: { atk: 0, def: 0, eva: 0, matk: 0, mdef: 0 },
  skills: {},
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
  totalPlaytime: 0, buffs: {}, _cds: {}, gameMode: 'idle', privilegeLevel: 0,
  autoSellRarity: 'off', craftFoundationPity: 0, warehouse: [], maxWarehouseSlots: 100
});

let state = DEFAULT_STATE();

function getMaxWarehouseSlots() {
  return Number(state.maxWarehouseSlots) || 100;
}

function formatItemDisplayName(item, def) {
  if (!item) return '';
  const itemObj = (typeof item === 'string') ? { itemId: item } : item;
  const itemDef = def || (typeof getItemDef === 'function' ? getItemDef(itemObj.itemId || itemObj.id) : (D().ALL_ITEMS ? D().ALL_ITEMS[itemObj.itemId || itemObj.id] : null));
  const baseName = itemDef ? itemDef.name : (itemObj.itemId || itemObj.id || 'Item');

  const enchant = Number(itemObj.enchant) || 0;
  const enchantStr = enchant > 0 ? `+${enchant} ` : '';
  const foundationStr = itemObj.foundation ? ' Foundation' : '';
  const rarity = itemObj.rarity;
  let rarityStr = '';
  if (rarity && rarity !== 'common' && D().RARITY && D().RARITY[rarity]) {
    rarityStr = ` [${D().RARITY[rarity].name}]`;
  }

  return `${enchantStr}${baseName}${foundationStr}${rarityStr}`;
}

// FUNÇÃO DE SAVE/LOAD COM DEEP MERGE PARA IMPEDIR RESET DE SKILLS
function save(manual = false) {
  state.lastSaveTime = Date.now();
  const data = { 
    ...state, 
    totalPlaytime: state.totalPlaytime + (Date.now() - state.startTime), 
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
    state.craftFoundationPity = Number(data.craftFoundationPity) || 0;
    state.warehouse = Array.isArray(data.warehouse)
      ? data.warehouse.filter(item => item && item.itemId && D().ALL_ITEMS[item.itemId])
      : [];
    state.maxWarehouseSlots = Number(data.maxWarehouseSlots) || 100;

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
    if (typeof window !== 'undefined' && typeof window.resetCloudSave === 'function') {
      window.resetCloudSave();
    }
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
  const rarityMult = inv.rarity ? (D().RARITY[inv.rarity]?.mult || 1) : 1;
  const enchant = inv.enchant || 0;
  const enchantMult = 1 + (enchant <= 3 ? enchant * 0.3 : (0.36 + (enchant - 3) * 0.5));
  const foundationMult = inv.foundation ? 1.3 : 1;
  const out = { ...def };
  ['atk','def','matk','mdef','hp','mp','eva','crit','speed','lifesteal'].forEach(k => {
    if (out[k]) out[k] = Math.floor(Number(out[k]) * rarityMult * enchantMult * foundationMult);
  });
  // Aplicação aditiva de afixos do tipo 'stat' por cima dos multiplicadores base
  if (Array.isArray(inv.affixes)) {
    inv.affixes.forEach(aff => {
      const defAff = D().AFFIX_MAP ? D().AFFIX_MAP[aff.id] : null;
      if (defAff && defAff.type === 'stat' && defAff.stat) {
        const k = defAff.stat;
        out[k] = (Number(out[k]) || 0) + Number(aff.value || 0);
      }
    });
  }
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

// ── ARMOR SETS & PRIMARY ATTRIBUTES SYSTEM ──
function getEquippedSetCount(setDef) {
  if (!setDef) return { count: 0, hasShield: false, totalPieceCount: 5 };
  let count = 0;
  const slots = ['armor', 'helmet', 'boots', 'gloves', 'legs'];

  for (const slot of slots) {
    const uid = state.equipment[slot];
    if (!uid) continue;
    const item = state.inventory.find(i => i.uid === uid);
    if (!item) continue;
    const def = getItemDef(item.itemId);
    if (!def) continue;
    const itemId = def.id;

    let matched = false;
    if (setDef.pieces && setDef.pieces[slot]) {
      const targetId = getItemDef(setDef.pieces[slot])?.id || setDef.pieces[slot];
      if (itemId === targetId) matched = true;
    }
    if (!matched && setDef.variantPieces && setDef.variantPieces[slot]) {
      const targetVariants = setDef.variantPieces[slot].map(v => getItemDef(v)?.id || v);
      if (targetVariants.includes(itemId)) matched = true;
    }
    if (matched) count++;
  }

  let hasShield = false;
  if (setDef.shieldPiece) {
    const shieldUid = state.equipment.shield;
    if (shieldUid) {
      const shieldItem = state.inventory.find(i => i.uid === shieldUid);
      if (shieldItem) {
        const def = getItemDef(shieldItem.itemId);
        if (def) {
          const targetShieldId = getItemDef(setDef.shieldPiece)?.id || setDef.shieldPiece;
          if (def.id === targetShieldId) hasShield = true;
        }
      }
    }
  }

  return { count, hasShield, totalPieceCount: setDef.fullPieceCount || 5 };
}

function getActiveSetBonuses() {
  const activeBonuses = [];
  const primaryStats = { str: 0, dex: 0, con: 0, int: 0, wit: 0, men: 0 };
  const statTotals = { atk: 0, def: 0, matk: 0, mdef: 0, hp: 0, mp: 0, eva: 0, crit: 0, speed: 0, lifesteal: 0, block: 0 };

  const armorSets = (typeof window !== 'undefined' && window.GameData && window.GameData.ARMOR_SETS) ? window.GameData.ARMOR_SETS : (typeof ARMOR_SETS !== 'undefined' ? ARMOR_SETS : {});

  for (const [setId, setDef] of Object.entries(armorSets)) {
    const { count, hasShield, totalPieceCount } = getEquippedSetCount(setDef);
    if (count < 2) continue;

    const thresholds = [2, 3, totalPieceCount];
    if (setDef.shieldPiece && count >= totalPieceCount && hasShield) {
      thresholds.push(totalPieceCount + 1);
    }

    const setBonusInfo = {
      setId,
      setName: setDef.name,
      equippedCount: count,
      hasShield,
      fullPieceCount: totalPieceCount,
      activeThresholds: []
    };

    for (const t of thresholds) {
      let reached = false;
      if (t <= 3 && count >= t) reached = true;
      else if (t === totalPieceCount && count >= totalPieceCount) reached = true;
      else if (t === totalPieceCount + 1 && count >= totalPieceCount && hasShield) reached = true;

      if (reached && setDef.bonuses && setDef.bonuses[t]) {
        const b = setDef.bonuses[t];
        setBonusInfo.activeThresholds.push({ threshold: t, bonus: b });

        for (const [k, v] of Object.entries(b)) {
          if (k === 'primary') {
            for (const [pk, pv] of Object.entries(v)) {
              if (primaryStats[pk] !== undefined) primaryStats[pk] += Number(pv) || 0;
            }
          } else if (statTotals[k] !== undefined) {
            statTotals[k] += Number(v) || 0;
          }
        }
      }
    }

    if (setBonusInfo.activeThresholds.length > 0) {
      activeBonuses.push(setBonusInfo);
    }
  }

  return { activeBonuses, primaryStats, statTotals };
}

function applyPrimaryStats(stats, primary) {
  if (!primary) return stats;
  const str = Number(primary.str) || 0;
  const con = Number(primary.con) || 0;
  const dex = Number(primary.dex) || 0;
  const int = Number(primary.int) || 0;
  const wit = Number(primary.wit) || 0;
  const men = Number(primary.men) || 0;

  // STR: +0.5% P.Atk (atk) por ponto
  if (str > 0) stats.atk = Math.floor(stats.atk * (1 + str * 0.005));

  // CON: +1% HP máximo por ponto
  if (con > 0) stats.maxHp = Math.floor(stats.maxHp * (1 + con * 0.01));

  // DEX: +0.3% Crit Rate + 0.2% Evasão + 0.1 Speed por ponto
  if (dex > 0) {
    stats.crit = Math.round(((stats.crit || 0) + dex * 0.3) * 10) / 10;
    stats.eva = (stats.eva || 0) + Math.floor(dex * 0.2);
    stats.speed = Math.round(((stats.speed || 1) + (dex * 0.1) / 100) * 100) / 100;
  }

  // INT: +0.5% M.Atk (matk) por ponto
  if (int > 0) stats.matk = Math.floor(stats.matk * (1 + int * 0.005));

  // WIT: +0.3% MP máximo por ponto
  if (wit > 0) stats.maxMp = Math.floor(stats.maxMp * (1 + wit * 0.003));

  // MEN: +0.5% M.Def (mdef) + 0.2% MP máximo por ponto
  if (men > 0) {
    stats.mdef = Math.floor(stats.mdef * (1 + men * 0.005));
    stats.maxMp = Math.floor(stats.maxMp * (1 + men * 0.002));
  }

  return stats;
}

function getStats() {
  const raceKey = state.race ? String(state.race).toLowerCase() : 'human';
  const race = RACES[raceKey] || RACES.human;
  const cls = getClass(state.class);
  const skills = state.skills || {};

  const sk = (id) => Number(skills[id]) || 0;
  
  const raceStats = race?.stats || {};
  const clsBase = cls?.base || {};

  let baseAtk = (Number(state.base.atk) || 0) + (Number(raceStats.atk) || 0) + (Number(clsBase.atk) || 0) + (state.level * 3) + 15;
  let baseDef = (Number(state.base.def) || 0) + (Number(raceStats.def) || 0) + (Number(clsBase.def) || 0) + (state.level * 2) + 10;
  let baseEva = (Number(state.base.eva) || 0) + (Number(raceStats.eva) || 0) + (Number(clsBase.eva) || 0);
  let baseMatk = (Number(state.base.matk) || 0) + (Number(raceStats.matk) || 0) + (Number(clsBase.matk) || 0) + (state.level * 3) + 15;
  let baseMdef = (Number(state.base.mdef) || 0) + (Number(raceStats.mdef) || 0) + (Number(clsBase.mdef) || 0) + (state.level * 2) + 8;

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
  const setRes = getActiveSetBonuses();
  const setB = setRes.statTotals;
  const primaryStats = setRes.primaryStats;

  state.primaryStats = primaryStats;

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
    if (state.buffs[k].until < now) continue;
    const b = state.buffs[k];
    if (k === 'atk') buffAtk += Number(b.amount) || 0;
    else if (k === 'def') buffDef += Number(b.amount) || 0;
    else if (k === 'speed') buffSpd += Number(b.amount) || 0;
    else if (k === 'matk') buffMatk += Number(b.amount) || 0;
    else if (k === 'warcry' || b.effect === 'warcry' || b.type === 'warcry') buffAtkMult = Math.max(buffAtkMult, Number(b.amount) || 0);
    else if (k === 'xpBoost') xpBoost = Math.max(xpBoost, Number(b.amount) || 0);
    else if (k === 'goldBoost') goldBoost = Math.max(goldBoost, Number(b.amount) || 0);
    else if (k === 'luckBoost') luckBoost = Math.max(luckBoost, Number(b.amount) || 0);
    else if (k === 'autoPotion') autoPotion = true;
  }

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

  const finalAtk  = Math.floor((baseAtk + (Number(eb.atk) || 0) + (Number(setB.atk) || 0) + buffAtk + codexB.atk + dollsB.atk + certB.atk) * atkMult * towerMult);
  const finalDef  = Math.floor((baseDef + (Number(eb.def) || 0) + (Number(setB.def) || 0) + buffDef + codexB.def + dollsB.def + certB.def) * defMult * towerMult);
  const finalEva  = Math.floor(baseEva + (Number(eb.eva) || 0) + (Number(setB.eva) || 0) + codexB.eva + dollsB.eva);
  const finalMatk = Math.floor((baseMatk + (Number(eb.matk) || 0) + (Number(setB.matk) || 0) + buffMatk + codexB.matk + dollsB.matk + certB.matk) * towerMult);
  const finalMdef = Math.floor((baseMdef + (Number(eb.mdef) || 0) + (Number(setB.mdef) || 0) + codexB.mdef + dollsB.mdef + certB.mdef) * towerMult);
  const finalCrit = (Number(eb.crit) || 0) + (Number(setB.crit) || 0) + codexB.crit + dollsB.crit + certB.crit;
  
  const lootBonus = (Number(race?.stats?.lootBonus) || 0) + (Number(cls?.base?.lootBonus) || 0) + itemLootBonus + luckBoost;
  const atkSpd    = (buffSpd + (dollsB.speed || 0)) / 100;
  const lifeDrain = ((Number(eb.lifesteal) || 0) + (dollsB.lifesteal || 0) + ((setB.lifesteal || 0) / 100));
  const craftBonus = itemCraftBonus;

  const critDmg = 1 + sk('executioner') * 0.15;
  const regenHp = sk('holylight') * 0.01;
  const meteorLvl = sk('meteor');
  const execute = sk('assassinate') * 0.02;
  const block = sk('divineshield') * 0.05 + (setB.block || 0);

  const maxHp = Math.floor(100 + state.level * 10 + sk('boostHp') * 60 + (Number(eb.hp) || 0) + (Number(setB.hp) || 0) + codexB.hp + dollsB.hp);
  const maxMp = Math.floor(50 + state.level * 5 + sk('boostMana') * 30 + (Number(eb.mp) || 0) + (Number(setB.mp) || 0) + codexB.mp + dollsB.mp);
  
  const rawStats = {
    atk: finalAtk || 1, def: finalDef || 0, eva: finalEva || 0, matk: finalMatk || 1, mdef: finalMdef || 0,
    crit: finalCrit, critDmg, loot: 1 + lootBonus, speed: 1 + (buffSpd + (setB.speed || 0)) / 100, cdr,
    atkSpd, lifeDrain, craftBonus, mpRegen: mpRegenBonus,
    xpBoost, goldBoost, luckBoost, autoPotion, maxHp, maxMp,
    regenHp, meteorLvl, execute, block
  };

  return applyPrimaryStats(rawStats, primaryStats);
}

function getBaseAttributes(raceKey, classKey) {
  const r = String(raceKey || 'human').toLowerCase();
  const c = getClass(classKey);
  const isMage = c?.archetype === 'mage';

  let key = 'human_fighter';
  if (r === 'darkelf') key = isMage ? 'darkelf_mage' : 'darkelf_fighter';
  else if (r === 'elf') key = isMage ? 'elf_mage' : 'elf_fighter';
  else if (r === 'orc') key = isMage ? 'orc_mage' : 'orc_fighter';
  else if (r === 'dwarf') key = 'dwarf_fighter';
  else if (r === 'kamael') key = 'kamael_male';
  else if (r === 'human') key = isMage ? 'human_mage' : 'human_fighter';

  return { ...(RACE_BASE_ATTRIBUTES[key] || RACE_BASE_ATTRIBUTES.human_fighter) };
}

function getZoneDropTier(zoneLevel) {
  if (zoneLevel < 15) return 'zone1';
  if (zoneLevel < 35) return 'zone2';
  if (zoneLevel < 55) return 'zone3';
  if (zoneLevel < 75) return 'zone4';
  if (zoneLevel < 90) return 'zone5';
  return 'zone6';
}

function getClass(c) {
  if (!c) return null;
  let def = CLASSES[c] || CLASSES[String(c).toLowerCase()] || null;
  if (!def) return null;
  if (def.archetype === undefined && def.parent) {
    let current = def.parent;
    const visited = new Set([c]);
    while (current && !visited.has(current)) {
      visited.add(current);
      const parentDef = CLASSES[current] || CLASSES[String(current).toLowerCase()];
      if (!parentDef) break;
      if (parentDef.archetype !== undefined) {
        return { ...def, archetype: parentDef.archetype };
      }
      current = parentDef.parent;
    }
  }
  return def;
}

function classSatisfies(playerClass, reqClass) {
  if (!reqClass) return true;
  if (!playerClass) return false;
  // Walk the full ancestor chain (up to 6 levels for 4-stage system)
  let current = playerClass;
  const visited = new Set();
  while (current && !visited.has(current)) {
    visited.add(current);
    if (current === reqClass) return true;
    const def = getClass(current);
    if (!def) break;
    if (def.archetype === reqClass) return true;
    if (def.skillTree === reqClass) return true;
    current = def.parent;
  }
  return false;
}

// ── Skill Tree Resolver (Essence 547) ─────────────────────────────────────
// Resolve a chave de árvore correta: classId exato → skillTree explícito
// → cadeia de pais → archetype. NUNCA faz fallback silencioso.
function getSkillTreeKey(classId) {
  const E = typeof window !== 'undefined' ? window.EchoData : null;
  const ST = E ? E.SKILL_TREE_LAYOUT_ECHO : SKILL_TREE_LAYOUT;
  if (!classId) return null;
  if (ST && ST[classId]) return classId;
  const visited = new Set();
  let current = classId;
  while (current && !visited.has(current)) {
    visited.add(current);
    const def = getClass(current);
    if (!def) break;
    if (def.skillTree && ST && ST[def.skillTree]) return def.skillTree;
    if (ST && ST[current]) return current;
    current = def.parent;
  }
  const rootDef = getClass(classId);
  if (rootDef?.archetype && ST && ST[rootDef.archetype]) return rootDef.archetype;
  return null;
}

// Retorna lista de skill IDs para a classe a partir de CLASS_SKILLS_ECHO.
// Se não existe, retorna null (sinal para usar classSatisfies como fallback).
function getClassSkills(classId) {
  const E = typeof window !== 'undefined' ? window.EchoData : null;
  const CS = E?.CLASS_SKILLS_ECHO;
  if (!CS) return null;
  // tenta classId direto, depois skillTree, depois pais
  if (CS[classId]) return CS[classId];
  const def = getClass(classId);
  if (def?.skillTree && CS[def.skillTree]) return CS[def.skillTree];
  let current = def?.parent;
  const visited = new Set([classId]);
  while (current && !visited.has(current)) {
    visited.add(current);
    if (CS[current]) return CS[current];
    const pd = getClass(current);
    if (pd?.skillTree && CS[pd.skillTree]) return CS[pd.skillTree];
    current = pd?.parent;
  }
  return null;
}

function getStarterSkillForClass(classId) {
  const cls = getClass(classId);
  const arch = cls?.archetype || 'fighter';
  switch (arch) {
    case 'deathknight': return 'death_spike_dk';
    case 'warg': return 'warg_will';
    case 'assassin': return 'assassin_harmony';
    case 'gunner': return 'burst_fire';
    case 'divinetemplar': return 'divine_templar_harmony';
    case 'elementweaver': return 'element_weaver_harmony';
    case 'highelf': return 'divine_templar_harmony';
    case 'bloodrose': return 'blood_rose_harmony';
    case 'soulbreaker': return 'samurai_harmony';
    case 'shinemaker': return 'shinemaker_harmony';
    case 'artisan': return 'shinemaker_harmony';
    case 'mage': return 'energy_bolt_m';
    default: return 'power_strike_f';
  }
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
    advSub = `Atingiu o Nível ${state.level}! Escolha a sua Classe Épica de Especialista.`;
  } else if (state.level >= 76 && currentStage === 2) {
    canAdvance = true;
    advTitle = '👑 3ª Troca de Classe Disponível (3rd Job)!';
    advSub = `Atingiu o Nível ${state.level}! Torne-se um Mestre Sagrado da 3ª Transferência e alcance o poder dos Noblesses!`;
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
    if (targetStage === 3) return (def.parent === state.class);
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

function getMaxInventorySlots() {
  return (state.race === 'dwarf') ? 250 : 150;
}

function addToInventory(itemId, amount = 1, rarity = null, foundation = false) {
  const def = D().ALL_ITEMS[itemId];
  if (!def) return false;

  const maxSlots = getMaxInventorySlots();

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
        if (state.inventory.length >= maxSlots) { log('Inventory full!', 'system'); return false; }
        const add = Math.min(def.stack, remaining);
        state.inventory.push({ uid: Date.now() + '_' + Math.random().toString(36).slice(2, 8), itemId, count: add, rarity: null, equipped: false, foundation: false });
        remaining -= add;
      }
    }
    return true;
  }

  const RARITY_RANK = { 'common': 1, 'uncommon': 2, 'rare': 3, 'epic': 4, 'legendary': 5, 'mythic': 6, 's': 7 };
  if (rarity && !foundation && state.autoSellRarity && state.autoSellRarity !== 'off') {
    const itemRarity = rarity.toLowerCase();
    const targetRank = RARITY_RANK[state.autoSellRarity.toLowerCase()] || 0;
    const itemRank = RARITY_RANK[itemRarity] || 1;
    if (itemRank <= targetRank) {
      const mult = D().RARITY[itemRarity] ? D().RARITY[itemRarity].mult : 1;
      const price = Math.max(1, Math.floor((def.price || 10) * 0.4 * mult)) * amount;
      state.gold += price;
      log(`🪙 [Auto-Sell] ${amount}x ${def.name} [${itemRarity.toUpperCase()}] vendido por +${price.toLocaleString()}g`, 'loot');
      return true;
    }
  }

  for (let i = 0; i < amount; i++) {
    if (state.inventory.length >= maxSlots) { log('Inventory full!', 'system'); return false; }
    const isEquip = def.slot && def.slot !== 'consumable' && def.slot !== 'material' && def.slot !== 'scroll' && def.slot !== 'powerup';
    const affixes = isEquip ? (D().rollAffixes ? D().rollAffixes(rarity || 'common') : []) : [];
    state.inventory.push({ uid: Date.now() + '_' + Math.random().toString(36).slice(2, 8), itemId, count: 1, rarity, affixes, equipped: false, foundation: !!foundation });
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

function getWarehouseCount(itemId) {
  if (!state.warehouse || !Array.isArray(state.warehouse)) return 0;
  return state.warehouse
    .filter(i => (i.itemId === itemId || getItemDef(i.itemId)?.id === itemId))
    .reduce((acc, i) => acc + (i.count || 1), 0);
}

function depositToWarehouse(uid, amount = 1) {
  const invIdx = state.inventory.findIndex(i => i.uid === uid);
  if (invIdx < 0) return false;
  const item = state.inventory[invIdx];
  if (item.equipped) {
    log('Desequipe o item antes de guardá-lo no baú.', 'system');
    return false;
  }

  const def = getItemDef(item.itemId);
  if (!def) return false;

  state.warehouse = state.warehouse || [];
  const maxSlots = getMaxWarehouseSlots();

  if (def.stack && (def.slot === 'consumable' || def.slot === 'material' || def.slot === 'scroll' || def.slot === 'powerup') && !item.rarity) {
    let remaining = Math.min(amount, item.count || 1);
    while (remaining > 0) {
      const existing = state.warehouse.find(i => i.itemId === item.itemId && !i.rarity && (i.count || 1) < def.stack);
      if (existing) {
        const space = def.stack - (existing.count || 1);
        const add = Math.min(space, remaining);
        existing.count = (existing.count || 1) + add;
        remaining -= add;
      } else {
        if (state.warehouse.length >= maxSlots) {
          log('Baú cheio!', 'system');
          return false;
        }
        const add = Math.min(def.stack, remaining);
        state.warehouse.push({ ...item, uid: Date.now() + '_' + Math.random().toString(36).slice(2, 8), count: add, equipped: false });
        remaining -= add;
      }
    }
    if (item.count > amount) {
      item.count -= amount;
    } else {
      state.inventory.splice(invIdx, 1);
    }
  } else {
    if (state.warehouse.length >= maxSlots) {
      log('Baú cheio!', 'system');
      return false;
    }
    state.inventory.splice(invIdx, 1);
    state.warehouse.push({ ...item, equipped: false });
  }

  const formattedName = formatItemDisplayName(item, def);
  log(`📦 Guardou ${formattedName} no Baú.`, 'loot');
  hideItemTooltip();
  updateInventoryUI();
  updateWarehouseUI();
  updateAllUI(); save();
  return true;
}

function withdrawFromWarehouse(uid, amount = 1) {
  state.warehouse = state.warehouse || [];
  const whIdx = state.warehouse.findIndex(i => i.uid === uid);
  if (whIdx < 0) return false;
  const item = state.warehouse[whIdx];

  const def = getItemDef(item.itemId);
  if (!def) return false;

  const maxInvSlots = getMaxInventorySlots();

  if (def.stack && (def.slot === 'consumable' || def.slot === 'material' || def.slot === 'scroll' || def.slot === 'powerup') && !item.rarity) {
    let remaining = Math.min(amount, item.count || 1);
    while (remaining > 0) {
      const existing = state.inventory.find(i => i.itemId === item.itemId && !i.rarity && (i.count || 1) < def.stack);
      if (existing) {
        const space = def.stack - (existing.count || 1);
        const add = Math.min(space, remaining);
        existing.count = (existing.count || 1) + add;
        remaining -= add;
      } else {
        if (state.inventory.length >= maxInvSlots) {
          log('Mochila cheia!', 'system');
          return false;
        }
        const add = Math.min(def.stack, remaining);
        state.inventory.push({ ...item, uid: Date.now() + '_' + Math.random().toString(36).slice(2, 8), count: add, equipped: false });
        remaining -= add;
      }
    }
    if (item.count > amount) {
      item.count -= amount;
    } else {
      state.warehouse.splice(whIdx, 1);
    }
  } else {
    if (state.inventory.length >= maxInvSlots) {
      log('Mochila cheia!', 'system');
      return false;
    }
    state.warehouse.splice(whIdx, 1);
    state.inventory.push({ ...item, equipped: false });
  }

  const formattedName = formatItemDisplayName(item, def);
  log(`🎒 Retirou ${formattedName} do Baú.`, 'loot');
  hideItemTooltip();
  updateInventoryUI();
  updateWarehouseUI();
  updateAllUI(); save();
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
  log(`Equipou ${formatItemDisplayName(item, def)}`, 'loot');
  
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

const HIGH_RARITIES = ['rare', 'epic', 'legendary', 'mythic', 's'];

function isHighValueItem(item) {
  if (!item || !item.rarity) return false;
  return HIGH_RARITIES.includes(item.rarity.toLowerCase());
}

function sellItem(uid) {
  const idx = state.inventory.findIndex(i => i.uid === uid);
  if (idx < 0) return;
  const item = state.inventory[idx];
  if (item.equipped) { log('Unequip first!', 'system'); return; }
  const def = D().ALL_ITEMS[item.itemId];
  if (isHighValueItem(item)) {
    const rarityName = D().RARITY[item.rarity]?.name || item.rarity;
    if (!confirm(`⚠️ Deseja realmente VENDER o item valioso "${def.name}" [${rarityName}]?`)) {
      return;
    }
  }
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
  if (!def) return;
  const targetSlot = resolveEquipSlot(def.slot);
  const isEquip = (def.slot && def.slot !== 'consumable' && def.slot !== 'material' && def.slot !== 'scroll' && def.slot !== 'powerup') || ALL_EQUIP_SLOTS.includes(targetSlot);
  if (!isEquip) return;

  if (isHighValueItem(item)) {
    const rarityName = D().RARITY[item.rarity]?.name || item.rarity;
    if (!confirm(`⚠️ Deseja realmente SUCATEAR o item valioso "${def.name}" [${rarityName}]?`)) {
      return;
    }
  }

  const reqLvl = def.req ? def.req.level : 1;
  const grade = getItemGrade(reqLvl);
  const rarityMult = item.rarity ? (D().RARITY[item.rarity]?.mult || 1) : 1;

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
  log(`🔨 Desmontou ${def.name} em ${amount}x ${D().ALL_ITEMS[matId]?.name || matId}`, 'loot');
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
  const toDelete = Array.from(set);
  
  const hasHighValue = toDelete.some(uid => {
    const item = state.inventory.find(i => i.uid === uid);
    return isHighValueItem(item);
  });
  if (hasHighValue) {
    if (!confirm(`⚠️ A seleção contém itens de alta raridade (Raro ou superior). Deseja realmente vender?`)) {
      return;
    }
  }

  let totalGold = 0, count = 0;
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
  const toDelete = Array.from(set);

  const hasHighValue = toDelete.some(uid => {
    const item = state.inventory.find(i => i.uid === uid);
    return isHighValueItem(item);
  });
  if (hasHighValue) {
    if (!confirm(`⚠️ A seleção contém itens de alta raridade (Raro ou superior). Deseja realmente sucatear?`)) {
      return;
    }
  }
  
  let count = 0;
  const yieldSummary = {};

  for (const uid of toDelete) {
    const item = state.inventory.find(i => i.uid === uid);
    if (!item || item.equipped) continue;
    const def = D().ALL_ITEMS[item.itemId];
    if (!def) continue;
    
    const targetSlot = resolveEquipSlot(def.slot);
    const isEquip = (def.slot && def.slot !== 'consumable' && def.slot !== 'material' && def.slot !== 'scroll' && def.slot !== 'powerup') || ALL_EQUIP_SLOTS.includes(targetSlot);
    if (!isEquip) continue;
    
    const reqLvl = def.req ? def.req.level : 1;
    const grade = getItemGrade(reqLvl);
    const rarityMult = item.rarity ? (D().RARITY[item.rarity]?.mult || 1) : 1;

    let matId = 'iron_ore';
    if (grade === 'S Grade') matId = 'crystal_s';
    else if (grade === 'A Grade') matId = 'crystal_a';
    else if (grade === 'B Grade') matId = 'crystal_b';
    else if (grade === 'C Grade') matId = 'crystal_c';
    else if (grade === 'D Grade') matId = 'crystal_d';
    else matId = (def.slot === 'weapon') ? 'iron_ore' : 'cloth';

    const matYield = Math.max(1, Math.floor((reqLvl / 5 + 1) * rarityMult));
    yieldSummary[matId] = (yieldSummary[matId] || 0) + matYield;
    
    const qty = item.count || 1;
    removeFromInventory(uid, qty);
    count += qty;
  }

  for (const [mId, qty] of Object.entries(yieldSummary)) {
    addToInventory(mId, qty, null);
  }
  
  set.clear();
  log(`🔨 Desmontou ${count} equipamento(s) selecionado(s)!`, 'loot');
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
  } else if (def.type === 'raceClassChange' || item.itemId === 'scroll_race_class_change') {
    if (typeof window !== 'undefined' && typeof window.onOpenRaceClassChangeModal === 'function') {
      window.onOpenRaceClassChangeModal({
        scrollUid: uid,
        charName: state.charName || 'Aventureiro',
        race: state.race || 'human',
        class: state.class || 'fighter'
      });
    } else {
      log('Abra o menu de Reespecialização para utilizar o Scroll of Race & Class Change.', 'system');
    }
    return;
  } else if (def.type === 'resurrect') { log('Scrolls auto-use on death.', 'system'); return; } 
  else { log(`Used ${def.name}`, 'heal'); }
  
  if (item.count > 1) item.count--; else state.inventory.splice(idx, 1);
  updateAllUI(); save();
}

window.executeRaceClassChange = (scrollUid, newRace, newClass) => {
  if (scrollUid) {
    const idx = state.inventory.findIndex(i => i.uid === scrollUid);
    if (idx >= 0) {
      if (state.inventory[idx].count > 1) state.inventory[idx].count--;
      else state.inventory.splice(idx, 1);
    }
  }

  // 1. Unequip all equipped items safely back to inventory
  const ALL_SLOTS = ['weapon', 'shield', 'helmet', 'armor', 'legs', 'gloves', 'boots', 'necklace', 'earring1', 'earring2', 'ring', 'ring2', 'belt', 'cloak', 'talisman', 'agathion', 'hair', 'hair2'];
  if (state.equipment) {
    for (const slot of ALL_SLOTS) {
      state.equipment[slot] = null;
    }
  }

  // 2. Refund all spent SP
  let refundedSp = 0;
  if (state.skills) {
    for (const [skillId, lvl] of Object.entries(state.skills)) {
      const level = Number(lvl) || 0;
      for (let l = 1; l <= level; l++) {
        const sDef = (typeof SKILL_DEFS !== 'undefined') ? SKILL_DEFS[skillId] : null;
        const cost = sDef ? (sDef.cost * l) : (5 * l);
        refundedSp += cost;
      }
    }
  }
  state.sp = (Number(state.sp) || 0) + refundedSp;

  // 3. Reset all skills
  const resetSkills = {};
  if (typeof SKILL_DEFS !== 'undefined') {
    for (const k of Object.keys(SKILL_DEFS)) {
      resetSkills[k] = 0;
    }
  }
  state.skills = resetSkills;

  // 4. Update Race and Class
  state.race = newRace;
  state.class = newClass;

  // 5. Grant initial class skill
  const starterSkill = getStarterSkillForClass(newClass);
  state.skills[starterSkill] = 1;
  state.selectedSkill = starterSkill;

  // 6. Recalculate base stats
  const raceObj = RACES[newRace] || RACES.human;
  state.base = { ...(raceObj.stats || {}) };
  if (clsObj && clsObj.base) {
    for (const k of ['atk', 'def', 'eva', 'matk', 'mdef']) {
      state.base[k] = (state.base[k] || 0) + (clsObj.base[k] || 0);
    }
  }

  // 7. Save & Update UI
  updateAllUI();
  save();
  log(`✨ Troca de Raça & Classe realizada com sucesso para ${(raceObj.name || newRace).toUpperCase()} ${(clsObj?.name || newClass).toUpperCase()}! ${refundedSp} SP devolvidos e equipamentos guardados no inventário.`, 'rarity-legendary');
};

// --------------------------- CRAFTING ---------------------------
function getCraftLevelReq(recipeLevel) { return Math.max(1, Math.floor(recipeLevel / 10) + 1); }

function getRecipeDef(recipeId) {
  const recipesData = D().CRAFTING_RECIPES;
  if (!recipesData) return null;
  if (Array.isArray(recipesData)) {
    return recipesData.find(r => r.id === recipeId || r.itemId === recipeId) || null;
  }
  return recipesData[recipeId] || null;
}

function getRecipeMaterials(recipe) {
  if (!recipe) return [];
  if (Array.isArray(recipe.materials)) {
    return recipe.materials.map(r => ({ matId: r.itemId || r.id, qty: r.count || r.qty || 1 }));
  }
  if (Array.isArray(recipe.reqs)) {
    return recipe.reqs.map(r => ({ matId: r.id || r.itemId, qty: r.count || r.qty || 1 }));
  }
  if (recipe.materials && typeof recipe.materials === 'object') {
    return Object.entries(recipe.materials).map(([matId, qty]) => ({ matId, qty: Number(qty) || 1 }));
  }
  if (recipe.reqs && typeof recipe.reqs === 'object') {
    return Object.entries(recipe.reqs).map(([matId, qty]) => ({ matId, qty: Number(qty) || 1 }));
  }
  return [];
}

function canCraft(recipeId) {
  const recipe = getRecipeDef(recipeId);
  if (!recipe) return false;
  if (recipe.level && getCraftLevelReq(recipe.level) > state.craftLevel) return false;
  const mats = getRecipeMaterials(recipe);
  if (mats.length === 0) return false;
  for (const { matId, qty } of mats) {
    if (getInventoryCount(matId) < qty) return false;
  }
  return true;
}

function craftItem(recipeId) {
  const recipe = getRecipeDef(recipeId);
  if (!recipe || !canCraft(recipeId)) { log('Missing materials or craft level too low.', 'system'); return; }
  const mats = getRecipeMaterials(recipe);
  for (const { matId, qty } of mats) {
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

  const pityBonus = (state.craftFoundationPity || 0) * 0.001;
  const foundationChance = 0.05 + pityBonus;
  const isFoundation = Math.random() < foundationChance;

  if (isFoundation) {
    state.craftFoundationPity = 0;
  } else {
    state.craftFoundationPity = (state.craftFoundationPity || 0) + 1;
  }

  addToInventory(recipeId, 1, rarity, isFoundation);
  const itemDef = getItemDef(recipeId);
  const formattedName = formatItemDisplayName({ itemId: recipeId, rarity, foundation: isFoundation }, itemDef);

  if (isFoundation) {
    log(`✨ FOUNDATION! Você forjou um ${formattedName}!`, 'rarity-foundation');
    if (typeof floatText === 'function') {
      floatText(`✨ FOUNDATION!`, 'float-jackpot');
    }
  } else {
    log(`Crafted ${formattedName}!`, 'rarity-' + rarity);
  }

  state.craftXp += 10 + (itemDef?.tier || 1) * 5;
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

  const pStats = state.primaryStats || {};
  const hasPrimary = (pStats.str > 0 || pStats.dex > 0 || pStats.con > 0 || pStats.int > 0 || pStats.wit > 0 || pStats.men > 0);
  const primBox = el('l2inv-primary-box');
  if (primBox) {
    primBox.style.display = hasPrimary ? 'block' : 'none';
    if (hasPrimary) {
      const strEl = el('l2stat-str'); if (strEl) strEl.textContent = pStats.str || 0;
      const dexEl = el('l2stat-dex'); if (dexEl) dexEl.textContent = pStats.dex || 0;
      const conEl = el('l2stat-con'); if (conEl) conEl.textContent = pStats.con || 0;
      const intEl = el('l2stat-int'); if (intEl) intEl.textContent = pStats.int || 0;
      const witEl = el('l2stat-wit'); if (witEl) witEl.textContent = pStats.wit || 0;
      const menEl = el('l2stat-men'); if (menEl) menEl.textContent = pStats.men || 0;
    }
  }

  const defaultSlotIcons = {
    hair: '👒', gloves: '🧤', weapon: '⚔️', necklace: '📿', ring: '💍', belt: '🪢',
    helmet: '⛑️', armor: '🛡️', legs: '👖', shield: '🛡️', boots: '👢',
    hair2: '🎭', earring1: '💎', earring2: '💎', ring2: '💍', cloak: '🧥', talisman: '🔮', agathion: '🧚‍♂️'
  };

  for (const slot of ALL_EQUIP_SLOTS) {
    const uid = state.equipment[slot];
    const pdSlots = qsa(`.l2inv-pd-slot[data-slot="${slot}"]`);
    const pdSlot = pdSlots && pdSlots.length ? pdSlots[0] : null;
    const elem = el(`equip-${slot}`);
    const wrap = elem && elem.closest ? elem.closest('.equip-slot') : null;
    const defaultEmoji = defaultSlotIcons[slot] || '📦';
    
    if (!uid) {
      if (pdSlot) { 
        pdSlot.className = `l2inv-pd-slot equip-slot`; 
        pdSlot.title = `${slot} · vazio`; 
        pdSlot.innerHTML = `<span class="l2inv-pd-icon">${defaultEmoji}</span><span class="l2inv-pd-item" id="pd-item-${slot}"></span>`;
      }
      if (elem) { elem.textContent = 'Empty'; elem.style.color = ''; elem.title = ''; }
      if (wrap) { wrap.style.borderColor = ''; wrap.title = slot + ' · empty'; }
      continue;
    }

    const item = state.inventory.find(i => i.uid === uid);
    if (!item) {
      state.equipment[slot] = null;
      if (pdSlot) { 
        pdSlot.className = `l2inv-pd-slot equip-slot`; 
        pdSlot.title = `${slot} · vazio`; 
        pdSlot.innerHTML = `<span class="l2inv-pd-icon">${defaultEmoji}</span><span class="l2inv-pd-item" id="pd-item-${slot}"></span>`;
      }
      if (elem) { elem.textContent = 'Empty'; elem.style.color = ''; elem.title = ''; }
      if (wrap) { wrap.style.borderColor = ''; wrap.title = slot + ' · empty'; }
      continue;
    }

    const def = D().ALL_ITEMS[item.itemId]; if (!def) continue;
    const rarity = item.rarity || 'common';
    const enchantStr = item.enchant ? `+${item.enchant}` : '';
    const full = formatItemDisplayName(item, def);
    const col = item.rarity ? D().RARITY[rarity]?.color : 'var(--gilt)';

    if (pdSlot) {
      pdSlot.className = `l2inv-pd-slot equip-slot has-item rarity-${rarity}`;
      pdSlot.title = `${enchantStr ? enchantStr + ' ' : ''}${def.name} (${slot})`;
      pdSlot.innerHTML = `${getItemIcon(def)}<span class="l2inv-pd-item" id="pd-item-${slot}">${enchantStr}</span>`;
      pdSlot.onmouseenter = (e) => { cancelHideTooltip(); showItemTooltip(item, e); };
      pdSlot.onmouseleave = scheduleHideTooltip;
      pdSlot.onclick = (e) => { e.stopPropagation(); cancelHideTooltip(); showItemTooltip(item, e); };
      pdSlot.ondblclick = (e) => { e.stopPropagation(); unequipItem(slot); };
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
  const cols = 5;

  const pDef = getClass(state.class);
  const activeTreeClass = pDef?.skillTree || pDef?.archetype || 'fighter';

  const pos = {};

  // Use CLASS_SKILLS_ECHO (Essence 547 skill pack) when available for this class.
  // Fallback to legacy classSatisfies filter for classes not covered by the pack.
  const classSkillIds = getClassSkills(state.class);
  let classSkills;
  if (classSkillIds && classSkillIds.length > 0) {
    // Skill pack path: show exactly the skills defined for this class
    classSkills = classSkillIds
      .map(id => [id, SKILL_DEFS[id]])
      .filter(([id, def]) => def != null);
  } else {
    // Legacy fallback path
    classSkills = Object.entries(SKILL_DEFS).filter(([id, def]) => classSatisfies(state.class, def.classReq));
  }

  const skillsByTier = { 0: [], 1: [], 2: [], 3: [], 4: [] };
  for (const [id, def] of classSkills) {
    const t = def.tier !== undefined ? def.tier : 0;
    if (skillsByTier[t]) skillsByTier[t].push([id, def]);
  }

  // First pass: assign positions from explicit layout
  const usedPositions = new Set();
  for (let c = 0; c < 5; c++) {
    const list = skillsByTier[c] || [];
    list.forEach(([id, def]) => {
      const explicit = SKILL_TREE_LAYOUT[id];
      if (explicit && explicit.col !== undefined && explicit.row !== undefined) {
        const col = explicit.col;
        const row = explicit.row;
        pos[id] = {
          x: TREE_PAD_X + col * TREE_NODE_W + TREE_NODE_W / 2,
          y: TREE_PAD_Y + row * TREE_NODE_H + TREE_NODE_H / 2
        };
        usedPositions.add(`${col},${row}`);
      }
    });
  }
  // Second pass: auto-assign positions for skills without explicit layout
  const colCounters = [0, 0, 0, 0, 0];
  for (let c = 0; c < 5; c++) {
    const list = skillsByTier[c] || [];
    list.forEach(([id, def]) => {
      if (pos[id]) return; // already assigned
      let row = colCounters[c];
      // Find next non-colliding row in this column
      while (usedPositions.has(`${c},${row}`)) row++;
      colCounters[c] = row + 1;
      usedPositions.add(`${c},${row}`);
      pos[id] = {
        x: TREE_PAD_X + c * TREE_NODE_W + TREE_NODE_W / 2,
        y: TREE_PAD_Y + row * TREE_NODE_H + TREE_NODE_H / 2
      };
    });
  }

  const maxRow = Object.values(pos).reduce((m, p) => {
    const row = Math.round((p.y - TREE_PAD_Y - TREE_NODE_H / 2) / TREE_NODE_H);
    return Math.max(m, row);
  }, 6);
  const rows = maxRow + 2;
  const W = cols * TREE_NODE_W + TREE_PAD_X * 2;
  const H = rows * TREE_NODE_H + TREE_PAD_Y * 2;
  wrap.style.width = W + 'px'; wrap.style.height = H + 'px';

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
  
  for (const [id, def] of classSkills) {
    if (!def) continue;
    const p = pos[id]; if (!p) continue;
    const lvl = state.skills[id] || 0, max = def.max || def.maxLevel || 5;
    const node = mkEl('div'); node.className = `skill-node tier-${def.tier || 0}` + (lvl > 0 ? ' owned' : '') + (lvl === max ? ' maxed' : '');
    node.style.left = (p.x - TREE_NODE_W / 2) + 'px'; node.style.top = (p.y - TREE_NODE_H / 2) + 'px';
    node.style.width = TREE_NODE_W + 'px'; node.style.height = TREE_NODE_H + 'px';
    const reqs = SKILL_REQS[id], reqOk = !reqs || Object.entries(reqs).every(([s, v]) => s === 'level' || s === 'sp' || (state.skills[s] || 0) >= v);
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
  const max = def.max || def.maxLevel || 5;
  const maxed = lvl >= max;
  const cost = getSkillCost(id, lvl);
  const reqs = SKILL_REQS[id];
  const meetsReqs = !reqs || Object.entries(reqs).every(([s, v]) => s === 'level' || s === 'sp' || (state.skills[s] || 0) >= v);
  const lvlOk = state.level >= (def.reqLvl || 1);
  const canAfford = state.sp >= cost && !maxed;
  
  let reqHtml = (reqs && Object.keys(reqs).filter(s => s !== 'level' && s !== 'sp').length > 0)
    ? Object.entries(reqs).filter(([s]) => s !== 'level' && s !== 'sp').map(([s, v]) => { const ok = (state.skills[s] || 0) >= v; return `<span class="req ${ok ? 'ok' : 'no'}">${SKILL_DEFS[s]?.name || s} ${v}</span>`; }).join('')
    : '';
  reqHtml += `<span class="req ${lvlOk ? 'ok' : 'no'}">Level ${def.reqLvl || 1}</span>`;

  const tier = TIER_NAMES[def.tier || 0] || '';
  const _effectText = window.SkillScaling ? window.SkillScaling.buildSkillEffectText(def, lvl) : (def.info || '');
  panel.innerHTML = `
    <div class="si-head"><span class="si-icon">${def.icon || '✦'}</span><div class="si-title"><h3>${def.name}</h3><p class="si-tier">${tier} · Lv.${lvl}/${max}</p></div></div>
    <p class="si-desc">${def.desc || def.note || ''}</p><div class="si-effect">${_effectText}</div>
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

  const autoSellSel = el('auto-sell-rarity-select');
  if (autoSellSel) {
    autoSellSel.value = state.autoSellRarity || 'off';
    autoSellSel.onchange = (e) => {
      state.autoSellRarity = e.target.value;
      log(`⚙️ Auto-Venda configurado para: ${e.target.value.toUpperCase()}`, 'system');
      save();
    };
  }

  const searchInput = el('inv-search-input');
  const searchTerm = (searchInput?.value || '').trim().toLowerCase();
  if (searchInput) {
    searchInput.oninput = () => safeUiUpdate('inventory', updateInventoryUI);
  }

  const sorted = [...state.inventory]
    .filter(i => i && i.itemId && D().ALL_ITEMS[i.itemId])
    .sort((a, b) => { const da = D().ALL_ITEMS[a.itemId], db = D().ALL_ITEMS[b.itemId]; if (!da || !db) return 0; return (db.tier || 0) - (da.tier || 0); });
    
  let shown = 0;
  let selectedValue = 0;
  let salvageableCount = 0;

  for (const item of sorted) {
    const def = D().ALL_ITEMS[item.itemId]; if (!def) continue;
    if (searchTerm && !def.name.toLowerCase().includes(searchTerm)) continue;
    
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

    let isUpgrade = false;
    if (!item.equipped) {
      const targetSlot = resolveEquipSlot(def.slot);
      if (targetSlot && ALL_EQUIP_SLOTS.includes(targetSlot)) {
        const currentEquipUid = state.equipment[targetSlot];
        const currentEquipItem = currentEquipUid ? state.inventory.find(i => i.uid === currentEquipUid) : null;
        const currentDef = currentEquipItem ? D().ALL_ITEMS[currentEquipItem.itemId] : null;
        const itemPwr = (def.stats?.atk || 0) + (def.stats?.def || 0) + (def.stats?.matk || 0) + (def.stats?.mdef || 0);
        const currPwr = currentDef ? ((currentDef.stats?.atk || 0) + (currentDef.stats?.def || 0) + (currentDef.stats?.matk || 0) + (currentDef.stats?.mdef || 0)) : 0;
        if (itemPwr > currPwr) isUpgrade = true;
      }
    }

    const isSelected = selectedSet.has(item.uid);
    if (isSelected && !item.equipped) {
      const qty = item.count || 1;
      const basePrice = def.price || 10;
      const rarityDef = item.rarity ? D().RARITY[item.rarity] : null;
      const mult = rarityDef ? rarityDef.mult : 1;
      const enchantMult = 1 + (item.enchant || 0) * 0.1;
      selectedValue += Math.floor(basePrice * mult * enchantMult * 0.4) * qty;
      const isEquipItem = (def.slot && def.slot !== 'consumable' && def.slot !== 'material' && def.slot !== 'scroll' && def.slot !== 'powerup') || ALL_EQUIP_SLOTS.includes(resolveEquipSlot(def.slot));
      if (isEquipItem) {
        salvageableCount += qty;
      }
    }

    const slot = mkEl('div');
    slot.className = `inv-slot rarity-${rarity}` + (item.equipped ? ' is-equipped' : '') + (isSelected ? ' is-selected' : '');
    const qty = (item.count || 1) > 1 ? `<span class="qty">${item.count}</span>` : '';
    const tag = item.equipped ? `<span class="equipped-badge">E</span>` : (isUpgrade ? `<span class="equipped-badge" style="background:#10b981; color:#fff;" title="Upgrade de Equipamento">↑</span>` : '');
    const enchantStr = item.enchant ? `+${item.enchant} ` : '';
    const checkHtml = `<div class="slot-select-checkbox">${isSelected ? '✓' : ''}</div>`;
    slot.innerHTML = `${checkHtml}<span style="font-size:18px">${getItemIcon(def)}</span><span class="name">${enchantStr}${def.name}</span>${qty}${tag}`;
    
    // Hover tooltips for backpack items with smooth grace period
    slot.onmouseenter = (e) => { cancelHideTooltip(); showItemTooltip(item, e); };
    slot.onmouseleave = scheduleHideTooltip;

    slot.onclick = (e) => {
      e.stopPropagation();
      cancelHideTooltip();
      showItemTooltip(item, e);
      toggleSelectItem(item.uid);
    };

    slot.ondblclick = (e) => {
      e.stopPropagation();
      if (ALL_EQUIP_SLOTS.includes(resolveEquipSlot(def.slot))) {
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

  const maxSlots = getMaxInventorySlots();
  const slotCount = el('inv-slots'); if (slotCount) slotCount.textContent = `${state.inventory.length}/${maxSlots}`;
  const slotCountVal = el('inv-slots-count'); if (slotCountVal) slotCountVal.textContent = state.inventory.length;
  const slotCounterEl = el('l2inv-counter'); if (slotCounterEl) slotCounterEl.textContent = `(${state.inventory.length}/${maxSlots})`;
  const goldCount = el('gold-text'); if (goldCount) goldCount.textContent = state.gold.toLocaleString();

  if (shown === 0) grid.innerHTML = '<div class="inv-empty-msg">Nenhum item encontrado nesta categoria</div>';
}

function getAssetUrl(p) {
  if (!p) return '';
  p = String(p).replace(/\\/g, '/');
  if (p.startsWith('http://') || p.startsWith('https://') || p.startsWith('data:')) return p;
  const cleanPath = p.replace(/^\//, '');
  let baseUrl = '';
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) {
    baseUrl = import.meta.env.BASE_URL;
  } else if (typeof window !== 'undefined' && window.__BASE_URL__) {
    baseUrl = window.__BASE_URL__;
  }
  if (baseUrl) {
    if (!baseUrl.endsWith('/')) baseUrl += '/';
    return baseUrl + cleanPath;
  }
  return '/' + cleanPath;
}

function getItemDef(itemId) {
  if (!itemId) return null;
  const all = (typeof window !== 'undefined' && window.GameData && window.GameData.ALL_ITEMS) ? window.GameData.ALL_ITEMS : ((typeof D === 'function' && D()) ? D().ALL_ITEMS : {});
  if (!all) return null;
  if (all[itemId]) return all[itemId];
  const s = String(itemId);
  if (all['armor_' + s]) return all['armor_' + s];
  if (all['jewel_' + s]) return all['jewel_' + s];
  if (all['weapon_' + s]) return all['weapon_' + s];
  const stripped = s.replace(/^(armor_|jewel_|weapon_|shield_|wepoan_)/, '');
  if (all[stripped]) return all[stripped];
  if (all['armor_' + stripped]) return all['armor_' + stripped];
  if (all['jewel_' + stripped]) return all['jewel_' + stripped];
  if (all['weapon_' + stripped]) return all['weapon_' + stripped];
  return null;
}

function getItemIcon(defOrId) { 
  if (!defOrId) return '📦';
  const def = (typeof defOrId === 'string') ? getItemDef(defOrId) : (defOrId.itemId ? getItemDef(defOrId.itemId) : defOrId);
  const slot = def?.slot || (typeof defOrId === 'object' ? defOrId.slot : '') || '';
  const fallbackIcons = { weapon: '⚔️', armor: '🛡️', helmet: '⛑️', gloves: '🧤', boots: '👢', ring: '💍', earring: '💎', necklace: '📿', consumable: '🧪', material: '💎', scroll: '📜', cloak: '🧣', belt: '🎗️', hair: '👑', agathion: '🐾' }; 
  const emoji = fallbackIcons[slot] || '📦'; 

  let iconPath = def?.icon || '';
  if (!iconPath) {
    const id = typeof defOrId === 'string' ? defOrId : (def?.id || defOrId.itemId || '');
    const iconIndex = (typeof window !== 'undefined' && window.IconIndex) ? window.IconIndex : ((D() && D().ICON_MAP) ? D().ICON_MAP : {});
    iconPath = iconIndex[id] || iconIndex['armor_' + id] || iconIndex['jewel_' + id] || iconIndex['weapon_' + id] || iconIndex[String(id).replace(/^(armor_|jewel_|weapon_|shield_|wepoan_)/, '')] || '';
  }
  if (!iconPath) return emoji;
  if (!iconPath.endsWith('.png')) iconPath += '.png';
  const iconUrl = getAssetUrl(`img/icons/${iconPath}`);
  return `<img src="${iconUrl}" alt="${def?.name || ''}" class="item-icon-img" onerror="this.style.display='none';if(this.nextElementSibling)this.nextElementSibling.style.display='inline-block';" style="width:28px; height:28px; object-fit:contain; vertical-align:middle;" /><span class="item-icon-fallback" style="display:none; font-size:18px;">${emoji}</span>`; 
}


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
  const def = getItemDef(item.itemId); if (!def) return;
  const tt = el('item-tooltip'), rarity = item.rarity || 'common', mult = D().RARITY[rarity]?.mult || 1, rc = D().RARITY[rarity]?.color || '#c8a84e';
  const formattedTitle = formatItemDisplayName(item, def);
  let html = `<div class="tt-name" style="color:${rc}">${formattedTitle}</div>`;
  if (item.foundation) {
    html += `<div class="tt-foundation-badge" style="background: linear-gradient(90deg, rgba(245,158,11,0.25), rgba(217,119,6,0.35)); border: 1px solid #f59e0b; color: #fbbf24; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; margin-top: 4px; margin-bottom: 4px; display: inline-block; box-shadow: 0 0 8px rgba(245, 158, 11, 0.4);">✨ FOUNDATION (+30% Status Base)</div>`;
  }
  if (item.rarity) html += `<div class="tt-rarity" style="color:${rc}">${D().RARITY[rarity]?.name || rarity}</div>`;
  const reqLvl = def.req ? def.req.level : 1; const grade = getItemGrade(reqLvl);
  html += `<div style="color:var(--text-muted);font-size:10px;text-transform:capitalize;">${def.slot} · <span style="font-weight:bold; color:var(--gilt);">${grade}</span></div>`;
  if (def.req) html += `<div class="tt-req">Req: Lv.${def.req.level}</div>`;
  if (def.classReq) { const cls = getClass(def.classReq); const ok = classSatisfies(state.class, def.classReq); html += `<div class="tt-req ${ok?'ok':'no'}">Class: ${cls?.name || def.classReq}${ok?' ✓':''}</div>`; }
  if (def.desc) html += `<div class="tt-desc">${def.desc}</div>`;
  const enchant = item.enchant || 0;
  const enchantMult = 1 + (enchant <= 3 ? enchant * 0.12 : (0.36 + (enchant - 3) * 0.15));
  const foundationMult = item.foundation ? 1.3 : 1;

  const stats = ['atk','def','matk','mdef','hp','mp','eva','crit','speed','lifesteal'];
  let hasBaseStats = false;
  let baseStatsHtml = `<div style="margin-top:6px; padding-top:4px; border-top:1px solid rgba(255,255,255,0.15); font-size:10px; font-weight:bold; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px;">── Status Base ──</div>`;

  for (const s of stats) {
    if (def[s]) {
      hasBaseStats = true;
      const v = Math.floor(Number(def[s]) * mult * enchantMult * foundationMult);
      baseStatsHtml += `<div class="tt-stat"><span>${s.toUpperCase()}</span><span class="v">+${v}${s === 'crit' ? '%' : ''}</span></div>`;
    }
  }
  if (hasBaseStats) html += baseStatsHtml;

  if (def.craftBonus) html += `<div class="tt-stat"><span>CRAFT XP</span><span class="v">+${Math.round(def.craftBonus*mult*100)}%</span></div>`;
  if (def.lootBonus) html += `<div class="tt-stat"><span>LOOT</span><span class="v">+${Math.round(def.lootBonus*mult*100)}%</span></div>`;
  if (def.stack) html += `<div class="tt-stat"><span>Stack</span><span class="v">${item.count || 1}</span></div>`;

  // ── SEPARADOR CLARO PARA AFIXOS ESPECIAIS ──
  if (Array.isArray(item.affixes) && item.affixes.length > 0) {
    html += `<div class="tt-affixes-section" style="margin-top:8px; padding-top:6px; border-top:1px dashed #f0cd7e;">`;
    html += `<div style="font-size:10px; font-weight:bold; color:#f0cd7e; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:3px;">✦ Afixos Especiais</div>`;
    item.affixes.forEach(aff => {
      const defAff = D().AFFIX_MAP ? D().AFFIX_MAP[aff.id] : null;
      if (defAff) {
        const label = defAff.name.replace('{value}', aff.value);
        html += `<div class="tt-affix" style="color:#f0cd7e; font-size:11px; font-weight:600; margin-bottom:2px;">✦ ${label}</div>`;
      }
    });
    html += `</div>`;
  }

  // ── SEPARADOR CLARO PARA BÔNUS DE SET ──
  const setKey = def.set || (typeof getSetIdForItem === 'function' ? getSetIdForItem(def.id) : null);
  const armorSets = (typeof window !== 'undefined' && window.GameData && window.GameData.ARMOR_SETS) ? window.GameData.ARMOR_SETS : (typeof ARMOR_SETS !== 'undefined' ? ARMOR_SETS : {});
  if (setKey && armorSets[setKey]) {
    const setDef = armorSets[setKey];
    const { count, hasShield, totalPieceCount } = getEquippedSetCount(setDef);

    let setHtml = `<div class="tt-set-section" style="margin-top:8px; padding-top:6px; border-top:1px dashed #d4a744;">`;
    setHtml += `<div style="font-size:10px; font-weight:bold; color:var(--gilt-bright); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:3px; display:flex; justify-content:space-between;">`;
    setHtml += `<span>✦ Set: ${setDef.name}</span>`;
    setHtml += `<span style="color:${count >= totalPieceCount ? '#10b981' : '#a1a1aa'};">(${count}/${totalPieceCount})</span>`;
    setHtml += `</div>`;

    const thresholds = [2, 3, totalPieceCount];
    if (setDef.shieldPiece) thresholds.push(totalPieceCount + 1);

    for (const t of thresholds) {
      let isUnlocked = false;
      if (t <= 3) isUnlocked = (count >= t);
      else if (t === totalPieceCount) isUnlocked = (count >= totalPieceCount);
      else if (t === totalPieceCount + 1) isUnlocked = (count >= totalPieceCount && hasShield);

      const b = setDef.bonuses ? setDef.bonuses[t] : null;
      if (!b) continue;

      const color = isUnlocked ? '#10b981' : '#71717a';
      const label = t === totalPieceCount + 1 ? `${totalPieceCount}+Escudo` : `${t} Pçs`;

      const bonusParts = [];
      for (const [k, v] of Object.entries(b)) {
        if (k === 'primary') {
          const primParts = Object.entries(v).map(([pk, pv]) => `+${pv} ${pk.toUpperCase()}`);
          bonusParts.push(primParts.join(', '));
        } else {
          bonusParts.push(`+${v}${k === 'crit' ? '%' : ''} ${k.toUpperCase()}`);
        }
      }

      setHtml += `<div style="font-size:10px; color:${color}; margin-bottom:2px; font-weight:${isUnlocked ? '600' : '400'};">`;
      setHtml += `${isUnlocked ? '✓' : '○'} ${label}: ${bonusParts.join(', ')}`;
      setHtml += `</div>`;
    }
    setHtml += `</div>`;
    html += setHtml;
  }

  if (item.equipped) html += `<div class="tt-equipped">[ EQUIPPED ]</div>`;
  
  if (!item.equipped) {
    const targetSlot = resolveEquipSlot(def.slot);
    if (targetSlot && ALL_EQUIP_SLOTS.includes(targetSlot)) {
      const eqUid = state.equipment[targetSlot];
      const eqItem = eqUid ? state.inventory.find(i => i.uid === eqUid) : null;
      const eqDef = eqItem ? D().ALL_ITEMS[eqItem.itemId] : null;
      const eqMult = eqItem && eqItem.rarity ? (D().RARITY[eqItem.rarity]?.mult || 1) : 1;
      
      let compHtml = `<div class="tt-compare-title" style="margin-top:6px; font-size:10px; color:var(--gilt-bright); font-weight:bold; border-top:1px solid rgba(255,255,255,0.1); padding-top:4px;">VS EQUIPPED:</div>`;
      let hasComp = false;
      
      for (const s of stats) {
        const itemVal = def[s] ? Math.floor(def[s] * mult) : 0;
        const eqVal = (eqDef && eqDef[s]) ? Math.floor(eqDef[s] * eqMult) : 0;
        const diff = itemVal - eqVal;
        if (diff !== 0) {
          hasComp = true;
          const diffStr = diff > 0 ? `+${diff}` : `${diff}`;
          const color = diff > 0 ? '#10b981' : '#ef4444';
          compHtml += `<div class="tt-stat" style="font-size:10px;"><span>${s.toUpperCase()}</span><span style="color:${color}; font-weight:bold;">${diffStr}${s === 'crit' ? '%' : ''}</span></div>`;
        }
      }
      if (hasComp) html += compHtml;
    }
  }
  
  const canEquipLvl = !def.req || state.level >= def.req.level;
  const canEquipCls = classSatisfies(state.class, def.classReq);
  const canEquip = canEquipLvl && canEquipCls;
  
  const inWarehouse = (state.warehouse || []).some(i => i.uid === item.uid);
  html += `<div class="tt-actions">`;
  if (inWarehouse) {
    html += `<button class="item-action" data-action="withdraw-wh" data-uid="${item.uid}" style="background:linear-gradient(180deg,#8a6a24,#30230f); border-color:#d4a744;">🎒 Retirar do Baú</button>`;
  } else {
    if (item.equipped) html += `<button class="item-action" data-action="unequip" data-uid="${item.uid}">Unequip</button>`;
    else if (['weapon','armor','helmet','gloves','boots','ring'].includes(def.slot)) {
      html += `<button class="item-action" data-action="equip" data-uid="${item.uid}" ${!canEquip ? 'disabled title="Nível ou classe incompatível"' : ''}>Equip</button>`;
      html += `<button class="item-action" data-action="salvage" data-uid="${item.uid}">Break</button>`;
    }
    if (def.slot === 'consumable' || def.slot === 'scroll' || def.slot === 'powerup') html += `<button class="item-action" data-action="use" data-uid="${item.uid}">Use</button>`;
    const sellPrice = Math.floor((def.price||10)*0.4*(item.rarity?D().RARITY[item.rarity].mult:1));
    html += `<button class="item-action sell" data-action="sell" data-uid="${item.uid}">Sell ${sellPrice}g</button>`;
    if (!item.equipped) {
      html += `<button class="item-action" data-action="deposit-wh" data-uid="${item.uid}">📦 Guardar no Baú</button>`;
    }
  }
  html += `</div>`;
  
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
      else if (action === 'deposit-wh') { depositToWarehouse(uid); hideItemTooltip(); }
      else if (action === 'withdraw-wh') { withdrawFromWarehouse(uid); hideItemTooltip(); }
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
      <div class="tt-effect" style="margin-top:6px; color:#f0d080; font-weight:600;">${window.SkillScaling ? window.SkillScaling.buildSkillEffectText(def, lvl) : (def.info || '')}</div>
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
  const recipesData = D().CRAFTING_RECIPES || {};
  const recipesList = Array.isArray(recipesData) ? recipesData : Object.entries(recipesData).map(([k, v]) => ({ id: k, ...v }));
  for (const recipe of recipesList) {
    if (!recipe) continue;
    const recipeId = recipe.id || recipe.itemId;
    const def = getItemDef(recipeId); if (!def || (def.req && def.req.level > state.level)) continue;
    const canCraftIt = canCraft(recipeId);
    const item = mkEl('div'); item.className = 'craft-item' + (canCraftIt ? '' : ' locked');
    const reqLevel = recipe.level ? getCraftLevelReq(recipe.level) : 1;
    const mats = getRecipeMaterials(recipe);
    const matHtml = mats.map(({ matId, qty }) => {
      const have = getInventoryCount(matId);
      const matDef = getItemDef(matId);
      const matName = matDef ? matDef.name : matId;
      const cls = have >= qty ? 'have' : 'need';
      return `<span class="${cls}">${matName} ${have}/${qty}</span>`;
    }).join(', ');
    item.innerHTML = `<div class="item-info"><div class="item-name">${def.name}</div><div class="item-mats">${matHtml}</div><div class="item-desc">Req: Craft Lv.${reqLevel}</div></div><button class="item-action" data-craft="${recipeId}" ${!canCraftIt ? 'disabled' : ''}>Craft</button>`;
    list.appendChild(item);
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
  const display = el('hero-race-class-display');
  if (display) {
    const raceObj = RACES[state.race];
    const clsObj = getClass(state.class);
    const rName = raceObj ? raceObj.name : (state.race || 'Humano');
    const cName = clsObj ? clsObj.name : (state.class || 'Guerreiro');
    display.textContent = `${rName} · ${cName} (Nv. ${state.level})`;
  }
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

function hasEquipmentUpgradeAvailable() {
  if (!state.inventory) return false;
  for (const item of state.inventory) {
    if (item.equipped) continue;
    const def = D().ALL_ITEMS[item.itemId];
    if (!def) continue;
    const slot = resolveEquipSlot(def.slot);
    if (!slot || !ALL_EQUIP_SLOTS.includes(slot)) continue;
    const equippedUid = state.equipment[slot];
    const equippedItem = equippedUid ? state.inventory.find(i => i.uid === equippedUid) : null;
    const equippedDef = equippedItem ? D().ALL_ITEMS[equippedItem.itemId] : null;
    const itemPower = (def.stats?.atk || 0) + (def.stats?.def || 0) + (def.stats?.matk || 0) + (def.stats?.mdef || 0);
    const eqPower = equippedDef ? ((equippedDef.stats?.atk || 0) + (equippedDef.stats?.def || 0) + (equippedDef.stats?.matk || 0) + (equippedDef.stats?.mdef || 0)) : 0;
    if (itemPower > eqPower) return true;
  }
  return false;
}

function hasSkillUpgradeAvailable() {
  if (state.sp < 10) return false;
  for (const [sId, def] of Object.entries(SKILL_DEFS)) {
    if (!classSatisfies(state.class, def.classReq)) continue;
    const lvl = state.skills[sId] || 0;
    const maxLvl = def.max || 10;
    if (lvl >= maxLvl) continue;
    const cost = getSkillCost(sId, lvl);
    if (state.sp >= cost) return true;
  }
  return false;
}

function hasCraftAvailable() {
  const recipesData = D().CRAFTING_RECIPES;
  if (!recipesData) return false;
  const recipesList = Array.isArray(recipesData) ? recipesData : Object.values(recipesData);
  for (const recipe of recipesList) {
    if (!recipe) continue;
    const mats = getRecipeMaterials(recipe);
    if (mats.length === 0) continue;
    let canCraftThis = true;
    for (const { matId, qty } of mats) {
      if (getInventoryCount(matId) < qty) {
        canCraftThis = false;
        break;
      }
    }
    if (canCraftThis) return true;
  }
  return false;
}

function hasQuestsClaimable() {
  if (!state.quests || !state.quests.progress) return false;
  if (typeof QUEST_DEFS === 'undefined') return false;
  const allQuests = [...(QUEST_DEFS.daily || []), ...(QUEST_DEFS.weekly || [])];
  for (const qDef of allQuests) {
    if (state.quests.claimed && state.quests.claimed.includes(qDef.id)) continue;
    const current = state.quests.progress[qDef.id] || 0;
    if (current >= qDef.target) return true;
  }
  return false;
}

function updateTabBadgesUI() {
  const invBadge = el('tab-badge-inventory');
  if (invBadge) invBadge.style.display = hasEquipmentUpgradeAvailable() ? 'inline-flex' : 'none';
  
  const skillBadge = el('tab-badge-skills');
  if (skillBadge) skillBadge.style.display = hasSkillUpgradeAvailable() ? 'inline-flex' : 'none';
  
  const craftBadge = el('tab-badge-craft');
  if (craftBadge) craftBadge.style.display = hasCraftAvailable() ? 'inline-flex' : 'none';
  
  const questBadge = el('tab-badge-quests');
  if (questBadge) questBadge.style.display = hasQuestsClaimable() ? 'inline-flex' : 'none';
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
  safeUiUpdate('zone-map', renderZoneMap);
  safeUiUpdate('race-class', updateRaceClassUI);
  safeUiUpdate('combat-controls', updateCombatControlsUI);
  safeUiUpdate('subclasses', renderSubclassesUI);
  safeUiUpdate('quests', updateQuestsUI);
  safeUiUpdate('tower', updateTowerUI);
  safeUiUpdate('warehouse', updateWarehouseUI);
  safeUiUpdate('tab-badges', updateTabBadgesUI);
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

let currentBgPath = '';
let activeBgLayer = 'a';

function updateZoneBackground() {
  const currentKey = state.target && RAID_BOSSES[state.target] ? state.target : (state.zone || 'orcVillage');
  const bgPath = ZONE_BACKGROUNDS[currentKey] || '/img/' + currentKey + '.png';

  const logEl = el('log');
  const stageZone = el('stage-zone');
  const bgA = el('stage-bg-a');
  const bgB = el('stage-bg-b');

  if (bgPath !== currentBgPath) {
    currentBgPath = bgPath;
    const bgUrl = `linear-gradient(180deg, rgba(8,10,16,0.15) 0%, rgba(8,10,16,0.60) 100%), url('${bgPath}')`;
    if (bgA && bgB) {
      if (activeBgLayer === 'a') {
        bgB.style.backgroundImage = bgUrl;
        bgB.classList.add('active');
        bgA.classList.remove('active');
        activeBgLayer = 'b';
      } else {
        bgA.style.backgroundImage = bgUrl;
        bgA.classList.add('active');
        bgB.classList.remove('active');
        activeBgLayer = 'a';
      }
    }
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
  if (pn) {
    const className = getClass(state.class)?.name || '';
    pn.textContent = state.charName ? `${state.charName} (${className})` : `${RACES[state.race]?.name || ''} ${className}`.trim();
  }
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
function stageMonsterDie() { 
  const fill = el('m-hp-fill'); 
  if (fill) fill.style.width = '0%'; 
  const m = el('stage-monster'); 
  if (m) { 
    m.classList.remove('is-dying'); 
    reflow(m); 
    m.classList.add('is-dying'); 
    setTimeout(() => m.classList.remove('is-dying'), 350); 
  } 
  stageFloat('SLAIN', 'sf-slain', 'right'); 
}
function stageMonsterLunge() { const m = el('stage-monster'); if (!m) return; m.classList.remove('lunge'); reflow(m); m.classList.add('lunge'); setTimeout(() => m.classList.remove('lunge'), 440); }
function stageHeroHurt(dmg) { const h = el('stage-hero'); if (h) { h.classList.remove('hurt'); reflow(h); h.classList.add('hurt'); setTimeout(() => h.classList.remove('hurt'), 420); } stageFloat('-' + Math.round(dmg), 'sf-hurt', 'left'); }
function stageHeroBlock() { stageFloat('BLOCK', 'sf-block', 'left'); }
function stageFloat(text, cls, side) { const c = el('stage-floats'); if (!c) return; const s = mkEl('span'); s.className = 'sf ' + cls; s.textContent = text; s.style.left = (side === 'left' ? (16 + Math.random() * 8) : (68 + Math.random() * 12)) + '%'; c.appendChild(s); setTimeout(() => s.remove(), 1100); }

// --------------------------- COMBAT ---------------------------
let combatInterval = null; let combatTick = 0; let monsterAttackTimeout = null;

function getMonsterCategory(monster) {
  if (!monster) return 'humanoid';
  if (monster.category) return monster.category.toLowerCase();
  const id = String(monster.id || '').toLowerCase();
  if (id.includes('skeleton') || id.includes('death') || id.includes('crypt') || id.includes('vampire') || id.includes('lich') || id.includes('bone') || id.includes('cursed') || id.includes('corpse') || id.includes('soul')) return 'undead';
  if (id.includes('dragon') || id.includes('fafurion') || id.includes('tiamat') || id.includes('lindvior')) return 'dragon';
  if (id.includes('wolf') || id.includes('spider') || id.includes('satyr') || id.includes('snake') || id.includes('werewolf') || id.includes('cerberus') || id.includes('beast') || id.includes('trent') || id.includes('swamp')) return 'beast';
  if (id.includes('demon') || id.includes('void') || id.includes('beholder') || id.includes('devil')) return 'demon';
  return 'humanoid';
}

function getEquippedProcBonuses() {
  const procs = {
    boss_dmg: 0,
    on_kill_heal: 0,
    stun_chance: 0,
    type_dmg: { undead: 0, dragon: 0, beast: 0, demon: 0, humanoid: 0 }
  };

  if (!state.equipment) return procs;

  for (const slot of Object.keys(state.equipment)) {
    const uid = state.equipment[slot];
    if (!uid) continue;
    const inv = state.inventory.find(i => i.uid === uid);
    if (!inv || !Array.isArray(inv.affixes)) continue;

    inv.affixes.forEach(aff => {
      const defAff = D().AFFIX_MAP ? D().AFFIX_MAP[aff.id] : null;
      if (defAff && defAff.type === 'proc') {
        if (defAff.proc === 'boss_dmg') procs.boss_dmg += Number(aff.value) || 0;
        if (defAff.proc === 'on_kill_heal') procs.on_kill_heal += Number(aff.value) || 0;
        if (defAff.proc === 'stun_chance') procs.stun_chance += Number(aff.value) || 0;
        if (defAff.proc === 'type_dmg' && defAff.category && procs.type_dmg[defAff.category] !== undefined) {
          procs.type_dmg[defAff.category] += Number(aff.value) || 0;
        }
      }
    });
  }

  return procs;
}

function dealDamage(target, amount, type = 'physical') { 
  const rawAmount = Number(amount) || 0;
  const def = type === 'physical' ? (Number(target.def) || 0) : (Number(target.mdef) || 0); 
  return Math.max(1, Math.floor(rawAmount * (1 - def / (def + 50)))); 
}

const goldEvents = []; 
function trackGold(amount) { goldEvents.push({ t: Date.now(), v: amount }); }
function getGoldPerSec() { const now = Date.now(); while (goldEvents.length && now - goldEvents[0].t > 30000) goldEvents.shift(); if (!goldEvents.length) return 0; return goldEvents.reduce((s, e) => s + e.v, 0) / 30; }
function floatText(text, cls = 'float-gold') { const layer = el('float-layer'); if (!layer) return; const span = mkEl('span'); span.className = 'float-text ' + cls; span.textContent = text; const rect = layer.getBoundingClientRect(); span.style.left = (rect.width * (0.35 + Math.random() * 0.3)) + 'px'; span.style.top = (rect.height * 0.55 + (Math.random() * 60 - 30)) + 'px'; layer.appendChild(span); setTimeout(() => span.remove(), 1400); }

function checkBuffsExpire() {
  if (!state.buffs) return;
  const now = Date.now();
  for (const k of Object.keys(state.buffs)) {
    if (state.buffs[k].until < now) delete state.buffs[k];
  }
}

function attackMonster() {
  if (!state.zone || !state.target) return;
  checkBuffsExpire();
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
  const shouldAutoPot = stats.autoPotion || state.autoPotionActive;
  if (shouldAutoPot && state.hp < state.maxHp * 0.5) {
    const potIds = ['hp_potion_xl','hp_potion_l','hp_potion_m','hp_potion_s'];
    for (const pid of potIds) { 
      const it = state.inventory.find(i => i.itemId === pid && (i.count || 1) > 0); 
      if (it) { useItem(it.uid); break; } 
    }
  }
  
  if (!state._cds) state._cds = {};
  const now = combatTick * 200; 
  
  const activeSkills = [];
  const classSkillIds = getClassSkills(state.class);
  for(const [sId, lvl] of Object.entries(state.skills)) {
    const def = SKILL_DEFS[sId];
    if(lvl > 0 && def) {
      const isPassive = def.type === 'passive' || def.type === 'stat';
      if (!isPassive) {
        const belongsToClass = (classSkillIds && classSkillIds.includes(sId)) || classSatisfies(state.class, def.classReq);
        if (belongsToClass) {
          activeSkills.push({ id: sId, lvl, def });
        }
      }
    }
  }

  activeSkills.sort((a, b) => (b.def.tier || 0) - (a.def.tier || 0));

  const realNow = Date.now();
  let castedSkillThisTick = false;
  for(const skill of activeSkills) {
    const isBuff = skill.def.type === 'buff' || skill.def.type === 'harmony' || skill.def.type === 'toggle' || skill.def.effect === 'warcry';
    const isHeal = skill.def.effect === 'heal' || skill.def.type === 'heal' || skill.id.includes('heal') || skill.id.includes('curation');

    // 1. Se a habilidade é um Buff/Warcry, verifica se o efeito ainda está ativo!
    if (isBuff) {
      const activeBuff = state.buffs && (state.buffs[skill.id] || state.buffs['warcry']);
      if (activeBuff && activeBuff.until > realNow) {
        // Buff ainda ativo no personagem, não re-convoque nem solte novamente!
        continue;
      }
    }

    const cd = (skill.def.baseCd || 5000) * (1 - (stats.cdr || 0)); 
    const lastCast = state._cds[skill.id] || 0;
    if ((realNow - lastCast) >= cd) {
      state._cds[skill.id] = realNow;
      
      if (isBuff) {
        state.buffs = state.buffs || {};
        const buffDuration = 60000; // 60 segundos de efeito
        const buffAmt = window.SkillScaling ? window.SkillScaling.getSkillBuffAtLevel(skill.lvl) : (0.20 + (skill.lvl * 0.05));
        const buffObj = { amount: buffAmt, until: realNow + buffDuration, effect: 'warcry' };
        state.buffs[skill.id] = buffObj;
        state.buffs['warcry'] = buffObj;
        log(`🗣 ${skill.def.name}! ${skill.def.info || 'Buff Ativo por 60s'}`, 'rarity-rare');
        floatText(skill.def.name, 'float-epic');
      } else if (isHeal) {
        const healAmt = window.SkillScaling ? window.SkillScaling.getSkillHealAtLevel(stats.maxHp, skill.lvl) : Math.floor(stats.maxHp * (0.25 + skill.lvl * 0.05));
        state.hp = Math.min(stats.maxHp, state.hp + healAmt);
        log(`✨ ${skill.def.name}! Curou ${healAmt} HP`, 'heal');
        floatText(`+${healAmt} HP`, 'sf-heal');
      } else {
        const useMagicSkill = stats.matk > stats.atk;
        const type = useMagicSkill ? 'magic' : 'physical';
        const baseSkillDmg = useMagicSkill ? stats.matk : stats.atk;
        const skillPwr = window.SkillScaling ? window.SkillScaling.getSkillPwrAtLevel(skill.def, skill.lvl) : (Number(skill.def.pwr) || 30);
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
  
  const procBonuses = getEquippedProcBonuses();
  let affixDmgMult = 1.0;
  if (monster.boss && procBonuses.boss_dmg > 0) {
    affixDmgMult += procBonuses.boss_dmg / 100;
  }
  const monCat = getMonsterCategory(monster);
  if (procBonuses.type_dmg[monCat] > 0) {
    affixDmgMult += procBonuses.type_dmg[monCat] / 100;
  }

  damage = Math.floor(damage * affixDmgMult);

  if (procBonuses.stun_chance > 0 && Math.random() * 100 < procBonuses.stun_chance) {
    const nowStun = combatTick * 200;
    monster._stunnedUntil = nowStun + 1500;
    log(`💫 Stun Proc! ${monster.name} foi Atordoado por 1.5s`, 'rarity-rare');
    floatText('STUN!', 'float-epic');
  }

  monster.hp -= damage;
  if (monster.hp <= 0 && !castedSkillThisTick) stageMonsterDie(); else if (!castedSkillThisTick) stageMonsterHurt(damage, wasCrit);
  
  if (monster.hp <= 0) {
    if (procBonuses.on_kill_heal > 0) {
      const killHeal = Math.floor(state.maxHp * (procBonuses.on_kill_heal / 100));
      if (killHeal > 0) {
        state.hp = Math.min(state.maxHp, state.hp + killHeal);
        log(`🩸 Execução! Curou ${killHeal} HP ao derrotar ${monster.name}`, 'heal');
        floatText(`+${killHeal} HP`, 'sf-heal');
      }
    }
    if (!monster.boss && !monster.isTower && state.zone) {
      state.zoneKills = state.zoneKills || {};
      state.zoneKills[state.zone] = (state.zoneKills[state.zone] || 0) + 1;
      updateZoneKillProgressUI();
    }

    state.killStreak = (state.killStreak || 0) + 1;
    if (state.killStreak % 5 === 0 && state.killStreak >= 5) {
      stageFloat(`🔥 STREAK x${state.killStreak}!`, 'sf-crit', 'right');
    }

    const zoneLevel = ZONES[state.zone]?.level || 1;
    const zoneTier = getZoneDropTier(zoneLevel);
    const zoneMult = (D().ZONE_GOLD_MULT && D().ZONE_GOLD_MULT[zoneTier]) || 1;
    const xpMult = 1 + (stats.xpBoost || 0);
    const xpGain = Math.floor(monster.xp * xpMult), spGain = monster.sp + (monster.boss ? 2 : 0);
    state.xp += xpGain; state.sp += spGain;
    log(`Defeated ${monster.name}! +${xpGain} XP, +${spGain} SP`, 'xp');

    const baseGold = monster.gold[0] + Math.random() * (monster.gold[1] - monster.gold[0]), jackpot = Math.random() < (monster.boss ? 0.08 : 0.015);
    const goldMult = zoneMult * (1 + (stats.goldBoost || 0)) * (jackpot ? 10 : 1);
    let gold = Math.floor(baseGold * stats.loot * goldMult); if (gold < 1) gold = 1;
    state.gold += gold; trackGold(gold);
    if (jackpot) { log(`💰 JACKPOT! +${gold} Gold (×10)`, 'rarity-legendary'); floatText(`💰 +${gold}g`, 'float-jackpot'); } else { log(`+${gold} Gold`, 'loot'); if (gold >= 20) floatText(`+${gold}g`, 'float-gold'); }

    const rawDrop = D().rollDrop(zoneTier, stats.loot, !!(monster.boss || monster.elite));
    const drops = Array.isArray(rawDrop) ? rawDrop : (rawDrop && rawDrop.itemId ? [ { id: rawDrop.itemId, itemId: rawDrop.itemId, rarity: rawDrop.rarity, isEquipment: true, amount: 1 } ] : []);
    for (const drop of drops) {
      const dropId = drop.id || drop.itemId;
      const def = D().ALL_ITEMS[dropId];
      if (dropId && def) {
        const isEquip = drop.isEquipment || !['material', 'potion', 'consumable', 'scroll', 'gem'].includes(def.slot);
        if (isEquip) {
          addToInventory(dropId, 1, drop.rarity || 'common');
          const rName = D().RARITY[drop.rarity || 'common']?.name || (drop.rarity || 'common');
          log(`✦ ${def.name} [${rName}]`, 'rarity-' + (drop.rarity || 'common'));
          floatText(`✦ ${rName}!`, 'float-' + (drop.rarity || 'common'));
        } else {
          addToInventory(dropId, drop.amount || 1);
          log(`+ ${drop.amount || 1}× ${def.name}`, 'loot');
        }
      }
    }
    triggerQuestEvent('kill', 1);
    if (monster.boss || monster.elite) triggerQuestEvent('boss', 1);
    triggerQuestEvent('gold', gold);

    if (monster.isTower) {
      onTowerFloorVictory(monster.towerFloor);
    }

    checkLevelUp(); pickRandomMonster();
  } else { 
    if (monsterAttackTimeout) clearTimeout(monsterAttackTimeout);
    monsterAttackTimeout = setTimeout(() => monsterAttack(monster), 500); 
  }
  updateStatsUI();
}

function monsterAttack(monster) {
  if (!state.combatActive || !state.target || state.hp <= 0) return;
  const now = combatTick * 200;
  if (monster._stunnedUntil && monster._stunnedUntil > now) return; 
  
  const stats = getStats(); stageMonsterLunge();
  if (Math.random() < stats.eva / 100) { log(`${monster.name} missed!`, 'combat'); stageFloat('DODGE', 'sf-miss', 'left'); return; }
  
  const type = (monster.atkType === 'magical' || monster.isMage === true) ? 'magical' : 'physical';
  let damage = dealDamage({ def: stats.def, mdef: stats.mdef }, monster.atk, type);
  if (state.godMode) damage = 0;
  if (damage > 0) { state.hp -= damage; log(`${monster.name} hits for ${damage}`, 'damage'); stageHeroHurt(damage); }
  if (state.hp <= 0) { state.hp = 0; playerDeath(monster); }
  updateStatsUI();
}

// --------------------------- GM ADMIN & CHAT CONSOLE ---------------------------
function generateUid() { return 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9); }

function spawnAdminItem(itemId, qty = 1, rarity = 'common', enchant = 0, affixChoice = 'roll') {
  const def = getItemDef(itemId);
  if (!def) { log(`[Admin] Item '${itemId}' não encontrado.`, 'system'); return; }
  const realId = def.id || itemId;
  
  if (def.stack && (def.slot === 'consumable' || def.slot === 'material' || def.slot === 'scroll' || def.slot === 'powerup') && rarity === 'common') {
    addToInventory(realId, qty, null);
  } else {
    for (let i = 0; i < qty; i++) {
      const isEquip = def.slot && def.slot !== 'consumable' && def.slot !== 'material' && def.slot !== 'scroll' && def.slot !== 'powerup';
      let affixes = [];
      if (isEquip) {
        if (affixChoice === 'roll' || !affixChoice) {
          affixes = D().rollAffixes ? D().rollAffixes(rarity) : [];
        } else if (affixChoice && affixChoice !== 'none') {
          const defAff = D().AFFIX_MAP ? D().AFFIX_MAP[affixChoice] : null;
          if (defAff) {
            const val = defAff.min + Math.floor(Math.random() * (defAff.max - defAff.min + 1));
            affixes = [{ id: affixChoice, value: val }];
          }
        }
      }
      state.inventory.push({
        uid: generateUid(),
        itemId: realId,
        rarity: rarity,
        enchant: enchant,
        affixes: affixes,
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

function calcSpForLevel(lvl) {
  let total = 0;
  for (let l = 2; l <= lvl; l++) {
    total += Math.min(10, Math.floor(l * 0.8 + 1));
  }
  return total;
}

function applyAdminLevelChange(targetLevel) {
  const newLvl = Math.max(1, Math.min(100, targetLevel));
  state.level = newLvl;
  state.xp = getTotalXP(newLvl - 1);

  // 1. Concede SP proporcional ao nível + 1000 SP de bônus para testes de habilidades
  const cumulativeSp = calcSpForLevel(newLvl);
  state.sp = Math.max(state.sp || 0, cumulativeSp + 1000);

  // 2. Recalcula vida/mana e restaura ao máximo
  const stats = getStats();
  state.maxHp = stats.maxHp;
  state.maxMp = stats.maxMp;
  state.hp = state.maxHp;
  state.mp = state.maxMp;

  // 3. Atualiza Sagas e Zonas do Mapa
  let highestSaga = 0;
  for (let i = 0; i < SAGAS.length; i++) {
    if (state.level >= SAGAS[i].unlocksAt) {
      highestSaga = i;
    }
  }
  state.currentSaga = highestSaga;

  // 4. Log e feedback visual do nível
  playSfx('levelUp');
  log(`⚡ [Admin] Nível alterado para ${newLvl}! SP (+${cumulativeSp + 1000}), HP/MP, Sagas, Mapa de Caça e Habilidades sincronizados.`, 'rarity-legendary');
  floatText(`⚡ NIVEL ${newLvl}!`, 'float-jackpot');

  // 5. Atualiza todos os módulos visuais (Troca de classe, Árvore de Skills, Mapa, Subclasses, Raids, Missões)
  checkClassAdvancement();
  renderZoneMap();
  updateSkillUI();
  renderSubclassesUI();
  updateRaidUI();
  updateQuestsUI();
  renderBattlePassUI();
  updateAllUI();
  save();
}

function handleChatSubmit(inputStr) {
  if (!inputStr || !inputStr.trim()) return;
  const raw = inputStr.trim();
  const lower = raw.toLowerCase();

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
    if (!isNaN(lvl) && lvl > 0 && lvl <= 100) {
      applyAdminLevelChange(lvl);
    }
    return;
  }

  if (lower.startsWith('//gold ')) {
    const amt = parseInt(lower.replace('//gold ', '').trim());
    if (!isNaN(amt)) {
      state.gold += amt;
      triggerQuestEvent('gold', amt);
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
      updateSkillUI();
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
  if (!sel) return;
  sel.innerHTML = '';
  
  const seen = new Set();
  const list = [];
  const all = D().ALL_ITEMS || {};
  
  for (const [id, def] of Object.entries(all)) {
    if (!def || !def.name) continue;
    const primaryId = def.id || id;
    if (seen.has(primaryId)) continue;
    seen.add(primaryId);
    list.push({ id: primaryId, def });
  }
  
  list.sort((a, b) => (b.def.tier || 1) - (a.def.tier || 1) || a.def.name.localeCompare(b.def.name));
  
  for (const { id, def } of list) {
    const opt = mkEl('option');
    opt.value = id;
    const grade = getItemGrade(def.req?.level || 1);
    opt.textContent = `${def.name} [${grade}] (${def.slot} · Lv.${def.req?.level || 1})`;
    sel.appendChild(opt);
  }
}

function executeAdminCmd(cmd) {
  if (cmd === 'level20') { applyAdminLevelChange(20); }
  else if (cmd === 'level40') { applyAdminLevelChange(40); }
  else if (cmd === 'level76') { applyAdminLevelChange(76); }
  else if (cmd === 'level85') { applyAdminLevelChange(85); }
  else if (cmd === 'add5levels') { applyAdminLevelChange((state.level || 1) + 5); }
  else if (cmd === 'gold1m') { state.gold += 1000000; triggerQuestEvent('gold', 1000000); log('🪙 [Admin] +1.000.000 Ouro concedido!', 'rarity-legendary'); }
  else if (cmd === 'gold10m') { state.gold += 10000000; triggerQuestEvent('gold', 10000000); log('🪙 [Admin] +10.000.000 Ouro concedido!', 'rarity-legendary'); }
  else if (cmd === 'sp5k') { state.sp += 5000; log('✦ [Admin] +5.000 SP concedido!', 'rarity-legendary'); updateSkillUI(); }
  else if (cmd === 'sp50k') { state.sp += 50000; log('✦ [Admin] +50.000 SP concedido!', 'rarity-legendary'); updateSkillUI(); }
  else if (cmd === 'godmode') { state.godMode = !state.godMode; log(`🛡️ [Admin] Invencibilidade: ${state.godMode ? 'ATIVADO' : 'DESATIVADO'}!`, 'rarity-legendary'); }
  else if (cmd === 'healfull') { const stats = getStats(); state.hp = stats.maxHp; state.mp = stats.maxMp; log('❤️ [Admin] HP/MP Restaurados 100%!', 'rarity-legendary'); }
  else if (cmd === 'autoequip') { autoEquipBest(); }
  else if (cmd === 'resetsave') { resetSave(); }

  updateAllUI();
  save();
}

function startCombat() { if (state.combatActive) return; if (!state.zone) return; state.combatActive = true; log(`Entering ${ZONES[state.zone].name}...`, 'system'); pickRandomMonster(); combatTick = 0; state._cds = {}; if (combatInterval) clearInterval(combatInterval); combatInterval = setInterval(attackMonster, 200); }
function stopCombat() { 
  state.combatActive = false; 
  if (combatInterval) { clearInterval(combatInterval); combatInterval = null; } 
  if (monsterAttackTimeout) { clearTimeout(monsterAttackTimeout); monsterAttackTimeout = null; }
}
function updateZoneKillProgressUI() {
  const killEl = el('zone-kill-progress');
  if (killEl && state.zone) {
    state.zoneKills = state.zoneKills || {};
    const count = state.zoneKills[state.zone] || 0;
    const req = 15;
    killEl.textContent = `⚔️ ${count}/${req} Caçados`;
    if (count >= req) {
      killEl.style.color = '#ef4444';
      killEl.style.borderColor = 'rgba(239,68,68,0.5)';
      killEl.textContent = `🚨 CHEFÃO DISPONÍVEL!`;
    } else {
      killEl.style.color = '#f59e0b';
      killEl.style.borderColor = 'rgba(245,158,11,0.3)';
    }
  }
}

function pickRandomMonster() {
  if (state.activeMonster && state.activeMonster.isTower && state.activeMonster.hp > 0) return;
  if (!state.zone || !ZONES[state.zone]) return;
  const zone = ZONES[state.zone];
  state.zoneKills = state.zoneKills || {};
  const currentKills = state.zoneKills[state.zone] || 0;
  const KILL_GOAL = 15;

  let targetId = null;
  let isBossSpawn = false;

  // Check if Zone Boss Goal reached (15/15 kills)
  if (currentKills >= KILL_GOAL && zone.boss && MONSTERS[zone.boss]) {
    targetId = zone.boss;
    isBossSpawn = true;
    state.zoneKills[state.zone] = 0; // Reset counter for next cycle
  } else {
    const available = zone.monsters.filter(m => { const mon = MONSTERS[m]; return mon; });
    targetId = (available.length > 0) ? available[Math.floor(Math.random() * available.length)] : zone.monsters[0];
  }

  state.target = targetId;
  const template = MONSTERS[targetId];
  if (template) {
    let hpMult = 1, atkMult = 1, xpMult = 1, goldMult = 1;
    let isElite = false;

    if (isBossSpawn || template.boss) {
      hpMult = 3.5;
      atkMult = 1.5;
      xpMult = 5.0;
      goldMult = 5.0;
      isBossSpawn = true;
    } else if (Math.random() < 0.08) { // 8% chance for Miniboss / Elite
      hpMult = 1.6;
      atkMult = 1.2;
      xpMult = 2.0;
      goldMult = 2.5;
      isElite = true;
    }

    const finalHp = Math.floor(template.hp * hpMult);
    state.activeMonster = {
      ...template,
      _maxHp: finalHp,
      hp: finalHp,
      atk: Math.floor(template.atk * atkMult),
      xp: Math.floor(template.xp * xpMult),
      gold: [Math.floor((template.gold[0] || 5) * goldMult), Math.floor((template.gold[1] || 15) * goldMult)],
      boss: isBossSpawn || !!template.boss,
      isElite: isElite,
      _stunnedUntil: 0
    };

    if (isBossSpawn) {
      log(`🚨 CHEFÃO DA ZONA DESPERTADO! 👑 ${template.name} apareceu!`, 'rarity-legendary');
      floatText(`🚨 CHEFÃO APARECEU!`, 'float-jackpot');
    } else if (isElite) {
      log(`⚡ Monstro Élite ${template.name} (Miniboss) surgiu!`, 'loot');
    } else {
      log(`Um ${template.name} selvagem apareceu!`, 'combat');
    }

    renderStageMonster();
    updateZoneKillProgressUI();
  }
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
  const max = def.max || def.maxLevel || 5;
  if (lvl >= max) { log(`${def.name} já atingiu o nível máximo.`, 'system'); return; }
  const cost = getSkillCost(skillId, lvl);
  if (state.sp < cost) { log(`SP insuficiente (${cost} SP necessário).`, 'system'); return; }
  if (state.level < (def.reqLvl || 1)) { log(`Nível ${def.reqLvl || 1} necessário para esta habilidade.`, 'system'); return; }

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

  const reqs = SKILL_REQS[skillId];
  if (reqs && !Object.entries(reqs).every(([s, v]) => s === 'level' || s === 'sp' || (state.skills[s] || 0) >= v)) {
    log('Pré-requisitos de habilidades não preenchidos.', 'system'); return;
  }
  state.sp -= cost; state.skills[skillId] = lvl + 1; const newLvl = state.skills[skillId], tier = TIER_NAMES[def.tier] || '';
  log(`✦ ${def.name} → Lv.${newLvl} [${tier}] (-${cost} SP)`, newLvl === max ? 'saga' : 'xp');
  const stats = getStats(); state.maxHp = stats.maxHp; state.maxMp = stats.maxMp; state.hp = Math.min(state.hp + 20, state.maxHp); state.mp = Math.min(state.mp + 10, state.maxMp);
  updateAllUI(); save();
}

function resetSP() {
  let totalRefunded = 0;
  // Determine the starter skill based on player archetype
  const starterSkill = getStarterSkillForClass(state.class);

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
  const starterSkill = getStarterSkillForClass(state.class);
  if (starterSkill) { state.skills[starterSkill] = Math.max(1, state.skills[starterSkill] || 0); }
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
  const starterSkill = getStarterSkillForClass(classId);
  if (starterSkill) { state.skills[starterSkill] = Math.max(1, state.skills[starterSkill] || 0); }
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
      const inInv = getInventoryCount(itemId) > 0 || getWarehouseCount(itemId) > 0;
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
  let foundInWarehouse = false;
  let whIdx = -1;

  if (invIdx >= 0) {
    state.inventory.splice(invIdx, 1);
  } else {
    whIdx = (state.warehouse || []).findIndex(i => i.itemId === itemId && !i.equipped);
    if (whIdx >= 0) {
      state.warehouse.splice(whIdx, 1);
      foundInWarehouse = true;
    } else {
      log('Você não possui este item para registrar no Codex.', 'system');
      return;
    }
  }

  state.codex = state.codex || {};
  state.codex[setId] = state.codex[setId] || [];
  if (!state.codex[setId].includes(itemId)) state.codex[setId].push(itemId);

  const itemDef = D().ALL_ITEMS[itemId];
  log(`📜 Item **${itemDef?.name || itemId}** registrado com sucesso no Codex!${foundInWarehouse ? ' (Retirado do Baú)' : ''}`, 'rarity-rare');
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

const tabScrollMap = {};

function openPanel(tabName) {
  const targetTab = (!tabName || tabName === 'zones' || tabName === 'combat' || tabName === 'close') ? 'zones' : tabName;
  const tabsPanel = qs('.tabs-panel');

  const currentActivePane = qs('.tab-pane.active');
  if (currentActivePane) {
    tabScrollMap[currentActivePane.id] = currentActivePane.scrollTop;
  }

  qsa('.tab-btn').forEach(b => b.classList.remove('active'));
  qsa('.tab-pane').forEach(p => p.classList.remove('active'));

  const btn = qs(`.tab-btn[data-tab="${targetTab}"]`);
  if (btn) btn.classList.add('active');

  const pane = el(`tab-${targetTab}`);
  if (pane) {
    pane.classList.add('active');
    if (tabScrollMap[pane.id] !== undefined) {
      pane.scrollTop = tabScrollMap[pane.id];
    }
  }

  let floatingCloseBtn = el('full-window-close-btn');

  if (tabsPanel) {
    if (targetTab !== 'zones') {
      tabsPanel.classList.add('full-window-active');
      if (!floatingCloseBtn) {
        floatingCloseBtn = mkEl('button');
        floatingCloseBtn.id = 'full-window-close-btn';
        floatingCloseBtn.className = 'full-window-close-btn';
        floatingCloseBtn.innerHTML = '⚔️ Combate ✖';
        floatingCloseBtn.title = 'Voltar para a tela de combate';
        document.body.appendChild(floatingCloseBtn);
      }
      floatingCloseBtn.onclick = (ev) => {
        if (ev) ev.stopPropagation();
        openPanel('zones');
      };
      floatingCloseBtn.style.display = 'flex';
    } else {
      tabsPanel.classList.remove('full-window-active');
      if (floatingCloseBtn) floatingCloseBtn.style.display = 'none';
    }
  }

  if (targetTab === 'inventory') safeUiUpdate('inventory', updateInventoryUI);
  else if (targetTab === 'skills') safeUiUpdate('skills', updateSkillUI);
  else if (targetTab === 'shop') safeUiUpdate('shop', updateShopUI);
  else if (targetTab === 'craft') safeUiUpdate('craft', updateCraftUI);
  else if (targetTab === 'enchant') safeUiUpdate('enchant', updateEnchantUI);
  else if (targetTab === 'zones') safeUiUpdate('zones', updateZoneUI);
  else if (targetTab === 'codex') safeUiUpdate('codex', updateCodexUI);
  else if (targetTab === 'dolls') safeUiUpdate('dolls', updateDollsUI);
  else if (targetTab === 'magiclamp') safeUiUpdate('magiclamp', updateMagicLampUI);
  else if (targetTab === 'quests') safeUiUpdate('quests', updateQuestsUI);
  else if (targetTab === 'tower') safeUiUpdate('tower', updateTowerUI);
  else if (targetTab === 'warehouse') safeUiUpdate('warehouse', updateWarehouseUI);
}

function depositAllToWarehouse() {
  const unequipped = state.inventory.filter(i => !i.equipped);
  if (unequipped.length === 0) {
    log('Nenhum item desequipado na mochila para guardar.', 'system');
    return;
  }
  let movedCount = 0;
  for (const item of [...unequipped]) {
    if (depositToWarehouse(item.uid, item.count || 1)) {
      movedCount++;
    } else {
      break;
    }
  }
  if (movedCount > 0) {
    log(`📦 ${movedCount} item(ns) guardado(s) no Baú.`, 'loot');
    updateAllUI(); save();
  }
}

function withdrawAllFromWarehouse() {
  if (!state.warehouse || state.warehouse.length === 0) {
    log('O Baú está vazio.', 'system');
    return;
  }
  let movedCount = 0;
  for (const item of [...state.warehouse]) {
    if (withdrawFromWarehouse(item.uid, item.count || 1)) {
      movedCount++;
    } else {
      break;
    }
  }
  if (movedCount > 0) {
    log(`🎒 ${movedCount} item(ns) retirado(s) do Baú.`, 'loot');
    updateAllUI(); save();
  }
}

function updateWarehouseUI() {
  const invCapEl = el('wh-inv-count');
  if (invCapEl) invCapEl.textContent = `${state.inventory.length}/${getMaxInventorySlots()} slots`;

  const whCapEl = el('wh-storage-count');
  if (whCapEl) whCapEl.textContent = `${(state.warehouse || []).length}/${getMaxWarehouseSlots()} slots`;

  const invGrid = el('wh-inventory-grid');
  if (invGrid) {
    invGrid.innerHTML = '';
    const unequippedItems = state.inventory.filter(i => i && i.itemId && D().ALL_ITEMS[i.itemId]);
    if (unequippedItems.length === 0) {
      invGrid.innerHTML = `<div style="grid-column: 1 / -1; text-align:center; padding:30px; color:var(--text-muted); font-size:11px;">Mochila vazia.</div>`;
    } else {
      unequippedItems.forEach(item => {
        const def = getItemDef(item.itemId);
        if (!def) return;
        const rarity = item.rarity || 'common';
        const slot = mkEl('div');
        slot.className = `inv-slot rarity-${rarity}` + (item.equipped ? ' is-equipped' : '') + (item.foundation ? ' is-foundation' : '');
        const countBadge = (item.count && item.count > 1) ? `<span class="qty">${item.count}</span>` : '';
        const enchantBadge = item.enchant ? `<span class="slot-enchant" style="position:absolute; top:2px; right:2px; font-weight:bold; color:var(--gilt); font-size:10px;">+${item.enchant}</span>` : '';
        const tag = item.equipped ? `<span class="equipped-badge">E</span>` : '';

        slot.innerHTML = `<span style="font-size:18px">${getItemIcon(def)}</span><span class="name">${def.name}</span>${countBadge}${enchantBadge}${tag}`;
        slot.onmouseenter = (e) => { cancelHideTooltip(); showItemTooltip(item, e); };
        slot.onmouseleave = scheduleHideTooltip;
        slot.onclick = (e) => { e.stopPropagation(); cancelHideTooltip(); showItemTooltip(item, e); };
        slot.ondblclick = (e) => { e.stopPropagation(); depositToWarehouse(item.uid); };

        invGrid.appendChild(slot);
      });
    }
  }

  const whGrid = el('wh-storage-grid');
  if (whGrid) {
    whGrid.innerHTML = '';
    const storageItems = state.warehouse || [];
    if (storageItems.length === 0) {
      whGrid.innerHTML = `<div style="grid-column: 1 / -1; text-align:center; padding:30px; color:var(--text-muted); font-size:11px;">O Baú está vazio.</div>`;
    } else {
      storageItems.forEach(item => {
        const def = getItemDef(item.itemId);
        if (!def) return;
        const rarity = item.rarity || 'common';
        const slot = mkEl('div');
        slot.className = `inv-slot rarity-${rarity}` + (item.foundation ? ' is-foundation' : '');
        const countBadge = (item.count && item.count > 1) ? `<span class="qty">${item.count}</span>` : '';
        const enchantBadge = item.enchant ? `<span class="slot-enchant" style="position:absolute; top:2px; right:2px; font-weight:bold; color:var(--gilt); font-size:10px;">+${item.enchant}</span>` : '';
        const foundationBadge = item.foundation ? `<span style="position:absolute; top:2px; left:2px; font-size:9px;">✨</span>` : '';

        slot.innerHTML = `<span style="font-size:18px">${getItemIcon(def)}</span><span class="name">${def.name}</span>${countBadge}${enchantBadge}${foundationBadge}`;
        slot.onmouseenter = (e) => { cancelHideTooltip(); showItemTooltip(item, e); };
        slot.onmouseleave = scheduleHideTooltip;
        slot.onclick = (e) => { e.stopPropagation(); cancelHideTooltip(); showItemTooltip(item, e); };
        slot.ondblclick = (e) => { e.stopPropagation(); withdrawFromWarehouse(item.uid); };

        whGrid.appendChild(slot);
      });
    }
  }
}

function bindEvents() {
  try {
    if (ROOT && ROOT.addEventListener) {
      addTrackedListener(ROOT, 'click', hideItemTooltip);
      addTrackedListener(ROOT, 'click', () => closeGameModeMenu());
    }

    // Keyboard shortcuts (1-9: Tab switch, Space: Speed, S: Save)
    addTrackedListener(window, 'keydown', (e) => {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) {
        return;
      }

      const tabs = ['character', 'inventory', 'skills', 'shop', 'craft', 'enchant', 'zones', 'quests', 'tower'];
      if (e.key >= '1' && e.key <= '9') {
        const idx = parseInt(e.key) - 1;
        if (tabs[idx]) {
          const tabBtn = qs(`.tab-btn[data-tab="${tabs[idx]}"]`);
          if (tabBtn) tabBtn.click();
        }
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        state.combatSpeed = state.combatSpeed === 1 ? 2 : (state.combatSpeed === 2 ? 4 : 1);
        log(`⚡ Velocidade de Combate: ${state.combatSpeed}x`, 'system');
        updateAllUI();
      } else if (e.key === 's' || e.key === 'S') {
        if (e.ctrlKey || e.metaKey) e.preventDefault();
        save(true);
      }
    });

    qsa('.tab-btn').forEach(btn => {
      btn.onclick = () => {
        const tabName = btn.dataset.tab;
        const isCurrentlyActive = btn.classList.contains('active');
        const isFullWindowActive = qs('.tabs-panel')?.classList.contains('full-window-active');

        if (isCurrentlyActive && isFullWindowActive && tabName !== 'zones') {
          openPanel('zones');
          return;
        }

        openPanel(tabName);
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
        const affixSel = el('admin-item-affix');
        if (itemSel && itemSel.value) {
          const qty = parseInt(qtyInput?.value || 1) || 1;
          spawnAdminItem(
            itemSel.value,
            qty,
            raritySel?.value || 'common',
            parseInt(enchantSel?.value || 0) || 0,
            affixSel?.value || 'roll'
          );
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
    window.depositToWarehouse = depositToWarehouse;
    window.withdrawFromWarehouse = withdrawFromWarehouse;
    window.depositAllToWarehouse = depositAllToWarehouse;
    window.withdrawAllFromWarehouse = withdrawAllFromWarehouse;
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
      // ⚠️ SEGURANÇA: privilegeLevel é confiável apenas para gate de UI local.
      // Qualquer efeito de comando GM (gold, level, sp, itens) que seja
      // persistido/sincronizado em backend DEVE ser revalidado no servidor,
      // pois este valor é 100% controlável pelo cliente via DevTools.
      state.privilegeLevel = Number(cloudData.privilegeLevel) || (cloudData.role === 'admin' ? 1 : 0);
      state.skills = { ...def.skills, ...(cloudData.skills || {}) };
      const _sk = getStarterSkillForClass(state.class);
      if (_sk) { state.skills[_sk] = Math.max(1, state.skills[_sk] || 0); if (!state.selectedSkill) state.selectedSkill = _sk; }
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
      if (cloudData.lastSaveTime) {
        setTimeout(() => checkOfflineProgress(cloudData.lastSaveTime), 600);
      }
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
    _intervals.push(setInterval(save, 10000)); 
    _intervals.push(setInterval(tickUI, 1000));

    const saveAndCloudSyncOnUnload = () => {
      save();
      if (typeof window !== 'undefined' && typeof window.saveCloudOnUnload === 'function') {
        window.saveCloudOnUnload();
      }
    };

    addTrackedListener(window, 'beforeunload', saveAndCloudSyncOnUnload);
    addTrackedListener(window, 'pagehide', saveAndCloudSyncOnUnload);
    addTrackedListener(document, 'visibilitychange', () => {
      if (document.visibilityState === 'hidden') saveAndCloudSyncOnUnload();
    });

    // ---- Embers / brasas globais (GrimoireFX) ----
    // Monta automaticamente em modo standalone (index.html direto)
    // No modo Shadow DOM (React), o IdleGame.tsx já monta via shadow.getElementById
    if (typeof window !== 'undefined' && window.GrimoireFX) {
      const rootObj = typeof _root !== 'undefined' ? _root : document;
      const gameRoot = rootObj.getElementById?.('game') || rootObj.querySelector?.('#game') || document.getElementById('game');
      if (gameRoot && !gameRoot.querySelector('.g-ember-global')) {
        const emberDiv = document.createElement('div');
        emberDiv.className = 'g-ember-global';
        gameRoot.insertBefore(emberDiv, gameRoot.firstChild);
        window.GrimoireFX.mountEmbers(emberDiv, {
          count: 45,
          colors: ['#f0883e', '#f0cd7e', '#e87d2e', '#ffd166', '#ff9b42']
        });
      }
    }
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
