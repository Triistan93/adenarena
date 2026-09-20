/**
 * StatsEngine.js — Motor de Cálculo de Atributos do Lineage Idle.
 *
 * Responsável por calcular todos os atributos base, bônus de equipamentos,
 * bônus de conjuntos (set bonuses), buffs, coleções (codex, dolls),
 * certificações de subclass e atributos primários (STR, CON, DEX, WIT, INT, MEN).
 */

import { D } from '../core/GameConfig.js';
import { RACES, CLASSES, RACE_BASE_ATTRIBUTES } from '../data/races.js';
import { CODEX_SETS, BOSS_DOLLS } from '../data/codex.js';
import { CardCodexService } from '../services/CardCodexService.js';
import { FortressService } from '../services/FortressService.js';
import { CombatPowerService } from '../services/CombatPowerService.js';
import { SubclassCertificationService } from '../services/SubclassCertificationService.js';
import { DyeService } from '../services/DyeService.js';
import { DYES_CATALOG } from '../data/dyes.js';
import { PetService } from '../services/PetService.js';
import { resolveCanonicalClassId } from '../data/classes/class_aliases.js';
import { CanonicalClassGraph } from '../data/classes/CanonicalClassGraph.js';
import { CLASS_SAVE_MIGRATION_MAP } from '../services/ClassSaveMigrationMap.js';
import { WeaponResonanceService } from '../services/WeaponResonanceService.js';
import { isSkillInProgressionPath } from '../services/SkillEligibility.js';
import { getArmorType, getWeaponType } from '../data/items/item_class_rules.js';

export const STR_MODIFIERS = {
  10: 0.42, 11: 0.43, 12: 0.45, 13: 0.46, 14: 0.48, 15: 0.50,
  16: 0.51, 17: 0.53, 18: 0.55, 19: 0.57, 20: 0.59, 21: 0.61,
  22: 0.63, 23: 0.66, 24: 0.68, 25: 0.71, 26: 0.73, 27: 0.76,
  28: 0.78, 29: 0.81, 30: 0.84, 31: 0.87, 32: 0.90, 33: 0.94,
  34: 0.94, 35: 1.01, 36: 1.04, 37: 1.08, 38: 1.12, 39: 1.16,
  40: 1.20, 41: 1.24, 42: 1.29, 43: 1.33, 44: 1.38, 45: 1.43,
  46: 1.48, 47: 1.54, 48: 1.59, 49: 1.65, 50: 1.71, 51: 1.77,
  52: 1.83, 53: 1.90, 54: 1.97, 55: 2.04, 56: 2.11, 57: 2.19,
  58: 2.27, 59: 2.35, 60: 2.45
};

export const DEX_MODIFIERS = {
  10: 0.92, 11: 0.93, 12: 0.94, 13: 0.94, 14: 0.95, 15: 0.96,
  16: 0.97, 17: 0.98, 18: 0.99, 19: 1.00, 20: 1.01, 21: 1.01,
  22: 1.02, 23: 1.03, 24: 1.04, 25: 1.05, 26: 1.06, 27: 1.07,
  28: 1.08, 29: 1.09, 30: 1.10, 31: 1.11, 32: 1.12, 33: 1.13,
  34: 1.14, 35: 1.15, 36: 1.16, 37: 1.17, 38: 1.18, 39: 1.19,
  40: 1.20, 41: 1.21, 42: 1.22, 43: 1.24, 44: 1.25, 45: 1.26,
  46: 1.27, 47: 1.28, 48: 1.29, 49: 1.30, 50: 1.35
};

export function calculatePhysicalSkillDamage({ pAtkSkill = 1000, pAtkChar = 500, pDefChar = 300, isRange = false, chargeLv = 0, soulCount = 0, mult = 1.0 }) {
  const constant = isRange ? 70 : 77;
  let chargeMult = 0;
  if (chargeLv > 1) {
    chargeMult = 0.2 * (chargeLv - 1);
  }
  let soulMult = 0;
  if (soulCount > 0) {
    soulMult = 0.05 * Math.min(5, soulCount);
  }

  const baseAtkSum = pAtkSkill + pAtkChar;
  const chargeSoulBonus = baseAtkSum * (chargeMult + soulMult);
  const damage = constant * (baseAtkSum + chargeSoulBonus) * mult / Math.max(1, pDefChar);
  return Math.floor(damage);
}

export const ASTRAL_NODES = {
  // Constelação do Dragão (Combate)
  dragon_1: { id: 'dragon_1', const: 'dragon', name: 'Fúria Titânica', icon: '⚔️', desc: '+3% Atk Físico por nível', max: 10, cost: 1, stat: 'patkMult', val: 0.03 },
  dragon_2: { id: 'dragon_2', const: 'dragon', name: 'Chama Arcana', icon: '🔮', desc: '+3% Atk Mágico por nível', max: 10, cost: 1, stat: 'matkMult', val: 0.03 },
  dragon_3: { id: 'dragon_3', const: 'dragon', name: 'Golpe Mortal', icon: '🎯', desc: '+2% Chance Crítica por nível', max: 5, cost: 2, stat: 'crit', val: 2 },
  dragon_4: { id: 'dragon_4', const: 'dragon', name: 'Lâmina Suprema', icon: '💥', desc: '+5% Dano Crítico por nível', max: 10, cost: 2, stat: 'critDmg', val: 0.05 },

  // Constelação da Fênix (Resistência)
  phoenix_1: { id: 'phoenix_1', const: 'phoenix', name: 'Sangue da Fênix', icon: '❤️', desc: '+5% HP Máximo por nível', max: 10, cost: 1, stat: 'hpMult', val: 0.05 },
  phoenix_2: { id: 'phoenix_2', const: 'phoenix', name: 'Mente Iluminada', icon: '🔵', desc: '+5% MP Máximo por nível', max: 10, cost: 1, stat: 'mpMult', val: 0.05 },
  phoenix_3: { id: 'phoenix_3', const: 'phoenix', name: 'Éter Sagrado', icon: '🌿', desc: '+10% Regeneração de Mana por nível', max: 10, cost: 1, stat: 'mpRegen', val: 0.10 },
  phoenix_4: { id: 'phoenix_4', const: 'phoenix', name: 'Escudo Divino', icon: '🛡️', desc: '+3% P.Def e M.Def por nível', max: 10, cost: 2, stat: 'defMult', val: 0.03 },

  // Constelação de Midas (Economia)
  midas_1: { id: 'midas_1', const: 'midas', name: 'Toque de Midas', icon: '🪙', desc: '+5% Ouro Ganho por nível', max: 10, cost: 1, stat: 'goldBoost', val: 0.05 },
  midas_2: { id: 'midas_2', const: 'midas', name: 'Sorte dos Deuses', icon: '🍀', desc: '+3% Taxa de Drop por nível', max: 10, cost: 1, stat: 'luckBoost', val: 0.03 },
  midas_3: { id: 'midas_3', const: 'midas', name: 'Sabedoria Ancestral', icon: '📚', desc: '+5% XP Bônus por nível', max: 10, cost: 1, stat: 'xpBoost', val: 0.05 },
  midas_4: { id: 'midas_4', const: 'midas', name: 'Aceleração Temporal', icon: '⚡', desc: '+2% Velocidade de Ataque por nível', max: 10, cost: 2, stat: 'speed', val: 2 },
};

export function getAstralMasteryBonuses(state) {
  const out = {
    patkMult: 0, matkMult: 0, crit: 0, critDmg: 0,
    hpMult: 0, mpMult: 0, mpRegen: 0, defMult: 0,
    goldBoost: 0, luckBoost: 0, xpBoost: 0, speed: 0
  };
  if (!state?.astralMastery || typeof state.astralMastery !== 'object') return out;

  for (const [nodeId, lvl] of Object.entries(state.astralMastery)) {
    const node = ASTRAL_NODES[nodeId];
    if (node && lvl > 0) {
      const amount = node.val * Math.min(lvl, node.max);
      if (out[node.stat] !== undefined) {
        out[node.stat] += amount;
      }
    }
  }
  return out;
}

/**
 * Retorna os dados completos da classe informada, resolvendo herança de arquétipo se necessário.
 * @param {string} classId
 * @returns {Object|null}
 */
