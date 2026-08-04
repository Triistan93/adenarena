# Implemented Documentation — Correção de Bugs Pós-Refatoração

---

## 🛠️ Detalhamento das Correções Realizadas

### 1. `lineage-idle/main.js` — Correção de `formatItemDisplayName`
- **Problema**: O import foi feito com o alias `uiFormatItemDisplayName`, porém duas chamadas ainda utilizavam `formatItemDisplayName(item, def)`.
- **Ação**: Atualizadas todas as chamadas para `uiFormatItemDisplayName(item, def)`.

### 2. `lineage-idle/main.js` — Assinatura e Import de `getEquippedSetCount`
- **Problema**: `getEquippedSetCount` não constava na lista de imports do `StatsEngine.js` e era chamada apenas com `setDef`.
- **Ação**: Adicionado o import em `main.js` e corrigida a chamada para `getEquippedSetCount(state, setDef)`.

### 3. `lineage-idle/main.js` — Reintrodução de `updateZoneKillProgressUI`
- **Problema**: Função órfã não declarada no `main.js` extraído.
- **Ação**: Adicionada a função `updateZoneKillProgressUI()` antes de `pickRandomMonster()`, atualizando o contador `⚔️ X/15 Caçados` e o alerta `🚨 CHEFÃO DISPONÍVEL!`.

### 4. `lineage-idle/src/core/StateManager.js` — Acessador `gData`
- **Problema**: Referência invalida `gData?.ALL_ITEMS`.
- **Ação**: Substituído por `D()?.ALL_ITEMS`.

### 5. Estrutura de Imagens Flat (`art.js` & `heroImages.ts`)
- **Escolha da Opção**: **Opção A** (Caminhos FLAT diretos em `art.js` e mapa direto em `heroImages.ts`).
- **Ação A**:
  - `HERO_IMG` e `RACE_FALLBACK` atualizados em `art.js` para apontarem para `/img/Races/<file>.png` ou `/img/<file>.png`.
  - `MON_IMG` atualizado para apontar direto para `/img/<mon_file>.png` sem subpastas `SemLocal` ou `Monsters/`.
- **Ação B**: `heroImages.ts` atualizado via gerador para mapear todas as 1079 rotas diretas e apelidos legados.

### 6. Mercador (Shop) e Abas do Jogo
- **Problema**: Os containers de vitrine do Mercador (`#shop-list`), Forja (`#craft-list`) e Zonas (`#zone-list`) possuem IDs secundários no Shadow DOM.
- **Ação**: Atualizados os seletores no `ShopUI.js` (`el('shop-items-container') || el('shop-list')`), `StageUI.js` e `main.js` (adicionados ouvintes de clique `.shop-subtab`, `.zone-subtab`, `#tower-challenge-btn` e `#tower-sweep-btn`).

---

## 📋 Lista de Funções Recuperadas / Re-importadas

| Função | Arquivo de Destino | Arquivo de Origem |
| --- | --- | --- |
| `uiFormatItemDisplayName` | `lineage-idle/main.js` | `src/ui/TooltipUI.js` |
| `getEquippedSetCount` | `lineage-idle/main.js` | `src/engine/StatsEngine.js` |
| `updateZoneKillProgressUI` | `lineage-idle/main.js` | Recriada (UI / Stage) |
| `updateShopUI` / `updateCraftUI` | `lineage-idle/src/ui/ShopUI.js` | Suporte a `#shop-list` / `#craft-list` |
| `bindEvents` / `setMainRoot` | `lineage-idle/src/core/GameBootstrap.js` | `lineage-idle/main.js` |
