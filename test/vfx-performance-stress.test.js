/**
 * test/vfx-performance-stress.test.js — Automated Stress Benchmark & Skill Regression Suite
 * 
 * Verifies:
 * 1. Screen Shake Intensity is mathematically exactly 10% (SHAKE_FINAL = SHAKE_ORIGINAL * 0.10).
 * 2. Sound effects are cleanly muted/disabled (SoundFX.enabled === false).
 * 3. Regression across skill archetypes: Warrior, Mage, Archer, Support, Boss Ultimates.
 * 4. Concurrent stress tests at 10, 25, 50, and 100 simultaneous VFX.
 * 5. Zero memory leaks: complete pool reclamation after heavy combat bursts.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { globalVFXOrchestrator, VFXOrchestrator } from '../lineage-idle/src/vfx/VFXOrchestrator.js';
import { combatEvents, CombatEventType } from '../lineage-idle/src/vfx/CombatEvent.js';
import { globalVFXPool } from '../lineage-idle/src/vfx/ObjectPool.js';
import { globalCameraFX, CameraFX, SCREEN_SHAKE_INTENSITY } from '../lineage-idle/src/vfx/CameraFX.js';
import { SoundFX } from '../lineage-idle/src/vfx/SoundFX.js';

test('1. Screen Shake Intensity is mathematically exactly 10%', () => {
  assert.equal(SCREEN_SHAKE_INTENSITY, 0.10, 'SCREEN_SHAKE_INTENSITY must equal 0.10');

  const baselineCamera = new CameraFX({ shakeMultiplier: 1.0 });
  const optimizedCamera = new CameraFX({ shakeMultiplier: SCREEN_SHAKE_INTENSITY });

  // Add identical trauma
  baselineCamera.addTrauma(0.5);
  optimizedCamera.addTrauma(0.5);

  // Advance time by 16ms
  baselineCamera.update(16);
  optimizedCamera.update(16);

  assert.ok(Math.abs(optimizedCamera.offsetX) > 0, 'Optimized camera must still produce subtle shake');
  
  // Ratio of displacement must be exactly equal to SCREEN_SHAKE_INTENSITY (0.10)
  const ratioX = Math.abs(optimizedCamera.offsetX / baselineCamera.offsetX);
  const ratioY = Math.abs(optimizedCamera.offsetY / baselineCamera.offsetY);
  const ratioRoll = Math.abs(optimizedCamera.rotation / baselineCamera.rotation);

  assert.ok(Math.abs(ratioX - 0.10) < 0.001, `Expected ratioX to be 0.10, got ${ratioX}`);
  assert.ok(Math.abs(ratioY - 0.10) < 0.001, `Expected ratioY to be 0.10, got ${ratioY}`);
  assert.ok(Math.abs(ratioRoll - 0.10) < 0.001, `Expected ratioRoll to be 0.10, got ${ratioRoll}`);
});

test('2. Sound effects are cleanly disabled for zero audio synthesis overhead', () => {
  assert.equal(SoundFX.enabled, false, 'SoundFX.enabled must be false');
  assert.equal(SoundFX.audio, null, 'SoundFX.audio must return null when disabled');
  
  // None of these methods should throw
  SoundFX.playWindup('Fire', 200);
  SoundFX.playElementalImpact('Fire', true);
  SoundFX.playUltimateFanfare(true);
  SoundFX.playStaggerBreak();
  SoundFX.playBossRoar();
});

test('3. Regression across skill archetypes: Warrior, Mage, Archer, Support, Boss', () => {
  const orchestrator = new VFXOrchestrator();

  const archetypes = [
    { name: 'Warrior: Earth Tremor', id: 'warrior_earth_tremor' },
    { name: 'Warrior: Sonic Storm', id: 'warrior_sonic_storm' },
    { name: 'Mage: Prominence', id: 'prominence' },
    { name: 'Mage: Hydro Blast', id: 'hydro_blast' },
    { name: 'Mage: Meteor', id: 'meteor' },
    { name: 'Archer: Arrow Rain', id: 'arrow_rain' },
    { name: 'Archer: Snipe Shot', id: 'snipe_shot' },
    { name: 'Support: Holy Sanctuary', id: 'holy_sanctuary' },
    { name: 'Support: Holy Heal', id: 'holy_heal' },
    { name: 'Boss: Titanbreaker', id: 'titanbreaker' },
    { name: 'Master Boss: Master Titanbreaker', id: 'master_titanbreaker' }
  ];

  for (const skill of archetypes) {
    orchestrator.handleSkillCast({
      skillId: skill.id,
      sourcePos: { x: 100, y: 250 },
      targetPos: { x: 350, y: 250 }
    });
  }

  // Update loop for 10 frames
  for (let f = 0; f < 10; f++) {
    orchestrator.update(16.6);
  }

  assert.ok(orchestrator.pool.particles._active.size > 0, 'Particles must be active during combat');

  // Verify telegraphs
  const tg = orchestrator.spawnTelegraphCircle({ x: 300, y: 200, radius: 80, duration: 1000 });
  assert.ok(orchestrator._activeTelegraphs.length > 0, 'Telegraph must be registered');
  orchestrator.clearTelegraphs();
  assert.equal(orchestrator._activeTelegraphs.length, 0, 'Telegraphs cleared on demand');

  orchestrator.destroy();
  assert.equal(orchestrator.pool.particles._active.size, 0, 'Zero lingering particles after destroy');
});

test('4. Stress Test: 10, 25, 50, and 100 simultaneous VFX bursts with benchmark metrics', () => {
  const orchestrator = new VFXOrchestrator();
  const mockCanvas = {
    width: 800,
    height: 450,
    getContext: () => ({
      save: () => {},
      restore: () => {},
      clearRect: () => {},
      fillRect: () => {},
      fillText: () => {},
      beginPath: () => {},
      arc: () => {},
      fill: () => {},
      stroke: () => {},
      translate: () => {},
      scale: () => {},
      rotate: () => {},
      createRadialGradient: () => ({ addColorStop: () => {} }),
      createLinearGradient: () => ({ addColorStop: () => {} })
    })
  };
  const ctx = mockCanvas.getContext('2d');

  const stressLevels = [10, 25, 50, 100];
  const benchmarkResults = [];

  const skillPool = [
    'titanbreaker', 'prominence', 'hydro_blast', 'meteor',
    'arrow_rain', 'warrior_earth_tremor', 'warrior_sonic_storm', 'prismatic_genesis'
  ];

  for (const count of stressLevels) {
    orchestrator.pool.releaseAll();
    orchestrator.timelines.cancelAll();

    // Spawn N simultaneous skills
    for (let i = 0; i < count; i++) {
      const skillId = skillPool[i % skillPool.length];
      orchestrator.handleSkillCast({
        skillId,
        sourcePos: { x: 100 + (i % 5) * 20, y: 200 + (i % 3) * 30 },
        targetPos: { x: 350 + (i % 4) * 15, y: 220 + (i % 4) * 25 }
      });
    }

    const start = performance.now();
    const frames = 60; // Simulate 1 second at 60fps
    let peakParticles = 0;
    let peakProjectiles = 0;
    for (let f = 0; f < frames; f++) {
      orchestrator.update(16.6);
      orchestrator.render(ctx, 800, 450);
      peakParticles = Math.max(peakParticles, orchestrator.pool.particles._active.size);
      peakProjectiles = Math.max(peakProjectiles, orchestrator.pool.projectiles._active.size);
    }
    const elapsed = performance.now() - start;
    const avgFrameTime = elapsed / frames;
    const estimatedFps = 1000 / avgFrameTime;

    benchmarkResults.push({
      simultaneousVFX: count,
      avgFrameTimeMs: Math.round(avgFrameTime * 100) / 100,
      estimatedFps: Math.round(estimatedFps),
      peakParticles,
      peakProjectiles
    });

    // Budget compliance check
    assert.ok(avgFrameTime < 5.0, `Frame time (${avgFrameTime.toFixed(2)}ms) must be well within 16.6ms budget at ${count} simultaneous VFX`);
  }

  console.log('\n=== VFX PERFORMANCE & FPS STRESS BENCHMARK ===');
  console.table(benchmarkResults);

  // Teardown and zero memory leak check
  orchestrator.destroy();
  assert.equal(orchestrator.pool.particles._active.size, 0, 'Particles pool must be 0 after destroy');
  assert.equal(orchestrator.pool.projectiles._active.size, 0, 'Projectiles pool must be 0 after destroy');
  assert.equal(orchestrator.pool.shockwaves._active.size, 0, 'Shockwaves pool must be 0 after destroy');
  assert.equal(orchestrator.pool.floatingText._active.size, 0, 'FloatingText pool must be 0 after destroy');
});
