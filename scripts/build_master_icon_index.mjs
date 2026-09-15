import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const PUBLIC_ICONS_DIR = path.join(ROOT_DIR, 'public', 'icons');
const PUBLIC_IMG_ICONS_DIR = path.join(ROOT_DIR, 'public', 'img', 'icons');
const SCRAPED_DIR = path.join(ROOT_DIR, 'scraped_data_bandit');

console.log('Building Master Icon Index...');

// 1. Scan public/icons
const iconFiles = fs.readdirSync(PUBLIC_ICONS_DIR).filter(f => f.endsWith('.webp'));
console.log(`Found ${iconFiles.length} WebP files in public/icons/`);

const iconMap = {};
const iconFilesSet = new Set(iconFiles);

function register(key, targetFileName) {
  if (!key || !targetFileName) return;
  const fileName = targetFileName.startsWith('/') ? targetFileName.slice(1) : targetFileName;
  const webpName = fileName.endsWith('.webp') ? fileName : fileName + '.webp';
  
  if (!iconFilesSet.has(webpName)) {
    // Try to find if there's an _i00 version
    const withI00 = webpName.replace(/\.webp$/, '_i00.webp');
    if (iconFilesSet.has(withI00)) {
      register(key, withI00);
      return;
    }
    return;
  }
  
  const finalPath = `/icons/${webpName}`;
  const cleanKey = String(key).trim().toLowerCase();
  
  // Register various forms of the key
  iconMap[cleanKey] = finalPath;
  iconMap[cleanKey.replace(/[-\s]+/g, '_')] = finalPath;
  iconMap[cleanKey.replace(/[^a-z0-9]/g, '')] = finalPath;
}

// Register physical files directly
for (const f of iconFiles) {
  const base = f.replace(/\.webp$/, '');
  register(base, f);
  
  // without _i00 / _i01 / _i02
  const noSuffix = base.replace(/_i0\d$/, '');
  if (noSuffix !== base) {
    register(noSuffix, f);
  }
  
  // without type prefix (weapon_, armor_, shield_, accessary_, etc_, skill)
  const noPrefix = noSuffix.replace(/^(weapon_|armor_|shield_|accessary_|etc_|skill)/, '');
  if (noPrefix !== noSuffix) {
    register(noPrefix, f);
  }
}

// 2. Load classes.json
try {
  const classesFile = path.join(SCRAPED_DIR, 'other', 'classes.json');
  if (fs.existsSync(classesFile)) {
    const classes = JSON.parse(fs.readFileSync(classesFile, 'utf8'));
    function processClass(node) {
      if (node.id && node.icon) {
        register(node.id, node.icon);
        if (node.name && node.name.en) {
          register(node.name.en, node.icon);
        }
      }
      if (node.next && Array.isArray(node.next)) {
        for (const child of node.next) processClass(child);
      }
    }
    for (const tree of classes) processClass(tree);
    console.log('Processed classes.json');
  }
} catch (err) {
  console.warn('Error reading classes.json:', err.message);
}

// 3. Load skills.json
try {
  const skillsFile = path.join(SCRAPED_DIR, 'other', 'skills.json');
  if (fs.existsSync(skillsFile)) {
    const skills = JSON.parse(fs.readFileSync(skillsFile, 'utf8'));
    for (const s of skills) {
      const icon = s.data && s.data.icon;
      if (icon) {
        if (s.key) register(s.key, icon);
        if (s.data.unitName) register(s.data.unitName, icon);
        if (s.data.name && s.data.name.en) {
          register(s.data.name.en, icon);
        }
      }
    }
    console.log(`Processed ${skills.length} skills from skills.json`);
  }
} catch (err) {
  console.warn('Error reading skills.json:', err.message);
}

// 4. Load l2bandit_all.json (weapons, armors, accessories, shots, etc.)
try {
  const allFile = path.join(SCRAPED_DIR, 'l2bandit_all.json');
  if (fs.existsSync(allFile)) {
    const allData = JSON.parse(fs.readFileSync(allFile, 'utf8'));
    
    function processUnitList(arr) {
      if (!Array.isArray(arr)) return;
      for (const item of arr) {
        const d = item.data || {};
        const icon = d.icon;
        if (icon) {
          if (item.key) register(item.key, icon);
          if (d.unitName) register(d.unitName, icon);
          if (d.name && d.name.en) register(d.name.en, icon);
        }
      }
    }
    
    for (const cat of ['weapons', 'armors', 'accessories']) {
      if (allData[cat]) {
        for (const sub of Object.keys(allData[cat])) {
          processUnitList(allData[cat][sub]);
        }
      }
    }
    
    // shots & resources
    if (allData.other) {
      if (allData.other.shots) processUnitList(allData.other.shots);
      if (allData.other.resources) processUnitList(allData.other.resources);
    }
    
    console.log('Processed weapons, armors, accessories, shots from l2bandit_all.json');
  }
} catch (err) {
  console.warn('Error reading l2bandit_all.json:', err.message);
}

