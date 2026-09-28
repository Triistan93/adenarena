import '/lineage-idle/src/data/items/index.js';
import '/lineage-idle/src/data/classes/index.js';
import '/lineage-idle/data/echo-adapter.js';
import { attackMonster, monsterAttack, setRoot, switchSubclass, useItem } from '/lineage-idle/main.js';
import { getState, DEFAULT_STATE } from '/lineage-idle/src/core/StateManager.js';
import { getEquippedWeaponInfo, getStats } from '/lineage-idle/src/engine/StatsEngine.js';
import { spendSP, getSkillCost } from '/lineage-idle/src/engine/SkillEngine.js';
import { removeFromInventory } from '/lineage-idle/src/services/InventoryService.js';
import { equipSkill } from '/lineage-idle/src/services/SkillLoadoutService.js';
import { resolveV2ClassContext, getSkillUnlockLevelForClass, isSkillInProgressionPath, isSkillAvailableForCharacter, normalizeAndValidateSkills } from '/lineage-idle/src/services/SkillEligibility.js';
import { CANONICAL_CLASS_REGISTRY as classes } from '/lineage-idle/src/data/classes/CanonicalClassRegistry.js';
import { combatEvents, CombatEventType } from '/lineage-idle/src/vfx/CombatEvent.js';
import { MONSTER_ARCHETYPES, MonsterAIEngine } from '/lineage-idle/src/engine/MonsterAIEngine.js';
import { getSkillMpCost } from '/lineage-idle/src/data/balance/skillBalance.js';
import { applyPlayerBuffLifeDrainProc, getActivePlayerCombatDebuffIds, getActiveSkillDebuffStats, getDebuffedMonsterAttack, getDebuffedMonsterAttackSpeed, getDebuffedMonsterDefense, getDebuffedMonsterSkillCooldownMultiplier, resolvePlayerBasicAttackIntervalMs, resolveSkillHealPower, resolveSkillSelfHealPercent } from '/lineage-idle/src/services/SkillEffectService.js';
import { calculateHealAmount } from '/lineage-idle/src/data/balance/combatBalance.js';
import { promoteClass, isSkillAllowedForClass } from '/lineage-idle/src/services/CharacterService.js';
import { getSkillTreeViewModel } from '/lineage-idle/src/services/SkillTreeViewModel.js';
import { SubclassCertificationService, SUBCLASS_ARCHETYPES } from '/lineage-idle/src/services/SubclassCertificationService.js';
import { EFFECT_CONTRACTS, assessEffect, assessEffectCoverage } from './functional-evidence.mjs';

setRoot(document);
const defs = window.EchoData.SKILL_DEFS_ECHO;
const numericStats = state => Object.fromEntries(Object.entries({ ...getStats(state), ...(state.primaryStats || {}) }).filter(([, v]) => typeof v === 'number' && Number.isFinite(v)));
const numericTargetStats = (target, now = Date.now()) => ({
  atk: getDebuffedMonsterAttack(target, target.atk, 'physical', now),
  matk: getDebuffedMonsterAttack(target, target.matk || target.atk, 'magical', now),
  attackSpeed: getDebuffedMonsterAttackSpeed(target, now),
  movementSpeedPercent: Number(getActiveSkillDebuffStats(target, now).movementSpeedPercent) || 0,
  basicAttackIntervalMs: Math.max(400, Math.round(1500 / getDebuffedMonsterAttackSpeed(target, now))),
  skillCooldown: getDebuffedMonsterSkillCooldownMultiplier(target, now),
  damageTakenPercent: Number(getActiveSkillDebuffStats(target, now).damageTakenPercent) || 0,
  magicSkillsSilenced: Number(getActiveSkillDebuffStats(target, now).magicSkillsSilenced) || 0,
  actionsDisabled: Number(getActiveSkillDebuffStats(target, now).actionsDisabled) || 0,
  ...getDebuffedMonsterDefense(target, now)
});
const bookCount = state => state.inventory.filter(i => /book/.test(i.itemId)).reduce((n, i) => n + (i.count ?? 1), 0);

const CONTENT_GAP_CLASSES = new Set([
  'spirit_0', 'marauderBase', 'sayhaMageBase'
]);

const UNPROVEN_PROVENANCE_CLASSES = new Set([
  'marauder', 'ertheiaWarrior', 'eviscerator',
  'sayhaSeer', 'windRiderErth', 'sayhaSeeker'
]);

export function prepare(classId, level, def, skillId) {
  const state = getState();
  for (const key of Object.keys(state)) delete state[key];
  Object.assign(state, DEFAULT_STATE(), { class: classId, race: classes[classId].race, level, sp: 100000, skills: {}, buffs: {}, _cds: {}, skillLoadout: {}, skillConditions: {}, skillAutoCast: {}, equipment: {}, inventory: [], autoPotionActive: false });
  for (let star = 1; star <= 5; star++) state.inventory.push({ uid: `book-${star}`, itemId: `book_${star}star`, count: 10 });
  
  // Weapon selection matching the skill requirement or weapon mastery
  let weapon = def?.requiredWeapon && def.requiredWeapon !== 'any' ? def.requiredWeapon : 'sword';
  const sid = skillId || def?.id || '';
  if (/bow_mastery|bow|long_shot/.test(sid)) weapon = 'bow';
  else if (/dagger_mastery|dagger/.test(sid)) weapon = 'dagger';
  else if (/polearm_mastery|polearm|spear/.test(sid)) weapon = 'spear';
  else if (/dual_weapon_mastery|dual/.test(sid)) weapon = 'dual';
  else if (/fist_mastery|fist/.test(sid)) weapon = 'fist';
  else if (/two_handed_weapon_mastery/.test(sid)) weapon = 'two_hand_sword';
  else if (/sword_blunt_mastery/.test(sid)) weapon = 'sword';

  const isTwoHanded = weapon === 'two_hand_sword';
  state.inventory.push({ uid: 'audit-weapon', itemId: `audit_${weapon}`, type: weapon, weaponType: weapon, isTwoHanded, slot: 'weapon', atk: 10, matk: 10, count: 1 });
  state.equipment.weapon = 'audit-weapon';

  // Armor selection matching armor mastery
  let armorType = 'heavy';
  if (/light_armor_mastery/.test(sid)) armorType = 'light';
  else if (/robe_mastery/.test(sid)) armorType = 'robe';
  else if (/heavy_armor_mastery/.test(sid)) armorType = 'heavy';
  state.inventory.push({ uid: 'audit-armor', itemId: `audit_${armorType}_armor`, type: armorType, armorType, slot: 'armor', def: 20, count: 1 });
  state.equipment.armor = 'audit-armor';

  if (def?.requiredShield || /shield_mastery/.test(sid) || ['blessed_shield', 'advanced_block', 'armor_care'].includes(sid)) {
    state.inventory.push({ uid: 'audit-shield', itemId: 'audit_shield', slot: 'shield', type: 'shield', def: 20, count: 1 });
    state.equipment.shield = 'audit-shield';
  }
  if (/sigil_mastery/.test(sid)) {
    state.inventory.push({ uid: 'audit-sigil', itemId: 'audit_sigil', slot: 'sigil', type: 'sigil', count: 1 });
    state.equipment.sigil = 'audit-sigil';
  }
  return state;
}

