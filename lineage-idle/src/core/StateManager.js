/**
 * StateManager.js — Gerenciamento centralizado do estado do jogo (State Store).
 *
 * Encapsula o DEFAULT_STATE, persistência via localStorage, deep merge de saves,
 * e notificação de alterações de estado via EventBus.
 */

import EventBus from './EventBus.js';
import { SAVE_KEY, D } from './GameConfig.js';
import { getSelectedSet } from '../services/InventoryService.js';
import { generateStateChecksum, validateStateIntegrity, sanitizeGameState } from '../engine/SecurityEngine.js';

export const DEFAULT_STATE = () => ({
  race: null, class: null, gender: 'M',
  charName: 'Tristan', heroName: 'Tristan', playerName: 'Tristan', name: 'Tristan',
  level: 1, xp: 0, sp: 10,
  maxHp: 100, hp: 100, maxMp: 50, mp: 50,
  base: { atk: 0, def: 0, eva: 0, matk: 0, mdef: 0 },
  skills: {},
  quests: { progress: {}, claimed: [], lastDailyReset: 0, lastWeeklyReset: 0 },
  battlePass: { xp: 0, claimedFree: [], claimedPremium: [], unlockedPremium: false },
  dailyRewards: { currentDay: 1, claimedDays: [], lastClaimDate: '', streak: 0, totalClaims: 0 },
  tower: { highestFloor: 0, currentFloor: 1, lastSweepTime: 0 },
  zone: 'talkingIsland', currentSaga: 0, gold: 2000, inventory: [],
  equipment: {
    weapon: null, shield: null, helmet: null, armor: null, gloves: null, boots: null,
    hair: null, hair2: null, necklace: null, earring1: null, earring2: null, ring: null, ring2: null,
    belt: null, cloak: null, talisman: null, agathion: null
  },
  codex: {}, dolls: [], synthSelected: [null, null],
  magicLampExp: 0, magicLamps: 0, craftPoints: 0, craftCharges: 0, randomCraftWheel: [],
  subclasses: [], activeSubclassIndex: null, certifications: {}, mainClassData: null,
  craftLevel: 1, craftXp: 0, shopTab: 'gear', selectedSkill: null, filter: 'all',
  craftTab: 'recipes', zoneTab: 'map', soulshotActive: false, isCombatActive: true, combatSpeed: 1,
  totalPlaytime: 0, buffs: {}, _cds: {}, gameMode: 'idle', privilegeLevel: 0,
  autoSellRarity: 'off',
  autoRecycle: {
    enabled: false,
    mode: 'sell',           // 'sell' (Adena) ou 'dismantle' (Cristais & Insumos)
    maxRarity: 'common',    // 'common', 'uncommon', 'rare'
    grades: {
      ng: true,             // No-Grade
      d: false,             // D-Grade
      c: false,             // C-Grade
      b: false,             // B-Grade
      a: false,             // Sempre false (protegido)
      s: false              // Sempre false (protegido)
    }
  },
  craftFoundationPity: 0, warehouse: [], maxWarehouseSlots: 100,
  essences: { fire: 0, earth: 0, wind: 0, astral: 0 }, activeElixirs: {},
  prestigeLevel: 0, astralShards: 0, astralMastery: {},
  expeditions: [], castles: {}, manorSeeds: {}, manorCrops: {},
  soulCrystals: {}, weaponSockets: {}, tattoos: [],
  fateWhisperQuest: false, masterAbilities: [], activeTransformation: null,
  serverRates: {
    xp: 1,
    sp: 1,
    adena: 1,
    drop: 1,
    spoil: 1,
    enchant: 1,
    book: 1
  },
  serverSeason: 1,   // Stage/Crônica ativa — controlada pelo Admin Panel
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
 * Salva o estado atual no localStorage com Checksum de integridade e Backup de segurança.
 * @param {boolean} [manual=false]
 */
export function saveState(manual = false) {
  currentState.lastSaveTime = Date.now();
  sanitizeGameState(currentState);

  const data = {
    ...currentState,
    totalPlaytime: (currentState.totalPlaytime || 0) + (Date.now() - (currentState.startTime || Date.now())),
    selectedUids: Array.from(getSelectedSet(currentState))
  };
  delete data.startTime;

  // Assina os dados vitais com Checksum anti-tamper
  data._chk = generateStateChecksum(data);

  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(SAVE_KEY, serialized);
    // Grava também no slot de backup de segurança
    localStorage.setItem(`${SAVE_KEY}_backup`, serialized);

    EventBus.emit('state:saved', { manual, time: currentState.lastSaveTime });
  } catch (err) {
    console.error('[StateManager] Erro ao salvar estado:', err);
  }
}

/**
 * Carrega o estado salvo no localStorage com validação de integridade e auto-recuperação de backup.
 * @returns {boolean} Sucesso da leitura
 */
export function loadState() {
  let raw = localStorage.getItem(SAVE_KEY);
  let isBackupRestore = false;

  if (!raw) {
    // Tenta carregar do backup se o primário estiver ausente
    raw = localStorage.getItem(`${SAVE_KEY}_backup`);
    if (!raw) return false;
    isBackupRestore = true;
  }

  try {
    let data = JSON.parse(raw);

    // Valida integridade e sanidade dos dados
    const check = validateStateIntegrity(data);
    if (!check.valid) {
      console.warn('[StateManager] Verificação de integridade:', check.reason);
      // Se os dados numéricos fundamentais existirem e forem válidos, preserva o save e atualiza o checksum
      if (typeof data.level === 'number' && data.level >= 1 && typeof data.gold === 'number') {
        data._chk = generateStateChecksum(data);
        console.log('[StateManager] Checksum de segurança sincronizado com os dados atuais.');
      } else {
        const backupRaw = localStorage.getItem(`${SAVE_KEY}_backup`);
        if (backupRaw && backupRaw !== raw) {
          try {
            const backupData = JSON.parse(backupRaw);
            if (validateStateIntegrity(backupData).valid) {
              console.log('[StateManager] Restaurado com sucesso a partir do backup seguro.');
              data = backupData;
              isBackupRestore = true;
            }
          } catch (bErr) {
            console.error('[StateManager] Backup também corrompido:', bErr);
          }
        }
      }
    }

    const def = DEFAULT_STATE();
    const allItems = D()?.ALL_ITEMS;
    const hasItemsDict = allItems && Object.keys(allItems).length > 0;
    const safeInventory = Array.isArray(data.inventory)
      ? data.inventory.filter(item => item && item.itemId && (!hasItemsDict || allItems[item.itemId]))
      : [];

    currentState = { ...def, ...data };
    sanitizeGameState(currentState);

    currentState.privilegeLevel = Number(data.privilegeLevel) || (data.role === 'admin' ? 1 : 0) || 0;
    currentState.gender = data.gender || data.charGender || data.sex || def.gender || 'M';
    currentState.charName = data.charName || data.heroName || data.playerName || data.name || def.charName || 'Tristan';
    currentState.heroName = currentState.charName;
    currentState.playerName = currentState.charName;
    currentState.name = currentState.charName;
    if (currentState.hp <= 0) {
      currentState.hp = currentState.maxHp || 100;
    }
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
    currentState.dailyRewards = data.dailyRewards && typeof data.dailyRewards === 'object' ? data.dailyRewards : { currentDay: 1, claimedDays: [], lastClaimDate: '', streak: 0, totalClaims: 0 };
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

    if (isBackupRestore) {
      saveState(false);
    }

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
  localStorage.removeItem(`${SAVE_KEY}_backup`);
  currentState = DEFAULT_STATE();
  EventBus.emit('state:reset', currentState);
}
