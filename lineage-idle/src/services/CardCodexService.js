/**
 * CardCodexService.js — Gerenciador do Sistema de Cartas de Monstros, Codex e Engaste em Equipamentos.
 */

import { MONSTERS } from '../data/monsters.js';
import { RAID_BOSSES } from '../data/raids.js';

export const MONSTER_CARDS = {};

// 1. Chefes Épicos & Raid Bosses com stats de alta linhagem
const EPIC_RAID_CARDS = {
  card_queen_ant: {
    id: 'card_queen_ant',
    name: 'Carta Rainha Formiga (Queen Ant)',
    monster: 'Queen Ant',
    icon: 'assets/2d/monsters/chaos-32x/PNG/Transperent/Icon30.png',
    rarity: 'epic',
    dropChance: 0.015,
    socketBonus: { critRate: 15, critDmg: 0.12 },
    codexBonus: { pAtk: 35, critDmg: 0.04, maxHp: 150 }
  },
  card_core: {
    id: 'card_core',
    name: 'Carta Core da Torre Cruma',
    monster: 'Core',
    icon: 'assets/2d/monsters/chaos-32x/PNG/Transperent/Icon31.png',
    rarity: 'epic',
    dropChance: 0.015,
    socketBonus: { mAtk: 40, castSpeed: 10 },
    codexBonus: { mAtk: 35, mpRegen: 8, maxMp: 120 }
  },
  card_orfen: {
    id: 'card_orfen',
    name: 'Carta Orfen do Mar de Esporos',
    monster: 'Orfen',
    icon: 'assets/2d/monsters/chaos-32x/PNG/Transperent/Icon32.png',
    rarity: 'epic',
    dropChance: 0.015,
    socketBonus: { healPower: 25, maxMp: 200 },
    codexBonus: { healPower: 20, mDef: 30, maxHp: 200 }
  },
  card_zaken: {
    id: 'card_zaken',
    name: 'Carta Capitão Pirata Zaken',
    monster: 'Zaken',
    icon: 'assets/2d/monsters/chaos-32x/PNG/Transperent/Icon33.png',
    rarity: 'legendary',
    dropChance: 0.012,
    socketBonus: { lifesteal: 0.08, eva: 12 },
    codexBonus: { lifesteal: 0.04, pAtk: 50, pDef: 35 }
  },
  card_baium: {
    id: 'card_baium',
    name: 'Carta Imperador Baium',
    monster: 'Baium',
    icon: 'assets/2d/monsters/chaos-32x/PNG/Transperent/Icon34.png',
    rarity: 'mythic',
    dropChance: 0.008,
    socketBonus: { pAtk: 120, atkSpeed: 15, critRate: 20 },
    codexBonus: { pAtk: 80, mAtk: 80, allStats: 6 }
  },
  card_barakiel: {
    id: 'card_barakiel',
    name: 'Carta Flame of Splendor Barakiel',
    monster: 'Flame of Splendor Barakiel',
    icon: 'assets/2d/monsters/chaos-32x/PNG/Transperent/Icon35.png',
    rarity: 'legendary',
    dropChance: 0.01,
    socketBonus: { holyDmg: 30, pAtk: 90 },
    codexBonus: { holyDmg: 15, pAtk: 45, pDef: 40 }
  },
  card_frintezza: {
    id: 'card_frintezza',
    name: 'Carta Príncipe Frintezza & Halisha',
    monster: 'Frintezza',
    icon: 'assets/2d/monsters/chaos-32x/PNG/Transperent/Icon36.png',
    rarity: 'mythic',
    dropChance: 0.006,
    socketBonus: { darkDmg: 40, castSpeed: 15, critDmg: 0.15 },
    codexBonus: { darkDmg: 20, mAtk: 90, maxHp: 500 }
  },
  card_antharas: {
    id: 'card_antharas',
    name: 'Carta Dragão da Terra Antharas',
    monster: 'Antharas',
    icon: 'assets/2d/monsters/chaos-32x/PNG/Transperent/Icon37.png',
    rarity: 'primordial',
    dropChance: 0.004,
    socketBonus: { pDef: 250, maxHp: 1500, earthResist: 40 },
    codexBonus: { maxHp: 1200, pDef: 120, earthResist: 25 }
  },
  card_valakas: {
    id: 'card_valakas',
    name: 'Carta Dragão do Fogo Valakas',
    monster: 'Valakas',
    icon: 'assets/2d/monsters/chaos-32x/PNG/Transperent/Icon38.png',
    rarity: 'sovereign',
    dropChance: 0.002,
    socketBonus: { pAtk: 350, mAtk: 350, fireDmg: 50 },
    codexBonus: { pAtk: 200, mAtk: 200, fireDmg: 30, maxHp: 2000 }
  }
};

// Registra cartas de raid épicas
Object.assign(MONSTER_CARDS, EPIC_RAID_CARDS);
// Aliases de compatibilidade
MONSTER_CARDS.card_ant_queen = MONSTER_CARDS.card_queen_ant;

