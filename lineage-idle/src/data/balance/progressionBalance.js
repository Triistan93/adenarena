/**
 * progressionBalance.js — Balanceamento de Zonas, Faixas de CP e Progressão de Grau.
 *
 * Mapeia cada área de caça para seus requisitos de Nível, Minimum CP e Recommended CP.
 */

export const ZONE_CP_REQUIREMENTS = {
  talkingIsland:   { level: 1,  minCp: 200,    recCp: 600 },
  elvenForest:     { level: 3,  minCp: 500,    recCp: 1000 },
  darkForest:      { level: 5,  minCp: 800,    recCp: 1500 },
  orcVillage:      { level: 7,  minCp: 1200,   recCp: 2000 },
  dwarvenMine:     { level: 9,  minCp: 1500,   recCp: 2500 },
  kamaelLair:      { level: 11, minCp: 1800,   recCp: 3000 },
  ruinedOutpost:   { level: 15, minCp: 2200,   recCp: 3500 },
  howlingMoor:     { level: 20, minCp: 2800,   recCp: 4200 },
  giranOutskirts:  { level: 25, minCp: 3800,   recCp: 5500 },
  orcenRuins:      { level: 30, minCp: 4800,   recCp: 7000 },
  forsakenCrypt:   { level: 35, minCp: 6000,   recCp: 8500 },
  blackCitadel:    { level: 40, minCp: 7500,   recCp: 11000 },
  gludioCastle:    { level: 45, minCp: 10000,  recCp: 15000 },
  wolfMountain:    { level: 48, minCp: 12500,  recCp: 18000 },
  riftOfTheVoid:   { level: 50, minCp: 15000,  recCp: 22000 },
  emeraldGrove:    { level: 60, minCp: 24000,  recCp: 35000 },
  underworldGate:  { level: 70, minCp: 38000,  recCp: 50000 },
  valleyOfSaints:  { level: 72, minCp: 42000,  recCp: 56000 },
  swampOfScreams:  { level: 74, minCp: 46000,  recCp: 62000 },
  adenCity:        { level: 76, minCp: 50000,  recCp: 70000 },
  dragonValley:    { level: 80, minCp: 65000,  recCp: 90000 },
  imperialTomb:    { level: 85, minCp: 80000,  recCp: 110000 },
  antharasLair:    { level: 90, minCp: 105000, recCp: 140000 },
  forgeOfGods:     { level: 95, minCp: 130000, recCp: 180000 },

  // Necropolis & Catacombs
  necro_sacrifice: { level: 32, minCp: 4500,   recCp: 6500 },
  necro_pilgrim:   { level: 42, minCp: 8000,   recCp: 12000 },
  necro_worship:   { level: 52, minCp: 16000,  recCp: 24000 },
  necro_patriot:   { level: 62, minCp: 26000,  recCp: 38000 },
  necro_ascetics:  { level: 72, minCp: 42000,  recCp: 58000 },
  necro_martyrs:   { level: 76, minCp: 52000,  recCp: 72000 },
  necro_apostles:  { level: 80, minCp: 68000,  recCp: 92000 },
  necro_disciple:  { level: 84, minCp: 82000,  recCp: 112000 }
};

/**
 * Retorna os dados de progressão e requisitos de CP de uma zona.
 * @param {string} zoneId
 * @returns {{ level: number, minCp: number, recCp: number }}
 */
export function getZoneProgression(zoneId) {
  return ZONE_CP_REQUIREMENTS[zoneId] || { level: 1, minCp: 100, recCp: 300 };
}
