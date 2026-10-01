import test from 'node:test';
import assert from 'node:assert/strict';
import { selectPortraitSplit } from '../scripts/lib/portrait-pair-layout.mjs';

test('chooses a transparent valley near center instead of cutting a shield at midpoint', () => {
  const opaqueCounts = new Array(100).fill(10);
  opaqueCounts[50] = 8;
  opaqueCounts[54] = 0;
  opaqueCounts[55] = 0;
  opaqueCounts[56] = 0;
  assert.equal(selectPortraitSplit(opaqueCounts), 54);
});

test('keeps the split centered when the central valley is equally clear on both sides', () => {
  const opaqueCounts = new Array(100).fill(10);
  opaqueCounts[47] = 0;
  opaqueCounts[53] = 0;
  assert.equal(selectPortraitSplit(opaqueCounts), 53);
});
