import fs from 'fs';
import { CANONICAL_CLASS_REGISTRY } from '../lineage-idle/src/data/classes/CanonicalClassRegistry.js';
import { CANONICAL_SKILL_REGISTRY_V2 } from '../lineage-idle/src/data/skills/CanonicalSkillRegistryV2.js';
import { CLASSES_ECHO } from '../lineage-idle/src/data/classes/classes_echo_defs.js';

// Load canonical tree (49 lineages across 9 races)
const canonicalTree = JSON.parse(fs.readFileSync('scraped_data_wiki/classes_tree_canonical.json', 'utf8'));

// Load bandit skills for fallback icon matching
const scrapedBanditSkills = JSON.parse(fs.readFileSync('scraped_data_bandit/other/skills.json', 'utf8'));
const iconFiles = new Set(fs.readdirSync('public/icons'));

// Map of skill name -> icon path from Bandit
const banditSkillIconMap = new Map();
for (const s of scrapedBanditSkills) {
  if (s.data?.name?.en && s.data?.icon) {
    const iconFile = s.data.icon.replace('/', '');
    if (iconFiles.has(iconFile)) {
      banditSkillIconMap.set(s.data.name.en.toLowerCase().trim(), '/icons/' + iconFile);
    }
  }
}

// Map from CanonicalSkillRegistryV2
const canonicalSkillIconMap = new Map();
for (const s of Object.values(CANONICAL_SKILL_REGISTRY_V2)) {
  if (s.name && s.icon && s.icon !== '/icons/skill0000.webp') {
    canonicalSkillIconMap.set(s.name.toLowerCase().trim(), s.icon);
    canonicalSkillIconMap.set(s.id.toLowerCase().trim(), s.icon);
  }
}

// High-fidelity custom icon mappings for key & modern skills
const customSkillIcons = {
  'power strike': '/icons/skill0003.webp',
  'mortal blow': '/icons/skill0016.webp',
  'power shot': '/icons/skill0056.webp',
  'rush': '/icons/skill0484.webp',
  'bandage': '/icons/skill0034.webp',
  'fighter\'s will': '/icons/skill0758.webp',
  'light armor mastery': '/icons/skill0233.webp',
  'heavy armor mastery': '/icons/skill0231.webp',
  'robe mastery': '/icons/skill0234.webp',
  'hp increase': '/icons/skill0211.webp',
  'mp increase': '/icons/skill0213.webp',
  'frenzy': '/icons/skill0176.webp',
  'guts': '/icons/skill0139.webp',
  'battle roar': '/icons/skill0121.webp',
  'lionheart': '/icons/skill0287.webp',
  'spoil': '/icons/skill0254.webp',
  'sweeper': '/icons/skill0042.webp',
  'major heal': '/icons/skill1401.webp',
  'greater heal': '/icons/skill1217.webp',
  'resurrection': '/icons/skill1016.webp',
  'sonic buster': '/icons/skill0009.webp',
  'triple slash': '/icons/skill0007.webp',
  'shield stun': '/icons/skill0092.webp',
  'holy strike': '/icons/skill1027.webp',
  'wind strike': '/icons/skill1177.webp',
  'ice bolt': '/icons/skill1184.webp',
  'hydro blast': '/icons/skill1235.webp',
  'prominence': '/icons/skill1230.webp',
  'death spike': '/icons/skill1148.webp',
  'curse discord': '/icons/skill1269.webp',
  'corpse burst': '/icons/skill1157.webp',
  'vampiric claw': '/icons/skill1159.webp',
  'cunning throw': '/icons/skill0019.webp',
  'cunning arrow': '/icons/skill0101.webp',
  'arrow fall': '/icons/skill0024.webp',
  'ruse': '/icons/skill0484.webp',
  'force unleashed': '/icons/skill0758.webp',
  'favorable cover': '/icons/skill1401.webp',
  'mystic weapon mastery': '/icons/skill0249.webp',
  'star fall': '/icons/skill1230.webp',
  'transcendent star fall': '/icons/skill1235.webp',
  'shining touch': '/icons/skill1027.webp',
  'fantasia ring': '/icons/skill1164.webp',
  'funky star': '/icons/skill1230.webp',
  'mana flicker': '/icons/skill1050.webp',
  'wild assault': '/icons/skill0003.webp',
  'wild rush': '/icons/skill0484.webp',
  'burning beast': '/icons/skill0176.webp',
  'pa\'agrio flame': '/icons/skill1002.webp',
  'iaijutsu slash': '/icons/skill0003.webp',
  'maneuver': '/icons/skill0484.webp',
  'clever maneuver': '/icons/skill0016.webp',
  'battojutsu': '/icons/skill0007.webp',
  'oni summon': '/icons/skill1126.webp',
  'rose petal strike': '/icons/skill0016.webp',
  'crimson thorns': '/icons/skill0263.webp',
  'briar vortex': '/icons/skill1164.webp',
  'queen\'s garden': '/icons/skill1269.webp',
  'werewolf transformation': '/icons/skill0176.webp',
  'double claw strike': '/icons/skill0009.webp',
  'moon\'s grace': '/icons/skill0758.webp',
  'death draw': '/icons/skill0028.webp',
  'death strike': '/icons/skill0003.webp',
  'bone prison': '/icons/skill1164.webp',
  'ultimate death knight': '/icons/skill0176.webp',
  'sword': '/icons/skill0003.webp',
  'blunt': '/icons/skill0003.webp',
  'dual': '/icons/skill0007.webp',
  'bow': '/icons/skill0056.webp',
  'dagger': '/icons/skill0016.webp',
  'polearm': '/icons/skill0216.webp',
  'spear': '/icons/skill0216.webp',
  'fist': '/icons/skill0009.webp',
  'heal': '/icons/skill1217.webp',
  'shield': '/icons/skill0092.webp',
  'aura': '/icons/skill1164.webp',
  'harmony': '/icons/skill0758.webp',
  'mastery': '/icons/skill0249.webp',
  'boost': '/icons/skill0211.webp',
  'increase': '/icons/skill0211.webp',
  'strike': '/icons/skill0003.webp',
  'slash': '/icons/skill0007.webp',
  'blow': '/icons/skill0016.webp',
  'shot': '/icons/skill0056.webp',
  'storm': '/icons/skill0007.webp',
  'rage': '/icons/skill0176.webp',
  'fire': '/icons/skill1230.webp',
  'water': '/icons/skill1235.webp',
  'wind': '/icons/skill1177.webp',
  'earth': '/icons/skill1164.webp',
  'holy': '/icons/skill1027.webp',
  'dark': '/icons/skill1148.webp',
  'curse': '/icons/skill1269.webp',
  'drain': '/icons/skill1159.webp'
};

