/**
 * RewardEngine.js — Motor Centralizado de Recompensas de Life Activities.
 * 
 * Centraliza cálculos de chance, rendimento, qualidade, tamanho, bônus de ferramentas,
 * bônus de consumíveis, proteção contra streaks de azar (pity) e resolução determinística.
 */

import { resolveCanonicalResourceId } from './ResourceDictionary.js';

export const QUALITY_TIERS = {
  POOR: { id: 'poor', name: 'Inferior', mult: 0.7, color: '#94a3b8' },
  NORMAL: { id: 'normal', name: 'Comum', mult: 1.0, color: '#e2e8f0' },
  GOOD: { id: 'good', name: 'Boa Qualidade', mult: 1.3, color: '#60a5fa' },
  EXCELLENT: { id: 'excellent', name: 'Excelente', mult: 1.6, color: '#a855f7' },
  PERFECT: { id: 'perfect', name: 'Impecável / Perfeita', mult: 2.0, color: '#fbbf24' }
};

export const FISH_SIZES = {
  TINY: { id: 'tiny', name: 'Diminuto', weightMult: 0.6, valueMult: 0.7 },
  SMALL: { id: 'small', name: 'Pequeno', weightMult: 0.8, valueMult: 0.85 },
  MEDIUM: { id: 'medium', name: 'Médio', weightMult: 1.0, valueMult: 1.0 },
  LARGE: { id: 'large', name: 'Grande', weightMult: 1.3, valueMult: 1.4 },
  HUGE: { id: 'huge', name: 'Enorme', weightMult: 1.7, valueMult: 1.9 },
  RECORD: { id: 'record', name: 'Troféu Recorde 🏆', weightMult: 2.2, valueMult: 2.8 }
};

export const RewardEngine = {
  /**
   * Calcula a chance final de sucesso considerando ferramenta, maestria e consumível.
   */
  calculateSuccessChance(baseChance = 0.75, toolBonus = 0, masteryLevel = 1, consumableBonus = 0) {
    const masteryBonus = Math.min(0.25, (masteryLevel - 1) * 0.006); // até +24% no Lv 40
    const rawChance = baseChance * (1 + toolBonus + masteryBonus + consumableBonus);
    return Math.max(0.15, Math.min(0.98, rawChance));
  },

  /**
   * Rola a qualidade do drop (Poor a Perfect) com base na maestria e bônus.
   */
  rollQuality(masteryLevel = 1, luckBonus = 0) {
    const roll = Math.random() + (masteryLevel * 0.005) + luckBonus;
    if (roll > 1.20) return QUALITY_TIERS.PERFECT;
    if (roll > 0.95) return QUALITY_TIERS.EXCELLENT;
    if (roll > 0.65) return QUALITY_TIERS.GOOD;
    if (roll > 0.20) return QUALITY_TIERS.NORMAL;
    return QUALITY_TIERS.POOR;
  },

  /**
   * Rola o tamanho do peixe (Tiny a Record).
   */
  rollFishSize(luckBonus = 0) {
    const roll = Math.random() + luckBonus;
    if (roll > 0.96) return FISH_SIZES.RECORD;
    if (roll > 0.82) return FISH_SIZES.HUGE;
    if (roll > 0.60) return FISH_SIZES.LARGE;
    if (roll > 0.25) return FISH_SIZES.MEDIUM;
    if (roll > 0.08) return FISH_SIZES.SMALL;
    return FISH_SIZES.TINY;
  },

  /**
   * Calcula o rendimento em unidades garantindo limites e aplicando qualidade.
   */
  calculateYield(baseCount = 1, quality = QUALITY_TIERS.NORMAL, extraMultiplier = 1) {
    const calculated = Math.round(baseCount * quality.mult * extraMultiplier);
    return Math.max(1, calculated);
  },

  /**
   * Proteção anti-streak (Pity System).
   * Se o jogador falhar 3 vezes consecutivas, a 4ª tem sucesso garantido.
   */
  evaluatePity(activityState) {
    if (!activityState) return false;
    activityState.consecutiveFailures = activityState.consecutiveFailures || 0;
    if (activityState.consecutiveFailures >= 3) {
      activityState.consecutiveFailures = 0;
      return true; // Força sucesso
    }
    return false;
  },

  /**
   * Registra resultado para controle de Pity.
   */
  recordAttempt(activityState, isSuccess) {
    if (!activityState) return;
    if (isSuccess) {
      activityState.consecutiveFailures = 0;
    } else {
      activityState.consecutiveFailures = (activityState.consecutiveFailures || 0) + 1;
    }
  },

  /**
   * Resolve a recompensa completa de uma tentativa de Life Activity.
   */
  resolveAttemptReward({
    activityType,
    activityState,
    baseChance = 0.75,
    toolBonus = 0,
    consumableBonus = 0,
    targetDef,
    luckBonus = 0
  }) {
    const level = activityState?.level || 1;
    const isPity = this.evaluatePity(activityState);
    const chance = isPity ? 1.0 : this.calculateSuccessChance(baseChance, toolBonus, level, consumableBonus);
    const roll = Math.random();
    const success = isPity || (roll <= chance);

    this.recordAttempt(activityState, success);

    if (!success) {
      return {
        success: false,
        reason: 'escaped_or_failed',
        pityActive: isPity,
        message: 'A tentativa falhou. O recurso escapou ou a extração foi imperfeita.'
      };
    }

    const quality = this.rollQuality(level, luckBonus);
    const size = (activityType === 'fishing') ? this.rollFishSize(luckBonus) : null;

    // Cálculo do drop principal
    const rawPrimaryId = targetDef?.primaryYieldId || targetDef?.materialReward || 'iron_ore';
    const primaryId = resolveCanonicalResourceId(rawPrimaryId);
    const baseCount = targetDef?.primaryYieldCount || 1;
    const primaryCount = this.calculateYield(baseCount, quality);

    // Drop secundário com base em chance
    let secondaryDrop = null;
    if (targetDef?.secondaryYieldId && (Math.random() < (targetDef.secondaryChance || 0.35))) {
      const secId = resolveCanonicalResourceId(targetDef.secondaryYieldId);
      secondaryDrop = {
        itemId: secId,
        count: Math.max(1, Math.round((targetDef.secondaryCount || 1) * (quality.mult >= 1.3 ? 1.5 : 1)))
      };
    }

    // Cálculo de XP da atividade
    const xpBase = targetDef?.xpReward || (15 + level * 5);
    const finalXp = Math.round(xpBase * quality.mult);

    return {
      success: true,
      quality,
      size,
      xp: finalXp,
      primaryDrop: {
        itemId: primaryId,
        count: primaryCount
      },
      secondaryDrop,
      message: `Sucesso! Extraído em qualidade ${quality.name}.`
    };
  }
};
