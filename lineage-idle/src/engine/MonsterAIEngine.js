/**
 * MonsterAIEngine.js — IA de Combate para Monstros, Perfis/Arquétipos & Dificuldade Progressiva
 * 
 * NÍVEL 15 (Master Plan v5):
 * 15.1. IA de Combate por Perfil de Monstro (Berserker, Caster, Tank, Assassin, Support)
 * 15.2. Habilidades de Monstro e Traços de Campeões/Elites (Vampiric, Reflect, Mana Burn, Fortress)
 * 15.3. Sagas e Mapas por Faixa de Nível (Gludio a Forge of the Gods)
 * 15.4. Sistema de 4 Níveis de Dificuldade de Caça (Normal, Hard, Nightmare, Hell)
 * 15.5. Recompensas Progressivas por Dificuldade (XP, SP, Adena, Drop Rates)
 */

export const MONSTER_ARCHETYPES = {
  BERSERKER: 'berserker',
  CASTER: 'caster',
  TANK: 'tank',
  ASSASSIN: 'assassin',
  SUPPORT: 'support'
};

export const ARCHETYPE_INFO = {
  [MONSTER_ARCHETYPES.BERSERKER]: {
    label: 'Berserker',
    icon: '⚔️',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.15)',
    border: 'rgba(239, 68, 68, 0.4)',
    desc: 'Agressivo. Entra em Enrage (<35% HP) aumentando o ataque em +30%.'
  },
  [MONSTER_ARCHETYPES.CASTER]: {
    label: 'Conjurador Mágico',
    icon: '🔮',
    color: '#a855f7',
    bg: 'rgba(168, 85, 247, 0.15)',
    border: 'rgba(168, 85, 247, 0.4)',
    desc: 'Conjurador arcano. Desfere feitiços elementais. Vulnerável a dano físico e quebra de Stagger.'
  },
  [MONSTER_ARCHETYPES.TANK]: {
    label: 'Guardião / Tank',
    icon: '🛡️',
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.15)',
    border: 'rgba(59, 130, 246, 0.4)',
    desc: 'Alta P.Def. Chance de Bloqueio de Escudo (-50% dano) e Postura da Fortaleza (<50% HP).'
  },
  [MONSTER_ARCHETYPES.ASSASSIN]: {
    label: 'Assassino Sombrio',
    icon: '🗡️',
    color: '#eab308',
    bg: 'rgba(234, 179, 8, 0.15)',
    border: 'rgba(234, 179, 8, 0.4)',
    desc: 'Ágil e letal. Chance de Esquiva Sombria (Shadow Dodge) e críticos devastadores.'
  },
  [MONSTER_ARCHETYPES.SUPPORT]: {
    label: 'Suporte / Xamã',
    icon: '✨',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.15)',
    border: 'rgba(16, 185, 129, 0.4)',
    desc: 'Cura a si mesmo (<40% HP) e enfraquece o herói com maldições Hex/Gloom.'
  }
};

/**
 * 4 Níveis de Dificuldade de Caça Progressiva (15.4 e 15.5)
 */
export const HUNTING_DIFFICULTIES = {
  normal: {
    id: 'normal',
    name: 'Normal',
    icon: '🟢',
    minLvl: 1,
    hpMult: 1.0,
    atkMult: 1.0,
    defMult: 1.0,
    xpMult: 1.0,
    goldMult: 1.0,
    dropMult: 1.0,
    champBonus: 0,
    color: '#10b981',
    badge: 'Normal',
    desc: 'Dificuldade padrão equilibrada para progressão inicial.'
  },
  hard: {
    id: 'hard',
    name: 'Difícil',
    icon: '🟡',
    minLvl: 40,
    hpMult: 1.6,
    atkMult: 1.35,
    defMult: 1.25,
    xpMult: 1.5,
    goldMult: 1.5,
    dropMult: 1.35,
    champBonus: 4,
    color: '#f59e0b',
    badge: 'Difícil (Lv.40+)',
    desc: '+50% XP/Adena, +35% Drop Rate, monstros mais resistentes.'
  },
  nightmare: {
    id: 'nightmare',
    name: 'Pesadelo',
    icon: '🔴',
    minLvl: 60,
    hpMult: 2.8,
    atkMult: 1.8,
    defMult: 1.6,
    xpMult: 2.5,
    goldMult: 2.5,
    dropMult: 1.8,
    champBonus: 8,
    crystalBonus: true,
    color: '#ef4444',
    badge: 'Pesadelo (Lv.60+)',
    desc: '+150% XP/Adena, +80% Drop Rate, Soul Crystals e Tomos aumentados.'
  },
  hell: {
    id: 'hell',
    name: 'Infernal',
    icon: '🟣',
    minLvl: 76,
    hpMult: 4.5,
    atkMult: 2.6,
    defMult: 2.2,
    xpMult: 4.0,
    goldMult: 4.0,
    dropMult: 2.5,
    champBonus: 15,
    rareDropBonus: true,
    color: '#a855f7',
    badge: 'Infernal (Lv.76+)',
    desc: '+300% XP/Adena, +150% Drop Rate, Campeões frequentes e drops de elite.'
  }
};

