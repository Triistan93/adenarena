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
  const classes = (typeof window !== 'undefined' && window.EchoData) ? window.EchoData.CLASSES_ECHO : CLASSES;
  let def = classes[classId] || classes[String(classId).toLowerCase()] || null;
  if (!def) return null;

  if (def.archetype === undefined && def.parent) {
    let current = def.parent;
    const visited = new Set([classId]);
    while (current && !visited.has(current)) {
      visited.add(current);
      const parentDef = classes[current] || classes[String(current).toLowerCase()];
      if (!parentDef) break;
      if (parentDef.archetype !== undefined) {
        return { ...def, archetype: parentDef.archetype };
      }
      current = parentDef.parent;
    }
  }
  return def;
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
  const isMage = c?.archetype === 'mage';

  let key = 'human_fighter';
  if (r === 'darkelf') key = isMage ? 'darkelf_mage' : 'darkelf_fighter';
  else if (r === 'elf') key = isMage ? 'elf_mage' : 'elf_fighter';
  else if (r === 'orc') key = isMage ? 'orc_mage' : 'orc_fighter';
  else if (r === 'dwarf') key = 'dwarf_fighter';
  else if (r === 'kamael') key = 'kamael_male';
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
  const def = gData?.ALL_ITEMS?.[inv.itemId] || (typeof window !== 'undefined' && window.ALL_ITEMS?.[inv.itemId]);
  if (!def) return null;

  const rarityMult = inv.rarity ? (gData?.RARITY?.[inv.rarity]?.mult || 1) : 1;
  const enchant = inv.enchant || 0;
  const enchantMult = 1 + (enchant <= 3 ? enchant * 0.3 : (0.36 + (enchant - 3) * 0.5));
  const foundationMult = inv.foundation ? 1.3 : 1;

  let out = { ...def };
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
  const totals = { atk: 0, def: 0, matk: 0, mdef: 0, hp: 0, mp: 0, eva: 0, crit: 0, speed: 0, lifesteal: 0 };
  if (!state.equipment) return totals;
  for (const slot of Object.keys(state.equipment)) {
    const b = getEquipBonus(state, slot);
    if (!b) continue;
    for (const k of Object.keys(totals)) {
      if (b[k] !== undefined && b[k] !== null) totals[k] += Number(b[k]) || 0;
    }
  }
  return totals;
}

/**
 * Retorna os bônus concedidos por certificações de subclass.
 * @param {Object} state
 * @returns {Object}
 */
