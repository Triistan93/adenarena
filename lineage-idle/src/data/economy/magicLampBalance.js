/**
 * magicLampBalance.js — Tabela Canônica de Recompensas e Balanceamento da Lâmpada Mágica.
 *
 * Autoridade: MASTER GAME DATA CONTRACT v1.0 & MASTER PROGRESSION CONTRACT v1.0.
 *
 * Probabilidades Canônicas:
 * - Carta Azul (Normal): 75%
 * - Carta Roxa (Bônus Alto): 20%
 * - Carta Vermelha (Super Jackpot): 5%
 *
 * Recompensas escalonadas por faixas de nível do personagem (Lv 20 a 85+).
 */

export const MAGIC_LAMP_EXP_THRESHOLD = 50000; // EXP para gerar 1 lâmpada

export const MAGIC_LAMP_PROBABILITIES = {
  blue: 0.75,
  purple: 0.20,
  red: 0.05
};

export const MAGIC_LAMP_REWARD_TABLE = [
  {
    minLevel: 20,
    maxLevel: 39,
    bracket: '20-39 (D-Grade)',
    rewards: {
      blue:   { exp: 6000,   sp: 600,  name: '🟦 Carta Azul (Normal)' },
      purple: { exp: 18000,  sp: 1800, name: '🟪 Carta Roxa (Bônus Alto)' },
      red:    { exp: 50000,  sp: 5000, name: '🟥 Carta Vermelha (SUPER JACKPOT!)' }
    },
    expectedExp: 10600,
    expectedSp: 1060
  },
  {
    minLevel: 40,
    maxLevel: 51,
    bracket: '40-51 (C-Grade)',
    rewards: {
      blue:   { exp: 25000,  sp: 2500,  name: '🟦 Carta Azul (Normal)' },
      purple: { exp: 75000,  sp: 7500,  name: '🟪 Carta Roxa (Bônus Alto)' },
      red:    { exp: 200000, sp: 20000, name: '🟥 Carta Vermelha (SUPER JACKPOT!)' }
    },
    expectedExp: 43750,
    expectedSp: 4375
  },
  {
    minLevel: 52,
    maxLevel: 61,
    bracket: '52-61 (B-Grade)',
    rewards: {
      blue:   { exp: 60000,  sp: 6000,  name: '🟦 Carta Azul (Normal)' },
      purple: { exp: 180000, sp: 18000, name: '🟪 Carta Roxa (Bônus Alto)' },
      red:    { exp: 450000, sp: 45000, name: '🟥 Carta Vermelha (SUPER JACKPOT!)' }
    },
    expectedExp: 103500,
    expectedSp: 10350
  },
  {
    minLevel: 62,
    maxLevel: 75,
    bracket: '62-75 (A-Grade)',
    rewards: {
      blue:   { exp: 150000,  sp: 15000,  name: '🟦 Carta Azul (Normal)' },
      purple: { exp: 450000,  sp: 45000,  name: '🟪 Carta Roxa (Bônus Alto)' },
      red:    { exp: 1200000, sp: 120000, name: '🟥 Carta Vermelha (SUPER JACKPOT!)' }
    },
    expectedExp: 262500,
    expectedSp: 26250
  },
  {
    minLevel: 76,
    maxLevel: 84,
    bracket: '76-84 (S-Grade)',
    rewards: {
      blue:   { exp: 350000,  sp: 35000,  name: '🟦 Carta Azul (Normal)' },
      purple: { exp: 1000000, sp: 100000, name: '🟪 Carta Roxa (Bônus Alto)' },
      red:    { exp: 3000000, sp: 300000, name: '🟥 Carta Vermelha (SUPER JACKPOT!)' }
    },
    expectedExp: 612500,
    expectedSp: 61250
  },
  {
    minLevel: 85,
    maxLevel: 999,
    bracket: '85+ (S84)',
    rewards: {
      blue:   { exp: 800000,  sp: 80000,  name: '🟦 Carta Azul (Normal)' },
      purple: { exp: 2500000, sp: 250000, name: '🟪 Carta Roxa (Bônus Alto)' },
      red:    { exp: 7000000, sp: 700000, name: '🟥 Carta Vermelha (SUPER JACKPOT!)' }
    },
    expectedExp: 1450000,
    expectedSp: 145000
  }
];

/**
 * Retorna as recompensas da Lâmpada Mágica para o nível fornecido.
 * @param {number} level
 * @returns {Object}
 */
export function getMagicLampRewardBracket(level) {
  const lvl = Math.max(1, Number(level) || 1);
  const found = MAGIC_LAMP_REWARD_TABLE.find(b => lvl >= b.minLevel && lvl <= b.maxLevel);
  return found || MAGIC_LAMP_REWARD_TABLE[0];
}

/**
 * Realiza o sorteio de uma carta da Lâmpada Mágica com base no nível do jogador.
 * @param {number} level
 * @returns {{ cardType: 'blue'|'purple'|'red', expWon: number, spWon: number, cardName: string, bracket: string }}
 */
export function rollMagicLampCard(level) {
  const bracket = getMagicLampRewardBracket(level);
  const roll = Math.random();

  let cardType = 'blue';
  if (roll < MAGIC_LAMP_PROBABILITIES.red) {
    cardType = 'red';
  } else if (roll < (MAGIC_LAMP_PROBABILITIES.red + MAGIC_LAMP_PROBABILITIES.purple)) {
    cardType = 'purple';
  } else {
    cardType = 'blue';
  }

  const rew = bracket.rewards[cardType];
  return {
    cardType,
    expWon: rew.exp,
    spWon: rew.sp,
    cardName: rew.name,
    bracket: bracket.bracket
  };
}
