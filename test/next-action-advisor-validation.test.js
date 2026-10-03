import { describe, it } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { NextActionAdvisor, ADVISOR_PRIORITIES } from '../lineage-idle/src/services/NextActionAdvisor.js';

describe('P1-ADV: NextActionAdvisor & Power Milestone Validation', () => {
  it('4.1 Prioridade 1: Detecta slot vazio com equipamento na mochila e recomenda Auto-Equip', () => {
    const state = {
      level: 10,
      charName: 'NoviceKnight',
      equipment: {}, // Todos os slots vazios!
      inventory: [
        { uid: 'wpn_1', itemId: 'short_sword', slot: 'weapon', atk: 25, count: 1 },
        { uid: 'armor_1', itemId: 'wooden_breastplate', slot: 'armor', def: 15, count: 1 }
      ]
    };

    const advice = NextActionAdvisor.getAdvice(state);
    assert.strictEqual(advice.priority, ADVISOR_PRIORITIES.AUTO_EQUIP);
    assert.strictEqual(advice.category, 'AUTO_EQUIP');
    assert.strictEqual(advice.actionType, 'AUTO_EQUIP');
    assert.ok(advice.actionText.includes('Auto-Equipar'));
    assert.strictEqual(advice.actionTab, 'inventory');
  });

  it('4.2 Prioridade 2: Detecta item superior na mochila e recomenda Upgrade', () => {
    const state = {
      level: 40,
      class: 'gladiator',
      equipment: {
        weapon: 'wpn_weak'
      },
      inventory: [
        { uid: 'wpn_weak', itemId: 'sword_d', slot: 'weapon', type: 'sword', atk: 50, count: 1, equipped: true },
        { uid: 'wpn_strong', itemId: 'tsurugi', slot: 'weapon', type: 'sword', atk: 130, count: 1 }
      ]
    };

    const advice = NextActionAdvisor.getAdvice(state);
    assert.strictEqual(advice.priority, ADVISOR_PRIORITIES.UPGRADE);
    assert.strictEqual(advice.category, 'UPGRADE');
    assert.ok(advice.actionText.includes('Equipar Melhoria'));
  });

  it('4.3 Prioridade 3: Detecta pergaminho de enchant compatível com item equipado e recomenda Encantar', () => {
    const state = {
      level: 45,
      class: 'gladiator',
      equipment: {
        weapon: 'wpn_tsurugi'
      },
      inventory: [
        { uid: 'wpn_tsurugi', itemId: 'tsurugi', slot: 'weapon', grade: 'C', atk: 130, count: 1, equipped: true, enchant: 0 },
        { uid: 'scrl_c', itemId: 'scroll_enchant_weapon_c', slot: 'scroll', count: 3 }
      ]
    };

    const advice = NextActionAdvisor.getAdvice(state);
    assert.strictEqual(advice.priority, ADVISOR_PRIORITIES.ENCHANT);
    assert.strictEqual(advice.category, 'ENCHANT');
    assert.strictEqual(advice.actionType, 'ENCHANT');
    assert.ok(advice.actionText.includes('Encantar'));
    assert.strictEqual(advice.actionPayload.scrollUid, 'scrl_c');
    assert.strictEqual(advice.actionPayload.targetUid, 'wpn_tsurugi');
  });

  it('4.4 Prioridade 5: Power Milestone calcula meta de CP e progresso quando nenhum upgrade imediato existe', () => {
    const state = {
      level: 15,
      class: 'fighter',
      equipment: {
        weapon: 'wpn_sword'
      },
      inventory: [
        { uid: 'wpn_sword', itemId: 'sword_ng', slot: 'weapon', atk: 20, equipped: true, count: 1 }
      ]
    };

    const advice = NextActionAdvisor.getAdvice(state);
    assert.strictEqual(advice.priority, ADVISOR_PRIORITIES.MILESTONE);
    assert.strictEqual(advice.category, 'MILESTONE');
    assert.ok(advice.targetCp > 0);
    assert.ok(advice.cpRemaining >= 0);
    assert.ok(advice.targetName.includes('1ª'));
  });

  it('4.5 Ao alcançar o cap de temporada, explica o bloqueio e não recomenda grind para classe indisponível', () => {
    const state = {
      level: 40,
      serverMaxLevel: 40,
      serverCap: 40,
      levelCap: 40,
      class: 'gladiator',
      equipment: {},
      inventory: []
    };

    const advice = NextActionAdvisor.getAdvice(state);

    assert.equal(advice.category, 'SEASON_CAP');
    assert.equal(advice.actionTab, 'quests');
    assert.equal(advice.actionType, 'NAVIGATE');
    assert.match(advice.description, /Lv\. 40/);
    assert.match(advice.description, /Lv\. 76/);
    assert.match(advice.actionText, /Missões/);
  });

  it('4.6 Prioriza a 1ª transferência disponível no Lv. 20 antes de recomendar outros marcos', () => {
    const advice = NextActionAdvisor.getAdvice({
      level: 20,
      serverMaxLevel: 40,
      class: 'fighter',
      race: 'human',
      equipment: {},
      inventory: []
    });

    assert.equal(advice.category, 'CLASS_ADVANCEMENT');
    assert.equal(advice.actionTab, 'character');
    assert.match(advice.title, /1ª Troca de Classe/);
  });

  it('4.7 Prioriza a 2ª transferência elegível no cap Lv. 40 antes do aviso de expansão', () => {
    const advice = NextActionAdvisor.getAdvice({
      level: 40,
      serverMaxLevel: 40,
      serverCap: 40,
      levelCap: 40,
      class: 'warrior',
      race: 'human',
      equipment: {},
      inventory: []
    });

    assert.equal(advice.category, 'CLASS_ADVANCEMENT');
    assert.equal(advice.actionTab, 'character');
    assert.match(advice.title, /2ª Troca de Classe/);
  });

  it('4.8 Orienta as 49 linhagens pelas transferências realmente disponíveis nos Lv. 20 e 40', () => {
    const branches = JSON.parse(readFileSync(
      new URL('../scraped_data_wiki/classes_tree_canonical.json', import.meta.url),
      'utf8'
    )).flatMap(race => (race.branches || []).map(branch => ({ race: race.race, ...branch })));
    assert.equal(branches.length, 49, 'o fixture de lançamento deve cobrir todas as linhagens');

    for (const branch of branches) {
      const firstTransfer = NextActionAdvisor.getAdvice({
        level: 20, serverMaxLevel: 40, race: branch.race, class: branch.base,
        equipment: {}, inventory: []
      });
      assert.equal(firstTransfer.category, 'CLASS_ADVANCEMENT', `${branch.lineageName}: 1ª transferência`);
      assert.match(firstTransfer.title, /1ª Troca de Classe/, `${branch.lineageName}: etapa 1`);

      const secondTransfer = NextActionAdvisor.getAdvice({
        level: 40, serverMaxLevel: 40, race: branch.race, class: branch.first,
        equipment: {}, inventory: []
      });
      assert.equal(secondTransfer.category, 'CLASS_ADVANCEMENT', `${branch.lineageName}: 2ª transferência`);
      assert.match(secondTransfer.title, /2ª Troca de Classe/, `${branch.lineageName}: etapa 2`);

      const atSeasonCap = NextActionAdvisor.getAdvice({
        level: 40, serverMaxLevel: 40, race: branch.race, class: branch.second,
        equipment: {}, inventory: []
      });
      assert.equal(atSeasonCap.category, 'SEASON_CAP', `${branch.lineageName}: cap após completar a 2ª transferência`);
    }
  });

  it('4.9 Após concluir os 100 andares, encaminha para conteúdo disponível em vez do andar 101', () => {
    const previousWindow = globalThis.window;
    globalThis.window = { __serverSeason: 4 };
    try {
      const advice = NextActionAdvisor.getAdvice({
        level: 120,
        serverMaxLevel: 120,
        class: 'duelist',
        race: 'human',
        tower: { highestFloor: 100, currentFloor: 100 },
        equipment: {},
        inventory: []
      });

      assert.equal(advice.category, 'TOWER_COMPLETE');
      assert.match(advice.description, /100 andares/);
      assert.equal(advice.actionTab, 'raids');
      assert.equal(advice.actionType, 'NAVIGATE');
      assert.match(advice.actionText, /Raids/);
    } finally {
      if (previousWindow === undefined) delete globalThis.window;
      else globalThis.window = previousWindow;
    }
  });

  it('4.10 Save acima do cap não recomenda a Torre antes de ela ser liberada', () => {
    const previousWindow = globalThis.window;
    globalThis.window = { __serverSeason: 1 };
    try {
      const advice = NextActionAdvisor.getAdvice({
        level: 76,
        serverMaxLevel: 40,
        serverCap: 40,
        class: 'gladiator',
        race: 'human',
        tower: { highestFloor: 0, currentFloor: 1 },
        equipment: {},
        inventory: []
      });

      assert.equal(advice.category, 'SEASON_LOCKED_CONTENT');
      assert.equal(advice.actionTab, 'quests');
      assert.equal(advice.actionType, 'NAVIGATE');
      assert.match(advice.description, /Torre da Insolência e as próximas evoluções pertencem a temporadas futuras/);
      assert.doesNotMatch(advice.targetName, /Andar 1/);
    } finally {
      if (previousWindow === undefined) delete globalThis.window;
      else globalThis.window = previousWindow;
    }
  });

  it('4.11 Só recomenda receita quando nível, maestria, materiais e Adena permitem criá-la', () => {
    const previousWindow = globalThis.window;
    const futureRecipe = {
      id: 'future_sword_recipe', itemId: 'future_sword', level: 76, craftLevel: 5,
      minPlayerLevel: 76, gold: 500, materials: [{ matId: 'iron_ore', qty: 2 }]
    };
    const gameData = {
      ALL_ITEMS: {
        future_sword: { id: 'future_sword', name: 'Future Sword', slot: 'weapon', req: { level: 76 }, grade: 'S' },
        iron_ore: { id: 'iron_ore', name: 'Iron Ore', slot: 'material' }
      },
      CRAFTING_RECIPES: { future_sword_recipe: futureRecipe }
    };
    globalThis.window = { GameData: gameData, __serverSeason: 1 };
    try {
      const state = {
        level: 10, class: 'fighter', race: 'human', accountForgeLevel: 1, craftLevel: 1,
        gold: 1000, equipment: {},
        inventory: [{ uid: 'ore-stack', itemId: 'iron_ore', count: 2 }]
      };

      const blockedAdvice = NextActionAdvisor.getAdvice(state);
      assert.notEqual(blockedAdvice.category, 'FORGE', 'não deve sugerir uma receita acima do nível e da maestria');

      futureRecipe.level = 1;
      futureRecipe.minPlayerLevel = 1;
      futureRecipe.craftLevel = 1;
      futureRecipe.gold = 500;
      gameData.ALL_ITEMS.future_sword.req.level = 1;
      const availableAdvice = NextActionAdvisor.getAdvice(state);
      assert.equal(availableAdvice.category, 'FORGE', 'deve continuar sugerindo a receita quando todos os requisitos forem atendidos');

      state.gold = 499;
      assert.notEqual(NextActionAdvisor.getAdvice(state).category, 'FORGE', 'não deve sugerir receita sem Adena suficiente');
    } finally {
      if (previousWindow === undefined) delete globalThis.window;
      else globalThis.window = previousWindow;
    }
  });

  it('4.12 Recomenda a Torre no intervalo de níveis da Temporada 2 quando o recurso já está liberado', () => {
    const previousWindow = globalThis.window;
    globalThis.window = { __serverSeason: 2 };
    try {
      const advice = NextActionAdvisor.getAdvice({
        level: 60, serverMaxLevel: 75, serverCap: 75, levelCap: 75,
        class: 'duelist', race: 'human', tower: { highestFloor: 4, currentFloor: 5 },
        equipment: {}, inventory: []
      });

      assert.equal(advice.actionTab, 'tower');
      assert.match(advice.targetName, /Torre da Insolência: Andar 5/);
      assert.match(advice.actionText, /Desafiar Andar 5/,
        'a CTA deve descrever a Torre indicada, em vez de pedir caça e subida de nível');
    } finally {
      if (previousWindow === undefined) delete globalThis.window;
      else globalThis.window = previousWindow;
    }
  });
});
