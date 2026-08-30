/**
 * MarketUI.js — Interface do Mercado de Giran (Auction House P2P)
 * 
 * Renderiza o mural de ofertas com compra/venda por Adena ou Aden Coins,
 * formulário de listagem com taxa de 5%, e painel de lucros de vendas.
 */

import { MarketService, MARKET_CATEGORIES } from '../services/MarketService.js';
import { getItemIconUrl } from './GameUI.js';
import { D } from '../core/GameConfig.js';

let _activeMarketTab = 'buy'; // 'buy' | 'sell' | 'my_sales'
let _selectedCategory = 'all';
let _currencyFilter = 'all'; // 'all' | 'adena' | 'adencoin'
let _searchQuery = '';
let _selectedSellItemUid = null;
let _sellQuantity = 1;
let _sellCurrency = 'adena'; // 'adena' | 'adencoin'
let _sellPriceUnit = 1000;

export function showMarketToast(msg, type = 'info') {
  if (typeof document === 'undefined') return;
  let toastEl = document.getElementById('market-toast');
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.id = 'market-toast';
    toastEl.style.cssText = `
      position: fixed;
      top: 24px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 99999;
      padding: 12px 24px;
      border-radius: 10px;
      font-family: 'Cinzel', serif;
      font-size: 13px;
      font-weight: bold;
      letter-spacing: 0.5px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.85);
      transition: opacity 0.3s ease, transform 0.3s ease;
      pointer-events: none;
      text-align: center;
      max-width: 90vw;
    `;
    document.body.appendChild(toastEl);
  }

  const bgMap = {
    success: 'linear-gradient(135deg, rgba(20,80,45,0.96), rgba(10,40,25,0.98))',
    warning: 'linear-gradient(135deg, rgba(120,60,10,0.96), rgba(60,30,5,0.98))',
    gold: 'linear-gradient(135deg, rgba(140,100,20,0.96), rgba(80,50,10,0.98))',
    info: 'linear-gradient(135deg, rgba(20,40,70,0.96), rgba(10,20,40,0.98))'
  };
  const borderMap = {
    success: '#22c55e',
    warning: '#f59e0b',
    gold: '#ffd877',
    info: '#60a5fa'
  };
  const colorMap = {
    success: '#86efac',
    warning: '#fde68a',
    gold: '#ffd877',
    info: '#bfdbfe'
  };

  toastEl.style.background = bgMap[type] || bgMap.info;
  toastEl.style.border = `1px solid ${borderMap[type] || borderMap.info}`;
  toastEl.style.color = colorMap[type] || colorMap.info;
  toastEl.innerText = msg;
  toastEl.style.opacity = '1';
  toastEl.style.transform = 'translateX(-50%) translateY(0)';

  clearTimeout(toastEl._timer);
  toastEl._timer = setTimeout(() => {
    toastEl.style.opacity = '0';
    toastEl.style.transform = 'translateX(-50%) translateY(-10px)';
  }, 3500);
}

export function setActiveMarketTab(tab) {
  _activeMarketTab = tab;
}

