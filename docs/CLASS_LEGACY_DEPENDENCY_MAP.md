# 🗺️ MAPA DE DEPENDÊNCIAS DO SISTEMA LEGADO DE CLASSES
## Aden Arena — Class System Rebuild Migration Blueprint

> **Status:** AUDITADO E CATALOGADO  
> **Escopo:** Rastreabilidade estrita de cada artefato legado, seus consumidores, seu papel e a estratégia de substituição limpa pelo novo Grafo Canônico de Classes (49 Linhagens / 159 Nós).

---

## 1. MATRIZ DE DEPENDÊNCIA DE ARQUIVOS E SÍMBOLOS

| Arquivo Legado | Símbolos Exportados / Padrões | Consumidores Principais | Papel Atual | Estratégia de Migração (New Registry) |
| :--- | :--- | :--- | :--- | :--- |
| `lineage-idle/src/data/classes/classes_echo_defs.js` | `CLASSES_ECHO`, `RACES_ECHO` | `StatsEngine`, `echo-adapter`, `CharacterService`, `build_canonical_v2`, `SkillRegistry` | Repositório central legado de classes com skills embutidas | **WIPE TOTAL**. Substituído por `CanonicalClassRegistry` unificado. |
| `lineage-idle/src/data/classes/CanonicalClassRegistryV2.js` | `CANONICAL_CLASS_REGISTRY_V2`, `ALL_CANONICAL_CLASS_IDS` | `SkillEligibility`, `SkillMigrationService`, `SkillSystemV2Validator`, `echo-adapter` | Registro V2 de 142 classes (L2Wiki) | **SUBSTITUIR** pelo Grafo Canônico Oficial de 159 nós (49 linhagens). |
| `lineage-idle/src/data/classes/class_aliases.js` | `CLASS_ALIASES`, `resolveCanonicalClassId`, `resolveCanonicalDagClassId` | Praticamente todos os serviços e engines | Dicionário de 400+ aliases para tentar normalizar IDs mal formatados | **EXTINGUIR**. O criador e o save usarão exclusivamente IDs canônicos oficiais. |
| `lineage-idle/data/echo-adapter.js` | `CLASS_SKILLS_ECHO`, `SKILL_DEFS_ECHO`, `SKILL_TREE_LAYOUT_ECHO` | `main.js`, `GameUI.js`, testes automatizados | Transforma `CLASSES_ECHO` em formato consumível pelo engine | **REFATORAR/APOSENTAR**. Motor consumirá classes e árvores diretamente do registro. |
| `lineage-idle/src/data/races.js` | `RACES`, `CLASSES`, `RACE_BASE_ATTRIBUTES`, `DWARF_CLASS`, `KAMAEL_CLASS` | `StatsEngine.js`, `main.js` | Pontes globais e matriz estática de atributos base | Substituir por `CanonicalRaceRegistry` e atributos derivados de classes base. |
| `lineage-idle/src/data/elemental/HistoricalClasses.js` | `HISTORICAL_CLASSES`, `HISTORICAL_CLASS_MAP` | `ClassLineage.js`, `CharacterService.js`, `StatsEngine.js` | Mapeamento ancestral legado de 80+ classes | Unificar diretamente dentro do Grafo Canônico de Classes. |
| `lineage-idle/src/data/elemental/ClassLineage.js` | `getPredecessor`, `getSuccessors`, `getAncestors`, `canAdvance` | `CharacterService.js`, `main.js`, `SkillEligibility.js` | Grafo de evolução construído via código | Refatorar para consultar os nós do novo `ClassGraph`. |
| `src/data/classes/*.js` (9 arquivos) | `HUMAN_CLASSES`, `ELF_CLASSES`, etc. | `src/data/index.js` -> `window.GameData.CLASSES` | Classes obsoletas da primeira versão do jogo | **WIPE TOTAL**. Remover os 9 arquivos e desacoplar `src/data/index.js`. |
| `src/data/starterKits.ts` | `getStarterKit`, `StarterKitConfig` | `LoginScreen.tsx`, `StateManager.js` | 290 linhas de `if/else` com kits iniciais e skills V1 | Substituir por tabela de Starter Kits orientada a arquétipos canônicos. |
| `src/components/CharacterCreation.tsx` | `RACES_INFO`, IDs sintéticos de classes | `LoginScreen.tsx`, `IdleGame.tsx` | Criador de personagens com IDs incorretos (`wargBase`, `assassinS0`, etc.) | **REFATORAR**. Popular dinamicamente a partir das 25 classes base do Grafo Canônico. |
| `src/services/IconService.ts` | `CLASS_ICONS` (150+ chaves manuais) | `CharacterCreation.tsx`, `LoginScreen.tsx` | Mapeamento hardcoded de classe -> WebP | Substituir por derivação semântica `/icons/${classId}.webp` com fallback auditado. |

---

## 2. MAPEAMENTO DE CONSUMIDORES DE ESTADO (`state.class` / `character.class`)

### A. Fluxo de Vida do Personagem (Criação e Inicialização)
1. **`CharacterCreation.tsx`**:
   - Atualmente seleciona classes com IDs sintéticos: `fighter`, `deathPilgrim`, `wargBase`, `assassinS0`, `elfFighter`, `darkElfFighter`, `rider`, `shineMakerBase`, `samuraiBase`, `sylphGunner`, `divineTemplarBase`, `elementWeaverBase`, `marauderBase`, `sayhaMageBase`.
   - **Novo Padrão:** Apresentar as 25 classes base de Nível 1 do manifesto canônico (`fighter`, `mage`, `human_deathknight_0`, `werewolf_0`, `secret_assassin_male_0`, `elven_fighter`, `elven_mage`, `dark_fighter`, `dark_mage`, `orc_fighter`, `orc_mage`, `orc_rider_0`, `artisan`, `shinemaker_0`, `trooper`, `samurai_0`, `sylph_gunner_0`, `high_elf_templar_0`, `high_elf_weaver_0`, `ertheia_fighter_0`, `ertheia_mage_0`).

