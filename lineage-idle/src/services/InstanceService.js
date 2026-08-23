// InstanceService.js — Gerenciador de Kamaloka & Pailaka
import { SOLO_INSTANCES } from '../data/instances.js';

export const InstanceService = {
  getDailyEntries(state) {
    if (!state.instanceEntries) {
      state.instanceEntries = {
        lastReset: Date.now(),
        completed: {}
      };
    }
    // Reset diário a cada 24 horas
    const now = Date.now();
    if (now - (state.instanceEntries.lastReset || 0) > 86400000) {
      state.instanceEntries.lastReset = now;
      state.instanceEntries.completed = {};
    }
    return state.instanceEntries;
  },

  canEnterInstance(state, instanceId) {
    const inst = SOLO_INSTANCES[instanceId];
    if (!inst) return { ok: false, reason: 'invalid_instance' };

    const pLvl = state.level || 1;
    if (pLvl < inst.minLvl) {
      return { ok: false, reason: `Nível insuficiente! Exige Nível ${inst.minLvl}+.` };
    }

    const entries = this.getDailyEntries(state);
    if (entries.completed[instanceId]) {
      return { ok: false, reason: 'Instância já concluída hoje! Retorne amanhã após o reset diário.' };
    }

    return { ok: true };
  },

  challengeInstance(state, instanceId, callbacks = {}) {
    const check = this.canEnterInstance(state, instanceId);
    if (!check.ok) {
      if (callbacks.log) callbacks.log(check.reason, 'warning');
      return { success: false, reason: check.reason };
    }

    const inst = SOLO_INSTANCES[instanceId];
    
    // Spawn do Chefe de Instância
    state.activeMonster = {
      id: inst.id,
      name: `[Solo Instance] ${inst.bossName}`,
      hp: inst.bossHp,
      _maxHp: inst.bossHp,
      atk: inst.bossAtk,
      xp: inst.rewards.xp,
      gold: [Math.floor(inst.rewards.gold * 0.9), inst.rewards.gold],
      boss: true,
      isInstanceBoss: true,
      instanceId: inst.id,
      _stunnedUntil: 0
    };

    if (callbacks.log) callbacks.log(`🌀 Você adentrou em **${inst.name}**! Desafie **${inst.bossName}**!`, 'boss');
    if (callbacks.floatText) callbacks.floatText('🌀 INSTÂNCIA SOLO INICIADA!', 'float-epic');

    if (callbacks.renderStageMonster) callbacks.renderStageMonster();
    if (callbacks.updateAllUI) callbacks.updateAllUI();
    return { success: true };
  },

  onInstanceBossVictory(state, instanceId, callbacks = {}) {
    const inst = SOLO_INSTANCES[instanceId];
    if (!inst) return;

    const entries = this.getDailyEntries(state);
    entries.completed[instanceId] = true;

    state.sp = (state.sp || 0) + (inst.rewards.sp || 0);

    if (inst.rewards.items) {
      for (const itId of inst.rewards.items) {
        state.inventory = state.inventory || [];
        const existing = state.inventory.find(i => i.itemId === itId);
        if (existing) {
          existing.count = (existing.count || 1) + 1;
        } else {
          state.inventory.push({
            uid: 'inst_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            itemId: itId,
            count: 1,
            equipped: false
          });
        }
      }
    }

    if (callbacks.log) {
      callbacks.log(`🏆 VITÓRIA EM ${inst.name.toUpperCase()}! Recompensas recebidas: +${inst.rewards.xp.toLocaleString()} XP, +${inst.rewards.gold.toLocaleString()} Adena, +${inst.rewards.sp} SP e ${inst.rewards.guaranteedRewardText}!`, 'rarity-legendary');
    }
    if (callbacks.floatText) {
      callbacks.floatText('🏆 INSTÂNCIA CONCLUÍDA!', 'float-jackpot');
    }

    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
  }
};
