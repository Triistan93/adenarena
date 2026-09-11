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
    weapon: null, weapon2: null, shield: null,
    helmet: null, armor: null, gloves: null, legs: null, boots: null,
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
  clan: {
    name: 'Os Guardiões de Aden',
    level: 1,
    reputation: 0,
    castles: [],
    lastTaxTimestamp: 0,
    accumulatedTaxes: {}
  },
  olympiad: {
    points: 1000,
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
    equippedBracelet: 'bracelet_steel',
    equippedTalismans: ['talisman_power'],
    activeSiege: null
  },
  lastRankingRewardClaim: 0,
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
    if (!raw) return false;
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
    weapon: null, weapon2: null, shield: null, helmet: null, armor: null, gloves: null, boots: null,
    hair: null, hair2: null, necklace: null, earring1: null, earring2: null, ring: null, ring2: null,
    belt: null, cloak: null, talisman: null, agathion: null
  };
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

  // Inicializa atributos base através dos registros da Raça e Classe
  const gEcho = (typeof window !== 'undefined' && window.EchoData) ? window.EchoData : {};
  const raceDef = gEcho.RACES_ECHO?.[canonicalRace] || {};
  const classDef = gEcho.CLASSES_ECHO?.[canonicalClass] || {};
  state.base = { atk: 0, def: 0, eva: 0, matk: 0, mdef: 0 };
  for (const k of ['atk', 'def', 'eva', 'matk', 'mdef']) {
    state.base[k] = (raceDef.stats?.[k] || 0) + (classDef.base?.[k] || 0);
  }

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
