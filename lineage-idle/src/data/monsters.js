/**
 * monsters.js — Definições de monstros do Lineage Idle.
 * Bestiário Expandido: Mínimo 4 monstros comuns + 1 elite + 1 chefe por zona.
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
  // ──────────────────────────────────────────────────────────────────────────
  // 1. TALKING ISLAND (Level 1-5)
  // ──────────────────────────────────────────────────────────────────────────
  goblin: { name: 'Goblin', lvl: 1, hp: 35, atk: 6, def: 2, eva: 2, matk: 0, mdef: 1, xp: 12, sp: 1, gold: [5, 12] },
  goblinThief: { name: 'Goblin Thief', lvl: 2, hp: 45, atk: 9, def: 3, eva: 10, matk: 0, mdef: 2, xp: 18, sp: 1, gold: [8, 20], element: 'none', traits: ['ambush'], stealsGold: 0.15 },
  armoredGoblin: { name: 'Armored Goblin', lvl: 3, hp: 60, atk: 11, def: 6, eva: 2, matk: 0, mdef: 3, xp: 22, sp: 1, gold: [10, 24] },
  goblinMage: { name: 'Goblin Mage', lvl: 4, hp: 50, atk: 8, def: 3, eva: 3, matk: 16, mdef: 6, xp: 25, sp: 1, gold: [12, 28], element: 'fire', magic: true },
  talkingIslandWerewolf: { name: 'Island Werewolf Leader', lvl: 5, hp: 130, atk: 17, def: 8, eva: 6, matk: 0, mdef: 4, xp: 60, sp: 2, gold: [30, 70], traits: ['bleed'], elite: true },
  goblinKing: { name: 'Goblin King', lvl: 5, hp: 240, atk: 22, def: 10, eva: 3, matk: 0, mdef: 5, xp: 120, sp: 3, gold: [60, 140], boss: true },

  // ──────────────────────────────────────────────────────────────────────────
  // 2. ELVEN FOREST (Level 3-10)
  // ──────────────────────────────────────────────────────────────────────────
  wolf: { name: 'Wolf', lvl: 3, hp: 55, atk: 10, def: 3, eva: 5, matk: 0, mdef: 2, xp: 20, sp: 1, gold: [9, 22] },
  grayWolf: { name: 'Gray Wolf', lvl: 4, hp: 70, atk: 12, def: 4, eva: 6, matk: 0, mdef: 3, xp: 26, sp: 1, gold: [11, 25], traits: ['bleed'] },
  rootWitch: { name: 'Root Witch', lvl: 5, hp: 85, atk: 14, def: 5, eva: 4, matk: 20, mdef: 8, xp: 32, sp: 2, gold: [15, 32], magic: true },
  greenDryad: { name: 'Green Dryad', lvl: 8, hp: 150, atk: 22, def: 9, eva: 8, matk: 28, mdef: 12, xp: 55, sp: 3, gold: [24, 52], magic: true, traits: ['entangle'] },
  sporeFungus: { name: 'Spore Fungus', lvl: 9, hp: 180, atk: 25, def: 11, eva: 4, matk: 35, mdef: 14, xp: 68, sp: 3, gold: [30, 65], element: 'earth', traits: ['poison'] },
  kabooOrcFighter: { name: 'Kaboo Orc Champion', lvl: 10, hp: 320, atk: 35, def: 16, eva: 6, matk: 0, mdef: 9, xp: 130, sp: 4, gold: [55, 120], traits: ['enrage'], elite: true },
  deathTrent: { name: 'Death Treant', lvl: 10, hp: 520, atk: 42, def: 20, eva: 3, matk: 25, mdef: 15, xp: 260, sp: 6, gold: [120, 280], boss: true },

  // ──────────────────────────────────────────────────────────────────────────
  // 3. DARK FOREST (Level 5-12)
  // ──────────────────────────────────────────────────────────────────────────
  spider: { name: 'Cave Spider', lvl: 5, hp: 75, atk: 13, def: 4, eva: 8, matk: 0, mdef: 3, xp: 28, sp: 1, gold: [12, 28], traits: ['poison'] },
  swampWalker: { name: 'Swamp Walker', lvl: 7, hp: 120, atk: 18, def: 7, eva: 5, matk: 10, mdef: 6, xp: 42, sp: 2, gold: [18, 40] },
  lesserDarkHorror: { name: 'Lesser Dark Horror', lvl: 9, hp: 175, atk: 26, def: 10, eva: 7, matk: 32, mdef: 12, xp: 65, sp: 3, gold: [28, 60], element: 'dark', magic: true },
  marshStalker: { name: 'Marsh Stalker', lvl: 11, hp: 230, atk: 33, def: 13, eva: 12, matk: 0, mdef: 8, xp: 85, sp: 3, gold: [36, 75], traits: ['ambush'] },
  shadowFangWolf: { name: 'Shadowfang Dire Wolf', lvl: 12, hp: 420, atk: 45, def: 18, eva: 10, matk: 0, mdef: 10, xp: 180, sp: 5, gold: [75, 160], traits: ['bleed'], elite: true },
  darkForestMatriarch: { name: 'Dark Forest Matriarch', lvl: 12, hp: 650, atk: 52, def: 24, eva: 8, matk: 30, mdef: 18, xp: 320, sp: 8, gold: [150, 320], boss: true },

  // ──────────────────────────────────────────────────────────────────────────
  // 4. ORC VILLAGE (Level 7-15)
  // ──────────────────────────────────────────────────────────────────────────
  orc: { name: 'Orc Warrior', lvl: 7, hp: 150, atk: 22, def: 9, eva: 4, matk: 0, mdef: 4, xp: 50, sp: 2, gold: [22, 48], traits: ['enrage'] },
  kashaWolf: { name: 'Kasha Wolf', lvl: 9, hp: 185, atk: 27, def: 11, eva: 9, matk: 0, mdef: 5, xp: 68, sp: 2, gold: [30, 62], traits: ['bleed'] },
  kashaBear: { name: 'Kasha Bear', lvl: 11, hp: 260, atk: 34, def: 15, eva: 4, matk: 0, mdef: 7, xp: 90, sp: 3, gold: [38, 82] },
  kashaOrcArcher: { name: 'Kasha Orc Archer', lvl: 13, hp: 280, atk: 42, def: 14, eva: 8, matk: 0, mdef: 8, xp: 115, sp: 3, gold: [45, 95] },
  kashaOrcBerserker: { name: 'Kasha Orc Berserker', lvl: 14, hp: 550, atk: 55, def: 22, eva: 6, matk: 0, mdef: 11, xp: 240, sp: 6, gold: [100, 210], traits: ['enrage'], elite: true },
  kashaOrcOverlord: { name: 'Kasha Tribe Overlord', lvl: 15, hp: 850, atk: 65, def: 28, eva: 6, matk: 20, mdef: 15, xp: 400, sp: 10, gold: [180, 380], boss: true },

  // ──────────────────────────────────────────────────────────────────────────
  // 5. DWARVEN MINE (Level 9-16)
  // ──────────────────────────────────────────────────────────────────────────
  kobold: { name: 'Kobold Miner', lvl: 9, hp: 180, atk: 26, def: 11, eva: 4, matk: 0, mdef: 5, xp: 65, sp: 2, gold: [28, 60] },
  goblinBrigand: { name: 'Mine Goblin Brigand', lvl: 11, hp: 230, atk: 32, def: 13, eva: 8, matk: 0, mdef: 6, xp: 85, sp: 3, gold: [35, 75] },
  mineCaveBat: { name: 'Mithril Cave Bat', lvl: 13, hp: 250, atk: 38, def: 12, eva: 16, matk: 0, mdef: 8, xp: 110, sp: 3, gold: [42, 90], traits: ['lifesteal'] },
  mithrilGolem: { name: 'Mithril Golem', lvl: 15, hp: 420, atk: 48, def: 25, eva: 2, matk: 0, mdef: 14, xp: 160, sp: 4, gold: [60, 130], element: 'earth' },
  koboldLeader: { name: 'Kobold Foreman', lvl: 16, hp: 680, atk: 60, def: 28, eva: 8, matk: 0, mdef: 14, xp: 280, sp: 7, gold: [120, 260], traits: ['packLeader'], elite: true },
  dwarvenEarthLord: { name: 'Dwarven Mine Guardian', lvl: 16, hp: 1100, atk: 75, def: 35, eva: 4, matk: 0, mdef: 20, xp: 480, sp: 12, gold: [220, 460], boss: true },

  // ──────────────────────────────────────────────────────────────────────────
  // 6. KAMAEL LAIR (Level 11-18)
  // ──────────────────────────────────────────────────────────────────────────
  kamaelScout: { name: 'Kamael Scout', lvl: 11, hp: 240, atk: 34, def: 13, eva: 9, matk: 0, mdef: 6, xp: 85, sp: 2, gold: [35, 75] },
  soullessScout: { name: 'Soulless Scout', lvl: 13, hp: 290, atk: 40, def: 15, eva: 10, matk: 0, mdef: 8, xp: 115, sp: 3, gold: [46, 96] },
  spitefulGhost: { name: 'Spiteful Soul Ghost', lvl: 15, hp: 340, atk: 30, def: 14, eva: 14, matk: 55, mdef: 18, xp: 155, sp: 4, gold: [58, 125], element: 'dark', magic: true },
  crimsonWarder: { name: 'Crimson Warder', lvl: 17, hp: 450, atk: 56, def: 22, eva: 8, matk: 0, mdef: 12, xp: 210, sp: 5, gold: [80, 170] },
  kamaelInfiltrator: { name: 'Kamael Infiltrator', lvl: 18, hp: 780, atk: 70, def: 27, eva: 15, matk: 0, mdef: 16, xp: 340, sp: 8, gold: [140, 290], traits: ['ambush'], elite: true },
  darkInquisitorKamael: { name: 'Kamael Dark Inquisitor', lvl: 18, hp: 1350, atk: 88, def: 36, eva: 10, matk: 40, mdef: 24, xp: 600, sp: 15, gold: [280, 580], boss: true },

  // ──────────────────────────────────────────────────────────────────────────
  // 7. RUINED OUTPOST (Level 15-20)
  // ──────────────────────────────────────────────────────────────────────────
  ruinedGoblinThief: { name: 'Outpost Thief', lvl: 15, hp: 320, atk: 42, def: 16, eva: 12, xp: 130, sp: 3, gold: [50, 110] },
  ruinedOrc: { name: 'Outpost Orc', lvl: 16, hp: 420, atk: 50, def: 20, eva: 5, xp: 160, sp: 3, gold: [60, 130] },
  outpostMarksman: { name: 'Outpost Marksman', lvl: 17, hp: 380, atk: 58, def: 18, eva: 10, xp: 185, sp: 4, gold: [70, 150] },
  ruinedDeserter: { name: 'Ruined Deserter Knight', lvl: 19, hp: 560, atk: 68, def: 26, eva: 6, xp: 250, sp: 5, gold: [95, 200] },
  shadowMercenary: { name: 'Shadow Mercenary', lvl: 20, hp: 950, atk: 82, def: 32, eva: 12, xp: 420, sp: 9, gold: [160, 340], elite: true },
  outpostFallenCaptain: { name: 'Fallen Outpost Captain', lvl: 20, hp: 1600, atk: 105, def: 42, eva: 8, xp: 750, sp: 16, gold: [320, 680], boss: true },

  // ──────────────────────────────────────────────────────────────────────────
  // 8. HOWLING MOOR (Level 20-24)
  // ──────────────────────────────────────────────────────────────────────────
  direWolf: { name: 'Dire Wolf', lvl: 20, hp: 650, atk: 78, def: 30, eva: 14, xp: 380, sp: 4, gold: [130, 280], element: 'none', traits: ['bleed'], atkSpd: 1.2 },
  babyTiamat: { name: 'Baby Tiamat', lvl: 21, hp: 750, atk: 85, def: 34, eva: 10, matk: 50, mdef: 20, xp: 440, sp: 4, gold: [150, 320] },
  crimsonBabyDragon: { name: 'Crimson Dragon Hatchling', lvl: 22, hp: 900, atk: 96, def: 38, eva: 10, xp: 520, sp: 5, gold: [180, 380], element: 'fire', resist: { fire: 0.75 } },
  ancientSatyr: { name: 'Ancient Satyr', lvl: 23, hp: 1050, atk: 108, def: 42, eva: 12, xp: 600, sp: 5, gold: [200, 420] },
  satyrWarlord: { name: 'Satyr Warlord', lvl: 24, hp: 1550, atk: 128, def: 50, eva: 14, xp: 850, sp: 7, gold: [300, 650], traits: ['bleed'], elite: true },
  alphaWolf: { name: 'Alpha Wolf', lvl: 24, hp: 2200, atk: 145, def: 58, eva: 16, xp: 1200, sp: 8, gold: [450, 950], element: 'none', traits: ['packLeader', 'bleed'], boss: true },

  // ──────────────────────────────────────────────────────────────────────────
  // 9. GIRAN OUTSKIRTS (Level 25-29)
  // ──────────────────────────────────────────────────────────────────────────
  skeleton: { name: 'Skeletal Trooper', lvl: 25, hp: 1200, atk: 120, def: 48, eva: 5, matk: 0, mdef: 18, xp: 700, sp: 6, gold: [240, 500] },
  skeletonArcher: { name: 'Skeletal Marksman', lvl: 26, hp: 1100, atk: 135, def: 44, eva: 8, matk: 0, mdef: 20, xp: 780, sp: 6, gold: [260, 550] },
  deathRider: { name: 'Death Rider', lvl: 27, hp: 1600, atk: 145, def: 56, eva: 10, xp: 920, sp: 7, gold: [300, 650] },
  giranGargoyle: { name: 'Giran Stone Gargoyle', lvl: 28, hp: 1900, atk: 160, def: 68, eva: 6, matk: 0, mdef: 26, xp: 1050, sp: 8, gold: [340, 720], element: 'earth' },
  giranGladiator: { name: 'Cursed Giran Gladiator', lvl: 29, hp: 2700, atk: 185, def: 74, eva: 8, xp: 1500, sp: 10, gold: [550, 1150], elite: true },
  minotaurKnight: { name: 'Minotaur Knight', lvl: 29, hp: 3800, atk: 210, def: 85, eva: 6, xp: 2200, sp: 12, gold: [850, 1800], boss: true },

  // ──────────────────────────────────────────────────────────────────────────
  // 10. ORCEN RUINS (Level 30-34)
  // ──────────────────────────────────────────────────────────────────────────
  orcenRuinsOrc: { name: 'Ruined Orc Berserker', lvl: 30, hp: 2000, atk: 170, def: 65, eva: 6, xp: 1100, sp: 8, gold: [380, 800] },
  cursedWarrior: { name: 'Cursed Warrior', lvl: 31, hp: 2400, atk: 195, def: 75, eva: 8, xp: 1350, sp: 9, gold: [450, 950] },
  ruinShamanOrc: { name: 'Ruin Orc Shaman', lvl: 32, hp: 2200, atk: 140, def: 68, eva: 6, matk: 240, mdef: 70, xp: 1450, sp: 10, gold: [480, 1000], element: 'fire', magic: true },
  tombLooterOrc: { name: 'Tomb Looter Orc', lvl: 33, hp: 2600, atk: 215, def: 82, eva: 10, xp: 1650, sp: 11, gold: [550, 1150] },
  ancientOrcExecutioner: { name: 'Ancient Orc Executioner', lvl: 34, hp: 3900, atk: 245, def: 95, eva: 7, xp: 2300, sp: 13, gold: [800, 1700], traits: ['enrage'], elite: true },
  orcenOverlord: { name: 'Orcen Ruin Overlord', lvl: 34, hp: 5500, atk: 270, def: 110, eva: 8, xp: 3200, sp: 15, gold: [1200, 2600], boss: true },

  // ──────────────────────────────────────────────────────────────────────────
  // 11. FORSAKEN CRYPT (Level 35-40)
  // ──────────────────────────────────────────────────────────────────────────
  darkMage: { name: 'Crypt Dark Mage', lvl: 35, hp: 2600, atk: 140, def: 60, eva: 12, matk: 220, mdef: 80, xp: 1500, sp: 10, gold: [500, 1100], element: 'dark', magic: true },
  corpseWorm: { name: 'Corpse Worm', lvl: 36, hp: 3000, atk: 210, def: 90, eva: 4, xp: 1750, sp: 10, gold: [550, 1200] },
  furiousSouls: { name: 'Furious Souls', lvl: 37, hp: 2800, atk: 230, def: 70, eva: 16, matk: 140, mdef: 65, xp: 1850, sp: 11, gold: [600, 1300] },
  cryptVampire: { name: 'Crypt Vampire', lvl: 38, hp: 3600, atk: 260, def: 85, eva: 18, xp: 2300, sp: 12, gold: [750, 1600], traits: ['lifesteal'] },
  devilBone: { name: 'Devil Bone', lvl: 39, hp: 4200, atk: 280, def: 115, eva: 3, xp: 2700, sp: 13, gold: [850, 1800], element: 'dark', traits: ['boneArmor'], elite: true },
  cryptLord: { name: 'Crypt Lord Supreme', lvl: 40, hp: 9500, atk: 380, def: 150, eva: 8, xp: 6000, sp: 20, gold: [2200, 4800], boss: true },

  // ──────────────────────────────────────────────────────────────────────────
  // 12. BLACK CITADEL (Level 40-44)
  // ──────────────────────────────────────────────────────────────────────────
  deathKnight: { name: 'Death Knight Guardian', lvl: 40, hp: 4800, atk: 310, def: 125, eva: 10, xp: 3100, sp: 14, gold: [1000, 2200], element: 'dark' },
  deathWizard: { name: 'Death Wizard Archon', lvl: 41, hp: 4400, atk: 180, def: 95, eva: 10, matk: 340, mdef: 145, xp: 3500, sp: 15, gold: [1150, 2500], magic: true },
  citadelDarkPriest: { name: 'Citadel Dark Priest', lvl: 42, hp: 4600, atk: 190, def: 105, eva: 8, matk: 360, mdef: 155, xp: 3900, sp: 16, gold: [1250, 2700], element: 'dark', magic: true },
  blackDragonWhelp: { name: 'Black Dragon Whelp', lvl: 43, hp: 6200, atk: 360, def: 140, eva: 10, xp: 4800, sp: 18, gold: [1500, 3300], element: 'dark' },
  blackDragon: { name: 'Black Dragon Sovereign', lvl: 44, hp: 12000, atk: 450, def: 180, eva: 10, xp: 8500, sp: 25, gold: [3200, 7000], elite: true },
  flamingDemonLord: { name: 'Flaming Demon Lord', lvl: 44, hp: 16000, atk: 540, def: 210, eva: 12, xp: 11000, sp: 30, gold: [4500, 9500], boss: true },

  // ──────────────────────────────────────────────────────────────────────────
  // 13. GLUDIO CASTLE (Level 45-48)
  // ──────────────────────────────────────────────────────────────────────────
  knight: { name: 'Gludio Guard Knight', lvl: 45, hp: 5500, atk: 340, def: 140, eva: 6, xp: 3800, sp: 16, gold: [1200, 2600] },
  cursedKnight: { name: 'Cursed Gludio Knight', lvl: 46, hp: 6800, atk: 400, def: 165, eva: 6, xp: 4800, sp: 18, gold: [1500, 3200] },
  gludioRoyalArcher: { name: 'Gludio Royal Archer', lvl: 47, hp: 5800, atk: 420, def: 135, eva: 14, xp: 4900, sp: 18, gold: [1600, 3400] },
  gludioSorcerer: { name: 'Gludio Fallen Sorcerer', lvl: 47, hp: 5400, atk: 220, def: 130, eva: 8, matk: 460, mdef: 185, xp: 5100, sp: 19, gold: [1700, 3600], magic: true },
  gludioShieldMaster: { name: 'Gludio Shield Master', lvl: 48, hp: 11500, atk: 460, def: 210, eva: 6, xp: 7500, sp: 24, gold: [2600, 5600], elite: true },
  gludioCommander: { name: 'Gludio Fallen Commander', lvl: 48, hp: 18000, atk: 580, def: 230, eva: 8, xp: 12500, sp: 32, gold: [5000, 11000], boss: true },

  // ──────────────────────────────────────────────────────────────────────────
  // 14. WOLF MOUNTAIN (Level 48-50)
  // ──────────────────────────────────────────────────────────────────────────
  mountainWolf: { name: 'Mountain Wolf', lvl: 48, hp: 6200, atk: 380, def: 150, eva: 15, xp: 4200, sp: 18, gold: [1400, 3000] },
  mountainDireWolf: { name: 'Mountain Dire Wolf', lvl: 49, hp: 7400, atk: 430, def: 170, eva: 18, xp: 5200, sp: 20, gold: [1700, 3600], traits: ['bleed'] },
  frostStalkerWolf: { name: 'Frost Stalker Wolf', lvl: 49, hp: 6800, atk: 450, def: 160, eva: 22, xp: 5400, sp: 20, gold: [1800, 3800], element: 'water' },
  mountainSnowBear: { name: 'Mountain Snow Bear', lvl: 50, hp: 9200, atk: 490, def: 195, eva: 8, xp: 6500, sp: 22, gold: [2200, 4600] },
  frostFangBehemoth: { name: 'Frostfang Behemoth', lvl: 50, hp: 14000, atk: 540, def: 225, eva: 12, xp: 9000, sp: 28, gold: [3400, 7200], elite: true },
  mountainAlphaWolf: { name: 'Mountain Alpha Wolf', lvl: 50, hp: 20000, atk: 620, def: 250, eva: 20, xp: 14000, sp: 35, gold: [5500, 12000], boss: true },

  // ──────────────────────────────────────────────────────────────────────────
  // 15. RIFT OF THE VOID (Level 50-59)
  // ──────────────────────────────────────────────────────────────────────────
  voidCreature: { name: 'Void Creature', lvl: 50, hp: 7800, atk: 440, def: 175, eva: 25, xp: 5500, sp: 85, gold: [1800, 3800], element: 'void' },
  voidBrute: { name: 'Void Brute', lvl: 52, hp: 9200, atk: 490, def: 200, eva: 10, xp: 6800, sp: 95, gold: [2200, 4600] },
  voidStalker: { name: 'Void Stalker', lvl: 54, hp: 8500, atk: 540, def: 160, eva: 30, xp: 7400, sp: 100, gold: [2400, 5000] },
  beholder: { name: 'Void Beholder', lvl: 56, hp: 9800, atk: 260, def: 180, eva: 15, matk: 580, mdef: 220, xp: 8500, sp: 110, gold: [2800, 5800], magic: true },
  voidArchonEntity: { name: 'Void Archon Entity', lvl: 58, hp: 18000, atk: 660, def: 260, eva: 20, matk: 650, mdef: 260, xp: 13000, sp: 160, gold: [4800, 10000], elite: true },
  voidDragonLord: { name: 'Void Dragon Lord', lvl: 59, hp: 28000, atk: 780, def: 310, eva: 15, xp: 18000, sp: 220, gold: [7500, 16000], boss: true },

  // ──────────────────────────────────────────────────────────────────────────
  // 16. EMERALD GROVE (Level 60-69)
  // ──────────────────────────────────────────────────────────────────────────
  emeraldSnake: { name: 'Emerald Serpent', lvl: 60, hp: 11500, atk: 600, def: 230, eva: 22, xp: 10500, sp: 125, gold: [3400, 7000], traits: ['poison'] },
  emeraldDrake: { name: 'Emerald Drake', lvl: 63, hp: 14500, atk: 680, def: 270, eva: 12, xp: 13500, sp: 145, gold: [4200, 8800], element: 'earth' },
  jadeGolem: { name: 'Jade Stone Golem', lvl: 65, hp: 18000, atk: 740, def: 320, eva: 5, xp: 16500, sp: 170, gold: [5200, 11000], element: 'earth' },
  groveSpiritMage: { name: 'Grove Spirit Sorceress', lvl: 67, hp: 13000, atk: 320, def: 220, eva: 15, matk: 780, mdef: 320, xp: 18500, sp: 190, gold: [6000, 12500], magic: true },
  emeraldDragon: { name: 'Ancient Emerald Dragon', lvl: 68, hp: 28000, atk: 900, def: 370, eva: 10, xp: 24000, sp: 260, gold: [9000, 18000], element: 'earth', elite: true },
  fafurion: { name: 'Fafurion Water Sovereign', lvl: 69, hp: 45000, atk: 1100, def: 440, eva: 12, xp: 32000, sp: 350, gold: [14000, 28000], boss: true },

  // ──────────────────────────────────────────────────────────────────────────
  // 17. GATES OF THE UNDERWORLD (Level 70-75)
  // ──────────────────────────────────────────────────────────────────────────
  blazingWerewolf: { name: 'Blazing Werewolf', lvl: 70, hp: 18000, atk: 820, def: 330, eva: 20, xp: 18000, sp: 190, gold: [5500, 11500], element: 'fire', traits: ['bleed'] },
  swiftBlaze: { name: 'Swift Blaze Fiend', lvl: 71, hp: 16500, atk: 910, def: 300, eva: 28, xp: 20000, sp: 210, gold: [6200, 13000], element: 'fire' },
  infernalHound: { name: 'Infernal Hell Hound', lvl: 72, hp: 19500, atk: 880, def: 350, eva: 18, xp: 21500, sp: 225, gold: [6800, 14000], element: 'fire' },
  lavaFiend: { name: 'Molten Lava Fiend', lvl: 74, hp: 23000, atk: 980, def: 390, eva: 10, matk: 850, mdef: 380, xp: 25500, sp: 250, gold: [8000, 16500], element: 'fire', magic: true },
  flameOverlordDemon: { name: 'Underworld Flame Overlord', lvl: 75, hp: 38000, atk: 1180, def: 460, eva: 12, xp: 33000, sp: 340, gold: [12000, 25000], element: 'fire', elite: true },
  cerberus: { name: 'Cerberus Hell Guardian', lvl: 75, hp: 58000, atk: 1350, def: 520, eva: 14, xp: 42000, sp: 450, gold: [18000, 36000], boss: true },

  // ──────────────────────────────────────────────────────────────────────────
  // 18. VALLEY OF SAINTS (Level 72-75)
  // ──────────────────────────────────────────────────────────────────────────
  saintEye: { name: 'Eye of Splendor', lvl: 72, hp: 19500, atk: 880, def: 340, eva: 15, matk: 950, mdef: 420, xp: 21000, sp: 220, gold: [6500, 13500], element: 'holy', magic: true },
  saintGuardian: { name: 'Guardian of Splendor', lvl: 73, hp: 23000, atk: 950, def: 370, eva: 10, xp: 23500, sp: 240, gold: [7200, 14500], element: 'holy' },
  splendorLight: { name: 'Splendor Light Sovereign', lvl: 74, hp: 25000, atk: 1020, def: 390, eva: 14, xp: 26000, sp: 260, gold: [8000, 16000], element: 'holy' },
  celestialArchon: { name: 'Celestial Archon of Light', lvl: 74, hp: 22500, atk: 600, def: 360, eva: 16, matk: 1100, mdef: 470, xp: 27000, sp: 270, gold: [8500, 17000], element: 'holy', magic: true },
  divineSeraphim: { name: 'Platinum Divine Seraphim', lvl: 75, hp: 42000, atk: 1250, def: 490, eva: 15, matk: 1200, mdef: 510, xp: 36000, sp: 380, gold: [13500, 28000], element: 'holy', elite: true },
  splendorKnight: { name: 'High Paladin of Splendor', lvl: 75, hp: 62000, atk: 1450, def: 560, eva: 12, xp: 48000, sp: 480, gold: [20000, 40000], element: 'holy', boss: true },

  // ──────────────────────────────────────────────────────────────────────────
  // 19. SWAMP OF SCREAMS (Level 74-76)
  // ──────────────────────────────────────────────────────────────────────────
  swampStrikers: { name: 'Stakato Screamer', lvl: 74, hp: 24000, atk: 990, def: 380, eva: 18, xp: 25000, sp: 250, gold: [7800, 15500], element: 'water' },
  corruptedSpiders: { name: 'Swamp Spider Matriarch', lvl: 75, hp: 26500, atk: 1050, def: 400, eva: 20, xp: 27500, sp: 270, gold: [8500, 17000], element: 'dark', traits: ['poison'] },
  screamingSouls: { name: 'Tormented Screaming Soul', lvl: 75, hp: 22000, atk: 600, def: 350, eva: 22, matk: 1200, mdef: 500, xp: 28000, sp: 280, gold: [8800, 17500], element: 'dark', magic: true },
  stakatoWarrior: { name: 'Stakato Armored Warrior', lvl: 75, hp: 29000, atk: 1120, def: 440, eva: 12, xp: 29500, sp: 290, gold: [9200, 18500] },
  stakatoQueenBrood: { name: 'Stakato Queen Broodmother', lvl: 76, hp: 46000, atk: 1300, def: 520, eva: 14, matk: 1100, mdef: 480, xp: 39000, sp: 420, gold: [15000, 31000], elite: true },
  swampAbomination: { name: 'Swamp Abomination Titan', lvl: 76, hp: 68000, atk: 1550, def: 590, eva: 14, xp: 52000, sp: 520, gold: [22000, 44000], boss: true },

  // ──────────────────────────────────────────────────────────────────────────
  // 20. ADEN CITY (Level 76-79)
  // ──────────────────────────────────────────────────────────────────────────
  royalKnight: { name: 'Aden Royal Guard', lvl: 76, hp: 22000, atk: 980, def: 380, eva: 8, xp: 24000, sp: 240, gold: [7500, 15000] },
  highMage: { name: 'Aden High Spellweaver', lvl: 77, hp: 19000, atk: 450, def: 320, eva: 10, matk: 1150, mdef: 450, xp: 28000, sp: 270, gold: [8800, 18000], magic: true },
  adenCrossbowman: { name: 'Aden Elite Crossbowman', lvl: 78, hp: 24000, atk: 1150, def: 360, eva: 18, xp: 31000, sp: 290, gold: [9600, 19500] },
  adenPaladin: { name: 'Aden Vanguard Paladin', lvl: 78, hp: 32000, atk: 1100, def: 480, eva: 8, xp: 33500, sp: 310, gold: [10500, 21500] },
  adenHighJusticiar: { name: 'Aden Grand Justiciar', lvl: 79, hp: 48000, atk: 1380, def: 540, eva: 10, xp: 42000, sp: 410, gold: [16000, 33000], elite: true },
  adenCommander: { name: 'Aden High Commander', lvl: 79, hp: 68000, atk: 1550, def: 600, eva: 10, xp: 52000, sp: 520, gold: [22000, 45000], boss: true },

  // ──────────────────────────────────────────────────────────────────────────
  // 21. DRAGON VALLEY (Level 80-84)
  // ──────────────────────────────────────────────────────────────────────────
  dragon: { name: 'Dragon Valley Drake', lvl: 80, hp: 28000, atk: 1150, def: 440, eva: 10, matk: 400, mdef: 300, xp: 32000, sp: 300, gold: [10000, 21000] },
  dragonKnight: { name: 'Dragon Knight Elite', lvl: 81, hp: 32000, atk: 1280, def: 490, eva: 10, xp: 37000, sp: 330, gold: [11500, 24000] },
  frostKnight: { name: 'Frost Knight', lvl: 82, hp: 36000, atk: 1400, def: 540, eva: 10, xp: 43000, sp: 370, gold: [13500, 28000], element: 'water' },
  frostLordDragon: { name: 'Frost Lord Dragon', lvl: 83, hp: 52000, atk: 1700, def: 640, eva: 12, xp: 65000, sp: 500, gold: [20000, 42000], element: 'water' },
  dragonValleyOverlord: { name: 'Dragon Valley High Overlord', lvl: 84, hp: 68000, atk: 1850, def: 720, eva: 14, xp: 82000, sp: 620, gold: [26000, 52000], elite: true },
  lindvior: { name: 'Lindvior Wind Sovereign', lvl: 84, hp: 95000, atk: 2100, def: 820, eva: 20, xp: 110000, sp: 800, gold: [35000, 70000], element: 'wind', boss: true },

  // ──────────────────────────────────────────────────────────────────────────
  // 22. IMPERIAL TOMB (Level 85-89)
  // ──────────────────────────────────────────────────────────────────────────
  tombGuardian: { name: 'Imperial Tomb Guardian', lvl: 85, hp: 40000, atk: 1500, def: 580, eva: 10, xp: 50000, sp: 420, gold: [15000, 30000], element: 'dark' },
  sepulcherArchon: { name: 'Sepulcher Archon', lvl: 86, hp: 44000, atk: 700, def: 500, eva: 12, matk: 1850, mdef: 750, xp: 58000, sp: 470, gold: [17500, 35000], element: 'dark', magic: true },
  undeadKnight: { name: 'Imperial Undead Knight', lvl: 87, hp: 52000, atk: 1750, def: 680, eva: 8, xp: 70000, sp: 550, gold: [21000, 42000], element: 'dark' },
  imperialGhostMage: { name: 'Imperial Ghost Mage', lvl: 88, hp: 48000, atk: 800, def: 560, eva: 14, matk: 2100, mdef: 880, xp: 82000, sp: 620, gold: [25000, 50000], element: 'dark', magic: true },
  lichLord: { name: 'Lich Lord Archmage', lvl: 88, hp: 78000, atk: 900, def: 620, eva: 15, matk: 2400, mdef: 1100, xp: 110000, sp: 800, gold: [32000, 65000], elite: true },
  deathKing: { name: 'Death King Supreme', lvl: 89, hp: 130000, atk: 2600, def: 1050, eva: 15, xp: 180000, sp: 1200, gold: [55000, 110000], boss: true },

  // ──────────────────────────────────────────────────────────────────────────
  // 23. ANTHARAS' LAIR (Level 90-94)
  // ──────────────────────────────────────────────────────────────────────────
  caveDrake: { name: 'Cave Drake', lvl: 90, hp: 65000, atk: 2100, def: 820, eva: 12, xp: 95000, sp: 700, gold: [28000, 56000], element: 'earth' },
  magmaBeast: { name: 'Magma Beast', lvl: 91, hp: 75000, atk: 2350, def: 900, eva: 10, xp: 115000, sp: 820, gold: [34000, 68000], element: 'fire' },
  earthDrake: { name: 'Earth Drake', lvl: 92, hp: 95000, atk: 2700, def: 1080, eva: 12, xp: 150000, sp: 1000, gold: [45000, 90000], element: 'earth' },
  caveWyrmBehemoth: { name: 'Cave Wyrm Behemoth', lvl: 93, hp: 115000, atk: 2900, def: 1180, eva: 10, xp: 175000, sp: 1150, gold: [52000, 105000], element: 'earth' },
  antharasBehemoth: { name: 'Antharas Guardian Behemoth', lvl: 94, hp: 160000, atk: 3300, def: 1320, eva: 12, xp: 230000, sp: 1500, gold: [70000, 140000], element: 'earth', elite: true },
  antharas: { name: 'Antharas Earth Dragon Lord', lvl: 94, hp: 250000, atk: 3800, def: 1500, eva: 15, xp: 350000, sp: 2200, gold: [100000, 200000], element: 'earth', boss: true },

  // ──────────────────────────────────────────────────────────────────────────
  // 24. FORGE OF THE GODS (Level 95-100)
  // ──────────────────────────────────────────────────────────────────────────
  valakasMinion: { name: 'Valakas Minion', lvl: 95, hp: 85000, atk: 2600, def: 1000, eva: 12, matk: 1800, mdef: 900, xp: 130000, sp: 900, gold: [38000, 76000], element: 'fire' },
  lavaGolem: { name: 'Lava Golem', lvl: 96, hp: 110000, atk: 2950, def: 1250, eva: 5, xp: 175000, sp: 1150, gold: [50000, 100000], element: 'fire' },
  flameArchon: { name: 'Flame Archon', lvl: 97, hp: 125000, atk: 1300, def: 1100, eva: 14, matk: 3600, mdef: 1500, xp: 210000, sp: 1350, gold: [60000, 120000], element: 'fire', magic: true },
  flameGiantDragon: { name: 'Flame Giant Dragon', lvl: 98, hp: 180000, atk: 3800, def: 1550, eva: 15, xp: 320000, sp: 1900, gold: [90000, 180000], element: 'fire' },
  vulcanLord: { name: 'Vulcan Lord', lvl: 99, hp: 220000, atk: 4200, def: 1700, eva: 18, xp: 420000, sp: 2400, gold: [120000, 240000], element: 'fire', elite: true },
  valakas: { name: 'Valakas Fire Sovereign Dragon', lvl: 100, hp: 450000, atk: 5500, def: 2200, eva: 20, xp: 800000, sp: 4500, gold: [250000, 500000], element: 'fire', boss: true }
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

