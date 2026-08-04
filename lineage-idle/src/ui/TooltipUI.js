/**
 * TooltipUI.js — Renderização de Tooltips de Itens e Formatação do Lineage Idle.
 *
 * Responsável por formatar nomes de itens com encantamento (+X), raridade e status Foundation,
 * além de exibir card flutuante de detalhes (atributos, afinidades, affixes).
 */

import { D } from '../core/GameConfig.js';
import { el } from '../core/DomHelpers.js';

/**
 * Formata o nome exibido de um item incluindo seu enchant, raridade e status foundation.
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
