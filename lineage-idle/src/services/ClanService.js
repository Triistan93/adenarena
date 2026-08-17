/**
 * ClanService.js — Gerenciamento Completo de Clãs, Recrutamento, Doações, Loja do Clã e Guerras de Cerco.
 */

import {
  CLAN_LEVEL_DATA,
  CLAN_SKILLS,
  CLAN_CRESTS,
  CLAN_DONATIONS,
  CLAN_SHOP_CATALOG,
  DEFAULT_WORLD_CLANS
} from '../data/clan.js';
import { CASTLES } from '../data/castles.js';
import { addToInventory } from './InventoryService.js';

export class ClanService {
  /**
   * Retorna o status detalhado do Clã do jogador.
   */
  static getClanStatus(state) {
    if (!state) return { hasClan: false };

    // Inicializa lista de clãs do mundo se inexistente
    if (!state.worldClans || !Array.isArray(state.worldClans) || state.worldClans.length === 0) {
      state.worldClans = JSON.parse(JSON.stringify(DEFAULT_WORLD_CLANS));
    }

    if (!state.clan || state.clan.joined === false) {
      return {
        hasClan: false,
        worldClans: state.worldClans,
        pendingRequests: state.clanJoinRequests || []
      };
    }

    const clan = state.clan;
    const currentLevel = Math.min(10, Math.max(1, clan.level || 1));
    const lvlData = CLAN_LEVEL_DATA[currentLevel] || CLAN_LEVEL_DATA[1];
    const nextLevelData = CLAN_LEVEL_DATA[currentLevel + 1] || null;

    // Obter todas as habilidades desbloqueadas até o nível atual
    const unlockedSkillIds = [];
    for (let l = 1; l <= currentLevel; l++) {
      const d = CLAN_LEVEL_DATA[l];
      if (d && d.unlockedSkills) {
        unlockedSkillIds.push(...d.unlockedSkills);
      }
    }
    const activeSkills = unlockedSkillIds.map(id => CLAN_SKILLS[id]).filter(Boolean);

    // Calcular bônus agregados
    const bonusStats = {
      pAtkBonusPercent: 0,
      pDefBonusPercent: 0,
      mAtkBonusPercent: 0,
      mDefBonusPercent: 0,
      hpBonusPercent: 0,
      cpBonusPercent: 0,
      regenBonusPercent: 0,
      speedBonus: 0,
      critPercent: 0,
      accuracy: 0,
      eva: 0,
      atkSpdPercent: 0,
      critDmgPercent: 0,
      allDmgPercent: 0,
      mpCostReduction: 0,
      cdr: 0,
      allStatsPercent: 0,
      lootBonus: 0,
      xpBonus: 0
    };

    for (const sk of activeSkills) {
      if (!sk.stats) continue;
      if (sk.stats.pAtkPercent) bonusStats.pAtkBonusPercent += sk.stats.pAtkPercent;
      if (sk.stats.pDefPercent) bonusStats.pDefBonusPercent += sk.stats.pDefPercent;
      if (sk.stats.mAtkPercent) bonusStats.mAtkBonusPercent += sk.stats.mAtkPercent;
      if (sk.stats.mDefPercent) bonusStats.mDefBonusPercent += sk.stats.mDefPercent;
      if (sk.stats.hpPercent) bonusStats.hpBonusPercent += sk.stats.hpPercent;
      if (sk.stats.cpPercent) bonusStats.cpBonusPercent += sk.stats.cpPercent;
      if (sk.stats.regenPercent) bonusStats.regenBonusPercent += sk.stats.regenPercent;
      if (sk.stats.speedBonus) bonusStats.speedBonus += sk.stats.speedBonus;
      if (sk.stats.critPercent) bonusStats.critPercent += sk.stats.critPercent;
      if (sk.stats.accuracy) bonusStats.accuracy += sk.stats.accuracy;
      if (sk.stats.eva) bonusStats.eva += sk.stats.eva;
      if (sk.stats.atkSpdPercent) bonusStats.atkSpdPercent += sk.stats.atkSpdPercent;
      if (sk.stats.critDmgPercent) bonusStats.critDmgPercent += sk.stats.critDmgPercent;
      if (sk.stats.allDmgPercent) bonusStats.allDmgPercent += sk.stats.allDmgPercent;
      if (sk.stats.mpCostReduction) bonusStats.mpCostReduction += sk.stats.mpCostReduction;
      if (sk.stats.cdr) bonusStats.cdr += sk.stats.cdr;
      if (sk.stats.allStatsPercent) bonusStats.allStatsPercent += sk.stats.allStatsPercent;
      if (sk.stats.lootBonus) bonusStats.lootBonus += sk.stats.lootBonus;
      if (sk.stats.xpBonus) bonusStats.xpBonus += sk.stats.xpBonus;
    }

    const crest = CLAN_CRESTS.find(c => c.id === clan.crestId) || CLAN_CRESTS[0];

    // Verificar reset diário de doações
    const now = Date.now();
    const lastDonationDay = state.clanLastDonationDay || 0;
    const currentDay = Math.floor(now / (24 * 60 * 60 * 1000));
    if (currentDay > lastDonationDay) {
      state.clanDonationsToday = 0;
      state.clanLastDonationDay = currentDay;
    }

    return {
      hasClan: true,
      clan,
      crest,
      levelData: lvlData,
      nextLevelData,
      activeSkills,
      bonusStats,
      clanCoins: state.clanCoins || 0,
      donationsToday: state.clanDonationsToday || 0,
      maxDonationsDaily: 3,
      ownedCastles: clan.castles || [],
      isLeader: clan.role === 'leader',
      isViceLeader: clan.role === 'vice_leader' || clan.role === 'leader',
      members: clan.members || [],
      pendingApplicants: clan.pendingApplicants || []
    };
  }

