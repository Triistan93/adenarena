/**
 * StageUI.js — Palco Principal (Hero vs Monster) e Mapa de Zonas.
 * Layout lado a lado: Herói (esq.) | Monstro (dir.)
 */

import { ZONES, SAGAS, ZONE_BACKGROUNDS } from '../data/zones.js';
import { MONSTERS, MONSTER_BY_NAME } from '../data/monsters.js';
import { el, updateBar } from '../core/DomHelpers.js';
import { getClass } from '../engine/StatsEngine.js';
import { heroSVG, monsterSVG, MON_IMG } from '../../art.js';

/* ═══════════════════ DOM ROOT ═══════════════════ */

function root() {
  return document.getElementById('idle-host')?.shadowRoot || document;
}

function qs(sel) {
  return root().querySelector(sel);
}

function qid(id) {
  return root().querySelector('#' + id) || document.getElementById(id);
}

/* ═══════════════════ LAYOUT DO PALCO (Hero | Monster) ═══════════════════ */

/**
 * Garante a estrutura:
 *   #stage-fighters
 *     #stage-hero
 *     #stage-monster
 *       #monster-name
 *       #monster-hp-bar (+ fill/text)
 *       #monster-sprite-container   ← só a arte vai aqui
 */
function ensureStageLayout() {
  ensureStageStyles();

  let hero = qid('stage-hero');
  let mon  = qid('stage-monster');

  // Se ambos existem e são irmãos, só garante o slot interno do monstro
  if (hero && mon) {
    ensureMonsterInternals(mon);
    // Garante wrapper flex se ainda não houver
    const parent = hero.parentElement;
    if (parent && !parent.classList.contains('stage-fighters') && parent.id !== 'stage-fighters') {
      // Se o pai já é o palco, marca como fighters
      if (parent.children.length >= 2) {
        parent.classList.add('stage-fighters');
        if (!parent.id) parent.id = 'stage-fighters';
      }
    }
    return { hero, mon, sprite: qid('monster-sprite-container') };
  }

  // Tenta achar o palco visual
  const stage =
    qs('#stage') ||
    qs('#main-stage') ||
    qs('.stage') ||
    qs('.combat-stage') ||
    qs('#battle-stage') ||
    qs('.battle-area') ||
    (hero && hero.parentElement) ||
    (mon && mon.parentElement);

  if (!stage) {
    console.error('[StageUI] Palco não encontrado (#stage / .stage).');
    return null;
  }

  // Wrapper dos lutadores
  let fighters = qid('stage-fighters') || stage.querySelector('.stage-fighters');
  if (!fighters) {
    fighters = document.createElement('div');
    fighters.id = 'stage-fighters';
    fighters.className = 'stage-fighters';

    // Move hero/mon existentes para dentro, se houver
    if (hero) fighters.appendChild(hero);
    if (mon) fighters.appendChild(mon);

    // Insere no topo do palco (antes do log, se houver)
    stage.insertBefore(fighters, stage.firstChild);
  }

  if (!hero) {
    hero = document.createElement('div');
    hero.id = 'stage-hero';
    hero.className = 'stage-card stage-hero';
    fighters.appendChild(hero);
  }

  if (!mon) {
    mon = document.createElement('div');
    mon.id = 'stage-monster';
    mon.className = 'stage-card stage-monster';
    fighters.appendChild(mon);
  }

  // Garante ordem: herói à esquerda, monstro à direita
  if (hero.nextElementSibling !== mon) {
    fighters.appendChild(hero);
    fighters.appendChild(mon);
  }

  ensureMonsterInternals(mon);
  return { hero, mon, sprite: qid('monster-sprite-container') };
}

function ensureMonsterInternals(monCard) {
  if (!monCard) return null;

  let nameEl = monCard.querySelector('#monster-name') || qid('monster-name');
  let hpBar  = monCard.querySelector('#monster-hp-bar') || qid('monster-hp-bar');
  let sprite = monCard.querySelector('#monster-sprite-container');

  // Se o sprite slot não está DENTRO do card do monstro, recria a estrutura interna
  // (sem apagar se já estiver correta)
  if (!sprite || !monCard.contains(sprite) || !nameEl || !hpBar) {
    // Preserva arte atual se existir
    const oldArt = sprite?.innerHTML || '';

    monCard.innerHTML = `
      <div id="monster-name" class="stage-entity-name">—</div>
      <div id="monster-hp-bar" class="stage-hp-bar" role="progressbar">
        <div id="monster-hp-fill" class="stage-hp-fill"></div>
        <span id="monster-hp-text" class="stage-hp-text">0 / 0</span>
      </div>
      <div id="monster-sprite-container" class="monster-sprite-host"></div>
    `;
    sprite = monCard.querySelector('#monster-sprite-container');
    if (oldArt) sprite.innerHTML = oldArt;
  }

  return sprite;
}

