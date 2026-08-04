/**
 * monsters.js — Definições de monstros do Lineage Idle.
 * Extraído de lineage-idle/main.js (linhas 90-179)
 *
 * Campos por monstro:
 *   name     — Nome exibido
 *   hp/atk/def/eva/matk/mdef — Atributos base
 *   xp/sp    — Recompensas de experiência
 *   gold     — [min, max] ouro dropado
 *   boss     — (opcional) true se for chefe de zona
 *   elite    — (opcional) true se for elite
 *   element  — (opcional) elemento do monstro
 *   resist   — (opcional) { elemento: multiplicador }
 *   traits   — (opcional) array de traits especiais
 *   magic    — (opcional) true se for atacante mágico
 *   atkSpd   — (opcional) multiplicador de velocidade de ataque
 */
export const MONSTERS = {
  // ─── Talking Island ───────────────────────────────────────────────────────
  goblin:        { name: 'Goblin',         hp: 30,  atk: 5,   def: 2,   eva: 2,  matk: 0,   mdef: 0,  xp: 10,  sp: 1, gold: [5, 15] },
  armoredGoblin: { name: 'Armored Goblin', hp: 45,  atk: 7,   def: 5,   eva: 2,  matk: 0,   mdef: 1,  xp: 14,  sp: 1, gold: [7, 18] },
  goblinMage:    { name: 'Goblin Mage',    hp: 35,  atk: 4,   def: 2,   eva: 3,  matk: 12,  mdef: 5,  xp: 15,  sp: 1, gold: [8, 20] },
  goblinThief:   { name: 'Goblin Thief',   lvl: 2,  hp: 45,  atk: 9,   def: 3,   eva: 12, xp: 18, sp: 1, gold: [8, 20],  element: 'none', traits: ['ambush', 'packTactics'], stealsGold: 0.15 },
  goblinKing:    { name: 'Goblin King',    hp: 120, atk: 15,  def: 8,   eva: 3,  matk: 0,   mdef: 0,  xp: 50,  sp: 5, gold: [25, 50],   boss: true },

  // ─── Elven Forest ─────────────────────────────────────────────────────────
  wolf:          { name: 'Wolf',           hp: 45,  atk: 8,   def: 1,   eva: 5,  matk: 0,   mdef: 0,  xp: 15,  sp: 1, gold: [8, 20] },
  rootWitch:     { name: 'Root Witch',     hp: 55,  atk: 10,  def: 3,   eva: 4,  matk: 15,  mdef: 8,  xp: 22,  sp: 2, gold: [12, 25] },
  deathTrent:    { name: 'Death Treant',   hp: 200, atk: 22,  def: 12,  eva: 2,  matk: 10,  mdef: 10, xp: 80,  sp: 6, gold: [40, 85],   boss: true },

  // ─── Dark Forest ──────────────────────────────────────────────────────────
  spider:        { name: 'Spider',         hp: 35,  atk: 6,   def: 1,   eva: 8,  matk: 0,   mdef: 0,  xp: 12,  sp: 1, gold: [6, 18] },
  swampWalker:   { name: 'Swamp Walker',   hp: 85,  atk: 14,  def: 6,   eva: 5,  matk: 8,   mdef: 6,  xp: 32,  sp: 2, gold: [15, 32] },

  // ─── Orc Village ──────────────────────────────────────────────────────────
  orc:           { name: 'Orc',            lvl: 5,  hp: 140, atk: 20,  def: 10,  eva: 4,  xp: 45,  sp: 2, gold: [20, 45],  element: 'none', traits: ['enrage'] },

  // ─── Dwarven Mine ─────────────────────────────────────────────────────────
  kobold:        { name: 'Kobold',         hp: 25,  atk: 4,   def: 3,   eva: 3,  matk: 0,   mdef: 0,  xp: 8,   sp: 1, gold: [4, 12] },
  koboldLeader:  { name: 'Kobold Leader',  lvl: 8,  hp: 260, atk: 30,  def: 14,  eva: 8,  xp: 110, sp: 4, gold: [60, 120], element: 'none', traits: ['packLeader', 'trap'], elite: true },

  // ─── Kamael Lair ──────────────────────────────────────────────────────────
  kamaelScout:   { name: 'Kamael Scout',   hp: 55,  atk: 12,  def: 2,   eva: 8,  matk: 0,   mdef: 0,  xp: 25,  sp: 2, gold: [12, 30] },

  // ─── Ruined Outpost ───────────────────────────────────────────────────────
  shadowMercenary: { name: 'Shadow Mercenary', hp: 280, atk: 32, def: 15, eva: 10, xp: 130, sp: 4, gold: [70, 140], elite: true },

  // ─── Howling Moor ─────────────────────────────────────────────────────────
  direWolf:          { name: 'Dire Wolf',         lvl: 12, hp: 420,  atk: 52,  def: 18,  eva: 18, xp: 220,  sp: 3, gold: [80, 160],   element: 'none', traits: ['bleed', 'firstStrike'], atkSpd: 1.35 },
  babyTiamat:        { name: 'Baby Tiamat',       hp: 500,  atk: 58,  def: 22,  eva: 10,  matk: 35,  mdef: 20,  xp: 280,  sp: 4, gold: [100, 200] },
  ancientSatyr:      { name: 'Ancient Satyr',     hp: 550,  atk: 62,  def: 24,  eva: 12,  xp: 300,  sp: 5, gold: [110, 220] },
  crimsonBabyDragon: { name: 'Crimson Baby Dragon', lvl: 15, hp: 620, atk: 70, def: 26, eva: 10, xp: 340, sp: 5, gold: [120, 240], element: 'fire', resist: { fire: 0.75, water: 1.3 }, traits: ['fireBreath'] },
  alphaWolf:         { name: 'Alpha Wolf',        lvl: 18, hp: 900,  atk: 85,  def: 30,  eva: 20, xp: 520,  sp: 6, gold: [180, 340],  element: 'none', traits: ['packLeader', 'bleed', 'howl'], elite: true },

  // ─── Giran Outskirts ──────────────────────────────────────────────────────
  skeleton:        { name: 'Skeleton',       hp: 50,   atk: 9,   def: 5,   eva: 1,  matk: 0,  mdef: 0,  xp: 18,  sp: 2, gold: [8, 22] },
  deathRider:      { name: 'Death Rider',    hp: 750,  atk: 95,  def: 35,  eva: 12, xp: 600,  sp: 7, gold: [200, 400] },
  minotaurKnight:  { name: 'Minotaur Knight', hp: 1400, atk: 120, def: 48, eva: 6,  xp: 950,  sp: 9, gold: [300, 600],  boss: true },

  // ─── Orcen Ruins ──────────────────────────────────────────────────────────
  cursedWarrior:   { name: 'Cursed Warrior', hp: 850,  atk: 105, def: 40, eva: 8,  xp: 750,  sp: 8, gold: [220, 450] },

  // ─── Forsaken Crypt ───────────────────────────────────────────────────────
  darkMage:    { name: 'Dark Mage',     lvl: 25, hp: 1150, atk: 145, def: 28, eva: 14, xp: 1100, sp: 8,  gold: [300, 600],   element: 'dark', magic: true, resist: { dark: 0.5, holy: 1.5 }, traits: ['curse', 'manaBurn'], atkSpd: 0.75 },
  corpseWorm:  { name: 'Corpse Worm',  hp: 1300, atk: 110, def: 50, eva: 4,  xp: 1200, sp: 8,  gold: [280, 550] },
  furiousSouls:{ name: 'Furious Souls',hp: 1000, atk: 130, def: 30, eva: 16, matk: 90, mdef: 45, xp: 1150, sp: 8, gold: [300, 580] },
  cryptVampire:{ name: 'Crypt Vampire',hp: 1800, atk: 160, def: 45, eva: 18, xp: 1600, sp: 11, gold: [400, 800],  traits: ['lifesteal'] },
  devilBone:   { name: 'Devil Bone',   lvl: 28, hp: 2400, atk: 120, def: 78, eva: 3,  xp: 1400, sp: 10, gold: [350, 700],  element: 'dark', resist: { physical: 0.7, magic: 1.25 }, traits: ['boneArmor', 'reassemble'] },
  cryptLord:   { name: 'Crypt Lord',   hp: 3800, atk: 210, def: 85, eva: 8,  xp: 3000, sp: 16, gold: [800, 1600], boss: true },

  // ─── Black Citadel ────────────────────────────────────────────────────────
  deathKnight:      { name: 'Death Knight',       lvl: 35, boss: true, hp: 4200,  atk: 210, def: 90,  eva: 12, xp: 3200, sp: 15, gold: [900, 1800],   element: 'dark', resist: { dark: 0.3, holy: 1.6 }, traits: ['lifesteal', 'deathCoil', 'enrage'] },
  deathWizard:      { name: 'Death Wizard',       hp: 3200, atk: 90,  def: 40,  eva: 10, matk: 240, mdef: 95, xp: 3100, sp: 15, gold: [850, 1700] },
  blackDragon:      { name: 'Black Dragon',       hp: 5500, atk: 290, def: 110, eva: 10, xp: 5000, sp: 20, gold: [1500, 3000], boss: true },
  flamingDemonLord: { name: 'Flaming Demon Lord', hp: 8500, atk: 350, def: 130, eva: 12, xp: 7500, sp: 25, gold: [2200, 4500], boss: true },

  // ─── Gludio Castle ────────────────────────────────────────────────────────
  knight:       { name: 'Knight',        hp: 150,  atk: 20, def: 12, eva: 2, matk: 0, mdef: 5, xp: 60, sp: 3, gold: [30, 60] },
  cursedKnight: { name: 'Cursed Knight', hp: 2800, atk: 180, def: 95, eva: 6, xp: 2500, sp: 14, gold: [700, 1400] },

  // ─── Rift of the Void ─────────────────────────────────────────────────────
  voidCreature:  { name: 'Void Creature',   lvl: 42, boss: true, hp: 5600,  atk: 280, def: 60,  eva: 30, xp: 5200,  sp: 18, gold: [1200, 2400], element: 'void', resist: { physical: 0.85, magic: 0.85 }, traits: ['voidPierce', 'phaseShift', 'distort'] },
  voidBrute:     { name: 'Void Brute',      hp: 6200, atk: 310, def: 100, eva: 10, xp: 6000,  sp: 20, gold: [1400, 2800] },
  voidStalker:   { name: 'Void Stalker',    hp: 4800, atk: 340, def: 50,  eva: 35, xp: 5800,  sp: 19, gold: [1350, 2700] },
  beholder:      { name: 'Beholder',        hp: 5000, atk: 150, def: 60,  eva: 15, matk: 320, mdef: 120, xp: 6200, sp: 21, gold: [1500, 3000] },
  voidDragonLord:{ name: 'Void Dragon Lord',hp: 12000, atk: 420, def: 140, eva: 15, xp: 12000, sp: 30, gold: [3500, 7000], boss: true },

  // ─── Emerald Grove ────────────────────────────────────────────────────────
  emeraldSnake:  { name: 'Emerald Snake',         hp: 6000,  atk: 320, def: 80,  eva: 25, xp: 6500,  sp: 20, gold: [1600, 3200] },
  emeraldDragon: { name: 'Emerald Dragon',         lvl: 48, boss: true, hp: 9800, atk: 330, def: 120, eva: 8,  xp: 9000,  sp: 22, gold: [2500, 5000], element: 'earth', resist: { poison: 0.0, fire: 1.2 }, traits: ['poison', 'wingBuffet', 'regen'] },
  fafurion:      { name: 'Fafurion Water Dragon',  hp: 22000, atk: 520, def: 180, eva: 12, xp: 20000, sp: 40, gold: [6000, 12000], boss: true },

  // ─── Gates of the Underworld ──────────────────────────────────────────────
  blazingWerewolf: { name: 'Blazing Werewolf', hp: 8500,  atk: 410, def: 110, eva: 22, xp: 9000,  sp: 25, gold: [2200, 4400] },
  swiftBlaze:      { name: 'Swift Blaze',      hp: 7500,  atk: 450, def: 90,  eva: 30, xp: 8800,  sp: 24, gold: [2100, 4200] },
  cerberus:        { name: 'Cerberus',          lvl: 50, boss: true, finalBoss: true, hp: 15000, atk: 400, def: 140, eva: 14, xp: 15000, sp: 30, gold: [5000, 10000], element: 'chaos', resist: { fire: 0.5, dark: 0.5, holy: 1.25 }, traits: ['multiHead', 'lifesteal', 'enrage', 'hellChain'] },

  // ─── Aden City ────────────────────────────────────────────────────────────
  mage: { name: 'Mage', hp: 80, atk: 5, def: 2, eva: 3, matk: 25, mdef: 8, xp: 55, sp: 3, gold: [25, 55] },

  // ─── Dragon Valley ────────────────────────────────────────────────────────
  dragon:          { name: 'Dragon',           hp: 300,   atk: 30,  def: 15,  eva: 5,  matk: 20, mdef: 10, xp: 120,   sp: 8,  gold: [80, 150],     boss: true },
  dragonKnight:    { name: 'Dragon Knight',    hp: 500,   atk: 40,  def: 25,  eva: 8,  matk: 15, mdef: 15, xp: 200,   sp: 10, gold: [150, 300],    boss: true },
  frostKnight:     { name: 'Frost Knight',     hp: 14000, atk: 550, def: 220, eva: 10, xp: 15000, sp: 35, gold: [3500, 7000] },
  frostLordDragon: { name: 'Frost Lord Dragon',hp: 28000, atk: 650, def: 250, eva: 12, xp: 25000, sp: 45, gold: [6500, 13000], boss: true },
  lindvior:        { name: 'Lindvior Wind Dragon', hp: 45000, atk: 850, def: 320, eva: 25, xp: 40000, sp: 60, gold: [10000, 20000], boss: true },

  // ─── Imperial Tomb ────────────────────────────────────────────────────────
  tombGuardian:    { name: 'Tomb Guardian',     lvl: 85, hp: 12000, atk: 450, def: 180, eva: 10, xp: 8500,  sp: 25, gold: [1500, 3000],  element: 'dark', traits: ['boneArmor'] },
  sepulcherArchon: { name: 'Sepulcher Archon',  lvl: 88, hp: 16000, atk: 520, def: 210, eva: 12, xp: 11000, sp: 30, gold: [2000, 4000],  element: 'dark', magic: true, traits: ['curse'] },
  undeadKnight:    { name: 'Undead Knight',     lvl: 90, hp: 22000, atk: 600, def: 260, eva: 8,  xp: 14000, sp: 35, gold: [2500, 5000],  element: 'dark', traits: ['shieldBlock'] },
  lichLord:        { name: 'Lich Lord Archmage',hp: 35000, atk: 300, def: 180, eva: 15, matk: 800, mdef: 400, xp: 32000, sp: 50, gold: [8000, 16000], boss: true },
  deathKing:       { name: 'Death King Supreme',hp: 60000, atk: 980, def: 420, eva: 15, xp: 55000, sp: 75, gold: [15000, 30000], boss: true },

  // ─── Antharas' Lair ───────────────────────────────────────────────────────
  caveDrake:  { name: 'Cave Drake',  lvl: 91, hp: 25000, atk: 680, def: 280, eva: 15, xp: 16000, sp: 40, gold: [3000, 6000],  element: 'earth', traits: ['tailWhip'] },
  magmaBeast: { name: 'Magma Beast', lvl: 93, hp: 30000, atk: 750, def: 310, eva: 10, xp: 19000, sp: 45, gold: [3500, 7000],  element: 'fire',  traits: ['burn'] },
  earthDrake: { name: 'Earth Drake', lvl: 95, hp: 38000, atk: 850, def: 350, eva: 12, xp: 23000, sp: 50, gold: [4200, 8500],  element: 'earth', boss: true, traits: ['earthquake'] },
  antharas:   { name: 'Antharas Earth Dragon Lord', hp: 120000, atk: 1400, def: 600, eva: 15, xp: 100000, sp: 120, gold: [25000, 50000], boss: true },

  // ─── Forge of the Gods ────────────────────────────────────────────────────
  valakasMinion:    { name: 'Valakas Minion',           hp: 28000,  atk: 700,  def: 280, eva: 12, matk: 450, mdef: 250, xp: 22000,  sp: 45, gold: [4000, 8000] },
  lavaGolem:        { name: 'Lava Golem',               lvl: 96, hp: 45000, atk: 920, def: 400, eva: 5,  xp: 27000, sp: 55, gold: [5000, 10000],  element: 'fire', traits: ['ironBody'] },
  flameArchon:      { name: 'Flame Archon',             lvl: 98, hp: 55000, atk: 1050, def: 450, eva: 14, xp: 32000, sp: 60, gold: [6000, 12000], element: 'fire', magic: true, traits: ['meteor'] },
  flameGiantDragon: { name: 'Flame Giant Dragon',       hp: 80000,  atk: 1200, def: 500, eva: 15, xp: 60000, sp: 80, gold: [12000, 24000], boss: true },
  vulcanLord:       { name: 'Vulcan Lord',              lvl: 100, hp: 75000, atk: 1250, def: 520, eva: 18, xp: 45000, sp: 80, gold: [8000, 16000],  element: 'fire', boss: true, traits: ['cataclysm'] },
  valakas:          { name: 'Valakas Fire Sovereign Dragon', hp: 200000, atk: 1800, def: 850, eva: 20, xp: 200000, sp: 200, gold: [50000, 100000], boss: true }
};
