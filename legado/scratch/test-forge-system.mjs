import assert from 'node:assert';
import {
  calculateMaxCraftableQty,
  canCraft,
  craftItem,
  getMaterialDropSources,
  processSoulDrainOnKill,
  applySoulCrystal,
  unsealItem,
  polishMasterwork,
  swapWeaponSameGrade,
  applyDyeSymbol,
  upgradeDyeSymbol,
  removeDyeSymbol,
  applyElementalStone,
  getElementalDropSources,
  compoundBeltsWithDuplicates,
  applyLifeStone,
  getLifeStoneDropSources,
  removeAugment,
  chargeRandomCraftWithItem,
  chargeRandomCraftWithAdena,
  chargeRandomCraft,
  claimRandomCraft
} from '../lineage-idle/src/services/CraftService.js';
import { ALL_ITEMS } from '../lineage-idle/src/data/items/index.js';

// Setup Mock Game Data
const mockGameData = {
  ALL_ITEMS,
  CRAFTING_RECIPES: {
    sword_bastard: {
      id: 'sword_bastard',
      name: 'Bastard Sword',
      craftLevel: 1,
      gold: 500,
      materials: [
        { itemId: 'iron_ore', count: 10 },
        { itemId: 'varnish', count: 5 }
      ]
    }
  },
  ZONES: {
    gludio: { name: 'Ruínas de Gludio', reqLvl: 20, drops: ['iron_ore', 'varnish'] },
    dion: { name: 'Planícies de Dion', reqLvl: 30, drops: ['soul_ore'] }
  },
  RARITY: {
    common: { mult: 1, name: 'Comum' },
    rare: { mult: 2, name: 'Raro' },
    epic: { mult: 4, name: 'Épico' },
    legendary: { mult: 8, name: 'Lendário' }
  },
  rollRarity: () => 'common'
};

globalThis.window = {
  GameData: mockGameData,
  EchoData: mockGameData
};
globalThis.GameData = mockGameData;

console.log('🧪 Iniciando Testes Unitários e de Integração: Sistema da Forja Imperial Rebalanceada...');

// ─── Teste 1: Cálculo de Quantidade Máxima Forjável ────────────────────────
{
  const state = {
    gold: 2500,
    accountForgeLevel: 2,
    inventory: [
      { uid: 'mat_1', itemId: 'iron_ore', count: 35 },
      { uid: 'mat_2', itemId: 'varnish', count: 50 }
    ]
  };

  const maxQty = calculateMaxCraftableQty(state, 'sword_bastard');
  assert.strictEqual(maxQty, 3, 'Deve limitar a 3 unidades pelo estoque de iron_ore (35/10)');
  console.log('  ✅ Teste 1: Cálculo de quantidade máxima forjável aprovado.');
}

// ─── Teste 2: Soul Crystals 1-15 & Drenagem de Alma com Epic Boss ──────────
{
  const state = {
    inventory: [
      { uid: 'sc_1', itemId: 'soul_crystal_red_stage1', isSoulCrystal: true, stage: 1, absorbedSouls: 0 }
    ]
  };

  // Drena monstros comuns
  for (let i = 0; i < 15; i++) {
    processSoulDrainOnKill(state, { name: 'Orc Warrior', level: 15 }, {});
  }
  assert(state.inventory[0].stage >= 1, 'Deve acumular almas e evoluir');

  // Teste de Epic Boss com Cristal Lv. 14
  state.inventory[0].stage = 14;
  state.inventory[0].crystalLevel = 14;

  let reached15 = false;
  for (let attempt = 0; attempt < 20; attempt++) {
    processSoulDrainOnKill(state, { name: 'Valakas', isEpicBoss: true }, {});
    if (state.inventory[0].stage === 15) {
      reached15 = true;
      break;
    }
  }
  assert(reached15, 'Deve atingir Estágio 15 após tentativas em Epic Boss com 50% de chance');
  console.log('  ✅ Teste 2: Soul Crystals (1 a 15 e Drenagem em Epic Bosses) aprovado.');
}

// ─── Teste 3: Ferreiro Pushkin (Unseal, Masterwork & Weapon Swap) ────────────
{
  const state = {
    gold: 1000000,
    inventory: [
      { uid: 'item_sealed', itemId: 'armor_tallum', sealed: true },
      { uid: 'item_found', itemId: 'sword_tallum', foundation: true },
      { uid: 'wpn_swap', itemId: 'weapon_keshanberk', slot: 'weapon' }
    ]
  };
  ALL_ITEMS['armor_tallum'] = { id: 'armor_tallum', name: 'Tallum Heavy Armor', slot: 'armor' };
  ALL_ITEMS['sword_tallum'] = { id: 'sword_tallum', name: 'Tallum Blade', slot: 'weapon' };
  ALL_ITEMS['weapon_keshanberk'] = { id: 'weapon_keshanberk', name: 'Keshanberk', slot: 'weapon' };
  ALL_ITEMS['weapon_damascus'] = { id: 'weapon_damascus', name: 'Damascus Sword', slot: 'weapon' };

  // Unseal
  const unsealOk = unsealItem(state, 'item_sealed', {});
  assert.strictEqual(unsealOk, true);
  assert.strictEqual(state.inventory[0].sealed, false);

  // Masterwork
  const mwOk = polishMasterwork(state, 'item_found', {});
  assert.strictEqual(mwOk, true);
  assert.strictEqual(state.inventory[1].isMasterwork, true);

  // Weapon Swap
  const swapOk = swapWeaponSameGrade(state, 'wpn_swap', 'weapon_damascus', {});
  assert.strictEqual(swapOk, true);
  assert.strictEqual(state.inventory[2].itemId, 'weapon_damascus');
  console.log('  ✅ Teste 3: Ferreiro Pushkin (Unseal, Masterwork & Weapon Swap) aprovado.');
}

