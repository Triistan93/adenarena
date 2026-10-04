/**
 * clanCrests.js — Catálogo Canônico de Estandartes e Brasões de Clã (Lineage II Chronicles)
 *
 * Fornece metadados visuais de heráldica, paletas de cores, insígnias e renderizador
 * de brasões medievais autênticos para as Casas do Reino de Aden.
 */

export const CLAN_CRESTS = [
  {
    id: 'crest_lion',
    name: 'Leão Dourado de Aden',
    symbol: '🦁',
    iconAsset: null,
    bgGradient: 'linear-gradient(145deg, #78350f 0%, #451a03 55%, #1c0a00 100%)',
    borderColor: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.45)',
    accentColor: '#fef08a',
    desc: 'O símbolo imperial da linhagem dos reis de Aden. Nobreza, coragem e honra.'
  },
  {
    id: 'crest_dragon',
    name: 'Dragão de Valakas',
    symbol: '🐉',
    iconAsset: null,
    bgGradient: 'linear-gradient(145deg, #7f1d1d 0%, #450a0a 55%, #1a0303 100%)',
    borderColor: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.5)',
    accentColor: '#fca5a5',
    desc: 'Chamas primordiais de Goddard e do ninho de Valakas. Fúria bélica destruidora.'
  },
  {
    id: 'crest_eagle',
    name: 'Águia Real de Elmore',
    symbol: '🦅',
    iconAsset: null,
    bgGradient: 'linear-gradient(145deg, #1e3a5f 0%, #0f172a 55%, #030712 100%)',
    borderColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.45)',
    accentColor: '#bae6fd',
    desc: 'A visão aguçada dos soberanos do norte. Soberania aérea e disciplina tática.'
  },
  {
    id: 'crest_wolf',
    name: 'Lobo Sombrio de Giran',
    symbol: '🐺',
    iconAsset: null,
    bgGradient: 'linear-gradient(145deg, #312e81 0%, #1e1b4b 55%, #09090b 100%)',
    borderColor: '#818cf8',
    glowColor: 'rgba(129, 140, 248, 0.45)',
    accentColor: '#c7d2fe',
    desc: 'Irmandade de caçadores noturnos. Lealdade incondicional à alcateia.'
  },
  {
    id: 'crest_crown',
    name: 'Coroa Imperial',
    symbol: '👑',
    iconAsset: 'icons/accessory_crown_i00.webp',
    bgGradient: 'linear-gradient(145deg, #854d0e 0%, #3f2203 55%, #180900 100%)',
    borderColor: '#fbbf24',
    glowColor: 'rgba(251, 191, 36, 0.55)',
    accentColor: '#fffbeb',
    desc: 'O estandarte dos legítimos herdeiros do Trono de Aden. Autoridade incontestável.'
  },
  {
    id: 'crest_swords',
    name: 'Lâminas Cruzadas',
    symbol: '⚔️',
    iconAsset: null,
    bgGradient: 'linear-gradient(145deg, #334155 0%, #1e293b 55%, #0f172a 100%)',
    borderColor: '#94a3b8',
    glowColor: 'rgba(148, 163, 184, 0.45)',
    accentColor: '#f1f5f9',
    desc: 'Aço temperado na forja dos gladiadores. Vitória alcançada pelo fio da espada.'
  },
  {
    id: 'crest_shield',
    name: 'Égide do Pacto (Pledge)',
    symbol: '🛡️',
    iconAsset: 'icons/shield_pledge_shield_i00.webp',
    bgGradient: 'linear-gradient(145deg, #064e3b 0%, #022c22 55%, #01140e 100%)',
    borderColor: '#34d399',
    glowColor: 'rgba(52, 211, 153, 0.45)',
    accentColor: '#a7f3d0',
    desc: 'O juramento sagrado de proteção entre cavaleiros. Uma muralha inabalável.'
  },
  {
    id: 'crest_blood_rose',
    name: 'Rosa Carmesim',
    symbol: '🌹',
    iconAsset: 'icons/s_bloody_rose.webp',
    bgGradient: 'linear-gradient(145deg, #831843 0%, #500724 55%, #1c020d 100%)',
    borderColor: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.5)',
    accentColor: '#fecdd3',
    desc: 'Beleza letal e pacto de sangue. Para casas que não perdoam traições.'
  },
  {
    id: 'crest_phoenix',
    name: 'Fênix Sagrada',
    symbol: '🔥',
    iconAsset: null,
    bgGradient: 'linear-gradient(145deg, #9a3412 0%, #7c2d12 55%, #290a03 100%)',
    borderColor: '#fb923c',
    glowColor: 'rgba(251, 146, 60, 0.5)',
    accentColor: '#ffedd5',
    desc: 'Renasce das cinzas em cada batalha. Resiliência imortal e espírito indomável.'
  },
  {
    id: 'crest_citadel',
    name: 'Cidadela de Ferro',
    symbol: '🏰',
    iconAsset: null,
    bgGradient: 'linear-gradient(145deg, #292524 0%, #1c1917 55%, #0c0a09 100%)',
    borderColor: '#d6d3d1',
    glowColor: 'rgba(214, 211, 209, 0.35)',
    accentColor: '#fafaf9',
    desc: 'Fortaleza dos castelos de Aden. Baluarte defensivo e riqueza dos tributos.'
  },
  {
    id: 'crest_valkyrie',
    name: 'Asas Celestes de Eva',
    symbol: '🪽',
    iconAsset: null,
    bgGradient: 'linear-gradient(145deg, #134e4a 0%, #042f2e 55%, #021a19 100%)',
    borderColor: '#2dd4bf',
    glowColor: 'rgba(45, 212, 191, 0.45)',
    accentColor: '#ccfbf1',
    desc: 'Bênção pura das ninfas e dos deuses da água. Graça celestial e cura divina.'
  },
  {
    id: 'crest_serpent',
    name: 'Serpente do Abismo',
    symbol: '🐍',
    iconAsset: null,
    bgGradient: 'linear-gradient(145deg, #14532d 0%, #052e16 55%, #021509 100%)',
    borderColor: '#4ade80',
    glowColor: 'rgba(74, 222, 128, 0.45)',
    accentColor: '#bbf7d0',
    desc: 'Veneno arcano e sabedoria oculta. Ataques cirúrgicos nas sombras.'
  },
  {
    id: 'crest_sun',
    name: 'Sol da Alvorada',
    symbol: '☀️',
    iconAsset: null,
    bgGradient: 'linear-gradient(145deg, #a16207 0%, #713f12 55%, #231201 100%)',
    borderColor: '#facc15',
    glowColor: 'rgba(250, 204, 21, 0.5)',
    accentColor: '#fef9c3',
    desc: 'A luz que dissipa as trevas de Shilen. Justiça radiante e renovação.'
  },
  {
    id: 'crest_moon',
    name: 'Lua Mística de Shilen',
    symbol: '🌙',
    iconAsset: null,
    bgGradient: 'linear-gradient(145deg, #3730a3 0%, #1e1b4b 55%, #07071c 100%)',
    borderColor: '#a78bfa',
    glowColor: 'rgba(167, 139, 250, 0.45)',
    accentColor: '#ede9fe',
    desc: 'O véu místico da deusa caída. Segredos arcanos e poder lunar silencioso.'
  },
  {
    id: 'crest_chalice',
    name: 'Santo Graal Templário',
    symbol: '🏆',
    iconAsset: null,
    bgGradient: 'linear-gradient(145deg, #581c87 0%, #3b0764 55%, #18022b 100%)',
    borderColor: '#c084fc',
    glowColor: 'rgba(192, 132, 252, 0.45)',
    accentColor: '#f3e8ff',
    desc: 'Cálice de sagração dos paladinos devotos. Pureza espiritual e glória eterna.'
  },
  {
    id: 'crest_skull',
    name: 'Legião dos Renegados',
    symbol: '💀',
    iconAsset: null,
    bgGradient: 'linear-gradient(145deg, #27272a 0%, #18181b 55%, #09090b 100%)',
    borderColor: '#e2e8f0',
    glowColor: 'rgba(226, 232, 240, 0.35)',
    accentColor: '#f8fafc',
    desc: 'Guerreiros que temem apenas a desonra. Intimidação e força implacável.'
  }
];