2. **`LoginScreen.tsx` (`handleCharacterCreated`)**:
   - Grava `state.class = data.className`.
   - Concede `kit.starterSkill` (atualmente habilidades sintéticas V1 como `cinderblade`).
   - **Novo Padrão:** Conceder habilidade inicial Nível 1 legítima da classe base escolhida.

3. **`StateManager.js` (`applyStarterKit`)**:
   - Realizava parsing textual de `state.class` para inferir armas e armaduras.
   - **Novo Padrão:** Obter `archetype`, `armorMastery` e `weaponMastery` diretamente da definição da classe.

---

### B. Progressão e Troca de Classe (Class Transfers)
1. **`main.js` (Modal de Cerimônia de Avanço de Classe, Linhas 573–645)**:
   - Detecta `currentStage = getClass(state.class)?.stage || 0`.
   - Busca opções elegíveis em `getSuccessors(state.class)` com fallback manual iterando em `CLASSES_ECHO`.
   - **Novo Padrão:** O Grafo Canônico fornece diretamente `node.successors` para o estágio correspondente (Lv 20: 1ª Classe, Lv 40: 2ª Classe, Lv 76: 3ª Classe), eliminando todo fallback iterativo.

2. **`CharacterService.js` (`advanceClass`)**:
   - Atualiza `state.class = newClassId`.
   - **Novo Padrão:** Atualização canônica imediata sem necessidade de passar por sanitizadores ou pontes de alias.

---

### C. Sistema de Equipamentos e Paperdoll
1. **`lineage-idle/src/data/items/item_class_rules.js`**:
   - `ARMOR_TYPE_ARCHETYPES` e `WEAPON_TYPE_ARCHETYPES` definem permissões por arquétipo.
   - `getPlayerArchetypes(playerClassId)` subia a árvore buscando `def.archetype`.
   - **Novo Padrão:** O Grafo Canônico define o arquétipo primário (`fighter`, `knight`, `rogue`, `archer`, `mage`, `healer`, `summoner`, `enchanter`) de forma estrita em cada nó.

2. **`lineage-idle/src/services/EquipmentService.js`**:
   - Linhas 300–303 inspecionavam `.includes('archer')`, `.includes('dagger')`, `.includes('knight')`.
   - **Novo Padrão:** Substituir por flags do arquétipo ou tags de maestria de armas/armaduras da classe (`canUseBow`, `canUseDagger`, `canUseShield`).

---

### D. Árvore de Habilidades (SkillWindow & SkillEligibility)
1. **`SkillEligibility.js`**:
   - `isMageClass(classId)`: eliminar a lista de 32 palavras-chave. Usar `classDef.archetypeGroup === 'mage'`.
   - `getSkillUnlockLevelForClass(classId, skillId)`: consultar o nível de desbloqueio canônico no nó da classe ou em seus ancestrais diretos no Grafo.
   - `isSkillInProgressionPath(character, skill)`: verificar se a habilidade pertence à linhagem ancestral do nó atual.

2. **`SkillTreeViewModel.js`**:
   - `getSkillTreeViewModel(character)`: monta as categorias ATIVAS, PASSIVAS e ULTIMATE consultando as habilidades desbloqueadas e os ancestrais do personagem de forma limpa.

---

### E. Economia e Subclasses
1. **`SubclassCertificationService.js`**:
   - Possui 7 arrays gigantescos de classes hardcoded.
   - **Novo Padrão:** O arquétipo de certificação de subclasse é derivado diretamente do campo `subclassArchetype` de cada classe no Grafo Canônico.

2. **`CashShopService.js`**:
   - Eliminar métodos estáticos de adivinhação por string (`getArmorArchetype`, `getHeirloomWeaponForClass`).
   - Usar metadados canônicos da classe do herói para conceder o equipamento de herança correto.

---

## 3. CHECKLIST DE DESMONTAGEM E LIMPEZA (WIPE ORDER)

1. [ ] **Etapa 1: Grafo Canônico de Classes**
   - Implementar o novo registro estruturado em `lineage-idle/src/data/classes/CanonicalClassRegistry.js` baseado no manifesto de 49 linhagens / 159 nós.
2. [ ] **Etapa 2: Atualização do Criador de Personagens**
   - Refatorar `CharacterCreation.tsx` e `LoginScreen.tsx` para apresentar as 25 classes base oficiais com seus IDs canônicos limpos.
3. [ ] **Etapa 3: Substituição em Motores e Serviços**
   - Atualizar `StatsEngine.js` (`getClass`), `EquipmentService.js`, `StateManager.js` (`applyStarterKit`), `CharacterService.js` e `SkillEligibility.js` para consumir o novo registro.
4. [ ] **Etapa 4: Desacoplamento da UI e Paperdoll**
   - Atualizar `GameUI.js` e `SkillTreeViewModel.js` para renderizar títulos, brasões e árvores sem depender de `EchoData.CLASSES_ECHO`.
5. [ ] **Etapa 5: Limpeza e Eliminação Física de Arquivos Legados**
   - Excluir `src/data/classes/*.js` (9 arquivos obsoletos).
   - Esvaziar / Aposentar `classes_echo_defs.js` (305 KB).
   - Remover pontes redundantes em `data/classes_echo.js`.
   - Atualizar os testes automatizados para validar contra o novo registro canônico.
