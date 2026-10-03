import test from 'node:test';
import assert from 'node:assert/strict';

function makeStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); }
  };
}

test('legacy local save migrates aliases and preserves hero, items, and progress across reload', async () => {
  const legacySave = {
    level: 35,
    xp: 8123,
    sp: 420,
    gold: 987654,
    charName: 'Legacy Hero',
    ac: 640,
    raidTickets: 2,
    fishing: { skillLevel: 4, skillXp: 220 },
    inventory: [{ uid: 'legacy-sword', itemId: 'knight_sword', quantity: 1 }],
    alchemy: { essence_astral: 5, essence_water: 2 },
    equipment: { weapon: 'legacy-sword', armor: 'legacy-armor' }
  };
  globalThis.localStorage = makeStorage({ lineageIdleSave_v2: JSON.stringify(legacySave) });
  globalThis.window = {
    GameData: { ALL_ITEMS: { knight_sword: { id: 'knight_sword' } } },
    saveCloudNow: () => false
  };

  const firstModule = `../lineage-idle/src/core/StateManager.js?legacy-roundtrip-${Date.now()}`;
  const first = await import(firstModule);
  assert.equal(first.loadState(), true);
  const migrated = first.getState();
  assert.equal(migrated.charName, 'Legacy Hero');
  assert.equal(migrated.gold, 987654);
  assert.equal(migrated.adenCoins, 640);
  assert.equal(migrated.dailyRaidTickets, 2);
  assert.equal(migrated.lifeActivities.fishing.level, 4);
  assert.equal(migrated.inventory.length, 1, JSON.stringify(migrated.inventory));
  assert.equal(migrated.inventory[0].uid, 'legacy-sword');
  assert.equal(migrated.inventory[0].itemId, 'knight_sword');
  assert.equal(migrated.inventory[0].count, 1);
  assert.equal(migrated.alchemy.essence_water, 7);
  assert.equal(migrated.equipment.weapon, 'legacy-sword');
  assert.equal(migrated.equipment.chest, 'legacy-armor');

  assert.equal(first.saveState(true, true), true);
  const second = await import(`../lineage-idle/src/core/StateManager.js?legacy-reload-${Date.now()}`);
  assert.equal(second.loadState(), true);
  const resumed = second.getState();
  assert.equal(resumed.charName, 'Legacy Hero');
  assert.equal(resumed.gold, 987654);
  assert.equal(resumed.inventory[0].uid, 'legacy-sword');
  assert.equal(resumed.equipment.weapon, 'legacy-sword');
  assert.equal(resumed.level, 35);
});
