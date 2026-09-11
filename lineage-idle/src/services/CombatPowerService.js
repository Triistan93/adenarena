/**
 * CombatPowerService.js — Motor de Cálculo de Combat Power (CP / Battle Power)
 * 
 * Calcula o poder de combate absoluto de um personagem no Lineage Idle,
 * ponderando atributos de combate, tiers de equipamentos, níveis de encantamento (+1 a +16),
 * augmentações, Soul Crystals (SA), joias épicas, habilidades encantadas (+1 a +30),
 * certificações de subclass, bônus de clã, talismãs e coleções de codex/dolls.
 */

import { calculateDetailedCombatPower as calculateDetailedCpCanonical } from '../data/balance/cpBalance.js';
import { calculateEHP } from '../data/balance/phase4Model.js';
import { SubclassCertificationService } from './SubclassCertificationService.js';
import { isMageClass } from './SkillEligibility.js';

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
    const detailed = calculateDetailedCpCanonical({ ...state, _certificationCp: certCp });
    return detailed.totalCp;
  },

  /**
   * Retorna o detalhamento completo canônico com todas as 15 componentes auditadas.
   * Invariante fundamental: totalCp === soma exata das componentes (com tolerância ±1 de arredondamento).
   * @param {Object} state - Estado do jogador
   * @returns {{ totalCp: number, components: Object, trail: Array }}
   */
  calculateDetailedCombatPower(state) {
    if (!state) return { totalCp: 100, components: {}, trail: [] };
    const certCp = SubclassCertificationService.calculateCertificationCP(state);
    return calculateDetailedCpCanonical({ ...state, _certificationCp: certCp });
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
   * Retorna a classificação de Rank por Combat Power
   * @param {number} cp 
   * @returns {{ name: string, color: string, badge: string, tierIndex: number }}
   */
  getCombatPowerTier(cp) {
    const val = Number(cp) || 0;
    if (val >= 250000) return { name: 'Lenda Viva', color: '#ff3366', badge: '👑', tierIndex: 7 };
    if (val >= 180000) return { name: 'Grão-Mestre', color: '#a855f7', badge: '💎', tierIndex: 6 };
    if (val >= 120000) return { name: 'Mestre Arcano', color: '#38bdf8', badge: '🔷', tierIndex: 5 };
    if (val >= 80000)  return { name: 'Diamante', color: '#22c55e', badge: '💠', tierIndex: 4 };
    if (val >= 50000)  return { name: 'Platina', color: '#fbbf24', badge: '⭐', tierIndex: 3 };
    if (val >= 25000)  return { name: 'Ouro', color: '#f59e0b', badge: '🥇', tierIndex: 2 };
    if (val >= 10000)  return { name: 'Prata', color: '#94a3b8', badge: '🥈', tierIndex: 1 };
    return { name: 'Bronze', color: '#b45309', badge: '🥉', tierIndex: 0 };
  },

  /**
   * Deriva métricas de combate reais sem dados fabricados.
   * Utiliza fórmulas canônicas de phase4Model e StatsEngine.
   * @param {Object} state
   * @param {Object} stats
   * @returns {Object}
   */
  getPerformanceMetrics(state, stats) {
    const s = stats || {};
    const maxHp = Number(s.maxHp) || 100;
    const def = Number(s.def) || 1;
    const eva = Math.min(80, Math.max(0, Number(s.eva) || 0));

    // 1. Effective HP (EHP) via canonical phase4Model + Evasion mitigation
    const baseEhp = calculateEHP(maxHp, def, 250);
    const evasionDodge = eva / 100;
    const ehp = Math.round(baseEhp / Math.max(0.2, 1 - evasionDodge));

    // 2. Sustained & Burst DPS (Base Atk, Crit Rate, Crit Dmg, Atk Speed)
    const isMage = (state?.class && isMageClass(state.class)) || ((Number(s.matk) || 0) > (Number(s.atk) || 0) * 1.3);
    const baseAtkVal = isMage ? (Number(s.matk) || Number(s.atk) || 10) : (Number(s.atk) || 10);
    const critRate = Math.min(50, Math.max(5, Number(s.crit) || 5)) / 100;
    const critMult = Math.max(1.5, Number(s.critDmg) || 1.5);
    const speed = Math.max(0.5, Number(s.atkSpd) || (Number(s.speed) || 100) / 100);

    const avgHit = baseAtkVal * (1 - critRate + critRate * critMult);
    const sustainedDps = Math.round(avgHit * speed);
    const burstDps = Math.round(baseAtkVal * critMult * speed * 1.4);

    // 3. HPS (Health Per Second) — Natural Regen + Life Drain Leech
    const hpRegenPct = Number(s.regenHp) || 0.01;
    const regenHpSec = maxHp * hpRegenPct;
    const lifeDrainPct = Number(s.lifeDrain) || 0;
    const leechHpSec = sustainedDps * lifeDrainPct;
    const hps = Math.round((regenHpSec + leechHpSec) * 10) / 10;

    // 4. MP Sustain
    const mpRegen = Math.round(((Number(s.mpRegen) || 0) + 3 + (Number(state?.level) || 1) * 0.1) * 10) / 10;

    return {
      ehp,
      sustainedDps,
      burstDps,
      hps,
      mpRegen,
      evasionDodgePct: eva,
      critRatePct: Math.round(critRate * 100)
    };
  },

  /**
   * Analisa dados reais e diagnostica gargalos e oportunidades de progressão.
   * @param {Object} state
   * @param {Object} stats
   * @param {Object} detailedCp
   * @returns {Array<{ type: 'impact'|'warning'|'recommendation', icon: string, title: string, desc: string }>}
   */
  getPowerInsights(state, stats, detailedCp) {
    const insights = [];
    const comps = detailedCp?.components || {};
    const total = detailedCp?.totalCp || 100;

    // 1. Diagnóstico da Maior Fonte de Poder
    const equipTotal = (comps.equipmentCp || 0) + (comps.enchantCp || 0) + (comps.jewelryCp || 0);
    const equipPct = Math.round((equipTotal / total) * 100);
    const basePct = Math.round(((comps.baseCp || 0) / total) * 100);

    if (equipPct >= 35) {
      insights.push({
        type: 'impact',
        icon: '⚔️',
        title: 'Força Concentrada em Equipamentos',
        desc: `Seu arsenal e refinos representam ${equipPct}% de todo o seu Poder de Combate atual.`
      });
    } else {
      insights.push({
        type: 'impact',
        icon: '🏛️',
        title: 'Poder Predominante de Linhagem',
        desc: `Seu nível e atributos raciais de base compõem ${basePct}% do seu Poder de Combate.`
      });
    }

    // 2. Diagnóstico de Defesa vs Linha de Base
    const currentDef = Number(stats?.def) || 0;
    const expectedDef = Math.round((total * 0.012) + ((state?.level || 1) * 7));
    if (currentDef < expectedDef * 0.82) {
      insights.push({
        type: 'warning',
        icon: '🛡️',
        title: 'Defesa Física Abaixo do Padrão',
        desc: `Sua P.Def (${currentDef.toLocaleString()}) está abaixo da linha de sobrevivência recomendada (${expectedDef.toLocaleString()}). Priorize elmo, armadura e calças.`
      });
    }

    // 3. Recomendação Estruturada de Próximo Passo
    const wpnUid = state?.equipment?.weapon;
    const wpnItem = state?.inventory?.find(i => i.uid === wpnUid);
    const wpnEnchant = Number(wpnItem?.enchant) || 0;

    if (wpnEnchant < 4) {
      insights.push({
        type: 'recommendation',
        icon: '✨',
        title: 'Reforço Imediato Recomendado: Arma Principal',
        desc: 'Encante sua arma principal até +4 na Forja para obter o bônus seguro de dano e salto de CP.'
      });
    } else if (!state?.subclasses || state.subclasses.length === 0) {
      if ((state?.level || 1) >= 52) {
        insights.push({
          type: 'recommendation',
          icon: '📜',
          title: 'Oportunidade de Subclasse Desbloqueada',
          desc: 'Você já atingiu o nível necessário para iniciar sua primeira Subclasse e destravar Certificações permanentes.'
        });
      } else {
        insights.push({
          type: 'recommendation',
          icon: '💎',
          title: 'Fortaleça Conjuntos e Joias',
          desc: 'Equipar conjuntos completos e refinar joias aumentará sua M.Def e imunidade mágica.'
        });
      }
    } else {
      insights.push({
        type: 'recommendation',
        icon: '👑',
        title: 'Maximização de Maestria Astral e Dolls',
        desc: 'Sintetize Boss Dolls e aloque Cacos Astrais nas Constelações para multiplicadores percentuais.'
      });
    }

    return insights;
  },

  /**
   * Calcula o próximo marco de prestígio (Power Milestone)
   * @param {number} currentCp
   * @returns {{ currentCp: number, nextMilestone: number, remainingCp: number, progressPct: number, prevMilestone: number }}
   */
  getNextMilestone(currentCp) {
    const milestones = [
      1000, 2500, 5000, 10000, 25000, 50000, 80000, 120000, 180000, 250000, 350000, 500000, 750000, 1000000
    ];
    const cp = Math.max(0, Number(currentCp) || 0);
    let nextMilestone = milestones[milestones.length - 1];
    let prevMilestone = 0;

    for (let i = 0; i < milestones.length; i++) {
      if (cp < milestones[i]) {
        nextMilestone = milestones[i];
        prevMilestone = i > 0 ? milestones[i - 1] : 0;
        break;
      }
    }

    const range = Math.max(1, nextMilestone - prevMilestone);
    const progressIntoRange = Math.max(0, cp - prevMilestone);
    const progressPct = Math.min(100, Math.floor((progressIntoRange / range) * 100));
    const remainingCp = Math.max(0, nextMilestone - cp);

    return {
      currentCp: cp,
      prevMilestone,
      nextMilestone,
      remainingCp,
      progressPct
    };
  }
};
