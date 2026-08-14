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

console.log('🔍 Auditando Resolução de Skills e Personagem High Elf...\n');

const candidateClassKeys = [
  'highElfBase', 'highelf', 'highElf', 'High Elf',
  'divineTemplarS1', 'divineTemplarS2', 'divineTemplarS3',
  'divineTemplar', 'divine_templar', 'Divine Templar'
];

for (const cKey of candidateClassKeys) {
  const clsDef = sandbox.getClass(cKey);
  const skills = sandbox.getClassSkills(cKey);
  const treeKey = sandbox.getSkillTreeKey(cKey);

  console.log(`Testing state.class = "${cKey}":`);
  console.log(`  ├ getClass: ${clsDef ? 'ENCONTRADO (' + clsDef.name + ', stage=' + clsDef.stage + ', parent=' + (clsDef.parent || 'none') + ')' : 'NÃO ENCONTRADO ❌'}`);
  console.log(`  ├ getClassSkills: ${skills ? 'ENCONTRADO (' + skills.length + ' skills)' : 'NULO ❌'}`);
  console.log(`  └ getSkillTreeKey: ${treeKey ? '"' + treeKey + '"' : 'NULO ❌'}`);
}
