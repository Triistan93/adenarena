# Aden Arena / Lineage Idle — Firestore Indexes Specification

Este documento documenta os índices compostos necessários no Firestore para consultas otimizadas.

---

## Índices Compostos

| Coleção | Campos Indexados | Ordem | Finalidade / Query |
| :--- | :--- | :--- | :--- |
| `characters` | `playerType` ASC, `status` ASC, `isDiscoverable` ASC, `level` DESC | Composto | Busca e recomendação de jogadores reais por nível |
| `characters` | `nameLower` ASC, `status` ASC | Composto | Busca exata insensível a maiúsculas por nome de herói |
| `characters` | `ownerUid` ASC, `status` ASC | Composto | Resolução de personagens por conta de usuário |
| `friends` | `characterAId` ASC, `status` ASC | Composto | Consulta de lista de amigos aceitos pelo participante A |
| `friends` | `characterBId` ASC, `status` ASC | Composto | Consulta de lista de amigos aceitos pelo participante B |
| `mentorships` | `mentorCharacterId` ASC, `status` ASC | Composto | Consulta de aprendizes vinculados a um mentor |
| `mentorships` | `apprenticeCharacterId` ASC, `status` ASC | Composto | Consulta de mentor vinculado a um aprendiz |
| `pvp_rankings` | `seasonId` ASC, `category` ASC, `score` DESC | Composto | Leaderboard e ranking competitivo ordenado por pontuação |
| `market_listings` | `isPlayerListing` ASC, `isSold` ASC, `createdAt` DESC | Composto | Listagem dos anúncios reais ativos do mercado global |
