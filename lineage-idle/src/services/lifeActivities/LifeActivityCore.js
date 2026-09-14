/**
 * LifeActivityCore.js — Abstração Central Canônica de Life Activities.
 * 
 * Gerencia o ciclo de vida compartilhado de Pesca, Caça, Coleta e Mineração:
 * - Start / Stop / Tick
 * - Validação e desgaste de ferramentas (com quebra estrita e interrupção de atividade)
 * - Consumo de iscas / reagentes
 * - Progressão de nível 1 a 40 (Season 1 Cap)
 * - Simulação offline determinística com limites e relatório detalhado
 * - Persistência compacta compatível com Firestore
 */

import { addToInventory, removeFromInventory, getInventoryCount } from '../InventoryService.js';
import { RewardEngine } from './RewardEngine.js';

export const LIFE_ACTIVITY_LEVEL_TABLE = {
  1: 0,
  2: 120,
  3: 280,
  4: 520,
  5: 900,       // Desbloqueia Auto Mode (AFK)
  6: 1400,
  7: 2100,
  8: 3000,
  9: 4200,
  10: 5800,     // Desbloqueia Ferramentas D-Grade
  11: 7800,
  12: 10200,
  13: 13100,
  14: 16600,
  15: 20800,
  16: 25800,
  17: 31700,
  18: 38600,
  19: 46600,
  20: 56000,    // Desbloqueia Zonas Avançadas
  21: 67000,
  22: 79800,
  23: 94600,
  24: 111600,
  25: 13100,
  26: 153000,
  27: 178000,
  28: 206000,
  29: 238000,
  30: 275000,   // Desbloqueia Ferramentas C-Grade
  31: 318000,
  32: 368000,
  33: 426000,
  34: 493000,
  35: 570000,
  36: 658000,
  37: 759000,
  38: 874000,
  39: 1005000,
  40: 1155000   // Maestria Máxima Season 1
};

export const TOOL_DURABILITY_BY_GRADE = {
  none: 50,
  nograde: 50,
  d: 100,
  c: 200,
  b: 350,
  a: 500,
  s: 800
};

