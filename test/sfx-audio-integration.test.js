import test from 'node:test';
import assert from 'node:assert/strict';

import { SoundFX } from '../lineage-idle/src/vfx/SoundFX.js';
import { VFXOrchestrator } from '../lineage-idle/src/vfx/VFXOrchestrator.js';

test('1. SoundFX safe execution in headless / node environment', () => {
  // Ensure no throw even without window or AudioContext
  const initialWindow = global.window;
  delete global.window;

  assert.doesNotThrow(() => {
    SoundFX.playWindup('Fire', 300);
    SoundFX.playElementalImpact('Water', false);
    SoundFX.playUltimateFanfare(true);
    SoundFX.playStaggerBreak();
    SoundFX.playHit();
    SoundFX.playCritical();
    SoundFX.playBossRoar();
  });

  if (initialWindow) global.window = initialWindow;
});

test('2. SoundFX delegates calls accurately to window.idleAudio', () => {
  const mockCalls = [];
  global.window = {
    idleAudio: {
      playWindup: (elem, dur) => mockCalls.push({ type: 'windup', elem, dur }),
      playElementalImpact: (elem, isCrit) => mockCalls.push({ type: 'impact', elem, isCrit }),
      playUltimateFanfare: (isMaster) => mockCalls.push({ type: 'ultimate', isMaster }),
      playStaggerBreak: () => mockCalls.push({ type: 'stagger_break' }),
      playHit: () => mockCalls.push({ type: 'hit' }),
      playCritical: () => mockCalls.push({ type: 'critical' }),
      playBossRoar: () => mockCalls.push({ type: 'boss_roar' })
    }
  };

  SoundFX.playWindup('Fire', 250);
  SoundFX.playElementalImpact('Wind', true);
  SoundFX.playUltimateFanfare(false);
  SoundFX.playUltimateFanfare(true);
  SoundFX.playStaggerBreak();
  SoundFX.playHit();
  SoundFX.playCritical();
  SoundFX.playBossRoar();

  assert.equal(mockCalls.length, 8);
  assert.deepEqual(mockCalls[0], { type: 'windup', elem: 'Fire', dur: 250 });
  assert.deepEqual(mockCalls[1], { type: 'impact', elem: 'Wind', isCrit: true });
  assert.deepEqual(mockCalls[2], { type: 'ultimate', isMaster: false });
  assert.deepEqual(mockCalls[3], { type: 'ultimate', isMaster: true });
  assert.deepEqual(mockCalls[4], { type: 'stagger_break' });
  assert.deepEqual(mockCalls[5], { type: 'hit' });
  assert.deepEqual(mockCalls[6], { type: 'critical' });
  assert.deepEqual(mockCalls[7], { type: 'boss_roar' });
});

test('3. Elemental sound coverage for all 7 elemental archetypes', () => {
  const elements = ['Physical', 'Fire', 'Water', 'Wind', 'Earth', 'Dark', 'Holy'];
  const recorded = [];

  global.window = {
    idleAudio: {
      playElementalImpact: (elem, isCrit) => recorded.push({ elem, isCrit })
    }
  };

  for (const elem of elements) {
    SoundFX.playElementalImpact(elem, false);
    SoundFX.playElementalImpact(elem, true);
  }

  assert.equal(recorded.length, 14);
  for (const elem of elements) {
    const normal = recorded.find(r => r.elem === elem && !r.isCrit);
    const crit = recorded.find(r => r.elem === elem && r.isCrit);
    assert.ok(normal, `Missing normal hit for ${elem}`);
    assert.ok(crit, `Missing critical hit for ${elem}`);
  }
});

