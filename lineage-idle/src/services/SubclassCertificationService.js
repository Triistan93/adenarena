/**
 * SubclassCertificationService.js — Sistema Canônico de Certificação de Subclasses (MasterWork L2)
 *
 * Responsável por:
 * 1. Mapeamento de todas as classes para 7 Arquétipos Canônicos (Warrior, Knight, Rogue, Wizard, Summoner, Healer, Enchanter).
 * 2. Gerenciamento dos 4 Marcos de Certificação por Subclasse (Lvs. 65, 70, 75 e 80), totalizando até 12 Certificados.
 * 3. Cálculo e consolidação de bônus passivos aplicados diretamente à Classe Principal e combate.
 * 4. Atribuição de pontuação de Combat Power (CP) por certificações ativas.
 * 5. Gerenciamento e ativação de Transformações Divinas e seus auras de atributos.
 */

import { D } from '../core/GameConfig.js';
import { resolveCanonicalClassId } from '../data/classes/class_aliases.js';

export const SUBCLASS_ARCHETYPES = {
  WARRIOR: 'warrior',
  KNIGHT: 'knight',
  ROGUE: 'rogue',
  WIZARD: 'wizard',
  SUMMONER: 'summoner',
  HEALER: 'healer',
  ENCHANTER: 'enchanter'
};

/** Definição detalhada das habilidades emergentes (Lv 65 e Lv 70) */
export const EMERGENT_ABILITIES = {
  emergent_patk: {
    id: 'emergent_patk',
    name: 'Sub-Class: Physical Attack',
    icon: '⚔️',
    desc: '+35 P.Atk & +2.5% Ataque Físico permanente',
    stats: { pAtk: 35, pAtkPercent: 0.025 },
    cp: 1500
  },
  emergent_pdef: {
    id: 'emergent_pdef',
    name: 'Sub-Class: Physical Defence',
    icon: '🛡️',
    desc: '+30 P.Def & +2.5% Defesa Física permanente',
    stats: { pDef: 30, pDefPercent: 0.025 },
    cp: 1500
  },
  emergent_matk: {
    id: 'emergent_matk',
    name: 'Sub-Class: Magical Attack',
    icon: '🔮',
    desc: '+45 M.Atk & +3.0% Ataque Mágico permanente',
    stats: { mAtk: 45, mAtkPercent: 0.03 },
    cp: 1500
  },
  emergent_mdef: {
    id: 'emergent_mdef',
    name: 'Sub-Class: Magical Defence',
    icon: '✨',
    desc: '+30 M.Def & +3.0% Defesa Mágica permanente',
    stats: { mDef: 30, mDefPercent: 0.03 },
    cp: 1500
  },
  emergent_crit: {
    id: 'emergent_crit',
    name: 'Sub-Class: Critical Rate',
    icon: '💥',
    desc: '+15 Taxa de Crítico Físico & Mágico',
    stats: { critRate: 15 },
    cp: 1500
  },
  emergent_cast: {
    id: 'emergent_cast',
    name: 'Sub-Class: Casting & Atk Speed',
    icon: '⚡',
    desc: '+25 Casting Speed & +15 Atk.Spd permanente',
    stats: { castSpd: 25, atkSpd: 15 },
    cp: 1500
  }
};

