// ================================================================
// Aden / Lineage Idle — Visual Art Module v3
// Painted 3D-figurine illustrations for heroes and monsters.
// Falls back to the closest match when a specific combo isn't
// available.  Pure functions — no DOM, no globals.
// ================================================================

// ---- Hero image map: race_class → image path ----
const HERO_IMG = {
  human_fighter: "/img/humanpalaM.png",
  human_mage: "/img/humanmageF.png",
  elf_fighter: "/img/elf_fighter.png",
  elf_mage: "/img/elfmageM.png",         
  elf_archer: "/img/elfswsF.png",
  elf_mystic: "/img/elf_mage.png",
  elf_sentinel: "/img/elfswsF.png",
  darkelf_fighter: "/img/darkelfskM.png",
  darkelf_mage: "/img/darkelfmageF.png",
  darkelf_assassin: "/img/darkelf_fighter.png",
  darkelf_shillien: "/img/darkelf_mage.png",
  darkelf_sorcerer: "/img/darkelf_mage.png",
  orc_fighter: "/img/orcfighterM.png",
  orc_mage: "/img/orc_mage.png",
  orc_destroyer: "/img/orcfighterM.png",
  orc_monk: "/img/orcfighterM.png",
  orc_overlord: "/img/orc_mage.png",
  dwarf_artisan: "/img/dwarfmaestroM.png",
  dwarf_fighter: "/img/dwarfmaestroM.png",
  dwarf_warsmith: "/img/dwarfmaestroM.png",
  kamael_soulbreaker: "/img/kamaelshF.png",
  kamael_fighter: "/img/kamaelDM.png",
  kamael_berserker: "/img/kamaelDM.png",
  ertheia_fighter: "/img/sylphM.png",
  ertheia_mage: "/img/sylphF.png",
};

// Fallback by race only
const RACE_FALLBACK = {
  human: "/img/humanpalaM.png",
  elf: "/img/elfwswM.png",
  darkelf: "/img/darkelfskM.png",
  orc: "/img/orcfighterM.png",
  dwarf: "/img/dwarfmaestroM.png",
  kamael: "/img/kamaelDM.png",
  ertheia: "/img/sylphM.png",
};

function resolveImg(path) {
  if (typeof window !== 'undefined' && window.__HERO_IMGS && window.__HERO_IMGS[path]) {
    return window.__HERO_IMGS[path];
  }
  return path;
}

const MAGE_CLASSES = new Set(['mage', 'wizard', 'cleric', 'sorcerer', 'necromancer', 'bishop', 'prophet', 'spellsinger', 'spellhowler', 'shillien', 'overlord']);

function heroImgPath(race, cls) {
  const directKey = `${race}_${cls}`;
  if (HERO_IMG[directKey]) return resolveImg(HERO_IMG[directKey]);

  const archetype = MAGE_CLASSES.has(cls) ? 'mage' : 'fighter';
  const archKey = `${race}_${archetype}`;
  if (HERO_IMG[archKey]) return resolveImg(HERO_IMG[archKey]);

  const fallback = RACE_FALLBACK[race] || "/img/human_fighter.png";
  return resolveImg(fallback);
}