export const LifeActivityCore = {
  /**
   * Garante e retorna a estrutura de estado canônica para a atividade informada.
   */
  getActivityState(state, activityType) {
    if (!state.lifeActivities) {
      state.lifeActivities = {};
    }
    if (!state.lifeActivities[activityType]) {
      state.lifeActivities[activityType] = {
        level: 1,
        xp: 0,
        tool: null,
        toolDurability: 50,
        maxDurability: 50,
        consumable: null,
        consumableCount: 0,
        zoneId: null,
        isWorking: false,
        autoMode: false,
        lastTick: 0,
        consecutiveFailures: 0,
        codexDiscoveries: {}
      };
    }
    return state.lifeActivities[activityType];
  },

  /**
   * Inicia a execução de uma atividade verificando ferramentas e durabilidade.
   */
  startActivity(state, activityType, zoneId, callbacks = {}) {
    const actState = this.getActivityState(state, activityType);
    const log = callbacks.log || (() => {});

    if ((actState.toolDurability || 0) <= 0) {
      log(`⚠️ Sua ferramenta está quebrada! Repare-a na cidade antes de continuar.`, 'warning');
      actState.isWorking = false;
      actState.autoMode = false;
      return { success: false, reason: 'tool_broken' };
    }

    actState.zoneId = zoneId;
    actState.isWorking = true;
    actState.lastTick = Date.now();

    if (callbacks.updateUI) callbacks.updateUI();
    if (callbacks.save) callbacks.save();
    return { success: true };
  },

  /**
   * Interrompe a atividade.
   */
  stopActivity(state, activityType, callbacks = {}) {
    const actState = this.getActivityState(state, activityType);
    actState.isWorking = false;
    actState.autoMode = false;
    if (callbacks.updateUI) callbacks.updateUI();
    if (callbacks.save) callbacks.save();
    return { success: true };
  },

  /**
   * Consome 1 ponto de durabilidade da ferramenta.
   * Se atingir 0, interrompe a atividade com aviso oficial.
   */
  consumeDurability(state, activityType, callbacks = {}) {
    const actState = this.getActivityState(state, activityType);
    const log = callbacks.log || (() => {});

    actState.toolDurability = Math.max(0, (actState.toolDurability || 0) - 1);

    if (actState.toolDurability <= 0) {
      actState.isWorking = false;
      actState.autoMode = false;
      log(`💥 **FERRAMENTA QUEBRADA!** Sua ferramenta de ${activityType} atingiu 0 de durabilidade e a atividade foi interrompida. Repare-a na cidade.`, 'error');
      if (callbacks.floatText) callbacks.floatText('💥 FERRAMENTA QUEBROU!', 'float-damage');
      if (callbacks.updateUI) callbacks.updateUI();
      if (callbacks.save) callbacks.save();
      return { broken: true };
    }

    return { broken: false, remaining: actState.toolDurability };
  },

  /**
   * Concede XP de maestria e processa subida de nível.
   */
  addXp(state, activityType, amount, callbacks = {}) {
    const actState = this.getActivityState(state, activityType);
    const log = callbacks.log || (() => {});
    const maxLevel = 40; // Season 1 Cap

    if (actState.level >= maxLevel) {
      actState.xp = LIFE_ACTIVITY_LEVEL_TABLE[maxLevel];
      return { levelUp: false, level: maxLevel };
    }

    actState.xp = (actState.xp || 0) + amount;
    let didLevelUp = false;

    while (actState.level < maxLevel) {
      const nextLvlXp = LIFE_ACTIVITY_LEVEL_TABLE[actState.level + 1];
      if (actState.xp >= nextLvlXp) {
        actState.level++;
        didLevelUp = true;
        log(`⭐ **EVOLUÇÃO DE MAESTRIA!** Sua habilidade de ${activityType.toUpperCase()} subiu para o **Nível ${actState.level}**!`, 'gain');
        if (callbacks.floatText) callbacks.floatText(`⭐ ${activityType.toUpperCase()} LV ${actState.level}!`, 'float-gain');
      } else {
        break;
      }
    }

    if (didLevelUp && callbacks.updateUI) callbacks.updateUI();
    return { levelUp: didLevelUp, level: actState.level };
  },

  /**
   * Repara a durabilidade da ferramenta usando Adena.
   */
  repairTool(state, activityType, costPerPoint = 10, callbacks = {}) {
    const actState = this.getActivityState(state, activityType);
    const log = callbacks.log || (() => {});
    const maxDur = actState.maxDurability || 50;
    const missing = maxDur - (actState.toolDurability || 0);

    if (missing <= 0) {
      log('Sua ferramenta já está com 100% de durabilidade.', 'system');
      return { success: false, reason: 'already_max' };
    }

    const totalCost = missing * costPerPoint;
    if ((state.gold || 0) < totalCost) {
      log(`Adena insuficiente para reparo. Necessário: ${totalCost.toLocaleString()} Adena.`, 'warning');
      return { success: false, reason: 'insufficient_gold' };
    }

    state.gold -= totalCost;
    actState.toolDurability = maxDur;
    log(`🛠️ Ferramenta de ${activityType} reparada com sucesso (+${missing} durabilidade) por ${totalCost.toLocaleString()} Adena.`, 'gain');

    if (callbacks.updateUI) callbacks.updateUI();
    if (callbacks.save) callbacks.save();
    return { success: true, repaired: missing, cost: totalCost };
  },

  /**
   * Registra descoberta no Codex da atividade.
   */
  recordCodexDiscovery(state, activityType, speciesOrNodeId) {
    const actState = this.getActivityState(state, activityType);
    actState.codexDiscoveries = actState.codexDiscoveries || {};
    const isFirstTime = !actState.codexDiscoveries[speciesOrNodeId];
    actState.codexDiscoveries[speciesOrNodeId] = (actState.codexDiscoveries[speciesOrNodeId] || 0) + 1;
    return { isFirstTime, count: actState.codexDiscoveries[speciesOrNodeId] };
  },

  /**
   * Simulação determinística de progresso offline.
   * Capped em no máximo 480 minutos (8h).
   * Interrompe imediatamente se a durabilidade zerar durante o tempo offline!
   */
  processOfflineProgress(state, activityType, elapsedMinutes, activityConfig, callbacks = {}) {
    const actState = this.getActivityState(state, activityType);
    if (!actState.autoMode || !actState.isWorking) {
      return null; // Não estava ativo em modo automático
    }

    // Limitador de segurança: máximo 480 minutos (8 horas)
    const validMinutes = Math.min(480, Math.max(0, Math.floor(elapsedMinutes)));
    if (validMinutes < 5) return null;

    const cycleMinutes = activityConfig?.cycleMinutes || 2;
    const efficiency = 0.30; // Eficiência padrão do modo offline de Aden Arena
    const potentialAttempts = Math.floor((validMinutes / cycleMinutes) * efficiency);

    let actualAttempts = 0;
    let toolBroke = false;
    let totalItems = {};
    let totalXp = 0;

    for (let i = 0; i < potentialAttempts; i++) {
      if ((actState.toolDurability || 0) <= 0) {
        toolBroke = true;
        actState.isWorking = false;
        actState.autoMode = false;
        break;
      }

      // Consome durabilidade
      actState.toolDurability = Math.max(0, actState.toolDurability - 1);
      actualAttempts++;

      // Rola recompensa via RewardEngine
      const targetDef = activityConfig?.getRandomTarget ? activityConfig.getRandomTarget(actState.zoneId) : null;
      if (targetDef) {
        const reward = RewardEngine.resolveAttemptReward({
          activityType,
          activityState: actState,
          baseChance: activityConfig.baseSuccessChance || 0.70,
          targetDef
        });

        if (reward.success && reward.primaryDrop) {
          const pId = reward.primaryDrop.itemId;
          totalItems[pId] = (totalItems[pId] || 0) + reward.primaryDrop.count;
          totalXp += (reward.xp || 10);

          if (reward.secondaryDrop) {
            const sId = reward.secondaryDrop.itemId;
            totalItems[sId] = (totalItems[sId] || 0) + reward.secondaryDrop.count;
          }
        }
      }
    }

    // Entrega itens ao inventário de forma segura
    for (const [itemId, count] of Object.entries(totalItems)) {
      addToInventory(state, itemId, count, 'common', false, callbacks);
    }

    // Adiciona XP acumulada
    if (totalXp > 0) {
      this.addXp(state, activityType, totalXp, callbacks);
    }

    // Relatório offline estruturado
    return {
      activityType,
      elapsedMinutes: validMinutes,
      effectiveMinutes: Math.round(actualAttempts * cycleMinutes / efficiency),
      attempts: actualAttempts,
      itemsObtained: totalItems,
      xpGained: totalXp,
      toolBroke,
      remainingDurability: actState.toolDurability
    };
  }
};
