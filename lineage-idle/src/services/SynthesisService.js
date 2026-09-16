/**
 * SynthesisService.js — Sistema de Síntese e Fusão de Duplicatas na Forja (NÍVEL 16).
 * 
 * Permite fundir itens idênticos para desbloquear Synthesis Ranks (1 a 5) em armas/armaduras
 * e elevar o nível de artefatos (cintos, talismãs, joias e brooches).
 */

import { D } from '../core/GameConfig.js';
import { getItemGrade } from './InventoryService.js';
import { ALL_ITEMS } from '../data/items/index.js';

export const SYNTHESIS_CONFIG = {
  // Configuração por Rank Alvo (Target Rank)
  1: {
    successRate: 0.80,
    costAdena: 100000,
    reqForgeLvl: 1,
    desc: 'Fusão Básica: 80% de chance de sucesso. O sacrifício é consumido na falha.'
  },
  2: {
    successRate: 0.70,
    costAdena: 250000,
    reqForgeLvl: 2,
    desc: 'Fusão Intermediária: 70% de chance de sucesso. O sacrifício é consumido na falha.'
  },
  3: {
    successRate: 0.55,
    costAdena: 500000,
    reqForgeLvl: 4,
    desc: 'Fusão Avançada: 55% de chance de sucesso. O sacrifício é consumido na falha.'
  },
  4: {
    successRate: 0.40,
    costAdena: 1000000,
    reqForgeLvl: 6,
    desc: 'Fusão Superior: 40% de chance de sucesso. O sacrifício é consumido na falha.'
  },
  5: {
    successRate: 0.30,
    costAdena: 2500000,
    reqForgeLvl: 10,
    desc: 'Fusão Mestra Suprema: 30% de chance (+10% com Forja Lv 10). Risco: na falha o alvo pode regredir 1 rank!'
  }
};

export class SynthesisService {
  /**
   * Obtém a definição do item.
   */
  static getItemDef(itemId) {
    return D()?.ALL_ITEMS?.[itemId] || null;
  }

  /**
   * Determina o rank atual de síntese do item.
   */
  static getItemSynthesisRank(item) {
    if (!item) return 0;
    return Number(item.synthesisRank || item.compoundRank || item.compoundLevel) || 0;
  }

  static isEligible(item) {
    if (!item) return false;
    const def = this.getItemDef(item.itemId || item.id);
    const slot = def?.slot || item.slot || '';

    // Apenas artefatos sofrem síntese / fusão (Broches, Joias de Broche, Talismãs, Dolls, Agathions e Cintos)
    // No Lineage II clássico, armas e armaduras não sofrem fusão gacha de duplicatas.
    const isArtifact = ['talisman', 'jewel', 'agathion', 'doll', 'belt', 'brooch'].includes(slot) ||
      String(item.itemId || item.id || '').includes('talisman') ||
      String(item.itemId || item.id || '').includes('jewel_') ||
      String(item.itemId || item.id || '').includes('ruby') ||
      String(item.itemId || item.id || '').includes('sapphire') ||
      String(item.itemId || item.id || '').includes('diamond') ||
      String(item.itemId || item.id || '').includes('pearl') ||
      String(item.itemId || item.id || '').includes('opal') ||
      String(item.itemId || item.id || '').includes('agathion') ||
      String(item.itemId || item.id || '').includes('belt');

    return isArtifact;
  }

  /**
   * Obtém o nível mínimo de forja requerido para o grau do item.
   */
  static getReqForgeLevelForGrade(grade) {
    switch (String(grade).toUpperCase()) {
      case 'D GRADE':
      case 'D':
      case 'C GRADE':
      case 'C':
        return 1;
      case 'B GRADE':
      case 'B':
        return 4;
      case 'A GRADE':
      case 'A':
        return 6;
      case 'S GRADE':
      case 'S':
        return 8;
      default:
        return 1;
    }
  }

