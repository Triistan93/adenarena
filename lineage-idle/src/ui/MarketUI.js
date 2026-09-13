/**
 * MarketUI.js — Interface do Mercado de Giran (Auction House P2P)
 * 
 * Renderiza o mural de ofertas com compra/venda por Adena ou Aden Coins,
 * formulário de listagem com taxa de 5%, e painel de lucros de vendas.
 */

import { MarketService, MARKET_CATEGORIES } from '../services/MarketService.js';
import { getItemIconUrl, getItemIcon } from './GameUI.js';
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

if (typeof window !== 'undefined') {
  window.showMarketToast = showMarketToast;
}

export function setActiveMarketTab(tab) {
  _activeMarketTab = tab;
}

export const WT_CATEGORIES = [
  { id: 'all', name: 'All Goods', icon: '🌐' },
  { id: 'adena', name: 'Adena', icon: '🪙' },
  { id: 'equipment', name: 'Equipment', icon: '⚔️' },
  { id: 'artifact', name: 'Artifact', icon: '💍' },
  { id: 'scrolls', name: 'Scrolls', icon: '📜' },
  { id: 'supplies', name: 'Supplies', icon: '🧪' },
  { id: 'misc', name: 'Misc.', icon: '📦' },
  { id: 'collection', name: 'Collection', icon: '🏛️', soon: true }
];

