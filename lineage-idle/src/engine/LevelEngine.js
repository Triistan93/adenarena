/**
 * LevelEngine.js — Motor de XP, Nível e SP do Lineage Idle.
 *
 * Responsável por fórmulas de experiência por nível, cálculo de SP acumulado
 * e verificação de subida de nível.
 */

import EventBus from '../core/EventBus.js';

/**
 * Calcula a XP necessária para subir do nível `lvl - 1` para `lvl`.
 * @param {number} lvl — Nível alvo
 * @returns {number}
 */
export function getXPForLevel(lvl) {
  return Math.floor(100 * Math.pow(1.8, lvl - 1));
}

/**
 * Calcula a XP total acumulada necessária para atingir o nível `lvl`.
 * @param {number} lvl — Nível atingido
 * @returns {number}
 */
export function getTotalXP(lvl) {
  let total = 0;
  for (let i = 1; i <= lvl; i++) {
    total += getXPForLevel(i);
  }
  return total;
}

/**
 * Calcula o SP acumulado concedido até o nível `lvl`.
 * Cada nível a partir do 2 concede Math.min(10, Math.floor(lvl * 0.8 + 1)) SP.
 * @param {number} lvl
 * @returns {number}
 */
export function calcSpForLevel(lvl) {
  let total = 0;
  for (let l = 2; l <= lvl; l++) {
    total += Math.min(10, Math.floor(l * 0.8 + 1));
  }
  return total;
}

/**
 * Verifica se a XP atual do personagem autoriza subir um ou mais níveis.
 * Dispara eventos de Level Up para que UI e som respondam.
 * @param {Object} state — Estado mutável do jogo
 * @param {Object} [callbacks] — Handlers legados opcionais { getStats, playSfx, log, floatText, updateSagaProgress, updateAllUI, save }
 */
export function checkLevelUp(state, callbacks = {}) {
  let leveledUp = false;

  while (state.xp >= getTotalXP(state.level)) {
    state.level++;
    leveledUp = true;

    // Se a função getStats foi fornecida, atualiza HP/MP para os novos máximos
    if (typeof callbacks.getStats === 'function') {
      const stats = callbacks.getStats();
      state.maxHp = stats.maxHp;
      state.maxMp = stats.maxMp;
      state.hp = state.maxHp;
      state.mp = state.maxMp;
    }

    const spReward = Math.min(10, Math.floor(state.level * 0.8 + 1));
    state.sp += spReward;

    // Dispara via EventBus para decoupled listeners
    EventBus.emit('levelUp', { level: state.level, spReward });

    // Fallbacks legados se passados
    if (typeof callbacks.playSfx === 'function') callbacks.playSfx('levelUp');
    if (typeof callbacks.log === 'function') {
      callbacks.log(`🎉 LEVEL UP! Nível ${state.level} Alcançado! (+${spReward} SP)`, 'rarity-legendary');
    }
    if (typeof callbacks.floatText === 'function') {
      callbacks.floatText(`🎉 LEVEL UP! Nível ${state.level}`, 'float-jackpot');
    }
    if (typeof callbacks.updateSagaProgress === 'function') callbacks.updateSagaProgress(false);
  }

  if (leveledUp) {
    if (typeof callbacks.updateAllUI === 'function') callbacks.updateAllUI();
    if (typeof callbacks.save === 'function') callbacks.save();
  }

  return leveledUp;
}
