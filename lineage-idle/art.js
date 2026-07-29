// ================================================================
// Aden / Lineage Idle — Visual Art Module v3
// Painted 3D-figurine illustrations for heroes and monsters.
// Falls back to the closest match when a specific combo isn't
// available.  Pure functions — no DOM, no globals.
// ================================================================

// ---- Hero image map: race_class → image path ----
const HERO_IMG = {
  human_fighter: "/img/human_fighter.png",
  human_mage: "/img/human_mage.png",
  elf_fighter: "/img/elf_fighter.png",
  elf_mage: "/img/elf_mage.png",         
  elf_archer: "/img/elf_fighter.png",
  elf_mystic: "/img/elf_mage.png",
  elf_sentinel: "/img/elf_fighter.png",
  darkelf_fighter: "/img/darkelf_fighter.png",
  darkelf_mage: "/img/darkelf_mage.png",
  darkelf_assassin: "/img/darkelf_fighter.png",
  darkelf_shillien: "/img/darkelf_mage.png",
  darkelf_sorcerer: "/img/darkelf_mage.png",
  orc_fighter: "public/img/Races/Orcs/Fighter/orc_fighter.png",
  orc_mage: "/img/orc_mage.png",
  orc_destroyer: "/img/orc_fighter.png",
  orc_monk: "/img/orc_fighter.png",
  orc_overlord: "/img/orc_mage.png",
  dwarf_artisan: "/img/dwarf_artisan.png",
  dwarf_fighter: "/img/dwarf_artisan.png",
  dwarf_warsmith: "/img/dwarf_artisan.png",
  kamael_soulbreaker: "/img/kamael_soulbreaker.png",
  kamael_fighter: "/img/kamael_soulbreaker.png",
  kamael_berserker: "/img/kamael_soulbreaker.png",
  ertheia_fighter: "/img/elf_fighter.png",
  ertheia_mage: "/img/elf_mage.png",
};

