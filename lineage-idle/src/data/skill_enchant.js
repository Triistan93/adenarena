/**
 * skill_enchant.js — Definições e Tabelas de Encantamento de Habilidades (+1 a +30).
 *
 * Contém as 4 rotas canônicas (Power, Cost, Chance/Time, Element),
 * chances progressivas, custos de SP e Adena, e os livros Giant's Codex.
 */

export const ENCHANT_ROUTES = {
  power: {
    id: 'power',
    name: 'Rota de Poder (Power) ⚔️',
    desc: 'Aumenta o dano base e eficácia da habilidade em +3% por nível (+90% no +30).',
    bonusPerLevel: 0.03,
    type: 'damage'
  },
  cost: {
    id: 'cost',
    name: 'Rota de Custo (Cost) 💧',
    desc: 'Reduz o consumo de MP da habilidade em -2.5% por nível (-75% no +30).',
    bonusPerLevel: 0.025,
    type: 'mp_cost'
  },
  chance: {
    id: 'chance',
    name: 'Rota de Acerto & Duração (Chance/Time) 🎯',
    desc: 'Aumenta a taxa de acerto de debuff em +2% por nível ou estende o tempo de buff.',
    bonusPerLevel: 0.02,
    type: 'chance_duration'
  },
  element: {
    id: 'element',
    name: 'Rota Elemental (Element) 🔥❄️',
    desc: 'Imbui o golpe com +12 de Atributo Elemental por nível (+360 Element no +30).',
    bonusPerLevel: 12,
    type: 'elemental_power'
  }
};

/**
 * Tabela de taxas de sucesso e custos para cada nível (+1 até +30).
 */
export function getEnchantLevelData(targetLevel) {
  const lvl = Math.max(1, Math.min(30, targetLevel));

  // Cálculo de chance de sucesso
  let successRate = 0.95;
  if (lvl <= 3) successRate = 0.95;
  else if (lvl <= 6) successRate = 0.85;
  else if (lvl <= 9) successRate = 0.70;
  else if (lvl <= 12) successRate = 0.55;
  else if (lvl <= 15) successRate = 0.42;
  else if (lvl <= 20) successRate = 0.30;
  else if (lvl <= 25) successRate = 0.20;
  else successRate = 0.10; // +26 a +30

  const spCost = Math.round(50000 * Math.pow(1.15, lvl - 1));
  const adenaCost = Math.round(150000 * Math.pow(1.18, lvl - 1));

  return {
    targetLevel: lvl,
    successRate,
    successRatePercent: Math.round(successRate * 100),
    spCost,
    adenaCost,
    reqItemNormal: 'giants_codex',
    reqItemMastery: 'giants_codex_mastery'
  };
}

export const ENCHANT_ITEMS = {
  giants_codex: {
    id: 'giants_codex',
    name: "Giant's Codex 📜",
    desc: "Tomo sagrado dos Gigantes de Aden. Usado para encantar habilidades de +1 a +30. Em caso de falha, o encantamento retorna a +0.",
    icon: 'gradespecial/scrolls/scroll_enchant_weapon_s.png',
    price: 1500000
  },
  giants_codex_mastery: {
    id: 'giants_codex_mastery',
    name: "Giant's Codex - Mastery 🌟",
    desc: "Tomo supremo selado por Einhasad. Em caso de falha, o nível de encantamento atual é PRESERVADO (não reseta).",
    icon: 'gradespecial/scrolls/scroll_blessed_weapon_s.png',
    price: 5000000
  }
};
