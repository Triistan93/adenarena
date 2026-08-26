/**
 * MarketService.js — Mercado Central de Giran (Auction House P2P Real)
 * 
 * Gerencia anúncios 100% reais entre jogadores em tempo real:
 * - Venda livre em Adena (🪙) ou Aden Coin (👑)
 * - Taxa de listagem imperial de 5% em Adena (Adena Sink)
 * - Sincronização multi-contas em Nuvem (Firebase Firestore) + BroadcastChannel
 * - Zero NPCs ou itens fantasmas artificiais
 * - Coleta segura de lucros com histórico detalhado
 */

const MARKET_STORAGE_KEY = 'l2_aden_market_listings_v2';
const MARKET_SALES_KEY = 'l2_aden_market_sales_v2';

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
let _onMarketChangeCallbacks = new Set();

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
   * Notifica ouvintes de UI para re-renderizar o mercado
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
    if (msg.type === 'SYNC_LISTINGS') {
      this.fetchRemoteListings();
    } else if (msg.type === 'LISTING_CREATED' && msg.listing) {
      const current = this.getListings();
      if (!current.some(l => l.id === msg.listing.id)) {
        current.unshift(msg.listing);
        this.saveListings(current);
        this.notifyUI();
      }
    } else if (msg.type === 'LISTING_REMOVED' && msg.listingId) {
      const current = this.getListings();
      const updated = current.filter(l => l.id !== msg.listingId);
      this.saveListings(updated);
      this.notifyUI();
    }
  },

  /**
   * Inicializa escuta em tempo real no Firestore se disponível
   */
  initCloudSubscription() {
    if (_isSubscribedToCloud) return;
    if (typeof window !== 'undefined' && window.FirebaseBridge?.subscribeMarketListings) {
      _isSubscribedToCloud = true;
      try {
        window.FirebaseBridge.subscribeMarketListings((remoteListings) => {
          if (Array.isArray(remoteListings)) {
            const cleanList = remoteListings.filter(this._isValidPlayerListing);
            _inMemoryListings = cleanList;
            this.saveListings(cleanList, false);
            this.notifyUI();
          }
        });
      } catch (err) {
        console.warn('[MarketService] Erro ao assinar Firestore:', err);
      }
    }
  },

  /**
   * Valida se um anúncio é estritamente de um jogador real (sem sementes/NPCs)
   */
  _isValidPlayerListing(item) {
    if (!item || !item.item) return false;
    if (item.isPlayerListing === false) return false;
    if (String(item.id || '').startsWith('seed_')) return false;
    const ghostNpcNames = [
      'Merchant Katrina', 'Blacksmith Pushkin', 'Trader Woody', 
      'Shadow Walker Ren', 'Priestess Chloe', 'Dwarf Master Bronze'
    ];
    if (ghostNpcNames.includes(item.sellerName)) return false;
    return true;
  },

  /**
   * Obtém todos os anúncios ativos do mercado (filtra estritamente itens de jogadores reais)
   */
  getListings() {
    this.initCloudSubscription();

    if (_inMemoryListings !== null) {
      return _inMemoryListings;
    }

    try {
      const raw = localStorage.getItem(MARKET_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const clean = parsed.filter(this._isValidPlayerListing);
          _inMemoryListings = clean;
          return clean;
        }
      }
    } catch (e) {
      console.warn('[MarketService] Erro ao carregar anúncios locais:', e);
    }

    // Se estiver vazio, inicia com lista vazia (SEM NPCs FANTASMAS) e busca da nuvem
    _inMemoryListings = [];
    this.fetchRemoteListings();
    return _inMemoryListings;
  },

  /**
   * Busca anúncios mais recentes da nuvem (Firestore)
   */
  async fetchRemoteListings() {
    this.initCloudSubscription();
    try {
      if (typeof window !== 'undefined' && window.FirebaseBridge?.fetchMarketListings) {
        const remote = await window.FirebaseBridge.fetchMarketListings();
        if (Array.isArray(remote)) {
          const clean = remote.filter(this._isValidPlayerListing);
          _inMemoryListings = clean;
          this.saveListings(clean, false);
          this.notifyUI();
          return clean;
        }
      }
    } catch (err) {
      console.warn('[MarketService] Erro ao buscar anúncios da nuvem:', err);
    }
    return this.getListings();
  },

  /**
   * Salva os anúncios no storage local e atualiza a memória
   */
  saveListings(listings, broadcast = true) {
    const clean = Array.isArray(listings) ? listings.filter(this._isValidPlayerListing) : [];
    _inMemoryListings = clean;
    try {
      localStorage.setItem(MARKET_STORAGE_KEY, JSON.stringify(clean));
      // Limpa chaves legadas de mock anteriores
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
        return all[charName] || { pendingAdena: 0, pendingAdenCoins: 0, history: [] };
      }
    } catch (e) {
      console.warn('[MarketService] Erro ao carregar vendas locais:', e);
    }
    return { pendingAdena: 0, pendingAdenCoins: 0, history: [] };
  },

  /**
   * Atualiza as vendas do jogador com base na nuvem
   */
  async fetchPlayerSalesFromCloud(charName = 'Hero of Aden') {
    try {
      if (typeof window !== 'undefined' && window.FirebaseBridge?.fetchPlayerSales) {
        const remoteSales = await window.FirebaseBridge.fetchPlayerSales(charName);
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
      }
    } catch (err) {
      console.warn('[MarketService] Erro ao sincronizar vendas da nuvem:', err);
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
      all[charName] = data;
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

    const sellerName = state.name || state.charName || 'Hero of Aden';
    const sellerUid = typeof window !== 'undefined' ? (window.FirebaseBridge?.getCurrentUserId?.() || sellerName) : sellerName;
    const listingId = 'mkt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

    const newListing = {
      id: listingId,
      sellerName: sellerName,
      sellerUid: sellerUid,
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

    // 1. Salva localmente
    const listings = this.getListings();
    listings.unshift(newListing);
    this.saveListings(listings, true);

    // 2. Transmite para outras abas
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

    const listings = this.getListings();
    const index = listings.findIndex(l => l.id === listingId);
    if (index === -1) {
      return { ok: false, msg: 'Este anúncio já foi adquirido por outro jogador ou foi cancelado!' };
    }

    const listing = listings[index];
    const buyerName = state.name || state.charName || 'Hero of Aden';

    if (listing.sellerName === buyerName && listing.isPlayerListing) {
      return { ok: false, msg: 'Você não pode comprar seu próprio anúncio! Cancele-o na aba Minhas Vendas se desejar o item de volta.' };
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

    // Entrega o item comprado ao inventário do jogador
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

    // Registra a venda para o vendedor
    const saleRecord = {
      itemName: listing.item.name,
      quantity: listing.quantity,
      totalCost: totalCost,
      currency: currency,
      buyer: buyerName
    };

    // 1. Atualiza vendas locais se o vendedor estiver salvo localmente
    const salesData = this.getPlayerSales(listing.sellerName);
    if (currency === 'adencoin') {
      salesData.pendingAdenCoins = (salesData.pendingAdenCoins || 0) + totalCost;
    } else {
      salesData.pendingAdena = (salesData.pendingAdena || 0) + totalCost;
    }
    salesData.history = salesData.history || [];
    salesData.history.unshift({ ...saleRecord, soldAt: Date.now() });
    this.savePlayerSales(listing.sellerName, salesData);

    // 2. Remove da lista local e transmite
    listings.splice(index, 1);
    this.saveListings(listings, true);

    if (_marketBroadcastChannel) {
      try {
        _marketBroadcastChannel.postMessage({ type: 'LISTING_REMOVED', listingId });
      } catch (e) {}
    }

    // 3. Sincroniza com Firebase Cloud (Deleta listagem e Credita vendedor)
    try {
      if (typeof window !== 'undefined') {
        if (window.FirebaseBridge?.deleteMarketListing) {
          await window.FirebaseBridge.deleteMarketListing(listingId);
        }
        if (window.FirebaseBridge?.recordMarketSale) {
          await window.FirebaseBridge.recordMarketSale(listing.sellerName, saleRecord);
        }
      }
    } catch (err) {
      console.warn('[MarketService] Erro ao sincronizar compra na nuvem:', err);
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

    const listings = this.getListings();
    const index = listings.findIndex(l => l.id === listingId);
    if (index === -1) {
      return { ok: false, msg: 'Anúncio não encontrado ou já negociado.' };
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

    // 1. Remove da lista local
    listings.splice(index, 1);
    this.saveListings(listings, true);

    if (_marketBroadcastChannel) {
      try {
        _marketBroadcastChannel.postMessage({ type: 'LISTING_REMOVED', listingId });
      } catch (e) {}
    }

    // 2. Deleta do Firestore
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

    const playerName = state.name || state.charName || 'Hero of Aden';
    
    // Atualiza com dados mais recentes da nuvem antes de resgatar
    const salesData = await this.fetchPlayerSalesFromCloud(playerName);

    const adena = salesData.pendingAdena || 0;
    const adencoin = salesData.pendingAdenCoins || 0;

    if (adena <= 0 && adencoin <= 0) {
      return { ok: false, msg: 'Nenhum lucro pendente de vendas para resgatar no momento.' };
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

    try {
      if (typeof window !== 'undefined' && window.FirebaseBridge?.claimPlayerSales) {
        await window.FirebaseBridge.claimPlayerSales(playerName);
      }
    } catch (err) {
      console.warn('[MarketService] Erro ao limpar lucros na nuvem:', err);
    }

    this.notifyUI();

    return {
      ok: true,
      msg: `Lucros imperiais coletados com sucesso: +${adena.toLocaleString()} Adena 🪙 e +${adencoin} Aden Coins 👑!`,
      adena,
      adencoin
    };
  }
};

