import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { REFINERY_RECIPES } from '../lineage-idle/src/services/lifeActivities/RefineryService.js';
import { RESOURCE_DICTIONARY, CANONICAL_RESOURCES } from '../lineage-idle/src/services/lifeActivities/ResourceDictionary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

describe('Refinery & Life Activities Material Icons Integrity', () => {
  it('1. All newly provisioned and previously failing material icons exist on disk', () => {
    const requiredFiles = [
      'public/img/icons/materials/stem.png',
      'public/img/icons/materials/varnish.png',
      'public/img/icons/materials/varnish_of_purity.png',
      'public/img/icons/materials/synthetic_cokes.png',
      'public/img/icons/materials/mithril_alloy.png',
      'public/img/icons/materials/enria.png',
      'public/img/icons/materials/durable_metal_plate.png',
      'public/img/icons/materials/fish_raw.png',
      'public/img/icons/consumables/sages_tea.png',
      'public/img/icons/scrolls/sages_tea.png'
    ];

    for (const relPath of requiredFiles) {
      const fullPath = path.join(ROOT, relPath);
      assert.ok(fs.existsSync(fullPath), `File must exist on disk: ${relPath}`);
      const stats = fs.statSync(fullPath);
      assert.ok(stats.size > 0, `File must not be empty: ${relPath}`);
    }
  });

  it('2. Every input and output in REFINERY_RECIPES resolves to an existing icon', () => {
    for (const recipe of REFINERY_RECIPES) {
      // Recipe icon
      const recipeIconPath = path.join(ROOT, 'public/img/icons', recipe.icon);
      assert.ok(fs.existsSync(recipeIconPath), `Recipe icon for ${recipe.id} must exist: ${recipe.icon}`);

      // Output material
      const outDef = RESOURCE_DICTIONARY[recipe.output.matId];
      assert.ok(outDef, `Output material ${recipe.output.matId} must be in RESOURCE_DICTIONARY`);
      const outIconPath = path.join(ROOT, 'public/img/icons', outDef.icon);
      assert.ok(fs.existsSync(outIconPath), `Output icon for ${outDef.itemId} must exist: ${outDef.icon}`);

      // Input materials
      for (const input of recipe.inputs) {
        const inDef = RESOURCE_DICTIONARY[input.matId];
        assert.ok(inDef, `Input material ${input.matId} must be in RESOURCE_DICTIONARY`);
        const inIconPath = path.join(ROOT, 'public/img/icons', inDef.icon);
        assert.ok(fs.existsSync(inIconPath), `Input icon for ${inDef.itemId} must exist: ${inDef.icon}`);
      }
    }
  });

  it('3. fish_raw is properly declared in CANONICAL_RESOURCES with a valid icon', () => {
    assert.ok(CANONICAL_RESOURCES.fish_raw, 'fish_raw must exist in CANONICAL_RESOURCES');
    assert.equal(CANONICAL_RESOURCES.fish_raw.itemId, 'fish_raw');
    assert.equal(CANONICAL_RESOURCES.fish_raw.category, 'raw_fish');
    const iconPath = path.join(ROOT, 'public/img/icons', CANONICAL_RESOURCES.fish_raw.icon);
    assert.ok(fs.existsSync(iconPath), `fish_raw icon must exist on disk: ${CANONICAL_RESOURCES.fish_raw.icon}`);
  });

  it('4. RefineryUI.js contains this.onerror=null to prevent recursive 404 loops', () => {
    const uiPath = path.join(ROOT, 'lineage-idle/src/ui/RefineryUI.js');
    const content = fs.readFileSync(uiPath, 'utf8');

    // Must not contain unchecked onerror assignment
    assert.ok(!content.includes('onerror="this.src='), 'RefineryUI must not have unprotected onerror assignments');
    assert.ok(content.includes('this.onerror=null'), 'RefineryUI must protect against infinite error loops');
  });
});
