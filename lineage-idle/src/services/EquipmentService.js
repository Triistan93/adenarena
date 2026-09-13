import { D, ALL_EQUIP_SLOTS } from '../core/GameConfig.js';
import { getStats } from '../engine/StatsEngine.js';
import { canEquipByType } from '../data/items/item_class_rules.js';
import { detectItemWeaponType } from '../engine/SkillEngine.js';
import { isMageClass } from './SkillEligibility.js';
import { CombatPowerService } from './CombatPowerService.js';
import { CP_WEIGHTS } from '../data/balance/cpBalance.js';
import { isEquippableItem } from './ItemClassificationService.js';

export function resolveEquipSlot(rawSlot, equipmentState = {}, preferredSlot = null) {
  if (preferredSlot && ALL_EQUIP_SLOTS.includes(preferredSlot)) {
    return preferredSlot;
  }

  const slot = String(rawSlot || '').trim().toLowerCase();
  const firstEmpty = (...candidates) => {
    const valid = candidates.filter(c => ALL_EQUIP_SLOTS.includes(c));
    return valid.find(c => !equipmentState?.[c]) || valid[0] || candidates[0];
  };

  if (slot === 'weapon' || slot === 'sword' || slot === 'bow' || slot === 'dagger' || slot === 'blunt' || slot === 'staff' || slot === 'spear' || slot === 'dual' || slot === 'twohand') {
    return firstEmpty('weapon', 'weapon2');
  }

  if (slot === 'earring' || slot === 'earrings') return firstEmpty('earring1', 'earring2');
  if (slot === 'ring' || slot === 'rings') return firstEmpty('ring1', 'ring2');
  if (slot === 'hair' || slot === 'headgear') return firstEmpty('hair1', 'hair2');
  if (slot === 'agathion') return firstEmpty('agathion1', 'agathion2', 'agathion3', 'agathion4', 'agathion5', 'agathion6');
  if (slot === 'jewel') return firstEmpty('jewel1', 'jewel2', 'jewel3', 'jewel4', 'jewel5', 'jewel6');
  if (slot === 'talisman') return firstEmpty('talisman1', 'talisman2', 'talisman3', 'talisman4', 'talisman5', 'talisman6');

  const ALIAS = {
    sword: 'weapon', bow: 'weapon', dagger: 'weapon', blunt: 'weapon', staff: 'weapon',
    armor: 'chest', chest: 'chest', body: 'chest', breastplate: 'chest', robe: 'chest',
    helm: 'helmet', head: 'helmet', glove: 'gloves', hands: 'gloves',
    boot: 'boots', feet: 'boots', pants: 'legs', gaiters: 'legs',
    offhand: 'shield', sigil: 'shield', cape: 'cloak', back: 'cloak',
    waist: 'belt', neck: 'necklace', ring: 'ring1', ring1: 'ring1', ring2: 'ring2',
    hair: 'hair1', hair1: 'hair1', hair2: 'hair2', mask: 'hair2',
    agathion_bracelet: 'agathion_bracelet', talisman_bracelet: 'talisman_bracelet', brooch: 'brooch'
  };
  const mapped = ALIAS[slot] || slot;
  return ALL_EQUIP_SLOTS.includes(mapped) ? mapped : slot;
}

export function migrateEquipmentSlots(state) {
  if (!state?.equipment) return;
  if (state.equipment.armor && !state.equipment.chest) state.equipment.chest = state.equipment.armor;
  if (state.equipment.chest && !state.equipment.armor) state.equipment.armor = state.equipment.chest;
  if (state.equipment.head && !state.equipment.helmet) state.equipment.helmet = state.equipment.head;
  if ((state.equipment.offhand || state.equipment.sigil) && !state.equipment.shield) {
    state.equipment.shield = state.equipment.offhand || state.equipment.sigil;
  }
  if (state.equipment.dual && !state.equipment.weapon2) state.equipment.weapon2 = state.equipment.dual;
  if (state.equipment.earring && !state.equipment.earring1) state.equipment.earring1 = state.equipment.earring;
  if (state.equipment.ring && !state.equipment.ring1) state.equipment.ring1 = state.equipment.ring;
  if (state.equipment.hair && !state.equipment.hair1) state.equipment.hair1 = state.equipment.hair;
  if (state.equipment.cape && !state.equipment.cloak) state.equipment.cloak = state.equipment.cape;
  if (state.equipment.talisman && !state.equipment.talisman_bracelet) state.equipment.talisman_bracelet = state.equipment.talisman;
  if (state.equipment.agathion && !state.equipment.agathion_bracelet) state.equipment.agathion_bracelet = state.equipment.agathion;
  delete state.equipment.head;
  delete state.equipment.offhand;
  delete state.equipment.sigil;
  delete state.equipment.dual;
  delete state.equipment.earring;
  delete state.equipment.ring;
  delete state.equipment.hair;
  delete state.equipment.cape;
  delete state.equipment.talisman;
  delete state.equipment.agathion;
}

