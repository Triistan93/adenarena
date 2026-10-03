import { FISHING_ZONES, FISH_CATALOG } from '../data/fishing.js';
import { HUNTING_ZONES, PREY_CATALOG } from '../data/hunting.js';
import { MINERAL_NODES_CATALOG, MINING_ZONES } from '../data/mining.js';
import { MERCENARY_CAMP_UPGRADES, MERCENARY_CAMP_WORK, MAX_MERCENARY_CAMP_LEVEL } from '../data/mercenaryCamp.js';
import { addToInventory, getInventoryCount, removeFromInventoryByItemId } from './InventoryService.js';
import { MercenaryService } from './MercenaryService.js';

function notify(callbacks = {}) {
  callbacks.updateAllUI?.();
  callbacks.save?.();
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function currentZone(zones, playerLevel) {
  return Object.values(zones)
    .filter(zone => Number(zone.minLevel) <= playerLevel)
    .sort((a, b) => b.minLevel - a.minLevel)[0] || Object.values(zones)[0];
}

function assignmentFailure(callbacks, reason) {
  const messages = {
    invalid_activity: 'Esta ordem de trabalho não está disponível.',
    mercenary_not_found: 'Selecione um mercenário contratado antes de despachar a equipe.',
    mercenary_busy: 'Este mercenário já está trabalhando ou em uma expedição.',
    camp_full: 'Todas as equipes do acampamento já estão em serviço.',
    insufficient_gold: 'Adena insuficiente para pagar a diária deste trabalho.'
  };
  callbacks.log?.(`⚠️ ${messages[reason] || 'Não foi possível despachar esta ordem.'}`, 'warning');
  return { success: false, reason };
}

function getWorkRewards(state, activityId, merc) {
  const playerLevel = Math.max(1, Number(state.level) || 1);
  const levelBonus = Math.min(3, Math.floor((Math.max(1, Number(merc.level) || 1) - 1) / 5));
  const rarityBonus = ({ common: 0, uncommon: 0, rare: 1, epic: 2, legendary: 3 })[merc.rarity] || 0;
  const campLevel = Number(state.mercenaries.camp.level) || 1;
  const rewards = [];
  let gold = 0;
  let contentName = '';

  if (activityId === 'hunting') {
    const zone = currentZone(HUNTING_ZONES, playerLevel);
    const prey = PREY_CATALOG[pick(zone.availablePrey)];
    contentName = `${zone.name}: ${prey.name}`;
    const primary = Math.max(1, Number(prey.skinYield.primaryQty) || 1) + levelBonus + Math.floor(rarityBonus / 2) + (merc.spec === 'tracker' ? 1 : 0);
    rewards.push({ itemId: prey.skinYield.primary, count: primary, rarity: prey.rarity || 'common' });
    if (prey.skinYield.secondary) {
      rewards.push({ itemId: prey.skinYield.secondary, count: Math.max(1, (Number(prey.skinYield.secondaryQty) || 1) + Math.floor(levelBonus / 2)), rarity: 'common' });
    }
    gold = Math.max(25, Math.floor((Number(prey.sellPrice) || 100) / 5));
  } else if (activityId === 'fishing') {
    const zone = currentZone(FISHING_ZONES, playerLevel);
    const fish = FISH_CATALOG[pick(zone.availableFish)];
    contentName = `${zone.name}: ${fish.name}`;
    const fishCount = 1 + Math.floor(rarityBonus / 2) + (merc.spec === 'tracker' ? 1 : 0);
    rewards.push({ itemId: fish.id, count: fishCount, rarity: fish.rarity || 'common' });
    if (fish.materialReward) rewards.push({ itemId: fish.materialReward, count: 1 + Math.floor(levelBonus / 2), rarity: 'common' });
    gold = Math.max(20, Math.floor((Number(fish.sellPrice) || 50) / 3));
  } else if (activityId === 'mining') {
    const zone = currentZone(MINING_ZONES, playerLevel);
    const node = MINERAL_NODES_CATALOG[pick(zone.availableNodes)];
    contentName = `${zone.name}: ${node.name}`;
    const primaryCount = (Number(node.yields.primaryQty) || 1) + levelBonus + rarityBonus + (merc.spec === 'guardian' ? 1 : 0);
    rewards.push({ itemId: node.yields.primary, count: primaryCount, rarity: node.rarity || 'common' });
    if (node.yields.secondary) rewards.push({ itemId: node.yields.secondary, count: Math.max(1, (Number(node.yields.secondaryQty) || 1) + Math.floor(levelBonus / 2)), rarity: 'common' });
    gold = Math.max(20, Math.floor(primaryCount * 15 * campLevel));
  } else if (activityId === 'training') {
    contentName = 'Pátio de Treinamento do Acampamento';
  }

  // A companhia melhor equipada melhora o rendimento, sem multiplicar valores de forma explosiva.
  if (campLevel > 1) {
    for (const reward of rewards) reward.count += Math.floor(reward.count * 0.1 * (campLevel - 1));
  }
  if (gold > 0) gold = Math.floor(gold * (1 + 0.1 * (campLevel - 1)));
  return { rewards, gold, contentName };
}

export const MercenaryCampService = {
  getCampState(state) {
    const mercenaries = MercenaryService.getMercenariesState(state);
    if (!mercenaries.camp || typeof mercenaries.camp !== 'object') mercenaries.camp = {};
    mercenaries.camp.level = Math.max(1, Math.min(MAX_MERCENARY_CAMP_LEVEL, Math.floor(Number(mercenaries.camp.level) || 1)));
    mercenaries.camp.renown = Math.max(0, Math.floor(Number(mercenaries.camp.renown) || 0));
    if (!Array.isArray(mercenaries.camp.assignments)) mercenaries.camp.assignments = [];
    return mercenaries.camp;
  },

  getWorkSlotLimit(state) {
    return this.getCampState(state).level;
  },

  getActiveAssignments(state) {
    return this.getCampState(state).assignments;
  },

  isMercenaryWorking(state, mercUid) {
    return this.getActiveAssignments(state).some(order => order.mercenaryUid === mercUid);
  },

  assignWork(state, activityId, mercUid, callbacks = {}) {
    const activity = MERCENARY_CAMP_WORK[activityId];
    if (!activity) return assignmentFailure(callbacks, 'invalid_activity');
    const camp = this.getCampState(state);
    const merc = MercenaryService.getMercenaryByUid(state, mercUid);
    if (!merc) return assignmentFailure(callbacks, 'mercenary_not_found');
    if (this.isMercenaryWorking(state, mercUid) || MercenaryService.isMercenaryBusy(state, mercUid)) {
      return assignmentFailure(callbacks, 'mercenary_busy');
    }
    if (camp.assignments.length >= camp.level) return assignmentFailure(callbacks, 'camp_full');
    if ((Number(state.gold) || 0) < activity.wage) return assignmentFailure(callbacks, 'insufficient_gold');

    const result = getWorkRewards(state, activityId, merc);
    const now = Date.now();
    const assignment = {
      id: `camp_${now}_${Math.random().toString(36).slice(2, 8)}`,
      activityId,
      mercenaryUid: mercUid,
      startTime: now,
      durationMs: activity.durationMs,
      wage: activity.wage,
      mercenaryXp: activity.mercenaryXp,
      trustReward: activity.trust,
      renownReward: activity.renown,
      rewards: result.rewards,
      goldReward: result.gold,
      contentName: result.contentName
    };

    state.gold = (Number(state.gold) || 0) - activity.wage;
    camp.assignments.push(assignment);
    callbacks.log?.(`🏕️ ${merc.name} partiu para ${activity.name}: ${assignment.contentName}.`, 'system');
    notify(callbacks);
    return { success: true, assignment };
  },

  claimWork(state, assignmentId, options = {}) {
    const camp = this.getCampState(state);
    const index = camp.assignments.findIndex(order => order.id === assignmentId);
    if (index < 0) return { success: false, reason: 'not_found' };
    const assignment = camp.assignments[index];
    const now = Number(options.now) || Date.now();
    if (now < assignment.startTime + assignment.durationMs) return { success: false, reason: 'in_progress' };

    const preview = { ...state, inventory: (state.inventory || []).map(item => ({ ...item })) };
    for (const reward of assignment.rewards || []) {
      if (!addToInventory(preview, reward.itemId, reward.count, reward.rarity, false, {}, true)) {
        options.log?.('🎒 Mochila cheia: libere espaço para receber o retorno do acampamento.', 'warning');
        return { success: false, reason: 'inventory_full' };
      }
    }

    for (const reward of assignment.rewards || []) {
      addToInventory(state, reward.itemId, reward.count, reward.rarity, false, options, true);
    }
    state.gold = (Number(state.gold) || 0) + assignment.goldReward;
    camp.renown += Number(assignment.renownReward) || 0;
    const merc = MercenaryService.getMercenaryByUid(state, assignment.mercenaryUid);
    if (merc) {
      MercenaryService.addMercenaryXp(state, merc.uid, assignment.mercenaryXp, options);
      if ((assignment.trustReward || 0) > 2) MercenaryService.addMercenaryTrust(state, merc.uid, assignment.trustReward - 2, options);
    }
    camp.assignments.splice(index, 1);
    options.log?.(`📜 Ordem concluída: ${assignment.contentName}. A companhia recebeu ${assignment.goldReward.toLocaleString()} Adena e seus recursos.`, 'loot');
    notify(options);
    return { success: true, rewards: assignment.rewards || [], gold: assignment.goldReward, renown: assignment.renownReward || 0, mercenaryUid: assignment.mercenaryUid };
  },

  upgradeCamp(state, callbacks = {}) {
    const camp = this.getCampState(state);
    const nextLevel = camp.level + 1;
    if (nextLevel > MAX_MERCENARY_CAMP_LEVEL) return { success: false, reason: 'max_level' };
    const cost = MERCENARY_CAMP_UPGRADES[nextLevel];
    if ((Number(state.gold) || 0) < cost.gold) return { success: false, reason: 'insufficient_gold' };
    if (camp.renown < cost.renown) return { success: false, reason: 'insufficient_renown' };
    for (const material of cost.materials) {
      if (getInventoryCount(state, material.itemId) < material.count) return { success: false, reason: 'insufficient_materials' };
    }

    for (const material of cost.materials) {
      if (!removeFromInventoryByItemId(state, material.itemId, material.count)) {
        return { success: false, reason: 'insufficient_materials' };
      }
    }
    state.gold = (Number(state.gold) || 0) - cost.gold;
    camp.level = nextLevel;
    callbacks.log?.(`🏕️ A reputação da Companhia e os recursos investidos elevaram o acampamento ao nível ${nextLevel}; agora comporta ${nextLevel} equipes de trabalho.`, 'rarity-epic');
    notify(callbacks);
    return { success: true, level: camp.level, slots: camp.level };
  },

  getNextUpgrade(state) {
    const camp = this.getCampState(state);
    return camp.level >= MAX_MERCENARY_CAMP_LEVEL ? null : { level: camp.level + 1, ...MERCENARY_CAMP_UPGRADES[camp.level + 1] };
  }
};
