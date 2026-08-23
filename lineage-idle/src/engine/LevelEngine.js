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
 * Curva calibrada para exigir ~15 dias de jogo contínuo/idle até o Level Cap (Lv 85+).
 * @param {number} lvl — Nível alvo
 * @returns {number}
 */
export function getXPForLevel(lvl) {
  if (lvl <= 1) return 100;
  if (lvl <= 20) {
    // 1-20: Progressão inicial fluida (~2h de jogo)
    return Math.floor(100 + Math.pow(lvl, 2.3) * 50);
  }
  if (lvl <= 40) {
    // 20-40: 1ª Transferência de Classe (~1 dia de jogo)
    return Math.floor(Math.pow(lvl, 2.6) * 110);
  }
  if (lvl <= 60) {
    // 40-60: 2ª Transferência de Classe (~4 dias de jogo)
    return Math.floor(Math.pow(lvl, 2.92) * 180);
  }
  if (lvl <= 75) {
    // 60-75: Transição A-Grade / Nobreza (~8-9 dias de jogo)
    return Math.floor(Math.pow(lvl, 3.22) * 260);
  }
  // 76 a 85+: Endgame hardcore S-Grade / 3ª Classe (~15 a 20 dias de jogo)
  return Math.floor(Math.pow(lvl, 3.65) * 380);
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
  if (lvl <= 40) return Math.floor(15 + (lvl - 20) * 1.25); // 16 a 40 SP
  if (lvl <= 75) return Math.floor(40 + (lvl - 40) * 2.2); // 42 a 117 SP
  return Math.floor(120 + (lvl - 75) * 18); // 138 a 300 SP
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