/* ═══════════════════ CHAVE DO MONSTRO ═══════════════════ */

export function resolveMonsterKey(m) {
  if (!m) return 'goblin';

  const candidates = [m.id, m.key, m.monsterId, m.sprite, m.itemId, m.name];
  for (const raw of candidates) {
    if (!raw) continue;
    const s = String(raw).trim();
    const noSpace = s.replace(/\s+/g, '');
    const lower = noSpace.toLowerCase();
    const camel = lower.charAt(0).toLowerCase() + noSpace.slice(1);

    // MON_IMG direto
    if (MON_IMG) {
      for (const k of [s, noSpace, lower, camel, `mon_${lower}`]) {
        if (MON_IMG[k]) return k;
      }
    }
    // MONSTERS dict
    if (MONSTERS[s]) return s;
    if (MONSTERS[noSpace]) return noSpace;
    if (MONSTERS[lower]) return lower;
    if (MONSTER_BY_NAME) {
      const hit = MONSTER_BY_NAME[s.toLowerCase()] || MONSTER_BY_NAME[lower];
      if (hit) return hit;
    }
  }

  // slug "Goblin Mage" -> "goblinMage"
  if (m.name) {
    const parts = String(m.name).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/);
    const slug = parts.map((p, i) => i === 0 ? p.toLowerCase() : p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join('');
    if (MONSTERS[slug]) return slug;
    if (MON_IMG?.[slug]) return slug;
    if (MON_IMG?.[slug.toLowerCase()]) return slug.toLowerCase();
    return slug;
  }
  return 'goblin';
}

/* ═══════════════════ RENDER: MONSTRO ═══════════════════ */

export function renderStageMonster(state) {
  const layout = ensureStageLayout();
  if (!layout?.sprite) {
    console.error('[StageUI] Sem slot de sprite do monstro');
    return;
  }

  const { mon, sprite } = layout;
  const m = state?.activeMonster;

  if (!m) {
    sprite.innerHTML = '';
    const nameEl = qid('monster-name');
    if (nameEl) nameEl.textContent = '—';
    updateBar('monster-hp-bar', 0, 1, 'monster-hp-text');
    mon?.classList.remove('is-boss', 'is-elite');
    return;
  }

  const key = resolveMonsterKey(m);
  const isBoss  = !!(m.boss || m.isTower);
  const isElite = !!(m.elite || m.isElite);

  // Nome
  const nameEl = qid('monster-name');
  if (nameEl) {
    const tag = isBoss ? '👑 ' : (isElite ? '⚡ ' : '');
    const lvl = m.level ?? m.lvl ?? ZONES[state.zone]?.level ?? 1;
    nameEl.textContent = `${tag}${m.name} (Nv. ${lvl})`;
  }

  // HP
  const maxHp = m._maxHp ?? m.maxHp ?? MONSTERS[key]?.hp ?? m.hp ?? 1;
  const hp = Math.max(0, m.hp ?? 0);
  updateBar('monster-hp-bar', hp, maxHp, 'monster-hp-text');

  // fallback manual da barra (caso updateBar use fill interno)
  const fill = qid('monster-hp-fill');
  if (fill) {
    const pct = Math.max(0, Math.min(100, (hp / maxHp) * 100));
    fill.style.width = pct + '%';
  }

  mon.classList.toggle('is-boss', isBoss);
  mon.classList.toggle('is-elite', isElite && !isBoss);
  sprite.classList.toggle('is-boss', isBoss);
  sprite.classList.toggle('is-elite', isElite && !isBoss);

  // Arte SOMENTE no slot interno
  let html = '';
  try {
    html = monsterSVG(key, { crown: isBoss, elite: isElite }) || '';
  } catch (e) {
    console.error('[StageUI] monsterSVG error:', key, e);
  }
  sprite.innerHTML = html || placeholderMonster(m.name || key, isBoss);
}

function placeholderMonster(label, isBoss) {
  return `
    <div class="mon-placeholder" title="${label}">
      <div class="mon-placeholder-icon">${isBoss ? '👑' : '👹'}</div>
      <div class="mon-placeholder-name">${label}</div>
    </div>`;
}

