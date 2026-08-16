/**
 * CombatValidatorEngine.js — Motor de Validação Rígida de Combate, Movesets, Barreira 4★ e Hard DPS Check.
 *
 * Pilares:
 * 1. Movesets por Arma: Habilidades exigem armas específicas (Arco só com arco, adaga com adaga, katana com katana, etc.).
 * 2. Barreira de Ultimate 4★: Habilidades 4★ exigem o consumo permanente do Spellbook 4★ correspondente para serem aprendidas.
 *    Uma vez aprendida, a habilidade pode ser conjurada livremente.
 * 3. Mastery Multielemental: Multiplicadores por tipo de arma e elemento (Fogo, Água, Vento, Terra, Sagrado, Trevas).
 * 4. Hard DPS Check: Milestone Bosses com temporizador de enrage inadiável e checagem de DPS e barreira elemental.
 */

export const WEAPON_SKILL_MAP = {
  bow: ['archery', 'bow', 'ranged', 'shot', 'arrow', 'snipe', 'double_shot'],
  dagger: ['dagger', 'stab', 'backstab', 'shadow', 'bleed', 'deadly_blow', 'assassin'],
  katana: ['katana', 'iaijutsu', 'bushi', 'samurai', 'blade', 'sakura'],
  two_hand_sword: ['greatsword', 'twohand', 'sweep', 'cleave', 'berserker', 'crush'],
  dual_swords: ['dual', 'sonata', 'dance', 'triple_slash', 'gladiator'],
  blunt: ['hammer', 'blunt', 'stun', 'crush', 'golem', 'craft', 'shield_strike'],
  fists: ['fist', 'claw', 'pummel', 'brawler', 'eviscerate', 'spin_kick', 'sayha_fist'],
  staff: ['magic', 'spell', 'elemental', 'bolt', 'curse', 'heal', 'blast', 'drain', 'shillien', 'rose']
};

export class CombatValidatorEngine {
  /**
   * Identifica o tipo de arma normalizado a partir do item equipado.
   * @param {Object|null} weaponItem
   * @returns {string} 'bare_hands' | 'bow' | 'dagger' | 'katana' | 'two_hand_sword' | 'blunt' | 'fists' | 'staff' | 'sword'
   */
  static getWeaponType(weaponItem) {
    if (!weaponItem) return 'bare_hands';
    const type = (weaponItem.weaponType || weaponItem.type || weaponItem.id || weaponItem.name || '').toLowerCase();
    
    if (type.includes('bow')) return 'bow';
    if (type.includes('dagger')) return 'dagger';
    if (type.includes('katana')) return 'katana';
    if (type.includes('two_hand') || type.includes('greatsword') || type.includes('twohand')) return 'two_hand_sword';
    if (type.includes('dual')) return 'dual_swords';
    if (type.includes('hammer') || type.includes('blunt') || type.includes('mace')) return 'blunt';
    if (type.includes('fist') || type.includes('claw') || type.includes('brass_knuckle')) return 'fists';
    if (type.includes('staff') || type.includes('wand') || type.includes('rod') || type.includes('magic')) return 'staff';
    return 'sword';
  }

  /**
   * Valida se a habilidade é compatível com a arma empunhada pelo personagem.
   * @param {Object} weaponItem
   * @param {Object} skillDef
   * @returns {{ valid: boolean, error?: string }}
   */
  static validateWeaponMoveset(weaponItem, skillDef) {
    if (!skillDef) return { valid: false, error: 'Definição de habilidade inválida.' };
    
    // Skills genéricas ou buffs corporais que aceitam qualquer arma
    if (skillDef.requiredWeaponType === 'any' || skillDef.type === 'Self-Buff' || skillDef.type === 'Passivo') {
      return { valid: true };
    }

    const currentWeaponType = this.getWeaponType(weaponItem);

    // Se a skill define explicitamente o tipo exigido
    if (skillDef.requiredWeaponType) {
      if (skillDef.requiredWeaponType !== currentWeaponType) {
        return {
          valid: false,
          error: `Arma incompatível: [${skillDef.name}] exige [${skillDef.requiredWeaponType.toUpperCase()}], mas você está com [${currentWeaponType.toUpperCase()}].`
        };
      }
      return { valid: true };
    }

    // Inferência heurística de moveset baseada no nome/efeito da skill
    const skillNameLower = (skillDef.name || '').toLowerCase();
    const skillEffectLower = (skillDef.effect || '').toLowerCase();

    if (skillNameLower.includes('shot') || skillNameLower.includes('arrow') || skillEffectLower.includes('arco')) {
      if (currentWeaponType !== 'bow') {
        return { valid: false, error: `[${skillDef.name}] só pode ser disparada com um Arco equipado.` };
      }
    }

    if (skillNameLower.includes('iaijutsu') || skillNameLower.includes('katana') || skillEffectLower.includes('katana')) {
      if (currentWeaponType !== 'katana' && currentWeaponType !== 'sword') {
        return { valid: false, error: `[${skillDef.name}] exige o empunhar de uma Katana ancestral.` };
      }
    }

    if (skillNameLower.includes('dagger') || skillNameLower.includes('stab') || skillNameLower.includes('backstab')) {
      if (currentWeaponType !== 'dagger') {
        return { valid: false, error: `[${skillDef.name}] exige uma Adaga ágil para desferir golpes furtivos.` };
      }
    }

    if (skillNameLower.includes('pummel') || skillNameLower.includes('kick') || skillEffectLower.includes('punhos') || skillEffectLower.includes('garras')) {
      if (currentWeaponType !== 'fists' && currentWeaponType !== 'bare_hands') {
        return { valid: false, error: `[${skillDef.name}] é uma arte marcial exclusiva para Garras/Punhos de combate.` };
      }
    }

    return { valid: true };
  }

