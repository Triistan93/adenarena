/**
 * Generates scripts/skill_functional_contract_inventory.json
 * Exhaustive classification of all skill definitions and class x skill relationships.
 */
import fs from 'node:fs';
import path from 'node:path';

globalThis.window = globalThis;
await import('../lineage-idle/src/data/items/index.js');
await import('../lineage-idle/src/data/classes/index.js');
await import('../lineage-idle/data/echo-adapter.js');
const { resolveV2ClassContext, isSkillInProgressionPath } = await import('../lineage-idle/src/services/SkillEligibility.js');
const { CANONICAL_CLASS_REGISTRY: classes } = await import('../lineage-idle/src/data/classes/CanonicalClassRegistry.js');
const { CANONICAL_SKILL_REGISTRY_V2: v2Skills } = await import('../lineage-idle/src/data/skills/CanonicalSkillRegistryV2.js');

const root = path.resolve(import.meta.dirname, '..');
const defs = globalThis.EchoData.SKILL_DEFS_ECHO;

const CONTENT_GAP_CLASSES = new Set([
  'werewolf_0', 'werewolf_1', 'werewolf_2',
  'shineMakerBase', 'spirit_0', 'marauderBase', 'sayhaMageBase'
]);

const UNPROVEN_PROVENANCE_CLASSES = new Set([
  'marauder', 'ertheiaWarrior', 'eviscerator',
  'sayhaSeer', 'windRiderErth', 'sayhaSeeker'
]);

// Map of passives in StatsEngine.js
const STATS_ENGINE_PASSIVES = {
  weapon_mastery: { stat: 'atk', amount: 5, type: 'PASSIVE_STAT' },
  armor_mastery: { stat: 'def', amount: 8, type: 'PASSIVE_ARMOR' },
  sword_blunt_mastery: { stat: 'atk', amount: 5, type: 'PASSIVE_WEAPON', weapon: 'blunt' },
  heavy_armor_mastery: { stat: 'def', amount: 12, type: 'PASSIVE_ARMOR' },
  dual_weapon_mastery: { stat: 'atk', amount: 5, type: 'PASSIVE_WEAPON', weapon: 'dual' },
  master_of_combat: { stat: 'atk', amount: 5, type: 'PASSIVE_STAT' },
  polearm_mastery: { stat: 'atk', amount: 5, type: 'PASSIVE_WEAPON', weapon: 'spear' },
  shield_mastery: { stat: 'def', amount: 10, type: 'PASSIVE_ARMOR' },
  quick_step: { stat: 'speed', amount: 5, type: 'ATTACK_SPEED_MODIFIER' },
  dagger_mastery: { stat: 'atk', amount: 5, type: 'PASSIVE_WEAPON', weapon: 'dagger' },
  light_armor_mastery: { stat: 'def', amount: 6, type: 'PASSIVE_ARMOR' },
  critical_power: { stat: 'critDmg', amount: 0.05, type: 'CRITICAL_MODIFIER' },
  critical_chance: { stat: 'crit', amount: 5, type: 'CRITICAL_MODIFIER' },
  bow_mastery: { stat: 'atk', amount: 5, type: 'PASSIVE_WEAPON', weapon: 'bow' },
  eye_of_slayer: { stat: 'atk', amount: 5, type: 'PASSIVE_STAT' },
  magic_mastery: { stat: 'matk', amount: 4, type: 'PASSIVE_STAT' },
  robe_mastery: { stat: 'matk', amount: 4, type: 'PASSIVE_ARMOR' },
  fast_spell_casting: { stat: 'speed', amount: 4, type: 'ATTACK_SPEED_MODIFIER' },
  anti_magic: { stat: 'mdef', amount: 18, type: 'PASSIVE_STAT' },
  spellcraft: { stat: 'matk', amount: 4, type: 'PASSIVE_STAT' },
  focus_mind: { stat: 'mpRegen', amount: 2, type: 'MP_MANIPULATION' },
  sigil_mastery: { stat: 'matk', amount: 4, type: 'PASSIVE_ARMOR' },
  higher_mana_gain: { stat: 'mpRegen', amount: 2, type: 'MP_MANIPULATION' },
  boost_hp: { stat: 'maxHp', amount: 60, type: 'HP_MANIPULATION' },
  vital_force: { stat: 'maxHp', amount: 60, type: 'HP_MANIPULATION' },
  two_handed_weapon_mastery: { stat: 'atk', amount: 5, type: 'PASSIVE_WEAPON', weapon: 'twohand' },
  boost_evasion: { stat: 'eva', amount: 3, type: 'PASSIVE_STAT' },
  fist_mastery: { stat: 'atk', amount: 5, type: 'PASSIVE_WEAPON', weapon: 'fist' },
  boost_attack_speed: { stat: 'speed', amount: 5, type: 'ATTACK_SPEED_MODIFIER' }
};

