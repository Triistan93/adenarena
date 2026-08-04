/**
 * StateManager.js — Gerenciamento centralizado do estado do jogo (State Store).
 *
 * Encapsula o DEFAULT_STATE, persistência via localStorage, deep merge de saves,
 * e notificação de alterações de estado via EventBus.
 */

import EventBus from './EventBus.js';
import { SAVE_KEY, D } from './GameConfig.js';
import { getSelectedSet } from '../services/InventoryService.js';

export const DEFAULT_STATE = () => ({
  race: null, class: null,
  level: 1, xp: 0, sp: 10,
  maxHp: 100, hp: 100, maxMp: 50, mp: 50,
  base: { atk: 0, def: 0, eva: 0, matk: 0, mdef: 0 },
  skills: {},
  quests: { progress: {}, claimed: [], lastDailyReset: 0, lastWeeklyReset: 0 },
  battlePass: { xp: 0, claimedFree: [], claimedPremium: [], unlockedPremium: false },
  tower: { highestFloor: 0, currentFloor: 1, lastSweepTime: 0 },
  zone: 'talkingIsland', currentSaga: 0, gold: 1000, inventory: [],
  equipment: {
    weapon: null, shield: null, helmet: null, armor: null, gloves: null, boots: null,
    hair: null, hair2: null, necklace: null, earring1: null, earring2: null, ring: null, ring2: null,
    belt: null, cloak: null, talisman: null, agathion: null
  },
  codex: {}, dolls: [], synthSelected: [null, null],
  magicLampExp: 0, magicLamps: 0, craftPoints: 0, craftCharges: 0, randomCraftWheel: [],
  subclasses: [], activeSubclassIndex: null, certifications: {}, mainClassData: null,
  craftLevel: 1, craftXp: 0, shopTab: 'gear', selectedSkill: null, filter: 'all',
  craftTab: 'recipes', zoneTab: 'map', soulshotActive: false, combatSpeed: 1,
  totalPlaytime: 0, buffs: {}, _cds: {}, gameMode: 'idle', privilegeLevel: 0,
  autoSellRarity: 'off', craftFoundationPity: 0, warehouse: [], maxWarehouseSlots: 100
});

let currentState = DEFAULT_STATE();

/**
 * Retorna a referência ao estado atual do jogo.
 * @returns {Object}
 */
export function getState() {
  return currentState;
}

/**
 * Atualiza o estado atual com novos dados e dispara o evento 'state:updated'.
 * @param {Object} partialState
 */
export function setState(partialState) {
  Object.assign(currentState, partialState);
  EventBus.emit('state:updated', currentState);
}

/**
 * Salva o estado atual no localStorage.
 * @param {boolean} [manual=false]
 */
export function saveState(manual = false) {
  currentState.lastSaveTime = Date.now();
  const data = {
    ...currentState,
    totalPlaytime: (currentState.totalPlaytime || 0) + (Date.now() - (currentState.startTime || Date.now())),
    selectedUids: Array.from(getSelectedSet(currentState))
  };
  delete data.startTime;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    EventBus.emit('state:saved', { manual, time: currentState.lastSaveTime });
  } catch (err) {
    console.error('[StateManager] Erro ao salvar estado:', err);
  }
}

/**
 * Carrega o estado salvo no localStorage efetuando deep merge.
 * @returns {boolean} Sucesso da leitura
 */
export function loadState() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return false;
  try {
    const data = JSON.parse(raw);
    const def = DEFAULT_STATE();
    const allItems = D()?.ALL_ITEMS;
    const hasItemsDict = allItems && Object.keys(allItems).length > 0;
    const safeInventory = Array.isArray(data.inventory)
      ? data.inventory.filter(item => item && item.itemId && (!hasItemsDict || allItems[item.itemId]))
      : [];

    currentState = { ...def, ...data };
    currentState.skills = { ...def.skills, ...(data.skills || {}) };
    currentState.equipment = { ...def.equipment, ...(data.equipment || {}) };
    currentState.base = { ...def.base, ...(data.base || {}) };
    currentState.inventory = safeInventory;
    currentState.selectedUids = new Set(Array.isArray(data.selectedUids) ? data.selectedUids : []);

    currentState.codex = data.codex && typeof data.codex === 'object' ? data.codex : {};
    currentState.dolls = Array.isArray(data.dolls) ? data.dolls : [];
    currentState.synthSelected = Array.isArray(data.synthSelected) ? data.synthSelected : [null, null];
    currentState.magicLampExp = Number(data.magicLampExp) || 0;
    currentState.magicLamps = Number(data.magicLamps) || 0;
    currentState.craftPoints = Number(data.craftPoints) || 0;
    currentState.craftCharges = Number(data.craftCharges) || 0;
    currentState.randomCraftWheel = Array.isArray(data.randomCraftWheel) ? data.randomCraftWheel : [];
    currentState.craftFoundationPity = Number(data.craftFoundationPity) || 0;
    currentState.warehouse = Array.isArray(data.warehouse)
      ? data.warehouse.filter(item => item && item.itemId && (!hasItemsDict || allItems[item.itemId]))
      : [];
    currentState.maxWarehouseSlots = Number(data.maxWarehouseSlots) || 100;

    currentState.subclasses = Array.isArray(data.subclasses) ? data.subclasses : [];
    currentState.activeSubclassIndex = data.activeSubclassIndex !== undefined ? data.activeSubclassIndex : null;
    currentState.certifications = data.certifications && typeof data.certifications === 'object' ? data.certifications : {};
    currentState.mainClassData = data.mainClassData || null;

    currentState.quests = data.quests && typeof data.quests === 'object' ? data.quests : { progress: {}, claimed: [], lastDailyReset: 0, lastWeeklyReset: 0 };
    currentState.battlePass = data.battlePass && typeof data.battlePass === 'object' ? data.battlePass : { xp: 0, claimedFree: [], claimedPremium: [], unlockedPremium: false };
    currentState.tower = data.tower && typeof data.tower === 'object' ? data.tower : { highestFloor: 0, currentFloor: 1, lastSweepTime: 0 };

    currentState.buffs = data.buffs || {};
    currentState.filter = data.filter || 'all';
    currentState.gameMode = data.gameMode === 'arena' ? 'arena' : 'idle';
    currentState.shopTab = data.shopTab || 'gear';
    currentState.craftTab = data.craftTab || 'recipes';
    currentState.zoneTab = data.zoneTab || 'map';
    currentState.soulshotActive = !!data.soulshotActive;
    currentState.autoPotionActive = !!data.autoPotionActive;
    currentState.combatSpeed = data.combatSpeed === 2 ? 2 : 1;
    currentState.selectedSkill = data.selectedSkill || null;
    currentState.startTime = Date.now();

    EventBus.emit('state:loaded', currentState);
    return true;
  } catch (err) {
    console.error('[StateManager] Erro ao carregar estado:', err);
    return false;
  }
}

/**
 * Reseta o estado para os valores padrão.
 */
export function resetState() {
  localStorage.removeItem(SAVE_KEY);
  currentState = DEFAULT_STATE();
  EventBus.emit('state:reset', currentState);
}
