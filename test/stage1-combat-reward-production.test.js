import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

test('Etapa 1 — recompensa, equipamento e caça pelos controles de produção sem save real', async () => {
  const previousGlobals = new Map(
    ['window', 'document', 'localStorage', 'fetch', 'GameData'].map(key => [key, globalThis[key]])
  );
  const storedValues = new Map();
  globalThis.localStorage = {
    getItem: key => storedValues.get(key) ?? null,
    setItem: (key, value) => storedValues.set(key, String(value)),
    removeItem: key => storedValues.delete(key)
  };
  globalThis.document = {
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener() {},
    createElement: () => ({
      style: {},
      classList: { add() {}, remove() {}, toggle() {} },
      appendChild() {},
      setAttribute() {},
      remove() {},
      getBoundingClientRect: () => ({ width: 0, height: 0 })
    })
  };
  const combatToggleButton = {
    innerHTML: '',
    onclick: null,
    classList: { toggle() {} },
    style: { removeProperty() {} }
  };
  const questBadge = { style: { display: 'none' } };
  const stageHeroNodes = {
    '#hero-name, .stage-hero-name': { textContent: '' },
    '#hero-level, .stage-hero-level': { textContent: '' },
    '#hero-hp-bar, .stage-hp-bar-hero': { style: {} },
    '#hero-mp-bar, .stage-mp-bar-hero': { style: {} },
    '#hero-sprite-container, .hero-sprite-host': { innerHTML: '' },
    '#hero-hp-text, .stage-hp-text-hero': { textContent: '' },
    '#hero-mp-text, .stage-mp-text-hero': { textContent: '' }
  };
  const stageRoot = {
    querySelector(selector) {
      if (selector === '#stage-hero, .stage-hero') return { querySelector: childSelector => stageHeroNodes[childSelector] || null };
      return stageHeroNodes[selector] || null;
    },
    querySelectorAll() { return []; }
  };
  const idleHost = { shadowRoot: stageRoot };
  globalThis.document.getElementById = id => {
    if (id === 'tab-badge-quests') return questBadge;
    if (id === 'idle-host') return idleHost;
    return null;
  };
  globalThis.window = { addEventListener() {}, GameData: {} };
  globalThis.fetch = async () => ({ ok: false });

  let server;
  try {
    server = await createServer({
      configFile: 'vite.config.ts',
      server: { middlewareMode: true },
      appType: 'custom'
    });

    const itemsModule = await server.ssrLoadModule('/lineage-idle/src/data/items/index.js');
    window.GameData = {
      ALL_ITEMS: itemsModule.ALL_ITEMS,
      ZONE_GOLD_MULT: {},
      rollDrop: () => [{ id: 'bone_breastplate', itemId: 'bone_breastplate', rarity: 'common', isEquipment: true, amount: 1 }]
    };

    const stateModule = await server.ssrLoadModule('/lineage-idle/src/core/StateManager.js');
    const configModule = await server.ssrLoadModule('/lineage-idle/src/core/GameConfig.js');
    const monstersModule = await server.ssrLoadModule('/lineage-idle/src/data/monsters.js');
    const questsModule = await server.ssrLoadModule('/lineage-idle/src/data/quests.js');
    const advisorModule = await server.ssrLoadModule('/lineage-idle/src/services/NextActionAdvisor.js');
    const statsModule = await server.ssrLoadModule('/lineage-idle/src/engine/StatsEngine.js');
    const gameUI = await server.ssrLoadModule('/lineage-idle/src/ui/GameUI.js');
    const main = await server.ssrLoadModule('/lineage-idle/main.js');
    const state = stateModule.DEFAULT_STATE();
    stateModule.applyStarterKit(state, 'human', 'fighter', 'DisposableCombatCheck', 'M');
    state.isCombatActive = true;
    state.combatActive = true;
    state.base = { atk: 200, def: 100, eva: 0, matk: 0, mdef: 0 };
    state.zone = 'talkingIsland';
    state.target = 'goblin';
    state.activeMonster = { ...monstersModule.MONSTERS.goblin, hp: 1, maxHp: 1 };
    const dailyKillQuest = questsModule.QUEST_DEFS.daily.find(quest => quest.id === 'd_kills');
    const availableDaily = questsModule.QUEST_DEFS.daily.filter(quest => !quest.unlockLevel || quest.unlockLevel <= state.level);
    state.quests.claimed = [
      ...availableDaily.filter(quest => quest.id !== dailyKillQuest.id).map(quest => quest.id),
      ...questsModule.QUEST_DEFS.weekly.map(quest => quest.id)
    ];
    state.quests.progress[dailyKillQuest.id] = dailyKillQuest.target - 1;
    state.quests.lastDailyReset = Date.now();
    state.quests.lastWeeklyReset = Date.now();
    stateModule.replaceStateSnapshot(state);

    const before = stateModule.getState();
    gameUI.renderStageHero(before);
    assert.equal(stageHeroNodes['#hero-hp-text, .stage-hp-text-hero'].textContent, `HP: ${before.hp} / ${before.maxHp}`);
    const initialXp = before.xp;
    const initialGold = before.gold;
    const initialKills = before.stats?.monstersKilled || 0;

    main.attackMonster();

    assert.equal(stageHeroNodes['#hero-hp-text, .stage-hp-text-hero'].textContent,
      `HP: ${before.hp} / ${statsModule.getStats(before).maxHp}`,
      'o cartão do personagem deve acompanhar o HP máximo recalculado no painel lateral');

    assert.equal(questBadge.style.display, 'inline-flex',
      'concluir uma missão pelo combate deve acender imediatamente o badge da aba Missões');

    const after = stateModule.getState();
    assert.ok(after.xp > initialXp, 'o handler real deve conceder EXP');
    assert.ok(after.gold > initialGold, 'o handler real deve conceder Adena');
    assert.equal(after.stats?.monstersKilled, initialKills + 1, 'o handler real deve registrar o abate');
    assert.ok(after.inventory.some(item => item.itemId === 'bone_breastplate'), 'o drop retornado pelo catálogo deve chegar à mochila');
    const nextAdvice = advisorModule.NextActionAdvisor.getAdvice(after);
    assert.equal(nextAdvice.actionType, 'AUTO_EQUIP', 'a recomendação deve reconhecer o ganho defensivo mesmo com CP empatado');
    assert.ok(nextAdvice.actionPayload.changes.some(change => change.proposedItem?.itemId === 'bone_breastplate'), 'a orientação deve apontar para o item recém-obtido');

    let actionButton;
    let renderedMarkup = '';
    let updateCalls = 0;
    let zoneNavigationCalls = 0;
    const saveCalls = [];
    const zoneTab = { dataset: { tab: 'zones' }, click() { zoneNavigationCalls += 1; } };
    const advisorContainer = {
      style: {},
      set innerHTML(markup) { renderedMarkup = markup; actionButton = { onclick: null }; },
      querySelector: selector => selector === '#advisor-action-btn' ? actionButton : null
    };
    const root = {
      querySelector: selector => selector === '#next-action-advisor-char' ? advisorContainer : null,
      querySelectorAll: selector => selector === '.tab-btn[data-tab]' ? [zoneTab] : []
    };
    document.getElementById = id => {
      if (id === 'idle-host') return { shadowRoot: root };
      if (id === 'combat-toggle-btn') return combatToggleButton;
      return null;
    };
    let callbacks;
    callbacks = gameUI.createCharacterUICallbacks({
      root,
      updateAllUI: () => {
        updateCalls += 1;
        gameUI.updateCharacterUI(after, callbacks);
      },
      save: (...args) => saveCalls.push(args)
    });
    const defenseBeforeAutoEquip = statsModule.getStats(after).def;
    gameUI.updateCharacterUI(after, callbacks);
    assert.equal(typeof actionButton?.onclick, 'function', 'o painel do Herói deve renderizar o botão de autoequip');
    actionButton.onclick({ preventDefault() {} });

    const rewardedArmor = after.inventory.find(item => item.itemId === 'bone_breastplate');
    assert.equal(after.equipment.chest, rewardedArmor.uid, 'o clique deve equipar o drop no slot de peito');
    assert.equal(rewardedArmor.equipped, true, 'o item recomendado deve ficar marcado como equipado');
    assert.ok(statsModule.getStats(after).def > defenseBeforeAutoEquip, 'a defesa deve aumentar após o autoequip');
    assert.notEqual(advisorModule.NextActionAdvisor.getAdvice(after).actionType, 'AUTO_EQUIP', 'a orientação não deve continuar oferecendo o mesmo equipamento após equipá-lo');
    assert.equal(updateCalls, 1, 'o clique deve atualizar a interface uma única vez');
    assert.match(renderedMarkup, /Caçar & Subir Nível|Desafiar Conteúdo/, 'a ficha deve exibir a orientação seguinte após equipar');
    assert.doesNotMatch(renderedMarkup, /Auto-Equipar Agora/, 'a recomendação antiga não deve permanecer visível');
    assert.deepEqual(saveCalls, [[true, true]], 'o clique deve solicitar salvamento imediato');
    actionButton.onclick({ preventDefault() {} });
    assert.equal(zoneNavigationCalls, 1, 'o próximo objetivo deve levar à aba real de Combate & Zonas');
    assert.equal(storedValues.size, 0, 'a verificação não pode escrever um save persistente');

    after.activeMonster = null;
    after.isCombatActive = false;
    after.combatActive = false;
    main.bindEvents();
    assert.equal(typeof combatToggleButton.onclick, 'function', 'o controle de caça deve receber o handler de produção');
    combatToggleButton.onclick();
    assert.equal(after.isCombatActive, true, 'o clique do jogador deve retomar a caça');
    assert.ok(after.activeMonster?.hp > 0, 'retomar a caça deve criar um monstro válido na zona atual');
    combatToggleButton.onclick();
    assert.equal(after.isCombatActive, false, 'o mesmo controle deve pausar a caça quando clicado novamente');
    await new Promise(resolve => setTimeout(resolve, 1100));
    const savedSnapshot = storedValues.get(configModule.SAVE_KEY);
    assert.ok(savedSnapshot, 'o controle de caça deve agendar salvamento local no armazenamento descartável');
    assert.equal(JSON.parse(savedSnapshot).isCombatActive, false, 'o save local descartável deve preservar a caça pausada');
  } finally {
    if (server) await server.close();
    for (const [key, value] of previousGlobals) {
      if (value === undefined) delete globalThis[key];
      else globalThis[key] = value;
    }
  }
});
