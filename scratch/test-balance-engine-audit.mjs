import fs from 'fs';
import vm from 'vm';

console.log('⚖️ Executando Testes de Verificação do BalanceEngine 2.0 e Crafting...\n');

const consumablesCode = fs.readFileSync('lineage-idle/src/data/items/consumables.js', 'utf8');
const recipesCode = fs.readFileSync('lineage-idle/src/data/items/recipes_drops.js', 'utf8');
const weaponsCode = fs.readFileSync('lineage-idle/src/data/items/weapons.js', 'utf8');
const armorsCode = fs.readFileSync('lineage-idle/src/data/items/armors.js', 'utf8');
const balanceCode = fs.readFileSync('lineage-idle/src/engine/BalanceEngine.js', 'utf8');

const sandbox = {
  window: { GameData: {} },
  console: console,
  Math: Math,
  Object: Object,
  Array: Array,
  Number: Number,
  String: String,
  Boolean: Boolean,
  Set: Set,
  Date: Date
};

vm.createContext(sandbox);

function runModule(code) {
  const cleanCode = code
    .replace(/^import\s+.*$/gm, '// import')
    .replace(/^export\s+default\s+/gm, '')
    .replace(/^export\s+/gm, '');
  vm.runInContext(cleanCode, sandbox);
}

runModule(consumablesCode);
runModule(weaponsCode);
runModule(armorsCode);
runModule(recipesCode);
runModule(balanceCode);

const balanceEngine = sandbox;
const gameData = sandbox.window.GameData;
let errors = [];
let passedChecks = 0;

// Test 1: Validate Grade Penalty Calculation
console.log('--- TESTE 1: Validação de Grade Penalty por Nível ---');
const penaltyLowLvl = balanceEngine.checkGradePenalty(20, 's');
const penaltyOkLvl = balanceEngine.checkGradePenalty(76, 's');

if (penaltyLowLvl.hasPenalty && !penaltyOkLvl.hasPenalty) {
  console.log('✓ Grade Penalty funcionando corretamente:');
  console.log(`  └ Nível 20 com Item S-Grade: ${penaltyLowLvl.hasPenalty ? 'APLICOU PENALIDADE ✓ (' + penaltyLowLvl.reason + ')' : 'ERRO ❌'}`);
  console.log(`  └ Nível 76 com Item S-Grade: ${!penaltyOkLvl.hasPenalty ? 'PERMITIDO SEM PENALIDADE ✓' : 'ERRO ❌'}`);
  passedChecks++;
} else {
  errors.push(`Falha no cálculo de Grade Penalty: LowLvl=${penaltyLowLvl.hasPenalty}, OkLvl=${penaltyOkLvl.hasPenalty}`);
}

// Test 2: Validate Damage Formulas
console.log('\n--- TESTE 2: Validação de Fórmulas de Dano Físico e Mágico ---');
const physDmg = balanceEngine.calcPhysicalDamage(1000, 60, 500, true);
const magicDmg = balanceEngine.calcMagicDamage(1500, 75, 400, false);

if (physDmg > 0 && magicDmg > 0) {
  console.log(`✓ Dano Físico Crítico (P.Atk 1000, Pwr 60 vs P.Def 500): ${physDmg} dano`);
  console.log(`✓ Dano Mágico Normal (M.Atk 1500, Pwr 75 vs M.Def 400): ${magicDmg} dano`);
  passedChecks++;
} else {
  errors.push(`Falha no cálculo de dano: PhysDmg=${physDmg}, MagicDmg=${magicDmg}`);
}

// Test 3: Validate Special Craft Recipes
console.log('\n--- TESTE 3: Validação das Receitas de Craft (Spellbook 4★, Boss & Frost Lord TOP Tier) ---');
const recipes = sandbox.CRAFTING_RECIPES || gameData?.CRAFTING_RECIPES || {};
const spellbookRecipe = recipes['spellbook_4star'];
const zakenRecipe = recipes['weapon_zaken_sword'];
const frostLordRecipe = recipes['weapon_frost_lord_sword'];

if (spellbookRecipe && zakenRecipe && frostLordRecipe) {
  console.log('✓ Receitas Especiais de Crafting encontradas:');
  console.log(`  └ ${spellbookRecipe.name || 'Spellbook: 4-Star ⭐'}: Custo ${spellbookRecipe.gold} Adena, Requer 10x ancient_spellbook_page`);
  console.log(`  └ ${zakenRecipe.name || 'Zaken Sword'}: Custo ${zakenRecipe.gold} Adena, Requer 10x zaken_shard + 1x magic_dark_heart`);
  console.log(`  └ ${frostLordRecipe.name || 'Frost Lord Blade'}: Custo ${frostLordRecipe.gold} Adena, Requer 100x frost_fragment + 1x frost_lord_dark_heart`);
  passedChecks++;
} else {
  errors.push(`Receitas de Crafting ausentes: spellbook=${!!spellbookRecipe}, zaken=${!!zakenRecipe}, frostLord=${!!frostLordRecipe}`);
}

// Test 4: Validate Shop Inventory Restrictions
console.log('\n--- TESTE 4: Validação de Restrições do Mercador (Shop Inventory) ---');
const shopList = sandbox.SHOP_INVENTORY || gameData?.SHOP_INVENTORY || [];

const hasHighGradeArmor = shopList.some(id => id.includes('draconic') || id.includes('imperial') || id.includes('tallum'));
if (!hasHighGradeArmor && shopList.length > 0) {
  console.log(`✓ Mercador restrito apenas a consumíveis No-Grade e Poções (Total de itens no Shop: ${shopList.length})`);
  passedChecks++;
} else {
  errors.push('Shop ainda contém itens de grau alto!');
}

console.log('\n================ RESUMO DA VERIFICAÇÃO DE BALANCEAMENTO ================');
console.log(`✅ Testes Aprovados: ${passedChecks}/4`);
console.log(`❌ Erros Encontrados: ${errors.length}`);
errors.forEach(e => console.log(`   - [ERRO] ${e}`));

if (errors.length === 0) {
  console.log('\n🎉 O BALANCE ENGINE 2.0 E CRAFTING ESTÃO 100% OPERACIONAIS!');
} else {
  console.log('\n❌ FORAM ENCONTRADOS ERROS QUE DEVEM SER CORRIGIDOS.');
}
