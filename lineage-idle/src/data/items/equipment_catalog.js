/**
 * Normalized catalog families for weapon, shield, and sigil inventory.
 * This metadata is separate from `weaponType`, which remains the runtime
 * combat/mastery family used by the battle systems.
 */

export const EQUIPMENT_CATALOG_TYPE_LABELS = Object.freeze({
  sword: 'Sword',
  magic_sword: 'Magic Sword',
  dagger: 'Dagger',
  blunt: 'Blunt',
  magic_blunt: 'Magic Blunt',
  rapier: 'Rapier',
  two_hand_spear: 'Two Handed Spear',
  two_hand_blunt: 'Two Handed Blunt',
  two_hand_hammer: 'Two Handed Hammer',
  two_hand_staff: 'Two Handed Staff',
  two_hand_sword: 'Two Handed Sword',
  staff: 'Staff',
  bow: 'Bow',
  fist: 'Fist',
  shield: 'Shield',
  sigil: 'Sigil',
  ancient_sword: 'Ancient Sword',
  dual_sword: 'Dual Sword',
  pistol: 'Pistol / Shooter',
  other_weapon: 'Other Weapon'
});

export const EQUIPMENT_CATALOG_MINIMUM_PER_TYPE = 3;

function searchableItemText(item = {}) {
  return `${item.id || ''} ${item.name || ''}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_-]+/g, ' ');
}

/**
 * Resolve the display/catalog family without changing the combat-facing
 * `weaponType` contract consumed by skills, mastery, and damage calculations.
 */
export function getEquipmentCatalogType(item = {}) {
  const slot = String(item.slot || '').toLowerCase();
  if (slot === 'shield') return 'shield';
  if (slot === 'sigil') return 'sigil';
  if (slot !== 'weapon') return null;

  const text = searchableItemText(item);
  if (/ancientsword|ancient sword/.test(text)) return 'ancient_sword';
  if (/pistol|pistols|shooter/.test(text)) return 'pistol';
  if (/rapier/.test(text)) return 'rapier';
  if (/magic\s*sword|magic_sword/.test(text)) return 'magic_sword';
  if (/dual\s*(sword|swords)|duals|espadas duplas/.test(text)) return 'dual_sword';
  if (/dual\s*dagger|dual_dagger/.test(text)) return 'dagger';
  if (/dualfist|dualfirst|dual\s*fist|fist weapon|fists? of|fists?\b/.test(text)) return 'fist';
  if (/infinity cleaver/.test(text)) return 'two_hand_sword';
  if (/two\s*hand(?:ed)?\s*(?:sword|blade)|twohand(?:ed)?\s*(?:sword|blade)|great sword|dragon slayer|gorgon twohand/.test(text)) return 'two_hand_sword';
  if (/two\s*hand(?:ed)?\s*hammer|twohand(?:ed)?\s*hammer|warhammer|big hammer|titan hammer|dynasty hammer/.test(text)) return 'two_hand_hammer';
  if (/two\s*hand(?:ed)?\s*blunt|twohand(?:ed)?\s*blunt/.test(text)) return 'two_hand_blunt';
  if (/two\s*hand(?:ed)?\s*(?:staff|magic blunt)|twohand(?:ed)?\s*(?:staff|magic blunt)|twohandstaff|twohand staff|frost lord staff|primordial staff|infinity rod|dragon.*staff/.test(text)) return 'two_hand_staff';
  if (/magic\s*blunt|magicblunt|magic blunt weapon/.test(text)) return 'magic_blunt';
  if (/great axe|orcish blood axe|frost lord axe|primordial axe|infinity axe|dragon.*axe/.test(text)) return 'two_hand_blunt';
  if (/spear|halberd|halbard|lancia|polearm|pike|glaive|trident|lance/.test(text)) return 'two_hand_spear';
  if (/bow|crossbow/.test(text)) return 'bow';
  if (/tear of darkness/.test(text)) return 'sword';
  if (/dagger|angel slayer/.test(text)) return 'dagger';
  if (/staff|wand|scepter|rod|spellbook|crucifix/.test(text)) return 'staff';
  if (/hammer|mace|axe|club|blunt|tomahawk|cleaver/.test(text)) return 'blunt';
  if (/sword|blade|katana|falchion/.test(text)) return 'sword';
  return 'other_weapon';
}

/** Attach a normalized catalog family to all entries while preserving aliases. */
export function annotateEquipmentCatalogItem(item) {
  if (!item || typeof item !== 'object') return item;
  const catalogType = getEquipmentCatalogType(item);
  return catalogType ? { ...item, catalogType } : item;
}

/**
 * Group definitions by normalized family, deduplicating legacy aliases by
 * canonical item ID. Groups include equipment in every grade.
 */
export function buildEquipmentCatalog(allItems = {}) {
  const groups = Object.fromEntries(
    Object.keys(EQUIPMENT_CATALOG_TYPE_LABELS).map(type => [type, new Map()])
  );

  for (const item of Object.values(allItems)) {
    if (!item || !item.catalogType || !groups[item.catalogType]) continue;
    const id = item.id || item.itemId;
    if (!id || groups[item.catalogType].has(id)) continue;
    groups[item.catalogType].set(id, item);
  }

  const catalog = {};
  const coverage = {};
  for (const [type, byId] of Object.entries(groups)) {
    const items = [...byId.values()].sort((a, b) => {
      const tierDiff = (Number(a.tier) || 0) - (Number(b.tier) || 0);
      return tierDiff || String(a.name || '').localeCompare(String(b.name || ''));
    });
    catalog[type] = items;
    coverage[type] = {
      label: EQUIPMENT_CATALOG_TYPE_LABELS[type],
      count: items.length,
      minimum: EQUIPMENT_CATALOG_MINIMUM_PER_TYPE,
      meetsMinimum: items.length >= EQUIPMENT_CATALOG_MINIMUM_PER_TYPE
    };
  }

  return { catalog, coverage };
}
