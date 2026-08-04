/**
 * StageUI.js — Renderização do Palco Principal (Hero vs Monster) e Mapa de Zonas no Lineage Idle.
 *
 * Responsável por desenhar os sprites/ícones do herói e monstro, barras de vida (HP/MP),
 * alteração de cenários por zona e mapa visual de sagas e áreas de caça.
 */

import { ZONES, SAGAS, ZONE_BACKGROUNDS } from '../data/zones.js';
import { MONSTERS } from '../data/monsters.js';
import { RACES, CLASSES } from '../data/races.js';
import { el, qsa, updateBar } from '../core/DomHelpers.js';
import { getClass } from '../engine/StatsEngine.js';
import { heroSVG, monsterSVG } from '../../art.js';

/**
 * Atualiza os componentes visuais do Herói no palco (nível, nome, HP/MP bars, ilustração 3D).
 * @param {Object} state
 */
export function renderStageHero(state) {
  const heroNameEl = el('hero-name');
  if (heroNameEl) {
    const clsDef = getClass(state.class);
    const clsName = clsDef ? clsDef.name : (state.class || 'Aventureiro');
    heroNameEl.textContent = `${clsName} (Lv. ${state.level})`;
  }

  const heroContainer = el('stage-hero');
  if (heroContainer) {
    heroContainer.innerHTML = heroSVG(state.race || 'human', state.class || 'fighter');
  }

  updateBar('hero-hp-bar', state.hp, state.maxHp, 'hero-hp-text');
  updateBar('hero-mp-bar', state.mp, state.maxMp, 'hero-mp-text');
}

/**
 * Atualiza os componentes visuais do Monstro ativo no palco.
 * @param {Object} state
 */
export function renderStageMonster(state) {
  const m = state.activeMonster;
  if (!m) return;

  const mNameEl = el('monster-name');
  if (mNameEl) {
    const isBoss = m.boss || m.isTower;
    const tag = isBoss ? '👑 CHEFÃO' : (m.isElite ? '⚡ ÉLITE' : '');
    mNameEl.textContent = `${tag ? tag + ' · ' : ''}${m.name} (Nv. ${m.level || 1})`;
  }

  const maxHp = m._maxHp || m.maxHp || m.hp || 1;
  updateBar('monster-hp-bar', m.hp, maxHp, 'monster-hp-text');

  const spriteContainer = el('monster-sprite-container');
  if (spriteContainer) {
    spriteContainer.innerHTML = monsterSVG(m.id || m.itemId || m.name, { crown: m.boss || m.isTower });
  }
}


/**
 * Atualiza a interface da guia de Zonas de Caça.
 * @param {Object} state
 * @param {Object} [callbacks] — { selectZone }
 */
export function updateZoneUI(state, callbacks = {}) {
  const zoneNameEl = el('zone-name');
  if (zoneNameEl && state.zone && ZONES[state.zone]) {
    zoneNameEl.textContent = ZONES[state.zone].name;
  }

  renderZoneMap(state, callbacks);
}

/**
 * Renderiza os cards e mapas interativos de zonas por Saga.
 * @param {Object} state
 * @param {Object} [callbacks] — { selectZone }
 */
export function renderZoneMap(state, callbacks = {}) {
  const container = el('zone-map-container') || el('zone-list');
  if (!container) return;

  container.innerHTML = '';

  for (let sIdx = 0; sIdx <= (state.currentSaga || 0); sIdx++) {
    const saga = SAGAS[sIdx];
    if (!saga) continue;

    const sagaBlock = document.createElement('div');
    sagaBlock.className = 'saga-map-block';

    let cardsHtml = '';
    for (const zId of saga.zones) {
      const z = ZONES[zId];
      if (!z) continue;

      const isCurrent = state.zone === zId;
      const isLocked = state.level < z.level;

      cardsHtml += `
        <div class="zone-card ${isCurrent ? 'active' : ''} ${isLocked ? 'locked' : ''}" data-zone="${zId}">
          <div class="zone-card-header">
            <span class="zone-card-title">${z.name}</span>
            <span class="zone-card-lvl">Lv.${z.level}+</span>
          </div>
          <div class="zone-card-desc">${z.monsters ? z.monsters.length : 0} espécies de monstros</div>
          <button class="select-zone-btn" ${isLocked || isCurrent ? 'disabled' : ''}>
            ${isCurrent ? '★ Caçando Aqui' : (isLocked ? `🔒 Requer Lv.${z.level}` : 'Caçar nesta Área')}
          </button>
        </div>
      `;
    }

    sagaBlock.innerHTML = `
      <div class="saga-header">🗺️ ${saga.name} (Requer Lv. ${saga.unlocksAt}+)</div>
      <div class="saga-zones-grid">${cardsHtml}</div>
    `;

    sagaBlock.querySelectorAll('[data-zone]').forEach(card => {
      card.onclick = () => {
        const zId = card.dataset.zone;
        if (callbacks.selectZone) callbacks.selectZone(zId);
        else if (typeof window !== 'undefined' && typeof window.setZone === 'function') window.setZone(zId);
      };
    });

    container.appendChild(sagaBlock);
  }
}
