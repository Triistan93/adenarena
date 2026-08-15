// Simula ambiente de browser para echo-adapter
globalThis.window = globalThis;
globalThis.window.EchoData = {};
globalThis.window.GameData = {};

await import('../lineage-idle/data/echo-adapter.js');

console.log('🧪 VERIFICANDO ARVORES GERADAS PELO ECHO-ADAPTER...\n');

const E = globalThis.window.EchoData;
const defs = E.SKILL_DEFS_ECHO;
const classSkills = E.CLASS_SKILLS_ECHO;
const layouts = E.SKILL_TREE_LAYOUT_ECHO;

console.log(`Total de skills no jogo: ${Object.keys(defs).length}`);
console.log(`Total de classes com árvore de skills: ${Object.keys(classSkills).length}\n`);

let passed = 0;
let failed = 0;

function assert(condition, name) {
  if (condition) {
    console.log(`  ✓ ${name}`);
    passed++;
  } else {
    console.error(`  ❌ FALHA: ${name}`);
    failed++;
  }
}

// 1. Orc Raider & Orc Rider
const orcRaiderSkills = classSkills['orcRaider'] || [];
const raiderSkills = classSkills['raider'] || [];
const orcRiderSkills = classSkills['orcRider'] || [];
const vanguardSkills = classSkills['vanguardRider'] || [];

assert(orcRaiderSkills.length > 0, `orcRaider possui ${orcRaiderSkills.length} skills na árvore`);
assert(raiderSkills.length > 0, `raider possui ${raiderSkills.length} skills na árvore`);
assert(orcRiderSkills.length > 0, `orcRider possui ${orcRiderSkills.length} skills na árvore`);
assert(vanguardSkills.length > 0, `vanguardRider possui ${vanguardSkills.length} skills na árvore`);

// 2. Dark Elf
const darkFighterSkills = classSkills['darkFighter'] || [];
const darkMageSkills = classSkills['darkMage'] || [];
const assassinSkills = classSkills['assassin'] || [];

assert(darkFighterSkills.length > 0, `darkFighter possui ${darkFighterSkills.length} skills na árvore`);
assert(darkMageSkills.length > 0, `darkMage possui ${darkMageSkills.length} skills na árvore`);
assert(assassinSkills.length > 0, `assassin possui ${assassinSkills.length} skills na árvore`);

// 3. Dwarf
const artisanSkills = classSkills['artisan'] || [];
const scavengerSkills = classSkills['scavenger'] || [];

assert(artisanSkills.length > 0, `artisan possui ${artisanSkills.length} skills na árvore`);
assert(scavengerSkills.length > 0, `scavenger possui ${scavengerSkills.length} skills na árvore`);

// 4. High Elf & Ertheia
const spiritMasterSkills = classSkills['spiritMaster'] || [];
const divineTemplarSkills = classSkills['divineTemplar'] || [];
const ertheiaFighterSkills = classSkills['ertheiaFighter'] || [];
const ertheiaMageSkills = classSkills['ertheiaMage'] || [];

assert(spiritMasterSkills.length > 0, `spiritMaster possui ${spiritMasterSkills.length} skills na árvore`);
assert(divineTemplarSkills.length > 0, `divineTemplar possui ${divineTemplarSkills.length} skills na árvore`);
assert(ertheiaFighterSkills.length > 0, `ertheiaFighter possui ${ertheiaFighterSkills.length} skills na árvore`);
assert(ertheiaMageSkills.length > 0, `ertheiaMage possui ${ertheiaMageSkills.length} skills na árvore`);

// 5. Verificar TODAS as classes
let zeroSkillClasses = [];
for (const [cls, list] of Object.entries(classSkills)) {
  if (!list || list.length === 0) {
    zeroSkillClasses.push(cls);
  }
}

assert(zeroSkillClasses.length === 0, `Zero classes sem skills no jogo (Classes vazias: ${zeroSkillClasses.length})`);

console.log(`\n========================================`);
console.log(`RESULTADO DO ECHO ADAPTER: ${passed} PASSARAM, ${failed} FALHARAM`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
}
