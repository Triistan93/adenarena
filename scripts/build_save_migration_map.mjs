import fs from 'fs';
import { CLASS_ALIASES } from '../lineage-idle/src/data/classes/class_aliases.js';
import { CANONICAL_CLASS_REGISTRY } from '../lineage-idle/src/data/classes/CanonicalClassRegistry.js';

const canonicalIds = new Set(Object.keys(CANONICAL_CLASS_REGISTRY));

// Specific explicit overrides for legacy custom class names
const EXPLICIT_MIGRATIONS = {
  // Humans
  fighter: { canonicalId: 'fighter', confidence: 'EXACT', reason: 'Canonical Base Class' },
  humanfighter: { canonicalId: 'fighter', confidence: 'HIGH', reason: 'Legacy concatenated Human Fighter' },
  human_fighter: { canonicalId: 'fighter', confidence: 'EXACT', reason: 'Standard Human Fighter' },
  mage: { canonicalId: 'mage', confidence: 'EXACT', reason: 'Canonical Base Class' },
  humanmage: { canonicalId: 'mage', confidence: 'HIGH', reason: 'Legacy concatenated Human Mage' },
  human_mage: { canonicalId: 'mage', confidence: 'EXACT', reason: 'Standard Human Mystic' },
  wizard: { canonicalId: 'wizard', confidence: 'EXACT', reason: 'Human Wizard' },
  human_wizard: { canonicalId: 'wizard', confidence: 'HIGH', reason: 'Prefixed Human Wizard' },
  human_sorcerer: { canonicalId: 'sorcerer', confidence: 'HIGH', reason: 'Prefixed Sorcerer' },
  deathpilgrim: { canonicalId: 'human_deathknight_0', confidence: 'HIGH', reason: 'Legacy Death Pilgrim maps to Human Death Knight Base' },
  human_deathpilgrim: { canonicalId: 'human_deathknight_0', confidence: 'HIGH', reason: 'Human Death Pilgrim' },
  deathblade: { canonicalId: 'human_deathknight_1', confidence: 'HIGH', reason: 'Legacy Death Blade maps to Human Death Knight Stage 1' },
  deathknight: { canonicalId: 'human_deathknight_2', confidence: 'HIGH', reason: 'Legacy Death Knight maps to Human Death Knight Stage 2' },
  deathknight3: { canonicalId: 'human_deathknight_3', confidence: 'HIGH', reason: 'Legacy Death Knight Master' },
  wargbase: { canonicalId: 'werewolf_0', confidence: 'HIGH', reason: 'Legacy Warg Base maps to Werewolf Base' },
  human_warg: { canonicalId: 'werewolf_0', confidence: 'HIGH', reason: 'Legacy Human Warg' },
  wargs0: { canonicalId: 'werewolf_0', confidence: 'HIGH', reason: 'Legacy Warg S0' },
  wargs1: { canonicalId: 'werewolf_1', confidence: 'HIGH', reason: 'Legacy Warg S1' },
  wargs2: { canonicalId: 'werewolf_2', confidence: 'HIGH', reason: 'Legacy Warg S2' },
  wargs3: { canonicalId: 'werewolf_3', confidence: 'HIGH', reason: 'Legacy Warg S3' },
  assassinbase: { canonicalId: 'secret_assassin_male_0', confidence: 'HIGH', reason: 'Legacy Assassin Base maps to Male Assassin Base' },
  human_assassin: { canonicalId: 'secret_assassin_male_0', confidence: 'HIGH', reason: 'Human Assassin' },
  assassins0: { canonicalId: 'secret_assassin_male_0', confidence: 'HIGH', reason: 'Legacy Assassin S0' },
  assassins1: { canonicalId: 'secret_assassin_male_1', confidence: 'HIGH', reason: 'Legacy Assassin S1' },
  assassins2: { canonicalId: 'secret_assassin_male_2', confidence: 'HIGH', reason: 'Legacy Assassin S2' },
  assassins3: { canonicalId: 'secret_assassin_male_3', confidence: 'HIGH', reason: 'Legacy Assassin S3' },

  // Elves
  elffighter: { canonicalId: 'elven_fighter', confidence: 'HIGH', reason: 'Legacy Elf Fighter' },
  elf_fighter: { canonicalId: 'elven_fighter', confidence: 'HIGH', reason: 'Legacy Elf Fighter' },
  elfmage: { canonicalId: 'elven_mage', confidence: 'HIGH', reason: 'Legacy Elf Mage' },
  elf_mage: { canonicalId: 'elven_mage', confidence: 'HIGH', reason: 'Legacy Elf Mage' },
  elf_deathknight: { canonicalId: 'elf_deathknight_0', confidence: 'HIGH', reason: 'Elf Death Knight Base' },

  // Dark Elves
  darkelffighter: { canonicalId: 'dark_fighter', confidence: 'HIGH', reason: 'Legacy Dark Elf Fighter' },
  darkelf_fighter: { canonicalId: 'dark_fighter', confidence: 'HIGH', reason: 'Legacy Dark Elf Fighter' },
  dark_elf_fighter: { canonicalId: 'dark_fighter', confidence: 'HIGH', reason: 'Legacy Dark Elf Fighter' },
  darkelfmage: { canonicalId: 'dark_mage', confidence: 'HIGH', reason: 'Legacy Dark Elf Mage' },
  darkelf_mage: { canonicalId: 'dark_mage', confidence: 'HIGH', reason: 'Legacy Dark Elf Mage' },
  dark_elf_mage: { canonicalId: 'dark_mage', confidence: 'HIGH', reason: 'Legacy Dark Elf Mage' },
  darkelf_deathknight: { canonicalId: 'delf_deathknight_0', confidence: 'HIGH', reason: 'Dark Elf Death Knight Base' },
  darkelf_assassin: { canonicalId: 'secret_assassin_female_0', confidence: 'HIGH', reason: 'Dark Elf Assassin Female Base' },
  assassinde: { canonicalId: 'secret_assassin_female_0', confidence: 'HIGH', reason: 'Dark Elf Assassin' },
  bloodrosebase: { canonicalId: 'rose_vain_0', confidence: 'HIGH', reason: 'Legacy Blood Rose Base maps to Rose Vain 0' },
  bloodroses0: { canonicalId: 'rose_vain_0', confidence: 'HIGH', reason: 'Legacy Blood Rose S0' },
  bloodroses1: { canonicalId: 'rose_vain_1', confidence: 'HIGH', reason: 'Legacy Blood Rose S1' },
  bloodroses2: { canonicalId: 'rose_vain_2', confidence: 'HIGH', reason: 'Legacy Blood Rose S2' },
  bloodroses3: { canonicalId: 'rose_vain_3', confidence: 'HIGH', reason: 'Legacy Blood Rose S3' },
  bloodrose: { canonicalId: 'rose_vain_3', confidence: 'HIGH', reason: 'Legacy Blood Rose Final' },

  // Orcs
  orcfighter: { canonicalId: 'orc_fighter', confidence: 'HIGH', reason: 'Legacy Orc Fighter' },
  orc_fighter: { canonicalId: 'orc_fighter', confidence: 'EXACT', reason: 'Canonical Orc Fighter' },
  orcmage: { canonicalId: 'orc_mage', confidence: 'HIGH', reason: 'Legacy Orc Mage' },
  orc_mage: { canonicalId: 'orc_mage', confidence: 'EXACT', reason: 'Canonical Orc Mystic' },
  rider: { canonicalId: 'orc_rider_0', confidence: 'HIGH', reason: 'Legacy Rider maps to Orc Rider 0' },
  orcrider: { canonicalId: 'orc_rider_0', confidence: 'HIGH', reason: 'Legacy Orc Rider' },
  orc_rider: { canonicalId: 'orc_rider_0', confidence: 'EXACT', reason: 'Canonical Orc Rider Base' },
  dragoon: { canonicalId: 'orc_rider_1', confidence: 'HIGH', reason: 'Legacy Dragoon maps to Orc Rider 1' },
  vanguardrider: { canonicalId: 'orc_rider_2', confidence: 'HIGH', reason: 'Legacy Vanguard Rider maps to Orc Rider 2' },
  orc_vanguard_rider: { canonicalId: 'orc_rider_2', confidence: 'HIGH', reason: 'Legacy Vanguard Rider' },
  grandvanguard: { canonicalId: 'orc_rider_3', confidence: 'HIGH', reason: 'Legacy Grand Vanguard maps to Orc Rider 3' },

  // Dwarves
  dwarffighter: { canonicalId: 'dwarven_fighter', confidence: 'HIGH', reason: 'Legacy Dwarf Fighter' },
  dwarf_fighter: { canonicalId: 'dwarven_fighter', confidence: 'HIGH', reason: 'Legacy Dwarf Fighter' },
  dwarvenfighter: { canonicalId: 'dwarven_fighter', confidence: 'HIGH', reason: 'Dwarven Fighter' },
  shinemakerbase: { canonicalId: 'shineMakerBase', confidence: 'EXACT', reason: 'Canonical Shine Maker Base' },
  shinemakers1: { canonicalId: 'shineMakerS1', confidence: 'EXACT', reason: 'Canonical Shine Maker S1' },
  shinemakers2: { canonicalId: 'shineMakerS2', confidence: 'EXACT', reason: 'Canonical Shine Maker S2' },
  shinemakers3: { canonicalId: 'shinemaker', confidence: 'HIGH', reason: 'Canonical Shine Maker Final' },

  // Kamael
  kamaelsoldier: { canonicalId: 'jin_kamael_soldier', confidence: 'HIGH', reason: 'Legacy Kamael Soldier' },
  kamael_soldier: { canonicalId: 'jin_kamael_soldier', confidence: 'HIGH', reason: 'Legacy Kamael Soldier' },
  samuraibase: { canonicalId: 'crow_0', confidence: 'HIGH', reason: 'Legacy Samurai Base maps to Crow 0' },
  kamael_samurai: { canonicalId: 'crow_0', confidence: 'HIGH', reason: 'Legacy Kamael Samurai' },
  hatamoto: { canonicalId: 'crow_1', confidence: 'HIGH', reason: 'Legacy Hatamoto maps to Crow 1' },
  ronin: { canonicalId: 'crow_2', confidence: 'HIGH', reason: 'Legacy Ronin maps to Crow 2' },
  samurai: { canonicalId: 'crow_3', confidence: 'HIGH', reason: 'Legacy Samurai maps to Crow 3' },
  soulbreaker: { canonicalId: 'soul_breaker', confidence: 'HIGH', reason: 'Legacy Soul Breaker' },
  soulbreakerkamael: { canonicalId: 'soul_breaker', confidence: 'HIGH', reason: 'Legacy Soul Breaker' },

  // Sylph
  sylphgunner: { canonicalId: 'sylphid', confidence: 'HIGH', reason: 'Legacy Sylph Gunner maps to Sylphid Base' },
  sylph_gunner_base: { canonicalId: 'sylphid', confidence: 'HIGH', reason: 'Legacy Sylph Base' },
  sharpshooter: { canonicalId: 'sylph_gunner', confidence: 'HIGH', reason: 'Legacy Sharpshooter maps to Sylph Gunner Stage 1' },
  windsniper: { canonicalId: 'wind_hunter', confidence: 'HIGH', reason: 'Legacy Wind Sniper maps to Wind Hunter Stage 2' },
  stormblaster: { canonicalId: 'storm_blaster', confidence: 'EXACT', reason: 'Canonical Storm Blaster' },

  // High Elf
  divinetemplarbase: { canonicalId: 'sacred_templar_0', confidence: 'HIGH', reason: 'Legacy Divine Templar Base' },
  divinetemplars1: { canonicalId: 'sacred_templar_1', confidence: 'HIGH', reason: 'Legacy Divine Templar S1' },
  divinetemplars2: { canonicalId: 'sacred_templar_2', confidence: 'HIGH', reason: 'Legacy Divine Templar S2' },
  divinetemplars3: { canonicalId: 'sacred_templar_3', confidence: 'HIGH', reason: 'Legacy Divine Templar S3' },
  elementweaverbase: { canonicalId: 'spirit_0', confidence: 'HIGH', reason: 'Legacy Element Weaver Base' },
  elementweavers1: { canonicalId: 'spirit_1', confidence: 'HIGH', reason: 'Legacy Element Weaver S1' },
  elementweavers2: { canonicalId: 'spirit_2', confidence: 'HIGH', reason: 'Legacy Element Weaver S2' },
  elementweavers3: { canonicalId: 'spirit_3', confidence: 'HIGH', reason: 'Legacy Element Weaver S3' },
  highelfbase: { canonicalId: 'sacred_templar_0', confidence: 'MEDIUM', reason: 'Default High Elf Base' },

  // Ertheia
  marauderbase: { canonicalId: 'marauderBase', confidence: 'EXACT', reason: 'Canonical Marauder Base' },
  sayhamagebase: { canonicalId: 'sayhaMageBase', confidence: 'EXACT', reason: 'Canonical Sayha Mystic Base' }
};

