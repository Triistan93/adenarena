/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ELEMENTAL SERVICE — NÍVEL 17: SOUL CRYSTALS & ATRIBUTOS ELEMENTAIS
 * ═══════════════════════════════════════════════════════════════════════════
 * Gerencia o sistema canônico de Encrustação de Lineage 2:
 * 1. Atributos Elementais (Fogo, Água, Vento, Terra, Sagrado, Trevas)
 * 2. Gating e Tetos por Grau de Equipamento (C/B: 60, A: 150, S: 300 Arma / 120 Armadura)
 * 3. Soul Crystals com suporte a Armas Primárias e Secundárias (Dual Arsenal)
 * 4. Sinergia em Combate (Vantagem Oposta, Dano Sagrado vs Undead, Defesa Elemental)
 * 5. Regra de Migração 17.4 (Valores excedentes são preservados sem downgrade)
 */

import { D } from '../core/GameConfig.js';

export const ELEMENT_DEFINITIONS = {
  fire: {
    key: 'fire',
    name: 'Fogo',
    icon: '🔥',
    color: '#ef4444',
    opposed: 'water',
    stoneId: 'fire_stone',
    desc: 'Amplifica dano contra seres de Água (+20%). Reduz dano contra fogo (-20%).',
    dropZone: 'Forge of the Gods (Lv.70+)'
  },
  water: {
    key: 'water',
    name: 'Água',
    icon: '💧',
    color: '#3b82f6',
    opposed: 'fire',
    stoneId: 'water_stone',
    desc: 'Amplifica dano contra seres de Fogo (+20%). Reduz dano contra água (-20%).',
    dropZone: 'Garden of Eva (Lv.45+)'
  },
  wind: {
    key: 'wind',
    name: 'Vento',
    icon: '🌪️',
    color: '#22c55e',
    opposed: 'earth',
    stoneId: 'wind_stone',
    desc: 'Amplifica dano contra seres de Terra (+20%). Reduz dano contra vento (-20%).',
    dropZone: 'Dragon Valley (Lv.55+)'
  },
  earth: {
    key: 'earth',
    name: 'Terra',
    icon: '🌍',
    color: '#d97706',
    opposed: 'wind',
    stoneId: 'earth_stone',
    desc: 'Amplifica dano contra seres de Vento (+20%). Reduz dano contra terra (-20%).',
    dropZone: 'Mithril Mines (Lv.35+)'
  },
  holy: {
    key: 'holy',
    name: 'Sagrado',
    icon: '✨',
    color: '#eab308',
    opposed: 'dark',
    stoneId: 'holy_stone',
    desc: 'Amplifica dano contra Mortos-Vivos, Necrópoles e Demônios (+30%).',
    dropZone: 'Monastery of Silence (Lv.75+)'
  },
  dark: {
    key: 'dark',
    name: 'Trevas',
    icon: '🌑',
    color: '#a855f7',
    opposed: 'holy',
    stoneId: 'dark_stone',
    desc: 'Amplifica dano contra seres Sagrados e Celestes (+20%).',
    dropZone: 'Imperial Tomb / Crypts (Lv.70+)'
  }
};

export const ELEMENTAL_GRADE_GATING = {
  s: { minLevel: 76, maxCapWeapon: 300, maxCapArmor: 120, stoneCost: 250000, label: 'Grau S' },
  a: { minLevel: 61, maxCapWeapon: 150, maxCapArmor: 60, stoneCost: 100000, label: 'Grau A' },
  b: { minLevel: 52, maxCapWeapon: 60, maxCapArmor: 30, stoneCost: 50000, label: 'Grau B' },
  c: { minLevel: 40, maxCapWeapon: 60, maxCapArmor: 30, stoneCost: 30000, label: 'Grau C' }
};

export const SOUL_CRYSTAL_GRADE_GATING = {
  s: { minLevel: 76, adenaCost: 500000, label: 'Grau S' },
  a: { minLevel: 61, adenaCost: 250000, label: 'Grau A' },
  b: { minLevel: 52, adenaCost: 100000, label: 'Grau B' },
  c: { minLevel: 40, adenaCost: 50000, label: 'Grau C' },
  d: { minLevel: 20, adenaCost: 20000, label: 'Grau D' }
};

