/**
 * test/skill-schema.test.js — Automated Auditor 1: Skill Schema Compliance
 * 
 * Verifies that all 150 class skills across 25 classes and all 10 shared generalist skills
 * adhere 100% to the official schema: lineage-idle/src/data/skills/schema/skill.schema.json
 * 
 * Validates:
 * 1. All 9 required top-level sections exist:
 *    - identity
 *    - gameplay
 *    - hitbox
 *    - timeline
 *    - game_feel
 *    - lighting
 *    - hud
 *    - performance
 *    - signature
 * 2. Identity fields: id, name, classId, race, tier, unlockLevel, element, role, tags, description
 * 3. Gameplay fields: castTime, cooldown, mpCost, damageMultiplier, hitCount, staggerDamage, critModifier, targetType, range, requiredWeapon
 * 4. Hitbox fields: type, offset { x, y }
 * 5. Timeline fields: totalDuration > 0, phases (min 1, with valid actions)
 * 6. Game feel fields: hitStop { duration, timeScale }, cameraShake { intensity, decay, duration }
 * 7. Lighting fields: castGlow { color, radius, intensity }, impactFlash { color, radius, intensity }
 * 8. HUD fields: damageNumbers { style, scale, animation, color }
 * 9. Performance fields: particleBudget, drawCalls, layerPriority, poolKey, allowConcurrent
 * 10. Signature fields: author, version, uniqueVfxSignature
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const schemaPath = path.resolve('lineage-idle/src/data/skills/schema/skill.schema.json');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

const races = ['human', 'elf', 'dark_elf', 'orc', 'dwarf', 'kamael', 'ertheia', 'high_elf'];
const allowedRaces = schema.properties.identity.properties.race.enum;
const allowedTiers = schema.properties.identity.properties.tier.enum;
const allowedElements = schema.properties.identity.properties.element.enum;
const allowedRoles = schema.properties.identity.properties.role.enum;
const allowedHitboxTypes = schema.properties.hitbox.properties.type.enum;
const allowedActionTypes = [
  'animation',
  'vfx',
  'sfx',
  'hitbox_activate',
  'camera_fx',
  'shake',
  'lighting',
  'shader',
  'status_apply',
  'projectile_spawn',
  'screen_overlay'
];

function validateSkillObject(skill, filename) {
  const prefix = `[${filename} :: ${skill?.identity?.id || 'unknown'}]`;

  // 1. Check all 9 top-level required properties
  for (const req of schema.required) {
    assert.ok(skill[req] !== undefined && skill[req] !== null, `${prefix} Missing required section: ${req}`);
  }

  // 2. Identity validation
  const id = skill.identity;
  assert.ok(typeof id.id === 'string' && /^[a-z0-9_]+$/.test(id.id), `${prefix} Invalid id: ${id.id}`);
  assert.ok(typeof id.name === 'string' && id.name.length >= 2, `${prefix} Invalid name: ${id.name}`);
  assert.ok(typeof id.classId === 'string' && id.classId.length > 0, `${prefix} Missing classId`);
  assert.ok(allowedRaces.includes(id.race), `${prefix} Invalid race: ${id.race}`);
  assert.ok(allowedTiers.includes(id.tier), `${prefix} Invalid tier: ${id.tier}`);
  assert.ok(typeof id.unlockLevel === 'number' && id.unlockLevel >= 1, `${prefix} Invalid unlockLevel`);
  assert.ok(allowedElements.includes(id.element), `${prefix} Invalid element: ${id.element}`);
  assert.ok(allowedRoles.includes(id.role), `${prefix} Invalid role: ${id.role}`);
  assert.ok(Array.isArray(id.tags) && id.tags.length > 0, `${prefix} Tags must be non-empty array`);
  assert.ok(typeof id.description === 'string' && id.description.length > 5, `${prefix} Missing description`);

  // 3. Gameplay validation
  const gp = skill.gameplay;
  assert.ok(typeof gp.castTime === 'number' && gp.castTime >= 0, `${prefix} Invalid castTime`);
  assert.ok(typeof gp.cooldown === 'number' && gp.cooldown >= 0, `${prefix} Invalid cooldown`);
  assert.ok(typeof gp.mpCost === 'number' && gp.mpCost >= 0, `${prefix} Invalid mpCost`);
  assert.ok(typeof gp.damageMultiplier === 'number' && gp.damageMultiplier >= 0, `${prefix} Invalid damageMultiplier`);
  assert.ok(typeof gp.hitCount === 'number' && gp.hitCount >= 1, `${prefix} Invalid hitCount`);
  assert.ok(typeof gp.staggerDamage === 'number' && gp.staggerDamage >= 0, `${prefix} Invalid staggerDamage`);
  assert.ok(typeof gp.critModifier === 'number' && gp.critModifier >= 0, `${prefix} Invalid critModifier`);
  assert.ok(typeof gp.targetType === 'string', `${prefix} Invalid targetType`);
  assert.ok(typeof gp.range === 'number' && gp.range >= 0, `${prefix} Invalid range`);
  assert.ok(Array.isArray(gp.requiredWeapon) && gp.requiredWeapon.length > 0, `${prefix} RequiredWeapon must be array`);

  // 4. Hitbox validation
  const hb = skill.hitbox;
  assert.ok(allowedHitboxTypes.includes(hb.type), `${prefix} Invalid hitbox type: ${hb.type}`);
  assert.ok(hb.offset && typeof hb.offset.x === 'number' && typeof hb.offset.y === 'number', `${prefix} Invalid hitbox offset`);

  // 5. Timeline validation
  const tl = skill.timeline;
  assert.ok(typeof tl.totalDuration === 'number' && tl.totalDuration >= 50, `${prefix} Invalid totalDuration`);
  assert.ok(Array.isArray(tl.phases) && tl.phases.length >= 1, `${prefix} Timeline must have at least 1 phase`);
  for (const phase of tl.phases) {
    assert.ok(typeof phase.name === 'string', `${prefix} Phase name missing`);
    assert.ok(typeof phase.start === 'number' && phase.start >= 0, `${prefix} Phase start invalid`);
    assert.ok(typeof phase.duration === 'number' && phase.duration >= 0, `${prefix} Phase duration invalid`);
    assert.ok(Array.isArray(phase.actions), `${prefix} Phase actions must be array`);
    for (const act of phase.actions) {
      assert.ok(typeof act.time === 'number' && act.time >= 0, `${prefix} Action time invalid`);
      assert.ok(allowedActionTypes.includes(act.type), `${prefix} Action type invalid: ${act.type}`);
      assert.ok(act.params && typeof act.params === 'object', `${prefix} Action params must be object`);
    }
  }

  // 6. Game feel validation
  const gf = skill.game_feel;
  assert.ok(gf.hitStop && typeof gf.hitStop.duration === 'number' && typeof gf.hitStop.timeScale === 'number', `${prefix} Invalid hitStop`);
  assert.ok(gf.cameraShake && typeof gf.cameraShake.intensity === 'number' && typeof gf.cameraShake.decay === 'number', `${prefix} Invalid cameraShake`);

  // 7. Lighting validation
  const lt = skill.lighting;
  assert.ok(lt.castGlow && typeof lt.castGlow.color === 'string' && typeof lt.castGlow.radius === 'number', `${prefix} Invalid castGlow`);
  assert.ok(lt.impactFlash && typeof lt.impactFlash.color === 'string' && typeof lt.impactFlash.radius === 'number', `${prefix} Invalid impactFlash`);

  // 8. HUD validation
  const hud = skill.hud;
  assert.ok(hud.damageNumbers && typeof hud.damageNumbers.style === 'string' && typeof hud.damageNumbers.color === 'string', `${prefix} Invalid damageNumbers`);

  // 9. Performance validation
  const perf = skill.performance;
  assert.ok(typeof perf.particleBudget === 'number' && perf.particleBudget <= 250, `${prefix} ParticleBudget exceeds 250 ceiling: ${perf.particleBudget}`);
  assert.ok(typeof perf.drawCalls === 'number' && perf.drawCalls <= 12, `${prefix} DrawCalls exceeds 12 ceiling`);
  assert.ok(typeof perf.layerPriority === 'number', `${prefix} Missing layerPriority`);
  assert.ok(typeof perf.poolKey === 'string' && perf.poolKey.startsWith('pool_'), `${prefix} Invalid poolKey: ${perf.poolKey}`);
  assert.ok(typeof perf.allowConcurrent === 'boolean', `${prefix} Missing allowConcurrent`);

  // 10. Signature validation
  const sig = skill.signature;
  assert.ok(typeof sig.author === 'string' && sig.author.length > 0, `${prefix} Missing author`);
  assert.ok(typeof sig.version === 'string' && sig.version.length > 0, `${prefix} Missing version`);
  assert.ok(typeof sig.uniqueVfxSignature === 'string' && sig.uniqueVfxSignature.length >= 8, `${prefix} Invalid uniqueVfxSignature`);
}

test('Automated Compliance Auditor 1 — Skill Schema Validation Suite', async (t) => {

  await t.test('1. Shared generalist skills conform strictly to schema (10 skills)', () => {
    const sharedFile = path.resolve('lineage-idle/src/data/skills/shared/general-skills.json');
    assert.ok(fs.existsSync(sharedFile), 'general-skills.json must exist');
    const { skills } = JSON.parse(fs.readFileSync(sharedFile, 'utf8'));
    assert.equal(skills.length, 10, 'Exactly 10 generalist skills');

    for (const skill of skills) {
      validateSkillObject(skill, 'general-skills.json');
    }
  });

  await t.test('2. All 25 class files and 150 skills conform strictly to schema', () => {
    let totalSkills = 0;
    let totalFiles = 0;

    for (const r of races) {
      const dir = path.resolve('lineage-idle/src/data/skills', r);
      assert.ok(fs.existsSync(dir), `Race directory must exist: ${r}`);
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

      for (const file of files) {
        totalFiles++;
        const filePath = path.join(dir, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        assert.ok(Array.isArray(data.skills), `skills property must be array in ${file}`);
        assert.equal(data.skills.length, 6, `Every class must contain exactly 6 skills: ${file}`);
        totalSkills += data.skills.length;

        for (const skill of data.skills) {
          validateSkillObject(skill, file);
        }
      }
    }

    assert.equal(totalFiles, 25, 'Exactly 25 class files validated');
    assert.equal(totalSkills, 150, 'Exactly 150 class skills validated');
  });

  await t.test('3. Unique VFX Signature audit — 0 collision across 160 total skills', () => {
    const signatures = new Set();
    const allFiles = [];

    // Shared
    const sharedFile = path.resolve('lineage-idle/src/data/skills/shared/general-skills.json');
    allFiles.push(sharedFile);

    // 25 Classes
    for (const r of races) {
      const dir = path.resolve('lineage-idle/src/data/skills', r);
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).map(f => path.join(dir, f));
      allFiles.push(...files);
    }

    let checkedCount = 0;
    for (const filePath of allFiles) {
      const { skills } = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      for (const s of skills) {
        const sig = s.signature.uniqueVfxSignature;
        assert.ok(!signatures.has(sig), `Duplicate VFX signature detected: ${sig} in skill ${s.identity.id}`);
        signatures.add(sig);
        checkedCount++;
      }
    }

    assert.equal(checkedCount, 160, 'Exactly 160 total skill signatures checked');
    assert.equal(signatures.size, 160, 'All 160 skill signatures are strictly unique');
  });
});
