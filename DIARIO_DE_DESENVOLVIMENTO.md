# 📖 DIÁRIO CENTRAL DE DESENVOLVIMENTO & ENGENHARIA
## Aden Arena: Idle Chronicles — Registro Canônico Unificado de Evolução do Projeto

> **Repositório**: `Triistan93/adenarena` (GitHub: `origin/main`)  
> **Branch Principal**: `main`  
> **Propósito deste Documento**: Registrar cronologicamente todas as sessões de desenvolvimento em formato de páginas contínuas, detalhando data, hora, commits, arquitetura, arquivos alterados, status de testes e métricas de qualidade.

---

### 📑 Índice Rápido de Páginas
- [Página 11 — 17 de Setembro de 2026 às 00:40](#página-11--17-de-setembro-de-2026-às-0040) — *Skill Progression 2.0: Sistema de Loadout de Combate com 7 Slots, Táticas de Auto-Batalha, Drag-and-Drop na UI e Blindagem Universal Anti-Cosméticos*
- [Página 10 — 16 de Setembro de 2026 às 23:50](#página-10--16-de-setembro-de-2026-às-2350) — *Expurgamento Global de Habilidades Cosméticas, Montarias ("Mount") e de Aparência ("Appearance") em 100% das Classes do Jogo*
- [Página 9 — 16 de Setembro de 2026 às 23:30](#página-9--16-de-setembro-de-2026-às-2330) — *Reconstrução Canônica Integral do Sistema de Classes (9 Raças, 49 Linhagens, 159 Classes, 134 Arestas, 25 Classes Base), Wiping Controlado do Domínio Legado e Preservação dos Três Pilares Sagrados*
- [Página 8 — 16 de Setembro de 2026 às 20:50](#página-8--16-de-setembro-de-2026-às-2050) — *Economia Canônica de Soulshots/Spiritshots: Grade Matching (+100%) vs Universal Wildcard (+30%) e Consumo Justo 1:1*
- [Página 7 — 16 de Setembro de 2026 às 18:30](#página-7--16-de-setembro-de-2026-às-1830) — *Adaptação Integral dos Conceitos Canônicos do Lineage II Essence (Season 1 Lv 1–40), Economia Fechada, Coleções Perpétuas, Crafting D/C, Augmentação e Brooches*
- [Página 6 — 16 de Setembro de 2026 às 01:00](#página-6--16-de-setembro-de-2026-às-0100) — *Expurgo de Vínculos Sintéticos, Reconstrução Canônica Baseada no Webscraping Oficial do L2Wiki Essence, Duelista com Blade Punishment (39 Skills) e Sincronização Integral de 142 Classes V2*
- [Página 5 — 16 de Setembro de 2026 às 00:30](#página-5--16-de-setembro-de-2026-às-0030) — *Webscraping Canônico L2Wiki Essence, 147 Classes, 2.947 Habilidades & Fix de Ícones*
- [Página 4 — 15 de Setembro de 2026 às 23:25](#página-4--15-de-setembro-de-2026-às-2325) — *Skill System Major Version Update (V2), 46 Linhagens, 142 Classes, 825 Skills Semânticas, Ledger SP & Celestial Destiny*
- [Página 3 — 15 de Setembro de 2026 às 00:05](#página-3--15-de-setembro-de-2026-às-0005) — *Extração Massiva L2Bandit & PMfun, 1.991 Ícones WebP, Índices Mestres de 20k Chaves, IconService, UI Modernizada & Deploy*
- [Página 2 — 14 de Setembro de 2026 às 23:45](#página-2--14-de-setembro-de-2026-às-2345) — *Arquitetura Zero-Trust, Blindagem Admin/Cakto/Firestore, Life Activities 2.0, Economia Fechada & Performance Chunks*
- [Página 1 — 12 de Setembro de 2026 às 22:30](#página-1--12-de-setembro-de-2026-às-2230) — *Consolidação de Arquitetura, UX do Personagem & Mochila, Motor de Encantamento Canônico, Auto-Equip ERS e Ressonância de Armas*

---

<br/>

## Página 11 — 17 de Setembro de 2026 às 00:40
### ⚔️ Skill Progression 2.0: Sistema de Loadout de Combate com 7 Slots, Táticas de Auto-Batalha, Drag-and-Drop na UI e Blindagem Universal Anti-Cosméticos

> **Data & Hora**: 17/09/2026 às 00:40 (BRT)  
> **Status de Qualidade**: 
> - **Testes Automatizados**: **622 testes em 92 suítes passando (100% de aprovação, 0 falhas)**.
> - **Build de Produção**: Vite compilado com sucesso em 12.54s (280 módulos).
> - **Preservação Sagrada**: Regra estrita **Zero New Skills** respeitada 100%; 3 Pilares Sagrados (`LevelEngine.js`, `MarketService.js`, `ExpeditionService.js`) com 0 alterações.
> - **Invalidação de Cache**: Service Worker elevado para `aden-arena-cache-v8`.

#### 1. Resumo Executivo da Sessão
Implementação integral do **Skill Progression 2.0**, transformando a execução de combate de uma rotação genérica de todas as habilidades aprendidas para um sistema tático de **Loadout de Combate com 7 Slots** desbloqueados progressivamente por nível global. O sistema inclui atribuição de regras táticas inteligentes de auto-batalha (gatilhos de HP do jogador e alvo, contagem de inimigos para AoE, priorização de chefes), suporte nativo a Drag-and-Drop na interface, e a resolução definitiva de vazamento de habilidades cosméticas/montarias através de uma blindagem multi-camada universal.

#### 2. Arquitetura do Sistema de Loadout 2.0
- **Classificação Canônica de Habilidades (`SkillTagService.js`)**:
  - Classificação estrita em 5 tipos de slot: `basic`, `core`, `special`, `signature` e `ultimate`.
  - Habilidades passivas são mantidas **sempre ativas** em segundo plano e nunca ocupam slots de combate.
  - Buffs e Toggles ocupam slots do loadout, exigindo escolhas táticas de composição de build.
  - Regra absoluta **Zero Novas Habilidades**: Nenhuma habilidade sintética ou ID fictício foi criado; todo o sistema opera puramente sobre as habilidades canônicas existentes do Lineage II.
- **Desbloqueio Progressivo por Nível Global (`SkillUnlockSchedule.js`)**:
  - **Nível 1**: 2 slots desbloqueados (`basic`, `core1`).
  - **Nível 20**: 4 slots desbloqueados (`basic`, `core1`, `core2`, `special1`).
  - **Nível 40**: 6 slots desbloqueados (`basic`, `core1`, `core2`, `special1`, `special2`, `signature`).
  - **Nível 76+**: 7 slots desbloqueados (`basic`, `core1`, `core2`, `special1`, `special2`, `signature`, `ultimate`).
- **Serviço de Loadout & Auto-Equip (`SkillLoadoutService.js`)**:
  - Funções puras e imutáveis: `equipSkill()`, `unequipSkill()`, `clearLoadout()`, `autoEquip()`.
  - Migração retrocompatível: Saves legados recebem auto-equipamento determinístico com as melhores habilidades ativas aprendidas de sua classe.

#### 3. Motor de Condições Táticas de Auto-Batalha (`SkillConditionService.js`)
- **Gatilhos Táticos Inteligentes**:
  - **HP do Jogador**: `self_below_75` (cura preventiva), `self_below_50` (cura de emergência), `self_below_30` (defesas críticas).
  - **HP do Alvo**: `target_below_30` (executores/finalizadores), `target_below_50`.
  - **Filtro de Alvos**: `boss_only` (reserva ultimates/grandes recargas para Bosses/Raids/Elites), `normal_only`, `any`.
  - **Filtro de Inimigos**: Requer 1+, 2+ ou 3+ inimigos simultâneos para disparo de habilidades AoE.
- **Predefinições Automáticas Inteligentes**:
  - Habilidades de cura recebem automaticamente a regra `HP < 75%`.
  - Habilidades de área (AoE) recebem automaticamente `2+ Inimigos`.
  - Habilidades de finalização recebem `Alvo < 30%`.
- **Gating no Loop de Combate (`main.js` - `attackMonster()`)**:
  - A rotação de ataque foi refatorada para iterar exclusivamente as habilidades equipadas nos slots ativos do `state.skillLoadout`.
  - Cada habilidade passa pela avaliação `shouldCastSkill(state, skill.id, skill.slot, monster)` antes do gasto de mana e execução, garantindo que recursos não sejam desperdiçados.

#### 4. Interface Visual & Experiência do Usuário (UI/UX)
- **Barra de Loadout de 7 Slots (`GameUI.js` & `GameUI.css`)**:
  - Renderizada no topo da janela de habilidades com visual MMORPG responsivo.
  - Exibe ícones específicos por tipo de slot, nível de desbloqueio quando travado, badge de condição tática ativa (ex.: `⚙️ 👑 Boss · HP<75%`) e botão de remoção rápida `[×]` ao passar o mouse.
  - Botões de ação rápida no cabeçalho: `⚡ Auto-Equipar` e `✕ Limpar`.
- **Drag-and-Drop & Click-to-Equip**:
  - Suporte completo a HTML5 Drag-and-Drop arrastando cards da biblioteca diretamente para os slots desbloqueados da barra.
  - Integração no painel lateral de detalhes da habilidade com botão direto para equipar em slot disponível e controles interativos de configuração de condições táticas (HP trigger, alvo, contagem de inimigos).
  - Badges nos cards da biblioteca (`⚡ Core 1`) indicando em tempo real quais habilidades estão em combate.

#### 5. Blindagem Definitiva Universal contra Cosméticos, Montarias e Transformações
- **Causa Raiz Diagnosticada**:
  - Skills de montaria/transformação com `classes: []` eram tratadas como `classReq: 'any'` no adaptador legado, sendo injetadas por ferramentas de Admin (`adminMaxSkills`) e preservadas por fallbacks de migração.
- **Blindagem Multi-Camada**:
  1. `SkillTagService.js`: `isPurgedSkill()` com correspondência por padrões globais (`mount_*`, `*appearance*`, `*transformation*`, `*detection*`).
  2. `echo-adapter.js`: Bloqueio estrito no gerador canônico e higienização direta de `SKILL_DEFS_ECHO` e `CLASS_SKILLS_ECHO` ao inicializar `window.EchoData`.
  3. `SkillEligibility.js` & `SkillTreeViewModel.js`: Bloqueio de resolução, elegibilidade e renderização (zero habilidades cosméticas/montarias visíveis ou selecionáveis).
  4. `SkillMigrationService.js`: Varredura em cada carregamento de save, expurgando habilidades proibidas e reembolsando 100% do SP investido.
  5. `main.js`: A função `adminMaxSkills()` filtra rigorosamente contra a lista negra e padrões proibidos.
- **Invalidação de Cache (`public/sw.js`)**:
  - Cache elevado para `aden-arena-cache-v8`, garantindo que navegadores destruam bundles antigos em cache ao recarregar a página.

#### 6. Métricas de Cobertura e Validação
- **Suíte de Testes**: **622 testes em 92 arquivos** executados com `node --test test/*.test.js` passando com 100% de sucesso.
- **Testes Forenses Dedicados**:
  - `test/skill-loadout-canon.test.js`: 39 testes cobrindo integridade do loadout, regras de slots, auto-equip, persistência em saves e validação de 0 skills proibidas em personagem Admin Lv. 120.
  - `test/skill-conditions.test.js`: 18 testes cobrindo avaliação funcional de condições, predefinições inteligentes e gating no loop de combate.
- **Build de Produção**: `npm run build` bem-sucedido em 12.54s com empacotamento modular e zero erros de tipo ou linter.

---

<br/>

## Página 10 — 16 de Setembro de 2026 às 23:50
### 🚫 Expurgamento Global de Habilidades Cosméticas, Montarias ("Mount") e de Aparência ("Appearance") em 100% das Classes do Jogo

> **Data & Hora**: 16/09/2026 às 23:50 (BRT)  
> **Status de Qualidade**: 
> - **Testes Automatizados**: **565 testes em 83 suítes passando (100% de aprovação, 0 falhas)**.
> - **Build de Produção**: Vite compilado com sucesso em 13.75s (276 módulos).
> - **Preservação Sagrada**: 0 alterações ou regressões nos 3 pilares intocáveis (`LevelEngine.js`, `MarketService.js`, `ExpeditionService.js`).

#### 1. Resumo Executivo da Sessão
Atendendo à diretriz de limpeza e simplificação tática das árvores de habilidades, foram identificadas e expurgadas integralmente de todas as classes do jogo 18 habilidades utilitárias/cosméticas (Opção C):
1. **Solicitadas Diretamente**: `Mount Shining Lady` (Lv 89, 4★), `Mount Glorious Steed` (Lv 87, 4★), `Dragon Slayer Appearance` (Lv 82, 4★) e `Detection` (Lv 76, 3★).
2. **Habilidades de Aparência**: `Change Appearance` (Lv 1, 1★ - Assassins e Rose Vain).
3. **Todas as Montarias Raciais ("Mount")**: `Mount Golden Lion` (1833), `Mount Pegasus` (1834), `Mount Saber-toothed Cougar` (1835), `Mount Black Bear` (1837), `Mount Kukuru` (1836), `Mount Griffin` (62002), `Mount Night Mare` (54207), `Mount Elemental Lyn Draco` (54225) e `Mount Unicorn` (54256).
4. **Transformações Cosméticas / Formas**: `Transformation: Pirate` (1800), `Dark Assassin Transformation` (1801), `Light Assassin Transformation` (1802) e `White Guardian Transformation` (54102).

#### 2. Detalhamento Técnico das Alterações
- **`CanonicalClassRegistry.js` & `build_canonical_registry.mjs`**:
  - Incorporada lista negra `REMOVED_SKILL_WIKI_IDS` com os 19 IDs numéricos da wiki.
  - Purga de **358 referências numéricas** em `unlockedSkillIds`. Zero classes agora contêm essas habilidades.
- **`CanonicalClassRegistryV2.js`**:
  - Purga de **366 referências** de slugs em `skillIds` ao longo de todas as 142 classes V2.
- **`CanonicalSkillRegistryV2.js`**:
  - As 18 habilidades tiveram seus arrays `classes: []` e `availableTo: []` esvaziados e receberam `disabled: true, removalReason: 'cosmetic_mount_purge'`.
- **Datasets Canônicos Scraped**:
  - `scraped_data_wiki/classes_summary.json` (358 entradas removidas).
  - `scraped_data_wiki/skills_detailed.json` (358 classes desvinculadas nas 18 habilidades).
- **Proteção & Reembolso em Saves**:
  - `normalizeAndValidateSkills` do `SkillEligibility.js` expurga e reembolsa 100% de qualquer SP gasto caso algum save antigo possua essas habilidades gravadas.

---

<br/>

## Página 9 — 16 de Setembro de 2026 às 23:30
### 🏛️ Reconstrução Canônica Integral do Sistema de Classes (9 Raças, 49 Linhagens, 159 Classes, 134 Arestas, 25 Classes Base), Wiping Controlado do Domínio Legado e Preservação dos Três Pilares Sagrados

> **Data & Hora**: 16/09/2026 às 23:30 (BRT)  
> **Status de Qualidade**: 
> - **Testes Automatizados**: **565 testes em 83 suítes passando (100% de aprovação, 0 falhas)**.
> - **Build de Produção**: Vite compilado com sucesso em 15.14s (276 módulos).
> - **Preservação Sagrada**: 0 alterações ou regressões nos 3 pilares intocáveis (`LevelEngine.js`, `MarketService.js`, `ExpeditionService.js`).
> - **Dataset de Autoridade**: `scraped_data_wiki/classes_tree_canonical.json` (SHA-256: `c1699e4ea3a67b6f4d0d693b69df55caf15308733422a5fa66628d5131b858f8`).

#### 1. Resumo Executivo da Sessão
Execução do **Wipe Controlado + Reconstrução Total do Domínio de Classes** do Aden Arena, substituindo por completo as abstrações legadas fragmentadas por um Grafo Acíclico Dirigido (DAG) puro construído diretamente sobre o dataset canônico oficial (`classes_tree_canonical.json`). A arquitetura foi rigidamente dividida nas camadas `DATA ≠ ENGINE ≠ UI`, eliminando heurísticas de adivinhação de strings (`classId.includes('mage')`), estabelecendo regras de transição de classe de múltiplos níveis (Stage 0 $\to$ 1 $\to$ 2 $\to$ 3), e integrando um pipeline de migração unidirecional para saves legados com zero perda de progresso.

#### 2. Métricas Canônicas Computadas Diretamente do Dataset
- **Raças (9)**: Human, Elf, Dark Elf, Orc, Dwarf, Kamael, Sylph, High Elf, Ertheia.
- **Linhagens (49)**: 49 linhagens terminais (exatamente correspondentes às 49 3rd classes).
- **Nós de Classe Únicos (159)**:
  - Stage 0 (Base / Lv 1–19): 25 classes raízes.
  - Stage 1 (1st Class / Lv 20–39): 36 classes intermediárias.
  - Stage 2 (2nd Class / Lv 40–75): 49 classes avançadas.
  - Stage 3 (3rd Class / Lv 76+): 49 classes terminais.
- **Arestas Direcionadas (134)**: Relações pai $\to$ filho únicas no grafo (149 transições de linhagem ao longo dos ramos).
- **Grafo Dirigido Acíclico (DAG)**: 100% válido, ordenação topológica completa de 159/159 nós, zero ciclos, inDegree = 0 exatamente para as 25 classes base, e zero nós órfãos.

#### 3. Detalhamento Arquitetural & Arquivos Entregues
1. **Camada DATA**:
   - `CanonicalClassRegistry.js`: 159 nós congelados (`Object.freeze`) com schema uniforme, `stages`, `allowedPromotions`, `archetype` derivado semanticamente e rótulo de integridade (`baseStatsStatus: 'CONTENT_GAP'` sem invenção de dados).
   - `CanonicalClassGraph.js`: Motor puro de DAG com métodos determinísticos: `getClassNode`, `hasNode`, `getSuccessors`, `getPredecessor`, `getAncestors`, `getDescendants`, `getBaseClassesForRace`, `getLineageChain`, `getAllClassNodes`, `getAllEdges`, `getRootClasses`, `getTerminalClasses`, `topologicalSort`, e `validateIntegrity`.
   - `CanonicalRaceRegistry.js`: 9 raças canônicas e lista canônica de IDs.
2. **Camada ENGINE & SERVICE**:
   - `ClassProgressionEngine.js`: Regras de promoção para Lv 20, Lv 40 e Lv 76, integrando custos de SP e verificações de pré-requisito.
   - `SeasonAvailabilityService.js`: Portão da Season 1 (Lv 1–40 jogáveis, Lv 76+ bloqueados até Season 2).
   - `ClassValidationService.js`: Serviço semântico puro determinando arquétipo (`fighter` vs `mystic`) a partir da classe base original, eliminando substring sniffing.
   - `ClassSaveMigrator.js` & `ClassSaveMigrationMap.js`: Mapeador estático de 315 entradas remapeando aliases legados, camelCase, snake_case e variações semânticas para os IDs canônicos.
   - `StatsEngine.js`: Integração com o grafo canônico com proteção contra ausência de baseStats.
   - `StateManager.js`: Migração automática no carregamento (`loadState`) e resolução de classes canônicas no `applyStarterKit`.
3. **Camada UI**:
   - `CharacterCreation.tsx`: Exposição das 25 classes base canônicas distribuídas pelas 9 raças com IDs snake_case autênticos e avatares oficiais.
   - `starterKits.ts`: Atualização das chaves e pacotes iniciais para todas as classes base canônicas.
4. **Wipe Controlado de Código Legado**:
   - Deletados 9 arquivos obsoletos: `src/data/classes/{human, elf, darkElf, orc, dwarf, kamael, sylph, highElf, ertheia}.js`.
   - Desacoplado `src/data/index.js` e `lineage-idle/data/classes_echo.js` para re-exportar os registros canônicos.
5. **Preservação dos Três Pilares Sagrados**:
   - `LevelEngine.js`, `MarketService.js` e `ExpeditionService.js` permaneceram com diff rigorosamente vazio (`git diff = 0`).
   - Criada a suíte `test/sacred-pillars-regression.test.js` garantindo paridade funcional matemática e operacional.

---

<br/>

## Página 8 — 16 de Setembro de 2026 às 20:50
### 🏹 Economia Canônica de Soulshots/Spiritshots: Grade Matching (+100%) vs Universal Wildcard (+30%) e Consumo Justo 1:1

> **Data & Hora**: 16/09/2026 às 20:50 (BRT)  
> **Commits desta Sessão**:
> - `feat(combat): implement authentic soulshot grade matching (+100%) vs universal wildcard (+30%) with 1:1 consumption`
>
> **Status de Qualidade**: 
> - **Testes Automatizados**: **545 testes em 83 suítes passando (100% de aprovação, 0 falhas)**.
> - **Build de Produção**: Vite compilado com sucesso com chunks otimizados.
> - **Preservação Sagrada**: 0 alterações ou regressões nos 3 pilares intocáveis (`LevelEngine.js` Curva Monotônica 1-40, `MarketService.js` Mercado 10 slots 5%, `ExpeditionService.js` Expedições).

#### 1. Resumo Executivo da Sessão
Em resposta ao refinamento de gameplay onde no Aden Arena todos os combatentes engajam à mesma distância abstrata no ciclo idle, a antiga proposta de cobrança escalonada de 2 a 4 tiros para arcos foi refatorada para um sistema autêntico e economicamente recompensador de **Correspondência Estrita de Grau**:
1. **Consumo Justo e Homogêneo (1:1)**: Todas as armas (espadas, adagas, maças, varinhas e arcos) consomem exatamente **1 tiro por ataque normal**. O arqueiro não sofre mais taxação arbitrária de recursos.
2. **Vantagem de Grau Correto (+100% de Dano)**: Usar o tiro dedicado da grade exata da arma equipada (`soulshot_ng` para No-Grade, `soulshot_d` para D-Grade, `soulshot_c` para C-Grade) concede o bônus canônico total de **+100% de dano** (multiplicador 2.0x).
3. **Soulshot Universal como Coringa Moderado (+30% de Dano)**: O `soulshot_universal` e `spiritshot_universal` funcionam como coringa para qualquer grau de arma (ideal para passes, drops e iniciantes), mas concedem bônus de **+30% de dano** (multiplicador 1.30x), incentivando a progressão para a forja de tiros dedicados de cada grau.
4. **Proteção contra Desperdício & Bloqueio de Grau Inferior**: Tiros de grau inferior ao da arma equipada (ex: arma D-Grade com apenas `soulshot_ng` no inventário) **não ativam**. O tiro é preservado e o dano é desferido em base (1.0x).
5. **Prioridade Inteligente de Inventário**: Quando o personagem possui tanto o tiro dedicado quanto o universal, o motor consome prioritariamente o tiro dedicado (+100%). Ao esgotar, recorre automaticamente ao universal (+30%).
6. **Módulo Desacoplado no Motor (`CombatEngine.js`)**: Função canônica `resolveSoulshotEffect(state, weaponDef, isMageClass)` exportada para simulações e testes independentes de UI/DOM.

#### 2. Detalhamento Arquitetural & Arquivos Alterados
- **`lineage-idle/src/engine/CombatEngine.js`**: Implementação e exportação de `resolveSoulshotEffect(state, weaponDef, isMageClass)`.
- **`lineage-idle/main.js`**: Integração no ciclo `attackMonster()`, flutuadores visuais com labels específicos (`SS (+100%)`, `SS Univ (+30%)`, `SPS (+100%)`, `SPS Univ (+30%)`) e consumo 1:1.
- **`test/canonical-lineage2-adaptations.test.js`**: Adição do bloco 6 com 6 novos testes unitários cobrindo tiros dedicados, universais, não-ativação de grau inferior, prioridade de consumo e armas mágicas (total da suíte: 18 testes).
- **`docs/ADEN_ARENA_LINEAGE2_CROSS_REFERENCE.md`**: Atualização da Matriz de Decisões de Arquitetura (Seção 7).
- **`docs/IMPLEMENTATION_PLAN_SEASON1_ADAPTATIONS.md`**: Atualização do Diagnóstico (Seção 2) e da Arquitetura de Combate (Seção 6.3).
- **`DIARIO_DE_DESENVOLVIMENTO.md`**: Registro desta Página 8.

---

<br/>

## Página 7 — 16 de Setembro de 2026 às 18:30
### 🏰 Adaptação Integral dos Conceitos Canônicos do Lineage II Essence (Season 1 Lv 1–40), Economia Fechada, Coleções & Forja Autêntica

> **Data & Hora**: 16/09/2026 às 18:30 (BRT)  
> **Commits desta Sessão**:
> - `e1353ab` — `feat(design): adapt Lineage II canonical systems to Aden Arena (Season 1) — closed economy, gear collections, D/C crafting, augmentation & brooch jewels`
>
> **Status de Qualidade**: 
> - **Testes Automatizados**: **539 testes em 82 suítes passando (100% de aprovação, 0 falhas)**.
> - **Build de Produção**: Vite compilado com sucesso em **19.63s** (268 módulos transformados, saída 0).
> - **Preservação Sagrada**: 0 alterações ou regressões nos 3 pilares intocáveis (`LevelEngine.js` Curva Monotônica 1-40, `MarketService.js` Mercado 10 slots 5%, `ExpeditionService.js` Expedições).

#### 1. Resumo Executivo da Sessão
Em resposta à diretriz mandatória de transformar os conceitos teóricos do Lineage II Essence em mecânicas reais e funcionais no Aden Arena (mantendo os pilares consolidados de Nível 1–40, Mercado e Expedições), executou-se a reconstrução profunda do ecossistema econômico, progressão de equipamentos e ciclo de combate:
1. **Coleções de Equipamentos (Permanent Gear Sink)**: Criação do `CollectionService.js` e expansão de `codex.js` com 15 coleções Season 1 (No-Grade e D-Grade). Itens duplicados ou obsoletos são sacrificados e destruídos permanentemente do inventário/armazém em troca de atributos perenes e Combat Power (CP).
2. **Forja & Crafting Canônico Grau D e C**: Eliminação da dependência excessiva de drop pronto. Adição de receitas oficiais de armas (Crimson Sword, Samurai Longsword, Eminence Bow, Homunkuluss Sword), armaduras completas (Brigandine Heavy, Manticore Light, Mithril Robe, Theca Light, Karmian Robe) e consumíveis (Shots D/C em lotes de 500x, Ensopado de Peixe e Poções Maiores).
3. **Integração de Life Activities 2.0 (Refino de Pescado)**: Criação de receitas na bancada de refino (`RefineryService.js` + `ResourceDictionary.js`) para processar peixes pescados em `fish_oil` e `pure_fish_oil`, alimentando o ciclo de culinária e forja nobre.
4. **Augmentação Autêntica de Armas**: Overhaul de `AugmentationService.js`, tornando estritamente obrigatória a presença física de Life Stone no inventário + Gemstones/Cristais do respectivo grau + taxa de Adena do ferreiro, eliminando o roll gratuito com adena.
5. **Broches e Joias de Broche (Expurgo de Fusão Gacha Comum)**: Remoção definitiva de armas e armaduras comuns da síntese de duplicatas (`SynthesisService.js`), restringindo a fusão exclusivamente a artefatos e joias de broche (Ruby, Sapphire, Diamond, Pearl, Opal) com progressão determinística de níveis 1 a 5.
6. **Combate & Consumo Real de Shots**: Consumo escalonado de Soulshots/Spiritshots por tipo de arma (arcos consomem de 2 a 4 shots por disparo) e penalidade de 50% de eficácia em caso de tiro de grau inferior ao da arma.

#### 2. Detalhamento Arquitetural & Arquivos Alterados
- **`lineage-idle/src/services/CollectionService.js`** *(NOVO)*: Motor canônico de coleções de conta com sacrifício definitivo de itens e cálculo cumulativo de atributos.
- **`lineage-idle/src/data/items/broochJewels.js`** *(NOVO)*: Catálogo canônico de broches Grau D/C e joias de broche (Ruby, Sapphire, Diamond, Pearl, Opal Lv 1–5).
- **`test/canonical-lineage2-adaptations.test.js`** *(NOVO)*: Suíte com 12 testes unitários auditando coleções, crafting de shots, augmentação, síntese de joias e refino.
- **`lineage-idle/src/services/lifeActivities/RefineryService.js`**: Receitas de `refine_fish_oil` e `refine_pure_fish_oil` integradas com agregação polimórfica de pescados.
- **`lineage-idle/src/services/lifeActivities/ResourceDictionary.js`**: Registro canônico de `fish_oil` e `pure_fish_oil`.
- **`lineage-idle/src/data/items/recipes_drops.js`**: Inclusão de receitas D e C com suporte a `outputQty` em lote (500x shots).
- **`lineage-idle/src/services/CraftService.js`**: Respeito a `recipe.outputQty` e fallback resiliente a `CRAFTING_RECIPES`.
- **`lineage-idle/src/services/AugmentationService.js`**: Validação estrita de Life Stones e Gemstones/Cristais físicos.
- **`lineage-idle/src/services/SynthesisService.js`**: Restrição estrita para artefatos e progressão de nível de joias de broche.
- **`lineage-idle/src/data/balance/cpBalance.js`**: Integração de CP do Codex e Joias de Broche com importação estrita de `CODEX_SETS`.
- **`lineage-idle/main.js`**: Consumo de shots escalonado por arma e penalidade de mismatch de grau.

#### 3. Auditoria de Conformidade & Cobertura de Testes
- **Suíte Canônica de Adaptações (`test/canonical-lineage2-adaptations.test.js`)**: 12/12 testes aprovados.
  - Registro de coleções com sacrifício permanente e imunidade a duplicatas.
  - Forja em lote de 500x Soulshots com deduções exatas de Cristais D e Minérios.
  - Gatekeeper de Augmentação impedindo uso sem Life Stone física no inventário.
  - Barreira de Síntese rejeitando armas e promovendo joias de broche até Lv 5.
  - Refino de pescado bruto consumindo diferentes espécies sem travas de ID.
- **Auditoria Global de Regressão**: 539 testes em 82 suítes passando (0 falhas).
- **Compilação de Produção**: Vite 7.3.6 compilado em 19.63s com chunks otimizados.

---

<br/>

## Página 6 — 16 de Setembro de 2026 às 01:00
### ⚔️ Expurgo de Vínculos Sintéticos, Reconstrução Canônica L2Wiki Essence & Duelista com Blade Punishment

> **Data & Hora**: 16/09/2026 às 01:00 (BRT)  
> **Commits desta Sessão**:
> - `697857d` — `feat(skills): L2Wiki Essence full webscrape (147 classes, 2947 skills), fix sleep icon and sync 564 missing icons`
> - `11b09f4` — `feat(skills): rebuild all class skill bindings and canonical registries strictly from L2Wiki Essence scraping`
>
> **Status de Qualidade**: 
> - **Testes Automatizados**: **527 testes em 76 suítes passando (100% de aprovação, 0 falhas)**.
> - **Build de Produção**: Vite 7.3.6 compilado com sucesso em **12.58s** (267 módulos transformados, saída 0).
> - **Integridade Canônica**: 761 habilidades ativas e passivas autênticas com balanceamento, cooldowns canônicos em ms e zero silent gaps (0 `NaN`, 0 `null`); 142 classes V2 com `skillIds` estritamente extraídos do L2Wiki Essence.
> - **Deploy de Produção**: Disparado via GitHub Integration na Vercel a partir da branch `main` (`11b09f4`).

#### 1. Resumo Executivo da Sessão
Atendendo à diretriz mandatória do usuário (*"exclua todos os vinculos de skills e refaça baseadas no webscraping completo do L2Wiki Essence"* e a constatação de que o Duelista carecia da habilidade autêntica *Blade Punishment*):
1. **Expurgo Total de Vínculos Sintéticos**: Todas as amarras de habilidades artificiais anteriores em classes V2 foram eliminadas.
2. **Duelista Autêntico (39 Habilidades)**: A classe Duelista (`duelist`) foi reconstruída com seu conjunto oficial completo do L2Wiki Essence, incluindo **`Blade Punishment`** (`blade_punishment`, `/icons/skill10333.webp`), `triple_slash`, `sonic_buster`, `sonic_storm`, `sonic_blaster`, `sonic_slashing`, `blade_strike`, `slashing_blade`, `war_cry`, `duelists_spirit`, etc.
3. **Reconstrução dos Registros Canônicos V2**:
   - `CanonicalClassRegistryV2.js`: 142 classes canônicas atualizadas com `skillIds` oriundos diretamente do webscraping oficial.
   - `CanonicalSkillRegistryV2.js`: 761 habilidades autênticas compiladas com parsing numérico robusto (resolvendo falhas de regex que geravam `NaN` ou `null`), fórmulas oficiais de recarga e ícones `.webp` locais auditados.
4. **Desacoplamento e Conexão em `echo-adapter.js`**: Removido o bloqueio `if (!ACTIVE_CLASS_SKILLS[classId])` que impedia classes como `duelist`, `sorcerer` e `archmage` de receberem a árvore V2, populando `CLASS_SKILLS_ECHO` incondicionalmente com as habilidades canônicas oficiais.
5. **Ajuste de Elegibilidade & Herança de Níveis (`SkillEligibility.js`)**: Corrigido o algoritmo de caminhamento de ancestrais (`parentClass`) em `getSkillUnlockLevelForClass` para encontrar o **menor** nível de desbloqueio na linhagem (evitando que habilidades como `ice_bolt` de Mage Lv 1 fossem bloqueadas com requisito de Wizard Lv 20) e adicionado suporte a habilidades compartilhadas de arquétipo em `isSkillInV2Lineage`.

#### 2. Detalhamento Arquitetural & Arquivos Alterados
- **`lineage-idle/src/data/classes/CanonicalClassRegistryV2.js`**: Reconstruído com o mapeamento 1-para-1 de 142 classes para as habilidades extraídas da L2Wiki.
- **`lineage-idle/src/data/skills/CanonicalSkillRegistryV2.js`**: 761 habilidades detalhadas estruturadas com atributos de combate (`pwr`, `baseCd`, `mpCost`), categorias e ícones válidos.
- **`lineage-idle/data/echo-adapter.js`**: Desacoplamento de classes canônicas da árvore legada `human_sorcerer` e atribuição incondicional de `CLASS_SKILLS_ECHO`.
- **`lineage-idle/src/services/SkillEligibility.js`**:
  - Resolução do nível mínimo de destravamento pela raiz ancestral mais baixa.
  - Reconhecimento de `SHARED_SKILL_IDS`, `SHARED_MAGE_SKILL_IDS` e `SHARED_FIGHTER_SKILL_IDS` no nível 1 para classes do arquétipo.
- **`lineage-idle/src/services/SkillMigrationService.js`**: Reforço da ordem de prioridade na migração de saves (`OLD_TO_NEW_SKILL_MAP` antes de correspondências genéricas).
- **Testes Automatizados Alinhados**:
  - `test/skill-system-v2-migration.test.js`: 9/9 testes passando, auditando progressão do Duelista com `blade_punishment` e autocast.
  - `test/skill-tree-ui-forensic.test.js`: Ajustados os testes 4, 5 e 6 para as contagens canônicas de habilidades iniciais (Mage = 6 ativas, Fighter = 3 ativas) e Master Ultimate no Lv 90.
  - `test/skill-tree-ui-integration.test.js`: Alinhados testes de integração de árvore de habilidades para as skills autênticas.
  - `test/cross-class-contamination.test.js`: Ajustada contagem de habilidades base de mago para 6.
  - `test/shared-skills-integrity.test.js` & `test/skill-progression-forensic.test.js`: Validados 100% com o novo pipeline de ancestralidade e linhagem.
  - `test/game-balance-runtime-validation.test.js`: Calibração fina de parâmetros para eliminar variância estocástica em combates contra Valakas.

---

<br/>

## Página 4 — 15 de Setembro de 2026 às 23:25
### ⚡ Skill System Major Version Update (V2) — Migração Canônica Celestial Destiny (Patch 3629)

> **Data & Hora**: 15/09/2026 às 23:25 (BRT)  
> **Commits desta Sessão**:
> - `feat(skills): major version update to canonical skill system v2 (celestial destiny 3629)`
> - `fix(skills): activate canonical v2 skills for base classes and resolve skill window pipeline`
>
> **Status de Qualidade**: 
> - **Testes Automatizados**: **527 testes passando em 76 suítes (0 falhas)**.
> - **Build de Produção**: Vite 7.3.6 compilado com sucesso em **12.07s** (267 módulos transformados, código de saída 0).
> - **Integridade de Ativos**: 271 ícones WebP autênticos verificados fisicamente; 554 habilidades com flags explícitas auditadas (`iconGap: true, iconGapReason: 'ASSET_NOT_IN_LIBRARY'`). Zero gaps mascarados.
> - **Deploy de Produção**: Disparado via GitHub Integration na Vercel a partir da branch `main`.

#### 1. Resumo Executivo da Sessão
Executamos a **Major Version Update do Sistema de Habilidades do Aden Arena**, alinhando o jogo à versão canônica de **Lineage II Essence — Celestial Destiny (Patch 3629 de 29/07/2026)**:
1. **Descontinuação do V1 Sintético**: O catálogo de 25 classes x 6 skills com IDs prefixados e inventados foi desativado do gameplay ativo, mantido exclusivamente na camada de migração de saves legados.
2. **Autoridade Direta V2**: Implantação de uma infraestrutura limpa (`CANONICAL V2 -> V2 Resolver -> V2 Combat Contract -> Engine`) cobrindo todas as **46 linhagens canônicas**, **142 classes oficiais** e **825 habilidades únicas**.
3. **Identidade Semântica Canônica**: Eliminação de duplicações artificiais. Habilidades possuem IDs semânticos globais (`power_strike`, `sonic_blaster`, `prominence`, `hell_inferno`, `dragons_breath`), vinculadas a classes via catálogo de desbloqueio.
4. **Ledger Determinístico de Refund de SP**: Migração de saves com cálculo matemático de custo histórico real acumulado ($\sum_{l=0}^{\text{rank}-1} \lfloor \text{baseCost} \times 1.4^l \rfloor$) para habilidades descontinuadas, persistindo `state.migrationLedger` e estornando SP sem perda de progresso.

#### 2. Detalhamento Arquitetural & Componentes
- **`docs/L2_ESSENCE_CELESTIAL_DESTINY_SKILL_TREE.md`**: Catálogo mestre contendo as 46 linhagens, 142 classes em 4 estágios formais (Base Lv 1-19, 1ª Classe Lv 20-39, 2ª Classe Lv 40-75, 3ª Classe Lv 76+), com fórmulas de combate, custos, cooldowns e ícones oficiais.
- **`CanonicalSkillRegistryV2.js`**: Objeto imutável contendo todas as 825 habilidades com status de gaps auditados, cooldowns canônicos em milissegundos e tipos de efeito.
- **`CanonicalClassRegistryV2.js`**: Cadastro das 142 classes distribuídas em 19 Base, 32 First, 45 Second e 46 Third Classes com regras de herança cumulativa por DAG ancestral.
- **`SkillMigrationService.js`**: Motor determinístico de migração com sanitização de hotbars, auto-cast e cálculo estrito de refund de SP.
- **`echo-adapter.js` & `SkillEligibility.js`**: Integração de runtime conectando V2 à engine, garantindo isolamento estrito de classes irmãs (*sibling branch rejection*) e preservando o requisito de Lv 1 para habilidades gerais de guerreiro e mago.
- **Skill Window & Base Class V2 Activation**: Eliminação das habilidades sintéticas legadas compartilhadas (`hydro_strike`, `heal_light`) na UI do Human Mage (Lv 1), ativando o catálogo autêntico de 8 habilidades (6 ativas: `wind_strike`, `flame_strike`, `ice_bolt`, `self_heal`, `sleep`, `mages_will`; 2 passivas: `robe_mastery`, `mp_increase`) com suporte completo a ícones `.webp` em `SkillIconRegistry.js` e starterSkill canônico (`power_strike`) para Fighter em `starterKits.ts`.
- **`StatsEngine.js`**: Incorporação de todas as passivas V2 canônicas de domínio de armas (dual, blunt, polearm, bow, dagger, fist), armaduras (heavy, light, robe) e atributos (focus, critical power, anti-magic).
- **`test/skill-system-v2-migration.test.js`**: 9 testes formais cobrindo integridade do catálogo, idempotência da migração de saves, DAG de linhagens avançadas (*Grand Vanguard*, *Death Knight*, *ShineMaker*, *Archmage*) e autocast em combate.

---

<br/>

## Página 3 — 15 de Setembro de 2026 às 00:05
### 🛡️ Extração Massiva L2Bandit.camp & PMfun, Sistema Oficial de Ícones WebP & Deploy Vercel

> **Data & Hora**: 15/09/2026 às 00:05 (BRT)  
> **Commits desta Sessão**:
> - `e0fefa1` — `feat: integrate authentic Lineage 2 WebP icons, complete L2Bandit database, and class crests`
> - `9f4d633` — `docs: add DIARIO_DE_DESENVOLVIMENTO_2026-09-15 with icon integration and scraping details`
>
> **Status de Qualidade**: 
> - **Build de Produção**: Vite 7.3.6 compilado com sucesso em **10.15s** (Zero erros, 264 módulos).
> - **Integridade de Ativos**: **1.991 ícones WebP** sincronizados em `public/icons/` (100% íntegros, zero 404s).
> - **Deploy de Produção**: Disparado via GitHub Integration na Vercel a partir da branch `main`.

#### 1. Resumo Executivo da Sessão
O ecossistema do **Aden Arena** deu um salto qualitativo gigantesco na fidelidade visual e no enriquecimento da sua base de dados, substituindo emojis e caminhos órfãos por ativos oficiais de Lineage 2:
1. **Webscraping Massivo e Estruturado**: Extração de 69 sets de armadura e bônus +6 do **PMfun** e **9.352 registros** do **L2Bandit.camp** (armas, armaduras, joias, receitas, habilidades, monstros, chefes de raide e NPCs).
2. **Download & Indexação de 1.991 Ícones WebP**: Download concorrente de 1.991 ícones em alta resolução e compilação de índices mestres com mais de **20.000 chaves de mapeamento**.
3. **Serviço Centralizado de Ícones & Modernização Visual**: Implementação do `IconService.ts` e atualização das telas de Criação de Personagens (`CharacterCreation.tsx`), Login (`LoginScreen.tsx`) e Seleção de Campeões da Arena 3D (`ArenaApp.tsx`).

#### 2. Detalhamento das Mudanças Implementadas

##### A. Webscraping Completo de PMfun (Armor Sets & +6 Enchantment Bonuses)
- **69 Sets de Armadura**: Mapeados todos os conjuntos clássicos (No Grade a S Grade) para armaduras pesadas, leves e robes.
- **Bônus +6**: Mapeados os bônus ocultos de encantamento conjunto +6 (regeneração de MP, P.Def, HP, Evasion).
- **175 Ícones PNG**: Baixados e padronizados em `scraped_data/images/`.
- **Artefatos**: `scraped_data/armor_sets.json`, `scraped_data/plus6_bonuses.json`, `scraped_data/armor_sets.csv` e catálogo `scraped_data/index.html`.

##### B. Webscraping Estruturado de L2Bandit.camp (9.352 Entidades)
- **Multicraft**: 724 receitas de Craft book, 49 armor sets, 14 jewelry sets.
- **Weapons (448 armas em 11 tipos)**: Daggers (34), One-handed swords (45), Two-handed swords (21), Bows (28), One-handed blunts (37), Two-handed blunts (11), Spears (28), Fists (25), One-handed magic (63), Two-handed magic (34), Dual swords (122).
- **Armors (395 armaduras em 8 tipos)**: Heavy (54), Light (60), Magic (62), Gloves (65), Boots (70), Helmets (46), Shields (33), Sigils (5).
- **Accessories (79 joias)**: Necklaces (27), Earrings (25), Rings (27).
- **Dados de Mundo & Classes**: 18 Shots, 64 Resources, 9 Árvores de Classes (89 classes clássicas), **2.533 Skills**, 17 Territórios/Locations.
- **NPCs & Monstros**: 229 Chefes de Raide e Épicos, 2.889 Monstros, 1.882 Cidadãos e 2 Mammons.
- **Artefatos**: `scraped_data_bandit/l2bandit_all.json` (11.29 MB), 4 planilhas CSV e catálogo `scraped_data_bandit/index.html`.

##### C. Public Assets & Índices Mestres
- **`public/icons/`**: 1.991 ícones WebP servidos diretamente na rota `/icons/<nome>.webp`.
- **`public/icons/icon_map.json`**: **20.433 chaves mapeadas** cobrindo classes, skills, armas, armaduras e materiais com variações de nomes, IDs e slugs.
- **`public/img/icons/icon_index.json`**: Expandido para **21.387 chaves**, garantindo que o motor do Idle Game resolva itens diretamente para WebP sem erros 404.

##### D. Serviço Centralizado (`IconService.ts`)
- `CLASS_ICONS`: Mapeamento das 89 classes clássicas de Lineage 2 e variantes da Arena.
- `POPULAR_SKILL_ICONS` & `SHOT_ICONS`: Mapeamento de skills e consumíveis (Soulshots e Spiritshots NG a S).
- Helpers resilientes com fallbacks: `getClassIcon()`, `getSkillIcon()`, `getWeaponIcon()`, `getItemIcon()`, `loadIconMap()`.

##### E. Modernização Visual de Interfaces (UI)
- **`CharacterCreation.tsx`**: Botões de escolha de classe com brasões autênticos de Lineage 2 em moldura dourada e preview lateral direito com o brasão alinhado ao nome do herói.
- **`LoginScreen.tsx`**: Card de identificação do herói com o brasão oficial da classe ao lado do nível.
- **`ArenaApp.tsx`**: Seleção de campeões com brasões de 32x32px, badges de habilidades com ícones WebP reais e caixa "Your Champion" com brasão de 48x48px.

##### F. Validação e Deploy
- **Build**: `npm run build` aprovado em 10.15s (zero erros, 264 módulos).
- **Git & Vercel**: Commits enviados para `origin/main` e deploy automático acionado em produção.

#### 3. Tabela de Ativos da Sessão
| Categoria | Registros Extraídos | Ícones Locais Baixados |
| :--- | :---: | :---: |
| **PMfun Sets & Bônus +6** | **69 Sets** | 175 PNGs |
| **Multicraft (Craft, Sets)** | **787 Registros** | *(Inclusos no pool)* |
| **Armas (11 subtipos)** | **448 Armas** | 393 WebPs |
| **Armaduras & Escudos (8 subtipos)** | **395 Armaduras** | 399 WebPs |
| **Joias & Acessórios (3 subtipos)** | **79 Joias** | 82 WebPs |
| **Shots, Recursos & Consumíveis** | **82 Itens** | 163 WebPs |
| **Classes (Árvores Completas)** | **89 Classes** | 89 WebPs |
| **Habilidades (Skills)** | **2.533 Skills** | 821 WebPs |
| **Monstros, Chefes & NPCs** | **5.004 Entidades** | - |
| **TOTAL CONSOLIDADO** | **9.596 Entidades** | **2.166 Ícones Locais** |

---

<br/>

## Página 2 — 14 de Setembro de 2026 às 23:45
### 🛡️ Arquitetura Zero-Trust, Blindagem de Segurança, Life Activities 2.0 & Otimização de Performance

> **Data & Hora**: 14/09/2026 às 23:45 (BRT)  
> **Commits Realizados**: `9f21f51`, `85df916`, `8cad957`, `dbd757d`, `e74e80a`, `0663409`, `ef9970d`, `c720b68`, `2a0c1db`, `42118a2`, `7975d9b`, `46f0a91`, `a01d4b5`, `cdf3785`, `97a7305`, `f5f69b5`, `60082e3`, `ccc8b87`, `5e5bc86`  
> **Status de Qualidade**: 
> - **Testes Automatizados**: **63 testes** em 10 suítes canônicas passando (**100% de aprovação**) em ~430ms.
> - **Build de Produção**: Vite compilado em 12.45s.
> - **Integração Contínua**: Pipeline ativo em `.github/workflows/ci.yml`.

#### 1. Resumo Executivo da Sessão
1. **Transição para Arquitetura Zero-Trust Client Authority**: Eliminação definitiva da confiança no cliente do navegador para decisões administrativas, financeiras ou competitivas.
2. **Conclusão das Life Activities 2.0 & Economia Fechada**: Minigames táticos de 5 etapas (Pesca, Coleta, Caça, Mineração) e fechamento do ciclo de materiais órfãos na Forja e Refinaria.
3. **Otimização Extrema de Bundle**: Desacoplamento da Arena 3D (Three.js) e Pixel 2D via lazy loading dinâmico e divisão modular de chunks, reduzindo o bundle inicial de 4,32 MB para 2,38 MB (~45% menor).

#### 2. Detalhamento das Mudanças Implementadas
- **Blindagem Administrativa (P0)**:
  - Eliminação de backdoors em `lineage-idle/main.js` onde comandos de console elevavam privilégio localmente.
  - Gating estrito via `import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEV_ADMIN === 'true'`.
  - Autoridade criptográfica via Firebase Auth Custom Claims (`admin: true`) em `src/idle/IdleGame.tsx`.
- **Blindagem e Idempotência no Webhook Cakto (P0)**:
  - Em `api/cakto-webhook.ts`, requisições sem segredo válido são rejeitadas com HTTP 401.
  - Ledger de Idempotência por `transaction_id`, eliminando duplicações de créditos de Aden Coins.
  - Sanitização de PII nos logs da Vercel/Node.js.
- **Hardening das Regras do Firestore (P0)**:
  - Em `firestore.rules`, bloqueio total de escritas por usuários anônimos em coleções competitivas (`pvp_rankings`, `market_listings`, `clans`, `server_meta`).
- **Integridade Competitiva & Anti-Cheat (P1)**:
  - `computeAuthoritativeRankingCP`: Recálculo do Combat Power no servidor/Firestore antes da escrita no ranking.
  - Integridade temporal de expedições em `ExpeditionService.js` com validação de relógio e bloqueio atômico de *double-claim*.
- **Otimização de Bundle & Performance (P2)**:
  - `src/ArenaApp.tsx` extraído para lazy loading sob demanda.
  - Configuração de `manualChunks` no `vite.config.ts` isolando `vendor-three` (497 kB), `game-data-classes` (691 kB) e `game-data-items` (437 kB).
- **Life Activities 2.0 & Economia Fechada**:
  - `FishingService.js` (6 zonas, 20 espécies, varas D a A, modo AFK com teto de 8h).
  - `GatheringService.js` (pureza botânica, perigos biológicos e desgaste de foice).
  - `HuntingService.js` (rastreamento, alert gauge, vento e field butchering).
  - `MiningService.js` (estabilidade de galeria, riscos de gás e desgaste de picareta).
  - `RefineryService.js` + `recipes_drops.js`: Inclusão de 100% dos materiais órfãos em receitas canônicas.
- **Otimização de Armazenamento**:
  - Reivindicados ~2.75 GB de espaço movendo pastas legadas/duplicadas para `AdenOlderFiles`.
  - Gerado backup remoto integral do GitHub em `AdenOlderFiles/github_remote_origin_backup_2026-09-14.bundle`.

---

<br/>

## Página 1 — 12 de Setembro de 2026 às 22:30
### ⚔️ Consolidação de Arquitetura, UX do Personagem & Mochila, Encantamento Canônico e Ressonância

> **Data & Hora**: 12/09/2026 às 22:30 (BRT)  
> **Commits Realizados**: `4d9f6af`, `7031776`, `c472ce8`  
> **Status de Qualidade**: 
> - **Testes Automatizados**: **65 testes** em 9 suítes canônicas passando (100% de aprovação).
> - **Build de Produção**: Vite compilado com sucesso (232 módulos).

#### 1. Resumo Executivo da Sessão
Transformação do sistema de **Personagem e Mochila** do Lineage Idle em um motor de progressão contínua guiada, eliminando bloqueios históricos de usabilidade, descompassos de estado e consumo silencioso de itens.

#### 2. Detalhamento das Mudanças Implementadas
- **Motor Canônico de Encantamento (`EnchantmentService.js`)**:
  - Máquina de 8 estados canônicos (`IDLE` $\to$ `SELECTING_ITEM` $\to$ `READY` $\to$ `CONFIRMING` $\to$ `PROCESSING` $\to$ `SUCCESS`/`FAILURE`/`CRYSTALLIZED`/`PROTECTED`).
  - Clicar em `Usar` no scroll intercepta o consumo e abre o modal `#enchant-flow-modal` com alvos válidos pré-selecionados.
  - Cálculo determinístico de chances (+0 $\to$ +1 com 100% até Safe Limit), deltas de stats e ganho real de CP.
  - Proteção Blessed (preserva nível) e cristalização pós-limite seguro para pergaminhos normais.
- **Auto-Equip Inteligente & ERS (`EquipmentService.js` + `ItemClassificationService.js`)**:
  - Algoritmo ERS multicritério com pontuação de recomendação considerando classe, tipo de armadura/arma e sinergia de sets.
  - Materiais, pergaminhos e poções recebem pontuação $-999.999$, impedindo que sejam equipados.
  - Limpeza automática de slots `shield` e `weapon2` ao equipar arcos ou armas 2H.
- **Ressonância de Armas & Procs Táticos (`WeaponResonanceService.js`)**:
  - Taxonomia de 27 pares de arma primária + secundária/escudo.
  - Congelamento da fórmula de Cleave do Comandante de Falange:
    $$\text{CleaveDamage} = \lfloor \text{BaseSpearDamage} \times 1.45 \rfloor$$
  - Baseline de Defesa Física da Ressonância:
    $$\frac{\text{PDef}_{\text{com\_ressonancia}}}{\text{PDef}_{\text{sem\_ressonancia}}} = 1.20$$
- **NextActionAdvisor (Inteligência de Próximo Passo)**:
  - Motor de recomendação contextual com 5 níveis de prioridade (Auto-Equip, Upgrade, Encantamento, Forja Imperial, Power Milestone).
- **Hotfixes Críticos de Runtime**:
  - Resolução de `ReferenceError: AFFIX_MAP is not defined`.
  - Correção de interpolação de template string escapada (`\${` $\to$ `${`).
  - Resolução de `ReferenceError: closeInventoryPreviewModal is not defined`.
  - Correção da dessincronização de `window.state` com `getState()` do `StateManager.js` que causava `0 tipos na mochila`.

---

<br/>

## Página 5 — 16 de Setembro de 2026 às 00:30
### 🌐 Webscraping Canônico L2Wiki Essence, 147 Classes, 2.947 Habilidades & Fix de Ícones

> **Data & Hora**: 16/09/2026 às 00:30 (BRT)  
> **Status de Qualidade**: 
> - **Testes Automatizados**: **527 testes** em 76 suítes canônicas passando (100% de aprovação).
> - **Build de Produção**: Vite compilado com sucesso em 11.22s.
> - **Banco de Ícones**: 3.120 ícones locais (PNG e WebP de alta performance).

#### 1. Resumo Executivo da Sessão
Execução de webscraping exaustivo do portal oficial L2Wiki Essence (`https://l2wiki.com/essence/skills/`), cobrindo 100% das classes e linhagens de todas as 8 raças (Human, Elf, Dark Elf, Orc, Dwarf, Kamael, Sylph, High Elf). Saneamento de ícones impróprios (como martelo de ferreiro em `sleep`), download de 564 ícones autênticos convertidos para WebP, e aplicação do protocolo de isolamento de linhagem V2 com reembolso integral de SP (100%) para skills legadas/estrangeiras.

#### 2. Detalhamento das Mudanças Implementadas
- **Webscraping Completo L2Wiki Essence**:
  - Contorno de barreira de cookies da L2Wiki (`Cookie: CCA=Y; PHPSESSID=...`).
  - Coleta e estruturação de **147 classes** em `scraped_data_wiki/classes_summary.json` e **2.947 habilidades detalhadas** em `scraped_data_wiki/skills_detailed.json` (com níveis mínimos, custos de MP/SP, recargas, tempos de conjuração, alcances, descrições autênticas e ícones oficiais).
- **Download e Conversão em Lote de Ícones (`public/icons/`)**:
  - Script automatizado com `sharp` baixou 564 ícones faltantes diretamente dos servidores da L2Wiki.
  - Conversão de 100% dos ativos para `.webp` (além de `.png`), totalizando 3.120 arquivos de ícones disponíveis no frontend sem requisições externas nem erros 404.
- **Correção Canônica de Ícones (`CanonicalSkillRegistryV2.js`)**:
  - Correção imediata do ícone da habilidade `sleep` de `/icons/skill3080.webp` para `/icons/skill1069.webp`.
  - Substituição de todas as 9 outras ocorrências de `skill3080.webp` (`focus`, `might`, `shield`, `empower`, `heal`, `recharge`, `blessed_body`, `blessed_soul`, `guidance`) por seus respectivos ícones oficiais de jogador.
- **Blindagem de Linhagem & Purga com Reembolso de SP (`SkillEligibility.js`)**:
  - Implementação de `isSkillInV2Lineage(classId, skillId)`: validação estrita baseada no DAG de classes de `CANONICAL_CLASS_REGISTRY_V2`.
  - Em `normalizeAndValidateSkills`: habilidades legadas ou fora da árvore da classe (ex.: `hydro_strike`, `heal_light` em magos V2) são suprimidas e expurgadas, com reembolso de 100% do SP investido para `state.sp`.
- **Integridade da Suíte de Testes**:
  - Todos os 527 testes unitários e de integração aprovados com 0 regressões.

