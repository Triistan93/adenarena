/**
 * SkillEnchantService.js — Motor de Encantamento de Habilidades do Lineage Idle.
 */

import { ENCHANT_ROUTES, getEnchantLevelData, ENCHANT_ITEMS } from '../data/skill_enchant.js';

export class SkillEnchantService {
  /**
   * Retorna os dados de encantamento de uma habilidade no estado do jogador.
   */
  static getSkillEnchant(state, skillId) {
    if (!state.skillEnchants) {
      state.skillEnchants = {};
    }
    return state.skillEnchants[skillId] || { level: 0, route: 'power' };
  }

  /**
   * Valida se a habilidade pode ser encantada.
   */
  static canEnchant(state, skillId, route = 'power', isMastery = false) {
    const current = this.getSkillEnchant(state, skillId);
    if (current.level >= 30) {
      return { can: false, reason: 'max_level', message: 'Habilidade já atingiu o nível máximo de encantamento (+30)!' };
    }

    if ((state.level || 1) < 76) {
      return { can: false, reason: 'level_req', message: 'Requer Nível 76+ e 3ª Evolução de Classe para encantar habilidades.' };
    }

    const nextLvl = current.level + 1;
    const costData = getEnchantLevelData(nextLvl);

    if ((state.sp || 0) < costData.spCost) {
      return { can: false, reason: 'sp_low', message: `SP insuficiente. Requer ${costData.spCost.toLocaleString()} SP.` };
    }

    if ((state.gold || 0) < costData.adenaCost) {
      return { can: false, reason: 'gold_low', message: `Adena insuficiente. Requer ${costData.adenaCost.toLocaleString()} Adena.` };
    }

    const reqItemId = isMastery ? costData.reqItemMastery : costData.reqItemNormal;
    const hasItem = (state.inventory || []).some(i => {
      const id = typeof i === 'object' ? i.id : i;
      return id === reqItemId || id === reqItemId.replace('giants_codex', 'item_giants_codex');
    });

    // Se o jogador não tiver o item no inventário, permitir comprar instantaneamente caso tenha adena extra
    const codexDef = ENCHANT_ITEMS[reqItemId];
    const autoBuyCost = codexDef?.price || 1500000;
    if (!hasItem && (state.gold || 0) < (costData.adenaCost + autoBuyCost)) {
      return {
        can: false,
        reason: 'item_missing',
        message: `Requer 1x ${codexDef?.name || "Giant's Codex"} no inventário (ou +${autoBuyCost.toLocaleString()} Adena para compra automática).`
      };
    }

    return { can: true, nextLvl, costData, hasItem, autoBuyCost: hasItem ? 0 : autoBuyCost };
  }

  /**
   * Executa a tentativa de encantamento de uma habilidade.
   */
  static enchantSkill(state, skillId, skillName = 'Habilidade', route = 'power', isMastery = false, callbacks = {}) {
    const { log = console.log, onUpdate = () => {} } = callbacks;
    const check = this.canEnchant(state, skillId, route, isMastery);

    if (!check.can) {
      log(check.message, 'error');
      return { success: false, reason: check.reason };
    }

    const current = this.getSkillEnchant(state, skillId);
    const targetLvl = current.level + 1;
    const costData = check.costData;

    // Consumir SP e Adena
    state.sp -= costData.spCost;
    state.gold -= (costData.adenaCost + check.autoBuyCost);

    // Consumir item do inventário se possuir
    if (check.hasItem) {
      const idx = (state.inventory || []).findIndex(i => {
        const id = typeof i === 'object' ? i.id : i;
        return id === costData.reqItemNormal || id === costData.reqItemMastery || id === 'giants_codex' || id === 'giants_codex_mastery';
      });
      if (idx !== -1) {
        const item = state.inventory[idx];
        if (typeof item === 'object' && item.count && item.count > 1) {
          item.count -= 1;
        } else {
          state.inventory.splice(idx, 1);
        }
      }
    }

    // Rolagem de probabilidade
    const roll = Math.random();
    const isSuccess = roll <= costData.successRate;

    if (isSuccess) {
      state.skillEnchants[skillId] = {
        level: targetLvl,
        route: route
      };

      const routeDef = ENCHANT_ROUTES[route] || ENCHANT_ROUTES.power;
      const successMsg = `✨ SUCESSO! A habilidade ${skillName} foi encantada para +${targetLvl} (${routeDef.name})!`;
      log(successMsg, 'success');
      onUpdate();
      return { success: true, newLevel: targetLvl, route };
    } else {
      if (isMastery) {
        const failMsg = `🛡️ O encantamento de ${skillName} falhou, mas o Giant's Codex Mastery PROTEGEU seu nível atual (+${current.level})!`;
        log(failMsg, 'warning');
        onUpdate();
        return { success: false, failedSafe: true, currentLevel: current.level };
      } else {
        state.skillEnchants[skillId] = {
          level: 0,
          route: route
        };
        const resetMsg = `💥 O encantamento de ${skillName} FALHOU! A habilidade regrediu para +0.`;
        log(resetMsg, 'error');
        onUpdate();
        return { success: false, failedSafe: false, currentLevel: 0 };
      }
    }
  }

  /**
   * Retorna os multiplicadores aplicados pelo nível de encantamento.
   */
  static getSkillMultipliers(state, skillId) {
    const enc = this.getSkillEnchant(state, skillId);
    if (!enc || enc.level <= 0) {
      return { damageMultiplier: 1.0, mpCostMultiplier: 1.0, chanceBonus: 0, elementBonus: 0 };
    }

    const route = enc.route || 'power';
    const lvl = enc.level;

    let damageMultiplier = 1.0;
    let mpCostMultiplier = 1.0;
    let chanceBonus = 0;
    let elementBonus = 0;

    if (route === 'power') {
      damageMultiplier += (lvl * 0.03); // +3% por nível
    } else if (route === 'cost') {
      mpCostMultiplier = Math.max(0.20, 1.0 - (lvl * 0.025)); // -2.5% por nível (max 80% redução)
    } else if (route === 'chance') {
      chanceBonus += (lvl * 0.02);
    } else if (route === 'element') {
      elementBonus += (lvl * 12);
    }

    return { damageMultiplier, mpCostMultiplier, chanceBonus, elementBonus, level: lvl, route };
  }
}