/** Definição das Habilidades Mestras por Arquétipo (Lv 75) */
export const MASTER_ABILITIES_BY_ARCHETYPE = {
  [SUBCLASS_ARCHETYPES.WARRIOR]: [
    {
      id: 'master_haste',
      name: 'Chance Haste',
      icon: '⚡',
      badge: 'Proc Atk.Spd',
      desc: 'Ao desferir ataques: 6% de chance de ativar +32% Atk.Spd por 10s',
      stats: { hasteProc: true, atkSpdPercent: 0.05 },
      cp: 3800
    },
    {
      id: 'master_boost_cp',
      name: 'Boost CP',
      icon: '🛡️',
      badge: 'Max CP',
      desc: '+18% Max CP & +35% Taxa de Regeneração de CP',
      stats: { maxCpPercent: 0.18, regenCpPercent: 0.35 },
      cp: 3500
    }
  ],
  [SUBCLASS_ARCHETYPES.KNIGHT]: [
    {
      id: 'master_defense',
      name: 'Counter Defense',
      icon: '🛡️',
      badge: 'Proc Def',
      desc: 'Ao receber dano: 6% de chance de ativar +25% P.Def & +25% M.Def por 10s',
      stats: { defenceProc: true, pDefPercent: 0.04, mDefPercent: 0.04 },
      cp: 3800
    },
    {
      id: 'master_boost_hp',
      name: 'Boost HP',
      icon: '❤️',
      badge: 'Max HP',
      desc: '+14% Max HP & +25% Taxa de Regeneração de HP',
      stats: { maxHpPercent: 0.14, regenHpPercent: 0.25 },
      cp: 3500
    }
  ],
  [SUBCLASS_ARCHETYPES.ROGUE]: [
    {
      id: 'master_critical',
      name: 'Chance Critical',
      icon: '💥',
      badge: 'Proc Crit',
      desc: 'Ao atacar: 6% de chance de ativar +35% Critical Rate & +10% Crit Dmg por 10s',
      stats: { critProc: true, critRate: 20 },
      cp: 3800
    },
    {
      id: 'master_evasion',
      name: 'Evasion & Agility',
      icon: '👟',
      badge: 'Esquiva',
      desc: '+8 Esquiva física & +6% Chance de Esquivar de Habilidades',
      stats: { evasion: 8, skillEvasionPercent: 0.06 },
      cp: 3500
    },
    {
      id: 'master_long_shot',
      name: 'Long Shot',
      icon: '🏹',
      badge: 'Alcance',
      desc: '+150 Alcance de Ataque & +6% Dano de Ataque Físico',
      stats: { pAtkPercent: 0.06, range: 150 },
      cp: 3500
    }
  ],
  [SUBCLASS_ARCHETYPES.WIZARD]: [
    {
      id: 'master_anti_magic',
      name: 'Anti-Magic & Mana Gain',
      icon: '🔮',
      badge: 'M.Def & MP',
      desc: '+10% M.Def permanente & +25 Resistência Elemental Mágica',
      stats: { mDefPercent: 0.10, elementalResist: 25 },
      cp: 3500
    },
    {
      id: 'master_boost_mp',
      name: 'Boost MP & Acumen',
      icon: '💙',
      badge: 'Max MP',
      desc: '+16% Max MP, +30 Casting Speed & +25% Regeneração de MP',
      stats: { maxMpPercent: 0.16, castSpd: 30, regenMpPercent: 0.25 },
      cp: 3500
    }
  ],
  [SUBCLASS_ARCHETYPES.SUMMONER]: [
    {
      id: 'master_spirit',
      name: 'Counter Spirit',
      icon: '👻',
      badge: 'Proc All Stats',
      desc: 'Ao receber dano: 5% de chance de ativar +10% P.Atk, +10% M.Atk e +10% Atk.Spd por 10s',
      stats: { spiritProc: true, pAtkPercent: 0.03, mAtkPercent: 0.03 },
      cp: 3800
    },
    {
      id: 'master_boost_hp_mp',
      name: 'Boost HP & MP',
      icon: '💖',
      badge: 'HP & MP',
      desc: '+10% Max HP & +12% Max MP permanente',
      stats: { maxHpPercent: 0.10, maxMpPercent: 0.12 },
      cp: 3500
    }
  ],
  [SUBCLASS_ARCHETYPES.HEALER]: [
    {
      id: 'master_prayer',
      name: 'Prayer & Divine Grace',
      icon: '🕊️',
      badge: 'Cura Recebida',
      desc: '+18% Eficiência de Cura Recebida & +6% Max HP',
      stats: { healReceivePercent: 0.18, maxHpPercent: 0.06 },
      cp: 3500
    },
    {
      id: 'master_resist_trait',
      name: 'Resist Trait',
      icon: '🛡️',
      badge: 'Resistência Debuff',
      desc: '+18% Resistência a Stun, Paralyze, Silence, Bleed e Debuffs',
      stats: { debuffResistPercent: 0.18, mDefPercent: 0.05 },
      cp: 3500
    }
  ],
  [SUBCLASS_ARCHETYPES.ENCHANTER]: [
    {
      id: 'master_barrier',
      name: 'Barrier (Celestial Shield)',
      icon: '🌟',
      badge: 'Proc Imunidade',
      desc: 'Ao receber dano: 4% de chance de ativar Escudo Celestial (Invulnerabilidade) por 5s',
      stats: { celestialProc: true, pDefPercent: 0.03, mDefPercent: 0.03 },
      cp: 4200
    },
    {
      id: 'master_boost_mana',
      name: 'Master Mana Clarity',
      icon: '📜',
      badge: 'Eficiência MP',
      desc: '-10% Custo de MP de todas as habilidades & +10% Max MP',
      stats: { mpCostReduction: 0.10, maxMpPercent: 0.10 },
      cp: 3500
    }
  ]
};

