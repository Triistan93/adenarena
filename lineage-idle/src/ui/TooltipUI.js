/**
 * TooltipUI.js — Renderização de Tooltips de Itens e Formatação do Lineage Idle.
 *
 * Responsável por formatar nomes de itens com encantamento (+X), raridade e status Foundation,
 * além de exibir card flutuante de detalhes (atributos, afinidades, affixes).
 */

import { D } from '../core/GameConfig.js';
import { el } from '../core/DomHelpers.js';

/**
 * Retorna a URL completa de um asset considerando a BASE_URL.
 * @param {string} p
 * @returns {string}
 */
export function getAssetUrl(p) {
  if (!p) return '';
  p = String(p).replace(/\\/g, '/');
  if (p.startsWith('http://') || p.startsWith('https://') || p.startsWith('data:')) return p;
  const cleanPath = p.replace(/^\//, '');
  let baseUrl = '';
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) {
    baseUrl = import.meta.env.BASE_URL;
  } else if (typeof window !== 'undefined' && window.__BASE_URL__) {
    baseUrl = window.__BASE_URL__;
  }
  if (baseUrl) {
    if (!baseUrl.endsWith('/')) baseUrl += '/';
    return baseUrl + cleanPath;
  }
  return '/' + cleanPath;
}

/**
 * Retorna a URL da imagem PNG de um item (sem HTML) resolvendo em ordem:
 * 1. def.icon
 * 2. IconIndex / ICON_MAP por itemId ou variantes (armor_*, weapon_*, jewel_*, etc.)
 * 3. Convenção img/icons/${itemId}.png
 * 4. null se nada resolver
 *
 * @param {Object|string} itemOrDef
 * @param {Object} [defParam]
 * @returns {string|null}
 */