export function renderMarketTab(container, state, callbacks = {}) {
  if (!container || !state) return;

  MarketService.initCloudSubscription(state, callbacks);

  const playerName = state.charName || state.heroName || state.playerName || state.name || 'Hero of Aden';
  const playerGold = Number(state.gold || 0);
  const playerAc = Number(state.adenCoins || state.ac || 0);
  const salesData = MarketService.getPlayerSales(playerName);
  const pendingAdena = Number(salesData.pendingAdena || 0);
  const pendingAc = Number(salesData.pendingAdenCoins || 0);
  const hasProfits = pendingAdena > 0 || pendingAc > 0;

  // Header com tema de Giran
  let html = `
    <div class="market-container" style="padding: 10px; max-width: 1100px; margin: 0 auto; font-family: 'Cinzel', serif;">
      
      <!-- Top Header & Player Balance -->
      <div style="background: linear-gradient(135deg, rgba(20,25,35,0.95), rgba(10,12,18,0.98)); border: 1px solid rgba(212,167,68,0.4); border-radius: 12px; padding: 16px; margin-bottom: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.6); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="font-size: 36px; background: rgba(0,0,0,0.4); border: 1px solid rgba(212,167,68,0.4); border-radius: 10px; width: 54px; height: 54px; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 0 10px rgba(212,167,68,0.2);">
            🏛️
          </div>
          <div>
            <h2 style="margin: 0; color: #f4d58a; font-size: 20px; font-weight: bold; letter-spacing: 0.5px;">Mercado Central de Giran</h2>
            <p style="margin: 2px 0 0 0; color: #94a3b8; font-size: 12px; font-family: 'Inter', sans-serif;">Comércio P2P Global 100% entre jogadores reais · Negocie em Adena (🪙) ou Aden Coins (👑)</p>
          </div>
        </div>

        <!-- Balances, Sync & Claim Button -->
        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
          <div style="background: rgba(0,0,0,0.5); border: 1px solid rgba(234,179,8,0.3); border-radius: 8px; padding: 8px 14px; display: flex; gap: 14px; font-family: 'IBM Plex Mono', monospace; font-size: 13px;">
            <div style="color: #ffd877; display: flex; align-items: center; gap: 6px;">
              🪙 <span>${playerGold.toLocaleString()}</span>
            </div>
            <div style="color: #60a5fa; display: flex; align-items: center; gap: 6px;">
              👑 <span>${playerAc.toLocaleString()} AC</span>
            </div>
          </div>

          <button id="btn-market-refresh" class="action-btn" title="Sincronizar com a Nuvem" style="background: rgba(30,40,60,0.8); border: 1px solid #60a5fa; color: #93c5fd; border-radius: 8px; padding: 8px 12px; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
            🔄 Atualizar
          </button>

          ${hasProfits ? `
            <button id="btn-market-claim" class="action-btn" style="background: linear-gradient(135deg, #15803d, #22c55e); color: #fff; font-weight: bold; border: 1px solid #4ade80; border-radius: 8px; padding: 8px 16px; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 0 12px rgba(34,197,94,0.4); animation: pulse 1.5s infinite;">
              🎁 Coletar Lucros: ${pendingAdena > 0 ? pendingAdena.toLocaleString() + ' 🪙 ' : ''}${pendingAc > 0 ? pendingAc + ' 👑' : ''}
            </button>
          ` : ''}
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div style="display: flex; gap: 8px; margin-bottom: 16px; border-bottom: 1px solid rgba(212,167,68,0.2); padding-bottom: 8px;">
        <button class="market-nav-btn ${_activeMarketTab === 'buy' ? 'active' : ''}" data-tab="buy" style="background: ${_activeMarketTab === 'buy' ? 'rgba(212,167,68,0.25)' : 'rgba(0,0,0,0.4)'}; border: 1px solid ${_activeMarketTab === 'buy' ? '#ffd877' : 'rgba(255,255,255,0.1)'}; color: ${_activeMarketTab === 'buy' ? '#ffd877' : '#94a3b8'}; padding: 8px 18px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 6px;">
          🛒 Comprar (Mural)
        </button>
        <button class="market-nav-btn ${_activeMarketTab === 'sell' ? 'active' : ''}" data-tab="sell" style="background: ${_activeMarketTab === 'sell' ? 'rgba(212,167,68,0.25)' : 'rgba(0,0,0,0.4)'}; border: 1px solid ${_activeMarketTab === 'sell' ? '#ffd877' : 'rgba(255,255,255,0.1)'}; color: ${_activeMarketTab === 'sell' ? '#ffd877' : '#94a3b8'}; padding: 8px 18px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 6px;">
          🏷️ Criar Anúncio
        </button>
        <button class="market-nav-btn ${_activeMarketTab === 'my_sales' ? 'active' : ''}" data-tab="my_sales" style="background: ${_activeMarketTab === 'my_sales' ? 'rgba(212,167,68,0.25)' : 'rgba(0,0,0,0.4)'}; border: 1px solid ${_activeMarketTab === 'my_sales' ? '#ffd877' : 'rgba(255,255,255,0.1)'}; color: ${_activeMarketTab === 'my_sales' ? '#ffd877' : '#94a3b8'}; padding: 8px 18px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 6px;">
          📜 Minhas Vendas (${MarketService.getMyListings(state).length})
        </button>
      </div>
  `;

  // Conteúdo por Sub-Aba
  if (_activeMarketTab === 'buy') {
    html += renderBuyTab(state);
  } else if (_activeMarketTab === 'sell') {
    html += renderSellTab(state);
  } else if (_activeMarketTab === 'my_sales') {
    html += renderMySalesTab(state, salesData);
  }

  html += '</div>';
  container.innerHTML = html;

  attachMarketEvents(container, state, callbacks);
}

/**
 * Renderiza o mural de compras com filtros e busca
 */
