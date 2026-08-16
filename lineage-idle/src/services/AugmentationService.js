/**
 * AugmentationService.js — Motor de Augmentação de Armas com Life Stones.
 */

import { LIFE_STONES, ITEM_SKILLS, STAT_ROLL_POOL } from '../data/augmentation.js';

export class AugmentationService {
  /**
   * Refina/Augmenta uma arma com uma Life Stone.
   */
  static augmentWeapon(state, weaponItem, lifeStoneId = 'life_stone_top_76', callbacks = {}) {
    const { log = console.log, onUpdate = () => {} } = callbacks;
    const stone = LIFE_STONES[lifeStoneId] || LIFE_STONES.life_stone_top_76;

    if (!weaponItem) {
      log('Selecione uma arma válida para realizar a Augmentação.', 'error');
      return { success: false, reason: 'no_weapon' };
    }

    if (weaponItem.slot !== 'weapon' && !weaponItem.id?.startsWith('weapon_')) {
      log('Apenas armas podem receber o poder das Pedras da Vida (Life Stones).', 'error');
      return { success: false, reason: 'not_a_weapon' };
    }

    if (weaponItem.augmentation) {
      log('Esta arma já possui uma Augmentação ativa. Remova a anterior com o Ferreiro antes de aplicar uma nova.', 'warning');
      return { success: false, reason: 'already_augmented' };
    }

    // Verificar item Life Stone no inventário ou cobrar custo em Adena
    let hasStone = (state.inventory || []).some(i => (typeof i === 'object' ? i.id : i) === stone.id);
    const feeAdena = stone.priceAdena;

    if (!hasStone && (state.gold || 0) < feeAdena) {
      log(`Você precisa de 1x ${stone.name} ou ${feeAdena.toLocaleString()} Adena para o Ferreiro lapidar a pedra.`, 'error');
      return { success: false, reason: 'insufficient_funds' };
    }

    // Consumir recursos
    if (hasStone) {
      const idx = state.inventory.findIndex(i => (typeof i === 'object' ? i.id : i) === stone.id);
      if (idx !== -1) {
        const itm = state.inventory[idx];
        if (typeof itm === 'object' && itm.count && itm.count > 1) {
          itm.count -= 1;
        } else {
          state.inventory.splice(idx, 1);
        }
      }
    } else {
      state.gold -= feeAdena;
    }

    // 1. Rolar 2 atributos aleatórios
    const rolledStats = {};
    const shuffledPool = [...STAT_ROLL_POOL].sort(() => Math.random() - 0.5);
    const selectedStats = shuffledPool.slice(0, 2);

    for (const statDef of selectedStats) {
      const baseVal = Math.floor(statDef.min + Math.random() * (statDef.max - statDef.min + 1));
      const finalVal = Math.round(baseVal * stone.statMultiplier);
      rolledStats[statDef.key] = finalVal;
    }

    // 2. Rolar Glow de Arma
    const hasGlow = Math.random() <= stone.glowChance;
    let glowColor = 'none';
    if (hasGlow) {
      glowColor = stone.grade === 'top' ? 'golden-amber' : (stone.grade === 'high' ? 'radiant-purple' : 'arcane-blue');
    }

    // 3. Rolar Item Skill
    let acquiredSkill = null;
    if (Math.random() <= stone.skillChance) {
      const shuffledSkills = [...ITEM_SKILLS].sort(() => Math.random() - 0.5);
      acquiredSkill = shuffledSkills[0];
    }

    // Gravar a augmentação no objeto da arma
    weaponItem.augmentation = {
      lifeStoneId: stone.id,
      lifeStoneName: stone.name,
      grade: stone.grade,
      stats: rolledStats,
      glow: hasGlow,
      glowColor: glowColor,
      itemSkill: acquiredSkill
    };

    const statSummary = Object.entries(rolledStats)
      .map(([k, v]) => `+${v} ${k.toUpperCase()}`)
      .join(', ');

    const skillText = acquiredSkill ? ` e adquiriu a Habilidade Rara [${acquiredSkill.name}]` : '';
    const glowText = hasGlow ? ` ✨ Concedeu Brilho (${glowColor})!` : '';

    const triumphMsg = `💎 AUGMENTAÇÃO CONCLUÍDA COM SUCESSO! ${weaponItem.name || 'Sua Arma'} recebeu: [${statSummary}]${skillText}${glowText}`;
    log(triumphMsg, 'success');

    onUpdate();
    return {
      success: true,
      augmentation: weaponItem.augmentation
    };
  }

  /**
   * Remove a augmentação de uma arma.
   */
  static removeAugmentation(state, weaponItem, callbacks = {}) {
    const { log = console.log, onUpdate = () => {} } = callbacks;
    const removalFee = 100000;

    if (!weaponItem || !weaponItem.augmentation) {
      log('Esta arma não possui nenhuma Augmentação para ser removida.', 'warning');
      return { success: false, reason: 'not_augmented' };
    }

    if ((state.gold || 0) < removalFee) {
      log(`Adena insuficiente para a taxa do Ferreiro (${removalFee.toLocaleString()} Adena).`, 'error');
      return { success: false, reason: 'gold_low' };
    }

    state.gold -= removalFee;
    delete weaponItem.augmentation;

    log(`🔨 A Augmentação de ${weaponItem.name || 'sua arma'} foi purificada e removida pelo Ferreiro.`, 'info');
    onUpdate();
    return { success: true };
  }

  /**
   * Retorna os bônus acumulados de augmentação da arma equipada.
   */
  static getEquippedAugmentStats(state) {
    const equippedWeapon = state.equipment?.weapon;
    if (!equippedWeapon || !equippedWeapon.augmentation) {
      return { stats: {}, glowColor: 'none', itemSkill: null };
    }

    return {
      stats: equippedWeapon.augmentation.stats || {},
      glowColor: equippedWeapon.augmentation.glowColor || 'none',
      itemSkill: equippedWeapon.augmentation.itemSkill || null
    };
  }
}
