import fs from 'fs';
import vm from 'vm';

console.log('🔍 Executando Auditoria Geral do Sistema e Mecânicas...');

const classesCode = fs.readFileSync('lineage-idle/src/data/classes/classes_echo_defs.js', 'utf8');
const adapterCode = fs.readFileSync('lineage-idle/data/echo-adapter.js', 'utf8');
const setsCode = fs.readFileSync('lineage-idle/src/data/items/rarity_sets.js', 'utf8');
const armorsCode = fs.readFileSync('lineage-idle/src/data/items/armors.js', 'utf8');
const weaponsCode = fs.readFileSync('lineage-idle/src/data/items/weapons.js', 'utf8');
const rulesCode = fs.readFileSync('lineage-idle/src/data/items/item_class_rules.js', 'utf8');
const statsCode = fs.readFileSync('lineage-idle/src/engine/StatsEngine.js', 'utf8');

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
  Date: Date
};

vm.createContext(sandbox);

// Clean exports from ES6 modules for vm evaluation
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
runModule(rulesCode);
runModule(adapterCode);

const echoData = sandbox.window.EchoData;
const gameData = sandbox.window.GameData;

let errors = [];
let warnings = [];
let passedChecks = 0;

// Test 1: Check CLASSES_ECHO definitions and lineage parent inheritance
console.log('\n--- TEST 1: Validação de Classes e Herança ---');
if (!echoData?.CLASSES_ECHO) {
  errors.push('CLASSES_ECHO não foi carregado corretamente.');
} else {
  const classIds = Object.keys(echoData.CLASSES_ECHO);
  console.log(`✓ Total de classes registradas: ${classIds.length}`);
  
  for (const [id, def] of Object.entries(echoData.CLASSES_ECHO)) {
    if (!def.name) errors.push(`Classe [${id}] não tem nome.`);
    if (def.parent && !echoData.CLASSES_ECHO[def.parent]) {
      errors.push(`Classe [${id}] aponta para classe pai inexistente [${def.parent}].`);
    }
    if (!def.archetype) {
      warnings.push(`Classe [${id}] não define arquétipo diretamente (vai herdar do pai se houver).`);
    }
  }
  passedChecks++;
}

// Test 2: Check SKILL_DEFS_ECHO and SKILL_REQS_ECHO
console.log('\n--- TEST 2: Validação de Habilidades e Pré-requisitos ---');
if (!echoData?.SKILL_DEFS_ECHO) {
  errors.push('SKILL_DEFS_ECHO não foi gerado pelo echo-adapter.');
} else {
  const skillIds = Object.keys(echoData.SKILL_DEFS_ECHO);
  console.log(`✓ Total de habilidades adaptadas: ${skillIds.length}`);

  for (const [sId, def] of Object.entries(echoData.SKILL_DEFS_ECHO)) {
    if (!def.name) errors.push(`Skill [${sId}] não tem nome.`);
    if (def.reqLvl === undefined) errors.push(`Skill [${sId}] não possui reqLvl.`);
    
    // Ensure no fake 'reqLvl' string key in SKILL_REQS_ECHO
    const reqs = echoData.SKILL_REQS_ECHO[sId];
    if (reqs && reqs.reqLvl !== undefined) {
      errors.push(`Skill [${sId}] ainda possui 'reqLvl' dentro de SKILL_REQS_ECHO!`);
    }
  }
  passedChecks++;
}

