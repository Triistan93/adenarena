import { test } from 'node:test';
import assert from 'node:assert/strict';

import { MONSTERS } from '../lineage-idle/src/data/monsters.js';
import { RAID_BOSSES } from '../lineage-idle/src/data/raids.js';
import { ZONES } from '../lineage-idle/src/data/zones.js';
import { ZONE_CONSUMABLES } from '../lineage-idle/src/data/items/recipes_drops.js';
import { SPELLBOOK_ITEMS } from '../lineage-idle/src/data/spellbooks.js';
import { spendSP, getSkillCost, getRequiredBookId } from '../lineage-idle/src/engine/SkillEngine.js';
import { CanonicalClassGraph } from '../lineage-idle/src/data/classes/CanonicalClassGraph.js';
import { CANONICAL_CLASS_REGISTRY } from '../lineage-idle/src/data/classes/CanonicalClassRegistry.js';
import { ClassProgressionEngine } from '../lineage-idle/src/engine/ClassProgressionEngine.js';
import { promoteClass, checkClassAdvancement } from '../lineage-idle/src/services/CharacterService.js';
import { RACES } from '../lineage-idle/src/data/races.js';
import { getStats } from '../lineage-idle/src/engine/StatsEngine.js';
import EventBus from '../lineage-idle/src/core/EventBus.js';

// ---------------------------------------------------------------------------
// 1. Etapa 2 — Drop de Tomos / Spellbooks (1★ a 4★) nas 32 Zonas Existentes
// ---------------------------------------------------------------------------

test('Etapa 2.1 — Drops de Tomos configurados diretamente nos monstros por faixa de nível', () => {
  // Tomo 1★ (D-Grade): Mobs Lv 40–47 (Cruma Tower / Sea of Despair tier)
  const lv40Mobs = Object.values(MONSTERS).filter(m => m.level >= 40 && m.level < 48);
  assert.ok(lv40Mobs.length > 0, 'Existem monstros no tier Lv 40-47');
  for (const mob of lv40Mobs) {
    const bookDrop = mob.drops?.find(d => d.itemId === 'book_1star');
    assert.ok(bookDrop, `Monstro ${mob.id} (Lv ${mob.level}) deve ter drop de book_1star`);
    assert.strictEqual(bookDrop.grade, 'D');
    assert.strictEqual(bookDrop.stars, 1);
  }

  // Tomo 2★ (C-Grade): Mobs Lv 48–55 (Dragon Valley / Enchanted Valley tier)
  const lv48Mobs = Object.values(MONSTERS).filter(m => m.level >= 48 && m.level < 56);
  assert.ok(lv48Mobs.length > 0, 'Existem monstros no tier Lv 48-55');
  for (const mob of lv48Mobs) {
    const bookDrop = mob.drops?.find(d => d.itemId === 'book_2star');
    assert.ok(bookDrop, `Monstro ${mob.id} (Lv ${mob.level}) deve ter drop de book_2star`);
    assert.strictEqual(bookDrop.grade, 'C');
    assert.strictEqual(bookDrop.stars, 2);
  }

  // Tomo 3★ (B-Grade): Mobs Lv 56–75 (Blazing Swamp / Tower of Insolence tier)
  const lv56Mobs = Object.values(MONSTERS).filter(m => m.level >= 56 && m.level < 76);
  assert.ok(lv56Mobs.length > 0, 'Existem monstros no tier Lv 56-75');
  for (const mob of lv56Mobs) {
    const bookDrop = mob.drops?.find(d => d.itemId === 'book_3star');
    assert.ok(bookDrop, `Monstro ${mob.id} (Lv ${mob.level}) deve ter drop de book_3star`);
    assert.strictEqual(bookDrop.grade, 'B');
    assert.strictEqual(bookDrop.stars, 3);
  }

  // Tomo 4★ (A-Grade / Lendário): Mobs Lv 76+ (Forge of the Gods / Endgame tier)
  const lv76Mobs = Object.values(MONSTERS).filter(m => m.level >= 76);
  assert.ok(lv76Mobs.length > 0, 'Existem monstros no tier Lv 76+');
  for (const mob of lv76Mobs) {
    const bookDrop = mob.drops?.find(d => d.itemId === 'book_4star');
    assert.ok(bookDrop, `Monstro ${mob.id} (Lv ${mob.level}) deve ter drop de book_4star`);
    assert.strictEqual(bookDrop.grade, 'A');
    assert.strictEqual(bookDrop.stars, 4);
  }
});

