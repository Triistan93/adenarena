import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { ClassProgressionEngine } from '../lineage-idle/src/engine/ClassProgressionEngine.js';
import { checkLevelUp, getTotalXP } from '../lineage-idle/src/engine/LevelEngine.js';
import { promoteClass } from '../lineage-idle/src/services/CharacterService.js';
import { SeasonAvailabilityService } from '../lineage-idle/src/services/SeasonAvailabilityService.js';

function makeCharacter(race, classId, level, serverSeason = 1) {
  return {
    race,
    class: classId,
    className: classId,
    level,
    serverSeason,
    sp: 1000,
    hp: 100,
    maxHp: 100,
    mp: 50,
    maxMp: 50,
    base: { atk: 0, def: 0, eva: 0, matk: 0, mdef: 0 },
    skills: {},
    character: { race, classId, className: classId }
  };
}

test('Etapa 1 — marcos Lv. 19/20, 39/40 e 75/76, com gate sazonal, nas 49 linhagens', () => {
  const branches = JSON.parse(fs.readFileSync('scraped_data_wiki/classes_tree_canonical.json', 'utf8'))
    .flatMap(race => (race.branches || []).map(branch => ({ race: race.race, ...branch })));

  assert.equal(branches.length, 49);
  const previousWindow = globalThis.window;
  globalThis.window = { ...(previousWindow || {}), __serverSeason: 1 };

  try {
    for (const branch of branches) {
      const { race, first, second, third, lineageName } = branch;
      const firstTransferState = makeCharacter(race, branch.base, 19, 1);
      assert.equal(promoteClass(firstTransferState, first, null, { log: () => {} }), false,
        `${lineageName}: bloquear primeira transferência no Lv. 19`);
      assert.equal(firstTransferState.class, branch.base,
        `${lineageName}: classe base deve permanecer no Lv. 19`);
      firstTransferState.level = 20;
      assert.equal(promoteClass(firstTransferState, first, null, { log: () => {} }), true,
        `${lineageName}: liberar primeira transferência no Lv. 20`);
      assert.equal(firstTransferState.class, first,
        `${lineageName}: primeira transferência deve selecionar a classe sucessora no Lv. 20`);

      const state = makeCharacter(race, first, 39, 1);

      assert.equal(promoteClass(state, second, null, { log: () => {} }), false,
        `${lineageName}: bloquear segunda transferência no Lv. 39`);
      assert.equal(state.class, first, `${lineageName}: classe não muda no Lv. 39`);

      state.level = 40;
      assert.equal(promoteClass(state, second, null, { log: () => {} }), true,
        `${lineageName}: liberar segunda transferência no Lv. 40`);
      assert.equal(state.class, second);

      state.level = 75;
      assert.equal(promoteClass(state, third, null, { log: () => {} }), false,
        `${lineageName}: bloquear terceira transferência no Lv. 75`);
      assert.equal(state.class, second);

      state.level = 76;
      assert.equal(promoteClass(state, third, null, { log: () => {} }), false,
        `${lineageName}: temporada 1 não libera a terceira transferência no Lv. 76`);
      assert.equal(state.class, second, `${lineageName}: gate de temporada preserva a classe`);

      const defaultSeasonOptions = ClassProgressionEngine.getPromotionOptions(second, 76, race);
      const defaultSeasonThird = defaultSeasonOptions.find(option => option.targetClass.id === third);
      assert.ok(defaultSeasonThird, `${lineageName}: sucessor de terceiro estágio existe no DAG`);
      assert.equal(defaultSeasonThird.isEligible, false,
        `${lineageName}: motor deve usar temporada ativa (temporada 1), não inferir temporada pelo nível`);
      assert.equal(SeasonAvailabilityService.isClassAvailable(third), false,
        `${lineageName}: o serviço de disponibilidade acompanha a temporada ativa`);

      globalThis.window.__serverSeason = 2;
      assert.equal(promoteClass(state, third, null, { log: () => {} }), false,
        `${lineageName}: temporada 2 também bloqueia a terceira transferência no Lv. 76`);
      assert.equal(state.class, second,
        `${lineageName}: a temporada 2 mantém a classe de segundo estágio`);
      assert.equal(SeasonAvailabilityService.isClassAvailable(third), false,
        `${lineageName}: o serviço mantém o terceiro estágio bloqueado na temporada 2`);

      const seasonThreeOptions = ClassProgressionEngine.getPromotionOptions(second, 76, race, 3);
      assert.equal(seasonThreeOptions.find(option => option.targetClass.id === third)?.isEligible, true,
        `${lineageName}: opção fica elegível na temporada 3`);

      globalThis.window.__serverSeason = 3;
      assert.equal(SeasonAvailabilityService.isClassAvailable(third), true,
        `${lineageName}: o serviço de disponibilidade abre o estágio 3 na temporada 3`);
      assert.equal(promoteClass(state, third, null, { log: () => {} }), true,
        `${lineageName}: temporada 3 libera a terceira transferência no Lv. 76`);
      assert.equal(state.class, third);
      globalThis.window.__serverSeason = 1;
    }
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});

test('Etapa 1 — o cap Lv. 40 da temporada 1 impede níveis extras e limita XP excedente', () => {
  const state = makeCharacter('human', 'warrior', 39, 1);
  state.serverMaxLevel = 40;
  state.serverCap = 40;
  state.levelCap = 40;
  state.xp = getTotalXP(41);

  assert.equal(checkLevelUp(state), true);
  assert.equal(state.level, 40, 'a barra pode atingir o nível final da temporada');
  assert.equal(state.xp, getTotalXP(40), 'XP excedente é limitada ao máximo armazenável do cap');

  assert.equal(checkLevelUp(state), false, 'não há nível acima do cap');
  assert.equal(state.level, 40);
});
