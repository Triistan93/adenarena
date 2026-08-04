/**
 * CombatEngine.js — Motor de Combate, Zonas, Monstros e Bosses do Lineage Idle.
 *
 * Responsável pelo controle de loops de combate (start/stop), spawn de monstros/elites/bosses,
 * chaveamento de zonas de caça, avanço de sagas, morte e ressurreição do personagem.
 */

import { ZONES, SAGAS } from '../data/zones.js';
import { MONSTERS } from '../data/monsters.js';
import { RACES } from '../data/races.js';
import { getStats } from './StatsEngine.js';

let combatInterval = null;
let monsterAttackTimeout = null;

/**
 * Inicia o loop de combate na zona atual.
 * @param {Object} state — Estado do jogo
 * @param {Object} [callbacks] — { log, attackMonster }
 */
export function startCombat(state, callbacks = {}) {
  if (state.combatActive) return;
  if (!state.zone || !ZONES[state.zone]) return;

  state.combatActive = true;
  if (callbacks.log) callbacks.log(`Entering ${ZONES[state.zone].name}...`, 'system');

  pickRandomMonster(state, callbacks);
  state._cds = {};

  if (combatInterval) clearInterval(combatInterval);
  if (typeof callbacks.attackMonster === 'function') {
    combatInterval = setInterval(() => callbacks.attackMonster(), 200);
  }
}

/**
 * Interrompe o loop de combate ativo.
 * @param {Object} state
 */
export function stopCombat(state) {
  state.combatActive = false;
  if (combatInterval) {
    clearInterval(combatInterval);
    combatInterval = null;
  }
  if (monsterAttackTimeout) {
    clearTimeout(monsterAttackTimeout);
    monsterAttackTimeout = null;
  }
}

/**
 * Seleciona e gera um novo monstro aleatório (ou o Chefe de Zona se a meta de kills for atingida).
 * @param {Object} state
 * @param {Object} [callbacks] — { log, floatText, renderStageMonster, updateZoneKillProgressUI }
 */
export function pickRandomMonster(state, callbacks = {}) {
  if (state.activeMonster && state.activeMonster.isTower && state.activeMonster.hp > 0) return;
  if (!state.zone || !ZONES[state.zone]) return;

  const zone = ZONES[state.zone];
  state.zoneKills = state.zoneKills || {};
  const currentKills = state.zoneKills[state.zone] || 0;
  const KILL_GOAL = 15;

  let targetId = null;
  let isBossSpawn = false;

  if (currentKills >= KILL_GOAL && zone.boss && MONSTERS[zone.boss]) {
    targetId = zone.boss;
    isBossSpawn = true;
    state.zoneKills[state.zone] = 0;
  } else {
    const available = zone.monsters.filter(m => MONSTERS[m]);
    targetId = (available.length > 0) ? available[Math.floor(Math.random() * available.length)] : zone.monsters[0];
  }

  state.target = targetId;
  const template = MONSTERS[targetId];
  if (template) {
    let hpMult = 1, atkMult = 1, xpMult = 1, goldMult = 1;
    let isElite = false;

    if (isBossSpawn || template.boss) {
      hpMult = 3.5;
      atkMult = 1.5;
      xpMult = 5.0;
      goldMult = 5.0;
      isBossSpawn = true;
    } else if (Math.random() < 0.08) {
      hpMult = 1.6;
      atkMult = 1.2;
      xpMult = 2.0;
      goldMult = 2.5;
      isElite = true;
    }

    const finalHp = Math.floor(template.hp * hpMult);
    state.activeMonster = {
      ...template,
      _maxHp: finalHp,
      hp: finalHp,
      atk: Math.floor(template.atk * atkMult),
      xp: Math.floor(template.xp * xpMult),
      gold: [Math.floor((template.gold[0] || 5) * goldMult), Math.floor((template.gold[1] || 15) * goldMult)],
      boss: isBossSpawn || !!template.boss,
      isElite: isElite,
      _stunnedUntil: 0
    };

    if (isBossSpawn) {
      if (callbacks.log) callbacks.log(`🚨 CHEFÃO DA ZONA DESPERTADO! 👑 ${template.name} apareceu!`, 'rarity-legendary');
      if (callbacks.floatText) callbacks.floatText(`🚨 CHEFÃO APARECEU!`, 'float-jackpot');
    } else if (isElite) {
      if (callbacks.log) callbacks.log(`⚡ Monstro Élite ${template.name} (Miniboss) surgiu!`, 'loot');
    } else {
      if (callbacks.log) callbacks.log(`Um ${template.name} selvagem apareceu!`, 'combat');
    }

    if (callbacks.renderStageMonster) callbacks.renderStageMonster();
    if (callbacks.updateZoneKillProgressUI) callbacks.updateZoneKillProgressUI();
  }
}

/**
 * Seleciona uma nova zona de caça para o jogador.
 * @param {Object} state
 * @param {string} zoneId
 * @param {Object} [callbacks] — { log, updateAllUI, save, attackMonster }
 */
