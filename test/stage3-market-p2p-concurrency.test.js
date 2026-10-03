import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { MarketService, MARKET_CATEGORIES } from '../lineage-idle/src/services/MarketService.js';
import { setActiveMarketTab, renderMarketTab } from '../lineage-idle/src/ui/MarketUI.js';

// Setup minimal mock environment if window/localStorage/BroadcastChannel are not present
function setupMockBrowser() {
  const store = new Map();
  const mockLocalStorage = {
    getItem: (key) => store.get(String(key)) ?? null,
    setItem: (key, val) => store.set(String(key), String(val)),
    removeItem: (key) => store.delete(String(key)),
    clear: () => store.clear()
  };

  const channelMessages = [];
  class MockBroadcastChannel {
    constructor(name) {
      this.name = name;
      this.onmessage = null;
    }
    postMessage(data) {
      channelMessages.push({ channel: this.name, data });
    }
    close() {}
  }

  const prevLocalStorage = globalThis.localStorage;
  const prevWindow = globalThis.window;
  const prevBroadcastChannel = globalThis.BroadcastChannel;

  globalThis.localStorage = mockLocalStorage;
  globalThis.BroadcastChannel = MockBroadcastChannel;
  globalThis.window = {
    localStorage: mockLocalStorage,
    BroadcastChannel: MockBroadcastChannel,
    FirebaseBridge: null,
    GameData: {
      ALL_ITEMS: {
        short_sword: { id: 'short_sword', name: 'Short Sword', slot: 'weapon', type: 'weapon', tier: 1, rarity: 'common' },
        iron_ore: { id: 'iron_ore', name: 'Iron Ore', slot: 'material', type: 'material', tier: 1, rarity: 'common' },
        adena_coin: { id: 'adena_coin', name: 'Aden Coin', slot: 'consumable', type: 'consumable', tier: 1, rarity: 'rare' },
        sealed_draconic_bow: { id: 'sealed_draconic_bow', name: 'Sealed Draconic Bow', slot: 'weapon', type: 'weapon', tier: 6, rarity: 'epic' }
      }
    }
  };

  return {
    cleanup() {
      globalThis.localStorage = prevLocalStorage;
      globalThis.window = prevWindow;
      globalThis.BroadcastChannel = prevBroadcastChannel;
      MarketService.stopPolling();
    },
    store,
    channelMessages
  };
}

