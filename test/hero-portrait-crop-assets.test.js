import test from 'node:test';
import assert from 'node:assert/strict';

import { heroSVG } from '../lineage-idle/art.js';

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

  assert.equal(imageSource(markup), '/img/m_arcanalord.jpg');
});

test('portrait keeps a distinct cropped asset when its pixels differ', () => {
  const markup = heroSVG({
    race: 'elf',
    class: 'mage',
    gender: 'M',
    mode: 'portrait',
  });

  assert.equal(imageSource(markup), '/img/heroes_cropped/elfmageM.png');
});
