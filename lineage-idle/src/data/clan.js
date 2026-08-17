/**
 * clan.js — Definições e Regras de Clãs do Lineage Idle.
 *
 * Contém a progressão de Nível de Clã (1 a 10), Habilidades de Clã (Clan Skills),
 * Brasões/Bandeiras, Doações diárias, Loja do Clã e Clãs do Mundo.
 */

export const CLAN_CRESTS = [
  { id: 'lion_gold', name: 'Leão Dourado', icon: '🦁', color: '#f59e0b', bg: '#78350f', desc: 'Símbolo da realeza e coragem inabalável.' },
  { id: 'dragon_crimson', name: 'Dragão Carmesim', icon: '🐉', color: '#ef4444', bg: '#7f1d1d', desc: 'Chamas furiosas de conquista e destruição.' },
  { id: 'eagle_silver', name: 'Águia de Prata', icon: '🦅', color: '#38bdf8', bg: '#0c4a6e', desc: 'Visão altiva e supremacia dos céus.' },
  { id: 'wolf_shadow', name: 'Lobo das Sombras', icon: '🐺', color: '#a855f7', bg: '#581c87', desc: 'Astúcia mortal e união da matilha.' },
  { id: 'shield_holy', name: 'Escudo Sagrado', icon: '🛡️', color: '#10b981', bg: '#064e3b', desc: 'Bastião inquebrável da fé e proteção.' },
  { id: 'swords_blood', name: 'Espadas Cruzadas', icon: '⚔️', color: '#f43f5e', bg: '#881337', desc: 'Pacto de honra firmado no campo de batalha.' },
  { id: 'crown_royal', name: 'Coroa Imperial', icon: '👑', color: '#eab308', bg: '#713f12', desc: 'Legítima linhagem dos soberanos de Aden.' },
  { id: 'arcane_eye', name: 'Olho Arcano', icon: '🔮', color: '#8b5cf6', bg: '#4c1d95', desc: 'Conhecimento ancestral e magia sem limites.' },
  { id: 'thunder_phoenix', name: 'Fênix do Trovão', icon: '⚡', color: '#06b6d4', bg: '#164e63', desc: 'Renascimento glorioso entre raios celestes.' },
  { id: 'night_skull', name: 'Crânio da Morte', icon: '💀', color: '#94a3b8', bg: '#1e293b', desc: 'Temido pacto com as forças do submundo.' },
  { id: 'elven_tree', name: 'Carvalho Élfico', icon: '🌲', color: '#22c55e', bg: '#14532d', desc: 'Sabedoria milenar e harmonia com a floresta.' },
  { id: 'abyss_trident', name: 'Tridente Abissal', icon: '🔱', color: '#3b82f6', bg: '#1e3a8a', desc: 'Comando supremo sobre as marés e o abismo.' }
];

export const CLAN_LEVEL_DATA = {
  1: {
    level: 1,
    title: 'Clã Iniciante',
    reqCharLevel: 20,
    reqExp: 0,
    costAdena: 100000,
    costSp: 10000,
    maxMembers: 15,
    unlockedSkills: ['clan_imperium'],
    desc: 'Fundação do Clã. Desbloqueia o Brasão e a habilidade Clan Imperium (+HP/CP).'
  },
  2: {
    level: 2,
    title: 'Clã Veterano',
    reqCharLevel: 40,
    reqExp: 1000,
    costAdena: 500000,
    costSp: 50000,
    maxMembers: 30,
    unlockedSkills: ['clan_might'],
    desc: 'Aumenta a força militar. Desbloqueia a habilidade Clan Might (+P.Atk).'
  },
  3: {
    level: 3,
    title: 'Clã de Cavaleiros',
    reqCharLevel: 55,
    reqExp: 3500,
    costAdena: 2000000,
    costSp: 200000,
    maxMembers: 45,
    unlockedSkills: ['clan_shield'],
    desc: 'Clã reconhecido pelos nobres. Desbloqueia a habilidade Clan Shield (+P.Def).'
  },
  4: {
    level: 4,
    title: 'Aliança de Guerra',
    reqCharLevel: 70,
    reqExp: 8000,
    costAdena: 10000000,
    costSp: 500000,
    maxMembers: 60,
    unlockedSkills: ['clan_empower', 'clan_magic_barrier'],
    desc: 'Poder arcano e bélico superior. Desbloqueia Clan Empower (+M.Atk) e Clan Magic Barrier (+M.Def).'
  },
  5: {
    level: 5,
    title: 'Ordem Imperial',
    reqCharLevel: 76,
    reqExp: 18000,
    costAdena: 25000000,
    costSp: 1500000,
    maxMembers: 80,
    unlockedSkills: ['clan_vitality'],
    desc: 'O ápice da nobreza. Desbloqueia Clan Vitality (+Regeneração/Speed) e autorização para Cerco a Castelos!'
  },
  6: {
    level: 6,
    title: 'Guardiões do Trono',
    reqCharLevel: 80,
    reqExp: 35000,
    costAdena: 50000000,
    costSp: 3000000,
    maxMembers: 100,
    unlockedSkills: ['clan_guidance'],
    desc: 'Veteranos do reino. Desbloqueia Clan Guidance (+10% Taxa de Crítico e Precisão).'
  },
  7: {
    level: 7,
    title: 'Legião Lendária',
    reqCharLevel: 82,
    reqExp: 60000,
    costAdena: 100000000,
    costSp: 6000000,
    maxMembers: 120,
    unlockedSkills: ['clan_agility'],
    desc: 'Velocidade e reflexos letais. Desbloqueia Clan Agility (+10 Evasão e +8% Vel. Ataque).'
  },
  8: {
    level: 8,
    title: 'Vanguarda Divina',
    reqCharLevel: 84,
    reqExp: 100000,
    costAdena: 200000000,
    costSp: 10000000,
    maxMembers: 150,
    unlockedSkills: ['clan_dominance'],
    desc: 'Supremacia absoluta. Desbloqueia Clan Dominance (+15% Dano Crítico e +6% Todos Ataques).'
  },
  9: {
    level: 9,
    title: 'Soberania de Aden',
    reqCharLevel: 85,
    reqExp: 160000,
    costAdena: 400000000,
    costSp: 18000000,
    maxMembers: 180,
    unlockedSkills: ['clan_clarity'],
    desc: 'Comando místico transcendental: Desbloqueia Clan Clarity (-15% Custo de MP e +10% Cooldown Reduction).'
  },
  10: {
    level: 10,
    title: 'Império Supremo Eterno',
    reqCharLevel: 85,
    reqExp: 250000,
    costAdena: 800000000,
    costSp: 30000000,
    maxMembers: 200,
    unlockedSkills: ['clan_sovereignty'],
    desc: 'A lenda máxima de Aden. Desbloqueia Clan Sovereignty (+15% Todos os Atributos e +15% Drops/EXP).'
  }
};

