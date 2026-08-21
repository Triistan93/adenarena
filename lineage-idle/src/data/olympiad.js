/**
 * olympiad.js — Definições de Armas Infinity de Herói, Habilidades Heroicas,
 * Gladiadores de Arena e Catálogo da Loja de Olimpíadas.
 */

export const INFINITY_WEAPONS = {
  weapon_infinity_blade: {
    id: 'weapon_infinity_blade',
    name: 'Infinity Blade 👑',
    slot: 'weapon',
    tier: 6,
    rarity: 'legendary',
    atk: 280,
    matk: 190,
    crit: 12,
    def: 60,
    hp: 500,
    mp: 250,
    req: { level: 76, isHero: true },
    price: 1000000,
    icon: 'gradespecial/weapons/zaken_sword.png',
    desc: 'Espada de Herói da Grand Olympiad: +280 P.Atk, +190 M.Atk, +12% Crit, +60 P.Def, +500 HP e Chance de Cancelar Buffs do Oponente.'
  },
  weapon_infinity_cleaver: {
    id: 'weapon_infinity_cleaver',
    name: 'Infinity Cleaver 👑',
    slot: 'weapon',
    tier: 6,
    rarity: 'legendary',
    atk: 345,
    matk: 190,
    crit: 15,
    critDmg: 0.30,
    hp: 750,
    req: { level: 76, isHero: true },
    price: 1000000,
    icon: 'gradespecial/weapons/orfen_twohanded_sword.png',
    desc: 'Espada de Duas Mãos do Herói: +345 P.Atk, +30% Dano Crítico, +15% Crit e +750 HP.'
  },
  weapon_infinity_axe: {
    id: 'weapon_infinity_axe',
    name: 'Infinity Axe 👑',
    slot: 'weapon',
    tier: 6,
    rarity: 'legendary',
    atk: 280,
    matk: 190,
    crit: 10,
    stunChance: 25,
    hp: 600,
    req: { level: 76, isHero: true },
    price: 1000000,
    icon: 'gradespecial/weapons/weapon_frost_lord_axe.png',
    desc: 'Machado de Guerra do Herói: +280 P.Atk, +25% Chance de Atordoamento (Stun), +10% Crit e +600 HP.'
  },
  weapon_infinity_rod: {
    id: 'weapon_infinity_rod',
    name: 'Infinity Rod 👑',
    slot: 'weapon',
    tier: 6,
    rarity: 'legendary',
    atk: 175,
    matk: 360,
    crit: 8,
    castSpeed: 20,
    mpRegen: 15,
    mp: 600,
    req: { level: 76, isHero: true },
    price: 1000000,
    icon: 'gradespecial/weapons/imperial_staff.png',
    desc: 'Cajado Mágico do Herói: +360 M.Atk, +20% Velocidade de Conjuração (Cast Spd), +15 MP Regen e +600 MP.'
  },
  weapon_infinity_bow: {
    id: 'weapon_infinity_bow',
    name: 'Infinity Bow 👑',
    slot: 'weapon',
    tier: 6,
    rarity: 'legendary',
    atk: 395,
    matk: 190,
    crit: 18,
    critDmg: 0.25,
    speed: 15,
    req: { level: 76, isHero: true },
    price: 1000000,
    icon: 'gradespecial/weapons/draconic_bow.png',
    desc: 'Arco Imperial do Herói: +395 P.Atk, +18% Crit, +25% Dano Crítico, +15 Velocidade de Movimento e Disparo Perfurante.'
  },
  weapon_infinity_dagger: {
    id: 'weapon_infinity_dagger',
    name: 'Infinity Dagger 👑',
    slot: 'weapon',
    tier: 6,
    rarity: 'legendary',
    atk: 255,
    matk: 190,
    crit: 22,
    eva: 18,
    atkSpeed: 15,
    req: { level: 76, isHero: true },
    price: 1000000,
    icon: 'gradespecial/weapons/baium_dagger.png',
    desc: 'Adaga Mortal do Herói: +255 P.Atk, +22% Crit, +18 Evasão, +15% Velocidade de Ataque e Golpe Letal.'
  },
  weapon_infinity_spear: {
    id: 'weapon_infinity_spear',
    name: 'Infinity Spear 👑',
    slot: 'weapon',
    tier: 6,
    rarity: 'legendary',
    atk: 295,
    matk: 190,
    crit: 12,
    aoeDmg: 0.30,
    hp: 600,
    req: { level: 76, isHero: true },
    price: 1000000,
    icon: 'gradespecial/weapons/gorde_spear.png',
    desc: 'Lança de Titã do Herói: +295 P.Atk, +30% Dano em Área (AoE), +12% Crit e +600 HP.'
  },
  weapon_infinity_duals: {
    id: 'weapon_infinity_duals',
    name: 'Infinity Dual Swords 👑',
    slot: 'weapon',
    tier: 6,
    rarity: 'legendary',
    atk: 340,
    matk: 190,
    crit: 16,
    atkSpeed: 20,
    hp: 550,
    req: { level: 76, isHero: true },
    price: 1000000,
    icon: 'gradespecial/weapons/juriel_dual_sword.png',
    desc: 'Lâminas Duplas do Herói: +340 P.Atk, +20% Velocidade de Ataque (Atk Spd), +16% Crit e +550 HP.'
  }
};

