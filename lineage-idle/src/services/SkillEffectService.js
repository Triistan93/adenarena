const KNOWN_BUFF_EFFECTS = Object.freeze({
  // L2Wiki Warg moon blessings: speed bonuses shorten card cooldowns and the
  // source's flat movement-speed bonus is adapted to basic-attack cadence.
  young_moon_s_grace: Object.freeze({ maxHpPercent: 0.03, maxMpPercent: 0.03, pAtkPercent: 0.02, mAtkPercent: 0.02, pDefPercent: 0.02, mDefPercent: 0.02, atkSpdPercent: 0.02, movementSpeedPercent: 0.03, pAccuracy: 1, mAccuracy: 1 }),
  moon_s_grace: Object.freeze({ maxHpPercent: 0.05, maxMpPercent: 0.05, pAtkPercent: 0.02, mAtkPercent: 0.02, pDefPercent: 0.02, mDefPercent: 0.02, atkSpdPercent: 0.03, movementSpeedPercent: 0.04, pAccuracy: 1, mAccuracy: 1 }),
  full_moon_s_grace: Object.freeze({ maxHpPercent: 0.07, maxMpPercent: 0.07, pAtkPercent: 0.03, mAtkPercent: 0.03, pDefPercent: 0.03, mDefPercent: 0.03, atkSpdPercent: 0.05, movementSpeedPercent: 0.05, pAccuracy: 2, mAccuracy: 2 }),
  // Local ShineMaker skills are adapted to the single-hero card-combat loop.
  shinemakerbase_luminary_glow: Object.freeze({ mAtkPercent: 0.15, pDefPercent: 0.10 }),
  shinemakerbase_shinemakers_harmony: Object.freeze({ mAtkPercent: 0.20, pDefPercent: 0.20 }),
  shinemakers1_shining_barrier: Object.freeze({ pDefPercent: 0.15, mDefPercent: 0.15 }),
  shinemakers2_light_of_creation: Object.freeze({ mAtkPercent: 0.25, mSkillPowerPercent: 0.10 }),
  shinemakers2_brilliant_aura: Object.freeze({ pAtkPercent: 0.10, mAtkPercent: 0.10, pDefPercent: 0.10, mDefPercent: 0.10 }),
  shinemakers2_shinemaker_harmony_s2: Object.freeze({ mAtkPercent: 0.35, mDefPercent: 0.20, mSkillPowerPercent: 0.10 }),
  shinemaker_shinemakers_ultimate_harmony: Object.freeze({ mAtkPercent: 0.30, pDefPercent: 0.20, cdr: 0.10 }),
  shinemaker_divine_crystal_aegis: Object.freeze({ damageTakenReductionPercent: 0.35 }),
  // The project maps cast speed to cooldown reduction by design.
  // The servitor has no independent action loop; its documented extra attack
  // becomes a short, modest PvE damage window for its owner.
  dark_panther_s_help: Object.freeze({ pveDamagePercent: 0.05 }),
  // Preserve Unleashed Power's physical-skill focus and adapt its unsupported
  // shock proc into a modest status-resistance bonus for card combat.
  unleashed_power: Object.freeze({ damageTakenReductionPercent: 0.03, debuffResistancePercent: 0.05, pSkillPowerPercent: 0.01 }),
  acumen: Object.freeze({ cdr: 0.15 }),
  // Aden Arena maps Haste's speed bonus to skill cooldown reduction.
  haste: Object.freeze({ cdr: 0.15 }),
  chant_of_haste: Object.freeze({ cdr: 0.15 }),
  elemental_haste: Object.freeze({ cdr: 0.15 }),
  // The level-76 Essence variants grant +35% attack speed and +33% casting speed.
  maphr_s_haste: Object.freeze({ cdr: 0.35 }),
  soul_haste: Object.freeze({ cdr: 0.35 }),
  chant_of_acumen: Object.freeze({ cdr: 0.15 }),
  // L2Wiki Pa'agrio's Glory Lv. 3: M. Atk. +100/+34%, P./M. Def. +100/+29%/+34%,
  // and M. Skill Cooldown -15%. The game scales its 20-minute source to 20 seconds.
  pa_agrio_s_glory: Object.freeze({ matk: 100, mAtkPercent: 0.34, def: 100, pDefPercent: 0.29, mdef: 100, mDefPercent: 0.34, mSkillCdr: 0.15 }),
  // L2Wiki Chant of Glory shares Pa'agrio's Glory's attack/defense bonuses;
  // the solo-game adaptation also retains its magic-skill power and MP economy.
  chant_of_glory: Object.freeze({ matk: 100, mAtkPercent: 0.34, def: 100, pDefPercent: 0.29, mdef: 100, mDefPercent: 0.34, mSkillCdr: 0.15, mSkillPowerPercent: 0.05, maxMpFlat: 300, mSkillMpCostReduction: 0.15 }),
  maphr_s_acumen: Object.freeze({ cdr: 0.33 }),
  soul_acumen: Object.freeze({ cdr: 0.33 }),
  // L2Wiki class buffs adapted to 20-second solo-combat windows. Attack speed
  // contributes cooldown reduction; unsupported party-only effects are omitted.
  bison_spirit_totem: Object.freeze({ pAtkPercent: 0.10, cdr: 0.10, pDefPercent: 0.05, crit: 50 }),
  synchro_freedom: Object.freeze({ pSkillPowerPercent: 0.02, maxHpFlat: 1_500, debuffResistancePercent: 0.30 }),
  elemental_mastership: Object.freeze({ matk: 500, mSkillPowerPercent: 0.15, maxMpPercent: 0.20 }),
  soul_weapon: Object.freeze({ pAtkPercent: 0.20, crit: 10, pveDamagePercent: 0.05 }),
  // Sword Symphony keeps its direct offense/defense bonuses. The source's
  // weapon-specific proc effects have no matching sword-buff runtime here.
  sword_symphony: Object.freeze({ pAtkPercent: 0.10, pveDamagePercent: 0.10, damageTakenReductionPercent: 0.10 }),
  // Bleeding Rose's offensive effects map to the modeled magical stats; its
  // skill-replacement range changes are not part of this combat simulator.
  bleeding_rose: Object.freeze({ mAtkPercent: 0.05, crit: 5, mSkillPowerPercent: 0.05, pveDamagePercent: 0.10 }),
  // Crimson Rose Lv. 2 adds stronger magic offense and sustained MP recovery.
  crimson_rose: Object.freeze({ mAtkPercent: 0.10, crit: 5, mSkillPowerPercent: 0.02, pveDamagePercent: 0.05, mpRegen: 10 }),
  tenacity: Object.freeze({ debuffResistancePercent: 0.10, hitHealProcChance: 0.20, hitHealProcPercent: 0.05, hitHealProcCooldownMs: 5_000 }),
  atsumori: Object.freeze({ maxHpPercent: 0.15, mpRegen: 5, atk: 300, pAtkPercent: 0.08, pSkillMpCostReduction: 0.15, pSkillCdr: 0.01 }),
  sacral_power: Object.freeze({ pAtkPercent: 0.20, crit: 5, movementSpeedPercent: 0.20 }),
  collect_shadow_souls: Object.freeze({ pSkillPowerPercent: 0.05 }),
  collect_light_souls: Object.freeze({ mSkillPowerPercent: 0.05, mSkillCdr: 0.05 }),
  fragarach: Object.freeze({ reflectDamagePercent: 0.10, debuffResistancePercent: 0.10 }),
  increase_power: Object.freeze({ pAtkPercent: 0.20, mAtkPercent: 0.20, shockAttackRatePercent: 0.20 }),
  light_counter: Object.freeze({ reflectDamagePercent: 0.15 }),
  mechanical_masterpiece: Object.freeze({ pveDamagePercent: 0.05, mechanicalMasterpieceProcChance: 0.15, mechanicalMasterpieceExtraDamagePercent: 0.20 }),
  knight_s_protection: Object.freeze({ maxHpFlat: 1_800, shieldDefPercent: 0.30 }),
  exciting_adventure: Object.freeze({ atk: 300, movementSpeedPercent: 0.30, eva: 20, crit: 25, pSkillEvasionPercent: 0.60, buffCancelResistancePercent: 0.90, debuffResistancePercent: 0.20 }),
  wind_riding: Object.freeze({ atk: 300, movementSpeedPercent: 0.30, eva: 20, crit: 25, pSkillEvasionPercent: 0.60, buffCancelResistancePercent: 0.90, debuffResistancePercent: 0.20 }),
  snipe: Object.freeze({ pAccuracy: 6, atk: 300, crit: 20, movementSpeedPercent: -0.05 }),
  legendary_archer: Object.freeze({ maxHpPercent: 0.20, atk: 3_000, pAtkPercent: 0.30, crit: 20, pSkillPowerPercent: 0.05, pveDamagePercent: 0.10, damageTakenReductionPercent: 0.02 }),
  battle_training: Object.freeze({ atk: 30, cdr: 0.10 }),
  life_magic_harmony_defense: Object.freeze({ def: 100, mdef: 100, maxHpFlat: 100, mpRegen: 5 }),
  song_of_earth: Object.freeze({ atk: 500, def: 500, mdef: 500, crit: 5, movementSpeedPercent: 0.15, pSkillPowerPercent: 0.05 }),
  song_of_cosmos: Object.freeze({ pAtkPercent: 0.10, crit: 5, pSkillPowerPercent: 0.10, pveDamagePercent: 0.10 }),
  evasion: Object.freeze({ pSkillEvasionPercent: 0.50, mSkillEvasionPercent: 0.50 }),
  rapid_fire: Object.freeze({ atk: 250, cdr: 0.20 }),
  freezing_skin: Object.freeze({ reflectDamagePercent: 0.03 }),
  prophecy_of_water: Object.freeze({ mAtkPercent: 0.05, cdr: 0.10, pDefPercent: 0.10, mDefPercent: 0.10, maxMpPercent: 0.15, mpRegen: 10 }),
  enlightenment: Object.freeze({ mAtkPercent: 0.10, cdr: 0.30, crit: 50, mSkillPowerPercent: 0.10, healingReceivedPercent: 0.20 }),
  dance_of_warrior: Object.freeze({ atk: 150, def: 50, mdef: 50, pSkillPowerPercent: 0.01, cdr: 0.10 }),
  dead_eye: Object.freeze({ pAccuracy: 1, atk: 140, critDmgPercent: 0.20, cdr: -0.05 }),
  prophecy_of_wind: Object.freeze({ crit: 15, mSkillPowerPercent: 0.25, movementSpeedPercent: 0.10, pveDamagePercent: 0.10 }),
  frenzy: Object.freeze({ pAtkPercent: 0.09, cdr: 0.08, crit: 5, pSkillPowerPercent: 0.05 }),
  overwhelming_power: Object.freeze({ pAtkPercent: 0.35, atk: 300, cdr: 0.30, crit: 10, pSkillPowerPercent: 0.10 }),
  zealot: Object.freeze({ cdr: 0.10, crit: 22, pSkillPowerPercent: 0.05 }),
  pa_agrio_s_immunity: Object.freeze({ matk: 100, def: 300, crit: 1, damageTakenReductionPercent: 0.10, debuffResistancePercent: 0.10 }),
  prophecy_of_pa_agrio: Object.freeze({ maxCpPercent: 0.20, movementSpeedPercent: 0.12, cdr: 0.10, crit: 15, mSkillPowerPercent: 0.10 }),
  chant_of_prophecy: Object.freeze({ cdr: 0.10, movementSpeedPercent: 0.02, crit: 15, mSkillPowerPercent: 0.15 }),
  weapon_reinforcement: Object.freeze({ pAtkPercent: 0.12 }),
  soul_reinforcement: Object.freeze({ maxHpPercent: 0.30, atk: 1_500, pveDamagePercent: 0.10 }),
  force_unleashed: Object.freeze({ maxHpFlat: 1_200, def: 1_000, mdef: 1_000, debuffResistancePercent: 0.15 }),
  adamant_will: Object.freeze({ pAtkPercent: 0.20, pSkillPowerPercent: 0.10 }),
  determination: Object.freeze({ pAtkPercent: 0.05, crit: 5, def: 5_000, debuffResistancePercent: 0.15 }),
  seal_of_despair: Object.freeze({ pAtkPercent: -0.10, cdr: -0.30, crit: -30, mDefPercent: -0.10 }),
  // Reflecting Illusion restores half of Max HP, then grants a short ward;
  // the specialized magic-counter reduction is represented as general damage mitigation.
  reflecting_illusion: Object.freeze({ def: 3_000, mdef: 3_000, debuffResistancePercent: 0.15, damageTakenReductionPercent: 0.10, reflectDamagePercent: 0.10 }),
  // Soul Blade's documented physical attack, skill critical and skill power bonuses.
  soul_blade: Object.freeze({ pAtkPercent: 0.30, crit: 15, pSkillPowerPercent: 0.10 }),
  // Prime Master is compressed from its very large siege-era HP values into a
  // short PvE card-combat stance; shock pressure becomes status resistance.
  prime_master: Object.freeze({ maxHpPercent: 0.15, pAtkPercent: 0.10, crit: 10, pSkillPowerPercent: 0.10, debuffResistancePercent: 0.10 }),
  // Powerful Rush keeps its offensive bonuses; the source Speed bonus improves
  // basic-attack cadence, while attack speed always maps to skill cooldown here.
  powerful_rush: Object.freeze({ pAtkPercent: 0.40, pveDamagePercent: 0.17, movementSpeedPercent: 0.10 }),
  flamenco: Object.freeze({ maxHpFlat: 1_000, atk: 1_000, def: 1_000, mdef: 1_000, pveDamagePercent: 0.10, cdr: 0.15 }),
  ogre_s_essence: Object.freeze({ def: 300, mdef: 300, damageTakenReductionPercent: 0.05 }),
  wondrous_power: Object.freeze({ def: 2_000, mdef: 2_000, debuffResistancePercent: 0.30 }),
  final_secret: Object.freeze({ pSkillPowerPercent: 0.10, damageTakenReductionPercent: 0.10 }),
  howling: Object.freeze({ pAtkPercent: 0.20 }),
  eliminate_obstruction: Object.freeze({ debuffResistancePercent: 0.10 }),
  kingdom_of_plants: Object.freeze({ mAtkPercent: 0.10, crit: 5, pveDamagePercent: 0.10, mpRegen: 10 }),
  focus_power: Object.freeze({ pAtkPercent: 0.10 }),
  // NC's Essence skill table lists Speed +2, +10% debuff/mez resistance,
  // and an 80% chance to absorb 7% of damage dealt. Speed improves basic-attack
  // cadence in card combat; the chance remains a proc.
  chant_of_vampire: Object.freeze({ movementSpeedPercent: 0.02, debuffResistancePercent: 0.10, lifeDrainProcChance: 0.80, lifeDrainProcPercent: 0.07 }),
  // Movement speed affects the time between basic attacks in card combat;
  // it remains separate from attack/casting speed, which maps to skill CDR.
  wind_walk: Object.freeze({ movementSpeedPercent: 0.05 }),
  elemental_wind_walk: Object.freeze({ movementSpeedPercent: 0.05 }),
  // Elemental Magic Barrier is the Sylph's magic-protection buff. Its source
  // record omits values, so Aden Arena gives it a brief, measured M.Def. and
  // debuff-resistance window rather than claiming unsupported L2 numbers.
  elemental_magic_barrier: Object.freeze({ mDefPercent: 0.15, debuffResistancePercent: 0.10 }),
  // Local Elemental Insight is an active level-40 class skill, distinct from
  // the passive Light-Armor skill with this name in later Essence notes. This
  // Aden Arena caster adaptation adds modest M. Atk. and magic-skill CDR.
  elemental_insight: Object.freeze({ mAtkPercent: 0.10, mSkillCdr: 0.05 }),
  // Essence documents Soul Wind Walk as Speed +35; adapt movement to basic
  // attack cadence, not skill cooldown, in this card-combat runtime.
  soul_wind_walk: Object.freeze({ movementSpeedPercent: 0.06 }),
  // The older official Sylph notes describe Elemental Wind as speed plus
  // suppression/hold immunity. Blessing of Winds adapts movement to basic
  // cadence and retains the status-resistance role in card combat.
  blessing_of_winds: Object.freeze({ movementSpeedPercent: 0.08, debuffResistancePercent: 0.10 }),
  // Essence identifies Flame Grip as a five-second imprisonment skill. In
  // Aden Arena's single-target combat loop, its supported control consumer is
  // a timed lock on the monster's attack and skill actions.
  flame_grip: Object.freeze({ actionsDisabled: 1 }),
  // Official Assassin notes define Sharp Blade Lv. 1-3 as P. Atk. +5/7/10%,
  // then add skill-critical rate and PvE damage at Lv. 2-3. This game's shared
  // crit stat consumes those rank bonuses without changing attack speed.
  sharp_blade: level => {
    const rank = Math.max(1, Math.min(3, Math.floor(Number(level) || 1)));
    const effects = [
      { pAtkPercent: 0.05 },
      { pAtkPercent: 0.07, crit: 2, pveDamagePercent: 0.03 },
      { pAtkPercent: 0.10, crit: 5, pveDamagePercent: 0.05 }
    ];
    return { ...effects[rank - 1] };
  },
  // The Warg movement-speed buff has no movement consumer; make its burst
  // useful by shortening skill cooldowns for a short window.
  improved_speed: Object.freeze({ cdr: 0.10 }),
  // Classic Berserker Spirit trades defense for attack and attack/cast speed.
  // The two speed bonuses become cooldown reduction in this card combat.
  berserker_spirit: Object.freeze({ pAtkPercent: 0.05, mAtkPercent: 0.10, cdr: 0.10, pDefPercent: -0.05, mDefPercent: -0.10, eva: -2 }),
  // The runtime has one crit stat rather than a separate magic-crit channel.
  // Adapt Wild Magic's specialist crit effect into a modest shared +5 crit.
  wild_magic: Object.freeze({ crit: 5 }),
  // Player skills have no interruptible cast window; map Concentration's
  // 36-point interruption reduction to resistance against combat debuffs.
  concentration: Object.freeze({ debuffResistancePercent: 0.36 }),
  // Local Call of Frost text grants physical offense and skill damage; the
  // unmodeled prison proc is represented by a small all-PvE damage bonus.
  call_of_frost: Object.freeze({ pAtkPercent: 0.05, pveDamagePercent: 0.02 }),
  // Ultimate Defense turns its high-cooldown protection into a brief +60%
  // physical/magical defense stance for this single-hero combat loop.
  ultimate_defense: Object.freeze({ pDefPercent: 0.60, mDefPercent: 0.60 }),
  // Shelter Master cannot grant literal invulnerability or heal a missing
  // party in this solo combat loop; make its sanctuary a timed defense and
  // status-resistance window instead.
  shelter_master: Object.freeze({ pDefPercent: 0.60, mDefPercent: 0.60, debuffResistancePercent: 0.25 }),
  // Preserve Guts' explicit physical defense and resistance values; movement
  // speed and anomaly categories have no separate consumers in this game.
  guts: Object.freeze({ def: 400, pDefPercent: 0.35, debuffResistancePercent: 0.25 }),
  // Feigning death has no aggro table to reset in solo encounters; briefly
  // temper incoming physical/magical damage and status pressure instead.
  fake_death: Object.freeze({ pDefPercent: 0.15, mDefPercent: 0.15, debuffResistancePercent: 0.10 }),
  // Stealth cannot change monster targeting in solo combat; it briefly makes
  // both physical and magical special attacks less likely to connect.
  silent_move: Object.freeze({ pSkillEvasionPercent: 0.10, mSkillEvasionPercent: 0.10 }),
  // Lionheart's multiple status resistances are represented as one balanced
  // resistance to the monster-applied Hex/Gloom debuffs used by this combat.
  lionheart: Object.freeze({ pveDamagePercent: 0.03, debuffResistancePercent: 0.25 }),
  blessed_shield: Object.freeze({ blockRate: 5 }),
  advanced_block: Object.freeze({ shieldDefPercent: 0.10 }),
  // This barrier has no separate magic-hit subsystem; reinforce the stat used
  // by the real incoming magical-damage mitigation for a short window.
  magic_barrier: Object.freeze({ mDefPercent: 0.10 }),
  // Lineage II skill 111, level 2: Evasion +25 and physical skill evasion
  // +40%. Buff-cancel resistance is adapted to monster-debuff resistance.
  ultimate_evasion: Object.freeze({ eva: 25, pSkillEvasionPercent: 0.40, debuffResistancePercent: 0.80 }),
  // Creative Aden Arena adaptation of the canonical Vampiric Rage placeholder.
  vampiric_rage: Object.freeze({ lifeDrain: 0.05 }),
  // Publisher-documented Assassin notes, adapted to card combat. The unused
  // movement-speed bonus is omitted; attack speed becomes cooldown reduction.
  assassin_s_secret_notes_1st_page: Object.freeze({ maxHpPercent: 0.03, maxMpPercent: 0.03, pAtkPercent: 0.02, mAtkPercent: 0.02, pDefPercent: 0.02, mDefPercent: 0.02, cdr: 0.02, pAccuracy: 1, mAccuracy: 1, crit: 10 }),
  assassin_s_secret_notes_2nd_page: Object.freeze({ maxHpPercent: 0.05, maxMpPercent: 0.05, pAtkPercent: 0.02, mAtkPercent: 0.02, pDefPercent: 0.02, mDefPercent: 0.02, cdr: 0.03, pAccuracy: 1, mAccuracy: 1, crit: 10 }),
  assassin_s_secret_notes_3rd_page: Object.freeze({ maxHpPercent: 0.07, maxMpPercent: 0.07, pAtkPercent: 0.03, mAtkPercent: 0.03, pDefPercent: 0.03, mDefPercent: 0.03, cdr: 0.05, pAccuracy: 2, mAccuracy: 2, crit: 20 }),
  // Movement is not modeled; Quick Dash becomes a brief, low-impact cooldown burst.
  quick_dash: Object.freeze({ cdr: 0.05 }),
  // Aden Arena warrior adaptations for canonical skills whose source records
  // contain only a placeholder effect string. Keep each buff distinct and
  // map any speed fantasy to cooldown reduction instead of attack speed.
  // L2Wiki level 1 stats: P. Atk./P. Def./Max HP +10%, P. Skill Power +5%.
  // Its 20-minute source duration is compressed to a 20-second card-combat buff.
  blazing_fury: Object.freeze({ pAtkPercent: 0.10, pDefPercent: 0.10, maxHpPercent: 0.10, pSkillPowerPercent: 0.05 }),
  rage: Object.freeze({ pAtkPercent: 0.10, cdr: 0.05 }),
  soul_roar: Object.freeze({ pAtkPercent: 0.08, debuffResistancePercent: 0.10 }),
  soul_guard: Object.freeze({ pDefPercent: 0.15, mDefPercent: 0.10, debuffResistancePercent: 0.10 }),
  // The local Samurai records name four elemental stances but lack source
  // numbers. These Aden Arena effects give offense, speed, guard, and ward
  // separate jobs while keeping the speed stance on the cooldown stat.
  fire: Object.freeze({ pAtkPercent: 0.10 }),
  wind: Object.freeze({ cdr: 0.08 }),
  mountain: Object.freeze({ pDefPercent: 0.15, mDefPercent: 0.10 }),
  forest: Object.freeze({ eva: 15, debuffResistancePercent: 0.10 }),
  // Moon Influence replaces an unavailable WP/full-transformation system with
  // a short high-cooldown stance so it remains a deliberate burst ability.
  moon_influence: Object.freeze({ pAtkPercent: 0.15, pDefPercent: 0.10, mDefPercent: 0.10, cdr: 0.10, debuffResistancePercent: 0.10 }),
  war_cry: level => ({ pAtkPercent: Math.round((0.20 + (Math.max(1, Number(level) || 1) * 0.05)) * 100) / 100 })
});

