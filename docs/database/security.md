# Aden Arena / Lineage Idle — Security & Permission Architecture

## Princípios de Segurança do Firestore

1. **Separação Explícita de Operações**:
   - `create`: Avalia `request.resource.data` (documento ainda não existe).
   - `update`: Compara `request.resource.data` com `resource.data` (documento existente).
   - `delete`: Garante que apenas o proprietário autorizado possa destruir o registro.
2. **Imutabilidade de Identidade**:
   - Os campos `ownerUid`, `accountId`, `characterId`, `entityType`, `playerType` e `createdAt` nunca podem ser modificados após a criação.
3. **Proibição de Criação de Bots por Clientes**:
   - O cliente autenticado só pode criar documentos onde `playerType == 'real'`. Tentativas de criar `playerType == 'bot'` são bloqueadas por regra.
4. **Reserva de Nomes Atômica**:
   - O documento em `character_names/{nameLower}` só pode ser criado se não existir previamente, impedindo disputas de nomes.
5. **Anti-Escalação de Privilégios**:
   - Campos como `privilegeLevel`, `role` e balances de moeda protegidos não podem ser injetados ou alterados via client-side write.
