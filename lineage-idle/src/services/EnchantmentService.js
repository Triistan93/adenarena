/**
 * EnchantmentService.js — Motor Canônico de Encantamento de Equipamentos.
 *
 * Implementa Contrato 1:
 * Scroll → Modal → Target → Preview → Atomic Enchant → Stats → CP
 *
 * Máquina de Estados:
 * IDLE → SELECTING_ITEM → READY → CONFIRMING → PROCESSING → SUCCESS / FAILURE / CANCELLED / INVALID
 */

import { D } from '../core/GameConfig.js';
import { ALL_ITEMS } from '../data/items/index.js';
import { getStats } from '../engine/StatsEngine.js';
import { CombatPowerService } from './CombatPowerService.js';
import { CP_WEIGHTS } from '../data/balance/cpBalance.js';
import {
  isEquippableItem,
  getEquipmentType,
  parseEnchantScroll,
  isItemCompatibleWithScroll,
  EQUIPMENT_TYPES
} from './ItemClassificationService.js';

export const ENCHANT_STATES = {
  IDLE: 'IDLE',
  SELECTING_ITEM: 'SELECTING_ITEM',
  READY: 'READY',
  CONFIRMING: 'CONFIRMING',
  PROCESSING: 'PROCESSING',
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE',
  CANCELLED: 'CANCELLED',
  INVALID: 'INVALID'
};

const CRYSTAL_MAP = {
  'D': { id: 'crystal_d', name: 'Cristal: Grau D', base: 25, mult: 5 },
  'C': { id: 'crystal_c', name: 'Cristal: Grau C', base: 35, mult: 8 },
  'B': { id: 'crystal_b', name: 'Cristal: Grau B', base: 50, mult: 12 },
  'A': { id: 'crystal_a', name: 'Cristal: Grau A', base: 80, mult: 15 },
  'S': { id: 'crystal_s', name: 'Cristal: Grau S', base: 120, mult: 20 }
};

/**
 * Retorna o limite de segurança canônico do item.
 * Peças inteiras (Fullbody) têm limite seguro +4; demais itens têm limite seguro +3.
 * @param {Object} def
 * @returns {number}
 */
export function getSafeEnchantLimit(def) {
  if (!def) return 3;
  const slot = String(def.slot || '').toLowerCase();
  const isFullBody = slot === 'fullbody' || (slot === 'chest' && (def.isOnePiece || def.name?.toLowerCase().includes('full body') || def.name?.toLowerCase().includes('robe')));
  return isFullBody ? 4 : 3;
}

/**
 * Retorna a probabilidade canônica de sucesso de encantamento.
 * @param {string} grade
 * @param {number} currentEnchant
 * @param {number} safeLimit
 * @returns {number} 0.0 a 1.0
 */
export function getEnchantSuccessChance(grade, currentEnchant, safeLimit) {
  if (currentEnchant < safeLimit) return 1.0;
  const g = String(grade || 'NG').toUpperCase();

  if (g === 'D' || g === 'C' || g === 'NG') {
    if (currentEnchant <= 3) return 0.90;
    if (currentEnchant <= 6) return 0.70;
    return 0.50;
  } else if (g === 'B' || g === 'A') {
    if (currentEnchant <= 3) return 0.80;
    if (currentEnchant <= 6) return 0.60;
    return 0.40;
  } else if (g === 'S') {
    if (currentEnchant <= 3) return 0.70;
    if (currentEnchant <= 6) return 0.50;
    return 0.30;
  }
  return Math.max(0.30, 1.0 - (currentEnchant - safeLimit) * 0.10);
}

/**
 * Lista todos os equipamentos compatíveis com um determinado pergaminho.
 * @param {Object} state
 * @param {Object|string} scrollItemOrUid
 * @returns {Array<Object>}
 */
export function getEnchantableItems(state, scrollItemOrUid) {
  if (!state || !Array.isArray(state.inventory)) return [];
  const allItems = D()?.ALL_ITEMS || ALL_ITEMS || {};

  const scrollItem = (typeof scrollItemOrUid === 'string')
    ? state.inventory.find(i => i.uid === scrollItemOrUid)
    : scrollItemOrUid;
  if (!scrollItem) return [];

  const scrollDef = allItems[scrollItem.itemId] || scrollItem;
  const scrollInfo = parseEnchantScroll(scrollDef);
  if (!scrollInfo.isScroll) return [];

  return state.inventory.filter(item => {
    if (!item) return false;
    const def = allItems[item.itemId] || item;
    const compat = isItemCompatibleWithScroll(def, scrollDef);
    return compat.ok === true;
  });
}