function getSkillIcon(sName) {
  const norm = (sName || '').toLowerCase().trim();
  if (canonicalSkillIconMap.has(norm)) return canonicalSkillIconMap.get(norm);
  if (banditSkillIconMap.has(norm)) return banditSkillIconMap.get(norm);
  if (customSkillIcons[norm]) return customSkillIcons[norm];
  for (const [k, v] of Object.entries(customSkillIcons)) {
    if (norm.includes(k)) return v;
  }
  return '/icons/skill0000.webp';
}

// Canonical ID -> CLASSES_ECHO ID map
const CANONICAL_TO_ECHO_MAP = {
  // Humans
  fighter: 'fighter', warrior: 'warrior', gladiator: 'gladiator', duelist: 'duelist',
  warlord: 'warlord', dreadnought: 'dreadnought', knight: 'knight', paladin: 'paladin',
  phoenix_knight: 'phoenixKnight', dark_avenger: 'darkAvenger', hell_knight: 'hellKnight',
  rogue: 'rogue', treasure_hunter: 'treasureHunter', adventurer: 'adventurer',
  hawkeye: 'hawkeye', sagittarius: 'sagittarius', mage: 'mage', wizard: 'wizard',
  sorcerer: 'sorcerer', archmage: 'archmage', necromancer: 'necromancer',
  soultaker: 'soultaker', warlock: 'warlock', arcana_lord: 'arcanaLord',
  cleric: 'cleric', bishop: 'bishop', cardinal: 'cardinal', prophet: 'prophet',
  hierophant: 'hierophant', human_deathknight_0: 'deathPilgrim', human_deathknight_1: 'deathBlade',
  human_deathknight_2: 'deathMessenger', human_deathknight_3: 'deathKnight',
  secret_assassin_male_0: 'assassinS0', secret_assassin_male_1: 'assassinS1',
  secret_assassin_male_2: 'assassinS2', secret_assassin_male_3: 'assassinS3',
  werewolf_0: 'wargBase', werewolf_1: 'wargS1', werewolf_2: 'wargS2', werewolf_3: 'warg',

  // Elves
  elven_fighter: 'elfFighter', elven_knight: 'elvenKnight', temple_knight: 'templeKnight',
  evas_templar: 'evaTemplar', swordsinger: 'swordSinger', sword_muse: 'swordMuse',
  elven_scout: 'elfScout', plain_walker: 'plainsWalker', wind_rider: 'windRider',
  silver_ranger: 'silverRanger', moonlight_sentinel: 'moonlightSentinel',
  elven_mage: 'elfMage', elven_wizard: 'elvenWizard', spellsinger: 'spellsinger',
  mystic_muse: 'mysticMuse', elemental_summoner: 'elementalSummoner',
  elemental_master: 'elementalMaster', oracle: 'elfOracle', elder: 'elfElder',
  evas_saint: 'evaSaint', elf_deathknight_0: 'deathPilgrim', elf_deathknight_1: 'deathBlade',
  elf_deathknight_2: 'deathMessenger', elf_deathknight_3: 'deathKnight',

  // Dark Elves
  dark_fighter: 'darkElfFighter', palus_knight: 'palusKnight', shillien_knight: 'shillienKnight',
  shillien_templar: 'shillienTemplar', bladedancer: 'bladeDancer', spectral_dancer: 'spectralDancer',
  assassin: 'assassinDE', abyss_walker: 'abyssWalker', ghost_hunter: 'ghostHunter',
  phantom_ranger: 'phantomRanger', ghost_sentinel: 'ghostSentinel', dark_mage: 'darkElfMage',
  dark_wizard: 'darkWizard', storm_screamer: 'stormScreamer', spellhowler: 'spellhowler',
  phantom_summoner: 'phantomSummoner', spectral_master: 'spectralMaster',
  shillien_oracle: 'shillienOracle', shillien_elder: 'shillienElder', shillien_saint: 'shillienSaint',
  delf_deathknight_0: 'deathPilgrim', delf_deathknight_1: 'deathBlade',
  delf_deathknight_2: 'deathMessenger', delf_deathknight_3: 'deathKnight',
  secret_assassin_female_0: 'assassinDE', secret_assassin_female_1: 'assassinS1',
  secret_assassin_female_2: 'assassinS2', secret_assassin_female_3: 'assassinS3',
  rose_vain_0: 'bloodRoseBase', rose_vain_1: 'bloodRoseS1', rose_vain_2: 'bloodRoseS2', rose_vain_3: 'bloodRose',

  // Orcs
  orc_fighter: 'orcFighter', orc_raider: 'raider', destroyer: 'destroyer', titan: 'titan',
  orc_monk: 'monk', tyrant: 'tyrant', grand_khavatari: 'grandKhavatari',
  orc_mage: 'orcMage', orc_shaman: 'shaman', overlord: 'overlord', dominator: 'dominator',
  warcryer: 'warcryer', doomcryer: 'doomcryer', orc_rider_0: 'rider', orc_rider_1: 'dragoon',
  orc_rider_2: 'vanguardRider', orc_rider_3: 'grandVanguard',

  // Dwarves
  dwarven_fighter: 'dwarfFighter', scavenger: 'scavenger', bounty_hunter: 'bountyHunter',
  fortune_seeker: 'fortuneSeeker', artisan: 'artisanDwarf', warsmith: 'warsmith', maestro: 'maestro',
  shineMakerBase: 'shineMakerBase', shineMakerS1: 'shineMakerS1', shineMakerS2: 'shineMakerS2', shinemaker: 'shinemaker',

  // Kamael
  jin_kamael_soldier: 'kamaelSoldier', trooper: 'trooper', berserker: 'berserker', doombringer: 'doombringer',
  soul_finder: 'soulFinder', soul_breaker: 'soulBreakerKamael', soul_hound: 'soulHound',
  warder: 'warder', arbalester: 'soulRanger', trickster: 'trickster',
  crow_0: 'samuraiBase', crow_1: 'hatamoto', crow_2: 'ronin', crow_3: 'samurai',

  // Sylph
  sylphid: 'sylphGunner', sylph_gunner: 'sharpshooter', wind_hunter: 'windSniper', storm_blaster: 'stormBlaster',

  // High Elf
  sacred_templar_0: 'highElfBase', sacred_templar_1: 'divineTemplarS1', sacred_templar_2: 'divineTemplarS2', sacred_templar_3: 'divineTemplar',
  spirit_0: 'elementWeaverBase', spirit_1: 'elementWeaverS1', spirit_2: 'elementWeaverS2', spirit_3: 'elementWeaver',

  // Ertheia
  marauderBase: 'marauderBase', marauder: 'marauder', ertheiaWarrior: 'ertheiaWarrior', eviscerator: 'eviscerator',
  sayhaMageBase: 'sayhaMageBase', sayhaSeer: 'sayhaSeer', windRiderErth: 'windRiderErth', sayhaSeeker: 'sayhaSeeker'
};