export function equipItem(state, uid, targetSlotOrCallbacks = null, maybeCallbacks = {}) {
  let explicitSlot = (typeof targetSlotOrCallbacks === 'string') ? targetSlotOrCallbacks : null;
  let callbacks = (typeof targetSlotOrCallbacks === 'object' && targetSlotOrCallbacks !== null) ? targetSlotOrCallbacks : maybeCallbacks;

  const item = state.inventory.find(i => i.uid === uid);
  if (!item) return;
  const def = D()?.ALL_ITEMS?.[item.itemId];
  if (!def) return;
  migrateEquipmentSlots(state);

  const targetSlot = explicitSlot || resolveEquipSlot(def.slot, state.equipment);

  // Validate level
  if (def.req?.level && state.level < def.req.level) {
    if (callbacks.log) callbacks.log(`Nível insuficiente para equipar ${def.name}. (Req: Lv.${def.req.level})`, 'system');
    return;
  }
  // Validate class / armor type
  const equipCheck = canEquipByType(state.class, def, callbacks.classSatisfies);
  if (!equipCheck.ok) {
    if (callbacks.log) callbacks.log(`Não pode equipar ${def.name}: ${equipCheck.reason || 'Classe incompatível'}`, 'system');
    return;
  }
  if (!ALL_EQUIP_SLOTS.includes(targetSlot)) {
    if (callbacks.log) callbacks.log(`${def.name} não pode ser equipado.`, 'system');
    return;
  }

  // Se o item já estava equipado em outro slot (ex: weapon2 trocando para weapon), limpa o slot anterior
  for (const slotKey of ALL_EQUIP_SLOTS) {
    if (state.equipment[slotKey] === uid && slotKey !== targetSlot) {
      state.equipment[slotKey] = null;
    }
  }

  const currentUid = state.equipment[targetSlot];
  if (currentUid && currentUid !== uid) {
    const current = state.inventory.find(i => i.uid === currentUid);
    if (current) current.equipped = false;
  }

  state.equipment[targetSlot] = uid;
  if (targetSlot === 'chest') state.equipment.armor = uid;
  if (targetSlot === 'armor') state.equipment.chest = uid;
  item.equipped = true;
  item.equippedSlot = targetSlot;

  const slotLabel = targetSlot === 'weapon2' ? 'Arma Secundária (Slot 2)' : (targetSlot === 'weapon' ? 'Arma Primária (Slot 1)' : targetSlot);
  if (callbacks.log) callbacks.log(`Equipou ${def.name} [${slotLabel}]`, 'loot');

  const stats = getStats(state);
  state.maxHp = stats.maxHp; state.maxMp = stats.maxMp;
  state.hp = Math.min(state.hp, state.maxHp); state.mp = Math.min(state.mp, state.maxMp);
  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save(true, true);
}

