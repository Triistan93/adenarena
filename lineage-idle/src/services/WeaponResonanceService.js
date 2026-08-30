/**
 * WeaponResonanceService.js — Sistema de Ressonância de Armas e Combos de Habilidades Cruzadas.
 *
 * Analisa as armas equipadas no Slot 1 (weapon) e Slot 2 (weapon2) + Escudo,
 * ativando passivas únicas de arquétipos híbridos (ex: Caçador das Sombras, Tempestade de Lâminas, Paladino Vingador, Feiticeiro da Lâmina).
 */

import { D } from '../core/GameConfig.js';
import { detectItemWeaponType } from '../engine/SkillEngine.js';

export const RESONANCE_DEFINITIONS = {
  shadow_stalker: {
    id: 'shadow_stalker',
    name: 'Caçador das Sombras',
    pairName: 'Arco + Adaga',
    icon: '🏹🗡️',
    color: '#a855f7',
    desc: 'Habilidades de Arco aplicam [Marca das Sombras]. Golpes de Adaga consomem a marca para causar +100% de Dano Crítico Fatal e Sangramento contínuo (Bleed).',
    weap1: 'bow',
    weap2: 'dagger'
  },
  bladestorm_warlord: {
    id: 'bladestorm_warlord',
    name: 'Senhor da Tempestade',
    pairName: 'Dual Swords + Lança',
    icon: '⚔️🔱',
    color: '#38bdf8',
    desc: 'Golpes de Lança acumulam até 5 cargas de [Fúria da Tempestade]. Habilidades de Dual Swords consomem as cargas para desferir ondas de vácuo (+20% dano/carga e -25% P.Def no alvo).',
    weap1: 'dual',
    weap2: 'spear'
  },
  avenging_paladin: {
    id: 'avenging_paladin',
    name: 'Paladino Vingador',
    pairName: '1H/Escudo + Espada 2H',
    icon: '🛡️⚔️',
    color: '#fbbf24',
    desc: 'Golpes de Escudo concedem [Vingança Sagrada]. O próximo ataque com a Espada de 2 Mãos ignora 30% da P.Def do monstro e causa +50% de Dano de Postura (Stagger).',
    weap1: 'sword',
    weap2: 'twohand',
    reqShield: true
  },
  spellblade_arcanist: {
    id: 'spellblade_arcanist',
    name: 'Feiticeiro da Lâmina',
    pairName: 'Cajado Mágico + Lâmina/Maça',
    icon: '🔮🗡️',
    color: '#c084fc',
    desc: 'Magias elementais acumulam [Lâmina Arcana]. O próximo ataque físico consome a carga para causar dano híbrido (Mágico + Físico) e restaurar 10% do MP máximo.',
    weap1: 'staff',
    weap2: ['sword', 'dagger', 'blunt']
  },
  titan_colossus: {
    id: 'titan_colossus',
    name: 'Colosso de Titã',
    pairName: 'Maça/Blunt + Lança',
    icon: '🔨🔱',
    color: '#f97316',
    desc: 'Ataques com Maça despedaçam a armadura do alvo; habilidades de Lança atingem com impacto sísmico extra (+40% dano de postura) e aumentam a duração de Stagger em +3s.',
    weap1: 'blunt',
    weap2: 'spear'
  },
  agile_skirmisher: {
    id: 'agile_skirmisher',
    name: 'Batedor Ágil',
    pairName: 'Arco + Espada/Dual',
    icon: '🏹⚔️',
    color: '#34d399',
    desc: 'Mobilidade e cadência superior: +15% de Velocidade de Ataque (Atk.Spd) e +10% de Evasão permanente durante o combate.',
    weap1: 'bow',
    weap2: ['sword', 'dual']
  },
  grand_archon: {
    id: 'grand_archon',
    name: 'Arquimago Guardião',
    pairName: 'Cajado Mágico + Escudo',
    icon: '🔮🛡️',
    color: '#60a5fa',
    desc: 'Foco protetor: +20% Velocidade de Conjuração (Cast.Spd) e Barreira Arcana que absorve 15% do dano recebido.',
    weap1: 'staff',
    weap2: 'any',
    reqShield: true
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

      const matchesPair = (target1, target2) => {
        const checkMatch = (req, type) => {
          if (!type) return false;
          if (req === 'any') return true;
          if (Array.isArray(req)) return req.includes(type);
          return req === type;
        };

        return (
          (checkMatch(target1, weap1) && checkMatch(target2, weap2)) ||
          (checkMatch(target2, weap1) && checkMatch(target1, weap2))
        );
      };

      if (matchesPair(def.weap1, def.weap2)) {
        return def;
      }
    }

    return null;
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

    // 1. Caçador das Sombras: Tiro de Arco aplica Marca das Sombras
    if (resonance.id === 'shadow_stalker') {
      if (reqWeapon === 'bow' || skillNameLower.includes('shot') || skillNameLower.includes('arrow') || skillNameLower.includes('snipe')) {
        monster._shadowMarkUntil = Date.now() + 8000;
        if (callbacks.floatText) callbacks.floatText('🎯 MARCA DAS SOMBRAS!', 'float-epic');
        if (callbacks.log) callbacks.log('🎯 Caçador das Sombras: Alvo marcado! Próximo golpe de Adaga causará +100% de Crítico Fatal e Sangramento!', 'combat');
      }
    }

    // 2. Senhor da Tempestade: Lança gera Fúria da Tempestade
    if (resonance.id === 'bladestorm_warlord') {
      if (reqWeapon === 'spear' || skillNameLower.includes('whirlwind') || skillNameLower.includes('storm') || skillNameLower.includes('sweep')) {
        state.resonanceState.stormFury = Math.min(5, (state.resonanceState.stormFury || 0) + 1);
        const stacks = state.resonanceState.stormFury;
        if (callbacks.floatText) callbacks.floatText(`⚡ FÚRIA (${stacks}/5)`, 'float-gold');
        if (callbacks.log) callbacks.log(`⚡ Fúria da Tempestade acumulada (${stacks}/5 cargas)!`, 'combat');
      }
    }

    // 3. Paladino Vingador: Escudo gera Vingança Sagrada
    if (resonance.id === 'avenging_paladin') {
      if (skillDef.requiredShield || skillNameLower.includes('shield') || skillNameLower.includes('stun')) {
        state.resonanceState.holyVengeanceUntil = Date.now() + 7000;
        if (callbacks.floatText) callbacks.floatText('🛡️ VINGANÇA SAGRADA!', 'float-jackpot');
        if (callbacks.log) callbacks.log('🛡️ Vingança Sagrada ativada! O próximo ataque com a Espada de 2 Mãos ignorará 30% da P.Def do alvo!', 'rarity-legendary');
      }
    }

    // 4. Feiticeiro da Lâmina: Magias acumulam Lâmina Arcana
    if (resonance.id === 'spellblade_arcanist') {
      if (reqWeapon === 'staff' || skillDef.effect === 'spell' || skillNameLower.includes('hydro') || skillNameLower.includes('prominence') || skillNameLower.includes('hurricane') || skillNameLower.includes('flare')) {
        state.resonanceState.arcaneBlade = true;
        if (callbacks.floatText) callbacks.floatText('🔮 LÂMINA ARCANA!', 'float-epic');
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

    // 2. Senhor da Tempestade: Consome Cargas com Dual Swords
    if (resonance.id === 'bladestorm_warlord' && weaponTypeUsed === 'dual') {
      const stacks = state.resonanceState.stormFury || 0;
      if (stacks > 0) {
        state.resonanceState.stormFury = 0;
        const bonusMult = 1 + (stacks * 0.20); // Até +100% dano extra
        finalDamage = Math.floor(finalDamage * bonusMult);
        monster._tempPdefReductionUntil = realNow + 6000; // -25% P.Def
        extraEffects.push('vacuum_wave');

        if (callbacks.floatText) callbacks.floatText(`🌪️ LÂMINA DE VÁCUO (${stacks}x)!`, 'float-jackpot');
        if (callbacks.log) callbacks.log(`🌪️ Onda de Vácuo Cortante liberada (${stacks} cargas): ${finalDamage.toLocaleString()} de Dano e Armadura do Alvo despedaçada (-25% P.Def)!`, 'rarity-rare');
      }
    }

    // 3. Paladino Vingador: Consome Vingança Sagrada com 2H Greatsword
    if (resonance.id === 'avenging_paladin' && weaponTypeUsed === 'twohand') {
      if (state.resonanceState.holyVengeanceUntil && state.resonanceState.holyVengeanceUntil > realNow) {
        state.resonanceState.holyVengeanceUntil = 0;
        finalDamage = Math.floor(finalDamage * 1.5); // +50% dano + ignora defesa
        extraEffects.push('holy_penetration');

        if (callbacks.floatText) callbacks.floatText('💥 VINGANÇA PURIFICADORA! (1.5x)', 'float-jackpot');
        if (callbacks.log) callbacks.log(`💥 Vingança Purificadora desferida com a Espada de 2 Mãos: ${finalDamage.toLocaleString()} de Dano devastador!`, 'rarity-legendary');
      }
    }

    // 4. Feiticeiro da Lâmina: Consome Lâmina Arcana
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

    return { finalDamage, extraEffects };
  }
}
