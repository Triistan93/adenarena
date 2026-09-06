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
import { resolveCanonicalClassId } from '../data/classes/class_aliases.js';

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
  const canonicalId = resolveCanonicalClassId(classId);
  if (CS[canonicalId]) return CS[canonicalId];
  if (CS[classId]) return CS[classId];
  const lowerCanon = String(canonicalId).toLowerCase();
  const lowerClass = String(classId).toLowerCase();
  if (CS[lowerCanon]) return CS[lowerCanon];
  if (CS[lowerClass]) return CS[lowerClass];

  const def = getClass(canonicalId) || getClass(classId) || getClass(lowerCanon) || getClass(lowerClass);
  if (def?.skillTree && CS[def.skillTree]) return CS[def.skillTree];
  let current = def?.parent;
  const visited = new Set([classId, canonicalId, lowerClass, lowerCanon]);
  while (current && !visited.has(current)) {
    visited.add(current);
    const parentCanon = resolveCanonicalClassId(current);
    if (CS[parentCanon]) return CS[parentCanon];
    if (CS[current]) return CS[current];
    const pd = getClass(parentCanon) || getClass(current);
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

  let canAdvance = false;
  let advTitle = '';
  let advSub = '';

  if (state.level >= 20 && currentStage === 0) {
    canAdvance = true;
    advTitle = '⚡ 1ª Troca de Classe Disponível!';
    advSub = `Atingiu o Nível ${state.level}! Escolha o caminho de evolução para a Ordem de ${currentClassDef?.name || state.class}.`;
  } else if (state.level >= 40 && currentStage === 1) {
    canAdvance = true;
    advTitle = '⚔️ 2ª Troca de Classe Disponível!';
    advSub = `Atingiu o Nível ${state.level}! Escolha a sua Classe Épica de Especialista.`;
  } else if (state.level >= 76 && currentStage === 2) {
    canAdvance = true;
    advTitle = '👑 3ª Troca de Classe Disponível (3rd Job)!';
    advSub = `Atingiu o Nível ${state.level}! Torne-se um Mestre Sagrado da 3ª Transferência e alcance o poder dos Noblesses!`;
  }

  const el = callbacks.el || ((id) => (typeof document !== 'undefined' ? document.getElementById(id) : null));
  if (!el) return;

  const openModal = () => {
    if (typeof callbacks.openClassTransferModal === 'function') {
      callbacks.openClassTransferModal();
    } else if (typeof window !== 'undefined' && typeof window.openClassTransferModal === 'function') {
      window.openClassTransferModal();
    }
  };

  // 1. Botão permanente no Painel Esquerdo de Status (sempre visível ao jogador)
  const statsBtn = el('stats-class-adv-btn');
  if (statsBtn) {
    if (canAdvance) {
      statsBtn.style.display = 'block';
      statsBtn.textContent = currentStage === 0 ? '⚡ 1ª Troca de Classe' : currentStage === 1 ? '⚔️ 2ª Troca de Classe' : '👑 3ª Troca de Classe';
      statsBtn.onclick = openModal;
    } else {
      statsBtn.style.display = 'none';
    }
  }

  // 2. Banner completo na Aba Personagem
  const banner = el('class-advancement-banner');
  if (banner) {
    if (canAdvance) {
      banner.style.display = 'flex';
      const titleEl = el('class-advancement-title');
      const subEl = el('class-advancement-sub');
      if (titleEl) titleEl.textContent = advTitle;
      if (subEl) subEl.textContent = advSub;
      const btn = el('class-advancement-btn');
      if (btn) btn.onclick = openModal;
    } else {
      banner.style.display = 'none';
    }
  }

  // 3. Banner na Aba de Habilidades
  const skillsBanner = el('skills-class-adv-banner');
  if (skillsBanner) {
    if (canAdvance) {
      skillsBanner.style.display = 'flex';
      const sTitle = el('skills-class-adv-title');
      const sSub = el('skills-class-adv-sub');
      if (sTitle) sTitle.textContent = advTitle;
      if (sSub) sSub.textContent = advSub;
      const sBtn = el('skills-class-adv-btn');
      if (sBtn) sBtn.onclick = openModal;
    } else {
      skillsBanner.style.display = 'none';
    }
  }
}