/** Definição das Transformações Divinas por Arquétipo (Lv 80) */
export const DIVINE_TRANSFORMATIONS = {
  [SUBCLASS_ARCHETYPES.WARRIOR]: {
    id: 'divine_warrior',
    name: 'Transform: Divine Warrior',
    icon: '⚔️',
    title: 'Guerreiro Sagrado de Einhasad',
    desc: 'Desbloqueia a Forma Divine Warrior (War Cry +25% P.Atk, Sonic Blaster) e concede Aura permanente de +8% P.Atk e +15 Crit Rate.',
    passiveStats: { pAtkPercent: 0.08, critRate: 15 },
    transformationBuffs: { pAtkPercent: 0.25, critDmgPercent: 0.15 },
    cp: 6500
  },
  [SUBCLASS_ARCHETYPES.KNIGHT]: {
    id: 'divine_knight',
    name: 'Transform: Divine Knight',
    icon: '🛡️',
    title: 'Bastião Sagrado de Aden',
    desc: 'Desbloqueia a Forma Divine Knight (Ultimate Defence +100% Def, Hate Aura) e concede Aura permanente de +8% P.Def, +8% M.Def e +5% Max HP.',
    passiveStats: { pDefPercent: 0.08, mDefPercent: 0.08, maxHpPercent: 0.05 },
    transformationBuffs: { pDefPercent: 0.50, mDefPercent: 0.50 },
    cp: 6500
  },
  [SUBCLASS_ARCHETYPES.ROGUE]: {
    id: 'divine_rogue',
    name: 'Transform: Divine Rogue',
    icon: '🗡️',
    title: 'Sombra Sagrada dos Ventos',
    desc: 'Desbloqueia a Forma Divine Rogue (Stun Shot, Double Shot, Agility) e concede Aura permanente de +30 Crit Rate e +6 Esquiva.',
    passiveStats: { critRate: 30, evasion: 6 },
    transformationBuffs: { critRate: 40, evasion: 8, speedPercent: 0.10 },
    cp: 6500
  },
  [SUBCLASS_ARCHETYPES.WIZARD]: {
    id: 'divine_wizard',
    name: 'Transform: Divine Wizard',
    icon: '🔮',
    title: 'Arquimago Divino do Éter',
    desc: 'Desbloqueia a Forma Divine Wizard (Divine Flare, Divine Strike, Sleep AoE) e concede Aura permanente de +10% M.Atk e +30 Casting Speed.',
    passiveStats: { mAtkPercent: 0.10, castSpd: 30 },
    transformationBuffs: { mAtkPercent: 0.30, castSpd: 60 },
    cp: 6500
  },
  [SUBCLASS_ARCHETYPES.SUMMONER]: {
    id: 'divine_summoner',
    name: 'Transform: Divine Summoner',
    icon: '🦄',
    title: 'Invocador Místico Celestial',
    desc: 'Desbloqueia a Forma Divine Summoner (Transfer Pain, Final Servitor) e concede Aura permanente de +8% Max HP e +5% Vampiric Lifesteal.',
    passiveStats: { maxHpPercent: 0.08, lifestealPercent: 0.05 },
    transformationBuffs: { maxHpPercent: 0.20, lifestealPercent: 0.10 },
    cp: 6500
  },
  [SUBCLASS_ARCHETYPES.HEALER]: {
    id: 'divine_healer',
    name: 'Transform: Divine Healer',
    icon: '🕊️',
    title: 'Sacerdote da Luz Divina',
    desc: 'Desbloqueia a Forma Divine Healer (Major Heal, Cleanse, Ressurreição 70%) e concede Aura permanente de +10% M.Def e +12% Cura Recebida.',
    passiveStats: { mDefPercent: 0.10, healReceivePercent: 0.12 },
    transformationBuffs: { mDefPercent: 0.25, regenHpPercent: 0.50 },
    cp: 6500
  },
  [SUBCLASS_ARCHETYPES.ENCHANTER]: {
    id: 'divine_enchanter',
    name: 'Transform: Divine Enchanter',
    icon: '📜',
    title: 'Arauto dos Cânticos Antigos',
    desc: 'Desbloqueia a Forma Divine Enchanter (Chant of Victory +10% All Stats) e concede Aura permanente de +5% All Stats e +8% Speed.',
    passiveStats: { pAtkPercent: 0.05, mAtkPercent: 0.05, pDefPercent: 0.05, mDefPercent: 0.05, speedPercent: 0.08 },
    transformationBuffs: { pAtkPercent: 0.15, mAtkPercent: 0.15, speedPercent: 0.15, castSpd: 40 },
    cp: 6500
  }
};

