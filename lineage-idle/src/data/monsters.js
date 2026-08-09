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
  // Talking Island (Level 1-5)
  goblin: { name: 'Goblin', lvl: 1, hp: 35, atk: 6, def: 2, eva: 2, matk: 0, mdef: 1, xp: 12, sp: 1, gold: [5, 12] },
  goblinThief: { name: 'Goblin Thief', lvl: 2, hp: 45, atk: 9, def: 3, eva: 10, matk: 0, mdef: 2, xp: 18, sp: 1, gold: [8, 20], element: 'none', traits: ['ambush'], stealsGold: 0.15 },
  armoredGoblin: { name: 'Armored Goblin', lvl: 3, hp: 60, atk: 11, def: 6, eva: 2, matk: 0, mdef: 3, xp: 22, sp: 2, gold: [10, 24] },
  goblinMage: { name: 'Goblin Mage', lvl: 4, hp: 50, atk: 8, def: 3, eva: 3, matk: 16, mdef: 6, xp: 25, sp: 2, gold: [12, 28] },
  goblinKing: { name: 'Goblin King', lvl: 5, hp: 240, atk: 22, def: 10, eva: 3, matk: 0, mdef: 5, xp: 120, sp: 8, gold: [60, 140], boss: true },

  // Elven Forest (Level 3-6)
  wolf: { name: 'Wolf', lvl: 3, hp: 55, atk: 10, def: 3, eva: 5, matk: 0, mdef: 2, xp: 20, sp: 1, gold: [9, 22] },
  rootWitch: { name: 'Root Witch', lvl: 5, hp: 85, atk: 14, def: 5, eva: 4, matk: 20, mdef: 8, xp: 32, sp: 2, gold: [15, 32] },
  deathTrent: { name: 'Death Treant', lvl: 6, hp: 350, atk: 28, def: 15, eva: 2, matk: 12, mdef: 10, xp: 180, sp: 10, gold: [80, 180], boss: true },

  // Dark Forest (Level 5-8)
  spider: { name: 'Cave Spider', lvl: 5, hp: 75, atk: 13, def: 4, eva: 8, matk: 0, mdef: 3, xp: 28, sp: 2, gold: [12, 28] },
  swampWalker: { name: 'Swamp Walker', lvl: 7, hp: 120, atk: 18, def: 7, eva: 5, matk: 10, mdef: 6, xp: 42, sp: 3, gold: [18, 40] },

  // Orc Village (Level 7-10)
  orc: { name: 'Orc Warrior', lvl: 7, hp: 150, atk: 22, def: 9, eva: 4, matk: 0, mdef: 4, xp: 50, sp: 3, gold: [22, 48], element: 'none', traits: ['enrage'] },

  // Dwarven Mine (Level 9-12)
  kobold: { name: 'Kobold Miner', lvl: 9, hp: 180, atk: 26, def: 11, eva: 4, matk: 0, mdef: 5, xp: 65, sp: 4, gold: [28, 60] },
  koboldLeader: { name: 'Kobold Foreman', lvl: 11, hp: 480, atk: 42, def: 18, eva: 8, matk: 0, mdef: 8, xp: 220, sp: 10, gold: [100, 220], element: 'none', traits: ['packLeader'], elite: true },

  // Kamael Lair (Level 11-14)
  kamaelScout: { name: 'Kamael Scout', lvl: 11, hp: 240, atk: 34, def: 13, eva: 9, matk: 0, mdef: 6, xp: 85, sp: 5, gold: [35, 75] },

  // Ruined Outpost (Level 15-18)
  ruinedGoblinThief: { name: 'Outpost Thief', lvl: 14, hp: 320, atk: 42, def: 16, eva: 12, xp: 130, sp: 6, gold: [50, 110] },
  ruinedOrc: { name: 'Outpost Orc', lvl: 15, hp: 420, atk: 50, def: 20, eva: 5, xp: 160, sp: 7, gold: [60, 130] },
  shadowMercenary: { name: 'Shadow Mercenary', lvl: 17, hp: 750, atk: 72, def: 28, eva: 10, xp: 320, sp: 12, gold: [120, 260], elite: true },

  // Howling Moor (Level 20-24)
  direWolf: { name: 'Dire Wolf', lvl: 20, hp: 650, atk: 78, def: 30, eva: 14, xp: 380, sp: 12, gold: [130, 280], element: 'none', traits: ['bleed'], atkSpd: 1.2 },
  babyTiamat: { name: 'Baby Tiamat', lvl: 21, hp: 750, atk: 85, def: 34, eva: 10, matk: 50, mdef: 20, xp: 440, sp: 14, gold: [150, 320] },
  crimsonBabyDragon: { name: 'Crimson Dragon Hatchling', lvl: 22, hp: 900, atk: 96, def: 38, eva: 10, xp: 520, sp: 16, gold: [180, 380], element: 'fire', resist: { fire: 0.75 } },
  ancientSatyr: { name: 'Ancient Satyr', lvl: 23, hp: 1050, atk: 108, def: 42, eva: 12, xp: 600, sp: 18, gold: [200, 420] },
  alphaWolf: { name: 'Alpha Wolf', lvl: 24, hp: 2200, atk: 145, def: 58, eva: 16, xp: 1200, sp: 30, gold: [450, 950], element: 'none', traits: ['packLeader', 'bleed'], boss: true },

  // Giran Outskirts (Level 25-29)
  skeleton: { name: 'Skeletal Trooper', lvl: 25, hp: 1200, atk: 120, def: 48, eva: 5, matk: 0, mdef: 18, xp: 700, sp: 20, gold: [240, 500] },
  deathRider: { name: 'Death Rider', lvl: 27, hp: 1600, atk: 145, def: 56, eva: 10, xp: 920, sp: 25, gold: [300, 650] },
  minotaurKnight: { name: 'Minotaur Knight', lvl: 29, hp: 3800, atk: 210, def: 85, eva: 6, xp: 2200, sp: 50, gold: [850, 1800], boss: true },

  // Orcen Ruins (Level 30-34)
  orcenRuinsOrc: { name: 'Ruined Orc Berserker', lvl: 30, hp: 2000, atk: 170, def: 65, eva: 6, xp: 1100, sp: 28, gold: [380, 800] },
  cursedWarrior: { name: 'Cursed Warrior', lvl: 32, hp: 2400, atk: 195, def: 75, eva: 8, xp: 1350, sp: 32, gold: [450, 950] },
  orcenOverlord: { name: 'Orcen Ruin Overlord', lvl: 34, hp: 5500, atk: 270, def: 110, eva: 8, xp: 3200, sp: 65, gold: [1200, 2600], boss: true },

  // Forsaken Crypt (Level 35-39)
  darkMage: { name: 'Crypt Dark Mage', lvl: 35, hp: 2600, atk: 140, def: 60, eva: 12, matk: 220, mdef: 80, xp: 1500, sp: 35, gold: [500, 1100], element: 'dark', magic: true },
  corpseWorm: { name: 'Corpse Worm', lvl: 36, hp: 3000, atk: 210, def: 90, eva: 4, xp: 1750, sp: 38, gold: [550, 1200] },
  furiousSouls: { name: 'Furious Souls', lvl: 37, hp: 2800, atk: 230, def: 70, eva: 16, matk: 140, mdef: 65, xp: 1850, sp: 40, gold: [600, 1300] },
  cryptVampire: { name: 'Crypt Vampire', lvl: 38, hp: 3600, atk: 260, def: 85, eva: 18, xp: 2300, sp: 45, gold: [750, 1600], traits: ['lifesteal'] },
  devilBone: { name: 'Devil Bone', lvl: 39, hp: 4200, atk: 280, def: 115, eva: 3, xp: 2700, sp: 50, gold: [850, 1800], element: 'dark', traits: ['boneArmor'] },
  cryptLord: { name: 'Crypt Lord Supreme', lvl: 40, hp: 9500, atk: 380, def: 150, eva: 8, xp: 6000, sp: 100, gold: [2200, 4800], boss: true },

  // Black Citadel (Level 40-44)
  deathKnight: { name: 'Death Knight Guardian', lvl: 40, hp: 4800, atk: 310, def: 125, eva: 10, xp: 3100, sp: 55, gold: [1000, 2200], element: 'dark' },
  deathWizard: { name: 'Death Wizard Archon', lvl: 42, hp: 4400, atk: 180, def: 95, eva: 10, matk: 340, mdef: 145, xp: 3500, sp: 60, gold: [1150, 2500] },
  blackDragon: { name: 'Black Dragon Sovereign', lvl: 43, hp: 12000, atk: 450, def: 180, eva: 10, xp: 8500, sp: 130, gold: [3200, 7000], boss: true },
  flamingDemonLord: { name: 'Flaming Demon Lord', lvl: 44, hp: 16000, atk: 540, def: 210, eva: 12, xp: 11000, sp: 160, gold: [4500, 9500], boss: true },

  // Gludio Castle (Level 45-47)
  knight: { name: 'Gludio Guard Knight', lvl: 45, hp: 5500, atk: 340, def: 140, eva: 6, xp: 3800, sp: 65, gold: [1200, 2600] },
  cursedKnight: { name: 'Cursed Gludio Knight', lvl: 47, hp: 6800, atk: 400, def: 165, eva: 6, xp: 4800, sp: 75, gold: [1500, 3200] },
  gludioCommander: { name: 'Gludio Fallen Commander', lvl: 48, hp: 18000, atk: 580, def: 230, eva: 8, xp: 12500, sp: 170, gold: [5000, 11000], boss: true },

  // Wolf Mountain (Level 48-49)
  mountainWolf: { name: 'Mountain Wolf', lvl: 48, hp: 6200, atk: 380, def: 150, eva: 15, xp: 4200, sp: 70, gold: [1400, 3000] },
  mountainDireWolf: { name: 'Mountain Dire Wolf', lvl: 49, hp: 7400, atk: 430, def: 170, eva: 18, xp: 5200, sp: 80, gold: [1700, 3600] },
  mountainAlphaWolf: { name: 'Mountain Alpha Wolf', lvl: 50, hp: 20000, atk: 620, def: 250, eva: 20, xp: 14000, sp: 180, gold: [5500, 12000], boss: true },

  // Rift of the Void (Level 50-59)
  voidCreature: { name: 'Void Creature', lvl: 50, hp: 7800, atk: 440, def: 175, eva: 25, xp: 5500, sp: 85, gold: [1800, 3800], element: 'void' },
  voidBrute: { name: 'Void Brute', lvl: 52, hp: 9200, atk: 490, def: 200, eva: 10, xp: 6800, sp: 95, gold: [2200, 4600] },
  voidStalker: { name: 'Void Stalker', lvl: 54, hp: 8500, atk: 540, def: 160, eva: 30, xp: 7400, sp: 100, gold: [2400, 5000] },
  beholder: { name: 'Void Beholder', lvl: 56, hp: 9800, atk: 260, def: 180, eva: 15, matk: 580, mdef: 220, xp: 8500, sp: 110, gold: [2800, 5800] },
  voidDragonLord: { name: 'Void Dragon Lord', lvl: 59, hp: 28000, atk: 780, def: 310, eva: 15, xp: 18000, sp: 220, gold: [7500, 16000], boss: true },

  // Emerald Grove (Level 60-69)
  emeraldSnake: { name: 'Emerald Serpent', lvl: 60, hp: 11500, atk: 600, def: 230, eva: 22, xp: 10500, sp: 125, gold: [3400, 7000] },
  emeraldDragon: { name: 'Emerald Drake', lvl: 64, hp: 16000, atk: 720, def: 290, eva: 10, xp: 15000, sp: 160, gold: [4800, 10000], element: 'earth' },
  fafurion: { name: 'Fafurion Water Sovereign', lvl: 69, hp: 45000, atk: 1100, def: 440, eva: 12, xp: 32000, sp: 350, gold: [14000, 28000], boss: true },

  // Gates of the Underworld (Level 70-75)
  blazingWerewolf: { name: 'Blazing Werewolf', lvl: 70, hp: 18000, atk: 820, def: 330, eva: 20, xp: 18000, sp: 190, gold: [5500, 11500] },
  swiftBlaze: { name: 'Swift Blaze Fiend', lvl: 72, hp: 16500, atk: 910, def: 300, eva: 28, xp: 20000, sp: 210, gold: [6200, 13000] },
  cerberus: { name: 'Cerberus Hell Guardian', lvl: 75, hp: 58000, atk: 1350, def: 520, eva: 14, xp: 42000, sp: 450, gold: [18000, 36000], boss: true },

  // Aden City (Level 76-79)
  royalKnight: { name: 'Aden Royal Guard', lvl: 76, hp: 22000, atk: 980, def: 380, eva: 8, xp: 24000, sp: 240, gold: [7500, 15000] },
  highMage: { name: 'Aden High Spellweaver', lvl: 78, hp: 19000, atk: 450, def: 320, eva: 10, matk: 1150, mdef: 450, xp: 28000, sp: 270, gold: [8800, 18000] },
  adenCommander: { name: 'Aden High Commander', lvl: 79, hp: 68000, atk: 1550, def: 600, eva: 10, xp: 52000, sp: 520, gold: [22000, 45000], boss: true },

  // Dragon Valley (Level 80-84)
  dragon: { name: 'Dragon Valley Drake', lvl: 80, hp: 28000, atk: 1150, def: 440, eva: 10, matk: 400, mdef: 300, xp: 32000, sp: 300, gold: [10000, 21000] },
  dragonKnight: { name: 'Dragon Knight Elite', lvl: 81, hp: 32000, atk: 1280, def: 490, eva: 10, xp: 37000, sp: 330, gold: [11500, 24000] },
  frostKnight: { name: 'Frost Knight', lvl: 82, hp: 36000, atk: 1400, def: 540, eva: 10, xp: 43000, sp: 370, gold: [13500, 28000] },
  frostLordDragon: { name: 'Frost Lord Dragon', lvl: 83, hp: 52000, atk: 1700, def: 640, eva: 12, xp: 65000, sp: 500, gold: [20000, 42000], boss: true },
  lindvior: { name: 'Lindvior Wind Sovereign', lvl: 84, hp: 95000, atk: 2100, def: 820, eva: 20, xp: 110000, sp: 800, gold: [35000, 70000], boss: true },

  // Imperial Tomb (Level 85-89)
  tombGuardian: { name: 'Imperial Tomb Guardian', lvl: 85, hp: 40000, atk: 1500, def: 580, eva: 10, xp: 50000, sp: 420, gold: [15000, 30000], element: 'dark' },
  sepulcherArchon: { name: 'Sepulcher Archon', lvl: 86, hp: 44000, atk: 700, def: 500, eva: 12, matk: 1850, mdef: 750, xp: 58000, sp: 470, gold: [17500, 35000], element: 'dark', magic: true },
  undeadKnight: { name: 'Imperial Undead Knight', lvl: 87, hp: 52000, atk: 1750, def: 680, eva: 8, xp: 70000, sp: 550, gold: [21000, 42000], element: 'dark' },
  lichLord: { name: 'Lich Lord Archmage', lvl: 88, hp: 78000, atk: 900, def: 620, eva: 15, matk: 2400, mdef: 1100, xp: 110000, sp: 800, gold: [32000, 65000], boss: true },
  deathKing: { name: 'Death King Supreme', lvl: 89, hp: 130000, atk: 2600, def: 1050, eva: 15, xp: 180000, sp: 1200, gold: [55000, 110000], boss: true },

  // Antharas' Lair (Level 90-94)
  caveDrake: { name: 'Cave Drake', lvl: 90, hp: 65000, atk: 2100, def: 820, eva: 12, xp: 95000, sp: 700, gold: [28000, 56000], element: 'earth' },
  magmaBeast: { name: 'Magma Beast', lvl: 91, hp: 75000, atk: 2350, def: 900, eva: 10, xp: 115000, sp: 820, gold: [34000, 68000], element: 'fire' },
  earthDrake: { name: 'Earth Drake', lvl: 93, hp: 95000, atk: 2700, def: 1080, eva: 12, xp: 150000, sp: 1000, gold: [45000, 90000], element: 'earth', boss: true },
  antharas: { name: 'Antharas Earth Dragon Lord', lvl: 94, hp: 250000, atk: 3800, def: 1500, eva: 15, xp: 350000, sp: 2200, gold: [100000, 200000], boss: true },

  // Forge of the Gods (Level 95-100)
  valakasMinion: { name: 'Valakas Minion', lvl: 95, hp: 85000, atk: 2600, def: 1000, eva: 12, matk: 1800, mdef: 900, xp: 130000, sp: 900, gold: [38000, 76000] },
  lavaGolem: { name: 'Lava Golem', lvl: 96, hp: 110000, atk: 2950, def: 1250, eva: 5, xp: 175000, sp: 1150, gold: [50000, 100000], element: 'fire' },
  flameArchon: { name: 'Flame Archon', lvl: 97, hp: 125000, atk: 1300, def: 1100, eva: 14, matk: 3600, mdef: 1500, xp: 210000, sp: 1350, gold: [60000, 120000], element: 'fire', magic: true },
  flameGiantDragon: { name: 'Flame Giant Dragon', lvl: 98, hp: 180000, atk: 3800, def: 1550, eva: 15, xp: 320000, sp: 1900, gold: [90000, 180000], boss: true },
  vulcanLord: { name: 'Vulcan Lord', lvl: 99, hp: 220000, atk: 4200, def: 1700, eva: 18, xp: 420000, sp: 2400, gold: [120000, 240000], element: 'fire', boss: true },
  valakas: { name: 'Valakas Fire Sovereign Dragon', lvl: 100, hp: 450000, atk: 5500, def: 2200, eva: 20, xp: 800000, sp: 4500, gold: [250000, 500000], boss: true }
};

/* ─── Normalização automática ────────────────────────────────────────────
   Injeta `id` (a própria chave) e `level` em todos os monstros.
   Resolve arte, drops, codex e tooltips de uma vez só.               */
for (const [key, m] of Object.entries(MONSTERS)) {
  m.id    = key;
  m.level = m.level ?? m.lvl ?? 1;
}

/** Índice reverso: 'goblin mage' -> 'goblinMage' */
export const MONSTER_BY_NAME = Object.freeze(
  Object.fromEntries(
    Object.entries(MONSTERS).flatMap(([k, v]) => [
      [k.toLowerCase(), k],
      [String(v.name).toLowerCase(), k],
    ])
  )
);
