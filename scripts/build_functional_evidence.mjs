import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const invPath = path.join(root, 'scripts/skill_functional_contract_inventory.json');
const inv = JSON.parse(fs.readFileSync(invPath, 'utf8'));

const STATS_ENGINE_PASSIVES = {
  weapon_mastery: 'atk', armor_mastery: 'def', sword_blunt_mastery: 'atk',
  heavy_armor_mastery: 'def', dual_weapon_mastery: 'atk', master_of_combat: 'atk',
  polearm_mastery: 'atk', shield_mastery: 'def', quick_step: 'speed',
  dagger_mastery: 'atk', light_armor_mastery: 'def', critical_power: 'critDmg',
  critical_chance: 'crit', bow_mastery: 'atk', eye_of_slayer: 'atk',
  magic_mastery: 'matk', robe_mastery: 'matk', fast_spell_casting: 'speed',
  anti_magic: 'mdef', spellcraft: 'matk', focus_mind: 'mpRegen',
  sigil_mastery: 'matk', higher_mana_gain: 'mpRegen', boost_hp: 'maxHp',
  vital_force: 'maxHp', two_handed_weapon_mastery: 'atk', boost_evasion: 'eva',
  fist_mastery: 'atk', boost_attack_speed: 'speed'
};

const contracts = {};
for (const def of inv.meta.uniqueDefinitions) {
  const id = def.id;
  const fam = def.family;
  if (STATS_ENGINE_PASSIVES[id]) {
    contracts[id] = { kind: 'passive', stat: STATS_ENGINE_PASSIVES[id], source: `${def.name}: increase ${STATS_ENGINE_PASSIVES[id]}` };
  } else if (fam === 'BUFF') {
    contracts[id] = { kind: 'buff', stat: 'atk', source: `${def.name}: attack buff with duration and expiration` };
  } else if (fam === 'HEAL') {
    contracts[id] = { kind: 'heal', source: `${def.name}: restore HP without exceeding maxHp` };
  } else if (['PHYSICAL_DAMAGE', 'MAGICAL_DAMAGE', 'AOE_DAMAGE', 'STUN', 'KNOCKBACK', 'LIFESTEAL'].includes(fam)) {
    contracts[id] = { kind: 'damage', source: `${def.name}: deal combat damage with MP and cooldown` };
  }
}

const lines = [
  '// Explicit behavioral contracts. Never infer a successful effect from production metadata.',
  `export const EFFECT_CONTRACTS = Object.freeze(${JSON.stringify(contracts, null, 2)});`,
  '',
  'export function assessEffect(contract, evidence) {',
  '  if (!contract) return { status: "NOT_VALIDATED", pass: null, reason: "Independent effect contract missing", evidence };',
  '  let pass = false;',
  '  if (contract.kind === "passive") pass = Number.isFinite(evidence.after?.[contract.stat]) && evidence.after[contract.stat] > evidence.before?.[contract.stat];',
  '  if (contract.kind === "buff") pass = evidence.applied === true && evidence.expiresInMs > 0 && evidence.after?.[contract.stat] > evidence.before?.[contract.stat] && evidence.expired?.[contract.stat] === evidence.before?.[contract.stat];',
  '  if (contract.kind === "damage") {',
  '    const damage = (evidence.events || []).filter(e => e.skillId === evidence.skillId).reduce((n, e) => n + (e.damage || 0), 0);',
  '    pass = damage > 0 && evidence.hpBefore - evidence.hpAfter === damage;',
  '  }',
  '  if (contract.kind === "heal") pass = evidence.cast === true && evidence.hpAfter > evidence.hpBefore && evidence.hpAfter <= evidence.maxHp;',
  '  return { status: pass ? "PASS" : "FAIL", pass, contract, evidence };',
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

const targetFile = path.join(root, 'scripts/lib/functional-evidence.mjs');
fs.writeFileSync(targetFile, lines.join('\n'));
console.log(`Generated ${targetFile} with ${Object.keys(contracts).length} contracts`);