export const MonsterAIEngine = {
  /**
   * Obtém o arquétipo de combate do monstro com base em suas características.
   */
  getMonsterArchetype(monsterDef) {
    if (!monsterDef) return MONSTER_ARCHETYPES.BERSERKER;
    if (monsterDef.archetype && MONSTER_ARCHETYPES[monsterDef.archetype.toUpperCase()]) {
      return monsterDef.archetype.toLowerCase();
    }

    const name = String(monsterDef.name || '').toLowerCase();
    const traits = Array.isArray(monsterDef.traits) ? monsterDef.traits : [];

    // 1. Suporte / Curandeiro / Xamã
    if (
      name.includes('priest') || name.includes('shaman') || name.includes('bishop') ||
      name.includes('cleric') || name.includes('seer') || name.includes('hierophant') ||
      traits.includes('heal') || traits.includes('support')
    ) {
      return MONSTER_ARCHETYPES.SUPPORT;
    }

    // 2. Conjurador Mágico
    if (
      monsterDef.magic === true || (monsterDef.matk && monsterDef.matk > monsterDef.atk) ||
      name.includes('mage') || name.includes('wizard') || name.includes('sorcerer') ||
      name.includes('witch') || name.includes('magus') || name.includes('archon') ||
      name.includes('lich') || name.includes('spirit') || name.includes('eye')
    ) {
      return MONSTER_ARCHETYPES.CASTER;
    }

    // 3. Tank / Guardião
    if (
      traits.includes('block') || traits.includes('boneArmor') ||
      name.includes('armored') || name.includes('guardian') || name.includes('knight') ||
      name.includes('shield') || name.includes('sentinel') || name.includes('golem') ||
      name.includes('paladin') || name.includes('vanguard') || name.includes('dreadnought') ||
      name.includes('titan')
    ) {
      return MONSTER_ARCHETYPES.TANK;
    }

    // 4. Assassino / Ladino
    if (
      traits.includes('ambush') || traits.includes('lifesteal') ||
      name.includes('thief') || name.includes('stalker') || name.includes('assassin') ||
      name.includes('scout') || name.includes('infiltrator') || name.includes('slayer') ||
      name.includes('ghost') || name.includes('vampire') || name.includes('archer') ||
      name.includes('marksman') || name.includes('serpent') || name.includes('snake')
    ) {
      return MONSTER_ARCHETYPES.ASSASSIN;
    }

    // 5. Berserker (Padrão para guerreiros, feras, orcs furiosos)
    return MONSTER_ARCHETYPES.BERSERKER;
  },

  /**
   * Inicializa o estado de IA do monstro em combate ativo.
   */
  initMonsterAI(monster, state) {
    if (!monster) return;

    const archetype = this.getMonsterArchetype(monster);
    monster.archetype = archetype;

    // Traços de Elite para Elites ou Campeões
    const eliteTraits = [];
    if (monster.champion === 'red') {
      eliteTraits.push('vampiric', 'reflect', 'berserk_frenzy');
    } else if (monster.champion === 'blue') {
      eliteTraits.push('mana_burn', 'barrier');
    } else if (monster.elite || monster.isElite) {
      if (Math.random() < 0.5) eliteTraits.push('vampiric');
      if (Math.random() < 0.4) eliteTraits.push('reflect');
      if (Math.random() < 0.3) eliteTraits.push('mana_burn');
    }

    monster._aiState = {
      archetype,
      enraged: false,
      enrageMultiplier: 1.0,
      fortressActive: false,
      fortressUntil: 0,
      fortressUsed: false,
      healed: false,
      eliteTraits,
      barrierHp: eliteTraits.includes('barrier') ? Math.floor(monster._maxHp * 0.20) : 0,
      lastCastTick: 0
    };
  },

  /**
   * Processa o dano recebido pelo monstro vindo do herói.
   * Aplica Bloqueio de Escudo (Tank), Esquiva Sombria (Assassin),
   * Gatilhos de Enrage (Berserker), Cura (Support) e Reflexão (Elite/Tank).
   */
  processIncomingDamage(monster, incomingDamage, isPhysical, state, callbacks = {}) {
    const ai = monster._aiState || {};
    const result = {
      finalDamage: incomingDamage,
      wasDodged: false,
      wasBlocked: false,
      reflectedDamage: 0,
      healedHp: 0,
      events: []
    };

    if (incomingDamage <= 0) return result;

    // 1. Esquiva Sombria (Assassino): 18% de chance de esquivar completamente se for físico
    if (ai.archetype === MONSTER_ARCHETYPES.ASSASSIN && isPhysical) {
      const dodgeChance = 0.18;
      if (Math.random() < dodgeChance) {
        result.wasDodged = true;
        result.finalDamage = 0;
        result.events.push({
          type: 'dodge',
          floatText: '💨 SHADOW DODGE',
          floatStyle: 'sf-miss',
          log: `💨 **${monster.name}** desvaneceu nas sombras e esquivou do golpe!`
        });
        return result;
      }
    }

    // 2. Bloqueio de Escudo (Tank): 25% de chance de bloquear 50% do dano físico
    if (ai.archetype === MONSTER_ARCHETYPES.TANK && isPhysical) {
      const blockChance = 0.25;
      if (Math.random() < blockChance) {
        result.wasBlocked = true;
        result.finalDamage = Math.max(1, Math.floor(result.finalDamage * 0.50));
        result.events.push({
          type: 'block',
          floatText: '🛡️ SHIELD BLOCK (-50%)',
          floatStyle: 'sf-block',
          log: `🛡️ **${monster.name}** ergueu seu escudo e bloqueou metade do dano!`
        });
      }
    }

    // 3. Postura da Fortaleza (Tank): abaixo de 50% HP ativa por 10s (+40% P.Def e 10% Reflexão)
    const realNow = Date.now();
    if (ai.archetype === MONSTER_ARCHETYPES.TANK && !ai.fortressUsed && (monster.hp - result.finalDamage) < (monster._maxHp * 0.50)) {
      ai.fortressUsed = true;
      ai.fortressActive = true;
      ai.fortressUntil = realNow + 10000;
      result.events.push({
        type: 'fortress',
        floatText: '🛡️ POSTURA DA FORTALEZA!',
        floatStyle: 'float-epic',
        log: `🛡️ **${monster.name}** assumiu Postura da Fortaleza (Defesa impenetrável e espinhos reflexivos por 10s)!`
      });
    }

    // Se Postura da Fortaleza estiver ativa, reduz mais 25% e reflete 10%
    if (ai.fortressActive) {
      if (realNow < ai.fortressUntil) {
        result.finalDamage = Math.max(1, Math.floor(result.finalDamage * 0.75));
        result.reflectedDamage += Math.max(1, Math.floor(result.finalDamage * 0.10));
      } else {
        ai.fortressActive = false;
      }
    }

    // 4. Absorção de Barreira Protetora (Elite Champion)
    if (ai.barrierHp && ai.barrierHp > 0) {
      if (result.finalDamage <= ai.barrierHp) {
        ai.barrierHp -= result.finalDamage;
        result.events.push({
          type: 'barrier',
          floatText: '🔮 BARREIRA ABSORVEU',
          floatStyle: 'sf-block',
          log: `🔮 O escudo de energia de **${monster.name}** absorveu ${result.finalDamage} de dano!`
        });
        result.finalDamage = 0;
        return result;
      } else {
        const absorbed = ai.barrierHp;
        result.finalDamage -= absorbed;
        ai.barrierHp = 0;
        result.events.push({
          type: 'barrier_break',
          floatText: '💥 BARREIRA DESTRUÍDA',
          floatStyle: 'float-jackpot',
          log: `💥 A barreira arcana de **${monster.name}** foi destruída!`
        });
      }
    }

    // 5. Reflexão de Dano (Elite Reflect Trait)
    if (ai.eliteTraits && ai.eliteTraits.includes('reflect')) {
      const reflectAmt = Math.max(1, Math.floor(result.finalDamage * 0.12));
      result.reflectedDamage += reflectAmt;
      result.events.push({
        type: 'reflect',
        floatText: `⚡ REFLECT -${reflectAmt}`,
        floatStyle: 'sf-hurt',
        log: `⚡ A couraça espinhada de **${monster.name}** refletiu ${reflectAmt} de dano contra você!`
      });
    }

    // 6. Gatilho de Enrage (Berserker): abaixo de 35% HP
    const remainingHp = monster.hp - result.finalDamage;
    if (ai.archetype === MONSTER_ARCHETYPES.BERSERKER && !ai.enraged && remainingHp > 0 && remainingHp < (monster._maxHp * 0.35)) {
      ai.enraged = true;
      ai.enrageMultiplier = 1.30;
      monster.atk = Math.floor(monster.atk * 1.30);
      result.events.push({
        type: 'enrage',
        floatText: '🔥 ENRAGE! (+30% ATK)',
        floatStyle: 'float-jackpot',
        log: `🔥 **${monster.name}** entrou em Fúria Enlouquecida (Enrage)! Seu ataque aumentou em +30%!`
      });
    }

    // 7. Gatilho de Auto-Cura Suprema (Support): abaixo de 40% HP
    if (ai.archetype === MONSTER_ARCHETYPES.SUPPORT && !ai.healed && remainingHp > 0 && remainingHp < (monster._maxHp * 0.40)) {
      ai.healed = true;
      const healAmt = Math.floor(monster._maxHp * 0.30);
      result.healedHp = healAmt;
      monster.hp = Math.min(monster._maxHp, monster.hp + healAmt);
      result.events.push({
        type: 'heal',
        floatText: `✨ +${healAmt} HP (Cura)`,
        floatStyle: 'sf-heal',
        log: `✨ **${monster.name}** canalizou ritos xamânicos e recuperou ${healAmt} de HP!`
      });
    }

    return result;
  },

  /**
   * Processa o ataque do monstro contra o jogador.
   * Aplica magias do Caster, críticos do Assassino, bônus de Fúria do Berserker,
   * drenagem de vida (Vampiric) e queima de mana (Mana Burn).
   */
  processMonsterAttack(monster, playerStats, state) {
    const ai = monster._aiState || {};
    const archetype = ai.archetype || MONSTER_ARCHETYPES.BERSERKER;

    let atkType = (archetype === MONSTER_ARCHETYPES.CASTER || monster.magic === true) ? 'magical' : 'physical';
    let rawAtk = atkType === 'magical' ? (monster.matk || Math.floor(monster.atk * 1.25)) : monster.atk;

    // Berserker enrage bonus
    if (ai.enraged) {
      rawAtk = Math.floor(rawAtk * 1.15);
    }

    let isCrit = false;
    let critMultiplier = 1.0;

    // Assassin critical strikes: 25% chance for 2.2x damage
    if (archetype === MONSTER_ARCHETYPES.ASSASSIN) {
      if (Math.random() < 0.25) {
        isCrit = true;
        critMultiplier = 2.2;
      }
    } else {
      if (Math.random() < 0.08) {
        isCrit = true;
        critMultiplier = 1.6;
      }
    }

    // Caster Elemental Spellcraft
    let spellName = null;
    let spellVfx = null;
    if (archetype === MONSTER_ARCHETYPES.CASTER) {
      const elem = monster.element || 'fire';
      const SPELL_MAP = {
        fire: { name: 'Prominence Elemental', vfx: 'fireball', bonus: 1.25 },
        water: { name: 'Hydro Blast Arcano', vfx: 'water_blast', bonus: 1.20 },
        wind: { name: 'Furacão Cortante', vfx: 'hurricane', bonus: 1.25 },
        earth: { name: 'Espinhaço de Terra', vfx: 'earth_spike', bonus: 1.20 },
        holy: { name: 'Raio Divino Solar', vfx: 'holy_ray', bonus: 1.30 },
        dark: { name: 'Centelha das Sombras', vfx: 'dark_missile', bonus: 1.30 }
      };
      const sp = SPELL_MAP[elem] || SPELL_MAP.fire;
      spellName = sp.name;
      spellVfx = sp.vfx;
      rawAtk = Math.floor(rawAtk * sp.bonus);
    }

    // Support Hex / Gloom Debuff: 25% chance
    let appliedDebuff = null;
    if (archetype === MONSTER_ARCHETYPES.SUPPORT && Math.random() < 0.25) {
      const debuffType = Math.random() < 0.5 ? 'hex' : 'gloom';
      state.buffs = state.buffs || {};
      const now = Date.now();
      if (debuffType === 'hex') {
        state.buffs['monster_hex'] = { amount: 20, until: now + 10000 };
        appliedDebuff = { name: 'Hex Maldito (-20% P.Def)', type: 'hex' };
      } else {
        state.buffs['monster_gloom'] = { amount: 20, until: now + 10000 };
        appliedDebuff = { name: 'Gloom Abissal (-20% M.Def)', type: 'gloom' };
      }
    }

    // Traços de Elite: Vampiric e Mana Burn
    let vampiricHeal = 0;
    let manaBurnAmt = 0;
    if (ai.eliteTraits && ai.eliteTraits.includes('vampiric')) {
      vampiricHeal = 0.25; // 25% do dano final absorvido
    }
    if (ai.eliteTraits && ai.eliteTraits.includes('mana_burn')) {
      manaBurnAmt = Math.floor(Math.random() * 20) + 20; // queima 20-40 MP
    }

    return {
      atkType,
      baseAtk: rawAtk,
      isCrit,
      critMultiplier,
      spellName,
      spellVfx,
      appliedDebuff,
      vampiricHeal,
      manaBurnAmt
    };
  },

  /**
   * Retorna a configuração de Dificuldade de Caça atual.
   */
  getDifficulty(state) {
    const diffId = (state && state.huntingDifficulty) ? state.huntingDifficulty : 'normal';
    const conf = HUNTING_DIFFICULTIES[diffId] || HUNTING_DIFFICULTIES.normal;
    const playerLvl = (state && state.level) || 1;

    // Se o jogador não tiver o nível mínimo da dificuldade, recua em segurança para normal
    if (playerLvl < conf.minLvl) {
      return HUNTING_DIFFICULTIES.normal;
    }
    return conf;
  },

  /**
   * Altera a dificuldade de caça verificando os requisitos de nível.
   */
  setDifficulty(state, diffId) {
    if (!state) return { success: false, reason: 'Estado inválido' };
    const targetDiff = HUNTING_DIFFICULTIES[diffId];
    if (!targetDiff) return { success: false, reason: 'Dificuldade inexistente' };

    const playerLvl = state.level || 1;
    if (playerLvl < targetDiff.minLvl) {
      return {
        success: false,
        reason: `Exige Nível ${targetDiff.minLvl} para desbloquear a dificuldade ${targetDiff.name}!`
      };
    }

    state.huntingDifficulty = diffId;
    return {
      success: true,
      difficulty: targetDiff
    };
  },

  /**
   * Aplica multiplicadores de dificuldade aos stats do monstro ao spawnar.
   */
  applyDifficultyToMonster(monster, difficulty) {
    if (!monster || !difficulty) return;
    const diff = difficulty || HUNTING_DIFFICULTIES.normal;

    const finalHp = Math.floor(monster.hp * diff.hpMult);
    monster.hp = finalHp;
    monster._maxHp = finalHp;
    monster.atk = Math.floor(monster.atk * diff.atkMult);
    monster.def = Math.floor(monster.def * diff.defMult);
    if (monster.matk) monster.matk = Math.floor(monster.matk * diff.atkMult);
    if (monster.mdef) monster.mdef = Math.floor(monster.mdef * diff.defMult);

    monster.xp = Math.floor(monster.xp * diff.xpMult);
    monster.gold = [
      Math.floor((monster.gold[0] || 5) * diff.goldMult),
      Math.floor((monster.gold[1] || 15) * diff.goldMult)
    ];
    monster.difficulty = diff.id;
  }
};
