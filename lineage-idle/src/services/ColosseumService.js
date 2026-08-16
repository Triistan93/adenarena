import { DUEL_BET_TIERS, DUEL_OPPONENT_ARCHETYPES, SURVIVAL_WAVES, COLOSSEUM_SHOP_CATALOG } from '../data/colosseum.js';

export class ColosseumService {
  /**
   * Garante a inicialização do estado do Coliseu
   */
  static ensureState(state) {
    if (!state.colosseum || typeof state.colosseum !== 'object') {
      state.colosseum = {
        badges: 0,
        duelWins: 0,
        duelLosses: 0,
        highestWave: 0,
        activeDuel: null,
        activeSurvival: null
      };
    }
    if (typeof state.colosseum.badges !== 'number') state.colosseum.badges = 0;
    return state.colosseum;
  }

  /**
   * Inicia um Duelo 1v1 com Aposta
   */
  static startDuel(state, tierId, hooks = {}) {
    const colState = this.ensureState(state);
    const tier = DUEL_BET_TIERS.find(t => t.id === tierId) || DUEL_BET_TIERS[0];

    if ((state.gold || 0) < tier.bet) {
      return { success: false, message: `Ouro insuficiente para cobrir a aposta de ${tier.bet.toLocaleString()}g.` };
    }

    // Deduz a aposta
    state.gold -= tier.bet;

    // Seleciona um arquétipo aleatório
    const arch = DUEL_OPPONENT_ARCHETYPES[Math.floor(Math.random() * DUEL_OPPONENT_ARCHETYPES.length)];
    const pStats = state.stats || { atk: 2000, def: 1800, maxHp: 8000 };

    const oppHp = Math.floor((pStats.maxHp || 8000) * (arch.hpMult || 1.0));
    const oppPAtk = Math.floor((pStats.atk || 2000) * (arch.pAtkMult || 1.0));
    const oppPDef = Math.floor((pStats.def || 1800) * (arch.pDefMult || 1.0));

    colState.activeDuel = {
      tierId: tier.id,
      bet: tier.bet,
      rewardAA: tier.rewardAA,
      opponentName: arch.name,
      opponentTitle: arch.title,
      opponentIcon: arch.icon,
      hp: oppHp,
      maxHp: oppHp,
      pAtk: oppPAtk,
      pDef: oppPDef,
      playerHp: state.hp || pStats.maxHp,
      playerMaxHp: pStats.maxHp,
      turn: 1
    };

    hooks.log?.(`⚔️ Duelo iniciado na Arena de Giran contra **${arch.name}**! Aposta: ${tier.bet.toLocaleString()}g`, 'warning');
    hooks.onUpdate?.();
    return { success: true, duel: colState.activeDuel };
  }

  /**
   * Executa um turno no Duelo 1v1
   */
  static executeDuelTurn(state, hooks = {}) {
    const colState = this.ensureState(state);
    const duel = colState.activeDuel;
    if (!duel) return { success: false, message: 'Nenhum duelo ativo.' };

    const pStats = state.stats || { atk: 2500, def: 2000 };
    const pDmg = Math.max(150, Math.floor((pStats.atk || 2000) * 1.6 - duel.pDef * 0.4));
    duel.hp = Math.max(0, duel.hp - pDmg);

    hooks.log?.(`⚔️ Seu golpe atingiu **${duel.opponentName}** causando **${pDmg.toLocaleString()}** de dano! (${duel.hp.toLocaleString()} HP restante)`, 'combat');

    if (duel.hp <= 0) {
      // Vitória!
      const winGold = duel.bet * 2;
      state.gold = (state.gold || 0) + winGold;
      colState.badges += 10;
      colState.duelWins++;

      hooks.log?.(`🏆 VITÓRIA NO DUELO! Você derrotou **${duel.opponentName}**! Prêmio: +${winGold.toLocaleString()}g e +10 Colosseum Badges!`, 'victory');
      colState.activeDuel = null;
      hooks.onUpdate?.();
      return { success: true, isVictory: true, goldWon: winGold };
    }

    // Contra-ataque do oponente
    const oppDmg = Math.max(100, Math.floor(duel.pAtk * 1.4 - (pStats.def || 1800) * 0.3));
    state.hp = Math.max(1, (state.hp || 5000) - oppDmg);
    hooks.log?.(`💥 **${duel.opponentName}** desferiu uma combinação de golpes causando **${oppDmg.toLocaleString()}** de dano no seu herói!`, 'danger');

    duel.turn++;
    hooks.onUpdate?.();
    return { success: true, isVictory: false, duel };
  }