  /**
   * Cria um novo Clã sob a liderança do jogador.
   */
  static createClan(state, { name, crestId }, callbacks = {}) {
    const log = callbacks.log || console.log;
    const updateAllUI = callbacks.updateAllUI || (() => {});
    const save = callbacks.save || (() => {});

    if (state.clan && state.clan.joined) {
      log('⚠️ Você já pertence a um clã! Saia do clã atual antes de fundar um novo.', 'warning');
      return { success: false, reason: 'already_in_clan' };
    }

    const playerLvl = state.level || 1;
    if (playerLvl < 20) {
      log('⚠️ Requer Nível 20+ de Personagem para fundar um Clã!', 'warning');
      return { success: false, reason: 'level_too_low' };
    }

    const CREATE_FEE = 100000;
    if ((state.gold || 0) < CREATE_FEE) {
      log(`⚠️ Adena insuficiente! Requer ${CREATE_FEE.toLocaleString()}g para registrar o brasão do clã.`, 'warning');
      return { success: false, reason: 'gold_too_low' };
    }

    const cleanName = (name || '').trim();
    if (cleanName.length < 3 || cleanName.length > 20) {
      log('⚠️ O nome do Clã deve conter entre 3 e 20 caracteres!', 'warning');
      return { success: false, reason: 'invalid_name' };
    }

    const selectedCrest = CLAN_CRESTS.find(c => c.id === crestId) || CLAN_CRESTS[0];
    const heroName = state.charName || state.heroName || state.playerName || 'Tristan';

    state.gold -= CREATE_FEE;

    const initialMembers = [
      {
        name: heroName,
        level: playerLvl,
        role: 'leader',
        class: state.class || 'fighter',
        cp: state.stats?.combatPower || 1000,
        donatedTotal: 0,
        isOnline: true,
        lastSeen: 'Agora'
      },
      {
        name: 'Sir Galahad',
        level: Math.max(15, playerLvl - 2),
        role: 'veteran',
        class: 'paladin',
        cp: Math.round((state.stats?.combatPower || 1000) * 0.85),
        donatedTotal: 150000,
        isOnline: true,
        lastSeen: 'Agora'
      },
      {
        name: 'Lady Elenya',
        level: Math.max(12, playerLvl - 4),
        role: 'member',
        class: 'spellsinger',
        cp: Math.round((state.stats?.combatPower || 1000) * 0.75),
        donatedTotal: 50000,
        isOnline: false,
        lastSeen: 'Há 2 horas'
      }
    ];

    state.clan = {
      id: 'clan_' + Date.now(),
      name: cleanName,
      crestId: selectedCrest.id,
      level: 1,
      exp: 0,
      gold: 0,
      joined: true,
      role: 'leader',
      leaderName: heroName,
      members: initialMembers,
      pendingApplicants: [
        {
          id: 'app_1',
          name: 'Vanguard_Ranger',
          level: Math.max(10, playerLvl - 5),
          class: 'hawkeye',
          cp: Math.round((state.stats?.combatPower || 1000) * 0.65),
          requestedAt: 'Há 10 min'
        }
      ],
      castles: [],
      lastTaxTimestamp: Date.now(),
      accumulatedTaxes: {}
    };

    // Adiciona o novo clã à lista do mundo
    if (!state.worldClans) state.worldClans = JSON.parse(JSON.stringify(DEFAULT_WORLD_CLANS));
    state.worldClans.unshift({
      id: state.clan.id,
      name: cleanName,
      crestId: selectedCrest.id,
      level: 1,
      leader: heroName,
      membersCount: state.clan.members.length,
      maxMembers: 15,
      desc: 'Clã recém-fundado pronto para conquistar Aden.',
      castles: [],
      openRecruitment: true
    });

    log(`👑 PARABÉNS! Você fundou o Clã [${cleanName}] com o Brasão ${selectedCrest.icon} ${selectedCrest.name}!`, 'rarity-legendary');
    updateAllUI();
    save();
    return { success: true, clan: state.clan };
  }