export const HEROIC_SKILLS = {
  heroic_valor: {
    id: 'heroic_valor',
    name: 'Heroic Valor 👑',
    type: 'buff',
    cd: 60000,
    duration: 120000,
    desc: 'Eleva a coragem de Herói: Concede +250 P.Atk, +300 M.Atk e +500 P.Def por 2 minutos.',
    stats: { atk: 250, matk: 300, def: 500 }
  },
  heroic_miracle: {
    id: 'heroic_miracle',
    name: 'Heroic Miracle 🛡️',
    type: 'buff',
    cd: 90000,
    duration: 30000,
    desc: 'Milagre Heroico da Deusa: Concede +5.400 P.Def e +4.050 M.Def com resistência extrema por 30s.',
    stats: { def: 5400, mdef: 4050 }
  },
  heroic_berserker: {
    id: 'heroic_berserker',
    name: 'Heroic Berserker ⚡',
    type: 'buff',
    cd: 60000,
    duration: 60000,
    desc: 'Fúria Destrutiva do Herói: +50% Velocidade de Ataque e Conjuração, +100 Velocidade.',
    stats: { atkSpeed: 50, castSpeed: 50, speed: 100 }
  },
  heroic_grandeur: {
    id: 'heroic_grandeur',
    name: 'Heroic Grandeur 💥',
    type: 'debuff',
    cd: 45000,
    desc: 'Presença Majestosa: Reduz P.Def e M.Def dos inimigos ao redor em 30% por 30 segundos.',
    debuff: { defReduce: 0.30, mdefReduce: 0.30 }
  }
};

export const OLYMPIAD_GLADIATORS = [
  { id: 'glad_1', name: 'Gladiador Kaelen', title: 'Duelist de Giran', lvl: 76, hp: 22000, atk: 480, def: 380, mdef: 310, class: 'duelist', elo: 1000 },
  { id: 'glad_2', name: 'Paladino Vorn', title: 'Phoenix Knight Sagrado', lvl: 77, hp: 28000, atk: 430, def: 520, mdef: 410, class: 'phoenix_knight', elo: 1100 },
  { id: 'glad_3', name: 'Arqueira Lyra', title: 'Sagittarius das Sombras', lvl: 78, hp: 19500, atk: 560, def: 340, mdef: 290, class: 'sagittarius', elo: 1200 },
  { id: 'glad_4', name: 'Maga Xyris', title: 'Archmage do Fogo Arcano', lvl: 79, hp: 18000, atk: 250, matk: 620, def: 320, mdef: 450, class: 'archmage', elo: 1300 },
  { id: 'glad_5', name: 'Assassino Draven', title: 'Adventurer Letal', lvl: 80, hp: 21000, atk: 520, def: 360, mdef: 320, class: 'adventurer', elo: 1400 },
  { id: 'glad_6', name: 'Lorde Valerius', title: 'Titan Enfurecido', lvl: 82, hp: 35000, atk: 610, def: 420, mdef: 330, class: 'titan', elo: 1500 },
  { id: 'glad_7', name: 'Feiticeiro Morvath', title: 'Soultaker Necromancer', lvl: 83, hp: 20500, atk: 260, matk: 680, def: 350, mdef: 480, class: 'soultaker', elo: 1600 },
  { id: 'glad_8', name: 'Duelista Zarek', title: 'Lorde Grand Khavatari', lvl: 85, hp: 32000, atk: 670, def: 460, mdef: 390, class: 'grand_khavatari', elo: 1750 }
];

export const OLYMPIAD_SHOP_CATALOG = [
  {
    id: 'giants_codex',
    name: "Giant's Codex",
    priceTokens: 500,
    icon: 'gradespecial/items/giants_codex.png',
    desc: 'Livro lendário dos Gigantes necessário para encantar habilidades além do limite máximo.',
    reward: { itemId: 'giants_codex', count: 1 }
  },
  {
    id: 'blessed_scroll_weapon_s',
    name: 'Blessed Scroll: Enchant Weapon (S-Grade)',
    priceTokens: 1200,
    icon: 'gradespecial/scrolls/scroll_enchant_weapon_s.png',
    desc: 'Pergaminho Abençoado de Arma S-Grade. Em caso de falha, o item preserva o nível e não se destrói.',
    reward: { itemId: 'blessed_scroll_weapon_s', count: 1 }
  },
  {
    id: 'blessed_scroll_armor_s',
    name: 'Blessed Scroll: Enchant Armor (S-Grade)',
    priceTokens: 600,
    icon: 'gradespecial/scrolls/scroll_enchant_armor_s.png',
    desc: 'Pergaminho Abençoado de Armadura S-Grade. Preserva o equipamento com segurança.',
    reward: { itemId: 'blessed_scroll_armor_s', count: 1 }
  },
  {
    id: 'hero_cp_potion_bundle',
    name: "100x Poções de Combate do Herói (CP Potion)",
    priceTokens: 150,
    icon: 'consumables/cp_potion.png',
    desc: 'Pacote com 100 Poções de Restauração Imediata de Pontos de Combate.',
    reward: { itemId: 'hp_potion_xl', count: 100 }
  },
  {
    id: 'secret_elixir_vigor',
    name: 'Elixir de Vigor do Herói (1h)',
    priceTokens: 300,
    icon: 'consumables/elixir_vigor.png',
    desc: 'Concede +20% XP, +20% Adena e +10% Dano durante 1 hora de caça.',
    reward: { itemId: 'elixir_vigor_1h', count: 5 }
  }
];
