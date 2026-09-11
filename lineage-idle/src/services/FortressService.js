import { FORTRESSES } from '../data/fortresses.js';
import { BRACELETS, TALISMANS } from '../data/talismans.js';

export class FortressService {
  /**
   * Garante a inicialização do estado de Fortalezas
   */
  static ensureState(state) {
    if (!state.fortresses || typeof state.fortresses !== 'object') {
      state.fortresses = {
        owned: [], // array de IDs de fortalezas conquistadas
        epaulettes: 0,
        lastCollectionTime: Date.now(),
        equippedBracelet: 'bracelet_steel', // ID do bracelete equipado
        equippedTalismans: ['talisman_power'], // Array de até 4 talismãs equipados
        activeSiege: null
      };
    }
    if (!Array.isArray(state.fortresses.owned)) state.fortresses.owned = [];
    if (!Array.isArray(state.fortresses.equippedTalismans)) state.fortresses.equippedTalismans = [];
    if (typeof state.fortresses.epaulettes !== 'number') state.fortresses.epaulettes = 0;
    return state.fortresses;
  }

  /**
   * Inicia o cerco à Fortaleza
   */
  static startFortressSiege(state, fortId, hooks = {}) {
    const fState = this.ensureState(state);
    const fort = FORTRESSES[fortId];
    if (!fort) return { success: false, message: 'Fortaleza não encontrada.' };

    if (state.level < fort.level) {
      return { success: false, message: `Nível ${fort.level}+ necessário para atacar ${fort.name}.` };
    }

    fState.activeSiege = {
      fortId,
      fortName: fort.name,
      generatorsRemaining: fort.generators,
      defenderHp: fort.defenders.hp,
      maxHp: fort.defenders.hp,
      pAtk: fort.defenders.pAtk,
      pDef: fort.defenders.pDef,
      turn: 1,
      isCompleted: false
    };

    hooks.log?.(`⚔️ Ataque iniciado contra **${fort.name}**! Destrua os ${fort.generators} Geradores de Energia da guarnição!`, 'warning');
    hooks.onUpdate?.();
    return { success: true, siege: fState.activeSiege };
  }

  /**
   * Executa um turno no cerco à Fortaleza
   */
  static executeSiegeTurn(state, hooks = {}) {
    const fState = this.ensureState(state);
    const siege = fState.activeSiege;
    if (!siege || siege.isCompleted) {
      return { success: false, message: 'Nenhum cerco de fortaleza ativo.' };
    }

    const playerStats = state.stats || { atk: 3000, matk: 3000 };
    const fort = FORTRESSES[siege.fortId];

    // Destruição dos Geradores de Energia
    if (siege.generatorsRemaining > 0) {
      siege.generatorsRemaining--;
      hooks.log?.(`💥 Gerador de Energia destruído! (${siege.generatorsRemaining} restantes)`, 'combat');
      if (siege.generatorsRemaining === 0) {
        hooks.log?.(`🚩 Todos os geradores foram destruídos! O Capitão da Fortaleza veio para o confronto final!`, 'warning');
      }
      hooks.onUpdate?.();
      return { success: true, stage: 'generators', remaining: siege.generatorsRemaining };
    }

    // Confronto com os Defensores
    const dmg = Math.max(200, Math.floor((playerStats.atk || 2000) * 2.0 - siege.pDef * 0.5));
    siege.defenderHp = Math.max(0, siege.defenderHp - dmg);
    hooks.log?.(`⚔️ Golpe na Guarda da Fortaleza causando **${dmg.toLocaleString()}** de dano! (HP Restante: ${siege.defenderHp.toLocaleString()})`, 'combat');

    if (siege.defenderHp <= 0) {
      siege.isCompleted = true;
      if (!fState.owned.includes(siege.fortId)) {
        fState.owned.push(siege.fortId);
      }
      const epaulettesReward = fort.level * 10;
      fState.epaulettes += epaulettesReward;
      hooks.log?.(`🏆 BANDEIRA HASTEADA! Você conquistou **${fort.name}**! Recompensa: +${epaulettesReward} Knight's Epaulettes e bônus territorial ativado!`, 'victory');
      fState.activeSiege = null;
      hooks.onUpdate?.();
      return { success: true, isVictory: true, fortId: fort.id };
    }

    siege.turn++;
    hooks.onUpdate?.();
    return { success: true, isVictory: false, siege };
  }

  /**
   * Atualiza a produção de Knight's Epaulettes com base nas fortalezas sob posse
   */
  static updateProductionTick(state) {
    const fState = this.ensureState(state);
    if (!fState.owned || fState.owned.length === 0) return;

    const now = Date.now();
    const elapsedMinutes = (now - (fState.lastCollectionTime || now)) / 60000;
    if (elapsedMinutes >= 1) {
      let totalRate = 0;
      for (const fId of fState.owned) {
        const def = FORTRESSES[fId];
        if (def) totalRate += def.epauletteRate;
      }
      const gained = Math.floor(elapsedMinutes * totalRate);
      if (gained > 0) {
        fState.epaulettes += gained;
        fState.lastCollectionTime = now;
      }
    }
  }

