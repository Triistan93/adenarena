# Aden Arena / Lineage Idle — Database Architecture

## Visão Geral da Arquitetura

A arquitetura de persistência do Aden Arena é baseada no **Cloud Firestore**, organizada sob o princípio de **Identidade Canônica e Integridade Relacional**.

O sistema encerra definitivamente a geração simulada/mockada de entidades no cliente e estabelece o banco de dados oficial como a fonte única da verdade.

```mermaid
graph TD
  subgraph Identity Layer
    Auth[Firebase Authentication] -->|UID| Account[accounts/{accountId}]
    Account -->|Possui 1:N| Character[characters/{characterId}]
    Character -->|Reserva 1:1| NameReservation[character_names/{nameLower}]
  end

  subgraph State & Presence
    Character -->|Presença Volátil 1:1| Presence[presence/{characterId}]
  end

  subgraph Social Layer
    Character -->|Amizade N:N| Friendship[friends/{friendshipId}]
    Character -->|Mentoria 1:1| Mentorship[mentorships/{mentorshipId}]
    Character -->|Indicação 1:N| Referral[referrals/{referralId}]
    Character -->|Membro N:1| ClanMember[clan_members/{membershipId}]
    ClanMember -->|Pertence| Clan[clans/{clanId}]
  end

  subgraph Competitive Layer
    Character -->|Snapshot ELO/CP| PvPRanking[pvp_rankings/{entryId}]
    Character -->|Inscrição Grand Olympiad| OlympiadReg[olympiad_registrations/{regId}]
  end

  subgraph Economy Layer
    Character -->|Vendedor| MarketListing[market_listings/{listingId}]
    Character -->|Saldo de Custódia| MarketSale[market_sales/{sellerKey}]
  end
```

---

## Camadas de Serviço do Cliente

```
[ UI / React Components / Idle Game Engine ]
                     │
                     ▼
             [ Social Actions ]
                     │
                     ▼
           [ PlayerRegistry ]  <─── Resolve identidades e caches (Anti N+1)
                     │
                     ▼
           [ EntityValidator ] <─── Valida invariantes, ownership e tipos
                     │
                     ▼
        [ SocialIntegrityService ] <── Executa mutações transacionais atômicas
                     │
                     ▼
         [ Cloud Firestore API ]
```

### 1. PlayerRegistry
- Resolve entidades reais por ID, Nome normalizado (`nameLower`), ou UID do dono (`ownerUid`).
- Mantém cache em memória de leituras recentes com TTL.
- Suporta leituras em batch (`getPlayersBatch`) para evitar queries N+1.
- Distingue rigorosamente `playerType: 'real'` de `playerType: 'bot'`.

### 2. EntityValidator
- Valida integridade de payloads antes de qualquer envio ao Firestore.
- Assegura que nenhum cliente consiga alterar campos imutáveis (`ownerUid`, `accountId`, `characterId`, `entityType`, `playerType`, `createdAt`).
- Bloqueia relacionamentos inválidos, referências a entidades inexistentes e auto-relacionamentos proibidos.

### 3. SocialIntegrityService
- Coordena amizades, mentoria, convites e bloqueios com consistência atômica.
- Impede a fabricação silenciosa de personagens em qualquer ponto da experiência social.
