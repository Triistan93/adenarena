/**
 * WeaponResonanceService.js — Sistema de Ressonância de Armas e Combos de Habilidades Cruzadas.
 *
 * Analisa as armas equipadas no Slot 1 (weapon) e Slot 2 (weapon2) + Escudo,
 * ativando passivas únicas e procs de combate para todas as combinações de armas do Aden Arena.
 */

import { D } from '../core/GameConfig.js';
import { detectItemWeaponType } from '../engine/SkillEngine.js';

export const RESONANCE_STATES = {
  LOCKED: 'LOCKED',
  INACTIVE: 'INACTIVE',
  READY: 'READY',
  ACTIVE: 'ACTIVE',
  ARMED: 'ARMED',
  COOLDOWN: 'COOLDOWN'
};

export const RESONANCE_DEFINITIONS = {
  // 1. Arco + Adaga
  shadow_stalker: {
    id: 'shadow_stalker',
    name: 'Caçador das Sombras',
    pairName: 'Arco + Adaga',
    icon: '🏹🗡️',
    color: '#a855f7',
    desc: 'Habilidades de Arco aplicam [Marca das Sombras]. Golpes de Adaga causam +100% de Crítico Fatal e Sangramento. Críticos têm 18% de chance de ignorar 35% da P.Def por 4s.',
    weap1: 'bow',
    weap2: 'dagger',
    passives: { critChance: 8, eva: 8 }
  },

  // 2. Arco + Lança
  dragon_lancer: {
    id: 'dragon_lancer',
    name: 'Sentinela Dracônico',
    pairName: 'Arco + Lança',
    icon: '🏹🔱',
    color: '#0284c7',
    desc: 'Disparos de Arco aplicam Lentidão (-20% Atk.Spd no alvo). Golpes de Lança contra alvos lentos causam +35% de Dano Perfurante e +40% de Stagger.',
    weap1: 'bow',
    weap2: 'spear',
    passives: { staggerDmgPct: 20, atkSpd: 6 }
  },

  // 3. Arco + Cajado
  arcane_ranger: {
    id: 'arcane_ranger',
    name: 'Arqueiro Arcano',
    pairName: 'Arco + Cajado',
    icon: '🏹🔮',
    color: '#38bdf8',
    desc: 'Flechas Infundidas: Tiros de arco causam dano híbrido (+50% dano mágico elemental adicional). +15% Cast.Spd e +10% M.Crit.',
    weap1: 'bow',
    weap2: 'staff',
    passives: { castSpd: 15, mCrit: 10 }
  },

  // 4. Arco + Maça/Blunt
  siege_sentinel: {
    id: 'siege_sentinel',
    name: 'Caçador de Cerco',
    pairName: 'Arco + Maça/Blunt',
    icon: '🏹🔨',
    color: '#d97706',
    desc: 'Destruidor de Armaduras: +30% de dano contra Chefes e Elites. Golpes de Maça causam +50% de Dano de Postura (Stagger) extra.',
    weap1: 'bow',
    weap2: 'blunt',
    passives: { bossDmgPct: 30, staggerDmgPct: 25 }
  },

  // 5. Arco + Garras/Punhos
  wild_hunter: {
    id: 'wild_hunter',
    name: 'Caçador Feral',
    pairName: 'Arco + Garras/Punhos',
    icon: '🏹🥊',
    color: '#10b981',
    desc: 'Tiros de arco causam Sangramento à distância. Golpes de garra curam o herói em 5% do HP máximo por ataque contra alvos sangrando.',
    weap1: 'bow',
    weap2: 'fist',
    passives: { atkSpd: 12, lifeDrain: 5 }
  },

  // 6. Arco + Espada 1H
  agile_skirmisher: {
    id: 'agile_skirmisher',
    name: 'Batedor Ágil',
    pairName: 'Arco + Espada 1H',
    icon: '🏹⚔️',
    color: '#34d399',
    desc: 'Mobilidade superior: +15% de Velocidade de Ataque (Atk.Spd) e +12% de Evasão permanente durante o combate.',
    weap1: 'bow',
    weap2: 'sword',
    passives: { atkSpd: 15, eva: 12 }
  },

  // 7. Arco + Espada 2H
  dragon_slayer: {
    id: 'dragon_slayer',
    name: 'Atirador Pesado',
    pairName: 'Arco + Espada 2H',
    icon: '🏹🗡️',
    color: '#b91c1c',
    desc: 'Tiros à distância acumulam Mira Precisa (+30% Crit Dmg). O próximo golpe de Espada 2H tem 100% de Crítico e ignora 40% de P.Def.',
    weap1: 'bow',
    weap2: ['twohand', 'ancientsword'],
    passives: { critDmgPct: 30 }
  },

  // 8. Arco + Dual Swords
  storm_ranger: {
    id: 'storm_ranger',
    name: 'Tempestade de Flechas',
    pairName: 'Arco + Dual Swords',
    icon: '🏹⚔️',
    color: '#06b6d4',
    desc: 'Alternar entre disparos de arco e golpes de espadas duplas concede Aceleração Élfica (+35% Atk.Spd e rajadas duplas de ataque).',
    weap1: 'bow',
    weap2: 'dual',
    passives: { atkSpd: 25 }
  },

  // 9. Lança + Adaga
  viper_skirmisher: {
    id: 'viper_skirmisher',
    name: 'Espreitador Venenoso',
    pairName: 'Lança + Adaga',
    icon: '🔱🗡️',
    color: '#84cc16',
    desc: 'Adaga empilha Toxina Paralisante (-15% Spd inimigo até 3x). O golpe de Lança detona as toxinas causando explosão hemorrágica de +60% dano/carga.',
    weap1: 'spear',
    weap2: 'dagger',
    passives: { atkSpd: 10, critChance: 8 }
  },

  // 10. Lança + Espada 1H
  phalanx_warlord: {
    id: 'phalanx_warlord',
    name: 'Comandante de Falange',
    pairName: 'Lança + Espada 1H',
    icon: '🔱⚔️',
    color: '#eab308',
    desc: 'Postura de Falange: +20% P.Def. Espada aplica Fratura Tática, garantindo que o próximo ataque de Lança desfira um Cleave com +45% de dano.',
    description: 'Postura de Falange: +20% P.Def. Espada aplica Fratura Tática, garantindo que o próximo ataque de Lança desfira um Cleave com +45% de dano.',
    weap1: 'spear',
    weap2: 'sword',
    requirements: ['spear', 'sword'],
    activationRule: 'Equipar Lança e Espada 1H nos slots de armamento',
    passives: { pDefPct: 20, pAtkPct: 8 },
    passiveEffects: { pDefPct: 20, pAtkPct: 8 },
    triggerEffects: [
      { trigger: 'sword_hit', effect: 'ARM_TACTICAL_FRACTURE', description: 'Arma Fratura Tática' },
      { trigger: 'spear_hit', effect: 'CLEAVE_BONUS_45', description: 'Cleave com +45% de dano (+45% BaseSpearDamage)' }
    ],
    cooldowns: { tacticalFracture: 0 },
    visual: { icon: '🔱⚔️', color: '#eab308', badge: 'Falange' }
  },

  // 11. Lança + Dual Swords
  bladestorm_warlord: {
    id: 'bladestorm_warlord',
    name: 'Senhor da Tempestade',
    pairName: 'Lança + Dual Swords',
    icon: '🔱⚔️',
    color: '#38bdf8',
    desc: 'Golpes de Lança acumulam até 5 cargas de Fúria da Tempestade. Habilidades de Dual Swords consomem as cargas para desferir ondas de vácuo (+20% dano/carga e -25% P.Def). +25% Stagger passivo.',
    weap1: 'spear',
    weap2: 'dual',
    passives: { staggerDmgPct: 25, pAtkPct: 10 }
  },

  // 12. Lança + Maça/Blunt
  titan_colossus: {
    id: 'titan_colossus',
    name: 'Colosso de Titã',
    pairName: 'Lança + Maça/Blunt',
    icon: '🔱🔨',
    color: '#f97316',
    desc: 'Maça estilhaça armadura (-20% P.Atk do alvo). Habilidades de lança causam impacto sísmico (+40% postura) e aumentam a duração do Stagger em +3s.',
    weap1: 'spear',
    weap2: 'blunt',
    passives: { staggerDmgPct: 35, pDefPct: 10 }
  },

  // 13. Lança + Espada 2H
  dreadnought: {
    id: 'dreadnought',
    name: 'General Berserker',
    pairName: 'Lança + Espada 2H',
    icon: '🔱🗡️',
    color: '#dc2626',
    desc: 'Cleave Titânico: +30% de Dano em Área. Durante a janela de BREAK do monstro, o multiplicador de vulnerabilidade sobe de 2.0x para 2.5x!',
    weap1: 'spear',
    weap2: ['twohand', 'ancientsword'],
    passives: { pAtkPct: 15, staggerDmgPct: 25 }
  },

  // 14. Lança + Cajado
  storm_arbiter: {
    id: 'storm_arbiter',
    name: 'Árbitro da Tempestade',
    pairName: 'Lança + Cajado',
    icon: '🔱🔮',
    color: '#6366f1',
    desc: 'Lança atua como para-raios canalizador: magias causam dano em cadeia elétrico e o Cast.Spd aumenta em +30%.',
    weap1: 'spear',
    weap2: 'staff',
    passives: { castSpd: 30, mAtkPct: 12 }
  },

  // 15. Lança + Garras/Punhos
  asura_striker: {
    id: 'asura_striker',
    name: 'Mestre Monástico',
    pairName: 'Lança + Garras/Punhos',
    icon: '🔱🥊',
    color: '#14b8a6',
    desc: 'Golpes de Punho acumulam Fluxo de Chi (+5% Atk.Spd até 30%). O golpe de Lança consome o Chi para disparar uma onda que ignora 50% da P.Def.',
    weap1: 'spear',
    weap2: 'fist',
    passives: { atkSpd: 15, pAtkPct: 10 }
  },

  // 16. Adaga + Espada 1H
  shadow_duelist: {
    id: 'shadow_duelist',
    name: 'Duelista das Sombras',
    pairName: 'Adaga + Espada 1H',
    icon: '🗡️⚔️',
    color: '#ec4899',
    desc: '+25% Atk.Spd permanente. Golpes de espada abrem a guarda do alvo e acertos críticos de adaga reduzem o cooldown de todas as skills ativas em 1s.',
    weap1: 'dagger',
    weap2: 'sword',
    passives: { atkSpd: 25, critChance: 10 }
  },

  // 17. Adaga + Maça/Blunt
  iron_inquisitor: {
    id: 'iron_inquisitor',
    name: 'Inquisidor de Ferro',
    pairName: 'Adaga + Maça/Blunt',
    icon: '🗡️🔨',
    color: '#78716c',
    desc: 'Golpes de Maça desestabilizam o monstro por 3s. Golpes de Adaga desferidos durante a desestabilização têm 100% de penetração de armadura (dano verdadeiro).',
    weap1: 'dagger',
    weap2: 'blunt',
    passives: { critDmgPct: 20, staggerDmgPct: 15 }
  },

  // 18. Adaga + Garras/Punhos
  ghost_phantom: {
    id: 'ghost_phantom',
    name: 'Fantasma de Asura',
    pairName: 'Adaga + Garras/Punhos',
    icon: '🗡️🥊',
    color: '#8b5cf6',
    desc: 'Críticos de garra desorientam o monstro. Golpes de adaga contra alvos desorientados causam dano quadruplicado de Sangramento (Bleed Overdrive).',
    weap1: 'dagger',
    weap2: 'fist',
    passives: { atkSpd: 20, critChance: 12 }
  },

  // 19. Adaga + Dual Swords
  blade_dancer: {
    id: 'blade_dancer',
    name: 'Danseur Fantasma',
    pairName: 'Adaga + Dual Swords',
    icon: '🗡️⚔️',
    color: '#f43f5e',
    desc: 'Dança da Morte: Cada ataque consecutivo aumenta o dano crítico em +10% (acumula até 100%). +20% de Evasão durante o combate.',
    weap1: 'dagger',
    weap2: 'dual',
    passives: { eva: 20, critChance: 15 }
  },

  // 20. Espada 2H + 1H/Escudo
  avenging_paladin: {
    id: 'avenging_paladin',
    name: 'Paladino Vingador',
    pairName: 'Espada 2H + 1H/Escudo',
    icon: '🛡️⚔️',
    color: '#fbbf24',
    desc: 'Golpes de Escudo concedem Vingança Sagrada. O próximo golpe de Espada 2H ignora 35% da P.Def do monstro e causa +50% de Dano de Postura.',
    weap1: 'sword',
    weap2: ['twohand', 'ancientsword'],
    reqShield: true,
    passives: { pDefPct: 15, staggerDmgPct: 25 }
  },

  // 21. Espada 2H + Maça/Blunt
  skullbreaker: {
    id: 'skullbreaker',
    name: 'Esmagador de Crânios',
    pairName: 'Espada 2H + Maça/Blunt',
    icon: '🗡️🔨',
    color: '#991b1b',
    desc: 'Força bruta pura: Maça quebra postura defensiva (+60% Stagger). Espada de 2 Mãos causa dano dobrado contra monstros em Stagger.',
    weap1: ['twohand', 'ancientsword'],
    weap2: 'blunt',
    passives: { staggerDmgPct: 50, pAtkPct: 12 }
  },

  // 22. Cajado + Espada/Lâmina
  spellblade_arcanist: {
    id: 'spellblade_arcanist',
    name: 'Feiticeiro da Lâmina',
    pairName: 'Cajado + Espada/Lâmina',
    icon: '🔮🗡️',
    color: '#c084fc',
    desc: 'Magias acumulam Lâmina Arcana (dano híbrido físico+mágico + 10% MP restaurado). 15% de chance de resetar o cooldown de magias ativas no impacto.',
    weap1: 'staff',
    weap2: ['sword', 'dagger', 'blunt'],
    passives: { castSpd: 15, mAtkPct: 10 }
  },

  // 23. Cajado + Maça/Blunt
  battle_hierophant: {
    id: 'battle_hierophant',
    name: 'Hierofante de Batalha',
    pairName: 'Cajado + Maça/Blunt',
    icon: '🔮🔨',
    color: '#fde047',
    desc: 'Cura aumentada em +35%. Golpes de maça liberam Retribuição Divina causando dano mágico sagrado proporcional ao HP máximo do herói.',
    weap1: 'staff',
    weap2: 'blunt',
    passives: { healBoostPct: 35, mDefPct: 20 }
  },

  // 24. Cajado + Garras/Punhos
  mystic_brawler: {
    id: 'mystic_brawler',
    name: 'Monge Elemental',
    pairName: 'Cajado + Garras/Punhos',
    icon: '🔮🥊',
    color: '#a855f7',
    desc: 'Golpes de garra recuperam 3% MP e reduzem a M.Def do monstro em 20%. Com 5 cargas de punho, a próxima magia ofensiva dispara instantaneamente.',
    weap1: 'staff',
    weap2: 'fist',
    passives: { atkSpd: 15, castSpd: 20 }
  },

  // 25. Garras + Espada/Dual
  soul_monk: {
    id: 'soul_monk',
    name: 'Monge Espiritual',
    pairName: 'Garras + Espada/Dual',
    icon: '🥊⚔️',
    color: '#14b8a6',
    desc: 'Roubo de vida permanente (+8% Vampiric Rage) e +20% Velocidade de Ataque e Movimento durante todo o combate.',
    weap1: 'fist',
    weap2: ['sword', 'dual'],
    passives: { lifeDrain: 8, atkSpd: 20 }
  },

  // 26. Cajado + Escudo
  grand_archon: {
    id: 'grand_archon',
    name: 'Arquimago Guardião',
    pairName: 'Cajado + Escudo',
    icon: '🔮🛡️',
    color: '#60a5fa',
    desc: 'Foco protetor: +25% Velocidade de Conjuração (Cast.Spd) e Barreira Arcana que absorve 15% do dano recebido.',
    weap1: 'staff',
    weap2: 'any',
    reqShield: true,
    passives: { castSpd: 25, damageReductionPct: 15 }
  },

  // 27. Espada + Espada (Sinfonia das Lâminas)
  blade_symphony: {
    id: 'blade_symphony',
    name: 'Sinfonia das Lâminas',
    pairName: 'Espada + Espada',
    icon: '⚔️⚔️',
    color: '#3b82f6',
    desc: 'Cadência perfeita de combate com lâminas duplas: +15% Velocidade de Ataque (Atk.Spd) e +10% de Chance de Crítico.',
    weap1: 'sword',
    weap2: 'sword',
    passives: { atkSpd: 15, critChance: 10 }
  }
};

