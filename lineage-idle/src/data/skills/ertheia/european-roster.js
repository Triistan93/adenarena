/**
 * Ertheia abilities transcribed from the European Inn.games Ertheia patch notes.
 * Retail numeric power values are deliberately not copied into Aden Arena's
 * card-combat balance. `effectStats` and `targetStats` are local adaptations.
 */
export const ERTHEIA_SOURCE_URL = 'https://eu.4gameforum.com/threads/23847/';

const STAGE = Object.freeze({
  marauderBase: [1, 19], marauder: [20, 39], ertheiaWarrior: [40, 75], eviscerator: [76, 120],
  sayhaMageBase: [1, 19], sayhaSeer: [20, 39], windRiderErth: [40, 75], sayhaSeeker: [76, 120]
});

const RAW = [
  // Ertheia Fighter — European notes, class skills table.
  ['marauderBase','eminent_light_armor_mastery','Eminent Light Armor Mastery','passive',0,{pDefPercent:0.12,mDefPercent:0.05,eva:8,debuffResistancePercent:0.05},null,0,'light'],
  ['marauderBase','eminent_fist_weapon_mastery','Eminent Fist Weapon Mastery','passive',0,{pAtkPercent:0.15,cdr:0.10,crit:12,critDmgPercent:0.10,pAccuracy:4},null,0,'fist'],
  ['marauderBase','eminent_stability','Eminent Stability','passive',0,{maxHpPercent:0.08,maxCpPercent:0.05,mpRegen:3},null,0,null],
  ['marauderBase','lateral_hit','Lateral Hit','active',26,{}, {damageTakenPercent:0.08,pDefPercent:-0.08},6000,'fist'],
  ['marauderBase','right_sidestep','Right Sidestep','active',12,{}, {pDefPercent:-0.08},5000,'fist'],
  ['marauderBase','backspin_blow','Backspin Blow','active',38,{},null,0,'fist'],
  // Marauder.
  ['marauder','eminent_ability_marauder','Eminent Ability','passive',0,{pAtkPercent:0.08,cdr:0.05},null,0,null],
  ['marauder','eminent_attack_movement','Eminent Attack Movement','passive',0,{movementSpeedPercent:0.05},null,0,null],
  ['marauder','air_light','Air Light','buff',0,{pAtkPercent:0.12,debuffResistancePercent:0.10},null,20000,'fist'],
  ['marauder','fluid_weave','Fluid Weave','buff',0,{pSkillEvasionPercent:0.20,eva:10,mSkillEvasionPercent:0.10},null,3000,'fist'],
  ['marauder','left_sidestep','Left Sidestep','active',20,{}, {actionsDisabled:1},4000,'fist'],
  ['marauder','chin_strike','Chin Strike','active',22,{}, {actionsDisabled:1},3000,'fist'],
  // Ripper.
  ['ertheiaWarrior','eminent_trait_resistance_ripper','Eminent Trait Resistance','passive',0,{debuffResistancePercent:0.20},null,0,null],
  ['ertheiaWarrior','eminent_attribute_resistance_ripper','Eminent Attribute Resistance','passive',0,{debuffResistancePercent:0.08},null,0,null],
  ['ertheiaWarrior','heavy_punch','Heavy Punch','active',45,{damageTakenReductionPercent:0.05},null,6000,'fist'],
  ['ertheiaWarrior','crushing_air','Crushing Air','active',18,{}, {pAtkPercent:-0.10,mAtkPercent:-0.10},6000,'fist'],
  ['ertheiaWarrior','back_step','Back Step','active',18,{healPercent:0.10}, {actionsDisabled:1},3000,'fist'],
  ['ertheiaWarrior','distortion','Distortion','buff',0,{pSkillPowerPercent:0.10},null,12000,'fist'],
  ['ertheiaWarrior','gravity_hit','Gravity Hit','active',48,{}, {pDefPercent:-0.12},5000,'fist'],
  ['ertheiaWarrior','distant_kick','Distant Kick','active',30,{}, {actionsDisabled:1},2000,'fist'],
  // Eviscerator.
  ['eviscerator','reverse_weight','Reverse Weight','active',34,{}, {actionsDisabled:1},2500,'fist'],
  ['eviscerator','heavy_hand','Heavy Hand','active',10,{}, {movementSpeedPercent:-0.25},5000,'fist'],
  ['eviscerator','steel_mind','Steel Mind','buff',0,{pAtkPercent:0.15,critDmgPercent:0.10,damageTakenReductionPercent:0.15,debuffResistancePercent:0.20,cdr:0.08},null,15000,'fist'],
  ['eviscerator','pressure_punch','Pressure Punch','active',42,{}, {movementSpeedPercent:-0.15},3000,'fist'],
  ['eviscerator','gravity_barrier','Gravity Barrier','buff',0,{damageTakenReductionPercent:0.40,debuffResistancePercent:1},null,5000,'fist'],
  ['eviscerator','warped_space','Warped Space','active',16,{}, {actionsDisabled:1,pAtkPercent:-0.10,mAtkPercent:-0.10},3000,'fist'],
  ['eviscerator','spallation','Spallation','buff',0,{damageTakenReductionPercent:0.15},null,10000,'fist'],
  ['eviscerator','spinning_kick','Spinning Kick','active',50,{}, {pDefPercent:-0.10},0,'fist'],
  ['eviscerator','summon_eviscerator_fox','Summon Eviscerator Fox','buff',0,{pveDamagePercent:0.05},null,20000,null],
  // Ertheia Wizard.
  ['sayhaMageBase','hydro_attack','Hydro Attack','active',26,{}, {damageTakenPercent:0.05},0,'blunt'],
  ['sayhaMageBase','hydro_flare','Hydro Flare','active',38,{}, {damageTakenPercent:0.08},0,'blunt'],
  ['sayhaMageBase','wind_blend','Wind Blend','buff',0,{damageTakenReductionPercent:0.12,movementSpeedPercent:0.10},null,6000,'blunt'],
  ['sayhaMageBase','eminent_blunt_weapon_mastery','Eminent Blunt Weapon Mastery','passive',0,{mAtkPercent:0.15,cdr:0.12,crit:8,critDmgPercent:0.08},null,0,'blunt'],
  ['sayhaMageBase','eminent_robe_mastery','Eminent Robe Mastery','passive',0,{pDefPercent:0.10,mDefPercent:0.10,mSkillEvasionPercent:0.15},null,0,'robe'],
  ['sayhaMageBase','eminent_quick_recovery','Eminent Quick Recovery','passive',0,{maxHpPercent:0.08,maxMpPercent:0.08,mSkillCdr:0.15,mSkillMpCostReduction:0.05},null,0,null],
  // Cloud Breaker.
  ['sayhaSeer','hydro_strike','Hydro Strike','active',36,{}, {actionsDisabled:1},3500,'blunt'],
  ['sayhaSeer','air_rush','Air Rush','active',36,{}, {actionsDisabled:1,damageTakenPercent:0.08},2500,'blunt'],
  ['sayhaSeer','eye_of_the_storm','Eye of the Storm','buff',0,{crit:12,pDefPercent:0.10,mDefPercent:0.10,mSkillMpCostReduction:0.20,debuffResistancePercent:0.15},null,15000,null],
  ['sayhaSeer','squall','Squall','buff',0,{damageTakenReductionPercent:0.10,movementSpeedPercent:0.05},null,15000,null],
  ['sayhaSeer','eminent_ability_cloud_breaker','Eminent Ability','passive',0,{mAtkPercent:0.08,cdr:0.05},null,0,null],
  // Stratomancer.
  ['windRiderErth','hydro_drain','Hydro Drain','active',34,{healPercent:0.08,mpRecoveryPercent:0.04},{damageTakenPercent:0.05},0,'blunt'],
  ['windRiderErth','mass_compelling_wind','Mass Compelling Wind','active',12,{}, {actionsDisabled:1},3000,'blunt'],
  ['windRiderErth','threatening_wind','Threatening Wind','active',16,{}, {pDefPercent:-0.08,mDefPercent:-0.08},5000,'blunt'],
  ['windRiderErth','deceptive_blink','Deceptive Blink','buff',0,{movementSpeedPercent:0.10,damageTakenReductionPercent:0.08},null,5000,'blunt'],
  ['windRiderErth','eminent_attribute_resistance_stratomancer','Eminent Attribute Resistance','passive',0,{debuffResistancePercent:0.08},null,0,null],
  ['windRiderErth','eminent_trait_resistance_stratomancer','Eminent Trait Resistance','passive',0,{debuffResistancePercent:0.20},null,0,null],
  // Sayha's Seer.
  ['sayhaSeeker','sayhas_seer_aura',"Sayha's Seer Aura",'buff',0,{mSkillPowerPercent:0.05},null,20000,null],
  ['sayhaSeeker','magic_potential','Magic Potential','passive',0,{crit:5},null,0,null],
  ['sayhaSeeker','sayhas_word',"Sayha's Word",'active',42,{}, {atkSpdPercent:-0.20,cooldownPercent:0.20,movementSpeedPercent:-0.20,damageTakenPercent:0.08},5000,'blunt'],
  ['sayhaSeeker','divine_storm','Divine Storm','active',34,{}, {actionsDisabled:1},3500,'blunt'],
  ['sayhaSeeker','sayhas_fury',"Sayha's Fury",'buff',0,{damageTakenReductionPercent:0.15,movementSpeedPercent:0.08},null,15000,'blunt'],
  ['sayhaSeeker','sayhas_blessing',"Sayha's Blessing",'buff',0,{movementSpeedPercent:0.08,debuffResistancePercent:0.15},null,20000,'blunt'],
  ['sayhaSeeker','storm_rage','Storm Rage','active',30,{}, {actionsDisabled:1},1800,'blunt'],
  ['sayhaSeeker','windy_refuge','Windy Refuge','buff',0,{healPercent:0.12,mpRecoveryPercent:0.08},null,10000,null],
  ['sayhaSeeker','switch_places','Switch Places','active',20,{}, {damageTakenPercent:0.08},5000,'blunt'],
  ['sayhaSeeker','wind_illusion','Wind Illusion','buff',0,{damageTakenReductionPercent:0.15},null,8000,null],
  ['sayhaSeeker','summon_sayhas_seer_fox',"Summon Sayha's Seer Fox",'buff',0,{mSkillPowerPercent:0.05,pveDamagePercent:0.05},null,20000,null]
];

