/**
 * class_aliases.js — Dicionário Universal de Aliases e Resolução Canônica de Classes
 * 
 * Mapeia variações de nomes, identificadores legados, seleções do criador de personagem,
 * e chaves de imagens/sprites para os IDs canônicos oficiais definidos em CLASSES_ECHO.
 */

import { ACTIVE_CLASSES } from '../elemental/ElementMatrix.js';
import { HISTORICAL_CLASSES } from '../elemental/HistoricalClasses.js';

export const CLASS_ALIASES = {
  // 🗡️ Assassin (Humano e Elfo Negro)
  'assassinbase': 'assassinS0',
  'assassinBase': 'assassinS0',
  'assassin': 'assassinS0',
  'assassins0': 'assassinS0',
  'assassinS0': 'assassinS0',
  'assassins1': 'assassinS1',
  'assassinS1': 'assassinS1',
  'assassins2': 'assassinS2',
  'assassinS2': 'assassinS2',
  'assassins3': 'assassinS3',
  'assassinS3': 'assassinS3',
  'assassinde': 'assassinDE',
  'assassinDE': 'assassinDE',
  'human_assassin': 'assassinS0',
  'human_assassinbase': 'assassinS0',
  'human_assassinBase': 'assassinS0',
  'human_assassins0': 'assassinS0',
  'darkelf_assassin': 'assassinS0',
  'darkelf_assassinbase': 'assassinS0',
  'darkelf_assassinBase': 'assassinS0',
  'darkelf_assassins0': 'assassinS0',

  // 💀 Death Knight / Death Pilgrim (Humano e Elfo Negro)
  'deathpilgrim': 'deathPilgrim',
  'deathPilgrim': 'deathPilgrim',
  'human_deathpilgrim': 'deathPilgrim',
  'darkelf_deathpilgrim': 'deathPilgrim',
  'elfdeathpilgrim': 'deathPilgrim',
  'elfDeathPilgrim': 'deathPilgrim',
  'deathknight': 'deathPilgrim',
  'deathKnight': 'deathPilgrim',
  'deathblade': 'deathBlade',
  'deathBlade': 'deathBlade',
  'deathknight3': 'deathKnight',

  // 🐺 Warg (Humano)
  'wargbase': 'wargBase',
  'wargBase': 'wargBase',
  'warg': 'wargBase',
  'human_warg': 'wargBase',
  'human_wargbase': 'wargBase',
  'wargs0': 'wargS0',
  'wargS0': 'wargS0',
  'wargs1': 'wargS1',
  'wargS1': 'wargS1',
  'wargs2': 'wargS2',
  'wargS2': 'wargS2',
  'wargs3': 'wargS3',
  'wargS3': 'wargS3',

  // 🐉 Orc Vanguard Rider (Orc)
  'orcrider': 'rider',
  'orcRider': 'rider',
  'rider': 'rider',
  'vanguard': 'rider',
  'vanguardbase': 'rider',
  'vanguardBase': 'rider',
  'orc_rider': 'rider',
  'orc_vanguard': 'rider',
  'orc_vanguardbase': 'rider',
  'dragoon': 'dragoon',
  'orcdragoon': 'dragoon',
  'orcDragoon': 'dragoon',
  'orc_dragoon': 'dragoon',
  'ertheia_vanguard_rider': 'orc_vanguard_rider',
  'ertheia_vanguardrider': 'orc_vanguard_rider',
  'orc_vanguard_rider': 'vanguardRider',
  'orc_vanguardrider': 'vanguardRider',
  'vanguardrider': 'vanguardRider',
  'vanguardRider': 'vanguardRider',
  'vanguard_rider': 'vanguardRider',
  'grandvanguard': 'grandVanguard',
  'grandVanguard': 'grandVanguard',
  'grand_vanguard': 'grandVanguard',
  'vanguardlord': 'grandVanguard',
  'vanguardLord': 'grandVanguard',

  // ⚒️ Anão Artesão / Scavenger / ShineMaker
  'artisan': 'artisanDwarf',
  'artisandwarf': 'artisanDwarf',
  'artisanDwarf': 'artisanDwarf',
  'scavenger': 'scavenger',
  'dwarffighter': 'dwarfFighter',
  'dwarfFighter': 'dwarfFighter',
  'dwarf_fighter': 'dwarfFighter',
  'dwarf_artisan': 'artisanDwarf',
  'dwarf_scavenger': 'scavenger',
  'dwarf_shinemaker': 'shineMakerS1',
  'dwarf_shinemakerbase': 'shineMakerS1',
  'shinemakers1': 'shineMakerS1',
  'shinemakerS1': 'shineMakerS1',
  'shineMakerS1': 'shineMakerS1',
  'shinemaker': 'shineMakerS1',
  'shinemakers2': 'shineMakerS2',
  'shinemakerS2': 'shineMakerS2',
  'shinemakers3': 'shineMakerS3',

  // ⛩️ Kamael Samurai & Soulbreaker
  'samuraibase': 'samuraiBase',
  'samuraiBase': 'samuraiBase',
  'bushi': 'samuraiBase',
  'kamael_samuraibase': 'samuraiBase',
  'kamael_samurai': 'samuraiBase',
  'kamael_bushi': 'samuraiBase',
  'hatamoto': 'hatamoto',
  'ronin': 'ronin',
  'samurai': 'samurai',
  'kamaelsoldier': 'kamaelSoldier',
  'kamaelSoldier': 'kamaelSoldier',
  'kamael_soldier': 'kamaelSoldier',
  'soulbreaker': 'soulBreakerKamael',
  'soulbreakerkamael': 'soulBreakerKamael',
  'soulBreakerKamael': 'soulBreakerKamael',

  // 🔫 Sylph (Gunner / Storm Blaster)
  'sylphgunner': 'sylphGunner',
  'sylphGunner': 'sylphGunner',
  'sylph_gunner': 'sylphGunner',
  'sharpshooter': 'sharpshooter',
  'windsniper': 'windSniper',
  'windSniper': 'windSniper',
  'stormblaster': 'stormBlaster',
  'stormBlaster': 'stormBlaster',

  // ✨ High Elf (Templar / Element Weaver)
  'highelfbase': 'highElfBase',
  'highElfBase': 'highElfBase',
  'highelf_base': 'highElfBase',
  'highelf_templar': 'divineTemplarBase',
  'highelf_templarbase': 'divineTemplarBase',
  'divinetemplarbase': 'divineTemplarBase',
  'divineTemplarBase': 'divineTemplarBase',
  'divinetemplars1': 'divineTemplarS1',
  'divineTemplarS1': 'divineTemplarS1',
  'elementweaverbase': 'elementWeaverBase',
  'elementWeaverBase': 'elementWeaverBase',
  'elementweavers1': 'elementWeaverS1',
  'elementWeaverS1': 'elementWeaverS1',

  // ⚒️ Dwarf ShineMaker & Artisan
  'shinemakerbase': 'shineMakerBase',
  'shineMakerBase': 'shineMakerBase',
  'dwarf_shinemakerbase': 'shineMakerBase',
  'dwarf_shinemaker': 'shineMakerBase',
  'shinemakers1': 'shinemakerS1',
  'shineMakerS1': 'shinemakerS1',
  'shinemakers2': 'shinemakerS2',
  'shineMakerS2': 'shinemakerS2',
  'shinemakers3': 'shinemakerS3',
  'shineMakerS3': 'shinemakerS3',
  'shinemaker': 'shinemaker',

  // 🌹 Dark Elf Blood Rose (Magia de Sangue & Espinhos)
  'bloodrosebase': 'bloodRoseBase',
  'bloodRoseBase': 'bloodRoseBase',
  'darkelf_bloodrose': 'bloodRoseBase',
  'darkelf_bloodrosebase': 'bloodRoseBase',
  'bloodroses1': 'bloodRoseS1',
  'bloodRoseS1': 'bloodRoseS1',
  'bloodroses2': 'bloodRoseS2',
  'bloodRoseS2': 'bloodRoseS2',
  'bloodroses3': 'bloodRoseS3',
  'bloodRoseS3': 'bloodRoseS3',
  'bloodrose': 'bloodRose',
  'bloodRose': 'bloodRose',

  // 🌪️ Ertheia (Marauder Brawler / Sayha Seeker)
  'marauderbase': 'marauderBase',
  'marauderBase': 'marauderBase',
  'ertheia_fighter': 'marauderBase',
  'ertheia_marauderbase': 'marauderBase',
  'marauder': 'marauder',
  'eviscerator': 'eviscerator',
  'sayhamagebase': 'sayhaMageBase',
  'sayhaMageBase': 'sayhaMageBase',
  'sayhaseekerbase': 'sayhaMageBase',
  'sayha_mage': 'sayhaMageBase',
  'sayhaseer': 'sayhaSeer',
  'sayhaSeer': 'sayhaSeer',
  'sayha_seer': 'sayhaSeer',
  'sayhamagebase': 'sayhaMageBase',
  'sayhaMageBase': 'sayhaMageBase',
  'ertheia_mage': 'sayhaMageBase',
  'ertheia_sayhamagebase': 'sayhaMageBase',
  'sayhaseer': 'sayhaSeer',
  'sayhaSeer': 'sayhaSeer',
  'sayhaseeker': 'sayhaSeeker',
  'sayhaSeeker': 'sayhaSeeker',

  // 🏹 / ⚔️ / 🔮 Classes Clássicas Élficas, Humanas e Orcs
  'fighter': 'fighter',
  'human_fighter': 'fighter',
  'mage': 'mage',
  'human_mage': 'mage',
  'elffighter': 'elfFighter',
  'elfFighter': 'elfFighter',
  'elf_fighter': 'elfFighter',
  'elfmage': 'elfMage',
  'elfMage': 'elfMage',
  'elf_mage': 'elfMage',
  'darkelffighter': 'darkElfFighter',
  'darkElfFighter': 'darkElfFighter',
  'darkelf_fighter': 'darkElfFighter',
  'darkelfmage': 'darkElfMage',
  'darkElfMage': 'darkElfMage',
  'darkelf_mage': 'darkElfMage',
  'orcfighter': 'orcFighter',
  'orcFighter': 'orcFighter',
  'orc_fighter': 'orcFighter',
  'orcmage': 'orcMage',
  'orcMage': 'orcMage',
  'orc_mage': 'orcMage',

  // Especializações Comuns
  'gladiator': 'gladiator',
  'warlord': 'warlord',
  'paladin': 'paladin',
  'darkavenger': 'darkAvenger',
  'darkAvenger': 'darkAvenger',
  'treasurehunter': 'treasureHunter',
  'treasureHunter': 'treasureHunter',
  'hawkeye': 'hawkeye',
  'sorcerer': 'sorcerer',
  'necromancer': 'necromancer',
  'warlock': 'warlock',
  'bishop': 'bishop',
  'prophet': 'prophet',
  'templeknight': 'templeKnight',
  'templeKnight': 'templeKnight',
  'swordsinger': 'swordSinger',
  'swordSinger': 'swordSinger',
  'plainsalker': 'plainsWalker',
  'plainswalker': 'plainsWalker',
  'silverranger': 'silverRanger',
  'silverRanger': 'silverRanger',
  'spellsinger': 'spellsinger',
  'elementalsummoner': 'elementalSummoner',
  'elementalSummoner': 'elementalSummoner',
  'elvenelder': 'elvenElder',
  'elvenElder': 'elvenElder',
  'shillienknight': 'shillienKnight',
  'shillienKnight': 'shillienKnight',
  'bladedancer': 'bladeDancer',
  'bladeDancer': 'bladeDancer',
  'abysswalker': 'abyssWalker',
  'abyssWalker': 'abyssWalker',
  'phantomranger': 'phantomRanger',
  'phantomRanger': 'phantomRanger',
  'spellhowler': 'spellhowler',
  'phantomsummoner': 'phantomSummoner',
  'phantomSummoner': 'phantomSummoner',
  'shillienelder': 'shillienElder',
  'shillienElder': 'shillienElder',
  'destroyer': 'destroyer',
  'tyrant': 'tyrant',
  'overlord': 'overlord',
  'warcryer': 'warcryer',
  'bountyhunter': 'bountyHunter',
  'bountyHunter': 'bountyHunter',
  'warsmith': 'warsmith',
  'duelist': 'duelist',
  'dreadnought': 'dreadnought',
  'phoenixknight': 'phoenixKnight',
  'phoenixKnight': 'phoenixKnight',
  'hellknight': 'hellKnight',
  'hellKnight': 'hellKnight',
  'sagittarius': 'sagittarius',
  'adventurer': 'adventurer',
  'archmage': 'archmage',
  'soultaker': 'soultaker',
  'arcanaLord': 'arcanaLord',
  'cardinal': 'cardinal',
  'hierophant': 'hierophant',
  'evastemplar': 'evaTemplar',
  'evaTemplar': 'evaTemplar',
  'swordmuse': 'swordMuse',
  'swordMuse': 'swordMuse',
  'windrider': 'windRider',
  'windRider': 'windRider',
  'moonlightsentinel': 'moonlightSentinel',
  'moonlightSentinel': 'moonlightSentinel',
  'mysticmuse': 'mysticMuse',
  'mysticMuse': 'mysticMuse',
  'elementalmaster': 'elementalMaster',
  'elementalMaster': 'elementalMaster',
  'evassaint': 'evaSaint',
  'evaSaint': 'evaSaint',
  'shillientemplar': 'shillienTemplar',
  'shillienTemplar': 'shillienTemplar',
  'spectraldancer': 'spectralDancer',
  'spectralDancer': 'spectralDancer',
  'ghosthunter': 'ghostHunter',
  'ghostHunter': 'ghostHunter',
  'ghostsentinel': 'ghostSentinel',
  'ghostSentinel': 'ghostSentinel',
  'stormscreamer': 'stormScreamer',
  'stormScreamer': 'stormScreamer',
  'spectralmaster': 'spectralMaster',
  'spectralMaster': 'spectralMaster',
  'shilliensaint': 'shillienSaint',
  'shillienSaint': 'shillienSaint',
  'titan': 'titan',
  'grandkhavatari': 'grandKhavatari',
  'grandKhavatari': 'grandKhavatari',
  'dominator': 'dominator',
  'doomcryer': 'doomcryer',
  'fortuneSeeker': 'fortuneSeeker',
  'fortuneseeker': 'fortuneSeeker',
  'maestro': 'maestro'
};

