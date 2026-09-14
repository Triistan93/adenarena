// FishingService.js — Motor Central de Pesca de Aden (Lineage II Style)
import { FISHING_ZONES, FISH_CATALOG, RODS_CATALOG, BAIT_CATALOG, getFishingXpForLevel } from '../data/fishing.js';
import { FISHING_BALANCE, calculateCatchChance, rollFishRarity, calculateFishValue } from '../data/economy/fishingBalance.js';
import { addToInventory, removeFromInventoryByItemId, getInventoryCount } from './InventoryService.js';

export const FishingService = {
  getFishingState(state) {
    if (!state.fishing) {
      state.fishing = {
        skillLevel: 1,
        skillXp: 0,
        rod: 'rod_none',
        activeBait: null,
        activeZone: 'zone_talking_island',
        isFishing: false,
        castStartTime: 0,
        totalCaught: 0,
        fishLog: {},
        autoFishing: false,
        lastAutoTick: 0,
        rodDurability: {
          rod_none: 50
        },
        baitInventory: {}
      };
    }
    // Garante que o jogador sempre possua ao menos a vara de bambu básica
    if (!state.fishing.rod) {
      state.fishing.rod = 'rod_none';
    }
    if (!state.fishing.rodDurability) {
      state.fishing.rodDurability = {};
    }
    if (state.fishing.rodDurability['rod_none'] === undefined) {
      state.fishing.rodDurability['rod_none'] = 50;
    }
    if (!state.fishing.baitInventory) {
      state.fishing.baitInventory = {};
    }
    if (!state.fishing.fishLog) {
      state.fishing.fishLog = {};
    }
    return state.fishing;
  },

  getAvailableZones(state) {
    const playerLvl = Number(state?.level) || 1;
    return Object.values(FISHING_ZONES).filter(zone => playerLvl >= zone.minLevel);
  },

  selectZone(state, zoneId, callbacks = {}) {
    const fState = this.getFishingState(state);
    const zone = FISHING_ZONES[zoneId];
    if (!zone) return false;

    const playerLvl = Number(state?.level) || 1;
    if (playerLvl < zone.minLevel) {
      if (callbacks.log) callbacks.log(`⚠️ Nível insuficiente para navegar até ${zone.name}! Requer Nível ${zone.minLevel}.`, 'warning');
      return false;
    }

    fState.activeZone = zoneId;
    fState.isFishing = false;

    if (callbacks.log) callbacks.log(`📍 Você se deslocou para **${zone.name}** com suas tralhas de pesca.`, 'system');
    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return true;
  },

  selectBait(state, baitId, callbacks = {}) {
    const fState = this.getFishingState(state);
    if (!baitId) {
      fState.activeBait = null;
      if (callbacks.updateAllUI) callbacks.updateAllUI();
      return true;
    }

    const available = fState.baitInventory[baitId] || 0;
    if (available <= 0) {
      if (callbacks.log) callbacks.log(`⚠️ Você não possui esta isca em seu estoque de pescador.`, 'warning');
      return false;
    }

    fState.activeBait = baitId;
    const bait = BAIT_CATALOG[baitId];
    if (callbacks.log) callbacks.log(`🪱 Anzol iscado com **${bait ? bait.name : baitId}** (${available} restantes).`, 'system');
    if (callbacks.updateAllUI) callbacks.updateAllUI();
    return true;
  },

  buyBait(state, baitId, quantity = 10, callbacks = {}) {
    const bait = BAIT_CATALOG[baitId];
    if (!bait) return false;

    const count = Math.max(1, Math.floor(quantity));
    const totalCost = bait.buyPrice * count;

    if ((state.gold || 0) < totalCost) {
      if (callbacks.log) callbacks.log(`⚠️ Adena insuficiente! Custo para ${count}x ${bait.name}: ${totalCost.toLocaleString()} Adena.`, 'warning');
      return false;
    }

    state.gold -= totalCost;
    const fState = this.getFishingState(state);
    fState.baitInventory[baitId] = (fState.baitInventory[baitId] || 0) + count;

    // Se nenhuma isca estiver ativa, ativa esta automaticamente
    if (!fState.activeBait) {
      fState.activeBait = baitId;
    }

    if (callbacks.log) callbacks.log(`🛒 Comprou **${count}x ${bait.name}** por ${totalCost.toLocaleString()} Adena.`, 'gain');
    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return true;
  },

  buyRod(state, rodId, callbacks = {}) {
    const rod = RODS_CATALOG[rodId];
    if (!rod) return false;

    const fState = this.getFishingState(state);
    if (fState.rodDurability[rodId] !== undefined) {
      if (callbacks.log) callbacks.log(`⚠️ Você já possui a ${rod.name}!`, 'warning');
      return false;
    }

    if (fState.skillLevel < rod.minFishingLevel) {
      if (callbacks.log) callbacks.log(`⚠️ Habilidade de pesca insuficiente! Requer Pesca Nível ${rod.minFishingLevel}.`, 'warning');
      return false;
    }

    if ((state.gold || 0) < rod.buyPrice) {
      if (callbacks.log) callbacks.log(`⚠️ Adena insuficiente para adquirir ${rod.name} (${rod.buyPrice.toLocaleString()} Adena).`, 'warning');
      return false;
    }

    state.gold -= rod.buyPrice;
    fState.rodDurability[rodId] = rod.durability;
    fState.rod = rodId;

    if (callbacks.log) callbacks.log(`🎣 Adquiriu e equipou **${rod.name}**!`, 'rarity-epic');
    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return true;
  },

  equipRod(state, rodId, callbacks = {}) {
    const fState = this.getFishingState(state);
    if (fState.rodDurability[rodId] === undefined) {
      if (callbacks.log) callbacks.log(`⚠️ Você não possui esta vara de pescar em seu inventário.`, 'warning');
      return false;
    }

    fState.rod = rodId;
    const rod = RODS_CATALOG[rodId];
    if (callbacks.log) callbacks.log(`🎣 Equipou **${rod ? rod.name : rodId}**.`, 'system');
    if (callbacks.updateAllUI) callbacks.updateAllUI();
    return true;
  },

  repairRod(state, rodId, callbacks = {}) {
    const fState = this.getFishingState(state);
    const rod = RODS_CATALOG[rodId];
    if (!rod || fState.rodDurability[rodId] === undefined) return false;

    const currentDura = fState.rodDurability[rodId] || 0;
    const missing = rod.durability - currentDura;
    if (missing <= 0) {
      if (callbacks.log) callbacks.log(`✨ A ${rod.name} já está com a durabilidade máxima intacta!`, 'system');
      return false;
    }

    const costPerPoint = Math.max(1, Math.ceil(rod.repairCost / rod.durability));
    const totalRepairCost = missing * costPerPoint;

    if ((state.gold || 0) < totalRepairCost) {
      if (callbacks.log) callbacks.log(`⚠️ Adena insuficiente para restaurar a vara! Custo: ${totalRepairCost.toLocaleString()} Adena.`, 'warning');
      return false;
    }

    state.gold -= totalRepairCost;
    fState.rodDurability[rodId] = rod.durability;

    if (callbacks.log) callbacks.log(`🔨 Ferreiro restaurou a **${rod.name}** (+${missing} durabilidade) por ${totalRepairCost.toLocaleString()} Adena.`, 'gain');
    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return true;
  },

  castLine(state, callbacks = {}) {
    const fState = this.getFishingState(state);

    if (fState.isFishing) {
      return { success: false, reason: 'already_fishing' };
    }

    const zoneId = fState.activeZone || 'zone_talking_island';
    const zone = FISHING_ZONES[zoneId];
    if (!zone) {
      if (callbacks.log) callbacks.log(`⚠️ Selecione uma zona de pesca primeiro.`, 'warning');
      return { success: false, reason: 'no_zone' };
    }

    // Checa isca necessária
    if (zone.requiredBait) {
      const baitCount = fState.baitInventory[zone.requiredBait] || 0;
      if (fState.activeBait !== zone.requiredBait || baitCount <= 0) {
        const requiredBaitDef = BAIT_CATALOG[zone.requiredBait];
        if (callbacks.log) callbacks.log(`⚠️ As águas de ${zone.name} exigem **${requiredBaitDef ? requiredBaitDef.name : zone.requiredBait}**!`, 'warning');
        return { success: false, reason: 'invalid_bait' };
      }
    }

    // Se tem isca ativa equipada, valida contagem
    if (!fState.activeBait || (fState.baitInventory[fState.activeBait] || 0) <= 0) {
      // Procura qualquer isca disponível no inventário
      const availableBaitKey = Object.keys(fState.baitInventory).find(bKey => (fState.baitInventory[bKey] || 0) > 0);
      if (availableBaitKey) {
        fState.activeBait = availableBaitKey;
      } else {
        if (callbacks.log) callbacks.log(`⚠️ Sem iscas no anzol! Compre mais iscas para continuar pescando.`, 'warning');
        return { success: false, reason: 'no_bait' };
      }
    }

    // Consome 1 isca
    fState.baitInventory[fState.activeBait]--;

    // Consome durabilidade da vara se equipada
    const currentRodKey = fState.rod || 'rod_none';
    const currentDurability = fState.rodDurability[currentRodKey] || 0;
    if (currentDurability > 0) {
      fState.rodDurability[currentRodKey]--;
    } else {
      if (callbacks.log) callbacks.log(`⚠️ Sua vara está desgastada/quebrada! Penalidade de captura aplicada.`, 'warning');
    }

    fState.isFishing = true;
    fState.castStartTime = Date.now();

    const castDuration = zone.baseCatchTime || FISHING_BALANCE.MANUAL_CAST_TIME_MS;

    if (callbacks.log) callbacks.log(`🌊 Linha lançada em **${zone.name}**... Aguarde a boia afundar!`, 'system');
    if (callbacks.updateAllUI) callbacks.updateAllUI();

    return { success: true, castTime: castDuration };
  },

  reelIn(state, timingAccuracy = 0.8, callbacks = {}) {
    const fState = this.getFishingState(state);
    if (!fState.isFishing) {
      return { caught: false, reason: 'not_fishing' };
    }

    fState.isFishing = false;
    const zoneId = fState.activeZone || 'zone_talking_island';
    const zone = FISHING_ZONES[zoneId] || FISHING_ZONES.zone_talking_island;
    const rod = RODS_CATALOG[fState.rod] || RODS_CATALOG.rod_none;
    const bait = BAIT_CATALOG[fState.activeBait] || null;

    const isBrokenRod = (fState.rodDurability[fState.rod] || 0) <= 0;
    const rodBonus = (rod.catchBonus - 1.0) * (isBrokenRod ? FISHING_BALANCE.BROKEN_ROD_CATCH_PENALTY : 1.0);
    const baitBonus = bait ? (bait.catchBonus - 1.0) : 0;
    const zoneDiffMod = -(zone.difficulty - 1) * 0.05;

    const catchProbability = calculateCatchChance(fState.skillLevel, rodBonus, baitBonus, zoneDiffMod);
    const roll = Math.random();

    // Falha na captura
    if (roll > catchProbability) {
      if (callbacks.log) callbacks.log(`💨 O peixe deu um puxão brusco e escapou do anzol! Tente novamente.`, 'warning');
      if (callbacks.updateAllUI) callbacks.updateAllUI();
      if (callbacks.save) callbacks.save();
      return { caught: false, reason: 'escaped' };
    }

    // Sucesso na captura: Rola a raridade
    const baitRarityBoost = bait ? bait.rarityBoost : 0;
    const rolledRarity = rollFishRarity(fState.skillLevel, baitRarityBoost, false);

    // Filtra peixes da zona com essa raridade (fallback para qualquer peixe da zona se não houver match)
    let candidateFishIds = zone.availableFish.filter(fId => {
      const def = FISH_CATALOG[fId];
      return def && def.rarity === rolledRarity;
    });

    if (candidateFishIds.length === 0) {
      candidateFishIds = zone.availableFish;
    }

    const chosenFishId = candidateFishIds[Math.floor(Math.random() * candidateFishIds.length)];
    const fishDef = FISH_CATALOG[chosenFishId] || FISH_CATALOG.fish_carp;

    // Calcula peso realista
    const weightMin = fishDef.baseWeight?.min || 0.5;
    const weightMax = fishDef.baseWeight?.max || 2.0;
    const rolledWeight = Number((weightMin + Math.random() * (weightMax - weightMin)).toFixed(2));

    // XP de pesca com bônus de timing perfeito
    const isPerfect = timingAccuracy >= 0.90;
    const xpMult = isPerfect ? FISHING_BALANCE.PERFECT_CATCH_BONUS : 1.0;
    const xpEarned = Math.floor(fishDef.xpReward * xpMult);

    fState.skillXp += xpEarned;
    fState.totalCaught = (fState.totalCaught || 0) + 1;
    fState.fishLog[chosenFishId] = (fState.fishLog[chosenFishId] || 0) + 1;

    // Adiciona o peixe ao inventário canônico de Aden
    addToInventory(state, chosenFishId, 1, fishDef.rarity, false, callbacks, true);

    const leveledUp = this._checkLevelUp(state, fState, callbacks);

    const rarityClass = fishDef.rarity === 'legendary' ? 'rarity-legendary'
      : fishDef.rarity === 'epic' ? 'rarity-epic'
      : fishDef.rarity === 'rare' ? 'rarity-rare'
      : 'loot';

    if (callbacks.log) {
      const perfectTag = isPerfect ? ' 🎯 [FISGADA PERFEITA!]' : '';
      callbacks.log(`🎣 Pescou **${fishDef.name}** (${rolledWeight}kg)${perfectTag}! (+${xpEarned} XP de Pesca).`, rarityClass);
    }
    if (callbacks.floatText) {
      callbacks.floatText(`+1 ${fishDef.icon} ${fishDef.name}!`, isPerfect ? 'float-crit' : 'float-gold');
    }

    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();

    return {
      caught: true,
      fish: fishDef,
      weight: rolledWeight,
      xpGained: xpEarned,
      leveledUp
    };
  },

  toggleAutoFish(state, callbacks = {}) {
    const fState = this.getFishingState(state);

    if (fState.skillLevel < FISHING_BALANCE.AUTO_FISH_UNLOCK_LEVEL) {
      if (callbacks.log) callbacks.log(`🔒 Pesca Automática requer Nível de Pesca ${FISHING_BALANCE.AUTO_FISH_UNLOCK_LEVEL}+! Continue pescando manualmente para aprimorar sua técnica.`, 'warning');
      return false;
    }

    fState.autoFishing = !fState.autoFishing;
    fState.lastAutoTick = Date.now();

    if (fState.autoFishing) {
      if (callbacks.log) callbacks.log(`🤖 **Pesca Automática Ativada!** Seu personagem pescará em segundo plano enquanto houver iscas e durabilidade.`, 'gain');
      if (callbacks.floatText) callbacks.floatText(`🎣 Pesca AFK Ativada!`, 'float-gold');
    } else {
      if (callbacks.log) callbacks.log(`🛑 Pesca Automática pausada.`, 'system');
    }

    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return true;
  },

  processAutoFish(state, callbacks = {}) {
    const fState = this.getFishingState(state);
    if (!fState.autoFishing) return;

    const now = Date.now();
    const interval = FISHING_BALANCE.AUTO_FISH_INTERVAL_MS;
    const elapsed = now - (fState.lastAutoTick || now);

    if (elapsed < interval) return;

    const ticks = Math.min(10, Math.floor(elapsed / interval));
    fState.lastAutoTick = now;

    const zoneId = fState.activeZone || 'zone_talking_island';
    const zone = FISHING_ZONES[zoneId] || FISHING_ZONES.zone_talking_island;
    const rod = RODS_CATALOG[fState.rod] || RODS_CATALOG.rod_none;

    for (let t = 0; t < ticks; t++) {
      // Checa se ainda há isca disponível
      if (!fState.activeBait || (fState.baitInventory[fState.activeBait] || 0) <= 0) {
        const nextBait = Object.keys(fState.baitInventory).find(b => (fState.baitInventory[b] || 0) > 0);
        if (nextBait) {
          fState.activeBait = nextBait;
        } else {
          fState.autoFishing = false;
          if (callbacks.log) callbacks.log(`⚠️ Suas iscas acabaram! A Pesca Automática foi interrompida.`, 'warning');
          break;
        }
      }

      // Consome 1 isca
      fState.baitInventory[fState.activeBait]--;

      // Consome 1 durabilidade da vara
      const currentRodKey = fState.rod || 'rod_none';
      if ((fState.rodDurability[currentRodKey] || 0) > 0) {
        fState.rodDurability[currentRodKey]--;
      }

      const bait = BAIT_CATALOG[fState.activeBait] || null;
      const isBrokenRod = (fState.rodDurability[currentRodKey] || 0) <= 0;
      const rodBonus = (rod.catchBonus - 1.0) * (isBrokenRod ? FISHING_BALANCE.BROKEN_ROD_CATCH_PENALTY : 1.0);
      const baitBonus = bait ? (bait.catchBonus - 1.0) : 0;
      const zoneDiffMod = -(zone.difficulty - 1) * 0.05;

      const catchProb = calculateCatchChance(fState.skillLevel, rodBonus, baitBonus, zoneDiffMod) * FISHING_BALANCE.AUTO_FISH_EFFICIENCY;

      if (Math.random() <= catchProb) {
        const rarity = rollFishRarity(fState.skillLevel, bait ? bait.rarityBoost : 0, true);
        let candidates = zone.availableFish.filter(id => FISH_CATALOG[id]?.rarity === rarity);
        if (candidates.length === 0) candidates = zone.availableFish;

        const fishId = candidates[Math.floor(Math.random() * candidates.length)];
        const fish = FISH_CATALOG[fishId] || FISH_CATALOG.fish_carp;

        fState.totalCaught = (fState.totalCaught || 0) + 1;
        fState.fishLog[fishId] = (fState.fishLog[fishId] || 0) + 1;
        fState.skillXp += fish.xpReward;

        addToInventory(state, fishId, 1, fish.rarity, false, callbacks, true);
      }
    }

    this._checkLevelUp(state, fState, callbacks);
  },

  processOfflineFish(state, minutesOffline, callbacks = {}) {
    const fState = this.getFishingState(state);
    if (!fState.autoFishing) return { totalCaught: 0, xpGained: 0 };

    const effectiveMinutes = Math.min(minutesOffline, FISHING_BALANCE.OFFLINE_MAX_MINUTES);
    if (effectiveMinutes <= 0) return { totalCaught: 0, xpGained: 0 };

    const zoneId = fState.activeZone || 'zone_talking_island';
    const zone = FISHING_ZONES[zoneId] || FISHING_ZONES.zone_talking_island;
    const rod = RODS_CATALOG[fState.rod] || RODS_CATALOG.rod_none;

    const totalAvailableBait = Object.values(fState.baitInventory).reduce((sum, count) => sum + (count || 0), 0);
    if (totalAvailableBait <= 0) {
      fState.autoFishing = false;
      return { totalCaught: 0, xpGained: 0 };
    }

    // Calcula quantos arremessos foram possíveis
    const rodBonus = rod.catchBonus - 1.0;
    const maxCatchesByTime = Math.floor((effectiveMinutes * 60 * 1000) / FISHING_BALANCE.OFFLINE_FISH_INTERVAL_MS * FISHING_BALANCE.OFFLINE_EFFICIENCY);
    const castsToSimulate = Math.min(totalAvailableBait, maxCatchesByTime);

    let caughtCount = 0;
    let totalXp = 0;

    for (let c = 0; c < castsToSimulate; c++) {
      // Consome isca sequencialmente
      const baitKey = Object.keys(fState.baitInventory).find(k => (fState.baitInventory[k] || 0) > 0);
      if (!baitKey) break;
      fState.baitInventory[baitKey]--;

      // Consome durabilidade
      const currentRodKey = fState.rod || 'rod_none';
      if ((fState.rodDurability[currentRodKey] || 0) > 0) {
        fState.rodDurability[currentRodKey]--;
      }

      const bait = BAIT_CATALOG[baitKey];
      const isBrokenRod = (fState.rodDurability[currentRodKey] || 0) <= 0;
      const effRodBonus = rodBonus * (isBrokenRod ? FISHING_BALANCE.BROKEN_ROD_CATCH_PENALTY : 1.0);
      const baitBonus = bait ? (bait.catchBonus - 1.0) : 0;
      const zoneDiffMod = -(zone.difficulty - 1) * 0.05;

      const prob = calculateCatchChance(fState.skillLevel, effRodBonus, baitBonus, zoneDiffMod) * FISHING_BALANCE.OFFLINE_EFFICIENCY;

      if (Math.random() <= prob) {
        const rarity = rollFishRarity(fState.skillLevel, bait ? bait.rarityBoost : 0, true);
        let candidates = zone.availableFish.filter(id => FISH_CATALOG[id]?.rarity === rarity);
        if (candidates.length === 0) candidates = zone.availableFish;

        const fishId = candidates[Math.floor(Math.random() * candidates.length)];
        const fish = FISH_CATALOG[fishId] || FISH_CATALOG.fish_carp;

        fState.totalCaught = (fState.totalCaught || 0) + 1;
        fState.fishLog[fishId] = (fState.fishLog[fishId] || 0) + 1;
        fState.skillXp += fish.xpReward;
        totalXp += fish.xpReward;
        caughtCount++;

        addToInventory(state, fishId, 1, fish.rarity, false, callbacks, true);
      }
    }

    this._checkLevelUp(state, fState, callbacks);
    fState.lastAutoTick = Date.now();

    return {
      totalCaught: caughtCount,
      xpGained: totalXp
    };
  },

  exchangeFish(state, fishId, quantity = 5, callbacks = {}) {
    const fish = FISH_CATALOG[fishId];
    if (!fish) return { success: false, reason: 'invalid_fish' };

    const ownedCount = getInventoryCount(state, fishId);
    const reqRate = fish.exchangeRate || 5;

    if (ownedCount < reqRate) {
      if (callbacks.log) callbacks.log(`⚠️ Quantidade insuficiente de ${fish.name}! Requer no mínimo ${reqRate}x peixes para realizar a troca com o Mestre de Pesca.`, 'warning');
      return { success: false, reason: 'insufficient_fish' };
    }

    const countToExchange = Math.min(ownedCount, Math.max(reqRate, Math.floor(quantity / reqRate) * reqRate));
    const packages = Math.floor(countToExchange / reqRate);

    if (packages <= 0) return { success: false };

    // Remove os peixes do inventário
    removeFromInventoryByItemId(state, fishId, countToExchange);

    // Adiciona o material de recompensa
    const rewardMatId = fish.materialReward;
    addToInventory(state, rewardMatId, packages, 'common', false, callbacks, true);

    if (callbacks.log) {
      callbacks.log(`📦 Entregou **${countToExchange}x ${fish.name}** e recebeu **${packages}x ${fish.materialName}** para sua Forja!`, 'rarity-legendary');
    }
    if (callbacks.floatText) {
      callbacks.floatText(`+${packages}x ${fish.materialName}!`, 'float-gold');
    }

    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();

    return { success: true, count: packages, materialName: fish.materialName };
  },

  getSkillProgress(state) {
    const fState = this.getFishingState(state);
    const nextXp = getFishingXpForLevel(fState.skillLevel + 1);
    const currXp = fState.skillXp || 0;
    const percent = nextXp > 0 ? Math.min(100, Math.floor((currXp / nextXp) * 100)) : 100;
    return {
      level: fState.skillLevel,
      xp: currXp,
      nextXp,
      percent
    };
  },

  getFishingStats(state) {
    const fState = this.getFishingState(state);
    const speciesDiscovered = Object.keys(fState.fishLog || {}).length;
    const totalSpecies = Object.keys(FISH_CATALOG).length;
    return {
      totalCaught: fState.totalCaught || 0,
      speciesDiscovered,
      totalSpecies
    };
  },

  _checkLevelUp(state, fState, callbacks = {}) {
    let leveledUp = false;
    let nextXp = getFishingXpForLevel(fState.skillLevel + 1);

    while (fState.skillLevel < FISHING_BALANCE.MAX_FISHING_LEVEL && fState.skillXp >= nextXp) {
      fState.skillLevel++;
      leveledUp = true;

      if (callbacks.log) {
        callbacks.log(`🎉 **NÍVEL DE PESCA AUMENTOU!** Você alcançou o Nível **${fState.skillLevel}** em Pesca de Aden!`, 'rarity-legendary');
      }
      if (callbacks.floatText) {
        callbacks.floatText(`Pesca Nv. ${fState.skillLevel}!`, 'float-crit');
      }

      nextXp = getFishingXpForLevel(fState.skillLevel + 1);
    }

    return leveledUp;
  }
};
