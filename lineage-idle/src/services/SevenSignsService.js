import { FACTIONS, SEAL_STONES, SEVEN_SIGNS_BOSSES, MAMMON_BLACKSMITH_SERVICES, MAMMON_MERCHANT_CATALOG, NECROPOLIS_ZONES } from '../data/seven_signs.js';

export class SevenSignsService {
  /**
   * Inicializa o estado de Seven Signs se necessário
   */
  static ensureState(state) {
    if (!state.sevenSigns || typeof state.sevenSigns !== 'object') {
      state.sevenSigns = {
        faction: null, // 'dawn' | 'dusk'
        playerScore: 0,
        dawnScore: 250000,
        duskScore: 240000,
        ancientAdena: 0,
        stonesDeposited: { seal_stone_blue: 0, seal_stone_green: 0, seal_stone_red: 0 },
        activeBossFight: null,
        bossDefeats: { lilith: 0, anakim: 0 }
      };
    }
    if (typeof state.sevenSigns.ancientAdena !== 'number') {
      state.sevenSigns.ancientAdena = 0;
    }
    return state.sevenSigns;
  }

  /**
   * Escolhe a facção (Dawn ou Dusk)
   */
  static joinFaction(state, factionId, hooks = {}) {
    const ss = this.ensureState(state);
    if (!FACTIONS[factionId]) {
      return { success: false, message: 'Facção inválida.' };
    }
    ss.faction = factionId;
    hooks.log?.(`🏛️ Você jurou fidelidade à facção **${FACTIONS[factionId].name}** na competição dos Sete Selos!`, 'system');
    hooks.onUpdate?.();
    return { success: true, faction: factionId };
  }

  /**
   * Deposita pedras de selo para pontuar e converter em Ancient Adena
   */
  static depositStones(state, stoneId, count = 1, hooks = {}) {
    const ss = this.ensureState(state);
    if (!ss.faction) {
      return { success: false, message: 'Você precisa escolher uma facção primeiro.' };
    }
    const def = SEAL_STONES[stoneId];
    if (!def) return { success: false, message: 'Pedra de selo inválida.' };

    const inv = state.inventory || [];
    const invItem = inv.find(i => (i.id === stoneId || i.itemId === stoneId));
    const available = invItem ? (invItem.count || 1) : 0;
    if (available < count) {
      return { success: false, message: `Você não tem ${count}x ${def.name}.` };
    }

    // Deduz do inventário
    if (invItem.count && invItem.count > count) {
      invItem.count -= count;
    } else {
      const idx = inv.indexOf(invItem);
      if (idx !== -1) inv.splice(idx, 1);
    }

    const aaGained = count * def.aaValue;
    ss.ancientAdena += aaGained;
    ss.playerScore += aaGained;
    ss.stonesDeposited[stoneId] = (ss.stonesDeposited[stoneId] || 0) + count;

    if (ss.faction === 'dawn') {
      ss.dawnScore += aaGained;
    } else {
      ss.duskScore += aaGained;
    }

    hooks.log?.(`🏛️ Você entregou **${count}x ${def.name}** e recebeu **+${aaGained.toLocaleString()} Ancient Adena**!`, 'gain');
    hooks.onUpdate?.();
    return { success: true, aaGained, totalAA: ss.ancientAdena };
  }

  /**
   * Inicia o confronto contra Lilith ou Anakim
   */
  static startBossFight(state, bossId, hooks = {}) {
    const ss = this.ensureState(state);
    const boss = SEVEN_SIGNS_BOSSES[bossId];
    if (!boss) return { success: false, message: 'Chefe de selo não encontrado.' };

    if (state.level < boss.level) {
      return { success: false, message: `Nível ${boss.level}+ necessário para desafiar ${boss.name}.` };
    }

    if (ss.ancientAdena < boss.reqAA) {
      return { success: false, message: `Requer ${boss.reqAA.toLocaleString()} Ancient Adena para abrir o portal do santuário.` };
    }

    ss.ancientAdena -= boss.reqAA;
    ss.activeBossFight = {
      bossId,
      bossName: boss.name,
      bossHp: boss.hp,
      maxHp: boss.hp,
      pAtk: boss.pAtk,
      pDef: boss.pDef,
      turn: 1
    };

    hooks.log?.(`⚡ O portal selado se abriu! Você adentrou o santuário sagrado de **${boss.name}**!`, 'warning');
    hooks.onUpdate?.();
    return { success: true, fight: ss.activeBossFight };
  }

