import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const invPath = path.join(root, 'scripts/skill_functional_contract_inventory.json');
const inv = JSON.parse(fs.readFileSync(invPath, 'utf8'));

const STATS_ENGINE_PASSIVES = {
  weapon_mastery: 'atk', armor_mastery: 'def', sword_blunt_mastery: 'atk',
  heavy_armor_mastery: 'def', dual_weapon_mastery: 'atk', master_of_combat: 'atk',
  polearm_mastery: 'atk', shield_mastery: 'def', quick_step: 'movementSpeedPercent',
  dagger_mastery: 'atk', light_armor_mastery: 'def', critical_power: 'critDmg',
  critical_chance: 'crit', bow_mastery: 'atk', eye_of_slayer: 'atk',
  magic_mastery: 'matk', robe_mastery: 'matk', fast_spell_casting: 'speed',
  anti_magic: 'mdef', spellcraft: 'matk', focus_mind: 'mpRegen',
  sigil_mastery: 'matk', higher_mana_gain: 'mpRegen', boost_hp: 'maxHp',
  vital_force: 'maxHp', two_handed_weapon_mastery: 'atk', boost_evasion: 'eva',
  fist_mastery: 'atk', boost_attack_speed: 'speed'
};

const BUFF_DESCRIPTION_STATS = [
  { labels: 'P\\.?\\s*Atk\\.?|Physical Attack', stat: 'atk' },
  { labels: 'M\\.?\\s*Atk\\.?|Magic Attack', stat: 'matk' },
  { labels: 'P\\.?\\s*Def\\.?|Physical Defense', stat: 'def' },
  { labels: 'M\\.?\\s*Def\\.?|Magic Defense', stat: 'mdef' },
  { labels: 'Max(?:imum)?\\s+HP', stat: 'maxHp' },
  { labels: 'Max(?:imum)?\\s+MP', stat: 'maxMp' },
  { labels: 'Max(?:imum)?\\s+CP', stat: 'maxCp' },
  { labels: '(?:P\\.?\\s*)?Evasion', stat: 'eva' },
  { labels: '(?:Critical Chance|Critical Rate|Crit(?:ical)?)', stat: 'crit' },
  { labels: '(?:M\\.?\\s*)?Skill MP Consumption|MP Consumption', stat: 'mpCostReduction', invert: true },
  { labels: '(?:Casting|Cast) Speed|Skill Reuse(?: Delay)?|Cooldown Reduction', stat: 'cdr' },
  { labels: '(?:[PM]\\.?\\s*)?Skill\\s+Cooldown', stat: 'mSkillCdr', invert: true }
];
const TARGET_DEBUFF_DESCRIPTION_STATS = [
  { labels: 'P\\.?\\s*Atk\\.?|Physical Attack', stat: 'atk' },
  { labels: 'M\\.?\\s*Atk\\.?|Magic Attack', stat: 'matk' },
  { labels: 'P\\.?\\s*Def\\.?|Physical Defense', stat: 'def' },
  { labels: 'M\\.?\\s*Def\\.?|Magic Defense', stat: 'mdef' },
  { labels: 'Atk\\.?\\s*Spd\\.?|Attack Speed', stat: 'attackSpeed' },
  { labels: 'Casting\\s*Spd\\.?|Casting Speed', stat: 'skillCooldown', reverse: true }
];

