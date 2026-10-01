import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';
import { getStats, getTotalEquipBonuses } from '../lineage-idle/src/engine/StatsEngine.js';
import { MONSTER_ARCHETYPES, MonsterAIEngine } from '../lineage-idle/src/engine/MonsterAIEngine.js';
import { getMaxInventorySlots } from '../lineage-idle/src/services/InventoryService.js';
import { canCastSkill } from '../lineage-idle/src/data/balance/skillBalance.js';
import { calculateDefenseMitigation, calculateIncomingDamageMitigation, calculatePhysicalDamage, calculatePlayerMissChance, calculateShotBonusMultiplier, resolvePlayerBlock } from '../lineage-idle/src/data/balance/combatBalance.js';
import { polishMasterwork } from '../lineage-idle/src/services/CraftService.js';
import { compoundBeltsWithDuplicates } from '../lineage-idle/src/services/CraftService.js';
import { SynthesisService } from '../lineage-idle/src/services/SynthesisService.js';
import { applyConsumableStatBuff } from '../lineage-idle/src/services/ConsumableService.js';
import { WEAPONS } from '../lineage-idle/src/data/items/weapons.js';
import { NECKLACES, RINGS } from '../lineage-idle/src/data/items/jewels.js';
import { HEIRLOOM_ITEMS } from '../lineage-idle/src/data/items/heirloom_items.js';
import { BROOCH_JEWELS } from '../lineage-idle/src/data/items/broochJewels.js';
import { ALL_ITEMS } from '../lineage-idle/src/data/items/index.js';
import { CANONICAL_SKILL_REGISTRY_V2 } from '../lineage-idle/src/data/skills/CanonicalSkillRegistryV2.js';
import { resolvePlayerBasicAttackIntervalMs, rollPlayerHitStunProc } from '../lineage-idle/src/services/SkillEffectService.js';

function withEquippedItem(slot, item) {
  const state = DEFAULT_STATE();
  state.race = 'human';
  state.class = 'gladiator';
  state.level = 40;
  state.inventory = [{ uid: 'test_item', ...item }];
  state.equipment = { ...state.equipment, [slot]: 'test_item' };
  return state;
}