function evenlySpacedLevel(classId, index, count) {
  const [start, end] = STAGE[classId];
  return count <= 1 ? start : start + Math.floor(index * (end - start) / (count - 1));
}

const grouped = new Map();
for (const row of RAW) {
  const [classId] = row;
  const entries = grouped.get(classId) || [];
  entries.push(row);
  grouped.set(classId, entries);
}

export const EUROPEAN_ERTHEIA_SKILLS = Object.freeze(Object.fromEntries(
  [...grouped.entries()].flatMap(([classId, rows]) => rows.map((row, index) => {
    const [, id, name, type, pwr, effectStats, targetStats, durationMs, requiredWeapon] = row;
    const minLevel = evenlySpacedLevel(classId, index, rows.length);
    return [id, Object.freeze({
      id, name, slug: id, type, rawType: type, rarity: `${Math.min(4, Math.max(1, Math.ceil(minLevel / 25)))}★`,
      starRank: Math.min(4, Math.max(1, Math.ceil(minLevel / 25))), source: 'adenarena-local-adaptation',
      officialSource: 'european-patch-notes', sourceUrl: ERTHEIA_SOURCE_URL, sourceSection: 'Ertheia Skills table (effects shown at maximum rank)',
      localEffectNote: 'Aden Arena single-target card-combat adaptation; retail power values and party/teleport mechanics are not copied.',
      canonicalEffect: `Aden Arena adaptation of ${name}.`, desc: `Aden Arena adaptation of ${name}.`,
      canonicalCooldown: type === 'passive' ? 'N/A' : type === 'buff' ? '30 sec.' : '6 sec.',
      canonicalCooldownMs: type === 'passive' ? 0 : type === 'buff' ? 30000 : 6000,
      icon: null, iconGap: true, iconGapReason: 'European Ertheia skill; no verified matching icon is registered locally.',
      vfxId: null, vfxGap: true, sfxId: null, sfxGap: true,
      minLevel, classes: Object.freeze([classId]), requiredWeapon,
      effectStats: Object.freeze({ ...effectStats }), targetStats: targetStats ? Object.freeze({ ...targetStats }) : null,
      targetDurationMs: targetStats && durationMs ? durationMs : null,
      effectDurationMs: type === 'buff' && durationMs ? durationMs : null,
      balance: Object.freeze({ mpCost: type === 'passive' ? 0 : pwr > 35 ? 24 : 14, pwr, pveMultiplier: 1, pvpMultiplier: 0.85 })
    })];
  }))
));

export const EUROPEAN_ERTHEIA_ROSTER = Object.freeze(Object.fromEntries(
  [...grouped.entries()].map(([classId, rows]) => [classId, Object.freeze(rows.map(row => row[1]))])
));
