/**
 * item_class_rules.js — Regras de Tipo de Item e Restrições de Classe
 *
 * Define:
 *  - Inferência de armorType (heavy/light/robe) e weaponType (bow/staff/dagger/melee) por nome
 *  - Quais archetypes de classe podem usar cada tipo
 *  - Função unificada canEquipByType(playerClass, itemDef) para validação
 */

// ─── Mapeamentos de Archetype por Tipo de Armadura ─────────────────────────
export const ARMOR_TYPE_ARCHETYPES = {
  heavy: ['fighter'],
  light: ['rogue', 'archer', 'assassin'],
  robe:  ['mage', 'healer', 'summoner', 'enchanter']
};

export const WEAPON_TYPE_ARCHETYPES = {
  bow:    ['rogue', 'archer', 'assassin'],
  staff:  ['mage', 'healer', 'summoner', 'enchanter'],
  dagger: ['rogue', 'archer', 'assassin'],
  melee:  ['fighter', 'rogue', 'archer', 'assassin'],
  blunt:  ['fighter', 'mage', 'healer'],
  spear:  ['fighter']
};

// ─── Labels de UI por tipo ──────────────────────────────────────────────────
export const ARMOR_TYPE_LABEL = {
  heavy: { icon: '🛡', name: 'Armadura Pesada',  hint: 'Apenas Fighters' },
  light: { icon: '🏹', name: 'Armadura Leve',    hint: 'Rogues / Arqueiros / Assassinos' },
  robe:  { icon: '🧙', name: 'Manto Mágico',     hint: 'Magos / Healers' },
};

export const WEAPON_TYPE_LABEL = {
  bow:    { icon: '🏹', name: 'Arco',           hint: 'Arqueiros / Rogues' },
  staff:  { icon: '🪄', name: 'Cajado',          hint: 'Magos / Healers' },
  dagger: { icon: '🗡', name: 'Adaga',           hint: 'Rogues / Assassinos' },
  melee:  { icon: '⚔',  name: 'Corpo-a-corpo',  hint: 'Fighters / Rogues' },
  blunt:  { icon: '🔨', name: 'Maça / Martelo', hint: 'Fighters / Healers' },
  spear:  { icon: '🔱', name: 'Lança',           hint: 'Fighters' },
};

// ─── Inferência de Tipo por Nome ────────────────────────────────────────────

/**
 * Detecta o tipo de armadura (heavy/light/robe) pelo ID ou nome do item.
 * Retorna null para peças que não têm tipo (capacetes genéricos, etc).
 */
export function getArmorType(itemId = '', itemName = '') {
  const s = `${itemId} ${itemName}`.toLowerCase();
  if (/robe|tunic|arcana|karmian|devotion|dynasti_robe|major_arcana/.test(s)) return 'robe';
  if (/light|leather|manticore|theca|doom_light|avadon_light|blue_wolf_light|dark_crystal_light|majestic_light|nightmare_light|tallum_light|draconic|dynasti_light|lightning_armor/.test(s)) return 'light';
  if (/heavy|plate|brigandine|icy_breast|flame_armor|imperial_crusader|protection_heavy|dynasti_heavy|avadon_heavy|blue_wolf_heavy|dark_crystal_heavy|majestic_heavy|nightmare_heavy|tallum_heavy|bone_breast|bronze_breast/.test(s)) return 'heavy';
  return null;
}

/**
 * Detecta o tipo de arma (bow/staff/dagger/melee/blunt/spear) pelo ID ou nome.
 */
export function getWeaponType(itemId = '', itemName = '') {
  const s = `${itemId} ${itemName}`.toLowerCase();
  if (/bow/.test(s)) return 'bow';
  if (/staff|wand|scepter|magicblunt|magic_sword|crucifix/.test(s)) return 'staff';
  if (/mace|hammer|blunt/.test(s)) return 'blunt';
  if (/dagger/.test(s)) return 'dagger';
  if (/spear|lance|pike/.test(s)) return 'spear';
  if (/sword|axe|blade|katana|longsword|rapier|dual/.test(s)) return 'melee';
  return null;
}

// ─── Mapa de Archetype por Classe ──────────────────────────────────────────
const ARCHETYPE_ALIASES = {
  // Fighters
  fighter: 'fighter', warrior: 'fighter', knight: 'fighter', paladin: 'fighter',
  gladiator: 'fighter', titan: 'fighter', warlord: 'fighter', destroyer: 'fighter',
  tyrant: 'fighter', berserker: 'fighter', shillien_knight: 'fighter',
  phoenix_knight: 'fighter', temple_knight: 'fighter', hell_knight: 'fighter',
  // Rogues / Archers / Assassins — all map to 'rogue' group
  rogue: 'rogue', archer: 'rogue', assassin: 'rogue', dagger: 'rogue',
  hawkeye: 'rogue', sagittarius: 'rogue', ghost_hunter: 'rogue',
  adventurer: 'rogue', wind_rider: 'rogue', ghost_sentinel: 'rogue',
  treasure_hunter: 'rogue', plain_walker: 'rogue',
  // Mages
  mage: 'mage', wizard: 'mage', sorcerer: 'mage', necromancer: 'mage',
  spellhowler: 'mage', mystic: 'mage', storm_screamer: 'mage', archmage: 'mage',
  // Healers
  healer: 'healer', bishop: 'healer', elder: 'healer', prophet: 'healer',
  shillien_elder: 'healer', cardinal: 'healer', eva_saint: 'healer',
  // Summoners / Enchanters
  summoner: 'summoner', enchanter: 'healer', warlock: 'summoner',
  elemental_master: 'summoner', phantom_summoner: 'summoner',
  overlord: 'healer', dominator: 'healer',
};