export function unequipItem(state, slotOrUid, callbacks = {}) {
  if (!state || !state.equipment) return;
  migrateEquipmentSlots(state);

  let targetSlot = null;
  let uid = null;

  // 1. Direct match by equipment slot key
  if (typeof slotOrUid === 'string' && state.equipment[slotOrUid]) {
    targetSlot = slotOrUid;
    uid = state.equipment[slotOrUid];
  }

  // 2. Match by UID in equipment
  if (!targetSlot) {
    for (const [s, u] of Object.entries(state.equipment)) {
      if (u && (u === slotOrUid || String(u) === String(slotOrUid))) {
        targetSlot = s;
        uid = u;
        break;
      }
    }
  }

  // 3. Generic slot names (e.g. 'ring', 'earring', 'hair', 'weapon')
  if (!targetSlot && typeof slotOrUid === 'string') {
    const candidateSlots = slotOrUid === 'ring' ? ['ring1', 'ring2']
      : slotOrUid === 'earring' ? ['earring1', 'earring2']
      : slotOrUid === 'hair' ? ['hair1', 'hair2']
      : slotOrUid === 'weapon' ? ['weapon', 'weapon2']
      : [slotOrUid];
    for (const s of candidateSlots) {
      if (state.equipment[s]) {
        targetSlot = s;
        uid = state.equipment[s];
        break;
      }
    }
  }

  // 4. Match by item object or inventory lookup
  if (!targetSlot && state.inventory) {
    const targetItem = state.inventory.find(i => i && (i.uid === slotOrUid || i === slotOrUid));
    if (targetItem) {
      for (const [s, u] of Object.entries(state.equipment)) {
        if (u === targetItem.uid) {
          targetSlot = s;
          uid = u;
          break;
        }
      }
    }
  }

  if (!targetSlot || !uid) return;

  const item = (state.inventory || []).find(i => i.uid === uid);
  if (item) {
    item.equipped = false;
    delete item.equippedSlot;
  }
  state.equipment[targetSlot] = null;
  if (targetSlot === 'chest') state.equipment.armor = null;
  if (targetSlot === 'armor') state.equipment.chest = null;
  const stats = getStats(state);
  state.maxHp = stats.maxHp;
  state.maxMp = stats.maxMp;
  state.hp = Math.min(state.hp, state.maxHp);
  state.mp = Math.min(state.mp, state.maxMp);
  if (callbacks.log) callbacks.log(`Desequipou ${targetSlot}`, 'system');
  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save(true, true);
}

export { equipItem as equipItemToSlot };

/**
 * Detecta se uma arma requer empunhadura de duas mãos (2-Handed).
 * Em Lineage 2 canon: Arcos, Bestas, Espadas 2H, Lanças/Piques, Ancient Swords e Dual Swords ocupam 2 mãos.
 * @param {Object} itemDef
 * @returns {boolean}
 */
export function isTwoHandedWeapon(itemDef) {
  if (!itemDef) return false;
  const s = `${itemDef.id || itemDef.itemId || ''} ${itemDef.name || ''} ${itemDef.type || ''} ${itemDef.weaponType || ''} ${itemDef.slot || ''}`.toLowerCase();
  return /bow|crossbow|twohand|great_sword|great_axe|two_hand|spear|lance|pike|halberd|pole|polearm|dual|ancientsword/.test(s) || itemDef.isTwoHanded === true || itemDef.hands === 2;
}

/**
 * Valida a compatibilidade de mãos entre arma principal e secundária/escudo.
 * @param {Object} weaponDef
 * @param {Object} offhandDef
 * @returns {boolean}
 */
export function isWeaponCompatibleWithOffhand(weaponDef, offhandDef) {
  if (!weaponDef) return true;
  if (!offhandDef) return true;
  if (isTwoHandedWeapon(weaponDef)) {
    return false;
  }
  return true;
}

/**
 * Calcula o Equipment Recommendation Score (ERS) multicritério para um item.
 * NÃO utiliza apenas CP — avalia papel da classe, sinergia de sets, compatibilidade e impacto real.
 * @param {Object} state
 * @param {Object} item
 * @param {string} [targetSlot]
 * @returns {number}
 */
