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
      charName: state.name || state.charName || 'Hero of Aden',
      race: state.race || 'Human',
      className: state.className || state.class || 'Warrior',
      level: Number(state.level) || 1,
      combatPower: cp,
      olympiadPoints: Number(state.olympiad?.points) || 1000,
      olympiadWins: Number(state.olympiad?.wins) || 0,
      olympiadLosses: Number(state.olympiad?.losses) || 0,
      duelWins: Number(state.colosseum?.duelWins) || 0,
      duelLosses: Number(state.colosseum?.duelLosses) || 0,
      clanName: state.clan?.name || 'Sem Clã',
      castleLord: state.clan?.castle || null,
      isHero: Boolean(state.olympiad?.isHero),
      heroWeapon: state.olympiad?.heroWeapon || null,
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
   * Obtém os quadros de líderes síncronos para renderização imediata na UI
   * @param {Object} [state] - Estado atual do jogador
   * @returns {Object} Quadros de líderes de CP, Olimpíadas, Duelos e Castelos
   */
  getLeaderboards(state = null) {
    const cpList = (_cachedRankings.cp && _cachedRankings.cp.length > 0) ? _cachedRankings.cp : this._generateFallbackLeaderboard('cp', state);
    const olyList = (_cachedRankings.olympiad && _cachedRankings.olympiad.length > 0) ? _cachedRankings.olympiad : this._generateFallbackLeaderboard('olympiad', state);
    const duelList = (_cachedRankings.duels && _cachedRankings.duels.length > 0) ? _cachedRankings.duels : this._generateFallbackLeaderboard('duels', state);

    return {
      cp: this._mergeCurrentPlayer(cpList, state, 'cp'),
      olympiad: this._mergeCurrentPlayer(olyList, state, 'olympiad'),
      duels: this._mergeCurrentPlayer(duelList, state, 'duels'),
      castles: _cachedRankings.castles || [
        { castle: 'Castelo de Aden', lord: 'LordValen', clan: 'BloodThorn', tax: '15%' },
        { castle: 'Castelo de Giran', lord: 'SirAres', clan: 'GloryKnights', tax: '10%' },
        { castle: 'Castelo de Dion', lord: 'LadyElena', clan: 'SilverDawn', tax: '5%' }
      ]
    };
  },

  _generateFallbackLeaderboard(category, state) {
    const playerCP = state ? CombatPowerService.calculateCombatPower(state) : 50000;
    const baseCP = Math.max(10000, playerCP);
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
      statsSnapshot: { hp: 5000, pAtk: 1200, mAtk: 800, pDef: 900, mDef: 700, crit: 250 }
    }));
  },

  /**
   * Obtém a lista de líderes para a categoria informada
   * @param {'cp' | 'olympiad' | 'duels' | 'castles'} category 
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
    const myProfile = this.buildPublicProfile(state);
    if (!myProfile) return list;

    myProfile.isCurrentPlayer = true;
    const currentUserId = typeof window !== 'undefined' && window.FirebaseBridge?.getCurrentUserId?.();

    // Filtra se já existir pelo ID
    const merged = list.filter(p => p.userId !== currentUserId && p.charName !== myProfile.charName);
    merged.push(myProfile);

    if (category === 'olympiad') {
      merged.sort((a, b) => (b.olympiadPoints || 0) - (a.olympiadPoints || 0));
    } else if (category === 'duels') {
      merged.sort((a, b) => (b.duelWins || 0) - (a.duelWins || 0));
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
