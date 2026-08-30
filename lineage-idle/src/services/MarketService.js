/**
 * MarketService.js — Mercado Central de Giran (Auction House P2P Real-Time)
 * 
 * Gerencia anúncios 100% reais entre jogadores em tempo real:
 * - Venda livre em Adena (🪙) ou Aden Coin (👑)
 * - Taxa de listagem imperial de 5% em Adena (Adena Sink)
 * - Sincronização multi-contas em Nuvem (Firebase Firestore + API Serverless + BroadcastChannel)
 * - Force Update em tempo real quando um item for vendido/comprado
 * - Zero NPCs ou itens fantasmas artificiais
 * - Coleta segura de lucros com histórico detalhado
 */

import { D } from '../core/GameConfig.js';

function getItemDefinition(itemId) {
  if (!itemId) return null;
  const data = (typeof D === 'function') ? D() : ((typeof window !== 'undefined' && window.GameData) ? window.GameData : null);
  if (!data?.ALL_ITEMS) return null;
  if (data.ALL_ITEMS[itemId]) return data.ALL_ITEMS[itemId];
  const raw = String(itemId);
  const keys = [
    raw, raw.toLowerCase(),
    raw.replace(/\s+/g, ''), raw.replace(/[-_]/g, '').toLowerCase(),
    raw.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, ''),
    raw.replace(/_([a-z])/g, (m, c) => c.toUpperCase())
  ];
  for (const k of keys) {
    if (data.ALL_ITEMS[k]) return data.ALL_ITEMS[k];
  }
  const normalized = raw.toLowerCase().replace(/\s+/g, '');
  return Object.values(data.ALL_ITEMS).find(i => i.name?.toLowerCase().replace(/\s+/g, '') === normalized) || null;
}

const MARKET_STORAGE_KEY = 'l2_aden_market_listings_v2';
const MARKET_SALES_KEY = 'l2_aden_market_sales_v2';
const DELETED_IDS_KEY = 'l2_aden_market_deleted_ids_v2';

// Tombstone set para garantir que itens comprados/cancelados nunca reapareçam
let _deletedListingIds = new Set();
try {
  const rawDeleted = localStorage.getItem(DELETED_IDS_KEY);
  if (rawDeleted) {
    const parsed = JSON.parse(rawDeleted);
    if (Array.isArray(parsed)) {
      parsed.forEach(id => _deletedListingIds.add(id));
    }
  }
} catch (e) {}

function markListingDeleted(listingId) {
  if (!listingId) return;
  _deletedListingIds.add(listingId);
  try {
    const arr = Array.from(_deletedListingIds).slice(-500);
    localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(arr));
  } catch (e) {}
}

// Canal de sincronização instantânea entre abas e perfis no mesmo navegador
let _marketBroadcastChannel = null;
try {
  if (typeof BroadcastChannel !== 'undefined') {
    _marketBroadcastChannel = new BroadcastChannel('aden_market_sync');
    _marketBroadcastChannel.onmessage = (event) => {
      if (event && event.data && event.data.type) {
        MarketService.onBroadcastMessage(event.data);
      }
    };
  }
} catch (e) {
  console.warn('[MarketService] BroadcastChannel indisponível:', e);
}

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

let _inMemoryListings = null;
let _isSubscribedToCloud = false;
let _isSubscribedToSales = false;
let _pollingTimer = null;
let _onMarketChangeCallbacks = new Set();
let _lastPendingTotal = 0;

