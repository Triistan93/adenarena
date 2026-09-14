// RefineryService.js — Bancada de Refino de Materiais de Life Activities 2.0
import { addToInventory } from '../InventoryService.js';
import { RESOURCE_DICTIONARY } from './ResourceDictionary.js';

export const REFINERY_RECIPES = [
  // ─── 1. Madeira & Fibras (Wood & Fibers) ───
  {
    id: 'refine_compressed_wood',
    name: 'Madeira Comprimida',
    desc: 'Madeira densa tratada com carvão vegetal. Usada em arcos e cabos reforçados.',
    category: 'wood',
    icon: 'materials/compressed_wood.png',
    inputs: [
      { matId: 'branch', qty: 5 },
      { matId: 'charcoal', qty: 2 }
    ],
    output: { matId: 'compressed_wood', qty: 1 },
    adenaCost: 150,
    forgeExp: 5
  },
  {
    id: 'refine_varnish',
    name: 'Verniz Natural',
    desc: 'Seiva destilada de hastes de plantas. Impermeabiliza madeira e ligas metálicas.',
    category: 'wood',
    icon: 'materials/varnish.png',
    inputs: [
      { matId: 'stem', qty: 5 }
    ],
    output: { matId: 'varnish', qty: 1 },
    adenaCost: 100,
    forgeExp: 4
  },
  {
    id: 'refine_cord',
    name: 'Cordão Trançado',
    desc: 'Fibras de algodão entrelaçadas sob pressão. Componente de arcos e armaduras leves.',
    category: 'wood',
    icon: 'materials/cord.png',
    inputs: [
      { matId: 'cotton_thread', qty: 4 }
    ],
    output: { matId: 'cord', qty: 1 },
    adenaCost: 120,
    forgeExp: 4
  },
  {
    id: 'refine_braided_hemp',
    name: 'Cânhamo Trançado Imperial',
    desc: 'Corda nobre de alta resistência mecânica para equipamentos de Grau D e C.',
    category: 'wood',
    icon: 'materials/braided_hemp.png',
    inputs: [
      { matId: 'stem', qty: 4 },
      { matId: 'cord', qty: 2 }
    ],
    output: { matId: 'braided_hemp', qty: 1 },
    adenaCost: 350,
    forgeExp: 8
  },

  // ─── 2. Curtume & Peles (Leather & Bones) ───
  {
    id: 'refine_leather',
    name: 'Couro Curtido Nobre',
    desc: 'Peles de feras silvestres tratadas e amaciadas por salgamento e raspagem.',
    category: 'leather',
    icon: 'materials/leather.png',
    inputs: [
      { matId: 'pelt', qty: 3 }
    ],
    output: { matId: 'leather', qty: 1 },
    adenaCost: 150,
    forgeExp: 5
  },
  {
    id: 'refine_crafted_leather',
    name: 'Couro Trabalhado (Crafted Leather)',
    desc: 'Couro curtido reforçado com costura de cordão. Base de armaduras leves e cintos.',
    category: 'leather',
    icon: 'materials/crafted_leather.png',
    inputs: [
      { matId: 'leather', qty: 4 },
      { matId: 'cord', qty: 2 }
    ],
    output: { matId: 'crafted_leather', qty: 1 },
    adenaCost: 500,
    forgeExp: 10
  },
  {
    id: 'refine_coarse_bone_powder',
    name: 'Pó de Osso Grosso',
    desc: 'Ossos de monstros triturados e refinados para ligas cerâmicas e alquimia.',
    category: 'leather',
    icon: 'materials/coarse_bone_powder.png',
    inputs: [
      { matId: 'bone', qty: 10 }
    ],
    output: { matId: 'coarse_bone_powder', qty: 1 },
    adenaCost: 250,
    forgeExp: 6
  },

  // ─── 3. Metalurgia Imperial (Metals & Alloys) ───
  {
    id: 'refine_steel',
    name: 'Aço Imperial Refinado',
    desc: 'Liga pura forjada na combustão de minério de ferro com carvão mineral.',
    category: 'metal',
    icon: 'materials/steel.png',
    inputs: [
      { matId: 'iron_ore', qty: 5 },
      { matId: 'coal', qty: 5 }
    ],
    output: { matId: 'steel', qty: 1 },
    adenaCost: 450,
    forgeExp: 10
  },
  {
    id: 'refine_mithril_alloy',
    name: 'Liga de Mithril',
    desc: 'Minério de mithril fundido com verniz purificado. Extremamente leve e resistente à magia.',
    category: 'metal',
    icon: 'materials/mithril_alloy.png',
    inputs: [
      { matId: 'mithril_ore', qty: 3 },
      { matId: 'varnish', qty: 2 }
    ],
    output: { matId: 'mithril_alloy', qty: 1 },
    adenaCost: 750,
    forgeExp: 14
  },
  {
    id: 'refine_synthetic_cokes',
    name: 'Coque Sintético',
    desc: 'Combustível de alta caloria gerado pela fusão de carvão mineral e vegetal.',
    category: 'metal',
    icon: 'materials/synthetic_cokes.png',
    inputs: [
      { matId: 'coal', qty: 4 },
      { matId: 'charcoal', qty: 4 }
    ],
    output: { matId: 'synthetic_cokes', qty: 1 },
    adenaCost: 550,
    forgeExp: 10
  },
  {
    id: 'refine_metallic_fiber',
    name: 'Fibra Metálica',
    desc: 'Filamentos de ferro trançados em matriz têxtil para cotas de malha e escudos.',
    category: 'metal',
    icon: 'materials/metallic_fiber.png',
    inputs: [
      { matId: 'iron_ore', qty: 4 },
      { matId: 'cord', qty: 3 }
    ],
    output: { matId: 'metallic_fiber', qty: 1 },
    adenaCost: 650,
    forgeExp: 12
  },

  // ─── 4. Alquimia & Reagentes (Alchemy & Reagents) ───
  {
    id: 'refine_varnish_of_purity',
    name: 'Verniz da Pureza',
    desc: 'Composto alquímico raro sintetizado com verniz vegetal e pó de osso grosso.',
    category: 'alchemy',
    icon: 'materials/varnish_of_purity.png',
    inputs: [
      { matId: 'varnish', qty: 3 },
      { matId: 'coarse_bone_powder', qty: 1 }
    ],
    output: { matId: 'varnish_of_purity', qty: 1 },
    adenaCost: 800,
    forgeExp: 15
  },
  {
    id: 'refine_enria',
    name: 'Enria (Reagente Arcano)',
    desc: 'Massa fluida de altíssima condutividade mágica para armamentos C e B.',
    category: 'alchemy',
    icon: 'materials/enria.png',
    inputs: [
      { matId: 'stem', qty: 8 },
      { matId: 'coarse_bone_powder', qty: 2 }
    ],
    output: { matId: 'enria', qty: 1 },
    adenaCost: 1200,
    forgeExp: 20
  },
  {
    id: 'refine_durable_metal_plate',
    name: 'Placa de Metal Durável',
    desc: 'Blindagem pesada laminada em aço imperial e pó de mithril.',
    category: 'metal',
    icon: 'materials/durable_metal_plate.png',
    inputs: [
      { matId: 'steel', qty: 2 },
      { matId: 'mithril_ore', qty: 2 }
    ],
    output: { matId: 'durable_metal_plate', qty: 1 },
    adenaCost: 1500,
    forgeExp: 22
  }
];

