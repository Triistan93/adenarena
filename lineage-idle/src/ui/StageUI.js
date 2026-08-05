/**
 * StageUI.js — Palco Principal (Hero vs Monster) e Mapa de Zonas.
 *
 * Layout real do projeto (confirmado via DevTools):
 *   #stage
 *     #stage-bg-a / #stage-bg-b
 *     #stage-hero          (filho direto, lado ESQUERDO)
 *     #stage-monster       (filho direto, lado DIREITO)
 *       #monster-name
 *       #monster-hp-bar
 *       #monster-sprite-container
 */

import { ZONES, SAGAS, ZONE_BACKGROUNDS } from '../data/zones.js';
import { MONSTERS, MONSTER_BY_NAME } from '../data/monsters.js';
import { el, updateBar } from '../core/DomHelpers.js';
import { getClass } from '../engine/StatsEngine.js';
import { heroSVG, monsterSVG, MON_IMG } from '../../art.js';

/* ═══════════════════ DOM ═══════════════════ */

function root() {
  return document.getElementById('idle-host')?.shadowRoot || document;
}

function qid(id) {
  return root().querySelector('#' + id);
}

function qs(sel) {
  return root().querySelector(sel);
}

/* ═══════════════════ ESTRUTURA DO CARD DO MONSTRO ═══════════════════ */

/**
 * Garante nome + HP + slot de sprite DENTRO de #stage-monster.
 * Nunca usa #stage-monster como se fosse só a imagem.
 */
function ensureMonsterInternals() {
  const mon = qid('stage-monster');
  if (!mon) {
    console.error('[StageUI] #stage-monster não existe no DOM');
    return null;
  }

  let sprite = mon.querySelector('#monster-sprite-container');
  let nameEl = mon.querySelector('#monster-name');
  let hpBar  = mon.querySelector('#monster-hp-bar');

  // Se a estrutura interna sumiu, reconstrói só o miolo (mantém o #stage-monster)
  if (!sprite || !nameEl || !hpBar) {
    const oldArt = sprite?.innerHTML || '';
    mon.innerHTML = `
      <div id="monster-name" class="stage-entity-name">—</div>
      <div id="monster-hp-bar" class="stage-hp-bar">
        <div id="monster-hp-fill" class="stage-hp-fill"></div>
        <span id="monster-hp-text" class="stage-hp-text">0 / 0</span>
      </div>
      <div id="monster-sprite-container" class="monster-sprite-host"></div>
    `;
    sprite = mon.querySelector('#monster-sprite-container');
    if (oldArt) sprite.innerHTML = oldArt;
  }

  return { mon, sprite: mon.querySelector('#monster-sprite-container') };
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

    if (MON_IMG) {
      for (const k of [s, noSpace, lower, `mon_${lower}`]) {
        if (MON_IMG[k]) return k;
      }
    }
    if (MONSTERS?.[s]) return s;
    if (MONSTERS?.[noSpace]) return noSpace;
    if (MONSTERS?.[lower]) return lower;
    if (MONSTER_BY_NAME) {
      const hit = MONSTER_BY_NAME[s.toLowerCase()] || MONSTER_BY_NAME[lower];
      if (hit) return hit;
    }
  }

  if (m.name) {
    const parts = String(m.name)
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/);
    const slug = parts
      .map((p, i) => i === 0 ? p.toLowerCase() : p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
      .join('');
    if (MONSTERS?.[slug]) return slug;
    if (MON_IMG?.[slug]) return slug;
    if (MON_IMG?.[slug.toLowerCase()]) return slug.toLowerCase();
    return slug;
  }
  return 'goblin';
}

/* ═══════════════════ RENDER MONSTRO ═══════════════════ */
/* ═══════════════════ HP DO MONSTRO ═══════════════════ */

/**
 * Retorna o primeiro número positivo encontrado.
 * Diferente de ??, ignora valores 0 quando usados como HP máximo.
 */
function firstPositive(...values) {
  for (const value of values) {
    const number = Number(value);

    if (Number.isFinite(number) && number > 0) {
      return number;
    }
  }

  return null;
}

/**
 * Retorna o primeiro número válido maior ou igual a zero.
 * Zero é válido para o HP atual.
 */
