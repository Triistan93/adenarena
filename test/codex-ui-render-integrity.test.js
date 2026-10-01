import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CardCodexService } from '../lineage-idle/src/services/CardCodexService.js';
import { MONSTER_CARDS, getCanonicalCardId } from '../lineage-idle/src/services/CardCodexService.js';
import { escapeHTML } from '../lineage-idle/src/ui/GameUI.js';
const mainSource = readFileSync(new URL('../lineage-idle/main.js', import.meta.url), 'utf8');
const rendererStart = mainSource.indexOf('function renderMonsterCardsCodex(');
const rendererEnd = mainSource.indexOf('\nfunction registerCodexItem(', rendererStart);
assert.ok(rendererStart >= 0 && rendererEnd > rendererStart, 'production Codex card renderer must exist');
const rendererSource = mainSource.slice(rendererStart, rendererEnd);

class FakeNode {
  children = [];
  style = {};
  innerHTML = '';
  textContent = '';
  className = '';
  searchInput = {};
  actionRow = new FakeNodeRow();
  appendChild(child) { this.children.push(child); }
  querySelector(selector) {
    if (selector === '#card-search-input') return this.searchInput;
    if (selector === '.codex-card-actions') return this.actionRow;
    return null;
  }
}

class FakeNodeRow {
  children = [];
  appendChild(child) { this.children.push(child); }
}

function renderProductionCards(state, windowState, cards) {
  const renderer = new Function(
    'state', 'window', 'MONSTER_CARDS', 'CardCodexService', 'getCanonicalCardId', 'uiEscapeHTML', 'mkEl', 'getInventoryCount', 'getWarehouseCount',
    `${rendererSource}; return renderMonsterCardsCodex;`
  )(state, windowState, cards, CardCodexService, getCanonicalCardId, escapeHTML, () => new FakeNode(), () => 0, () => 0);
  const container = new FakeNode();
  const summary = new FakeNode();
  renderer(container, summary);
  return { container, summary };
}

describe('Codex — apresentação segura e fiel dos bônus', () => {
  it('escala percentuais fracionários exibidos pelo mesmo multiplicador da coleção', () => {
    const label = CardCodexService.formatCodexBonusLabel({ critDmg: 0.04, lifesteal: 0.04, pAtk: 50 }, 1.5);
    assert.equal(label, '+6.0% CRITDMG, +6.0% LIFESTEAL, +75 PATK');
  });

  it('Codex renderiza o bônus calculado e escapa a busca antes de interpolá-la no input HTML', () => {
    const payload = '\"><img src=x onerror=alert(1)>';
    const cards = {
      test_card: { id: 'test_card', name: 'Test card', monster: 'Test monster', rarity: 'rare', codexBonus: { critDmg: 0.04 } }
    };
    const attacked = renderProductionCards({ cardCodex: {}, inventory: [], equipment: {} }, { _cardSearchQuery: payload }, cards);
    const filterHtml = attacked.container.children[0].innerHTML;
    assert.ok(filterHtml.includes('value="&quot;&gt;&lt;img src=x onerror=alert(1)&gt;"'));
    assert.ok(!filterHtml.includes(`value="${payload}"`));

    const rendered = renderProductionCards(
      { cardCodex: { test_card: { rank: 2, count: 3 } }, inventory: [], equipment: {} },
      { _cardSearchQuery: '' },
      { ...cards, test_card: { ...cards.test_card, codexBonus: { critDmg: 0.04, pAtk: 50 } } }
    );
    const cardHtml = rendered.container.children[1].children[0].innerHTML;
    assert.ok(cardHtml.includes('+6.0% CRITDMG, +75 PATK'));
    assert.ok(MONSTER_CARDS.card_queen_ant.codexBonus.critDmg < 1);
  });
});
