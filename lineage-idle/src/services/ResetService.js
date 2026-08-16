/**
 * ResetService.js — Sistema de Resets (Rebirth / Transcrescência de Nível Máximo).
 *
 * Ao atingir o nível máximo (Lv. 85+), o personagem pode realizar o Reset:
 * - Retorna para o Nível 1 com 0 XP.
 * - Concede +60 Pontos de Atributos Persistentes (Permanentes).
 * - Incrementa o contador de resets (`resetsCount`).
 * - Preserva todo o inventário, forja, skills aprendidas e equipamentos.
 */

export class ResetService {
  static MAX_LEVEL_REQ = 85;
  static BONUS_POINTS_PER_RESET = 60;

  /**
   * Valida se o personagem pode realizar o Reset.
   * @param {Object} characterState
   * @returns {{ canReset: boolean, error?: string }}
   */
  static canPerformReset(characterState) {
    const level = characterState.level || 1;
    if (level < this.MAX_LEVEL_REQ) {
      return {
        canReset: false,
        error: `Você precisa atingir o Nível Máximo (${this.MAX_LEVEL_REQ}) para transcender e resetar.`
      };
    }
    return { canReset: true };
  }

  /**
   * Executa a transmutação de Reset.
   * @param {Object} characterState
   * @param {Object} hooks
   * @returns {{ success: boolean, resetsCount: number, bonusPoints: number }}
   */
  static executeReset(characterState, hooks = {}) {
    const check = this.canPerformReset(characterState);
    if (!check.canReset) {
      return { success: false, message: check.error };
    }

    characterState.level = 1;
    characterState.xp = 0;
    characterState.resetsCount = (characterState.resetsCount || 0) + 1;
    characterState.bonusStatPoints = (characterState.bonusStatPoints || 0) + this.BONUS_POINTS_PER_RESET;
    characterState.statPoints = (characterState.statPoints || 0) + this.BONUS_POINTS_PER_RESET;

    hooks.log?.(
      `🌌 **TRANSCENDÊNCIA CONCLUÍDA!** O herói retornou ao Nível 1 com +${this.BONUS_POINTS_PER_RESET} Pontos de Atributos Permanentes! (Reset #${characterState.resetsCount})`,
      'victory'
    );
    hooks.onUpdate?.();

    return {
      success: true,
      resetsCount: characterState.resetsCount,
      bonusPoints: characterState.bonusStatPoints
    };
  }
}