export function getItemIconUrl(itemOrDef, defParam) {
  if (!itemOrDef && !defParam) return null;
  const gData = D();
  const all = gData?.ALL_ITEMS || {};
  let def = defParam;
  let itemId = '';

  if (typeof itemOrDef === 'string') {
    itemId = itemOrDef;
    if (!def) def = all[itemId];
  } else if (itemOrDef) {
    itemId = itemOrDef.itemId || itemOrDef.id || '';
    if (!def) def = all[itemId] || itemOrDef;
  }

  const iconIndex = (typeof window !== 'undefined' && window.IconIndex)
    ? window.IconIndex
    : (gData?.ICON_MAP || {});

  let rawPath = def?.icon || '';

  if (!rawPath && itemId) {
    const cleanId = String(itemId).trim();
    rawPath = iconIndex[cleanId]
      || iconIndex[`weapon_${cleanId}`]
      || iconIndex[`armor_${cleanId}`]
      || iconIndex[`jewel_${cleanId}`]
      || iconIndex[`shield_${cleanId}`]
      || iconIndex[cleanId.replace(/^(weapon_|armor_|jewel_|shield_|consumable_|material_|scroll_)/, '')]
      || '';
  }

  if (!rawPath && itemId) {
    rawPath = `${itemId}.png`;
  }

  if (rawPath) {
    let p = String(rawPath).replace(/\\/g, '/').replace(/^\//, '');
    if (p.startsWith('http://') || p.startsWith('https://') || p.startsWith('data:')) {
      return p;
    }
    if (!p.endsWith('.png') && !p.endsWith('.jpg') && !p.endsWith('.webp') && !p.endsWith('.svg')) {
      p += '.png';
    }
    if (!p.startsWith('img/icons/') && !p.startsWith('img/')) {
      p = `img/icons/${p}`;
    }
    return getAssetUrl(p);
  }

  return null;
}

/**
 * Retorna o HTML de imagem ou emoji de fallback para um item.
 * @param {Object|string} defOrId
 * @returns {string}
 */
export function getItemIcon(defOrId) {
  if (!defOrId) return '📦';
  const gData = D();
  const all = gData?.ALL_ITEMS || {};
  const def = (typeof defOrId === 'string') ? (all[defOrId] || null) : (defOrId.itemId ? all[defOrId.itemId] : defOrId);
  const slot = def?.slot || (typeof defOrId === 'object' ? defOrId.slot : '') || '';
  const fallbackIcons = {
    weapon: '⚔️', armor: '🛡️', helmet: '⛑️', gloves: '🧤', boots: '👢',
    ring: '💍', earring: '💎', necklace: '📿', consumable: '🧪', material: '💎',
    scroll: '📜', cloak: '🧣', cape: '🧣', belt: '🎗️', hair: '👑', agathion: '🐾'
  };
  const emoji = fallbackIcons[slot] || '📦';

  const iconUrl = getItemIconUrl(defOrId, def);
  if (!iconUrl) return emoji;

  return `<img src="${iconUrl}" alt="${def?.name || ''}" class="item-icon-img" onerror="this.style.display='none';if(this.nextElementSibling)this.nextElementSibling.style.display='inline-block';" style="width:28px; height:28px; object-fit:contain; vertical-align:middle; pointer-events:none;" /><span class="item-icon-fallback" style="display:none; font-size:18px;">${emoji}</span>`;
}

/**
 * Formata o nome exibido de um item incluindo seu encantamento (+X), raridade e status foundation.
 * @param {Object|string} item
 * @param {Object} [def]
 * @returns {string}
 */
export function formatItemDisplayName(item, def) {
  if (!item) return '';
  const itemObj = (typeof item === 'string') ? { itemId: item } : item;
  const gData = D();
  const itemDef = def || (gData?.ALL_ITEMS ? gData.ALL_ITEMS[itemObj.itemId || itemObj.id] : null);
  const baseName = itemDef ? itemDef.name : (itemObj.itemId || itemObj.id || 'Item');

  const enchant = Number(itemObj.enchant) || 0;
  const enchantStr = enchant > 0 ? `+${enchant} ` : '';
  const foundationStr = itemObj.foundation ? ' Foundation' : '';
  const rarity = itemObj.rarity;
  let rarityStr = '';
  if (rarity && rarity !== 'common' && gData?.RARITY && gData.RARITY[rarity]) {
    rarityStr = ` [${gData.RARITY[rarity].name}]`;
  }

  return `${enchantStr}${baseName}${foundationStr}${rarityStr}`;
}

/**
 * Exibe o tooltip flutuante de detalhes de um item na posição do mouse.
 * @param {MouseEvent} e
 * @param {Object} item
 * @param {Object} state
 * @param {Object} [callbacks]
 */
export function showItemTooltip(e, item, state, callbacks = {}) {
  const tooltip = el('item-tooltip');
  if (!tooltip || !item) return;

  const gData = D();
  const def = gData?.ALL_ITEMS?.[item.itemId];
  if (!def) return;

  const displayName = formatItemDisplayName(item, def);
  const rarity = item.rarity || 'common';
  const rarityName = gData?.RARITY?.[rarity]?.name || rarity;

  let statsStr = '';
  if (def.stats) {
    const statsList = Object.entries(def.stats).map(([k, v]) => `${k.toUpperCase()}: +${v}`);
    if (statsList.length > 0) statsStr = `<div class="tooltip-stats">${statsList.join(' · ')}</div>`;
  }

  let affixesStr = '';
  if (item.affixes && item.affixes.length > 0) {
    affixesStr = `<div class="tooltip-affixes">${item.affixes.map(a => `✨ ${a.name}: +${a.value}`).join('<br/>')}</div>`;
  }

  tooltip.innerHTML = `
    <div class="tooltip-header rarity-${rarity}">
      <span class="tooltip-title">${displayName}</span>
      <span class="tooltip-rarity">${rarityName}</span>
    </div>
    <div class="tooltip-slot">${def.slot ? def.slot.toUpperCase() : 'ITEM'} ${def.req?.level ? `· Req Lv.${def.req.level}` : ''}</div>
    ${statsStr}
    ${affixesStr}
    <div class="tooltip-desc">${def.desc || ''}</div>
  `;

  tooltip.style.display = 'block';
  tooltip.style.left = `${e.clientX + 15}px`;
  tooltip.style.top = `${e.clientY + 15}px`;
}

/**
 * Oculta o tooltip de item.
 */
export function hideItemTooltip() {
  const tooltip = el('item-tooltip');
  if (tooltip) tooltip.style.display = 'none';
}
