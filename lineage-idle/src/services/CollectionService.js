/**
 * CollectionService.js — Motor Canônico de Coleções de Conta de Aden Arena.
 * 
 * Responsável por:
 * 1. Consulta do catálogo temático de coleções (No-Grade, D-Grade, C-Grade).
 * 2. Validação e registro com sacrifício definitivo (destruição) do item do inventário/armazém.
 * 3. Concessão cumulativa de atributos perpétuos para o personagem e conta.
 * 4. Cálculo de Combat Power (CP) proporcional às coleções completas.
 */

import { CODEX_SETS } from '../data/codex.js';
import { D } from '../core/GameConfig.js';
import { getStats } from '../engine/StatsEngine.js';

export class CollectionService {
  /**
   * Retorna todas as coleções cadastradas.
   */
  static getCollectionSets() {
    return CODEX_SETS;
  }

  /**
   * Retorna lista estruturada de coleções com progresso do jogador.
   */
  static getCollections(state) {
    return Object.entries(CODEX_SETS).map(([id, def]) => {
      const registered = this.getRegisteredItems(state, id);
      return {
        id,
        ...def,
        registeredItems: registered,
        registeredCount: registered.length,
        totalItems: def.items.length,
        isComplete: this.isSetCompleted(state, id)
      };
    });
  }

  /**
   * Retorna os itens já registrados em uma coleção específica.
   */
  static getRegisteredItems(state, setId) {
    if (!state) return [];
    const codex = state.codex || state.gearCodex || {};
    return codex[setId] || [];
  }

  /**
   * Verifica se uma coleção está 100% concluída.
   */
  static isSetCompleted(state, setId) {
    const setDef = CODEX_SETS[setId];
    if (!setDef || !Array.isArray(setDef.items)) return false;
    const registered = this.getRegisteredItems(state, setId);
    return setDef.items.every(itemId => registered.includes(itemId));
  }

  /**
   * Verifica se o jogador pode registrar um determinado item na coleção.
   */
  static canRegisterItem(state, setId, itemId) {
    const setDef = CODEX_SETS[setId];
    if (!setDef || !setDef.items.includes(itemId)) return false;

    const registered = this.getRegisteredItems(state, setId);
    if (registered.includes(itemId)) return false;

    // Verificar se possui o item no inventário (não equipado) ou armazém
    const hasInInv = (state.inventory || []).some(i => (i.itemId === itemId || i.id === itemId) && !i.equipped);
    if (hasInInv) return true;

    const hasInWh = (state.warehouse || []).some(i => (i.itemId === itemId || i.id === itemId) && !i.equipped);
    return hasInWh;
  }

  /**
   * Registra um item na coleção, removendo-o permanentemente do inventário/armazém.
   */
  static registerItem(state, setId, itemId, callbacks = {}) {
    const { log = console.log, floatText = () => {}, onUpdate = () => {} } = callbacks;
    const setDef = CODEX_SETS[setId];
    if (!setDef) {
      log('⚠️ Coleção inexistente.', 'warning');
      return { success: false, reason: 'invalid_collection' };
    }

    if (!setDef.items.includes(itemId)) {
      log('⚠️ Este item não pertence a esta coleção.', 'warning');
      return { success: false, reason: 'not_in_collection' };
    }

    state.codex = state.codex || {};
    state.codex[setId] = state.codex[setId] || [];
    state.gearCodex = state.codex;

    if (state.codex[setId].includes(itemId)) {
      log('⚠️ Este item já foi registrado nesta coleção.', 'warning');
      return { success: false, reason: 'already_registered' };
    }

    // Localizar e remover o item do inventário
    let invIdx = (state.inventory || []).findIndex(i => (i.itemId === itemId || i.id === itemId) && !i.equipped);
    let fromWarehouse = false;

    if (invIdx >= 0) {
      const it = state.inventory[invIdx];
      if ((it.count || 1) > 1) {
        it.count -= 1;
      } else {
        state.inventory.splice(invIdx, 1);
      }
    } else {
      let whIdx = (state.warehouse || []).findIndex(i => (i.itemId === itemId || i.id === itemId) && !i.equipped);
      if (whIdx >= 0) {
        fromWarehouse = true;
        const it = state.warehouse[whIdx];
        if ((it.count || 1) > 1) {
          it.count -= 1;
        } else {
          state.warehouse.splice(whIdx, 1);
        }
      } else {
        log('⚠️ Você não possui este item para registrar na coleção.', 'warning');
        return { success: false, reason: 'item_not_found' };
      }
    }

    // Registrar no estado
    state.codex[setId].push(itemId);

    const allItems = D()?.ALL_ITEMS || {};
    const itemDef = allItems[itemId] || { name: itemId };
    log(`📜 Item **${itemDef.name}** sacrificado e registrado com sucesso na Coleção!${fromWarehouse ? ' (Retirado do Baú)' : ''}`, 'rarity-rare');
    floatText('📜 ITEM REGISTRADO!', 'float-jackpot');

    // Verificar se completou a coleção
    const isCompleted = this.isSetCompleted(state, setId);
    if (isCompleted) {
      log(`🏆 PARABÉNS! Coleção **${setDef.name}** Concluída! Bônus Perpétuo Ativado: ${setDef.label}`, 'rarity-legendary');
      floatText('🏆 COLEÇÃO COMPLETA!', 'float-jackpot');
    }

    // Atualizar stats
    try {
      getStats(state);
    } catch (_) {}

    onUpdate();
    return { success: true, isCompleted };
  }

  /**
   * Retorna os bônus totais acumulados de todas as coleções completas.
   */
  static getCollectionStats(state) {
    const totals = { atk: 0, def: 0, matk: 0, mdef: 0, hp: 0, mp: 0, eva: 0, crit: 0 };
    if (!state || !state.codex) return totals;

    for (const [setId, setDef] of Object.entries(CODEX_SETS)) {
      if (this.isSetCompleted(state, setId)) {
        for (const [stat, val] of Object.entries(setDef.bonus || {})) {
          if (totals[stat] !== undefined) {
            totals[stat] += val;
          }
        }
      }
    }
    return totals;
  }

  /**
   * Retorna a contribuição de CP total de todas as coleções completadas.
   */
  static getCollectionCp(state) {
    const stats = this.getCollectionStats(state);
    return Math.floor(
      (stats.atk * 1.5) +
      (stats.matk * 1.5) +
      (stats.def * 1.2) +
      (stats.mdef * 1.2) +
      (stats.hp * 0.2) +
      (stats.mp * 0.1) +
      (stats.crit * 8) +
      (stats.eva * 4)
    );
  }
}