const KNOWN_BUFF_DURATIONS_MS = Object.freeze({ shineMakerBase_luminary_glow: 8_000, shineMakerBase_shinemakers_harmony: 1_800_000, shineMakerS1_shining_barrier: 120_000, shineMakerS2_light_of_creation: 120_000, shineMakerS2_brilliant_aura: 300_000, shineMakerS2_shinemaker_harmony_s2: 1_500_000, shinemaker_shinemakers_ultimate_harmony: 1_800_000, shinemaker_divine_crystal_aegis: 8_000, young_moon_s_grace: 1_200_000, moon_s_grace: 1_200_000, full_moon_s_grace: 1_200_000, blazing_fury: 20_000, ultimate_defense: 10_000, ultimate_evasion: 30_000, vampiric_rage: 10_000, wind_walk: 10_000, elemental_wind_walk: 10_000, magic_barrier: 10_000, elemental_magic_barrier: 8_000, elemental_insight: 8_000, soul_wind_walk: 10_000, blessing_of_winds: 10_000, sharp_blade: 8_000, berserker_spirit: 8_000, wild_magic: 8_000, improved_speed: 12_000, glorious_warrior_enhanced_abilities: 10_000, confused_mind: 8_000, fake_death: 4_000, silent_move: 8_000, call_of_frost: 10_000, guts: 10_000, dark_panther_s_help: 6_000, unleashed_power: 10_000, assassin_s_secret_notes_1st_page: 15_000, assassin_s_secret_notes_2nd_page: 15_000, assassin_s_secret_notes_3rd_page: 15_000, quick_dash: 2_000, rage: 8_000, soul_roar: 8_000, soul_guard: 8_000, fire: 8_000, wind: 8_000, mountain: 8_000, forest: 8_000, moon_influence: 12_000, chant_of_glory: 20_000, soul_blade: 20_000, prime_master: 20_000, powerful_rush: 20_000, sword_symphony: 20_000, bleeding_rose: 20_000, reflecting_illusion: 15_000, crimson_rose: 20_000, tenacity: 20_000, atsumori: 20_000, sacral_power: 20_000, fragarach: 30_000, increase_power: 20_000, light_counter: 20_000, collect_shadow_souls: 10_000, collect_light_souls: 10_000, mechanical_masterpiece: 20_000, knight_s_protection: 20_000, exciting_adventure: 30_000, wind_riding: 30_000, snipe: 20_000, legendary_archer: 20_000, battle_training: 20_000, life_magic_harmony_defense: 20_000, song_of_earth: 20_000, song_of_cosmos: 20_000, evasion: 20_000, rapid_fire: 20_000, freezing_skin: 20_000, prophecy_of_water: 20_000, enlightenment: 20_000, dance_of_warrior: 20_000, dead_eye: 20_000, prophecy_of_wind: 20_000, frenzy: 20_000, overwhelming_power: 20_000, zealot: 20_000, pa_agrio_s_immunity: 20_000, prophecy_of_pa_agrio: 20_000, chant_of_prophecy: 20_000, weapon_reinforcement: 20_000, soul_reinforcement: 20_000, force_unleashed: 20_000, adamant_will: 20_000, determination: 20_000, seal_of_despair: 20_000 });
const KNOWN_TARGET_DEBUFF_EFFECTS = Object.freeze({
  // The game adapter localizes Ice Bolt's short description and truncates the
  // canonical description. Preserve its full source effect in the live path.
  ice_bolt: Object.freeze({ movementSpeedPercent: -0.20 }),
  shinemakers1_radiant_strike: Object.freeze({ pAtkPercent: -0.10, mAtkPercent: -0.10 }),
  shinemakers2_prismatic_ray: Object.freeze({ atkSpdPercent: -0.30, cooldownPercent: 0.30 }),
  shinemaker_star_fall: Object.freeze({ actionsDisabled: 1 }),
  // Offensive stuns and paralysis lock both monster attack paths in the
  // single-target card loop. Durations live in the companion table below.
  thunder_storm: Object.freeze({ actionsDisabled: 1 }),
  power_crash: Object.freeze({ actionsDisabled: 1 }),
  quick_spear: Object.freeze({ actionsDisabled: 1 }),
  shield_charge: Object.freeze({ actionsDisabled: 1 }),
  shocking_burst: Object.freeze({ actionsDisabled: 1, pDefPercent: -0.30, mDefPercent: -0.30 }),
  winter_skin: Object.freeze({ actionsDisabled: 1 }),
  heavy_sleep: Object.freeze({ actionsDisabled: 1 }),
  improved_sleep: Object.freeze({ actionsDisabled: 1 }),
  winter_slumber: Object.freeze({ actionsDisabled: 1 }),
  paralysis: Object.freeze({ actionsDisabled: 1 }),
  wild_beat: Object.freeze({ actionsDisabled: 1 }),
  shield_bash: Object.freeze({ actionsDisabled: 1 }),
  elemental_roots: Object.freeze({ actionsDisabled: 1 }),
  lightning_strike: Object.freeze({ actionsDisabled: 1 }),
  mass_lightning_strike: Object.freeze({ actionsDisabled: 1 }),
  mass_dryad_root: Object.freeze({ actionsDisabled: 1 }),
  mass_shackling: Object.freeze({ actionsDisabled: 1 }),
  duress: Object.freeze({ actionsDisabled: 1, pAtkPercent: -0.30, mAtkPercent: -0.30 }),
  spear_cage: Object.freeze({ actionsDisabled: 1, pDefPercent: -0.30, mDefPercent: -0.30 }),
  vine_embrace: Object.freeze({ actionsDisabled: 1 }),
  // Queen's Garden applies Hold; the Essence page gives 4 sec for its
  // debuff section, which Aden Arena uses as the card-combat lock duration.
  queen_s_garden: Object.freeze({ actionsDisabled: 1 }),
  armor_crush: Object.freeze({ actionsDisabled: 1, pDefPercent: -0.30, mDefPercent: -0.30 }),
  iron_fist: Object.freeze({ actionsDisabled: 1 }),
  adena_stun: Object.freeze({ actionsDisabled: 1 }),
  body_crush: Object.freeze({ actionsDisabled: 1 }),
  rush_impact: Object.freeze({ actionsDisabled: 1 }),
  blacksmith_s_attack: Object.freeze({ actionsDisabled: 1 }),
  indestructible_seal: Object.freeze({ actionsDisabled: 1, pDefPercent: -0.10 }),
  indestructible_blade: Object.freeze({ actionsDisabled: 1 }),
  light_discharge: Object.freeze({ actionsDisabled: 1 }),
  // L2Wiki's fixed-speed suppression is adapted to an 80% cadence slow and
  // its explicit +30 sec cooldown penalty in the card-combat model.
  time_distortion_master: Object.freeze({ movementSpeedPercent: -0.80, skillCooldownFlatMs: 30_000 }),
  shinemaker_transcendent_star_fall: Object.freeze({ pAtkPercent: -0.15, mAtkPercent: -0.15 }),
  // Touch of Death's CP/healing/resistance pressure becomes a measured
  // vulnerability in solo combat; the sacrifice is paid separately by combat.
  touch_of_death: Object.freeze({ damageTakenPercent: 0.10 }),
  murder_attempt: Object.freeze({ pDefPercent: -0.10, mDefPercent: -0.10 }),
  giant_s_stomp: Object.freeze({ actionsDisabled: 1 }),
  wild_dance: Object.freeze({ actionsDisabled: 1 }),
  // Essence Flame Grip is a five-second imprisonment; solo card combat adapts
  // it to the target-action lock consumed by the monster combat loop.
  flame_grip: Object.freeze({ actionsDisabled: 1 }),
  // The racial Fire Call becomes a short dual-defense break in solo combat.
  call_of_flame: Object.freeze({ pDefPercent: -0.15, mDefPercent: -0.15 }),
  // The Lightning Call's attack denial maps to the combat loop's brief action lock.
  call_of_lightning: Object.freeze({ actionsDisabled: 1 }),
  // Creative Aden Arena adaptation of the canonical placeholder: reveal one
  // monster's weak point for a modest 8% damage-taken increase.
  detect_weakness: Object.freeze({ damageTakenPercent: 0.08 }),
  // A taunt has no targeting value in solo combat; preserve Provoke's 5%
  // resistance-reduction magnitude as a short vulnerability to player damage.
  provoke: Object.freeze({ damageTakenPercent: 0.05 }),
  // Weapon disarm has no equipment-change loop in monster combat; weaken its
  // physical attack for a short tactical window instead.
  artful_disarm: Object.freeze({ pAtkPercent: -0.20 }),
  // The source skill's armor-break fantasy maps to the modeled target-defense
  // multiplier instead of a missing equipment/armor-break subsystem.
  imminent_piercing: Object.freeze({ pDefPercent: -0.15 }),
  // These controls stop the target's basic and skill actions; monsterAttack
  // consumes the shared action-lock before either attack path can run.
  dreaming_spirit: Object.freeze({ actionsDisabled: 1 }),
  // Movement-speed reductions lengthen the target's basic-attack interval;
  // attack/casting-speed penalties are tracked separately for skill cooldowns.
  hamstring: Object.freeze({ movementSpeedPercent: -0.30 }),
  confusion: Object.freeze({ actionsDisabled: 1 }),
  shining_prison: Object.freeze({ actionsDisabled: 1 }),
  anchor: Object.freeze({ actionsDisabled: 1 }),
  shackle: Object.freeze({ actionsDisabled: 1 }),
  dryad_root: Object.freeze({ actionsDisabled: 1 }),
  // L2Wiki Entangle Lv. 1 applies Speed -70% for 3 seconds. With no movement
  // pathing in PvE cards, this slows the target's basic-attack cadence by the
  // same ratio instead of turning movement slow into a full action lock.
  entangle: Object.freeze({ movementSpeedPercent: -0.70 }),
  // Freezing Wound's 3-second attack/casting-speed reduction becomes a
  // measured monster cadence and skill-cooldown slow in card combat.
  freezing_wound: Object.freeze({ atkSpdPercent: -0.20, cooldownPercent: 0.20 }),
  // Silence blocks a monster's special magic skill while leaving basic attacks intact.
  silence: Object.freeze({ magicSkillsSilenced: 1 }),
  // Fear has no flee/pathfinding loop; weaken both of the target's combat attacks.
  curse_fear: Object.freeze({ pAtkPercent: -0.15, mAtkPercent: -0.15 }),
  // Word of Fear is the support archetype's single-target analogue: a lighter,
  // short disruption that lowers both monster damage channels.
  word_of_fear: Object.freeze({ pAtkPercent: -0.12, mAtkPercent: -0.12 }),
  // Shadow Step's speed suppression has no movement consumer; briefly slow the
  // monster's autonomous attack cadence instead of granting a free damage buff.
  shadow_step: Object.freeze({ movementSpeedPercent: -0.30 }),
  // Disarm is PvP-only and monsters have no weapon state; in PvE it briefly
  // suppresses the target's physical attack instead of becoming a no-op.
  disarm: Object.freeze({ pAtkPercent: -0.20 }),
  // A weapon-resistance marker has no per-weapon damage channel here; preserve
  // its offensive-debuff role with a modest all-damage vulnerability plus M.Def break.
  shillien_s_stigma: Object.freeze({ damageTakenPercent: 0.10, mDefPercent: -0.10 }),
  // Erosion's defense break maps directly to the defenses consumed by combat.
  erosion: Object.freeze({ pDefPercent: -0.10, mDefPercent: -0.10 }),
  // Sleep blocks combat actions briefly; the single-target loop has no movement state.
  sleep: Object.freeze({ actionsDisabled: 1 })
});
// L2Wiki labels these controls probabilistic but does not publish the proc
// percentages on the skill pages. These are explicit Aden Arena balance
// values: “certain chance” = 30%, “high chance” = 70%. Shock chance bonuses
// from equipment, SA, and buffs add percentage points, capped at 95%.
const CHANCE_BASED_TARGET_CONTROLS = Object.freeze({
  shocking_burst: 0.30,
  improved_sleep: 0.70,
  shield_bash: 0.30,
  iron_fist: 0.30,
  body_crush: 0.30,
  rush_impact: 0.30,
  blacksmith_s_attack: 0.30,
  vine_embrace: 0.30,
  light_discharge: 0.30,
  indestructible_seal: 0.30,
  indestructible_blade: 0.30,
  winter_skin: 0.30
});
const SHOCK_CHANCE_AFFECTED_SKILLS = new Set([
  'shocking_burst', 'shield_bash', 'iron_fist', 'body_crush',
  'rush_impact', 'blacksmith_s_attack', 'light_discharge'
]);
/** Maps Dwarven Weapon Mastery's Shock Attack Rate to the local proc chance. */
export function resolveDwarvenWeaponMasteryStunChancePercent(masteryRank, weaponCategory) {
  const category = String(weaponCategory || '').toLowerCase();
  if ((Number(masteryRank) || 0) <= 0 || !['sword', 'blunt'].includes(category)) return 0;
  // The source grants +30 Shock Attack Rate; the solo card-combat adapter uses
  // that value as 30 percentage points on its existing basic-hit stun proc.
  return 30;
}

