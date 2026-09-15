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
import { rollChampionMonster } from './BalanceEngine.js';
import { StaggerEngine } from './StaggerEngine.js';
import { MonsterAIEngine, ARCHETYPE_INFO, HUNTING_DIFFICULTIES } from './MonsterAIEngine.js';
import { getMonsterSpawnMultipliers } from '../data/balance/monsterBalance.js';
import { getZoneProgression } from '../data/balance/progressionBalance.js';
import { combatEvents, CombatEventType, CombatEventFactory } from '../vfx/CombatEvent.js';

export { combatEvents, CombatEventType, CombatEventFactory };

/**
 * Dispatches a combat event both to callbacks and the decoupled combatEvents bus.
 * @param {string} type 
 * @param {Object} payload 
 * @param {Object} [callbacks]
 */
export function dispatchCombatEvent(type, payload = {}, callbacks = {}) {
  combatEvents.emit(type, payload);
  if (typeof callbacks.onCombatEvent === 'function') {
    try {
      callbacks.onCombatEvent(type, payload);
    } catch (err) {
      console.error('[CombatEngine] Error in onCombatEvent callback:', err);
    }
  }
}

let combatInterval = null;
let monsterAttackTimeout = null;

function hasValidState(state) {
  return !!state && typeof state === 'object';
}

/**
 * Retorna a cidade mais próxima / vila segura correspondente à zona informada.
 * Garante que a cidade retornada seja compatível com o nível e CP do jogador,
 * evitando que jogadores de nível baixo sejam enviados para Aden City ou outras cidades de nível alto.
 * @param {string} zoneId
 * @param {Object} [state] — Estado do jogador (para validar nível e CP)
 * @returns {string}
 */
export function getNearestTown(zoneId, state = null) {
  if (!zoneId || !ZONES[zoneId]) return 'talkingIsland';

  const playerLevel = (state && typeof state.level === 'number') ? state.level : 100;
  const playerCp = (state && (state.stats?.combatPower || state.combatPower)) ? (state.stats?.combatPower || state.combatPower) : Infinity;

  function isTownAccessible(tId) {
    if (!tId || !ZONES[tId] || !ZONES[tId].town) return false;
    const tZone = ZONES[tId];
    if (playerLevel < tZone.level) return false;
    const prog = getZoneProgression(tId);
    if (prog && prog.minCp && playerCp < prog.minCp) return false;
    return true;
  }

  const current = ZONES[zoneId];
  if (current.town && isTownAccessible(zoneId)) return zoneId;
  if (current.shop && isTownAccessible(current.shop)) return current.shop;
  for (let i = SAGAS.length - 1; i >= 0; i--) {
    if (SAGAS[i].zones.includes(zoneId)) {
      const townInSaga = SAGAS[i].zones.find(z => isTownAccessible(z));
      if (townInSaga) return townInSaga;
    }
  }

  const candidateTowns = ['adenCity', 'gludioCastle', 'blackCitadel', 'giranOutskirts', 'talkingIsland'];
  for (const tId of candidateTowns) {
    if (isTownAccessible(tId)) return tId;
  }

  return 'talkingIsland';
}

/**
 * Inicia o loop de combate na zona atual.
 * @param {Object} state — Estado do jogo
 * @param {Object} [callbacks] — { log, attackMonster }
 */