export const DEFAULT_CLAN_CREST_ID = 'crest_lion';

/**
 * Obtém a definição de um brasão pelo seu identificador único.
 */
export function getClanCrest(crestId) {
  const targetId = String(crestId || DEFAULT_CLAN_CREST_ID).trim();
  return CLAN_CRESTS.find(c => c.id === targetId) || CLAN_CRESTS[0];
}

/**
 * Renderiza o HTML de um brasão heráldico do clã.
 * 
 * @param {string} crestId Identificador do brasão
 * @param {'sm'|'md'|'lg'|'picker'} size Tamanho da exibição
 * @param {boolean} interactive Se deve ter efeitos de hover
 */
export function renderClanCrestHtml(crestId, size = 'md', interactive = false) {
  const crest = getClanCrest(crestId);

  const sizeStyles = {
    sm: { width: '30px', height: '36px', fontSize: '15px', iconSize: '18px' },
    md: { width: '44px', height: '52px', fontSize: '22px', iconSize: '26px' },
    lg: { width: '68px', height: '80px', fontSize: '32px', iconSize: '40px' },
    picker: { width: '48px', height: '56px', fontSize: '24px', iconSize: '28px' }
  };

  const dim = sizeStyles[size] || sizeStyles.md;

  const content = crest.iconAsset
    ? `<img src="${crest.iconAsset}" alt="${crest.name}" style="width:${dim.iconSize}; height:${dim.iconSize}; object-fit:contain; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.8));" onerror="this.outerHTML='<span>${crest.symbol}</span>'" />`
    : `<span style="font-size:${dim.fontSize}; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.8)); line-height:1;">${crest.symbol}</span>`;

  return `
    <div
      class="clan-crest-badge ${interactive ? 'clan-crest-badge--interactive' : ''}"
      data-crest-id="${crest.id}"
      title="${crest.name}"
      style="
        width: ${dim.width};
        height: ${dim.height};
        background: ${crest.bgGradient};
        border: 2px solid ${crest.borderColor};
        box-shadow: 0 4px 12px rgba(0,0,0,0.5), 0 0 10px ${crest.glowColor};
      "
    >
      <div class="clan-crest-badge__inner">
        ${content}
      </div>
    </div>
  `;
}
