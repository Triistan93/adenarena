import fs from 'fs';
import vm from 'vm';

const classesCode = fs.readFileSync('lineage-idle/src/data/classes/classes_echo_defs.js', 'utf8');
const adapterCode = fs.readFileSync('lineage-idle/data/echo-adapter.js', 'utf8');

const sandbox = { window: { EchoData: {} }, console: console };
vm.createContext(sandbox);

function runModule(code) {
  const cleanCode = code
    .replace(/^import\s+.*$/gm, '// import')
    .replace(/^export\s+default\s+/gm, '')
    .replace(/^export\s+/gm, '');
  vm.runInContext(cleanCode, sandbox);
}

runModule(classesCode);
runModule(adapterCode);

const echoData = sandbox.window.EchoData;
const classSkillsMap = echoData.CLASS_SKILLS_ECHO;
const classesDefs = echoData.CLASSES_ECHO;

const essenceClasses = [
  'divineTemplar', 'divineTemplarS1', 'divineTemplarS2', 'divineTemplarS3',
  'elementWeaver', 'elementWeaverS1', 'elementWeaverS2', 'elementWeaverS3',
  'warg', 'wargBase', 'wargS1', 'wargS2', 'wargS3',
  'samurai', 'hatamoto', 'ronin',
  'shinemaker', 'shinemakerS1', 'shinemakerS2', 'shinemakerS3',
  'stormBlaster', 'sylphGunner', 'sharpshooter', 'windSniper',
  'bloodRose', 'bloodRoseBase', 'bloodRoseS1', 'bloodRoseS2', 'bloodRoseS3',
  'marauder', 'eviscerator', 'ertheiaWarrior',
  'sayhaSeeker', 'sayhaSeer', 'windRiderErth'
];

console.log('🔍 Checando Mapeamento de Skills para as 9 Classes Especiais Essence...\n');

let missing = 0;
for (const cid of essenceClasses) {
  const def = classesDefs[cid];
  const skills = classSkillsMap[cid] || [];
  console.log(`Class ID [${cid}] (${def?.name || 'Indefinida'}): ${skills.length} skills encontradas`);
  if (skills.length === 0) missing++;
}

console.log(`\nClasses sem skills registradas: ${missing}`);
