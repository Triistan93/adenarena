/**
 * CardCodexService.js — Gerenciador do Sistema de Cartas de Monstros, Codex e Engaste em Equipamentos.
 */

export const MONSTER_CARDS = {
  card_ant_queen: {
    id: 'card_ant_queen',
    name: 'Carta Rainha Formiga (Queen Ant)',
    monster: 'Queen Ant',
    rarity: 'epic',
    dropChance: 0.005, // 0.5%
    socketBonus: { critRate: 15, critDmg: 0.12 },
    codexBonus: { pAtk: 25, critDmg: 0.03 }
  },
  card_core: {
    id: 'card_core',
    name: 'Carta Core de Cruma',
    monster: 'Core',
    rarity: 'epic',
    dropChance: 0.005,
    socketBonus: { mAtk: 40, castSpeed: 10 },
    codexBonus: { mAtk: 30, mpRegen: 5 }
  },
  card_orfen: {
    id: 'card_orfen',
    name: 'Carta Orfen do Mar de Esporos',
    monster: 'Orfen',
    rarity: 'epic',
    dropChance: 0.005,
    socketBonus: { healPower: 25, maxMp: 200 },
    codexBonus: { healPower: 15, mDef: 20 }
  },
  card_zaken: {
    id: 'card_zaken',
    name: 'Carta Zaken o Imortal',
    monster: 'Zaken',
    rarity: 'legendary',
    dropChance: 0.002,
    socketBonus: { lifesteal: 0.08, eva: 12 },
    codexBonus: { lifesteal: 0.03, pAtk: 45 }
  },
  card_baium: {
    id: 'card_baium',
    name: 'Carta Imperador Baium',
    monster: 'Baium',
    rarity: 'mythic',
    dropChance: 0.001,
    socketBonus: { pAtk: 120, atkSpeed: 15, critRate: 20 },
    codexBonus: { pAtk: 60, mAtk: 60, allStats: 5 }
  },
  card_antharas: {
    id: 'card_antharas',
    name: 'Carta Dragão da Terra Antharas',
    monster: 'Antharas',
    rarity: 'primordial',
    dropChance: 0.0005,
    socketBonus: { pDef: 250, maxHp: 1500, earthResist: 40 },
    codexBonus: { maxHp: 800, pDef: 100, earthResist: 20 }
  },
  card_valakas: {
    id: 'card_valakas',
    name: 'Carta Dragão do Fogo Valakas',
    monster: 'Valakas',
    rarity: 'sovereign',
    dropChance: 0.0002,
    socketBonus: { pAtk: 350, mAtk: 350, fireDmg: 50 },
    codexBonus: { pAtk: 150, mAtk: 150, fireDmg: 25 }
  }
};

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
    current.rank = Math.min(5, Math.floor(current.count / 3) + 1);
    accountState.cardCodex[cardId] = current;

    hooks.log?.(`🃏 Carta **${cardDef.name}** absorvida no Codex da Conta! (Rank ${current.rank})`, 'gain');
    hooks.onUpdate?.();

    return { success: true, rank: current.rank, totalCards: current.count };
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