export const SA_RUNES = {
  red: {
    focus: { key: 'focus', name: 'Focus', stat: 'crit', baseVal: 35, desc: 'Aumenta a Taxa de Crítico Físico' },
    might: { key: 'might', name: 'Might', stat: 'patk', baseVal: 0.12, desc: 'Aumenta o Poder de Ataque Físico' }
  },
  green: {
    acumen: { key: 'acumen', name: 'Acumen', stat: 'castSpd', baseVal: 0.15, desc: 'Aumenta a Velocidade de Conjuração Mágica' },
    health: { key: 'health', name: 'Health', stat: 'hp', baseVal: 0.20, desc: 'Aumenta a Vida Máxima (HP)' }
  },
  blue: {
    empower: { key: 'empower', name: 'Empower', stat: 'matk', baseVal: 0.15, desc: 'Aumenta o Poder de Ataque Mágico' },
    guidance: { key: 'guidance', name: 'Guidance', stat: 'accuracy', baseVal: 4, desc: 'Aumenta a Precisão e Reduz Falhas' }
  }
};

/**
 * Identifica o Grau de um item com fallback gracioso.
 */
export function getItemGrade(item) {
  if (!item) return 'none';
  const gData = D();
  const def = gData?.ALL_ITEMS?.[item.itemId || item.id] || item;
  const rawGrade = String(item.grade || def?.grade || '').toLowerCase();
  if (['s', 'a', 'b', 'c', 'd'].includes(rawGrade)) return rawGrade;
  
  // Detecção por tier de nível do item
  const lvlReq = Number(item.reqLvl || def?.reqLvl || def?.level || 1);
  if (lvlReq >= 76) return 's';
  if (lvlReq >= 61) return 'a';
  if (lvlReq >= 52) return 'b';
  if (lvlReq >= 40) return 'c';
  if (lvlReq >= 20) return 'd';
  return 'none';
}

/**
 * Retorna as regras de gating e teto elemental para um item.
 */
export function getElementalGating(item) {
  const grade = getItemGrade(item);
  const gating = ELEMENTAL_GRADE_GATING[grade];
  if (!gating) {
    return {
      eligible: false,
      grade,
      minLevel: 40,
      maxCapWeapon: 0,
      maxCapArmor: 0,
      stoneCost: 0,
      label: grade === 'd' ? 'Grau D (Incapaz de Conter Elementos)' : 'Sem Grau (Incapaz de Conter Elementos)'
    };
  }

  const gData = D();
  const def = gData?.ALL_ITEMS?.[item.itemId || item.id] || item;
  const slot = def?.slot || item.slot;
  const isWeapon = slot === 'weapon' || slot === 'weapon2';

  return {
    eligible: true,
    grade,
    minLevel: gating.minLevel,
    maxCap: isWeapon ? gating.maxCapWeapon : gating.maxCapArmor,
    maxCapWeapon: gating.maxCapWeapon,
    maxCapArmor: gating.maxCapArmor,
    stoneCost: gating.stoneCost,
    label: gating.label,
    isWeapon
  };
}

/**
 * Aplica infusão elemental em armas ou armaduras respeitando tetos, nível e custo.
 * 17.4 Migration: Não rebaixa atributos de itens que já possuem valor acima do teto,
 * mas bloqueia novas adições até que o nível/grau correspondente seja atingido.
 */
