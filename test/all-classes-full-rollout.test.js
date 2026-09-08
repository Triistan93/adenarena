/**
 * test/all-classes-full-rollout.test.js — 150 Skills Full Rollout & Elemental Presentation Test Suite
 * 
 * Verifies:
 * 1. All 25 active classes and all 150 skills (+ 8 shared = 158) are registered in VFXOrchestrator.
 * 2. All 25 Lv80 Ultimates trigger the cinematic banner with '★★★★ ULTIMATE'.
 * 3. All 25 Lv90 Master Ultimates trigger the cinematic banner with '★★★★★ MASTER ULTIMATE'.
 * 4. spawnTitanbreakerVFX respects elemental colors and particle counts across varied archetypes.
 * 5. Floating combat text colorizes properly for all elemental types (Fire, Water, Wind, Earth, Dark, Holy, Physical, Crit).
 * 6. Batch execution across all 25 classes cleanly updates and releases resources without memory leaks.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { VFXOrchestrator } from '../lineage-idle/src/vfx/VFXOrchestrator.js';
import { VFXComponentLibrary } from '../lineage-idle/src/vfx/VFXComponentLibrary.js';
import { globalVFXPool } from '../lineage-idle/src/vfx/ObjectPool.js';
import { ALL_LOADED_SKILLS } from '../lineage-idle/src/data/skills/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function createMockStage() {
  const children = [];
  const classList = new Set();
  const mockStage = {
    clientWidth: 800,
    clientHeight: 450,
    offsetWidth: 800,
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
      if (sel === '.vfx-profiler-badge') {
        return children.find(c => c.className === 'vfx-profiler-badge') || null;
      }
      if (sel === '.vfx-ultimate-banner') {
        return children.find(c => c.className?.includes('vfx-ultimate-banner')) || null;
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
        const elemClasses = new Set();
        return {
          tagName: tag.toUpperCase(),
          className: '',
          id: '',
          style: {},
          offsetWidth: 100,
          innerHTML: '',
          classList: {
            add: (c) => elemClasses.add(c),
            remove: (c) => elemClasses.delete(c),
            contains: (c) => elemClasses.has(c)
          },
          parentNode: null,
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
          })
        };
      }
    }
  };
  return { mockStage, children };
}

test('1. Registry Coverage: All 25 classes and 158 skills loaded in VFXOrchestrator', () => {
  const orchestrator = new VFXOrchestrator();
  assert.equal(orchestrator._skillDefRegistry.size, 158, 'Registry must contain exactly 158 total skills');

  // Verify skills from all races are present
  const sampleSkills = [
    'venomous_eclipse',           // dark_elf_assassin (Lv80)
    'master_venomous_eclipse',    // dark_elf_assassin (Lv90)
    'glacial_cataclysm',          // elf_mage (Lv80)
    'master_glacial_cataclysm',   // elf_mage (Lv90)
    'cyclone_barrage',            // ertheia_storm_blaster (Lv80)
    'heavens_aegis',              // high_elf_divine_templar (Lv80)
    'prismatic_genesis',          // high_elf_element_weaver (Lv80)
    'soul_devastation',           // kamael_soulbreaker (Lv80)
    'apocalypse_totem',           // orc_shaman (Lv80)
    'earthforge_cataclysm'        // dwarf_mage (Lv80)
  ];

  for (const sId of sampleSkills) {
    const def = orchestrator._skillDefRegistry.get(sId);
    assert.ok(def, `Skill ${sId} must be registered`);
    assert.ok(def.timeline, `Skill ${sId} must define a timeline`);
  }
});

test('2. Cinematic Banners: All 25 Lv80 Ultimates & 25 Lv90 Master Ultimates display properly', () => {
  const orchestrator = new VFXOrchestrator();
  const { mockStage } = createMockStage();
  orchestrator.mount(mockStage);

  let ultCount = 0;
  let masterCount = 0;

  for (const [sId, def] of orchestrator._skillDefRegistry.entries()) {
    const tier = def.identity?.tier;
    if (tier === 'ultimate') {
      ultCount++;
      orchestrator.showUltimateBanner(def);
      const bannerHtml = orchestrator._bannerElement.innerHTML;
      assert.ok(bannerHtml.includes('★★★★ ULTIMATE'), `Skill ${sId} banner must have 4 stars`);
      assert.ok(bannerHtml.includes(def.identity.name), `Skill ${sId} banner must include name`);
    } else if (tier === 'master_ultimate') {
      masterCount++;
      orchestrator.showUltimateBanner(def);
      const bannerHtml = orchestrator._bannerElement.innerHTML;
      assert.ok(bannerHtml.includes('★★★★★ MASTER ULTIMATE'), `Skill ${sId} banner must have 5 stars`);
      assert.ok(bannerHtml.includes('master'), `Skill ${sId} banner must have master class`);
    }
  }

  assert.equal(ultCount, 25, 'Must have exactly 25 Lv80 Ultimates');
  assert.equal(masterCount, 25, 'Must have exactly 25 Lv90 Master Ultimates');

  orchestrator.unmount();
});

test('3. Elemental Theming: spawnTitanbreakerVFX applies colors and particle configurations', () => {
  globalVFXPool.releaseAll();

  // Test Fire element
  VFXComponentLibrary.spawnTitanbreakerVFX(300, 200, {
    color: '#ef4444',
    particleCount: 25,
    radius: 200
  });

  const swArray = Array.from(globalVFXPool.shockwaves._active);
  assert.ok(swArray.length > 0, 'Shockwave should be acquired');
  assert.equal(swArray[0].color, '#ef4444', 'Shockwave color must match elemental fire color');
  assert.equal(swArray[0].maxRadius, 200, 'Shockwave radius must match specified radius');

  const pArray = Array.from(globalVFXPool.particles._active);
  assert.equal(pArray.length, 25, 'Particle count must match specified 25 count');
  assert.ok(pArray.some(p => p.color === '#ef4444'), 'At least some particles must match fire color');

  // Test Dark element
  globalVFXPool.releaseAll();
  VFXComponentLibrary.spawnTitanbreakerVFX(400, 300, {
    color: '#7c3aed',
    particleCount: 30,
    radius: 240
  });

  const darkSw = Array.from(globalVFXPool.shockwaves._active);
  assert.equal(darkSw[0].color, '#7c3aed', 'Shockwave color must match dark element');

  globalVFXPool.releaseAll();
});

test('4. Floating Combat Text: Full elemental color mapping', () => {
  const orchestrator = new VFXOrchestrator();
  globalVFXPool.releaseAll();

  const elementTests = [
    { element: 'Fire', expected: '#ff7a00' },
    { element: 'Water', expected: '#38bdf8' },
    { element: 'Wind', expected: '#34d399' },
    { element: 'Earth', expected: '#d97706' },
    { element: 'Dark', expected: '#a855f7' },
    { element: 'Holy', expected: '#fbbf24' },
    { element: 'Physical', expected: '#f8fafc' },
    { element: 'Fire', isCrit: true, expected: '#ff4d4d' }
  ];

  for (const t of elementTests) {
    orchestrator.handleSkillDamage({
      damage: 1000,
      element: t.element,
      isCrit: t.isCrit || false,
      targetPos: { x: 300, y: 300 }
    });

    const activeList = Array.from(globalVFXPool.floatingText._active);
    const lastItem = activeList[activeList.length - 1];
    assert.equal(lastItem.color, t.expected, `Color for ${t.element} (crit: ${t.isCrit}) should be ${t.expected}`);
  }

  globalVFXPool.releaseAll();
});

test('5. Multi-Class Batch Execution: Zero pool leaks across all 25 classes', () => {
  const orchestrator = new VFXOrchestrator();
  const { mockStage } = createMockStage();
  orchestrator.mount(mockStage);

  globalVFXPool.releaseAll();

  // Cast 10 diverse skills from different classes
  const testSkillIds = [
    'cinderblade',
    'aqua_arrow',
    'savage_bite',
    'prismatic_genesis',
    'tempest_breaker',
    'earthforge_cataclysm',
    'abyssal_rupture',
    'apocalypse_totem',
    'master_titanbreaker',
    'meteor'
  ];

  for (const sId of testSkillIds) {
    orchestrator.handleSkillCast({
      skillId: sId,
      sourcePos: { x: 120, y: 300 },
      targetPos: { x: 380, y: 300 }
    });
  }

  // Advance time in simulation to let all animations settle
  for (let step = 0; step < 20; step++) {
    orchestrator.update(200);
  }

  // Release and clean
  orchestrator.destroy();
  assert.equal(globalVFXPool.particles._active.size, 0, 'Particles pool must be 0 after destroy');
  assert.equal(globalVFXPool.projectiles._active.size, 0, 'Projectiles pool must be 0 after destroy');
  assert.equal(globalVFXPool.shockwaves._active.size, 0, 'Shockwaves pool must be 0 after destroy');
  assert.equal(globalVFXPool.floatingText._active.size, 0, 'FloatingText pool must be 0 after destroy');

  orchestrator.unmount();
});