  /**
   * Obtém a lista de ingredientes compatíveis para o item alvo selecionado.
   */
  static getCompatibleIngredients(state, targetItem) {
    if (!state || !targetItem) return [];
    const inv = state.inventory || [];
    const targetId = targetItem.itemId || targetItem.id;
    const targetRank = this.getItemSynthesisRank(targetItem);

    return inv.filter(i => {
      if (i.uid === targetItem.uid) return false; // Não pode ser ele mesmo
      if (i.equipped) return false; // Não pode consumir item equipado
      const itmId = i.itemId || i.id;
      if (itmId !== targetId) return false; // Deve ser a mesma duplicata
      const itmRank = this.getItemSynthesisRank(i);
      // O ingrediente deve ter rank compatível (igual ao rank do alvo, ou rank 0 se alvo for rank 0)
      return itmRank === targetRank;
    });
  }

  /**
   * Executa a síntese na forja entre o item primário e o secundário.
   */
  static executeSynthesis(state, primaryUid, secondaryUid, callbacks = {}) {
    const { log = console.log, updateAllUI = () => {}, save = () => {}, playCombatVFX = () => {} } = callbacks;
    const inv = state.inventory || [];

    const primaryItem = inv.find(i => i.uid === primaryUid || i.id === primaryUid);
    const secondaryItem = inv.find(i => i.uid === secondaryUid || i.id === secondaryUid);

    if (!primaryItem || !secondaryItem) {
      log('Selecione o item alvo e o ingrediente sacrifício!', 'error');
      return { success: false, reason: 'missing_items' };
    }

    if (primaryItem === secondaryItem || (primaryItem.uid && primaryItem.uid === secondaryItem.uid)) {
      log('Você não pode sacrificar o próprio item alvo!', 'error');
      return { success: false, reason: 'same_item' };
    }

    if (secondaryItem.equipped) {
      log('O item sacrifício não pode estar equipado!', 'error');
      return { success: false, reason: 'secondary_equipped' };
    }

    const primaryId = primaryItem.itemId || primaryItem.id;
    const secondaryId = secondaryItem.itemId || secondaryItem.id;

    if (primaryId !== secondaryId) {
      log('A síntese requer dois itens idênticos do mesmo tipo e nome!', 'error');
      return { success: false, reason: 'different_types' };
    }

    const currentRank = this.getItemSynthesisRank(primaryItem);
    if (currentRank >= 5) {
      log('Este item já alcançou o Rank Máximo de Síntese (Rank 5 ★★★★★)!', 'warning');
      return { success: false, reason: 'max_rank' };
    }

    const targetRank = currentRank + 1;
    const config = SYNTHESIS_CONFIG[targetRank] || SYNTHESIS_CONFIG[1];

    // Verificar requisito de nível da Forja (Gating Progressivo)
    const forgeLvl = Number(state.craftLevel) || 1;
    const def = this.getItemDef(primaryId);
    const itemGrade = getItemGrade(def?.req?.level || 1);
    const reqGradeForge = this.getReqForgeLevelForGrade(itemGrade);
    const finalReqForge = Math.max(config.reqForgeLvl, reqGradeForge);

    if (forgeLvl < finalReqForge) {
      log(`Nível de Forja insuficiente! Requer Forja Imperial Lv. ${finalReqForge} para forjar este item (Atual: Lv. ${forgeLvl}).`, 'error');
      return { success: false, reason: 'forge_level_too_low' };
    }

    // Verificar custo em Adena
    const cost = config.costAdena;
    const currentGold = (state.gold !== undefined ? state.gold : (state.adena || 0));
    if (currentGold < cost) {
      log(`Adena insuficiente! A síntese requer ${cost.toLocaleString()} Adena (você tem ${currentGold.toLocaleString()}).`, 'error');
      return { success: false, reason: 'insufficient_funds' };
    }

    // Cobrar custo
    if (state.gold !== undefined) state.gold -= cost;
    if (state.adena !== undefined) state.adena -= cost;

    // Consumir o ingrediente secundário
    const secIdx = inv.findIndex(i => (i.uid === secondaryUid || i.id === secondaryUid));
    if (secIdx !== -1) {
      const itm = inv[secIdx];
      if (itm.count && itm.count > 1) {
        itm.count -= 1;
      } else {
        inv.splice(secIdx, 1);
      }
    }

    // Calcular taxa de sucesso (+10% flat se Forja for Lv 10)
    let rate = config.successRate;
    if (forgeLvl >= 10) {
      rate += 0.10;
    }

    const roll = Math.random();
    const isSuccess = roll < rate;

    const itemName = def?.name || primaryItem.name || primaryId;

    if (isSuccess) {
      primaryItem.synthesisRank = targetRank;
      primaryItem.compoundRank = targetRank;
      primaryItem.compoundLevel = targetRank;

      // Se for cinto, atualiza beltBonuses
      const slot = def?.slot || primaryItem.slot;
      if (slot === 'belt' || primaryId.includes('belt')) {
        primaryItem.beltBonuses = {
          hpBonusPct: 0.04 + (targetRank * 0.02),
          pDefBonus: 20 + (targetRank * 10),
          weightBonus: 1000 + (targetRank * 1000),
          pvpDmgPct: 0.02 + (targetRank * 0.015)
        };
      }

      // Se for Joia de Broche, atualiza o itemId e metadados para o próximo nível
      const jewelMatch = String(primaryId).match(/^jewel_(ruby|sapphire|diamond|pearl|opal)_(\d)$/);
      if (jewelMatch) {
        const jType = jewelMatch[1];
        const nextLvl = Math.min(5, Number(jewelMatch[2]) + 1);
        const nextId = `jewel_${jType}_${nextLvl}`;
        const allItems = D()?.ALL_ITEMS || ALL_ITEMS || {};
        const nextDef = allItems[nextId];
        primaryItem.itemId = nextId;
        primaryItem.level = nextLvl;
        if (nextDef) {
          primaryItem.name = nextDef.name;
          primaryItem.icon = nextDef.icon;
        }
      }

      const stars = '★'.repeat(targetRank);
      log(`✨ SÍNTESE BEM-SUCEDIDA! "${itemName}" ascendeu ao Rank ${targetRank} ${stars}! (+${targetRank * 10}% Atributos Base)`, 'rarity-legendary');

      try {
        playCombatVFX('buff_aura', { color: '#ffd700', duration: 800 });
      } catch (_) {}

      if (typeof updateAllUI === 'function') updateAllUI();
      if (typeof save === 'function') save();

      return { success: true, newRank: targetRank, resultItem: primaryItem };
    } else {
      // Falha na síntese
      let regressed = false;
      if (currentRank >= 4 && Math.random() < 0.50) {
        // No Rank 4 tentando 5, 50% de chance de regredir para Rank 3
        primaryItem.synthesisRank = Math.max(1, currentRank - 1);
        primaryItem.compoundRank = primaryItem.synthesisRank;
        primaryItem.compoundLevel = primaryItem.synthesisRank;
        regressed = true;
        log(`💥 FALHA CRÍTICA NA SÍNTESE! O ingrediente foi consumido e a instabilidade fez "${itemName}" regredir para o Rank ${primaryItem.synthesisRank}!`, 'warning');
      } else {
        log(`💥 FALHA NA SÍNTESE! O ingrediente sacrifício foi destruído pelas chamas da forja, mas o item principal foi preservado.`, 'system');
      }

      try {
        playCombatVFX('monster_inferno_pillar', { color: '#ef4444', duration: 600 });
      } catch (_) {}

      if (typeof updateAllUI === 'function') updateAllUI();
      if (typeof save === 'function') save();

      return { success: false, regressed, currentRank: primaryItem.synthesisRank || currentRank };
    }
  }

  /**
   * Alias de conveniência para executeSynthesis.
   */
  static synthesize(state, primaryUid, secondaryUid, callbacks = {}) {
    return this.executeSynthesis(state, primaryUid, secondaryUid, callbacks);
  }
}