  /**
   * Solicita entrada em um Clã existente.
   */
  static requestJoinClan(state, clanId, callbacks = {}) {
    const log = callbacks.log || console.log;
    const updateAllUI = callbacks.updateAllUI || (() => {});
    const save = callbacks.save || (() => {});

    if (state.clan && state.clan.joined) {
      log('⚠️ Você já possui um clã!', 'warning');
      return { success: false };
    }

    if (!state.worldClans) state.worldClans = JSON.parse(JSON.stringify(DEFAULT_WORLD_CLANS));
    const targetClan = state.worldClans.find(c => c.id === clanId);
    if (!targetClan) {
      log('⚠️ Clã não encontrado!', 'error');
      return { success: false };
    }

    const heroName = state.charName || state.heroName || state.playerName || 'Tristan';

    // Se o clã possui recrutamento aberto, aprova imediatamente com boas-vindas
    if (targetClan.openRecruitment) {
      state.clan = {
        id: targetClan.id,
        name: targetClan.name,
        crestId: targetClan.crestId,
        level: targetClan.level,
        exp: targetClan.level * 2000,
        gold: targetClan.level * 1000000,
        joined: true,
        role: 'member',
        leaderName: targetClan.leader,
        members: [
          {
            name: targetClan.leader,
            level: Math.min(85, targetClan.level * 10 + 15),
            role: 'leader',
            class: 'warlord',
            cp: targetClan.level * 15000,
            donatedTotal: 2500000,
            isOnline: true,
            lastSeen: 'Agora'
          },
          {
            name: heroName,
            level: state.level || 1,
            role: 'member',
            class: state.class || 'fighter',
            cp: state.stats?.combatPower || 1000,
            donatedTotal: 0,
            isOnline: true,
            lastSeen: 'Agora'
          },
          {
            name: 'Kain_Blade',
            level: targetClan.level * 9 + 10,
            role: 'vice_leader',
            class: 'gladiator',
            cp: targetClan.level * 12000,
            donatedTotal: 1200000,
            isOnline: false,
            lastSeen: 'Há 1 hora'
          },
          {
            name: 'Mystic_Luna',
            level: targetClan.level * 8 + 12,
            role: 'veteran',
            class: 'spellhowler',
            cp: targetClan.level * 9000,
            donatedTotal: 800000,
            isOnline: true,
            lastSeen: 'Agora'
          }
        ],
        pendingApplicants: [],
        castles: targetClan.castles || [],
        lastTaxTimestamp: Date.now(),
        accumulatedTaxes: {}
      };

      log(`🎉 Bem-vindo! Sua solicitação foi aceita e você ingressou no Clã [${targetClan.name}]!`, 'rarity-legendary');
      updateAllUI();
      save();
      return { success: true, joined: true };
    }

    state.clanJoinRequests = state.clanJoinRequests || [];
    if (!state.clanJoinRequests.includes(clanId)) {
      state.clanJoinRequests.push(clanId);
    }

    log(`📨 Solicitação de entrada enviada ao líder de [${targetClan.name}]. Aguarde aprovação!`, 'info');
    updateAllUI();
    save();
    return { success: true, pending: true };
  }