/** Source-backed Dwarven Recovery Mastery values mapped by character level. */
export function resolveDwarvenRecoveryMasteryBonuses(characterLevel, masteryRank) {
  if (!(Number(masteryRank) > 0)) return { hpRecoveryFlat: 0, mpRecovery: 0 };
  const level = Number(characterLevel) || 0;
  if (level >= 90) return { hpRecoveryFlat: 20, mpRecovery: 5 };
  if (level >= 88) return { hpRecoveryFlat: 18, mpRecovery: 5 };
  if (level >= 86) return { hpRecoveryFlat: 16, mpRecovery: 5 };
  if (level >= 84) return { hpRecoveryFlat: 15, mpRecovery: 4 };
  if (level >= 82) return { hpRecoveryFlat: 14, mpRecovery: 4 };
  if (level >= 77) return { hpRecoveryFlat: 13, mpRecovery: 4 };
  return { hpRecoveryFlat: 0, mpRecovery: 0 };
}
const ALWAYS_APPLIED_TARGET_STATS_ON_CONTROL_MISS = Object.freeze({
  // Shocking Burst explicitly says its defense break applies in addition to its chance stun.
  shocking_burst: Object.freeze(['pDefPercent', 'mDefPercent'])
});
// The Time Distortion enemy suppression has no target duration in the source;
// Aden Arena caps that custom speed/cooldown adaptation at five seconds.
const KNOWN_TARGET_DEBUFF_DURATIONS_MS = Object.freeze({ ice_bolt: 30_000, shineMakerS1_radiant_strike: 2_000, shineMakerS2_prismatic_ray: 4_000, shinemaker_star_fall: 3_000, shinemaker_transcendent_star_fall: 5_000, thunder_storm: 3_000, power_crash: 3_000, quick_spear: 3_000, shield_charge: 3_000, shocking_burst: 3_000, heavy_sleep: 5_000, improved_sleep: 5_000, winter_slumber: 5_000, paralysis: 3_000, wild_beat: 3_000, shield_bash: 3_000, elemental_roots: 5_000, lightning_strike: 3_000, mass_lightning_strike: 3_000, mass_dryad_root: 5_000, mass_shackling: 5_000, duress: 5_000, spear_cage: 3_000, vine_embrace: 3_000, armor_crush: 3_000, iron_fist: 3_000, adena_stun: 3_000, body_crush: 3_000, rush_impact: 2_000, blacksmith_s_attack: 3_000, indestructible_seal: 10_000, indestructible_blade: 5_000, light_discharge: 3_000, winter_skin: 3_000, time_distortion_master: 5_000, detect_weakness: 8_000, provoke: 10_000, artful_disarm: 5_000, imminent_piercing: 5_000, touch_of_death: 20_000, murder_attempt: 10_000, giant_s_stomp: 3_000, wild_dance: 1_000, dreaming_spirit: 5_000, confusion: 5_000, shining_prison: 5_000, anchor: 3_000, shackle: 4_000, dryad_root: 4_000, entangle: 3_000, freezing_wound: 3_000, call_of_flame: 5_000, call_of_lightning: 1_000, silence: 6_000, curse_fear: 5_000, word_of_fear: 5_000, shadow_step: 5_000, flame_grip: 5_000, disarm: 2_000, shillien_s_stigma: 8_000, erosion: 5_000, sleep: 2_000 });
const KNOWN_TARGET_DEBUFF_STAT_DURATIONS_MS = Object.freeze({
  // Spear Cage holds for 3 seconds but its defense break lasts 10 seconds.
  spear_cage: Object.freeze({ actionsDisabled: 3_000, pDefPercent: 10_000, mDefPercent: 10_000 }),
  // Indestructible Seal lowers P. Def. after its five-second imprisonment.
  indestructible_seal: Object.freeze({ actionsDisabled: 5_000, pDefPercent: 5_000 })
});
const KNOWN_TARGET_DEBUFF_STAT_DELAYS_MS = Object.freeze({
  indestructible_seal: Object.freeze({ pDefPercent: 5_000 })
});

