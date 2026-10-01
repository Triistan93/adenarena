/**
 * CardCodexService.js — Gerenciador do Sistema de Cartas de Monstros, Codex e Engaste em Equipamentos.
 */

import { MONSTERS } from '../data/monsters.js';
import { RAID_BOSSES } from '../data/raids.js';
import { MON_IMG } from '../../art.js';

export const MONSTER_CARDS = {};
const CARD_ID_ALIASES = { card_ant_queen: 'card_queen_ant' };

export function getCanonicalCardId(cardId) {
  return CARD_ID_ALIASES[cardId] || cardId;
}

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
  /** Formata bônus de carta usando o mesmo multiplicador aplicado pelo serviço. */
  static formatCodexBonusLabel(bonuses = {}, multiplier = 1) {
    return Object.entries(bonuses || {})
      .filter(([, value]) => typeof value === 'number' && Number.isFinite(value))
      .map(([stat, value]) => {
        const scaled = value * (Number.isFinite(Number(multiplier)) ? Number(multiplier) : 1);
        const formatted = Math.abs(value) < 1 ? `${(scaled * 100).toFixed(1)}%` : Math.round(scaled);
        return `+${formatted} ${stat.toUpperCase()}`;
      })
      .join(', ');
  }

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
    const numToAbsorb = count;
    if (!Number.isSafeInteger(numToAbsorb) || numToAbsorb <= 0) {
      return { success: false, message: 'A quantidade de cartas deve ser um inteiro positivo.' };
    }
    const cardDef = MONSTER_CARDS[cardId];
    if (!cardDef) return { success: false, message: 'Carta de monstro desconhecida.' };

    const inventory = Array.isArray(accountState.inventory) ? accountState.inventory : [];
    const warehouse = Array.isArray(accountState.warehouse) ? accountState.warehouse : [];
    const container = inventory.some(item => (item?.itemId === cardId || item?.id === cardId) && !item.equipped)
      ? inventory
      : warehouse;
    const itemIndex = container.findIndex(item => (item?.itemId === cardId || item?.id === cardId) && !item.equipped);
    if (itemIndex < 0) return { success: false, message: 'Você não possui esta carta no inventário ou no baú.' };
    const item = container[itemIndex];
    const available = Number.isSafeInteger(item.count) ? item.count : 1;
    if (available < numToAbsorb) return { success: false, message: `Você possui apenas ${available} carta(s) disponíveis.` };

    const current = accountState.cardCodex?.[cardId] || { rank: 0, count: 0 };
    const priorCount = Number.isSafeInteger(current.count) && current.count >= 0 ? current.count : 0;
    if (priorCount + numToAbsorb > Number.MAX_SAFE_INTEGER) {
      return { success: false, message: 'A coleção atingiu o limite permitido.' };
    }

    if (available === numToAbsorb) container.splice(itemIndex, 1);
    else item.count = available - numToAbsorb;

    if (!accountState.cardCodex) accountState.cardCodex = {};
    current.count = priorCount + numToAbsorb;
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
    const totals = { pAtk: 0, mAtk: 0, pDef: 0, mDef: 0, maxHp: 0, maxMp: 0, maxCp: 0, critRate: 0, critDmg: 0, lifesteal: 0, healPower: 0, allStats: 0 };
    const cardCodex = (accountState?.cardCodex && Object.keys(accountState.cardCodex).length > 0)
      ? accountState.cardCodex
      : (accountState?.codex || {});

    const canonicalRecords = new Map();
    for (const [storedCardId, data] of Object.entries(cardCodex)) {
      const cardId = getCanonicalCardId(storedCardId);
      const rank = Number(data?.rank) || 0;
      if (!data || rank <= 0) continue;
      const prior = canonicalRecords.get(cardId);
      if (!prior || rank > prior.rank || (rank === prior.rank && (Number(data.count) || 0) > (Number(prior.data.count) || 0))) {
        canonicalRecords.set(cardId, { rank, data });
      }
    }

    for (const [cardId, record] of canonicalRecords) {
      const def = MONSTER_CARDS[cardId];
      if (!def || !def.codexBonus) continue;

      const rankMultiplier = CardCodexService.getRankMultiplier(record.rank);
      for (const [stat, val] of Object.entries(def.codexBonus)) {
        if (typeof val === 'number') {
          const scaledValue = val * rankMultiplier;
          // Preserve fractional combat ratios; rounding 0.04 lifesteal or
          // critical-damage bonuses to an integer silently erased them.
          totals[stat] = (totals[stat] || 0) + (['critDmg', 'lifesteal'].includes(stat)
            ? scaledValue
            : Math.round(scaledValue));
        }
      }
    }

    const aquatic = CardCodexService.getAquaticCodexBonuses(accountState);
    totals.maxHp += aquatic.maxHp;
    totals.pDef += aquatic.pDef;

    const wildlife = CardCodexService.getWildlifeCodexBonuses(accountState);
    totals.pAtk += wildlife.pAtk;
    totals.maxHp += wildlife.maxHp;

    return totals;
  }

  /** Combina os bônus das cartas engastadas nas peças atualmente equipadas. */
  static getEquippedSocketBonuses(state) {
    const totals = {};
    const inventory = Array.isArray(state?.inventory) ? state.inventory : [];
    const seen = new Set();
    for (const equipped of Object.values(state?.equipment || {})) {
      const item = equipped && typeof equipped === 'object'
        ? equipped
        : inventory.find(candidate => candidate?.uid === equipped || candidate?.id === equipped);
      if (!item) continue;
      const identity = item.uid || item.id || item.itemId || item;
      if (seen.has(identity)) continue;
      seen.add(identity);
      for (const cardId of Array.isArray(item.slottedCards) ? item.slottedCards : []) {
        const bonus = MONSTER_CARDS[cardId]?.socketBonus;
        if (!bonus) continue;
        for (const [stat, value] of Object.entries(bonus)) {
          const amount = Number(value);
          if (Number.isFinite(amount)) totals[stat] = (totals[stat] || 0) + amount;
        }
      }
    }
    return totals;
  }

  /** Engasta uma carta possuída em uma arma equipada e consome uma cópia. */
  static socketCardToEquipment(state, weaponUid, cardId) {
    const inventory = Array.isArray(state?.inventory) ? state.inventory : null;
    if (!inventory || !state.equipment || !['weapon', 'weapon2'].some(slot => state.equipment[slot] === weaponUid)) {
      return { success: false, message: 'Equipe a arma antes de engastar uma carta.' };
    }
    const weapon = inventory.find(item => item?.uid === weaponUid || item?.id === weaponUid);
    const cardIndex = inventory.findIndex(item => (item?.itemId === cardId || item?.id === cardId) && !item.equipped);
    if (!weapon || cardIndex < 0) return { success: false, message: 'Arma ou carta não encontrada no inventário.' };

    const card = inventory[cardIndex];
    const count = card.count === undefined ? 1 : card.count;
    if (!Number.isSafeInteger(count) || count <= 0) {
      return { success: false, message: 'A quantidade desta carta é inválida.' };
    }
    const candidate = { ...weapon, slottedCards: Array.isArray(weapon.slottedCards) ? [...weapon.slottedCards] : [] };
    const result = CardCodexService.socketCardToItem(candidate, cardId);
    if (!result.success) return result;

    if (count === 1) inventory.splice(cardIndex, 1);
    else card.count = count - 1;
    weapon.slottedCards = candidate.slottedCards;
    return { success: true, slottedCards: [...weapon.slottedCards], weaponUid, cardId };
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
   * Bônus passivos concedidos pelo abate e catalogação de espécies silvestres no Bestiário de Caça.
   * @param {Object} accountState
   * @returns {{ pAtk: number, maxHp: number }}
   */
  static getWildlifeCodexBonuses(accountState) {
    const hLog = accountState?.hunting?.huntingLog || {};
    const speciesDiscovered = Object.keys(hLog).length;
    return {
      pAtk: speciesDiscovered * 4,
      maxHp: speciesDiscovered * 10
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

    const maxSockets = Number.isSafeInteger(itemInstance.socketsMax)
      ? Math.max(0, itemInstance.socketsMax)
      : 2;
    if (!itemInstance.slottedCards) itemInstance.slottedCards = [];

    if (itemInstance.slottedCards.length >= maxSockets) {
      return { success: false, message: `Equipamento já atingiu o limite de ${maxSockets} slots de cartas.` };
    }

    itemInstance.slottedCards.push(cardId);
    return { success: true, slottedCards: itemInstance.slottedCards };
  }
}