  /**
   * Aprova ou recusa uma solicitação de entrada (exclusivo do Líder/Vice).
   */
  static handleJoinRequest(state, applicantId, accept, callbacks = {}) {
    const log = callbacks.log || console.log;
    const updateAllUI = callbacks.updateAllUI || (() => {});
    const save = callbacks.save || (() => {});

    if (!state.clan || !state.clan.joined) return { success: false };
    if (state.clan.role !== 'leader' && state.clan.role !== 'vice_leader') {
      log('⚠️ Apenas o Líder ou Vice-Líderes podem avaliar solicitações de recrutamento!', 'warning');
      return { success: false };
    }

    const idx = (state.clan.pendingApplicants || []).findIndex(a => a.id === applicantId || a.name === applicantId);
    if (idx < 0) return { success: false };

    const applicant = state.clan.pendingApplicants.splice(idx, 1)[0];

    if (accept) {
      const lvlData = CLAN_LEVEL_DATA[state.clan.level || 1] || CLAN_LEVEL_DATA[1];
      if ((state.clan.members || []).length >= lvlData.maxMembers) {
        log('⚠️ O Clã alcançou o limite máximo de membros para o nível atual!', 'warning');
        return { success: false };
      }

      state.clan.members.push({
        name: applicant.name,
        level: applicant.level || 20,
        role: 'member',
        class: applicant.class || 'fighter',
        cp: applicant.cp || 1000,
        donatedTotal: 0,
        isOnline: true,
        lastSeen: 'Agora'
      });

      log(`✅ [${applicant.name}] foi aceito como novo membro do Clã!`, 'rarity-legendary');
    } else {
      log(`❌ Solicitação de [${applicant.name}] foi recusada.`, 'info');
    }

    updateAllUI();
    save();
    return { success: true };
  }

  /**
   * Realiza uma doação diária para o Clã (Máximo 3 vezes ao dia).
   */
  static donateToClan(state, tierKey = 'basic', callbacks = {}) {
    const log = callbacks.log || console.log;
    const updateAllUI = callbacks.updateAllUI || (() => {});
    const save = callbacks.save || (() => {});

    if (!state.clan || !state.clan.joined) {
      log('⚠️ Você precisa estar em um clã para realizar doações!', 'warning');
      return { success: false };
    }

    const status = this.getClanStatus(state);
    if (status.donationsToday >= status.maxDonationsDaily) {
      log('⚠️ Você já realizou as 3 doações diárias permitidas hoje! Volte amanhã.', 'warning');
      return { success: false, reason: 'daily_limit' };
    }

    const donation = CLAN_DONATIONS[tierKey] || CLAN_DONATIONS.basic;

    if (donation.cost.gold && (state.gold || 0) < donation.cost.gold) {
      log(`⚠️ Adena insuficiente! Requer ${donation.cost.gold.toLocaleString()}g.`, 'warning');
      return { success: false, reason: 'gold_low' };
    }

    if (donation.cost.sp && (state.sp || 0) < donation.cost.sp) {
      log(`⚠️ SP insuficiente! Requer ${donation.cost.sp.toLocaleString()} SP.`, 'warning');
      return { success: false, reason: 'sp_low' };
    }

    // Deduz custos
    if (donation.cost.gold) state.gold -= donation.cost.gold;
    if (donation.cost.sp) state.sp -= donation.cost.sp;

    // Credita recompensas
    state.clan.exp = (state.clan.exp || 0) + donation.reward.clanExp;
    state.clan.gold = (state.clan.gold || 0) + donation.reward.clanGold;
    state.clanCoins = (state.clanCoins || 0) + donation.reward.clanCoins;
    state.clanDonationsToday = (state.clanDonationsToday || 0) + 1;

    // Atualiza histórico do membro
    const heroName = state.charName || state.heroName || state.playerName || 'Tristan';
    const member = (state.clan.members || []).find(m => m.name === heroName);
    if (member) {
      member.donatedTotal = (member.donatedTotal || 0) + donation.cost.gold;
    }

    log(`✨ Doação concluída! +${donation.reward.clanExp} EXP de Clã, +${donation.reward.clanGold.toLocaleString()}g no Tesouro e +${donation.reward.clanCoins} Moedas de Clã! (${state.clanDonationsToday}/3 hoje)`, 'loot');

    updateAllUI();
    save();
    return { success: true, donationsToday: state.clanDonationsToday };
  }

