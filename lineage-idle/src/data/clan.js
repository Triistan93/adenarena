/**
 * clan.js — Definições e Regras de Clãs do Lineage Idle.
 *
 * Contém a progressão de Nível de Clã (1 a 5), Habilidades de Clã (Clan Skills),
 * custos de evolução e requisitos para participação em Siege de Castelos.
 */

export const CLAN_LEVEL_DATA = {
  1: {
    level: 1,
    title: 'Clã Iniciante',
    reqCharLevel: 20,
    costAdena: 100000,
    costSp: 10000,
    reqItem: null,
    maxMembers: 15,
    unlockedSkills: ['clan_imperium'],
    desc: 'Fundação do Clã. Desbloqueia o Brasão e a habilidade Clan Imperium (+HP/CP).'
  },
  2: {
    level: 2,
    title: 'Clã Veterano',
    reqCharLevel: 40,
    costAdena: 500000,
    costSp: 50000,
    reqItem: null,
    maxMembers: 30,
    unlockedSkills: ['clan_might'],
    desc: 'Aumenta a força militar. Desbloqueia a habilidade Clan Might (+P.Atk).'
  },
  3: {
    level: 3,
    title: 'Clã de Cavaleiros',
    reqCharLevel: 55,
    costAdena: 2000000,
    costSp: 200000,
    reqItem: { id: 'blood_mark', name: 'Marca de Sangue (Blood Mark)', count: 1 },
    maxMembers: 60,
    unlockedSkills: ['clan_shield'],
    desc: 'Clã reconhecido pelos nobres. Desbloqueia a habilidade Clan Shield (+P.Def).'
  },
  4: {
    level: 4,
    title: 'Aliança de Guerra',
    reqCharLevel: 70,
    costAdena: 10000000,
    costSp: 500000,
    reqItem: { id: 'alliance_manifesto', name: 'Manifesto da Aliança', count: 1 },
    maxMembers: 100,
    unlockedSkills: ['clan_empower', 'clan_magic_barrier'],
    desc: 'Poder arcano e bélico superior. Desbloqueia Clan Empower (+M.Atk) e Clan Magic Barrier (+M.Def).'
  },
  5: {
    level: 5,
    title: 'Ordem Imperial do Reino',
    reqCharLevel: 76,
    costAdena: 25000000,
    costSp: 1500000,
    reqItem: { id: 'seal_of_aspiration', name: 'Selo da Aspiração (Seal of Aspiration)', count: 1 },
    maxMembers: 150,
    unlockedSkills: ['clan_vitality'],
    desc: 'O ápice da nobreza. Desbloqueia Clan Vitality (+Regeneração/Speed) e autorização para declarar Cerco a Castelos (Castle Sieges)!'
  }
};

export const CLAN_SKILLS = {
  clan_imperium: {
    id: 'clan_imperium',
    name: 'Clan Imperium 🛡️',
    levelReq: 1,
    icon: 'gradespecial/scrolls/scroll_blessed_armor_s.png',
    desc: 'Aumenta a constituição e fortitude dos membros em +10% Max HP e +15% Max CP.',
    stats: { hpPercent: 0.10, cpPercent: 0.15 }
  },
  clan_might: {
    id: 'clan_might',
    name: 'Clan Might ⚔️',
    levelReq: 2,
    icon: 'gradespecial/scrolls/scroll_enchant_weapon_a.png',
    desc: 'Aumenta a força marcial em +8% P.Atk físico.',
    stats: { pAtkPercent: 0.08 }
  },
  clan_shield: {
    id: 'clan_shield',
    name: 'Clan Shield 🛡️',
    levelReq: 3,
    icon: 'gradespecial/scrolls/scroll_enchant_armor_a.png',
    desc: 'Reforça as armaduras e barreiras em +10% P.Def física.',
    stats: { pDefPercent: 0.10 }
  },
  clan_empower: {
    id: 'clan_empower',
    name: 'Clan Empower 🔮',
    levelReq: 4,
    icon: 'gradespecial/scrolls/scroll_enchant_weapon_s.png',
    desc: 'Canaliza correntes místicas aumentando o poder mágico em +10% M.Atk.',
    stats: { mAtkPercent: 0.10 }
  },
  clan_magic_barrier: {
    id: 'clan_magic_barrier',
    name: 'Clan Magic Barrier 🌌',
    levelReq: 4,
    icon: 'gradespecial/scrolls/scroll_blessed_armor_s.png',
    desc: 'Cria um véu protetor aumentando a defesa mágica em +12% M.Def.',
    stats: { mDefPercent: 0.12 }
  },
  clan_vitality: {
    id: 'clan_vitality',
    name: 'Clan Vitality 💚',
    levelReq: 5,
    icon: 'gradespecial/potions/potion_mana_xl.png',
    desc: 'Vigor vital inesgotável: +20% na velocidade de regeneração de HP/MP e +5 de Velocidade de Movimento.',
    stats: { regenPercent: 0.20, speedBonus: 5 }
  }
};
