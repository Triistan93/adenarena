/**
 * AppLayout.js — Persistente Split Layout (Batalha à Esquerda | Menus à Direita)
 *
 * Garante que a área de batalha (palco + log) permaneça sempre visível à esquerda
 * e todos os painéis de menu (inventário, baú, skills, loja, zonas, codex, etc.)
 * se alternem exclusivamente na coluna da direita dentro do Shadow DOM.
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

/**
 * Retorna a coluna de batalha (esquerda).
 * @returns {HTMLElement|null}
 */
export function getBattleColumn() {
  const root = getShadowRoot();
  return root.querySelector('[data-app-layout="battle"]');
}

/**
 * Retorna a coluna de menus (direita).
 * @returns {HTMLElement|null}
 */
export function getMenuColumn() {
  const root = getShadowRoot();
  return root.querySelector('[data-app-layout="menu"]');
}

/**
 * Retorna o ID ou elemento do painel ativo atualmente.
 * @returns {string|HTMLElement|null}
 */
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
 * Exibe o painel de menu especificado na coluna direita sem afetar a batalha.
 * @param {string} panelId
 */
export function showMenuPanel(panelId) {
  const root = getShadowRoot();

  // Garante que o layout foi inicializado
  ensureAppLayout();

  // Desativa painéis concorrentes na coluna direita
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

  // Atualiza estado ativo nos botões de navegação
  const tabBtns = root.querySelectorAll('.tab-btn, [data-tab]');
  tabBtns.forEach(btn => {
    const isTarget = btn.dataset?.tab === panelId;
    btn.classList.toggle('active', isTarget);
  });
}

/**
 * Injeta os estilos do split layout no Shadow DOM / Head.
 */
function ensureLayoutStyles() {
  const root = getShadowRoot();
  const target = document.getElementById('idle-host')?.shadowRoot || document.head;
  
  if (root.querySelector?.(`#${LAYOUT_STYLE_ID}`)) return;

  const style = document.createElement('style');
  style.id = LAYOUT_STYLE_ID;
  style.textContent = `
    /* === PERSISTENT SPLIT LAYOUT (Battle Left | Menu Right) === */
    .full-window-active, #full-window-close-btn {
      display: none !important;
    }

    [data-app-layout="root"] {
      display: grid !important;
      grid-template-columns: minmax(0, 1.35fr) minmax(360px, 1fr) !important;
      gap: 12px !important;
      width: 100% !important;
      height: calc(100vh - 120px) !important;
      min-height: 540px !important;
      padding: 10px 12px !important;
      box-sizing: border-box !important;
      overflow: hidden !important;
      background: transparent !important;
    }

    [data-app-layout="battle"] {
      display: flex !important;
      flex-direction: column !important;
      min-width: 0 !important;
      min-height: 0 !important;
      height: 100% !important;
      overflow: hidden !important;
      gap: 10px !important;
    }

    [data-app-layout="battle"] #stage,
    [data-app-layout="battle"] .stage,
    [data-app-layout="battle"] .combat-stage {
      width: 100% !important;
      max-width: 900px !important;
      height: 360px !important;
      min-height: 280px !important;
      max-height: 48vh !important;
      margin: 0 auto !important;
      flex: 0 0 auto !important;
      position: relative !important;
      border-radius: 8px !important;
      overflow: hidden !important;
      box-shadow: 0 4px 18px rgba(0,0,0,0.5) !important;
    }

    [data-app-layout="battle"] #log,
    [data-app-layout="battle"] #battle-log,
    [data-app-layout="battle"] #combat-log,
    [data-app-layout="battle"] .log,
    [data-app-layout="battle"] .battle-log,
    [data-app-layout="battle"] .combat-log {
      flex: 1 1 auto !important;
      min-height: 120px !important;
      max-height: 100% !important;
      overflow-y: auto !important;
      overflow-x: hidden !important;
      background: rgba(12, 9, 6, 0.9) !important;
      border: 1px solid #3c2e1e !important;
      border-radius: 8px !important;
      padding: 8px 12px !important;
      box-sizing: border-box !important;
    }

    [data-app-layout="menu"] {
      display: flex !important;
      flex-direction: column !important;
      min-width: 0 !important;
      min-height: 0 !important;
      height: 100% !important;
      overflow: hidden !important;
      background: rgba(18, 14, 10, 0.92) !important;
      border: 1px solid #3c2e1e !important;
      border-radius: 8px !important;
      padding: 8px !important;
      box-sizing: border-box !important;
    }

    [data-app-layout="menu"] .tab-buttons {
      display: flex !important;
      flex-wrap: wrap !important;
      gap: 4px !important;
      margin-bottom: 8px !important;
      flex-shrink: 0 !important;
    }

    [data-app-layout="menu"] .tab-content {
      flex: 1 1 auto !important;
      min-height: 0 !important;
      overflow: hidden !important;
      display: flex !important;
      flex-direction: column !important;
    }

    [data-app-layout="menu"] .tab-pane {
      display: none !important;
      width: 100% !important;
      height: 100% !important;
      min-height: 0 !important;
      overflow-y: auto !important;
      overflow-x: hidden !important;
      box-sizing: border-box !important;
    }

    [data-app-layout="menu"] .tab-pane.active {
      display: block !important;
    }

    /* Overlays de Menu convertidos em container estático na coluna direita */
    [data-menu-overlay], .menu-overlay, .panel-overlay {
      position: static !important;
      inset: auto !important;
      width: 100% !important;
      height: 100% !important;
      background: transparent !important;
      display: block !important;
    }

    /* Responsividade */
    @media (min-width: 1100px) {
      [data-app-layout="root"] {
        grid-template-columns: minmax(0, 1.4fr) minmax(380px, 1fr) !important;
      }
    }

    @media (max-width: 1099px) and (min-width: 801px) {
      [data-app-layout="root"] {
        grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.9fr) !important;
      }
    }

    @media (max-width: 800px) {
      [data-app-layout="root"] {
        grid-template-columns: 1fr !important;
        height: auto !important;
        min-height: 0 !important;
        overflow: visible !important;
      }

      [data-app-layout="battle"] {
        min-height: 500px !important;
      }

      [data-app-layout="menu"] {
        min-height: 500px !important;
      }
    }
  `;
  target.appendChild(style);
}

