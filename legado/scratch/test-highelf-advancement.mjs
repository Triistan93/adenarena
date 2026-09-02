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

console.log('🧪 Validando Sequência de Evolução de Classe do High Elf Templar...\n');

const stages = [
  { level: 1,  classKey: 'highElfBase', expectedName: 'Templar', stage: 0 },
  { level: 20, classKey: 'divineTemplarS1', expectedName: 'Light Templar', stage: 1 },
  { level: 40, classKey: 'divineTemplarS2', expectedName: 'Holy Templar', stage: 2 },
  { level: 76, classKey: 'divineTemplarS3', expectedName: 'Divine Templar', stage: 3 }
];

let allPassed = true;

for (const s of stages) {
  const clsDef = sandbox.getClass(s.classKey);
  const skills = sandbox.getClassSkills(s.classKey);
  if (clsDef && clsDef.name === s.expectedName && clsDef.stage === s.stage && skills && skills.length > 0) {
    console.log(`✓ Nível ${s.level} (Stage ${s.stage}): Classe "${clsDef.name}" [key: ${s.classKey}] ➔ ${skills.length} skills configuradas ✓`);
  } else {
    console.log(`❌ ERRO no Nível ${s.level}: Esperado "${s.expectedName}" (stage ${s.stage}), obtido: ${clsDef?.name}`);
    allPassed = false;
  }
}

if (allPassed) {
  console.log('\n🎉 SEQUÊNCIA DE EVOLUÇÃO HIGH ELF TEMPLAR VALIDADA COM 100% DE SUCESSO!');
}
