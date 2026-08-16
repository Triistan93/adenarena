/**
 * ClanService.js — Gerenciamento de Clãs, Guerras de Cerco (Castle Sieges) e Renda de Castelos.
 */

import { CLAN_LEVEL_DATA, CLAN_SKILLS } from '../data/clan.js';
import { CASTLES, CASTLE_SHOP_CATALOG } from '../data/castles.js';

export class ClanService {
  /**
   * Retorna o estado do Clã do jogador e seus atributos agregados.
   */
  static getClanStatus(state) {
    if (!state.clan) {
      state.clan = {
        name: 'Os Guardiões de Aden',
        level: 1,
        castles: [],
        lastTaxTimestamp: Date.now(),
        accumulatedTaxes: {}
      };
    }

    const lvlData = CLAN_LEVEL_DATA[state.clan.level] || CLAN_LEVEL_DATA[1];
    
    // Obter todas as habilidades desbloqueadas até o nível atual do clã
    const unlockedSkillIds = [];
    for (let l = 1; l <= state.clan.level; l++) {
      const d = CLAN_LEVEL_DATA[l];
      if (d && d.unlockedSkills) {
        unlockedSkillIds.push(...d.unlockedSkills);
      }
    }

    const activeSkills = unlockedSkillIds.map(id => CLAN_SKILLS[id]).filter(Boolean);

    // Calcular bônus totais de Clã
    let pAtkBonusPercent = 0;
    let pDefBonusPercent = 0;
    let mAtkBonusPercent = 0;
    let mDefBonusPercent = 0;
    let hpBonusPercent = 0;
    let cpBonusPercent = 0;
    let regenBonusPercent = 0;
    let speedBonus = 0;

    for (const sk of activeSkills) {
      if (sk.stats.pAtkPercent) pAtkBonusPercent += sk.stats.pAtkPercent;
      if (sk.stats.pDefPercent) pDefBonusPercent += sk.stats.pDefPercent;
      if (sk.stats.mAtkPercent) mAtkBonusPercent += sk.stats.mAtkPercent;
      if (sk.stats.mDefPercent) mDefBonusPercent += sk.stats.mDefPercent;
      if (sk.stats.hpPercent) hpBonusPercent += sk.stats.hpPercent;
      if (sk.stats.cpPercent) cpBonusPercent += sk.stats.cpPercent;
      if (sk.stats.regenPercent) regenBonusPercent += sk.stats.regenPercent;
      if (sk.stats.speedBonus) speedBonus += sk.stats.speedBonus;
    }

    return {
      clan: state.clan,
      levelData: lvlData,
      nextLevelData: CLAN_LEVEL_DATA[state.clan.level + 1] || null,
      activeSkills,
      bonusStats: {
        pAtkBonusPercent,
        pDefBonusPercent,
        mAtkBonusPercent,
        mDefBonusPercent,
        hpBonusPercent,
        cpBonusPercent,
        regenBonusPercent,
        speedBonus
      },
      ownedCastles: state.clan.castles || []
    };
  }

  /**
   * Evolui o Clã para o próximo nível.
   */
  static upgradeClan(state, callbacks = {}) {
    const { log = console.log, onUpdate = () => {} } = callbacks;
    const status = this.getClanStatus(state);

    if (!status.nextLevelData) {
      log('Seu Clã já alcançou o nível máximo (Nível 5 - Ordem Imperial)!', 'warning');
      return { success: false, reason: 'max_level' };
    }

    const next = status.nextLevelData;
    const playerLevel = state.level || 1;

    if (playerLevel < next.reqCharLevel) {
      log(`Requer Nível de Personagem ${next.reqCharLevel}+ para elevar o Clã ao Nível ${next.level}.`, 'error');
      return { success: false, reason: 'level_low' };
    }

    if ((state.gold || 0) < next.costAdena) {
      log(`Adena insuficiente. Requer ${next.costAdena.toLocaleString()} Adena para o upgrade do Clã.`, 'error');
      return { success: false, reason: 'gold_low' };
    }

    if ((state.sp || 0) < next.costSp) {
      log(`Pontos de SP insuficientes. Requer ${next.costSp.toLocaleString()} SP para o upgrade do Clã.`, 'error');
      return { success: false, reason: 'sp_low' };
    }

    // Consumir custos
    state.gold -= next.costAdena;
    state.sp -= next.costSp;
    state.clan.level = next.level;

    log(`🎉 Parabéns! Seu Clã ascendeu para o Nível ${next.level} (${next.title})!`, 'success');
    log(`✨ Novas Habilidades de Clã desbloqueadas: ${next.unlockedSkills.map(id => CLAN_SKILLS[id]?.name).join(', ')}`, 'info');

    onUpdate();
    return { success: true, newLevel: next.level };
  }

