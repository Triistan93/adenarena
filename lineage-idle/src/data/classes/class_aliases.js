/**
 * class_aliases.js — Dicionário Universal de Aliases e Resolução de Classes
 * 
 * Mapeia variações de nomes, identificadores legados e seleções do criador de personagem
 * para os IDs canônicos oficiais definidos em CLASSES_ECHO.
 */

export const CLASS_ALIASES = {
  // 🗡️ Assassin (Humano e Elfo Negro)
  'assassinbase': 'assassinS0',
  'assassinBase': 'assassinS0',
  'assassin': 'assassinS0',
  'assassins0': 'assassinS0',
  'assassins1': 'assassinS1',
  'assassins2': 'assassinS2',
  'assassins3': 'assassinS3',
  'assassinde': 'assassinDE',
  'assassinDE': 'assassinDE',
  'human_assassin': 'assassinS0',
  'darkelf_assassin': 'assassinS0',

  // 💀 Death Knight (Humano e Elfo Negro)
  'deathpilgrim': 'deathPilgrim',
  'deathPilgrim': 'deathPilgrim',
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
  'vanguardrider': 'vanguardRider',
  'vanguardRider': 'vanguardRider',

  // ⚒️ Anão Artesão / Scavenger / ShineMaker
  'artisan': 'artisanDwarf',
  'artisandwarf': 'artisanDwarf',
  'artisanDwarf': 'artisanDwarf',
  'scavenger': 'scavenger',
  'dwarffighter': 'dwarfFighter',
  'dwarfFighter': 'dwarfFighter',
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
  'sharpshooter': 'sharpshooter',
  'windsniper': 'windSniper',
  'stormblaster': 'stormBlaster',

  // ✨ High Elf (Templar / Element Weaver / ShineMaker)
  'highelfbase': 'highElfBase',
  'highElfBase': 'highElfBase',
  'divinetemplars1': 'divineTemplarS1',
  'divineTemplarS1': 'divineTemplarS1',
  'elementweavers1': 'elementWeaverS1',
  'elementWeaverS1': 'elementWeaverS1',

  // 🌹 Ertheia (Blood Rose / Marauder / Sayha Seeker)
  'bloodrosebase': 'bloodRoseBase',
  'bloodRoseBase': 'bloodRoseBase',
  'bloodroses1': 'bloodRoseS1',
  'bloodRoseS1': 'bloodRoseS1',
  'marauder': 'marauder',
  'eviscerator': 'eviscerator',
  'sayhaseer': 'sayhaSeer',
  'sayhaSeer': 'sayhaSeer',

  // 🏹 / ⚔️ / 🔮 Classes Clássicas Élficas e Orcs
  'elffighter': 'elfFighter',
  'elfFighter': 'elfFighter',
  'elfmage': 'elfMage',
  'elfMage': 'elfMage',
  'darkelffighter': 'darkElfFighter',
  'darkElfFighter': 'darkElfFighter',
  'darkelfmage': 'darkElfMage',
  'darkElfMage': 'darkElfMage',
  'orcfighter': 'orcFighter',
  'orcFighter': 'orcFighter',
  'orcmage': 'orcMage',
  'orcMage': 'orcMage'
};

/**
 * Resolve o ID canônico de uma classe através do mapa de aliases.
 * @param {string} classId - Identificador original ou apelido
 * @returns {string} ID canônico
 */
export function resolveCanonicalClassId(classId) {
  if (!classId) return classId;
  if (CLASS_ALIASES[classId]) return CLASS_ALIASES[classId];
  const lower = String(classId).toLowerCase();
  if (CLASS_ALIASES[lower]) return CLASS_ALIASES[lower];
  return classId;
}
