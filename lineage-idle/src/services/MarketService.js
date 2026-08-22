/**
 * MarketService.js — Mercado de Giran (Auction House P2P)
 * 
 * Gerencia anúncios de compra e venda de itens entre jogadores, suportando:
 * - Venda em Adena (🪙) ou Aden Coin (👑)
 * - Taxa de listagem de 5% de Adena (Adena Sink anti-inflação)
 * - Filtragem por Categoria, Grau, Moeda e Busca por Texto
 * - Coleta de lucros de vendas realizadas
 * - Mercado dinâmico inicial abastecido com mercadorias de Aden
 */

import { D } from '../core/GameConfig.js';
import { getItemIconUrl } from '../ui/GameUI.js';

const MARKET_STORAGE_KEY = 'l2_aden_market_listings_v1';
const MARKET_SALES_KEY = 'l2_aden_market_sales_v1';

export const MARKET_CATEGORIES = [
  { id: 'all', name: 'Todos os Itens', icon: '🌐' },
  { id: 'weapon', name: 'Armas', icon: '⚔️' },
  { id: 'armor', name: 'Armaduras', icon: '🛡️' },
  { id: 'jewel', name: 'Joias & Acessórios', icon: '💍' },
  { id: 'spellbook', name: 'Spellbooks (1★ a 4★)', icon: '📖' },
  { id: 'scroll', name: 'Pergaminhos & Enchants', icon: '📜' },
  { id: 'material', name: 'Materiais & Minérios', icon: '💎' },
  { id: 'consumable', name: 'Poções & Elixires', icon: '🧪' }
];