  /**
   * Inicia o Cerco a um Castelo (Castle Siege).
   */
  static startSiege(state, castleId, callbacks = {}) {
    const { log = console.log, onUpdate = () => {} } = callbacks;
    const castle = CASTLES[castleId];

    if (!castle) {
      return { success: false, reason: 'invalid_castle' };
    }

    if ((state.clan?.level || 1) < castle.reqClanLevel) {
      log(`Apenas Clãs de Nível ${castle.reqClanLevel}+ podem declarar Cerco a ${castle.name}.`, 'error');
      return { success: false, reason: 'clan_level_low' };
    }

    if ((state.level || 1) < castle.reqCharLevel) {
      log(`Nível de personagem insuficiente. Requer Nível ${castle.reqCharLevel}+ para cercar ${castle.name}.`, 'error');
      return { success: false, reason: 'char_level_low' };
    }

    state.activeSiege = {
      castleId,
      castleName: castle.name,
      phase: 1, // 1: Portões, 2: Guardas, 3: Seal of Ruler
      gateHp: castle.siege.gateHp,
      maxGateHp: castle.siege.gateHp,
      guardsHp: castle.siege.guardsHp,
      maxGuardsHp: castle.siege.guardsHp,
      castRounds: 0,
      reqCastRounds: castle.siege.castRoundsRequired,
      isCompleted: false,
      logs: [`⚔️ Cerco a ${castle.name} declarado! Fase 1: Ataque aos Portões Exteriores.`]
    };

    log(`🏰 As trombetas de guerra ecoam! O cerco a ${castle.name} começou!`, 'warning');
    onUpdate();
    return { success: true, siege: state.activeSiege };
  }

  /**
   * Executa uma rodada de ação do Cerco (Phase-based progression).
   */
  static executeSiegeTurn(state, callbacks = {}) {
    const { log = console.log, onUpdate = () => {} } = callbacks;
    const siege = state.activeSiege;

    if (!siege || siege.isCompleted) {
      return { success: false, reason: 'no_active_siege' };
    }

    const castle = CASTLES[siege.castleId];
    if (!castle) return { success: false };

    const pAtk = Math.max(50, state.stats?.atk || 200);
    const mAtk = Math.max(50, state.stats?.matk || 200);
    const totalDmg = Math.round((pAtk * 1.5 + mAtk * 1.2) * (0.9 + Math.random() * 0.25));

    // FASE 1: Destruição dos Portões Exteriores
    if (siege.phase === 1) {
      const dmgToGate = Math.max(100, Math.round(totalDmg * 2.2)); // Bônus de aríete/golem de cerco
      siege.gateHp = Math.max(0, siege.gateHp - dmgToGate);

      const msg = `💥 Aríetes e catapultas do Clã causaram -${dmgToGate.toLocaleString()} de dano aos Portões! (HP: ${siege.gateHp.toLocaleString()}/${siege.maxGateHp.toLocaleString()})`;
      siege.logs.unshift(msg);
      log(msg, 'info');

      if (siege.gateHp <= 0) {
        siege.phase = 2;
        const advMsg = `⚡ Os Portões de ${castle.name} vieram abaixo! Fase 2: Invasão ao Pátio & Confronto com a Guarda Real!`;
        siege.logs.unshift(advMsg);
        log(advMsg, 'warning');
      }
    }
    // FASE 2: Confronto com os Guardas Reais
    else if (siege.phase === 2) {
      const dmgToGuards = Math.max(100, Math.round(totalDmg * 1.4));
      siege.guardsHp = Math.max(0, siege.guardsHp - dmgToGuards);

      const msg = `⚔️ Seus guerreiros desferiram golpes ferozes na Guarda Real causando -${dmgToGuards.toLocaleString()} de dano!`;
      siege.logs.unshift(msg);
      log(msg, 'info');

      if (siege.guardsHp <= 0) {
        siege.phase = 3;
        const advMsg = `👑 Os Guardas Reais foram derrotados! Fase 3: Entrada na Sala do Trono para canalizar o SEAL OF RULER!`;
        siege.logs.unshift(advMsg);
        log(advMsg, 'warning');
      }
    }
    // FASE 3: Canalização do Seal of Ruler
    else if (siege.phase === 3) {
      siege.castRounds += 1;
      const castMsg = `✨ Canalizando Seal of Ruler... (${siege.castRounds}/${siege.reqCastRounds} rodadas concluídas sem interrupção).`;
      siege.logs.unshift(castMsg);
      log(castMsg, 'info');

      if (siege.castRounds >= siege.reqCastRounds) {
        siege.isCompleted = true;
        
        if (!state.clan.castles.includes(siege.castleId)) {
          state.clan.castles.push(siege.castleId);
        }

        const victoryReward = 5000000;
        state.gold = (state.gold || 0) + victoryReward;

        const triumphMsg = `🏆 VITÓRIA SUPREMA! O Selo foi gravado no Altar Sagrado! ${state.name || 'Seu Clã'} é agora o legítimo Senhor de ${castle.name}! (+${victoryReward.toLocaleString()} Adena do Tesouro)`;
        siege.logs.unshift(triumphMsg);
        log(triumphMsg, 'success');
      }
    }

    onUpdate();
    return { success: true, siege };
  }

