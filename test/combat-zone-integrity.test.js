import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { pickRandomMonster, selectZone, stopCombat } from '../lineage-idle/src/engine/CombatEngine.js';
import { MONSTERS } from '../lineage-idle/src/data/monsters.js';
import { ZONE_BACKGROUNDS, ZONES, SAGAS } from '../lineage-idle/src/data/zones.js';
import { ZONE_CP_REQUIREMENTS } from '../lineage-idle/src/data/balance/progressionBalance.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('every hunting zone has valid monsters, boss, saga, progression gate, and map asset', () => {
  const sagaMembership = new Set(SAGAS.flatMap(saga => saga.zones));

  for (const [zoneId, zone] of Object.entries(ZONES)) {
    assert.ok(zone.monsters.length > 0, `${zoneId} must list hunting monsters`);
    for (const monsterId of zone.monsters) {
      assert.ok(MONSTERS[monsterId], `${zoneId} references missing monster ${monsterId}`);
    }
    assert.ok(MONSTERS[zone.boss], `${zoneId} references missing boss ${zone.boss}`);
    assert.ok(sagaMembership.has(zoneId), `${zoneId} must appear in a saga group`);
    assert.ok(ZONE_CP_REQUIREMENTS[zoneId], `${zoneId} must define level and CP requirements`);

    const mapPath = ZONE_BACKGROUNDS[zoneId];
    assert.ok(mapPath, `${zoneId} must have a map background`);
    assert.ok(fs.existsSync(path.join(repoRoot, 'public', mapPath.replace(/^\//, ''))), `${zoneId} map asset ${mapPath} must exist`);
  }
});

test('every zone can be entered at its exact production level and minimum CP', () => {
  for (const [zoneId, zone] of Object.entries(ZONES)) {
    const required = ZONE_CP_REQUIREMENTS[zoneId];
    const state = {
      level: Math.max(zone.level, required.level),
      class: 'duelist',
      race: 'human',
      zone: 'talkingIsland',
      currentZone: 'talkingIsland',
      combatPower: required.minCp,
      stats: { combatPower: required.minCp },
      isCombatActive: false,
      inventory: [],
      zoneKills: {}
    };

    try {
      assert.equal(selectZone(state, zoneId, { attackMonster() {} }), true, `${zoneId} should accept an eligible character`);
      assert.equal(state.zone, zoneId);
      assert.ok(zone.monsters.includes(state.target), `${zoneId} should select one of its configured regular monsters`);

      state.isCombatActive = true;
      state.zoneKills[zoneId] = 50;
      state.activeMonster = null;
      pickRandomMonster(state);
      assert.equal(state.target, zone.boss, `${zoneId} should spawn its boss at the 50-kill threshold`);
      assert.equal(state.activeMonster?.boss, true, `${zoneId} boss encounter should be marked as a boss`);
    } finally {
      stopCombat(state);
    }
  }
});