function renderBuyTab(state) {
  const allListings = MarketService.getListings();

  // Filtragem
  const filtered = allListings.filter(item => {
    // Categoria
    if (_selectedCategory !== 'all') {
      const slot = item.item?.slot || '';
      if (_selectedCategory === 'weapon' && slot !== 'weapon') return false;
      if (_selectedCategory === 'armor' && !['armor', 'shield', 'helmet', 'gloves', 'boots'].includes(slot)) return false;
      if (_selectedCategory === 'jewel' && !['ring', 'earring', 'necklace', 'belt', 'talisman'].includes(slot)) return false;
      if (_selectedCategory === 'spellbook' && !item.item?.name?.toLowerCase().includes('spellbook') && slot !== 'spellbook' && !item.item?.id?.startsWith('book_')) return false;
      if (_selectedCategory === 'scroll' && slot !== 'scroll' && !item.item?.name?.toLowerCase().includes('scroll') && !item.item?.name?.toLowerCase().includes('enchant')) return false;
      if (_selectedCategory === 'material' && slot !== 'material') return false;
      if (_selectedCategory === 'consumable' && slot !== 'consumable' && slot !== 'powerup') return false;
    }

    // Moeda
    if (_currencyFilter !== 'all' && item.currency !== _currencyFilter) return false;

    // Busca textual
    if (_searchQuery.trim()) {
      const q = _searchQuery.toLowerCase().trim();
      const matchName = (item.item?.name || '').toLowerCase().includes(q);
      const matchDesc = (item.item?.desc || '').toLowerCase().includes(q);
      const matchSeller = (item.sellerName || '').toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchSeller) return false;
    }

    return true;
  });

  return `
    <!-- Filters Bar -->
    <div style="background: rgba(15,20,30,0.85); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px; margin-bottom: 16px; display: flex; flex-direction: column; gap: 10px;">
      
      <!-- Category Pills -->
      <div style="display: flex; gap: 6px; flex-wrap: wrap;">
        ${MARKET_CATEGORIES.map(cat => `
          <button class="market-cat-btn ${_selectedCategory === cat.id ? 'active' : ''}" data-cat="${cat.id}" style="background: ${_selectedCategory === cat.id ? '#ca8a04' : 'rgba(0,0,0,0.4)'}; color: ${_selectedCategory === cat.id ? '#000' : '#cbd5e1'}; border: 1px solid ${_selectedCategory === cat.id ? '#fde047' : 'rgba(255,255,255,0.06)'}; border-radius: 6px; padding: 5px 12px; font-size: 11px; font-family: 'Inter', sans-serif; font-weight: ${_selectedCategory === cat.id ? 'bold' : 'normal'}; cursor: pointer;">
            ${cat.icon} ${cat.name}
          </button>
        `).join('')}
      </div>

      <!-- Currency Filter & Search Input -->
      <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;">
        <div style="display: flex; gap: 6px; align-items: center;">
          <span style="font-size: 11px; color: #94a3b8; font-family: 'Inter', sans-serif;">Moeda:</span>
          <button class="market-cur-filter ${_currencyFilter === 'all' ? 'active' : ''}" data-cur="all" style="background: ${_currencyFilter === 'all' ? 'rgba(212,167,68,0.3)' : 'rgba(0,0,0,0.3)'}; color: ${_currencyFilter === 'all' ? '#ffd877' : '#aaa'}; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 4px 10px; font-size: 11px; cursor: pointer;">🌐 Todas</button>
          <button class="market-cur-filter ${_currencyFilter === 'adena' ? 'active' : ''}" data-cur="adena" style="background: ${_currencyFilter === 'adena' ? 'rgba(234,179,8,0.3)' : 'rgba(0,0,0,0.3)'}; color: ${_currencyFilter === 'adena' ? '#fde047' : '#aaa'}; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 4px 10px; font-size: 11px; cursor: pointer;">🪙 Adena</button>
          <button class="market-cur-filter ${_currencyFilter === 'adencoin' ? 'active' : ''}" data-cur="adencoin" style="background: ${_currencyFilter === 'adencoin' ? 'rgba(59,130,246,0.3)' : 'rgba(0,0,0,0.3)'}; color: ${_currencyFilter === 'adencoin' ? '#93c5fd' : '#aaa'}; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 4px 10px; font-size: 11px; cursor: pointer;">👑 Aden Coin</button>
        </div>

        <div style="flex: 1; max-width: 320px; min-width: 200px;">
          <input type="text" id="market-search-input" value="${_searchQuery}" placeholder="🔍 Buscar por nome do item ou vendedor..." style="width: 100%; background: rgba(0,0,0,0.6); border: 1px solid rgba(212,167,68,0.3); border-radius: 6px; padding: 6px 12px; color: #fff; font-size: 12px; font-family: 'Inter', sans-serif; box-sizing: border-box;" />
        </div>
      </div>
    </div>

    <!-- Listings Grid / List -->
    ${filtered.length === 0 ? `
      <div style="text-align: center; padding: 40px 20px; background: rgba(15,20,30,0.6); border: 1px dashed rgba(212,167,68,0.3); border-radius: 10px; color: #cbd5e1; font-family: 'Cinzel', serif;">
        <div style="font-size: 38px; margin-bottom: 8px;">🏛️</div>
        <h3 style="margin: 0 0 6px 0; color: #ffd877; font-size: 16px;">O Mercado de Giran está pronto para novas ofertas!</h3>
        <p style="margin: 0 0 16px 0; font-size: 12px; color: #94a3b8; font-family: 'Inter', sans-serif;">Nenhum item anunciado nesta categoria no momento. Todos os itens deste mercado vêm 100% de jogadores reais de Aden.</p>
        <button id="btn-market-empty-sell" class="action-btn action-btn--primary" style="padding: 8px 20px; font-weight: bold; cursor: pointer; font-size: 12px; font-family: 'Cinzel', serif;">🏷️ Seja o Primeiro a Criar um Anúncio</button>
      </div>
    ` : `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 12px;">
        ${filtered.map(l => {
          const isAdena = l.currency === 'adena';
          const currencyIcon = isAdena ? '🪙' : '👑';
          const currencyColor = isAdena ? '#ffd877' : '#60a5fa';
          const totalCost = Number(l.totalPrice) || (l.pricePerUnit * l.quantity);
          const iconUrl = getItemIconUrl(l.item);
          const isOwnListing = MarketService._isMyListing(l, state);

          return `
            <div style="background: rgba(18,24,36,0.9); border: 1px solid rgba(212,167,68,0.3); border-radius: 10px; padding: 12px; display: flex; flex-direction: column; justify-content: space-between; gap: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.4); transition: transform 0.15s ease;">
              
              <!-- Item Info -->
              <div style="display: flex; gap: 12px; align-items: flex-start;">
                <div style="width: 44px; height: 44px; background: #121620; border: 1px solid rgba(212,167,68,0.5); border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: inset 0 0 6px rgba(0,0,0,0.8);">
                  <img src="${iconUrl}" style="width: 34px; height: 34px; object-fit: contain;" onerror="this.style.display='none'" />
                </div>
                <div style="flex: 1; min-width: 0;">
                  <div style="font-size: 13px; font-weight: bold; color: #f4d58a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    ${l.item.enchant > 0 ? `<span style="color:#60a5fa;">+${l.item.enchant}</span> ` : ''}${l.item.name}
                  </div>
                  <div style="font-size: 11px; color: #94a3b8; font-family: 'Inter', sans-serif; margin-top: 2px;">
                    Qtd: <strong style="color:#fff;">${l.quantity}x</strong> · Vendedor: <span style="color:${l.isPlayerListing ? '#34d399' : '#a78bfa'}; font-weight:bold;">${l.sellerName}</span>
                  </div>
                </div>
              </div>

              <!-- Price & Buy Button -->
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.06); pt: 8px; margin-top: 4px; padding-top: 8px;">
                <div>
                  <div style="font-size: 10px; color: #94a3b8; font-family: 'Inter', sans-serif;">Preço Total:</div>
                  <div style="font-size: 14px; font-weight: bold; color: ${currencyColor}; font-family: 'IBM Plex Mono', monospace;">
                    ${currencyIcon} ${totalCost.toLocaleString()} ${isAdena ? 'Adena' : 'AC'}
                  </div>
                  ${l.quantity > 1 ? `
                    <div style="font-size: 10px; color: #64748b; font-family: 'IBM Plex Mono', monospace;">
                      (${l.pricePerUnit.toLocaleString()} / un)
                    </div>
                  ` : ''}
                </div>

                ${isOwnListing ? `
                  <button class="market-cancel-btn action-btn" data-id="${l.id}" style="background: rgba(239,68,68,0.2); border: 1px solid #ef4444; color: #fca5a5; padding: 6px 12px; border-radius: 6px; font-size: 11px; cursor: pointer; font-weight: bold;">
                    ✕ Cancelar
                  </button>
                ` : `
                  <button class="market-buy-btn action-btn action-btn--primary" data-id="${l.id}" style="padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: bold; cursor: pointer; font-family: 'Cinzel', serif;">
                    🛒 Comprar
                  </button>
                `}
              </div>

            </div>
          `;
        }).join('')}
      </div>
    `}
  `;
}