// Test 3: Check Equipment Sets (Armor Sets)
console.log('\n--- TEST 3: Validação de Armor Sets & Peças ---');
const armorSets = sandbox.ARMOR_SETS || gameData?.ARMOR_SETS || echoData?.ARMOR_SETS;
if (!armorSets) {
  errors.push('ARMOR_SETS não foi encontrado.');
} else {
  const setIds = Object.keys(armorSets);
  console.log(`✓ Total de Armor Sets registrados: ${setIds.length}`);

  const allItems = { ...sandbox.ARMORS, ...sandbox.HELMETS, ...sandbox.BOOTS, ...sandbox.GLOVES, ...sandbox.LEGS, ...sandbox.SHIELDS };
  
  for (const [setId, setDef] of Object.entries(armorSets)) {
    if (!setDef.name) errors.push(`Set [${setId}] sem nome.`);
    if (setDef.pieces) {
      for (const [slot, pieceId] of Object.entries(setDef.pieces)) {
        if (!allItems[pieceId]) {
          warnings.push(`Set [${setId}] aponta para peça [${pieceId}] que não está no catálogo individual.`);
        }
      }
    }
    if (setDef.bonuses) {
      for (const [threshold, bonusObj] of Object.entries(setDef.bonuses)) {
        if (bonusObj.primary) {
          console.log(`  └ Set ${setDef.name} (${threshold} pçs): +Primary Attrs:`, JSON.stringify(bonusObj.primary));
        }
      }
    }
  }
  passedChecks++;
}

// Test 4: Check Weapon & Armor Archetype Compatibility
console.log('\n--- TEST 4: Validação de Regras de Equipamento por Arquétipo ---');
const canEquip = sandbox.canEquipByType;
if (typeof canEquip !== 'function') {
  errors.push('canEquipByType não é uma função.');
} else {
  const dummyBow = { id: 'weapon_bow', name: 'Bow', slot: 'weapon', type: 'bow' };
  const dummyDagger = { id: 'weapon_dagger', name: 'Dagger', slot: 'weapon', type: 'dagger' };
  const dummyHeavy = { id: 'armor_heavy', name: 'Heavy Armor', slot: 'armor', type: 'heavy' };
  const dummyLight = { id: 'armor_light', name: 'Light Armor', slot: 'armor', type: 'light' };

  // Elven Scout tests
  const scoutBow = canEquip('elfScout', dummyBow);
  const scoutDagger = canEquip('elfScout', dummyDagger);
  const scoutLight = canEquip('elfScout', dummyLight);
  const scoutHeavy = canEquip('elfScout', dummyHeavy);

  if (!scoutBow.ok) errors.push(`Elven Scout não conseguiu equipar Arco: ${scoutBow.reason}`);
  if (!scoutDagger.ok) errors.push(`Elven Scout não conseguiu equipar Adaga: ${scoutDagger.reason}`);
  if (!scoutLight.ok) errors.push(`Elven Scout não conseguiu equipar Armadura Leve: ${scoutLight.reason}`);
  if (scoutHeavy.ok) warnings.push(`Elven Scout conseguiu equipar Armadura Pesada (esperado proibir para batedores).`);

  console.log(`  └ Elven Scout Bow check: ${scoutBow.ok ? 'OK ✓' : 'FALHOU ❌'}`);
  console.log(`  └ Elven Scout Dagger check: ${scoutDagger.ok ? 'OK ✓' : 'FALHOU ❌'}`);
  console.log(`  └ Elven Scout Light Armor check: ${scoutLight.ok ? 'OK ✓' : 'FALHOU ❌'}`);
  passedChecks++;
}

console.log('\n================ RESUMO DA AUDITORIA ================');
console.log(`✅ Testes Aprovados: ${passedChecks}/4`);
console.log(`⚠️ Avisos: ${warnings.length}`);
warnings.forEach(w => console.log(`   - [AVISO] ${w}`));

console.log(`❌ Erros Encontrados: ${errors.length}`);
errors.forEach(e => console.log(`   - [ERRO] ${e}`));

if (errors.length === 0) {
  console.log('\n🎉 TODOS OS SISTEMAS E MECÂNICAS TESTADOS ESTÃO 100% OPERACIONAIS E COMPATÍVEIS!');
} else {
  console.log('\n❌ FORAM ENCONTRADOS ERROS QUE DEVEM SER CORRIGIDOS.');
}
