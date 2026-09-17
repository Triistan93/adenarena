# 🔬 AUDITORIA DE DEPENDÊNCIAS DE `classes_echo_defs.js`
## Aden Arena — Forensic Dependency & Decoupling Audit

> **Arquivo Auditado:** `lineage-idle/src/data/classes/classes_echo_defs.js` (305 KB, 2.773 linhas)  
> **Objetivo:** Rastreamento cirúrgico de imports, exports, chamadores, símbolos, habilidades embutidas, dados e runtime patches para extinção/desacoplamento definitivo.

---

## 1. INVENTÁRIO DO ARQUIVO AUDITADO

### A. Símbolos e Estruturas Internas
1. **`RACES_ECHO` (Linhas 7–16)**:
   - Objeto contendo 9 raças (`human`, `elf`, `darkelf`, `orc`, `dwarf`, `kamael`, `sylph`, `highelf`, `ertheia`).
   - Define: `name`, `desc`, `stats: { atk, def, eva, matk, mdef }`, `startZone: 'talkingIsland'`.
2. **`CLASSES_ECHO` (Linhas 18–2761)**:
   - Monólito com dezenas de classes em camelCase e snake_case mistos.
   - Cada classe contém:
     - Metadados: `name`, `parent`, `race`, `archetype`, `stage`, `desc`, `base: { atk, def, hp, mp, eva, crit, matk, mdef }`.
     - Habilidades embutidas (`skills: [...]`): Arrays de objetos crus (`name`, `type`, `rarity`, `effect: "Dano 190%"`, `cooldown`, `desc`).
3. **Runtime Patches Globais (Linhas 2763–2768)**:
   - `window.EchoData = { RACES_ECHO, CLASSES_ECHO };`
   - `window.GameData.RACES_ECHO = RACES_ECHO;`
   - `window.GameData.CLASSES_ECHO = CLASSES_ECHO;`
4. **Exports Formais (Linha 2770)**:
   - `export { RACES_ECHO, CLASSES_ECHO };`

---

## 2. MAPEAMENTO EXAUSTIVO DE CHAMADORES E CONSUMIDORES

| Consumidor | Símbolo Acessado | Mecanismo de Acesso | Finalidade do Consumo | Classificação | Ação de Desacoplamento |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `lineage-idle/src/engine/StatsEngine.js` | `CLASSES_ECHO` | `import` e fallback em `getClass(classId)` | Leitura de `.base` e `.archetype` da classe | **REPLACE** | Substituir consulta direta por `CanonicalClassRegistry[classId]`. |
| `lineage-idle/src/data/classes/index.js` | `CLASSES_ECHO` | `import` e re-export em `window.EchoData` | Ponte global de dados legados | **REPLACE** | Re-exportar `CanonicalClassRegistry` como dados oficiais. |
| `lineage-idle/data/classes_echo.js` | `CLASSES_ECHO`, `RACES_ECHO` | `import` de `src/data/classes/index.js` | Re-export legado para compatibilidade | **REPLACE** | Apontar para o novo registro canônico unificado. |
| `lineage-idle/data/echo-adapter.js` | `CLASSES_ECHO` | `window.EchoData.CLASSES_ECHO` | Itera sobre `.skills` para gerar `CLASS_SKILLS_ECHO` e layouts | **REPLACE** | Desativar parsing de skills em texto cru; consumir `CanonicalClassGraph`. |
| `lineage-idle/main.js` | `CLASSES_ECHO` | `window.EchoData.CLASSES_ECHO` | Fallback de sucessores na cerimônia de avanço de classe | **REPLACE** | Substituir por `ClassProgressionEngine.getAvailablePromotions()`. |
| `lineage-idle/src/core/StateManager.js` | `CLASSES_ECHO` | `window.EchoData.CLASSES_ECHO` | `applyStarterKit` lê `classDef.base?.hp/mp` | **REPLACE** | Obter status iniciais diretamente de `CanonicalClassRegistry`. |
| `lineage-idle/src/services/CharacterService.js` | `CLASSES_ECHO` | `window.EchoData.CLASSES_ECHO` | Validação de transição e requisitos de classe | **REPLACE** | Usar `ClassValidationService` e `ClassProgressionEngine`. |
| `lineage-idle/src/data/items/item_class_rules.js` | `CLASSES_ECHO` | `window.EchoData.CLASSES_ECHO` | `getPlayerArchetypes` para permissão de equipamentos | **REPLACE** | Consultar `node.archetype` no Grafo Canônico. |
| `lineage-idle/src/ui/GameUI.js` | `CLASSES_ECHO`, `RACES_ECHO` | `window.GameData.CLASSES_ECHO` | Renderizar nome e descrição na aba de personagem | **REPLACE** | Obter `name` de `CanonicalClassRegistry[classId]`. |
| `lineage-idle/src/data/elemental/SkillRegistry.js` | `CLASSES_ECHO` | `import` estático | Varre classes para montar matriz elemental | **REPLACE** | Consumir nós do `CanonicalClassRegistry`. |
| `lineage-idle/src/data/elemental/ClassLineage.js` | `CLASSES_ECHO` | `window.EchoData.CLASSES_ECHO` | Coleta filhos diretos para grafo de linhagem | **REPLACE** | O Grafo Canônico já fornece sucessores oficiais. |
| `lineage-idle/src/data/elemental/Contract32ForensicAudit.js` | `CLASSES_ECHO` | `import` estático | Teste e auditoria de cobertura das classes antigas | **MIGRATE** | Adaptar para auditar as 159 classes canônicas. |
| `scripts/build_skill_tree_doc.mjs` | `CLASSES_ECHO` | `import` estático | Script auxiliar de geração de docs antigas | **MIGRATE** | Atualizar para ler `classes_tree_canonical.json`. |
| `scripts/build_canonical_v2.mjs` | `CLASSES_ECHO` | `import` estático | Script antigo que gerava V2 de 142 classes | **REMOVE** | Obsoleto; substituído pelo novo pipeline canônico. |