export function applyElementalInfusion(state, equipUid, elementKey = 'fire', callbacks = {}) {
  const inv = state.inventory || [];
  const item = inv.find(i => i.uid === equipUid || i.id === equipUid);
  if (!item) {
    if (callbacks.log) callbacks.log('Item não encontrado para infusão elemental.', 'system');
    return false;
  }

  const gData = D();
  const def = gData?.ALL_ITEMS?.[item.itemId || item.id] || item;
  const slot = def?.slot || item.slot;
  const validSlots = ['weapon', 'weapon2', 'armor', 'chest', 'legs', 'head', 'helmet', 'gloves', 'boots', 'shield'];
  if (!validSlots.includes(slot)) {
    if (callbacks.log) callbacks.log('Apenas armas, armaduras e escudos podem ser imbuídos com elementos!', 'system');
    return false;
  }

  const gating = getElementalGating(item);
  if (!gating.eligible) {
    if (callbacks.log) callbacks.log(`Equipamentos de ${gating.label} não suportam infusão elemental. Requer Grau C ou superior.`, 'system');
    return false;
  }

  const playerLvl = Number(state.level || 1);
  if (playerLvl < gating.minLevel) {
    if (callbacks.log) callbacks.log(`Nível insuficiente! Itens de ${gating.label} requerem Nível ${gating.minLevel}+ para infusão elemental.`, 'system');
    return false;
  }

  const currentVal = Number(item.elementalAttribute?.val || 0);
  const currentElem = item.elementalAttribute?.element || 'none';

  // Regra de Migração 17.4: Se já tem valor igual ou superior ao teto, não reduz mas trava novos ganhos
  if (currentVal >= gating.maxCap) {
    if (callbacks.log) callbacks.log(`Este equipamento já atingiu o limite de +${gating.maxCap} para o ${gating.label}!`, 'system');
    return false;
  }

  // Se o item já tem outro elemento diferente, canonicamente no L2 precisa ser limpo ou sobreposto
  if (currentElem !== 'none' && currentElem !== elementKey && currentVal > 0) {
    if (callbacks.log) callbacks.log(`Este item já possui o elemento [${currentElem.toUpperCase()}]. Limpe o atributo anterior antes de imbuir ${elementKey.toUpperCase()}.`, 'system');
    return false;
  }

  // Custo em Adena
  const cost = gating.stoneCost;
  if ((state.gold || 0) < cost) {
    if (callbacks.log) callbacks.log(`Adena insuficiente! Requer ${cost.toLocaleString()} Adena para a infusão elemental.`, 'system');
    return false;
  }

  // Consumo opcional de Pedra Elemental do inventário (se existir)
  const elemDef = ELEMENT_DEFINITIONS[elementKey] || ELEMENT_DEFINITIONS.fire;
  const stoneIdx = inv.findIndex(i => (i.itemId === elemDef.stoneId || i.id === elemDef.stoneId) && !i.equipped && (i.count || 1) > 0);
  if (stoneIdx !== -1) {
    if ((inv[stoneIdx].count || 1) > 1) {
      inv[stoneIdx].count--;
    } else {
      inv.splice(stoneIdx, 1);
    }
  }

  state.gold -= cost;

  const isWeapon = slot === 'weapon' || slot === 'weapon2';
  const step = isWeapon ? 20 : 6;
  const newVal = Math.min(gating.maxCap, currentVal + step);

  item.elementalAttribute = {
    element: elementKey,
    val: newVal
  };

  if (callbacks.log) {
    callbacks.log(`✨ ALQUIMIA ELEMENTAL: ${item.name || def.name} imbuído com +${step} de ${elemDef.name} ${elemDef.icon}! (${newVal}/${gating.maxCap})`, 'rarity-epic');
  }

  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save();
  return true;
}

/**
 * Remove atributo elemental de um item (Reset).
 */
export function removeElementalInfusion(state, equipUid, callbacks = {}) {
  const inv = state.inventory || [];
  const item = inv.find(i => i.uid === equipUid || i.id === equipUid);
  if (!item || !item.elementalAttribute || item.elementalAttribute.val <= 0) return false;

  const resetCost = 25000;
  if ((state.gold || 0) < resetCost) {
    if (callbacks.log) callbacks.log(`Adena insuficiente para purificação elemental. Requer ${resetCost.toLocaleString()} Adena.`, 'system');
    return false;
  }

  state.gold -= resetCost;
  const oldElem = item.elementalAttribute.element;
  item.elementalAttribute = { element: 'none', val: 0 };

  if (callbacks.log) {
    callbacks.log(`🌊 PURIFICAÇÃO: O atributo [${oldElem.toUpperCase()}] foi removido com sucesso de ${item.name || item.itemId}.`, 'system');
  }

  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save();
  return true;
}

/**
 * Engaste de Soul Crystal (SA) em qualquer arma (Primária, Secundária ou Mochila).
 */
