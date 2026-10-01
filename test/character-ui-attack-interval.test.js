import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';
import { getStats } from '../lineage-idle/src/engine/StatsEngine.js';
import { resolvePlayerBasicAttackIntervalMs } from '../lineage-idle/src/services/SkillEffectService.js';
import { updateCharacterUI } from '../lineage-idle/src/ui/GameUI.js';

describe('Character UI production attack interval', () => {
  it('renders the same basic-attack interval used by combat instead of a missing stats.spd field', () => {
    const character = DEFAULT_STATE();
    character.level = 40;
    character.race = 'human';
    character.class = 'gladiator';
    const expectedStats = getStats(character);
    const expectedMs = resolvePlayerBasicAttackIntervalMs(expectedStats);
    const summary = { innerHTML: '' };
    const originalDocument = globalThis.document;

    globalThis.document = {
      getElementById: () => null,
      querySelector: (selector) => selector === '#char-tab-stats-summary' ? summary : null
    };

    try {
      updateCharacterUI(character);
      assert.match(summary.innerHTML, /Intervalo do Ataque Básico/);
      assert.match(summary.innerHTML, new RegExp(`${(expectedMs / 1000).toFixed(2)} s`));
      assert.match(summary.innerHTML, /Recarga de Habilidades/);
      assert.match(summary.innerHTML, new RegExp(`Geral ${Math.round((expectedStats.cdr || 0) * 100)}%`));
      assert.doesNotMatch(summary.innerHTML, /Velocidade de Ação/);
    } finally {
      if (originalDocument === undefined) delete globalThis.document;
      else globalThis.document = originalDocument;
    }
  });
});
