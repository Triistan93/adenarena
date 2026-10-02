import { test } from 'node:test';
import assert from 'node:assert/strict';

import { RAID_BOSSES } from '../lineage-idle/src/data/raids.js';
import { stopCombat } from '../lineage-idle/src/engine/CombatEngine.js';
import { canEnterRaid, handleRaidVictory, startRaidBoss } from '../lineage-idle/src/services/RaidService.js';
import { renderRaidsTab } from '../lineage-idle/src/ui/GameUI.js';
import { ALL_ITEMS } from '../lineage-idle/src/data/items/index.js';

test('an active raid cannot be replaced by another raid or consume a second ticket', () => {
  const state = {
    level: 120,
    stats: { combatPower: 100_000_000, atk: 1000, def: 1000, maxHp: 10_000 },
    hp: 10_000,
    dailyRaidTickets: 3,
    inventory: []
  };

  try {
    assert.equal(startRaidBoss(state, 'queen_ant'), true);
    const ticketCount = state.dailyRaidTickets;
    const activeBoss = state.activeRaidId;
    assert.equal(startRaidBoss(state, 'core'), false);
    assert.equal(state.dailyRaidTickets, ticketCount);
    assert.equal(state.activeRaidId, activeBoss);
    assert.equal(state.activeMonster.id, 'queen_ant');
  } finally {
    stopCombat(state);
  }
});

test('raid victory rewards are granted once and only for the active raid encounter', () => {
  const state = {
    isRaidActive: true,
    activeRaidId: 'queen_ant',
    activeMonster: { ...RAID_BOSSES.queen_ant, id: 'queen_ant', isRaid: true },
    dailyRaidTickets: 2,
    dailyRaidClears: {},
    totalRaidKills: 0,
    inventory: [],
    gold: 0,
    xp: 0,
    sp: 0,
    adenCoins: 0
  };

  const originalRandom = Math.random;
  Math.random = () => 0;
  try {
    const firstDrops = handleRaidVictory(state, 'queen_ant');
    assert.equal(new Set(state.inventory.map(item => item.uid)).size, state.inventory.length, 'each simultaneous raid drop needs a distinct inventory UID');
    const firstSnapshot = {
      gold: state.gold,
      xp: state.xp,
      sp: state.sp,
      inventory: state.inventory.length,
      adenCoins: state.adenCoins,
      totalRaidKills: state.totalRaidKills,
      clears: state.dailyRaidClears.queen_ant
    };
    const duplicateDrops = handleRaidVictory(state, 'queen_ant');

    assert.ok(firstDrops.length > 0);
    assert.deepEqual(duplicateDrops, []);
    assert.deepEqual({
      gold: state.gold,
      xp: state.xp,
      sp: state.sp,
      inventory: state.inventory.length,
      adenCoins: state.adenCoins,
      totalRaidKills: state.totalRaidKills,
      clears: state.dailyRaidClears.queen_ant
    }, firstSnapshot);
  } finally {
    Math.random = originalRandom;
  }
});

test('raid cards disable entries blocked by an active raid or insufficient CP', () => {
  const container = { innerHTML: '' };
  renderRaidsTab(container, {
    level: 120,
    stats: { combatPower: 0 },
    dailyRaidTickets: 3,
    isRaidActive: true,
    activeRaidId: 'queen_ant'
  });

  assert.match(container.innerHTML, /Encontro em andamento/);
  assert.match(container.innerHTML, /title="Conclua .* antes de iniciar outro encontro\."/);
  assert.doesNotMatch(container.innerHTML, /onclick="window\.startRaidBossAction\('core'\)"/);

  renderRaidsTab(container, {
    level: 120,
    stats: { combatPower: 0 },
    dailyRaidTickets: 3,
    isRaidActive: false,
    activeRaidId: null
  });
  assert.match(container.innerHTML, /Poder de Combate insuficiente/);
});

test('raid renderer exposes a correctly bound entry action for every configured boss', () => {
  const container = { innerHTML: '' };
  renderRaidsTab(container, {
    level: 999,
    stats: { combatPower: Number.MAX_SAFE_INTEGER },
    dailyRaidTickets: 3,
    isRaidActive: false,
    activeRaidId: null
  });

  for (const raidId of Object.keys(RAID_BOSSES)) {
    assert.ok(container.innerHTML.includes(`window.startRaidBossAction('${raidId}')`), `${raidId} has a production entry action`);
  }
});

test('every configured raid drop is backed by a real item or the Aden Coins currency handler', () => {
  for (const [raidId, boss] of Object.entries(RAID_BOSSES)) {
    for (const drop of boss.drops || []) {
      if (drop.itemId === 'adena_coins') continue;
      assert.ok(ALL_ITEMS[drop.itemId], `${raidId} drop ${drop.itemId} must resolve to the item catalog`);
    }

    const ready = {
      level: boss.reqLvl,
      stats: { combatPower: boss.minimumCP || 0 },
      dailyRaidTickets: 3,
      lastDailyRaidResetDate: new Date().toLocaleDateString('en-CA')
    };
    assert.equal(canEnterRaid(ready, raidId).canEnter, true, `${raidId} should be enterable at its configured thresholds`);
  }
});