// 2. Constrói automaticamente cartas para TODOS os monstros regulares e de zona
let monIdx = 1;
for (const [monId, m] of Object.entries(MONSTERS || {})) {
  const cardId = `card_${monId}`;
  if (MONSTER_CARDS[cardId]) {
    monIdx++;
    continue; // já registrado como boss supremo
  }

  const lvl = m.lvl || m.level || 1;
  const isBoss = Boolean(m.boss);
  const isElite = Boolean(m.elite);

  // Determinação de raridade
  let rarity = 'common';
  if (isBoss) {
    rarity = lvl >= 80 ? 'epic' : (lvl >= 45 ? 'rare' : 'uncommon');
  } else if (isElite || lvl >= 80) {
    rarity = 'rare';
  } else if (lvl >= 40) {
    rarity = 'uncommon';
  }

  // Chance de drop balanceada (0.05% para monstros comuns = 1 em 2000)
  let dropChance = isBoss ? 0.008 : (isElite ? 0.0015 : 0.0005);

  // Ícone em pixel art 32x32 do monstro
  const iconNum = ((monIdx - 1) % 48) + 1;
  const icon = lvl <= 50
    ? `assets/2d/monsters/low-level-32x/PNG/Transperent/Icon${iconNum}.png`
    : `assets/2d/monsters/chaos-32x/PNG/Transperent/Icon${iconNum}.png`;
  monIdx++;

  // Bônus passivo para a conta (Codex)
  const codexBonus = {};
  if (m.matk > m.atk || m.magic) {
    codexBonus.mAtk = Math.max(2, Math.floor(lvl * 0.75));
    codexBonus.mDef = Math.max(1, Math.floor(lvl * 0.4));
  } else {
    codexBonus.pAtk = Math.max(2, Math.floor(lvl * 0.7));
    codexBonus.pDef = Math.max(1, Math.floor(lvl * 0.45));
  }

  codexBonus.maxHp = Math.max(10, Math.floor(lvl * 8));

  if (m.element === 'fire') codexBonus.fireDmg = Math.max(1, Math.floor(lvl * 0.15));
  if (m.element === 'water') codexBonus.waterDmg = Math.max(1, Math.floor(lvl * 0.15));
  if (m.element === 'earth') codexBonus.earthDmg = Math.max(1, Math.floor(lvl * 0.15));
  if (m.element === 'dark') codexBonus.darkDmg = Math.max(1, Math.floor(lvl * 0.15));
  if (m.element === 'holy') codexBonus.holyDmg = Math.max(1, Math.floor(lvl * 0.15));
  if (m.traits?.includes('lifesteal')) codexBonus.lifesteal = 0.01;
  if (m.traits?.includes('bleed')) codexBonus.critRate = Math.max(1, Math.floor(lvl * 0.05));

  // Bônus de engaste
  const socketBonus = {
    pAtk: Math.max(4, Math.floor(lvl * 1.2)),
    pDef: Math.max(3, Math.floor(lvl * 0.9)),
    maxHp: Math.max(20, Math.floor(lvl * 15))
  };

  MONSTER_CARDS[cardId] = {
    id: cardId,
    name: `Carta de ${m.name}`,
    monster: m.name,
    monsterId: monId,
    icon,
    level: lvl,
    rarity,
    dropChance,
    socketBonus,
    codexBonus
  };
}

export class CardCodexService {
  /**
   * Absorve uma carta no Codex da Conta, garantindo bônus passivos permanentes.
   * @param {Object} accountState
   * @param {string} cardId
   * @param {Object} hooks
   * @returns {{ success: boolean, message: string }}
   */
  static absorbCardIntoCodex(accountState, cardId, hooks = {}) {
    const cardDef = MONSTER_CARDS[cardId];
    if (!cardDef) return { success: false, message: 'Carta de monstro desconhecida.' };

    if (!accountState.cardCodex) accountState.cardCodex = {};
    const current = accountState.cardCodex[cardId] || { rank: 0, count: 0 };

    current.count += 1;
    current.rank = Math.min(5, Math.floor(current.count / 2) + 1);
    accountState.cardCodex[cardId] = current;

    hooks.log?.(`🃏 Carta **${cardDef.name}** absorvida no Codex da Conta! (Rank ${current.rank})`, 'gain');
    hooks.onUpdate?.();

    return { success: true, rank: current.rank, totalCards: current.count };
  }

  /**
   * Retorna os bônus passivos acumulados de todas as cartas absorvidas no Codex da Conta.
   * @param {Object} accountState
   * @returns {Object}
   */
  static getCodexPassiveBonuses(accountState) {
    const totals = { pAtk: 0, mAtk: 0, pDef: 0, mDef: 0, maxHp: 0, maxMp: 0, critRate: 0, critDmg: 0, lifesteal: 0, allStats: 0 };
    const cardCodex = accountState?.cardCodex || {};

    for (const [cardId, data] of Object.entries(cardCodex)) {
      if (!data || data.rank <= 0) continue;
      const def = MONSTER_CARDS[cardId];
      if (!def || !def.codexBonus) continue;

      const rankMultiplier = 1 + (data.rank - 1) * 0.25; // +25% por rank adicional
      for (const [stat, val] of Object.entries(def.codexBonus)) {
        if (typeof val === 'number') {
          totals[stat] = (totals[stat] || 0) + (val * rankMultiplier);
        }
      }
    }

    return totals;
  }

  /**
   * Engasta uma carta em um slot de equipamento livre.
   * @param {Object} itemInstance
   * @param {string} cardId
   * @returns {{ success: boolean, message: string }}
   */
  static socketCardToItem(itemInstance, cardId) {
    const cardDef = MONSTER_CARDS[cardId];
    if (!cardDef) return { success: false, message: 'Carta inválida.' };

    const maxSockets = itemInstance.socketsMax || 2;
    if (!itemInstance.slottedCards) itemInstance.slottedCards = [];

    if (itemInstance.slottedCards.length >= maxSockets) {
      return { success: false, message: `Equipamento já atingiu o limite de ${maxSockets} slots de cartas.` };
    }

    itemInstance.slottedCards.push(cardId);
    return { success: true, slottedCards: itemInstance.slottedCards };
  }
}

