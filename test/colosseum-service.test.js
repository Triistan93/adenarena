import { test } from 'node:test';
import assert from 'node:assert/strict';

import { ColosseumService } from '../lineage-idle/src/services/ColosseumService.js';
import { COLOSSEUM_SHOP_CATALOG, DUEL_BET_TIERS } from '../lineage-idle/src/data/colosseum.js';
import { SURVIVAL_WAVES } from '../lineage-idle/src/data/colosseum.js';
import { ALL_ITEMS } from '../lineage-idle/src/data/items/index.js';
import { restoreCharacterCp } from '../lineage-idle/src/services/ConsumableService.js';
import { renderColosseumTab } from '../lineage-idle/src/ui/GameUI.js';

test('Colosseum permits only one active wagered match or survival run at a time', () => {
  const state = { gold: 2_000_000, hp: 1000, stats: { atk: 1000, def: 1000, maxHp: 1000 } };
  assert.equal(ColosseumService.startDuel(state, 'bet_100k').success, true);
  const afterFirstBet = state.gold;

  const secondDuel = ColosseumService.startDuel(state, 'bet_100k');
  assert.equal(secondDuel.success, false);
  assert.equal(state.gold, afterFirstBet, 'a rejected second start must not deduct another wager');
  assert.equal(ColosseumService.startSurvival(state).success, false, 'duel and survival must not overlap');
  assert.equal(state.colosseum.activeDuel.bet, 100_000, 'the original wager must remain attached to its duel');
});

test('a duel can end in defeat, records the loss, and clears its wagered state', () => {
  const state = {
    gold: 1_000_000,
    hp: 100,
    stats: { atk: 0, def: 0, maxHp: 100 },
    colosseum: { badges: 0, duelWins: 0, duelLosses: 0, activeDuel: null, activeSurvival: null }
  };
  const started = ColosseumService.startDuel(state, 'bet_100k', {}, {
    charName: 'Disposable Rival',
    statsSnapshot: { hp: 1_000_000, pAtk: 10_000, pDef: 0 }
  });
  assert.equal(started.success, true);
  assert.equal(state.gold, 900_000);

  const result = ColosseumService.executeDuelTurn(state);
  assert.equal(result.isDefeat, true);
  assert.equal(state.hp, 0);
  assert.equal(state.colosseum.duelLosses, 1);
  assert.equal(state.colosseum.activeDuel, null);
  assert.equal(state.gold, 900_000, 'the wager stays lost on defeat');
});

test('duel wins pay back the stake plus the matching prize, and unknown bet tiers are rejected', () => {
  const state = { gold: 1_000_000, hp: 1000, stats: { atk: 1_000_000, def: 1000, maxHp: 1000 } };
  assert.equal(ColosseumService.startDuel(state, 'not-a-tier').success, false);
  assert.equal(state.gold, 1_000_000);

  assert.equal(ColosseumService.startDuel(state, 'bet_100k').success, true);
  const result = ColosseumService.executeDuelTurn(state);
  assert.equal(result.isVictory, true);
  assert.equal(state.gold, 1_100_000);
  assert.equal(state.colosseum.duelWins, 1);
  assert.equal(state.colosseum.badges, 10);
  assert.equal(state.colosseum.activeDuel, null);
});

test('survival enemies damage the player and terminate the run on defeat', () => {
  const state = {
    gold: 0,
    hp: 100,
    stats: { atk: 0, def: 0, maxHp: 100 },
    colosseum: { badges: 0, duelWins: 0, duelLosses: 0, highestWave: 0, activeDuel: null, activeSurvival: null }
  };
  assert.equal(ColosseumService.startSurvival(state).success, true);
  const result = ColosseumService.executeSurvivalTurn(state);
  assert.equal(result.isDefeat, true);
  assert.equal(state.hp, 0);
  assert.equal(state.colosseum.activeSurvival, null);
  assert.equal(state.colosseum.badges, 0, 'a failed first wave grants no badge reward');
});

test('surviving all ten waves grants each reward once and ends the run', () => {
  const state = {
    gold: 0,
    hp: 100,
    stats: { atk: 1_000_000, def: 1_000_000, maxHp: 100 },
    colosseum: { badges: 0, duelWins: 0, duelLosses: 0, highestWave: 0, activeDuel: null, activeSurvival: null }
  };
  assert.equal(ColosseumService.startSurvival(state).success, true);

  let result;
  for (let wave = 0; wave < SURVIVAL_WAVES.length; wave++) {
    result = ColosseumService.executeSurvivalTurn(state);
    assert.equal(result.success, true);
  }

  assert.equal(result.isCompleted, true);
  assert.equal(result.totalBadges, SURVIVAL_WAVES.reduce((sum, wave) => sum + wave.badges, 0));
  assert.equal(state.colosseum.highestWave, SURVIVAL_WAVES.length);
  assert.equal(state.colosseum.activeSurvival, null);
  assert.equal(state.colosseum.badges, result.totalBadges);
});

