import { test } from 'node:test';
import assert from 'node:assert/strict';

import { renderZoneMap } from '../lineage-idle/src/ui/GameUI.js';

class FakeElement {
  constructor() {
    this.children = [];
    this.dataset = {};
    this.classList = { add() {} };
    this.style = {};
    this.innerHTML = '';
  }

  appendChild(child) {
    this.children.push(child);
  }
}

test('zone map marks town areas from the canonical zone definition', () => {
  const container = new FakeElement();
  const previousDocument = globalThis.document;
  globalThis.document = {
    getElementById: () => null,
    querySelector: selector => selector === '#zone-map-container' ? container : null,
    createElement: () => new FakeElement()
  };

  try {
    renderZoneMap({
      zone: 'talkingIsland',
      level: 1,
      stats: { combatPower: 300 },
      combatPower: 300
    });

    const renderedCards = container.children.map(child => child.innerHTML).join('\n');
    const talkingIslandCard = renderedCards.match(/<div class="zone-card[^>]*data-zone="talkingIsland"[\s\S]*?<\/div>\s*<\/div>/)?.[0] || '';
    const elvenForestCard = renderedCards.match(/<div class="zone-card[^>]*data-zone="elvenForest"[\s\S]*?<\/div>\s*<\/div>/)?.[0] || '';

    assert.match(talkingIslandCard, /class="zone-flag town"/, 'a town should display its town badge');
    assert.doesNotMatch(elvenForestCard, /class="zone-flag town"/, 'a hunting zone should not display the town badge');
  } finally {
    if (previousDocument === undefined) delete globalThis.document;
    else globalThis.document = previousDocument;
  }
});

test('zone map difficulty controls reflect their level gates', () => {
  const container = new FakeElement();
  const previousDocument = globalThis.document;
  globalThis.document = {
    getElementById: () => null,
    querySelector: selector => selector === '#zone-map-container' ? container : null,
    createElement: () => new FakeElement()
  };

  try {
    const state = { zone: 'talkingIsland', level: 39, stats: { combatPower: 300 }, combatPower: 300 };
    renderZoneMap(state);
    let markup = container.children.map(child => child.innerHTML).join('\n');
    assert.match(markup, /data-diff="hard"\s+disabled/, 'Hard should be locked at level 39');

    state.level = 40;
    container.children = [];
    renderZoneMap(state);
    markup = container.children.map(child => child.innerHTML).join('\n');
    assert.match(markup, /data-diff="hard"\s+\n?\s*onclick=/, 'Hard should unlock at level 40');
    assert.match(markup, /data-diff="nightmare"\s+disabled/, 'Nightmare should remain locked at level 40');
  } finally {
    if (previousDocument === undefined) delete globalThis.document;
    else globalThis.document = previousDocument;
  }
});
