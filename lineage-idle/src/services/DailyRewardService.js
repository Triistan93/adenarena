/**
 * DailyRewardService.js — Serviço de Recompensas Diárias e Sequência de Login (Daily Check-in)
 */

export const DAILY_REWARDS_TABLE = [
  { day: 1, name: 'Bolsa de Adena', icon: '💰', desc: '50.000 Adena', rewardType: 'adena', count: 50000, rarity: 'common' },
  { day: 2, name: 'Soulshots de Batalha', icon: '⚡', desc: '1.000x Soulshot No-Grade', rewardType: 'item', itemId: 'soulshot_ng', count: 1000, rarity: 'common' },
  { day: 3, name: 'Poções de Cura XL', icon: '🧪', desc: '100x Poções de Vida XL', rewardType: 'item', itemId: 'hp_potion_xl', count: 100, rarity: 'uncommon' },
  { day: 4, name: 'Pergaminho de Arma (D)', icon: '📜', desc: '3x Scroll: Enchant Weapon (D-Grade)', rewardType: 'item', itemId: 'scroll_enchant_weapon_d', count: 3, rarity: 'rare' },
  { day: 5, name: 'Pergaminho de Armadura (D)', icon: '🛡️', desc: '5x Scroll: Enchant Armor (D-Grade)', rewardType: 'item', itemId: 'scroll_enchant_armor_d', count: 5, rarity: 'rare' },
  { day: 6, name: 'Lâmpada Mágica de XP', icon: '🪔', desc: '1x Magic Lamp da Sorte', rewardType: 'special', count: 1, rarity: 'rare' },
  { day: 7, name: '⭐ Bênção da 1ª Semana', icon: '🎁', desc: '5x Scroll Weapon (D) + 100.000 Adena', isMilestone: true, rewardType: 'combo', itemId: 'scroll_enchant_weapon_d', count: 5, adena: 100000, rarity: 'epic' },

  { day: 8, name: 'Tesouro de Adena', icon: '💰', desc: '150.000 Adena', rewardType: 'adena', count: 150000, rarity: 'common' },
  { day: 9, name: 'Spiritshots Mágicos', icon: '✨', desc: '1.000x Spiritshot No-Grade', rewardType: 'item', itemId: 'spiritshot_ng', count: 1000, rarity: 'common' },
  { day: 10, name: 'Frasco de SP Místico', icon: '🔮', desc: '500 Pontos de SP', rewardType: 'sp', count: 500, rarity: 'uncommon' },
  { day: 11, name: 'Pergaminho de Arma (C)', icon: '📜', desc: '3x Scroll: Enchant Weapon (C-Grade)', rewardType: 'item', itemId: 'scroll_enchant_weapon_c', count: 3, rarity: 'rare' },
  { day: 12, name: 'Pergaminho de Armadura (C)', icon: '🛡️', desc: '5x Scroll: Enchant Armor (C-Grade)', rewardType: 'item', itemId: 'scroll_enchant_armor_c', count: 5, rarity: 'rare' },
  { day: 13, name: 'Cristais de Alma Místicos', icon: '💎', desc: '2x Soul Crystal Stage 1', rewardType: 'item', itemId: 'soul_crystal_stage_1', count: 2, rarity: 'rare' },
  { day: 14, name: '⭐⭐ Tesouro da 2ª Semana', icon: '🏆', desc: '1x Boss Doll Box + 300.000 Adena', isMilestone: true, rewardType: 'combo', doll: true, adena: 300000, rarity: 'epic' },

  { day: 15, name: 'Fortuna de Aden', icon: '💰', desc: '300.000 Adena', rewardType: 'adena', count: 300000, rarity: 'common' },
  { day: 16, name: 'Mega Pacote de Poções', icon: '🧪', desc: '250x Poções de Vida XL', rewardType: 'item', itemId: 'hp_potion_xl', count: 250, rarity: 'uncommon' },
  { day: 17, name: 'Páginas de Spellbook Ancestrais', icon: '📖', desc: '5x Ancient Spellbook Page', rewardType: 'item', itemId: 'ancient_spellbook_page', count: 5, rarity: 'rare' },
  { day: 18, name: 'Pergaminho de Arma (B)', icon: '📜', desc: '3x Scroll: Enchant Weapon (B-Grade)', rewardType: 'item', itemId: 'scroll_enchant_weapon_b', count: 3, rarity: 'rare' },
  { day: 19, name: 'Pergaminho de Armadura (B)', icon: '🛡️', desc: '5x Scroll: Enchant Armor (B-Grade)', rewardType: 'item', itemId: 'scroll_enchant_armor_b', count: 5, rarity: 'rare' },
  { day: 20, name: 'Grande Reserva de SP', icon: '🔮', desc: '1.500 Pontos de SP', rewardType: 'sp', count: 1500, rarity: 'epic' },
  { day: 21, name: '⭐⭐⭐ Glória da 3ª Semana', icon: '👑', desc: '10x Páginas de Spellbook 4★ + 500.000 Adena', isMilestone: true, rewardType: 'combo', itemId: 'ancient_spellbook_page', count: 10, adena: 500000, rarity: 'epic' },

  { day: 22, name: 'Cofre Real de Adena', icon: '💰', desc: '750.000 Adena', rewardType: 'adena', count: 750000, rarity: 'common' },
  { day: 23, name: 'Suprimento Imperial', icon: '⚡', desc: '5.000x Soulshot No-Grade', rewardType: 'item', itemId: 'soulshot_ng', count: 5000, rarity: 'uncommon' },
  { day: 24, name: 'Pergaminho de Arma (A)', icon: '📜', desc: '3x Scroll: Enchant Weapon (A-Grade)', rewardType: 'item', itemId: 'scroll_enchant_weapon_a', count: 3, rarity: 'rare' },
  { day: 25, name: 'Pergaminho de Armadura (A)', icon: '🛡️', desc: '5x Scroll: Enchant Armor (A-Grade)', rewardType: 'item', itemId: 'scroll_enchant_armor_a', count: 5, rarity: 'rare' },
  { day: 26, name: 'Pergaminho de Arma (S)', icon: '📜', desc: '2x Scroll: Enchant Weapon (S-Grade)', rewardType: 'item', itemId: 'scroll_enchant_weapon_s', count: 2, rarity: 'epic' },
  { day: 27, name: 'Pergaminho de Armadura (S)', icon: '🛡️', desc: '4x Scroll: Enchant Armor (S-Grade)', rewardType: 'item', itemId: 'scroll_enchant_armor_s', count: 4, rarity: 'epic' },
  { day: 28, name: '👑 COROA SUPREMA DE ADEN', icon: '💎', desc: '1.500.000 Adena + 3x Magic Lamps + 2.000 SP', isMilestone: true, rewardType: 'combo', adena: 1500000, lamps: 3, sp: 2000, rarity: 'legendary' }
];

