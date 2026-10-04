import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';
import { ClanService } from '../lineage-idle/src/services/ClanService.js';
import { ClanSocialService, normalizeClanName, validateClanName } from '../lineage-idle/src/services/ClanSocialService.js';

describe('Etapa 4 — Clãs com um Propósito Coerente: Ciclo Social, Cargos, Permissões e Contratos Coletivos', () => {

  // ── 1. Estado Inicial e Isolamento de Vantagens ─────────────────────────
  describe('1. Estado Inicial de Novo Personagem', () => {
    it('novo personagem começa sem clã e com zero bônus de combate ou CP', () => {
      const state = DEFAULT_STATE();
      const status = ClanService.getClanStatus(state);

      assert.equal(status.clan, null);
      assert.equal(status.bonusStats.pAtkBonusPercent, 0);
      assert.equal(status.bonusStats.pDefBonusPercent, 0);
      assert.equal(status.bonusStats.hpBonusPercent, 0);
      assert.equal(status.bonusStats.cpBonusPercent, 0);
      assert.deepEqual(status.activeSkills, []);
      assert.deepEqual(ClanService.getClanRoster(state), []);
    });

    it('rejeita doação ou ativação de bênçãos para personagem sem clã', () => {
      const state = DEFAULT_STATE();
      state.gold = 500000;
      state.sp = 50000;

      const donateRes = ClanService.donateToClan(state, 10000, 1000);
      assert.equal(donateRes.success, false);
      assert.equal(donateRes.reason, 'no_clan');
      assert.equal(state.gold, 500000, 'Saldo deve permanecer intacto');

      const buffRes = ClanService.activateClanHallBuff(state, 'paagrio_protection');
      assert.equal(buffRes.success, false);
      assert.equal(buffRes.reason, 'no_clan');
    });
  });

  // ── 2. Nomes e Validação Canônica ────────────────────────────────────────
  describe('2. Validação e Normalização de Nomes de Clã', () => {
    it('normaliza nomes mantendo chave determinística sem acentos', () => {
      assert.equal(normalizeClanName('Legião de Elmore'), 'legiao-de-elmore');
      assert.equal(normalizeClanName('  Ordem Sagrada de Giran  '), 'ordem-sagrada-de-giran');
    });

    it('valida regras de tamanho e caracteres para nomes de clã', () => {
      assert.equal(validateClanName('L2'), 'name_too_short');
      assert.equal(validateClanName('NomeComMaisDeVinteEQuatroCaracteresExtenso'), 'name_too_long');
      assert.equal(validateClanName('***$$$***'), 'name_invalid');
      assert.equal(validateClanName('Cavaleiros da Alvorada'), null);
    });
  });

  // ── 3. Ciclo Social de Liderança e Cargos ─────────────────────────────────
  describe('3. Permissões de Líder vs Membros (ClanSocialService)', () => {
    it('define contratos de cargos e papéis no clã', () => {
      const contracts = ClanSocialService.getCollectiveContracts();
      assert.ok(Array.isArray(contracts));
      assert.equal(contracts.length, 3);
      assert.ok(contracts.some(c => c.id === 'monster_hunt'));
      assert.ok(contracts.some(c => c.id === 'treasury_donation'));
      assert.ok(contracts.some(c => c.id === 'expedition_conquest'));
    });
  });

  // ── 4. Objetivos Coletivos de Clã (Contratos de Temporada) ───────────────
  describe('4. Objetivos Coletivos de Lançamento (Contratos de Clã)', () => {
    it('rejeita contribuição em contrato se o jogador não tiver clã', () => {
      const state = DEFAULT_STATE();
      const res = ClanService.progressClanContract(state, 'monster_hunt', 10);
      assert.equal(res.success, false);
      assert.equal(res.reason, 'no_clan');
    });

    it('registra progresso incremental em contratos coletivos', () => {
      const state = DEFAULT_STATE();
      state.clan = { id: 'clan-1', name: 'Aliança Real', level: 1, reputation: 100, members: [] };

      const initialContracts = ClanService.getClanContractsProgress(state);
      assert.equal(initialContracts.length, 3);
      assert.equal(initialContracts[0].current, 0);
      assert.equal(initialContracts[0].completed, false);

      // Adiciona 50 abates ao contrato de caça
      const prog1 = ClanService.progressClanContract(state, 'monster_hunt', 50);
      assert.equal(prog1.success, true);
      assert.equal(prog1.completed, false);
      assert.equal(prog1.current, 50);

      const updated = ClanService.getClanContractsProgress(state);
      const hunt = updated.find(c => c.id === 'monster_hunt');
      assert.equal(hunt.current, 50);
      assert.equal(hunt.percent, 25); // 50 / 200 = 25%
    });

    it('ao atingir a meta coletiva, conclui o contrato, concede reputação e ativa bênção de 24h', () => {
      const state = DEFAULT_STATE();
      state.clan = { id: 'clan-1', name: 'Aliança Real', level: 1, reputation: 100, members: [] };

      // Contribui até atingir a meta de 200 monstros
      const completeRes = ClanService.progressClanContract(state, 'monster_hunt', 200);
      assert.equal(completeRes.success, true);
      assert.equal(completeRes.completed, true);

      // Reputação sobe em +500
      assert.equal(state.clan.reputation, 600);

      // Buff coletivo concedido por 24 horas
      assert.ok(state.buffs['clan_contract_monster_hunt']);
      assert.match(state.buffs['clan_contract_monster_hunt'].name, /Frente de Batalha/);

      // Tentativa consecutiva deve acusar que já está concluído
      const extraRes = ClanService.progressClanContract(state, 'monster_hunt', 10);
      assert.equal(extraRes.success, false);
      assert.equal(extraRes.reason, 'already_completed');
    });
  });

  // ── 5. Desacoplamento de Castelo do Ciclo Individual ─────────────────────
  describe('5. Domínio de Castelo Desacoplado do Ciclo Individual', () => {
    it('jogador sem clã é rejeitado ao tentar declarar cerco', () => {
      const state = DEFAULT_STATE();
      state.level = 80;
      const res = ClanService.startSiege(state, 'giran');
      assert.equal(res.success, false);
      assert.equal(res.reason, 'clan_level_low');
    });

    it('jogador sem posse de castelo não pode recolher impostos nem comprar na loja real', () => {
      const state = DEFAULT_STATE();
      state.clan = { id: 'c1', name: 'Clã Nobre', level: 5, castles: [] };

      const taxRes = ClanService.claimCastleTaxes(state, 'giran');
      assert.equal(taxRes.success, false);
      assert.equal(taxRes.reason, 'not_owner');

      const shopRes = ClanService.buyCastleShopItem(state, 'crown_of_lord');
      assert.equal(shopRes.success, false);
      assert.equal(shopRes.reason, 'no_castle');
    });
  });

  // ── 6. Regras de Segurança do Firestore (firestore.rules) ────────────────
  describe('6. Regras de Segurança do Firestore para Clãs', () => {
    it('regras do Firestore protegem criação atômica, exclusividade de nome e autoridade do líder', () => {
      const rules = fs.readFileSync(path.resolve('firestore.rules'), 'utf8');

      // 1. Criação atômica de clã vinculada a clan_names e clan_members
      assert.match(rules, /getAfter\(\/databases\/\$\(database\)\/documents\/clan_names\/\$\(request\.resource\.data\.nameKey\)\)\.data\.clanId == clanId/);
      assert.match(rules, /getAfter\(\/databases\/\$\(database\)\/documents\/clan_members\/\$\(request\.auth\.uid\)\)\.data\.role == 'leader'/);

      // 2. Líder pode atualizar apenas apresentação, recrutamento e brasão
      assert.match(rules, /affectedKeys\(\)\.hasOnly\(\['description', 'recruitmentOpen', 'crestId', 'updatedAt'\]\)/);

      // 3. Regra de deleção de membro permite saída voluntária OU expulsão pelo líder do clã
      assert.match(rules, /get\(\/databases\/\$\(database\)\/documents\/clans\/\$\(resource\.data\.clanId\)\)\.data\.leaderUid == request\.auth\.uid/);
    });
  });
});
