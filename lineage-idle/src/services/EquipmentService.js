/**
 * EquipmentService.js — Gestão de Equipamentos e Encantamento do Lineage Idle.
 *
 * Responsável por resolver slots de equipamento (anéis, brincos, escudos),
 * equipar/desequipar itens, auto-equipar melhor item e sistema de enchant.
 */

import { D, ALL_EQUIP_SLOTS } from '../core/GameConfig.js';
import { getStats } from '../engine/StatsEngine.js';
const warnedMissingSlots = new Set();

function inventoryRoot() {
  return document.getElementById('idle-host')?.shadowRoot || document;
}

const EQUIPMENT_SLOT_ALIASES = {
  weapon: ['weapon'],
  armor: ['armor', 'chest', 'body'],
  helmet: ['helmet', 'head'],
  gloves: ['gloves', 'hands'],
  boots: ['boots', 'feet'],
  shield: ['shield', 'offhand', 'sigil'],
  legs: ['legs', 'pants', 'gaiters'],
  ring: ['ring', 'ring1'],
  ring2: ['ring2'],
  earring: ['earring', 'earring1'],
  earring1: ['earring1', 'earring'],
  earring2: ['earring2'],
  necklace: ['necklace', 'neck'],
  cape: ['cape', 'cloak'],
  cloak: ['cloak', 'cape'],
  belt: ['belt'],
  hair: ['hair', 'headgear'],
  hair2: ['hair2', 'mask'],
  agathion: ['agathion']
};

/**
 * Localiza um slot independentemente do padrão de ID usado pelo template.
 */
function findEquipmentSlotElement(slot) {
  const root = inventoryRoot();
  const aliases = EQUIPMENT_SLOT_ALIASES[slot] || [slot];

  for (const alias of aliases) {
    const selectors = [
      `#equip-slot-${alias}`,
      `#equipment-slot-${alias}`,
      `#equip-${alias}`,
      `#eq-${alias}`,
      `.equip-slot-${alias}`,
      `.equip-slot[data-slot="${alias}"]`,
      `.equip-slot[data-equip-slot="${alias}"]`,
      `[data-equip-slot="${alias}"]`,
      `[data-equipment-slot="${alias}"]`
    ];

    for (const selector of selectors) {
      const element = root.querySelector(selector);

      if (element) {
        return element;
      }
    }
  }

  return null;
}