test('4. VFXOrchestrator dispatches audio on skill cast, hit, crit and stagger', () => {
  const audioLog = [];
  global.window = {
    idleAudio: {
      playWindup: (elem, dur) => audioLog.push({ type: 'windup', elem, dur }),
      playElementalImpact: (elem, isCrit) => audioLog.push({ type: 'impact', elem, isCrit }),
      playUltimateFanfare: (isMaster) => audioLog.push({ type: 'ultimate', isMaster }),
      playStaggerBreak: () => audioLog.push({ type: 'stagger_break' }),
      playCritical: () => audioLog.push({ type: 'critical' })
    }
  };

  const orchestrator = new VFXOrchestrator({ enabled: true, profilerEnabled: false });

  // 1. Regular skill cast (anticipation windup)
  orchestrator.handleSkillCast({
    skillId: 'shield_bash',
    def: {
      identity: { id: 'shield_bash', element: 'Physical', tier: 'core_1' },
      gameplay: { castTime: 200 }
    }
  });
  assert.ok(audioLog.some(a => a.type === 'windup' && a.elem === 'Physical'));

  // 2. Lv80 Ultimate cast (heroic fanfare)
  orchestrator.handleSkillCast({
    skillId: 'test_ult',
    def: {
      identity: { id: 'test_ult', element: 'Fire', tier: 'ultimate' },
      gameplay: { castTime: 500 }
    }
  });
  assert.ok(audioLog.some(a => a.type === 'ultimate' && a.isMaster === false));

  // 3. Lv90 Master Ultimate cast (transcendental fanfare)
  orchestrator.handleSkillCast({
    skillId: 'test_master',
    def: {
      identity: { id: 'test_master', element: 'Dark', tier: 'master_ultimate' },
      gameplay: { castTime: 600 }
    }
  });
  assert.ok(audioLog.some(a => a.type === 'ultimate' && a.isMaster === true));

  // 4. Hit event
  orchestrator.handleSkillHit({ element: 'Water', isCrit: false });
  assert.ok(audioLog.some(a => a.type === 'impact' && a.elem === 'Water' && !a.isCrit));

  // 5. Crit event
  orchestrator.handleSkillCrit({ critTier: 'colossal' });
  assert.ok(audioLog.some(a => a.type === 'critical'));

  // 6. Stagger Break event
  orchestrator.handleSkillStagger({ isBreak: true });
  assert.ok(audioLog.some(a => a.type === 'stagger_break'));
});

test('5. Timeline action "sfx" execution in VFXOrchestrator', () => {
  const timelineAudio = [];
  global.window = {
    idleAudio: {
      playWindup: (elem, dur) => timelineAudio.push({ type: 'windup', elem, dur }),
      playElementalImpact: (elem, isCrit) => timelineAudio.push({ type: 'impact', elem, isCrit }),
      playUltimateFanfare: (isMaster) => timelineAudio.push({ type: 'ultimate', isMaster }),
      playStaggerBreak: () => timelineAudio.push({ type: 'stagger_break' }),
      playBossRoar: () => timelineAudio.push({ type: 'boss_roar' })
    }
  };

  const orchestrator = new VFXOrchestrator({ enabled: true, profilerEnabled: false });

  orchestrator._executeTimelineAction(
    { type: 'sfx', params: { type: 'windup', element: 'Holy', duration: 300 } },
    { x: 100, y: 100 },
    { x: 200, y: 200 },
    {}
  );

  orchestrator._executeTimelineAction(
    { type: 'sfx', params: { type: 'impact', element: 'Earth', isCrit: true } },
    { x: 100, y: 100 },
    { x: 200, y: 200 },
    {}
  );

  orchestrator._executeTimelineAction(
    { type: 'sfx', params: { type: 'ultimate', isMaster: true } },
    { x: 100, y: 100 },
    { x: 200, y: 200 },
    {}
  );

  orchestrator._executeTimelineAction(
    { type: 'sfx', params: { type: 'stagger_break' } },
    { x: 100, y: 100 },
    { x: 200, y: 200 },
    {}
  );

  orchestrator._executeTimelineAction(
    { type: 'sfx', params: { type: 'boss_roar' } },
    { x: 100, y: 100 },
    { x: 200, y: 200 },
    {}
  );

  assert.equal(timelineAudio.length, 5);
  assert.equal(timelineAudio[0].type, 'windup');
  assert.equal(timelineAudio[1].type, 'impact');
  assert.equal(timelineAudio[2].type, 'ultimate');
  assert.equal(timelineAudio[3].type, 'stagger_break');
  assert.equal(timelineAudio[4].type, 'boss_roar');
});
