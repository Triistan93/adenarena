# Aden Arena / Lineage Idle — Database Contracts Specification

Este documento estabelece o **Contrato Oficial de Banco de Dados** para todas as entidades do mundo persistente do Aden Arena.

---

## 1. Princípios Invioláveis

1. **Autoridade Canônica**: Se uma entidade não está persistida no Cloud Firestore com identificador único válido, ela **NÃO EXISTE** no jogo.
2. **Imutabilidade de Identidade**: Campos de identificação de autoria, conta, tipo e data de criação são imutáveis após a gravação inicial (`CREATE`).
3. **Segregação de Criação**: Clientes autenticados podem criar apenas entidades com `playerType = 'real'` e `entityType = 'player'`. Entidades do tipo `bot`, `npc` ou `monster` só podem ser criadas por ferramentas administrativas autenticadas ou scripts de seed autorizados.
4. **Desacoplamento de Presença**: A existência de um personagem (`characters`) é estritamente desacoplada do seu estado de conexão em tempo real (`presence`).

---

## 2. Contratos de Entidades

### 2.1. Account (`accounts/{accountId}`)
* **Identidade**: Identificador único global da conta (`acc_{uid}`).
* **Campos Obrigatórios**: `accountId`, `ownerUid`, `email`, `createdAt`, `updatedAt`, `status`.
* **Campos Imutáveis**: `accountId`, `ownerUid`, `createdAt`.
* **Campos Mutáveis**: `status`, `lastLoginAt`, `vipLevel`, `updatedAt`.
* **Owner**: `ownerUid` (Firebase Auth UID).
* **Allowed Creators**: Usuário autenticado criando sua própria conta (`request.auth.uid == ownerUid`).
* **Allowed Readers**: Próprio usuário autenticado (`request.auth.uid == ownerUid`) ou Administradores.
* **Allowed Writers**: Próprio usuário (`update` restrito aos campos mutáveis) ou Administradores.
* **Allowed State Transitions**: `active` -> `suspended` -> `banned`.

---

### 2.2. Name Reservation (`character_names/{nameLower}`)
* **Identidade**: Nome do personagem normalizado em minúsculas (ex: `tristan`).
* **Campos Obrigatórios**: `nameLower`, `name`, `characterId`, `ownerUid`, `reservedAt`.
* **Campos Imutáveis**: `nameLower`, `name`, `characterId`, `ownerUid`, `reservedAt`.
* **Campos Mutáveis**: Nenhum (imutável enquanto o personagem existir).
* **Owner**: `ownerUid`.
* **Allowed Creators**: Transação de criação de personagem via cliente autenticado (`request.auth.uid == ownerUid`).
* **Allowed Readers**: Qualquer usuário autenticado (para verificação de disponibilidade).
* **Allowed Writers**: Ninguém (apenas `create` ou `delete` transacional em caso de deleção do personagem).

---

### 2.3. Character (`characters/{characterId}`)
* **Identidade**: Identificador canônico estável do herói (`char_{id}`).
* **Campos Obrigatórios**: `characterId`, `accountId`, `ownerUid`, `name`, `nameLower`, `raceId`, `classId`, `level`, `experience`, `cp`, `entityType`, `playerType`, `status`, `isDiscoverable`, `createdAt`, `updatedAt`.
* **Campos Imutáveis**: `characterId`, `accountId`, `ownerUid`, `entityType`, `playerType`, `createdAt`.
* **Campos Mutáveis**: `level`, `experience`, `cp`, `classId`, `raceId`, `status`, `isDiscoverable`, `statsSnapshot`, `lastOnlineAt`, `updatedAt`.
* **Owner**: `ownerUid`.
* **Allowed Creators**: Cliente autenticado (`request.auth.uid == ownerUid`) com `playerType == 'real'`.
* **Allowed Readers**: Qualquer usuário autenticado (visibilidade pública para rankings e inspeção social).
* **Allowed Writers**: Dono autenticado (`request.auth.uid == ownerUid`) preservando campos imutáveis.
* **Allowed State Transitions**: `active` -> `inactive` -> `deleted` / `banned`.

---

### 2.4. Presence (`presence/{characterId}`)
* **Identidade**: `characterId`.
* **Campos Obrigatórios**: `characterId`, `ownerUid`, `online`, `lastSeenAt`, `heartbeatAt`.
* **Campos Imutáveis**: `characterId`, `ownerUid`.
* **Campos Mutáveis**: `online`, `lastSeenAt`, `heartbeatAt`.
* **Owner**: `ownerUid`.
* **Allowed Creators / Writers**: Dono do personagem conectado.
* **Allowed Readers**: Qualquer usuário autenticado.

