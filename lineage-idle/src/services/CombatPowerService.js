/**
 * CombatPowerService.js — Motor de Cálculo de Combat Power (CP / Battle Power)
 * 
 * Calcula o poder de combate absoluto de um personagem no Lineage Idle,
 * ponderando atributos de combate, tiers de equipamentos, níveis de encantamento (+1 a +16),
 * augmentações, Soul Crystals (SA), joias épicas, habilidades encantadas (+1 a +30),
 * certificações de subclass, bônus de clã, talismãs e coleções de codex/dolls.
 */

import { calculateDetailedCombatPower } from '../data/balance/cpBalance.js';
import { SubclassCertificationService } from './SubclassCertificationService.js';

export const CombatPowerService = {
  /**
   * Calcula o Combat Power total do personagem delegando para o modelo canônico de cpBalance.js.
   * Single Source of Truth para runtime e simulações headless.
   * @param {Object} state - Estado completo do jogador
   * @returns {number} Combat Power arredondado
   */
  calculateCombatPower(state) {
    if (!state) return 100;
    const certCp = SubclassCertificationService.calculateCertificationCP(state);
    const detailed = calculateDetailedCombatPower({ ...state, _certificationCp: certCp });
    return detailed.totalCp;
  },

  /**
   * Formata Combat Power com separador de milhar (Ex: 145.280 CP)
   * @param {number} cp 
   * @returns {string}
   */
  formatCombatPower(cp) {
    const num = Math.floor(Number(cp) || 0);
    return `${num.toLocaleString('pt-BR')} CP`;
  },

  /**
   * Retorna a classificação de Rank por Combat Power (Bronze, Prata, Ouro, Platina, Diamante, Mestre, Grão-Mestre, Lenda)
   * @param {number} cp 
   * @returns {{ name: string, color: string, badge: string }}
   */
  getCombatPowerTier(cp) {
    const val = Number(cp) || 0;
    if (val >= 250000) return { name: 'Lenda Viva', color: '#ff3366', badge: '👑' };
    if (val >= 180000) return { name: 'Grão-Mestre', color: '#a855f7', badge: '💎' };
    if (val >= 120000) return { name: 'Mestre Arcano', color: '#38bdf8', badge: '🔷' };
    if (val >= 80000)  return { name: 'Diamante', color: '#22c55e', badge: '💠' };
    if (val >= 50000)  return { name: 'Platina', color: '#fbbf24', badge: '⭐' };
    if (val >= 25000)  return { name: 'Ouro', color: '#f59e0b', badge: '🥇' };
    if (val >= 10000)  return { name: 'Prata', color: '#94a3b8', badge: '🥈' };
    return { name: 'Bronze', color: '#b45309', badge: '🥉' };
  }
};
