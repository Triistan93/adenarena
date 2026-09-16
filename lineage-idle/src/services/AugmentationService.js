/**
 * AugmentationService.js — Motor de Augmentação de Armas com Life Stones.
 */

import { LIFE_STONES, ITEM_SKILLS, STAT_ROLL_POOL } from '../data/augmentation.js';

export class AugmentationService {
  /**
   * Refina/Augmenta uma arma com uma Life Stone.
   */
  static augmentWeapon(state, weaponItem, lifeStoneId = 'life_stone_28', callbacks = {}) {
    const { log = console.log, onUpdate = () => {} } = callbacks;
    const stone = LIFE_STONES[lifeStoneId] || LIFE_STONES.life_stone_28;

    let weapon = weaponItem;
    if (typeof weapon === 'string') {
      weapon = (state.inventory || []).find(i => (i.id === weapon || i.itemId === weapon)) || (state.equipment && state.equipment[weapon]);
    }

    if (!weapon) {
      log('Selecione uma arma válida para realizar a Augmentação.', 'error');
      return { success: false, reason: 'no_weapon' };
    }

    const isWeapon = weapon.slot === 'weapon' || weapon.type === 'weapon' || String(weapon.id || '').startsWith('weapon_') || String(weapon.itemId || '').startsWith('weapon_');
    if (!isWeapon) {
      log('Apenas armas podem receber o poder das Pedras da Vida (Life Stones).', 'error');
      return { success: false, reason: 'not_a_weapon' };
    }

    if (weapon.augmentation) {
      log('Esta arma já possui uma Augmentação ativa. Remova a anterior com o Ferreiro antes de aplicar uma nova.', 'warning');
      return { success: false, reason: 'already_augmented' };
    }

    // 1. Verificar obrigatoriedade da Life Stone no inventário
    const stoneIdx = (state.inventory || []).findIndex(i => {
      const itId = typeof i === 'object' ? (i.itemId || i.id) : i;
      return itId === stone.id && !i.equipped;
    });

    if (stoneIdx === -1) {
      log(`⚠️ Você precisa de 1x ${stone.name} em seu inventário para que o Ferreiro realize a Augmentação.`, 'error');
      return { success: false, reason: 'missing_life_stone' };
    }

    // 2. Verificar Gemstones / Cristais necessários conforme o grau da pedra
    const reqCrystals = stone.gemstonesNeeded || 5;
    const crystalId = stone.gemstoneGrade === 'C' ? 'crystal_c' : 'crystal_d';
    const crystalIdx = (state.inventory || []).findIndex(i => {
      const itId = typeof i === 'object' ? (i.itemId || i.id) : i;
      return (itId === crystalId || itId === `gemstone_${stone.gemstoneGrade?.toLowerCase()}`) && !i.equipped;
    });
    const crystalItem = crystalIdx !== -1 ? state.inventory[crystalIdx] : null;
    const crystalCount = crystalItem ? (crystalItem.count || 1) : 0;

    if (crystalCount < reqCrystals) {
      log(`⚠️ Gemstones insuficientes! O Ferreiro exige ${reqCrystals}x Cristais/Gemstones Grau ${stone.gemstoneGrade || 'D'} para canalizar a pedra.`, 'error');
      return { success: false, reason: 'insufficient_gemstones' };
    }

    // 3. Verificar taxa de Adena do Ferreiro
    const feeAdena = stone.priceAdena || 25000;
    const currentGold = (state.gold !== undefined ? state.gold : (state.adena || 0));
    if (currentGold < feeAdena) {
      log(`⚠️ Adena insuficiente para a mão de obra do Ferreiro (${feeAdena.toLocaleString()} Adena necessária).`, 'error');
      return { success: false, reason: 'insufficient_funds' };
    }

    // Consumir Life Stone
    const stoneItm = state.inventory[stoneIdx];
    if (typeof stoneItm === 'object' && stoneItm.count && stoneItm.count > 1) {
      stoneItm.count -= 1;
    } else {
      state.inventory.splice(stoneIdx, 1);
    }

    // Consumir Cristais
    if (crystalItem.count && crystalItem.count > reqCrystals) {
      crystalItem.count -= reqCrystals;
    } else if (crystalItem.count === reqCrystals) {
      const curIdx = state.inventory.indexOf(crystalItem);
      if (curIdx !== -1) state.inventory.splice(curIdx, 1);
    } else {
      const curIdx = state.inventory.indexOf(crystalItem);
      if (curIdx !== -1) state.inventory.splice(curIdx, 1);
    }

    // Consumir taxa de Adena
    if (state.gold !== undefined) state.gold -= feeAdena;
    if (state.adena !== undefined) state.adena -= feeAdena;

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
    weapon.augmentation = {
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

    const triumphMsg = `💎 AUGMENTAÇÃO CONCLUÍDA COM SUCESSO! ${weapon.name || 'Sua Arma'} recebeu: [${statSummary}]${skillText}${glowText}`;
    log(triumphMsg, 'success');

    onUpdate();
    return {
      success: true,
      item: weapon,
      augmentation: weapon.augmentation
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
