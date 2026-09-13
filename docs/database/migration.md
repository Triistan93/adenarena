# Aden Arena / Lineage Idle — Database Migration & Legacy Sunset Plan

Este documento detalha o plano de transição da persistência legada baseada no monólito `users/{userId}` para o novo modelo canônico relacional no Cloud Firestore.

---

## 1. Fases da Migração

```
┌─────────────────────────┐     ┌─────────────────────────┐
│         FASE 1          │     │         FASE 2          │
│ Dual-Write (Canônico +  │ ──> │  Canônico Primário      │
│  Compatibilidade Users) │     │ (Users só Fallback Read)│
└─────────────────────────┘     └─────────────────────────┘
             │                               │
             ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│         FASE 3          │     │         FASE 4          │
│ Desativação de Escrita  │ ──> │ Expurgo e Arquivamento  │
│       no Legado         │     │     de Blobs Antigos    │
└─────────────────────────┘     └─────────────────────────┘
```

### Fase 1: Dual-Write & Upgrade Automático (Atual)
- O cliente grava no modelo canônico (`characters`, `accounts`, `character_names`, `presence`, `pvp_rankings`) e mantém gravação espelho em `users/{userId}`.
- Ao carregar dados locais ou de nuvem, o adaptador verifica se a conta possui `characterId`. Se não possuir, gera uma identidade canônica estável e reserva o nome em `character_names`.
- **Purge de Amigos Fictícios**: Se a lista de amigos do save legado contiver `Vaelin`, `Elwen` ou `SirGalahad`, eles são expurgados imediatamente, iniciando `friends = []` a menos que amizades reais tenham sido formadas.

### Fase 2: Canônico Primário
- As leituras de estado, rankings e dados sociais consultam exclusivamente as coleções canônicas.
- O documento `users/{userId}` é consultado somente se o documento `characters/{characterId}` ainda não existir para aquele UID.

### Fase 3: Desativação do Legado
- O método de save encerra as escritas em `users/{userId}`.
- O campo `state` monolítico deixa de receber updates.

### Fase 4: Arquivamento
- Opcional expurgo de documentos antigos em `users` após 90 dias de migração completa.
