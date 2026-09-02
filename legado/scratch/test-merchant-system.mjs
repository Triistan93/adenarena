import assert from 'node:assert';
import { buyItem, buyMysticItem, sellItem, sellAllJunk, buybackItem, rerollMysticStock, calculateMaxAffordableQty } from '../lineage-idle/src/services/ShopService.js';
import { ALL_ITEMS } from '../lineage-idle/src/data/items/index.js';

// Setup Mock Game Data
const mockGameData = {
  ALL_ITEMS,
  RARITY: {
    common: { mult: 1, name: 'Comum' },
    rare: { mult: 2, name: 'Raro' },
    epic: { mult: 4, name: 'Épico' },
    legendary: { mult: 8, name: 'Lendário' }
  }
};
globalThis.window = {
  GameData: mockGameData,
  EchoData: mockGameData
};
globalThis.GameData = mockGameData;

console.log('🧪 Iniciando Testes Unitários e de Integração: Sistema da Guilda dos Mercadores...');

// ─── Teste 1: Compra Regular e Cálculo de Preço ─────────────────────────────
{
  const state = {
    gold: 5000,
    level: 25,
    class: 'warrior',
    inventory: []
  };

  const itemId = 'potion_hp_lesser';
  const itemDef = { id: itemId, price: 100, name: 'Hp Potion', slot: 'potion' };
  ALL_ITEMS[itemId] = itemDef;

  const initialGold = state.gold;
  const qty = 5;
  const cost = itemDef.price * qty;

  const result = buyItem(state, itemId, qty, 'common', {});
  assert.strictEqual(result, true, 'Compra deve ser bem sucedida');
  assert.strictEqual(state.gold, initialGold - cost, 'Ouro deve ser debitado corretamente');
  assert.strictEqual(state.inventory.length, 1, 'Item deve ser inserido no inventário');
  console.log('  ✅ Teste 1: Compra regular com quantidade múltipla aprovado.');
}

// ─── Teste 2: Venda Individual e Fila de Recompra (Buyback) ────────────────
{
  const state = {
    gold: 100,
    level: 40,
    inventory: [
      { uid: 'item_test_1', itemId: 'sword_long', count: 1, rarity: 'common' },
      { uid: 'item_test_2', itemId: 'potion_hp', count: 10, rarity: 'common' }
    ],
    selectedItems: [],
    buybackQueue: []
  };

  ALL_ITEMS['sword_long'] = { price: 2000, name: 'Long Sword', slot: 'weapon' };

  const sellResult = sellItem(state, 'item_test_1', 1, {});
  assert.strictEqual(sellResult, true, 'Venda individual deve funcionar');
  assert.strictEqual(state.gold, 100 + 1000, 'Deve creditar 50% do valor base (1.000 de 2.000)');
  assert.strictEqual(state.inventory.length, 1, 'Item vendido deve ser removido do inventário');
  assert.strictEqual(state.buybackQueue.length, 1, 'Item vendido deve ir para o topo do Buyback');
  assert.strictEqual(state.buybackQueue[0].sellPrice, 1000, 'Preço de recompra deve ser idêntico ao de venda');
  console.log('  ✅ Teste 2: Venda individual e registro no Buyback aprovado.');
}

