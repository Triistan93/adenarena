/**
 * dailyRewards.ts — Calendário de Recompensas Diárias (28 Dias) do Aden Arena.
 *
 * Oferece recompensas progressivas com marcos especiais nos dias 7, 14, 21 e 28
 * para maximizar a retenção diária de jogadores.
 */

export interface DailyRewardDay {
  day: number;
  name: string;
  icon: string;
  desc: string;
  isMilestone?: boolean;
  rewardType: 'adena' | 'sp' | 'item' | 'doll' | 'special';
  itemId?: string;
  count: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export const DAILY_REWARDS_28: DailyRewardDay[] = [
  // Semana 1: Suprimentos & Primeiros Encantos
  { day: 1, name: 'Bolsa de Adena', icon: '💰', desc: '50.000 Adena', rewardType: 'adena', count: 50000, rarity: 'common' },
  { day: 2, name: 'Soulshots No-Grade', icon: '⚡', desc: '1.000x Soulshot No-Grade', rewardType: 'item', itemId: 'soulshot_ng', count: 1000, rarity: 'common' },
  { day: 3, name: 'Poções de Cura XL', icon: '🧪', desc: '100x Poções de Vida XL', rewardType: 'item', itemId: 'hp_potion_xl', count: 100, rarity: 'uncommon' },
  { day: 4, name: 'Pergaminho de Arma (D)', icon: '📜', desc: '3x Scroll: Enchant Weapon (D-Grade)', rewardType: 'item', itemId: 'scroll_enchant_weapon_d', count: 3, rarity: 'rare' },
  { day: 5, name: 'Pergaminho de Armadura (D)', icon: '🛡️', desc: '5x Scroll: Enchant Armor (D-Grade)', rewardType: 'item', itemId: 'scroll_enchant_armor_d', count: 5, rarity: 'rare' },
  { day: 6, name: 'Lâmpada Mágica de XP', icon: '🪔', desc: '1x Magic Lamp da Sorte', rewardType: 'special', count: 1, rarity: 'rare' },
  { day: 7, name: '⭐ Bênção da 1ª Semana', icon: '🎁', desc: '1x Blessed Scroll Weapon (D) + 100.000 Adena', isMilestone: true, rewardType: 'item', itemId: 'scroll_enchant_weapon_d', count: 5, rarity: 'epic' },

  // Semana 2: Forja e Grau C
  { day: 8, name: 'Tesouro de Adena', icon: '💰', desc: '150.000 Adena', rewardType: 'adena', count: 150000, rarity: 'common' },
  { day: 9, name: 'Spiritshots de Batalha', icon: '✨', desc: '1.000x Spiritshot No-Grade', rewardType: 'item', itemId: 'spiritshot_ng', count: 1000, rarity: 'common' },
  { day: 10, name: 'Frasco de SP Místico', icon: '🔮', desc: '500 Pontos de SP', rewardType: 'sp', count: 500, rarity: 'uncommon' },
  { day: 11, name: 'Pergaminho de Arma (C)', icon: '📜', desc: '3x Scroll: Enchant Weapon (C-Grade)', rewardType: 'item', itemId: 'scroll_enchant_weapon_c', count: 3, rarity: 'rare' },
  { day: 12, name: 'Pergaminho de Armadura (C)', icon: '🛡️', desc: '5x Scroll: Enchant Armor (C-Grade)', rewardType: 'item', itemId: 'scroll_enchant_armor_c', count: 5, rarity: 'rare' },
  { day: 13, name: 'Cristais de Alma Místicos', icon: '💎', desc: '50x Soul Crystal Shards', rewardType: 'item', itemId: 'soul_crystal_stage_1', count: 2, rarity: 'rare' },
  { day: 14, name: '⭐⭐ Tesouro da 2ª Semana', icon: '🏆', desc: '1x Boss Doll Box + 300.000 Adena', isMilestone: true, rewardType: 'special', count: 1, rarity: 'epic' },

  // Semana 3: Grau B & Habilidades Nobres
  { day: 15, name: 'Fortuna de Aden', icon: '💰', desc: '300.000 Adena', rewardType: 'adena', count: 300000, rarity: 'common' },
  { day: 16, name: 'Mega Pacote de Poções', icon: '🧪', desc: '250x Poções de Vida XL + 250x MP XL', rewardType: 'item', itemId: 'hp_potion_xl', count: 250, rarity: 'uncommon' },
  { day: 17, name: 'Páginas de Spellbook Ancestrais', icon: '📖', desc: '5x Ancient Spellbook Page', rewardType: 'item', itemId: 'ancient_spellbook_page', count: 5, rarity: 'rare' },
  { day: 18, name: 'Pergaminho de Arma (B)', icon: '📜', desc: '3x Scroll: Enchant Weapon (B-Grade)', rewardType: 'item', itemId: 'scroll_enchant_weapon_b', count: 3, rarity: 'rare' },
  { day: 19, name: 'Pergaminho de Armadura (B)', icon: '🛡️', desc: '5x Scroll: Enchant Armor (B-Grade)', rewardType: 'item', itemId: 'scroll_enchant_armor_b', count: 5, rarity: 'rare' },
  { day: 20, name: 'Grande Reserva de SP', icon: '🔮', desc: '1.500 Pontos de SP', rewardType: 'sp', count: 1500, rarity: 'epic' },
  { day: 21, name: '⭐⭐⭐ Glória da 3ª Semana', icon: '👑', desc: '10x Páginas de Spellbook 4★ + 500.000 Adena', isMilestone: true, rewardType: 'item', itemId: 'ancient_spellbook_page', count: 10, rarity: 'epic' },

  // Semana 4: Grau A/S & Glória Suprema
  { day: 22, name: 'Cofre Real de Adena', icon: '💰', desc: '750.000 Adena', rewardType: 'adena', count: 750000, rarity: 'common' },
  { day: 23, name: 'Suprimento Imperial', icon: '⚡', desc: '5.000x Soulshot / Spiritshot', rewardType: 'item', itemId: 'soulshot_ng', count: 5000, rarity: 'uncommon' },
  { day: 24, name: 'Pergaminho de Arma (A)', icon: '📜', desc: '3x Scroll: Enchant Weapon (A-Grade)', rewardType: 'item', itemId: 'scroll_enchant_weapon_a', count: 3, rarity: 'rare' },
  { day: 25, name: 'Pergaminho de Armadura (A)', icon: '🛡️', desc: '5x Scroll: Enchant Armor (A-Grade)', rewardType: 'item', itemId: 'scroll_enchant_armor_a', count: 5, rarity: 'rare' },
  { day: 26, name: 'Pergaminho de Arma (S)', icon: '📜', desc: '2x Scroll: Enchant Weapon (S-Grade)', rewardType: 'item', itemId: 'scroll_enchant_weapon_s', count: 2, rarity: 'epic' },
  { day: 27, name: 'Pergaminho de Armadura (S)', icon: '🛡️', desc: '4x Scroll: Enchant Armor (S-Grade)', rewardType: 'item', itemId: 'scroll_enchant_armor_s', count: 4, rarity: 'epic' },
  { day: 28, name: '👑 COROA SUPREMA DE ADEN', icon: '💎', desc: '1x Relíquia Épica Lendária + 1.500.000 Adena + 3x Magic Lamps', isMilestone: true, rewardType: 'special', count: 1, rarity: 'legendary' }
];
