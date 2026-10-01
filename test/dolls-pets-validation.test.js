import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';
import { BOSS_DOLLS } from '../lineage-idle/src/data/codex.js';
import { PET_CATALOG } from '../lineage-idle/src/data/pets.js';
import { getDollsBonuses, getStats } from '../lineage-idle/src/engine/StatsEngine.js';
import { PetService } from '../lineage-idle/src/services/PetService.js';

const mainSource = readFileSync(new URL('../lineage-idle/main.js', import.meta.url), 'utf8');
function getProductionDollSynthesisHandler(state, random = () => 0, callbacks = {}) {
  const start = mainSource.indexOf('function synthesizeDolls() {');
  const end = mainSource.indexOf('// --------------------------- MAGIC LAMP', start);
  assert.ok(start >= 0 && end > start, 'production Doll synthesis handler is present');
  const handlerSource = mainSource.slice(start, end);
  return new Function('state', 'BOSS_DOLLS', 'log', 'floatText', 'updateAllUI', 'save', 'Math', `${handlerSource}; return synthesizeDolls;`)(
    state, BOSS_DOLLS, callbacks.log || (() => {}), callbacks.floatText || (() => {}),
    callbacks.updateAllUI || (() => {}), callbacks.save || (() => {}), { random }
  );
}

