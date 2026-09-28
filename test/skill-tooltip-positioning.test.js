import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

globalThis.window = { innerWidth: 1280, innerHeight: 720 };

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { positionSkillTooltip } = await import('../lineage-idle/src/ui/GameUI.js');

function makeTooltip(width = 260, height = 220) {
  const classes = new Set();
  return {
    style: {},
    classList: {
      add(name) { classes.add(name); },
      contains(name) { return classes.has(name); },
      remove(name) { classes.delete(name); }
    },
    getBoundingClientRect() { return { width, height }; }
  };
}

test('skill tooltip follows the pointer using viewport coordinates', () => {
  const tooltip = makeTooltip();

  positionSkillTooltip(tooltip, { clientX: 600, clientY: 400 }, window);

  assert.equal(tooltip.style.position, 'fixed');
  assert.equal(tooltip.style.transform, 'translate3d(616px, 412px, 0)');
  assert.equal(tooltip.classList.contains('skill-hover-tooltip'), true);
});

test('skill tooltip flips left and clamps vertically when it would leave the viewport', () => {
  const tooltip = makeTooltip(260, 220);

  positionSkillTooltip(tooltip, { clientX: 1200, clientY: 680 }, window);

  assert.equal(tooltip.style.transform, 'translate3d(926px, 488px, 0)');
});

test('skill tooltip cannot intercept the pointer and retrigger card hover', () => {
  const tooltip = makeTooltip();
  const css = fs.readFileSync(path.join(rootDir, 'lineage-idle/style.css'), 'utf8');

  positionSkillTooltip(tooltip, { clientX: 300, clientY: 200 }, window);

  assert.equal(tooltip.classList.contains('skill-hover-tooltip'), true);
  assert.match(css, /#item-tooltip\.skill-hover-tooltip\s*\{[^}]*pointer-events:\s*none\s*!important/s);
});

test('hovering a skill card does not move its hit target under the pointer', () => {
  const css = fs.readFileSync(path.join(rootDir, 'lineage-idle/style.css'), 'utf8');
  const hoverRule = css.match(/\.skill-node-card:hover\s*\{([^}]*)\}/s)?.[1] || '';

  assert.doesNotMatch(hoverRule, /transform\s*:/);
  assert.match(hoverRule, /border-color\s*:/);
  assert.match(hoverRule, /box-shadow\s*:/);
});
