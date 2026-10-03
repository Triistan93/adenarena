import test from 'node:test';
import assert from 'node:assert/strict';
import { EXPEDITION_MAP_POSITIONS } from '../lineage-idle/src/ui/ExpeditionMapLayout.js';
import { EXPEDITION_DESTINATIONS } from '../lineage-idle/src/data/expeditions.js';

test('every expedition has a stable map position inside its illustrated region', () => {
  const destinationIds = Object.keys(EXPEDITION_DESTINATIONS);
  assert.deepEqual(Object.keys(EXPEDITION_MAP_POSITIONS).sort(), destinationIds.sort());

  const positions = Object.values(EXPEDITION_MAP_POSITIONS);
  assert.equal(new Set(positions.map(({ x, y }) => `${x},${y}`)).size, destinationIds.length);
  for (const { x, y } of positions) {
    assert.ok(x >= 0 && x <= 100, `x coordinate ${x} must stay inside the map`);
    assert.ok(y >= 0 && y <= 100, `y coordinate ${y} must stay inside the map`);
  }

  assert.deepEqual(EXPEDITION_MAP_POSITIONS.gludio_ruins, { x: 22.3, y: 23.8 });
  assert.deepEqual(EXPEDITION_MAP_POSITIONS.branded, { x: 25.8, y: 64.7 });
  assert.deepEqual(EXPEDITION_MAP_POSITIONS.dwarven_mines, { x: 52.6, y: 40.2 });
  assert.deepEqual(EXPEDITION_MAP_POSITIONS.martyrs, { x: 61.5, y: 18.3 });
  assert.deepEqual(EXPEDITION_MAP_POSITIONS.dragon_valley, { x: 69.6, y: 65.4 });
  assert.deepEqual(EXPEDITION_MAP_POSITIONS.shilen_temple, { x: 89.2, y: 43.1 });
});

test('expedition atlas preserves the artwork aspect ratio so map and pins share one coordinate space', async () => {
  const { readFile } = await import('node:fs/promises');
  const ui = await readFile(new URL('../lineage-idle/src/ui/GameUI.js', import.meta.url), 'utf8');
  const atlasStyle = ui.match(/\.expedition-atlas\{([^}]+)\}/)?.[1] || '';
  assert.match(atlasStyle, /aspect-ratio:\s*3\s*\/\s*2/);
  assert.match(atlasStyle, /aden-expedition-map\.webp['\"]\)\s+center\/100%\s+100%/);
  assert.match(ui, /\.expedition-map-node\{[^}]*transform:translate\(-50%,-24px\)/);
});
