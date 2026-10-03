import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';
import { ALL_ITEMS } from '../lineage-idle/src/data/items/index.js';
import { CRAFTING_RECIPES } from '../lineage-idle/src/data/items/recipes_drops.js';
import {
  applyDyeSymbol,
  applyLifeStone,
  calculateMaxCraftableQty,
  canCraft,
  chargeRandomCraftWithAdena,
  chargeRandomCraftWithItem,
  compoundBeltsWithDuplicates,
  craftItem,
  getRecipeDef,
  getRecipeMaterials,
  polishMasterwork,
  refreshRandomCraftSlots,
  removeAugment,
  removeDyeSymbol,
  spinRandomCraft,
  swapWeaponSameGrade,
  unsealItem,
  upgradeDyeSymbol
} from '../lineage-idle/src/services/CraftService.js';
import { getMaxInventorySlots } from '../lineage-idle/src/services/InventoryService.js';
import { RefineryService } from '../lineage-idle/src/services/lifeActivities/RefineryService.js';

describe('Etapa 2 — Ciclo Completo da Economia e Forja', () => {
  beforeEach(() => {
    globalThis.GameData = { ALL_ITEMS, CRAFTING_RECIPES };
  });

  it('1. Fluxo canônico de criação (No-Grade ao S-Grade) com consumo e ganho atômicos', () => {
    const state = DEFAULT_STATE();
    state.level = 10;
    state.accountForgeLevel = 1;
    state.gold = 5000;
    state.inventory = [
      { uid: 'mat-iron', itemId: 'iron_ore', count: 20 },
      { uid: 'mat-suede', itemId: 'suede', count: 10 }
    ];

    // Composition Bow: 10 iron_ore, 5 suede, 250 gold
    assert.equal(canCraft(state, 'weapon_composition_bow', 1), true);
    assert.equal(calculateMaxCraftableQty(state, 'weapon_composition_bow'), 2);

    const success = craftItem(state, 'weapon_composition_bow', 1);
    assert.equal(success, true);
    assert.equal(state.gold, 4750);
    assert.equal(state.inventory.find(i => i.uid === 'mat-iron').count, 10);
    assert.equal(state.inventory.find(i => i.uid === 'mat-suede').count, 5);
    const craftedBow = state.inventory.find(i => i.itemId === 'weapon_composition_bow');
    assert.ok(craftedBow);
    assert.ok(state.accountForgeExp > 0);
  });

  it('2. Proteção de mochila cheia: nunca consome ingredientes ou Adena se o item não couber', () => {
    const state = DEFAULT_STATE();
    state.level = 10;
    state.gold = 5000;
    const maxSlots = getMaxInventorySlots(state);
    state.inventory = Array.from({ length: maxSlots - 1 }, (_, i) => ({
      uid: `filler-${i}`, itemId: `filler_${i}`, count: 1
    }));
    // Último slot preenchido com a pilha de material
    state.inventory.push({ uid: 'mat-iron', itemId: 'iron_ore', count: 20 });
    state.inventory.push({ uid: 'mat-suede', itemId: 'suede', count: 10 });
    // Mochila com maxSlots + 1 (já lotada)
    const beforeState = structuredClone(state);

    const crafted = craftItem(state, 'weapon_composition_bow', 1);
    assert.equal(crafted, false);
    assert.equal(state.gold, beforeState.gold);
    assert.deepEqual(state.inventory, beforeState.inventory);
  });

  it('3. Life Stones: exige a pedra correspondente e Adena, impedindo augmentation gratuito', () => {
    const state = DEFAULT_STATE();
    state.gold = 500_000;
    state.inventory = [
      { uid: 'sword-1', itemId: 'weapon_falchion_sword', slot: 'weapon' }
    ];

    // Sem a pedra no inventário, rejeita sem cobrar
    const failNoStone = applyLifeStone(state, 'sword-1', 'top');
    assert.equal(failNoStone, false);
    assert.equal(state.gold, 500_000);
    assert.equal(state.inventory[0].augmentation, undefined);

    // Com a pedra no inventário mas sem Adena suficiente
    state.inventory.push({ uid: 'ls-top', itemId: 'lifestone_top', count: 1 });
    state.gold = 100_000; // Top requer 250.000
    const failNoAdena = applyLifeStone(state, 'sword-1', 'top');
    assert.equal(failNoAdena, false);
    assert.equal(state.gold, 100_000);
    assert.equal(state.inventory[1].count, 1);
    assert.equal(state.inventory[0].augmentation, undefined);

    // Com pedra e Adena válidas: consome 1x pedra e taxa de 250k
    state.gold = 300_000;
    const ok = applyLifeStone(state, 'sword-1', 'top');
    assert.equal(ok, true);
    assert.equal(state.gold, 50_000);
    assert.equal(state.inventory.find(i => i.uid === 'ls-top')?.count || 0, 0);
    assert.ok(state.inventory[0].augmentation);
    assert.equal(state.inventory[0].augmentation.grade, 'top');

    // Remoção com taxa de 25.000
    const cleansed = removeAugment(state, 'sword-1');
    assert.equal(cleansed, true);
    assert.equal(state.gold, 25_000);
    assert.equal(state.inventory[0].augmentation, null);
  });

  it('4. Tatuagens & Dyes: teto estrito de +5 por atributo líquido e atomicidade de taxa', () => {
    const state = DEFAULT_STATE();
    state.gold = 1_000_000;
    state.dyeSymbols = [null, null, null];

    // Slot 1: STR +1 / CON -1
    assert.equal(applyDyeSymbol(state, 0, 'dye_str_con', 1), true);
    assert.equal(state.dyeSymbols[0].stage, 1);

    // Slot 2: STR +1 / CON -1 (Total STR +2)
    assert.equal(applyDyeSymbol(state, 1, 'dye_str_con', 1), true);

    // Slot 3: Tentar colocar STR +4 quando o total bateria +6 (> +5 líquido)
    assert.equal(applyDyeSymbol(state, 2, 'dye_str_con', 4), false);
    assert.equal(state.dyeSymbols[2], null, 'rejeita símbolo que viole o teto de +5 líquido');

    // Upgrade com custo de Adena
    state.gold = 200_000;
    const upgraded = upgradeDyeSymbol(state, 0);
    // Pode ter sucesso ou falha, mas a Adena deve ser debitada atomicamente
    assert.equal(state.gold, 150_000, 'cobrou exatamente 50.000 Adena para evoluir estágio 1');

    // Remoção do símbolo
    assert.equal(removeDyeSymbol(state, 0), true);
    assert.equal(state.dyeSymbols[0], null);
  });

  it('5. Ferreiro Pushkin: Unseal, Masterwork e Troca de Armas de Mesmo Grau', () => {
    const state = DEFAULT_STATE();
    state.gold = 500_000;
    state.inventory = [
      { uid: 'sealed-armor', itemId: 'armor_brigandine_armor_heavy', sealed: true },
      { uid: 'found-bow', itemId: 'weapon_composition_bow', foundation: { stats: {} } },
      { uid: 'swap-wpn', itemId: 'weapon_falchion_sword', slot: 'weapon', equipped: false }
    ];

    // Unseal (25k)
    assert.equal(unsealItem(state, 'sealed-armor'), true);
    assert.equal(state.gold, 475_000);
    assert.equal(state.inventory[0].sealed, false);

    // Polish Masterwork (100k)
    assert.equal(polishMasterwork(state, 'found-bow'), true);
    assert.equal(state.gold, 375_000);
    assert.equal(state.inventory[1].isMasterwork, true);
    assert.ok(state.inventory[1].masterworkBonus);

    // Troca de arma de mesmo grau (150k)
    assert.equal(swapWeaponSameGrade(state, 'swap-wpn', 'weapon_hunting_bow'), true);
    assert.equal(state.gold, 225_000);
    assert.equal(state.inventory[2].itemId, 'weapon_hunting_bow');
  });

  it('6. Síntese de Cintos: exige 2 cintos idênticos e taxa de 100k com 30% de chance', () => {
    const state = DEFAULT_STATE();
    state.gold = 200_000;
    state.inventory = [
      { uid: 'belt-a', itemId: 'adventurer_belt' },
      { uid: 'belt-b', itemId: 'adventurer_belt' }
    ];

    const result = compoundBeltsWithDuplicates(state, 'belt-a', 'belt-b');
    assert.equal(state.gold, 100_000);
    assert.equal(state.inventory.length, 1, 'o cinto secundário é consumido no ritual');
    assert.equal(state.inventory[0].uid, 'belt-a');
  });

  it('7. Bancada de Refino: converte materiais com atomicidade e sobe nível de forja', () => {
    const state = DEFAULT_STATE();
    state.accountForgeLevel = 1;
    state.accountForgeExp = 0;
    state.gold = 10_000;
    state.inventory = [
      { uid: 'mat-stem', itemId: 'stem', count: 40 },
      { uid: 'mat-cord', itemId: 'cord', count: 20 }
    ];

    const result = RefineryService.refine(state, 'refine_braided_hemp', 10);
    assert.equal(result.success, true);
    assert.equal(state.inventory.find(i => i.itemId === 'braided_hemp')?.count, 10);
    assert.equal(state.inventory.find(i => i.itemId === 'stem'), undefined);
    assert.equal(state.inventory.find(i => i.itemId === 'cord'), undefined);
    assert.ok(state.accountForgeExp > 0 || state.accountForgeLevel > 1);
  });
});
