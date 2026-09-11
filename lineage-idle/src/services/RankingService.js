/**
 * RankingService.js — Gerenciador de Rankings Globais e Matchmaking PvP Assíncrono
 * 
 * Sincroniza perfis de jogadores no Firebase Firestore, consulta quadros de líderes
 * e realiza matchmaking inteligente por Combat Power para Olimpíadas e Coliseu.
 */

import { CombatPowerService } from './CombatPowerService.js';
import { D } from '../core/GameConfig.js';

let _cachedRankings = {
  cp: [],
  olympiad: [],
  duels: [],
  castles: [],
  lastFetchTime: 0
};
let _lastProfileSync = 0;

export const RankingService = {
  /**
   * Extrai o perfil público completo e seguro do jogador para sincronização
   * @param {Object} state - Estado atual do jogo
   * @returns {Object} Perfil público
   */
  buildPublicProfile(state) {
    if (!state) return null;

    const cp = CombatPowerService.calculateCombatPower(state);
    const stats = state.stats || {};
    
    // Identifica arma equipada principal
    let topWeaponName = 'Sem Arma';
    let topWeaponEnchant = 0;
    let topWeaponGlow = null;

    if (state.equipment?.weapon) {
      const wUid = state.equipment.weapon;
      const wItem = state.inventory?.find(i => i.uid === wUid || i.id === wUid);
      if (wItem) {
        topWeaponName = wItem.name || 'Arma Lendária';
        topWeaponEnchant = Number(wItem.enchant || wItem.enchantLevel) || 0;
        if (topWeaponEnchant > 0) {
          topWeaponName = `+${topWeaponEnchant} ${topWeaponName}`;
        }
        topWeaponGlow = wItem.augmentation?.glow || (topWeaponEnchant >= 16 ? 'crimson-fire' : topWeaponEnchant >= 10 ? 'golden-amber' : topWeaponEnchant >= 4 ? 'blue-ice' : null);
      }
    }

    return {
      charName: state.heroName || state.name || state.charName || 'Hero of Aden',
      race: state.race || 'Human',
      className: state.className || state.class || 'Warrior',
      level: Number(state.level) || 1,
      gold: Number(state.gold) || 0,
      combatPower: cp,
      olympiadPoints: Number(state.olympiad?.points) || 1000,
      olympiadWins: Number(state.olympiad?.wins) || 0,
      olympiadLosses: Number(state.olympiad?.losses) || 0,
      duelWins: Number(state.colosseum?.duelWins) || 0,
      duelLosses: Number(state.colosseum?.duelLosses) || 0,
      clanName: state.clan?.name || 'Sem Clã',
      castleLord: state.clan?.castle || (state.clan?.castles && state.clan.castles[0]) || null,
      isHero: Boolean(state.isHero || state.olympiad?.isHero),
      heroWeapon: state.olympiad?.heroWeapon || state.heroWeapon || null,
      isVerified: (Number(state.level) || 1) >= 20,
      topWeaponName,
      topWeaponEnchant,
      topWeaponGlow,
      statsSnapshot: {
        hp: Number(stats.maxHp || stats.hp) || 1000,
        pAtk: Number(stats.atk || stats.pAtk) || 100,
        mAtk: Number(stats.matk || stats.mAtk) || 50,
        pDef: Number(stats.def || stats.pDef) || 80,
        mDef: Number(stats.mdef || stats.mDef) || 60,
        crit: Number(stats.crit) || 10
      }
    };
  },

  /**
   * Sincroniza o perfil atual do jogador no Firebase Firestore (com debounce/throttling de 30s)
   * @param {Object} state 
   * @param {boolean} [force=false]
   */
  async syncToCloud(state, force = false) {
    const now = Date.now();
    if (!force && now - _lastProfileSync < 30000) {
      return; // Evita sobrecarga de escritas no Firestore durante ações rápidas/spam de cliques
    }
    _lastProfileSync = now;
    try {
      if (typeof window !== 'undefined' && window.FirebaseBridge?.syncPublicProfile) {
        const profile = this.buildPublicProfile(state);
        if (profile) {
          await window.FirebaseBridge.syncPublicProfile(profile);
        }
      }
    } catch (err) {
      console.warn('Sync Profile Notice:', err);
    }
  },

  /**
   * Obtém os quadros de líderes compilados mesclando dados da nuvem com o jogador atual
   * @param {Object} state - Estado atual para posicionamento relativo
   * @returns {Object} Dicionário de leaderboards por categoria
   */
  getLeaderboards(state) {
    const cpList = _cachedRankings.cp?.length ? _cachedRankings.cp : this._generateFallbackLeaderboard('cp', state);
    const olyList = _cachedRankings.olympiad?.length ? _cachedRankings.olympiad : this._generateFallbackLeaderboard('olympiad', state);
    const duelList = _cachedRankings.duels?.length ? _cachedRankings.duels : this._generateFallbackLeaderboard('duels', state);
    const wealthList = this._generateFallbackLeaderboard('wealth', state);
    const clansList = this._generateFallbackLeaderboard('clans', state);

    return {
      cp: this._mergeCurrentPlayer(cpList, state, 'cp'),
      level: this._mergeCurrentPlayer(cpList.slice(), state, 'level'),
      olympiad: this._mergeCurrentPlayer(olyList, state, 'olympiad'),
      duels: this._mergeCurrentPlayer(duelList, state, 'duels'),
      wealth: this._mergeCurrentPlayer(wealthList, state, 'wealth'),
      clans: this._mergeCurrentPlayer(clansList, state, 'clans'),
      castles: (_cachedRankings.castles && _cachedRankings.castles.length > 0) ? _cachedRankings.castles : [
        { castle: 'Castelo de Aden', lord: 'LordValen', clan: 'BloodThorn', tax: '15%' },
        { castle: 'Castelo de Giran', lord: 'SirAres', clan: 'GloryKnights', tax: '10%' },
        { castle: 'Castelo de Dion', lord: 'LadyElena', clan: 'SilverDawn', tax: '5%' }
      ]
    };
  },

  /**
   * Reivindica recompensa diária de classificação com cooldown de 24h
   */
  claimRankingReward(state, callbacks = {}) {
    const { log = console.log, floatText = () => {}, onUpdate = () => {} } = callbacks;
    if (!state) return { success: false };

    const now = Date.now();
    const cooldownMs = 24 * 60 * 60 * 1000;
    const lastClaim = state.lastRankingRewardClaim || 0;

    if (now - lastClaim < cooldownMs) {
      const remainingHours = Math.ceil((cooldownMs - (now - lastClaim)) / (60 * 60 * 1000));
      log(`Recompensa de Ranking diária já coletada. Retorne em ${remainingHours}h.`, 'warning');
      return { success: false, reason: 'cooldown', remainingHours };
    }

    const leaderboards = this.getLeaderboards(state);
    const cpList = leaderboards.cp || [];
    const myProfile = this.buildPublicProfile(state);
    const rankIndex = cpList.findIndex(p => p.charName === myProfile.charName);
    const rank = rankIndex !== -1 ? rankIndex + 1 : 12;

    let coins = 50;
    let scrolls = 0;
    let adena = 500000;

    if (rank === 1) {
      coins = 500;
      scrolls = 5;
      adena = 5000000;
    } else if (rank <= 5) {
      coins = 250;
      scrolls = 3;
      adena = 2500000;
    } else if (rank <= 20) {
      coins = 100;
      scrolls = 1;
      adena = 1000000;
    }

    state.lastRankingRewardClaim = now;
    state.adenCoins = (state.adenCoins || 0) + coins;
    state.gold = (state.gold || 0) + adena;

    if (scrolls > 0) {
      state.inventory = state.inventory || [];
      const scrollItem = {
        uid: 'b_scrl_' + Date.now(),
        itemId: 'scrl_enchant_wp_b',
        name: 'Scroll: Enchant Weapon (Grade B)',
        grade: 'b',
        qty: scrolls,
        type: 'scroll'
      };
      state.inventory.push(scrollItem);
    }

    log(`🏆 **[Recompensa Diária de Ranking - Rank #${rank}]** Você recebeu ${coins} Aden Coins, ${adena.toLocaleString()} Adena${scrolls > 0 ? ` e ${scrolls}x Enchant Scrolls` : ''}!`, 'rarity-legendary');
    floatText(`+${coins} COINS!`, 'float-jackpot');

    onUpdate();
    return { success: true, rank, coins, adena, scrolls };
  },

  _generateFallbackLeaderboard(category, state) {
    const playerCP = state ? CombatPowerService.calculateCombatPower(state) : 50000;
    const baseCP = Math.max(10000, playerCP);

    if (category === 'wealth') {
      const wealthArchetypes = [
        { name: 'MidasGoldhand', race: 'Dwarf', class: 'Fortune Seeker', gold: 250000000, clan: 'GoldenVault', lvl: 78 },
        { name: 'BaronRothschild', race: 'Human', class: 'Duelist', gold: 180000000, clan: 'BloodThorn', lvl: 76 },
        { name: 'LadyGiran', race: 'Elf', class: 'Eva Saint', gold: 120000000, clan: 'SilverDawn', lvl: 75 },
        { name: 'KaelenMerchant', race: 'Dark Elf', class: 'Ghost Sentinel', gold: 95000000, clan: 'GloryKnights', lvl: 72 },
        { name: 'ThorgarIronbank', race: 'Dwarf', class: 'Maestro', gold: 75000000, clan: 'IronGuild', lvl: 70 }
      ];
      return wealthArchetypes.map((a, i) => ({
        userId: `bot_wealth_${i}`,
        charName: a.name,
        race: a.race,
        className: a.class,
        level: a.lvl,
        gold: a.gold,
        combatPower: Math.floor(baseCP * (1.1 - i * 0.08)),
        clanName: a.clan,
        isVerified: true
      }));
    }

    if (category === 'clans') {
      const clanArchetypes = [
        { clanName: 'BloodThorn', leader: 'LordValen', level: 5, reputation: 125000, members: 40, castle: 'Castelo de Aden' },
        { clanName: 'GloryKnights', leader: 'SirAres', level: 4, reputation: 82000, members: 35, castle: 'Castelo de Giran' },
        { clanName: 'SilverDawn', leader: 'LadyElena', level: 4, reputation: 64000, members: 32, castle: 'Castelo de Dion' },
        { clanName: 'IronGuild', leader: 'ThorgarIronbank', level: 3, reputation: 45000, members: 28, castle: null },
        { clanName: 'ShadowLegion', leader: 'MorriganDark', level: 3, reputation: 38000, members: 25, castle: null }
      ];
      return clanArchetypes.map((c, i) => ({
        userId: `clan_entry_${i}`,
        charName: c.leader,
        clanName: c.clanName,
        level: c.level,
        reputation: c.reputation,
        membersCount: c.members,
        castleLord: c.castle,
        isClanEntry: true,
        isVerified: true
      }));
    }

    const archetypes = [
      { name: 'KaiserValen', race: 'Human', class: 'Duelist', mult: 1.45, w: '+12 Dual Damascus', oly: 1450, wins: 45 },
      { name: 'SylphAstra', race: 'Elf', class: 'Sagittarius', mult: 1.30, w: '+10 Soul Bow', oly: 1380, wins: 38 },
      { name: 'MorriganDark', race: 'Dark Elf', class: 'Ghost Hunter', mult: 1.20, w: '+11 Angel Slayer', oly: 1320, wins: 32 },
      { name: 'IgnisGrand', race: 'Human', class: 'Archmage', mult: 1.15, w: '+9 Arcana Mace', oly: 1280, wins: 28 },
      { name: 'GrommBane', race: 'Orc', class: 'Titan', mult: 1.05, w: '+8 Dragon Slayer', oly: 1220, wins: 24 }
    ];

    return archetypes.map((a, i) => ({
      userId: `bot_${category}_${i}`,
      charName: a.name,
      race: a.race,
      className: a.class,
      level: Math.max(40, Math.min(85, (state?.level || 40) + 5 - i)),
      combatPower: Math.floor(baseCP * a.mult),
      olympiadPoints: a.oly,
      duelWins: a.wins,
      clanName: i % 2 === 0 ? 'BloodThorn' : 'GloryKnights',
      topWeaponName: a.w,
      topWeaponGlow: i === 0 ? 'crimson-fire' : 'golden-amber',
      isVerified: true,
      statsSnapshot: { hp: 5000, pAtk: 1200, mAtk: 800, pDef: 900, mDef: 700, crit: 250 }
    }));
  },

  /**
   * Obtém a lista de líderes para a categoria informada
   * @param {'cp' | 'level' | 'olympiad' | 'duels' | 'wealth' | 'clans' | 'castles'} category 
   * @param {Object} state - Estado atual do jogador para mesclar no ranking
   * @returns {Promise<Array>} Lista ordenada de perfis
   */
  async getLeaderboard(category = 'cp', state = null) {
    const now = Date.now();
    // Cache de 30 segundos
    if (_cachedRankings[category] && _cachedRankings[category].length > 0 && (now - _cachedRankings.lastFetchTime < 30000)) {
      return this._mergeCurrentPlayer(_cachedRankings[category], state, category);
    }

    let remoteList = [];
    try {
      if (typeof window !== 'undefined' && window.FirebaseBridge?.fetchLeaderboard) {
        remoteList = await window.FirebaseBridge.fetchLeaderboard(category, 25);
      }
    } catch (e) {
      console.warn('Firebase Leaderboard offline fallback');
    }

    remoteList = remoteList || [];
    _cachedRankings[category] = remoteList;
    _cachedRankings.lastFetchTime = now;

    return this._mergeCurrentPlayer(remoteList, state, category);
  },

  /**
   * Mescla o jogador local no ranking se ele ainda não estiver presente na lista remota
   */
  _mergeCurrentPlayer(list, state, category) {
    if (!state) return list;

    if (category === 'clans') {
      const clan = state.clan || { name: 'Os Guardiões de Aden', level: 1, reputation: 100 };
      const myClanEntry = {
        userId: 'player_clan',
        charName: state.name || 'Tristan',
        clanName: clan.name,
        level: clan.level || 1,
        reputation: clan.reputation || 100,
        membersCount: 6,
        castleLord: (clan.castles && clan.castles.length > 0) ? clan.castles.join(', ') : null,
        isCurrentPlayer: true,
        isClanEntry: true,
        isVerified: (state.level || 1) >= 20
      };
      const mergedClans = list.filter(c => c.clanName !== myClanEntry.clanName);
      mergedClans.push(myClanEntry);
      mergedClans.sort((a, b) => (b.reputation || 0) - (a.reputation || 0));
      return mergedClans;
    }

    const myProfile = this.buildPublicProfile(state);
    if (!myProfile) return list;

    myProfile.isCurrentPlayer = true;
    const currentUserId = typeof window !== 'undefined' && window.FirebaseBridge?.getCurrentUserId?.();

    // Filtra se já existir pelo ID
    const merged = list.filter(p => p.userId !== currentUserId && p.charName !== myProfile.charName);
    merged.push(myProfile);

    if (category === 'level') {
      merged.sort((a, b) => {
        if ((b.level || 0) !== (a.level || 0)) return (b.level || 0) - (a.level || 0);
        return (b.combatPower || 0) - (a.combatPower || 0);
      });
    } else if (category === 'olympiad') {
      merged.sort((a, b) => (b.olympiadPoints || 0) - (a.olympiadPoints || 0));
    } else if (category === 'duels') {
      merged.sort((a, b) => (b.duelWins || 0) - (a.duelWins || 0));
    } else if (category === 'wealth') {
      merged.sort((a, b) => (b.gold || 0) - (a.gold || 0));
    } else {
      merged.sort((a, b) => (b.combatPower || 0) - (a.combatPower || 0));
    }

    return merged;
  },

  /**
   * Busca oponentes equilibrados para Matchmaking (PvP / Olimpíadas / Coliseu)
   * @param {Object} state - Estado atual do jogador
   * @param {number} count - Quantidade de desafiantes desejados (padrão 3)
   * @returns {Promise<Array>} Lista de desafiantes calibrados
   */
  async getMatchmakingOpponents(state, count = 3) {
    const playerCP = CombatPowerService.calculateCombatPower(state);
    let remoteOpponents = [];

    try {
      if (typeof window !== 'undefined' && window.FirebaseBridge?.fetchMatchmakingOpponents) {
        remoteOpponents = await window.FirebaseBridge.fetchMatchmakingOpponents(playerCP, 0.35, count * 2);
      }
    } catch (e) {
      console.warn('Firebase Matchmaking offline fallback');
    }

    const currentUserId = typeof window !== 'undefined' && window.FirebaseBridge?.getCurrentUserId?.();
    const myName = state?.name || state?.charName;

    // Filtra para não lutar contra si mesmo
    let pool = (remoteOpponents || []).filter(o => o.userId !== currentUserId && o.charName !== myName);

    // Se houver poucos no banco remoto, completa com clones de arquétipos autênticos de L2 ajustados pelo CP
    if (pool.length < count) {
      const archetypes = [
        { name: 'AresGladiator', race: 'Human', class: 'Duelist', icon: '⚔️', w: '+7 Dual Damascus' },
        { name: 'SylphHunter', race: 'Elf', class: 'Sagittarius', icon: '🏹', w: '+6 Soul Bow' },
        { name: 'AbyssReaper', race: 'Dark Elf', class: 'Ghost Hunter', icon: '🗡️', w: '+8 Angel Slayer' },
        { name: 'ArcaneIgnis', race: 'Human', class: 'Archmage', icon: '🔥', w: '+5 Arcana Mace' },
        { name: 'KhavatariBane', race: 'Orc', class: 'Grand Khavatari', icon: '🥊', w: '+6 Dragon Grinder' },
        { name: 'DreadnoughtRex', race: 'Human', class: 'Dreadnought', icon: '🔱', w: '+7 Saint Spear' }
      ];

      for (let i = 0; pool.length < count; i++) {
        const arch = archetypes[i % archetypes.length];
        // CP com variação suave de -15% a +15%
        const variance = 0.85 + Math.random() * 0.30;
        const targetCP = Math.max(500, Math.floor(playerCP * variance));
        const estLevel = Math.max(20, Math.min(85, Math.floor((state.level || 40) + (Math.random() * 6 - 3))));

        pool.push({
          userId: `ai_match_${i}_${Date.now()}`,
          charName: `${arch.name}`,
          race: arch.race,
          className: arch.class,
          level: estLevel,
          combatPower: targetCP,
          olympiadPoints: Math.max(900, Math.floor((state.olympiad?.points || 1000) + (Math.random() * 100 - 50))),
          clanName: 'GloryKnights',
          topWeaponName: arch.w,
          topWeaponGlow: targetCP > 100000 ? 'golden-amber' : targetCP > 40000 ? 'blue-ice' : null,
          statsSnapshot: {
            hp: Math.floor(targetCP * 0.08),
            pAtk: Math.floor(targetCP * 0.06),
            mAtk: Math.floor(targetCP * 0.05),
            pDef: Math.floor(targetCP * 0.04),
            mDef: Math.floor(targetCP * 0.035),
            crit: Math.floor(Math.random() * 200 + 100)
          }
        });
      }
    }

    return pool.slice(0, count);
  }
};
