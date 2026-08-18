/**
 * MarketService.js â€” Casa de LeilÃµes e Mercado Aberto de Aden (Aden Coins & Adena).
 */

import { MARKET_CONFIG, MARKET_CATEGORIES, INITIAL_NPC_LISTINGS } from '../data/market.js';
import { addToInventory } from './InventoryService.js';
import { ALL_ITEMS } from '../data/items/index.js';

export class MarketService {
  static ensureMarketState(state) {
    if (!state) return;
    if (typeof state.adenCoins !== 'number' || isNaN(state.adenCoins) || state.adenCoins < 0) {
      state.adenCoins = state.adenCoins || 0;
    }
    if (!Array.isArray(state.marketListings)) {
      state.marketListings = JSON.parse(JSON.stringify(INITIAL_NPC_LISTINGS));
    }
    if (!Array.isArray(state.marketClaimable)) {
      state.marketClaimable = [];
    }
    if (!Array.isArray(state.marketHistory)) {
      state.marketHistory = [];
    }
    if (!state.lastMarketSimTime) {
      state.lastMarketSimTime = Date.now();
    }
  }

  static getMarketStatus(state) {
    this.ensureMarketState(state);
    const myListings = state.marketListings.filter(l => l.sellerType === 'player');
    const claimableCoins = state.marketClaimable.filter(c => c.currency === 'adenCoin' || !c.currency).reduce((acc, c) => acc + (c.amount || 0), 0);
    const claimableAdena = state.marketClaimable.filter(c => c.currency === 'adena').reduce((acc, c) => acc + (c.amount || 0), 0);
    return {
      adenCoins: state.adenCoins || 0,
      adena: state.gold || 0,
      myListingsCount: myListings.length,
      maxListings: MARKET_CONFIG.MAX_ACTIVE_LISTINGS,
      claimableCoins,
      claimableAdena,
      claimableCount: state.marketClaimable.length,
      recentHistory: (state.marketHistory || []).slice(-15).reverse()
    };
  }

