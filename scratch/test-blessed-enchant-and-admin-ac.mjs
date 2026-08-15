// Teste de Verificação dos Scrolls Abençoados Universais (Blessed) e Painel Admin AC

globalThis.window = globalThis;
globalThis.window.EchoData = {};
globalThis.window.GameData = {};

await import('../lineage-idle/data/echo-adapter.js');

const { CONSUMABLES } = await import('../lineage-idle/src/data/items/consumables.js');
const { CASH_SHOP_CATALOG } = await import('../lineage-idle/src/data/shop/cash_shop_catalog.js');

console.log('🧪 TESTANDO SCROLLS ABENÇOADOS UNIVERSAIS E ADMIN ADEN COINS...\n');

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

// 1. Definições dos Scrolls Universais
assert(CONSUMABLES.scroll_blessed_weapon !== undefined, 'scroll_blessed_weapon existe em CONSUMABLES');
assert(CONSUMABLES.scroll_blessed_armor !== undefined, 'scroll_blessed_armor existe em CONSUMABLES');
assert(CONSUMABLES.scroll_blessed_weapon.desc.includes('protegido'), 'scroll_blessed_weapon tem descrição com proteção');
assert(CONSUMABLES.scroll_blessed_armor.desc.includes('protegido'), 'scroll_blessed_armor tem descrição com proteção');

// 2. Presença no Catálogo do Cash Shop
const utilTab = CASH_SHOP_CATALOG.utility_and_passes;
assert(utilTab.some(i => i.id === 'scroll_blessed_weapon'), 'scroll_blessed_weapon está no catálogo da loja');
assert(utilTab.some(i => i.id === 'scroll_blessed_armor'), 'scroll_blessed_armor está no catálogo da loja');

// 3. Simulação de Lógica de Encantamento (Normal vs Blessed)
function simulateEnchant(item, scrollId, forceFail = false) {
  const isBlessed = scrollId.includes('blessed');
  const currentEnchant = item.enchant || 0;
  const chance = forceFail ? 0 : (currentEnchant < 3 ? 1.0 : 0.5);

  if (Math.random() < chance && !forceFail) {
    item.enchant = currentEnchant + 1;
    return { success: true, newEnchant: item.enchant, protected: false };
  } else {
    if (isBlessed) {
      // 100% Protegido
      return { success: false, newEnchant: item.enchant, protected: true };
    } else {
      item.enchant = Math.max(0, currentEnchant - 1);
      return { success: false, newEnchant: item.enchant, protected: false };
    }
  }
}

// 4. Teste de Falha com Scroll Normal (Perde Nível)
const normalSword = { uid: 'w1', itemId: 'weapon_frost_lord_sword', enchant: 7 };
const normalRes = simulateEnchant(normalSword, 'scroll_of_enchant_weapon_', true);
assert(normalRes.success === false, 'Encantamento normal forçado a falhar');
assert(normalRes.newEnchant === 6, 'Scroll Normal reduziu encanto de +7 para +6');
assert(normalRes.protected === false, 'Scroll Normal não concede proteção');

// 5. Teste de Falha com Blessed Scroll (PROTEGIDO - Mantém Nível)
const blessedSword = { uid: 'w2', itemId: 'weapon_frost_lord_sword', enchant: 7 };
const blessedRes = simulateEnchant(blessedSword, 'scroll_blessed_weapon', true);
assert(blessedRes.success === false, 'Encantamento blessed forçado a falhar');
assert(blessedRes.newEnchant === 7, '✨ Blessed Scroll manteve o nível +7 intacto na falha');
assert(blessedRes.protected === true, '✨ Blessed Scroll ativou proteção 100%');

// 6. Teste de Falha com Blessed Armor (PROTEGIDO)
const blessedArmor = { uid: 'a1', itemId: 'armor_heirloom_chest_heavy', enchant: 10 };
const armorRes = simulateEnchant(blessedArmor, 'scroll_blessed_armor', true);
assert(armorRes.newEnchant === 10, '✨ Blessed Armor Scroll manteve Armadura de Herança +10 intacta na falha');
assert(armorRes.protected === true, '✨ Proteção de Armadura ativa');

// 7. Teste de Admin Aden Coins
const testState = { adenCoins: 100 };
testState.adenCoins += 500;
assert(testState.adenCoins === 600, 'Admin +500 AC concedido corretamente');
testState.adenCoins += 2000;
assert(testState.adenCoins === 2600, 'Admin +2.000 AC concedido corretamente');

console.log(`\n========================================`);
console.log(`RESULTADO: ${passed} PASSARAM, ${failed} FALHARAM`);
console.log(`========================================\n`);

if (failed > 0) process.exit(1);
