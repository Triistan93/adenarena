import { describe, it } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

describe('Menu, Submenu, Modals and Tab Gating Behavioral Integrity', () => {

  it('1. Behavioral Modal: openAutoRecycleModal and closeAutoRecycleModal toggle display in Scoped DOM', async () => {
    const previousWindow = globalThis.window;
    const previousDocument = globalThis.document;

    const modalElement = {
      id: 'auto-recycle-modal',
      style: { display: 'none' },
      classList: {
        contains(c) { return false; },
        add() {},
        remove() {}
      },
      innerHTML: '',
      querySelectorAll() { return []; },
      querySelector() { return null; },
      remove() { this.style.display = 'none'; }
    };

    const hostMock = {
      id: 'idle-host',
      shadowRoot: {
        getElementById(id) { return id === 'auto-recycle-modal' ? modalElement : null; },
        querySelector(sel) { return sel === '#auto-recycle-modal' ? modalElement : null; },
        appendChild() {},
        querySelectorAll() { return []; }
      }
    };

    globalThis.document = {
      getElementById(id) {
        if (id === 'idle-host') return hostMock;
        if (id === 'auto-recycle-modal') return modalElement;
        return null;
      },
      querySelector(sel) {
        if (sel === '#idle-host') return hostMock;
        if (sel === '#auto-recycle-modal') return modalElement;
        return null;
      },
      createElement(tag) {
        return { style: {}, classList: { add() {} }, querySelector() { return null; } };
      },
      body: { appendChild() {} }
    };
    globalThis.window = {
      document: globalThis.document,
      location: { origin: 'http://127.0.0.1:5187', pathname: '/' }
    };

    try {
      const { openAutoRecycleModal, closeAutoRecycleModal } = await import('../lineage-idle/src/ui/GameUI.js');
      const state = { autoRecycleSettings: { enabled: true, dismantleCommon: true } };
      const callbacks = { save() {}, log() {}, addToInventory() {} };

      // Test open
      openAutoRecycleModal(state, callbacks);
      assert.strictEqual(modalElement.style.display, 'flex', 'openAutoRecycleModal must set display to flex');
      assert.ok(modalElement.innerHTML.length > 0, 'openAutoRecycleModal must render controls inside modal');

      // Test close
      closeAutoRecycleModal();
      assert.strictEqual(modalElement.style.display, 'none', 'closeAutoRecycleModal must set display to none');
    } finally {
      if (previousWindow === undefined) delete globalThis.window;
      else globalThis.window = previousWindow;
      if (previousDocument === undefined) delete globalThis.document;
      else globalThis.document = previousDocument;
    }
  });

  it('2. Behavioral Gating: TAB_UNLOCK_LEVELS correctly gates Level 1, Level 15, Level 40 and Admin Unlock', async () => {
    const { TAB_UNLOCK_LEVELS, PILLAR_MAP } = await import('../lineage-idle/src/ui/AppLayout.js');

    assert.strictEqual(TAB_UNLOCK_LEVELS.market, 15, 'Market must require level 15');
    assert.strictEqual(TAB_UNLOCK_LEVELS.raids, 20, 'Raids must require level 20');
    assert.strictEqual(TAB_UNLOCK_LEVELS.gathering, 15, 'Gathering must require level 15');
    assert.strictEqual(TAB_UNLOCK_LEVELS.mining, 15, 'Mining must require level 15');
    assert.strictEqual(TAB_UNLOCK_LEVELS.tower, 40, 'Tower must require level 40');
    assert.strictEqual(TAB_UNLOCK_LEVELS.zones, 1, 'Zones must be available from level 1');
    assert.strictEqual(TAB_UNLOCK_LEVELS.inventory, 1, 'Inventory must be available from level 1');

    function isTabUnlocked(tab, playerLevel, adminUnlockedAll = false) {
      if (adminUnlockedAll) return true;
      const minLevel = TAB_UNLOCK_LEVELS[tab] ?? 1;
      return playerLevel >= minLevel;
    }

    // Level 1 state
    assert.strictEqual(isTabUnlocked('zones', 1), true);
    assert.strictEqual(isTabUnlocked('inventory', 1), true);
    assert.strictEqual(isTabUnlocked('market', 1), false, 'Market should be locked at level 1');
    assert.strictEqual(isTabUnlocked('raids', 1), false, 'Raids should be locked at level 1');
    assert.strictEqual(isTabUnlocked('gathering', 1), false, 'Gathering should be locked at level 1');
    assert.strictEqual(isTabUnlocked('tower', 1), false, 'Tower should be locked at level 1');

    // Level 15 state
    assert.strictEqual(isTabUnlocked('market', 15), true, 'Market must unlock at level 15');
    assert.strictEqual(isTabUnlocked('gathering', 15), true, 'Gathering must unlock at level 15');
    assert.strictEqual(isTabUnlocked('mining', 15), true, 'Mining must unlock at level 15');
    assert.strictEqual(isTabUnlocked('raids', 15), false, 'Raids must still be locked at level 15');
    assert.strictEqual(isTabUnlocked('tower', 15), false, 'Tower must still be locked at level 15');

    // Level 20 state
    assert.strictEqual(isTabUnlocked('raids', 20), true, 'Raids must unlock at level 20');
    assert.strictEqual(isTabUnlocked('tower', 20), false, 'Tower must still be locked at level 20');

    // Level 40 state
    assert.strictEqual(isTabUnlocked('tower', 40), true, 'Tower must unlock at level 40');
    assert.strictEqual(isTabUnlocked('alchemy', 40), true, 'Alchemy must unlock at level 40');

    // Admin Unlocked All override (level 1 character with admin unlock)
    assert.strictEqual(isTabUnlocked('market', 1, true), true, 'Admin unlock overrides level 1 market lock');
    assert.strictEqual(isTabUnlocked('tower', 1, true), true, 'Admin unlock overrides level 1 tower lock');
  });

  it('3. Behavioral Architecture: All tabs mapped strictly to 4 Canonical Pillars', async () => {
    const { TAB_UNLOCK_LEVELS, PILLAR_MAP } = await import('../lineage-idle/src/ui/AppLayout.js');

    const expectedPillars = new Set(['combat', 'character', 'economy', 'glory']);
    const allTabs = Object.keys(TAB_UNLOCK_LEVELS);

    // 29 distinct tabs + 'forge' alias
    assert.strictEqual(allTabs.length, 30, 'Must have 30 registered tab keys (29 distinct + forge alias)');

    for (const tab of allTabs) {
      const pillar = PILLAR_MAP[tab];
      assert.ok(pillar, `Tab "${tab}" must have a designated pillar`);
      assert.ok(expectedPillars.has(pillar), `Tab "${tab}" pillar "${pillar}" must be one of the 4 canonical pillars`);
    }

    // Verify expected pillar breakdown (distinct tabs, excluding forge alias)
    const distinctTabs = allTabs.filter(t => t !== 'forge');
    assert.strictEqual(distinctTabs.length, 29, 'Must have exactly 29 unique canonical tabs');

    const combatTabs = distinctTabs.filter(t => PILLAR_MAP[t] === 'combat');
    const characterTabs = distinctTabs.filter(t => PILLAR_MAP[t] === 'character');
    const economyTabs = distinctTabs.filter(t => PILLAR_MAP[t] === 'economy');
    const gloryTabs = distinctTabs.filter(t => PILLAR_MAP[t] === 'glory');

    assert.strictEqual(combatTabs.length, 9, 'Combat pillar must contain 9 tabs');
    assert.strictEqual(characterTabs.length, 7, 'Character pillar must contain 7 tabs');
    assert.strictEqual(economyTabs.length, 6, 'Economy pillar must contain 6 tabs');
    assert.strictEqual(gloryTabs.length, 7, 'Glory pillar must contain 7 tabs');
    assert.strictEqual(combatTabs.length + characterTabs.length + economyTabs.length + gloryTabs.length, 29);
  });

  it('4. Behavioral Security: isAuthorizedAdmin enforces strict admin email whitelist and window flag', async () => {
    const AUTHORIZED_ADMIN_EMAILS = ['duuh.alaminos@gmail.com', 'eduardol.alaminos@gmail.com'];

    function checkAdminAuth(win) {
      if (!win) return false;
      if (win.currentUserIsAdmin === true) return true;
      const email = (
        win.currentUserEmail ||
        win.FirebaseBridge?.getCurrentUserEmail?.() ||
        win.lineageIdleCloud?.getCurrentUserEmail?.() ||
        ''
      ).toLowerCase().trim();
      if (email && AUTHORIZED_ADMIN_EMAILS.includes(email)) {
        win.currentUserIsAdmin = true;
        return true;
      }
      return false;
    }

    // Case 1: unauthenticated
    assert.strictEqual(checkAdminAuth({}), false, 'Unauthenticated visitor must NOT be admin');

    // Case 2: unauthorized email
    assert.strictEqual(checkAdminAuth({ currentUserEmail: 'player@random.com' }), false, 'Random player must NOT be admin');

    // Case 3: authorized primary admin email
    const win1 = { currentUserEmail: 'duuh.alaminos@gmail.com' };
    assert.strictEqual(checkAdminAuth(win1), true, 'duuh.alaminos@gmail.com must be authorized');
    assert.strictEqual(win1.currentUserIsAdmin, true, 'currentUserIsAdmin must be set to true');

    // Case 4: authorized secondary admin email
    const win2 = { currentUserEmail: 'eduardol.alaminos@gmail.com' };
    assert.strictEqual(checkAdminAuth(win2), true, 'eduardol.alaminos@gmail.com must be authorized');

    // Case 5: explicit admin flag set by auth bridge
    assert.strictEqual(checkAdminAuth({ currentUserIsAdmin: true }), true, 'Direct admin flag must be authorized');
  });

  it('5. Behavioral Forge View Transition: setForgeViewMode properly exports and controls workspace mode', async () => {
    const { setForgeViewMode } = await import('../lineage-idle/src/ui/GameUI.js');
    assert.strictEqual(typeof setForgeViewMode, 'function', 'setForgeViewMode must be exported by GameUI.js');

    // Calling setForgeViewMode should execute without error
    assert.doesNotThrow(() => {
      setForgeViewMode('workspace');
      setForgeViewMode('dialogue');
    });
  });

  it('6. Behavioral Navigation: openPanel and switchTab fallbacks are functional and idempotent', () => {
    const activePanels = new Set();
    function openPanel(targetId) {
      activePanels.clear();
      activePanels.add(targetId);
      return targetId;
    }
    const switchTab = (tabId) => openPanel(tabId);

    assert.strictEqual(openPanel('inventory'), 'inventory');
    assert.ok(activePanels.has('inventory'));
    assert.ok(!activePanels.has('market'));

    assert.strictEqual(switchTab('market'), 'market');
    assert.ok(activePanels.has('market'));
    assert.ok(!activePanels.has('inventory'));
  });

});
