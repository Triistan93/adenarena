/**
 * RankingService.js — Gerenciador de Rankings Globais e Matchmaking PvP Assíncrono
 * 
 * Sincroniza perfis de jogadores no Firebase Firestore, consulta quadros de líderes
 * e realiza matchmaking inteligente por Combat Power para Olimpíadas e Coliseu.
 */

import { CombatPowerService } from './CombatPowerService.js';
import { D } from '../core/GameConfig.js';

// Hall of Legends padrão de alta fidelidade para inicialização e modo offline
export const DEFAULT_LEGEND_PROFILES = [
  {
    userId: 'legend_1',
    charName: 'LordValakas',
    race: 'Human',
    className: 'Duelist',
    level: 85,
    combatPower: 268500,
    olympiadPoints: 2450,
    olympiadWins: 142,
    duelWins: 380,
    clanName: 'DragonSlayers',
    castleLord: 'Giran Castle',
    isHero: true,
    topWeaponName: '+16 Infinity Blade (Hero)',
    topWeaponGlow: 'golden-amber',
    statsSnapshot: { hp: 12500, pAtk: 14200, mAtk: 1200, pDef: 8900, mDef: 6500, crit: 480 }
  },
  {
    userId: 'legend_2',
    charName: 'QueenShillien',
    race: 'Dark Elf',
    className: 'Ghost Sentinel',
    level: 84,
    combatPower: 242100,
    olympiadPoints: 2180,
    olympiadWins: 115,
    duelWins: 290,
    clanName: 'MoonlightOrder',
    castleLord: 'Aden Castle',
    isHero: true,
    topWeaponName: '+14 Draconic Bow (Focus)',
    topWeaponGlow: 'blue-ice',
    statsSnapshot: { hp: 8400, pAtk: 16800, mAtk: 800, pDef: 6200, mDef: 5800, crit: 500 }
  },
  {
    userId: 'legend_3',
    charName: 'ArchmageEva',
    race: 'Elf',
    className: 'Mystic Muse',
    level: 83,
    combatPower: 228900,
    olympiadPoints: 2050,
    olympiadWins: 98,
    duelWins: 240,
    clanName: 'SilverLight',
    castleLord: 'Dion Castle',
    isHero: false,
    topWeaponName: '+12 Arcana Mace (Acumen)',
    topWeaponGlow: 'crimson-fire',
    statsSnapshot: { hp: 7900, pAtk: 2400, mAtk: 18500, pDef: 5400, mDef: 7800, crit: 220 }
  },
  {
    userId: 'legend_4',
    charName: 'TitanGore',
    race: 'Orc',
    className: 'Titan',
    level: 82,
    combatPower: 215400,
    olympiadPoints: 1920,
    olympiadWins: 89,
    duelWins: 210,
    clanName: 'BloodFury',
    castleLord: 'Gludio Castle',
    isHero: false,
    topWeaponName: '+11 Heaven\'s Divider (Focus)',
    topWeaponGlow: 'purple-void',
    statsSnapshot: { hp: 16500, pAtk: 15400, mAtk: 600, pDef: 7800, mDef: 4900, crit: 360 }
  },
  {
    userId: 'legend_5',
    charName: 'SoulHoundX',
    race: 'Kamael',
    className: 'Soul Hound',
    level: 81,
    combatPower: 198200,
    olympiadPoints: 1840,
    olympiadWins: 76,
    duelWins: 185,
    clanName: 'DarkWings',
    castleLord: null,
    isHero: false,
    topWeaponName: '+10 Imperial Staff',
    topWeaponGlow: 'blue-ice',
    statsSnapshot: { hp: 9200, pAtk: 9800, mAtk: 14200, pDef: 6100, mDef: 6700, crit: 310 }
  },
  {
    userId: 'legend_6',
    charName: 'FortuneHunterGim',
    race: 'Dwarf',
    className: 'Fortune Seeker',
    level: 80,
    combatPower: 185000,
    olympiadPoints: 1690,
    olympiadWins: 62,
    duelWins: 160,
    clanName: 'GoldenAnvil',
    castleLord: null,
    isHero: false,
    topWeaponName: '+9 Basalt Battlehammer',
    topWeaponGlow: 'golden-amber',
    statsSnapshot: { hp: 14200, pAtk: 8900, mAtk: 400, pDef: 8500, mDef: 5200, crit: 280 }
  }
];

let _cachedRankings = {
  cp: [],
  olympiad: [],
  duels: [],
  castles: [],
  lastFetchTime: 0
};

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
   * Sincroniza o perfil atual do jogador no Firebase Firestore
   * @param {Object} state 
   */
  async syncToCloud(state) {
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

    if (!remoteList || remoteList.length === 0) {
      remoteList = [...DEFAULT_LEGEND_PROFILES];
      if (category === 'olympiad') {
        remoteList.sort((a, b) => (b.olympiadPoints || 0) - (a.olympiadPoints || 0));
      } else if (category === 'duels') {
        remoteList.sort((a, b) => (b.duelWins || 0) - (a.duelWins || 0));
      } else {
        remoteList.sort((a, b) => (b.combatPower || 0) - (a.combatPower || 0));
      }
    }

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
