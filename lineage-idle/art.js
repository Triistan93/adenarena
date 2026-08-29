// ================================================================
// Aden / Lineage Idle — Visual Art Module v3
// Painted 3D-figurine illustrations for heroes and monsters.
// Falls back to the closest match when a specific combo isn't
// available.  Pure functions — no DOM, no globals.
// ================================================================

const HERO_IMG = {
  human_fighter: "/img/humanpalaM.png",
  human_fighter_m: "/img/humanpalaM.png",
  human_fighter_f: "/img/humanpalaF.png",
  human_mage: "/img/humanmageF.png",
  human_mage_m: "/img/humanmageM.png",
  human_mage_f: "/img/humanmageF.png",
  human_warrior: "/img/humanpalaM.png",
  human_knight: "/img/humanpalaM.png",
  human_rogue: "/img/humanpalaM.png",
  human_wizard: "/img/humanmageM.png",
  human_cleric: "/img/humanmageF.png",
  human_deathpilgrim: "/img/humanpalaM.png",
  human_wargbase: "/img/humanpalaM.png",
  human_assassinbase: "/img/humanpalaM.png",
  human_assassins0: "/img/humanpalaM.png",

  elf_fighter: "/img/elfwswM.png",
  elf_fighter_m: "/img/elfwswM.png",
  elf_fighter_f: "/img/elfswsF.png",
  elf_mage: "/img/elfmageM.png",
  elf_mage_m: "/img/elfmageM.png",
  elf_mage_f: "/img/elfmageF.png",
  elf_elvenknight: "/img/elfwswM.png",
  elf_elvenscout: "/img/elfswsF.png",
  elf_elvenwizard: "/img/elfmageM.png",
  elf_elvenwizard_m: "/img/elfmageM.png",
  elf_elvenwizard_f: "/img/elfmageF.png",
  elf_oracle: "/img/elfmageF.png",
  elf_oracle_m: "/img/elfmageM.png",
  elf_oracle_f: "/img/elfmageF.png",

  darkelf_fighter: "/img/darkelfskM.png",
  darkelf_fighter_m: "/img/darkelfskM.png",
  darkelf_fighter_f: "/img/darkelfskF.png",
  darkelf_mage: "/img/darkelfmageF.png",
  darkelf_mage_m: "/img/darkelfmageM.png",
  darkelf_mage_f: "/img/darkelfmageF.png",
  darkelf_palusknight: "/img/darkelfskM.png",
  darkelf_darkwizard: "/img/darkelfmageM.png",
  darkelf_darkwizard_m: "/img/darkelfmageM.png",
  darkelf_darkwizard_f: "/img/darkelfmageF.png",
  darkelf_shillienoracle: "/img/darkelfmageF.png",
  darkelf_elfdeathpilgrim: "/img/darkelfskM.png",
  darkelf_deathpilgrim: "/img/darkelfskM.png",
  darkelf_assassinbase: "/img/darkelfskF.png",
  darkelf_assassins0: "/img/darkelfskF.png",
  darkelf_bloodrosebase: "/img/darkelfmageF.png",
  darkelf_bloodroses1: "/img/darkelfmageF.png",
  darkelf_bloodroses2: "/img/darkelfmageF.png",
  darkelf_bloodroses3: "/img/darkelfmageF.png",
  darkelf_bloodrose: "/img/darkelfmageF.png",

  orc_fighter: "/img/orcfighterM.png",
  orc_fighter_m: "/img/orcfighterM.png",
  orc_fighter_f: "/img/orcfighterF.png",
  orc_mage: "/img/orc_mage.png",
  orc_orcraider: "/img/orcfighterM.png",
  orc_monk: "/img/orcfighterM.png",
  orc_shaman: "/img/orc_mage.png",
  orc_rider: "/img/orcfighterM.png",
  orc_orcrider: "/img/orcfighterM.png",
  orc_vanguardrider: "/img/orcfighterM.png",

  dwarf_artisan: "/img/dwarfmaestroM.png",
  dwarf_artisan_m: "/img/dwarfmaestroM.png",
  dwarf_artisan_f: "/img/dwarfmaestroF.png",
  dwarf_fighter: "/img/dwarfmaestroM.png",
  dwarf_shinemakerbase: "/img/dwarfmaestroF.png",
  dwarf_shinemakers1: "/img/dwarfmaestroF.png",
  dwarf_shinemakers2: "/img/dwarfmaestroF.png",
  dwarf_shinemakers3: "/img/dwarfmaestroF.png",
  dwarf_shinemaker: "/img/dwarfmaestroF.png",

  kamael_soulbreaker: "/img/kamaelshF.png",
  kamael_soulbreaker_m: "/img/kamaelshM.png",
  kamael_soulbreaker_f: "/img/kamaelshF.png",
  kamael_kamaelsoldier: "/img/kamaelshM.png",
  kamael_fighter: "/img/kamaelDM.png",
  kamael_samuraibase: "/img/kamaelDM.png",
  kamael_samuraibase_m: "/img/kamaelDM.png",
  kamael_samuraibase_f: "/img/kamaelDF.png",
  kamael_hatamoto: "/img/kamaelDM.png",
  kamael_ronin: "/img/kamaelDM.png",
  kamael_samurai: "/img/kamaelDM.png",

  sylph_sylphgunner: "/img/sylphM.png",
  sylph_sylphgunner_m: "/img/sylphM.png",
  sylph_sylphgunner_f: "/img/sylphF.png",
  sylph_fighter: "/img/sylphM.png",

  highelf_divinetemplars1: "/img/elfwswM.png",
  highelf_elementweavers1: "/img/elfmageM.png",
  highelf_fighter: "/img/elfwswM.png",
  highelf_mage: "/img/elfmageM.png",

  ertheia_marauderbase: "/img/elfwswM.png",
  ertheia_marauderbase_m: "/img/elfwswM.png",
  ertheia_marauderbase_f: "/img/elfswsF.png",
  ertheia_marauder: "/img/elfwswM.png",
  ertheia_eviscerator: "/img/elfswsF.png",
  ertheia_sayhamagebase: "/img/elfmageF.png",
  ertheia_sayhamagebase_m: "/img/elfmageM.png",
  ertheia_sayhamagebase_f: "/img/elfmageF.png",
  ertheia_sayhaseer: "/img/elfmageF.png",
  ertheia_sayhaseeker: "/img/elfmageF.png",
  ertheia_fighter: "/img/elfwswM.png",
  ertheia_mage: "/img/elfmageF.png"
};

