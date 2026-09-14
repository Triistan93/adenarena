// mercenaries.js — Catálogo de Dados de Mercenários e Taverna de Aden (Lineage II Style)

export const MERCENARY_RARITIES = {
  common: {
    id: 'common',
    name: 'Comum',
    color: '#94a3b8',
    bgBadge: 'rgba(148, 163, 184, 0.15)',
    border: 'rgba(148, 163, 184, 0.4)',
    powerMult: 1.0,
    hireCostBase: 5000,
    weight: 55
  },
  uncommon: {
    id: 'uncommon',
    name: 'Incomum',
    color: '#22c55e',
    bgBadge: 'rgba(34, 197, 94, 0.15)',
    border: 'rgba(34, 197, 94, 0.4)',
    powerMult: 1.25,
    hireCostBase: 12000,
    weight: 25
  },
  rare: {
    id: 'rare',
    name: 'Raro',
    color: '#3b82f6',
    bgBadge: 'rgba(59, 130, 246, 0.15)',
    border: 'rgba(59, 130, 246, 0.4)',
    powerMult: 1.6,
    hireCostBase: 30000,
    weight: 14
  },
  epic: {
    id: 'epic',
    name: 'Épico',
    color: '#a855f7',
    bgBadge: 'rgba(168, 85, 247, 0.15)',
    border: 'rgba(168, 85, 247, 0.4)',
    powerMult: 2.2,
    hireCostBase: 75000,
    weight: 5
  },
  legendary: {
    id: 'legendary',
    name: 'Lendário',
    color: '#f59e0b',
    bgBadge: 'rgba(245, 158, 11, 0.2)',
    border: 'rgba(245, 158, 11, 0.5)',
    powerMult: 3.0,
    hireCostBase: 200000,
    weight: 1
  }
};

export const MERCENARY_TRAITS = {
  veteran: {
    id: 'veteran',
    name: 'Veterano',
    icon: '🎖️',
    desc: '+10% Poder geral nas expedições',
    powerBonusPct: 0.10,
    color: '#eab308'
  },
  greedy: {
    id: 'greedy',
    name: 'Ganancioso',
    icon: '💰',
    desc: '+20% Ouro saqueado, -5% XP ganha',
    goldBonusPct: 0.20,
    xpBonusPct: -0.05,
    color: '#f59e0b'
  },
  cautious: {
    id: 'cautious',
    name: 'Cauteloso',
    icon: '🛡️',
    desc: '-25% Dano sofrido em perigos, +10% duração',
    hazardDamageReduction: 0.25,
    durationMult: 1.10,
    color: '#3b82f6'
  },
  disciplined: {
    id: 'disciplined',
    name: 'Disciplinado',
    icon: '📜',
    desc: '+15% XP de expedição para o mercenário',
    xpBonusPct: 0.15,
    color: '#8b5cf6'
  },
  lucky: {
    id: 'lucky',
    name: 'Sortudo',
    icon: '🍀',
    desc: '+15% Chance de baú bônus e relíquias raras',
    bonusChestChance: 0.15,
    color: '#22c55e'
  },
  agile: {
    id: 'agile',
    name: 'Ágil',
    icon: '⚡',
    desc: '-15% Tempo de marcha da expedição',
    speedReduction: 0.15,
    color: '#06b6d4'
  }
};