const RACE_PREFIXES = [
  'human_', 'darkelf_', 'dark_elf_', 'elf_', 'elven_', 'orc_', 'dwarf_', 'kamael_', 'sylph_', 'highelf_', 'high_elf_', 'ertheia_',
  'human', 'darkelf', 'elf', 'elven', 'orc', 'dwarf', 'kamael', 'sylph', 'highelf', 'ertheia'
];

const EXTENDED_FALLBACKS = {
  'elvenmage': 'elfMage',
  'elven_mage': 'elfMage',
  'elvenwizard': 'elfMage',
  'elven_wizard': 'elfMage',
  'elvenfighter': 'elfFighter',
  'elven_fighter': 'elfFighter',
  'elfdeathknight': 'deathPilgrim',
  'elf_death_knight': 'deathPilgrim',
  'elvendeathknight': 'deathPilgrim',
  'elven_death_knight': 'deathPilgrim',
  'dwarfmage': 'dwarf_mage',
  'dwarf_mage': 'dwarf_mage',
  'dwarf-mage': 'dwarf_mage',
  'dwarf_magician': 'dwarf_mage',
  'dwarfmagician': 'dwarf_mage'
};

// ─── Mapeamento Canônico de Classes Base por Raça (Nível 1) ─────────────────
const BASE_CLASS_RACE_MAP = {
  human: {
    fighter: 'human_fighter',
    humanfighter: 'human_fighter',
    mage: 'human_mystic',
    humanmage: 'human_mystic',
    mystic: 'human_mystic',
    humanmystic: 'human_mystic'
  },
  elf: {
    fighter: 'elf_fighter',
    elffighter: 'elf_fighter',
    elvenfighter: 'elf_fighter',
    mage: 'elf_mage',
    elfmage: 'elf_mage',
    elvenmage: 'elf_mage',
    wizard: 'elf_mage'
  },
  darkelf: {
    fighter: 'dark_elf_fighter',
    darkelffighter: 'dark_elf_fighter',
    palusknight: 'dark_elf_palus_knight',
    mage: 'dark_elf_mage',
    darkelfmage: 'dark_elf_mage',
    darkwizard: 'dark_elf_wizard'
  },
  dark_elf: {
    fighter: 'dark_elf_fighter',
    darkelffighter: 'dark_elf_fighter',
    palusknight: 'dark_elf_palus_knight',
    mage: 'dark_elf_mage',
    darkelfmage: 'dark_elf_mage',
    darkwizard: 'dark_elf_wizard'
  },
  orc: {
    fighter: 'orc_fighter',
    orcfighter: 'orc_fighter',
    orcbase: 'orc_fighter',
    raider: 'orc_raider',
    orcraider: 'orc_raider',
    monk: 'orc_monk',
    orcmonk: 'orc_monk',
    mage: 'orc_mage',
    orcmage: 'orc_mage',
    shaman: 'orc_shaman',
    orcshaman: 'orc_shaman'
  },
  dwarf: {
    artisan: 'dwarf_artisan',
    artisandwarf: 'dwarf_artisan',
    fighter: 'dwarf_artisan',
    dwarffighter: 'dwarf_artisan',
    scavenger: 'dwarf_scavenger',
    mage: 'dwarf_mage'
  },
  kamael: {
    soulbreaker: 'kamael_soulbreaker',
    soulbreakerkamael: 'kamael_soulbreaker',
    fighter: 'kamael_soulbreaker',
    samurai: 'kamael_samurai'
  },
  sylph: {
    gunner: 'ertheia_storm_blaster',
    sylphgunner: 'ertheia_storm_blaster',
    fighter: 'ertheia_storm_blaster'
  },
  highelf: {
    base: 'high_elf_divine_templar',
    highelfbase: 'high_elf_divine_templar',
    fighter: 'high_elf_divine_templar',
    mage: 'high_elf_element_weaver'
  },
  high_elf: {
    base: 'high_elf_divine_templar',
    highelfbase: 'high_elf_divine_templar',
    fighter: 'high_elf_divine_templar',
    mage: 'high_elf_element_weaver'
  },
  ertheia: {
    marauder: 'ertheia_marauder',
    bloodrose: 'dark_elf_blood_rose',
    bloodrosebase: 'dark_elf_blood_rose',
    fighter: 'ertheia_marauder',
    mage: 'dark_elf_blood_rose'
  }
};