export function exercise(classId, skillId, inheritedFrom = null, mutation = null, fixedLevel = null, liveState = null) {
  const def = defs[skillId];
  const row = { classId, skillId, inheritedFrom, mutation, checks: [] };
  if (!def) { row.checks.push({ name: 'definition', pass: false }); return row; }
  if (skillId === 'inferno' || skillId === 'touch_of_death') {
    const runtimeDef = defs[skillId];
    row.runtimeDefinition = { type: runtimeDef.type, effect: runtimeDef.effect, pwr: runtimeDef.pwr, canonicalEffect: runtimeDef.canonicalEffect };
  }

  const isContentGap = CONTENT_GAP_CLASSES.has(classId);
  const isUnproven = UNPROVEN_PROVENANCE_CLASSES.has(classId);
  row.classAssignment = {
    status: isContentGap ? 'BLOCKED_CONTENT_GAP' : isUnproven ? 'BLOCKED_UNPROVEN_PROVENANCE' : 'PROVENANCE_VALIDATED',
    validated: !isContentGap && !isUnproven
  };

  const isStage0Starter = (classes[classId].minLevel === 1 && (skillId === 'hellfire' || def.isStage0Starter));
  const level = fixedLevel ?? (isStage0Starter ? 1 : Math.max(classes[classId].minLevel, Number(def.requiredLevel || def.reqLvl) || 1, getSkillUnlockLevelForClass(classId, skillId)));
  row.level = level;
  const contract = EFFECT_CONTRACTS[skillId];
  const state = liveState || prepare(classId, level, def, skillId);
  state._cds = {}; state.buffs = {};
  if (contract?.kind === 'cleanse') state.buffs.monster_hex = { until: Date.now() + 10_000, skillBuffStats: {} };
  // Exercise one selected skill at a time. Otherwise inherited autocast
  // entries can emit damage/debuff events that are wrongly attributed to the
  // skill under test (or kill/alter its target first).
  state.skillAutoCast = Object.fromEntries([...new Set([...Object.keys(state.skills || {}), skillId])].map(id => [id, id === skillId]));
  const messages = [];
  const before = numericStats(state);
  const spBefore = state.sp, booksBefore = bookCount(state);
  const alreadyLearned = (state.skills[skillId] || 0) > 0;
  const cost = alreadyLearned ? 0 : getSkillCost(skillId, 0, state);
  const learned = alreadyLearned || spendSP(state, skillId, { log: m => messages.push(m), removeFromInventory: (uid, count) => removeFromInventory(state, uid, count) });
  row.checks.push({ name: alreadyLearned ? 'retainedLearning' : 'learning', pass: learned === true && state.skills[skillId] > 0, messages });
  row.checks.push({ name: 'spDebit', expected: cost, observed: spBefore - state.sp, pass: learned && spBefore - state.sp === cost });
  const bookRequired = !alreadyLearned && (def.requiredItemToUnlock || (def.starRank === 5 ? 'book_5star' : def.starRank === 4 ? 'book_4star' : null));
  row.checks.push({ name: 'bookDebit', expected: bookRequired ? 1 : 0, observed: booksBefore - bookCount(state), pass: learned && booksBefore - bookCount(state) === (bookRequired ? 1 : 0) });

  if (!learned) {
    row.effect = assessEffect(contract, { preconditionsMet: false, learningSucceeded: false });
    row.dispatch = { status: 'NOT_EXECUTED', reason: 'Learning failed; production combat must not be used as evidence for this skill' };
    return row;
  }
  if (def.type === 'passive' || def.type === 'stat') {
    if (mutation === 'suppressPassive') state.skills = new Proxy(state.skills, { get: (o, k) => k === skillId ? 0 : o[k] });
    if (mutation === 'ignoreArmorCompatibility') {
      state.equipment.armor = 'audit-robe-incompatible';
      state.inventory.push({ uid: 'audit-robe-incompatible', itemId: 'audit_robe_incompatible', type: 'robe', armorType: 'robe', slot: 'armor', def: 20, count: 1 });
    }
    if (mutation === 'ignoreWeaponCompatibility') {
      state.equipment.weapon = 'audit-sword-incompatible';
      state.inventory.push({ uid: 'audit-sword-incompatible', itemId: 'audit_sword_incompatible', type: 'sword', weaponType: 'sword', isTwoHanded: false, slot: 'weapon', atk: 10, matk: 10, count: 1 });
    }
    const after = numericStats(state);
    const consumerProof = contract?.consumer === 'basic_attack_interval' ? {
      baselineIntervalMs: resolvePlayerBasicAttackIntervalMs(before),
      reducedIntervalMs: resolvePlayerBasicAttackIntervalMs(after),
      productionConsumer: 'main.resolvePlayerBasicAttackIntervalMs'
    } : undefined;
    if (contract?.kind === 'periodic_regen') {
      const resource = contract.resource;
      state.zone = 'audit-zone';
      state.isRaidActive = false;
      state.isCombatActive = true;
      state.target = 'audit-target';
      state.activeMonster = { id: 'audit-target', name: 'Audit recovery target', hp: 1e9, maxHp: 1e9, atk: 0, matk: 0, def: 0, mdef: 0, level: 1, atkSpd: 2, isRaid: true };
      state.maxHp = after.maxHp;
      state.maxMp = after.maxMp;
      state.hp = resource === 'hp' ? Math.max(1, after.maxHp - 100) : after.maxHp;
      state.mp = resource === 'mp' ? Math.max(1, after.maxMp - 20) : after.maxMp;
      state._regenAcc = 0;
      state._mpRegenAcc = 0;
      state.autoPotionActive = false;
      state.autoPotionSettings = { autoHp: false, autoMp: false };
      const resourceBefore = state[resource];
      for (let tick = 0; tick < contract.ticks; tick++) attackMonster();
      const resourceAfter = state[resource];
      row.effect = assessEffect(contract, {
        before,
        after,
        resourceBefore,
        resourceAfter,
        resourceGained: resourceAfter - resourceBefore,
        ticks: contract.ticks,
        productionConsumer: 'main.attackMonster'
      });
      row.dispatch = { path: 'main.attackMonster', browser: true, ticks: contract.ticks };
      return row;
    }
    row.effect = assessEffect(contract, { before, after, consumerProof, deltas: Object.entries(after).filter(([k, v]) => v !== before[k]).map(([stat, value]) => ({ stat, before: before[stat], after: value })) });
    row.dispatch = { path: 'StatsEngine.getStats', browser: true };
    return row;
  }

  const equipped = equipSkill(state, 'core1', skillId);
  row.checks.push({ name: 'equip', ...equipped, pass: equipped.success === true });
  if (equipped.success !== true) {
    row.effect = assessEffect(contract, { preconditionsMet: false, learningSucceeded: true, equipSucceeded: false });
    row.dispatch = { status: 'NOT_EXECUTED', reason: 'Equip failed; production combat must not be used as evidence for this skill' };
    return row;
  }
  state.zone = null;
  state.isRaidActive = true;
  state.isCombatActive = true;
  state.target = 'audit-target';
  // Use nontrivial defense/attack values so percentage effects remain measurable
  // after integer combat rounding; avoid autonomous retaliation in this harness.
  state.activeMonster = { id: 'audit-target', name: 'Audit target', hp: 1e9, maxHp: 1e9, atk: 100, matk: 100, def: 100, mdef: 100, level: 1, atkSpd: 2, isRaid: true };
  if (skillId === 'vitalize') {
    const supportMonster = { atk: 100, matk: 100, hp: 1000, _maxHp: 1000, _aiState: { archetype: MONSTER_ARCHETYPES.SUPPORT } };
    const originalRandom = Math.random;
    const rolls = [0.5, 0.1, 0.25, 0.5, 0.1, 0.75];
    let rollIndex = 0;
    try {
      Math.random = () => rolls[rollIndex++] ?? 0.5;
      MonsterAIEngine.processMonsterAttack(supportMonster, getStats(state), state);
      MonsterAIEngine.processMonsterAttack(supportMonster, getStats(state), state);
    } finally {
      Math.random = originalRandom;
    }
  }
  const stats = getStats(state);
  state.maxHp = stats.maxHp; state.hp = Math.floor(stats.maxHp / 2);
  state.maxMp = stats.maxMp; state.mp = Math.max(stats.maxMp, 10000);
  if (skillId === 'body_to_mind') state.mp = Math.floor(stats.maxMp / 2);
  if (mutation === 'fullHealth') state.hp = state.maxHp;
  state._lastAttackTime = Date.now();
  const events = [];
  const listener = event => events.push({ skillId: event.skillId, damage: event.damage, isCrit: event.isCrit, source: event.source, hpBefore: event.hpBefore, hpAfter: event.hpAfter, hitIndex: event.hitIndex, hitCount: event.hitCount, targetDefenseBefore: event.targetDefenseBefore, effectiveDefense: event.effectiveDefense, defenseIgnorePercent: event.defenseIgnorePercent });
  combatEvents.on(CombatEventType.SKILL_DAMAGE, listener);
  const hpBefore = state.activeMonster.hp, playerHpBefore = state.hp, mpBefore = state.mp;
  const expectedMp = getSkillMpCost(def, state.level, state);
  const buffsBefore = numericStats(state);
  const playerDebuffsBefore = getActivePlayerCombatDebuffIds(state);
  const targetStatsBefore = numericTargetStats(state.activeMonster);
  const hpTransitions = [];
  let trackedHp;
  if (contract?.kind === 'sacrifice_heal') {
    trackedHp = state.hp;
    Object.defineProperty(state, 'hp', {
      configurable: true,
      enumerable: true,
      get: () => trackedHp,
      set: value => { hpTransitions.push({ before: trackedHp, after: value }); trackedHp = value; }
    });
  }
  if (mutation === 'suppressBuff') state.buffs = new Proxy({}, { set: () => true });
  if (mutation === 'suppressDamage') state.activeMonster = new Proxy(state.activeMonster, { set: (o, k, v) => k === 'hp' ? true : Reflect.set(o, k, v) });
  if (mutation === 'suppressHeal') {
    const origHp = state.hp;
    Object.defineProperty(state, 'hp', { get: () => origHp, set: () => {}, configurable: true });
  }
  try {
    attackMonster();
    if (contract?.kind === 'sacrifice_heal') {
      delete state.hp;
      state.hp = trackedHp;
    }
    const cast = Object.hasOwn(state._cds, skillId);
    const playerHpAfterCast = state.hp;
    const hpAfter = state.activeMonster.hp;
    row.checks.push({ name: 'productionCast', pass: cast });
    const expectedMpDelta = contract?.kind === 'resource_trade'
      ? -Math.min(Math.max(0, stats.maxMp - mpBefore), contract.mpRecoveryPower)
      : expectedMp;
    row.checks.push({ name: 'productionMpDebit', expected: expectedMpDelta, observed: mpBefore - state.mp, pass: cast && mpBefore - state.mp === expectedMpDelta });
    let evidence = { skillId, events, hpBefore, hpAfter, cast };
    if (contract?.kind === 'heal') evidence = { cast, hpBefore: playerHpBefore, hpAfter: state.hp, maxHp: stats.maxHp };
    if (contract?.kind === 'resource_trade') evidence = {
      cast,
      hpBefore: playerHpBefore,
      hpAfter: state.hp,
      maxHp: stats.maxHp,
      maxMp: stats.maxMp,
      hpCost: playerHpBefore - state.hp,
      mpBefore,
      mpAfter: state.mp,
      mpRecovered: state.mp - mpBefore
    };
    if (contract?.kind === 'sacrifice_heal') evidence = {
      cast,
      hpBefore: playerHpBefore,
      hpAfter: state.hp,
      maxHp: stats.maxHp,
      hpCost: hpTransitions.reduce((total, transition) => total + Math.max(0, transition.before - transition.after), 0),
      healPower: resolveSkillHealPower(def),
      expectedHeal: Math.min(
        stats.maxHp - playerHpBefore + hpTransitions.reduce((total, transition) => total + Math.max(0, transition.before - transition.after), 0),
        calculateHealAmount({ maxHp: stats.maxHp, matk: stats.matk, skillLvl: state.skills[skillId], pwr: resolveSkillHealPower(def) })
      )
    };
    if (contract?.kind === 'heal_and_cleanse') evidence = {
      cast,
      hpBefore: playerHpBefore,
      hpAfter: state.hp,
      maxHp: stats.maxHp,
      healPower: resolveSkillHealPower(def),
      expectedHeal: Math.min(stats.maxHp - playerHpBefore, calculateHealAmount({ maxHp: stats.maxHp, matk: stats.matk, skillLvl: row.level, pwr: resolveSkillHealPower(def) })),
      cleansedDebuffs: playerDebuffsBefore.filter(id => !state.buffs[id])
    };
    if (contract?.kind === 'cleanse') evidence = {
      cast,
      debuffsBefore: playerDebuffsBefore,
      cleansedDebuffs: playerDebuffsBefore.filter(id => !state.buffs[id])
    };
    if (contract?.kind === 'buff') {
      const buff = state.buffs[skillId];
      const now = Date.now;
      const after = numericStats(state);
      let expired;
      try { Date.now = () => (buff?.until || now()) + 1; expired = numericStats(state); } finally { Date.now = now; }
      let consumerProof;
      if (contract.consumer === 'basic_attack_interval') {
        consumerProof = {
          baselineIntervalMs: resolvePlayerBasicAttackIntervalMs(buffsBefore),
          reducedIntervalMs: resolvePlayerBasicAttackIntervalMs(after),
          productionConsumer: 'main.resolvePlayerBasicAttackIntervalMs'
        };
      } else if (contract.consumer === 'incoming_damage_reduction') {
        const buffSnapshot = state.buffs;
        const targetSnapshot = state.activeMonster;
        const hpBeforeIncoming = state.hp;
        const originalRandom = Math.random;
        const originalSkills = state.skills;
        const originalLoadout = state.skillLoadout;
        const originalAutoCast = state.skillAutoCast;
        const originalCooldowns = state._cds;
        const originalMp = state.mp;
        const originalTargetHp = targetSnapshot.hp;
        let baselineDamage = 0;
        let reducedDamage = 0;
        let physicalSkillDamageBefore = 0;
        let physicalSkillDamageAfter = 0;
        try {
          Math.random = () => 0.99;
          state.buffs = { ...buffSnapshot };
          delete state.buffs[skillId];
          monsterAttack(targetSnapshot);
          baselineDamage = hpBeforeIncoming - state.hp;
          state.hp = hpBeforeIncoming;
          state.buffs = buffSnapshot;
          monsterAttack(targetSnapshot);
          reducedDamage = hpBeforeIncoming - state.hp;

          const physicalSkillDamage = includeBuff => {
            state.hp = hpBeforeIncoming;
            state.mp = Math.max(10_000, Number(originalMp) || 0);
            state.buffs = includeBuff ? buffSnapshot : { ...buffSnapshot, [skillId]: undefined };
            if (!includeBuff) delete state.buffs[skillId];
            state.skills = { ...originalSkills, power_strike: 1 };
            state.skillLoadout = { core1: 'power_strike' };
            state.skillAutoCast = {};
            state._cds = {};
            targetSnapshot.hp = 1_000_000_000;
            const firstEvent = events.length;
            attackMonster();
            return events.slice(firstEvent).filter(event => event.skillId === 'power_strike').reduce((sum, event) => sum + (Number(event.damage) || 0), 0);
          };
          physicalSkillDamageBefore = physicalSkillDamage(false);
          physicalSkillDamageAfter = physicalSkillDamage(true);
          state.skills = originalSkills;
          state.skillLoadout = originalLoadout;
          state.skillAutoCast = originalAutoCast;
          state._cds = originalCooldowns;
          state.mp = originalMp;
          targetSnapshot.hp = originalTargetHp;
        } finally {
          Math.random = originalRandom;
          state.hp = hpBeforeIncoming;
          state.buffs = buffSnapshot;
          state.activeMonster = targetSnapshot;
          state.skills = originalSkills;
          state.skillLoadout = originalLoadout;
          state.skillAutoCast = originalAutoCast;
          state._cds = originalCooldowns;
          state.mp = originalMp;
          targetSnapshot.hp = originalTargetHp;
        }
        consumerProof = { baselineDamage, reducedDamage, physicalSkillDamageBefore, physicalSkillDamageAfter, productionConsumer: ['main.monsterAttack', 'main.attackMonster'] };
      } else if (contract.consumer === 'chant_vampire_lifedrain') {
        const target = state.activeMonster;
        const targetHpInitial = target.hp;
        const playerHpBeforeProc = state.hp;
        const originalRandom = Math.random;
        let procDamage = 0;
        let procHealing = 0;
        let controlDamage = 0;
        let controlHealing = 0;
        try {
          state.hp = Math.floor(stats.maxHp / 2);
          target.hp = 1_000_000_000;
          Math.random = () => 0.79;
          for (let attempt = 0; attempt < 20 && target.hp === 1_000_000_000; attempt++) attackMonster();
          procDamage = 1_000_000_000 - target.hp;
          procHealing = state.hp - Math.floor(stats.maxHp / 2);

          state.hp = Math.floor(stats.maxHp / 2);
          target.hp = 1_000_000_000;
          Math.random = () => 0.80;
          for (let attempt = 0; attempt < 20 && target.hp === 1_000_000_000; attempt++) attackMonster();
          controlDamage = 1_000_000_000 - target.hp;
          controlHealing = state.hp - Math.floor(stats.maxHp / 2);
        } finally {
          Math.random = originalRandom;
          state.hp = playerHpBeforeProc;
          target.hp = targetHpInitial;
        }
        consumerProof = {
          procDamage, procHealing, controlDamage, controlHealing,
          baselineIntervalMs: resolvePlayerBasicAttackIntervalMs(buffsBefore),
          reducedIntervalMs: resolvePlayerBasicAttackIntervalMs(after),
          productionConsumer: 'main.attackMonster -> applyPlayerBuffLifeDrainProc'
        };
      } else if (contract.consumer === 'mechanical_masterpiece_proc') {
        const target = state.activeMonster;
        const targetHpBefore = target.hp;
        const originalRandom = Math.random;
        try {
          Math.random = () => 0;
          state._cds = {};
          state._lastAttackTime = Date.now() - 10_000;
          for (let attempt = 0; attempt < 10 && !events.some(event => event.skillId === 'mechanical_masterpiece' && event.source === 'mechanical_golem'); attempt++) attackMonster();
        } finally { Math.random = originalRandom; }
        const bonusDamage = events.filter(event => event.skillId === 'mechanical_masterpiece' && event.source === 'mechanical_golem').reduce((sum, event) => sum + (Number(event.damage) || 0), 0);
        consumerProof = {
          bonusDamage,
          targetLocked: Number(target._skillDebuffs?.mechanical_masterpiece?.until) > Date.now(),
          targetHpBefore,
          targetHpAfter: target.hp,
          productionConsumer: 'main.attackMonster -> resolveMechanicalMasterpieceHit'
        };
      } else if (contract.consumer === 'stun_attack_proc') {
        const target = state.activeMonster;
        const originalRandom = Math.random;
        try {
          Math.random = () => 0.05;
          state._cds = {};
          state._lastAttackTime = Date.now() - 10_000;
          target._stunnedUntil = 0;
          for (let attempt = 0; attempt < 12 && Number(target._stunnedUntil) <= Date.now(); attempt++) attackMonster();
        } finally { Math.random = originalRandom; }
        consumerProof = {
          targetStunned: Number(target._stunnedUntil) > Date.now(),
          productionConsumer: 'main.attackMonster -> getEquippedProcBonuses'
        };
      } else if (Number.isFinite(contract.reflectPercent)) {
        const target = state.activeMonster;
        const targetHpBefore = target.hp;
        const targetAttackBefore = target.atk;
        const buffsBeforeReflection = state.buffs;
        const playerHpBeforeHit = state.hp;
        const originalRandom = Math.random;
        try {
          // The default audit target deals only single-digit damage, which
          // rounds a 10% reflection down to zero. Raise its attack for this
          // isolated production-path proof, then restore it.
          target.atk = Math.max(Number(target.atk) || 0, 1_000);
          state.buffs = { [skillId]: buff };
          Math.random = () => 0.99;
          monsterAttack(target);
        } finally { Math.random = originalRandom; target.atk = targetAttackBefore; state.buffs = buffsBeforeReflection; }
        consumerProof = {
          receivedDamage: playerHpBeforeHit - state.hp,
          reflectedDamage: targetHpBefore - target.hp,
          productionConsumer: 'main.monsterAttack -> resolvePlayerDamageReflection'
        };
      }
      evidence = { before: buffsBefore, after, expired, applied: !!buff, expiresInMs: buff ? buff.until - now() : null, ...(Number.isFinite(contract.healPercent) ? { hpBefore: playerHpBefore, maxHp: stats.maxHp, healAmount: playerHpAfterCast - playerHpBefore } : {}), ...(consumerProof ? { consumerProof } : {}) };
    }
    if (contract?.kind === 'damage_reflection') {
      const buff = state.buffs[skillId];
      const reflectedTarget = state.activeMonster;
      const targetHpBefore = reflectedTarget.hp;
      const playerHpBeforeHit = state.hp;
      const originalRandom = Math.random;
      try {
        Math.random = () => 0.99;
        monsterAttack(reflectedTarget);
      } finally {
        Math.random = originalRandom;
      }
      evidence = {
        applied: !!buff,
        expiresInMs: buff ? buff.until - Date.now() : null,
        receivedDamage: playerHpBeforeHit - state.hp,
        reflectedDamage: targetHpBefore - reflectedTarget.hp
      };
    }
    if (contract?.kind === 'target_debuff' || contract?.kind === 'damage_and_target_debuff') {
      const debuff = state.activeMonster._skillDebuffs?.[skillId];
      const after = numericTargetStats(state.activeMonster);
      const expired = numericTargetStats(state.activeMonster, (debuff?.until || Date.now()) + 1);
      evidence = {
        before: targetStatsBefore,
        after,
        expired,
        applied: !!debuff,
        expiresInMs: debuff ? debuff.until - Date.now() : null,
        playerHpBeforeCast: playerHpBefore,
        playerHpAfterCast,
        maxHp: numericStats(state).maxHp,
        ...(Number.isFinite(contract.hpCostPercent) ? { hpBefore: playerHpBefore, hpAfter: state.hp, maxHp: numericStats(state).maxHp } : {}),
        ...(contract.kind === 'damage_and_target_debuff' ? { cast, skillId, events, hpBefore, hpAfter } : {})
      };
      if (contract.consumer === 'monster_speed_slow' || contract.consumer === 'monster_movement_slow') {
        evidence.consumerProof = {
          basicAttackSpeedBefore: targetStatsBefore.attackSpeed,
          basicAttackSpeedAfter: after.attackSpeed,
          basicAttackIntervalBefore: targetStatsBefore.basicAttackIntervalMs,
          basicAttackIntervalAfter: after.basicAttackIntervalMs,
          skillCooldownBefore: targetStatsBefore.skillCooldown,
          skillCooldownAfter: after.skillCooldown,
          productionConsumer: contract.consumer === 'monster_movement_slow'
            ? 'main.attackMonster.enemyAttackInterval'
            : 'main.monsterAttack'
        };
      }
      if (skillId === 'silence') {
        const liveMonster = state.activeMonster;
        const playerHpBeforeProof = state.hp;
        const controlMonster = {
          ...liveMonster,
          boss: true,
          magic: true,
          skill: { name: 'Audit Arcane Bolt', type: 'magical', mult: 1.4, cd: 4 },
          _skillDebuffs: {},
          _skillCooldownUntil: 0
        };
        let controlDamage = 0;
        let silencedDamage = 0;
        let controlCooldown = 0;
        let silencedCooldown = 0;
        const originalRandom = Math.random;
        try {
          Math.random = () => 0.99;
          state.activeMonster = controlMonster;
          state.hp = playerHpBeforeProof;
          monsterAttack(controlMonster);
          controlDamage = playerHpBeforeProof - state.hp;
          controlCooldown = controlMonster._skillCooldownUntil || 0;

          liveMonster.boss = true;
          liveMonster.magic = true;
          liveMonster.skill = { name: 'Audit Arcane Bolt', type: 'magical', mult: 1.4, cd: 4 };
          liveMonster._skillCooldownUntil = 0;
          state.activeMonster = liveMonster;
          state.hp = playerHpBeforeProof;
          monsterAttack(liveMonster);
          silencedDamage = playerHpBeforeProof - state.hp;
          silencedCooldown = liveMonster._skillCooldownUntil || 0;
        } finally {
          Math.random = originalRandom;
          state.activeMonster = liveMonster;
          state.hp = playerHpBeforeProof;
        }
        evidence.consumerProof = { controlDamage, silencedDamage, controlCooldown, silencedCooldown };
      }
      if (contract.consumer === 'monster_action_lock') {
        const liveMonster = state.activeMonster;
        const playerHpOriginal = state.hp;
        const playerHpBeforeProof = Math.max(1_000_000_000, Number(playerHpOriginal) || 0);
        const spell = { name: 'Audit Arcane Bolt', type: 'magical', mult: 1.4, cd: 4 };
        const originalRandom = Math.random;
        const originalDateNow = Date.now;
        const originalFields = {
          skill: liveMonster.skill, boss: liveMonster.boss, magic: liveMonster.magic,
          debuffs: liveMonster._skillDebuffs, cooldown: liveMonster._skillCooldownUntil, hp: liveMonster.hp
        };
        const lockUntil = originalDateNow() + (contract.expectedDurationMs || 2_000);
        const runAction = (withSkill, locked, at) => {
          Date.now = () => at;
          state.hp = playerHpBeforeProof;
          liveMonster.hp = Math.max(1_000_000_000, Number(originalFields.hp) || 0);
          liveMonster.boss = true;
          liveMonster.magic = true;
          liveMonster.skill = withSkill ? spell : null;
          liveMonster._skillCooldownUntil = 0;
          liveMonster._skillDebuffs = locked
            ? { [skillId]: { stats: { actionsDisabled: 1 }, until: lockUntil, source: skillId } }
            : {};
          monsterAttack(liveMonster);
          return {
            damage: playerHpBeforeProof - state.hp,
            cooldown: liveMonster._skillCooldownUntil || 0
          };
        };
        let basicDamageBefore = 0;
        let basicDamageWhileDisabled = 0;
        let basicDamageAfterExpiry = 0;
        let skillDamageBefore = 0;
        let skillDamageWhileDisabled = 0;
        let skillDamageAfterExpiry = 0;
        let skillCooldownWhileDisabled = 0;
        try {
          Math.random = () => 0.99;
          state.activeMonster = liveMonster;
          basicDamageBefore = runAction(false, false, lockUntil - (contract.expectedDurationMs || 2_000));
          basicDamageWhileDisabled = runAction(false, true, lockUntil - 1);
          basicDamageAfterExpiry = runAction(false, true, lockUntil + 1);
          skillDamageBefore = runAction(true, false, lockUntil - (contract.expectedDurationMs || 2_000));
          skillDamageWhileDisabled = runAction(true, true, lockUntil - 1);
          skillCooldownWhileDisabled = liveMonster._skillCooldownUntil || 0;
          skillDamageAfterExpiry = runAction(true, true, lockUntil + 1);
        } finally {
          Math.random = originalRandom;
          Date.now = originalDateNow;
          state.activeMonster = liveMonster;
          state.hp = playerHpOriginal;
          liveMonster.skill = originalFields.skill;
          liveMonster.boss = originalFields.boss;
          liveMonster.magic = originalFields.magic;
          liveMonster._skillDebuffs = originalFields.debuffs;
          liveMonster._skillCooldownUntil = originalFields.cooldown;
          liveMonster.hp = originalFields.hp;
        }
        evidence.consumerProof = {
          basicDamageBefore: basicDamageBefore.damage,
          basicDamageWhileDisabled: basicDamageWhileDisabled.damage,
          basicDamageAfterExpiry: basicDamageAfterExpiry.damage,
          skillDamageBefore: skillDamageBefore.damage,
          skillDamageWhileDisabled: skillDamageWhileDisabled.damage,
          skillDamageAfterExpiry: skillDamageAfterExpiry.damage,
          skillCooldownWhileDisabled
        };
      }
    }
    if (contract?.kind === 'damage_and_self_heal') evidence = {
      cast,
      skillId,
      events,
      hpBefore,
      hpAfter,
      playerHpBeforeCast: playerHpBefore,
      playerHpAfterCast,
      maxHp: stats.maxHp,
      selfHealPercent: resolveSkillSelfHealPercent(def)
    };
    if (contract?.kind === 'damage_over_time') {
      state.skillAutoCast = { ...(state.skillAutoCast || {}), [skillId]: false };
      const dot = state.activeMonster._skillDots?.[skillId];
      const start = Date.now();
      const originalDateNow = Date.now;
      try {
        for (let second = 1; second <= contract.expectedTicks; second++) {
          Date.now = () => start + second * 1000;
          attackMonster();
        }
      } finally {
        Date.now = originalDateNow;
      }
      evidence = {
        skillId,
        events,
        cast,
        applied: !!dot,
        observedDotKeys: Object.keys(state.activeMonster._skillDots || {}),
        expiresInMs: dot ? dot.until - dot.appliedAt : null,
        expired: !state.activeMonster._skillDots?.[skillId],
        hpBefore: hpBefore,
        hpAfter: state.activeMonster.hp
      };
    }
    row.effect = assessEffect(contract, { ...evidence, preconditionsMet: cast });
    row.observed = { events, buffs: JSON.parse(JSON.stringify(state.buffs)), targetDebuffs: JSON.parse(JSON.stringify(state.activeMonster._skillDebuffs || {})), playerHpBefore, playerHpAfter: state.hp, enemyHpBefore: hpBefore, enemyHpAfter: hpAfter };
    row.dispatch = { path: 'main.attackMonster', browser: true, fullBootstrap: false };
  } catch (error) { row.checks.push({ name: 'dispatchException', pass: false, error: error.stack }); }
  finally { combatEvents.off(CombatEventType.SKILL_DAMAGE, listener); }
  return row;
}

