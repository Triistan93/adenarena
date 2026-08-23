/**
 * quests.js — Definições de Quests Diárias/Semanais e Battle Pass do Lineage Idle.
 * Extraído de lineage-idle/main.js (linhas 2904-2929, 2961)
 */

/**
 * Definições das quests diárias e semanais com injeção balanceada de SP.
 * Cada quest tem: id, name, desc, target, type, reward, icon
 */
export const DAILY_COMPLETION_BONUS = {
  name: 'Baú da Guilda dos Aventureiros de Aden',
  desc: 'Conclua todas as 5 missões diárias para receber o tesouro máximo da guilda.',
  reward: { gold: 50000, sp: 500, magicLamps: 2, passXp: 250 },
  icon: '🎁'
};

export const QUEST_DEFS = {
  daily: [
    { id: 'd_kills',  name: 'Caçador de Monstros',      desc: 'Derrote 50 monstros nas zonas de caça',          target: 50,     type: 'kill',   reward: { gold: 15000, sp: 150, passXp: 100 },               icon: '⚔️' },
    { id: 'd_boss',   name: 'Desafiador de Elites',      desc: 'Derrote 2 Chefes ou Monstros de Elite',          target: 2,      type: 'boss',   reward: { gold: 30000, sp: 250, magicLamps: 1, passXp: 150 }, icon: '🐉' },
    { id: 'd_craft',  name: 'Mestre da Forja',           desc: 'Realize 2 criações ou reciclagens na Forja',     target: 2,      type: 'craft',  reward: { gold: 10000, sp: 100, craftPoints: 25, passXp: 100 }, icon: '🔨' },
    { id: 'd_codex',  name: 'Relíquia de Aden',          desc: 'Registre 1 item ou absorva 1 Carta no Codex',   target: 1,      type: 'codex',  reward: { gold: 15000, sp: 150, magicLamps: 1, passXp: 100 }, icon: '📜' },
    { id: 'd_tower',  name: 'Conquistador da Torre',     desc: 'Desafie ou faça a Varredura da Torre',           target: 1,      type: 'tower',  reward: { gold: 25000, sp: 200, passXp: 100 },               icon: '🏰' }
  ],
  weekly: [
    { id: 'w_kills',  name: 'Exterminador de Aden',      desc: 'Derrote 500 monstros nas zonas de caça',         target: 500,    type: 'kill',   reward: { gold: 150000, sp: 1500, passXp: 500 },              icon: '☠️' },
    { id: 'w_bosses', name: 'Caçador de Lendas',          desc: 'Derrote 10 Chefes de Raid ou Monstros de Elite', target: 10,     type: 'boss',   reward: { gold: 250000, sp: 2500, magicLamps: 3, passXp: 600 }, icon: '👑' },
    { id: 'w_gold',   name: 'Acumulador de Fortunas',     desc: 'Acumule 250.000 de Gold através de caçadas',     target: 250000, type: 'gold',   reward: { gold: 100000, sp: 1000, magicLamps: 5, passXp: 500 }, icon: '💰' },
    { id: 'w_craft',  name: 'Grão-Mestre Ferreiro',      desc: 'Crie ou recicle 10 itens na Forja Real',         target: 10,     type: 'craft',  reward: { gold: 100000, sp: 1000, craftPoints: 100, passXp: 500 }, icon: '⚒️' }
  ]
};

/**
 * Tiers do Battle Pass.
 * Cada tier tem: level, reqXp, free (recompensa grátis), premium (recompensa premium)
 */
export const BATTLE_PASS_TIERS = [
  { level: 1,  reqXp: 100,  free: { gold: 5000 },               premium: { magicLamps: 2 }                           },
  { level: 2,  reqXp: 250,  free: { sp: 50 },                   premium: { gold: 20000 }                             },
  { level: 3,  reqXp: 450,  free: { craftPoints: 20 },          premium: { magicLamps: 3 }                           },
  { level: 4,  reqXp: 700,  free: { gold: 15000 },              premium: { sp: 150 }                                 },
  { level: 5,  reqXp: 1000, free: { magicLamps: 2 },            premium: { gold: 50000, title: 'Barão de Aden' }    },
  { level: 6,  reqXp: 1350, free: { sp: 100 },                  premium: { magicLamps: 3 }                           },
  { level: 7,  reqXp: 1750, free: { gold: 25000 },              premium: { craftPoints: 100 }                        },
  { level: 8,  reqXp: 2200, free: { magicLamps: 3 },            premium: { gold: 100000 }                            },
  { level: 9,  reqXp: 2700, free: { sp: 250 },                  premium: { magicLamps: 5 }                           },
  { level: 10, reqXp: 3300, free: { gold: 50000, magicLamps: 5 }, premium: { title: 'Lorde de Aden', gold: 200000 } }
];

/**
 * Alias de BATTLE_PASS_TIERS para compatibilidade com código legado que usa PASS_DEFS.
 * @deprecated Use BATTLE_PASS_TIERS
 */
export const PASS_DEFS = BATTLE_PASS_TIERS;

/**
 * Definições da Saga de Quests de Noblesse: Possessor of a Precious Soul (Partes 1 a 4).
 */
export const NOBLESSE_QUEST_DEFS = {
  part1: {
    id: 'quest_noblesse_part1',
    name: 'Possessor of a Precious Soul - Parte 1',
    step: 1,
    reqLvl: 75,
    npc: 'Talien (Giran)',
    desc: 'Investigue o legado dos heróis antigos com Talien em Giran. Recupere as Páginas do Poema de Eva em Valley of Saints.',
    targetKills: 25,
    targetZone: 'valleyOfSaints',
    reward: { xp: 500000, sp: 25000, gold: 100000, itemName: "Virgil's Letter" }
  },
  part2: {
    id: 'quest_noblesse_part2',
    name: 'Possessor of a Precious Soul - Parte 2',
    step: 2,
    reqLvl: 75,
    npc: 'Virgil (Rune Township)',
    desc: 'Leve a carta a Virgil em Rune e purifique as alvas corrompidas nos pântanos de Swamp of Screams.',
    targetKills: 30,
    targetZone: 'swampOfScreams',
    reward: { xp: 800000, sp: 40000, gold: 150000, itemName: 'Caradine’s Letter' }
  },
  part3: {
    id: 'quest_noblesse_part3',
    name: 'Possessor of a Precious Soul - Parte 3',
    step: 3,
    reqLvl: 75,
    npc: 'Caradine (Goddard)',
    desc: 'Ajude Caradine em Wall of Argos e enfrente o lendário Raid Boss Flame of Splendor Barakiel para recuperar o Staff of Goddess: Rain Song.',
    targetBoss: 'barakiel',
    reward: { xp: 1200000, sp: 60000, gold: 250000, itemName: 'Staff of Goddess: Rain Song' }
  },
  part4: {
    id: 'quest_noblesse_part4',
    name: 'Possessor of a Precious Soul - Parte 4',
    step: 4,
    reqLvl: 75,
    npc: 'Lady of the Lake (Coliseu / Obelisco Sagrado)',
    desc: 'Apresente o cajado sagrado à Lady of the Lake. Receba a Bênção Sagrada da Deusa Eva, a Noblesse Tiara e torne-se um Nobre oficial de Aden!',
    reward: { xp: 2000000, sp: 100000, gold: 500000, isNoblesse: true, tiara: 'accessory_noblesse_tiara', skill: 'blessing_of_noble' }
  }
};

