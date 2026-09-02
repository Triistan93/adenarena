/**
 * test-clan-castle-system.mjs — Testes Unitários do Sistema Completo de Clãs & Castelos
 */

import { ClanService } from '../lineage-idle/src/services/ClanService.js';
import { CLAN_CRESTS, CLAN_LEVEL_DATA, CLAN_SKILLS, CLAN_DONATIONS, CLAN_SHOP_CATALOG } from '../lineage-idle/src/data/clan.js';
import { getStats } from '../lineage-idle/src/engine/StatsEngine.js';

let passed = 0;
let total = 0;

function assert(desc, condition) {
  total++;
  if (condition) {
    console.log(`  ✅ [PASS] ${desc}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${desc}`);
  }
}

console.log('🧪 Iniciando Testes do Sistema de Clãs, Doações, Loja & Castelos...\n');

// 1. Estado Inicial: Sem Clã
console.log('--- 🏛️ 1. Estado Sem Clã (Criação e Listagem) ---');
const state = {
  charName: 'Tristan',
  level: 45,
  gold: 10000000,
  sp: 500000,
  clan: { joined: false },
  inventory: [],
  worldClans: []
};

const initialStatus = ClanService.getClanStatus(state);
assert('Identificou que o jogador não possui clã', initialStatus.hasClan === false);
assert('Lista de clãs do mundo é um array vazio (sem clãs default)', Array.isArray(initialStatus.worldClans) && initialStatus.worldClans.length === 0);

// 2. Criação de Clã com Validações
console.log('\n--- 👑 2. Criação de Clã com Bandeira/Brasão ---');
const createRes = ClanService.createClan(state, {
  name: 'ImperiumSol',
  crestId: 'dragon_crimson'
}, {});

assert('Fundou o Clã ImperiumSol com sucesso', createRes.success === true);
assert('Jogador é o Líder do Clã fundado', state.clan.role === 'leader');
assert('Brasão do Clã é o Dragão Carmesim', state.clan.crestId === 'dragon_crimson');
assert('Clã foi fundado no Nível 1', state.clan.level === 1);
assert('Possui 3 membros iniciais com status online/offline', (state.clan.members || []).length === 3);
assert('Clã apareceu na lista worldClans após criação', state.worldClans.some(wc => wc.name === 'ImperiumSol'));

// 3. Avaliação de Solicitação de Recrutamento
console.log('\n--- 📨 3. Recrutamento e Gestão de Membros ---');
assert('Possui 1 candidato pendente', (state.clan.pendingApplicants || []).length === 1);
const applicantId = state.clan.pendingApplicants[0].id;
const acceptRes = ClanService.handleJoinRequest(state, applicantId, true, {});
assert('Líder aceitou novo membro no clã', acceptRes.success === true);
assert('Membro agora faz parte do Roster', state.clan.members.length === 4);

// 4. Promoção de Membro
const promoteRes = ClanService.promoteMember(state, 'Sir Galahad', {});
assert('Promoveu Sir Galahad a Vice-Líder', promoteRes.success === true);
const galahad = state.clan.members.find(m => m.name === 'Sir Galahad');
assert('Cargo de Sir Galahad é vice_leader', galahad.role === 'vice_leader');

// 5. Doações Diárias (3x ao dia)
console.log('\n--- ✨ 4. Doações Diárias & Moedas de Clã ---');
const don1 = ClanService.donateToClan(state, 'basic', {});
assert('Realizou a 1ª doação básica com sucesso (+100 Moedas, +100 EXP)', don1.success === true && state.clanCoins === 100);

const don2 = ClanService.donateToClan(state, 'noble', {});
assert('Realizou a 2ª doação nobre com sucesso (+350 Moedas, +400 EXP)', don2.success === true && state.clanCoins === 450);

const don3 = ClanService.donateToClan(state, 'royal', {});
assert('Realizou a 3ª doação real com sucesso (+1000 Moedas, +1200 EXP)', don3.success === true && state.clanCoins === 1450);
assert('Contador de doações hoje atingiu 3/3', state.clanDonationsToday === 3);

const don4 = ClanService.donateToClan(state, 'basic', {});
assert('Recusou 4ª doação por exceder o limite diário de 3x', don4.success === false && don4.reason === 'daily_limit');

// 6. Compras na Loja do Clã
console.log('\n--- 🛍️ 5. Loja do Clã (Clan Shop) ---');
const buyItem = ClanService.buyClanShopItem(state, 'potion_clan_vitality', 2, {});
assert('Comprou 2x Poções de Vitalidade do Clã usando Moedas de Clã', buyItem.success === true);
assert('Moedas de Clã foram deduzidas corretamente', state.clanCoins === 1450 - (80 * 2));
assert('Item foi entregue no inventário', state.inventory.some(i => i.itemId === 'potion_clan_vitality'));

// 7. Evolução de Nível do Clã (Upgrade Clan)
console.log('\n--- ⬆️ 6. Evolução de Nível do Clã (Level Up) ---');
state.clan.exp = 5000;
state.clan.gold = 1000000;
const upgRes = ClanService.upgradeClan(state, {});
assert('Evoluiu o Clã para o Nível 2 com sucesso', upgRes.success === true && state.clan.level === 2);

// 8. Bônus de Clan Skills no StatsEngine
console.log('\n--- 🛡️ 7. Integração de Habilidades no StatsEngine ---');
const statsLv2 = getStats(state);
assert('StatsEngine calculou atributos com bônus de Clã Lv. 2 ativo', (statsLv2.atk || 0) > 0);

// 9. Saída de Clã
console.log('\n--- 🚪 8. Deixar Clã ---');
const leaveRes = ClanService.leaveClan(state, {});
assert('Deixou o clã com sucesso', leaveRes.success === true);
assert('Estado indica jogador sem clã', state.clan.joined === false);
assert('Após sair, getClanStatus indica hasClan=false', ClanService.getClanStatus(state).hasClan === false);

// 10. Criar segundo clã após sair do primeiro
console.log('\n--- 🔄 9. Criar Novo Clã Após Sair ---');
const create2 = ClanService.createClan(state, { name: 'BloodOath', crestId: 'wolf_silver' }, {});
assert('Criou novo clã BloodOath após sair do anterior', create2.success === true);
assert('Novo clã ativo é BloodOath', state.clan.name === 'BloodOath');
assert('Cargo no novo clã é leader', state.clan.role === 'leader');

console.log(`\n========================================`);
console.log(`Total: ${total} | Passaram: ${passed} | Falharam: ${total - passed}`);
console.log(`========================================\n`);

if (passed === total) {
  console.log('🎉 SUCESSO! Sistema Completo de Clãs & Castelos 100% aprovado!');
  process.exit(0);
} else {
  console.error('❌ ALGUNS TESTES FALHARAM!');
  process.exit(1);
}
