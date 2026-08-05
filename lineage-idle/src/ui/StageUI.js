O problema é claro: o `getMonsterHost()` está com seletores **genéricos demais** (`[id*="monster"]`, `[class*="monster"]`), e ele está encontrando um **wrapper grande** (provavelmente um painel que envolve o palco inteiro) em vez do slot pequeno dourado à direita do herói.

Note na sua screenshot: o nome e a barra de HP do goblin estão no **topo da tela inteira** — sinal de que o conteúdo foi injetado num container errado que cobre todo o palco.

Aqui está o arquivo corrigido, pronto para copiar e colar:

```javascript
/**
 * StageUI.js — Palco Principal (Hero vs Monster) e Mapa de Zonas.
 * Versão corrigida: container do monstro restrito ao slot correto,
 * sem seletores genéricos que capturam wrappers grandes.
 */

import { ZONES, SAGAS, ZONE_BACKGROUNDS } from '../data/zones.js';
import { MONSTERS, MONSTER_BY_NAME } from '../data/monsters.js';
import { el, updateBar } from '../core/DomHelpers.js';
import { getClass } from '../engine/StatsEngine.js';
import { heroSVG, monsterSVG, MON_IMG } from '../../art.js';

/* ═══════════════════ MONSTRO ═══════════════════ */

export function renderStageMonster(state) {
  ensureStageStyles();

  const m = state?.activeMonster;

  // === 1. Encontra o slot correto (SEM seletores genéricos) ===
  const container = getMonsterHost();

  if (!container) {
    console.error('[StageUI] Slot do monstro não encontrado. Verifique o HTML do palco.');
    return;
  }

  // === 2. TRAVA o container encontrado (mesmo que seja o errado, não cobre a tela) ===
  lockContainerSize(container);

  // === 3. Sem monstro ativo ===
  if (!m) {
    container.innerHTML = `
      <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#666;font-size:13px;">
        ⚔️ Aguardando...
      </div>`;
    return;
  }

  // === 4. Resolve a chave e renderiza ===
  const monsterKey = resolveMonsterKey(m);
  const isBoss = Boolean(m.boss || m.isTower);
  const isElite = Boolean(m.isElite || m.elite);

  let contentHTML = '';
  try {
    contentHTML = monsterSVG(monsterKey, { crown: isBoss, elite: isElite, element: m.element });
    if (!contentHTML) throw new Error('monsterSVG retornou vazio');
  } catch (err) {
    console.error('[StageUI] Erro no monsterSVG:', err);
    contentHTML = getEmergencyPlaceholder(m, monsterKey);
  }

  container.classList.toggle('is-boss', isBoss);
  container.classList.toggle('is-elite', isElite && !isBoss);
  container.innerHTML = contentHTML;

  // === 5. Nome e HP (elementos externos ao slot da imagem) ===
  updateMonsterLabels(m, isBoss, isElite);
  updateMonsterHPBar(m);
}

/* ====================== FUNÇÕES AUXILIARES ====================== */

function getRoot() {
  return document.getElementById('idle-host')?.shadowRoot || document;
}

/**
 * Busca APENAS os slots específicos de sprite, em ordem de prioridade.
 * NUNCA usa seletores genéricos como [id*="monster"] — foi isso que
 * capturou um wrapper gigante e fez o monstro cobrir a tela.
 */
function getMonsterHost() {
  const root = getRoot();

  // Prioridade 1: slot dedicado só para a imagem
  const spriteSlot = root.querySelector('#monster-sprite-container, .monster-sprite-host, #monster-sprite');
  if (spriteSlot) return spriteSlot;

  // Prioridade 2: o card do monstro — mas cria um slot interno dentro dele
  // para NÃO destruir nome/HP bar nem herdar o tamanho do card
  const card = root.querySelector('#stage-monster, .stage-monster');
  if (card) {
    let inner = card.querySelector('.monster-sprite-host');
    if (!inner) {
      inner = document.createElement('div');
      inner.className = 'monster-sprite-host';
      card.appendChild(inner);
    }
    return inner;
  }

  return null;
}

/**
 * Aplica limites rígidos de tamanho no container, inline (vence qualquer CSS).
 * Isso garante que MESMO que o container errado seja encontrado,
 * ele nunca cobrirá a tela.
 */
function lockContainerSize(container) {
  Object.assign(container.style, {
    width: '100%',
    maxWidth: '220px',
    height: '200px',
    maxHeight: '220px',
    minHeight: '160px',
    margin: '0 auto',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: '0',
    boxSizing: 'border-box'
  });
}

export function resolveMonsterKey(m) {
  if (!m) return 'unknown';

  for (const key of [m.id, m.key, m.itemId, m.name]) {
    if (!key) continue;
    let k = String(key).trim();
    k = k.replace(/\s+/g, '');
    const lower = k.toLowerCase();

    if (MON_IMG[k]) return k;
    if (MON_IMG[lower]) return lower;
    if (MON_IMG[`mon_${lower}`]) return `mon_${lower}`;
    if (MON_IMG[`mon_${k}`]) return `mon_${k}`;
  }
  return m.name || 'goblin';
}

function getEmergencyPlaceholder(m, key) {
  const isBoss = m.boss || m.isTower;
  return `
    <div style="
      width:140px; height:160px; display:flex; flex-direction:column;
      align-items:center; justify-content:center; gap:6px;
      background: repeating-linear-gradient(45deg, #1f2937, #1f2937 10px, #374151 10px, #374151 20px);
      border: 3px dashed ${isBoss ? '#eab308' : '#f97316'};
      border-radius: 12px; color: white; font-family: monospace;
    ">
      <div style="font-size:${isBoss ? '48px' : '40px'};">${isBoss ? '👑' : '👹'}</div>
      <strong style="font-size:13px; color:#fbbf24;">${m.name || '???'}</strong>
      <small style="color:#94a3b8; font-size:10px;">ID: ${key}</small>
    </div>`;
}

function updateMonsterLabels(m, isBoss, isElite) {
  const root = getRoot();
  const nameEl = root.querySelector('#monster-name') || el('monster-name');
  if (nameEl) {
    const tag = isBoss ? '👑 CHEFÃO' : (isElite ? '⚡ ÉLITE' : '');
    const lvl = m.level ?? m.lvl ?? 1;
    nameEl.textContent = `${tag ? tag + ' · ' : ''}${m.name} (Nv. ${lvl})`;
  }
}

function updateMonsterHPBar(m) {
  const maxHp = m._maxHp || m.maxHp || m.hp || 100;
  const currentHp = Math.max(0, m.hp || 0);

  updateBar('monster-hp-bar', currentHp, maxHp, 'monster-hp-text');

  const root = getRoot();
  const bar = root.querySelector('#monster-hp-bar .bar-fill, #monster-hp-fill');
  const text = root.querySelector('#monster-hp-text, .monster-hp-text');
  if (bar) {
    const percent = Math.min(100, Math.max(0, (currentHp / maxHp) * 100));
    bar.style.width = percent + '%';
  }
  if (text) text.textContent = `${Math.floor(currentHp)} / ${Math.floor(maxHp)}`;
}

/* ═══════════════════ HERÓI ═══════════════════ */

export function renderStageHero(state) {
  ensureStageStyles();

  const nameEl = el('hero-name');
  if (nameEl) {
    const cls = getClass(state.class);
    nameEl.textContent = `${cls?.name ?? state.class ?? 'Aventureiro'} (Lv. ${state.level})`;
  }

  const box = el('stage-hero');
  if (box) {
    // Trava também o container do herói, para simetria com o monstro
    Object.assign(box.style, {
      maxWidth: '220px',
      height: '200px',
      maxHeight: '220px',
      margin: '0 auto',
      position: 'relative',
      overflow: 'hidden',
      flexShrink: '0',
      boxSizing: 'border-box'
    });
    box.innerHTML = heroSVG(state.race || 'human', state.class || 'fighter');
  }

  updateBar('hero-hp-bar', state.hp, state.maxHp, 'hero-hp-text');
  updateBar('hero-mp-bar', state.mp, state.maxMp, 'hero-mp-text');
}

/* ═══════════════════ ZONAS ═══════════════════ */

export function updateZoneUI(state, callbacks = {}) {
  const z = ZONES[state.zone];
  const nameEl = el('zone-name');
  if (nameEl && z) nameEl.textContent = z.name;
  renderZoneMap(state, callbacks);
}

function maxVisibleSaga(state) {
  const byLevel = SAGAS.reduce(
    (acc, s, i) => ((state.level ?? 1) >= s.unlocksAt ? i : acc), 0);
  return Math.max(state.currentSaga ?? 0, byLevel);
}

export function renderZoneMap(state, callbacks = {}) {
  const container = el('zone-map-container') || el('zone-list');
  if (!container) { console.warn('[StageUI] container de zonas não encontrado'); return; }

  ensureStageStyles();
  container.innerHTML = '';
  container.classList.add('zone-map-root');

  const last = maxVisibleSaga(state);

  for (let i = 0; i <= last; i++) {
    const saga = SAGAS[i];
    if (!saga) continue;

    let cards = '';
    for (const zId of saga.zones) {
      const z = ZONES[zId];
      if (!z) { console.warn(`[StageUI] zona "${zId}" ausente em ZONES`); continue; }

      const current = state.zone === zId;
      const locked  = (state.level ?? 1) < z.level;
      const thumb   = ZONE_BACKGROUNDS[zId] || '';
      const mobs    = z.monsters?.length ?? 0;
      const bossNm  = MONSTERS[z.boss]?.name ?? null;

      cards += `
        <div class="zone-card${current ? ' active' : ''}${locked ? ' locked' : ''}"
             data-zone="${zId}" data-locked="${locked}" data-current="${current}"
             role="button" tabindex="${locked || current ? -1 : 0}">
          <div class="zone-card-thumb"${thumb ? ` style="background-image:url('${thumb}')"` : ''}>
            ${z.town ? '<span class="zone-flag town">🏠 Vila</span>' : ''}
            ${locked ? '<span class="zone-flag lock">🔒</span>' : ''}
            ${current ? '<span class="zone-flag here">★</span>' : ''}
          </div>
          <div class="zone-card-body">
            <div class="zone-card-header">
              <span class="zone-card-title">${z.name}</span>
              <span class="zone-card-lvl">Lv.${z.level}+</span>
            </div>
            <div class="zone-card-desc">${mobs} espécie${mobs === 1 ? '' : 's'}${bossNm ? ` · 👑 ${bossNm}` : ''}</div>
            <button class="select-zone-btn" ${locked || current ? 'disabled' : ''}>
              ${current ? '★ Caçando Aqui' : (locked ? `🔒 Requer Lv.${z.level}` : 'Caçar nesta Área')}
            </button>
          </div>
        </div>`;
    }

    const block = document.createElement('div');
    block.className = 'saga-map-block';
    block.innerHTML = `
      <div class="saga-header">
        <span class="saga-title">🗺️ ${saga.name}</span>
        <span class="saga-req">Lv. ${saga.unlocksAt}+</span>
      </div>
      <div class="saga-zones-grid">${cards}</div>`;
    container.appendChild(block);
  }

  container.onclick = (ev) => {
    const card = ev.target.closest?.('.zone-card');
    if (!card || card.dataset.locked === 'true' || card.dataset.current === 'true') return;
    const zId = card.dataset.zone;
    if (callbacks.selectZone) callbacks.selectZone(zId);
    else if (typeof window?.setZone === 'function') window.setZone(zId);
    else console.warn('[StageUI] nenhum handler de selectZone registrado');
  };
}

/* ═══════════════════ CSS (injetado 1x no Shadow Root) ═══════════════════ */

const STYLE_ID = 'stage-ui-styles';

function styleTarget() {
  const host = document.getElementById('idle-host');
  return host?.shadowRoot || document.head;
}

export function ensureStageStyles() {
  const root = styleTarget();
  if (!root || root.getElementById?.(STYLE_ID) || root.querySelector?.(`#${STYLE_ID}`)) return;
  const tag = document.createElement('style');
  tag.id = STYLE_ID;
  tag.textContent = STAGE_CSS;
  root.appendChild(tag);
}