/**
 * Renderiza o formulário de criação de anúncio
 */
function renderSellTab(state) {
  const inventory = (state.inventory || []).filter(i => {
    // Não permite vender itens atualmente equipados
    const isEquipped = Object.values(state.equipment || {}).includes(i.uid || i.id);
    return !isEquipped;
  });

  const selectedItem = inventory.find(i => (i.uid === _selectedSellItemUid || i.id === _selectedSellItemUid)) || inventory[0];
  if (selectedItem && !_selectedSellItemUid) {
    _selectedSellItemUid = selectedItem.uid || selectedItem.id;
  }

  const maxQty = selectedItem ? (Number(selectedItem.count || selectedItem.quantity) || 1) : 1;
  _sellQuantity = Math.min(Math.max(1, _sellQuantity), maxQty);

  const totalPrice = Math.max(1, _sellPriceUnit) * _sellQuantity;
  const listingFee = Math.max(100, Math.floor((_sellCurrency === 'adena' ? totalPrice : totalPrice * 1000) * 0.05));
  const canPayFee = (state.gold || 0) >= listingFee;

  return `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-family: 'Inter', sans-serif;">
      
      <!-- Coluna Esquerda: Seleção de Item da Mochila -->
      <div style="background: rgba(15,20,30,0.85); border: 1px solid rgba(212,167,68,0.3); border-radius: 10px; padding: 14px;">
        <h4 style="margin: 0 0 10px 0; color: #f4d58a; font-family: 'Cinzel', serif; font-size: 14px;">
          🎒 1. Escolha o item da sua mochila
        </h4>

        ${inventory.length === 0 ? `
          <p style="color: #94a3b8; font-size: 12px;">Sua mochila está vazia ou todos os itens estão equipados.</p>
        ` : `
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(44px, 1fr)); gap: 6px; max-height: 280px; overflow-y: auto; padding-right: 4px;">
            ${inventory.map(item => {
              const isSelected = (item.uid || item.id) === _selectedSellItemUid;
              const count = Number(item.count || item.quantity) || 1;
              const iconUrl = getItemIconUrl(item);

              return `
                <div class="market-select-item ${isSelected ? 'selected' : ''}" data-uid="${item.uid || item.id}" style="width: 44px; height: 44px; background: rgba(0,0,0,0.6); border: 2px solid ${isSelected ? '#ffd877' : 'rgba(255,255,255,0.1)'}; border-radius: 8px; position: relative; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: ${isSelected ? '0 0 10px rgba(253,224,71,0.4)' : 'none'};">
                  <img src="${iconUrl}" style="width: 32px; height: 32px; object-fit: contain;" onerror="this.style.display='none'" />
                  ${count > 1 ? `<span style="position: absolute; bottom: 1px; right: 3px; font-size: 9px; font-weight: bold; color: #fff; background: rgba(0,0,0,0.8); padding: 0 3px; border-radius: 3px;">${count}</span>` : ''}
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>

      <!-- Coluna Direita: Detalhes do Anúncio e Preço -->
      <div style="background: rgba(15,20,30,0.85); border: 1px solid rgba(212,167,68,0.3); border-radius: 10px; padding: 14px; display: flex; flex-direction: column; justify-content: space-between; gap: 12px;">
        
        <div>
          <h4 style="margin: 0 0 10px 0; color: #f4d58a; font-family: 'Cinzel', serif; font-size: 14px;">
            📝 2. Configurar Preço e Quantidade
          </h4>

          ${selectedItem ? `
            <!-- Selected Item Card -->
            <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 10px; display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
              <img src="${getItemIconUrl(selectedItem)}" style="width: 36px; height: 36px; object-fit: contain;" />
              <div>
                <div style="font-weight: bold; color: #ffd877; font-size: 13px;">
                  ${selectedItem.enchant > 0 ? '+' + selectedItem.enchant + ' ' : ''}${selectedItem.name}
                </div>
                <div style="font-size: 11px; color: #94a3b8;">
                  Disponível: ${maxQty} unidade(s)
                </div>
              </div>
            </div>

            <!-- Currency Selection -->
            <div style="margin-bottom: 10px;">
              <label style="font-size: 12px; color: #cbd5e1; display: block; margin-bottom: 4px;">Moeda de Venda:</label>
              <div style="display: flex; gap: 10px;">
                <button class="market-set-currency ${_sellCurrency === 'adena' ? 'active' : ''}" data-cur="adena" style="flex: 1; padding: 8px; border-radius: 6px; background: ${_sellCurrency === 'adena' ? 'rgba(234,179,8,0.25)' : 'rgba(0,0,0,0.4)'}; border: 1px solid ${_sellCurrency === 'adena' ? '#fde047' : 'rgba(255,255,255,0.1)'}; color: ${_sellCurrency === 'adena' ? '#fde047' : '#aaa'}; font-weight: bold; cursor: pointer; font-size: 12px;">
                  🪙 Adena
                </button>
                <button class="market-set-currency ${_sellCurrency === 'adencoin' ? 'active' : ''}" data-cur="adencoin" style="flex: 1; padding: 8px; border-radius: 6px; background: ${_sellCurrency === 'adencoin' ? 'rgba(59,130,246,0.25)' : 'rgba(0,0,0,0.4)'}; border: 1px solid ${_sellCurrency === 'adencoin' ? '#93c5fd' : 'rgba(255,255,255,0.1)'}; color: ${_sellCurrency === 'adencoin' ? '#93c5fd' : '#aaa'}; font-weight: bold; cursor: pointer; font-size: 12px;">
                  👑 Aden Coin (AC)
                </button>
              </div>
            </div>

            <!-- Quantity & Price Inputs -->
            <div style="display: flex; gap: 10px; margin-bottom: 10px;">
              <div style="flex: 1;">
                <label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 2px;">Quantidade:</label>
                <input type="number" id="input-sell-qty" value="${_sellQuantity}" min="1" max="${maxQty}" style="width: 100%; background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; padding: 6px 8px; color: #fff; font-size: 12px; font-family: 'IBM Plex Mono', monospace; box-sizing: border-box;" />
              </div>
              <div style="flex: 2;">
                <label style="font-size: 11px; color: #94a3b8; display: block; margin-bottom: 2px;">Preço Unitário (${_sellCurrency === 'adena' ? '🪙' : '👑'}):</label>
                <input type="number" id="input-sell-price" value="${_sellPriceUnit}" min="1" style="width: 100%; background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; padding: 6px 8px; color: #fff; font-size: 12px; font-family: 'IBM Plex Mono', monospace; box-sizing: border-box;" />
              </div>
            </div>

            <!-- Summary & Fee Box -->
            <div style="background: rgba(0,0,0,0.3); border: 1px dashed rgba(212,167,68,0.3); border-radius: 6px; padding: 8px 10px; font-size: 11px; color: #cbd5e1; display: flex; flex-direction: column; gap: 4px;">
              <div style="display: flex; justify-content: space-between;">
                <span>Valor Total da Venda:</span>
                <strong style="color: ${_sellCurrency === 'adena' ? '#ffd877' : '#60a5fa'}; font-family: 'IBM Plex Mono', monospace;">
                  ${_sellCurrency === 'adena' ? '🪙 ' : '👑 '}${totalPrice.toLocaleString()}
                </strong>
              </div>
              <div style="display: flex; justify-content: space-between; color: #94a3b8;">
                <span>Taxa de Listagem (5% Adena):</span>
                <span style="color: ${canPayFee ? '#4ade80' : '#ef4444'}; font-family: 'IBM Plex Mono', monospace;">
                  🪙 ${listingFee.toLocaleString()} ${!canPayFee ? '(Saldo insuficiente)' : ''}
                </span>
              </div>
              <div style="display: flex; justify-content: space-between; color: #94a3b8;">
                <span>Lucro Líquido Estimado (-3% Coroa):</span>
                <span style="color: #34d399; font-weight: bold; font-family: 'IBM Plex Mono', monospace;">
                  ${_sellCurrency === 'adena' ? `🪙 ${Math.floor(totalPrice * 0.97).toLocaleString()} Adena` : `👑 ${totalPrice.toLocaleString()} AC`}
                </span>
              </div>
            </div>

          ` : ''}
        </div>

        <!-- Submit Button -->
        <button id="btn-submit-listing" class="action-btn" ${!selectedItem || !canPayFee ? 'disabled' : ''} style="background: linear-gradient(135deg, #d97706, #f59e0b); color: #000; font-weight: bold; border: 1px solid #fde047; border-radius: 8px; padding: 10px; cursor: pointer; font-size: 13px; font-family: 'Cinzel', serif; box-shadow: 0 0 10px rgba(245,158,11,0.3);">
          ✨ Publicar Anúncio no Mercado
        </button>

      </div>

    </div>
  `;
}

/**
 * Renderiza os anúncios ativos do jogador e histórico de vendas
 */
function renderMySalesTab(state, salesData) {
  const playerName = state.charName || state.heroName || state.playerName || state.name || 'Hero of Aden';
  const myListings = MarketService.getMyListings(state);
  const history = salesData.history || [];
  const pendingAdena = Number(salesData.pendingAdena || 0);
  const pendingAc = Number(salesData.pendingAdenCoins || 0);
  const hasProfits = pendingAdena > 0 || pendingAc > 0;

  return `
    <div style="display: flex; flex-direction: column; gap: 16px; font-family: 'Inter', sans-serif;">
      
      <!-- Saldo de Vendas & Resgate -->
      <div style="background: linear-gradient(135deg, rgba(20,30,45,0.95), rgba(12,18,28,0.98)); border: 1px solid ${hasProfits ? 'rgba(34,197,94,0.6)' : 'rgba(212,167,68,0.3)'}; border-radius: 10px; padding: 14px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; box-shadow: ${hasProfits ? '0 0 15px rgba(34,197,94,0.2)' : 'none'};">
        <div>
          <h4 style="margin: 0; color: #f4d58a; font-family: 'Cinzel', serif; font-size: 14px; display: flex; align-items: center; gap: 6px;">
            💰 Lucros de Vendas Pendentes
          </h4>
          <div style="margin-top: 6px; font-family: 'IBM Plex Mono', monospace; font-size: 13px; display: flex; gap: 14px;">
            <span style="color:#ffd877;">🪙 ${pendingAdena.toLocaleString()} Adena</span>
            <span style="color:#60a5fa;">👑 ${pendingAc.toLocaleString()} AC</span>
          </div>
        </div>
        ${hasProfits ? `
          <button id="btn-my-sales-claim" class="action-btn" style="background: linear-gradient(135deg, #15803d, #22c55e); color: #fff; font-weight: bold; border: 1px solid #4ade80; border-radius: 8px; padding: 8px 18px; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 0 12px rgba(34,197,94,0.4); animation: pulse 1.5s infinite;">
            🎁 Coletar Lucros Agora
          </button>
        ` : `
          <span style="color: #64748b; font-size: 12px;">Nenhum lucro pendente de resgate</span>
        `}
      </div>

      <!-- Anúncios Ativos -->
      <div style="background: rgba(15,20,30,0.85); border: 1px solid rgba(212,167,68,0.3); border-radius: 10px; padding: 14px;">
        <h4 style="margin: 0 0 12px 0; color: #f4d58a; font-family: 'Cinzel', serif; font-size: 14px;">
          📦 Meus Anúncios em Aberto (${myListings.length})
        </h4>

        ${myListings.length === 0 ? `
          <div style="padding: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
            Você não possui nenhum anúncio ativo no mercado no momento.<br />
            <button id="btn-my-sales-create" class="action-btn action-btn--primary" style="margin-top: 10px; padding: 6px 14px; font-size: 11px; cursor: pointer; font-family: 'Cinzel', serif;">🏷️ Criar um Anúncio Agora</button>
          </div>
        ` : `
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 10px;">
            ${myListings.map(l => {
              const isAdena = l.currency === 'adena';
              return `
                <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(212,167,68,0.3); border-radius: 8px; padding: 10px; display: flex; justify-content: space-between; align-items: center; box-shadow: inset 0 0 10px rgba(0,0,0,0.5);">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${getItemIconUrl(l.item)}" style="width: 34px; height: 34px; object-fit: contain;" />
                    <div>
                      <div style="font-weight: bold; color: #ffd877; font-size: 12px;">
                        ${l.item?.enchant > 0 ? `<span style="color:#60a5fa;">+${l.item.enchant}</span> ` : ''}${l.quantity}x ${l.item?.name}
                      </div>
                      <div style="font-size: 11px; color: ${isAdena ? '#fde047' : '#93c5fd'}; font-family: 'IBM Plex Mono', monospace;">
                        ${isAdena ? '🪙' : '👑'} ${Number(l.totalPrice).toLocaleString()} ${isAdena ? 'Adena' : 'AC'}
                      </div>
                    </div>
                  </div>
                  <button class="market-cancel-btn action-btn" data-id="${l.id}" style="background: rgba(239,68,68,0.2); border: 1px solid #ef4444; color: #fca5a5; border-radius: 6px; padding: 6px 12px; font-size: 11px; cursor: pointer; font-weight: bold;">
                    ✕ Cancelar
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>

      <!-- Histórico de Vendas Concluídas -->
      <div style="background: rgba(15,20,30,0.85); border: 1px solid rgba(212,167,68,0.3); border-radius: 10px; padding: 14px;">
        <h4 style="margin: 0 0 12px 0; color: #f4d58a; font-family: 'Cinzel', serif; font-size: 14px;">
          📜 Histórico Recente de Vendas
        </h4>

        ${history.length === 0 ? `
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">Nenhuma venda realizada recentemente.</p>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 6px; max-height: 220px; overflow-y: auto;">
            ${history.slice(0, 15).map(h => `
              <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.04); border-radius: 6px; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; font-size: 11px;">
                <span style="color: #cbd5e1;">
                  Vendido <strong style="color:#ffd877;">${h.quantity}x ${h.itemName}</strong> para <span style="color:#34d399;">${h.buyer}</span>
                </span>
                <span style="font-weight: bold; color: ${h.currency === 'adena' ? '#ffd877' : '#60a5fa'}; font-family: 'IBM Plex Mono', monospace;">
                  +${h.currency === 'adena' ? '🪙 ' : '👑 '}${h.totalCost.toLocaleString()}
                </span>
              </div>
            `).join('')}
          </div>
        `}
      </div>

    </div>
  `;
}

/**
 * Event Listeners da Interface do Mercado
 */
function attachMarketEvents(container, state, callbacks = {}) {
  // Troca de sub-abas do Mercado
  container.querySelectorAll('.market-nav-btn').forEach(btn => {
    btn.onclick = () => {
      _activeMarketTab = btn.dataset.tab;
      renderMarketTab(container, state, callbacks);
    };
  });

  // Filtro de Categoria
  container.querySelectorAll('.market-cat-btn').forEach(btn => {
    btn.onclick = () => {
      _selectedCategory = btn.dataset.cat;
      renderMarketTab(container, state, callbacks);
    };
  });

  // Filtro de Moeda
  container.querySelectorAll('.market-cur-filter').forEach(btn => {
    btn.onclick = () => {
      _currencyFilter = btn.dataset.cur;
      renderMarketTab(container, state, callbacks);
    };
  });

  // Busca
  const searchInput = container.querySelector('#market-search-input');
  if (searchInput) {
    searchInput.oninput = (e) => {
      _searchQuery = e.target.value;
      // Re-renderiza somente o mural
      const buyPanel = container.querySelector('.market-container');
      if (buyPanel) {
        renderMarketTab(container, state, callbacks);
        // Mantém foco
        const newSearch = container.querySelector('#market-search-input');
        if (newSearch) {
          newSearch.focus();
          newSearch.selectionStart = newSearch.selectionEnd = newSearch.value.length;
        }
      }
    };
  }

  // Sincronização e Atualização Manual com a Nuvem
  const refreshBtn = container.querySelector('#btn-market-refresh');
  if (refreshBtn) {
    refreshBtn.onclick = async () => {
      refreshBtn.disabled = true;
      refreshBtn.innerText = '⏳ Sincronizando...';
      const playerName = state.name || state.charName || 'Hero of Aden';
      await MarketService.fetchRemoteListings();
      await MarketService.fetchPlayerSalesFromCloud(playerName);
      if (callbacks.log) callbacks.log('Mercado de Giran sincronizado com o servidor global!', 'info');
      renderMarketTab(container, state, callbacks);
    };
  }

  // Botão de Criar Anúncio no estado vazio
  const emptySellBtn = container.querySelector('#btn-market-empty-sell');
  if (emptySellBtn) {
    emptySellBtn.onclick = () => {
      _activeMarketTab = 'sell';
      renderMarketTab(container, state, callbacks);
    };
  }

  // Comprar Anúncio
  container.querySelectorAll('.market-buy-btn').forEach(btn => {
    btn.onclick = async () => {
      const listingId = btn.dataset.id;
      btn.disabled = true;
      const res = await MarketService.buyListing(state, listingId);
      showMarketToast(res.msg, res.ok ? 'success' : 'warning');
      if (callbacks.log) callbacks.log(res.msg, res.ok ? 'success' : 'warning');
      if (res.ok) {
        if (typeof callbacks.save === 'function') callbacks.save(true, true);
        if (typeof callbacks.updateAllUI === 'function') callbacks.updateAllUI(true);
        if (typeof window !== 'undefined') {
          if (typeof window.saveGameState === 'function') window.saveGameState(true, true);
          if (typeof window.updateInventoryUI === 'function') window.updateInventoryUI();
        }
      }
      renderMarketTab(container, state, callbacks);
    };
  });

  // Cancelar Anúncio
  container.querySelectorAll('.market-cancel-btn').forEach(btn => {
    btn.onclick = async () => {
      const listingId = btn.dataset.id;
      btn.disabled = true;
      const res = await MarketService.cancelListing(state, listingId);
      showMarketToast(res.msg, res.ok ? 'info' : 'warning');
      if (callbacks.log) callbacks.log(res.msg, res.ok ? 'info' : 'warning');
      if (res.ok) {
        if (typeof callbacks.save === 'function') callbacks.save(true, true);
        if (typeof callbacks.updateAllUI === 'function') callbacks.updateAllUI(true);
        if (typeof window !== 'undefined') {
          if (typeof window.saveGameState === 'function') window.saveGameState(true, true);
          if (typeof window.updateInventoryUI === 'function') window.updateInventoryUI();
        }
      }
      renderMarketTab(container, state, callbacks);
    };
  });

  // Coletar Lucros
  const claimBtns = container.querySelectorAll('#btn-market-claim, #btn-my-sales-claim, .market-claim-btn');
  claimBtns.forEach(btn => {
    btn.onclick = async () => {
      btn.disabled = true;
      const res = await MarketService.claimProfits(state);
      showMarketToast(res.msg, res.ok ? 'gold' : 'info');
      if (callbacks.log) callbacks.log(res.msg, res.ok ? 'gold' : 'info');
      if (res.ok) {
        if (callbacks.save) callbacks.save(true, true);
        if (callbacks.updateAllUI) callbacks.updateAllUI(true);
        if (typeof window !== 'undefined') {
          if (typeof window.saveGameState === 'function') window.saveGameState(true, true);
          if (typeof window.updateInventoryUI === 'function') window.updateInventoryUI();
        }
      }
      renderMarketTab(container, state, callbacks);
    };
  });

  // Selecionar Item para Venda
  container.querySelectorAll('.market-select-item').forEach(el => {
    el.onclick = () => {
      _selectedSellItemUid = el.dataset.uid;
      _sellQuantity = 1;
      renderMarketTab(container, state, callbacks);
    };
  });

  // Alterar Moeda de Venda
  container.querySelectorAll('.market-set-currency').forEach(btn => {
    btn.onclick = () => {
      _sellCurrency = btn.dataset.cur;
      _sellPriceUnit = _sellCurrency === 'adena' ? 10000 : 10;
      renderMarketTab(container, state, callbacks);
    };
  });

  // Inputs de Quantidade e Preço
  const qtyInput = container.querySelector('#input-sell-qty');
  if (qtyInput) {
    qtyInput.onchange = (e) => {
      _sellQuantity = Math.max(1, Number(e.target.value) || 1);
      renderMarketTab(container, state, callbacks);
    };
  }

  const priceInput = container.querySelector('#input-sell-price');
  if (priceInput) {
    priceInput.onchange = (e) => {
      _sellPriceUnit = Math.max(1, Number(e.target.value) || 1);
      renderMarketTab(container, state, callbacks);
    };
  }

  // Botão de Criar Anúncio no estado vazio de Minhas Vendas
  const mySalesCreateBtn = container.querySelector('#btn-my-sales-create');
  if (mySalesCreateBtn) {
    mySalesCreateBtn.onclick = () => {
      _activeMarketTab = 'sell';
      renderMarketTab(container, state, callbacks);
    };
  }

  // Publicar Anúncio
  const submitBtn = container.querySelector('#btn-submit-listing');
  if (submitBtn) {
    submitBtn.onclick = async () => {
      if (!_selectedSellItemUid) {
        showMarketToast('Selecione um item primeiro!', 'warning');
        return;
      }
      submitBtn.disabled = true;
      const res = await MarketService.createListing(state, {
        itemUid: _selectedSellItemUid,
        quantity: _sellQuantity,
        pricePerUnit: _sellPriceUnit,
        currency: _sellCurrency
      });

      showMarketToast(res.msg, res.ok ? 'success' : 'warning');
      if (callbacks.log) callbacks.log(res.msg, res.ok ? 'success' : 'warning');
      if (res.ok) {
        _selectedSellItemUid = null;
        _activeMarketTab = 'my_sales';
        if (callbacks.save) callbacks.save();
        if (callbacks.updateAllUI) callbacks.updateAllUI(true);
      }
      renderMarketTab(container, state, callbacks);
    };
  }
}