export class WeaponResonanceService {
  /**
   * Identifica os tipos das armas equipadas no Slot 1 e Slot 2.
   * @param {Object} state
   * @returns {{ weap1: string|null, weap2: string|null, hasShield: boolean }}
   */
  static getEquippedWeaponTypes(state) {
    if (!state?.equipment) return { weap1: null, weap2: null, hasShield: false };
    const gData = D();
    const allItems = gData?.ALL_ITEMS || {};

    const resolveType = (slotKey) => {
      const uid = state.equipment[slotKey];
      if (!uid) return null;
      const item = (typeof uid === 'object') ? uid : state.inventory?.find(i => i.uid === uid);
      if (!item) return null;
      const def = (item.itemId && allItems[item.itemId]) || item;
      return detectItemWeaponType(def);
    };

    const weap1 = resolveType('weapon');
    const weap2 = resolveType('weapon2');
    const hasShield = !!state.equipment.shield;

    return { weap1, weap2, hasShield };
  }

  /**
   * Determina a Ressonância Ativa para o par de armas atual.
   * @param {Object} state
   * @returns {Object|null}
   */
  static getActiveResonance(state) {
    const { weap1, weap2, hasShield } = this.getEquippedWeaponTypes(state);
    if (!weap1 && !weap2) return null;

    for (const resKey of Object.keys(RESONANCE_DEFINITIONS)) {
      const def = RESONANCE_DEFINITIONS[resKey];
      if (def.reqShield && !hasShield) continue;

      const checkMatch = (req, type) => {
        if (!type) return false;
        if (req === 'any') return true;
        if (Array.isArray(req)) return req.includes(type);
        return req === type;
      };

      const matchesPair = 
        (checkMatch(def.weap1, weap1) && checkMatch(def.weap2, weap2)) ||
        (checkMatch(def.weap2, weap1) && checkMatch(def.weap1, weap2));

      if (matchesPair) {
        return def;
      }
    }

    return null;
  }