// Fallback by race only
const RACE_FALLBACK = {
  human: "/img/human_fighter.png",
  elf: "/img/elf_fighter.png",
  darkelf: "/img/darkelf_fighter.png",
  orc: "public/img/Races/Orcs/Fighter/orc_fighter.png",
  dwarf: "/img/dwarf_artisan.png",
  kamael: "/img/kamael_soulbreaker.png",
  ertheia: "/img/elf_fighter.png",
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
  "mon_mage": "/img/Monsters/mon_mage.png",
  "mon_antharas": "/img/Monsters/SemLocal/mon_antharas.png",
  "mon_blackdragon": "/img/Monsters/SemLocal/mon_blackdragon.png",
  "mon_deathknight": "/img/Monsters/SemLocal/mon_deathknight.png",
  "mon_deathwizard": "/img/Monsters/SemLocal/mon_deathwizard.png",
  "mon_flamingdemonglord": "/img/Monsters/SemLocal/mon_flamingdemonglord.png",
  "mon_spider": "/img/Monsters/SemLocal/mon_spider.png",
  "mon_swampwalker": "/img/Monsters/DarkForest/mon_swampwalker.png",
  "devilbone": "/img/Monsters/SemLocal/devilbone.png",
  "mon_dragon": "/img/Monsters/SemLocal/mon_dragon.png",
  "mon_dragonknight": "/img/Monsters/SemLocal/mon_dragonknight.png",
  "mon_frostknight": "/img/Monsters/SemLocal/mon_frostknight.png",
  "mon_frostlorddragon": "/img/Monsters/SemLocal/mon_frostlorddragon.png",
  "mon_lidivior": "/img/Monsters/SemLocal/mon_lidivior.png",
  "dwarvenMine": "/img/Monsters/DwarvenMine/dwarvenMine.png",
  "mon_kobold": "/img/Monsters/SemLocal/mon_kobold.png",
  "mon_koboldleader": "/img/Monsters/SemLocal/mon_koboldleader.png",
  "mon_deathtrent": "/img/Monsters/ElvenForest/mon_deathtrent.png",
  "mon_direwolf": "/img/Monsters/SemLocal/mon_direwolf.png",
  "mon_rootwitch": "/img/Monsters/ElvenForest/mon_rootwitch.png",
  "mon_emeraldsnake": "/img/Monsters/emeraldGrove/mon_emeraldsnake.png",
  "mon_emereldadragon": "/img/Monsters/SemLocal/mon_emereldadragon.png",
  "mon_fafurion": "/img/Monsters/SemLocal/mon_fafurion.png",
  "mon_flamegiantdragom": "/img/Monsters/SemLocal/mon_flamegiantdragom.png",
  "mon_valakas": "/img/Monsters/SemLocal/mon_valakas.png",
  "mon_valakasminion": "/img/Monsters/SemLocal/mon_valakasminion.png",
  "mon_corpseworm": "/img/Monsters/SemLocal/mon_corpseworm.png",
  "mon_cryptLord": "/img/Monsters/forsakenCrypt/mon_cryptLord.png",
  "mon_cryptvampire": "/img/Monsters/forsakenCrypt/mon_cryptvampire.png",
  "mon_darkmage": "/img/Monsters/SemLocal/mon_darkmage.png",
  "mon_furioussouls": "/img/Monsters/SemLocal/mon_furioussouls.png",
  "giranOutskirts": "/img/Monsters/GiranOutskirts/giranOutskirts.png",
  "mon_deathrider": "/img/Monsters/SemLocal/mon_deathrider.png",
  "mon_minotaurknight": "/img/Monsters/GiranOutskirts/mon_minotaurknight.png",
  "mon_skeleton": "/img/Monsters/SemLocal/mon_skeleton.png",
  "mon_cursedknight": "/img/Monsters/SemLocal/mon_cursedknight.png",
  "mon_knight": "/img/Monsters/SemLocal/mon_knight.png",
  "howlingMoor": "/img/Monsters/HowlingMoor/howlingMoor.png",
  "mon_alphawolf": "/img/Monsters/wolfMountain/mon_alphawolf.png",
  "mon_ancientsathyr": "/img/Monsters/SemLocal/mon_ancientsathyr.png",
  "mon_babytiamat": "/img/Monsters/SemLocal/mon_babytiamat.png",
  "mon_crimsombabydragon": "/img/Monsters/SemLocal/mon_crimsombabydragon.png",
  "mon_deathking": "/img/Monsters/SemLocal/mon_deathking.png",
  "mon_lichlord": "/img/Monsters/SemLocal/mon_lichlord.png",
  "kamaelLair": "/img/Monsters/KamaelLair/kamaelLair.png",
  "mon_scout": "/img/Monsters/SemLocal/mon_scout.png",
  "mon_armoredgoblin": "/img/Monsters/TalkingIsland/mon_armoredgoblin.png",
  "mon_cerberus": "/img/Monsters/underworldGate/mon_cerberus.png",
  "mon_goblin": "/img/Monsters/TalkingIsland/mon_goblin.png",
  "mon_goblinmage": "/img/Monsters/TalkingIsland/mon_goblinmage.png",
  "mon_goblinthief": "/img/Monsters/TalkingIsland/mon_goblinthief.png",
  "mon_orc": "/img/Monsters/SemLocal/mon_orc.png",
  "mon_voidcreature": "/img/Monsters/SemLocal/mon_voidcreature.png",
  "mon_cursedwarior": "/img/Monsters/SemLocal/mon_cursedwarior.png",
  "orcenRuins": "/img/Monsters/orcenRuins/orcenRuins.png",
  "orcVillage": "/img/Monsters/OrcVillage/orcVillage.png",
  "mon_beholder": "/img/Monsters/SemLocal/mon_beholder.png",
  "mon_voidbrute": "/img/Monsters/riftOfTheVoid/mon_voidbrute.png",
  "mon_voiddragonlord": "/img/Monsters/riftOfTheVoid/mon_voiddragonlord.png",
  "mon_voidstalker": "/img/Monsters/riftOfTheVoid/mon_voidstalker.png",
  "mon_shadowmercenary": "/img/Monsters/RuinedOutpost/mon_shadowmercenary.png",
  "talkingIsland": "/img/Monsters/TalkingIsland/talkingIsland.png",
  "mon_blazingwerefolf": "/img/Monsters/underworldGate/mon_blazingwerefolf.png",
  "mon_swiftblaze": "/img/Monsters/underworldGate/mon_swiftblaze.png"
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

// ================================================================
//  heroSVG(race, cls, aura, mode)
// ================================================================
export function heroSVG(race, cls, aura, mode) {
  const src = heroImgPath(race, cls);
  const border = aura || "#8a6a24";

  if (mode === "bust") {
    return `<div class="hero-svg hero-bust" style="position:relative;width:100%;height:100%;overflow:hidden;border-radius:50%;">
      <img src="${src}" alt="${race} ${cls}" draggable="false" onerror="this.onerror=null; this.src='/img/Races/${race}_${cls}.png'; if(!this.naturalWidth) this.src='/img/${race}_${cls}.png';"
        style="width:100%;height:100%;object-fit:cover;object-position:center 15%;filter:drop-shadow(0 0 6px ${border});" />
      <div style="position:absolute;inset:0;border-radius:50%;border:2px solid ${border};box-shadow:inset 0 0 20px rgba(0,0,0,0.6);pointer-events:none;"></div>
    </div>`;
  }

  return `<div class="hero-svg hero-full" style="width:100%;height:100%;position:relative;">
    <img src="${src}" alt="${race} ${cls}" draggable="false" onerror="this.onerror=null; this.src='/img/Races/${race}_${cls}.png'; if(!this.naturalWidth) this.src='/img/${race}_${cls}.png';"
      style="width:100%;height:100%;object-fit:contain;object-position:center bottom;filter:drop-shadow(0 8px 16px rgba(0,0,0,0.7)) drop-shadow(0 0 4px ${border || 'transparent'});" />
  </div>`;
}

// ================================================================
//  monsterSVG(id, opts)
// ================================================================
export function monsterSVG(id, opts) {
  const imgSrc = MON_IMG[id] || `/img/Monsters/${id}.png`;
  const crown = opts?.crown
    ? `<div style="position:absolute;top:-8px;left:50%;transform:translateX(-50%);font-size:22px;filter:drop-shadow(0 0 6px #f0c840);z-index:2;">👑</div>`
    : "";

  const resolvedSrc = resolveImg(imgSrc);
  const glow = opts?.crown ? "drop-shadow(0 0 10px rgba(240,200,64,0.5))" : "drop-shadow(0 6px 12px rgba(0,0,0,0.6))";
  return `<div class="mon-svg" style="width:100%;height:100%;position:relative;">
    ${crown}
    <img src="${resolvedSrc}" alt="${id}" draggable="false" onerror="this.onerror=null; this.src='/img/Monsters/${id}.png'; if(!this.naturalWidth) this.src='/img/${id}.png';"
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
