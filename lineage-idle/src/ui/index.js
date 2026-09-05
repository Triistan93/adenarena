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
  updateShopUI,
  updateCharacterUI
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
  try { renderStageHero(state); } catch (e) { console.warn('renderStageHero error:', e); }
  try { renderStageMonster(state); } catch (e) { console.warn('renderStageMonster error:', e); }
  try { updateZoneUI(state, callbacks); } catch (e) { console.warn('updateZoneUI error:', e); }
  try { updateInventoryUI(state, callbacks); } catch (e) { console.warn('updateInventoryUI error:', e); }
  try { updateSkillUI(state, callbacks); } catch (e) { console.warn('updateSkillUI error:', e); }
  try { updateShopUI(state, callbacks); } catch (e) { console.warn('updateShopUI error:', e); }
  try { updateCharacterUI(state, callbacks); } catch (e) { console.warn('updateCharacterUI error:', e); }
}
