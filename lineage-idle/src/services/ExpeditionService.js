// ExpeditionService.js — Framework Universal de Expedições de Mercenários e Exploração
import { addToInventory } from './InventoryService.js';

export const EXPEDITION_DESTINATIONS = {
  branded: {
    id: 'branded',
    name: 'Catacumbas de Branded',
    minLevel: 40,
    duration: 3600000, // 1 hora
    cost: 5000,
    minGold: 20000,
    maxGold: 30000,
    shards: 2,
    rewardDesc: 'Scrolls de Encantamento D/C e Cacos Astrais',
    desc: 'Expedição rápida (1 hora) às catacumbas ancestrais com saque de ouro e pergaminhos.'
  },
  martyrs: {
    id: 'martyrs',
    name: 'Necrópole dos Martírios',
    minLevel: 50,
    duration: 14400000, // 4 horas
    cost: 20000,
    minGold: 100000,
    maxGold: 150000,
    shards: 5,
    rewardDesc: 'Scrolls de Encantamento A/B e Cacos Astrais',
    desc: 'Expedição intermediária (4 horas) por criptas esquecidas repletas de tesouros dos antigos mártires.'
  },
  dragon_valley: {
    id: 'dragon_valley',
    name: 'Vale dos Dragões Abissais',
    minLevel: 65,
    duration: 28800000, // 8 horas
    cost: 50000,
    minGold: 300000,
    maxGold: 400000,
    shards: 12,
    rewardDesc: 'Joia Épica Tateossian e 12 Cacos Astrais',
    desc: 'Expedição avançada (8 horas) em terreno árduo repleto de ossos de dragões e relíquias de grau A/S.'
  },
  shilen_temple: {
    id: 'shilen_temple',
    name: 'Templo da Deusa Shilen',
    minLevel: 75,
    duration: 43200000, // 12 horas
    cost: 100000,
    minGold: 800000,
    maxGold: 1200000,
    shards: 25,
    rewardDesc: 'Espada Mítica Frost Lord e 25 Cacos Astrais',
    desc: 'Expedição mítica (12 horas) às profundezas do templo da deusa da destruição.'
  }
};

export const ExpeditionService = {
  getExpeditions(state) {
    if (!Array.isArray(state.expeditions)) {
      state.expeditions = [];
    }
    return state.expeditions;
  },

  getAvailableDestinations(state) {
    const playerLvl = Number(state?.level) || 1;
    return Object.values(EXPEDITION_DESTINATIONS).filter(d => playerLvl >= (d.minLevel || 40));
  },

  startExpedition(state, destId, callbacks = {}) {
    const dest = EXPEDITION_DESTINATIONS[destId];
    if (!dest) return false;

    const list = this.getExpeditions(state);
    const activeExp = list.find(e => e.destId === destId && !e.claimed);
    if (activeExp) {
      if (callbacks.log) callbacks.log(`⚠️ Já existe um esquadrão em marcha para ${dest.name}!`, 'warning');
      return false;
    }

    if ((state.gold || 0) < dest.cost) {
      if (callbacks.log) callbacks.log(`⚠️ Ouro insuficiente para equipar o esquadrão! Requer ${dest.cost.toLocaleString()} Adena.`, 'warning');
      return false;
    }

    state.gold -= dest.cost;
    const now = Date.now();
    const expObj = {
      id: 'exp_' + now + '_' + Math.floor(Math.random() * 1000),
      destId,
      startTime: now,
      duration: dest.duration,
      claimed: false
    };

    list.push(expObj);

    if (callbacks.log) {
      const hours = (dest.duration / 3600000).toFixed(0);
      callbacks.log(`🧭 Esquadrão de Mercenários despachado para **${dest.name}**! Duração prevista: ${hours}h.`, 'loot');
    }

    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return true;
  },

  claimReward(state, expId, callbacks = {}) {
    const list = this.getExpeditions(state);
    const expIdx = list.findIndex(e => e.id === expId);
    if (expIdx < 0) return false;

    const exp = list[expIdx];
    const dest = EXPEDITION_DESTINATIONS[exp.destId];
    if (!dest) return false;

    const now = Date.now();
    if (now < exp.startTime + exp.duration) {
      const remainingSec = Math.ceil((exp.startTime + exp.duration - now) / 1000);
      const mins = Math.ceil(remainingSec / 60);
      if (callbacks.log) callbacks.log(`⚠️ Este esquadrão ainda está explorando! Retorno em aproximadamente ${mins} minutos.`, 'warning');
      return false;
    }

    const goldEarned = Math.floor(dest.minGold + Math.random() * (dest.maxGold - dest.minGold));
    state.gold = (state.gold || 0) + goldEarned;

    // Cacos astrais
    const shards = dest.shards || 2;
    state.astralShards = (state.astralShards || 0) + shards;

    // Itens específicos por destino
    if (exp.destId === 'shilen_temple') {
      addToInventory(state, 'weapon_frost_lord_sword', 1, 'frostlord', false, callbacks, true);
    } else if (exp.destId === 'dragon_valley') {
      addToInventory(state, 'jewel_tateossian_ring', 1, 'legendary', false, callbacks, true);
    } else if (exp.destId === 'martyrs') {
      addToInventory(state, 'scroll_enchant_weapon_a', 2, 'rare', false, callbacks, true);
    } else {
      addToInventory(state, 'scroll_enchant_weapon_d', 3, 'common', false, callbacks, true);
    }

    // Remove do array de ativas
    list.splice(expIdx, 1);

    if (callbacks.log) {
      callbacks.log(`🎁 **Expedição a ${dest.name} retornou com sucesso!** Saque recolhido: ${goldEarned.toLocaleString()} Adena e +${shards} Cacos Astrais!`, 'rarity-legendary');
    }
    if (callbacks.floatText) {
      callbacks.floatText(`+${goldEarned.toLocaleString()} Adena!`, 'float-gold');
    }

    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return true;
  }
};