function buffContract(def) {
  if (def.id === 'blazing_fury') return {
    kind: 'buff',
    expectedDeltas: [
      { stat: 'atk', direction: 'increase' },
      { stat: 'def', direction: 'increase' },
      { stat: 'maxHp', direction: 'increase' },
      { stat: 'pSkillPowerPercent', direction: 'increase' }
    ],
    source: 'L2Wiki Lineage II Essence Blazing Fury Lv. 1: P. Atk., P. Def., Max HP +10%, P. Skill Power +5%; Aden Arena adapts the 20-minute source duration to 20 seconds'
  };
  const actionLockDurations = {
    flame_grip: 5_000, shining_prison: 5_000, dreaming_spirit: 5_000, sleep: 2_000,
    confusion: 5_000, anchor: 3_000, shackle: 4_000, dryad_root: 4_000
  };
  if (Object.hasOwn(actionLockDurations, def.id)) return {
    kind: 'target_debuff',
    expectedDeltas: [{ stat: 'actionsDisabled', direction: 'increase' }],
    expectedDurationMs: actionLockDurations[def.id],
    consumer: 'monster_action_lock',
    source: `${def.name}: target action lock prevents monster basic attacks and skills for ${actionLockDurations[def.id] / 1000} seconds`
  };
  if (def.id === 'entangle') return {
    kind: 'target_debuff',
    expectedDeltas: [{ stat: 'movementSpeedPercent', direction: 'decrease' }],
    expectedDurationMs: 3_000,
    consumer: 'monster_movement_slow',
    source: 'L2Wiki Lineage II Essence Entangle Lv. 1: target Speed -70% for 3 seconds; Aden Arena maps the slow to slower basic attacks and longer monster skill cooldowns'
  };
  if (def.id === 'rage') return {
    kind: 'buff',
    expectedDeltas: [
      { stat: 'atk', direction: 'increase' },
      { stat: 'cdr', direction: 'increase' }
    ],
    unchangedStats: ['atkSpd'],
    source: 'Aden Arena adaptation: 10% physical attack and 5% cooldown reduction for 8 seconds'
  };
  if (def.id === 'soul_roar') return {
    kind: 'buff',
    expectedDeltas: [
      { stat: 'atk', direction: 'increase' },
      { stat: 'debuffResistancePercent', direction: 'increase' }
    ],
    source: 'Aden Arena adaptation: 8% physical attack and 10% combat-debuff resistance for 8 seconds'
  };
  if (def.id === 'soul_guard') return {
    kind: 'buff',
    expectedDeltas: [
      { stat: 'def', direction: 'increase' },
      { stat: 'mdef', direction: 'increase' },
      { stat: 'debuffResistancePercent', direction: 'increase' }
    ],
    source: 'Aden Arena adaptation: 15% physical defense, 10% magic defense, and 10% combat-debuff resistance for 8 seconds'
  };
  if (def.id === 'elemental_magic_barrier') return {
    kind: 'buff',
    expectedDeltas: [
      { stat: 'mdef', direction: 'increase' },
      { stat: 'debuffResistancePercent', direction: 'increase' }
    ],
    source: 'Aden Arena adaptation: 15% magic defense and 10% debuff resistance for 8 seconds'
  };
  if (['wind_walk', 'elemental_wind_walk'].includes(def.id)) return {
    kind: 'buff',
    expectedDeltas: [{ stat: 'movementSpeedPercent', direction: 'increase' }],
    unchangedStats: ['atkSpd', 'cdr'],
    consumer: 'basic_attack_interval',
    source: 'Aden Arena adaptation: movement speed shortens the interval between basic attacks without changing attack speed or skill cooldown'
  };
  if (def.id === 'elemental_insight') return {
    kind: 'buff',
    expectedDeltas: [
      { stat: 'matk', direction: 'increase' },
      { stat: 'mSkillCdr', direction: 'increase' }
    ],
    unchangedStats: ['atkSpd'],
    source: 'Aden Arena adaptation: 10% magic attack and 5% magic-skill cooldown reduction for 8 seconds'
  };
  if (def.id === 'soul_wind_walk') return {
    kind: 'buff',
    expectedDeltas: [{ stat: 'movementSpeedPercent', direction: 'increase' }],
    unchangedStats: ['atkSpd', 'cdr'],
    consumer: 'basic_attack_interval',
    source: 'L2Wiki Lineage II Essence Soul Wind Walk Lv. 3: Speed +35; Aden Arena adapts movement to 6% faster basic-attack cadence for 10 seconds'
  };
  if (def.id === 'blessing_of_winds') return {
    kind: 'buff',
    expectedDeltas: [
      { stat: 'movementSpeedPercent', direction: 'increase' },
      { stat: 'debuffResistancePercent', direction: 'increase' }
    ],
    unchangedStats: ['atkSpd', 'cdr'],
    consumer: 'basic_attack_interval',
    source: 'Aden Arena adaptation: 8% movement speed shortens basic-attack interval and 10% debuff resistance for 10 seconds'
  };
  if (def.id === 'sharp_blade') return {
    kind: 'buff',
    expectedDeltas: [{ stat: 'atk', direction: 'increase' }],
    unchangedStats: ['atkSpd'],
    source: 'Lineage II Essence Assassin notes: Sharp Blade Lv. 1 gives 5% P. Atk.; Aden Arena adapts it to an 8-second buff'
  };
  if (def.id === 'flame_grip') return {
    kind: 'target_debuff',
    expectedDeltas: [{ stat: 'actionsDisabled', direction: 'increase' }],
    source: 'Lineage II Essence Death Knight notes: Flame Grip holds the target for 5 seconds; the single-target combat adaptation blocks monster actions for the same duration'
  };
  if (def.id === 'fire') return {
    kind: 'buff',
    expectedDeltas: [{ stat: 'atk', direction: 'increase' }],
    source: 'Aden Arena adaptation: 10% physical attack for 8 seconds'
  };
  if (def.id === 'wind') return {
    kind: 'buff',
    expectedDeltas: [{ stat: 'cdr', direction: 'increase' }],
    unchangedStats: ['atkSpd'],
    source: 'Aden Arena adaptation: 8% cooldown reduction for 8 seconds'
  };
  if (def.id === 'mountain') return {
    kind: 'buff',
    expectedDeltas: [
      { stat: 'def', direction: 'increase' },
      { stat: 'mdef', direction: 'increase' }
    ],
    source: 'Aden Arena adaptation: 15% physical defense and 10% magic defense for 8 seconds'
  };
  if (def.id === 'forest') return {
    kind: 'buff',
    expectedDeltas: [
      { stat: 'eva', direction: 'increase' },
      { stat: 'debuffResistancePercent', direction: 'increase' }
    ],
    source: 'Aden Arena adaptation: 15 evasion and 10% combat-debuff resistance for 8 seconds'
  };
  if (def.id === 'chant_of_vampire') return {
    kind: 'buff',
    expectedDeltas: [
      { stat: 'movementSpeedPercent', direction: 'increase' },
      { stat: 'debuffResistancePercent', direction: 'increase' }
    ],
    unchangedStats: ['atkSpd', 'cdr'],
    consumer: 'chant_vampire_lifedrain',
    requiresAttackInterval: true,
    lifeDrainProcChance: 0.80,
    lifeDrainProcPercent: 0.07,
    source: 'NC Essence skill table: Speed +2, Debuff/Mez Resistance +10%, and 80% chance to absorb 7% of inflicted damage; movement Speed shortens basic-attack intervals in card combat'
  };
  if (def.id === 'freezing_wound') return {
    kind: 'damage_and_target_debuff',
    expectedDeltas: [
      { stat: 'attackSpeed', direction: 'decrease' },
      { stat: 'skillCooldown', direction: 'increase' }
    ],
    source: 'Freezing Wound: 120% single-target damage plus a 3-second balanced attack-cadence and skill-cooldown slow'
  };
  if (def.id === 'war_cry') return { kind: 'buff', expectedDeltas: [{ stat: 'atk', direction: 'increase' }], source: `${def.name}: known attack buff with duration and expiration` };
  if (def.id === 'unleashed_power') return {
    kind: 'buff',
    expectedDeltas: [
      { stat: 'damageTakenReductionPercent', direction: 'increase' },
      { stat: 'debuffResistancePercent', direction: 'increase' },
      { stat: 'pSkillPowerPercent', direction: 'increase' }
    ],
    consumer: 'incoming_damage_reduction',
    incomingDamageReductionPercent: 0.03,
    physicalSkillPowerPercent: 0.01,
    source: 'Aden Arena adaptation: 3% less received damage, 5% combat-debuff resistance, and 1% physical skill power'
  };
  if (def.id === 'detect_weakness') return {
    kind: 'target_debuff',
    expectedDeltas: [{ stat: 'damageTakenPercent', direction: 'increase' }],
    source: 'Aden Arena adaptation: marks the current target for 8% increased damage taken over 8 seconds'
  };
  if (def.id === 'roar_of_death') return {
    kind: 'target_debuff',
    expectedDeltas: [
      { stat: 'atk', direction: 'decrease' },
      { stat: 'matk', direction: 'decrease' }
    ],
    source: 'Aden Arena adaptation: reduces the marked target physical and magic attack by 15% for 10 seconds'
  };
  if (def.id === 'concentration') return {
    kind: 'buff',
    expectedDeltas: [{ stat: 'debuffResistancePercent', direction: 'increase' }],
    unchangedStats: ['cdr', 'atkSpd'],
    source: 'Aden Arena adaptation: 36-point casting-interruption reduction grants 36% resistance to combat debuffs'
  };
  if (def.id === 'ultimate_evasion') {
    return {
      kind: 'buff',
      expectedDeltas: [
        { stat: 'eva', direction: 'increase' },
        { stat: 'pSkillEvasionPercent', direction: 'increase' },
        { stat: 'buffCancelResistancePercent', direction: 'increase' }
      ],
      unsupportedEffects: ['buff-cancel resistance has no hostile buff-dispel mechanic in the combat runtime'],
      source: `${def.name}: level 2 evasion, physical skill evasion, and buff-cancel resistance; 30s duration`
    };
  }
  const desc = String(def.desc || '');
  if (/\btargets?\b|debuff|weakens? the enemy/i.test(desc)) {
    const expectedDeltas = [];
    let recognizedNumbers = 0;
    for (const { labels, stat, reverse = false } of TARGET_DEBUFF_DESCRIPTION_STATS) {
      const pattern = new RegExp(`(?:${labels})\\s*([+-]\\s*\\d+(?:\\.\\d+)?)\\s*(%)?`, 'ig');
      for (const match of desc.matchAll(pattern)) {
        recognizedNumbers++;
        const amount = Number(match[1].replace(/\s/g, ''));
        if (match[2] && amount < 0) expectedDeltas.push({ stat, direction: reverse ? 'increase' : 'decrease' });
      }
    }
    const effectText = desc.replace(/(?:for|duration[: ]+)\s*\d+\s*sec\.?/ig, '');
    const numberCount = (effectText.match(/[+-]?\d+(?:\.\d+)?%?/g) || []).length;
    const unsupportedEffects = [];
    if (!expectedDeltas.length) unsupportedEffects.push('target effect has no supported numeric combat-stat delta');
    if (numberCount > recognizedNumbers) unsupportedEffects.push('unparsed target effect');
    return { kind: 'target_debuff', expectedDeltas, ...(unsupportedEffects.length ? { unsupportedEffects } : {}), source: `${def.name}: canonical target debuff with timed stat effects` };
  }
  const expectedDeltas = [];
  let recognizedNumbers = 0;
  for (const { labels, stat, invert = false } of BUFF_DESCRIPTION_STATS) {
    const pattern = new RegExp(`(?:${labels})\\s*([+-]\\s*\\d+(?:\\.\\d+)?)\\s*(%)?`, 'ig');
    for (const match of desc.matchAll(pattern)) {
      recognizedNumbers++;
      const amount = Number(match[1].replace(/\s/g, ''));
      const positive = (amount > 0) !== invert;
      expectedDeltas.push({ stat, direction: positive ? 'increase' : 'decrease' });
    }
  }
  const numberCount = (desc.match(/[+-]?\d+(?:\.\d+)?%?/g) || []).length;
  const unsupportedEffects = [];
  if (!expectedDeltas.length) unsupportedEffects.push('no explicit supported self-buff effect');
  if (numberCount > recognizedNumbers) unsupportedEffects.push('unparsed numeric effect');
  return { kind: 'buff', expectedDeltas, ...(unsupportedEffects.length ? { unsupportedEffects } : {}), source: `${def.name}: canonical described effects with duration and expiration` };
}

