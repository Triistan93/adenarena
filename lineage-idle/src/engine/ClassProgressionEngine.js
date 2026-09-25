/**
 * ClassProgressionEngine.js — Pure Class Advancement & Promotion Engine
 * 
 * Implements strict, multi-layer promotion validation:
 * VALID CLASS TRANSFER = Graph Relationship + Level Rule + Race Rule + Progression Rule + Season Rule
 */

import { CanonicalClassGraph } from '../data/classes/CanonicalClassGraph.js';
import { SeasonAvailabilityService } from '../services/SeasonAvailabilityService.js';
import { resolveCanonicalClassId, resolveCanonicalDagClassId } from '../data/classes/class_aliases.js';
import { RACES } from '../data/races.js';
import { getStats, getClass } from './StatsEngine.js';
import EventBus from '../core/EventBus.js';

export class ClassProgressionEngine {
  /**
   * Evaluates all structural successors in the DAG and determines their promotion status.
   * Distinguishes between Graph Edge existence and Valid Class Transfer.
   * 
   * @param {string} currentClassId
   * @param {number} playerLevel
   * @param {string} [playerRace]
   * @param {number|null} [season=null]
   * @returns {Array<{
   *   targetClass: Object,
   *   isEligible: boolean,
   *   reasons: string[],
   *   stage: number,
   *   minLevel: number,
   *   isSeasonGated: boolean
   * }>}
   */
  static getPromotionOptions(currentClassId, playerLevel, playerRace = null, season = null) {
    let currentNode = CanonicalClassGraph.getClassNode(currentClassId);
    let resolvedId = currentClassId;

    if (!currentNode) {
      const dagId = resolveCanonicalDagClassId(currentClassId, playerRace);
      if (dagId) {
        currentNode = CanonicalClassGraph.getClassNode(dagId);
        if (currentNode) resolvedId = dagId;
      }
    }
    if (!currentNode) {
      const canonId = resolveCanonicalClassId(currentClassId, playerRace);
      if (canonId) {
        currentNode = CanonicalClassGraph.getClassNode(canonId);
        if (currentNode) resolvedId = canonId;
      }
    }
    if (!currentNode) return [];

    const effectiveSeason = (season !== null && season !== undefined)
      ? season
      : (playerLevel >= 76 ? 3 : SeasonAvailabilityService.CURRENT_SEASON);

    const successors = CanonicalClassGraph.getSuccessors(resolvedId);

    return successors.map(targetNode => {
      const reasons = [];
      let isEligible = true;

      // 1. Level Rule
      if (playerLevel < targetNode.minLevel) {
        isEligible = false;
        reasons.push(`Nível insuficiente. Requer nível ${targetNode.minLevel} (atual: ${playerLevel}).`);
      }

      // 2. Race Rule
      const effectiveRace = playerRace || currentNode.race;
      if (effectiveRace && targetNode.race !== effectiveRace) {
        isEligible = false;
        reasons.push(`Restrição de raça. Classe pertence a ${targetNode.race}.`);
      }

      // 3. Season Rule
      const seasonCheck = SeasonAvailabilityService.getClassAvailability(targetNode.id, effectiveSeason);
      const isSeasonGated = !seasonCheck.available;
      if (isSeasonGated) {
        isEligible = false;
        reasons.push(`Bloqueado na Temporada ${effectiveSeason}: Disponível em temporadas futuras (Nível 76+).`);
      }

      return {
        targetClass: targetNode,
        isEligible,
        reasons,
        stage: targetNode.stage,
        minLevel: targetNode.minLevel,
        isSeasonGated
      };
    });
  }

  /**
   * Returns only immediately available promotions that can be taken right now.
   * @param {string} currentClassId
   * @param {number} playerLevel
   * @param {string} [playerRace]
   * @param {number|null} [season=null]
   * @returns {Array<Object>}
   */
  static getAvailablePromotions(currentClassId, playerLevel, playerRace = null, season = null) {
    const options = ClassProgressionEngine.getPromotionOptions(currentClassId, playerLevel, playerRace, season);
    return options.filter(opt => opt.isEligible).map(opt => opt.targetClass);
  }