export const CLAN_SKILLS = {
  clan_imperium: {
    id: 'clan_imperium',
    name: 'Clan Imperium 🛡️',
    levelReq: 1,
    desc: '+10% Max HP e +15% Max CP para todos os membros.',
    stats: { hpPercent: 0.10, cpPercent: 0.15 }
  },
  clan_might: {
    id: 'clan_might',
    name: 'Clan Might ⚔️',
    levelReq: 2,
    desc: '+8% P.Atk físico para todos os membros.',
    stats: { pAtkPercent: 0.08 }
  },
  clan_shield: {
    id: 'clan_shield',
    name: 'Clan Shield 🛡️',
    levelReq: 3,
    desc: '+10% P.Def física para todos os membros.',
    stats: { pDefPercent: 0.10 }
  },
  clan_empower: {
    id: 'clan_empower',
    name: 'Clan Empower 🔮',
    levelReq: 4,
    desc: '+10% M.Atk mágico para todos os membros.',
    stats: { mAtkPercent: 0.10 }
  },
  clan_magic_barrier: {
    id: 'clan_magic_barrier',
    name: 'Clan Magic Barrier 🌌',
    levelReq: 4,
    desc: '+12% M.Def mágica para todos os membros.',
    stats: { mDefPercent: 0.12 }
  },
  clan_vitality: {
    id: 'clan_vitality',
    name: 'Clan Vitality 💚',
    levelReq: 5,
    desc: '+20% Regeneração de HP/MP e +5 Velocidade de Movimento.',
    stats: { regenPercent: 0.20, speedBonus: 5 }
  },
  clan_guidance: {
    id: 'clan_guidance',
    name: 'Clan Guidance 🎯',
    levelReq: 6,
    desc: '+10% Taxa de Ataque Crítico e +15 Precisão.',
    stats: { critPercent: 0.10, accuracy: 15 }
  },
  clan_agility: {
    id: 'clan_agility',
    name: 'Clan Agility 🍃',
    levelReq: 7,
    desc: '+10 Evasão e +8% Velocidade de Ataque / Conjuração.',
    stats: { eva: 10, atkSpdPercent: 0.08 }
  },
  clan_dominance: {
    id: 'clan_dominance',
    name: 'Clan Dominance 👑',
    levelReq: 8,
    desc: '+15% Dano Crítico Adicional e +6% Dano Global.',
    stats: { critDmgPercent: 0.15, allDmgPercent: 0.06 }
  },
  clan_clarity: {
    id: 'clan_clarity',
    name: 'Clan Clarity 🌀',
    levelReq: 9,
    desc: '-15% Custo de MP e +10% Aceleração de Recarga de Skills (CDR).',
    stats: { mpCostReduction: 0.15, cdr: 0.10 }
  },
  clan_sovereignty: {
    id: 'clan_sovereignty',
    name: 'Clan Sovereignty 🌟',
    levelReq: 10,
    desc: '+15% Todos os Atributos Finais e +15% Taxa de EXP & Drops.',
    stats: { allStatsPercent: 0.15, lootBonus: 0.15, xpBonus: 0.15 }
  }
};

