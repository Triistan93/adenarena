/**
 * SkillEngine.js — Motor de Habilidades, SP e Árvore de Skills do Lineage Idle.
 *
 * Responsável pelo cálculo de custos de SP, aprendizado de skills, requisitos de livros (Spellbooks),
 * reset de SP e identificação de skills iniciais por arquétipo.
 */

import { D } from '../core/GameConfig.js';
import { getStats, getClass } from './StatsEngine.js';

/**
 * Retorna a skill inicial base correspondente à classe/arquétipo do jogador.
 * @param {string} classId
 * @returns {string}
 */
export function getStarterSkillForClass(classId) {
  const cls = getClass(classId);
  const arch = cls?.archetype || 'fighter';
  switch (arch) {
    case 'deathknight': return 'death_spike_dk';
    case 'warg': return 'warg_will';
    case 'assassin': return 'assassin_harmony';
    case 'gunner': return 'burst_fire';
    case 'divinetemplar': return 'divine_templar_harmony';
    case 'elementweaver': return 'element_weaver_harmony';
    case 'highelf': return 'divine_templar_harmony';
    case 'bloodrose': return 'blood_rose_harmony';
    case 'soulbreaker': return 'samurai_harmony';
    case 'shinemaker': return 'shinemaker_harmony';
    case 'artisan': return 'shinemaker_harmony';
    case 'mage': return 'energy_bolt_m';
    default: return 'power_strike_f';
  }
}

/**
 * Calcula o custo em SP para aprender/subir o nível de uma habilidade.
 * @param {string} skillId
 * @param {number} currentLvl — Nível atual da skill (0-based)
 * @returns {number} Custo em SP
 */
export function getSkillCost(skillId, currentLvl) {
  const echoDefs = (typeof window !== 'undefined' && window.EchoData) ? window.EchoData.SKILL_DEFS_ECHO : {};
  const def = echoDefs[skillId] || D()?.SKILL_DEFS?.[skillId];
  if (!def) return 0;
  const baseCost = def.cost || 5;
  return Math.floor(baseCost * Math.pow(1.4, currentLvl || 0));
}

/**
 * Aprende ou sobe de nível uma habilidade gastando SP.
 * @param {Object} state — Estado mutável do jogo
 * @param {string} skillId — ID da habilidade
 * @param {Object} [callbacks] — { log, floatText, classSatisfies, removeFromInventory, updateAllUI, save }
 * @returns {boolean} True se a skill foi aprendida com sucesso
 */
export function spendSP(state, skillId, callbacks = {}) {
  const echoDefs = (typeof window !== 'undefined' && window.EchoData) ? window.EchoData.SKILL_DEFS_ECHO : {};
  const def = echoDefs[skillId] || D()?.SKILL_DEFS?.[skillId];
  if (!def) return false;

  const lvl = state.skills[skillId] || 0;
  const max = def.max || def.maxLevel || 5;

  if (lvl >= max) {
    if (callbacks.log) callbacks.log(`${def.name} já atingiu o nível máximo.`, 'system');
    return false;
  }

  const cost = getSkillCost(skillId, lvl);
  if (state.sp < cost) {
    if (callbacks.log) callbacks.log(`SP insuficiente (${cost} SP necessário).`, 'system');
    return false;
  }

  if (state.level < (def.reqLvl || 1)) {
    if (callbacks.log) callbacks.log(`Nível ${def.reqLvl || 1} necessário para esta habilidade.`, 'system');
    return false;
  }

  // Requisito de livro de habilidade (Spellbook) em Essence para skills de estrela (1-Star a 4-Star)
  if (def.starRank && def.starRank > 0 && lvl === 0) {
    const bookId = `spellbook_${def.starRank}star`;
    const bookItem = state.inventory?.find(i => i.itemId === bookId && (i.count || 1) > 0);
    if (!bookItem) {
      if (callbacks.log) callbacks.log(`⭐ Exige o livro de habilidade Spellbook: ${def.starRank}-Star ⭐ no mercador ou mochila para aprender!`, 'system');
      return false;
    }
    if (callbacks.removeFromInventory) callbacks.removeFromInventory(bookItem.uid, 1);
    if (callbacks.log) callbacks.log(`📖 Livro Spellbook: ${def.starRank}-Star ⭐ consumido com sucesso!`, 'rarity-legendary');
  }

  const reqs = (typeof window !== 'undefined' && window.EchoData) ? window.EchoData.SKILL_REQS_ECHO[skillId] : D()?.SKILL_REQS?.[skillId];
  if (reqs && !Object.entries(reqs).every(([s, v]) => s === 'level' || s === 'sp' || (state.skills[s] || 0) >= v)) {
    if (callbacks.log) callbacks.log('Pré-requisitos de habilidades não preenchidos.', 'system');
    return false;
  }

  state.sp -= cost;
  state.skills[skillId] = lvl + 1;
  const newLvl = state.skills[skillId];
  const TIER_NAMES = ['Foundation', 'Discipline', 'Mastery', 'Ascendancy', 'Legend'];
  const tier = TIER_NAMES[def.tier] || '';

  if (callbacks.log) callbacks.log(`✦ ${def.name} → Lv.${newLvl} [${tier}] (-${cost} SP)`, newLvl === max ? 'saga' : 'xp');

  const stats = getStats(state);
  state.maxHp = stats.maxHp;
  state.maxMp = stats.maxMp;
  state.hp = Math.min(state.hp + 20, state.maxHp);
  state.mp = Math.min(state.mp + 10, state.maxMp);

  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save();
  return true;
}

/**
 * Reseta os pontos de SP investidos em habilidades e os devolve ao jogador.
 * @param {Object} state
 * @param {Object} [callbacks] — { log, floatText, updateAllUI, save }
 */
export function resetSP(state, callbacks = {}) {
  let totalRefunded = 0;
  const starterSkill = getStarterSkillForClass(state.class);

  for (const [sId, lvl] of Object.entries(state.skills || {})) {
    if (lvl > 0) {
      const baseLvl = (sId === starterSkill) ? 1 : 0;
      for (let l = baseLvl; l < lvl; l++) {
        totalRefunded += getSkillCost(sId, l);
      }
      state.skills[sId] = baseLvl;
    }
  }

  state.sp += totalRefunded;

  if (callbacks.log) callbacks.log(`🔄 Skills reset! Refunded ${totalRefunded.toLocaleString()} SP.`, 'rarity-legendary');
  if (callbacks.floatText) callbacks.floatText(`+${totalRefunded.toLocaleString()} SP`, 'float-jackpot');

  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save();
}
