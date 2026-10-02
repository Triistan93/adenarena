import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { pickRandomMonster, selectZone, stopCombat } from '../lineage-idle/src/engine/CombatEngine.js';
import { MONSTERS } from '../lineage-idle/src/data/monsters.js';
import { ZONE_BACKGROUNDS, ZONES, SAGAS } from '../lineage-idle/src/data/zones.js';
import { ZONE_CP_REQUIREMENTS } from '../lineage-idle/src/data/balance/progressionBalance.js';
import { RAID_BOSSES } from '../lineage-idle/src/data/raids.js';
import { SOLO_INSTANCES } from '../lineage-idle/src/data/instances.js';
import { WORLD_BOSS_CATALOG } from '../lineage-idle/src/services/WorldBossService.js';

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

test('epic dragon bosses do not spawn in normal zones and have a special encounter route', () => {
  const epicDragons = ['antharas', 'valakas', 'fafurion', 'lindvior'];
  const zoneBosses = Object.values(ZONES).map(zone => zone.boss);
  const raidIds = new Set(Object.keys(RAID_BOSSES));
  const worldBossIds = new Set(Object.values(WORLD_BOSS_CATALOG).map(boss => boss.id));

  for (const raidId of raidIds) {
    assert.ok(!zoneBosses.includes(raidId), `${raidId} must not be configured as a normal hunting-zone boss`);
  }
  for (const worldBossId of worldBossIds) {
    const raidId = worldBossId.replace(/_world$/, '');
    assert.ok(!zoneBosses.includes(raidId), `${worldBossId} must not spawn as a normal hunting-zone boss`);
  }

  for (const epicId of epicDragons) {
    const hasRaidRoute = raidIds.has(epicId);
    const hasSpecialInstanceRoute = Object.values(SOLO_INSTANCES).some(instance => instance.stages?.some(stage => stage.id === epicId || stage.name.toLowerCase().startsWith(epicId)));
    assert.ok(hasRaidRoute || hasSpecialInstanceRoute, `${epicId} must remain available through a special encounter`);
    assert.ok(!zoneBosses.includes(epicId), `${epicId} must not spawn as a normal hunting-zone boss`);
  }

  for (const epicId of ['antharas', 'valakas']) {
    assert.ok(worldBossIds.has(`${epicId}_world`), `${epicId} must remain available through the world-boss event`);
  }

  assert.equal(ZONES.antharasLair.boss, 'antharasBehemoth');
  assert.equal(ZONES.forgeOfGods.boss, 'vulcanLord');
  assert.equal(ZONES.emeraldGrove.boss, 'emeraldDragon');
  assert.equal(ZONES.dragonValley.boss, 'dragonValleyOverlord');
  assert.ok(MONSTERS[ZONES.antharasLair.boss].boss, 'Antharas Lair must retain its own regional boss');
  assert.ok(MONSTERS[ZONES.forgeOfGods.boss].boss, 'Forge of the Gods must retain its own regional boss');
  assert.ok(MONSTERS[ZONES.emeraldGrove.boss].boss, 'Emerald Grove must retain its own regional boss');
  assert.ok(MONSTERS[ZONES.dragonValley.boss].boss, 'Dragon Valley must retain its own regional boss');

  assert.equal(RAID_BOSSES.fafurion, undefined, 'Fafurion must use the dedicated Nest encounter rather than generic Raid entry');
  assert.equal(RAID_BOSSES.lindvior.id, 'lindvior');
  assert.ok(SOLO_INSTANCES.fafurion_nest.stages.some(stage => stage.id === 'fafurion'), 'Fafurion must be the Nest final-stage boss');

  for (const epicId of ['lindvior']) {
    const encounter = RAID_BOSSES[epicId];
    assert.ok(encounter.fatalSkill?.name, `${epicId} must define its own fatal skill`);
    assert.ok(encounter.mechanics?.length >= 2, `${epicId} must define encounter mechanics`);
    assert.ok(encounter.drops?.length, `${epicId} must have configured raid rewards`);
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
      isCombatActive: true,
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
