import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { VFXOrchestrator } from '../lineage-idle/src/vfx/VFXOrchestrator.js';
import { SoundFX } from '../lineage-idle/src/vfx/SoundFX.js';
import { processRaidBossMechanics, handleRaidVictory, startRaidBoss } from '../lineage-idle/src/services/RaidService.js';
import { StaggerEngine } from '../lineage-idle/src/engine/StaggerEngine.js';
import { RAID_BOSSES } from '../lineage-idle/src/data/raids.js';

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

test('every configured raid applies its HP-threshold mechanics and one-time enrage in the production service', () => {
  const previousWindow = globalThis.window;
  globalThis.window = {
    globalVFXOrchestrator: {
      spawnTelegraphCircle() {},
      triggerBossEnrage() {}
    }
  };

  try {
    for (const [raidId, boss] of Object.entries(RAID_BOSSES)) {
      const maxHp = Number(boss.hp) || 100_000;
      const state = {
        maxHp: 10_000,
        hp: 10_000,
        activeMonster: {
          ...boss,
          id: raidId,
          isRaid: true,
          _maxHp: maxHp,
          hp: Math.floor(maxHp * 0.20),
          _triggeredMechanics: {},
          _fatalTriggered: {}
        }
      };
      const initialPlayerHp = state.hp;
      const initialBossHp = state.activeMonster.hp;

      processRaidBossMechanics(state);

      assert.equal(state.activeMonster._isEnraged, true, `${raidId} enrages below 30% HP`);
      assert.equal(state.activeMonster.isChannelingFatal, true, `${raidId} begins its fatal channel at 50% or lower`);
      for (let index = 0; index < (boss.mechanics || []).length; index++) {
        assert.equal(state.activeMonster._triggeredMechanics[index], true, `${raidId} mechanic ${index} activates below its HP threshold`);
      }
      assert.ok(state.hp < initialPlayerHp, `${raidId} applies configured player damage`);
      if (boss.mechanics.some(mechanic => mechanic.healPercent)) {
        assert.ok(state.activeMonster.hp > initialBossHp, `${raidId} applies configured boss healing`);
      }

      const afterFirst = { playerHp: state.hp, bossHp: state.activeMonster.hp, atk: state.activeMonster.atk, attackInterval: state.activeMonster.attackInterval };
      processRaidBossMechanics(state);
      assert.deepEqual({ playerHp: state.hp, bossHp: state.activeMonster.hp, atk: state.activeMonster.atk, attackInterval: state.activeMonster.attackInterval }, afterFirst,
        `${raidId} must not repeat one-time mechanics on the next combat tick`);
    }
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});

test('fatal channels from every configured raid apply their cataloged damage once when the timer expires', () => {
  const previousWindow = globalThis.window;
  const previousNow = Date.now;
  let now = 2_000_000;
  Date.now = () => now;
  globalThis.window = { globalVFXOrchestrator: { spawnTelegraphCircle() {}, triggerBossEnrage() {} } };

  try {
    for (const [raidId, boss] of Object.entries(RAID_BOSSES)) {
      const maxHp = Number(boss.hp) || 100_000;
      const state = {
        maxHp: 10_000,
        hp: 10_000,
        activeMonster: {
          ...boss,
          id: raidId,
          isRaid: true,
          _maxHp: maxHp,
          hp: Math.floor(maxHp * 0.40),
          _triggeredMechanics: {},
          _fatalTriggered: {}
        }
      };
      const impacts = [];
      processRaidBossMechanics(state);
      assert.equal(state.activeMonster.isChannelingFatal, true, `${raidId} starts the 50% fatal channel`);
      const playerHpBeforeImpact = state.hp;

      now += Number(boss.fatalSkill.duration) || 5_000;
      processRaidBossMechanics(state, { onFatalImpact: damage => impacts.push(damage) });

      const expectedDamage = Math.floor(state.maxHp * boss.fatalSkill.damageHeroPercent);
      assert.deepEqual(impacts, [expectedDamage], `${raidId} applies its cataloged fatal damage once`);
      assert.equal(state.hp, Math.max(0, playerHpBeforeImpact - expectedDamage), `${raidId} subtracts fatal damage from player HP`);
      processRaidBossMechanics(state, { onFatalImpact: damage => impacts.push(damage) });
      assert.equal(impacts.length, 1, `${raidId} must not repeat the expired fatal impact`);
    }
  } finally {
    Date.now = previousNow;
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});

test('the production monster attack handler resolves an expired raid fatal and performs its death check', () => {
  const source = readFileSync(new URL('../lineage-idle/main.js', import.meta.url), 'utf8');
  const handlerStart = source.indexOf('export function monsterAttack(');
  const handlerEnd = source.indexOf('// --------------------------- GM ADMIN', handlerStart);
  assert.ok(handlerStart >= 0 && handlerEnd > handlerStart, 'production monsterAttack handler must exist');
  const handlerSource = source.slice(handlerStart, handlerEnd).replace(/^export /, '');
  const now = 9_000_000;
  const originalNow = Date.now;
  Date.now = () => now;

  try {
    for (const [raidId, boss] of Object.entries(RAID_BOSSES)) {
      const state = {
        isCombatActive: true,
        target: raidId,
        hp: 10_000,
        maxHp: 10_000,
        activeMonster: {
          ...boss,
          id: raidId,
          isRaid: true,
          _maxHp: boss.hp,
          hp: Math.floor(boss.hp * 0.40),
          isChannelingFatal: true,
          fatalCastUntil: now - 1,
          _triggeredMechanics: Object.fromEntries((boss.mechanics || []).map((_, index) => [index, true])),
          _fatalTriggered: { 0.5: true }
        }
      };
      const calls = { hurt: [], death: 0, update: 0 };
      const runProductionHandler = new Function(
        'state', 'combatTick', 'isMonsterActionDisabled', 'serviceProcessRaidBossMechanics',
        'log', 'floatText', 'stageHeroHurt', 'playerDeath', 'updateStatsUI',
        `${handlerSource}; return monsterAttack;`
      );

      runProductionHandler(
        state,
        0,
        () => false,
        processRaidBossMechanics,
        () => {},
        () => {},
        (damage, fatal) => calls.hurt.push({ damage, fatal }),
        () => { calls.death += 1; },
        () => { calls.update += 1; }
      )(state.activeMonster);

      const expectedDamage = Math.floor(state.maxHp * boss.fatalSkill.damageHeroPercent);
      assert.equal(state.hp, state.maxHp - expectedDamage, `${raidId} applies fatal damage through production handler`);
      assert.deepEqual(calls.hurt, [{ damage: expectedDamage, fatal: true }], `${raidId} plays fatal impact feedback once`);
      assert.equal(calls.death, 0, `${raidId} does not kill a surviving disposable player`);
      assert.equal(calls.update, 1, `${raidId} refreshes player stats after impact`);

      const lethalState = {
        ...state,
        hp: expectedDamage,
        activeMonster: {
          ...state.activeMonster,
          isChannelingFatal: true,
          fatalCastUntil: now - 1,
          _fatalTriggered: { 0.5: true }
        }
      };
      runProductionHandler(
        lethalState,
        0,
        () => false,
        processRaidBossMechanics,
        () => {},
        () => {},
        () => {},
        () => { calls.death += 1; },
        () => {}
      )(lethalState.activeMonster);
      assert.equal(lethalState.hp, 0, `${raidId} clamps lethal fatal damage to zero`);
      assert.equal(calls.death, 1, `${raidId} dispatches the production player-death handler`);

    }
  } finally {
    Date.now = originalNow;
  }
});

test('5. handleRaidVictory resets active telegraphs and enrage class', () => {
  let cleared = false;
  global.window = {
    globalVFXOrchestrator: {
      clearTelegraphs: () => { cleared = true; }
    }
  };

  const state = {
    isRaidActive: true,
    activeRaidId: 'queen_ant',
    gold: 0,
    xp: 0,
    sp: 0,
    dailyRaidClears: {},
    activeMonster: {
      id: 'queen_ant',
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
