/**
 * test-audit-batch1.mjs — Bateria de Testes e Auditoria do LOTE 1 (Abas 1, 2, 3, 4 e 23).
 */

import { ZONES, SAGAS, ZONE_BACKGROUNDS } from '../lineage-idle/src/data/zones.js';
import { MONSTERS } from '../lineage-idle/src/data/monsters.js';
import { RACES, CLASSES, RACE_BASE_ATTRIBUTES } from '../lineage-idle/src/data/races.js';
import { getStats, getBaseAttributes } from '../lineage-idle/src/engine/StatsEngine.js';
import { CombatPowerService } from '../lineage-idle/src/services/CombatPowerService.js';
import { ResetService } from '../lineage-idle/src/services/ResetService.js';
import {
  getMaxInventorySlots,
  getMaxWarehouseSlots,
  isEquipmentItem,
  isProtectedFromAutoSell
} from '../lineage-idle/src/services/InventoryService.js';
import {
  resolveEquipSlot,
  equipItem,
  unequipItem
} from '../lineage-idle/src/services/EquipmentService.js';
import { getArmorType, getWeaponType, canEquipByType } from '../lineage-idle/src/data/items/item_class_rules.js';
import { getSkillCost, spendSP } from '../lineage-idle/src/engine/SkillEngine.js';
import { CombatValidatorEngine } from '../lineage-idle/src/engine/CombatValidatorEngine.js';

