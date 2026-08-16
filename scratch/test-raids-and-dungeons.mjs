import assert from 'assert';
import { RAID_BOSSES } from '../adenarena/lineage-idle/src/data/raids.js';
import { RINGS, EARRINGS, NECKLACES } from '../adenarena/lineage-idle/src/data/items/jewels.js';
const JEWELS = { ...RINGS, ...EARRINGS, ...NECKLACES };
import {
  checkAndResetDailyRaidTickets,
  getRaidStatus,
  canEnterRaid,
  startRaidBoss,
  processRaidBossMechanics,
  handleRaidVictory
} from '../adenarena/lineage-idle/src/services/RaidService.js';
import { CashShopService } from '../adenarena/lineage-idle/src/services/CashShopService.js';
import { getStats } from '../adenarena/lineage-idle/src/engine/StatsEngine.js';

console.log('=== TESTE 1: Estrutura dos 8 Chefes Épicos de Raid ===');
const bossList = Object.values(RAID_BOSSES);
assert(bossList.length >= 8, `Esperado pelo menos 8 chefes épicos, encontrou ${bossList.length}`);
console.log(`✓ ${bossList.length} Chefes Épicos carregados com sucesso.`);

for (const [id, boss] of Object.entries(RAID_BOSSES)) {
  assert.ok(boss.name, `Boss ${id} sem nome`);
  assert.ok(boss.hp > 0, `Boss ${id} sem HP`);
  assert.ok(boss.atk > 0, `Boss ${id} sem ATK`);
  assert.ok(boss.def > 0, `Boss ${id} sem DEF`);
  assert.ok(boss.mdef > 0, `Boss ${id} sem MDEF`);
  assert.ok(Array.isArray(boss.mechanics), `Boss ${id} sem mecânicas`);
  assert.ok(Array.isArray(boss.drops), `Boss ${id} sem drops`);
  console.log(`  - [Lv. ${boss.lvl}] ${boss.name} (${boss.title}) | HP: ${boss.hp.toLocaleString()} | Mecânicas: ${boss.mechanics.length} | Drops: ${boss.drops.length}`);
}

console.log('\n=== TESTE 2: Joias Épicas de Chefe Lendárias ===');
const epicJewelIds = [
  'jewel_ring_queen_ant',
  'jewel_ring_core',
  'jewel_earring_orfen',
  'jewel_earring_of_zaken',
  'jewel_ring_of_baium',
  'jewel_necklace_of_frintezza',
  'jewel_earring_of_antharas',
  'jewel_necklace_of_valakas',
  'jewel_ring_of_valakas'
];

for (const jId of epicJewelIds) {
  const jewel = JEWELS[jId];
  assert.ok(jewel, `Joia épica ${jId} não encontrada em JEWELS`);
  assert.strictEqual(jewel.rarity, 'legendary', `Joia ${jId} deveria ser rarity: legendary`);
  assert.ok(jewel.mdef >= 35, `Joia ${jId} deveria ter MDEF >= 35`);
  console.log(`  - 👑 ${jewel.name} [${jewel.rarity}] M.Def: ${jewel.mdef}, Passiva: ${jewel.special || 'Nenhum'}`);
}

console.log('\n=== TESTE 3: Controle de Ingressos Diários e Validações de Entrada ===');
const state = {
  level: 45,
  gold: 0,
  xp: 0,
  sp: 0,
  adenCoins: 0,
  inventory: [],
  dailyRaidTickets: undefined,
  dailyRaidClears: undefined
};

checkAndResetDailyRaidTickets(state);
assert.strictEqual(state.dailyRaidTickets, 3, 'Deveria ter 3 ingressos diários gratuitos');
assert.deepStrictEqual(state.dailyRaidClears, {}, 'Clears diários deveriam estar vazios');

// Nível 45 tentando Queen Ant (Req 30): Permitido
const canQA = canEnterRaid(state, 'queen_ant');
assert.strictEqual(canQA.canEnter, true, 'Deveria permitir Queen Ant no Lv 45');

// Nível 45 tentando Antharas (Req 85): Bloqueado
const canAntharas = canEnterRaid(state, 'antharas');
assert.strictEqual(canAntharas.canEnter, false, 'Deveria bloquear Antharas no Lv 45');
console.log(`✓ Validação de Nível: Queen Ant=${canQA.canEnter}, Antharas=${canAntharas.canEnter} (${canAntharas.reason})`);