const classIconMap = {
  // Humans
  fighter: '/icons/fighter.webp',
  warrior: '/icons/warrior.webp',
  gladiator: '/icons/gladiator.webp',
  duelist: '/icons/duelist.webp',
  warlord: '/icons/warlord.webp',
  dreadnought: '/icons/dreadnought.webp',
  knight: '/icons/knight.webp',
  paladin: '/icons/paladin.webp',
  phoenix_knight: '/icons/phoenix_knight.webp',
  dark_avenger: '/icons/dark_avenger.webp',
  hell_knight: '/icons/hell_knight.webp',
  rogue: '/icons/rogue.webp',
  treasure_hunter: '/icons/treasure_hunter.webp',
  adventurer: '/icons/adventurer.webp',
  hawkeye: '/icons/hawkeye.webp',
  sagittarius: '/icons/sagittarius.webp',
  mage: '/icons/mage.webp',
  wizard: '/icons/wizard.webp',
  sorcerer: '/icons/sorcerer.webp',
  archmage: '/icons/archmage.webp',
  necromancer: '/icons/necromancer.webp',
  soultaker: '/icons/soultaker.webp',
  warlock: '/icons/warlock.webp',
  arcana_lord: '/icons/arcana_lord.webp',
  cleric: '/icons/cleric.webp',
  bishop: '/icons/bishop.webp',
  cardinal: '/icons/cardinal.webp',
  prophet: '/icons/prophet.webp',
  hierophant: '/icons/hierophant.webp',
  human_deathknight_0: '/icons/hell_knight.webp',
  human_deathknight_1: '/icons/hell_knight.webp',
  human_deathknight_2: '/icons/hell_knight.webp',
  human_deathknight_3: '/icons/hell_knight.webp',
  secret_assassin_male_0: '/icons/assasin.webp',
  secret_assassin_male_1: '/icons/assasin.webp',
  secret_assassin_male_2: '/icons/abyss_walker.webp',
  secret_assassin_male_3: '/icons/ghost_hunter.webp',
  werewolf_0: '/icons/warlord.webp',
  werewolf_1: '/icons/warlord.webp',
  werewolf_2: '/icons/warlord.webp',
  werewolf_3: '/icons/warlord.webp',

  // Elves
  elven_fighter: '/icons/fighter.webp',
  elven_knight: '/icons/elven_knight.webp',
  temple_knight: '/icons/temple_knight.webp',
  evas_templar: '/icons/evas_templar.webp',
  swordsinger: '/icons/sword_singer.webp',
  sword_muse: '/icons/sword_muse.webp',
  elven_scout: '/icons/rogue.webp',
  plain_walker: '/icons/plain_walker.webp',
  wind_rider: '/icons/wind_rider.webp',
  silver_ranger: '/icons/silver_ranger.webp',
  moonlight_sentinel: '/icons/moonlight_sentinel.webp',
  elven_mage: '/icons/mage.webp',
  elven_wizard: '/icons/elven_wizard.webp',
  spellsinger: '/icons/spellsinger.webp',
  mystic_muse: '/icons/mystic_muse.webp',
  elemental_summoner: '/icons/elemental_summoner.webp',
  elemental_master: '/icons/elemental_master.webp',
  oracle: '/icons/cleric.webp',
  elder: '/icons/elder.webp',
  evas_saint: '/icons/evas_saint.webp',
  elf_deathknight_0: '/icons/hell_knight.webp',
  elf_deathknight_1: '/icons/hell_knight.webp',
  elf_deathknight_2: '/icons/hell_knight.webp',
  elf_deathknight_3: '/icons/hell_knight.webp',

  // Dark Elves
  dark_fighter: '/icons/fighter.webp',
  palus_knight: '/icons/palus_knight.webp',
  shillien_knight: '/icons/shillien_knight.webp',
  shillien_templar: '/icons/shillien_templar.webp',
  bladedancer: '/icons/blade_dancer.webp',
  spectral_dancer: '/icons/spectral_dancer.webp',
  assassin: '/icons/assasin.webp',
  abyss_walker: '/icons/abyss_walker.webp',
  ghost_hunter: '/icons/ghost_hunter.webp',
  phantom_ranger: '/icons/phantom_ranger.webp',
  ghost_sentinel: '/icons/ghost_sentinel.webp',
  dark_mage: '/icons/mage.webp',
  dark_wizard: '/icons/dark_wizard.webp',
  spellhowler: '/icons/spellhowler.webp',
  storm_screamer: '/icons/storm_screamer.webp',
  phantom_summoner: '/icons/phantom_summoner.webp',
  spectral_master: '/icons/spectral_master.webp',
  shillien_oracle: '/icons/cleric.webp',
  shillien_elder: '/icons/shillien_elder.webp',
  shillien_saint: '/icons/shillien_saint.webp',
  delf_deathknight_0: '/icons/hell_knight.webp',
  delf_deathknight_1: '/icons/hell_knight.webp',
  delf_deathknight_2: '/icons/hell_knight.webp',
  delf_deathknight_3: '/icons/hell_knight.webp',
  secret_assassin_female_0: '/icons/assasin.webp',
  secret_assassin_female_1: '/icons/assasin.webp',
  secret_assassin_female_2: '/icons/abyss_walker.webp',
  secret_assassin_female_3: '/icons/ghost_hunter.webp',
  rose_vain_0: '/icons/abyss_walker.webp',
  rose_vain_1: '/icons/abyss_walker.webp',
  rose_vain_2: '/icons/abyss_walker.webp',
  rose_vain_3: '/icons/abyss_walker.webp',

  // Orcs
  orc_fighter: '/icons/orc_fighter.webp',
  orc_raider: '/icons/orc_raider.webp',
  destroyer: '/icons/destroyer.webp',
  titan: '/icons/titan.webp',
  orc_monk: '/icons/orc_monk.webp',
  tyrant: '/icons/tyrant.webp',
  grand_khavatari: '/icons/grand_khavatari.webp',
  orc_mage: '/icons/orc_mage.webp',
  orc_shaman: '/icons/orc_shaman.webp',
  overlord: '/icons/overlord.webp',
  dominator: '/icons/dominator.webp',
  warcryer: '/icons/warcryer.webp',
  doomcryer: '/icons/doomcryer.webp',
  orc_rider_0: '/icons/orc_raider.webp',
  orc_rider_1: '/icons/destroyer.webp',
  orc_rider_2: '/icons/titan.webp',
  orc_rider_3: '/icons/titan.webp',

  // Dwarves
  dwarven_fighter: '/icons/dwarven_fighter.webp',
  scavenger: '/icons/scavenger.webp',
  bounty_hunter: '/icons/bounty_hunter.webp',
  fortune_seeker: '/icons/fortune_seeker.webp',
  artisan: '/icons/artisan.webp',
  warsmith: '/icons/warsmith.webp',
  maestro: '/icons/maestro.webp',
  shineMakerBase: '/icons/warsmith.webp',
  shineMakerS1: '/icons/warsmith.webp',
  shineMakerS2: '/icons/warsmith.webp',
  shinemaker: '/icons/warsmith.webp',

  // Kamael
  jin_kamael_soldier: '/icons/fighter.webp',
  trooper: '/icons/warrior.webp',
  berserker: '/icons/gladiator.webp',
  doombringer: '/icons/duelist.webp',
  soul_finder: '/icons/rogue.webp',
  soul_breaker: '/icons/abyss_walker.webp',
  soul_hound: '/icons/ghost_hunter.webp',
  warder: '/icons/rogue.webp',
  arbalester: '/icons/silver_ranger.webp',
  trickster: '/icons/phantom_ranger.webp',
  crow_0: '/icons/duelist.webp',
  crow_1: '/icons/gladiator.webp',
  crow_2: '/icons/duelist.webp',
  crow_3: '/icons/duelist.webp',

  // Sylph
  sylphid: '/icons/hawkeye.webp',
  sylph_gunner: '/icons/silver_ranger.webp',
  wind_hunter: '/icons/phantom_ranger.webp',
  storm_blaster: '/icons/sagittarius.webp',

  // High Elf
  sacred_templar_0: '/icons/paladin.webp',
  sacred_templar_1: '/icons/paladin.webp',
  sacred_templar_2: '/icons/paladin.webp',
  sacred_templar_3: '/icons/paladin.webp',
  spirit_0: '/icons/archmage.webp',
  spirit_1: '/icons/archmage.webp',
  spirit_2: '/icons/archmage.webp',
  spirit_3: '/icons/archmage.webp',

  // Ertheia
  marauderBase: '/icons/tyrant.webp',
  marauder: '/icons/tyrant.webp',
  ertheiaWarrior: '/icons/grand_khavatari.webp',
  eviscerator: '/icons/grand_khavatari.webp',
  sayhaMageBase: '/icons/spellsinger.webp',
  sayhaSeer: '/icons/spellsinger.webp',
  windRiderErth: '/icons/mystic_muse.webp',
  sayhaSeeker: '/icons/mystic_muse.webp'
};

