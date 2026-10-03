import { test } from 'node:test';
import assert from 'node:assert/strict';

import { DEFAULT_STATE, applyStarterKit } from '../lineage-idle/src/core/StateManager.js';
import { startCombat, stopCombat } from '../lineage-idle/src/engine/CombatEngine.js';
import { equipItem, unequipItem } from '../lineage-idle/src/services/EquipmentService.js';
import { getStats } from '../lineage-idle/src/engine/StatsEngine.js';
import { ALL_ITEMS } from '../lineage-idle/src/data/items/index.js';
import { addToInventory } from '../lineage-idle/src/services/InventoryService.js';
import { NextActionAdvisor } from '../lineage-idle/src/services/NextActionAdvisor.js';

// Inicializa GameData no escopo de teste para resolver itens em D()
globalThis.GameData = { ALL_ITEMS };
if (typeof window === 'undefined') {
  globalThis.window = { GameData: globalThis.GameData };
}

test('Etapa 1 — Passo 1: Novo personagem é criado com combate pausado e kit inicial correto', () => {
  const state = DEFAULT_STATE();
  applyStarterKit(state, 'human', 'fighter', 'AventureiroAden', 'M');

  // 1. Zona inicial e combate pausado por consentimento
  assert.equal(state.zone, 'talkingIsland', 'Novo personagem deve iniciar em Talking Island');
  assert.equal(state.isCombatActive, false, 'Combate DEVE iniciar rigorosamente pausado');
  assert.equal(!state.activeMonster, true, 'Nenhum monstro ativo antes da ação do jogador');

  // 2. Recursos e atributos iniciais
  assert.equal(state.level, 1, 'Nível inicial deve ser 1');
  assert.equal(state.xp, 0, 'XP inicial deve ser 0');
  assert.ok(state.hp > 0, 'HP inicial deve ser positivo');
  assert.ok(state.maxHp > 0, 'Max HP deve ser calculado');

  // 3. Mochila e equipamento inicial
  assert.ok(Array.isArray(state.inventory), 'Inventário deve ser um array');
  assert.ok(state.inventory.length > 0, 'Kit inicial deve conceder itens básicos');
  assert.ok(state.equipment.weapon, 'Arma inicial deve estar equipada');

  const weaponUid = state.equipment.weapon;
  const equippedWeapon = state.inventory.find(i => i.uid === weaponUid);
  assert.ok(equippedWeapon, 'Arma equipada deve existir no inventário');
  assert.equal(equippedWeapon.equipped, true, 'Item equipado deve ter flag equipped: true');

  const firstGoal = NextActionAdvisor.getAdvice(state);
  assert.equal(firstGoal.category, 'MILESTONE', 'o novo jogador deve receber um objetivo inicial acionável');
  assert.equal(firstGoal.actionType, 'NAVIGATE', 'o primeiro objetivo deve ter uma ação de navegação');
  assert.equal(firstGoal.actionTab, 'zones', 'o primeiro objetivo deve levar às zonas de caça disponíveis');
  assert.match(firstGoal.targetName, /1ª Troca de Classe/, 'o objetivo deve explicar o próximo marco de progressão');
});

test('Etapa 1 — onboarding de mago concede equipamento e consumíveis mágicos corretos', () => {
  const state = DEFAULT_STATE();
  applyStarterKit(state, 'human', 'mage', 'AventureiraArcana', 'F');

  assert.equal(state.race, 'human');
  assert.equal(state.class, 'mage');
  assert.equal(state.level, 1);
  assert.equal(state.zone, 'talkingIsland');
  assert.equal(state.isCombatActive, false);

  const equippedWeapon = state.inventory.find(item => item.uid === state.equipment.weapon);
  const equippedArmor = state.inventory.find(item => item.uid === state.equipment.armor);
  assert.equal(equippedWeapon?.itemId, 'weapon_crucifix_of_blessing_magicblunt');
  assert.equal(equippedArmor?.itemId, 'armor_devotion_armor_robe');
  assert.equal(equippedWeapon?.equipped, true);
  assert.equal(equippedArmor?.equipped, true);
  assert.ok(state.inventory.some(item => item.itemId === 'spiritshot_ng' && item.count >= 500),
    'o kit mágico deve incluir Spiritshots No-Grade');
  assert.ok(state.inventory.some(item => item.itemId === 'mp_potion_s' && item.count > 0),
    'o kit mágico deve incluir poções de mana');
  assert.ok(state.maxHp > 0 && state.maxMp > 0, 'o novo mago deve iniciar com vida e mana calculadas');
});

test('Etapa 1 — Passo 2: Combate só começa após consentimento e gera um monstro válido', () => {
  const state = DEFAULT_STATE();
  applyStarterKit(state, 'human', 'fighter', 'ConsentFighter', 'M');

  const logs = [];
  const callbacks = {
    log: (msg, type) => logs.push({ msg, type }),
    updateAllUI: () => {},
    save: () => {}
  };

  // Jogador clica conscientemente para iniciar combate
  startCombat(state, callbacks);

  assert.equal(state.isCombatActive, true, 'Combate agora deve estar ativo');
  assert.ok(state.activeMonster, 'Monstro deve ser spawnado na zona');
  assert.ok(state.activeMonster.hp > 0, 'Monstro deve possuir HP');
  assert.equal(state.activeMonster.isTower || false, false, 'Não deve ser monstro de torre');

  stopCombat(state);
  assert.equal(state.isCombatActive, false, 'stopCombat deve pausar o ciclo de combate');
});

test('Etapa 1 — Passo 3: Drop de equipamento, inventário e recálculo de atributos ao equipar', () => {
  const state = DEFAULT_STATE();
  applyStarterKit(state, 'human', 'fighter', 'GearFighter', 'M');

  // Drop simulado de um item de equipamento comum existente no catálogo (Knight Sword)
  const dropItemDef = ALL_ITEMS['knight_sword'];
  assert.ok(dropItemDef, 'Item knight_sword deve existir no catálogo ALL_ITEMS');

  // Adiciona ao inventário
  const added = addToInventory(state, 'knight_sword', 1, 'common', false, {}, true);
  assert.equal(added, true, 'addToInventory deve retornar true');

  const droppedItem = state.inventory.find(i => i.itemId === 'knight_sword' && !i.equipped);
  assert.ok(droppedItem, 'Item dropado deve estar na mochila');
  assert.equal(droppedItem.equipped, false, 'Item novo na mochila inicia não equipado');

  const dropUid = droppedItem.uid;

  // Equipar o item dropado na arma
  equipItem(state, dropUid, 'weapon');

  assert.equal(droppedItem.equipped, true, 'Item deve constar como equipado');
  assert.equal(state.equipment.weapon, dropUid, 'Slot de arma deve apontar para o novo item');

  // Validação do recálculo de atributos via StatsEngine
  const updatedStats = getStats(state);
  assert.ok(updatedStats.atk > 0, 'StatsEngine deve calcular P.Atk (atk > 0)');
  assert.ok(updatedStats.def > 0, 'StatsEngine deve calcular P.Def (def > 0)');
  assert.ok(updatedStats.combatPower > 0, 'Combat Power deve ser calculado');
  assert.ok(state.maxHp > 0, 'Max HP deve ser mantido ou expandido');

  // Desequipar o item
  unequipItem(state, 'weapon');
  assert.equal(state.equipment.weapon, null, 'Slot deve ficar vazio após desequipar');
  assert.equal(droppedItem.equipped, false, 'Item deve marcar equipped: false');
});