export function applySoulCrystalToWeapon(state, weaponUid, color = 'red', saKey = 'focus', callbacks = {}) {
  const inv = state.inventory || [];
  const item = inv.find(i => i.uid === weaponUid || i.id === weaponUid);
  if (!item) {
    if (callbacks.log) callbacks.log('Arma não encontrada para engaste de Soul Crystal.', 'system');
    return false;
  }

  const gData = D();
  const def = gData?.ALL_ITEMS?.[item.itemId || item.id] || item;
  const slot = def?.slot || item.slot;
  if (slot !== 'weapon' && slot !== 'weapon2') {
    if (callbacks.log) callbacks.log('Soul Crystals só podem ser engastados em armas (Primária ou Secundária)!', 'system');
    return false;
  }

  const grade = getItemGrade(item);
  const gating = SOUL_CRYSTAL_GRADE_GATING[grade] || SOUL_CRYSTAL_GRADE_GATING.d;
  const playerLvl = Number(state.level || 1);

  if (playerLvl < gating.minLevel) {
    if (callbacks.log) callbacks.log(`Nível insuficiente! Armas de ${gating.label} requerem Nível ${gating.minLevel}+ para engastar Soul Crystals.`, 'system');
    return false;
  }

  const adenaCost = gating.adenaCost;
  if ((state.gold || 0) < adenaCost) {
    if (callbacks.log) callbacks.log(`Adena insuficiente! Requer ${adenaCost.toLocaleString()} Adena para engastar o Soul Crystal nesta arma.`, 'system');
    return false;
  }

  const saGroup = SA_RUNES[color];
  const saBonus = saGroup?.[saKey] || Object.values(saGroup || {})[0];
  if (!saBonus) return false;

  // Busca cristal no inventário
  const crystalIdx = inv.findIndex(i => (i.itemId?.startsWith('soul_crystal_') || i.isSoulCrystal) && !i.equipped);
  const crystalLevel = crystalIdx !== -1 ? (inv[crystalIdx].stage || inv[crystalIdx].crystalLevel || 1) : 1;

  if (crystalIdx !== -1) {
    inv.splice(crystalIdx, 1); // Consome o cristal utilizado
  }

  state.gold -= adenaCost;

  // Escala de poder por nível do cristal (Nível 1 = 50%, Nível 10 = 85%, Nível 15 = 120%)
  const powerScale = 0.50 + (crystalLevel * 0.05);
  const finalVal = typeof saBonus.baseVal === 'number'
    ? (saBonus.baseVal > 1 ? Math.round(saBonus.baseVal * powerScale) : parseFloat((saBonus.baseVal * powerScale).toFixed(3)))
    : saBonus.baseVal;

  item.soulCrystal = {
    color,
    key: saKey,
    name: saBonus.name,
    level: crystalLevel,
    desc: `${saBonus.desc} (+${typeof finalVal === 'number' && finalVal < 1 ? (finalVal * 100).toFixed(0) + '%' : finalVal})`,
    stat: saBonus.stat,
    val: finalVal
  };

  if (callbacks.log) {
    callbacks.log(`🔮 SPECIAL ABILITY CONCEDIDA (Lv.${crystalLevel}): ${item.name || def.name} recebeu [SA: ${saBonus.name}]! (${item.soulCrystal.desc})`, 'rarity-legendary');
  }

  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save();
  return true;
}

/**
 * Remove SA de uma arma.
 */