test('Etapa 2.2 — Drops de Tomo 4★ nos Chefes de Raid Canônicos', () => {
  const canonicalRaids = ['queen_ant', 'zaken', 'baium', 'antharas', 'valakas', 'frintezza'];
  for (const rId of canonicalRaids) {
    const raid = RAID_BOSSES[rId];
    assert.ok(raid, `Raid ${rId} deve existir no catálogo de raids`);
    const bookDrop = raid.drops?.find(d => d.itemId === 'book_4star');
    assert.ok(bookDrop, `Raid ${rId} deve ter drop de book_4star`);
    assert.ok(bookDrop.chance >= 0.20, `Chance de book_4star em ${rId} deve ser relevante`);
  }
});

test('Etapa 2.3 — ZONE_CONSUMABLES contém tomos nos tiers correspondentes', () => {
  assert.ok(ZONE_CONSUMABLES.zone3.includes('book_1star'), 'zone3 deve conter book_1star');
  assert.ok(ZONE_CONSUMABLES.zone4.includes('book_2star'), 'zone4 deve conter book_2star');
  assert.ok(ZONE_CONSUMABLES.zone5.includes('book_3star'), 'zone5 deve conter book_3star');
  assert.ok(ZONE_CONSUMABLES.zone6.includes('book_4star'), 'zone6 deve conter book_4star');
  assert.ok(ZONE_CONSUMABLES.zone7.includes('book_4star'), 'zone7 deve conter book_4star');

  assert.ok(ZONE_CONSUMABLES.blackCitadel.includes('book_1star'), 'blackCitadel deve conter book_1star');
  assert.ok(ZONE_CONSUMABLES.wolfMountain.includes('book_2star'), 'wolfMountain deve conter book_2star');
  assert.ok(ZONE_CONSUMABLES.emeraldGrove.includes('book_3star'), 'emeraldGrove deve conter book_3star');
  assert.ok(ZONE_CONSUMABLES.forgeOfGods.includes('book_4star'), 'forgeOfGods deve conter book_4star');

  // Alinhamento exaustivo das zonas canônicas
  assert.ok(ZONE_CONSUMABLES.forsakenCrypt.includes('book_1star'), 'forsakenCrypt deve conter book_1star');
  assert.ok(ZONE_CONSUMABLES.gludioCastle.includes('book_2star'), 'gludioCastle deve conter book_2star');
  assert.ok(ZONE_CONSUMABLES.riftOfTheVoid.includes('book_3star'), 'riftOfTheVoid deve conter book_3star');
  assert.ok(ZONE_CONSUMABLES.swampOfScreams.includes('book_4star'), 'swampOfScreams deve conter book_4star');
});

// Ensure Window & EchoData are initialized in Node test environment
if (typeof window === 'undefined') {
  global.window = {};
}
await import('../lineage-idle/data/echo-adapter.js');