function matchesCategory(item, category) {
  if (!category || category === 'all') return true;
  if (category === 'collection') return false;

  const slot = (item.item?.slot || '').toLowerCase();
  const name = (item.item?.name || '').toLowerCase();
  const id = (item.item?.id || item.item?.itemId || '').toLowerCase();

  if (category === 'adena') {
    return item.currency === 'adena' || id.includes('adena') || id.includes('coin') || name.includes('adena') || name.includes('coin');
  }
  if (category === 'equipment') {
    return ['weapon', 'armor', 'chest', 'legs', 'head', 'helmet', 'gloves', 'boots', 'shield', 'lower', 'upper', 'full'].includes(slot);
  }
  if (category === 'artifact') {
    return ['ring', 'earring', 'necklace', 'belt', 'talisman', 'cloak', 'brooch', 'bracelet', 'jewel', 'artifact'].includes(slot) || name.includes('talisman') || name.includes('belt') || name.includes('artifact');
  }
  if (category === 'scrolls') {
    return slot === 'scroll' || slot === 'spellbook' || name.includes('scroll') || name.includes('spellbook') || name.includes('enchant') || name.includes('tome') || id.startsWith('book_');
  }
  if (category === 'supplies') {
    return ['potion', 'consumable', 'powerup'].includes(slot) || name.includes('potion') || name.includes('shot') || name.includes('soulshot') || name.includes('spiritshot') || name.includes('elixir');
  }
  if (category === 'misc') {
    return ['material', 'dye', 'relic'].includes(slot) || name.includes('ore') || name.includes('crystal') || name.includes('feather') || name.includes('thread') || name.includes('leather') || name.includes('suede');
  }
  return true;
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

  let html = `
    <div class="l2wt-window-frame" style="max-width: 1040px; margin: 0 auto; min-height: 540px;">
      
      <!-- Top Banner (Image 1) -->
      <div class="l2wt-banner">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="font-size: 28px; background: rgba(0,0,0,0.5); border: 1px solid rgba(212,167,68,0.4); border-radius: 8px; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 0 10px rgba(212,167,68,0.2);">
            🏛️
          </div>
          <div>
            <div class="l2wt-banner-title">World Trade</div>
            <p style="margin: 2px 0 0 0; color: #94a3b8; font-size: 11px; font-family: 'Inter', sans-serif;">Comércio Global P2P · Sistema Oficial entre Jogadores Reais de Aden</p>
          </div>
        </div>

        <!-- Balances and Action Button -->
        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <div style="background: rgba(0,0,0,0.6); border: 1px solid rgba(212,167,68,0.35); border-radius: 6px; padding: 6px 14px; display: flex; gap: 14px; font-family: 'IBM Plex Mono', monospace; font-size: 12px;">
            <span style="color: #ffd877; display: flex; align-items: center; gap: 5px;">🪙 ${playerGold.toLocaleString()}</span>
            <span style="color: #60a5fa; display: flex; align-items: center; gap: 5px;">👑 ${playerAc.toLocaleString()} AC</span>
          </div>

          ${_activeMarketTab === 'buy' ? `
            <button id="btn-world-trade-my-items" class="l2wt-my-items-btn" title="Gerenciar meus anúncios e lucros">
              📦 My items
            </button>
          ` : `
            <button id="btn-world-trade-back-market" class="l2wt-my-items-btn" style="background: linear-gradient(180deg, #1e293b, #0f172a); border-color: #94a3b8; color: #f1f5f9; box-shadow: none;">
              ← Back to World Trade
            </button>
          `}
        </div>
      </div>
  `;

  if (_activeMarketTab === 'buy') {
    // Abas de Categoria Autênticas do World Trade
    html += `
      <div class="l2wt-tabs-bar">
        ${WT_CATEGORIES.map(cat => `
          <button class="l2wt-tab ${_selectedCategory === cat.id ? 'active' : ''}" data-cat="${cat.id}">
            <span>${cat.icon}</span>
            <span>${cat.name}</span>
            ${cat.soon ? '<span class="l2wt-soon-badge">SOON</span>' : ''}
          </button>
        `).join('')}
      </div>

      <!-- Subbar com Filtro de Moeda, Busca e Refresh -->
      <div class="l2wt-subbar">
        <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
          <span style="font-size: 11px; color: #94a3b8; font-family: 'Inter', sans-serif; margin-right: 4px;">Moeda:</span>
          <button class="l2wt-cur-filter ${_currencyFilter === 'all' ? 'active' : ''}" data-cur="all" style="background: ${_currencyFilter === 'all' ? 'rgba(212,167,68,0.25)' : 'rgba(0,0,0,0.4)'}; color: ${_currencyFilter === 'all' ? '#ffd877' : '#94a3b8'}; border: 1px solid ${_currencyFilter === 'all' ? '#ffd877' : 'rgba(255,255,255,0.1)'}; border-radius: 4px; padding: 4px 10px; font-size: 11px; font-family: 'Cinzel', serif; font-weight: bold; cursor: pointer;">🌐 Todas</button>
          <button class="l2wt-cur-filter ${_currencyFilter === 'adena' ? 'active' : ''}" data-cur="adena" style="background: ${_currencyFilter === 'adena' ? 'rgba(234,179,8,0.25)' : 'rgba(0,0,0,0.4)'}; color: ${_currencyFilter === 'adena' ? '#fde047' : '#94a3b8'}; border: 1px solid ${_currencyFilter === 'adena' ? '#fde047' : 'rgba(255,255,255,0.1)'}; border-radius: 4px; padding: 4px 10px; font-size: 11px; font-family: 'Cinzel', serif; font-weight: bold; cursor: pointer;">🪙 Adena</button>
          <button class="l2wt-cur-filter ${_currencyFilter === 'adencoin' ? 'active' : ''}" data-cur="adencoin" style="background: ${_currencyFilter === 'adencoin' ? 'rgba(59,130,246,0.25)' : 'rgba(0,0,0,0.4)'}; color: ${_currencyFilter === 'adencoin' ? '#93c5fd' : '#94a3b8'}; border: 1px solid ${_currencyFilter === 'adencoin' ? '#93c5fd' : 'rgba(255,255,255,0.1)'}; border-radius: 4px; padding: 4px 10px; font-size: 11px; font-family: 'Cinzel', serif; font-weight: bold; cursor: pointer;">👑 Aden Coin</button>
        </div>

        <div style="display: flex; align-items: center; gap: 8px; flex: 1; max-width: 420px; justify-content: flex-end;">
          <input type="text" id="market-search-input" value="${_searchQuery}" placeholder="🔍 Buscar item ou vendedor..." style="flex: 1; background: rgba(0,0,0,0.6); border: 1px solid rgba(212,167,68,0.3); border-radius: 4px; padding: 5px 10px; color: #fff; font-size: 11px; font-family: 'Inter', sans-serif;" />
          <button id="btn-market-refresh" class="l2wt-refresh-btn" title="Sincronizar ofertas">
            🔄 Refresh
          </button>
        </div>
      </div>
    `;
    html += renderBuyTab(state);
  } else {
    // Navigation Subtabs for My Items
    html += `
      <div class="l2contacts-tabs-bar" style="background: #11141d; border-bottom: 1px solid rgba(212,167,68,0.2);">
        <button class="l2contacts-tab ${_activeMarketTab === 'my_sales' ? 'active' : ''} market-nav-btn" data-tab="my_sales">
          📜 Meus Anúncios (${MarketService.getMyListings(state).length})
        </button>
        <button class="l2contacts-tab ${_activeMarketTab === 'sell' ? 'active' : ''} market-nav-btn" data-tab="sell">
          🏷️ Criar Anúncio (Vender)
        </button>
      </div>
    `;
    if (_activeMarketTab === 'sell') {
      html += renderSellTab(state);
    } else {
      html += renderMySalesTab(state, salesData);
    }
  }

  html += '</div>';
  container.innerHTML = html;

  attachMarketEvents(container, state, callbacks);
}

