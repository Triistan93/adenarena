/**
 * ShopUI.js — Renderização das Guias de Loja e Crafting no Lineage Idle.
 *
 * Responsável por desenhar a vitrine da loja regular, roleta mística de gear
 * e receitas da oficina de criação (Crafting).
 */

import { D } from '../core/GameConfig.js';
import { el, qsa } from '../core/DomHelpers.js';
import { getCraftLevelReq, getRecipeMaterials, canCraft } from '../services/CraftService.js';
import { getInventoryCount } from '../services/InventoryService.js';
import { formatItemDisplayName } from './TooltipUI.js';

/**
 * Atualiza a interface da Loja.
 * @param {Object} state
 * @param {Object} [callbacks] — { buyItem, buyMysticItem }
 */
export function updateShopUI(state, callbacks = {}) {
  const goldEl = el('gold-count') || el('shop-gold');
  if (goldEl) goldEl.textContent = (state.gold || 0).toLocaleString();

  const container = el('shop-items-container') || el('shop-list');
  if (!container) return;

  const gData = D();
  const shopItems = gData?.SHOP_ITEMS || [];

  container.innerHTML = shopItems.map(item => {
    const def = gData?.ALL_ITEMS?.[item.itemId || item.id];
    if (!def) return '';

    const price = (def.price || 100) * (item.qty || 1);
    const canAfford = (state.gold || 0) >= price;

    return `
      <div class="shop-item-card">
        <div class="shop-item-icon">${def.icon || '📦'}</div>
        <div class="shop-item-details">
          <div class="shop-item-name">${def.name}</div>
          <div class="shop-item-desc">${def.desc || ''}</div>
          <div class="shop-item-price">💰 ${price.toLocaleString()} Gold</div>
        </div>
        <button class="buy-item-btn" data-buy="${def.id || item.itemId}" ${!canAfford ? 'disabled' : ''}>
          Comprar
        </button>
      </div>
    `;
  }).join('');

  container.querySelectorAll('[data-buy]').forEach(btn => {
    btn.onclick = () => {
      if (callbacks.buyItem) callbacks.buyItem(btn.dataset.buy, 1);
      else if (typeof window !== 'undefined' && typeof window.buyItem === 'function') window.buyItem(btn.dataset.buy, 1);
    };
  });
}

/**
 * Atualiza a interface de Crafting (Oficina de Receitas).
 * @param {Object} state
 * @param {Object} [callbacks] — { craftItem }
 */
export function updateCraftUI(state, callbacks = {}) {
  const craftLvlEl = el('craft-level-num') || el('craft-level');
  if (craftLvlEl) craftLvlEl.textContent = `Lv. ${state.craftLevel || 1}`;

  const container = el('craft-recipes-container') || el('craft-list');
  if (!container) return;

  const gData = D();
  const recipes = gData?.CRAFTING_RECIPES || {};
  const recipeList = Array.isArray(recipes) ? recipes : Object.values(recipes);

  container.innerHTML = recipeList.map(r => {
    if (!r) return '';
    const itemId = r.itemId || r.id;
    const def = gData?.ALL_ITEMS?.[itemId];
    if (!def) return '';

    const reqLvl = r.level ? getCraftLevelReq(r.level) : 1;
    const isLevelOk = (state.craftLevel || 1) >= reqLvl;
    const mats = getRecipeMaterials(r);

    const matsHtml = mats.map(m => {
      const matDef = gData?.ALL_ITEMS?.[m.matId];
      const count = getInventoryCount(state, m.matId);
      const isOk = count >= m.qty;
      return `<span style="color:${isOk ? '#4ade80' : '#ef4444'};">${matDef ? matDef.name : m.matId}: ${count}/${m.qty}</span>`;
    }).join(' · ');

    const craftable = canCraft(state, itemId);

    return `
      <div class="craft-recipe-card ${craftable ? 'craftable' : ''}">
        <div class="craft-recipe-header">
          <span class="craft-recipe-icon">${def.icon || '🔨'}</span>
          <div>
            <div class="craft-recipe-title">${def.name}</div>
            <div class="craft-recipe-sub">Requer Forja Lv.${reqLvl}</div>
          </div>
        </div>
        <div class="craft-mats-line">${matsHtml}</div>
        <button class="craft-item-btn" data-craft="${itemId}" ${!craftable ? 'disabled' : ''}>
          🔨 Criar Item
        </button>
      </div>
    `;
  }).join('');

  container.querySelectorAll('[data-craft]').forEach(btn => {
    btn.onclick = () => {
      if (callbacks.craftItem) callbacks.craftItem(btn.dataset.craft);
    };
  });
}