// 5. Explicit alias mappings for special classes and common items
const ALIASES = {
  // Humans
  fighter: '/icons/fighter.webp',
  warrior: '/icons/warrior.webp',
  knight: '/icons/knight.webp',
  rogue: '/icons/rogue.webp',
  gladiator: '/icons/gladiator.webp',
  warlord: '/icons/warlord.webp',
  paladin: '/icons/paladin.webp',
  dark_avenger: '/icons/dark_avenger.webp',
  treasure_hunter: '/icons/treasure_hunter.webp',
  hawkeye: '/icons/hawkeye.webp',
  duelist: '/icons/duelist.webp',
  dreadnought: '/icons/dreadnought.webp',
  phoenix_knight: '/icons/phoenix_knight.webp',
  hell_knight: '/icons/hell_knight.webp',
  adventurer: '/icons/adventurer.webp',
  sagittarius: '/icons/sagittarius.webp',
  mage: '/icons/mage.webp',
  wizard: '/icons/wizard.webp',
  cleric: '/icons/cleric.webp',
  sorcerer: '/icons/sorcerer.webp',
  necromancer: '/icons/necromancer.webp',
  warlock: '/icons/warlock.webp',
  bishop: '/icons/bishop.webp',
  prophet: '/icons/prophet.webp',
  archmage: '/icons/archmage.webp',
  soultaker: '/icons/soultaker.webp',
  arcana_lord: '/icons/arcana_lord.webp',
  cardinal: '/icons/cardinal.webp',
  hierophant: '/icons/hierophant.webp',

  // Elves
  elven_fighter: '/icons/elven_fighter.webp',
  elffighter: '/icons/elven_fighter.webp',
  elven_knight: '/icons/elven_knight.webp',
  elven_scout: '/icons/elven_scout.webp',
  temple_knight: '/icons/temple_knight.webp',
  swordsinger: '/icons/swordsinger.webp',
  sword_muse: '/icons/sword_muse.webp',
  plain_walker: '/icons/plain_walker.webp',
  silver_ranger: '/icons/silver_ranger.webp',
  evas_templar: '/icons/evas_templar.webp',
  wind_rider: '/icons/wind_rider.webp',
  moonlight_sentinel: '/icons/moonlight_sentinel.webp',
  elven_mage: '/icons/elven_mage.webp',
  elfmage: '/icons/elven_mage.webp',
  elven_wizard: '/icons/elven_wizard.webp',
  oracle: '/icons/oracle.webp',
  spellsinger: '/icons/spellsinger.webp',
  elemental_summoner: '/icons/elemental_summoner.webp',
  elder: '/icons/elder.webp',
  mystic_muse: '/icons/mystic_muse.webp',
  elemental_master: '/icons/elemental_master.webp',
  evas_saint: '/icons/evas_saint.webp',

  // Dark Elves
  dark_fighter: '/icons/dark_fighter.webp',
  darkelffighter: '/icons/dark_fighter.webp',
  palus_knight: '/icons/palus_knight.webp',
  assasin: '/icons/assasin.webp',
  assassins0: '/icons/assasin.webp',
  assassinbase: '/icons/assasin.webp',
  shillien_knight: '/icons/shillien_knight.webp',
  bladedancer: '/icons/bladedancer.webp',
  spectral_dancer: '/icons/spectral_dancer.webp',
  abyss_walker: '/icons/abyss_walker.webp',
  phantom_ranger: '/icons/phantom_ranger.webp',
  shillien_templar: '/icons/shillien_templar.webp',
  ghost_hunter: '/icons/ghost_hunter.webp',
  ghost_sentinel: '/icons/ghost_sentinel.webp',
  dark_mage: '/icons/dark_mage.webp',
  darkelfmage: '/icons/dark_mage.webp',
  dark_wizard: '/icons/dark_wizard.webp',
  shillien_oracle: '/icons/shillien_oracle.webp',
  bloodrosebase: '/icons/shillien_oracle.webp',
  spellhowler: '/icons/spellhowler.webp',
  phantom_summoner: '/icons/phantom_summoner.webp',
  shillien_elder: '/icons/shillien_elder.webp',
  storm_screamer: '/icons/storm_screamer.webp',
  spectral_master: '/icons/spectral_master.webp',
  shillien_saint: '/icons/shillien_saint.webp',

  // Orcs
  orc_fighter: '/icons/orc_fighter.webp',
  orcfighter: '/icons/orc_fighter.webp',
  orc_raider: '/icons/orc_raider.webp',
  rider: '/icons/orc_raider.webp',
  orc_monk: '/icons/orc_monk.webp',
  destroyer: '/icons/destroyer.webp',
  tyrant: '/icons/tyrant.webp',
  titan: '/icons/titan.webp',
  grand_khavatari: '/icons/grand_khavatari.webp',
  orc_mage: '/icons/orc_mage.webp',
  orcmage: '/icons/orc_mage.webp',
  orc_shaman: '/icons/orc_shaman.webp',
  overlord: '/icons/overlord.webp',
  warcryer: '/icons/warcryer.webp',
  dominator: '/icons/dominator.webp',
  doomcryer: '/icons/doomcryer.webp',

  // Dwarves
  dwarven_fighter: '/icons/dwarven_fighter.webp',
  dwarffighter: '/icons/dwarven_fighter.webp',
  scavenger: '/icons/scavenger.webp',
  artisan: '/icons/artisan.webp',
  bounty_hunter: '/icons/bounty_hunter.webp',
  warsmith: '/icons/warsmith.webp',
  fortune_seeker: '/icons/fortune_seeker.webp',
  maestro: '/icons/maestro.webp',
  shinemakerbase: '/icons/warsmith.webp',

  // Extras
  deathpilgrim: '/icons/hell_knight.webp',
  wargbase: '/icons/warlord.webp',
  kamaelsoldier: '/icons/fighter.webp',
  samuraibase: '/icons/duelist.webp',
  sylphgunner: '/icons/hawkeye.webp',
  divinetemplarbase: '/icons/paladin.webp',
  elementweaverbase: '/icons/archmage.webp',
  marauderbase: '/icons/tyrant.webp',
  sayhamagebase: '/icons/spellsinger.webp',

  // Common Skills
  power_strike: '/icons/skill0003.webp',
  power_strike_f: '/icons/skill0003.webp',
  mortal_blow: '/icons/skill0016.webp',
  stun_attack: '/icons/skill0100.webp',
  drain_energy: '/icons/skill0069.webp',
  wind_strike: '/icons/skill1177.webp',
  ice_bolt: '/icons/skill1184.webp',
  heal: '/icons/skill1015.webp',
  battle_roar: '/icons/skill0121.webp',
  iron_punch: '/icons/skill0054.webp',
  rapid_shot: '/icons/skill0099.webp',
  shield_stun: '/icons/skill0092.webp',
  vampiric_touch: '/icons/skill1147.webp'
};

