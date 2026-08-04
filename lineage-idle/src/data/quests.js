/**
 * quests.js — Definições de Quests Diárias/Semanais e Battle Pass do Lineage Idle.
 * Extraído de lineage-idle/main.js (linhas 2904-2929, 2961)
 */

/**
 * Definições das quests diárias e semanais.
 * Cada quest tem: id, name, desc, target, type, reward, icon
 */
export const QUEST_DEFS = {
  daily: [
    { id: 'd_kills',  name: 'Caçador de Monstros',   desc: 'Derrote 50 monstros nas zonas de caça',          target: 50,     type: 'kill',  reward: { gold: 5000,  sp: 25,  passXp: 100 },               icon: '⚔️' },
    { id: 'd_boss',   name: 'Desafiador de Elites',   desc: 'Derrote 1 Chefe ou Monstro de Elite',            target: 1,      type: 'boss',  reward: { gold: 10000, sp: 50,  passXp: 150 },               icon: '🐉' },
    { id: 'd_craft',  name: 'Mestre da Forja',         desc: 'Realize 1 criação no Craft ou roleta',           target: 1,      type: 'craft', reward: { gold: 3000,  craftPoints: 15, passXp: 100 },      icon: '🔨' },
    { id: 'd_codex',  name: 'Relíquia de Aden',        desc: 'Obtenha 1 Doll ou registre item no Codex',       target: 1,      type: 'codex', reward: { gold: 5000,  magicLamps: 1, passXp: 100 },       icon: '📜' }
  ],
  weekly: [
    { id: 'w_kills',  name: 'Exterminador de Aden',    desc: 'Derrote 400 monstros',                           target: 400,    type: 'kill',  reward: { gold: 40000, sp: 250, passXp: 500 },              icon: '☠️' },
    { id: 'w_bosses', name: 'Caçador de Lendas',        desc: 'Derrote 8 Chefes de Raid ou Elites',             target: 8,      type: 'boss',  reward: { gold: 75000, sp: 500, passXp: 600 },              icon: '👑' },
    { id: 'w_gold',   name: 'Acumulador de Fortunas',   desc: 'Ganhe 100.000 de Gold',                          target: 100000, type: 'gold',  reward: { gold: 50000, magicLamps: 3, passXp: 500 },       icon: '💰' }
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
