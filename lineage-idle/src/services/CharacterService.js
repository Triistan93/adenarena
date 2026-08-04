/**
 * CharacterService.js — Gestão de Promoções de Classe, Herança e Subclasses do Lineage Idle.
 *
 * Responsável pela resolução de herança de classes (classSatisfies), verificação de elegibilidade
 * de promoção (1ª, 2ª e 3ª Troca de Classe - 3rd Job) e cerimônia de promoção com reembolso de SP.
 */

import { D } from '../core/GameConfig.js';
import { RACES, CLASSES } from '../data/races.js';
import { getClass } from '../engine/StatsEngine.js';
import { getSkillCost } from '../engine/SkillEngine.js';

/**
 * Verifica se a classe atual do jogador satisfaz um requisito de classe (percorrendo a árvore de herança).
 * @param {string} playerClass
 * @param {string} reqClass
 * @returns {boolean}
 */
export function classSatisfies(playerClass, reqClass) {
  if (!reqClass) return true;
  if (!playerClass) return false;
  let current = playerClass;
  const visited = new Set();
  while (current && !visited.has(current)) {
    visited.add(current);
    if (current === reqClass) return true;
    const def = getClass(current);
    if (!def) break;
    if (def.archetype === reqClass) return true;
    if (def.skillTree === reqClass) return true;
    current = def.parent;
  }
  return false;
}

/**
 * Resolve a chave de árvore de habilidades (skill tree key) exata para a classe.
 * @param {string} classId
 * @returns {string|null}
 */
export function getSkillTreeKey(classId) {
  const E = typeof window !== 'undefined' ? window.EchoData : null;
  const ST = E ? E.SKILL_TREE_LAYOUT_ECHO : D()?.SKILL_TREE_LAYOUT;
  if (!classId) return null;
  if (ST && ST[classId]) return classId;
  const visited = new Set();
  let current = classId;
  while (current && !visited.has(current)) {
    visited.add(current);
    const def = getClass(current);
    if (!def) break;
    if (def.skillTree && ST && ST[def.skillTree]) return def.skillTree;
    if (ST && ST[current]) return current;
    current = def.parent;
  }
  const rootDef = getClass(classId);
  if (rootDef?.archetype && ST && ST[rootDef.archetype]) return rootDef.archetype;
  return null;
}

/**
 * Retorna a lista de skill IDs autorizadas para a classe.
 * @param {string} classId
 * @returns {Array<string>|null}
 */
export function getClassSkills(classId) {
  const E = typeof window !== 'undefined' ? window.EchoData : null;
  const CS = E?.CLASS_SKILLS_ECHO;
  if (!CS) return null;
  if (CS[classId]) return CS[classId];
  const def = getClass(classId);
  if (def?.skillTree && CS[def.skillTree]) return CS[def.skillTree];
  let current = def?.parent;
  const visited = new Set([classId]);
  while (current && !visited.has(current)) {
    visited.add(current);
    if (CS[current]) return CS[current];
    const pd = getClass(current);
    if (pd?.skillTree && CS[pd.skillTree]) return CS[pd.skillTree];
    current = pd?.parent;
  }
  return null;
}

/**
 * Verifica se o jogador pode realizar uma promoção de classe (Lv.20, Lv.40 ou Lv.76).
 * @param {Object} state
 * @param {Object} [callbacks] — { el, openClassTransferModal }
 */
export function checkClassAdvancement(state, callbacks = {}) {
  const currentClassDef = getClass(state.class);
  const currentStage = currentClassDef?.stage || 0;

  if (!callbacks.el) return;
  const banner = callbacks.el('class-advancement-banner');
  if (!banner) return;

  let canAdvance = false;
  let advTitle = '';
  let advSub = '';

  if (state.level >= 20 && currentStage === 0) {
    canAdvance = true;
    advTitle = '⚡ 1ª Troca de Classe Disponível!';
    advSub = `Atingiu o Nível ${state.level}! Escolha o caminho de evolução para a Ordem de ${currentClassDef.name}.`;
  } else if (state.level >= 40 && currentStage === 1) {
    canAdvance = true;
    advTitle = '⚔️ 2ª Troca de Classe Disponível!';
    advSub = `Atingiu o Nível ${state.level}! Escolha a sua Classe Épica de Especialista.`;
  } else if (state.level >= 76 && currentStage === 2) {
    canAdvance = true;
    advTitle = '👑 3ª Troca de Classe Disponível (3rd Job)!';
    advSub = `Atingiu o Nível ${state.level}! Torne-se um Mestre Sagrado da 3ª Transferência e alcance o poder dos Noblesses!`;
  }

  if (canAdvance) {
    banner.style.display = 'flex';
    const titleEl = callbacks.el('class-advancement-title');
    const subEl = callbacks.el('class-advancement-sub');
    if (titleEl) titleEl.textContent = advTitle;
    if (subEl) subEl.textContent = advSub;
    const btn = callbacks.el('class-advancement-btn');
    if (btn && callbacks.openClassTransferModal) btn.onclick = () => callbacks.openClassTransferModal();
  } else {
    banner.style.display = 'none';
  }
}

/**
 * Promove o personagem para uma nova classe e reembolsa SPs de skills incompatíveis.
 * @param {Object} state
 * @param {string} newClassId
 * @param {Object} [callbacks] — { log, floatText, el, updateAllUI, save }
 */
export function promoteClass(state, newClassId, callbacks = {}) {
  const newClassDef = getClass(newClassId);
  if (!newClassDef) return;

  state.class = newClassId;

  const race = RACES[state.race];
  state.base = { atk: 0, def: 0, eva: 0, matk: 0, mdef: 0 };
  if (race) {
    for (const k of ['atk', 'def', 'eva', 'matk', 'mdef']) {
      state.base[k] = (race.stats[k] || 0) + (newClassDef.base[k] || 0);
    }
  }

  let totalRefunded = 0;
  const echoDefs = (typeof window !== 'undefined' && window.EchoData) ? window.EchoData.SKILL_DEFS_ECHO : {};
  const skillDefs = echoDefs || D()?.SKILL_DEFS || {};

  for (const [sId, lvl] of Object.entries(state.skills || {})) {
    if (lvl > 0 && skillDefs[sId]) {
      const def = skillDefs[sId];
      if (!classSatisfies(newClassId, def.classReq)) {
        for (let l = 0; l < lvl; l++) {
          totalRefunded += getSkillCost(sId, l);
        }
        state.skills[sId] = 0;
      }
    }
  }

  if (totalRefunded > 0) {
    state.sp += totalRefunded;
    if (callbacks.log) callbacks.log(`🔄 ${totalRefunded.toLocaleString()} SP foram reembolsados para distribuição na nova árvore exclusiva de ${newClassDef.name}!`, 'rarity-legendary');
    if (callbacks.floatText) callbacks.floatText(`+${totalRefunded.toLocaleString()} SP`, 'float-jackpot');
  }

  if (callbacks.log) callbacks.log(`🎉 PARABÉNS! Você concluiu a Cerimônia e agora é um **${newClassDef.name}**!`, 'rarity-legendary');
  if (callbacks.floatText) callbacks.floatText(`🎉 ${newClassDef.name.toUpperCase()}!`, 'float-jackpot');

  if (callbacks.el) {
    const modal = callbacks.el('class-transfer-modal');
    if (modal) modal.classList.remove('active');
  }

  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save();
}