/**
 * Retorna a string de data UTC atual (ex: '2026-08-15').
 * @returns {string}
 */
export function getTodayDateString() {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
}

/**
 * Inicializa ou normaliza o objeto dailyRewards no estado.
 * @param {Object} state
 * @returns {Object}
 */
export function ensureDailyRewardsState(state) {
  if (!state.dailyRewards || typeof state.dailyRewards !== 'object') {
    state.dailyRewards = {
      currentDay: 1,
      claimedDays: [],
      lastClaimDate: '',
      streak: 0,
      totalClaims: 0
    };
  }
  return state.dailyRewards;
}

/**
 * Verifica se a recompensa de hoje já está disponível para resgate.
 * @param {Object} state
 * @returns {{ canClaim: boolean, currentDay: number, streak: number, reward: Object }}
 */
export function getDailyRewardStatus(state) {
  const dr = ensureDailyRewardsState(state);
  const today = getTodayDateString();
  const canClaim = dr.lastClaimDate !== today;
  const currentDay = Math.max(1, Math.min(28, dr.currentDay || 1));
  const reward = DAILY_REWARDS_TABLE[currentDay - 1] || DAILY_REWARDS_TABLE[0];

  return {
    canClaim,
    currentDay,
    streak: dr.streak || 0,
    reward,
    claimedDays: dr.claimedDays || []
  };
}

/**
 * Executa o resgate da recompensa diária atual.
 * @param {Object} state
 * @param {Object} helpers — { log, addToInventory, floatText }
 * @returns {{ success: boolean, message: string, reward?: Object }}
 */
export function claimDailyReward(state, helpers = {}) {
  const dr = ensureDailyRewardsState(state);
  const today = getTodayDateString();

  if (dr.lastClaimDate === today) {
    return { success: false, message: 'Você já resgatou a recompensa diária de hoje. Volte amanhã!' };
  }

  const currentDay = Math.max(1, Math.min(28, dr.currentDay || 1));
  const reward = DAILY_REWARDS_TABLE[currentDay - 1];
  if (!reward) {
    return { success: false, message: 'Recompensa diária não encontrada.' };
  }

  // Entrega as recompensas
  if (reward.rewardType === 'adena' || reward.adena) {
    const goldGain = (reward.count && reward.rewardType === 'adena') ? reward.count : (reward.adena || 0);
    state.gold = (state.gold || 0) + goldGain;
  }

  if (reward.rewardType === 'sp' || reward.sp) {
    const spGain = (reward.count && reward.rewardType === 'sp') ? reward.count : (reward.sp || 0);
    state.sp = (state.sp || 0) + spGain;
  }

  if (reward.lamps || (reward.rewardType === 'special' && reward.name.includes('Lâmpada'))) {
    const lamps = reward.lamps || reward.count || 1;
    state.magicLamps = (state.magicLamps || 0) + lamps;
  }

  if (reward.doll) {
    state.dolls = state.dolls || [];
    state.dolls.push({ id: 'doll_queen_ant_1', name: 'Queen Ant Doll (Tier 1)', tier: 1, stars: 1 });
  }

  if (reward.itemId && helpers.addToInventory) {
    helpers.addToInventory(reward.itemId, reward.count || 1);
  }

  // Atualiza estado do calendário
  dr.lastClaimDate = today;
  dr.claimedDays = dr.claimedDays || [];
  if (!dr.claimedDays.includes(currentDay)) {
    dr.claimedDays.push(currentDay);
  }
  dr.streak = (dr.streak || 0) + 1;
  dr.totalClaims = (dr.totalClaims || 0) + 1;

  // Avança para o próximo dia (reseta no dia 28 para ciclo contínuo)
  if (currentDay >= 28) {
    dr.currentDay = 1;
    dr.claimedDays = [];
  } else {
    dr.currentDay = currentDay + 1;
  }

  if (helpers.log) {
    helpers.log(`🎁 [Check-in Diário] Dia ${currentDay} resgatado: ${reward.name} (${reward.desc})! Sequência atual: 🔥 ${dr.streak} dias!`, 'rarity-legendary');
  }

  if (helpers.floatText) {
    helpers.floatText(`🎁 Check-in Dia ${currentDay}!`, 'gilt');
  }

  return { success: true, message: `Recompensa do Dia ${currentDay} resgatada com sucesso!`, reward };
}