// Índice dinâmico de todos os 98 nós oficiais do Grafo DAG de Linhagem
const ALL_DAG_CLASS_IDS = new Set([
  ...ACTIVE_CLASSES.map(c => c.id),
  ...HISTORICAL_CLASSES.map(c => c.id)
]);

// Mapa reverso dinâmico de sourceClassId e classes ativas para IDs canônicos do DAG
const DAG_LOOKUP = new Map();

for (const cls of ACTIVE_CLASSES) {
  DAG_LOOKUP.set(cls.id, cls.id);
  DAG_LOOKUP.set(cls.id.toLowerCase(), cls.id);
  DAG_LOOKUP.set(cls.id.toLowerCase().replace(/[-_\s]+/g, ''), cls.id);
  if (cls.id.startsWith('human_')) {
    const short = cls.id.replace('human_', '');
    DAG_LOOKUP.set(short, cls.id);
    DAG_LOOKUP.set(short.replace(/[-_\s]+/g, ''), cls.id);
  }
}

for (const cls of HISTORICAL_CLASSES) {
  DAG_LOOKUP.set(cls.id, cls.id);
  DAG_LOOKUP.set(cls.id.toLowerCase(), cls.id);
  DAG_LOOKUP.set(cls.id.toLowerCase().replace(/[-_\s]+/g, ''), cls.id);
  if (cls.sourceClassId) {
    DAG_LOOKUP.set(cls.sourceClassId, cls.id);
    DAG_LOOKUP.set(cls.sourceClassId.toLowerCase(), cls.id);
    DAG_LOOKUP.set(cls.sourceClassId.toLowerCase().replace(/[-_\s]+/g, ''), cls.id);
  }
}

