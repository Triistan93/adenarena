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
  market: ['#tab-market', '#market-panel', '[data-panel="market"]'],
  craft: ['#tab-craft', '#craft-panel', '.craft-panel', '[data-panel="craft"]'],
  zones: ['#tab-zones', '#zone-panel', '#zone-list', '#zone-map-container', '[data-panel="zones"]'],
  warehouse: ['#tab-warehouse', '#warehouse-panel', '#warehouse-window', '[data-panel="warehouse"]'],
  alchemy: ['#tab-alchemy', '#alchemy-panel', '[data-panel="alchemy"]'],
  astral: ['#tab-astral', '#astral-panel', '[data-panel="astral"]'],
  expeditions: ['#tab-expeditions', '#expeditions-panel', '[data-panel="expeditions"]'],
  raids: ['#tab-raids', '#raids-panel', '[data-panel="raids"]'],
  olympiad: ['#tab-olympiad', '#olympiad-panel', '[data-panel="olympiad"]'],
  clan: ['#tab-clan', '#clan-panel', '[data-panel="clan"]'],
  sevensigns: ['#tab-sevensigns', '#sevensigns-panel', '[data-panel="sevensigns"]'],
  fortress: ['#tab-fortress', '#fortress-panel', '[data-panel="fortress"]'],
  colosseum: ['#tab-colosseum', '#colosseum-panel', '[data-panel="colosseum"]'],
  rankings: ['#tab-rankings', '#rankings-panel', '[data-panel="rankings"]'],
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

const PILLAR_MAP = {
  zones: 'combat',
  raids: 'combat',
  tower: 'combat',
  colosseum: 'combat',
  expeditions: 'combat',
  
  character: 'character',
  inventory: 'character',
  skills: 'character',
  astral: 'character',
  dolls: 'character',
  quests: 'character',
  
  market: 'economy',
  shop: 'economy',
  craft: 'economy',
  alchemy: 'economy',
  warehouse: 'economy',
  magiclamp: 'economy',
  
  clan: 'glory',
  olympiad: 'glory',
  rankings: 'glory',
  sevensigns: 'glory',
  fortress: 'glory',
  enchant: 'glory',
  codex: 'glory'
};

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

  // Sincroniza o Pilar Mestre correspondente
  const pillar = PILLAR_MAP[panelId] || 'combat';
  const pillarBtns = root.querySelectorAll('.pillar-tab-btn');
  pillarBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset?.pillar === pillar);
  });

  const strips = root.querySelectorAll('.pillar-subtabs-strip');
  strips.forEach(strip => {
    strip.style.display = strip.id === `pillar-strip-${pillar}` ? 'flex' : 'none';
  });
}

// Expõe globalmente a troca manual de pilar com expansão/colapso reativo
if (typeof window !== 'undefined') {
  window.switchPillar = function(pillarName) {
    const root = getShadowRoot();
    const activePillarBtn = root.querySelector(`.pillar-tab-btn[data-pillar="${pillarName}"]`);
    const isCurrentlyActive = activePillarBtn && activePillarBtn.classList.contains('active');
    const strip = root.getElementById(`pillar-strip-${pillarName}`);
    const isStripVisible = strip && strip.style.display !== 'none' && !strip.classList.contains('collapsed');

    // Se já está aberto e clicou novamente no mesmo pilar, fecha/recolhe o menu de sub-opções!
    if (isCurrentlyActive && isStripVisible) {
      if (strip) {
        strip.style.display = 'none';
        strip.classList.add('collapsed');
      }
      if (activePillarBtn) activePillarBtn.classList.remove('active');
      return;
    }

    // Caso contrário, ativa o pilar e expande suas sub-opções
    const pillarBtns = root.querySelectorAll('.pillar-tab-btn');
    pillarBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset?.pillar === pillarName);
    });

    const strips = root.querySelectorAll('.pillar-subtabs-strip');
    strips.forEach(s => {
      const isTarget = s.id === `pillar-strip-${pillarName}`;
      s.style.display = isTarget ? 'flex' : 'none';
      s.classList.toggle('collapsed', !isTarget);
    });

    const targetStrip = root.getElementById(`pillar-strip-${pillarName}`);
    if (targetStrip) {
      const activeTab = targetStrip.querySelector('.tab-btn.active') || targetStrip.querySelector('.tab-btn');
      if (activeTab) activeTab.click();
    }
  };
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
