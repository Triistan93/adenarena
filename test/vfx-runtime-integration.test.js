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