export function runMatrix() {
  return Object.values(classes).map(cls => {
    const isGap = CONTENT_GAP_CLASSES.has(cls.id);
    const isUnproven = UNPROVEN_PROVENANCE_CLASSES.has(cls.id);
    const contentStatus = isGap ? 'BLOCKED_CONTENT_GAP' : isUnproven ? 'BLOCKED_UNPROVEN_PROVENANCE' : 'PROVENANCE_VALIDATED';

    const skills = new Map();
    let current = cls;
    const visited = new Set();
    while (current && !visited.has(current.id)) {
      visited.add(current.id);
      const c = resolveV2ClassContext(current.id, current.race);
      for (const sid of c.classSkillIds || c.v2ClassDef?.skillIds || c.authorizedSkillIds || []) {
        if (current.id === cls.id || isSkillInProgressionPath({ class: cls.id, race: cls.race }, sid)) {
          skills.set(sid, current.id === cls.id ? null : current.id);
        }
      }
      current = classes[current.parentClass];
    }
    return {
      classId: cls.id,
      race: cls.race,
      stage: cls.stage,
      contentStatus,
      checks: [],
      skills: [...skills].map(([sid, ancestor]) => {
        try { return exercise(cls.id, sid, ancestor); }
        catch (error) { return { skillId: sid, inheritedFrom: ancestor, checks: [{ name: 'fixtureException', pass: false, error: error.stack }] }; }
      })
    };
  });
}

