/**
 * TowerService.js — Motor da Torre da Insolência (Tower of Insolence) do Lineage Idle.
 *
 * Responsável pela definição de andares (1 a 100), desafios de chefes de andar,
 * bônus permanente acumulativo por andar concluído e sistema de Varredura Diária (Sweep).
 */

import { D } from '../core/GameConfig.js';
import { MONSTERS } from '../data/monsters.js';
import { addToInventory } from './InventoryService.js';
import { hasRoomForStackRewards } from './lifeActivities/RewardCapacity.js';
import { triggerQuestEvent } from './QuestService.js';
import { startCombat, stopCombat } from '../engine/CombatEngine.js';

/**
 * Retorna as propriedades e estatísticas de um andar da Torre.
 * @param {number} floorNum — Número do andar (1 a 100)
 * @returns {Object} Definição do andar
 */
export function getTowerFloorDef(floorNum) {
  const f = Math.max(1, Math.min(100, Number(floorNum) || 1));
  const isBoss = f % 10 === 0;

  const names = {
    10: 'Hallate, o Guardião da Torre (Boss)',
    20: 'Kernea, a Imperatriz de Sangue (Boss)',
    30: 'Varan, o Arquiduque Sombrio (Boss)',
    40: 'Kavatan, o Guardião de Elmore (Boss)',
    50: 'Baium, o Imperador Imortal (Boss)',
    60: 'Galaxia, a Primordial (Boss)',
    70: 'Shielhead, o Titã de Aço (Boss)',
    80: 'Golkonda, o Destruidor de Reinos (Boss)',
    90: 'Verdelet, o Demônio Guardião (Boss)',
    100: 'Arcanjo da Insolência (Final Boss)'
  };

  const name = names[f] || (isBoss ? `Guardião do Andar ${f} (Boss)` : `Guerreiro de Insolência Nv.${f}`);
  const reqLvl = Math.min(100, Math.floor(f * 0.95) + 1);

  const baseHp = Math.floor(120 * Math.pow(1.12, f - 1) * (isBoss ? 2.5 : 1));
  const baseAtk = Math.floor(18 * Math.pow(1.09, f - 1) * (isBoss ? 1.4 : 1));
  const baseDef = Math.floor(10 * Math.pow(1.08, f - 1));

  const mdef = Math.floor(8 * Math.pow(1.07, f - 1));
  const goldReward = Math.floor(300 * Math.pow(1.10, f - 1) * (isBoss ? 3 : 1));
  const spReward = Math.floor(12 * f * (isBoss ? 2 : 1));

  return {
    floor: f,
    name,
    isBoss,
    reqLvl,
    hp: baseHp,
    atk: baseAtk,
    def: baseDef,
    mdef,
    xp: Math.floor(120 * f * 1.5),
    sp: spReward,
    gold: goldReward,
    rewardLamps: isBoss ? Math.floor(f / 10) : 0,
    rewardCrystals: isBoss ? (f >= 50 ? 'crystal_s' : 'crystal_a') : null
  };
}

/**
 * Calculates the minimum CP required to enter a tower floor.
 * Scales exponentially with floor number to match monster stat growth.
 * @param {number} floorNum
 * @returns {number} Minimum CP
 */
export function getTowerFloorMinimumCP(floorNum) {
  const f = Math.max(1, Math.min(100, Number(floorNum) || 1));
  // Base CP of 500 scaling at 1.10× per floor
  return Math.floor(500 * Math.pow(1.10, f - 1));
}

/**
 * Calculates the recommended CP for comfortable tower floor clearing.
 * Approximately 1.45× the minimum CP.
 * @param {number} floorNum
 * @returns {number} Recommended CP
 */
export function getTowerFloorRecommendedCP(floorNum) {
  return Math.floor(getTowerFloorMinimumCP(floorNum) * 1.45);
}

/**
 * Inicia o desafio ao andar atual da Torre da Insolência.
 * @param {Object} state
 * @param {Object} [callbacks] — { log, floatText, el, renderStageMonster, attackMonster }
 */