test('Etapa 2.4 — Validação e consumo de Tomos no SkillEngine.js (1★ a 4★)', () => {
  // 1. Skill 4★ (sagittarius_transcendent_seven_arrow / legendary_archer, Lv 76+) exige book_4star
  const stateNoBook = {
    class: 'sagittarius',
    race: 'human',
    level: 80,
    sp: 2000,
    skills: {},
    inventory: []
  };
  const failResult = spendSP(stateNoBook, 'sagittarius_transcendent_seven_arrow');
  assert.strictEqual(failResult, false, 'Deve recusar desbloquear skill 4★ sem book_4star');
  assert.strictEqual(stateNoBook.skills.sagittarius_transcendent_seven_arrow, undefined);

  // Com book_4star no inventário
  const stateWithBook = {
    class: 'sagittarius',
    race: 'human',
    level: 80,
    sp: 2000,
    skills: {},
    inventory: [
      { uid: 'book_item_4', itemId: 'book_4star', count: 1 }
    ]
  };
  const successResult = spendSP(stateWithBook, 'sagittarius_transcendent_seven_arrow');
  assert.strictEqual(successResult, true, 'Deve desbloquear skill 4★ com book_4star');
  assert.strictEqual(stateWithBook.skills.sagittarius_transcendent_seven_arrow, 1);
  assert.strictEqual(stateWithBook.inventory.length, 0, 'Tomo deve ser consumido do inventário');

  // Com alias spellbook_4star
  const stateWithSpellbookAlias = {
    class: 'sagittarius',
    race: 'human',
    level: 80,
    sp: 2000,
    skills: {},
    inventory: [
      { uid: 'spellbook_item_4', itemId: 'spellbook_4star', count: 2 }
    ]
  };
  const aliasResult = spendSP(stateWithSpellbookAlias, 'sagittarius_transcendent_seven_arrow');
  assert.strictEqual(aliasResult, true, 'Deve aceitar alias spellbook_4star');
  assert.strictEqual(stateWithSpellbookAlias.inventory[0].count, 1, 'Deve decrementar quantidade empilhada');

  // 2. Skill 3★ (paladin_majesty, Lv 40+) exige book_3star
  const statePaladinNoBook = {
    class: 'paladin',
    race: 'human',
    level: 40,
    sp: 1000,
    skills: {},
    inventory: []
  };
  assert.strictEqual(spendSP(statePaladinNoBook, 'paladin_majesty'), false, 'Deve recusar 3★ sem book_3star');

  const statePaladinWithBook = {
    class: 'paladin',
    race: 'human',
    level: 40,
    sp: 1000,
    skills: {},
    inventory: [{ uid: 'b3', itemId: 'book_3star', count: 1 }]
  };
  assert.strictEqual(spendSP(statePaladinWithBook, 'paladin_majesty'), true, 'Deve desbloquear 3★ com book_3star');
  assert.strictEqual(statePaladinWithBook.skills.paladin_majesty, 1);
  assert.strictEqual(statePaladinWithBook.inventory.length, 0);

  // 3. Skill 2★ (paladin_shield_stun, Lv 40+) exige book_2star
  const statePaladin2NoBook = {
    class: 'paladin',
    race: 'human',
    level: 40,
    sp: 1000,
    skills: {},
    inventory: []
  };
  assert.strictEqual(spendSP(statePaladin2NoBook, 'paladin_shield_stun'), false, 'Deve recusar 2★ sem book_2star');

  const statePaladin2WithBook = {
    class: 'paladin',
    race: 'human',
    level: 40,
    sp: 1000,
    skills: {},
    inventory: [{ uid: 'b2', itemId: 'book_2star', count: 1 }]
  };
  assert.strictEqual(spendSP(statePaladin2WithBook, 'paladin_shield_stun'), true, 'Deve desbloquear 2★ com book_2star');
  assert.strictEqual(statePaladin2WithBook.skills.paladin_shield_stun, 1);

  // 4. Skill 1★ (warlord_provoke, Lv 40+) exige book_1star
  const stateWarlordNoBook = {
    class: 'warlord',
    race: 'human',
    level: 40,
    sp: 500,
    skills: {},
    inventory: []
  };
  assert.strictEqual(spendSP(stateWarlordNoBook, 'warlord_provoke'), false, 'Deve recusar 1★ sem book_1star');

  const stateWarlordWithBook = {
    class: 'warlord',
    race: 'human',
    level: 40,
    sp: 500,
    skills: {},
    inventory: [{ uid: 'b1', itemId: 'book_1star', count: 1 }]
  };
  assert.strictEqual(spendSP(stateWarlordWithBook, 'warlord_provoke'), true, 'Deve desbloquear 1★ com book_1star');
  assert.strictEqual(stateWarlordWithBook.skills.warlord_provoke, 1);
  assert.strictEqual(stateWarlordWithBook.inventory.length, 0);

  // 5. Skill sem livro (knight_shield_strike, Lv 20) não consome nem exige livro
  const stateKnight = {
    class: 'knight',
    race: 'human',
    level: 20,
    sp: 500,
    skills: {},
    inventory: []
  };
  assert.strictEqual(spendSP(stateKnight, 'knight_shield_strike'), true, 'Skill básica não exige livro');
  assert.strictEqual(stateKnight.skills.knight_shield_strike, 1);
});

// ---------------------------------------------------------------------------
// 2. Etapa 3 — Sistema & Interface de Class Transfer (1ª, 2ª e 3ª Transferência)
// ---------------------------------------------------------------------------

test('Etapa 3.1 — CanonicalClassGraph integridade estrutural (9 Raças, 49 Linhagens, 159 Classes)', () => {
  assert.strictEqual(CanonicalClassGraph.getNodesCount(), 159, 'Grafo deve conter exatamente 159 classes');
  assert.strictEqual(CanonicalClassGraph.getRootNodesCount(), 25, 'Grafo deve conter 25 classes base (Stage 0)');
  assert.strictEqual(CanonicalClassGraph.getTerminalNodesCount(), 49, 'Grafo deve conter 49 classes terminais (Stage 3)');

  const expectedRaces = ['human', 'elf', 'darkelf', 'orc', 'dwarf', 'kamael', 'sylph', 'highelf', 'ertheia'];
  for (const race of expectedRaces) {
    const roots = CanonicalClassGraph.getBaseClassesForRace(race);
    assert.ok(roots.length > 0, `Raça ${race} deve possuir ao menos uma classe base no grafo`);
  }
});

