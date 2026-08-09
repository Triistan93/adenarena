/**
 * QuestService.js — Gestão de Missões Diárias, Semanais e Passe de Batalha (Adena Pass).
 *
 * Responsável pela checagem de resets de quests, escuta de eventos de quests (kills, craft, boss, etc),
 * resgate de recompensas diárias/semanais e progresso/desbloqueio do Passe de Batalha.
 */

import { D } from '../core/GameConfig.js';
import { QUEST_DEFS, BATTLE_PASS_TIERS } from '../data/quests.js';
import { addToInventory } from './InventoryService.js';

/**
 * Reseta o progresso das missões diárias (24h) e semanais (7 dias).
 * @param {Object} state
 */
export function checkQuestResets(state) {
  state.quests = state.quests || { progress: {}, claimed: [], lastDailyReset: 0, lastWeeklyReset: 0 };
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const SEVEN_DAYS = 7 * ONE_DAY;

  if (!state.quests.lastDailyReset || (now - state.quests.lastDailyReset) >= ONE_DAY) {
    state.quests.lastDailyReset = now;
    for (const q of QUEST_DEFS.daily) {
      delete state.quests.progress[q.id];
      const idx = state.quests.claimed.indexOf(q.id);
      if (idx !== -1) state.quests.claimed.splice(idx, 1);
    }
  }

  if (!state.quests.lastWeeklyReset || (now - state.quests.lastWeeklyReset) >= SEVEN_DAYS) {
    state.quests.lastWeeklyReset = now;
    for (const q of QUEST_DEFS.weekly) {
      delete state.quests.progress[q.id];
      const idx = state.quests.claimed.indexOf(q.id);
      if (idx !== -1) state.quests.claimed.splice(idx, 1);
    }
  }
}

/**
 * Incrementa o progresso de missões do tipo especificado (ex: 'kill', 'craft', 'boss', 'enchant').
 * @param {Object} state
 * @param {string} type
 * @param {number} [amount=1]
 */
export function triggerQuestEvent(state, type, amount = 1) {
  checkQuestResets(state);
  const allQuests = [...(QUEST_DEFS.daily || []), ...(QUEST_DEFS.weekly || [])];
  for (const q of allQuests) {
    if (q.type === type) {
      state.quests.progress[q.id] = (state.quests.progress[q.id] || 0) + amount;
    }
  }
}

/**
 * Reclama as recompensas de uma missão concluída.
 * @param {Object} state
 * @param {string} questId
 * @param {Object} [callbacks] — { log, floatText, updateAllUI, save }
 * @returns {boolean}
 */
export function claimQuestReward(state, questId, callbacks = {}) {
  checkQuestResets(state);
  if (state.quests.claimed.includes(questId)) return false;

  const allQuests = [...(QUEST_DEFS.daily || []), ...(QUEST_DEFS.weekly || [])];
  const qDef = allQuests.find(q => q.id === questId);
  if (!qDef) return false;

  const progress = state.quests.progress[questId] || 0;
  if (progress < qDef.target) return false;

  state.quests.claimed.push(questId);
  const rew = qDef.reward;

  if (rew.gold) state.gold = (state.gold || 0) + rew.gold;
  if (rew.sp) state.sp = (state.sp || 0) + rew.sp;
  if (rew.magicLamps) state.magicLamps = (state.magicLamps || 0) + rew.magicLamps;
  if (rew.craftPoints) state.craftXp = (state.craftXp || 0) + rew.craftPoints;
  if (rew.passXp) {
    state.battlePass = state.battlePass || { xp: 0, claimedFree: [], claimedPremium: [], unlockedPremium: false };
    state.battlePass.xp += rew.passXp;
  }

  if (callbacks.log) callbacks.log(`🎁 Recompensa Reclamada: **${qDef.name}**!`, 'rarity-legendary');
  if (callbacks.floatText) callbacks.floatText(`🎁 MISSÃO CONCLUÍDA!`, 'float-jackpot');

  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save();
  return true;
}

/**
 * Desbloqueia a trilha Premium do Passe de Batalha de Adena por 100.000g.
 * @param {Object} state
 * @param {Object} [callbacks]
 */
export function unlockPremiumPass(state, callbacks = {}) {
  state.battlePass = state.battlePass || { xp: 0, claimedFree: [], claimedPremium: [], unlockedPremium: false };
  if (state.battlePass.unlockedPremium) return;

  const COST = 100000;
  if (state.gold < COST) {
    if (callbacks.log) callbacks.log(`O Passe Premium custa ${COST.toLocaleString()} Gold. Gold insuficiente!`, 'system');
    return;
  }

  state.gold -= COST;
  state.battlePass.unlockedPremium = true;

  if (callbacks.log) callbacks.log('✨ PASSE PREMIUM DE ADENA ATIVADO COM SUCESSO!', 'rarity-legendary');
  if (callbacks.floatText) callbacks.floatText('PREMIUM ATIVO!', 'float-jackpot');

  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save();
}

/**
 * Reclama a recompensa de um nível do Passe de Batalha (Free ou Premium).
 * @param {Object} state
 * @param {number} tierLevel
 * @param {string} [passType='free'] — 'free' ou 'premium'
 * @param {Object} [callbacks]
 */
export function claimPassReward(state, tierLevel, passType = 'free', callbacks = {}) {
  state.battlePass = state.battlePass || { xp: 0, claimedFree: [], claimedPremium: [], unlockedPremium: false };
  const tier = BATTLE_PASS_TIERS.find(t => t.level === tierLevel);
  if (!tier) return;

  if (state.battlePass.xp < tier.reqXp) return;

  if (passType === 'free') {
    if (state.battlePass.claimedFree.includes(tierLevel)) return;
    state.battlePass.claimedFree.push(tierLevel);
    const rew = tier.free;
    if (rew.gold) state.gold = (state.gold || 0) + rew.gold;
    if (rew.sp) state.sp = (state.sp || 0) + rew.sp;
    if (rew.magicLamps) state.magicLamps = (state.magicLamps || 0) + rew.magicLamps;
    if (rew.item) addToInventory(state, rew.item, rew.count || 1, null, false, callbacks);
    if (callbacks.log) callbacks.log(`🎫 Recompensa Grátis do Passe Nv.${tierLevel} Reclamada!`, 'loot');
  } else if (passType === 'premium') {
    if (!state.battlePass.unlockedPremium) return;
    if (state.battlePass.claimedPremium.includes(tierLevel)) return;
    state.battlePass.claimedPremium.push(tierLevel);
    const rew = tier.premium;
    if (rew.gold) state.gold = (state.gold || 0) + rew.gold;
    if (rew.title) {
      state.titles = state.titles || [];
      if (!state.titles.includes(rew.title)) state.titles.push(rew.title);
    }
    if (rew.item) addToInventory(state, rew.item, rew.count || 1, 'legendary', false, callbacks);
    if (callbacks.log) callbacks.log(`👑 Recompensa PREMIUM do Passe Nv.${tierLevel} Reclamada!`, 'rarity-legendary');
  }

  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save();
}
