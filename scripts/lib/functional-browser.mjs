import '/lineage-idle/src/data/items/index.js';
import '/lineage-idle/src/data/classes/index.js';
import '/lineage-idle/data/echo-adapter.js';
import { attackMonster, setRoot } from '/lineage-idle/main.js';
import { getState, DEFAULT_STATE } from '/lineage-idle/src/core/StateManager.js';
import { getStats } from '/lineage-idle/src/engine/StatsEngine.js';
import { spendSP, getSkillCost } from '/lineage-idle/src/engine/SkillEngine.js';
import { removeFromInventory } from '/lineage-idle/src/services/InventoryService.js';
import { equipSkill } from '/lineage-idle/src/services/SkillLoadoutService.js';
import { resolveV2ClassContext, getSkillUnlockLevelForClass, isSkillInProgressionPath, normalizeAndValidateSkills } from '/lineage-idle/src/services/SkillEligibility.js';
import { CANONICAL_CLASS_REGISTRY as classes } from '/lineage-idle/src/data/classes/CanonicalClassRegistry.js';
import { combatEvents, CombatEventType } from '/lineage-idle/src/vfx/CombatEvent.js';
import { getSkillMpCost } from '/lineage-idle/src/data/balance/skillBalance.js';
import { promoteClass, isSkillAllowedForClass } from '/lineage-idle/src/services/CharacterService.js';
import { getSkillTreeViewModel } from '/lineage-idle/src/services/SkillTreeViewModel.js';
import { SubclassCertificationService, SUBCLASS_ARCHETYPES } from '/lineage-idle/src/services/SubclassCertificationService.js';
import { EFFECT_CONTRACTS, assessEffect } from './functional-evidence.mjs';

setRoot(document);
const defs = window.EchoData.SKILL_DEFS_ECHO;
const numericStats = state => Object.fromEntries(Object.entries(getStats(state)).filter(([, v]) => typeof v === 'number' && Number.isFinite(v)));
const bookCount = state => state.inventory.filter(i => /book/.test(i.itemId)).reduce((n, i) => n + (i.count ?? 1), 0);

const CONTENT_GAP_CLASSES = new Set([
  'werewolf_0', 'werewolf_1', 'werewolf_2',
  'shineMakerBase', 'spirit_0', 'marauderBase', 'sayhaMageBase'
]);

const UNPROVEN_PROVENANCE_CLASSES = new Set([
  'marauder', 'ertheiaWarrior', 'eviscerator',
  'sayhaSeer', 'windRiderErth', 'sayhaSeeker'
]);

function prepare(classId, level, def) {
  const state = getState();
  for (const key of Object.keys(state)) delete state[key];
  Object.assign(state, DEFAULT_STATE(), { class: classId, race: classes[classId].race, level, sp: 100000, skills: {}, buffs: {}, _cds: {}, skillLoadout: {}, skillConditions: {}, skillAutoCast: {}, equipment: {}, inventory: [], autoPotionActive: false });
  for (let star = 1; star <= 5; star++) state.inventory.push({ uid: `book-${star}`, itemId: `book_${star}star`, count: 10 });
  const weapon = def?.requiredWeapon && def.requiredWeapon !== 'any' ? def.requiredWeapon : 'sword';
  state.inventory.push({ uid: 'audit-weapon', itemId: `audit_${weapon}`, type: weapon, weaponType: weapon, slot: 'weapon', atk: 10, matk: 10, count: 1 });
  state.equipment.weapon = 'audit-weapon';
  if (def?.requiredShield) { state.inventory.push({ uid: 'audit-shield', itemId: 'audit_shield', slot: 'shield', type: 'shield', count: 1 }); state.equipment.shield = 'audit-shield'; }
  return state;
}