  /**
   * Evolui o Clã para o próximo nível (Exclusivo do Líder).
   */
  static upgradeClan(state, callbacks = {}) {
    const log = callbacks.log || console.log;
    const updateAllUI = callbacks.updateAllUI || (() => {});
    const save = callbacks.save || (() => {});

    if (!state.clan || state.clan.joined === false) return { success: false };
    if (state.clan.role && state.clan.role !== 'leader') {
      log('⚠️ Apenas o Líder do Clã pode autorizar a evolução do Clã!', 'warning');
      return { success: false, reason: 'not_leader' };
    }

    const currentLvl = state.clan.level || 1;
    if (currentLvl >= 10) {
      log('👑 Seu Clã já atingiu a glória máxima (Nível 10 - Império Supremo)!', 'warning');
      return { success: false, reason: 'max_level' };
    }

    const next = CLAN_LEVEL_DATA[currentLvl + 1];
    if (!next) return { success: false };

    const clanExp = state.clan.exp || 0;
    if (state.clan.exp !== undefined && clanExp < next.reqExp) {
      log(`⚠️ EXP de Clã insuficiente! Requer ${next.reqExp.toLocaleString()} EXP (Atual: ${clanExp.toLocaleString()}). Peça doações aos membros!`, 'warning');
      return { success: false, reason: 'exp_low' };
    }

    const clanFunds = (state.clan.gold || 0) + (state.gold || 0);
    if (clanFunds < next.costAdena) {
      log(`⚠️ Fundos insuficientes! Requer ${next.costAdena.toLocaleString()}g para o upgrade.`, 'warning');
      return { success: false, reason: 'gold_low' };
    }

    if ((state.sp || 0) < next.costSp) {
      log(`⚠️ Pontos de SP insuficientes! Requer ${next.costSp.toLocaleString()} SP.`, 'warning');
      return { success: false, reason: 'sp_low' };
    }

    // Deduz custos
    if ((state.clan.gold || 0) >= next.costAdena) {
      state.clan.gold -= next.costAdena;
    } else {
      const diff = next.costAdena - (state.clan.gold || 0);
      state.clan.gold = 0;
      state.gold -= diff;
    }
    state.sp -= next.costSp;

    state.clan.level = next.level;

    const newSkills = next.unlockedSkills.map(id => CLAN_SKILLS[id]?.name).filter(Boolean).join(', ');
    log(`🎉 GLÓRIA E HONRA! Seu Clã ascendeu para o Nível ${next.level} (${next.title})!`, 'rarity-legendary');
    if (newSkills) {
      log(`✨ Novas Habilidades Desbloqueadas: ${newSkills}`, 'loot');
    }

    updateAllUI();
    save();
    return { success: true, newLevel: next.level };
  }

  /**
   * Compra itens na Loja do Clã usando Moedas de Clã.
   */
  static buyClanShopItem(state, itemId, count = 1, callbacks = {}) {
    const log = callbacks.log || console.log;
    const updateAllUI = callbacks.updateAllUI || (() => {});
    const save = callbacks.save || (() => {});

    if (!state.clan || !state.clan.joined) {
      log('⚠️ Você precisa estar em um clã para comprar na Loja do Clã!', 'warning');
      return { success: false };
    }

    const shopItem = CLAN_SHOP_CATALOG.find(i => i.id === itemId);
    if (!shopItem) {
      log('⚠️ Item não encontrado na Loja do Clã!', 'error');
      return { success: false };
    }

    const clanLvl = state.clan.level || 1;
    if (clanLvl < shopItem.clanLevelReq) {
      log(`🔒 Requer Nível ${shopItem.clanLevelReq} de Clã para adquirir [${shopItem.name}]!`, 'warning');
      return { success: false, reason: 'level_low' };
    }

    const totalCoins = shopItem.costCoins * count;
    const currentCoins = state.clanCoins || 0;
    if (currentCoins < totalCoins) {
      log(`⚠️ Moedas de Clã insuficientes! Requer ${totalCoins} Moedas (Você possui: ${currentCoins}). Doe ao clã para obter mais moedas!`, 'warning');
      return { success: false, reason: 'coins_low' };
    }

    state.clanCoins -= totalCoins;
    addToInventory(state, shopItem.itemId, count, 'rare', false, callbacks, true);

    log(`🛍️ Adquiriu ${count}x [${shopItem.name}] por ${totalCoins} Moedas de Clã!`, 'loot');
    updateAllUI();
    save();
    return { success: true };
  }

