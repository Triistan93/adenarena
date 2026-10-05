import test from "node:test";
import assert from "node:assert/strict";
import {
  awardPrototypeXp,
  createActionPrototypeConfig,
  createInitialPrototypeProgression,
  shouldBridgeIdleProgression,
} from "../src/game/actionPrototype.js";

test("standalone action prototype has its own progression boundary", () => {
  const config = createActionPrototypeConfig({ id: "human" }, { id: "warrior" });

  assert.equal(config.idleState, null);
  assert.equal(config.bridgeIdleProgression, false);
  assert.equal(config.zoneName, "Ruínas de Aden");
  assert.equal(config.campaignWaveLimit, 5);
  assert.equal(shouldBridgeIdleProgression(config), false);
  assert.equal(shouldBridgeIdleProgression({}), true, "legacy arena keeps its prior bridge by default");
});

test("prototype XP can cross several local levels without an idle save", () => {
  const initial = createInitialPrototypeProgression();
  const next = awardPrototypeXp(initial, 260);

  assert.deepEqual(next, {
    level: 3,
    xp: 10,
    xpToNext: 200,
    totalXp: 260,
  });
  assert.deepEqual(initial, {
    level: 1,
    xp: 0,
    xpToNext: 100,
    totalXp: 0,
  });
});

test("invalid or negative prototype XP does not reduce progress", () => {
  const initial = createInitialPrototypeProgression();

  assert.deepEqual(awardPrototypeXp(initial, -40), initial);
  assert.deepEqual(awardPrototypeXp(initial, Number.NaN), initial);
});
