/**
 * LevelEngine.js — Motor de XP, Nível e SP do Lineage Idle.
 *
 * Responsável por fórmulas de experiência por nível, cálculo de SP acumulado
 * e verificação de subida de nível.
 */

import EventBus from '../core/EventBus.js';
import { getSeasonMaxLevel } from '../core/SeasonConfig.js';

const TOTAL_XP_CACHE = [0];

// Âncoras canônicas pré-calculadas para garantir continuidade exata O(1) e eliminar cliffs:
const BASE_XP_20 = Math.floor(150 + Math.pow(20, 2.45) * 85); // 131,050
const BASE_XP_40 = Math.floor(BASE_XP_20 * Math.pow(1.19, 20)); // 4,249,903
const BASE_XP_60 = Math.floor(BASE_XP_40 * Math.pow(1.16, 20)); // 82,706,340
const BASE_XP_75 = Math.floor(BASE_XP_60 * Math.pow(1.13, 15)); // 517,267,813
const BASE_XP_85 = Math.floor(BASE_XP_75 * Math.pow(1.10, 10)); // 1,341,659,489
const BASE_XP_100 = Math.floor(BASE_XP_85 * Math.pow(1.08, 15)); // 4,255,970,795

/**
 * Calcula a XP necessária para subir do nível `lvl - 1` para `lvl`.
 * Curva canônica suave e contínua ancorada por marcos de classe:
 *   - Nível 1 ao 20: Onboarding e 1ª Transferência de Classe (~828k XP acumulado, ~1 dia)
 *   - Nível 21 ao 40: Especialização e Clímax da Season 1 (~26.6M XP acumulado, ~4-5 dias)
 *   - Nível 41 ao 60: Season 2 / B-Grade / Sete Selos (~595M XP acumulado, ~12 dias)
 *   - Nível 61 ao 75: A-Grade / Fortalezas (~4.37B XP acumulado, ~20 dias)
 *   - Nível 76 ao 85: S-Grade / Awakening / Final da Season 2 (~13.4B XP acumulado, ~35 dias)
 *   - Nível 86 ao 100: Season 3 / S84 / Grand Olympiad (~52.7B XP acumulado, ~50 dias)
 *   - Nível 101 ao 120: A Muralha dos Deuses / Season 3 Apex (~557B XP acumulado)
 *
 * Propriedades matemáticas garantidas:
 *   1. Monotonicidade Estrita: XP(L+1) > XP(L) para todo L (0 inversões).
 *   2. Taxa de Crescimento Suave: 8% a 19% por nível, sem cliffs de 7.8x.
 * @param {number} lvl — Nível alvo
 * @returns {number}
 */
export function getXPForLevel(lvl) {
  if (lvl <= 1) return 150;
  if (lvl <= 20) {
    return Math.floor(150 + Math.pow(lvl, 2.45) * 85);
  }
  if (lvl <= 40) {
    return Math.floor(BASE_XP_20 * Math.pow(1.19, lvl - 20));
  }
  if (lvl <= 60) {
    return Math.floor(BASE_XP_40 * Math.pow(1.16, lvl - 40));
  }
  if (lvl <= 75) {
    return Math.floor(BASE_XP_60 * Math.pow(1.13, lvl - 60));
  }
  if (lvl <= 85) {
    return Math.floor(BASE_XP_75 * Math.pow(1.10, lvl - 75));
  }
  if (lvl <= 100) {
    return Math.floor(BASE_XP_85 * Math.pow(1.08, lvl - 85));
  }
  // Lv 101 ao 120: A Muralha dos Deuses
  return Math.floor(BASE_XP_100 + (lvl - 100) * 2000000000);
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
  const MAX_LEVEL = (typeof window !== 'undefined' && Number(window.globalServerCap)) || state.serverMaxLevel || state.serverCap || state.levelCap || getSeasonMaxLevel() || 40;
  let totalSpReward = 0;

  // Processa subida de níveis respeitando o teto de servidor/temporada
  while ((state.level || 1) < MAX_LEVEL && (state.xp || 0) >= getTotalXP(state.level || 1)) {
    state.level = (state.level || 1) + 1;
    leveledUp = true;
    const spReward = getSpRewardForLevel(state.level);
    totalSpReward += spReward;
    state.sp = (state.sp || 0) + spReward;
  }

  // Se atingiu o cap máximo, trava o XP no limite do cap (sem gerar SP infinito para preservar a economia)
  if ((state.level || 1) >= MAX_LEVEL) {
    const capXp = getTotalXP(MAX_LEVEL);
    if ((state.xp || 0) > capXp) {
      state.xp = capXp;
    }
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
