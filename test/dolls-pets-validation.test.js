import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';
import { BOSS_DOLLS } from '../lineage-idle/src/data/codex.js';
import { PET_CATALOG } from '../lineage-idle/src/data/pets.js';
import { getDollsBonuses, getStats } from '../lineage-idle/src/engine/StatsEngine.js';
import { PetService } from '../lineage-idle/src/services/PetService.js';

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
});