export function calculateEquipmentRecommendationScore(state, item, targetSlot = null) {
  if (!item || !state) return -999999;
  const gData = D() || {};
  const allItems = gData.ALL_ITEMS || {};
  const def = allItems[item.itemId] || item;
  if (!def) return -999999;
  if (!isEquippableItem(def)) return -999999;

  // Level gate
  const reqLvl = def.req?.level || def.level || 1;
  if (state.level < reqLvl) return -999999;

  // Class / Armor type compatibility
  const equipCheck = canEquipByType(state.class, def);
  if (!equipCheck.ok) return -999999;

  // Multiplicador de raridade e refino
  const rarityMult = item.rarity ? (gData.RARITY?.[item.rarity]?.mult || 1) : 1;
  const enchant = Number(item.enchant || item.enchantLevel) || 0;
  const enchantMult = 1 + (enchant <= 3 ? enchant * 0.12 : (0.36 + (enchant - 3) * 0.15));
  const mult = rarityMult * enchantMult;

  const itemAtk = (Number(def.atk) || 0) * mult;
  const itemMatk = (Number(def.matk) || 0) * mult;
  const itemDef = (Number(def.def) || 0) * mult;
  const itemMdef = (Number(def.mdef) || 0) * mult;
  const itemHp = (Number(def.hp) || 0) * mult;
  const itemMp = (Number(def.mp) || 0) * mult;
  const itemCrit = Number(def.crit) || 0;

  // 1. Relevância do Papel de Classe (Role Relevance)
  let roleScore = 0;
  const isMage = isMageClass(state.class);
  const wType = detectItemWeaponType(def);
  const slot = String(def.slot || '').toLowerCase();

  if (isMage) {
    if (slot === 'weapon' || slot === 'weapon2') {
      if (itemMatk > 0) {
        roleScore += itemMatk * 2.8 + itemMp * 0.6;
        if (wType === 'staff') roleScore += 600;
      } else {
        roleScore -= 3000; // Penaliza severamente armas puramente físicas para magos!
      }
    } else {
      roleScore += itemDef * 0.8 + itemMdef * 1.6 + itemMp * 0.5 + itemHp * 0.3;
    }
  } else {
    // Arquétipos físicos
    const className = String(state.class || '').toLowerCase();
    const isArcher = className.includes('archer') || className.includes('hawkeye') || className.includes('sagittarius') || className.includes('ranger') || className.includes('sentinel') || className.includes('sniper') || className.includes('trickster') || className.includes('arbalester') || className.includes('blaster');
    const isDagger = className.includes('rogue') || className.includes('dagger') || className.includes('assassin') || className.includes('hunter') || className.includes('walker');
    const isTank = className.includes('knight') || className.includes('paladin') || className.includes('templar');

    if (slot === 'weapon' || slot === 'weapon2') {
      if (isArcher) {
        if (wType === 'bow') roleScore += itemAtk * 2.5 + itemCrit * 25 + 1000;
        else roleScore += itemAtk * 0.4 - 800;
      } else if (isDagger) {
        if (wType === 'dagger' || wType === 'dual') roleScore += itemAtk * 2.0 + itemCrit * 35 + 800;
        else roleScore += itemAtk * 0.7;
      } else if (isTank) {
        if (wType === 'sword' || wType === 'blunt') roleScore += itemAtk * 1.5 + itemDef * 1.5 + 700;
        else if (isTwoHandedWeapon(def)) roleScore += itemAtk * 1.1; // Tanks preferem 1H + Escudo
      } else {
        roleScore += itemAtk * 1.8 + itemCrit * 15;
      }
    } else {
      roleScore += itemDef * 1.4 + itemMdef * 1.0 + itemHp * 0.4;
    }
  }

  // 2. Sinergia de Conjunto (Set Synergy)
  let setScore = 0;
  const setName = def.setName || def.set;
  if (setName) {
    let setPieces = 0;
    for (const eqUid of Object.values(state.equipment || {})) {
      if (!eqUid) continue;
      const eqItem = state.inventory?.find(i => i.uid === eqUid);
      if (!eqItem) continue;
      const eqDef = allItems[eqItem.itemId] || eqItem;
      if ((eqDef.setName || eqDef.set) === setName) setPieces++;
    }
    if (setPieces >= 2) setScore += 400;
    if (setPieces >= 3) setScore += 900; // Quase completo ou completa o set!
  }

  // 3. Portão de Compatibilidade de 2 Mãos
  if (targetSlot === 'shield' || targetSlot === 'weapon2') {
    const mainWpnUid = state.equipment?.weapon;
    const mainWpnItem = mainWpnUid ? state.inventory?.find(i => i.uid === mainWpnUid) : null;
    const mainWpnDef = mainWpnItem ? (allItems[mainWpnItem.itemId] || mainWpnItem) : null;
    if (mainWpnDef && isTwoHandedWeapon(mainWpnDef)) {
      return -999999;
    }
  }

  // 4. Sinal secundário de CP auditado
  const tier = Number(def.tier || item.tier) || 1;
  const tierBase = (CP_WEIGHTS?.equipmentTierBase?.[tier]) || 60;
  const encCp = enchant > 0 ? Math.floor(tierBase * (Math.pow(enchant, 1.4) * 0.14)) : 0;
  const itemCp = tierBase + encCp;

  return Math.round(roleScore + setScore + itemCp * 0.1);
}

