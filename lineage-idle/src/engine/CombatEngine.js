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
import { ClassValidationService } from '../services/ClassValidationService.js';
import { getShotGradeCode } from '../data/items/item_grade.js';
import { CombatPowerService } from '../services/CombatPowerService.js';
import { getTotalXP, getXPForLevel } from './LevelEngine.js';
import { removeFromInventoryByItemId } from '../services/InventoryService.js';

export { combatEvents, CombatEventType, CombatEventFactory };

/** Combina a chance configurada com as penalidades e bônus usados na caçada. */
export function calculateConfiguredDropChance(baseChance, levelGapMultiplier, itemDropRate, difficultyDropMultiplier = 1) {
  return (Number(baseChance) || 0)
    * (Number(levelGapMultiplier) || 0)
    * (Number(itemDropRate) || 0)
    * (Number(difficultyDropMultiplier) || 1);
}

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
  const playerCp = (state && (state.stats?.combatPower || state.combatPower)) ? (state.stats?.combatPower || state.combatPower) : (state ? CombatPowerService.resolveCombatPower(state) : Infinity);

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
  if (state.isDead === true) return false;
  cancelAutoResume();
  state.combatActive = true;
  state.isCombatActive = true;

  // Validação preventiva de CP Mínimo ao iniciar combate (ex: save carregado em zona onde não tem CP suficiente)
  const zoneProg = state.zone ? getZoneProgression(state.zone) : null;
  const playerCp = CombatPowerService.resolveCombatPower(state);
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

  startCombatInterval(state, callbacks);
}

function startCombatInterval(state, callbacks = {}) {
  if (combatInterval) {
    clearInterval(combatInterval);
    combatInterval = null;
  }
  if (typeof callbacks.attackMonster !== 'function') return;

  const speed = state.combatSpeed === 2 ? 2 : 1;
  state.combatSpeed = speed;
  combatInterval = setInterval(() => callbacks.attackMonster(), Math.round(200 / speed));
  if (combatInterval && typeof combatInterval.unref === 'function') {
    combatInterval.unref();
  }
}

/**
 * Altera a velocidade do loop real de combate (1x ou 2x).
 * @param {Object} state
 * @param {number} speed
 * @param {Object} [callbacks]
 * @returns {number|false}
 */
export function setCombatSpeed(state, speed, callbacks = {}) {
  if (!hasValidState(state)) return false;
  state.combatSpeed = Number(speed) === 2 ? 2 : 1;
  if (state.isCombatActive !== false) startCombatInterval(state, callbacks);
  return state.combatSpeed;
}

/**
 * Interrompe o loop de combate ativo.
 * @param {Object} state
 */