export class SubclassCertificationService {
  /**
   * Mapeia qualquer classe (ou alias) para seu Arquétipo canônico
   * @param {string} classId
   * @returns {string} Subclass Archetype
   */
  static getArchetypeForClass(classId) {
    if (!classId) return SUBCLASS_ARCHETYPES.WARRIOR;
    const canon = resolveCanonicalClassId(classId).toLowerCase();

    // Knights / Tanks
    if (
      canon.includes('knight') || canon.includes('paladin') || canon.includes('darkavenger') ||
      canon.includes('phoenix') || canon.includes('hellknight') || canon.includes('temple') ||
      canon.includes('evastemplar') || canon.includes('shillientemplar') || canon.includes('death') ||
      canon.includes('templar')
    ) {
      return SUBCLASS_ARCHETYPES.KNIGHT;
    }

    // Rogues / Archers / Daggers / Assassins
    if (
      canon.includes('rogue') || canon.includes('treasure') || canon.includes('adventurer') ||
      canon.includes('hawkeye') || canon.includes('sagittarius') || canon.includes('scout') ||
      canon.includes('plainswalker') || canon.includes('windrider') || canon.includes('silverranger') ||
      canon.includes('moonlight') || canon.includes('assassin') || canon.includes('abysswalker') ||
      canon.includes('ghosthunter') || canon.includes('phantomranger') || canon.includes('ghostsentinel') ||
      canon.includes('arbalester') || canon.includes('trickster') || canon.includes('gunner') ||
      canon.includes('sharpshooter') || canon.includes('sniper') || canon.includes('stormblaster') ||
      canon.includes('bloodrose')
    ) {
      return SUBCLASS_ARCHETYPES.ROGUE;
    }

    // Wizards / Sorcerers / Necromancers
    if (
      canon.includes('wizard') || canon.includes('mage') || canon.includes('archmage') ||
      canon.includes('sorcerer') || canon.includes('necromancer') || canon.includes('soultaker') ||
      canon.includes('spellsinger') || canon.includes('mysticmuse') || canon.includes('spellhowler') ||
      canon.includes('stormscreamer') || canon.includes('elementweaver')
    ) {
      return SUBCLASS_ARCHETYPES.WIZARD;
    }

    // Summoners
    if (
      canon.includes('warlock') || canon.includes('arcanalord') || canon.includes('elementalsummoner') ||
      canon.includes('elementalmaster') || canon.includes('phantomsummoner') || canon.includes('spectralmaster') ||
      canon.includes('summoner')
    ) {
      return SUBCLASS_ARCHETYPES.SUMMONER;
    }

    // Healers / Bishops / Priests
    if (
      canon.includes('cleric') || canon.includes('bishop') || canon.includes('cardinal') ||
      canon.includes('prophet') || canon.includes('hierophant') || canon.includes('oracle') ||
      canon.includes('elder') || canon.includes('evassaint') || canon.includes('shilliensaint') ||
      canon.includes('healer') || canon.includes('saint')
    ) {
      return SUBCLASS_ARCHETYPES.HEALER;
    }

    // Enchanters / Buffers / Bards
    if (
      canon.includes('swordsinger') || canon.includes('swordmuse') || canon.includes('bladedancer') ||
      canon.includes('spectraldancer') || canon.includes('shaman') || canon.includes('overlord') ||
      canon.includes('dominator') || canon.includes('warcryer') || canon.includes('doomcryer') ||
      canon.includes('judicator') || canon.includes('shinemaker') || canon.includes('enchanter')
    ) {
      return SUBCLASS_ARCHETYPES.ENCHANTER;
    }

    // Default: Warrior (Fighters, Gladiators, Warlords, Destroyers, Tyrants, Dwarves, Kamaels, etc.)
    return SUBCLASS_ARCHETYPES.WARRIOR;
  }

