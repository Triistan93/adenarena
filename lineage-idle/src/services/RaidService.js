/**
 * RaidService.js — Gestão de Chefes Épicos, Masmorras e Ingressos Diários.
 *
 * Responsável por:
 * 1. Controle de ingressos diários (3 gratuitos/dia com reset à meia-noite).
 * 2. Validação de requisitos de nível e entrada de instâncias.
 * 3. Inicialização de combate com mecânicas em tempo real e habilidades de chefe.
 * 4. Distribuição de drops épicos (Joias de Chefe, Blessed Scrolls, Aden Coins e Adena).
 */

import { RAID_BOSSES } from '../data/raids.js';
import { MONSTERS } from '../data/monsters.js';
import { stopCombat, startCombat } from '../engine/CombatEngine.js';

const DAILY_FREE_TICKETS = 3;

/**
 * Retorna a data atual no formato YYYY-MM-DD para controle de reset diário.
 * @returns {string}
 */
export function getTodayDateString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Verifica e reseta os ingressos diários e o status de conclusão dos raids se o dia mudou.
 * @param {Object} state
 */
export function checkAndResetDailyRaidTickets(state) {
  if (!state) return;
  const today = getTodayDateString();

  if (state.lastDailyRaidResetDate !== today) {
    state.lastDailyRaidResetDate = today;
    state.dailyRaidTickets = DAILY_FREE_TICKETS;
    state.dailyRaidClears = {};
  }

  if (typeof state.dailyRaidTickets !== 'number') {
    state.dailyRaidTickets = DAILY_FREE_TICKETS;
  }
  if (!state.dailyRaidClears || typeof state.dailyRaidClears !== 'object') {
    state.dailyRaidClears = {};
  }
  if (typeof state.totalRaidKills !== 'number') {
    state.totalRaidKills = 0;
  }
}

/**
 * Retorna o status detalhado dos raids e ingressos do jogador.
 * @param {Object} state
 * @returns {{tickets: number, maxTickets: number, clears: Object, totalKills: number}}
 */
export function getRaidStatus(state) {
  checkAndResetDailyRaidTickets(state);
  return {
    tickets: state.dailyRaidTickets ?? DAILY_FREE_TICKETS,
    maxTickets: DAILY_FREE_TICKETS,
    clears: state.dailyRaidClears || {},
    totalKills: state.totalRaidKills || 0
  };
}

/**
 * Valida se o herói pode entrar no Raid escolhido.
 * @param {Object} state
 * @param {string} raidId
 * @returns {{canEnter: boolean, reason?: string}}
 */
export function canEnterRaid(state, raidId) {
  checkAndResetDailyRaidTickets(state);
  const boss = RAID_BOSSES[raidId];
  if (!boss) return { canEnter: false, reason: 'Chefe de Raid inexistente.' };

  if ((state.level || 1) < boss.reqLvl) {
    return { canEnter: false, reason: `Nível ${boss.reqLvl} necessário para este Raid!` };
  }

  if ((state.dailyRaidTickets || 0) <= 0) {
    return { canEnter: false, reason: 'Você não possui Ingressos Diários de Raid restantes hoje (3/3 utilizados).' };
  }

  return { canEnter: true };
}

/**
 * Inicia o combate de Raid Épico contra o chefe escolhido.
 * @param {Object} state
 * @param {string} raidId
 * @param {Object} [callbacks] — { log, el, renderStageMonster, attackMonster, onUpdate }
 */
export function startRaidBoss(state, raidId, callbacks = {}) {
  checkAndResetDailyRaidTickets(state);
  const bossTemplate = RAID_BOSSES[raidId];
  if (!bossTemplate) return false;

  const check = canEnterRaid(state, raidId);
  if (!check.canEnter) {
    if (callbacks.log) callbacks.log(`❌ ${check.reason}`, 'system');
    return false;
  }

  // Consome 1 ingresso diário
  state.dailyRaidTickets = Math.max(0, (state.dailyRaidTickets || DAILY_FREE_TICKETS) - 1);

  if (state.zone) {
    state.lastHuntingZone = state.zone;
  }
  state.zone = null;
  state.target = raidId;
  state.isRaidActive = true;
  state.activeRaidId = raidId;
  MONSTERS[raidId] = bossTemplate;

  state.activeMonster = {
    ...bossTemplate,
    _maxHp: bossTemplate.hp,
    hp: bossTemplate.hp,
    _stunnedUntil: 0,
    isRaid: true,
    _triggeredMechanics: {}
  };

  if (callbacks.el) {
    const sz = callbacks.el('stage-zone');
    if (sz) sz.textContent = `🐉 RAID ÉPICO · ${bossTemplate.name}`;
    const zn = callbacks.el('zone-name');
    if (zn) zn.textContent = bossTemplate.name;
  }

  stopCombat(state);
  startCombat(state, callbacks);

  if (callbacks.log) {
    callbacks.log(`⚔️ **DESAFIO DE RAID INICIADO!** Você adentrou o domínio de **${bossTemplate.name}** (${bossTemplate.title})!`, 'rarity-legendary');
    callbacks.log(`🎟️ Ingressos restantes hoje: **${state.dailyRaidTickets}/${DAILY_FREE_TICKETS}**`, 'system');
  }
  if (callbacks.renderStageMonster) callbacks.renderStageMonster();
  if (callbacks.onUpdate) callbacks.onUpdate();

  return true;
}