export function detectWeaknessDamageProof() {
  const castRow = exercise('warrior', 'detect_weakness');
  const state = getState();
  const target = state.activeMonster;
  const mark = target?._skillDebuffs?.detect_weakness;
  if (castRow.effect?.status !== 'PASS' || !mark) {
    return { name: 'detectWeaknessDamageAmplification', pass: false, castStatus: castRow.effect?.status || 'MISSING', markApplied: !!mark };
  }

  state.skillAutoCast.detect_weakness = false;
  const originalRandom = Math.random;
  const hitOnce = () => {
    const startingHp = target.hp;
    state._lastAttackTime = 0;
    for (let attempt = 0; attempt < 20 && target.hp === startingHp; attempt++) attackMonster();
    return startingHp - target.hp;
  };

  let markedDamage;
  let unmarkedDamage;
  try {
    Math.random = () => 0.99;
    target.hp = 1e9;
    markedDamage = hitOnce();
    delete target._skillDebuffs.detect_weakness;
    target.hp = 1e9;
    unmarkedDamage = hitOnce();
  } finally {
    Math.random = originalRandom;
  }

  return {
    name: 'detectWeaknessDamageAmplification',
    pass: markedDamage > unmarkedDamage && unmarkedDamage > 0,
    markedDamage,
    unmarkedDamage,
    damageRatio: unmarkedDamage > 0 ? markedDamage / unmarkedDamage : null,
    markSource: mark.source,
    markDurationMs: mark.until - Date.now()
  };
}

