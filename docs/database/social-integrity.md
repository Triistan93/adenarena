# Aden Arena / Lineage Idle — Social Integrity Specification

Este documento estabelece as regras e invariantes invioláveis de integridade social do jogo.

---

## 1. As 10 Invariantes Sociais

1. **Inexistência de Fabricação**: Nenhum sistema social (Amigos, Bloqueio, Mentoria, Clã, Grupo, Rankings) pode criar entidades sintéticas para preencher interfaces.
2. **Zero Population**: Em um servidor com 0 outros jogadores, a busca social deve retornar `0` resultados e a lista de amigos deve exibir `0/128`.
3. **Validação Prévia de Existência**: Toda ação social que referencia um jogador pelo nome deve antes resolver a entidade correspondente via `PlayerRegistry`. Se não for encontrada, deve falhar com `PLAYER_NOT_FOUND`.
4. **Proibição de Mascaramento de Bots**: Bots nunca podem ser retornados como jogadores reais (`playerType == 'real'`).
5. **Anti-Auto-Relacionamento**: Um jogador não pode se adicionar como amigo, se bloquear, nem se definir como próprio mentor (`myCharId === targetCharId` é rejeitado).
6. **Desacoplamento de Amizade e Mentoria**: O vínculo de Mentoria é independente de Indicação (Referral) e de Amizade.
7. **Consistência Atômica**: Adições e remoções de relacionamentos devem ser gravadas atomicamente no Firestore antes de refletir no cache de visualização do cliente.
8. **Cache Passivo na UI**: `state.friends` é apenas um cache de leitura temporário na memória do cliente. Ele nunca é a fonte autoritativa de verdade.
9. **Respeito a Bloqueios**: Jogadores bloqueados não podem receber pedidos de amizade ou convites de grupo/clã.
10. **Presença em Tempo Real**: O status online/offline é derivado da coleção `presence`, mantendo a identidade persistente do jogador intacta mesmo quando desconectado.