const migrationMap = {};

// Process EXPLICIT_MIGRATIONS
for (const [key, val] of Object.entries(EXPLICIT_MIGRATIONS)) {
  const normKey = key.toLowerCase();
  migrationMap[normKey] = val;
  migrationMap[key] = val;
}

// Process CLASS_ALIASES
for (const [alias, target] of Object.entries(CLASS_ALIASES)) {
  const normAlias = alias.toLowerCase();
  if (migrationMap[normAlias]) continue;

  if (canonicalIds.has(target)) {
    migrationMap[alias] = { canonicalId: target, confidence: 'EXACT', reason: 'Direct canonical alias' };
    migrationMap[normAlias] = { canonicalId: target, confidence: 'EXACT', reason: 'Direct canonical alias' };
    continue;
  }

  const snake = target.replace(/([A-Z])/g, '_$1').toLowerCase();
  if (canonicalIds.has(snake)) {
    migrationMap[alias] = { canonicalId: snake, confidence: 'HIGH', reason: `CamelCase ${target} to snake_case` };
    migrationMap[normAlias] = { canonicalId: snake, confidence: 'HIGH', reason: `CamelCase ${target} to snake_case` };
    continue;
  }

  // Check if target is in EXPLICIT_MIGRATIONS
  const targetLower = target.toLowerCase();
  if (EXPLICIT_MIGRATIONS[targetLower]) {
    migrationMap[alias] = EXPLICIT_MIGRATIONS[targetLower];
    migrationMap[normAlias] = EXPLICIT_MIGRATIONS[targetLower];
  }
}

