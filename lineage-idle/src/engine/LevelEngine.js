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
 * Curva calibrada milimetricamente para valorizar cada conquista:
 *   - Nível 1 ao 20: 6 horas de jogo (0.25 dias)
 *   - Nível 21 ao 40: 3 dias de jogo
 *   - Nível 41 ao 60: 7 dias de jogo
 *   - Nível 61 ao 75: 15 dias de jogo
 *   - Nível 76 ao 85: 20 dias de jogo
 *   - Nível 86 ao 100: ~35 dias de jogo
 *   - Nível 101 ao 120: Level Cap 120 Supremo
 * @param {number} lvl — Nível alvo
 * @returns {number}
 */
export function getXPForLevel(lvl) {
  if (lvl <= 1) return 150;
  if (lvl <= 20) {
    // Lv 1 ao 20: 6 horas de jogo
    return Math.floor(150 + Math.pow(lvl, 2.5) * 88);
  }
  if (lvl <= 40) {
    // Lv 21 ao 40: 3 dias de jogo
    return Math.floor(Math.pow(lvl, 2.72) * 550);
  }
  if (lvl <= 60) {
    // Lv 41 ao 60: 7 dias de jogo
    return Math.floor(Math.pow(lvl, 2.96) * 800);
  }
  if (lvl <= 75) {
    // Lv 61 ao 75: 15 dias de jogo
    return Math.floor(Math.pow(lvl, 3.20) * 1050);
  }
  if (lvl <= 85) {
    // Lv 76 ao 85: 20 dias de jogo
    return Math.floor(Math.pow(lvl, 3.42) * 1000);
  }
  if (lvl <= 100) {
    // Lv 86 ao 100: ~35 dias de jogo
    return Math.floor(Math.pow(lvl, 3.65) * 1200);
  }
  // Lv 101 ao 120: Level Cap 120 Supremo
  return Math.floor(Math.pow(lvl, 3.88) * 1800);
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
 * Calcula a quantidade nobre de SP concedida ao atingir o nível `lvl`.
 * @param {number} lvl
 * @returns {number}
 */
export function getSpRewardForLevel(lvl) {
  if (lvl <= 20) return Math.floor(8 + lvl * 0.5); // 9 a 18 SP
  if (lvl <= 40) return Math.floor(18 + (lvl - 20) * 1.35); // 19 a 45 SP
  if (lvl <= 60) return Math.floor(50 + (lvl - 40) * 2.5); // 52 a 100 SP
  if (lvl <= 75) return Math.floor(110 + (lvl - 60) * 4.6); // 114 a 179 SP
  if (lvl <= 85) return Math.floor(200 + (lvl - 75) * 15); // 215 a 350 SP
  if (lvl <= 100) return Math.floor(400 + (lvl - 85) * 13.3); // 413 a 600 SP
  return Math.floor(700 + (lvl - 100) * 15); // 715 a 1000 SP
}

/**
 * Calcula o SP acumulado concedido até o nível `lvl`.
 * @param {number} lvl
 * @returns {number}
 */
export function calcSpForLevel(lvl) {
  let total = 0;
  for (let l = 2; l <= lvl; l++) {
    total += getSpRewardForLevel(l);
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
    const spReward = getSpRewardForLevel(state.level);
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
