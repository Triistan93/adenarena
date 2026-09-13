/**
 * chaosBossBalance.js — Balanceamento Canônico e Droplist por Season do Chefe do Caos.
 *
 * Autoridade: MASTER GAME DATA CONTRACT v1.0 & MASTER PROGRESSION CONTRACT v1.0.
 *
 * Regras:
 * 1. Custo de Invocação: 50 Essências de Fogo + 50 Essências de Água + 25.000 Adena.
 * 2. Multiplicadores de Atributos: HP x2.0, Atk x1.5, Def x1.3.
 * 3. Droplist Estruturada por Season (Revogado o drop de 100% Top Life Stone).
 */

export const CHAOS_BOSS_SUMMON_COST = {
  essences: {
    fire: 50,
    water: 50
  },
  gold: 25000
};

export const CHAOS_BOSS_STAT_MULTIPLIERS = {
  hp: 2.0,
  atk: 1.5,
  def: 1.3,
  exp: 3.0,
  sp: 3.0,
  gold: 3.0
};

export const CHAOS_BOSS_DROPLIST_BY_SEASON = {
  1: {
    name: 'Season 1 (Lv 1–40)',
    goldMin: 50000,
    goldMax: 100000,
    guaranteed: [
      { itemId: 'scroll_of_enchant_weapon_', count: 1, rarity: 'rare' }
    ],
    chanceDrops: [
      { itemId: 'lifestone_mid', chance: 0.50, count: 1, rarity: 'epic' },
      { itemId: 'lifestone_high', chance: 0.10, count: 1, rarity: 'legendary' }
    ]
  },
  2: {
    name: 'Season 2 (Lv 41–80)',
    goldMin: 150000,
    goldMax: 300000,
    guaranteed: [
      { itemId: 'scroll_of_enchant_weapon_', count: 2, rarity: 'rare' }
    ],
    chanceDrops: [
      { itemId: 'lifestone_mid', chance: 0.70, count: 1, rarity: 'epic' },
      { itemId: 'lifestone_high', chance: 0.30, count: 1, rarity: 'legendary' },
      { itemId: 'lifestone_top', chance: 0.05, count: 1, rarity: 'sovereign' }
    ]
  },
  3: {
    name: 'Season 3 (Lv 81+)',
    goldMin: 500000,
    goldMax: 1000000,
    guaranteed: [
      { itemId: 'scroll_of_enchant_weapon_', count: 3, rarity: 'rare' }
    ],
    chanceDrops: [
      { itemId: 'lifestone_high', chance: 0.60, count: 1, rarity: 'legendary' },
      { itemId: 'lifestone_top', chance: 0.25, count: 1, rarity: 'sovereign' }
    ]
  }
};

/**
 * Retorna a season atual com base no nível do jogador ou temporada do servidor.
 * @param {number} level
 * @returns {1|2|3}
 */
export function getSeasonForLevel(level) {
  const lvl = Number(level) || 1;
  if (lvl <= 40) return 1;
  if (lvl <= 80) return 2;
  return 3;
}
