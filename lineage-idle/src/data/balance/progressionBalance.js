/**
 * progressionBalance.js — Balanceamento de Zonas, Faixas de CP e Progressão de Grau.
 *
 * Mapeia cada área de caça para seus requisitos de Nível, Minimum CP e Recommended CP.
 */

export const ZONE_CP_REQUIREMENTS = {
  talkingIsland:   { level: 1,  minCp: 150,    recCp: 300 },
  elvenForest:     { level: 3,  minCp: 350,    recCp: 600 },
  darkForest:      { level: 5,  minCp: 650,    recCp: 1100 },
  orcVillage:      { level: 7,  minCp: 1000,   recCp: 1500 },
  dwarvenMine:     { level: 9,  minCp: 1400,   recCp: 2200 },
  kamaelLair:      { level: 11, minCp: 1800,   recCp: 2800 },
  ruinedOutpost:   { level: 15, minCp: 2500,   recCp: 3800 },
  howlingMoor:     { level: 20, minCp: 3500,   recCp: 5500 },
  giranOutskirts:  { level: 25, minCp: 6500,   recCp: 9000 },
  orcenRuins:      { level: 30, minCp: 10000,  recCp: 14000 },
  forsakenCrypt:   { level: 35, minCp: 14000,  recCp: 18000 },
  blackCitadel:    { level: 40, minCp: 20000,  recCp: 28000 },
  gludioCastle:    { level: 45, minCp: 28000,  recCp: 38000 },
  wolfMountain:    { level: 48, minCp: 34000,  recCp: 46000 },
  riftOfTheVoid:   { level: 50, minCp: 40000,  recCp: 55000 },
  emeraldGrove:    { level: 60, minCp: 90000,  recCp: 115000 },
  underworldGate:  { level: 70, minCp: 170000, recCp: 210000 },
  valleyOfSaints:  { level: 72, minCp: 195000, recCp: 240000 },
  swampOfScreams:  { level: 74, minCp: 225000, recCp: 280000 },
  adenCity:        { level: 76, minCp: 260000, recCp: 320000 },
  dragonValley:    { level: 80, minCp: 330000, recCp: 420000 },
  imperialTomb:    { level: 85, minCp: 450000, recCp: 570000 },
  antharasLair:    { level: 90, minCp: 600000, recCp: 750000 },
  forgeOfGods:     { level: 95, minCp: 800000, recCp: 1000000 },

  // Necropolis & Catacombs
  necro_sacrifice: { level: 32, minCp: 11500,  recCp: 15500 },
  necro_pilgrim:   { level: 42, minCp: 23000,  recCp: 32000 },
  necro_worship:   { level: 52, minCp: 48000,  recCp: 65000 },
  necro_patriot:   { level: 62, minCp: 100000, recCp: 130000 },
  necro_ascetics:  { level: 72, minCp: 195000, recCp: 240000 },
  necro_martyrs:   { level: 76, minCp: 260000, recCp: 320000 },
  necro_apostles:  { level: 80, minCp: 330000, recCp: 420000 },
  necro_disciple:  { level: 84, minCp: 430000, recCp: 540000 }
};

/**
 * Retorna os dados de progressão e requisitos de CP de uma zona.
 * @param {string} zoneId
 * @returns {{ level: number, minCp: number, recCp: number }}
 */
export function getZoneProgression(zoneId) {
  return ZONE_CP_REQUIREMENTS[zoneId] || { level: 1, minCp: 100, recCp: 300 };
}