/** Converts local party-healing attacks into bounded self-healing for solo encounters. */
export function resolveSkillSelfHealPercent(def) {
  const configured = Number(def?.effectStats?.healPercent ?? def?.selfHealPercent);
  if (Number.isFinite(configured) && configured > 0) return Math.min(0.50, configured);
  const id = String(def?.id || '').toLowerCase();
  if (id === 'shinemakers2_shining_nova') return 0.10;
  if (id === 'shinemaker_transcendent_star_fall') return 0.30;
  return 0;
}

/** Resolves explicit damage-over-time rules supported by the single-target combat loop. */
export function resolveSkillDamageOverTime(def) {
  const source = String(def.canonicalEffect || def.desc || '');
  const duration = source.match(/(?:continuous damage|deals? damage) for\s+(\d+)\s*sec/i) ||
    source.match(/for\s+(\d+)\s*sec(?:ond)?s?\.?\s*,?\s+deals? damage over time/i);
  if (!duration) return null;
  const durationMs = Number(duration[1]) * 1000;
  return Number.isSafeInteger(durationMs) && durationMs > 0
    ? { durationMs, intervalMs: 1000 }
    : null;
}

/** Starts or refreshes Frost Flame; repeated casts refresh duration without delaying its next tick. */
export function applySkillDamageOverTime(target, def, damageBudget, now = Date.now()) {
  const rule = resolveSkillDamageOverTime(def);
  if (!target || !rule || !Number.isFinite(Number(damageBudget))) return null;
  const previous = target._skillDots?.[def.id];
  const totalDamage = Math.max(1, Math.floor(Number(damageBudget)));
  const effect = {
    skillId: def.id,
    damagePerTick: Math.max(1, Math.floor(totalDamage / (rule.durationMs / rule.intervalMs))),
    intervalMs: rule.intervalMs,
    nextTickAt: previous?.until > now ? previous.nextTickAt : now + rule.intervalMs,
    appliedAt: now,
    until: now + rule.durationMs
  };
  target._skillDots = target._skillDots || {};
  target._skillDots[def.id] = effect;
  return { ...effect };
}

/** Advances active periodic skill damage by at most one tick per combat update. */
export function processSkillDamageOverTime(target, now = Date.now()) {
  const ticks = [];
  const effects = target?._skillDots;
  if (!effects) return ticks;
  for (const [skillId, effect] of Object.entries(effects)) {
    if (!effect || !Number.isFinite(effect.until)) {
      delete effects[skillId];
      continue;
    }
    if (now >= effect.nextTickAt && effect.nextTickAt <= effect.until) {
      ticks.push({ skillId, damage: effect.damagePerTick });
      effect.nextTickAt += effect.intervalMs;
    }
    if (now >= effect.until && effect.nextTickAt > effect.until) delete effects[skillId];
  }
  return ticks;
}

const BUFF_STAT_LABELS = [
  { labels: '\\bCON\\b|Constitution', flat: 'con' },
  { labels: '\\bMEN\\b|Mental Strength', flat: 'men' },
  { labels: 'P\\.?\\s*Atk\\.?|Physical Attack', flat: 'atk', percent: 'pAtkPercent' },
  { labels: 'M\\.?\\s*Atk\\.?|Magic Attack', flat: 'matk', percent: 'mAtkPercent' },
  { labels: 'P\\.?\\s*Def\\.?|Physical Defense', flat: 'def', percent: 'pDefPercent' },
  { labels: 'M\\.?\\s*Def\\.?|Magic Defense', flat: 'mdef', percent: 'mDefPercent' },
  { labels: 'P\\.?\\s*Accuracy|Physical Accuracy', flat: 'pAccuracy' },
  { labels: 'M\\.?\\s*Accuracy|Magic Accuracy', flat: 'mAccuracy' },
  { labels: 'Max(?:imum)?\\s+HP', flat: 'maxHpFlat', percent: 'maxHpPercent' },
  { labels: 'Max(?:imum)?\\s+MP', flat: 'maxMpFlat', percent: 'maxMpPercent' },
  { labels: 'MP\\s+Recovery\\s+Rate|MP\\s+Regen(?:eration)?', flat: 'mpRegen' },
  { labels: 'Max(?:imum)?\\s+CP', flat: 'maxCpFlat', percent: 'maxCpPercent' },
  { labels: '(?:P\\.?\\s*)?Evasion', flat: 'eva', percent: 'evaPercent' },
  { labels: '(?:Critical Chance|Critical Rate|Crit(?:ical)?)', flat: 'crit', percent: 'critPercent' },
  { labels: 'PvE Damage(?: Bonus)?', percent: 'pveDamagePercent' },
  { labels: '(?:M\\.?\\s*)?Skill MP Consumption|MP Consumption', flat: 'mpCostReduction', percent: 'mpCostReduction' },
  { labels: '(?:Movement\\s+Speed|(?<!Atk\\.\\s)(?<!Attack\\s)(?<!Max\\s)Speed)', flat: 'movementSpeedPercent', percent: 'movementSpeedPercent' },
  { labels: 'Skill Reuse(?: Delay)?|Cooldown Reduction', flat: 'cdr', percent: 'cdr' }
];

