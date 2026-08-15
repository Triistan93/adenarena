/**
 * NoblesseService.js — Gerenciamento da Questline de Noblesse (Possessor of a Precious Soul).
 *
 * Responsável por:
 * 1. Controle das 4 etapas canônicas da saga de Noblesse (Lv. 75+).
 * 2. Rastreamento de abates em Valley of Saints, Swamp of Screams e confronto contra Barakiel.
 * 3. Consagração como Noblesse (`state.isNoblesse = true`).
 * 4. Entrega da Noblesse Tiara e validação do requisito Nível 76+ Noblesse para a Grand Olympiad.
 */

import { NOBLESSE_QUEST_DEFS } from '../data/quests.js';

export class NoblesseService {
  /**
   * Retorna o status de nobreza e progresso atual da questline do jogador.
   * @param {Object} state
   * @returns {{isNoblesse: boolean, currentStep: number, progress: Object, canJoinOlympiad: boolean, reason?: string}}
   */
  static getNoblesseStatus(state) {
    if (!state) return { isNoblesse: false, currentStep: 1, progress: {}, canJoinOlympiad: false };

    const isNoblesse = Boolean(state.isNoblesse);
    const currentStep = state.noblesseStep || 1;
    const progress = state.noblesseProgress || { part1Kills: 0, part2Kills: 0, barakielKilled: false };

    const level = state.level || 1;
    const isLevelOk = level >= 76;

    let reason = '';
    if (!isNoblesse && !isLevelOk) reason = 'Requer Nível 76+ e Conclusão da Quest de Noblesse.';
    else if (!isNoblesse) reason = 'Requer Conclusão da Saga de Noblesse (Possessor of a Precious Soul).';
    else if (!isLevelOk) reason = 'Requer Nível 76+ para adentrar na Grand Olympiad.';

    return {
      isNoblesse,
      currentStep,
      progress,
      canJoinOlympiad: isNoblesse && isLevelOk,
      reason
    };
  }

  /**
   * Valida se o herói pode iniciar/avançar uma determinada etapa da saga de Noblesse.
   * @param {Object} state
   * @param {number} step
   * @returns {{ok: boolean, reason?: string}}
   */
  static canAdvanceStep(state, step) {
    const level = state.level || 1;
    if (level < 75) {
      return { ok: false, reason: 'Requer Nível 75+ para realizar a Quest de Noblesse.' };
    }

    const currentStep = state.noblesseStep || 1;
    if (state.isNoblesse) {
      return { ok: false, reason: 'Você já alcançou o status supremo de Noblesse!' };
    }

    if (step > currentStep) {
      return { ok: false, reason: `Conclua a Parte ${currentStep} antes de avançar para a Parte ${step}.` };
    }

    const prog = state.noblesseProgress || {};
    if (step === 1 && (prog.part1Kills || 0) < 25) {
      return { ok: false, reason: `Derrote 25 monstros em Valley of Saints (${prog.part1Kills || 0}/25).` };
    }
    if (step === 2 && (prog.part2Kills || 0) < 30) {
      return { ok: false, reason: `Purifique 30 espíritos em Swamp of Screams (${prog.part2Kills || 0}/30).` };
    }
    if (step === 3 && !prog.barakielKilled) {
      return { ok: false, reason: 'Derrote o Raid Boss Flame of Splendor Barakiel para recuperar o cajado da Deusa!' };
    }

    return { ok: true };
  }

  /**
   * Registra abates de monstros de caça ou bosses nas zonas de quest.
   * @param {Object} state
   * @param {Object} monster
   * @param {Object} callbacks
   */
  static recordKill(state, monster, callbacks = {}) {
    if (!state || state.isNoblesse) return;
    state.noblesseProgress = state.noblesseProgress || { part1Kills: 0, part2Kills: 0, barakielKilled: false };
    const step = state.noblesseStep || 1;

    // Parte 1: Valley of Saints
    if (step === 1 && state.zone === 'valleyOfSaints') {
      if (state.noblesseProgress.part1Kills < 25) {
        state.noblesseProgress.part1Kills++;
        if (callbacks.log && state.noblesseProgress.part1Kills % 5 === 0) {
          callbacks.log(`📜 [Noblesse] Páginas do Poema de Eva recuperadas: ${state.noblesseProgress.part1Kills}/25`, 'system');
        }
      }
    }
    // Parte 2: Swamp of Screams
    else if (step === 2 && state.zone === 'swampOfScreams') {
      if (state.noblesseProgress.part2Kills < 30) {
        state.noblesseProgress.part2Kills++;
        if (callbacks.log && state.noblesseProgress.part2Kills % 5 === 0) {
          callbacks.log(`🔮 [Noblesse] Almas purificadas em Swamp of Screams: ${state.noblesseProgress.part2Kills}/30`, 'system');
        }
      }
    }
    // Parte 3: Barakiel
    else if (step === 3 && (monster.id === 'barakiel' || monster.name?.toLowerCase().includes('barakiel') || monster.isBarakiel)) {
      state.noblesseProgress.barakielKilled = true;
      if (callbacks.log) {
        callbacks.log('⚡ [Noblesse] **Flame of Splendor Barakiel Derrotado!** Você recuperou o [Staff of Goddess: Rain Song]!', 'rarity-legendary');
      }
    }
  }

  /**
   * Conclui a etapa atual e entrega as recompensas de XP/SP e status.
   * @param {Object} state
   * @param {number} step
   * @param {Object} callbacks
   * @returns {boolean}
   */
  static completeStep(state, step, callbacks = {}) {
    const check = this.canAdvanceStep(state, step);
    if (!check.ok) {
      if (callbacks.log) callbacks.log(`❌ ${check.reason}`, 'system');
      return false;
    }

    const questKey = `part${step}`;
    const def = NOBLESSE_QUEST_DEFS[questKey];
    if (!def) return false;

    // Entrega recompensas da etapa
    if (def.reward) {
      if (def.reward.xp) state.xp = (state.xp || 0) + def.reward.xp;
      if (def.reward.sp) state.sp = (state.sp || 0) + def.reward.sp;
      if (def.reward.gold) state.gold = (state.gold || 0) + def.reward.gold;
    }

    if (step < 4) {
      state.noblesseStep = step + 1;
      if (callbacks.log) {
        callbacks.log(`🎉 **${def.name} Concluída!** Avançou para a Parte ${state.noblesseStep}!`, 'rarity-epic');
      }
    } else {
      // Conclusão Final: Consagração como Noblesse!
      state.noblesseStep = 5;
      state.isNoblesse = true;

      // Entrega a Noblesse Tiara
      state.inventory = state.inventory || [];
      const uid = 'tiara_' + Date.now();
      state.inventory.push({
        uid,
        itemId: 'accessory_noblesse_tiara',
        enchant: 0,
        count: 1
      });

      // Concede Habilidade Blessing of Noble
      state.skills = state.skills || {};
      state.skills['blessing_of_noble'] = 1;

      if (callbacks.log) {
        callbacks.log('👑✨ **CONSAGRAÇÃO SAGRADA DE NOBLESSE!**', 'rarity-legendary');
        callbacks.log('Você completou a lendária saga *Possessor of a Precious Soul*, recebeu a **Noblesse Tiara**, a bênção **Blessing of Noble** e obteve permissão para adentrar na **Grand Olympiad (Lv. 76+)**!', 'rarity-legendary');
      }
    }

    if (callbacks.onUpdate) callbacks.onUpdate();
    return true;
  }
}
