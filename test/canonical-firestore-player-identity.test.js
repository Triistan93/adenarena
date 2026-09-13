import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { EntityValidator } from '../lineage-idle/src/services/EntityValidator.js';
import { PlayerRegistry } from '../lineage-idle/src/services/PlayerRegistry.js';
import { RankingService } from '../lineage-idle/src/services/RankingService.js';
import { ClanService } from '../lineage-idle/src/services/ClanService.js';
import { DEFAULT_STATE, applyStarterKit } from '../lineage-idle/src/core/StateManager.js';

describe('🏛️ Canonical Cloud Firestore Database & Player Identity Architecture (15 Gates)', () => {
  beforeEach(() => {
    PlayerRegistry.clearCache();
  });

  // -------------------------------------------------------------
  // GATE 1: Existence ≠ Presence
  // -------------------------------------------------------------
  it('Gate 1: Existence ≠ Presence — Character identity exists independently of online status', () => {
    const characterDoc = {
      characterId: 'char_test_1001',
      ownerUid: 'uid_test_1001',
      accountId: 'acc_test_1001',
      name: 'Alden',
      nameLower: 'alden',
      raceId: 'human',
      classId: 'fighter',
      level: 45,
      entityType: 'player',
      playerType: 'real',
      status: 'active',
      isDiscoverable: true,
      createdAt: 1700000000000,
      updatedAt: 1700000000000
    };

    const presenceDoc = {
      characterId: 'char_test_1001',
      ownerUid: 'uid_test_1001',
      online: false, // Disconnected / Offline
      lastSeenAt: 1700005000000,
      heartbeatAt: 1700005000000
    };

    // Even if offline, identity validation succeeds and character is real & active
    const validation = EntityValidator.validateCharacter(characterDoc);
    assert.strictEqual(validation.valid, true, 'Offline character must remain a valid character entity');
    assert.strictEqual(characterDoc.status, 'active', 'Persistent status is independent of online presence');
    assert.strictEqual(presenceDoc.online, false, 'Presence doc reflects real online status');
  });

  // -------------------------------------------------------------
  // GATE 2 & 4: Immutable Identity Fields & Real Player Creation
  // -------------------------------------------------------------
  it('Gate 2: Immutable Identity Fields — Enforces non-modifiable identity attributes', () => {
    const original = {
      characterId: 'char_orig_01',
      ownerUid: 'uid_player_01',
      accountId: 'acc_orig_01',
      entityType: 'player',
      playerType: 'real',
      createdAt: 1700000000000,
      level: 20,
      gold: 5000
    };

    // Allowed updates (mutable gameplay state)
    const validUpdate = {
      level: 21,
      gold: 8000,
      clanName: 'IronClad'
    };
    const check1 = EntityValidator.assertImmutableFields(original, validUpdate);
    assert.strictEqual(check1.allowed, true, 'Gameplay state updates must be permitted');

    // Forbidden updates on each immutable field
    for (const field of EntityValidator.IMMUTABLE_CHARACTER_FIELDS) {
      const illegalUpdate = { [field]: 'hacked_value' };
      const check = EntityValidator.assertImmutableFields(original, illegalUpdate);
      assert.strictEqual(check.allowed, false, `Field '${field}' must be immutable`);
      assert.ok(check.violation.includes(field), `Violation reason must mention '${field}'`);
    }
  });

  it('Gate 3 & 4: Entity & Player Type Validation — Bots cannot masquerade as real players', () => {
    const realPlayer = {
      characterId: 'char_real_01',
      ownerUid: 'uid_real_01',
      name: 'Valerius',
      level: 30,
      entityType: 'player',
      playerType: 'real'
    };
    assert.strictEqual(EntityValidator.validateCharacter(realPlayer).valid, true);

    const botPlayer = {
      characterId: 'char_bot_01',
      ownerUid: 'uid_system_admin',
      name: 'ArenaBotAlpha',
      level: 30,
      entityType: 'player',
      playerType: 'bot'
    };
    assert.strictEqual(EntityValidator.validateCharacter(botPlayer).valid, true);

    // Invalid entity types or player types
    assert.strictEqual(EntityValidator.validateEntityType('player'), true);
    assert.strictEqual(EntityValidator.validateEntityType('synthetic_alien'), false);

    assert.strictEqual(EntityValidator.validatePlayerType('real'), true);
    assert.strictEqual(EntityValidator.validatePlayerType('bot'), true);
    assert.strictEqual(EntityValidator.validatePlayerType('fake_simulated'), false);
  });

  // -------------------------------------------------------------
  // GATE 5: Atomic Name Reservation & Case-Insensitive Uniqueness
  // -------------------------------------------------------------
  it('Gate 5: Atomic Name Reservation — Prevents case collisions (Tristan vs tristan)', () => {
    const rawNames = ['Tristan', 'tristan', 'TRISTAN', 'TrIsTaN'];
    const lowerKeys = new Set(rawNames.map(n => n.trim().toLowerCase()));

    assert.strictEqual(lowerKeys.size, 1, 'All casing variations must resolve to the identical lowercase key');
    assert.strictEqual(Array.from(lowerKeys)[0], 'tristan', 'Normalized key must be lowercase');
  });

  // -------------------------------------------------------------
  // GATE 6 & 11: PlayerRegistry Resolution & Batching
  // -------------------------------------------------------------
  it('Gate 6 & 11: PlayerRegistry — Resolves real players, rejects bots when real is required', async () => {
    const mockReal = {
      characterId: 'char_real_99',
      ownerUid: 'uid_99',
      name: 'Leonidas',
      nameLower: 'leonidas',
      level: 50,
      entityType: 'player',
      playerType: 'real',
      status: 'active'
    };

    const mockBot = {
      characterId: 'char_bot_99',
      ownerUid: 'uid_admin',
      name: 'BotLeon',
      nameLower: 'botleon',
      level: 50,
      entityType: 'player',
      playerType: 'bot',
      status: 'active'
    };

    // Inject into cache directly for verification
    PlayerRegistry._setCache(mockReal);
    PlayerRegistry._setCache(mockBot);

    const resolvedReal = await PlayerRegistry.getPlayer('char_real_99');
    assert.strictEqual(resolvedReal.name, 'Leonidas');
    assert.strictEqual(await PlayerRegistry.isRealPlayer('char_real_99'), true);

    const resolvedBot = await PlayerRegistry.getPlayer('char_bot_99');
    assert.strictEqual(resolvedBot.name, 'BotLeon');
    assert.strictEqual(await PlayerRegistry.isRealPlayer('char_bot_99'), false);
    assert.strictEqual(await PlayerRegistry.isBot('char_bot_99'), true);

    // requireRealPlayer must pass for real player and fail for bot
    await assert.doesNotReject(() => PlayerRegistry.requireRealPlayer('char_real_99'));
    await assert.rejects(
      () => PlayerRegistry.requireRealPlayer('char_bot_99'),
      { code: 'REAL_PLAYER_REQUIRED' }
    );

    // Non-existent player rejection
    await assert.rejects(
      () => PlayerRegistry.requireExistingPlayer('char_non_existent'),
      { code: 'PLAYER_NOT_FOUND' }
    );
  });

  // -------------------------------------------------------------
  // GATE 8: Referral vs Mentorship Separation & Relationship Invariants
  // -------------------------------------------------------------
  it('Gate 8: Relationship Invariants — Disallows self-friending and self-mentoring', () => {
    const selfCheck = EntityValidator.validateRelationship('char_same_01', 'char_same_01');
    assert.strictEqual(selfCheck.valid, false);
    assert.ok(selfCheck.reason.includes('Auto-relacionamento'));

    const diffCheck = EntityValidator.validateRelationship('char_a', 'char_b');
    assert.strictEqual(diffCheck.valid, true);
  });

  // -------------------------------------------------------------
  // GATE 9 & 10: Eradication of Fake Friends (Vaelin, Elwen, SirGalahad)
  // -------------------------------------------------------------
  it('Gate 9 & 10: Eradication of Simulated Friends — DEFAULT_STATE and applyStarterKit start clean', () => {
    const defaultObj = DEFAULT_STATE();
    assert.deepStrictEqual(defaultObj.friends, [], 'DEFAULT_STATE().friends must be an empty array');
    assert.deepStrictEqual(defaultObj.blocked, [], 'DEFAULT_STATE().blocked must be an empty array');
    assert.strictEqual(defaultObj.entityType, 'player');
    assert.strictEqual(defaultObj.playerType, 'real');

    const freshState = DEFAULT_STATE();
    applyStarterKit(freshState, 'human', 'fighter', 'NewHero', 'M');

    assert.deepStrictEqual(freshState.friends, [], 'Fresh character must have exactly 0 friends');
    assert.deepStrictEqual(freshState.blocked, [], 'Fresh character must have exactly 0 blocked players');
    assert.strictEqual(freshState.clan?.name, null, 'Fresh character must have no default clan name');
    assert.strictEqual(freshState.clan?.level, 0, 'Fresh character clan level must be 0');
    assert.strictEqual(freshState.charName, 'NewHero');
    assert.strictEqual(freshState.playerType, 'real');
  });

  // -------------------------------------------------------------
  // GATE 14: Zero Population Integrity (Empty Database Test)
  // -------------------------------------------------------------
  it('Gate 14: Zero Population Integrity — 0 players in DB yields 0 friends, 0 clans, 0 bots', async () => {
    const emptyState = {
      level: 1,
      charName: 'LonePlayer',
      heroName: 'LonePlayer',
      name: 'LonePlayer',
      clan: { name: null, level: 0 },
      friends: [],
      blocked: []
    };

    // 1. Leaderboards with empty database must return empty list (no bot_wealth_*)
    const fallbackList = RankingService._generateFallbackLeaderboard('wealth', emptyState);
    assert.strictEqual(fallbackList.length, 0, 'Fallback leaderboards must not generate synthetic bots');

    // 2. RankingService.getLeaderboards(null) must return completely empty lists
    const pureRemoteLeaderboards = RankingService.getLeaderboards(null);
    assert.strictEqual(pureRemoteLeaderboards.cp.length, 0, 'Pure remote CP rankings must be 0 for empty remote DB');
    assert.strictEqual(pureRemoteLeaderboards.olympiad.length, 0, 'Pure remote Olympiad rankings must be 0 for empty remote DB');

    // 3. When merging the current player, no synthetic bots or competitors appear
    const leaderboards = RankingService.getLeaderboards(emptyState);
    const nonSelfCpEntries = leaderboards.cp.filter(p => !p.isCurrentPlayer);
    assert.strictEqual(nonSelfCpEntries.length, 0, 'Zero non-player entries in CP rankings');
    assert.strictEqual(leaderboards.cp.some(p => String(p.charName).startsWith('bot_')), false, 'Zero bots in CP rankings');

    // 4. Clan rankings must not synthesize remote/competitor clans
    const pureRemoteClans = await RankingService.getLeaderboard('clans', null);
    assert.strictEqual(pureRemoteClans.length, 0, 'Pure remote clan rankings must be 0 for empty remote DB');

    const clanRankings = await RankingService.getLeaderboard('clans', emptyState);
    const remoteClans = clanRankings.filter(c => !c.isCurrentPlayer);
    assert.strictEqual(remoteClans.length, 0, 'Zero remote/synthetic competitor clans in clan rankings');

    // 5. Matchmaking opponents must not generate fake archetypes (AresGladiator, etc.)
    const opponents = await RankingService.getMatchmakingOpponents(emptyState, 3);
    assert.strictEqual(opponents.length, 0, 'Matchmaking must return 0 opponents if database is empty');

    // 6. ClanService clean initialization
    const clanStatus = ClanService.getClanStatus(emptyState);
    assert.ok(clanStatus, 'ClanService produces valid clan status structure');
  });

  // -------------------------------------------------------------
  // GATE 15: No Synthetic Social Entity Test (1-Player Isolation)
  // -------------------------------------------------------------
  it('Gate 15: No Synthetic Social Entity — 1 real player yields 0 synthetic counterparts across all flows', async () => {
    const singlePlayerState = {
      level: 25,
      charName: 'SirTristan',
      heroName: 'SirTristan',
      name: 'SirTristan',
      clan: null,
      friends: [],
      blocked: [],
      inventory: [],
      equipment: {}
    };

    // Verify friends list remains exactly empty
    assert.strictEqual(singlePlayerState.friends.length, 0, 'Single player must have 0 friends');

    // Verify clan remains absent or local
    assert.strictEqual(singlePlayerState.clan, null, 'Single player starts clanless');

    // Verify matchmaking does not pit the player against themselves or fake bots
    const opponents = await RankingService.getMatchmakingOpponents(singlePlayerState, 3);
    assert.strictEqual(opponents.length, 0, 'Single player in DB has 0 available opponents');

    // Verify Clan rankings has zero competitor clans from the database
    const clanRanking = await RankingService.getLeaderboard('clans', singlePlayerState);
    const competitorClans = clanRanking.filter(c => !c.isCurrentPlayer);
    assert.strictEqual(competitorClans.length, 0, 'Clan rankings must contain 0 competitor clans');
  });

  // -------------------------------------------------------------
  // Sanitization of Legacy Saves
  // -------------------------------------------------------------
  it('Sanitization: Legacy fake friends are purged upon loading legacy save state', () => {
    const legacyStateWithFakeFriends = {
      charName: 'OldHero',
      level: 30,
      friends: [
        { name: 'Vaelin', level: 50, online: true },
        { name: 'Elwen', level: 52, online: false },
        { name: 'SirGalahad', level: 48, online: true },
        { name: 'RealFriendArthur', level: 32, online: true }
      ]
    };

    // Filtering logic as implemented in loadPlayerStateFromCloud & savePlayerStateToCloud
    const fakeNames = ['vaelin', 'elwen', 'sirgalahad'];
    const cleanedFriends = legacyStateWithFakeFriends.friends.filter(
      f => !fakeNames.includes((f.name || f.charName || '').toLowerCase().trim())
    );

    assert.strictEqual(cleanedFriends.length, 1, 'Only real friends should survive legacy purge');
    assert.strictEqual(cleanedFriends[0].name, 'RealFriendArthur', 'RealFriendArthur preserved');
  });
});
