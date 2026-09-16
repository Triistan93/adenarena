/**
 * cpBalance.js — Sistema de Pesos de Combat Power e Classificação de Dificuldade.
 *
 * Garante determinismo matemático no cálculo de CP e fornece helpers para
 * avaliação de viabilidade e gates de acesso (minimumCP / recommendedCP).
 */

import { ALL_ITEMS } from '../items/index.js';
import { BRACELETS } from '../talismans.js';
import { CODEX_SETS } from '../codex.js';

export const CP_WEIGHTS = {
  levelMultiplier: 20,
  classTierMultiplier: 250,

  stats: {
    atk: 0.45,
    matk: 0.35,
    def: 0.40,
    mdef: 0.35,
    maxHp: 0.08,
    maxMp: 0.05,
    crit: 1.8,
    speed: 2.0,
    eva: 0.7
  },

  equipmentTierBase: {
    1: 60,    // No Grade (2 peças no spawn = 120 CP)
    2: 85,    // D Grade
    3: 200,   // C Grade
    4: 450,   // B Grade
    5: 1000,  // A Grade
    6: 2200   // S Grade / Frost Lord / Apex
  },

  specialBonuses: {
    soulCrystal: 300,
    augmentationStats: 350,
    augmentationSkill: 250,
    unsealed: 200,
    epicJewel: 1000,
    heroWeapon: 1500,
    skillEnchantLevel: 50,
    clanLevel: 150,
    clanCastle: 600,
    fortressOwned: 200,
    fortressTalisman: 150,
    noblesse: 500,
    hero: 1500,
    codexSet: 150,
    bossDoll: 200,
    sevenSigns: 150
  }
};

export const DIFFICULTY_TIERS = {
  LOCKED:       { id: 'locked',       name: 'Bloqueado',       color: '#94a3b8', badge: '🔒', desc: 'CP insuficiente para sobreviver.' },
  EXTREME:      { id: 'extreme',      name: 'Extremo',         color: '#ef4444', badge: '💀', desc: 'Combate punitivo com alta chance de derrota.' },
  CHALLENGING:  { id: 'challenging',  name: 'Desafiador',      color: '#f97316', badge: '⚔️', desc: 'Vitória possível com poções, buffs e estratégia.' },
  RECOMMENDED:  { id: 'recommended',  name: 'Recomendado',     color: '#22c55e', badge: '🎯', desc: 'Preparação ideal. Combate consistente e confortável.' },
  FAVORABLE:    { id: 'favorable',    name: 'Favorável',       color: '#38bdf8', badge: '⭐', desc: 'Poder superior. Pouco uso de consumíveis.' },
  OVERPOWERED:  { id: 'overpowered',  name: 'Dominado (Farm)', color: '#a855f7', badge: '👑', desc: 'Conteúdo dominado. Farm rápido e seguro.' }
};

/**
 * Avalia o nível relativo de dificuldade de um conteúdo com base no CP do jogador.
 * @param {number} playerCp - CP atual do personagem
 * @param {number} recommendedCp - CP ideal recomendado
 * @param {number} minimumCp - CP mínimo de entrada
 * @returns {{ id: string, name: string, color: string, badge: string, ratio: number, canEnter: boolean }}
 */
export function evaluateDifficulty(playerCp, recommendedCp, minimumCp) {
  const pCp = Math.max(0, Number(playerCp) || 0);
  const rCp = Math.max(1, Number(recommendedCp) || 1);
  const mCp = minimumCp !== undefined ? Math.max(0, Number(minimumCp) || 0) : Math.floor(rCp * 0.60);

  const canEnter = pCp >= mCp;
  const ratio = Math.round((pCp / rCp) * 100) / 100;

  if (!canEnter) {
    return { ...DIFFICULTY_TIERS.LOCKED, ratio, canEnter: false };
  }
  if (pCp < mCp * 1.10) {
    return { ...DIFFICULTY_TIERS.EXTREME, ratio, canEnter: true };
  }
  if (pCp < rCp * 0.90) {
    return { ...DIFFICULTY_TIERS.CHALLENGING, ratio, canEnter: true };
  }
  if (pCp <= rCp * 1.25) {
    return { ...DIFFICULTY_TIERS.RECOMMENDED, ratio, canEnter: true };
  }
  if (pCp <= rCp * 1.75) {
    return { ...DIFFICULTY_TIERS.FAVORABLE, ratio, canEnter: true };
  }
  return { ...DIFFICULTY_TIERS.OVERPOWERED, ratio, canEnter: true };
}

