import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeClanName, validateClanName } from '../lineage-idle/src/services/ClanSocialService.js';
import { CLAN_CRESTS, DEFAULT_CLAN_CREST_ID, getClanCrest, renderClanCrestHtml } from '../lineage-idle/src/data/clanCrests.js';

test('normaliza nomes de clã para uma chave estável e sem acentos', () => {
  assert.equal(normalizeClanName('  Guardiões de Áden  '), 'guardioes-de-aden');
});

test('valida nome de clã e rejeita nomes curtos, longos ou só com símbolos', () => {
  assert.equal(validateClanName('Ordem do Leão'), null);
  assert.equal(validateClanName('ab'), 'name_too_short');
  assert.equal(validateClanName('a'.repeat(25)), 'name_too_long');
  assert.equal(validateClanName('!!!'), 'name_invalid');
});

test('catálogo de brasões heráldicos possui 16 opções canônicas com metadados completos', () => {
  assert.ok(Array.isArray(CLAN_CRESTS));
  assert.ok(CLAN_CRESTS.length >= 16);
  assert.equal(DEFAULT_CLAN_CREST_ID, 'crest_lion');

  for (const crest of CLAN_CRESTS) {
    assert.ok(typeof crest.id === 'string' && crest.id.startsWith('crest_'));
    assert.ok(typeof crest.name === 'string' && crest.name.length > 0);
    assert.ok(typeof crest.symbol === 'string' && crest.symbol.length > 0);
    assert.ok(typeof crest.bgGradient === 'string' && crest.bgGradient.includes('linear-gradient'));
    assert.ok(typeof crest.borderColor === 'string' && crest.borderColor.startsWith('#'));
  }
});

test('getClanCrest resolve identificadores válidos e possui fallback seguro para IDs desconhecidos', () => {
  const lion = getClanCrest('crest_lion');
  assert.equal(lion.id, 'crest_lion');
  assert.equal(lion.name, 'Leão Dourado de Aden');

  const dragon = getClanCrest('crest_dragon');
  assert.equal(dragon.id, 'crest_dragon');
  assert.equal(dragon.symbol, '🐉');

  const fallback = getClanCrest('unknown_crest_xyz');
  assert.equal(fallback.id, 'crest_lion');

  const emptyFallback = getClanCrest(null);
  assert.equal(emptyFallback.id, 'crest_lion');
});

test('renderClanCrestHtml gera marcação HTML estruturada com badge heráldica e cores temáticas', () => {
  const html = renderClanCrestHtml('crest_dragon', 'md', true);
  assert.ok(html.includes('clan-crest-badge'));
  assert.ok(html.includes('data-crest-id="crest_dragon"'));
  assert.ok(html.includes('🐉'));
  assert.ok(html.includes('linear-gradient'));
  assert.ok(html.includes('clan-crest-badge--interactive'));
});