// Fallback by race only
const RACE_FALLBACK = {
  human: "/img/humanpalaM.png",
  elf: "/img/elfwswM.png",
  darkelf: "/img/darkelfskM.png",
  orc: "/img/orcfighterM.png",
  dwarf: "/img/dwarfmaestroM.png",
  kamael: "/img/kamaelDM.png",
  sylph: "/img/sylphM.png",
  highelf: "/img/elfwswM.png",
  ertheia: "/img/elfswsF.png"
};

function resolveImg(path) {
  if (typeof window !== 'undefined' && window.__HERO_IMGS && window.__HERO_IMGS[path]) {
    return window.__HERO_IMGS[path];
  }
  return path;
}

const MAGE_CLASSES = new Set(['mage', 'wizard', 'cleric', 'sorcerer', 'necromancer', 'bishop', 'prophet', 'spellsinger', 'spellhowler', 'shillien', 'overlord', 'darkwizard', 'elementweavers1', 'sayhaseer', 'bloodroses1']);

function heroImgPath(race, cls, gender) {
  race = String(race || 'human').toLowerCase();
  cls = String(cls || 'fighter').toLowerCase();
  const g = String(gender || 'M').toLowerCase();

  const genderKey = `${race}_${cls}_${g}`;
  if (HERO_IMG[genderKey]) return resolveImg(HERO_IMG[genderKey]);

  const directKey = `${race}_${cls}`;
  if (HERO_IMG[directKey]) return resolveImg(HERO_IMG[directKey]);

  const archetype = MAGE_CLASSES.has(cls) ? 'mage' : 'fighter';
  const archGenderKey = `${race}_${archetype}_${g}`;
  if (HERO_IMG[archGenderKey]) return resolveImg(HERO_IMG[archGenderKey]);

  const archKey = `${race}_${archetype}`;
  if (HERO_IMG[archKey]) return resolveImg(HERO_IMG[archKey]);

  const fallback = RACE_FALLBACK[race] || "/img/humanpalaM.png";
  return resolveImg(fallback);
}

