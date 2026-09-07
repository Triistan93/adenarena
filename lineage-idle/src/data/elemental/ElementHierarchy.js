/**
 * ElementHierarchy.js — Game Data Contract 3.2: Elemental Taxonomy and Hierarchy
 * 
 * Canonical source of truth for element classifications, variants, wildcard expansions,
 * and element tag validation rules for Lineage Idle / Aden Arena.
 */

export const CONTRACT_VERSION = '3.2.1';
export const EXPECTED_ACTIVE_CLASSES = 25;
export const EXPECTED_ACTIVE_SKILL_SLOTS = 100;
export const EXPECTED_HISTORICAL_CLASSES = 73;
export const EXPECTED_CANONICAL_CLASSES = 98;
export const EXPECTED_LINEAGE_RELATIONS = 72;

export const BASE_ELEMENTS = ['Fire', 'Water', 'Wind', 'Earth', 'Holy', 'Dark'];
export const PHYSICAL_ELEMENT = 'Physical';
export const MAGIC_WILDCARD = '*magic*';

export const ELEMENT_HIERARCHY = {
  Fire: ['Magma', 'Ember'],
  Water: ['Ice', 'Tide'],
  Wind: ['Lightning', 'Gale'],
  Earth: ['Metal', 'Crystal', 'Nature', 'Poison'],
  Holy: ['Light', 'Radiance'],
  Dark: ['Shadow', 'Blood', 'Void']
};

// Flat array of all canonical elements and variants
export const ALL_ELEMENTS = [
  PHYSICAL_ELEMENT,
  ...BASE_ELEMENTS,
  ...Object.values(ELEMENT_HIERARCHY).flat()
];

/**
 * Resolves any element or variant tag to its canonical base element.
 * If the tag is 'Physical' or an unknown tag, returns the tag as-is.
 * @param {string} tag
 * @returns {string}
 */
export function resolveBaseElement(tag) {
  if (!tag) return tag;
  if (BASE_ELEMENTS.includes(tag) || tag === PHYSICAL_ELEMENT) return tag;
  for (const [base, variants] of Object.entries(ELEMENT_HIERARCHY)) {
    if (variants.includes(tag)) return base;
  }
  return tag;
}

/**
 * Checks if a specific tag is a direct variant of a base element.
 * @param {string} variant
 * @param {string} base
 * @returns {boolean}
 */
export function isVariantOf(variant, base) {
  if (!ELEMENT_HIERARCHY[base]) return false;
  return ELEMENT_HIERARCHY[base].includes(variant);
}

/**
 * Expands an element or wildcard into the full list of compatible elemental tags.
 * Note: '*magic*' expands to all 6 base elements and their variants. It NEVER includes Physical.
 * @param {string} element
 * @returns {string[]}
 */
export function expandElement(element) {
  if (element === MAGIC_WILDCARD) {
    const magicSet = [];
    for (const base of BASE_ELEMENTS) {
      magicSet.push(base);
      magicSet.push(...(ELEMENT_HIERARCHY[base] || []));
    }
    return magicSet;
  }
  if (ELEMENT_HIERARCHY[element]) {
    return [element, ...ELEMENT_HIERARCHY[element]];
  }
  return [element];
}

/**
 * Validates whether a skill's required elements are fully compatible with an allowed element set.
 * SECTION 13 RULE: Uses strict .every() semantics (ALL TAGS rule).
 * A skill is valid if and only if EVERY required element or variant tag resolves to or matches
 * an allowed element.
 * 
 * @param {string[]} requiredElements - Elements required by the skill
 * @param {string[]} allowedElements - Elements permitted by the class
 * @returns {boolean}
 */
export function validateElementalTags(requiredElements, allowedElements) {
  if (!Array.isArray(requiredElements) || requiredElements.length === 0) return true;
  if (!Array.isArray(allowedElements) || allowedElements.length === 0) return false;

  // Build the expanded set of allowed elemental keys (both direct tags and base elements)
  const expandedAllowed = new Set();
  for (const elem of allowedElements) {
    if (elem === MAGIC_WILDCARD) {
      expandElement(MAGIC_WILDCARD).forEach(t => expandedAllowed.add(t));
    } else {
      expandedAllowed.add(elem);
      expandedAllowed.add(resolveBaseElement(elem));
      if (ELEMENT_HIERARCHY[elem]) {
        ELEMENT_HIERARCHY[elem].forEach(v => expandedAllowed.add(v));
      }
    }
  }

  // ALL TAGS validation: every required tag must be satisfied
  return requiredElements.every(req => {
    return expandedAllowed.has(req) || expandedAllowed.has(resolveBaseElement(req));
  });
}