/**
 * Promove o personagem para uma nova classe e converte até 2 buffs selecionados em Passivas de Linhagem (20% Eficácia).
 * @param {Object} state
 * @param {string} newClassId
 * @param {string[]|Object} [selectedBuffIds]
 * @param {Object} [callbacks] — { log, floatText, el, updateAllUI, save }
 */
export function promoteClass(state, newClassId, selectedBuffIds = null, callbacks = {}) {
  // Trata caso onde callbacks seja passado no 3º argumento
  if (selectedBuffIds && typeof selectedBuffIds === 'object' && !Array.isArray(selectedBuffIds) && selectedBuffIds.updateAllUI) {
    callbacks = selectedBuffIds;
    selectedBuffIds = null;
  }

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
  let convertedBuffsCount = 0;
  const echoDefs = (typeof window !== 'undefined' && window.EchoData) ? window.EchoData.SKILL_DEFS_ECHO : {};
  const skillDefs = echoDefs || D()?.SKILL_DEFS || {};

  state.legacyPassives = state.legacyPassives || {};

  // 1. Reembolsa 100% do SP investido em TODAS as habilidades da classe anterior
  for (const [sId, lvl] of Object.entries(state.skills || {})) {
    if (lvl > 0) {
      for (let l = 0; l < lvl; l++) {
        totalRefunded += getSkillCost(sId, l);
      }
    }
  }

  // 2. Converte as habilidades/buffs selecionados (ou automáticos) em Passivas de Linhagem
  let chosenSkills = Array.isArray(selectedBuffIds) && selectedBuffIds.length > 0 ? selectedBuffIds : [];
  if (!chosenSkills.length) {
    // Fallback: seleciona automaticamente até 2 buffs aprendidos
    for (const [sId, lvl] of Object.entries(state.skills || {})) {
      if (lvl > 0 && skillDefs[sId] && chosenSkills.length < 2) {
        const def = skillDefs[sId];
        const isBuff = def.type === 'buff' || def.type === 'toggle' || def.effect === 'warcry' || (def.name || '').includes('Harmony') || (def.name || '').includes('Will') || (def.name || '').includes('Roar') || (def.name || '').includes('Aura') || (def.name || '').includes('Icon');
        if (isBuff) chosenSkills.push(sId);
      }
    }
  }

  for (const sId of chosenSkills.slice(0, 2)) {
    const lvl = state.skills?.[sId] || 1;
    const def = skillDefs[sId] || { name: sId };

    let statKey = 'patk';
    let statLabel = 'P.ATK';
    let baseVal = 0.06 + (lvl * 0.02);

    const sName = (def.name || '').toLowerCase();
    const sDesc = (def.desc || '').toLowerCase();
    const sType = (def.type || '').toLowerCase();

    if (sName.includes('hp') || sName.includes('life') || sName.includes('vital') || sName.includes('body') || sDesc.includes('hp') || sDesc.includes('vida')) {
      statKey = 'maxHp';
      statLabel = 'Max HP';
      baseVal = 0.06 + (lvl * 0.02);
    } else if (sName.includes('mdef') || sName.includes('magic def') || sName.includes('resist') || sName.includes('barrier') || sName.includes('ward')) {
      statKey = 'mdef';
      statLabel = 'M.DEF';
      baseVal = 0.06 + (lvl * 0.02);
    } else if (sName.includes('def') || sName.includes('shield') || sName.includes('aegis') || sName.includes('iron') || sName.includes('will') || sName.includes('armor') || sName.includes('guard')) {
      statKey = 'pdef';
      statLabel = 'P.DEF';
      baseVal = 0.06 + (lvl * 0.02);
    } else if (sName.includes('mana') || sName.includes('mp') || sName.includes('clarity') || sName.includes('recovery') || sName.includes('mind')) {
      statKey = 'mpRegen';
      statLabel = 'Regen. MP';
      baseVal = 0.08 + (lvl * 0.025);
    } else if (sName.includes('magic') || sName.includes('mage') || sName.includes('mystic') || sName.includes('elem') || sName.includes('fire') || sName.includes('water') || sName.includes('wind') || sName.includes('spell') || sName.includes('empower') || sType === 'magic') {
      statKey = 'matk';
      statLabel = 'M.ATK';
      baseVal = 0.06 + (lvl * 0.02);
    } else if (sName.includes('crit') || sName.includes('fury') || sName.includes('stance') || sName.includes('focus') || sName.includes('precision') || sName.includes('deadly')) {
      statKey = 'crit';
      statLabel = 'Taxa Crítica';
      baseVal = 0.04 + (lvl * 0.015);
    } else if (sName.includes('eva') || sName.includes('dodge') || sName.includes('shadow') || sName.includes('acrobat')) {
      statKey = 'eva';
      statLabel = 'Evasão';
      baseVal = 0.04 + (lvl * 0.015);
    } else if (sName.includes('speed') || sName.includes('dash') || sName.includes('step') || sName.includes('haste') || sName.includes('agility') || sName.includes('sprint')) {
      statKey = 'speed';
      statLabel = 'Velocidade de Ataque';
      baseVal = 0.05 + (lvl * 0.015);
    } else {
      statKey = 'patk';
      statLabel = 'P.ATK';
      baseVal = 0.06 + (lvl * 0.02);
    }

    const passiveVal = +(baseVal).toFixed(4);

    state.legacyPassives[sId] = {
      id: sId,
      name: `Linhagem: ${def.name}`,
      originalSkill: def.name,
      icon: def.icon || '✦',
      lvl: lvl,
      stat: statKey,
      val: passiveVal,
      desc: `Herança de Linhagem (${def.name} Lv.${lvl}): +${(passiveVal * 100).toFixed(1)}% ${statLabel}`
    };
    convertedBuffsCount++;
  }

  // 3. Reseta o kit de habilidades ativas anteriores para abrir espaço limpo para a nova classe
  state.skills = {};

  // Bônus Nobre de SP por conclusão da Cerimônia de Avanço de Classe
  const stage = Number(newClassDef.stage) || 1;
  const transferSpBonus = stage === 1 ? 35 : stage === 2 ? 80 : 200;
  state.sp = (state.sp || 0) + totalRefunded + transferSpBonus;

  if (convertedBuffsCount > 0) {
    if (callbacks.log) callbacks.log(`🧬 ${convertedBuffsCount} Habilidade(s) foram consagradas como **Passivas de Linhagem Permanentes (20% Eficácia)**!`, 'rarity-epic');
  }

  if (callbacks.log) {
    callbacks.log(`🎉 PARABÉNS! Você concluiu a Cerimônia e agora é um **${newClassDef.name}**!`, 'rarity-legendary');
    if (totalRefunded > 0) {
      callbacks.log(`🔄 ${totalRefunded.toLocaleString()} SP investidos foram 100% reembolsados + ${transferSpBonus} SP de presente cerimonial!`, 'rarity-legendary');
    } else {
      callbacks.log(`✨ +${transferSpBonus} SP de presente cerimonial concedidos para suas novas habilidades!`, 'rarity-legendary');
    }
  }
  if (callbacks.floatText) {
    callbacks.floatText(`🎉 ${newClassDef.name.toUpperCase()}! (+${totalRefunded + transferSpBonus} SP)`, 'float-jackpot');
  }

  if (callbacks.el) {
    const modal = callbacks.el('class-transfer-modal');
    if (modal) modal.classList.remove('active');
  }

  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save();
}
