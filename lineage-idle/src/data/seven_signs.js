/**
 * Seven Signs Data Definitions (Lineage II Canonical)
 * Competição entre Lords of Dawn e Revolutionaries of Dusk,
 * Conversão de Seal Stones em Ancient Adena (AA),
 * Chefes de Selo (Lilith & Anakim), e Serviços dos Mercadores de Mammon.
 */

export const FACTIONS = {
  dawn: {
    id: 'dawn',
    name: 'Lords of Dawn ☀️',
    icon: '☀️',
    desc: 'Aristocratas e devotos de Einhasad que buscam a ordem sagrada e bênçãos arcanas.',
    bonusDesc: '+10% Dano Sagrado e +5% XP'
  },
  dusk: {
    id: 'dusk',
    name: 'Revolutionaries of Dusk 🌒',
    icon: '🌒',
    desc: 'Rebeldes e guerreiros do submundo leais a Shilen que buscam quebrar os grilhões imperiais.',
    bonusDesc: '+10% Dano Sombrio e +5% Drop Rate'
  }
};

export const SEAL_STONES = {
  seal_stone_blue: {
    id: 'seal_stone_blue',
    name: 'Blue Seal Stone 🔷',
    icon: '🔷',
    aaValue: 3,
    desc: 'Pedra de selo elemental obtida de monstros em Catacumbas de baixo nível. Vale 3 Ancient Adena.'
  },
  seal_stone_green: {
    id: 'seal_stone_green',
    name: 'Green Seal Stone 🟢',
    icon: '🟢',
    aaValue: 5,
    desc: 'Pedra de selo pura obtida em Necrópoles intermediárias. Vale 5 Ancient Adena.'
  },
  seal_stone_red: {
    id: 'seal_stone_red',
    name: 'Red Seal Stone 🔴',
    icon: '🔴',
    aaValue: 10,
    desc: 'Pedra de selo suprema concentrada com sangue antigo. Vale 10 Ancient Adena.'
  }
};

export const NECROPOLIS_ZONES = [
  { id: 'necro_sacrifice', name: 'Necropolis of Sacrifice', level: 32, stones: ['seal_stone_blue'], minScore: 100 },
  { id: 'necro_pilgrim', name: 'Necropolis of Pilgrims', level: 42, stones: ['seal_stone_blue', 'seal_stone_green'], minScore: 300 },
  { id: 'necro_worship', name: 'Necropolis of Worship', level: 52, stones: ['seal_stone_green'], minScore: 600 },
  { id: 'necro_patriot', name: 'Necropolis of Patriots', level: 62, stones: ['seal_stone_green', 'seal_stone_red'], minScore: 1200 },
  { id: 'necro_ascetics', name: 'Catacomb of the Ascetics', level: 72, stones: ['seal_stone_green', 'seal_stone_red'], minScore: 2500 },
  { id: 'necro_martyrs', name: 'Catacomb of the Martyrs', level: 76, stones: ['seal_stone_red'], minScore: 5000 },
  { id: 'necro_apostles', name: 'Catacomb of the Apostles', level: 80, stones: ['seal_stone_red'], minScore: 10000 },
  { id: 'necro_disciple', name: 'Disciples Necropolis', level: 84, stones: ['seal_stone_red'], minScore: 20000 }
];

export const SEVEN_SIGNS_BOSSES = {
  lilith: {
    id: 'lilith',
    name: 'Lilith 🌑',
    title: 'Rainha do Abismo e Mensageira de Shilen',
    level: 80,
    faction: 'dusk',
    hp: 450000,
    pAtk: 2200,
    pDef: 1800,
    mDef: 1950,
    desc: 'A criatura ancestral de Shilen que repousa nas profundezas da Necrópole dos Discípulos.',
    reqAA: 50000,
    rewards: {
      aa: 150000,
      xp: 2500000,
      sp: 500000,
      items: ['scroll_enchant_weapon_s', 'giants_codex_mastery', 'life_stone_top_76']
    }
  },
  anakim: {
    id: 'anakim',
    name: 'Anakim ☀️',
    title: 'Arauto Sagrado de Einhasad',
    level: 80,
    faction: 'dawn',
    hp: 450000,
    pAtk: 2300,
    pDef: 1750,
    mDef: 2100,
    desc: 'O anjo flamejante de Einhasad envolto em asas de luz celeste que guarda as Catacumbas dos Apóstolos.',
    reqAA: 50000,
    rewards: {
      aa: 150000,
      xp: 2500000,
      sp: 500000,
      items: ['scroll_enchant_weapon_s', 'giants_codex_mastery', 'life_stone_top_76']
    }
  }
};

export const MAMMON_BLACKSMITH_SERVICES = [
  {
    id: 'weapon_exchange',
    name: 'Troca de Arma Equivalente (Mesmo Tier)',
    costAA: 25000,
    desc: 'Permite trocar qualquer arma A ou S Grade por outra de mesmo nível e tipo (ex: Espada por Arco ou Adaga).'
  },
  {
    id: 'unseal_armor',
    name: 'Remover Selo de Armadura (Unseal)',
    costAA: 50000,
    desc: 'Remove o selo de armaduras A ou S Grade revelando seu conjunto lendário completo e atributos máximos.'
  },
  {
    id: 'sa_infusion',
    name: 'Infusão de Soul Crystal (SA Nível 13)',
    costAA: 100000,
    desc: 'Insere uma Special Ability pura (Focus, Haste ou Acumen) diretamente na sua arma equipada.'
  }
];

export const MAMMON_MERCHANT_CATALOG = [
  {
    id: 'scroll_enchant_weapon_a',
    name: 'Scroll: Enchant Weapon (A-Grade) 📜',
    costAA: 30000,
    icon: '📜',
    desc: 'Pergaminho sagrado para encantar armas A-Grade.'
  },
  {
    id: 'scroll_enchant_weapon_s',
    name: 'Scroll: Enchant Weapon (S-Grade) 📜',
    costAA: 100000,
    icon: '📜',
    desc: 'Pergaminho supremo para encantar armas S-Grade.'
  },
  {
    id: 'giants_codex',
    name: "Giant's Codex 📜",
    costAA: 80000,
    icon: '📜',
    desc: 'Tomo ancestral dos Gigantes para encantar habilidades de classe.'
  },
  {
    id: 'giants_codex_mastery',
    name: "Giant's Codex - Mastery 🌟",
    costAA: 250000,
    icon: '🌟',
    desc: 'Tomo consagrado para encantar habilidades com 100% de segurança contra perda de níveis.'
  },
  {
    id: 'life_stone_top_76',
    name: 'Top-Grade Life Stone: Level 76 💎',
    costAA: 150000,
    icon: '💎',
    desc: 'Pedra da vida suprema com 100% de garantia de Glow e alta chance de Item Skill.'
  },
  {
    id: 'ancient_dye_str_con',
    name: 'Greater Dye of STR (+4 STR / -4 CON) 🩸',
    costAA: 60000,
    icon: '🩸',
    desc: 'Tintura arcana dos Gigantes para forjar tatuagens de combate físico.'
  },
  {
    id: 'ancient_dye_int_men',
    name: 'Greater Dye of INT (+4 INT / -4 MEN) 🔮',
    costAA: 60000,
    icon: '🔮',
    desc: 'Tintura mágica pura para potencializar o poder de conjuração arcano.'
  }
];