const contracts = {};
for (const def of inv.meta.uniqueDefinitions) {
  const id = def.id;
  const fam = def.family;
  const fixedHeal = String(def.desc || '').match(/^\s*Recovers\s+(\d+)\s+of\s+the\s+target['’]s\s+HP\.?\s*$/i);
  if (STATS_ENGINE_PASSIVES[id]) {
    contracts[id] = id === 'quick_step'
      ? { kind: 'passive', expectedDeltas: [{ stat: 'movementSpeedPercent', direction: 'increase' }], consumer: 'basic_attack_interval', source: 'Canonical effect Speed +15: movement speed shortens the production basic-attack interval' }
      : { kind: 'passive', stat: STATS_ENGINE_PASSIVES[id], source: `${def.name}: increase ${STATS_ENGINE_PASSIVES[id]}` };
  } else if (fam === 'HEAL' || /heal|curation/.test(id) || fixedHeal) {
    contracts[id] = { kind: 'heal', ...(fixedHeal ? { expectedAmount: Number(fixedHeal[1]) } : {}), source: `${def.name}: restore HP without exceeding maxHp` };
  } else if (fam === 'BUFF') {
    contracts[id] = buffContract(def);
  } else if (['PHYSICAL_DAMAGE', 'MAGICAL_DAMAGE', 'AOE_DAMAGE', 'STUN', 'KNOCKBACK', 'LIFESTEAL'].includes(fam)) {
    contracts[id] = { kind: 'damage', source: `${def.name}: deal combat damage with MP and cooldown` };
  }
}

// Existing contracts are independently reviewed behavior specifications.
// Keep them when regenerating so catalog inference cannot erase audited rules.
const targetFile = path.join(root, 'scripts/lib/functional-evidence.mjs');
const writeGeneratedFile = contents => {
  const temporaryFile = `${targetFile}.tmp`;
  fs.writeFileSync(temporaryFile, contents, 'utf8');
  fs.renameSync(temporaryFile, targetFile);
};
if (fs.existsSync(targetFile)) {
  const previousSource = fs.readFileSync(targetFile, 'utf8');
  const match = previousSource.match(/export const EFFECT_CONTRACTS = Object\.freeze\((\{[\s\S]*?\})\);/);
  if (match) Object.assign(contracts, JSON.parse(match[1]));
}
contracts.quick_step = {
  kind: 'passive',
  expectedDeltas: [{ stat: 'movementSpeedPercent', direction: 'increase' }],
  consumer: 'basic_attack_interval',
  source: 'Canonical effect Speed +15: movement speed shortens the production basic-attack interval'
};
const chantOfVampireDefinition = inv.meta.uniqueDefinitions.find(item => item.id === 'chant_of_vampire');
if (chantOfVampireDefinition) contracts.chant_of_vampire = buffContract(chantOfVampireDefinition);
// These records in the catalog are placeholders. Keep their explicit
// Aden Arena adaptations authoritative across regeneration.
for (const id of ['blazing_fury', 'rage', 'soul_roar', 'soul_guard', 'fire', 'wind', 'mountain', 'forest', 'wind_walk', 'elemental_wind_walk', 'elemental_magic_barrier', 'elemental_insight', 'soul_wind_walk', 'blessing_of_winds', 'sharp_blade', 'flame_grip', 'shining_prison', 'dreaming_spirit', 'sleep', 'confusion', 'anchor', 'shackle', 'dryad_root', 'entangle']) {
  const def = inv.meta.uniqueDefinitions.find(item => item.id === id);
  if (def) contracts[id] = buffContract(def);
}
// These two catalog rows predate their production corrections and still label
// both abilities as generic buffs. Keep the functional audit aligned with the
// canonical production definitions and the verified adaptations.
contracts.inferno = {
  kind: 'damage_over_time', expectedTicks: 10, expectedDurationMs: 10_000,
  source: 'L2Wiki Lineage II Essence Inferno: Fire damage, Power 150, then 10 seconds of damage over time; browser harness measures all production ticks'
};
contracts.touch_of_death = {
  kind: 'target_debuff',
  expectedDeltas: [{ stat: 'damageTakenPercent', direction: 'increase' }],
  expectedDurationMs: 20_000,
  hpCostPercent: 0.10,
  source: 'L2Wiki Lineage II Essence Touch of Death: self-sacrifice and timed enemy vulnerability adapted to 10% Max HP and +10% damage taken for 20 seconds'
};
contracts.pa_agrio_s_glory = {
  kind: 'buff',
  expectedDeltas: [
    { stat: 'matk', direction: 'increase' }, { stat: 'def', direction: 'increase' },
    { stat: 'mdef', direction: 'increase' }, { stat: 'mSkillCdr', direction: 'increase' }
  ],
  source: 'L2Wiki Lineage II Essence Pa\'agrio\'s Glory Lv. 3: magic attack/defense, physical defense and 15% magic-skill cooldown reduction; Aden Arena adapts its duration to 20 seconds'
};
contracts.chant_of_glory = {
  kind: 'buff', expectedDeltas: [
    { stat: 'matk', direction: 'increase' }, { stat: 'def', direction: 'increase' },
    { stat: 'mdef', direction: 'increase' }, { stat: 'mSkillCdr', direction: 'increase' },
    { stat: 'mSkillPowerPercent', direction: 'increase' }, { stat: 'maxMp', direction: 'increase' },
    { stat: 'mSkillMpCostReduction', direction: 'increase' }
  ], source: 'L2Wiki Lineage II Essence Chant of Glory Lv. 3; source effects are adapted to a 20-second solo-combat buff'
};
contracts.soul_blade = {
  kind: 'buff', expectedDeltas: [
    { stat: 'atk', direction: 'increase' }, { stat: 'crit', direction: 'increase' },
    { stat: 'pSkillPowerPercent', direction: 'increase' }
  ], source: 'L2Wiki Lineage II Essence Soul Blade Lv. 1: P. Atk. +30%, skill critical rate +15%, skill critical damage +10%, skill power +10%'
};
contracts.prime_master = {
  kind: 'buff', expectedDeltas: [
    { stat: 'maxHp', direction: 'increase' }, { stat: 'atk', direction: 'increase' },
    { stat: 'crit', direction: 'increase' }, { stat: 'pSkillPowerPercent', direction: 'increase' },
    { stat: 'debuffResistancePercent', direction: 'increase' }
  ], source: 'L2Wiki Lineage II Essence Prime Master adapted from siege-scale bonuses to a short solo PvE stance'
};
contracts.powerful_rush = {
  kind: 'buff', expectedDeltas: [
    { stat: 'atk', direction: 'increase' }, { stat: 'pveDamagePercent', direction: 'increase' },
    { stat: 'movementSpeedPercent', direction: 'increase' }
  ], source: 'L2Wiki Lineage II Essence Powerful Rush: P. Atk. +40%, PvE damage +17%, Speed +10; speed maps to basic-attack cadence'
};
contracts.sword_symphony = {
  kind: 'buff', expectedDeltas: [
    { stat: 'atk', direction: 'increase' }, { stat: 'pveDamagePercent', direction: 'increase' },
    { stat: 'damageTakenReductionPercent', direction: 'increase' }
  ], source: 'L2Wiki Lineage II Essence Sword Symphony: +10% P. Atk., +10% PvE skill damage, and -10% received skill damage; sword-specific proc effects remain outside the simulator'
};
contracts.bleeding_rose = {
  kind: 'buff', expectedDeltas: [
    { stat: 'matk', direction: 'increase' }, { stat: 'crit', direction: 'increase' },
    { stat: 'mSkillPowerPercent', direction: 'increase' }, { stat: 'pveDamagePercent', direction: 'increase' }
  ], source: 'L2Wiki Lineage II Essence Bleeding Rose: +5% M. Atk., M. Skill Critical Rate, M. Skill Power, and +10% PvE damage'
};
contracts.reflecting_illusion = {
  kind: 'buff', expectedDeltas: [
    { stat: 'def', direction: 'increase' }, { stat: 'mdef', direction: 'increase' },
    { stat: 'debuffResistancePercent', direction: 'increase' },
    { stat: 'damageTakenReductionPercent', direction: 'increase' }
  ], healPercent: 0.50, reflectPercent: 0.10,
  source: 'L2Wiki Lineage II Essence Reflecting Illusion: restores 50% Max HP, adds P./M. Def. +3000, resistance +15%, reflects 10%; magic-counter reduction is adapted to general mitigation'
};
contracts.increase_power = {
  kind: 'buff', expectedDeltas: [
    { stat: 'atk', direction: 'increase' }, { stat: 'matk', direction: 'increase' }
  ], consumer: 'stun_attack_proc',
  source: 'L2Wiki Lineage II Essence Trooper Increase Power Lv. 1: increases M. Atk., P. Atk. and Shock Atk. Rate by 20%; the shock bonus uses the modeled stun proc; https://l2wiki.com/essence/skills/trooper/1432_1_0.html'
};
contracts.body_to_mind = {
  kind: 'resource_trade', hpCostPercent: 0.10, mpRecoveryPower: 90,
  source: 'L2Wiki Lineage II Essence Body to Mind Lv. 1 confirms HP sacrifice for MP recovery; Aden Arena uses its local canonical Power 90, capped at 90 MP, with a 10% Max HP cost; https://l2wiki.com/essence/skills/dark_wizard/1157_1_0.html'
};
contracts.crimson_rose = {
  kind: 'buff', expectedDeltas: [
    { stat: 'matk', direction: 'increase' }, { stat: 'crit', direction: 'increase' },
    { stat: 'mSkillPowerPercent', direction: 'increase' }, { stat: 'pveDamagePercent', direction: 'increase' },
    { stat: 'mpRegen', direction: 'increase' }
  ], source: 'L2Wiki Lineage II Essence Crimson Rose Lv. 2: +10% M. Atk., +5% magic skill crit, +2% M. Skill Power, +5% PvE damage, +10 MP recovery'
};
contracts.tenacity = {
  kind: 'buff', expectedDeltas: [{ stat: 'debuffResistancePercent', direction: 'increase' }],
  source: 'L2Wiki Lineage II Essence Tenacity Lv. 4: +10% Shock Resistance; the five-second chance-based on-hit HP recovery is implemented in production and unit-tested'
};
contracts.atsumori = {
  kind: 'buff', expectedDeltas: [
    { stat: 'maxHp', direction: 'increase' }, { stat: 'mpRegen', direction: 'increase' },
    { stat: 'atk', direction: 'increase' }, { stat: 'pSkillMpCostReduction', direction: 'increase' },
    { stat: 'pSkillCdr', direction: 'increase' }
  ], source: 'L2Wiki Lineage II Essence Atsumori Lv. 2: Max HP +15%, MP recovery +5, P. Atk. +8%/+300, P. Skill MP consumption -15%, P. Skill cooldown -1%'
};
contracts.sacral_power = {
  kind: 'buff', expectedDeltas: [
    { stat: 'atk', direction: 'increase' }, { stat: 'crit', direction: 'increase' },
    { stat: 'movementSpeedPercent', direction: 'increase' }
  ], consumer: 'basic_attack_interval', source: 'L2Wiki Lineage II Essence Sacral Power Lv. 2: P. Atk. +20%, P. Skill Critical Rate +5%, Speed +20 adapted to basic-attack cadence'
};
contracts.collect_shadow_souls = {
  kind: 'buff', expectedDeltas: [{ stat: 'pSkillPowerPercent', direction: 'increase' }],
  source: 'L2Wiki Lineage II Essence Collect Shadow Souls grants 100 Shadow Souls momentarily; Aden Arena maps the missing soul-transformation resource to a 10-second physical-skill burst'
};
contracts.collect_light_souls = {
  kind: 'buff', expectedDeltas: [
    { stat: 'mSkillPowerPercent', direction: 'increase' }, { stat: 'mSkillCdr', direction: 'increase' }
  ], source: 'L2Wiki Lineage II Essence Collect Light Souls grants 100 Light Souls momentarily; Aden Arena maps the missing soul-transformation resource to a 10-second magical-skill burst'
};
for (const [id, reflectPercent, duration, url] of [
  ['fragarach', 0.10, 30_000, 'https://l2wiki.com/essence/skills/soul_hound/47981_1_0.html'],
  ['light_counter', 0.15, 20_000, 'https://l2wiki.com/essence/skills/sacred_templar_3/87841_1_0.html']
]) {
  contracts[id] = { kind: 'buff', expectedDeltas: id === 'fragarach' ? [{ stat: 'debuffResistancePercent', direction: 'increase' }] : [], reflectPercent, expectedDurationMs: duration, source: `L2Wiki Lineage II Essence ${id}: timed reflection adapted to modeled combat damage; ${url}` };
}
contracts.wild_dance = {
  kind: 'target_debuff', expectedDeltas: [{ stat: 'actionsDisabled', direction: 'increase' }],
  expectedDurationMs: 1_000, consumer: 'monster_action_lock',
  source: 'L2Wiki Lineage II Essence Wild Dance: knocks nearby targets back for 1 second; adapted to block target actions in the solo combat loop'
};
contracts.mechanical_masterpiece = {
  kind: 'buff', expectedDeltas: [{ stat: 'pveDamagePercent', direction: 'increase' }], consumer: 'mechanical_masterpiece_proc',
  source: 'L2Wiki Lineage II Essence Mechanical Masterpiece: chance-based additional attack and Mechanical Golem stun for 1 sec.; Aden Arena adapts the proc to +20% damage on a 15% attack roll and a 1-second action lock'
};
const sourcedBuffContracts = {
  knight_s_protection: [['maxHp', 'increase']],
  exciting_adventure: [['atk', 'increase'], ['movementSpeedPercent', 'increase'], ['eva', 'increase'], ['crit', 'increase'], ['pSkillEvasionPercent', 'increase'], ['buffCancelResistancePercent', 'increase'], ['debuffResistancePercent', 'increase']],
  wind_riding: [['atk', 'increase'], ['movementSpeedPercent', 'increase'], ['eva', 'increase'], ['crit', 'increase'], ['pSkillEvasionPercent', 'increase'], ['buffCancelResistancePercent', 'increase'], ['debuffResistancePercent', 'increase']],
  snipe: [['pAccuracy', 'increase'], ['atk', 'increase'], ['crit', 'increase']],
  legendary_archer: [['maxHp', 'increase'], ['atk', 'increase'], ['crit', 'increase'], ['pSkillPowerPercent', 'increase'], ['pveDamagePercent', 'increase']],
  battle_training: [['atk', 'increase'], ['cdr', 'increase']],
  life_magic_harmony_defense: [['def', 'increase'], ['mdef', 'increase'], ['maxHp', 'increase'], ['mpRegen', 'increase']],
  song_of_earth: [['atk', 'increase'], ['def', 'increase'], ['mdef', 'increase'], ['crit', 'increase'], ['movementSpeedPercent', 'increase'], ['pSkillPowerPercent', 'increase']],
  song_of_cosmos: [['atk', 'increase'], ['crit', 'increase'], ['pSkillPowerPercent', 'increase'], ['pveDamagePercent', 'increase']],
  evasion: [['pSkillEvasionPercent', 'increase'], ['mSkillEvasionPercent', 'increase']],
  rapid_fire: [['atk', 'increase'], ['cdr', 'increase']],
  prophecy_of_water: [['matk', 'increase'], ['cdr', 'increase'], ['def', 'increase'], ['mdef', 'increase'], ['maxMp', 'increase'], ['mpRegen', 'increase']],
  enlightenment: [['matk', 'increase'], ['cdr', 'increase'], ['crit', 'increase'], ['mSkillPowerPercent', 'increase'], ['healingReceivedPercent', 'increase']],
  dance_of_warrior: [['atk', 'increase'], ['def', 'increase'], ['mdef', 'increase'], ['pSkillPowerPercent', 'increase'], ['cdr', 'increase']],
  dead_eye: [['pAccuracy', 'increase'], ['atk', 'increase'], ['critDmg', 'increase'], ['cdr', 'decrease']],
  prophecy_of_wind: [['crit', 'increase'], ['mSkillPowerPercent', 'increase'], ['movementSpeedPercent', 'increase'], ['pveDamagePercent', 'increase']],
  frenzy: [['atk', 'increase'], ['cdr', 'increase'], ['crit', 'increase'], ['pSkillPowerPercent', 'increase']],
  overwhelming_power: [['atk', 'increase'], ['cdr', 'increase'], ['crit', 'increase'], ['pSkillPowerPercent', 'increase']],
  zealot: [['cdr', 'increase'], ['crit', 'increase'], ['pSkillPowerPercent', 'increase']],
  pa_agrio_s_immunity: [['matk', 'increase'], ['def', 'increase'], ['crit', 'increase'], ['damageTakenReductionPercent', 'increase'], ['debuffResistancePercent', 'increase']],
  prophecy_of_pa_agrio: [['maxCp', 'increase'], ['movementSpeedPercent', 'increase'], ['cdr', 'increase'], ['crit', 'increase'], ['mSkillPowerPercent', 'increase']],
  chant_of_prophecy: [['cdr', 'increase'], ['movementSpeedPercent', 'increase'], ['crit', 'increase'], ['mSkillPowerPercent', 'increase']],
  weapon_reinforcement: [['atk', 'increase']],
  soul_reinforcement: [['maxHp', 'increase'], ['atk', 'increase'], ['pveDamagePercent', 'increase']],
  force_unleashed: [['maxHp', 'increase'], ['def', 'increase'], ['mdef', 'increase'], ['debuffResistancePercent', 'increase']],
  adamant_will: [['atk', 'increase'], ['pSkillPowerPercent', 'increase']],
  determination: [['atk', 'increase'], ['crit', 'increase'], ['def', 'increase'], ['debuffResistancePercent', 'increase']],
  seal_of_despair: [['atk', 'decrease'], ['cdr', 'decrease'], ['crit', 'decrease'], ['mdef', 'decrease']]
};
for (const [id, deltas] of Object.entries(sourcedBuffContracts)) {
  contracts[id] = {
    kind: 'buff', expectedDeltas: deltas.map(([stat, direction]) => ({ stat, direction })),
    consumer: ['exciting_adventure', 'wind_riding', 'song_of_earth', 'prophecy_of_wind'].includes(id) ? 'basic_attack_interval' : undefined,
    source: `L2Wiki Lineage II Essence ${id.replaceAll('_', ' ')}; unsupported multi-target and hit-counter mechanics are represented by the available solo-combat stats`
  };
}
contracts.freezing_skin = {
  kind: 'buff', expectedDeltas: [], reflectPercent: 0.03, expectedDurationMs: 20_000,
  source: 'L2Wiki Lineage II Essence Freezing Skin reflects 3% of received damage; verified through the production reflection consumer'
};
contracts.bison_spirit_totem = {
  kind: 'buff', expectedDeltas: [
    { stat: 'atk', direction: 'increase' }, { stat: 'cdr', direction: 'increase' },
    { stat: 'def', direction: 'increase' }, { stat: 'crit', direction: 'increase' }
  ], unchangedStats: ['atkSpd'],
  source: 'L2Wiki Lineage II Essence Bison Spirit Totem Lv. 1: P. Atk. +10%, Atk. Spd. +10%, P. Def. +5%, P. Skill Critical Rate +50; attack speed maps to cooldown reduction'
};
contracts.synchro_freedom = {
  kind: 'buff', expectedDeltas: [
    { stat: 'pSkillPowerPercent', direction: 'increase' }, { stat: 'maxHp', direction: 'increase' },
    { stat: 'debuffResistancePercent', direction: 'increase' }
  ], source: 'L2Wiki Lineage II Essence Synchro Freedom Lv. 1, adapted to the solo combat model'
};
contracts.elemental_mastership = {
  kind: 'buff', expectedDeltas: [
    { stat: 'matk', direction: 'increase' }, { stat: 'mSkillPowerPercent', direction: 'increase' },
    { stat: 'maxMp', direction: 'increase' }
  ], source: 'L2Wiki Lineage II Essence Elemental Mastership Lv. 1, adapted to a 20-second solo-combat buff'
};
contracts.soul_weapon = {
  kind: 'buff', expectedDeltas: [
    { stat: 'atk', direction: 'increase' }, { stat: 'crit', direction: 'increase' },
    { stat: 'pveDamagePercent', direction: 'increase' }
  ], source: 'L2Wiki Lineage II Essence Soul Weapon Lv. 1, adapted to the solo combat model'
};
contracts.flamenco = {
  kind: 'buff', expectedDeltas: [
    { stat: 'maxHp', direction: 'increase' }, { stat: 'atk', direction: 'increase' },
    { stat: 'def', direction: 'increase' }, { stat: 'mdef', direction: 'increase' },
    { stat: 'pveDamagePercent', direction: 'increase' }, { stat: 'cdr', direction: 'increase' }
  ], source: 'L2Wiki Lineage II Essence Flamenco Lv. 1 caster effects adapted to solo card combat'
};
contracts.ogre_s_essence = {
  kind: 'buff', expectedDeltas: [
    { stat: 'def', direction: 'increase' }, { stat: 'mdef', direction: 'increase' },
    { stat: 'damageTakenReductionPercent', direction: 'increase' }
  ], source: 'L2Wiki Lineage II Essence Ogre\'s Essence: +300 P./M. Def. and 5% less received damage for 10 seconds'
};
contracts.wondrous_power = {
  kind: 'buff', expectedDeltas: [
    { stat: 'def', direction: 'increase' }, { stat: 'mdef', direction: 'increase' },
    { stat: 'debuffResistancePercent', direction: 'increase' }
  ], source: 'L2Wiki Lineage II Essence Wondrous Power: +2000 P./M. Def. and 30% combat-debuff resistance for 15 seconds'
};
contracts.final_secret = {
  kind: 'buff', expectedDeltas: [
    { stat: 'pSkillPowerPercent', direction: 'increase' },
    { stat: 'damageTakenReductionPercent', direction: 'increase' }
  ], source: 'L2Wiki Lineage II Essence Final Secret: +10% physical skill power; unsupported bow/magic resistance becomes 10% incoming damage reduction for 30 seconds'
};
contracts.pa_agrio_s_cure = { kind: 'heal', expectedAmount: 1_800, source: 'L2Wiki Lineage II Essence Pa\'agrio\'s Cure Lv. 1: 600 HP plus an additional 1200 HP, adapted to one target; CP recovery is not modeled' };
contracts.giant_s_stomp = {
  kind: 'target_debuff', expectedDeltas: [{ stat: 'actionsDisabled', direction: 'increase' }],
  expectedDurationMs: 3_000, consumer: 'monster_action_lock',
  source: 'L2Wiki Lineage II Essence Giant\'s Stomp: three-second knockdown adapted to block target attacks and skills'
};
contracts.howling = {
  kind: 'buff', expectedDeltas: [{ stat: 'atk', direction: 'increase' }],
  source: 'L2Wiki Lineage II Essence Howling: P. Atk. +20%; Aden Arena adapts the 15 MP on-kill proc separately'
};
contracts.eliminate_obstruction = {
  kind: 'buff', expectedDeltas: [{ stat: 'debuffResistancePercent', direction: 'increase' }],
  source: 'L2Wiki Lineage II Essence Eliminate Obstruction: +10% Debuff/Anomaly Resistance; on-hit cleanse chance is adapted to this solo-combat resistance'
};
contracts.kingdom_of_plants = {
  kind: 'buff', expectedDeltas: [
    { stat: 'matk', direction: 'increase' }, { stat: 'crit', direction: 'increase' },
    { stat: 'pveDamagePercent', direction: 'increase' }, { stat: 'mpRegen', direction: 'increase' }
  ], source: 'L2Wiki Lineage II Essence Kingdom of Plants Lv. 1: +10% M. Atk., +5 shared critical chance, +10% PvE damage, and +10 MP recovery'
};
contracts.murder_attempt = {
  kind: 'target_debuff', expectedDeltas: [
    { stat: 'def', direction: 'decrease' }, { stat: 'mdef', direction: 'decrease' }
  ], expectedDurationMs: 10_000,
  source: 'L2Wiki Lineage II Essence Murder Attempt curse stacks to -10% P./M. Def.; Aden Arena applies its cap as a timed single-target curse'
};
contracts.focus_power = {
  kind: 'buff', expectedDeltas: [{ stat: 'atk', direction: 'increase' }],
  source: 'L2Wiki Lineage II Essence Focus Power: dagger damage +10%, adapted to physical attack while a dagger is equipped'
};
// Wind Walk is present in current class skill links but absent from the older
// generated inventory snapshot; keep its production movement contract explicit.
contracts.wind_walk = buffContract({ id: 'wind_walk', name: 'Wind Walk' });

const lines = [
  '// Explicit behavioral contracts. Never infer a successful effect from production metadata.',
  `export const EFFECT_CONTRACTS = Object.freeze(${JSON.stringify(contracts, null, 2)});`,
  '',
  'export function assessEffect(contract, evidence) {',
  '  if (!contract) return { status: "NOT_VALIDATED", pass: null, reason: "Independent effect contract missing", evidence };',
  '  if (evidence.preconditionsMet === false) return { status: "NOT_EXECUTED", pass: null, reason: "Effect was not evaluated because learning or execution preconditions failed", contract, evidence };',
  '  let pass = false;',
  '  const expectedDeltas = contract.expectedDeltas || (contract.stat ? [{ stat: contract.stat, direction: "increase" }] : []);',
  '  if (contract.kind === "buff" && (contract.unsupportedEffects?.length || (!expectedDeltas.length && !Number.isFinite(contract.reflectPercent)))) return { status: "NOT_VALIDATED", pass: null, reason: "Buff contains effects without a supported independent contract", contract, evidence };',
  '  if (contract.kind === "target_debuff" && (contract.unsupportedEffects?.length || !expectedDeltas.length)) return { status: "NOT_VALIDATED", pass: null, reason: "Target effect contains behavior without a supported independent contract", contract, evidence };',
  '  if (contract.kind === "damage_and_target_debuff" && (contract.unsupportedEffects?.length || !expectedDeltas.length)) return { status: "NOT_VALIDATED", pass: null, reason: "Combined damage and target effect lacks a complete independent contract", contract, evidence };',
  '  const deltasMatch = (before, after, expired, deltas) => deltas.every(({ stat, direction }) => { const start = before?.[stat], active = after?.[stat], end = expired?.[stat]; return Number.isFinite(start) && Number.isFinite(active) && (direction === "increase" ? active > start : active < start) && (expired == null || (Number.isFinite(end) && end === start)); });',
  '  const unchangedStatsMatch = (stats = []) => stats.every(stat => { const before = evidence.before?.[stat], after = evidence.after?.[stat], expired = evidence.expired?.[stat]; return Number.isFinite(before) && Number.isFinite(after) && Number.isFinite(expired) && before === after && before === expired; });',
  '  if (contract.kind === "passive") { const consumerPass = contract.consumer !== "basic_attack_interval" || (evidence.consumerProof?.baselineIntervalMs > evidence.consumerProof?.reducedIntervalMs && evidence.consumerProof?.productionConsumer === "main.resolvePlayerBasicAttackIntervalMs"); pass = expectedDeltas.length > 0 && deltasMatch(evidence.before, evidence.after, null, expectedDeltas) && consumerPass; }',
  '  if (contract.kind === "buff") { const consumerPass = contract.consumer === "basic_attack_interval" ? (evidence.consumerProof?.baselineIntervalMs > evidence.consumerProof?.reducedIntervalMs && evidence.consumerProof?.productionConsumer === "main.resolvePlayerBasicAttackIntervalMs") : contract.consumer === "chant_vampire_lifedrain" ? (evidence.consumerProof?.procDamage > 0 && evidence.consumerProof?.procHealing === Math.floor(evidence.consumerProof.procDamage * contract.lifeDrainProcPercent) && evidence.consumerProof?.controlDamage > 0 && evidence.consumerProof?.controlHealing === 0 && (!contract.requiresAttackInterval || evidence.consumerProof?.baselineIntervalMs > evidence.consumerProof?.reducedIntervalMs)) : Number.isFinite(contract.reflectPercent) ? (evidence.consumerProof?.receivedDamage > 0 && evidence.consumerProof?.reflectedDamage === Math.floor(evidence.consumerProof.receivedDamage * contract.reflectPercent) && evidence.consumerProof?.productionConsumer === "main.monsterAttack -> resolvePlayerDamageReflection") : true; const healPass = !Number.isFinite(contract.healPercent) || evidence.healAmount === Math.min(evidence.maxHp - evidence.hpBefore, Math.floor(evidence.maxHp * contract.healPercent)); const durationPass = !Number.isFinite(contract.expectedDurationMs) || Math.abs(evidence.expiresInMs - contract.expectedDurationMs) <= 100; pass = evidence.applied === true && evidence.expiresInMs > 0 && durationPass && deltasMatch(evidence.before, evidence.after, evidence.expired, expectedDeltas) && unchangedStatsMatch(contract.unchangedStats) && consumerPass && healPass; }',
  '  if (contract.kind === "target_debuff") { const proof = evidence.consumerProof; const consumerPass = contract.consumer === "monster_action_lock" ? (proof?.basicDamageBefore > 0 && proof.basicDamageWhileDisabled === 0 && proof.basicDamageAfterExpiry > 0 && proof.skillDamageBefore > 0 && proof.skillDamageWhileDisabled === 0 && proof.skillDamageAfterExpiry > 0 && proof.skillCooldownWhileDisabled === 0) : contract.consumer === "monster_speed_slow" ? (proof?.basicAttackSpeedBefore > proof.basicAttackSpeedAfter && proof?.skillCooldownBefore > 0 && proof.skillCooldownAfter > proof.skillCooldownBefore && proof?.productionConsumer === "main.monsterAttack") : contract.consumer === "monster_movement_slow" ? (proof?.basicAttackIntervalAfter > proof?.basicAttackIntervalBefore && proof?.skillCooldownBefore === proof?.skillCooldownAfter && proof?.productionConsumer === "main.attackMonster.enemyAttackInterval") : true; const hpCostPass = !Number.isFinite(contract.hpCostPercent) || (evidence.hpBefore > Math.floor(evidence.maxHp * contract.hpCostPercent) && evidence.hpBefore - evidence.hpAfter === Math.floor(evidence.maxHp * contract.hpCostPercent)); pass = evidence.applied === true && evidence.expiresInMs > 0 && (!Number.isFinite(contract.expectedDurationMs) || Math.abs(evidence.expiresInMs - contract.expectedDurationMs) <= 100) && deltasMatch(evidence.before, evidence.after, evidence.expired, expectedDeltas) && consumerPass && hpCostPass; }',
  '  if (contract.kind === "damage_and_target_debuff") {',
  '    const damage = (evidence.events || []).filter(event => event.skillId === evidence.skillId).reduce((sum, event) => sum + (Number(event.damage) || 0), 0);',
  '    pass = evidence.cast === true && evidence.applied === true && evidence.expiresInMs > 0 && deltasMatch(evidence.before, evidence.after, evidence.expired, expectedDeltas) && damage > 0 && evidence.hpBefore - evidence.hpAfter === damage;',
  '  }',
  '  if (contract.kind === "damage") {',
  '    const damage = (evidence.events || []).filter(e => e.skillId === evidence.skillId).reduce((n, e) => n + (e.damage || 0), 0);',
  '    pass = damage > 0 && evidence.hpBefore - evidence.hpAfter === damage;',
  '  }',
  '  if (contract.kind === "damage_reflection") pass = evidence.applied === true && evidence.expiresInMs > 0 && Number.isFinite(evidence.receivedDamage) && evidence.receivedDamage > 0 && evidence.reflectedDamage === Math.floor(evidence.receivedDamage * contract.reflectPercent);',
  '  if (contract.kind === "heal") {',
  '    const healed = evidence.hpAfter - evidence.hpBefore;',
  '    const expected = Number.isFinite(contract.expectedAmount) ? Math.min(contract.expectedAmount, Math.max(0, evidence.maxHp - evidence.hpBefore)) : null;',
  '    pass = evidence.cast === true && healed > 0 && evidence.hpAfter <= evidence.maxHp && (expected === null || healed === expected);',
  '  }',
  '  if (contract.kind === "heal_and_cleanse") {',
  '    const healed = evidence.hpAfter - evidence.hpBefore;',
  '    pass = evidence.cast === true && evidence.healPower === contract.power && healed > 0 && healed === evidence.expectedHeal && evidence.hpAfter <= evidence.maxHp && Array.isArray(evidence.cleansedDebuffs) && evidence.cleansedDebuffs.length > 0;',
  '  }',
  '  if (contract.kind === "sacrifice_heal") {',
  '    const hpCost = Math.floor(evidence.maxHp * contract.hpCostPercent);',
  '    const expectedAfter = Math.min(evidence.maxHp, evidence.hpBefore - hpCost + evidence.expectedHeal);',
  '    pass = evidence.cast === true && evidence.healPower === contract.power && evidence.hpCost === hpCost && evidence.hpBefore > hpCost && evidence.hpAfter === expectedAfter && evidence.hpAfter > evidence.hpBefore && evidence.hpAfter <= evidence.maxHp;',
  '  }',
  '  return { status: pass ? "PASS" : "FAIL", pass, contract, evidence };',
  '}',
  '',
  'export function assessEffectCoverage(observedSkillIds, contracts) {',
  '  const unique = [...new Set(observedSkillIds)];',
  '  const unmappedSkills = unique.filter(id => !contracts[id]);',
  '  const unimplementedSkills = unique.filter(id => contracts[id]?.kind === "defined_not_implemented" || contracts[id]?.kind === "unimplemented");',
  '  const implementedContracts = unique.filter(id => contracts[id] && !unmappedSkills.includes(id) && !unimplementedSkills.includes(id)).length;',
  '  const contractsConfigured = unique.length - unmappedSkills.length;',
  '  return { totalUniqueSkills: unique.length, contractsConfigured, implementedContracts, unmappedSkills, unimplementedSkills, pass: unique.length > 0 && !unmappedSkills.length && !unimplementedSkills.length };',
  '}',
  '',
  'export function summarizeAudit(classes, proofs, requiredCoverage = []) {',
  '  const checks = [...classes.flatMap(c => [...(c.checks || []), ...(c.skills || []).flatMap(s => [...(s.checks || []), s.effect].filter(Boolean))]), ...proofs];',
  '  const failed = checks.filter(c => c.pass === false);',
  '  const missing = checks.filter(c => c.pass === null || c.status === "NOT_VALIDATED");',
  '  const blocked = classes.filter(c => c.contentStatus?.startsWith("BLOCKED"));',
  '  const completeCoverage = requiredCoverage.length > 0 && requiredCoverage.every(c => c.executed === true && c.pass === true);',
  '  return {',
  '    overallStatus: failed.length ? "FAIL" : (blocked.length || missing.length || !completeCoverage ? "APPROVAL_BLOCKED" : "PASS"),',
  '    classCount: classes.length, skillCaseCount: classes.reduce((n, c) => n + (c.skills?.length || 0), 0),',
  '    failedAssertions: failed.length, unvalidatedAssertions: missing.length,',
  '    contentBlockedClassIds: blocked.map(c => c.classId), requiredCoverage,',
  '  };',
  '}',
  ''
];

const generatedContractBlock = `export const EFFECT_CONTRACTS = Object.freeze(${JSON.stringify(contracts, null, 2)});`;
if (fs.existsSync(targetFile)) {
  const current = fs.readFileSync(targetFile, 'utf8');
  const contractAndEvaluator = /export const EFFECT_CONTRACTS = Object\.freeze\([\s\S]*?\);\r?\n\r?\nexport function assessEffect/;
  if (!contractAndEvaluator.test(current)) throw new Error('Could not locate the contract block without overwriting the independent effect evaluator.');
  writeGeneratedFile(current.replace(contractAndEvaluator, `${generatedContractBlock}\n\nexport function assessEffect`));
} else {
  writeGeneratedFile(lines.join('\n'));
}
console.log(`Generated ${targetFile} with ${Object.keys(contracts).length} contracts`);
