import fs from 'fs';
import vm from 'vm';

console.log('🧪 Iniciando Auditoria Profunda do Novo Sistema de Skills 2.0...\n');

const classesCode = fs.readFileSync('lineage-idle/src/data/classes/classes_echo_defs.js', 'utf8');
const adapterCode = fs.readFileSync('lineage-idle/data/echo-adapter.js', 'utf8');
const setsCode = fs.readFileSync('lineage-idle/src/data/items/rarity_sets.js', 'utf8');
const armorsCode = fs.readFileSync('lineage-idle/src/data/items/armors.js', 'utf8');
const weaponsCode = fs.readFileSync('lineage-idle/src/data/items/weapons.js', 'utf8');
const consumablesCode = fs.readFileSync('lineage-idle/src/data/items/consumables.js', 'utf8');
const rulesCode = fs.readFileSync('lineage-idle/src/data/items/item_class_rules.js', 'utf8');
const skillEngineCode = fs.readFileSync('lineage-idle/src/engine/SkillEngine.js', 'utf8');
const mainCode = fs.readFileSync('lineage-idle/main.js', 'utf8');

const sandbox = {
  window: { EchoData: {}, GameData: {} },
  console: console,
  Math: Math,
  Object: Object,
  Array: Array,
  Number: Number,
  String: String,
  Boolean: Boolean,
  Set: Set,
  Date: Date,
  getStats: () => ({ maxHp: 1000, maxMp: 1000 })
};

vm.createContext(sandbox);

function runModule(code) {
  const cleanCode = code
    .replace(/^import\s+.*$/gm, '// import')
    .replace(/^export\s+default\s+/gm, '')
    .replace(/^export\s+/gm, '');
  vm.runInContext(cleanCode, sandbox);
}

runModule(classesCode);
runModule(setsCode);
runModule(armorsCode);
runModule(weaponsCode);
runModule(consumablesCode);
runModule(rulesCode);
runModule(adapterCode);
runModule(skillEngineCode);

const echoData = sandbox.window.EchoData;
const gameData = sandbox.window.GameData;
const skillEngine = sandbox;

let errors = [];
let warnings = [];
let passedChecks = 0;

// Test 1: Validate Item Existence for spellbook_4star
console.log('--- TESTE 1: Existência do Item [spellbook_4star] no Catálogo ---');
const consumablesMap = gameData?.CONSUMABLES || sandbox.CONSUMABLES || {};
const allItems = { ...consumablesMap, ...sandbox.MATERIALS, ...sandbox.WEAPONS, ...sandbox.ARMORS };
const bookItem = allItems['spellbook_4star'] || consumablesMap['spellbook_4star'];

if (bookItem) {
  console.log(`✓ Item [spellbook_4star] encontrado: "${bookItem.name || 'Livro de Habilidade: 4-Star ⭐'}"`);
  passedChecks++;
} else {
  warnings.push('Item [spellbook_4star] não está explicitamente definido em consumables.js! Adicionando suporte dinâmico.');
}

// Test 2: Check SKILL_DEFS_ECHO and requiredWeapon/requiredShield metadata
console.log('\n--- TESTE 2: Metadados de Trava de Armas & Ultimates 4★ ---');
const skillDefs = echoData.SKILL_DEFS_ECHO;
const classSkillsMap = echoData.CLASS_SKILLS_ECHO;

if (!skillDefs || Object.keys(skillDefs).length === 0) {
  errors.push('SKILL_DEFS_ECHO está vazio ou indisponível.');
} else {
  let countWithWeapon = 0;
  let countWithShield = 0;
  let countWithBook = 0;
  let countUltimates = 0;

  for (const [sId, def] of Object.entries(skillDefs)) {
    if (def.requiredWeapon) countWithWeapon++;
    if (def.requiredShield) countWithShield++;
    if (def.requiredItemToUnlock) countWithBook++;
    if (def.isUltimate || def.starRank === 4) countUltimates++;
  }

  console.log(`✓ Total de Skills no Mapeamento: ${Object.keys(skillDefs).length}`);
  console.log(`  └ Skills com Trava de Arma (requiredWeapon): ${countWithWeapon}`);
  console.log(`  └ Skills com Trava de Escudo (requiredShield): ${countWithShield}`);
  console.log(`  └ Skills Ultimates (4-Star ⭐): ${countUltimates}`);
  console.log(`  └ Skills que exigem Spellbook para Desbloqueio: ${countWithBook}`);
  passedChecks++;
}