const SPEED_TO_COOLDOWN_PATTERN = /(?:Atk\.?\s*Spd\.?|Attack\s*Speed|Cast(?:ing)?\.?\s*Spd\.?|Cast(?:ing)?\s*Speed)\s*[: ]*\s*([+-]?\s*\d+(?:\.\d+)?)\s*(%)?/gi;

function getSkillEffectSource(def) {
  const candidates = [def?.desc, def?.canonicalEffect, def?.effectText, def?.info, def?.effect]
    .filter(value => typeof value === 'string' && value.trim())
    .sort((a, b) => b.length - a.length);
  const hasNumericSpeedEffect = new RegExp(SPEED_TO_COOLDOWN_PATTERN.source, 'i');
  return candidates.find(value => hasNumericSpeedEffect.test(value)) || candidates[0] || '';
}

/** Maps explicit movement speed into basic-attack cadence (100 flat points = 100%). */
export function resolveSkillMovementSpeedPercent(def, context = {}) {
  if (!def) return 0;
  const candidates = [def?.desc, def?.canonicalEffect, def?.effectText, def?.info, def?.effect]
    .filter(value => typeof value === 'string' && value.trim());
  const movementPattern = /(?:Movement\s+Speed|(?<!Atk\.\s)(?<!Attack\s)(?<!Max\s)Speed)\s*([+-]\s*\d+(?:\.\d+)?)\s*(%)?/i;
  const source = candidates.find(value => movementPattern.test(value)) || getSkillEffectSource(def);
  const conditionText = [def.desc, def.canonicalEffect, def.effectText, def.info, def.effect]
    .filter(value => typeof value === 'string').join(' ').toLowerCase();
  if (/when\s+(?:equipped\s+with|using)\s+light armor/.test(conditionText) && context.armorType !== 'light') return 0;
  if (/when\s+(?:equipped\s+with|using)\s+(?:a\s+)?robe/.test(conditionText) && context.armorType !== 'robe') return 0;
  if (/when\s+(?:equipped\s+with|using)\s+(?:a\s+)?fist weapon/.test(conditionText) && context.weaponCategory !== 'fist') return 0;
  if (/when\s+(?:equipped\s+with|using)\s+(?:a\s+)?bow/.test(conditionText) && context.weaponCategory !== 'bow') return 0;
  if (/when\s+(?:equipped\s+with|using)\s+swords?\s*\/\s*blunt weapons?/.test(conditionText) && !['sword', 'blunt'].includes(context.weaponCategory)) return 0;
  if (/when\s+(?:equipped\s+with|using)\s+(?:a\s+)?sword or blunt weapon/.test(conditionText) && !['sword', 'blunt'].includes(context.weaponCategory)) return 0;
  if (/when\s+(?:equipped\s+with|using)\s+a sword,?\s+a blunt weapon,?\s+a spear,?\s+dual swords? or a fist weapon/.test(conditionText) &&
      !['sword', 'blunt', 'spear', 'dual', 'fist'].includes(context.weaponCategory)) return 0;
  const pattern = /(?:Movement\s+Speed|(?<!Atk\.\s)(?<!Attack\s)(?<!Max\s)Speed)\s*([+-]\s*\d+(?:\.\d+)?)\s*(%)?/gi;
  let movementSpeedPercent = 0;
  for (const match of source.matchAll(pattern)) {
    const amount = Number(match[1].replace(/\s/g, ''));
    if (!Number.isFinite(amount)) continue;
    const before = source.slice(0, match.index).toLowerCase();
    const clauseStart = Math.max(before.lastIndexOf('.'), before.lastIndexOf('>'), before.lastIndexOf('\n'));
    if (/target['’]s\s*$|enemy['’]s\s*$/.test(before.slice(clauseStart + 1))) continue;
    movementSpeedPercent += amount / 100;
  }
  return Math.round(movementSpeedPercent * 1e8) / 1e8;
}

/** Converts explicit positive attack/casting speed on a skill into cooldown reduction.
 * Percentages retain their magnitude; flat speed points use the game's existing
 * cast-speed-to-CDR scale (100 points = 1.0). Equipment-gated passives honor
 * their leading armor/weapon condition when that condition is modeled.
 */
