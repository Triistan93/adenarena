/**
 * TowerService.js ÔÇö Motor da Torre da Insol├¬ncia (Tower of Insolence) do Lineage Idle.
 *
 * Respons├ível pela defini├º├úo de andares (1 a 100), desafios de chefes de andar,
 * b├┤nus permanente acumulativo por andar conclu├¡do e sistema de Varredura Di├íria (Sweep).
 */

import { D } from '../core/GameConfig.js';
import { MONSTERS } from '../data/monsters.js';
import { addToInventory } from './InventoryService.js';
import { triggerQuestEvent } from './QuestService.js';

/**
 * Retorna as propriedades e estat├¡sticas de um andar da Torre.
 * @param {number} floorNum ÔÇö N├║mero do andar (1 a 100)
 * @returns {Object} Defini├º├úo do andar
 */
export function getTowerFloorDef(floorNum) {
  const f = Math.max(1, Math.min(100, Number(floorNum) || 1));
  const isBoss = f % 10 === 0;

  const names = {
    10: 'Hallate, o Guardi├úo da Torre (Boss)',
    20: 'Kernea, a Imperatriz de Sangue (Boss)',
    30: 'Varan, o Arquiduque Sombrio (Boss)',
    40: 'Kavatan, o Guardi├úo de Elmore (Boss)',
    50: 'Baium, o Imperador Imortal (Boss)',
    60: 'Galaxia, a Primordial (Boss)',
    70: 'Shielhead, o Tit├ú de A├ºo (Boss)',
    80: 'Golkonda, o Destruidor de Reinos (Boss)',
    90: 'Verdelet, o Dem├┤nio Guardi├úo (Boss)',
    100: 'Arcanjo da Insol├¬ncia (Final Boss)'
  };

  const name = names[f] || (isBoss ? `Guardi├úo do Andar ${f} (Boss)` : `Guerreiro de Insol├¬ncia Nv.${f}`);
  const reqLvl = Math.min(100, Math.floor(f * 0.95) + 1);

  const baseHp = Math.floor(120 * Math.pow(1.12, f - 1) * (isBoss ? 2.5 : 1));
  const baseAtk = Math.floor(18 * Math.pow(1.09, f - 1) * (isBoss ? 1.4 : 1));
  const baseDef = Math.floor(10 * Math.pow(1.08, f - 1));

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
    xp: Math.floor(120 * f * 1.5),
    sp: spReward,
    gold: goldReward,
    rewardLamps: isBoss ? Math.floor(f / 10) : 0,
    rewardCrystals: isBoss ? (f >= 50 ? 'crystal_s' : 'crystal_a') : null
  };
}

/**
 * Inicia o desafio ao andar atual da Torre da Insol├¬ncia.
 * @param {Object} state
 * @param {Object} [callbacks] ÔÇö { log, floatText, el, renderStageMonster, attackMonster }
 */
export function challengeTowerFloor(state, callbacks = {}) {
  state.tower = state.tower || { highestFloor: 0, currentFloor: 1, lastSweepTime: 0 };
  const targetFloor = (state.tower.highestFloor || 0) + 1;
  if (targetFloor > 100) {
    if (callbacks.log) callbacks.log('­ƒÅå Voc├¬ j├í conquistou todos os 100 Andares da Torre da Insol├¬ncia!', 'rarity-legendary');
    return;
  }

  const fDef = getTowerFloorDef(targetFloor);

  if (state.level < fDef.reqLvl) {
    if (callbacks.log) callbacks.log(`ÔÜá´©Å N├¡vel insuficiente! O Andar ${targetFloor} requer N├¡vel ${fDef.reqLvl}.`, 'system');
    return;
  }

  if (callbacks.log) callbacks.log(`­ƒÅ░ Desafiando Andar ${targetFloor}: **${fDef.name}**!`, 'rarity-legendary');
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
    eva: Math.min(20, Math.floor(fDef.floor / 5)),
    xp: fDef.xp,
    sp: fDef.sp,
    gold: [fDef.gold, Math.floor(fDef.gold * 1.3)],
    boss: fDef.isBoss,
    isTower: true,
    towerFloor: targetFloor,
    _stunnedUntil: 0
  };

  MONSTERS[towerMonsterId] = monsterObj;
  state.target = towerMonsterId;
  state.activeMonster = monsterObj;
  if (!state.zone) state.zone = 'talkingIsland';

  if (callbacks.el) {
    const sz = callbacks.el('stage-zone');
    if (sz) sz.textContent = `­ƒÅ░ TORRE ┬À Andar ${targetFloor}`;
  }

  state.combatActive = true;
  if (callbacks.renderStageMonster) callbacks.renderStageMonster();
}