// Ensure all 159 canonical IDs map to themselves with EXACT confidence
for (const cId of canonicalIds) {
  migrationMap[cId] = { canonicalId: cId, confidence: 'EXACT', reason: 'Already Canonical ID' };
  migrationMap[cId.toLowerCase()] = { canonicalId: cId, confidence: 'EXACT', reason: 'Already Canonical ID' };
}

let fileContent = `/**
 * ClassSaveMigrationMap.js — Static Unambiguous Migration Dictionary
 * 
 * Strict compliance with User Directive 12 & 13:
 * Provides unambiguous mapping: legacyId -> canonicalId, confidence, reason.
 * Total mappings: ${Object.keys(migrationMap).length}
 */

export const CLASS_SAVE_MIGRATION_MAP = Object.freeze({\n`;

for (const [k, v] of Object.entries(migrationMap)) {
  fileContent += `  ${JSON.stringify(k)}: Object.freeze(${JSON.stringify(v)}),\n`;
}

fileContent += `});\n\nexport default CLASS_SAVE_MIGRATION_MAP;\n`;

fs.writeFileSync('lineage-idle/src/services/ClassSaveMigrationMap.js', fileContent, 'utf8');
console.log('Successfully wrote ClassSaveMigrationMap.js with', Object.keys(migrationMap).length, 'entries.');
