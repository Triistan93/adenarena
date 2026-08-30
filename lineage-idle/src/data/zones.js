/**
 * zones.js — Definições de Zonas, Sagas e Backgrounds do Lineage Idle.
 * Extraído de lineage-idle/main.js (linhas 57-88, 3778-3808)
 */

/**
 * Capítulos de progressão da história.
 * Cada Saga desbloqueia um conjunto de zonas quando o jogador atingir `unlocksAt`.
 */
export const SAGAS = [
  { id: 'interlude', name: 'Interlude', level: 0, unlocksAt: 0, zones: ['talkingIsland', 'elvenForest', 'darkForest', 'orcVillage', 'dwarvenMine', 'kamaelLair', 'ruinedOutpost', 'howlingMoor'] },
  { id: 'prelude', name: 'Prelude of War', level: 1, unlocksAt: 20, zones: ['giranOutskirts', 'orcenRuins', 'forsakenCrypt', 'blackCitadel'] },
  { id: 'saga1', name: 'Saga I: The Awakening', level: 2, unlocksAt: 40, zones: ['gludioCastle', 'wolfMountain', 'riftOfTheVoid', 'emeraldGrove', 'underworldGate', 'valleyOfSaints', 'swampOfScreams'] },
  { id: 'saga2', name: 'Saga II: The Shadow', level: 3, unlocksAt: 76, zones: ['adenCity', 'dragonValley'] },
  { id: 'saga3', name: 'Saga III: Realm of the Gods', level: 4, unlocksAt: 85, zones: ['imperialTomb', 'antharasLair', 'forgeOfGods'] }
];

export function getSagaDef(idOrIndex) {
  if (idOrIndex === undefined || idOrIndex === null) return SAGAS[0];
  if (typeof idOrIndex === 'number') return SAGAS[idOrIndex] || SAGAS[0];
  const sStr = String(idOrIndex).toLowerCase();
  return SAGAS.find(s => s.id === sStr || s.name.toLowerCase() === sStr) || SAGAS[0];
}

/**
 * Mapa de zonas de caça.
 * Cada zona define: nome, nível mínimo, monstros, boss, shop e se é town.
 */
export const ZONES = {
  talkingIsland:   { name: 'Talking Island', level: 1, monsters: ['goblin', 'goblinThief', 'armoredGoblin', 'goblinMage', 'talkingIslandWerewolf'], boss: 'goblinKing', shop: 'talkingIsland', town: true },
  elvenForest:     { name: 'Elven Forest', level: 3, monsters: ['wolf', 'grayWolf', 'rootWitch', 'greenDryad', 'sporeFungus', 'kabooOrcFighter'], boss: 'deathTrent', shop: 'talkingIsland' },
  darkForest:      { name: 'Dark Forest', level: 5, monsters: ['spider', 'swampWalker', 'lesserDarkHorror', 'marshStalker', 'shadowFangWolf'], boss: 'darkForestMatriarch', shop: 'talkingIsland' },
  orcVillage:      { name: 'Orc Village', level: 7, monsters: ['orc', 'kashaWolf', 'kashaBear', 'kashaOrcArcher', 'kashaOrcBerserker'], boss: 'kashaOrcOverlord', shop: 'talkingIsland' },
  dwarvenMine:     { name: 'Dwarven Mine', level: 9, monsters: ['kobold', 'goblinBrigand', 'mineCaveBat', 'mithrilGolem', 'koboldLeader'], boss: 'dwarvenEarthLord', shop: 'talkingIsland' },
  kamaelLair:      { name: 'Kamael Lair', level: 11, monsters: ['kamaelScout', 'soullessScout', 'spitefulGhost', 'crimsonWarder', 'kamaelInfiltrator'], boss: 'darkInquisitorKamael', shop: 'talkingIsland' },
  ruinedOutpost:   { name: 'Ruined Outpost', level: 15, monsters: ['ruinedGoblinThief', 'ruinedOrc', 'outpostMarksman', 'ruinedDeserter', 'shadowMercenary'], boss: 'outpostFallenCaptain', shop: 'talkingIsland', town: false },
  howlingMoor:     { name: 'Howling Moor', level: 20, monsters: ['direWolf', 'babyTiamat', 'crimsonBabyDragon', 'ancientSatyr', 'satyrWarlord'], boss: 'alphaWolf', shop: 'gludioCastle', town: false },
  giranOutskirts:  { name: 'Giran Outskirts', level: 25, monsters: ['skeleton', 'skeletonArcher', 'deathRider', 'giranGargoyle', 'giranGladiator'], boss: 'minotaurKnight', shop: 'giranOutskirts', town: true },
  orcenRuins:      { name: 'Orcen Ruins', level: 30, monsters: ['orcenRuinsOrc', 'cursedWarrior', 'ruinShamanOrc', 'tombLooterOrc', 'ancientOrcExecutioner'], boss: 'orcenOverlord', shop: 'giranOutskirts' },
  forsakenCrypt:   { name: 'Forsaken Crypt', level: 35, monsters: ['darkMage', 'corpseWorm', 'furiousSouls', 'cryptVampire', 'devilBone'], boss: 'cryptLord', shop: 'gludioCastle', town: false },
  blackCitadel:    { name: 'Black Citadel', level: 40, monsters: ['deathKnight', 'deathWizard', 'citadelDarkPriest', 'blackDragonWhelp', 'blackDragon'], boss: 'flamingDemonLord', shop: 'dragonValley', town: true },
  gludioCastle:    { name: 'Gludio Castle', level: 45, monsters: ['knight', 'cursedKnight', 'gludioRoyalArcher', 'gludioSorcerer', 'gludioShieldMaster'], boss: 'gludioCommander', shop: 'gludioCastle', town: true },
  wolfMountain:    { name: 'Wolf Mountain', level: 48, monsters: ['mountainWolf', 'mountainDireWolf', 'frostStalkerWolf', 'mountainSnowBear', 'frostFangBehemoth'], boss: 'mountainAlphaWolf', shop: 'gludioCastle' },
  riftOfTheVoid:   { name: 'Rift of the Void', level: 50, monsters: ['voidCreature', 'voidBrute', 'voidStalker', 'beholder', 'voidArchonEntity'], boss: 'voidDragonLord', shop: 'dragonValley', town: false },
  emeraldGrove:    { name: 'Emerald Grove', level: 60, monsters: ['emeraldSnake', 'emeraldDrake', 'jadeGolem', 'groveSpiritMage', 'emeraldDragon'], boss: 'fafurion', shop: 'dragonValley', town: false },
  underworldGate:  { name: 'Gates of the Underworld', level: 70, monsters: ['blazingWerewolf', 'swiftBlaze', 'infernalHound', 'lavaFiend', 'flameOverlordDemon'], boss: 'cerberus', shop: 'dragonValley', town: false },
  valleyOfSaints:  { name: 'Valley of Saints', level: 72, monsters: ['saintEye', 'saintGuardian', 'splendorLight', 'celestialArchon', 'divineSeraphim'], boss: 'splendorKnight', shop: 'adenCity', town: false },
  swampOfScreams:  { name: 'Swamp of Screams', level: 74, monsters: ['swampStrikers', 'corruptedSpiders', 'screamingSouls', 'stakatoWarrior', 'stakatoQueenBrood'], boss: 'swampAbomination', shop: 'adenCity', town: false },
  adenCity:        { name: 'Aden City', level: 76, monsters: ['royalKnight', 'highMage', 'adenCrossbowman', 'adenPaladin', 'adenHighJusticiar'], boss: 'adenCommander', shop: 'adenCity', town: true },
  dragonValley:    { name: 'Dragon Valley', level: 80, monsters: ['dragon', 'dragonKnight', 'frostKnight', 'frostLordDragon', 'dragonValleyOverlord'], boss: 'lindvior', shop: 'dragonValley', town: true },
  imperialTomb:    { name: 'Imperial Tomb', level: 85, monsters: ['tombGuardian', 'sepulcherArchon', 'undeadKnight', 'imperialGhostMage', 'lichLord'], boss: 'deathKing', shop: 'adenCity', town: false },
  antharasLair:    { name: "Antharas' Lair", level: 90, monsters: ['caveDrake', 'magmaBeast', 'earthDrake', 'caveWyrmBehemoth', 'antharasBehemoth'], boss: 'antharas', shop: 'dragonValley', town: false },
  forgeOfGods:     { name: 'Forge of the Gods', level: 95, monsters: ['valakasMinion', 'lavaGolem', 'flameArchon', 'flameGiantDragon', 'vulcanLord'], boss: 'valakas', shop: 'dragonValley', town: false }
};

