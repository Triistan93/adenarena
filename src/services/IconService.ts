/**
 * IconService - Centralized resolver for Lineage 2 icons (Classes, Skills, Weapons, Armors, Jewelry, Shots).
 * Uses high-quality WebP icons extracted from L2Bandit database stored in /icons/.
 */

// In-memory cache loaded optionally from /icons/icon_map.json (20,000+ mappings)
let cachedIconMap: Record<string, string> | null = null;
let isLoadingMap = false;

export const CLASS_ICONS: Record<string, string> = {
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
  elfFighter: '/icons/elven_fighter.webp',
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
  elfMage: '/icons/elven_mage.webp',
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
  darkElfFighter: '/icons/dark_fighter.webp',
  darkelffighter: '/icons/dark_fighter.webp',
  palus_knight: '/icons/palus_knight.webp',
  assasin: '/icons/assasin.webp',
  assassinS0: '/icons/assasin.webp',
  assassinBase: '/icons/assasin.webp',
  assassin: '/icons/assasin.webp',
  shillien_knight: '/icons/shillien_knight.webp',
  bladedancer: '/icons/bladedancer.webp',
  spectral_dancer: '/icons/spectral_dancer.webp',
  abyss_walker: '/icons/abyss_walker.webp',
  phantom_ranger: '/icons/phantom_ranger.webp',
  shillien_templar: '/icons/shillien_templar.webp',
  ghost_hunter: '/icons/ghost_hunter.webp',
  ghost_sentinel: '/icons/ghost_sentinel.webp',

  dark_mage: '/icons/dark_mage.webp',
  darkElfMage: '/icons/dark_mage.webp',
  darkelfmage: '/icons/dark_mage.webp',
  dark_wizard: '/icons/dark_wizard.webp',
  shillien_oracle: '/icons/shillien_oracle.webp',
  bloodRoseBase: '/icons/shillien_oracle.webp',
  bloodrosebase: '/icons/shillien_oracle.webp',
  spellhowler: '/icons/spellhowler.webp',
  phantom_summoner: '/icons/phantom_summoner.webp',
  shillien_elder: '/icons/shillien_elder.webp',
  storm_screamer: '/icons/storm_screamer.webp',
  spectral_master: '/icons/spectral_master.webp',
  shillien_saint: '/icons/shillien_saint.webp',

  // Orcs
  orc_fighter: '/icons/orc_fighter.webp',
  orcFighter: '/icons/orc_fighter.webp',
  orcfighter: '/icons/orc_fighter.webp',
  orc_raider: '/icons/orc_raider.webp',
  rider: '/icons/orc_raider.webp',
  orcRider: '/icons/orc_raider.webp',
  orc_monk: '/icons/orc_monk.webp',
  destroyer: '/icons/destroyer.webp',
  tyrant: '/icons/tyrant.webp',
  titan: '/icons/titan.webp',
  grand_khavatari: '/icons/grand_khavatari.webp',

  orc_mage: '/icons/orc_mage.webp',
  orcMage: '/icons/orc_mage.webp',
  orcmage: '/icons/orc_mage.webp',
  orc_shaman: '/icons/orc_shaman.webp',
  overlord: '/icons/overlord.webp',
  warcryer: '/icons/warcryer.webp',
  dominator: '/icons/dominator.webp',
  doomcryer: '/icons/doomcryer.webp',

  // Dwarves
  dwarven_fighter: '/icons/dwarven_fighter.webp',
  dwarfFighter: '/icons/dwarven_fighter.webp',
  dwarffighter: '/icons/dwarven_fighter.webp',
  scavenger: '/icons/scavenger.webp',
  artisan: '/icons/artisan.webp',
  bounty_hunter: '/icons/bounty_hunter.webp',
  warsmith: '/icons/warsmith.webp',
  fortune_seeker: '/icons/fortune_seeker.webp',
  maestro: '/icons/maestro.webp',
  shineMakerBase: '/icons/warsmith.webp',
  shinemakerbase: '/icons/warsmith.webp',

  // Specialty & Extras
  deathPilgrim: '/icons/hell_knight.webp',
  deathpilgrim: '/icons/hell_knight.webp',
  wargBase: '/icons/warlord.webp',
  wargbase: '/icons/warlord.webp',
  kamaelSoldier: '/icons/fighter.webp',
  kamaelsoldier: '/icons/fighter.webp',
  samuraiBase: '/icons/duelist.webp',
  samuraibase: '/icons/duelist.webp',
  sylphGunner: '/icons/hawkeye.webp',
  sylphgunner: '/icons/hawkeye.webp',
  divineTemplarBase: '/icons/paladin.webp',
  divinetemplarbase: '/icons/paladin.webp',
  elementWeaverBase: '/icons/archmage.webp',
  elementweaverbase: '/icons/archmage.webp',
  marauderBase: '/icons/tyrant.webp',
  marauderbase: '/icons/tyrant.webp',
  sayhaMageBase: '/icons/spellsinger.webp',
  sayhamagebase: '/icons/spellsinger.webp'
};

export const POPULAR_SKILL_ICONS: Record<string, string> = {
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
  vampiric_touch: '/icons/skill1147.webp',
  whirlwind: '/icons/skill0036.webp',
  triple_slash: '/icons/skill0001.webp',
  double_shot: '/icons/skill0019.webp',
  flame_strike: '/icons/skill1168.webp',
  body_to_mind: '/icons/skill1157.webp',
  berserker_spirit: '/icons/skill1062.webp',
  might: '/icons/skill1068.webp',
  shield: '/icons/skill1040.webp',
  focus: '/icons/skill1077.webp',
  death_whisper: '/icons/skill1086.webp',
  haste: '/icons/skill1085.webp',
  acumen: '/icons/skill1085.webp',
  blessing_of_eva: '/icons/skill1500.webp'
};