  /**
   * Comprar/Equipar Bracelete
   */
  static buyBracelet(state, braceletId, hooks = {}) {
    const fState = this.ensureState(state);
    const def = BRACELETS[braceletId];
    if (!def) return { success: false, message: 'Bracelete não encontrado.' };

    if (fState.epaulettes < def.costEpaulettes) {
      return { success: false, message: `Knight's Epaulettes insuficientes. Requer ${def.costEpaulettes}.` };
    }

    fState.epaulettes -= def.costEpaulettes;
    fState.equippedBracelet = braceletId;
    // Ajusta o limite de talismãs caso o novo bracelete tenha menos slots
    if (fState.equippedTalismans.length > def.slots) {
      fState.equippedTalismans = fState.equippedTalismans.slice(0, def.slots);
    }

    hooks.log?.(`📿 Você forjou e equipou **${def.name}** (${def.slots} Slots de Talismã)!`, 'gain');
    hooks.onUpdate?.();
    return { success: true, bracelet: def };
  }

  /**
   * Comprar e equipar um Talismã
   */
  static equipTalisman(state, talismanId, hooks = {}) {
    const fState = this.ensureState(state);
    const def = TALISMANS[talismanId];
    if (!def) return { success: false, message: 'Talismã não encontrado.' };

    const bracelet = BRACELETS[fState.equippedBracelet] || BRACELETS['bracelet_steel'];
    const maxSlots = bracelet.slots;

    if (fState.equippedTalismans.includes(talismanId)) {
      return { success: false, message: 'Este talismã já está equipado.' };
    }

    if (fState.equippedTalismans.length >= maxSlots) {
      return { success: false, message: `Seu bracelete só suporta ${maxSlots} talismã(s). Remova um antes de equipar.` };
    }

    if (fState.epaulettes < def.costEpaulettes) {
      return { success: false, message: `Knight's Epaulettes insuficientes. Requer ${def.costEpaulettes}.` };
    }

    fState.epaulettes -= def.costEpaulettes;
    fState.equippedTalismans.push(talismanId);

    hooks.log?.(`✨ Talismã **${def.name}** equipado com sucesso no bracelete! (${fState.equippedTalismans.length}/${maxSlots})`, 'gain');
    hooks.onUpdate?.();
    return { success: true, talisman: def };
  }

  /**
   * Remover um Talismã equipado
   */
  static unequipTalisman(state, talismanId, hooks = {}) {
    const fState = this.ensureState(state);
    const idx = fState.equippedTalismans.indexOf(talismanId);
    if (idx === -1) return { success: false, message: 'Talismã não está equipado.' };

    fState.equippedTalismans.splice(idx, 1);
    hooks.log?.(`Talismã removido do bracelete.`, 'system');
    hooks.onUpdate?.();
    return { success: true };
  }

  /**
   * Calcula todos os bônus ativos de Fortalezas e Talismãs
   */
  static getBonuses(state) {
    const fState = this.ensureState(state);
    const res = {
      pAtkMult: 0,
      mAtkMult: 0,
      pDefMult: 0,
      mDefMult: 0,
      crit: 0,
      critDmg: 0,
      hpMult: 0,
      mpRegen: 0,
      speed: 0,
      eva: 0,
      pvpDmg: 0
    };

    // Bônus territoriais das Fortalezas possuídas
    for (const fId of fState.owned) {
      const fort = FORTRESSES[fId];
      if (fort && fort.buff) {
        if (fort.buff.stat === 'pDef') res.pDefMult += fort.buff.val;
        else if (fort.buff.stat === 'mDef') res.mDefMult += fort.buff.val;
        else if (fort.buff.stat === 'pAtk') res.pAtkMult += fort.buff.val;
        else if (fort.buff.stat === 'matk') res.mAtkMult += fort.buff.val;
        else if (fort.buff.stat === 'crit') res.crit += fort.buff.val;
      }
    }

    // Bônus dos Talismãs equipados
    const isDynasty = fState.equippedBracelet === 'bracelet_dynasty';
    const mult = isDynasty ? 1.10 : 1.0;

    for (const tId of fState.equippedTalismans) {
      const tal = TALISMANS[tId];
      if (tal && tal.stats) {
        if (tal.stats.pAtkMult) res.pAtkMult += tal.stats.pAtkMult * mult;
        if (tal.stats.mAtkMult) res.mAtkMult += tal.stats.mAtkMult * mult;
        if (tal.stats.pDefMult) res.pDefMult += tal.stats.pDefMult * mult;
        if (tal.stats.mDefMult) res.mDefMult += tal.stats.mDefMult * mult;
        if (tal.stats.crit) res.crit += Math.floor(tal.stats.crit * mult);
        if (tal.stats.critDmg) res.critDmg += tal.stats.critDmg * mult;
        if (tal.stats.hpMult) res.hpMult += tal.stats.hpMult * mult;
        if (tal.stats.mpRegen) res.mpRegen += tal.stats.mpRegen * mult;
        if (tal.stats.speed) res.speed += Math.floor(tal.stats.speed * mult);
        if (tal.stats.eva) res.eva += Math.floor(tal.stats.eva * mult);
        if (tal.stats.pvpDmg) res.pvpDmg += tal.stats.pvpDmg * mult;
      }
    }

    return {
      ...res,
      pAtk: res.pAtkMult,
      mAtk: res.mAtkMult,
      pDef: res.pDefMult,
      mDef: res.mDefMult
    };
  }
}