export const MERCENARY_SPECIALIZATIONS = {
  guardian: {
    id: 'guardian',
    name: 'Guardião',
    icon: '🛡️',
    role: 'Tanque & Defesa',
    desc: 'Ergue o baluarte para proteger a caravana. Mitiga perigos e emboscadas.',
    synergyName: 'Escudo Inabalável',
    synergyDesc: '-35% Dano de emboscadas e perigos (+10% Adena protegida)',
    hazardMitigation: 0.35,
    goldSafetyBonus: 0.10
  },
  tracker: {
    id: 'tracker',
    name: 'Rastreador',
    icon: '🏹',
    role: 'Batedor & Navegador',
    desc: 'Domina trilhas secretas pelos ermos de Aden. Encurta a marcha e encontra atalhos.',
    synergyName: 'Passo Ágil',
    synergyDesc: '-20% Duração da expedição (+20% nós de recursos extras)',
    speedReduction: 0.20,
    extraResourceChance: 0.20
  },
  thief: {
    id: 'thief',
    name: 'Ladino',
    icon: '🗡️',
    role: 'Infiltrador & Gatuno',
    desc: 'Especialista em desarmar armadilhas antigas e arrombar arcas de tesouro.',
    synergyName: 'Mãos de Seda',
    synergyDesc: '+35% Chance de Baú Bônus (-40% dano de armadilhas)',
    bonusChestChance: 0.35,
    trapMitigation: 0.40
  },
  mage: {
    id: 'mage',
    name: 'Mago Arcano',
    icon: '🔮',
    role: 'Dano Arcano & Elemental',
    desc: 'Canaliza correntes arcanas para dispersar barreiras mágicas e demônios.',
    synergyName: 'Sifão Astral',
    synergyDesc: '+50% Cacos Astrais (+25% chance de câmara secreta)',
    extraShardsPct: 0.50,
    secretChamberChance: 0.25
  },
  healer: {
    id: 'healer',
    name: 'Curandeiro',
    icon: '✨',
    role: 'Luz Sagrada & Suporte',
    desc: 'Purifica ferimentos de batalha, sustenta a moral e expurga maldições.',
    synergyName: 'Bênção de Eva',
    synergyDesc: '+30% XP para o esquadrão (-25% dano residual da caravana)',
    extraXpPct: 0.30,
    residualMitigation: 0.25
  }
};

export const MERCENARY_TEMPLATES = [
  // Guardiões
  {
    id: 'merc_tarkin',
    name: 'Tarkin de Gludio',
    title: 'O Baluarte de Ferro',
    icon: '🛡️',
    spec: 'guardian',
    rarity: 'common',
    basePower: 50,
    quote: 'Nenhum monstro passará por este escudo enquanto eu respirar!'
  },
  {
    id: 'merc_darius',
    name: 'Comandante Darius',
    title: 'Sentinela do Forte',
    icon: '⚔️',
    spec: 'guardian',
    rarity: 'uncommon',
    basePower: 80,
    quote: 'Mantenham a formação! A glória de Aden nos protege.'
  },
  {
    id: 'merc_brann',
    name: 'Brann Escudo-de-Carvalho',
    title: 'Paladino dos Ermos',
    icon: '🛡️',
    spec: 'guardian',
    rarity: 'rare',
    basePower: 130,
    quote: 'Pela luz sagrada, quebrarei a vanguarda inimiga.'
  },
  {
    id: 'merc_valerius',
    name: 'Lorde Valerius',
    title: 'General de Ferro de Dion',
    icon: '🏰',
    spec: 'guardian',
    rarity: 'epic',
    basePower: 210,
    quote: 'Marchamos como uma fortaleza intransponível!'
  },

  // Rastreadores
  {
    id: 'merc_lyra',
    name: 'Lyra da Floresta',
    title: 'Batedora Silvestre',
    icon: '🏹',
    spec: 'tracker',
    rarity: 'common',
    basePower: 55,
    quote: 'O vento revela cada pegada na folhagem.'
  },
  {
    id: 'merc_kestrel',
    name: 'Kestrel Olho-de-Falcão',
    title: 'Atirador de Emboscada',
    icon: '🦅',
    spec: 'tracker',
    rarity: 'uncommon',
    basePower: 85,
    quote: 'Minha flecha alcança o coração antes do som do disparo.'
  },
  {
    id: 'merc_sylas',
    name: 'Sylas Andarilho do Vento',
    title: 'Guia das Catacumbas',
    icon: '🧭',
    spec: 'tracker',
    rarity: 'rare',
    basePower: 135,
    quote: 'Conheço atalhos esquecidos até mesmo pelos antigos reis.'
  },
  {
    id: 'merc_artemis',
    name: 'Artemis da Lua Cheia',
    title: 'Rainha Batedora Élfica',
    icon: '🌙',
    spec: 'tracker',
    rarity: 'epic',
    basePower: 220,
    quote: 'A noite é meu manto e as estrelas meu mapa estelar.'
  },

  // Ladrões / Infiltradores
  {
    id: 'merc_corvus',
    name: 'Corvus Pé-de-Vento',
    title: 'Batedor de Carteiras',
    icon: '🗡️',
    spec: 'thief',
    rarity: 'common',
    basePower: 52,
    quote: 'O que é seu pode ser meu com apenas um piscar de olhos.'
  },
  {
    id: 'merc_jarek',
    name: 'Jarek Mãos-de-Seda',
    title: 'Desarmador de Fechaduras',
    icon: '🗝️',
    spec: 'thief',
    rarity: 'uncommon',
    basePower: 82,
    quote: 'Não existe câmara lacrada que resista ao meu toque.'
  },
  {
    id: 'merc_shani',
    name: 'Shani a Sombra de Giran',
    title: 'Assassina Renegada',
    icon: '👥',
    spec: 'thief',
    rarity: 'rare',
    basePower: 140,
    quote: 'Silenciosa como a névoa, letal como veneno de escorpião.'
  },
  {
    id: 'merc_raven',
    name: 'Corvo Noturno',
    title: 'Mestre da Guilda dos Ladrões',
    icon: '👑',
    spec: 'thief',
    rarity: 'legendary',
    basePower: 320,
    quote: 'O maior tesouro de Shilen nos pertence por direito de conquista!'
  },

  // Magos Arcanos
  {
    id: 'merc_elena',
    name: 'Elena Chamas-Vivas',
    title: 'Iniciada Arcana',
    icon: '🔥',
    spec: 'mage',
    rarity: 'common',
    basePower: 60,
    quote: 'O fogo consome todas as incertezas.'
  },
  {
    id: 'merc_morgrim',
    name: 'Morgrim o Telúrico',
    title: 'Invocador das Profundezas',
    icon: '⚡',
    spec: 'mage',
    rarity: 'uncommon',
    basePower: 90,
    quote: 'As correntes da terra tremem ao meu comando.'
  },
  {
    id: 'merc_selene',
    name: 'Mestra Selene',
    title: 'Feiticeira das Sombras',
    icon: '🔮',
    spec: 'mage',
    rarity: 'rare',
    basePower: 145,
    quote: 'A magia primordial despedaça qualquer ilusão mundana.'
  },
  {
    id: 'merc_azrael',
    name: 'Azrael o Tecelão Astral',
    title: 'Arquimago de Marfim',
    icon: '🌌',
    spec: 'mage',
    rarity: 'legendary',
    basePower: 330,
    quote: 'O cosmos se curva diante da sabedoria ancestral da Torre de Marfim!'
  },

  // Curandeiros / Suporte
  {
    id: 'merc_vanya',
    name: 'Vanya a Devota',
    title: 'Acólita de Eva',
    icon: '✨',
    spec: 'healer',
    rarity: 'common',
    basePower: 48,
    quote: 'A água sagrada de Eva cura qualquer ferida.'
  },
  {
    id: 'merc_celestine',
    name: 'Irmã Celestine',
    title: 'Sacerdotisa da Alvorada',
    icon: '🕊️',
    spec: 'healer',
    rarity: 'uncommon',
    basePower: 78,
    quote: 'Nenhum companheiro tombará sob minha vigília.'
  },
  {
    id: 'merc_thalor',
    name: 'Thalor Punho-da-Luz',
    title: 'Monge Exorcista',
    icon: '☀️',
    spec: 'healer',
    rarity: 'rare',
    basePower: 130,
    quote: 'Trevas e mortos-vivos serão purificados pelo fogo divino!'
  },
  {
    id: 'merc_isolde',
    name: 'Matriarca Isolde',
    title: 'Santa Viva de Aden',
    icon: '👑',
    spec: 'healer',
    rarity: 'epic',
    basePower: 215,
    quote: 'A esperança de Aden jamais se extinguirá!'
  }
];