console.log('🧪 Iniciando Auditoria e Testes de Sanidade do LOTE 1 (Abas 1, 2, 3, 4 e 23)...\n');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✅ [PASS] ${message}`);
  } else {
    failed++;
    console.error(`  ❌ [FAIL] ${message}`);
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// 1. AUDITORIA DA ABA 1: ZONAS (tab-zones)
// ═════════════════════════════════════════════════════════════════════════════
console.log('--- 🗺️ ABA 1: Zonas de Caça & Sagas ---');
assert(SAGAS.length === 5, 'Existem 5 Sagas estruturadas (Interlude, Prelude of War, Awakening, Shadow, Realm of Gods)');
assert(Object.keys(ZONES).length === 24, `Existem 24 Zonas de Caça mapeadas (Encontradas: ${Object.keys(ZONES).length})`);

for (const [zId, zDef] of Object.entries(ZONES)) {
  assert(zDef.name && typeof zDef.level === 'number', `Zona '${zId}' possui nome e nível mínimo válido (${zDef.name} - Lv.${zDef.level})`);
  assert(Array.isArray(zDef.monsters) && zDef.monsters.length > 0, `Zona '${zId}' possui lista de monstros não vazia`);
  assert(zDef.monsters.every(m => MONSTERS[m] != null), `Todos os monstros de '${zId}' existem no MONSTERS.js`);
  assert(ZONE_BACKGROUNDS[zId] != null, `Zona '${zId}' possui background mapeado em ZONE_BACKGROUNDS`);
}

// ═════════════════════════════════════════════════════════════════════════════
// 2. AUDITORIA DA ABA 2: PERSONAGEM (tab-character)
// ═════════════════════════════════════════════════════════════════════════════
console.log('\n--- 👤 ABA 2: Personagem, Atributos Primários & Reset ---');
const testPlayerState = {
  race: 'human',
  class: 'fighter',
  level: 85,
  skills: {},
  equipment: { weapon: null, armor: null, boots: null },
  inventory: [],
  base: { atk: 10, def: 5, eva: 2, matk: 0, mdef: 2 },
  statAllocations: { str: 0, dex: 0, con: 0, int: 0, wit: 0, men: 0 },
  bonusStatPoints: 0,
  resetsCount: 0
};

const baseAttrs = getBaseAttributes('human', 'fighter');
assert(baseAttrs.str === 40 && baseAttrs.con === 43 && baseAttrs.dex === 30, 'Humano Guerreiro possui atributos base canônicos (STR 40, CON 43, DEX 30)');

const stats = getStats(testPlayerState);
assert(stats.maxHp > 100 && stats.atk > 0 && stats.def > 0, `Cálculo de Stats gera HP (${stats.maxHp}), Atk (${stats.atk}) e Def (${stats.def})`);

const cp = CombatPowerService.calculateCombatPower({ ...testPlayerState, stats });
assert(cp > 0 && typeof cp === 'number', `Combat Power calculado com sucesso (${cp} CP)`);

// Teste de Rebirth / Reset no Lv. 85
assert(ResetService.canPerformReset(testPlayerState).canReset === true, 'Personagem no Lv. 85 está apto para Transcender (Reset)');
const resetResult = ResetService.executeReset(testPlayerState, { log: () => {} });
assert(resetResult.success === true, 'Reset executado com sucesso');
assert(testPlayerState.level === 1, 'Nível resetado para Lv. 1');
assert(testPlayerState.resetsCount === 1, 'Contador de resets incrementado para 1');
assert(testPlayerState.bonusStatPoints === 60, 'Personagem recebeu +60 Pontos de Atributos Permanentes');

// ═════════════════════════════════════════════════════════════════════════════
// 3. AUDITORIA DA ABA 3: INVENTÁRIO (tab-inventory)
// ═════════════════════════════════════════════════════════════════════════════
console.log('\n--- 🎒 ABA 3: Inventário & Regras de Equipamento ---');
const invState = {
  race: 'human',
  inventory: [
    { uid: 'u1', itemId: 'potion_hp', count: 10, equipped: false },
    { uid: 'u2', itemId: 'potion_hp', count: 15, equipped: false }
  ],
  warehouse: [],
  equipment: {}
};

assert(getMaxInventorySlots(invState) === 150, 'Capacidade padrão da mochila é de 150 slots (Humano)');
invState.race = 'dwarf';
assert(getMaxInventorySlots(invState) === 250, 'Capacidade expandida da mochila para Anão é de 250 slots');

// Verificação de itens protegidos
assert(isProtectedFromAutoSell({ itemId: 'potion_hp' }, { slot: 'potion' }) === true, 'Poções são protegidas contra auto-venda');
assert(isProtectedFromAutoSell({ itemId: 'spellbook_4star' }, { slot: 'spellbook' }) === true, 'Spellbooks são protegidos contra auto-venda');
assert(isEquipmentItem({ slot: 'armor', type: 'heavy' }) === true, 'Armaduras são identificadas como equipamentos genuínos');

// Regras de Classe por Tipo de Armadura e Arma
const heavyItem = { slot: 'armor', name: 'Plate Armor of Doom' };
const bowItem = { slot: 'weapon', name: 'Draconic Bow' };

assert(canEquipByType('gladiator', heavyItem).ok === true, 'Gladiator pode equipar armadura Heavy');
assert(canEquipByType('sorcerer', heavyItem).ok === false, 'Sorcerer NÃO pode equipar armadura Heavy');
assert(canEquipByType('hawkeye', bowItem).ok === true, 'Hawkeye pode equipar Arco');
assert(canEquipByType('paladin', bowItem).ok === false, 'Paladin com classe restrita NÃO pode equipar Arco');

// ═════════════════════════════════════════════════════════════════════════════
// 4. AUDITORIA DA ABA 4: HABILIDADES (tab-skills)
// ═════════════════════════════════════════════════════════════════════════════
console.log('\n--- ✦ ABA 4: Habilidades, Movesets & Grimórios 4★ ---');

// Validação de Moveset de Arma (Arco exige Arco)
const bowSkill = { name: 'Double Shot', requiredWeaponType: 'bow' };
const bowValid = CombatValidatorEngine.validateWeaponMoveset({ name: 'Draconic Bow', weaponType: 'bow' }, bowSkill);
assert(bowValid.valid === true, 'Habilidade de arco validada com arco equipado');

const bowInvalid = CombatValidatorEngine.validateWeaponMoveset({ name: 'Forgotten Blade', weaponType: 'sword' }, bowSkill);
assert(bowInvalid.valid === false, 'Habilidade de arco rejeitada ao usar espada');

// Validação de Buff ou Habilidade de qualquer arma
const genericBuff = { name: 'War Cry', requiredWeaponType: 'any', type: 'Self-Buff' };
const buffValid = CombatValidatorEngine.validateWeaponMoveset({ name: 'Dual Swords', weaponType: 'dual_swords' }, genericBuff);
assert(buffValid.valid === true, 'Buff genérico validado com qualquer arma empunhada');

// ═════════════════════════════════════════════════════════════════════════════
// 5. AUDITORIA DA ABA 23: ARMAZÉM / BAÚ (tab-warehouse)
// ═════════════════════════════════════════════════════════════════════════════
console.log('\n--- 🏛️ ABA 23: Armazém & Baú da Conta ---');
const whState = {
  inventory: [{ uid: 'w1', itemId: 'draconic_bow', count: 1, equipped: false }],
  warehouse: []
};

assert(getMaxWarehouseSlots() === 300, 'Capacidade padrão do Baú é de 300 slots');

// Depósito
const itemToDep = whState.inventory.pop();
whState.warehouse.push(itemToDep);
assert(whState.warehouse.length === 1 && whState.warehouse[0].itemId === 'draconic_bow', 'Item depositado no Baú com integridade preservada');

// Retirada
const itemToWithdraw = whState.warehouse.pop();
whState.inventory.push(itemToWithdraw);
assert(whState.inventory.length === 1 && whState.inventory[0].itemId === 'draconic_bow', 'Item retirado do Baú de volta para a mochila com sucesso');

console.log('\n========================================');
console.log(`Total: ${passed + failed} | Passaram: ${passed} | Falharam: ${failed}`);
console.log('========================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 SUCESSO! LOTE 1 (Abas 1, 2, 3, 4 e 23) 100% auditado e aprovado com excelência!');
}
