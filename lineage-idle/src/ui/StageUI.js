/**
 * StageUI.js — Palco Principal (Hero vs Monster) e Mapa de Zonas no Lineage Idle.
 */

import { ZONES, SAGAS, ZONE_BACKGROUNDS } from '../data/zones.js';
import { MONSTERS, MONSTER_BY_NAME } from '../data/monsters.js';
import { el, updateBar } from '../core/DomHelpers.js';
import { getClass } from '../engine/StatsEngine.js';
import { heroSVG, monsterSVG } from '../../art.js';

/* ═══════════════════ AUXILIARES DE SHADOW DOM / DOM ═══════════════════ */

function getShadowRoot() {
  return document.getElementById('idle-host')?.shadowRoot ?? document;
}

function findInStage(selector) {
  return getShadowRoot().querySelector(selector);
}

/* ═══════════════════ RESOLUÇÃO DE CHAVES ═══════════════════ */

const _slug = new Map();

export function slugify(name = '') {
  const raw = String(name);
  if (_slug.has(raw)) return _slug.get(raw);
  const out = raw
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(' ')
    .map((p, i) => i === 0
      ? p.toLowerCase()
      : p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join('');
  _slug.set(raw, out);
  return out;
}

export function resolveMonsterKey(m) {
  if (!m) return null;
  const cands = [m.id, m.key, m.monsterId, m.sprite, m.art, m.itemId];

  for (const c of cands) if (c && MONSTERS[c]) return c;
  for (const c of cands) {
    const hit = c && MONSTER_BY_NAME?.[String(c).toLowerCase()];
    if (hit) return hit;
  }
  if (m.name) {
    const byName = MONSTER_BY_NAME?.[m.name.toLowerCase()];
    if (byName) return byName;
    const s = slugify(m.name);
    if (MONSTERS[s]) return s;
    return s;
  }
  return null;
}

/* ═══════════════════ RECUPERAÇÃO DE ESTRUTURA DO CARD ═══════════════════ */

/**
 * Garante que o card do monstro possui Nome, Barra de HP e Slot de Imagem.
 * Se a estrutura original tiver sido apagada, ela é restaurada perfeitamente.
 */
function ensureMonsterCardStructure() {
  const root = getShadowRoot();
  const stageCard = root.querySelector('#stage-monster, .stage-monster');
  if (!stageCard) return null;

  let nameEl = root.querySelector('#monster-name');
  let hpBarEl = root.querySelector('#monster-hp-bar');
  let spriteSlot = root.querySelector('#monster-sprite-container, .monster-sprite-host');

  // Se a estrutura foi destruída em execuções anteriores, reconstrói o HTML interno do card
  if (!nameEl || !hpBarEl || !spriteSlot) {
    stageCard.innerHTML = `
      <div id="monster-name" class="monster-name-label" style="font-weight:bold; color:#e8c37a; text-align:center; margin-bottom:4px;">Monstro</div>
      <div id="monster-hp-bar" class="progress-bar monster-hp-bar" style="width:100%; height:12px; background:#221111; border:1px solid #772222; border-radius:4px; overflow:hidden; position:relative; margin-bottom:8px;">
        <div class="bar-fill" id="monster-hp-fill" style="width:100%; height:100%; background:linear-gradient(90deg, #990000, #ff4444); transition:width 0.2s;"></div>
        <span class="bar-text" id="monster-hp-text" style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:9px; color:#fff; text-shadow:1px 1px 2px #000;">100%</span>
      </div>
      <div id="monster-sprite-container" class="monster-sprite-host" style="width:100%; flex:1; min-height:140px; display:flex; align-items:center; justify-content:center; position:relative;"></div>
    `;
    spriteSlot = stageCard.querySelector('#monster-sprite-container');
  }

  return spriteSlot;
}

/* ═══════════════════ HERÓI ═══════════════════ */

export function renderStageHero(state) {
  ensureStageStyles();
  const nameEl = findInStage('#hero-name') || el('hero-name');
  if (nameEl) {
    const cls = getClass(state.class);
    nameEl.textContent = `${cls?.name ?? state.class ?? 'Aventureiro'} (Lv. ${state.level})`;
  }

  const box = findInStage('#stage-hero') || el('stage-hero');
  if (box) {
    box.innerHTML = heroSVG(state.race || 'human', state.class || 'fighter');
  }

  updateBar('hero-hp-bar', state.hp, state.maxHp, 'hero-hp-text');
  updateBar('hero-mp-bar', state.mp, state.maxMp, 'hero-mp-text');
}

/* ═══════════════════ MONSTRO ═══════════════════ */

export function renderStageMonster(state) {
  ensureStageStyles();

  const spriteSlot = ensureMonsterCardStructure();
  const m = state?.activeMonster;

  if (!spriteSlot) return;

  if (!m) {
    spriteSlot.innerHTML = '';
    return;
  }

  const key     = resolveMonsterKey(m);
  const isBoss  = !!(m.boss || m.isTower);
  const isElite = !!(m.elite || m.isElite);

  // 1. Atualizar Nome do Monstro
  const nameEl = findInStage('#monster-name') || el('monster-name');
  if (nameEl) {
    const tag = isBoss ? '👑 CHEFÃO' : (isElite ? '⚡ ÉLITE' : '');
    const lvl = m.level ?? m.lvl ?? ZONES[state.zone]?.level ?? 1;
    nameEl.textContent = `${tag ? tag + ' · ' : ''}${m.name} (Nv. ${lvl})`;
  }

  // 2. Atualizar Barra de Vida (HP)
  const maxHp = m._maxHp ?? m.maxHp ?? MONSTERS[key]?.hp ?? m.hp ?? 1;
  updateBar('monster-hp-bar', m.hp, maxHp, 'monster-hp-text');

  // 3. Renderizar Imagem SVG/PNG no Slot Dedicado
  spriteSlot.classList.toggle('is-boss', isBoss);
  spriteSlot.classList.toggle('is-elite', isElite && !isBoss);

  try {
    spriteSlot.innerHTML = monsterSVG(key, { crown: isBoss });
  } catch (e) {
    console.error('[StageUI] Erro ao renderizar arte do monstro:', key, e);
  }
}

/* ═══════════════════ ZONAS DE CAÇA ═══════════════════ */

export function updateZoneUI(state, callbacks = {}) {
  const z = ZONES[state.zone];
  const nameEl = findInStage('#zone-name') || el('zone-name');
  if (nameEl && z) nameEl.textContent = z.name;
  renderZoneMap(state, callbacks);
}

function maxVisibleSaga(state) {
  const byLevel = SAGAS.reduce(
    (acc, s, i) => ((state.level ?? 1) >= s.unlocksAt ? i : acc), 0);
  return Math.max(state.currentSaga ?? 0, byLevel);
}

export function renderZoneMap(state, callbacks = {}) {
  const container = findInStage('#zone-map-container') || findInStage('#zone-list') || el('zone-list');
  if (!container) return;

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
      if (!z) continue;

      const current = state.zone === zId;
      const locked  = (state.level ?? 1) < z.level;
      const thumb   = ZONE_BACKGROUNDS[zId] || '';
      const mobs    = z.monsters?.length ?? 0;
      const bossNm  = MONSTERS[z.boss]?.name ?? null;

      cards += `
        <div class="zone-card${current ? ' active' : ''}${locked ? ' locked' : ''}"
             data-zone="${zId}" data-locked="${locked}" data-current="${current}">
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
  };
}

/* ═══════════════════ INJEÇÃO DE CSS ═══════════════════ */

const STYLE_ID = 'stage-ui-styles';

export function ensureStageStyles() {
  const root = getShadowRoot();
  if (!root || root.querySelector?.(`#${STYLE_ID}`)) return;
  const tag = document.createElement('style');
  tag.id = STYLE_ID;
  tag.textContent = STAGE_CSS;
  (root.head || root).appendChild(tag);
}

const STAGE_CSS = `
#stage-monster {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: space-between !important;
  position: relative !important;
  box-sizing: border-box !important;
  padding: 8px !important;
  min-height: 200px !important;
}

#monster-sprite-container, .monster-sprite-host {
  width: 100% !important;
  height: 100% !important;
  min-height: 140px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  position: relative !important;
}

#monster-sprite-container .mon-svg,
#monster-sprite-container img {
  width: 100% !important;
  height: 100% !important;
  max-height: 180px !important;
  object-fit: contain !important;
  object-position: center bottom !important;
}

.zone-map-root { display:flex; flex-direction:column; gap:16px; }
.saga-map-block { border:1px solid rgba(212,175,55,.18); border-radius:10px; background:linear-gradient(180deg,rgba(28,34,48,.72),rgba(16,20,30,.72)); padding:10px 10px 12px; }
.saga-header { display:flex; align-items:center; justify-content:space-between; padding:2px 4px 9px; margin-bottom:9px; border-bottom:1px solid rgba(212,175,55,.16); }
.saga-title { font-weight:700; font-size:.86rem; letter-spacing:.04em; color:#e8c37a; }
.saga-req { font-size:.68rem; color:#8b93a7; border:1px solid rgba(139,147,167,.28); border-radius:999px; padding:2px 8px; }
.saga-zones-grid { display:grid; gap:10px; grid-template-columns:repeat(auto-fill,minmax(158px,1fr)); }
.zone-card { position:relative; display:flex; flex-direction:column; overflow:hidden; border:1px solid rgba(212,175,55,.22); border-radius:999px; border-radius:9px; background:#131824; cursor:pointer; }
.zone-card.active { border-color:#e8c37a; box-shadow:0 0 12px rgba(232,195,122,.2); }
.zone-card.locked { opacity:.45; filter:grayscale(.85); cursor:not-allowed; }
.zone-card-thumb { position:relative; height:64px; background-size:cover; background-position:center; background-color:#0d1018; }
.zone-card-body { padding:8px; display:flex; flex-direction:column; gap:6px; }
.zone-card-title { font-size:.76rem; font-weight:700; color:#e6e9f2; }
.zone-card-lvl { font-size:.62rem; color:#e8c37a; }
.zone-card-desc { font-size:.62rem; color:#8b93a7; }
.select-zone-btn { width:100%; padding:6px; font-size:.66rem; font-weight:700; border-radius:6px; border:1px solid rgba(212,175,55,.5); color:#e8c37a; background:rgba(212,175,55,.09); cursor:pointer; }
.select-zone-btn:disabled { opacity:.5; cursor:default; border-color:rgba(139,147,167,.3); color:#8b93a7; background:transparent; }
`;
