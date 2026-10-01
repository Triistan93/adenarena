import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MentorshipReferralService } from '../lineage-idle/src/services/MentorshipReferralService.js';
import { ALL_ITEMS } from '../lineage-idle/src/data/items/index.js';

function state(overrides = {}) {
  return {
    characterId: 'apprentice-disposable', name: 'ApprenticeDisposable', level: 10,
    inventory: [], referredBy: null, referralStarterGranted: false,
    ...overrides
  };
}

function withCatalog(run) {
  const previousWindow = globalThis.window;
  globalThis.window = { GameData: { ALL_ITEMS } };
  return Promise.resolve().then(run).finally(() => {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  });
}

function bridge(overrides = {}) {
  return {
    getCurrentUserId: () => 'disposable-owner',
    getPlayerByName: async name => ({ characterId: 'mentor-disposable', name, level: 40, playerType: 'real' }),
    bindMentorship: async () => ({ mentorName: 'MentorDisposable', mentorCharId: 'mentor-disposable' }),
    recordReferral: async () => true,
    ...overrides
  };
}

describe('Mentoria — vínculo e pacote inicial transacionais', () => {
  it('só concede bônus e itens depois da verificação e das duas confirmações remotas', async () => withCatalog(async () => {
    const player = state();
    const calls = [];
    const cloud = bridge({
      async bindMentorship(...args) { calls.push(['bind', ...args]); return { mentorName: 'MentorDisposable', mentorCharId: 'mentor-disposable' }; },
      async recordReferral(...args) { calls.push(['referral', ...args]); return true; }
    });
    const result = await MentorshipReferralService.bindStarterMentorship(player, '  MentorDisposable ', cloud);
    assert.equal(result.success, true);
    assert.equal(player.referredBy, 'MentorDisposable');
    assert.equal(player.referralStarterGranted, true);
    assert.deepEqual(calls, [
      ['bind', 'apprentice-disposable', 10, 'MentorDisposable'],
      ['referral', 'MentorDisposable', 'ApprenticeDisposable', 10]
    ]);
    assert.equal(player.inventory.find(item => item.itemId === 'soulshot_ng')?.count, 1000);
    assert.equal(player.inventory.find(item => item.itemId === 'hp_potion_s')?.count, 10);
  }));

  it('falha de consulta, mentor inelegível ou falha no registro remoto não concede pacote local', async () => withCatalog(async () => {
    for (const service of [
      bridge({ async getPlayerByName() { throw new Error('offline'); } }),
      bridge({ async getPlayerByName(name) { return { characterId: 'low-mentor', name, level: 39, playerType: 'real' }; } }),
      bridge({ async recordReferral() { return false; } })
    ]) {
      const player = state();
      const result = await MentorshipReferralService.bindStarterMentorship(player, 'MentorDisposable', service);
      assert.equal(result.success, false);
      assert.equal(player.referredBy, null);
      assert.equal(player.referralStarterGranted, false);
      assert.deepEqual(player.inventory, []);
    }
  }));

  it('não inicia chamadas cloud nem concede itens quando o inventário não comporta o pacote', async () => withCatalog(async () => {
    const player = state({ inventory: Array.from({ length: 150 }, (_, index) => ({ uid: `full-${index}`, itemId: 'junk_test', count: 1 })) });
    let calls = 0;
    const service = bridge({
      async getPlayerByName(name) { calls++; return { characterId: 'mentor-disposable', name, level: 40, playerType: 'real' }; },
      async bindMentorship() { calls++; return true; },
      async recordReferral() { calls++; return true; }
    });
    const result = await MentorshipReferralService.bindStarterMentorship(player, 'MentorDisposable', service);
    assert.equal(result.reason, 'inventory_full');
    assert.equal(calls, 1, 'Only identity lookup happens before a failed inventory preflight.');
    assert.equal(player.inventory.length, 150);
    assert.equal(player.referredBy, null);
  }));
});