/**
 * Gera a Prévia Canônica antes da confirmação do encantamento.
 * @param {Object} state
 * @param {string} targetUid
 * @param {string} scrollUid
 * @returns {Object|null}
 */
export function getEnchantPreview(state, targetUid, scrollUid) {
  if (!state || !targetUid || !scrollUid) return null;
  const allItems = D()?.ALL_ITEMS || ALL_ITEMS || {};

  const targetItem = state.inventory?.find(i => i.uid === targetUid);
  const scrollItem = state.inventory?.find(i => i.uid === scrollUid);
  if (!targetItem || !scrollItem) return null;

  const targetDef = allItems[targetItem.itemId] || targetItem;
  const scrollDef = allItems[scrollItem.itemId] || scrollItem;

  const compat = isItemCompatibleWithScroll(targetDef, scrollDef);
  if (!compat.ok) {
    return { ok: false, reason: compat.reason, state: ENCHANT_STATES.INVALID };
  }

  const currentEnchant = Number(targetItem.enchant || targetItem.enchantLevel) || 0;
  const targetEnchant = currentEnchant + 1;
  const grade = String(targetDef.grade || (targetDef.tier ? ['NG','NG','D','C','B','A','S'][targetDef.tier] : 'NG')).toUpperCase();
  const safeLimit = getSafeEnchantLimit(targetDef);

  const baseProb = getEnchantSuccessChance(grade, currentEnchant, safeLimit);
  const enchantRate = Math.max(0.1, Number(state.serverRates?.enchant) || 1);
  const successChance = Math.min(1.0, baseProb * enchantRate);
  const scrollInfo = parseEnchantScroll(scrollDef);

  // Estimativa de Deltas de Atributos
  const eqType = getEquipmentType(targetDef);
  let pAtkDelta = 0;
  let mAtkDelta = 0;
  let pDefDelta = 0;
  let mDefDelta = 0;

  if (eqType === EQUIPMENT_TYPES.WEAPON) {
    pAtkDelta = Math.max(2, Math.floor((Number(targetDef.atk) || 20) * 0.10));
    mAtkDelta = Math.max(2, Math.floor((Number(targetDef.matk) || 15) * 0.08));
  } else {
    pDefDelta = Math.max(1, Math.floor((Number(targetDef.def) || 10) * 0.08));
    mDefDelta = Math.max(1, Math.floor((Number(targetDef.mdef) || 8) * 0.08));
  }

  // Delta de Combat Power Canônico
  const tier = Number(targetDef.tier) || 1;
  const tierBase = (CP_WEIGHTS?.equipmentTierBase?.[tier]) || 60;
  const prevEncCp = currentEnchant > 0 ? Math.floor(tierBase * (Math.pow(currentEnchant, 1.4) * 0.14)) : 0;
  const nextEncCp = Math.floor(tierBase * (Math.pow(targetEnchant, 1.4) * 0.14));
  const cpDelta = nextEncCp - prevEncCp;

  // Impacto Real de Poder Estimado
  const realPowerDeltaPct = Number((cpDelta / Math.max(100, targetDef.atk || targetDef.def || 100) * 1.5).toFixed(1));

  let failureResultText = 'Nível mantido (100% Seguro)';
  let isCrystallizable = false;
  let crystalYield = 0;
  let crystalName = '';

  if (scrollInfo.isBlessed) {
    failureResultText = '🛡️ Protegido por Bênção: Mantém o nível de encantamento atual intacto em caso de falha.';
  } else if (currentEnchant >= safeLimit && grade !== 'NG') {
    isCrystallizable = true;
    const cInfo = CRYSTAL_MAP[grade] || CRYSTAL_MAP['D'];
    crystalYield = cInfo.base + currentEnchant * cInfo.mult;
    crystalName = cInfo.name;
    failureResultText = `💥 Quebra Crítica: O item será destruído e cristalizado em ${crystalYield}x ${crystalName}.`;
  } else if (currentEnchant >= safeLimit) {
    failureResultText = '💥 Falha: O nível de encantamento será reduzido em -1 nível.';
  }

  return {
    ok: true,
    valid: true,
    currentEnchant,
    targetEnchant,
    isSafe: currentEnchant < safeLimit,
    isBlessed: scrollInfo.isBlessed,
    state: ENCHANT_STATES.READY,
    targetItem: {
      uid: targetItem.uid,
      itemId: targetItem.itemId,
      name: targetDef.name || targetItem.itemId,
      grade,
      rarity: targetItem.rarity || 'common',
      equipped: !!targetItem.equipped,
      currentEnchant,
      targetEnchant
    },
    scrollItem: {
      uid: scrollItem.uid,
      itemId: scrollItem.itemId,
      name: scrollDef.name || scrollItem.itemId,
      count: scrollItem.count || 1,
      isBlessed: scrollInfo.isBlessed,
      grade: scrollInfo.grade
    },
    successChance,
    successChanceFormatted: currentEnchant < safeLimit ? `100% Seguro (Até +${safeLimit})` : `${Math.round(successChance * 100)}%`,
    safeLimit,
    failureResultText,
    isCrystallizable,
    crystalYield,
    crystalName,
    statDeltas: {
      atk: pAtkDelta,
      matk: mAtkDelta,
      def: pDefDelta,
      mdef: mDefDelta,
      cp: cpDelta
    },
    deltas: {
      pAtk: pAtkDelta,
      mAtk: mAtkDelta,
      pDef: pDefDelta,
      mDef: mDefDelta,
      cp: cpDelta,
      realPowerPct: realPowerDeltaPct
    }
  };
}

