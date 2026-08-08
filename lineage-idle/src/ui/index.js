/**
 * index.js — Ponto unificado de exportação dos módulos de interface (UI).
 * Redireciona todas as chamadas para o módulo consolidado GameUI.js e AppLayout.js.
 */
import {
  renderStageHero,
  renderStageMonster,
  updateZoneUI,
  updateInventoryUI,
  updateSkillUI,
  updateShopUI
} from './GameUI.js';

export * from './GameUI.js';
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