// ---- Monster image map ----
export const MON_IMG = {
  // Talking Island
  "goblin": "/img/mon_goblin.jpg",
  "goblinThief": "/img/mon_goblinthief.jpg",
  "armoredGoblin": "/img/mon_armoredgoblin.jpg",
  "goblinMage": "/img/mon_goblinmage.jpg",
  "talkingIslandWerewolf": "/img/mon_wolf.jpg",
  "goblinKing": "/img/mon_goblinking.jpg",

  // Elven Forest
  "wolf": "/img/mon_wolf.jpg",
  "grayWolf": "/img/mon_rootwolf.jpg",
  "rootWitch": "/img/mon_rootwitch.jpg",
  "greenDryad": "/img/mon_rootwitch.jpg",
  "sporeFungus": "/img/mon_swampwalker.jpg",
  "kabooOrcFighter": "/img/mon_orcwarrior.jpg",
  "deathTrent": "/img/mon_deathtreant.jpg",
  "deathTreant": "/img/mon_deathtreant.jpg",

  // Dark Forest
  "spider": "/img/mon_spider.jpg",
  "caveSpider": "/img/mon_spider.jpg",
  "swampWalker": "/img/mon_swampwalker.jpg",
  "lesserDarkHorror": "/img/mon_darkmage.png",
  "marshStalker": "/img/mon_swampbeast.jpg",
  "shadowFangWolf": "/img/mon_direwolf.png",
  "darkForestMatriarch": "/img/mon_spider.jpg",

  // Orc Village
  "orc": "/img/mon_orcwarrior.jpg",
  "orcWarrior": "/img/mon_orcwarrior.jpg",
  "kashaWolf": "/img/mon_wolf.jpg",
  "kashaBear": "/img/mon_orcwarrior.jpg",
  "kashaOrcArcher": "/img/mon_orcwarrior.jpg",
  "kashaOrcBerserker": "/img/mon_orcoverlord.jpg",
  "kashaOrcOverlord": "/img/mon_orcoverlord.jpg",

  // Dwarven Mine
  "kobold": "/img/mon_koboldminer.jpg",
  "koboldMiner": "/img/mon_koboldminer.jpg",
  "goblinBrigand": "/img/mon_goblinthief.jpg",
  "mineCaveBat": "/img/mon_spider.jpg",
  "mithrilGolem": "/img/mon_koboldminer.jpg",
  "koboldLeader": "/img/mon_koboldminer.jpg",
  "dwarvenEarthLord": "/img/mon_antharas.png",

  // Kamael Lair
  "kamaelScout": "/img/mon_scout.png",
  "soullessScout": "/img/mon_scout.png",
  "spitefulGhost": "/img/mon_furioussouls.png",
  "crimsonWarder": "/img/mon_scout.png",
  "kamaelInfiltrator": "/img/mon_shadowmercenary.png",
  "darkInquisitorKamael": "/img/mon_scout.png",

  // Ruined Outpost
  "ruinedGoblinThief": "/img/mon_goblinthief.jpg",
  "ruinedOrc": "/img/mon_orcwarrior.jpg",
  "outpostMarksman": "/img/mon_scout.png",
  "ruinedDeserter": "/img/mon_knight.png",
  "shadowMercenary": "/img/mon_shadowmercenary.png",
  "outpostFallenCaptain": "/img/mon_shadowmercenary.png",

  // Howling Moor
  "direWolf": "/img/mon_direwolf.png",
  "babyTiamat": "/img/mon_babytiamat.png",
  "crimsonBabyDragon": "/img/mon_crimsombabydragon.png",
  "ancientSatyr": "/img/mon_ancientsathyr.png",
  "satyrWarlord": "/img/mon_ancientsathyr.png",
  "alphaWolf": "/img/mon_alphawolf.png",

  // Giran Outskirts
  "skeleton": "/img/mon_skeleton.png",
  "skeletonArcher": "/img/mon_skeleton.png",
  "deathRider": "/img/mon_deathrider.png",
  "giranGargoyle": "/img/mon_minotaurknight.png",
  "giranGladiator": "/img/mon_minotaurknight.png",
  "minotaurKnight": "/img/mon_minotaurknight.png",

  // Orcen Ruins
  "orcenRuinsOrc": "/img/mon_orcwarrior.jpg",
  "cursedWarrior": "/img/mon_cursedwarior.png",
  "ruinShamanOrc": "/img/mon_orcmage.jpg",
  "tombLooterOrc": "/img/mon_orcwarrior.jpg",
  "ancientOrcExecutioner": "/img/mon_orcoverlord.jpg",
  "orcenOverlord": "/img/mon_orcenoverlord.jpg",

  // Forsaken Crypt
  "darkMage": "/img/mon_darkmage.png",
  "corpseWorm": "/img/mon_corpseworm.png",
  "furiousSouls": "/img/mon_furioussouls.png",
  "cryptVampire": "/img/mon_cryptvampire.png",
  "devilBone": "/img/mon_furioussouls.png",
  "cryptLord": "/img/mon_cryptLord.png",

  // Black Citadel
  "deathKnight": "/img/mon_deathknight.png",
  "deathWizard": "/img/mon_deathwizard.png",
  "citadelDarkPriest": "/img/mon_deathwizard.png",
  "blackDragonWhelp": "/img/mon_blackdragon.png",
  "blackDragon": "/img/mon_blackdragon.png",
  "flamingDemonLord": "/img/mon_flamingdemonglord.png",

  // Gludio Castle
  "knight": "/img/mon_knight.png",
  "cursedKnight": "/img/mon_cursedknight.png",
  "gludioRoyalArcher": "/img/mon_knight.png",
  "gludioSorcerer": "/img/mon_deathwizard.png",
  "gludioShieldMaster": "/img/mon_knight.png",
  "gludioCommander": "/img/mon_cursedknight.png",

  // Wolf Mountain
  "mountainWolf": "/img/mon_snowwolf.jpg",
  "mountainDireWolf": "/img/mon_snowwolf.jpg",
  "frostStalkerWolf": "/img/mon_snowwolf.jpg",
  "mountainSnowBear": "/img/mon_snowwolf.jpg",
  "frostFangBehemoth": "/img/mon_snowwolf.jpg",
  "mountainAlphaWolf": "/img/mon_snowwolf.jpg",

  // Rift of the Void
  "voidCreature": "/img/mon_voidcreature.png",
  "voidBrute": "/img/mon_voidbrute.png",
  "voidStalker": "/img/mon_voidstalker.png",
  "beholder": "/img/mon_beholder.png",
  "voidArchonEntity": "/img/mon_voiddragonlord.png",
  "voidDragonLord": "/img/mon_voiddragonlord.png",

  // Emerald Grove
  "emeraldSnake": "/img/mon_emeraldsnake.png",
  "emeraldDrake": "/img/mon_emereldadragon.png",
  "jadeGolem": "/img/mon_emereldadragon.png",
  "groveSpiritMage": "/img/mon_rootwitch.jpg",
  "emeraldDragon": "/img/mon_emereldadragon.png",
  "fafurion": "/img/mon_fafurion.png",

  // Gates of the Underworld
  "blazingWerewolf": "/img/mon_blazingwerefolf.png",
  "swiftBlaze": "/img/mon_swiftblaze.png",
  "infernalHound": "/img/mon_blazingwerefolf.png",
  "lavaFiend": "/img/mon_flamingdemonglord.png",
  "flameOverlordDemon": "/img/mon_flamingdemonglord.png",
  "cerberus": "/img/mon_cerberus.png",

  // Valley of Saints
  "saintEye": "/img/mon_beholder.png",
  "saintGuardian": "/img/mon_knight.png",
  "splendorLight": "/img/mon_furioussouls.png",
  "celestialArchon": "/img/mon_darkmage.png",
  "divineSeraphim": "/img/mon_deathknight.png",
  "splendorKnight": "/img/mon_knight.png",

  // Swamp of Screams
  "swampStrikers": "/img/mon_swampwalker.jpg",
  "corruptedSpiders": "/img/mon_spider.jpg",
  "screamingSouls": "/img/mon_furioussouls.png",
  "stakatoWarrior": "/img/mon_swampwalker.jpg",
  "stakatoQueenBrood": "/img/mon_swampbeast.jpg",
  "swampAbomination": "/img/mon_swampbeast.jpg",

  // Aden City
  "royalKnight": "/img/mon_knight.png",
  "highMage": "/img/mon_mage.png",
  "adenCrossbowman": "/img/mon_scout.png",
  "adenPaladin": "/img/mon_knight.png",
  "adenHighJusticiar": "/img/mon_knight.png",
  "adenCommander": "/img/mon_knight.png",

  // Dragon Valley
  "dragon": "/img/mon_dragon.png",
  "dragonKnight": "/img/mon_dragonknight.png",
  "frostKnight": "/img/mon_frostknight.png",
  "frostLordDragon": "/img/mon_frostlorddragon.png",
  "dragonValleyOverlord": "/img/mon_dragon.png",
  "lindvior": "/img/mon_lidivior.png",

  // Imperial Tomb
  "tombGuardian": "/img/mon_deathknight.png",
  "sepulcherArchon": "/img/mon_darkmage.png",
  "undeadKnight": "/img/mon_knight.png",
  "imperialGhostMage": "/img/mon_darkmage.png",
  "lichLord": "/img/mon_lichlord.png",
  "deathKing": "/img/mon_deathking.png",

  // Antharas' Lair
  "caveDrake": "/img/mon_dragon.png",
  "magmaBeast": "/img/mon_blackdragon.png",
  "earthDrake": "/img/mon_antharas.png",
  "caveWyrmBehemoth": "/img/mon_antharas.png",
  "antharasBehemoth": "/img/mon_antharas.png",
  "antharas": "/img/mon_antharas.png",

  // Forge of the Gods
  "valakasMinion": "/img/mon_valakasminion.png",
  "lavaGolem": "/img/mon_flamingdemonglord.png",
  "flameArchon": "/img/mon_flamegiantdragom.png",
  "flameGiantDragon": "/img/mon_flamegiantdragom.png",
  "vulcanLord": "/img/mon_valakas.png",
  "valakas": "/img/mon_valakas.png"
};