export const SHOT_ICONS: Record<string, string> = {
  soulshot_ng: '/icons/etc_spell_shot_silver_i00.webp',
  soulshot_d: '/icons/etc_spell_shot_white_i00.webp',
  soulshot_c: '/icons/etc_spell_shot_white_i01.webp',
  soulshot_b: '/icons/etc_spell_shot_white_i02.webp',
  soulshot_a: '/icons/etc_spell_shot_white_i03.webp',
  soulshot_s: '/icons/etc_spell_shot_gold_i00.webp',
  spiritshot_ng: '/icons/etc_spirit_bullet_silver_i00.webp',
  spiritshot_d: '/icons/etc_spirit_bullet_white_i00.webp',
  spiritshot_c: '/icons/etc_spirit_bullet_white_i01.webp',
  spiritshot_b: '/icons/etc_spirit_bullet_white_i02.webp',
  spiritshot_a: '/icons/etc_spirit_bullet_white_i03.webp',
  spiritshot_s: '/icons/etc_spirit_bullet_gold_i00.webp',
  blessed_spiritshot_d: '/icons/etc_blessed_spirit_bullet_white_i00.webp',
  blessed_spiritshot_c: '/icons/etc_blessed_spirit_bullet_white_i01.webp',
  blessed_spiritshot_b: '/icons/etc_blessed_spirit_bullet_white_i02.webp',
  blessed_spiritshot_a: '/icons/etc_blessed_spirit_bullet_white_i03.webp',
  blessed_spiritshot_s: '/icons/etc_blessed_spirit_bullet_gold_i00.webp'
};

/**
 * Asynchronously loads the complete 20k icon map from /icons/icon_map.json
 */
export async function loadIconMap(): Promise<Record<string, string>> {
  if (cachedIconMap) return cachedIconMap;
  if (isLoadingMap) {
    while (isLoadingMap) {
      await new Promise(r => setTimeout(r, 50));
    }
    return cachedIconMap || {};
  }

  isLoadingMap = true;
  try {
    const res = await fetch('/icons/icon_map.json');
    if (res.ok) {
      cachedIconMap = await res.json();
    }
  } catch (err) {
    console.warn('[IconService] Could not load /icons/icon_map.json:', err);
  } finally {
    isLoadingMap = false;
  }
  return cachedIconMap || {};
}

/**
 * Returns the crest/banner icon path for a class ID or name.
 */
export function getClassIcon(classIdOrName: string): string {
  if (!classIdOrName) return '/icons/fighter.webp';
  const clean = classIdOrName.trim().toLowerCase().replace(/[-\s]+/g, '_');
  if (CLASS_ICONS[clean]) return CLASS_ICONS[clean];
  if (CLASS_ICONS[classIdOrName]) return CLASS_ICONS[classIdOrName];
  if (cachedIconMap && cachedIconMap[clean]) return cachedIconMap[clean];
  return '/icons/fighter.webp';
}

/**
 * Returns the skill icon path.
 */
export function getSkillIcon(skillIdOrName: string): string {
  if (!skillIdOrName) return '/icons/skill0003.webp';
  const clean = skillIdOrName.trim().toLowerCase().replace(/[-\s]+/g, '_');
  if (POPULAR_SKILL_ICONS[clean]) return POPULAR_SKILL_ICONS[clean];
  if (cachedIconMap && cachedIconMap[clean]) return cachedIconMap[clean];
  if (cachedIconMap && cachedIconMap[skillIdOrName]) return cachedIconMap[skillIdOrName];
  return '/icons/skill0003.webp';
}

/**
 * Returns the weapon icon path.
 */
export function getWeaponIcon(weaponIdOrName: string): string {
  if (!weaponIdOrName) return '/icons/weapon_falchion_i00.webp';
  const clean = weaponIdOrName.trim().toLowerCase().replace(/[-\s]+/g, '_');
  if (cachedIconMap && cachedIconMap[clean]) return cachedIconMap[clean];
  if (cachedIconMap && cachedIconMap[`weapon_${clean}`]) return cachedIconMap[`weapon_${clean}`];
  return '/icons/weapon_falchion_i00.webp';
}

/**
 * Returns the item icon path (weapon, armor, jewel, shot, material).
 */
export function getItemIcon(itemIdOrName: string): string {
  if (!itemIdOrName) return '/icons/weapon_falchion_i00.webp';
  const clean = itemIdOrName.trim().toLowerCase().replace(/[-\s]+/g, '_');
  if (SHOT_ICONS[clean]) return SHOT_ICONS[clean];
  if (cachedIconMap && cachedIconMap[clean]) return cachedIconMap[clean];
  return resolveIconUrl(clean);
}

/**
 * Normalizes any icon string from L2Bandit / PMfun into a valid /icons/ local URL.
 */
export function resolveIconUrl(iconString?: string): string {
  if (!iconString) return '/icons/fighter.webp';
  
  if (iconString.startsWith('http://') || iconString.startsWith('https://')) {
    return iconString;
  }
  
  let clean = iconString.trim();
  // Strip leading slashes and directories like "data/img/" or "icons/"
  clean = clean.replace(/^(\/?(icons|images|data\/img)\/)+/, '').replace(/^\/+/, '');
  
  if (!clean.includes('.')) {
    clean += '.webp';
  }
  
  return `/icons/${clean}`;
}

export default {
  CLASS_ICONS,
  POPULAR_SKILL_ICONS,
  SHOT_ICONS,
  loadIconMap,
  getClassIcon,
  getSkillIcon,
  getWeaponIcon,
  getItemIcon,
  resolveIconUrl
};
