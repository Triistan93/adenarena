import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';
import { ClanService } from '../lineage-idle/src/services/ClanService.js';
import { renderClanTab } from '../lineage-idle/src/ui/GameUI.js';

describe('Clãs MMO — fundamento sem estado ou membros fictícios', () => {
  it('mantém personagem sem clã sem mutar o save nem apresentar progressão de clã', () => {
    const state = DEFAULT_STATE();
    const before = structuredClone(state.clan);

    const status = ClanService.getClanStatus(state);

    assert.equal(status.clan, null);
    assert.equal(status.levelData, null);
    assert.equal(status.nextLevelData, null);
    assert.deepEqual(status.activeSkills, []);
    assert.deepEqual(state.clan, before);
  });

  it('não inventa membros no roster de um jogador sem clã', () => {
    const state = DEFAULT_STATE();

    assert.deepEqual(ClanService.getClanRoster(state), []);
  });

  it('recusa doação para um clã que o personagem não possui', () => {
    const state = DEFAULT_STATE();
    state.gold = 100_000;
    state.sp = 1_000;
    const before = structuredClone({ gold: state.gold, sp: state.sp, clan: state.clan });

    const result = ClanService.donateToClan(state, 5_000, 0);

    assert.equal(result.success, false);
    assert.equal(result.reason, 'no_clan');
    assert.deepEqual({ gold: state.gold, sp: state.sp, clan: state.clan }, before);
  });

  it('não permite ativar bênçãos de Clan Hall sem associação real a um clã', () => {
    const state = DEFAULT_STATE();
    state.gold = 100_000;
    const before = structuredClone({ gold: state.gold, buffs: state.buffs });

    const result = ClanService.activateClanHallBuff(state, 'paagrio_protection');

    assert.equal(result.success, false);
    assert.equal(result.reason, 'no_clan');
    assert.deepEqual({ gold: state.gold, buffs: state.buffs }, before);
  });

  it('renderiza uma tela de clãs dedicada e honesta para personagem sem clã', () => {
    const previousWindow = globalThis.window;
    const previousDocument = globalThis.document;
    globalThis.window = {};
    globalThis.document = { getElementById: () => null };
    const container = { innerHTML: '', querySelector: () => null, querySelectorAll: () => [] };

    try {
      renderClanTab(container, DEFAULT_STATE());
    } finally {
      if (previousWindow === undefined) delete globalThis.window;
      else globalThis.window = previousWindow;
      if (previousDocument === undefined) delete globalThis.document;
      else globalThis.document = previousDocument;
    }

    assert.match(container.innerHTML, /Clãs &amp; Alianças/);
    assert.match(container.innerHTML, /SEM CLÃ/);
    assert.match(container.innerHTML, /Territórios/);
    assert.match(container.innerHTML, /Fundar um clã/);
    assert.match(container.innerHTML, /Clãs recrutando/);
    assert.doesNotMatch(container.innerHTML, /SirGalahad|ElenaMoonsong|KaelenShadow/);
  });

  it('não apresenta associação local antiga como se fosse um clã compartilhado', () => {
    const previousWindow = globalThis.window;
    const previousDocument = globalThis.document;
    globalThis.window = {};
    globalThis.document = { getElementById: () => null };
    const state = DEFAULT_STATE();
    state.clan = { name: 'Clã Fantasma', level: 5, members: [{ name: 'NPC inventado' }] };
    const container = { innerHTML: '', querySelector: () => null, querySelectorAll: () => [] };

    try {
      renderClanTab(container, state);
    } finally {
      if (previousWindow === undefined) delete globalThis.window;
      else globalThis.window = previousWindow;
      if (previousDocument === undefined) delete globalThis.document;
      else globalThis.document = previousDocument;
    }

    assert.match(container.innerHTML, /DADOS LOCAIS ANTIGOS/);
    assert.match(container.innerHTML, /não representam um clã compartilhado/);
    assert.doesNotMatch(container.innerHTML, /NPC inventado/);
  });
});
