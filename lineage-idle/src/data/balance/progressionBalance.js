/**
 * progressionBalance.js — Balanceamento de Zonas, Faixas de CP e Progressão de Grau.
 *
 * Mapeia cada área de caça para seus requisitos de Nível, Minimum CP e Recommended CP.
 */

export const ZONE_CP_REQUIREMENTS = {
  talkingIsland:   { level: 1,  minCp: 80,     recCp: 180 },
  elvenForest:     { level: 3,  minCp: 120,    recCp: 240 },
  darkForest:      { level: 5,  minCp: 160,    recCp: 320 },
  orcVillage:      { level: 7,  minCp: 200,    recCp: 400 },
  dwarvenMine:     { level: 9,  minCp: 260,    recCp: 520 },
  kamaelLair:      { level: 11, minCp: 320,    recCp: 640 },
  ruinedOutpost:   { level: 15, minCp: 420,    recCp: 840 },
  howlingMoor:     { level: 20, minCp: 600,    recCp: 1200 },
  giranOutskirts:  { level: 25, minCp: 750,    recCp: 1500 },
  orcenRuins:      { level: 30, minCp: 900,    recCp: 1800 },
  forsakenCrypt:   { level: 35, minCp: 1100,   recCp: 2200 },
  blackCitadel:    { level: 40, minCp: 1300,   recCp: 2600 },
  gludioCastle:    { level: 45, minCp: 1700,   recCp: 3400 },
  wolfMountain:    { level: 48, minCp: 2000,   recCp: 4000 },
  riftOfTheVoid:   { level: 50, minCp: 2400,   recCp: 4800 },
  emeraldGrove:    { level: 60, minCp: 3500,   recCp: 7000 },
  underworldGate:  { level: 70, minCp: 5500,   recCp: 11000 },
  valleyOfSaints:  { level: 72, minCp: 6500,   recCp: 13000 },
  swampOfScreams:  { level: 74, minCp: 7500,   recCp: 15000 },
  adenCity:        { level: 76, minCp: 9000,   recCp: 18000 },
  dragonValley:    { level: 80, minCp: 12000,  recCp: 24000 },
  imperialTomb:    { level: 85, minCp: 20000,  recCp: 40000 },
  antharasLair:    { level: 90, minCp: 35000,  recCp: 70000 },
  forgeOfGods:     { level: 95, minCp: 800000, recCp: 1000000 },

  // Necropolis & Catacombs
  necro_sacrifice: { level: 32, minCp: 1000,   recCp: 2000 },
  necro_pilgrim:   { level: 42, minCp: 1500,   recCp: 3000 },
  necro_worship:   { level: 52, minCp: 2700,   recCp: 5400 },
  necro_patriot:   { level: 62, minCp: 4000,   recCp: 8000 },
  necro_ascetics:  { level: 72, minCp: 6500,   recCp: 13000 },
  necro_martyrs:   { level: 76, minCp: 9000,   recCp: 18000 },
  necro_apostles:  { level: 80, minCp: 12000,  recCp: 24000 },
  necro_disciple:  { level: 84, minCp: 16000,  recCp: 32000 }
};

/**
 * Retorna os dados de progressão e requisitos de CP de uma zona.
 * @param {string} zoneId
 * @returns {{ level: number, minCp: number, recCp: number }}
 */
export function getZoneProgression(zoneId) {
  return ZONE_CP_REQUIREMENTS[zoneId] || { level: 1, minCp: 100, recCp: 300 };
}
