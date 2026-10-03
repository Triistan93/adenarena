import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';
import { processAutoRecycleItem } from '../lineage-idle/src/services/InventoryService.js';
import { triggerQuestEvent } from '../lineage-idle/src/services/QuestService.js';

describe('Etapa 1 — progresso de missões de Forja', () => {
  it('conta auto-reciclagem bem-sucedida e não conta auto-venda como reciclagem', () => {
    const previousGameData = globalThis.GameData;
    globalThis.GameData = {
      ALL_ITEMS: {
        test_sword: { id: 'test_sword', name: 'Test Sword', slot: 'weapon', req: { level: 20 } },
        crystal_d: { id: 'crystal_d', name: 'D Crystal', slot: 'material', stack: 999 }
      },
      RARITY: { common: { mult: 1 } }
    };

    try {
      const state = DEFAULT_STATE();
      state.level = 10;
      state.autoRecycle = { mode: 'recycle' };
      const reportRecycle = (count) => triggerQuestEvent(state, 'craft', count);

      assert.equal(processAutoRecycleItem(
        { itemId: 'test_sword', rarity: 'common' },
        globalThis.GameData.ALL_ITEMS.test_sword,
        state,
        { onRecycleSuccess: reportRecycle }
      ), true);
      assert.equal(state.quests.progress.d_craft, 1);
      assert.ok(state.inventory.some(item => item.itemId === 'crystal_d'));

      state.autoRecycle = { mode: 'sell' };
      processAutoRecycleItem(
        { itemId: 'test_sword', rarity: 'common' },
        globalThis.GameData.ALL_ITEMS.test_sword,
        state,
        { onRecycleSuccess: reportRecycle }
      );
      assert.equal(state.quests.progress.d_craft, 1, 'auto-venda não conta como reciclagem');
    } finally {
      if (previousGameData === undefined) delete globalThis.GameData;
      else globalThis.GameData = previousGameData;
    }
  });
});