/**
 * Executa as mecânicas em tempo real do Chefe de Raid com base na porcentagem de vida.
 * @param {Object} state
 * @param {Object} callbacks
 */
export function processRaidBossMechanics(state, callbacks = {}) {
  const m = state.activeMonster;
  if (!m || !m.isRaid || !m.mechanics || !m._maxHp) return;

  const hpRatio = m.hp / m._maxHp;
  m._triggeredMechanics = m._triggeredMechanics || {};

  for (let i = 0; i < m.mechanics.length; i++) {
    const mech = m.mechanics[i];
    if (hpRatio <= mech.triggerHp && !m._triggeredMechanics[i]) {
      m._triggeredMechanics[i] = true;

      // Efeito de Dano em Área no Jogador
      if (mech.damagePercent && state.hp) {
        const dmg = Math.floor((state.maxHp || 100) * mech.damagePercent);
        state.hp = Math.max(1, state.hp - dmg);
        if (callbacks.log) {
          callbacks.log(`${mech.text} (Você sofreu ${dmg.toLocaleString()} de dano!)`, 'rarity-epic');
        }
      }

      // Efeito de Cura do Chefe
      if (mech.healPercent) {
        const heal = Math.floor(m._maxHp * mech.healPercent);
        m.hp = Math.min(m._maxHp, m.hp + heal);
        if (callbacks.log && !mech.damagePercent) {
          callbacks.log(`${mech.text} (+${heal.toLocaleString()} HP)`, 'rarity-epic');
        }
      }
    }
  }
}

/**
 * Processa a vitória do jogador contra o Chefe de Raid e entrega as recompensas épicas.
 * @param {Object} state
 * @param {string} raidId
 * @param {Object} callbacks
 * @returns {Array<Object>} Lista de itens recebidos
 */
export function handleRaidVictory(state, raidId, callbacks = {}) {
  const boss = RAID_BOSSES[raidId] || state.activeMonster;
  if (!boss) return [];

  checkAndResetDailyRaidTickets(state);
  state.dailyRaidClears[raidId] = (state.dailyRaidClears[raidId] || 0) + 1;
  state.totalRaidKills = (state.totalRaidKills || 0) + 1;
  state.isRaidActive = false;
  state.activeRaidId = null;

  const droppedItems = [];

  // 1. Recompensa Garantida em Adena
  const minGold = boss.gold?.[0] || 25000;
  const maxGold = boss.gold?.[1] || 50000;
  const rawGold = Math.floor(minGold + Math.random() * (maxGold - minGold + 1));
  const goldBonus = 1 + (Number(state.goldBoost) || 0);
  const earnedGold = Math.floor(rawGold * goldBonus);
  state.gold = (state.gold || 0) + earnedGold;

  // 2. Recompensa Garantida em XP e SP
  const xpBonus = 1 + (Number(state.xpBoost) || 0);
  const earnedXp = Math.floor((boss.xp || 10000) * xpBonus);
  const earnedSp = Math.floor((boss.sp || 100) * xpBonus);
  state.xp = (state.xp || 0) + earnedXp;
  state.sp = (state.sp || 0) + earnedSp;

  if (callbacks.log) {
    callbacks.log(`🏆 **VITÓRIA ÉPICA!** Você derrotou **${boss.name}**!`, 'rarity-legendary');
    callbacks.log(`💰 Recompensa de Conclusão: **+${earnedGold.toLocaleString()} Adena**, **+${earnedXp.toLocaleString()} XP**, **+${earnedSp.toLocaleString()} SP**!`, 'rarity-rare');
  }

  // 3. Sorteio de Drops Épicos (Joias de Chefe, Scrolls, AC)
  if (Array.isArray(boss.drops)) {
    for (const drop of boss.drops) {
      const roll = Math.random();
      if (roll <= drop.chance) {
        if (drop.itemId === 'adena_coins') {
          const acAmount = drop.count || 10;
          state.adenCoins = (state.adenCoins || 0) + acAmount;
          droppedItems.push({ itemId: 'adena_coins', name: `${acAmount}x Aden Coins (AC)`, isAC: true });
          if (callbacks.log) {
            callbacks.log(`🪙 **DROP RARO:** Você recebeu **+${acAmount} Aden Coins (AC)**!`, 'rarity-legendary');
          }
        } else {
          state.inventory = state.inventory || [];
          const uid = 'item_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
          state.inventory.push({
            uid,
            itemId: drop.itemId,
            enchant: 0,
            count: 1
          });
          droppedItems.push({ itemId: drop.itemId, name: drop.name, uid, isEpicJewel: drop.isEpicJewel });

          if (drop.isEpicJewel) {
            if (callbacks.log) {
              callbacks.log(`👑 **DROP LENDÁRIO DE CHEFE!** Você obteve **[${drop.name}]**!`, 'rarity-legendary');
            }
          } else if (callbacks.log) {
            callbacks.log(`🎁 Drop de Raid: **${drop.name}** adicionado ao inventário!`, 'rarity-epic');
          }
        }
      }
    }
  }

  if (callbacks.onUpdate) callbacks.onUpdate();
  return droppedItems;
}
