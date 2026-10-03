import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeClanName, validateClanName } from '../lineage-idle/src/services/ClanSocialService.js';

test('normaliza nomes de clã para uma chave estável e sem acentos', () => {
  assert.equal(normalizeClanName('  Guardiões de Áden  '), 'guardioes-de-aden');
});

test('valida nome de clã e rejeita nomes curtos, longos ou só com símbolos', () => {
  assert.equal(validateClanName('Ordem do Leão'), null);
  assert.equal(validateClanName('ab'), 'name_too_short');
  assert.equal(validateClanName('a'.repeat(25)), 'name_too_long');
  assert.equal(validateClanName('!!!'), 'name_invalid');
});