/**
 * Mapa de imagens de background para cada zona e boss de raid.
 * Usado por updateZoneBackground() ao entrar em uma nova zona.
 */
export const ZONE_BACKGROUNDS = {
  // Vilas e bases iniciais
  talkingIsland:  '/img/Maps/talkingIsland.png',
  elvenForest:    '/img/Maps/elvenForest.png',
  darkForest:     '/img/Maps/DarkElvenForest.png',
  orcVillage:     '/img/Maps/orcVillage.png',
  dwarvenMine:    '/img/Maps/dwarvenMine.png',
  kamaelLair:     '/img/Maps/kamaellair.jpg',
  ruinedOutpost:  '/img/ruinedOutpost.png',
  howlingMoor:    '/img/Maps/howlingmoor.jpg',

  // Zonas de caça e castelos
  giranOutskirts: '/img/Maps/giraoutskirts.jpg',
  orcenRuins:     '/img/Maps/orcenRuins.png',
  forsakenCrypt:  '/img/Maps/forsakencrypt.jpg',
  blackCitadel:   '/img/Maps/blackcitaddel.jpg',
  gludioCastle:   '/img/Maps/gludiocastle.jpg',
  wolfMountain:   '/img/Maps/wolfMountain.jpg',
  riftOfTheVoid:  '/img/Maps/riftofthevoid.jpg',
  emeraldGrove:   '/img/Maps/emeraldgrove.jpg',
  underworldGate: '/img/Maps/gatesoftheunderworld.jpg',
  valleyOfSaints: '/img/Maps/valleyofsaints.jpg',
  swampOfScreams: '/img/Maps/swampofscreams.jpg',
  adenCity:       '/img/Maps/adencity.jpg',
  dragonValley:   '/img/Maps/dragonvalley.jpg',
  imperialTomb:   '/img/Maps/imperialtomb.jpg',
  antharasLair:   '/img/Maps/antharaslair.jpg',
  forgeOfGods:    '/img/Maps/forgeofgods.jpg',

  // Raid Bosses e Arenas Épicas
  queen_ant:      '/img/Maps/queenant.jpg',
  zaken:          '/img/Maps/zaken.jpg',
  frintezza:      '/img/Maps/frintezza.jpg',
  baium:          '/img/Maps/baium.jpg',
  antharas:       '/img/Maps/antharaslair.jpg',
  valakas:        '/img/Maps/forgeofgods.jpg',
  barakiel:       '/img/Maps/valleyofsaints.jpg'
};