/**
 * Resolve qualquer identificador de classe de runtime (curto, legado ou Echo)
 * para o nó canônico correspondente no Grafo DAG de Linhagem (98 entidades canônicas).
 *
 * @param {string|object} classId - Identificador original ou objeto de personagem
 * @param {string} [race] - Raça do personagem para desambiguação
 * @returns {string} ID do nó no DAG (ex: 'human_fighter', 'human_mystic', etc.)
 */
export function resolveCanonicalDagClassId(classId, race = null) {
  if (typeof classId === 'object' && classId !== null) {
    race = race || classId.race;
    classId = classId.class;
  }
  if (!classId) return 'human_fighter';

  if (ALL_DAG_CLASS_IDS.has(classId)) return classId;

  const raw = String(classId).trim();
  const lower = raw.toLowerCase();
  const cleaned = lower.replace(/[-_\s]+/g, '');

  if (ALL_DAG_CLASS_IDS.has(lower)) return lower;

  // 1. Desambiguação de IDs base através da raça
  const normRace = race ? String(race).toLowerCase().trim().replace(/[-_\s]+/g, '') : null;
  if (normRace && BASE_CLASS_RACE_MAP[normRace]) {
    const racePool = BASE_CLASS_RACE_MAP[normRace];
    if (racePool[lower]) return racePool[lower];
    if (racePool[cleaned]) return racePool[cleaned];
  }

  // 2. Mapeamento direto de classes históricas e ativas
  if (DAG_LOOKUP.has(classId)) return DAG_LOOKUP.get(classId);
  if (DAG_LOOKUP.has(lower)) return DAG_LOOKUP.get(lower);
  if (DAG_LOOKUP.has(cleaned)) return DAG_LOOKUP.get(cleaned);

  // 3. Fallbacks de classes base por convenção
  if (cleaned === 'fighter') {
    if (normRace && BASE_CLASS_RACE_MAP[normRace]?.fighter) {
      return BASE_CLASS_RACE_MAP[normRace].fighter;
    }
    return 'human_fighter';
  }
  if (cleaned === 'mage') {
    if (normRace && BASE_CLASS_RACE_MAP[normRace]?.mage) {
      return BASE_CLASS_RACE_MAP[normRace].mage;
    }
    return 'human_mystic';
  }

  return classId;
}