export function startCombat(state, callbacks = {}) {
  if (!hasValidState(state)) return false;
  state.combatActive = true;
  state.isCombatActive = true;

  // Validação preventiva de CP Mínimo ao iniciar combate (ex: save carregado em zona onde não tem CP suficiente)
  const zoneProg = state.zone ? getZoneProgression(state.zone) : null;
  const playerCp = state.stats?.combatPower || state.combatPower || 0;
  if (zoneProg && zoneProg.minCp && playerCp < zoneProg.minCp && state.zone !== 'talkingIsland') {
    const safeTown = getNearestTown(state.zone, state);
    if (callbacks.log) {
      callbacks.log(`🔒 Poder de Combate Insuficiente para ${ZONES[state.zone]?.name || state.zone}! Requer ${zoneProg.minCp.toLocaleString()} CP (Seu CP: ${playerCp.toLocaleString()}). Retornando para ${ZONES[safeTown]?.name || safeTown}...`, 'warning');
    }
    state.zone = safeTown;
    state.currentZone = safeTown;
    state.lastHuntingZone = safeTown;
    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
  }

  if (!state.activeMonster && state.zone && ZONES[state.zone]) {
    if (callbacks.log) callbacks.log(`Entering ${ZONES[state.zone].name}...`, 'system');
    pickRandomMonster(state, callbacks);
  }
  state._cds = state._cds || {};

  if (combatInterval) clearInterval(combatInterval);
  if (typeof callbacks.attackMonster === 'function') {
    const spd = Math.max(1, state.combatSpeed || 1);
    combatInterval = setInterval(() => callbacks.attackMonster(), Math.round(200 / spd));
    if (combatInterval && typeof combatInterval.unref === 'function') {
      combatInterval.unref();
    }
  }
}

/**
 * Interrompe o loop de combate ativo.
 * @param {Object} state
 */
