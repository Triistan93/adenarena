/**
 * Fortress Siege System Data (Lineage II Canonical)
 * 5 Fortalezas estratégicas, produção contínua de Knight's Epaulettes e buffs de território.
 */

export const FORTRESSES = {
  aaru_fortress: {
    id: 'aaru_fortress',
    name: 'Aaru Fortress 🛡️',
    region: 'Gludio Territory',
    level: 55,
    epauletteRate: 15, // epaulettes por minuto
    defenders: { hp: 120000, pAtk: 1100, pDef: 950 },
    generators: 3,
    buff: { stat: 'pDef', val: 0.05, label: '+5% P.Def de Fronteira' }
  },
  demon_fortress: {
    id: 'demon_fortress',
    name: 'Demon Fortress 😈',
    region: 'Dion Territory',
    level: 65,
    epauletteRate: 25,
    defenders: { hp: 180000, pAtk: 1400, pDef: 1200 },
    generators: 3,
    buff: { stat: 'mDef', val: 0.06, label: '+6% M.Def de Fronteira' }
  },
  dragonspine_fortress: {
    id: 'dragonspine_fortress',
    name: 'Dragonspine Fortress 🐉',
    region: 'Giran Territory',
    level: 72,
    epauletteRate: 40,
    defenders: { hp: 260000, pAtk: 1800, pDef: 1500 },
    generators: 3,
    buff: { stat: 'pAtk', val: 0.06, label: '+6% P.Atk Territorial' }
  },
  hive_fortress: {
    id: 'hive_fortress',
    name: 'Hive Fortress 🐝',
    region: 'Goddard Territory',
    level: 78,
    epauletteRate: 60,
    defenders: { hp: 350000, pAtk: 2200, pDef: 1800 },
    generators: 4,
    buff: { stat: 'crit', val: 15, label: '+15 Critical Rate' }
  },
  monastic_fortress: {
    id: 'monastic_fortress',
    name: 'Monastic Fortress ⛪',
    region: 'Rune & Aden Territory',
    level: 82,
    epauletteRate: 90,
    defenders: { hp: 480000, pAtk: 2600, pDef: 2100 },
    generators: 4,
    buff: { stat: 'matk', val: 0.08, label: '+8% M.Atk Territorial' }
  }
};