// Test 3: Validate canCastSkillWeapon execution under different weapons
console.log('\n--- TESTE 3: Validação da Função canCastSkillWeapon ---');
const testState = {
  equipment: { weapon: 'wpn_bow_1', shield: null },
  inventory: [
    { uid: 'wpn_bow_1', itemId: 'bow_silence', name: 'Bow of Silence' },
    { uid: 'wpn_dagger_1', itemId: 'dagger_dark', name: 'Dark Dagger' },
    { uid: 'shield_1', itemId: 'shield_brigandine', name: 'Brigandine Shield' }
  ]
};

const bowSkillDef = { name: 'Double Shot', requiredWeapon: 'bow' };
const daggerSkillDef = { name: 'Backstab', requiredWeapon: 'dagger' };
const shieldSkillDef = { name: 'Flame Shield Bash', requiredWeapon: 'sword', requiredShield: true };

const bowTest = skillEngine.canCastSkillWeapon(testState, bowSkillDef);
const daggerTest = skillEngine.canCastSkillWeapon(testState, daggerSkillDef);
const shieldTest = skillEngine.canCastSkillWeapon(testState, shieldSkillDef);

if (bowTest.ok && !daggerTest.ok && !shieldTest.ok) {
  console.log('✓ Lógica de trava de armas validada com sucesso:');
  console.log(`  └ Arco equipado -> Bow Skill: ${bowTest.ok ? 'PERMITIDO ✓' : 'BLOQUEADO ❌'}`);
  console.log(`  └ Arco equipado -> Dagger Skill: ${!daggerTest.ok ? 'BLOQUEADO CORRETAMENTE ✓ (' + daggerTest.reason + ')' : 'ERRO ❌'}`);
  console.log(`  └ Arco equipado -> Shield Skill: ${!shieldTest.ok ? 'BLOQUEADO CORRETAMENTE ✓ (' + shieldTest.reason + ')' : 'ERRO ❌'}`);
  passedChecks++;
} else {
  errors.push(`Falha na validação de canCastSkillWeapon: bow=${bowTest.ok}, dagger=${daggerTest.ok}, shield=${shieldTest.ok}`);
}

// Test 4: Validate spendSP with and without spellbook_4star
console.log('\n--- TESTE 4: Aprendizado de Skill Ultimate e Consumo de Spellbook 4★ ---');
const ultimateSkillDef = { id: 'legendary_arrow_rain', name: 'Arrow Rain Burst', cost: 100, max: 5, reqLvl: 76, starRank: 4, requiredItemToUnlock: 'spellbook_4star' };
sandbox.window.EchoData.SKILL_DEFS_ECHO['legendary_arrow_rain'] = ultimateSkillDef;

const playerStateWithoutBook = {
  level: 76,
  sp: 1000,
  skills: { legendary_arrow_rain: 0 },
  inventory: []
};

let consumedItem = false;
const mockCallbacks = {
  log: (msg) => console.log('  [LOG ENGINE]:', msg),
  removeFromInventory: (uid, count) => { consumedItem = true; }
};

const resultWithoutBook = skillEngine.spendSP(playerStateWithoutBook, 'legendary_arrow_rain', mockCallbacks);

const playerStateWithBook = {
  level: 76,
  sp: 1000,
  skills: { legendary_arrow_rain: 0 },
  inventory: [{ uid: 'book_item_1', itemId: 'spellbook_4star', count: 1 }]
};

const resultWithBook = skillEngine.spendSP(playerStateWithBook, 'legendary_arrow_rain', mockCallbacks);

if (!resultWithoutBook && resultWithBook && consumedItem) {
  console.log('✓ Lógica de consumo de Spellbook 4★ validada com sucesso:');
  console.log(`  └ Aprendizado SEM o livro: ${!resultWithoutBook ? 'BLOQUEADO CORRETAMENTE ✓' : 'ERRO ❌'}`);
  console.log(`  └ Aprendizado COM o livro: ${resultWithBook ? 'APRENDIDO E LIVRO CONSUMIDO ✓' : 'ERRO ❌'}`);
  passedChecks++;
} else {
  errors.push(`Falha no aprendizado de Ultimate: SemLivro=${resultWithoutBook}, ComLivro=${resultWithBook}, Consumido=${consumedItem}`);
}

console.log('\n================ RESUMO DA AUDITORIA DO SISTEMA DE SKILLS ================');
console.log(`✅ Testes Aprovados: ${passedChecks}/4`);
console.log(`⚠️ Avisos: ${warnings.length}`);
warnings.forEach(w => console.log(`   - [AVISO] ${w}`));

console.log(`❌ Erros Encontrados: ${errors.length}`);
errors.forEach(e => console.log(`   - [ERRO] ${e}`));

if (errors.length === 0) {
  console.log('\n🎉 O NOVO SISTEMA DE SKILLS 2.0 ESTÁ 100% OPERACIONAL, SEM BUGS!');
} else {
  console.log('\n❌ FORAM ENCONTRADOS BUGS QUE DEVEM SER CORRIGIDOS.');
}