const STAGE_CSS = `
/* ═══════════ MAPA DE ZONAS ═══════════ */
.zone-map-root { display:flex; flex-direction:column; gap:16px; }

.saga-map-block { border:1px solid rgba(212,175,55,.18); border-radius:10px;
  background:linear-gradient(180deg,rgba(28,34,48,.72),rgba(16,20,30,.72)); padding:10px 10px 12px; }

.saga-header { display:flex; align-items:center; justify-content:space-between;
  padding:2px 4px 9px; margin-bottom:9px; border-bottom:1px solid rgba(212,175,55,.16); }
.saga-title { font-weight:700; font-size:.86rem; letter-spacing:.04em; color:#e8c37a; }
.saga-req   { font-size:.68rem; color:#8b93a7; border:1px solid rgba(139,147,167,.28);
  border-radius:999px; padding:2px 8px; }

.saga-zones-grid { display:grid; gap:10px;
  grid-template-columns:repeat(auto-fill,minmax(158px,1fr)); }

.zone-card { position:relative; display:flex; flex-direction:column; overflow:hidden;
  border:1px solid rgba(212,175,55,.22); border-radius:9px; background:#131824;
  cursor:pointer; transition:transform .16s, border-color .16s, box-shadow .16s; }
.zone-card:hover:not(.locked):not(.active) { transform:translateY(-3px);
  border-color:rgba(232,195,122,.65); box-shadow:0 6px 18px rgba(0,0,0,.5); }

.zone-card.active { border-color:#e8c37a; box-shadow:0 0 0 1px rgba(232,195,122,.45),0 0 18px rgba(232,195,122,.18); }
.zone-card.locked { opacity:.45; filter:grayscale(.85); cursor:not-allowed; }

.zone-card-thumb { position:relative; height:64px;
  background-color:#0d1018; background-size:cover; background-position:center;
  background-image:linear-gradient(135deg,#232b3d,#12161f); }
.zone-card-thumb::after { content:''; position:absolute; inset:0;
  background:linear-gradient(180deg,transparent 35%,rgba(10,13,20,.92)); }

.zone-flag { position:absolute; top:5px; z-index:2; font-size:.6rem; line-height:1;
  padding:3px 6px; border-radius:999px; background:rgba(8,10,16,.82); }
.zone-flag.town { left:5px; color:#7fd4a8; border:1px solid rgba(127,212,168,.4); }
.zone-flag.lock { right:5px; color:#ff8080; border:1px solid rgba(255,128,128,.4); }
.zone-flag.here { right:5px; color:#0d1018; background:#e8c37a; font-weight:800; }

.zone-card-body { padding:8px; display:flex; flex-direction:column; gap:6px; }
.zone-card-header { display:flex; align-items:baseline; justify-content:space-between; gap:6px; }
.zone-card-title { font-size:.76rem; font-weight:700; color:#e6e9f2; line-height:1.15; }
.zone-card-lvl   { font-size:.62rem; color:#e8c37a; white-space:nowrap; }
.zone-card-desc  { font-size:.62rem; color:#8b93a7; line-height:1.3; }

.select-zone-btn { width:100%; padding:6px 8px; font-size:.66rem; font-weight:700;
  font-family:inherit; letter-spacing:.02em; cursor:pointer; border-radius:6px;
  border:1px solid rgba(212,175,55,.5); color:#e8c37a; background:rgba(212,175,55,.09);
  transition:background .15s,color .15s; }
.select-zone-btn:hover:not(:disabled) { background:#e8c37a; color:#12161f; }
.select-zone-btn:disabled { cursor:default; opacity:.6;
  border-color:rgba(139,147,167,.3); color:#8b93a7; background:transparent; }
.zone-card.active .select-zone-btn { border-color:#e8c37a; color:#e8c37a; background:rgba(232,195,122,.14); opacity:1; }

/* ═══════════ PALCO — SLOTS DE SPRITE (TAMANHO RESTRITO) ═══════════ */

/* Somente os slots ESPECÍFICOS de sprite — nada de wrappers genéricos */
#monster-sprite-container,
.monster-sprite-host,
#stage-hero {
  width: 100%;
  max-width: 220px;
  height: 200px;
  max-height: 220px;
  min-height: 160px;
  margin: 0 auto;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  box-sizing: border-box;
  pointer-events: none;
}

/* Imagens contidas dentro dos slots */
#monster-sprite-container img,
#monster-sprite-container svg,
.monster-sprite-host img,
.monster-sprite-host svg,
#stage-hero img,
#stage-hero svg {
  width: auto;
  height: auto;
  max-width: 180px;
  max-height: 185px;
  object-fit: contain;
  object-position: center bottom;
}

/* Wrapper .mon-svg gerado pelo art.js também precisa ser contido */
#monster-sprite-container .mon-svg,
.monster-sprite-host .mon-svg {
  width: 100% !important;
  height: 100% !important;
  max-width: 200px !important;
  max-height: 200px !important;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

/* Boss / Elite: efeitos de brilho, sem crescer além do slot */
.monster-sprite-host.is-boss,
#monster-sprite-container.is-boss {
  filter: drop-shadow(0 0 12px rgba(255,80,80,.55));
}
.monster-sprite-host.is-elite,
#monster-sprite-container.is-elite {
  filter: drop-shadow(0 0 10px rgba(150,120,255,.5));
}

/* Barra de HP e nome do monstro — nunca comprimir */
#monster-hp-bar { flex-shrink: 0; }
#monster-name { flex-shrink: 0; text-align: center; }
`;
```

### 🔑 O que mudou de verdade:

| Mudança | Motivo |
|---------|--------|
| ❌ **Removidos** `[id*="monster"]` e `[class*="monster"]` do `getMonsterHost()` | Eram eles que capturavam o wrapper gigante que cobre o palco |
| ✅ Se só existir o card `#stage-monster`, o código **cria um slot interno** `.monster-sprite-host` dentro dele | A imagem nunca mais substitui o card inteiro |
| ✅ `lockContainerSize()` aplica **estilos inline** (`max-width: 220px`, `height: 200px`) | Estilo inline vence qualquer CSS do tema — impossível cobrir a tela |
| ✅ Herói também recebe o mesmo lock de tamanho | Mantém os dois frames simétricos como no design original |
| ❌ Removido `createMonsterContainerFallback()` que fazia `root.appendChild()` | Ele podia inserir o container solto por cima do layout |

### 📋 Se ainda não ficar perfeito:

Me envie o **HTML do palco** (a parte do seu `index.html` ou template que contém `stage-hero` e a área do monstro). Com a estrutura real em mãos, eu aponto o ID exato do slot correto — aí eliminamos a heurística de busca de vez e o `getMonsterHost()` vira uma linha só.