/* ═══════════════════ RENDER: HERÓI ═══════════════════ */

export function renderStageHero(state) {
  const layout = ensureStageLayout();
  const box = layout?.hero || qid('stage-hero') || el('stage-hero');

  const nameEl = qid('hero-name') || el('hero-name');
  if (nameEl) {
    const cls = getClass(state.class);
    nameEl.textContent = `${cls?.name ?? state.class ?? 'Aventureiro'} (Lv. ${state.level})`;
  }

  if (box) {
    try {
      box.innerHTML = heroSVG(state.race || 'human', state.class || 'fighter');
    } catch (e) {
      console.error('[StageUI] heroSVG error', e);
    }
  }

  updateBar('hero-hp-bar', state.hp, state.maxHp, 'hero-hp-text');
  updateBar('hero-mp-bar', state.mp, state.maxMp, 'hero-mp-text');
}

/* ═══════════════════ ZONAS ═══════════════════ */

export function updateZoneUI(state, callbacks = {}) {
  const z = ZONES[state.zone];
  const nameEl = qid('zone-name') || el('zone-name');
  if (nameEl && z) nameEl.textContent = z.name;
  renderZoneMap(state, callbacks);
}

function maxVisibleSaga(state) {
  const byLevel = SAGAS.reduce(
    (acc, s, i) => ((state.level ?? 1) >= s.unlocksAt ? i : acc), 0);
  return Math.max(state.currentSaga ?? 0, byLevel);
}

export function renderZoneMap(state, callbacks = {}) {
  const container = qid('zone-map-container') || qid('zone-list') || el('zone-map-container') || el('zone-list');
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
  };
}

/* ═══════════════════ CSS ═══════════════════ */

const STYLE_ID = 'stage-ui-styles';

export function ensureStageStyles() {
  const host = document.getElementById('idle-host');
  const target = host?.shadowRoot || document.head;
  if (!target) return;
  if (target.querySelector?.('#' + STYLE_ID)) return;

  const tag = document.createElement('style');
  tag.id = STYLE_ID;
  tag.textContent = STAGE_CSS;
  target.appendChild(tag);
}