/**
 * Renderiza a tabela MMO oficial do World Trade (Imagem 1)
 */
function renderBuyTab(state) {
  const allListings = MarketService.getListings();

  // Filtragem
  const filtered = allListings.filter(item => {
    if (!matchesCategory(item, _selectedCategory)) return false;
    if (_currencyFilter !== 'all' && item.currency !== _currencyFilter) return false;
    if (_searchQuery.trim()) {
      const q = _searchQuery.toLowerCase().trim();
      const matchName = (item.item?.name || '').toLowerCase().includes(q);
      const matchSeller = (item.sellerName || '').toLowerCase().includes(q);
      if (!matchName && !matchSeller) return false;
    }
    return true;
  });

  return `
    <div style="overflow-x: auto; min-height: 380px; background: #080a0f;">
      <table class="l2wt-table">
        <thead>
          <tr>
            <th style="width: 46%;">Goods</th>
            <th style="width: 14%; text-align: center;">Total</th>
            <th style="width: 25%; text-align: right;">Price</th>
            <th style="width: 15%; text-align: center;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.length === 0 ? `
            <tr>
              <td colspan="4" style="text-align: center; padding: 48px 16px; color: #94a3b8; font-family: 'Cinzel', serif;">
                <div style="font-size: 32px; margin-bottom: 8px;">🏛️</div>
                <div style="font-size: 15px; color: #ffd877; margin-bottom: 4px; font-weight: bold;">Nenhum item anunciado nesta categoria</div>
                <div style="font-size: 11px; color: #64748b; font-family: 'Inter', sans-serif;">
                  Todos os itens deste mercado vêm de jogadores reais. Clique em <strong style="color: #67e8f9;">'My items'</strong> no topo para anunciar o seu!
                </div>
              </td>
            </tr>
          ` : filtered.map(l => {
            const isAdena = l.currency === 'adena';
            const currencyIcon = isAdena ? '🪙' : '👑';
            const currencyColor = isAdena ? '#ffd877' : '#60a5fa';
            const totalCost = Number(l.totalPrice) || (l.pricePerUnit * l.quantity);
            const isOwnListing = MarketService._isMyListing(l, state);
            const enchantStr = (l.item?.enchant && l.item.enchant > 0) ? `<span style="color: #38bdf8; font-weight: bold; margin-right: 4px;">+${l.item.enchant}</span>` : '';

            return `
              <tr class="l2wt-listing-row" data-search="${(l.item.name + ' ' + l.sellerName).toLowerCase()}">
                <!-- Goods: Authentic Radial Slot + Enchant + Name + Seller -->
                <td>
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 36px; height: 36px; background: radial-gradient(circle at 50% 35%, #56161b 0%, #200608 100%); border: 1px solid rgba(212,167,68,0.45); border-radius: 4px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: inset 0 0 6px rgba(0,0,0,0.8);">
                      ${getItemIcon(l.item)}
                    </div>
                    <div style="min-width: 0;">
                      <div style="font-size: 12px; font-weight: bold; color: #f4d58a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${enchantStr}${l.item.name}
                      </div>
                      <div style="font-size: 10px; color: #94a3b8; font-family: 'Inter', sans-serif; margin-top: 1px;">
                        Vendedor: <span style="color: ${l.isPlayerListing ? '#34d399' : '#a78bfa'}; font-weight: 600;">${l.sellerName}</span>
                      </div>
                    </div>
                  </div>
                </td>

                <!-- Total Quantity -->
                <td style="text-align: center; font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: #cbd5e1; font-weight: 600;">
                  ${Number(l.quantity).toLocaleString()}
                </td>

                <!-- Unit Price / Total Price -->
                <td style="text-align: right; font-family: 'IBM Plex Mono', monospace; font-size: 12px;">
                  <div style="color: ${currencyColor}; font-weight: bold;">
                    ${currencyIcon} ${totalCost.toLocaleString()}
                  </div>
                  ${l.quantity > 1 ? `
                    <div style="font-size: 10px; color: #64748b;">
                      (${Number(l.pricePerUnit).toLocaleString()} /un)
                    </div>
                  ` : ''}
                </td>

                <!-- Action: Buy or Cancel -->
                <td style="text-align: center;">
                  ${isOwnListing ? `
                    <button class="market-cancel-btn action-btn" data-id="${l.id}" style="background: rgba(239,68,68,0.2); border: 1px solid #ef4444; color: #fca5a5; padding: 4px 10px; border-radius: 4px; font-size: 11px; cursor: pointer; font-weight: bold;">
                      ✕ Cancelar
                    </button>
                  ` : `
                    <button class="l2wt-buy-btn market-buy-btn" data-id="${l.id}">
                      Buy
                    </button>
                  `}
                </td>
              </tr>
            `;
          }).join('')}
          <tr id="l2wt-empty-search-row" style="display: none;">
            <td colspan="4" style="text-align: center; padding: 30px 16px; color: #94a3b8; font-size: 12px; font-family: 'Cinzel', serif;">
              🔍 Nenhum item encontrado para esta busca.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
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

              return `
                <div class="market-select-item ${isSelected ? 'selected' : ''}" data-uid="${item.uid || item.id}" style="width: 44px; height: 44px; background: rgba(0,0,0,0.6); border: 2px solid ${isSelected ? '#ffd877' : 'rgba(255,255,255,0.1)'}; border-radius: 8px; position: relative; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: ${isSelected ? '0 0 10px rgba(253,224,71,0.4)' : 'none'};">
                  ${getItemIcon(item)}
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
              ${getItemIcon(selectedItem)}
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
                    ${getItemIcon(l.item)}
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
  // World Trade Banner: Alternar para "My items" e voltar
  const myItemsBtn = container.querySelector('#btn-world-trade-my-items');
  if (myItemsBtn) {
    myItemsBtn.onclick = () => {
      _activeMarketTab = 'my_sales';
      renderMarketTab(container, state, callbacks);
    };
  }

  const backMarketBtn = container.querySelector('#btn-world-trade-back-market');
  if (backMarketBtn) {
    backMarketBtn.onclick = () => {
      _activeMarketTab = 'buy';
      renderMarketTab(container, state, callbacks);
    };
  }

  // World Trade: Abas de Categoria (Imagem 1)
  container.querySelectorAll('.l2wt-tab').forEach(btn => {
    btn.onclick = () => {
      const cat = btn.dataset.cat;
      if (cat === 'collection') {
        showMarketToast('O sistema de Coleções estará disponível no próximo Chronicle!', 'info');
        return;
      }
      _selectedCategory = cat;
      renderMarketTab(container, state, callbacks);
    };
  });

  // World Trade: Filtro de Moeda
  container.querySelectorAll('.l2wt-cur-filter').forEach(btn => {
    btn.onclick = () => {
      _currencyFilter = btn.dataset.cur;
      renderMarketTab(container, state, callbacks);
    };
  });

  // Troca de sub-abas do Mercado
  container.querySelectorAll('.market-nav-btn').forEach(btn => {
    btn.onclick = () => {
      _activeMarketTab = btn.dataset.tab;
      renderMarketTab(container, state, callbacks);
    };
  });

  // Filtro de Categoria Legado (se houver)
  container.querySelectorAll('.market-cat-btn').forEach(btn => {
    btn.onclick = () => {
      _selectedCategory = btn.dataset.cat;
      renderMarketTab(container, state, callbacks);
    };
  });

  // Filtro de Moeda Legado
  container.querySelectorAll('.market-cur-filter').forEach(btn => {
    btn.onclick = () => {
      _currencyFilter = btn.dataset.cur;
      renderMarketTab(container, state, callbacks);
    };
  });

  // Busca instantânea em tempo real sem perda de foco
  const searchInput = container.querySelector('#market-search-input');
  if (searchInput) {
    searchInput.oninput = (e) => {
      _searchQuery = e.target.value;
      const q = _searchQuery.trim().toLowerCase();
      
      // Busca nas linhas da tabela World Trade
      const rows = container.querySelectorAll('.l2wt-listing-row');
      let visibleRowCount = 0;
      rows.forEach(row => {
        const text = row.dataset.search || '';
        const matches = !q || text.includes(q);
        row.style.display = matches ? '' : 'none';
        if (matches) visibleRowCount++;
      });
      const emptySearchRow = container.querySelector('#l2wt-empty-search-row');
      if (emptySearchRow) {
        emptySearchRow.style.display = (visibleRowCount === 0 && rows.length > 0) ? '' : 'none';
      }

      // Busca nos cards legados (se houver)
      const cards = container.querySelectorAll('.market-listing-card');
      let visibleCount = 0;
      cards.forEach(card => {
        const text = card.dataset.search || '';
        const matches = !q || text.includes(q);
        card.style.display = matches ? 'flex' : 'none';
        if (matches) visibleCount++;
      });
      const emptyState = container.querySelector('#market-empty-search-state');
      if (emptyState) {
        emptyState.style.display = (visibleCount === 0 && cards.length > 0) ? 'block' : 'none';
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
