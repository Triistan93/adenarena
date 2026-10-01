// InstanceService.js — Gerenciador de jornadas solo e desafios especiais
import { SOLO_INSTANCES } from '../data/instances.js';
import { startCombat } from '../engine/CombatEngine.js';

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

  getWeeklyEntries(state, now = Date.now()) {
    const date = new Date(now);
    const daysSinceMonday = (date.getUTCDay() + 6) % 7;
    date.setUTCDate(date.getUTCDate() - daysSinceMonday);
    const weekKey = date.toISOString().slice(0, 10);
    if (state.weeklyInstanceEntries?.weekKey !== weekKey) state.weeklyInstanceEntries = { weekKey, completed: {} };
    return state.weeklyInstanceEntries;
  },

  getEntryCompletions(state, inst, now = Date.now()) {
    return (inst?.entryReset === 'weekly' ? this.getWeeklyEntries(state, now) : this.getDailyEntries(state)).completed;
  },

  canEnterInstance(state, instanceId, now = Date.now()) {
    const inst = SOLO_INSTANCES[instanceId];
    if (!inst) return { ok: false, reason: 'invalid_instance' };

    const pLvl = state.level || 1;
    if (pLvl < inst.minLvl) {
      return { ok: false, reason: `Nível insuficiente! Exige Nível ${inst.minLvl}+.` };
    }
    if (inst.maxLvl && pLvl > inst.maxLvl) {
      return { ok: false, reason: `Nível acima da faixa! Esta instância aceita até o Nível ${inst.maxLvl}.` };
    }

    const combatPower = Number(state.stats?.combatPower ?? state.combatPower) || 0;
    if (inst.minimumCP && combatPower < inst.minimumCP) {
      return { ok: false, reason: `Poder de Combate insuficiente! Mínimo: ${inst.minimumCP.toLocaleString('pt-BR')} CP.` };
    }

    const entries = inst.entryReset === 'weekly' ? this.getWeeklyEntries(state, now) : this.getDailyEntries(state);
    if (entries.completed[instanceId]) {
      return { ok: false, reason: inst.entryReset === 'weekly' ? `${inst.name} já concluída nesta semana.` : 'Instância já concluída hoje! Retorne amanhã após o reset diário.' };
    }

    if (inst.eventWindow) {
      const date = new Date(now);
      const weekday = date.getUTCDay();
      const hour = date.getUTCHours();
      const { weekdayUTC, startHourUTC, endHourUTC } = inst.eventWindow;
      if (weekday !== weekdayUTC || hour < startHourUTC || hour >= endHourUTC) {
        return { ok: false, reason: `Evento abre sexta-feira, das ${String(startHourUTC).padStart(2, '0')}:00 às ${String(endHourUTC).padStart(2, '0')}:00 UTC.` };
      }
    }

    return { ok: true };
  },

  challengeInstance(state, instanceId, callbacks = {}) {
    const check = this.canEnterInstance(state, instanceId, Number.isFinite(callbacks.now) ? callbacks.now : Date.now());
    if (!check.ok) {
      if (callbacks.log) callbacks.log(check.reason, 'warning');
      return { success: false, reason: check.reason };
    }

    const inst = SOLO_INSTANCES[instanceId];

    // Spawn do Chefe de Instância
    if (state.zone) state.lastHuntingZone = state.zone;
    state.zone = state.zone || state.lastSafeZone || 'talkingIsland';
    state.target = instanceId;
    state.isSpecialInstanceActive = true;
    state.activeInstanceId = instanceId;
    state.activeInstanceStage = 0;
    state.activeInstancePhase = 1;
    state.activeInstanceStatus = null;
    state.activeMonster = this.createInstanceBoss(inst, 0, false);
    startCombat(state, callbacks);

    if (callbacks.log) callbacks.log(`🌀 Você adentrou em **${inst.name}**! Desafie **${inst.bossName}**!`, 'boss');
    if (callbacks.floatText) callbacks.floatText('🌀 INSTÂNCIA SOLO INICIADA!', 'float-epic');

    if (callbacks.renderStageMonster) callbacks.renderStageMonster();
    if (callbacks.updateAllUI) callbacks.updateAllUI();
    return { success: true };
  },

  createInstanceBoss(inst, stageIndex, alternateFinal = false) {
    const stage = inst.stages?.[stageIndex];
    if (!stage) {
      return {
        id: inst.id, name: `[Solo Instance] ${inst.bossName}`, lvl: inst.minLvl, hp: inst.bossHp, _maxHp: inst.bossHp,
        atk: inst.bossAtk, def: inst.bossDef, mdef: inst.bossMdef, xp: inst.rewards.xp,
        gold: [Math.floor(inst.rewards.gold * 0.9), inst.rewards.gold], boss: true, isInstanceBoss: true,
        instanceId: inst.id, _stunnedUntil: 0
      };
    }

    const isAlternate = alternateFinal && stageIndex === inst.stages.length - 1;
    const hp = isAlternate ? (stage.alternateHp || stage.hp) : stage.hp;
    return {
      id: `${inst.id}_${stage.id}${isAlternate ? '_dreadful' : ''}`,
      name: isAlternate ? (stage.alternateName || stage.name) : stage.name,
      lvl: inst.minLvl,
      hp, _maxHp: hp, maxHp: hp,
      atk: isAlternate ? (stage.alternateAtk || stage.atk) : stage.atk,
      def: stage.def, mdef: stage.mdef,
      xp: Math.floor(inst.rewards.xp / inst.stages.length),
      gold: [Math.floor(inst.rewards.gold / (inst.stages.length * 1.1)), Math.ceil(inst.rewards.gold / inst.stages.length)],
      boss: true, isInstanceBoss: true, instanceId: inst.id, instanceStage: stageIndex,
      skill: isAlternate ? (stage.alternateSkill || stage.skill) : stage.skill,
      phases: stage.phases,
      _stunnedUntil: 0
    };
  },

  processInstanceBossMechanics(state, callbacks = {}) {
    const monster = state.activeMonster;
    if (!monster?.isInstanceBoss || !monster._maxHp) return;
    const now = Number.isFinite(callbacks.now) ? callbacks.now : Date.now();
    const hpRatio = monster.hp / monster._maxHp;
    monster._triggeredPhases = monster._triggeredPhases || {};

    for (let i = 0; i < (monster.phases || []).length; i++) {
      const phase = monster.phases[i];
      if (hpRatio > phase.triggerHp || monster._triggeredPhases[i]) continue;
      monster._triggeredPhases[i] = true;
      state.activeInstancePhase = i + 2;
      monster.atk = Math.floor((monster.atk || 100) * (Number(phase.atkMultiplier) || 1));
      if (phase.statusEffect) {
        const effect = phase.statusEffect;
        const intervalMs = Math.max(250, Number(effect.intervalMs) || 1000);
        const durationMs = Math.max(intervalMs, Number(effect.durationMs) || intervalMs);
        state.activeInstanceStatus = {
          name: effect.name || phase.name,
          damagePercent: Math.max(0, Number(effect.damagePercent) || 0),
          expiresAt: now + durationMs,
          nextTickAt: now + intervalMs
        };
      }
      if (callbacks.log) callbacks.log(`${phase.text} **Fase ${i + 2}: ${phase.name}**!`, 'rarity-epic');
      if (callbacks.floatText) callbacks.floatText(`🌊 FASE ${i + 2}: ${phase.name}`, 'sf-crit');
      if (callbacks.onPhaseChange) callbacks.onPhaseChange(phase, i + 2);
    }

    const status = state.activeInstanceStatus;
    if (status && now >= status.expiresAt) {
      state.activeInstanceStatus = null;
      if (callbacks.log) callbacks.log(`💨 O efeito **${status.name}** terminou.`, 'system');
    } else if (status && now >= status.nextTickAt && state.hp > 0) {
      const damage = Math.max(1, Math.floor((state.maxHp || 100) * status.damagePercent));
      const appliedDamage = Math.min(state.hp, damage);
      state.hp = Math.max(0, state.hp - appliedDamage);
      status.nextTickAt = now + 1000;
      if (callbacks.log) callbacks.log(`☠️ **${status.name}** causa ${appliedDamage.toLocaleString('pt-BR')} de dano contínuo.`, 'combat');
      if (callbacks.onStatusImpact) callbacks.onStatusImpact(appliedDamage, status);
      if (state.hp <= 0) state.activeInstanceStatus = null;
    }
  },

  onInstanceBossVictory(state, instanceId, callbacks = {}) {
    const inst = SOLO_INSTANCES[instanceId];
    if (!inst) return;

    const entries = inst.entryReset === 'weekly'
      ? this.getWeeklyEntries(state, Number.isFinite(callbacks.now) ? callbacks.now : Date.now())
      : this.getDailyEntries(state);
    if (entries.completed[instanceId]) return { completed: false, duplicate: true };
    const stages = inst.stages || [];
    const currentStage = Number(state.activeMonster?.instanceStage ?? state.activeInstanceStage) || 0;
    if (stages.length && currentStage < stages.length - 1) {
      const nextStage = currentStage + 1;
      const alternateFinal = nextStage === stages.length - 1 && currentStage === 1 && (Number(state.hp) || 0) / Math.max(1, Number(state.maxHp) || 1) >= 0.5;
      state.activeInstanceStage = nextStage;
      state.activeMonster = this.createInstanceBoss(inst, nextStage, alternateFinal);
      if (callbacks.log) callbacks.log(`❄️ Etapa ${nextStage + 1}/${stages.length}: **${state.activeMonster.name}** entra na arena!`, 'rarity-epic');
      if (callbacks.floatText) callbacks.floatText(`❄️ ETAPA ${nextStage + 1}/${stages.length}`, 'float-epic');
      if (callbacks.renderStageMonster) callbacks.renderStageMonster();
      return { advanced: true, completed: false };
    }

    entries.completed[instanceId] = true;
    state.isSpecialInstanceActive = false;
    state.activeInstanceId = null;
    state.activeInstanceStage = null;
    state.activeInstancePhase = null;
    state.activeInstanceStatus = null;

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
    return { advanced: false, completed: true };
  }
};