export function classifySkill(id, def, v2) {
  const rawType = (v2?.rawType || def?.type || '').toLowerCase();
  const type = (def?.type || '').toLowerCase();
  const desc = (v2?.desc || def?.desc || '').toLowerCase();
  const effectText = (def?.effectText || v2?.canonicalEffect || '').toLowerCase();
  const effect = (def?.effect || '').toLowerCase();

  if (type === 'passive' || rawType === 'passive' || effect === 'stat') {
    if (STATS_ENGINE_PASSIVES[id]) {
      return STATS_ENGINE_PASSIVES[id].type;
    }
    if (def?.requiredWeapon && def.requiredWeapon !== 'any') return 'PASSIVE_WEAPON';
    if (id.includes('armor_mastery') || id.includes('robe_mastery') || id.includes('shield_mastery') || id.includes('sigil_mastery')) return 'PASSIVE_ARMOR';
    if (id.includes('crit')) return 'CRITICAL_MODIFIER';
    if (id.includes('speed') || id.includes('quick_step') || id.includes('fast_spell')) return 'ATTACK_SPEED_MODIFIER';
    if (id.includes('mana') || id.includes('mp') || id.includes('focus_mind')) return 'MP_MANIPULATION';
    if (id.includes('hp') || id.includes('vital_force')) return 'HP_MANIPULATION';
    if (id.includes('range') || id.includes('long_shot')) return 'RANGE_MODIFIER';
    return 'PASSIVE_STAT';
  }

  if (effect === 'dmg' || type === 'active') {
    if (effect === 'heal' || id.includes('heal') || id.includes('bandage')) return 'HEAL';
    if (effect === 'vampiric' || id.includes('drain')) return 'LIFESTEAL';
    if (effectText.includes('stun') || desc.includes('stun')) return 'STUN';
    if (effectText.includes('knockback') || desc.includes('knockback')) return 'KNOCKBACK';
    if (effectText.includes('aoe') || desc.includes('aoe') || desc.includes('nearby enemies')) return 'AOE_DAMAGE';
    if (effectText.includes('dano mágico') || desc.includes('deals m. damage') || desc.includes('magic damage')) return 'MAGICAL_DAMAGE';
    if (type === 'buff' || effect === 'warcry') return 'BUFF';
    return 'PHYSICAL_DAMAGE';
  }

  if (type === 'buff' || effect === 'warcry') {
    return 'BUFF';
  }

  if (effect === 'heal' || id.includes('heal') || id.includes('bandage')) {
    return 'HEAL';
  }

  if (effect === 'vampiric' || id.includes('drain')) {
    return 'LIFESTEAL';
  }

  return 'PHYSICAL_DAMAGE';
}

function getExpectedContract(family, sid, def) {
  switch (family) {
    case 'PHYSICAL_DAMAGE':
    case 'MAGICAL_DAMAGE':
    case 'AOE_DAMAGE':
    case 'STUN':
    case 'KNOCKBACK':
      return `Target takes damage > 0, enemy.hp decreases, CombatEventType.SKILL_DAMAGE emitted with skillId '${sid}', MP consumed, cooldown created`;
    case 'BUFF':
      return `state.buffs['${sid}'] created with until > now, stats.atk or applicable stat boosted during duration, returns to baseline upon expiry`;
    case 'HEAL':
      return `state.hp increases by heal amount without exceeding maxHp, CombatEventType.SKILL_CAST emitted, MP consumed, cooldown created`;
    case 'LIFESTEAL':
      return `Target takes damage, player recovers percentage of damage as HP, cooldown created`;
    case 'PASSIVE_STAT':
    case 'PASSIVE_WEAPON':
    case 'PASSIVE_ARMOR':
    case 'ATTACK_SPEED_MODIFIER':
    case 'CRITICAL_MODIFIER':
    case 'HP_MANIPULATION':
    case 'MP_MANIPULATION':
      if (STATS_ENGINE_PASSIVES[sid]) {
        return `Permanently increases stat '${STATS_ENGINE_PASSIVES[sid].stat}' by at least ${STATS_ENGINE_PASSIVES[sid].amount} per level in StatsEngine.getStats`;
      }
      return `Passive definition exists; specific stat mapping in StatsEngine required`;
    case 'RANGE_MODIFIER':
      return `Increases attack/cast range; engine range mechanics required`;
    default:
      return `Observable functional effect required for family ${family}`;
  }
}

function getProductionDispatcher(family) {
  if (family.startsWith('PASSIVE') || family === 'ATTACK_SPEED_MODIFIER' || family === 'CRITICAL_MODIFIER' || family === 'HP_MANIPULATION' || family === 'MP_MANIPULATION' || family === 'RANGE_MODIFIER') {
    return 'StatsEngine.getStats';
  }
  return 'main.attackMonster';
}

