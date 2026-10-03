/**
 * ClanService.js — Gerenciamento de Clãs, Guerras de Cerco (Castle Sieges) e Renda de Castelos.
 */

import { CLAN_LEVEL_DATA, CLAN_SKILLS } from '../data/clan.js';
import { CASTLES, CASTLE_SHOP_CATALOG } from '../data/castles.js';
import { addToInventory } from './InventoryService.js';

export class ClanService {
  static hasClan(state) {
    return Boolean(
      state?.clan &&
      typeof state.clan.name === 'string' &&
      state.clan.name.trim().length >= 3 &&
      Number.isSafeInteger(state.clan.level) &&
      state.clan.level >= 1
    );
  }

  /**
   * Retorna o estado do Clã do jogador e seus atributos agregados.
   */
  static getClanStatus(state) {
    if (!this.hasClan(state)) {
      return {
        clan: null,
        levelData: null,
        nextLevelData: null,
        activeSkills: [],
        bonusStats: {
          pAtkBonusPercent: 0,
          pDefBonusPercent: 0,
          mAtkBonusPercent: 0,
          mDefBonusPercent: 0,
          hpBonusPercent: 0,
          cpBonusPercent: 0,
          regenBonusPercent: 0,
          speedBonus: 0
        },
        ownedCastles: []
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
    if (!this.hasClan(state)) {
      log('Você precisa pertencer a um clã para contribuir com sua evolução.', 'error');
      return { success: false, reason: 'no_clan' };
    }
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

    if (state.activeSiege && !state.activeSiege.isCompleted) {
      log('Seu Clã já está em um cerco. Conclua ou encerre o confronto atual antes de declarar outro.', 'warning');
      return { success: false, reason: 'siege_in_progress' };
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

    const outputItemId = item.outputItemId || item.id;
    const quantity = Number.isSafeInteger(item.count) && item.count > 0 ? item.count : 1;
    const trialState = { ...state, inventory: (state.inventory || []).map(entry => ({ ...entry })) };
    const added = addToInventory(trialState, outputItemId, quantity, null, false, { log }, true);
    if (!added) {
      log('Não há espaço suficiente na mochila para essa compra.', 'error');
      return { success: false, reason: 'inventory_full' };
    }

    state.inventory = trialState.inventory;
    state.gold -= item.priceAdena;

    log(`✨ Você adquiriu ${item.name} da Loja do Castelo!`, 'success');
    onUpdate();
    return { success: true };
  }

  /**
   * Cria ou edita as informações do Clã (Nome, Lema, Brasão).
   */
  static createOrEditClan(state, name, motto, callbacks = {}) {
    const { log = console.log, onUpdate = () => {}, floatText = () => {} } = callbacks;
    const cleanName = String(name || '').trim();
    if (!cleanName || cleanName.length < 3) {
      log('O nome do Clã deve ter pelo menos 3 caracteres.', 'error');
      return { success: false, reason: 'name_too_short' };
    }
    const isNew = !state.clan || !state.clan.name || state.clan.name === 'Os Guardiões de Aden';
    const cost = isNew ? 100000 : 250000;
    if ((state.gold || 0) < cost) {
      log(`Adena insuficiente para fundar/renomear o Clã (${cost.toLocaleString()} Adena necessária).`, 'error');
      return { success: false, reason: 'gold_low' };
    }
    state.gold -= cost;
    if (!state.clan) {
      state.clan = { level: 1, castles: [], lastTaxTimestamp: Date.now(), accumulatedTaxes: {} };
    }
    state.clan.name = cleanName;
    state.clan.level = Math.max(state.clan.level || 0, 1);
    state.clan.motto = motto || 'Pela Glória de Aden!';
    state.clan.reputation = state.clan.reputation || 100;
    state.clan.donationsAdena = state.clan.donationsAdena || 0;
    state.clan.donationsSp = state.clan.donationsSp || 0;

    log(`🏰 Clã **[${cleanName}]** ${isNew ? 'fundado com sucesso' : 'atualizado'}! Lema: "${state.clan.motto}"`, 'rarity-legendary');
    floatText(`🏰 CLÃ FUNDADO!`, 'float-jackpot');
    onUpdate();
    return { success: true, clan: state.clan };
  }

  /**
   * Realiza doação de Adena/SP para o avanço da Reputação e EXP do Clã.
   */
  static donateToClan(state, adenaAmt = 0, spAmt = 0, callbacks = {}) {
    const { log = console.log, onUpdate = () => {}, floatText = () => {} } = callbacks;
    if (!this.hasClan(state)) {
      log('Você precisa pertencer a um clã para fazer uma contribuição.', 'error');
      return { success: false, reason: 'no_clan' };
    }
    if (!Number.isSafeInteger(adenaAmt) || !Number.isSafeInteger(spAmt) || adenaAmt < 0 || spAmt < 0 || (adenaAmt === 0 && spAmt === 0)) {
      log('Informe uma quantidade inteira e positiva de Adena e/ou SP para doar.', 'error');
      return { success: false, reason: 'invalid_amount' };
    }

    if ((state.gold || 0) < adenaAmt) {
      log('Adena insuficiente para realizar a doação.', 'error');
      return { success: false, reason: 'gold_low' };
    }
    if ((state.sp || 0) < spAmt) {
      log('SP insuficiente para realizar a doação.', 'error');
      return { success: false, reason: 'sp_low' };
    }

    state.gold -= adenaAmt;
    state.sp -= spAmt;
    if (!state.clan) this.getClanStatus(state);

    const repGained = Math.floor(adenaAmt / 5000) + Math.floor(spAmt / 100);
    state.clan.reputation = (state.clan.reputation || 0) + repGained;
    state.clan.donationsAdena = (state.clan.donationsAdena || 0) + adenaAmt;
    state.clan.donationsSp = (state.clan.donationsSp || 0) + spAmt;

    log(`🛡️ Doação de Clã concluída: +${adenaAmt.toLocaleString()} Adena, +${spAmt.toLocaleString()} SP. Reputação do Clã: **+${repGained}**!`, 'rarity-epic');
    floatText(`+${repGained} Reputação`, 'float-epic');
    onUpdate();
    return { success: true, repGained };
  }

  /**
   * Ativa bênçãos mágicas do Clan Hall.
   */
  static activateClanHallBuff(state, buffId, callbacks = {}) {
    const { log = console.log, onUpdate = () => {}, floatText = () => {} } = callbacks;
    const buff = CLAN_HALL_BUFFS[buffId];
    if (!buff) return { success: false, reason: 'invalid_buff' };

    if (!this.hasClan(state)) {
      log('Você precisa pertencer a um clã com Clan Hall para usar suas bênçãos.', 'error');
      return { success: false, reason: 'no_clan' };
    }

    if ((state.clan.hall?.level || 0) < 1) {
      log('Seu clã ainda não possui um Clan Hall ativo.', 'error');
      return { success: false, reason: 'hall_unavailable' };
    }

    if ((state.gold || 0) < buff.costAdena) {
      log(`Adena insuficiente para ativar ${buff.name} (${buff.costAdena.toLocaleString()} Adena).`, 'error');
      return { success: false, reason: 'gold_low' };
    }

    state.gold -= buff.costAdena;
    state.buffs = state.buffs || {};
    state.buffs['clan_hall_' + buffId] = {
      until: Date.now() + buff.durationMs,
      amount: 1,
      name: buff.name
    };

    log(`✨ **[Clan Hall]** ${buff.name} ativada por 1 hora! (${buff.desc})`, 'rarity-legendary');
    floatText(`✨ ${buff.name.toUpperCase()}!`, 'float-jackpot');
    onUpdate();
    return { success: true };
  }

  /**
   * Retorna o progresso dos contratos coletivos de clã para a temporada ativa.
   */
  static getClanContractsProgress(state) {
    if (!this.hasClan(state)) return [];
    state.clan.contracts = state.clan.contracts || {
      monster_hunt: { current: 0, completed: false },
      treasury_donation: { current: 0, completed: false },
      expedition_conquest: { current: 0, completed: false }
    };
    const definitions = [
      {
        id: 'monster_hunt',
        name: 'Frente de Batalha de Aden',
        desc: 'Elimine monstros nas zonas do reino para abastecer a guarnição do clã.',
        target: 200,
        rewardDesc: '+10% EXP de Caça por 24h & +500 Reputação',
        rewardStats: { xpBoost: 0.10 }
      },
      {
        id: 'treasury_donation',
        name: 'Provisões do Estandarte',
        desc: 'Contribua com Adena no tesouro imperial para reforçar o clã.',
        target: 100000,
        rewardDesc: '+10% Drop de Adena por 24h & +500 Reputação',
        rewardStats: { goldBoost: 0.10 }
      },
      {
        id: 'expedition_conquest',
        name: 'Reconhecimento de Fronteira',
        desc: 'Conclua expedições cartográficas para expandir a influência da casa.',
        target: 10,
        rewardDesc: '+500 Reputação & Bênção do Estandarte',
        rewardStats: { pAtkPercent: 0.05, pDefPercent: 0.05 }
      }
    ];

    return definitions.map(def => {
      const prog = state.clan.contracts[def.id] || { current: 0, completed: false };
      return {
        ...def,
        current: prog.current,
        completed: prog.completed,
        percent: Math.min(100, Math.floor(((prog.current || 0) / def.target) * 100))
      };
    });
  }

  /**
   * Registra contribuição para um objetivo coletivo de clã e concede a bênção ao atingir a meta.
   */
  static progressClanContract(state, contractId, amount = 1, callbacks = {}) {
    const { log = console.log, onUpdate = () => {} } = callbacks;
    if (!this.hasClan(state)) {
      return { success: false, reason: 'no_clan' };
    }
    const contracts = this.getClanContractsProgress(state);
    const targetContract = contracts.find(c => c.id === contractId);
    if (!targetContract) {
      return { success: false, reason: 'invalid_contract' };
    }
    state.clan.contracts = state.clan.contracts || {};
    const prog = state.clan.contracts[contractId] || { current: 0, completed: false };
    if (prog.completed) {
      return { success: false, reason: 'already_completed' };
    }

    const added = Math.max(1, Math.floor(Number(amount) || 1));
    prog.current = Math.min(targetContract.target, (prog.current || 0) + added);

    if (prog.current >= targetContract.target) {
      prog.completed = true;
      state.clan.reputation = (state.clan.reputation || 0) + 500;
      state.buffs = state.buffs || {};
      state.buffs['clan_contract_' + contractId] = {
        until: Date.now() + 86400000,
        amount: 1,
        name: `Estandarte: ${targetContract.name}`
      };
      state.clan.contracts[contractId] = prog;
      log(`🚩 **[Objetivo de Clã Concluído!]** ${targetContract.name} atingiu a meta! Bênção do Estandarte ativa por 24h (+500 Reputação).`, 'rarity-legendary');
      onUpdate();
      return { success: true, completed: true, contract: targetContract };
    }

    state.clan.contracts[contractId] = prog;
    onUpdate();
    return { success: true, completed: false, current: prog.current, target: targetContract.target };
  }

  /**
   * Retorna somente membros persistidos no save. A lista social canônica virá do serviço online.
   */
  static getClanRoster(state) {
    if (!this.hasClan(state) || !Array.isArray(state.clan.members)) return [];
    return state.clan.members.filter(member =>
      member && typeof member.name === 'string' && member.name.trim().length > 0
    );
  }
}

export const CLAN_HALL_BUFFS = {
  eva_blessing: {
    id: 'eva_blessing',
    name: 'Bênção de Eva',
    icon: '💧',
    desc: '+20% MP Regen e -10% Consumo de Mana',
    costAdena: 50000,
    durationMs: 3600000,
    stats: { mpRegenPercent: 0.20 }
  },
  paagrio_protection: {
    id: 'paagrio_protection',
    name: "Proteção de Pa'agrio",
    icon: '🔥',
    desc: '+12% P.Def e +12% M.Def',
    costAdena: 75000,
    durationMs: 3600000,
    stats: { pDefPercent: 0.12, mDefPercent: 0.12 }
  },
  shilen_harmony: {
    id: 'shilen_harmony',
    name: 'Harmonia de Shilen',
    icon: '🌑',
    desc: '+15% EXP em Caça e +10% Drop de Adena',
    costAdena: 100000,
    durationMs: 3600000,
    stats: { xpBoost: 0.15, goldBoost: 0.10 }
  },
  royal_teleport: {
    id: 'royal_teleport',
    name: 'Portal Arcano do Clã',
    icon: '🌀',
    desc: 'Viagem instantânea com custo reduzido e +10 Velocidade',
    costAdena: 60000,
    durationMs: 3600000,
    stats: { speedBonus: 10 }
  }
};