test('Etapa 3.2 — ClassProgressionEngine: 1ª Transferência (Lv 20), 2ª Transferência (Lv 40), 3ª Transferência (Lv 76)', () => {
  // Teste de progressão Human Fighter -> Warrior -> Gladiator -> Duelist
  // 1ª Troca: Lv 20
  const optLv20 = ClassProgressionEngine.getPromotionOptions('fighter', 20, 'human');
  assert.ok(optLv20.some(o => o.targetClass.id === 'warrior' && o.isEligible), 'Fighter no Lv 20 pode evoluir para Warrior');
  assert.ok(optLv20.some(o => o.targetClass.id === 'knight' && o.isEligible), 'Fighter no Lv 20 pode evoluir para Knight');

  // Rejeição antes do nível mínimo (Lv 19)
  const optLv19 = ClassProgressionEngine.getPromotionOptions('fighter', 19, 'human');
  assert.ok(optLv19.every(o => !o.isEligible), 'Nenhum avanço elegível no nível 19');

  // 2ª Troca: Lv 40 (Warrior -> Gladiator / Warlord)
  const optLv40 = ClassProgressionEngine.getPromotionOptions('warrior', 40, 'human');
  assert.ok(optLv40.some(o => o.targetClass.id === 'gladiator' && o.isEligible), 'Warrior no Lv 40 pode evoluir para Gladiator');
  assert.ok(optLv40.some(o => o.targetClass.id === 'warlord' && o.isEligible), 'Warrior no Lv 40 pode evoluir para Warlord');

  // 3ª Troca: Lv 76 (Gladiator -> Duelist)
  const optLv76 = ClassProgressionEngine.getPromotionOptions('gladiator', 76, 'human');
  assert.ok(optLv76.some(o => o.targetClass.id === 'duelist' && o.isEligible), 'Gladiator no Lv 76 pode evoluir para Duelist (3rd Transfer)');

  // canPromote verificação estrita
  assert.strictEqual(ClassProgressionEngine.canPromote('fighter', 'warrior', 20, 'human').canPromote, true);
  assert.strictEqual(ClassProgressionEngine.canPromote('fighter', 'gladiator', 20, 'human').canPromote, false, 'Não pode pular estágios');
  assert.strictEqual(ClassProgressionEngine.canPromote('warrior', 'gladiator', 40, 'human').canPromote, true);
  assert.strictEqual(ClassProgressionEngine.canPromote('gladiator', 'duelist', 76, 'human').canPromote, true);
});

test('Etapa 3.3 — Cobertura completa de todas as 49 linhagens em todas as 9 raças até a 3ª Transferência', () => {
  const allNodes = CanonicalClassGraph.getAllClassNodes();
  const stage2Classes = allNodes.filter(n => n.stage === 2);
  assert.strictEqual(stage2Classes.length, 49, 'Devem existir exatamente 49 classes de 2ª transferência (Stage 2)');

  for (const s2 of stage2Classes) {
    const promotions = ClassProgressionEngine.getPromotionOptions(s2.id, 76, s2.race);
    assert.ok(promotions.length > 0, `Classe Stage 2 [${s2.id}] (${s2.race}) deve ter opções de 3ª transferência no Lv 76`);
    const available3rd = promotions.find(p => p.isEligible && p.targetClass.stage === 3);
    assert.ok(available3rd, `Classe [${s2.id}] deve possuir sucessor de 3rd Job elegível`);
  }
});