export function getClass(classId) {
  if (!classId) return null;
  const rawId = String(classId).trim();
  let node = CanonicalClassGraph.getClassNode(rawId);
  if (!node) {
    const canon = resolveCanonicalClassId(rawId);
    if (canon && canon !== rawId) node = CanonicalClassGraph.getClassNode(canon);
  }
  if (!node) {
    const stripped = rawId.replace(/^(human|darkelf|dark_elf|elf|elven|orc|dwarf|kamael|sylph|highelf|ertheia)_?/, '');
    if (stripped && stripped !== rawId) {
      node = CanonicalClassGraph.getClassNode(stripped) || CanonicalClassGraph.getClassNode(resolveCanonicalClassId(stripped));
    }
  }
  if (node) {
    return {
      id: node.id,
      name: node.name,
      race: node.race,
      archetype: node.archetypeGroup,
      archetypeGroup: node.archetypeGroup,
      stage: node.stage,
      parent: node.parentClass,
      role: node.role,
      weapons: node.weapons,
      base: node.baseStats || { atk: 0, def: 0, hp: 100, mp: 40, eva: 5, crit: 5, matk: 0, mdef: 5 }
    };
  }

  // Fallback via migration map para compatibilidade com saves legados não migrados
  const migration = CLASS_SAVE_MIGRATION_MAP[rawId] || CLASS_SAVE_MIGRATION_MAP[rawId.toLowerCase()];
  if (migration) {
    const migratedNode = CanonicalClassGraph.getClassNode(migration.canonicalId);
    if (migratedNode) {
      return {
        id: migratedNode.id,
        name: migratedNode.name,
        race: migratedNode.race,
        archetype: migratedNode.archetypeGroup,
        archetypeGroup: migratedNode.archetypeGroup,
        stage: migratedNode.stage,
        parent: migratedNode.parentClass,
        role: migratedNode.role,
        weapons: migratedNode.weapons,
        base: migratedNode.baseStats || { atk: 0, def: 0, hp: 100, mp: 40, eva: 5, crit: 5, matk: 0, mdef: 5 }
      };
    }
  }

  const legacyClasses = (typeof window !== 'undefined' && window.EchoData && window.EchoData.CLASSES_ECHO) ? window.EchoData.CLASSES_ECHO : {};
  return legacyClasses[rawId] || null;
}

/**
 * Retorna os atributos primários base (STR, CON, DEX, etc.) da combinação raça/classe.
 * @param {string} raceKey
 * @param {string} classKey
 * @returns {{str: number, con: number, dex: number, wit: number, int: number, men: number}}
 */
export function getBaseAttributes(raceKey, classKey) {
  const r = String(raceKey || 'human').toLowerCase();
  const c = getClass(classKey);
  const isMage = c?.archetypeGroup === 'mage' || c?.archetype === 'mage';

  let key = 'human_fighter';
  if (r === 'darkelf') key = isMage ? 'darkelf_mage' : 'darkelf_fighter';
  else if (r === 'elf') key = isMage ? 'elf_mage' : 'elf_fighter';
  else if (r === 'orc') key = isMage ? 'orc_mage' : 'orc_fighter';
  else if (r === 'dwarf') key = 'dwarf_fighter';
  else if (r === 'kamael') key = 'kamael_male';
  else if (r === 'sylph') key = 'elf_fighter';
  else if (r === 'highelf') key = isMage ? 'elf_mage' : 'elf_fighter';
  else if (r === 'ertheia') key = isMage ? 'elf_mage' : 'elf_fighter';
  else if (r === 'human') key = isMage ? 'human_mage' : 'human_fighter';

  return { ...(RACE_BASE_ATTRIBUTES[key] || RACE_BASE_ATTRIBUTES.human_fighter) };
}

/**
 * Retorna os atributos dinamicamente escalados de um item de Herança com base no nível do jogador.
 * @param {Object} def — Definição do item
 * @param {number} playerLevel — Nível atual do herói (1 a 40+)
 * @returns {Object}
 */
export function getHeirloomScaledStats(def, playerLevel = 1) {
  if (!def || !def.heirloomScaling) return def?.base || def || {};
  const lvl = Math.max(1, Number(playerLevel) || 1);
  const scaling = def.heirloomScaling;

  if (lvl <= 19 && scaling.phase1) {
    return { ...def, ...(scaling.phase1.stats || {}) };
  } else if (lvl <= 39 && scaling.phase2) {
    return { ...def, ...(scaling.phase2.stats || {}) };
  } else {
    return { ...def, ...(scaling.phase3?.stats || def.base || {}) };
  }
}

/**
 * Retorna o bônus individual de um slot de equipamento, aplicando multiplicadores de raridade,
 * encantamento, refinamento foundation, afixos de itens e escalonamento de herança.
 * @param {Object} state — Estado do jogo
 * @param {string} slot  — Nome do slot ('weapon', 'armor', etc.)
 * @returns {Object|null}
 */
export function getEquipBonus(state, slot) {
  const itemId = state.equipment?.[slot];
  if (!itemId) return null;
  const inv = state.inventory?.find(i => i.uid === itemId);
  if (!inv) return null;
  const gData = D();
  const def = gData?.ALL_ITEMS?.[inv.itemId] || (typeof window !== 'undefined' && window.ALL_ITEMS?.[inv.itemId]) || inv;
  if (!def) return null;

  const rarityMult = inv.rarity ? (gData?.RARITY?.[inv.rarity]?.mult || 1) : 1;
  const enchant = inv.enchant || 0;
  // Enchant multiplier: +1=1.30, +2=1.60, +3=1.90, +4=2.40, ..., +16=8.40
  // Fix: 0.36 was a typo causing +4 (1.86×) < +3 (1.90×) inversion. Corrected to 0.90.
  const enchantMult = 1 + (enchant <= 3 ? enchant * 0.3 : (0.90 + (enchant - 3) * 0.5));
  const foundationMult = inv.foundation ? 1.3 : 1;

  let out = { ...def };
  if (out.pAtk && !out.atk) out.atk = out.pAtk;
  if (out.pDef && !out.def) out.def = out.pDef;
  if (out.mAtk && !out.matk) out.matk = out.mAtk;
  if (out.mDef && !out.mdef) out.mdef = out.mDef;

  if (def.isHeirloom || inv.isHeirloom) {
    const scaled = getHeirloomScaledStats(def, state.level || 1);
    out = { ...out, ...scaled };
  }

  ['atk','def','matk','mdef','hp','mp','eva','crit','speed','lifesteal'].forEach(k => {
    if (out[k]) out[k] = Math.floor(Number(out[k]) * rarityMult * enchantMult * foundationMult);
  });

  if (Array.isArray(inv.affixes)) {
    inv.affixes.forEach(aff => {
      const defAff = gData?.AFFIX_MAP ? gData.AFFIX_MAP[aff.id] : null;
      if (defAff && defAff.type === 'stat' && defAff.stat) {
        const k = defAff.stat;
        out[k] = (Number(out[k]) || 0) + Number(aff.value || 0);
      }
    });
  }
  return out;
}

/**
 * Retorna o somatório de todos os bônus de todos os equipamentos equipados.
 * @param {Object} state
 * @returns {Object}
 */
export function getTotalEquipBonuses(state) {
  const totals = { atk: 0, def: 0, matk: 0, mdef: 0, hp: 0, mp: 0, eva: 0, crit: 0, speed: 0, lifesteal: 0, xpBoost: 0, goldBoost: 0, adenaBoost: 0, str: 0, dex: 0, con: 0, int: 0, wit: 0, men: 0 };
  if (!state.equipment) return totals;
  const seenUids = new Set();
  for (const slot of Object.keys(state.equipment)) {
    const uid = state.equipment[slot];
    if (!uid || seenUids.has(uid)) continue;
    seenUids.add(uid);
    const b = getEquipBonus(state, slot);
    if (!b) continue;
    for (const k of Object.keys(totals)) {
      if (b[k] !== undefined && b[k] !== null) totals[k] += Number(b[k]) || 0;
    }
  }
  return totals;
}

/**
 * Calcula os bônus acumulados de certificação de subclasses e transformações divinas.
 * @param {Object} state
 * @returns {Object}
 */
