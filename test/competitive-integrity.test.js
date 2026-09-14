/**
 * test/competitive-integrity.test.js
 * 
 * Suite de Testes de Integridade Competitiva & Anti-Cheat:
 * 1. Autoridade de CP no Ranking em Nuvem (src/firebase.ts)
 *    - Rejeição e normalização de spoofing de Combat Power (injeção de 5.000.000 CP em level 20).
 *    - Enforcement de teto estrito: rankingCP <= canonicalCP * 1.10.
 * 2. Integridade Temporal de Expedições (lineage-idle/src/services/ExpeditionService.js)
 *    - Rejeição de coleta antecipada (tentativa de coletar 1 minuto após início de expedição de 8 horas).
 *    - Bloqueio atômico de corrida e prevenção de double-claim (duplo resgate).
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { DEFAULT_STATE, applyStarterKit } from '../lineage-idle/src/core/StateManager.js';
import { CombatPowerService } from '../lineage-idle/src/services/CombatPowerService.js';
import { ExpeditionService, EXPEDITION_DESTINATIONS } from '../lineage-idle/src/services/ExpeditionService.js';
import { computeAuthoritativeRankingCP } from '../src/firebase.ts';

describe('🛡️ Competitive Integrity & Anti-Cheat Suite', () => {

  // =========================================================================
  // 1. CP AUTHORITY ON CLOUD RANKING (src/firebase.ts)
  // =========================================================================
  describe('1. Combat Power Authority & Spoofing Protection (src/firebase.ts)', () => {
    let basePlayerState;

    beforeEach(() => {
      basePlayerState = DEFAULT_STATE();
      basePlayerState.race = 'human';
      basePlayerState.class = 'fighter';
      basePlayerState.level = 20;
      applyStarterKit(basePlayerState, 'human', 'fighter');
    });

    it('CP spoofing rejection: Character with level 20 and basic gear submitting 5,000,000 CP gets normalized to canonical CP', () => {
      // 1. Calcula o CP canônico oficial do estado do personagem
      const canonicalCP = CombatPowerService.calculateCombatPower(basePlayerState);
      assert.ok(canonicalCP > 0, 'Canonical CP must be a positive integer');
      assert.ok(canonicalCP < 10000, `Level 20 basic character CP should be realistic (< 10000), got: ${canonicalCP}`);

      // 2. Simula cliente malicioso injetando 5.000.000 CP no payload
      const spoofedState = {
        ...basePlayerState,
        cp: 5000000,
        combatPower: 5000000,
        stats: {
          ...basePlayerState.stats,
          combatPower: 5000000
        }
      };

      const result = computeAuthoritativeRankingCP(spoofedState, 5000000);

      // 3. Validações de integridade
      assert.strictEqual(result.canonicalCP, canonicalCP, 'Canonical CP must match CombatPowerService calculation');
      assert.strictEqual(result.rankingCP, 5000000, 'Raw submitted CP is captured for audit');

      const maxAllowedCP = Math.floor(canonicalCP * 1.10);
      assert.strictEqual(
        result.authoritativeCP,
        maxAllowedCP,
        `Authoritative CP must be capped strictly at canonicalCP * 1.10 (${maxAllowedCP}), rejected spoofed 5,000,000`
      );
      assert.ok(
        result.authoritativeCP < 5000000,
        'Spoofed 5,000,000 CP must never be written to cloud ranking'
      );
    });

    it('CP tolerance check: Legitimate client CP within 10% tolerance is accepted without alteration', () => {
      const canonicalCP = CombatPowerService.calculateCombatPower(basePlayerState);
      const legitimateCP = Math.floor(canonicalCP * 1.05); // +5% buff / variance

      const validState = {
        ...basePlayerState,
        cp: legitimateCP
      };

      const result = computeAuthoritativeRankingCP(validState, legitimateCP);
      assert.strictEqual(result.canonicalCP, canonicalCP);
      assert.strictEqual(result.rankingCP, legitimateCP);
      assert.strictEqual(result.authoritativeCP, legitimateCP, 'Legitimate CP within 1.10x threshold must be preserved');
    });

    it('CP boundary integrity: Character submitting zero, negative or missing CP falls back to canonical CP', () => {
      const canonicalCP = CombatPowerService.calculateCombatPower(basePlayerState);

      const zeroState = { ...basePlayerState, cp: 0, combatPower: 0 };
      const zeroResult = computeAuthoritativeRankingCP(zeroState);
      assert.strictEqual(zeroResult.authoritativeCP, canonicalCP, 'Zero CP must default to canonical CP');

      const negState = { ...basePlayerState, cp: -999 };
      const negResult = computeAuthoritativeRankingCP(negState, -999);
      assert.strictEqual(negResult.authoritativeCP, canonicalCP, 'Negative CP must default to canonical CP');
    });
  });

  // =========================================================================
  // 2. EXPEDITION TIME INTEGRITY & DOUBLE-CLAIM (lineage-idle/src/services/ExpeditionService.js)
  // =========================================================================
  describe('2. Expedition Time Integrity & Race Condition Prevention (ExpeditionService.js)', () => {
    let state;
    const EIGHT_HOURS_MS = 8 * 3600 * 1000; // 28,800,000 ms

    beforeEach(() => {
      state = DEFAULT_STATE();
      state.level = 40;
      state.gold = 50000;
      state.astralShards = 10;
      state.inventory = [];
      state.expeditions = [];
      state.claimedExpeditionIds = [];
    });

    it('Expedition early claim rejection: Cannot claim 1 minute into an 8-hour expedition', () => {
      const startTime = Date.now();
      const mockExpeditionId = 'exp_early_test_001';

      // Cria uma expedição em andamento de 8 horas iniciada agora
      state.expeditions.push({
        id: mockExpeditionId,
        destId: 'branded',
        startTime: startTime,
        duration: EIGHT_HOURS_MS,
        squad: [],
        directive: 'balanced',
        claimed: false,
        synergies: {}
      });

      const initialGold = state.gold;
      const initialShards = state.astralShards;
      const loggedWarnings = [];
      const callbacks = {
        log: (msg, type) => {
          if (type === 'warning') loggedWarnings.push(msg);
        }
      };

      // Tentativa de resgate antecipado (1 minuto após início)
      const claimResult = ExpeditionService.claimExpedition(state, mockExpeditionId, callbacks);

      // Verificações
      assert.strictEqual(claimResult.success, false, 'Early claim must be rejected');
      assert.strictEqual(claimResult.reason, 'in_progress', 'Reason must be in_progress');
      assert.strictEqual(state.gold, initialGold, 'Gold must not increase on early claim attempt');
      assert.strictEqual(state.astralShards, initialShards, 'Astral shards must not change');
      assert.strictEqual(state.expeditions.length, 1, 'Expedition must remain in active list');
      assert.strictEqual(state.expeditions[0].claimed, false, 'Expedition must remain unclaimed');
      assert.ok(loggedWarnings.length > 0, 'Warning should be logged for early claim attempt');
    });

    it('Expedition successful claim: Full 8-hour duration elapsed allows reward collection', () => {
      // Início há 8 horas e 5 segundos atrás
      const startTime = Date.now() - EIGHT_HOURS_MS - 5000;
      const mockExpeditionId = 'exp_mature_test_002';

      state.expeditions.push({
        id: mockExpeditionId,
        destId: 'gludio_ruins',
        startTime: startTime,
        duration: EIGHT_HOURS_MS,
        squad: [],
        directive: 'balanced',
        claimed: false,
        synergies: {}
      });

      const initialGold = state.gold;
      const initialShards = state.astralShards;

      const claimResult = ExpeditionService.claimExpedition(state, mockExpeditionId);

      assert.strictEqual(claimResult.success, true, 'Claim after full duration must succeed');
      assert.ok(claimResult.goldEarned > 0, 'Gold must be awarded');
      assert.ok(state.gold > initialGold, 'Player gold balance must increase');
      assert.ok(state.astralShards > initialShards, 'Player astral shards must increase');
      assert.ok(state.claimedExpeditionIds.includes(mockExpeditionId), 'Expedition ID must be tracked as claimed');
    });

    it('Expedition double-claim prevention: Second claim attempt immediately rejected with already_claimed', () => {
      const startTime = Date.now() - EIGHT_HOURS_MS - 10000;
      const mockExpeditionId = 'exp_double_claim_003';

      state.expeditions.push({
        id: mockExpeditionId,
        destId: 'gludio_ruins',
        startTime: startTime,
        duration: EIGHT_HOURS_MS,
        squad: [],
        directive: 'balanced',
        claimed: false,
        synergies: {}
      });

      // Primeiro resgate — deve suceder
      const firstClaim = ExpeditionService.claimExpedition(state, mockExpeditionId);
      assert.strictEqual(firstClaim.success, true, 'First claim must succeed');
      const goldAfterFirstClaim = state.gold;
      const shardsAfterFirstClaim = state.astralShards;

      // Segundo resgate — tentativa de fraude / race condition
      const secondClaim = ExpeditionService.claimExpedition(state, mockExpeditionId);
      assert.strictEqual(secondClaim.success, false, 'Second claim must fail');
      assert.strictEqual(secondClaim.reason, 'already_claimed', 'Reason must be already_claimed');

      // Assegurar que recursos não foram duplicados
      assert.strictEqual(state.gold, goldAfterFirstClaim, 'Gold must not increase on second claim');
      assert.strictEqual(state.astralShards, shardsAfterFirstClaim, 'Shards must not increase on second claim');
    });

    it('Atomic claim integrity: exp.claimed is set to true before reward distribution callbacks', () => {
      const startTime = Date.now() - EIGHT_HOURS_MS - 10000;
      const mockExpeditionId = 'exp_atomic_test_004';
      const expObj = {
        id: mockExpeditionId,
        destId: 'gludio_ruins',
        startTime: startTime,
        duration: EIGHT_HOURS_MS,
        squad: [],
        directive: 'balanced',
        claimed: false,
        synergies: {}
      };
      state.expeditions.push(expObj);

      let claimedStateDuringCallback = null;
      let reentrantCallResult = null;

      // Callback interceptador simulando re-entrância / listener assíncrono
      const callbacks = {
        log: () => {
          // No momento em que qualquer callback é invocado, exp.claimed DEVE ser true
          claimedStateDuringCallback = expObj.claimed;
          // Tenta chamada concorrente re-entrante
          if (!reentrantCallResult) {
            reentrantCallResult = ExpeditionService.claimExpedition(state, mockExpeditionId);
          }
        }
      };

      const result = ExpeditionService.claimExpedition(state, mockExpeditionId, callbacks);

      assert.strictEqual(result.success, true, 'Initial claim succeeds');
      assert.strictEqual(claimedStateDuringCallback, true, 'exp.claimed must be true atomically before callbacks');
      assert.strictEqual(reentrantCallResult.success, false, 'Reentrant claim must be rejected');
      assert.strictEqual(reentrantCallResult.reason, 'already_claimed', 'Reentrant attempt blocked by claimed flag');
    });

    it('Backward compatibility: claimReward alias delegates transparently to claimExpedition', () => {
      const startTime = Date.now() - EIGHT_HOURS_MS - 1000;
      const mockExpeditionId = 'exp_alias_test_005';
      state.expeditions.push({
        id: mockExpeditionId,
        destId: 'gludio_ruins',
        startTime: startTime,
        duration: EIGHT_HOURS_MS,
        squad: [],
        directive: 'balanced',
        claimed: false,
        synergies: {}
      });

      const res = ExpeditionService.claimReward(state, mockExpeditionId);
      assert.strictEqual(res.success, true);
      assert.ok(res.goldEarned > 0);
    });
  });
});