  /**
   * Retorna os bônus passivos concedidos pela ressonância ativa.
   * @param {Object} state
   * @returns {Object}
   */
  static getPassiveStats(state) {
    const res = this.getActiveResonance(state);
    return res?.passives || {};
  }

  /**
   * Determina o estado atual do ciclo de vida da Ressonância Ativa.
   * Estados canônicos: LOCKED | INACTIVE | READY | ACTIVE | ARMED | COOLDOWN
   * @param {Object} state
   * @returns {string}
   */
  static getResonanceState(state) {
    const resonance = this.getActiveResonance(state);
    if (!resonance) return RESONANCE_STATES.LOCKED;

    const rState = state?.resonanceState || {};
    if (resonance.id === 'phalanx_warlord') {
      if (rState.tacticalFracture === 'ARMED') {
        return RESONANCE_STATES.ARMED;
      }
      return RESONANCE_STATES.ACTIVE;
    }

    if ((rState.holyVengeanceUntil && rState.holyVengeanceUntil > Date.now()) ||
        (rState.stormFury && rState.stormFury > 0) ||
        rState.arcaneBlade) {
      return RESONANCE_STATES.ARMED;
    }

    return RESONANCE_STATES.ACTIVE;
  }

  /**
   * Retorna o contrato completo e enriquecido da ressonância com estado atual.
   * @param {Object} state
   * @returns {Object}
   */
  static getResonanceContract(state) {
    const resonance = this.getActiveResonance(state);
    if (!resonance) {
      return {
        id: null,
        name: 'Nenhuma Ressonância',
        state: RESONANCE_STATES.LOCKED,
        requirements: [],
        activationRule: 'Equipe armas complementares nos slots 1 e 2',
        passiveEffects: {},
        triggerEffects: [],
        cooldowns: {},
        visual: { icon: '⚔️', color: '#64748b', badge: 'Bloqueado' },
        description: 'Equipe armas sinérgicas para desbloquear ressonâncias de combate.'
      };
    }

    const currentLifecycleState = this.getResonanceState(state);
    return {
      ...resonance,
      state: currentLifecycleState,
      requirements: resonance.requirements || [resonance.weap1, resonance.weap2].flat(),
      activationRule: resonance.activationRule || `Equipar ${resonance.pairName}`,
      passiveEffects: resonance.passiveEffects || resonance.passives || {},
      triggerEffects: resonance.triggerEffects || [],
      cooldowns: resonance.cooldowns || {},
      visual: resonance.visual || { icon: resonance.icon || '⚔️', color: resonance.color || '#eab308', badge: resonance.name },
      description: resonance.description || resonance.desc || ''
    };
  }