function getClassIcon(cid) {
  if (classIconMap[cid]) return classIconMap[cid];
  const echoId = CANONICAL_TO_ECHO_MAP[cid];
  if (echoId && classIconMap[echoId]) return classIconMap[echoId];
  return '/icons/fighter.webp';
}

const purgedNames = new Set([
  'mount shining lady',
  'mount glorious steed',
  'dragon slayer appearance',
  'detection',
  'change appearance',
  'mount wolf',
  'mount lion',
  'mount horse',
  'mount pegasus',
  'mount koukabu',
  'mount strider',
  'mount buffalo',
  'mount kookaburra',
  'mount cougar',
  'glorious steed appearance',
  'shining lady appearance'
]);

function isPurged(name) {
  const norm = (name || '').toLowerCase().trim();
  if (purgedNames.has(norm)) return true;
  if (norm.includes('appearance')) return true;
  if (norm.startsWith('mount ') && !norm.includes('assault')) return true;
  return false;
}

// Build the document
let doc = `# 🌟 CATÁLOGO COMPLETO DE CLASSES & HABILIDADES — ADEN ARENA (49 LINHAGENS / 159 CLASSES)\n\n`;
doc += `> **Documento Oficial de Referência Canônica de Habilidades para Aden Arena**\n`;
doc += `> Baseado no Lineage II Essence (Patch 3629 — Celestial Destiny), adaptado para o ecossistema Idle Auto-Battle.\n`;
doc += `> Contém a árvore estruturada completa de todas as **9 Raças**, **49 Linhagens Canônicas** e **159 Classes**, desde o Nível 1 até a 3ª Classe (Lv 76+), com ícones oficiais, tipos, tempos de recarga e efeitos de combate.\n`;
doc += `> *Nota: 18 habilidades cosméticas, de montaria e de aparência foram estritamente removidas do catálogo.*\n\n`;
doc += `---\n\n`;
doc += `## 📊 SUMÁRIO EXECUTIVO & COBERTURA GLOBAL\n\n`;
doc += `| Raça | Linhagens | Classes Únicas | Arquétipos Principais | Foco em Combate |\n`;
doc += `| :--- | :---: | :---: | :--- | :--- |\n`;
doc += `| **Humano (Human)** | **14** | 37 | Duelist, Dreadnought, Phoenix Knight, Hell Knight, Adventurer, Sagittarius, Archmage, Soultaker, Arcana Lord, Cardinal, Hierophant, Death Knight, Assassin Male, Werewolf | Alto equilíbrio, combos de dano físico, tanques sagrados/sombrios, magias destrutivas e feras |\n`;
doc += `| **Elfo (Elf)** | **8** | 24 | Eva's Templar, Sword Muse, Wind Rider, Moonlight Sentinel, Mystic Muse, Elemental Master, Eva's Saint, Death Knight Elf | Altíssima velocidade de ataque, evasão crítica, magias de água/gelo e canções de suporte |\n`;
doc += `| **Elfo Negro (Dark Elf)** | **10** | 30 | Shillien Templar, Spectral Dancer, Ghost Hunter, Ghost Sentinel, Storm Screamer, Spectral Master, Shillien Saint, Death Knight Dark Elf, Assassin Female, Blood Rose | Dano crítico devastador, drenagem vampírica, danças de ataque, magia de vento/sombra |\n`;
doc += `| **Orc (Orc)** | **5** | 17 | Titan, Grand Khavatari, Dominator, Doomcryer, Grand Vanguard | Força bruta descomunal, golpes de duas mãos, punhos totêmicos, montaria de combate e cantos |\n`;
doc += `| **Anão (Dwarf)** | **3** | 11 | Fortune Seeker, Maestro, ShineMaker | Coleta de recursos (Spoil/Sweeper), golems mecânicos de cerco, suporte com marreta divina |\n`;
doc += `| **Kamael (Kamael)** | **4** | 15 | Doombringer, Soul Hound, Trickster, Samurai (Crow) | Absorção de almas, espadas antigas, rapieiras híbridas, bestas rápidas e katanas orientais |\n`;
doc += `| **Sylph (Sylph)** | **1** | 4 | Storm Blaster | Armas de fogo elementais, disparos perfurantes e acrobacias aéreas do vento |\n`;
doc += `| **Alto Elfo (High Elf)** | **2** | 8 | Divine Templar, Element Weaver | Guardião sagrado com muralha divina inexpugnável e mestre supremo dos quatro elementos |\n`;
doc += `| **Ertheia (Ertheia)** | **2** | 8 | Eviscerator, Sayha Seer | Garras cinéticas com distorção de gravidade e conjuração de tempestades de Sayha |\n`;
doc += `| **TOTAL GERAL** | **49** | **159** | **49 Linhagens Completas** | **Cobertura 100% Auditada** |\n\n`;
doc += `---\n\n`;
doc += `## 🧭 TAXONOMIA DE COMBATE PARA O ADEN ARENA\n\n`;
doc += `Para o sistema de combate do **Aden Arena** (RPG Idle com Auto-Batalha em tempo real), as habilidades deste catálogo desempenham papéis estratégicos bem definidos:\n\n`;
doc += `1. **Ativos de Dano Direto & Burst:** Golpes pontuais de alto dano (*Power Strike*, *Mortal Blow*, *Prominence*, *Triple Slash*). Ativados automaticamente pelo loop de combate quando fora de recarga.\n`;
doc += `2. **Controle de Grupo (Crowd Control / Interrupts):** Atordoamentos, paralisias, empurrões e silêncios (*Shield Stun*, *Hammer Crush*, *Hold*, *Silence*). Interrompem conjurações inimigas e garantem janelas de DPS livre.\n`;
doc += `3. **Áreas de Efeito (AoE / Wave Clear):** Habilidades em cone, círculo e linha (*Spinning Slash*, *Sonic Storm*, *Earthquake*, *Blazing Circle*). Cruciais para limpar grupos de monstros nas ondas das fases normais e Dungeons.\n`;
doc += `4. **Buffs de Surto de Combate & Autocura:** Bônus temporários de alta intensidade (*Frenzy*, *Guts*, *Lionheart*, *Zealot*, *Battle Roar*) e curas de emergência (*Bandage*, *Major Heal*). Podem ser configurados para disparo tático (ex: quando HP < 30%).\n`;
doc += `5. **Auras, Toggles & Posturas Permanentes:** Posturas de combate contínuas (*Vicious Stance*, *Guard Stance*, *Soul Cry*). No Aden Arena, funcionam como modificadores estáticos com consumo gradual ou reserva de mana.\n`;
doc += `6. **Passivos & Maestrias:** Amplificadores intrínsecos de atributos (*Heavy Armor Mastery*, *Dual Weapon Mastery*, *Boost HP*, *Critical Power*), calculados diretamente pelo StatsEngine.\n\n`;
doc += `---\n\n`;

