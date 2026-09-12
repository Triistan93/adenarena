/**
 * raids.js — Definições dos Raid Bosses e Masmorras Diárias do Lineage Idle.
 *
 * Contém os 8 Chefes Épicos canônicos de Lineage II:
 * 1. Queen Ant (Lv. 40 - Ermos de Gludio)
 * 2. Core (Lv. 50 - Torre Cruma)
 * 3. Orfen (Lv. 55 - Mar de Esporos)
 * 4. Zaken (Lv. 60 - Navio Pirata da Ilha do Diabo)
 * 5. Imperador Baium (Lv. 75 - Torre da Insolência)
 * 6. Frintezza & Scarlet van Halisha (Lv. 85 - Sepulcro Imperial)
 * 7. Dragão Antharas (Lv. 95 - Covil do Dragão da Terra)
 * 8. Dragão Valakas (Lv. 100 - Vulcão Forja dos Deuses)
 */

import { RAID_BOSS_BALANCE } from './balance/bossBalance.js';

export const RAID_BOSSES = {
  queen_ant: {
    id: 'queen_ant',
    name: 'Queen Ant 👑',
    title: 'Rainha dos Ermos de Gludio',
    lvl: 40,
    hp: 35000,
    atk: 220,
    def: 75,
    mdef: 110,
    eva: 10,
    crit: 12,
    xp: 28000,
    sp: 350,
    gold: [15000, 30000],
    boss: true,
    raid: true,
    reqLvl: 30,
    icon: 'gradespecial/jewels/jewel_ring_queen_ant.png',
    bg: 'dungeon_wastelands',
    desc: 'Rainha das Formigas Gigantes. Enxames de operárias a curam enquanto ela espalha veneno ácido corrosivo.',
    fatalSkill: {
      name: 'Erupção de Feromônio Ácido',
      triggerHps: [0.50, 0.25],
      duration: 5000,
      damageHeroPercent: 0.60
    },
    mechanics: [
      { name: 'Nuvem de Veneno Corrosivo', triggerHp: 0.75, damagePercent: 0.15, text: '⚠️ Queen Ant liberou Nuvem de Veneno Ácido!' },
      { name: 'Chamado das Formigas Nutrizes', triggerHp: 0.35, healPercent: 0.20, text: '✨ Formigas Nutrizes curaram a Rainha em +20% HP!' }
    ],
    drops: [
      { itemId: 'jewel_ring_queen_ant', name: 'Ring of Queen Ant', chance: 0.25, isEpicJewel: true },
      { itemId: 'scroll_blessed_armor', name: 'Blessed Scroll: Enchant Armor', chance: 0.40 },
      { itemId: 'scroll_blessed_weapon', name: 'Blessed Scroll: Enchant Weapon', chance: 0.25 },
      { itemId: 'adena_coins', count: 10, name: '10x Aden Coins (AC)', chance: 0.50 }
    ]
  },

  core: {
    id: 'core',
    name: 'Core da Torre Cruma 🔮',
    title: 'Núcleo Arcano da Civilização Antiga',
    lvl: 50,
    hp: 65000,
    atk: 340,
    def: 115,
    mdef: 160,
    eva: 12,
    crit: 14,
    xp: 55000,
    sp: 650,
    gold: [35000, 65000],
    boss: true,
    raid: true,
    reqLvl: 45,
    icon: 'gradespecial/jewels/jewel_ring_core.png',
    bg: 'dungeon_cruma',
    desc: 'O núcleo consciente deixado pelos Titãs no coração da Torre Cruma. Dispara rajadas de plasma e barreira refletiva.',
    fatalSkill: {
      name: 'Cataclismo Quântico de Plasma',
      triggerHps: [0.50, 0.25],
      duration: 5000,
      damageHeroPercent: 0.60
    },
    mechanics: [
      { name: 'Barreira Eletromagnética', triggerHp: 0.60, damagePercent: 0.20, text: '⚡ Core ativou Barreira Refletiva causando choque em área!' },
      { name: 'Sobrecarga de Plasma', triggerHp: 0.25, damagePercent: 0.30, text: '💥 Sobrecarga de Plasma de Alta Voltagem disparada!' }
    ],
    drops: [
      { itemId: 'jewel_ring_core', name: 'Ring of Core', chance: 0.25, isEpicJewel: true },
      { itemId: 'scroll_blessed_armor', name: 'Blessed Scroll: Enchant Armor', chance: 0.45 },
      { itemId: 'scroll_blessed_weapon', name: 'Blessed Scroll: Enchant Weapon', chance: 0.30 },
      { itemId: 'adena_coins', count: 15, name: '15x Aden Coins (AC)', chance: 0.50 }
    ]
  },

  orfen: {
    id: 'orfen',
    name: 'Orfen das Sombras 🕷️',
    title: 'Senhora do Mar de Esporos',
    lvl: 55,
    hp: 95000,
    atk: 420,
    def: 145,
    mdef: 210,
    eva: 18,
    crit: 16,
    xp: 90000,
    sp: 950,
    gold: [50000, 95000],
    boss: true,
    raid: true,
    reqLvl: 50,
    icon: 'gradespecial/jewels/jewel_earring_orfen.png',
    bg: 'dungeon_sea_of_spores',
    desc: 'Aracnídea gigante mutante que controla os fungos e esporos venenosos. Teletransporta-se para o ninho ao sofrer dano.',
    fatalSkill: {
      name: 'Esporo Mortal Devorador de Almas',
      triggerHps: [0.50, 0.25],
      duration: 5000,
      damageHeroPercent: 0.60
    },
    mechanics: [
      { name: 'Névoa Alucinógena de Esporos', triggerHp: 0.70, damagePercent: 0.18, text: '🌫️ Orfen cobriu a arena com Névoa Venenosa de Esporos!' },
      { name: 'Teletransporte para o Ninho', triggerHp: 0.30, healPercent: 0.15, text: '🕷️ Orfen recuou para as sombras e regenerou +15% de HP!' }
    ],
    drops: [
      { itemId: 'jewel_earring_orfen', name: 'Earring of Orfen', chance: 0.25, isEpicJewel: true },
      { itemId: 'scroll_blessed_armor', name: 'Blessed Scroll: Enchant Armor', chance: 0.50 },
      { itemId: 'scroll_blessed_weapon', name: 'Blessed Scroll: Enchant Weapon', chance: 0.35 },
      { itemId: 'adena_coins', count: 20, name: '20x Aden Coins (AC)', chance: 0.50 }
    ]
  },

  zaken: {
    id: 'zaken',
    name: 'Capitão Zaken 🏴‍☠️',
    title: 'Senhor Imortal da Ilha do Diabo',
    lvl: 60,
    hp: 140000,
    atk: 520,
    def: 175,
    mdef: 250,
    eva: 22,
    crit: 18,
    xp: 140000,
    sp: 1600,
    gold: [80000, 160000],
    boss: true,
    raid: true,
    reqLvl: 55,
    icon: 'gradespecial/jewels/jewel_earring_of_zaken.png',
    bg: 'dungeon_devils_isle',
    desc: 'Capitão pirata amaldiçoado com vampirismo eterno no interior do Galeão Fantasma da Ilha do Diabo.',
    fatalSkill: {
      name: 'Valsa Sangrenta das Trevas Eternas',
      triggerHps: [0.50, 0.25],
      duration: 5000,
      damageHeroPercent: 0.60
    },
    mechanics: [
      { name: 'Passo das Sombras', triggerHp: 0.65, damagePercent: 0.22, text: '🌑 Zaken se desmaterializou nas sombras e atacou pelas costas!' },
      { name: 'Banquete de Sangue Vampírico', triggerHp: 0.30, healPercent: 0.20, damagePercent: 0.15, text: '🩸 Banquete de Sangue: Zaken drenou sua vida e recuperou +20% HP!' }
    ],
    drops: [
      { itemId: 'jewel_earring_of_zaken', name: 'Earring of Zaken', chance: 0.25, isEpicJewel: true },
      { itemId: 'armor_zaken_cloack', name: 'Capa Pirata de Zaken', chance: 0.30 },
      { itemId: 'scroll_blessed_weapon', name: 'Blessed Scroll: Enchant Weapon', chance: 0.40 },
      { itemId: 'adena_coins', count: 25, name: '25x Aden Coins (AC)', chance: 0.50 }
    ]
  },

  baium: {
    id: 'baium',
    name: 'Imperador Baium ⚡',
    title: 'Soberano da Torre da Insolência',
    lvl: 75,
    hp: 260000,
    atk: 750,
    def: 230,
    mdef: 330,
    eva: 15,
    crit: 20,
    xp: 320000,
    sp: 3200,
    gold: [180000, 360000],
    boss: true,
    raid: true,
    reqLvl: 70,
    icon: 'gradespecial/jewels/jewel_ring_of_baium.png',
    bg: 'dungeon_tower_of_insolence',
    desc: 'O antigo Imperador de Elmore-Aden petrificado pelos deuses no 14º andar da Torre da Insolência.',
    fatalSkill: {
      name: 'Juízo do Titã Imperial',
      triggerHps: [0.50, 0.25],
      duration: 5000,
      damageHeroPercent: 0.60
    },
    mechanics: [
      { name: 'Punho Esmagador dos Trovões', triggerHp: 0.70, damagePercent: 0.25, text: '⚡ Baium desferiu o Punho Esmagador dos Trovões!' },
      { name: 'Fúria da Divindade Aprisionada', triggerHp: 0.30, damagePercent: 0.35, text: '🌩️ Fúria Imperial: Baium aumentou seu poder de ataque massivamente!' }
    ],
    drops: [
      { itemId: 'jewel_ring_of_baium', name: 'Ring of Baium', chance: 0.25, isEpicJewel: true },
      { itemId: 'weapon_samurai_longsword', name: 'Samurai Longsword +5', chance: 0.35 },
      { itemId: 'scroll_blessed_weapon', name: 'Blessed Scroll: Enchant Weapon', chance: 0.50 },
      { itemId: 'adena_coins', count: 50, name: '50x Aden Coins (AC)', chance: 0.50 }
    ]
  },

  frintezza: {
    id: 'frintezza',
    name: 'Príncipe Frintezza & Halisha 🎻',
    title: 'Maestro do Sepulcro Imperial',
    lvl: 85,
    hp: 420000,
    atk: 1050,
    def: 310,
    mdef: 440,
    eva: 18,
    crit: 22,
    xp: 680000,
    sp: 5800,
    gold: [350000, 700000],
    boss: true,
    raid: true,
    reqLvl: 80,
    icon: 'gradespecial/jewels/jewel_necklace_of_frintezza.png',
    bg: 'dungeon_imperial_tomb',
    desc: 'Príncipe amaldiçoado tocando seu órgão sombrio enquanto seu campeão demoníaco Scarlet van Halisha massacra invasores.',
    fatalSkill: {
      name: 'Sinfonia Apocalíptica de Halisha',
      triggerHps: [0.50, 0.25],
      duration: 5000,
      damageHeroPercent: 0.60
    },
    mechanics: [
      { name: 'Réquiem da Hipnose', triggerHp: 0.65, damagePercent: 0.25, text: '🎼 A melodia de Frintezza confunde seus sentidos e drena suas forças!' },
      { name: 'Transformação Demoníaca de Halisha', triggerHp: 0.25, damagePercent: 0.40, text: '👹 Scarlet van Halisha assume sua Forma de Demônio Alado!' }
    ],
    drops: [
      { itemId: 'jewel_necklace_of_frintezza', name: 'Necklace of Frintezza', chance: 0.25, isEpicJewel: true },
      { itemId: 'weapon_frost_lord_sword', name: 'Frost Lord Sword (Tier 6 Apex)', chance: 0.20 },
      { itemId: 'scroll_blessed_weapon', name: 'Blessed Scroll: Enchant Weapon', chance: 0.55 },
      { itemId: 'adena_coins', count: 75, name: '75x Aden Coins (AC)', chance: 0.50 }
    ]
  },

  antharas: {
    id: 'antharas',
    name: 'Dragão da Terra Antharas 🐉',
    title: 'Senhor dos Abismos Subterrâneos',
    lvl: 95,
    hp: 750000,
    atk: 1450,
    def: 410,
    mdef: 590,
    eva: 12,
    crit: 24,
    xp: 1400000,
    sp: 12000,
    gold: [700000, 1400000],
    boss: true,
    raid: true,
    reqLvl: 85,
    icon: 'gradespecial/jewels/jewel_earring_of_antharas.png',
    bg: 'dungeon_antharas_lair',
    desc: 'O terrível Dragão da Terra guardião das profundezas de Giran. Seus tremores abalam montanhas e petrificam exércitos.',
    fatalSkill: {
      name: 'Colapso Geológico Ancestral',
      triggerHps: [0.50, 0.25],
      duration: 5000,
      damageHeroPercent: 0.60
    },
    mechanics: [
      { name: 'Terremoto Fóssil', triggerHp: 0.70, damagePercent: 0.30, text: '🌋 Terremoto Fóssil: O chão estremece causando dano maciço!' },
      { name: 'Rugido do Pavor Ancestral', triggerHp: 0.35, damagePercent: 0.40, text: '🐉 Rugido Aterrorizante de Antharas rompe as barreiras de defesa!' }
    ],
    drops: [
      { itemId: 'jewel_earring_of_antharas', name: 'Earring of Antharas', chance: 0.25, isEpicJewel: true },
      { itemId: 'weapon_frost_lord_two_hand_sword', name: 'Frost Lord Greatsword (Tier 6 Apex)', chance: 0.25 },
      { itemId: 'scroll_blessed_weapon', name: 'Blessed Scroll: Enchant Weapon', chance: 0.60 },
      { itemId: 'adena_coins', count: 100, name: '100x Aden Coins (AC)', chance: 0.50 }
    ]
  },

  valakas: {
    id: 'valakas',
    name: 'Dragão do Fogo Valakas 🔥',
    title: 'Senhor Supremo do Vulcão Forja dos Deuses',
    lvl: 100,
    hp: 1250000,
    atk: 1950,
    def: 510,
    mdef: 740,
    eva: 15,
    crit: 25,
    xp: 2500000,
    sp: 25000,
    gold: [1500000, 3000000],
    boss: true,
    raid: true,
    reqLvl: 90,
    icon: 'gradespecial/jewels/jewel_necklace_of_valakas.png',
    bg: 'dungeon_valakas_volcano',
    desc: 'A criatura mais poderosa de Aden. Habita a caldeira de lava da Forja dos Deuses, incinerando quem ousa desafi-lo.',
    fatalSkill: {
      name: 'Extinção Solar do Dragão Flamejante',
      triggerHps: [0.50, 0.25],
      duration: 5000,
      damageHeroPercent: 0.60
    },
    mechanics: [
      { name: 'Chuva de Meteoros Incandescentes', triggerHp: 0.75, damagePercent: 0.30, text: '☄️ Chuva de Meteoros de Valakas incinera toda a arena!' },
      { name: 'Sopro Infernal do Vulcão', triggerHp: 0.40, damagePercent: 0.45, text: '🔥 Sopro de Chamas Eternas atinge em cheio com poder colossal!' },
      { name: 'Aura da Caldeira Ardente', triggerHp: 0.15, damagePercent: 0.50, text: '🌋 Valakas entra em Fúria Vulcânica Máxima!' }
    ],
    drops: [
      { itemId: 'jewel_necklace_of_valakas', name: 'Necklace of Valakas', chance: 0.25, isEpicJewel: true },
      { itemId: 'jewel_ring_of_valakas', name: 'Ring of Valakas', chance: 0.25, isEpicJewel: true },
      { itemId: 'armor_valakas_cloack', name: 'Valakas Dragon Cloak', chance: 0.35 },
      { itemId: 'valakas_mask', name: 'Máscara Flamejante de Valakas', chance: 0.40 },
      { itemId: 'scroll_blessed_weapon', name: 'Blessed Scroll: Enchant Weapon', chance: 0.75 },
      { itemId: 'adena_coins', count: 150, name: '150x Aden Coins (AC)', chance: 0.60 }
    ]
  },

  barakiel: {
    id: 'barakiel',
    name: 'Flame of Splendor Barakiel 🔥',
    title: 'Guardião do Cajado da Deusa (Noblesse Quest)',
    lvl: 75,
    hp: 180000,
    atk: 520,
    def: 180,
    mdef: 240,
    eva: 15,
    crit: 16,
    xp: 150000,
    sp: 1800,
    gold: [50000, 100000],
    boss: true,
    raid: true,
    isBarakiel: true,
    reqLvl: 75,
    icon: 'gradespecial/scrolls/scroll_enchant_weapon_s.png',
    bg: 'dungeon_goddard',
    desc: 'Lorde flamejante de Wall of Argos. Derrotá-lo é o teste definitivo da Parte 3 da Quest de Noblesse para obter o Cajado da Deusa.',
    fatalSkill: {
      name: 'Chamas da Glória Nobre',
      triggerHps: [0.50, 0.25],
      duration: 5000,
      damageHeroPercent: 0.60
    },
    mechanics: [
      { name: 'Explosão de Chamas Solares', triggerHp: 0.60, damagePercent: 0.20, text: '🔥 Barakiel conjurou Explosão de Chamas Solares!' },
      { name: 'Barreira de Fogo Puro', triggerHp: 0.25, healPercent: 0.15, text: '🛡️ Barakiel invocou a Barreira de Fogo Puro!' }
    ],
    drops: [
      { itemId: 'staff_goddess_rain_song', name: 'Staff of Goddess: Rain Song', chance: 1.0 },
      { itemId: 'scroll_blessed_universal', name: 'Pergaminho Abençoado Universal', chance: 1.0 },
      { itemId: 'scroll_blessed_weapon', name: 'Pergaminho Abençoado de Arma', chance: 0.50 },
      { itemId: 'adena_coins', count: 30, name: '30x Aden Coins (AC)', chance: 0.50 }
    ]
  }
};

// Merge calibrated stats, minimumCP, and recommendedCP from RAID_BOSS_BALANCE
for (const [key, balancedBoss] of Object.entries(RAID_BOSS_BALANCE)) {
  if (RAID_BOSSES[key]) {
    Object.assign(RAID_BOSSES[key], {
      minimumCP: balancedBoss.minimumCP,
      recommendedCP: balancedBoss.recommendedCP,
      hp: balancedBoss.hp,
      atk: balancedBoss.atk,
      def: balancedBoss.def,
      mdef: balancedBoss.mdef,
      fatalSkill: balancedBoss.fatalSkill || RAID_BOSSES[key].fatalSkill,
      mechanics: balancedBoss.mechanics || RAID_BOSSES[key].mechanics,
      targetMetrics: balancedBoss.targetMetrics
    });
  }
}