export const RefineryService = {
  getRecipes(category = 'all') {
    if (!category || category === 'all') return REFINERY_RECIPES;
    return REFINERY_RECIPES.filter(r => r.category === category);
  },

  getRecipeById(recipeId) {
    return REFINERY_RECIPES.find(r => r.id === recipeId) || null;
  },

  getMaterialCount(state, matId) {
    if (!state || !Array.isArray(state.inventory)) return 0;
    let total = 0;
    for (const item of state.inventory) {
      if ((item.id === matId || item.itemId === matId) && !item.equipped) {
        total += (item.count || 1);
      }
    }
    return total;
  },

  calculateMaxRefinements(state, recipeId) {
    const recipe = this.getRecipeById(recipeId);
    if (!recipe) return 0;

    let maxByMats = Infinity;
    for (const inp of recipe.inputs) {
      const have = this.getMaterialCount(state, inp.matId);
      const possible = Math.floor(have / inp.qty);
      if (possible < maxByMats) {
        maxByMats = possible;
      }
    }

    if (maxByMats === Infinity || maxByMats <= 0) return 0;

    const gold = state.gold || 0;
    const maxByGold = recipe.adenaCost > 0 ? Math.floor(gold / recipe.adenaCost) : Infinity;

    return Math.max(0, Math.min(maxByMats, maxByGold));
  },

  refine(state, recipeId, times = 1, callbacks = {}) {
    const recipe = this.getRecipeById(recipeId);
    if (!recipe) {
      if (callbacks.log) callbacks.log('⚠️ Receita de refino desconhecida.', 'warning');
      return { success: false, reason: 'invalid_recipe' };
    }

    const count = Math.max(1, Math.floor(times));
    const totalAdena = (recipe.adenaCost || 0) * count;

    if ((state.gold || 0) < totalAdena) {
      if (callbacks.log) callbacks.log(`⚠️ Adena insuficiente para refino! Requer ${totalAdena.toLocaleString()} Adena.`, 'warning');
      return { success: false, reason: 'insufficient_gold' };
    }

    // Valida todos os materiais necessários
    for (const inp of recipe.inputs) {
      const requiredTotal = inp.qty * count;
      const currentHave = this.getMaterialCount(state, inp.matId);
      if (currentHave < requiredTotal) {
        const matDef = RESOURCE_DICTIONARY[inp.matId] || { name: inp.matId };
        if (callbacks.log) {
          callbacks.log(`⚠️ Materiais insuficientes! Requer ${requiredTotal}x ${matDef.name} (você possui ${currentHave}).`, 'warning');
        }
        return { success: false, reason: 'insufficient_materials', missing: inp.matId };
      }
    }

    // Deduz materiais através de todos os stacks disponíveis
    for (const inp of recipe.inputs) {
      let toDeduct = inp.qty * count;
      for (let i = state.inventory.length - 1; i >= 0 && toDeduct > 0; i--) {
        const item = state.inventory[i];
        if ((item.id === inp.matId || item.itemId === inp.matId) && !item.equipped) {
          const currentStack = item.count || 1;
          if (currentStack <= toDeduct) {
            toDeduct -= currentStack;
            state.inventory.splice(i, 1);
          } else {
            item.count = currentStack - toDeduct;
            toDeduct = 0;
          }
        }
      }
    }

    // Deduz Adena
    state.gold -= totalAdena;

    // Entrega material refinado
    const outputQty = (recipe.output.qty || 1) * count;
    addToInventory(state, recipe.output.matId, outputQty, 'common', false, callbacks, true);

    // Concede EXP para a Forja Imperial
    const earnedForgeExp = (recipe.forgeExp || 5) * count;
    state.accountForgeExp = (state.accountForgeExp || 0) + earnedForgeExp;
    const forgeLvl = state.accountForgeLevel || state.craftLevel || 1;
    const reqExp = forgeLvl * 100;
    let forgeLeveledUp = false;
    if (state.accountForgeExp >= reqExp) {
      state.accountForgeExp -= reqExp;
      state.accountForgeLevel = forgeLvl + 1;
      state.craftLevel = state.accountForgeLevel;
      forgeLeveledUp = true;
    }

    const outDef = RESOURCE_DICTIONARY[recipe.output.matId] || { name: recipe.name };

    if (callbacks.log) {
      callbacks.log(
        `⚗️ **Refino Concluído:** +${outputQty}x **${outDef.name}** processado(s) com sucesso! (-${totalAdena.toLocaleString()} Adena, +${earnedForgeExp} EXP Forja)`,
        'loot'
      );
      if (forgeLeveledUp) {
        callbacks.log(`🔨 **Sua Forja Imperial subiu para o Nível ${state.accountForgeLevel}!**`, 'rarity-legendary');
      }
    }

    if (callbacks.floatText) {
      callbacks.floatText(`+${outputQty} ${outDef.name}!`, 'float-gold');
    }

    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();

    return {
      success: true,
      recipeId,
      count,
      outputQty,
      earnedForgeExp,
      forgeLeveledUp
    };
  },

  refineAll(state, recipeId, callbacks = {}) {
    const maxCount = this.calculateMaxRefinements(state, recipeId);
    if (maxCount <= 0) {
      if (callbacks.log) callbacks.log('⚠️ Recursos ou Adena insuficientes para refinar este material.', 'warning');
      return { success: false, reason: 'cannot_refine' };
    }
    return this.refine(state, recipeId, maxCount, callbacks);
  }
};