  /**
   * Promove um membro do clã a Vice-Líder.
   */
  static promoteMember(state, memberName, callbacks = {}) {
    const log = callbacks.log || console.log;
    const updateAllUI = callbacks.updateAllUI || (() => {});
    const save = callbacks.save || (() => {});

    if (state.clan?.role !== 'leader') {
      log('⚠️ Apenas o Líder do Clã pode promover membros!', 'warning');
      return { success: false };
    }

    const member = (state.clan.members || []).find(m => m.name === memberName);
    if (!member) return { success: false };

    member.role = 'vice_leader';
    log(`⭐ [${memberName}] foi promovido a Vice-Líder do Clã!`, 'info');
    updateAllUI();
    save();
    return { success: true };
  }

  /**
   * Expulsa um membro do clã.
   */
  static kickMember(state, memberName, callbacks = {}) {
    const log = callbacks.log || console.log;
    const updateAllUI = callbacks.updateAllUI || (() => {});
    const save = callbacks.save || (() => {});

    if (state.clan?.role !== 'leader' && state.clan?.role !== 'vice_leader') {
      log('⚠️ Sem permissão para expulsar membros!', 'warning');
      return { success: false };
    }

    const idx = (state.clan.members || []).findIndex(m => m.name === memberName);
    if (idx < 0) return { success: false };

    state.clan.members.splice(idx, 1);
    log(`🚪 [${memberName}] foi removido do Clã.`, 'warning');
    updateAllUI();
    save();
    return { success: true };
  }

  /**
   * Sair do Clã atual.
   */
  static leaveClan(state, callbacks = {}) {
    const log = callbacks.log || console.log;
    const updateAllUI = callbacks.updateAllUI || (() => {});
    const save = callbacks.save || (() => {});

    if (!state.clan || !state.clan.joined) return { success: false };

    const clanName = state.clan.name;
    state.clan = { joined: false };

    log(`🚪 Você deixou o Clã [${clanName}].`, 'warning');
    updateAllUI();
    save();
    return { success: true };
  }