export function provokeDamageProof() {
  const castRow = exercise('warlord', 'provoke');
  const state = getState();
  const target = state.activeMonster;
  const mark = target?._skillDebuffs?.provoke;
  if (castRow.effect?.status !== 'PASS' || !mark) {
    return { name: 'provokeVulnerabilityDamageAppliedByProductionCombat', pass: false, castStatus: castRow.effect?.status || 'MISSING', markApplied: !!mark };
  }

  state.skillAutoCast.provoke = false;
  const originalRandom = Math.random;
  const hitOnce = () => {
    const startingHp = target.hp;
    state._lastAttackTime = 0;
    for (let attempt = 0; attempt < 20 && target.hp === startingHp; attempt++) attackMonster();
    return startingHp - target.hp;
  };

  let markedDamage;
  let unmarkedDamage;
  try {
    Math.random = () => 0.99;
    target.hp = 1e9;
    markedDamage = hitOnce();
    delete target._skillDebuffs.provoke;
    target.hp = 1e9;
    unmarkedDamage = hitOnce();
  } finally {
    Math.random = originalRandom;
  }

  return {
    name: 'provokeVulnerabilityDamageAppliedByProductionCombat',
    pass: markedDamage > unmarkedDamage && unmarkedDamage > 0,
    markedDamage,
    unmarkedDamage,
    damageRatio: unmarkedDamage > 0 ? markedDamage / unmarkedDamage : null,
    markSource: mark.source,
    markDurationMs: mark.until - Date.now()
  };
}

export function vampiricRageLifestealProof() {
  const castRow = exercise('shillien_elder', 'vampiric_rage');
  const state = getState();
  const buff = state.buffs?.vampiric_rage;
  if (castRow.effect?.status !== 'PASS' || !buff) {
    return { name: 'vampiricRageLifeDrainAppliedByProductionCombat', pass: false, castStatus: castRow.effect?.status || 'MISSING', buffApplied: !!buff };
  }

  const target = state.activeMonster;
  state.skillAutoCast.vampiric_rage = false;
  target.hp = 1e9;
  const stats = getStats(state);
  state.hp = Math.max(1, stats.maxHp - 200);
  const hpBefore = state.hp;
  const targetHpBefore = target.hp;
  const originalRandom = Math.random;
  try {
    Math.random = () => 0.99;
    for (let attempt = 0; attempt < 20 && target.hp === targetHpBefore; attempt++) {
      state._lastAttackTime = 0;
      attackMonster();
    }
  } finally {
    Math.random = originalRandom;
  }
  const damage = targetHpBefore - target.hp;
  const healed = state.hp - hpBefore;
  return {
    name: 'vampiricRageLifeDrainAppliedByProductionCombat',
    pass: damage > 0 && healed === Math.floor(damage * 0.05),
    damage,
    healed,
    expectedHeal: Math.floor(damage * 0.05),
    lifeDrain: getStats(state).lifeDrain,
    expiresInMs: buff.until - Date.now()
  };
}

