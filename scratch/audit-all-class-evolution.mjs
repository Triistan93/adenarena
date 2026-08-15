import fs from 'fs';
import vm from 'vm';

const defsCode = fs.readFileSync('lineage-idle/src/data/classes/classes_echo_defs.js', 'utf8');
const adapterCode = fs.readFileSync('lineage-idle/data/echo-adapter.js', 'utf8');
const charServiceCode = fs.readFileSync('lineage-idle/src/services/CharacterService.js', 'utf8');
const statsCode = fs.readFileSync('lineage-idle/src/engine/StatsEngine.js', 'utf8');

const sandbox = { window: { GameData: {} }, console: console };
vm.createContext(sandbox);

function runCode(code) {
  const cleanCode = code
    .replace(/^import\s+.*$/gm, '// import')
    .replace(/^export\s+default\s+/gm, '')
    .replace(/^export\s+const\s+(\w+)/gm, 'var $1')
    .replace(/^export\s+function\s+(\w+)/gm, 'function $1')
    .replace(/^export\s+/gm, '');
  vm.runInContext(cleanCode, sandbox);
}

runCode(defsCode);
runCode(adapterCode);
runCode(statsCode);
runCode(charServiceCode);

const echoClasses = sandbox.window.EchoData.CLASSES_ECHO;
const classKeys = Object.keys(echoClasses);

console.log(`🔍 Auditoria Completa de Grau de Evolução de Classes (${classKeys.length} classes registradas)...\n`);

const issues = [];
const stagesCount = { 0: 0, 1: 0, 2: 0, 3: 0 };

for (const [clsId, clsDef] of Object.entries(echoClasses)) {
  const stage = clsDef.stage !== undefined ? clsDef.stage : 0;
  stagesCount[stage] = (stagesCount[stage] || 0) + 1;

  if (stage < 3) {
    const targetStage = stage + 1;
    // Find children in echoClasses matching stage target
    const children = [];
    for (const [childId, childDef] of Object.entries(echoClasses)) {
      if (!childDef || childDef.stage !== targetStage) continue;
      
      const parentKey = childDef.parent;
      if (
        parentKey === clsId
        || (parentKey === 'highElfBase' && clsId === 'highElfBase')
        || (parentKey === 'divineTemplarS1' && (clsId === 'divineTemplarS1' || clsId === 'lightTemplar'))
        || (parentKey === 'divineTemplarS2' && (clsId === 'divineTemplarS2' || clsId === 'holyTemplar'))
        || (parentKey === 'shinemakerS1' && (clsId === 'shineMakerS1' || clsId === 'shinemakerS1'))
        || (parentKey === 'shinemakerS2' && (clsId === 'shineMakerS2' || clsId === 'shinemakerS2'))
        || (parentKey === 'wargBase' && (clsId === 'wargBase' || clsId === 'wargS0'))
        || (parentKey === 'fighter' && ['fighter', 'elfFighter', 'darkElfFighter', 'orcBase'].includes(clsId))
        || (parentKey === 'mage' && ['mage', 'elfMage', 'darkElfMage'].includes(clsId))
        || (parentKey === 'artisan' && clsId === 'artisan')
        || (parentKey === 'soulbreaker' && clsId === 'soulbreaker')
        || (parentKey === 'sylphGunner' && clsId === 'sylphGunner')
        || (parentKey === 'bloodRoseBase' && clsId === 'bloodRoseBase')
        || (parentKey === 'wargBase' && clsId === 'wargBase')
        || (parentKey === 'deathPilgrim' && clsId === 'deathPilgrim')
        || (parentKey === 'assassinBase' && clsId === 'assassinBase')
      ) {
        children.push({ id: childId, name: childDef.name });
      }
    }

    if (children.length === 0) {
      issues.push(`⚠️ Classe [${clsId}] ("${clsDef.name}", Stage ${stage}) NÃO POSSUI opções de evolução para o Stage ${targetStage}!`);
    } else {
      console.log(`✓ [Stage ${stage}] ${clsId} ("${clsDef.name}") ➔ Stage ${targetStage} Opções (${children.length}): ${children.map(c => c.name + ' [' + c.id + ']').join(', ')}`);
    }
  }
}

console.log('\n--- RESUMO DE CLASSES POR STAGE ---');
console.log(`Stage 0 (Base Lv1): ${stagesCount[0]} classes`);
console.log(`Stage 1 (1st Transfer Lv20): ${stagesCount[1]} classes`);
console.log(`Stage 2 (2nd Transfer Lv40): ${stagesCount[2]} classes`);
console.log(`Stage 3 (3rd Transfer Lv76): ${stagesCount[3]} classes`);

if (issues.length > 0) {
  console.log(`\n❌ PROBLEMAS ENCONTRADOS (${issues.length}):`);
  issues.forEach(i => console.log(i));
} else {
  console.log('\n🎉 TODAS AS CLASSES DE STAGE 0, 1 E 2 POSSUEM SUAS OPÇÕES DE EVOLUÇÃO DE GRAU 100% GARANTIDAS!');
}
