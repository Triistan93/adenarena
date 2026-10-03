import { test } from 'node:test';
import assert from 'node:assert/strict';

import { resolveWorldBossScene } from '../lineage-idle/src/ui/WorldBossScene.js';
import { WorldBossService, WORLD_BOSS_CATALOG } from '../lineage-idle/src/services/WorldBossService.js';
import { ZONE_BACKGROUNDS } from '../lineage-idle/src/data/zones.js';

test('active Baium event resolves its own tower scene and encounter label', () => {
  const state = {
    zone: 'talkingIsland',
    activeMonster: { ...WORLD_BOSS_CATALOG.baium_world, isWorldBoss: true }
  };

  assert.deepEqual(resolveWorldBossScene(state, ZONE_BACKGROUNDS), {
    id: 'baium_world',
    background: '/img/Maps/baium.jpg',
    label: 'O Tirano Aprisionado de Insolence'
  });
});

test('joining the scheduled Baium event selects the scene through the production service flow', () => {
  const cycleMs = 3 * 60 * 60 * 1000;
  const realNow = Date.now;
  Date.now = () => (2 * cycleMs) + 1_000;
  const state = { level: 120, zone: 'talkingIsland' };
  let saved = false;

  try {
    const result = WorldBossService.joinWorldBoss(state, {
      log() {}, floatText() {}, renderStageMonster() {}, attackMonster() {}, save() { saved = true; }
    });

    assert.equal(result.success, true);
    assert.equal(saved, true);
    assert.equal(resolveWorldBossScene(state, ZONE_BACKGROUNDS).background, '/img/Maps/baium.jpg');
  } finally {
    Date.now = realNow;
  }
});

test('world-boss presentation clears when combat returns to ordinary hunting', () => {
  assert.equal(resolveWorldBossScene({ zone: 'talkingIsland', activeMonster: null }, ZONE_BACKGROUNDS), null);
});

test('each scheduled world boss points to a registered encounter scene', () => {
  for (const boss of Object.values(WORLD_BOSS_CATALOG)) {
    const scene = resolveWorldBossScene({ activeMonster: { ...boss, isWorldBoss: true } }, ZONE_BACKGROUNDS);
    assert.ok(scene?.background?.startsWith('/img/Maps/'), `${boss.id} has a registered map scene`);
  }
});