export function longShotBowDamageProof() {
  const row = exercise('hawkeye', 'long_shot');
  const state = getState();
  const target = {
    id: 'long-shot-audit-target', name: 'Long Shot audit target',
    hp: 1e9, maxHp: 1e9, atk: 1, matk: 1, def: 100, mdef: 100, level: 1, atkSpd: 1, isRaid: true
  };
  state.zone = null;
  state.isRaidActive = true;
  state.isCombatActive = true;
  state.target = target.id;
  state.activeMonster = target;
  state.skillAutoCast = {};
  const originalRandom = Math.random;
  const hit = withPassive => {
    state.skills.long_shot = withPassive ? 1 : 0;
    target.hp = 1e9;
    state._lastAttackTime = 0;
    const hpBefore = target.hp;
    for (let attempt = 0; attempt < 20 && target.hp === hpBefore; attempt++) attackMonster();
    return hpBefore - target.hp;
  };
  let controlDamage;
  let bowDamage;
  try {
    Math.random = () => 0.99;
    controlDamage = hit(false);
    bowDamage = hit(true);
  } finally {
    Math.random = originalRandom;
  }
  return {
    name: 'longShotBowAttackBonusAppliedByProductionCombat',
    pass: row.effect?.status === 'PASS' && controlDamage > 0 && bowDamage > controlDamage,
    passiveStatus: row.effect?.status,
    controlDamage,
    bowDamage,
    bow: getEquippedWeaponInfo(state).category
  };
}

export function roarOfDeathIncomingDamageProof() {
  const castRow = exercise('human_deathknight_1', 'roar_of_death');
  const state = getState();
  const monster = state.activeMonster;
  const debuff = monster?._skillDebuffs?.roar_of_death;
  if (castRow.effect?.status !== 'PASS' || !debuff) {
    return { name: 'roarOfDeathIncomingDamageReduction', pass: false, castStatus: castRow.effect?.status || 'MISSING', debuffApplied: !!debuff };
  }

  monster._aiState = { archetype: MONSTER_ARCHETYPES.BERSERKER };
  const startingHp = state.hp;
  const originalRandom = Math.random;
  const receiveHit = withDebuff => {
    if (!withDebuff) delete monster._skillDebuffs.roar_of_death;
    state.hp = startingHp;
    try {
      Math.random = () => 0.99;
      monsterAttack(monster);
    } finally {
      Math.random = originalRandom;
    }
    return startingHp - state.hp;
  };
  const markedDamage = receiveHit(true);
  const unmarkedDamage = receiveHit(false);

  return {
    name: 'roarOfDeathIncomingDamageReduction',
    pass: markedDamage > 0 && unmarkedDamage > markedDamage,
    markedDamage,
    unmarkedDamage,
    reductionRatio: unmarkedDamage > 0 ? 1 - markedDamage / unmarkedDamage : null,
    appliedStats: debuff.stats,
    expiresInMs: debuff.until - Date.now()
  };
}

export function deathKnightContinuity() {
  return ['human', 'elf', 'delf'].map(race => {
    const root = `${race}_deathknight_0`;
    const state = prepare(root, 1, defs.hellfire);
    const stages = [];
    for (let stage = 0; stage <= 3; stage++) {
      const classId = `${race}_deathknight_${stage}`;
      const level = [1, 20, 40, 76][stage];
      state.level = level;
      const promoted = stage === 0 || promoteClass(state, classId, null, { log: () => {} });
      const checks = [
        { name: 'promotion', pass: promoted && state.class === classId },
        { name: 'classStageAndLevelGate', expected: stage === 3, observed: isSkillAvailableForCharacter(state, 'hellfire'), pass: isSkillAvailableForCharacter(state, 'hellfire') === (stage === 3) }
      ];

      if (stage < 3) {
        const spBefore = state.sp;
        const booksBefore = bookCount(state);
        const learned = spendSP(state, 'hellfire', { log: () => {}, removeFromInventory: (uid, count) => removeFromInventory(state, uid, count) });
        checks.push({
          name: 'lockedSkillRejectedWithoutCost',
          pass: learned === false && !state.skills.hellfire && state.sp === spBefore && bookCount(state) === booksBefore
        });
        stages.push({ classId, skillId: 'hellfire', level, checks });
        continue;
      }

      const result = exercise(classId, 'hellfire', root, null, level, state);
      result.checks.push(...checks);
      const vm = getSkillTreeViewModel(state);
      const treeNode = vm.allVisibleSkills?.find(s => s.id === 'hellfire' || s.skillId === 'hellfire');
      result.checks.push({ name: 'treeViewModel', pass: !!treeNode && treeNode.isLearned === true, observed: treeNode || null });

      const auth = isSkillAllowedForClass(state.class, 'hellfire') && isSkillInProgressionPath(state.class, 'hellfire', state.race);
      result.checks.push({ name: 'executionAuthorization', pass: auth === true });

      const saveKey = 'lineageIdleSave_v2';
      localStorage.setItem(saveKey, JSON.stringify(state));
      const loaded = JSON.parse(localStorage.getItem(saveKey));
      const normalized = normalizeAndValidateSkills(loaded);
      const serializationPass = normalized.state.class === classId &&
                                normalized.state.skills.hellfire > 0 &&
                                normalized.state.skillLoadout?.core1 === 'hellfire';
      result.checks.push({ name: 'normalizedStorageRoundTrip', pass: serializationPass });
      stages.push(result);
    }
    return { name: `${race}HellfireContinuity`, pass: stages.every(s => s.checks.every(c => c.pass === true)) && stages.at(-1)?.effect?.pass === true, stages, uiRendered: false };
  });
}

export function promotionMatrix() {
  return Object.values(classes).filter(c => c.parentClass).map(target => {
    const source = classes[target.parentClass];
    if (!source) return { name: target.id, pass: false, reason: 'missing parent' };
    const state = prepare(source.id, target.minLevel, null);
    const messages = [];
    const accepted = promoteClass(state, target.id, null, { log: m => messages.push(m) });
    const valid = accepted && state.class === target.id && state.race === source.race;
    const tooEarly = prepare(source.id, target.minLevel - 1, null);
    const rejected = promoteClass(tooEarly, target.id, null, { log: () => {} }) === false && tooEarly.class === source.id;
    return { name: `${source.id}->${target.id}`, pass: valid && rejected, acceptedAtRequiredLevel: valid, rejectedBelowRequiredLevel: rejected, messages, uiRendered: false };
  });
}

export function mutationChecks() {
  return [
    ['fighter', 'power_strike', 'suppressDamage', 'suppressPhysicalDamage'],
    ['mage', 'wind_strike', 'suppressDamage', 'suppressMagicDamage'],
    ['warrior', 'war_cry', 'suppressBuff', 'suppressBuff'],
    ['fighter', 'weapon_mastery', 'suppressPassive', 'suppressPassiveStat'],
    ['fighter', 'armor_mastery', 'suppressPassive', 'suppressPassiveArmor'],
    ['knight', 'heavy_armor_mastery', 'ignoreArmorCompatibility', 'heavyArmorIncompatibleArmor'],
    ['hawkeye', 'bow_mastery', 'ignoreWeaponCompatibility', 'bowMasteryIncompatibleWeapon'],
    ['adventurer', 'critical_chance', 'suppressPassive', 'suppressPassiveCrit'],
    ['mage', 'self_heal', 'suppressHeal', 'suppressHeal']
  ].map(([cls, sid, mutation, name]) => {
    const control = exercise(cls, sid), mutant = exercise(cls, sid, null, mutation);
    return { name: name || mutation, pass: control.effect?.pass === true && mutant.effect?.pass === false, control, mutant };
  }).concat([(() => {
    const control = exercise('overlord', 'life_rescue');
    const fullHealth = exercise('overlord', 'life_rescue', null, 'fullHealth');
    const cast = fullHealth.checks.find(check => check.name === 'productionCast');
    const mpDebit = fullHealth.checks.find(check => check.name === 'productionMpDebit');
    return {
      name: 'fixedHealDoesNotSpendMpAtFullHealth',
      pass: control.effect?.pass === true && cast?.pass === false && mpDebit?.observed === 0,
      control,
      fullHealth
    };
  })()]);
}