for (const [k, v] of Object.entries(ALIASES)) {
  iconMap[k] = v;
  iconMap[k.toLowerCase()] = v;
  iconMap[k.replace(/_/g, '')] = v;
}

console.log(`Compiled master map with ${Object.keys(iconMap).length} entries.`);

// 6. Write public/icons/icon_map.json
const masterJsonPath = path.join(PUBLIC_ICONS_DIR, 'icon_map.json');
fs.writeFileSync(masterJsonPath, JSON.stringify(iconMap, null, 2), 'utf8');
console.log(`Saved master index to ${masterJsonPath} (${(fs.statSync(masterJsonPath).size / 1024).toFixed(1)} KB)`);

// 7. Update public/img/icons/icon_index.json
if (!fs.existsSync(PUBLIC_IMG_ICONS_DIR)) {
  fs.mkdirSync(PUBLIC_IMG_ICONS_DIR, { recursive: true });
}
const legacyIndexFile = path.join(PUBLIC_IMG_ICONS_DIR, 'icon_index.json');
let legacyIndex = {};
if (fs.existsSync(legacyIndexFile)) {
  try {
    legacyIndex = JSON.parse(fs.readFileSync(legacyIndexFile, 'utf8'));
  } catch {}
}

// Merge iconMap into legacyIndex
for (const [k, v] of Object.entries(iconMap)) {
  const relPath = v.startsWith('/') ? v.slice(1) : v;
  legacyIndex[k] = relPath;
}

fs.writeFileSync(legacyIndexFile, JSON.stringify(legacyIndex, null, 2), 'utf8');
console.log(`Updated legacy index at ${legacyIndexFile} with ${Object.keys(legacyIndex).length} total keys.`);