console.log('\n=== TESTE 4: Início de Combate de Raid e Consumo de Ingresso ===');
const logs = [];
const fakeLog = (msg) => logs.push(msg);

const startedQA = startRaidBoss(state, 'queen_ant', { log: fakeLog });
assert.strictEqual(startedQA, true, 'Deveria iniciar Queen Ant');
assert.strictEqual(state.dailyRaidTickets, 2, 'Ingressos deveriam ser 2 após iniciar');
assert.strictEqual(state.isRaidActive, true, 'isRaidActive deveria ser true');
assert.strictEqual(state.activeMonster.isRaid, true, 'activeMonster.isRaid deveria ser true');
assert.ok(state.activeMonster.name.includes('Queen Ant'), 'activeMonster deveria ser Queen Ant');
console.log(`✓ Combate iniciado: ${state.activeMonster.name}, Ingressos restantes: ${state.dailyRaidTickets}/3`);

console.log('\n=== TESTE 5: Mecânicas de Chefe em Tempo Real ===');
state.maxHp = 1000;
state.hp = 1000;
// Reduz vida da Queen Ant para 40% (ativa mecanismo de 50%)
state.activeMonster.hp = state.activeMonster._maxHp * 0.40;
processRaidBossMechanics(state, { log: fakeLog });
assert.ok(state.activeMonster._triggeredMechanics[0], 'Mecânica 0 da Queen Ant deveria ter disparado');
console.log(`✓ Mecânica disparada: ${logs[logs.length - 1]}`);

console.log('\n=== TESTE 6: Vitória no Raid e Distribuição de Drops Épicos ===');
// Força 100% de drop para teste
const originalDrops = RAID_BOSSES['queen_ant'].drops;
RAID_BOSSES['queen_ant'].drops = [
  { itemId: 'jewel_ring_queen_ant', name: 'Ring of Queen Ant', chance: 1.0, isEpicJewel: true },
  { itemId: 'adena_coins', name: 'Aden Coins (AC)', count: 25, chance: 1.0 }
];

const dropsObtidos = handleRaidVictory(state, 'queen_ant', { log: fakeLog });
assert.ok(dropsObtidos.length >= 2, 'Deveria ter obtido pelo menos 2 drops');
assert.strictEqual(state.adenCoins, 25, 'Deveria ter recebido 25 AC');
assert.strictEqual(state.dailyRaidClears['queen_ant'], 1, 'Queen Ant clear count deveria ser 1');
assert.strictEqual(state.totalRaidKills, 1, 'totalRaidKills deveria ser 1');
assert.ok(state.inventory.some(i => i.itemId === 'jewel_ring_queen_ant'), 'Ring of Queen Ant deveria estar no inventário');

RAID_BOSSES['queen_ant'].drops = originalDrops;
console.log(`✓ Vitória registrada: +Aden Coins: ${state.adenCoins}, Joia no inventário: ${state.inventory[0].itemId}`);

console.log('\n=== TESTE 7: Starter Packs 1 e 2 - Herança Dinâmica Lv. 1 ===');
const packState = {
  level: 1,
  class: 'fighter',
  race: 'human',
  adenCoins: 500,
  inventory: [],
  equipment: {},
  buffs: {},
  skills: {}
};

// Compra Pack 1
const pack1Bought = CashShopService.buyStarterPack(packState, 'starter_pack_tier1', { log: fakeLog });
assert.strictEqual(pack1Bought, true, 'Deveria comprar Pack 1');
assert.ok(packState.inventory.some(i => i.itemId === 'armor_heirloom_chest_heavy'), 'Deveria ter Chest Heavy de Herança');
assert.ok(packState.inventory.some(i => i.itemId === 'weapon_heirloom_sword'), 'Deveria ter Espada de Herança');

// Compra Pack 2
packState.adenCoins = 1000;
const pack2Bought = CashShopService.buyStarterPack(packState, 'starter_pack_tier2', { log: fakeLog });
assert.strictEqual(pack2Bought, true, 'Deveria comprar Pack 2');
assert.ok(packState.inventory.some(i => i.itemId.includes('heirloom_necklace')), 'Deveria ter Colar de Herança');
assert.ok(packState.inventory.some(i => i.itemId.includes('heirloom_ring')), 'Deveria ter Anel de Herança');

console.log('✓ Starter Packs 1 e 2 entregam equipamentos de Herança Dinâmicos e Joias de Herança com sucesso!');
console.log('\n🎉 TODOS OS TESTES PASSARAM COM 100% DE SUCESSO!');
