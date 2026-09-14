// HuntingService.js — Motor Central da Profissão de Caça Silvestre & Curtume de Aden
import {
  HUNTING_ZONES,
  PREY_CATALOG,
  KNIVES_CATALOG,
  LURES_CATALOG,
  APPROACH_TACTICS,
  WIND_DIRECTIONS,
  getHuntingXpForLevel
} from '../data/hunting.js';
import { addToInventory } from './InventoryService.js';
import { LifeActivityCore } from './lifeActivities/LifeActivityCore.js';
import { RewardEngine } from './lifeActivities/RewardEngine.js';
import { resolveCanonicalResourceId } from './lifeActivities/ResourceDictionary.js';

export const HuntingService = {
  getHuntingState(state) {
    if (state) {
      LifeActivityCore.getActivityState(state, 'hunting');
    }
    if (!state.hunting || typeof state.hunting !== 'object') {
      state.hunting = {
        skillLevel: 1,
        skillXp: 0,
        knife: 'knife_none',
        selectedTactic: 'ambush',
        activeLure: null,
        activeZone: 'zone_talking_forest',
        isHunting: false,
        trackStartTime: 0,
        trackedPreyId: null,
        alertLevel: 0,
        windDirection: 'crosswind',
        awaitingButchering: false,
        slainPreyData: null,
        totalHunted: 0,
        huntingLog: {},
        autoHunting: false,
        lastAutoTick: 0,
        knifeDurability: {
          knife_none: 50
        },
        lureInventory: {}
      };
    }

    if (!state.hunting.knife) {
      state.hunting.knife = 'knife_none';
    }
    if (!state.hunting.selectedTactic) {
      state.hunting.selectedTactic = 'ambush';
    }
    if (!state.hunting.knifeDurability) {
      state.hunting.knifeDurability = {};
    }
    if (state.hunting.knifeDurability.knife_none === undefined) {
      state.hunting.knifeDurability.knife_none = 50;
    }
    if (!state.hunting.lureInventory) {
      state.hunting.lureInventory = {};
    }
    if (!state.hunting.huntingLog) {
      state.hunting.huntingLog = {};
    }
    if (!state.hunting.activeZone) {
      state.hunting.activeZone = 'zone_talking_forest';
    }

    return state.hunting;
  },

  selectTactic(state, tacticId, callbacks = {}) {
    const hState = this.getHuntingState(state);
    const tactic = APPROACH_TACTICS[tacticId] || APPROACH_TACTICS.ambush;
    hState.selectedTactic = tactic.id;
    hState.activeTactic = tactic.id;
    if (callbacks.log) callbacks.log(`🎯 Tática de aproximação selecionada: **${tactic.name}** (${tactic.desc}).`, 'system');
    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return true;
  },

  getAvailableZones(state) {
    const playerLvl = Number(state?.level) || 1;
    return Object.values(HUNTING_ZONES).filter(zone => playerLvl >= zone.minLevel);
  },

  selectZone(state, zoneId, callbacks = {}) {
    const hState = this.getHuntingState(state);
    const zone = HUNTING_ZONES[zoneId];
    if (!zone) return false;

    const playerLvl = Number(state?.level) || 1;
    if (playerLvl < zone.minLevel) {
      if (callbacks.log) callbacks.log(`⚠️ Nível insuficiente para adentrar em ${zone.name}! Requer Nível ${zone.minLevel}.`, 'warning');
      return false;
    }

    hState.activeZone = zoneId;
    hState.isHunting = false;
    hState.trackedPreyId = null;

    if (callbacks.log) callbacks.log(`📍 Você armou seu acampamento de caça em **${zone.name}**.`, 'system');
    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return true;
  },

  selectLure(state, lureId, callbacks = {}) {
    const hState = this.getHuntingState(state);
    if (!lureId) {
      hState.activeLure = null;
      if (callbacks.updateAllUI) callbacks.updateAllUI();
      return true;
    }

    const available = hState.lureInventory[lureId] || 0;
    if (available <= 0) {
      if (callbacks.log) callbacks.log('⚠️ Você não possui esta isca/atrativo em estoque!', 'warning');
      return false;
    }

    hState.activeLure = lureId;
    const lureDef = LURES_CATALOG[lureId];
    if (callbacks.log) callbacks.log(`🥩 Atrativo selecionado: **${lureDef?.name || lureId}**.`, 'system');

    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return true;
  },

  buyLure(state, lureId, qty = 1, callbacks = {}) {
    const lure = LURES_CATALOG[lureId];
    if (!lure) return false;

    const count = Math.max(1, Math.floor(qty));
    const totalCost = lure.buyPrice * count;

    if ((state.gold || 0) < totalCost) {
      if (callbacks.log) callbacks.log(`⚠️ Ouro insuficiente! Requer ${totalCost.toLocaleString()} Adena para comprar ${count}x ${lure.name}.`, 'warning');
      return false;
    }

    state.gold -= totalCost;
    const hState = this.getHuntingState(state);
    hState.lureInventory[lureId] = (hState.lureInventory[lureId] || 0) + count;

    if (!hState.activeLure) {
      hState.activeLure = lureId;
    }

    if (callbacks.log) callbacks.log(`🎒 Comprou ${count}x **${lure.name}** por ${totalCost.toLocaleString()} Adena.`, 'loot');
    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return true;
  },

  buyKnife(state, knifeId, callbacks = {}) {
    const knife = KNIVES_CATALOG[knifeId];
    if (!knife) return false;

    const hState = this.getHuntingState(state);
    if (hState.knifeDurability[knifeId] !== undefined) {
      if (callbacks.log) callbacks.log(`⚠️ Você já adquiriu a faca ${knife.name}!`, 'warning');
      return false;
    }

    if (hState.skillLevel < knife.minHuntingLevel) {
      if (callbacks.log) callbacks.log(`⚠️ Nível de Caça insuficiente! Requer Nível ${knife.minHuntingLevel} de Caça.`, 'warning');
      return false;
    }

    if ((state.gold || 0) < knife.buyPrice) {
      if (callbacks.log) callbacks.log(`⚠️ Ouro insuficiente! Requer ${knife.buyPrice.toLocaleString()} Adena.`, 'warning');
      return false;
    }

    state.gold -= knife.buyPrice;
    hState.knifeDurability[knifeId] = knife.durabilityMax;
    hState.knife = knifeId;

    if (callbacks.log) callbacks.log(`🔪 Adquiriu e equipou **${knife.name}**!`, 'rarity-legendary');
    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return true;
  },

  equipKnife(state, knifeId, callbacks = {}) {
    const knife = KNIVES_CATALOG[knifeId];
    if (!knife) return false;

    const hState = this.getHuntingState(state);
    if (hState.knifeDurability[knifeId] === undefined && knifeId !== 'knife_none') {
      if (callbacks.log) callbacks.log('⚠️ Você não possui esta faca em sua coleção!', 'warning');
      return false;
    }

    hState.knife = knifeId;
    if (callbacks.log) callbacks.log(`🔪 Faca empunhada: **${knife.name}**.`, 'system');

    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return true;
  },

  repairKnife(state, knifeId, callbacks = {}) {
    const hState = this.getHuntingState(state);
    const targetKnifeId = knifeId || hState.knife;
    const knife = KNIVES_CATALOG[targetKnifeId];
    if (!knife) return false;

    const currentDur = hState.knifeDurability[targetKnifeId] ?? knife.durabilityMax;
    if (currentDur >= knife.durabilityMax) {
      if (callbacks.log) callbacks.log(`⚠️ Sua ${knife.name} já está com o fio perfeito (100% afiada)!`, 'warning');
      return false;
    }

    const missingPct = (knife.durabilityMax - currentDur) / knife.durabilityMax;
    const cost = Math.max(100, Math.floor(knife.repairCost * missingPct));

    if ((state.gold || 0) < cost) {
      if (callbacks.log) callbacks.log(`⚠️ Ouro insuficiente para afiar a lâmina! Requer ${cost.toLocaleString()} Adena.`, 'warning');
      return false;
    }

    state.gold -= cost;
    hState.knifeDurability[targetKnifeId] = knife.durabilityMax;

    if (callbacks.log) callbacks.log(`✨ **${knife.name}** foi afiada na pedra de amolar! Durabilidade restaurada (${knife.durabilityMax}/${knife.durabilityMax}).`, 'system');
    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return true;
  },

  pickPreyForZone(zoneId, activeLureId) {
    const zone = HUNTING_ZONES[zoneId] || HUNTING_ZONES.zone_talking_forest;
    const preys = zone.availablePrey.map(id => PREY_CATALOG[id]).filter(Boolean);
    if (preys.length === 0) return PREY_CATALOG.prey_hare;

    const lure = activeLureId ? LURES_CATALOG[activeLureId] : null;

    // Pesos por raridade
    const weights = {
      common: 50,
      uncommon: 25,
      rare: 15,
      epic: 8,
      legendary: 2
    };

    if (lure && lure.rarityBoost) {
      if (lure.rarityBoost === 'uncommon') weights.uncommon += 20;
      if (lure.rarityBoost === 'rare') weights.rare += 25;
      if (lure.rarityBoost === 'epic') weights.epic += 20;
      if (lure.rarityBoost === 'legendary') weights.legendary += 20;
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

    // Filtra presas da zona que batam com a raridade sorteada
    const matched = preys.filter(p => p.rarity === targetRarity);
    if (matched.length > 0) {
      return matched[Math.floor(Math.random() * matched.length)];
    }

    return preys[Math.floor(Math.random() * preys.length)];
  },

  startTracking(state, tacticOrPreyId = null, callbacks = {}) {
    const hState = this.getHuntingState(state);
    const activeKnifeId = hState.knife || 'knife_none';
    const knifeDef = KNIVES_CATALOG[activeKnifeId];
    const dur = hState.knifeDurability[activeKnifeId] ?? 0;

    if (dur <= 0) {
      if (callbacks.log) callbacks.log(`⚠️ Sua ${knifeDef?.name || 'Faca'} perdeu todo o fio! Afie-a antes de continuar a caçada.`, 'warning');
      return { success: false, reason: 'broken_tool' };
    }

    if (tacticOrPreyId && APPROACH_TACTICS[tacticOrPreyId]) {
      hState.selectedTactic = tacticOrPreyId;
      hState.activeTactic = tacticOrPreyId;
    }
    const tactic = APPROACH_TACTICS[hState.selectedTactic] || APPROACH_TACTICS.ambush;

    // Consome 1 atrativo se houver
    let lureSpeedMult = 1.0;
    if (hState.activeLure) {
      const lureStock = hState.lureInventory[hState.activeLure] || 0;
      if (lureStock > 0) {
        hState.lureInventory[hState.activeLure] -= 1;
        const lureDef = LURES_CATALOG[hState.activeLure];
        if (lureDef?.speedBoost) {
          lureSpeedMult = lureDef.speedBoost;
        }
      } else {
        hState.activeLure = null;
      }
    }

    const zone = HUNTING_ZONES[hState.activeZone] || HUNTING_ZONES.zone_talking_forest;
    const prey = this.pickPreyForZone(hState.activeZone, hState.activeLure);

    // Wind and Alert logic
    const winds = Object.keys(WIND_DIRECTIONS);
    hState.windDirection = winds[Math.floor(Math.random() * winds.length)];
    const baseAlert = 15 + (zone.difficulty * 3);
    hState.alertLevel = baseAlert + Math.floor(Math.random() * 11);

    if (tactic.id === 'lure') {
      hState.windDirection = 'headwind';
      hState.alertLevel = Math.max(0, hState.alertLevel - 35);
    } else {
      let alertMult = WIND_DIRECTIONS[hState.windDirection]?.alertMult || 1.0;
      let alertChange = tactic.alertChange || 0;
      hState.alertLevel = Math.max(0, Math.min(100, hState.alertLevel + (alertChange * alertMult)));
    }

    let trackDuration = prey.baseTrackTime || zone.baseTrackTime || 3000;
    trackDuration = Math.max(1200, Math.floor((trackDuration * (tactic.timeMult || 1.0)) / lureSpeedMult));

    hState.isHunting = true;
    hState.trackStartTime = Date.now();
    hState.trackedPreyId = prey.id;
    hState.trackDuration = trackDuration;
    hState.activeTactic = tactic.id;

    if (callbacks.log) {
      callbacks.log(`🐾 Pegadas frescas avistadas! [${tactic.name}] Rastreando **${prey.name}** nas sombras de ${zone.name}...`, 'system');
    }

    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return { success: true };
  },

  finishSkinning(state, callbacks = {}) {
    const hState = this.getHuntingState(state);
    if (!hState.isHunting || !hState.trackedPreyId) return false;

    const now = Date.now();
    const elapsed = now - (hState.trackStartTime || now);
    const needed = hState.trackDuration ?? 3000;

    if (elapsed < needed) {
      const waitSec = ((needed - elapsed) / 1000).toFixed(1);
      if (callbacks.log) callbacks.log(`⚠️ A presa ainda está sendo encurralada! Aguarde mais ${waitSec}s.`, 'warning');
      return false;
    }

    const prey = PREY_CATALOG[hState.trackedPreyId];
    if (!prey) {
      hState.isHunting = false;
      hState.trackedPreyId = null;
      return false;
    }

    const activeKnifeId = hState.knife || 'knife_none';
    const knifeDef = KNIVES_CATALOG[activeKnifeId];

    if (hState.alertLevel >= 100) {
      hState.isHunting = false;
      hState.trackedPreyId = null;
      hState.autoHunting = false;
      if (hState.knifeDurability[activeKnifeId] !== undefined) {
        hState.knifeDurability[activeKnifeId] = Math.max(0, hState.knifeDurability[activeKnifeId] - 1);
      }
      if (callbacks.log) callbacks.log(`💨 A presa escapou no último segundo! (Faca perdeu 1 durabilidade no tropeço)`, 'warning');
      if (callbacks.updateAllUI) callbacks.updateAllUI();
      if (callbacks.save) callbacks.save();
      return false;
    }

    const tactic = APPROACH_TACTICS[hState.activeTactic] || APPROACH_TACTICS.ambush;
    const knifeBonus = knifeDef?.perfectSkinBonus || 0.0;
    const qualityMod = knifeBonus + (tactic.qualityBonus || 0.0);

    if (!hState.autoHunting) {
      hState.awaitingButchering = true;
      hState.slainPreyData = { preyId: prey.id, qualityMod, tactic: tactic.id };
      hState.isHunting = false;
      hState.trackedPreyId = null;
      if (callbacks.log) callbacks.log(`🐾 Presa abatida! Aguardando decisão de descarne...`, 'system');
      if (callbacks.updateAllUI) callbacks.updateAllUI();
      if (callbacks.save) callbacks.save();
      return true;
    }

    // Lógica AFK (Balanced Yield)
    if (hState.knifeDurability[activeKnifeId] !== undefined) {
      hState.knifeDurability[activeKnifeId] = Math.max(0, hState.knifeDurability[activeKnifeId] - 1);
    }
    const actState = LifeActivityCore.getActivityState(state, 'hunting');
    actState.toolDurability = hState.knifeDurability[activeKnifeId] ?? 0;

    if (actState.toolDurability <= 0) {
      hState.isHunting = false;
      hState.trackedPreyId = null;
      hState.autoHunting = false;
      if (callbacks.log) callbacks.log(`💥 **LÂMINA CEGA!** Sua ${knifeDef?.name || 'faca'} perdeu completamente o fio.`, 'error');
      if (callbacks.updateAllUI) callbacks.updateAllUI();
      if (callbacks.save) callbacks.save();
      return false;
    }

    // Rola qualidade e rendimento pelo RewardEngine
    const quality = RewardEngine.rollQuality(hState.skillLevel, qualityMod);
    const primaryMatRaw = prey.skinYield.primary;
    const secMatRaw = prey.skinYield.secondary;

    const primaryMat = resolveCanonicalResourceId(primaryMatRaw);
    const secMat = secMatRaw ? resolveCanonicalResourceId(secMatRaw) : null;

    const basePrimaryQty = prey.skinYield.primaryQty || 1;
    const primaryQty = RewardEngine.calculateYield(basePrimaryQty, quality);

    const baseSecQty = prey.skinYield.secondaryQty || 0;
    const secQty = baseSecQty > 0 ? RewardEngine.calculateYield(baseSecQty, quality) : 0;

    addToInventory(state, primaryMat, primaryQty, prey.rarity, false, callbacks, true);
    if (secMat && secQty > 0) {
      addToInventory(state, secMat, secQty, prey.rarity, false, callbacks, true);
    }

    // Registro no Bestiário e Codex
    hState.huntingLog[prey.id] = (hState.huntingLog[prey.id] || 0) + 1;
    hState.totalHunted = (hState.totalHunted || 0) + 1;
    LifeActivityCore.recordCodexDiscovery(state, 'hunting', prey.id);

    // Ganho de XP de Caça
    const xpBase = prey.xpReward || 10;
    const finalXp = Math.round(xpBase * quality.mult);
    LifeActivityCore.addXp(state, 'hunting', finalXp, callbacks);

    hState.isHunting = false;
    hState.trackedPreyId = null;

    if (callbacks.log) {
      const qualityPrefix = quality.tier === 'perfect' ? '🌟 **ESFOLAÇÃO PERFEITA!**'
        : quality.tier === 'excellent' ? '✨ **ESFOLAÇÃO EXCELENTE!**'
        : '✓ Esfolação concluída:';
      callbacks.log(`🐾 ${qualityPrefix} Abateu **${prey.name}** [${quality.name}]! Obteve +${primaryQty}x ${primaryMat.toUpperCase()}${secMat && secQty > 0 ? ` e +${secQty}x ${secMat.toUpperCase()}` : ''}! (+${finalXp} XP de Caça)`, 'loot');
    }

    if (callbacks.floatText) {
      callbacks.floatText(`+${primaryQty}x ${primaryMat.toUpperCase()}`, 'float-gold');
    }

    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return true;
  },

  executeFieldButchering(state, choice, callbacks = {}) {
    const hState = this.getHuntingState(state);
    if (!hState.awaitingButchering || !hState.slainPreyData) return false;

    const activeKnifeId = hState.knife || 'knife_none';
    const knifeDef = KNIVES_CATALOG[activeKnifeId];
    if (hState.knifeDurability[activeKnifeId] !== undefined) {
      hState.knifeDurability[activeKnifeId] = Math.max(0, hState.knifeDurability[activeKnifeId] - 1);
    }
    const actState = LifeActivityCore.getActivityState(state, 'hunting');
    actState.toolDurability = hState.knifeDurability[activeKnifeId] ?? 0;

    const { preyId, qualityMod } = hState.slainPreyData;
    const prey = PREY_CATALOG[preyId];
    
    const quality = RewardEngine.rollQuality(hState.skillLevel, qualityMod);
    
    let primaryMatRaw, secMatRaw;
    let basePrimaryQty = 1, baseSecQty = 0;

    if (choice === 'pelt') {
      primaryMatRaw = prey.skinYield.primary;
      basePrimaryQty = (prey.skinYield.primaryQty || 1) + 1;
      secMatRaw = null; 
    } else {
      primaryMatRaw = 'bone';
      basePrimaryQty = (prey.skinYield.primaryQty || 1);
      secMatRaw = prey.skinYield.secondary || 'coarse_bone_powder';
      baseSecQty = (prey.skinYield.secondaryQty || 1) + 1;
    }

    const primaryMat = resolveCanonicalResourceId(primaryMatRaw);
    const primaryQty = RewardEngine.calculateYield(basePrimaryQty, quality);
    addToInventory(state, primaryMat, primaryQty, prey.rarity, false, callbacks, true);

    if (secMatRaw && baseSecQty > 0) {
      const secMat = resolveCanonicalResourceId(secMatRaw);
      const secQty = RewardEngine.calculateYield(baseSecQty, quality);
      addToInventory(state, secMat, secQty, prey.rarity, false, callbacks, true);
    }

    hState.huntingLog[prey.id] = (hState.huntingLog[prey.id] || 0) + 1;
    hState.totalHunted = (hState.totalHunted || 0) + 1;
    LifeActivityCore.recordCodexDiscovery(state, 'hunting', prey.id);

    const xpBase = prey.xpReward || 10;
    const finalXp = Math.round(xpBase * quality.mult);
    LifeActivityCore.addXp(state, 'hunting', finalXp, callbacks);

    hState.awaitingButchering = false;
    hState.slainPreyData = null;

    if (callbacks.log) {
      callbacks.log(`🔪 Descarne (${choice === 'pelt' ? 'Foco em Peles' : 'Foco em Ossos'}): Obteve ${primaryQty}x ${primaryMat.toUpperCase()}! (+${finalXp} XP)`, 'loot');
    }
    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return true;
  },

  addHuntingXp(state, xpAmount, callbacks = {}) {
    const hState = this.getHuntingState(state);
    hState.skillXp = (hState.skillXp || 0) + xpAmount;
    let leveledUp = false;

    while (hState.skillLevel < 30) {
      const needed = getHuntingXpForLevel(hState.skillLevel);
      if (hState.skillXp >= needed) {
        hState.skillXp -= needed;
        hState.skillLevel += 1;
        leveledUp = true;
      } else {
        break;
      }
    }

    if (leveledUp && callbacks.log) {
      callbacks.log(`🎉 **Sua Maestria de Caça subiu para o Nível ${hState.skillLevel}!** Novas presas e ferramentas desbloqueadas.`, 'rarity-legendary');
    }

    return leveledUp;
  },

  toggleAutoHunting(state, callbacks = {}) {
    const hState = this.getHuntingState(state);
    if (hState.skillLevel < 5) {
      if (callbacks.log) callbacks.log('⚠️ O Modo de Caça Automática (AFK) é desbloqueado no Nível 5 de Caça!', 'warning');
      return false;
    }

    hState.autoHunting = !hState.autoHunting;
    hState.lastAutoTick = Date.now();

    if (callbacks.log) {
      callbacks.log(
        hState.autoHunting
          ? '🐾 **Caça Automática (AFK) ATIVADA!** Seu caçador rastreará presas e extrairá peles continuamente.'
          : '⏸️ **Caça Automática (AFK) PAUSADA.**',
        'system'
      );
    }

    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return true;
  },

  processAutoHunt(state, callbacks = {}) {
    const hState = this.getHuntingState(state);
    if (!hState.autoHunting) return;

    const activeKnifeId = hState.knife || 'knife_none';
    const dur = hState.knifeDurability[activeKnifeId] ?? 0;
    if (dur <= 0) {
      hState.autoHunting = false;
      if (callbacks.log) callbacks.log('⚠️ Caça AFK interrompida: Sua faca perdeu o corte!', 'warning');
      if (callbacks.updateAllUI) callbacks.updateAllUI();
      return;
    }

    const now = Date.now();
    if (!hState.isHunting) {
      this.startTracking(state, callbacks);
    } else {
      const elapsed = now - (hState.trackStartTime || now);
      const needed = hState.trackDuration || 3000;
      if (elapsed >= needed) {
        this.finishSkinning(state, callbacks);
      }
    }
  },

  processOfflineHunting(state, minutesOffline = 0, callbacks = {}) {
    const hState = this.getHuntingState(state);
    if (!hState.autoHunting) return null;

    const activeKnifeId = hState.knife || 'knife_none';
    let availableDur = hState.knifeDurability[activeKnifeId] ?? 0;
    if (availableDur <= 0) return null;

    const clampedMinutes = Math.min(480, Math.max(0, minutesOffline));
    if (clampedMinutes < 2) return null;

    // Em modo offline: 1 abate a cada 30 segundos com eficiência de 25%
    const totalPotentialHunts = Math.floor((clampedMinutes * 60) / 30 * 0.25);
    const actualHunts = Math.min(availableDur, Math.max(1, totalPotentialHunts));

    if (actualHunts <= 0) return null;

    // Deduz durabilidade
    hState.knifeDurability[activeKnifeId] -= actualHunts;

    const zoneId = hState.activeZone || 'zone_talking_forest';
    let totalXp = 0;
    const matsGained = {};

    for (let i = 0; i < actualHunts; i++) {
      const prey = this.pickPreyForZone(zoneId, null);
      hState.huntingLog[prey.id] = (hState.huntingLog[prey.id] || 0) + 1;
      hState.totalHunted = (hState.totalHunted || 0) + 1;
      totalXp += prey.xpReward || 8;

      const pMat = resolveCanonicalResourceId(prey.skinYield.primary);
      const pQty = prey.skinYield.primaryQty;
      matsGained[pMat] = (matsGained[pMat] || 0) + pQty;

      const sMatRaw = prey.skinYield.secondary;
      const sQty = prey.skinYield.secondaryQty;
      if (sMatRaw && sQty > 0) {
        const sMat = resolveCanonicalResourceId(sMatRaw);
        matsGained[sMat] = (matsGained[sMat] || 0) + sQty;
      }
    }

    // Concede materiais ao inventário
    for (const [matId, qty] of Object.entries(matsGained)) {
      addToInventory(state, matId, qty, 'common', false, callbacks, true);
    }

    this.addHuntingXp(state, totalXp, callbacks);

    if (callbacks.log) {
      callbacks.log(`💤 **Relatório de Caça Offline (${clampedMinutes}m):** Abateu ${actualHunts} presas nos ermos de Aden! (+${totalXp} XP de Caça)`, 'rarity-legendary');
    }

    return { actualHunts, matsGained, totalXp };
  },

  exchangePelts(state, preyId, qty = 1, callbacks = {}) {
    const prey = PREY_CATALOG[preyId];
    if (!prey) return false;

    const hState = this.getHuntingState(state);
    const huntedCount = hState.huntingLog[preyId] || 0;
    const reqRatio = prey.exchangeRate || 5;

    const setsToExchange = Math.max(1, Math.floor(qty));
    const totalRequired = setsToExchange * reqRatio;

    if (huntedCount < totalRequired) {
      if (callbacks.log) callbacks.log(`⚠️ Abates insuficientes no Bestiário! Requer ${totalRequired}x ${prey.name} para a troca de curtume.`, 'warning');
      return false;
    }

    hState.huntingLog[preyId] -= totalRequired;
    const rewardMat = resolveCanonicalResourceId(prey.exchangeReward);
    const rewardQty = setsToExchange;

    addToInventory(state, rewardMat, rewardQty, prey.rarity, false, callbacks, true);

    if (callbacks.log) {
      callbacks.log(`💼 **Mercado de Curtume:** Entregou ${totalRequired}x carcaças de ${prey.name} e recebeu +${rewardQty}x **${prey.exchangeRewardName}**!`, 'rarity-legendary');
    }

    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return true;
  }
};
