import test from 'node:test';
import assert from 'node:assert/strict';

import { SOLO_INSTANCES } from '../lineage-idle/src/data/instances.js';
import { ALL_ITEMS } from '../lineage-idle/src/data/items/index.js';
import { InstanceService } from '../lineage-idle/src/services/InstanceService.js';

test('special-zone rewards all resolve to catalog items', () => {
  for (const instance of Object.values(SOLO_INSTANCES).filter((entry) => entry.type === 'special_zone')) {
    for (const itemId of instance.rewards.items) assert.ok(ALL_ITEMS[itemId], `${instance.id} reward ${itemId} exists`);
  }
});

test('Frost Lord Castle enforces access and advances its three-stage encounter exactly once', () => {
  const state = { level: 80, stats: { combatPower: 70_000 }, hp: 6000, maxHp: 10_000, inventory: [] };
  assert.equal(InstanceService.canEnterInstance(state, 'frost_lords_castle').ok, true);

  state.stats.combatPower = 69_999;
  assert.equal(InstanceService.canEnterInstance(state, 'frost_lords_castle').reason.startsWith('Poder de Combate'), true);
  state.stats.combatPower = 70_000;
  assert.equal(InstanceService.challengeInstance(state, 'frost_lords_castle').success, true);
  assert.equal(state.activeMonster.name, 'Reggiesys, Sentinela Congelada');
  assert.equal(state.activeMonster.skill.name, 'Lança de Geada Perfurante');

  state.activeMonster.hp = 0;
  assert.equal(InstanceService.onInstanceBossVictory(state, 'frost_lords_castle').advanced, true);
  assert.equal(state.activeMonster.name, 'Tiron, Conselheiro Real');

  state.activeMonster.hp = 0;
  assert.equal(InstanceService.onInstanceBossVictory(state, 'frost_lords_castle').advanced, true);
  assert.equal(state.activeMonster.name, 'Glakias, Senhor do Gelo Aterrador', 'strong performance against Tiron unlocks the dreadful final form');

  state.activeMonster.hp = 0;
  const result = InstanceService.onInstanceBossVictory(state, 'frost_lords_castle');
  assert.equal(result.completed, true);
  assert.equal(state.instanceEntries.completed.frost_lords_castle, true);
  assert.equal(state.activeInstanceId, null);
  assert.deepEqual(state.inventory.map((item) => item.itemId), SOLO_INSTANCES.frost_lords_castle.rewards.items);
  assert.equal(InstanceService.canEnterInstance(state, 'frost_lords_castle').ok, false);
  assert.deepEqual(InstanceService.onInstanceBossVictory(state, 'frost_lords_castle'), { completed: false, duplicate: true }, 'repeat victory callback cannot award a second clear');
});

test('Steel Citadel and Celestial Tower special zones expose complete, gated encounter chains', () => {
  const state = { level: 99, stats: { combatPower: 200_000 }, hp: 10_000, maxHp: 10_000 };
  const citadel = SOLO_INSTANCES.steel_citadel;
  assert.equal(citadel.stages.length, 5);
  assert.equal(citadel.stages.at(-1).name, 'Beleth, Senhor da Steel Citadel');
  assert.ok(citadel.stages.every((stage) => stage.skill?.name && stage.skill.mult > 1));
  assert.equal(InstanceService.canEnterInstance(state, 'steel_citadel').ok, true);
  assert.equal(InstanceService.challengeInstance(state, 'steel_citadel').success, true);
  for (let stage = 0; stage < citadel.stages.length - 1; stage++) {
    state.activeMonster.hp = 0;
    assert.equal(InstanceService.onInstanceBossVictory(state, 'steel_citadel').advanced, true);
  }
  assert.equal(state.activeMonster.name, 'Beleth, Senhor da Steel Citadel');
  state.activeMonster.hp = 0;
  assert.equal(InstanceService.onInstanceBossVictory(state, 'steel_citadel').completed, true);

  const tower = SOLO_INSTANCES.celestial_tower_event;
  assert.equal(tower.stages.at(-1).name, 'Ferion, Imperador Celestial');
  const friday = Date.UTC(2026, 9, 2, 22);
  assert.equal(InstanceService.canEnterInstance(state, 'celestial_tower_event', Date.UTC(2026, 9, 1, 22)).ok, false);
  assert.equal(InstanceService.canEnterInstance(state, 'celestial_tower_event', friday).ok, true);
  assert.equal(InstanceService.canEnterInstance(state, 'celestial_tower_event', Date.UTC(2026, 9, 2, 23)).ok, false);
  assert.equal(InstanceService.challengeInstance(state, 'celestial_tower_event', { now: friday }).success, true);
  state.activeMonster.hp = 0;
  assert.equal(InstanceService.onInstanceBossVictory(state, 'celestial_tower_event', { now: friday }).advanced, true);
  state.activeMonster.hp = 0;
  assert.equal(InstanceService.onInstanceBossVictory(state, 'celestial_tower_event', { now: friday }).completed, true);
  assert.equal(InstanceService.canEnterInstance(state, 'celestial_tower_event', friday).ok, false, 'weekly clear locks another attempt in the same week');
  assert.equal(InstanceService.canEnterInstance(state, 'celestial_tower_event', Date.UTC(2026, 9, 9, 22)).ok, true, 'weekly access resets on the next Monday to Friday event cycle');
});

test('Fafurion Nest is a weekly special instance with three live phases and unique status damage', () => {
  const state = { level: 88, stats: { combatPower: 125_000 }, hp: 10_000, maxHp: 10_000 };
  assert.equal(InstanceService.canEnterInstance(state, 'fafurion_nest').ok, true);
  assert.equal(InstanceService.challengeInstance(state, 'fafurion_nest').success, true);
  state.activeMonster.hp = 0;
  assert.equal(InstanceService.onInstanceBossVictory(state, 'fafurion_nest').advanced, true);
  assert.equal(state.activeMonster.name, 'Fafurion, Dragão das Águas');

  const boss = state.activeMonster;
  const baseAttack = boss.atk;
  boss.hp = Math.floor(boss._maxHp * 0.66);
  InstanceService.processInstanceBossMechanics(state, { now: 10_000 });
  assert.equal(state.activeInstancePhase, 2);
  assert.equal(boss.atk, Math.floor(baseAttack * 1.12));
  assert.equal(state.activeInstanceStatus.name, 'Pressão Abissal');

  const hpBeforeTick = state.hp;
  InstanceService.processInstanceBossMechanics(state, { now: 11_000 });
  assert.equal(state.hp, hpBeforeTick - 200);

  boss.hp = Math.floor(boss._maxHp * 0.32);
  InstanceService.processInstanceBossMechanics(state, { now: 12_000 });
  assert.equal(state.activeInstancePhase, 3);
  assert.equal(boss.atk, Math.floor(Math.floor(baseAttack * 1.12) * 1.20));
  assert.equal(state.activeInstanceStatus.name, 'Sufocamento das Profundezas');
});