export function ultimateEvasionCombatProof() {
  const skillCase = exercise('treasure_hunter', 'ultimate_evasion');
  const state = getState();
  const activeBuff = state.buffs?.ultimate_evasion ? structuredClone(state.buffs.ultimate_evasion) : null;
  const monster = {
    id: 'audit-physical-skill-target', name: 'Audit physical skill target',
    hp: 1_000_000, _maxHp: 1_000_000, atk: 100, matk: 100, def: 0, mdef: 0,
    lvl: 1, acc: 40, atkSpd: 1,
    skill: { name: 'Audit physical skill', type: 'physical', mult: 1, effect: 'stun', cd: 4 }
  };
  const originalRandom = Math.random;
  const outcomes = {};

  const receiveSkill = withEvasion => {
    state.isCombatActive = true;
    state.isRaidActive = false;
    state.zone = 'audit-zone';
    state.target = monster.id;
    state.activeMonster = monster;
    state.maxHp = Math.max(1, getStats(state).maxHp);
    state.hp = state.maxHp;
    if (withEvasion && activeBuff) state.buffs = { ultimate_evasion: structuredClone(activeBuff) };
    else state.buffs = {};
    monster._skillCooldownUntil = 0;
    const hpBefore = state.hp;
    const rolls = [0.99, 0, 0.99, 0.39];
    Math.random = () => rolls.shift() ?? 0.99;
    try { monsterAttack(monster); }
    finally { Math.random = originalRandom; }
    const activeStats = getStats(state);
    return {
      hpBefore,
      hpAfter: state.hp,
      pSkillEvasionPercent: activeStats.pSkillEvasionPercent,
      debuffResistancePercent: activeStats.debuffResistancePercent
    };
  };

  try {
    outcomes.control = receiveSkill(false);
    outcomes.evasion = receiveSkill(true);
    const resistDebuff = withEvasion => {
      state.buffs = withEvasion && activeBuff ? { ultimate_evasion: structuredClone(activeBuff) } : {};
      const support = { atk: 100, matk: 100, hp: 1000, _maxHp: 1000, _aiState: { archetype: MONSTER_ARCHETYPES.SUPPORT } };
      Math.random = (() => { const rolls = [0.5, 0.2]; return () => rolls.shift() ?? 0.5; })();
      try { return MonsterAIEngine.processMonsterAttack(support, getStats(state), state).appliedDebuff || null; }
      finally { Math.random = originalRandom; }
    };
    outcomes.controlDebuff = resistDebuff(false);
    outcomes.resistedDebuff = resistDebuff(true);
  } finally {
    Math.random = originalRandom;
  }

  const castPassed = skillCase.checks.find(check => check.name === 'productionCast')?.pass === true;
  const mpDebitPassed = skillCase.checks.find(check => check.name === 'productionMpDebit')?.pass === true;
  return {
    name: 'ultimateEvasionNegatesIncomingPhysicalSkillInProductionCombat',
    pass: castPassed && mpDebitPassed && outcomes.control.hpAfter < outcomes.control.hpBefore &&
      outcomes.evasion.pSkillEvasionPercent === 0.4 && outcomes.evasion.hpAfter === outcomes.evasion.hpBefore &&
      outcomes.control.debuffResistancePercent === 0 && outcomes.evasion.debuffResistancePercent === 0.8 &&
      Boolean(outcomes.controlDebuff) && outcomes.resistedDebuff === null,
    castPassed,
    mpDebitPassed,
    control: outcomes.control,
    active: outcomes.evasion,
    controlDebuff: outcomes.controlDebuff,
    resistedDebuff: outcomes.resistedDebuff
  };
}

export function lionheartPveDamageProof() {
  const originalRandom = Math.random;
  const run = withSkill => {
    const state = prepare('gladiator', 80, defs.lionheart, 'lionheart');
    const target = { id: 'lionheart-audit-target', name: 'Lionheart audit target', hp: 1_000_000, maxHp: 1_000_000, atk: 1, matk: 1, def: 100, mdef: 100, level: 80, atkSpd: 1, isRaid: true };
    state.skills.lionheart = withSkill ? 1 : 0;
    state.skillLoadout = withSkill ? { core1: 'lionheart' } : {};
    state.zone = null;
    state.isRaidActive = true;
    state.isCombatActive = true;
    state.target = target.id;
    state.activeMonster = target;
    state.mp = 10_000;
    state._lastAttackTime = Date.now() - 10_000;
    const stats = getStats(state);
    state.hp = stats.maxHp;
    state.maxHp = stats.maxHp;

    let buffCast = false;
    let damage = 0;
    for (let i = 0; i < 24 && damage === 0; i++) {
      attackMonster();
      buffCast ||= Boolean(state.buffs?.lionheart?.until > Date.now());
      damage = 1_000_000 - target.hp;
    }
    const activeStats = getStats(state);
    return {
      damage,
      buffCast,
      pveDamagePercent: activeStats.pveDamagePercent,
      debuffResistancePercent: activeStats.debuffResistancePercent
    };
  };

  try {
    Math.random = () => 0.99;
    const control = run(false);
    const buffed = run(true);
    return {
      name: 'lionheartAdaptedEffectsAppliedByProductionCombat',
      pass: control.damage > 0 && buffed.buffCast && buffed.pveDamagePercent === 0.03 &&
        buffed.damage === Math.floor(control.damage * 1.03) && buffed.debuffResistancePercent === 0.25,
      control,
      buffed
    };
  } finally {
    Math.random = originalRandom;
  }
}

export function deathWhisperCriticalDamageProof() {
  const originalRandom = Math.random;
  const run = withSkill => {
    const state = prepare('gladiator', 80, defs.death_whisper, 'death_whisper');
    const target = { id: 'death-whisper-audit-target', name: 'Death Whisper audit target', hp: 1_000_000, maxHp: 1_000_000, atk: 1, matk: 1, def: 100, mdef: 100, level: 80, atkSpd: 1, isRaid: true };
    state.skills.death_whisper = withSkill ? 1 : 0;
    state.buffs.audit_critical_chance = { until: Date.now() + 60_000, skillBuffStats: { crit: 100 } };
    state.zone = null;
    state.isRaidActive = true;
    state.isCombatActive = true;
    state.target = target.id;
    state.activeMonster = target;
    state.mp = 10_000;
    state._lastAttackTime = Date.now() - 10_000;
    const stats = getStats(state);
    state.hp = stats.maxHp;
    state.maxHp = stats.maxHp;

    let damage = 0;
    for (let i = 0; i < 24 && damage === 0; i++) {
      attackMonster();
      damage = 1_000_000 - target.hp;
    }
    return { damage, critDmg: getStats(state).critDmg };
  };

  try {
    Math.random = () => 0;
    const control = run(false);
    const empowered = run(true);
    return {
      name: 'deathWhisperBasicCriticalDamageAppliedByProductionCombat',
      pass: control.damage > 0 && empowered.critDmg === control.critDmg + 0.25 &&
        empowered.damage === Math.floor(control.damage * (empowered.critDmg / control.critDmg)),
      control,
      empowered
    };
  } finally {
    Math.random = originalRandom;
  }
}

export function clarityMpCostProof() {
  const originalRandom = Math.random;
  const run = (classId, skillId, withClarity) => {
    const state = prepare(classId, 80, defs[skillId], skillId);
    state.skills[skillId] = 1;
    state.skills.clarity = withClarity ? 1 : 0;
    const equipped = equipSkill(state, 'core1', skillId);
    state.skillLoadout = { core1: skillId };
    state.zone = null;
    state.isRaidActive = true;
    state.isCombatActive = true;
    state.target = 'clarity-audit-target';
    state.activeMonster = { id: state.target, name: 'Clarity audit target', hp: 1_000_000, maxHp: 1_000_000, atk: 1, matk: 1, def: 0, mdef: 0, level: 80, atkSpd: 1, isRaid: true };
    state.mp = 10_000;
    state._lastAttackTime = Date.now() - 10_000;
    const mpBefore = state.mp;
    for (let i = 0; i < 4 && !state._cds?.[skillId]; i++) attackMonster();
    return {
      classId, skillId, damageType: defs[skillId]?.damageType, equipped: equipped.success === true,
      cast: Boolean(state._cds?.[skillId]), mpSpent: mpBefore - state.mp,
      expectedMpSpent: Math.ceil((getSkillMpCost(defs[skillId]) || 0) * (withClarity ? (defs[skillId]?.damageType === 'magic' ? 0.96 : 0.90) : 1)),
      clarity: getStats(state).pSkillMpCostReduction === 0.10 && getStats(state).mSkillMpCostReduction === 0.04
    };
  };

  try {
    Math.random = () => 0.99;
    const physicalControl = run('gladiator', 'power_strike', false);
    const physicalDiscount = run('gladiator', 'power_strike', true);
    const magicalControl = run('sorcerer', 'prominence', false);
    const magicalDiscount = run('sorcerer', 'prominence', true);
    const cases = [physicalControl, physicalDiscount, magicalControl, magicalDiscount];
    return {
      name: 'clarityPhysicalAndMagicMpDiscountsAppliedByProductionCombat',
      pass: cases.every(c => c.equipped && c.cast && c.mpSpent === c.expectedMpSpent) &&
        physicalDiscount.mpSpent < physicalControl.mpSpent && magicalDiscount.mpSpent < magicalControl.mpSpent &&
        physicalDiscount.clarity && magicalDiscount.clarity,
      cases
    };
  } finally {
    Math.random = originalRandom;
  }
}