function escapeHTML(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

/**
 * Aceita getItemIcon retornando:
 * - HTML de <img>
 * - URL/caminho para imagem
 * - emoji
 */
function renderItemIcon(item, def) {
  let icon = '';

  try {
    icon = getItemIcon(item, def) || '';
  } catch (error) {
    console.warn('[InventoryUI] Erro em getItemIcon:', item?.itemId, error);
  }

  if (icon instanceof HTMLElement) {
    return icon.outerHTML;
  }

  const value = String(icon).trim();

  if (!value) {
    return '<span class="item-icon-fallback">📦</span>';
  }

  // getItemIcon já retornou HTML.
  if (value.startsWith('<')) {
    return value;
  }

  // getItemIcon retornou caminho/URL.
  const isImagePath =
    /^(?:https?:|data:image|blob:|\/|\.{1,2}\/|img\/)/i.test(value) ||
    /\.(?:png|webp|jpe?g|gif|svg)(?:\?.*)?$/i.test(value);

  if (isImagePath) {
    return `
      <img
        class="inventory-item-image"
        src="${escapeHTML(value)}"
        alt="${escapeHTML(def?.name || item?.itemId || 'Item')}"
        draggable="false"
        loading="lazy"
      >
    `;
  }

  // Emoji ou texto curto.
  return `
    <span class="inventory-item-emoji">
      ${escapeHTML(value)}
    </span>
  `;
}

function isItemEquippable(def, state) {
  if (!def?.slot) return false;

  const targetSlot = resolveEquipSlot(
    def.slot,
    state?.equipment || {}
  );

  return ALL_EQUIP_SLOTS.includes(targetSlot);
}

function isItemUsable(def) {
  const type = String(
    def?.type ??
    def?.category ??
    def?.slot ??
    ''
  ).toLowerCase();

  return [
    'consumable',
    'potion',
    'scroll',
    'powerup',
    'food'
  ].includes(type);
}
/**
 * Mapeia o slot do item (ou apelido) para o slot real da armadura.
 * @param {string} slot
 * @param {Object} [equipmentState] — Estado atual dos equipamentos para desempate de aneis/brincos
 * @returns {string}
 */
/**
 * Resolve o slot real de equipamento, respeitando os slots disponíveis
 * em ALL_EQUIP_SLOTS e compatibilidade com saves antigos.
 *
 * @param {string} rawSlot
 * @param {Object} equipmentState
 * @returns {string}
 */
export function resolveEquipSlot(rawSlot, equipmentState = {}) {
  const slot = String(rawSlot || '')
    .trim()
    .toLowerCase();

  function firstAvailable(...candidates) {
    return candidates.find(candidate =>
      ALL_EQUIP_SLOTS.includes(candidate)
    ) || candidates[0];
  }

  function firstEmpty(...candidates) {
    const validSlots = candidates.filter(candidate =>
      ALL_EQUIP_SLOTS.includes(candidate)
    );

    return (
      validSlots.find(candidate => !equipmentState?.[candidate]) ||
      validSlots[0] ||
      candidates[0]
    );
  }

  switch (slot) {
    case 'weapon':
    case 'sword':
    case 'bow':
    case 'dagger':
    case 'blunt':
    case 'staff':
      return firstAvailable('weapon');

    case 'armor':
    case 'chest':
    case 'body':
    case 'breastplate':
    case 'robe':
      return firstAvailable('armor', 'chest');

    case 'helmet':
    case 'helm':
      return firstAvailable('helmet', 'head');

    case 'glove':
    case 'gloves':
    case 'hands':
      return firstAvailable('gloves', 'hands');

    case 'boot':
    case 'boots':
    case 'feet':
      return firstAvailable('boots', 'feet');

    case 'shield':
    case 'offhand':
    case 'sigil':
      return firstAvailable('shield', 'offhand');

    case 'legs':
    case 'gaiters':
    case 'pants':
      return firstAvailable('legs', 'pants');

    case 'cape':
    case 'cloak':
      return firstAvailable('cape', 'cloak');

    case 'belt':
      return firstAvailable('belt');

    case 'necklace':
    case 'neck':
      return firstAvailable('necklace', 'neck');

    case 'earring':
    case 'earring1':
    case 'earring2':
      return firstEmpty('earring1', 'earring2', 'earring');

    case 'ring':
    case 'ring1':
    case 'ring2':
      return firstEmpty('ring', 'ring2', 'ring1');

    case 'hair':
    case 'headgear':
      return firstAvailable('hair');

    case 'hair2':
    case 'mask':
      return firstAvailable('hair2');

    case 'agathion':
      return firstAvailable('agathion');

    default:
      return slot;
  }
}

/**
 * Equipa um item do inventário.
 * @param {Object} state — Estado mutável do jogo
 * @param {string} uid — UID do item na mochila
 * @param {Object} [callbacks] — { log, updateAllUI, save, classSatisfies, getClass }
 */
export function equipItem(state, uid, callbacks = {}) {
  const item = state.inventory.find(i => i.uid === uid);
  if (!item) return;
  const gData = D();
  const def = gData?.ALL_ITEMS?.[item.itemId];
  if (!def) return;

  const targetSlot = resolveEquipSlot(def.slot, state.equipment);
  if (!ALL_EQUIP_SLOTS.includes(targetSlot)) {
    if (callbacks.log) callbacks.log(`${def.name} não pode ser equipado.`, 'system');
    return;
  }
  if (def.req && def.req.level > state.level) {
    if (callbacks.log) callbacks.log(`Nível ${def.req.level} necessário para equipar ${def.name}`, 'system');
    return;
  }
  if (def.classReq && callbacks.classSatisfies && !callbacks.classSatisfies(state.class, def.classReq)) {
    const reqClassName = callbacks.getClass ? callbacks.getClass(def.classReq)?.name : def.classReq;
    if (callbacks.log) callbacks.log(`${def.name} exige a classe: ${reqClassName}`, 'system');
    return;
  }

  const currentUid = state.equipment[targetSlot];
  if (currentUid) {
    const current = state.inventory.find(i => i.uid === currentUid);
    if (current) current.equipped = false;
  }
  state.equipment[targetSlot] = uid;
  item.equipped = true;

  if (callbacks.log) callbacks.log(`Equipou ${def.name}`, 'loot');

  const stats = getStats(state);
  state.maxHp = stats.maxHp;
  state.maxMp = stats.maxMp;
  state.hp = Math.min(state.hp, state.maxHp);
  state.mp = Math.min(state.mp, state.maxMp);

  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save();
}

/**
 * Desequipa um item de um slot específico.
 * @param {Object} state
 * @param {string} slot
 * @param {Object} [callbacks]
 */
export function unequipItem(state, slot, callbacks = {}) {
  const uid = state.equipment[slot];
  if (!uid) return;
  const item = state.inventory.find(i => i.uid === uid);
  if (item) item.equipped = false;
  state.equipment[slot] = null;

  const stats = getStats(state);
  state.maxHp = stats.maxHp;
  state.maxMp = stats.maxMp;
  state.hp = Math.min(state.hp, state.maxHp);
  state.mp = Math.min(state.mp, state.maxMp);

  const gData = D();
  const itemName = gData?.ALL_ITEMS?.[item ? item.itemId : '']?.name || slot;
  if (callbacks.log) callbacks.log(`Unequipped ${itemName}`, 'system');

  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save();
}
// No final do arquivo, adicione:
export { equipItem as equipItemToSlot };