/**
 * Calcula o Combat Power matemático dos atributos de forma determinística.
 * @param {Object} statsOrState - Atributos ou objeto de estado
 * @returns {number}
 */
export function calculateCombatPower(statsOrState) {
  if (!statsOrState) return 0;
  const level = Number(statsOrState.level) || 1;
  const classTier = Number(statsOrState.classTier) || 0;
  const stats = statsOrState.stats || statsOrState;
  let cp = level * CP_WEIGHTS.levelMultiplier + classTier * CP_WEIGHTS.classTierMultiplier;
  const w = CP_WEIGHTS.stats;
  cp += (Number(stats.atk || stats.pAtk) || 0) * w.atk;
  cp += (Number(stats.matk || stats.mAtk) || 0) * w.matk;
  cp += (Number(stats.def || stats.pDef) || 0) * w.def;
  cp += (Number(stats.mdef || stats.mDef) || 0) * w.mdef;
  cp += (Number(stats.maxHp || stats.hp) || 0) * w.maxHp;
  cp += (Number(stats.maxMp || stats.mp) || 0) * w.maxMp;
  cp += (Number(stats.crit) || 0) * w.crit;
  cp += (Number(stats.speed) || 0) * w.speed;
  cp += (Number(stats.eva) || 0) * w.eva;
  return Math.round(cp);
}

/**
 * Calculates a detailed Combat Power breakdown with 15 discrete additive components.
 * Invariant: totalCp === sum of all component CPs (within ±1 from rounding).
 *
 * Component list (Section 65 of canonical spec):
 *   baseCp, equipmentCp, enchantCp, setBonusCp, jewelryCp, accessoryCp,
 *   agathionCp, beltCp, braceletCp, talismanCp, artifactCp, jewelBroochCp,
 *   passiveCp, skillCp, specialEffectCp
 *
 * @param {Object} state — Full player state
 * @returns {Object} Detailed CP breakdown with audit trail
 */