test('every Colosseum shop reward resolves to a usable catalog item', () => {
  for (const shopItem of COLOSSEUM_SHOP_CATALOG) {
    assert.ok(ALL_ITEMS[shopItem.id], `${shopItem.id} must be registered in ALL_ITEMS`);
    assert.equal(ALL_ITEMS[shopItem.id].id, shopItem.id);
  }

  const state = { gold: 0, inventory: [], colosseum: { badges: 10_000 } };
  for (const shopItem of COLOSSEUM_SHOP_CATALOG) {
    assert.equal(ColosseumService.buyShopItem(state, shopItem.id).success, true);
  }
  const heroicPotion = state.inventory.find(item => item.itemId === 'potion_heroic_cp');
  assert.equal(heroicPotion.count, 20, 'the CP potion pack must grant the 20 charges shown in the catalog');
  assert.equal(ALL_ITEMS.potion_heroic_cp.type, 'cp');
  assert.equal(ALL_ITEMS.potion_heroic_cp.amount, 2000);
});

test('a full backpack rejects Colosseum purchases without consuming badges', () => {
  const state = {
    gold: 0,
    inventory: Array.from({ length: 150 }, (_, index) => ({ uid: `filler-${index}`, itemId: `filler-${index}` })),
    colosseum: { badges: 1_000 }
  };

  const result = ColosseumService.buyShopItem(state, 'gladiator_circlet');

  assert.equal(result.success, false);
  assert.equal(state.colosseum.badges, 1_000);
  assert.equal(state.inventory.length, 150);
  assert.equal(state.inventory.some(item => item.itemId === 'gladiator_circlet'), false);
});

test('a full backpack can still claim a stackable Colosseum pack into its existing stack', () => {
  const state = {
    gold: 0,
    inventory: [
      { uid: 'potion-stack', itemId: 'potion_heroic_cp', count: 10 },
      ...Array.from({ length: 149 }, (_, index) => ({ uid: `filler-${index}`, itemId: `filler-${index}` }))
    ],
    colosseum: { badges: 100 }
  };

  const result = ColosseumService.buyShopItem(state, 'potion_heroic_cp');

  assert.equal(result.success, true);
  assert.equal(state.colosseum.badges, 50);
  assert.equal(state.inventory.length, 150);
  assert.equal(state.inventory[0].count, 30);
});

test('Heroic CP potion restores exactly 2,000 CP, respects the cap, and is inert at full CP', () => {
  const state = { cp: 900, maxCp: 2500 };
  assert.deepEqual(restoreCharacterCp(state, ALL_ITEMS.potion_heroic_cp.amount, state.maxCp), {
    success: true,
    restored: 1600,
    currentCp: 2500
  });
  assert.deepEqual(restoreCharacterCp(state, ALL_ITEMS.potion_heroic_cp.amount, state.maxCp), {
    success: false,
    restored: 0,
    currentCp: 2500
  });
});

test('Colosseum UI disables conflicting starts and escapes player-provided opponent names', () => {
  const container = { innerHTML: '' };
  const state = {
    colosseum: {
      badges: 0,
      duelWins: 0,
      duelLosses: 0,
      highestWave: 0,
      activeDuel: {
        opponentName: '<img src=x onerror=alert(1)>',
        opponentTitle: 'Ranking Rival',
        bet: 100_000,
        hp: 500,
        maxHp: 1000,
        playerHp: 250,
        playerMaxHp: 1000
      },
      activeSurvival: null
    }
  };

  renderColosseumTab(container, state);
  assert.match(container.innerHTML, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.doesNotMatch(container.innerHTML, /<img src=x onerror=alert\(1\)>/);
  assert.ok(container.innerHTML.includes('window.executeDuelTurnAction()'));
  assert.match(container.innerHTML, /disabled title="Conclua o desafio atual antes de iniciar outro\."/);
  assert.match(container.innerHTML, /Seu HP: 250 \/ 1,000/);
});

test('Colosseum renderer exposes each duel, survival, and shop action from its catalogs', () => {
  const container = { innerHTML: '' };
  renderColosseumTab(container, { colosseum: { badges: 500 } });

  for (const tier of DUEL_BET_TIERS) {
    assert.ok(container.innerHTML.includes(`window.startColosseumDuelAction('${tier.id}')`), `${tier.id} duel action is rendered`);
  }
  assert.ok(container.innerHTML.includes('window.startColosseumSurvivalAction()'));
  for (const item of COLOSSEUM_SHOP_CATALOG) {
    assert.ok(container.innerHTML.includes(`window.buyColosseumShopItemAction('${item.id}')`), `${item.id} shop action is rendered`);
  }

  renderColosseumTab(container, { colosseum: {
    badges: 500,
    activeSurvival: { waveIndex: 0, waveData: SURVIVAL_WAVES[0], currentHp: 100, maxHp: 100, playerHp: 100, playerMaxHp: 100, totalBadgesAccumulated: 0 },
    activeDuel: null
  } });
  assert.ok(container.innerHTML.includes('window.executeSurvivalTurnAction()'));
  assert.match(container.innerHTML, /disabled title="Conclua o desafio atual antes de iniciar outro\."/);
});
