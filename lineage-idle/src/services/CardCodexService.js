/**
 * CardCodexService.js — Gerenciador do Sistema de Cartas de Monstros, Codex e Engaste em Equipamentos.
 */

import { MONSTERS } from '../data/monsters.js';
import { RAID_BOSSES } from '../data/raids.js';
import { MON_IMG } from '../../art.js';

export const MONSTER_CARDS = {};

// 1. Chefes Épicos & Raid Bosses com stats de alta linhagem
const EPIC_RAID_CARDS = {
  card_queen_ant: {
    id: 'card_queen_ant',
    name: 'Carta Rainha Formiga (Queen Ant)',
    monster: 'Queen Ant',
    icon: '/assets/2d/monsters/chaos-32x/PNG/Transperent/Icon30.png',
    image: '/img/Monsters/SemLocal/mon_queenant.png',
    rarity: 'epic',
    dropChance: 0.015,
    socketBonus: { critRate: 15, critDmg: 0.12 },
    codexBonus: { pAtk: 35, critDmg: 0.04, maxHp: 150 }
  },
  card_core: {
    id: 'card_core',
    name: 'Carta Core da Torre Cruma',
    monster: 'Core',
    icon: '/assets/2d/monsters/chaos-32x/PNG/Transperent/Icon31.png',
    image: '/img/Monsters/SemLocal/mon_core.png',
    rarity: 'epic',
    dropChance: 0.015,
    socketBonus: { mAtk: 40, castSpeed: 10 },
    codexBonus: { mAtk: 35, mpRegen: 8, maxMp: 120 }
  },
  card_orfen: {
    id: 'card_orfen',
    name: 'Carta Orfen do Mar de Esporos',
    monster: 'Orfen',
    icon: '/assets/2d/monsters/chaos-32x/PNG/Transperent/Icon32.png',
    image: '/img/Monsters/SemLocal/mon_orfen.png',
    rarity: 'epic',
    dropChance: 0.015,
    socketBonus: { healPower: 25, maxMp: 200 },
    codexBonus: { healPower: 20, mDef: 30, maxHp: 200 }
  },
  card_zaken: {
    id: 'card_zaken',
    name: 'Carta Capitão Pirata Zaken',
    monster: 'Zaken',
    icon: '/assets/2d/monsters/chaos-32x/PNG/Transperent/Icon33.png',
    image: '/img/Monsters/SemLocal/mon_zaken.png',
    rarity: 'legendary',
    dropChance: 0.012,
    socketBonus: { lifesteal: 0.08, eva: 12 },
    codexBonus: { lifesteal: 0.04, pAtk: 50, pDef: 35 }
  },
  card_baium: {
    id: 'card_baium',
    name: 'Carta Imperador Baium',
    monster: 'Baium',
    icon: '/assets/2d/monsters/chaos-32x/PNG/Transperent/Icon34.png',
    image: '/img/Monsters/SemLocal/mon_baium.png',
    rarity: 'mythic',
    dropChance: 0.008,
    socketBonus: { pAtk: 120, atkSpeed: 15, critRate: 20 },
    codexBonus: { pAtk: 80, mAtk: 80, allStats: 6 }
  },
  card_barakiel: {
    id: 'card_barakiel',
    name: 'Carta Flame of Splendor Barakiel',
    monster: 'Flame of Splendor Barakiel',
    icon: '/assets/2d/monsters/chaos-32x/PNG/Transperent/Icon35.png',
    image: '/img/Monsters/SemLocal/mon_barakiel.png',
    rarity: 'legendary',
    dropChance: 0.01,
    socketBonus: { holyDmg: 30, pAtk: 90 },
    codexBonus: { holyDmg: 15, pAtk: 45, pDef: 40 }
  },
  card_frintezza: {
    id: 'card_frintezza',
    name: 'Carta Príncipe Frintezza & Halisha',
    monster: 'Frintezza',
    icon: '/assets/2d/monsters/chaos-32x/PNG/Transperent/Icon36.png',
    image: '/img/Monsters/SemLocal/mon_frintezza.png',
    rarity: 'mythic',
    dropChance: 0.006,
    socketBonus: { darkDmg: 40, castSpeed: 15, critDmg: 0.15 },
    codexBonus: { darkDmg: 20, mAtk: 90, maxHp: 500 }
  },
  card_antharas: {
    id: 'card_antharas',
    name: 'Carta Dragão da Terra Antharas',
    monster: 'Antharas',
    icon: '/assets/2d/monsters/chaos-32x/PNG/Transperent/Icon37.png',
    image: '/img/Monsters/SemLocal/mon_antharas.png',
    rarity: 'primordial',
    dropChance: 0.004,
    socketBonus: { pDef: 250, maxHp: 1500, earthResist: 40 },
    codexBonus: { maxHp: 1200, pDef: 120, earthResist: 25 }
  },
  card_valakas: {
    id: 'card_valakas',
    name: 'Carta Dragão do Fogo Valakas',
    monster: 'Valakas',
    icon: '/assets/2d/monsters/chaos-32x/PNG/Transperent/Icon38.png',
    image: '/img/Monsters/SemLocal/mon_valakas.png',
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
    ? `/assets/2d/monsters/low-level-32x/PNG/Transperent/Icon${iconNum}.png`
    : `/assets/2d/monsters/chaos-32x/PNG/Transperent/Icon${iconNum}.png`;
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

  const monsterImg = (MON_IMG && (MON_IMG[monId] || MON_IMG[m.name])) || `/img/mon_${monId.toLowerCase()}.jpg`;

  MONSTER_CARDS[cardId] = {
    id: cardId,
    name: `Carta de ${m.name}`,
    monster: m.name,
    monsterId: monId,
    icon,
    image: monsterImg,
    level: lvl,
    rarity,
    dropChance,
    socketBonus,
    codexBonus
  };
}

export class CardCodexService {
  /**
   * Determina o Rank da Carta com base no total de cópias absorvidas.
   * @param {number} count
   * @returns {number}
   */
  static getRankFromCount(count) {
    if (count >= 15) return 5;
    if (count >= 10) return 4;
    if (count >= 6) return 3;
    if (count >= 3) return 2;
    if (count >= 1) return 1;
    return 0;
  }

  /**
   * Quantidade de cartas necessárias para atingir o próximo rank.
   * @param {number} rank
   * @returns {number}
   */
  static getNextRankRequirement(rank) {
    if (rank >= 5) return 15;
    if (rank === 4) return 15;
    if (rank === 3) return 10;
    if (rank === 2) return 6;
    if (rank === 1) return 3;
    return 1;
  }

  /**
   * Multiplicador com Retornos Decrescentes (Diminishing Returns) por Rank.
   * @param {number} rank
   * @returns {number}
   */
  static getRankMultiplier(rank) {
    switch (rank) {
      case 5: return 2.15; // +15% no rank 5
      case 4: return 2.00; // +20% no rank 4
      case 3: return 1.80; // +30% no rank 3
      case 2: return 1.50; // +50% no rank 2
      case 1: return 1.00; // 100% no rank 1
      default: return 0;
    }
  }

  /**
   * Absorve uma carta no Codex da Conta, garantindo bônus passivos permanentes.
   * @param {Object} accountState
   * @param {string} cardId
   * @param {number|Object} [count=1]
   * @param {Object} [hooks={}]
   * @returns {{ success: boolean, message?: string, rank?: number, totalCards?: number }}
   */
  static absorbCardIntoCodex(accountState, cardId, count = 1, hooks = {}) {
    if (typeof count === 'object' && count !== null) {
      hooks = count;
      count = 1;
    }
    const numToAbsorb = typeof count === 'number' && count > 0 ? count : 1;
    const cardDef = MONSTER_CARDS[cardId];
    if (!cardDef) return { success: false, message: 'Carta de monstro desconhecida.' };

    if (Array.isArray(accountState.inventory)) {
      const invItemIdx = accountState.inventory.findIndex(i => (i.id === cardId || i.itemId === cardId));
      if (invItemIdx !== -1) {
        const item = accountState.inventory[invItemIdx];
        if ((item.count || 1) <= numToAbsorb) {
          accountState.inventory.splice(invItemIdx, 1);
        } else {
          item.count -= numToAbsorb;
        }
      }
    }

    if (!accountState.cardCodex) accountState.cardCodex = {};
    const current = accountState.cardCodex[cardId] || { rank: 0, count: 0 };

    current.count += numToAbsorb;
    current.rank = CardCodexService.getRankFromCount(current.count);
    accountState.cardCodex[cardId] = current;
    if (accountState.codex && typeof accountState.codex === 'object') {
      accountState.codex[cardId] = current;
    }

    hooks.log?.(`🃏 Carta **${cardDef.name}** absorvida no Codex! (${current.count} cópias · Rank ${current.rank}/5)`, 'gain');
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
    const cardCodex = (accountState?.cardCodex && Object.keys(accountState.cardCodex).length > 0)
      ? accountState.cardCodex
      : (accountState?.codex || {});

    for (const [cardId, data] of Object.entries(cardCodex)) {
      if (!data || data.rank <= 0) continue;
      const def = MONSTER_CARDS[cardId];
      if (!def || !def.codexBonus) continue;

      const rankMultiplier = CardCodexService.getRankMultiplier(data.rank);
      for (const [stat, val] of Object.entries(def.codexBonus)) {
        if (typeof val === 'number') {
          totals[stat] = (totals[stat] || 0) + Math.round(val * rankMultiplier);
        }
      }
    }

    const aquatic = CardCodexService.getAquaticCodexBonuses(accountState);
    totals.maxHp += aquatic.maxHp;
    totals.pDef += aquatic.pDef;

    return totals;
  }

  /**
   * Bônus passivos concedidos pela descoberta e catalogação de espécies de peixes de Aden.
   * @param {Object} accountState
   * @returns {{ maxHp: number, pDef: number }}
   */
  static getAquaticCodexBonuses(accountState) {
    const fLog = accountState?.fishing?.fishLog || {};
    const speciesDiscovered = Object.keys(fLog).length;
    return {
      maxHp: speciesDiscovered * 15,
      pDef: speciesDiscovered * 2
    };
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

