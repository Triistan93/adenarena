import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { renderSevenSignsTab } from '../lineage-idle/src/ui/GameUI.js';
import { SevenSignsService } from '../lineage-idle/src/services/SevenSignsService.js';
import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';
import { getStats } from '../lineage-idle/src/engine/StatsEngine.js';

function allowedState() {
  const state = DEFAULT_STATE();
  SevenSignsService.joinFaction(state, 'dawn');
  state.sevenSigns.phase = 'seal_validation';
  state.sevenSigns.winnerFaction = 'dawn';
  return state;
}

describe('Blacksmith of Mammon — ações ligadas ao serviço correto', () => {
  it('renderiza handlers distintos para troca, deselamento e infusão', () => {
    const previousWindow = globalThis.window;
    globalThis.window = { _activeSevenSignsSubTab: 'mammon' };
    const container = { innerHTML: '' };
    const state = allowedState();
    state.inventory = [
      { uid: 'view-source', itemId: 'weapon_dynasty_sword' },
      { uid: 'view-armor', itemId: 'armor_draconic_armor', isUnsealed: false }
    ];
    try {
      renderSevenSignsTab(container, state);
      const actions = [...container.innerHTML.matchAll(/onclick="window\.([A-Za-z0-9_]+)\(/g)].map(match => match[1]);
      assert.ok(actions.includes('exchangeMammonWeaponAction'));
      assert.ok(actions.includes('unsealArmorAction'));
      assert.ok(actions.includes('infuseMammonSoulCrystalAction'));
      assert.equal(actions.filter(action => action === 'unsealArmorAction').length, 1);
      assert.match(container.innerHTML, /id="mammon-unseal-armor"/);
    } finally {
      if (previousWindow === undefined) delete globalThis.window;
      else globalThis.window = previousWindow;
    }
  });

  it('troca uma arma A/S sem aprimoramentos e cobra exatamente 25.000 AA', () => {
    const state = allowedState();
    state.sevenSigns.ancientAdena = 30_000;
    const weapon = { uid: 'mammon-source', itemId: 'weapon_dynasty_sword', count: 1 };
    state.inventory = [weapon];
    const result = SevenSignsService.exchangeWeapon(state, weapon.uid, 'weapon_dynasty_twohanded_sword');
    assert.equal(result.success, true);
    assert.equal(state.inventory[0].itemId, 'weapon_dynasty_twohanded_sword');
    assert.equal(state.inventory[0].uid, weapon.uid);
    assert.equal(state.sevenSigns.ancientAdena, 5_000);
  });

  it('não cobra nem altera armas com melhorias quando a troca é recusada', () => {
    const state = allowedState();
    state.sevenSigns.ancientAdena = 100_000;
    const weapon = { uid: 'mammon-sa', itemId: 'weapon_dynasty_sword', enchant: 3, soulCrystal: { key: 'focus' } };
    state.inventory = [weapon];
    const before = structuredClone(weapon);
    const result = SevenSignsService.exchangeWeapon(state, weapon.uid, 'weapon_dynasty_twohanded_sword');
    assert.equal(result.success, false);
    assert.equal(result.reason, 'weapon_has_investments');
    assert.deepEqual(weapon, before);
    assert.equal(state.sevenSigns.ancientAdena, 100_000);
  });

  it('infunde Focus, Haste ou Acumen no nível 13 por 100.000 AA e aplica Haste como recarga', () => {
    for (const saKey of ['focus', 'haste', 'acumen']) {
      const state = allowedState();
      state.sevenSigns.ancientAdena = 100_000;
      const weapon = { uid: `mammon-${saKey}`, itemId: 'weapon_dynasty_sword' };
      state.inventory = [weapon];
      state.equipment.weapon = weapon.uid;
      const baselineCdr = getStats(state).cdr;
      const result = SevenSignsService.infuseMammonSoulCrystal(state, weapon.uid, saKey);
      assert.equal(result.success, true, saKey);
      assert.equal(weapon.soulCrystal.key, saKey);
      assert.equal(weapon.soulCrystal.level, 13);
      assert.equal(state.sevenSigns.ancientAdena, 0);
      if (saKey === 'haste') {
        assert.equal(weapon.soulCrystal.stat, 'atkSpd');
        assert.ok(getStats(state).cdr > baselineCdr, 'Haste must reduce skill cooldown through production stats');
      }
    }
  });

  it('deselamento exige uma armadura selada pertencente ao inventário e só cobra uma vez', () => {
    const state = allowedState();
    state.sevenSigns.ancientAdena = 100_000;
    const armor = { uid: 'mammon-armor', itemId: 'armor_draconic_armor', slot: 'armor', isUnsealed: false, name: 'Draconic Armor (Sealed)' };
    state.inventory = [armor];
    assert.equal(SevenSignsService.unsealArmor(state, armor).success, true);
    assert.equal(state.sevenSigns.ancientAdena, 50_000);
    assert.equal(SevenSignsService.unsealArmor(state, armor).success, false);
    assert.equal(state.sevenSigns.ancientAdena, 50_000);
  });
});

describe('Sete Selos — avanço automático dos períodos semanais', () => {
  const week = 7 * 24 * 60 * 60 * 1000;

  it('inicializa período de competição por sete dias e não avança antes do prazo', () => {
    const state = DEFAULT_STATE();
    const start = 1_800_000_000_000;
    const initialized = SevenSignsService.advanceWeeklyCycle(state, start);
    assert.equal(initialized.initialized, true);
    assert.equal(state.sevenSigns.phase, 'competition');
    assert.equal(state.sevenSigns.cycleNumber, 1);
    assert.equal(state.sevenSigns.cycleEndsAt, start + week);
    assert.equal(SevenSignsService.advanceWeeklyCycle(state, start + week - 1).transitions.length, 0);
  });

  it('fecha competição no prazo, escolhe vencedor e inicia validação por mais sete dias', () => {
    const state = DEFAULT_STATE();
    SevenSignsService.joinFaction(state, 'dusk');
    const start = 1_800_000_000_000;
    SevenSignsService.advanceWeeklyCycle(state, start);
    state.sevenSigns.dawnScore = 20;
    state.sevenSigns.duskScore = 30;
    const result = SevenSignsService.advanceWeeklyCycle(state, start + week);
    assert.equal(result.transitions.length, 1);
    assert.equal(state.sevenSigns.phase, 'seal_validation');
    assert.equal(state.sevenSigns.winnerFaction, 'dusk');
    assert.equal(state.sevenSigns.cycleEndsAt, start + 2 * week);
    assert.equal(SevenSignsService.canAccessExclusiveBlacksmith(state).allowed, true);
  });

  it('encerra validação, reseta pontuação e processa ciclos vencidos offline sem duplicar transição', () => {
    const state = DEFAULT_STATE();
    const start = 1_800_000_000_000;
    SevenSignsService.advanceWeeklyCycle(state, start);
    const result = SevenSignsService.advanceWeeklyCycle(state, start + 3 * week);
    assert.equal(result.transitions.length, 3);
    assert.equal(state.sevenSigns.phase, 'seal_validation');
    assert.equal(state.sevenSigns.cycleNumber, 2);
    assert.equal(state.sevenSigns.dawnScore, 250_000);
    assert.equal(state.sevenSigns.duskScore, 240_000);
    assert.equal(SevenSignsService.advanceWeeklyCycle(state, start + 3 * week).transitions.length, 0);
  });
});