// ---- Monster image map ----
const MON_IMG = {
  "goblin": "/img/mon_goblin.png",
  "mon_goblin": "/img/mon_goblin.png",
  "armoredGoblin": "/img/mon_armoredgoblin.png",
  "armoredgoblin": "/img/mon_armoredgoblin.png",
  "mon_armoredgoblin": "/img/mon_armoredgoblin.png",
  "goblinMage": "/img/mon_goblinmage.png",
  "goblinmage": "/img/mon_goblinmage.png",
  "mon_goblinmage": "/img/mon_goblinmage.png",
  "goblinThief": "/img/mon_goblinthief.png",
  "goblinthief": "/img/mon_goblinthief.png",
  "mon_goblinthief": "/img/mon_goblinthief.png",
  "goblinKing": "/img/mon_goblin.png", // TODO: falta arte própria para este monstro
  "goblinking": "/img/mon_goblin.png", // TODO: falta arte própria para este monstro
  "mon_goblinking": "/img/mon_goblin.png", // TODO: falta arte própria para este monstro
  "wolf": "/img/mon_direwolf.png",
  "mon_wolf": "/img/mon_direwolf.png",
  "rootWitch": "/img/mon_rootwitch.png",
  "rootwitch": "/img/mon_rootwitch.png",
  "mon_rootwitch": "/img/mon_rootwitch.png",
  "deathTrent": "/img/mon_deathtrent.png",
  "deathtrent": "/img/mon_deathtrent.png",
  "mon_deathtrent": "/img/mon_deathtrent.png",
  "spider": "/img/mon_spider.png",
  "mon_spider": "/img/mon_spider.png",
  "swampWalker": "/img/mon_swampwalker.png",
  "swampwalker": "/img/mon_swampwalker.png",
  "mon_swampwalker": "/img/mon_swampwalker.png",
  "orc": "/img/mon_orc.png",
  "mon_orc": "/img/mon_orc.png",
  "kobold": "/img/mon_kobold.png",
  "mon_kobold": "/img/mon_kobold.png",
  "koboldLeader": "/img/mon_koboldleader.png",
  "koboldleader": "/img/mon_koboldleader.png",
  "mon_koboldleader": "/img/mon_koboldleader.png",
  "kamaelScout": "/img/mon_scout.png",
  "kamaelscout": "/img/mon_scout.png",
  "mon_kamaelscout": "/img/mon_scout.png",
  "shadowMercenary": "/img/mon_shadowmercenary.png",
  "shadowmercenary": "/img/mon_shadowmercenary.png",
  "mon_shadowmercenary": "/img/mon_shadowmercenary.png",
  "direWolf": "/img/mon_direwolf.png",
  "direwolf": "/img/mon_direwolf.png",
  "mon_direwolf": "/img/mon_direwolf.png",
  "babyTiamat": "/img/mon_babytiamat.png",
  "babytiamat": "/img/mon_babytiamat.png",
  "mon_babytiamat": "/img/mon_babytiamat.png",
  "ancientSatyr": "/img/mon_ancientsathyr.png",
  "ancientsatyr": "/img/mon_ancientsathyr.png",
  "mon_ancientsatyr": "/img/mon_ancientsathyr.png",
  "crimsonBabyDragon": "/img/mon_crimsombabydragon.png",
  "crimsonbabydragon": "/img/mon_crimsombabydragon.png",
  "mon_crimsonbabydragon": "/img/mon_crimsombabydragon.png",
  "alphaWolf": "/img/mon_alphawolf.png",
  "alphawolf": "/img/mon_alphawolf.png",
  "mon_alphawolf": "/img/mon_alphawolf.png",
  "skeleton": "/img/mon_skeleton.png",
  "mon_skeleton": "/img/mon_skeleton.png",
  "deathRider": "/img/mon_deathrider.png",
  "deathrider": "/img/mon_deathrider.png",
  "mon_deathrider": "/img/mon_deathrider.png",
  "minotaurKnight": "/img/mon_minotaurknight.png",
  "minotaurknight": "/img/mon_minotaurknight.png",
  "mon_minotaurknight": "/img/mon_minotaurknight.png",
  "cursedWarrior": "/img/mon_cursedwarior.png",
  "cursedwarrior": "/img/mon_cursedwarior.png",
  "mon_cursedwarrior": "/img/mon_cursedwarior.png",
  "darkMage": "/img/mon_darkmage.png",
  "darkmage": "/img/mon_darkmage.png",
  "mon_darkmage": "/img/mon_darkmage.png",
  "corpseWorm": "/img/mon_corpseworm.png",
  "corpseworm": "/img/mon_corpseworm.png",
  "mon_corpseworm": "/img/mon_corpseworm.png",
  "furiousSouls": "/img/mon_furioussouls.png",
  "furioussouls": "/img/mon_furioussouls.png",
  "mon_furioussouls": "/img/mon_furioussouls.png",
  "cryptVampire": "/img/mon_cryptvampire.png",
  "cryptvampire": "/img/mon_cryptvampire.png",
  "mon_cryptvampire": "/img/mon_cryptvampire.png",
  "devilBone": "/img/devilbone.png",
  "devilbone": "/img/devilbone.png",
  "mon_devilbone": "/img/devilbone.png",
  "cryptLord": "/img/mon_cryptLord.png",
  "cryptlord": "/img/mon_cryptLord.png",
  "mon_cryptlord": "/img/mon_cryptLord.png",
  "deathKnight": "/img/mon_deathknight.png",
  "deathknight": "/img/mon_deathknight.png",
  "mon_deathknight": "/img/mon_deathknight.png",
  "deathWizard": "/img/mon_deathwizard.png",
  "deathwizard": "/img/mon_deathwizard.png",
  "mon_deathwizard": "/img/mon_deathwizard.png",
  "blackDragon": "/img/mon_blackdragon.png",
  "blackdragon": "/img/mon_blackdragon.png",
  "mon_blackdragon": "/img/mon_blackdragon.png",
  "flamingDemonLord": "/img/mon_flamingdemonglord.png",
  "flamingdemonlord": "/img/mon_flamingdemonglord.png",
  "mon_flamingdemonlord": "/img/mon_flamingdemonglord.png",
  "knight": "/img/mon_knight.png",
  "mon_knight": "/img/mon_knight.png",
  "cursedKnight": "/img/mon_cursedknight.png",
  "cursedknight": "/img/mon_cursedknight.png",
  "mon_cursedknight": "/img/mon_cursedknight.png",
  "voidCreature": "/img/mon_voidcreature.png",
  "voidcreature": "/img/mon_voidcreature.png",
  "mon_voidcreature": "/img/mon_voidcreature.png",
  "voidBrute": "/img/mon_voidbrute.png",
  "voidbrute": "/img/mon_voidbrute.png",
  "mon_voidbrute": "/img/mon_voidbrute.png",
  "voidStalker": "/img/mon_voidstalker.png",
  "voidstalker": "/img/mon_voidstalker.png",
  "mon_voidstalker": "/img/mon_voidstalker.png",
  "beholder": "/img/mon_beholder.png",
  "mon_beholder": "/img/mon_beholder.png",
  "voidDragonLord": "/img/mon_voiddragonlord.png",
  "voiddragonlord": "/img/mon_voiddragonlord.png",
  "mon_voiddragonlord": "/img/mon_voiddragonlord.png",
  "emeraldSnake": "/img/mon_emeraldsnake.png",
  "emeraldsnake": "/img/mon_emeraldsnake.png",
  "mon_emeraldsnake": "/img/mon_emeraldsnake.png",
  "emeraldDragon": "/img/mon_emereldadragon.png",
  "emeralddragon": "/img/mon_emereldadragon.png",
  "mon_emeralddragon": "/img/mon_emereldadragon.png",
  "fafurion": "/img/mon_fafurion.png",
  "mon_fafurion": "/img/mon_fafurion.png",
  "blazingWerewolf": "/img/mon_blazingwerefolf.png",
  "blazingwerewolf": "/img/mon_blazingwerefolf.png",
  "mon_blazingwerewolf": "/img/mon_blazingwerefolf.png",
  "swiftBlaze": "/img/mon_swiftblaze.png",
  "swiftblaze": "/img/mon_swiftblaze.png",
  "mon_swiftblaze": "/img/mon_swiftblaze.png",
  "cerberus": "/img/mon_cerberus.png",
  "mon_cerberus": "/img/mon_cerberus.png",
  "mage": "/img/mon_mage.png",
  "mon_mage": "/img/mon_mage.png",
  "dragon": "/img/mon_dragon.png",
  "mon_dragon": "/img/mon_dragon.png",
  "dragonKnight": "/img/mon_dragonknight.png",
  "dragonknight": "/img/mon_dragonknight.png",
  "mon_dragonknight": "/img/mon_dragonknight.png",
  "frostKnight": "/img/mon_frostknight.png",
  "frostknight": "/img/mon_frostknight.png",
  "mon_frostknight": "/img/mon_frostknight.png",
  "frostLordDragon": "/img/mon_frostlorddragon.png",
  "frostlorddragon": "/img/mon_frostlorddragon.png",
  "mon_frostlorddragon": "/img/mon_frostlorddragon.png",
  "lindvior": "/img/mon_lidivior.png",
  "mon_lindvior": "/img/mon_lidivior.png",
  "tombGuardian": "/img/mon_deathknight.png", // TODO: falta arte própria para este monstro
  "tombguardian": "/img/mon_deathknight.png", // TODO: falta arte própria para este monstro
  "mon_tombguardian": "/img/mon_deathknight.png", // TODO: falta arte própria para este monstro
  "sepulcherArchon": "/img/mon_darkmage.png", // TODO: falta arte própria para este monstro
  "sepulcherarchon": "/img/mon_darkmage.png", // TODO: falta arte própria para este monstro
  "mon_sepulcherarchon": "/img/mon_darkmage.png", // TODO: falta arte própria para este monstro
  "undeadKnight": "/img/mon_knight.png", // TODO: falta arte própria para este monstro
  "undeadknight": "/img/mon_knight.png", // TODO: falta arte própria para este monstro
  "mon_undeadknight": "/img/mon_knight.png", // TODO: falta arte própria para este monstro
  "lichLord": "/img/mon_lichlord.png",
  "lichlord": "/img/mon_lichlord.png",
  "mon_lichlord": "/img/mon_lichlord.png",
  "deathKing": "/img/mon_deathking.png",
  "deathking": "/img/mon_deathking.png",
  "mon_deathking": "/img/mon_deathking.png",
  "caveDrake": "/img/mon_dragon.png", // TODO: falta arte própria para este monstro
  "cavedrake": "/img/mon_dragon.png", // TODO: falta arte própria para este monstro
  "mon_cavedrake": "/img/mon_dragon.png", // TODO: falta arte própria para este monstro
  "magmaBeast": "/img/mon_blackdragon.png", // TODO: falta arte própria para este monstro
  "magmabeast": "/img/mon_blackdragon.png", // TODO: falta arte própria para este monstro
  "mon_magmabeast": "/img/mon_blackdragon.png", // TODO: falta arte própria para este monstro
  "earthDrake": "/img/mon_antharas.png",
  "earthdrake": "/img/mon_antharas.png",
  "mon_earthdrake": "/img/mon_antharas.png",
  "antharas": "/img/mon_antharas.png",
  "mon_antharas": "/img/mon_antharas.png",
  "valakasMinion": "/img/mon_valakasminion.png",
  "valakasminion": "/img/mon_valakasminion.png",
  "mon_valakasminion": "/img/mon_valakasminion.png",
  "lavaGolem": "/img/mon_flamingdemonglord.png", // TODO: falta arte própria para este monstro
  "lavagolem": "/img/mon_flamingdemonglord.png", // TODO: falta arte própria para este monstro
  "mon_lavagolem": "/img/mon_flamingdemonglord.png", // TODO: falta arte própria para este monstro
  "flameArchon": "/img/mon_flamegiantdragom.png",
  "flamearchon": "/img/mon_flamegiantdragom.png",
  "mon_flamearchon": "/img/mon_flamegiantdragom.png",
  "flameGiantDragon": "/img/mon_flamegiantdragom.png",
  "flamegiantdragon": "/img/mon_flamegiantdragom.png",
  "mon_flamegiantdragon": "/img/mon_flamegiantdragom.png",
  "vulcanLord": "/img/mon_valakas.png",
  "vulcanlord": "/img/mon_valakas.png",
  "mon_vulcanlord": "/img/mon_valakas.png",
  "valakas": "/img/mon_valakas.png",
  "mon_valakas": "/img/mon_valakas.png"
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
export function heroSVG(race, cls, aura, mode) {
  const src = getAssetUrl(heroImgPath(race, cls));
  const border = aura || "#8a6a24";

  if (mode === "bust") {
    return `<div class="hero-svg hero-bust" style="position:relative;width:100%;height:100%;overflow:hidden;border-radius:50%;">
      <img src="${src}" alt="${race} ${cls}" draggable="false" onerror="this.onerror=null; this.src='${getAssetUrl(`img/${race}_${cls}.png`)}';"
        style="width:100%;height:100%;object-fit:cover;object-position:center 15%;filter:drop-shadow(0 0 6px ${border});" />
      <div style="position:absolute;inset:0;border-radius:50%;border:2px solid ${border};box-shadow:inset 0 0 20px rgba(0,0,0,0.6);pointer-events:none;"></div>
    </div>`;
  }

  return `<div class="hero-svg hero-full" style="width:100%;height:100%;position:relative;">
    <img src="${src}" alt="${race} ${cls}" draggable="false" onerror="this.onerror=null; this.src='${getAssetUrl(`img/${race}_${cls}.png`)}';"
      style="width:100%;height:100%;object-fit:contain;object-position:center bottom;filter:drop-shadow(0 8px 16px rgba(0,0,0,0.7)) drop-shadow(0 0 4px ${border || 'transparent'});" />
  </div>`;
}

// ================================================================
//  monsterSVG(id, opts)
// ================================================================
export function monsterSVG(id, opts) {
  const safeId = id || '';
  const imgSrc = MON_IMG[safeId] || (safeId ? MON_IMG[safeId.toLowerCase()] : null) || '/img/mon_goblin.png';
  const crown = opts?.crown
    ? `<div style="position:absolute;top:-8px;left:50%;transform:translateX(-50%);font-size:22px;filter:drop-shadow(0 0 6px #f0c840);z-index:2;">👑</div>`
    : "";

  const resolvedSrc = getAssetUrl(resolveImg(imgSrc));
  const glow = opts?.crown ? "drop-shadow(0 0 10px rgba(240,200,64,0.5))" : "drop-shadow(0 6px 12px rgba(0,0,0,0.6))";
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
