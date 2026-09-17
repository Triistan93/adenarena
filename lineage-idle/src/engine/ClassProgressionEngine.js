/**
 * ClassProgressionEngine.js — Pure Class Advancement & Promotion Engine
 * 
 * Implements strict, multi-layer promotion validation:
 * VALID CLASS TRANSFER = Graph Relationship + Level Rule + Race Rule + Progression Rule + Season Rule
 */

import { CanonicalClassGraph } from '../data/classes/CanonicalClassGraph.js';
import { SeasonAvailabilityService } from '../services/SeasonAvailabilityService.js';
import EventBus from '../core/EventBus.js';

export class ClassProgressionEngine {
  /**
   * Evaluates all structural successors in the DAG and determines their promotion status.
   * Distinguishes between Graph Edge existence and Valid Class Transfer.
   * 
   * @param {string} currentClassId
   * @param {number} playerLevel
   * @param {string} [playerRace]
   * @param {number} [season=1]
   * @returns {Array<{
   *   targetClass: Object,
   *   isEligible: boolean,
   *   reasons: string[],
   *   stage: number,
   *   minLevel: number,
   *   isSeasonGated: boolean
   * }>}
   */
  static getPromotionOptions(currentClassId, playerLevel, playerRace = null, season = SeasonAvailabilityService.CURRENT_SEASON) {
    const currentNode = CanonicalClassGraph.getClassNode(currentClassId);
    if (!currentNode) return [];

    const successors = CanonicalClassGraph.getSuccessors(currentClassId);

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
      const seasonCheck = SeasonAvailabilityService.getClassAvailability(targetNode.id, season);
      const isSeasonGated = !seasonCheck.available;
      if (isSeasonGated) {
        isEligible = false;
        reasons.push(`Bloqueado na Temporada ${season}: Disponível em temporadas futuras (Nível 76+).`);
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
   * @returns {Array<Object>}
   */
  static getAvailablePromotions(currentClassId, playerLevel, playerRace = null) {
    const options = ClassProgressionEngine.getPromotionOptions(currentClassId, playerLevel, playerRace);
    return options.filter(opt => opt.isEligible).map(opt => opt.targetClass);
  }

  /**
   * Strictly validates whether a character can transfer to targetClassId right now.
   * @param {string} currentClassId
   * @param {string} targetClassId
   * @param {number} playerLevel
   * @param {string} [playerRace]
   * @returns {{ canPromote: boolean, reason: string|null }}
   */
  static canPromote(currentClassId, targetClassId, playerLevel, playerRace = null) {
    const options = ClassProgressionEngine.getPromotionOptions(currentClassId, playerLevel, playerRace);
    const targetOption = options.find(opt => opt.targetClass.id === targetClassId);

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
   * @returns {boolean}
   */
  static executeClassTransfer(state, targetClassId) {
    if (!state) return false;
    const currentClass = state.class;
    const level = state.level || 1;
    const race = state.race;

    const check = ClassProgressionEngine.canPromote(currentClass, targetClassId, level, race);
    if (!check.canPromote) {
      console.warn(`[ClassProgressionEngine] Falha ao avançar classe: ${check.reason}`);
      return false;
    }

    const targetNode = CanonicalClassGraph.getClassNode(targetClassId);
    const prevClass = state.class;
    state.class = targetNode.id;

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
