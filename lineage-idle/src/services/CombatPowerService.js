/**
 * CombatPowerService.js — Motor de Cálculo de Combat Power (CP / Battle Power)
 * 
 * Calcula o poder de combate absoluto de um personagem no Lineage Idle,
 * ponderando atributos de combate, tiers de equipamentos, níveis de encantamento (+1 a +16),
 * augmentações, Soul Crystals (SA), joias épicas, habilidades encantadas (+1 a +30),
 * certificações de subclass, bônus de clã, talismãs e coleções de codex/dolls.
 */

import { D } from '../core/GameConfig.js';
import { BRACELETS, TALISMANS } from '../data/talismans.js';

export const CombatPowerService = {
  /**
   * Calcula o Combat Power total do personagem
   * @param {Object} state - Estado completo do jogador
   * @returns {number} Combat Power arredondado
   */
  calculateCombatPower(state) {
    if (!state) return 100;

    let cp = 0;

    // 1. Nível & Classe
    const level = Number(state.level) || 1;
    const classTier = Number(state.classTier) || 0;
    cp += level * 150;
    cp += classTier * 1200;

    // 2. Atributos de Combate (P.Atk, M.Atk, P.Def, M.Def, HP, MP, CP, Crit, Spd)
    const stats = state.stats || {};
    const pAtk = Number(stats.atk || stats.pAtk) || 50;
    const mAtk = Number(stats.matk || stats.mAtk) || 40;
    const pDef = Number(stats.def || stats.pDef) || 40;
    const mDef = Number(stats.mdef || stats.mDef) || 30;
    const maxHp = Number(stats.maxHp || stats.hp) || 300;
    const maxMp = Number(stats.maxMp || stats.mp) || 150;
    const crit = Number(stats.crit) || 5;
    const speed = Number(stats.speed) || 100;
    const eva = Number(stats.eva) || 10;

    cp += Math.floor(pAtk * 1.8);
    cp += Math.floor(mAtk * 1.6);
    cp += Math.floor(pDef * 1.5);
    cp += Math.floor(mDef * 1.5);
    cp += Math.floor(maxHp * 0.12);
    cp += Math.floor(maxMp * 0.08);
    cp += Math.floor(crit * 15);
    cp += Math.floor(speed * 6);
    cp += Math.floor(eva * 8);

    // 3. Equipamentos, Tiers e Encantamentos (+1 a +16)
    if (state.equipment) {
      const allSlots = ['weapon', 'armor', 'legs', 'helmet', 'gloves', 'boots', 'shield', 'necklace', 'earring1', 'earring2', 'ring1', 'ring2', 'cloak', 'belt', 'hair'];
      
      for (const slot of allSlots) {
        const itemUid = state.equipment[slot];
        if (!itemUid) continue;

        const invItem = state.inventory?.find(i => i.uid === itemUid || i.id === itemUid) || (typeof itemUid === 'object' ? itemUid : null);
        if (!invItem) continue;

        const def = D()?.ALL_ITEMS?.[invItem.itemId || invItem.id] || invItem;
        const tier = Number(def.tier || invItem.tier) || 1;

        // Base CP por Tier
        let itemBaseCp = 150;
        if (tier === 2) itemBaseCp = 350;       // D Grade
        else if (tier === 3) itemBaseCp = 750;  // C Grade
        else if (tier === 4) itemBaseCp = 1600; // B Grade
        else if (tier === 5) itemBaseCp = 3200; // A Grade
        else if (tier === 6) itemBaseCp = 6500; // S Grade / Dynasty / Frost

        // Bônus de Encantamento (+1 a +16)
        const enchant = Number(invItem.enchant || invItem.enchantLevel) || 0;
        let enchantMult = 1.0;
        if (enchant > 0) {
          enchantMult += Math.pow(enchant, 1.4) * 0.14;
        }

        let itemTotalCp = itemBaseCp * enchantMult;

        // Bônus de Soul Crystal (SA)
        if (invItem.sa || invItem.soulCrystal) {
          itemTotalCp += 1200;
        }

        // Bônus de Augmentação (Life Stone)
        if (invItem.augmentation && invItem.augmentation.stats) {
          itemTotalCp += 1500;
          if (invItem.augmentation.skill) itemTotalCp += 1000;
        }

        // Bônus de Armadura Deselada (Unsealed)
        if (invItem.isUnsealed) {
          itemTotalCp += 800;
        }

        // Bônus de Joia Épica de Boss Lendária
        if (invItem.isEpic || def.isEpic || invItem.itemId?.includes('jewel_') || invItem.itemId?.includes('ring_queen_ant') || invItem.itemId?.includes('valakas') || invItem.itemId?.includes('antharas') || invItem.itemId?.includes('baium')) {
          itemTotalCp += 3500;
        }

        // Bônus de Arma Heroica de Olimpíada (Infinity Weapon)
        if (invItem.isHeroWeapon || def.isHeroWeapon || invItem.itemId?.startsWith('weapon_infinity_')) {
          itemTotalCp += 5000;
        }

        cp += Math.floor(itemTotalCp);
      }
    }

    // 4. Bônus de Habilidades Encantadas (+1 a +30)
    if (state.skillEnchantments) {
      for (const skId in state.skillEnchantments) {
        const skLvl = Number(state.skillEnchantments[skId].level) || 0;
        cp += skLvl * 120;
      }
    }

    // 5. Bônus de Clã & Castelos
    if (state.clan && state.clan.level) {
      cp += state.clan.level * 600;
      if (state.clan.castle) cp += 2500;
    }

    // 6. Fortalezas & Talismãs Equipados
    if (state.fortresses) {
      if (Array.isArray(state.fortresses.owned)) {
        cp += state.fortresses.owned.length * 800;
      }
      if (Array.isArray(state.fortresses.equippedTalismans)) {
        cp += state.fortresses.equippedTalismans.length * 600;
      }
      const bDef = BRACELETS[state.fortresses.equippedBracelet];
      if (bDef) {
        cp += bDef.slots * 400;
      }
    }

    // 7. Status de Noblesse & Hero da Grand Olympiad
    if (state.noblesse?.isNoblesse) cp += 2000;
    if (state.olympiad?.isHero) cp += 5000;

    // 8. Codex e Boss Dolls
    if (state.codexUnlockedSets && Array.isArray(state.codexUnlockedSets)) {
      cp += state.codexUnlockedSets.length * 500;
    }
    if (state.bossDolls && Array.isArray(state.bossDolls)) {
      cp += state.bossDolls.length * 800;
    }

    // 9. Seven Signs
    if (state.sevenSigns?.faction) cp += 500;

    return Math.max(100, Math.floor(cp));
  },

  /**
   * Formata Combat Power com separador de milhar (Ex: 145.280 CP)
   * @param {number} cp 
   * @returns {string}
   */
  formatCombatPower(cp) {
    const num = Math.floor(Number(cp) || 0);
    return `${num.toLocaleString('pt-BR')} CP`;
  },

  /**
   * Retorna a classificação de Rank por Combat Power (Bronze, Prata, Ouro, Platina, Diamante, Mestre, Grão-Mestre, Lenda)
   * @param {number} cp 
   * @returns {{ name: string, color: string, badge: string }}
   */
  getCombatPowerTier(cp) {
    const val = Number(cp) || 0;
    if (val >= 250000) return { name: 'Lenda Viva', color: '#ff3366', badge: '👑' };
    if (val >= 180000) return { name: 'Grão-Mestre', color: '#a855f7', badge: '💎' };
    if (val >= 120000) return { name: 'Mestre Arcano', color: '#38bdf8', badge: '🔷' };
    if (val >= 80000)  return { name: 'Diamante', color: '#22c55e', badge: '💠' };
    if (val >= 50000)  return { name: 'Platina', color: '#fbbf24', badge: '⭐' };
    if (val >= 25000)  return { name: 'Ouro', color: '#f59e0b', badge: '🥇' };
    if (val >= 10000)  return { name: 'Prata', color: '#94a3b8', badge: '🥈' };
    return { name: 'Bronze', color: '#b45309', badge: '🥉' };
  }
};