  static getCatalog(state, { category = 'all', search = '', grade = 'all', sortBy = 'recent', filterSeller = 'all' } = {}) {
    this.ensureMarketState(state);
    let listings = [...state.marketListings];
    if (filterSeller === 'player') {
      listings = listings.filter(l => l.sellerType === 'player');
    } else if (filterSeller === 'others') {
      listings = listings.filter(l => l.sellerType !== 'player');
    }
    if (category && category !== 'all') {
      listings = listings.filter(l => l.category === category);
    }
    if (grade && grade !== 'all') {
      listings = listings.filter(l => l.grade === grade);
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      listings = listings.filter(l => (l.name || '').toLowerCase().includes(q) || (l.sellerName || '').toLowerCase().includes(q));
    }
    listings.sort((a, b) => {
      if (sortBy === 'price_asc') {
        const priceA = a.currency === 'adenCoin' ? a.unitPriceAdenCoins * 100000 : a.unitPriceAdena;
        const priceB = b.currency === 'adenCoin' ? b.unitPriceAdenCoins * 100000 : b.unitPriceAdena;
        return priceA - priceB;
      }
      if (sortBy === 'price_desc') {
        const priceA = a.currency === 'adenCoin' ? a.unitPriceAdenCoins * 100000 : a.unitPriceAdena;
        const priceB = b.currency === 'adenCoin' ? b.unitPriceAdenCoins * 100000 : b.unitPriceAdena;
        return priceB - priceA;
      }
      if (sortBy === 'qty_desc') {
        return (b.quantity || 1) - (a.quantity || 1);
      }
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
    return listings;
  }

  static listItem(state, { itemUid, quantity = 1, priceAdenCoins = 0, priceAdena = 0, currency = 'adenCoin' }, callbacks = {}) {
    const log = callbacks.log || console.log;
    const updateAllUI = callbacks.updateAllUI || (() => {});
    const save = callbacks.save || (() => {});
    this.ensureMarketState(state);

    const myListings = state.marketListings.filter(l => l.sellerType === 'player');
    if (myListings.length >= MARKET_CONFIG.MAX_ACTIVE_LISTINGS) {
      log('âš ï¸ Limite de anÃºncios ativos atingido (' + MARKET_CONFIG.MAX_ACTIVE_LISTINGS + '/' + MARKET_CONFIG.MAX_ACTIVE_LISTINGS + ')!', 'warning');
      return { success: false, reason: 'max_listings_reached' };
    }

    const itemIndex = (state.inventory || []).findIndex(it => it.uid === itemUid || it.itemId === itemUid);
    if (itemIndex === -1) {
      log('âš ï¸ Item nÃ£o encontrado na mochila!', 'error');
      return { success: false, reason: 'item_not_found' };
    }

    const invItem = state.inventory[itemIndex];
    const itemDef = ALL_ITEMS[invItem.itemId] || {};
    const qtyToList = Math.max(1, Math.min(Number(quantity) || 1, invItem.count || 1));
    const unitPriceAC = Math.max(0, Math.floor(Number(priceAdenCoins) || 0));
    const unitPriceAd = Math.max(0, Math.floor(Number(priceAdena) || 0));

    if (currency === 'adenCoin' && unitPriceAC <= 0) {
      log('âš ï¸ Defina um preÃ§o vÃ¡lido em Aden Coins (mÃ­nimo 1 AC)!', 'warning');
      return { success: false, reason: 'invalid_price' };
    }
    if (currency === 'adena' && unitPriceAd <= 0) {
      log('âš ï¸ Defina um preÃ§o vÃ¡lido em Adena (mÃ­nimo 100g)!', 'warning');
      return { success: false, reason: 'invalid_price' };
    }

    const estimatedTotalAdena = currency === 'adenCoin' ? (unitPriceAC * 50000 * qtyToList) : (unitPriceAd * qtyToList);
    const listingFee = Math.max(MARKET_CONFIG.MIN_LISTING_FEE, Math.round(estimatedTotalAdena * MARKET_CONFIG.LISTING_FEE_PERCENT));
    if ((state.gold || 0) < listingFee) {
      log('âš ï¸ Adena insuficiente para a taxa de anÃºncio (' + listingFee.toLocaleString() + 'g)!', 'warning');
      return { success: false, reason: 'insufficient_listing_fee' };
    }

    state.gold -= listingFee;
    if ((invItem.count || 1) <= qtyToList) {
      state.inventory.splice(itemIndex, 1);
    } else {
      invItem.count -= qtyToList;
    }

    const playerName = state.charName || state.heroName || state.playerName || 'Guerreiro';
    let cat = 'consumables';
    if (itemDef.type === 'weapon' || itemDef.type === 'shield') cat = 'weapons';
    else if (['armor', 'helmet', 'boots', 'gloves', 'cloak'].includes(itemDef.type)) cat = 'armors';
    else if (['ring', 'earring', 'necklace'].includes(itemDef.type)) cat = 'jewels';
    else if (itemDef.type === 'material') cat = 'materials';
    else if (itemDef.type === 'recipe') cat = 'recipes';
    else if (itemDef.type === 'card') cat = 'cards';

    const newListing = {
      id: 'mkt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      sellerName: playerName,
      sellerType: 'player',
      itemId: invItem.itemId,
      name: invItem.name || itemDef.name || 'Item Raro',
      grade: invItem.grade || itemDef.grade || 'all',
      rarity: invItem.rarity || itemDef.rarity || 'common',
      enchant: invItem.enchant || 0,
      itemData: JSON.parse(JSON.stringify(invItem)),
      category: cat,
      quantity: qtyToList,
      unitPriceAdenCoins: unitPriceAC,
      unitPriceAdena: unitPriceAd,
      currency: currency,
      icon: itemDef.icon || 'ðŸ“¦',
      createdAt: Date.now(),
      expiresInHours: 72
    };

    state.marketListings.unshift(newListing);
    const priceLabel = currency === 'adenCoin' ? (unitPriceAC + ' ðŸª™ AC') : (unitPriceAd.toLocaleString() + 'g ðŸ’°');
    log('ðŸ›ï¸ AnÃºncio publicado! [' + qtyToList + 'x ' + newListing.name + '] por ' + priceLabel + ' cada (Taxa: ' + listingFee.toLocaleString() + 'g).', 'loot');
    updateAllUI();
    save();
    return { success: true, listing: newListing };
  }

  static buyItem(state, listingId, buyQuantity = 1, callbacks = {}) {
    const log = callbacks.log || console.log;
    const updateAllUI = callbacks.updateAllUI || (() => {});
    const save = callbacks.save || (() => {});
    this.ensureMarketState(state);

    const listingIndex = state.marketListings.findIndex(l => l.id === listingId);
    if (listingIndex === -1) {
      log('âš ï¸ Oferta nÃ£o encontrada ou jÃ¡ expirada!', 'error');
      return { success: false, reason: 'listing_not_found' };
    }

    const listing = state.marketListings[listingIndex];
    if (listing.sellerType === 'player') {
      log('âš ï¸ VocÃª nÃ£o pode comprar seu prÃ³prio item anunciado!', 'warning');
      return { success: false, reason: 'cannot_buy_own_item' };
    }

    const qtyToBuy = Math.max(1, Math.min(Number(buyQuantity) || 1, listing.quantity || 1));
    const totalCostCoins = (listing.unitPriceAdenCoins || 0) * qtyToBuy;
    const totalCostAdena = (listing.unitPriceAdena || 0) * qtyToBuy;

    if (listing.currency === 'adenCoin') {
      if ((state.adenCoins || 0) < totalCostCoins) {
        log('⚠️ Saldo insuficiente de Aden Coins! Requer ' + totalCostCoins + ' 💎 AC (Você possui: ' + (state.adenCoins || 0) + ' AC).', 'warning');
        return { success: false, reason: 'insufficient_coins' };
      }
      state.adenCoins -= totalCostCoins;
    } else {
      if ((state.gold || 0) < totalCostAdena) {
        log('⚠️ Saldo insuficiente de Adena! Requer ' + totalCostAdena.toLocaleString() + 'g (Você possui: ' + (state.gold || 0).toLocaleString() + 'g).', 'warning');
        return { success: false, reason: 'insufficient_gold' };
      }
      state.gold -= totalCostAdena;
    }

    if (listing.itemData && listing.itemData.itemId) {
      const itemToDeliver = JSON.parse(JSON.stringify(listing.itemData));
      itemToDeliver.count = qtyToBuy;
      itemToDeliver.uid = 'inv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
      if (!Array.isArray(state.inventory)) state.inventory = [];
      const isStack = ['consumable', 'material', 'scroll', 'potion'].includes(String(listing.category || '').toLowerCase());
      if (isStack) {
        const existing = state.inventory.find(it => it.itemId === itemToDeliver.itemId && !it.enchant);
        if (existing) {
          existing.count = (existing.count || 1) + qtyToBuy;
        } else {
          state.inventory.push(itemToDeliver);
        }
      } else {
        state.inventory.push(itemToDeliver);
      }
    } else {
      addToInventory(state, listing.itemId, qtyToBuy, listing.rarity || null);
    }

    const spentLabel = listing.currency === 'adenCoin' ? (totalCostCoins + ' 💎 AC') : (totalCostAdena.toLocaleString() + 'g 💰');
    state.marketHistory.push({
      type: 'buy',
      itemName: listing.name,
      quantity: qtyToBuy,
      totalPaid: spentLabel,
      sellerName: listing.sellerName,
      timestamp: Date.now()
    });

    if (listing.quantity <= qtyToBuy) {
      state.marketListings.splice(listingIndex, 1);
    } else {
      listing.quantity -= qtyToBuy;
    }

    log('🛍️ Compra realizada! Adquiriu ' + qtyToBuy + 'x [' + listing.name + '] por ' + spentLabel + '.', 'loot');
    updateAllUI();
    save();
    return { success: true };
  }

  static cancelListing(state, listingId, callbacks = {}) {
    const log = callbacks.log || console.log;
    const updateAllUI = callbacks.updateAllUI || (() => {});
    const save = callbacks.save || (() => {});
    this.ensureMarketState(state);

    const listingIndex = state.marketListings.findIndex(l => l.id === listingId && l.sellerType === 'player');
    if (listingIndex === -1) {
      log('⚠️ Anúncio não encontrado ou você não é o dono!', 'error');
      return { success: false, reason: 'listing_not_found' };
    }

    const listing = state.marketListings[listingIndex];
    if (listing.itemData && listing.itemData.itemId) {
      const itemToReturn = JSON.parse(JSON.stringify(listing.itemData));
      itemToReturn.count = listing.quantity;
      itemToReturn.uid = 'inv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
      if (!Array.isArray(state.inventory)) state.inventory = [];
      const isStack = ['consumable', 'material', 'scroll', 'potion'].includes(String(listing.category || '').toLowerCase());
      if (isStack) {
        const existing = state.inventory.find(it => it.itemId === itemToReturn.itemId && !it.enchant);
        if (existing) {
          existing.count = (existing.count || 1) + listing.quantity;
        } else {
          state.inventory.push(itemToReturn);
        }
      } else {
        state.inventory.push(itemToReturn);
      }
    } else {
      addToInventory(state, listing.itemId, listing.quantity, listing.rarity || null);
    }

    state.marketListings.splice(listingIndex, 1);
    log('â†©ï¸ AnÃºncio cancelado. [' + listing.quantity + 'x ' + listing.name + '] foi devolvido para sua mochila.', 'info');
    updateAllUI();
    save();
    return { success: true };
  }

  static claimEarnings(state, callbacks = {}) {
    const log = callbacks.log || console.log;
    const updateAllUI = callbacks.updateAllUI || (() => {});
    const save = callbacks.save || (() => {});
    this.ensureMarketState(state);

    if (!state.marketClaimable || state.marketClaimable.length === 0) {
      log('âš ï¸ NÃ£o hÃ¡ lucros pendentes para resgatar no momento.', 'warning');
      return { success: false, amount: 0 };
    }

    let totalCoins = 0;
    let totalAdena = 0;
    for (const c of state.marketClaimable) {
      if (c.currency === 'adena') {
        totalAdena += (c.amount || 0);
      } else {
        totalCoins += (c.amount || 0);
      }
    }

    state.adenCoins = (state.adenCoins || 0) + totalCoins;
    state.gold = (state.gold || 0) + totalAdena;
    state.marketClaimable = [];

    let msg = 'ðŸ’° RESGATE CONCLUÃDO! ';
    if (totalCoins > 0) msg += '+' + totalCoins + ' ðŸª™ Aden Coins! ';
    if (totalAdena > 0) msg += '+' + totalAdena.toLocaleString() + 'g ðŸ’° Adena! ';
    log(msg, 'rarity-legendary');

    updateAllUI();
    save();
    return { success: true, claimedCoins: totalCoins, claimedAdena: totalAdena };
  }

  static processMarketSimulationTick(state, callbacks = {}) {
    const log = callbacks.log || (() => {});
    this.ensureMarketState(state);

    const now = Date.now();
    const lastTime = (typeof state.lastMarketSimTime === 'number' && state.lastMarketSimTime > 0) ? state.lastMarketSimTime : (now - 300000);
    const elapsedMinutes = (now - lastTime) / 60000;
    if (elapsedMinutes < 2 && !callbacks.forceSell) return;
    state.lastMarketSimTime = now;

    const myListings = state.marketListings.filter(l => l.sellerType === 'player');
    for (const listing of myListings) {
      const hoursActive = (now - (listing.createdAt || now)) / 3600000;
      const buyChance = callbacks.forceSell ? 1.0 : Math.min(0.95, 0.25 + hoursActive * 0.15);
      if (Math.random() < buyChance || callbacks.forceSell) {
        const taxRate = MARKET_CONFIG.SALES_TAX_PERCENT;
        const grossCoins = (listing.unitPriceAdenCoins || 0) * listing.quantity;
        const netCoins = Math.max(1, Math.round(grossCoins * (1 - taxRate)));
        const grossAdena = (listing.unitPriceAdena || 0) * listing.quantity;
        const netAdena = Math.max(100, Math.round(grossAdena * (1 - taxRate)));
        const buyerNames = ['Sir_Kaelen', 'Dwarf_Thrain', 'Elena_Shadow', 'Mage_Ignis', 'Ranger_Sylvan', 'Lord_Baldwin'];
        const randomBuyer = buyerNames[Math.floor(Math.random() * buyerNames.length)];

        if (listing.currency === 'adena') {
          state.marketClaimable.push({
            id: 'clm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 3),
            itemName: listing.name,
            quantity: listing.quantity,
            amount: netAdena,
            currency: 'adena',
            buyerName: randomBuyer,
            timestamp: now
          });
          state.marketHistory.push({
            type: 'sale',
            itemName: listing.name,
            quantity: listing.quantity,
            totalEarned: '+' + netAdena.toLocaleString() + 'g ðŸ’°',
            buyerName: randomBuyer,
            timestamp: now
          });
          log('ðŸŽ‰ ITEM VENDIDO NO MERCADO! [' + listing.quantity + 'x ' + listing.name + '] foi comprado por ' + randomBuyer + '. +' + netAdena.toLocaleString() + 'g disponÃ­vel para resgate!', 'loot');
        } else {
          state.marketClaimable.push({
            id: 'clm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 3),
            itemName: listing.name,
            quantity: listing.quantity,
            amount: netCoins,
            currency: 'adenCoin',
            buyerName: randomBuyer,
            timestamp: now
          });
          state.marketHistory.push({
            type: 'sale',
            itemName: listing.name,
            quantity: listing.quantity,
            totalEarned: '+' + netCoins + ' ðŸª™ AC',
            buyerName: randomBuyer,
            timestamp: now
          });
          log('ðŸŽ‰ ITEM VENDIDO NO MERCADO! [' + listing.quantity + 'x ' + listing.name + '] foi comprado por ' + randomBuyer + '. +' + netCoins + ' ðŸª™ AC disponÃ­vel para resgate!', 'loot');
        }

        const idx = state.marketListings.findIndex(l => l.id === listing.id);
        if (idx !== -1) {
          state.marketListings.splice(idx, 1);
        }
      }
    }
  }
}