  /**
   * Executa um turno no confronto contra o Chefe de Selo
   */
  static executeBossTurn(state, hooks = {}) {
    const ss = this.ensureState(state);
    const fight = ss.activeBossFight;
    if (!fight) return { success: false, message: 'Nenhum confronto de selo ativo.' };

    const boss = SEVEN_SIGNS_BOSSES[fight.bossId];
    const playerStats = state.stats || { atk: 2500, matk: 2500, def: 2000, mdef: 2000 };
    const playerDmg = Math.max(100, Math.floor((playerStats.atk || 1500) * 1.5 - fight.pDef * 0.4));
    fight.bossHp = Math.max(0, fight.bossHp - playerDmg);

    hooks.log?.(`⚔️ Você desferiu **${playerDmg.toLocaleString()}** de dano em **${boss.name}** (HP: ${fight.bossHp.toLocaleString()} / ${fight.maxHp.toLocaleString()})`, 'combat');

    if (fight.bossHp <= 0) {
      // Vitória!
      ss.bossDefeats[fight.bossId] = (ss.bossDefeats[fight.bossId] || 0) + 1;
      ss.ancientAdena += boss.rewards.aa;
      state.xp = (state.xp || 0) + boss.rewards.xp;
      state.sp = (state.sp || 0) + boss.rewards.sp;

      state.inventory = state.inventory || [];
      for (const it of boss.rewards.items) {
        state.inventory.push({
          id: it,
          itemId: it,
          uid: 'ss_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
          count: 1
        });
      }

      ss.activeBossFight = null;
      hooks.log?.(`🏆 VITÓRIA GLORIOSA! Você derrotou **${boss.name}**! Recompensas: +${boss.rewards.aa.toLocaleString()} AA, +${boss.rewards.xp.toLocaleString()} XP e Itens Supremos!`, 'victory');
      hooks.onUpdate?.();
      return { success: true, isVictory: true, rewards: boss.rewards };
    }

    // Contra-ataque do Chefe
    const bossDmg = Math.max(50, Math.floor(fight.pAtk * 1.2 - (playerStats.def || 1000) * 0.2));
    state.hp = Math.max(1, (state.hp || 5000) - bossDmg);
    hooks.log?.(`⚠️ **${boss.name}** conjurou um golpe devastador causando **${bossDmg.toLocaleString()}** de dano no jogador!`, 'danger');

    fight.turn++;
    hooks.onUpdate?.();
    return { success: true, isVictory: false, fight };
  }

  /**
   * Comprar item do Mercador de Mammon
   */
  static buyMammonItem(state, itemId, hooks = {}) {
    const ss = this.ensureState(state);
    const item = MAMMON_MERCHANT_CATALOG.find(i => i.id === itemId);
    if (!item) return { success: false, message: 'Item de Mammon não encontrado.' };

    if (ss.ancientAdena < item.costAA) {
      return { success: false, message: `Ancient Adena insuficiente. Requer ${item.costAA.toLocaleString()} AA.` };
    }

    ss.ancientAdena -= item.costAA;
    state.inventory = state.inventory || [];
    state.inventory.push({
      id: item.id,
      itemId: item.id,
      name: item.name,
      uid: 'mammon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      count: 1
    });

    hooks.log?.(`🛒 Você adquiriu **${item.name}** do Merchant of Mammon por **${item.costAA.toLocaleString()} AA**!`, 'gain');
    hooks.onUpdate?.();
    return { success: true, item };
  }

  /**
   * Deselar armadura com o Blacksmith of Mammon
   */
  static unsealArmor(state, armorItem, hooks = {}) {
    const ss = this.ensureState(state);
    const cost = 50000;
    if (ss.ancientAdena < cost) {
      return { success: false, message: `Ancient Adena insuficiente. Requer ${cost.toLocaleString()} AA para deselar armadura.` };
    }
    if (!armorItem) return { success: false, message: 'Selecione uma armadura selada.' };

    ss.ancientAdena -= cost;
    armorItem.isUnsealed = true;
    armorItem.name = armorItem.name ? armorItem.name.replace('(Sealed)', '').trim() + ' (Unsealed ✨)' : 'Armadura Deselada ✨';
    
    hooks.log?.(`⚒️ O Blacksmith of Mammon removeu o selo ancestral de **${armorItem.name}**! O conjunto liberou seu potencial total!`, 'gain');
    hooks.onUpdate?.();
    return { success: true, armor: armorItem };
  }
}
