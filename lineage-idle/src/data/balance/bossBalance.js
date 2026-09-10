/**
 * bossBalance.js — Configurações Data-Driven de Chefes e Epic Raids do Lineage Idle.
 *
 * Centraliza estatísticas, limites de CP (minimumCP / recommendedCP),
 * mecânicas de enrage e métricas-alvo (TTK/TTD) para calibração.
 * Totalmente alinhado aos envelopes canônicos da FASE 4:
 * Early Epic (40-90s), Mid Epic (60-120s), Late Epic (75-150s), Pinnacle (90-180s).
 */

export const RAID_BOSS_BALANCE = {
  queen_ant: {
    id: 'queen_ant',
    name: 'Queen Ant 👑',
    title: 'Rainha dos Ermos de Gludio',
    lvl: 40,
    reqLvl: 30,
    minimumCP: 7750,
    recommendedCP: 11000,
    hp: 24000,
    atk: 175,
    def: 65,
    mdef: 90,
    eva: 10,
    crit: 12,
    atkSpd: 1.0,
    xp: 28000,
    sp: 350,
    gold: [15000, 30000],
    fatalSkill: {
      name: 'Erupção de Feromônio Ácido',
      triggerHps: [0.50, 0.25],
      duration: 5000,
      damageHeroPercent: 0.30
    },
    mechanics: [
      { name: 'Nuvem de Veneno Corrosivo', triggerHp: 0.75, damagePercent: 0.10, text: '⚠️ Queen Ant liberou Nuvem de Veneno Ácido!' },
      { name: 'Chamado das Formigas Nutrizes', triggerHp: 0.35, healPercent: 0.10, text: '✨ Formigas Nutrizes curaram a Rainha em +10% HP!' }
    ],
    targetMetrics: {
      ttkMin: 40,      // Early Epic Canonical TTK
      ttkMax: 90,      // Early Epic Maximum Envelope (90s)
      ttdBase: 35
    }
  },

  core: {
    id: 'core',
    name: 'Core da Torre Cruma 🔮',
    title: 'Núcleo Arcano da Civilização Antiga',
    lvl: 50,
    reqLvl: 45,
    minimumCP: 13000,
    recommendedCP: 18000,
    hp: 60000,
    atk: 230,
    def: 85,
    mdef: 115,
    eva: 12,
    crit: 14,
    atkSpd: 1.0,
    xp: 55000,
    sp: 650,
    gold: [35000, 65000],
    fatalSkill: {
      name: 'Cataclismo Quântico de Plasma',
      triggerHps: [0.50, 0.25],
      duration: 5000,
      damageHeroPercent: 0.30
    },
    mechanics: [
      { name: 'Barreira Eletromagnética', triggerHp: 0.60, damagePercent: 0.12, text: '⚡ Core ativou Barreira Refletiva causando choque em área!' },
      { name: 'Sobrecarga de Plasma', triggerHp: 0.25, damagePercent: 0.15, text: '💥 Sobrecarga de Plasma de Alta Voltagem disparada!' }
    ],
    targetMetrics: { ttkMin: 60, ttkMax: 120, ttdBase: 35 }
  },

  orfen: {
    id: 'orfen',
    name: 'Orfen das Sombras 🕷️',
    title: 'Senhora do Mar de Esporos',
    lvl: 55,
    reqLvl: 50,
    minimumCP: 18000,
    recommendedCP: 26000,
    hp: 96000,
    atk: 290,
    def: 105,
    mdef: 145,
    eva: 16,
    crit: 15,
    atkSpd: 1.05,
    xp: 90000,
    sp: 950,
    gold: [50000, 95000],
    fatalSkill: {
      name: 'Esporo Mortal Devorador de Almas',
      triggerHps: [0.50, 0.25],
      duration: 5000,
      damageHeroPercent: 0.32
    },
    mechanics: [
      { name: 'Névoa Alucinógena de Esporos', triggerHp: 0.70, damagePercent: 0.12, text: '🌫️ Orfen cobriu a arena com Névoa Venenosa de Esporos!' },
      { name: 'Teletransporte para o Ninho', triggerHp: 0.30, healPercent: 0.10, text: '🕷️ Orfen recuou para as sombras e regenerou +10% de HP!' }
    ],
    targetMetrics: { ttkMin: 60, ttkMax: 120, ttdBase: 35 }
  },

  zaken: {
    id: 'zaken',
    name: 'Capitão Zaken 🏴‍☠️',
    title: 'Senhor Imortal da Ilha do Diabo',
    lvl: 60,
    reqLvl: 55,
    minimumCP: 24000,
    recommendedCP: 35000,
    hp: 138000,
    atk: 360,
    def: 125,
    mdef: 175,
    eva: 18,
    crit: 18,
    atkSpd: 1.1,
    xp: 140000,
    sp: 1600,
    gold: [80000, 160000],
    fatalSkill: {
      name: 'Valsa Sangrenta das Trevas Eternas',
      triggerHps: [0.50, 0.25],
      duration: 5000,
      damageHeroPercent: 0.32
    },
    mechanics: [
      { name: 'Passo das Sombras', triggerHp: 0.65, damagePercent: 0.14, text: '🌑 Zaken se desmaterializou nas sombras e atacou pelas costas!' },
      { name: 'Banquete de Sangue Vampírico', triggerHp: 0.30, healPercent: 0.10, damagePercent: 0.10, text: '🩸 Banquete de Sangue: Zaken drenou sua vida!' }
    ],
    targetMetrics: { ttkMin: 60, ttkMax: 120, ttdBase: 32 }
  },

  barakiel: {
    id: 'barakiel',
    name: 'Flame of Splendor Barakiel 🔥',
    title: 'Nobre Guardião Sagrado de Goddard',
    lvl: 75,
    reqLvl: 75,
    minimumCP: 40000,
    recommendedCP: 58000,
    hp: 215000,
    atk: 420,
    def: 145,
    mdef: 195,
    eva: 14,
    crit: 18,
    atkSpd: 1.1,
    xp: 280000,
    sp: 2800,
    gold: [150000, 300000],
    fatalSkill: {
      name: 'Chama Nobre da Purificação',
      triggerHps: [0.50, 0.25],
      duration: 5000,
      damageHeroPercent: 0.32
    },
    mechanics: [
      { name: 'Aura Radiante', triggerHp: 0.50, damagePercent: 0.15, text: '🌟 Barakiel libera a Chama Nobre Sagrada!' }
    ],
    targetMetrics: { ttkMin: 75, ttkMax: 150, ttdBase: 32 }
  },

  baium: {
    id: 'baium',
    name: 'Imperador Baium ⚡',
    title: 'Soberano da Torre da Insolência',
    lvl: 75,
    reqLvl: 70,
    minimumCP: 45000,
    recommendedCP: 65000,
    hp: 330000,
    atk: 480,
    def: 165,
    mdef: 220,
    eva: 15,
    crit: 20,
    atkSpd: 1.15,
    xp: 320000,
    sp: 3200,
    gold: [180000, 360000],
    fatalSkill: {
      name: 'Juízo do Titã Imperial',
      triggerHps: [0.50, 0.25],
      duration: 5000,
      damageHeroPercent: 0.35
    },
    mechanics: [
      { name: 'Punho Esmagador dos Trovões', triggerHp: 0.70, damagePercent: 0.15, text: '⚡ Baium desferiu o Punho Esmagador dos Trovões!' },
      { name: 'Fúria da Divindade Aprisionada', triggerHp: 0.30, damagePercent: 0.18, text: '🌩️ Fúria Imperial: Baium aumentou seu poder de ataque massivamente!' }
    ],
    targetMetrics: { ttkMin: 75, ttkMax: 150, ttdBase: 30 }
  },

  frintezza: {
    id: 'frintezza',
    name: 'Príncipe Frintezza & Halisha 🎻',
    title: 'Maestro do Sepulcro Imperial',
    lvl: 85,
    reqLvl: 80,
    minimumCP: 60000,
    recommendedCP: 85000,
    hp: 470000,
    atk: 500,
    def: 195,
    mdef: 260,
    eva: 16,
    crit: 22,
    atkSpd: 1.2,
    xp: 680000,
    sp: 5800,
    gold: [350000, 700000],
    fatalSkill: {
      name: 'Sinfonia Apocalíptica de Halisha',
      triggerHps: [0.50, 0.25],
      duration: 5000,
      damageHeroPercent: 0.35
    },
    mechanics: [
      { name: 'Réquiem da Hipnose', triggerHp: 0.65, damagePercent: 0.14, text: '🎼 A melodia de Frintezza confunde seus sentidos!' },
      { name: 'Transformação Demoníaca de Halisha', triggerHp: 0.25, damagePercent: 0.18, text: '👹 Scarlet van Halisha assume sua Forma de Demônio Alado!' }
    ],
    targetMetrics: { ttkMin: 75, ttkMax: 150, ttdBase: 28 }
  },

  antharas: {
    id: 'antharas',
    name: 'Dragão da Terra Antharas 🐉',
    title: 'Senhor dos Abismos Subterrâneos',
    lvl: 95,
    reqLvl: 85,
    minimumCP: 80000,
    recommendedCP: 115000,
    hp: 670000,
    atk: 600,
    def: 240,
    mdef: 310,
    eva: 12,
    crit: 24,
    atkSpd: 1.25,
    xp: 1400000,
    sp: 12000,
    gold: [700000, 1400000],
    fatalSkill: {
      name: 'Colapso Geológico Ancestral',
      triggerHps: [0.50, 0.20],
      duration: 5000,
      damageHeroPercent: 0.35
    },
    mechanics: [
      { name: 'Terremoto Fóssil', triggerHp: 0.70, damagePercent: 0.14, text: '🌋 Terremoto Fóssil: O chão estremece causando dano maciço!' },
      { name: 'Rugido do Pavor Ancestral', triggerHp: 0.35, damagePercent: 0.16, text: '🐉 Rugido Aterrorizante de Antharas rompe as defesas!' }
    ],
    targetMetrics: { ttkMin: 90, ttkMax: 180, ttdBase: 25 }
  },

  valakas: {
    id: 'valakas',
    name: 'Dragão do Fogo Valakas 🔥',
    title: 'Senhor Supremo do Vulcão Forja dos Deuses',
    lvl: 100,
    reqLvl: 90,
    minimumCP: 105000,
    recommendedCP: 150000,
    hp: 1500000,
    atk: 680,
    def: 280,
    mdef: 360,
    eva: 15,
    crit: 25,
    atkSpd: 1.3,
    xp: 2500000,
    sp: 25000,
    gold: [1500000, 3000000],
    fatalSkill: {
      name: 'Meteoro da Extinção Dracônica',
      triggerHps: [0.50, 0.20],
      duration: 5000,
      damageHeroPercent: 0.35
    },
    mechanics: [
      { name: 'Sopro Infernal', triggerHp: 0.70, damagePercent: 0.12, text: '🔥 Sopro de Fogo Primordial reduz defesas a cinzas!' },
      { name: 'Inferno Vulcânico', triggerHp: 0.35, damagePercent: 0.14, text: '🌋 Vulcão entra em Erupção Máxima!' }
    ],
    targetMetrics: { ttkMin: 90, ttkMax: 180, ttdBase: 22 }
  }
};

/**
 * Retorna os dados de balanceamento de um chefe de raid específico.
 * @param {string} raidId 
 * @returns {Object|null}
 */
export function getRaidBossBalance(raidId) {
  return RAID_BOSS_BALANCE[raidId] || null;
}

export const getBossBalance = getRaidBossBalance;

/**
 * Retorna se o herói possui CP suficiente para ingressar na raid.
 * @param {number} heroCP 
 * @param {string} raidId 
 * @returns {boolean}
 */
export function canEnterRaid(heroCP, raidId) {
  const boss = getRaidBossBalance(raidId);
  if (!boss) return true;
  return Number(heroCP) >= (boss.minimumCP || 0);
}