  /**
   * Inicia o Desafio de Sobrevivência (Survival Waves 1 a 10)
   */
  static startSurvival(state, hooks = {}) {
    const colState = this.ensureState(state);
    const wave1 = SURVIVAL_WAVES[0];

    colState.activeSurvival = {
      waveIndex: 0,
      waveData: wave1,
      currentHp: wave1.hp,
      maxHp: wave1.hp,
      pAtk: wave1.pAtk,
      pDef: wave1.pDef,
      totalBadgesAccumulated: 0,
      isCompleted: false
    };

    hooks.log?.(`🔥 Desafio de Sobrevivência do Coliseu iniciado! Onda 1/10: **${wave1.name}**!`, 'warning');
    hooks.onUpdate?.();
    return { success: true, survival: colState.activeSurvival };
  }

  /**
   * Executa um turno no Desafio de Sobrevivência
   */
  static executeSurvivalTurn(state, hooks = {}) {
    const colState = this.ensureState(state);
    const s = colState.activeSurvival;
    if (!s || s.isCompleted) return { success: false, message: 'Nenhum desafio de sobrevivência ativo.' };

    const pStats = state.stats || { atk: 3000, def: 2500 };
    const pDmg = Math.max(200, Math.floor((pStats.atk || 2500) * 1.8 - s.pDef * 0.4));
    s.currentHp = Math.max(0, s.currentHp - pDmg);

    hooks.log?.(`⚔️ Golpe na Onda ${s.waveIndex + 1} causando **${pDmg.toLocaleString()}** de dano! (${s.currentHp.toLocaleString()} HP restante)`, 'combat');

    if (s.currentHp <= 0) {
      // Onda superada
      const waveEarnedBadges = s.waveData.badges;
      s.totalBadgesAccumulated += waveEarnedBadges;
      colState.badges += waveEarnedBadges;

      if (s.waveIndex + 1 > colState.highestWave) {
        colState.highestWave = s.waveIndex + 1;
      }

      hooks.log?.(`✨ Onda ${s.waveIndex + 1} superada! (+${waveEarnedBadges} Badges do Coliseu)`, 'gain');

      if (s.waveIndex + 1 >= SURVIVAL_WAVES.length) {
        // Concluiu as 10 ondas
        s.isCompleted = true;
        colState.activeSurvival = null;
        hooks.log?.(`👑 CAMPEÃO SUPREMO DO COLISEU! Você superou todas as 10 Ondas de Sobrevivência!`, 'victory');
        hooks.onUpdate?.();
        return { success: true, isCompleted: true, totalBadges: s.totalBadgesAccumulated };
      }

      // Avança para a próxima onda
      s.waveIndex++;
      s.waveData = SURVIVAL_WAVES[s.waveIndex];
      s.currentHp = s.waveData.hp;
      s.maxHp = s.waveData.hp;
      s.pAtk = s.waveData.pAtk;
      s.pDef = s.waveData.pDef;

      hooks.log?.(`⚠️ Atenção! Onda ${s.waveIndex + 1}/10 adentrou a arena: **${s.waveData.name}**!`, 'warning');
      hooks.onUpdate?.();
      return { success: true, nextWave: s.waveIndex + 1 };
    }

    hooks.onUpdate?.();
    return { success: true, isVictory: false, survival: s };
  }

  /**
   * Compra itens na Loja do Coliseu com Badges
   */
  static buyShopItem(state, itemId, hooks = {}) {
    const colState = this.ensureState(state);
    const item = COLOSSEUM_SHOP_CATALOG.find(i => i.id === itemId);
    if (!item) return { success: false, message: 'Item não encontrado na Loja do Coliseu.' };

    if (colState.badges < item.costBadges) {
      return { success: false, message: `Badges insuficientes. Requer ${item.costBadges} Colosseum Badges.` };
    }

    colState.badges -= item.costBadges;
    state.inventory = state.inventory || [];
    state.inventory.push({
      id: item.id,
      itemId: item.id,
      name: item.name,
      uid: 'colosseum_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      count: 1
    });

    hooks.log?.(`🛒 Você adquiriu **${item.name}** por **${item.costBadges} Badges**!`, 'gain');
    hooks.onUpdate?.();
    return { success: true, item };
  }
}
