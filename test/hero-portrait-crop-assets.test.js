import test from 'node:test';
import assert from 'node:assert/strict';

import { heroSVG } from '../lineage-idle/art.js';
import registry from '../src/idle/generatedClassPortraits.json' with { type: 'json' };

function imageSource(markup) {
  return markup.match(/<img src="([^"]+)"/)?.[1];
}

test('portrait uses the original URL when the crop is byte-identical', () => {
  const markup = heroSVG({
    race: 'human',
    class: 'arcanalord',
    gender: 'M',
    mode: 'portrait',
  });

  assert.equal(imageSource(markup), '/img/m_human_arcana_lord.webp');
});

test('portrait uses current compressed generated class art directly', () => {
  const previousWindow = globalThis.window;
  globalThis.window = { __CLASS_PORTRAITS: registry };
  try {
    const markup = heroSVG({ race: 'elf', class: 'elfMage', gender: 'M', mode: 'portrait' });
    assert.equal(imageSource(markup), '/img/m_elf_elf_mage.webp');
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});
