/**
 * Módulo de dados autêntico do Subclass System MasterWork
 */

export const FATE_WHISPER_MIN_LEVEL = 52;
export const SUBCLASS_MAX_LEVEL = 85;

export const EMERGENT_SKILLS = {
  physAtk: { name: 'Sub-Class Ability: Physical Attack', levels: [18, 36, 63], desc: 'Aumenta o Ataque Físico' },
  magAtk: { name: 'Sub-Class Ability: Magical Attack', levels: [12, 24, 42], desc: 'Aumenta o Ataque Mágico' },
  physDef: { name: 'Sub-Class Ability: Physical Defence', heavy: [18, 36, 63], light: [13, 26, 46], robe: [9, 18, 32], desc: 'Aumenta a Defesa Física baseada na armadura' },
  magDef: { name: 'Sub-Class Ability: Magical Defence', levels: [15, 30, 53], desc: 'Aumenta a Defesa Mágica' },
  castSpd: { name: 'Sub-Class Ability: Casting Speed', levels: [8, 16, 28], desc: 'Aumenta a Velocidade de Conjuração' },
  critRate: { name: 'Sub-Class Ability: Physical Critical Rate', levels: [7, 14, 25], desc: 'Aumenta a Taxa de Crítico Físico' },
  moveSpeed: { name: 'Sub-Class Ability: Movement Speed', levels: [1, 2, 4], desc: 'Aumenta a Velocidade de Movimento' }
};

export const MASTER_ABILITIES = {
  boostHp: { id: 'boostHp', name: 'Boost HP', icon: '❤️', desc: 'Max HP +8% & Regeneração de HP +20%' },
  boostMp: { id: 'boostMp', name: 'Boost MP', icon: '💙', desc: 'Max MP +12% & Regeneração de MP +20%' },
  evasion: { id: 'evasion', name: 'Evasion', icon: '👟', desc: 'Esquiva +5 & Esquiva de Habilidade +5%' },
  longShot: { id: 'longShot', name: 'Long Shot', icon: '🏹', desc: 'Alcance de Arco +100 / Besta +50' },
  prayer: { id: 'prayer', name: 'Prayer', icon: '✨', desc: 'Eficiência de Cura Recebida +15%' },
  resistTrait: { id: 'resistTrait', name: 'Resist Trait', icon: '🛡️', desc: 'Resistência a Debuffs e Cancelamento +10%' },
  haste: { id: 'haste', name: 'Haste Proc', icon: '⚡', desc: '2% de chance ao atacar: +32% Atk.Spd' },
  defence: { id: 'defence', name: 'Defence Proc', icon: '🛡️', desc: '2% de chance ao apanhar: +24% P.Def / M.Def' },
  criticalChance: { id: 'criticalChance', name: 'Critical Chance Proc', icon: '💥', desc: '2% de chance ao atacar: +32% Crit.Rate' },
  barrier: { id: 'barrier', name: 'Barrier (Celestial Shield)', icon: '🌟', desc: '2% de chance ao apanhar: Escudo Celestial Invencível' },
  boostCp: { id: 'boostCp', name: 'Boost CP', icon: '🛡️', desc: 'Max CP +20% & Regeneração de CP +35%' },
  divineProtection: { id: 'divineProtection', name: 'Divine Protection', icon: '✝️', desc: 'Resistência a Holy e Dark +30' },
  resistCritical: { id: 'resistCritical', name: 'Resist Critical', icon: '🛑', desc: 'Dano Crítico Recebido -10%' },
  resistAttribute: { id: 'resistAttribute', name: 'Resist Attribute', icon: '🔥', desc: 'Resistência Elemental (Fogo/Água/Vento/Terra) +20' },
  spirit: { id: 'spirit', name: 'Spirit Proc', icon: '👻', desc: '2% de chance ao apanhar: +8% P.Atk, M.Atk & Atk.Spd' }
};

export const DIVINE_TRANSFORMATIONS = {
  divineWarrior: {
    id: 'divineWarrior',
    name: 'Transform Divine Warrior',
    icon: '⚔️',
    desc: 'Guerreiro Divino com War Cry (+25% P.Atk), Sonic Blaster e Sacrifice Warrior (+20% P.Atk)',
    buffs: { atkMult: 0.25, critDmgMult: 0.15 }
  },
  divineKnight: {
    id: 'divineKnight',
    name: 'Transform Divine Knight',
    icon: '🛡️',
    desc: 'Cavaleiro Divino com Ultimate Defence (+100% Def), Hate Aura e Sacrifice Knight',
    buffs: { defMult: 0.50, mdefMult: 0.50 }
  },
  divineRogue: {
    id: 'divineRogue',
    name: 'Transform Divine Rogue',
    icon: '🗡️',
    desc: 'Assassino Divino com Stun Shot, Double Shot, Agility (+4 Eva) e CP Siphon',
    buffs: { critRateAdd: 40, evaAdd: 6 }
  },
  divineWizard: {
    id: 'divineWizard',
    name: 'Transform Divine Wizard',
    icon: '🔮',
    desc: 'Mago Divino com Divine Flare, Divine Strike e Sleep em Área (Divine Cloud)',
    buffs: { matkMult: 0.30, castSpdAdd: 50 }
  },
  divineSummoner: {
    id: 'divineSummoner',
    name: 'Transform Divine Summoner',
    icon: '🦄',
    desc: 'Invocador Divino com Transfer Pain, Final Servitor e Invocação Divina',
    buffs: { hpMult: 0.20, lifestealAdd: 0.05 }
  },
  divineHealer: {
    id: 'divineHealer',
    name: 'Transform Divine Healer',
    icon: '🕊️',
    desc: 'Curandeiro Divino com Major Heal, Cleanse, Ressurreição 70% e Cura em Área',
    buffs: { regenHpAdd: 0.05, mdefMult: 0.25 }
  },
  divineEnchanter: {
    id: 'divineEnchanter',
    name: 'Transform Divine Enchanter',
    icon: '📜',
    desc: 'Encantador Divino com Prophecy of Fire/Water/Wind e Chant of Victory (+10% Stats, +20% Crit)',
    buffs: { atkMult: 0.15, matkMult: 0.15, speedMult: 0.15, castSpdAdd: 30 }
  }
};