export const CLAN_DONATIONS = {
  basic: {
    id: 'basic',
    name: 'Doação Comum',
    icon: '🪙',
    desc: 'Doação modesta de Adena para a manutenção do clã.',
    cost: { gold: 50000 },
    reward: { clanExp: 100, clanGold: 50000, clanCoins: 100 }
  },
  noble: {
    id: 'noble',
    name: 'Doação Nobre',
    icon: '🌟',
    desc: 'Contribuição honrada de recursos e pontos de SP.',
    cost: { gold: 250000, sp: 5000 },
    reward: { clanExp: 400, clanGold: 250000, clanCoins: 350 }
  },
  royal: {
    id: 'royal',
    name: 'Doação Imperial',
    icon: '👑',
    desc: 'Grande tributo da alta nobreza com gemas e ouro maciço.',
    cost: { gold: 1000000, sp: 25000 },
    reward: { clanExp: 1200, clanGold: 1000000, clanCoins: 1000 }
  }
};

export const CLAN_SHOP_CATALOG = [
  {
    id: 'potion_clan_vitality',
    name: 'Poção de Vitalidade do Clã',
    icon: '🧪',
    clanLevelReq: 1,
    costCoins: 80,
    desc: 'Restaura 35% de HP e MP instantaneamente durante o combate.',
    type: 'consumable',
    itemId: 'potion_clan_vitality'
  },
  {
    id: 'scroll_clan_teleport',
    name: 'Pergaminho de Teleporte da Ordem',
    icon: '📜',
    clanLevelReq: 2,
    costCoins: 150,
    desc: 'Teleporta instantaneamente para a fortaleza ou castelo do clã.',
    type: 'consumable',
    itemId: 'teleport_scroll'
  },
  {
    id: 'elixir_clan_might',
    name: 'Elixir de Bravura do Clã',
    icon: '⚔️',
    clanLevelReq: 3,
    costCoins: 300,
    desc: '+12% P.Atk e +10% P.Def por 2 horas.',
    type: 'consumable',
    itemId: 'elixir_berserker'
  },
  {
    id: 'life_stone_mid_76',
    name: 'Mid-Grade Life Stone Nv.76',
    icon: '💎',
    clanLevelReq: 4,
    costCoins: 600,
    desc: 'Pedra de Vida intermediária para augmentação de armas Grau A/S.',
    type: 'material',
    itemId: 'life_stone_mid_76'
  },
  {
    id: 'scroll_blessed_weapon_a',
    name: 'Scroll Blessed Enchant Weapon (Grau A)',
    icon: '📜',
    clanLevelReq: 5,
    costCoins: 1200,
    desc: 'Encanta armas Grau A com segurança: falhas preservam o item.',
    type: 'consumable',
    itemId: 'scroll_blessed_weapon'
  },
  {
    id: 'clan_cloak_noble',
    name: 'Capa Imperial do Clã',
    icon: '🧥',
    clanLevelReq: 6,
    costCoins: 2500,
    desc: 'Manto bordado com o brasão sagrado: +500 HP, +40 P.Def e +5% P.Atk.',
    type: 'equipment',
    itemId: 'cloak_of_sovereign'
  },
  {
    id: 'scroll_blessed_weapon_s',
    name: 'Scroll Blessed Enchant Weapon (Grau S)',
    icon: '📜',
    clanLevelReq: 7,
    costCoins: 3500,
    desc: 'Pergaminho Abençoado Supremo para armas de Grau S.',
    type: 'consumable',
    itemId: 'scroll_blessed_weapon'
  },
  {
    id: 'boss_summon_stone',
    name: 'Pedra de Convocação Abissal',
    icon: '🐉',
    clanLevelReq: 8,
    costCoins: 5000,
    desc: 'Invoca uma versão [CHAOS] de um Chefe Épico no modo combate!',
    type: 'consumable',
    itemId: 'boss_summon_stone'
  }
];

export const DEFAULT_WORLD_CLANS = [
  {
    id: 'clan_blood_oath',
    name: 'BloodOath',
    crestId: 'dragon_crimson',
    level: 5,
    leader: 'LordKain',
    membersCount: 42,
    maxMembers: 80,
    desc: 'Veteranos de cerco e caçadores de Dragões Ancestrais.',
    castles: ['giran'],
    openRecruitment: true
  },
  {
    id: 'clan_imperium_sol',
    name: 'Imperium Sol',
    crestId: 'lion_gold',
    level: 7,
    leader: 'SovereignArthur',
    membersCount: 88,
    maxMembers: 120,
    desc: 'A nobreza sagrada de Aden dedicada à justiça e glória.',
    castles: ['aden'],
    openRecruitment: true
  },
  {
    id: 'clan_shadow_knights',
    name: 'ShadowKnights',
    crestId: 'wolf_shadow',
    level: 4,
    leader: 'Nocturne',
    membersCount: 29,
    maxMembers: 60,
    desc: 'Especialistas em emboscadas, PvP e domínio do submundo.',
    castles: [],
    openRecruitment: true
  },
  {
    id: 'clan_silver_phoenix',
    name: 'SilverPhoenix',
    crestId: 'eagle_silver',
    level: 3,
    leader: 'Aurelius',
    membersCount: 20,
    maxMembers: 45,
    desc: 'Irmandade em ascensão focada em evolução rápida e masmorras.',
    castles: [],
    openRecruitment: true
  }
];