function firstNonNegative(...values) {
  for (const value of values) {
    const number = Number(value);

    if (Number.isFinite(number) && number >= 0) {
      return number;
    }
  }

  return null;
}

function getMonsterDefinition(monster, monsterKey) {
  const candidates = [
    monsterKey,
    String(monsterKey || '').replace(/^mon_/i, ''),
    monster?.id,
    monster?.key,
    monster?.monsterId
  ];

  for (const candidate of candidates) {
    if (candidate && MONSTERS[candidate]) {
      return MONSTERS[candidate];
    }
  }

  return null;
}

/**
 * Resolve o HP atual e o HP máximo aceitando os nomes mais comuns
 * usados pelo engine:
 *
 * hp, currentHp, currentHP, maxHp, maxHP, _maxHp etc.
 */
function getMonsterHpData(monster, monsterKey) {
  const definition = getMonsterDefinition(monster, monsterKey);

  const maxHp =
    firstPositive(
      monster?._maxHp,
      monster?._maxHP,
      monster?.maxHp,
      monster?.maxHP,
      monster?.hpMax,
      monster?.maxHealth,
      monster?.healthMax,
      monster?.stats?.maxHp,
      monster?.stats?.maxHP,
      definition?.hp,
      monster?.hp
    ) || 1;

  const currentHpRaw =
    firstNonNegative(
      monster?.currentHp,
      monster?.currentHP,
      monster?.hpCurrent,
      monster?._currentHp,
      monster?._currentHP,
      monster?.currentHealth,
      monster?.health,
      monster?.stats?.hp,
      monster?.hp
    );

  // Se o monstro ainda não recebeu HP atual, inicia cheio.
  const currentHp = currentHpRaw === null
    ? maxHp
    : Math.min(maxHp, Math.max(0, currentHpRaw));

  return {
    currentHp,
    maxHp,
    definition
  };
}

/**
 * Garante que a barra possui:
 *
 * #monster-hp-bar
 * ├── #monster-hp-fill
 * └── #monster-hp-text
 */
function ensureMonsterHpElements(monsterCard) {
  if (!monsterCard) return null;

  const documentRoot =
    document.getElementById('idle-host')?.shadowRoot || document;

  let bar = monsterCard.querySelector('#monster-hp-bar');

  if (!bar) {
    bar = documentRoot.querySelector('#monster-hp-bar');
  }

  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'monster-hp-bar';
    bar.className = 'stage-hp-bar';

    const sprite = monsterCard.querySelector('#monster-sprite-container');

    if (sprite) {
      monsterCard.insertBefore(bar, sprite);
    } else {
      monsterCard.appendChild(bar);
    }
  }

  let fill = bar.querySelector('#monster-hp-fill');

  if (!fill) {
    fill = document.createElement('div');
    fill.id = 'monster-hp-fill';
    fill.className = 'stage-hp-fill';
    bar.appendChild(fill);
  }

  let text = bar.querySelector('#monster-hp-text');

  if (!text) {
    text = monsterCard.querySelector('#monster-hp-text');
  }

  if (!text) {
    text = document.createElement('span');
    text.id = 'monster-hp-text';
    text.className = 'stage-hp-text';
    bar.appendChild(text);
  }

  return { bar, fill, text };
}

/**
 * Atualiza a barra sem alterar a largura do container externo.
 */