// Monsters without painted art get a tinted SVG silhouette
// Deixado vazio intencionalmente, pois todos os monstros base agora possuem arte em PNG.
const MON_SVG_FALLBACK = {};

// ---- Shared map data ----
export const ZONE_COORDS = {
  talkingIsland: { x: 45, y: 205 }, elvenForest: { x: 90, y: 160 },
  darkForest: { x: 115, y: 185 }, ruinedOutpost: { x: 140, y: 150 },
  
  // NÓS MOVIDOS PARA O CONTINENTE NORTE (Terreno)
  orcVillage: { x: 175, y: 35 }, 
  dwarvenMine: { x: 125, y: 25 },
  kamaelLair: { x: 80, y: 40 }, 
  
  howlingMoor: { x: 150, y: 120 },
  giranOutskirts: { x: 200, y: 160 }, orcenRuins: { x: 225, y: 135 },
  forsakenCrypt: { x: 250, y: 165 }, blackCitadel: { x: 275, y: 140 },
  gludioCastle: { x: 175, y: 185 }, riftOfTheVoid: { x: 290, y: 110 },
  wolfMountain: { x: 260, y: 90 }, emeraldGrove: { x: 230, y: 60 },
  underworldGate: { x: 280, y: 55 }, adenCity: { x: 310, y: 80 },
  dragonValley: { x: 335, y: 45 }
};
export const ZONE_ORDER = [
  "talkingIsland", "elvenForest", "darkForest", "ruinedOutpost", 
  "orcVillage", "dwarvenMine", "kamaelLair", "howlingMoor", 
  "giranOutskirts", "orcenRuins", "forsakenCrypt", "blackCitadel", 
  "gludioCastle", "riftOfTheVoid", "wolfMountain", "emeraldGrove", 
  "underworldGate", "adenCity", "dragonValley"
];