  /**
   * Retorna os 4 marcos de certificação disponíveis para uma subclasse
   * @param {Object} state
   * @param {string|number} subIdentifier (id ou index da subclasse)
   * @returns {Array<{ tier: number, requiredLevel: number, title: string, badge: string, isUnlocked: boolean, isLearned: boolean, learnedId: string|null, options: Array<Object> }>}
   */
  static getSubclassMilestones(state, subIdentifier) {
    if (!state || !state.subclasses) return [];

    let sub = null;
    if (typeof subIdentifier === 'number') {
      sub = state.subclasses[subIdentifier];
    } else {
      sub = state.subclasses.find(s => s.id === subIdentifier || s.classId === subIdentifier);
    }

    if (!sub) return [];

    const subLevel = Number(sub.level) || 40;
    const archetype = this.getArchetypeForClass(sub.classId);
    const subCerts = state.subclassCertifications?.[sub.id] || {};

    const milestones = [
      {
        tier: 1,
        milestoneKey: 'lv65',
        requiredLevel: 65,
        title: 'Certificado Emergente I (Lv. 65)',
        badge: 'Emergent I',
        isUnlocked: subLevel >= 65,
        isLearned: Boolean(subCerts.lv65),
        learnedId: subCerts.lv65 || null,
        options: Object.values(EMERGENT_ABILITIES)
      },
      {
        tier: 2,
        milestoneKey: 'lv70',
        requiredLevel: 70,
        title: 'Certificado Emergente II (Lv. 70)',
        badge: 'Emergent II',
        isUnlocked: subLevel >= 70,
        isLearned: Boolean(subCerts.lv70),
        learnedId: subCerts.lv70 || null,
        options: Object.values(EMERGENT_ABILITIES)
      },
      {
        tier: 3,
        milestoneKey: 'lv75',
        requiredLevel: 75,
        title: `Habilidade Mestra de ${archetype.toUpperCase()} (Lv. 75)`,
        badge: 'Master Ability',
        isUnlocked: subLevel >= 75,
        isLearned: Boolean(subCerts.lv75),
        learnedId: subCerts.lv75 || null,
        options: MASTER_ABILITIES_BY_ARCHETYPE[archetype] || []
      },
      {
        tier: 4,
        milestoneKey: 'lv80',
        requiredLevel: 80,
        title: `Transformação Divina de ${archetype.toUpperCase()} (Lv. 80)`,
        badge: 'Divine Form',
        isUnlocked: subLevel >= 80,
        isLearned: Boolean(subCerts.lv80),
        learnedId: subCerts.lv80 || null,
        options: DIVINE_TRANSFORMATIONS[archetype] ? [DIVINE_TRANSFORMATIONS[archetype]] : []
      }
    ];

    return milestones;
  }

