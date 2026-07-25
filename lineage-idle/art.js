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
  elf_mage: "/img/elf_fighter.png",         
  elf_archer: "/img/elf_fighter.png",
  elf_mystic: "/img/darkelf_mage.png",
  elf_sentinel: "/img/elf_fighter.png",
  darkelf_fighter: "/img/darkelf_mage.png",
  darkelf_mage: "/img/darkelf_mage.png",
  darkelf_assassin: "/img/darkelf_mage.png",
  darkelf_shillien: "/img/darkelf_mage.png",
  darkelf_sorcerer: "/img/darkelf_mage.png",
  orc_fighter: "/img/orc_fighter.png",
  orc_mage: "/img/orc_fighter.png",
  orc_destroyer: "/img/orc_fighter.png",
  orc_monk: "/img/orc_fighter.png",
  orc_overlord: "/img/orc_fighter.png",
  dwarf_artisan: "/img/dwarf_artisan.png",
  dwarf_fighter: "/img/dwarf_artisan.png",
  dwarf_warsmith: "/img/dwarf_artisan.png",
  kamael_soulbreaker: "/img/kamael_soulbreaker.png",
  kamael_fighter: "/img/kamael_soulbreaker.png",
  kamael_berserker: "/img/kamael_soulbreaker.png",
  ertheia_fighter: "/img/elf_fighter.png",
  ertheia_mage: "/img/darkelf_mage.png",
};