test('Etapa 3.4 — executeClassTransfer & promoteClass: Atualização de state.character.classId, recalcular status e Idempotência', () => {
  let eventDispatched = false;
  const unsubscribe = EventBus.on('classTransferred', (data) => {
    if (data.newClass === 'warrior' || data.newClass === 'gladiator') {
      eventDispatched = true;
    }
  });

  const state = {
    class: 'fighter',
    className: 'Human Fighter',
    level: 40,
    race: 'human',
    character: { classId: 'fighter', className: 'Human Fighter', race: 'human' },
    skills: { power_strike: 2 },
    stats: {},
    hp: 100,
    mp: 50,
    maxHp: 100,
    maxMp: 50
  };

  // 1. Executa transferência via ClassProgressionEngine
  const executed = ClassProgressionEngine.executeClassTransfer(state, 'warrior');
  assert.strictEqual(executed, true, 'executeClassTransfer deve retornar true');
  assert.strictEqual(state.class, 'warrior');
  assert.strictEqual(state.className, 'Warrior');
  assert.strictEqual(state.character.classId, 'warrior');
  assert.strictEqual(state.character.className, 'Warrior');
  assert.ok(state.maxHp > 0, 'Status recalculados via StatsEngine');
  assert.strictEqual(eventDispatched, true, 'EventBus classTransferred deve ter sido emitido');

  // 2. Idempotência estrita em ClassProgressionEngine
  const reExecuted = ClassProgressionEngine.executeClassTransfer(state, 'warrior');
  assert.strictEqual(reExecuted, true, 'Re-executar mesma transferência deve ser idempotente');
  assert.strictEqual(state.class, 'warrior');

  // 3. Executa 2ª transferência via CharacterService.promoteClass
  eventDispatched = false;
  let uiUpdated = false;
  let skillUiUpdated = false;
  let saved = false;

  const promoted = promoteClass(state, 'gladiator', null, {
    updateAllUI: () => { uiUpdated = true; },
    updateSkillUI: () => { skillUiUpdated = true; },
    save: () => { saved = true; },
    log: () => {},
    floatText: () => {}
  });

  assert.strictEqual(promoted, true, 'promoteClass deve retornar true');
  assert.strictEqual(state.class, 'gladiator');
  assert.strictEqual(state.className, 'Gladiator');
  assert.strictEqual(state.character.classId, 'gladiator');
  assert.strictEqual(state.character.className, 'Gladiator');
  assert.strictEqual(uiUpdated, true, 'updateAllUI deve ter sido disparado imediatamente');
  assert.strictEqual(skillUiUpdated, true, 'updateSkillUI deve ter sido chamado para atualizar árvore de habilidades');
  assert.strictEqual(saved, true, 'save deve ter sido invocado');
  assert.strictEqual(eventDispatched, true, 'EventBus classTransferred emitido na promoção');

  // 4. Idempotência estrita em CharacterService.promoteClass
  const rePromoted = promoteClass(state, 'gladiator', null, {
    log: () => {},
    floatText: () => {}
  });
  assert.strictEqual(rePromoted, true, 'promoteClass repetido na mesma classe deve ser idempotente');
  assert.strictEqual(state.class, 'gladiator');

  unsubscribe();
});

test('Etapa 2.5 — Cobertura exaustiva de todas as 32 Zonas Canônicas e integridade de drops', () => {
  const zoneKeys = Object.keys(ZONES);
  assert.strictEqual(zoneKeys.length, 32, 'Devem existir exatamente 32 zonas canônicas');

  for (const [zoneId, zone] of Object.entries(ZONES)) {
    // 1. Cada zona deve estar mapeada em ZONE_CONSUMABLES
    assert.ok(ZONE_CONSUMABLES[zoneId], `Zona [${zoneId}] deve estar mapeada em ZONE_CONSUMABLES`);

    // 2. Todos os monstros da zona devem possuir tomos estritamente de acordo com seu nível
    const allMobIds = [...(zone.monsters || []), zone.boss].filter(Boolean);
    for (const mobId of allMobIds) {
      const mob = MONSTERS[mobId];
      assert.ok(mob, `Monstro ${mobId} da zona ${zoneId} deve existir em MONSTERS`);

      if (mob.level >= 76) {
        const drop = mob.drops?.find(d => d.itemId === 'book_4star');
        assert.ok(drop, `${mob.id} (Lv ${mob.level}) deve dropar book_4star`);
        assert.strictEqual(drop.stars, 4);
      } else if (mob.level >= 56) {
        const drop = mob.drops?.find(d => d.itemId === 'book_3star');
        assert.ok(drop, `${mob.id} (Lv ${mob.level}) deve dropar book_3star`);
        assert.strictEqual(drop.stars, 3);
      } else if (mob.level >= 48) {
        const drop = mob.drops?.find(d => d.itemId === 'book_2star');
        assert.ok(drop, `${mob.id} (Lv ${mob.level}) deve dropar book_2star`);
        assert.strictEqual(drop.stars, 2);
      } else if (mob.level >= 40) {
        const drop = mob.drops?.find(d => d.itemId === 'book_1star');
        assert.ok(drop, `${mob.id} (Lv ${mob.level}) deve dropar book_1star`);
        assert.strictEqual(drop.stars, 1);
      } else {
        // Monstros abaixo do nível 40 NUNCA dropam livros de magia
        const hasBook = mob.drops?.some(d => d.itemId?.startsWith('book_'));
        assert.strictEqual(hasBook, false, `${mob.id} (Lv ${mob.level}) abaixo do Lv 40 não pode dropar livros`);
      }
    }
  }
});

