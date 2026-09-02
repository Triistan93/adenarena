import fs from 'fs';
import vm from 'vm';

const armorsCode = fs.readFileSync('lineage-idle/src/data/items/armors.js', 'utf8');
const weaponsCode = fs.readFileSync('lineage-idle/src/data/items/weapons.js', 'utf8');
const balanceCode = fs.readFileSync('lineage-idle/src/engine/BalanceEngine.js', 'utf8');

const sandbox = { window: { GameData: {} }, console: console };
vm.createContext(sandbox);

function runModule(code) {
  const cleanCode = code
    .replace(/^import\s+.*$/gm, '// import')
    .replace(/^export\s+default\s+/gm, '')
    .replace(/^export\s+const\s+(\w+)/gm, 'var $1')
    .replace(/^export\s+function\s+(\w+)/gm, 'function $1')
    .replace(/^export\s+/gm, '');
  vm.runInContext(cleanCode, sandbox);
}

runModule(armorsCode);
runModule(weaponsCode);
runModule(balanceCode);

const allItems = {
  ...(sandbox.ARMORS || {}),
  ...(sandbox.HELMETS || {}),
  ...(sandbox.GLOVES || {}),
  ...(sandbox.BOOTS || {}),
  ...(sandbox.LEGS || {}),
  ...(sandbox.WEAPONS || {})
};
const balance = sandbox;

console.log('🔍 Testando getItemGrade e checkGradePenalty em tempo de execução real...\n');

const testItems = [
  'armor_bronze_helmet',
  'bronze_helmet',
  'armor_bronze_breastplate_heavy',
  'bronze_breastplate_heavy',
  'armor_bronze_gaiters_heavy',
  'bronze_gaiters_heavy',
  'armor_bronze_gloves',
  'bronze_gloves',
  'weapon_knight_sword',
  'knight_sword'
];

for (const id of testItems) {
  const def = allItems[id];
  if (!def) {
    console.log(`❌ Item ID [${id}] NÃO ENCONTRADO em ALL_ITEMS`);
    continue;
  }
  const grade = balance.getItemGrade(def);
  const penalty = balance.checkGradePenalty(1, def);
  console.log(`Item [${id}] ("${def.name}"): grade="${grade}", tier=${def.tier}, reqLvl=${def.req?.level} ➔ Penalty Nível 1: ${penalty.hasPenalty ? '❌ PENALIDADE (' + penalty.reason + ')' : '✅ OK (Sem penalidade)'}`);
}

console.log('\n--- TESTE DE ESTADO DE JOGADOR NÍVEL 1 COM KIT BRONZE + KNIGHT SWORD EQUIPADO ---');
const starterPlayerState = {
  level: 1,
  equipment: {
    helmet: 'eq_1',
    armor: 'eq_2',
    legs: 'eq_3',
    gloves: 'eq_4',
    boots: 'eq_5',
    weapon: 'eq_6'
  },
  inventory: [
    { uid: 'eq_1', itemId: 'armor_bronze_helmet' },
    { uid: 'eq_2', itemId: 'armor_bronze_breastplate_heavy' },
    { uid: 'eq_3', itemId: 'armor_bronze_gaiters_heavy' },
    { uid: 'eq_4', itemId: 'armor_bronze_gloves' },
    { uid: 'eq_5', itemId: 'armor_bronze_boots' },
    { uid: 'eq_6', itemId: 'weapon_knight_sword' }
  ]
};

// Bind ALL_ITEMS to window.GameData.ALL_ITEMS for BalanceEngine lookup
sandbox.window.GameData = { ALL_ITEMS: allItems };

const totalPenalty = balance.getPlayerTotalGradePenalty(starterPlayerState);
console.log(`Resultado getPlayerTotalGradePenalty Nível 1 Kit Bronze: count=${totalPenalty.totalPenalties}, hasAnyPenalty=${totalPenalty.hasAnyPenalty}, mult=${totalPenalty.penaltyMultiplier}`);
if (!totalPenalty.hasAnyPenalty && totalPenalty.totalPenalties === 0) {
  console.log('🎉 SUCESSO ABSOLUTO: Kit Bronze + Knight Sword no Nível 1 NÃO tem nenhuma penalidade de Grau!');
} else {
  console.log('❌ FALHA: Kit Bronze no Nível 1 ainda gerou penalidade!');
}