// Fallback by race only
const RACE_FALLBACK = {
  human: "/img/human_fighter.png",
  elf: "/img/elf_fighter.png",
  darkelf: "/img/darkelf_mage.png",
  orc: "/img/orc_fighter.png",
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

function heroImgPath(race, cls) {
  const key = HERO_IMG[`${race}_${cls}`] || RACE_FALLBACK[race] || "/img/human_fighter.png";
  return resolveImg(key);
}

// ---- Monster image map ----
const MON_IMG = {
  wolf: "/img/mon_direwolf.png",
  spider: "/img/mon_spider.png",      
  kamaelScout: "/img/mon_scout.png",
  knight: "/img/mon_knight.png",     
  mage: "/img/mon_mage.png",      
  goblin: "/img/mon_goblin.png",
  kobold: "/img/mon_kobold.png",
  goblinKing: "/img/mon_armoredgoblin.png",
  skeleton: "/img/mon_skeleton.png",
  dragon: "/img/mon_dragon.png",
  dragonKnight: "/img/mon_dragonknight.png", // Espaço em branco corrigido aqui
  orc: "/img/mon_orc.png",
  goblinThief: "/img/mon_goblinthief.png",
  koboldLeader: "/img/mon_koboldleader.png",
  direWolf: "/img/mon_direwolf.png",
  crimsonBabyDragon: "/img/mon_crimsombabydragon.png",
  alphaWolf: "/img/mon_alphawolf.png",
  wolfAlpha: "/img/mon_alphawolf.png", // Fallback para o boss antigo
  darkMage: "/img/mon_darkmage.png",
  devilBone: "/img/devilbone.png",
  deathKnight: "/img/mon_deathknight.png",
  voidCreature: "/img/mon_voidcreature.png",
  emeraldDragon: "/img/mon_emereldadragon.png",
  cerberus: "/img/mon_cerberus.png"
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
      <img src="${src}" alt="${race} ${cls}" draggable="false"
        style="width:100%;height:100%;object-fit:cover;object-position:center 15%;filter:drop-shadow(0 0 6px ${border});" />
      <div style="position:absolute;inset:0;border-radius:50%;border:2px solid ${border};box-shadow:inset 0 0 20px rgba(0,0,0,0.6);pointer-events:none;"></div>
    </div>`;
  }

  return `<div class="hero-svg hero-full" style="width:100%;height:100%;position:relative;">
    <img src="${src}" alt="${race} ${cls}" draggable="false"
      style="width:100%;height:100%;object-fit:contain;object-position:center bottom;filter:drop-shadow(0 8px 16px rgba(0,0,0,0.7)) drop-shadow(0 0 4px ${border || 'transparent'});" />
  </div>`;
}

// ================================================================
//  monsterSVG(id, opts)
// ================================================================
export function monsterSVG(id, opts) {
  const imgSrc = MON_IMG[id];
  const crown = opts?.crown
    ? `<div style="position:absolute;top:-8px;left:50%;transform:translateX(-50%);font-size:22px;filter:drop-shadow(0 0 6px #f0c840);z-index:2;">👑</div>`
    : "";

  const resolvedSrc = imgSrc ? resolveImg(imgSrc) : null;
  if (resolvedSrc) {
    const glow = opts?.crown ? "drop-shadow(0 0 10px rgba(240,200,64,0.5))" : "drop-shadow(0 6px 12px rgba(0,0,0,0.6))";
    return `<div class="mon-svg" style="width:100%;height:100%;position:relative;">
      ${crown}
      <img src="${resolvedSrc}" alt="${id}" draggable="false"
        style="width:100%;height:100%;object-fit:contain;object-position:center bottom;filter:${glow};" />
    </div>`;
  }

  const fb = MON_SVG_FALLBACK[id];
  const c = fb?.c || "#888";
  const cd = darken(c);
  const cl = lighten(c);

  let fig = "";
  switch (fb?.shape) {
    case "beast":
      fig = `<ellipse cx="76" cy="112" rx="38" ry="22" fill="${c}"/>
        <circle cx="44" cy="92" r="18" fill="${c}"/>
        <path d="M32 82 L24 68 L38 80Z" fill="${c}"/><path d="M38 80 L32 66 L44 80Z" fill="${c}"/>
        <ellipse cx="38" cy="90" rx="3.5" ry="4" fill="${cl}"/>
        <circle cx="39" cy="90" r="2" fill="#2a0808"/>
        <path d="M58 130 L54 150 L62 150 L60 130" fill="${cd}"/>
        <path d="M90 130 L86 150 L94 150 L92 130" fill="${cd}"/>
        <path d="M106 108 Q116 106 118 118 Q110 114 104 116Z" fill="${c}" opacity="0.7"/>`;
      break;
    case "spider":
      fig = `<ellipse cx="70" cy="102" rx="28" ry="20" fill="${c}"/>
        ${[-1,1].map(s=>[0,1,2,3].map(i=>{
          const ang=0.4+i*0.4; const x2=70+s*Math.cos(ang)*50; const y2=102+Math.sin(ang)*32-14;
          return `<line x1="70" y1="102" x2="${x2}" y2="${y2}" stroke="${cd}" stroke-width="3" stroke-linecap="round"/>`;
        }).join("")).join("")}
        <circle cx="62" cy="96" r="4.5" fill="${cl}"/><circle cx="78" cy="96" r="4.5" fill="${cl}"/>
        <circle cx="62" cy="96" r="2" fill="#1a0818"/><circle cx="78" cy="96" r="2" fill="#1a0818"/>`;
      break;
    case "brute":
      fig = `<ellipse cx="70" cy="100" rx="34" ry="38" fill="${c}"/>
        <circle cx="70" cy="52" r="22" fill="${c}"/>
        <path d="M38 72 Q22 82 26 124 L42 118" fill="${c}"/>
        <path d="M102 72 Q118 82 114 124 L98 118" fill="${c}"/>
        <circle cx="24" cy="126" r="8" fill="${c}"/><circle cx="116" cy="126" r="8" fill="${c}"/>
        <path d="M60 62 L56 72 L64 66Z" fill="#e8e0c8"/><path d="M80 62 L84 72 L76 66Z" fill="#e8e0c8"/>
        <ellipse cx="62" cy="50" rx="4" ry="4.5" fill="#fff"/><ellipse cx="78" cy="50" rx="4" ry="4.5" fill="#fff"/>
        <circle cx="63" cy="50" r="2.5" fill="#2a0808"/><circle cx="79" cy="50" r="2.5" fill="#2a0808"/>`;
      break;
    case "armored":
      fig = `<path d="M46 68 Q70 58 94 68 L92 124 Q70 132 48 124Z" fill="#6a7080" stroke="#3a4050" stroke-width="1"/>
        <circle cx="70" cy="48" r="18" fill="#7a8290" stroke="#3a4050" stroke-width="1"/>
        <rect x="54" y="44" width="32" height="5" rx="1.5" fill="#2a2a38"/>
        <rect x="96" y="70" width="8" height="48" rx="3" fill="${cl}" stroke="#3a4050" stroke-width="0.8"/>
        <path d="M50 124 L46 152 L58 152 L56 124" fill="#4a5060"/>
        <path d="M84 124 L80 152 L92 152 L90 124" fill="#4a5060"/>`;
      break;
    case "caster":
      fig = `<path d="M48 74 Q70 66 92 74 L88 138 Q70 146 52 138Z" fill="${c}"/>
        <circle cx="70" cy="52" r="18" fill="${c}"/>
        <path d="M52 42 Q60 18 70 16 Q80 18 88 42 L84 36 Q70 22 56 36Z" fill="${c}"/>
        <ellipse cx="63" cy="52" rx="3.5" ry="3.5" fill="#fff"/><ellipse cx="77" cy="52" rx="3.5" ry="3.5" fill="#fff"/>
        <circle cx="64" cy="52" r="2" fill="${cd}"/><circle cx="78" cy="52" r="2" fill="${cd}"/>
        <line x1="34" y1="122" x2="28" y2="68" stroke="#4a3018" stroke-width="3" stroke-linecap="round"/>
        <circle cx="27" cy="64" r="6.5" fill="${cl}"/>`;
      break;
    default:
      fig = `<ellipse cx="70" cy="108" rx="22" ry="30" fill="${c}"/>
        <circle cx="70" cy="58" r="18" fill="${c}"/>
        <ellipse cx="63" cy="56" rx="3" ry="3.5" fill="#fff"/><ellipse cx="77" cy="56" rx="3" ry="3.5" fill="#fff"/>
        <circle cx="64" cy="56" r="1.8" fill="#1a1820"/><circle cx="78" cy="56" r="1.8" fill="#1a1820"/>`;
  }

  const sha = `<ellipse cx="70" cy="154" rx="42" ry="8" fill="#000" opacity="0.35"/>`;
  const crownSvg = opts?.crown
    ? `<path d="M48 16 L54 4 L60 14 L66 2 L72 14 L78 4 L84 16Z" fill="#f0c840" stroke="#8a6818" stroke-width="1"/>` : "";

  return `<svg viewBox="0 0 140 160" class="mon-svg" preserveAspectRatio="xMidYMid meet">${sha}${crownSvg}${fig}</svg>`;
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