describe('Etapa 3 — Mercado Central de Giran (P2P): Ciclo Completo, Concorrência e Regras', () => {
  let env;

  beforeEach(() => {
    env = setupMockBrowser();
    // Reset market cache
    MarketService.saveListings([], false);
  });

  afterEach(() => {
    if (env) env.cleanup();
  });

  // ── 1. Criação de Anúncio e Dedução Atômica ──────────────────────────────
  describe('1. Criação de Anúncio (createListing)', () => {
    it('rejeita criação se o item estiver equipado', async () => {
      const state = {
        name: 'SirGalahad',
        gold: 10000,
        equipment: { weapon: 'item_sword_123' },
        inventory: [
          { uid: 'item_sword_123', itemId: 'short_sword', name: 'Short Sword', count: 1, slot: 'weapon' }
        ]
      };

      const res = await MarketService.createListing(state, {
        itemUid: 'item_sword_123',
        quantity: 1,
        pricePerUnit: 5000,
        currency: 'adena'
      });

      assert.equal(res.ok, false);
      assert.match(res.msg, /Desequipe o item antes de anunciar/i);
      assert.equal(state.gold, 10000, 'Saldo de Adena não deve ser debitado');
      assert.equal(state.inventory.length, 1, 'Item deve permanecer na mochila');
    });

    it('rejeita criação se o jogador não tiver saldo para a taxa imperial de 5%', async () => {
      const state = {
        name: 'PoorKnight',
        gold: 50, // Menos que a taxa mínima de 100a
        equipment: {},
        inventory: [
          { uid: 'item_ore_1', itemId: 'iron_ore', name: 'Iron Ore', count: 10, slot: 'material' }
        ]
      };

      const res = await MarketService.createListing(state, {
        itemUid: 'item_ore_1',
        quantity: 5,
        pricePerUnit: 1000, // Total: 5000 -> 5% taxa = 250a
        currency: 'adena'
      });

      assert.equal(res.ok, false);
      assert.match(res.msg, /Adena insuficiente para a taxa imperial de listagem/i);
      assert.equal(state.gold, 50, 'Saldo não deve ser alterado');
      assert.equal(state.inventory[0].count, 10, 'Quantidade do item deve permanecer inalterada');
    });

    it('cria anúncio com sucesso, debitando taxa e removendo item único do inventário', async () => {
      const state = {
        name: 'MerchantHero',
        gold: 50000,
        equipment: {},
        inventory: [
          { uid: 'item_sword_unique', itemId: 'short_sword', name: 'Short Sword', count: 1, slot: 'weapon', enchant: 3 }
        ]
      };

      const res = await MarketService.createListing(state, {
        itemUid: 'item_sword_unique',
        quantity: 1,
        pricePerUnit: 20000,
        currency: 'adena'
      });

      assert.equal(res.ok, true);
      assert.equal(state.inventory.length, 0, 'Item único vendido deve sair da mochila');
      // Taxa: 5% de 20.000 = 1.000a
      assert.equal(state.gold, 49000, 'Taxa de 1.000a debitada');

      const listings = MarketService.getListings(state);
      assert.equal(listings.length, 1);
      assert.equal(listings[0].sellerName, 'MerchantHero');
      assert.equal(listings[0].totalPrice, 20000);
      assert.equal(listings[0].item.itemId, 'short_sword');
      assert.equal(listings[0].item.enchant, 3);
    });

    it('cria anúncio de pilha de materiais, reduzindo count na mochila', async () => {
      const state = {
        name: 'MinerDwarf',
        gold: 10000,
        equipment: {},
        inventory: [
          { uid: 'item_stack_ore', itemId: 'iron_ore', name: 'Iron Ore', count: 50, slot: 'material' }
        ]
      };

      const res = await MarketService.createListing(state, {
        itemUid: 'item_stack_ore',
        quantity: 20,
        pricePerUnit: 100, // 20 * 100 = 2000 -> 5% = 100a
        currency: 'adena'
      });

      assert.equal(res.ok, true);
      assert.equal(state.inventory[0].count, 30, 'Sobram 30 na mochila');
      assert.equal(state.gold, 9900, 'Taxa mínima de 100a debitada');
    });
  });

  // ── 2. Cancelamento e Devolução Atômica ──────────────────────────────────
  describe('2. Cancelamento de Anúncio (cancelListing)', () => {
    it('impede outro jogador de cancelar anúncio que não é seu', async () => {
      const sellerState = { name: 'SellerAlpha', gold: 10000, inventory: [{ uid: 'u1', itemId: 'short_sword', count: 1 }] };
      const { listing } = await MarketService.createListing(sellerState, { itemUid: 'u1', quantity: 1, pricePerUnit: 1000 });

      const intruderState = { name: 'IntruderBravo', gold: 5000, inventory: [] };
      const res = await MarketService.cancelListing(intruderState, listing.id);

      assert.equal(res.ok, false);
      assert.match(res.msg, /Você só pode cancelar seus próprios anúncios/i);
    });

    it('cancela anúncio e devolve o item de forma íntegra para a mochila do vendedor', async () => {
      const sellerState = { name: 'SellerAlpha', gold: 10000, inventory: [{ uid: 'u1', itemId: 'short_sword', count: 1, slot: 'weapon', enchant: 4 }] };
      const { listing } = await MarketService.createListing(sellerState, { itemUid: 'u1', quantity: 1, pricePerUnit: 1000 });
      assert.equal(sellerState.inventory.length, 0);

      const res = await MarketService.cancelListing(sellerState, listing.id);
      assert.equal(res.ok, true);
      assert.equal(sellerState.inventory.length, 1);
      assert.equal(sellerState.inventory[0].itemId, 'short_sword');
      assert.equal(sellerState.inventory[0].enchant, 4);
      assert.equal(sellerState.inventory[0].equipped, false);

      const listings = MarketService.getListings(sellerState);
      assert.equal(listings.length, 0, 'Anúncio deve ser removido do mercado');
    });
  });

  // ── 3. Compra e Entrega de Itens (buyListing) ────────────────────────────
  describe('3. Compra e Transação (buyListing)', () => {
    it('impede o vendedor de comprar o seu próprio anúncio', async () => {
      const state = { name: 'SoloMerchant', gold: 50000, inventory: [{ uid: 's1', itemId: 'short_sword', count: 1 }] };
      const { listing } = await MarketService.createListing(state, { itemUid: 's1', quantity: 1, pricePerUnit: 5000 });

      const buyRes = await MarketService.buyListing(state, listing.id);
      assert.equal(buyRes.ok, false);
      assert.match(buyRes.msg, /Você não pode comprar seu próprio anúncio/i);
    });

    it('impede compra se o comprador não tiver saldo de Adena suficiente', async () => {
      const seller = { name: 'Seller', gold: 10000, inventory: [{ uid: 's1', itemId: 'short_sword', count: 1 }] };
      const { listing } = await MarketService.createListing(seller, { itemUid: 's1', quantity: 1, pricePerUnit: 15000 });

      const buyer = { name: 'BrokeBuyer', gold: 5000, inventory: [] };
      const buyRes = await MarketService.buyListing(buyer, listing.id);

      assert.equal(buyRes.ok, false);
      assert.match(buyRes.msg, /Adena insuficiente/i);
      assert.equal(buyer.gold, 5000, 'Saldo não deve ser debitado');
      assert.equal(buyer.inventory.length, 0, 'Nenhum item recebido');
    });

    it('impede compra se a mochila do comprador estiver no limite máximo de slots', async () => {
      const seller = { name: 'Seller', gold: 10000, inventory: [{ uid: 's1', itemId: 'short_sword', count: 1, slot: 'weapon' }] };
      const { listing } = await MarketService.createListing(seller, { itemUid: 's1', quantity: 1, pricePerUnit: 1000 });

      // Mochila cheia (150 itens)
      const fullInventory = Array.from({ length: 150 }, (_, i) => ({ uid: `slot_${i}`, itemId: `item_${i}`, slot: 'weapon' }));
      const buyer = { name: 'PackLeader', race: 'human', gold: 50000, inventory: fullInventory };

      const buyRes = await MarketService.buyListing(buyer, listing.id);
      assert.equal(buyRes.ok, false);
      assert.match(buyRes.msg, /mochila está cheia/i);
      assert.equal(buyer.gold, 50000, 'Saldo preservado');
    });

    it('realiza a compra com sucesso: entrega item, deduz saldo e credita lucro com 3% de taxa retida', async () => {
      const seller = { name: 'MasterSmith', gold: 10000, inventory: [{ uid: 's1', itemId: 'short_sword', count: 1, slot: 'weapon' }] };
      const { listing } = await MarketService.createListing(seller, { itemUid: 's1', quantity: 1, pricePerUnit: 10000 });

      const buyer = { name: 'RichKnight', gold: 50000, inventory: [] };
      const buyRes = await MarketService.buyListing(buyer, listing.id);

      assert.equal(buyRes.ok, true);
      assert.equal(buyer.gold, 40000, '10.000a debitadas do comprador');
      assert.equal(buyer.inventory.length, 1);
      assert.equal(buyer.inventory[0].itemId, 'short_sword');

      // Vendedor tem lucro registrado: 10.000 - 3% (300a) = 9.700a
      const sales = MarketService.getPlayerSales('MasterSmith');
      assert.equal(sales.pendingAdena, 9700, 'Lucro líquido de 97% após imposto da Coroa');
      assert.equal(sales.history.length, 1);
      assert.equal(sales.history[0].buyer, 'RichKnight');
    });
  });

  // ── 4. Concorrência e Idempotência ───────────────────────────────────────
  describe('4. Concorrência e Idempotência (Simultaneous Purchases)', () => {
    it('quando dois jogadores tentam comprar simultaneamente, apenas um leva e o outro não perde moeda', async () => {
      const seller = { name: 'SoleSeller', gold: 10000, inventory: [{ uid: 's1', itemId: 'short_sword', count: 1, slot: 'weapon' }] };
      const { listing } = await MarketService.createListing(seller, { itemUid: 's1', quantity: 1, pricePerUnit: 5000 });

      const buyer1 = { name: 'FastBuyer', gold: 20000, inventory: [] };
      const buyer2 = { name: 'SlowBuyer', gold: 20000, inventory: [] };

      // Simulação: Buyer 1 compra e a transação é finalizada
      const res1 = await MarketService.buyListing(buyer1, listing.id);
      assert.equal(res1.ok, true);
      assert.equal(buyer1.gold, 15000);
      assert.equal(buyer1.inventory.length, 1);

      // Simulação: Buyer 2 tenta comprar imediatamente após ou com o item já adquirido
      const res2 = await MarketService.buyListing(buyer2, listing.id);
      assert.equal(res2.ok, false);
      assert.match(res2.msg, /já foi adquirido por outro jogador ou foi cancelado/i);

      // Asserções estritas de proteção ao comprador 2
      assert.equal(buyer2.gold, 20000, 'Comprador 2 NÃO perde Adena');
      assert.equal(buyer2.inventory.length, 0, 'Comprador 2 NÃO recebe item fantasma');

      // O vendedor recebeu o lucro apenas UMA vez
      const sales = MarketService.getPlayerSales('SoleSeller');
      assert.equal(sales.history.length, 1, 'Apenas uma venda registrada');
    });

    it('quando a transação remota do servidor rejeita a compra, moeda e inventário do comprador permanecem intactos', async () => {
      const seller = { name: 'ServerSeller', gold: 10000, inventory: [{ uid: 's1', itemId: 'short_sword', count: 1 }] };
      const { listing } = await MarketService.createListing(seller, { itemUid: 's1', quantity: 1, pricePerUnit: 5000 });

      // Injeta mock do FirebaseBridge simulando rejeição por colisão no servidor
      globalThis.window.FirebaseBridge = {
        executeMarketPurchase: async () => ({ success: false, msg: 'Item arrematado por outro usuário milissegundos antes!' })
      };

      const buyer = { name: 'CollidingBuyer', gold: 30000, inventory: [] };
      const buyRes = await MarketService.buyListing(buyer, listing.id);

      assert.equal(buyRes.ok, false);
      assert.match(buyRes.msg, /arrematado por outro usuário/i);
      assert.equal(buyer.gold, 30000, 'Saldo de Adena permanece 100% intacto');
      assert.equal(buyer.inventory.length, 0, 'Nenhum item creditado');
    });
  });

  // ── 5. Coleta de Lucros (claimProfits) ────────────────────────────────────
  describe('5. Coleta de Lucros de Vendas (claimProfits)', () => {
    it('coleta lucros acumulados e atualiza a carteira do vendedor', async () => {
      const sellerState = { name: 'HarvestMerchant', gold: 1000 };

      // Injeta lucros pendentes na conta
      MarketService.savePlayerSales('HarvestMerchant', {
        pendingAdena: 25000,
        pendingAdenCoins: 10,
        history: [{ itemName: 'Sword', quantity: 1, totalCost: 25000 }]
      });

      const claimRes = await MarketService.claimProfits(sellerState);
      assert.equal(claimRes.ok, true);
      assert.equal(sellerState.gold, 26000, '1.000 + 25.000 = 26.000 Adena');
      assert.equal(sellerState.adenCoins, 10, '10 Aden Coins creditados');

      // Tentativa consecutiva deve acusar saldo zerado
      const secondClaim = await MarketService.claimProfits(sellerState);
      assert.equal(secondClaim.ok, false);
      assert.match(secondClaim.msg, /Nenhum lucro pendente/i);
    });
  });

  // ── 6. Contrato de Segurança de Regras do Firestore ──────────────────────
  describe('6. Blindagem de Regras do Firestore (firestore.rules)', () => {
    it('regras do Firestore exigem campos imutáveis e escrow seguro no P2P', () => {
      const rules = fs.readFileSync(path.resolve('firestore.rules'), 'utf8');

      // 1. Criação exige usuário registrado e sellerId correspondente
      assert.match(rules, /request\.resource\.data\.sellerId == request\.auth\.uid/);
      assert.match(rules, /request\.resource\.data\.isPlayerListing == true/);

      // 2. Atualização protege campos críticos (preço, item, quantidade, sellerId) contra adulteração por terceiros
      assert.match(rules, /request\.resource\.data\.pricePerUnit == resource\.data\.pricePerUnit/);
      assert.match(rules, /request\.resource\.data\.totalPrice == resource\.data\.totalPrice/);
      assert.match(rules, /request\.resource\.data\.item == resource\.data\.item/);

      // 3. Regra de deleção é restrita ao vendedor ou admin
      assert.match(rules, /allow delete: if isServerAdmin\(\) \|\| \(isRegistered\(\) && resource\.data\.sellerId == request\.auth\.uid\);/);
    });
  });
});
