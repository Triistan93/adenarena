import { ALL_ITEMS } from '../lineage-idle/src/data/items/index.js';
import { CRAFTING_RECIPES, generateAllCraftingRecipes } from '../lineage-idle/src/data/items/recipes_drops.js';
import { getMaterialDropSources, getRecipeDef, getRecipeMaterials } from '../lineage-idle/src/services/CraftService.js';
import { ZONES } from '../lineage-idle/src/data/zones.js';

globalThis.GameData = { ALL_ITEMS, CRAFTING_RECIPES };

console.log('=== AUDITORIA DE RECEITAS E ECONOMIA DA FORJA ===');

const totalItems = Object.keys(ALL_ITEMS).length;
console.log('Total de itens cadastrados no ALL_ITEMS: ' + totalItems);
const allItems = ALL_ITEMS;

const allRecipes = generateAllCraftingRecipes(ALL_ITEMS);
const staticRecipeKeys = Object.keys(CRAFTING_RECIPES);
console.log('Receitas estáticas: ' + staticRecipeKeys.length);
console.log('Total de receitas geradas/disponíveis: ' + Object.keys(allRecipes).length);

// 1. Auditar itens finais de cada receita
const missingOutputItems = [];
const recipesWithInvalidCost = [];
const recipesByGrade = { NG: 0, D: 0, C: 0, B: 0, A: 0, S: 0, OTHER: 0 };
const materialUsage = new Map(); // materialId -> count of recipes using it

for (const [recipeKey, recipe] of Object.entries(allRecipes)) {
  const targetItemId = recipe.result || recipe.itemId || recipe.id;
  const def = allItems[targetItemId];
  if (!def) {
    missingOutputItems.push({ recipeKey, targetItemId });
  }

  if (typeof recipe.gold !== 'number' || recipe.gold < 0 || !Number.isFinite(recipe.gold)) {
    recipesWithInvalidCost.push({ recipeKey, gold: recipe.gold });
  }

  const reqLevel = recipe.minPlayerLevel || def?.req?.level || def?.level || 1;
  if (reqLevel < 20) recipesByGrade.NG++;
  else if (reqLevel < 40) recipesByGrade.D++;
  else if (reqLevel < 52) recipesByGrade.C++;
  else if (reqLevel < 62) recipesByGrade.B++;
  else if (reqLevel < 76) recipesByGrade.A++;
  else recipesByGrade.S++;

  const mats = getRecipeMaterials(recipe);
  for (const m of mats) {
    materialUsage.set(m.matId, (materialUsage.get(m.matId) || 0) + 1);
  }
}

console.log('\n--- Distribuição de Receitas por Grau ---');
console.log(JSON.stringify(recipesByGrade, null, 2));

console.log('\nReceitas com item final inexistente: ' + missingOutputItems.length);
if (missingOutputItems.length > 0) {
  console.log('Amostra de itens inexistentes:', missingOutputItems.slice(0, 10));
}

console.log('Receitas com custo em ouro inválido: ' + recipesWithInvalidCost.length);

// 2. Auditar materiais usados nas receitas
console.log('\n--- Auditoria de Materiais Requeridos ---');
console.log('Total de materiais únicos requeridos por receitas: ' + materialUsage.size);

const missingMaterialsInAllItems = [];
const materialsWithoutDropSource = [];

for (const matId of materialUsage.keys()) {
  const matDef = allItems[matId];
  if (!matDef) {
    missingMaterialsInAllItems.push(matId);
  }
  const sources = getMaterialDropSources(matId);
  if (!sources || sources.length === 0) {
    materialsWithoutDropSource.push(matId);
  }
}

console.log('Materiais que NÃO existem no ALL_ITEMS: ' + missingMaterialsInAllItems.length);
if (missingMaterialsInAllItems.length > 0) {
  console.log('Lista:', missingMaterialsInAllItems);
}

console.log('Materiais sem fontes de drop no getMaterialDropSources: ' + materialsWithoutDropSource.length);
if (materialsWithoutDropSource.length > 0) {
  console.log('Lista de materiais sem drop registrado:', materialsWithoutDropSource);
}

// 3. Checar materiais no ALL_ITEMS que NUNCA são usados em receitas
const allMaterials = Object.entries(allItems).filter(([id, def]) => def.slot === 'material');
console.log('\nTotal de itens com slot "material" no ALL_ITEMS: ' + allMaterials.length);
const unusedMaterials = allMaterials.filter(([id]) => !materialUsage.has(id));
console.log('Materiais que nunca são requeridos por nenhuma receita: ' + unusedMaterials.length);
if (unusedMaterials.length > 0) {
  console.log('Exemplos de materiais sem uso:', unusedMaterials.slice(0, 15).map(([id, d]) => id + ' (' + d.name + ')'));
}

console.log('\nAuditoria preliminar concluída com sucesso.');