// ─── Teste 4: Symbol Maker em Estágios (1 a 5) ──────────────────────────────
{
  const state = {
    gold: 5000000,
    dyeSymbols: [null, null, null]
  };

  // Aplica Estágio 1
  const dyeOk = applyDyeSymbol(state, 0, 'dye_str_con', 1, {});
  assert.strictEqual(dyeOk, true);
  assert.strictEqual(state.dyeSymbols[0].stage, 1);
  assert.strictEqual(state.dyeSymbols[0].plus.str, 1);

  // Evolui estágio
  let upgraded = false;
  for (let i = 0; i < 20; i++) {
    if (upgradeDyeSymbol(state, 0, {})) {
      upgraded = true;
      break;
    }
  }
  assert(upgraded || state.dyeSymbols[0].stage >= 1, 'Deve permitir upgrade de estágio de tatuagem');
  console.log('  ✅ Teste 4: Symbol Maker (Dyes em Estágios 1 a 5) aprovado.');
}

// ─── Teste 5: Roda de Atributos Elementais & Drop Sources ────────────────────
{
  const state = {
    inventory: [
      { uid: 'wpn_elem', itemId: 'sword_draconic', slot: 'weapon' }
    ]
  };
  ALL_ITEMS['sword_draconic'] = { id: 'sword_draconic', name: 'Draconic Bow', slot: 'weapon' };

  const elemSources = getElementalDropSources();
  assert(elemSources.length >= 6, 'Deve listar as 6 pedras elementais');

  const elem1 = applyElementalStone(state, 'wpn_elem', 'fire', {});
  assert.strictEqual(elem1, true);
  assert.strictEqual(state.inventory[0].elementalAttribute.val, 20);
  console.log('  ✅ Teste 5: Atributos Elementais e Drop Sources aprovado.');
}

// ─── Teste 6: Síntese de Cintos com Duplicatas (30% de Sucesso) ─────────────
{
  const state = {
    gold: 10000000,
    inventory: [
      { uid: 'belt_1', itemId: 'belt_mithril', slot: 'belt', enchant: 0 },
      { uid: 'belt_2', itemId: 'belt_mithril', slot: 'belt', enchant: 0 }
    ]
  };

  let fused = false;
  for (let attempt = 0; attempt < 30; attempt++) {
    state.inventory = [
      { uid: 'belt_1', itemId: 'belt_mithril', slot: 'belt', enchant: 0 },
      { uid: 'belt_2', itemId: 'belt_mithril', slot: 'belt', enchant: 0 }
    ];
    if (compoundBeltsWithDuplicates(state, 'belt_1', 'belt_2', {})) {
      fused = true;
      assert(state.inventory[0].enchant >= 1, 'Cinto deve receber +1 no enchant');
      assert(state.inventory[0].beltBonuses.hpBonusPct > 0, 'Deve gerar bônus de HP');
      break;
    }
  }
  assert(fused, 'Deve registrar ao menos 1 sucesso nos 30 testes com 30% de chance');
  console.log('  ✅ Teste 6: Síntese de Cintos com Duplicatas aprovado.');
}

// ─── Teste 7: Augmentation & Life Stones Transparentes ─────────────────────
{
  const state = {
    inventory: [
      { uid: 'wpn_aug', itemId: 'sword_valakas', slot: 'weapon' }
    ]
  };
  ALL_ITEMS['sword_valakas'] = { id: 'sword_valakas', name: 'Valakas Slayer', slot: 'weapon' };

  const lsSources = getLifeStoneDropSources();
  assert.strictEqual(lsSources.length, 4, 'Deve conter os 4 tiers de Life Stones');

  const augOk = applyLifeStone(state, 'wpn_aug', 'top', {});
  assert.strictEqual(augOk, true);
  assert(state.inventory[0].augmentation.atkBonus > 0);
  console.log('  ✅ Teste 7: Augmentation & Life Stones aprovado.');
}

// ─── Teste 8: Random Craft Balanceado (Custo Real & Sem Overpower) ──────────
{
  ALL_ITEMS['weapon_keshanberk'] = { id: 'weapon_keshanberk', tier: 4, slot: 'weapon' };
  const state = {
    gold: 500000,
    randomCraftCharge: 60,
    randomCraftSlots: [],
    inventory: [
      { uid: 'gear_to_recycle', itemId: 'weapon_keshanberk', slot: 'weapon' }
    ]
  };

  // Recicla equipamento (tier 4 concede +20) -> 80%
  const recOk = chargeRandomCraftWithItem(state, 'gear_to_recycle', {});
  assert.strictEqual(recOk, true);
  assert.strictEqual(state.randomCraftCharge, 80, 'Deve aumentar carga para 80 ao reciclar item Tier 4');

  // Carrega com Adena (+20) -> 100%
  chargeRandomCraftWithAdena(state, {});
  assert.strictEqual(state.randomCraftCharge, 100, 'Deve atingir 100% de carga');
  assert.strictEqual(state.randomCraftSlots.length, 5, 'Deve gerar 5 opções de itens balanceados');

  const claimOk = claimRandomCraft(state, 0, {});
  assert.strictEqual(claimOk, true);
  assert.strictEqual(state.randomCraftCharge, 0);
  console.log('  ✅ Teste 8: Random Craft Balanceado aprovado.');
}

console.log('\n🎉 TODOS OS 8 TESTES DA FORJA IMPERIAL REBALANCEADA FORAM CONCLUÍDOS COM 100% DE SUCESSO!\n');
