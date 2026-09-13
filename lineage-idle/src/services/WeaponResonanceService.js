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
    desc: 'Habilidades de Arco aplicam [Marca das Sombras]. Golpes de Adaga causam +25% de Dano Crítico Fatal e Sangramento contínuo. Críticos têm 15% de chance de ignorar 20% da P.Def por 4s.',
    weap1: 'bow',
    weap2: 'dagger',
    passives: { critChance: 6, eva: 6 }
  },

  // 2. Arco + Lança
  dragon_lancer: {
    id: 'dragon_lancer',
    name: 'Sentinela Dracônico',
    pairName: 'Arco + Lança',
    icon: '🏹🔱',
    color: '#0284c7',
    desc: 'Disparos de Arco aplicam Lentidão (-15% Atk.Spd no alvo por 5s). Golpes de Lança contra alvos lentos desferem Estocada Perfurante (+20% de Dano e +25% de Dano de Postura/Stagger).',
    weap1: 'bow',
    weap2: 'spear',
    passives: { staggerDmgPct: 15, atkSpd: 5 }
  },

  // 3. Arco + Cajado
  arcane_ranger: {
    id: 'arcane_ranger',
    name: 'Arqueiro Arcano',
    pairName: 'Arco + Cajado',
    icon: '🏹🔮',
    color: '#38bdf8',
    desc: 'Flechas Infundidas: Tiros de arco causam dano híbrido (+15% de dano mágico elemental focado). +12% Cast.Spd e +6% M.Crit.',
    weap1: 'bow',
    weap2: 'staff',
    passives: { castSpd: 12, mCrit: 6, mAtkPct: 8 }
  },

  // 4. Arco + Maça/Blunt
  siege_sentinel: {
    id: 'siege_sentinel',
    name: 'Caçador de Cerco',
    pairName: 'Arco + Maça/Blunt',
    icon: '🏹🔨',
    color: '#d97706',
    desc: 'Destruidor de Armaduras: +15% de dano contra Chefes e Elites. Golpes de Maça causam +25% de Dano de Postura (Stagger) extra no monstro.',
    weap1: 'bow',
    weap2: 'blunt',
    passives: { bossDmgPct: 15, staggerDmgPct: 20 }
  },

  // 5. Arco + Garras/Punhos
  wild_hunter: {
    id: 'wild_hunter',
    name: 'Caçador Feral',
    pairName: 'Arco + Garras/Punhos',
    icon: '🏹🥊',
    color: '#10b981',
    desc: 'Instinto Predador: Tiros de arco aplicam Sangramento focado. Golpes de garra drenam vitalidade curando o herói em 1% do HP máximo por ataque contra alvos sangrando.',
    weap1: 'bow',
    weap2: 'fist',
    passives: { atkSpd: 10, lifeDrain: 5 }
  },

  // 6. Arco + Espada 1H
  agile_skirmisher: {
    id: 'agile_skirmisher',
    name: 'Batedor Ágil',
    pairName: 'Arco + Espada 1H',
    icon: '🏹⚔️',
    color: '#34d399',
    desc: 'Mobilidade Tática: +12% de Velocidade de Ataque (Atk.Spd) e +10 de Evasão permanente durante o combate individual.',
    weap1: 'bow',
    weap2: 'sword',
    passives: { atkSpd: 12, eva: 10 }
  },

  // 7. Arco + Espada 2H
  dragon_slayer: {
    id: 'dragon_slayer',
    name: 'Atirador Pesado',
    pairName: 'Arco + Espada 2H',
    icon: '🏹🗡️',
    color: '#b91c1c',
    desc: 'Mira Focada: Tiros de arco preparam o monstro (+15% Dano Crítico). Golpes de Espada 2H desferem impacto pesado ignorando 20% da P.Def do alvo.',
    weap1: 'bow',
    weap2: ['twohand', 'ancientsword'],
    passives: { critDmgPct: 15, pAtkPct: 8 }
  },

  // 8. Arco + Dual Swords
  storm_ranger: {
    id: 'storm_ranger',
    name: 'Tempestade de Flechas',
    pairName: 'Arco + Dual Swords',
    icon: '🏹⚔️',
    color: '#06b6d4',
    desc: 'Rajada Rápida: Cadência acelerada entre disparos e lâminas duplas concede +15% de Velocidade de Ataque (Atk.Spd) e +6% de Chance Crítica.',
    weap1: 'bow',
    weap2: 'dual',
    passives: { atkSpd: 15, critChance: 6 }
  },

  // 9. Lança + Adaga
  viper_skirmisher: {
    id: 'viper_skirmisher',
    name: 'Espreitador Venenoso',
    pairName: 'Lança + Adaga',
    icon: '🔱🗡️',
    color: '#84cc16',
    desc: 'Toxina Paralisante: Adaga empilha Toxina no alvo (-5% Atk.Spd até 3x). O golpe de Lança detona as toxinas causando Estocada Hemorrágica (+10% de dano por carga, até +30%).',
    weap1: 'spear',
    weap2: 'dagger',
    passives: { atkSpd: 8, critChance: 6 }
  },

  // 10. Lança + Espada 1H
  phalanx_warlord: {
    id: 'phalanx_warlord',
    name: 'Comandante de Falange',
    pairName: 'Lança + Espada 1H',
    icon: '🔱⚔️',
    color: '#eab308',
    desc: 'Postura de Falange: +20% P.Def. Espada aplica Fratura Tática, garantindo que o próximo ataque focado de Lança desfira uma Estocada Perfurante com +45% de dano.',
    description: 'Postura de Falange: +20% P.Def. Espada aplica Fratura Tática, garantindo que o próximo ataque focado de Lança desfira uma Estocada Perfurante com +45% de dano.',
    weap1: 'spear',
    weap2: 'sword',
    requirements: ['spear', 'sword'],
    activationRule: 'Equipar Lança e Espada 1H nos slots de armamento',
    passives: { pDefPct: 20, pAtkPct: 8 },
    passiveEffects: { pDefPct: 20, pAtkPct: 8 },
    triggerEffects: [
      { trigger: 'sword_hit', effect: 'ARM_TACTICAL_FRACTURE', description: 'Arma Fratura Tática' },
      { trigger: 'spear_hit', effect: 'CLEAVE_BONUS_45', description: 'Estocada tática focada com +45% de dano (+45% BaseSpearDamage)' }
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
    desc: 'Fúria da Tempestade: Golpes de Lança acumulam ímpeto (até 3 cargas). Habilidades de Dual Swords consomem as cargas desferindo corte focado (+8% dano/carga, até +24%, e reduz 10% da P.Def do monstro). +15% Stagger passivo.',
    weap1: 'spear',
    weap2: 'dual',
    passives: { staggerDmgPct: 15, pAtkPct: 8 }
  },

  // 12. Lança + Maça/Blunt
  titan_colossus: {
    id: 'titan_colossus',
    name: 'Colosso de Titã',
    pairName: 'Lança + Maça/Blunt',
    icon: '🔱🔨',
    color: '#f97316',
    desc: 'Impacto Sísmico: Maça desestabiliza a armadura (-10% P.Atk do monstro). Habilidades de lança focam o impacto (+20% postura) e aumentam a duração do Stagger em +1.5s.',
    weap1: 'spear',
    weap2: 'blunt',
    passives: { staggerDmgPct: 20, pDefPct: 8 }
  },

  // 13. Lança + Espada 2H
  dreadnought: {
    id: 'dreadnought',
    name: 'General Berserker',
    pairName: 'Lança + Espada 2H',
    icon: '🔱🗡️',
    color: '#dc2626',
    desc: 'Golpe Titânico: +12% de P.Atk e +15% de Dano de Postura. Durante a janela de BREAK do monstro, desfere +15% de Dano Adicional focado.',
    weap1: 'spear',
    weap2: ['twohand', 'ancientsword'],
    passives: { pAtkPct: 12, staggerDmgPct: 15 }
  },

  // 14. Lança + Cajado
  storm_arbiter: {
    id: 'storm_arbiter',
    name: 'Árbitro da Tempestade',
    pairName: 'Lança + Cajado',
    icon: '🔱🔮',
    color: '#6366f1',
    desc: 'Canalização Elemental: A lança canaliza feitiços concentrados no alvo (+15% de dano mágico elemental e +15% de Cast.Spd).',
    weap1: 'spear',
    weap2: 'staff',
    passives: { castSpd: 15, mAtkPct: 10 }
  },

  // 15. Lança + Garras/Punhos
  asura_striker: {
    id: 'asura_striker',
    name: 'Mestre Monástico',
    pairName: 'Lança + Garras/Punhos',
    icon: '🔱🥊',
    color: '#14b8a6',
    desc: 'Fluxo Marcial: Golpes de Punho aceleram o combate (+2% Atk.Spd até +12%). O golpe de Lança consome o fluxo para desferir estocada focada que ignora 18% da P.Def.',
    weap1: 'spear',
    weap2: 'fist',
    passives: { atkSpd: 10, pAtkPct: 8 }
  },

  // 16. Adaga + Espada 1H
  shadow_duelist: {
    id: 'shadow_duelist',
    name: 'Duelista das Sombras',
    pairName: 'Adaga + Espada 1H',
    icon: '🗡️⚔️',
    color: '#ec4899',
    desc: 'Dança de Lâminas: +15% Atk.Spd e +8% Chance Crítica. Golpes de adaga abrem a guarda do monstro com 20% de chance de reduzir em 0.5s o cooldown da skill em recarga.',
    weap1: 'dagger',
    weap2: 'sword',
    passives: { atkSpd: 15, critChance: 8 }
  },

  // 17. Adaga + Maça/Blunt
  iron_inquisitor: {
    id: 'iron_inquisitor',
    name: 'Inquisidor de Ferro',
    pairName: 'Adaga + Maça/Blunt',
    icon: '🗡️🔨',
    color: '#78716c',
    desc: 'Ponto Vulnerável: Golpes de Maça desestabilizam o monstro por 3s. Golpes de Adaga desferidos durante a desestabilização ignoram 20% da P.Def e causam +18% de dano focado.',
    weap1: 'dagger',
    weap2: 'blunt',
    passives: { critDmgPct: 12, staggerDmgPct: 12 }
  },

  // 18. Adaga + Garras/Punhos
  ghost_phantom: {
    id: 'ghost_phantom',
    name: 'Fantasma de Asura',
    pairName: 'Adaga + Garras/Punhos',
    icon: '🗡️🥊',
    color: '#8b5cf6',
    desc: 'Dilaceração Sombria: Críticos de garra desorientam o monstro. Golpes de adaga contra o alvo aceleram o Sangramento (+25% de dano hemorrágico focado) e concedem +12% Atk.Spd.',
    weap1: 'dagger',
    weap2: 'fist',
    passives: { atkSpd: 12, critChance: 8 }
  },

  // 19. Adaga + Dual Swords
  blade_dancer: {
    id: 'blade_dancer',
    name: 'Danseur Fantasma',
    pairName: 'Adaga + Dual Swords',
    icon: '🗡️⚔️',
    color: '#f43f5e',
    desc: 'Dança das Sombras: Cada ataque consecutivo no alvo aumenta o dano crítico em +3% (acumula até +15%). +10 de Evasão e +8% de Chance de Crítico.',
    weap1: 'dagger',
    weap2: 'dual',
    passives: { eva: 10, critChance: 8 }
  },

  // 20. Espada 2H + 1H/Escudo
  avenging_paladin: {
    id: 'avenging_paladin',
    name: 'Paladino Vingador',
    pairName: 'Espada 2H + 1H/Escudo',
    icon: '🛡️⚔️',
    color: '#fbbf24',
    desc: 'Retribuição Sagrada: Golpes de Escudo preparam Retribuição (+12% P.Def). O próximo golpe de Espada 2H desfere Golpe Justiceiro (+20% de Dano focado e +15% de Dano de Postura).',
    weap1: 'sword',
    weap2: ['twohand', 'ancientsword'],
    reqShield: true,
    passives: { pDefPct: 12, staggerDmgPct: 15 }
  },

  // 21. Espada 2H + Maça/Blunt
  skullbreaker: {
    id: 'skullbreaker',
    name: 'Esmagador de Crânios',
    pairName: 'Espada 2H + Maça/Blunt',
    icon: '🗡️🔨',
    color: '#991b1b',
    desc: 'Quebra-Armadura: Maça desgasta a guarda do alvo (+25% Stagger). Espada de 2 Mãos desfere +20% de dano pesado contra monstros em estado de BREAK.',
    weap1: ['twohand', 'ancientsword'],
    weap2: 'blunt',
    passives: { staggerDmgPct: 25, pAtkPct: 10 }
  },

  // 22. Cajado + Espada/Lâmina
  spellblade_arcanist: {
    id: 'spellblade_arcanist',
    name: 'Feiticeiro da Lâmina',
    pairName: 'Cajado + Espada/Lâmina',
    icon: '🔮🗡️',
    color: '#c084fc',
    desc: 'Lâmina Arcana: Magias acumulam Energia Rúnica. Golpes de lâmina causam dano híbrido (+15% de dano focado) e restauram 3% do MP máximo, reduzindo em 1s o tempo de recarga da habilidade mágica.',
    weap1: 'staff',
    weap2: ['sword', 'dagger', 'blunt'],
    passives: { castSpd: 12, mAtkPct: 8 }
  },

  // 23. Cajado + Maça/Blunt
  battle_hierophant: {
    id: 'battle_hierophant',
    name: 'Hierofante de Batalha',
    pairName: 'Cajado + Maça/Blunt',
    icon: '🔮🔨',
    color: '#fde047',
    desc: 'Prece de Guerra: Eficiência de cura e sustentação aumentada em +15%. Golpes de maça infundem poder sagrado (+12% de dano mágico sagrado no alvo e +12% M.Def).',
    weap1: 'staff',
    weap2: 'blunt',
    passives: { healBoostPct: 15, mDefPct: 12 }
  },

  // 24. Cajado + Garras/Punhos
  mystic_brawler: {
    id: 'mystic_brawler',
    name: 'Monge Elemental',
    pairName: 'Cajado + Garras/Punhos',
    icon: '🔮🥊',
    color: '#a855f7',
    desc: 'Harmonia Mística: Golpes de punho recuperam 1% MP e reduzem a M.Def do monstro em 10%. Com 5 cargas de punho, a próxima magia ofensiva desfere +18% de dano focado.',
    weap1: 'staff',
    weap2: 'fist',
    passives: { atkSpd: 10, castSpd: 12 }
  },

  // 25. Garras + Espada/Dual
  soul_monk: {
    id: 'soul_monk',
    name: 'Monge Espiritual',
    pairName: 'Garras + Espada/Dual',
    icon: '🥊⚔️',
    color: '#14b8a6',
    desc: 'Espírito Guerreiro: Roubo de vida moderado (+4% Vampiric Rage) e +12% Velocidade de Ataque permanente em combate individual.',
    weap1: 'fist',
    weap2: ['sword', 'dual'],
    passives: { lifeDrain: 4, atkSpd: 12 }
  },

  // 26. Cajado + Escudo
  grand_archon: {
    id: 'grand_archon',
    name: 'Arquimago Guardião',
    pairName: 'Cajado + Escudo',
    icon: '🔮🛡️',
    color: '#60a5fa',
    desc: 'Bastião Arcano: Barreira protetora que absorve 10% do dano recebido do monstro e concede +15% de Velocidade de Conjuração (Cast.Spd).',
    weap1: 'staff',
    weap2: 'any',
    reqShield: true,
    passives: { castSpd: 15, damageReductionPct: 10 }
  },

  // 27. Espada + Espada (Sinfonia das Lâminas)
  blade_symphony: {
    id: 'blade_symphony',
    name: 'Sinfonia das Lâminas',
    pairName: 'Espada + Espada',
    icon: '⚔️⚔️',
    color: '#3b82f6',
    desc: 'Sinfonia das Lâminas: Cadência sincronizada em alvo único: +12% Velocidade de Ataque (Atk.Spd) e +8% de Chance Crítica.',
    weap1: 'sword',
    weap2: 'sword',
    passives: { atkSpd: 12, critChance: 8 }
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
        if (callbacks.log) callbacks.log('🎯 Caçador das Sombras: Alvo marcado! Próximo golpe de Adaga causará +25% de Dano Crítico Fatal e Sangramento!', 'combat');
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
        state.resonanceState.stormFury = Math.min(3, (state.resonanceState.stormFury || 0) + 1);
        const stacks = state.resonanceState.stormFury;
        if (callbacks.floatText) callbacks.floatText(`⚡ FÚRIA (${stacks}/3)`, 'float-gold');
        if (callbacks.log) callbacks.log(`⚡ Fúria da Tempestade acumulada (${stacks}/3 cargas)!`, 'combat');
      }
    }

    // 4. Paladino Vingador: Escudo gera Vingança Sagrada
    if (resonance.id === 'avenging_paladin') {
      if (skillDef.requiredShield || skillNameLower.includes('shield') || skillNameLower.includes('stun')) {
        state.resonanceState.holyVengeanceUntil = realNow + 7000;
        if (callbacks.floatText) callbacks.floatText('🛡️ VINGANÇA SAGRADA!', 'float-jackpot');
        if (callbacks.log) callbacks.log('🛡️ Vingança Sagrada ativada! O próximo ataque com a Espada de 2 Mãos ignorará 20% da P.Def do alvo (+20% Dano)!', 'rarity-legendary');
      }
    }

    // 5. Feiticeiro da Lâmina: Magias acumulam Lâmina Arcana e aceleram recarga
    if (resonance.id === 'spellblade_arcanist') {
      if (reqWeapon === 'staff' || skillDef.effect === 'spell' || skillNameLower.includes('hydro') || skillNameLower.includes('prominence') || skillNameLower.includes('hurricane') || skillNameLower.includes('flare')) {
        state.resonanceState.arcaneBlade = true;
        if (Math.random() < 0.25 && state._cds) {
          for (const k of Object.keys(state._cds)) {
            if (state._cds[k] > realNow) {
              state._cds[k] = Math.max(realNow, state._cds[k] - 1000);
            }
          }
          if (callbacks.floatText) callbacks.floatText('⚡ ACELERAÇÃO ARCANA (-1s CD)', 'float-jackpot');
          if (callbacks.log) callbacks.log('⚡ Feiticeiro da Lâmina: Pulso Arcano reduziu o tempo de recarga de feitiços em 1s!', 'rarity-legendary');
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
        if (callbacks.log) callbacks.log('⚔ Fratura Tática armada! Próximo ataque de Lança causará Estocada Tática com +45% de dano!', 'combat');
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
        finalDamage = Math.floor(finalDamage * 1.25); // +25% de Dano Crítico Fatal
        monster._bleedTicks = 4;
        monster._bleedDamage = Math.max(10, Math.floor(finalDamage * 0.08));
        extraEffects.push('shadow_crit_bleed');

        if (callbacks.floatText) callbacks.floatText('🗡️ GOLPE FATAL + BLEED! (+25%)', 'float-jackpot');
        if (callbacks.log) callbacks.log(`🗡️ Sombra Executora! Golpe de Adaga consumiu a Marca: ${finalDamage.toLocaleString()} DANO FATAL (+25%) e Sangramento aplicado!`, 'rarity-legendary');
      }
    }

    // 2. Sentinela Dracônico: Lança atinge alvo lento com perfuração amplificada
    if (resonance.id === 'dragon_lancer' && weaponTypeUsed === 'spear') {
      if (monster._slowUntil && monster._slowUntil > realNow) {
        finalDamage = Math.floor(finalDamage * 1.20); // +20% de dano perfurante
        extraEffects.push('dragon_pierce');
        if (callbacks.floatText) callbacks.floatText('🔱 EMPALAMENTO (+20%)!', 'float-jackpot');
      }
    }

    // 3. Senhor da Tempestade: Consome Cargas com Dual Swords
    if (resonance.id === 'bladestorm_warlord' && weaponTypeUsed === 'dual') {
      const stacks = state.resonanceState.stormFury || 0;
      if (stacks > 0) {
        state.resonanceState.stormFury = 0;
        const bonusMult = 1 + (stacks * 0.08); // Até +24% dano extra
        finalDamage = Math.floor(finalDamage * bonusMult);
        monster._tempPdefReductionUntil = realNow + 5000; // -10% P.Def
        extraEffects.push('vacuum_wave');

        if (callbacks.floatText) callbacks.floatText(`🌪️ CORTE DE VÁCUO (+${stacks * 8}%)!`, 'float-jackpot');
        if (callbacks.log) callbacks.log(`🌪️ Golpe Cortante liberado (${stacks} cargas): ${finalDamage.toLocaleString()} de Dano e Armadura desgastada (-10% P.Def)!`, 'rarity-rare');
      }
    }

    // 4. Espreitador Venenoso: Lança detona Toxina de Adaga
    if (resonance.id === 'viper_skirmisher' && weaponTypeUsed === 'spear') {
      const toks = state.resonanceState.viperToxin || 0;
      if (toks > 0) {
        state.resonanceState.viperToxin = 0;
        const toxinMult = 1 + (toks * 0.10); // Até +30% dano
        finalDamage = Math.floor(finalDamage * toxinMult);
        extraEffects.push('viper_detonation');
        if (callbacks.floatText) callbacks.floatText(`💥 ESTOCADA TÓXICA (+${toks * 10}%)!`, 'float-jackpot');
        if (callbacks.log) callbacks.log(`💥 Toxina detonada pela Lança: ${finalDamage.toLocaleString()} de Dano Hemorrágico (+${toks * 10}%)!`, 'rarity-legendary');
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
        if (callbacks.log) callbacks.log('⚔ Comandante de Falange: Fratura Tática armada pela Espada! Próximo ataque de Lança desfere Estocada Tática (+45%)!', 'combat');
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
          if (callbacks.log) callbacks.log(`🔱 Fratura Tática detonada! Estocada de Lança desferida: ${CleaveDamage.toLocaleString()} (+45%)!`, 'rarity-legendary');
        }
      }
    }

    // 6. Paladino Vingador: Consome Vingança Sagrada com 2H Greatsword
    if (resonance.id === 'avenging_paladin' && (weaponTypeUsed === 'twohand' || weaponTypeUsed === 'ancientsword')) {
      if (state.resonanceState.holyVengeanceUntil && state.resonanceState.holyVengeanceUntil > realNow) {
        state.resonanceState.holyVengeanceUntil = 0;
        finalDamage = Math.floor(finalDamage * 1.20);
        extraEffects.push('holy_penetration');

        if (callbacks.floatText) callbacks.floatText('💥 RETRIBUIÇÃO SAGRADA! (+20%)', 'float-jackpot');
        if (callbacks.log) callbacks.log(`💥 Retribuição Sagrada desferida com a Espada de 2 Mãos: ${finalDamage.toLocaleString()} de Dano focado!`, 'rarity-legendary');
      }
    }

    // 7. Feiticeiro da Lâmina: Consome Lâmina Arcana
    if (resonance.id === 'spellblade_arcanist' && (weaponTypeUsed === 'sword' || weaponTypeUsed === 'dagger' || weaponTypeUsed === 'blunt')) {
      if (state.resonanceState.arcaneBlade) {
        state.resonanceState.arcaneBlade = false;
        finalDamage = Math.floor(finalDamage * 1.15);
        const mpRestored = Math.max(5, Math.floor((state.maxMp || 100) * 0.03));
        state.mp = Math.min(state.maxMp || 100, (state.mp || 0) + mpRestored);
        extraEffects.push('mana_restored');

        if (callbacks.floatText) callbacks.floatText(`🔮 LÂMINA ARCANA (+${mpRestored} MP)`, 'float-gold');
        if (callbacks.log) callbacks.log(`🔮 Lâmina Arcana atingiu o alvo com dano híbrido (+${mpRestored} MP recuperados)!`, 'heal');
      }
    }

    // 8. Esmagador de Crânios: Espada 2H causa dano aumentado se monstro estiver em Stagger/Break
    if (resonance.id === 'skullbreaker' && (weaponTypeUsed === 'twohand' || weaponTypeUsed === 'ancientsword')) {
      if (monster.isBreak || (monster.staggerCurrent && monster.staggerCurrent <= 0)) {
        finalDamage = Math.floor(finalDamage * 1.20);
        extraEffects.push('skull_crush');
        if (callbacks.floatText) callbacks.floatText('🔨 ESMAGAMENTO (+20%)!', 'float-jackpot');
      }
    }

    // 9. Inquisidor de Ferro: Adaga com penetração em alvo desestabilizado
    if (resonance.id === 'iron_inquisitor' && weaponTypeUsed === 'dagger') {
      if (monster._inquisitorStunUntil && monster._inquisitorStunUntil > realNow) {
        finalDamage = Math.floor(finalDamage * 1.18);
        extraEffects.push('iron_execute');
        if (callbacks.floatText) callbacks.floatText('🗡️ GOLPE PERFURANTE (+18%)!', 'float-jackpot');
      }
    } else if (resonance.id === 'iron_inquisitor' && weaponTypeUsed === 'blunt') {
      monster._inquisitorStunUntil = realNow + 3000;
    }

    // 10. General Berserker: Amplifica dano de Break
    if (resonance.id === 'dreadnought' && monster.isBreak) {
      finalDamage = Math.floor(finalDamage * 1.15);
    }

    // 11. Danseur Fantasma: Acúmulo de dano crítico consecutivo
    if (resonance.id === 'blade_dancer') {
      state.resonanceState.danceCombo = Math.min(5, (state.resonanceState.danceCombo || 0) + 1);
      const critBonus = state.resonanceState.danceCombo * 0.03;
      finalDamage = Math.floor(finalDamage * (1 + critBonus));
    }

    // 12. Monge Elemental: Consome Chi para disparo focado
    if (resonance.id === 'mystic_brawler' && (weaponTypeUsed === 'fist')) {
      const chi = state.resonanceState.brawlerChi || 0;
      if (chi >= 5) {
        state.resonanceState.brawlerChi = 0;
        finalDamage = Math.floor(finalDamage * 1.18);
        extraEffects.push('chi_burst');
        if (callbacks.floatText) callbacks.floatText('💥 DISPARO DE CHI (+18%)!', 'float-jackpot');
      }
    }

    return { finalDamage, extraEffects };
  }
}