export const MarketService = {
  /**
   * Registra um callback para quando o mercado for atualizado em tempo real
   */
  subscribeUI(callback) {
    if (typeof callback === 'function') {
      _onMarketChangeCallbacks.add(callback);
    }
    return () => _onMarketChangeCallbacks.delete(callback);
  },

  /**
   * Notifica ouvintes de UI para re-renderizar o mercado imediatamente
   */
  notifyUI() {
    _onMarketChangeCallbacks.forEach(cb => {
      try { cb(); } catch (e) {}
    });
  },

  /**
   * Trata mensagens do BroadcastChannel
   */
  onBroadcastMessage(msg) {
    if (msg.type === 'SYNC_LISTINGS' || msg.type === 'FORCE_UPDATE') {
      this.fetchRemoteListings();
    } else if (msg.type === 'LISTING_CREATED' && msg.listing) {
      if (!_deletedListingIds.has(msg.listing.id)) {
        const current = this.getListingsLocal();
        if (!current.some(l => l.id === msg.listing.id)) {
          current.unshift(msg.listing);
          this.saveListings(current, false);
          this.notifyUI();
        }
      }
    } else if (msg.type === 'LISTING_REMOVED' && msg.listingId) {
      markListingDeleted(msg.listingId);
      const current = this.getListingsLocal();
      const updated = current.filter(l => l.id !== msg.listingId);
      _inMemoryListings = updated;
      this.saveListings(updated, false);
      this.notifyUI();
    } else if (msg.type === 'ITEM_BOUGHT' && msg.listingId) {
      // Remove o item comprado de todas as abas e atualiza lucros
      markListingDeleted(msg.listingId);
      const current = this.getListingsLocal();
      const updated = current.filter(l => l.id !== msg.listingId);
      _inMemoryListings = updated;
      this.saveListings(updated, false);
      this.notifyUI();
      if (msg.sellerName) {
        this.fetchPlayerSalesFromCloud(msg.sellerName);
      }
    }
  },

  /**
   * Inicializa escuta em tempo real no Firestore e Polling de backup
   */
  initCloudSubscription(state, callbacks = {}) {
    const playerName = (state?.charName || state?.heroName || state?.playerName || state?.name || '').trim();

    // 1. Escuta listagens globais no Firestore
    if (!_isSubscribedToCloud && typeof window !== 'undefined' && window.FirebaseBridge?.subscribeMarketListings) {
      _isSubscribedToCloud = true;
      try {
        window.FirebaseBridge.subscribeMarketListings((remoteListings) => {
          if (Array.isArray(remoteListings)) {
            const cleanRemote = remoteListings.filter(item => this._isValidPlayerListing(item));
            const now = Date.now();
            const localList = this.getListingsLocal().filter(item => {
              if (!this._isValidPlayerListing(item)) return false;
              const inRemote = cleanRemote.some(r => r.id === item.id);
              const isBrandNew = item.createdAt && (now - item.createdAt < 10000);
              return inRemote || isBrandNew;
            });

            const mergedMap = new Map();
            cleanRemote.forEach(l => mergedMap.set(l.id, l));
            localList.forEach(l => {
              if (!mergedMap.has(l.id)) mergedMap.set(l.id, l);
            });

            const mergedList = Array.from(mergedMap.values());
            mergedList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

            _inMemoryListings = mergedList;
            this.saveListings(mergedList, false);
            this.notifyUI();
            if (callbacks.updateAllUI) callbacks.updateAllUI(true);
          }
        });
      } catch (err) {
        console.warn('[MarketService] Erro ao assinar Firestore listings:', err);
      }
    }

    // 2. Escuta vendas em tempo real do jogador atual
    if (playerName && !_isSubscribedToSales && typeof window !== 'undefined' && window.FirebaseBridge?.subscribePlayerSales) {
      _isSubscribedToSales = true;
      try {
        window.FirebaseBridge.subscribePlayerSales(playerName, (remoteSales) => {
          if (remoteSales) {
            const adena = Number(remoteSales.pendingAdena || 0);
            const ac = Number(remoteSales.pendingAdenCoins || 0);
            const currentTotal = adena + ac;

            // Purga imediatamente do cache todos os anúncios vendidos
            if (Array.isArray(remoteSales.history)) {
              remoteSales.history.forEach(h => {
                if (h.listingId) markListingDeleted(h.listingId);
              });
              const current = this.getListingsLocal().filter(l => !_deletedListingIds.has(l.id));
              _inMemoryListings = current;
              this.saveListings(current, false);
            }

            if (currentTotal > _lastPendingTotal && _lastPendingTotal !== 0) {
              if (callbacks.log) {
                callbacks.log(`🎉 [Mercado de Giran] Um dos seus itens anunciados foi VENDIDO! Lucro disponível para resgate na aba 'Minhas Vendas'!`, 'gold');
              }
            }
            _lastPendingTotal = currentTotal;

            this.savePlayerSales(playerName, remoteSales);
            this.notifyUI();
            if (callbacks.updateAllUI) callbacks.updateAllUI(true);
          }
        });
      } catch (err) {
        console.warn('[MarketService] Erro ao assinar Firestore sales:', err);
      }
    }

    // 3. Heartbeat Polling de Backup a cada 3 segundos
    if (!_pollingTimer && typeof window !== 'undefined') {
      _pollingTimer = setInterval(async () => {
        try {
          await this.fetchRemoteListings(state);
          if (playerName) {
            await this.fetchPlayerSalesFromCloud(playerName);
          }
        } catch (e) {}
      }, 3000);
    }
  },

  /**
   * Valida se um anúncio é estritamente de um jogador real (sem sementes/NPCs)
   */
  _isValidPlayerListing(item) {
    if (!item || !item.id || !item.item) return false;
    if (item.isPlayerListing === false) return false;
    if (_deletedListingIds.has(item.id)) return false;
    if (String(item.id || '').startsWith('seed_')) return false;
    const ghostNpcNames = [
      'Merchant Katrina', 'Blacksmith Pushkin', 'Trader Woody', 
      'Shadow Walker Ren', 'Priestess Chloe', 'Dwarf Master Bronze'
    ];
    if (ghostNpcNames.includes(item.sellerName)) return false;
    return true;
  },

  /**
   * Valida se um anúncio pertence ao jogador atual
   */
  _isMyListing(listing, state) {
    if (!listing) return false;
    
    const pName = (state?.charName || state?.heroName || state?.playerName || state?.name || '').trim().toLowerCase();
    const sName = (listing.sellerName || '').trim().toLowerCase();
    
    if (pName && sName) {
      if (pName === sName) return true;
      return false;
    }
    
    const myUid = typeof window !== 'undefined' ? window.FirebaseBridge?.getCurrentUserId?.() : null;
    if (myUid && listing.sellerUid && myUid === listing.sellerUid) {
      return true;
    }
    
    return listing.isLocalCreator === true;
  },

  /**
   * Obtém apenas os anúncios pertencentes ao jogador atual
   */
  getMyListings(state) {
    const all = this.getListings(state);
    return all.filter(l => this._isMyListing(l, state));
  },

  /**
   * Lê os anúncios armazenados no localStorage local
   */
  getListingsLocal() {
    try {
      const raw = localStorage.getItem(MARKET_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.filter(item => this._isValidPlayerListing(item));
        }
      }
    } catch (e) {
      console.warn('[MarketService] Erro ao carregar anúncios locais:', e);
    }
    return [];
  },

  /**
   * Obtém todos os anúncios ativos do mercado
   */
  getListings(state) {
    if (_inMemoryListings !== null) {
      return _inMemoryListings.filter(item => this._isValidPlayerListing(item));
    }

    const localList = this.getListingsLocal();
    _inMemoryListings = localList;
    
    // Dispara busca assíncrona na nuvem
    this.fetchRemoteListings(state);
    return _inMemoryListings;
  },

  /**
   * Busca anúncios mais recentes da nuvem (Firestore + API Serverless)
   */
  async fetchRemoteListings(state) {
    let remoteList = null;

    // 1. Tenta buscar via FirebaseBridge
    try {
      if (typeof window !== 'undefined' && window.FirebaseBridge?.fetchMarketListings) {
        const remote = await window.FirebaseBridge.fetchMarketListings();
        if (Array.isArray(remote)) {
          remoteList = remote.filter(item => this._isValidPlayerListing(item));
        }
      }
    } catch (err) {
      console.warn('[MarketService] Erro ao buscar anúncios do Firebase:', err);
    }

    // 2. Atualiza memória e armazenamento local mesclando anúncios remotos com os do jogador local
    if (remoteList !== null) {
      const now = Date.now();
      const localList = this.getListingsLocal().filter(item => {
        if (!this._isValidPlayerListing(item)) return false;
        const inRemote = remoteList.some(r => r.id === item.id);
        const isBrandNew = item.createdAt && (now - item.createdAt < 10000);
        return inRemote || isBrandNew;
      });

      const mergedMap = new Map();
      remoteList.forEach(l => mergedMap.set(l.id, l));
      localList.forEach(l => {
        if (!mergedMap.has(l.id)) mergedMap.set(l.id, l);
      });

      const mergedList = Array.from(mergedMap.values());
      mergedList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

      _inMemoryListings = mergedList;
      this.saveListings(mergedList, false);
      this.notifyUI();
      return mergedList;
    }

    return this.getListingsLocal();
  },

  /**
   * Salva os anúncios no storage local e atualiza a memória
   */
  saveListings(listings, broadcast = true) {
    const clean = Array.isArray(listings) ? listings.filter(this._isValidPlayerListing) : [];
    _inMemoryListings = clean;
    try {
      localStorage.setItem(MARKET_STORAGE_KEY, JSON.stringify(clean));
      localStorage.removeItem('l2_aden_market_listings_v1');
    } catch (e) {
      console.error('[MarketService] Falha ao salvar anúncios:', e);
    }

    if (broadcast && _marketBroadcastChannel) {
      try {
        _marketBroadcastChannel.postMessage({ type: 'SYNC_LISTINGS' });
      } catch (e) {}
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
        const normKey = String(charName).trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
        return all[normKey] || all[charName] || { pendingAdena: 0, pendingAdenCoins: 0, history: [] };
      }
    } catch (e) {
      console.warn('[MarketService] Erro ao carregar vendas locais:', e);
    }
    return { pendingAdena: 0, pendingAdenCoins: 0, history: [] };
  },

  /**
   * Atualiza as vendas do jogador com base na nuvem e API
   */
  async fetchPlayerSalesFromCloud(charName = 'Hero of Aden') {
    let remoteSales = null;

    // 1. Tenta Firebase
    try {
      if (typeof window !== 'undefined' && window.FirebaseBridge?.fetchPlayerSales) {
        remoteSales = await window.FirebaseBridge.fetchPlayerSales(charName);
      }
    } catch (err) {
      console.warn('[MarketService] Erro ao sincronizar vendas do Firebase:', err);
    }

    if (remoteSales) {
      const local = this.getPlayerSales(charName);
      const merged = {
        pendingAdena: Math.max(local.pendingAdena || 0, remoteSales.pendingAdena || 0),
        pendingAdenCoins: Math.max(local.pendingAdenCoins || 0, remoteSales.pendingAdenCoins || 0),
        history: remoteSales.history || local.history || []
      };
      this.savePlayerSales(charName, merged);
      return merged;
    }

    return this.getPlayerSales(charName);
  },

  /**
   * Salva os dados de vendas do jogador
   */
  savePlayerSales(charName, data) {
    try {
      const raw = localStorage.getItem(MARKET_SALES_KEY);
      const all = raw ? JSON.parse(raw) : {};
      const normKey = String(charName).trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
      all[charName] = data;
      all[normKey] = data;
      localStorage.setItem(MARKET_SALES_KEY, JSON.stringify(all));
      localStorage.removeItem('l2_aden_market_sales_v1');
    } catch (e) {
      console.error('[MarketService] Falha ao salvar vendas do jogador:', e);
    }
  },

  /**
   * Cria um novo anúncio de jogador no mercado
   */
  async createListing(state, { itemUid, quantity = 1, pricePerUnit, currency = 'adena' }) {
    if (!state || !state.inventory) {
      return { ok: false, msg: 'Inventário indisponível.' };
    }

    const itemIndex = state.inventory.findIndex(i => (i.uid === itemUid || i.id === itemUid));
    if (itemIndex === -1) {
      return { ok: false, msg: 'Item não encontrado na mochila.' };
    }

    const item = state.inventory[itemIndex];
    const realItemId = item.itemId || (typeof item.id === 'string' && !item.id.startsWith('item_') && !item.id.includes('.') ? item.id : null);
    const def = getItemDefinition(realItemId) || getItemDefinition(item.id) || {};
    const finalItemId = def.id || realItemId || item.itemId || item.id || 'short_sword';
    const finalName = item.name || def.name || finalItemId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const finalSlot = item.slot || def.slot || 'material';
    const finalType = item.type || def.type || finalSlot || 'item';
    const finalTier = Number(item.tier || def.tier) || 1;
    const finalRarity = item.rarity || def.rarity || 'common';
    const finalEnchant = Number(item.enchant || item.enchantLevel || 0);
    const finalDesc = item.desc || def.desc || def.info || '';
    const finalIcon = item.icon || def.icon || '';

    // Verifica se está equipado
    const isEquipped = Object.values(state.equipment || {}).includes(item.uid || item.id);
    if (isEquipped) {
      return { ok: false, msg: 'Desequipe o item antes de anunciar no mercado!' };
    }

    const availableCount = Number(item.count || item.quantity) || 1;
    const qtyToSell = Math.min(Math.max(1, Number(quantity) || 1), availableCount);
    const unitPrice = Math.max(1, Math.floor(Number(pricePerUnit) || 1));
    const totalPrice = unitPrice * qtyToSell;

    // Cálculo da taxa imperial de listagem (5% em Adena - mínimo 100a)
    const listingFee = Math.max(100, Math.floor((currency === 'adena' ? totalPrice : totalPrice * 1000) * 0.05));

    if ((state.gold || 0) < listingFee) {
      return { ok: false, msg: `Adena insuficiente para a taxa imperial de listagem (Exige ${listingFee.toLocaleString()} Adena).` };
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

    const sellerName = state.charName || state.heroName || state.playerName || state.name || 'Hero of Aden';
    const sellerUid = typeof window !== 'undefined' ? (window.FirebaseBridge?.getCurrentUserId?.() || sellerName) : sellerName;
    const listingId = 'mkt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

    const newListing = {
      id: listingId,
      sellerName: sellerName,
      sellerUid: sellerUid,
      isPlayerListing: true,
      isLocalCreator: true,
      createdAt: Date.now(),
      currency: currency === 'adencoin' ? 'adencoin' : 'adena',
      pricePerUnit: unitPrice,
      totalPrice: totalPrice,
      quantity: qtyToSell,
      item: {
        id: finalItemId,
        itemId: finalItemId,
        name: finalName,
        slot: finalSlot,
        type: finalType,
        tier: finalTier,
        rarity: finalRarity,
        enchant: finalEnchant,
        desc: finalDesc,
        icon: finalIcon
      }
    };

    // 1. Salva localmente com prioridade absoluta
    const listings = this.getListingsLocal();
    listings.unshift(newListing);
    this.saveListings(listings, true);

    // 2. Transmite para outras abas locais
    if (_marketBroadcastChannel) {
      try {
        _marketBroadcastChannel.postMessage({ type: 'LISTING_CREATED', listing: newListing });
      } catch (e) {}
    }

    // 3. Sincroniza com Firebase Cloud
    try {
      if (typeof window !== 'undefined' && window.FirebaseBridge?.createMarketListing) {
        await window.FirebaseBridge.createMarketListing(newListing);
      }
    } catch (err) {
      console.warn('[MarketService] Erro ao gravar anúncio na nuvem:', err);
    }

    this.notifyUI();

    return { 
      ok: true, 
      msg: `Anúncio criado com sucesso! Taxa recolhida pelo Império: ${listingFee.toLocaleString()} Adena.`,
      listing: newListing 
    };
  },

  /**
   * Compra um item anunciado no mercado
   */
  async buyListing(state, listingId) {
    if (!state) return { ok: false, msg: 'Estado de jogo indisponível.' };

    const listings = this.getListings(state);
    const index = listings.findIndex(l => l.id === listingId);
    if (index === -1 || _deletedListingIds.has(listingId)) {
      return { ok: false, msg: 'Este anúncio já foi adquirido por outro jogador ou foi cancelado!' };
    }

    const listing = listings[index];
    const buyerName = state.charName || state.heroName || state.playerName || state.name || 'Hero of Aden';
    const buyerUid = typeof window !== 'undefined' ? window.FirebaseBridge?.getCurrentUserId?.() : null;

    if (this._isMyListing(listing, state)) {
      return { ok: false, msg: 'Você não pode comprar seu próprio anúncio! Cancele-o na aba Minhas Vendas se desejar o item de volta.' };
    }

    // Validação de espaço na mochila (Capacidade Máxima de Slots)
    const maxSlots = (state.race === 'dwarf') ? 250 : 150;
    const actualItemId = listing.item.itemId || listing.item.id;
    const isStackable = ['material', 'consumable', 'scroll', 'crystal', 'powerup', 'potion'].includes(String(listing.item.slot || '').toLowerCase()) || String(listing.item.type || '').toLowerCase() === 'consumable';
    const hasStack = isStackable && (state.inventory || []).some(i => (i.itemId === actualItemId || i.id === actualItemId) && !i.enchant && !i.equipped);
    if (!hasStack && (state.inventory || []).length >= maxSlots) {
      return { ok: false, msg: `Sua mochila está cheia (${state.inventory.length}/${maxSlots})! Libere espaço antes de comprar.` };
    }

    const totalCost = Number(listing.totalPrice) || (listing.pricePerUnit * listing.quantity);
    const currency = listing.currency || 'adena';

    if (currency === 'adencoin') {
      const playerAc = Number(state.adenCoins || state.ac || 0);
      if (playerAc < totalCost) {
        return { ok: false, msg: `Aden Coins insuficientes! Você tem ${playerAc} e o item custa ${totalCost} Aden Coins 👑.` };
      }
    } else {
      const playerGold = Number(state.gold || 0);
      if (playerGold < totalCost) {
        return { ok: false, msg: `Adena insuficiente! Você tem ${playerGold.toLocaleString()} e o item custa ${totalCost.toLocaleString()} Adena 🪙.` };
      }
    }

    // 1. Executa a transação atômica no Cloud Firestore primeiro para assegurar o item
    if (typeof window !== 'undefined' && window.FirebaseBridge?.executeMarketPurchase) {
      try {
        const txResult = await window.FirebaseBridge.executeMarketPurchase(listingId, buyerName, buyerUid);
        if (txResult && txResult.success === false) {
          markListingDeleted(listingId);
          const current = this.getListingsLocal().filter(l => l.id !== listingId);
          _inMemoryListings = current;
          this.saveListings(current, false);
          this.notifyUI();
          return { ok: false, msg: txResult.msg || 'Este item já foi adquirido por outro jogador!' };
        }
      } catch (cloudErr) {
        console.warn('[MarketService] Aviso na transação remota:', cloudErr);
      }
    }

    // 2. Transação aprovada! Deduz a moeda do comprador
    if (currency === 'adencoin') {
      const playerAc = Number(state.adenCoins || state.ac || 0);
      state.adenCoins = playerAc - totalCost;
      state.ac = state.adenCoins;
    } else {
      const playerGold = Number(state.gold || 0);
      state.gold = playerGold - totalCost;
    }

    // 3. Entrega o item comprado ao inventário do jogador com itemId explícito
    const boughtItem = {
      ...listing.item,
      id: actualItemId,
      itemId: actualItemId,
      uid: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      count: Number(listing.quantity) || 1,
      quantity: Number(listing.quantity) || 1,
      rarity: listing.item.rarity || 'common',
      enchant: Number(listing.item.enchant) || 0,
      equipped: false
    };

    state.inventory = state.inventory || [];
    const existingIndex = isStackable 
      ? state.inventory.findIndex(i => (i.itemId === actualItemId || i.id === actualItemId) && !i.enchant && !i.equipped) 
      : -1;

    if (existingIndex !== -1) {
      state.inventory[existingIndex].count = (Number(state.inventory[existingIndex].count) || 1) + (Number(listing.quantity) || 1);
      state.inventory[existingIndex].quantity = state.inventory[existingIndex].count;
    } else {
      state.inventory.push(boughtItem);
    }

    // 4. Registra no extrato local do vendedor
    const saleRecord = {
      itemName: listing.item.name,
      quantity: listing.quantity,
      totalCost: totalCost,
      currency: currency,
      buyer: buyerName
    };
    const salesData = this.getPlayerSales(listing.sellerName);
    if (currency === 'adencoin') {
      salesData.pendingAdenCoins = (salesData.pendingAdenCoins || 0) + totalCost;
    } else {
      const netProfit = totalCost - Math.floor(totalCost * 0.03);
      salesData.pendingAdena = (salesData.pendingAdena || 0) + netProfit;
    }
    salesData.history = salesData.history || [];
    salesData.history.unshift({ ...saleRecord, soldAt: Date.now() });
    this.savePlayerSales(listing.sellerName, salesData);

    // 5. Marca como deletado no tombstone e remove imediatamente da lista local
    markListingDeleted(listingId);
    const updatedAfterBuy = this.getListingsLocal().filter(l => l.id !== listingId && !_deletedListingIds.has(l.id));
    _inMemoryListings = updatedAfterBuy;
    this.saveListings(updatedAfterBuy, true);

    if (_marketBroadcastChannel) {
      try {
        _marketBroadcastChannel.postMessage({ 
          type: 'ITEM_BOUGHT', 
          listingId, 
          sellerName: listing.sellerName,
          buyerName 
        });
      } catch (e) {}
    }

    this.notifyUI();

    return {
      ok: true,
      msg: `Compra realizada com sucesso! Você recebeu ${listing.quantity}x ${listing.item.name}.`,
      item: boughtItem
    };
  },

  /**
   * Cancela uma listagem e devolve o item para a mochila do jogador
   */
  async cancelListing(state, listingId) {
    if (!state) return { ok: false, msg: 'Estado de jogo indisponível.' };

    const listings = this.getListings(state);
    const index = listings.findIndex(l => l.id === listingId);
    if (index === -1 || _deletedListingIds.has(listingId)) {
      return { ok: false, msg: 'Anúncio não encontrado ou já negociado.' };
    }

    const listing = listings[index];

    if (!this._isMyListing(listing, state)) {
      return { ok: false, msg: 'Você só pode cancelar seus próprios anúncios!' };
    }

    // 1. Verifica no Firestore se o anúncio já foi vendido para impedir duplicação e resgate indevido
    if (typeof window !== 'undefined' && window.FirebaseBridge?.checkListingStatus) {
      try {
        const status = await window.FirebaseBridge.checkListingStatus(listingId);
        if (status === 'SOLD' || status === 'NOT_FOUND') {
          markListingDeleted(listingId);
          const updated = this.getListingsLocal().filter(l => l.id !== listingId);
          _inMemoryListings = updated;
          this.saveListings(updated, false);
          this.notifyUI();
          return { ok: false, msg: 'Este item já foi vendido para outro jogador! Os lucros da venda estão disponíveis para resgate na aba Minhas Vendas.' };
        }
      } catch (e) {}
    }

    // 2. Marca como deletado no tombstone
    markListingDeleted(listingId);

    // 3. Devolve o item cancelado ao inventário
    const actualItemId = listing.item.itemId || listing.item.id;
    const returnedItem = {
      uid: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      itemId: actualItemId,
      count: Number(listing.quantity) || 1,
      quantity: Number(listing.quantity) || 1,
      rarity: listing.item.rarity || 'common',
      enchant: Number(listing.item.enchant) || 0,
      equipped: false
    };

    state.inventory = state.inventory || [];
    const isStackable = ['material', 'consumable', 'scroll', 'crystal', 'powerup', 'potion'].includes(String(returnedItem.slot || '').toLowerCase()) || String(returnedItem.type || '').toLowerCase() === 'consumable';
    const existingIndex = isStackable 
      ? state.inventory.findIndex(i => (i.itemId === actualItemId || i.id === actualItemId) && !i.enchant && !i.equipped) 
      : -1;

    if (existingIndex !== -1) {
      state.inventory[existingIndex].count = (Number(state.inventory[existingIndex].count) || 1) + (Number(listing.quantity) || 1);
      state.inventory[existingIndex].quantity = state.inventory[existingIndex].count;
    } else {
      state.inventory.push(returnedItem);
    }

    // 3. Remove do mural e salva
    const updatedAfterCancel = this.getListingsLocal().filter(l => l.id !== listingId && !_deletedListingIds.has(l.id));
    _inMemoryListings = updatedAfterCancel;
    this.saveListings(updatedAfterCancel, true);

    if (_marketBroadcastChannel) {
      try {
        _marketBroadcastChannel.postMessage({ type: 'LISTING_REMOVED', listingId });
      } catch (e) {}
    }

    // 4. Deleta do Firestore
    try {
      if (typeof window !== 'undefined' && window.FirebaseBridge?.deleteMarketListing) {
        await window.FirebaseBridge.deleteMarketListing(listingId);
      }
    } catch (err) {
      console.warn('[MarketService] Erro ao deletar listagem cancelada na nuvem:', err);
    }

    this.notifyUI();

    return {
      ok: true,
      msg: `Anúncio cancelado com sucesso! ${listing.quantity}x ${listing.item.name} devolvido à sua mochila.`
    };
  },

  /**
   * Coleta todos os lucros pendentes de vendas
   */
  async claimProfits(state) {
    if (!state) return { ok: false, msg: 'Estado indisponível.' };

    const playerName = state.charName || state.heroName || state.playerName || state.name || 'Hero of Aden';
    let claimedAdena = 0;
    let claimedCoins = 0;

    // 1. Resgata de forma atômica no Firestore
    if (typeof window !== 'undefined' && window.FirebaseBridge?.claimPlayerSales) {
      try {
        const cloudRes = await window.FirebaseBridge.claimPlayerSales(playerName);
        if (cloudRes && cloudRes.success) {
          claimedAdena = Number(cloudRes.adena) || 0;
          claimedCoins = Number(cloudRes.adenCoins) || 0;
        }
      } catch (e) {
        console.warn('[MarketService] Erro ao resgatar lucros na nuvem:', e);
      }
    }

    // 2. Resgata também dados locais
    const salesData = this.getPlayerSales(playerName);
    const localAdena = Number(salesData.pendingAdena) || 0;
    const localCoins = Number(salesData.pendingAdenCoins) || 0;

    const totalAdena = Math.max(claimedAdena, localAdena);
    const totalCoins = Math.max(claimedCoins, localCoins);

    if (totalAdena <= 0 && totalCoins <= 0) {
      return { ok: false, msg: 'Nenhum lucro pendente de vendas para resgatar no momento.' };
    }

    if (totalAdena > 0) {
      state.gold = (Number(state.gold) || 0) + totalAdena;
      salesData.pendingAdena = 0;
    }
    if (totalCoins > 0) {
      state.adenCoins = (Number(state.adenCoins) || 0) + totalCoins;
      state.ac = state.adenCoins;
      salesData.pendingAdenCoins = 0;
    }

    this.savePlayerSales(playerName, salesData);
    this.notifyUI();

    return {
      ok: true,
      msg: `Lucros imperiais coletados com sucesso: +${totalAdena.toLocaleString()} Adena 🪙 e +${totalCoins} Aden Coins 👑!`,
      adena: totalAdena,
      adencoin: totalCoins
    };
  }
};