describe('Hero Pillar — Subtab 5: Dolls & Pets (Dolls e Mascotes)', () => {

  it('1. Boss Dolls Catalog & Bonuses: Correctly accumulates stats from owned dolls across levels 1 to 5', () => {
    assert.ok(BOSS_DOLLS.doll_antharas, 'Antharas doll must exist');
    assert.ok(BOSS_DOLLS.doll_valakas, 'Valakas doll must exist');
    assert.ok(BOSS_DOLLS.doll_queen_ant, 'Queen Ant doll must exist');

    const state = DEFAULT_STATE();
    state.dolls = [
      { dollId: 'doll_valakas', level: 3 }, // Lv3 Valakas: +320 atk, +320 matk, +18 crit
      { dollId: 'doll_antharas', level: 2 }  // Lv2 Antharas: +450 hp, +80 def
    ];

    const dollBonuses = getDollsBonuses(state);
    assert.strictEqual(dollBonuses.atk, 320);
    assert.strictEqual(dollBonuses.matk, 320);
    assert.strictEqual(dollBonuses.crit, 18);
    assert.strictEqual(dollBonuses.hp, 450);
    assert.strictEqual(dollBonuses.def, 80);
  });

  it('2. Pet Adoption: Rejects when insufficient level or gold, succeeds and deducts gold when valid', () => {
    const state = DEFAULT_STATE();
    state.level = 10;
    state.gold = 100000;

    // Wolf requires Lv 15
    const failLevel = PetService.adoptPet(state, 'pet_wolf');
    assert.strictEqual(failLevel.success, false);
    assert.strictEqual(failLevel.reason, 'level_locked');

    // Reach level 15 but lack gold
    state.level = 15;
    state.gold = 1000;
    const failGold = PetService.adoptPet(state, 'pet_wolf');
    assert.strictEqual(failGold.success, false);
    assert.strictEqual(failGold.reason, 'insufficient_gold');

    // Valid adoption
    state.gold = 100000;
    const successAdopt = PetService.adoptPet(state, 'pet_wolf');
    assert.strictEqual(successAdopt.success, true);
    assert.strictEqual(state.gold, 50000); // 100k - 50k cost
    assert.ok(state.petData.pets.pet_wolf, 'Pet must be added to petData.pets');
    assert.strictEqual(state.petData.activePetId, 'pet_wolf');

    // Duplicate adoption rejection
    const duplicateAdopt = PetService.adoptPet(state, 'pet_wolf');
    assert.strictEqual(duplicateAdopt.success, false);
    assert.strictEqual(duplicateAdopt.reason, 'already_owned');
  });

  it('3. Pet Summoning & Active Buffs: Active pet is toggled and provides combat bonuses', () => {
    const state = DEFAULT_STATE();
    state.level = 30;
    state.gold = 500000;
    PetService.adoptPet(state, 'pet_wolf');
    PetService.adoptPet(state, 'pet_kookaburra');

    assert.strictEqual(state.petData.activePetId, 'pet_wolf');
    PetService.summonPet(state, 'pet_kookaburra');
    assert.strictEqual(state.petData.activePetId, 'pet_kookaburra');

    const activeBonus = PetService.getActivePetBonus(state);
    assert.ok(activeBonus, 'Active pet bonus must be computed');
  });

  it('4. Pet & Doll State Persistence: Serializes and reloads without loss of levels or inventory', () => {
    const state = DEFAULT_STATE();
    state.dolls = [{ dollId: 'doll_zaken', level: 4 }];
    state.petData = {
      activePetId: 'pet_wolf',
      pets: {
        pet_wolf: { id: 'pet_wolf', level: 12, xp: 450, hunger: 90 }
      },
      lastFeedTime: 123456789
    };

    const saved = JSON.stringify(state);
    const loaded = JSON.parse(saved);

    assert.strictEqual(loaded.dolls[0].dollId, 'doll_zaken');
    assert.strictEqual(loaded.dolls[0].level, 4);
    assert.strictEqual(loaded.petData.activePetId, 'pet_wolf');
    assert.strictEqual(loaded.petData.pets.pet_wolf.level, 12);
    assert.strictEqual(loaded.petData.pets.pet_wolf.hunger, 90);
  });

  it('5. Pet XP: carries large battle rewards across every earned level', () => {
    const state = DEFAULT_STATE();
    state.petData = {
      activePetId: 'pet_wolf',
      pets: { pet_wolf: { id: 'pet_wolf', name: 'Wolf', level: 1, xp: 0, hunger: 100 } },
      lastFeedTime: 123456789
    };

    PetService.addPetXp(state, 16_000); // 4,000 pet XP after the 25% share.

    assert.strictEqual(state.petData.pets.pet_wolf.level, 3);
    assert.strictEqual(state.petData.pets.pet_wolf.xp, 2_000);
  });

  it('6. Pet feeding: rejects a full pet without charging and feeds a hungry pet once', () => {
    const state = DEFAULT_STATE();
    state.gold = 10_000;
    state.petData = {
      activePetId: 'pet_wolf',
      pets: { pet_wolf: { id: 'pet_wolf', name: 'Wolf', level: 1, xp: 0, hunger: 100 } },
      lastFeedTime: 123456789
    };

    assert.deepStrictEqual(PetService.feedPet(state), { success: false, reason: 'already_fed' });
    assert.strictEqual(state.gold, 10_000);

    state.petData.pets.pet_wolf.hunger = 75;
    assert.strictEqual(PetService.feedPet(state).success, true);
    assert.strictEqual(state.gold, 5_000);
    assert.strictEqual(state.petData.pets.pet_wolf.hunger, 100);
  });

  it('7. Pet hunger: drains only while summoned and scales its combat bonus with satiety', () => {
    const state = DEFAULT_STATE();
    state.petData = {
      activePetId: null,
      pets: { pet_wolf: { id: 'pet_wolf', name: 'Wolf', level: 1, xp: 0, hunger: 100 } },
      lastFeedTime: 123456789
    };

    PetService.tickPetHunger(state, 60 * 60 * 1000);
    assert.equal(state.petData.pets.pet_wolf.hunger, 100, 'resting pets must not consume food');

    state.petData.activePetId = 'pet_wolf';
    PetService.tickPetHunger(state, 30 * 60 * 1000);
    assert.equal(state.petData.pets.pet_wolf.hunger, 97);
    const fullBonus = PET_CATALOG.pet_wolf.buff.baseVal + PET_CATALOG.pet_wolf.buff.valPerLvl;
    assert.equal(PetService.getActivePetBonus(state).val, fullBonus * 0.97);

    PetService.tickPetHunger(state, 97 * 10 * 60 * 1000);
    assert.equal(state.petData.pets.pet_wolf.hunger, 0);
    assert.equal(PetService.getActivePetBonus(state), null, 'starving pets must stop buffing and attacking');
  });

  it('8. Pet hunger: carries partial intervals and ignores invalid elapsed time', () => {
    const state = DEFAULT_STATE();
    state.petData = {
      activePetId: 'pet_wolf',
      pets: { pet_wolf: { id: 'pet_wolf', name: 'Wolf', level: 1, xp: 0, hunger: 2 } },
      lastFeedTime: 123456789
    };

    PetService.tickPetHunger(state, 5 * 60 * 1000);
    PetService.tickPetHunger(state, -1000);
    assert.equal(state.petData.pets.pet_wolf.hunger, 2);
    PetService.tickPetHunger(state, 5 * 60 * 1000);
    assert.equal(state.petData.pets.pet_wolf.hunger, 1);
    PetService.tickPetHunger(state, 60 * 60 * 1000);
    assert.equal(state.petData.pets.pet_wolf.hunger, 0);
  });

  it('9. Pet hunger: treats legacy saves without hunger as full instead of removing their bonuses', () => {
    const state = DEFAULT_STATE();
    state.petData = {
      activePetId: 'pet_wolf',
      pets: { pet_wolf: { id: 'pet_wolf', name: 'Wolf', level: 1, xp: 0 } }
    };
    state.gold = 10_000;
    const expectedFullBuff = PET_CATALOG.pet_wolf.buff.baseVal + PET_CATALOG.pet_wolf.buff.valPerLvl;

    assert.equal(PetService.getActivePetBonus(state).val, expectedFullBuff);
    assert.deepStrictEqual(PetService.feedPet(state), { success: false, reason: 'already_fed' });
    assert.equal(state.gold, 10_000);
    PetService.tickPetHunger(state, 10 * 60 * 1000);
    assert.equal(state.petData.pets.pet_wolf.hunger, 99);
  });

  it('10. Pet hunger: does not add empty pet data to characters who own no pets', () => {
    const state = DEFAULT_STATE();
    delete state.petData;

    PetService.tickPetHunger(state, 60 * 60 * 1000);

    assert.equal(state.petData, undefined);
  });

  it('11. Adoption and feeding reject corrupted currency without granting free pets or food', () => {
    const state = DEFAULT_STATE();
    state.level = 60;
    state.gold = Number.NaN;
    state.petData = { activePetId: null, pets: {}, lastFeedTime: 1 };
    const beforePets = structuredClone(state.petData);

    assert.deepStrictEqual(PetService.adoptPet(state, 'pet_wolf'), { success: false, reason: 'insufficient_gold' });
    assert.ok(Number.isNaN(state.gold));
    assert.deepEqual(state.petData, beforePets);

    state.gold = 100_000;
    PetService.adoptPet(state, 'pet_wolf');
    state.petData.pets.pet_wolf.hunger = 50;
    state.gold = Number.NaN;
    const beforeHunger = state.petData.pets.pet_wolf.hunger;
    assert.deepStrictEqual(PetService.feedPet(state), { success: false, reason: 'insufficient_gold' });
    assert.ok(Number.isNaN(state.gold));
    assert.equal(state.petData.pets.pet_wolf.hunger, beforeHunger);
  });

  it('12. Production Doll synthesis rejects unknown save entries without consuming either record', () => {
    const state = {
      dolls: [
        { uid: 'unknown-a', dollId: 'doll_missing', level: 1 },
        { uid: 'unknown-b', dollId: 'doll_missing', level: 1 }
      ],
      synthSelected: ['unknown-a', 'unknown-b']
    };
    const before = structuredClone(state);
    getProductionDollSynthesisHandler(state)();
    assert.deepEqual(state, before);
  });

  it('13. Production Doll synthesis applies the roll once and saves both success and failure outcomes', () => {
    for (const [roll, expectedLevel] of [[0, 2], [0.99, 1]]) {
      const state = {
        dolls: [
          { uid: 'doll-base', dollId: 'doll_queen_ant', level: 1 },
          { uid: 'doll-sacrifice', dollId: 'doll_queen_ant', level: 1 }
        ],
        synthSelected: ['doll-base', 'doll-sacrifice']
      };
      let saves = 0;
      let updates = 0;
      getProductionDollSynthesisHandler(state, () => roll, {
        save: () => saves++,
        updateAllUI: () => updates++
      })();
      assert.equal(state.dolls.length, 1);
      assert.equal(state.dolls[0].level, expectedLevel);
      assert.deepEqual(state.synthSelected, [null, null]);
      assert.equal(saves, 1);
      assert.equal(updates, 1);
    }
  });
});
