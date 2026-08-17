import * as ART from "./art.js";
// echo-adapter garante que SKILL_DEFS_ECHO, CLASS_SKILLS_ECHO e SKILL_TREE_LAYOUT_ECHO
// existam em window.EchoData antes das constantes globais serem lidas abaixo.
import "./data/echo-adapter.js";
import "./data/affixes.js";
import "./src/data/items/index.js";
import { getArmorType, getWeaponType, canEquipByType, ARMOR_TYPE_LABEL, WEAPON_TYPE_LABEL } from './src/data/items/item_class_rules.js';
import { AFFIX_MAP as AFFIX_MAP_IMPORT } from './data/affixes.js';



// ─── Sprint 1: Importa módulos de dados extraídos ───────────────────────────
import { RACE_BASE_ATTRIBUTES, RACES, CLASSES, DWARF_CLASS, KAMAEL_CLASS } from './src/data/races.js';
import { resolveCanonicalClassId } from './src/data/classes/class_aliases.js';
import { SAGAS, ZONES, ZONE_BACKGROUNDS }                                   from './src/data/zones.js';
import { MONSTERS }                                                          from './src/data/monsters.js';
import { RAID_BOSSES }                                                       from './src/data/raids.js';
import { QUEST_DEFS, BATTLE_PASS_TIERS, PASS_DEFS }                        from './src/data/quests.js';
import { CODEX_SETS, BOSS_DOLLS }                                           from './src/data/codex.js';
import { MONSTER_CARDS, CardCodexService }                                    from './src/services/CardCodexService.js';
// ─── Sprint 2: Importa motores de Stats e Nível ────────────────────────────
import {
  getStats as engineGetStats,
  getBaseAttributes,
  getEquipBonus as engineGetEquipBonus,
  getTotalEquipBonuses as engineGetTotalEquipBonuses,
  getCertificationsBonuses as engineGetCertificationsBonuses,
  getActiveSetBonuses as engineGetActiveSetBonuses,
  applyPrimaryStats,
  getClass,
  getZoneDropTier,
  getEquippedSetCount,
  ASTRAL_NODES
} from './src/engine/StatsEngine.js';

import {
  getXPForLevel,
  getTotalXP,
  calcSpForLevel,
  checkLevelUp as engineCheckLevelUp
} from './src/engine/LevelEngine.js';

import {
  checkGradePenalty,
  getPlayerTotalGradePenalty,
  rollChampionMonster,
  ZONE_GRADE_MULTIPLIERS
} from './src/engine/BalanceEngine.js';

import {
  validateOfflineTime,
  sanitizeGameState
} from './src/engine/SecurityEngine.js';
// ─── Sprint 3: Importa serviços de Inventário, Equipamentos, Loja e Craft ──
import {
  getMaxInventorySlots,
  getMaxWarehouseSlots,
  isHighValueItem,
  isProtectedFromAutoSell,
  getItemGrade,
  getInventoryCount as serviceGetInventoryCount,
  addToInventory as serviceAddToInventory,
  removeFromInventory as serviceRemoveFromInventory,
  removeFromInventoryByItemId as serviceRemoveFromInventoryByItemId,
  getWarehouseCount as serviceGetWarehouseCount,
  depositToWarehouse as serviceDepositToWarehouse,
  withdrawFromWarehouse as serviceWithdrawFromWarehouse,
  getSelectedSet as serviceGetSelectedSet,
  toggleSelectItem as serviceToggleSelectItem,
  selectItemsByFilter as serviceSelectItemsByFilter,
  clearItemSelection as serviceClearItemSelection,
  consolidateInventoryStacks
} from './src/services/InventoryService.js';

import {
  DAILY_REWARDS_TABLE,
  getDailyRewardStatus,
  claimDailyReward
} from './src/services/DailyRewardService.js';

import {
  resolveEquipSlot as serviceResolveEquipSlot,
  equipItem as serviceEquipItem,
  unequipItem as serviceUnequipItem
} from './src/services/EquipmentService.js';

import {
  buyItem as serviceBuyItem,
  buyMysticItem as serviceBuyMysticItem,
  sellItem as serviceSellItem,
  sellAllJunk as serviceSellAllJunk,
  buybackItem as serviceBuybackItem,
  rerollMysticStock as serviceRerollMysticStock
} from './src/services/ShopService.js';

import {
  getCraftLevelReq,
  getRecipeDef,
  getRecipeMaterials,
  calculateMaxCraftableQty,
  canCraft as serviceCanCraft,
  canCraftRecipe as serviceCanCraftRecipe,
  craftItem as serviceCraftItem,
  getMaterialDropSources,
  applySoulCrystal as serviceApplySoulCrystal,
  processSoulDrainOnKill as serviceProcessSoulDrainOnKill,
  unsealItem as serviceUnsealItem,
  polishMasterwork as servicePolishMasterwork,
  swapWeaponSameGrade as serviceSwapWeaponSameGrade,
  applyDyeSymbol as serviceApplyDyeSymbol,
  upgradeDyeSymbol as serviceUpgradeDyeSymbol,
  removeDyeSymbol as serviceRemoveDyeSymbol,
  applyElementalStone as serviceApplyElementalStone,
  compoundBeltsWithDuplicates as serviceCompoundBeltsWithDuplicates,
  applyLifeStone as serviceApplyLifeStone,
  removeAugment as serviceRemoveAugment,
  chargeRandomCraft as serviceChargeRandomCraft,
  chargeRandomCraftWithAdena as serviceChargeRandomCraftWithAdena,
  chargeRandomCraftWithItem as serviceChargeRandomCraftWithItem,
  rollRandomCraftSlots as serviceRollRandomCraftSlots,
  claimRandomCraft as serviceClaimRandomCraft
} from './src/services/CraftService.js';
import {
  ALCHEMY_RECIPES,
  dissolveItem as serviceDissolveItem,
  dissolveItemsByGrade as serviceDissolveItemsByGrade,
  dissolveAllJunkEquipment as serviceDissolveAllJunkEquipment,
  craftElixir as serviceCraftElixir,
  useChaosBossSummonStone as serviceUseChaosBossSummonStone,
  processChaosBossLoot as serviceProcessChaosBossLoot
} from './src/services/AlchemyService.js';
// ─── Sprint 4: Importa motores de Combate e Habilidades ────────────────────
import {
  startCombat as engineStartCombat,
  stopCombat as engineStopCombat,
  pickRandomMonster as enginePickRandomMonster,
  selectZone as engineSelectZone,
  updateSagaProgress as engineUpdateSagaProgress,
  playerDeath as enginePlayerDeath,
  resurrect as engineResurrect,
  toggleSoulshot as engineToggleSoulshot,
  toggleAutoPotion as engineToggleAutoPotion
} from './src/engine/CombatEngine.js';

import {
  getSkillCost,
  spendSP as engineSpendSP,
  resetSP as engineResetSP,
  getStarterSkillForClass,
  canCastSkillWeapon
} from './src/engine/SkillEngine.js';
// ─── Sprint 5: Importa serviços de Personagem, Quests, Torre e Raids ────────
import {
  classSatisfies as serviceClassSatisfies,
  getSkillTreeKey as serviceGetSkillTreeKey,
  getClassSkills as serviceGetClassSkills,
  checkClassAdvancement as serviceCheckClassAdvancement,
  promoteClass as servicePromoteClass
} from './src/services/CharacterService.js';

import {
  checkQuestResets as serviceCheckQuestResets,
  triggerQuestEvent as serviceTriggerQuestEvent,
  claimQuestReward as serviceClaimQuestReward,
  unlockPremiumPass as serviceUnlockPremiumPass,
  claimPassReward as serviceClaimPassReward
} from './src/services/QuestService.js';

import {
  getTowerFloorDef as serviceGetTowerFloorDef,
  challengeTowerFloor as serviceChallengeTowerFloor,
  completeTowerFloor as serviceCompleteTowerFloor,
  sweepTowerDaily as serviceSweepTowerDaily
} from './src/services/TowerService.js';

import {
  startRaidBoss as serviceStartRaidBoss,
  getRaidStatus as serviceGetRaidStatus,
  canEnterRaid as serviceCanEnterRaid,
  handleRaidVictory as serviceHandleRaidVictory,
  processRaidBossMechanics as serviceProcessRaidBossMechanics,
  checkAndResetDailyRaidTickets as serviceCheckAndResetDailyRaidTickets
} from './src/services/RaidService.js';
import {
  formatItemDisplayName as uiFormatItemDisplayName,
  showItemTooltip as uiShowItemTooltip,
  hideItemTooltip as uiHideItemTooltip,
  updateInventoryUI as uiUpdateInventoryUI,
  updateWarehouseUI as uiUpdateWarehouseUI,
  updateEquipmentUI as uiUpdateEquipmentUI,
  updateSkillUI as uiUpdateSkillUI,
  updateSkillInfoPanel as uiUpdateSkillInfoPanel,
  renderStageHero as uiRenderStageHero,
  renderStageMonster as uiRenderStageMonster,
  updateZoneUI as uiUpdateZoneUI,
  renderZoneMap as uiRenderZoneMap,
  updateShopUI as uiUpdateShopUI,
  updateCraftUI as uiUpdateCraftUI,
  openCraftModal as uiOpenCraftModal,
  closeCraftModal as uiCloseCraftModal,
  updateCharacterUI as uiUpdateCharacterUI,
  renderAlchemyUI as uiRenderAlchemyUI,
  renderAstralMasteryUI as uiRenderAstralMasteryUI,
  renderExpeditionsUI as uiRenderExpeditionsUI,
  renderRaidsTab as uiRenderRaidsTab,
  renderOlympiadTab as uiRenderOlympiadTab,
  renderClanTab as uiRenderClanTab,
  renderSevenSignsTab as uiRenderSevenSignsTab,
  renderFortressTab as uiRenderFortressTab,
  renderColosseumTab as uiRenderColosseumTab,
  renderRankingTab as uiRenderRankingTab,
  setActiveRankingTab as uiSetActiveRankingTab,
  openSkillEnchantModal,
  openAugmentModal,
  initTooltipEvents as uiInitTooltipEvents,
  openCompoundModal,
  closeCompoundModal,
  renderCompoundModal,
  openCashShopModal,
  closeCashShopModal,
  renderCashShopModal,
  showDropLocatorModal
} from './src/ui/GameUI.js';
import { CashShopService } from './src/services/CashShopService.js';
import { NoblesseService } from './src/services/NoblesseService.js';
import { OlympiadService } from './src/services/OlympiadService.js';
import { ClanService } from './src/services/ClanService.js';
import { SkillEnchantService } from './src/services/SkillEnchantService.js';
import { AugmentationService } from './src/services/AugmentationService.js';
import { SevenSignsService } from './src/services/SevenSignsService.js';
import { FortressService } from './src/services/FortressService.js';
import { ColosseumService } from './src/services/ColosseumService.js';
import { CombatPowerService } from './src/services/CombatPowerService.js';
import { RankingService } from './src/services/RankingService.js';
import { SubclassCertificationService, EMERGENT_ABILITIES, MASTER_ABILITIES_BY_ARCHETYPE, DIVINE_TRANSFORMATIONS } from './src/services/SubclassCertificationService.js';
import { ensureAppLayout, showMenuPanel } from './src/ui/AppLayout.js';
import { checkTabGuide, closeTabGuideModal, openTabGuideModal } from './src/ui/TutorialGuide.js';
import { VFX, initializeVFX } from './vfx.js';
// ─── Sprint 7: Importa EventBus e StateManager (Wiring & State) ───────────
import EventBus from './src/core/EventBus.js';
import {
  getState,
  setState,
  saveState as managerSaveState,
  loadState as managerLoadState,
  resetState as managerResetState,
  DEFAULT_STATE
} from './src/core/StateManager.js';
// ────────────────────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────

// ── Tutorial Guide: expõe funções do modal ao escopo global (onclick inline) ──
window.closeTabGuideModal = closeTabGuideModal;
window.openTabGuideModal = openTabGuideModal;
// ─────────────────────────────────────────────────────────────────────────────

// Carregamento síncrono de icon_index.json antes de qualquer renderização de itens
try {
  const _res = await fetch("./img/icons/icon_index.json", { cache: "no-cache" });
  if (_res.ok) {
    window.IconIndex = await _res.json();
  }
} catch (e) {
  console.warn("[main] Não foi possível carregar icon_index.json — usando fallback ICON_MAP:", e?.message || e);
}
// ========================================
// Lineage Idle - Main Game Logic
// ========================================

const SAVE_KEY = 'lineageIdleSave_v2';
const D = () => window.GameData;

// ========== ECHO OF ELEMENTS — Skill bridges ==========
const SKILL_DEFS = new Proxy({}, {
  get: (_, prop) => (window.EchoData?.SKILL_DEFS_ECHO || {})[prop],
  has: (_, prop) => prop in (window.EchoData?.SKILL_DEFS_ECHO || {}),
  ownKeys: () => Reflect.ownKeys(window.EchoData?.SKILL_DEFS_ECHO || {}),
  getOwnPropertyDescriptor: (_, prop) => Reflect.getOwnPropertyDescriptor(window.EchoData?.SKILL_DEFS_ECHO || {}, prop)
});

const SKILL_REQS = new Proxy({}, {
  get: (_, prop) => (window.EchoData?.SKILL_REQS_ECHO || {})[prop],
  has: (_, prop) => prop in (window.EchoData?.SKILL_REQS_ECHO || {}),
  ownKeys: () => Reflect.ownKeys(window.EchoData?.SKILL_REQS_ECHO || {}),
  getOwnPropertyDescriptor: (_, prop) => Reflect.getOwnPropertyDescriptor(window.EchoData?.SKILL_REQS_ECHO || {}, prop)
});

const SKILL_TREE_LAYOUT = new Proxy({}, {
  get: (_, prop) => (window.EchoData?.SKILL_TREE_LAYOUT_ECHO || {})[prop],
  has: (_, prop) => prop in (window.EchoData?.SKILL_TREE_LAYOUT_ECHO || {}),
  ownKeys: () => Reflect.ownKeys(window.EchoData?.SKILL_TREE_LAYOUT_ECHO || {}),
  getOwnPropertyDescriptor: (_, prop) => Reflect.getOwnPropertyDescriptor(window.EchoData?.SKILL_TREE_LAYOUT_ECHO || {}, prop)
});

const TIER_NAMES = ['Foundation', 'Discipline', 'Mastery', 'Ascendancy', 'Legend'];
// ======================================================

// --------------------------- STATE ---------------------------
let state = getState();

let _saveTimeout = null;
function save(manual = false) {
  if (manual) {
    if (_saveTimeout) { clearTimeout(_saveTimeout); _saveTimeout = null; }
    managerSaveState(true);
    try { RankingService.syncToCloud(state, true); } catch (e) {}
    log('Game saved successfully.', 'system');
    floatText('SAVED', 'float-gold');
    return;
  }
  if (_saveTimeout) return;
  _saveTimeout = setTimeout(() => {
    _saveTimeout = null;
    managerSaveState(false);
    try { RankingService.syncToCloud(state, false); } catch (e) {}
  }, 1000);
}

function load() {
  const loaded = managerLoadState();
  if (loaded) {
    state = getState();
    consolidateInventoryStacks(state);
    checkQuestResets();
    updateSagaProgress(true);
    log('✨ Atualização de versão carregada com sucesso! Seu progresso e itens foram 100% mantidos.', 'rarity-legendary');
    if (state.lastSaveTime) {
      setTimeout(() => checkOfflineProgress(state.lastSaveTime), 600);
    }
  }
  return loaded;
}


function resetSave() {
  if (confirm('Reset all progress? This cannot be undone.')) {
    managerResetState();
    if (typeof window !== 'undefined' && typeof window.resetCloudSave === 'function') {
      window.resetCloudSave();
    }
    location.reload();
  }
}


// --------------------------- STATS CALC (Sprint 2: Delegado para StatsEngine.js) ---------------------------
function getEquipBonus(slot) { return engineGetEquipBonus(state, slot); }
function getTotalEquipBonuses() { return engineGetTotalEquipBonuses(state); }
function getCertificationsBonuses() { return engineGetCertificationsBonuses(state); }
function getActiveSetBonuses() { return engineGetActiveSetBonuses(state); }
function getStats() { return engineGetStats(state); }


// Delegados para StatsEngine.js (Sprint 2)
// (getBaseAttributes, getZoneDropTier, getClass estão importados no topo)


function classSatisfies(playerClass, reqClass) { return serviceClassSatisfies(playerClass, reqClass); }
function getSkillTreeKey(classId) { return serviceGetSkillTreeKey(classId); }
function getClassSkills(classId) { return serviceGetClassSkills(classId); }
function validateAndFixCharacterClass() {
  if (!state.race) state.race = 'human';
  
  const raceDefaults = {
    human: 'fighter',
    elf: 'elfFighter',
    darkelf: 'darkElfFighter',
    orc: 'orcBase',
    dwarf: 'artisan',
    kamael: 'soulbreaker',
    sylph: 'sylphGunner',
    highelf: 'highElfBase',
    ertheia: 'bloodRoseBase'
  };

  const currentClassDef = getClass(state.class);
  if (!currentClassDef || (currentClassDef.stage === 0 && currentClassDef.race && currentClassDef.race !== state.race)) {
    state.class = raceDefaults[state.race] || 'fighter';
  }
}

// Opens the Class Transfer modal — declared before checkClassAdvancement uses it
function openClassTransferModal(classInfo) {
  validateAndFixCharacterClass();
  const modal = el('class-transfer-modal');
  if (!modal) return;

  const currentClassDef = getClass(state.class);
  const currentStage = currentClassDef?.stage || 0;
  const targetStage = currentStage + 1;

  const titleEl = el('class-modal-heading');
  if (titleEl) {
    const stageNames = ['1ª Troca de Classe', '2ª Troca de Classe', '3ª Troca de Classe (3rd Job)'];
    titleEl.textContent = `📜 ${stageNames[currentStage] || 'Cerimônia de Avanço de Classe'}`;
  }

  const echoClasses = (typeof window !== 'undefined' && window.EchoData)
    ? window.EchoData.CLASSES_ECHO
    : {};
  const allClasses = Object.keys(echoClasses).length ? echoClasses : (D()?.CLASSES || {});
  const canonStateClass = resolveCanonicalClassId(state.class);
  const seenClassIds = new Set();

  const candidates = [];
  for (const [clsId, clsDef] of Object.entries(allClasses)) {
    if (!clsDef || clsDef.stage !== targetStage) continue;
    
    // Race filter: if class specifies a race, it must match character's race
    if (clsDef.race && clsDef.race !== state.race) continue;

    const parentCanon = resolveCanonicalClassId(clsDef.parent);
    const clsCanon = resolveCanonicalClassId(clsId);

    // Parent matching check
    const matchesParent = (clsDef.parent === state.class)
      || (clsDef.parent === canonStateClass)
      || (parentCanon === canonStateClass)
      || (parentCanon === state.class)
      || (clsDef.parent === 'highElfBase' && (canonStateClass === 'highElfBase' || canonStateClass === 'highelf' || canonStateClass === 'templar'))
      || (clsDef.parent === 'divineTemplarS1' && (canonStateClass === 'divineTemplarS1' || canonStateClass === 'lightTemplar'))
      || (clsDef.parent === 'divineTemplarS2' && (canonStateClass === 'divineTemplarS2' || canonStateClass === 'holyTemplar'))
      || (clsDef.parent === 'fighter' && (canonStateClass === 'elfFighter' || canonStateClass === 'darkElfFighter' || canonStateClass === 'orcBase' || canonStateClass === 'fighter'))
      || (clsDef.parent === 'mage' && (canonStateClass === 'elfMage' || canonStateClass === 'darkElfMage' || canonStateClass === 'mage'))
      || (clsDef.parent === 'elfFighter' && (canonStateClass === 'fighter' || canonStateClass === 'elfFighter') && state.race === 'elf')
      || (clsDef.parent === 'darkElfFighter' && (canonStateClass === 'fighter' || canonStateClass === 'darkElfFighter') && state.race === 'darkelf')
      || (clsDef.parent === 'artisan' && state.race === 'dwarf')
      || (clsDef.parent === 'soulbreaker' && state.race === 'kamael');

    if (matchesParent) {
      if (!seenClassIds.has(clsCanon)) {
        seenClassIds.add(clsCanon);
        candidates.push({ id: clsCanon, def: clsDef });
      }
    }
  }

  const container = el('class-options-container');
  if (container) {
    container.innerHTML = '';
    if (!candidates.length) {
      container.innerHTML = `
        <div style="padding:24px; text-align:center; color:var(--text-muted); font-size:13px; background:rgba(0,0,0,0.4); border:1px solid rgba(212,175,55,0.2); border-radius:8px;">
          ⚠️ Nenhuma opção de evolução disponível para <strong>${currentClassDef?.name || state.class}</strong> na etapa ${targetStage}.
        </div>
      `;
    } else {
      for (const { id: clsId, def: clsDef } of candidates) {
        const card = mkEl('div');
        card.className = 'class-option-card';
        card.style.cssText = `
          background: linear-gradient(180deg, rgba(24, 18, 12, 0.98), rgba(12, 9, 5, 0.99));
          border: 1px solid var(--border-gilt);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 12px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.6);
          display: flex;
          flex-direction: column;
          gap: 8px;
        `;

        const statsStr = Object.entries(clsDef.base || {})
          .filter(([, v]) => v > 0)
          .map(([k, v]) => `+${v} ${k.toUpperCase()}`)
          .join(' · ');

        const archetypeIcons = {
          fighter: '⚔️ Guerreiro',
          tank: '🛡️ Tanque Guardião',
          mage: '🔮 Mago Elemental',
          healer: '✨ Clérigo / Cura',
          bard: '🎵 Dançarino / Bardo',
          assassin: '🗡️ Assassino Mortal',
          archer: '🏹 Atirador',
          artisan: '⚒️ Artesão Master',
          soulbreaker: '⚡ Soulbreaker'
        };
        const archLabel = archetypeIcons[clsDef.archetype] || clsDef.archetype || 'Especialista';

        card.innerHTML = `
          <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:6px;">
            <h3 style="margin:0; font-family:'Cinzel',serif; color:var(--gilt-bright); font-size:17px; display:flex; align-items:center; gap:8px;">
              ${clsDef.name}
            </h3>
            <span style="padding:3px 10px; background:rgba(212,167,68,0.15); border:1px solid var(--border-gilt); border-radius:4px; font-size:11px; color:var(--gilt-bright); font-weight:bold;">
              ${archLabel}
            </span>
          </div>
          <p style="margin:4px 0; font-size:12px; color:var(--text-muted); line-height:1.4;">${clsDef.desc || 'Evolução de ordem avançada.'}</p>
          ${statsStr ? `<div style="font-size:11px; color:#6ee7b7; font-weight:bold; background:rgba(110,231,183,0.1); padding:4px 8px; border-radius:4px; border:1px solid rgba(110,231,183,0.2);">✨ Bônus de Atributos: ${statsStr}</div>` : ''}
          <button class="action-btn action-btn--primary promote-btn" data-class-id="${clsId}" style="margin-top:8px; padding:10px; width:100%; font-weight:bold; font-family:'Cinzel',serif; font-size:13px; cursor:pointer;">
            ⚔️ Escolher &amp; Avançar para ${clsDef.name}
          </button>
        `;

        const btn = card.querySelector('.promote-btn');
        if (btn) {
          btn.onclick = () => promoteClass(clsId);
        }

        container.appendChild(card);
      }
    }
  }

  modal.classList.add('active');
}

function checkClassAdvancement() { return serviceCheckClassAdvancement(state, { el, openClassTransferModal }); }
function promoteClass(newClassId) { return servicePromoteClass(state, newClassId, { log, floatText, el, updateAllUI, save }); }


// --------------------------- INVENTORY / SALVAGE (Sprint 3: Delegados) ---------------------------
function getInventoryCount(itemId) { return serviceGetInventoryCount(state, itemId); }
function addToInventory(itemId, amount = 1, rarity = null, foundation = false) {
  return serviceAddToInventory(state, itemId, amount, rarity, foundation, { log });
}
function removeFromInventory(uid, amount = 1) { return serviceRemoveFromInventory(state, uid, amount); }


function getWarehouseCount(itemId) {
  if (!state.warehouse || !Array.isArray(state.warehouse)) return 0;
  return state.warehouse
    .filter(i => (i.itemId === itemId || getItemDef(i.itemId)?.id === itemId))
    .reduce((acc, i) => acc + (i.count || 1), 0);
}

function depositToWarehouse(uid, amount = 1) {
  const invIdx = state.inventory.findIndex(i => i.uid === uid);
  if (invIdx < 0) return false;
  const item = state.inventory[invIdx];
  if (item.equipped) {
    log('Desequipe o item antes de guardá-lo no baú.', 'system');
    return false;
  }

  const def = getItemDef(item.itemId);
  if (!def) return false;

  state.warehouse = state.warehouse || [];
  const maxSlots = getMaxWarehouseSlots();

  const isStackable = def.stack || ['consumable','material','scroll','powerup'].includes(def.slot);
  if (isStackable) {
    let remaining = Math.min(amount, item.count || 1);
    const maxStack = def.stack || 9999;
    while (remaining > 0) {
      const existing = state.warehouse.find(i => i.itemId === item.itemId && (i.count || 1) < maxStack);
      if (existing) {
        const space = maxStack - (existing.count || 1);
        const add = Math.min(space, remaining);
        existing.count = (existing.count || 1) + add;
        remaining -= add;
      } else {
        if (state.warehouse.length >= maxSlots) {
          log('Baú cheio!', 'system');
          return false;
        }
        const add = Math.min(maxStack, remaining);
        state.warehouse.push({ ...item, uid: Date.now() + '_' + Math.random().toString(36).slice(2, 8), count: add, equipped: false });
        remaining -= add;
      }
    }
    if ((item.count || 1) > amount) {
      item.count -= amount;
    } else {
      state.inventory.splice(invIdx, 1);
    }
  } else {
    if (state.warehouse.length >= maxSlots) {
      log('Baú cheio!', 'system');
      return false;
    }
    state.inventory.splice(invIdx, 1);
    state.warehouse.push({ ...item, equipped: false });
  }

  const formattedName = uiFormatItemDisplayName(item, def);
  log(`📦 Guardou ${formattedName} no Baú.`, 'loot');
  hideItemTooltip();
  updateInventoryUI();
  updateWarehouseUI();
  updateAllUI(); save();
  return true;
}

function withdrawFromWarehouse(uid, amount = 1) {
  state.warehouse = state.warehouse || [];
  const whIdx = state.warehouse.findIndex(i => i.uid === uid);
  if (whIdx < 0) return false;
  const item = state.warehouse[whIdx];

  const def = getItemDef(item.itemId);
  if (!def) return false;

  const maxInvSlots = getMaxInventorySlots();

  const isStackable = def.stack || ['consumable','material','scroll','powerup'].includes(def.slot);
  if (isStackable) {
    let remaining = Math.min(amount, item.count || 1);
    const maxStack = def.stack || 9999;
    while (remaining > 0) {
      const existing = state.inventory.find(i => i.itemId === item.itemId && (i.count || 1) < maxStack);
      if (existing) {
        const space = maxStack - (existing.count || 1);
        const add = Math.min(space, remaining);
        existing.count = (existing.count || 1) + add;
        remaining -= add;
      } else {
        if (state.inventory.length >= maxInvSlots) {
          log('Mochila cheia!', 'system');
          return false;
        }
        const add = Math.min(maxStack, remaining);
        state.inventory.push({ ...item, uid: Date.now() + '_' + Math.random().toString(36).slice(2, 8), count: add, equipped: false });
        remaining -= add;
      }
    }
    if ((item.count || 1) > amount) {
      item.count -= amount;
    } else {
      state.warehouse.splice(whIdx, 1);
    }
  } else {
    if (state.inventory.length >= maxInvSlots) {
      log('Mochila cheia!', 'system');
      return false;
    }
    state.warehouse.splice(whIdx, 1);
    state.inventory.push({ ...item, equipped: false });
  }

  const formattedName = uiFormatItemDisplayName(item, def);
  log(`🎒 Retirou ${formattedName} do Baú.`, 'loot');
  hideItemTooltip();
  updateInventoryUI();
  updateWarehouseUI();
  updateAllUI(); save();
  return true;
}

const ALL_EQUIP_SLOTS = [
  'weapon', 'shield', 'helmet', 'armor', 'legs', 'gloves', 'boots',
  'hair', 'hair2', 'necklace', 'earring1', 'earring2', 'ring', 'ring2',
  'belt', 'cloak', 'talisman', 'agathion'
];

function resolveEquipSlot(slot) { return serviceResolveEquipSlot(slot, state.equipment); }
function equipItem(a, b, silent = false) {
  if (typeof hideItemTooltip === 'function') hideItemTooltip();
  const uid = (typeof a === 'string' && a) ? a : (typeof b === 'string' ? b : null);
  if (!uid) return;
  const callbacks = silent
    ? { log, classSatisfies, getClass }
    : { log, updateAllUI, save, classSatisfies, getClass };
  return serviceEquipItem(state, uid, callbacks);
}
function unequipItem(a, b, silent = false) {
  if (typeof hideItemTooltip === 'function') hideItemTooltip();
  const slot = (typeof a === 'string' && a) ? a : (typeof b === 'string' ? b : null);
  if (!slot) return;
  const callbacks = silent
    ? { log }
    : { log, updateAllUI, save };
  return serviceUnequipItem(state, slot, callbacks);
}


// isHighValueItem e getItemGrade importados do InventoryService.js (Sprint 3)


function salvageItem(uid) {
  const idx = state.inventory.findIndex(i => String(i.uid) === String(uid));
  if (idx < 0) return;
  const item = state.inventory[idx];
  if (item.equipped) { log('Desequipe o item antes de desmontar!', 'system'); return; }
  const def = D().ALL_ITEMS[item.itemId];
  if (!def) return;
  const targetSlot = resolveEquipSlot(def.slot);
  const isEquip = (def.slot && def.slot !== 'consumable' && def.slot !== 'material' && def.slot !== 'scroll' && def.slot !== 'powerup') || ALL_EQUIP_SLOTS.includes(targetSlot);
  if (!isEquip) {
    log('Apenas equipamentos podem ser desmontados.', 'system');
    return;
  }

  if (isHighValueItem(item)) {
    const rarityName = D().RARITY[item.rarity]?.name || item.rarity;
    if (!confirm(`⚠️ Deseja realmente SUCATEAR o item valioso "${def.name}" [${rarityName}]?`)) {
      return;
    }
  }

  const reqLvl = def.req ? def.req.level : 1;
  const grade = getItemGrade(reqLvl);
  const rarityMult = item.rarity ? (D().RARITY[item.rarity]?.mult || 1) : 1;

  let matId = 'iron_ore';
  if (grade === 'S Grade' || def.tier === 6) matId = 'crystal_s';
  else if (grade === 'A Grade') matId = 'crystal_a';
  else if (grade === 'B Grade') matId = 'crystal_b';
  else if (grade === 'C Grade') matId = 'crystal_c';
  else if (grade === 'D Grade') matId = 'crystal_d';
  else matId = (def.slot === 'weapon') ? 'iron_ore' : 'cloth';

  const amount = Math.max(1, Math.floor((reqLvl / 5 + 1) * rarityMult));
  state.inventory.splice(idx, 1);
  addToInventory(matId, amount);
  log(`🔨 Desmontou ${def.name} em ${amount}x ${D().ALL_ITEMS[matId]?.name || matId}!`, 'loot');
  hideItemTooltip();
  updateAllUI(); save();
}

function getSelectedSet() {
  if (!(state.selectedUids instanceof Set)) {
    if (Array.isArray(state.selectedUids)) {
      state.selectedUids = new Set(state.selectedUids);
    } else {
      state.selectedUids = new Set();
    }
  }
  return state.selectedUids;
}

function toggleSelectItem(uid) {
  const set = getSelectedSet();
  const found = state.inventory.find(i => String(i.uid) === String(uid));
  if (!found) return;
  const realUid = found.uid;
  if (set.has(realUid) || set.has(String(realUid))) {
    set.delete(realUid);
    set.delete(String(realUid));
  } else {
    set.add(realUid);
  }
  updateInventoryUI();
}

function selectItemsByFilter(filterFn) {
  const set = getSelectedSet();
  for (const item of state.inventory) {
    if (item && !item.equipped && filterFn(item)) {
      set.add(item.uid);
    }
  }
  updateInventoryUI();
}

function selectJunkItems() {
  const set = getSelectedSet();
  for (const item of state.inventory) {
    if (item && !item.equipped) {
      const def = D().ALL_ITEMS[item.itemId];
      if (def && isProtectedFromAutoSell(item, def)) continue;
      const r = (item.rarity || 'common').toLowerCase();
      if (r === 'common' || r === 'uncommon') {
        set.add(item.uid);
      }
    }
  }
  updateInventoryUI();
}

function clearItemSelection() {
  const set = getSelectedSet();
  set.clear();
  updateInventoryUI();
}

function sellSelectedItems() {
  const set = getSelectedSet();
  if (set.size === 0) { log('Nenhum item selecionado para vender.', 'system'); return; }
  const toDelete = Array.from(set);
  
  const hasHighValue = toDelete.some(uid => {
    const item = state.inventory.find(i => String(i.uid) === String(uid));
    return isHighValueItem(item);
  });
  if (hasHighValue) {
    if (!confirm(`⚠️ A seleção contém itens de alta raridade (Raro ou superior). Deseja realmente vender?`)) {
      return;
    }
  }

  let totalGold = 0, count = 0;
  for (const uid of toDelete) {
    const item = state.inventory.find(i => String(i.uid) === String(uid));
    if (!item || item.equipped) continue;
    const def = D().ALL_ITEMS[item.itemId];
    if (!def) continue;
    if (isProtectedFromAutoSell(item, def)) continue;
    const itemQty = item.count || 1;
    const basePrice = def.price || 10;
    const mult = item.rarity ? (D().RARITY[item.rarity]?.mult || 1) : 1;
    const enchantMult = 1 + (item.enchant || 0) * 0.1;
    const goldEarned = Math.floor(basePrice * mult * enchantMult * 0.4) * itemQty;
    
    totalGold += goldEarned;
    count += itemQty;
    removeFromInventory(item.uid, itemQty);
  }
  
  set.clear();
  state.gold += totalGold;
  log(`💰 Vendeu ${count} item(ns) selecionado(s) por ${totalGold.toLocaleString()}g!`, 'loot');
  updateAllUI();
  save();
}

function salvageSelectedItems() {
  const set = getSelectedSet();
  if (set.size === 0) { log('Nenhum item selecionado para desmontar.', 'system'); return; }
  const toDelete = Array.from(set);

  const hasHighValue = toDelete.some(uid => {
    const item = state.inventory.find(i => String(i.uid) === String(uid));
    return isHighValueItem(item);
  });
  if (hasHighValue) {
    if (!confirm(`⚠️ A seleção contém itens de alta raridade (Raro ou superior). Deseja realmente sucatear?`)) {
      return;
    }
  }
  
  let count = 0;
  const yieldSummary = {};

  for (const uid of toDelete) {
    const item = state.inventory.find(i => String(i.uid) === String(uid));
    if (!item || item.equipped) continue;
    const def = D().ALL_ITEMS[item.itemId];
    if (!def) continue;
    
    const targetSlot = resolveEquipSlot(def.slot);
    const isEquip = (def.slot && def.slot !== 'consumable' && def.slot !== 'material' && def.slot !== 'scroll' && def.slot !== 'powerup') || ALL_EQUIP_SLOTS.includes(targetSlot);
    if (!isEquip) continue;
    
    const reqLvl = def.req ? def.req.level : 1;
    const grade = getItemGrade(reqLvl);
    const rarityMult = item.rarity ? (D().RARITY[item.rarity]?.mult || 1) : 1;

    let matId = 'iron_ore';
    if (grade === 'S Grade' || def.tier === 6) matId = 'crystal_s';
    else if (grade === 'A Grade') matId = 'crystal_a';
    else if (grade === 'B Grade') matId = 'crystal_b';
    else if (grade === 'C Grade') matId = 'crystal_c';
    else if (grade === 'D Grade') matId = 'crystal_d';
    else matId = (def.slot === 'weapon') ? 'iron_ore' : 'cloth';

    const amount = Math.max(1, Math.floor((reqLvl / 5 + 1) * rarityMult));
    removeFromInventory(item.uid, 1);
    addToInventory(matId, amount);

    yieldSummary[matId] = (yieldSummary[matId] || 0) + amount;
    count++;
  }

  set.clear();
  const summaryStr = Object.entries(yieldSummary)
    .map(([mId, amt]) => `${amt}x ${D().ALL_ITEMS[mId]?.name || mId}`)
    .join(', ');

  if (count > 0) {
    log(`🔨 Desmontou ${count} equipamento(s) e obteve: ${summaryStr || 'materiais'}!`, 'loot');
  } else {
    log('Nenhum equipamento válido selecionado para desmontar.', 'system');
  }
  updateAllUI();
  save();
}
function useItem(uid) {
  if (typeof hideItemTooltip === 'function') hideItemTooltip();
  const idx = state.inventory.findIndex(i => i.uid === uid);
  if (idx < 0) return;
  const item = state.inventory[idx];
  const def = D().ALL_ITEMS[item.itemId];
  if (!def) return;
  const usable = def.slot === 'consumable' || def.slot === 'scroll' || def.slot === 'powerup';
  if (!usable) { if (ALL_EQUIP_SLOTS.includes(resolveEquipSlot(def.slot))) equipItem(uid); return; }
  
  state.buffs = state.buffs || {};
  const applyBuff = (key, amt, dur) => {
    const existing = state.buffs[key];
    const newUntil = Date.now() + dur * 1000;
    if (existing && existing.until > Date.now()) {
      existing.until = Math.min(existing.until + dur * 1000, Date.now() + 8 * 3600 * 1000); 
      existing.amount = Math.max(existing.amount, amt);
    } else { state.buffs[key] = { amount: amt, until: newUntil }; }
  };
  const fmtDur = (s) => s >= 3600 ? `${(s/3600).toFixed(s%3600?1:0)}h` : s >= 60 ? `${Math.round(s/60)}m` : `${s}s`;
  
  if (def.type === 'heal') { state.hp = Math.min(state.maxHp, state.hp + def.amount); log(`Used ${def.name}: +${def.amount} HP`, 'heal'); } 
  else if (def.type === 'mana') { state.mp = Math.min(state.maxMp, state.mp + def.amount); log(`Used ${def.name}: +${def.amount} MP`, 'heal'); } 
  else if (def.type === 'buff') { applyBuff(def.stat, def.amount, def.duration); log(`Used ${def.name}: +${def.amount} ${def.stat.toUpperCase()} for ${fmtDur(def.duration)}`, 'heal'); } 
  else if (def.type === 'xpBoost') { applyBuff('xpBoost', def.amount, def.duration); log(`Used ${def.name}: +${Math.round(def.amount*100)}% XP for ${fmtDur(def.duration)}`, 'xp'); } 
  else if (def.type === 'goldBoost') { applyBuff('goldBoost', def.amount, def.duration); log(`Used ${def.name}: +${Math.round(def.amount*100)}% gold for ${fmtDur(def.duration)}`, 'loot'); } 
  else if (def.type === 'luckBoost') { applyBuff('luckBoost', def.amount, def.duration); log(`Used ${def.name}: +${Math.round(def.amount*100)}% luck for ${fmtDur(def.duration)}`, 'loot'); } 
  else if (def.type === 'autoPotion') { applyBuff('autoPotion', 1, def.duration); log(`Used ${def.name}: auto-potion active for ${fmtDur(def.duration)}`, 'heal'); } 
  else if (def.type === 'teleport') {
    state.hp = state.maxHp; state.mp = state.maxMp;
    const town = state.race ? RACES[state.race].startZone : 'talkingIsland';
    if (state.zone !== town) { state.zone = town; const zn = el('zone-name'); if (zn) zn.textContent = ZONES[state.zone]?.name || town; stopCombat(); setTimeout(startCombat, 300); }
    log(`Used ${def.name}: returned to ${ZONES[town]?.name || town}, fully healed.`, 'heal');
  } else if (def.type === 'raceClassChange' || item.itemId === 'scroll_race_class_change') {
    if (typeof window !== 'undefined' && typeof window.onOpenRaceClassChangeModal === 'function') {
      window.onOpenRaceClassChangeModal({
        scrollUid: uid,
        charName: state.charName || 'Aventureiro',
        race: state.race || 'human',
        class: state.class || 'fighter'
      });
    } else {
      log('Abra o menu de Reespecialização para utilizar o Scroll of Race & Class Change.', 'system');
    }
    return;
  } else if (def.type === 'resurrect') { log('Scrolls auto-use on death.', 'system'); return; } 
  else { log(`Used ${def.name}`, 'heal'); }
  
  if (item.count > 1) item.count--; else state.inventory.splice(idx, 1);
  updateAllUI(); save();
}

window.executeRaceClassChange = (scrollUid, newRace, newClass) => {
  if (scrollUid) {
    const idx = state.inventory.findIndex(i => i.uid === scrollUid);
    if (idx >= 0) {
      if (state.inventory[idx].count > 1) state.inventory[idx].count--;
      else state.inventory.splice(idx, 1);
    }
  }

  // 1. Unequip all equipped items safely back to inventory
  const ALL_SLOTS = ['weapon', 'shield', 'helmet', 'armor', 'legs', 'gloves', 'boots', 'necklace', 'earring1', 'earring2', 'ring', 'ring2', 'belt', 'cloak', 'talisman', 'agathion', 'hair', 'hair2'];
  if (state.equipment) {
    for (const slot of ALL_SLOTS) {
      state.equipment[slot] = null;
    }
  }

  // 2. Refund all spent SP
  let refundedSp = 0;
  if (state.skills) {
    for (const [skillId, lvl] of Object.entries(state.skills)) {
      const level = Number(lvl) || 0;
      for (let l = 1; l <= level; l++) {
        const sDef = (typeof SKILL_DEFS !== 'undefined') ? SKILL_DEFS[skillId] : null;
        const cost = sDef ? (sDef.cost * l) : (5 * l);
        refundedSp += cost;
      }
    }
  }
  state.sp = (Number(state.sp) || 0) + refundedSp;

  // 3. Reset all skills
  const resetSkills = {};
  if (typeof SKILL_DEFS !== 'undefined') {
    for (const k of Object.keys(SKILL_DEFS)) {
      resetSkills[k] = 0;
    }
  }
  state.skills = resetSkills;

  // 4. Update Race and Class
  state.race = newRace;
  state.class = newClass;

  // 5. Grant initial class skill
  const starterSkill = getStarterSkillForClass(newClass);
  state.skills[starterSkill] = 1;
  state.selectedSkill = starterSkill;

  // 6. Recalculate base stats
  const raceObj = RACES[newRace] || RACES.human;
  state.base = { ...(raceObj.stats || {}) };
  if (clsObj && clsObj.base) {
    for (const k of ['atk', 'def', 'eva', 'matk', 'mdef']) {
      state.base[k] = (state.base[k] || 0) + (clsObj.base[k] || 0);
    }
  }

  // 7. Save & Update UI
  updateAllUI();
  save();
  log(`✨ Troca de Raça & Classe realizada com sucesso para ${(raceObj.name || newRace).toUpperCase()} ${(clsObj?.name || newClass).toUpperCase()}! ${refundedSp} SP devolvidos e equipamentos guardados no inventário.`, 'rarity-legendary');
};

// --------------------------- LEVEL UP wrapper ---------------------------
// engineCheckLevelUp is imported from LevelEngine.js — provide local wrapper that other code can call
function checkLevelUp() { return engineCheckLevelUp(state, { log, floatText, updateAllUI, checkClassAdvancement, updateSkillUI, updateRaceClassUI, getStats }); }

// --------------------------- SELL ITEM ---------------------------
function sellItem(uid) {
  const idx = state.inventory.findIndex(i => i.uid === uid);
  if (idx < 0) return;
  const item = state.inventory[idx];
  if (item.equipped) { log('Desequipe o item antes de vender.', 'system'); return; }
  const def = D()?.ALL_ITEMS?.[item.itemId];
  if (!def) return;

  if (isHighValueItem(item)) {
    const rarityName = D().RARITY[item.rarity]?.name || item.rarity;
    if (!confirm(`⚠️ Deseja realmente VENDER o item valioso "${def.name}" [${rarityName}]?`)) return;
  }

  const qty = item.count || 1;
  const basePrice = def.price || 10;
  const mult = item.rarity ? (D().RARITY[item.rarity]?.mult || 1) : 1;
  const enchantMult = 1 + (item.enchant || 0) * 0.1;
  const goldEarned = Math.floor(basePrice * mult * enchantMult * 0.4) * qty;
  state.inventory.splice(idx, 1);
  state.gold += goldEarned;
  const name = uiFormatItemDisplayName(item, def);
  log(`💰 Vendeu ${name} por ${goldEarned.toLocaleString()}g!`, 'loot');
  hideItemTooltip();
  updateAllUI();
  save();
}

// --------------------------- CRAFTING (Sprint 3: Delegados) ---------------------------
function canCraft(recipeId, qty = 1) { return serviceCanCraft(state, recipeId, qty); }
function canCraftRecipe(id, qty = 1) { return serviceCanCraftRecipe(state, id, qty); }
function craftItem(recipeId, qty = 1) {
  return serviceCraftItem(state, recipeId, qty, { log, floatText, getItemDef, formatItemDisplayName: uiFormatItemDisplayName, updateAllUI, save });
}


// --------------------------- UI HELPERS ---------------------------
let ROOT = document; let _intervals = []; let _listeners = [];
export function setRoot(r) {
  ROOT = r || document;
  initializeVFX(ROOT);
}
export function addTrackedListener(target, event, handler, opts) {
  if (target && target.addEventListener) {
    target.addEventListener(event, handler, opts);
    _listeners.push({ target, event, handler, opts });
  }
}
export function destroy() {
  try { stopCombat(); } catch (e) {}
  _intervals.forEach(id => clearInterval(id));
  _intervals = [];
  _listeners.forEach(({ target, event, handler, opts }) => {
    try { target.removeEventListener(event, handler, opts); } catch(e) {}
  });
  _listeners = [];
}

function playSfx(type, arg) {
  try {
    if (typeof window !== 'undefined' && window.idleAudio) {
      if (type === 'click') window.idleAudio.playClick();
      else if (type === 'upgrade') window.idleAudio.playUpgrade();
      else if (type === 'hit') window.idleAudio.playHit();
      else if (type === 'critical') window.idleAudio.playCritical();
      else if (type === 'drop') window.idleAudio.playDrop(arg);
      else if (type === 'levelUp') window.idleAudio.playLevelUp();
    }
  } catch(e) {}
}
const el = id => (ROOT && ROOT.getElementById ? ROOT.getElementById(id) : null) || (ROOT && ROOT.querySelector ? ROOT.querySelector('#' + id) : null) || (document.getElementById(id));
const qs = sel => (ROOT && ROOT.querySelector ? ROOT.querySelector(sel) : null) || (document.querySelector(sel));
const qsa = sel => (ROOT && ROOT.querySelectorAll ? ROOT.querySelectorAll(sel) : []) || (document.querySelectorAll(sel));
// Always create elements in the same document as ROOT so Shadow DOM styles apply.
const doc = () => (ROOT && ROOT.ownerDocument) ? ROOT.ownerDocument : document;
const mkEl = tag => doc().createElement(tag);
const mkNS = (ns, tag) => doc().createElementNS(ns, tag);

function updateBar(id, cur, max) {
  const bar = el(id); const text = el(id.replace('-bar', '-text'));
  if (bar) bar.style.width = `${Math.max(0, (cur / max) * 100)}%`;
  if (text) text.textContent = `${Math.floor(cur)} / ${Math.floor(max)}`;
}
function getLogTime() {
  const d = new Date();
  return `[${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}]`;
}

function resolveLogCategory(type, msg) {
  // Spawn de Boss/Elite, Sagas e Avisos do Servidor pertencem à aba Sistema
  if (type === 'boss' || type === 'system' || msg.includes('surgiu') || msg.includes('apareceu') || msg.includes('DESPERTADO') || msg.includes('desbloqueada') || msg.includes('DESBLOQUEADA') || msg.includes('Salvo') || msg.includes('carregado') || msg.includes('Élite') || msg.includes('CHEFÃO') || msg.includes('Miniboss')) {
    return 'system';
  }
  if (type === 'xp' || type === 'gold' || msg.includes('XP') || msg.includes('SP') || msg.includes('Adena') || msg.includes('JACKPOT') || msg.includes('Level Up')) {
    return 'gold_xp';
  }
  if (type === 'loot' || type.startsWith('rarity-') || msg.includes('Drop') || msg.includes('Obteve') || msg.includes('✦')) {
    return 'loot';
  }
  if (type === 'combat' || type === 'damage' || type === 'heal' || msg.includes('hit') || msg.includes('missed') || msg.includes('DODGE') || msg.includes('Curou') || msg.includes('dano')) {
    return 'combat';
  }
  return 'system';
}

function getLogBadgeHtml(type, category, msg = '') {
  if (type === 'boss' || msg.includes('CHEFÃO') || msg.includes('Élite') || msg.includes('Miniboss')) {
    return '<span class="log-badge badge-boss">BOSS</span>';
  }
  if (category === 'loot') {
    if (type === 'rarity-legendary') return '<span class="log-badge badge-legendary">LENDÁRIO</span>';
    if (type === 'rarity-epic') return '<span class="log-badge badge-rare">ÉPICO</span>';
    if (type === 'rarity-rare') return '<span class="log-badge badge-rare">RARO</span>';
    return '<span class="log-badge badge-loot">DROP</span>';
  }
  if (category === 'gold_xp') {
    if (type === 'xp') return '<span class="log-badge badge-xp">XP</span>';
    return '<span class="log-badge badge-gold">OURO</span>';
  }
  if (category === 'combat') {
    if (type === 'heal') return '<span class="log-badge badge-loot">CURA</span>';
    return '<span class="log-badge badge-combat">LUTA</span>';
  }
  return '<span class="log-badge badge-sys">SISTEMA</span>';
}

function log(msg, type = 'system', explicitCategory = null) {
  const logEl = el('log');
  if (!logEl) return;

  const category = explicitCategory || resolveLogCategory(type, msg);
  const entry = mkEl('p');
  entry.className = `log-entry ${type}`;
  entry.dataset.category = category;

  const timeStr = getLogTime();
  const badgeHtml = getLogBadgeHtml(type, category, msg);
  entry.innerHTML = `<span class="log-time">${timeStr}</span> ${badgeHtml} ${msg}`;

  const currentFilter = state.logFilter || 'all';
  if (currentFilter !== 'all' && currentFilter !== category) {
    entry.style.display = 'none';
  }

  // Smart Auto-Scroll: apenas se o jogador já estiver no final do log
  const scrollThreshold = 60;
  const isNearBottom = (logEl.scrollHeight - logEl.scrollTop - logEl.clientHeight) <= scrollThreshold;

  logEl.appendChild(entry);

  const scrollBtn = el('log-scroll-down-btn');
  if (isNearBottom) {
    logEl.scrollTop = logEl.scrollHeight;
    if (scrollBtn) scrollBtn.style.display = 'none';
  } else {
    // Jogador está lendo o histórico anterior; não arrasta a tela bruscamente!
    if (scrollBtn) scrollBtn.style.display = 'block';
  }

  // Mantém até 250 mensagens no histórico
  while (logEl.children.length > 250) {
    logEl.removeChild(logEl.firstChild);
  }
}

function scrollLogToBottom() {
  const logEl = el('log');
  const scrollBtn = el('log-scroll-down-btn');
  if (logEl) {
    logEl.scrollTo({ top: logEl.scrollHeight, behavior: 'smooth' });
  }
  if (scrollBtn) scrollBtn.style.display = 'none';
}

function safeUiUpdate(label, fn) {
  try {
    fn();
  } catch (err) {
    console.warn(`UI update failed (${label}):`, err);
  }
}

function updateStatsUI() {
  const stats = getStats();
  updateBar('hp-bar', state.hp, stats.maxHp); updateBar('mp-bar', state.mp, stats.maxMp);
  state.maxHp = stats.maxHp; state.maxMp = stats.maxMp;
  const xpForLevel = getXPForLevel(state.level);
  updateBar('xp-bar', state.xp - getTotalXP(state.level - 1), xpForLevel);
  const _xtEl = el('xp-text'); if (_xtEl) _xtEl.textContent = `${state.xp - getTotalXP(state.level - 1)} / ${xpForLevel}`;
  const _spEl = el('sp-text'); if (_spEl) _spEl.textContent = state.sp;
  const _lvEl = el('level-text'); if (_lvEl) _lvEl.textContent = state.level;
  const _atkEl = el('atk-text'); if (_atkEl) _atkEl.textContent = stats.atk;
  const _defEl = el('def-text'); if (_defEl) _defEl.textContent = stats.def;
  const _evaEl = el('eva-text'); if (_evaEl) _evaEl.textContent = stats.eva;
  const _matkEl = el('matk-text'); if (_matkEl) _matkEl.textContent = stats.matk;
  const _mdefEl = el('mdef-text'); if (_mdefEl) _mdefEl.textContent = stats.mdef;
  const _critEl = el('crit-text'); if (_critEl) _critEl.textContent = `${stats.crit}%`;
  const _lootEl = el('loot-text'); if (_lootEl) _lootEl.textContent = `${Math.round(stats.loot * 100)}%`;
  
  const _gEl = el('gold-text-stat');
  if (_gEl) { _gEl.textContent = state.gold.toLocaleString(); if (_gEl._lastGold != null && state.gold > _gEl._lastGold) { _gEl.classList.remove('pulse'); void _gEl.offsetWidth; _gEl.classList.add('pulse'); } _gEl._lastGold = state.gold; }
  const _acEl = el('top-ac-amount');
  if (_acEl) _acEl.textContent = `${(state.adenCoins || 0).toLocaleString()} AC`;
  const gps = getGoldPerSec();
  const gpsEl = el('gps-text'); if (gpsEl) gpsEl.textContent = gps > 0 ? `${gps.toFixed(1)}/s` : '—';
  
  const _clEl = el('craft-level-stat'); if (_clEl) _clEl.textContent = state.craftLevel;
  const _rcEl = el('race-text'); if (_rcEl) _rcEl.textContent = (state.race && RACES?.[state.race]?.name) || state.race || '-';
  const _csEl = el('class-text'); if (_csEl) _csEl.textContent = (state.class && getClass(state.class)?.name) || state.class || '-';
  const _sgEl = el('saga-text'); if (_sgEl) _sgEl.textContent = (state.currentSaga && SAGAS?.[state.currentSaga]?.name) || state.currentSaga || '-';
  const _sz = el('stage-zone');
  if (_sz) { const _t = (state.zone && ZONES?.[state.zone]) ? ZONES[state.zone].name + (ZONES[state.zone].town ? ' · town' : '') : '—'; if (_sz.textContent !== _t) _sz.textContent = _t; }
  const _spaEl = el('sp-available'); if (_spaEl) _spaEl.textContent = state.sp;
  const _gtEl = el('gold-text'); if (_gtEl) _gtEl.textContent = state.gold.toLocaleString();
  const _sgdEl = el('shop-gold'); if (_sgdEl) _sgdEl.textContent = state.gold.toLocaleString();
  const _maxInvSlots = getMaxInventorySlots(state);
  const _isEl = el('inv-slots'); if (_isEl) _isEl.textContent = `${state.inventory.length}/${_maxInvSlots}`;
  const _invSlotsCnt = el('inv-slots-count'); if (_invSlotsCnt) _invSlotsCnt.textContent = `${state.inventory.length}`;
  const _maxInvCnt = el('max-inv-slots'); if (_maxInvCnt) _maxInvCnt.textContent = `${_maxInvSlots}`;
  const _l2InvCounter = el('l2inv-counter'); if (_l2InvCounter) _l2InvCounter.textContent = `(${state.inventory.length}/${_maxInvSlots})`;

  const abEl = el('active-buffs');
  if (abEl) {
    const now = Date.now();
    // Sincroniza elixires ativos no state.buffs se necessário
    if (state.activeElixirs && typeof state.activeElixirs === 'object') {
      state.buffs = state.buffs || {};
      for (const [eId, exp] of Object.entries(state.activeElixirs)) {
        if (exp > now && !state.buffs[eId]) {
          const rec = (typeof ALCHEMY_RECIPES !== 'undefined' ? ALCHEMY_RECIPES[eId] : null);
          state.buffs[eId] = {
            name: rec ? rec.name : eId,
            icon: rec ? rec.icon : '🧪',
            desc: rec ? rec.desc : 'Elixir Alquímico Ativo',
            amount: 1,
            until: exp,
            isElixir: true
          };
        }
      }
    }

    const items = Object.entries(state.buffs || {}).filter(([,b]) => b && typeof b.until === 'number' && b.until > now).map(([k,b]) => {
      const map = {
        xpBoost: ['📘', `+${Math.round((b.amount||0)*100)}% XP`],
        goldBoost: ['🪙', `+${Math.round((b.amount||0)*100)}% G`],
        luckBoost: ['🍀', `+${Math.round((b.amount||0)*100)}% L`],
        autoPotion: ['🧪', 'Auto-Heal'],
        atk: ['⚔', `+${b.amount} ATK`],
        def: ['🛡', `+${b.amount} DEF`],
        matk: ['✦', `+${b.amount} MATK`],
        speed: ['⚡', `+${b.amount} SPD`],
        warcry: ['🗣', `+${(b.amount||0)*100}% ATK`],
        elixir_berserker: ['⚔️', 'Elixir Berserker (+15% Atk, +10 Spd)'],
        elixir_arcanist: ['🔮', 'Elixir Arcanista (+20% M.Atk, +50% MP)'],
        elixir_fortune: ['💰', 'Elixir da Fortuna (+25% Drop, +30% Ouro)'],
        elixir_titan: ['🛡️', 'Elixir de Titã (+25% HP, +20% Def)'],
        elixir_transcendence: ['✨', 'Elixir Transcendência (+20% XP/SP)']
      };
      const e = map[k] || (b.icon ? [b.icon, b.desc || b.name || k] : ['🧪', b.name || k]);
      return `<span class="ab-chip" title="${e[1]} · ${fmtCountdown(b.until-now)}">${e[0]}<em>${fmtCountdown(b.until-now)}</em></span>`;
    }).filter(Boolean);
    abEl.innerHTML = items.length ? items.join('') : '<span class="ab-empty">No active buffs</span>';
  }
}

function updateDetailedEquipStatsUI() {


  const stats = getStats();
  const atkEl = el('l2stat-atk'); if (atkEl) atkEl.textContent = stats.atk;
  const defEl = el('l2stat-def'); if (defEl) defEl.textContent = stats.def;
  const matkEl = el('l2stat-matk'); if (matkEl) matkEl.textContent = stats.matk;
  const mdefEl = el('l2stat-mdef'); if (mdefEl) mdefEl.textContent = stats.mdef;
  const critEl = el('l2stat-crit'); if (critEl) critEl.textContent = `${stats.crit}%`;
  const spdEl = el('l2stat-speed'); if (spdEl) spdEl.textContent = stats.speed;

  const pStats = state.primaryStats || {};
  const primBox = el('l2inv-primary-box');
  if (primBox) {
    primBox.style.display = 'block';
    const strEl = el('l2stat-str'); if (strEl) strEl.textContent = pStats.str || 0;
    const dexEl = el('l2stat-dex'); if (dexEl) dexEl.textContent = pStats.dex || 0;
    const conEl = el('l2stat-con'); if (conEl) conEl.textContent = pStats.con || 0;
    const intEl = el('l2stat-int'); if (intEl) intEl.textContent = pStats.int || 0;
    const witEl = el('l2stat-wit'); if (witEl) witEl.textContent = pStats.wit || 0;
    const menEl = el('l2stat-men'); if (menEl) menEl.textContent = pStats.men || 0;
  }

  const defaultSlotIcons = {
    hair: '👒', gloves: '🧤', weapon: '⚔️', necklace: '📿', ring: '💍', belt: '🪢',
    helmet: '⛑️', armor: '🛡️', legs: '👖', shield: '🛡️', boots: '👢',
    hair2: '🎭', earring1: '💎', earring2: '💎', ring2: '💍', cloak: '🧥', talisman: '🔮', agathion: '🧚‍♂️'
  };

  for (const slot of ALL_EQUIP_SLOTS) {
    const uid = state.equipment[slot];
    const pdSlots = qsa(`.l2inv-pd-slot[data-slot="${slot}"]`);
    const pdSlot = pdSlots && pdSlots.length ? pdSlots[0] : null;
    const elem = el(`equip-${slot}`);
    const wrap = elem && elem.closest ? elem.closest('.equip-slot') : null;
    const defaultEmoji = defaultSlotIcons[slot] || '📦';
    
    if (!uid) {
      if (pdSlot) { 
        pdSlot.className = `l2inv-pd-slot equip-slot`; 
        pdSlot.title = `${slot} · vazio`; 
        pdSlot.innerHTML = `<span class="l2inv-pd-icon">${defaultEmoji}</span><span class="l2inv-pd-item" id="pd-item-${slot}"></span>`;
      }
      if (elem) { elem.textContent = 'Empty'; elem.style.color = ''; elem.title = ''; }
      if (wrap) { wrap.style.borderColor = ''; wrap.title = slot + ' · empty'; }
      continue;
    }

    const item = state.inventory.find(i => i.uid === uid);
    if (!item) {
      state.equipment[slot] = null;
      if (pdSlot) { 
        pdSlot.className = `l2inv-pd-slot equip-slot`; 
        pdSlot.title = `${slot} · vazio`; 
        pdSlot.innerHTML = `<span class="l2inv-pd-icon">${defaultEmoji}</span><span class="l2inv-pd-item" id="pd-item-${slot}"></span>`;
      }
      if (elem) { elem.textContent = 'Empty'; elem.style.color = ''; elem.title = ''; }
      if (wrap) { wrap.style.borderColor = ''; wrap.title = slot + ' · empty'; }
      continue;
    }

    const def = D().ALL_ITEMS[item.itemId]; if (!def) continue;
    const rarity = item.rarity || 'common';
    const enchantStr = item.enchant ? `+${item.enchant}` : '';
    const full = uiFormatItemDisplayName(item, def);
    const col = item.rarity ? D().RARITY[rarity]?.color : 'var(--gilt)';

    if (pdSlot) {
      pdSlot.className = `l2inv-pd-slot equip-slot has-item rarity-${rarity}`;
      pdSlot.title = `${enchantStr ? enchantStr + ' ' : ''}${def.name} (${slot})`;
      pdSlot.innerHTML = `${getItemIcon(def)}<span class="l2inv-pd-item" id="pd-item-${slot}">${enchantStr}</span>`;
      pdSlot.onmouseenter = (e) => { cancelHideTooltip(); showItemTooltip(item, e); };
      pdSlot.onmouseleave = scheduleHideTooltip;
      pdSlot.onclick = (e) => { e.stopPropagation(); cancelHideTooltip(); showItemTooltip(item, e); };
      pdSlot.ondblclick = (e) => { e.stopPropagation(); unequipItem(slot); };
    }
    if (elem) {
      elem.textContent = (enchantStr ? enchantStr + ' ' : '') + def.name;
      elem.style.color = col;
      elem.title = full;
    }
    if (wrap) {
      wrap.style.borderColor = col;
      wrap.title = full;
    }
  }

  const eb = getTotalEquipBonuses(); const list = el('bonus-list');
  if (list) {
    list.innerHTML = '';
    const labels = { atk: 'ATK', def: 'DEF', matk: 'MATK', mdef: 'MDEF', hp: 'HP', mp: 'MP', eva: 'EVA', crit: 'CRIT', speed: 'SPD', lifesteal: 'LIFE STEAL' };
    for (const [k, label] of Object.entries(labels)) { if (eb[k]) { const div = mkEl('div'); div.innerHTML = `<span>${label}</span><span class="bonus-val">+${eb[k]}${k==='crit'?'%':''}</span>`; list.appendChild(div); } }
    if (!list.children.length) list.innerHTML = '<div style="color:var(--text-muted)">No equipment</div>';
  }
  renderStageHero();
}

const TREE_NODE_W = 110; const TREE_NODE_H = 78; const TREE_PAD_X = 14; const TREE_PAD_Y = 14;

function updateSkillUI() {
  return uiUpdateSkillUI(state, { spendSP, showSkillTooltip, hideSkillTooltip });
}
function updateSkillInfoPanel() {
  return uiUpdateSkillInfoPanel(state, { spendSP });
}


function updateInventoryUI() {
  consolidateInventoryStacks(state);
  updateDetailedEquipStatsUI();
  return uiUpdateInventoryUI(state, {
    equipItem,
    sellItem,
    salvageItem,
    useItem,
    toggleSelectItem,
    sellSelectedItems,
    salvageSelectedItems,
    selectJunkItems,
    clearItemSelection,
    depositToWarehouse,
    save,
    log
  });
}
function updateWarehouseUI() {
  return uiUpdateWarehouseUI(state, { withdrawFromWarehouse });
}
function updateEquipmentUI() {
  updateDetailedEquipStatsUI();
  return uiUpdateEquipmentUI(state, { unequipItem });
}
function updateCharacterUI() {
  return uiUpdateCharacterUI(state);
}




function getAssetUrl(p) {
  if (!p) return '';
  p = String(p).replace(/\\/g, '/');
  if (p.startsWith('http://') || p.startsWith('https://') || p.startsWith('data:')) return p;
  const cleanPath = p.replace(/^\//, '');
  let baseUrl = '';
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) {
    baseUrl = import.meta.env.BASE_URL;
  } else if (typeof window !== 'undefined' && window.__BASE_URL__) {
    baseUrl = window.__BASE_URL__;
  }
  if (baseUrl) {
    if (!baseUrl.endsWith('/')) baseUrl += '/';
    return baseUrl + cleanPath;
  }
  return '/' + cleanPath;
}

function getItemDef(itemId) {
  if (!itemId) return null;
  const all = (typeof window !== 'undefined' && window.GameData && window.GameData.ALL_ITEMS) ? window.GameData.ALL_ITEMS : ((typeof D === 'function' && D()) ? D().ALL_ITEMS : {});
  if (!all) return null;
  if (all[itemId]) return all[itemId];
  const s = String(itemId);
  if (all['armor_' + s]) return all['armor_' + s];
  if (all['jewel_' + s]) return all['jewel_' + s];
  if (all['weapon_' + s]) return all['weapon_' + s];
  const stripped = s.replace(/^(armor_|jewel_|weapon_|shield_|wepoan_)/, '');
  if (all[stripped]) return all[stripped];
  if (all['armor_' + stripped]) return all['armor_' + stripped];
  if (all['jewel_' + stripped]) return all['jewel_' + stripped];
  if (all['weapon_' + stripped]) return all['weapon_' + stripped];
  return null;
}

const HEIRLOOM_ICON_MAP_MAIN = {
  weapon_heirloom_sword: 'gradec/weapons/weapon_samurai_longsword.png',
  weapon_heirloom_spear: 'gradec/weapons/weapon_spiked_spear.png',
  weapon_heirloom_dagger: 'gradec/weapons/weapon_darkelven_dagger.png',
  weapon_heirloom_bow: 'gradec/weapons/weapon_eminence_bow.png',
  weapon_heirloom_staff: 'gradec/weapons/weapon_crystal_staff.png',
  weapon_heirloom_duals: 'gradec/weapons/weapon_dual_revolution_sword.png',
  weapon_heirloom_blunt: 'gradec/weapons/weapon_big_hammer.png',
  armor_heirloom_chest_heavy: 'gradec/armors/armor_full_plate_heavy_armor.png',
  armor_heirloom_legs_heavy: 'gradec/armors/armor_plated_leather_light_pants.png',
  armor_heirloom_helmet_heavy: 'gradec/armors/armor_full_plate_heavy_helmet.png',
  armor_heirloom_gloves_heavy: 'gradec/armors/armor_full_plate_heavy_gloves.png',
  armor_heirloom_boots_heavy: 'gradec/armors/armor_full_plate_heavy_boots.png',
  armor_heirloom_chest_light: 'gradec/armors/armor_theca_light_armor.png',
  armor_heirloom_legs_light: 'gradec/armors/armor_theca_light_pants.png',
  armor_heirloom_helmet_light: 'gradec/armors/armor_theca_light_helmet.png',
  armor_heirloom_gloves_light: 'gradec/armors/armor_theca_light_gloves.png',
  armor_heirloom_boots_light: 'gradec/armors/armor_theca_light_boots.png',
  armor_heirloom_chest_robe: 'gradec/armors/armor_karmian_robe_armor.png',
  armor_heirloom_legs_robe: 'gradec/armors/armor_karmian_robe_pants.png',
  armor_heirloom_helmet_robe: 'gradec/armors/armor_karmian_helmet.png',
  armor_heirloom_gloves_robe: 'gradec/armors/armor_karmian_robe_gloves.png',
  armor_heirloom_boots_robe: 'gradec/armors/armor_karmian_robe_boots.png',
  armor_heirloom_chest: 'gradec/armors/armor_full_plate_heavy_armor.png',
  armor_heirloom_legs: 'gradec/armors/armor_plated_leather_light_pants.png',
  armor_heirloom_helmet: 'gradec/armors/armor_full_plate_heavy_helmet.png',
  armor_heirloom_gloves: 'gradec/armors/armor_full_plate_heavy_gloves.png',
  armor_heirloom_boots: 'gradec/armors/armor_full_plate_heavy_boots.png',
  shield_heirloom_aegis: 'gradec/armors/armor_full_plate_shield.png',
  jewelry_heirloom_necklace: 'gradec/jewels/jewel_blessed_necklace.png',
  jewelry_heirloom_earring_1: 'gradec/jewels/jewel_blessed_earing.png',
  jewelry_heirloom_earring_2: 'gradec/jewels/jewel_blessed_earing.png',
  jewelry_heirloom_ring_1: 'gradec/jewels/jewel_blessed_ring.png',
  jewelry_heirloom_ring_2: 'gradec/jewels/jewel_blessed_ring.png',
  cloak_heirloom_royal: 'gradec/armors/armor_full_plate_cloack.png',
  belt_heirloom_champion: 'gradec/armors/armor_full_plate_belt.png',
  hair_heirloom_crown: 'acessories/noble_gold_crown.png'
};

function getItemIcon(defOrId) { 
  if (!defOrId) return '📦';
  const def = (typeof defOrId === 'string') ? getItemDef(defOrId) : (defOrId.itemId ? getItemDef(defOrId.itemId) : defOrId);
  const slot = def?.slot || (typeof defOrId === 'object' ? defOrId.slot : '') || '';
  const fallbackIcons = { weapon: '⚔️', armor: '🛡️', helmet: '⛑️', gloves: '🧤', boots: '👢', ring: '💍', earring: '💎', necklace: '📿', consumable: '🧪', material: '💎', scroll: '📜', cloak: '🧣', belt: '🎗️', hair: '👑', hair1: '👑', agathion: '🐾' }; 
  const emoji = fallbackIcons[slot] || '📦'; 

  const itemId = typeof defOrId === 'string' ? defOrId : (def?.id || defOrId.itemId || '');
  if (HEIRLOOM_ICON_MAP_MAIN[itemId] || HEIRLOOM_ICON_MAP_MAIN[def?.id]) {
    const iconUrl = getAssetUrl(`img/icons/${HEIRLOOM_ICON_MAP_MAIN[itemId] || HEIRLOOM_ICON_MAP_MAIN[def?.id]}`);
    return `<img src="${iconUrl}" alt="${def?.name || ''}" class="item-icon-img" onerror="this.style.display='none';if(this.nextElementSibling)this.nextElementSibling.style.display='inline-block';" style="width:28px; height:28px; object-fit:contain; vertical-align:middle;" /><span class="item-icon-fallback" style="display:none; font-size:18px;">${emoji}</span>`;
  }

  let iconPath = def?.icon || '';
  if (!iconPath) {
    const iconIndex = (typeof window !== 'undefined' && window.IconIndex) ? window.IconIndex : ((D() && D().ICON_MAP) ? D().ICON_MAP : {});
    iconPath = iconIndex[itemId] || iconIndex['armor_' + itemId] || iconIndex['jewel_' + itemId] || iconIndex['weapon_' + itemId] || iconIndex[String(itemId).replace(/^(armor_|jewel_|weapon_|shield_|wepoan_)/, '')] || '';
  }
  if (!iconPath) return emoji;
  let p = String(iconPath).replace(/\\/g, '/').replace(/^\//, '');
  if (!p.endsWith('.png') && !p.endsWith('.jpg') && !p.endsWith('.webp') && !p.endsWith('.svg')) p += '.png';
  if (!p.startsWith('img/icons/') && !p.startsWith('img/')) {
    p = `img/icons/${p}`;
  }
  const iconUrl = getAssetUrl(p);
  return `<img src="${iconUrl}" alt="${def?.name || ''}" class="item-icon-img" onerror="this.style.display='none';if(this.nextElementSibling)this.nextElementSibling.style.display='inline-block';" style="width:28px; height:28px; object-fit:contain; vertical-align:middle;" /><span class="item-icon-fallback" style="display:none; font-size:18px;">${emoji}</span>`; 
}


let tooltipTimer = null;

function scheduleHideTooltip() {
  if (tooltipTimer) clearTimeout(tooltipTimer);
  tooltipTimer = setTimeout(() => {
    hideItemTooltip();
  }, 220);
}

function cancelHideTooltip() {
  if (tooltipTimer) {
    clearTimeout(tooltipTimer);
    tooltipTimer = null;
  }
}

function showItemTooltip(arg1, arg2) {
  cancelHideTooltip();
  uiShowItemTooltip(arg1, arg2, state, {
    equipItem: (uid) => equipItem(uid),
    unequipItem: (slot) => unequipItem(slot),
    sellItem: (uid) => sellItem(uid),
    salvageItem: (uid) => salvageItem(uid),
    useItem: (uid) => useItem(uid),
    depositToWarehouse: (uid) => depositToWarehouse(uid),
    withdrawFromWarehouse: (uid) => withdrawFromWarehouse(uid)
  });
}

function hideItemTooltip() { 
  cancelHideTooltip();
  const tt = el('item-tooltip');
  if (tt) tt.style.display = 'none'; 
}

function hideSkillTooltip() {
  hideItemTooltip();
}

function showSkillTooltip(skillId, e) {
  state.selectedSkill = skillId;
  updateSkillInfoPanel();
  cancelHideTooltip();
  const def = SKILL_DEFS[skillId];
  if (!def) return;
  
  const tt = el('item-tooltip');
  if (!tt) return;

  const lvl = state.skills[skillId] || 0;
  const max = def.max;
  const reqs = SKILL_REQS[skillId];
  const reqText = reqs ? Object.entries(reqs).map(([s, v]) => `${SKILL_DEFS[s]?.name || s} ${v}`).join(', ') : 'Nenhum';
  const tier = TIER_NAMES[def.tier] || '';

  tt.innerHTML = `
    <div class="tt-header rarity-epic">
      <span class="tt-icon">${def.icon || '✦'}</span>
      <div class="tt-title">
        <div class="tt-name" style="color:var(--gilt); font-weight:700;">${def.name}</div>
        <div class="tt-slot">${tier} · Lv.${lvl}/${max}</div>
      </div>
    </div>
    <div class="tt-body" style="padding-top:6px;">
      <p class="tt-desc">${def.desc || ''}</p>
      <div class="tt-effect" style="margin-top:6px; color:#f0d080; font-weight:600;">${window.SkillScaling ? window.SkillScaling.buildSkillEffectText(def, lvl) : (def.info || '')}</div>
      <div style="margin-top:6px; font-size:10px; color:#888;">Requisitos: ${reqText} (Lv.${def.reqLvl || 1})</div>
    </div>
  `;

  tt.style.display = 'block';
  tt.style.zIndex = '999999';
  tt.onmouseenter = cancelHideTooltip;
  tt.onmouseleave = scheduleHideTooltip;
}

function updateShopUI() {
  return uiUpdateShopUI(state, {
    buyItem,
    buyMysticItem,
    sellItem: (uid, qty) => serviceSellItem(state, uid, qty, { log, updateAllUI, save }),
    sellAllJunk: () => serviceSellAllJunk(state, { log, updateAllUI, save }),
    buybackItem: (idx) => serviceBuybackItem(state, idx, { log, updateAllUI, save }),
    rerollMysticStock: (rollStockFn) => serviceRerollMysticStock(state, rollStockFn, { log, updateAllUI, save }),
    switchTab: (tabId) => {
      const tabBtn = (ROOT || document).querySelector(`.menu-btn[data-tab="${tabId}"]`);
      if (tabBtn) tabBtn.click();
    }
  });
}
function updateCraftUI() {
  return uiUpdateCraftUI(state, { craftItem });
}


function shopRow(def, id, price, extra = '') {
  const canAfford = state.gold >= price; 
  const statsLine = buildStatLine(def);
  const lockLvl = def.req && def.req.level > state.level; 
  const lockCls = def.classReq && def.classReq !== state.class;
  const lockReason = lockLvl ? `Lv.${def.req.level}` : lockCls ? `Needs ${getClass(def.classReq)?.name}` : '';
  const row = mkEl('div'); 
  row.className = 'shop-item' + (lockLvl || lockCls ? ' locked' : '');

  const isStackable = def.slot === 'consumable' || def.slot === 'scroll' || def.slot === 'powerup' || def.stack;

  let buyActionHtml = '';
  if (isStackable && !lockLvl && !lockCls) {
    buyActionHtml = `
      <div class="shop-bulk-actions">
        <button class="item-action" data-buy="${id}" data-qty="1" ${state.gold < price ? 'disabled' : ''}>1x (${price}g)</button>
        <button class="item-action" data-buy="${id}" data-qty="10" ${state.gold < price * 10 ? 'disabled' : ''}>10x (${(price * 10).toLocaleString()}g)</button>
        <button class="item-action" data-buy="${id}" data-qty="100" ${state.gold < price * 100 ? 'disabled' : ''}>100x (${(price * 100).toLocaleString()}g)</button>
        <button class="item-action" data-buy="${id}" data-qty="1000" ${state.gold < price * 1000 ? 'disabled' : ''}>1000x (${(price * 1000).toLocaleString()}g)</button>
      </div>
    `;
  } else {
    buyActionHtml = `<button class="item-action" data-buy="${id}" data-qty="1" ${(!canAfford || lockLvl || lockCls) ? 'disabled' : ''}>${price.toLocaleString()}g</button>`;
  }

  row.innerHTML = `<div class="item-info"><div class="item-name">${def.name}${def.tier ? ' <span class="tier-tag">T'+def.tier+'</span>' : ''}</div><div class="item-desc">${def.desc || ''}</div>${statsLine ? `<div class="item-stats">${statsLine}</div>` : ''}${lockReason ? `<div class="lock-reason">🔒 ${lockReason}</div>` : ''}</div>${buyActionHtml}${extra}`;
  return row;
}

function buildStatLine(def) {
  const parts = [];
  if (def.atk) parts.push(`⚔${def.atk}`); if (def.matk) parts.push(`✦${def.matk}`); if (def.def) parts.push(`🛡${def.def}`); if (def.mdef) parts.push(`🔷${def.mdef}`); if (def.hp) parts.push(`❤${def.hp}`); if (def.mp) parts.push(`💧${def.mp}`); if (def.eva) parts.push(`🏃${def.eva}`); if (def.crit) parts.push(`💥${def.crit}%`); if (def.lifesteal) parts.push(`🩸${def.lifesteal}%`); if (def.speed) parts.push(`⚡${def.speed}`); if (def.craftBonus) parts.push(`🔨+${Math.round(def.craftBonus*100)}%`); if (def.lootBonus) parts.push(`💰+${Math.round(def.lootBonus*100)}%`);
  return parts.join(' · ');
}

function renderShopGear(list) {
  const zone = ZONES[state.zone], shopId = zone?.shop, items = shopId ? D().SHOP_INVENTORY[shopId] : null;
  if (!items) { list.innerHTML = '<p class="shop-empty">No gear merchant in this area.</p>'; return; }
  let count = 0;
  for (const shopItem of items) { 
    const def = D().ALL_ITEMS[shopItem.id]; 
    if (!def || def.slot === 'consumable' || def.slot === 'scroll' || def.slot === 'powerup' || def.classReq) continue; 
    list.appendChild(shopRow(def, shopItem.id, def.price)); 
    count++; 
  }
  if (!count) list.innerHTML = '<p class="shop-empty">The merchant has no gear for you yet.</p>';
}
function renderShopPotions(list) {
  const zone = ZONES[state.zone], shopId = zone?.shop, items = shopId ? D().SHOP_INVENTORY[shopId] : null;
  const base = ['soulshot_ng','spiritshot_ng','hp_potion_s','hp_potion_m','hp_potion_l','hp_potion_xl','mp_potion_s','mp_potion_m','mp_potion_l','mp_potion_xl','antidote','scroll_of_resurrection','scroll_of_rebirth','spellbook_1star','spellbook_2star','spellbook_3star','spellbook_4star'];
  const shown = new Set(), list2 = [...base, ...(items || []).map(i => i.id)]; let count = 0;
  for (const id of list2) { if (shown.has(id)) continue; const def = D().ALL_ITEMS[id]; if (!def || (def.slot !== 'consumable' && def.slot !== 'scroll') || (def.req && def.req.level > state.level)) continue; shown.add(id); list.appendChild(shopRow(def, id, def.price)); count++; }
  if (!count) list.innerHTML = '<p class="shop-empty">No potions in stock.</p>';
}
function renderShopPowerups(list) {
  const powerupIds = ['xp_boost_1h','xp_boost_4h','gold_boost_1h','gold_boost_4h','luck_boost_1h','auto_potion_1h','teleport_scroll','berserker_elixir','aegis_draught','sages_tea'];
  const activeBuffs = Object.entries(state.buffs || {}).filter(([k,b]) => ['xpBoost','goldBoost','luckBoost','autoPotion'].includes(k) && b.until > Date.now());
  if (activeBuffs.length) {
    const hdr = mkEl('div'); hdr.className = 'shop-header'; hdr.innerHTML = '<h4>Active Powerups</h4>'; list.appendChild(hdr);
    for (const [k, b] of activeBuffs) { const remaining = Math.max(0, b.until - Date.now()); const names = { xpBoost: '📘 XP Boost', goldBoost: '🪙 Gold Boost', luckBoost: '🍀 Luck Boost', autoPotion: '🧪 Auto-Potion' }; const row = mkEl('div'); row.className = 'shop-item active-buff'; row.innerHTML = `<div class="item-info"><div class="item-name">${names[k] || k}</div><div class="item-desc">+${Math.round(b.amount*100)}% · ${fmtCountdown(remaining)}</div></div><div class="buff-pulse"></div>`; list.appendChild(row); }
    const sep = mkEl('div'); sep.className = 'shop-header'; sep.innerHTML = '<h4>Buy More</h4>'; list.appendChild(sep);
  }
  for (const id of powerupIds) { const def = D().ALL_ITEMS[id]; if (def) list.appendChild(shopRow(def, id, def.price)); }
}
function renderShopClass(list) {
  const clsName = state.class ? (getClass(state.class)?.name || state.class) : 'Aventureiro';
  const hdr = mkEl('div'); hdr.className = 'shop-header';
  hdr.innerHTML = `<h4>🎖️ ${clsName} Exclusivos &amp; Avanço de Ordem</h4><p>Equipamentos mestres e emblemas da sua ordem.</p>`;
  list.appendChild(hdr);
  
  let count = 0;
  for (const id of Object.keys(D().ALL_ITEMS)) {
    const def = D().ALL_ITEMS[id];
    if (!def) continue;
    if (def.classReq && def.classReq === state.class) {
      list.appendChild(shopRow(def, id, def.price));
      count++;
    }
  }
  
  // Show high-level class weapons if none available
  if (count === 0) {
    const fallbackClassItems = ['arcane_wand', 'council_staff', 'starfall_staff', 'shadow_fangs', 'wraith_reavers', 'void_talons', 'warlords_plate', 'arcane_vestments'];
    for (const id of fallbackClassItems) {
      const def = D().ALL_ITEMS[id];
      if (def) { list.appendChild(shopRow(def, id, def.price)); count++; }
    }
  }
}

function renderShopMystic(list) {
  const rot = D().getMysticRotation(), hdr = mkEl('div'); hdr.className = 'shop-header mystic-header';
  hdr.innerHTML = `<h4>✦ Relíquias &amp; Tesouros Místicos ✦</h4><p>Ofertas raras e encantos ancestrais. Renovação em <span id="mystic-timer">${fmtCountdown(rot[0]?.msLeft || 0)}</span></p>`;
  list.appendChild(hdr);
  
  for (const pick of rot) {
    const def = D().ALL_ITEMS[pick.id]; if (!def) continue;
    const price = Math.floor((def.price || 500) * D().RARITY[pick.rarity].mult * 2);
    const cloned = D().rollItemWithRarity(pick.id, pick.rarity);
    const canAfford = state.gold >= price;
    const lockLvl = def.req && def.req.level > state.level;
    const lockCls = def.classReq && def.classReq !== state.class;
    const row = mkEl('div');
    row.className = `shop-item rarity-${pick.rarity}` + (lockLvl || lockCls ? ' locked' : '');
    const statsLine = buildStatLine(cloned);
    row.innerHTML = `<div class="item-info"><div class="item-name rarity-${pick.rarity}">${def.name} <span class="rarity-tag">${D().RARITY[pick.rarity].name}</span></div><div class="item-desc">${def.desc || ''}</div>${statsLine ? `<div class="item-stats">${statsLine}</div>` : ''}</div><button class="item-action mystic-buy" data-buy-rarity="${pick.id}" data-rarity="${pick.rarity}" ${(!canAfford || lockLvl || lockCls) ? 'disabled' : ''}>${price.toLocaleString()}g</button>`;
    list.appendChild(row);
  }

  // Mystic Enchant Scrolls & Artifacts
  const mysticArtifacts = ['enchant_weapon_scroll', 'enchant_armor_scroll', 'scroll_of_resurrection', 'teleport_scroll'];
  const sep = mkEl('div'); sep.className = 'shop-header'; sep.innerHTML = '<h4>✦ Pergaminhos Místicos Ancestrais</h4>'; list.appendChild(sep);
  for (const id of mysticArtifacts) {
    const def = D().ALL_ITEMS[id]; if (def) list.appendChild(shopRow(def, id, Math.floor(def.price * 1.2)));
  }
}

function fmtCountdown(ms) { const s = Math.max(0, Math.floor(ms / 1000)), m = Math.floor(s / 60), ss = s % 60; return `${m}:${ss.toString().padStart(2,'0')}`; }

function buyItem(itemId, qty = 1, rarity = 'common') {
  return serviceBuyItem(state, itemId, qty, rarity, { log, updateAllUI, save, classSatisfies });
}

function buyMysticItem(itemId, rarity) {
  return serviceBuyMysticItem(state, itemId, rarity, { log, updateAllUI, save, classSatisfies });
}


// RAID_BOSSES foi movido para src/data/raids.js (Sprint 1)
// Os imports estão no topo do arquivo.


function toggleSoulshot() {
  state.soulshotActive = !state.soulshotActive;
  updateCombatControlsUI();
  log(`Soulshots ${state.soulshotActive ? 'ATIVADOS (Consome soulshots para +100% DANO)' : 'DESATIVADOS'}.`, 'system');
  save();
}

function toggleAutoPotion() {
  state.autoPotionActive = !state.autoPotionActive;
  updateCombatControlsUI();
  log(`Auto-Poção ${state.autoPotionActive ? 'ATIVADA (Bebe poção quando HP < 50%)' : 'DESATIVADA'}.`, 'system');
  save();
}

function toggleCombatSpeed() {
  state.combatSpeed = state.combatSpeed === 1 ? 2 : 1;
  updateCombatControlsUI();
  if (state.combatActive) {
    if (combatInterval) clearInterval(combatInterval);
    combatInterval = setInterval(attackMonster, Math.round(200 / state.combatSpeed));
  }
  log(`Velocidade de combate: ${state.combatSpeed}x ${state.combatSpeed === 2 ? 'TURBO ⏩' : 'Normal'}.`, 'system');
  save();
}

function toggleCombatState() {
  state.isCombatActive = state.isCombatActive === false ? true : false;
  updateCombatControlsUI();
  const isActive = state.isCombatActive !== false;
  log(`Caça Automática **${isActive ? 'RETOMADA ▶️' : 'PAUSADA 🛑'}**.`, 'system');
  if (typeof window !== 'undefined' && window.floatText) {
    window.floatText(isActive ? '▶️ CAÇA RETOMADA' : '🛑 CAÇA PAUSADA', 'float-gold');
  }
  save();
}

function updateCombatControlsUI() {
  const combatBtn = el('combat-toggle-btn');
  if (combatBtn) {
    const isActive = state.isCombatActive !== false;
    combatBtn.classList.toggle('active', isActive);
    combatBtn.textContent = isActive ? '🛑 Parar Caça' : '▶️ Iniciar Caça';
    combatBtn.style.background = isActive ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)';
    combatBtn.style.borderColor = isActive ? '#ef4444' : '#22c55e';
    combatBtn.style.color = isActive ? '#fca5a5' : '#86efac';
  }
  const ssBtn = el('soulshot-toggle-btn');
  if (ssBtn) {
    ssBtn.classList.toggle('active', !!state.soulshotActive);
    const isMage = state.class === 'mage' || state.class === 'soulbreaker';
    const shotId = isMage ? 'spiritshot_ng' : 'soulshot_ng';
    const count = getInventoryCount(shotId);
    ssBtn.textContent = `⚡ Soulshot: ${state.soulshotActive ? 'ON' : 'OFF'} (${count})`;
  }
  const apBtn = el('autopotion-toggle-btn');
  if (apBtn) {
    apBtn.classList.toggle('active', !!state.autoPotionActive);
    const potCount = getInventoryCount('hp_potion_s') + getInventoryCount('hp_potion_m') + getInventoryCount('hp_potion_l') + getInventoryCount('hp_potion_xl');
    apBtn.textContent = `🧪 Auto-Poção: ${state.autoPotionActive ? 'ON' : 'OFF'} (${potCount})`;
  }
  const spdBtn = el('speed-toggle-btn');
  if (spdBtn) {
    spdBtn.classList.toggle('active', state.combatSpeed === 2);
    spdBtn.textContent = `⏩ Velocidade: ${state.combatSpeed || 1}x`;
  }
}

function clearLog() {
  const logEl = el('log');
  if (logEl) {
    logEl.innerHTML = '<p class="log-entry system">Histórico de log limpo.</p>';
  }
}

function setLogFilter(filterType) {
  state.logFilter = filterType;
  qsa('.log-filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.logfilter === filterType);
  });
  const entries = qsa('#log .log-entry');
  entries.forEach(entry => {
    if (filterType === 'all') {
      entry.style.display = 'block';
    } else {
      const cat = entry.dataset.category || resolveLogCategory(entry.className, entry.textContent || '');
      entry.style.display = (cat === filterType) ? 'block' : 'none';
    }
  });

  const logEl = el('log');
  if (logEl) {
    logEl.scrollTop = logEl.scrollHeight;
  }
}

function checkOfflineProgress(lastTime) {
  if (!lastTime) return;
  const val = validateOfflineTime(lastTime);
  if (!val.valid || val.minutesOffline < 1) return;
  
  const minutesOffline = val.minutesOffline;
  const OFFLINE_EFFICIENCY = 0.30; // Auto-Hunt Offline limit de 30%
  const rawKills = minutesOffline * 10;
  const kills = Math.floor(rawKills * OFFLINE_EFFICIENCY);
  const goldEarned = Math.floor(kills * (state.level * 6 + 10));
  const xpEarned = Math.floor(kills * (state.level * 12 + 15));
  const spEarned = Math.floor(kills * (state.level * 4 + 5));
  
  state.gold = Math.max(0, (state.gold || 0) + goldEarned);
  state.xp = Math.max(0, (state.xp || 0) + xpEarned);
  state.sp = Math.max(0, (state.sp || 0) + spEarned);
  checkLevelUp();
  
  const rewardsEl = el('offline-rewards');
  const modalEl = el('offline-modal');
  if (rewardsEl && modalEl) {
    rewardsEl.innerHTML = `
      <div style="color:var(--rarity-epic); font-weight:bold; margin-bottom:8px;">🌙 Eficiência Auto-Hunt Offline: 30% (vs 100% Online)</div>
      <div>⏱️ Tempo Ausente: <strong>${minutesOffline} minutos</strong></div>
      <div>⚔️ Monstros Derrotados (30%): <strong>~${kills}</strong></div>
      <div>💰 Ouro Ganho: <strong style="color:var(--gilt-bright);">+${goldEarned.toLocaleString()}g</strong></div>
      <div>📘 XP Ganho: <strong style="color:#60a5fa;">+${xpEarned.toLocaleString()} XP</strong></div>
      <div>✨ SP Ganho: <strong style="color:#a855f7;">+${spEarned.toLocaleString()} SP</strong></div>
    `;
    modalEl.style.display = 'flex';
    modalEl.classList.add('active');

    const okBtn = el('offline-ok');
    if (okBtn) {
      okBtn.onclick = (e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        closeOfflineModal();
      };
    }
  }
}

function closeOfflineModal() {
  const modalEl = el('offline-modal');
  if (modalEl) {
    modalEl.classList.remove('active');
    modalEl.style.display = 'none';
  }
  updateAllUI();
  save();
}




function renderCraftRecipes() {
  return updateCraftUI();
}

function isEnchantScroll(itemId, isWeapon, isBlessed = false) {
  if (!itemId) return false;
  const id = String(itemId).toLowerCase();
  const matchesBlessed = id.includes('blessed');
  if (isBlessed !== matchesBlessed) return false;

  if (isWeapon) {
    return (id.includes('weapon') || id.includes('armas')) && (id.includes('enchant') || id.includes('scroll') || id.includes('blessed'));
  } else {
    return (id.includes('armor') || id.includes('shield') || id.includes('armadura')) && (id.includes('enchant') || id.includes('scroll') || id.includes('blessed'));
  }
}

function getEnchantScrollCount(isWeapon, isBlessed = false) {
  if (!state.inventory) return 0;
  return state.inventory.reduce((sum, item) => {
    if (isEnchantScroll(item.itemId, isWeapon, isBlessed)) {
      return sum + (item.count || 1);
    }
    return sum;
  }, 0);
}

function findEnchantScrollItem(isWeapon, isBlessed = false) {
  if (!state.inventory) return null;
  return state.inventory.find(item => isEnchantScroll(item.itemId, isWeapon, isBlessed) && (item.count || 1) > 0);
}

function updateEnchantUI() {
  const wsList = [el('enchant-workspace'), el('enchant-workspace-dedicated')].filter(Boolean);
  if (!wsList.length) return;
  
  for (const ws of wsList) {
    ws.innerHTML = '';
    const equippable = state.inventory.filter(i => {
      const def = D().ALL_ITEMS[i.itemId];
      return def && ['weapon','armor','helmet','gloves','boots','shield','legs','ring','necklace','earring','belt','cloak'].includes(def.slot);
    });
    
    if (!equippable.length) {
      ws.innerHTML = '<p class="shop-empty">Você não possui equipamentos na mochila para encantar.</p>';
      continue;
    }

    for (const item of equippable) {
      const def = D().ALL_ITEMS[item.itemId];
      const isWeapon = def.slot === 'weapon';
      const normalCount = getEnchantScrollCount(isWeapon, false);
      const blessedCount = getEnchantScrollCount(isWeapon, true);
      const enchant = item.enchant || 0;
      const rarityColor = item.rarity ? (D().RARITY[item.rarity]?.color || 'var(--gilt)') : 'var(--gilt)';
      
      const card = mkEl('div'); card.className = 'enchant-card';
      const title = (enchant > 0 ? `+${enchant} ` : '') + def.name + (item.rarity ? ` [${D().RARITY[item.rarity]?.name || item.rarity}]` : '');
      const safeMsg = enchant < 3 ? '100% Seguro (Até +3)' : `Sucesso: ${Math.max(30, 100 - (enchant - 3) * 10)}%`;
      
      card.innerHTML = `
        <div class="enchant-card-info">
          <div class="enchant-item-title" style="color:${rarityColor}">${title} ${item.equipped ? '⚡ (EQUIPADO)' : ''}</div>
          <div class="enchant-item-sub">Scroll Normal: ${normalCount}x · Blessed: ${blessedCount}x · ${safeMsg}</div>
        </div>
        <div class="enchant-card-actions" style="display:flex; gap:6px; align-items:center;">
          <button class="item-action" data-enchant="${item.uid}" data-blessed="false" ${normalCount < 1 ? 'disabled title="Sem Pergaminhos Normais"' : ''}>⚡ Normal</button>
          <button class="item-action blessed-btn" data-enchant="${item.uid}" data-blessed="true" style="background:linear-gradient(135deg, #7e22ce, #b45309); color:#fff; border:1px solid #f59e0b; font-weight:bold;" ${blessedCount < 1 ? 'disabled title="Sem Pergaminhos Abençoados (Blessed)"' : ''}>✨ Blessed</button>
        </div>
      `;
      ws.appendChild(card);
    }

    ws.querySelectorAll('[data-enchant]').forEach(btn => {
      btn.onclick = () => enchantItem(btn.dataset.enchant, btn.dataset.blessed === 'true');
    });
  }
}

function enchantItem(uid, useBlessed = false) {
  const item = state.inventory.find(i => i.uid === uid); if (!item) return;
  const def = D().ALL_ITEMS[item.itemId]; if (!def) return;
  const isWeapon = def.slot === 'weapon';
  const scrollItem = findEnchantScrollItem(isWeapon, useBlessed);
  if (!scrollItem) { 
    log(useBlessed ? 'Pergaminho Abençoado (Blessed) necessário!' : 'Pergaminho de encantamento necessário!', 'system'); 
    return; 
  }
  
  if ((scrollItem.count || 1) > 1) {
    scrollItem.count--;
  } else {
    removeFromInventory(scrollItem.uid, 1);
  }

  const currentEnchant = item.enchant || 0;
  const chance = currentEnchant < 3 ? 1.0 : Math.max(0.3, 1.0 - (currentEnchant - 3) * 0.1);
  
  if (Math.random() < chance) {
    item.enchant = currentEnchant + 1;
    log(`✨ ENCHANT SUCCESS! ${def.name} agora está +${item.enchant}!`, 'rarity-legendary');
    if (typeof floatText === 'function') floatText(`✨ +${item.enchant} SUCESSO!`, 'float-jackpot');
  } else {
    if (useBlessed) {
      log(`🛡️ [BLESSED PROTECTED] A tentativa de encanto falhou, mas ${def.name} manteve o nível +${currentEnchant} intacto!`, 'rarity-epic');
      if (typeof floatText === 'function') floatText(`🛡️ PROTEGIDO (+${currentEnchant})`, 'float-jackpot');
    } else {
      item.enchant = Math.max(0, currentEnchant - 1);
      log(`💥 Encantamento falhou! ${def.name} reduziu para +${item.enchant}.`, 'system');
      if (typeof floatText === 'function') floatText(`💥 FALHOU (-1)`, 'float-crit');
    }
  }
  
  updateAllUI(); save();
}

// canCraftRecipe importado do CraftService.js (Sprint 3)


function updateZoneUI() {
  return uiUpdateZoneUI(state, { selectZone });
}
function renderZoneMap() {
  uiRenderZoneMap(state, { selectZone });
  renderZoneInfoCard();
}

function renderZoneInfoCard() {
  const container = el('zone-info-card');
  if (!container) return;
  const zoneId = state.zone || 'talkingIsland';
  const z = ZONES[zoneId];
  if (!z) { container.innerHTML = ''; return; }

  const currentKills = (state.zoneKills && state.zoneKills[zoneId]) || 0;
  const monsterIds = [...(z.monsters || [])];
  if (z.boss && !monsterIds.includes(z.boss)) monsterIds.push(z.boss);

  const monsterHtml = monsterIds.map(mId => {
    const mon = MONSTERS[mId];
    if (!mon) return '';
    const badge = mon.boss ? '<span class="z-badge boss">★ Boss</span>' : (mon.elite ? '<span class="z-badge elite">⚔ Elite</span>' : '');
    const mLvl = mon.lvl || z.level;
    return `
      <div class="z-mon-item">
        <span class="z-mon-name"><span class="z-mon-lvl">Lv.${mLvl}</span> ${mon.name} ${badge}</span>
        <span class="z-mon-stats">❤️ ${mon.hp.toLocaleString()} HP | ⚔️ ${mon.atk} ATK</span>
      </div>
    `;
  }).join('');

  // Drop Items preview
  const equipDrops = (D().MONSTER_DROPS && D().MONSTER_DROPS[zoneId]) || [];
  const matDrops = (D().ZONE_CONSUMABLES && D().ZONE_CONSUMABLES[zoneId]) || [];
  const allDropIds = [...new Set([...equipDrops, ...matDrops])];

  const dropsHtml = allDropIds.map(id => {
    const def = D().ALL_ITEMS ? D().ALL_ITEMS[id] : null;
    if (!def) return '';
    const icon = def.icon ? `<img src="img/items/${def.icon}" class="z-drop-img" onError="this.style.display='none'"/>` : '✦';
    return `<div class="z-drop-pill" title="${def.name}">${icon} <span>${def.name}</span></div>`;
  }).join('');

  container.innerHTML = `
    <div class="z-card-header">
      <div class="z-card-title">
        <h3>🗺️ ${z.name}</h3>
        <span class="z-card-req">Requisito: Lv. ${z.level}</span>
      </div>
      <div class="z-card-kills">⚔️ Caça: ${currentKills}/15 (Chefão)</div>
    </div>

    <div class="z-card-body">
      <div class="z-card-sec">
        <h4>👹 Monstros da Região</h4>
        <div class="z-mon-list">${monsterHtml || '<p class="z-empty">Nenhum monstro registrado.</p>'}</div>
      </div>

      <div class="z-card-sec">
        <h4>🎁 Loot & Drops Possíveis</h4>
        <div class="z-drops-grid">${dropsHtml || '<p class="z-empty">Sem prévia de drops.</p>'}</div>
      </div>
    </div>
  `;
}




function updateRaidUI() {
  const list = el('raid-boss-list'); if (!list) return; list.innerHTML = '';
  for (const [id, boss] of Object.entries(RAID_BOSSES)) {
    const card = mkEl('div'); card.className = 'raid-card';
    const reqOk = state.level >= boss.reqLvl;
    card.innerHTML = `
      <div>
        <div class="raid-card-title">${boss.name}</div>
        <div class="raid-card-desc">${boss.desc} · Lv.${boss.lvl}</div>
      </div>
      <button class="raid-btn" data-raid="${id}" ${!reqOk ? 'disabled' : ''}>${reqOk ? 'Desafiar Raid ⚔️' : `Lv.${boss.reqLvl} Req`}</button>
    `;
    list.appendChild(card);
  }
  list.querySelectorAll('[data-raid]').forEach(btn => {
    btn.onclick = () => startRaidBoss(btn.dataset.raid);
  });
}

function startRaidBoss(raidId) {
  return serviceStartRaidBoss(state, raidId, { log, el, renderStageMonster, attackMonster });
}


function updateRaceClassUI() {
  const display = el('hero-race-class-display');
  if (display) {
    const raceObj = RACES[state.race];
    const clsObj = getClass(state.class);
    const rName = raceObj ? raceObj.name : (state.race || 'Humano');
    const cName = clsObj ? clsObj.name : (state.class || 'Guerreiro');
    display.textContent = `${rName} · ${cName} (Nv. ${state.level})`;
  }
  renderStageHero(); updateSkillUI(); checkClassAdvancement();
}

function updateClock() {
  const now = Date.now();
  const startTime = Number(state.startTime) || now;
  const totalPlaytime = Number(state.totalPlaytime) || 0;
  const elapsed = Math.max(0, Math.floor((now - startTime + totalPlaytime) / 1000));
  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  const _ck = el('clock');
  if (_ck) _ck.textContent = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}

function updateGameModeUI() {
  const switchEl = el('game-mode-switch');
  const currentEl = el('game-mode-current');
  const gameEl = el('game');
  const currentMode = state.gameMode === 'arena' ? 'arena' : 'idle';
  if (currentEl) currentEl.textContent = currentMode === 'arena' ? '3D Arena' : 'Idle';
  if (switchEl) switchEl.classList.toggle('arena', currentMode === 'arena');
  if (gameEl) {
    gameEl.classList.remove('mode-idle', 'mode-arena');
    gameEl.classList.add(`mode-${currentMode}`);
  }
  qsa('.mode-option').forEach(btn => {
    const active = btn.dataset.mode === currentMode;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
}

function setGameMode(mode) {
  const nextMode = mode === 'arena' ? 'arena' : 'idle';
  state.gameMode = nextMode;
  updateGameModeUI();
  log(`Modo de jogo alterado para ${nextMode === 'arena' ? '⚔ 3D Arena' : '📜 Idle Chronicle'}.`, 'system');
  save();
  if (typeof window !== 'undefined' && typeof window.onReactSetMode === 'function') {
    window.onReactSetMode(nextMode);
  }
}

function closeGameModeMenu() {
  const switchEl = el('game-mode-switch');
  if (switchEl) {
    switchEl.classList.remove('open');
    switchEl.setAttribute('aria-expanded', 'false');
  }
}

function toggleGameModeMenu() {
  const switchEl = el('game-mode-switch');
  if (!switchEl) return;
  const willOpen = !switchEl.classList.contains('open');
  switchEl.classList.toggle('open', willOpen);
  switchEl.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
}

// Inicializa listeners do Seletor de Modo 3D / Idle (uma única vez no carregamento)
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    const switchEl = el('game-mode-switch');
    if (switchEl) {
      switchEl.onclick = (e) => {
        e.stopPropagation();
        toggleGameModeMenu();
      };
    }

    qsa('.mode-option').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const targetMode = btn.dataset.mode || 'idle';
        setGameMode(targetMode);
        closeGameModeMenu();
      };
    });

    document.addEventListener('click', (e) => {
      const switchEl = el('game-mode-switch');
      if (switchEl && switchEl.classList.contains('open') && !switchEl.contains(e.target)) {
        closeGameModeMenu();
      }
    });
  });
}

// QUEST_DEFS, BATTLE_PASS_TIERS e PASS_DEFS foram movidos para src/data/quests.js (Sprint 1)
// Os imports estão no topo do arquivo.


function checkQuestResets() {
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const ONE_WEEK = 7 * ONE_DAY;

  if (!state.quests) {
    state.quests = { progress: {}, claimed: [], lastDailyReset: now, lastWeeklyReset: now };
  }
  if (!state.quests.progress) state.quests.progress = {};
  if (!state.quests.claimed) state.quests.claimed = [];

  if (!state.quests.lastDailyReset || (now - state.quests.lastDailyReset) >= ONE_DAY) {
    state.quests.lastDailyReset = now;
    QUEST_DEFS.daily.forEach(q => {
      delete state.quests.progress[q.id];
      state.quests.claimed = state.quests.claimed.filter(id => id !== q.id);
    });
    log('📜 Missões Diárias foram renovadas!', 'rarity-legendary');
  }

  if (!state.quests.lastWeeklyReset || (now - state.quests.lastWeeklyReset) >= ONE_WEEK) {
    state.quests.lastWeeklyReset = now;
    QUEST_DEFS.weekly.forEach(q => {
      delete state.quests.progress[q.id];
      state.quests.claimed = state.quests.claimed.filter(id => id !== q.id);
    });
    log('📅 Missões Semanais foram renovadas!', 'rarity-legendary');
  }
}

// PASS_DEFS imported from src/data/quests.js

function checkDailyReset() { checkQuestResets(); }
function checkQuestProgress(type, count = 1) { triggerQuestEvent(type, count); }

function triggerQuestEvent(type, amount = 1) {
  serviceTriggerQuestEvent(state, type, amount);
  safeUiUpdate('quests', updateQuestsUI);
}
function claimQuestReward(questId) {
  return serviceClaimQuestReward(state, questId, { log, floatText, updateAllUI, save });
}
function claimPassReward(level, type = 'free') {
  return serviceClaimPassReward(state, level, type, { log, floatText, updateAllUI, save });
}
function unlockPremiumPass() {
  return serviceUnlockPremiumPass(state, { log, floatText, updateAllUI, save });
}


function updateQuestsUI() {
  checkQuestResets();

  const dailyContainer = el('daily-quests-list');
  const weeklyContainer = el('weekly-quests-list');
  const dailyBadge = el('daily-progress-badge');
  const weeklyBadge = el('weekly-progress-badge');

  if (dailyContainer) {
    let dailyClaimedCount = 0;
    dailyContainer.innerHTML = QUEST_DEFS.daily.map(q => {
      const progress = Math.min(q.target, state.quests.progress[q.id] || 0);
      const isCompleted = progress >= q.target;
      const isClaimed = state.quests.claimed.includes(q.id);
      if (isClaimed) dailyClaimedCount++;

      const pct = Math.floor((progress / q.target) * 100);
      const cardClass = isClaimed ? 'quest-card completed' : (isCompleted ? 'quest-card can-claim' : 'quest-card');

      const rewardsText = [];
      if (q.reward.gold) rewardsText.push(`💰 +${q.reward.gold.toLocaleString()}g`);
      if (q.reward.sp) rewardsText.push(`✦ +${q.reward.sp} SP`);
      if (q.reward.craftPoints) rewardsText.push(`⚒️ +${q.reward.craftPoints} Craft`);
      if (q.reward.magicLamps) rewardsText.push(`🪔 +${q.reward.magicLamps} Lâmpada`);
      if (q.reward.passXp) rewardsText.push(`🎫 +${q.reward.passXp} XP Passe`);

      const btnLabel = isClaimed ? '✓ Reclamado' : (isCompleted ? '🎁 Reclamar' : 'Em Progresso');
      const btnDisabled = !isCompleted || isClaimed ? 'disabled' : '';

      return `
        <div class="${cardClass}">
          <div class="quest-info-group">
            <span class="quest-icon">${q.icon}</span>
            <div class="quest-details">
              <span class="quest-name">${q.name}</span>
              <span class="quest-desc">${q.desc}</span>
              <div class="quest-rewards-line">${rewardsText.join(' · ')}</div>
            </div>
          </div>
          <div class="quest-action-group">
            <span class="quest-progress-num">${progress.toLocaleString()} / ${q.target.toLocaleString()} (${pct}%)</span>
            <button class="claim-quest-btn" data-quest="${q.id}" ${btnDisabled}>${btnLabel}</button>
          </div>
        </div>
      `;
    }).join('');

    if (dailyBadge) dailyBadge.textContent = `${dailyClaimedCount}/${QUEST_DEFS.daily.length} Concluídas`;

    dailyContainer.querySelectorAll('[data-quest]').forEach(btn => {
      btn.onclick = () => claimQuestReward(btn.dataset.quest);
    });
  }

  if (weeklyContainer) {
    let weeklyClaimedCount = 0;
    weeklyContainer.innerHTML = QUEST_DEFS.weekly.map(q => {
      const progress = Math.min(q.target, state.quests.progress[q.id] || 0);
      const isCompleted = progress >= q.target;
      const isClaimed = state.quests.claimed.includes(q.id);
      if (isClaimed) weeklyClaimedCount++;

      const pct = Math.floor((progress / q.target) * 100);
      const cardClass = isClaimed ? 'quest-card completed' : (isCompleted ? 'quest-card can-claim' : 'quest-card');

      const rewardsText = [];
      if (q.reward.gold) rewardsText.push(`💰 +${q.reward.gold.toLocaleString()}g`);
      if (q.reward.sp) rewardsText.push(`✦ +${q.reward.sp} SP`);
      if (q.reward.magicLamps) rewardsText.push(`🪔 +${q.reward.magicLamps} Lâmpadas`);
      if (q.reward.passXp) rewardsText.push(`🎫 +${q.reward.passXp} XP Passe`);

      const btnLabel = isClaimed ? '✓ Reclamado' : (isCompleted ? '🎁 Reclamar' : 'Em Progresso');
      const btnDisabled = !isCompleted || isClaimed ? 'disabled' : '';

      return `
        <div class="${cardClass}">
          <div class="quest-info-group">
            <span class="quest-icon">${q.icon}</span>
            <div class="quest-details">
              <span class="quest-name">${q.name}</span>
              <span class="quest-desc">${q.desc}</span>
              <div class="quest-rewards-line">${rewardsText.join(' · ')}</div>
            </div>
          </div>
          <div class="quest-action-group">
            <span class="quest-progress-num">${progress.toLocaleString()} / ${q.target.toLocaleString()} (${pct}%)</span>
            <button class="claim-quest-btn" data-quest="${q.id}" ${btnDisabled}>${btnLabel}</button>
          </div>
        </div>
      `;
    }).join('');

    if (weeklyBadge) weeklyBadge.textContent = `${weeklyClaimedCount}/${QUEST_DEFS.weekly.length} Concluídas`;

    weeklyContainer.querySelectorAll('[data-quest]').forEach(btn => {
      btn.onclick = () => claimQuestReward(btn.dataset.quest);
    });
  }

  renderBattlePassUI();
}

function renderBattlePassUI() {
  if (!state.battlePass) state.battlePass = { xp: 0, claimedFree: [], claimedPremium: [], unlockedPremium: false };

  const currentXp = state.battlePass.xp || 0;
  let currentLvl = 1;
  let currentTier = BATTLE_PASS_TIERS[0];
  for (let i = BATTLE_PASS_TIERS.length - 1; i >= 0; i--) {
    if (currentXp >= BATTLE_PASS_TIERS[i].reqXp) {
      currentLvl = BATTLE_PASS_TIERS[i].level;
      currentTier = BATTLE_PASS_TIERS[i];
      break;
    }
  }

  const nextTierIndex = BATTLE_PASS_TIERS.findIndex(t => t.level === currentLvl + 1);
  const nextReqXp = nextTierIndex !== -1 ? BATTLE_PASS_TIERS[nextTierIndex].reqXp : currentTier.reqXp;
  const prevReqXp = currentTier.reqXp;
  const pct = nextTierIndex !== -1 ? Math.min(100, Math.floor(((currentXp - prevReqXp) / Math.max(1, nextReqXp - prevReqXp)) * 100)) : 100;

  const lvlText = el('pass-level-text');
  if (lvlText) lvlText.textContent = `Nível ${currentLvl}`;

  const statusText = el('pass-status-text');
  if (statusText) statusText.textContent = state.battlePass.unlockedPremium ? '👑 Passe Premium Ativo' : 'Passe de Batalha Grátis';

  const xpText = el('pass-xp-text');
  if (xpText) xpText.textContent = `${currentXp.toLocaleString()} / ${nextReqXp.toLocaleString()} XP do Passe`;

  const xpBar = el('pass-xp-bar');
  if (xpBar) xpBar.style.width = `${pct}%`;

  const unlockBtn = el('unlock-premium-pass-btn');
  if (unlockBtn) {
    if (state.battlePass.unlockedPremium) {
      unlockBtn.textContent = '👑 Passe Premium Ativo';
      unlockBtn.disabled = true;
      unlockBtn.style.opacity = '0.7';
    } else {
      unlockBtn.textContent = '👑 Ativar Passe Premium (100.000g)';
      unlockBtn.disabled = false;
      unlockBtn.onclick = () => unlockPremiumPass();
    }
  }

  const trackList = el('pass-track-list');
  if (trackList) {
    trackList.innerHTML = BATTLE_PASS_TIERS.map(tier => {
      const isUnlocked = currentXp >= tier.reqXp;
      const freeClaimed = state.battlePass.claimedFree.includes(tier.level);
      const premClaimed = state.battlePass.claimedPremium.includes(tier.level);

      const freeLabel = freeClaimed ? '✓' : (isUnlocked ? 'Reclamar' : 'Tranca');
      const premLabel = premClaimed ? '✓' : (isUnlocked && state.battlePass.unlockedPremium ? 'Reclamar' : (state.battlePass.unlockedPremium ? 'Tranca' : '👑 Premium'));

      const freeRewardStr = Object.entries(tier.free).map(([k, v]) => `${k === 'gold' ? '💰 ' + v : k === 'sp' ? '✦ ' + v : v}`).join(', ');
      const premRewardStr = Object.entries(tier.premium).map(([k, v]) => `${k === 'gold' ? '💰 ' + v : k === 'title' ? '🏷️ ' + v : v}`).join(', ');

      return `
        <div class="pass-tier-card ${isUnlocked ? 'unlocked' : ''}">
          <span class="pass-tier-lvl">Nv. ${tier.level}</span>
          <div class="pass-reward-box">
            <span style="font-weight:bold;color:var(--gilt);">Grátis</span><br/>
            <span>${freeRewardStr}</span><br/>
            <button class="inv-batch-btn" data-pass-free="${tier.level}" ${!isUnlocked || freeClaimed ? 'disabled' : ''} style="margin-top:4px;font-size:9px;">${freeLabel}</button>
          </div>
          <div class="pass-reward-box premium">
            <span style="font-weight:bold;color:#fef08a;">👑 Premium</span><br/>
            <span>${premRewardStr}</span><br/>
            <button class="inv-batch-btn gold-glow-btn" data-pass-prem="${tier.level}" ${!isUnlocked || !state.battlePass.unlockedPremium || premClaimed ? 'disabled' : ''} style="margin-top:4px;font-size:9px;">${premLabel}</button>
          </div>
        </div>
      `;
    }).join('');

    trackList.querySelectorAll('[data-pass-free]').forEach(btn => {
      btn.onclick = () => claimPassReward(Number(btn.dataset.passFree), 'free');
    });
    trackList.querySelectorAll('[data-pass-prem]').forEach(btn => {
      btn.onclick = () => claimPassReward(Number(btn.dataset.passPrem), 'premium');
    });
  }
}

// --------------------------- TOWER OF INSOLENCE ---------------------------
function getTowerFloorDef(floorNum) { return serviceGetTowerFloorDef(floorNum); }
function challengeTowerFloor() {
  return serviceChallengeTowerFloor(state, { log, floatText, el, renderStageMonster, attackMonster });
}
function onTowerFloorVictory(floorNum) {
  return serviceCompleteTowerFloor(state, floorNum, { log, floatText, updateAllUI, save });
}
function sweepTowerDaily() {
  return serviceSweepTowerDaily(state, { log, floatText, updateAllUI, save });
}


function updateTowerUI() {
  if (!state.tower) state.tower = { highestFloor: 0, currentFloor: 1, lastSweepTime: 0 };
  const highest = state.tower.highestFloor || 0;
  const nextFloor = Math.min(100, highest + 1);

  const highestText = el('tower-highest-floor-text');
  if (highestText) highestText.textContent = `Andar Atual: ${highest} / 100`;

  const bonusText = el('tower-bonus-text');
  if (bonusText) bonusText.textContent = `Bônus Passivo Ativo: +${highest}% ATK, DEF & MATK`;

  const nextNumText = el('tower-next-floor-num');
  if (nextNumText) nextNumText.textContent = `${nextFloor}`;

  const challengeBtn = el('tower-challenge-btn');
  if (challengeBtn) {
    if (highest >= 100) {
      challengeBtn.textContent = '🏆 Torre 100% Concluída';
      challengeBtn.disabled = true;
    } else {
      challengeBtn.textContent = `⚔️ Desafiar Andar ${nextFloor}`;
      challengeBtn.disabled = false;
      challengeBtn.onclick = () => challengeTowerFloor();
    }
  }

  const sweepBtn = el('tower-sweep-btn');
  if (sweepBtn) {
    const now = Date.now();
    const isSweepAvailable = highest >= 1 && (!state.tower.lastSweepTime || (now - state.tower.lastSweepTime) >= (24 * 60 * 60 * 1000));
    sweepBtn.disabled = !isSweepAvailable;
    sweepBtn.onclick = () => sweepTowerDaily();
  }

  const nextDef = getTowerFloorDef(nextFloor);
  const recommendEl = el('tower-floor-recommend');
  if (recommendEl) recommendEl.textContent = `Lv. Requerido: ${nextDef.reqLvl}`;

  const detailsCard = el('tower-floor-details-card');
  if (detailsCard) {
    const rewardsStr = [];
    rewardsStr.push(`💰 +${nextDef.gold.toLocaleString()}g`);
    rewardsStr.push(`✦ +${nextDef.sp} SP`);
    if (nextDef.rewardLamps > 0) rewardsStr.push(`🪔 +${nextDef.rewardLamps} Lâmpadas`);
    if (nextDef.rewardCrystals) rewardsStr.push(`✨ +3x ${D().ALL_ITEMS[nextDef.rewardCrystals]?.name || nextDef.rewardCrystals}`);

    detailsCard.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-weight:bold; font-size:13px; color:var(--gilt-bright);">${nextDef.name}</span>
        <span style="font-size:11px; color:#fb7185;">HP: ${nextDef.hp.toLocaleString()} · ATK: ${nextDef.atk.toLocaleString()}</span>
      </div>
      <div style="font-size:11px; color:var(--text-muted); margin-top:4px;">Recompensas de Primeiro Abate: ${rewardsStr.join(' · ')}</div>
    `;
  }

  const grid = el('tower-floors-grid');
  if (grid) {
    let html = '';
    for (let f = 1; f <= 100; f++) {
      const isCleared = f <= highest;
      const isCurrent = f === nextFloor;
      const isBoss = f % 10 === 0;

      let cls = 'tower-floor-pill';
      if (isCleared) cls += ' cleared';
      else if (isCurrent) cls += ' current';
      if (isBoss) cls += ' boss-floor';

      html += `<div class="${cls}"><span>${isBoss ? '👑' : '🏰'} Andar ${f}</span><span style="font-size:9px;opacity:0.8;">${isCleared ? '✓ Cleared' : (isCurrent ? '★ Desafio' : `Nv.${getTowerFloorDef(f).reqLvl}`)}</span></div>`;
    }
    grid.innerHTML = html;
  }
}

function hasEquipmentUpgradeAvailable() {
  if (!state.inventory) return false;
  for (const item of state.inventory) {
    if (item.equipped) continue;
    const def = D().ALL_ITEMS[item.itemId];
    if (!def) continue;
    const slot = resolveEquipSlot(def.slot);
    if (!slot || !ALL_EQUIP_SLOTS.includes(slot)) continue;
    const equippedUid = state.equipment[slot];
    const equippedItem = equippedUid ? state.inventory.find(i => i.uid === equippedUid) : null;
    const equippedDef = equippedItem ? D().ALL_ITEMS[equippedItem.itemId] : null;
    const itemPower = (def.stats?.atk || 0) + (def.stats?.def || 0) + (def.stats?.matk || 0) + (def.stats?.mdef || 0);
    const eqPower = equippedDef ? ((equippedDef.stats?.atk || 0) + (equippedDef.stats?.def || 0) + (equippedDef.stats?.matk || 0) + (equippedDef.stats?.mdef || 0)) : 0;
    if (itemPower > eqPower) return true;
  }
  return false;
}

function hasSkillUpgradeAvailable() {
  if (state.sp < 10) return false;
  for (const [sId, def] of Object.entries(SKILL_DEFS)) {
    if (!classSatisfies(state.class, def.classReq)) continue;
    const lvl = state.skills[sId] || 0;
    const maxLvl = def.max || 10;
    if (lvl >= maxLvl) continue;
    const cost = getSkillCost(sId, lvl);
    if (state.sp >= cost) return true;
  }
  return false;
}

function hasCraftAvailable() {
  const recipesData = D().CRAFTING_RECIPES;
  if (!recipesData) return false;
  const recipesList = Array.isArray(recipesData) ? recipesData : Object.values(recipesData);
  for (const recipe of recipesList) {
    if (!recipe) continue;
    const mats = getRecipeMaterials(recipe);
    if (mats.length === 0) continue;
    let canCraftThis = true;
    for (const { matId, qty } of mats) {
      if (getInventoryCount(matId) < qty) {
        canCraftThis = false;
        break;
      }
    }
    if (canCraftThis) return true;
  }
  return false;
}

function hasQuestsClaimable() {
  if (!state.quests || !state.quests.progress) return false;
  if (typeof QUEST_DEFS === 'undefined') return false;
  const allQuests = [...(QUEST_DEFS.daily || []), ...(QUEST_DEFS.weekly || [])];
  for (const qDef of allQuests) {
    if (state.quests.claimed && state.quests.claimed.includes(qDef.id)) continue;
    const current = state.quests.progress[qDef.id] || 0;
    if (current >= qDef.target) return true;
  }
  return false;
}

function updateTabBadgesUI() {
  const invBadge = el('tab-badge-inventory');
  if (invBadge) invBadge.style.display = hasEquipmentUpgradeAvailable() ? 'inline-flex' : 'none';
  
  const skillBadge = el('tab-badge-skills');
  if (skillBadge) skillBadge.style.display = hasSkillUpgradeAvailable() ? 'inline-flex' : 'none';
  
  const craftBadge = el('tab-badge-craft');
  if (craftBadge) craftBadge.style.display = hasCraftAvailable() ? 'inline-flex' : 'none';
  
  const questBadge = el('tab-badge-quests');
  if (questBadge) questBadge.style.display = hasQuestsClaimable() ? 'inline-flex' : 'none';
}

function updateAlchemyUI() {
  uiRenderAlchemyUI(state);
}

function updateAstralUI() {
  uiRenderAstralMasteryUI(state);
}

function updateExpeditionsUI() {
  uiRenderExpeditionsUI(state);
}

function updateRaidsUI() {
  const pane = el('tab-raids');
  if (pane) uiRenderRaidsTab(pane, state);
}

function updateOlympiadUI() {
  const pane = el('tab-olympiad');
  if (pane) uiRenderOlympiadTab(pane, state);
}

function updateClanUI() {
  const pane = el('tab-clan');
  if (pane) uiRenderClanTab(pane, state);
}

function updateSevenSignsUI() {
  const pane = el('tab-sevensigns');
  if (pane) uiRenderSevenSignsTab(pane, state);
}

function updateFortressUI() {
  const pane = el('tab-fortress');
  if (pane) uiRenderFortressTab(pane, state);
}

function updateColosseumUI() {
  const pane = el('tab-colosseum');
  if (pane) uiRenderColosseumTab(pane, state);
}

function updateRankingsUI() {
  const pane = el('tab-rankings');
  if (pane) uiRenderRankingTab(pane, state);
}

let _uiUpdateRafId = null;
function updateAllUI(immediate = false) {
  // 1. Atualizações instantâneas e leves de números para feedback imediato ao clique
  try {
    const root = ROOT || (typeof document !== 'undefined' ? document : null);
    if (root) {
      const g1 = root.querySelector('#gold-count'); if (g1) g1.textContent = (state.gold || 0).toLocaleString();
      const g2 = root.querySelector('#shop-gold'); if (g2) g2.textContent = (state.gold || 0).toLocaleString();
      const spEl = root.querySelector('#sp-count'); if (spEl) spEl.textContent = (state.sp || 0).toLocaleString();
    }
  } catch (e) {}

  // 2. Se for update imediato (ex: troca de aba ou inicialização), executa agora
  if (immediate) {
    if (_uiUpdateRafId) {
      if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(_uiUpdateRafId);
      _uiUpdateRafId = null;
    }
    _performFullUIUpdate();
    return;
  }

  // 3. Batching via requestAnimationFrame: se já há uma renderização agendada, não enfileira outra
  if (_uiUpdateRafId) return;

  const scheduleFn = (typeof requestAnimationFrame === 'function')
    ? requestAnimationFrame
    : (cb) => setTimeout(cb, 16);

  _uiUpdateRafId = scheduleFn(() => {
    _uiUpdateRafId = null;
    _performFullUIUpdate();
  });
}

function _performFullUIUpdate() {
  state = getState();
  uiInitTooltipEvents();
  updateGameModeUI();
  try { FortressService.updateProductionTick(state); } catch (e) {}

  // Fast core components (always update on action)
  safeUiUpdate('stats', updateStatsUI);
  safeUiUpdate('equipment', updateEquipmentUI);
  safeUiUpdate('inventory', updateInventoryUI);
  safeUiUpdate('equip-stats', updateDetailedEquipStatsUI);
  safeUiUpdate('character', updateCharacterUI);
  safeUiUpdate('combat-controls', updateCombatControlsUI);
  safeUiUpdate('tab-badges', updateTabBadgesUI);
  safeUiUpdate('class-advancement', checkClassAdvancement);

  // Tab-specific heavy updates (only rendered if tab is currently active/visible)
  const isTabVisible = (panelId) => {
    const root = ROOT || (typeof document !== 'undefined' ? document : null);
    if (!root) return false;
    const pane = root.querySelector(`#tab-${panelId}, [data-menu-panel="${panelId}"], .tab-${panelId}, [data-tab-content="${panelId}"]`);
    if (!pane) return false;
    return pane.classList.contains('active') || pane.classList.contains('is-active') || (!pane.hidden && pane.offsetWidth > 0);
  };

  if (isTabVisible('skills')) safeUiUpdate('skills', updateSkillUI);
  if (isTabVisible('shop')) safeUiUpdate('shop', updateShopUI);
  if (isTabVisible('craft')) safeUiUpdate('craft', updateCraftUI);
  if (isTabVisible('alchemy')) safeUiUpdate('alchemy', updateAlchemyUI);
  if (isTabVisible('astral')) safeUiUpdate('astral', updateAstralUI);
  if (isTabVisible('expeditions')) safeUiUpdate('expeditions', updateExpeditionsUI);
  if (isTabVisible('raids')) safeUiUpdate('raids', updateRaidsUI);
  if (isTabVisible('olympiad')) safeUiUpdate('olympiad', updateOlympiadUI);
  if (isTabVisible('clan')) safeUiUpdate('clan', updateClanUI);
  if (isTabVisible('sevensigns')) safeUiUpdate('sevensigns', updateSevenSignsUI);
  if (isTabVisible('fortress')) safeUiUpdate('fortress', updateFortressUI);
  if (isTabVisible('colosseum')) safeUiUpdate('colosseum', updateColosseumUI);
  if (isTabVisible('rankings')) safeUiUpdate('rankings', updateRankingsUI);
  if (isTabVisible('stage') || isTabVisible('zone') || isTabVisible('zones')) {
    safeUiUpdate('zone-bg', updateZoneBackground);
    safeUiUpdate('zone', updateZoneUI);
    safeUiUpdate('zone-map', renderZoneMap);
  }
  if (isTabVisible('race-class')) safeUiUpdate('race-class', updateRaceClassUI);
  if (isTabVisible('subclasses')) safeUiUpdate('subclasses', renderSubclassesUI);
  if (isTabVisible('quests')) safeUiUpdate('quests', updateQuestsUI);
  if (isTabVisible('tower')) safeUiUpdate('tower', updateTowerUI);
  if (isTabVisible('warehouse')) safeUiUpdate('warehouse', updateWarehouseUI);

  setupVfxQualityControl();
}

function completeFateWhisperQuest() {
  const activeMainLevel = state.activeSubclassIndex === null ? state.level : (state.mainClassData?.level || 1);
  if (activeMainLevel < 52) {
    log('⚠️ Requer Nível 52 na Classe Principal para completar a Quest Fate\'s Whisper!', 'warning');
    return false;
  }
  state.fateWhisperQuest = true;
  log('📜 QUEST FATE\'S WHISPER CONCLUÍDA! Subclasses desbloqueadas!', 'rarity-legendary');
  floatText('SUBCLASSES DESBLOQUEADAS!', 'float-gold');
  updateAllUI(); save();
  return true;
}

function selectMasterAbilityModal() {
  const abilities = [
    { key: 'boostHp', name: '❤️ Boost HP (+8% HP, +20% HP Regen)' },
    { key: 'boostMp', name: '💙 Boost MP (+12% MP, +20% MP Regen)' },
    { key: 'evasion', name: '👟 Evasion (+5 Esquiva)' },
    { key: 'haste', name: '⚡ Haste Proc (+32% Atk.Spd)' },
    { key: 'barrier', name: '🌟 Barrier (Celestial Shield Invencível)' },
    { key: 'boostCp', name: '🛡️ Boost CP (+20% CP)' },
    { key: 'resistAttribute', name: '🔥 Resist Attribute (+20 Res. Elementais)' }
  ];

  const choice = prompt(`Escolha sua Habilidade Mestra (Master Ability Lv.75):\n\n${abilities.map((a, i) => `${i + 1}. ${a.name}`).join('\n')}\n\nDigite o número desejado:`);
  if (!choice) return;
  const idx = parseInt(choice, 10) - 1;
  if (isNaN(idx) || idx < 0 || idx >= abilities.length) return;

  const selectedKey = abilities[idx].key;
  if (!state.masterAbilities) state.masterAbilities = [];
  if (!state.masterAbilities.includes(selectedKey)) {
    state.masterAbilities.push(selectedKey);
  }
  log(`🏆 HABILIDADE MESTRA **${abilities[idx].name.toUpperCase()}** APRENDIDA!`, 'rarity-legendary');
  floatText('MASTER ABILITY APRENDIDA!', 'float-gold');
  updateAllUI(); save();
}

function selectDivineTransformationModal() {
  const transList = [
    { key: 'divineWarrior', name: '⚔️ Divine Warrior (War Cry +25% P.Atk, Sonic Blaster)' },
    { key: 'divineKnight', name: '🛡️ Divine Knight (Ultimate Defence +100% Def, Hate Aura)' },
    { key: 'divineRogue', name: '🗡️ Divine Rogue (Stun Shot, Double Shot, +4 Eva)' },
    { key: 'divineWizard', name: '🔮 Divine Wizard (Divine Flare, Divine Strike, Sleep AoE)' },
    { key: 'divineSummoner', name: '🦄 Divine Summoner (Transfer Pain, Final Servitor)' },
    { key: 'divineHealer', name: '🕊️ Divine Healer (Major Heal, Cleanse, Ress 70%)' },
    { key: 'divineEnchanter', name: '📜 Divine Enchanter (Chant of Victory +10% Stats)' }
  ];

  const choice = prompt(`Escolha sua Transformação Divina (Divine Transformation Lv.80):\n\n${transList.map((t, i) => `${i + 1}. ${t.name}`).join('\n')}\n\nDigite o número desejado:`);
  if (!choice) return;
  const idx = parseInt(choice, 10) - 1;
  if (isNaN(idx) || idx < 0 || idx >= transList.length) return;

  const selectedKey = transList[idx].key;
  state.activeTransformation = (state.activeTransformation === selectedKey) ? null : selectedKey;

  log(`👼 TRANSFORMAÇÃO DIVINA **${transList[idx].name.toUpperCase()}** ${state.activeTransformation ? 'ATIVADA' : 'DESATIVADA'}!`, 'rarity-legendary');
  floatText('TRANSFORMAÇÃO DIVINA!', 'float-gold');
  updateAllUI(); save();
}

function renderSubclassesUI() {
  const container = el('subclass-list-container'); if (!container) return;
  const summaryEl = el('certifications-summary');
  const countBadge = el('subclass-count-badge');
  const addBtn = el('add-subclass-btn');
  const cpBadge = el('cert-total-cp-badge');

  const activeMainLevel = state.activeSubclassIndex === null ? state.level : (state.mainClassData?.level || 1);
  if (countBadge) {
    countBadge.textContent = `Subclasses (${(state.subclasses || []).length}/3)`;
  }

  if (addBtn) {
    const isUnlocked = state.fateWhisperQuest || activeMainLevel >= 52;
    const isMax = (state.subclasses || []).length >= 3;
    addBtn.disabled = !isUnlocked || isMax;
    addBtn.textContent = isMax ? '🔒 Limite Máximo Atingido (3/3 Subclasses)' : (!isUnlocked ? '🔒 Conclua Quest Fate\'s Whisper (Lv.52)' : '➕ Adicionar Nova Subclasse (Sem Restrição Racial)');
    addBtn.onclick = () => {
      if (!state.fateWhisperQuest && activeMainLevel < 52) {
        log('Requer Nível 52+ para iniciar a jornada de Subclasses.', 'system');
      } else if (!state.fateWhisperQuest) {
        completeFateWhisperQuest();
      } else {
        openAddSubclassModal();
      }
    };
  }

  container.innerHTML = '';

  // 1. Card da Classe Principal (Main Class)
  const mainClassId = state.activeSubclassIndex === null ? state.class : (state.mainClassData?.class || 'fighter');
  const isMainActive = state.activeSubclassIndex === null;
  const mainClassDef = getClass(mainClassId);

  const mainCard = mkEl('div');
  mainCard.style.cssText = `border: 1px solid ${isMainActive ? 'var(--gilt-bright)' : 'var(--line)'}; padding: 12px; border-radius: 8px; background: ${isMainActive ? 'rgba(138,106,36,0.25)' : 'rgba(15,20,30,0.8)'}; display:flex; justify-content:space-between; align-items:center; box-shadow:0 2px 8px rgba(0,0,0,0.5);`;
  mainCard.innerHTML = `
    <div>
      <div style="font-weight:bold; color:${isMainActive ? 'var(--gilt-bright)' : 'var(--bone)'}; font-size:13px; display:flex; align-items:center; gap:6px;">
        <span>👑 Classe Principal:</span>
        <span style="color:#fde047;">${mainClassDef?.name || mainClassId}</span>
        <span style="color:#60a5fa; font-size:11px; background:rgba(96,165,250,0.15); padding:1px 6px; border-radius:4px;">Lv.${activeMainLevel}</span>
      </div>
      <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">Origem primária — Todas as certificações das subclasses acumulam bônus permanentes aqui.</div>
    </div>
    <button class="action-btn" style="padding:6px 12px; font-size:11px;" ${isMainActive ? 'disabled' : ''} onclick="switchSubclass(null)">
      ${isMainActive ? '✓ Em Uso' : 'Alternar 👑'}
    </button>
  `;
  container.appendChild(mainCard);

  // 2. Cards das Subclasses do Jogador
  (state.subclasses || []).forEach((sub, idx) => {
    const isSubActive = state.activeSubclassIndex === idx;
    const subClassDef = getClass(sub.classId);
    const archetype = SubclassCertificationService.getArchetypeForClass(sub.classId);
    const milestones = SubclassCertificationService.getSubclassMilestones(state, sub.id);

    const card = mkEl('div');
    card.style.cssText = `border: 1px solid ${isSubActive ? '#10b981' : 'var(--line)'}; padding: 12px; border-radius: 8px; background: ${isSubActive ? 'rgba(16,185,129,0.15)' : 'rgba(15,20,30,0.85)'}; display:flex; flex-direction:column; gap:8px; box-shadow:0 2px 8px rgba(0,0,0,0.5);`;

    let milestoneSlotsHtml = '';
    milestones.forEach(m => {
      if (m.isLearned) {
        let optDef = EMERGENT_ABILITIES[m.learnedId];
        if (!optDef) {
          optDef = (MASTER_ABILITIES_BY_ARCHETYPE[archetype] || []).find(a => a.id === m.learnedId);
        }
        if (!optDef) {
          optDef = Object.values(DIVINE_TRANSFORMATIONS).find(d => d.id === m.learnedId);
        }

        const icon = optDef?.icon || '✨';
        const name = optDef?.name || m.learnedId;
        milestoneSlotsHtml += `
          <div style="flex:1; min-width:110px; background:rgba(212,175,55,0.15); border:1px solid rgba(212,175,55,0.4); border-radius:6px; padding:6px; font-size:10px; display:flex; flex-direction:column; gap:2px;" title="${optDef?.desc || ''}">
            <div style="color:#fde047; font-weight:bold; display:flex; align-items:center; gap:4px;">
              <span>${icon}</span>
              <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${name}</span>
            </div>
            <div style="color:#94a3b8; font-size:9px;">${m.badge} · <strong style="color:#38bdf8;">+${optDef?.cp || 1500} CP</strong></div>
          </div>
        `;
      } else if (m.isUnlocked) {
        milestoneSlotsHtml += `
          <div style="flex:1; min-width:110px; background:rgba(16,185,129,0.15); border:1px dashed #10b981; border-radius:6px; padding:6px; font-size:10px; display:flex; flex-direction:column; justify-content:space-between; gap:4px;">
            <div style="color:#10b981; font-weight:bold;">✨ ${m.badge}</div>
            <button class="action-btn action-btn--primary" style="padding:3px 6px; font-size:9px; font-weight:bold;" onclick="window.openCertificationModal('${sub.id}', '${m.milestoneKey}')">Aprender 📜</button>
          </div>
        `;
      } else {
        milestoneSlotsHtml += `
          <div style="flex:1; min-width:110px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.08); border-radius:6px; padding:6px; font-size:10px; display:flex; flex-direction:column; gap:2px; opacity:0.6;">
            <div style="color:#64748b; font-weight:bold;">🔒 ${m.badge}</div>
            <div style="color:#475569; font-size:9px;">Requer Nível ${m.requiredLevel}</div>
          </div>
        `;
      }
    });

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
        <div>
          <div style="font-weight:bold; color:${isSubActive ? '#34d399' : 'var(--bone)'}; font-size:13px; display:flex; align-items:center; gap:6px;">
            <span>⚔️ Subclasse ${idx + 1}:</span>
            <span style="color:#fde047;">${subClassDef?.name || sub.classId}</span>
            <span style="color:#60a5fa; font-size:11px; background:rgba(96,165,250,0.15); padding:1px 6px; border-radius:4px;">Lv.${sub.level}/85</span>
            <span style="color:#a855f7; font-size:10px; background:rgba(168,85,247,0.15); padding:1px 5px; border-radius:4px; text-transform:uppercase;">${archetype}</span>
          </div>
          <div style="font-size:10px; color:var(--text-muted); margin-top:2px;">Certificados MasterWork disponíveis nos Lvs. 65, 70, 75 e 80.</div>
        </div>
        <div style="display:flex; gap:6px;">
          <button class="inv-batch-btn" style="padding:4px 8px; font-size:10px;" onclick="window.openResetCertificationsModal('${sub.id}')" title="Redistribuir certificações desta subclasse">🔄 Resetar (1kk)</button>
          <button class="action-btn" style="padding:6px 12px; font-size:11px;" ${isSubActive ? 'disabled' : ''} onclick="switchSubclass(${idx})">
            ${isSubActive ? '✓ Em Uso' : 'Alternar ⚔️'}
          </button>
        </div>
      </div>

      <!-- Grid de 4 Marcos de Certificação -->
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap:6px; margin-top:4px;">
        ${milestoneSlotsHtml}
      </div>
    `;
    container.appendChild(card);
  });

  // 3. Atualização do Resumo de Certificações e CP
  const certBonuses = SubclassCertificationService.calculateTotalCertificationBonuses(state);
  const totalCertCp = SubclassCertificationService.calculateCertificationCP(state);

  if (cpBadge) {
    cpBadge.textContent = `+${totalCertCp.toLocaleString('pt-BR')} CP`;
  }

  if (summaryEl) {
    const activeTransStr = state.activeTransformation ? `<div style="margin-top:4px; color:#fde047; font-weight:bold;">👼 Transformação Divina Ativa: ${state.activeTransformation.toUpperCase()}</div>` : '';
    
    if (certBonuses.totalCertCount === 0) {
      summaryEl.innerHTML = `Nenhuma certificação aprendida ainda. Suba suas subclasses aos Lvs. 65, 70, 75 e 80 para acumular bônus permanentes!`;
    } else {
      const parts = [];
      if (certBonuses.pAtk) parts.push(`+${certBonuses.pAtk} P.Atk`);
      if (certBonuses.pDef) parts.push(`+${certBonuses.pDef} P.Def`);
      if (certBonuses.mAtk) parts.push(`+${certBonuses.mAtk} M.Atk`);
      if (certBonuses.mDef) parts.push(`+${certBonuses.mDef} M.Def`);
      if (certBonuses.pAtkPercent) parts.push(`+${Math.round(certBonuses.pAtkPercent * 100)}% P.Atk`);
      if (certBonuses.pDefPercent) parts.push(`+${Math.round(certBonuses.pDefPercent * 100)}% P.Def`);
      if (certBonuses.mAtkPercent) parts.push(`+${Math.round(certBonuses.mAtkPercent * 100)}% M.Atk`);
      if (certBonuses.mDefPercent) parts.push(`+${Math.round(certBonuses.mDefPercent * 100)}% M.Def`);
      if (certBonuses.maxHpPercent) parts.push(`+${Math.round(certBonuses.maxHpPercent * 100)}% Max HP`);
      if (certBonuses.maxMpPercent) parts.push(`+${Math.round(certBonuses.maxMpPercent * 100)}% Max MP`);
      if (certBonuses.maxCpPercent) parts.push(`+${Math.round(certBonuses.maxCpPercent * 100)}% Max CP`);
      if (certBonuses.critRate) parts.push(`+${certBonuses.critRate} Crit Rate`);
      if (certBonuses.castSpd) parts.push(`+${certBonuses.castSpd} Cast Speed`);
      if (certBonuses.evasion) parts.push(`+${certBonuses.evasion} Esquiva`);
      if (certBonuses.celestialProc) parts.push(`🌟 Escudo Celestial (Proc)`);
      if (certBonuses.hasteProc) parts.push(`⚡ Chance Haste (Proc)`);
      if (certBonuses.defenceProc) parts.push(`🛡️ Counter Defense (Proc)`);
      if (certBonuses.spiritProc) parts.push(`👻 Counter Spirit (Proc)`);
      if (certBonuses.critProc) parts.push(`💥 Chance Critical (Proc)`);

      summaryEl.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <span style="color:#fde047; font-weight:bold;">Certificados Ativos: ${certBonuses.totalCertCount}/12</span>
          <button class="inv-batch-btn" style="padding:2px 8px; font-size:9px;" onclick="window.openDivineTransformationToggleModal()">👼 Gerenciar Transformação</button>
        </div>
        <div style="line-height:1.5; color:var(--bone); font-size:11px;">
          ${parts.join(' · ')}
        </div>
        ${activeTransStr}
      `;
    }
  }
}

// --------------------------- MODAL DE CERTIFICAÇÃO ---------------------------

function openCertificationModal(subId, milestoneKey) {
  const modal = el('cert-modal');
  const body = el('cert-modal-body');
  if (!modal || !body) return;

  const sub = (state.subclasses || []).find(s => s.id === subId);
  if (!sub) return;

  const milestones = SubclassCertificationService.getSubclassMilestones(state, subId);
  const milestone = milestones.find(m => m.milestoneKey === milestoneKey);
  if (!milestone) return;

  const subClassDef = getClass(sub.classId);
  const archetype = SubclassCertificationService.getArchetypeForClass(sub.classId);

  let optionsHtml = '';
  milestone.options.forEach(opt => {
    optionsHtml += `
      <div style="background:rgba(0,0,0,0.4); border:1px solid rgba(212,175,55,0.3); border-radius:8px; padding:12px; display:flex; justify-content:space-between; align-items:center; gap:10px;">
        <div style="flex:1;">
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="font-size:18px;">${opt.icon || '✨'}</span>
            <strong style="color:#fde047; font-size:13px;">${opt.name}</strong>
            ${opt.badge ? `<span style="font-size:10px; background:rgba(212,175,55,0.2); color:#ffd700; padding:1px 6px; border-radius:4px;">${opt.badge}</span>` : ''}
          </div>
          <div style="font-size:11px; color:#d1d5db; margin-top:4px; line-height:1.4;">${opt.desc}</div>
          <div style="font-size:10px; color:#38bdf8; margin-top:4px;">Contribuição de Poder: <strong>+${(opt.cp || 1500).toLocaleString('pt-BR')} CP</strong></div>
        </div>
        <button class="action-btn action-btn--primary" style="padding:8px 14px; font-size:11px; white-space:nowrap;" onclick="window.confirmLearnCertification('${subId}', '${milestoneKey}', '${opt.id}')">
          Aprender 📜
        </button>
      </div>
    `;
  });

  body.innerHTML = `
    <div style="margin-bottom:14px;">
      <h3 style="margin:0; color:#fde047; font-family:'Cinzel',serif; font-size:16px;">📜 ${milestone.title}</h3>
      <p style="margin:4px 0 0 0; font-size:11px; color:var(--text-muted);">Subclasse: <strong>${subClassDef?.name || sub.classId}</strong> (Arquétipo: <span style="text-transform:uppercase; color:#a855f7;">${archetype}</span>)</p>
    </div>
    <div style="display:flex; flex-direction:column; gap:8px; max-height:360px; overflow-y:auto; padding-right:4px;">
      ${optionsHtml}
    </div>
  `;

  const closeBtn = el('cert-modal-close');
  if (closeBtn) closeBtn.onclick = closeCertificationModal;

  modal.style.display = 'flex';
}

function closeCertificationModal() {
  const modal = el('cert-modal');
  if (modal) modal.style.display = 'none';
}

function confirmLearnCertification(subId, milestoneKey, abilityId) {
  const success = SubclassCertificationService.learnCertification(state, subId, milestoneKey, abilityId, {
    log: (msg, type) => log(msg, type),
    onUpdate: () => {
      floatText('✨ CERTIFICAÇÃO ADQUIRIDA!', 'float-jackpot');
      updateAllUI();
      save();
    }
  });

  if (success) {
    closeCertificationModal();
  }
}

function openResetCertificationsModal(subId) {
  const sub = (state.subclasses || []).find(s => s.id === subId);
  if (!sub) return;

  const subClassDef = getClass(sub.classId);
  const costAdena = 1000000;
  const hasAdena = (state.gold || 0) >= costAdena;

  const modal = el('cert-modal');
  const body = el('cert-modal-body');
  if (!modal || !body) return;

  body.innerHTML = `
    <div style="margin-bottom:14px;">
      <h3 style="margin:0; color:#ef4444; font-family:'Cinzel',serif; font-size:16px;">🔄 Redefinir Certificações</h3>
      <p style="margin:4px 0 0 0; font-size:12px; color:var(--bone);">Deseja redefinir e redistribuir todas as certificações de <strong>${subClassDef?.name || sub.classId}</strong>?</p>
    </div>
    <div style="background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:12px; font-size:11px; color:#d1d5db; line-height:1.4;">
      <p style="margin:0 0 6px 0;">Ao confirmar, todos os certificados já aprendidos nesta subclasse serão devolvidos, permitindo que você escolha novas habilidades para os Lvs. 65, 70, 75 e 80.</p>
      <p style="margin:0; color:${hasAdena ? '#fde047' : '#ef4444'}; font-weight:bold;">Custo de Redefinição: 1.000.000 Adena (${(state.gold || 0).toLocaleString('pt-BR')} Adena atual)</p>
    </div>
    <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:14px;">
      <button class="action-btn" onclick="window.closeCertificationModal()">Cancelar</button>
      <button class="action-btn action-btn--danger" ${!hasAdena ? 'disabled' : ''} onclick="window.confirmResetCertifications('${subId}')">Confirmar Reset (-1kk Adena)</button>
    </div>
  `;

  const closeBtn = el('cert-modal-close');
  if (closeBtn) closeBtn.onclick = closeCertificationModal;

  modal.style.display = 'flex';
}

function confirmResetCertifications(subId) {
  const success = SubclassCertificationService.resetSubclassCertifications(state, subId, {
    log: (msg, type) => log(msg, type),
    onUpdate: () => {
      updateAllUI();
      save();
    }
  });

  if (success) {
    closeCertificationModal();
  }
}

function openDivineTransformationToggleModal() {
  const modal = el('cert-modal');
  const body = el('cert-modal-body');
  if (!modal || !body) return;

  const certBonuses = SubclassCertificationService.calculateTotalCertificationBonuses(state);
  const learnedDivines = [];

  for (const subId in (state.subclassCertifications || {})) {
    const dId = state.subclassCertifications[subId]?.lv80;
    if (dId) {
      const def = Object.values(DIVINE_TRANSFORMATIONS).find(d => d.id === dId);
      if (def && !learnedDivines.some(ld => ld.id === def.id)) {
        learnedDivines.push(def);
      }
    }
  }

  if (learnedDivines.length === 0) {
    body.innerHTML = `
      <div style="text-align:center; padding:20px 10px;">
        <div style="font-size:32px; margin-bottom:8px;">🔒</div>
        <h3 style="color:#fde047; margin:0 0 6px 0;">Nenhuma Transformação Divina Desbloqueada</h3>
        <p style="font-size:12px; color:var(--text-muted); margin:0;">Alcance o Nível 80 com qualquer Subclasse para desbloquear sua Forma Divina correspondente!</p>
        <button class="action-btn" style="margin-top:14px;" onclick="window.closeCertificationModal()">Fechar</button>
      </div>
    `;
  } else {
    let listHtml = '';
    learnedDivines.forEach(dt => {
      const isActive = state.activeTransformation === dt.id;
      listHtml += `
        <div style="background:rgba(0,0,0,0.4); border:1px solid ${isActive ? '#ffd700' : 'rgba(212,175,55,0.3)'}; border-radius:8px; padding:12px; display:flex; justify-content:space-between; align-items:center; gap:10px;">
          <div>
            <div style="font-weight:bold; color:#fde047; font-size:13px; display:flex; align-items:center; gap:6px;">
              <span>${dt.icon}</span>
              <span>${dt.name}</span>
              ${isActive ? '<span style="font-size:10px; background:#ffd700; color:#000; font-weight:bold; padding:1px 6px; border-radius:4px;">ATIVA</span>' : ''}
            </div>
            <div style="font-size:11px; color:#d1d5db; margin-top:2px;">${dt.desc}</div>
          </div>
          <button class="action-btn ${isActive ? 'action-btn--danger' : 'action-btn--primary'}" style="padding:6px 12px; font-size:11px; white-space:nowrap;" onclick="window.toggleDivineTransformation('${dt.id}')">
            ${isActive ? 'Desativar ❌' : 'Ativar 👼'}
          </button>
        </div>
      `;
    });

    body.innerHTML = `
      <div style="margin-bottom:14px;">
        <h3 style="margin:0; color:#fde047; font-family:'Cinzel',serif; font-size:16px;">👼 Transformações Divinas Disponíveis</h3>
        <p style="margin:4px 0 0 0; font-size:11px; color:var(--text-muted);">Ative a forma divina para receber bônus devastadores em combate e sieges.</p>
      </div>
      <div style="display:flex; flex-direction:column; gap:8px; max-height:360px; overflow-y:auto;">
        ${listHtml}
      </div>
    `;
  }

  const closeBtn = el('cert-modal-close');
  if (closeBtn) closeBtn.onclick = closeCertificationModal;

  modal.style.display = 'flex';
}

function toggleDivineTransformation(transId) {
  if (state.activeTransformation === transId) {
    state.activeTransformation = null;
    log('👼 Transformação Divina desativada.', 'system');
  } else {
    state.activeTransformation = transId;
    log(`👼 **TRANSFORMAÇÃO DIVINA ATIVADA!** (+${transId.toUpperCase()})`, 'rarity-legendary');
    floatText('TRANSFORMAÇÃO DIVINA!', 'float-jackpot');
  }

  closeCertificationModal();
  updateAllUI();
  save();
}

function openAddSubclassModal() {
  const currentClass = state.class;
  // MasterWork: Todas as classes disponíveis sem restrição racial!
  const availableClasses = Object.keys(CLASSES).filter(cId => cId !== currentClass && !(state.subclasses || []).some(s => s.classId === cId));

  if (availableClasses.length === 0) {
    log('Todas as classes já foram aprendidas como subclasse.', 'system');
    return;
  }

  const modal = el('cert-modal');
  const body = el('cert-modal-body');
  if (!modal || !body) return;

  let classOptionsHtml = '';
  availableClasses.forEach(cId => {
    const cDef = CLASSES[cId];
    const arch = SubclassCertificationService.getArchetypeForClass(cId);
    classOptionsHtml += `
      <div style="background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:10px; display:flex; justify-content:space-between; align-items:center; gap:8px;">
        <div>
          <div style="font-weight:bold; color:#fde047; font-size:12px;">${cDef?.name || cId}</div>
          <div style="font-size:10px; color:#a855f7; text-transform:uppercase;">Arquétipo: ${arch}</div>
        </div>
        <button class="action-btn action-btn--primary" style="padding:6px 12px; font-size:11px;" onclick="window.confirmAddSubclass('${cId}')">
          Adicionar ⚔️
        </button>
      </div>
    `;
  });

  body.innerHTML = `
    <div style="margin-bottom:14px;">
      <h3 style="margin:0; color:#fde047; font-family:'Cinzel',serif; font-size:16px;">➕ Adicionar Nova Subclasse</h3>
      <p style="margin:4px 0 0 0; font-size:11px; color:var(--text-muted);">MasterWork Edition — Sem Restrição Racial. Inicia no Nível 40.</p>
    </div>
    <div style="display:flex; flex-direction:column; gap:6px; max-height:340px; overflow-y:auto; padding-right:4px;">
      ${classOptionsHtml}
    </div>
  `;

  const closeBtn = el('cert-modal-close');
  if (closeBtn) closeBtn.onclick = closeCertificationModal;

  modal.style.display = 'flex';
}

function confirmAddSubclass(chosenClassId) {
  state.subclasses = state.subclasses || [];
  if (state.subclasses.length >= 3) {
    log('Limite máximo de 3 subclasses atingido.', 'system');
    closeCertificationModal();
    return;
  }

  const subId = 'sub_' + Date.now();
  state.subclasses.push({
    id: subId,
    classId: chosenClassId,
    level: 40,
    xp: 0,
    sp: 50,
    skills: {}
  });

  log(`🌟 Parabéns! Você aprendeu a Subclasse **${CLASSES[chosenClassId]?.name || chosenClassId}** (Nível 40)!`, 'rarity-legendary');
  floatText(`🌟 SUBCLASSE APRENDIDA!`, 'float-jackpot');

  closeCertificationModal();
  updateAllUI();
  save();
}

function switchSubclass(targetIndex) {
  if (state.activeSubclassIndex === targetIndex) return;

  if (state.activeSubclassIndex === null) {
    state.mainClassData = {
      level: state.level,
      xp: state.xp,
      sp: state.sp,
      class: state.class,
      skills: { ...state.skills },
      legacyPassives: { ...(state.legacyPassives || {}) }
    };
  } else {
    const activeSub = state.subclasses[state.activeSubclassIndex];
    if (activeSub) {
      activeSub.level = state.level;
      activeSub.xp = state.xp;
      activeSub.sp = state.sp;
      activeSub.skills = { ...state.skills };
      activeSub.legacyPassives = { ...(state.legacyPassives || {}) };
    }
  }

  if (targetIndex === null) {
    state.activeSubclassIndex = null;
    const main = state.mainClassData || { level: 75, xp: 0, sp: 50, class: 'fighter', skills: {}, legacyPassives: {} };
    state.level = main.level;
    state.xp = main.xp;
    state.sp = main.sp;
    state.class = main.class;
    state.skills = { ...(main.skills || {}) };
    state.legacyPassives = { ...(main.legacyPassives || {}) };
    log(`👑 Alternado para a Classe Principal (**${getClass(state.class).name}**)!`, 'system');
  } else {
    const targetSub = state.subclasses[targetIndex];
    if (targetSub) {
      state.activeSubclassIndex = targetIndex;
      state.level = targetSub.level;
      state.xp = targetSub.xp;
      state.sp = targetSub.sp;
      state.class = targetSub.classId;
      state.skills = { ...(targetSub.skills || {}) };
      state.legacyPassives = { ...(targetSub.legacyPassives || {}) };
      log(`⚔️ Alternado para a Subclasse **${getClass(state.class).name}** (Lv.${state.level})!`, 'rarity-rare');
    }
  }

  const race = state.race ? RACES[state.race] : RACES.human;
  const cls = getClass(state.class);
  state.base = { atk: 0, def: 0, eva: 0, matk: 0, mdef: 0 };
  for (const k of ['atk','def','eva','matk','mdef']) {
    state.base[k] = (race?.stats[k] || 0) + (cls?.base[k] || 0);
  }

  updateAllUI(); save();
}

// --------------------------- VISUALS / STAGE ---------------------------
// ZONE_BACKGROUNDS é importado de ./src/data/zones.js

let currentBgPath = '';
let activeBgLayer = 'a';

function updateZoneBackground() {
  const currentKey = state.target && RAID_BOSSES[state.target] ? state.target : (state.zone || 'orcVillage');
  const bgPath = ZONE_BACKGROUNDS[currentKey] || '/img/' + currentKey + '.png';

  const logEl = el('log');
  const stageZone = el('stage-zone');
  const bgA = el('stage-bg-a');
  const bgB = el('stage-bg-b');

  if (bgPath !== currentBgPath) {
    currentBgPath = bgPath;
    const bgUrl = `linear-gradient(180deg, rgba(8,10,16,0.15) 0%, rgba(8,10,16,0.60) 100%), url('${bgPath}')`;
    if (bgA && bgB) {
      if (activeBgLayer === 'a') {
        bgB.style.backgroundImage = bgUrl;
        bgB.classList.add('active');
        bgA.classList.remove('active');
        activeBgLayer = 'b';
      } else {
        bgA.style.backgroundImage = bgUrl;
        bgA.classList.add('active');
        bgB.classList.remove('active');
        activeBgLayer = 'a';
      }
    }
  }

  if (logEl) {
    logEl.style.backgroundImage = `linear-gradient(180deg, rgba(10,13,20,0.85), rgba(10,13,20,0.95)), url('${bgPath}')`;
  }

  if (stageZone) {
    let name = '';
    if (state.target && RAID_BOSSES[state.target]) {
      name = RAID_BOSSES[state.target].name;
    } else if (state.zone && ZONES[state.zone]) {
      name = ZONES[state.zone].name;
    }
    if (name) stageZone.textContent = name.toUpperCase();
  }
}

function topEquipRarityColor() { const rank = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 }; let best = -1, col = ''; for (const s of Object.keys(state.equipment)) { const uid = state.equipment[s]; if (!uid) continue; const it = state.inventory.find(i => i.uid === uid); if (!it || !it.rarity) continue; const r = rank[it.rarity] ?? -1; if (r > best) { best = r; col = D().RARITY[it.rarity].color; } } return col; }
function renderStageHero() {
  return uiRenderStageHero(state);
}
function renderStageMonster() {
  return uiRenderStageMonster(state);
}

function updateMonsterHP() { const fill = el('m-hp-fill'), mon = state.activeMonster; if (!fill) return; if (!mon || !mon._maxHp) { fill.style.width = '100%'; return; } fill.style.width = Math.max(0, (mon.hp / mon._maxHp) * 100) + '%'; }


function reflow(n) { void n.offsetWidth; }
function stageHeroAttack() { const st = el('stage'); if (!st) return; st.classList.remove('is-hero-atk'); reflow(st); st.classList.add('is-hero-atk'); }
function stageMonsterHurt(dmg, crit) { updateMonsterHP(); const m = el('stage-monster'); if (m) { m.classList.remove('hurt'); reflow(m); m.classList.add('hurt'); setTimeout(() => m.classList.remove('hurt'), 420); } stageFloat((crit ? 'CRIT ' : '') + Math.round(dmg), crit ? 'sf-crit' : 'sf-dmg', 'right'); }
function stageMonsterDie() { 
  const fill = el('m-hp-fill'); 
  if (fill) fill.style.width = '0%'; 
  const m = el('stage-monster'); 
  if (m) { 
    m.classList.remove('is-dying'); 
    reflow(m); 
    m.classList.add('is-dying'); 
    setTimeout(() => m.classList.remove('is-dying'), 350); 
  } 
  stageFloat('SLAIN', 'sf-slain', 'right'); 
}
function stageMonsterLunge() { const m = el('stage-monster'); if (!m) return; m.classList.remove('lunge'); reflow(m); m.classList.add('lunge'); setTimeout(() => m.classList.remove('lunge'), 440); }
function stageHeroHurt(dmg) { const h = el('stage-hero'); if (h) { h.classList.remove('hurt'); reflow(h); h.classList.add('hurt'); setTimeout(() => h.classList.remove('hurt'), 420); } stageFloat('-' + Math.round(dmg), 'sf-hurt', 'left'); }
function stageHeroBlock() { stageFloat('BLOCK', 'sf-block', 'left'); }
const MAX_FLOAT_ITEMS = 12;
function stageFloat(text, cls, side) {
  const c = el('stage-floats');
  if (!c) return;
  while (c.children.length >= MAX_FLOAT_ITEMS) { c.removeChild(c.firstChild); }
  const s = mkEl('span');
  s.className = 'sf ' + cls;
  s.textContent = text;
  s.style.left = (side === 'left' ? (16 + Math.random() * 8) : (68 + Math.random() * 12)) + '%';
  c.appendChild(s);
  setTimeout(() => { if (s.parentNode === c) c.removeChild(s); }, 1100);
}

// --------------------------- COMBAT ---------------------------
let combatInterval = null; let combatTick = 0; let monsterAttackTimeout = null;

function getStagePositionRelative(side) {
  const stage = el('stage');
  if (!stage) return { x: 0, y: 0 };
  const rect = stage.getBoundingClientRect();
  const host = el(side === 'hero' ? 'stage-hero' : 'stage-monster');
  if (!host) return { x: rect.width * 0.5, y: rect.height * 0.5 };
  const box = host.getBoundingClientRect();
  return {
    x: box.left - rect.left + box.width * 0.5,
    y: box.top - rect.top + box.height * 0.5
  };
}

function getCombatTargetPoint() {
  const stage = el('stage');
  if (!stage) return { x: 0, y: 0 };
  const rect = stage.getBoundingClientRect();
  const monster = el('stage-monster');
  if (monster) {
    const box = monster.getBoundingClientRect();
    return { x: box.left - rect.left + box.width * 0.45, y: box.top - rect.top + box.height * 0.45 };
  }
  return { x: rect.width * 0.72, y: rect.height * 0.48 };
}

function playCombatVFX(type, options = {}) {
  if (!VFX || typeof VFX.play !== 'function') return null;
  const resolved = { ...options };
  if (!resolved.source) resolved.source = getStagePositionRelative('hero');
  if (!resolved.target) resolved.target = getCombatTargetPoint();
  return VFX.play(type, resolved);
}

function setupVfxQualityControl() {
  const select = el('vfx-quality-select');
  if (!select || !VFX || typeof VFX.setQuality !== 'function') return;
  const saved = (typeof window !== 'undefined' && window.localStorage) ? window.localStorage.getItem('lineage-idle-vfx-quality') : null;
  const initial = saved || 'high';
  select.value = initial;
  VFX.setQuality(initial);
  select.addEventListener('change', () => {
    const value = select.value || 'high';
    VFX.setQuality(value);
    if (typeof window !== 'undefined' && window.localStorage) {
      try { window.localStorage.setItem('lineage-idle-vfx-quality', value); } catch (_) {}
    }
  });
}

function getSkillVfxId(skillId, skillDef = null) {
  const toSnake = (value) => String(value || '')
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');

  const candidates = new Set();
  const rawId = skillId || skillDef?.id || '';
  const rawName = skillDef?.name || '';
  const normalizedId = toSnake(rawId);
  const normalizedName = toSnake(rawName);

  if (normalizedId) candidates.add(normalizedId);
  if (normalizedName) candidates.add(normalizedName);
  if (normalizedId && normalizedId.includes('_')) {
    const suffix = normalizedId.split('_').slice(1).join('_');
    if (suffix) candidates.add(suffix);
  }

  const map = {
    flame_strike: 'fireball',
    fireball: 'fireball',
    ice_bolt: 'ice_shards',
    wind_strike: 'wind_blast',
    wind_attack: 'wind_blast',
    arcane_missile: 'arcane_missile',
    lightning_strike: 'lightning',
    energy_wave: 'energy_slash',
    arrow_storm: 'arrow_rain',
    sword_cross: 'cross_slash',
    spear_throw: 'spiral_spear'
  };

  for (const candidate of candidates) {
    if (map[candidate]) return map[candidate];
    if (candidate.endsWith('flame_strike') || candidate.includes('flame_strike')) return 'fireball';
    if (candidate.endsWith('wind_strike') || candidate.includes('wind_strike') || candidate.includes('wind_attack')) return 'wind_blast';
    if (candidate.endsWith('ice_bolt') || candidate.includes('ice_bolt')) return 'ice_shards';
  }

  return null;
}

function getMonsterCategory(monster) {
  if (!monster) return 'humanoid';
  if (monster.category) return monster.category.toLowerCase();
  const id = String(monster.id || '').toLowerCase();
  if (id.includes('skeleton') || id.includes('death') || id.includes('crypt') || id.includes('vampire') || id.includes('lich') || id.includes('bone') || id.includes('cursed') || id.includes('corpse') || id.includes('soul')) return 'undead';
  if (id.includes('dragon') || id.includes('fafurion') || id.includes('tiamat') || id.includes('lindvior')) return 'dragon';
  if (id.includes('wolf') || id.includes('spider') || id.includes('satyr') || id.includes('snake') || id.includes('werewolf') || id.includes('cerberus') || id.includes('beast') || id.includes('trent') || id.includes('swamp')) return 'beast';
  if (id.includes('demon') || id.includes('void') || id.includes('beholder') || id.includes('devil')) return 'demon';
  return 'humanoid';
}

function getEquippedProcBonuses() {
  const procs = {
    boss_dmg: 0,
    on_kill_heal: 0,
    stun_chance: 0,
    type_dmg: { undead: 0, dragon: 0, beast: 0, demon: 0, humanoid: 0 }
  };

  if (!state.equipment) return procs;

  for (const slot of Object.keys(state.equipment)) {
    const uid = state.equipment[slot];
    if (!uid) continue;
    const inv = state.inventory.find(i => i.uid === uid);
    if (!inv || !Array.isArray(inv.affixes)) continue;

    inv.affixes.forEach(aff => {
      const defAff = D().AFFIX_MAP ? D().AFFIX_MAP[aff.id] : null;
      if (defAff && defAff.type === 'proc') {
        if (defAff.proc === 'boss_dmg') procs.boss_dmg += Number(aff.value) || 0;
        if (defAff.proc === 'on_kill_heal') procs.on_kill_heal += Number(aff.value) || 0;
        if (defAff.proc === 'stun_chance') procs.stun_chance += Number(aff.value) || 0;
        if (defAff.proc === 'type_dmg' && defAff.category && procs.type_dmg[defAff.category] !== undefined) {
          procs.type_dmg[defAff.category] += Number(aff.value) || 0;
        }
      }
    });
  }

  return procs;
}

function dealDamage(target, amount, type = 'physical') { 
  const rawAmount = Number(amount) || 0;
  const def = type === 'physical' ? (Number(target.def) || 0) : (Number(target.mdef) || 0); 
  return Math.max(1, Math.floor(rawAmount * (1 - def / (def + 50)))); 
}

const goldEvents = []; 
function trackGold(amount) { goldEvents.push({ t: Date.now(), v: amount }); }
function getGoldPerSec() { const now = Date.now(); while (goldEvents.length && now - goldEvents[0].t > 30000) goldEvents.shift(); if (!goldEvents.length) return 0; return goldEvents.reduce((s, e) => s + e.v, 0) / 30; }
function floatText(text, cls = 'float-gold') {
  const layer = el('float-layer');
  if (!layer) return;
  while (layer.children.length >= MAX_FLOAT_ITEMS) { layer.removeChild(layer.firstChild); }
  const span = mkEl('span');
  span.className = 'float-text ' + cls;
  span.textContent = text;
  const rect = layer.getBoundingClientRect();
  span.style.left = (rect.width * (0.35 + Math.random() * 0.3)) + 'px';
  span.style.top = (rect.height * 0.55 + (Math.random() * 60 - 30)) + 'px';
  layer.appendChild(span);
  setTimeout(() => { if (span.parentNode === layer) layer.removeChild(span); }, 1400);
}

function checkBuffsExpire() {
  if (!state.buffs) return;
  const now = Date.now();
  for (const k of Object.keys(state.buffs)) {
    if (state.buffs[k].until < now) delete state.buffs[k];
  }
}

function attackMonster() {
  if (state.isCombatActive === false) return;
  if ((!state.zone && !state.isRaidActive) || !state.target) return;

  if (state.towerCombatActive) {
    const elapsed = Date.now() - (state.towerStartTime || Date.now());
    if (elapsed > 60000) {
      state.towerCombatActive = false;
      log('⏱️ Tempo de Instância Esgotado (60s)! Desafio da Torre Falhou!', 'warning');
      if (typeof window !== 'undefined' && window.floatText) window.floatText('⏱️ TEMPO ESGOTADO!', 'float-warning');
      state.activeMonster = null;
      pickRandomMonster();
      updateAllUI();
      return;
    }
  }

  checkBuffsExpire();
  const stats = getStats(), monster = state.activeMonster || MONSTERS[state.target]; if (!monster) return;
  if (monster.isRaid) {
    serviceProcessRaidBossMechanics(state, { log, floatText });
  }
  combatTick++;

  if (stats.regenHp > 0) {
    state._regenAcc = (state._regenAcc || 0) + 0.2; 
    if (state._regenAcc >= 10) { state._regenAcc = 0; const heal = Math.max(1, Math.floor(state.maxHp * stats.regenHp)); if (state.hp < state.maxHp) { state.hp = Math.min(state.maxHp, state.hp + heal); log(`Holy Light: +${heal} HP`, 'heal'); } }
  }
  if (stats.mpRegen > 0) {
    state._mpRegenAcc = (state._mpRegenAcc || 0) + 0.2;
    if (state._mpRegenAcc >= 5) { state._mpRegenAcc = 0; if (state.mp < state.maxMp) { state.mp = Math.min(state.maxMp, state.mp + stats.mpRegen); } }
  }
  const shouldAutoPot = stats.autoPotion || state.autoPotionActive;
  if (shouldAutoPot && state.hp < state.maxHp * 0.5) {
    const potIds = ['hp_potion_xl','hp_potion_l','hp_potion_m','hp_potion_s'];
    for (const pid of potIds) { 
      const it = state.inventory.find(i => i.itemId === pid && (i.count || 1) > 0); 
      if (it) { useItem(it.uid); break; } 
    }
  }
  
  if (!state._cds) state._cds = {};
  const now = combatTick * 200; 
  
  const activeSkills = [];
  const classSkillIds = getClassSkills(state.class);
  for(const [sId, lvl] of Object.entries(state.skills)) {
    const def = SKILL_DEFS[sId];
    if(lvl > 0 && def) {
      const isPassive = def.type === 'passive' || def.type === 'stat';
      if (!isPassive) {
        const belongsToClass = (classSkillIds && classSkillIds.includes(sId)) || classSatisfies(state.class, def.classReq);
        if (belongsToClass) {
          activeSkills.push({ id: sId, lvl, def });
        }
      }
    }
  }

  activeSkills.sort((a, b) => (b.def.tier || 0) - (a.def.tier || 0));

  const realNow = Date.now();
  let castedSkillThisTick = false;
  for(const skill of activeSkills) {
    // 0. Validação de Arma e Escudo para a Habilidade
    const wpnCheck = (typeof canCastSkillWeapon === 'function') ? canCastSkillWeapon(state, skill.def) : { ok: true };
    if (!wpnCheck.ok) {
      continue; // Arma ou Escudo incompatível com o requisito da skill
    }

    const isBuff = skill.def.type === 'buff' || skill.def.type === 'harmony' || skill.def.type === 'toggle' || skill.def.effect === 'warcry';
    const isHeal = skill.def.effect === 'heal' || skill.def.type === 'heal' || skill.id.includes('heal') || skill.id.includes('curation');

    // 1. Se a habilidade é um Buff/Warcry, verifica se o efeito ainda está ativo!
    if (isBuff) {
      const activeBuff = state.buffs && (state.buffs[skill.id] || state.buffs['warcry']);
      if (activeBuff && activeBuff.until > realNow) {
        // Buff ainda ativo no personagem, não re-convoque nem solte novamente!
        continue;
      }
    }

    const cd = (skill.def.baseCd || 5000) * (1 - (stats.cdr || 0)); 
    const lastCast = state._cds[skill.id] || 0;
    if ((realNow - lastCast) >= cd) {
      state._cds[skill.id] = realNow;
      
      if (isBuff) {
        state.buffs = state.buffs || {};
        const buffDuration = 60000; // 60 segundos de efeito
        const buffAmt = window.SkillScaling ? window.SkillScaling.getSkillBuffAtLevel(skill.lvl) : (0.20 + (skill.lvl * 0.05));
        const buffObj = { amount: buffAmt, until: realNow + buffDuration, effect: 'warcry' };
        state.buffs[skill.id] = buffObj;
        state.buffs['warcry'] = buffObj;
        log(`🗣 ${skill.def.name}! ${skill.def.info || 'Buff Ativo por 60s'}`, 'rarity-rare');
        floatText(skill.def.name, 'float-epic');
      } else if (isHeal) {
        const healAmt = window.SkillScaling ? window.SkillScaling.getSkillHealAtLevel(stats.maxHp, skill.lvl) : Math.floor(stats.maxHp * (0.25 + skill.lvl * 0.05));
        state.hp = Math.min(stats.maxHp, state.hp + healAmt);
        log(`✨ ${skill.def.name}! Curou ${healAmt} HP`, 'heal');
        floatText(`+${healAmt} HP`, 'sf-heal');
      } else {
        const useMagicSkill = stats.matk > stats.atk;
        const type = useMagicSkill ? 'magic' : 'physical';
        const baseSkillDmg = useMagicSkill ? stats.matk : stats.atk;
        const skillPwr = window.SkillScaling ? window.SkillScaling.getSkillPwrAtLevel(skill.def, skill.lvl) : (Number(skill.def.pwr) || 30);
        const sDmg = dealDamage(monster, baseSkillDmg * (skillPwr / 10), type);
        
        monster.hp -= sDmg;
        stageHeroAttack();
        stageMonsterHurt(sDmg, false);
        
        const vfxId = getSkillVfxId(skill.id, skill.def);
        if (vfxId) {
          const source = getStagePositionRelative('hero');
          const target = getCombatTargetPoint();
          const duration = vfxId === 'arrow_rain' ? 1200 : 900;
          playCombatVFX(vfxId, {
            source,
            target,
            color: vfxId === 'fireball' ? '#ff7a45' : (vfxId === 'ice_shards' ? '#8fe7ff' : (vfxId === 'wind_blast' ? '#72f3ca' : (vfxId === 'arcane_missile' ? '#9b7cff' : (vfxId === 'lightning' ? '#91f3ff' : (vfxId === 'energy_slash' ? '#95e6ff' : (vfxId === 'cross_slash' ? '#cfe8ff' : '#ffe4a1')))))),
            power: Math.max(1, skill.lvl || 1),
            duration,
            arrowCount: vfxId === 'arrow_rain' ? 16 : undefined,
            targetArea: vfxId === 'arrow_rain' ? { x: target.x - 90, y: target.y - 40, width: 180, height: 70 } : undefined
          });
        }

        log(`💥 ${skill.def.name}! ${sDmg} ${type} damage`, 'rarity-epic');
        if (skill.def.effect === 'vampiric' || skill.def.effect === 'drain' || skill.id.includes('vampir') || skill.id.includes('drain') || skill.id.includes('bite')) {
          const heal = Math.max(1, Math.floor(sDmg * 0.40));
          state.hp = Math.min(stats.maxHp, state.hp + heal);
          log(`🦇 Vampirismo! Absorveu ${heal} HP`, 'heal');
          floatText(`+${heal} HP`, 'sf-heal');
        }
        if (skill.def.effect === 'stun') {
           monster._stunnedUntil = now + 3500;
           log(`💫 ${monster.name} foi Atordoado!`, 'rarity-rare');
        }
      }
      
      castedSkillThisTick = true;
      break; 
    }
  }

  const atkInterval = Math.max(200, 1000 - stats.atkSpd * 600);
  if (combatTick % Math.max(1, Math.round(atkInterval / 200)) !== 0) return;

  // Level Gap Miss Penalty: se o monstro é muito superior (+3 níveis), aumenta a chance de Miss do jogador
  const monLvl = monster.lvl || 1;
  const pLvl = state.level || 1;
  const gap = monLvl - pLvl;
  if (gap >= 3) {
    const missChance = gap >= 10 ? 0.70 : (gap >= 5 ? 0.35 : 0.15);
    if (Math.random() < missChance) {
      log(`❌ MISS! ${monster.name} esquivou do seu ataque (Diferença de Nível +${gap})!`, 'warning');
      if (typeof stageFloat === 'function') stageFloat('MISS', 'sf-miss', 'right');
      return;
    }
  }

  if (!castedSkillThisTick) stageHeroAttack();

  const useMagic = stats.matk > stats.atk;
  const atkVal = useMagic ? stats.matk : stats.atk;
  const atkType = useMagic ? 'magic' : 'physical';
  
  let damage = dealDamage(monster, atkVal, atkType);
  let wasCrit = false;
  
  if (state.soulshotActive) {
    const isMageClass = state.class === 'mage' || state.class === 'soulbreaker' || (getClass(state.class)?.archetype === 'mage');
    const shotId = isMageClass ? 'spiritshot_ng' : 'soulshot_ng';
    const shotItem = state.inventory.find(i => (i.itemId === shotId || i.itemId.startsWith('soulshot') || i.itemId.startsWith('spiritshot')) && (i.count || 1) > 0);
    if (shotItem) {
      if ((shotItem.count || 1) > 1) shotItem.count--;
      else removeFromInventory(shotItem.uid, 1);
      damage = Math.floor(damage * 2);
      stageFloat('⚡ SHOT', 'sf-crit', 'left');
      updateCombatControlsUI();
    }
  }

  if (Math.random() < stats.crit / 100) { 
    damage = Math.floor(damage * 1.5 * stats.critDmg); 
    wasCrit = true; 
    log(`CRIT! ${damage} damage to ${monster.name}`, 'combat'); 
  } else { 
    log(`${damage} basic damage to ${monster.name}`, 'damage'); 
  }
  
  if (stats.lifeDrain > 0) { const heal = Math.floor(damage * stats.lifeDrain); if (heal > 0) { state.hp = Math.min(state.maxHp, state.hp + heal); } }
  
  const procBonuses = getEquippedProcBonuses();
  let affixDmgMult = 1.0;
  if (monster.boss && procBonuses.boss_dmg > 0) {
    affixDmgMult += procBonuses.boss_dmg / 100;
  }
  const monCat = getMonsterCategory(monster);
  if (procBonuses.type_dmg[monCat] > 0) {
    affixDmgMult += procBonuses.type_dmg[monCat] / 100;
  }

  damage = Math.floor(damage * affixDmgMult);

  if (procBonuses.stun_chance > 0 && Math.random() * 100 < procBonuses.stun_chance) {
    const nowStun = combatTick * 200;
    monster._stunnedUntil = nowStun + 1500;
    log(`💫 Stun Proc! ${monster.name} foi Atordoado por 1.5s`, 'rarity-rare');
    floatText('STUN!', 'float-epic');
  }

  monster.hp -= damage;
  if (monster.hp <= 0 && !castedSkillThisTick) stageMonsterDie(); else if (!castedSkillThisTick) stageMonsterHurt(damage, wasCrit);
  
  if (monster.hp <= 0) {
    if (procBonuses.on_kill_heal > 0) {
      const killHeal = Math.floor(state.maxHp * (procBonuses.on_kill_heal / 100));
      if (killHeal > 0) {
        state.hp = Math.min(state.maxHp, state.hp + killHeal);
        log(`🩸 Execução! Curou ${killHeal} HP ao derrotar ${monster.name}`, 'heal');
        floatText(`+${killHeal} HP`, 'sf-heal');
      }
    }
    if (!monster.boss && !monster.isTower && state.zone) {
      state.zoneKills = state.zoneKills || {};
      state.zoneKills[state.zone] = (state.zoneKills[state.zone] || 0) + 1;
      updateZoneKillProgressUI();
    }

    state.killStreak = (state.killStreak || 0) + 1;
    if (state.killStreak % 5 === 0 && state.killStreak >= 5) {
      stageFloat(`🔥 STREAK x${state.killStreak}!`, 'sf-crit', 'right');
    }

    const zoneLevel = ZONES[state.zone]?.level || 1;
    const zoneTier = getZoneDropTier(zoneLevel);
    const zoneMult = (D().ZONE_GOLD_MULT && D().ZONE_GOLD_MULT[zoneTier]) || 1;
    const xpMult = 1 + (stats.xpBoost || 0);
    const xpGain = Math.floor(monster.xp * xpMult);
    const spGain = monster.boss ? 8 : (monster.isElite ? 3 : Math.max(1, monster.sp || 1));
    state.xp += xpGain; state.sp += spGain;
    log(`Derrotou **${monster.name}**! Recebeu **+${xpGain.toLocaleString()} XP** e **+${spGain} SP**`, 'xp', 'gold_xp');

    // Drenagem de Alma para Soul Crystals (Níveis 1 a 15 e Epic Bosses)
    try {
      serviceProcessSoulDrainOnKill(state, monster, { log, floatText, updateAllUI, save });
    } catch (e) {
      console.warn('Erro na drenagem de almas:', e);
    }

    // Drops Especiais de Chefe do Caos (Chaos Boss)
    if (monster.isChaosBoss) {
      try {
        serviceProcessChaosBossLoot(state, monster, { log, floatText, updateAllUI, save });
      } catch (e) {
        console.warn('Erro ao processar loot do Chaos Boss:', e);
      }
    }

    // Acúmulo de Lâmpada Mágica & Craft Points por Abate
    state.magicLampExp = (state.magicLampExp || 0) + Math.floor(xpGain * 0.4);
    state.craftPoints = (state.craftPoints || 0) + (monster.boss ? 50 : 10);

    if (state.magicLampExp >= 50000) {
      state.magicLampExp -= 50000;
      state.magicLamps = (state.magicLamps || 0) + 1;
      log(`🪔 NOVA LÂMPADA MÁGICA ACUMULADA! (Total: ${state.magicLamps})`, 'rarity-legendary');
      if (typeof window !== 'undefined' && window.floatText) {
        window.floatText('🪔 LÂMPADA MÁGICA +1!', 'float-jackpot');
      }
    }

    if (state.craftPoints >= 1000) {
      state.craftPoints -= 1000;
      state.craftCharges = Math.min(100, (state.craftCharges || 0) + 1);
      log(`🛠️ CARGA DE CRAFT ACUMULADA! (Total: ${state.craftCharges})`, 'rarity-rare');
    }

    const baseGold = monster.gold[0] + Math.random() * (monster.gold[1] - monster.gold[0]), jackpot = Math.random() < (monster.boss ? 0.08 : 0.015);
    const goldMult = zoneMult * (1 + (stats.goldBoost || 0)) * (jackpot ? 10 : 1);
    let gold = Math.floor(baseGold * stats.loot * goldMult); if (gold < 1) gold = 1;
    state.gold += gold; trackGold(gold);
    if (jackpot) { 
      log(`🪙 JACKPOT! Coletou **+${gold.toLocaleString()} Adena** (×10)!`, 'rarity-legendary', 'gold_xp'); 
      floatText(`🪙 +${gold} Adena`, 'float-jackpot'); 
    } else { 
      log(`Coletou **+${gold.toLocaleString()} Adena** de ${monster.name}`, 'gold', 'gold_xp'); 
      if (gold >= 20) floatText(`+${gold} Adena`, 'float-gold'); 
    }

    const rawDrop = D().rollDrop(zoneTier, stats.loot, !!(monster.boss || monster.elite));
    const drops = Array.isArray(rawDrop) ? rawDrop : (rawDrop && rawDrop.itemId ? [ { id: rawDrop.itemId, itemId: rawDrop.itemId, rarity: rawDrop.rarity, isEquipment: true, amount: 1 } ] : []);
    for (const drop of drops) {
      const dropId = drop.id || drop.itemId;
      const def = D().ALL_ITEMS[dropId];
      if (dropId && def) {
        const isEquip = drop.isEquipment || !['material', 'potion', 'consumable', 'scroll', 'gem'].includes(def.slot);
        if (isEquip) {
          addToInventory(dropId, 1, drop.rarity || 'common');
          const rName = D().RARITY[drop.rarity || 'common']?.name || (drop.rarity || 'common');
          log(`✦ Obteve **${def.name}** [${rName}]!`, 'rarity-' + (drop.rarity || 'common'), 'loot');
          floatText(`✦ ${rName}!`, 'float-' + (drop.rarity || 'common'));
        } else {
          addToInventory(dropId, drop.amount || 1);
          log(`📦 Obteve **${drop.amount || 1}x ${def.name}**`, 'loot', 'loot');
        }
      }
    }

    // Drop de Carta de Monstro Colecionável (0.5% a 5%)
    const monKey = monster.id || monster.monsterId || monster.originalId;
    const cardId = `card_${monKey}`;
    const cardDef = MONSTER_CARDS[cardId] || MONSTER_CARDS[`card_${String(monKey).toLowerCase()}`];
    if (cardDef) {
      const dropChance = cardDef.dropChance || (monster.boss ? 0.03 : 0.006);
      if (Math.random() < dropChance) {
        addToInventory(cardId, 1);
        log(`🃏 DROP RARO! Obteve **${cardDef.name}** [${(cardDef.rarity || 'rare').toUpperCase()}]!`, 'rarity-' + (cardDef.rarity || 'rare'), 'loot');
        floatText(`🃏 CARTA DE MONSTRO!`, 'float-jackpot');
      }
    }

    triggerQuestEvent('kill', 1);
    if (monster.boss || monster.elite) triggerQuestEvent('boss', 1);
    triggerQuestEvent('gold', gold);
    NoblesseService.recordKill(state, monster, { log });

    if (monster.isTower) {
      onTowerFloorVictory(monster.towerFloor);
    }

    if (monster.isRaid) {
      serviceHandleRaidVictory(state, state.activeRaidId || state.target, {
        log,
        onUpdate: () => { updateAllUI(); save(); }
      });
      state.isRaidActive = false;
      state.activeRaidId = null;
      state.zone = state.lastSafeZone || (state.race ? (RACES[state.race]?.startZone || 'talkingIsland') : 'talkingIsland');
      state.target = null;
      state.activeMonster = null;
    }

    checkLevelUp();
    if (state.isCombatActive !== false) {
      pickRandomMonster();
    }
  } else { 
    if (monsterAttackTimeout) clearTimeout(monsterAttackTimeout);
    if (state.isCombatActive !== false) {
      monsterAttackTimeout = setTimeout(() => monsterAttack(monster), 500); 
    }
  }
  updateStatsUI();
}

function monsterAttack(monster) {
  if (state.isCombatActive === false || !state.target || state.hp <= 0) return;
  const now = combatTick * 200;
  if (monster._stunnedUntil && monster._stunnedUntil > now) return; 
  
  const stats = getStats(); stageMonsterLunge();
  if (Math.random() < stats.eva / 100) { log(`${monster.name} missed!`, 'combat'); stageFloat('DODGE', 'sf-miss', 'left'); return; }
  
  const type = (monster.atkType === 'magical' || monster.isMage === true) ? 'magical' : 'physical';
  let damage = dealDamage({ def: stats.def, mdef: stats.mdef }, monster.atk, type);

  // Level Gap Penalty: se o monstro tem nível muito superior ao jogador (+5 níveis), o dano recebido aumenta
  const levelDiff = (monster.lvl || 1) - (state.level || 1);
  if (levelDiff > 5) {
    const extraDmgMult = 1 + Math.min(1.5, (levelDiff - 5) * 0.15);
    damage = Math.floor(damage * extraDmgMult);
  }

  if (state.godMode) damage = 0;
  if (damage > 0) { state.hp -= damage; log(`${monster.name} hits for ${damage}`, 'damage'); stageHeroHurt(damage); }
  if (state.hp <= 0) { state.hp = 0; playerDeath(monster); }
  updateStatsUI();
}

// --------------------------- GM ADMIN & CHAT CONSOLE ---------------------------
function generateUid() { return 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9); }

function spawnAdminItem(itemId, qty = 1, rarity = 'common', enchant = 0, affixChoice = 'roll', isFoundation = false) {
  const def = getItemDef(itemId);
  if (!def) { log(`[Admin] Item '${itemId}' não encontrado.`, 'system'); return; }
  const realId = def.id || itemId;
  
  if (def.stack && (def.slot === 'consumable' || def.slot === 'material' || def.slot === 'scroll' || def.slot === 'powerup') && rarity === 'common' && !isFoundation) {
    addToInventory(realId, qty, null, false, {}, true);
  } else {
    for (let i = 0; i < qty; i++) {
      const isEquip = def.slot && def.slot !== 'consumable' && def.slot !== 'material' && def.slot !== 'scroll' && def.slot !== 'powerup';
      let affixes = [];
      if (isEquip) {
        if (affixChoice === 'roll' || !affixChoice) {
          affixes = D().rollAffixes ? D().rollAffixes(rarity) : [];
        } else if (affixChoice && affixChoice !== 'none') {
          const defAff = D().AFFIX_MAP ? D().AFFIX_MAP[affixChoice] : null;
          if (defAff) {
            const val = defAff.min + Math.floor(Math.random() * (defAff.max - defAff.min + 1));
            affixes = [{ id: affixChoice, value: val }];
          }
        }
      }
      state.inventory.push({
        uid: generateUid(),
        itemId: realId,
        rarity: rarity,
        enchant: enchant,
        affixes: affixes,
        foundation: !!isFoundation,
        equipped: false,
        count: 1
      });
    }
  }

  const enchantStr = enchant > 0 ? `+${enchant} ` : '';
  const foundationStr = isFoundation ? '✨ [FOUNDATION] ' : '';
  log(`🎁 [Admin] ${qty}x ${foundationStr}${enchantStr}${def.name} [${rarity}] gerado(s) na mochila!`, 'rarity-legendary');
  floatText('🎁 ITEM GERADO!', 'float-jackpot');
  updateAllUI();
  save();
}

// calcSpForLevel importado do LevelEngine.js (Sprint 2)


function applyAdminLevelChange(targetLevel) {
  const newLvl = Math.max(1, Math.min(100, targetLevel));
  state.level = newLvl;
  state.xp = getTotalXP(newLvl - 1);

  // 1. Concede SP proporcional ao nível + 1000 SP de bônus para testes de habilidades
  const cumulativeSp = calcSpForLevel(newLvl);
  state.sp = Math.max(state.sp || 0, cumulativeSp + 1000);

  // 2. Recalcula vida/mana e restaura ao máximo
  const stats = getStats();
  state.maxHp = stats.maxHp;
  state.maxMp = stats.maxMp;
  state.hp = state.maxHp;
  state.mp = state.maxMp;

  // 3. Atualiza Sagas e Zonas do Mapa
  let highestSaga = 0;
  for (let i = 0; i < SAGAS.length; i++) {
    if (state.level >= SAGAS[i].unlocksAt) {
      highestSaga = i;
    }
  }
  state.currentSaga = highestSaga;

  // 4. Log e feedback visual do nível
  playSfx('levelUp');
  log(`⚡ [Admin] Nível alterado para ${newLvl}! SP (+${cumulativeSp + 1000}), HP/MP, Sagas, Mapa de Caça e Habilidades sincronizados.`, 'rarity-legendary');
  floatText(`⚡ NIVEL ${newLvl}!`, 'float-jackpot');

  // 5. Atualiza todos os módulos visuais (Troca de classe, Árvore de Skills, Mapa, Subclasses, Raids, Missões)
  checkClassAdvancement();
  renderZoneMap();
  updateSkillUI();
  renderSubclassesUI();
  updateRaidUI();
  updateQuestsUI();
  renderBattlePassUI();
  updateAllUI();
  save();
}

function handleChatSubmit(inputStr) {
  if (!inputStr || !inputStr.trim()) return;
  const raw = inputStr.trim();
  const lower = raw.toLowerCase();

  const isAdminCmd = lower.startsWith('//') || lower === '/admin' || lower === 'admin' || lower === 'gm' || lower === '//gm';
  if (isAdminCmd) {
    if ((state.privilegeLevel || 0) < 1) {
      log('⛔ [Acesso Negado] Você precisa ter privilégio de Administrador (Nível 1) para usar comandos GM!', 'damage');
      floatText('⛔ ACESSO NEGADO', 'sf-hurt');
      return;
    }
  }

  // Open Admin Console secret commands
  if (lower === '//admin' || lower === '/admin' || lower === '//gm' || lower === 'admin' || lower === 'gm') {
    openAdminModal();
    log('🛡️ [GM Console] Acesso Concedido! Painel de Administrador desbloqueado.', 'rarity-legendary');
    return;
  }

  // Direct Admin Cheats
  if (lower.startsWith('//level ')) {
    const lvl = parseInt(lower.replace('//level ', '').trim());
    if (!isNaN(lvl) && lvl > 0 && lvl <= 100) {
      applyAdminLevelChange(lvl);
    }
    return;
  }

  if (lower.startsWith('//gold ')) {
    const amt = parseInt(lower.replace('//gold ', '').trim());
    if (!isNaN(amt)) {
      state.gold += amt;
      triggerQuestEvent('gold', amt);
      log(`🪙 [Admin] +${amt.toLocaleString()} Gold concedido!`, 'rarity-legendary');
      updateAllUI();
      save();
    }
    return;
  }

  if (lower.startsWith('//sp ')) {
    const amt = parseInt(lower.replace('//sp ', '').trim());
    if (!isNaN(amt)) {
      state.sp += amt;
      log(`✦ [Admin] +${amt.toLocaleString()} SP concedido!`, 'rarity-legendary');
      updateSkillUI();
      updateAllUI();
      save();
    }
    return;
  }

  if (lower === '//god') {
    state.godMode = !state.godMode;
    log(`🛡️ [Admin] God Mode (Invencibilidade): ${state.godMode ? 'ATIVADO' : 'DESATIVADO'}`, 'rarity-legendary');
    return;
  }

  if (lower.startsWith('//item ')) {
    const parts = raw.split(' ');
    const itemId = parts[1];
    const qty = parseInt(parts[2]) || 1;
    if (itemId) {
      spawnAdminItem(itemId, qty, 'epic', 7);
    }
    return;
  }

  // Normal Player Chat Message
  const heroName = (RACES[state.race]?.name || 'Hero') + ' ' + (getClass(state.class)?.name || 'Adventurer');
  log(`💬 [Global] ${heroName}: ${raw}`, 'system');
}

function openAdminModal() {
  if ((state.privilegeLevel || 0) < 1) {
    log('⛔ [Acesso Negado] Painel de Administrador restrito a usuários com Privilégio Nível 1!', 'damage');
    floatText('⛔ ACESSO NEGADO', 'sf-hurt');
    return;
  }
  const modal = el('admin-modal');
  if (!modal) return;
  const searchInput = el('admin-item-search');
  if (searchInput) searchInput.value = '';
  populateAdminItemSelect('');
  modal.classList.add('active');
}

function populateAdminItemSelect(query = '') {
  const sel = el('admin-item-select');
  if (!sel) return;
  sel.innerHTML = '';
  
  const seen = new Set();
  const list = [];
  const all = D().ALL_ITEMS || {};
  const rawQ = String(query || '').trim().toLowerCase();
  const queryTerms = rawQ.split(/\s+/).filter(Boolean);
  
  for (const [id, def] of Object.entries(all)) {
    if (!def || !def.name) continue;
    const primaryId = def.id || id;
    if (seen.has(primaryId)) continue;
    seen.add(primaryId);

    if (queryTerms.length > 0) {
      const grade = getItemGrade(def.req?.level || 1).toLowerCase();
      const searchableText = [
        def.name,
        primaryId,
        def.slot || '',
        def.type || '',
        def.weaponType || '',
        grade,
        `grade ${grade}`,
        `lv.${def.req?.level || 1}`
      ].join(' ').toLowerCase();

      const matchesAllTerms = queryTerms.every(term => searchableText.includes(term));
      if (!matchesAllTerms) continue;
    }

    list.push({ id: primaryId, def });
  }
  
  list.sort((a, b) => (b.def.tier || 1) - (a.def.tier || 1) || a.def.name.localeCompare(b.def.name));
  
  if (list.length === 0) {
    const opt = mkEl('option');
    opt.value = '';
    opt.textContent = `⚠️ Nenhum item encontrado para "${query}"`;
    opt.disabled = true;
    sel.appendChild(opt);
    return;
  }

  for (const { id, def } of list) {
    const opt = mkEl('option');
    opt.value = id;
    const grade = getItemGrade(def.req?.level || 1);
    opt.textContent = `${def.name} [${grade}] (${def.slot || 'Item'} · Lv.${def.req?.level || 1})`;
    sel.appendChild(opt);
  }
}

function addAdminXP(amount) {
  const amt = parseInt(amount) || 0;
  if (amt <= 0) return;
  state.xp = (state.xp || 0) + amt;
  checkLevelUp();
  checkClassAdvancement();
  updateSkillUI();
  updateRaceClassUI();
  log(`🌟 [Admin] +${amt.toLocaleString()} XP concedido(s)! (Nível atual: ${state.level})`, 'rarity-legendary');
  floatText(`🌟 +${amt.toLocaleString()} XP!`, 'float-jackpot');
  updateAllUI();
  save();
}

function addAdminGold(amount) {
  const amt = parseInt(amount) || 0;
  if (amt <= 0) return;
  state.gold = (state.gold || 0) + amt;
  triggerQuestEvent('gold', amt);
  log(`🪙 [Admin] +${amt.toLocaleString()} Adena concedido(s)!`, 'rarity-legendary');
  floatText(`🪙 +${amt.toLocaleString()} Adena!`, 'float-gold');
  updateAllUI();
  save();
}

function addAdminSP(amount) {
  const amt = parseInt(amount) || 0;
  if (amt <= 0) return;
  state.sp = (state.sp || 0) + amt;
  log(`✦ [Admin] +${amt.toLocaleString()} SP concedido(s)!`, 'rarity-legendary');
  floatText(`✦ +${amt.toLocaleString()} SP!`, 'float-jackpot');
  updateSkillUI();
  updateAllUI();
  save();
}

function addAdminAC(amount) {
  const amt = parseInt(amount) || 0;
  if (amt <= 0) return;
  state.adenCoins = (state.adenCoins || 0) + amt;
  log(`🪙 [Admin] +${amt.toLocaleString()} Aden Coins (AC) concedida(s)!`, 'rarity-legendary');
  floatText(`🪙 +${amt.toLocaleString()} AC!`, 'float-gold');
  updateAllUI();
  save();
}

function adminUnlockSagas() {
  const sagas = D().SAGAS || {};
  state.unlockedSagas = state.unlockedSagas || {};
  for (const sagaId of Object.keys(sagas)) {
    state.unlockedSagas[sagaId] = true;
  }
  log('📜 [Admin] Todas as Sagas foram DESBLOQUEADAS!', 'rarity-legendary');
  floatText('📜 SAGAS DESBLOQUEADAS', 'float-jackpot');
  updateAllUI();
  save();
}

function adminCompleteQuest() {
  if (state.quests && state.quests.length > 0) {
    for (const q of state.quests) {
      q.progress = q.target;
      q.completed = true;
    }
    log('✅ [Admin] Todas as Missões Ativas foram CONCLUÍDAS!', 'rarity-legendary');
    floatText('✅ MISSÕES CONCLUÍDAS', 'float-jackpot');
    updateQuestUI();
    updateAllUI();
    save();
  } else {
    log('Nenhuma missão ativa encontrada para concluir.', 'system');
  }
}

function adminMaxCraft() {
  state.craftLevel = 50;
  state.craftXp = 0;
  state.craftCharges = 100;
  state.craftPoints = 0;
  log('⚒️ [Admin] Forja no Level Máximo (50) + 100 Cargas de Random Craft!', 'rarity-legendary');
  floatText('⚒️ CRAFT MÁXIMO', 'float-jackpot');
  updateAllUI();
  save();
}

function adminMaxSkills() {
  const skillDefs = D().SKILL_DEFS || {};
  for (const [skillId, def] of Object.entries(skillDefs)) {
    if (def && classSatisfies(state.class, def.classReq)) {
      state.skills[skillId] = def.max || 5;
    }
  }
  log('📖 [Admin] Todas as Habilidades da Classe foram MAXIMIZADAS!', 'rarity-legendary');
  floatText('📖 SKILLS MÁXIMAS', 'float-jackpot');
  updateSkillUI();
  updateAllUI();
  save();
}

function adminKillMonster() {
  const monster = state.currentMonster;
  if (monster) {
    log(`⚡ [Admin] Matou o monstro ${monster.name} instantaneamente!`, 'rarity-legendary');
    monster.hp = 0;
    onMonsterDefeated(monster);
  } else {
    log('Nenhum monstro em combate ativo.', 'system');
  }
}

function executeAdminCmd(cmd) {
  if (cmd === 'level20') { applyAdminLevelChange(20); }
  else if (cmd === 'level40') { applyAdminLevelChange(40); }
  else if (cmd === 'level76') { applyAdminLevelChange(76); }
  else if (cmd === 'level85') { applyAdminLevelChange(85); }
  else if (cmd === 'add1level') { applyAdminLevelChange((state.level || 1) + 1); }
  else if (cmd === 'add5levels') { applyAdminLevelChange((state.level || 1) + 5); }
  else if (cmd === 'gold1m') { addAdminGold(1000000); }
  else if (cmd === 'gold10m') { addAdminGold(10000000); }
  else if (cmd === 'sp5k') { addAdminSP(5000); }
  else if (cmd === 'sp50k') { addAdminSP(50000); }
  else if (cmd === 'ac500') { addAdminAC(500); }
  else if (cmd === 'ac2000') { addAdminAC(2000); }
  else if (cmd === 'godmode') { state.godMode = !state.godMode; log(`🛡️ [Admin] Invencibilidade: ${state.godMode ? 'ATIVADO' : 'DESATIVADO'}!`, 'rarity-legendary'); }
  else if (cmd === 'healfull') { const stats = getStats(); state.hp = stats.maxHp; state.mp = stats.maxMp; log('❤️ [Admin] HP/MP Restaurados 100%!', 'rarity-legendary'); }
  else if (cmd === 'unlocksagas') { adminUnlockSagas(); }
  else if (cmd === 'completequest') { adminCompleteQuest(); }
  else if (cmd === 'maxcraft') { adminMaxCraft(); }
  else if (cmd === 'maxskills') { adminMaxSkills(); }
  else if (cmd === 'killmonster') { adminKillMonster(); }
  else if (cmd === 'autoequip') { autoEquipBest(); }
  else if (cmd === 'resetsave') { resetSave(); }

  updateAllUI();
  save();
}

function updateZoneKillProgressUI() {
  const killEl = el('zone-kill-progress');
  if (killEl && state.zone) {
    state.zoneKills = state.zoneKills || {};
    const count = state.zoneKills[state.zone] || 0;
    const req = 50;
    killEl.textContent = `⚔️ ${count}/${req} Caçados`;
    if (count >= req) {
      killEl.style.color = '#ef4444';
      killEl.style.borderColor = 'rgba(239,68,68,0.5)';
      killEl.textContent = `🚨 CHEFÃO DISPONÍVEL!`;
    } else {
      killEl.style.color = '#f59e0b';
      killEl.style.borderColor = 'rgba(245,158,11,0.3)';
    }
  }
}

function startCombat() { return engineStartCombat(state, { log, attackMonster }); }
function stopCombat() { return engineStopCombat(state); }
function pickRandomMonster() { return enginePickRandomMonster(state, { log, floatText, renderStageMonster, updateZoneKillProgressUI }); }
function selectZone(zoneId) { return engineSelectZone(state, zoneId, { log, updateAllUI, save, attackMonster }); }
// Shows the Saga Unlock modal with saga name/description
function showSagaModal(saga) {
  const modal = el('saga-modal');
  if (!modal) return;
  const titleEl = el('saga-title');
  const descEl  = el('saga-desc');
  if (titleEl) titleEl.textContent = saga?.name || 'Nova Saga Desbloqueada!';
  if (descEl)  descEl.textContent  = saga?.desc || 'Novas zonas aguardam.';
  modal.classList.add('active');
}

function updateSagaProgress(silent = true) { return engineUpdateSagaProgress(state, silent, { log, floatText, showSagaModal }); }
function playerDeath(monster) { return enginePlayerDeath(state, monster, { log, el }); }
function resurrect(useScroll = false) { return engineResurrect(state, useScroll, { log, el, updateAllUI, save, attackMonster }); }

function spendSP(skillId) { return engineSpendSP(state, skillId, { log, floatText, classSatisfies, removeFromInventory, updateAllUI, save }); }
function resetSP() { return engineResetSP(state, { log, floatText, updateAllUI, save }); }


function autoEquipBest() {
  let equippedCount = 0;
  
  for (const slot of ALL_EQUIP_SLOTS) {
    const candidates = state.inventory.filter(i => {
      if (i.equipped) return false;
      const def = D().ALL_ITEMS[i.itemId];
      if (!def) return false;
      const targetSlot = resolveEquipSlot(def.slot);
      if (targetSlot !== slot) return false;
      if (def.req && def.req.level > state.level) return false;
      if (def.classReq && !classSatisfies(state.class, def.classReq)) return false;
      return true;
    });
    
    if (!candidates.length) continue;
    
    candidates.sort((a, b) => {
      const defA = D().ALL_ITEMS[a.itemId], defB = D().ALL_ITEMS[b.itemId];
      const multA = (a.rarity ? D().RARITY[a.rarity].mult : 1) * (1 + (a.enchant || 0) * 0.1);
      const multB = (b.rarity ? D().RARITY[b.rarity].mult : 1) * (1 + (b.enchant || 0) * 0.1);
      const scoreA = ((defA.atk || 0) + (defA.matk || 0) + (defA.def || 0) * 0.8 + (defA.mdef || 0) * 0.5 + (defA.hp || 0) * 0.1) * multA;
      const scoreB = ((defB.atk || 0) + (defB.matk || 0) + (defB.def || 0) * 0.8 + (defB.mdef || 0) * 0.5 + (defB.hp || 0) * 0.1) * multB;
      return scoreB - scoreA;
    });
    
    const bestItem = candidates[0];
    const currentUid = state.equipment[slot];
    if (currentUid) {
      const currentItem = state.inventory.find(i => i.uid === currentUid);
      if (currentItem) {
        const defCurr = D().ALL_ITEMS[currentItem.itemId];
        const multCurr = (currentItem.rarity ? D().RARITY[currentItem.rarity].mult : 1) * (1 + (currentItem.enchant || 0) * 0.1);
        const scoreCurr = ((defCurr.atk || 0) + (defCurr.matk || 0) + (defCurr.def || 0) * 0.8 + (defCurr.mdef || 0) * 0.5 + (defCurr.hp || 0) * 0.1) * multCurr;
        
        const defBest = D().ALL_ITEMS[bestItem.itemId];
        const multBest = (bestItem.rarity ? D().RARITY[bestItem.rarity].mult : 1) * (1 + (bestItem.enchant || 0) * 0.1);
        const scoreBest = ((defBest.atk || 0) + (defBest.matk || 0) + (defBest.def || 0) * 0.8 + (defBest.mdef || 0) * 0.5 + (defBest.hp || 0) * 0.1) * multBest;
        
        if (scoreBest <= scoreCurr) continue;
      }
    }
    
    equipItem(bestItem.uid, null, true);
    equippedCount++;
  }
  
  if (equippedCount > 0) {
    log(`⚡ Auto-equipped ${equippedCount} superior item(s)!`, 'rarity-legendary');
    floatText('⚡ EQUIPADO!', 'float-jackpot');
    updateAllUI();
    save();
  } else {
    log('Você já está usando os melhores equipamentos da mochila!', 'system');
  }
}

function unequipAll() {
  let count = 0;
  const equipObj = state.equipment || {};
  for (const slot of Object.keys(equipObj)) {
    if (equipObj[slot]) {
      unequipItem(slot, null, true);
      count++;
    }
  }
  if (count > 0) {
    log(`🛡️ Desequipou todos os ${count} itens da armadura.`, 'system');
    floatText('🛡️ DESEQUIPADO!', 'sf-heal');
    updateAllUI();
    save();
  } else {
    log('Nenhum item equipado para remover.', 'system');
  }
}

function setRace(raceId) {
  state.race = raceId;
  const raceMap = {
    human: 'fighter',
    elf: 'elfFighter',
    darkelf: 'darkElfFighter',
    orc: 'orcBase',
    dwarf: 'artisan',
    kamael: 'soulbreaker',
    sylph: 'sylphGunner',
    highelf: 'highElfBase',
    ertheia: 'bloodRoseBase'
  };
  state.class = raceMap[raceId] || 'fighter';
  const race = RACES[raceId];
  state.base = { ...race.stats };
  const cls = getClass(state.class);
  if (cls) {
    for (const k of ['atk','def','eva','matk','mdef']) {
      state.base[k] = (state.base[k] || 0) + (cls.base[k] || 0);
    }
  }
  const starterSkill = getStarterSkillForClass(state.class);
  if (starterSkill) { state.skills[starterSkill] = Math.max(1, state.skills[starterSkill] || 0); }
  updateRaceClassUI();
  updateStatsUI();
}

function setClass(classId) {
  if (state.race === 'dwarf' || state.race === 'kamael') return;
  state.class = classId;
  const race = RACES[state.race];
  if (race) state.base = { ...race.stats };
  const cls = getClass(classId);
  if (cls && race) {
    for (const k of ['atk','def','eva','matk','mdef']) {
      state.base[k] = (state.base[k] || 0) + (cls.base[k] || 0);
    }
  }
  const starterSkill = getStarterSkillForClass(classId);
  if (starterSkill) { state.skills[starterSkill] = Math.max(1, state.skills[starterSkill] || 0); }
  updateRaceClassUI();
  updateStatsUI();
}
function startGame() {
  if (!state.race || !state.class) {
    log('Select race and class before beginning the saga.', 'system');
    return;
  }
  state.zone = RACES[state.race]?.startZone || 'talkingIsland';
  const zoneEl = el('zone-name');
  if (zoneEl) zoneEl.textContent = ZONES[state.zone]?.name || 'Talking Island';
  updateAllUI();
  startCombat();
  save();
  qsa('.tab-btn').forEach(b => b.classList.remove('active'));
  const zoneTab = qs('.tab-btn[data-tab="zones"]');
  if (zoneTab) zoneTab.classList.add('active');
  qsa('.tab-pane').forEach(p => p.classList.remove('active'));
  const zonesPane = el('tab-zones');
  if (zonesPane) zonesPane.classList.add('active');
}

// CODEX_SETS foi movido para src/data/codex.js (Sprint 1)
// Os imports estão no topo do arquivo.


function getCodexBonuses() {
  const totals = { atk: 0, def: 0, matk: 0, mdef: 0, hp: 0, mp: 0, eva: 0, crit: 0 };
  state.codex = state.codex || {};
  for (const [setId, setDef] of Object.entries(CODEX_SETS)) {
    const regList = state.codex[setId] || [];
    if (setDef.items.every(itemId => regList.includes(itemId))) {
      for (const [k, val] of Object.entries(setDef.bonus)) {
        totals[k] = (totals[k] || 0) + val;
      }
    }
  }

  if (typeof CardCodexService !== 'undefined' && CardCodexService.getCodexPassiveBonuses) {
    const cardB = CardCodexService.getCodexPassiveBonuses(state);
    totals.atk += Math.floor(cardB.pAtk || 0);
    totals.def += Math.floor(cardB.pDef || 0);
    totals.matk += Math.floor(cardB.mAtk || 0);
    totals.mdef += Math.floor(cardB.mDef || 0);
    totals.hp += Math.floor(cardB.maxHp || 0);
    totals.mp += Math.floor(cardB.maxMp || 0);
    totals.crit += Math.floor(cardB.critRate || 0);
  }

  return totals;
}

function updateCodexUI() {
  const grid = el('codex-grid'); if (!grid) return;
  const summaryEl = el('codex-summary');
  grid.innerHTML = '';
  state.codex = state.codex || {};
  state.cardCodex = state.cardCodex || {};

  const subTab = window._codexSubTab || 'sets';

  // Sub-abas do Codex
  const tabsNav = mkEl('div');
  tabsNav.style.cssText = 'display:flex; gap:8px; margin-bottom:14px; border-bottom:1px solid rgba(212,175,55,0.25); padding-bottom:8px;';
  tabsNav.innerHTML = `
    <button class="inv-batch-btn ${subTab === 'sets' ? 'active' : ''}" style="font-family:\'Cinzel\',serif; font-weight:bold; ${subTab === 'sets' ? 'background:linear-gradient(180deg,#d4a744,#8a641c); color:#000;' : ''}" onclick="window.setCodexSubTab('sets')">📜 Coleções de Equipamentos</button>
    <button class="inv-batch-btn ${subTab === 'cards' ? 'active' : ''}" style="font-family:\'Cinzel\',serif; font-weight:bold; ${subTab === 'cards' ? 'background:linear-gradient(180deg,#d4a744,#8a641c); color:#000;' : ''}" onclick="window.setCodexSubTab('cards')">🃏 Álbum de Cartas & Dolls de Monstros</button>
  `;
  grid.appendChild(tabsNav);

  if (subTab === 'cards') {
    renderMonsterCardsCodex(grid, summaryEl);
    return;
  }

  let totalSets = Object.keys(CODEX_SETS).length, completedSets = 0;

  for (const [setId, setDef] of Object.entries(CODEX_SETS)) {
    const regList = state.codex[setId] || [];
    const isComplete = setDef.items.every(i => regList.includes(i));
    if (isComplete) completedSets++;

    const card = mkEl('div');
    card.className = 'codex-card' + (isComplete ? ' completed' : '');
    card.style.cssText = 'border: 1px solid var(--border-gilt); padding: 12px; border-radius: 8px; background: rgba(15,18,25,0.8); margin-bottom: 12px;';

    const itemsHtml = setDef.items.map(itemId => {
      const itemDef = D().ALL_ITEMS[itemId] || { name: itemId };
      const isReg = regList.includes(itemId);
      const inInv = getInventoryCount(itemId) > 0 || getWarehouseCount(itemId) > 0;
      let btn = '';
      if (isReg) btn = '<span style="color:#10b981; font-weight:bold;">✓ Registrado</span>';
      else if (inInv) btn = `<button class="action-btn action-btn--primary codex-reg-btn" style="padding: 2px 8px; font-size: 11px;" data-set="${setId}" data-item="${itemId}" onclick="registerCodexItem('${setId}', '${itemId}')">Registrar 📥</button>`;
      else btn = '<span style="color:var(--text-muted); font-size: 11px;">Não possui</span>';

      return `<div style="display:flex; justify-content:space-between; align-items:center; margin: 4px 0; font-size: 12px;"><span>${itemDef.name}</span>${btn}</div>`;
    }).join('');

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h4 style="margin:0; color:${isComplete ? '#10b981' : 'var(--gilt-bright)'}">${setDef.name} ${isComplete ? '🏆 (Completo)' : ''}</h4>
        <span style="font-size:11px; background:rgba(0,0,0,0.5); padding:2px 8px; border-radius:10px; color:#f59e0b;">${setDef.label}</span>
      </div>
      <p style="font-size:11px; color:var(--text-muted); margin: 4px 0 8px 0;">${setDef.desc}</p>
      <div style="background:rgba(0,0,0,0.3); padding:8px; border-radius:6px;">${itemsHtml}</div>
    `;

    card.querySelectorAll('.codex-reg-btn').forEach(b => {
      b.onclick = () => registerCodexItem(b.dataset.set, b.dataset.item);
    });
    grid.appendChild(card);
  }

  if (summaryEl) {
    const b = getCodexBonuses();
    summaryEl.innerHTML = `<span style="color:var(--gilt-bright); font-weight:bold;">Coleções Concluídas: ${completedSets}/${totalSets}</span> · Bônus Totais: +${b.atk} ATK, +${b.def} DEF, +${b.matk} MATK, +${b.hp} HP`;
  }
}

function renderMonsterCardsCodex(container, summaryEl) {
  const allCards = MONSTER_CARDS || {};
  let totalCards = Object.keys(allCards).length;
  let absorbedCards = 0;

  const cardsContainer = mkEl('div');
  cardsContainer.style.cssText = 'display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:12px;';

  for (const [cardId, cardDef] of Object.entries(allCards)) {
    const current = state.cardCodex?.[cardId] || { rank: 0, count: 0 };
    const isAbsorbed = current.rank > 0;
    if (isAbsorbed) absorbedCards++;

    const invCount = getInventoryCount(cardId) + getWarehouseCount(cardId);

    const bonusLabel = Object.entries(cardDef.codexBonus || {})
      .map(([stat, val]) => `+${typeof val === 'number' && val < 1 ? (val * 100).toFixed(0) + '%' : val} ${stat.toUpperCase()}`)
      .join(', ');

    const cardBox = mkEl('div');
    cardBox.style.cssText = `border: 1px solid ${isAbsorbed ? '#10b981' : 'rgba(212,175,55,0.3)'}; padding: 12px; border-radius: 8px; background: rgba(15,18,25,0.85); display:flex; flex-direction:column; justify-content:space-between;`;

    cardBox.innerHTML = `
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h4 style="margin:0; color:${isAbsorbed ? '#10b981' : 'var(--gilt-bright)'}">🃏 ${cardDef.name}</h4>
          <span style="font-size:10px; padding:2px 6px; border-radius:4px; background:rgba(0,0,0,0.5); color:#f59e0b; text-transform:uppercase;">${cardDef.rarity}</span>
        </div>
        <p style="font-size:11px; color:var(--text-muted); margin:4px 0;">👑 Fonte: Drop do Chefe <strong>${cardDef.monster}</strong> (${(cardDef.dropChance * 100).toFixed(2)}%)</p>
        <div style="background:rgba(0,0,0,0.3); padding:6px 8px; border-radius:6px; margin:6px 0; font-size:11px;">
          <span style="color:#6ee7b7; font-weight:bold;">Bônus Passivo na Conta:</span> ${bonusLabel || 'Nenhum'}
        </div>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; border-top:1px solid rgba(255,255,255,0.08); padding-top:6px;">
        <span style="font-size:11px; color:${isAbsorbed ? '#34d399' : 'var(--text-muted)'};">
          ${isAbsorbed ? `✓ Rank ${current.rank} (${current.count} absorvidas)` : 'Não Absorvida'}
        </span>
        ${invCount > 0 ? `
          <button class="action-btn action-btn--primary" style="padding:3px 10px; font-size:11px;" onclick="window.absorbCardAction('${cardId}')">Absorver 📥 (${invCount})</button>
        ` : `
          <span style="font-size:11px; color:var(--text-muted);">Não possui</span>
        `}
      </div>
    `;

    cardsContainer.appendChild(cardBox);
  }

  container.appendChild(cardsContainer);

  if (summaryEl) {
    summaryEl.innerHTML = `<span style="color:var(--gilt-bright); font-weight:bold;">Álbum de Cartas: ${absorbedCards}/${totalCards} Cartas Absorvidas</span> · Bônus Permanentes Ativos na Conta`;
  }
}

function registerCodexItem(setId, itemId) {
  const invIdx = state.inventory.findIndex(i => i.itemId === itemId && !i.equipped);
  let foundInWarehouse = false;
  let whIdx = -1;

  if (invIdx >= 0) {
    state.inventory.splice(invIdx, 1);
  } else {
    whIdx = (state.warehouse || []).findIndex(i => i.itemId === itemId && !i.equipped);
    if (whIdx >= 0) {
      state.warehouse.splice(whIdx, 1);
      foundInWarehouse = true;
    } else {
      log('Você não possui este item para registrar no Codex.', 'system');
      return;
    }
  }

  state.codex = state.codex || {};
  state.codex[setId] = state.codex[setId] || [];
  if (!state.codex[setId].includes(itemId)) state.codex[setId].push(itemId);

  const itemDef = D().ALL_ITEMS[itemId];
  log(`📜 Item **${itemDef?.name || itemId}** registrado com sucesso no Codex!${foundInWarehouse ? ' (Retirado do Baú)' : ''}`, 'rarity-rare');
  floatText('📜 CODEX REGISTRADO!', 'float-jackpot');
  triggerQuestEvent('codex', 1);

  const setDef = CODEX_SETS[setId];
  if (setDef && setDef.items.every(i => state.codex[setId].includes(i))) {
    log(`🏆 PARABÉNS! Coleção **${setDef.name}** 100% Completa! Bônus Permanente Ativado: ${setDef.label}`, 'rarity-legendary');
    floatText('🏆 COLEÇÃO COMPLETA!', 'float-jackpot');
  }

  updateAllUI(); save();
}

// BOSS_DOLLS foi movido para src/data/codex.js (Sprint 1)
// Os imports estão no topo do arquivo.


function getDollsBonuses() {
  const totals = { atk: 0, def: 0, matk: 0, mdef: 0, hp: 0, mp: 0, eva: 0, crit: 0, speed: 0, lifesteal: 0 };
  state.dolls = state.dolls || [];
  for (const d of state.dolls) {
    const dollDef = BOSS_DOLLS[d.dollId];
    if (!dollDef) continue;
    const lvlInfo = dollDef.statsByLvl[d.level || 1];
    if (!lvlInfo) continue;
    for (const [k, v] of Object.entries(lvlInfo)) {
      if (k !== 'label') totals[k] = (totals[k] || 0) + v;
    }
  }
  return totals;
}

function updateDollsUI() {
  const grid = el('dolls-grid'); if (!grid) return;
  const summaryEl = el('dolls-summary');
  grid.innerHTML = '';
  state.dolls = state.dolls || [];
  state.synthSelected = state.synthSelected || [null, null];

  const slot1El = el('synth-slot-1');
  const slot2El = el('synth-slot-2');
  const d1 = state.dolls.find(i => i.uid === state.synthSelected[0]);
  const d2 = state.dolls.find(i => i.uid === state.synthSelected[1]);

  if (slot1El) slot1El.textContent = d1 ? `${BOSS_DOLLS[d1.dollId]?.name} Lv.${d1.level}` : 'Doll Base';
  if (slot2El) slot2El.textContent = d2 ? `${BOSS_DOLLS[d2.dollId]?.name} Lv.${d2.level}` : 'Doll Material';

  const synthBtn = el('start-doll-synth-btn');
  if (synthBtn) synthBtn.onclick = synthesizeDolls;

  for (const d of state.dolls) {
    const def = BOSS_DOLLS[d.dollId]; if (!def) continue;
    const lvlInfo = def.statsByLvl[d.level || 1];
    const isSel1 = state.synthSelected[0] === d.uid;
    const isSel2 = state.synthSelected[1] === d.uid;

    const item = mkEl('div');
    item.className = 'doll-card' + (isSel1 || isSel2 ? ' selected' : '');
    item.style.cssText = `border: 2px solid ${isSel1 || isSel2 ? 'var(--gilt-bright)' : 'var(--border-gilt)'}; padding: 10px; border-radius: 8px; background: rgba(20,25,35,0.9); display: flex; align-items: center; justify-content: space-between;`;
    item.innerHTML = `
      <div style="display:flex; align-items:center; gap: 10px;">
        <span style="font-size: 24px;">${def.icon}</span>
        <div>
          <div style="font-weight:bold; color:var(--gilt-bright);">${def.name} <span style="color:#60a5fa;">Lv.${d.level || 1}</span></div>
          <div style="font-size:11px; color:#10b981;">${lvlInfo?.label || ''}</div>
        </div>
      </div>
      <button class="action-btn synth-doll-btn" style="padding: 4px 8px; font-size: 11px;" data-uid="${d.uid}" onclick="selectDollForSynth('${d.uid}')">${isSel1 ? 'Slot 1' : isSel2 ? 'Slot 2' : 'Selecionar 🔮'}</button>
    `;
    item.querySelectorAll('.synth-doll-btn').forEach(b => {
      b.onclick = () => selectDollForSynth(b.dataset.uid);
    });
    grid.appendChild(item);
  }

  if (summaryEl) {
    const b = getDollsBonuses();
    summaryEl.innerHTML = `Dolls na Coleção: <strong>${state.dolls.length}</strong> · Bônus Totais: +${b.atk} ATK, +${b.def} DEF, +${b.matk} MATK`;
  }

  // Render Enciclopédia de Boss Dolls & Fontes de Obtenção
  const encyclopediaEl = el('dolls-encyclopedia');
  if (encyclopediaEl) {
    let encHtml = `
      <div style="background:rgba(12,16,26,0.95); border:1px solid rgba(212,167,68,0.4); border-radius:12px; padding:14px;">
        <h4 style="margin:0 0 12px 0; font-family:'Cinzel',serif; color:#f4d58a; font-size:15px; display:flex; align-items:center; gap:8px;">
          📚 Enciclopédia de Boss Dolls &amp; Fontes de Drop
        </h4>
    `;

    for (const [dId, def] of Object.entries(BOSS_DOLLS)) {
      const ownedDolls = state.dolls.filter(i => i.dollId === dId);
      const maxOwnedLvl = ownedDolls.reduce((max, d) => Math.max(max, d.level || 1), 0);
      const isUnlocked = ownedDolls.length > 0;

      let lvlBadgesHtml = '';
      for (let lvl = 1; lvl <= 5; lvl++) {
        const info = def.statsByLvl[lvl];
        if (!info) continue;
        const isThisLvl = maxOwnedLvl === lvl;
        lvlBadgesHtml += `
          <div style="font-size:11px; padding:5px 8px; border-radius:6px; background:${isThisLvl ? 'rgba(52,211,153,0.2)' : 'rgba(0,0,0,0.4)'}; border:1px solid ${isThisLvl ? '#34d399' : 'rgba(255,255,255,0.08)'}; color:${isThisLvl ? '#34d399' : '#aaa'}; display:flex; justify-content:space-between; align-items:center;">
            <span><strong>Lv.${lvl}:</strong> ${info.label}</span>
            ${isThisLvl ? '<span style="color:#34d399; font-weight:bold;">[ATIVO]</span>' : ''}
          </div>
        `;
      }

      encHtml += `
        <div style="background:rgba(18,24,36,0.9); border:1px solid ${isUnlocked ? 'rgba(212,167,68,0.5)' : 'rgba(255,255,255,0.08)'}; border-radius:10px; padding:12px; margin-bottom:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:8px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <span style="font-size:26px;">${def.icon}</span>
              <div>
                <h4 style="margin:0; font-family:'Cinzel',serif; color:${isUnlocked ? '#f4d58a' : '#aaa'}; font-size:14px; display:flex; align-items:center; gap:6px;">
                  ${def.name} ${isUnlocked ? `<span style="font-size:10px; background:rgba(52,211,153,0.2); border:1px solid #34d399; color:#34d399; padding:1px 6px; border-radius:4px;">Nível Ativo: Lv.${maxOwnedLvl}</span>` : '<span style="font-size:10px; background:rgba(239,68,68,0.2); border:1px solid #ef4444; color:#fca5a5; padding:1px 6px; border-radius:4px;">🔒 Não Bloqueado</span>'}
                </h4>
                <p style="margin:2px 0 0 0; font-size:11px; color:#94a3b8;">${def.desc}</p>
              </div>
            </div>
            <div style="font-size:11px; background:rgba(0,0,0,0.5); border:1px solid rgba(212,167,68,0.3); padding:4px 10px; border-radius:8px; color:#ffd877; font-weight:bold;">
              📍 Drop: ${def.source}
            </div>
          </div>

          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:6px; margin-top:8px;">
            ${lvlBadgesHtml}
          </div>
        </div>
      `;
    }
    encHtml += `</div>`;
    encyclopediaEl.innerHTML = encHtml;
  }
}

function selectDollForSynth(uid) {
  state.synthSelected = state.synthSelected || [null, null];
  if (state.synthSelected[0] === uid) state.synthSelected[0] = null;
  else if (state.synthSelected[1] === uid) state.synthSelected[1] = null;
  else if (!state.synthSelected[0]) state.synthSelected[0] = uid;
  else if (!state.synthSelected[1]) state.synthSelected[1] = uid;
  else state.synthSelected[0] = uid;
  updateDollsUI();
}

function synthesizeDolls() {
  state.synthSelected = state.synthSelected || [null, null];
  const u1 = state.synthSelected[0], u2 = state.synthSelected[1];
  if (!u1 || !u2 || u1 === u2) { log('Selecione 2 Dolls idênticas no altar de síntese.', 'system'); return; }

  const idx1 = state.dolls.findIndex(d => d.uid === u1);
  const idx2 = state.dolls.findIndex(d => d.uid === u2);
  if (idx1 < 0 || idx2 < 0) return;

  const d1 = state.dolls[idx1], d2 = state.dolls[idx2];
  if (d1.dollId !== d2.dollId || d1.level !== d2.level) { log('As duas Dolls devem ser do mesmo tipo e nível!', 'system'); return; }
  if (d1.level >= 5) { log('Sua Doll já está no Nível Máximo (Lv. 5)!', 'system'); return; }

  const rates = { 1: 0.70, 2: 0.55, 3: 0.40, 4: 0.25 };
  const chance = rates[d1.level] || 0.30;
  const roll = Math.random();

  state.dolls.splice(idx2, 1);
  state.synthSelected = [null, null];

  if (roll < chance) {
    d1.level += 1;
    log(`🎉 SÍNTESE DE SUCESSO! Sua **${BOSS_DOLLS[d1.dollId]?.name}** evoluiu para o **Nível ${d1.level}**!`, 'rarity-legendary');
    floatText('✨ SÍNTESE SUCESSO!', 'float-jackpot');
  } else {
    log(`💔 SÍNTESE FALHOU! A Doll de material foi consumida, mas a Doll base foi mantida.`, 'system');
    floatText('💔 FALHOU', 'float-gold');
  }

  updateAllUI(); save();
}

// --------------------------- MAGIC LAMP & CRAFT GAUGE ---------------------------
function updateMagicLampUI() {
  const bar = el('lamp-progress-bar');
  const countLabel = el('lamp-count-label');
  const pct = Math.min(100, Math.floor(((state.magicLampExp || 0) / 50000) * 100));
  if (bar) bar.style.width = pct + '%';
  if (countLabel) countLabel.textContent = `${state.magicLamps || 0} Lâmpadas Mágicas Disponíveis (${pct}% para a próxima)`;

  const btn = el('use-magic-lamp-btn');
  if (btn) btn.onclick = useMagicLamp;

  updateCraftGaugeUI();
}

function useMagicLamp() {
  if (!state.magicLamps || state.magicLamps < 1) { log('Você não possui Lâmpadas Mágicas para sortear!', 'system'); return; }

  state.magicLamps -= 1;
  const roll = Math.random();
  let cardType = 'blue', expWon = 50000, spWon = 5000, cardName = '🟦 Carta Azul (Normal)';

  if (roll < 0.05) {
    cardType = 'red'; expWon = 500000; spWon = 50000; cardName = '🟥 Carta Vermelha (SUPER JACKPOT!)';
  } else if (roll < 0.25) {
    cardType = 'purple'; expWon = 150000; spWon = 15000; cardName = '🟪 Carta Roxa (Bônus Alto)';
  }

  state.xp += expWon; state.sp += spWon;
  checkLevelUp();

  const cardRes = el('lamp-result-card');
  if (cardRes) {
    cardRes.innerHTML = `
      <div style="border:2px solid var(--gilt-bright); padding:16px; border-radius:10px; background:rgba(10,15,25,0.9); text-align:center;">
        <h4 style="margin:0; font-size:18px;">${cardName}</h4>
        <p style="font-size:16px; color:#60a5fa; margin:8px 0 0 0;">+${expWon.toLocaleString()} XP &amp; +${spWon.toLocaleString()} SP!</p>
      </div>
    `;
  }

  log(`🪔 Lâmpada Mágica utilizada! Sorteou **${cardName}** (+${expWon.toLocaleString()} XP, +${spWon.toLocaleString()} SP)!`, 'rarity-legendary');
  floatText(`🪔 +${expWon.toLocaleString()} XP!`, 'float-jackpot');

  updateAllUI(); save();
}

function updateCraftGaugeUI() {
  const bar = el('craft-progress-bar');
  const label = el('craft-count-label');
  const pct = Math.min(100, Math.floor(((state.craftPoints || 0) / 100) * 100));
  if (bar) bar.style.width = pct + '%';
  if (label) label.textContent = `${state.craftCharges || 0} Cargas de Craft Disponíveis (${pct}%)`;

  const refBtn = el('refresh-random-craft-btn');
  const spinBtn = el('spin-random-craft-btn');
  if (refBtn) refBtn.onclick = refreshRandomCraftWheel;
  if (spinBtn) spinBtn.onclick = spinRandomCraft;

  renderRandomCraftWheelUI();
  renderSpecialCraftRecipes();
}

function refreshRandomCraftWheel() {
  const pool = Object.keys(D().ALL_ITEMS);
  const selected = [];
  for (let i = 0; i < 5; i++) {
    const itemKey = pool[Math.floor(Math.random() * pool.length)];
    selected.push(itemKey);
  }
  state.randomCraftWheel = selected;
  log('🎰 Roleta Random Craft atualizada com 5 novos itens!', 'system');
  renderRandomCraftWheelUI(); save();
}

function renderRandomCraftWheelUI() {
  const container = el('random-wheel-slots'); if (!container) return;
  container.innerHTML = '';
  if (!state.randomCraftWheel || !state.randomCraftWheel.length) refreshRandomCraftWheel();

  state.randomCraftWheel.forEach((itemId, idx) => {
    const def = D().ALL_ITEMS[itemId] || { name: itemId };
    const div = mkEl('div');
    div.style.cssText = 'border:1px solid var(--border-gilt); padding:10px; border-radius:8px; min-width:110px; text-align:center; background:rgba(0,0,0,0.4);';
    div.innerHTML = `<div style="font-size:11px; color:var(--text-muted);">Slot ${idx+1}</div><div style="font-weight:bold; font-size:12px; margin-top:4px; color:var(--gilt-bright);">${def.name}</div>`;
    container.appendChild(div);
  });
}

function spinRandomCraft() {
  if (!state.craftCharges || state.craftCharges < 1) { log('Você não possui Cargas de Craft suficientes!', 'system'); return; }
  if (!state.randomCraftWheel || !state.randomCraftWheel.length) refreshRandomCraftWheel();

  state.craftCharges -= 1;
  const wonId = state.randomCraftWheel[Math.floor(Math.random() * state.randomCraftWheel.length)];
  const def = D().ALL_ITEMS[wonId];

  if (def && ['weapon','armor','helmet','gloves','boots','ring','necklace','earring','belt','cloak','talisman','legs','shield','hair','hair2'].includes(def.slot)) {
    addToInventory(wonId, 1, 'rare', false, {}, true);
  } else {
    addToInventory(wonId, 1, null, false, {}, true);
  }

  log(`🎰 RANDOM CRAFT! Você criou com sucesso: **${def?.name || wonId}**!`, 'rarity-legendary');
  floatText(`🎰 ${def?.name || wonId}!`, 'float-jackpot');
  triggerQuestEvent('craft', 1);
  refreshRandomCraftWheel();
  updateAllUI(); save();
}

function renderSpecialCraftRecipes() {
  const grid = el('special-craft-grid'); if (!grid) return;
  grid.innerHTML = '';

  const recipes = [
    { id: 'spellbook_selector', name: '📖 Selector 4⭐ Star Spellbook', costCharges: 5, crystalId: 'crystal_s', crystalQty: 10, resultId: 'spellbook_4star' },
    { id: 'boss_doll_box', name: '📦 Caixas de Boss Dolls (Queen Ant/Baium/Zaken)', costCharges: 3, crystalId: 'crystal_a', crystalQty: 5, resultDoll: 'doll_queen_ant' },
    { id: 's_weapon_chest', name: '⚔️ Baú de Armas S-Grade', costCharges: 4, crystalId: 'crystal_a', crystalQty: 10, resultId: 'dragon_slayer' },
    { id: 'enchant_scroll_s', name: '📜 Scroll Enchant S-Grade', costCharges: 1, crystalId: 'crystal_b', crystalQty: 5, resultId: 'crystal_s' }
  ];

  recipes.forEach(r => {
    const card = mkEl('div');
    card.style.cssText = 'border:1px solid var(--border-gilt); padding:10px; border-radius:8px; background:rgba(15,20,30,0.8);';
    card.innerHTML = `
      <div style="font-weight:bold; color:var(--gilt-bright); font-size:12px;">${r.name}</div>
      <div style="font-size:11px; color:var(--text-muted); margin:4px 0;">Custo: ${r.costCharges} Cargas + ${r.crystalQty}x ${D().ALL_ITEMS[r.crystalId]?.name || r.crystalId}</div>
      <button class="action-btn action-btn--primary special-craft-btn" style="padding:2px 8px; font-size:11px; width:100%; margin-top:6px;" data-recipe="${r.id}" onclick="craftSpecialRecipe('${r.id}')">Forjar ✨</button>
    `;
    card.querySelectorAll('.special-craft-btn').forEach(b => {
      b.onclick = () => craftSpecialRecipe(b.dataset.recipe);
    });
    grid.appendChild(card);
  });
}

function removeFromInventoryByItemId(itemId, count = 1) {
  let remaining = count;
  for (let i = state.inventory.length - 1; i >= 0; i--) {
    const item = state.inventory[i];
    if (item.itemId === itemId && !item.equipped) {
      const take = Math.min(remaining, item.count || 1);
      item.count = (item.count || 1) - take;
      remaining -= take;
      if (item.count <= 0) state.inventory.splice(i, 1);
      if (remaining <= 0) break;
    }
  }
}

function craftSpecialRecipe(recipeId) {
  if (recipeId === 'spellbook_selector') {
    if ((state.craftCharges || 0) < 5 || getInventoryCount('crystal_s') < 10) { log('Recursos insuficientes! Requer 5 Cargas de Craft e 10x Crystal S.', 'system'); return; }
    state.craftCharges -= 5; removeFromInventoryByItemId('crystal_s', 10);
    addToInventory('spellbook_4star', 1);
    log('✨ SPECIAL CRAFT! Criou 1x Spellbook 4-Star ⭐!', 'rarity-legendary');
  } else if (recipeId === 'boss_doll_box') {
    if ((state.craftCharges || 0) < 3 || getInventoryCount('crystal_a') < 5) { log('Recursos insuficientes! Requer 3 Cargas de Craft e 5x Crystal A.', 'system'); return; }
    state.craftCharges -= 3; removeFromInventoryByItemId('crystal_a', 5);
    const dollKeys = ['doll_queen_ant', 'doll_baium', 'doll_orfen', 'doll_zaken'];
    const chosen = dollKeys[Math.floor(Math.random() * dollKeys.length)];
    state.dolls = state.dolls || [];
    state.dolls.push({ uid: 'doll_' + Date.now(), dollId: chosen, level: 1 });
    log(`✨ SPECIAL CRAFT! Abriu a caixa e obteve: **${BOSS_DOLLS[chosen]?.name}**!`, 'rarity-legendary');
  } else if (recipeId === 's_weapon_chest') {
    if ((state.craftCharges || 0) < 4 || getInventoryCount('crystal_a') < 10) { log('Recursos insuficientes! Requer 4 Cargas de Craft e 10x Crystal A.', 'system'); return; }
    state.craftCharges -= 4; removeFromInventoryByItemId('crystal_a', 10);
    addToInventory('dragon_slayer', 1, 'epic');
    log('✨ SPECIAL CRAFT! Criou 1x Dragon Slayer (S-Grade)!', 'rarity-legendary');
  } else if (recipeId === 'enchant_scroll_s') {
    if ((state.craftCharges || 0) < 1 || getInventoryCount('crystal_b') < 5) { log('Recursos insuficientes! Requer 1 Carga de Craft e 5x Crystal B.', 'system'); return; }
    state.craftCharges -= 1; removeFromInventoryByItemId('crystal_b', 5);
    addToInventory('crystal_s', 2);
    log('✨ SPECIAL CRAFT! Forjou 2x Crystal S!', 'rarity-rare');
  }
  triggerQuestEvent('craft', 1);
  updateAllUI(); save();
}

function attachGlobalErrorHandlers() {
  addTrackedListener(window, 'error', (event) => {
    console.warn('Global runtime notice:', event.error || event.message);
  });
  addTrackedListener(window, 'unhandledrejection', (event) => {
    console.warn('Unhandled promise rejection:', event.reason);
    event.preventDefault();
  });
}

const tabScrollMap = {};

export function openPanel(tabName) {
  state = getState();
  const targetTab = (!tabName || tabName === 'zones' || tabName === 'combat' || tabName === 'close') ? 'zones' : tabName;

  const root = document.getElementById('idle-host')?.shadowRoot || document;
  const currentActivePane = root.querySelector('.tab-pane.active');
  if (currentActivePane) {
    tabScrollMap[currentActivePane.id] = currentActivePane.scrollTop;
  }

  ensureAppLayout();
  showMenuPanel(targetTab);

  const pane = root.querySelector(`#tab-${targetTab}`);
  if (pane && tabScrollMap[pane.id] !== undefined) {
    pane.scrollTop = tabScrollMap[pane.id];
  }

  if (targetTab === 'inventory') safeUiUpdate('inventory', updateInventoryUI);
  else if (targetTab === 'character') safeUiUpdate('character', updateCharacterUI);
  else if (targetTab === 'skills') safeUiUpdate('skills', updateSkillUI);
  else if (targetTab === 'shop') safeUiUpdate('shop', updateShopUI);
  else if (targetTab === 'craft') safeUiUpdate('craft', updateCraftUI);
  else if (targetTab === 'alchemy') safeUiUpdate('alchemy', updateAlchemyUI);
  else if (targetTab === 'astral') safeUiUpdate('astral', updateAstralUI);
  else if (targetTab === 'expeditions') safeUiUpdate('expeditions', updateExpeditionsUI);
  else if (targetTab === 'raids') safeUiUpdate('raids', updateRaidsUI);
  else if (targetTab === 'olympiad') safeUiUpdate('olympiad', updateOlympiadUI);
  else if (targetTab === 'clan') safeUiUpdate('clan', updateClanUI);
  else if (targetTab === 'sevensigns') safeUiUpdate('sevensigns', updateSevenSignsUI);
  else if (targetTab === 'fortress') safeUiUpdate('fortress', updateFortressUI);
  else if (targetTab === 'colosseum') safeUiUpdate('colosseum', updateColosseumUI);
  else if (targetTab === 'rankings') safeUiUpdate('rankings', updateRankingsUI);
  else if (targetTab === 'enchant') safeUiUpdate('enchant', updateEnchantUI);
  else if (targetTab === 'zones') safeUiUpdate('zones', updateZoneUI);
  else if (targetTab === 'codex') safeUiUpdate('codex', updateCodexUI);
  else if (targetTab === 'dolls') safeUiUpdate('dolls', updateDollsUI);
  else if (targetTab === 'magiclamp') safeUiUpdate('magiclamp', updateMagicLampUI);
  else if (targetTab === 'quests') safeUiUpdate('quests', updateQuestsUI);
  else if (targetTab === 'tower') safeUiUpdate('tower', updateTowerUI);
  else if (targetTab === 'warehouse') safeUiUpdate('warehouse', updateWarehouseUI);

  try {
    checkTabGuide(targetTab, state, save);
  } catch(e) { /* silently fail — tutorial não bloqueia o jogo */ }
}

function depositAllToWarehouse() {
  const unequipped = state.inventory.filter(i => !i.equipped);
  if (unequipped.length === 0) {
    log('Nenhum item desequipado na mochila para guardar.', 'system');
    return;
  }
  let movedCount = 0;
  for (const item of [...unequipped]) {
    if (depositToWarehouse(item.uid, item.count || 1)) {
      movedCount++;
    } else {
      break;
    }
  }
  if (movedCount > 0) {
    log(`📦 ${movedCount} item(ns) guardado(s) no Baú.`, 'loot');
    updateAllUI(); save();
  }
}

function depositSelectedToWarehouse() {
  const selectedSet = getSelectedSet(state);
  if (!selectedSet || selectedSet.size === 0) {
    log('Nenhum item selecionado na mochila. Marque os itens para guardar.', 'system');
    return;
  }
  let movedCount = 0;
  for (const uid of Array.from(selectedSet)) {
    const item = state.inventory.find(i => i.uid === uid && !i.equipped);
    if (item && depositToWarehouse(item.uid, item.count || 1)) {
      movedCount++;
      selectedSet.delete(uid);
    }
  }
  if (movedCount > 0) {
    log(`📦 ${movedCount} item(ns) selecionado(s) guardado(s) no Baú.`, 'loot');
    updateAllUI(); save();
  }
}

function depositMaterialsToWarehouse() {
  const unequipped = state.inventory.filter(i => {
    if (!i || i.equipped) return false;
    const def = (typeof window !== 'undefined' && window.GameData) ? window.GameData?.ALL_ITEMS?.[i.itemId] : null;
    if (!def) return false;
    const slot = (def.slot || '').toLowerCase();
    return ['consumable', 'material', 'scroll', 'powerup', 'potion', 'food', 'spellbook'].includes(slot) || !!def.stack;
  });
  if (unequipped.length === 0) {
    log('Nenhum material ou consumível desequipado para guardar.', 'system');
    return;
  }
  let movedCount = 0;
  for (const item of [...unequipped]) {
    if (depositToWarehouse(item.uid, item.count || 1)) {
      movedCount++;
    } else {
      break;
    }
  }
  if (movedCount > 0) {
    log(`📥 ${movedCount} material(is)/consumível(is) guardado(s) no Baú.`, 'loot');
    updateAllUI(); save();
  }
}

function withdrawAllFromWarehouse() {
  if (!state.warehouse || state.warehouse.length === 0) {
    log('O Baú está vazio.', 'system');
    return;
  }
  let movedCount = 0;
  for (const item of [...state.warehouse]) {
    if (withdrawFromWarehouse(item.uid, item.count || 1)) {
      movedCount++;
    } else {
      break;
    }
  }
  if (movedCount > 0) {
    log(`🎒 ${movedCount} item(ns) retirado(s) do Baú.`, 'loot');
    updateAllUI(); save();
  }
}

function withdrawSelectedFromWarehouse() {
  const selectedSet = getSelectedSet(state);
  if (!selectedSet || selectedSet.size === 0) {
    log('Nenhum item selecionado no Baú. Marque os itens para retirar.', 'system');
    return;
  }
  let movedCount = 0;
  for (const uid of Array.from(selectedSet)) {
    const item = (state.warehouse || []).find(i => i.uid === uid);
    if (item && withdrawFromWarehouse(item.uid, item.count || 1)) {
      movedCount++;
      selectedSet.delete(uid);
    }
  }
  if (movedCount > 0) {
    log(`🎒 ${movedCount} item(ns) selecionado(s) retirado(s) do Baú.`, 'loot');
    updateAllUI(); save();
  }
}




export function bindEvents() {
  try {
    if (ROOT && ROOT.addEventListener) {
      addTrackedListener(ROOT, 'click', hideItemTooltip);
      addTrackedListener(ROOT, 'click', () => closeGameModeMenu());
    }

    // Keyboard shortcuts (1-9: Tab switch, Space: Speed, S: Save)
    addTrackedListener(window, 'keydown', (e) => {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) {
        return;
      }

      const tabs = ['character', 'inventory', 'skills', 'shop', 'craft', 'enchant', 'zones', 'quests', 'tower'];
      if (e.key >= '1' && e.key <= '9') {
        const idx = parseInt(e.key) - 1;
        if (tabs[idx]) {
          const tabBtn = qs(`.tab-btn[data-tab="${tabs[idx]}"]`);
          if (tabBtn) tabBtn.click();
        }
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        state.combatSpeed = state.combatSpeed === 1 ? 2 : (state.combatSpeed === 2 ? 4 : 1);
        log(`⚡ Velocidade de Combate: ${state.combatSpeed}x`, 'system');
        updateAllUI();
      } else if (e.key === 's' || e.key === 'S') {
        if (e.ctrlKey || e.metaKey) e.preventDefault();
        save(true);
      }
    });

    qsa('.tab-btn').forEach(btn => {
      btn.onclick = () => {
        const tabName = btn.dataset.tab;
        const isCurrentlyActive = btn.classList.contains('active');
        const isFullWindowActive = qs('.tabs-panel')?.classList.contains('full-window-active');

        if (isCurrentlyActive && isFullWindowActive && tabName !== 'zones') {
          openPanel('zones');
          return;
        }

        openPanel(tabName);
      };
    });

    qsa('.mobile-nav-btn').forEach(btn => {
      btn.onclick = () => {
        const tabName = btn.dataset.tab;
        qsa('.mobile-nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const desktopTabBtn = qs(`.tab-btn[data-tab="${tabName}"]`);
        if (desktopTabBtn) desktopTabBtn.click();

        const tabsPane = el('tab-' + tabName);
        if (tabsPane && tabsPane.scrollIntoView) {
          tabsPane.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      };
    });

    qsa('.race-btn').forEach(btn => btn.onclick = () => setRace(btn.dataset.race));
    qsa('.class-btn').forEach(btn => btn.onclick = () => setClass(btn.dataset.class));
    qsa('.filter-btn').forEach(btn => { btn.onclick = () => { state.filter = btn.dataset.filter; qsa('.filter-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); updateInventoryUI(); }; });
    qsa('.rarity-filter-btn').forEach(btn => { btn.onclick = () => { state.rarityFilter = btn.dataset.rarity; qsa('.rarity-filter-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); updateInventoryUI(); }; });
    qsa('.equip-filter-btn').forEach(btn => { btn.onclick = () => { state.equipFilter = btn.dataset.equipfilter; qsa('.equip-filter-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); updateInventoryUI(); }; });
    
    qsa('.zone-subtab').forEach(btn => {
      btn.onclick = () => {
        qsa('.zone-subtab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const target = btn.dataset.zonetab;
        qsa('.zone-view').forEach(v => v.classList.remove('active'));
        const view = el(`zone-${target}-view`);
        if (view) view.classList.add('active');
      };
    });

    qsa('.shop-subtab').forEach(btn => {
      btn.onclick = () => {
        qsa('.shop-subtab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.shopCategory = btn.dataset.shoptab;
        updateShopUI();
      };
    });

    const towerChallengeBtn = el('tower-challenge-btn');
    if (towerChallengeBtn) towerChallengeBtn.onclick = challengeTowerFloor;

    const towerSweepBtn = el('tower-sweep-btn');
    if (towerSweepBtn) towerSweepBtn.onclick = sweepTowerDaily;
    
    const selCommonsBtn = el('select-commons-btn'); if (selCommonsBtn) selCommonsBtn.onclick = () => selectItemsByFilter(i => (i.rarity || 'common') === 'common');
    const selUncommonsBtn = el('select-uncommons-btn'); if (selUncommonsBtn) selUncommonsBtn.onclick = () => selectItemsByFilter(i => i.rarity === 'uncommon');
    const selAllBtn = el('select-all-btn'); if (selAllBtn) selAllBtn.onclick = () => selectItemsByFilter(() => true);
    const clearSelBtn = el('clear-selection-btn'); if (clearSelBtn) clearSelBtn.onclick = clearItemSelection;
    const sellSelBtn = el('sell-selected-btn'); if (sellSelBtn) sellSelBtn.onclick = sellSelectedItems;
    const salvSelBtn = el('salvage-selected-btn'); if (salvSelBtn) salvSelBtn.onclick = salvageSelectedItems;
    const combatToggleBtn = el('combat-toggle-btn'); if (combatToggleBtn) combatToggleBtn.onclick = toggleCombatState;
    const ssToggleBtn = el('soulshot-toggle-btn'); if (ssToggleBtn) ssToggleBtn.onclick = toggleSoulshot;
    const apToggleBtn = el('autopotion-toggle-btn'); if (apToggleBtn) apToggleBtn.onclick = toggleAutoPotion;
    const spdToggleBtn = el('speed-toggle-btn'); if (spdToggleBtn) spdToggleBtn.onclick = toggleCombatSpeed;
    const clearLogBtn = el('clear-log-btn'); if (clearLogBtn) clearLogBtn.onclick = clearLog;
    qsa('.log-filter-btn').forEach(btn => btn.onclick = () => setLogFilter(btn.dataset.logfilter));
    const logEl = el('log');
    if (logEl) {
      logEl.onscroll = () => {
        const isNearBottom = (logEl.scrollHeight - logEl.scrollTop - logEl.clientHeight) <= 60;
        const scrollBtn = el('log-scroll-down-btn');
        if (isNearBottom && scrollBtn) {
          scrollBtn.style.display = 'none';
        }
      };
    }
    const scrollDownBtn = el('log-scroll-down-btn');
    if (scrollDownBtn) scrollDownBtn.onclick = scrollLogToBottom;
    const offlineOkBtn = el('offline-ok'); if (offlineOkBtn) offlineOkBtn.onclick = closeOfflineModal;
    const offlineModal = el('offline-modal');
    if (offlineModal) {
      offlineModal.onclick = (e) => {
        if (e.target === offlineModal) closeOfflineModal();
      };
    }
    const resetSpBtn = el('reset-sp-btn'); if (resetSpBtn) resetSpBtn.onclick = resetSP;
    const autoEquipBtn = el('auto-equip-btn'); if (autoEquipBtn) autoEquipBtn.onclick = autoEquipBest;
    const startBtn = el('start-btn'); if (startBtn) startBtn.onclick = startGame;
    const resetBtn = el('reset-btn'); if (resetBtn) resetBtn.onclick = resetSave;
    const resFree = el('res-free'); if (resFree) resFree.onclick = () => resurrect(false);
    const resScroll = el('res-scroll'); if (resScroll) resScroll.onclick = () => resurrect(true);
    const sagaOk = el('saga-ok'); if (sagaOk) sagaOk.onclick = () => { const modal = el('saga-modal'); if (modal) { modal.classList.remove('active'); modal.style.display = 'none'; } };
    const unequipBtn = el('unequip-all-btn'); if (unequipBtn) unequipBtn.onclick = unequipAll;
    qsa('.equip-slot').forEach(slot => { slot.onclick = () => { const s = slot.dataset.slot, uid = state.equipment[s]; if (uid) unequipItem(s); }; });
    const navCraftBtn = el('nav-craft-btn'); if (navCraftBtn) navCraftBtn.onclick = () => { const craftTab = qs('.tab-btn[data-tab="craft"]'); if (craftTab) craftTab.click(); };
    
    // Chat & Admin Console Handlers
    const chatForm = el('chat-form');
    if (chatForm) {
      chatForm.onsubmit = (e) => {
        e.preventDefault();
        const input = el('chat-input');
        if (input) {
          handleChatSubmit(input.value);
          input.value = '';
        }
      };
    }

    const closeAdminBtn = el('close-admin-modal-btn');
    if (closeAdminBtn) {
      closeAdminBtn.onclick = () => {
        const modal = el('admin-modal');
        if (modal) modal.classList.remove('active');
      };
    }

    const closeClassBtn = el('close-class-modal-btn');
    if (closeClassBtn) {
      closeClassBtn.onclick = () => {
        const modal = el('class-transfer-modal');
        if (modal) modal.classList.remove('active');
      };
    }

    qsa('[data-admin-cmd]').forEach(btn => {
      btn.onclick = () => executeAdminCmd(btn.dataset.adminCmd);
    });

    const addXpBtn = el('admin-add-xp-btn');
    if (addXpBtn) {
      addXpBtn.onclick = () => {
        const inp = el('admin-xp-custom');
        if (inp && inp.value) {
          addAdminXP(inp.value);
          inp.value = '';
        }
      };
    }

    const addGoldBtn = el('admin-add-gold-btn');
    if (addGoldBtn) {
      addGoldBtn.onclick = () => {
        const inp = el('admin-gold-custom');
        if (inp && inp.value) {
          addAdminGold(inp.value);
          inp.value = '';
        }
      };
    }

    const addSpBtn = el('admin-add-sp-btn');
    if (addSpBtn) {
      addSpBtn.onclick = () => {
        const inp = el('admin-sp-custom');
        if (inp && inp.value) {
          addAdminSP(inp.value);
          inp.value = '';
        }
      };
    }

    const addAcBtn = el('admin-add-ac-btn');
    if (addAcBtn) {
      addAcBtn.onclick = () => {
        const inp = el('admin-ac-custom');
        if (inp && inp.value) {
          addAdminAC(inp.value);
          inp.value = '';
        }
      };
    }

    const itemSearchInput = el('admin-item-search');
    if (itemSearchInput) {
      itemSearchInput.oninput = (e) => {
        populateAdminItemSelect(e.target.value);
      };
    }

    const itemSearchClearBtn = el('admin-item-search-clear');
    if (itemSearchClearBtn) {
      itemSearchClearBtn.onclick = () => {
        if (itemSearchInput) {
          itemSearchInput.value = '';
          itemSearchInput.focus();
        }
        populateAdminItemSelect('');
      };
    }

    const spawnBtn = el('admin-spawn-btn');
    if (spawnBtn) {
      spawnBtn.onclick = () => {
        const itemSel = el('admin-item-select');
        const qtyInput = el('admin-item-qty');
        const raritySel = el('admin-item-rarity');
        const enchantSel = el('admin-item-enchant');
        const affixSel = el('admin-item-affix');
        const foundChk = el('admin-item-foundation');
        if (itemSel && itemSel.value) {
          const qty = parseInt(qtyInput?.value || 1) || 1;
          const isFoundation = !!(foundChk && foundChk.checked);
          spawnAdminItem(
            itemSel.value,
            qty,
            raritySel?.value || 'common',
            parseInt(enchantSel?.value || 0) || 0,
            affixSel?.value || 'roll',
            isFoundation
          );
        }
      };
    }

    // ─── EventBus System Subscribers ────────────────────────────────────
    EventBus.on('ui:update', () => updateAllUI());
    EventBus.on('log', (data) => log(data.msg || data, data.type || 'system'));
    EventBus.on('quest:trigger', (data) => triggerQuestEvent(data.type, data.count || 1));
    EventBus.on('state:updated', () => updateAllUI());
    // ───────────────────────────────────────────────────────────────────

    initPanelResizers();
  } catch (err) {
    console.error('Failed to bind UI events:', err);
  }
}


function initPanelResizers() {
  const grid = qs('.main-grid');
  if (!grid) return;

  const r1 = el('resizer-col-1');
  const r2 = el('resizer-col-2');
  const rh = el('resizer-row-stage');

  let isDragging = false;
  let activeResizer = null;
  let startX = 0, startY = 0;
  let startW1 = 210, startW3 = 680, startStageH = 340;

  if (r1) {
    r1.onmousedown = (e) => {
      e.preventDefault();
      isDragging = true;
      activeResizer = 'col1';
      startX = e.clientX;
      const statsPanel = qs('.stats-panel');
      startW1 = statsPanel ? statsPanel.getBoundingClientRect().width : 210;
      doc().body.style.cursor = 'col-resize';
    };
  }

  if (r2) {
    r2.onmousedown = (e) => {
      e.preventDefault();
      isDragging = true;
      activeResizer = 'col3';
      startX = e.clientX;
      const tabsPanel = qs('.tabs-panel');
      startW3 = tabsPanel ? tabsPanel.getBoundingClientRect().width : 680;
      doc().body.style.cursor = 'col-resize';
    };
  }

  if (rh) {
    rh.onmousedown = (e) => {
      e.preventDefault();
      isDragging = true;
      activeResizer = 'stage';
      startY = e.clientY;
      const stagePanel = el('stage');
      startStageH = stagePanel ? stagePanel.getBoundingClientRect().height : 340;
      doc().body.style.cursor = 'row-resize';
    };
  }

  const onMove = (e) => {
    if (!isDragging || !activeResizer) return;
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;

    if (activeResizer === 'col1') {
      const deltaX = clientX - startX;
      const newW = Math.max(160, Math.min(450, startW1 + deltaX));
      grid.style.setProperty('--col1-w', `${newW}px`);
    } else if (activeResizer === 'col3') {
      const deltaX = startX - clientX;
      const newW = Math.max(300, Math.min(850, startW3 + deltaX));
      grid.style.setProperty('--col3-w', `${newW}px`);
    } else if (activeResizer === 'stage') {
      const deltaY = clientY - startY;
      const stagePanel = el('stage');
      if (stagePanel) {
        const newH = Math.max(180, Math.min(750, startStageH + deltaY));
        stagePanel.style.height = `${newH}px`;
        stagePanel.style.flex = 'none';
      }
    }
  };

  const onEnd = () => {
    if (isDragging) {
      isDragging = false;
      activeResizer = null;
      doc().body.style.cursor = '';
    }
  };

  addTrackedListener(window, 'mousemove', onMove);
  addTrackedListener(window, 'mouseup', onEnd);
  addTrackedListener(window, 'touchmove', onMove);
  addTrackedListener(window, 'touchend', onEnd);
}

// --------------------------- ALCHEMY & SOUL CRUCIBLE ---------------------------
// A lógica modular de Alquimia, Cadinho e Chaos Boss está isolada em ./src/services/AlchemyService.js


function upgradeAstralNode(nodeId) {
  if (!state.prestigeLevel || state.prestigeLevel < 1) {
    log('🔒 A Maestria Astral requer realizar a 1ª Reencarnação (Reborn no Nível 75+)!', 'warning');
    if (typeof window !== 'undefined' && window.floatText) {
      window.floatText('🔒 Requer Reencarnação!', 'float-meteor');
    }
    return false;
  }
  const node = ASTRAL_NODES[nodeId];
  if (!node) return false;

  if (!state.astralMastery) state.astralMastery = {};
  const currentLvl = state.astralMastery[nodeId] || 0;
  if (currentLvl >= node.max) {
    log(`⚠️ ${node.name} já atingiu o nível máximo (${node.max})!`, 'warning');
    return false;
  }

  const shards = state.astralShards || 0;
  if (shards < node.cost) {
    log(`⚠️ Fragmentos Astrais insuficientes! Requer ${node.cost} Fragmentos.`, 'warning');
    return false;
  }

  state.astralShards -= node.cost;
  state.astralMastery[nodeId] = currentLvl + 1;

  log(`🌟 Desbloqueou ${node.name} (Nível ${currentLvl + 1}/${node.max})!`, 'rarity-legendary');
  updateAllUI();
  save();
  return true;
}

function reincarnateHero() {
  if ((state.level || 1) < 75) {
    log('⚠️ Reencarnação Ancestral requer Nível 75 ou superior!', 'warning');
    return false;
  }

  const lvlBonus = (state.level - 74) * 10;
  const timeHours = Math.floor((state.totalPlaytime || 0) / 3600000);
  const timeBonus = timeHours * 2;
  const goldBonus = Math.floor((state.gold || 0) / 2500000);
  const earnedShards = Math.max(10, lvlBonus + timeBonus + goldBonus);

  state.prestigeLevel = (state.prestigeLevel || 0) + 1;
  state.astralShards = (state.astralShards || 0) + earnedShards;

  state.level = 1;
  state.xp = 0;
  state.sp = 10;
  state.skills = {};
  state.zone = 'talkingIsland';
  state.gold = 1000;
  state.hp = state.maxHp || 100;
  state.mp = state.maxMp || 50;

  const titles = [
    'Aventureiro Renascido',
    'Mestre da Constelação',
    'Senhor da Reencarnação',
    'Deus Ancestral de Aden'
  ];
  const title = titles[Math.min(state.prestigeLevel - 1, titles.length - 1)];

  log(`✨ REENCARNAÇÃO ANCESTRAL REALIZADA! Prestígio Nível ${state.prestigeLevel} (${title}). Conquistou +${earnedShards} Fragmentos Astrais!`, 'rarity-legendary');
  floatText(`PRESTÍGIO Lv.${state.prestigeLevel}`, 'float-gold');

  updateAllUI();
  save();
  return true;
}

// --------------------------- EXPEDITIONS & MANOR SYSTEM ---------------------------
const MANOR_SEEDS = {
  dark_coda: { id: 'dark_coda', name: 'Dark Coda Seed', level: 10, price: 100, reward1: 'stem', reward2: 'braided_hemp', ratio1: 5, ratio2: 2 },
  red_coda: { id: 'red_coda', name: 'Red Coda Seed', level: 13, price: 200, reward1: 'varnish', reward2: 'cokes', ratio1: 5, ratio2: 2 },
  chilly_coda: { id: 'chilly_coda', name: 'Chilly Coda Seed', level: 16, price: 350, reward1: 'suede', reward2: 'oriharukon_ore', ratio1: 5, ratio2: 2 },
  blue_coda: { id: 'blue_coda', name: 'Blue Coda Seed', level: 19, price: 500, reward1: 'animal_skin', reward2: 'crafted_leather', ratio1: 5, ratio2: 2 },
  red_cobol: { id: 'red_cobol', name: 'Red Cobol Seed', level: 31, price: 1000, reward1: 'charcoal', reward2: 'enria', ratio1: 10, ratio2: 2 },
  chilly_cobol: { id: 'chilly_cobol', name: 'Chilly Cobol Seed', level: 34, price: 1500, reward1: 'animal_bone', reward2: 'steel', ratio1: 10, ratio2: 3 },
  twin_codran: { id: 'twin_codran', name: 'Twin Codran Seed', level: 58, price: 3000, reward1: 'charcoal', reward2: 'mold_lubricant', ratio1: 15, ratio2: 3 },
  king_coba: { id: 'king_coba', name: 'King Coba Seed', level: 85, price: 10000, reward1: 'metallic_thread', reward2: 'durable_metal_plate', ratio1: 20, ratio2: 5 }
};

const CASTLES_DEFS = {
  dion: { id: 'dion', name: 'Castelo de Dion', reqLevel: 30, taxPerHour: 5000, desc: '+5.000 Adena por hora', enemyName: 'Guarda de Dion (Lv. 30)' },
  giran: { id: 'giran', name: 'Castelo de Giran', reqLevel: 50, taxPerHour: 15000, desc: '+15.000 Adena por hora & 5% Desconto na Loja', enemyName: 'Guarda de Giran (Lv. 50)' },
  goddard: { id: 'goddard', name: 'Castelo de Goddard', reqLevel: 70, taxPerHour: 35000, desc: '+35.000 Adena por hora & +5% XP Bônus', enemyName: 'Guarda de Goddard (Lv. 70)' },
  aden: { id: 'aden', name: 'Castelo Imperial de Aden', reqLevel: 85, taxPerHour: 75000, desc: '+75.000 Adena por hora & +10% Dano Geral', enemyName: 'Guarda Imperial de Aden (Lv. 85)' }
};

const EXPEDITION_DESTINATIONS = {
  branded: { id: 'branded', name: 'Catacumbas de Branded', duration: 3600000, cost: 5000, minGold: 20000, maxGold: 30000, desc: 'Expedição rápida (1 hora) com saque de ouro e pergaminhos' },
  martyrs: { id: 'martyrs', name: 'Necrópole dos Martírios', duration: 14400000, cost: 20000, minGold: 100000, maxGold: 150000, desc: 'Expedição média (4 horas) com baús C/B e materiais' },
  dragon_valley: { id: 'dragon_valley', name: 'Vale dos Dragões Abissais', duration: 28800000, cost: 50000, minGold: 300000, maxGold: 400000, desc: 'Expedição longa (8 horas) com baús A/S e Fragmentos Astrais' },
  shilen_temple: { id: 'shilen_temple', name: 'Templo da Deusa Shilen', duration: 43200000, cost: 100000, minGold: 800000, maxGold: 1200000, desc: 'Expedição mítica (12 horas) com Baú Frost Lord e 25 Fragmentos Astrais' }
};

function buyManorSeed(seedId, qty = 1) {
  const seed = MANOR_SEEDS[seedId];
  if (!seed) return false;
  const count = Math.max(1, Math.floor(qty));
  const totalCost = seed.price * count;

  if ((state.gold || 0) < totalCost) {
    log(`⚠️ Ouro insuficiente! Requer ${totalCost.toLocaleString()}g.`, 'warning');
    return false;
  }

  state.gold -= totalCost;
  if (!state.manorSeeds) state.manorSeeds = {};
  state.manorSeeds[seedId] = (state.manorSeeds[seedId] || 0) + count;

  log(`🌾 Comprou ${count}x Semente ${seed.name}!`, 'loot');
  updateAllUI();
  save();
  return true;
}

function exchangeManorCrop(seedId, rewardOption = 1) {
  const seed = MANOR_SEEDS[seedId];
  if (!seed) return false;

  const ownedCrops = state.manorCrops ? (state.manorCrops[seedId] || 0) : 0;
  if (ownedCrops <= 0) {
    log(`⚠️ Você não possui Colheita de ${seed.name} para entregar!`, 'warning');
    return false;
  }

  const matKey = rewardOption === 2 ? seed.reward2 : seed.reward1;
  const ratio = rewardOption === 2 ? seed.ratio2 : seed.ratio1;
  const matAmount = Math.max(1, Math.floor(ownedCrops / ratio));

  if (matAmount < 1) {
    log(`⚠️ Colheita insuficiente! Requer pelo menos ${ratio}x colheitas para trocar por 1 material.`, 'warning');
    return false;
  }

  const cropsUsed = matAmount * ratio;
  state.manorCrops[seedId] -= cropsUsed;

  addToInventory(matKey, matAmount);
  log(`🌾 Entregou ${cropsUsed}x Colheita no Manor Manager e recebeu +${matAmount}x ${matKey.toUpperCase()}!`, 'rarity-legendary');

  updateAllUI();
  save();
  return true;
}

function conquerCastle(castleId) {
  const castle = CASTLES_DEFS[castleId];
  if (!castle) return false;

  if (!state.castles) state.castles = {};
  if (state.castles[castleId]?.conquered) {
    log(`⚠️ Você já domina o ${castle.name}!`, 'warning');
    return false;
  }

  const playerLvl = state.level || 1;
  if (playerLvl < castle.reqLevel) {
    log(`⚠️ Nível insuficiente para desafiar o ${castle.name}! Requer Nível ${castle.reqLevel}.`, 'warning');
    return false;
  }

  state.castles[castleId] = {
    conquered: true,
    lastTaxClaim: Date.now()
  };

  log(`🏰 CONQUISTOU O ${castle.name.toUpperCase()}! Bônus ativado: ${castle.desc}.`, 'rarity-legendary');
  floatText(`DOMINOU ${castle.name.toUpperCase()}`, 'float-gold');

  updateAllUI();
  save();
  return true;
}

function claimCastleTaxes(castleId) {
  const castle = CASTLES_DEFS[castleId];
  if (!castle) return false;

  const data = state.castles ? state.castles[castleId] : null;
  if (!data || !data.conquered) {
    log(`⚠️ Você não domina o ${castle.name}!`, 'warning');
    return false;
  }

  const now = Date.now();
  const hoursPassed = (now - (data.lastTaxClaim || now)) / 3600000;
  if (hoursPassed < 1) {
    const minsLeft = Math.ceil((1 - hoursPassed) * 60);
    log(`⚠️ Aguarde mais ${minsLeft} minutos para recolher os impostos de ${castle.name}.`, 'warning');
    return false;
  }

  const hoursToClaim = Math.min(24, Math.floor(hoursPassed));
  const adenaEarned = hoursToClaim * castle.taxPerHour;

  data.lastTaxClaim = now;
  state.gold = (state.gold || 0) + adenaEarned;

  log(`💰 Coletou ${adenaEarned.toLocaleString()} Adena em impostos de ${castle.name} (${hoursToClaim}h)!`, 'rarity-legendary');

  updateAllUI();
  save();
  return true;
}

function startExpedition(destId) {
  const dest = EXPEDITION_DESTINATIONS[destId];
  if (!dest) return false;

  if (!state.expeditions) state.expeditions = [];
  const activeExp = state.expeditions.find(e => e.destId === destId && !e.claimed);
  if (activeExp) {
    log(`⚠️ Já existe uma expedição ativa para ${dest.name}!`, 'warning');
    return false;
  }

  if ((state.gold || 0) < dest.cost) {
    log(`⚠️ Ouro insuficiente para equipar a expedição! Requer ${dest.cost.toLocaleString()}g.`, 'warning');
    return false;
  }

  state.gold -= dest.cost;
  const now = Date.now();
  state.expeditions.push({
    id: 'exp_' + now + '_' + Math.floor(Math.random() * 1000),
    destId,
    startTime: now,
    duration: dest.duration,
    claimed: false
  });

  log(`🧭 Esquadrão de Mercenários enviado para ${dest.name}! Duração: ${dest.duration / 3600000}h.`, 'loot');

  updateAllUI();
  save();
  return true;
}

function claimExpeditionReward(expId) {
  if (!state.expeditions) return false;
  const expIdx = state.expeditions.findIndex(e => e.id === expId);
  if (expIdx < 0) return false;

  const exp = state.expeditions[expIdx];
  const dest = EXPEDITION_DESTINATIONS[exp.destId];
  if (!dest) return false;

  const now = Date.now();
  if (now < exp.startTime + exp.duration) {
    log('⚠️ Esta expedição ainda está em andamento!', 'warning');
    return false;
  }

  const goldEarned = Math.floor(dest.minGold + Math.random() * (dest.maxGold - dest.minGold));
  state.gold = (state.gold || 0) + goldEarned;

  if (exp.destId === 'shilen_temple') {
    state.astralShards = (state.astralShards || 0) + 25;
    addToInventory('weapon_frost_lord_sword', 1, 'frostlord');
  } else if (exp.destId === 'dragon_valley') {
    state.astralShards = (state.astralShards || 0) + 10;
    addToInventory('jewel_tateossian_ring', 1, 'legendary');
  } else if (exp.destId === 'martyrs') {
    addToInventory('scroll_enchant_weapon_a', 2);
  } else {
    addToInventory('scroll_enchant_weapon_d', 3);
  }

  const seedKeys = Object.keys(MANOR_SEEDS);
  const randomSeed = seedKeys[Math.floor(Math.random() * seedKeys.length)];
  if (!state.manorCrops) state.manorCrops = {};
  state.manorCrops[randomSeed] = (state.manorCrops[randomSeed] || 0) + 10;

  state.expeditions.splice(expIdx, 1);

  log(`🎁 Expedição de ${dest.name} concluída! Resgatou ${goldEarned.toLocaleString()}g e recompensas valiosas!`, 'rarity-legendary');

  updateAllUI();
  save();
  return true;
}

// --------------------------- FORGE EXPANSION: SOUL CRYSTALS, MASTERWORK & TATTOOS ---------------------------
function buySoulCrystal(color = 'red', stage = 1) {
  const prices = { 1: 15000, 2: 35000, 3: 80000, 4: 180000, 5: 450000 };
  const cost = prices[stage] || 15000;

  if ((state.gold || 0) < cost) {
    log(`⚠️ Ouro insuficiente! Requer ${cost.toLocaleString()}g.`, 'warning');
    return false;
  }

  state.gold -= cost;
  if (!state.soulCrystals) state.soulCrystals = {};
  const key = `${color}_stage${stage}`;
  state.soulCrystals[key] = (state.soulCrystals[key] || 0) + 1;

  log(`🔮 Comprou Soul Crystal ${color.toUpperCase()} (Stage ${stage})!`, 'rarity-legendary');
  updateAllUI();
  save();
  return true;
}

function fuseSoulCrystals(color = 'red', stage = 1) {
  if (stage >= 13) return false;
  const key = `${color}_stage${stage}`;
  const owned = state.soulCrystals ? (state.soulCrystals[key] || 0) : 0;
  if (owned < 2) {
    log(`⚠️ Você precisa de pelo menos 2x Soul Crystals do mesmo estágio para fundir!`, 'warning');
    return false;
  }

  state.soulCrystals[key] -= 2;
  const nextKey = `${color}_stage${stage + 1}`;
  state.soulCrystals[nextKey] = (state.soulCrystals[nextKey] || 0) + 1;

  log(`✨ SÍNTESE BEM SUCEDIDA! Soul Crystal subiu para Stage ${stage + 1}!`, 'rarity-legendary');
  updateAllUI();
  save();
  return true;
}

function socketSoulCrystalToWeapon(effect = 'focus', stage = 1) {
  const wpnUid = state.equipment?.weapon;
  if (!wpnUid) {
    log('⚠️ Equipe uma arma antes de engastar uma Pedra de Alma SA!', 'warning');
    return false;
  }

  if (!state.weaponSockets) state.weaponSockets = {};
  state.weaponSockets[wpnUid] = {
    effect,
    stage: Math.min(13, Math.max(1, stage))
  };

  log(`🔮 ENGASTOU SOUL CRYSTAL SA [${effect.toUpperCase()} Stage ${stage}] NA ARMA EQUIPADA!`, 'rarity-legendary');
  floatText(`SA ${effect.toUpperCase()} ATIVADO`, 'float-gold');

  updateAllUI();
  save();
  return true;
}

function upgradeItemToMasterwork(itemUid) {
  const item = state.inventory?.find(i => i.uid === itemUid);
  if (!item) return false;

  const itemDef = getItemDef(item.itemId);
  if (!itemDef) return false;

  const tier = itemDef.tier || 1;
  const costs = {
    3: { crystals: 1, adena: 500000, grade: 'b' },
    4: { crystals: 2, adena: 1000000, grade: 'a' },
    5: { crystals: 4, adena: 1500000, grade: 's' },
    6: { crystals: 5, adena: 2500000, grade: 's' }
  };

  const req = costs[tier] || costs[3];
  if ((state.gold || 0) < req.adena) {
    log(`⚠️ Adena insuficiente no Mestre Pushkin! Requer ${req.adena.toLocaleString()}g.`, 'warning');
    return false;
  }

  state.gold -= req.adena;
  item.isMasterwork = true;
  item.name = item.name ? (item.name.includes('[Foundation MW]') ? item.name : `${item.name} [Foundation MW]`) : `${itemDef.name} [Foundation MW]`;

  log(`✨ MESTRE FERREIRO PUSHKIN FORJOU ${item.name.toUpperCase()} (MASTERWORK RARE)!`, 'rarity-legendary');
  floatText('MASTERWORK RARE!', 'float-gold');

  updateAllUI();
  save();
  return true;
}

function applyTattoo(plusStat = 'str', minusStat = 'con', val = 4) {
  if (!state.tattoos) state.tattoos = [];
  if (state.tattoos.length >= 3) {
    log('⚠️ Você já possui o limite máximo de 3 Tatuagens aplicadas!', 'warning');
    return false;
  }

  const cost = val * 50000;
  if ((state.gold || 0) < cost) {
    log(`⚠️ Adena insuficiente para aplicar a Tatuagem! Requer ${cost.toLocaleString()}g.`, 'warning');
    return false;
  }

  state.gold -= cost;
  state.tattoos.push({
    plusStat,
    minusStat,
    plusVal: val,
    minusVal: val
  });

  log(`🖋️ TATUAGEM APLICADA: +${val} ${plusStat.toUpperCase()} / -${val} ${minusStat.toUpperCase()}!`, 'rarity-legendary');
  updateAllUI();
  save();
  return true;
}

function removeTattoo(index) {
  if (!state.tattoos || !state.tattoos[index]) return false;
  const removed = state.tattoos.splice(index, 1);
  log(`🖋️ Removeu Tatuagem (+${removed[0]?.plusVal} ${removed[0]?.plusStat?.toUpperCase()}).`, 'loot');
  updateAllUI();
  save();
  return true;
}

// --------------------------- BASIC MECHANICS: ATTRIBUTES, BELTS & LIFE STONES ---------------------------
function addSkillCharge() {
  state.charges = Math.min(8, (state.charges || 0) + 1);
  log(`⚡ Carga de Habilidade acumulada: **Nível ${state.charges}/8** (+${(state.charges - 1) * 20}% Dano de Skill)!`, 'rarity-legendary');
  floatText(`CARGA NÍVEL ${state.charges}!`, 'float-gold');
  updateAllUI(); save();
  return true;
}

function addKamaelSoul() {
  state.souls = Math.min(5, (state.souls || 0) + 1);
  log(`👻 Alma Kamael absorvida: **${state.souls}/5 Almas** (+${state.souls * 5}% Dano de Skill)!`, 'rarity-legendary');
  floatText(`ALMA ABSORVIDA (${state.souls}/5)!`, 'float-gold');
  updateAllUI(); save();
  return true;
}

function insertAttributeStone(itemUid, elemType = 'fire') {
  const item = state.inventory?.find(i => i.uid === itemUid);
  if (!item) {
    log('⚠️ Item não encontrado no inventário!', 'warning');
    return false;
  }
  const cost = 250000;
  if ((state.gold || 0) < cost) {
    log(`⚠️ Adena insuficiente para engaste elemental! Requer ${cost.toLocaleString()}g.`, 'warning');
    return false;
  }

  state.gold -= cost;
  if (!item.elemental) item.elemental = { type: elemType, val: 0 };
  
  const isFirst = item.elemental.val === 0;
  const inc = isFirst ? 20 : 5;
  item.elemental.type = elemType;
  item.elemental.val = Math.min(300, item.elemental.val + inc);

  log(`🔥 ENGASTE ELEMENTAL BEM SUCEDIDO! **${item.name || 'Item'}** recebeu +${inc} Atributo ${elemType.toUpperCase()} (Total: ${item.elemental.val})!`, 'rarity-legendary');
  floatText(`ATRIBUTO ${elemType.toUpperCase()} +${inc}!`, 'float-gold');
  updateAllUI(); save();
  return true;
}

function compoundBelts() {
  const cost = 500000;
  if ((state.gold || 0) < cost) {
    log(`⚠️ Adena insuficiente para síntese de Cinto! Requer ${cost.toLocaleString()}g.`, 'warning');
    return false;
  }

  state.gold -= cost;
  const roll = Math.random();
  if (roll <= 0.70) {
    addToInventory('blessed_top_belt', 1, 'legendary');
    log('✨ SÍNTESE DE CINTO BEM SUCEDIDA! Forjou Blessed Top-Grade Belt [S] (+7.2% Defesa / +6% Dano)!', 'rarity-legendary');
    floatText('CINTO SAGRADO FORJADO!', 'float-gold');
  } else {
    log('⚠️ Falha na síntese do cinto! Tente novamente.', 'warning');
  }

  updateAllUI(); save();
  return true;
}

function augmentWithLifeStone(itemUid) {
  const item = state.inventory?.find(i => i.uid === itemUid);
  if (!item) return false;

  const cost = 750000;
  if ((state.gold || 0) < cost) {
    log(`⚠️ Adena insuficiente para Augmentation! Requer ${cost.toLocaleString()}g.`, 'warning');
    return false;
  }

  state.gold -= cost;
  const options = [
    { name: 'Might (+8% P.Atk)', stat: 'patkMult', val: 0.08 },
    { name: 'Empower (+15% M.Atk)', stat: 'matkMult', val: 0.15 },
    { name: 'Shield (+10% P.Def)', stat: 'defMult', val: 0.10 },
    { name: 'Focus (+50 Crit Rate)', stat: 'crit', val: 50 },
    { name: 'Lesser Celestial Shield (7s Invencível)', stat: 'celestial', val: true }
  ];
  const chosen = options[Math.floor(Math.random() * options.length)];
  item.augmentation = chosen;

  log(`🔮 AUGMENTATION SUPERIOR CONCLUÍDO! **${item.name || 'Item'}** recebeu **Item Skill: ${chosen.name}**!`, 'rarity-legendary');
  floatText(`AUGMENTATION: ${chosen.name}!`, 'float-gold');
  updateAllUI(); save();
  return true;
}

function executeCompoundAction(targetUid, ingredientUid) {
  if (!targetUid || !ingredientUid) {
    log('⚠️ Selecione o Item Base e o Item Ingrediente para realizar o Compound!', 'warning');
    return false;
  }
  if (targetUid === ingredientUid) {
    log('⚠️ O Item Ingrediente deve ser diferente do Item Base!', 'warning');
    return false;
  }

  const target = state.inventory?.find(i => i.uid === targetUid);
  const ingredient = state.inventory?.find(i => i.uid === ingredientUid);

  if (!target || !ingredient) {
    log('⚠️ Itens não encontrados no inventário!', 'warning');
    return false;
  }

  if (target.itemId !== ingredient.itemId) {
    log('⚠️ Os itens para Compound devem ser exatamente do mesmo tipo!', 'warning');
    return false;
  }

  const curLv = target.compoundLevel || 1;
  const cost = 100000 * Math.pow(2, Math.min(8, curLv - 1));

  if ((state.gold || 0) < cost) {
    log(`⚠️ Adena insuficiente! Custo de Compound Lv.${curLv}: ${cost.toLocaleString()}g.`, 'warning');
    return false;
  }

  state.gold -= cost;
  
  // Consume ingredient item
  const ingIdx = state.inventory.findIndex(i => i.uid === ingredientUid);
  if (ingIdx >= 0) {
    if (ingredient.count > 1) {
      ingredient.count -= 1;
    } else {
      state.inventory.splice(ingIdx, 1);
    }
  }

  const rates = [0.75, 0.65, 0.50, 0.40, 0.30, 0.25, 0.20, 0.15, 0.10];
  const rate = rates[Math.min(rates.length - 1, curLv - 1)] || 0.50;
  const roll = Math.random();

  if (roll <= rate) {
    const nextLv = curLv + 1;
    target.compoundLevel = nextLv;
    target.enchant = (target.enchant || 0) + 1;
    
    // Scale item stats by +15% per compound level
    target.statsMult = 1 + (nextLv - 1) * 0.15;
    
    log(`✨ COMPOUND BEM-SUCEDIDO! **${target.name || 'Item'}** evoluiu para **Nível ${nextLv}**!`, 'rarity-legendary');
    floatText(`COMPOUND SUCESSO! Lv.${nextLv}`, 'float-gold');
  } else {
    log(`💥 FALHA NO COMPOUND! **${target.name || 'Item'}** permaneceu no Nível ${curLv}. O ingrediente foi consumido.`, 'warning');
    floatText('COMPOUND FALHOU!', 'float-dmg');
  }

  updateAllUI();
  save();
  return true;
}

function renderDailyRewardModal() {
  const status = getDailyRewardStatus(state);
  const grid = el('daily-rewards-grid');
  const streakEl = el('daily-streak-text');
  const statusBadge = el('daily-status-badge');
  const claimBtn = el('daily-claim-btn');
  const dotEl = el('daily-reward-dot');

  if (dotEl) {
    dotEl.style.display = status.canClaim ? 'block' : 'none';
  }

  if (streakEl) {
    streakEl.textContent = `${status.streak} ${status.streak === 1 ? 'Dia de Glória' : 'Dias Consecutivos'} 🔥`;
  }

  if (statusBadge) {
    if (status.canClaim) {
      statusBadge.style.background = 'rgba(34,197,94,0.2)';
      statusBadge.style.borderColor = 'rgba(34,197,94,0.5)';
      statusBadge.style.color = '#4ade80';
      statusBadge.textContent = `✨ Recompensa do Dia ${status.currentDay} Disponível!`;
    } else {
      statusBadge.style.background = 'rgba(107,114,128,0.2)';
      statusBadge.style.borderColor = 'rgba(107,114,128,0.4)';
      statusBadge.style.color = '#9ca3af';
      statusBadge.textContent = '✓ Check-in de Hoje Concluído';
    }
  }

  if (claimBtn) {
    claimBtn.disabled = !status.canClaim;
    claimBtn.style.opacity = status.canClaim ? '1' : '0.5';
    claimBtn.style.cursor = status.canClaim ? 'pointer' : 'not-allowed';
    claimBtn.textContent = status.canClaim
      ? `✨ Resgatar Presente do Dia ${status.currentDay}`
      : `✓ Dia ${status.currentDay > 1 ? status.currentDay - 1 : 28} Resgatado (Volte Amanhã)`;
  }

  if (!grid) return;
  grid.innerHTML = '';

  DAILY_REWARDS_TABLE.forEach(item => {
    const isClaimed = (status.claimedDays || []).includes(item.day);
    const isCurrent = item.day === status.currentDay && status.canClaim;

    let borderColor = 'rgba(255,255,255,0.1)';
    let bg = 'rgba(0,0,0,0.3)';
    if (item.isMilestone) {
      borderColor = 'rgba(234,179,8,0.5)';
      bg = 'rgba(234,179,8,0.08)';
    }
    if (isCurrent) {
      borderColor = '#f59e0b';
      bg = 'linear-gradient(135deg, rgba(245,158,11,0.25), rgba(180,83,9,0.25))';
    } else if (isClaimed) {
      borderColor = 'rgba(34,197,94,0.4)';
      bg = 'rgba(34,197,94,0.1)';
    }

    const card = document.createElement('div');
    card.style.cssText = `
      border: 1px solid ${borderColor};
      background: ${bg};
      border-radius: 8px;
      padding: 8px 4px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      min-height: 95px;
      position: relative;
      transition: all 0.2s;
      ${isCurrent ? 'box-shadow: 0 0 12px rgba(245,158,11,0.4); transform: scale(1.03);' : ''}
    `;

    card.innerHTML = `
      <div style="font-size:10px; font-weight:bold; color:${isCurrent ? '#fef08a' : (isClaimed ? '#4ade80' : '#9ca3af')};">
        ${item.isMilestone ? '⭐ ' : ''}Dia ${item.day}
      </div>
      <div style="font-size:22px; margin:4px 0;">${item.icon}</div>
      <div style="font-size:10px; font-weight:600; color:#f3f4f6; line-height:1.2; max-width:80px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${item.desc}">
        ${item.name}
      </div>
      <div style="font-size:9px; color:${isClaimed ? '#4ade80' : (isCurrent ? '#f59e0b' : '#6b7280')}; margin-top:2px; font-weight:bold;">
        ${isClaimed ? '✓ Coletado' : (isCurrent ? '🎁 Resgatar' : '🔒')}
      </div>
    `;

    grid.appendChild(card);
  });
}

function openDailyRewardModal() {
  renderDailyRewardModal();
  const m = el('daily-reward-modal');
  if (m) m.classList.add('active');
}

function closeDailyRewardModal() {
  const m = el('daily-reward-modal');
  if (m) m.classList.remove('active');
}

function claimDailyRewardAction() {
  const res = claimDailyReward(state, {
    log,
    floatText,
    addToInventory: (itemId, count) => {
      serviceAddToInventory(state, itemId, count);
    }
  });

  if (res.success) {
    updateAllUI();
    save();
    renderDailyRewardModal();
  } else {
    log(`⚠️ ${res.message}`, 'system');
  }
}

export function init() {
  try {
    // Expose global action handlers to window for inline HTML handlers & global events
    window.openDailyRewardModal = openDailyRewardModal;
    window.closeDailyRewardModal = closeDailyRewardModal;
    window.claimDailyRewardAction = claimDailyRewardAction;
    window.renderDailyRewardModal = renderDailyRewardModal;
    window.scrollLogToBottom = scrollLogToBottom;
    window.clearLog = clearLog;
    window.registerCodexItem = registerCodexItem;
    window.buyItem = buyItem;
    window.depositAllToWarehouse = depositAllToWarehouse;
    window.depositSelectedToWarehouse = depositSelectedToWarehouse;
    window.depositMaterialsToWarehouse = depositMaterialsToWarehouse;
    window.withdrawAllFromWarehouse = withdrawAllFromWarehouse;
    window.withdrawSelectedFromWarehouse = withdrawSelectedFromWarehouse;
    window.selectDollForSynth = selectDollForSynth;
    window.synthesizeDolls = synthesizeDolls;
    window.craftSpecialRecipe = craftSpecialRecipe;
    window.useMagicLamp = useMagicLamp;
    window.refreshRandomCraftWheel = refreshRandomCraftWheel;
    window.spinRandomCraft = spinRandomCraft;
    window.selectZone = selectZone;
    window.startRaidBoss = startRaidBoss;
    window.openAddSubclassModal = openAddSubclassModal;
    window.openCertificationModal = openCertificationModal;
    window.closeCertificationModal = closeCertificationModal;
    window.confirmLearnCertification = confirmLearnCertification;
    window.openResetCertificationsModal = openResetCertificationsModal;
    window.confirmResetCertifications = confirmResetCertifications;
    window.openDivineTransformationToggleModal = openDivineTransformationToggleModal;
    window.toggleDivineTransformation = toggleDivineTransformation;
    window.openAddSubclassModal = openAddSubclassModal;
    window.confirmAddSubclass = confirmAddSubclass;
    window.openCraftModal = (itemId) => uiOpenCraftModal(itemId, state, { craftItem, getItemDef, updateAllUI, save });
    window.closeCraftModal = uiCloseCraftModal;
    window.craftItem = craftItem;
    window.canCraft = canCraft;
    window.setGameMode = setGameMode;
    window.switchSubclass = switchSubclass;
    window.claimQuestReward = claimQuestReward;
    window.claimPassReward = claimPassReward;
    window.unlockPremiumPass = unlockPremiumPass;
    window.challengeTowerFloor = challengeTowerFloor;
    window.sweepTowerDaily = sweepTowerDaily;
    window.checkDailyReset = checkDailyReset;
    window.checkQuestProgress = checkQuestProgress;
    window.dissolveItem = (uid) => serviceDissolveItem(state, uid, { log, updateAllUI, save });
    window.dissolveItemsByFilter = (filterGrade) => serviceDissolveItemsByGrade(state, filterGrade, { log, updateAllUI, save });
    window.dissolveAllJunkAction = () => serviceDissolveAllJunkEquipment(state, { log, updateAllUI, save });
    window.craftElixir = (recipeId, qty) => serviceCraftElixir(state, recipeId, qty, { log, updateAllUI, save });
    window.useChaosBossSummonStoneAction = () => {
      const res = serviceUseChaosBossSummonStone(state, { log, updateAllUI, save, floatText, renderStageMonster, attackMonster });
      if (res) {
        if (typeof renderStageMonster === 'function') renderStageMonster();
        if (typeof updateMonsterHP === 'function') updateMonsterHP();
        if (typeof attackMonster === 'function') attackMonster();
      }
    };
    window.ALCHEMY_RECIPES = ALCHEMY_RECIPES;
    window.upgradeAstralNode = upgradeAstralNode;
    window.reincarnateHero = reincarnateHero;
    window.ASTRAL_NODES = ASTRAL_NODES;
    window.buyManorSeed = buyManorSeed;
    window.exchangeManorCrop = exchangeManorCrop;
    window.conquerCastle = conquerCastle;
    window.claimCastleTaxes = claimCastleTaxes;
    window.startExpedition = startExpedition;
    window.claimExpeditionReward = claimExpeditionReward;
    window.MANOR_SEEDS = MANOR_SEEDS;
    window.CASTLES_DEFS = CASTLES_DEFS;
    window.EXPEDITION_DESTINATIONS = EXPEDITION_DESTINATIONS;
    window.setForgeSubTab = (tabKey) => {
      window._forgeSubTab = tabKey;
      updateAllUI();
    };
    window.updateAllUI = updateAllUI;
    window.buySoulCrystal = buySoulCrystal;
    window.fuseSoulCrystals = fuseSoulCrystals;
    window.socketSoulCrystalToWeapon = socketSoulCrystalToWeapon;
    window.upgradeItemToMasterwork = upgradeItemToMasterwork;
    window.applyTattoo = applyTattoo;
    window.removeTattoo = removeTattoo;
    window.addSkillCharge = addSkillCharge;
    window.addKamaelSoul = addKamaelSoul;
    window.insertAttributeStone = insertAttributeStone;
    window.chargeRandomCraftPoints = (pts = 25) => {
      serviceChargeRandomCraft(state, pts, { log, updateAllUI, save });
    };
    window.claimRandomCraftReward = (slotIdx = 0) => {
      serviceClaimRandomCraft(state, slotIdx, { log, updateAllUI, save });
    };
    window.showDropLocator = (matId) => {
      showDropLocatorModal(matId);
    };
    window.openCompoundModal = openCompoundModal;
    window.closeCompoundModal = closeCompoundModal;
    window.renderCompoundModal = renderCompoundModal;

    // Cash Shop Comercial
    window.openCashShopModal = openCashShopModal;
    window.closeCashShopModal = closeCashShopModal;
    window.renderCashShopModal = renderCashShopModal;
    window.executeCashShopBuy = (type, id) => {
      let success = false;
      if (type === 'starter_pack') {
        success = CashShopService.buyStarterPack(state, id, { log, onUpdate: () => { updateAllUI(); save(); } });
      } else if (type === 'cosmetic') {
        success = CashShopService.buyCostumeOrSkin(state, id, { log, onUpdate: () => { updateAllUI(); save(); } });
      } else if (type === 'title') {
        success = CashShopService.buyTitleOrEffect(state, id, { log, onUpdate: () => { updateAllUI(); save(); } });
      } else if (type === 'utility') {
        success = CashShopService.buyUtility(state, id, { log, onUpdate: () => { updateAllUI(); save(); } });
      }
      if (success) {
        const modal = document.getElementById('cash-shop-modal');
        if (modal) renderCashShopModal(modal);
      }
      return success;
    };
    window.executeDonationPix = (tierId, amount) => {
      CashShopService.addAdenCoins(state, amount, { log, onUpdate: () => { updateAllUI(); save(); } });
      const modal = document.getElementById('cash-shop-modal');
      if (modal) renderCashShopModal(modal);
    };

    // Raids & Bosses Épicos
    window.startRaidBossAction = (raidId) => {
      const started = serviceStartRaidBoss(state, raidId, {
        log,
        el,
        renderStageMonster,
        attackMonster,
        onUpdate: () => { updateAllUI(); save(); }
      });
      if (started) {
        updateAllUI();
        save();
      }
    };

    // Grand Olympiad & Noblesse Saga
    window.startOlympiadMatchAction = async () => {
      const res = await OlympiadService.startOlympiadMatch(state, {
        log,
        onUpdate: () => { updateAllUI(); save(); }
      });
      updateAllUI();
      save();
      return res;
    };
    window.completeNoblesseStepAction = (step) => {
      const res = NoblesseService.completeStep(state, step, {
        log,
        onUpdate: () => { updateAllUI(); save(); }
      });
      updateAllUI();
      save();
      return res;
    };
    window.setCodexSubTab = (tab) => {
      window._codexSubTab = tab;
      updateCodexUI();
    };
    window.absorbCardAction = (cardId) => {
      const invIdx = state.inventory.findIndex(i => i.itemId === cardId && !i.equipped);
      let foundInWarehouse = false;
      let whIdx = -1;

      if (invIdx >= 0) {
        state.inventory.splice(invIdx, 1);
      } else {
        whIdx = (state.warehouse || []).findIndex(i => i.itemId === cardId && !i.equipped);
        if (whIdx >= 0) {
          state.warehouse.splice(whIdx, 1);
          foundInWarehouse = true;
        } else {
          log('Você não possui esta carta para absorver.', 'system');
          return;
        }
      }

      const res = CardCodexService.absorbCardIntoCodex(state, cardId, {
        log,
        onUpdate: () => { updateAllUI(); save(); }
      });
      updateAllUI();
      save();
      return res;
    };
    window.claimHeroStatusAction = (weaponId) => {
      const res = OlympiadService.claimHeroStatus(state, weaponId, {
        log,
        onUpdate: () => { updateAllUI(); save(); }
      });
      updateAllUI();
      save();
      return res;
    };
    window.buyOlympiadItemAction = (itemId) => {
      const res = OlympiadService.buyShopItem(state, itemId, {
        log,
        onUpdate: () => { updateAllUI(); save(); }
      });
      updateAllUI();
      save();
      return res;
    };
    window.teleportToQuestZone = (zoneId) => {
      if (zoneId) {
        changeZone(zoneId);
        openPanel('zones');
      }
    };

    // Guia do Aventureiro & Progressão do Jogo
    window.openCurrentTabGuide = (preferredTab) => {
      const modal = el('guide-modal');
      if (!modal) return;
      window.switchGuideTab(preferredTab || 'journey');
      modal.classList.add('active');
    };
    window.closeGuideModal = () => {
      const modal = el('guide-modal');
      if (modal) modal.classList.remove('active');
    };
    window.switchGuideTab = (tab) => {
      const contentEl = el('guide-content');
      if (!contentEl) return;

      const tabs = ['journey', 'forge', 'codex', 'combat', 'sevensigns'];
      tabs.forEach(t => {
        const btn = el(`guide-tab-btn-${t}`);
        if (btn) {
          const isActive = t === tab;
          btn.classList.toggle('active', isActive);
          btn.style.background = isActive ? 'linear-gradient(180deg,#d4a744,#8a641c)' : 'rgba(252,211,77,0.1)';
          btn.style.color = isActive ? '#000' : '#ffd877';
        }
      });

      if (tab === 'journey') {
        contentEl.innerHTML = `
          <div style="background:rgba(0,0,0,0.35); padding:12px; border-radius:8px; border:1px solid rgba(212,175,55,0.2); margin-bottom:10px;">
            <h4 style="color:#fbbf24; margin:0 0 6px 0;">🐣 Nível 1 a 20 — Os Primeiros Passos (No-Grade)</h4>
            <p style="margin:0 0 4px 0;">• <strong>Zonas:</strong> Talking Island, Elven Forest, Dark Forest, Orc Village, Dwarven Mine, Kamael Lair, Ruined Outpost, Howling Moor.</p>
            <p style="margin:0 0 4px 0;">• <strong>O que fazer:</strong> Equipe o Starter Kit da sua classe. Suas habilidades exigem a arma correta (ex: Arco para arqueiros, Adaga para assassinos). Desmanche itens sobressalentes na Forja para subir o Nível de Forja da Conta.</p>
            <p style="margin:0; color:#34d399; font-weight:bold;">🏆 Marco: 1ª Troca de Classe no Nível 20 (Desbloqueia Grau D e Saga Prelude of War).</p>
          </div>

          <div style="background:rgba(0,0,0,0.35); padding:12px; border-radius:8px; border:1px solid rgba(212,175,55,0.2); margin-bottom:10px;">
            <h4 style="color:#fbbf24; margin:0 0 6px 0;">🛡️ Nível 20 a 40 — Grau D &amp; Primeiro Raid Boss</h4>
            <p style="margin:0 0 4px 0;">• <strong>Zonas:</strong> Giran Outskirts, Orcen Ruins, Forsaken Crypt, Black Citadel.</p>
            <p style="margin:0 0 4px 0;">• <strong>Raid Boss:</strong> Enfrente a <strong>Queen Ant 👑 (Lv. 40)</strong> para dropar o <em>Ring of Queen Ant</em> e a <em>Queen Ant Doll</em> (Codex).</p>
            <p style="margin:0 0 4px 0;">• <strong>Sete Selos:</strong> Colete Seal Stones (Red, Green, Blue) caídas dos monstros para contribuir na vitória semanal da sua facção.</p>
            <p style="margin:0; color:#34d399; font-weight:bold;">🏆 Marco: 2ª Troca de Classe no Nível 40 (Desbloqueia Grau C e Saga The Awakening).</p>
          </div>

          <div style="background:rgba(0,0,0,0.35); padding:12px; border-radius:8px; border:1px solid rgba(212,175,55,0.2); margin-bottom:10px;">
            <h4 style="color:#fbbf24; margin:0 0 6px 0;">⚔️ Nível 40 a 75 — Grau C/B/A, Barreira de Forja &amp; Noblesse</h4>
            <p style="margin:0 0 4px 0;">• <strong>Zonas:</strong> Gludio Castle, Wolf Mountain, Rift of the Void, Emerald Grove, Gates of the Underworld, Valley of Saints, Swamp of Screams.</p>
            <p style="margin:0 0 4px 0;">• <strong>Raid Bosses:</strong> Core (Lv. 50), Orfen (Lv. 55), Zaken (Lv. 60).</p>
            <p style="margin:0 0 4px 0;">• <strong>Forja Nível 10:</strong> Ao atingir o Nível 10 de Forja, o <strong>Mercado Global</strong> é desbloqueado para comercializar itens livremente.</p>
            <p style="margin:0 0 4px 0;">• <strong>Saga de Noblesse (Lv. 75):</strong> Complete as 4 partes da quest em Valley of Saints, Swamp of Screams e derrote o <strong>Raid Boss Barakiel</strong> para se consagrar Noblesse!</p>
            <p style="margin:0; color:#34d399; font-weight:bold;">🏆 Marco: 3ª Troca de Classe no Nível 76 (Sagas Ancestrais e Grau S).</p>
          </div>

          <div style="background:rgba(0,0,0,0.35); padding:12px; border-radius:8px; border:1px solid rgba(212,175,55,0.2);">
            <h4 style="color:#fbbf24; margin:0 0 6px 0;">👑 Nível 76 a 95+ — Endgame, Dragões &amp; Transcendência (Reset)</h4>
            <p style="margin:0 0 4px 0;">• <strong>Zonas:</strong> Aden City, Dragon Valley, Imperial Tomb, Antharas' Lair, Forge of the Gods.</p>
            <p style="margin:0 0 4px 0;">• <strong>Raid Bosses Épicos:</strong> Imperador Baium (Lv. 75), Frintezza (Lv. 85), Antharas (Lv. 95) e Valakas (Lv. 100).</p>
            <p style="margin:0 0 4px 0;">• <strong>Grand Olympiad:</strong> Nobres disputam o título de Herói Supremo todo fim de semana.</p>
            <p style="margin:0; color:#ffd700; font-weight:bold;">♾️ Rebirth / Reset: Ao atingir o Nível 85, você pode Transcender (Reset) para o Nível 1 acumulando +60 Pontos de Atributos Permanentes!</p>
          </div>
        `;
      } else if (tab === 'forge') {
        contentEl.innerHTML = `
          <h4 style="color:#fbbf24; margin-top:0;">🔨 Nível de Forja da Conta &amp; Economia Circular</h4>
          <p>• <strong>Como subir o Nível de Forja:</strong> Ao desmanchar equipamentos sobressalentes na mochila ou forjar receitas, você ganha <strong>EXP de Forja</strong>.</p>
          <p>• <strong>Por que a Forja é essencial:</strong> Níveis mais altos aumentam a chance de criar itens Masterwork (Pushkin), reduzem custos e liberam receitas de Grau A, S e Soberanas.</p>
          <p>• <strong>Desbloqueio do Mercado Global (Lv. 10):</strong> Para combater bots e valorizar os jogadores dedicados, o Mercado Global exige Nível 10 de Forja da Conta.</p>
          <p>• <strong>Item Sinks Massivos:</strong> No Endgame, você pode sacrificar armas antigas no Ferreiro Oculto para condensar Energia Ancestral e forjar Relíquias Soberanas.</p>
        `;
      } else if (tab === 'codex') {
        contentEl.innerHTML = `
          <h4 style="color:#fbbf24; margin-top:0;">🃏 Codex de Coleções &amp; Cartas de Monstros</h4>
          <p>• <strong>Coleções de Itens:</strong> Registre armas e armaduras de treino para desbloquear bônus passivos permanentes de ATK, DEF e HP para toda a sua conta.</p>
          <p>• <strong>Cartas de Monstros &amp; Boss Dolls:</strong> Ao derrotar Chefes de Raid (Queen Ant, Core, Orfen, Zaken, Baium, Antharas, Valakas), você tem chance de dropar suas Cartas Raras.</p>
          <p>• <strong>Absorver no Codex:</strong> Absorver a carta no Álbum concede atributos perpétuos na conta (P.ATK, M.ATK, Vampirismo, etc.).</p>
          <p>• <strong>Engaste em Equipamentos:</strong> Você também pode engastar cartas em slots de armas para potencializar seu dano elemental e crítico.</p>
        `;
      } else if (tab === 'combat') {
        contentEl.innerHTML = `
          <h4 style="color:#fbbf24; margin-top:0;">⚔️ Restrições de Combate, Movesets &amp; Grimórios 4★</h4>
          <p>• <strong>Moveset por Arma:</strong> Habilidades físicas exigem o arquétipo correto de arma equipado (ex: Habilidades de tiro exigem Arco, Danças exigem Espadas Duplas, etc.).</p>
          <p>• <strong>Fraquezas Elementais:</strong> Monstros e chefes possuem elementos (Fogo, Água, Vento, Terra, Sagrado, Trevas). Usar a fraqueza oposta concede até +50% de dano bônus.</p>
          <p>• <strong>Habilidades Supremas (4★):</strong> Habilidades 4-Star exigem o respectivo <em>Spellbook: 4-Star</em> na mochila para serem aprendidas pela 1ª vez. Uma vez aprendida, o livro é consumido e a habilidade pode ser usada para sempre!</p>
          <p>• <strong>Hard DPS Check:</strong> Chefes de Raid possuem temporizadores de Enrage. Se o grupo não causar dano suficiente dentro do tempo limite, o Boss entra em fúria mortal.</p>
        `;
      } else if (tab === 'sevensigns') {
        contentEl.innerHTML = `
          <h4 style="color:#fbbf24; margin-top:0;">🏛️ Sete Selos (Seven Signs), Mammon &amp; Noblesse</h4>
          <p>• <strong>Ciclo Semanal das Seven Signs:</strong> Escolha entre <strong>Senhores do Amanhecer (Dawn)</strong> ou <strong>Revolucionários do Crepúsculo (Dusk)</strong>. Entregue Seal Stones obtidas nas caças para acumular pontos de vitória.</p>
          <p>• <strong>Ferreiro &amp; Mercador de Mammon:</strong> A facção vencedora ganha acesso exclusivo ao Ferreiro de Mammon para remoção de selos, trocas de armas Grau A/S e serviços sem perda de encanto usando Ancient Adena.</p>
          <p>• <strong>Questline de Noblesse (Possessor of a Precious Soul):</strong> No Nível 75, cumpra as 4 etapas da jornada em Valley of Saints e Swamp of Screams e derrote o Raid Boss <strong>Barakiel</strong> para conquistar o status de Noblesse.</p>
          <p>• <strong>Grand Olympiad:</strong> Nobres Nível 76+ podem lutar na arena 1v1 pelas cobiçadas Armas da Infinidade e o manto de Herói Supremo de Aden!</p>
        `;
      }
    };
    window.closeOfflineModal = closeOfflineModal;

    // Clan & Castle Siege Actions
    window.setClanSubTab = (t) => {
      window._activeClanSubTab = t;
      updateClanUI();
    };
    window.upgradeClanAction = () => {
      const res = ClanService.upgradeClan(state, {
        log,
        onUpdate: () => { updateAllUI(); save(); }
      });
      updateAllUI();
      save();
      return res;
    };
    window.startCastleSiegeAction = (castleId) => {
      const res = ClanService.startSiege(state, castleId, {
        log,
        onUpdate: () => { window.setClanSubTab('siege'); updateAllUI(); save(); }
      });
      if (res.success) window.setClanSubTab('siege');
      updateAllUI();
      save();
      return res;
    };
    window.executeSiegeTurnAction = () => {
      const res = ClanService.executeSiegeTurn(state, {
        log,
        onUpdate: () => { updateAllUI(); save(); }
      });
      updateAllUI();
      save();
      return res;
    };
    window.claimCastleTaxesAction = (castleId) => {
      const res = ClanService.claimCastleTaxes(state, castleId, {
        log,
        onUpdate: () => { updateAllUI(); save(); }
      });
      updateAllUI();
      save();
      return res;
    };
    window.buyCastleShopItemAction = (itemId) => {
      const res = ClanService.buyCastleShopItem(state, itemId, {
        log,
        onUpdate: () => { updateAllUI(); save(); }
      });
      updateAllUI();
      save();
      return res;
    };

    // Skill Enchantment Actions
    window.openSkillEnchantModalAction = (skillId, skillName) => {
      openSkillEnchantModal(skillId, skillName, state);
    };
    window.enchantSkillAction = (skillId, skillName, route, isMastery) => {
      const res = SkillEnchantService.enchantSkill(state, skillId, skillName, route, isMastery, {
        log,
        onUpdate: () => {
          openSkillEnchantModal(skillId, skillName, state);
          updateAllUI();
          save();
        }
      });
      updateAllUI();
      save();
      return res;
    };

    // Weapon Augmentation Actions
    window.openAugmentModalAction = () => {
      openAugmentModal(state);
    };
    window.augmentWeaponAction = (lifeStoneId) => {
      const weapon = state.equipment?.weapon ? (state.inventory?.find(i => i.uid === state.equipment.weapon) || state.equipment.weapon) : null;
      const res = AugmentationService.augmentWeapon(state, weapon, lifeStoneId, {
        log,
        onUpdate: () => {
          openAugmentModal(state);
          updateAllUI();
          save();
        }
      });
      updateAllUI();
      save();
      return res;
    };
    window.removeAugmentAction = () => {
      const weapon = state.equipment?.weapon ? (state.inventory?.find(i => i.uid === state.equipment.weapon) || state.equipment.weapon) : null;
      const res = AugmentationService.removeAugmentation(state, weapon, {
        log,
        onUpdate: () => {
          openAugmentModal(state);
          updateAllUI();
          save();
        }
      });
      updateAllUI();
      save();
      return res;
    };

    // Seven Signs Window Actions
    window.setSevenSignsSubTab = (t) => {
      window._activeSevenSignsSubTab = t;
      updateSevenSignsUI();
    };
    window.joinFactionAction = (factionId) => {
      const res = SevenSignsService.joinFaction(state, factionId, {
        log,
        onUpdate: () => { updateAllUI(); save(); }
      });
      updateAllUI();
      save();
      return res;
    };
    window.depositSealStonesAction = (stoneId, count) => {
      const res = SevenSignsService.depositStones(state, stoneId, count, {
        log,
        onUpdate: () => { updateAllUI(); save(); }
      });
      updateAllUI();
      save();
      return res;
    };
    window.startSevenSignsBossFightAction = (bossId) => {
      const res = SevenSignsService.startBossFight(state, bossId, {
        log,
        onUpdate: () => { window.setSevenSignsSubTab('bosses'); updateAllUI(); save(); }
      });
      if (res.success) window.setSevenSignsSubTab('bosses');
      updateAllUI();
      save();
      return res;
    };
    window.executeSevenSignsBossTurnAction = () => {
      const res = SevenSignsService.executeBossTurn(state, {
        log,
        onUpdate: () => { updateAllUI(); save(); }
      });
      updateAllUI();
      save();
      return res;
    };
    window.buyMammonItemAction = (itemId) => {
      const res = SevenSignsService.buyMammonItem(state, itemId, {
        log,
        onUpdate: () => { updateAllUI(); save(); }
      });
      updateAllUI();
      save();
      return res;
    };
    window.unsealArmorAction = () => {
      const armor = state.equipment?.armor ? (state.inventory?.find(i => i.uid === state.equipment.armor) || state.equipment.armor) : null;
      const res = SevenSignsService.unsealArmor(state, armor, {
        log,
        onUpdate: () => { updateAllUI(); save(); }
      });
      updateAllUI();
      save();
      return res;
    };

    // Fortress Window Actions
    window.startFortressSiegeAction = (fortId) => {
      const res = FortressService.startFortressSiege(state, fortId, {
        log,
        onUpdate: () => { updateAllUI(); save(); }
      });
      updateAllUI();
      save();
      return res;
    };
    window.executeFortressTurnAction = () => {
      const res = FortressService.executeSiegeTurn(state, {
        log,
        onUpdate: () => { updateAllUI(); save(); }
      });
      updateAllUI();
      save();
      return res;
    };
    window.buyBraceletAction = (braceletId) => {
      const res = FortressService.buyBracelet(state, braceletId, {
        log,
        onUpdate: () => { updateAllUI(); save(); }
      });
      updateAllUI();
      save();
      return res;
    };
    window.equipTalismanAction = (talismanId) => {
      const res = FortressService.equipTalisman(state, talismanId, {
        log,
        onUpdate: () => { updateAllUI(); save(); }
      });
      updateAllUI();
      save();
      return res;
    };
    window.unequipTalismanAction = (talismanId) => {
      const res = FortressService.unequipTalisman(state, talismanId, {
        log,
        onUpdate: () => { updateAllUI(); save(); }
      });
      updateAllUI();
      save();
      return res;
    };

    // Colosseum Window Actions
    window.startColosseumDuelAction = (tierId) => {
      const res = ColosseumService.startDuel(state, tierId, {
        log,
        onUpdate: () => { updateAllUI(); save(); }
      });
      updateAllUI();
      save();
      return res;
    };
    window.executeDuelTurnAction = () => {
      const res = ColosseumService.executeDuelTurn(state, {
        log,
        onUpdate: () => { updateAllUI(); save(); }
      });
      updateAllUI();
      save();
      return res;
    };
    window.startColosseumSurvivalAction = () => {
      const res = ColosseumService.startSurvival(state, {
        log,
        onUpdate: () => { updateAllUI(); save(); }
      });
      updateAllUI();
      save();
      return res;
    };
    window.executeSurvivalTurnAction = () => {
      const res = ColosseumService.executeSurvivalTurn(state, {
        log,
        onUpdate: () => { updateAllUI(); save(); }
      });
      updateAllUI();
      save();
      return res;
    };
    window.buyColosseumShopItemAction = (itemId) => {
      const res = ColosseumService.buyShopItem(state, itemId, {
        log,
        onUpdate: () => { updateAllUI(); save(); }
      });
      updateAllUI();
      save();
      return res;
    };

    // Rankings Window Actions
    window.updateRankingsUI = () => updateRankingsUI();
    window.setRankingCategoryAction = (cat) => {
      window._activeRankingCat = cat;
      uiSetActiveRankingTab(cat);
      updateRankingsUI();
    };
    window.refreshRankingsAction = () => {
      uiSetActiveRankingTab(window._activeRankingCat || 'cp');
      updateRankingsUI();
      log('🏆 Rankings e Combat Powers globais atualizados.', 'system');
    };
    window.challengeRankingPlayerAction = (charName, oppCP) => {
      openPanel('colosseum');
      const res = ColosseumService.startDuel(state, 'bet_500k', {
        log,
        onUpdate: () => { updateAllUI(); save(); }
      }, {
        charName,
        name: charName,
        className: 'Rival do Ranking',
        statsSnapshot: {
          hp: Math.floor(oppCP * 0.08),
          pAtk: Math.floor(oppCP * 0.06),
          pDef: Math.floor(oppCP * 0.04)
        }
      });
      updateAllUI();
      save();
      return res;
    };

    window.getGameState = () => {
      const data = { 
        ...state, 
        totalPlaytime: state.totalPlaytime + (Date.now() - (state.startTime || Date.now())), 
        lastSaveTime: Date.now(),
        selectedUids: Array.from(getSelectedSet())
      };
      delete data.startTime;
      delete data.activeMonster;
      delete data._cds;
      delete data._regenAcc;
      delete data._mpRegenAcc;
      return JSON.parse(JSON.stringify(data));
    };

    window.loadGameState = (cloudData) => {
      if (!cloudData || typeof cloudData !== 'object') return;
      const def = DEFAULT_STATE();
      const allItems = (typeof window !== 'undefined' && window.GameData) ? window.GameData.ALL_ITEMS : (D() ? D().ALL_ITEMS : null);
      const hasItemsDict = allItems && Object.keys(allItems).length > 0;
      const safeInventory = Array.isArray(cloudData.inventory)
        ? cloudData.inventory.filter(item => item && item.itemId && (!hasItemsDict || allItems[item.itemId]))
        : [];
      
      state = { ...def, ...cloudData };
      state.gender = cloudData.gender || cloudData.charGender || cloudData.sex || def.gender || 'M';
      state.charName = cloudData.charName || cloudData.heroName || cloudData.playerName || cloudData.name || def.charName || 'Tristan';
      state.heroName = state.charName;
      state.playerName = state.charName;
      state.name = state.charName;
      if (state.hp <= 0) {
        state.hp = state.maxHp || 100;
      }
      // ⚠️ SEGURANÇA: privilegeLevel é confiável apenas para gate de UI local.
      // Qualquer efeito de comando GM (gold, level, sp, itens) que seja
      // persistido/sincronizado em backend DEVE ser revalidado no servidor,
      // pois este valor é 100% controlável pelo cliente via DevTools.
      state.privilegeLevel = Number(cloudData.privilegeLevel) || (cloudData.role === 'admin' ? 1 : 0);
      state.skills = { ...def.skills, ...(cloudData.skills || {}) };
      const _sk = getStarterSkillForClass(state.class);
      if (_sk) { state.skills[_sk] = Math.max(1, state.skills[_sk] || 0); if (!state.selectedSkill) state.selectedSkill = _sk; }
      state.equipment = { ...def.equipment, ...(cloudData.equipment || {}) };
      state.base = { ...def.base, ...(cloudData.base || {}) };
      state.inventory = safeInventory;
      state.selectedUids = new Set(Array.isArray(cloudData.selectedUids) ? cloudData.selectedUids : []);
      
      state.codex = cloudData.codex && typeof cloudData.codex === 'object' ? cloudData.codex : {};
      state.dolls = Array.isArray(cloudData.dolls) ? cloudData.dolls : [];
      state.subclasses = Array.isArray(cloudData.subclasses) ? cloudData.subclasses : [];
      state.activeSubclassIndex = cloudData.activeSubclassIndex !== undefined ? cloudData.activeSubclassIndex : null;
      state.tower = cloudData.tower && typeof cloudData.tower === 'object' ? cloudData.tower : { highestFloor: 0, currentFloor: 1 };
      state.quests = cloudData.quests && typeof cloudData.quests === 'object' ? cloudData.quests : {};
      state.battlePass = cloudData.battlePass && typeof cloudData.battlePass === 'object' ? cloudData.battlePass : {};
      
      updateAllUI();
      save();
      if (cloudData.lastSaveTime) {
        setTimeout(() => checkOfflineProgress(cloudData.lastSaveTime), 600);
      }
      log(`☁️ Progresso de Nível ${state.level} carregado da nuvem com sucesso!`, 'rarity-legendary');
    };
    window.toggleMuteAudio = () => {
      if (typeof window !== 'undefined' && window.idleAudio) {
        const isMuted = window.idleAudio.toggleMute();
        const btn = el('audio-mute-btn');
        if (btn) btn.textContent = isMuted ? '🔇 Muted' : '🔊 Audio';
      }
    };

    // Registra todas as Cartas de Monstros colecionáveis no ALL_ITEMS do jogo
    if (D() && D().ALL_ITEMS) {
      for (const [cardId, cardDef] of Object.entries(MONSTER_CARDS)) {
        if (!D().ALL_ITEMS[cardId]) {
          D().ALL_ITEMS[cardId] = {
            id: cardId,
            name: cardDef.name,
            slot: 'card',
            type: 'monster_card',
            rarity: cardDef.rarity || 'common',
            tier: cardDef.rarity === 'sovereign' ? 6 : (cardDef.rarity === 'primordial' ? 5 : (cardDef.rarity === 'mythic' ? 4 : (cardDef.rarity === 'legendary' ? 3 : 2))),
            price: cardDef.level ? cardDef.level * 250 : 2500,
            icon: 'gradespecial/jewels/jewel_ring_of_baium.png',
            desc: `Carta Colecionável do Monstro ${cardDef.monster}. Absorva no Codex para bônus passivos permanentes em toda a conta!`
          };
        }
      }
    }

    attachGlobalErrorHandlers();
    bindEvents();

    state.startTime = Date.now(); 
    const hasSave = load();
    updateGameModeUI();

    if (hasSave) { 
      updateAllUI(); 
      if (state.zone) startCombat(); 
    } else { 
      state.race = 'human'; 
      state.class = 'fighter'; 
      const race = RACES.human, cls = CLASSES.fighter; 
      state.base = { atk: 0, def: 0, eva: 0, matk: 0, mdef: 0 }; 
      for (const k of ['atk','def','eva','matk','mdef']) { 
        state.base[k] = (race.stats[k] || 0) + (cls.base[k] || 0); 
      } 
      updateRaceClassUI(); 
      updateStatsUI(); 
    }

    // Verifica status da Recompensa Diária (Daily Check-in)
    setTimeout(() => {
      try {
        const dailyStatus = getDailyRewardStatus(state);
        const dotEl = el('daily-reward-dot');
        if (dotEl) dotEl.style.display = dailyStatus.canClaim ? 'block' : 'none';
        if (dailyStatus.canClaim) {
          openDailyRewardModal();
        }
      } catch (err) {
        console.warn('Erro ao checar daily reward status:', err);
      }
    }, 1200);

    _intervals.push(setInterval(updateClock, 1000)); 
    _intervals.push(setInterval(save, 10000)); 
    _intervals.push(setInterval(tickUI, 1000));

    const saveAndCloudSyncOnUnload = () => {
      save();
      if (typeof window !== 'undefined' && typeof window.saveCloudOnUnload === 'function') {
        window.saveCloudOnUnload();
      }
    };

    addTrackedListener(window, 'beforeunload', saveAndCloudSyncOnUnload);
    addTrackedListener(window, 'pagehide', saveAndCloudSyncOnUnload);
    addTrackedListener(document, 'visibilitychange', () => {
      if (document.visibilityState === 'hidden') saveAndCloudSyncOnUnload();
    });

    // ---- Embers / brasas globais (GrimoireFX) ----
    // Monta automaticamente em modo standalone (index.html direto)
    // No modo Shadow DOM (React), o IdleGame.tsx já monta via shadow.getElementById
    if (typeof window !== 'undefined' && window.GrimoireFX) {
      const rootObj = typeof _root !== 'undefined' ? _root : document;
      const gameRoot = rootObj.getElementById?.('game') || rootObj.querySelector?.('#game') || document.getElementById('game');
      if (gameRoot && !gameRoot.querySelector('.g-ember-global')) {
        const emberDiv = document.createElement('div');
        emberDiv.className = 'g-ember-global';
        gameRoot.insertBefore(emberDiv, gameRoot.firstChild);
        window.GrimoireFX.mountEmbers(emberDiv, {
          count: 45,
          colors: ['#f0883e', '#f0cd7e', '#e87d2e', '#ffd166', '#ff9b42']
        });
      }
    }

    // ---- Global Handlers para os 7 Subsistemas da Forja Imperial ----
    if (typeof window !== 'undefined') {
      window.buyInitialSoulCrystal = () => {
        const cost = 50000;
        if ((state.gold || 0) < cost) {
          log('Adena insuficiente para adquirir o Soul Crystal Inicial (50.000 Adena necessária).', 'system');
          return;
        }
        state.gold -= cost;
        serviceAddToInventory(state, 'soul_crystal_red_stage1', 1, 'rare', false, { log, updateAllUI, save }, true);
        const crystal = (state.inventory || []).find(i => i.itemId === 'soul_crystal_red_stage1');
        if (crystal) {
          crystal.isSoulCrystal = true;
          crystal.stage = 1;
          crystal.crystalLevel = 1;
          crystal.absorbedSouls = 0;
        }
        log('🔮 Soul Crystal Adquirido! Mantenha na mochila para absorver almas.', 'rarity-epic');
        updateAllUI();
        save();
      };

      window.applySAAction = (color, saKey) => {
        const wpnUid = state.equipment?.weapon;
        if (!wpnUid) {
          log('Equipe uma arma primeiro para engastar o Soul Crystal!', 'system');
          return;
        }
        serviceApplySoulCrystal(state, wpnUid, color, saKey, { log, updateAllUI, save, floatText });
      };

      window.unsealItemAction = (uid) => {
        serviceUnsealItem(state, uid, { log, updateAllUI, save });
      };

      window.polishMasterworkAction = (uid) => {
        servicePolishMasterwork(state, uid, { log, updateAllUI, save });
      };

      window.applyInitialDyeAction = (key) => {
        state.dyeSymbols = state.dyeSymbols || [null, null, null];
        const freeSlot = state.dyeSymbols.findIndex(s => !s);
        if (freeSlot === -1) {
          log('Todos os 3 slots de tatuagem estão ocupados! Remova uma tatuagem existente primeiro.', 'system');
          return;
        }
        const cost = 10000;
        if ((state.gold || 0) < cost) {
          log('Adena insuficiente para gravar o símbolo (10.000 Adena necessária).', 'system');
          return;
        }
        state.gold -= cost;
        serviceApplyDyeSymbol(state, freeSlot, key, 1, { log, updateAllUI, save });
      };

      window.upgradeDyeAction = (slotIdx) => {
        serviceUpgradeDyeSymbol(state, slotIdx, { log, updateAllUI, save });
      };

      window.removeDyeAction = (slotIdx) => {
        serviceRemoveDyeSymbol(state, slotIdx, { log, updateAllUI, save });
      };

      window.applyElementalAction = (uid, elem) => {
        serviceApplyElementalStone(state, uid, elem, { log, updateAllUI, save });
      };

      window.compoundBeltsWithDuplicateAction = () => {
        const pUid = document.getElementById('belt-primary-select')?.value;
        const sUid = document.getElementById('belt-secondary-select')?.value;
        if (!pUid || !sUid) {
          log('Selecione os dois cintos para a fusão!', 'system');
          return;
        }
        serviceCompoundBeltsWithDuplicates(state, pUid, sUid, { log, updateAllUI, save, floatText });
      };

      window.applyAugmentAction = (uid, grade) => {
        serviceApplyLifeStone(state, uid, grade, { log, updateAllUI, save });
      };

      window.removeAugmentAction = (uid) => {
        serviceRemoveAugment(state, uid, { log, updateAllUI, save });
      };

      window.chargeRandomCraftWithAdenaAction = () => {
        serviceChargeRandomCraftWithAdena(state, { log, updateAllUI, save });
      };

      window.claimRandomCraftReward = (idx) => {
        serviceClaimRandomCraft(state, idx, { log, updateAllUI, save });
      };
    }
  } catch (err) {
    console.warn('Game init warning:', err);
  }
}

function tickUI() {
  const now = Date.now(); let buffChanged = false;
  for (const k of Object.keys(state.buffs || {})) { if (state.buffs[k].until < now) { delete state.buffs[k]; buffChanged = true; } }
  const gpsEl = el('gps-text'); if (gpsEl) { gpsEl.textContent = getGoldPerSec() > 0 ? `${getGoldPerSec().toFixed(1)}/s` : '—'; }
  safeUiUpdate('stats-tick', updateStatsUI);
  const mt = el('mystic-timer'); if (mt) { mt.textContent = fmtCountdown(D().getMysticRotation()[0]?.msLeft || 0); }
  if (buffChanged) { safeUiUpdate('shop-tick', updateShopUI); }
}