export const MarketService = {
  /**
   * Obtém todos os anúncios ativos do mercado
   */
  getListings() {
    try {
      const raw = localStorage.getItem(MARKET_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('[MarketService] Erro ao carregar anúncios:', e);
    }
    return this.generateInitialMarketSeed();
  },

  /**
   * Salva os anúncios no storage
   */
  saveListings(listings) {
    try {
      localStorage.setItem(MARKET_STORAGE_KEY, JSON.stringify(listings));
    } catch (e) {
      console.error('[MarketService] Falha ao salvar anúncios:', e);
    }
  },

  /**
   * Obtém o histórico de vendas e lucros pendentes do jogador
   */
  getPlayerSales(charName = 'Hero of Aden') {
    try {
      const raw = localStorage.getItem(MARKET_SALES_KEY);
      if (raw) {
        const all = JSON.parse(raw);
        return all[charName] || { pendingAdena: 0, pendingAdenCoins: 0, history: [] };
      }
    } catch (e) {
      console.warn('[MarketService] Erro ao carregar vendas do jogador:', e);
    }
    return { pendingAdena: 0, pendingAdenCoins: 0, history: [] };
  },

  /**
   * Salva os dados de vendas do jogador
   */
  savePlayerSales(charName, data) {
    try {
      const raw = localStorage.getItem(MARKET_SALES_KEY);
      const all = raw ? JSON.parse(raw) : {};
      all[charName] = data;
      localStorage.setItem(MARKET_SALES_KEY, JSON.stringify(all));
    } catch (e) {
      console.error('[MarketService] Falha ao salvar vendas do jogador:', e);
    }
  },

  /**
   * Cria um novo anúncio no mercado
   */
  createListing(state, { itemUid, quantity = 1, pricePerUnit, currency = 'adena' }) {
    if (!state || !state.inventory) {
      return { ok: false, msg: 'Inventário indisponível.' };
    }

    const itemIndex = state.inventory.findIndex(i => (i.uid === itemUid || i.id === itemUid));
    if (itemIndex === -1) {
      return { ok: false, msg: 'Item não encontrado na mochila.' };
    }

    const item = state.inventory[itemIndex];

    // Verifica se está equipado
    const isEquipped = Object.values(state.equipment || {}).includes(item.uid || item.id);
    if (isEquipped) {
      return { ok: false, msg: 'Desequipe o item antes de anunciar no mercado!' };
    }

    const availableCount = Number(item.count || item.quantity) || 1;
    const qtyToSell = Math.min(Math.max(1, Number(quantity) || 1), availableCount);
    const unitPrice = Math.max(1, Math.floor(Number(pricePerUnit) || 1));
    const totalPrice = unitPrice * qtyToSell;

    // Cálculo da taxa de listagem (5% em Adena)
    const listingFee = Math.max(100, Math.floor((currency === 'adena' ? totalPrice : totalPrice * 1000) * 0.05));

    if ((state.gold || 0) < listingFee) {
      return { ok: false, msg: `Adena insuficiente para a taxa de listagem (Exige ${listingFee.toLocaleString()} Adena).` };
    }

    // Deduz a taxa de listagem
    state.gold -= listingFee;

    // Remove ou diminui quantidade do item no inventário
    if (availableCount > qtyToSell) {
      item.count = availableCount - qtyToSell;
      item.quantity = item.count;
    } else {
      state.inventory.splice(itemIndex, 1);
    }

    const sellerName = state.name || state.charName || 'Hero of Aden';
    const listingId = 'mkt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

    const newListing = {
      id: listingId,
      sellerName: sellerName,
      isPlayerListing: true,
      createdAt: Date.now(),
      currency: currency === 'adencoin' ? 'adencoin' : 'adena',
      pricePerUnit: unitPrice,
      totalPrice: totalPrice,
      quantity: qtyToSell,
      item: {
        id: item.itemId || item.id,
        name: item.name || 'Item de Aden',
        slot: item.slot || 'material',
        tier: item.tier || 1,
        rarity: item.rarity || 'common',
        enchant: item.enchant || item.enchantLevel || 0,
        desc: item.desc || '',
        icon: item.icon || ''
      }
    };

    const listings = this.getListings();
    listings.unshift(newListing);
    this.saveListings(listings);

    return { 
      ok: true, 
      msg: `Anúncio criado com sucesso! Taxa paga: ${listingFee.toLocaleString()} Adena.`,
      listing: newListing 
    };
  },

  /**
   * Compra um item anunciado no mercado
   */
  buyListing(state, listingId) {
    if (!state) return { ok: false, msg: 'Estado de jogo indisponível.' };

    const listings = this.getListings();
    const index = listings.findIndex(l => l.id === listingId);
    if (index === -1) {
      return { ok: false, msg: 'Este anúncio já foi vendido ou expirou!' };
    }

    const listing = listings[index];
    const buyerName = state.name || state.charName || 'Hero of Aden';

    if (listing.sellerName === buyerName && listing.isPlayerListing) {
      return { ok: false, msg: 'Você não pode comprar seu próprio anúncio. Cancele-o na aba Minhas Vendas!' };
    }

    const totalCost = Number(listing.totalPrice) || (listing.pricePerUnit * listing.quantity);
    const currency = listing.currency || 'adena';

    if (currency === 'adencoin') {
      const playerAc = Number(state.adenCoins || state.ac || 0);
      if (playerAc < totalCost) {
        return { ok: false, msg: `Aden Coins insuficientes! Você tem ${playerAc} e o item custa ${totalCost} Aden Coins 👑.` };
      }
      state.adenCoins = playerAc - totalCost;
      state.ac = state.adenCoins;
    } else {
      const playerGold = Number(state.gold || 0);
      if (playerGold < totalCost) {
        return { ok: false, msg: `Adena insuficiente! Você tem ${playerGold.toLocaleString()} e o item custa ${totalCost.toLocaleString()} Adena 🪙.` };
      }
      state.gold = playerGold - totalCost;
    }

    // Entrega o item ao comprador
    const boughtItem = {
      ...listing.item,
      uid: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      count: listing.quantity,
      quantity: listing.quantity
    };

    state.inventory = state.inventory || [];
    const isStackable = ['material', 'consumable', 'scroll', 'crystal'].includes(boughtItem.slot);
    const existingIndex = isStackable 
      ? state.inventory.findIndex(i => (i.itemId === boughtItem.id || i.id === boughtItem.id) && !i.enchant) 
      : -1;

    if (existingIndex !== -1) {
      state.inventory[existingIndex].count = (Number(state.inventory[existingIndex].count) || 1) + listing.quantity;
      state.inventory[existingIndex].quantity = state.inventory[existingIndex].count;
    } else {
      state.inventory.push(boughtItem);
    }

    // Se o vendedor for um jogador, credita o lucro na conta dele
    if (listing.isPlayerListing) {
      const salesData = this.getPlayerSales(listing.sellerName);
      if (currency === 'adencoin') {
        salesData.pendingAdenCoins = (salesData.pendingAdenCoins || 0) + totalCost;
      } else {
        salesData.pendingAdena = (salesData.pendingAdena || 0) + totalCost;
      }

      salesData.history = salesData.history || [];
      salesData.history.unshift({
        itemName: listing.item.name,
        quantity: listing.quantity,
        totalCost: totalCost,
        currency: currency,
        buyer: buyerName,
        soldAt: Date.now()
      });

      this.savePlayerSales(listing.sellerName, salesData);
    }

    // Remove do mural
    listings.splice(index, 1);
    this.saveListings(listings);

    return {
      ok: true,
      msg: `Compra realizada com sucesso! Você recebeu ${listing.quantity}x ${listing.item.name}.`,
      item: boughtItem
    };
  },

  /**
   * Cancela uma listagem e devolve o item para o jogador
   */
  cancelListing(state, listingId) {
    if (!state) return { ok: false, msg: 'Estado de jogo indisponível.' };

    const listings = this.getListings();
    const index = listings.findIndex(l => l.id === listingId);
    if (index === -1) {
      return { ok: false, msg: 'Anúncio não encontrado.' };
    }

    const listing = listings[index];
    const playerName = state.name || state.charName || 'Hero of Aden';

    if (listing.sellerName !== playerName) {
      return { ok: false, msg: 'Você só pode cancelar seus próprios anúncios!' };
    }

    const returnedItem = {
      ...listing.item,
      uid: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      count: listing.quantity,
      quantity: listing.quantity
    };

    state.inventory = state.inventory || [];
    state.inventory.push(returnedItem);

    listings.splice(index, 1);
    this.saveListings(listings);

    return {
      ok: true,
      msg: `Anúncio cancelado! ${listing.quantity}x ${listing.item.name} devolvido à sua mochila.`
    };
  },

  /**
   * Coleta todos os lucros pendentes de vendas
   */
  claimProfits(state) {
    if (!state) return { ok: false, msg: 'Estado indisponível.' };

    const playerName = state.name || state.charName || 'Hero of Aden';
    const salesData = this.getPlayerSales(playerName);

    const adena = salesData.pendingAdena || 0;
    const adencoin = salesData.pendingAdenCoins || 0;

    if (adena <= 0 && adencoin <= 0) {
      return { ok: false, msg: 'Nenhum lucro pendente para resgatar no momento.' };
    }

    if (adena > 0) {
      state.gold = (state.gold || 0) + adena;
      salesData.pendingAdena = 0;
    }
    if (adencoin > 0) {
      state.adenCoins = (state.adenCoins || 0) + adencoin;
      state.ac = state.adenCoins;
      salesData.pendingAdenCoins = 0;
    }

    this.savePlayerSales(playerName, salesData);

    return {
      ok: true,
      msg: `Lucros coletados com sucesso: +${adena.toLocaleString()} Adena 🪙 e +${adencoin} Aden Coins 👑!`,
      adena,
      adencoin
    };
  },

  /**
   * Povoa o mercado com ofertas iniciais de mercadores de Aden para economia ativa
   */
  generateInitialMarketSeed() {
    const seed = [
      {
        id: 'seed_1',
        sellerName: 'Merchant Katrina',
        isPlayerListing: false,
        createdAt: Date.now() - 3600000,
        currency: 'adena',
        pricePerUnit: 45000,
        totalPrice: 45000,
        quantity: 1,
        item: { id: 'scroll_of_enchant_weapon_', name: 'Scroll: Enchant Weapon (D-Grade) 📜', slot: 'scroll', tier: 2, rarity: 'rare', enchant: 0, desc: 'Encanta armas D-Grade.', icon: 'scrolls/scroll_of_enchant_weapon_.png' }
      },
      {
        id: 'seed_2',
        sellerName: 'Blacksmith Pushkin',
        isPlayerListing: false,
        createdAt: Date.now() - 7200000,
        currency: 'adencoin',
        pricePerUnit: 15,
        totalPrice: 15,
        quantity: 1,
        item: { id: 'spellbook_2star', name: 'Spellbook: 2-Star ⭐⭐', slot: 'material', tier: 3, rarity: 'epic', enchant: 0, desc: 'Livro sagrado de 2 Estrelas para habilidades avançadas.', icon: 'spellbooks/spellbook_2star.png' }
      },
      {
        id: 'seed_3',
        sellerName: 'Trader Woody',
        isPlayerListing: false,
        createdAt: Date.now() - 10800000,
        currency: 'adena',
        pricePerUnit: 350,
        totalPrice: 17500,
        quantity: 50,
        item: { id: 'iron_ore', name: 'Iron Ore 💎', slot: 'material', tier: 1, rarity: 'common', enchant: 0, desc: 'Minério de ferro refinado para forja.', icon: 'materials/iron_ore.png' }
      },
      {
        id: 'seed_4',
        sellerName: 'Shadow Walker Ren',
        isPlayerListing: false,
        createdAt: Date.now() - 14400000,
        currency: 'adencoin',
        pricePerUnit: 50,
        totalPrice: 50,
        quantity: 1,
        item: { id: 'spellbook_4star', name: 'Spellbook: 4-Star ⭐⭐⭐⭐ [Ancestral]', slot: 'material', tier: 5, rarity: 'legendary', enchant: 0, desc: 'Livro Ancestral Supremo para habilidades de 4 Estrelas do Lv 80+.', icon: 'spellbooks/spellbook_4star.png' }
      },
      {
        id: 'seed_5',
        sellerName: 'Priestess Chloe',
        isPlayerListing: false,
        createdAt: Date.now() - 18000000,
        currency: 'adena',
        pricePerUnit: 120000,
        totalPrice: 120000,
        quantity: 1,
        item: { id: 'armor_brigandine_armor_heavy', name: '+4 Brigandine Tunic', slot: 'armor', tier: 2, rarity: 'rare', enchant: 4, desc: 'Armadura pesada de Brigandine refinada.', icon: 'graded/armors/armor_brigandine_armor_heavy.png' }
      },
      {
        id: 'seed_6',
        sellerName: 'Dwarf Master Bronze',
        isPlayerListing: false,
        createdAt: Date.now() - 21600000,
        currency: 'adencoin',
        pricePerUnit: 25,
        totalPrice: 25,
        quantity: 1,
        item: { id: 'lifestone_top', name: 'Top-Grade Life Stone 💎', slot: 'material', tier: 6, rarity: 'sovereign', enchant: 0, desc: 'Pedra de Vida Suprema para Augmentation.', icon: 'materials/crystal_gold_s.png' }
      }
    ];
    this.saveListings(seed);
    return seed;
  }
};