export function getMercenaryXpForLevel(level) {
  const lvl = Math.max(1, Math.min(20, Math.floor(level)));
  if (lvl >= 20) return 9999999;
  return lvl * lvl * 80;
}

export function calculateMercenaryPower(merc) {
  if (!merc) return 0;
  const rarityDef = MERCENARY_RARITIES[merc.rarity] || MERCENARY_RARITIES.common;
  const lvl = merc.level || 1;
  const base = merc.basePower || 50;
  let power = (base + (lvl - 1) * 15) * (rarityDef.powerMult || 1.0);

  // Bônus de Lealdade (0-100)
  const loyalty = merc.loyalty ?? 50;
  if (loyalty >= 80) power *= 1.10;
  else if (loyalty >= 50) power *= 1.05;
  else if (loyalty < 20) power *= 0.90; // desmotivado

  // Bônus de Traço
  if (merc.trait && MERCENARY_TRAITS[merc.trait]?.powerBonusPct) {
    power *= (1 + MERCENARY_TRAITS[merc.trait].powerBonusPct);
  }

  return Math.floor(power);
}

export function rollMercenaryTrait() {
  const traitKeys = Object.keys(MERCENARY_TRAITS);
  return traitKeys[Math.floor(Math.random() * traitKeys.length)];
}