  /**
   * Strictly validates whether a character can transfer to targetClassId right now.
   * @param {string} currentClassId
   * @param {string} targetClassId
   * @param {number} playerLevel
   * @param {string} [playerRace]
   * @param {number|null} [season=null]
   * @returns {{ canPromote: boolean, reason: string|null }}
   */
  static canPromote(currentClassId, targetClassId, playerLevel, playerRace = null, season = null) {
    const options = ClassProgressionEngine.getPromotionOptions(currentClassId, playerLevel, playerRace, season);
    const targetCanon = resolveCanonicalDagClassId(targetClassId, playerRace) || resolveCanonicalClassId(targetClassId, playerRace) || targetClassId;
    const targetOption = options.find(opt => opt.targetClass.id === targetClassId || opt.targetClass.id === targetCanon || resolveCanonicalDagClassId(opt.targetClass.id, playerRace) === targetCanon);

    if (!targetOption) {
      return { canPromote: false, reason: 'Classe alvo não é sucessora direta no grafo canônico.' };
    }

    if (!targetOption.isEligible) {
      return { canPromote: false, reason: targetOption.reasons.join(' ') };
    }

    return { canPromote: true, reason: null };
  }

  /**
   * Executes class transfer on character state.
   * @param {Object} state
   * @param {string} targetClassId
   * @param {number|null} [season=null]
   * @returns {boolean}
   */
  static executeClassTransfer(state, targetClassId, season = null) {
    if (!state) return false;
    const currentClass = state.character?.classId || state.class;
    const level = state.level || 1;
    const race = state.race || state.character?.race;

    // Idempotência estrita: se já transferido para esta classe alvo
    const targetCanon = resolveCanonicalDagClassId(targetClassId, race) || resolveCanonicalClassId(targetClassId, race) || targetClassId;
    if ((state.class === targetClassId || state.class === targetCanon) &&
        (state.character?.classId === targetClassId || state.character?.classId === targetCanon)) {
      return true;
    }

    const check = ClassProgressionEngine.canPromote(currentClass, targetClassId, level, race, season);
    if (!check.canPromote) {
      console.warn(`[ClassProgressionEngine] Falha ao avançar classe: ${check.reason}`);
      return false;
    }

    const targetNode = CanonicalClassGraph.getClassNode(targetClassId) ||
                       CanonicalClassGraph.getClassNode(targetCanon);
    if (!targetNode) return false;

    const prevClass = state.class;
    state.class = targetNode.id;
    state.className = targetNode.name;
    state.character = state.character || {};
    state.character.classId = targetNode.id;
    state.character.className = targetNode.name;

    // Atualiza atributos base de raça e classe
    const newClassDef = getClass(targetNode.id) || getClass(targetCanon) || targetNode;
    const racesDict = (typeof window !== 'undefined' && window.EchoData?.RACES_ECHO)
      ? window.EchoData.RACES_ECHO
      : RACES;
    const raceDef = (typeof racesDict === 'object' && racesDict) ? (racesDict[race] || racesDict[state.race]) : null;
    state.base = { atk: 0, def: 0, eva: 0, matk: 0, mdef: 0 };
    for (const k of ['atk', 'def', 'eva', 'matk', 'mdef']) {
      state.base[k] = (raceDef?.stats?.[k] || 0) + (newClassDef.base?.[k] || newClassDef.baseStats?.[k] || 0);
    }

    // Recalcular status via StatsEngine
    try {
      const stats = getStats(state);
      state.stats = state.stats || {};
      state.maxHp = stats.maxHp;
      state.maxMp = stats.maxMp;
      state.hp = Math.min(state.hp || state.maxHp, state.maxHp);
      state.mp = Math.min(state.mp || state.maxMp, state.maxMp);
    } catch (e) {
      console.warn('[ClassProgressionEngine] Erro ao recalcular status:', e);
    }

    // Dispara evento desacoplado para UI e sistemas ouvintes
    EventBus.emit('classTransferred', {
      previousClass: prevClass,
      newClass: targetNode.id,
      stage: targetNode.stage,
      classNode: targetNode
    });

    return true;
  }
}

export default ClassProgressionEngine;
