import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { renderMarketTab, setActiveMarketTab } from '../lineage-idle/src/ui/MarketUI.js';
import { MarketService } from '../lineage-idle/src/services/MarketService.js';

describe('Market UI — untrusted listing content', () => {
  it('escapes remote listing names, seller names, IDs and persisted search text before rendering HTML', () => {
    const originals = {};
    const replace = (name, value) => {
      originals[name] = MarketService[name];
      MarketService[name] = value;
    };
    replace('initCloudSubscription', () => {});
    replace('getPlayerSales', () => ({ pendingAdena: 0, pendingAdenCoins: 0, history: [] }));
    replace('getMyListings', () => []);
    replace('getListings', () => [{
      id: 'listing" onmouseover="alert(1)',
      currency: 'adena', quantity: 1, pricePerUnit: 100,
      sellerName: '<svg onload=alert(2)>', isPlayerListing: true,
      item: { id: 'short_sword', itemId: 'short_sword', slot: 'weapon', name: '<img src=x onerror=alert(3)>' }
    }]);
    replace('_isMyListing', () => false);

    try {
      setActiveMarketTab('buy');
      const searchInput = { oninput: null };
      const container = {
        innerHTML: '',
        querySelector: selector => selector === '#market-search-input' ? searchInput : null,
        querySelectorAll: () => []
      };

      renderMarketTab(container, { name: 'Disposable Tester', gold: 0, adenCoins: 0 });
      assert.doesNotMatch(container.innerHTML, /<svg onload=alert\(2\)>|<img src=x onerror=alert\(3\)>/);
      assert.match(container.innerHTML, /&lt;svg onload=alert\(2\)&gt;/);
      assert.match(container.innerHTML, /&lt;img src=x onerror=alert\(3\)&gt;/);
      assert.match(container.innerHTML, /listing&quot; onmouseover=&quot;alert\(1\)/);

      searchInput.oninput({ target: { value: '\"><img src=x onerror=alert(4)>' } });
      renderMarketTab(container, { name: 'Disposable Tester', gold: 0, adenCoins: 0 });
      assert.doesNotMatch(container.innerHTML, /value=""><img src=x onerror=alert\(4\)>"/);
      assert.match(container.innerHTML, /value="&quot;&gt;&lt;img src=x onerror=alert\(4\)&gt;"/);
    } finally {
      for (const [name, original] of Object.entries(originals)) MarketService[name] = original;
    }
  });
});