export function challengeTowerFloor(state, callbacks = {}) {
  state.tower = state.tower || { highestFloor: 0, currentFloor: 1, lastSweepTime: 0 };
  if (state.towerCombatActive) {
    if (callbacks.log) callbacks.log('⚠️ Conclua o andar atual da Torre antes de iniciar outro desafio.', 'warning');
    return { success: false, reason: 'tower_in_progress' };
  }
  if (state.isRaidActive || state.isSpecialInstanceActive || state.activeInstanceId || state.activeMonster?.isRaid || state.activeMonster?.isChaosBoss || state.activeMonster?.isInstanceBoss || state.activeMonster?.isWorldBoss) {
    return { success: false, reason: 'another_instance_active' };
  }
  const highestFloor = Math.max(0, Math.min(100, Math.floor(Number(state.tower.highestFloor) || 0)));
  const targetFloor = highestFloor + 1;
  if (targetFloor > 100) {
    if (callbacks.log) callbacks.log('🏆 Você já conquistou todos os 100 Andares da Torre da Insolência!', 'rarity-legendary');
    return { success: false, reason: 'tower_complete' };
  }

  const fDef = getTowerFloorDef(targetFloor);

  if ((Number(state.level) || 1) < fDef.reqLvl) {
    if (callbacks.log) callbacks.log(`⚠️ Nível insuficiente! O Andar ${targetFloor} requer Nível ${fDef.reqLvl}.`, 'system');
    return { success: false, reason: 'insufficient_level', requiredLevel: fDef.reqLvl };
  }

  const combatPower = Number(callbacks.getCombatPower?.(state) ?? state.stats?.combatPower ?? state.combatPower) || 0;
  const minimumCP = getTowerFloorMinimumCP(targetFloor);
  if (combatPower < minimumCP) {
    if (callbacks.log) callbacks.log(`⚠️ Poder de combate insuficiente! O Andar ${targetFloor} requer ${minimumCP.toLocaleString()} CP.`, 'warning');
    return { success: false, reason: 'insufficient_cp', requiredCP: minimumCP, currentCP: combatPower };
  }

  if (callbacks.log) callbacks.log(`🏰 Desafiando Andar ${targetFloor}: **${fDef.name}**!`, 'rarity-legendary');
  if (callbacks.floatText) callbacks.floatText(`ANDAR ${targetFloor}!`, 'float-jackpot');

  const towerMonsterId = `tower_floor_${targetFloor}`;
  const monsterObj = {
    id: towerMonsterId,
    name: fDef.name,
    hp: fDef.hp,
    _maxHp: fDef.hp,
    maxHp: fDef.hp,
    atk: fDef.atk,
    def: fDef.def,
    mdef: fDef.mdef,
    eva: Math.min(20, Math.floor(fDef.floor / 5)),
    xp: fDef.xp,
    sp: fDef.sp,
    gold: [fDef.gold, Math.floor(fDef.gold * 1.3)],
    boss: fDef.isBoss,
    isTower: true,
    towerFloor: targetFloor,
    _stunnedUntil: 0
  };

  if (state.zone) {
    state.lastHuntingZone = state.zone;
  }
  state.towerCombatActive = true;
  state.towerStartTime = Date.now();

  MONSTERS[towerMonsterId] = monsterObj;
  if (typeof window !== 'undefined') {
    if (window.GameData?.MONSTERS) window.GameData.MONSTERS[towerMonsterId] = monsterObj;
    if (window.ALL_MONSTERS) window.ALL_MONSTERS[towerMonsterId] = monsterObj;
  }
  state.target = towerMonsterId;
  state.activeMonster = monsterObj;
  if (!state.zone) state.zone = 'talkingIsland';

  if (callbacks.el) {
    const sz = callbacks.el('stage-zone');
    if (sz) sz.textContent = `🏰 INSTÂNCIA TORRE · Andar ${targetFloor} (60s)`;
    const zn = callbacks.el('zone-name');
    if (zn) zn.textContent = `Torre Andar ${targetFloor}`;
  }

  stopCombat(state);
  startCombat(state, callbacks);
  if (callbacks.renderStageMonster) callbacks.renderStageMonster();
  if (callbacks.save) callbacks.save();
  return { success: true, floor: targetFloor, monster: monsterObj };
}

/**
 * Finaliza com vitória a conquista de um andar da Torre.
 * @param {Object} state
 * @param {number} floorNum
 * @param {Object} [callbacks]
 */