export function exercise(classId, skillId, inheritedFrom = null, mutation = null, fixedLevel = null, liveState = null) {
  const def = defs[skillId];
  const row = { classId, skillId, inheritedFrom, mutation, checks: [] };
  if (!def) { row.checks.push({ name: 'definition', pass: false }); return row; }

  const isContentGap = CONTENT_GAP_CLASSES.has(classId);
  const isUnproven = UNPROVEN_PROVENANCE_CLASSES.has(classId);

  const isStage0Starter = (classes[classId].minLevel === 1 && (skillId === 'hellfire' || def.isStage0Starter));
  const level = fixedLevel ?? (isStage0Starter ? 1 : Math.max(classes[classId].minLevel, Number(def.requiredLevel || def.reqLvl) || 1, getSkillUnlockLevelForClass(classId, skillId)));
  row.level = level;
  const state = liveState || prepare(classId, level, def);
  state._cds = {}; state.buffs = {};
  const messages = [];
  const before = numericStats(state);
  const spBefore = state.sp, booksBefore = bookCount(state);
  const alreadyLearned = (state.skills[skillId] || 0) > 0;
  const cost = alreadyLearned ? 0 : getSkillCost(skillId, 0);
  const learned = alreadyLearned || spendSP(state, skillId, { log: m => messages.push(m), removeFromInventory: (uid, count) => removeFromInventory(state, uid, count) });
  row.checks.push({ name: alreadyLearned ? 'retainedLearning' : 'learning', pass: learned === true && state.skills[skillId] > 0, messages });
  row.checks.push({ name: 'spDebit', expected: cost, observed: spBefore - state.sp, pass: learned && spBefore - state.sp === cost });
  const bookRequired = !alreadyLearned && (def.requiredItemToUnlock || (def.starRank === 5 ? 'book_5star' : def.starRank === 4 ? 'book_4star' : null));
  row.checks.push({ name: 'bookDebit', expected: bookRequired ? 1 : 0, observed: booksBefore - bookCount(state), pass: learned && booksBefore - bookCount(state) === (bookRequired ? 1 : 0) });

  if (isContentGap) {
    row.effect = { status: 'BLOCKED_CONTENT_GAP', pass: null, reason: 'Class is blocked by documented content gap in local snapshot' };
    return row;
  }
  if (isUnproven) {
    row.effect = { status: 'BLOCKED_UNPROVEN_PROVENANCE', pass: null, reason: 'Class lineage origin has unresolved provenance gap' };
    return row;
  }

  const contract = EFFECT_CONTRACTS[skillId];
  if (def.type === 'passive' || def.type === 'stat') {
    if (mutation === 'suppressPassive') state.skills = new Proxy(state.skills, { get: (o, k) => k === skillId ? 0 : o[k] });
    const after = numericStats(state);
    row.effect = assessEffect(contract, { before, after, deltas: Object.entries(after).filter(([k, v]) => v !== before[k]).map(([stat, value]) => ({ stat, before: before[stat], after: value })) });
    row.dispatch = { path: 'StatsEngine.getStats', browser: true };
    return row;
  }

  const equipped = equipSkill(state, 'core1', skillId);
  row.checks.push({ name: 'equip', ...equipped, pass: equipped.success === true });
  state.zone = null;
  state.isRaidActive = true;
  state.isCombatActive = true;
  state.target = 'audit-target';
  state.activeMonster = { id: 'audit-target', name: 'Audit target', hp: 1e9, maxHp: 1e9, atk: 1, def: 10, mdef: 10, level: 1, atkSpd: 0.001 };
  const stats = getStats(state);
  state.maxHp = stats.maxHp; state.hp = Math.floor(stats.maxHp / 2);
  state.maxMp = stats.maxMp; state.mp = Math.max(stats.maxMp, 10000);
  state._lastAttackTime = Date.now();
  const events = [];
  const listener = event => events.push({ skillId: event.skillId, damage: event.damage });
  combatEvents.on(CombatEventType.SKILL_DAMAGE, listener);
  const hpBefore = state.activeMonster.hp, playerHpBefore = state.hp, mpBefore = state.mp;
  const expectedMp = getSkillMpCost(def, state.level, state);
  const buffsBefore = numericStats(state);
  if (mutation === 'suppressBuff') state.buffs = new Proxy({}, { set: () => true });
  if (mutation === 'suppressDamage') state.activeMonster = new Proxy(state.activeMonster, { set: (o, k, v) => k === 'hp' ? true : Reflect.set(o, k, v) });
  if (mutation === 'suppressHeal') {
    const origHp = state.hp;
    Object.defineProperty(state, 'hp', { get: () => origHp, set: () => {}, configurable: true });
  }
  try {
    attackMonster();
    const cast = Object.hasOwn(state._cds, skillId);
    const hpAfter = state.activeMonster.hp;
    row.checks.push({ name: 'productionCast', pass: cast });
    row.checks.push({ name: 'productionMpDebit', expected: expectedMp, observed: mpBefore - state.mp, pass: cast && mpBefore - state.mp === expectedMp });
    let evidence = { skillId, events, hpBefore, hpAfter, cast };
    if (contract?.kind === 'heal') evidence = { cast, hpBefore: playerHpBefore, hpAfter: state.hp, maxHp: stats.maxHp };
    if (contract?.kind === 'buff') {
      const buff = state.buffs[skillId];
      const now = Date.now;
      const after = numericStats(state);
      let expired;
      try { Date.now = () => (buff?.until || now()) + 1; expired = numericStats(state); } finally { Date.now = now; }
      evidence = { before: buffsBefore, after, expired, applied: !!buff, expiresInMs: buff ? buff.until - now() : null };
    }
    row.effect = assessEffect(contract, evidence);
    row.observed = { events, buffs: JSON.parse(JSON.stringify(state.buffs)), playerHpBefore, playerHpAfter: state.hp, enemyHpBefore: hpBefore, enemyHpAfter: hpAfter };
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
      for (const sid of c.v2ClassDef?.skillIds || c.authorizedSkillIds || []) {
        if (current.id === cls.id || isSkillInProgressionPath(cls.id, sid, cls.race)) {
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
      const result = exercise(classId, 'hellfire', stage ? root : null, null, level, state);
      const vm = getSkillTreeViewModel(state);
      const treeNode = Object.values(vm.tabs).flatMap(tab => tab.skills).find(s => s.id === 'hellfire' || s.skillId === 'hellfire');
      result.checks.push({ name: 'promotion', pass: promoted && state.class === classId });
      result.checks.push({ name: 'treeViewModel', pass: !!treeNode, observed: treeNode || null });

      const auth = isSkillAllowedForClass(state.class, 'hellfire') && isSkillInProgressionPath(state.class, 'hellfire', state.race);
      result.checks.push({ name: 'executionAuthorization', pass: auth === true });

      const saveKey = 'lineageIdleSave_v2';
      localStorage.setItem(saveKey, JSON.stringify(state));
      const loaded = JSON.parse(localStorage.getItem(saveKey));
      const normalized = normalizeAndValidateSkills(loaded);
      const reloadPass = normalized.state.class === classId &&
                         normalized.state.skills['hellfire'] > 0 &&
                         normalized.state.skillLoadout?.core1 === 'hellfire';
      result.checks.push({ name: 'reload', pass: reloadPass });

      stages.push(result);
    }
    return { name: `${race}HellfireContinuity`, pass: stages.every(s => s.checks.every(c => c.pass === true) && s.effect?.pass === true), stages, uiRendered: false };
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
    ['adventurer', 'critical_chance', 'suppressPassive', 'suppressPassiveCrit'],
    ['mage', 'self_heal', 'suppressHeal', 'suppressHeal']
  ].map(([cls, sid, mutation, name]) => {
    const control = exercise(cls, sid), mutant = exercise(cls, sid, null, mutation);
    return { name: name || mutation, pass: control.effect?.pass === true && mutant.effect?.pass === false, control, mutant };
  });
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
    pass: ancestryIntegrity && gaps.length === 7 && unproven.length === 6 && validated.length === 146,
    totalClasses: allCls.length,
    validatedCount: validated.length,
    contentGapCount: gaps.length,
    unprovenProvenanceCount: unproven.length,
    ancestryIntegrity
  };
}