test('Etapa 2.6 — Robustez de consumo de Tomos no SkillEngine.js (string bookRequirement, sem UID, mock callbacks)', () => {
  // 1. Skill com string bookRequirement: 'ULTIMATE_BOOK_4'
  const prevDef = window.EchoData.SKILL_DEFS_ECHO['titanbreaker'];
  const testDef = { ...prevDef, requiredItemToUnlock: undefined, bookRequirement: 'ULTIMATE_BOOK_4' };
  window.EchoData.SKILL_DEFS_ECHO['titanbreaker'] = testDef;

  const stateUltimate = {
    class: 'human_fighter',
    race: 'human',
    level: 80,
    sp: 2000,
    skills: {},
    inventory: []
  };

  try {
    assert.strictEqual(spendSP(stateUltimate, 'titanbreaker'), false, 'Deve recusar skill ULTIMATE_BOOK_4 sem book_4star');
    stateUltimate.inventory.push({ itemId: 'book_4star', count: 1 });
    assert.strictEqual(spendSP(stateUltimate, 'titanbreaker'), true, 'Deve desbloquear skill com book_4star');
    assert.strictEqual(stateUltimate.skills['titanbreaker'], 1);
    assert.strictEqual(stateUltimate.inventory.length, 0);
  } finally {
    window.EchoData.SKILL_DEFS_ECHO['titanbreaker'] = prevDef;
  }

  // 2. Item no inventário SEM propriedade `uid`
  const stateNoUid = {
    class: 'paladin',
    race: 'human',
    level: 40,
    sp: 1000,
    skills: {},
    inventory: [{ itemId: 'book_2star', count: 1 }]
  };
  let customRemoved = false;
  const resultNoUid = spendSP(stateNoUid, 'paladin_shield_stun', {
    removeFromInventory: (uid, count) => {
      customRemoved = true;
      const idx = stateNoUid.inventory.findIndex(i => i.uid === uid);
      if (idx >= 0) stateNoUid.inventory.splice(idx, 1);
      return true;
    }
  });
  assert.strictEqual(resultNoUid, true, 'Deve consumir livro mesmo quando item original não possuía uid');
  assert.strictEqual(stateNoUid.skills.paladin_shield_stun, 1);
  assert.strictEqual(stateNoUid.inventory.length, 0);
  assert.strictEqual(customRemoved, true);

  // 3. Callback de remoção mock que retorna true sem mutar array diretamente
  const stateMockCb = {
    class: 'warlord',
    race: 'human',
    level: 40,
    sp: 1000,
    skills: {},
    inventory: [{ uid: 'b1_test', itemId: 'book_1star', count: 2 }]
  };
  const resultMockCb = spendSP(stateMockCb, 'warlord_provoke', {
    removeFromInventory: () => true // Mock stub que não muta
  });
  assert.strictEqual(resultMockCb, true, 'Deve lidar com mock callbacks garantindo decremento no state.inventory');
  assert.strictEqual(stateMockCb.skills.warlord_provoke, 1);
  assert.strictEqual(stateMockCb.inventory[0].count, 1, 'Deve decrementar o item com segurança');
});

test('Etapa 3.5 — ClassProgressionEngine.executeClassTransfer atualiza state.base com atributos da raça e classe', () => {
  const state = {
    class: 'fighter',
    level: 20,
    race: 'human',
    character: { classId: 'fighter', race: 'human' },
    skills: {},
    base: { atk: 0, def: 0, eva: 0, matk: 0, mdef: 0 },
    stats: {},
    hp: 100,
    mp: 50
  };

  const ok = ClassProgressionEngine.executeClassTransfer(state, 'warrior');
  assert.strictEqual(ok, true);
  assert.strictEqual(state.class, 'warrior');
  assert.strictEqual(typeof state.base.atk, 'number');
  assert.strictEqual(typeof state.base.def, 'number');
  assert.ok(state.base.eva >= 5, 'state.base.eva deve incluir bônus base de classe');
  assert.ok(state.maxHp > 0, 'state.maxHp recalculado');
});

