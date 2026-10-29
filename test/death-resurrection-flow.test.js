import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

test('Morte, ressurreição e persistência — fluxo manual, XP, idempotência e freio do Auto-Reviver', async () => {
  const previousGlobals = new Map(
    ['window', 'document', 'localStorage', 'fetch'].map(key => [key, globalThis[key]])
  );
  const storedValues = new Map();
  globalThis.localStorage = {
    getItem: key => storedValues.get(key) ?? null,
    setItem: (key, value) => storedValues.set(key, String(value)),
    removeItem: key => storedValues.delete(key)
  };
  const makeNode = () => ({
    textContent: '',
    disabled: false,
    title: '',
    innerHTML: '',
    onclick: null,
    focusCalls: 0,
    focus() { this.focusCalls += 1; },
    setAttribute() {},
    classList: { add() {}, remove() {}, toggle() {} },
    style: { removeProperty() {} }
  });
  const modalClasses = new Set();
  const nodes = {
    'death-modal': { classList: { add: name => modalClasses.add(name), remove: name => modalClasses.delete(name), contains: name => modalClasses.has(name) } },
    'xp-loss': makeNode(),
    'res-free': makeNode(),
    'res-scroll': makeNode(),
    'res-rebirth': makeNode(),
    'res-town': makeNode(),
    'combat-toggle-btn': makeNode()
  };
  const stageRoot = { querySelector: () => null, querySelectorAll: () => [], appendChild() {} };
  globalThis.document = {
    getElementById: id => id === 'idle-host' ? { shadowRoot: stageRoot } : (nodes[id] || null),
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener() {},
    createElement: () => ({ style: {}, classList: { add() {}, remove() {}, toggle() {} }, appendChild() {}, setAttribute() {}, remove() {}, getBoundingClientRect: () => ({ width: 0, height: 0 }) }),
    appendChild() {}
  };
  globalThis.window = { addEventListener() {}, GameData: {} };
  globalThis.fetch = async () => ({ ok: false });

  let server;
  try {
    server = await createServer({
      configFile: false,
      server: { middlewareMode: true, hmr: false, watch: null },
      appType: 'custom',
      logLevel: 'silent'
    });

    const itemsModule = await server.ssrLoadModule('/lineage-idle/src/data/items/index.js');
    window.GameData = { ALL_ITEMS: itemsModule.ALL_ITEMS, ZONE_GOLD_MULT: {} };

    const stateModule = await server.ssrLoadModule('/lineage-idle/src/core/StateManager.js');
    const configModule = await server.ssrLoadModule('/lineage-idle/src/core/GameConfig.js');
    const engine = await server.ssrLoadModule('/lineage-idle/src/engine/CombatEngine.js');
    const eventBusModule = await server.ssrLoadModule('/lineage-idle/src/core/EventBus.js');
    const levelEngine = await server.ssrLoadModule('/lineage-idle/src/engine/LevelEngine.js');
    const policy = await server.ssrLoadModule('/lineage-idle/src/core/CombatStartupPolicy.js');
    const safetyPolicy = await server.ssrLoadModule('/lineage-idle/src/core/AutoReviveSafetyPolicy.js');
    const zonesModule = await server.ssrLoadModule('/lineage-idle/src/data/zones.js');

    const logs = [];
    const callbacks = () => ({ log: (msg) => logs.push(msg), el: id => nodes[id] || null });
    const freshState = (patch = {}) => {
      const base = stateModule.DEFAULT_STATE();
      stateModule.applyStarterKit(base, 'human', 'fighter', 'DeathFlow', 'M');
      Object.assign(base, { zone: 'talkingIsland', isCombatActive: true, combatActive: true }, patch);
      stateModule.replaceStateSnapshot(base);
      modalClasses.clear();
      for (const key of ['res-free', 'res-scroll', 'res-rebirth', 'res-town']) nodes[key].disabled = false;
      return stateModule.getState();
    };

    // 5. Freio de segurança: três mortes em 120s e janela que expira.
    {
      const tracker = safetyPolicy.createAutoReviveDeathTracker();
      assert.equal(tracker.record(1000), false, 'a 1ª morte não desarma');
      assert.equal(tracker.record(61000), false, 'a 2ª morte não desarma');
      assert.equal(tracker.record(120999), true, 'a 3ª morte em menos de 120 s desarma');
      tracker.reset();
      assert.equal(tracker.record(1000), false);
      assert.equal(tracker.record(121000), false, 'mortes fora da janela não são acumuladas');
    }

    // 6. Desligar o Auto-Reviver durante a janela impede a retomada automática.
    {
      const state = freshState({ autoResurrect: true });
      engine.playerDeath(state, null, callbacks());
      assert.equal(engine.resurrect(state, 'free', callbacks()), true);
      state.autoResurrect = false;
      await new Promise(resolve => setTimeout(resolve, 550));
      assert.equal(state.isCombatActive, false, 'desligar Auto-Reviver cancela a retomada pendente');
    }

    // 1. Persistência da morte no save/load + sem progresso offline
    {
      const state = freshState();
      state.xp = levelEngine.getTotalXP(state.level - 1) + 50;
      state.inventory.push({ uid: 'rb-keep', itemId: 'scroll_of_rebirth', count: 1 });
      state.inventory.push({ uid: 'legacy-stack', itemId: 'scroll_of_resurrection' });
      engine.playerDeath(state, null, callbacks());
      assert.equal(state.isDead, true);
      assert.equal(state.hp, 0);
      assert.equal(state.isCombatActive, false, 'a morte pausa a caça');
      assert.equal(modalClasses.has('active'), true, 'o modal de morte abre');
      assert.equal(state.inventory.find(i => i.itemId === 'scroll_of_rebirth')?.count, 1,
        'o Renascimento não pode ser consumido sem consentimento');
      assert.equal(nodes['res-rebirth'].disabled, false, 'o botão de Renascimento fica disponível com o item');
      assert.ok(nodes['res-free'].focusCalls > 0, 'o foco vai para o primeiro botão de ação');

      stateModule.saveState(true);
      const saved = JSON.parse(storedValues.get(configModule.SAVE_KEY));
      assert.equal(saved.hp, 0, 'o autosave não pode curar o personagem morto');
      assert.equal(saved.isDead, true);
      assert.equal(saved.pendingDeathLoss, 0.2);
      assert.equal(state.hp, 0, 'o estado em memória segue morto após salvar');
      assert.equal(Object.hasOwn(state.inventory.find(i => i.uid === 'legacy-stack'), 'count'), false,
        'sanitizar o save não deve reescrever o inventário vivo');

      assert.equal(stateModule.loadState(), true);
      const reloaded = stateModule.getState();
      assert.equal(reloaded.isDead, true, 'a morte sobrevive ao reload');
      assert.equal(reloaded.hp, 0);
      assert.equal(reloaded.isCombatActive, false);
      assert.equal(reloaded.pendingDeathLoss, 0.2);
      assert.equal(policy.shouldStartCombatAtStartup(reloaded), false, 'a caça não inicia sozinha com morte pendente');
      assert.equal(policy.canAccrueOfflineProgress(reloaded), false, 'morto não acumula progresso offline');
      engine.renderDeathModal(reloaded, callbacks());
      assert.equal(modalClasses.has('active'), true, 'o boot reabre o modal de morte carregado');

      // O mesmo save, depois da ressurreição, volta a permitir progresso offline.
      assert.equal(engine.resurrect(reloaded, 'free', callbacks()), true);
      assert.equal(policy.canAccrueOfflineProgress(reloaded), true);
      storedValues.clear();
    }

    // 2. XP incide só na faixa do nível e respeita o piso, inclusive após reload
    {
      const level = 20;
      const floorXp = levelEngine.getTotalXP(level - 1);
      const span = levelEngine.getXPForLevel(level);
      const state = freshState({ level });
      state.xp = floorXp + Math.floor(span / 2);
      const before = state.xp;
      engine.playerDeath(state, null, callbacks());
      engine.resurrect(state, 'free', callbacks());
      assert.equal(state.xp, before - Math.floor(span * 0.2), 'perda de 20% da faixa do nível atual');
      assert.ok(state.xp >= floorXp);

      const lowState = freshState({ level });
      lowState.xp = floorXp + 10;
      engine.playerDeath(lowState, null, callbacks());
      engine.resurrect(lowState, 'free', callbacks());
      assert.equal(lowState.xp, floorXp, 'a perda trava no piso do nível (sem de-level nem barra congelada)');
      assert.equal(lowState.level, level);

      stateModule.saveState(true);
      stateModule.loadState();
      assert.equal(stateModule.getState().xp, floorXp, 'o reload não devolve XP');
      storedValues.clear();
    }

    // 3. Idempotência: segunda morte no mesmo estado é ignorada
    {
      const state = freshState();
      state.inventory.push({ uid: 'scr', itemId: 'scroll_of_resurrection', count: 2 });
      assert.equal(engine.playerDeath(state, null, callbacks()), true);
      const pendingLoss = state.pendingDeathLoss;
      assert.equal(engine.playerDeath(state, null, callbacks()), false, 'segunda morte é ignorada');
      assert.equal(state.pendingDeathLoss, pendingLoss);
      // resurrect fora de estado de morte não cura nem consome nada.
      engine.resurrect(state, 'free', callbacks());
      state.hp = 5;
      state.inventory.find(i => i.uid === 'scr').count = 2;
      assert.equal(engine.resurrect(state, 'scroll', callbacks()), false, 'não ressuscita personagem vivo');
      assert.equal(state.hp, 5, 'sem cura gratuita');
      assert.equal(state.inventory.find(i => i.uid === 'scr').count, 2, 'sem consumo indevido');
    }

    // 4. Ressurreição manual: HP/MP/CP, caça pausada, pergaminhos só por escolha
    {
      const state = freshState();
      state.inventory.push({ uid: 'scr', itemId: 'scroll_of_resurrection', count: 2 });
      const inventoryEvents = [];
      const offInventory = eventBusModule.default.on('inventory:updated', event => inventoryEvents.push(event));
      state.cp = 1;
      engine.playerDeath(state, null, callbacks());
      assert.equal(state.inventory.find(i => i.uid === 'scr').count, 2, 'morrer não consome pergaminho');

      let ticks = 0;
      assert.equal(engine.resurrect(state, 'scroll', { ...callbacks(), attackMonster: () => { ticks += 1; } }), true);
      await new Promise(resolve => setTimeout(resolve, 550));
      assert.equal(state.inventory.find(i => i.uid === 'scr').count, 1, 'o pergaminho é consumido só na escolha explícita');
      assert.equal(inventoryEvents.length, 1, 'consumir o pergaminho emite atualização de inventário');
      assert.equal(inventoryEvents[0].itemId, 'scroll_of_resurrection');
      offInventory();
      assert.equal(state.isDead, false);
      assert.equal(state.hp, state.maxHp);
      assert.equal(state.mp, state.maxMp);
      assert.ok(state.maxCp > 1 && state.cp === state.maxCp, 'CP é restaurado ao máximo');
      assert.equal(state.isCombatActive, false, 'ressurreição manual não retoma a caça');
      assert.equal(ticks, 0);
      assert.equal(modalClasses.has('active'), false);

      // Renascimento: sem perda de XP e consumo do item correto.
      const rb = freshState();
      rb.xp = levelEngine.getTotalXP(rb.level - 1) + 40;
      rb.inventory.push({ uid: 'rb', itemId: 'scroll_of_rebirth', count: 1 });
      engine.playerDeath(rb, null, callbacks());
      const xpBefore = rb.xp;
      engine.resurrect(rb, 'rebirth', callbacks());
      assert.equal(rb.xp, xpBefore);
      assert.equal(rb.inventory.some(i => i.itemId === 'scroll_of_rebirth'), false);

      // Cidade: move para zona segura e mantém a caça pausada.
      const huntingZone = Object.keys(zonesModule.ZONES).find(id => !zonesModule.ZONES[id].town);
      const town = freshState({ zone: huntingZone, lastSafeZone: 'talkingIsland', autoResurrect: true });
      engine.playerDeath(town, null, callbacks());
      engine.resurrect(town, 'town', callbacks());
      assert.equal(town.zone, 'talkingIsland');
      assert.equal(town.isCombatActive, false);
    }

  } finally {
    if (server) await server.close();
    for (const [key, value] of previousGlobals) {
      if (value === undefined) delete globalThis[key];
      else globalThis[key] = value;
    }
  }
});
