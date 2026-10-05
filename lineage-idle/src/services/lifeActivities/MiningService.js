// MiningService.js — Motor Central de Mineração & Veios Minerais de Aden (Lineage II Style)
import {
  MINING_ZONES,
  MINERAL_NODES_CATALOG,
  PICKAXES_CATALOG,
  LAMPS_CATALOG,
  MINING_TACTICS
} from '../../data/mining.js';
import { addToInventory, removeFromInventory } from '../InventoryService.js';
import { LifeActivityCore } from './LifeActivityCore.js';
import { RewardEngine } from './RewardEngine.js';
import { hasRoomForStackRewards } from './RewardCapacity.js';
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
    if (state.mining.galleryStability === undefined) {
      state.mining.galleryStability = 100;
    }
    if (!state.mining.veinHazard) {
      const hazards = ['none', 'none', 'none', 'gas_pocket', 'seismic_fault', 'dense_crystal'];
      state.mining.veinHazard = hazards[Math.floor(Math.random() * hazards.length)];
    }
    if (state.mining.veinProbed === undefined) {
      state.mining.veinProbed = false;
    }

    LifeActivityCore.syncProfessionProgress(state, 'mining', state.mining);
    const activeZone = MINING_ZONES[state.mining.activeZone];
    if (!state.mining.isMining && !state.mining.pendingOfflineMiningReward && !LifeActivityCore.isZoneAvailable(state, activeZone, state.mining.skillLevel)) {
      state.mining.activeZone = Object.values(MINING_ZONES).find(zone => LifeActivityCore.isZoneAvailable(state, zone, state.mining.skillLevel))?.id || 'zone_abandoned_coal';
    }

    return state.mining;
  },

  getAvailableZones(state) {
    const playerLvl = Number(state?.level) || 1;
    const skill = this.getMiningState(state).skillLevel;
    return Object.values(MINING_ZONES).filter(zone => LifeActivityCore.isZoneAvailable({ level: playerLvl }, zone, skill));
  },

  probeVein(state, callbacks = {}) {
    const mState = this.getMiningState(state);
    if (mState.isMining) return false;
    mState.veinProbed = true;
    if (callbacks.log) callbacks.log("🔍 O eco metálico revela a estrutura interna da rocha...", 'system');
    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return true;
  },

  shoreUpGallery(state, callbacks = {}) {
    const mState = this.getMiningState(state);
    if (mState.isMining) return false;
    const hasUsableMaterial = (itemId) => state.inventory?.some(i =>
      (i.itemId || i.id) === itemId && !i.equipped && (i.qty || i.count || 0) > 0
    );
    const branchItem = hasUsableMaterial('branch');
    const woodItem = hasUsableMaterial('compressed_wood');

    const targetMatId = branchItem ? 'branch' : (woodItem ? 'compressed_wood' : null);
    if (!targetMatId) {
      if (callbacks.log) callbacks.log('⚠️ Você não possui Madeira (Branch ou Compressed Wood) para escorar a galeria!', 'warning');
      return false;
    }

    let toDeduct = 1;
    for (let i = state.inventory.length - 1; i >= 0 && toDeduct > 0; i--) {
      const item = state.inventory[i];
      if ((item.id === targetMatId || item.itemId === targetMatId) && !item.equipped) {
        const currentStack = item.count || item.qty || 1;
        if (currentStack <= toDeduct) {
          toDeduct -= currentStack;
          state.inventory.splice(i, 1);
        } else {
          if (item.count !== undefined) item.count = currentStack - toDeduct;
          if (item.qty !== undefined) item.qty = currentStack - toDeduct;
          toDeduct = 0;
        }
      }
    }

    mState.galleryStability = Math.min(100, (mState.galleryStability ?? 100) + 35);
    if (callbacks.log) callbacks.log('🪵 Você escorou as vigas da galeria! Estabilidade +35%.', 'system');
    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return true;
  },

  selectZone(state, zoneId, callbacks = {}) {
    const mState = this.getMiningState(state);
    if (mState.isMining) {
      if (callbacks.log) callbacks.log('⚠️ Termine a extração atual antes de mudar de galeria.', 'warning');
      return false;
    }
    const zone = MINING_ZONES[zoneId];
    if (!zone) return false;

    const playerLvl = Number(state?.level) || 1;
    if (!LifeActivityCore.isZoneAvailable({ level: playerLvl }, zone, mState.skillLevel)) {
      if (callbacks.log) callbacks.log(`⚠️ ${zone.name} exige personagem nível ${zone.minLevel} e maestria de Mineração nível ${zone.minSkillLevel || 1}.`, 'warning');
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
      if (callbacks.save) callbacks.save();
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
    if (!lamp || !Number.isSafeInteger(qty) || qty <= 0) return false;

    const count = qty;
    const totalCost = lamp.buyPrice * count;
    if (!Number.isSafeInteger(totalCost) || totalCost < 0) return false;

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
    if (mState.isMining) return false;
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
    if (mState.isMining || mState.pendingOfflineMiningReward) return false;
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
    if (mState.isMining) return false;
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

    // Mantém a durabilidade canônica alinhada somente quando a ferramenta reparada está equipada.
    if (mState.pickaxe === targetPickaxeId) {
      const actState = LifeActivityCore.getActivityState(state, 'mining');
      actState.tool = targetPickaxeId;
      actState.toolDurability = pick.durabilityMax;
      actState.maxDurability = pick.durabilityMax;
    }

    if (callbacks.log) callbacks.log(`✨ **${pick.name}** foi reforjada! Durabilidade restaurada (${pick.durabilityMax}/${pick.durabilityMax}).`, 'system');
    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return true;
  },

  selectTactic(state, tacticId, callbacks = {}) {
    const mState = this.getMiningState(state);
    const tactic = MINING_TACTICS[tacticId];
    if (!tactic || mState.isMining) return false;
    mState.selectedTactic = tactic.id;
    mState.activeTactic = tactic.id;
    if (callbacks.log) callbacks.log(`⛏️ Técnica de escavação selecionada: **${tactic.name}** (${tactic.desc}).`, 'system');
    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return true;
  },

  pickNodeForZone(zoneId, activeLampId, skillLevel = 1) {
    const zone = MINING_ZONES[zoneId] || MINING_ZONES.zone_abandoned_coal;
    const nodes = zone.availableNodes.map(id => MINERAL_NODES_CATALOG[id]).filter(node => node && skillLevel >= LifeActivityCore.getMinimumSkillForRarity(node.rarity));
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
    const activeZone = MINING_ZONES[mState.activeZone];
    if (!LifeActivityCore.isZoneAvailable(state, activeZone, mState.skillLevel)) return { success: false, reason: 'zone_locked' };
    if (mState.pendingOfflineMiningReward) {
      if (callbacks.log) callbacks.log('🎒 Resgate o resultado da extração offline antes de iniciar outro veio.', 'warning');
      return { success: false, reason: 'pending_rewards' };
    }
    if (mState.isMining) return { success: false, reason: 'already_mining' };
    const activePickaxeId = mState.pickaxe || 'pickaxe_none';
    const pickDef = PICKAXES_CATALOG[activePickaxeId];
    const dur = mState.pickaxeDurability[activePickaxeId] ?? 0;

    if (dur <= 0) {
      if (callbacks.log) callbacks.log(`⚠️ Sua ${pickDef?.name || 'Picareta'} perdeu a têmpera! Reforje-a antes de continuar escavando.`, 'warning');
      return { success: false, reason: 'broken_tool' };
    }

    // Validação de Vigor de Trabalho (Anti-Abuso Econômico)
    const vigor = LifeActivityCore.getVigorState(state);
    if (vigor.current < 5) {
      if (callbacks.log) callbacks.log(`⚡ **VIGOR INSUFICIENTE!** Você está exausto para minerar (Vigor: ${vigor.current}/100). Descanse para recuperar energia.`, 'warning');
      return { success: false, reason: 'insufficient_vigor' };
    }

    // Validação de Estabilidade da Galeria (Desabamento por autoclick / imperícia)
    if ((mState.galleryStability ?? 100) <= 0) {
      if (callbacks.log) callbacks.log('💥 **GALERIA DESABADA!** As vigas de sustentação ruíram! Escora a galeria antes de continuar escavando.', 'error');
      return { success: false, reason: 'gallery_collapsed' };
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
    const node = this.pickNodeForZone(mState.activeZone, mState.activeLamp, mState.skillLevel);

    let mineDuration = node.baseTime || zone.baseMineTime || 3300;
    mineDuration = Math.max(1200, Math.floor((mineDuration * (tactic.timeMult || 1.0)) / lampSpeedMult));

    mState.isMining = true;
    mState.pendingMineReward = null;
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

  finishMining(state, callbacks = {}, timingPct = null) {
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
      mState.pendingMineReward = null;
      return false;
    }

    const activePickaxeId = mState.pickaxe || 'pickaxe_none';
    const pickDef = PICKAXES_CATALOG[activePickaxeId];
    const tactic = MINING_TACTICS[mState.activeTactic] || MINING_TACTICS.standard;
    let stabilityLoss = tactic.stabilityLoss || 12;
    if (mState.veinHazard === 'seismic_fault') {
      stabilityLoss *= 2;
    }
    const gasPocketExplosion = mState.veinHazard === 'gas_pocket' && tactic.id === 'heavy';

    const pickBonus = pickDef?.qualityBonus || 0.0;
    const qualityMod = pickBonus + (tactic.qualityBonus || 0.0);

    const pending = mState.pendingMineReward?.nodeId === node.id ? mState.pendingMineReward : null;
    const quality = pending?.quality || RewardEngine.rollQuality(mState.skillLevel, qualityMod);
    const primaryMatRaw = node.yields.primary;
    const secMatRaw = node.yields.secondary;

    const primaryMat = resolveCanonicalResourceId(primaryMatRaw);
    const secMat = secMatRaw ? resolveCanonicalResourceId(secMatRaw) : null;

    let basePrimaryQty = node.yields.primaryQty || 1;
    let baseSecQty = node.yields.secondaryQty || 0;

    // Avaliação de Precisão do Sweet Spot (Anti-Autoclicker)
    const sweetSpot = LifeActivityCore.evaluateSweetSpot(timingPct);
    let extraDurabilityPenalty = 0;

    if (sweetSpot.result === 'miss') {
      extraDurabilityPenalty += 3; // severo dano na picareta
      stabilityLoss += 20; // severo abalo na sustentação da mina
      basePrimaryQty = Math.max(1, Math.floor(basePrimaryQty * sweetSpot.yieldMultiplier));
      baseSecQty = Math.floor(baseSecQty * sweetSpot.yieldMultiplier);
      if (callbacks.log) callbacks.log('⚠️ **GOLPE BRUTO DESALINHADO!** A picareta ricocheteou na rocha (-3 Durabilidade extra, -20% Estabilidade da Galeria)! Minérios pulverizados.', 'warning');
    } else if (sweetSpot.result === 'perfect') {
      basePrimaryQty = Math.round(basePrimaryQty * sweetSpot.yieldMultiplier);
      baseSecQty = Math.round(baseSecQty * sweetSpot.yieldMultiplier);
      stabilityLoss = Math.floor(stabilityLoss * 0.5); // impacto suave poupa as vigas
      if (callbacks.log) callbacks.log('💎 **GOLPE CIRÚRGICO NO SWEET SPOT!** Você cravou a fenda perfeita do minério (+200% Rendimento e XP)!', 'gain');
    }

    const stabilityAfter = Math.max(0, mState.galleryStability - stabilityLoss);

    if (mState.veinHazard === 'dense_crystal' && tactic.id === 'precision') {
      basePrimaryQty *= 2;
      baseSecQty *= 2;
      if (callbacks.log) callbacks.log('✨ Extração cirúrgica de Veio Cristalino bem-sucedida! Rendimento DOBRADO.', 'system');
    }

    if (stabilityAfter <= 15) {
      basePrimaryQty = Math.max(1, Math.floor(basePrimaryQty * 0.5));
      baseSecQty = Math.floor(baseSecQty * 0.5);
    }

    const primaryQty = pending?.primaryQty ?? RewardEngine.calculateYield(basePrimaryQty, quality);
    const secQty = pending?.secQty ?? (baseSecQty > 0 ? RewardEngine.calculateYield(baseSecQty, quality) : 0);
    const finalXp = pending?.finalXp ?? Math.round((node.xpReward || 8) * quality.mult * (sweetSpot.xpMultiplier || 1));
    const rewardDrops = [{ itemId: primaryMat, count: primaryQty }];
    if (secMat && secQty > 0) rewardDrops.push({ itemId: secMat, count: secQty });
    if (!hasRoomForStackRewards(state, rewardDrops)) {
      const alreadyNotified = Boolean(pending?.inventoryFullNotified);
      mState.pendingMineReward = { nodeId: node.id, quality, primaryQty, secQty, finalXp, inventoryFullNotified: true };
      if (!alreadyNotified) {
        if (callbacks.log) callbacks.log('⚠️ Mochila cheia! Libere espaço para concluir e receber esta extração.', 'warning');
        if (callbacks.updateAllUI) callbacks.updateAllUI();
        if (callbacks.save) callbacks.save();
      }
      return false;
    }

    // Consome Vigor de Trabalho (5 pontos por extração concluída)
    const vigorRes = LifeActivityCore.consumeVigor(state, 5);
    if (!vigorRes.success) {
      if (callbacks.log) callbacks.log(`⚡ **VIGOR ESGOTADO!** Você está sem vigor para concluir a extração (Vigor: ${vigorRes.current}/100). Descanse para recuperar energia.`, 'warning');
      return false;
    }

    if (mState.pickaxeDurability[activePickaxeId] !== undefined) {
      mState.pickaxeDurability[activePickaxeId] = Math.max(0, mState.pickaxeDurability[activePickaxeId] - 1 - extraDurabilityPenalty);
    }
    const actState = LifeActivityCore.getActivityState(state, 'mining');
    actState.toolDurability = mState.pickaxeDurability[activePickaxeId] ?? 0;

    if (gasPocketExplosion) {
      const maxHp = Number(state.maxHp) || Number(state.hp) || 1;
      state.hp = Math.max(1, (Number(state.hp) || maxHp) - Math.floor(maxHp * 0.10));
      mState.pickaxeDurability[activePickaxeId] = Math.max(0, mState.pickaxeDurability[activePickaxeId] - 2);
      actState.toolDurability = mState.pickaxeDurability[activePickaxeId];
      if (callbacks.log) callbacks.log('💥 EXPLOSÃO DE GÁS! Suas faíscas detonaram um bolsão de gás. -10% HP e dano extra na picareta!', 'error');
    }

    mState.galleryStability = stabilityAfter;
    const brokeOnThisExtraction = actState.toolDurability <= 0;
    if (mState.galleryStability <= 0) {
      mState.autoMining = false;
      if (callbacks.log) callbacks.log('💥 **COLAPSO TOTAL DA MINA!** As vigas cederam completamente (0% Estabilidade). Escora a galeria com madeira na cidade antes de minerar!', 'error');
    } else if (mState.galleryStability <= 15 && callbacks.log) {
      callbacks.log('⚠️ DESABAMENTO PARCIAL NA MINA! Pedras caem do teto, você perdeu 50% dos minérios do veio.', 'error');
    }

    addToInventory(state, primaryMat, primaryQty, node.rarity, false, callbacks, true);
    if (secMat && secQty > 0) {
      addToInventory(state, secMat, secQty, node.rarity, false, callbacks, true);
    }

    // Registro no Catálogo Mineral e Codex
    mState.miningLog[node.id] = (mState.miningLog[node.id] || 0) + 1;
    mState.totalMined = (mState.totalMined || 0) + 1;
    LifeActivityCore.recordCodexDiscovery(state, 'mining', node.id);

    // XP
    LifeActivityCore.addXp(state, 'mining', finalXp, callbacks);

    mState.isMining = false;
    mState.targetedNodeId = null;
    mState.pendingMineReward = null;
    mState.veinProbed = false;
    
    // Rola próximo hazard
    const hazards = ['none', 'none', 'none', 'gas_pocket', 'seismic_fault', 'dense_crystal'];
    mState.veinHazard = hazards[Math.floor(Math.random() * hazards.length)];
    if (brokeOnThisExtraction || mState.pickaxeDurability[activePickaxeId] <= 0) {
      mState.autoMining = false;
      if (callbacks.log) callbacks.log(`💥 **PICARETA PARTIDA!** Sua ${pickDef?.name || 'picareta'} quebrou a ponta após esta extração. Reforje-a para continuar.`, 'error');
    }

    if (callbacks.log) {
      const qualityPrefix = sweetSpot.result === 'perfect' ? '💎 **MINÉRIO IMACULADO NO SWEET SPOT!**'
        : quality.tier === 'perfect' ? '💎 **MINÉRIO IMACULADO!**'
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
    if (mState.pendingOfflineMiningReward && !mState.autoMining) {
      if (callbacks.log) callbacks.log('🎒 Resgate o resultado da mineração offline antes de retomar a atividade.', 'warning');
      return false;
    }
    if (mState.skillLevel < 5) {
      if (callbacks.log) callbacks.log('⚠️ A Mineração Automática (AFK) é desbloqueada no Nível 5 de Mineração!', 'warning');
      return false;
    }

    mState.autoMining = !mState.autoMining;
    mState.lastAutoTick = Date.now();

    if (callbacks.log) {
      callbacks.log(
        mState.autoMining
          ? '⛏️ **Mineração Automática (AFK) ATIVADA!** Consome 5 Vigor e lâmpadas enquanto extrai veios continuamente.'
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

    // 1. Validação de Vigor de Trabalho (5 pontos necessários)
    const vigor = LifeActivityCore.getVigorState(state);
    if (vigor.current < 5) {
      mState.autoMining = false;
      if (callbacks.log) callbacks.log('⚡ **Mineração AFK pausada:** Vigor de Trabalho esgotado! Descanse para recuperar energia.', 'warning');
      if (callbacks.updateAllUI) callbacks.updateAllUI();
      return;
    }

    // 2. Validação de Lâmpadas/Óleo (Consumíveis de Mineração)
    const totalLamps = Object.values(mState.lampInventory || {}).reduce((sum, c) => sum + (Number(c) || 0), 0);
    if (totalLamps <= 0) {
      mState.autoMining = false;
      if (callbacks.log) callbacks.log('⚠️ **Mineração AFK pausada:** O combustível dos lampiões acabou! Compre mais óleo na Associação de Mineração.', 'warning');
      if (callbacks.updateAllUI) callbacks.updateAllUI();
      return;
    }

    if (!mState.activeLamp || (mState.lampInventory[mState.activeLamp] || 0) <= 0) {
      const nextLamp = Object.keys(mState.lampInventory).find(k => (mState.lampInventory[k] || 0) > 0);
      if (nextLamp) mState.activeLamp = nextLamp;
    }

    // 3. Validação de Estabilidade da Galeria
    if ((mState.galleryStability ?? 100) <= 0) {
      mState.autoMining = false;
      if (callbacks.log) callbacks.log('⚠️ **Mineração AFK interrompida:** A galeria está colapsada (0% Estabilidade). Escora a mina para retomar.', 'error');
      if (callbacks.updateAllUI) callbacks.updateAllUI();
      return;
    }

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
    if (mState.pendingOfflineMiningReward) return this.claimOfflineMiningReward(state, callbacks);
    // Finish a vein whose result was already rolled before simulating a new offline batch.
    // Keep the pending roll authoritative so a full bag cannot reroll or discard it.
    if (mState.pendingMineReward) {
      if (!mState.isMining || !mState.targetedNodeId) {
        return { success: false, reason: 'pending_mine_state_incomplete', pendingReward: mState.pendingMineReward };
      }
      const pendingNodeId = mState.pendingMineReward.nodeId;
      mState.mineStartTime = Date.now() - (mState.mineDuration || 0);
      return this.finishMining(state, callbacks)
        ? { actualMines: 1, claimedPendingReward: true, nodeId: pendingNodeId }
        : { actualMines: 0, pendingReward: true, nodeId: pendingNodeId };
    }
    if (!mState.autoMining) return null;

    const activePickaxeId = mState.pickaxe || 'pickaxe_none';
    let availableDur = mState.pickaxeDurability[activePickaxeId] ?? 0;
    if (availableDur <= 0) {
      mState.autoMining = false;
      return null;
    }

    const clampedMinutes = Math.min(480, Math.max(0, minutesOffline));
    if (clampedMinutes < 2) return null;

    const zoneId = mState.activeZone || 'zone_abandoned_coal';
    const zone = MINING_ZONES[zoneId] || MINING_ZONES.zone_abandoned_coal;
    const activePickaxe = PICKAXES_CATALOG[activePickaxeId] || PICKAXES_CATALOG.pickaxe_none;
    const tactic = MINING_TACTICS[mState.selectedTactic] || MINING_TACTICS.standard;
    const offlineTimeBudget = clampedMinutes * 60 * 1000 * 0.25;
    let timeSpent = 0;
    let actualMines = 0;
    let durabilitySpent = 0;
    let totalXp = 0;
    const matsGained = {};
    const discoveries = {};
    let hazard = mState.veinHazard || 'none';

    // Simula 25% do tempo real, preservando as regras do veio ativo,
    // incluindo qualidade, gasto da lanterna, riscos e estabilidade da galeria.
    while (durabilitySpent < availableDur) {
      const lampId = mState.activeLamp;
      const lampStock = lampId ? (mState.lampInventory[lampId] || 0) : 0;
      if (lampId && lampStock <= 0) mState.activeLamp = null;
      const usableLampId = lampStock > 0 ? lampId : null;
      const lamp = usableLampId ? LAMPS_CATALOG[usableLampId] : null;
      const node = this.pickNodeForZone(zoneId, usableLampId, mState.skillLevel);
      const duration = Math.max(1200, Math.floor(
        ((node.baseTime || zone.baseMineTime || 3300) * (tactic.timeMult || 1)) / (lamp?.speedBoost || 1)
      ));
      if (timeSpent + duration > offlineTimeBudget) break;

      if (usableLampId) mState.lampInventory[usableLampId] = Math.max(0, lampStock - 1);
      timeSpent += duration;
      actualMines++;
      discoveries[node.id] = (discoveries[node.id] || 0) + 1;

      const stabilityLoss = (tactic.stabilityLoss || 12) * (hazard === 'seismic_fault' ? 2 : 1);
      const stabilityAfter = Math.max(0, (Number(mState.galleryStability) || 0) - stabilityLoss);
      const gasExplosion = hazard === 'gas_pocket' && tactic.id === 'heavy';
      const quality = RewardEngine.rollQuality(mState.skillLevel, (activePickaxe.qualityBonus || 0) + (tactic.qualityBonus || 0));
      totalXp += Math.round((node.xpReward || 8) * quality.mult);
      const primaryMat = resolveCanonicalResourceId(node.yields.primary);
      let basePrimaryQty = node.yields.primaryQty || 1;
      let baseSecondaryQty = node.yields.secondaryQty || 0;
      if (hazard === 'dense_crystal' && tactic.id === 'precision') {
        basePrimaryQty *= 2;
        baseSecondaryQty *= 2;
      }
      if (stabilityAfter <= 15) {
        basePrimaryQty = Math.max(1, Math.floor(basePrimaryQty * 0.5));
        baseSecondaryQty = Math.floor(baseSecondaryQty * 0.5);
      }
      const primaryQty = RewardEngine.calculateYield(basePrimaryQty, quality);
      matsGained[primaryMat] = (matsGained[primaryMat] || 0) + primaryQty;

      if (node.yields.secondary && baseSecondaryQty > 0) {
        const secondaryMat = resolveCanonicalResourceId(node.yields.secondary);
        const secondaryQty = RewardEngine.calculateYield(baseSecondaryQty, quality);
        matsGained[secondaryMat] = (matsGained[secondaryMat] || 0) + secondaryQty;
      }

      if (gasExplosion) {
        const maxHp = Number(state.maxHp) || Number(state.hp) || 1;
        state.hp = Math.max(1, (Number(state.hp) || maxHp) - Math.floor(maxHp * 0.10));
      }
      mState.galleryStability = stabilityAfter;
      durabilitySpent += 1 + (gasExplosion ? 2 : 0);
      const hazards = ['none', 'none', 'none', 'gas_pocket', 'seismic_fault', 'dense_crystal'];
      hazard = hazards[Math.floor(Math.random() * hazards.length)];
    }

    if (actualMines <= 0) return null;

    // O pagamento offline substitui apenas um veio sem resultado pendente; o resultado
    // já concluído acima sempre é resolvido antes de uma nova simulação.
    mState.isMining = false;
    mState.targetedNodeId = null;
    mState.mineStartTime = 0;

    mState.pickaxeDurability[activePickaxeId] = Math.max(0, availableDur - durabilitySpent);
    const actState = LifeActivityCore.getActivityState(state, 'mining');
    actState.toolDurability = mState.pickaxeDurability[activePickaxeId];
    mState.veinHazard = hazard;
    mState.veinProbed = false;

    mState.pendingOfflineMiningReward = {
      actualMines, matsGained, totalXp, discoveries,
      pickaxeId: activePickaxeId, resumeAutoMining: true,
      inventoryFullNotified: false
    };
    mState.autoMining = false;
    mState.lastAutoTick = Date.now();
    if (callbacks.log) callbacks.log(`💤 A extração offline preservou ${actualMines} veio(s) para resgate.`, 'system');
    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return this.claimOfflineMiningReward(state, callbacks);
  },

  claimOfflineMiningReward(state, callbacks = {}) {
    const mState = this.getMiningState(state);
    const pending = mState.pendingOfflineMiningReward;
    if (!pending) return { success: false, reason: 'no_pending_rewards' };

    const rewards = Object.entries(pending.matsGained || {}).map(([itemId, count]) => ({ itemId, count }));
    const inventoryPreview = {
      ...state,
      inventory: (state.inventory || []).map(item => ({ ...item }))
    };
    const inventoryFits = rewards.every(reward =>
      addToInventory(inventoryPreview, reward.itemId, reward.count, 'common', false, {}, true)
    );
    if (!inventoryFits) {
      if (!pending.inventoryFullNotified && callbacks.log) {
        callbacks.log('🎒 Mochila cheia: libere espaço para resgatar os minérios da extração offline.', 'warning');
      }
      pending.inventoryFullNotified = true;
      if (callbacks.updateAllUI) callbacks.updateAllUI();
      if (callbacks.save) callbacks.save();
      return { success: false, reason: 'inventory_full', pendingRewards: pending };
    }

    state.inventory = inventoryPreview.inventory;

    for (const [nodeId, count] of Object.entries(pending.discoveries || {})) {
      mState.miningLog[nodeId] = (mState.miningLog[nodeId] || 0) + count;
      LifeActivityCore.recordCodexDiscovery(state, 'mining', nodeId);
    }
    mState.totalMined = (mState.totalMined || 0) + (pending.actualMines || 0);
    LifeActivityCore.addXp(state, 'mining', pending.totalXp || 0, callbacks);
    mState.pendingOfflineMiningReward = null;
    const remainingDurability = Number(mState.pickaxeDurability[pending.pickaxeId]) || 0;
    mState.autoMining = Boolean(pending.resumeAutoMining && mState.pickaxe === pending.pickaxeId && remainingDurability > 0);
    mState.lastAutoTick = Date.now();

    if (callbacks.log) {
      callbacks.log(`💤 **Relatório de Mineração Offline:** Extraiu ${pending.actualMines} veios minerais em Aden! (+${pending.totalXp} XP de Mineração)`, 'rarity-legendary');
    }

    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();

    return { success: true, actualMines: pending.actualMines, matsGained: pending.matsGained, totalXp: pending.totalXp };
  },

  startHarvest(state, tacticId = null, callbacks = {}) {
    return this.startMining(state, tacticId, callbacks);
  },

  finishHarvest(state, callbacks = {}) {
    return this.finishMining(state, callbacks);
  },

  exchangeOres(state, oreId, qty = 1, callbacks = {}) {
    return false;
  }
};
