/**
 * StageUI.js
 * Palco Principal (Herói vs Monstro) e Mapa de Zonas.
 *
 * Compatível com:
 * - #stage como palco principal
 * - #stage-hero e #stage-monster como filhos diretos
 * - Shadow DOM em #idle-host
 * - MONSTERS usando chaves como goblin, goblinMage etc.
 * - MON_IMG usando chaves com ou sem prefixo mon_
 */

import { ZONES, SAGAS, ZONE_BACKGROUNDS } from '../data/zones.js';
import { MONSTERS, MONSTER_BY_NAME } from '../data/monsters.js';
import { el, updateBar } from '../core/DomHelpers.js';
import { getClass } from '../engine/StatsEngine.js';
import { heroSVG, monsterSVG, MON_IMG } from '../../art.js';

/* ═══════════════════════════════════════════════════════════════════════════
   DOM / SHADOW ROOT
═══════════════════════════════════════════════════════════════════════════ */

function getRoot() {
  return document.getElementById('idle-host')?.shadowRoot || document;
}

function query(selector) {
  return getRoot().querySelector(selector);
}

function queryId(id) {
  return getRoot().querySelector(`#${id}`) || document.getElementById(id);
}

/* ═══════════════════════════════════════════════════════════════════════════
   ESTRUTURA DO CARD DO HERÓI
═══════════════════════════════════════════════════════════════════════════ */

/**
 * Garante que #stage-hero contenha:
 *
 * #hero-name
 * #hero-hp-bar
 *   #hero-hp-fill
 *   #hero-hp-text
 * #hero-mp-bar
 *   #hero-mp-fill
 *   #hero-mp-text
 * #hero-sprite-container (opcional, para a arte)
 *
 * Importante: a arte nunca é inserida diretamente em #stage-hero.
 */