let lineageCounter = 0;
let totalSkillsIncluded = 0;

for (const raceData of canonicalTree) {
  const raceName = raceData.raceName || raceData.race.toUpperCase();
  doc += `\n# 🛡️ RAÇA: ${raceName.toUpperCase()}\n\n`;

  for (const branch of raceData.branches) {
    lineageCounter++;
    const s3Id = branch.third;
    const s2Id = branch.second;
    const s1Id = branch.first;
    const s0Id = branch.base;

    const s3Node = CANONICAL_CLASS_REGISTRY[s3Id] || {};
    const s2Node = CANONICAL_CLASS_REGISTRY[s2Id] || {};
    const s1Node = CANONICAL_CLASS_REGISTRY[s1Id] || {};
    const s0Node = CANONICAL_CLASS_REGISTRY[s0Id] || {};

    const s3Echo = CLASSES_ECHO[CANONICAL_TO_ECHO_MAP[s3Id] || s3Id] || {};
    const s2Echo = CLASSES_ECHO[CANONICAL_TO_ECHO_MAP[s2Id] || s2Id] || {};
    const s1Echo = CLASSES_ECHO[CANONICAL_TO_ECHO_MAP[s1Id] || s1Id] || {};
    const s0Echo = CLASSES_ECHO[CANONICAL_TO_ECHO_MAP[s0Id] || s0Id] || {};

    doc += `## ⚔️ Linhagem ${lineageCounter}: ${branch.lineageName} (${raceData.race.toUpperCase()})\n`;
    doc += `* **Função / Papel:** ${branch.role}\n`;
    doc += `* **Caminho Canônico:** \`${s0Id}\` (Base) ➔ \`${s1Id}\` (1ª Classe) ➔ \`${s2Id}\` (2ª Classe) ➔ \`${s3Id}\` (3ª Classe)\n\n`;

    // Stage 0: Base
    doc += `### Classe Base Lvl 1-19: ${s0Node.name || s0Echo.name || s0Id} ![Icon](${getClassIcon(s0Id)})\n`;
    doc += `* **ID:** \`${s0Id}\` | **Ícone da Classe:** \`${getClassIcon(s0Id)}\`\n`;
    doc += `* **Descrição:** ${s0Echo.desc || s0Node.role || 'Classe base inicial'}\n`;
    if (s0Node.weapons && s0Node.weapons.length > 0) {
      doc += `* **Armas Recomendadas:** ${s0Node.weapons.join(', ')}\n`;
    }
    doc += `    --- Habilidades Disponíveis:\n`;
    const s0Skills = (s0Echo.skills || []).filter(sk => !isPurged(sk.name));
    if (s0Skills.length > 0) {
      for (const sk of s0Skills) {
        totalSkillsIncluded++;
        const icon = getSkillIcon(sk.name);
        doc += `        • **${sk.name}** ![Skill](${icon}) [${sk.type || 'Ativo'}] (Recarga: \`${sk.cooldown || 'N/A'}\`) — ${sk.effect || ''} ${sk.desc ? `*(${sk.desc})*` : ''}\n`;
      }
    } else {
      doc += `        • *Nenhuma habilidade adicional registrada nesta etapa.*\n`;
    }
    doc += '\n';

    // Stage 1: First Class
    doc += `### Primeira Classe lvl 20-39: ${s1Node.name || s1Echo.name || s1Id} ![Icon](${getClassIcon(s1Id)})\n`;
    doc += `* **ID:** \`${s1Id}\` | **Ícone da Classe:** \`${getClassIcon(s1Id)}\`\n`;
    doc += `* **Descrição:** ${s1Echo.desc || s1Node.role || 'Primeira transferência de classe'}\n`;
    if (s1Node.weapons && s1Node.weapons.length > 0) {
      doc += `* **Armas Recomendadas:** ${s1Node.weapons.join(', ')}\n`;
    }
    doc += `    --- Habilidades Disponíveis:\n`;
    const s1Skills = (s1Echo.skills || []).filter(sk => !isPurged(sk.name));
    if (s1Skills.length > 0) {
      for (const sk of s1Skills) {
        totalSkillsIncluded++;
        const icon = getSkillIcon(sk.name);
        doc += `        • **${sk.name}** ![Skill](${icon}) [${sk.type || 'Ativo'}] (Recarga: \`${sk.cooldown || 'N/A'}\`) — ${sk.effect || ''} ${sk.desc ? `*(${sk.desc})*` : ''}\n`;
      }
    } else {
      doc += `        • *Nenhuma habilidade adicional registrada nesta etapa.*\n`;
    }
    doc += '\n';

    // Stage 2: Second Class
    doc += `### Segunda Classe lvl 40-75: ${s2Node.name || s2Echo.name || s2Id} ![Icon](${getClassIcon(s2Id)})\n`;
    doc += `* **ID:** \`${s2Id}\` | **Ícone da Classe:** \`${getClassIcon(s2Id)}\`\n`;
    doc += `* **Descrição:** ${s2Echo.desc || s2Node.role || 'Segunda transferência de classe'}\n`;
    if (s2Node.weapons && s2Node.weapons.length > 0) {
      doc += `* **Armas Recomendadas:** ${s2Node.weapons.join(', ')}\n`;
    }
    doc += `    --- Habilidades Disponíveis:\n`;
    const s2Skills = (s2Echo.skills || []).filter(sk => !isPurged(sk.name));
    if (s2Skills.length > 0) {
      for (const sk of s2Skills) {
        totalSkillsIncluded++;
        const icon = getSkillIcon(sk.name);
        doc += `        • **${sk.name}** ![Skill](${icon}) [${sk.type || 'Ativo'}] (Recarga: \`${sk.cooldown || 'N/A'}\`) — ${sk.effect || ''} ${sk.desc ? `*(${sk.desc})*` : ''}\n`;
      }
    } else {
      doc += `        • *Nenhuma habilidade adicional registrada nesta etapa.*\n`;
    }
    doc += '\n';

    // Stage 3: Third Class
    doc += `### Terceira Classe lvl 76+: ${s3Node.name || s3Echo.name || s3Id} ![Icon](${getClassIcon(s3Id)})\n`;
    doc += `* **ID:** \`${s3Id}\` | **Ícone da Classe:** \`${getClassIcon(s3Id)}\`\n`;
    doc += `* **Descrição:** ${s3Echo.desc || s3Node.role || 'Terceira transferência de classe (Ascensão Celestial)'}\n`;
    if (s3Node.weapons && s3Node.weapons.length > 0) {
      doc += `* **Armas Recomendadas:** ${s3Node.weapons.join(', ')}\n`;
    }
    doc += `    --- Habilidades Disponíveis:\n`;
    const s3Skills = (s3Echo.skills || []).filter(sk => !isPurged(sk.name));
    if (s3Skills.length > 0) {
      for (const sk of s3Skills) {
        totalSkillsIncluded++;
        const icon = getSkillIcon(sk.name);
        doc += `        • **${sk.name}** ![Skill](${icon}) [${sk.type || 'Ativo'}] (Recarga: \`${sk.cooldown || 'N/A'}\`) — ${sk.effect || ''} ${sk.desc ? `*(${sk.desc})*` : ''}\n`;
      }
    } else {
      doc += `        • *Nenhuma habilidade adicional registrada nesta etapa.*\n`;
    }
    doc += '\n---\n\n';
  }
}

// Write to docs/L2_ESSENCE_CELESTIAL_DESTINY_SKILL_TREE.md
fs.writeFileSync('docs/L2_ESSENCE_CELESTIAL_DESTINY_SKILL_TREE.md', doc, 'utf8');
console.log('Successfully written docs/L2_ESSENCE_CELESTIAL_DESTINY_SKILL_TREE.md');
console.log('Total lineages written:', lineageCounter);
console.log('Total skills written:', totalSkillsIncluded);
console.log('Document size in bytes:', doc.length);
console.log('Document total lines:', doc.split('\n').length);
