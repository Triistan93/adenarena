// Teste de Escalonamento Dinâmico de Itens de Herança (Heirloom Scaling Gear Lv 1 ao 40)

globalThis.window = globalThis;
globalThis.window.EchoData = {};
globalThis.window.GameData = {};

await import('../lineage-idle/data/echo-adapter.js');

const { HEIRLOOM_ITEMS } = await import('../lineage-idle/src/data/items/heirloom_items.js');
const { getHeirloomScaledStats, getEquipBonus } = await import('../lineage-idle/src/engine/StatsEngine.js');

console.log('🧪 TESTE DE ESCALONAMENTO DE ITENS DE HERANÇA (HEIRLOOM SCALING)...\n');

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

const swordDef = HEIRLOOM_ITEMS.weapon_heirloom_sword;
const armorDef = HEIRLOOM_ITEMS.armor_heirloom_chest;

// 1. Teste no Level 1 (Fase 1: No-Grade +50%)
const lvl1_sword = getHeirloomScaledStats(swordDef, 1);
const lvl1_armor = getHeirloomScaledStats(armorDef, 1);
assert(lvl1_sword.atk === 38, `Lv. 1 Espada de Herança possui 38 P.ATK (+50% No-Grade Verde) [Atual: ${lvl1_sword.atk}]`);
assert(lvl1_armor.def === 28, `Lv. 1 Armadura de Herança possui 28 P.DEF [Atual: ${lvl1_armor.def}]`);

// 2. Teste no Level 19 (Fase 1: Limite No-Grade)
const lvl19_sword = getHeirloomScaledStats(swordDef, 19);
assert(lvl19_sword.atk === 38, `Lv. 19 Espada de Herança mantém 38 P.ATK [Atual: ${lvl19_sword.atk}]`);

// 3. Teste no Level 20 (Fase 2: D-Grade +50%)
const lvl20_sword = getHeirloomScaledStats(swordDef, 20);
const lvl20_armor = getHeirloomScaledStats(armorDef, 20);
assert(lvl20_sword.atk === 85, `Lv. 20 Espada de Herança escala para 85 P.ATK (+50% D-Grade Verde) [Atual: ${lvl20_sword.atk}]`);
assert(lvl20_armor.def === 60, `Lv. 20 Armadura de Herança escala para 60 P.DEF [Atual: ${lvl20_armor.def}]`);

// 4. Teste no Level 39 (Fase 2: Limite D-Grade)
const lvl39_sword = getHeirloomScaledStats(swordDef, 39);
assert(lvl39_sword.atk === 85, `Lv. 39 Espada de Herança mantém 85 P.ATK [Atual: ${lvl39_sword.atk}]`);

// 5. Teste no Level 40+ (Fase 3: Maturidade C-Grade Pleno)
const lvl40_sword = getHeirloomScaledStats(swordDef, 40);
const lvl40_armor = getHeirloomScaledStats(armorDef, 40);
assert(lvl40_sword.atk === 138, `Lv. 40 Espada de Herança atinge ápice C-Grade Pleno de 138 P.ATK [Atual: ${lvl40_sword.atk}]`);
assert(lvl40_armor.def === 98, `Lv. 40 Armadura de Herança atinge ápice C-Grade Pleno de 98 P.DEF [Atual: ${lvl40_armor.def}]`);

// 6. Teste de Lança de Herança para Vanguard Rider
const spearDef = HEIRLOOM_ITEMS.weapon_heirloom_spear;
const lvl1_spear = getHeirloomScaledStats(spearDef, 1);
const lvl40_spear = getHeirloomScaledStats(spearDef, 40);
assert(lvl1_spear.atk === 38 && lvl1_spear.aoeTargets === 2, `Lv. 1 Lança de Herança adapta alvos em área (2 alvos)`);
assert(lvl40_spear.atk === 138 && lvl40_spear.aoeTargets === 4, `Lv. 40 Lança de Herança atinge 4 alvos em área`);

// 7. Teste de Cajado Arcano de Herança para Magos
const staffDef = HEIRLOOM_ITEMS.weapon_heirloom_staff;
const lvl1_staff = getHeirloomScaledStats(staffDef, 1);
const lvl40_staff = getHeirloomScaledStats(staffDef, 40);
assert(lvl1_staff.matk === 45, `Lv. 1 Cajado de Herança possui 45 M.ATK`);
assert(lvl40_staff.matk === 165, `Lv. 40 Cajado de Herança possui 165 M.ATK`);

console.log(`\n========================================`);
console.log(`RESULTADO DOS TESTES DE HERANÇA: ${passed} PASSARAM, ${failed} FALHARAM`);
console.log(`========================================\n`);

if (failed > 0) process.exit(1);