// Kept for palette references elsewhere
export const RACE_COLOR = {
  human: "#e8c39a", elf: "#f0d8b0", darkelf: "#c9b0e8",
  orc: "#9c6b3f", dwarf: "#caa06a", kamael: "#e6d8c0", ertheia: "#d8b48a",
};
export const RACE_HAIR = {
  human: "#5a3a1a", elf: "#e2d070", darkelf: "#241840",
  orc: "#151515", dwarf: "#6a2a0a", kamael: "#d8e4f0", ertheia: "#9a5a2a",
};
export const CLASS_COLOR = {
  fighter: "#b89030", mage: "#4858b8", artisan: "#a06828", soulbreaker: "#2a9a8c",
  warrior: "#c89838", archer: "#4aa060", mystic: "#5aaa98", rogue: "#b8a848",
};
export const CLASS_LIGHT = {
  fighter: "#e8c860", mage: "#8898e8", artisan: "#d8a048", soulbreaker: "#6ae0cc",
  warrior: "#f0d878", archer: "#8ae0a8", mystic: "#98e0cc", rogue: "#e0d078",
};

function getAssetUrl(p) {
  if (!p) return '';
  if (p.startsWith('http://') || p.startsWith('https://') || p.startsWith('data:')) return p;
  const cleanPath = p.replace(/^\//, '');
  let baseUrl = '';
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) {
    baseUrl = import.meta.env.BASE_URL;
  } else if (typeof window !== 'undefined' && window.__BASE_URL__) {
    baseUrl = window.__BASE_URL__;
  }
  if (baseUrl) {
    if (!baseUrl.endsWith('/')) baseUrl += '/';
    return baseUrl + cleanPath;
  }
  return '/' + cleanPath;
}