export function resolveSkillSpeedCooldownReduction(def, context = {}) {
  if (!def) return 0;
  const source = getSkillEffectSource(def);
  const conditions = [def.desc, def.canonicalEffect, def.effectText, def.info, def.effect].filter(value => typeof value === 'string').join(' ').toLowerCase();
  let amount = 0;
  const prefixConditions = [...source.matchAll(/(?:when\s+using|when\s+equipped\s+with)\s+([^:.;]+)\s*:?/ig)];

  for (const match of source.matchAll(SPEED_TO_COOLDOWN_PATTERN)) {
    const speed = Number(match[1].replace(/\s/g, ''));
    if (!Number.isFinite(speed) || speed <= 0) continue;

    if (/when\s+(?:equipped\s+with|using)\s+light armor/.test(conditions) && context.armorType !== 'light') continue;
    if (/when\s+(?:equipped\s+with|using)\s+(?:a\s+)?robe/.test(conditions) && !/when\s+(?:equipped\s+with|using)\s+light armor/.test(conditions) && context.armorType !== 'robe') continue;
    const condition = [...prefixConditions].reverse().find(entry => entry.index < match.index)?.[1]?.toLowerCase() || '';
    if (condition.includes('light armor') && context.armorType !== 'light') continue;
    if (condition.includes('robe') && !condition.includes('light armor') && context.armorType !== 'robe') continue;
    if (condition.includes('robe') && condition.includes('light armor') && !['robe', 'light'].includes(context.armorType)) continue;
    const multiWeaponCondition = /a sword,\s*a blunt weapon,\s*a spear,\s*dual swords or a fist weapon/.test(condition);
    const swordBluntCondition = /\bswords?\s*\/\s*blunt weapons?\b/.test(condition);
    if (multiWeaponCondition) {
      if (!['sword', 'blunt', 'spear', 'dual', 'fist'].includes(context.weaponCategory)) continue;
    } else if (swordBluntCondition) {
      if (!['sword', 'blunt'].includes(context.weaponCategory)) continue;
    } else {
      if (condition.includes('fist weapon') && context.weaponCategory !== 'fist') continue;
      if (/\bdual swords?\b/.test(condition) && context.weaponCategory !== 'dual') continue;
      if (condition.includes('ancient sword') && !/ancient/i.test(`${context.weaponId || ''} ${context.weaponName || ''}`)) continue;
      if (condition.includes('two-handed sword') && !(context.weaponCategory === 'sword' && context.isTwoHanded)) continue;
      if (/\bbow\b/.test(condition) && !/\bspear\b/.test(condition) && context.weaponCategory !== 'bow') continue;
      if (/\bspear\b/.test(condition) && !/\bbow\b/.test(condition) && context.weaponCategory !== 'spear') continue;
      if (/\bswords?\b/.test(condition) && !/ancient|two-handed|dual/.test(condition) && !swordBluntCondition && !['sword', 'dual'].includes(context.weaponCategory)) continue;
      if (/\bblunt\b/.test(condition) && !['blunt', 'staff'].includes(context.weaponCategory)) continue;
    }

    // The stat belongs to a summon/servitor, whose attributes are not player stats.
    const before = source.slice(0, match.index).toLowerCase();
    const lastEffectBoundary = Math.max(before.lastIndexOf('.'), before.lastIndexOf('>'));
    if (/servitor/.test(before.slice(lastEffectBoundary + 1)) && /effect is applied on servitors|servitor's stats/i.test(source)) continue;

    // One hundred flat speed points map to one hundred percent in the existing
    // castSpd certification/SA conversion path; a written percent has the same scale.
    amount += speed / 100;
  }
  return amount;
}

/** Resolves explicit, numeric reductions to skill cooldowns without treating penalties as bonuses. */
export function resolveSkillCooldownReduction(def, context = {}) {
  const result = { cdr: 0, pSkillCdr: 0, mSkillCdr: 0 };
  if (!def) return result;
  const candidates = [def.desc, def.canonicalEffect, def.effectText, def.info, def.effect]
    .filter(value => typeof value === 'string' && value.trim())
    .sort((a, b) => b.length - a.length);
  const pattern = /(?:(?:([PM])\s*\.?\s*(?:\/\s*([PM])\s*\.?\s*)?)?Skill\s+Cooldown|(?<![A-Za-z])Cooldown)\s*([+-])\s*(\d+(?:\.\d+)?)\s*%/gi;
  const source = candidates.find(value => pattern.test(value)) || candidates[0] || '';
  pattern.lastIndex = 0;
  for (const match of source.matchAll(pattern)) {
    // A positive cooldown modifier increases the delay; it is not a player bonus.
    if (match[3] !== '-') continue;
    const before = source.slice(0, match.index).toLowerCase();
    if (/current hp|depending on your hp|based on your hp/.test(before)) continue;

    const allText = candidates.join(' ').toLowerCase();
    if (/when\s+(?:equipped\s+with|using)\s+light armor/.test(allText) && context.armorType !== 'light') continue;
    if (/when\s+(?:equipped\s+with|using)\s+(?:a\s+)?robe|(?:robe\s+equipped|equipped\s+robe)\s+effect/.test(allText) && context.armorType !== 'robe') continue;
    const amount = Number(match[4]) / 100;
    const categories = new Set([match[1], match[2]].filter(Boolean).map(value => value.toUpperCase()));
    if (categories.has('P')) result.pSkillCdr += amount;
    if (categories.has('M')) result.mSkillCdr += amount;
    if (!categories.size) result.cdr += amount;
  }
  for (const key of Object.keys(result)) result[key] = Math.round(result[key] * 1e8) / 1e8;
  return result;
}

/** Resolves the production interval between player basic attacks. Movement
 * changes this interval; skill attack/casting speed is converted to cooldown elsewhere. */
export function resolvePlayerBasicAttackIntervalMs(stats = {}) {
  const attackSpeed = Number(stats.atkSpd) || 0;
  const movementSpeedPercent = Math.max(-0.90, Math.min(2, Number(stats.movementSpeedPercent) || 0));
  const baseInterval = Math.max(200, 1_000 - attackSpeed * 600);
  return Math.max(200, Math.round(baseInterval / (1 + movementSpeedPercent)));
}

const TARGET_DEBUFF_LABELS = [
  { labels: '(?:Movement\\s+Speed|(?<!Atk\\.\\s)(?<!Attack\\s)Speed)', stat: 'movementSpeedPercent' },
  { labels: 'P\\.?\\s*Atk\\.?|Physical Attack', stat: 'pAtkPercent' },
  { labels: 'M\\.?\\s*Atk\\.?|Magic Attack', stat: 'mAtkPercent' },
  { labels: 'P\\.?\\s*Def\\.?|Physical Defense', stat: 'pDefPercent' },
  { labels: 'M\\.?\\s*Def\\.?|Magic Defense', stat: 'mDefPercent' },
  { labels: 'Atk\\.?\\s*Spd\\.?|Attack Speed', stat: 'atkSpdPercent' },
  { labels: 'Casting\\s*Spd\\.?|Casting Speed', stat: 'cooldownPercent', invert: true }
];

/** Resolves a fixed HP recovery only when the canonical description states it explicitly. */
export function resolveSkillFixedHeal(def) {
  if (!def || !['buff', 'heal', 'active'].includes(def.type) && def.effect !== 'heal') return null;
  const source = String(def.canonicalEffect || def.effectText || def.info || def.desc || '');
  const match = source.match(/^\s*Recovers\s+(\d+)\s+of\s+the\s+target['’]s\s+HP\.?\s*$/i);
  if (!match) return null;
  const amount = Number(match[1]);
  return Number.isSafeInteger(amount) && amount > 0 ? amount : null;
}

/** Resolves a canonical buff duration or a researched skill-specific duration. */
export function resolveSkillBuffDurationMs(def) {
  if (!def) return null;
  if (Number.isFinite(Number(def.effectDurationMs)) && Number(def.effectDurationMs) > 0) return Number(def.effectDurationMs);
  const source = String(def.canonicalEffect || def.effectText || def.info || def.desc || '');
  const match = source.match(/(?:for\s+|duration\s*:?\s*)(\d+)\s*(?:sec(?:ond)?s?\b|s\b)/i);
  if (match) {
    const seconds = Number(match[1]);
    if (Number.isSafeInteger(seconds) && seconds > 0) {
      const declaredDuration = seconds * 1000;
      return Math.max(declaredDuration, KNOWN_TARGET_DEBUFF_DURATIONS_MS[def.id] ?? 0);
    }
  }
  return KNOWN_BUFF_DURATIONS_MS[def.id] ?? null;
}

/** Applies the learned support-passive duration bonus to one resolved self-buff. */
export function applySkillBuffDurationBonus(durationMs, stats = {}) {
  const baseDuration = Number(durationMs);
  if (!Number.isFinite(baseDuration) || baseDuration <= 0) return null;
  const bonus = Math.max(0, Math.min(0.50, Number(stats?.buffDurationPercent) || 0));
  return Math.round(baseDuration * (1 + bonus));
}

/** Checks the evasion roll for a monster skill using the player's active skill-evasion stat. */
export function shouldEvadeMonsterSkill(stats, attackType, roll = Math.random()) {
  const normalizedType = String(attackType || '').toLowerCase();
  const key = normalizedType === 'magical' || normalizedType === 'magic'
    ? 'mSkillEvasionPercent'
    : 'pSkillEvasionPercent';
  const chance = Math.max(0, Math.min(1, Number(stats?.[key]) || 0));
  return Number.isFinite(roll) && roll >= 0 && roll < chance;
}

/** Resolves only explicit, numeric effects described as targeting an enemy. */
export function resolveSkillTargetDebuffStats(def) {
  if (!def || !['buff', 'debuff', 'active'].includes(def.type) && def.effect !== 'debuff') return null;
  if (def.targetStats && typeof def.targetStats === 'object') return { ...def.targetStats };
  const known = KNOWN_TARGET_DEBUFF_EFFECTS[String(def.id || '').toLowerCase()];
  if (known) return { ...known };
  const source = getSkillEffectSource(def);
  if (!/\btargets?\b|\benemy\b|\bfoe\b|target['’]s/i.test(source)) return null;
  const stats = {};
  let unparsedText = source.replace(/(?:for|duration[: ]+)\s*\d+\s*sec\.?/ig, '');
  for (const { labels, stat, invert = false } of TARGET_DEBUFF_LABELS) {
    const pattern = new RegExp(`(?:${labels})\\s*([+-]{1,2}\\s*\\d+(?:\\.\\d+)?)\\s*(%)?`, 'i');
    const match = source.match(pattern);
    if (!match || !match[2]) continue;
    unparsedText = unparsedText.replace(match[0], '');
    const token = match[1].replace(/\s/g, '');
    const sign = token.includes('-') ? -1 : 1;
    const amount = sign * Number(token.replace(/[+-]/g, ''));
    if (Number.isFinite(amount) && amount < 0) stats[stat] = (invert ? -amount : amount) / 100;
  }
  const unparsedNumbers = [...unparsedText.matchAll(/[+-]\s*\d+(?:\.\d+)?%?/g)];
  const ignoredMovementSpeed = [...source.matchAll(/\b(?:(?:Movement\s+)?Speed)\s*[+-]\s*\d+(?:\.\d+)?%/gi)];
  if (unparsedNumbers.length > ignoredMovementSpeed.length) return null;
  return Object.keys(stats).length ? stats : null;
}

/** Rolls source-described chance controls while retaining unconditional hybrid effects. */
export function resolveSkillTargetDebuffApplication(def, roll = Math.random(), bonusChancePercent = 0) {
  const stats = resolveSkillTargetDebuffStats(def);
  if (!stats) return { stats: null, procSucceeded: false, procChance: 0 };
  const baseChance = CHANCE_BASED_TARGET_CONTROLS[String(def?.id || '').toLowerCase()];
  if (baseChance === undefined) return { stats, procSucceeded: true, procChance: 1 };

  const shockBonus = SHOCK_CHANCE_AFFECTED_SKILLS.has(String(def?.id || '').toLowerCase())
    ? (Number(bonusChancePercent) || 0) / 100
    : 0;
  const procChance = Math.max(0, Math.min(0.95, baseChance + shockBonus));
  const procSucceeded = Number.isFinite(roll) && roll >= 0 && roll < procChance;
  if (procSucceeded) return { stats, procSucceeded: true, procChance };

  const alwaysApplied = ALWAYS_APPLIED_TARGET_STATS_ON_CONTROL_MISS[String(def?.id || '').toLowerCase()] || [];
  const unconditionalStats = Object.fromEntries(alwaysApplied
    .filter(key => Object.hasOwn(stats, key))
    .map(key => [key, stats[key]]));
  return {
    stats: Object.keys(unconditionalStats).length ? unconditionalStats : null,
    procSucceeded: false,
    procChance
  };
}

/** Resolves explicit or skill-specific target debuff duration. */
export function resolveSkillTargetDebuffDurationMs(def) {
  if (!def) return null;
  if (Number.isFinite(Number(def.targetDurationMs)) && Number(def.targetDurationMs) > 0) return Number(def.targetDurationMs);
  const sources = [def.canonicalEffect, def.effectText, def.info, def.desc].filter(Boolean).map(String);
  const source = sources.sort((a, b) => b.length - a.length)[0] || '';
  const match = source.match(/(?:for\s+|duration\s*:?\s*)(\d+)\s*(?:sec(?:ond)?s?\b|s\b)/i);
  if (match) {
    const seconds = Number(match[1]);
    if (Number.isSafeInteger(seconds) && seconds > 0) {
      const declaredDuration = seconds * 1000;
      return Math.max(declaredDuration, KNOWN_TARGET_DEBUFF_DURATIONS_MS[def.id] ?? 0);
    }
  }
  return KNOWN_TARGET_DEBUFF_DURATIONS_MS[def.id] ?? null;
}

/** Resolves per-stat durations for target effects whose components expire separately. */
export function resolveSkillTargetDebuffStatDurationsMs(def) {
  if (!def) return null;
  const durations = KNOWN_TARGET_DEBUFF_STAT_DURATIONS_MS[String(def.id || '').toLowerCase()];
  return durations ? { ...durations } : null;
}

/** Applies a target debuff through the same state consumed by combat, including chance procs. */
export function applySkillTargetDebuff(target, def, now = Date.now(), roll = Math.random(), bonusChancePercent = 0) {
  if (!target || !def) return { stats: null, procSucceeded: false, procChance: 0 };
  const application = resolveSkillTargetDebuffApplication(def, roll, bonusChancePercent);
  if (!application.stats) return application;
  const durationMs = resolveSkillTargetDebuffDurationMs(def) ?? 60_000;
  const effect = {
    stats: application.stats,
    until: now + durationMs,
    appliedAt: now,
    statDurationsMs: resolveSkillTargetDebuffStatDurationsMs(def),
    statDelaysMs: KNOWN_TARGET_DEBUFF_STAT_DELAYS_MS[String(def.id || '').toLowerCase()] || null,
    source: def.id
  };
  target._skillDebuffs = target._skillDebuffs || {};
  target._skillDebuffs[def.id] = effect;
  return { ...application, effect };
}

/** Applies timed control or damage-over-time effects from a monster's landed skill. */
export function applyMonsterSkillStatus(target, source, status, now = Date.now(), roll = Math.random(), resistance = 0) {
  if (!target || !source || !['stun', 'root', 'bleed', 'poison'].includes(status)) {
    return { applied: false, reason: 'unsupported_status' };
  }
  const baseChance = source.boss ? 0.75 : (source.elite ? 0.60 : 0.45);
  const resist = Math.max(0, Math.min(0.90, Number(resistance) || 0));
  const chance = baseChance * (1 - resist);
  if (!(Number(roll) < chance)) return { applied: false, reason: 'resisted', chance };

  if (status === 'bleed' || status === 'poison') {
    const durationMs = status === 'poison' ? 5000 : 4000;
    target._monsterSkillDamageOverTime = {
      name: status === 'poison' ? 'Envenenamento' : 'Sangramento',
      sourceName: source.name,
      damagePercent: status === 'poison' ? 0.018 : 0.014,
      expiresAt: now + durationMs,
      nextTickAt: now + 1000
    };
    return { applied: true, status, until: now + durationMs };
  }

  const targetStats = status === 'stun'
    ? { actionsDisabled: 1 }
    : { pAtkPercent: -0.25, mAtkPercent: -0.25 };
  const id = `monster_skill_${status}_${source.id || 'unknown'}`;
  const result = applySkillTargetDebuff(target, {
    id,
    type: 'debuff',
    targetStats,
    targetDurationMs: status === 'stun' ? 1500 : 4000
  }, now, 0);
  return { applied: !!result.stats, status, until: result.effect?.until };
}

/** Advances one timed tick from a monster-applied bleed or poison effect. */
export function processMonsterSkillStatus(target, now = Date.now()) {
  const status = target?._monsterSkillDamageOverTime;
  if (!status) return null;
  if (now >= status.expiresAt) {
    target._monsterSkillDamageOverTime = null;
    return { expired: true, name: status.name };
  }
  if (now < status.nextTickAt || !(target.hp > 0)) return null;
  const damage = Math.max(1, Math.floor((Number(target.maxHp) || 100) * status.damagePercent));
  const appliedDamage = Math.min(target.hp, damage);
  target.hp = Math.max(0, target.hp - appliedDamage);
  status.nextTickAt = now + 1000;
  if (target.hp <= 0) target._monsterSkillDamageOverTime = null;
  return { expired: false, damage: appliedDamage, name: status.name, sourceName: status.sourceName };
}

/** Resolves Winter Skin's reactive paralysis only when the player is hit. */
export function applyPlayerBuffHitControlProc(target, buffs, now = Date.now(), roll = Math.random()) {
  if (Number(buffs?.winter_skin?.until) <= now) return { stats: null, procSucceeded: false, procChance: 0 };
  return applySkillTargetDebuff(target, { id: 'winter_skin', type: 'active' }, now, roll);
}

export function getActiveSkillDebuffStats(target, now = Date.now()) {
  const result = {};
  for (const debuff of Object.values(target?._skillDebuffs || {})) {
    if (!debuff || !Number.isFinite(Number(debuff.until)) || !debuff.stats) continue;
    for (const [key, value] of Object.entries(debuff.stats)) {
      const statDelayMs = Number(debuff.statDelaysMs?.[key]);
      if (Number.isFinite(statDelayMs) && statDelayMs > 0 && Number(debuff.appliedAt) + statDelayMs > now) continue;
      const statDurationMs = Number(debuff.statDurationsMs?.[key]);
      const statUntil = Number.isFinite(statDurationMs) && statDurationMs > 0
        ? Number(debuff.appliedAt) + Math.max(0, statDelayMs || 0) + statDurationMs
        : Number(debuff.until);
      if (!(statUntil > now)) continue;
      if (Number.isFinite(Number(value))) result[key] = (result[key] || 0) + Number(value);
    }
  }
  return result;
}

/** Whether an active Silence control effect is blocking the target's magic skill cast. */
export function isMonsterMagicSkillSilenced(monster, now = Date.now()) {
  return (Number(getActiveSkillDebuffStats(monster, now).magicSkillsSilenced) || 0) > 0;
}

/** Whether a short Sleep control effect currently prevents the monster from acting. */
export function isMonsterActionDisabled(monster, now = Date.now()) {
  return (Number(getActiveSkillDebuffStats(monster, now).actionsDisabled) || 0) > 0;
}

export function getDebuffedMonsterAttack(monster, attackValue, type = 'physical', now = Date.now()) {
  const stats = getActiveSkillDebuffStats(monster, now);
  const penalty = type === 'magical' || type === 'magic' ? stats.mAtkPercent : stats.pAtkPercent;
  return Math.max(1, Math.floor((Number(attackValue) || 0) * Math.max(0.1, 1 + (Number(penalty) || 0))));
}

export function getDebuffedMonsterAttackSpeed(monster, now = Date.now()) {
  const stats = getActiveSkillDebuffStats(monster, now);
  const attackSpeedMultiplier = Math.max(0.1, 1 + (Number(stats.atkSpdPercent) || 0));
  const movementSpeedMultiplier = Math.max(0.1, 1 + (Number(stats.movementSpeedPercent) || 0));
  return Math.max(0.1, (Number(monster?.atkSpd) || 1) * attackSpeedMultiplier * movementSpeedMultiplier);
}

export function getDebuffedMonsterSkillCooldownMultiplier(monster, now = Date.now()) {
  const stats = getActiveSkillDebuffStats(monster, now);
  // Attack-speed slows also lengthen skill reuse in the card-combat model.
  // Some skills declare both fields for provenance; use the stronger value so
  // the same slow is not counted twice.
  const attackSpeedSlow = Math.max(0, -(Number(stats.atkSpdPercent) || 0));
  const explicitCooldownSlow = Number(stats.cooldownPercent) || 0;
  return Math.max(0.1, 1 + Math.max(attackSpeedSlow, explicitCooldownSlow));
}

export function resolveDebuffedMonsterSkillCooldownMs(monster, baseCooldownMs, now = Date.now()) {
  const base = Math.max(0, Number(baseCooldownMs) || 0);
  const flatPenalty = Math.max(0, Number(getActiveSkillDebuffStats(monster, now).skillCooldownFlatMs) || 0);
  return base * getDebuffedMonsterSkillCooldownMultiplier(monster, now) + flatPenalty;
}

export function getDebuffedMonsterDefense(monster, now = Date.now()) {
  const stats = getActiveSkillDebuffStats(monster, now);
  return {
    def: Math.max(0, Math.floor((Number(monster?.def) || 0) * (1 + (Number(stats.pDefPercent) || 0)))),
    mdef: Math.max(0, Math.floor((Number(monster?.mdef) || 0) * (1 + (Number(stats.mDefPercent) || 0))))
  };
}

/** Applies a target's active damage-taken modifiers after defense mitigation. */
export function applyTargetDamageTakenBonus(damage, target, now = Date.now()) {
  const amount = Math.max(0, Number(damage) || 0);
  const bonus = Math.max(0, Number(getActiveSkillDebuffStats(target, now).damageTakenPercent) || 0);
  return Math.floor(amount * (1 + bonus));
}

/** Applies the player's active PvE damage bonuses to damage dealt to monsters. */
export function applyPlayerPveDamageBonus(damage, stats) {
  const amount = Math.max(0, Number(damage) || 0);
  const bonus = Math.max(0, Number(stats?.pveDamagePercent) || 0);
  return Math.floor(amount * (1 + bonus));
}

/** Applies local single-target adaptations to basic attacks, never active skills. */
export function applyPlayerBasicAttackDamageBonus(damage, stats) {
  const amount = Math.max(0, Number(damage) || 0);
  const bonus = Math.max(0, Number(stats?.basicAttackDamagePercent) || 0);
  return Math.floor(amount * (1 + bonus));
}

/** Resolves the equipped weapon's stun proc in percentage points, preserving fractional chances. */
export function rollPlayerHitStunProc(chancePercent, roll = Math.random()) {
  const chance = Number(chancePercent);
  const safeRoll = Number(roll);
  if (!Number.isFinite(chance) || chance <= 0 || !Number.isFinite(safeRoll) || safeRoll < 0 || safeRoll >= 1) return false;
  return safeRoll * 100 < Math.min(100, chance);
}

/** Applies general received-critical resistance plus basic-only resistance when appropriate. */
export function applyPlayerBasicCriticalDamageReduction(damage, stats, isBasicAttack = true) {
  const amount = Math.max(0, Number(damage) || 0);
  if (amount === 0) return amount;
  const general = Math.max(0, Number(stats?.receivedCritDamageReductionPercent) || 0);
  const basic = isBasicAttack ? Math.max(0, Number(stats?.receivedBasicCritDamageReductionPercent) || 0) : 0;
  const reduction = Math.min(0.90, general + basic);
  return Math.floor(amount * (1 - reduction));
}

/** Rolls and resolves a physical skill critical using the player's passive skill-critical stats. */
export function resolvePhysicalSkillCriticalDamage(damage, stats, roll = Math.random()) {
  const amount = Math.max(0, Number(damage) || 0);
  const chance = Math.max(0, Math.min(100, Number(stats?.pSkillCritRate) || 0)) / 100;
  const safeRoll = Number(roll);
  const isCrit = amount > 0 && Number.isFinite(safeRoll) && safeRoll >= 0 && safeRoll < chance;
  if (!isCrit) return { damage: amount, isCrit: false };
  const critDamageBonus = Math.max(0, Number(stats?.pSkillCritDamagePercent) || 0);
  return { damage: Math.floor(amount * 1.5 * (1 + critDamageBonus)), isCrit: true };
}

/** Applies weapon-family resistance reported by the production monster attack profile. */
export function applyPlayerWeaponDamageReduction(damage, stats, weaponType) {
  const amount = Math.max(0, Number(damage) || 0);
  const family = String(weaponType || '').toLowerCase();
  const resistance = ['bow', 'crossbow'].includes(family)
    ? Number(stats?.bowResistancePercent) || 0
    : ['firearm', 'gun'].includes(family)
      ? Number(stats?.firearmsResistancePercent) || 0
      : 0;
  return Math.floor(amount * (1 - Math.max(0, Math.min(0.90, resistance))));
}

/** Applies physical or magical skill-power bonuses through the production damage path. */
export function applyPlayerSkillPowerBonus(damage, stats, attackType = 'physical') {
  const amount = Math.max(0, Number(damage) || 0);
  const key = attackType === 'magical' || attackType === 'magic' ? 'mSkillPowerPercent' : 'pSkillPowerPercent';
  const bonus = Math.max(0, Number(stats?.[key]) || 0);
  return Math.floor(amount * (1 + bonus));
}

/** Applies general and damage-type-specific reduction after other combat multipliers. */
export function applyPlayerDamageTakenReduction(damage, stats, attackType = null) {
  const amount = Math.max(0, Number(damage) || 0);
  if (amount === 0) return 0;
  const reduction = Math.max(0, Math.min(0.90, Number(stats?.damageTakenReductionPercent) || 0));
  let reduced = Math.floor(amount * (1 - reduction));
  if (['magic', 'magical'].includes(String(attackType || '').toLowerCase())) {
    const magicReduction = Math.max(0, Math.min(0.90, Number(stats?.magicDamageTakenReductionPercent) || 0));
    reduced = Math.floor(reduced * (1 - magicReduction));
  }
  return Math.max(1, reduced);
}

export function isHpRecoveryPotion(itemId, definition = {}) {
  const id = String(itemId || '').toLowerCase();
  const healAmount = Number(definition.healAmt ?? definition.amount) || 0;
  return healAmount > 0 && (id.startsWith('hp_potion') || id.endsWith('_healing_potion'));
}

/** Resolves a canonical Power value only for skills that explicitly recover HP. */
export function resolveSkillHealPower(def) {
  if (!def || !['buff', 'heal', 'active'].includes(def.type) && def.effect !== 'heal') return null;
  const source = getSkillEffectSource(def);
  const match = source.match(/^\s*(?:Recovers the target['’]s HP|Consumes your HP to recover HP of the target)\.\s*Power\s+(\d+)\b/i);
  if (!match) return null;
  const power = Number(match[1]);
  return Number.isSafeInteger(power) && power > 0 ? power : null;
}

/** Local solo-combat adaptation: Sacrifice pays 10% Max HP, leaving at least 1 HP. */
export function resolveSkillHpSacrificeCost(def, maxHp, currentHp = Number.MAX_SAFE_INTEGER) {
  const skillId = String(def?.id || '').toLowerCase();
  const costPercent = skillId === 'sacrifice' || skillId === 'touch_of_death' || skillId === 'body_to_mind' ? 0.10 : 0;
  if (costPercent <= 0) return 0;
  const safeMaxHp = Math.max(0, Number(maxHp) || 0);
  const safeCurrentHp = Math.max(0, Number(currentHp));
  if (!safeMaxHp || !Number.isFinite(safeCurrentHp)) return 0;
  const cost = Math.floor(safeMaxHp * costPercent);
  return Math.floor(safeCurrentHp) > cost ? cost : 0;
}

/** Converts a deliberate HP sacrifice into capped MP recovery for Body to Mind. */
export function resolveSkillMpRecoveryAmount(def, maxMp, currentMp = 0) {
  const configuredPercent = Number(def?.effectStats?.mpRecoveryPercent);
  if (Number.isFinite(configuredPercent) && configuredPercent > 0) {
    const limit = Math.max(0, Number(maxMp) || 0);
    const current = Math.max(0, Number(currentMp) || 0);
    return Math.min(Math.max(0, limit - current), Math.floor(limit * Math.min(0.50, configuredPercent)));
  }
  if (String(def?.id || '').toLowerCase() !== 'body_to_mind') return 0;
  const limit = Math.max(0, Number(maxMp) || 0);
  const current = Math.max(0, Number(currentMp) || 0);
  const power = Math.max(0, Math.floor(Number(def.balance?.pwr) || 90));
  return Math.min(Math.max(0, limit - current), power);
}

/** Converts active shock-attack-rate buffs into the combat proc's percentage points. */
export function getPlayerBuffShockChanceBonus(buffs, now = Date.now()) {
  return Object.values(buffs || {}).reduce((total, buff) => {
    if (!buff || Number(buff.until) <= now) return total;
    const rate = Number(buff.skillBuffStats?.shockAttackRatePercent) || 0;
    return total + Math.max(0, rate * 100);
  }, 0);
}

/** Lists active debuffs applied to the player by monster combat. */
const PLAYER_COMBAT_DEBUFF_IDS = Object.freeze(['monster_hex', 'monster_gloom']);
export function getActivePlayerCombatDebuffIds(state, now = Date.now()) {
  return PLAYER_COMBAT_DEBUFF_IDS.filter(id => {
    const entry = state?.buffs?.[id];
    return entry && Number(entry.until) > now;
  });
}

/** Removes only active monster-applied debuffs; ordinary class buffs remain intact. */
export function clearPlayerCombatDebuffs(state, now = Date.now()) {
  if (!state) return [];
  const ids = getActivePlayerCombatDebuffIds(state, now);
  for (const id of ids) delete state.buffs?.[id];
  for (const [id, debuff] of Object.entries(state._skillDebuffs || {})) {
    if (String(debuff?.source || id).startsWith('monster_skill_')) {
      delete state._skillDebuffs[id];
      ids.push(id);
    }
  }
  if (state._monsterSkillDamageOverTime) {
    state._monsterSkillDamageOverTime = null;
    ids.push('monster_skill_dot');
  }
  return ids;
}

export function getHpPotionHealAmount(baseHeal, stats) {
  const amount = Math.max(0, Number(baseHeal) || 0);
  const bonus = Math.max(0, Number(stats?.hpPotionEffectPercent) || 0);
  const receivedBonus = Math.max(0, Number(stats?.healingReceivedPercent) || 0);
  const healPower = Math.max(0, Number(stats?.healPower) || 0);
  return Math.floor(amount * (1 + bonus) * (1 + receivedBonus + healPower));
}

export function applyPlayerHealingReceivedBonus(amount, stats) {
  const base = Math.max(0, Number(amount) || 0);
  const bonus = Math.max(0, Number(stats?.healingReceivedPercent) || 0) + Math.max(0, Number(stats?.healPower) || 0);
  return Math.floor(base * (1 + bonus));
}

export function resolvePlayerDamageReflection(buffs, receivedDamage, now = Date.now()) {
  const damage = Math.max(0, Number(receivedDamage) || 0);
  if (damage <= 0) return 0;
  const reflectPercent = Object.values(buffs || {}).reduce((total, buff) => {
    if (!buff || Number(buff.until) <= now) return total;
    const percent = Number(buff.skillBuffStats?.reflectDamagePercent) || 0;
    return percent > 0 ? total + percent : total;
  }, 0);
  return Math.floor(damage * reflectPercent);
}

/** Applies the equipment-derived life-drain ratio to an actual player hit. */
export function applyPlayerLifesteal(damage, state, lifeDrain, maxHp = state?.maxHp) {
  const amount = Math.max(0, Number(damage) || 0);
  const ratio = Math.max(0, Number(lifeDrain) || 0);
  const hpLimit = Number(maxHp);
  const currentHp = Number(state?.hp);
  if (amount <= 0 || ratio <= 0 || !state || !Number.isFinite(hpLimit) || hpLimit <= 0 || !Number.isFinite(currentHp) || currentHp >= hpLimit) return 0;

  const rawHeal = Math.floor(amount * ratio);
  const healCap = Math.floor(hpLimit * 0.30);
  const healed = Math.min(Math.max(0, hpLimit - currentHp), healCap, rawHeal);
  if (healed > 0) state.hp = currentHp + healed;
  return healed;
}

/** Applies chance-based lifesteal procs stored on active self-buffs. */
export function applyPlayerBuffLifeDrainProc(damage, state, maxHp = state?.maxHp, now = Date.now(), random = Math.random) {
  const amount = Math.max(0, Number(damage) || 0);
  const hpLimit = Number(maxHp);
  const currentHp = Number(state?.hp);
  if (amount <= 0 || !state || !Number.isFinite(hpLimit) || hpLimit <= 0 || !Number.isFinite(currentHp) || currentHp >= hpLimit) return 0;

  let rawHeal = 0;
  for (const buff of Object.values(state.buffs || {})) {
    if (!buff || !(Number(buff.until) > now)) continue;
    const stats = buff.skillBuffStats || {};
    const chance = Math.max(0, Math.min(1, Number(stats.lifeDrainProcChance) || 0));
    const percent = Math.max(0, Number(stats.lifeDrainProcPercent) || 0);
    if (chance <= 0 || percent <= 0 || typeof random !== 'function') continue;
    const roll = Number(random());
    if (Number.isFinite(roll) && roll >= 0 && roll < chance) rawHeal += Math.floor(amount * percent);
  }

  const healed = Math.min(Math.max(0, hpLimit - currentHp), rawHeal);
  if (healed > 0) state.hp = currentHp + healed;
  return healed;
}

/** Tenacity's sourced on-hit recovery, bounded by its own five-second proc lock. */
export function applyPlayerBuffHitHealProc(state, maxHp = state?.maxHp, now = Date.now(), random = Math.random) {
  const hpLimit = Number(maxHp);
  const currentHp = Number(state?.hp);
  if (!state || !Number.isFinite(hpLimit) || !Number.isFinite(currentHp) || currentHp <= 0 || currentHp >= hpLimit) return 0;
  const buff = state.buffs?.tenacity;
  const stats = buff?.skillBuffStats;
  if (!buff || Number(buff.until) <= now || Number(buff.nextHitHealAt) > now) return 0;
  const chance = Math.max(0, Math.min(1, Number(stats?.hitHealProcChance) || 0));
  const percent = Math.max(0, Number(stats?.hitHealProcPercent) || 0);
  if (chance <= 0 || percent <= 0 || typeof random !== 'function') return 0;
  buff.nextHitHealAt = now + Math.max(0, Number(stats?.hitHealProcCooldownMs) || 0);
  const roll = Number(random());
  if (!Number.isFinite(roll) || roll < 0 || roll >= chance) return 0;
  const healed = Math.min(hpLimit - currentHp, Math.floor(hpLimit * percent));
  if (healed > 0) state.hp = currentHp + healed;
  return healed;
}

/** Mechanical Masterpiece turns the golem's extra blow into a short proc and one-second action lock. */
export function resolveMechanicalMasterpieceHit(state, target, damage, now = Date.now(), random = Math.random) {
  const buff = state?.buffs?.mechanical_masterpiece;
  const stats = buff?.skillBuffStats;
  const amount = Math.max(0, Number(damage) || 0);
  if (!target || amount <= 0 || !buff || Number(buff.until) <= now || typeof random !== 'function') return { extraDamage: 0, stunned: false };
  const chance = Math.max(0, Math.min(1, Number(stats.mechanicalMasterpieceProcChance) || 0));
  const roll = Number(random());
  if (chance <= 0 || !Number.isFinite(roll) || roll < 0 || roll >= chance) return { extraDamage: 0, stunned: false };
  const extraDamage = Math.floor(amount * Math.max(0, Number(stats.mechanicalMasterpieceExtraDamagePercent) || 0));
  target._skillDebuffs = target._skillDebuffs || {};
  target._skillDebuffs.mechanical_masterpiece = { stats: { actionsDisabled: 1 }, until: now + 1_000, source: 'mechanical_masterpiece' };
  return { extraDamage, stunned: true };
}

/** Returns only buff effects with a supported, explicit combat meaning. */
export function resolveSkillBuffStats(def, level = 1, context = {}) {
  if (!def || !['buff', 'harmony', 'toggle', 'passive', 'stat'].includes(def.type) && def.effect !== 'buff') return null;
  const id = String(def.id || '').toLowerCase();
  if (def.requiredWeapon === 'fist' && context.weaponCategory !== 'fist') return null;
  if (def.requiredWeapon === 'blunt' && !['blunt', 'staff'].includes(context.weaponCategory)) return null;
  if (def.requiredWeapon === 'light' && context.armorType !== 'light') return null;
  if (def.requiredWeapon === 'robe' && context.armorType !== 'robe') return null;
  if (['blessed_shield', 'advanced_block'].includes(id) && context.hasShield !== true) return null;
  if (def.effectStats && typeof def.effectStats === 'object') return { ...def.effectStats };
  if (KNOWN_BUFF_EFFECTS[id]) {
    const known = KNOWN_BUFF_EFFECTS[id];
    const stats = typeof known === 'function' ? known(level, context) : { ...known };
    if (!Number.isFinite(Number(stats.movementSpeedPercent))) {
      const movementSpeedPercent = resolveSkillMovementSpeedPercent(def, context);
      if (movementSpeedPercent) stats.movementSpeedPercent = movementSpeedPercent;
    }
    return stats;
  }

  const source = getSkillEffectSource(def);
  // Canonical data currently labels some target debuffs as buffs. Never apply
  // their negative attack/defense values to the player as a self-buff.
  if (/\btarget\b|weakens?\s+the\s+enemy|^\s*debuff\s*:/i.test(source)) return null;
  const stats = {};
  const reflection = source.match(/reflects\s+(\d+(?:\.\d+)?)\s*%\s+of\s+received\s+damage/i);
  if (reflection) stats.reflectDamagePercent = Number(reflection[1]) / 100;
  const movementSpeedPercent = resolveSkillMovementSpeedPercent(def, context);
  if (movementSpeedPercent) stats.movementSpeedPercent = movementSpeedPercent;
  const speedCooldownReduction = resolveSkillSpeedCooldownReduction(def, context);
  if (speedCooldownReduction > 0) stats.cdr = speedCooldownReduction;
  const explicitCooldownReduction = resolveSkillCooldownReduction(def, context);
  for (const [sourceKey, statKey] of [['cdr', 'cdr'], ['pSkillCdr', 'pSkillCdr'], ['mSkillCdr', 'mSkillCdr']]) {
    if (explicitCooldownReduction[sourceKey] > 0) {
      stats[statKey] = Math.round(((stats[statKey] || 0) + explicitCooldownReduction[sourceKey]) * 1e8) / 1e8;
    }
  }
  for (const { labels, flat, percent } of BUFF_STAT_LABELS) {
    const pattern = new RegExp(`(?:${labels})\\s*([+-]\\s*\\d+(?:\\.\\d+)?)\\s*(%)?`, 'i');
    const match = source.match(pattern);
    if (!match) continue;
    const amount = Number(match[1].replace(/\s/g, ''));
    if (!Number.isFinite(amount) || amount === 0) continue;
    const key = match[2] ? percent : flat;
    if (key) {
      if (key === 'mpCostReduction') stats[key] = -(amount / 100);
      else if (key === 'movementSpeedPercent') stats[key] = amount / 100;
      else if (key === 'cdr' || key === 'pveDamagePercent') stats[key] = amount / 100;
      else stats[key] = match[2] ? amount / 100 : amount;
    }
  }
  return Object.keys(stats).length ? stats : null;
}
