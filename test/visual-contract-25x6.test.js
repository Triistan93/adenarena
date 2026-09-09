/**
 * test/visual-contract-25x6.test.js — Formal Test Suite for 25x6 Visual Contract & VFX Arsenal Coverage
 * 
 * Verifies:
 * 1. Exactly 25 active classes each have exactly 6 canonical skills in CLASS_SKILLS_ECHO (150 skills).
 * 2. Total registered skills in ALL_LOADED_SKILLS equals 160 (150 class skills + 10 shared).
 * 3. Zero orphan or legacy skills polluting the 25 active classes.
 * 4. VFX Feature Catalog Coverage: spawnMeteorRain, spawnArrowRain, spawnHolySwordRain, spawnIceShardRain,
 *    spawnDarkSpearRain, spawnEnergyBeam, spawnTornadoVortex, spawnGroundFissure, spawnHolyMandala,
 *    spawnDarkShadowRift, spawnBladeSlash, spawnOrbitalBlades execute without errors and consume pools.
 * 5. CameraFX triggerImpactFrame and audio duckAudio execute cleanly.
 * 6. VFX Fantasy Assignment Gate: All 25 Ultimates (★★★★) and 25 Master Ultimates (★★★★★) possess high-scale signatures.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ALL_LOADED_SKILLS } from '../lineage-idle/src/data/skills/index.js';
import { globalVFXPool } from '../lineage-idle/src/vfx/ObjectPool.js';
import { VFXComponentLibrary } from '../lineage-idle/src/vfx/VFXComponentLibrary.js';
import { globalCameraFX } from '../lineage-idle/src/vfx/CameraFX.js';
import { idleAudio } from '../src/utils/idleAudio.ts';
import { SoundFX } from '../lineage-idle/src/vfx/SoundFX.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Ensure mock EchoData environment for node test runner
if (typeof window === 'undefined') {
  global.window = {};
}

// Dynamically import echo-adapter
await import('../lineage-idle/data/echo-adapter.js');

test('1. 25 Classes x 6 Skills: Exactly 150 class skills mapped in CLASS_SKILLS_ECHO', () => {
  const registryPath = path.join(rootDir, 'lineage-idle', 'src', 'data', 'skills', 'skill-registry.json');
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

  assert.equal(registry.totalClasses, 25, 'Expected 25 totalClasses in registry');
  assert.equal(registry.totalSkills, 150, 'Expected 150 totalSkills in registry');
  assert.equal(registry.classes.length, 25, 'Expected 25 class entries in registry');

  const classSkills = window.EchoData.CLASS_SKILLS_ECHO;
  assert.ok(classSkills, 'CLASS_SKILLS_ECHO must exist');

  let totalMapped = 0;
  for (const cls of registry.classes) {
    const list = classSkills[cls.classId];
    assert.ok(list, `CLASS_SKILLS_ECHO must contain classId "${cls.classId}"`);
    assert.equal(list.length, 6, `Class "${cls.classId}" must have exactly 6 skills`);
    assert.deepEqual(list, cls.skills, `Class "${cls.classId}" skills must strictly match canonical list`);
    totalMapped += list.length;
  }

  assert.equal(totalMapped, 150, 'Total canonical class skills must be exactly 150');
});

test('2. Total Catalog Integrity: 150 Class Skills + 10 Shared = 160 Total Loaded', () => {
  const allSkills = new Map(ALL_LOADED_SKILLS);
  assert.equal(allSkills.size, 160, 'ALL_LOADED_SKILLS must contain exactly 160 skills');
});

test('3. Zero Orphan or Legacy Pollution in 25 Active Classes', () => {
  const classSkills = window.EchoData.CLASS_SKILLS_ECHO;
  const defs = window.EchoData.SKILL_DEFS_ECHO;

  const registryPath = path.join(rootDir, 'lineage-idle', 'src', 'data', 'skills', 'skill-registry.json');
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

  for (const cls of registry.classes) {
    const activeSkills = classSkills[cls.classId];
    for (const skillId of activeSkills) {
      assert.ok(defs[skillId], `Skill "${skillId}" in class "${cls.classId}" must exist in SKILL_DEFS_ECHO`);
      // Assert that skill belongs to class or is listed in class.skills
      assert.ok(cls.skills.includes(skillId), `Skill "${skillId}" must be canonical member of "${cls.classId}"`);
    }
  }
});

test('4. Advanced VFX Arsenal Coverage: All 10+ effect families spawn and allocate correctly', () => {
  globalVFXPool.releaseAll();

  // 1. Meteor Rain
  VFXComponentLibrary.spawnMeteorRain(200, 200, { count: 4 });
  assert.ok(globalVFXPool.fallingProjectiles.activeCount >= 4, 'Meteor rain must allocate falling projectiles');
  assert.ok(globalVFXPool.environmentalFields.activeCount >= 1, 'Meteor rain must allocate burning field');

  // 2. Arrow Rain
  VFXComponentLibrary.spawnArrowRain(100, 100, 300, 300, 16);
  assert.ok(globalVFXPool.fallingProjectiles.activeCount >= 20, 'Arrow rain must allocate arrows');

  // 3. Holy Sword Rain
  VFXComponentLibrary.spawnHolySwordRain(250, 250, 8);
  assert.ok(globalVFXPool.fallingProjectiles.activeCount >= 28, 'Holy sword rain must allocate swords');

  // 4. Ice Shard Rain
  VFXComponentLibrary.spawnIceShardRain(220, 220, 10);
  assert.ok(globalVFXPool.fallingProjectiles.activeCount >= 38, 'Ice shard rain must allocate shards');

  // 5. Dark Spear Rain
  VFXComponentLibrary.spawnDarkSpearRain(210, 210, 8);
  assert.ok(globalVFXPool.fallingProjectiles.activeCount >= 46, 'Dark spear rain must allocate spears');

  // 6. Energy Beam
  VFXComponentLibrary.spawnEnergyBeam(50, 50, 200, 200, 'holy');
  VFXComponentLibrary.spawnEnergyBeam(50, 50, 200, 200, 'lightning');
  assert.equal(globalVFXPool.beams.activeCount, 2, 'Energy beams must allocate in pool');

  // 7. Tornado Vortex
  VFXComponentLibrary.spawnTornadoVortex(150, 150);
  assert.ok(globalVFXPool.environmentalFields.activeCount >= 2, 'Tornado must allocate environmental field');

  // 8. Ground Fissure
  VFXComponentLibrary.spawnGroundFissure(180, 180);
  assert.ok(globalVFXPool.environmentalFields.activeCount >= 3, 'Fissure must allocate environmental field');

  // 9. Holy Mandala
  VFXComponentLibrary.spawnHolyMandala(190, 190);
  assert.ok(globalVFXPool.environmentalFields.activeCount >= 4, 'Holy mandala must allocate field');

  // 10. Dark Shadow Rift
  VFXComponentLibrary.spawnDarkShadowRift(195, 195);
  assert.ok(globalVFXPool.environmentalFields.activeCount >= 5, 'Dark rift must allocate field');

  // 11. Blade Slash
  VFXComponentLibrary.spawnBladeSlash(120, 120);
  assert.equal(globalVFXPool.slashes.activeCount, 1, 'Blade slash must allocate in slashes pool');

  // 12. Orbital Blades
  VFXComponentLibrary.spawnOrbitalBlades(100, 100, 4);
  assert.equal(globalVFXPool.spectralWeapons.activeCount, 4, 'Orbital blades must allocate spectral weapons');

  // Verify full release cleanly
  globalVFXPool.releaseAll();
  assert.equal(globalVFXPool.fallingProjectiles.activeCount, 0);
  assert.equal(globalVFXPool.beams.activeCount, 0);
  assert.equal(globalVFXPool.environmentalFields.activeCount, 0);
  assert.equal(globalVFXPool.slashes.activeCount, 0);
  assert.equal(globalVFXPool.spectralWeapons.activeCount, 0);
});

test('5. Game Feel: CameraFX impact frames and audio ducking execute cleanly', () => {
  // Trigger impact frame (35ms flash + freeze + trauma)
  globalCameraFX.triggerImpactFrame(35, '#ffffff');
  assert.ok(globalCameraFX.isFrozen, 'Camera should freeze during impact frame');
  assert.ok(globalCameraFX.flashAlpha > 0, 'Flash alpha must be active');
  assert.ok(globalCameraFX.trauma > 0, 'Trauma must be applied');

  // Reset camera
  globalCameraFX.reset();
  assert.equal(globalCameraFX.isFrozen, false);
  assert.equal(globalCameraFX.flashAlpha, 0);

  // Audio detune and seed hash
  const seed = idleAudio.hashSeed('hydro_blast', 1);
  assert.equal(typeof seed, 'number');
  assert.ok(seed >= -1 && seed <= 1);

  const normalDetune = idleAudio.getCategoryDetune('normal', seed);
  assert.ok(Math.abs(normalDetune) <= 30, 'Normal detune must be within +- 30 cents');

  const ultDetune = idleAudio.getCategoryDetune('ultimate', seed);
  assert.ok(Math.abs(ultDetune) <= 15, 'Ultimate detune must be within +- 15 cents');

  // Audio ducking execution
  idleAudio.duckAudio(200);

  // SoundFX execution safe in node environment
  SoundFX.playMeteorRain();
  SoundFX.playArrowRain();
  SoundFX.playHolySwordRain();
  SoundFX.playBeam('lightning');
  SoundFX.playTornado();
  SoundFX.playFissure();
  SoundFX.playIceShard();
  SoundFX.playBossRoar();
});

test('6. VFX Fantasy Assignment Gate: 25 Ultimates and 25 Master Ultimates have valid distinct signatures', () => {
  const allSkills = new Map(ALL_LOADED_SKILLS);
  const registryPath = path.join(rootDir, 'lineage-idle', 'src', 'data', 'skills', 'skill-registry.json');
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

  const ultimates = [];
  const masterUltimates = [];

  for (const cls of registry.classes) {
    const ultId = cls.ultimateSkill;
    const masterId = cls.masterUltimateSkill;

    assert.ok(ultId, `Class "${cls.classId}" must declare ultimateSkill`);
    assert.ok(masterId, `Class "${cls.classId}" must declare masterUltimateSkill`);

    const ultDef = allSkills.get(ultId);
    const masterDef = allSkills.get(masterId);

    assert.ok(ultDef, `Ultimate "${ultId}" must be loaded`);
    assert.ok(masterDef, `Master Ultimate "${masterId}" must be loaded`);

    assert.equal(ultDef.identity.tier, 'ultimate');
    assert.equal(masterDef.identity.tier, 'master_ultimate');

    assert.ok(ultDef.timeline && ultDef.timeline.phases && ultDef.timeline.phases.length >= 2);
    assert.ok(masterDef.timeline && masterDef.timeline.phases && masterDef.timeline.phases.length >= 2);

    ultimates.push(ultId);
    masterUltimates.push(masterId);
  }

  assert.equal(new Set(ultimates).size, 25, 'All 25 Ultimates must be unique');
  assert.equal(new Set(masterUltimates).size, 25, 'All 25 Master Ultimates must be unique');
});