/**
 * Finaliza com vit├│ria a conquista de um andar da Torre.
 * @param {Object} state
 * @param {number} floorNum
 * @param {Object} [callbacks]
 */
export function completeTowerFloor(state, floorNum, callbacks = {}) {
  state.tower = state.tower || { highestFloor: 0, currentFloor: 1, lastSweepTime: 0 };
  if (floorNum > state.tower.highestFloor) {
    state.tower.highestFloor = floorNum;
    state.tower.currentFloor = Math.min(100, floorNum + 1);

    const fDef = getTowerFloorDef(floorNum);
    if (callbacks.log) callbacks.log(`­ƒÅå VIT├ôRIA! Andar ${floorNum} Conquistado! B├┤nus Permanente ATK/DEF +${floorNum}%!`, 'rarity-legendary');
    if (callbacks.floatText) callbacks.floatText(`ANDAR ${floorNum} CONQUISTADO!`, 'float-jackpot');

    if (fDef.rewardLamps > 0) {
      state.magicLamps = (state.magicLamps || 0) + fDef.rewardLamps;
      if (callbacks.log) callbacks.log(`­ƒ¬ö Recompensa de Primeiro Abate: +${fDef.rewardLamps} L├ómpadas M├ígicas!`, 'rarity-epic');
    }
    if (fDef.rewardCrystals) {
      addToInventory(state, fDef.rewardCrystals, 3, null, false, callbacks);
      const gData = D();
      const cName = gData?.ALL_ITEMS?.[fDef.rewardCrystals]?.name || fDef.rewardCrystals;
      if (callbacks.log) callbacks.log(`Ô£¿ Recompensa de Primeiro Abate: +3x ${cName}!`, 'rarity-legendary');
    }

    triggerQuestEvent(state, 'boss', 1);
  }

  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save();
}

/**
 * Realiza a Varredura Di├íria (Sweep) da Torre da Insol├¬ncia coletando 50% dos recursos de todos os andares conquistados.
 * @param {Object} state
 * @param {Object} [callbacks]
 */
export function sweepTowerDaily(state, callbacks = {}) {
  state.tower = state.tower || { highestFloor: 0, currentFloor: 1, lastSweepTime: 0 };
  const highest = state.tower.highestFloor || 0;
  if (highest < 1) {
    if (callbacks.log) callbacks.log('Conquiste ao menos 1 Andar da Torre para realizar a Varredura Di├íria!', 'system');
    return;
  }

  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  if (state.tower.lastSweepTime && (now - state.tower.lastSweepTime) < ONE_DAY) {
    if (callbacks.log) callbacks.log('A Varredura Di├íria j├í foi realizada hoje! Tente novamente amanh├ú.', 'system');
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

  if (callbacks.log) callbacks.log(`­ƒº╣ VARREDURA DA TORRE! Reclamou recompensas de ${highest} andares: +${totalGold.toLocaleString()} Gold, +${totalSp.toLocaleString()} SP!`, 'rarity-legendary');
  if (callbacks.floatText) callbacks.floatText(`+${totalGold.toLocaleString()}g VARREDURA!`, 'float-jackpot');

  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save();
}