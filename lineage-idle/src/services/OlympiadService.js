/**
 * OlympiadService.js — Motor da Grand Olympiad e Sistema de Heróis de Classe.
 *
 * Responsável por:
 * 1. Validação estrita de Nível 76+ e Status de Noblesse (`isNoblesse: true`).
 * 2. Matchmaking e resolução de combates ranqueados 1v1 no Coliseu.
 * 3. Gestão de Pontos de Ranqueamento (ELO) e Olympiad Tokens (Noblesse Gate Pass).
 * 4. Coroação de Herói (Hero Status), concessão da Aura Dourada e Armas Infinity.
 * 5. Transações comerciais na Loja de Tokens de Olimpíada.
 */

import { OLYMPIAD_GLADIATORS, OLYMPIAD_SHOP_CATALOG, INFINITY_WEAPONS, HEROIC_SKILLS } from '../data/olympiad.js';
import { NoblesseService } from './NoblesseService.js';

export class OlympiadService {
  /**
   * Retorna o status completo do herói na Grand Olympiad.
   * @param {Object} state
   * @returns {Object}
   */
  static getOlympiadStatus(state) {
    if (!state) {
      return {
        points: 1000,
        tokens: 0,
        wins: 0,
        losses: 0,
        isHero: false,
        canEnter: false,
        reason: 'Estado inválido',
        tierName: 'Iniciante'
      };
    }

    const noblesseCheck = NoblesseService.getNoblesseStatus(state);
    const points = state.olympiadPoints ?? 1000;
    const tokens = state.olympiadTokens ?? 0;
    const wins = state.olympiadWins ?? 0;
    const losses = state.olympiadLosses ?? 0;
    const isHero = Boolean(state.isHero);

    let tierName = '🛡️ Nobre Desafiante';
    if (isHero) tierName = '👑 GRAND OLYMPIAD HERO';
    else if (points >= 1500) tierName = '⭐ Mestre da Arena';
    else if (points >= 1300) tierName = '⚔️ Gladiador de Elite';
    else if (points >= 1150) tierName = '🛡️ Combatente Veterano';

    return {
      points,
      tokens,
      wins,
      losses,
      isHero,
      canEnter: noblesseCheck.canJoinOlympiad,
      reason: noblesseCheck.reason,
      tierName,
      isNoblesse: noblesseCheck.isNoblesse,
      level: state.level || 1
    };
  }

  /**
   * Valida se o herói pode enfileirar para um duelo de Olimpíada.
   * @param {Object} state
   * @returns {{ok: boolean, reason?: string}}
   */
  static canJoinMatch(state) {
    const status = this.getOlympiadStatus(state);
    if (!status.canEnter) {
      return { ok: false, reason: status.reason };
    }
    if (state.isRaidActive) {
      return { ok: false, reason: 'Finalize o combate de Raid Boss antes de entrar na Arena!' };
    }
    return { ok: true };
  }

  /**
   * Encontra um gladiador oponente equilibrado de acordo com os pontos do jogador.
   * @param {Object} state
   * @returns {Object}
   */
  static getGladiatorOpponent(state) {
    const points = state.olympiadPoints ?? 1000;
    const sorted = [...OLYMPIAD_GLADIATORS].sort((a, b) => Math.abs(a.elo - points) - Math.abs(b.elo - points));
    const gladiator = { ...(sorted[0] || OLYMPIAD_GLADIATORS[0]) };
    gladiator.currentHp = gladiator.hp;
    return gladiator;
  }

  /**
   * Encontra um oponente para duelo na Olimpíada, priorizando snapshots de jogadores reais via Firebase
   * com fallback transparente para gladiadores canônicos offline.
   * @param {Object} state
   * @returns {Promise<Object>}
   */
  static async getMatchmakingOpponent(state) {
    const points = state.olympiadPoints ?? 1000;

    // 1. Tenta matchmaking assíncrono com jogadores reais do Firebase
    if (typeof window !== 'undefined' && window.FirebaseBridge?.fetchLeaderboard) {
      try {
        const rankings = await window.FirebaseBridge.fetchLeaderboard('olympiad', 25);
        const myId = window.FirebaseBridge.getCurrentUserId?.();
        const myName = state.charName || state.heroName || state.name;

        const eligible = (rankings || []).filter(r => {
          if (!r) return false;
          if (myId && (r.id === myId || r.userId === myId)) return false;
          if (myName && r.charName === myName) return false;
          return true;
        });

        if (eligible.length > 0) {
          // Ordena pelo competidor mais próximo em pontuação de Olimpíada
          eligible.sort((a, b) => Math.abs((a.olympiadPoints || 1000) - points) - Math.abs((b.olympiadPoints || 1000) - points));
          const chosen = eligible[0];
          const snap = chosen.statsSnapshot || {};
          const level = chosen.level || 76;
          const hp = Math.max(snap.hp || 15000, 10000);
          const atk = Math.max(snap.pAtk || 500, 250);
          const def = Math.max(snap.pDef || 400, 200);
          const matk = Math.max(snap.mAtk || 450, 220);
          const mdef = Math.max(snap.mDef || 350, 180);

          return {
            id: chosen.id,
            name: chosen.charName,
            title: `Lv. ${level} ${chosen.className || 'Combatente'} [Player Real 🛡️]`,
            clanName: chosen.clanName || 'Sem Clã',
            hp,
            currentHp: hp,
            atk,
            def,
            matk,
            mdef,
            elo: chosen.olympiadPoints || 1000,
            isRealPlayer: true
          };
        }
      } catch (err) {
        console.warn('[Olympiad] Falha ao carregar oponente real do Firebase, usando gladiador offline:', err);
      }
    }

    // 2. Fallback para gladiadores offline
    return this.getGladiatorOpponent(state);
  }