/**
 * Resolve o ID canônico de uma classe através do mapa de aliases de forma extremamente resiliente.
 * Suporta desambiguação por raça para IDs de runtime curtos (ex: fighter, mage).
 *
 * @param {string|object} classId - Identificador original, apelido ou objeto de personagem
 * @param {string} [race] - Raça opcional do personagem
 * @returns {string} ID canônico reconhecido no sistema
 */
export function resolveCanonicalClassId(classId, race = null) {
  if (typeof classId === 'object' && classId !== null) {
    race = race || classId.race;
    classId = classId.class;
  }
  if (!classId) return 'fighter';

  const raw = String(classId).trim();
  const lower = raw.toLowerCase();
  const cleaned = lower.replace(/[-_\s]+/g, '');

  // Desambiguação de ID curto com raça explícita (Item 9 das Diretrizes)
  if (race) {
    const normRace = String(race).toLowerCase().trim().replace(/[-_\s]+/g, '');
    if (BASE_CLASS_RACE_MAP[normRace]) {
      const racePool = BASE_CLASS_RACE_MAP[normRace];
      if (racePool[lower]) return racePool[lower];
      if (racePool[cleaned]) return racePool[cleaned];
    }
  }

  // 1. Verificação direta
  if (CLASS_ALIASES[classId]) return CLASS_ALIASES[classId];
  if (EXTENDED_FALLBACKS[classId]) return EXTENDED_FALLBACKS[classId];

  // 2. Normalização em minúsculas
  if (CLASS_ALIASES[lower]) return CLASS_ALIASES[lower];
  if (EXTENDED_FALLBACKS[lower]) return EXTENDED_FALLBACKS[lower];

  // 3. Normalização removendo separadores (underscores, hífens, espaços)
  if (CLASS_ALIASES[cleaned]) return CLASS_ALIASES[cleaned];
  if (EXTENDED_FALLBACKS[cleaned]) return EXTENDED_FALLBACKS[cleaned];

  // 4. Remoção inteligente de prefixos de raça
  for (const prefix of RACE_PREFIXES) {
    if (lower.startsWith(prefix)) {
      if (prefix.startsWith('dwarf')) {
        const after = lower.slice(prefix.length).replace(/^[-_\s]+/, '');
        if (after === 'mage' || after === 'magician') return 'dwarf_mage';
      }
      const stripped = lower.slice(prefix.length).replace(/^[-_\s]+/, '');
      if (CLASS_ALIASES[stripped]) return CLASS_ALIASES[stripped];
      const strippedClean = stripped.replace(/[-_\s]+/g, '');
      if (CLASS_ALIASES[strippedClean]) return CLASS_ALIASES[strippedClean];
      if (DAG_LOOKUP.has(stripped)) return DAG_LOOKUP.get(stripped);
      if (DAG_LOOKUP.has(strippedClean)) return DAG_LOOKUP.get(strippedClean);
      if (ALL_DAG_CLASS_IDS.has(stripped)) return stripped;
    }
  }

  return classId;
}

/**
 * Retorna o ID canônico de personagem a partir do estado do personagem.
 * @param {object} character - Objeto de estado { class, race, ... }
 * @returns {string} ID canônico
 */
export function getCanonicalCharacterClass(character) {
  if (!character) return 'human_fighter';
  return resolveCanonicalDagClassId(character.class || character, character.race);
}

