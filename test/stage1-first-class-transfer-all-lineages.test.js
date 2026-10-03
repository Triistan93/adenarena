import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { CanonicalClassGraph } from '../lineage-idle/src/data/classes/CanonicalClassGraph.js';
import { promoteClass } from '../lineage-idle/src/services/CharacterService.js';
import { getSkillTreeViewModel } from '../lineage-idle/src/services/SkillTreeViewModel.js';
import { getStats } from '../lineage-idle/src/engine/StatsEngine.js';
import {
  DEFAULT_STATE,
  getState,
  loadState,
  replaceStateSnapshot,
  saveState
} from '../lineage-idle/src/core/StateManager.js';

function makeMemoryStorage() {
  const values = new Map();
  return {
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); }
  };
}

test('Etapa 1 — 1ª transferência real, árvore de habilidades e persistência nas 49 linhagens', async (t) => {
  const storageBefore = globalThis.localStorage;
  globalThis.localStorage = makeMemoryStorage();

  try {
    const branches = JSON.parse(fs.readFileSync('scraped_data_wiki/classes_tree_canonical.json', 'utf8'))
      .flatMap(race => (race.branches || []).map(branch => ({ race: race.race, ...branch })));

    assert.equal(branches.length, 49, 'o fixture canônico deve conter todas as 49 linhagens');

    for (const branch of branches) {
      await t.test(`${branch.race}: ${branch.lineageName} (${branch.base} → ${branch.first})`, () => {
        const callbacks = { ui: 0, skills: 0, saves: 0 };
        const seed = {
          ...DEFAULT_STATE(),
          race: branch.race,
          class: branch.base,
          className: CanonicalClassGraph.getClassNode(branch.base)?.name,
          level: 20,
          sp: 1000,
          hp: 100,
          maxHp: 100,
          mp: 50,
          maxMp: 50,
          character: {
            race: branch.race,
            classId: branch.base,
            className: CanonicalClassGraph.getClassNode(branch.base)?.name
          },
          skills: {}
        };

        replaceStateSnapshot(seed);
        const state = getState();
        const promoted = promoteClass(state, branch.first, null, {
          updateAllUI: () => { callbacks.ui += 1; },
          updateSkillUI: () => { callbacks.skills += 1; },
          save: () => { callbacks.saves += 1; assert.equal(saveState(), true); },
          log: () => {},
          floatText: () => {}
        });

        assert.equal(promoted, true, 'a classe sucessora deve ser aceita no nível 20');
        assert.equal(state.class, branch.first);
        assert.equal(state.character.classId, branch.first);
        const promotedStats = getStats(state);
        assert.equal(state.maxHp, promotedStats.maxHp,
          'HP máximo deve refletir os atributos da classe promovida');
        assert.equal(state.maxMp, promotedStats.maxMp,
          'MP máximo deve refletir os atributos da classe promovida');
        assert.equal(callbacks.ui, 1, 'a interface geral deve atualizar imediatamente');
        assert.equal(callbacks.skills, 1, 'a árvore de habilidades deve atualizar imediatamente');
        assert.equal(callbacks.saves, 1, 'a promoção deve salvar imediatamente');

        const immediateTree = getSkillTreeViewModel(state);
        assert.equal(immediateTree.header.className, branch.first[0].toUpperCase() + branch.first.slice(1));
        assert.equal(immediateTree.header.level, 20);
        replaceStateSnapshot(DEFAULT_STATE());
        assert.equal(loadState(), true, 'o save descartável deve poder ser reaberto');
        const restored = getState();
        assert.equal(restored.class, branch.first, 'a classe deve sobreviver ao reload');
        assert.equal(restored.character.classId, branch.first, 'o ID da ficha deve sobreviver ao reload');

        const restoredTree = getSkillTreeViewModel(restored);
        assert.equal(restoredTree.header.className, immediateTree.header.className);
        assert.equal(restoredTree.header.canonicalClass, immediateTree.header.canonicalClass);
        assert.equal(restoredTree.header.stageNumber, immediateTree.header.stageNumber);
        assert.ok(restoredTree.allVisibleSkills.some(skill => skill.isLearned), 'a árvore reaberta deve apresentar habilidades aprendidas');
      });
    }
  } finally {
    replaceStateSnapshot(DEFAULT_STATE());
    if (storageBefore === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = storageBefore;
  }
});

test('Etapa 1 — a promoção rejeita destinos fora do DAG canônico', () => {
  const cases = [
    { race: 'human', source: 'fighter', target: 'wizard' },
    { race: 'elf', source: 'elven_fighter', target: 'orc_raider' }
  ];

  for (const { race, source, target } of cases) {
    const state = {
      ...DEFAULT_STATE(),
      race,
      class: source,
      level: 40,
      character: { race, classId: source, className: source }
    };
    assert.equal(promoteClass(state, target, null, { log: () => {} }), false,
      `${race}: ${target} não é sucessora canônica de ${source}`);
    assert.equal(state.class, source, `${race}: rejeição deve preservar a classe atual`);
    assert.equal(state.character.classId, source, `${race}: rejeição deve preservar a ficha`);
  }
});