---

### 2.5. Friendship (`friends/{friendshipId}`)
* **Identidade**: Chave composta ordenada alfabeticamente: `${min(charA, charB)}_${max(charA, charB)}`.
* **Campos Obrigatórios**: `friendshipId`, `characterAId`, `characterBId`, `status`, `createdAt`, `updatedAt`.
* **Campos Imutáveis**: `friendshipId`, `characterAId`, `characterBId`, `createdAt`.
* **Campos Mutáveis**: `status`, `updatedAt`.
* **Relacionamentos**: Dois personagens existentes válidos (`characters`).
* **Allowed Creators**: Participante da amizade via handshake/aceite.
* **Allowed Readers**: Participantes (`characterAId` ou `characterBId`).
* **Allowed Writers**: Participantes para cancelamento ou exclusão.
* **Allowed State Transitions**: `pending` -> `accepted` -> `blocked` / `deleted`.

---

### 2.6. Mentorship (`mentorships/{mentorshipId}`)
* **Identidade**: `mentor_{mentorCharId}_{apprenticeCharId}`.
* **Campos Obrigatórios**: `mentorshipId`, `mentorCharacterId`, `apprenticeCharacterId`, `apprenticeLevelAtStart`, `status`, `graduated`, `rewardClaimedByMentor`, `rewardClaimedByApprentice`, `startedAt`, `completedAt`.
* **Campos Imutáveis**: `mentorshipId`, `mentorCharacterId`, `apprenticeCharacterId`, `apprenticeLevelAtStart`, `startedAt`.
* **Campos Mutáveis**: `status`, `graduated`, `rewardClaimedByMentor`, `rewardClaimedByApprentice`, `completedAt`.
* **Allowed Creators**: Aprendiz de nível <= 20 vinculando mentor de nível >= 40.
* **Allowed Readers**: Mentor e Aprendiz autenticados.
* **Allowed Writers**: Mentor ou Aprendiz para reivindicação de recompensa e graduação.

---

### 2.7. Referral (`referrals/{referralId}`)
* **Identidade**: `${referrerCharId}_${invitedCharId}`.
* **Campos Obrigatórios**: `referralId`, `referrerCharacterId`, `invitedCharacterId`, `invitedLevel`, `rewardEligible`, `rewardClaimed`, `createdAt`, `updatedAt`.
* **Campos Imutáveis**: `referralId`, `referrerCharacterId`, `invitedCharacterId`, `createdAt`.
* **Campos Mutáveis**: `invitedLevel`, `rewardEligible`, `rewardClaimed`, `claimedAt`, `updatedAt`.
* **Allowed Creators**: Personagem convidado no momento da criação.
* **Allowed Readers**: Convidado e Indicador.
* **Allowed Writers**: Indicador resgatando recompensas de marcos de nível.

---

### 2.8. Clan & Clan Membership (`clans/{clanId}` & `clan_members/{membershipId}`)
* **Clans**:
  * **Campos Obrigatórios**: `clanId`, `name`, `nameLower`, `leaderCharacterId`, `level`, `reputation`, `castles`, `createdAt`, `updatedAt`.
  * **Campos Imutáveis**: `clanId`, `name`, `nameLower`, `createdAt`.
  * **Allowed Creators**: Personagem nível >= 20 com recursos para fundação.
* **Clan Memberships**:
  * **Identidade**: `${clanId}_${characterId}`.
  * **Campos Obrigatórios**: `membershipId`, `clanId`, `characterId`, `roleId`, `joinedAt`.
  * **Campos Imutáveis**: `membershipId`, `clanId`, `characterId`, `joinedAt`.
  * **Allowed Writers**: Líder do clã ou próprio membro saindo do clã.

---

### 2.9. Competitive PvP & Olympiad Snapshots (`pvp_rankings/{entryId}`)
* **Identidade**: `${seasonId}_${category}_${characterId}`.
* **Campos Obrigatórios**: `seasonId`, `category`, `characterId`, `characterName`, `className`, `raceId`, `score`, `rank`, `wins`, `losses`, `updatedAt`.
* **Campos Imutáveis**: `seasonId`, `category`, `characterId`.
* **Campos Mutáveis**: `score`, `rank`, `wins`, `losses`, `updatedAt`.
* **Allowed Readers**: Público autenticado.
* **Allowed Writers**: Atualizações autenticadas de resultados de combates ou fechamento de rodada/temporada.