  /**
   * Coleta as taxas acumuladas de um castelo possuído.
   */
  static claimCastleTaxes(state, castleId, callbacks = {}) {
    const { log = console.log, onUpdate = () => {} } = callbacks;
    const castle = CASTLES[castleId];

    if (!castle || !(state.clan?.castles || []).includes(castleId)) {
      log('Seu Clã não governa este castelo para recolher taxas.', 'error');
      return { success: false, reason: 'not_owner' };
    }

    const taxes = state.clan.accumulatedTaxes?.[castleId] || 0;
    if (taxes <= 0) {
      log(`Não há taxas acumuladas no tesouro de ${castle.name} no momento.`, 'warning');
      return { success: false, amount: 0 };
    }

    state.gold = (state.gold || 0) + taxes;
    state.clan.accumulatedTaxes[castleId] = 0;

    log(`💰 Você recolheu ${taxes.toLocaleString()} Adena em tributos reais do tesouro de ${castle.name}!`, 'success');
    onUpdate();
    return { success: true, amount: taxes };
  }

  /**
   * Atualiza a geração periódica de taxas dos castelos governados.
   */
  static updateTaxesTick(state) {
    if (!state.clan || !state.clan.castles || state.clan.castles.length === 0) return;

    if (!state.clan.accumulatedTaxes) state.clan.accumulatedTaxes = {};
    const now = Date.now();
    const lastTime = state.clan.lastTaxTimestamp || now;
    const diffMinutes = Math.min(120, Math.floor((now - lastTime) / 60000)); // Cap de 2 horas por tick

    if (diffMinutes >= 1) {
      for (const castleId of state.clan.castles) {
        const castle = CASTLES[castleId];
        if (castle && castle.adenaPerMinute) {
          const generated = castle.adenaPerMinute * diffMinutes;
          state.clan.accumulatedTaxes[castleId] = (state.clan.accumulatedTaxes[castleId] || 0) + generated;
        }
      }
      state.clan.lastTaxTimestamp = now;
    }
  }

  /**
   * Compra um item da Loja Exclusiva do Castelo.
   */
  static buyCastleShopItem(state, itemId, callbacks = {}) {
    const { log = console.log, onUpdate = () => {} } = callbacks;
    const item = CASTLE_SHOP_CATALOG.find(i => i.id === itemId);

    if (!item) {
      log('Item não encontrado na Loja do Castelo.', 'error');
      return { success: false, reason: 'item_not_found' };
    }

    if (!state.clan?.castles || state.clan.castles.length === 0) {
      log('Apenas Lordes de Castelo podem adquirir itens da Loja Real.', 'error');
      return { success: false, reason: 'no_castle' };
    }

    if ((state.gold || 0) < item.priceAdena) {
      log(`Adena insuficiente. Preço: ${item.priceAdena.toLocaleString()} Adena.`, 'error');
      return { success: false, reason: 'gold_low' };
    }

    state.gold -= item.priceAdena;

    // Adicionar item ao inventário
    if (!state.inventory) state.inventory = [];
    const existing = state.inventory.find(i => (typeof i === 'object' ? i.id : i) === item.id);

    if (existing && typeof existing === 'object' && existing.count) {
      existing.count += (item.count || 1);
    } else {
      state.inventory.push({
        id: item.id,
        name: item.name,
        slot: item.slot || 'misc',
        tier: 5,
        price: item.priceAdena,
        stats: item.stats || {},
        icon: item.icon,
        desc: item.desc
      });
    }

    log(`✨ Você adquiriu ${item.name} da Loja do Castelo!`, 'success');
    onUpdate();
    return { success: true };
  }
}
