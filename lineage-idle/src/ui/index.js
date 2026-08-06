/**
 * index.js — Ponto unificado de exportação dos módulos de interface (UI).
 */
import { renderStageHero, renderStageMonster, updateZoneUI } from './StageUI.js';
import { updateInventoryUI, updateWarehouseUI, updateEquipmentUI } from './InventoryUI.js';
import { updateSkillUI } from './SkillsUI.js';
import { updateShopUI } from './ShopUI.js';
import { showItemTooltip, hideItemTooltip, getItemIcon, getAssetUrl } from './TooltipUI.js';

export * from './InventoryUI.js';
export * from './ShopUI.js';
export * from './SkillsUI.js';
export * from './StageUI.js';
export * from './TooltipUI.js';
export * from './AppLayout.js';

/**
 * Atualiza todos os componentes da interface com base no estado atual do jogo.
 * @param {Object} state
 * @param {Object} [callbacks]
 */
export function updateAllUI(state, callbacks = {}) {
  if (!state) return;
  renderStageHero(state);
  renderStageMonster(state);
  updateZoneUI(state, callbacks);
  updateInventoryUI(state, callbacks);
  updateSkillUI(state, callbacks);
  updateShopUI(state, callbacks);
}
