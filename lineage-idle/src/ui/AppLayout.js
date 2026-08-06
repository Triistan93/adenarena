/**
 * AppLayout.js — Camada fina de controle de abas do menu direito.
 *
 * IMPORTANTE: este arquivo NÃO deve injetar CSS de layout. O grid principal
 * (.main-grid, .stats-panel, .center-panel, .tabs-panel, .grid-resizer-*)
 * já é definido inteiramente por lineage-idle/style.css, incluindo:
 *   - .stats-panel { display: none !important; } (intencional — stats
 *     do personagem aparecem em outro lugar, não como coluna própria)
 *   - .main-grid { grid-template-columns: minmax(0,1fr) 690px !important; }
 *     (2 colunas: batalha+chat flexível | menus fixos em 690px)
 *   - Sistema de resize arrastável (initPanelResizers em main.js)
 *   - Breakpoints responsivos completos (1024px / 980px / 768px)
 *
 * Injetar um segundo <style> aqui (como a versão anterior deste arquivo
 * fazia) entra em conflito com essas regras e quebra o layout. Este arquivo
 * cuida apenas de trocar qual painel de aba (.tab-pane) está visível.
 */

export const PANEL_SELECTORS = {
  character: ['#tab-character', '#character-panel', '[data-panel="character"]'],
  equipment: ['#tab-equipment', '#equipment-panel', '[data-panel="equipment"]'],
  skills: ['#tab-skills', '#skills-panel', '[data-panel="skills"]'],
  inventory: ['#tab-inventory', '#inventory-panel', '#inventory-window', '.inventory-panel', '[data-panel="inventory"]'],
  shop: ['#tab-shop', '#shop-panel', '.shop-panel', '[data-panel="shop"]'],
  craft: ['#tab-craft', '#craft-panel', '.craft-panel', '[data-panel="craft"]'],
  zones: ['#tab-zones', '#zone-panel', '#zone-list', '#zone-map-container', '[data-panel="zones"]'],
  warehouse: ['#tab-warehouse', '#warehouse-panel', '#warehouse-window', '[data-panel="warehouse"]'],
  forge: ['#tab-forge', '#forge-panel', '[data-panel="forge"]'],
  codex: ['#tab-codex', '#codex-panel', '[data-panel="codex"]']
};

function getShadowRoot() {
  return document.getElementById('idle-host')?.shadowRoot || document;
}

export function getBattleColumn() {
  const root = getShadowRoot();
  return root.querySelector('.center-panel, #center-panel');
}

export function getMenuColumn() {
  const root = getShadowRoot();
  return root.querySelector('.tabs-panel, #tabs-panel');
}

export function getActivePanel() {
  const menuCol = getMenuColumn();
  if (!menuCol) return null;
  const activePane = menuCol.querySelector('.tab-pane.active, [data-menu-panel].is-active');
  if (activePane) {
    return activePane.dataset?.menuPanel || activePane.id?.replace(/^tab-/, '') || activePane;
  }
  return null;
}

/**
 * Alterna qual .tab-pane está visível dentro da coluna de menus.
 * Não mexe em display/visibility/grid do layout — apenas nas abas internas.
 */
export function showMenuPanel(panelId) {
  const root = getShadowRoot();

  const tabPanes = root.querySelectorAll('.tab-pane, [data-menu-panel]');
  tabPanes.forEach(pane => {
    const isTarget = pane.id === `tab-${panelId}`
      || pane.dataset?.menuPanel === panelId
      || pane.dataset?.panel === panelId;

    if (isTarget) {
      pane.classList.add('active', 'is-active');
      pane.hidden = false;
      pane.setAttribute('aria-hidden', 'false');
      pane.dataset.menuPanel = panelId;
    } else {
      pane.classList.remove('active', 'is-active');
      pane.hidden = true;
      pane.setAttribute('aria-hidden', 'true');
    }
  });

  const tabBtns = root.querySelectorAll('.tab-btn, [data-tab]');
  tabBtns.forEach(btn => {
    const isTarget = btn.dataset?.tab === panelId;
    btn.classList.toggle('active', isTarget);
  });
}

/**
 * Mantido por compatibilidade (main.js chama ensureAppLayout() antes de
 * showMenuPanel()). Não injeta CSS nem força display/visibility — apenas
 * marca os painéis com data-menu-panel para os seletores acima funcionarem.
 */
export function ensureAppLayout() {
  const root = getShadowRoot();

  for (const [panelId, selectors] of Object.entries(PANEL_SELECTORS)) {
    for (const sel of selectors) {
      const pEl = root.querySelector(sel);
      if (pEl) {
        pEl.dataset.menuPanel = panelId;
        pEl.setAttribute('role', 'tabpanel');
        break;
      }
    }
  }
}
