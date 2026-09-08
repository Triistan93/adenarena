/**
 * test/skill-performance.test.js — Automated Auditor 4: Performance Budgets & Pooling Enforcement
 * 
 * Verifies that:
 * 1. Particle Budgets:
 *    - Core / Normal skills: particleBudget <= 80
 *    - Heavy / Specialization skills: particleBudget <= 120
 *    - Ultimate skills: particleBudget <= 180
 *    - Master Ultimate skills: particleBudget <= 250
 * 2. Draw Call Ceilings:
 *    - Normal <= 6
 *    - Heavy <= 8
 *    - Ultimate <= 10
 *    - Master Ultimate <= 12
 * 3. Concurrency Protection:
 *    - Ultimates and Master Ultimates enforce allowConcurrent = false to prevent GPU overload.
 * 4. Object Pool Enforcement:
 *    - All 158 skills declare a valid poolKey starting with 'pool_'.
 * 5. Frame Timing:
 *    - All skill durations <= 3000ms.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const races = ['human', 'elf', 'dark_elf', 'orc', 'dwarf', 'kamael', 'ertheia', 'high_elf'];

function getAllSkills() {
  const all = [];

  // Shared
  const sharedFile = path.resolve('lineage-idle/src/data/skills/shared/general-skills.json');
  const sharedData = JSON.parse(fs.readFileSync(sharedFile, 'utf8'));
  all.push(...sharedData.skills);

  // 25 Classes
  for (const r of races) {
    const dir = path.resolve('lineage-idle/src/data/skills', r);
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
    for (const file of files) {
      const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
      all.push(...data.skills);
    }
  }

  return all;
}

test('Automated Compliance Auditor 4 — Performance Budgets & Memory Pooling Suite', async (t) => {

  const skills = getAllSkills();
  assert.equal(skills.length, 158, 'Exactly 158 skills to audit for performance compliance');

  await t.test('1. Particle budget tiers strictly enforced (Normal <= 80, Heavy <= 120, Ult <= 180, Master <= 250)', () => {
    for (const s of skills) {
      const tier = s.identity.tier;
      const budget = s.performance.particleBudget;
      const id = s.identity.id;

      if (tier === 'master_ultimate') {
        assert.ok(budget <= 250, `Master Ultimate ${id} exceeds 250 particle budget: ${budget}`);
      } else if (tier === 'ultimate') {
        assert.ok(budget <= 180, `Ultimate ${id} exceeds 180 particle budget: ${budget}`);
      } else if (tier === 'specialization' || tier === 'elemental_specialization') {
        assert.ok(budget <= 120, `Specialization ${id} exceeds 120 particle budget: ${budget}`);
      } else {
        assert.ok(budget <= 80, `Normal skill ${id} exceeds 80 particle budget: ${budget}`);
      }
    }
  });

  await t.test('2. Draw calls ceiling strictly enforced (Normal <= 6, Heavy <= 8, Ult <= 10, Master <= 12)', () => {
    for (const s of skills) {
      const tier = s.identity.tier;
      const dc = s.performance.drawCalls;
      const id = s.identity.id;

      if (tier === 'master_ultimate') {
        assert.ok(dc <= 12, `Master Ultimate ${id} exceeds 12 draw calls: ${dc}`);
      } else if (tier === 'ultimate') {
        assert.ok(dc <= 10, `Ultimate ${id} exceeds 10 draw calls: ${dc}`);
      } else if (tier === 'specialization' || tier === 'elemental_specialization') {
        assert.ok(dc <= 8, `Specialization ${id} exceeds 8 draw calls: ${dc}`);
      } else {
        assert.ok(dc <= 6, `Normal skill ${id} exceeds 6 draw calls: ${dc}`);
      }
    }
  });

  await t.test('3. Concurrency protection — Ultimates and Master Ultimates disable concurrent cast', () => {
    for (const s of skills) {
      const tier = s.identity.tier;
      const id = s.identity.id;

      if (tier === 'ultimate' || tier === 'master_ultimate') {
        assert.equal(s.performance.allowConcurrent, false, `Endgame skill ${id} must set allowConcurrent: false`);
      }
    }
  });

  await t.test('4. Memory pooling compliance — All skills declare valid poolKey', () => {
    for (const s of skills) {
      const pk = s.performance.poolKey;
      assert.ok(pk && typeof pk === 'string' && pk.startsWith('pool_'), `Invalid poolKey on ${s.identity.id}: ${pk}`);
    }
  });

  await t.test('5. Frame budget timing — total duration within [300, 3000]ms', () => {
    for (const s of skills) {
      const dur = s.timeline.totalDuration;
      assert.ok(dur >= 300 && dur <= 3000, `Skill ${s.identity.id} duration (${dur}ms) outside [300, 3000]ms`);
    }
  });
});