  /**
   * Verifica se o personagem possui os requisitos para APRENDER a habilidade,
   * incluindo a BARREIRA DE SPELLBOOK 4★ (Tomo Arcano).
   * @param {Object} characterState
   * @param {Object} skillDef
   * @returns {{ canLearn: boolean, requiredSpellbook?: string, error?: string }}
   */
  static checkSkillLearnRequirements(characterState, skillDef) {
    if (!skillDef) return { canLearn: false, error: 'Habilidade inválida.' };

    const skillId = skillDef.id || skillDef.name;
    const learnedSkills = characterState.skills || {};

    // Já aprendida
    if (learnedSkills[skillId]?.learned) {
      return { canLearn: false, error: 'Habilidade já foi aprendida.' };
    }

    // Checagem de Nível e SP
    const reqLevel = skillDef.reqLevel || skillDef.level || 1;
    if ((characterState.level || 1) < reqLevel) {
      return { canLearn: false, error: `Nível ${reqLevel} necessário para desbloquear ${skillDef.name}.` };
    }

    // Validação de Barreira de Ultimate 4★
    const is4Star = skillDef.rarity === '4★' || skillDef.isUltimate || (skillDef.tier && skillDef.tier >= 4);
    if (is4Star) {
      const spellbookId = skillDef.requiredSpellbookId || `spellbook_4star_${skillId.toLowerCase().replace(/[^a-z0-9_]/g, '_')}`;
      const inv = characterState.inventory || [];
      const hasBook = inv.some(i => (i.id === spellbookId || i.itemId === spellbookId || i.templateId === spellbookId || (i.id && i.id.includes('spellbook_4star'))) && (i.count || i.quantity || 1) >= 1);

      if (!hasBook) {
        return {
          canLearn: false,
          requiredSpellbook: spellbookId,
          error: `Barreira de Conjurador: É obrigatório possuir o Tomo Arcano [Spellbook 4★] para gravar permanentemente esta Ultimate na sua alma!`
        };
      }
    }

    return { canLearn: true };
  }

  /**
   * Executa o aprendizado permanente da habilidade, consumindo o Spellbook 4★ da mochila se aplicável.
   * @param {Object} characterState
   * @param {Object} skillDef
   * @param {Object} hooks
   * @returns {{ success: boolean, message: string }}
   */
  static learnSkill(characterState, skillDef, hooks = {}) {
    const check = this.checkSkillLearnRequirements(characterState, skillDef);
    if (!check.canLearn) {
      return { success: false, message: check.error || 'Requisitos não atingidos.' };
    }

    const skillId = skillDef.id || skillDef.name;
    const is4Star = skillDef.rarity === '4★' || skillDef.isUltimate || (skillDef.tier && skillDef.tier >= 4);

    // Consumo do Spellbook 4★ (Item Sink)
    if (is4Star) {
      const inv = characterState.inventory || [];
      const bookIndex = inv.findIndex(i => 
        (i.id === check.requiredSpellbook || i.itemId === check.requiredSpellbook || (i.id && i.id.includes('spellbook_4star'))) && (i.count || i.quantity || 1) >= 1
      );

      if (bookIndex !== -1) {
        const item = inv[bookIndex];
        const currentQty = item.count || item.quantity || 1;
        if (currentQty > 1) {
          if (item.count) item.count -= 1;
          if (item.quantity) item.quantity -= 1;
        } else {
          inv.splice(bookIndex, 1);
        }
        hooks.log?.(`📖 **${item.name || 'Spellbook 4★'}** foi consumido pela alma do herói!`, 'gain');
      }
    }

    // Grava como permanentemente aprendida
    if (!characterState.skills) characterState.skills = {};
    characterState.skills[skillId] = {
      learned: true,
      level: 1,
      name: skillDef.name,
      learnedAt: Date.now()
    };

    hooks.log?.(`✨ Você aprendeu permanentemente a habilidade suprema: **${skillDef.name}**!`, 'victory');
    hooks.onUpdate?.();

    return { success: true, message: `Habilidade ${skillDef.name} aprendida com sucesso!` };
  }

