import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { getItemIcon, getItemIconUrl } from '../lineage-idle/src/ui/GameUI.js';
import { ALL_ITEMS } from '../lineage-idle/src/data/items/index.js';

test('L2Wiki external item icons resolve without img/icons/ nesting and have local assets in public/img/icons/l2wiki', () => {
  const previousGameData = globalThis.GameData;
  globalThis.GameData = { ...(previousGameData || {}), ALL_ITEMS, ICON_MAP: {} };

  try {
    const testItemIds = [
      'essence_brooch_lv_9',
      'weapon_dragon_valakas_sword',
      'weapon_dragon_antharas_dual_sword',
      'agathion_bracelet_lv_3',
      'talisman_bracelet_lv_10'
    ];

    for (const itemId of testItemIds) {
      const def = ALL_ITEMS[itemId];
      assert.ok(def, `${itemId} must exist in ALL_ITEMS`);
      assert.ok(def.icon.startsWith('https://l2wiki.com/'), `${itemId} icon must declare https://l2wiki.com URL`);

      const filename = path.basename(new URL(def.icon).pathname);
      const localFile = path.resolve('public/img/icons/l2wiki', filename);
      assert.ok(fs.existsSync(localFile), `Local icon file ${filename} must exist in public/img/icons/l2wiki`);
      assert.ok(fs.statSync(localFile).size > 100, `Local icon file ${filename} must have non-empty size`);

      const iconUrl = getItemIconUrl(def);
      assert.ok(iconUrl, `${itemId} icon URL must resolve`);
      assert.ok(!iconUrl.includes('img/icons/https:'), `${itemId} icon URL must NOT contain malformed nested img/icons/https: prefix`);

      const html = getItemIcon(def);
      assert.match(html, /class="inventory-item-image"/, `${itemId} must render image element`);
      assert.ok(!html.includes('img/icons/https:'), `${itemId} rendered HTML must NOT contain nested img/icons/https:`);
      assert.match(html, /l2wiki/, `${itemId} rendered HTML must include l2wiki local fallback`);
    }
  } finally {
    if (previousGameData === undefined) delete globalThis.GameData;
    else globalThis.GameData = previousGameData;
  }
});
