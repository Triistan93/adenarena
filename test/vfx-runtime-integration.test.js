/**
 * test/vfx-runtime-integration.test.js — Runtime Integration Test for 2D Combat Presentation System
 * 
 * Verifies that:
 * 1. All 160 skills are registered and accessible in VFXOrchestrator.
 * 2. VFXOrchestrator mounts properly to the stage element and creates .vfx-stage-canvas.
 * 3. Combat events (SKILL_CAST, SKILL_HIT, SKILL_CRIT, SKILL_DAMAGE, SKILL_STAGGER, SKILL_KILL)
 *    trigger proper visual, camera, lighting, and shader responses.
 * 4. Hit-stop, trauma shake, ambient dimming, and shockwaves execute deterministically.
 * 5. Memory is clean with zero leaks and object pool reclamation.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { globalVFXOrchestrator, VFXOrchestrator } from '../lineage-idle/src/vfx/VFXOrchestrator.js';
import { combatEvents, CombatEventType } from '../lineage-idle/src/vfx/CombatEvent.js';
import { globalVFXPool } from '../lineage-idle/src/vfx/ObjectPool.js';
import { globalCameraFX } from '../lineage-idle/src/vfx/CameraFX.js';
import { globalLightingFX } from '../lineage-idle/src/vfx/LightingFX.js';
import { globalShaderSystem } from '../lineage-idle/src/vfx/ShaderSystem.js';
import { ALL_LOADED_SKILLS } from '../lineage-idle/src/data/skills/index.js';

test('1. VFXOrchestrator registers all 160 skill definitions on initialization', () => {
  assert.ok(globalVFXOrchestrator._skillDefRegistry.size >= 160, `Expected at least 160 skills, found ${globalVFXOrchestrator._skillDefRegistry.size}`);
  
  // Verify key ultimates are in registry
  const titanbreaker = globalVFXOrchestrator._skillDefRegistry.get('titanbreaker');
  assert.ok(titanbreaker, 'titanbreaker must be registered');
  assert.equal(titanbreaker.identity.tier, 'ultimate');

  const masterTitanbreaker = globalVFXOrchestrator._skillDefRegistry.get('master_titanbreaker');
  assert.ok(masterTitanbreaker, 'master_titanbreaker must be registered');
  assert.equal(masterTitanbreaker.identity.tier, 'master_ultimate');

  const prismaticGenesis = globalVFXOrchestrator._skillDefRegistry.get('prismatic_genesis');
  assert.ok(prismaticGenesis, 'prismatic_genesis must be registered');
  assert.equal(prismaticGenesis.identity.tier, 'ultimate');
});

test('2. VFXOrchestrator mounts and unmounts cleanly on stage element', () => {
  const children = [];
  const classList = new Set();
  const mockStage = {
    clientWidth: 800,
    clientHeight: 450,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 450 }),
    style: { transform: '' },
    classList: {
      add: (c) => classList.add(c),
      remove: (c) => classList.delete(c),
      contains: (c) => classList.has(c)
    },
    querySelector: (sel) => {
      if (sel === '.vfx-stage-canvas') {
        return children.find(c => c.className === 'vfx-stage-canvas') || null;
      }
      return null;
    },
    appendChild: (child) => {
      children.push(child);
      child.parentNode = mockStage;
      return child;
    },
    removeChild: (child) => {
      const idx = children.indexOf(child);
      if (idx >= 0) children.splice(idx, 1);
      child.parentNode = null;
      return child;
    },
    ownerDocument: {
      createElement: (tag) => {
        return {
          tagName: tag.toUpperCase(),
          className: '',
          style: {},
          width: 0,
          height: 0,
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
            rotate: () => {}
          }),
          parentNode: null
        };
      }
    }
  };

  globalVFXOrchestrator.mount(mockStage);
  assert.ok(globalVFXOrchestrator._running, 'VFXOrchestrator should be running after mount');
  assert.ok(globalVFXOrchestrator.canvas, 'Canvas overlay should be created');
  assert.equal(globalVFXOrchestrator.canvas.width, 800);
  assert.equal(globalVFXOrchestrator.canvas.height, 450);

  globalVFXOrchestrator.unmount();
  assert.equal(globalVFXOrchestrator._running, false, 'VFXOrchestrator should stop after unmount');
  assert.equal(globalVFXOrchestrator.stageElement, null, 'Stage element reference should be cleared');
});

test('3. Combat Events trigger CameraFX, LightingFX, and ShaderSystem', async () => {
  // Reset clean state
  globalCameraFX.reset();
  globalLightingFX.reset();
  globalShaderSystem.reset();
  globalVFXPool.releaseAll();

  // A. SKILL_CAST on Ultimate (titanbreaker) -> Ambient Dimming & Punch Zoom
  combatEvents.emit(CombatEventType.SKILL_CAST, {
    skillId: 'titanbreaker',
    sourcePos: { x: 120, y: 300 },
    targetPos: { x: 380, y: 300 }
  });

  assert.ok(globalLightingFX._ambientAlpha > 0, 'Ambient dimming should activate for Ultimate cast');
  assert.ok(globalCameraFX.zoom > 1.0, 'Punch zoom should activate for Ultimate cast');

  // B. SKILL_CRIT (colossal tier) -> Hit-Stop & High Trauma Shake & Chromatic Aberration
  combatEvents.emit(CombatEventType.SKILL_CRIT, {
    critTier: 'colossal',
    targetPos: { x: 380, y: 300 },
    damage: 9999
  });

  assert.ok(globalCameraFX.trauma >= 0.7, 'Colossal crit must add heavy trauma (>= 0.7)');
  assert.equal(globalCameraFX.isFrozen, true, 'Colossal crit must trigger hit-stop freeze frame');
  assert.ok(globalShaderSystem.chromaticOffset > 0, 'Colossal crit must trigger chromatic aberration');

  // C. SKILL_STAGGER (Break) -> Shockwave & Stagger Break Visuals
  combatEvents.emit(CombatEventType.SKILL_STAGGER, {
    targetPos: { x: 380, y: 300 },
    isBreak: true
  });

  assert.ok(globalShaderSystem.shockwaves.length > 0, 'Stagger break must trigger radial shockwave');

  // D. SKILL_DAMAGE -> Floating Damage Text from ObjectPool
  combatEvents.emit(CombatEventType.SKILL_DAMAGE, {
    damage: 1250,
    targetPos: { x: 380, y: 300 },
    isCrit: true
  });

  assert.ok(globalVFXPool.floatingText._active.size > 0, 'Floating damage text must be acquired from pool');
  assert.equal(Array.from(globalVFXPool.floatingText._active)[0].text, '1250');
});

test('4. Update loop decays trauma and updates pool without memory allocation', () => {
  globalCameraFX.trauma = 0.8;
  const initialTrauma = globalCameraFX.trauma;

  // Run update for 200ms
  globalVFXOrchestrator.update(200);

  assert.ok(globalCameraFX.trauma < initialTrauma, 'Trauma must decay over time');

  // Reset and verify clean pool
  globalVFXOrchestrator.destroy();
  assert.equal(globalVFXPool.particles._active.size, 0);
  assert.equal(globalVFXPool.projectiles._active.size, 0);
  assert.equal(globalVFXPool.shockwaves._active.size, 0);
  assert.equal(globalVFXPool.floatingText._active.size, 0);
  assert.equal(globalCameraFX.trauma, 0);
});

test('5. globalVFXOrchestrator.clear() flushes all active pools, telegraphs, and canvas state', () => {
  // Populate pools with dummy effects
  globalVFXPool.particles.acquire({ x: 100, y: 100, color: '#ffffff' });
  globalVFXPool.particles.acquire({ x: 200, y: 200, color: '#ff0000' });
  globalVFXPool.projectiles.acquire({ x: 50, y: 50, targetX: 150, targetY: 150 });
  globalVFXPool.fallingProjectiles.acquire({ startX: 100, startY: -50, targetX: 100, targetY: 200, type: 'meteor' });
  globalVFXPool.shockwaves.acquire({ x: 100, y: 100, maxRadius: 50 });
  globalVFXPool.floatingText.acquire({ text: '999', x: 100, y: 100 });
  globalVFXPool.beams.acquire({ startX: 0, startY: 0, targetX: 100, targetY: 100 });
  globalVFXPool.environmentalFields.acquire({ x: 100, y: 100 });
  globalVFXPool.slashes.acquire({ x: 100, y: 100 });
  globalVFXPool.spectralWeapons.acquire({ x: 100, y: 100 });
  globalVFXOrchestrator.spawnTelegraphCircle({ x: 100, y: 100, radius: 60 });

  assert.equal(globalVFXPool.particles._active.size, 2);
  assert.equal(globalVFXPool.fallingProjectiles._active.size, 1);
  assert.equal(globalVFXOrchestrator._activeTelegraphs.length, 1);

  // Invoke clear
  globalVFXOrchestrator.clear();

  assert.equal(globalVFXPool.particles._active.size, 0, 'Particles must be 0 after clear()');
  assert.equal(globalVFXPool.projectiles._active.size, 0, 'Projectiles must be 0 after clear()');
  assert.equal(globalVFXPool.fallingProjectiles._active.size, 0, 'Falling projectiles must be 0 after clear()');
  assert.equal(globalVFXPool.shockwaves._active.size, 0, 'Shockwaves must be 0 after clear()');
  assert.equal(globalVFXPool.floatingText._active.size, 0, 'Floating text must be 0 after clear()');
  assert.equal(globalVFXPool.beams._active.size, 0, 'Beams must be 0 after clear()');
  assert.equal(globalVFXPool.environmentalFields._active.size, 0, 'Fields must be 0 after clear()');
  assert.equal(globalVFXPool.slashes._active.size, 0, 'Slashes must be 0 after clear()');
  assert.equal(globalVFXPool.spectralWeapons._active.size, 0, 'Spectral weapons must be 0 after clear()');
  assert.equal(globalVFXOrchestrator._activeTelegraphs.length, 0, 'Telegraphs must be 0 after clear()');
});

test('6. Update loop safely purges NaN and corrupted objects without leaking pools', () => {
  globalVFXOrchestrator.clear();

  // Acquire and inject NaN / corrupted values into runtime objects
  const badParticle1 = globalVFXPool.particles.acquire({ x: 100, y: 100, color: '#ffffff' });
  badParticle1.x = NaN;

  const badParticle2 = globalVFXPool.particles.acquire({ x: 100, y: 100 });
  badParticle2.life = NaN;

  const expiredParticle = globalVFXPool.particles.acquire({ x: 100, y: 100, maxLife: 300 });
  expiredParticle.life = 350;

  const badProj = globalVFXPool.projectiles.acquire({ x: 100, y: 100, targetX: 200, targetY: 200 });
  badProj.targetX = NaN;

  const badFallingProj = globalVFXPool.fallingProjectiles.acquire({ startX: 100, startY: 0, targetX: 100, targetY: 100, type: 'meteor' });
  badFallingProj.targetX = NaN;

  assert.equal(globalVFXPool.particles._active.size, 3);
  assert.equal(globalVFXPool.projectiles._active.size, 1);
  assert.equal(globalVFXPool.fallingProjectiles._active.size, 1);

  // Update tick
  globalVFXOrchestrator.update(16);

  // All corrupted and expired elements must be immediately detected and reclaimed
  assert.equal(globalVFXPool.particles._active.size, 0, 'Corrupted and expired particles must be released');
  assert.equal(globalVFXPool.projectiles._active.size, 0, 'Corrupted projectiles must be released');
  assert.equal(globalVFXPool.fallingProjectiles._active.size, 0, 'Corrupted falling projectiles must be released');
});

test('7. Monster death / transition lifecycle clears all lingering visual residue', () => {
  globalVFXOrchestrator.clear();

  // Simulate combat hit with particles orbiting target
  for (let i = 0; i < 9; i++) {
    globalVFXPool.particles.acquire({
      x: 846 + (i % 2 === 0 ? -13 : 13),
      y: 294,
      color: '#ffffff',
      size: 9,
      maxLife: 2000
    });
  }
  assert.equal(globalVFXPool.particles._active.size, 9, 'Should have exactly 9 particles active (reproducing user case)');

  // Monster dies -> clear() is called
  globalVFXOrchestrator.clear();

  assert.equal(globalVFXPool.particles._active.size, 0, 'Active particles must drop to 0 on monster death');
});

test('8. LineageVFX shockwave rings expand, fade out, and purge cleanly without residue', async () => {
  await import('../lineage-idle/vfx-lineage-idle.js');
  const LineageVFX = globalThis.LineageVFX;
  assert.ok(LineageVFX, 'LineageVFX constructor should be available');

  const mockCtx = {
    save: () => {}, restore: () => {}, clearRect: () => {}, fillRect: () => {},
    beginPath: () => {}, arc: () => {}, stroke: () => {}, fill: () => {},
    setTransform: () => {}, createRadialGradient: () => ({ addColorStop: () => {} }),
    createLinearGradient: () => ({ addColorStop: () => {} }),
    translate: () => {}, rotate: () => {}, setLineDash: () => {}
  };
  const mockCanvas = {
    getContext: () => mockCtx,
    getBoundingClientRect: () => ({ width: 800, height: 450 }),
    style: {}
  };

  const vfx = new LineageVFX({ canvas: mockCanvas, ambient: false });
  vfx.running = true;

  // Spawn shockwave ring (radius 4, speed 5, max 50)
  vfx._ring(200, 200, '180,90,255', 50, 5, 2.5);
  assert.equal(vfx.rings.length, 1, 'One ring should be spawned');
  assert.equal(vfx.rings[0].radius, 4, 'Initial radius must be 4');
  assert.equal(vfx.rings[0].age, 0, 'Initial age must be 0');

  // Advance 5 frames (80ms) -> ring must expand
  for (let f = 1; f <= 5; f++) {
    vfx._frame(f * 16);
  }
  assert.equal(vfx.rings.length, 1, 'Ring must still be alive during expansion');
  assert.ok(vfx.rings[0].radius > 20, 'Ring radius must have expanded past 20px');
  assert.ok(vfx.rings[0].age >= 80, 'Ring age must have advanced');

  // Advance another 8 frames (total 13 frames / ~208ms) -> radius reaches max (50) and must be purged
  for (let f = 6; f <= 15; f++) {
    vfx._frame(f * 16);
  }
  assert.equal(vfx.rings.length, 0, 'Ring must be completely spliced out after reaching max radius');
});

test('9. LineageVFX arcane_missile and projectiles terminate on impact or maxAge timeout', async () => {
  await import('../lineage-idle/vfx-lineage-idle.js');
  const LineageVFX = globalThis.LineageVFX;

  const mockCtx = {
    save: () => {}, restore: () => {}, clearRect: () => {}, fillRect: () => {},
    beginPath: () => {}, arc: () => {}, stroke: () => {}, fill: () => {},
    setTransform: () => {}, createRadialGradient: () => ({ addColorStop: () => {} }),
    createLinearGradient: () => ({ addColorStop: () => {} }),
    translate: () => {}, rotate: () => {}, setLineDash: () => {}
  };
  const mockCanvas = {
    getContext: () => mockCtx,
    getBoundingClientRect: () => ({ width: 800, height: 450 }),
    style: {}
  };

  const vfx = new LineageVFX({ canvas: mockCanvas, ambient: false });
  vfx.running = true;

  // Case A: normal missile reaches target
  const missile = vfx.play('arcane_missile', { source: { x: 50, y: 100 }, target: { x: 250, y: 100 } });
  assert.ok(missile, 'Missile effect should be created');
  assert.equal(missile.maxAge, 900, 'Missile must have default maxAge of 900ms');
  assert.equal(vfx.effects.length, 1, 'One effect should be active');

  // Advance frames until impact
  for (let f = 1; f <= 50; f++) {
    vfx._frame(f * 16);
  }
  assert.equal(vfx.effects.length, 0, 'Missile must complete and be removed upon hitting target');

  // Case B: unreachable missile with speed 0 must terminate at maxAge timeout
  const stuckMissile = vfx.play('arcane_missile', { source: { x: 50, y: 100 }, target: { x: 99999, y: 99999 }, speed: 0 });
  assert.equal(vfx.effects.length, 1);
  for (let f = 1; f <= 70; f++) {
    vfx._frame(1000 + f * 16);
  }
  assert.equal(vfx.effects.length, 0, 'Unreachable missile must terminate when exceeding maxAge');
});

test('10. LineageVFX.prototype.clear() flushes rings, effects, particles, and flash', async () => {
  await import('../lineage-idle/vfx-lineage-idle.js');
  const LineageVFX = globalThis.LineageVFX;

  const mockCtx = {
    save: () => {}, restore: () => {}, clearRect: () => {}, fillRect: () => {},
    beginPath: () => {}, arc: () => {}, stroke: () => {}, fill: () => {},
    setTransform: () => {}, createRadialGradient: () => ({ addColorStop: () => {} }),
    createLinearGradient: () => ({ addColorStop: () => {} }),
    translate: () => {}, rotate: () => {}, setLineDash: () => {}
  };
  const mockCanvas = {
    getContext: () => mockCtx,
    getBoundingClientRect: () => ({ width: 800, height: 450 }),
    style: {}
  };

  const vfx = new LineageVFX({ canvas: mockCanvas, ambient: false });
  vfx._ring(100, 100, '255,255,255', 40, 4, 2);
  vfx.particles.push({ x: 50, y: 50, age: 0, max: 50 });
  vfx.play('power_smash', { target: { x: 100, y: 100 } });
  vfx.flash = 0.8;

  assert.ok(vfx.rings.length > 0, 'Rings should be populated');
  assert.ok(vfx.particles.length > 0, 'Particles should be populated');
  assert.ok(vfx.effects.length > 0, 'Effects should be populated');
  assert.ok(vfx.flash > 0, 'Flash should be active');

  vfx.clear();

  assert.equal(vfx.rings.length, 0, 'Rings must be 0 after clear()');
  assert.equal(vfx.particles.length, 0, 'Particles must be 0 after clear()');
  assert.equal(vfx.effects.length, 0, 'Effects must be 0 after clear()');
  assert.equal(vfx.flash, 0, 'Flash must be 0 after clear()');
});
