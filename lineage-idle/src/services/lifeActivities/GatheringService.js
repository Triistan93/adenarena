// GatheringService.js — Motor Central de Coleta Botânica & Flora de Aden (Lineage II Style)
import {
  GATHERING_ZONES,
  FLORA_NODES_CATALOG,
  SICKLES_CATALOG,
  POUCHES_CATALOG,
  GATHERING_TACTICS,
  BOTANICAL_HAZARDS,
  BOTANICAL_SIGNALS
} from '../../data/gathering.js';
import { addToInventory } from '../InventoryService.js';
import { LifeActivityCore } from './LifeActivityCore.js';
import { RewardEngine } from './RewardEngine.js';
import { hasRoomForStackRewards } from './RewardCapacity.js';
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
        targetedNodePurity: 0,
        targetedNodeHazard: 'none',
        targetedNodeSignal: '',
        inspected: false,
        harvestDuration: 3000,
        totalHarvested: 0,
        gatheringLog: {},
        autoGathering: false,
        lastAutoTick: 0,
        sickleDurability: {
          sickle_none: 50
        },
        pouchInventory: {},
        pendingOfflineGatheringReward: null
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

    LifeActivityCore.syncProfessionProgress(state, 'gathering', state.gathering);
    const activeZone = GATHERING_ZONES[state.gathering.activeZone];
    if (!state.gathering.isGathering && !state.gathering.pendingOfflineGatheringReward && !LifeActivityCore.isZoneAvailable(state, activeZone, state.gathering.skillLevel)) {
      state.gathering.activeZone = Object.values(GATHERING_ZONES).find(zone => LifeActivityCore.isZoneAvailable(state, zone, state.gathering.skillLevel))?.id || 'zone_gludio_fields';
    }

    return state.gathering;
  },

  getAvailableZones(state) {
    const playerLvl = Number(state?.level) || 1;
    const skill = this.getGatheringState(state).skillLevel;
    return Object.values(GATHERING_ZONES).filter(zone => LifeActivityCore.isZoneAvailable({ level: playerLvl }, zone, skill));
  },

  selectZone(state, zoneId, callbacks = {}) {
    const gState = this.getGatheringState(state);
    const zone = GATHERING_ZONES[zoneId];
    if (!zone) return false;
    if (gState.isGathering) {
      if (callbacks.log) callbacks.log('⚠️ Termine a colheita atual antes de trocar de clareira.', 'warning');
      return false;
    }

    const playerLvl = Number(state?.level) || 1;
    if (!LifeActivityCore.isZoneAvailable({ level: playerLvl }, zone, gState.skillLevel)) {
      if (callbacks.log) callbacks.log(`⚠️ ${zone.name} exige personagem nível ${zone.minLevel} e maestria de Coleta nível ${zone.minSkillLevel || 1}.`, 'warning');
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
    if (!pouch || !Number.isSafeInteger(qty) || qty <= 0) return false;

    const count = qty;
    const totalCost = pouch.buyPrice * count;
    if (!Number.isSafeInteger(totalCost) || totalCost < 0) return false;

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
    if (gState.isGathering) return false;
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
    if (gState.isGathering) return false;
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
    if (gState.isGathering) return false;
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
    if (gState.isGathering) return false;
    const tactic = GATHERING_TACTICS[tacticId] || GATHERING_TACTICS.standard;
    gState.selectedTactic = tactic.id;
    gState.activeTactic = tactic.id;
    if (callbacks.log) callbacks.log(`✂️ Técnica de poda selecionada: **${tactic.name}** (${tactic.desc}).`, 'system');
    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return true;
  },

  pickNodeForZone(zoneId, activePouchId, skillLevel = 1) {
    const zone = GATHERING_ZONES[zoneId] || GATHERING_ZONES.zone_gludio_fields;
    const nodes = zone.availableNodes.map(id => FLORA_NODES_CATALOG[id]).filter(node => node && skillLevel >= LifeActivityCore.getMinimumSkillForRarity(node.rarity));
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

  inspectNode(state, callbacks = {}) {
    const gState = this.getGatheringState(state);
    if (!gState.targetedNodeId) return false;
    if (gState.inspected) return false;
    
    gState.inspected = true;
    if (callbacks.log) callbacks.log(`🔍 Exame Botânico: A pureza é de ${gState.targetedNodePurity}%. ${gState.targetedNodeSignal} Perigo: ${BOTANICAL_HAZARDS[gState.targetedNodeHazard]}`, 'system');
    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return true;
  },

  skipNode(state, callbacks = {}) {
    const gState = this.getGatheringState(state);
    if (gState.isGathering) {
      if (callbacks.log) callbacks.log('⚠️ Termine a colheita atual antes de buscar outro broto.', 'warning');
      return false;
    }
    const node = this.pickNodeForZone(gState.activeZone, gState.activePouch, gState.skillLevel);
    gState.targetedNodeId = node.id;
    gState.targetedNodePurity = 50 + Math.floor(Math.random() * 51);
    const hazards = Object.keys(BOTANICAL_HAZARDS);
    gState.targetedNodeHazard = hazards[Math.floor(Math.random() * hazards.length)];
    gState.targetedNodeSignal = BOTANICAL_SIGNALS[gState.targetedNodeHazard];
    gState.inspected = false;
    gState.isGathering = false;
    gState.pendingHarvestReward = null;
    
    if (callbacks.log) callbacks.log(`⏭️ Você descarta o broto atual e busca um novo em ${GATHERING_ZONES[gState.activeZone].name}...`, 'system');
    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return true;
  },

  startHarvest(state, tacticId = null, callbacks = {}) {
    const gState = this.getGatheringState(state);
    const activeZone = GATHERING_ZONES[gState.activeZone];
    if (!LifeActivityCore.isZoneAvailable(state, activeZone, gState.skillLevel)) return { success: false, reason: 'zone_locked' };
    if (gState.pendingOfflineGatheringReward) {
      if (callbacks.log) callbacks.log('🎒 Resgate o lote offline de coleta antes de iniciar outra colheita.', 'warning');
      return { success: false, reason: 'pending_rewards' };
    }
    if (gState.isGathering) {
      if (callbacks.log) callbacks.log('⚠️ A colheita atual ainda está em andamento.', 'warning');
      return { success: false, reason: 'already_gathering' };
    }
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
    
    let node;
    if (gState.targetedNodeId && !gState.isGathering) {
        node = FLORA_NODES_CATALOG[gState.targetedNodeId];
    } else {
        node = this.pickNodeForZone(gState.activeZone, gState.activePouch, gState.skillLevel);
        gState.targetedNodeId = node.id;
        gState.targetedNodePurity = 50 + Math.floor(Math.random() * 51);
        const hazards = Object.keys(BOTANICAL_HAZARDS);
        gState.targetedNodeHazard = hazards[Math.floor(Math.random() * hazards.length)];
        gState.targetedNodeSignal = BOTANICAL_SIGNALS[gState.targetedNodeHazard];
        gState.inspected = false;
    }

    if (!node) node = this.pickNodeForZone(gState.activeZone, gState.activePouch, gState.skillLevel);

    let harvestDuration = node.baseTime || zone.baseGatherTime || 3200;
    harvestDuration = Math.max(1200, Math.floor((harvestDuration * (tactic.timeMult || 1.0)) / pouchSpeedMult));

    gState.isGathering = true;
    gState.pendingHarvestReward = null;
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
      gState.pendingHarvestReward = null;
      return false;
    }

    // Consome durabilidade
    const activeSickleId = gState.sickle || 'sickle_none';
    const sickleDef = SICKLES_CATALOG[activeSickleId];

    const tactic = GATHERING_TACTICS[gState.activeTactic] || GATHERING_TACTICS.standard;
    const sickleBonus = sickleDef?.qualityBonus || 0.0;
    
    let hazardPenalty = 0;
    let thornDamage = 0;
    let extraDurabilityCost = 0;
    if (gState.activeTactic !== 'delicate') {
      if (gState.targetedNodeHazard === 'thorn' && gState.activeTactic === 'cleave') {
        thornDamage = Math.floor((state.maxHp || 100) * 0.05);
      }
      if (gState.targetedNodeHazard === 'resin' && gState.activeTactic === 'cleave') {
        extraDurabilityCost = 1;
      }
      if (gState.targetedNodeHazard === 'toxin') {
        hazardPenalty = 0.25;
      }
    }

    let nodePurity = (gState.targetedNodePurity || 100) / 100;
    if (gState.inspected && gState.activeTactic !== 'inspect') {
      nodePurity += 0.20;
    }
    nodePurity = Math.max(0, Math.min(1.0, nodePurity - hazardPenalty));

    const qualityMod = sickleBonus + (tactic.qualityBonus || 0.0) + (nodePurity - 1.0);

    const pending = gState.pendingHarvestReward?.nodeId === node.id ? gState.pendingHarvestReward : null;
    const quality = pending?.quality || RewardEngine.rollQuality(gState.skillLevel, qualityMod);
    const primaryMatRaw = node.yields.primary;
    const secMatRaw = node.yields.secondary;

    const primaryMat = resolveCanonicalResourceId(primaryMatRaw);
    const secMat = secMatRaw ? resolveCanonicalResourceId(secMatRaw) : null;

    const basePrimaryQty = node.yields.primaryQty || 1;
    const primaryQty = pending?.primaryQty ?? RewardEngine.calculateYield(basePrimaryQty, quality);

    const baseSecQty = node.yields.secondaryQty || 0;
    const secQty = pending?.secQty ?? (baseSecQty > 0 ? RewardEngine.calculateYield(baseSecQty, quality) : 0);
    const finalXp = pending?.finalXp ?? Math.round((node.xpReward || 8) * quality.mult);

    const rewardDrops = [{ itemId: primaryMat, count: primaryQty }];
    if (secMat && secQty > 0) rewardDrops.push({ itemId: secMat, count: secQty });
    if (!hasRoomForStackRewards(state, rewardDrops)) {
      const alreadyNotified = Boolean(pending?.inventoryFullNotified);
      gState.pendingHarvestReward = { nodeId: node.id, quality, primaryQty, secQty, finalXp, inventoryFullNotified: true };
      if (!alreadyNotified) {
        if (callbacks.log) callbacks.log('⚠️ Mochila cheia! Libere espaço para concluir e receber esta colheita.', 'warning');
        if (callbacks.updateAllUI) callbacks.updateAllUI();
        if (callbacks.save) callbacks.save();
      }
      return false;
    }

    if (gState.sickleDurability[activeSickleId] !== undefined) {
      gState.sickleDurability[activeSickleId] = Math.max(0, gState.sickleDurability[activeSickleId] - 1);
    }
    const actState = LifeActivityCore.getActivityState(state, 'gathering');
    actState.toolDurability = gState.sickleDurability[activeSickleId] ?? 0;

    if (thornDamage > 0) {
      state.hp = Math.max(1, (state.hp || 100) - thornDamage);
      if (callbacks.log) callbacks.log(`🩸 Os espinhos afiados perfuraram sua pele! (${thornDamage} dano)`, 'error');
    }
    if (extraDurabilityCost > 0) {
      gState.sickleDurability[activeSickleId] = Math.max(0, gState.sickleDurability[activeSickleId] - extraDurabilityCost);
      actState.toolDurability = gState.sickleDurability[activeSickleId];
      if (callbacks.log) callbacks.log('⚠️ A seiva pegajosa grudou na foice! (-1 Durabilidade)', 'warning');
    }
    if (hazardPenalty > 0 && callbacks.log) {
      callbacks.log('🤢 Esporos venenosos cobriram a planta, reduzindo sua pureza!', 'warning');
    }

    const sickleBroken = actState.toolDurability <= 0;

    addToInventory(state, primaryMat, primaryQty, node.rarity, false, callbacks, true);
    if (secMat && secQty > 0) {
      addToInventory(state, secMat, secQty, node.rarity, false, callbacks, true);
    }

    // Registro no Catálogo Botânico e Codex
    gState.gatheringLog[node.id] = (gState.gatheringLog[node.id] || 0) + 1;
    gState.totalHarvested = (gState.totalHarvested || 0) + 1;
    LifeActivityCore.recordCodexDiscovery(state, 'gathering', node.id);

    // XP
    LifeActivityCore.addXp(state, 'gathering', finalXp, callbacks);

    gState.isGathering = false;
    gState.targetedNodeId = null;
    gState.pendingHarvestReward = null;

    if (callbacks.log) {
      const qualityPrefix = quality.tier === 'perfect' ? '🌸 **COLHEITA PERFEITA!**'
        : quality.tier === 'excellent' ? '✨ **COLHEITA EXCELENTE!**'
        : '✓ Colheita concluída:';
      callbacks.log(`🌿 ${qualityPrefix} Extraiu **${node.name}** [${quality.name}]! Obteve +${primaryQty}x ${primaryMat.toUpperCase()}${secMat && secQty > 0 ? ` e +${secQty}x ${secMat.toUpperCase()}` : ''}! (+${finalXp} XP de Coleta)`, 'loot');
    }

    if (callbacks.floatText) {
      callbacks.floatText(`+${primaryQty}x ${primaryMat.toUpperCase()}`, 'float-gold');
    }

    if (sickleBroken) {
      gState.autoGathering = false;
      if (callbacks.log) callbacks.log(`💥 **FOICE CEGA!** Sua ${sickleDef?.name || 'foice'} perdeu completamente o corte após esta colheita. Amole-a para continuar.`, 'error');
    }

    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return true;
  },

  toggleAutoGathering(state, callbacks = {}) {
    const gState = this.getGatheringState(state);
    if (gState.pendingOfflineGatheringReward) {
      if (callbacks.log) callbacks.log('🎒 Resgate o lote offline de coleta antes de retomar o modo AFK.', 'warning');
      return false;
    }
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
    if (gState.pendingOfflineGatheringReward) return this.claimOfflineGatheringReward(state, callbacks);
    if (!gState.autoGathering) return null;

    if (gState.pendingHarvestReward) {
      if (gState.isGathering && FLORA_NODES_CATALOG[gState.pendingHarvestReward.nodeId]) {
        const pending = gState.pendingHarvestReward;
        if (this.finishHarvest(state, callbacks)) {
          return {
            actualHarvests: 1,
            matsGained: {
              [resolveCanonicalResourceId(FLORA_NODES_CATALOG[pending.nodeId].yields.primary)]: pending.primaryQty,
              ...(FLORA_NODES_CATALOG[pending.nodeId].yields.secondary && pending.secQty > 0
                ? { [resolveCanonicalResourceId(FLORA_NODES_CATALOG[pending.nodeId].yields.secondary)]: pending.secQty }
                : {})
            },
            totalXp: pending.finalXp,
            claimedPendingReward: true
          };
        }
      }

      // Keep the exact saved yield. Do not roll offline replacements or clear a
      // reward that is still waiting for inventory capacity.
      return { actualHarvests: 0, matsGained: {}, totalXp: 0, pendingReward: true };
    }

    const activeSickleId = gState.sickle || 'sickle_none';
    const availableDur = gState.sickleDurability[activeSickleId] ?? 0;
    if (availableDur <= 0) {
      gState.autoGathering = false;
      gState.isGathering = false;
      gState.targetedNodeId = null;
      return null;
    }

    const clampedMinutes = Math.min(480, Math.max(0, minutesOffline));
    if (clampedMinutes < 2) return null;

    const zoneId = gState.activeZone || 'zone_gludio_fields';
    const zone = GATHERING_ZONES[zoneId] || GATHERING_ZONES.zone_gludio_fields;
    const sickle = SICKLES_CATALOG[activeSickleId] || SICKLES_CATALOG.sickle_none;
    const tactic = GATHERING_TACTICS[gState.selectedTactic] || GATHERING_TACTICS.standard;
    let durabilitySpent = 0;
    let timeSpent = 0;
    let actualHarvests = 0;
    let totalXp = 0;
    const matsGained = {};
    const discoveries = {};
    const offlineTimeBudget = clampedMinutes * 60 * 1000 * 0.25;

    while (durabilitySpent < availableDur) {
      const pouchId = gState.activePouch;
      const pouchStock = pouchId ? (gState.pouchInventory[pouchId] || 0) : 0;
      if (pouchId && pouchStock <= 0) gState.activePouch = null;
      const usablePouchId = pouchStock > 0 ? pouchId : null;
      const pouch = usablePouchId ? POUCHES_CATALOG[usablePouchId] : null;
      const node = this.pickNodeForZone(zoneId, usablePouchId, gState.skillLevel);
      const duration = Math.max(1200, Math.floor(
        ((node.baseTime || zone.baseGatherTime || 3200) * (tactic.timeMult || 1)) / (pouch?.speedBoost || 1)
      ));
      if (timeSpent + duration > offlineTimeBudget) break;

      if (usablePouchId) gState.pouchInventory[usablePouchId] = Math.max(0, pouchStock - 1);
      timeSpent += duration;
      actualHarvests++;

      const hazards = Object.keys(BOTANICAL_HAZARDS);
      const hazard = hazards[Math.floor(Math.random() * hazards.length)];
      const purity = 0.5 + Math.floor(Math.random() * 51) / 100;
      const ignoresHazards = tactic.id === 'delicate';
      const hazardPenalty = !ignoresHazards && hazard === 'toxin' ? 0.25 : 0;
      const qualityMod = (sickle.qualityBonus || 0) + (tactic.qualityBonus || 0) + (Math.max(0, Math.min(1, purity - hazardPenalty)) - 1);
      const quality = RewardEngine.rollQuality(gState.skillLevel, qualityMod);
      const primaryMat = resolveCanonicalResourceId(node.yields.primary);
      const primaryQty = RewardEngine.calculateYield(node.yields.primaryQty || 1, quality);
      matsGained[primaryMat] = (matsGained[primaryMat] || 0) + primaryQty;
      if (node.yields.secondary && (node.yields.secondaryQty || 0) > 0) {
        const secondaryMat = resolveCanonicalResourceId(node.yields.secondary);
        const secondaryQty = RewardEngine.calculateYield(node.yields.secondaryQty, quality);
        matsGained[secondaryMat] = (matsGained[secondaryMat] || 0) + secondaryQty;
      }
      totalXp += Math.round((node.xpReward || 8) * quality.mult);
      discoveries[node.id] = (discoveries[node.id] || 0) + 1;

      if (!ignoresHazards && tactic.id === 'cleave' && hazard === 'thorn') {
        const hpLoss = Math.floor((Number(state.maxHp) || 100) * 0.05);
        state.hp = Math.max(1, (Number(state.hp) || 100) - hpLoss);
      }
      durabilitySpent += 1 + (!ignoresHazards && tactic.id === 'cleave' && hazard === 'resin' ? 1 : 0);
      if (durabilitySpent >= availableDur) break;
    }

    if (actualHarvests <= 0) return null;

    gState.sickleDurability[activeSickleId] = Math.max(0, availableDur - durabilitySpent);
    const actState = LifeActivityCore.getActivityState(state, 'gathering');
    actState.toolDurability = gState.sickleDurability[activeSickleId];

    // Offline harvest accounting includes the saved in-progress cycle; clear it so the
    // first online tick cannot pay that same node a second time.
    gState.isGathering = false;
    gState.targetedNodeId = null;
    gState.inspected = false;
    gState.pendingHarvestReward = null;
    gState.pendingOfflineGatheringReward = {
      actualHarvests, matsGained, totalXp, discoveries,
      sickleId: activeSickleId, resumeAutoGathering: true,
      inventoryFullNotified: false, clampedMinutes
    };
    gState.autoGathering = false;
    gState.lastAutoTick = Date.now();
    if (callbacks.save) callbacks.save();
    return this.claimOfflineGatheringReward(state, callbacks);
  },

  claimOfflineGatheringReward(state, callbacks = {}) {
    const gState = this.getGatheringState(state);
    const pending = gState.pendingOfflineGatheringReward;
    if (!pending) return { success: false, reason: 'no_pending_rewards' };

    const rewardState = { ...state, inventory: (state.inventory || []).map(item => ({ ...item })) };
    for (const [itemId, count] of Object.entries(pending.matsGained || {})) {
      if (!addToInventory(rewardState, itemId, count, 'common', false, {}, true)) {
        if (!pending.inventoryFullNotified && callbacks.log) {
          callbacks.log('🎒 Mochila cheia: libere espaço para resgatar as ervas e madeiras da coleta offline.', 'warning');
        }
        pending.inventoryFullNotified = true;
        if (callbacks.updateAllUI) callbacks.updateAllUI();
        if (callbacks.save) callbacks.save();
        return { success: false, reason: 'inventory_full', pendingRewards: pending };
      }
    }

    state.inventory = rewardState.inventory;
    for (const [nodeId, count] of Object.entries(pending.discoveries || {})) {
      gState.gatheringLog[nodeId] = (gState.gatheringLog[nodeId] || 0) + count;
      LifeActivityCore.recordCodexDiscovery(state, 'gathering', nodeId);
    }
    gState.totalHarvested = (gState.totalHarvested || 0) + (pending.actualHarvests || 0);
    LifeActivityCore.addXp(state, 'gathering', pending.totalXp || 0, callbacks);
    gState.pendingOfflineGatheringReward = null;
    gState.autoGathering = Boolean(pending.resumeAutoGathering && gState.sickle === pending.sickleId && (Number(gState.sickleDurability[pending.sickleId]) || 0) > 0);

    if (callbacks.log) callbacks.log(`💤 **Relatório de Coleta Offline (${pending.clampedMinutes}m):** Colheu ${pending.actualHarvests} recursos em Aden! (+${pending.totalXp} XP de Coleta)`, 'rarity-legendary');
    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return { success: true, actualHarvests: pending.actualHarvests, matsGained: pending.matsGained, totalXp: pending.totalXp };
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
