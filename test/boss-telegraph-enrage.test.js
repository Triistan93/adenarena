import test from 'node:test';
import assert from 'node:assert/strict';

import { VFXOrchestrator } from '../lineage-idle/src/vfx/VFXOrchestrator.js';
import { SoundFX } from '../lineage-idle/src/vfx/SoundFX.js';
import { processRaidBossMechanics, handleRaidVictory, startRaidBoss } from '../lineage-idle/src/services/RaidService.js';
import { StaggerEngine } from '../lineage-idle/src/engine/StaggerEngine.js';

test('1. VFXOrchestrator Telegraph Lifecycle (Circle & Cone)', () => {
  const orchestrator = new VFXOrchestrator({ enabled: true, profilerEnabled: false });

  assert.equal(orchestrator._activeTelegraphs.length, 0);

  let completed = false;
  const circle = orchestrator.spawnTelegraphCircle({
    x: 350,
    y: 300,
    radius: 100,
    duration: 1000,
    label: 'METEORO DEVASTADOR',
    onComplete: () => { completed = true; }
  });

  assert.equal(orchestrator._activeTelegraphs.length, 1);
  assert.equal(circle.type, 'circle');
  assert.equal(circle.label, 'METEORO DEVASTADOR');

  const cone = orchestrator.spawnTelegraphCone({
    sourceX: 380,
    sourceY: 300,
    targetX: 120,
    targetY: 300,
    range: 200,
    duration: 2000,
    label: 'SOPRO DRACÔNICO'
  });

  assert.equal(orchestrator._activeTelegraphs.length, 2);
  assert.equal(cone.type, 'cone');

  // Advance by 500ms -> both still active
  orchestrator.update(500);
  assert.equal(orchestrator._activeTelegraphs.length, 2);
  assert.equal(completed, false);

  // Advance by another 600ms -> circle expires and calls onComplete
  orchestrator.update(600);
  assert.equal(orchestrator._activeTelegraphs.length, 1);
  assert.equal(completed, true);
  assert.equal(orchestrator._activeTelegraphs[0].type, 'cone');

  // Clear telegraphs
  orchestrator.clearTelegraphs();
  assert.equal(orchestrator._activeTelegraphs.length, 0);
});

test('2. World Boss Cinematic Intro & Enrage Phase in VFXOrchestrator', () => {
  const prevSoundEnabled = SoundFX.enabled;
  SoundFX.enabled = true;
  const audioCalls = [];
  global.window = {
    idleAudio: {
      playBossRoar: () => audioCalls.push('boss_roar')
    }
  };

  const orchestrator = new VFXOrchestrator({ enabled: true, profilerEnabled: false });

  // 1. Boss Intro
  orchestrator.triggerBossIntro({
    name: 'Antharas',
    title: 'Dragão Terrestre Lendário'
  });

  assert.ok(orchestrator.camera.zoom > 1.0, 'Camera should punch zoom');
  assert.ok(orchestrator.camera.trauma > 0.4, 'Camera should have trauma');
  assert.ok(audioCalls.includes('boss_roar'), 'Boss roar should play on intro');

  // 2. Boss Enrage
  orchestrator.triggerBossEnrage({ x: 380, y: 300 });
  assert.ok(orchestrator.camera.flashAlpha > 0, 'Camera should flash on enrage');
  assert.equal(audioCalls.filter(c => c === 'boss_roar').length, 2);

  SoundFX.enabled = prevSoundEnabled;
});

test('3. RaidService Enrage activation at <= 30% HP', () => {
  let enrageTriggered = false;
  let roared = false;

  const mockOrchestrator = {
    triggerBossEnrage: () => { enrageTriggered = true; },
    spawnTelegraphCircle: () => {},
    clearTelegraphs: () => {}
  };
  global.window = {
    globalVFXOrchestrator: mockOrchestrator,
    idleAudio: {
      playBossRoar: () => { roared = true; }
    }
  };

  const state = {
    maxHp: 2000,
    hp: 2000,
    activeMonster: {
      name: 'Valakas',
      isRaid: true,
      _maxHp: 100000,
      hp: 100000,
      atk: 1000,
      attackInterval: 2000
    }
  };

  const logs = [];
  const callbacks = {
    log: (msg) => logs.push(msg),
    floatText: () => {}
  };

  // Above 30% HP -> No enrage
  state.activeMonster.hp = 35000;
  processRaidBossMechanics(state, callbacks);
  assert.equal(state.activeMonster._isEnraged, undefined);
  assert.equal(enrageTriggered, false);

  // At 29% HP -> Enrage activates
  state.activeMonster.hp = 29000;
  processRaidBossMechanics(state, callbacks);
  assert.equal(state.activeMonster._isEnraged, true);
  assert.equal(state.activeMonster.atk, 1300, 'ATK should increase by 30%');
  assert.equal(state.activeMonster.attackInterval, 1500, 'Attack interval should decrease (faster)');
  assert.equal(enrageTriggered, true);
  assert.ok(logs.some(l => l.includes('ENRAGE')));
});

test('4. Fatal Channeling triggers Telegraph and Stagger Break interrupts it', () => {
  let spawnedTelegraph = null;
  let clearedTelegraphs = false;

  const mockOrchestrator = {
    spawnTelegraphCircle: (opts) => { spawnedTelegraph = opts; return opts; },
    clearTelegraphs: () => { clearedTelegraphs = true; },
    triggerBossEnrage: () => {}
  };
  global.window = {
    globalVFXOrchestrator: mockOrchestrator
  };

  const state = {
    maxHp: 2000,
    hp: 2000,
    activeMonster: {
      name: 'Baium',
      isRaid: true,
      _maxHp: 100000,
      hp: 100000,
      fatalSkill: {
        name: 'Julgamento dos Céus',
        duration: 4000,
        triggerHps: [0.50]
      }
    }
  };

  StaggerEngine.initMonsterStagger(state.activeMonster);

  // Drop to 50% HP -> triggers fatal channeling & telegraph circle
  state.activeMonster.hp = 50000;
  processRaidBossMechanics(state, { log: () => {}, floatText: () => {} });

  assert.equal(state.activeMonster.isChannelingFatal, true);
  assert.ok(spawnedTelegraph, 'Telegraph should be spawned');
  assert.equal(spawnedTelegraph.label, 'Julgamento dos Céus');
  assert.equal(spawnedTelegraph.duration, 4000);

  // Stagger break interrupts fatal channeling!
  // Force posture to collapse
  state.activeMonster.staggerCurrent = 1;
  const result = StaggerEngine.applyStaggerDamage(
    state.activeMonster,
    5000,
    'twohand',
    true,
    true,
    { log: () => {}, floatText: () => {} }
  );

  assert.equal(result.didBreak, true);
  assert.equal(result.interruptedFatal, true);
  assert.equal(state.activeMonster.isChannelingFatal, false);
  assert.equal(clearedTelegraphs, true, 'Telegraphs should be cleared on stagger break');
});

test('5. handleRaidVictory resets active telegraphs and enrage class', () => {
  let cleared = false;
  global.window = {
    globalVFXOrchestrator: {
      clearTelegraphs: () => { cleared = true; }
    }
  };

  const state = {
    gold: 0,
    xp: 0,
    sp: 0,
    dailyRaidClears: {},
    activeMonster: {
      name: 'Queen Ant',
      isRaid: true,
      gold: [10000, 20000],
      xp: 5000,
      sp: 500,
      drops: []
    }
  };

  handleRaidVictory(state, 'queen_ant', { log: () => {} });
  assert.equal(cleared, true);
  assert.equal(state.isRaidActive, false);
});