export function stopCombat(state) {
  if (!hasValidState(state)) return false;
  cancelAutoResume();
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
      id: targetId,
      key: targetId,
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
 * @param {Object} [callbacks] — { log, updateAllUI, save, attackMonster, onBeforeZoneChange }
 */
export function selectZone(state, zoneId, callbacks = {}) {
  if (!hasValidState(state)) return false;
  const resumeCombatAfterChange = state.isCombatActive !== false;
  const zone = ZONES[zoneId];
  if (!zone) return false;
  if (zone.level > state.level) {
    if (callbacks.log) callbacks.log(`Level ${zone.level} required.`, 'system');
    return false;
  }
  const zoneProg = getZoneProgression(zoneId);
  const playerCp = CombatPowerService.resolveCombatPower(state);
  if (zoneProg && zoneProg.minCp && playerCp < zoneProg.minCp && zoneId !== 'talkingIsland') {
    if (callbacks.log) callbacks.log(`🔒 Poder de Combate Insuficiente para ${zone.name}! Requer no mínimo ${zoneProg.minCp.toLocaleString()} CP (Seu CP: ${playerCp.toLocaleString()}).`, 'warning');
    if (callbacks.floatText) callbacks.floatText(`🔒 REQUER ${zoneProg.minCp.toLocaleString()} CP`, 'float-warning');
    return false;
  }
  if (typeof callbacks.onBeforeZoneChange === 'function') callbacks.onBeforeZoneChange(zoneId);
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
  if (resumeCombatAfterChange) startCombat(state, callbacks);
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

/** Perda padrão de XP na morte (fração da faixa do nível atual). */
export const DEFAULT_DEATH_LOSS = 0.2;
/** Perda aplicada ao usar o Pergaminho da Ressurreição. */
export const RESURRECTION_SCROLL_LOSS = 0.1;
const AUTO_RESUME_DELAY_MS = 500;
let autoResumeTimer = null;

function cancelAutoResume() {
  if (autoResumeTimer) {
    clearTimeout(autoResumeTimer);
    autoResumeTimer = null;
  }
}

/** Quantidade disponível (não equipada) de um item, no mesmo critério do InventoryService. */
export function countInventoryItem(state, itemId) {
  if (!Array.isArray(state?.inventory)) return 0;
  return state.inventory.reduce((total, item) =>
    item && item.itemId === itemId && !item.equipped ? total + Math.max(1, Number(item.count) || 1) : total, 0);
}

/**
 * XP que seria perdido com a taxa informada. A perda incide só sobre a faixa do
 * nível atual e nunca leva o XP abaixo do piso do nível (sem de-level).
 */
export function computeDeathXpLoss(state, rate) {
  const level = Math.max(1, Number(state?.level) || 1);
  const baseXP = level <= 1 ? 0 : getTotalXP(level - 1);
  const levelSpan = getXPForLevel(level);
  const wanted = Math.floor(levelSpan * rate);
  return Math.max(0, Math.min(wanted, (Number(state?.xp) || 0) - baseXP));
}

/** Descreve as opções de ressurreição disponíveis para o estado de morte atual. */
export function getDeathOptions(state) {
  const baseLoss = Number(state?.pendingDeathLoss) > 0 ? Number(state.pendingDeathLoss) : DEFAULT_DEATH_LOSS;
  const scrolls = countInventoryItem(state, 'scroll_of_resurrection');
  const rebirths = countInventoryItem(state, 'scroll_of_rebirth');
  const scrollRate = Math.min(baseLoss, RESURRECTION_SCROLL_LOSS);
  return {
    baseLoss,
    scrolls,
    rebirths,
    free: { rate: baseLoss, xpLoss: computeDeathXpLoss(state, baseLoss) },
    scroll: { rate: scrollRate, xpLoss: computeDeathXpLoss(state, scrollRate), enabled: scrolls > 0 && baseLoss > RESURRECTION_SCROLL_LOSS },
    rebirth: { rate: 0, xpLoss: 0, enabled: rebirths > 0 },
    town: { rate: baseLoss, xpLoss: computeDeathXpLoss(state, baseLoss) }
  };
}

/** Preenche e abre o modal de morte a partir do estado persistido. */
export function renderDeathModal(state, callbacks = {}) {
  if (!callbacks.el) return;
  const options = getDeathOptions(state);
  const fmt = n => Number(n).toLocaleString('pt-BR');
  const pct = r => `${Math.round(r * 100)}%`;
  const modal = callbacks.el('death-modal');
  if (modal) modal.classList.add('active');
  const xpEl = callbacks.el('xp-loss');
  if (xpEl) xpEl.textContent = fmt(options.free.xpLoss);

  const setButton = (id, label, enabled, title) => {
    const button = callbacks.el(id);
    if (!button) return;
    button.textContent = label;
    button.disabled = !enabled;
    button.title = title;
  };
  setButton('res-free', `Ressuscitar (Grátis, -${fmt(options.free.xpLoss)} XP · ${pct(options.free.rate)} do nível atual)`, true,
    'Ressuscita no local com HP, MP e CP completos. A caça fica pausada.');
  setButton('res-scroll', `Usar Pergaminho (-${fmt(options.scroll.xpLoss)} XP · ${pct(options.scroll.rate)}) · Restantes: ${fmt(options.scrolls)}`,
    options.scroll.enabled,
    options.scrolls <= 0 ? 'Você não possui Pergaminho da Ressurreição.'
      : options.baseLoss <= RESURRECTION_SCROLL_LOSS ? 'Sua perda de XP já é de 10% ou menos.'
        : 'Consome 1 Pergaminho da Ressurreição e reduz a perda de XP para 10%.');
  setButton('res-rebirth', `Usar Renascimento (-0 XP) · Restantes: ${fmt(options.rebirths)}`, options.rebirth.enabled,
    options.rebirths <= 0 ? 'Você não possui Pergaminho do Renascimento.' : 'Consome 1 Pergaminho do Renascimento e ressuscita sem perder XP.');
  setButton('res-town', `Voltar para a Cidade (-${fmt(options.town.xpLoss)} XP · ${pct(options.town.rate)})`, true,
    'Ressuscita na cidade segura com HP, MP e CP completos. A caça fica pausada.');
  const first = callbacks.el('res-free');
  if (first && typeof first.focus === 'function') first.focus();
}

/**
 * Lida com a morte do jogador em combate.
 * Idempotente: mortes repetidas no mesmo estado são ignoradas. A morte fica
 * persistida em `state.isDead` / `state.pendingDeathLoss` até `resurrect`.
 * @param {Object} state
 * @param {Object} monster
 * @param {Object} [callbacks] — { log, el }
 */
export function playerDeath(state, monster, callbacks = {}) {
  if (!hasValidState(state)) return false;
  if (state.isDead) return false;

  // CANONICAL PASSIVE: Born to Die (Death Knight unique fatal survival)
  // On dying from attack: Triggers Reviving After Death.
  // Invincibility for 3 sec. Fully recovers HP/CP. Recovers 5% MP. (Cooldown: 400s)
  const now = Date.now();
  if (state.skills?.born_to_die > 0 && (!state._bornToDieCooldown || now >= state._bornToDieCooldown)) {
    state._bornToDieCooldown = now + 400000;
    const stats = getStats(state);
    state.maxHp = stats.maxHp || state.maxHp || 1000;
    state.hp = state.maxHp;
    state.cp = stats.maxCp || state.hp;
    state.mp = Math.min(stats.maxMp || state.maxMp || 500, (state.mp || 0) + Math.floor((stats.maxMp || state.maxMp || 500) * 0.05));
    state.buffs = state.buffs || {};
    state.buffs.born_to_die_invincibility = {
      name: 'Reviving After Death',
      until: now + 3000,
      invulnerable: true
    };
    if (callbacks.log) {
      callbacks.log('💀 [Born to Die] Revivendo da morte! 3s de invencibilidade e restauração total de HP/CP!', 'rarity-legendary');
    }
    return false;
  }

  stopCombat(state);
  state.isDead = true;
  state.hp = 0;
  state.pendingDeathLoss = DEFAULT_DEATH_LOSS;
  renderDeathModal(state, callbacks);
  return true;
}

/**
 * Ressuscita o jogador após a morte.
 * @param {Object} state
 * @param {boolean|'free'|'scroll'|'rebirth'|'town'} [option=false] — `true` equivale a 'scroll'
 * @param {Object} [callbacks] — { log, el, updateAllUI, updateCombatControlsUI, save, attackMonster }
 * @returns {boolean} true se a ressurreição foi concluída
 */
export function resurrect(state, option = false, callbacks = {}) {
  if (!hasValidState(state)) return false;
  if (!state.isDead) return false;
  const mode = option === true ? 'scroll' : (!option ? 'free' : String(option));
  let loss = Number(state.pendingDeathLoss) > 0 ? Number(state.pendingDeathLoss) : DEFAULT_DEATH_LOSS;

  if (mode === 'scroll') {
    if (loss <= RESURRECTION_SCROLL_LOSS) {
      if (callbacks.log) callbacks.log('Sua perda de XP já é de 10% ou menos; o pergaminho não será consumido.', 'system');
      return false;
    }
    if (!removeFromInventoryByItemId(state, 'scroll_of_resurrection', 1)) {
      if (callbacks.log) callbacks.log('Você não possui Pergaminho da Ressurreição.', 'warning');
      return false;
    }
    loss = RESURRECTION_SCROLL_LOSS;
    if (callbacks.log) callbacks.log('Pergaminho da Ressurreição usado! Perda de 10% de XP.', 'loot');
  } else if (mode === 'rebirth') {
    if (!removeFromInventoryByItemId(state, 'scroll_of_rebirth', 1)) {
      if (callbacks.log) callbacks.log('Você não possui Pergaminho do Renascimento.', 'warning');
      return false;
    }
    loss = 0;
    if (callbacks.log) callbacks.log('Pergaminho do Renascimento usado! Sem perda de XP.', 'loot');
  }

  if (callbacks.el) {
    const modal = callbacks.el('death-modal');
    if (modal) modal.classList.remove('active');
  }
  state.xp = (Number(state.xp) || 0) - computeDeathXpLoss(state, loss);
  state.isDead = false;
  state.pendingDeathLoss = 0;

  const stats = getStats(state);
  state.maxHp = stats.maxHp;
  state.maxMp = stats.maxMp;
  state.hp = state.maxHp;
  state.mp = state.maxMp;
  if (Number.isFinite(stats.maxCp)) {
    state.maxCp = stats.maxCp;
    state.cp = state.maxCp;
  }

  // Limpa instâncias / raid / torre ao ressuscitar
  state.isRaidActive = false;
  state.activeRaidId = null;
  state.towerCombatActive = false;
  state.target = null;
  state.activeMonster = null;

  if (mode === 'town') {
    const lastSafe = state.lastSafeZone;
    state.zone = ZONES[lastSafe]?.town ? lastSafe : 'talkingIsland';
  } else {
    // Permanece no mesmo mapa ao ressuscitar (mantém hunting zone atual)
    const currentHuntingZone = state.zone || state.lastHuntingZone || 'talkingIsland';
    state.zone = ZONES[currentHuntingZone] ? currentHuntingZone : 'talkingIsland';
  }
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

  // A caça só retoma sozinha com o Auto-Reviver; na ressurreição manual o jogador decide.
  state.isCombatActive = false;
  state.combatActive = false;
  cancelAutoResume();
  const autoResume = state.autoResurrect === true && mode !== 'town';
  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.updateCombatControlsUI) callbacks.updateCombatControlsUI();
  if (callbacks.save) callbacks.save();

  if (autoResume) {
    autoResumeTimer = setTimeout(() => {
      autoResumeTimer = null;
      if (state.isDead || state.isCombatActive === true || state.autoResurrect !== true) return;
      if (state.colosseum?.activeDuel || state.colosseum?.activeSurvival
        || state.isRaidActive || state.activeInstanceId || state.isSpecialInstanceActive
        || state.tower?.activeRun || state.fishing?.isFishing || state.fishing?.autoFishing
        || state.hunting?.isHunting || state.hunting?.autoHunting
        || state.gathering?.autoGathering || state.mining?.autoMining) return;
      startCombat(state, callbacks);
      if (callbacks.updateCombatControlsUI) callbacks.updateCombatControlsUI();
    }, AUTO_RESUME_DELAY_MS);
  }
  return true;
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

/**
 * Determina o efeito, multiplicador de dano e item de tiro a ser consumido.
 * - Tiro dedicado da Grade correta da arma: +100% de dano (2.0x).
 * - Tiro Universal (curinga para qualquer grau): +30% de dano (1.30x).
 * - Tiro de grau inferior: NÃO ativa (retorna null, não consome, dano 1.0x).
 * - Consumo: exatamente 1 tiro por ataque para todas as armas.
 *
 * @param {Object} state
 * @param {Object} [weaponDef]
 * @param {boolean} [isMageClass]
 * @returns {{ shotItem: Object|null, isUniversal: boolean, multiplier: number, label: string|null, soulshotCritBonus: number }}
 */
export function resolveSoulshotEffect(state, weaponDef = null, isMage = null) {
  if (!state || !state.soulshotActive || !Array.isArray(state.inventory)) {
    return { shotItem: null, isUniversal: false, multiplier: 1.0, label: null, soulshotCritBonus: 0 };
  }

  const isMageClass = isMage !== null ? Boolean(isMage) : ClassValidationService.isMageClass(state.class);

  const weaponGrade = getShotGradeCode(weaponDef).toUpperCase();

  const gradeSuffix = weaponGrade.toLowerCase();
  const dedicatedShotId = isMageClass 
    ? `spiritshot_${gradeSuffix}` 
    : `soulshot_${gradeSuffix}`;

  // 1. Prioridade Máxima: Tiro dedicado da Grade correta da arma (+100% de dano)
  let shotItem = state.inventory.find(i => i && (i.count || 1) > 0 && i.itemId === dedicatedShotId);
  let isUniversal = false;

  // 2. Fallback: Tiro Universal como curinga automático para qualquer grau (+30% de dano)
  if (!shotItem) {
    shotItem = state.inventory.find(i => {
      if (!i || (i.count || 1) <= 0) return false;
      const id = String(i.itemId || '');
      return isMageClass 
        ? (id === 'blessed_spiritshot_universal' || id === 'spiritshot_universal')
        : (id === 'soulshot_universal');
    });
    if (shotItem) isUniversal = true;
  }

  if (!shotItem) {
    return { shotItem: null, isUniversal: false, multiplier: 1.0, label: null, soulshotCritBonus: 0 };
  }

  const multiplier = isUniversal ? 1.30 : 2.0;
  let soulshotCritBonus = 0;
  let label = '';

  if (isMageClass) {
    if (shotItem.itemId === 'blessed_spiritshot_universal') soulshotCritBonus = 5;
    label = isUniversal ? 'SPS Univ (+30%)' : 'SPS (+100%)';
  } else {
    label = isUniversal ? 'SS Univ (+30%)' : 'SS (+100%)';
  }

  return {
    shotItem,
    isUniversal,
    multiplier,
    label,
    soulshotCritBonus
  };
}