export function getCertificationsBonuses(state) {
  const emptyBonuses = { atk: 0, def: 0, matk: 0, mdef: 0, crit: 0, celestial: false, hpPercent: 0, mpPercent: 0, cpPercent: 0, evaAdd: 0, pAtkPercent: 0, pDefPercent: 0, mAtkPercent: 0, mDefPercent: 0, atkSpdPercent: 0, speedPercent: 0, castSpd: 0 };
  if (!state) return emptyBonuses;

  // Regra canônica Lineage II / MasterWork e Aden Arena:
  // Certificações de Subclasse beneficiam EXCLUSIVAMENTE a Classe Principal!
  // Valida e normaliza activeSubclassIndex: se for índice válido de subclasse, não aplica bônus.
  const isSubActive = typeof state.activeSubclassIndex === 'number'
    && Number.isInteger(state.activeSubclassIndex)
    && state.activeSubclassIndex >= 0
    && Array.isArray(state.subclasses)
    && state.activeSubclassIndex < state.subclasses.length;

  if (isSubActive) {
    return emptyBonuses;
  }
  
  const certBonuses = SubclassCertificationService.calculateTotalCertificationBonuses(state);

  return {
    atk: certBonuses.pAtk || 0,
    def: certBonuses.pDef || 0,
    matk: certBonuses.mAtk || 0,
    mdef: certBonuses.mDef || 0,
    crit: certBonuses.critRate || 0,
    celestial: certBonuses.celestialProc || false,
    hpPercent: certBonuses.maxHpPercent || 0,
    mpPercent: certBonuses.maxMpPercent || 0,
    cpPercent: certBonuses.maxCpPercent || 0,
    evaAdd: certBonuses.evasion || 0,
    pAtkPercent: certBonuses.pAtkPercent || 0,
    pDefPercent: certBonuses.pDefPercent || 0,
    mAtkPercent: certBonuses.mAtkPercent || 0,
    mDefPercent: certBonuses.mDefPercent || 0,
    atkSpd: certBonuses.atkSpd || 0,
    atkSpdPercent: certBonuses.atkSpdPercent || 0,
    speedPercent: certBonuses.speedPercent || 0,
    castSpd: certBonuses.castSpd || 0,
    range: certBonuses.range || 0,
    hasteProc: certBonuses.hasteProc || false,
    defenceProc: certBonuses.defenceProc || false,
    spiritProc: certBonuses.spiritProc || false,
    critProc: certBonuses.critProc || false,
    totalCP: certBonuses.totalCP || 0,
    totalCertCount: certBonuses.totalCertCount || 0
  };
}

/**
 * Conta quantas peças de um conjunto de armadura o jogador está usando.
 * @param {Object} state
 * @param {Object} setDef
 * @returns {{count: number, hasShield: boolean, totalPieceCount: number}}
 */
export function getEquippedSetCount(state, setDef) {
  if (!setDef) return { count: 0, hasShield: false, totalPieceCount: 5 };
  let count = 0;
  const slots = ['armor', 'helmet', 'boots', 'gloves', 'legs'];

  for (const slot of slots) {
    const uid = state.equipment?.[slot] || (slot === 'armor' ? state.equipment?.chest : (slot === 'chest' ? state.equipment?.armor : null));
    if (!uid) continue;
    const item = state.inventory?.find(i => i.uid === uid);
    if (!item) continue;
    const gData = D();
    const def = gData?.ALL_ITEMS?.[item.itemId];
    if (!def) continue;
    const itemId = def.id;

    let matched = false;
    if (setDef.pieces && setDef.pieces[slot]) {
      const targetId = gData?.ALL_ITEMS?.[setDef.pieces[slot]]?.id || setDef.pieces[slot];
      if (itemId === targetId) matched = true;
    }
    if (!matched && setDef.variantPieces && setDef.variantPieces[slot]) {
      const targetVariants = setDef.variantPieces[slot].map(v => gData?.ALL_ITEMS?.[v]?.id || v);
      if (targetVariants.includes(itemId)) matched = true;
    }
    if (matched) count++;
  }

  let hasShield = false;
  if (setDef.shieldPiece) {
    const shieldUid = state.equipment?.shield;
    if (shieldUid) {
      const shieldItem = state.inventory?.find(i => i.uid === shieldUid);
      if (shieldItem) {
        const gData = D();
        const def = gData?.ALL_ITEMS?.[shieldItem.itemId];
        if (def) {
          const targetShieldId = gData?.ALL_ITEMS?.[setDef.shieldPiece]?.id || setDef.shieldPiece;
          if (def.id === targetShieldId) hasShield = true;
        }
      }
    }
  }

  return { count, hasShield, totalPieceCount: setDef.fullPieceCount || 5 };
}

/**
 * Calcula os bônus ativos de conjuntos de armaduras (Sets) equipados.
 * @param {Object} state
 * @returns {{activeBonuses: Array, primaryStats: Object, statTotals: Object}}
 */
export function getActiveSetBonuses(state) {
  const activeBonuses = [];
  const primaryStats = { str: 0, dex: 0, con: 0, int: 0, wit: 0, men: 0 };
  const statTotals = { atk: 0, def: 0, matk: 0, mdef: 0, hp: 0, mp: 0, eva: 0, crit: 0, speed: 0, lifesteal: 0, block: 0, xpBoost: 0, goldBoost: 0, adenaBoost: 0 };

  const gData = D();
  const armorSets = gData?.ARMOR_SETS || {};

  for (const [setId, setDef] of Object.entries(armorSets)) {
    const { count, hasShield, totalPieceCount } = getEquippedSetCount(state, setDef);
    if (count < 2) continue;

    const thresholds = [2, 3, totalPieceCount];
    if (setDef.shieldPiece && count >= totalPieceCount && hasShield) {
      thresholds.push(totalPieceCount + 1);
    }

    const setBonusInfo = {
      setId,
      setName: setDef.name,
      equippedCount: count,
      hasShield,
      fullPieceCount: totalPieceCount,
      activeThresholds: []
    };

    for (const t of thresholds) {
      let reached = false;
      if (t <= 3 && count >= t) reached = true;
      else if (t === totalPieceCount && count >= totalPieceCount) reached = true;
      else if (t === totalPieceCount + 1 && count >= totalPieceCount && hasShield) reached = true;

      if (reached && setDef.bonuses && setDef.bonuses[t]) {
        const b = setDef.bonuses[t];
        setBonusInfo.activeThresholds.push({ threshold: t, bonus: b });

        for (const [k, v] of Object.entries(b)) {
          if (k === 'primary') {
            for (const [pk, pv] of Object.entries(v)) {
              if (primaryStats[pk] !== undefined) primaryStats[pk] += Number(pv) || 0;
            }
          } else if (statTotals[k] !== undefined) {
            statTotals[k] += Number(v) || 0;
          }
        }
      }
    }

    if (setBonusInfo.activeThresholds.length > 0) {
      activeBonuses.push(setBonusInfo);
    }
  }

  return { activeBonuses, primaryStats, statTotals };
}

/**
 * Retorna o bônus total ativo obtido no Codex de Coleções.
 * @param {Object} state
 * @returns {Object}
 */