  /**
   * Retorna um ícone ou SVG seguro para ressonância, garantindo que nunca quebre.
   * @param {Object} resDef
   * @returns {string}
   */
  static getResonanceIcon(resDef) {
    if (!resDef) return '⚔️';
    if (resDef.visual?.icon) return resDef.visual.icon;
    if (resDef.icon) return resDef.icon;
    return '✨';
  }

  /**
   * Processa o disparo de habilidades com efeitos de ressonância cruzada.
   * @param {Object} state
   * @param {Object} skillDef
   * @param {Object} monster
   * @param {Object} callbacks — { log, floatText, playVFX }
   */
  static onSkillCast(state, skillDef, monster, callbacks = {}) {
    const resonance = this.getActiveResonance(state);
    if (!resonance || !monster) return;

    state.resonanceState = state.resonanceState || {};
    const skillNameLower = (skillDef.name || '').toLowerCase();
    const reqWeapon = skillDef.weaponType || skillDef.requiredWeapon || '';
    const realNow = Date.now();

    // 1. Caçador das Sombras: Tiro de Arco aplica Marca das Sombras
    if (resonance.id === 'shadow_stalker') {
      if (reqWeapon === 'bow' || skillNameLower.includes('shot') || skillNameLower.includes('arrow') || skillNameLower.includes('snipe')) {
        monster._shadowMarkUntil = realNow + 8000;
        if (callbacks.floatText) callbacks.floatText('🎯 MARCA DAS SOMBRAS!', 'float-epic');
        if (callbacks.log) callbacks.log('🎯 Caçador das Sombras: Alvo marcado! Próximo golpe de Adaga causará +100% de Crítico Fatal e Sangramento!', 'combat');
      }
    }

    // 2. Sentinela Dracônico: Tiros de Arco aplicam Lentidão
    if (resonance.id === 'dragon_lancer') {
      if (reqWeapon === 'bow' || skillNameLower.includes('shot') || skillNameLower.includes('arrow')) {
        monster._slowUntil = realNow + 6000;
        if (callbacks.floatText) callbacks.floatText('❄️ LENTIDÃO DRACÔNICA!', 'float-gold');
      }
    }

    // 3. Senhor da Tempestade: Lança gera Fúria da Tempestade
    if (resonance.id === 'bladestorm_warlord') {
      if (reqWeapon === 'spear' || skillNameLower.includes('whirlwind') || skillNameLower.includes('storm') || skillNameLower.includes('sweep')) {
        state.resonanceState.stormFury = Math.min(5, (state.resonanceState.stormFury || 0) + 1);
        const stacks = state.resonanceState.stormFury;
        if (callbacks.floatText) callbacks.floatText(`⚡ FÚRIA (${stacks}/5)`, 'float-gold');
        if (callbacks.log) callbacks.log(`⚡ Fúria da Tempestade acumulada (${stacks}/5 cargas)!`, 'combat');
      }
    }

    // 4. Paladino Vingador: Escudo gera Vingança Sagrada
    if (resonance.id === 'avenging_paladin') {
      if (skillDef.requiredShield || skillNameLower.includes('shield') || skillNameLower.includes('stun')) {
        state.resonanceState.holyVengeanceUntil = realNow + 7000;
        if (callbacks.floatText) callbacks.floatText('🛡️ VINGANÇA SAGRADA!', 'float-jackpot');
        if (callbacks.log) callbacks.log('🛡️ Vingança Sagrada ativada! O próximo ataque com a Espada de 2 Mãos ignorará 35% da P.Def do alvo!', 'rarity-legendary');
      }
    }

    // 5. Feiticeiro da Lâmina: Magias acumulam Lâmina Arcana e têm 15% de reset de cooldown
    if (resonance.id === 'spellblade_arcanist') {
      if (reqWeapon === 'staff' || skillDef.effect === 'spell' || skillNameLower.includes('hydro') || skillNameLower.includes('prominence') || skillNameLower.includes('hurricane') || skillNameLower.includes('flare')) {
        state.resonanceState.arcaneBlade = true;
        if (Math.random() < 0.15 && state._cds) {
          // 15% de chance de resetar cooldowns de magias ativas
          for (const k of Object.keys(state._cds)) {
            state._cds[k] = 0;
          }
          if (callbacks.floatText) callbacks.floatText('⚡ ARCANE RESET!', 'float-jackpot');
          if (callbacks.log) callbacks.log('⚡ Feiticeiro da Lâmina: Pulso Arcano resetou todos os cooldowns de feitiços!', 'rarity-legendary');
        } else {
          if (callbacks.floatText) callbacks.floatText('🔮 LÂMINA ARCANA!', 'float-epic');
        }
      }
    }

    // 6. Espreitador Venenoso: Adaga empilha Toxina
    if (resonance.id === 'viper_skirmisher' && (reqWeapon === 'dagger' || skillNameLower.includes('stab') || skillNameLower.includes('blow'))) {
      state.resonanceState.viperToxin = Math.min(3, (state.resonanceState.viperToxin || 0) + 1);
      const toks = state.resonanceState.viperToxin;
      if (callbacks.floatText) callbacks.floatText(`🧪 TOXINA (${toks}/3)`, 'float-gold');
    }

    // 7. Monge Elemental: Punhos acumulam cargas arcanas
    if (resonance.id === 'mystic_brawler' && (reqWeapon === 'fist' || skillNameLower.includes('punch') || skillNameLower.includes('fist') || skillNameLower.includes('force'))) {
      state.resonanceState.brawlerChi = Math.min(5, (state.resonanceState.brawlerChi || 0) + 1);
    }

    // 8. Comandante de Falange: Habilidade de Espada arma Fratura Tática
    if (resonance.id === 'phalanx_warlord') {
      if (reqWeapon === 'sword' || skillNameLower.includes('slash') || skillNameLower.includes('strike') || skillNameLower.includes('triple') || skillNameLower.includes('sonic')) {
        state.resonanceState.tacticalFracture = 'ARMED';
        state.resonanceState.state = 'ARMED';
        state.resonanceState.phalanxCleave = true;
        if (callbacks.floatText) callbacks.floatText('⚔ TACTICAL FRACTURE (ARMED)', 'float-epic');
        if (callbacks.log) callbacks.log('⚔ Fratura Tática armada! Próximo ataque de Lança causará Cleave com +45% de dano!', 'combat');
      }
    }
  }

