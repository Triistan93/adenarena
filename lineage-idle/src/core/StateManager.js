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
import { getStarterSkillsForClass, normalizeAndValidateSkills } from '../services/SkillEligibility.js';

export const DEFAULT_STATE = () => ({
  characterId: null,
  accountId: null,
  ownerUid: null,
  createdAt: 0,
  entityType: 'player',
  playerType: 'real',
  isDiscoverable: true,
  friends: [], // Gate 10: Cache local de UI; a fonte canônica é a coleção 'friends' do Firestore
  blocked: [],
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
  zone: 'talkingIsland', currentSaga: 0, gold: 2000, adenCoins: 0, dailyRaidTickets: 3, inventory: [],
  equipment: {
    weapon: null, weapon2: null, shield: null,
    helmet: null, chest: null, gloves: null, legs: null, boots: null,
    cloak: null, belt: null, necklace: null,
    earring1: null, earring2: null, ring1: null, ring2: null,
    hair1: null, hair2: null,
    brooch: null, agathion_bracelet: null, talisman_bracelet: null
  },
  cosmetics: {
    unlockedAuras: ['aura_none'],
    activeAura: 'aura_none',
    unlockedFrames: ['frame_default'],
    activeFrame: 'frame_default',
    unlockedTitles: ['title_none'],
    activeTitle: 'title_none'
  },
  achievements: { claimed: [] },
  petData: { activePetId: null, pets: {}, lastFeedTime: 0 },
  codex: {}, dolls: [], synthSelected: [null, null],
  magicLampExp: 0, magicLamps: 0,
  randomCraft: { points: 0, charge: 0, slots: [], history: [] },
  craftPoints: 0, craftCharges: 0, randomCraftWheel: [],
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
  essences: { fire: 0, earth: 0, wind: 0, water: 0 }, activeElixirs: {},
  prestigeLevel: 0, astralShards: 0, astralMastery: {},
  clan: {
    name: null,         // sem clã ao nascer — jogador cria/nomeia no Lv 20
    level: 0,           // contribuição de clan no CP é zero até o clan existir
    reputation: 0,
    castles: [],
    lastTaxTimestamp: 0,
    accumulatedTaxes: {}
  },
  olympiad: {
    points: 0,
    wins: 0,
    losses: 0,
    tokens: 0,
    matchesToday: 0,
    isHero: false,
    heroTitle: null,
    heroWeapon: null
  },
  noblesse: {
    isNoblesse: false,
    step: 0,
    tiaraClaimed: false,
    bossKills: {}
  },
  sevenSigns: {
    faction: null,
    playerScore: 0,
    dawnScore: 250000,
    duskScore: 240000,
    ancientAdena: 0,
    stonesDeposited: { seal_stone_blue: 0, seal_stone_green: 0, seal_stone_red: 0 },
    activeBossFight: null,
    bossDefeats: { lilith: 0, anakim: 0 }
  },
  fortresses: {
    owned: [],
    epaulettes: 0,
    lastCollectionTime: 0,
    equippedBracelet: null,        // conquistado via sistema de Fortalezas — não pré-equipado
    equippedTalismans: [],         // conquistado via sistema de Fortalezas — não pré-equipado
    activeSiege: null
  },
  lastRankingRewardClaim: 0,
  lifeActivities: {
    fishing: {
      level: 1, xp: 0,
      tool: 'rod_novice', toolDurability: 50, maxDurability: 50,
      consumable: 'bait_worm', consumableCount: 20,
      zoneId: 'talking_island_coast',
      isWorking: false, autoMode: false,
      lastTick: 0, consecutiveFailures: 0,
      codexDiscoveries: {}
    },
    hunting: {
      level: 1, xp: 0,
      tool: 'knife_none', toolDurability: 50, maxDurability: 50,
      consumable: null, consumableCount: 0,
      zoneId: 'zone_talking_forest',
      isWorking: false, autoMode: false,
      lastTick: 0, consecutiveFailures: 0,
      codexDiscoveries: {}
    },
    gathering: {
      level: 1, xp: 0,
      tool: 'sickle_novice', toolDurability: 50, maxDurability: 50,
      consumable: null, consumableCount: 0,
      zoneId: 'zone_gludio_plains',
      isWorking: false, autoMode: false,
      lastTick: 0, consecutiveFailures: 0,
      codexDiscoveries: {}
    },
    mining: {
      level: 1, xp: 0,
      tool: 'pickaxe_novice', toolDurability: 50, maxDurability: 50,
      consumable: null, consumableCount: 0,
      zoneId: 'zone_dwarven_veins',
      isWorking: false, autoMode: false,
      lastTick: 0, consecutiveFailures: 0,
      codexDiscoveries: {}
    }
  },
  fishing: {
    skillLevel: 1,
    skillXp: 0,
    rod: null,
    activeBait: null,
    activeZone: null,
    isFishing: false,
    castStartTime: 0,
    totalCaught: 0,
    fishLog: {},
    autoFishing: false,
    lastAutoTick: 0,
    rodDurability: {},
    baitInventory: {},
  },
  hunting: {
    skillLevel: 1,
    skillXp: 0,
    knife: 'knife_none',
    activeLure: null,
    activeZone: 'zone_talking_forest',
    isHunting: false,
    trackStartTime: 0,
    trackedPreyId: null,
    totalHunted: 0,
    huntingLog: {},
    autoHunting: false,
    lastAutoTick: 0,
    knifeDurability: { knife_none: 50 },
    lureInventory: {},
  },
  mercenaries: {
    owned: [],
    tavernPool: [],
    lastTavernRefresh: 0
  },
  expeditions: [], castles: {}, manorSeeds: {}, manorCrops: {},
  quests: {
    progress: {},
    claimed: [],
    lastDailyReset: 0,
    lastWeeklyReset: 0,
    dailyBonusClaimed: false
  },
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
  _saveVersion: 0,   // Número sequencial de transação do save
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
 * Salva o estado atual no localStorage com Checksum de integridade, Backup de segurança e Cloud Push.
 * @param {boolean} [manual=false] Se true, executa flash-save imediato cancelando throttling
 * @param {boolean} [forceCloud=false] Se true, dispara envio forçado imediato ao Firebase
 */
export function saveState(manual = false, forceCloud = false) {
  currentState.lastSaveTime = Date.now();
  currentState._saveVersion = (Number(currentState._saveVersion) || 0) + 1;
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

    EventBus.emit('state:saved', { 
      manual, 
      forceCloud, 
      version: currentState._saveVersion, 
      time: currentState.lastSaveTime 
    });

    // Se solicitado ou se for save manual/crítico, dispara gravação imediata na nuvem
    if (typeof window !== 'undefined' && typeof window.saveCloudNow === 'function') {
      window.saveCloudNow(data, manual || forceCloud);
    }
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
    if (!raw) {
      currentState = DEFAULT_STATE();
      return false;
    }
    isBackupRestore = true;
  }

  try {
    let data = JSON.parse(raw);

    // Valida integridade e sanidade dos dados
    const check = validateStateIntegrity(data);
    if (!check.valid) {
      // Se os dados numéricos fundamentais existirem e forem válidos, preserva o save e atualiza o checksum
      if (typeof data.level === 'number' && data.level >= 1 && typeof data.gold === 'number') {
        data._chk = generateStateChecksum(data);
        console.debug('[StateManager] Checksum de segurança sincronizado com os dados atuais.');
      } else {
        console.warn('[StateManager] Verificação de integridade:', check.reason);
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

    // ─── Migrações Canônicas de Save / Namespaces ───
    if (data.ac !== undefined && !data.adenCoins) {
      currentState.adenCoins = Number(data.ac) || 0;
    }
    if (data.raidTickets !== undefined && data.dailyRaidTickets === undefined) {
      currentState.dailyRaidTickets = Number(data.raidTickets) || 3;
    }
    if (data.ancientAdena !== undefined && (!data.sevenSigns || !data.sevenSigns.ancientAdena)) {
      currentState.sevenSigns = currentState.sevenSigns || {};
      currentState.sevenSigns.ancientAdena = Number(data.ancientAdena) || 0;
    }

    // ─── Migrações Canônicas: Life Activities ───
    if (!currentState.lifeActivities) {
      currentState.lifeActivities = def.lifeActivities;
    }
    if (data.fishing) {
      currentState.lifeActivities.fishing = currentState.lifeActivities.fishing || def.lifeActivities.fishing;
      currentState.lifeActivities.fishing.level = data.fishing.skillLevel || currentState.lifeActivities.fishing.level;
      currentState.lifeActivities.fishing.xp = data.fishing.skillXp || currentState.lifeActivities.fishing.xp;
    }
    if (data.hunting) {
      currentState.lifeActivities.hunting = currentState.lifeActivities.hunting || def.lifeActivities.hunting;
      currentState.lifeActivities.hunting.level = data.hunting.skillLevel || currentState.lifeActivities.hunting.level;
      currentState.lifeActivities.hunting.xp = data.hunting.skillXp || currentState.lifeActivities.hunting.xp;
    }

    // Normalização de Equipamentos (20 Slots Canônicos com chest e shield)
    if (currentState.equipment) {
      if (currentState.equipment.armor && !currentState.equipment.chest) {
        currentState.equipment.chest = currentState.equipment.armor;
      }
      if (currentState.equipment.chest) {
        currentState.equipment.armor = currentState.equipment.chest;
      }
      if (currentState.equipment.head && !currentState.equipment.helmet) {
        currentState.equipment.helmet = currentState.equipment.head;
      }
      if ((currentState.equipment.offhand || currentState.equipment.sigil) && !currentState.equipment.shield) {
        currentState.equipment.shield = currentState.equipment.offhand || currentState.equipment.sigil;
      }
      if (currentState.equipment.dual && !currentState.equipment.weapon2) {
        currentState.equipment.weapon2 = currentState.equipment.dual;
      }
      if (currentState.equipment.hair && !currentState.equipment.hair1) {
        currentState.equipment.hair1 = currentState.equipment.hair;
      }
      if (currentState.equipment.ring && !currentState.equipment.ring1) {
        currentState.equipment.ring1 = currentState.equipment.ring;
      }
      if (currentState.equipment.cape && !currentState.equipment.cloak) {
        currentState.equipment.cloak = currentState.equipment.cape;
      }
      if (currentState.equipment.talisman && !currentState.equipment.talisman_bracelet) {
        currentState.equipment.talisman_bracelet = currentState.equipment.talisman;
      }
      if (currentState.equipment.agathion && !currentState.equipment.agathion_bracelet) {
        currentState.equipment.agathion_bracelet = currentState.equipment.agathion;
      }
      const canonical20 = [
        'weapon', 'weapon2', 'shield', 'helmet', 'chest', 'gloves', 'legs', 'boots',
        'cloak', 'belt', 'necklace', 'earring1', 'earring2', 'ring1', 'ring2',
        'hair1', 'hair2', 'brooch', 'agathion_bracelet', 'talisman_bracelet'
      ];
      for (const slot of canonical20) {
        if (currentState.equipment[slot] === undefined) currentState.equipment[slot] = null;
      }
    }

    // Migração de Random Craft para namespace unificado state.randomCraft
    currentState.randomCraft = (data.randomCraft && typeof data.randomCraft === 'object') ? data.randomCraft : {
      points: Number(data.randomCraftCharge || data.craftPoints) || 0,
      charge: Number(data.craftCharges) || (Number(data.randomCraftCharge) >= 100 ? 1 : 0),
      slots: Array.isArray(data.randomCraftSlots) ? data.randomCraftSlots : [],
      history: Array.isArray(data.randomCraftHistory) ? data.randomCraftHistory : []
    };

    // Migração de Essência Astral -> Essência da Água
    if (Array.isArray(currentState.inventory)) {
      for (const it of currentState.inventory) {
        if (it && (it.itemId === 'essence_astral' || it.id === 'essence_astral')) {
          it.itemId = 'essence_water';
          it.id = 'essence_water';
        }
      }
    }
    if (currentState.alchemy && currentState.alchemy.essence_astral) {
      currentState.alchemy.essence_water = (currentState.alchemy.essence_water || 0) + currentState.alchemy.essence_astral;
      delete currentState.alchemy.essence_astral;
    }

    // Sanitização e migração do estoque do Empório Místico (Mystic Shop)
    if (Array.isArray(currentState.mysticShopInventory)) {
      currentState.mysticShopInventory = currentState.mysticShopInventory.map(item => {
        if (!item) return null;
        let id = item.itemId || item.id;
        if (id === 'enchant_weapon_scroll') id = 'scroll_of_enchant_weapon_';
        if (id === 'enchant_armor_scroll') id = 'scroll_of_enchant_armor';
        return { ...item, id, itemId: id };
      }).filter(item => {
        if (!item || !item.itemId) return false;
        if (hasItemsDict && !allItems[item.itemId]) return false;
        return true;
      });
    } else {
      currentState.mysticShopInventory = [];
    }

    currentState.codex = data.codex && typeof data.codex === 'object' ? data.codex : {};
    currentState.dolls = Array.isArray(data.dolls) ? data.dolls : [];

    // Migração de Pesca — garante que saves antigos sem fishing recebam defaults
    currentState.fishing = { ...def.fishing, ...(data.fishing || {}) };

    // Migração de Caça Silvestre e Mercenários — garante defaults para saves legados
    currentState.hunting = { ...def.hunting, ...(data.hunting || {}) };
    currentState.mercenaries = { ...def.mercenaries, ...(data.mercenaries || {}) };

    // Migração de Quests — garante integridade de claimed array e progress object
    currentState.quests = data.quests && typeof data.quests === 'object' ? data.quests : {};
    if (!currentState.quests.progress || typeof currentState.quests.progress !== 'object') currentState.quests.progress = {};
    if (!Array.isArray(currentState.quests.claimed)) currentState.quests.claimed = [];
    if (currentState.quests.dailyBonusClaimed === undefined) currentState.quests.dailyBonusClaimed = false;
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
    currentState.battlePass = data.battlePass && typeof data.battlePass === 'object' ? data.battlePass : {};
    if (!Array.isArray(currentState.battlePass.claimedFree)) currentState.battlePass.claimedFree = [];
    if (!Array.isArray(currentState.battlePass.claimedPremium)) currentState.battlePass.claimedPremium = [];
    if (currentState.battlePass.unlockedPremium === undefined) currentState.battlePass.unlockedPremium = false;
    if (typeof currentState.battlePass.xp !== 'number') currentState.battlePass.xp = 0;
    currentState.createdAt = Number(data.createdAt) || (currentState.createdAt || Date.now());
    currentState.dailyRewards = data.dailyRewards && typeof data.dailyRewards === 'object' ? data.dailyRewards : { currentDay: 1, claimedDays: [], lastClaimDate: '', streak: 0, totalClaims: 0 };
    currentState.tower = data.tower && typeof data.tower === 'object' ? data.tower : { highestFloor: 0, currentFloor: 1, lastSweepTime: 0 };
    currentState.bonusInventorySlots = Number(data.bonusInventorySlots) || 0;
    currentState.vipTeleportUntil = Number(data.vipTeleportUntil) || 0;
    currentState.referredBy = data.referredBy || (typeof localStorage !== 'undefined' ? localStorage.getItem('aden_referred_by') : null) || null;
    currentState.referralRewardClaimed = Boolean(data.referralRewardClaimed);
    currentState.referralsCount = Number(data.referralsCount) || 0;
    currentState.referralRewardsClaimed = Number(data.referralRewardsClaimed) || 0;

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

    // Normalização e auditoria defensiva de habilidades contra corrupções ou dados obsoletos
    normalizeAndValidateSkills(currentState);

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

/**
 * Concede o Starter Kit No-Grade e configura atributos e habilidades iniciais
 * condizentes com a raça e classe escolhidas.
 * @param {Object} state
 * @param {string} race
 * @param {string} classId
 * @param {string} [charName]
 * @param {'M'|'F'} [gender]
 */
export function applyStarterKit(state, race, classId, charName = null, gender = null) {
  if (!state) return;
  const canonicalRace = race || state.race || 'human';
  const canonicalClass = classId || state.class || 'fighter';

  state.race = canonicalRace;
  state.class = canonicalClass;
  if (gender) state.gender = gender;
  if (charName) {
    state.charName = charName;
    state.heroName = charName;
    state.playerName = charName;
    state.name = charName;
  }

  // Identidade canônica persistente
  state.characterId = state.characterId || `char_${Date.now().toString(36)}`;
  state.entityType = 'player';
  state.playerType = 'real';
  state.status = 'active';
  state.isDiscoverable = true;
  state.friends = Array.isArray(state.friends) ? state.friends : [];
  state.blocked = Array.isArray(state.blocked) ? state.blocked : [];

  // Reset de nível, atributos e ouro inicial
  state.level = 1;
  state.xp = 0;
  state.sp = 50;
  state.gold = Math.max(state.gold || 0, 2000);
  state.zone = 'talkingIsland';
  state.isCombatActive = true;

  // Limpa inventário e equipamentos para um começo sem sobras
  state.inventory = [];
  state.equipment = {
    weapon: null, weapon2: null, shield: null,
    helmet: null, chest: null, armor: null, gloves: null, legs: null, boots: null,
    hair1: null, hair2: null, necklace: null, earring1: null, earring2: null, ring1: null, ring2: null,
    belt: null, cloak: null, brooch: null, agathion_bracelet: null, talisman_bracelet: null
  };
  state.randomCraft = { points: 0, charge: 0, slots: [], history: [] };
  state.skills = {};

  // Determina o arquétipo inicial (Mage, Bow/Gunner, Dagger/Assassin, ou Melee/Fighter/Tank)
  const cLower = String(canonicalClass).toLowerCase();
  const isMage = cLower.includes('mage') || cLower.includes('wizard') || cLower.includes('cleric') || 
                 cLower.includes('elementweaver') || cLower.includes('sayha') || cLower.includes('bloodrose') ||
                 cLower.includes('shinemaker');
  const isBowOrGun = cLower.includes('bow') || cLower.includes('gun') || cLower.includes('sylph') || cLower.includes('archer') || cLower.includes('sniper');
  const isDagger = cLower.includes('dagger') || cLower.includes('assassin') || cLower.includes('scavenger') || cLower.includes('bounty');

  let starterWpnId = 'weapon_knight_sword';
  let starterArmorId = 'armor_leather_vest_light';
  let starterShotId = 'soulshot_ng';

  if (isMage) {
    starterWpnId = 'weapon_crucifix_of_blessing_magicblunt';
    starterArmorId = 'armor_devotion_armor_robe';
    starterShotId = 'spiritshot_ng';
  } else if (isBowOrGun) {
    starterWpnId = 'weapon_hunting_bow';
    starterArmorId = 'armor_leather_vest_light';
    starterShotId = 'soulshot_ng';
  } else if (isDagger) {
    starterWpnId = 'weapon_sword_breaker';
    starterArmorId = 'armor_leather_vest_light';
    starterShotId = 'soulshot_ng';
  } else {
    // Melee Fighter / Knight / Tank / Warg / Samurai / Artisan / Marauder
    starterWpnId = 'weapon_knight_sword';
    starterArmorId = 'armor_leather_vest_light';
    starterShotId = 'soulshot_ng';
  }

  // Gera UIDs únicos para os itens equipados
  const wpnUid = 'starter_wpn_' + Date.now();
  const armorUid = 'starter_arm_' + (Date.now() + 1);

  // Adiciona itens ao inventário
  state.inventory.push({
    uid: wpnUid,
    itemId: starterWpnId,
    count: 1,
    rarity: 'common',
    equipped: true,
    equippedSlot: 'weapon',
    foundation: false
  });
  state.equipment.weapon = wpnUid;

  state.inventory.push({
    uid: armorUid,
    itemId: starterArmorId,
    count: 1,
    rarity: 'common',
    equipped: true,
    equippedSlot: 'armor',
    foundation: false
  });
  state.equipment.armor = armorUid;

  // Adiciona 500x Shots correspondentes (Soulshot ou Spiritshot No-Grade)
  state.inventory.push({
    uid: 'starter_shot_' + (Date.now() + 2),
    itemId: starterShotId,
    count: 500,
    rarity: null,
    equipped: false,
    foundation: false
  });

  // Adiciona 20x Poções de Cura (HP Potion S)
  state.inventory.push({
    uid: 'starter_hp_' + (Date.now() + 3),
    itemId: 'hp_potion_s',
    count: 20,
    rarity: null,
    equipped: false,
    foundation: false
  });

  // Se for classe mágica, também adiciona 20x Poções de Mana (MP Potion S)
  if (isMage) {
    state.inventory.push({
      uid: 'starter_mp_' + (Date.now() + 4),
      itemId: 'mp_potion_s',
      count: 20,
      rarity: null,
      equipped: false,
      foundation: false
    });
  }

  // Habilita automaticamente Soulshot/Spiritshot
  state.soulshotActive = true;

  // Inicializa atributos base zerados (raceStats e clsBase são calculados dinamicamente em StatsEngine)
  const gEcho = (typeof window !== 'undefined' && window.EchoData) ? window.EchoData : {};
  const classDef = gEcho.CLASSES_ECHO?.[canonicalClass] || {};
  state.base = { atk: 0, def: 0, eva: 0, matk: 0, mdef: 0 };

  // Desbloqueia estritamente a habilidade inicial canônica de Nível 1 da classe/arquétipo
  state.skills = {};
  const starterSkillIds = getStarterSkillsForClass(classId || canonicalClass);
  starterSkillIds.forEach(sId => {
    state.skills[sId] = 1;
  });
  state.selectedSkill = starterSkillIds[0] || null;

  // Configura HP e MP máximos
  state.maxHp = Math.max(100, classDef.base?.hp || 100);
  state.hp = state.maxHp;
  state.maxMp = Math.max(50, classDef.base?.mp || 50);
  state.mp = state.maxMp;
}
