/**
 * class_aliases.js — Dicionário Universal de Aliases e Resolução Canônica de Classes
 * 
 * Mapeia variações de nomes, identificadores legados, seleções do criador de personagem,
 * e chaves de imagens/sprites para os IDs canônicos oficiais definidos em CLASSES_ECHO.
 */

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
  'orc_rider': 'rider',
  'orc_vanguard': 'rider',
  'orc_vanguardbase': 'rider',
  'orc_vanguardrider': 'vanguardRider',
  'vanguardrider': 'vanguardRider',
  'vanguardRider': 'vanguardRider',

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
  'shinemakerS3': 'shineMakerS3',

  // ⛩️ Kamael Soulbreaker / Trooper / Hatamoto (Samurai)
  'soulbreaker': 'kamaelSoldier',
  'kamaelsoldier': 'kamaelSoldier',
  'kamaelSoldier': 'kamaelSoldier',
  'kamael_soldier': 'kamaelSoldier',
  'kamael_fighter': 'kamaelSoldier',
  'kamael_samurai': 'kamaelSoldier',
  'kamael_samuraibase': 'kamaelSoldier',
  'kamael_hatamoto': 'kamaelSoldier',
  'trooper': 'trooper',
  'warder': 'warder',
  'soulfinder': 'soulFinder',
  'soulFinder': 'soulFinder',
  'hatamoto': 'hatamoto',
  'samurai': 'samurai',
  'shogun': 'shogun',

  // 🔫 Sylph Gunner / Storm Blaster
  'sylphgunner': 'sylphGunner',
  'sylphGunner': 'sylphGunner',
  'sylph_gunner': 'sylphGunner',
  'sylph_fighter': 'sylphGunner',
  'sharpshooter': 'sharpshooter',
  'windsniper': 'windSniper',
  'stormblaster': 'stormBlaster',

  // ✨ High Elf (Templar / Element Weaver / ShineMaker)
  'highelfbase': 'highElfBase',
  'highElfBase': 'highElfBase',
  'highelf_base': 'highElfBase',
  'highelf_templar': 'highElfBase',
  'highelf_templarbase': 'highElfBase',
  'highelf_shinemakerbase': 'shineMakerS1',
  'divinetemplars1': 'divineTemplarS1',
  'divineTemplarS1': 'divineTemplarS1',
  'elementweavers1': 'elementWeaverS1',
  'elementWeaverS1': 'elementWeaverS1',

  // 🌹 Ertheia (Blood Rose / Marauder / Sayha Seeker)
  'bloodrosebase': 'bloodRoseBase',
  'bloodRoseBase': 'bloodRoseBase',
  'ertheia_bloodrose': 'bloodRoseBase',
  'ertheia_bloodrosebase': 'bloodRoseBase',
  'bloodroses1': 'bloodRoseS1',
  'bloodRoseS1': 'bloodRoseS1',
  'marauder': 'marauder',
  'eviscerator': 'eviscerator',
  'sayhaseer': 'sayhaSeer',
  'sayhaSeer': 'sayhaSeer',

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
  'human_', 'darkelf_', 'dark_elf_', 'elf_', 'orc_', 'dwarf_', 'kamael_', 'sylph_', 'highelf_', 'high_elf_', 'ertheia_',
  'human', 'darkelf', 'elf', 'orc', 'dwarf', 'kamael', 'sylph', 'highelf', 'ertheia'
];

/**
 * Resolve o ID canônico de uma classe através do mapa de aliases de forma extremamente resiliente.
 * @param {string} classId - Identificador original ou apelido
 * @returns {string} ID canônico reconhecido no sistema
 */
export function resolveCanonicalClassId(classId) {
  if (!classId) return 'fighter';
  
  // 1. Verificação direta
  if (CLASS_ALIASES[classId]) return CLASS_ALIASES[classId];

  // 2. Normalização em minúsculas
  const lower = String(classId).toLowerCase().trim();
  if (CLASS_ALIASES[lower]) return CLASS_ALIASES[lower];

  // 3. Normalização removendo separadores (underscores, hífens, espaços)
  const cleaned = lower.replace(/[-_\s]+/g, '');
  if (CLASS_ALIASES[cleaned]) return CLASS_ALIASES[cleaned];

  // 4. Remoção inteligente de prefixos de raça
  for (const prefix of RACE_PREFIXES) {
    if (lower.startsWith(prefix)) {
      const stripped = lower.slice(prefix.length).replace(/^[-_\s]+/, '');
      if (CLASS_ALIASES[stripped]) return CLASS_ALIASES[stripped];
      const strippedClean = stripped.replace(/[-_\s]+/g, '');
      if (CLASS_ALIASES[strippedClean]) return CLASS_ALIASES[strippedClean];
      if (stripped) return stripped;
    }
  }

  return classId;
}