  /**
   * Executa um duelo 1v1 na arena mágica da Grand Olympiad.
   * @param {Object} state
   * @param {Object} callbacks
   * @returns {Promise<Object>}
   */
  static async startOlympiadMatch(state, callbacks = {}) {
    const check = this.canJoinMatch(state);
    if (!check.ok) {
      if (callbacks.log) callbacks.log(`❌ ${check.reason}`, 'system');
      return { ok: false, reason: check.reason };
    }

    const gladiator = await this.getMatchmakingOpponent(state);
    if (callbacks.log) {
      callbacks.log(`⚔️ [Grand Olympiad] **DUELO INICIADO:** ${state.heroName || state.charName || 'Você'} vs ${gladiator.name} (${gladiator.title})!`, gladiator.isRealPlayer ? 'rarity-legendary' : 'rarity-epic');
    }

    // Atributos do Herói
    const heroHpMax = state.maxHp || 15000;
    let heroHp = heroHpMax;
    let gladHp = gladiator.hp;

    const heroAtk = Math.max(state.atk || 450, 200);
    const heroMatk = Math.max(state.matk || 400, 150);
    const heroDef = Math.max(state.def || 350, 150);
    const heroMdef = Math.max(state.mdef || 300, 150);

    let round = 1;
    const battleLog = [];

    // Loop de combate simulado por turnos rápidos
    while (heroHp > 0 && gladHp > 0 && round <= 15) {
      // 1. Herói ataca Gladiador
      const heroDmgType = heroMatk > heroAtk ? 'magic' : 'phys';
      const rawHeroDmg = heroDmgType === 'magic' ? (heroMatk * 1.5) : (heroAtk * 1.3);
      const gladDefense = heroDmgType === 'magic' ? gladiator.mdef : gladiator.def;
      const heroHit = Math.max(Math.round((rawHeroDmg * (100 / (100 + gladDefense * 0.15))) * (0.9 + Math.random() * 0.2)), 50);

      gladHp = Math.max(0, gladHp - heroHit);
      battleLog.push(`Round ${round}: Você causou **${heroHit.toLocaleString()}** de dano em ${gladiator.name}. (HP do Oponente: ${gladHp.toLocaleString()}/${gladiator.hp.toLocaleString()})`);

      if (gladHp <= 0) break;

      // 2. Gladiador ataca Herói
      const gladDmg = Math.max(Math.round((gladiator.atk * 1.25 * (100 / (100 + heroDef * 0.15))) * (0.85 + Math.random() * 0.3)), 40);
      heroHp = Math.max(0, heroHp - gladDmg);
      battleLog.push(`Round ${round}: ${gladiator.name} desferiu golpe causando **${gladDmg.toLocaleString()}** de dano em você! (Seu HP: ${heroHp.toLocaleString()}/${heroHpMax.toLocaleString()})`);

      round++;
    }

    const isVictory = gladHp <= 0 || heroHp > gladHp;

    if (isVictory) {
      const pointsGained = 35;
      const tokensGained = 200;

      state.olympiadPoints = (state.olympiadPoints ?? 1000) + pointsGained;
      state.olympiadTokens = (state.olympiadTokens ?? 0) + tokensGained;
      state.olympiadWins = (state.olympiadWins ?? 0) + 1;

      if (callbacks.log) {
        callbacks.log(`🏆 **VITÓRIA GLORIOSA NA GRAND OLYMPIAD!**`, 'rarity-legendary');
        callbacks.log(`Você derrotou ${gladiator.name}! Ganhou **+${pointsGained} Pontos de Olimpíada** e **+${tokensGained} Olympiad Tokens**!`, 'rarity-epic');
      }

      // Checagem de Elegibilidade para HERO
      if (state.olympiadPoints >= 1500 && !state.isHero) {
        if (callbacks.log) {
          callbacks.log('👑✨ **VOCÊ ATINGIU PONTUAÇÃO DE HERÓI (1500+ PONTOS)!** Reivindique sua coroa no Monumento de Heróis!', 'rarity-legendary');
        }
      }

      if (callbacks.onUpdate) callbacks.onUpdate();

      return {
        ok: true,
        result: 'victory',
        gladiator,
        pointsGained,
        tokensGained,
        battleLog
      };
    } else {
      const pointsLost = Math.min(15, (state.olympiadPoints ?? 1000) - 500);
      const tokensGained = 50; // Consolação

      state.olympiadPoints = Math.max(500, (state.olympiadPoints ?? 1000) - pointsLost);
      state.olympiadTokens = (state.olympiadTokens ?? 0) + tokensGained;
      state.olympiadLosses = (state.olympiadLosses ?? 0) + 1;

      if (callbacks.log) {
        callbacks.log(`💀 **DERROTA NA ARENA.** ${gladiator.name} venceu o duelo. (-${pointsLost} Pontos, +${tokensGained} Tokens de consolação)`, 'system');
      }

      if (callbacks.onUpdate) callbacks.onUpdate();

      return {
        ok: true,
        result: 'defeat',
        gladiator,
        pointsLost,
        tokensGained,
        battleLog
      };
    }
  }

