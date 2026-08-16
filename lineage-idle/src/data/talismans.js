/**
 * Bracelets & Talismans System (Lineage II Canonical)
 * Braceletes com 1 a 4 slots de talismãs e catálogo de talismãs equipáveis com efeitos táticos.
 */

export const BRACELETS = {
  bracelet_steel: {
    id: 'bracelet_steel',
    name: 'Steel Bracelet (D-Grade)',
    grade: 'D',
    slots: 1,
    costEpaulettes: 150,
    icon: '📿',
    desc: 'Bracelete básico de aço com 1 slot para talismã.'
  },
  bracelet_bronze: {
    id: 'bracelet_bronze',
    name: 'Bronze Bracelet (C-Grade)',
    grade: 'C',
    slots: 2,
    costEpaulettes: 400,
    icon: '📿',
    desc: 'Bracelete de bronze refinado com 2 slots para talismãs.'
  },
  bracelet_silver: {
    id: 'bracelet_silver',
    name: 'Mithril Bracelet (B-Grade)',
    grade: 'B',
    slots: 3,
    costEpaulettes: 900,
    icon: '📿',
    desc: 'Bracelete de Mithril com 3 slots para talismãs.'
  },
  bracelet_gold: {
    id: 'bracelet_gold',
    name: 'Gold Bracelet (A-Grade)',
    grade: 'A',
    slots: 4,
    costEpaulettes: 2000,
    icon: '📿',
    desc: 'Bracelete dourado nobre com 4 slots para talismãs.'
  },
  bracelet_dynasty: {
    id: 'bracelet_dynasty',
    name: 'Dynasty Bracelet (S-Grade 👑)',
    grade: 'S',
    slots: 4,
    costEpaulettes: 5000,
    icon: '👑',
    desc: 'Bracelete imperial soberano com 4 slots e amplificação de 10% na eficácia de todos os talismãs.'
  }
};

export const TALISMANS = {
  talisman_power: {
    id: 'talisman_power',
    name: 'Talisman of Power ⚔️',
    icon: '⚔️',
    costEpaulettes: 100,
    desc: '+6% P.Atk e +6% M.Atk',
    stats: { pAtkMult: 0.06, mAtkMult: 0.06 }
  },
  talisman_defense: {
    id: 'talisman_defense',
    name: 'Talisman of Defense 🛡️',
    icon: '🛡️',
    costEpaulettes: 100,
    desc: '+8% P.Def e +8% M.Def',
    stats: { pDefMult: 0.08, mDefMult: 0.08 }
  },
  talisman_haste: {
    id: 'talisman_haste',
    name: 'Talisman of Speed & Haste ⚡',
    icon: '⚡',
    costEpaulettes: 120,
    desc: '+15 Velocidade de Ataque e +10 Evasão',
    stats: { speed: 15, eva: 10 }
  },
  talisman_crit: {
    id: 'talisman_crit',
    name: 'Talisman of Critical Destruction 💥',
    icon: '💥',
    costEpaulettes: 150,
    desc: '+25 Chance Crítica e +8% Dano Crítico',
    stats: { crit: 25, critDmg: 0.08 }
  },
  talisman_life_force: {
    id: 'talisman_life_force',
    name: 'Talisman of Life Force 🌿',
    icon: '🌿',
    costEpaulettes: 200,
    desc: '+15% HP Máximo e +25% Regeneração de MP',
    stats: { hpMult: 0.15, mpRegen: 0.25 }
  },
  talisman_cancel: {
    id: 'talisman_cancel',
    name: 'Talisman of Buff Cancel 🌀',
    icon: '🌀',
    costEpaulettes: 250,
    desc: '+10% Dano PvP e chance de anular bônus defensivos do alvo',
    stats: { pvpDmg: 0.10, pAtkMult: 0.04 }
  }
};