test('Etapa 3.6 — checkClassAdvancement reatividade, banner e suporte a state.character.classId', () => {
  let modalOpened = false;
  let bannerDisplayed = null;
  let statsBtnDisplayed = null;

  const mockDom = {
    'stats-class-adv-btn': { style: {}, textContent: '', onclick: null },
    'class-advancement-banner': { style: {}, textContent: '' },
    'class-advancement-title': { textContent: '' },
    'class-advancement-sub': { textContent: '' },
    'class-advancement-btn': { onclick: null },
    'skills-class-adv-banner': { style: {} },
    'skills-class-adv-title': { textContent: '' },
    'skills-class-adv-sub': { textContent: '' },
    'skills-class-adv-btn': { onclick: null }
  };

  const callbacks = {
    el: (id) => mockDom[id] || null,
    openClassTransferModal: () => { modalOpened = true; }
  };

  // 1. Personagem Lv 20 em Stage 0 (elegível para 1ª Troca)
  const stateLv20 = {
    level: 20,
    character: { classId: 'fighter', race: 'human' } // state.class ausente, usando character.classId
  };
  checkClassAdvancement(stateLv20, callbacks);
  assert.strictEqual(mockDom['stats-class-adv-btn'].style.display, 'block');
  assert.ok(mockDom['stats-class-adv-btn'].textContent.includes('1ª Troca'));
  assert.strictEqual(mockDom['class-advancement-banner'].style.display, 'flex');

  // Clica no botão e valida abertura do modal
  mockDom['stats-class-adv-btn'].onclick();
  assert.strictEqual(modalOpened, true);

  // 2. Personagem Lv 19 (não elegível)
  const stateLv19 = {
    level: 19,
    class: 'fighter',
    character: { classId: 'fighter', race: 'human' }
  };
  checkClassAdvancement(stateLv19, callbacks);
  assert.strictEqual(mockDom['stats-class-adv-btn'].style.display, 'none');
  assert.strictEqual(mockDom['class-advancement-banner'].style.display, 'none');

  // 3. Ao promover classe via promoteClass, checkClassAdvancement fecha o banner
  modalOpened = false;
  const statePromote = {
    level: 20,
    class: 'fighter',
    character: { classId: 'fighter', race: 'human' },
    skills: {},
    stats: {}
  };
  checkClassAdvancement(statePromote, callbacks);
  assert.strictEqual(mockDom['stats-class-adv-btn'].style.display, 'block');

  // Promove para Warrior (Stage 1). Como ainda está no Lv 20, não é elegível para Stage 2 (Lv 40)
  promoteClass(statePromote, 'warrior', null, {
    el: callbacks.el,
    updateAllUI: () => {},
    updateSkillUI: () => {},
    save: () => {}
  });
  // Banner e botão de status devem ter sido ocultados automaticamente pós-promoção
  assert.strictEqual(mockDom['stats-class-adv-btn'].style.display, 'none');
  assert.strictEqual(mockDom['class-advancement-banner'].style.display, 'none');
});

test('Etapa 3.7 — ClassProgressionEngine: Opções inelegíveis retornam isEligible: false e motivos informativos', () => {
  // Fighter Lv 15
  const options = ClassProgressionEngine.getPromotionOptions('fighter', 15, 'human');
  assert.ok(options.length > 0);
  for (const opt of options) {
    assert.strictEqual(opt.isEligible, false, 'Opção não pode ser elegível no nível 15');
    assert.ok(opt.reasons.length > 0, 'Deve conter ao menos um motivo explicativo');
    assert.ok(opt.reasons[0].includes('Nível insuficiente'), 'Motivo deve citar nível');
  }

  // Raça incompatível
  const optionsWrongRace = ClassProgressionEngine.getPromotionOptions('fighter', 20, 'orc');
  assert.ok(optionsWrongRace.every(o => !o.isEligible), 'Fighter humano não é elegível para orc');
});