  /**
   * Processa o cálculo e amplificação de dano resultante de ressonâncias ativas no impacto.
   * @param {Object} state
   * @param {Object} monster
   * @param {string} weaponTypeUsed
   * @param {number} baseDamage
   * @param {Object} callbacks
   * @returns {{ finalDamage: number, extraEffects: Array }}
   */
  static processAttackImpact(state, monster, weaponTypeUsed, baseDamage, callbacks = {}) {
    let finalDamage = baseDamage;
    const extraEffects = [];
    const resonance = this.getActiveResonance(state);
    if (!resonance || !monster) return { finalDamage, extraEffects };

    const realNow = Date.now();
    state.resonanceState = state.resonanceState || {};

    // 1. Caçador das Sombras: Consome Marca com Golpe de Adaga
    if (resonance.id === 'shadow_stalker' && weaponTypeUsed === 'dagger') {
      if (monster._shadowMarkUntil && monster._shadowMarkUntil > realNow) {
        monster._shadowMarkUntil = 0;
        finalDamage = Math.floor(finalDamage * 2.0); // +100% de Dano Crítico Fatal
        monster._bleedTicks = 4;
        monster._bleedDamage = Math.max(10, Math.floor(finalDamage * 0.15));
        extraEffects.push('shadow_crit_bleed');

        if (callbacks.floatText) callbacks.floatText('🗡️ GOLPE FATAL + BLEED! (2.0x)', 'float-jackpot');
        if (callbacks.log) callbacks.log(`🗡️ Sombra Executora! Golpe de Adaga consumiu a Marca: ${finalDamage.toLocaleString()} DANO FATAL e Sangramento aplicado!`, 'rarity-legendary');
      }
    }

    // 2. Sentinela Dracônico: Lança atinge alvo lento com perfuração amplificada
    if (resonance.id === 'dragon_lancer' && weaponTypeUsed === 'spear') {
      if (monster._slowUntil && monster._slowUntil > realNow) {
        finalDamage = Math.floor(finalDamage * 1.35); // +35% de dano perfurante
        extraEffects.push('dragon_pierce');
        if (callbacks.floatText) callbacks.floatText('🔱 EMPALAMENTO (+35%)!', 'float-jackpot');
      }
    }

    // 3. Senhor da Tempestade: Consome Cargas com Dual Swords
    if (resonance.id === 'bladestorm_warlord' && weaponTypeUsed === 'dual') {
      const stacks = state.resonanceState.stormFury || 0;
      if (stacks > 0) {
        state.resonanceState.stormFury = 0;
        const bonusMult = 1 + (stacks * 0.20); // Até +100% dano extra
        finalDamage = Math.floor(finalDamage * bonusMult);
        monster._tempPdefReductionUntil = realNow + 6000; // -25% P.Def
        extraEffects.push('vacuum_wave');

        if (callbacks.floatText) callbacks.floatText(`🌪️ LÂMINA DE VÁCUO (${stacks}x)!`, 'float-jackpot');
        if (callbacks.log) callbacks.log(`🌪️ Onda de Vácuo Cortante liberada (${stacks} cargas): ${finalDamage.toLocaleString()} de Dano e Armadura despedaçada (-25% P.Def)!`, 'rarity-rare');
      }
    }

    // 4. Espreitador Venenoso: Lança detona Toxina de Adaga
    if (resonance.id === 'viper_skirmisher' && weaponTypeUsed === 'spear') {
      const toks = state.resonanceState.viperToxin || 0;
      if (toks > 0) {
        state.resonanceState.viperToxin = 0;
        const toxinMult = 1 + (toks * 0.60); // Até +180% dano
        finalDamage = Math.floor(finalDamage * toxinMult);
        extraEffects.push('viper_detonation');
        if (callbacks.floatText) callbacks.floatText(`💥 DETONAÇÃO TÓXICA (${toks}x)!`, 'float-jackpot');
        if (callbacks.log) callbacks.log(`💥 Toxina detonada pela Lança: ${finalDamage.toLocaleString()} de Dano Hemorrágico!`, 'rarity-legendary');
      }
    }

    // 5. Comandante de Falange: Espada 1H arma Fratura Tática, Lança detona Cleave (+45% BaseSpearDamage)
    if (resonance.id === 'phalanx_warlord') {
      if (weaponTypeUsed === 'sword') {
        state.resonanceState.tacticalFracture = 'ARMED';
        state.resonanceState.state = 'ARMED';
        state.resonanceState.phalanxCleave = true;
        extraEffects.push('tactical_fracture_armed');
        if (callbacks.floatText) callbacks.floatText('⚔ TACTICAL FRACTURE (ARMED)', 'float-epic');
        if (callbacks.log) callbacks.log('⚔ Comandante de Falange: Fratura Tática armada pela Espada! Próximo ataque de Lança desfere Cleave (+45%)!', 'combat');
      } else if (weaponTypeUsed === 'spear') {
        if (state.resonanceState.tacticalFracture === 'ARMED' || state.resonanceState.phalanxCleave) {
          state.resonanceState.tacticalFracture = 'INACTIVE';
          state.resonanceState.state = 'ACTIVE';
          state.resonanceState.phalanxCleave = false;
          const BaseSpearDamage = baseDamage;
          const CleaveDamage = Math.floor(BaseSpearDamage * 1.45);
          finalDamage = CleaveDamage;
          extraEffects.push('phalanx_cleave');
          if (callbacks.floatText) callbacks.floatText('🔱 CLEAVE (+45%)', 'float-jackpot');
          if (callbacks.log) callbacks.log(`🔱 Fratura Tática detonada! Cleave de Lança desferido: ${CleaveDamage.toLocaleString()} (+45%)!`, 'rarity-legendary');
        }
      }
    }

    // 6. Paladino Vingador: Consome Vingança Sagrada com 2H Greatsword
    if (resonance.id === 'avenging_paladin' && (weaponTypeUsed === 'twohand' || weaponTypeUsed === 'ancientsword')) {
      if (state.resonanceState.holyVengeanceUntil && state.resonanceState.holyVengeanceUntil > realNow) {
        state.resonanceState.holyVengeanceUntil = 0;
        finalDamage = Math.floor(finalDamage * 1.5);
        extraEffects.push('holy_penetration');

        if (callbacks.floatText) callbacks.floatText('💥 VINGANÇA PURIFICADORA! (1.5x)', 'float-jackpot');
        if (callbacks.log) callbacks.log(`💥 Vingança Purificadora desferida com a Espada de 2 Mãos: ${finalDamage.toLocaleString()} de Dano devastador!`, 'rarity-legendary');
      }
    }

    // 7. Feiticeiro da Lâmina: Consome Lâmina Arcana
    if (resonance.id === 'spellblade_arcanist' && (weaponTypeUsed === 'sword' || weaponTypeUsed === 'dagger' || weaponTypeUsed === 'blunt')) {
      if (state.resonanceState.arcaneBlade) {
        state.resonanceState.arcaneBlade = false;
        finalDamage = Math.floor(finalDamage * 1.4);
        const mpRestored = Math.max(5, Math.floor((state.maxMp || 100) * 0.10));
        state.mp = Math.min(state.maxMp || 100, (state.mp || 0) + mpRestored);
        extraEffects.push('mana_restored');

        if (callbacks.floatText) callbacks.floatText(`🔮 LÂMINA ARCANA (+${mpRestored} MP)`, 'float-gold');
        if (callbacks.log) callbacks.log(`🔮 Lâmina Arcana atingiu o alvo com dano híbrido (+${mpRestored} MP recuperados)!`, 'heal');
      }
    }

    // 8. Esmagador de Crânios: Espada 2H causa dano dobrado se monstro estiver em Stagger/Break
    if (resonance.id === 'skullbreaker' && (weaponTypeUsed === 'twohand' || weaponTypeUsed === 'ancientsword')) {
      if (monster.isBreak || (monster.staggerCurrent && monster.staggerCurrent <= 0)) {
        finalDamage = Math.floor(finalDamage * 1.6);
        extraEffects.push('skull_crush');
        if (callbacks.floatText) callbacks.floatText('🔨 ESMAGAMENTO TOTAL (+60%)!', 'float-jackpot');
      }
    }

    // 9. Inquisidor de Ferro: Adaga com 100% penetração em alvo desestabilizado
    if (resonance.id === 'iron_inquisitor' && weaponTypeUsed === 'dagger') {
      if (monster._inquisitorStunUntil && monster._inquisitorStunUntil > realNow) {
        finalDamage = Math.floor(finalDamage * 1.5);
        extraEffects.push('iron_execute');
        if (callbacks.floatText) callbacks.floatText('🗡️ PENETRAÇÃO 100%!', 'float-jackpot');
      }
    } else if (resonance.id === 'iron_inquisitor' && weaponTypeUsed === 'blunt') {
      monster._inquisitorStunUntil = realNow + 3000;
    }

    // 10. General Berserker: Amplifica dano de Break
    if (resonance.id === 'dreadnought' && monster.isBreak) {
      finalDamage = Math.floor(finalDamage * 1.25); // Sobe de 2.0x para 2.5x
    }

    // 11. Danseur Fantasma: Acúmulo de dano crítico consecutivo
    if (resonance.id === 'blade_dancer') {
      state.resonanceState.danceCombo = Math.min(10, (state.resonanceState.danceCombo || 0) + 1);
      const critBonus = state.resonanceState.danceCombo * 0.10;
      finalDamage = Math.floor(finalDamage * (1 + critBonus));
    }

    // 12. Monge Elemental: Consome Chi para explosão mágica
    if (resonance.id === 'mystic_brawler' && (weaponTypeUsed === 'fist')) {
      const chi = state.resonanceState.brawlerChi || 0;
      if (chi >= 5) {
        state.resonanceState.brawlerChi = 0;
        finalDamage = Math.floor(finalDamage * 1.7);
        extraEffects.push('chi_burst');
        if (callbacks.floatText) callbacks.floatText('💥 EXPLOSÃO DE CHI (1.7x)!', 'float-jackpot');
      }
    }

    return { finalDamage, extraEffects };
  }
}
