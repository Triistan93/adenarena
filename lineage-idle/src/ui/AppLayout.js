/**
 * AppLayout.js — Persistente Split Layout (Batalha à Esquerda | Menus à Direita)
 *
 * Mantém a estrutura de 3 colunas nativa (.stats-panel | .center-panel | .tabs-panel):
 * - Coluna Esquerda 1: Atributos e Stats do Personagem (.stats-panel)
 * - Coluna Esquerda 2: Palco de Batalha (#stage) e Log de Combate (#log) em .center-panel
 * - Coluna Direita: Painéis de Menu (Inventário, Baú, Skills, Loja, Zonas, etc.) em .tabs-panel
 */

const LAYOUT_STYLE_ID = 'app-split-layout-styles';

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

export function showMenuPanel(panelId) {
  const root = getShadowRoot();
  ensureAppLayout();

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

function ensureLayoutStyles() {
  const root = getShadowRoot();
  const target = document.getElementById('idle-host')?.shadowRoot || document.head;
  
  if (root.querySelector?.(`#${LAYOUT_STYLE_ID}`)) return;

  const style = document.createElement('style');
  style.id = LAYOUT_STYLE_ID;
  style.textContent = `
    /* === PERSISTENT 3-COLUMN LAYOUT RECOVERY === */
    .full-window-active, #full-window-close-btn {
      display: none !important;
    }

    main.main-grid, .main-grid {
      display: grid !important;
      grid-template-columns: 220px minmax(0, 1.35fr) minmax(360px, 1fr) !important;
      gap: 12px !important;
      width: 100% !important;
      height: calc(100vh - 120px) !important;
      min-height: 540px !important;
      padding: 10px 12px !important;
      box-sizing: border-box !important;
      overflow: hidden !important;
    }

    .stats-panel {
      display: flex !important;
      flex-direction: column !important;
      visibility: visible !important;
      opacity: 1 !important;
    }

    .center-panel {
      display: flex !important;
      flex-direction: column !important;
      visibility: visible !important;
      opacity: 1 !important;
      min-width: 0 !important;
      height: 100% !important;
      gap: 10px !important;
    }

    #stage, .stage {
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      width: 100% !important;
      height: 380px !important;
      min-height: 280px !important;
      flex: 0 0 auto !important;
      position: relative !important;
      border-radius: 8px !important;
      overflow: hidden !important;
      box-shadow: 0 4px 18px rgba(0,0,0,0.5) !important;
    }

    #log, .log {
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      flex: 1 1 auto !important;
      min-height: 120px !important;
      overflow-y: auto !important;
      overflow-x: hidden !important;
      background: rgba(12, 9, 6, 0.9) !important;
      border: 1px solid #3c2e1e !important;
      border-radius: 8px !important;
      padding: 8px 12px !important;
      box-sizing: border-box !important;
    }

    .tabs-panel {
      display: flex !important;
      flex-direction: column !important;
      visibility: visible !important;
      opacity: 1 !important;
      min-width: 0 !important;
      height: 100% !important;
      background: rgba(18, 14, 10, 0.92) !important;
      border: 1px solid #3c2e1e !important;
      border-radius: 8px !important;
      padding: 8px !important;
      box-sizing: border-box !important;
    }

    .tabs-panel .tab-buttons {
      display: flex !important;
      flex-wrap: wrap !important;
      gap: 4px !important;
      margin-bottom: 8px !important;
      flex-shrink: 0 !important;
    }

    .tabs-panel .tab-content {
      flex: 1 1 auto !important;
      min-height: 0 !important;
      overflow: hidden !important;
      display: flex !important;
      flex-direction: column !important;
    }

    .tabs-panel .tab-pane {
      display: none !important;
      width: 100% !important;
      height: 100% !important;
      min-height: 0 !important;
      overflow-y: auto !important;
      overflow-x: hidden !important;
      box-sizing: border-box !important;
    }

    .tabs-panel .tab-pane.active {
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
    }

    @media (max-width: 900px) {
      main.main-grid, .main-grid {
        grid-template-columns: 1fr !important;
        height: auto !important;
        overflow: visible !important;
      }
    }
  `;
  target.appendChild(style);
}

export function ensureAppLayout() {
  const root = getShadowRoot();
  ensureLayoutStyles();

  const centerPanel = root.querySelector('.center-panel, #center-panel');
  const tabsPanel = root.querySelector('.tabs-panel, #tabs-panel');
  const stage = root.querySelector('#stage, .stage');
  const log = root.querySelector('#log, .log');

  if (centerPanel) {
    centerPanel.style.removeProperty('display');
    centerPanel.style.visibility = 'visible';
    centerPanel.style.opacity = '1';
  }
  if (tabsPanel) {
    tabsPanel.style.removeProperty('display');
    tabsPanel.style.visibility = 'visible';
    tabsPanel.style.opacity = '1';
    tabsPanel.classList.remove('full-window-active');
  }
  if (stage) {
    stage.style.removeProperty('display');
    stage.style.visibility = 'visible';
    stage.style.opacity = '1';
  }
  if (log) {
    log.style.removeProperty('display');
    log.style.visibility = 'visible';
    log.style.opacity = '1';
  }

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