export function removeSoulCrystalFromWeapon(state, weaponUid, callbacks = {}) {
  const inv = state.inventory || [];
  const item = inv.find(i => i.uid === weaponUid || i.id === weaponUid);
  if (!item || !item.soulCrystal) return false;

  const cost = 20000;
  if ((state.gold || 0) < cost) {
    if (callbacks.log) callbacks.log(`Adena insuficiente! Requer ${cost.toLocaleString()} Adena para extrair o Soul Crystal.`, 'system');
    return false;
  }

  state.gold -= cost;
  const oldSa = item.soulCrystal.name;
  item.soulCrystal = null;

  if (callbacks.log) {
    callbacks.log(`🧹 Soul Crystal [${oldSa}] extraído de ${item.name || item.itemId}.`, 'system');
  }

  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save();
  return true;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CÁLCULO DE COMBATE ELEMENTAL (OFENSIVO & DEFENSIVO)
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Calcula o multiplicador elemental do ataque do jogador contra o monstro.
 * Considera Arma Primária + Arma Secundária (Dual Arsenal +50% contribuição).
 */
export function calculatePlayerElementalDamage(state, monster, rawDamage = 100) {
  const inv = state.inventory || [];
  const wpn1 = state.equipment?.weapon ? inv.find(i => i.uid === state.equipment.weapon) : null;
  const wpn2 = state.equipment?.weapon2 ? inv.find(i => i.uid === state.equipment.weapon2) : null;

  const elem1 = wpn1?.elementalAttribute || { element: 'none', val: 0 };
  const elem2 = wpn2?.elementalAttribute || { element: 'none', val: 0 };

  // Se nenhuma arma tiver elemento
  if ((elem1.val <= 0 || elem1.element === 'none') && (elem2.val <= 0 || elem2.element === 'none')) {
    return { finalDamage: rawDamage, multiplier: 1.0, element: 'none', bonusText: null };
  }

  // Determina elemento predominante e valor efetivo
  let activeElement = 'none';
  let totalEffectiveVal = 0;

  if (elem1.val > 0 && elem1.element !== 'none') {
    activeElement = elem1.element;
    totalEffectiveVal += elem1.val;
    // Se a secundária compartilha o mesmo elemento, soma com 50% de eficiência
    if (elem2.element === elem1.element) {
      totalEffectiveVal += Math.floor(elem2.val * 0.5);
    }
  } else if (elem2.val > 0 && elem2.element !== 'none') {
    activeElement = elem2.element;
    totalEffectiveVal += Math.floor(elem2.val * 0.75); // Secundária liderando o elemento
  }

  if (totalEffectiveVal <= 0 || activeElement === 'none') {
    return { finalDamage: rawDamage, multiplier: 1.0, element: 'none', bonusText: null };
  }

  // Bônus base de poder elemental (até +40% no teto de 300)
  let elemMult = 1.0 + ((Math.min(300, totalEffectiveVal) / 300) * 0.40);
  let bonusText = null;

  const monElem = monster?.element || (monster?.category === 'undead' || monster?.isUndead ? 'dark' : null);
  const defElem = ELEMENT_DEFINITIONS[activeElement];

  if (monElem && defElem) {
    // Vantagem de Oposição canônica L2 (+20%)
    if (defElem.opposed === monElem) {
      elemMult += 0.20;
      bonusText = `💥 OPOSIÇÃO ELEMENTAL (+20% ${activeElement.toUpperCase()} vs ${monElem.toUpperCase()})!`;
    }
    // Especial Sagrado vs Dark / Undead / Demônios (+30%)
    else if (activeElement === 'holy' && (monElem === 'dark' || monster?.category === 'undead' || monster?.category === 'demon')) {
      elemMult += 0.30;
      bonusText = `✨ EXPURGO SAGRADO (+30% vs MORTOS-VIVOS)!`;
    }
    // Penalidade se atacar mesmo elemento (-20%)
    else if (activeElement === monElem) {
      elemMult = Math.max(0.60, elemMult - 0.20);
      bonusText = `🛡️ RESISTÊNCIA ELEMENTAL (-20% Mesmo Elemento)`;
    }
  }

  const finalDamage = Math.floor(rawDamage * elemMult);
  return {
    finalDamage,
    multiplier: elemMult,
    element: activeElement,
    effectiveVal: totalEffectiveVal,
    bonusText
  };
}

/**
 * Calcula a redução de dano recebido pelo jogador com base nos atributos de suas armaduras.
 */
export function calculateArmorElementalMitigation(state, monster, incomingDamage = 100) {
  if (!state.equipment) return incomingDamage;

  const inv = state.inventory || [];
  const armorSlots = ['armor', 'chest', 'legs', 'helmet', 'gloves', 'boots', 'shield'];
  
  // Agrega resistência elemental por elemento
  const elemResist = { fire: 0, water: 0, wind: 0, earth: 0, holy: 0, dark: 0 };
  let totalResist = 0;

  for (const slot of armorSlots) {
    const uid = state.equipment[slot];
    if (!uid) continue;
    const item = inv.find(i => i.uid === uid);
    if (item?.elementalAttribute?.val > 0 && item.elementalAttribute.element !== 'none') {
      const eKey = item.elementalAttribute.element;
      if (elemResist[eKey] !== undefined) {
        elemResist[eKey] += item.elementalAttribute.val;
        totalResist += item.elementalAttribute.val;
      }
    }
  }

  if (totalResist <= 0) return incomingDamage;

  const monElem = monster?.element || (monster?.category === 'undead' ? 'dark' : null);
  let mitigationPct = 0;

  if (monElem && elemResist[monElem] > 0) {
    // No canon de L2, ter atributo do mesmo elemento na armadura concede resistência direta àquele elemento
    const specificVal = elemResist[monElem];
    // Até 40% de mitigação contra o elemento específico (teto de 240 resist)
    mitigationPct = Math.min(0.40, (specificVal / 240) * 0.40);
  } else {
    // Redução geral suave para qualquer dano
    mitigationPct = Math.min(0.20, (totalResist / 600) * 0.20);
  }

  return Math.max(1, Math.floor(incomingDamage * (1 - mitigationPct)));
}

export const ElementalService = {
  ELEMENT_DEFINITIONS,
  ELEMENTAL_GRADE_GATING,
  SOUL_CRYSTAL_GRADE_GATING,
  SA_RUNES,
  getItemGrade,
  getElementalGating,
  applyElementalInfusion,
  removeElementalInfusion,
  applySoulCrystalToWeapon,
  removeSoulCrystalFromWeapon,
  calculatePlayerElementalDamage,
  calculateArmorElementalMitigation
};

export default ElementalService;