// ================================================================
//  heroSVG(race, cls, aura, mode)
// ================================================================
export function heroSVG(raceOrState, clsParam, genderParam, aura, mode) {
  let race = raceOrState;
  let cls = clsParam;
  let gender = genderParam;

  if (typeof raceOrState === 'object' && raceOrState !== null) {
    race = raceOrState.race || raceOrState.heroRace || raceOrState.playerRace || 'human';
    cls = raceOrState.class || raceOrState.heroClass || raceOrState.playerClass || 'fighter';
    gender = raceOrState.gender || raceOrState.charGender || raceOrState.sex || 'M';
    aura = raceOrState.aura;
    mode = raceOrState.mode;
  } else if (typeof genderParam === 'string' && (genderParam === 'full' || genderParam === 'bust')) {
    mode = genderParam;
    aura = null;
    gender = 'M';
  }

  race = String(race || 'human').toLowerCase();
  cls = String(cls || 'fighter').toLowerCase();
  gender = String(gender || 'M').toUpperCase();

  const src = getAssetUrl(heroImgPath(race, cls, gender));
  const border = aura || "#8a6a24";

  if (mode === "bust") {
    return `<div class="hero-svg hero-bust" style="position:relative;width:100%;height:100%;overflow:hidden;border-radius:50%;">
      <img src="${src}" alt="${race} ${cls}" draggable="false" onerror="this.onerror=null; this.src='${getAssetUrl('img/humanpalaM.png')}';"
        style="width:100%;height:100%;object-fit:cover;object-position:center 15%;filter:drop-shadow(0 0 6px ${border});" />
      <div style="position:absolute;inset:0;border-radius:50%;border:2px solid ${border};box-shadow:inset 0 0 20px rgba(0,0,0,0.6);pointer-events:none;"></div>
    </div>`;
  }

  return `<div class="hero-svg hero-full" style="width:100%;height:100%;position:relative;">
    <img src="${src}" alt="${race} ${cls}" draggable="false" onerror="this.onerror=null; this.src='${getAssetUrl('img/humanpalaM.png')}';"
      style="width:100%;height:100%;object-fit:contain;object-position:center bottom;filter:drop-shadow(0 8px 16px rgba(0,0,0,0.7)) drop-shadow(0 0 4px ${border || 'transparent'});" />
  </div>`;
}

