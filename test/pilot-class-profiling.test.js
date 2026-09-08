/**
 * test/pilot-class-profiling.test.js — Automated Tests for Pilot Classes & Real-Time Profiling
 * 
 * Verifies:
 * 1. Pilot class skill definitions (human_fighter, human_sorcerer) adhere to particle budgets.
 * 2. Real-Time 60 FPS Profiler returns accurate telemetry via getPerformanceMetrics().
 * 3. toggleProfiler() cleanly manages DOM badge lifecycle.
 * 4. showUltimateBanner() displays Lv80 Ultimate and Lv90 Master Ultimate cinematic banners.
 * 5. SKILL_STAGGER break event applies the is-broken pulse class to the posture bar.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { VFXOrchestrator } from '../lineage-idle/src/vfx/VFXOrchestrator.js';
import { combatEvents, CombatEventType } from '../lineage-idle/src/vfx/CombatEvent.js';
import { globalCameraFX } from '../lineage-idle/src/vfx/CameraFX.js';
import { globalVFXPool } from '../lineage-idle/src/vfx/ObjectPool.js';

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
      if (sel === '.stage-stagger-bar' || sel === '#monster-stagger-bar') {
        return children.find(c => c.className?.includes('stage-stagger-bar') || c.id === 'monster-stagger-bar') || null;
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

test('1. Pilot Class Particle Budgets (human_fighter & human_sorcerer)', () => {
  const rootDir = resolve(__dirname, '..');
  const fighterPath = resolve(rootDir, 'lineage-idle/src/data/skills/human/human_fighter.json');
  const sorcererPath = resolve(rootDir, 'lineage-idle/src/data/skills/human/human_sorcerer.json');

  const fighterData = JSON.parse(readFileSync(fighterPath, 'utf8'));
  const sorcererData = JSON.parse(readFileSync(sorcererPath, 'utf8'));

  assert.equal(fighterData.skills.length, 6, 'human_fighter must have exactly 6 skills');
  assert.equal(sorcererData.skills.length, 6, 'human_sorcerer must have exactly 6 skills');

  const checkBudgets = (classData) => {
    for (const skill of classData.skills) {
      const tier = skill.identity.tier;
      const budget = skill.performance?.particleBudget;
      assert.ok(typeof budget === 'number', `Skill ${skill.identity.id} must define numeric particleBudget`);

      if (tier === 'core_1' || tier === 'core_2') {
        assert.ok(budget <= 80, `Core skill ${skill.identity.id} budget ${budget} exceeds 80`);
      } else if (tier === 'specialization_1' || tier === 'specialization_2') {
        assert.ok(budget <= 120, `Specialization skill ${skill.identity.id} budget ${budget} exceeds 120`);
      } else if (tier === 'ultimate') {
        assert.ok(budget <= 180, `Ultimate skill ${skill.identity.id} budget ${budget} exceeds 180`);
      } else if (tier === 'master_ultimate') {
        assert.ok(budget <= 250, `Master Ultimate skill ${skill.identity.id} budget ${budget} exceeds 250`);
      }
    }
  };

  checkBudgets(fighterData);
  checkBudgets(sorcererData);
});

test('2. Real-Time Profiler Telemetry & DOM toggle', () => {
  const orchestrator = new VFXOrchestrator();
  const { mockStage, children } = createMockStage();

  orchestrator.mount(mockStage);
  assert.ok(orchestrator._running, 'Orchestrator must be running');

  // Verify profiler badge was mounted
  const badge = mockStage.querySelector('.vfx-profiler-badge');
  assert.ok(badge, 'Profiler badge should be mounted in DOM');

  // Check initial performance metrics
  const metrics = orchestrator.getPerformanceMetrics();
  assert.equal(typeof metrics.fps, 'number');
  assert.equal(typeof metrics.frameTimeMs, 'number');
  assert.equal(typeof metrics.activeParticles, 'number');
  assert.equal(typeof metrics.trauma, 'number');
  assert.equal(metrics.running, true);
  assert.equal(metrics.profilerEnabled, true);

  // Toggle profiler off
  orchestrator.toggleProfiler(false);
  assert.equal(orchestrator.profilerEnabled, false);
  assert.equal(orchestrator._profilerElement, null);

  // Toggle profiler on
  orchestrator.toggleProfiler(true);
  assert.equal(orchestrator.profilerEnabled, true);
  assert.ok(orchestrator._profilerElement !== null);

  orchestrator.unmount();
});

test('3. Cinematic Ultimate Announcement Banner for Lv80 and Lv90 skills', () => {
  const orchestrator = new VFXOrchestrator();
  const { mockStage } = createMockStage();

  orchestrator.mount(mockStage);

  // Lv80 Ultimate: Titanbreaker
  const titanbreakerDef = {
    identity: {
      id: 'titanbreaker',
      name: 'Titanbreaker',
      tier: 'ultimate'
    }
  };
  orchestrator.showUltimateBanner(titanbreakerDef);

  const banner = orchestrator._bannerElement;
  assert.ok(banner, 'Ultimate banner element must exist');
  assert.ok(banner.innerHTML.includes('ULTIMATE'), 'Banner HTML must mention ULTIMATE');
  assert.ok(banner.innerHTML.includes('Titanbreaker'), 'Banner HTML must show skill name');

  // Lv90 Master Ultimate: Master Titanbreaker
  const masterTitanbreakerDef = {
    identity: {
      id: 'master_titanbreaker',
      name: 'Master Titanbreaker',
      tier: 'master_ultimate'
    }
  };
  orchestrator.showUltimateBanner(masterTitanbreakerDef);
  assert.ok(banner.innerHTML.includes('MASTER ULTIMATE'), 'Banner HTML must mention MASTER ULTIMATE');
  assert.ok(banner.innerHTML.includes('master'), 'Banner content must have master class');

  orchestrator.unmount();
});

test('4. Stagger Break HUD pulse trigger', () => {
  const orchestrator = new VFXOrchestrator();
  const { mockStage } = createMockStage();

  // Create mock stagger bar inside stage
  const staggerBar = mockStage.ownerDocument.createElement('div');
  staggerBar.className = 'stage-stagger-bar';
  mockStage.appendChild(staggerBar);

  orchestrator.mount(mockStage);

  // Trigger SKILL_STAGGER event with isBreak: true
  combatEvents.emit(CombatEventType.SKILL_STAGGER, {
    targetPos: { x: 380, y: 300 },
    isBreak: true
  });

  assert.ok(staggerBar.classList.contains('is-broken'), 'Stagger bar must receive is-broken class on break');

  orchestrator.unmount();
});
