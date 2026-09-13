# Aden Arena / Lineage Idle — Firestore Database Schema

Este documento detalha a estrutura de coleções e esquemas de documentos oficiais.

---

## 1. Identity & Presence

### `accounts/{accountId}`
```json
{
  "accountId": "acc_3a1c028e",
  "ownerUid": "firebase_auth_uid_12345",
  "email": "hero@adenarena.com",
  "status": "active",
  "vipLevel": 0,
  "createdAt": 1789200000000,
  "updatedAt": 1789339200000
}
```

### `character_names/{nameLower}`
```json
{
  "nameLower": "tristan",
  "name": "Tristan",
  "characterId": "char_8f4b2190",
  "ownerUid": "firebase_auth_uid_12345",
  "reservedAt": 1789200000000
}
```

### `characters/{characterId}`
```json
{
  "characterId": "char_8f4b2190",
  "accountId": "acc_3a1c028e",
  "ownerUid": "firebase_auth_uid_12345",
  "name": "Tristan",
  "nameLower": "tristan",
  "raceId": "human",
  "classId": "duelist",
  "level": 78,
  "experience": 45892010,
  "cp": 42580,
  "entityType": "player",
  "playerType": "real",
  "status": "active",
  "isDiscoverable": true,
  "statsSnapshot": {
    "hp": 22000,
    "pAtk": 2450,
    "mAtk": 450,
    "pDef": 1950,
    "mDef": 1420,
    "crit": 320
  },
  "topWeaponName": "+12 Dual Damascus",
  "topWeaponGlow": "crimson-fire",
  "clanName": "Sem Clã",
  "lastOnlineAt": 1789339200000,
  "createdAt": 1789200000000,
  "updatedAt": 1789339200000
}
```

### `presence/{characterId}`
```json
{
  "characterId": "char_8f4b2190",
  "ownerUid": "firebase_auth_uid_12345",
  "online": true,
  "lastSeenAt": 1789339200000,
  "heartbeatAt": 1789339200000
}
```

---

## 2. Social & Relationships

### `friends/{friendshipId}`
*ID format: `${charA}_${charB}` onde `charA < charB`*
```json
{
  "friendshipId": "char_8f4b2190_char_9e2a1104",
  "characterAId": "char_8f4b2190",
  "characterBId": "char_9e2a1104",
  "status": "accepted",
  "createdAt": 1789335000000,
  "updatedAt": 1789335000000
}
```

### `mentorships/{mentorshipId}`
*ID format: `mentor_${mentorCharId}_${apprenticeCharId}`*
```json
{
  "mentorshipId": "mentor_char_8f4b2190_char_c7104921",
  "mentorCharacterId": "char_8f4b2190",
  "apprenticeCharacterId": "char_c7104921",
  "apprenticeLevelAtStart": 1,
  "status": "active",
  "graduated": false,
  "rewardClaimedByMentor": false,
  "rewardClaimedByApprentice": false,
  "startedAt": 1789320000000,
  "completedAt": null
}
```

### `referrals/{referralId}`
*ID format: `${referrerCharId}_${invitedCharId}`*
```json
{
  "referralId": "char_8f4b2190_char_c7104921",
  "referrerCharacterId": "char_8f4b2190",
  "invitedCharacterId": "char_c7104921",
  "invitedLevel": 42,
  "rewardEligible": true,
  "rewardClaimed": false,
  "createdAt": 1789320000000,
  "updatedAt": 1789335000000
}
```

### `blocks/{blockId}`
*ID format: `block_${blockerCharId}_${targetCharId}`*
```json
{
  "blockId": "block_char_8f4b2190_char_f1002931",
  "characterId": "char_8f4b2190",
  "blockedCharacterId": "char_f1002931",
  "createdAt": 1789330000000
}
```

---

## 3. Competitive & Rankings

### `pvp_rankings/{entryId}`
*ID format: `s1_${category}_${characterId}`*
```json
{
  "entryId": "s1_cp_char_8f4b2190",
  "seasonId": 1,
  "category": "cp",
  "characterId": "char_8f4b2190",
  "characterName": "Tristan",
  "className": "Duelist",
  "raceId": "human",
  "score": 42580,
  "rank": 1,
  "wins": 0,
  "losses": 0,
  "updatedAt": 1789339200000
}
```
