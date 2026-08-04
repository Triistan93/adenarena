/**
 * raids.js — Definições dos Raid Bosses do Lineage Idle.
 * Extraído de lineage-idle/main.js (linhas 2528-2534)
 */
export const RAID_BOSSES = {
  queen_ant: {
    id: 'queen_ant',
    name: 'Queen Ant 👑',
    lvl: 40, hp: 12000, atk: 180, def: 60, eva: 10,
    xp: 8000, sp: 80, gold: [4000, 8000],
    boss: true, raid: true,
    reqLvl: 30,
    desc: 'Rainha Formiga dos Ermos de Gludio. Drop: Ring of Queen Ant'
  },
  zaken: {
    id: 'zaken',
    name: 'Zaken o Pirata 🏴‍☠️',
    lvl: 60, hp: 35000, atk: 320, def: 110, eva: 15,
    xp: 25000, sp: 200, gold: [15000, 30000],
    boss: true, raid: true,
    reqLvl: 50,
    desc: 'Capitão pirata da Ilha do Diabo. Drop: Earring of Zaken'
  },
  baium: {
    id: 'baium',
    name: 'Imperador Baium ⚡',
    lvl: 80, hp: 90000, atk: 580, def: 180, eva: 12,
    xp: 90000, sp: 500, gold: [40000, 80000],
    boss: true, raid: true,
    reqLvl: 70,
    desc: 'Imperador aprisionado na Torre. Drop: Ring of Baium'
  },
  antharas: {
    id: 'antharas',
    name: 'Dragão Antharas 🐉',
    lvl: 95, hp: 220000, atk: 850, def: 280, eva: 10,
    xp: 300000, sp: 1500, gold: [150000, 350000],
    boss: true, raid: true,
    reqLvl: 85,
    desc: 'Dragão da Terra. Drops: Earring of Antharas & Dragon Slayer'
  },
  valakas: {
    id: 'valakas',
    name: 'Dragão Valakas 🔥',
    lvl: 100, hp: 450000, atk: 1200, def: 380, eva: 8,
    xp: 750000, sp: 3500, gold: [400000, 800000],
    boss: true, raid: true,
    reqLvl: 90,
    desc: 'Senhor do Vulcão. Drops: Facemask & Necklace of Valakas'
  }
};