  /**
   * Inicia o Cerco a um Castelo (Castle Siege).
   */
  static startSiege(state, castleId, callbacks = {}) {
    const log = callbacks.log || console.log;
    const onUpdate = callbacks.onUpdate || (() => {});
    const castle = CASTLES[castleId];

    if (!castle) return { success: false, reason: 'invalid_castle' };

    if ((state.clan?.level || 1) < (castle.reqClanLevel || 5)) {
      log(`Apenas Clãs de Nível ${castle.reqClanLevel || 5}+ podem declarar Cerco a ${castle.name}.`, 'error');
      return { success: false, reason: 'clan_level_low' };
    }

    state.activeSiege = {
      castleId,
      castleName: castle.name,
      phase: 1,
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
   * Executa uma rodada de ação do Cerco.
   */
  static executeSiegeTurn(state, callbacks = {}) {
    const log = callbacks.log || console.log;
    const onUpdate = callbacks.onUpdate || (() => {});
    const siege = state.activeSiege;

    if (!siege || siege.isCompleted) return { success: false };

    const castle = CASTLES[siege.castleId];
    if (!castle) return { success: false };

    const pAtk = Math.max(50, state.stats?.atk || 200);
    const mAtk = Math.max(50, state.stats?.matk || 200);
    const totalDmg = Math.round((pAtk * 1.5 + mAtk * 1.2) * (0.9 + Math.random() * 0.25));

    if (siege.phase === 1) {
      const dmgToGate = Math.max(100, Math.round(totalDmg * 2.2));
      siege.gateHp = Math.max(0, siege.gateHp - dmgToGate);
      const msg = `💥 Aríetes e catapultas do Clã causaram -${dmgToGate.toLocaleString()} aos Portões!`;
      siege.logs.unshift(msg);
      log(msg, 'info');

      if (siege.gateHp <= 0) {
        siege.phase = 2;
        const advMsg = `⚡ Os Portões de ${castle.name} vieram abaixo! Fase 2: Confronto com a Guarda Real!`;
        siege.logs.unshift(advMsg);
        log(advMsg, 'warning');
      }
    } else if (siege.phase === 2) {
      const dmgToGuards = Math.max(100, Math.round(totalDmg * 1.4));
      siege.guardsHp = Math.max(0, siege.guardsHp - dmgToGuards);
      const msg = `⚔️ Golpes ferozes na Guarda Real causando -${dmgToGuards.toLocaleString()} de dano!`;
      siege.logs.unshift(msg);
      log(msg, 'info');

      if (siege.guardsHp <= 0) {
        siege.phase = 3;
        const advMsg = `👑 Guarda Real derrotada! Fase 3: Sala do Trono e canalização do SEAL OF RULER!`;
        siege.logs.unshift(advMsg);
        log(advMsg, 'warning');
      }
    } else if (siege.phase === 3) {
      siege.castRounds += 1;
      const castMsg = `✨ Canalizando Seal of Ruler... (${siege.castRounds}/${siege.reqCastRounds} rodadas).`;
      siege.logs.unshift(castMsg);
      log(castMsg, 'info');

      if (siege.castRounds >= siege.reqCastRounds) {
        siege.isCompleted = true;
        if (!state.clan.castles) state.clan.castles = [];
        if (!state.clan.castles.includes(siege.castleId)) {
          state.clan.castles.push(siege.castleId);
        }

        const victoryReward = 5000000;
        state.gold = (state.gold || 0) + victoryReward;
        const triumphMsg = `🏆 VITÓRIA SUPREMA! ${state.clan.name} é o soberano de ${castle.name}! (+${victoryReward.toLocaleString()}g do Tesouro)`;
        siege.logs.unshift(triumphMsg);
        log(triumphMsg, 'success');
      }
    }

    onUpdate();
    return { success: true, siege };
  }

  /**
   * Coleta taxas acumuladas do castelo.
   */
  static claimCastleTaxes(state, castleId, callbacks = {}) {
    const log = callbacks.log || console.log;
    const onUpdate = callbacks.onUpdate || (() => {});
    const castle = CASTLES[castleId];

    if (!castle || !(state.clan?.castles || []).includes(castleId)) {
      log('Seu Clã não governa este castelo para recolher taxas.', 'error');
      return { success: false };
    }

    const taxes = state.clan.accumulatedTaxes?.[castleId] || 0;
    if (taxes <= 0) {
      log(`Não há taxas acumuladas no tesouro de ${castle.name} no momento.`, 'warning');
      return { success: false, amount: 0 };
    }

    state.gold = (state.gold || 0) + taxes;
    state.clan.accumulatedTaxes[castleId] = 0;

    log(`💰 Recolheu +${taxes.toLocaleString()} Adena em impostos de ${castle.name}!`, 'loot');
    onUpdate();
    return { success: true, amount: taxes };
  }

  /**
   * Atualiza as taxas acumuladas com base no tempo decorrido.
   */
  static updateTaxesTick(state) {
    if (!state.clan || !state.clan.joined || !state.clan.castles || state.clan.castles.length === 0) return;
    const now = Date.now();
    const last = state.clan.lastTaxTimestamp || now;
    const elapsedMinutes = Math.floor((now - last) / (60 * 1000));
    if (elapsedMinutes <= 0) return;

    if (!state.clan.accumulatedTaxes) state.clan.accumulatedTaxes = {};

    for (const cId of state.clan.castles) {
      const c = CASTLES[cId];
      if (!c) continue;
      const ratePerMinute = Math.round(c.dailyTaxesAdena / (24 * 60));
      const newTaxes = ratePerMinute * elapsedMinutes;
      state.clan.accumulatedTaxes[cId] = (state.clan.accumulatedTaxes[cId] || 0) + newTaxes;
    }

    state.clan.lastTaxTimestamp = now;
  }
}
