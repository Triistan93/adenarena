/**
 * SkillEngine.js — Motor de Habilidades, SP e Árvore de Skills do Lineage Idle.
 *
 * Responsável pelo cálculo de custos de SP, aprendizado de skills, requisitos de livros (Spellbooks),
 * reset de SP e identificação de skills iniciais por arquétipo.
 */

import { D } from '../core/GameConfig.js';
import { getStats, getClass } from './StatsEngine.js';
import { removeFromInventory } from '../services/InventoryService.js';
import {
  isSkillAvailableForCharacter,
  getSkillVisibility,
  getStarterSkillsForClass
} from '../services/SkillEligibility.js';

/**
 * Retorna a skill inicial base correspondente à classe/arquétipo do jogador.
 * @param {string} classId
 * @returns {string}
 */
export function getStarterSkillForClass(classId) {
  const starters = getStarterSkillsForClass(classId);
  return starters[0] || 'power_strike';
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

  // Validação estrita de elegibilidade através de SkillEligibility
  if (!isSkillAvailableForCharacter(state, def)) {
    const visibility = getSkillVisibility(state, def);
    if (visibility === 'LOCKED') {
      const reqLvl = def.requiredLevel || def.reqLvl || 1;
      if (callbacks.log) callbacks.log(`🔒 Habilidade bloqueada. Exige Nível ${reqLvl} e estágio de progressão compatível.`, 'system');
    } else {
      if (callbacks.log) callbacks.log(`❌ Esta habilidade não pertence à linhagem ou classe do seu personagem.`, 'system');
    }
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

  // Validate every prerequisite before consuming resources.
  const reqs = (typeof window !== 'undefined' && window.EchoData) ? window.EchoData.SKILL_REQS_ECHO[skillId] : D()?.SKILL_REQS?.[skillId];
  if (reqs && !Object.entries(reqs).every(([s, v]) => s === 'level' || s === 'sp' || s === 'reqLvl' || (state.skills[s] || 0) >= v)) {
    if (callbacks.log) callbacks.log('Pré-requisitos de habilidades não preenchidos.', 'system');
    return false;
  }

  // Requisito de livro de habilidade (Spellbooks 1★ a 5★) para habilidades de Lv. 40+ no primeiro nível (lvl === 0)
  const reqBookId = def.requiredItemToUnlock || (def.starRank === 5 ? 'book_5star' : (def.starRank === 4 ? 'book_4star' : null));
  if (reqBookId && lvl === 0) {
    const bookItem = state.inventory?.find(i => (i.itemId === reqBookId || (reqBookId === 'book_4star' && i.itemId === 'spellbook_4star')) && (i.count ?? 1) > 0);
    if (!bookItem) {
      const bookNames = {
        'book_1star': 'Tomo Sagrado: 1★ (Comum)',
        'book_2star': 'Tomo Sagrado: 2★ (Raro)',
        'book_3star': 'Tomo Sagrado: 3★ (Épico)',
        'book_4star': 'Tomo Sagrado: 4★ (Lendário Divino)',
        'book_5star': 'Tomo Sagrado: 5★ (Transcendente Primordial)'
      };
      const bName = bookNames[reqBookId] || reqBookId;
      if (callbacks.log) callbacks.log(`🔒 Exige o **${bName}** na mochila para desbloquear esta habilidade! (Encontre em caçadas/instâncias ou compre no Mercado Global)`, 'warning');
      return false;
    }
    const countBefore = bookItem.count ?? 1;
    if (callbacks.removeFromInventory) callbacks.removeFromInventory(bookItem.uid, 1);
    else removeFromInventory(state, bookItem.uid, 1);
    const countAfter = state.inventory.find(i => i.uid === bookItem.uid)?.count ?? (state.inventory.includes(bookItem) ? 1 : 0);
    if (countAfter !== countBefore - 1) return false;
    if (callbacks.log) callbacks.log(`📖 **${def.name}** desbloqueada com sucesso! (${bookItem.itemId} consumido)`, 'rarity-legendary');
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

/**
 * Valida se a habilidade pode ser conjurada com base na arma e escudo equipados.
/**
 * Detecta o tipo de arma normalizado a partir da definição ou item de inventário.
 * @param {Object} itemDefOrInv
 * @returns {string|null}
 */
export function detectItemWeaponType(itemDefOrInv) {
  if (!itemDefOrInv) return null;
  const s = `${itemDefOrInv.id || itemDefOrInv.itemId || ''} ${itemDefOrInv.name || ''} ${itemDefOrInv.type || ''} ${itemDefOrInv.weaponType || ''}`.toLowerCase();
  if (/bow|crossbow/.test(s)) return 'bow';
  if (/dagger|knife/.test(s)) return 'dagger';
  if (/spear|lance|pike|halberd/.test(s)) return 'spear';
  if (/dual/.test(s)) return 'dual';
  if (/twohand|great_sword|great_axe|two_hand/.test(s)) return 'twohand';
  if (/fist|knuckle|claw/.test(s)) return 'fist';
  if (/ancientsword/.test(s)) return 'ancientsword';
  if (/staff|wand|scepter|magicblunt|magic_sword|crucifix/.test(s)) return 'staff';
  if (/hammer|blunt|mace/.test(s)) return 'blunt';
  if (/sword|axe|blade|katana|longsword|rapier|saber|falchion/.test(s)) return 'sword';
  return 'sword';
}

/**
 * Valida se a habilidade pode ser conjurada com base nas armas equipadas em ambos os slots (Dual Arsenal) e escudo.
 * @param {Object} state
 * @param {Object} skillDef
 * @returns {{ ok: boolean, reason?: string }}
 */
export function canCastSkillWeapon(state, skillDef) {
  if (!skillDef) return { ok: true };

  // 1. Requisito de Arma: A ÚNICA restrição é que habilidades de arco exigem Arco equipado
  const rawReqWeapon = skillDef.weaponType || skillDef.requiredWeapon;
  const isBowSkill = rawReqWeapon === 'bow' || 
    /bow|arrow|tiro|flecha/i.test(skillDef.id || '') || 
    /arco|flecha|double shot|arrow rain|snipe|lethal shot/i.test(skillDef.name || '');

  if (isBowSkill) {
    const equippedWeaponTypes = [];
    const gData = (typeof window !== 'undefined' && window.GameData) ? window.GameData : {};
    const eData = (typeof window !== 'undefined' && window.EchoData) ? window.EchoData : {};
    const allItems = gData.ALL_ITEMS || eData.ALL_ITEMS || {};

    for (const wKey of ['weapon', 'weapon2']) {
      const wpnUid = state.equipment?.[wKey];
      if (!wpnUid) continue;
      const wpnItem = (typeof wpnUid === 'object') ? wpnUid : state.inventory?.find(i => i.uid === wpnUid);
      if (!wpnItem) continue;
      const itemDef = (wpnItem.itemId && allItems[wpnItem.itemId]) || wpnItem || {};
      const wType = detectItemWeaponType(itemDef);
      if (wType) equippedWeaponTypes.push(wType);
    }

    const hasBow = equippedWeaponTypes.includes('bow');
    if (!hasBow) {
      return { ok: false, reason: 'Requer Arco equipado para esta habilidade' };
    }
  }

  // 2. Requisito de Escudo
  if (skillDef.requiredShield) {
    const shieldUid = state.equipment?.shield;
    const shieldItem = (shieldUid && typeof shieldUid === 'object') ? shieldUid : (shieldUid ? state.inventory?.find(i => i.uid === shieldUid) : null);
    if (!shieldItem) {
      return { ok: false, reason: 'Requer Escudo equipado' };
    }
  }

  return { ok: true };
}