  /**
   * Aprende uma habilidade de certificação em um marco específico de uma subclasse
   * @param {Object} state
   * @param {string} subId
   * @param {'lv65'|'lv70'|'lv75'|'lv80'} milestoneKey
   * @param {string} abilityId
   * @param {Object} callbacks
   * @returns {boolean}
   */
  static learnCertification(state, subId, milestoneKey, abilityId, callbacks = {}) {
    if (!state || !state.subclasses) return false;

    const sub = state.subclasses.find(s => s.id === subId);
    if (!sub) {
      if (callbacks.log) callbacks.log('❌ Subclasse não encontrada.', 'system');
      return false;
    }

    const subLevel = Number(sub.level) || 40;
    const reqLevels = { lv65: 65, lv70: 70, lv75: 75, lv80: 80 };
    const req = reqLevels[milestoneKey];

    if (!req || subLevel < req) {
      if (callbacks.log) callbacks.log(`❌ Requer Nível ${req}+ na subclasse para certificar.`, 'system');
      return false;
    }

    state.subclassCertifications = state.subclassCertifications || {};
    state.subclassCertifications[subId] = state.subclassCertifications[subId] || {};

    state.subclassCertifications[subId][milestoneKey] = abilityId;

    // Localiza definição do poder para feedback
    let abilityDef = EMERGENT_ABILITIES[abilityId];
    if (!abilityDef) {
      const archetype = this.getArchetypeForClass(sub.classId);
      abilityDef = (MASTER_ABILITIES_BY_ARCHETYPE[archetype] || []).find(a => a.id === abilityId);
    }
    if (!abilityDef) {
      abilityDef = Object.values(DIVINE_TRANSFORMATIONS).find(d => d.id === abilityId);
    }

    const abilityName = abilityDef?.name || abilityId;

    if (callbacks.log) {
      callbacks.log(`📜✨ **CERTIFICAÇÃO ADQUIRIDA!** [${sub.classId?.toUpperCase()}] aprendeu **${abilityName}**!`, 'rarity-legendary');
      callbacks.log(`Todos os bônus foram vinculados permanentemente à sua Classe Principal! (+${abilityDef?.cp || 1500} CP)`, 'rarity-epic');
    }

    if (callbacks.onUpdate) callbacks.onUpdate();
    return true;
  }

  /**
   * Reseta as certificações de uma subclasse para permitir re-distribuição
   * @param {Object} state
   * @param {string} subId
   * @param {Object} callbacks
   * @returns {boolean}
   */
  static resetSubclassCertifications(state, subId, callbacks = {}) {
    if (!state || !state.subclassCertifications || !state.subclassCertifications[subId]) {
      if (callbacks.log) callbacks.log('Nenhuma certificação para resetar nesta subclasse.', 'system');
      return false;
    }

    const costAdena = 1000000; // 1kk Adena
    if ((state.gold || 0) < costAdena) {
      if (callbacks.log) callbacks.log(`❌ Adena insuficiente para redefinir certificações (Requer 1.000.000 Adena).`, 'system');
      return false;
    }

    state.gold -= costAdena;
    delete state.subclassCertifications[subId];

    if (callbacks.log) {
      callbacks.log(`🔄 **Certificações Redefinidas!** Os certificados foram devolvidos para redistribuição. (-1.000.000 Adena)`, 'system');
    }

    if (callbacks.onUpdate) callbacks.onUpdate();
    return true;
  }