export function selectZone(state, zoneId, callbacks = {}) {
  const zone = ZONES[zoneId];
  if (!zone) return;
  if (zone.level > state.level) {
    if (callbacks.log) callbacks.log(`Level ${zone.level} required.`, 'system');
    return;
  }
  state.zone = zoneId;
  stopCombat(state);
  startCombat(state, callbacks);
  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save();
}

/**
 * Atualiza o progresso do jogador nas Sagas do jogo.
 * @param {Object} state
 * @param {boolean} [silent=true]
 * @param {Object} [callbacks] — { log, floatText, showSagaModal }
 */
export function updateSagaProgress(state, silent = true, callbacks = {}) {
  let highestSaga = 0;
  for (let i = 0; i < SAGAS.length; i++) {
    if (state.level >= SAGAS[i].unlocksAt) {
      highestSaga = i;
    }
  }
  if (highestSaga > (state.currentSaga || 0)) {
    const newSaga = SAGAS[highestSaga];
    state.currentSaga = highestSaga;
    if (!silent && callbacks.showSagaModal) callbacks.showSagaModal(newSaga);
    if (callbacks.log) callbacks.log(`🗺️ NOVA SAGA DESBLOQUEADA: **${newSaga.name}**! Novas áreas de caça Lv.${newSaga.unlocksAt}+ disponíveis!`, 'rarity-legendary');
    if (callbacks.floatText) callbacks.floatText(`🗺️ SAGA DESBLOQUEADA!`, 'float-jackpot');
  } else if (state.currentSaga === undefined || state.currentSaga === null) {
    state.currentSaga = highestSaga;
  }
}

/**
 * Lida com a morte do jogador em combate.
 * @param {Object} state
 * @param {Object} monster
 * @param {Object} [callbacks] — { log, el }
 */
export function playerDeath(state, monster, callbacks = {}) {
  stopCombat(state);
  const scroll = state.inventory?.find(i => i.itemId === 'scroll_of_rebirth' && (i.count || 1) > 0);
  let lossRate = 0.2;

  if (scroll) {
    lossRate = 0.0;
    if (scroll.count > 1) scroll.count--;
    else {
      scroll.equipped = false;
      state.inventory.splice(state.inventory.indexOf(scroll), 1);
    }
    if (callbacks.log) callbacks.log('Scroll of Rebirth used! No XP loss!', 'loot');
  } else {
    const resScroll = state.inventory?.find(i => i.itemId === 'scroll_of_resurrection' && (i.count || 1) > 0);
    if (resScroll) {
      lossRate = 0.1;
      if (resScroll.count > 1) resScroll.count--;
      else {
        resScroll.equipped = false;
        state.inventory.splice(state.inventory.indexOf(resScroll), 1);
      }
      if (callbacks.log) callbacks.log('Scroll of Resurrection used! 10% XP loss.', 'loot');
    }
  }

  const xpLoss = Math.floor(state.xp * lossRate);
  if (callbacks.el) {
    const xpEl = callbacks.el('xp-loss');
    if (xpEl) xpEl.textContent = xpLoss.toLocaleString();
    const modal = callbacks.el('death-modal');
    if (modal) modal.classList.add('active');
  }
  state._pendingLoss = lossRate;
}

/**
 * Ressuscita o jogador após a morte.
 * @param {Object} state
 * @param {boolean} [useScroll=false]
 * @param {Object} [callbacks] — { log, el, updateAllUI, save, attackMonster }
 */
export function resurrect(state, useScroll = false, callbacks = {}) {
  if (callbacks.el) {
    const modal = callbacks.el('death-modal');
    if (modal) modal.classList.remove('active');
  }
  const loss = state._pendingLoss || 0.2;
  state.xp = Math.max(0, state.xp - Math.floor(state.xp * loss));

  const stats = getStats(state);
  state.maxHp = stats.maxHp;
  state.maxMp = stats.maxMp;
  state.hp = state.maxHp;
  state.mp = state.maxMp;

  state.zone = state.race ? (RACES[state.race]?.startZone || 'talkingIsland') : 'talkingIsland';

  if (callbacks.log) callbacks.log('Resurrected!', 'system');
  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save();

  setTimeout(() => startCombat(state, callbacks), 500);
}

/** Alterna ativação de Soulshots */
export function toggleSoulshot(state, callbacks = {}) {
  state.soulshotActive = !state.soulshotActive;
  if (callbacks.updateCombatControlsUI) callbacks.updateCombatControlsUI();
  if (callbacks.log) callbacks.log(`Soulshots ${state.soulshotActive ? 'ATIVADOS (Consome soulshots para +100% DANO)' : 'DESATIVADOS'}.`, 'system');
  if (callbacks.save) callbacks.save();
}

/** Alterna auto-poção de HP */
export function toggleAutoPotion(state, callbacks = {}) {
  state.autoPotionActive = !state.autoPotionActive;
  if (callbacks.updateCombatControlsUI) callbacks.updateCombatControlsUI();
  if (callbacks.log) callbacks.log(`Auto-Poção ${state.autoPotionActive ? 'ATIVADA (Bebe poção quando HP < 50%)' : 'DESATIVADA'}.`, 'system');
  if (callbacks.save) callbacks.save();
}