const STAGE_CSS = `
/* ═══════════════ FIGHTERS: Herói | Monstro ═══════════════ */
#stage-fighters,
.stage-fighters {
  display: grid !important;
  grid-template-columns: 1fr 1fr !important;
  gap: 12px !important;
  align-items: stretch !important;
  width: 100% !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
  padding: 8px !important;
  pointer-events: none !important;
}

/* Cada card ocupa SÓ a sua coluna */
#stage-hero,
#stage-monster,
.stage-card {
  position: relative !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: flex-end !important;
  width: auto !important;           /* NÃO 100% do palco inteiro */
  max-width: 100% !important;
  min-width: 0 !important;          /* evita overflow no grid */
  height: 240px !important;
  max-height: 260px !important;
  box-sizing: border-box !important;
  overflow: hidden !important;
  pointer-events: none !important;
}

/* Slot da arte do monstro — interno ao card */
#monster-sprite-container,
.monster-sprite-host {
  position: relative !important;
  display: flex !important;
  align-items: flex-end !important;
  justify-content: center !important;
  width: 100% !important;
  flex: 1 1 auto !important;
  min-height: 140px !important;
  max-height: 180px !important;
  overflow: hidden !important;
}

/* Imagens contidas DENTRO do card */
#stage-hero img,
#stage-hero svg,
#stage-hero .hero-svg,
#stage-hero .hero-full,
#monster-sprite-container img,
#monster-sprite-container svg,
#monster-sprite-container .mon-svg,
.monster-sprite-host img,
.monster-sprite-host svg {
  width: auto !important;
  height: auto !important;
  max-width: min(160px, 100%) !important;
  max-height: 170px !important;
  object-fit: contain !important;
  object-position: center bottom !important;
  display: block !important;
  margin: 0 auto !important;
  flex-shrink: 1 !important;
}

/* Boss um pouco maior, ainda dentro do card */
#stage-monster.is-boss #monster-sprite-container img,
#stage-monster.is-boss #monster-sprite-container svg,
#monster-sprite-container.is-boss img,
#monster-sprite-container.is-boss svg {
  max-width: min(180px, 100%) !important;
  max-height: 190px !important;
}

#stage-monster.is-boss {
  filter: drop-shadow(0 0 10px rgba(255, 80, 80, 0.45));
}
#stage-monster.is-elite {
  filter: drop-shadow(0 0 8px rgba(150, 120, 255, 0.4));
}

/* Nome + HP do monstro (dentro do card) */
#monster-name,
.stage-entity-name {
  flex: 0 0 auto !important;
  width: 100% !important;
  text-align: center !important;
  font-size: 12px !important;
  font-weight: 700 !important;
  color: #e8c37a !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  padding: 2px 6px !important;
  box-sizing: border-box !important;
}

#monster-hp-bar,
.stage-hp-bar {
  position: relative !important;
  flex: 0 0 auto !important;
  width: calc(100% - 16px) !important;
  height: 12px !important;
  margin: 2px 8px 6px !important;
  background: #2a1515 !important;
  border: 1px solid #7a3030 !important;
  border-radius: 4px !important;
  overflow: hidden !important;
}

#monster-hp-fill,
.stage-hp-fill {
  position: absolute !important;
  left: 0; top: 0; bottom: 0;
  width: 100%;
  background: linear-gradient(90deg, #8b0000, #e11d48) !important;
  transition: width 0.15s ease-out !important;
}

#monster-hp-text,
.stage-hp-text {
  position: absolute !important;
  inset: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 9px !important;
  color: #fff !important;
  text-shadow: 0 1px 2px #000 !important;
  z-index: 1 !important;
}

.mon-placeholder {
  width: 140px; height: 160px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 6px; border-radius: 10px;
  background: repeating-linear-gradient(45deg,#1f2937,#1f2937 10px,#374151 10px,#374151 20px);
  border: 2px dashed #f59e0b; color: #fff;
}
.mon-placeholder-icon { font-size: 42px; }
.mon-placeholder-name { font-size: 12px; color: #fbbf24; text-align: center; padding: 0 6px; }

/* ═══════════════ MAPA DE ZONAS ═══════════════ */
.zone-map-root { display:flex; flex-direction:column; gap:16px; }
.saga-map-block { border:1px solid rgba(212,175,55,.18); border-radius:10px;
  background:linear-gradient(180deg,rgba(28,34,48,.72),rgba(16,20,30,.72)); padding:10px 10px 12px; }
.saga-header { display:flex; align-items:center; justify-content:space-between;
  padding:2px 4px 9px; margin-bottom:9px; border-bottom:1px solid rgba(212,175,55,.16); }
.saga-title { font-weight:700; font-size:.86rem; letter-spacing:.04em; color:#e8c37a; }
.saga-req { font-size:.68rem; color:#8b93a7; border:1px solid rgba(139,147,167,.28);
  border-radius:999px; padding:2px 8px; }
.saga-zones-grid { display:grid; gap:10px; grid-template-columns:repeat(auto-fill,minmax(158px,1fr)); }
.zone-card { position:relative; display:flex; flex-direction:column; overflow:hidden;
  border:1px solid rgba(212,175,55,.22); border-radius:9px; background:#131824;
  cursor:pointer; transition:transform .16s, border-color .16s, box-shadow .16s; }
.zone-card:hover:not(.locked):not(.active) { transform:translateY(-3px);
  border-color:rgba(232,195,122,.65); box-shadow:0 6px 18px rgba(0,0,0,.5); }
.zone-card.active { border-color:#e8c37a; box-shadow:0 0 0 1px rgba(232,195,122,.45),0 0 18px rgba(232,195,122,.18); }
.zone-card.locked { opacity:.45; filter:grayscale(.85); cursor:not-allowed; }
.zone-card-thumb { position:relative; height:64px; background-color:#0d1018; background-size:cover; background-position:center;
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
.zone-card-lvl { font-size:.62rem; color:#e8c37a; white-space:nowrap; }
.zone-card-desc { font-size:.62rem; color:#8b93a7; line-height:1.3; }
.select-zone-btn { width:100%; padding:6px 8px; font-size:.66rem; font-weight:700;
  font-family:inherit; letter-spacing:.02em; cursor:pointer; border-radius:6px;
  border:1px solid rgba(212,175,55,.5); color:#e8c37a; background:rgba(212,175,55,.09);
  transition:background .15s,color .15s; }
.select-zone-btn:hover:not(:disabled) { background:#e8c37a; color:#12161f; }
.select-zone-btn:disabled { cursor:default; opacity:.6;
  border-color:rgba(139,147,167,.3); color:#8b93a7; background:transparent; }
.zone-card.active .select-zone-btn { border-color:#e8c37a; color:#e8c37a; background:rgba(232,195,122,.14); opacity:1; }
`;