/**
 * Gera proposta completa de Auto-Equip com análise ERS e deltas antes da confirmação.
 * @param {Object} state
 * @returns {{ currentLoadout: Object, proposedLoadout: Object, changes: Array, deltas: Object, currentCp: number, proposedCp: number }}
 */
export function generateAutoEquipProposal(state) {
  if (!state || !state.inventory) return { currentLoadout: {}, proposedLoadout: {}, deltas: {}, changes: [] };
  const allItems = D()?.ALL_ITEMS || {};
  const currentEquip = { ...(state.equipment || {}) };
  const proposedEquip = { ...currentEquip };
  const usedUids = new Set();
  const changes = [];

  const slotsToEvaluate = [
    'weapon', 'shield', 'weapon2',
    'helmet', 'armor', 'legs', 'gloves', 'boots',
    'necklace', 'earring1', 'earring2', 'ring1', 'ring2',
    'cloak', 'belt', 'hair1', 'hair2',
    'brooch', 'agathion_bracelet', 'talisman_bracelet'
  ];

  for (const slot of slotsToEvaluate) {
    const currentUid = currentEquip[slot];
    const currentItem = currentUid ? state.inventory.find(i => i.uid === currentUid) : null;
    const currentScore = currentItem ? calculateEquipmentRecommendationScore(state, currentItem, slot) : -99999;

    const candidates = state.inventory.filter(i => {
      if (!i || usedUids.has(i.uid)) return false;
      const def = allItems[i.itemId] || i;
      if (!def) return false;
      if (!isEquippableItem(def)) return false;
      const rawSlot = String(def.slot || '').toLowerCase();
      const isSlotMatch =
        (slot === 'weapon' && (rawSlot === 'weapon' || rawSlot === 'twohand' || rawSlot === 'bow' || rawSlot === 'spear' || rawSlot === 'staff' || rawSlot === 'dual' || rawSlot === 'dagger' || rawSlot === 'sword' || rawSlot === 'blunt')) ||
        (slot === 'weapon2' && ['weapon', 'sword', 'dagger'].includes(rawSlot) && !isTwoHandedWeapon(def)) ||
        (slot === 'shield' && (rawSlot === 'shield' || rawSlot === 'shield_or_sigil' || rawSlot === 'offhand' || rawSlot === 'sigil')) ||
        ((slot === 'ring1' || slot === 'ring2') && rawSlot.includes('ring')) ||
        ((slot === 'earring1' || slot === 'earring2') && rawSlot.includes('earring')) ||
        ((slot === 'hair1' || slot === 'hair2') && (rawSlot.includes('hair') || rawSlot === 'headgear' || rawSlot === 'mask')) ||
        (rawSlot === slot);
      return isSlotMatch;
    });

    let bestItem = currentItem;
    let bestScore = currentScore;

    for (const cand of candidates) {
      const score = calculateEquipmentRecommendationScore(state, cand, slot);
      if (score > bestScore) {
        bestScore = score;
        bestItem = cand;
      }
    }

    if (bestItem && bestItem.uid !== currentUid) {
      proposedEquip[slot] = bestItem.uid;
      usedUids.add(bestItem.uid);
      changes.push({
        slot,
        currentUid,
        proposedUid: bestItem.uid,
        currentItem,
        proposedItem: bestItem
      });
    } else if (currentUid) {
      usedUids.add(currentUid);
    }
  }

  // Limpeza de offhand para armas de duas mãos
  const propMainUid = proposedEquip.weapon;
  const propMainItem = propMainUid ? state.inventory.find(i => i.uid === propMainUid) : null;
  const propMainDef = propMainItem ? (allItems[propMainItem.itemId] || propMainItem) : null;
  if (propMainDef && isTwoHandedWeapon(propMainDef)) {
    if (proposedEquip.shield) {
      changes.push({ slot: 'shield', currentUid: proposedEquip.shield, proposedUid: null, currentItem: state.inventory.find(i => i.uid === proposedEquip.shield), proposedItem: null, reason: 'Desequipado (Arma de 2 Mãos)' });
      proposedEquip.shield = null;
    }
    if (proposedEquip.weapon2) {
      changes.push({ slot: 'weapon2', currentUid: proposedEquip.weapon2, proposedUid: null, currentItem: state.inventory.find(i => i.uid === proposedEquip.weapon2), proposedItem: null, reason: 'Desequipado (Arma de 2 Mãos)' });
      proposedEquip.weapon2 = null;
    }
  }

  const currentCp = CombatPowerService.calculateCombatPower(state);
  const currentStats = getStats(state);

  const mockState = { ...state, equipment: proposedEquip };
  const proposedCp = CombatPowerService.calculateCombatPower(mockState);
  const proposedStats = getStats(mockState);

  const deltas = {
    cpDelta: proposedCp - currentCp,
    atkDelta: (proposedStats.atk || 0) - (currentStats.atk || 0),
    matkDelta: (proposedStats.matk || 0) - (currentStats.matk || 0),
    defDelta: (proposedStats.def || 0) - (currentStats.def || 0),
    mdefDelta: (proposedStats.mdef || 0) - (currentStats.mdef || 0),
    hpDelta: (proposedStats.maxHp || 0) - (currentStats.maxHp || 0),
    mpDelta: (proposedStats.maxMp || 0) - (currentStats.maxMp || 0),
    critDelta: (proposedStats.crit || 0) - (currentStats.crit || 0),
    speedDelta: (proposedStats.speed || 0) - (currentStats.speed || 0),
  };

  return {
    currentLoadout: currentEquip,
    proposedLoadout: proposedEquip,
    changes,
    deltas,
    currentCp,
    proposedCp
  };
}

