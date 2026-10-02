import { test } from 'node:test';
import assert from 'node:assert/strict';

import { ALL_ITEMS } from '../lineage-idle/src/data/items/index.js';
import { DRAGON_WEAPONS } from '../lineage-idle/src/data/items/dragon_weapons.js';
import { getItemIcon, getItemIconUrl } from '../lineage-idle/src/ui/GameUI.js';

test('all Dragon Weapons have renderable icons in equipped and inventory slots', () => {
  const previousGameData = globalThis.GameData;
  globalThis.GameData = { ...(previousGameData || {}), ALL_ITEMS, ICON_MAP: {} };

  try {
    const entries = Object.entries(DRAGON_WEAPONS);
    assert.equal(entries.length, 52, 'the full four-dragon, thirteen-archetype catalog must be checked');

    for (const [id, item] of entries) {
      assert.equal(ALL_ITEMS[id], item, `${id} must be present in the production item catalog`);
      assert.match(
        item.icon,
        /^(https?:\/\/\S+\.(?:png|jpe?g|webp|svg)|(?:img\/)?icons?\/.+\.(?:png|jpe?g|webp|svg)|(?:nograde|grade[a-z]+|gradespecial)\/.+\.(?:png|jpe?g|webp|svg))$/i,
        `${id} must declare an image URL or usable image path, not an item id`
      );

      const iconUrl = getItemIconUrl(item);
      assert.ok(iconUrl, `${id} must resolve to an image URL`);
      if (/^https?:\/\//i.test(item.icon)) {
        assert.equal(iconUrl, item.icon, `${id} must keep its external image URL intact when equipped`);
      }
      assert.match(getItemIcon(item), /class="inventory-item-image"/, `${id} must use the shared icon renderer`);
    }
  } finally {
    if (previousGameData === undefined) delete globalThis.GameData;
    else globalThis.GameData = previousGameData;
  }
});
