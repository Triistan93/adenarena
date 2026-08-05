/**
 * StageUI.js — Palco Principal (Hero vs Monster) e Mapa de Zonas.
 */

import { ZONES, SAGAS, ZONE_BACKGROUNDS } from '../data/zones.js';
import { MONSTERS, MONSTER_BY_NAME } from '../data/monsters.js';
import { el, updateBar } from '../core/DomHelpers.js';
import { getClass } from '../engine/StatsEngine.js';
import { heroSVG, monsterSVG } from '../../art.js';

/* ═══════════════════ RESOLUÇÃO DE CHAVES ═══════════════════ */

const _slug = new Map();

/** 'Goblin Mage' → 'goblinMage' */
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

/** Descobre a chave canônica do monstro, venha de onde vier. */
export function resolveMonsterKey(m) {
  if (!m) return null;
  const cands = [m.id, m.key, m.monsterId, m.sprite, m.art, m.itemId];

  for (const c of cands) if (c && MONSTERS[c]) return c;                       // hit direto
  for (const c of cands) {                                                     // por nome
    const hit = c && MONSTER_BY_NAME?.[String(c).toLowerCase()];
    if (hit) return hit;
  }
  if (m.name) {
    const byName = MONSTER_BY_NAME?.[m.name.toLowerCase()];
    if (byName) return byName;
    const s = slugify(m.name);
    if (MONSTERS[s]) return s;
    return s; // devolve o slug mesmo assim — art.js pode ter chave própria
  }
  return null;
}

/* ═══════════════════ ARTE SEGURA (nunca falha em silêncio) ═══════════════════ */

function placeholderArt(label = '?') {
  const L = String(label || '?').charAt(0).toUpperCase();
  const uid = 'ph' + Math.random().toString(36).slice(2, 7);
  return `<svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
    <defs><linearGradient id="${uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3a2a3f"/><stop offset="1" stop-color="#161020"/>
    </linearGradient></defs>
    <rect width="100" height="100" rx="10" fill="url(#${uid})"/>
    <circle cx="50" cy="42" r="21" fill="#4c3557" stroke="#8b6bd6" stroke-width="1.5"/>
    <circle cx="42" cy="40" r="3.6" fill="#ff6b6b"/><circle cx="58" cy="40" r="3.6" fill="#ff6b6b"/>
    <path d="M39 57 Q50 66 61 57" stroke="#8b6bd6" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <text x="50" y="88" text-anchor="middle" font-size="11"
          fill="#c9a227" font-family="monospace">${L}</text>
  </svg>`;
}

function safeArt(fn, key, opts, label) {
  let html = '';
  try { html = fn(key, opts) || ''; }
  catch (e) { console.error('[StageUI] arte falhou:', key, e); }
  if (!html.trim()) {
    console.warn(`[StageUI] ⚠️ Sem arte para "${key}" — usando placeholder.`);
    return placeholderArt(label ?? key);
  }
  return html;
}

/* ═══════════════════ HERÓI ═══════════════════ */

export function renderStageHero(state) {
  const nameEl = el('hero-name');
  if (nameEl) {
    const cls = getClass(state.class);
    nameEl.textContent = `${cls?.name ?? state.class ?? 'Aventureiro'} (Lv. ${state.level})`;
  }

  const box = el('stage-hero');
  if (box) {
    box.innerHTML = safeArt(
      heroSVG,
      state.race || 'human',
      state.class || 'fighter',
      state.race
    );
  }

  updateBar('hero-hp-bar', state.hp, state.maxHp, 'hero-hp-text');
  updateBar('hero-mp-bar', state.mp, state.maxMp, 'hero-mp-text');
}

/* ═══════════════════ MONSTRO ═══════════════════ */

export function renderStageMonster(state) {
  const m = state.activeMonster;
  const box = el('monster-sprite-container');

  if (!m) { if (box) box.innerHTML = ''; return; }

  const key   = resolveMonsterKey(m);
  const isBoss = !!(m.boss || m.isTower);
  const isElite = !!(m.elite || m.isElite);

  const nameEl = el('monster-name');
  if (nameEl) {
    const tag = isBoss ? '👑 CHEFÃO' : (isElite ? '⚡ ÉLITE' : '');
    const lvl = m.level ?? m.lvl ?? ZONES[state.zone]?.level ?? 1;
    nameEl.textContent = `${tag ? tag + ' · ' : ''}${m.name} (Nv. ${lvl})`;
  }

  // _maxHp precisa existir; senão a barra fica travada em 100%
  const maxHp = m._maxHp ?? m.maxHp ?? MONSTERS[key]?.hp ?? m.hp ?? 1;
  updateBar('monster-hp-bar', m.hp, maxHp, 'monster-hp-text');

  if (box) {
    box.classList.toggle('is-boss', isBoss);
    box.classList.toggle('is-elite', isElite && !isBoss);
    box.innerHTML = safeArt(monsterSVG, key, { crown: isBoss }, m.name);
  }
}

/* ═══════════════════ ZONAS ═══════════════════ */

export function updateZoneUI(state, callbacks = {}) {
  const z = ZONES[state.zone];
  const nameEl = el('zone-name');
  if (nameEl && z) nameEl.textContent = z.name;
  renderZoneMap(state, callbacks);
}

/** Última saga visível: respeita currentSaga OU o nível do jogador. */
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

  // Delegação de evento: 1 listener, respeita locked/current
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

#monster-sprite-container { display:flex; align-items:center; justify-content:center; }
#monster-sprite-container svg { width:100%; height:100%; }
#monster-sprite-container.is-boss  { filter:drop-shadow(0 0 12px rgba(255,80,80,.55)); }
#monster-sprite-container.is-elite { filter:drop-shadow(0 0 10px rgba(150,120,255,.5)); }
`;