export function getCodexBonuses(state) {
  const totals = { atk: 0, def: 0, matk: 0, mdef: 0, hp: 0, mp: 0, eva: 0, crit: 0 };
  const codex = state.codex || {};
  for (const [setId, setDef] of Object.entries(CODEX_SETS)) {
    const regList = codex[setId] || [];
    if (setDef.items.every(itemId => regList.includes(itemId))) {
      for (const [k, val] of Object.entries(setDef.bonus)) {
        totals[k] = (totals[k] || 0) + val;
      }
    }
  }

  // Bônus passivos acumulados das Cartas de Monstros no Codex
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

/**
 * Retorna o bônus total ativo obtido através de Boss Dolls.
 * @param {Object} state
 * @returns {Object}
 */
export function getDollsBonuses(state) {
  const totals = { atk: 0, def: 0, matk: 0, mdef: 0, hp: 0, mp: 0, eva: 0, crit: 0, speed: 0, lifesteal: 0 };
  const dolls = state.dolls || [];
  for (const d of dolls) {
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

/**
 * Aplica os multiplicadores dos atributos primários (STR, CON, DEX, INT, WIT, MEN)
 * aos atributos finais calculados.
 * @param {Object} stats
 * @param {Object} primary
 * @returns {Object}
 */
export function applyPrimaryStats(stats, primary) {
  if (!primary) return stats;
  const str = Number(primary.str) || 0;
  const con = Number(primary.con) || 0;
  const dex = Number(primary.dex) || 0;
  const int = Number(primary.int) || 0;
  const wit = Number(primary.wit) || 0;
  const men = Number(primary.men) || 0;

  if (str > 0) stats.atk = Math.floor(stats.atk * (1 + str * 0.005));
  if (con > 0) stats.maxHp = Math.floor(stats.maxHp * (1 + con * 0.01));
  if (dex > 0) {
    stats.crit = Math.round(((stats.crit || 0) + dex * 0.3) * 10) / 10;
    stats.eva = (stats.eva || 0) + Math.floor(dex * 0.2);
    stats.speed = Math.round(((stats.speed || 1) + (dex * 0.1) / 100) * 100) / 100;
  }
  if (int > 0) stats.matk = Math.floor(stats.matk * (1 + int * 0.005));
  if (wit > 0) stats.maxMp = Math.floor(stats.maxMp * (1 + wit * 0.003));
  if (men > 0) {
    stats.mdef = Math.floor(stats.mdef * (1 + men * 0.005));
    stats.maxMp = Math.floor(stats.maxMp * (1 + men * 0.002));
  }
  return stats;
}

/**
 * Detecta o tipo de armadura equipada ('heavy', 'light', 'robe', ou null se nenhuma).
 */
export function getEquippedArmorType(state) {
  if (!state?.equipment) return null;
  const uid = state.equipment.armor || state.equipment.chest;
  if (!uid) return null;
  const item = state.inventory?.find(i => i.uid === uid) || (typeof uid === 'object' ? uid : null);
  if (!item) return null;
  const gData = D();
  const def = gData?.ALL_ITEMS?.[item.itemId || item.id] || (typeof window !== 'undefined' && window.ALL_ITEMS?.[item.itemId || item.id]) || item;
  
  if (def.armorType) return def.armorType;
  const t = String(def.type || '').toLowerCase();
  if (t === 'heavy' || t === 'heavy_armor') return 'heavy';
  if (t === 'light' || t === 'light_armor') return 'light';
  if (t === 'robe' || t === 'magic_armor') return 'robe';
  return getArmorType(def.id || item.itemId || '', def.name || '');
}

/**
 * Verifica se um escudo está equipado.
 */
export function hasEquippedShield(state) {
  if (!state?.equipment) return false;
  const uid = state.equipment.shield || state.equipment.offhand;
  if (!uid) return false;
  const item = state.inventory?.find(i => i.uid === uid) || (typeof uid === 'object' ? uid : null);
  if (!item) return false;
  const gData = D();
  const def = gData?.ALL_ITEMS?.[item.itemId || item.id] || (typeof window !== 'undefined' && window.ALL_ITEMS?.[item.itemId || item.id]) || item;
  const s = `${def.id || ''} ${def.name || ''} ${def.slot || ''} ${def.type || ''} ${def.armorType || ''}`.toLowerCase();
  if (s.includes('sigil')) return false;
  return s.includes('shield');
}

/**
 * Verifica se um sigilo (sigil) está equipado.
 */
export function hasEquippedSigil(state) {
  if (!state?.equipment) return false;
  const uid = state.equipment.sigil || state.equipment.shield || state.equipment.offhand;
  if (!uid) return false;
  const item = state.inventory?.find(i => i.uid === uid) || (typeof uid === 'object' ? uid : null);
  if (!item) return false;
  const gData = D();
  const def = gData?.ALL_ITEMS?.[item.itemId || item.id] || (typeof window !== 'undefined' && window.ALL_ITEMS?.[item.itemId || item.id]) || item;
  const s = `${def.id || ''} ${def.name || ''} ${def.slot || ''} ${def.type || ''} ${def.armorType || ''}`.toLowerCase();
  return s.includes('sigil');
}

/**
 * Retorna categoria e características da arma equipada.
 */
export function getEquippedWeaponInfo(state) {
  if (!state?.equipment) return { category: null, isTwoHanded: false };
  const uid = state.equipment.weapon || state.equipment.rightHand;
  if (!uid) return { category: null, isTwoHanded: false };
  const item = state.inventory?.find(i => i.uid === uid) || (typeof uid === 'object' ? uid : null);
  if (!item) return { category: null, isTwoHanded: false };
  const gData = D();
  const def = gData?.ALL_ITEMS?.[item.itemId || item.id] || (typeof window !== 'undefined' && window.ALL_ITEMS?.[item.itemId || item.id]) || item;

  const typeProp = String(def.weaponType || def.type || '').toLowerCase();
  const idAndName = `${def.id || ''} ${def.name || ''}`.toLowerCase();

  let category = null;
  if (typeProp.includes('dual') || /dual|dual_sword|dualsword/.test(idAndName)) {
    category = 'dual';
  } else if (typeProp.includes('bow') || /bow|crossbow/.test(idAndName)) {
    category = 'bow';
  } else if (typeProp.includes('dagger') || /dagger|knife|dirk|sword_breaker|stiletto|kris/.test(idAndName)) {
    category = 'dagger';
  } else if (typeProp.includes('spear') || typeProp.includes('polearm') || /spear|lance|pike|poleaxe|halberd|glaive|trident/.test(idAndName)) {
    category = 'spear';
  } else if (typeProp.includes('fist') || typeProp.includes('knuckle') || /fist|knuckle|claw|chakram/.test(idAndName)) {
    category = 'fist';
  } else if (typeProp.includes('blunt') || typeProp.includes('hammer') || typeProp.includes('mace') || /hammer|mace|blunt|club|morning_star|warhammer/.test(idAndName)) {
    category = 'blunt';
  } else if (typeProp.includes('staff') || typeProp.includes('wand') || /staff|wand|scepter|magicblunt|crucifix/.test(idAndName)) {
    category = 'staff';
  } else if (typeProp.includes('sword') || typeProp.includes('blade') || typeProp.includes('axe') || typeProp === 'melee' || /sword|blade|axe|saber|katana|rapier|broadsword|falchion|claymore|scimitar/.test(idAndName)) {
    category = 'sword';
  } else {
    category = getWeaponType(def.id || item.itemId || '', def.name || '') || typeProp || null;
  }

  const isTwoHanded = Boolean(
    def.isTwoHanded || def.twoHanded || def.hands === 2 ||
    /two_hand|twohanded|two-handed|great_sword|greatsword|big_hammer|two_hand_sword|two_hand_blunt/.test(`${def.id || ''} ${def.name || ''} ${typeProp}`)
  );

  return { category, isTwoHanded };
}

/**
 * Calcula todos os atributos atuais do personagem (stats consolidados).
 * @param {Object} state — Estado do jogo
 * @returns {Object} Objeto com todos os atributos calculados
 */
export function getStats(state) {
  const rData = (typeof window !== 'undefined' && window.EchoData) ? window.EchoData.RACES_ECHO : RACES;
  const raceKey = state.race ? String(state.race).toLowerCase() : 'human';
  const race = rData?.[raceKey] || rData?.human;
  const cls = getClass(state.class);
  const raceStats = race?.stats || {};
  const clsBase = cls?.base || {};
  const skills = state.skills || {};

  const LEGACY_PASSIVE_MAP = {
    wpnMastF: 'weapon_mastery',
    weaponMastM: 'weapon_mastery',
    armorMast: 'armor_mastery',
    robeMast: 'robe_mastery',
    lightArmor: 'light_armor_mastery',
    heavyArmor: 'heavy_armor_mastery',
    antiMagic: 'anti_magic',
    higherMana: 'higher_mana'
  };

  const sk = (id) => {
    const val = Number(skills[id]) || 0;
    if (val <= 0) return 0;
    const canonId = LEGACY_PASSIVE_MAP[id] || id;
    if (state.class && !isSkillInProgressionPath(state, canonId)) return 0;
    return val;
  };

  const lvl = Number(state?.level) || 1;
  let baseAtk  = (Number(state?.base?.atk)  || 0) + (Number(raceStats.atk)  || 0) + (Number(clsBase.atk)  || 0) + (lvl * 3) + 15;
  let baseDef  = (Number(state?.base?.def)  || 0) + (Number(raceStats.def)  || 0) + (Number(clsBase.def)  || 0) + (lvl * 2) + 10;
  let baseEva  = (Number(state?.base?.eva)  || 0) + (Number(raceStats.eva)  || 0) + (Number(clsBase.eva)  || 0);
  let baseMatk = (Number(state?.base?.matk) || 0) + (Number(raceStats.matk) || 0) + (Number(clsBase.matk) || 0) + (lvl * 3) + 15;
  let baseMdef = (Number(state?.base?.mdef) || 0) + (Number(raceStats.mdef) || 0) + (Number(clsBase.mdef) || 0) + (lvl * 2) + 8;

  // Equipamento equipado para condições de mastery canônicas
  const armorType = getEquippedArmorType(state);
  const isHeavyEquipped = armorType === 'heavy';
  const isLightEquipped = armorType === 'light';
  const isRobeEquipped  = armorType === 'robe';
  const isShieldEquipped = hasEquippedShield(state);
  const isSigilEquipped  = hasEquippedSigil(state);

  const wpnInfo = getEquippedWeaponInfo(state);
  const wCat = wpnInfo.category;
  const isTwoHandedWpn = wpnInfo.isTwoHanded;

  const isSwordBluntEquipped = wCat === 'sword' || wCat === 'blunt' || wCat === 'melee';
  const isDualEquipped = wCat === 'dual';
  const isPolearmEquipped = wCat === 'spear';
  const isBowEquipped = wCat === 'bow';
  const isDaggerEquipped = wCat === 'dagger';
  const isFistEquipped = wCat === 'fist';

  // Legacy passives
  baseAtk  += sk('wpnMastF') * 4.5;
  baseAtk  += sk('weaponMastM') * 1.5;
  baseMatk += sk('weaponMastM') * 2.5;
  baseDef  += sk('armorMast') * 11;
  if (isRobeEquipped) baseDef += sk('robeMast') * 1.7;
  if (isLightEquipped) {
    baseDef  += sk('lightArmor') * 4.2;
    baseEva  += sk('lightArmor') * 3;
  }
  if (isHeavyEquipped) baseDef += sk('heavyArmor') * 12;
  baseMdef += sk('antiMagic') * 18;
  let mpRegenBonus = sk('higherMana') * 2;

  // V2 Canonical Passives — Armas (condicionais ao tipo de arma equipada)
  if (isSwordBluntEquipped) baseAtk += sk('sword_blunt_mastery') * 5;
  if (isDualEquipped)       baseAtk += sk('dual_weapon_mastery') * 5;
  if (isPolearmEquipped)    baseAtk += sk('polearm_mastery') * 5;
  if (isBowEquipped)        baseAtk += sk('bow_mastery') * 5;
  if (isDaggerEquipped)     baseAtk += sk('dagger_mastery') * 5;
  if (isFistEquipped)       baseAtk += sk('fist_mastery') * 5;
  if (isTwoHandedWpn)       baseAtk += sk('two_handed_weapon_mastery') * 5;

  // Passivas universais de combate — sempre ativas se aprendidas
  baseAtk += (sk('weapon_mastery') + sk('master_of_combat') + sk('eye_of_slayer')) * 5;

  // V2 Canonical Passives — Mágicas e Robe/Sigil
  baseMatk += (sk('magic_mastery') + sk('spellcraft')) * 4;
  if (isRobeEquipped)  baseMatk += sk('robe_mastery') * 4;
  if (isSigilEquipped) baseMatk += sk('sigil_mastery') * 4;

  // V2 Canonical Passives — Armaduras e Escudos (condicionais à armadura equipada)
  if (isHeavyEquipped) baseDef += sk('heavy_armor_mastery') * 12;
  if (isLightEquipped) {
    baseDef += sk('light_armor_mastery') * 6;
    baseEva += sk('light_armor_mastery') * 3;
  }
  baseDef += sk('armor_mastery') * 8; // Universal armor mastery
  if (isShieldEquipped) baseDef += sk('shield_mastery') * 10;

  baseEva += sk('boost_evasion') * 3;
  baseMdef += sk('anti_magic') * 18;
  mpRegenBonus += (sk('higher_mana') + sk('boost_mp') + sk('mana_recovery') + sk('focus_mind') + sk('higher_mana_gain')) * 2;

  const eb = getTotalEquipBonuses(state);
  const setRes = getActiveSetBonuses(state);
  const setB = setRes.statTotals;

  let itemCraftBonus = 0, itemLootBonus = 0;
  if (state.equipment) {
    const seenCraftLootUids = new Set();
    for (const slot of Object.keys(state.equipment)) {
      const uid = state.equipment[slot];
      if (!uid || seenCraftLootUids.has(uid)) continue;
      seenCraftLootUids.add(uid);
      const it = getEquipBonus(state, slot);
      if (!it) continue;
      if (it.craftBonus) itemCraftBonus += Number(it.craftBonus) || 0;
      if (it.lootBonus) itemLootBonus += Number(it.lootBonus) || 0;
    }
  }

  const now = Date.now();
  let buffAtk = 0, buffDef = 0, buffMatk = 0, buffMdef = 0, buffAtkMult = 0;
  let buffCrit = (sk('focus') * 5) + (sk('critical_chance') * 5) + (sk('eye_of_slayer') * 2);
  let buffCritDmg = (sk('critical_power') * 0.05);
  let buffSpd = (sk('quick_step') * 5) + (sk('boost_attack_speed') * 5) + (sk('fast_spell_casting') * 4);

  let xpBoost = 0, goldBoost = 0, luckBoost = 0, autoPotion = false;
  state.buffs = state.buffs || {};
  for (const k of Object.keys(state.buffs)) {
    if (state.buffs[k].until < now) continue;
    const b = state.buffs[k];
    if (k === 'atk') buffAtk += Number(b.amount) || 0;
    else if (k === 'def') buffDef += Number(b.amount) || 0;
    else if (k === 'speed') buffSpd += Number(b.amount) || 0;
    else if (k === 'matk') buffMatk += Number(b.amount) || 0;
    else if (k === 'warcry' || b.effect === 'warcry' || b.type === 'warcry') buffAtkMult = Math.max(buffAtkMult, Number(b.amount) || 0);
    else if (k === 'xpBoost') xpBoost = Math.max(xpBoost, Number(b.amount) || 0);
    else if (k === 'goldBoost') goldBoost = Math.max(goldBoost, Number(b.amount) || 0);
    else if (k === 'luckBoost') luckBoost = Math.max(luckBoost, Number(b.amount) || 0);
    else if (k === 'autoPotion') autoPotion = true;
    else if (k === 'counter_haste') buffSpd += Number(b.amount) || 32;
    else if (k === 'counter_defense') { buffDef += Math.floor(baseDef * 0.25); buffMdef += Math.floor(baseMdef * 0.25); }
    else if (k === 'counter_spirit') { buffAtkMult += 0.10; buffMatk += Math.floor(baseMatk * 0.10); buffSpd += 10; }
    else if (k === 'chance_critical') { buffCrit += Number(b.amount) || 35; buffCritDmg += 0.10; }
    else if (k === 'heroic_valor') { buffAtk += 250; buffMatk += 300; buffDef += 500; }
    else if (k === 'heroic_miracle') { buffDef += 5400; buffMdef += 4050; }
    else if (k === 'heroic_berserker') { buffSpd += 50; }
    else if (k === 'clan_hall_eva_blessing') { mpRegenBonus += 0.20; }
    else if (k === 'clan_hall_paagrio_protection') { buffDef += Math.floor(baseDef * 0.12); buffMdef += Math.floor(baseMdef * 0.12); }
    else if (k === 'clan_hall_shilen_harmony') { xpBoost += 0.15; goldBoost += 0.10; }
    else if (k === 'clan_hall_royal_teleport') { buffSpd += 10; }
  }

  // Process Active Elixirs from Alchemy System
  let elixirHpMult = 0;
  const elixirSources = { ...(state.activeElixirs || {}) };
  if (state.buffs && typeof state.buffs === 'object') {
    for (const [k, b] of Object.entries(state.buffs)) {
      if (b && (b.isElixir || k.startsWith('elixir_')) && typeof b.until === 'number') {
        elixirSources[k] = Math.max(elixirSources[k] || 0, b.until);
      }
    }
  }

  for (const [eId, expiry] of Object.entries(elixirSources)) {
    if (typeof expiry === 'number' && expiry > now) {
      if (eId === 'elixir_berserker') { buffAtkMult += 0.15; buffSpd += 10; }
      else if (eId === 'elixir_arcanist') { buffMatk += Math.floor(baseMatk * 0.20); mpRegenBonus += 0.50; }
      else if (eId === 'elixir_fortune') { luckBoost += 0.25; goldBoost += 0.30; }
      else if (eId === 'elixir_titan') { buffDef += Math.floor(baseDef * 0.20); elixirHpMult += 0.25; }
      else if (eId === 'elixir_transcendence') { xpBoost += 0.20; }
    }
  }

  // Process Astral Mastery Bonuses
  const astralB = getAstralMasteryBonuses(state);
  buffAtkMult += astralB.patkMult;
  buffMatk += Math.floor(baseMatk * astralB.matkMult);
  buffDef += Math.floor(baseDef * astralB.defMult);
  elixirHpMult += astralB.hpMult;
  mpRegenBonus += astralB.mpRegen;
  goldBoost += astralB.goldBoost;
  luckBoost += astralB.luckBoost;
  xpBoost += astralB.xpBoost;
  buffSpd += astralB.speed;

  // Process Legacy Passives (Herança de Classes Passadas - 25% Eficácia da Linhagem)
  let legacyCrit = 0;
  if (state.legacyPassives && typeof state.legacyPassives === 'object') {
    for (const p of Object.values(state.legacyPassives)) {
      if (!p || !p.val) continue;
      const v = Number(p.val) || 0;
      if (p.stat === 'patk' || p.stat === 'atk') buffAtkMult += v;
      else if (p.stat === 'pdef' || p.stat === 'def') buffDef += Math.floor(baseDef * v);
      else if (p.stat === 'matk') buffMatk += Math.floor(baseMatk * v);
      else if (p.stat === 'mdef') buffMdef += Math.floor(baseMdef * v);
      else if (p.stat === 'maxHp' || p.stat === 'hp') elixirHpMult += v;
      else if (p.stat === 'maxMp' || p.stat === 'mp') buffMp += Math.floor(baseMp * v);
      else if (p.stat === 'mpRegen') mpRegenBonus += v;
      else if (p.stat === 'speed') buffSpd += Math.floor(v * 50);
      else if (p.stat === 'crit') legacyCrit += Math.floor(v * 50);
      else if (p.stat === 'eva') baseEva += Math.floor(v * 20);
    }
  }

  // Process Active Pet Bonus (Companheiros de Batalha)
  const petBonus = PetService.getActivePetBonus(state);
  if (petBonus) {
    if (petBonus.stat === 'patkMult') buffAtkMult += petBonus.val;
    else if (petBonus.stat === 'matkMult') buffMatk += Math.floor(baseMatk * petBonus.val);
    else if (petBonus.stat === 'hpMult') elixirHpMult += petBonus.val;
    else if (petBonus.stat === 'speedBoost') buffSpd += Math.floor(petBonus.val * 100);
  }

  const agathionUid = state.equipment?.agathion;
  const agathionItem = agathionUid ? state.inventory?.find(i => i.uid === agathionUid) : null;
  const agathionDef = agathionItem ? D()?.ALL_ITEMS?.[agathionItem.itemId] : null;

  if (agathionDef) {
    if (agathionItem.itemId === 'agathion_pegasus') { xpBoost += 0.10; buffSpd += 10; }
    else if (agathionItem.itemId === 'agathion_valakas_mini') { buffAtk += Math.floor(baseAtk * 0.15); buffMatk += Math.floor(baseMatk * 0.15); }
    else if (agathionItem.itemId === 'agathion_rudolph') { goldBoost += 0.20; }
    else if (agathionItem.itemId === 'agathion_angel') { buffDef += Math.floor(baseDef * 0.20); }
    else if (agathionItem.itemId === 'agathion_dragon_child') { buffAtkMult += 0.25; }
  }

  // Add equipment and armor set bonus multipliers
  xpBoost += (Number(eb.xpBoost) || 0) + (Number(setB.xpBoost) || 0);
  goldBoost += (Number(eb.goldBoost || eb.adenaBoost) || 0) + (Number(setB.goldBoost || setB.adenaBoost) || 0);

  // Referral Bonus (+10% EXP permanente para aventureiros indicados por um amigo)
  if (state.referredBy) {
    xpBoost += 0.10;
  }

  // Process Clan Skills Bonuses
  if (state.clan && state.clan.level) {
    const clanLvl = state.clan.level;
    if (clanLvl >= 1) { elixirHpMult += 0.10; } // Clan Imperium (+10% HP)
    if (clanLvl >= 2) { buffAtkMult += 0.08; } // Clan Might (+8% P.Atk)
    if (clanLvl >= 3) { buffDef += Math.floor(baseDef * 0.10); } // Clan Shield (+10% P.Def)
    if (clanLvl >= 4) { buffMatk += Math.floor(baseMatk * 0.10); buffMdef += Math.floor(baseMdef * 0.12); } // Clan Empower & Magic Barrier
    if (clanLvl >= 5) { mpRegenBonus += 0.20; buffSpd += 5; } // Clan Vitality (+20% Regen, +5 Spd)
  }

  // Process Weapon Augmentation Stats (Weapon 1 and Weapon 2)
  let augCrit = 0;
  for (const wpnKey of ['weapon', 'weapon2']) {
    const wpnUid = state.equipment?.[wpnKey];
    const equippedWeaponItem = wpnUid ? (state.inventory?.find(i => i.uid === wpnUid) || wpnUid) : null;
    const weaponAug = (equippedWeaponItem && typeof equippedWeaponItem === 'object') ? equippedWeaponItem.augmentation : null;
    if (weaponAug) {
      const aAtk = weaponAug.atkBonus || weaponAug.stats?.atk || 0;
      const aMatk = weaponAug.matkBonus || weaponAug.stats?.matk || 0;
      const aDef = weaponAug.defBonus || weaponAug.stats?.def || 0;
      const aMdef = weaponAug.mdefBonus || weaponAug.stats?.mdef || 0;
      const aCrit = weaponAug.critBonus || weaponAug.stats?.crit || 0;
      const aEva = weaponAug.evaBonus || weaponAug.stats?.eva || 0;
      const aHp = weaponAug.hpBonus || weaponAug.stats?.hp || 0;
      if (aAtk) buffAtk += aAtk;
      if (aMatk) buffMatk += aMatk;
      if (aDef) buffDef += aDef;
      if (aMdef) buffMdef += aMdef;
      if (aCrit) augCrit += aCrit;
      if (aEva) baseEva += aEva;
      if (aHp) elixirHpMult += (aHp / 2000);
    }
  }

  // Process Fortress & Talisman Bonuses
  if (state.fortresses) {
    const fBonuses = FortressService.getBonuses(state);
    buffAtkMult += fBonuses.pAtkMult;
    buffMatk += Math.floor(baseMatk * fBonuses.mAtkMult);
    buffDef += Math.floor(baseDef * fBonuses.pDefMult);
    buffMdef += Math.floor(baseMdef * fBonuses.mDefMult);
    elixirHpMult += fBonuses.hpMult;
    mpRegenBonus += fBonuses.mpRegen;
    buffSpd += fBonuses.speed;
    baseEva += fBonuses.eva;
    augCrit += fBonuses.crit;
  }

  // Process Full Heirloom Sovereign Set Bonus (Pack Tier 3 Multi-Piece)
  let heirloomPiecesEquipped = 0;
  if (state.equipment) {
    const allSlots = ['weapon', 'weapon2', 'armor', 'legs', 'helmet', 'gloves', 'boots', 'shield', 'necklace', 'earring1', 'earring2', 'ring1', 'ring2', 'cloak', 'belt', 'hair'];
    for (const slotKey of allSlots) {
      const uid = state.equipment[slotKey];
      if (!uid) continue;
      const invItem = state.inventory?.find(i => i.uid === uid);
      if (!invItem) continue;
      const def = D()?.ALL_ITEMS?.[invItem.itemId];
      if (invItem.isHeirloom || def?.isHeirloom || invItem.itemId?.includes('heirloom')) {
        heirloomPiecesEquipped++;
      }
    }
  }

  // 8+ Peças de Herança (Armadura + Arma + Joias/Acessórios): +20% XP, +20% Adena, +10% Stats
  if (heirloomPiecesEquipped >= 8) {
    xpBoost += 0.20;
    goldBoost += 0.20;
    buffAtkMult += 0.10;
    buffDef += Math.floor(baseDef * 0.10);
    buffMatk += Math.floor(baseMatk * 0.10);
    buffMdef += Math.floor(baseMdef * 0.10);
    buffSpd += 15;
  }

  // 12+ Peças de Herança (Conjunto Completo do Lorde Soberano): +15% XP extra (+35% total), +15% Adena extra, +25% HP
  if (heirloomPiecesEquipped >= 12) {
    xpBoost += 0.15;
    goldBoost += 0.15;
    buffAtkMult += 0.10;
    buffDef += Math.floor(baseDef * 0.10);
    buffMatk += Math.floor(baseMatk * 0.10);
    buffMdef += Math.floor(baseMdef * 0.10);
    buffSpd += 10;
    elixirHpMult += 0.25;
  }

  // Process Dual Weapon Resonance Passive Stats (Ressonância de Armas Ativa)
  let resonanceLifeDrain = 0;
  let resonanceCrit = 0;
  let resPassives = null;
  try {
    resPassives = WeaponResonanceService?.getPassiveStats ? WeaponResonanceService.getPassiveStats(state) : null;
    if (resPassives) {
      if (resPassives.critChance) resonanceCrit += resPassives.critChance * 10;
      if (resPassives.eva) baseEva += resPassives.eva;
      if (resPassives.atkSpd) buffSpd += resPassives.atkSpd;
      if (resPassives.castSpd) buffSpd += Math.floor(resPassives.castSpd * 0.5);
      if (resPassives.critDmgPct) buffCritDmg += resPassives.critDmgPct / 100;
      if (resPassives.lifeDrain) resonanceLifeDrain += resPassives.lifeDrain / 100;
    }
  } catch (e) {
    console.warn('WeaponResonanceService error:', e);
  }

  // Process Masterwork & Belt Bonuses on Equipped Items
  if (state.equipment && typeof state.equipment === 'object') {
    const processedEquipUids = new Set();
    for (const [slot, eqVal] of Object.entries(state.equipment)) {
      if (!eqVal) continue;
      const item = (typeof eqVal === 'object') ? eqVal : state.inventory?.find(i => i.uid === eqVal || i.id === eqVal);
      if (!item) continue;
      const itemKey = item.uid || item.id || eqVal;
      if (processedEquipUids.has(itemKey)) continue;
      processedEquipUids.add(itemKey);

      if (item.isMasterwork && item.masterworkBonus) {
        buffSpd += (item.masterworkBonus.atkSpdPct || 0) * 100;
        if (item.masterworkBonus.hpBonus) elixirHpMult += ((item.masterworkBonus.hpBonus || 0) / 2000);
        mpRegenBonus += (item.masterworkBonus.mpRegenPct || 0);
      }

      if ((slot === 'belt' || item.beltBonuses) && item.beltBonuses) {
        elixirHpMult += (item.beltBonuses.hpBonusPct || 0);
        buffDef += (item.beltBonuses.pDefBonus || 0);
      }

      // 16.1 Synthesis Rank (Fusão de Duplicatas na Forja: Rank 1 a 5, +10% stats base por rank)
      const synthRank = Number(item.synthesisRank || item.compoundRank) || 0;
      if (synthRank > 0) {
        const synthMult = synthRank * 0.10;
        if (slot === 'weapon' || slot === 'weapon2') {
          buffAtkMult += synthMult;
          buffMatk += Math.floor(baseMatk * synthMult);
        } else if (['armor', 'chest', 'legs', 'head', 'helmet', 'gloves', 'boots', 'shield'].includes(slot)) {
          buffDef += Math.floor(baseDef * synthMult);
          buffMdef += Math.floor(baseMdef * synthMult);
        } else {
          elixirHpMult += (synthMult * 0.5);
          buffDef += Math.floor(baseDef * (synthMult * 0.5));
        }
      }
    }
  }

  let atkMult = 1 + buffAtkMult;
  const defMult = 1 + sk('heavyArmor') * 0.05;
  const cdr = sk('quickRecycle') * 0.10;

  const codexB = getCodexBonuses(state);
  // Process Soul Crystal (SA) Bonus on Both Equipped Weapons (Dual Arsenal)
  let saCrit = 0, saPatkMult = 0, saMatkMult = 0, saSpeed = 0, saHpMult = 0;
  for (const wpnKey of ['weapon', 'weapon2']) {
    const wpnUid = state.equipment?.[wpnKey];
    const socket = (wpnUid && state.weaponSockets) ? state.weaponSockets[wpnUid] : null;
    if (socket) {
      const stage = Math.min(13, Math.max(1, socket.stage || 1));
      const mult = 1 + (stage - 1) * 0.15;
      if (socket.effect === 'focus') saCrit += Math.floor(15 * mult);
      else if (socket.effect === 'haste') buffSpd += Math.floor(12 * mult);
      else if (socket.effect === 'acumen') buffMatk += Math.floor(baseMatk * 0.15 * mult);
      else if (socket.effect === 'health') elixirHpMult += (0.15 * mult);
      else if (socket.effect === 'might') buffAtkMult += (0.10 * mult);
      else if (socket.effect === 'empower') buffMatk += Math.floor(baseMatk * 0.12 * mult);
    }

    const equippedWeaponItem = wpnUid ? (state.inventory?.find(i => i.uid === wpnUid) || wpnUid) : null;
    const itemSa = (equippedWeaponItem && typeof equippedWeaponItem === 'object') ? equippedWeaponItem.soulCrystal : null;
    if (itemSa) {
      if (itemSa.stat === 'crit' || itemSa.key === 'focus') saCrit += (itemSa.val || 0);
      else if (itemSa.stat === 'patk' || itemSa.key === 'might') buffAtkMult += (typeof itemSa.val === 'number' && itemSa.val < 1 ? itemSa.val : (itemSa.val || 0) / 100);
      else if (itemSa.stat === 'castSpd' || itemSa.key === 'acumen') buffSpd += Math.floor((itemSa.val || 0) * 50);
      else if (itemSa.stat === 'hp' || itemSa.key === 'health') elixirHpMult += (typeof itemSa.val === 'number' && itemSa.val < 1 ? itemSa.val : (itemSa.val || 0) / 100);
      else if (itemSa.stat === 'matk' || itemSa.key === 'empower') buffMatk += Math.floor(baseMatk * (typeof itemSa.val === 'number' && itemSa.val < 1 ? itemSa.val : (itemSa.val || 0) / 100));
      else if (itemSa.stat === 'accuracy' || itemSa.key === 'guidance') baseEva += (itemSa.val || 0);
    }
  }

  // Process Tattoos / Dyes Bonuses via DyeService with +5 net cap
  const netDyes = DyeService.calculateNetDyeBonuses(state);
  const tatStr = netDyes.str || 0;
  const tatDex = netDyes.dex || 0;
  const tatCon = netDyes.con || 0;
  const tatInt = netDyes.int || 0;
  const tatWit = netDyes.wit || 0;
  const tatMen = netDyes.men || 0;

  // Calculate consolidated primary attributes (Base Race + Tattoos/Dyes + Equipment + Set Bonuses)
  const baseAttrs = getBaseAttributes(state.race, state.class);
  const primaryStats = {
    str: (baseAttrs.str || 0) + (setRes.primaryStats?.str || 0) + (Number(eb.str) || 0) + tatStr,
    dex: (baseAttrs.dex || 0) + (setRes.primaryStats?.dex || 0) + (Number(eb.dex) || 0) + tatDex,
    con: (baseAttrs.con || 0) + (setRes.primaryStats?.con || 0) + (Number(eb.con) || 0) + tatCon,
    int: (baseAttrs.int || 0) + (setRes.primaryStats?.int || 0) + (Number(eb.int) || 0) + tatInt,
    wit: (baseAttrs.wit || 0) + (setRes.primaryStats?.wit || 0) + (Number(eb.wit) || 0) + tatWit,
    men: (baseAttrs.men || 0) + (setRes.primaryStats?.men || 0) + (Number(eb.men) || 0) + tatMen
  };
  state.primaryStats = primaryStats;

  // Process Set Enchantment Bonuses (+4 to +10)
  let minSetEnchant = 999;
  let setPiecesCount = 0;
  const armorSlots = ['helmet', 'armor', 'legs', 'gloves', 'boots'];
  for (const s of armorSlots) {
    const uid = state.equipment?.[s] || (s === 'helmet' ? state.equipment?.head : (s === 'armor' ? state.equipment?.chest : null));
    if (uid) {
      const it = state.inventory?.find(i => i.uid === uid);
      if (it) {
        setPiecesCount++;
        minSetEnchant = Math.min(minSetEnchant, it.enchant || 0);
      } else {
        minSetEnchant = 0;
      }
    } else {
      minSetEnchant = 0;
    }
  }

  let setEnchantHp = 0;
  if (setPiecesCount >= 4 && minSetEnchant >= 4) {
    const enc = Math.min(10, minSetEnchant);
    if (enc >= 4) { buffDef += 15; baseEva += 1; }
    if (enc >= 5) { buffDef += 25; }
    if (enc >= 6) { buffDef += 40; baseEva += 2; }
    if (enc >= 7) { buffDef += 60; buffAtkMult += 0.05; }
    if (enc >= 8) { buffDef += 90; saCrit += 15; }
    if (enc >= 9) { buffDef += 120; saCrit += 20; }
    if (enc >= 10) { buffDef += 160; buffAtkMult += 0.10; saCrit += 25; }
    setEnchantHp = enc * 50;
  }

  const dollsB = getDollsBonuses(state);
  const certB  = getCertificationsBonuses(state);
  const towerMult = 1 + ((state.tower?.highestFloor || 0) * 0.01);

  const certAtkMult  = 1 + (certB.pAtkPercent || 0);
  const certDefMult  = 1 + (certB.pDefPercent || 0);
  const certMatkMult = 1 + (certB.mAtkPercent || 0);
  const certMdefMult = 1 + (certB.mDefPercent || 0);
  const certHpMult   = 1 + (certB.hpPercent || 0);
  const certMpMult   = 1 + (certB.mpPercent || 0);

  const resAtkMult  = 1 + ((resPassives?.pAtkPct || 0) / 100);
  const resDefMult  = 1 + ((resPassives?.pDefPct || 0) / 100);
  const resMatkMult = 1 + ((resPassives?.mAtkPct || 0) / 100);
  const resMdefMult = 1 + ((resPassives?.mDefPct || 0) / 100);

  atkMult = 1 + buffAtkMult;
  const finalAtk  = Math.floor((baseAtk + (Number(eb.atk) || 0) + (Number(setB.atk) || 0) + buffAtk + codexB.atk + dollsB.atk + certB.atk) * atkMult * towerMult * certAtkMult * resAtkMult);
  const finalDef  = Math.floor((baseDef + (Number(eb.def) || 0) + (Number(setB.def) || 0) + buffDef + codexB.def + dollsB.def + certB.def) * defMult * towerMult * certDefMult * resDefMult);
  const finalEva  = Math.floor(baseEva + (Number(eb.eva) || 0) + (Number(setB.eva) || 0) + codexB.eva + dollsB.eva + (certB.evaAdd || 0));
  const finalMatk = Math.floor((baseMatk + (Number(eb.matk) || 0) + (Number(setB.matk) || 0) + buffMatk + codexB.matk + dollsB.matk + certB.matk) * towerMult * certMatkMult * resMatkMult);
  const finalMdef = Math.floor((baseMdef + (Number(eb.mdef) || 0) + (Number(setB.mdef) || 0) + buffMdef + codexB.mdef + dollsB.mdef + certB.mdef) * towerMult * certMdefMult * resMdefMult);
  const finalCrit = (Number(eb.crit) || 0) + (Number(setB.crit) || 0) + codexB.crit + dollsB.crit + certB.crit + astralB.crit + saCrit + augCrit + legacyCrit + buffCrit + resonanceCrit;

  const lootBonus  = (Number(race?.stats?.lootBonus) || 0) + (Number(cls?.base?.lootBonus) || 0) + itemLootBonus + luckBoost;
  const rawAtkSpd  = ((buffSpd + (dollsB.speed || 0)) / 100) + (certB.atkSpdPercent || 0);
  const lifeDrain  = ((Number(eb.lifesteal) || 0) + (dollsB.lifesteal || 0) + ((setB.lifesteal || 0) / 100)) + resonanceLifeDrain;
  const craftBonus = itemCraftBonus;

  const baseCritDmg = 1 + sk('executioner') * 0.15 + astralB.critDmg + buffCritDmg;
  const regenHp   = sk('holylight') * 0.01;
  const meteorLvl = sk('meteor');
  const execute   = sk('assassinate') * 0.02;
  const rawBlock  = sk('divineshield') * 0.05 + (setB.block || 0);

  // ═══════════════════════════════════════════════════════════════════════
  // COMBAT SOFT-CAPS & DIMINISHING RETURNS
  // ═══════════════════════════════════════════════════════════════════════
  // 1. Critical Rate: Cap em 500 (50.0% max chance).
  // Excesso converte em Dano Crítico Bônus (10 pontos de excesso = +1% Dano Crítico).
  const rawCrit = finalCrit;
  const effectiveCritRate = Math.min(50, rawCrit > 100 ? (rawCrit / 10) : rawCrit);
  const excessCrit = Math.max(0, (rawCrit > 100 ? rawCrit - 500 : (rawCrit > 50 ? (rawCrit - 50) * 10 : 0)));
  const critOverflowDmgBonus = Math.round((excessCrit / 10) * 0.01 * 1000) / 1000;
  const critDmg = Math.round((baseCritDmg + critOverflowDmgBonus) * 100) / 100;

  // 2. Esquiva & Bloqueio com Escudo: Cap em 80% (atacante tem sempre no mínimo 20% de acerto).
  const effectiveEvasion = Math.min(80, finalEva);
  const block = Math.min(80, rawBlock);

  // 3. Velocidade de Ataque: Retornos decrescentes suaves acima de 2.0x
  const atkSpd = rawAtkSpd > 2.0 ? (2.0 + Math.log10(1 + (rawAtkSpd - 2.0) * 0.5)) : rawAtkSpd;

  const maxHp = Math.floor((100 + state.level * 10 + (sk('boostHp') + sk('boost_hp') + sk('vital_force')) * 60 + (Number(eb.hp) || 0) + (Number(setB.hp) || 0) + codexB.hp + dollsB.hp + setEnchantHp) * (1 + elixirHpMult) * certHpMult);
  const maxMp = Math.floor((50 + state.level * 5 + (sk('boostMana') + sk('boost_mp') + sk('higher_mana')) * 30 + (Number(eb.mp) || 0) + (Number(setB.mp) || 0) + codexB.mp + dollsB.mp) * certMpMult);

  const rawStats = {
    atk: finalAtk || 1, def: finalDef || 0, eva: effectiveEvasion || 0, matk: finalMatk || 1, mdef: finalMdef || 0,
    crit: effectiveCritRate, rawCrit, critOverflowDmgBonus, critDmg, loot: 1 + lootBonus, speed: 1 + (buffSpd + (setB.speed || 0)) / 100 + (certB.speedPercent || 0), cdr,
    atkSpd, lifeDrain, craftBonus, mpRegen: mpRegenBonus,
    xpBoost, goldBoost, luckBoost, autoPotion, maxHp, maxMp,
    regenHp, meteorLvl, execute, block,
    celestial: certB.celestial, hasteProc: certB.hasteProc, defenceProc: certB.defenceProc, spiritProc: certB.spiritProc, critProc: certB.critProc
  };

  const finalStats = applyPrimaryStats(rawStats, primaryStats);
  finalStats.combatPower = CombatPowerService.calculateCombatPower({ ...state, stats: finalStats });
  return finalStats;
}

/**
 * Classifica o nível da zona para determinação do tier de drops de itens.
 * @param {number} zoneLevel
 * @returns {string} ('zone1'..'zone6')
 */
export function getZoneDropTier(zoneLevel) {
  if (zoneLevel < 20) return 'zone1'; // No Grade (Lv 1-19)
  if (zoneLevel < 40) return 'zone2'; // D Grade (Lv 20-39)
  if (zoneLevel < 52) return 'zone3'; // C Grade (Lv 40-51)
  if (zoneLevel < 62) return 'zone4'; // B Grade (Lv 52-61)
  if (zoneLevel < 76) return 'zone5'; // A Grade (Lv 62-75)
  if (zoneLevel < 85) return 'zone6'; // S Grade (Lv 76-84)
  return 'zone7'; // Special / Boss / Frost Lord (Lv 85+)
}