function ensureHeroStructure() {
  const heroCard =
    query('#stage-hero') ||
    query('.stage-hero');

  if (!heroCard) {
    console.error('[StageUI] Elemento #stage-hero não encontrado.');
    return null;
  }

  let name = heroCard.querySelector('#hero-name');
  let hpBar = heroCard.querySelector('#hero-hp-bar');
  let mpBar = heroCard.querySelector('#hero-mp-bar');
  let sprite = heroCard.querySelector('#hero-sprite-container');

  /*
   * Recria somente quando a estrutura está incompleta.
   */
  if (!name || !hpBar || !mpBar) {
    const oldArt = sprite?.innerHTML || '';

    heroCard.innerHTML = `
      <div id="hero-name" class="stage-entity-name stage-hero-name">
        —
      </div>

      <div
        id="hero-hp-bar"
        class="stage-hp-bar stage-hp-bar-hero"
        role="progressbar"
        aria-valuemin="0"
        aria-valuenow="0"
        aria-valuemax="1"
      >
        <div id="hero-hp-fill" class="stage-hp-fill stage-hp-fill-hero"></div>
        <span id="hero-hp-text" class="stage-hp-text stage-hp-text-hero">0 / 0</span>
      </div>

      <div
        id="hero-mp-bar"
        class="stage-mp-bar stage-mp-bar-hero"
        role="progressbar"
        aria-valuemin="0"
        aria-valuenow="0"
        aria-valuemax="1"
      >
        <div id="hero-mp-fill" class="stage-mp-fill stage-mp-fill-hero"></div>
        <span id="hero-mp-text" class="stage-mp-text stage-mp-text-hero">0 / 0</span>
      </div>

      <div id="hero-sprite-container" class="hero-sprite-host"></div>
    `;

    name = heroCard.querySelector('#hero-name');
    hpBar = heroCard.querySelector('#hero-hp-bar');
    mpBar = heroCard.querySelector('#hero-mp-bar');
    sprite = heroCard.querySelector('#hero-sprite-container');

    if (oldArt && sprite) {
      sprite.innerHTML = oldArt;
    }
  }

  /*
   * Garante preenchimento interno das barras.
   */
  if (hpBar && !hpBar.querySelector('#hero-hp-fill, .stage-hp-fill, .bar-fill')) {
    const fill = document.createElement('div');
    fill.id = 'hero-hp-fill';
    fill.className = 'stage-hp-fill';
    hpBar.insertBefore(fill, hpBar.firstChild);
  }

  if (mpBar && !mpBar.querySelector('#hero-mp-fill, .stage-mp-fill, .bar-fill')) {
    const fill = document.createElement('div');
    fill.id = 'hero-mp-fill';
    fill.className = 'stage-mp-fill';
    mpBar.insertBefore(fill, mpBar.firstChild);
  }

  /*
   * Garante texto das barras.
   */
  if (hpBar && !hpBar.querySelector('#hero-hp-text, .stage-hp-text, .bar-text')) {
    const text = document.createElement('span');
    text.id = 'hero-hp-text';
    text.className = 'stage-hp-text';
    text.textContent = '0 / 0';
    hpBar.appendChild(text);
  }

  if (mpBar && !mpBar.querySelector('#hero-mp-text, .stage-mp-text, .bar-text')) {
    const text = document.createElement('span');
    text.id = 'hero-mp-text';
    text.className = 'stage-mp-text';
    text.textContent = '0 / 0';
    mpBar.appendChild(text);
  }

  return {
    card: heroCard,
    name: heroCard.querySelector('#hero-name'),
    hpBar: heroCard.querySelector('#hero-hp-bar'),
    hpFill: heroCard.querySelector('#hero-hp-fill, .stage-hp-fill, .bar-fill'),
    hpText: heroCard.querySelector('#hero-hp-text, .stage-hp-text, .bar-text'),
    mpBar: heroCard.querySelector('#hero-mp-bar'),
    mpFill: heroCard.querySelector('#hero-mp-fill, .stage-mp-fill, .bar-fill'),
    mpText: heroCard.querySelector('#hero-mp-text, .stage-mp-text, .bar-text'),
    sprite: heroCard.querySelector('#hero-sprite-container')
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   ESTRUTURA DO CARD DO MONSTRO
═══════════════════════════════════════════════════════════════════════════ */

/**
 * Garante que #stage-monster contenha:
 *
 * #monster-name
 * #monster-hp-bar
 *   #monster-hp-fill
 *   #monster-hp-text
 * #monster-sprite-container
 */
function ensureMonsterStructure() {
  const monsterCard =
    query('#stage-monster') ||
    query('.stage-monster');

  if (!monsterCard) {
    console.error('[StageUI] Elemento #stage-monster não encontrado.');
    return null;
  }

  let name = monsterCard.querySelector('#monster-name');
  let hpBar = monsterCard.querySelector('#monster-hp-bar');
  let sprite = monsterCard.querySelector('#monster-sprite-container');

  if (!name || !hpBar || !sprite) {
    monsterCard.innerHTML = `
      <div id="monster-name" class="stage-entity-name">
        —
      </div>

      <div
        id="monster-hp-bar"
        class="stage-hp-bar"
        role="progressbar"
        aria-valuemin="0"
        aria-valuenow="0"
        aria-valuemax="1"
      >
        <div id="monster-hp-fill" class="stage-hp-fill"></div>
        <span id="monster-hp-text" class="stage-hp-text">0 / 0</span>
      </div>

      <div id="monster-sprite-container" class="monster-sprite-host"></div>
    `;

    name = monsterCard.querySelector('#monster-name');
    hpBar = monsterCard.querySelector('#monster-hp-bar');
    sprite = monsterCard.querySelector('#monster-sprite-container');
  }

  if (hpBar && !hpBar.querySelector('#monster-hp-fill, .stage-hp-fill, .bar-fill')) {
    const fill = document.createElement('div');
    fill.id = 'monster-hp-fill';
    fill.className = 'stage-hp-fill';
    hpBar.insertBefore(fill, hpBar.firstChild);
  }

  if (hpBar && !hpBar.querySelector('#monster-hp-text, .stage-hp-text, .bar-text')) {
    const text = document.createElement('span');
    text.id = 'monster-hp-text';
    text.className = 'stage-hp-text';
    text.textContent = '0 / 0';
    hpBar.appendChild(text);
  }

  return {
    card: monsterCard,
    name: monsterCard.querySelector('#monster-name'),
    hpBar: monsterCard.querySelector('#monster-hp-bar'),
    hpFill: monsterCard.querySelector('#monster-hp-fill, .stage-hp-fill, .bar-fill'),
    hpText: monsterCard.querySelector('#monster-hp-text, .stage-hp-text, .bar-text'),
    sprite: monsterCard.querySelector('#monster-sprite-container')
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   RESOLUÇÃO DA CHAVE DO MONSTRO
═══════════════════════════════════════════════════════════════════════════ */

export function resolveMonsterKey(monster) {
  if (!monster) return 'goblin';

  const candidates = [
    monster.id,
    monster.key,
    monster.monsterId,
    monster.monsterKey,
    monster.sprite,
    monster.itemId,
    monster.name
  ];

  for (const value of candidates) {
    if (!value) continue;

    const original = String(value).trim();
    const compact = original.replace(/\s+/g, '');
    const lower = compact.toLowerCase();

    const dataKeys = [original, compact, lower];

    for (const key of dataKeys) {
      if (MONSTERS?.[key]) {
        return key;
      }
    }

    const nameIndex =
      MONSTER_BY_NAME?.[original.toLowerCase()] ||
      MONSTER_BY_NAME?.[lower];

    if (nameIndex && MONSTERS?.[nameIndex]) {
      return nameIndex;
    }

    if (monster.name) {
      const parts = String(monster.name)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]+/g, ' ')
        .trim()
        .split(/\s+/);

      const camelKey = parts
        .map((part, index) => {
          const word = part.toLowerCase();
          return index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join('');

      if (MONSTERS?.[camelKey]) {
        return camelKey;
      }
    }

    if (MON_IMG) {
      const imageKeys = [original, compact, lower, `mon_${lower}`];

      for (const key of imageKeys) {
        if (MON_IMG[key]) {
          const normalized = key.startsWith('mon_') ? key.slice(4) : key;
          if (MONSTERS?.[normalized]) {
            return normalized;
          }
          return normalized;
        }
      }
    }
  }

  return 'goblin';
}

/* ═══════════════════════════════════════════════════════════════════════════
   HP DO HERÓI
═══════════════════════════════════════════════════════════════════════════ */

function updateHeroHP(state, structure) {
  if (!state || !structure) return;

  const currentHp = Number(state.hp ?? 0);
  const maxHp = Number(state.maxHp ?? 1);

  const safeCurrentHp = Math.max(0, Math.min(currentHp, maxHp));
  const percentage = Math.max(0, Math.min(100, (safeCurrentHp / maxHp) * 100));
  const currentText = `${Math.floor(safeCurrentHp)} / ${Math.floor(maxHp)}`;

  try {
    updateBar('hero-hp-bar', safeCurrentHp, maxHp, 'hero-hp-text');
  } catch (error) {
    console.warn('[StageUI] updateBar HP falhou:', error);
  }

  const fill =
    structure.hpBar?.querySelector('#hero-hp-fill, .stage-hp-fill, .bar-fill') ||
    structure.hpFill;

  if (fill) {
    fill.style.width = `${percentage}%`;
  }

  const text =
    structure.hpBar?.querySelector('#hero-hp-text, .stage-hp-text, .bar-text') ||
    structure.hpText;

  if (text) {
    text.textContent = currentText;
  }

  if (structure.hpBar) {
    structure.hpBar.setAttribute('aria-valuenow', String(Math.floor(safeCurrentHp)));
    structure.hpBar.setAttribute('aria-valuemax', String(Math.floor(maxHp)));
  }
}

function updateHeroMP(state, structure) {
  if (!state || !structure) return;

  const currentMp = Number(state.mp ?? 0);
  const maxMp = Number(state.maxMp ?? 1);

  const safeCurrentMp = Math.max(0, Math.min(currentMp, maxMp));
  const percentage = Math.max(0, Math.min(100, (safeCurrentMp / maxMp) * 100));
  const currentText = `${Math.floor(safeCurrentMp)} / ${Math.floor(maxMp)}`;

  try {
    updateBar('hero-mp-bar', safeCurrentMp, maxMp, 'hero-mp-text');
  } catch (error) {
    console.warn('[StageUI] updateBar MP falhou:', error);
  }

  const fill =
    structure.mpBar?.querySelector('#hero-mp-fill, .stage-mp-fill, .bar-fill') ||
    structure.mpFill;

  if (fill) {
    fill.style.width = `${percentage}%`;
  }

  const text =
    structure.mpBar?.querySelector('#hero-mp-text, .stage-mp-text, .bar-text') ||
    structure.mpText;

  if (text) {
    text.textContent = currentText;
  }

  if (structure.mpBar) {
    structure.mpBar.setAttribute('aria-valuenow', String(Math.floor(safeCurrentMp)));
    structure.mpBar.setAttribute('aria-valuemax', String(Math.floor(maxMp)));
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   HP DO MONSTRO
═══════════════════════════════════════════════════════════════════════════ */

function updateMonsterHP(monster, monsterKey, structure) {
  if (!monster || !structure) return;

  const baseMonster = MONSTERS?.[monsterKey] || {};

  const currentHp = Number(
    monster.hp ??
    monster.currentHp ??
    monster.currentHP ??
    monster.health ??
    0
  );

  let maxHp = Number(
    monster._maxHp ??
    monster.maxHp ??
    monster.maxHP ??
    monster.baseHp ??
    baseMonster.hp ??
    1
  );

  if (!Number.isFinite(maxHp) || maxHp <= 0) {
    maxHp = Math.max(currentHp, 1);
  }

  const safeCurrentHp = Math.max(0, Math.min(Number.isFinite(currentHp) ? currentHp : 0, maxHp));
  const percentage = Math.max(0, Math.min(100, (safeCurrentHp / maxHp) * 100));
  const currentText = `${Math.floor(safeCurrentHp)} / ${Math.floor(maxHp)}`;

  try {
    updateBar('monster-hp-bar', safeCurrentHp, maxHp, 'monster-hp-text');
  } catch (error) {
    console.warn('[StageUI] updateBar falhou:', error);
  }

  const fill =
    structure.hpBar?.querySelector('#monster-hp-fill, .stage-hp-fill, .bar-fill') ||
    structure.hpFill;

  if (fill) {
    fill.style.width = `${percentage}%`;
  }

  const text =
    structure.hpBar?.querySelector('#monster-hp-text, .stage-hp-text, .bar-text') ||
    structure.hpText;

  if (text) {
    text.textContent = currentText;
  }

  if (structure.hpBar && !fill) {
    structure.hpBar.style.width = `${percentage}%`;
  }

  if (structure.hpBar) {
    structure.hpBar.setAttribute('aria-valuenow', String(Math.floor(safeCurrentHp)));
    structure.hpBar.setAttribute('aria-valuemax', String(Math.floor(maxHp)));
  }

  console.debug(
    `[StageUI] HP do monstro: ${Math.floor(safeCurrentHp)}/${Math.floor(maxHp)}`
  );
}

function clearMonsterHP(structure) {
  if (!structure) return;

  const fill =
    structure.hpBar?.querySelector('#monster-hp-fill, .stage-hp-fill, .bar-fill') ||
    structure.hpFill;

  const text =
    structure.hpBar?.querySelector('#monster-hp-text, .stage-hp-text, .bar-text') ||
    structure.hpText;

  if (fill) fill.style.width = '0%';
  if (text) text.textContent = '0 / 0';

  if (structure.hpBar) {
    structure.hpBar.setAttribute('aria-valuenow', '0');
    structure.hpBar.setAttribute('aria-valuemax', '0');
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   RENDERIZAÇÃO DO HERÓI
═══════════════════════════════════════════════════════════════════════════ */

export function renderStageHero(state) {
  ensureStageStyles();

  const structure = ensureHeroStructure();

  if (!structure?.card) {
    console.error('[StageUI] Estrutura do herói não disponível.');
    return;
  }

  /*
   * Nome do herói (do state ou padrão)
   */
  if (structure.name) {
    const classDefinition = getClass(state?.class);
    const className = classDefinition?.name || state?.class || 'Aventureiro';
    const heroName = state?.name || state?.heroName || state?.playerName || 'Herói';
    
    structure.name.textContent = `${heroName} (Lv. ${state?.level ?? 1})`;
  }

  /*
   * HP e MP
   */
  updateHeroHP(state, structure);
  updateHeroMP(state, structure);

  /*
   * Arte do herói no slot dedicado
   */
  if (structure.sprite) {
    try {
      structure.sprite.innerHTML = heroSVG(
        state?.race || 'human',
        state?.class || 'fighter'
      );
    } catch (error) {
      console.error('[StageUI] Erro ao renderizar herói:', error);
      structure.sprite.innerHTML = `
        <div class="hero-placeholder">
          <div class="hero-placeholder-icon">️</div>
          <div class="hero-placeholder-name">${state?.race || 'human'}</div>
        </div>
      `;
    }
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   RENDERIZAÇÃO DO MONSTRO
═══════════════════════════════════════════════════════════════════════════ */

export function renderStageMonster(state) {
  ensureStageStyles();

  const structure = ensureMonsterStructure();

  if (!structure?.card || !structure.sprite) {
    console.error('[StageUI] Estrutura do monstro não disponível.');
    return;
  }

  const monster = state?.activeMonster;

  if (!monster) {
    structure.sprite.innerHTML = '';

    if (structure.name) {
      structure.name.textContent = '—';
    }

    clearMonsterHP(structure);

    structure.card.classList.remove('is-boss', 'is-elite');
    return;
  }

  const monsterKey = resolveMonsterKey(monster);

  const isBoss = Boolean(monster.boss || monster.isBoss || monster.isTower);
  const isElite = Boolean(monster.elite || monster.isElite);

  const level =
    monster.level ??
    monster.lvl ??
    ZONES[state?.zone]?.level ??
    1;

  if (structure.name) {
    const prefix = isBoss ? '👑 CHEFÃO · ' : isElite ? '⚡ ÉLITE · ' : '';
    structure.name.textContent = `${prefix}${monster.name || monsterKey} (Nv. ${level})`;
  }

  updateMonsterHP(monster, monsterKey, structure);

  structure.card.classList.toggle('is-boss', isBoss);
  structure.card.classList.toggle('is-elite', isElite && !isBoss);

  structure.sprite.classList.toggle('is-boss', isBoss);
  structure.sprite.classList.toggle('is-elite', isElite && !isBoss);

  let art = '';

  try {
    art = monsterSVG(monsterKey, {
      crown: isBoss,
      elite: isElite,
      element: monster.element
    }) || '';
  } catch (error) {
    console.error(`[StageUI] Erro ao renderizar "${monsterKey}":`, error);
  }

  structure.sprite.innerHTML = art || createMonsterPlaceholder(monster.name || monsterKey, isBoss);
}

function createMonsterPlaceholder(name, isBoss = false) {
  return `
    <div class="monster-placeholder">
      <div class="monster-placeholder-icon">${isBoss ? '👑' : '👹'}</div>
      <div class="monster-placeholder-name">${name}</div>
    </div>
  `;
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAPA / ZONAS
═══════════════════════════════════════════════════════════════════════════ */

export function updateZoneUI(state, callbacks = {}) {
  const zone = ZONES?.[state?.zone];

  const zoneName = query('#zone-name') || el('zone-name');

  if (zoneName && zone) {
    zoneName.textContent = zone.name;
  }

  renderZoneMap(state, callbacks);
}

function maxVisibleSaga(state) {
  const level = Number(state?.level ?? 1);

  const unlockedSaga = SAGAS.reduce(
    (lastUnlocked, saga, index) => {
      return level >= saga.unlocksAt ? index : lastUnlocked;
    },
    0
  );

  return Math.max(Number(state?.currentSaga ?? 0), unlockedSaga);
}

export function renderZoneMap(state, callbacks = {}) {
  const container =
    query('#zone-map-container') ||
    query('#zone-list') ||
    el('zone-map-container') ||
    el('zone-list');

  if (!container) {
    console.warn('[StageUI] Container de zonas não encontrado.');
    return;
  }

  ensureStageStyles();

  container.innerHTML = '';
  container.classList.add('zone-map-root');

  const lastSaga = maxVisibleSaga(state);

  for (let sagaIndex = 0; sagaIndex <= lastSaga; sagaIndex++) {
    const saga = SAGAS?.[sagaIndex];

    if (!saga) continue;

    const block = document.createElement('div');
    block.className = 'saga-map-block';

    const cards = [];

    for (const zoneId of saga.zones || []) {
      const zone = ZONES?.[zoneId];

      if (!zone) {
        console.warn(`[StageUI] Zona ausente: ${zoneId}`);
        continue;
      }

      const isCurrent = state?.zone === zoneId;
      const isLocked = Number(state?.level ?? 1) < Number(zone.level);

      const monstersCount = zone.monsters?.length ?? 0;
      const bossName = MONSTERS?.[zone.boss]?.name || '';
      const thumb = ZONE_BACKGROUNDS?.[zoneId] || '';

      cards.push(`
        <div
          class="zone-card${isCurrent ? ' active' : ''}${isLocked ? ' locked' : ''}"
          data-zone="${zoneId}"
          data-locked="${isLocked}"
          data-current="${isCurrent}"
          role="button"
          tabindex="${isLocked || isCurrent ? '-1' : '0'}"
        >
          <div class="zone-card-thumb" ${thumb ? `style="background-image:url('${thumb}')"` : ''}>
            ${zone.town ? '<span class="zone-flag town">🏠 Vila</span>' : ''}
            ${isLocked ? '<span class="zone-flag lock">🔒</span>' : ''}
            ${isCurrent ? '<span class="zone-flag here">★</span>' : ''}
          </div>

          <div class="zone-card-body">
            <div class="zone-card-header">
              <span class="zone-card-title">${zone.name}</span>
              <span class="zone-card-lvl">Lv.${zone.level}+</span>
            </div>

            <div class="zone-card-desc">
              ${monstersCount} espécie${monstersCount === 1 ? '' : 's'}
              ${bossName ? ` · 👑 ${bossName}` : ''}
            </div>

            <button class="select-zone-btn" ${isLocked || isCurrent ? 'disabled' : ''}>
              ${isCurrent ? '★ Caçando Aqui' : isLocked ? `🔒 Requer Lv.${zone.level}` : 'Caçar nesta Área'}
            </button>
          </div>
        </div>
      `);
    }

    block.innerHTML = `
      <div class="saga-header">
        <span class="saga-title">🗺️ ${saga.name}</span>
        <span class="saga-req">Lv. ${saga.unlocksAt}+</span>
      </div>
      <div class="saga-zones-grid">${cards.join('')}</div>
    `;

    container.appendChild(block);
  }

  container.onclick = (event) => {
    const card = event.target.closest?.('.zone-card');

    if (!card) return;
    if (card.dataset.locked === 'true') return;
    if (card.dataset.current === 'true') return;

    const zoneId = card.dataset.zone;

    if (callbacks.selectZone) {
      callbacks.selectZone(zoneId);
      return;
    }

    if (typeof window.setZone === 'function') {
      window.setZone(zoneId);
    }
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   CSS
═══════════════════════════════════════════════════════════════════════════ */

const STYLE_ID = 'stage-ui-styles-final';

export function ensureStageStyles() {
  const host = document.getElementById('idle-host');
  const target = host?.shadowRoot || document.head;

  if (!target) return;

  for (const oldId of ['stage-ui-styles', 'stage-ui-styles-v4', 'stage-ui-styles-final']) {
    const oldStyle = target.querySelector(`#${oldId}`);
    if (oldStyle && oldId !== STYLE_ID) {
      oldStyle.remove();
    }
  }

  if (target.querySelector(`#${STYLE_ID}`)) {
    return;
  }

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = STAGE_CSS;

  target.appendChild(style);
}

const STAGE_CSS = `
/* ═══════════════════════════════════════════════════════════════════════════
   PALCO PRINCIPAL
═══════════════════════════════════════════════════════════════════════════ */

#stage {
  position: relative !important;
  overflow: hidden !important;
}

#stage-hero {
  position: absolute !important;
  left: 6% !important;
  right: auto !important;
  top: auto !important;
  bottom: 10% !important;
  inset: auto auto 10% 6% !important;

  width: 170px !important;
  max-width: 38% !important;
  height: 240px !important;
  max-height: 75% !important;

  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: flex-end !important;

  margin: 0 !important;
  padding: 0 !important;
  box-sizing: border-box !important;
  overflow: visible !important;
  transform: none !important;
  z-index: 3 !important;
  pointer-events: none !important;
}

#stage-monster {
  position: absolute !important;
  left: auto !important;
  right: 6% !important;
  top: auto !important;
  bottom: 10% !important;
  inset: auto 6% 10% auto !important;

  width: 170px !important;
  max-width: 38% !important;
  height: 240px !important;
  max-height: 75% !important;

  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: flex-end !important;

  margin: 0 !important;
  padding: 0 !important;
  box-sizing: border-box !important;
  overflow: visible !important;
  transform: none !important;
  z-index: 3 !important;
  pointer-events: none !important;
  background: transparent !important;
}

/* ═══════════════════════════════════════════════════════════════════════════
   SPRITES
═══════════════════════════════════════════════════════════════════════════ */

#hero-sprite-container,
.hero-sprite-host {
  position: relative !important;
  display: flex !important;
  align-items: flex-end !important;
  justify-content: center !important;
  width: 100% !important;
  height: 170px !important;
  min-height: 170px !important;
  max-height: 170px !important;
  flex: 0 0 170px !important;
  overflow: visible !important;
  box-sizing: border-box !important;
}

#hero-sprite-container .hero-svg,
#hero-sprite-container .hero-full,
.hero-sprite-host .hero-svg,
.hero-sprite-host .hero-full {
  position: relative !important;
  width: 150px !important;
  height: 170px !important;
  max-width: 150px !important;
  max-height: 170px !important;
  display: block !important;
  margin: 0 auto !important;
  flex: 0 0 150px !important;
}

#hero-sprite-container .hero-svg img,
#hero-sprite-container .hero-full img,
.hero-sprite-host .hero-svg img,
.hero-sprite-host .hero-full img {
  width: 100% !important;
  height: 100% !important;
  max-width: 150px !important;
  max-height: 170px !important;
  display: block !important;
  object-fit: contain !important;
  object-position: center bottom !important;
}

#monster-sprite-container,
.monster-sprite-host {
  position: relative !important;
  display: flex !important;
  align-items: flex-end !important;
  justify-content: center !important;
  width: 100% !important;
  height: 160px !important;
  min-height: 160px !important;
  max-height: 160px !important;
  flex: 0 0 160px !important;
  overflow: visible !important;
  box-sizing: border-box !important;
}

#monster-sprite-container .mon-svg,
.monster-sprite-host .mon-svg {
  position: relative !important;
  width: 150px !important;
  height: 160px !important;
  max-width: 150px !important;
  max-height: 160px !important;
  display: block !important;
  margin: 0 auto !important;
  flex: 0 0 150px !important;
}

#monster-sprite-container .mon-svg img,
.monster-sprite-host .mon-svg img {
  width: 100% !important;
  height: 100% !important;
  max-width: 150px !important;
  max-height: 160px !important;
  display: block !important;
  object-fit: contain !important;
  object-position: center bottom !important;
}

#stage-monster.is-boss #monster-sprite-container .mon-svg,
#stage-monster.is-boss #monster-sprite-container .mon-svg img {
  width: 160px !important;
  height: 170px !important;
  max-width: 160px !important;
  max-height: 170px !important;
}

#stage-monster.is-boss {
  filter: drop-shadow(0 0 10px rgba(255, 80, 80, .5)) !important;
}

#stage-monster.is-elite {
  filter: drop-shadow(0 0 8px rgba(150, 120, 255, .45)) !important;
}

/* ═══════════════════════════════════════════════════════════════════════════
   NOME E BARRAS DO HERÓI
═══════════════════════════════════════════════════════════════════════════ */

#hero-name,
.stage-hero-name {
  order: -3 !important;
  width: 100% !important;
  min-height: 16px !important;
  flex: 0 0 auto !important;
  padding: 0 4px 2px !important;
  box-sizing: border-box !important;
  color: #e8c37a !important;
  font-size: 12px !important;
  font-weight: 700 !important;
  line-height: 16px !important;
  text-align: center !important;
  text-shadow: 0 1px 3px #000 !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

#hero-hp-bar,
.stage-hp-bar-hero {
  order: -2 !important;
  position: relative !important;
  width: 100% !important;
  height: 12px !important;
  min-height: 12px !important;
  max-height: 12px !important;
  flex: 0 0 12px !important;
  margin: 0 0 4px !important;
  padding: 0 !important;
  box-sizing: border-box !important;
  background: #1a2f1a !important;
  border: 1px solid #3a7a3a !important;
  border-radius: 4px !important;
  overflow: hidden !important;
}

#hero-hp-fill,
.stage-hp-fill-hero {
  position: absolute !important;
  left: 0 !important;
  top: 0 !important;
  bottom: 0 !important;
  width: 100%;
  max-width: 100% !important;
  background: linear-gradient(90deg, #1a7a1a, #2ea02e, #4ade4a) !important;
  transition: width .15s ease-out !important;
}

#hero-hp-text,
.stage-hp-text-hero {
  position: absolute !important;
  inset: 0 !important;
  z-index: 2 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  color: #fff !important;
  font-size: 8px !important;
  line-height: 10px !important;
  text-shadow: 0 1px 2px #000 !important;
  pointer-events: none !important;
}

#hero-mp-bar,
.stage-mp-bar-hero {
  order: -1 !important;
  position: relative !important;
  width: 100% !important;
  height: 12px !important;
  min-height: 12px !important;
  max-height: 12px !important;
  flex: 0 0 12px !important;
  margin: 0 0 6px !important;
  padding: 0 !important;
  box-sizing: border-box !important;
  background: #1a1a3f !important;
  border: 1px solid #3a3a7a !important;
  border-radius: 4px !important;
  overflow: hidden !important;
}

#hero-mp-fill,
.stage-mp-fill-hero {
  position: absolute !important;
  left: 0 !important;
  top: 0 !important;
  bottom: 0 !important;
  width: 100%;
  max-width: 100% !important;
  background: linear-gradient(90deg, #1a1a7a, #2e2ea0, #4a4ade) !important;
  transition: width .15s ease-out !important;
}

#hero-mp-text,
.stage-mp-text-hero {
  position: absolute !important;
  inset: 0 !important;
  z-index: 2 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  color: #fff !important;
  font-size: 8px !important;
  line-height: 10px !important;
  text-shadow: 0 1px 2px #000 !important;
  pointer-events: none !important;
}

/* ═══════════════════════════════════════════════════════════════════════════
   NOME E HP DO MONSTRO
═══════════════════════════════════════════════════════════════════════════ */

#monster-name,
.stage-entity-name {
  order: -2 !important;
  width: 100% !important;
  min-height: 15px !important;
  flex: 0 0 auto !important;
  padding: 0 4px 2px !important;
  box-sizing: border-box !important;
  color: #e8c37a !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  line-height: 15px !important;
  text-align: center !important;
  text-shadow: 0 1px 3px #000 !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

#monster-hp-bar,
.stage-hp-bar {
  order: -1 !important;
  position: relative !important;
  width: 100% !important;
  height: 12px !important;
  min-height: 12px !important;
  max-height: 12px !important;
  flex: 0 0 12px !important;
  margin: 0 0 6px !important;
  padding: 0 !important;
  box-sizing: border-box !important;
  background: #281010 !important;
  border: 1px solid #7a3030 !important;
  border-radius: 4px !important;
  overflow: hidden !important;
}

#monster-hp-fill,
.stage-hp-fill,
#monster-hp-bar .bar-fill,
#monster-hp-bar .fill {
  position: absolute !important;
  left: 0 !important;
  top: 0 !important;
  bottom: 0 !important;
  width: 100%;
  max-width: 100% !important;
  background: linear-gradient(90deg, #7f1d1d, #dc2626, #ef4444) !important;
  transition: width .15s ease-out !important;
}

#monster-hp-text,
.stage-hp-text,
#monster-hp-bar .bar-text {
  position: absolute !important;
  inset: 0 !important;
  z-index: 2 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  color: #fff !important;
  font-size: 8px !important;
  line-height: 10px !important;
  text-shadow: 0 1px 2px #000 !important;
  pointer-events: none !important;
}

/* Placeholders */
.monster-placeholder,
.hero-placeholder {
  width: 140px;
  height: 150px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #fff;
  background: repeating-linear-gradient(45deg, #1f2937, #1f2937 10px, #374151 10px, #374151 20px);
  border: 2px dashed #f59e0b;
  border-radius: 10px;
}

.monster-placeholder-icon,
.hero-placeholder-icon {
  font-size: 42px;
}

.monster-placeholder-name,
.hero-placeholder-name {
  max-width: 130px;
  color: #fbbf24;
  font-size: 11px;
  text-align: center;
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAPA DE ZONAS
═══════════════════════════════════════════════════════════════════════════ */

.zone-map-root {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.saga-map-block {
  padding: 10px 10px 12px;
  border: 1px solid rgba(212, 175, 55, .18);
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(28, 34, 48, .72), rgba(16, 20, 30, .72));
}

.saga-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 4px 9px;
  margin-bottom: 9px;
  border-bottom: 1px solid rgba(212, 175, 55, .16);
}

.saga-title {
  color: #e8c37a;
  font-size: .86rem;
  font-weight: 700;
  letter-spacing: .04em;
}

.saga-req {
  padding: 2px 8px;
  color: #8b93a7;
  font-size: .68rem;
  border: 1px solid rgba(139, 147, 167, .28);
  border-radius: 999px;
}

.saga-zones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(158px, 1fr));
  gap: 10px;
}

.zone-card {
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: inherit;
  background: #131824;
  border: 1px solid rgba(212, 175, 55, .22);
  border-radius: 9px;
  cursor: pointer;
  transition: transform .16s, border-color .16s, box-shadow .16s;
}

.zone-card:hover:not(.locked):not(.active) {
  transform: translateY(-3px);
  border-color: rgba(232, 195, 122, .65);
  box-shadow: 0 6px 18px rgba(0, 0, 0, .5);
}

.zone-card.active {
  border-color: #e8c37a;
  box-shadow: 0 0 0 1px rgba(232, 195, 122, .45), 0 0 18px rgba(232, 195, 122, .18);
}

.zone-card.locked {
  opacity: .45;
  filter: grayscale(.85);
  cursor: not-allowed;
}

.zone-card-thumb {
  position: relative;
  height: 64px;
  background-color: #0d1018;
  background-position: center;
  background-size: cover;
}

.zone-card-thumb::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 35%, rgba(10, 13, 20, .92));
}

.zone-flag {
  position: absolute;
  top: 5px;
  z-index: 2;
  padding: 3px 6px;
  color: #fff;
  font-size: .6rem;
  line-height: 1;
  background: rgba(8, 10, 16, .82);
  border-radius: 999px;
}

.zone-flag.town {
  left: 5px;
  color: #7fd4a8;
  border: 1px solid rgba(127, 212, 168, .4);
}

.zone-flag.lock {
  right: 5px;
  color: #ff8080;
  border: 1px solid rgba(255, 128, 128, .4);
}

.zone-flag.here {
  right: 5px;
  color: #0d1018;
  font-weight: 800;
  background: #e8c37a;
}

.zone-card-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px;
}

.zone-card-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 6px;
}

.zone-card-title {
  color: #e6e9f2;
  font-size: .76rem;
  font-weight: 700;
  line-height: 1.15;
}

.zone-card-lvl {
  color: #e8c37a;
  font-size: .62rem;
  white-space: nowrap;
}

.zone-card-desc {
  color: #8b93a7;
  font-size: .62rem;
  line-height: 1.3;
}

.select-zone-btn {
  width: 100%;
  padding: 6px 8px;
  color: #e8c37a;
  font-family: inherit;
  font-size: .66rem;
  font-weight: 700;
  letter-spacing: .02em;
  background: rgba(212, 175, 55, .09);
  border: 1px solid rgba(212, 175, 55, .5);
  border-radius: 6px;
  cursor: pointer;
  transition: background .15s, color .15s;
}

.select-zone-btn:hover:not(:disabled) {
  color: #12161f;
  background: #e8c37a;
}

.select-zone-btn:disabled {
  color: #8b93a7;
  background: transparent;
  border-color: rgba(139, 147, 167, .3);
  cursor: default;
  opacity: .6;
}
`;