// ================================================================
//  monsterSVG(id, opts)
// ================================================================
export function monsterSVG(idOrObj, opts) {
  let safeId = idOrObj;
  let safeOpts = opts || {};

  if (typeof idOrObj === 'object' && idOrObj !== null) {
    safeId = idOrObj.id || idOrObj.monsterId || idOrObj.key || idOrObj.name || '';
    if (idOrObj.boss || idOrObj.isBoss) {
      safeOpts = { ...safeOpts, crown: true };
    }
  }

  safeId = String(safeId || '').trim();
  const baseKey = safeId.replace(/^chaos_/i, '');
  const cleanKey = safeId.replace(/\s+/g, '');
  const lowerCleanKey = cleanKey.toLowerCase();
  const isChaos = safeId.startsWith('chaos_') || safeOpts?.isChaosBoss;

  let imgSrc = MON_IMG[safeId]
    || MON_IMG[baseKey]
    || MON_IMG[cleanKey]
    || MON_IMG[lowerCleanKey]
    || MON_IMG['mon_' + lowerCleanKey]
    || MON_IMG['mon_' + baseKey.toLowerCase()]
    || (Object.entries(MON_IMG).find(([k]) => k.toLowerCase() === lowerCleanKey || k.toLowerCase() === baseKey.toLowerCase())?.[1])
    || '/img/mon_goblin.png';

  const crown = isChaos
    ? `<div style="position:absolute;top:-10px;left:50%;transform:translateX(-50%);font-size:24px;filter:drop-shadow(0 0 10px #ef4444);z-index:2;animation:pulse 1.5s infinite;">🔥👑🔥</div>`
    : (safeOpts?.crown
      ? `<div style="position:absolute;top:-8px;left:50%;transform:translateX(-50%);font-size:22px;filter:drop-shadow(0 0 6px #f0c840);z-index:2;">👑</div>`
      : "");

  const resolvedSrc = getAssetUrl(resolveImg(imgSrc));
  const glow = isChaos
    ? "drop-shadow(0 0 16px rgba(239,68,68,0.9)) drop-shadow(0 0 24px rgba(168,85,247,0.7))"
    : (safeOpts?.crown ? "drop-shadow(0 0 10px rgba(240,200,64,0.5))" : "drop-shadow(0 6px 12px rgba(0,0,0,0.6))");

  return `<div class="mon-svg" style="width:100%;height:100%;position:relative;">
    ${crown}
    <img src="${resolvedSrc}" alt="${safeId}" draggable="false" onerror="this.onerror=null; this.src='${getAssetUrl('img/mon_goblin.png')}';"
      style="width:100%;height:100%;object-fit:contain;object-position:center bottom;filter:${glow};" />
  </div>`;
}

function darken(hex, f = 0.6) {
  const m = hex.match(/[\da-f]{2}/gi);
  if (!m) return hex;
  return "#" + m.map(h => Math.round(parseInt(h, 16) * f).toString(16).padStart(2, "0")).join("");
}
function lighten(hex, f = 0.35) {
  const m = hex.match(/[\da-f]{2}/gi);
  if (!m) return hex;
  return "#" + m.map(h => {
    const v = parseInt(h, 16);
    return Math.min(255, Math.round(v + (255 - v) * f)).toString(16).padStart(2, "0");
  }).join("");
}

export function mapBackdrop() {
  // Substitui os vetores antigos pela imagem do mapa oficial
  // Nota: Certifique-se de que "map.png" está na pasta public/img/
  return `
    <image href="/img/map.png" x="0" y="0" width="360" height="240" preserveAspectRatio="none" opacity="0.9" />
    <rect width="360" height="240" fill="#1a1408" opacity="0.2" style="mix-blend-mode: multiply;" />
  `;
}