export function getCertificationsBonuses(state) {
  const certs = state.certifications || {};
  let atk = (certs.emergent_atk || 0) * 20;
  let def = (certs.emergent_def || 0) * 20;
  let matk = (certs.emergent_matk || 0) * 25;
  let mdef = (certs.emergent_mdef || 0) * 25;
  let crit = (certs.master_crit || 0) * 5;
  let celestial = certs.celestial_shield ? true : false;
  let hpPercent = 0;
  let mpPercent = 0;
  let evaAdd = 0;

  // MasterWork Emergent Passives from all subclasses
  (state.subclasses || []).forEach(sub => {
    if (sub.level >= 50) { atk += 18; matk += 12; def += 18; mdef += 15; crit += 7; }
    if (sub.level >= 60) { atk += 18; matk += 12; def += 18; mdef += 15; crit += 7; }
    if (sub.level >= 75) { atk += 27; matk += 18; def += 27; mdef += 23; crit += 11; }
  });

  // Master Abilities
  const masterAbilities = state.masterAbilities || [];
  if (masterAbilities.includes('boostHp')) hpPercent += 0.08;
  if (masterAbilities.includes('boostMp')) mpPercent += 0.12;
  if (masterAbilities.includes('evasion')) evaAdd += 5;
  if (masterAbilities.includes('barrier')) celestial = true;

  // Active Divine Transformations
  const trans = state.activeTransformation;
  if (trans === 'divineWarrior') { atk += Math.floor(atk * 0.25); }
  if (trans === 'divineKnight') { def += Math.floor(def * 0.50); mdef += Math.floor(mdef * 0.50); }
  if (trans === 'divineRogue') { crit += 40; evaAdd += 6; }
  if (trans === 'divineWizard') { matk += Math.floor(matk * 0.30); }
  if (trans === 'divineSummoner') { hpPercent += 0.20; }
  if (trans === 'divineHealer') { mdef += Math.floor(mdef * 0.25); }
  if (trans === 'divineEnchanter') { atk += Math.floor(atk * 0.15); matk += Math.floor(matk * 0.15); }

  return { atk, def, matk, mdef, crit, celestial, hpPercent, mpPercent, evaAdd };
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
    const uid = state.equipment?.[slot];
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
  const statTotals = { atk: 0, def: 0, matk: 0, mdef: 0, hp: 0, mp: 0, eva: 0, crit: 0, speed: 0, lifesteal: 0, block: 0 };

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
 * Calcula todos os atributos atuais do personagem (stats consolidados).
 * @param {Object} state — Estado do jogo
 * @returns {Object} Objeto com todos os atributos calculados
 */
export function getStats(state) {
  const rData = (typeof window !== 'undefined' && window.EchoData) ? window.EchoData.RACES_ECHO : RACES;
  const raceKey = state.race ? String(state.race).toLowerCase() : 'human';
  const race = rData?.[raceKey] || rData?.human;
  const cls = getClass(state.class);
  const skills = state.skills || {};

  const sk = (id) => Number(skills[id]) || 0;

  const raceStats = race?.stats || {};
  const clsBase = cls?.base || {};

  const lvl = Number(state?.level) || 1;
  let baseAtk  = (Number(state?.base?.atk)  || 0) + (Number(raceStats.atk)  || 0) + (Number(clsBase.atk)  || 0) + (lvl * 3) + 15;
  let baseDef  = (Number(state?.base?.def)  || 0) + (Number(raceStats.def)  || 0) + (Number(clsBase.def)  || 0) + (lvl * 2) + 10;
  let baseEva  = (Number(state?.base?.eva)  || 0) + (Number(raceStats.eva)  || 0) + (Number(clsBase.eva)  || 0);
  let baseMatk = (Number(state?.base?.matk) || 0) + (Number(raceStats.matk) || 0) + (Number(clsBase.matk) || 0) + (lvl * 3) + 15;
  let baseMdef = (Number(state?.base?.mdef) || 0) + (Number(raceStats.mdef) || 0) + (Number(clsBase.mdef) || 0) + (lvl * 2) + 8;

  baseAtk  += sk('wpnMastF') * 4.5;
  baseAtk  += sk('weaponMastM') * 1.5;
  baseMatk += sk('weaponMastM') * 2.5;
  baseDef  += sk('armorMast') * 11;
  baseDef  += sk('robeMast') * 1.7;
  baseDef  += sk('lightArmor') * 4.2;
  baseEva  += sk('lightArmor') * 3;
  baseMdef += sk('antiMagic') * 18;
  let mpRegenBonus = sk('higherMana') * 2;

  const eb = getTotalEquipBonuses(state);
  const setRes = getActiveSetBonuses(state);
  const setB = setRes.statTotals;

  let itemCraftBonus = 0, itemLootBonus = 0;
  if (state.equipment) {
    for (const slot of Object.keys(state.equipment)) {
      const it = getEquipBonus(state, slot);
      if (!it) continue;
      if (it.craftBonus) itemCraftBonus += Number(it.craftBonus) || 0;
      if (it.lootBonus) itemLootBonus += Number(it.lootBonus) || 0;
    }
  }

  const now = Date.now();
  let buffAtk = 0, buffDef = 0, buffSpd = 0, buffMatk = 0, buffMdef = 0, buffAtkMult = 0;

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
  }

  // Process Active Elixirs from Alchemy System
  let elixirHpMult = 0;
  if (state.activeElixirs && typeof state.activeElixirs === 'object') {
    for (const [eId, expiry] of Object.entries(state.activeElixirs)) {
      if (typeof expiry === 'number' && expiry > now) {
        if (eId === 'elixir_berserker') { buffAtkMult += 0.15; buffSpd += 10; }
        else if (eId === 'elixir_arcanist') { buffMatk += Math.floor(baseMatk * 0.20); mpRegenBonus += 0.50; }
        else if (eId === 'elixir_fortune') { luckBoost += 0.25; goldBoost += 0.30; }
        else if (eId === 'elixir_titan') { buffDef += Math.floor(baseDef * 0.20); elixirHpMult += 0.25; }
      }
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

  // Process Legacy Passives (Herança de Classes Passadas - 20% Eficácia)
  let legacyCrit = 0;
  if (state.legacyPassives && typeof state.legacyPassives === 'object') {
    for (const p of Object.values(state.legacyPassives)) {
      if (!p || !p.val) continue;
      const v = Number(p.val) || 0;
      if (p.stat === 'patk' || p.stat === 'atk') buffAtkMult += v;
      else if (p.stat === 'pdef' || p.stat === 'def') buffDef += Math.floor(baseDef * v);
      else if (p.stat === 'matk') buffMatk += Math.floor(baseMatk * v);
      else if (p.stat === 'speed') buffSpd += Math.floor(v * 50);
      else if (p.stat === 'crit') legacyCrit += Math.floor(v * 50);
    }
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

  const atkMult = 1 + buffAtkMult;
  const defMult = 1 + sk('heavyArmor') * 0.05;
  const cdr = sk('quickRecycle') * 0.10;

  const codexB = getCodexBonuses(state);
  // Process Soul Crystal (SA) Bonus on Equipped Weapon
  let saCrit = 0, saPatkMult = 0, saMatkMult = 0, saSpeed = 0, saHpMult = 0;
  const wpnUid = state.equipment?.weapon;
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

  // Process Tattoos / Dyes Bonuses
  let tatStr = 0, tatDex = 0, tatCon = 0, tatInt = 0, tatWit = 0, tatMen = 0;
  if (state.tattoos && Array.isArray(state.tattoos)) {
    for (const t of state.tattoos) {
      if (!t) continue;
      if (t.plusStat && t.minusStat) {
        if (t.plusStat === 'str') tatStr += (t.plusVal || 0);
        if (t.plusStat === 'dex') tatDex += (t.plusVal || 0);
        if (t.plusStat === 'con') tatCon += (t.plusVal || 0);
        if (t.plusStat === 'int') tatInt += (t.plusVal || 0);
        if (t.plusStat === 'wit') tatWit += (t.plusVal || 0);
        if (t.plusStat === 'men') tatMen += (t.plusVal || 0);

        if (t.minusStat === 'str') tatStr -= (t.minusVal || 0);
        if (t.minusStat === 'dex') tatDex -= (t.minusVal || 0);
        if (t.minusStat === 'con') tatCon -= (t.minusVal || 0);
        if (t.minusStat === 'int') tatInt -= (t.minusVal || 0);
        if (t.minusStat === 'wit') tatWit -= (t.minusVal || 0);
        if (t.minusStat === 'men') tatMen -= (t.minusVal || 0);
      }
    }
  }

  // Enforce maximum +5 stat increase cap
  tatStr = Math.min(5, tatStr);
  tatDex = Math.min(5, tatDex);
  tatCon = Math.min(5, tatCon);
  tatInt = Math.min(5, tatInt);
  tatWit = Math.min(5, tatWit);
  tatMen = Math.min(5, tatMen);

  if (tatStr > 0) buffAtkMult += tatStr * 0.015;
  if (tatDex > 0) { buffSpd += tatDex * 1.5; baseEva += tatDex; }
  if (tatCon > 0) elixirHpMult += tatCon * 0.03;
  if (tatInt > 0) buffMatk += Math.floor(baseMatk * tatInt * 0.02);
  if (tatWit > 0) buffMatk += Math.floor(baseMatk * tatWit * 0.025);
  if (tatMen > 0) buffMdef += Math.floor(baseMdef * tatMen * 0.02);

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
  const armorSlots = ['head', 'chest', 'legs', 'gloves', 'boots'];
  for (const s of armorSlots) {
    const uid = state.equipment?.[s];
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

  const finalAtk  = Math.floor((baseAtk + (Number(eb.atk) || 0) + (Number(setB.atk) || 0) + buffAtk + codexB.atk + dollsB.atk + certB.atk) * atkMult * towerMult);
  const finalDef  = Math.floor((baseDef + (Number(eb.def) || 0) + (Number(setB.def) || 0) + buffDef + codexB.def + dollsB.def + certB.def) * defMult * towerMult);
  const finalEva  = Math.floor(baseEva + (Number(eb.eva) || 0) + (Number(setB.eva) || 0) + codexB.eva + dollsB.eva);
  const finalMatk = Math.floor((baseMatk + (Number(eb.matk) || 0) + (Number(setB.matk) || 0) + buffMatk + codexB.matk + dollsB.matk + certB.matk) * towerMult);
  const finalMdef = Math.floor((baseMdef + (Number(eb.mdef) || 0) + (Number(setB.mdef) || 0) + buffMdef + codexB.mdef + dollsB.mdef + certB.mdef) * towerMult);
  const finalCrit = (Number(eb.crit) || 0) + (Number(setB.crit) || 0) + codexB.crit + dollsB.crit + certB.crit + astralB.crit + saCrit;

  const lootBonus  = (Number(race?.stats?.lootBonus) || 0) + (Number(cls?.base?.lootBonus) || 0) + itemLootBonus + luckBoost;
  const atkSpd     = (buffSpd + (dollsB.speed || 0)) / 100;
  const lifeDrain  = ((Number(eb.lifesteal) || 0) + (dollsB.lifesteal || 0) + ((setB.lifesteal || 0) / 100));
  const craftBonus = itemCraftBonus;

  const critDmg   = 1 + sk('executioner') * 0.15 + astralB.critDmg;
  const regenHp   = sk('holylight') * 0.01;
  const meteorLvl = sk('meteor');
  const execute   = sk('assassinate') * 0.02;
  const block     = sk('divineshield') * 0.05 + (setB.block || 0);

  const maxHp = Math.floor((100 + state.level * 10 + sk('boostHp') * 60 + (Number(eb.hp) || 0) + (Number(setB.hp) || 0) + codexB.hp + dollsB.hp + setEnchantHp) * (1 + elixirHpMult));
  const maxMp = Math.floor(50 + state.level * 5 + sk('boostMana') * 30 + (Number(eb.mp) || 0) + (Number(setB.mp) || 0) + codexB.mp + dollsB.mp);

  const rawStats = {
    atk: finalAtk || 1, def: finalDef || 0, eva: finalEva || 0, matk: finalMatk || 1, mdef: finalMdef || 0,
    crit: finalCrit, critDmg, loot: 1 + lootBonus, speed: 1 + (buffSpd + (setB.speed || 0)) / 100, cdr,
    atkSpd, lifeDrain, craftBonus, mpRegen: mpRegenBonus,
    xpBoost, goldBoost, luckBoost, autoPotion, maxHp, maxMp,
    regenHp, meteorLvl, execute, block
  };

  return applyPrimaryStats(rawStats, primaryStats);
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