/**
 * Aplica atômica e definitivamente a proposta de Auto-Equip ao estado do jogo.
 * @param {Object} state
 * @param {Object} proposal
 * @param {Object} callbacks
 * @returns {{ success: boolean, appliedChanges: number, reason?: string }}
 */
export function commitAutoEquipProposal(state, proposal, callbacks = {}) {
  if (!state || !proposal || !proposal.proposedLoadout) {
    return { success: false, appliedChanges: 0, reason: 'Proposta de Auto-Equip inválida.' };
  }

  const allItems = D()?.ALL_ITEMS || {};

  // Validação prévia de integridade de todos os itens do novo loadout
  for (const [slot, uid] of Object.entries(proposal.proposedLoadout)) {
    if (uid) {
      const item = state.inventory?.find(i => i.uid === uid);
      if (!item) {
        return { success: false, appliedChanges: 0, reason: `Item ${uid} não encontrado na mochila.` };
      }
      const def = allItems[item.itemId] || item;
      if (!isEquippableItem(def)) {
        return { success: false, appliedChanges: 0, reason: `Item não-equipável detectado: ${def.name || item.itemId}` };
      }
    }
  }

  // 1. Reseta status de equipado
  for (const item of (state.inventory || [])) {
    item.equipped = false;
    delete item.equippedSlot;
  }

  // 2. Aplica novo loadout atômico
  state.equipment = { ...proposal.proposedLoadout };
  for (const [slot, uid] of Object.entries(state.equipment)) {
    if (uid) {
      const item = state.inventory?.find(i => i.uid === uid);
      if (item) {
        item.equipped = true;
        item.equippedSlot = slot;
      }
    }
  }

  // 3. Recalcula vitais e atributos
  const stats = getStats(state);
  state.maxHp = stats.maxHp;
  state.maxMp = stats.maxMp;
  state.hp = Math.min(state.hp || state.maxHp, state.maxHp);
  state.mp = Math.min(state.mp || state.maxMp, state.maxMp);

  const changesCount = proposal.changes?.length || 0;
  if (callbacks.log) {
    callbacks.log(`⚡ Auto-Equip aplicado! (${changesCount} alteraç${changesCount === 1 ? 'ão' : 'ões'})`, 'rarity-legendary');
  }
  if (callbacks.floatText) {
    callbacks.floatText('⚡ EQUIPADO!', 'float-jackpot');
  }
  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save(true, true);

  return { success: true, appliedChanges: changesCount };
}