export function potionMasteryUseItemProof() {
  const run = (itemId, withMastery) => {
    const state = prepare('gladiator', 80, defs.potion_mastery, 'potion_mastery');
    state.skills.potion_mastery = withMastery ? 1 : 0;
    state.maxHp = 2_000;
    state.hp = 100;
    state._lastHpPotTime = 0;
    state.inventory.push({ uid: `audit-${itemId}`, itemId, count: 1 });
    const hpBefore = state.hp;
    useItem(`audit-${itemId}`);
    return {
      itemId,
      healed: state.hp - hpBefore,
      potionConsumed: !state.inventory.some(item => item.uid === `audit-${itemId}`),
      potionMastery: getStats(state).hpPotionEffectPercent
    };
  };
  const standardControl = run('hp_potion_m', false);
  const standardMastery = run('hp_potion_m', true);
  const greaterControl = run('greater_healing_potion', false);
  const greaterMastery = run('greater_healing_potion', true);
  const cases = [standardControl, standardMastery, greaterControl, greaterMastery];
  return {
    name: 'potionMasteryManualHpPotionsUseProductionPath',
    pass: cases.every(result => result.potionConsumed) &&
      standardControl.healed === 150 && standardMastery.healed === 165 &&
      greaterControl.healed === 850 && greaterMastery.healed === 935 &&
      standardControl.potionMastery === 0 && standardMastery.potionMastery === 0.10 &&
      greaterControl.potionMastery === 0 && greaterMastery.potionMastery === 0.10,
    cases
  };
}

export function auditIndependentProvenance() {
  const allCls = Object.values(classes);
  const gaps = allCls.filter(c => CONTENT_GAP_CLASSES.has(c.id));
  const unproven = allCls.filter(c => UNPROVEN_PROVENANCE_CLASSES.has(c.id));
  const validated = allCls.filter(c => !CONTENT_GAP_CLASSES.has(c.id) && !UNPROVEN_PROVENANCE_CLASSES.has(c.id));

  let ancestryIntegrity = true;
  for (const c of validated) {
    if (c.parentClass && !classes[c.parentClass]) {
      ancestryIntegrity = false;
      break;
    }
  }

  return {
    name: 'independentProvenance',
    pass: ancestryIntegrity ? null : false,
    status: ancestryIntegrity ? 'NOT_VALIDATED' : 'FAIL',
    totalClasses: allCls.length,
    validatedCount: validated.length,
    contentGapCount: gaps.length,
    unprovenProvenanceCount: unproven.length,
    ancestryIntegrity,
    evidenceSource: 'Local status lists and registry ancestry only; no independent per-class provenance evidence was exercised'
  };
}

export function auditEffectContractsCoverage(classResults) {
  const skillIds = (classResults || []).flatMap(result => (result.skills || []).map(skill => skill.skillId));
  return {
    name: 'effectContractForEverySkill',
    ...assessEffectCoverage(skillIds, EFFECT_CONTRACTS)
  };
}

/** Separately exercise skills that occur only in blocked class rows.
 * This proves their effect implementation, while leaving the class/lineage
 * assignment itself blocked pending content and provenance evidence.
 */
export function runUnrepresentedBlockedSkillEffects(classResults) {
  const validatedSkillIds = new Set((classResults || [])
    .filter(result => result.contentStatus === 'PROVENANCE_VALIDATED')
    .flatMap(result => (result.skills || []).map(skill => skill.skillId)));
  const candidates = new Map();
  for (const result of classResults || []) {
    if (result.contentStatus === 'PROVENANCE_VALIDATED') continue;
    for (const skill of result.skills || []) {
      if (!validatedSkillIds.has(skill.skillId) && !candidates.has(skill.skillId)) {
        candidates.set(skill.skillId, { classId: result.classId, skillId: skill.skillId });
      }
    }
  }
  return [...candidates.values()].map(({ classId, skillId }) => {
    const result = exercise(classId, skillId);
    return {
      name: `blockedClassSkillEffect:${classId}:${skillId}`,
      classAssignmentValidated: false,
      pass: result.effect?.pass === true && result.checks.every(check => check.pass === true),
      result
    };
  });
}

export function auditAllCreationRootsUI() {
  const roots = Object.values(classes).filter(c => c.stage === 0);
  const results = [];

  for (const root of roots) {
    const state = prepare(root.id, 1, null);
    const ctx = resolveV2ClassContext(root.id, root.race);
    const vm = getSkillTreeViewModel(state);
    const availableSkills = Object.values(vm.tabs).flatMap(tab => tab.skills);

    const isGap = CONTENT_GAP_CLASSES.has(root.id);
    const starterSkill = availableSkills[0]?.id || availableSkills[0]?.skillId || null;

    results.push({
      rootId: root.id,
      race: root.race,
      isGap,
      pass: isGap ? ctx.status === 'CONTENT_GAP' : (availableSkills.length > 0 && !!starterSkill),
      skillsCount: availableSkills.length
    });
  }

  return {
    name: 'creationRootSkillTreeViewModels',
    pass: results.every(r => r.pass === true),
    rootsCount: roots.length,
    activeRoots: results.filter(r => !r.isGap).length,
    contentGapRoots: results.filter(r => r.isGap).length,
    results,
    uiRendered: false
  };
}

export function auditAllPromotionsUI() {
  const promotions = Object.values(classes).filter(c => c.parentClass);
  const results = [];

  for (const target of promotions) {
    const source = classes[target.parentClass];
    if (!source) continue;

    const state = prepare(source.id, target.minLevel, null);
    const promoted = promoteClass(state, target.id, null, { log: () => {} });
    const vm = getSkillTreeViewModel(state);
    const treeReady = Object.values(vm.tabs).some(tab => tab.skills.length > 0);

    results.push({
      sourceId: source.id,
      targetId: target.id,
      pass: promoted === true && state.class === target.id && treeReady,
      targetStage: target.stage
    });
  }

  return {
    name: 'promotionServiceAndSkillTreeViewModels',
    pass: results.every(r => r.pass === true),
    promotionsCount: promotions.length,
    resultsCount: results.length,
    uiRendered: false
  };
}

export function auditAllSubclassTransitions() {
  const destinations = Object.values(classes).filter(c => c.stage >= 1);
  const results = [];
  const previousSeason = window.__serverSeason;
  window.__serverSeason = 3;
  try {
    for (const dest of destinations) {
      const state = prepare('gladiator', 76, null);
      state.subclasses = [{
        id: `audit-${dest.id}`,
        classId: dest.id,
        level: 40,
        xp: 0,
        sp: 5000,
        skills: { audit_subclass_marker: 1 },
        skillLoadout: { core1: 'audit_subclass_marker' },
        equipment: {}
      }];
      const expectedMain = { class: state.class, level: state.level, sp: state.sp, skills: { ...state.skills } };
      const activated = switchSubclass(0);
      const activeState = state.activeSubclassIndex === 0 && state.class === dest.id && state.level === 40 && state.sp === 5000;
      state.sp += 1;
      state.skills.audit_switch_mutation = 1;
      const returned = switchSubclass(null);
      const mainRestored = state.activeSubclassIndex === null && state.class === expectedMain.class &&
        state.level === expectedMain.level && state.sp === expectedMain.sp &&
        JSON.stringify(state.skills) === JSON.stringify(expectedMain.skills);
      const reactivated = switchSubclass(0);
      const subclassSnapshotRestored = state.activeSubclassIndex === 0 && state.class === dest.id &&
        state.level === 40 && state.sp === 5001 && state.skills.audit_switch_mutation === 1;
      results.push({
        destId: dest.id,
        sourceClassId: expectedMain.class,
        pass: activated === true && activeState && returned === true && mainRestored &&
          reactivated === true && subclassSnapshotRestored,
        checks: { activated, activeState, returned, mainRestored, reactivated, subclassSnapshotRestored }
      });
    }
  } finally {
    if (previousSeason === undefined) delete window.__serverSeason;
    else window.__serverSeason = previousSeason;
  }

  return {
    name: 'allSubclassActivationSwitches',
    pass: results.length === destinations.length && results.every(r => r.pass === true),
    destinationsTested: results.length,
    destinationsExpected: destinations.length,
    racialEligibility: 'NOT_VALIDATED_BY_ACTIVATION_SWITCH_TEST',
    uiRendered: false,
    results
  };
}