export function stopCombat(state) {
  if (!hasValidState(state)) return false;
  state.combatActive = false;
  state.isCombatActive = false;
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
  if (!hasValidState(state)) return false;
  if (state.isCombatActive === false) return false;
  if (state.activeMonster && (state.activeMonster.isTower || state.activeMonster.isChaosBoss || state.activeMonster.isRaid) && state.activeMonster.hp > 0) return false;
  if (!state.zone || !ZONES[state.zone]) return;

  const zone = ZONES[state.zone];
  state.zoneKills = state.zoneKills || {};
  const currentKills = state.zoneKills[state.zone] || 0;
  const KILL_GOAL = 50;

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
    let champion = null;

    if (isBossSpawn || template.boss) {
      const bossMults = getMonsterSpawnMultipliers('zone_boss');
      hpMult = bossMults.hpMult;
      atkMult = bossMults.atkMult;
      xpMult = bossMults.xpMult;
      goldMult = bossMults.goldMult;
      isBossSpawn = true;
    } else {
      champion = rollChampionMonster();
      if (champion) {
        hpMult = champion.hpMult;
        atkMult = champion.atkMult;
        xpMult = champion.xpMult;
        goldMult = champion.goldMult;
      } else if (Math.random() < 0.08) {
        const eliteMults = getMonsterSpawnMultipliers('elite');
        hpMult = eliteMults.hpMult;
        atkMult = eliteMults.atkMult;
        xpMult = eliteMults.xpMult;
        goldMult = eliteMults.goldMult;
        isElite = true;
      }
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
      champion: champion ? champion.type : null,
      championColor: champion ? champion.color : null,
      _stunnedUntil: 0
    };

    // Aplica Nível de Dificuldade de Caça Selecionado (NÍVEL 15.4 / 15.5)
    const difficulty = MonsterAIEngine.getDifficulty(state);
    if (difficulty && difficulty.id !== 'normal') {
      MonsterAIEngine.applyDifficultyToMonster(state.activeMonster, difficulty);
    }

    // Inicializa IA Avançada de Combate & Archetype (NÍVEL 15.1 e 15.2)
    MonsterAIEngine.initMonsterAI(state.activeMonster, state);
    StaggerEngine.initMonsterStagger(state.activeMonster);

    const archInfo = ARCHETYPE_INFO[state.activeMonster.archetype] || ARCHETYPE_INFO.berserker;
    const diffBadge = (difficulty && difficulty.id !== 'normal') ? ` [${difficulty.icon} ${difficulty.name}]` : '';

    if (isBossSpawn) {
      if (callbacks.log) callbacks.log(`🚨 CHEFÃO DA ZONA DESPERTADO! 👑 ${template.name}${diffBadge} apareceu!`, 'boss', 'system');
      if (callbacks.floatText) callbacks.floatText(`🚨 CHEFÃO APARECEU!`, 'float-jackpot');
    } else if (champion) {
      if (callbacks.log) callbacks.log(`${champion.namePrefix}! ${template.name}${diffBadge} [${archInfo.icon} ${archInfo.label}] surgiu!`, 'boss', 'system');
      if (callbacks.floatText) callbacks.floatText(champion.namePrefix, 'float-jackpot');
    } else if (isElite) {
      if (callbacks.log) callbacks.log(`⚡ Monstro Élite ${template.name}${diffBadge} [${archInfo.icon} ${archInfo.label}] surgiu!`, 'boss', 'system');
    } else {
      if (callbacks.log) callbacks.log(`Um [${archInfo.icon} ${archInfo.label}] ${template.name}${diffBadge} selvagem apareceu!`, 'combat', 'combat');
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
  if (!hasValidState(state)) return false;
  const zone = ZONES[zoneId];
  if (!zone) return false;
  if (zone.level > state.level) {
    if (callbacks.log) callbacks.log(`Level ${zone.level} required.`, 'system');
    return false;
  }
  const zoneProg = getZoneProgression(zoneId);
  const playerCp = state.stats?.combatPower || state.combatPower || 0;
  if (zoneProg && zoneProg.minCp && playerCp < zoneProg.minCp && zoneId !== 'talkingIsland') {
    if (callbacks.log) callbacks.log(`🔒 Poder de Combate Insuficiente para ${zone.name}! Requer no mínimo ${zoneProg.minCp.toLocaleString()} CP (Seu CP: ${playerCp.toLocaleString()}).`, 'warning');
    if (callbacks.floatText) callbacks.floatText(`🔒 REQUER ${zoneProg.minCp.toLocaleString()} CP`, 'float-warning');
    return false;
  }
  state.zone = zoneId;
  state.currentZone = zoneId;
  if (zone.town) {
    state.lastSafeZone = zoneId;
  } else {
    state.lastHuntingZone = zoneId;
  }
  state.target = null;
  state.activeMonster = null;
  stopCombat(state);
  startCombat(state, callbacks);
  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save();
  return true;
}

/**
 * Atualiza o progresso do jogador nas Sagas do jogo.
 * @param {Object} state
 * @param {boolean} [silent=true]
 * @param {Object} [callbacks] — { log, floatText, showSagaModal }
 */
export function updateSagaProgress(state, silent = true, callbacks = {}) {
  if (!hasValidState(state)) return false;
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
  if (!hasValidState(state)) return false;
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
  if (!hasValidState(state)) return false;
  if (callbacks.el) {
    const modal = callbacks.el('death-modal');
    if (modal) modal.classList.remove('active');
  }
  const loss = state._pendingLoss || 0.2;
  state.xp = Math.max(0, state.xp - Math.floor(state.xp * loss));
  state._pendingLoss = 0;

  const stats = getStats(state);
  state.maxHp = stats.maxHp;
  state.maxMp = stats.maxMp;
  state.hp = state.maxHp;
  state.mp = state.maxMp;

  // Limpa instâncias / raid / torre ao ressuscitar
  state.isRaidActive = false;
  state.activeRaidId = null;
  state.towerCombatActive = false;
  state.target = null;
  state.activeMonster = null;

  // Sempre permanece no mesmo mapa ao ressuscitar (mantém hunting zone atual)
  const currentHuntingZone = state.zone || state.lastHuntingZone || 'talkingIsland';
  state.zone = ZONES[currentHuntingZone] ? currentHuntingZone : 'talkingIsland';
  state.currentZone = state.zone;
  if (ZONES[state.zone]?.town) {
    state.lastSafeZone = state.zone;
  } else {
    state.lastHuntingZone = state.zone;
  }

  if (callbacks.log) {
    const zoneName = ZONES[state.zone]?.name || state.zone;
    callbacks.log(`Ressuscitou em ${zoneName}!`, 'system');
  }
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