---

## 3. AUDITORIA DAS HABILIDADES EMBUTIDAS EM TEXTO (SKILLS DATA)

No arquivo `classes_echo_defs.js`, as habilidades eram declaradas no formato:
```javascript
skills: [
  { name: "Power Smash", type: "Ativo", rarity: "1★", effect: "Dano 190% + knockback", cooldown: "10s", desc: "Golpe esmagador." }
]
```
### Diagnóstico:
1. **Mistura Tóxica de Domínios**: Viola a separação estrita `CLASS DATA ≠ SKILL DATA`.
2. **Descrições Não-Canônicas**: Efeitos como `"Dano 190%"` são aproximações informais não extraídas da L2Wiki.
3. **Destino no Rebuild**:
   - **REMOVE TOTAL**: Nenhuma habilidade será declarada dentro das definições de classes.
   - As habilidades reais e seus metadados residem em `CanonicalSkillRegistryV2.js` (761 habilidades semânticas oficiais da L2Wiki).
   - As classes apenas referenciam IDs de habilidades em `unlockedSkillIds`.

---

## 4. AUDITORIA DE RUNTIME PATCHES E ESTADO GLOBAL

As linhas 2763–2768 injetam dados diretamente em `window.EchoData` e `window.GameData`.
### Diagnóstico:
- Poluição do escopo global.
- Cria acoplamento oculto difícil de rastrear em testes unitários.
### Ação de Desacoplamento:
1. A camada de dados `CanonicalClassRegistry.js` e `CanonicalClassGraph.js` será puramente exportada como módulos ES (`export const CANONICAL_CLASS_REGISTRY = ...`).
2. Para retrocompatibilidade durante a transição com a UI vanilla do `main.js`, manter uma ponte de compatibilidade única e controlada em `lineage-idle/data/classes_echo.js` que re-exporta `CanonicalClassRegistry` sob a chave `CLASSES_ECHO`.
3. Nenhum código de domínio (motor de combate, progressão, status, equipamentos) lerá de `window.EchoData`.

---

## 5. CLASSIFICAÇÃO FINAL DE CADA DEPENDÊNCIA

- **RACES_ECHO**: **MIGRATE** -> Substituído por `CanonicalRaceRegistry.js` (9 raças oficiais).
- **CLASSES_ECHO (Definições de Classes)**: **REPLACE** -> Substituído por `CanonicalClassRegistry.js` (159 classes canônicas).
- **CLASSES_ECHO.skills (Habilidades embutidas)**: **REMOVE** -> Totalmente extintas do domínio de classes.
- **`classes_echo_defs.js` (Arquivo físico de 305 KB)**: **REPLACE/SHELL** -> O arquivo original de 305 KB será desativado. Uma casca de compatibilidade temporária de menos de 1 KB re-exportará `CanonicalClassRegistry` para evitar quebra de ferramentas externas até conclusão total do ciclo.