function updateMonsterHPBar(monster, monsterKey, monsterCard) {
  const hpData = getMonsterHpData(monster, monsterKey);
  const elements = ensureMonsterHpElements(monsterCard);

  if (!elements) return hpData;

  const { bar, fill, text } = elements;
  const percentage = Math.max(
    0,
    Math.min(100, (hpData.currentHp / hpData.maxHp) * 100)
  );

  // A barra externa sempre ocupa todo o card.
  bar.style.setProperty('width', '100%', 'important');
  bar.style.height = '10px';
  bar.style.position = 'relative';
  bar.style.overflow = 'hidden';

  // Somente o preenchimento varia.
  fill.style.setProperty('width', `${percentage}%`, 'important');
  fill.style.height = '100%';
  fill.style.position = 'absolute';
  fill.style.left = '0';
  fill.style.top = '0';
  fill.style.bottom = '0';
  fill.style.background =
    'linear-gradient(90deg, #7f1d1d, #ef4444)';
  fill.style.transition = 'width .15s ease-out';

  text.textContent =
    `${Math.ceil(hpData.currentHp)} / ${Math.ceil(hpData.maxHp)}`;

  text.style.position = 'absolute';
  text.style.inset = '0';
  text.style.display = 'flex';
  text.style.alignItems = 'center';
  text.style.justifyContent = 'center';
  text.style.zIndex = '2';

  return hpData;
}
export function renderStageMonster(state) {
  ensureStageStyles();

  const parts = ensureMonsterInternals();
  if (!parts?.sprite) return;

  const { mon, sprite } = parts;
  const m = state?.activeMonster;

  if (!m) {
    sprite.innerHTML = '';
    const nameEl = qid('monster-name');
    if (nameEl) nameEl.textContent = '—';
    updateBar('monster-hp-bar', 0, 1, 'monster-hp-text');
    const fill = qid('monster-hp-fill');
    if (fill) fill.style.width = '0%';
    mon.classList.remove('is-boss', 'is-elite');
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
  const hp = Math.max(0, Number(m.hp) || 0);
  updateBar('monster-hp-bar', hp, maxHp, 'monster-hp-text');
  const fill = qid('monster-hp-fill');
  if (fill) {
    fill.style.width = `${Math.max(0, Math.min(100, (hp / maxHp) * 100))}%`;
  }

  mon.classList.toggle('is-boss', isBoss);
  mon.classList.toggle('is-elite', isElite && !isBoss);

  // Arte SOMENTE no slot interno
  let html = '';
  try {
    html = monsterSVG(key, { crown: isBoss, elite: isElite }) || '';
  } catch (e) {
    console.error('[StageUI] monsterSVG error:', key, e);
  }
  sprite.innerHTML = html || `
    <div style="width:140px;height:150px;display:flex;align-items:center;justify-content:center;
      flex-direction:column;color:#e8c37a;border:2px dashed #e8c37a;border-radius:10px;">
      <div style="font-size:40px">${isBoss ? '👑' : '👹'}</div>
      <div style="font-size:11px">${m.name || key}</div>
    </div>`;
}

/* ═══════════════════ RENDER HERÓI ═══════════════════ */

export function renderStageHero(state) {
  ensureStageStyles();

  const box = qid('stage-hero') || el('stage-hero');
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
  const container = qid('zone-map-container') || qid('zone-list') || el('zone-list');
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

const STYLE_ID = 'stage-ui-styles-v4';

export function ensureStageStyles() {
  const host = document.getElementById('idle-host');
  const target = host?.shadowRoot || document.head;
  if (!target) return;

  // Remove versões antigas que brigavam com o layout
  ['stage-ui-styles', 'stage-ui-styles-v4'].forEach((id) => {
    // mantém só v4 no final
  });
  const old = target.querySelector('#stage-ui-styles');
  if (old) old.remove();

  if (target.querySelector('#' + STYLE_ID)) return;

  const tag = document.createElement('style');
  tag.id = STYLE_ID;
  tag.textContent = STAGE_CSS;
  target.appendChild(tag);
}

/**
 * IMPORTANTE:
 * O HTML real tem #stage-hero e #stage-monster como FILHOS DIRETOS de #stage.
 * O layout original é position:absolute (left / right).
 * NÃO usar grid/flex no #stage inteiro — isso quebra o fundo e as animações (is-hero-atk).
 */
const STAGE_CSS = `
/* ═══════════════ PALCO: posicionamento absoluto L | R ═══════════════ */

#stage.stage,
#stage {
  position: relative !important;
  overflow: hidden !important;
}

/* HERÓI — coluna esquerda */
#stage-hero {
  position: absolute !important;
  left: 6% !important;
  right: auto !important;
  bottom: 10% !important;
  top: auto !important;

  width: 170px !important;
  max-width: 38% !important;
  height: 210px !important;
  max-height: 70% !important;

  margin: 0 !important;
  transform: none !important;          /* evita herdar translate quebrado */
  inset: auto auto 10% 6% !important;  /* top right bottom left */

  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: flex-end !important;

  z-index: 3 !important;
  pointer-events: none !important;
  overflow: visible !important;
  box-sizing: border-box !important;
}

/* MONSTRO — coluna direita */
#stage-monster {
  position: absolute !important;
  right: 6% !important;
  left: auto !important;               /* ← CRÍTICO: tira o monstro da esquerda */
  bottom: 10% !important;
  top: auto !important;

  width: 170px !important;
  max-width: 38% !important;
  height: 210px !important;
  max-height: 70% !important;

  margin: 0 !important;
  transform: none !important;
  inset: auto 6% 10% auto !important;  /* top right bottom left */

  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: flex-end !important;

  z-index: 3 !important;
  pointer-events: none !important;
  overflow: visible !important;
  box-sizing: border-box !important;

  /* NÃO esticar como se fosse o palco inteiro */
  background: transparent !important;
}

/* Slot interno da arte */
#monster-sprite-container,
.monster-sprite-host {
  position: relative !important;
  display: flex !important;
  align-items: flex-end !important;
  justify-content: center !important;
  width: 100% !important;
  height: 160px !important;
  max-height: 160px !important;
  overflow: visible !important;
  flex: 0 0 auto !important;
}

/* Imagens do herói e monstro — tamanho de figurinha */
#stage-hero img,
#stage-hero svg,
#stage-hero .hero-svg,
#stage-hero .hero-full,
#stage-hero .hero-full img,
#monster-sprite-container img,
#monster-sprite-container svg,
#monster-sprite-container .mon-svg,
#monster-sprite-container .mon-svg img {
  width: auto !important;
  height: auto !important;
  max-width: 150px !important;
  max-height: 160px !important;
  object-fit: contain !important;
  object-position: center bottom !important;
  display: block !important;
  margin: 0 auto !important;
}

/* Wrapper que o art.js gera */
#stage-hero .hero-svg,
#stage-hero .hero-full,
#monster-sprite-container .mon-svg {
  width: 150px !important;
  height: 160px !important;
  max-width: 150px !important;
  max-height: 160px !important;
  position: relative !important;
}

/* Boss / elite um pouco maior, ainda no lado direito */
#stage-monster.is-boss #monster-sprite-container .mon-svg,
#stage-monster.is-boss #monster-sprite-container img {
  max-width: 168px !important;
  max-height: 178px !important;
  width: 168px !important;
  height: 178px !important;
}

#stage-monster.is-boss {
  filter: drop-shadow(0 0 12px rgba(255, 80, 80, 0.5));
}
#stage-monster.is-elite {
  filter: drop-shadow(0 0 10px rgba(150, 120, 255, 0.45));
}

/* Nome + HP do monstro (no card direito) */
#monster-name,
.stage-entity-name {
  flex: 0 0 auto !important;
  width: 100% !important;
  text-align: center !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  color: #e8c37a !important;
  text-shadow: 0 1px 3px #000 !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  padding: 0 4px 2px !important;
  order: -2 !important;
}

#monster-hp-bar,
.stage-hp-bar {
  position: relative !important;
  flex: 0 0 auto !important;
  width: 100% !important;
  height: 10px !important;
  margin: 0 0 6px !important;
  background: rgba(40, 12, 12, 0.9) !important;
  border: 1px solid #7a3030 !important;
  border-radius: 3px !important;
  overflow: hidden !important;
  order: -1 !important;
}

#monster-hp-fill,
.stage-hp-fill {
  position: absolute !important;
  left: 0; top: 0; bottom: 0;
  width: 100%;
  background: linear-gradient(90deg, #7f1d1d, #ef4444) !important;
  transition: width 0.15s ease-out !important;
}

#monster-hp-text,
.stage-hp-text {
  position: absolute !important;
  inset: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 8px !important;
  color: #fff !important;
  text-shadow: 0 1px 2px #000 !important;
  z-index: 1 !important;
}

/* Animações de ataque do projeto: não zerar se o CSS global depender de translate no #stage,
   só nos cards de lutador em estado idle. Durante atk o global pode sobrescrever. */
#stage:not(.is-hero-atk):not(.is-mob-atk) #stage-hero,
#stage:not(.is-hero-atk):not(.is-mob-atk) #stage-monster {
  transform: none !important;
}

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