export function completeTowerFloor(state, floorNum, callbacks = {}) {
  const completedFloor = Math.floor(Number(floorNum));
  const encounter = state.activeMonster;
  if (
    !Number.isInteger(completedFloor) || completedFloor < 1 || completedFloor > 100 ||
    !state.towerCombatActive || !encounter?.isTower || encounter.towerFloor !== completedFloor ||
    !Number.isFinite(Number(encounter.hp)) || Number(encounter.hp) > 0
  ) return false;

  state.towerCombatActive = false;
  state.tower = state.tower || { highestFloor: 0, currentFloor: 1, lastSweepTime: 0 };
  if (floorNum > state.tower.highestFloor) {
    state.tower.highestFloor = floorNum;
    state.tower.currentFloor = Math.min(100, floorNum + 1);

    const fDef = getTowerFloorDef(floorNum);
    if (callbacks.log) callbacks.log(`🏆 VITÓRIA! Andar ${floorNum} Conquistado! Bônus Permanente ATK/DEF +${floorNum}%!`, 'rarity-legendary');
    if (callbacks.floatText) callbacks.floatText(`ANDAR ${floorNum} CONQUISTADO!`, 'float-jackpot');

    if (fDef.rewardLamps > 0) {
      state.magicLamps = (state.magicLamps || 0) + fDef.rewardLamps;
      if (callbacks.log) callbacks.log(`🪔 Recompensa de Primeiro Abate: +${fDef.rewardLamps} Lâmpadas Mágicas!`, 'rarity-epic');
    }
    if (fDef.rewardCrystals) {
      const gData = D();
      const cName = gData?.ALL_ITEMS?.[fDef.rewardCrystals]?.name || fDef.rewardCrystals;
      const reward = { floor: completedFloor, itemId: fDef.rewardCrystals, count: 3 };
      const hasEarlierPending = Array.isArray(state.tower.pendingFirstClearRewards) && state.tower.pendingFirstClearRewards.length > 0;
      const delivered = !hasEarlierPending && hasRoomForStackRewards(state, [reward])
        && addToInventory(state, reward.itemId, reward.count, null, false, callbacks, true);
      if (delivered) {
        if (callbacks.log) callbacks.log(`✨ Recompensa de Primeiro Abate: +3x ${cName}!`, 'rarity-legendary');
      } else {
        state.tower.pendingFirstClearRewards = Array.isArray(state.tower.pendingFirstClearRewards)
          ? state.tower.pendingFirstClearRewards
          : [];
        state.tower.pendingFirstClearRewards.push(reward);
        if (callbacks.log) callbacks.log(`🎁 A recompensa de ${cName} ficou guardada na Torre: libere espaço e resgate pelo painel da Torre.`, 'warning');
      }
    }

    triggerQuestEvent(state, 'boss', 1);
  }

  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save(true, true);
  return true;
}

export function claimPendingTowerRewards(state, callbacks = {}) {
  const pending = state?.tower?.pendingFirstClearRewards;
  if (!Array.isArray(pending) || pending.length === 0) return false;
  const rewards = pending
    .filter(reward => reward?.itemId && Number.isSafeInteger(reward.count) && reward.count > 0)
    .map(reward => ({ itemId: reward.itemId, count: reward.count }));
  if (rewards.length !== pending.length || !hasRoomForStackRewards(state, rewards)) {
    if (callbacks.log) callbacks.log('⚠️ Libere espaço na mochila para resgatar as recompensas da Torre.', 'warning');
    return false;
  }

  const previewState = { ...state, inventory: structuredClone(Array.isArray(state.inventory) ? state.inventory : []) };
  for (const reward of rewards) {
    if (!addToInventory(previewState, reward.itemId, reward.count, null, false, {}, true)) return false;
  }
  state.inventory = previewState.inventory;
  state.tower.pendingFirstClearRewards = [];
  if (callbacks.log) callbacks.log(`✨ Recompensas pendentes da Torre resgatadas: ${rewards.reduce((sum, reward) => sum + reward.count, 0)} item(ns).`, 'rarity-legendary');
  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save(true, true);
  return true;
}

/**
 * Realiza a Varredura Diária (Sweep) da Torre da Insolência coletando 50% dos recursos de todos os andares conquistados.
 * @param {Object} state
 * @param {Object} [callbacks]
 */
export function sweepTowerDaily(state, callbacks = {}) {
  state.tower = state.tower || { highestFloor: 0, currentFloor: 1, lastSweepTime: 0 };
  const highest = Math.max(0, Math.min(100, Math.floor(Number(state.tower.highestFloor) || 0)));
  state.tower.highestFloor = highest;
  if (highest < 1) {
    if (callbacks.log) callbacks.log('Conquiste ao menos 1 Andar da Torre para realizar a Varredura Diária!', 'system');
    return;
  }

  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  if (state.tower.lastSweepTime && (now - state.tower.lastSweepTime) < ONE_DAY) {
    if (callbacks.log) callbacks.log('A Varredura Diária já foi realizada hoje! Tente novamente amanhã.', 'system');
    return;
  }

  state.tower.lastSweepTime = now;

  let totalGold = 0;
  let totalSp = 0;
  for (let i = 1; i <= highest; i++) {
    const fDef = getTowerFloorDef(i);
    totalGold += Math.floor(fDef.gold * 0.5);
    totalSp += Math.floor(fDef.sp * 0.5);
  }

  state.gold = (state.gold || 0) + totalGold;
  state.sp = (state.sp || 0) + totalSp;

  if (callbacks.log) callbacks.log(`🧹 VARREDURA DA TORRE! Reclamou recompensas de ${highest} andares: +${totalGold.toLocaleString()} Gold, +${totalSp.toLocaleString()} SP!`, 'rarity-legendary');
  if (callbacks.floatText) callbacks.floatText(`+${totalGold.toLocaleString()}g VARREDURA!`, 'float-jackpot');

  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save(true, true);
  return { success: true, gold: totalGold, sp: totalSp, highestFloor: highest };
}
