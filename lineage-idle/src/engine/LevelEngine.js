/**
 * LevelEngine.js — Motor de XP, Nível e SP do Lineage Idle.
 *
 * Responsável por fórmulas de experiência por nível, cálculo de SP acumulado
 * e verificação de subida de nível.
 */

import EventBus from '../core/EventBus.js';
import { getSeasonMaxLevel } from '../core/SeasonConfig.js';

const TOTAL_XP_CACHE = [0];

/**
 * Calcula a XP necessária para subir do nível `lvl - 1` para `lvl`.
 * @param {number} lvl — Nível alvo
 * @returns {number}
 */
export function getXPForLevel(lvl) {
  if (lvl <= 1) return 100;
  return Math.floor(100 + Math.pow(lvl, 2.45) * 55);
}

/**
 * Calcula a XP total acumulada necessária para atingir o nível `lvl`.
 * Utiliza cache O(1) para evitar laços pesados durante verificações.
 * @param {number} lvl — Nível atingido
 * @returns {number}
 */
export function getTotalXP(lvl) {
  const target = Math.max(1, parseInt(lvl, 10) || 1);
  while (TOTAL_XP_CACHE.length <= target + 1) {
    const nextLvl = TOTAL_XP_CACHE.length;
    TOTAL_XP_CACHE.push(TOTAL_XP_CACHE[nextLvl - 1] + getXPForLevel(nextLvl));
  }
  return TOTAL_XP_CACHE[target];
}

/**
 * Calcula o SP acumulado concedido até o nível `lvl`.
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
 * @param {Object} [callbacks] — Handlers legados opcionais
 */
export function checkLevelUp(state, callbacks = {}) {
  if (!state) return false;
  let leveledUp = false;
  const initialLevel = state.level || 1;
  const MAX_LEVEL = getSeasonMaxLevel();
  let totalSpReward = 0;

  // Processa subida de níveis respeitando o teto da temporada
  while ((state.level || 1) < MAX_LEVEL && (state.xp || 0) >= getTotalXP(state.level || 1)) {
    state.level = (state.level || 1) + 1;
    leveledUp = true;
    const spReward = Math.max(1, Math.floor(state.level * 0.15 + 1));
    totalSpReward += spReward;
    state.sp = (state.sp || 0) + spReward;
  }

  // Executa os callbacks de interface e salvar apenas UMA vez por lote
  if (leveledUp) {
    if (typeof callbacks.getStats === 'function') {
      const stats = callbacks.getStats();
      if (stats) {
        state.maxHp = stats.maxHp || state.maxHp;
        state.maxMp = stats.maxMp || state.maxMp;
        state.hp = state.maxHp;
        state.mp = state.maxMp;
      }
    }

    EventBus.emit('levelUp', { level: state.level, spReward: totalSpReward });

    if (typeof callbacks.playSfx === 'function') callbacks.playSfx('levelUp');
    
    if (typeof callbacks.log === 'function') {
      const levelGained = state.level - initialLevel;
      if (levelGained > 1) {
        callbacks.log(`🎉 MULTI LEVEL UP! Nível ${state.level} Alcançado (+${levelGained} Níveis, +${totalSpReward} SP)!`, 'rarity-legendary');
      } else {
        callbacks.log(`🎉 LEVEL UP! Nível ${state.level} Alcançado! (+${totalSpReward} SP)`, 'rarity-legendary');
      }
    }
    
    if (typeof callbacks.floatText === 'function') {
      callbacks.floatText(`🎉 LEVEL UP! Nível ${state.level}`, 'float-jackpot');
    }
    
    if (typeof callbacks.updateSagaProgress === 'function') callbacks.updateSagaProgress(false);
    if (typeof callbacks.checkClassAdvancement === 'function') callbacks.checkClassAdvancement();
    if (typeof callbacks.updateSkillUI === 'function') callbacks.updateSkillUI();
    if (typeof callbacks.updateRaceClassUI === 'function') callbacks.updateRaceClassUI();
    if (typeof callbacks.updateAllUI === 'function') callbacks.updateAllUI();
    if (typeof callbacks.save === 'function') callbacks.save();
  }

  return leveledUp;
}