/**
 * Executa a Transação Atômica de Encantamento.
 * Apenas consome o scroll após validação bem-sucedida, aplicação de resultado e recálculo de stats/CP.
 *
 * @param {Object} state
 * @param {string} targetUid
 * @param {string} scrollUid
 * @param {Object} callbacks — { log, floatText, playVFX, updateAllUI, save }
 * @returns {{ ok: boolean, state: string, result: 'SUCCESS'|'FAILURE'|'CRYSTALLIZED'|'PROTECTED', reason?: string, details?: Object }}
 */
export function executeAtomicEnchant(state, targetUid, scrollUid, callbacks = {}) {
  if (!state || !state.inventory) {
    return { ok: false, state: ENCHANT_STATES.INVALID, reason: 'Estado de inventário inválido.' };
  }

  const allItems = D()?.ALL_ITEMS || ALL_ITEMS || {};
  const targetIndex = state.inventory.findIndex(i => i.uid === targetUid);
  const scrollIndex = state.inventory.findIndex(i => i.uid === scrollUid);

  if (targetIndex < 0) {
    return { ok: false, state: ENCHANT_STATES.INVALID, reason: 'Equipamento alvo não encontrado na mochila.' };
  }
  if (scrollIndex < 0) {
    return { ok: false, state: ENCHANT_STATES.INVALID, reason: 'Pergaminho de encantamento não encontrado na mochila.' };
  }

  const targetItem = state.inventory[targetIndex];
  const scrollItem = state.inventory[scrollIndex];
  const targetDef = allItems[targetItem.itemId] || targetItem;
  const scrollDef = allItems[scrollItem.itemId] || scrollItem;

  // Validação estrita de compatibilidade
  const compat = isItemCompatibleWithScroll(targetDef, scrollDef);
  if (!compat.ok) {
    return { ok: false, state: ENCHANT_STATES.INVALID, reason: compat.reason };
  }

  const currentEnchant = Number(targetItem.enchant || targetItem.enchantLevel) || 0;
  const grade = String(targetDef.grade || (targetDef.tier ? ['NG','NG','D','C','B','A','S'][targetDef.tier] : 'NG')).toUpperCase();
  const safeLimit = getSafeEnchantLimit(targetDef);
  const baseProb = getEnchantSuccessChance(grade, currentEnchant, safeLimit);
  const enchantRate = Math.max(0.1, Number(state.serverRates?.enchant) || 1);
  const chance = Math.min(1.0, baseProb * enchantRate);
  const scrollInfo = parseEnchantScroll(scrollDef);

  const roll = Math.random();
  const isSuccess = roll < chance;

  let outcomeType = 'SUCCESS';
  let crystalsAwarded = 0;
  let crystalId = null;

  if (isSuccess) {
    outcomeType = 'SUCCESS';
    targetItem.enchant = currentEnchant + 1;
    if (callbacks.log) {
      callbacks.log(`✨ ENCHANT SUCCESS! ${targetDef.name} agora está +${targetItem.enchant}!`, 'rarity-legendary');
    }
    if (callbacks.floatText) {
      callbacks.floatText(`✨ +${targetItem.enchant} SUCESSO!`, 'float-jackpot');
    }
  } else {
    if (scrollInfo.isBlessed) {
      outcomeType = 'PROTECTED';
      if (callbacks.log) {
        callbacks.log(`🛡️ [BLESSED PROTECTED] A tentativa falhou, mas ${targetDef.name} manteve o nível +${currentEnchant} intacto!`, 'rarity-epic');
      }
      if (callbacks.floatText) {
        callbacks.floatText(`🛡️ PROTEGIDO (+${currentEnchant})`, 'float-jackpot');
      }
    } else if (currentEnchant >= safeLimit && grade !== 'NG') {
      outcomeType = 'CRYSTALLIZED';
      const cInfo = CRYSTAL_MAP[grade] || CRYSTAL_MAP['D'];
      crystalsAwarded = cInfo.base + currentEnchant * cInfo.mult;
      crystalId = cInfo.id;

      // Se estava equipado, desequipa o item
      if (state.equipment) {
        for (const [sKey, eqUid] of Object.entries(state.equipment)) {
          if (eqUid === targetItem.uid) {
            state.equipment[sKey] = null;
          }
        }
      }

      // Remove item destruído
      state.inventory.splice(targetIndex, 1);

      // Adiciona cristais ao inventário
      let existingCrystal = state.inventory.find(i => i.itemId === crystalId && !i.equipped);
      if (existingCrystal) {
        existingCrystal.count = (existingCrystal.count || 1) + crystalsAwarded;
      } else {
        state.inventory.push({
          uid: Date.now() + '_' + Math.random().toString(36).slice(2, 7),
          itemId: crystalId,
          count: crystalsAwarded,
          equipped: false
        });
      }

      if (callbacks.log) {
        callbacks.log(`💥 CRISTALIZADO! ${targetDef.name} +${currentEnchant} falhou e foi destruído em ${crystalsAwarded}x ${cInfo.name}!`, 'rarity-legendary');
      }
      if (callbacks.floatText) {
        callbacks.floatText(`💥 CRISTALIZADO (+${crystalsAwarded}x)`, 'float-crit');
      }
    } else {
      outcomeType = 'FAILURE';
      targetItem.enchant = Math.max(0, currentEnchant - 1);
      if (callbacks.log) {
        callbacks.log(`💥 Encantamento falhou! ${targetDef.name} reduziu para +${targetItem.enchant}.`, 'system');
      }
      if (callbacks.floatText) {
        callbacks.floatText(`💥 FALHOU (-1)`, 'float-crit');
      }
    }
  }

  // Recálculo imediato de Stats & CP para Paridade Canônica
  const stats = getStats(state);
  state.maxHp = stats.maxHp;
  state.maxMp = stats.maxMp;
  state.hp = Math.min(state.hp || state.maxHp, state.maxHp);
  state.mp = Math.min(state.mp || state.maxMp, state.maxMp);

  // APENAS APÓS TODO O PROCESSO TER SUCESSO: Consome exatamente 1 pergaminho
  const currentScrollItem = state.inventory.find(i => i.uid === scrollUid);
  if (currentScrollItem) {
    const qty = (currentScrollItem.count != null ? currentScrollItem.count : currentScrollItem.qty) ?? 1;
    if (qty > 1) {
      if (currentScrollItem.count != null) currentScrollItem.count--;
      if (currentScrollItem.qty != null) currentScrollItem.qty--;
    } else {
      const idxToRemove = state.inventory.findIndex(i => i.uid === scrollUid);
      if (idxToRemove >= 0) state.inventory.splice(idxToRemove, 1);
    }
  }

  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save();

  return {
    ok: true,
    success: isSuccess,
    state: isSuccess ? ENCHANT_STATES.SUCCESS : ENCHANT_STATES.FAILURE,
    result: outcomeType,
    details: {
      previousEnchant: currentEnchant,
      newEnchant: outcomeType === 'CRYSTALLIZED' ? null : targetItem.enchant,
      crystalsAwarded,
      isBlessed: scrollInfo.isBlessed
    }
  };
}

export const EnchantmentService = {
  ENCHANT_STATES,
  getEnchantSuccessChance,
  getSafeEnchantLimit,
  getEnchantPreview,
  getEnchantableItems,
  executeAtomicEnchant
};

export default EnchantmentService;