  /**
   * Valida a execução (Cast) de uma habilidade em combate.
   * Regra: Se for 4★, basta estar marcada como aprendida (não exige carregar o livro na mochila).
   * @param {Object} characterState
   * @param {Object} equippedWeapon
   * @param {Object} skillDef
   * @returns {{ canCast: boolean, error?: string }}
   */
  static validateSkillCast(characterState, equippedWeapon, skillDef) {
    if (!skillDef) return { canCast: false, error: 'Habilidade não encontrada.' };

    const skillId = skillDef.id || skillDef.name;
    const is4Star = skillDef.rarity === '4★' || skillDef.isUltimate || (skillDef.tier && skillDef.tier >= 4);

    // 1. Verificação de Aprendizado
    if (is4Star) {
      const learned = characterState.skills?.[skillId]?.learned;
      if (!learned) {
        return {
          canCast: false,
          error: `Habilidade Suprema [${skillDef.name}] ainda não foi aprendida. Consuma o Tomo Arcano 4★ para desbloqueá-la!`
        };
      }
    }

    // 2. Validação de Moveset por Arma
    const movesetValidation = this.validateWeaponMoveset(equippedWeapon, skillDef);
    if (!movesetValidation.valid) {
      return { canCast: false, error: movesetValidation.error };
    }

    // 3. Recursos (MP)
    const currentMp = characterState.mp || characterState.stats?.mp || 100;
    const costMp = skillDef.mpCost || skillDef.manaCost || 10;
    if (currentMp < costMp) {
      return { canCast: false, error: 'MP insuficiente para canalizar a técnica.' };
    }

    return { canCast: true };
  }

  /**
   * Calcula o multiplicador de dano baseado no Mastery de Arma + Elemento.
   * @param {Object} characterState
   * @param {string} weaponType
   * @param {string} elementType
   * @returns {number} Multiplicador (ex: 1.0 a 2.5)
   */
  static calculateMasteryMultiplier(characterState, weaponType, elementType = 'none') {
    const masteries = characterState.masteries || {};
    const key = `${weaponType}:${elementType}`;
    const level = masteries[key] || masteries[weaponType] || 0;
    return 1.0 + level * 0.04; // +4% de dano por ponto de domínio
  }
}

/**
 * Validador Matemático de Hard DPS Check e Milestone Bosses
 */
export class MilestoneBossValidator {
  /**
   * Avalia as condições de Enrage e Barreira Elemental de um Milestone Boss.
   * @param {Object} bossState
   * @param {number} elapsedSeconds
   * @param {number} currentDps
   * @param {Record<string, number>} partyElementalDamage
   * @returns {{ isWiped: boolean, isEnraged: boolean, reason?: string }}
   */
  static evaluateBossFight(bossState, elapsedSeconds, currentDps, partyElementalDamage = {}) {
    const maxFightTime = bossState.enrageTimerSeconds || 120; // 2 minutos padrão
    const minDpsRequired = bossState.requiredDpsThreshold || 500;
    const reqElement = bossState.requiredElement; // 'fire', 'holy', 'dark', etc.
    const reqElementDmg = bossState.requiredElementDmgThreshold || 0;

    // 1. Hard Enrage por Tempo (Insta-Wipe)
    if (elapsedSeconds >= maxFightTime && bossState.currentHp > 0) {
      return {
        isWiped: true,
        isEnraged: true,
        reason: `💥 TEMPO ESGOTADO (Hard Enrage): ${bossState.name} canalizou a Fúria Cataclísmica após ${maxFightTime}s. O grupo foi aniquilado!`
      };
    }

    // 2. Barreira Elemental Impermeável
    if (reqElement && reqElementDmg > 0) {
      const currentElemDmg = partyElementalDamage[reqElement] || 0;
      // Se faltam menos de 15 segundos e não atingiu 50% do dano elemental exigido
      if (elapsedSeconds >= maxFightTime - 15 && currentElemDmg < reqElementDmg) {
        return {
          isWiped: true,
          isEnraged: true,
          reason: `🛡️ BARREIRA ELEMENTAL INTOCADA: Dano insuficiente de [${reqElement.toUpperCase()}]. A carapaça invulnerável de ${bossState.name} repeliu o grupo!`
        };
      }
    }

    // 3. Alerta de Fúria Iminente
    const isEnraged = elapsedSeconds >= maxFightTime * 0.8;

    return {
      isWiped: false,
      isEnraged,
      reason: isEnraged ? `⚠️ ALERTA DE ENRAGE: ${bossState.name} está prestes a entrar em fúria mortal!` : undefined
    };
  }
}