// ─── Teste 3: Venda em Massa de Lixo (Junk Sell) com Proteções ─────────────
{
  const state = {
    gold: 50,
    inventory: [
      { uid: 'junk_1', itemId: 'leather_armor', count: 1, rarity: 'common' },
      { uid: 'junk_2', itemId: 'wooden_helmet', count: 1, rarity: 'common' },
      { uid: 'protected_equipped', itemId: 'composite_armor', count: 1, rarity: 'common', equipped: true },
      { uid: 'protected_locked', itemId: 'dagger_mithril', count: 1, rarity: 'common' },
      { uid: 'protected_rare', itemId: 'sword_revolution', count: 1, rarity: 'rare' },
      { uid: 'protected_potion', itemId: 'potion_hp', count: 50, rarity: 'common' }
    ],
    selectedUids: ['protected_locked'], // Travado com 🔒
    buybackQueue: []
  };

  ALL_ITEMS['leather_armor'] = { price: 400, name: 'Leather Armor', slot: 'armor' };
  ALL_ITEMS['wooden_helmet'] = { price: 200, name: 'Wooden Helmet', slot: 'helmet' };
  ALL_ITEMS['composite_armor'] = { price: 5000, name: 'Composite Armor', slot: 'armor' };
  ALL_ITEMS['dagger_mithril'] = { price: 3000, name: 'Mithril Dagger', slot: 'weapon' };
  ALL_ITEMS['sword_revolution'] = { price: 10000, name: 'Sword of Revolution', slot: 'weapon' };
  ALL_ITEMS['potion_hp'] = { price: 100, name: 'Healing Potion', slot: 'potion' };

  const { count, goldGained } = sellAllJunk(state, {});
  assert.strictEqual(count, 2, 'Deve vender exatamente 2 itens comuns desprotegidos');
  assert.strictEqual(goldGained, 200 + 100, 'Deve creditar 300 Adena (50% de 400 + 200)');
  assert.strictEqual(state.gold, 50 + 300, 'Saldo de Adena deve ser atualizado');

  // Verificar que itens protegidos continuam na mochila
  const remainingUids = state.inventory.map(i => i.uid);
  assert(remainingUids.includes('protected_equipped'), 'Item equipado não pode ser vendido');
  assert(remainingUids.includes('protected_locked'), 'Item com lock 🔒 não pode ser vendido');
  assert(remainingUids.includes('protected_rare'), 'Item raro não pode ser vendido');
  assert(remainingUids.includes('protected_potion'), 'Consumíveis essenciais não podem ser vendidos no Junk');
  console.log('  ✅ Teste 3: Venda em massa de lixo (Junk Sell) com proteções aprovada.');
}

// ─── Teste 4: Recompra (Buyback) ───────────────────────────────────────────
{
  const state = {
    gold: 5000,
    inventory: [],
    buybackQueue: [
      {
        itemCopy: { uid: 'recup_1', itemId: 'leather_armor', count: 1, rarity: 'common' },
        sellPrice: 200,
        soldAt: Date.now()
      }
    ]
  };

  const buybackResult = buybackItem(state, 0, {});
  assert.strictEqual(buybackResult, true, 'Recompra deve funcionar com saldo suficiente');
  assert.strictEqual(state.gold, 4800, 'Deve debitar exatamente o preço vendido');
  assert.strictEqual(state.inventory.length, 1, 'Item deve retornar ao inventário');
  assert.strictEqual(state.buybackQueue.length, 0, 'Item deve ser removido da fila de buyback');
  console.log('  ✅ Teste 4: Recompra de itens (Buyback) aprovada.');
}

// ─── Teste 5: Reroll do Mercador Místico ────────────────────────────────────
{
  const state = {
    gold: 100000,
    mysticShopLastReset: 0,
    mysticShopInventory: []
  };

  const mockRoll = () => [{ itemId: 'sword_valakas', rarity: 'legendary' }];
  const rerollResult = rerollMysticStock(state, mockRoll, {});
  assert.strictEqual(rerollResult, true, 'Reroll deve ser bem sucedido');
  assert.strictEqual(state.gold, 50000, 'Deve debitar a taxa de 50.000 Adena');
  assert.strictEqual(state.mysticShopInventory[0].itemId, 'sword_valakas', 'Estoque deve ser renovado');
  console.log('  ✅ Teste 5: Reroll Místico com débito de Adena aprovado.');
}

// ─── Teste 6: Cálculo de Quantidade Máxima (Max Affordable) ────────────────
{
  const state = { gold: 1250 };
  ALL_ITEMS['soulshot_d'] = { price: 25, name: 'Soulshot: D-Grade', slot: 'consumable' };

  const maxQty = calculateMaxAffordableQty(state, 'soulshot_d');
  assert.strictEqual(maxQty, 50, 'Deve calcular 1250 / 25 = 50 unidades');
  console.log('  ✅ Teste 6: Cálculo de quantidade máxima acessível aprovado.');
}

console.log('\n🎉 TODOS OS 6 TESTES DA GUILDA DOS MERCADORES PASSARAM COM 100% DE SUCESSO!\n');