  /**
   * Consagra o jogador como HERÓI DE CLASSE (Grand Olympiad Hero).
   * @param {Object} state
   * @param {string} infinityWeaponId
   * @param {Object} callbacks
   * @returns {boolean}
   */
  static claimHeroStatus(state, infinityWeaponId = 'weapon_infinity_blade', callbacks = {}) {
    if (!state) return false;
    const points = state.olympiadPoints ?? 1000;
    if (points < 1500) {
      if (callbacks.log) callbacks.log('❌ Requer pelo menos 1.500 Pontos de Olimpíada para ser coroado Herói!', 'system');
      return false;
    }

    state.isHero = true;
    state.heroTitle = 'Grand Olympiad Hero 👑';
    state.heroAura = 'golden_hero_aura';

    // Adiciona as 4 Habilidades Heroicas
    state.skills = state.skills || {};
    state.skills['heroic_valor'] = 1;
    state.skills['heroic_miracle'] = 1;
    state.skills['heroic_berserker'] = 1;
    state.skills['heroic_grandeur'] = 1;

    // Entrega a Arma Infinity escolhida
    const weaponDef = INFINITY_WEAPONS[infinityWeaponId] || INFINITY_WEAPONS['weapon_infinity_blade'];
    state.inventory = state.inventory || [];
    const uid = 'inf_' + Date.now();
    state.inventory.push({
      uid,
      itemId: weaponDef.id,
      enchant: 0,
      count: 1
    });

    if (callbacks.log) {
      callbacks.log('👑🌟 **COROAÇÃO DE HERÓI SUPREMO DE ADEN!** 🌟👑', 'rarity-legendary');
      callbacks.log(`Você recebeu a **Aura Dourada Cintilante**, as 4 **Habilidades Heroicas** e a **${weaponDef.name}**!`, 'rarity-legendary');
    }

    if (callbacks.onUpdate) callbacks.onUpdate();
    return true;
  }

  /**
   * Compra um item da Loja de Tokens de Olimpíada.
   * @param {Object} state
   * @param {string} itemId
   * @param {Object} callbacks
   * @returns {boolean}
   */
  static buyShopItem(state, itemId, callbacks = {}) {
    if (!state || !itemId) return false;
    const item = OLYMPIAD_SHOP_CATALOG.find(i => i.id === itemId);
    if (!item) {
      if (callbacks.log) callbacks.log('❌ Item de Olimpíada não encontrado!', 'system');
      return false;
    }

    const currentTokens = state.olympiadTokens ?? 0;
    if (currentTokens < item.priceTokens) {
      if (callbacks.log) callbacks.log(`❌ Olympiad Tokens insuficientes! Necessário: ${item.priceTokens} (Você tem: ${currentTokens})`, 'system');
      return false;
    }

    state.olympiadTokens -= item.priceTokens;
    state.inventory = state.inventory || [];

    const uid = 'olyshop_' + Date.now();
    state.inventory.push({
      uid,
      itemId: item.reward.itemId,
      enchant: 0,
      count: item.reward.count || 1
    });

    if (callbacks.log) {
      callbacks.log(`🛍️ **Compra Concluída:** Você adquiriu **${item.name}** por ${item.priceTokens} Tokens de Olimpíada!`, 'rarity-epic');
    }

    if (callbacks.onUpdate) callbacks.onUpdate();
    return true;
  }
}
