// GatheringService.js — Motor Central de Coleta Botânica & Flora de Aden (Lineage II Style)
import {
  GATHERING_ZONES,
  FLORA_NODES_CATALOG,
  SICKLES_CATALOG,
  POUCHES_CATALOG,
  GATHERING_TACTICS
} from '../../data/gathering.js';
import { addToInventory } from '../InventoryService.js';
import { LifeActivityCore } from './LifeActivityCore.js';
import { RewardEngine } from './RewardEngine.js';
import { resolveCanonicalResourceId } from './ResourceDictionary.js';

export const GatheringService = {
  getGatheringState(state) {
    if (state) {
      LifeActivityCore.getActivityState(state, 'gathering');
    }
    if (!state.gathering || typeof state.gathering !== 'object') {
      state.gathering = {
        skillLevel: 1,
        skillXp: 0,
        sickle: 'sickle_none',
        selectedTactic: 'standard',
        activePouch: null,
        activeZone: 'zone_gludio_fields',
        isGathering: false,
        harvestStartTime: 0,
        targetedNodeId: null,
        harvestDuration: 3000,
        totalHarvested: 0,
        gatheringLog: {},
        autoGathering: false,
        lastAutoTick: 0,
        sickleDurability: {
          sickle_none: 50
        },
        pouchInventory: {}
      };
    }

    if (!state.gathering.sickle) {
      state.gathering.sickle = 'sickle_none';
    }
    if (!state.gathering.selectedTactic) {
      state.gathering.selectedTactic = 'standard';
    }
    if (!state.gathering.sickleDurability) {
      state.gathering.sickleDurability = {};
    }
    if (state.gathering.sickleDurability.sickle_none === undefined) {
      state.gathering.sickleDurability.sickle_none = 50;
    }
    if (!state.gathering.pouchInventory) {
      state.gathering.pouchInventory = {};
    }
    if (!state.gathering.gatheringLog) {
      state.gathering.gatheringLog = {};
    }
    if (!state.gathering.activeZone) {
      state.gathering.activeZone = 'zone_gludio_fields';
    }

    return state.gathering;
  },

  getAvailableZones(state) {
    const playerLvl = Number(state?.level) || 1;
    return Object.values(GATHERING_ZONES).filter(zone => playerLvl >= zone.minLevel);
  },

  selectZone(state, zoneId, callbacks = {}) {
    const gState = this.getGatheringState(state);
    const zone = GATHERING_ZONES[zoneId];
    if (!zone) return false;

    const playerLvl = Number(state?.level) || 1;
    if (playerLvl < zone.minLevel) {
      if (callbacks.log) callbacks.log(`⚠️ Nível insuficiente para colher em ${zone.name}! Requer Nível ${zone.minLevel}.`, 'warning');
      return false;
    }

    gState.activeZone = zoneId;
    gState.isGathering = false;
    gState.targetedNodeId = null;

    if (callbacks.log) callbacks.log(`📍 Você armou sua cesta botânica em **${zone.name}**.`, 'system');
    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return true;
  },

  selectPouch(state, pouchId, callbacks = {}) {
    const gState = this.getGatheringState(state);
    if (!pouchId) {
      gState.activePouch = null;
      if (callbacks.updateAllUI) callbacks.updateAllUI();
      return true;
    }

    const available = gState.pouchInventory[pouchId] || 0;
    if (available <= 0) {
      if (callbacks.log) callbacks.log('⚠️ Você não possui este cesto/bolsa de conservação em estoque!', 'warning');
      return false;
    }

    gState.activePouch = pouchId;
    const pouchDef = POUCHES_CATALOG[pouchId];
    if (callbacks.log) callbacks.log(`🧺 Cesto ativo: **${pouchDef?.name || pouchId}**.`, 'system');

    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return true;
  },

  buyPouch(state, pouchId, qty = 1, callbacks = {}) {
    const pouch = POUCHES_CATALOG[pouchId];
    if (!pouch) return false;

    const count = Math.max(1, Math.floor(qty));
    const totalCost = pouch.buyPrice * count;

    if ((state.gold || 0) < totalCost) {
      if (callbacks.log) callbacks.log(`⚠️ Ouro insuficiente! Requer ${totalCost.toLocaleString()} Adena para comprar ${count}x ${pouch.name}.`, 'warning');
      return false;
    }

    state.gold -= totalCost;
    const gState = this.getGatheringState(state);
    gState.pouchInventory[pouchId] = (gState.pouchInventory[pouchId] || 0) + count;

    if (!gState.activePouch) {
      gState.activePouch = pouchId;
    }

    if (callbacks.log) callbacks.log(`🎒 Comprou ${count}x **${pouch.name}** por ${totalCost.toLocaleString()} Adena.`, 'loot');
    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return true;
  },

  buySickle(state, sickleId, callbacks = {}) {
    const sickle = SICKLES_CATALOG[sickleId];
    if (!sickle) return false;

    const gState = this.getGatheringState(state);
    if (gState.sickleDurability[sickleId] !== undefined) {
      if (callbacks.log) callbacks.log(`⚠️ Você já adquiriu a ${sickle.name}!`, 'warning');
      return false;
    }

    if (gState.skillLevel < sickle.minGatheringLevel) {
      if (callbacks.log) callbacks.log(`⚠️ Nível de Coleta insuficiente! Requer Nível ${sickle.minGatheringLevel} de Coleta.`, 'warning');
      return false;
    }

    if ((state.gold || 0) < sickle.buyPrice) {
      if (callbacks.log) callbacks.log(`⚠️ Ouro insuficiente! Requer ${sickle.buyPrice.toLocaleString()} Adena.`, 'warning');
      return false;
    }

    state.gold -= sickle.buyPrice;
    gState.sickleDurability[sickleId] = sickle.durabilityMax;
    gState.sickle = sickleId;

    if (callbacks.log) callbacks.log(`🌾 Adquiriu e empunhou **${sickle.name}**!`, 'rarity-legendary');
    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return true;
  },

  equipSickle(state, sickleId, callbacks = {}) {
    const sickle = SICKLES_CATALOG[sickleId];
    if (!sickle) return false;

    const gState = this.getGatheringState(state);
    if (gState.sickleDurability[sickleId] === undefined && sickleId !== 'sickle_none') {
      if (callbacks.log) callbacks.log('⚠️ Você não possui esta foice em sua coleção!', 'warning');
      return false;
    }

    gState.sickle = sickleId;
    if (callbacks.log) callbacks.log(`🌾 Foice empunhada: **${sickle.name}**.`, 'system');

    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return true;
  },

  repairSickle(state, sickleId, callbacks = {}) {
    const gState = this.getGatheringState(state);
    const targetSickleId = sickleId || gState.sickle;
    const sickle = SICKLES_CATALOG[targetSickleId];
    if (!sickle) return false;

    const currentDur = gState.sickleDurability[targetSickleId] ?? sickle.durabilityMax;
    if (currentDur >= sickle.durabilityMax) {
      if (callbacks.log) callbacks.log(`⚠️ Sua ${sickle.name} já está afiada e pronta para a colheita!`, 'warning');
      return false;
    }

    const missingPct = (sickle.durabilityMax - currentDur) / sickle.durabilityMax;
    const cost = Math.max(100, Math.floor(sickle.repairCost * missingPct));

    if ((state.gold || 0) < cost) {
      if (callbacks.log) callbacks.log(`⚠️ Ouro insuficiente para amolar a foice! Requer ${cost.toLocaleString()} Adena.`, 'warning');
      return false;
    }

    state.gold -= cost;
    gState.sickleDurability[targetSickleId] = sickle.durabilityMax;

    // Sincroniza com LifeActivityCore
    const actState = LifeActivityCore.getActivityState(state, 'gathering');
    actState.toolDurability = sickle.durabilityMax;

    if (callbacks.log) callbacks.log(`✨ **${sickle.name}** foi amolada! Durabilidade restaurada (${sickle.durabilityMax}/${sickle.durabilityMax}).`, 'system');
    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return true;
  },

  selectTactic(state, tacticId, callbacks = {}) {
    const gState = this.getGatheringState(state);
    const tactic = GATHERING_TACTICS[tacticId] || GATHERING_TACTICS.standard;
    gState.selectedTactic = tactic.id;
    gState.activeTactic = tactic.id;
    if (callbacks.log) callbacks.log(`✂️ Técnica de poda selecionada: **${tactic.name}** (${tactic.desc}).`, 'system');
    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return true;
  },

  pickNodeForZone(zoneId, activePouchId) {
    const zone = GATHERING_ZONES[zoneId] || GATHERING_ZONES.zone_gludio_fields;
    const nodes = zone.availableNodes.map(id => FLORA_NODES_CATALOG[id]).filter(Boolean);
    if (nodes.length === 0) return FLORA_NODES_CATALOG.node_wild_branch;

    const pouch = activePouchId ? POUCHES_CATALOG[activePouchId] : null;

    const weights = {
      common: 50,
      uncommon: 25,
      rare: 15,
      epic: 8,
      legendary: 2
    };

    if (pouch && pouch.rarityBoost) {
      if (pouch.rarityBoost === 'uncommon') weights.uncommon += 20;
      if (pouch.rarityBoost === 'rare') weights.rare += 25;
      if (pouch.rarityBoost === 'epic') weights.epic += 20;
      if (pouch.rarityBoost === 'legendary') weights.legendary += 20;
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

  startHarvest(state, tacticId = null, callbacks = {}) {
    const gState = this.getGatheringState(state);
    const activeSickleId = gState.sickle || 'sickle_none';
    const sickleDef = SICKLES_CATALOG[activeSickleId];
    const dur = gState.sickleDurability[activeSickleId] ?? 0;

    if (dur <= 0) {
      if (callbacks.log) callbacks.log(`⚠️ Sua ${sickleDef?.name || 'Foice'} perdeu o corte! Amole-a antes de continuar a colheita.`, 'warning');
      return { success: false, reason: 'broken_tool' };
    }

    if (tacticId && GATHERING_TACTICS[tacticId]) {
      gState.selectedTactic = tacticId;
      gState.activeTactic = tacticId;
    }
    const tactic = GATHERING_TACTICS[gState.selectedTactic] || GATHERING_TACTICS.standard;

    // Consome 1 cesto se houver
    let pouchSpeedMult = 1.0;
    if (gState.activePouch) {
      const pouchStock = gState.pouchInventory[gState.activePouch] || 0;
      if (pouchStock > 0) {
        gState.pouchInventory[gState.activePouch] -= 1;
        const pouchDef = POUCHES_CATALOG[gState.activePouch];
        if (pouchDef?.speedBoost) {
          pouchSpeedMult = pouchDef.speedBoost;
        }
      } else {
        gState.activePouch = null;
      }
    }

    const zone = GATHERING_ZONES[gState.activeZone] || GATHERING_ZONES.zone_gludio_fields;
    const node = this.pickNodeForZone(gState.activeZone, gState.activePouch);

    let harvestDuration = node.baseTime || zone.baseGatherTime || 3200;
    harvestDuration = Math.max(1200, Math.floor((harvestDuration * (tactic.timeMult || 1.0)) / pouchSpeedMult));

    gState.isGathering = true;
    gState.harvestStartTime = Date.now();
    gState.targetedNodeId = node.id;
    gState.harvestDuration = harvestDuration;
    gState.activeTactic = tactic.id;

    if (callbacks.log) {
      callbacks.log(`🌿 Arbusto selecionado! [${tactic.name}] Colhendo **${node.name}** em ${zone.name}...`, 'system');
    }

    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return { success: true };
  },

  finishHarvest(state, callbacks = {}) {
    const gState = this.getGatheringState(state);
    if (!gState.isGathering || !gState.targetedNodeId) return false;

    const now = Date.now();
    const elapsed = now - (gState.harvestStartTime || now);
    const needed = gState.harvestDuration ?? 3000;

    if (elapsed < needed) {
      const waitSec = ((needed - elapsed) / 1000).toFixed(1);
      if (callbacks.log) callbacks.log(`⚠️ A colheita ainda está em andamento! Aguarde mais ${waitSec}s.`, 'warning');
      return false;
    }

    const node = FLORA_NODES_CATALOG[gState.targetedNodeId];
    if (!node) {
      gState.isGathering = false;
      gState.targetedNodeId = null;
      return false;
    }

    // Consome durabilidade
    const activeSickleId = gState.sickle || 'sickle_none';
    const sickleDef = SICKLES_CATALOG[activeSickleId];
    if (gState.sickleDurability[activeSickleId] !== undefined) {
      gState.sickleDurability[activeSickleId] = Math.max(0, gState.sickleDurability[activeSickleId] - 1);
    }
    const actState = LifeActivityCore.getActivityState(state, 'gathering');
    actState.toolDurability = gState.sickleDurability[activeSickleId] ?? 0;

    if (actState.toolDurability <= 0) {
      gState.isGathering = false;
      gState.targetedNodeId = null;
      gState.autoGathering = false;
      if (callbacks.log) callbacks.log(`💥 **FOICE CEGA!** Sua ${sickleDef?.name || 'foice'} perdeu completamente o corte. Amole-a para continuar.`, 'error');
      if (callbacks.updateAllUI) callbacks.updateAllUI();
      if (callbacks.save) callbacks.save();
      return false;
    }

    const tactic = GATHERING_TACTICS[gState.activeTactic] || GATHERING_TACTICS.standard;
    const sickleBonus = sickleDef?.qualityBonus || 0.0;
    const qualityMod = sickleBonus + (tactic.qualityBonus || 0.0);

    const quality = RewardEngine.rollQuality(gState.skillLevel, qualityMod);
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

    // Registro no Catálogo Botânico e Codex
    gState.gatheringLog[node.id] = (gState.gatheringLog[node.id] || 0) + 1;
    gState.totalHarvested = (gState.totalHarvested || 0) + 1;
    LifeActivityCore.recordCodexDiscovery(state, 'gathering', node.id);

    // XP
    const xpBase = node.xpReward || 8;
    const finalXp = Math.round(xpBase * quality.mult);
    LifeActivityCore.addXp(state, 'gathering', finalXp, callbacks);

    gState.isGathering = false;
    gState.targetedNodeId = null;

    if (callbacks.log) {
      const qualityPrefix = quality.tier === 'perfect' ? '🌸 **COLHEITA PERFEITA!**'
        : quality.tier === 'excellent' ? '✨ **COLHEITA EXCELENTE!**'
        : '✓ Colheita concluída:';
      callbacks.log(`🌿 ${qualityPrefix} Extraiu **${node.name}** [${quality.name}]! Obteve +${primaryQty}x ${primaryMat.toUpperCase()}${secMat && secQty > 0 ? ` e +${secQty}x ${secMat.toUpperCase()}` : ''}! (+${finalXp} XP de Coleta)`, 'loot');
    }

    if (callbacks.floatText) {
      callbacks.floatText(`+${primaryQty}x ${primaryMat.toUpperCase()}`, 'float-gold');
    }

    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return true;
  },

  toggleAutoGathering(state, callbacks = {}) {
    const gState = this.getGatheringState(state);
    if (gState.skillLevel < 5) {
      if (callbacks.log) callbacks.log('⚠️ A Coleta Automática (AFK) é desbloqueada no Nível 5 de Coleta!', 'warning');
      return false;
    }

    gState.autoGathering = !gState.autoGathering;
    gState.lastAutoTick = Date.now();

    if (callbacks.log) {
      callbacks.log(
        gState.autoGathering
          ? '🌿 **Coleta Automática (AFK) ATIVADA!** Seu personagem colherá ervas e madeiras continuamente.'
          : '⏸️ **Coleta Automática (AFK) PAUSADA.**',
        'system'
      );
    }

    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return true;
  },

  processAutoGather(state, callbacks = {}) {
    const gState = this.getGatheringState(state);
    if (!gState.autoGathering) return;

    const activeSickleId = gState.sickle || 'sickle_none';
    const dur = gState.sickleDurability[activeSickleId] ?? 0;
    if (dur <= 0) {
      gState.autoGathering = false;
      if (callbacks.log) callbacks.log('⚠️ Coleta AFK interrompida: Sua foice perdeu o corte!', 'warning');
      if (callbacks.updateAllUI) callbacks.updateAllUI();
      return;
    }

    const now = Date.now();
    if (!gState.isGathering) {
      this.startHarvest(state, null, callbacks);
    } else {
      const elapsed = now - (gState.harvestStartTime || now);
      const needed = gState.harvestDuration ?? 3200;
      if (elapsed >= needed) {
        this.finishHarvest(state, callbacks);
      }
    }
  },

  processOfflineGathering(state, minutesOffline = 0, callbacks = {}) {
    const gState = this.getGatheringState(state);
    if (!gState.autoGathering) return null;

    const activeSickleId = gState.sickle || 'sickle_none';
    let availableDur = gState.sickleDurability[activeSickleId] ?? 0;
    if (availableDur <= 0) return null;

    const clampedMinutes = Math.min(480, Math.max(0, minutesOffline));
    if (clampedMinutes < 2) return null;

    // 1 colheita a cada 30 segundos com 25% de eficiência
    const totalPotential = Math.floor((clampedMinutes * 60) / 30 * 0.25);
    const actualHarvests = Math.min(availableDur, Math.max(1, totalPotential));

    if (actualHarvests <= 0) return null;

    gState.sickleDurability[activeSickleId] -= actualHarvests;
    const actState = LifeActivityCore.getActivityState(state, 'gathering');
    actState.toolDurability = gState.sickleDurability[activeSickleId];

    const zoneId = gState.activeZone || 'zone_gludio_fields';
    let totalXp = 0;
    const matsGained = {};

    for (let i = 0; i < actualHarvests; i++) {
      const node = this.pickNodeForZone(zoneId, null);
      gState.gatheringLog[node.id] = (gState.gatheringLog[node.id] || 0) + 1;
      gState.totalHarvested = (gState.totalHarvested || 0) + 1;
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

    LifeActivityCore.addXp(state, 'gathering', totalXp, callbacks);

    if (callbacks.log) {
      callbacks.log(`💤 **Relatório de Coleta Offline (${clampedMinutes}m):** Colheu ${actualHarvests} arbustos de flora em Aden! (+${totalXp} XP de Coleta)`, 'rarity-legendary');
    }

    return { actualHarvests, matsGained, totalXp };
  },

  startGathering(state, tacticId = null, callbacks = {}) {
    return this.startHarvest(state, tacticId, callbacks);
  },

  finishGathering(state, callbacks = {}) {
    return this.finishHarvest(state, callbacks);
  },

  exchangeHerbs(state, herbId, qty = 1, callbacks = {}) {
    return false;
  }
};
