import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { IDLE_MARKUP } from '../src/idle/markup.ts';

const heroIdIndex = IDLE_MARKUP.indexOf('id="pillar-strip-character"');
const heroStart = IDLE_MARKUP.lastIndexOf('<div', heroIdIndex);
const heroEnd = IDLE_MARKUP.indexOf('<!-- Pillar 3 Subtabs', heroIdIndex);
const heroNav = heroStart >= 0 && heroEnd > heroStart ? IDLE_MARKUP.slice(heroStart, heroEnd) : '';
const grimoireStyles = fs.readFileSync(new URL('../lineage-idle/theme-grimoire.css', import.meta.url), 'utf8');
const chapterNavs = ['combat', 'economy', 'glory'].map((pillar) => {
  const start = IDLE_MARKUP.indexOf(`id="pillar-strip-${pillar}"`);
  const wrapperStart = IDLE_MARKUP.lastIndexOf('<div', start);
  const nextChapter = pillar === 'glory'
    ? IDLE_MARKUP.indexOf('<!-- Imperial Economy Resource Ribbon', start + 1)
    : IDLE_MARKUP.indexOf('<!-- Pillar ', start + 1);
  return { pillar, markup: start >= 0 ? IDLE_MARKUP.slice(wrapperStart, nextChapter > start ? nextChapter : undefined) : '' };
});

test('Hero navigation has a distinct hierarchy and preserves all seven existing destinations', () => {
  assert.match(heroNav, /pillar-subtabs-strip--hero/);
  assert.match(heroNav, /hero-subnav-heading/);
  assert.match(heroNav, /hero-subnav-grid/);
  assert.match(heroNav, /hero-subnav-signet/);
  assert.match(heroNav, /hero-subnav-rule/);
  assert.match(heroNav, /aria-label="Disciplinas do herói"/);
  assert.match(heroNav, /Legado do Herói/);

  const destinations = [...heroNav.matchAll(/data-tab="([^"]+)"/g)].map(([, tab]) => tab);
  assert.deepEqual(destinations, ['character', 'inventory', 'skills', 'astral', 'dolls', 'cosmetics', 'quests']);
  assert.match(heroNav, /tab-badge-inventory/);
  assert.match(heroNav, /tab-badge-skills/);
  assert.match(heroNav, /tab-badge-quests/);
});

test('Hero navigation uses responsive cards, a gold active state, and visible keyboard focus', () => {
  assert.match(grimoireStyles, /\.pillar-tab-btn\[data-pillar="character"\]\.active/);
  assert.match(grimoireStyles, /\.pillar-subtabs-strip--hero/);
  assert.match(grimoireStyles, /\.hero-subnav-grid[\s\S]*?grid-template-columns/);
  assert.match(grimoireStyles, /\.hero-subnav-signet/);
  assert.match(grimoireStyles, /\.hero-subnav-rule/);
  assert.match(grimoireStyles, /\.hero-subtab-index/);
  assert.match(grimoireStyles, /\.hero-subnav-stats/);
  assert.match(grimoireStyles, /container-name:\s*heroSubnav/);
  assert.match(grimoireStyles, /@container\s+heroSubnav\s*\(min-width:\s*520px\)[\s\S]*?repeat\(4,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(grimoireStyles, /\.subtab-pill-btn:focus-visible/);
  assert.match(grimoireStyles, /@media\s*\(max-width:\s*420px\)[\s\S]*?hero-subnav-grid/);
});

test('Combat, Empire, and Glory use the same premium chapter navigation without losing destinations', () => {
  const expectedDestinations = {
    combat: ['zones', 'raids', 'tower', 'colosseum', 'expeditions', 'fishing', 'hunting', 'gathering', 'mining'],
    economy: ['market', 'shop', 'craft', 'warehouse', 'magiclamp', 'alchemy'],
    glory: ['clan', 'olympiad', 'rankings', 'sevensigns', 'fortress', 'enchant', 'codex'],
  };

  for (const { pillar, markup } of chapterNavs) {
    assert.match(markup, new RegExp(`pillar-subtabs-strip--${pillar}`));
    assert.match(markup, /hero-subnav-heading/);
    assert.match(markup, /hero-subnav-grid/);
    assert.match(markup, /hero-subtab-index/);
    const destinations = [...markup.matchAll(/data-tab="([^"]+)"/g)].map(([, tab]) => tab);
    assert.deepEqual(destinations, expectedDestinations[pillar]);
  }
  assert.match(chapterNavs[2].markup, /pillar-contacts-btn/);
  assert.match(grimoireStyles, /\.pillar-subtabs-strip--combat[\s\S]*?\.hero-subnav-heading/);
  assert.match(grimoireStyles, /\.pillar-subtabs-strip--economy[\s\S]*?\.hero-subnav-grid/);
  assert.match(grimoireStyles, /\.pillar-subtabs-strip--glory[\s\S]*?\.hero-subtab-card/);
});
