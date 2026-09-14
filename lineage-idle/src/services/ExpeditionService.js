// ExpeditionService.js — Framework Universal de Expedições Estratégicas de Mercenários e Exploração 2.0
import { addToInventory } from './InventoryService.js';
import { MercenaryService } from './MercenaryService.js';
import { MERCENARY_SPECIALIZATIONS, MERCENARY_TRAITS, calculateMercenaryPower } from '../data/mercenaries.js';
import { EXPEDITION_DESTINATIONS } from '../data/expeditions.js';

export { EXPEDITION_DESTINATIONS };

export const ExpeditionService = {
  getExpeditions(state) {
    if (!Array.isArray(state.expeditions)) {
      state.expeditions = [];
    }
    return state.expeditions;
  },

  getAvailableDestinations(state) {
    const playerLvl = Number(state?.level) || 1;
    return Object.values(EXPEDITION_DESTINATIONS).filter(d => playerLvl >= (d.minLevel || 15));
  },

  calculateSquadSynergies(destId, squadMercs = []) {
    const dest = EXPEDITION_DESTINATIONS[destId];
    const synergies = {
      speedReduction: 0,
      bonusChestChance: 0,
      extraShardsPct: 0,
      extraXpPct: 0,
      goldBonusPct: 0,
      extraMaterialChance: 0,
      hazardMitigation: 0,
      activePerks: [],
      totalSquadPower: 0
    };

    if (!Array.isArray(squadMercs) || squadMercs.length === 0) {
      return synergies;
    }

    const specsPresent = new Set();
    const traitsPresent = new Set();

    for (const merc of squadMercs) {
      if (!merc) continue;
      const power = calculateMercenaryPower(merc);
      synergies.totalSquadPower += power;
      specsPresent.add(merc.spec);

      // Traços de personalidade
      if (merc.trait && MERCENARY_TRAITS[merc.trait]) {
        const tr = MERCENARY_TRAITS[merc.trait];
        traitsPresent.add(tr.id);

        if (tr.goldBonusPct) synergies.goldBonusPct += tr.goldBonusPct;
        if (tr.xpBonusPct) synergies.extraXpPct += tr.xpBonusPct;
        if (tr.bonusChestChance) synergies.bonusChestChance += tr.bonusChestChance;
        if (tr.speedReduction) synergies.speedReduction += tr.speedReduction;
        if (tr.hazardDamageReduction) synergies.hazardMitigation += tr.hazardDamageReduction;

        synergies.activePerks.push(`${tr.icon} ${tr.name} (${tr.desc})`);
      }

      // Lealdade (50 base, max 100)
      const loyalty = merc.loyalty ?? 50;
      if (loyalty >= 80) {
        synergies.goldBonusPct += 0.08;
        synergies.extraXpPct += 0.08;
      } else if (loyalty >= 50) {
        synergies.goldBonusPct += 0.03;
      }

      // Bônus se a especialização corresponder aos requisitos recomendados
      if (dest && dest.recommendedSpecs && dest.recommendedSpecs.includes(merc.spec)) {
        synergies.goldBonusPct += 0.12; // +12% ouro por spec tático ideal
      }
    }

    // Sinergias por Especialização (PROBABILÍSTICO / RELATIVO - SEM 100% DE IMUNIDADE)
    // 1. Rastreador: Redução de tempo (até -20%) e chance de veios de recursos extras
    if (specsPresent.has('tracker')) {
      synergies.speedReduction = Math.min(0.35, synergies.speedReduction + 0.20);
      synergies.extraMaterialChance += 0.25;
      synergies.activePerks.push('Passo Ágil (-20% Tempo de Marcha, +25% Veios Extras)');
    }

    // 2. Ladino: Chance de baú bônus (+35%) e desarme de armadilhas (-40% penalidade)
    if (specsPresent.has('thief')) {
      synergies.bonusChestChance = Math.min(0.60, synergies.bonusChestChance + 0.35);
      synergies.hazardMitigation += 0.25;
      synergies.activePerks.push('Mãos de Seda (+35% Baú Bônus, Desarme de Armadilhas)');
    }

    // 3. Mago Arcano: Fragmentos astrais extras (+50%) e salas arcanas
    if (specsPresent.has('mage')) {
      synergies.extraShardsPct = Math.min(0.75, synergies.extraShardsPct + 0.50);
      synergies.activePerks.push('Sifão Astral (+50% Cacos Astrais)');
    }

    // 4. Curandeiro: Bônus de XP para o esquadrão (+30%) e mitigação de perigos
    if (specsPresent.has('healer')) {
      synergies.extraXpPct += 0.30;
      synergies.hazardMitigation += 0.20;
      synergies.activePerks.push('Bênção de Eva (+30% XP Esquadrão, Mitigação Residual)');
    }

    // 5. Guardião: Proteção e segurança da caravana (-35% dano de emboscada, +10% Adena segura)
    if (specsPresent.has('guardian')) {
      synergies.goldBonusPct += 0.10;
      synergies.hazardMitigation += 0.35;
      synergies.activePerks.push('Escudo Inabalável (-35% Dano de Emboscadas, +10% Adena)');
    }

    return synergies;
  },

  startExpedition(state, destId, squadUids = [], callbacks = {}) {
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

    // Validação dos mercenários escalados (máx 3)
    const validSquadUids = [];
    const squadMercs = [];

    if (Array.isArray(squadUids)) {
      for (const uid of squadUids.slice(0, 3)) {
        if (!uid) continue;
        if (MercenaryService.isMercenaryBusy(state, uid)) {
          if (callbacks.log) callbacks.log(`⚠️ Um dos mercenários selecionados já está em outra expedição!`, 'warning');
          return false;
        }
        const merc = MercenaryService.getMercenaryByUid(state, uid);
        if (merc) {
          validSquadUids.push(uid);
          squadMercs.push(merc);
        }
      }
    }

    const synergies = this.calculateSquadSynergies(destId, squadMercs);
    let finalDuration = dest.duration;
    if (synergies.speedReduction > 0) {
      finalDuration = Math.max(60000, Math.floor(finalDuration * (1 - synergies.speedReduction)));
    }

    state.gold -= dest.cost;
    const now = Date.now();
    const expObj = {
      id: 'exp_' + now + '_' + Math.floor(Math.random() * 10000),
      destId,
      startTime: now,
      duration: finalDuration,
      squad: validSquadUids,
      claimed: false,
      synergies,
      phases: dest.phases || [
        { name: 'Infiltração', desc: 'Aproximação pelo perímetro hostil.' },
        { name: 'Perigo', desc: 'Enfrentando as ameaças locais.' },
        { name: 'Tesouro', desc: 'Câmara de saque e relíquias.' }
      ]
    };

    list.push(expObj);

    if (callbacks.log) {
      const hours = (finalDuration / 3600000).toFixed(1);
      const squadCount = validSquadUids.length;
      const squadInfo = squadCount > 0 ? `com ${squadCount} mercenário(s) escalado(s)` : `em expedição solo`;
      callbacks.log(`🧭 Esquadrão despachado para **${dest.name}** ${squadInfo}! Duração estimada: ${hours}h.`, 'loot');
      if (synergies.activePerks.length > 0) {
        callbacks.log(`⚡ Sinergias & Traços: ${synergies.activePerks.join(' | ')}`, 'system');
      }
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

    // 1. Saque de Ouro
    const baseGold = Math.floor(dest.minGold + Math.random() * (dest.maxGold - dest.minGold));
    const goldBonusPct = exp.synergies?.goldBonusPct || 0;
    const goldEarned = Math.floor(baseGold * (1 + goldBonusPct));
    state.gold = (state.gold || 0) + goldEarned;

    // 2. Cacos Astrais
    let shards = dest.shards || 3;
    if (exp.synergies?.extraShardsPct) {
      shards = Math.floor(shards * (1 + exp.synergies.extraShardsPct));
    }
    state.astralShards = (state.astralShards || 0) + shards;

    // 3. Materiais Canônicos da Tabela do Destino
    const materialsRewarded = [];
    if (Array.isArray(dest.materialRewards)) {
      for (const m of dest.materialRewards) {
        let qty = Math.floor(m.min + Math.random() * (m.max - m.min + 1));
        if (exp.synergies?.extraMaterialChance && Math.random() < exp.synergies.extraMaterialChance) {
          qty += 2; // Bônus de Rastreador
        }
        if (qty > 0) {
          addToInventory(state, m.matId, qty, 'common', false, callbacks, true);
          materialsRewarded.push({ matId: m.matId, qty });
        }
      }
    }

    // 4. Scroll de Encantamento do Grau do Destino
    if (dest.scrollReward) {
      addToInventory(state, dest.scrollReward, 1, 'uncommon', false, callbacks, true);
    }

    // 5. Baú de Tesouro Bônus (Ladino / Traço Sortudo)
    let bonusChestAwarded = false;
    let bonusScrollId = null;
    if (exp.synergies?.bonusChestChance && Math.random() < exp.synergies.bonusChestChance) {
      bonusChestAwarded = true;
      if (dest.minLevel >= 38) {
        bonusScrollId = 'scroll_blessed_weapon';
      } else if (dest.minLevel >= 28) {
        bonusScrollId = 'scroll_of_enchant_weapon';
      } else {
        bonusScrollId = 'scroll_of_enchant_weapon';
      }
      addToInventory(state, bonusScrollId, 2, 'rare', false, callbacks, true);
    }

    // 6. Distribuição de XP e Lealdade para os mercenários do esquadrão
    const baseMercXp = Math.max(50, Math.floor((dest.duration / 60000) * 10));
    const xpBonusPct = exp.synergies?.extraXpPct || 0;
    const mercXpGained = Math.floor(baseMercXp * (1 + xpBonusPct));

    if (Array.isArray(exp.squad)) {
      for (const mercUid of exp.squad) {
        MercenaryService.addMercenaryXp(state, mercUid, mercXpGained, callbacks);
      }
    }

    // Remove do array de expedições ativas
    list.splice(expIdx, 1);

    if (callbacks.log) {
      let msg = `🎁 **Expedição a ${dest.name} concluída com êxito!** Saque: +${goldEarned.toLocaleString()} Adena, +${shards} Cacos Astrais`;
      if (materialsRewarded.length > 0) {
        msg += ` e recursos vitais coletados`;
      }
      if (bonusChestAwarded) {
        msg += `! 🗝️ **Baú Secreto arrombado pelo Ladino!** (+2 Pergaminhos de Encantamento)`;
      }
      callbacks.log(msg, 'rarity-legendary');
    }

    if (callbacks.floatText) {
      callbacks.floatText(`+${goldEarned.toLocaleString()} Adena!`, 'float-gold');
    }

    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return {
      success: true,
      goldEarned,
      shards,
      materialsRewarded,
      bonusChestAwarded
    };
  }
};
