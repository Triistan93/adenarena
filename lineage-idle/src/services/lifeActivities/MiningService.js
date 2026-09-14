// MiningService.js — Motor Central de Mineração & Veios Minerais de Aden (Lineage II Style)
import {
  MINING_ZONES,
  MINERAL_NODES_CATALOG,
  PICKAXES_CATALOG,
  LAMPS_CATALOG,
  MINING_TACTICS
} from '../../data/mining.js';
import { addToInventory } from '../InventoryService.js';
import { LifeActivityCore } from './LifeActivityCore.js';
import { RewardEngine } from './RewardEngine.js';
import { resolveCanonicalResourceId } from './ResourceDictionary.js';

export const MiningService = {
  getMiningState(state) {
    if (state) {
      LifeActivityCore.getActivityState(state, 'mining');
    }
    if (!state.mining || typeof state.mining !== 'object') {
      state.mining = {
        skillLevel: 1,
        skillXp: 0,
        pickaxe: 'pickaxe_none',
        selectedTactic: 'standard',
        activeLamp: null,
        activeZone: 'zone_abandoned_coal',
        isMining: false,
        mineStartTime: 0,
        targetedNodeId: null,
        mineDuration: 3300,
        totalMined: 0,
        miningLog: {},
        autoMining: false,
        lastAutoTick: 0,
        pickaxeDurability: {
          pickaxe_none: 50
        },
        lampInventory: {}
      };
    }

    if (!state.mining.pickaxe) {
      state.mining.pickaxe = 'pickaxe_none';
    }
    if (!state.mining.selectedTactic) {
      state.mining.selectedTactic = 'standard';
    }
    if (!state.mining.pickaxeDurability) {
      state.mining.pickaxeDurability = {};
    }
    if (state.mining.pickaxeDurability.pickaxe_none === undefined) {
      state.mining.pickaxeDurability.pickaxe_none = 50;
    }
    if (!state.mining.lampInventory) {
      state.mining.lampInventory = {};
    }
    if (!state.mining.miningLog) {
      state.mining.miningLog = {};
    }
    if (!state.mining.activeZone) {
      state.mining.activeZone = 'zone_abandoned_coal';
    }

    return state.mining;
  },

  getAvailableZones(state) {
    const playerLvl = Number(state?.level) || 1;
    return Object.values(MINING_ZONES).filter(zone => playerLvl >= zone.minLevel);
  },

  selectZone(state, zoneId, callbacks = {}) {
    const mState = this.getMiningState(state);
    const zone = MINING_ZONES[zoneId];
    if (!zone) return false;

    const playerLvl = Number(state?.level) || 1;
    if (playerLvl < zone.minLevel) {
      if (callbacks.log) callbacks.log(`⚠️ Nível insuficiente para descer nas galerias de ${zone.name}! Requer Nível ${zone.minLevel}.`, 'warning');
      return false;
    }

    mState.activeZone = zoneId;
    mState.isMining = false;
    mState.targetedNodeId = null;

    if (callbacks.log) callbacks.log(`📍 Você desceu nas galerias minerais de **${zone.name}**.`, 'system');
    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return true;
  },

  selectLamp(state, lampId, callbacks = {}) {
    const mState = this.getMiningState(state);
    if (!lampId) {
      mState.activeLamp = null;
      if (callbacks.updateAllUI) callbacks.updateAllUI();
      return true;
    }

    const available = mState.lampInventory[lampId] || 0;
    if (available <= 0) {
      if (callbacks.log) callbacks.log('⚠️ Você não possui este lampião/lanterna em seu inventário!', 'warning');
      return false;
    }

    mState.activeLamp = lampId;
    const lampDef = LAMPS_CATALOG[lampId];
    if (callbacks.log) callbacks.log(`🏮 Lâmpada acesa: **${lampDef?.name || lampId}**.`, 'system');

    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return true;
  },

  buyLamp(state, lampId, qty = 1, callbacks = {}) {
    const lamp = LAMPS_CATALOG[lampId];
    if (!lamp) return false;

    const count = Math.max(1, Math.floor(qty));
    const totalCost = lamp.buyPrice * count;

    if ((state.gold || 0) < totalCost) {
      if (callbacks.log) callbacks.log(`⚠️ Ouro insuficiente! Requer ${totalCost.toLocaleString()} Adena para comprar ${count}x ${lamp.name}.`, 'warning');
      return false;
    }

    state.gold -= totalCost;
    const mState = this.getMiningState(state);
    mState.lampInventory[lampId] = (mState.lampInventory[lampId] || 0) + count;

    if (!mState.activeLamp) {
      mState.activeLamp = lampId;
    }

    if (callbacks.log) callbacks.log(`🎒 Comprou ${count}x **${lamp.name}** por ${totalCost.toLocaleString()} Adena.`, 'loot');
    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return true;
  },

  buyPickaxe(state, pickaxeId, callbacks = {}) {
    const pick = PICKAXES_CATALOG[pickaxeId];
    if (!pick) return false;

    const mState = this.getMiningState(state);
    if (mState.pickaxeDurability[pickaxeId] !== undefined) {
      if (callbacks.log) callbacks.log(`⚠️ Você já adquiriu a ${pick.name}!`, 'warning');
      return false;
    }

    if (mState.skillLevel < pick.minMiningLevel) {
      if (callbacks.log) callbacks.log(`⚠️ Nível de Mineração insuficiente! Requer Nível ${pick.minMiningLevel} de Mineração.`, 'warning');
      return false;
    }

    if ((state.gold || 0) < pick.buyPrice) {
      if (callbacks.log) callbacks.log(`⚠️ Ouro insuficiente! Requer ${pick.buyPrice.toLocaleString()} Adena.`, 'warning');
      return false;
    }

    state.gold -= pick.buyPrice;
    mState.pickaxeDurability[pickaxeId] = pick.durabilityMax;
    mState.pickaxe = pickaxeId;

    if (callbacks.log) callbacks.log(`⛏️ Adquiriu e empunhou **${pick.name}**!`, 'rarity-legendary');
    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return true;
  },

  equipPickaxe(state, pickaxeId, callbacks = {}) {
    const pick = PICKAXES_CATALOG[pickaxeId];
    if (!pick) return false;

    const mState = this.getMiningState(state);
    if (mState.pickaxeDurability[pickaxeId] === undefined && pickaxeId !== 'pickaxe_none') {
      if (callbacks.log) callbacks.log('⚠️ Você não possui esta picareta em sua coleção!', 'warning');
      return false;
    }

    mState.pickaxe = pickaxeId;
    if (callbacks.log) callbacks.log(`⛏️ Picareta empunhada: **${pick.name}**.`, 'system');

    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return true;
  },

  repairPickaxe(state, pickaxeId, callbacks = {}) {
    const mState = this.getMiningState(state);
    const targetPickaxeId = pickaxeId || mState.pickaxe;
    const pick = PICKAXES_CATALOG[targetPickaxeId];
    if (!pick) return false;

    const currentDur = mState.pickaxeDurability[targetPickaxeId] ?? pick.durabilityMax;
    if (currentDur >= pick.durabilityMax) {
      if (callbacks.log) callbacks.log(`⚠️ Sua ${pick.name} já está com a ponta forjada e afiada!`, 'warning');
      return false;
    }

    const missingPct = (pick.durabilityMax - currentDur) / pick.durabilityMax;
    const cost = Math.max(100, Math.floor(pick.repairCost * missingPct));

    if ((state.gold || 0) < cost) {
      if (callbacks.log) callbacks.log(`⚠️ Ouro insuficiente para reforjar a ponta da picareta! Requer ${cost.toLocaleString()} Adena.`, 'warning');
      return false;
    }

    state.gold -= cost;
    mState.pickaxeDurability[targetPickaxeId] = pick.durabilityMax;

    // Sincroniza com LifeActivityCore
    const actState = LifeActivityCore.getActivityState(state, 'mining');
    actState.toolDurability = pick.durabilityMax;

    if (callbacks.log) callbacks.log(`✨ **${pick.name}** foi reforjada! Durabilidade restaurada (${pick.durabilityMax}/${pick.durabilityMax}).`, 'system');
    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return true;
  },

  selectTactic(state, tacticId, callbacks = {}) {
    const mState = this.getMiningState(state);
    const tactic = MINING_TACTICS[tacticId] || MINING_TACTICS.standard;
    mState.selectedTactic = tactic.id;
    mState.activeTactic = tactic.id;
    if (callbacks.log) callbacks.log(`⛏️ Técnica de escavação selecionada: **${tactic.name}** (${tactic.desc}).`, 'system');
    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return true;
  },

  pickNodeForZone(zoneId, activeLampId) {
    const zone = MINING_ZONES[zoneId] || MINING_ZONES.zone_abandoned_coal;
    const nodes = zone.availableNodes.map(id => MINERAL_NODES_CATALOG[id]).filter(Boolean);
    if (nodes.length === 0) return MINERAL_NODES_CATALOG.node_coal_deposit;

    const lamp = activeLampId ? LAMPS_CATALOG[activeLampId] : null;

    const weights = {
      common: 50,
      uncommon: 25,
      rare: 15,
      epic: 8,
      legendary: 2
    };

    if (lamp && lamp.rarityBoost) {
      if (lamp.rarityBoost === 'uncommon') weights.uncommon += 20;
      if (lamp.rarityBoost === 'rare') weights.rare += 25;
      if (lamp.rarityBoost === 'epic') weights.epic += 20;
      if (lamp.rarityBoost === 'legendary') weights.legendary += 20;
    }

    const roll = Math.random() * (weights.common + weights.uncommon + weights.rare + weights.epic + weights.legendary);
    let accum = 0;
    let targetRarity = 'common';

    for (const [r, w] of Object.entries(weights)) {
      accum += w;
      if (roll <= accum) {
        targetRarity = r;
        break;
      }
    }

    const matched = nodes.filter(n => n.rarity === targetRarity);
    if (matched.length > 0) {
      return matched[Math.floor(Math.random() * matched.length)];
    }

    return nodes[Math.floor(Math.random() * nodes.length)];
  },

  startMining(state, tacticId = null, callbacks = {}) {
    const mState = this.getMiningState(state);
    const activePickaxeId = mState.pickaxe || 'pickaxe_none';
    const pickDef = PICKAXES_CATALOG[activePickaxeId];
    const dur = mState.pickaxeDurability[activePickaxeId] ?? 0;

    if (dur <= 0) {
      if (callbacks.log) callbacks.log(`⚠️ Sua ${pickDef?.name || 'Picareta'} perdeu a têmpera! Reforje-a antes de continuar escavando.`, 'warning');
      return { success: false, reason: 'broken_tool' };
    }

    if (tacticId && MINING_TACTICS[tacticId]) {
      mState.selectedTactic = tacticId;
      mState.activeTactic = tacticId;
    }
    const tactic = MINING_TACTICS[mState.selectedTactic] || MINING_TACTICS.standard;

    // Consome 1 óleo/combustível de lâmpada se houver
    let lampSpeedMult = 1.0;
    if (mState.activeLamp) {
      const lampStock = mState.lampInventory[mState.activeLamp] || 0;
      if (lampStock > 0) {
        mState.lampInventory[mState.activeLamp] -= 1;
        const lampDef = LAMPS_CATALOG[mState.activeLamp];
        if (lampDef?.speedBoost) {
          lampSpeedMult = lampDef.speedBoost;
        }
      } else {
        mState.activeLamp = null;
      }
    }

    const zone = MINING_ZONES[mState.activeZone] || MINING_ZONES.zone_abandoned_coal;
    const node = this.pickNodeForZone(mState.activeZone, mState.activeLamp);

    let mineDuration = node.baseTime || zone.baseMineTime || 3300;
    mineDuration = Math.max(1200, Math.floor((mineDuration * (tactic.timeMult || 1.0)) / lampSpeedMult));

    mState.isMining = true;
    mState.mineStartTime = Date.now();
    mState.targetedNodeId = node.id;
    mState.mineDuration = mineDuration;
    mState.activeTactic = tactic.id;

    if (callbacks.log) {
      callbacks.log(`⛏️ Veio selecionado! [${tactic.name}] Escavando **${node.name}** em ${zone.name}...`, 'system');
    }

    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return { success: true };
  },

  finishMining(state, callbacks = {}) {
    const mState = this.getMiningState(state);
    if (!mState.isMining || !mState.targetedNodeId) return false;

    const now = Date.now();
    const elapsed = now - (mState.mineStartTime || now);
    const needed = mState.mineDuration ?? 3300;

    if (elapsed < needed) {
      const waitSec = ((needed - elapsed) / 1000).toFixed(1);
      if (callbacks.log) callbacks.log(`⚠️ O veio ainda está sendo quebrado! Aguarde mais ${waitSec}s.`, 'warning');
      return false;
    }

    const node = MINERAL_NODES_CATALOG[mState.targetedNodeId];
    if (!node) {
      mState.isMining = false;
      mState.targetedNodeId = null;
      return false;
    }

    // Consome durabilidade da picareta
    const activePickaxeId = mState.pickaxe || 'pickaxe_none';
    const pickDef = PICKAXES_CATALOG[activePickaxeId];
    if (mState.pickaxeDurability[activePickaxeId] !== undefined) {
      mState.pickaxeDurability[activePickaxeId] = Math.max(0, mState.pickaxeDurability[activePickaxeId] - 1);
    }
    const actState = LifeActivityCore.getActivityState(state, 'mining');
    actState.toolDurability = mState.pickaxeDurability[activePickaxeId] ?? 0;

    if (actState.toolDurability <= 0) {
      mState.isMining = false;
      mState.targetedNodeId = null;
      mState.autoMining = false;
      if (callbacks.log) callbacks.log(`💥 **PICARETA PARTIDA!** Sua ${pickDef?.name || 'picareta'} quebrou a ponta. Reforje-a no ferreiro para continuar.`, 'error');
      if (callbacks.updateAllUI) callbacks.updateAllUI();
      if (callbacks.save) callbacks.save();
      return false;
    }

    const tactic = MINING_TACTICS[mState.activeTactic] || MINING_TACTICS.standard;
    const pickBonus = pickDef?.qualityBonus || 0.0;
    const qualityMod = pickBonus + (tactic.qualityBonus || 0.0);

    const quality = RewardEngine.rollQuality(mState.skillLevel, qualityMod);
    const primaryMatRaw = node.yields.primary;
    const secMatRaw = node.yields.secondary;

    const primaryMat = resolveCanonicalResourceId(primaryMatRaw);
    const secMat = secMatRaw ? resolveCanonicalResourceId(secMatRaw) : null;

    const basePrimaryQty = node.yields.primaryQty || 1;
    const primaryQty = RewardEngine.calculateYield(basePrimaryQty, quality);

    const baseSecQty = node.yields.secondaryQty || 0;
    const secQty = baseSecQty > 0 ? RewardEngine.calculateYield(baseSecQty, quality) : 0;

    addToInventory(state, primaryMat, primaryQty, node.rarity, false, callbacks, true);
    if (secMat && secQty > 0) {
      addToInventory(state, secMat, secQty, node.rarity, false, callbacks, true);
    }

    // Registro no Catálogo Mineral e Codex
    mState.miningLog[node.id] = (mState.miningLog[node.id] || 0) + 1;
    mState.totalMined = (mState.totalMined || 0) + 1;
    LifeActivityCore.recordCodexDiscovery(state, 'mining', node.id);

    // XP
    const xpBase = node.xpReward || 8;
    const finalXp = Math.round(xpBase * quality.mult);
    LifeActivityCore.addXp(state, 'mining', finalXp, callbacks);

    mState.isMining = false;
    mState.targetedNodeId = null;

    if (callbacks.log) {
      const qualityPrefix = quality.tier === 'perfect' ? '💎 **MINÉRIO IMACULADO!**'
        : quality.tier === 'excellent' ? '✨ **MINÉRIO PURÍSSIMO!**'
        : '✓ Extração concluída:';
      callbacks.log(`⛏️ ${qualityPrefix} Extraiu **${node.name}** [${quality.name}]! Obteve +${primaryQty}x ${primaryMat.toUpperCase()}${secMat && secQty > 0 ? ` e +${secQty}x ${secMat.toUpperCase()}` : ''}! (+${finalXp} XP de Mineração)`, 'loot');
    }

    if (callbacks.floatText) {
      callbacks.floatText(`+${primaryQty}x ${primaryMat.toUpperCase()}`, 'float-gold');
    }

    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return true;
  },

  toggleAutoMining(state, callbacks = {}) {
    const mState = this.getMiningState(state);
    if (mState.skillLevel < 5) {
      if (callbacks.log) callbacks.log('⚠️ A Mineração Automática (AFK) é desbloqueada no Nível 5 de Mineração!', 'warning');
      return false;
    }

    mState.autoMining = !mState.autoMining;
    mState.lastAutoTick = Date.now();

    if (callbacks.log) {
      callbacks.log(
        mState.autoMining
          ? '⛏️ **Mineração Automática (AFK) ATIVADA!** Seu anão/mineiro extrairá veios minerais continuamente.'
          : '⏸️ **Mineração Automática (AFK) PAUSADA.**',
        'system'
      );
    }

    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return true;
  },

  processAutoMine(state, callbacks = {}) {
    const mState = this.getMiningState(state);
    if (!mState.autoMining) return;

    const activePickaxeId = mState.pickaxe || 'pickaxe_none';
    const dur = mState.pickaxeDurability[activePickaxeId] ?? 0;
    if (dur <= 0) {
      mState.autoMining = false;
      if (callbacks.log) callbacks.log('⚠️ Mineração AFK interrompida: Sua picareta quebrou!', 'warning');
      if (callbacks.updateAllUI) callbacks.updateAllUI();
      return;
    }

    const now = Date.now();
    if (!mState.isMining) {
      this.startMining(state, null, callbacks);
    } else {
      const elapsed = now - (mState.mineStartTime || now);
      const needed = mState.mineDuration ?? 3300;
      if (elapsed >= needed) {
        this.finishMining(state, callbacks);
      }
    }
  },

  processOfflineMining(state, minutesOffline = 0, callbacks = {}) {
    const mState = this.getMiningState(state);
    if (!mState.autoMining) return null;

    const activePickaxeId = mState.pickaxe || 'pickaxe_none';
    let availableDur = mState.pickaxeDurability[activePickaxeId] ?? 0;
    if (availableDur <= 0) return null;

    const clampedMinutes = Math.min(480, Math.max(0, minutesOffline));
    if (clampedMinutes < 2) return null;

    // 1 extração a cada 30 segundos com 25% de eficiência
    const totalPotential = Math.floor((clampedMinutes * 60) / 30 * 0.25);
    const actualMines = Math.min(availableDur, Math.max(1, totalPotential));

    if (actualMines <= 0) return null;

    mState.pickaxeDurability[activePickaxeId] -= actualMines;
    const actState = LifeActivityCore.getActivityState(state, 'mining');
    actState.toolDurability = mState.pickaxeDurability[activePickaxeId];

    const zoneId = mState.activeZone || 'zone_abandoned_coal';
    let totalXp = 0;
    const matsGained = {};

    for (let i = 0; i < actualMines; i++) {
      const node = this.pickNodeForZone(zoneId, null);
      mState.miningLog[node.id] = (mState.miningLog[node.id] || 0) + 1;
      mState.totalMined = (mState.totalMined || 0) + 1;
      totalXp += node.xpReward || 8;

      const pMat = resolveCanonicalResourceId(node.yields.primary);
      const pQty = node.yields.primaryQty || 1;
      matsGained[pMat] = (matsGained[pMat] || 0) + pQty;

      const sMatRaw = node.yields.secondary;
      const sQty = node.yields.secondaryQty || 0;
      if (sMatRaw && sQty > 0) {
        const sMat = resolveCanonicalResourceId(sMatRaw);
        matsGained[sMat] = (matsGained[sMat] || 0) + sQty;
      }
    }

    for (const [matId, qty] of Object.entries(matsGained)) {
      addToInventory(state, matId, qty, 'common', false, callbacks, true);
    }

    LifeActivityCore.addXp(state, 'mining', totalXp, callbacks);

    if (callbacks.log) {
      callbacks.log(`💤 **Relatório de Mineração Offline (${clampedMinutes}m):** Extraiu ${actualMines} veios minerais em Aden! (+${totalXp} XP de Mineração)`, 'rarity-legendary');
    }

    return { actualMines, matsGained, totalXp };
  }
};
