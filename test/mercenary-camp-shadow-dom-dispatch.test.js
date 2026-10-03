import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Mural reads the selected mercenary from its Shadow DOM before dispatching work', async () => {
  const ui = await readFile(new URL('../lineage-idle/src/ui/GameUI.js', import.meta.url), 'utf8');
  const dispatchButton = ui.match(/<button onclick="window\.dispatchMercenaryWork\([^\n]+/);

  assert.ok(dispatchButton, 'work dispatch button should remain connected to the service');
  assert.match(dispatchButton[0], /this\.parentElement\.querySelector\(['"]select['"]\)\.value/);
  assert.doesNotMatch(dispatchButton[0], /document\.getElementById/);
});
