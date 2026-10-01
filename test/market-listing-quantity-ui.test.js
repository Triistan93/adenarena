import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { MarketService } from '../lineage-idle/src/services/MarketService.js';
import { renderMarketTab, setActiveMarketTab } from '../lineage-idle/src/ui/MarketUI.js';

describe('Market UI — quantidade inteira para anúncios descartáveis', () => {
  it('não envia quantidade fracionária ao serviço de anúncio', async () => {
    const originals = {};
    const replace = (name, value) => {
      originals[name] = MarketService[name];
      MarketService[name] = value;
    };
    let createListingInput = null;
    replace('initCloudSubscription', () => {});
    replace('getPlayerSales', () => ({ pendingAdena: 0, pendingAdenCoins: 0, history: [] }));
    replace('getMyListings', () => []);
    replace('getListings', () => []);
    replace('createListing', async (_state, input) => {
      createListingInput = input;
      return { ok: false, msg: 'Simulação local descartável.' };
    });

    try {
      const selectedItem = { dataset: { uid: 'disposable-stack' }, onclick: null };
      const quantityInput = { value: '1', max: '3', onchange: null };
      const priceInput = { value: '1000', onchange: null };
      const submitButton = { disabled: false, onclick: null };
      const container = {
        set innerHTML(_value) {},
        querySelector(selector) {
          if (selector === '#input-sell-qty') return quantityInput;
          if (selector === '#input-sell-price') return priceInput;
          if (selector === '#btn-submit-listing') return submitButton;
          return null;
        },
        querySelectorAll(selector) {
          return selector === '.market-select-item' ? [selectedItem] : [];
        }
      };
      const state = {
        name: 'Disposable Market Tester',
        gold: 10000,
        adenCoins: 0,
        inventory: [{ uid: 'disposable-stack', itemId: 'short_sword', name: 'Short Sword', count: 3, slot: 'weapon' }]
      };

      setActiveMarketTab('sell');
      renderMarketTab(container, state);
      selectedItem.onclick();
      quantityInput.onchange({ target: { value: '1.5' } });
      await submitButton.onclick();

      assert.ok(createListingInput, 'the disposable service double must receive the UI submission');
      assert.ok(Number.isSafeInteger(createListingInput.quantity));
      assert.equal(createListingInput.quantity, 1);

      quantityInput.onchange({ target: { value: '10' } });
      await submitButton.onclick();
      assert.equal(createListingInput.quantity, 3, 'listing quantity cannot exceed the disposable stack');

      priceInput.onchange({ target: { value: '1.5' } });
      await submitButton.onclick();
      assert.ok(Number.isSafeInteger(createListingInput.pricePerUnit));
      assert.equal(createListingInput.pricePerUnit, 1);
    } finally {
      for (const [name, original] of Object.entries(originals)) MarketService[name] = original;
      setActiveMarketTab('buy');
    }
  });
});