describe('Equipment effects through the production StatsEngine path', () => {
  it('aggregates every declared combat bonus on all unique equippable catalog items', () => {
    const equipmentSlots = new Set([
      'weapon', 'armor', 'helmet', 'head', 'legs', 'gloves', 'boots', 'shield',
      'cloak', 'belt', 'necklace', 'earring', 'ring', 'brooch', 'artifact', 'underwear'
    ]);
    const slotAliases = { earring: 'earring1', ring: 'ring1', head: 'helmet' };
    const effectFields = [
      'atk', 'pAtk', 'def', 'pDef', 'matk', 'mAtk', 'mdef', 'mDef', 'hp', 'mp',
      'hpPercent', 'cpPercent', 'eva', 'hit', 'crit', 'critDmg', 'cdr', 'speed',
      'atkSpeed', 'castSpeed', 'mpRegen', 'hpRegen', 'stunChance', 'stunResist',
      'blockRate', 'lifesteal', 'ssBonusPct', 'spsBonusPct', 'pveDamagePercent',
      'damageTakenReductionPercent', 'pSkillPowerPercent', 'mSkillPowerPercent',
      'xpBoost', 'goldBoost', 'adenaBoost', 'str', 'dex', 'con', 'int', 'wit', 'men'
    ];
    const uniqueItems = [...new Map(Object.values(ALL_ITEMS)
      .filter(item => equipmentSlots.has(item.slot))
      .map(item => [item.id, item])).values()];
    let checkedEffects = 0;

    for (const item of uniqueItems) {
      const state = DEFAULT_STATE();
      const uid = `catalog-${item.id}`;
      state.inventory = [{ ...item, uid, itemId: item.id }];
      state.equipment[slotAliases[item.slot] || item.slot] = uid;
      const totals = getTotalEquipBonuses(state);

      for (const field of effectFields) {
        if (!Number.isFinite(Number(item[field])) || Number(item[field]) === 0) continue;
        const normalizedField = ({ pAtk: 'atk', pDef: 'def', mAtk: 'matk', mDef: 'mdef', adenaBoost: 'goldBoost' })[field] || field;
        assert.notEqual(totals[normalizedField], 0, `${item.id}.${field} must reach getTotalEquipBonuses()`);
        checkedEffects++;
      }
    }

    assert.ok(uniqueItems.length >= 416, 'the audit includes every currently cataloged unique equip entry');
    assert.ok(checkedEffects >= 1_107, 'the audit checks every currently declared nonzero combat bonus');
  });

  it('routes every cataloged equipment bonus into its effective StatsEngine output', () => {
    const equipmentSlots = new Set([
      'weapon', 'armor', 'helmet', 'head', 'legs', 'gloves', 'boots', 'shield',
      'cloak', 'belt', 'necklace', 'earring', 'ring', 'brooch', 'artifact', 'underwear'
    ]);
    const slotAliases = { earring: 'earring1', ring: 'ring1', head: 'helmet' };
    const outputByField = {
      atk: ['atk'], pAtk: ['atk'], def: ['def'], pDef: ['def'],
      matk: ['matk'], mAtk: ['matk'], mdef: ['mdef'], mDef: ['mdef'],
      hp: ['maxHp'], mp: ['maxMp'], hpPercent: ['maxHp'], cpPercent: ['maxCp'],
      eva: ['eva'], hit: ['pAccuracy'], crit: ['rawCrit'], critDmg: ['critDmg'],
      cdr: ['cdr'], speed: ['movementSpeedPercent'], atkSpeed: ['cdr'], castSpeed: ['cdr'],
      mpRegen: ['mpRegen'], hpRegen: ['hpRegenFlat'], stunResist: ['debuffResistancePercent'],
      blockRate: ['block'], lifesteal: ['lifeDrain'], ssBonusPct: ['ssBonusPct'],
      spsBonusPct: ['spsBonusPct'], pveDamagePercent: ['pveDamagePercent'],
      damageTakenReductionPercent: ['damageTakenReductionPercent'],
      pSkillPowerPercent: ['pSkillPowerPercent'], mSkillPowerPercent: ['mSkillPowerPercent'],
      xpBoost: ['xpBoost'], goldBoost: ['goldBoost'], adenaBoost: ['goldBoost'],
      str: ['atk'], dex: ['crit', 'eva'], con: ['maxHp'], int: ['matk'],
      wit: ['maxMp'], men: ['mdef']
    };
    const uniqueItems = [...new Map(Object.values(ALL_ITEMS)
      .filter(item => equipmentSlots.has(item.slot))
      .map(item => [item.id, item])).values()];
    let checkedEffects = 0;
    let procEffects = 0;

    for (const item of uniqueItems) {
      const baseline = DEFAULT_STATE();
      baseline.level = 90;
      baseline.race = 'human';
      baseline.class = 'fighter';
      const before = getStats(baseline);
      const equipped = structuredClone(baseline);
      const uid = `derived-${item.id}`;
      equipped.inventory = [{ ...item, uid, itemId: item.id }];
      equipped.equipment[slotAliases[item.slot] || item.slot] = uid;
      const after = getStats(equipped);

      if (Number(item.stunChance)) {
        procEffects++;
        continue; // Verified separately against the production hit proc below.
      }
      for (const [field, outputs] of Object.entries(outputByField)) {
        if (!Number.isFinite(Number(item[field])) || Number(item[field]) === 0) continue;
        assert.ok(outputs.some(key => Number(after[key]) > Number(before[key])),
          `${item.id}.${field} must affect an effective stat: ${outputs.join(' / ')}`);
        checkedEffects++;
      }
    }

    assert.ok(uniqueItems.length >= 416);
    assert.ok(checkedEffects >= 1_102);
    assert.ok(procEffects >= 1, 'weapon stun chances are routed through the separate attack-proc contract');
  });

  it('uses M.Def for both magic and magical monster attacks, and P.Def for physical attacks', () => {
    const defenses = { def: 100, mdef: 500 };
    const physical = calculateIncomingDamageMitigation(1000, defenses, 'physical');
    const magic = calculateIncomingDamageMitigation(1000, defenses, 'magic');
    const magical = calculateIncomingDamageMitigation(1000, defenses, 'magical');

    assert.equal(physical, calculateDefenseMitigation(1000, defenses.def, false));
    assert.equal(magic, calculateDefenseMitigation(1000, defenses.mdef, true));
    assert.equal(magical, magic);
  });

  it('removes unsupported carry-weight and area-target stats from the item catalog', () => {
    const retiredStats = new Set(['weightBonus', 'aoeTargets', 'aoeDmg']);
    const visit = value => {
      if (!value || typeof value !== 'object') return [];
      return Object.entries(value).flatMap(([key, child]) => [
        ...(retiredStats.has(key) ? [key] : []),
        ...visit(child)
      ]);
    };
    assert.deepEqual([...new Set([...visit(ALL_ITEMS), ...visit(CANONICAL_SKILL_REGISTRY_V2)])], []);
  });

  it('applies the fish stew physical and magical attack buffs through combat stats', () => {
    const state = DEFAULT_STATE();
    state.race = 'human';
    state.class = 'wizard';
    state.level = 40;
    const baseline = getStats(state);
    const applied = applyConsumableStatBuff(state, ALL_ITEMS.stew_fish);

    assert.equal(applied, true);
    const buffed = getStats(state);
    assert.ok(buffed.atk > baseline.atk, 'fish stew increases P.Atk');
    assert.ok(buffed.matk > baseline.matk, 'fish stew increases M.Atk');
    assert.ok(state.buffs.stew_fish.until > Date.now());
  });

  it('applies equipped movement-speed bonuses to the basic-attack interval', () => {
    const baseline = withEquippedItem('earring1', {
      itemId: 'runtime_speed_earring', slot: 'earring', mdef: 80
    });
    const swift = withEquippedItem('earring1', {
      itemId: 'runtime_speed_earring', slot: 'earring', mdef: 80, speed: 15
    });
    const zaken = withEquippedItem('earring1', {
      ...ALL_ITEMS.jewel_earring_of_zaken,
      uid: 'test_item', itemId: 'jewel_earring_of_zaken', slot: 'earring'
    });

    const baselineStats = getStats(baseline);
    const swiftStats = getStats(swift);
    const zakenStats = getStats(zaken);

    assert.equal(baselineStats.movementSpeedPercent, 0);
    assert.equal(swiftStats.movementSpeedPercent, 0.15);
    assert.ok(swiftStats.speed > baselineStats.speed);
    assert.equal(resolvePlayerBasicAttackIntervalMs(baselineStats), 1_000);
    assert.equal(resolvePlayerBasicAttackIntervalMs(swiftStats), 870);
    assert.equal(zakenStats.movementSpeedPercent, 0.06);
    assert.equal(resolvePlayerBasicAttackIntervalMs(zakenStats), Math.round(1_000 / 1.06));

    const infinityBow = withEquippedItem('weapon', {
      ...WEAPONS.weapon_infinity_bow, uid: 'test_item', itemId: 'weapon_infinity_bow'
    });
    const bowStats = getStats(infinityBow);
    assert.equal(bowStats.movementSpeedPercent, 0.15);
    assert.equal(resolvePlayerBasicAttackIntervalMs(bowStats), 870);

    const lightBoots = withEquippedItem('boots', {
      ...HEIRLOOM_ITEMS.armor_heirloom_boots_light, uid: 'test_item', itemId: 'armor_heirloom_boots_light'
    });
    const bootsStats = getStats(lightBoots);
    assert.equal(bootsStats.movementSpeedPercent, 0.10);
    assert.equal(resolvePlayerBasicAttackIntervalMs(bootsStats), Math.round(1_000 / 1.10));
  });

  it('converts both attack-speed and cast-speed bonuses on equipped gear into skill cooldown reduction', () => {
    const baseline = DEFAULT_STATE();
    baseline.race = 'human';
    baseline.class = 'gladiator';
    baseline.level = 80;
    const baiumRing = withEquippedItem('ring1', {
      ...RINGS.jewel_ring_of_baium,
      uid: 'test_item', itemId: 'jewel_ring_of_baium', slot: 'ring'
    });

    const baseCdr = getStats(baseline).cdr;
    const ringStats = getStats(baiumRing);
    const ringCdr = ringStats.cdr;
    assert.equal(ringCdr - baseCdr, 0.30);
    const skill = { id: 'baium_cooldown_test', type: 'active', baseCd: 10_000 };
    assert.equal(canCastSkill({ mp: 100, stats: ringStats }, skill, 6_999, { baium_cooldown_test: 0 }).canCast, false);
    assert.equal(canCastSkill({ mp: 100, stats: ringStats }, skill, 7_000, { baium_cooldown_test: 0 }).canCast, true);
  });

  it('replaces spear area targets/damage with effective physical attack in production stats', () => {
    const heirloomSpear = withEquippedItem('weapon', {
      ...HEIRLOOM_ITEMS.weapon_heirloom_spear, uid: 'test_item', itemId: 'weapon_heirloom_spear'
    });
    heirloomSpear.level = 1;
    const heroSpear = withEquippedItem('weapon', {
      ...WEAPONS.weapon_infinity_spear, uid: 'test_item', itemId: 'weapon_infinity_spear'
    });
    heroSpear.level = 80;

    assert.equal(getTotalEquipBonuses(heirloomSpear).atk, 43);
    assert.equal(getTotalEquipBonuses(heroSpear).atk, 384);
  });

  it('applies synthesized belt slot bonuses to the actual backpack capacity', () => {
    const state = DEFAULT_STATE();
    state.race = 'human';
    state.level = 40;
    state.gold = 100_000;
    state.inventory = [
      { uid: 'belt-primary', itemId: 'belt_heirloom_champion' },
      { uid: 'belt-secondary', itemId: 'belt_heirloom_champion' }
    ];
    state.equipment = { ...state.equipment, belt: 'belt-primary' };
    const before = getMaxInventorySlots(state);
    const originalRandom = Math.random;
    Math.random = () => 0;
    try {
      assert.equal(compoundBeltsWithDuplicates(state, 'belt-primary', 'belt-secondary', { log: () => {} }), true);
    } finally {
      Math.random = originalRandom;
    }
    assert.equal(state.inventory[0].beltBonuses.invSlots, 1);
    assert.equal(getMaxInventorySlots(state), before + 1);
  });

  it('applies synthesis belt slot bonuses to the actual backpack capacity', () => {
    const state = DEFAULT_STATE();
    state.race = 'human';
    state.level = 40;
    state.gold = 500_000;
    state.inventory = [
      { uid: 'synthesis-belt-primary', itemId: 'belt_heirloom_champion' },
      { uid: 'synthesis-belt-secondary', itemId: 'belt_heirloom_champion' }
    ];
    state.equipment = { ...state.equipment, belt: 'synthesis-belt-primary' };
    const before = getMaxInventorySlots(state);
    const originalRandom = Math.random;
    Math.random = () => 0;
    try {
      const result = SynthesisService.executeSynthesis(state, 'synthesis-belt-primary', 'synthesis-belt-secondary', { log: () => {} });
      assert.equal(result.success, true);
    } finally {
      Math.random = originalRandom;
    }
    assert.equal(state.inventory[0].beltBonuses.invSlots, 2);
    assert.equal(getMaxInventorySlots(state), before + 2);
  });

  it('Foundation improves the equipped armor defense returned by getStats', () => {
    const plain = withEquippedItem('armor', {
      itemId: 'runtime_test_armor', slot: 'armor', def: 100, mdef: 50
    });
    const foundation = withEquippedItem('armor', {
      itemId: 'runtime_test_armor', slot: 'armor', def: 100, mdef: 50, foundation: true
    });

    const plainStats = getStats(plain);
    const foundationStats = getStats(foundation);

    assert.ok(foundationStats.def > plainStats.def);
    assert.ok(foundationStats.mdef > plainStats.mdef);
  });

  it('feeds the heirloom shield block rate into the player combat block stat', () => {
    const shield = withEquippedItem('shield', {
      ...HEIRLOOM_ITEMS.shield_heirloom_aegis, uid: 'test_item', itemId: 'shield_heirloom_aegis'
    });

    const stats = getStats(shield);
    assert.equal(stats.block, 25);
    assert.deepEqual(resolvePlayerBlock(100, stats.block, 'physical', 0.24), { blocked: true, damage: 50 });
    assert.deepEqual(resolvePlayerBlock(100, stats.block, 'physical', 0.25), { blocked: false, damage: 100 });
    assert.deepEqual(resolvePlayerBlock(100, stats.block, 'magical', 0), { blocked: false, damage: 100 });
    const originalRandom = Math.random;
    Math.random = () => { throw new Error('unused block chance must not consume the combat RNG'); };
    try {
      assert.deepEqual(resolvePlayerBlock(100, 0, 'physical'), { blocked: false, damage: 100 });
      assert.deepEqual(resolvePlayerBlock(100, 25, 'magical'), { blocked: false, damage: 100 });
    } finally {
      Math.random = originalRandom;
    }
  });

  it('feeds heirloom hit and regeneration into the player combat stats', () => {
    const baseline = withEquippedItem('weapon', {
      itemId: 'runtime_test_weapon', slot: 'weapon', atk: 100
    });
    const heirloom = withEquippedItem('weapon', {
      ...HEIRLOOM_ITEMS.weapon_heirloom_sword, uid: 'test_item', itemId: 'weapon_heirloom_sword'
    });
    const regen = withEquippedItem('earring1', {
      ...HEIRLOOM_ITEMS.jewelry_heirloom_earring_2, uid: 'test_item', itemId: 'jewelry_heirloom_earring_2'
    });

    assert.ok(getStats(heirloom).pAccuracy > getStats(baseline).pAccuracy);
    assert.ok(getStats(regen).hpRegenFlat > getStats(baseline).hpRegenFlat);
  });

  it('adapts heirloom stun resistance to the monster debuff-resistance stat used in combat', () => {
    const baseline = DEFAULT_STATE();
    const earring = withEquippedItem('earring1', {
      ...HEIRLOOM_ITEMS.jewelry_heirloom_earring_1,
      uid: 'test_item', itemId: 'jewelry_heirloom_earring_1'
    });
    const baselineStats = getStats(baseline);
    const earringStats = getStats(earring);
    const monster = { atk: 100, matk: 100, hp: 1000, _maxHp: 1000, _aiState: { archetype: MONSTER_ARCHETYPES.SUPPORT } };
    const originalRandom = Math.random;
    let exposedResult;
    let protectedResult;
    try {
      Math.random = () => 0.24;
      exposedResult = MonsterAIEngine.processMonsterAttack(structuredClone(monster), baselineStats, baseline);
      protectedResult = MonsterAIEngine.processMonsterAttack(structuredClone(monster), earringStats, earring);
    } finally {
      Math.random = originalRandom;
    }

    assert.equal(earringStats.debuffResistancePercent, 0.10);
    assert.ok(exposedResult.appliedDebuff);
    assert.equal(protectedResult.appliedDebuff, null);
  });

  it('preserves fractional heirloom stun-chance points for the production hit-proc aggregator', () => {
    const hammer = withEquippedItem('weapon', {
      ...HEIRLOOM_ITEMS.weapon_heirloom_blunt,
      uid: 'test_item', itemId: 'weapon_heirloom_blunt', isHeirloom: true
    });

    const chance = getTotalEquipBonuses(hammer).stunChance;
    assert.equal(chance, 0.15);
    assert.equal(rollPlayerHitStunProc(chance, 0.001), true, 'a 0.1% roll succeeds against 0.15% chance');
    assert.equal(rollPlayerHitStunProc(chance, 0.002), false, 'a 0.2% roll does not exceed the 0.15% chance');
    assert.equal(rollPlayerHitStunProc(25, 0.249), true);
    assert.equal(rollPlayerHitStunProc(25, 0.25), false);
    assert.equal(rollPlayerHitStunProc(0, 0), false);
  });

  it('adds equipped heirloom inventory slots to the real backpack capacity', () => {
    const baseline = DEFAULT_STATE();
    baseline.race = 'human';
    baseline.level = 40;
    const expanded = { ...baseline, inventory: [{
      ...HEIRLOOM_ITEMS.belt_heirloom_champion, uid: 'heirloom-belt', itemId: 'belt_heirloom_champion'
    }] };
    expanded.equipment = { ...expanded.equipment, belt: 'heirloom-belt' };

    assert.equal(getMaxInventorySlots(baseline), 150);
    assert.equal(getMaxInventorySlots(expanded), 170);
  });

  it('converts heirloom armor carrying capacity to small, real backpack slot bonuses', () => {
    const armor = {
      uid: 'heirloom-chest', itemId: 'armor_heirloom_chest_heavy',
      ...HEIRLOOM_ITEMS.armor_heirloom_chest_heavy
    };
    const state = DEFAULT_STATE();
    state.race = 'human';
    state.level = 1;
    state.inventory = [armor];
    state.equipment = { ...state.equipment, armor: armor.uid };
    assert.equal(getMaxInventorySlots(state), 151);

    state.level = 25;
    assert.equal(getMaxInventorySlots(state), 152);
  });

  it('applies cataloged equipment cast speed, attack speed, MP regeneration, and critical damage', () => {
    const baseline = withEquippedItem('weapon', {
      itemId: 'runtime_test_weapon', slot: 'weapon', atk: 100, matk: 100
    });
    const baselineStats = getStats(baseline);

    const infinityRod = withEquippedItem('weapon', {
      ...WEAPONS.weapon_infinity_rod, uid: 'test_item', itemId: 'weapon_infinity_rod'
    });
    const rodStats = getStats(infinityRod);
    assert.ok(rodStats.cdr > baselineStats.cdr, 'cataloged Cast Spd. should reduce skill cooldown');
    assert.ok(rodStats.mpRegen > baselineStats.mpRegen, 'the cataloged MP regeneration should be applied');
    assert.ok(rodStats.maxMp > baselineStats.maxMp, 'the cataloged MP bonus should remain applied');
    const longCooldownSkill = { id: 'catalog_rod_cooldown', type: 'active', baseCd: 10_000 };
    assert.equal(canCastSkill({ mp: 100, stats: baselineStats }, longCooldownSkill, 9_000, { catalog_rod_cooldown: 0 }).canCast, false);
    assert.equal(canCastSkill({ mp: 100, stats: rodStats }, longCooldownSkill, 9_000, { catalog_rod_cooldown: 0 }).canCast, true);

    const infinityDuals = withEquippedItem('weapon', {
      ...WEAPONS.weapon_infinity_duals, uid: 'test_item', itemId: 'weapon_infinity_duals'
    });
    assert.ok(getStats(infinityDuals).atkSpd > baselineStats.atkSpd, 'cataloged Atk Spd. should affect attack cadence');

    const infinityCleaver = withEquippedItem('weapon', {
      ...WEAPONS.weapon_infinity_cleaver, uid: 'test_item', itemId: 'weapon_infinity_cleaver'
    });
    const cleaverStats = getStats(infinityCleaver);
    assert.ok(cleaverStats.critDmg > baselineStats.critDmg, 'cataloged critical damage should be applied');
    const critDamageWithoutItem = calculatePhysicalDamage({ atk: 200, def: 0, isCrit: true, critDmgMult: baselineStats.critDmg, applyVariance: false });
    const critDamageWithItem = calculatePhysicalDamage({ atk: 200, def: 0, isCrit: true, critDmgMult: cleaverStats.critDmg, applyVariance: false });
    assert.ok(critDamageWithItem > critDamageWithoutItem, 'critical damage from the weapon must reach the combat formula');

    const infinityAxe = withEquippedItem('weapon', {
      ...WEAPONS.weapon_infinity_axe, uid: 'test_item', itemId: 'weapon_infinity_axe'
    });
    assert.equal(getTotalEquipBonuses(infinityAxe).stunChance, 25, 'the cataloged 25% weapon stun chance must reach combat proc aggregation');

    const baiumRing = withEquippedItem('ring1', {
      ...RINGS.jewel_ring_of_baium, uid: 'test_item', itemId: 'jewel_ring_of_baium'
    });
    const baiumStats = getStats(baiumRing);
    assert.ok(baiumStats.cdr > baselineStats.cdr, 'Baium ring Casting Speed should reduce cooldown');
    assert.ok(baiumStats.atkSpd > baselineStats.atkSpd, 'Baium ring Attack Speed should affect attack cadence');
    assert.equal(baiumStats.critDmg - baselineStats.critDmg, 0, 'Baium ring should not invent a critical-damage bonus');
  });

  it('applies Frintezza necklace CDR to the cooldown checked by the skill runtime', () => {
    const baseline = withEquippedItem('weapon', {
      itemId: 'runtime_test_weapon', slot: 'weapon', atk: 100
    });
    const necklace = withEquippedItem('necklace', {
      ...NECKLACES.jewel_necklace_of_frintezza,
      uid: 'test_item', itemId: 'jewel_necklace_of_frintezza'
    });
    const baselineStats = getStats(baseline);
    const necklaceStats = getStats(necklace);
    const skill = { id: 'frintezza_cdr_test', type: 'active', baseCd: 10_000 };

    assert.equal(necklaceStats.cdr, baselineStats.cdr + 0.15);
    assert.equal(canCastSkill({ mp: 100, stats: baselineStats }, skill, 8_500, { frintezza_cdr_test: 0 }).canCast, false);
    assert.equal(canCastSkill({ mp: 100, stats: necklaceStats }, skill, 8_500, { frintezza_cdr_test: 0 }).canCast, true);
  });

  it('an equipped weapon soul crystal changes the actual combat stats', () => {
    const plain = withEquippedItem('weapon', {
      itemId: 'runtime_test_weapon', slot: 'weapon', atk: 100
    });
    const withMight = withEquippedItem('weapon', {
      itemId: 'runtime_test_weapon', slot: 'weapon', atk: 100,
      soulCrystal: { stat: 'patk', val: 0.10 }
    });

    const plainStats = getStats(plain);
    const mightStats = getStats(withMight);

    assert.ok(mightStats.atk > plainStats.atk);
  });

  it('each socketed soul crystal effect changes its intended combat stat', () => {
    const effectStat = {
      focus: 'crit',
      haste: 'speed',
      acumen: 'cdr',
      health: 'maxHp',
      might: 'atk',
      empower: 'matk'
    };
    const baseState = withEquippedItem('weapon', {
      itemId: 'runtime_test_weapon', slot: 'weapon', atk: 100
    });
    const baseStats = getStats(baseState);

    for (const [effect, stat] of Object.entries(effectStat)) {
      const state = withEquippedItem('weapon', {
        itemId: 'runtime_test_weapon', slot: 'weapon', atk: 100
      });
      state.weaponSockets.test_item = { stage: 1, effect };
      const stats = getStats(state);
      assert.ok(stats[stat] > baseStats[stat], `${effect} should increase ${stat}`);
    }
  });

  it('Guidance SA improves hit accuracy instead of incorrectly increasing evasion', () => {
    const baseline = withEquippedItem('weapon', {
      itemId: 'runtime_test_weapon', slot: 'weapon', atk: 100
    });
    const guided = withEquippedItem('weapon', {
      itemId: 'runtime_test_weapon', slot: 'weapon', atk: 100,
      soulCrystal: { key: 'guidance', stat: 'accuracy', val: 4 }
    });
    const baselineStats = getStats(baseline);
    const guidedStats = getStats(guided);

    assert.equal(guidedStats.eva, baselineStats.eva);
    assert.equal(guidedStats.pAccuracy, baselineStats.pAccuracy + 4);
    assert.equal(guidedStats.mAccuracy, baselineStats.mAccuracy + 4);
    assert.ok(calculatePlayerMissChance(3, guidedStats.pAccuracy) < calculatePlayerMissChance(3, baselineStats.pAccuracy));
  });

  it('Ruby and Sapphire brooch jewels strengthen only their matching shot bonus', () => {
    const ruby = withEquippedItem('jewel1', {
      ...BROOCH_JEWELS.jewel_ruby_5, uid: 'test_item', itemId: 'jewel_ruby_5'
    });
    const sapphire = withEquippedItem('jewel1', {
      ...BROOCH_JEWELS.jewel_sapphire_5, uid: 'test_item', itemId: 'jewel_sapphire_5'
    });
    const rubyStats = getStats(ruby);
    const sapphireStats = getStats(sapphire);

    assert.equal(rubyStats.ssBonusPct, 22);
    assert.equal(rubyStats.spsBonusPct, 0);
    assert.equal(sapphireStats.spsBonusPct, 22);
    assert.equal(sapphireStats.ssBonusPct, 0);
    assert.equal(calculateShotBonusMultiplier(2, rubyStats.ssBonusPct), 2.22);
    assert.equal(calculateShotBonusMultiplier(1.3, sapphireStats.spsBonusPct), 1.366);
  });

  it('Masterwork cast speed reduces skill cooldown without changing attack speed', () => {
    const plain = withEquippedItem('armor', {
      itemId: 'runtime_test_masterwork', slot: 'armor', def: 100
    });
    const masterwork = withEquippedItem('armor', {
      itemId: 'runtime_test_masterwork', slot: 'armor', def: 100,
      isMasterwork: true, masterworkBonus: { castSpdPct: 0.05 }
    });

    const plainStats = getStats(plain);
    const masterworkStats = getStats(masterwork);

    assert.equal(masterworkStats.cdr, plainStats.cdr + 0.05);
    assert.equal(masterworkStats.atkSpd, plainStats.atkSpd);
    const skill = { id: 'test_cast', type: 'active', baseCd: 10_000 };
    assert.equal(canCastSkill({ mp: 100, stats: masterworkStats }, skill, 5_000, { test_cast: 0 }).canCast, false);
    assert.equal(canCastSkill({ mp: 100, stats: masterworkStats }, skill, 9_500, { test_cast: 0 }).canCast, true);
  });

  it('polishing Foundation grants the stated flat 250 HP in production stats', () => {
    const state = withEquippedItem('armor', {
      itemId: 'runtime_test_masterwork_hp', slot: 'armor', def: 100, foundation: true
    });
    state.gold = 100_000;
    const before = getStats(state);

    assert.equal(polishMasterwork(state, 'test_item'), true);
    assert.equal(state.gold, 0);
    assert.equal(state.inventory[0].masterworkBonus.hpBonus, 250);

    const after = getStats(state);
    assert.equal(after.maxHp - before.maxHp, 250);
    assert.equal(after.cdr - before.cdr, 0.09, 'Masterwork attack and cast speed reduce cooldown while retaining attack speed');
    assert.equal(after.atkSpd - before.atkSpd, 0.04, 'Masterwork attack speed remains attack speed');
    assert.equal(after.mpRegen - before.mpRegen, 0.08, 'Masterwork MP regeneration bonus is applied');
  });

  it('Acumen SA and socket bonuses reduce skill cooldown instead of attack speed', () => {
    const plain = withEquippedItem('weapon', {
      itemId: 'runtime_test_weapon', slot: 'weapon', atk: 100
    });
    const weaponSa = withEquippedItem('weapon', {
      itemId: 'runtime_test_weapon', slot: 'weapon', atk: 100,
      soulCrystal: { stat: 'castSpd', val: 0.15 }
    });
    const socketed = withEquippedItem('weapon', {
      itemId: 'runtime_test_weapon', slot: 'weapon', atk: 100
    });
    socketed.weaponSockets.test_item = { stage: 1, effect: 'acumen' };

    const plainStats = getStats(plain);
    const weaponSaStats = getStats(weaponSa);
    const socketStats = getStats(socketed);

    assert.ok(weaponSaStats.cdr > plainStats.cdr);
    assert.equal(weaponSaStats.atkSpd, plainStats.atkSpd);
    assert.ok(socketStats.cdr > plainStats.cdr);
    assert.equal(socketStats.atkSpd, plainStats.atkSpd);
  });
});
