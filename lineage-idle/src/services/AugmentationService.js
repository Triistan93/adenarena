/**
 * AugmentationService.js — Motor de Augmentação de Armas com Life Stones.
 */

import { LIFE_STONES, ITEM_SKILLS, STAT_ROLL_POOL } from '../data/augmentation.js';
import { CanonicalClassGraph } from '../data/classes/CanonicalClassGraph.js';
import { resolveCanonicalClassId } from '../data/classes/class_aliases.js';

const LEGACY_LIFE_STONE_ALIASES = Object.freeze({
  lifestone_common: 'life_stone_28',
  life_stone_mid: 'life_stone_34',
  lifestone_mid: 'life_stone_34',
  lifestone_high: 'life_stone_40',
  lifestone_top: 'life_stone_top_76'
});

export function getAugmentationGemstoneGrade(level) {
  const stoneLevel = Number(level);
  if (!Number.isFinite(stoneLevel) || stoneLevel < 1) return null;
  if (stoneLevel <= 39) return 'D';
  if (stoneLevel <= 51) return 'C';
  if (stoneLevel <= 61) return 'B';
  if (stoneLevel <= 75) return 'A';
  return 'S';
}

export function getAugmentationRequirements(lifeStoneId) {
  const stone = typeof lifeStoneId === 'string' ? LIFE_STONES[lifeStoneId] : lifeStoneId;
  const gemstoneGrade = getAugmentationGemstoneGrade(stone?.level);
  if (!stone || !gemstoneGrade) return null;
  return {
    gemstoneGrade,
    gemstonesNeeded: Number(stone.gemstonesNeeded) || 5,
    adena: Number(stone.priceAdena) || 25000
  };
}

export function getAugmentationSkillPool(classId) {
  const canonicalId = resolveCanonicalClassId(String(classId || '')) || classId;
  const classNode = CanonicalClassGraph.getClassNode(canonicalId);
  const archetype = classNode?.archetypeGroup;
  if (!archetype) return [];
  return ITEM_SKILLS.filter(skill => skill.allowedArchetypes?.includes(archetype));
}

function scaleRolledSkill(skill, multiplier) {
  if (!skill) return null;
  const scale = Number(multiplier);
  if (!Number.isFinite(scale) || scale <= 0 || scale === 1) return structuredClone(skill);
  const scaled = structuredClone(skill);
  scaled.powerMultiplier = scale;
  scaled.stats = Object.fromEntries(Object.entries(skill.stats || {}).map(([key, rawValue]) => {
    const value = Number(rawValue);
    if (!Number.isFinite(value)) return [key, rawValue];
    const scaledValue = value * scale;
    const isRatio = /percent|chance/i.test(key);
    return [key, isRatio ? Math.round(scaledValue * 10000) / 10000 : Math.round(scaledValue)];
  }));
  return scaled;
}

export function getEquippedAugmentationSkills(state) {
  const skills = [];
  for (const slot of ['weapon', 'weapon2']) {
    const equipped = state?.equipment?.[slot];
    const item = typeof equipped === 'object'
      ? equipped
      : state?.inventory?.find(entry => entry?.uid === equipped);
    const skill = item?.augmentation?.itemSkill;
    if (skill && !skills.some(existing => existing.id === skill.id)) skills.push(skill);
  }
  return skills;
}

export function getAugmentationStunChancePercent(state) {
  return getEquippedAugmentationSkills(state).reduce((total, skill) => {
    const chance = Number(skill.stats?.stunChance) || 0;
    return total + (chance > 0 && chance <= 1 ? chance * 100 : chance);
  }, 0);
}

