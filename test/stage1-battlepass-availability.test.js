import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { BATTLE_PASS_TIERS } from '../lineage-idle/src/data/quests.js';

const mainSource = readFileSync(new URL('../lineage-idle/main.js', import.meta.url), 'utf8');
const rendererStart = mainSource.indexOf('function renderBattlePassUI()');
const rendererEnd = mainSource.indexOf('\n// --------------------------- TOWER OF INSOLENCE', rendererStart);
assert.ok(rendererStart >= 0 && rendererEnd > rendererStart, 'production Battle Pass renderer must exist');
const rendererSource = mainSource.slice(rendererStart, rendererEnd);

function renderBattlePass(battlePass) {
  const freeButton = { dataset: { passFree: '1' }, onclick: null };
  const premiumButton = { dataset: { passPrem: '1' }, onclick: null };
  const trackList = {
    innerHTML: '',
    querySelectorAll(selector) {
      if (selector === '[data-pass-free]') return [freeButton];
      if (selector === '[data-pass-prem]') return [premiumButton];
      return [];
    }
  };
  const elements = { 'pass-track-list': trackList };
  const state = { battlePass };
  const renderer = new Function(
    'state', 'BATTLE_PASS_TIERS', 'el', 'window', 'claimPassReward',
    `${rendererSource}; return renderBattlePassUI;`
  )(state, BATTLE_PASS_TIERS, id => elements[id] || null, { open() {} }, () => {});

  renderer();
  return { html: trackList.innerHTML, freeButton, premiumButton };
}

describe('Etapa 1 — ações do Passe de Batalha', () => {
  it('desabilita o prêmio Premium ainda bloqueado por XP sem impedir a compra do passe', () => {
    const locked = renderBattlePass({ xp: 0, claimedFree: [], claimedPremium: [], unlockedPremium: true });
    const lockedButton = locked.html.match(/<button\b[^>]*data-pass-prem="1"[^>]*>/)?.[0];

    assert.ok(lockedButton, 'o botão da trilha Premium deve ser renderizado');
    assert.match(lockedButton, /\sdisabled(?:\s|>|=)/,
      'com Premium ativo, um tier abaixo do requisito de XP não pode aceitar clique');
    assert.match(locked.html, />Tranca<\/button>/);

    const purchasable = renderBattlePass({ xp: 0, claimedFree: [], claimedPremium: [], unlockedPremium: false });
    const purchasableButton = purchasable.html.match(/<button\b[^>]*data-pass-prem="1"[^>]*>/)?.[0];
    assert.doesNotMatch(purchasableButton || '', /\sdisabled(?:\s|>|=)/,
      'quando Premium não está ativo, o botão deve continuar abrindo a opção de compra');
  });
});
