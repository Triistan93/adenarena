import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hasCraftableRecipe } from '../lineage-idle/src/services/CraftService.js';

test('Etapa 1 — badge da Forja só aparece quando uma receita pode ser criada agora', () => {
  const previousWindow = globalThis.window;
  globalThis.window = {
    GameData: {
      ALL_ITEMS: { future_sword: { id: 'future_sword', name: 'Future Sword', slot: 'weapon' } },
      CRAFTING_RECIPES: {
        future_sword: {
          id: 'future_sword', itemId: 'future_sword', minPlayerLevel: 20,
          craftLevel: 2, gold: 250, materials: { iron_ore: 2 }
        }
      }
    }
  };
  try {
    const state = {
      level: 1,
      craftLevel: 1,
      gold: 1000,
      inventory: [{ uid: 'iron', itemId: 'iron_ore', count: 2 }]
    };

    assert.equal(hasCraftableRecipe(state), false,
      'materiais suficientes não devem anunciar receita bloqueada por nível e maestria');

    state.level = 20;
    state.craftLevel = 2;
    assert.equal(hasCraftableRecipe(state), true,
      'o badge deve aparecer quando todos os requisitos reais forem atendidos');
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});