export function processAugmentationCombatTick(state, now = Date.now()) {
  if (!state || !state.isCombatActive) return [];
  state.buffs ||= {};
  state._augmentationSkillCooldowns ||= {};
  const activated = [];
  for (const skill of getEquippedAugmentationSkills(state)) {
    if (skill.type !== 'active') continue;
    const cooldownUntil = Number(state._augmentationSkillCooldowns[skill.id]) || 0;
    if (now < cooldownUntil) continue;
    const skillStats = skill.stats || {};
    if (skillStats.instantHeal) {
      const maxHp = Number(state.maxHp) || Number(state.stats?.maxHp) || 0;
      if (!maxHp || state.hp >= maxHp * 0.70) continue;
      const healed = Math.min(maxHp - (Number(state.hp) || 0), Number(skillStats.instantHeal));
      state.hp = (Number(state.hp) || 0) + healed;
      state._augmentationSkillCooldowns[skill.id] = now + (skill.cooldownMs || 60000);
      activated.push({ id: skill.id, healed });
      continue;
    }
    const existingBuff = state.buffs[skill.id];
    if (existingBuff?.until > now) continue;
    const durationMs = Number(skill.durationMs) || 15000;
    state.buffs[skill.id] = {
      until: now + durationMs,
      augmentationStats: skillStats,
      source: 'weapon_augmentation'
    };
    state._augmentationSkillCooldowns[skill.id] = now + (Number(skill.cooldownMs) || 60000);
    activated.push({ id: skill.id, until: now + durationMs });
  }
  return activated;
}

export class AugmentationService {
  /**
   * Refina/Augmenta uma arma com uma Life Stone.
   */
  static augmentWeapon(state, weaponItem, lifeStoneId = 'life_stone_28', callbacks = {}) {
    const { log = console.log, onUpdate = () => {} } = callbacks;
    const stone = LIFE_STONES[lifeStoneId];
    if (!stone) {
      log('Pedra da Vida inválida para augmentação.', 'error');
      return { success: false, reason: 'invalid_life_stone' };
    }

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
      return (itId === stone.id || LEGACY_LIFE_STONE_ALIASES[itId] === stone.id) && !i.equipped;
    });

    if (stoneIdx === -1) {
      log(`⚠️ Você precisa de 1x ${stone.name} em seu inventário para que o Ferreiro realize a Augmentação.`, 'error');
      return { success: false, reason: 'missing_life_stone' };
    }

    // 2. Verificar Gemstones / Cristais necessários conforme o grau da pedra
    const requirements = getAugmentationRequirements(stone);
    if (!requirements) return { success: false, reason: 'invalid_life_stone_level' };
    const { gemstonesNeeded: reqCrystals, gemstoneGrade } = requirements;
    const gradeKey = gemstoneGrade.toLowerCase();
    const gemstoneId = `gemstone_${gradeKey}`;
    const crystalItems = (state.inventory || []).filter(i => {
      const itId = typeof i === 'object' ? (i.itemId || i.id) : i;
      return typeof i === 'object'
        && itId === gemstoneId
        && !i.equipped;
    });
    const crystalCount = crystalItems.reduce((total, item) => total + (Number(item.count) || 1), 0);

    if (crystalCount < reqCrystals) {
      log(`⚠️ Gemstones insuficientes! O Ferreiro exige ${reqCrystals}x Gemstone ${gemstoneGrade} para canalizar a pedra.`, 'error');
      return { success: false, reason: 'insufficient_gemstones' };
    }

    // 3. Verificar taxa de Adena do Ferreiro
    const feeAdena = requirements.adena;
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
    let crystalsToConsume = reqCrystals;
    for (const crystalItem of crystalItems) {
      if (crystalsToConsume <= 0) break;
      const available = Number(crystalItem.count) || 1;
      const consumed = Math.min(available, crystalsToConsume);
      if (available > consumed) {
        crystalItem.count = available - consumed;
      } else {
        const curIdx = state.inventory.indexOf(crystalItem);
        if (curIdx !== -1) state.inventory.splice(curIdx, 1);
      }
      crystalsToConsume -= consumed;
    }

    // Consumir taxa de Adena
    if (state.gold !== undefined) state.gold -= feeAdena;
    else if (state.adena !== undefined) state.adena -= feeAdena;

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
      const eligibleSkills = getAugmentationSkillPool(state.class);
      const shuffledSkills = eligibleSkills.sort(() => Math.random() - 0.5);
      acquiredSkill = scaleRolledSkill(shuffledSkills[0], stone.statMultiplier);
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
