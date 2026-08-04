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
 * Retorna o bônus individual de um slot de equipamento, aplicando multiplicadores de raridade,
 * encantamento, refinamento foundation e afixos de itens.
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
  const def = gData?.ALL_ITEMS?.[inv.itemId];
  if (!def) return null;

  const rarityMult = inv.rarity ? (gData?.RARITY?.[inv.rarity]?.mult || 1) : 1;
  const enchant = inv.enchant || 0;
  const enchantMult = 1 + (enchant <= 3 ? enchant * 0.3 : (0.36 + (enchant - 3) * 0.5));
  const foundationMult = inv.foundation ? 1.3 : 1;

  const out = { ...def };
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
  return {
    atk: (certs.emergent_atk || 0) * 20,
    def: (certs.emergent_def || 0) * 20,
    matk: (certs.emergent_matk || 0) * 25,
    mdef: (certs.emergent_mdef || 0) * 25,
    crit: (certs.master_crit || 0) * 5,
    celestial: certs.celestial_shield ? true : false
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

  let baseAtk  = (Number(state.base?.atk)  || 0) + (Number(raceStats.atk)  || 0) + (Number(clsBase.atk)  || 0) + (state.level * 3) + 15;
  let baseDef  = (Number(state.base?.def)  || 0) + (Number(raceStats.def)  || 0) + (Number(clsBase.def)  || 0) + (state.level * 2) + 10;
  let baseEva  = (Number(state.base?.eva)  || 0) + (Number(raceStats.eva)  || 0) + (Number(clsBase.eva)  || 0);
  let baseMatk = (Number(state.base?.matk) || 0) + (Number(raceStats.matk) || 0) + (Number(clsBase.matk) || 0) + (state.level * 3) + 15;
  let baseMdef = (Number(state.base?.mdef) || 0) + (Number(raceStats.mdef) || 0) + (Number(clsBase.mdef) || 0) + (state.level * 2) + 8;

  baseAtk  += sk('wpnMastF') * 4.5;
  baseAtk  += sk('weaponMastM') * 1.5;
  baseMatk += sk('weaponMastM') * 2.5;
  baseDef  += sk('armorMast') * 11;
  baseDef  += sk('robeMast') * 1.7;
  baseDef  += sk('lightArmor') * 4.2;
  baseEva  += sk('lightArmor') * 3;
  baseMdef += sk('antiMagic') * 18;
  const mpRegenBonus = sk('higherMana') * 2;

  const eb = getTotalEquipBonuses(state);
  const setRes = getActiveSetBonuses(state);
  const setB = setRes.statTotals;
  const primaryStats = setRes.primaryStats;

  state.primaryStats = primaryStats;

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
  let buffAtk = 0, buffDef = 0, buffSpd = 0, buffMatk = 0, buffAtkMult = 0;
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
  const dollsB = getDollsBonuses(state);
  const certB  = getCertificationsBonuses(state);
  const towerMult = 1 + ((state.tower?.highestFloor || 0) * 0.01);

  const finalAtk  = Math.floor((baseAtk + (Number(eb.atk) || 0) + (Number(setB.atk) || 0) + buffAtk + codexB.atk + dollsB.atk + certB.atk) * atkMult * towerMult);
  const finalDef  = Math.floor((baseDef + (Number(eb.def) || 0) + (Number(setB.def) || 0) + buffDef + codexB.def + dollsB.def + certB.def) * defMult * towerMult);
  const finalEva  = Math.floor(baseEva + (Number(eb.eva) || 0) + (Number(setB.eva) || 0) + codexB.eva + dollsB.eva);
  const finalMatk = Math.floor((baseMatk + (Number(eb.matk) || 0) + (Number(setB.matk) || 0) + buffMatk + codexB.matk + dollsB.matk + certB.matk) * towerMult);
  const finalMdef = Math.floor((baseMdef + (Number(eb.mdef) || 0) + (Number(setB.mdef) || 0) + buffMdef + codexB.mdef + dollsB.mdef + certB.mdef) * towerMult);
  const finalCrit = (Number(eb.crit) || 0) + (Number(setB.crit) || 0) + codexB.crit + dollsB.crit + certB.crit;

  const lootBonus  = (Number(race?.stats?.lootBonus) || 0) + (Number(cls?.base?.lootBonus) || 0) + itemLootBonus + luckBoost;
  const atkSpd     = (buffSpd + (dollsB.speed || 0)) / 100;
  const lifeDrain  = ((Number(eb.lifesteal) || 0) + (dollsB.lifesteal || 0) + ((setB.lifesteal || 0) / 100));
  const craftBonus = itemCraftBonus;

  const critDmg   = 1 + sk('executioner') * 0.15;
  const regenHp   = sk('holylight') * 0.01;
  const meteorLvl = sk('meteor');
  const execute   = sk('assassinate') * 0.02;
  const block     = sk('divineshield') * 0.05 + (setB.block || 0);

  const maxHp = Math.floor(100 + state.level * 10 + sk('boostHp') * 60 + (Number(eb.hp) || 0) + (Number(setB.hp) || 0) + codexB.hp + dollsB.hp);
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
  if (zoneLevel < 15) return 'zone1';
  if (zoneLevel < 35) return 'zone2';
  if (zoneLevel < 55) return 'zone3';
  if (zoneLevel < 75) return 'zone4';
  if (zoneLevel < 90) return 'zone5';
  return 'zone6';
}
