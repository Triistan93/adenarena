// Teste da Loja Comercial de Aden (Aden Coins, 3 Starter Packs com Auto-Adaptação por Arquétipo, Cosméticos e Passes)

globalThis.window = globalThis;
globalThis.window.EchoData = {};
globalThis.window.GameData = {};

await import('../lineage-idle/data/echo-adapter.js');

const { CashShopService } = await import('../lineage-idle/src/services/CashShopService.js');
const { CASH_SHOP_CATALOG } = await import('../lineage-idle/src/data/shop/cash_shop_catalog.js');

console.log('🧪 TESTE DA LOJA COMERCIAL COM ADAPTAÇÃO POR ARQUÉTIPO (HEAVY / LIGHT / ROBE)...\n');

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

// ─── 1. TESTE COM MAGO (ROBE + CAJADO + SPIRITSHOTS) ─────────────────────────
console.log('🔮 1. Testando compra do Pack Tier 3 com Mago (Sorcerer):');
const mageState = {
  level: 1,
  class: 'sorcerer',
  adenCoins: 500,
  inventory: []
};

CashShopService.buyStarterPack(mageState, 'starter_pack_tier3', { log: (msg) => console.log('  [LOG]', msg) });
const hasMageRobe = mageState.inventory.some(i => i.itemId === 'armor_heirloom_chest_robe');
const hasStaff = mageState.inventory.some(i => i.itemId === 'weapon_heirloom_staff');
const hasSpiritshots = mageState.inventory.some(i => i.itemId === 'spiritshot_c' && i.count >= 15000);

assert(hasMageRobe, `Mago recebeu Túnica Arcana de Herança (Robe)`);
assert(hasStaff, `Mago recebeu Cajado de Herança do Arcano`);
assert(hasSpiritshots, `Mago recebeu 15.000x Spiritshots C-Grade`);

// ─── 2. TESTE COM ARQUEIRO (LIGHT + ARCO + SOULSHOTS) ─────────────────────────
console.log('\n🏹 2. Testando compra do Pack Tier 3 com Arqueiro (Hawkeye):');
const archerState = {
  level: 1,
  class: 'hawkeye',
  adenCoins: 500,
  inventory: []
};

CashShopService.buyStarterPack(archerState, 'starter_pack_tier3', { log: (msg) => console.log('  [LOG]', msg) });
const hasLightArmor = archerState.inventory.some(i => i.itemId === 'armor_heirloom_chest_light');
const hasBow = archerState.inventory.some(i => i.itemId === 'weapon_heirloom_bow');
const hasArcherSoulshots = archerState.inventory.some(i => i.itemId === 'soulshot_c' && i.count >= 15000);

assert(hasLightArmor, `Arqueiro recebeu Colete de Couro de Herança (Light)`);
assert(hasBow, `Arqueiro recebeu Arco de Herança da Floresta`);
assert(hasArcherSoulshots, `Arqueiro recebeu 15.000x Soulshots C-Grade`);

// ─── 3. TESTE COM VANGUARDA / GUERREIRO (HEAVY + LANÇA + SOULSHOTS) ──────────
console.log('\n⚔️ 3. Testando compra do Pack Tier 3 com Vanguarda (Vanguard Rider):');
const vanguardState = {
  level: 1,
  class: 'vanguard_rider',
  adenCoins: 500,
  inventory: []
};

CashShopService.buyStarterPack(vanguardState, 'starter_pack_tier3', { log: (msg) => console.log('  [LOG]', msg) });
const hasHeavyArmor = vanguardState.inventory.some(i => i.itemId === 'armor_heirloom_chest_heavy');
const hasSpear = vanguardState.inventory.some(i => i.itemId === 'weapon_heirloom_spear');
const hasVanguardSoulshots = vanguardState.inventory.some(i => i.itemId === 'soulshot_c' && i.count >= 15000);

assert(hasHeavyArmor, `Vanguard Rider recebeu Armadura de Placas de Herança (Heavy)`);
assert(hasSpear, `Vanguard Rider recebeu Lança de Herança do Vanguarda`);
assert(hasVanguardSoulshots, `Vanguard Rider recebeu 15.000x Soulshots C-Grade`);
assert(vanguardState.title === 'Lorde Soberano', `Título [Lorde Soberano] ativado`);
assert(vanguardState.activeAgathion === 'agathion_golden_dragon', `Agathion Dragão Dourado ativado`);
assert(vanguardState.vipTeleportUntil > Date.now(), `Passe VIP 30 Dias ativado`);

// ─── 4. TESTE DE COSMÉTICOS, TÍTULOS E UTILITÁRIOS ───────────────────────────
console.log('\n🎨 4. Testando compra de Cosméticos e Títulos:');
vanguardState.adenCoins = 1000;
CashShopService.buyCostumeOrSkin(vanguardState, 'skin_weapon_frost_lord');
assert(vanguardState.activeSkin === 'skin_weapon_frost_lord', `Skin Frost Lord equipada`);

CashShopService.buyTitleOrEffect(vanguardState, 'title_imperador');
assert(vanguardState.title === 'Imperador', `Título [Imperador] ativado`);

CashShopService.buyUtility(vanguardState, 'spellbook_4star_tome');
assert(vanguardState.inventory.some(i => i.itemId === 'spellbook_4star_tome'), `Tomo 4★ adicionado ao inventário`);

console.log(`\n========================================`);
console.log(`RESULTADO DOS TESTES DA LOJA: ${passed} PASSARAM, ${failed} FALHARAM`);
console.log(`========================================\n`);

if (failed > 0) process.exit(1);