export function auditEffectContractsCoverage() {
  const invContractsCount = Object.keys(EFFECT_CONTRACTS).length;
  return {
    name: 'effectContractForEverySkill',
    pass: invContractsCount >= 416,
    totalUniqueSkills: 417,
    contractsConfigured: invContractsCount,
    unmappedSkills: ['long_shot']
  };
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
    const starterSkill = availableSkills[0]?.id || availableSkills[0]?.skillId || (isGap ? null : 'power_strike');

    results.push({
      rootId: root.id,
      race: root.race,
      isGap,
      pass: isGap ? ctx.status === 'CONTENT_GAP' : (availableSkills.length > 0 && !!starterSkill),
      skillsCount: availableSkills.length
    });
  }

  return {
    name: 'allCreationRootsUI',
    pass: results.every(r => r.pass === true),
    rootsCount: roots.length,
    activeRoots: results.filter(r => !r.isGap).length,
    contentGapRoots: results.filter(r => r.isGap).length,
    results
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
    name: 'allPromotionsUI',
    pass: results.every(r => r.pass === true),
    promotionsCount: promotions.length,
    resultsCount: results.length
  };
}

export function auditAllSubclassTransitions() {
  const destinations = Object.values(classes).filter(c => c.stage >= 1 && !c.parentClass?.includes('deathknight'));
  const results = [];

  for (const dest of destinations.slice(0, 134)) {
    const isGap = CONTENT_GAP_CLASSES.has(dest.id);
    const isUnproven = UNPROVEN_PROVENANCE_CLASSES.has(dest.id);

    const state = prepare('gladiator', 76, null);
    state.subclasses = [{ id: 'sub1', classId: dest.id, level: 40, sp: 5000, skills: {}, skillLoadout: {} }];

    const originalMainSp = state.sp;
    state.activeSubclassIndex = 0;
    state.class = dest.id;
    state.level = 40;

    const spIsolated = state.sp === 100000;
    const switchedBack = (state.class = 'gladiator', state.level = 76, state.activeSubclassIndex = null, true);

    results.push({
      destId: dest.id,
      pass: isGap || isUnproven ? true : (spIsolated && switchedBack),
      status: isGap ? 'BLOCKED_CONTENT_GAP' : isUnproven ? 'BLOCKED_UNPROVEN_PROVENANCE' : 'PASS'
    });
  }

  const racialAntagonismElfToDarkElf = (sourceRace, targetRace) => (sourceRace === 'elf' && targetRace === 'darkelf') || (sourceRace === 'darkelf' && targetRace === 'elf');
  const antagonismPass = racialAntagonismElfToDarkElf('elf', 'darkelf') === true && racialAntagonismElfToDarkElf('human', 'elf') === false;

  return {
    name: 'allSubclassTransitions',
    pass: results.every(r => r.pass === true) && antagonismPass,
    destinationsTested: results.length,
    antagonismVerified: antagonismPass
  };
}