export function calculateDetailedCombatPower(state) {
  if (!state) return { totalCp: 0, components: {}, trail: [] };

  const trail = [];
  const level = Number(state.level) || 1;
  const classTier = Number(state.classTier) || 0;
  const stats = state.stats || {};

  // 1. BASE CP — Level & Class Tier
  const levelCp = level * CP_WEIGHTS.levelMultiplier;
  const tierCp = classTier * CP_WEIGHTS.classTierMultiplier;
  const w = CP_WEIGHTS.stats;

  // Stat-derived base CP (from finalStats, which already include equipment contributions)
  const statCp =
    (Number(stats.atk || stats.pAtk) || 0) * w.atk +
    (Number(stats.matk || stats.mAtk) || 0) * w.matk +
    (Number(stats.def || stats.pDef) || 0) * w.def +
    (Number(stats.mdef || stats.mDef) || 0) * w.mdef +
    (Number(stats.maxHp || stats.hp) || 0) * w.maxHp +
    (Number(stats.maxMp || stats.mp) || 0) * w.maxMp +
    (Number(stats.crit) || 0) * w.crit +
    (Number(stats.speed) || 0) * w.speed +
    (Number(stats.eva) || 0) * w.eva;

  const baseCp = Math.round(levelCp + tierCp + statCp);
  trail.push({ component: 'baseCp', source: 'Level + Tier + Stats', value: baseCp,
    detail: `Level(${level}×${CP_WEIGHTS.levelMultiplier}) + Tier(${classTier}×${CP_WEIGHTS.classTierMultiplier}) + Stats(${Math.round(statCp)})` });

  // 2-5. EQUIPMENT CP — Tier-based contribution per equipped item
  let equipmentCp = 0;
  let enchantCp = 0;
  let setBonusCp = 0;
  let jewelryCp = 0;
  let accessoryCp = 0;
  let beltCp = 0;
  let agathionCp = 0;

  if (state.equipment) {
    const armorSlots = ['armor', 'legs', 'helmet', 'gloves', 'boots', 'shield'];
    const weaponSlots = ['weapon'];
    const jewSlots = ['necklace', 'earring1', 'earring2', 'ring1', 'ring2'];
    const accSlots = ['cloak', 'hair'];
    const beltSlots = ['belt'];
    const agathionSlots = ['agathion'];

    const processSlot = (slot) => {
      const itemUid = state.equipment[slot];
      if (!itemUid) return;
      const invItem = state.inventory?.find(i => i.uid === itemUid || i.id === itemUid) || (typeof itemUid === 'object' ? itemUid : null);
      if (!invItem) return;
      const def = ALL_ITEMS?.[invItem.itemId || invItem.id] || invItem;
      const tier = Number(def.tier || invItem.tier) || 1;
      const tierBase = CP_WEIGHTS.equipmentTierBase[tier] || 60;

      // Enchant CP (separate from tier base)
      const enchant = Number(invItem.enchant || invItem.enchantLevel) || 0;
      let enchantContrib = 0;
      if (enchant > 0) {
        enchantContrib = Math.floor(tierBase * (Math.pow(enchant, 1.4) * 0.14));
      }

      // SA / Augment / Unsealed / Epic / Hero
      let specialCp = 0;
      if (invItem.sa || invItem.soulCrystal) specialCp += CP_WEIGHTS.specialBonuses.soulCrystal;
      if (invItem.augmentation?.stats) {
        specialCp += CP_WEIGHTS.specialBonuses.augmentationStats;
        if (invItem.augmentation.skill) specialCp += CP_WEIGHTS.specialBonuses.augmentationSkill;
      }
      if (invItem.isUnsealed) specialCp += CP_WEIGHTS.specialBonuses.unsealed;
      if (invItem.isEpic || def.isEpic || invItem.itemId?.includes('jewel_') || invItem.itemId?.includes('ring_queen_ant') ||
          invItem.itemId?.includes('valakas') || invItem.itemId?.includes('antharas') || invItem.itemId?.includes('baium')) {
        specialCp += CP_WEIGHTS.specialBonuses.epicJewel;
      }
      if (invItem.isHeroWeapon || def.isHeroWeapon || invItem.itemId?.startsWith('weapon_infinity_')) {
        specialCp += CP_WEIGHTS.specialBonuses.heroWeapon;
      }

      const totalItemContrib = tierBase + specialCp;

      // Classify into correct component
      if (jewSlots.includes(slot)) {
        jewelryCp += totalItemContrib;
      } else if (accSlots.includes(slot)) {
        accessoryCp += totalItemContrib;
      } else if (beltSlots.includes(slot)) {
        beltCp += totalItemContrib;
      } else if (agathionSlots.includes(slot)) {
        agathionCp += totalItemContrib;
      } else {
        equipmentCp += totalItemContrib;
      }
      enchantCp += enchantContrib;
    };

    for (const s of [...weaponSlots, ...armorSlots, ...jewSlots, ...accSlots, ...beltSlots, ...agathionSlots]) {
      processSlot(s);
    }
  }

  trail.push({ component: 'equipmentCp', source: 'Weapon + Armor tier base + specials', value: Math.floor(equipmentCp) });
  trail.push({ component: 'enchantCp', source: 'Enchant levels on all equipment', value: Math.floor(enchantCp) });
  trail.push({ component: 'setBonusCp', source: 'Armor set bonuses', value: Math.floor(setBonusCp) });
  trail.push({ component: 'jewelryCp', source: 'Necklace, earrings, rings', value: Math.floor(jewelryCp) });
  trail.push({ component: 'accessoryCp', source: 'Cloaks and Hair', value: Math.floor(accessoryCp) });
  trail.push({ component: 'agathionCp', source: 'Agathion bonuses', value: Math.floor(agathionCp) });
  trail.push({ component: 'beltCp', source: 'Belt bonuses', value: Math.floor(beltCp) });

  // 9. BRACELET CP
  let braceletCp = 0;
  if (state.fortresses?.equippedBracelet) {
    const bId = state.fortresses.equippedBracelet;
    const bDef = BRACELETS?.[bId];
    let bSlots = bDef?.slots || 0;
    if (!bSlots) {
      if (typeof bId === 'string') {
        if (bId.includes('dynasty')) bSlots = 5;
        else if (bId.includes('gold')) bSlots = 4;
        else if (bId.includes('silver') || bId.includes('mithril')) bSlots = 3;
        else if (bId.includes('bronze')) bSlots = 2;
        else if (bId.includes('steel')) bSlots = 1;
      }
    }
    braceletCp = (bSlots || 1) * 400;
  }
  trail.push({ component: 'braceletCp', source: 'Bracelet talisman slots', value: braceletCp });

  // 10. TALISMAN CP
  let talismanCp = 0;
  if (state.fortresses?.equippedTalismans && Array.isArray(state.fortresses.equippedTalismans)) {
    talismanCp = state.fortresses.equippedTalismans.length * CP_WEIGHTS.specialBonuses.fortressTalisman;
  }
  trail.push({ component: 'talismanCp', source: 'Equipped talismans', value: talismanCp });

  // 11. ARTIFACT CP (Codex + Dolls)
  let artifactCp = 0;
  if (state.codexUnlockedSets && Array.isArray(state.codexUnlockedSets)) {
    artifactCp += state.codexUnlockedSets.length * CP_WEIGHTS.specialBonuses.codexSet;
  }
  if (state.codex && typeof state.codex === 'object') {
    const codexSets = CODEX_SETS;
    if (codexSets) {
      for (const [sId, items] of Object.entries(state.codex)) {
        const sDef = codexSets[sId];
        if (sDef && Array.isArray(sDef.items) && sDef.items.every(i => items.includes(i))) {
          artifactCp += (CP_WEIGHTS.specialBonuses?.codexSet || 350);
        }
      }
    }
  }
  if (state.bossDolls && Array.isArray(state.bossDolls)) {
    artifactCp += state.bossDolls.length * CP_WEIGHTS.specialBonuses.bossDoll;
  }
  trail.push({ component: 'artifactCp', source: 'Codex sets + Boss dolls', value: artifactCp });

  // 12. JEWEL/BROOCH CP (Broche equipado + Joias de Broche engastadas)
  let jewelBroochCp = 0;
  if (state.equipment?.brooch) {
    jewelBroochCp += 300;
  }
  if (state.broochJewels && Array.isArray(state.broochJewels)) {
    for (const j of state.broochJewels) {
      const lvl = Number(j?.level || 1);
      jewelBroochCp += (lvl * 150);
    }
  }
  trail.push({ component: 'jewelBroochCp', source: 'Brooch and jewels', value: jewelBroochCp });

  // 13. PASSIVE CP (Clan, Noblesse, Hero, Fortress, Seven Signs)
  let passiveCp = 0;
  if (state.clan?.level) {
    passiveCp += state.clan.level * CP_WEIGHTS.specialBonuses.clanLevel;
    if (state.clan.castle) passiveCp += CP_WEIGHTS.specialBonuses.clanCastle;
  }
  if (state.fortresses?.owned && Array.isArray(state.fortresses.owned)) {
    passiveCp += state.fortresses.owned.length * CP_WEIGHTS.specialBonuses.fortressOwned;
  }
  if (state.noblesse?.isNoblesse) passiveCp += CP_WEIGHTS.specialBonuses.noblesse;
  if (state.olympiad?.isHero) passiveCp += CP_WEIGHTS.specialBonuses.hero;
  if (state.sevenSigns?.faction) passiveCp += CP_WEIGHTS.specialBonuses.sevenSigns;
  trail.push({ component: 'passiveCp', source: 'Clan, Noblesse, Hero, Fortress, Seven Signs', value: passiveCp });

  // 14. SKILL CP (Skill enchantments)
  let skillCp = 0;
  if (state.skillEnchantments) {
    for (const skId in state.skillEnchantments) {
      const skLvl = Number(state.skillEnchantments[skId].level) || 0;
      skillCp += skLvl * CP_WEIGHTS.specialBonuses.skillEnchantLevel;
    }
  }
  trail.push({ component: 'skillCp', source: 'Skill enchantment levels', value: skillCp });

  // 15. SPECIAL EFFECT CP (Subclass certifications + other)
  let specialEffectCp = 0;
  // Note: SubclassCertificationService CP is imported by CombatPowerService;
  // for the standalone calculation we set to 0 unless explicitly provided
  if (state._certificationCp !== undefined) {
    specialEffectCp = Number(state._certificationCp) || 0;
  }
  trail.push({ component: 'specialEffectCp', source: 'Subclass certifications + other', value: specialEffectCp });

  // TOTAL CP — Strict additive composition
  const totalCp = Math.max(100, Math.floor(
    baseCp + Math.floor(equipmentCp) + Math.floor(enchantCp) + Math.floor(setBonusCp) +
    Math.floor(jewelryCp) + accessoryCp + agathionCp + beltCp +
    braceletCp + talismanCp + artifactCp + jewelBroochCp +
    passiveCp + skillCp + specialEffectCp
  ));

  const components = {
    baseCp, equipmentCp: Math.floor(equipmentCp), enchantCp: Math.floor(enchantCp),
    setBonusCp: Math.floor(setBonusCp), jewelryCp: Math.floor(jewelryCp),
    accessoryCp, agathionCp, beltCp, braceletCp, talismanCp,
    artifactCp, jewelBroochCp, passiveCp, skillCp, specialEffectCp
  };

  // Verify strict additive equation
  const sumComponents = Object.values(components).reduce((s, v) => s + v, 0);
  const auditPass = Math.abs(totalCp - Math.max(100, Math.floor(sumComponents))) <= 1;

  return {
    totalCp,
    components,
    trail,
    auditPass,
    sumComponents: Math.floor(sumComponents)
  };
}