  /**
   * Consolida todos os bônus passivos acumulados de todas as certificações
   * @param {Object} state
   * @returns {{
   *   pAtk: number, mAtk: number, pDef: number, mDef: number,
   *   pAtkPercent: number, mAtkPercent: number, pDefPercent: number, mDefPercent: number,
   *   maxHpPercent: number, maxMpPercent: number, maxCpPercent: number,
   *   critRate: number, castSpd: number, atkSpd: number, atkSpdPercent: number,
   *   evasion: number, range: number, celestialProc: boolean, hasteProc: boolean,
   *   defenceProc: boolean, spiritProc: boolean, critProc: boolean,
   *   totalCertCount: number, totalCP: number
   * }}
   */
  static calculateTotalCertificationBonuses(state) {
    const bonuses = {
      pAtk: 0,
      mAtk: 0,
      pDef: 0,
      mDef: 0,
      pAtkPercent: 0,
      mAtkPercent: 0,
      pDefPercent: 0,
      mDefPercent: 0,
      maxHpPercent: 0,
      maxMpPercent: 0,
      maxCpPercent: 0,
      critRate: 0,
      castSpd: 0,
      atkSpd: 0,
      atkSpdPercent: 0,
      evasion: 0,
      range: 0,
      celestialProc: false,
      hasteProc: false,
      defenceProc: false,
      spiritProc: false,
      critProc: false,
      totalCertCount: 0,
      totalCP: 0
    };

    if (!state) return bonuses;

    // 1. Auto-migração transparente do formato legado para o novo sistema estruturado
    if (state.certifications && !state.subclassCertifications && Array.isArray(state.subclasses)) {
      state.subclassCertifications = {};
      state.subclasses.forEach((sub) => {
        state.subclassCertifications[sub.id] = {};
        if (sub.level >= 65) state.subclassCertifications[sub.id].lv65 = 'emergent_patk';
        if (sub.level >= 70) state.subclassCertifications[sub.id].lv70 = 'emergent_pdef';
        if (sub.level >= 75) {
          const arch = this.getArchetypeForClass(sub.classId);
          const firstMaster = MASTER_ABILITIES_BY_ARCHETYPE[arch]?.[0]?.id || 'master_haste';
          state.subclassCertifications[sub.id].lv75 = firstMaster;
        }
        if (sub.level >= 80) {
          const arch = this.getArchetypeForClass(sub.classId);
          state.subclassCertifications[sub.id].lv80 = DIVINE_TRANSFORMATIONS[arch]?.id || 'divine_warrior';
        }
      });
    }

    // 2. Acúmulo de bônus por subclasse
    const certsMap = state.subclassCertifications || {};

    for (const subId in certsMap) {
      const subCerts = certsMap[subId];
      if (!subCerts) continue;

      for (const milestoneKey of ['lv65', 'lv70', 'lv75', 'lv80']) {
        const abilityId = subCerts[milestoneKey];
        if (!abilityId) continue;

        bonuses.totalCertCount++;

        // Verifica se é Emergente
        if (EMERGENT_ABILITIES[abilityId]) {
          const def = EMERGENT_ABILITIES[abilityId];
          bonuses.totalCP += def.cp || 1500;
          if (def.stats.pAtk) bonuses.pAtk += def.stats.pAtk;
          if (def.stats.pDef) bonuses.pDef += def.stats.pDef;
          if (def.stats.mAtk) bonuses.mAtk += def.stats.mAtk;
          if (def.stats.mDef) bonuses.mDef += def.stats.mDef;
          if (def.stats.pAtkPercent) bonuses.pAtkPercent += def.stats.pAtkPercent;
          if (def.stats.pDefPercent) bonuses.pDefPercent += def.stats.pDefPercent;
          if (def.stats.mAtkPercent) bonuses.mAtkPercent += def.stats.mAtkPercent;
          if (def.stats.mDefPercent) bonuses.mDefPercent += def.stats.mDefPercent;
          if (def.stats.critRate) bonuses.critRate += def.stats.critRate;
          if (def.stats.castSpd) bonuses.castSpd += def.stats.castSpd;
          if (def.stats.atkSpd) bonuses.atkSpd += def.stats.atkSpd;
        }

        // Verifica se é Habilidade Mestra
        for (const arch in MASTER_ABILITIES_BY_ARCHETYPE) {
          const mDef = MASTER_ABILITIES_BY_ARCHETYPE[arch].find(a => a.id === abilityId);
          if (mDef) {
            bonuses.totalCP += mDef.cp || 3500;
            if (mDef.stats.pAtkPercent) bonuses.pAtkPercent += mDef.stats.pAtkPercent;
            if (mDef.stats.pDefPercent) bonuses.pDefPercent += mDef.stats.pDefPercent;
            if (mDef.stats.mAtkPercent) bonuses.mAtkPercent += mDef.stats.mAtkPercent;
            if (mDef.stats.mDefPercent) bonuses.mDefPercent += mDef.stats.mDefPercent;
            if (mDef.stats.maxHpPercent) bonuses.maxHpPercent += mDef.stats.maxHpPercent;
            if (mDef.stats.maxMpPercent) bonuses.maxMpPercent += mDef.stats.maxMpPercent;
            if (mDef.stats.maxCpPercent) bonuses.maxCpPercent += mDef.stats.maxCpPercent;
            if (mDef.stats.critRate) bonuses.critRate += mDef.stats.critRate;
            if (mDef.stats.castSpd) bonuses.castSpd += mDef.stats.castSpd;
            if (mDef.stats.atkSpdPercent) bonuses.atkSpdPercent += mDef.stats.atkSpdPercent;
            if (mDef.stats.evasion) bonuses.evasion += mDef.stats.evasion;
            if (mDef.stats.range) bonuses.range += mDef.stats.range;
            if (mDef.stats.celestialProc) bonuses.celestialProc = true;
            if (mDef.stats.hasteProc) bonuses.hasteProc = true;
            if (mDef.stats.defenceProc) bonuses.defenceProc = true;
            if (mDef.stats.spiritProc) bonuses.spiritProc = true;
            if (mDef.stats.critProc) bonuses.critProc = true;
          }
        }

        // Verifica se é Transformação Divina
        for (const arch in DIVINE_TRANSFORMATIONS) {
          const dDef = DIVINE_TRANSFORMATIONS[arch];
          if (dDef.id === abilityId) {
            bonuses.totalCP += dDef.cp || 6500;
            // Bônus da Aura Permanente
            if (dDef.passiveStats.pAtkPercent) bonuses.pAtkPercent += dDef.passiveStats.pAtkPercent;
            if (dDef.passiveStats.pDefPercent) bonuses.pDefPercent += dDef.passiveStats.pDefPercent;
            if (dDef.passiveStats.mAtkPercent) bonuses.mAtkPercent += dDef.passiveStats.mAtkPercent;
            if (dDef.passiveStats.mDefPercent) bonuses.mDefPercent += dDef.passiveStats.mDefPercent;
            if (dDef.passiveStats.maxHpPercent) bonuses.maxHpPercent += dDef.passiveStats.maxHpPercent;
            if (dDef.passiveStats.critRate) bonuses.critRate += dDef.passiveStats.critRate;
            if (dDef.passiveStats.castSpd) bonuses.castSpd += dDef.passiveStats.castSpd;
            if (dDef.passiveStats.evasion) bonuses.evasion += dDef.passiveStats.evasion;
            if (dDef.passiveStats.speedPercent) bonuses.speedPercent = (bonuses.speedPercent || 0) + dDef.passiveStats.speedPercent;
          }
        }
      }
    }

    // 3. Se houver uma Transformação Divina ATIVA no momento
    if (state.activeTransformation) {
      const activeTrans = Object.values(DIVINE_TRANSFORMATIONS).find(t => t.id === state.activeTransformation);
      if (activeTrans && activeTrans.transformationBuffs) {
        const tb = activeTrans.transformationBuffs;
        if (tb.pAtkPercent) bonuses.pAtkPercent += tb.pAtkPercent;
        if (tb.pDefPercent) bonuses.pDefPercent += tb.pDefPercent;
        if (tb.mAtkPercent) bonuses.mAtkPercent += tb.mAtkPercent;
        if (tb.mDefPercent) bonuses.mDefPercent += tb.mDefPercent;
        if (tb.maxHpPercent) bonuses.maxHpPercent += tb.maxHpPercent;
        if (tb.critRate) bonuses.critRate += tb.critRate;
        if (tb.castSpd) bonuses.castSpd += tb.castSpd;
        if (tb.evasion) bonuses.evasion += tb.evasion;
      }
    }

    return bonuses;
  }

  /**
   * Calcula o Combat Power derivado de certificações
   * @param {Object} state
   * @returns {number}
   */
  static calculateCertificationCP(state) {
    const bonuses = this.calculateTotalCertificationBonuses(state);
    return bonuses.totalCP || 0;
  }
}