/**
 * Inicialização idempotente do layout em 2 colunas no Shadow DOM.
 */
export function ensureAppLayout() {
  const root = getShadowRoot();

  ensureLayoutStyles();

  // Se o layout já estiver montado, não refaz reorganização do DOM
  if (root.querySelector('[data-app-layout="root"]')) {
    return;
  }

  // Localiza os elementos principais no DOM/ShadowRoot
  const centerPanel = root.querySelector('.center-panel, #center-panel') || root.querySelector('.main-grid');
  const tabsPanel = root.querySelector('.tabs-panel, #tabs-panel');
  const stage = root.querySelector('#stage, .stage, .combat-stage');
  const log = root.querySelector('#log, #battle-log, #combat-log, .log');

  if (!stage || !tabsPanel) {
    return;
  }

  // Identifica o container pai onde o layout será inserido
  const mainGrid = root.querySelector('main.main-grid, main, .game');
  if (!mainGrid) return;

  // Cria os wrappers do layout
  const rootLayout = document.createElement('div');
  rootLayout.dataset.appLayout = 'root';

  const battleCol = document.createElement('section');
  battleCol.dataset.appLayout = 'battle';

  const menuCol = document.createElement('aside');
  menuCol.dataset.appLayout = 'menu';

  // Adiciona atributos role aos elementos de log
  if (log) {
    log.dataset.appRole = 'battle-log';
  }

  // Move Palco e Log para a coluna de batalha
  battleCol.appendChild(stage);
  if (log) battleCol.appendChild(log);

  // Move o painel de abas/menus para a coluna de menus
  menuCol.appendChild(tabsPanel);

  rootLayout.appendChild(battleCol);
  rootLayout.appendChild(menuCol);

  // Esconde o painel central antigo caso ainda exista
  if (centerPanel && centerPanel !== mainGrid && centerPanel.parentElement) {
    centerPanel.style.display = 'none';
  }

  mainGrid.appendChild(rootLayout);

  // Marca os painéis no menu para acessibilidade e gerenciamento
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