const ARCHETYPE_GROUPS = {
  fighter:  ['fighter'],
  rogue:    ['rogue', 'archer', 'assassin'],
  archer:   ['rogue', 'archer', 'assassin'],
  assassin: ['rogue', 'archer', 'assassin'],
  dagger:   ['rogue', 'archer', 'assassin'],
  mage:     ['mage', 'healer', 'summoner', 'enchanter'],
  healer:   ['mage', 'healer', 'summoner', 'enchanter'],
  summoner: ['mage', 'healer', 'summoner', 'enchanter'],
};

/**
 * Retorna os tags de archetype do jogador, navegando a árvore de classes.
 * Retorna null se não conseguir determinar (modo permissivo: pode equipar tudo).
 * @param {string} playerClassId
 * @returns {string[]|null}
 */
export function getPlayerArchetypes(playerClassId) {
  if (!playerClassId) return null; // sem classe = permissivo
  const classes = (typeof window !== 'undefined')
    ? (window.EchoData?.CLASSES_ECHO || window.GameData?.CLASSES || {})
    : {};

  let current = playerClassId;
  const visited = new Set();
  while (current && !visited.has(current)) {
    visited.add(current);
    const def = classes[current];
    if (!def) break;
    const arch = def.archetype || def.skillTree;
    if (arch) {
      const base = ARCHETYPE_ALIASES[arch.toLowerCase()];
      if (base) return ARCHETYPE_GROUPS[base] || [base];
    }
    current = def.parent;
  }
  // Fallback pelo ID da própria classe
  const base = ARCHETYPE_ALIASES[playerClassId.toLowerCase()];
  if (base) return ARCHETYPE_GROUPS[base] || [base];
  return null; // desconhecido = permissivo (pode equipar)
}

// ─── Validação Unificada ─────────────────────────────────────────────────────

/**
 * Verifica se o jogador pode equipar um item considerando:
 *  1. classReq explícito
 *  2. armorType (heavy/light/robe) vs archetype
 *  3. weaponType (bow/staff/dagger/etc.) vs archetype
 *
 * @param {string} playerClassId
 * @param {Object} itemDef
 * @param {Function} [classSatisfiesFn]
 * @returns {{ ok: boolean, reason: string|null }}
 */
export function canEquipByType(playerClassId, itemDef, classSatisfiesFn) {
  if (!itemDef) return { ok: true, reason: null };

  // 1. Requisito de classe explícito
  if (itemDef.classReq) {
    const ok = classSatisfiesFn ? classSatisfiesFn(playerClassId, itemDef.classReq) : true;
    if (!ok) return { ok: false, reason: `Requer classe: ${itemDef.classReq}` };
  }

  const slot = (itemDef.slot || '').toLowerCase();
  const archetypes = getPlayerArchetypes(playerClassId);

  // Se archetypes é null = classe desconhecida = modo permissivo, pode equipar tudo
  if (!archetypes) return { ok: true, reason: null };

  // 2. Armaduras
  if (['armor', 'helmet', 'boots', 'gloves', 'legs'].includes(slot)) {
    const armorType = getArmorType(itemDef.id || '', itemDef.name || '');
    if (armorType) {
      const allowed = ARMOR_TYPE_ARCHETYPES[armorType] || [];
      const ok = archetypes.some(a => allowed.includes(a));
      if (!ok) {
        const lbl = ARMOR_TYPE_LABEL[armorType];
        return { ok: false, reason: `${lbl?.icon || ''} ${lbl?.name || armorType} · ${lbl?.hint || 'Classe incompatível'}` };
      }
    }
  }

  // 3. Armas
  if (slot === 'weapon') {
    const weaponType = getWeaponType(itemDef.id || '', itemDef.name || '');
    if (weaponType) {
      const allowed = WEAPON_TYPE_ARCHETYPES[weaponType] || [];
      const ok = archetypes.some(a => allowed.includes(a));
      if (!ok) {
        const lbl = WEAPON_TYPE_LABEL[weaponType];
        return { ok: false, reason: `${lbl?.icon || ''} ${lbl?.name || weaponType} · ${lbl?.hint || 'Classe incompatível'}` };
      }
    }
  }

  return { ok: true, reason: null };
}