test('Etapa 3.8 — ClassProgressionEngine resolve IDs runtime camelCase para raças não-humanas (Dwarf, Elf, Dark Elf, Kamael, Sylph)', () => {
  // Anão Fighter Lv 20 -> Scavenger & Artisan
  const dwarfFighterOpts = ClassProgressionEngine.getPromotionOptions('dwarfFighter', 20, 'dwarf');
  const dwarfTargets = dwarfFighterOpts.map(o => o.targetClass.id);
  assert.ok(dwarfTargets.includes('scavenger'), 'dwarfFighter deve poder avançar para scavenger');
  assert.ok(dwarfTargets.includes('artisan'), 'dwarfFighter deve poder avançar para artisan');

  // Artisan Lv 40 -> Warsmith
  const artisanOpts = ClassProgressionEngine.getPromotionOptions('artisanDwarf', 40, 'dwarf');
  const artisanTargets = artisanOpts.map(o => o.targetClass.id);
  assert.ok(artisanTargets.includes('warsmith'), 'artisanDwarf deve poder avançar para warsmith');

  // Elfo Knight Lv 40 -> Temple Knight & Swordsinger
  const elfKnightOpts = ClassProgressionEngine.getPromotionOptions('elvenKnight', 40, 'elf');
  const elfTargets = elfKnightOpts.map(o => o.targetClass.id);
  assert.ok(elfTargets.includes('temple_knight'), 'elvenKnight deve poder avançar para temple_knight');
  assert.ok(elfTargets.includes('swordsinger'), 'elvenKnight deve poder avançar para swordsinger');

  // Dark Elf Palus Knight Lv 40 -> Shillien Knight & Blade Dancer
  const palusKnightOpts = ClassProgressionEngine.getPromotionOptions('palusKnight', 40, 'dark_elf');
  const palusTargets = palusKnightOpts.map(o => o.targetClass.id);
  assert.ok(palusTargets.includes('shillien_knight'), 'palusKnight deve poder avançar para shillien_knight');
  assert.ok(palusTargets.includes('bladedancer'), 'palusKnight deve poder avançar para bladedancer');

  // Kamael Soldier Lv 20 -> Trooper & Warder
  const kamaelOpts = ClassProgressionEngine.getPromotionOptions('kamaelSoldier', 20, 'kamael');
  const kamaelTargets = kamaelOpts.map(o => o.targetClass.id);
  assert.ok(kamaelTargets.includes('trooper'), 'kamaelSoldier deve poder avançar para trooper');
  assert.ok(kamaelTargets.includes('warder'), 'kamaelSoldier deve poder avançar para warder');

  // Sylph starter (sylphid) Lv 20 -> Sharpshooter (sylph_gunner)
  const sylphLv20Opts = ClassProgressionEngine.getPromotionOptions('sylphid', 20, 'sylph');
  const sylphLv20Targets = sylphLv20Opts.map(o => o.targetClass.id);
  assert.ok(sylphLv20Targets.includes('sylph_gunner'), 'sylphid deve poder avançar para sylph_gunner');

  // Sylph Gunner (sylph_gunner) Lv 40 -> Wind Sniper (wind_hunter)
  const sylphOpts = ClassProgressionEngine.getPromotionOptions('sylph_gunner', 40, 'sylph');
  const sylphTargets = sylphOpts.map(o => o.targetClass.id);
  assert.ok(sylphTargets.includes('wind_hunter'), 'sylph_gunner deve poder avançar para wind_hunter');
});

test('Etapa 2.7 — spendSP aborta atomicamente quando callbacks.removeFromInventory retorna false', () => {
  const state = {
    class: 'sagittarius',
    race: 'human',
    level: 80,
    sp: 2000,
    skills: { legendary_archer: 0 },
    inventory: [
      { uid: 'book_leg_fail', itemId: 'book_4star', count: 1 }
    ]
  };

  let callbackCalled = false;
  const result = spendSP(state, 'legendary_archer', {
    log: () => {},
    removeFromInventory: (uid, count) => {
      callbackCalled = true;
      return false; // Callback rejeita consumo explicitamente
    }
  });

  assert.strictEqual(callbackCalled, true, 'removeFromInventory deve ser invocado');
  assert.strictEqual(result, false, 'spendSP deve falhar e retornar false');
  assert.strictEqual(state.sp, 2000, 'SP não deve ser consumido');
  assert.strictEqual(state.skills.legendary_archer, 0, 'Habilidade não deve subir de nível');
  assert.strictEqual(state.inventory[0].count, 1, 'Livro não deve ser consumido');
});

test('Etapa 2.8 — getRequiredBookId processa objetos e campos sem disparar TypeError: startsWith', () => {
  // String
  assert.strictEqual(getRequiredBookId({ bookRequirement: 'book_1star' }), 'book_1star');
  assert.strictEqual(getRequiredBookId({ bookRequirement: 'ULTIMATE_BOOK_4' }), 'book_4star');

  // Object
  assert.strictEqual(getRequiredBookId({ requiredItemToUnlock: { itemId: 'book_3star' } }), 'book_3star');
  assert.strictEqual(getRequiredBookId({ bookRequirement: { id: 'book_2star' } }), 'book_2star');
  assert.strictEqual(getRequiredBookId({ bookRequirement: { stars: 4 } }), 'book_4star');

  // StarRank / Tier fallback
  assert.strictEqual(getRequiredBookId({ starRank: 4, reqLvl: 76 }), 'book_4star');
  assert.strictEqual(getRequiredBookId({ tier: 2 }), 'book_2star');
  assert.strictEqual(getRequiredBookId({ starRank: 1, reqLvl: 40 }), 'book_1star');
  assert.strictEqual(getRequiredBookId({ starRank: 1, reqLvl: 20 }), null);
});