function getObservableDescription(family, sid) {
  if (family === 'PHYSICAL_DAMAGE' || family === 'MAGICAL_DAMAGE' || family === 'AOE_DAMAGE' || family === 'STUN' || family === 'KNOCKBACK') {
    return `enemyHpBefore - enemyHpAfter === damageEvent.damage && damage > 0 && cooldownRecorded`;
  }
  if (family === 'BUFF') {
    return `state.buffs['${sid}'].until > Date.now() && stats.atk > statsBefore.atk && statsAfterExpiry.atk === statsBefore.atk`;
  }
  if (family === 'HEAL') {
    return `hpAfter > hpBefore && hpAfter <= maxHp && cooldownRecorded`;
  }
  if (family === 'LIFESTEAL') {
    return `enemyHpBefore - enemyHpAfter > 0 && hpAfter >= hpBefore && cooldownRecorded`;
  }
  if (STATS_ENGINE_PASSIVES[sid]) {
    const p = STATS_ENGINE_PASSIVES[sid];
    return `statsAfter[${p.stat}] - statsBefore[${p.stat}] >= ${p.amount}`;
  }
  return `Observable state change in engine state or combat event`;
}

const inventory = [];
const uniqueDefinitionsMap = new Map();
let totalRelationships = 0;
let ownRelationships = 0;
let inheritedRelationships = 0;

for (const cls of Object.values(classes)) {
  const isContentGap = CONTENT_GAP_CLASSES.has(cls.id);
  const isUnproven = UNPROVEN_PROVENANCE_CLASSES.has(cls.id);

  let current = cls;
  const visited = new Set();
  const skills = new Map();

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

  if (skills.size === 0 && isContentGap) {
    inventory.push({
      classId: cls.id,
      skillId: null,
      origin: 'NONE',
      ancestor: null,
      definition: null,
      effectFamily: null,
      expectedContract: 'Class blocked due to content gap; no canonical skills defined',
      productionDispatcher: null,
      observable: null,
      validationStatus: 'BLOCKED_CONTENT_GAP',
      reason: 'Missing canonical class skills and branch documentation in local snapshot'
    });
    continue;
  }

  for (const [sid, ancestor] of skills.entries()) {
    totalRelationships++;
    const isOwn = ancestor === null;
    if (isOwn) ownRelationships++;
    else inheritedRelationships++;

    const def = defs[sid];
    const v2 = v2Skills[sid];
    const family = classifySkill(sid, def, v2);

    if (!uniqueDefinitionsMap.has(sid)) {
      uniqueDefinitionsMap.set(sid, {
        id: sid,
        name: def?.name || v2?.name || sid,
        type: def?.type || v2?.type,
        rawType: v2?.rawType,
        family,
        effect: def?.effect,
        requiredWeapon: def?.requiredWeapon,
        desc: def?.desc || v2?.desc,
        pwr: def?.pwr,
        mpCost: def?.mpCost,
        implementedInEngine: family.startsWith('PASSIVE') ? Boolean(STATS_ENGINE_PASSIVES[sid]) : true
      });
    }

    let validationStatus = 'NOT_VALIDATED';
    let reason = 'Independent behavioral contract awaiting evaluation';

    if (isContentGap) {
      validationStatus = 'BLOCKED_CONTENT_GAP';
      reason = 'Class is marked as CONTENT_GAP; fallback skill is not certified';
    } else if (isUnproven) {
      validationStatus = 'BLOCKED_UNPROVEN_PROVENANCE';
      reason = 'Class lineage origin has unresolved provenance gap';
    } else if (family === 'RANGE_MODIFIER' || (family.startsWith('PASSIVE') && !STATS_ENGINE_PASSIVES[sid])) {
      validationStatus = 'NOT_VALIDATED';
      reason = 'Passive skill not mapped to observable stat attribute in StatsEngine.js';
    }

    inventory.push({
      classId: cls.id,
      skillId: sid,
      origin: isOwn ? 'OWN' : 'INHERITED',
      ancestor,
      definition: {
        id: sid,
        name: def?.name || v2?.name || sid,
        type: def?.type || v2?.type,
        effect: def?.effect,
        requiredWeapon: def?.requiredWeapon || 'any',
        pwr: def?.pwr,
        mpCost: def?.mpCost,
        reqLvl: def?.reqLvl || def?.requiredLevel || 1
      },
      effectFamily: family,
      expectedContract: getExpectedContract(family, sid, def),
      productionDispatcher: getProductionDispatcher(family),
      observable: getObservableDescription(family, sid),
      validationStatus,
      reason
    });
  }
}

const report = {
  meta: {
    generatedAt: new Date().toISOString(),
    totalClasses: Object.keys(classes).length,
    blockedClassesCount: CONTENT_GAP_CLASSES.size + UNPROVEN_PROVENANCE_CLASSES.size,
    totalRelationships,
    ownRelationships,
    inheritedRelationships,
    uniqueSkillDefinitionsCount: uniqueDefinitionsMap.size,
    uniqueDefinitions: [...uniqueDefinitionsMap.values()]
  },
  inventory
};

const outPath = path.join(root, 'scripts/skill_functional_contract_inventory.json');
fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
console.log(`Saved ${inventory.length} inventory records to ${outPath}`);
console.log(`Total relationships: ${totalRelationships} (Own: ${ownRelationships}, Inherited: ${inheritedRelationships})`);
console.log(`Unique skill definitions: ${uniqueDefinitionsMap.size}`);
