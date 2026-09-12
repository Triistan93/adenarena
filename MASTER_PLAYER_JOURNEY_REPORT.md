# 🎯 MASTER PLAYER JOURNEY REPORT — Aden Arena
## Relatório Executivo: Auditoria Completa da Jornada do Jogador Lv 1 → Lv 120

**Versão Auditada:** Season 1 (Cap ativo: Lv 40 | Cap no código: Lv 120)
**Data da Auditoria:** Setembro 2026
**Metodologia:** Análise forense estática de código + geração de dataset (120 níveis) + revisão sistêmica
**Escopo:** Jornada completa do jogador, todos os sistemas, economia, content gaps, referências quebradas

---

> ⚠️ CAUTION: Este relatório contém achados críticos (P0) que afetam a experiência do jogador desde o Lv 1. **NÃO implementar correções sem aprovação da equipe.** Este é um documento de auditoria — diagnóstico apenas.

---

## 📊 Dashboard Executivo

| Métrica | Valor |
|---|---|
| Total de Níveis Auditados | 120 |
| Níveis com Problemas Detectados | 67 / 120 (56%) |
| Níveis 🟢 COERENTES | 53 (44%) |
| Níveis 🟡 QUESTIONÁVEIS | 18 (15%) |
| Níveis 🟠 PROBLEMÁTICOS | 18 (15%) |
| Níveis 🔴 SEM NEXO | 31 (26%) |
| Referências de Item Quebradas | 143 IDs inválidos |
| Sistemas Analisados | 28 sistemas |
| Sistemas com P0 | 6 sistemas |
| Sistemas com P1 | 11 sistemas |
| Breakpoints de Progressão Críticos | 14 breakpoints |
| Conteúdo Morto (Dead Content) | Lv 96–120 (25 níveis sem zonas) |

---

## 🔴 TOP 20 PROBLEMAS CLASSIFICADOS POR IMPACTO

### P0 — CRÍTICOS (Quebram a Experiência)

---

#### #1 — OVER-CP AO NASCER (Lv 1)
**Severidade:** P0 | **Tipo:** CONTRADIÇÃO
**Sistema:** StateManager / CP System
**Impacto:** Jogador nasce com 1.750 CP quando deveria ter ~280 CP

**Evidência:**
- `DEFAULT_STATE()` inicializa `fortresses.equippedTalismans: ['talisman_power']` (item de Fortaleza Lv 70+)
- `DEFAULT_STATE()` inicializa `fortresses.equippedBracelet: 'bracelet_steel'`
- `DEFAULT_STATE()` inicializa `clan.level: 1` (contribui para CP via CP_WEIGHTS)
- `ZONE_CP_REQUIREMENTS`: talkingIsland.minCp = 200, elvenForest = 500, darkForest = 800
- Resultado: Jogador trivializa as **3 primeiras zonas** sem precisar de nenhum equipamento

**Causa Raiz:** `StateManager.js` — `DEFAULT_STATE()` pré-equipa itens que deveriam ser conquistados.

**Impacto no Jogador:** Loop de progressão de gear completamente desincentivado nas primeiras horas.

---

#### #2 — QUESTS PREMATURAS / BAÚ DIÁRIO BLOQUEADO (Lv 5–39)
**Severidade:** P0 | **Tipo:** PREMATURO + CONTRADIÇÃO
**Sistema:** Quest System / Tab Unlocks
**Impacto:** Jogador vê 5 quests diárias mas só pode completar 3 até o Lv 40

**Evidência:**
- Quests Tab abre no Lv 5
- `d_craft` (type: 'craft') requer Forja → Forge Tab abre no Lv 10 → 5 níveis bloqueado
- `d_tower` (type: 'tower') requer Torre → Tower Tab abre no Lv 40 → **35 níveis** bloqueado!
- `DAILY_COMPLETION_BONUS` exige TODOS os 5 diários incluindo tower → Baú inacessível até Lv 40

---

#### #3 — REFERÊNCIAS DE ITEM QUEBRADAS (143 IDs inválidos)
**Severidade:** P0 | **Tipo:** DEAD CONTENT + CONTRADIÇÃO
**Sistema:** Item System / Shop / Raids / StarterJourney

| Localização | IDs Quebrados | Qtd |
|---|---|---|
| Olympiad Shop | giants_codex, blessed_scroll_weapon_s, blessed_scroll_armor_s | 3 |
| Mammon Merchant | scroll_enchant_weapon_a, scroll_enchant_weapon_s, giants_codex_mastery, life_stone_top_76, ancient_dye_str_con, ancient_dye_int_men | 6 |
| Todos 8 Raid Drops | adena_coins | 8 |
| StarterJourney Step 2 | scrl_enchant_wp_d | 1 |
| StarterJourney Step 3 | ls_mid_76 | 1 |
| Barakiel Drops | staff_goddess_rain_song, staff_of_gods | 2 |
| Crafting Recipes | weapon_orfen_dagger, jewel_baium_ring | 2 |
| SHOP_INVENTORY Bug | Strings iteradas char-a-char gerando 127 IDs de 1 char | 127 |

**Bug Estrutural SHOP_INVENTORY:** Items armazenados como strings sendo iteradas como arrays, gerando phantom IDs: "p", "o", "t", "i", "o", "n", etc.

---

#### #4 — XP INVERTIDO NO LV 101 (Bug Matemático)
**Severidade:** P0 | **Tipo:** PROGRESSÃO INCOERENTE
**Sistema:** LevelEngine

- Lv 100 → 101: exige **33.200.000.000 XP**
- Lv 101 → 102: exige **15.800.000.000 XP** ← QUEDA DE 52%!
- Fórmula usa progressão linear `15000000000 + (lvl-100) * 800000000` (deveria ser exponencial)
- Arquivo: `LevelEngine.js`

---

#### #5 — DESERTO DE CONTEÚDO LV 96–120 (25 Níveis Vazios)
**Severidade:** P0 | **Tipo:** DEAD CONTENT
**Sistema:** Zones / Monsters / Bosses

- Última zona: `forgeOfGods` — Level requerido: 95
- Lv 96–120: 25 níveis SEM zonas, SEM monstros, SEM bosses
- `getSeasonMaxLevel()` retorna 120 hardcoded mas conteúdo só existe até Lv 95

---

#### #6 — STARTER JOURNEY STEP 6 IMPOSSÍVEL
**Severidade:** P0 | **Tipo:** CONTRADIÇÃO
**Sistema:** StarterJourneyService / StateManager

- Step 6 verifica: `clan.name !== 'Os Guardiões de Aden'`
- DEFAULT_STATE: `clan.name = 'Os Guardiões de Aden'` ← É O VALOR PADRÃO!
- A condição nunca será verdadeira. Passo 6 é matematicamente impossível.

---

### P1 — MUITO IMPORTANTES (Prejudicam Fortemente a Progressão)

---

#### #7 — PENHASCOS DE XP (3 Cliffs Abruptos)
**Severidade:** P1 | **Tipo:** PROGRESSÃO INCOERENTE
**Sistema:** LevelEngine

| Transição | XP Antes | XP Depois | Multiplicador |
|---|---|---|---|
| Lv 20 → 21 | 131.050 | 1.020.000 | 7.8x 🔴 |
| Lv 40 → 41 | 5.600.000 | 29.700.000 | 5.3x 🔴 |
| Lv 85 → 86 | 4.360.000.000 | 19.060.000.000 | 4.4x 🔴 |

---

#### #8 — DESERTO DE SKILLS LV 41–75 (35 Níveis)
**Severidade:** P1 | **Tipo:** PROGRESSÃO INCOERENTE
**Sistema:** Skill System (echo-adapter)

- Skills Tier 2 no Lv 40, próximos skills apenas Lv 76 (Tier 3)
- 35 níveis consecutivos sem nenhuma nova habilidade de classe
- Arquivo: `echo-adapter.js` — mapeamento tier→reqLvl

---

#### #9 — RAIDS TAB VAZIA (Lv 20–29)
**Severidade:** P1 | **Tipo:** PREMATURO
- Raids Tab abre no Lv 20
- Primeira Raid (Queen Ant) disponível apenas Lv 30
- 10 níveis de aba completamente vazia

---

#### #10 — NECROPOLIS / CATACUMBAS: DEAD CONTENT XP
**Severidade:** P1 | **Tipo:** RECOMPENSA INADEQUADA + DEAD CONTENT

| Zona | Lv | Avg XP | Zona Comparada | Avg XP | Ratio |
|---|---|---|---|---|---|
| Necropolis of Sacrifice | 32 | 287 | Orcen Ruins (Lv 30) | 1.570 | 5.5x menos |
| Necropolis of Pilgrims | 42 | 673 | Black Citadel (Lv 40) | 4.760 | 7.0x menos |

---

#### #11 — CLAN PRÉ-INICIALIZADO NO ESTADO PADRÃO
**Severidade:** P1 | **Tipo:** CONTRADIÇÃO
- `DEFAULT_STATE()`: `clan.name: 'Os Guardiões de Aden'`, `clan.level: 1`
- Clan Tab unlock: Lv 20
- Causa Over-CP (contribui para #1) e bloqueia StarterJourney Step 6 (#6)

---

#### #12 — DOLLS TAB LV 1 COM CONTEÚDO SEASON 2
**Severidade:** P1 | **Tipo:** SEM PROPÓSITO
- Aba Dolls abre no Lv 1 com todo conteúdo relevante bloqueado atrás da Season 2 (não ativa)

---

#### #13 — SEASON CONFIG INCONSISTENTE (Lv 40 vs Lv 120)
**Severidade:** P1 | **Tipo:** CONTRADIÇÃO
- `SeasonConfig.js` Season 1 cap = 40
- `getSeasonMaxLevel()` retorna 120 hardcoded (ignora season config)

---

### P2 — IMPORTANTES (Inconsistências que Pioram a Experiência)

---

#### #14 — ANOMALIA XP ORC VILLAGE vs DWARVEN MINE
**Severidade:** P2 | **Tipo:** PROGRESSÃO INCOERENTE

| Zona | Lv | Avg HP | Avg XP | Ratio XP/HP |
|---|---|---|---|---|
| Orc Village | 7 | 792 | 129 | 0.162 |
| Dwarven Mine | 9 | 352 | 140 | 0.398 |

Dwarven Mine dá 2.46x mais XP por HP com monstros mais fracos.

---

#### #15 — GEAR GRADE NG COM REQUAL ATÉ LV 90
**Severidade:** P2 | **Tipo:** PROGRESSÃO INCOERENTE
- 1.086 itens com `grade: 'ng'` incluem itens com `reqLvl` até 90
- Grade S começa em Lv 80 mas existem NG items com reqLvl = 85+

---

#### #16 — TIER SYSTEM GAPS E INCONSISTÊNCIAS
**Severidade:** P2 | **Tipo:** PROGRESSÃO INCOERENTE
- C-Grade reqLvl = 40 (mesmo que B-Grade = 52) → gap de apenas 12 níveis
- Tier 4.5 existe (reqLvl = 61) — tier não-padrão entre B (52) e A (76)

---

#### #17 — INVENTÁRIO INICIAL VAZIO SEM KIT DE BOAS-VINDAS
**Severidade:** P2 | **Tipo:** SEM PROPÓSITO
- Jogador começa sem nenhum item na mochila
- Sem potions, sem weapon starter, sem contexto narrativo

---

#### #18 — OLYMPIAD SHOP COM ITENS INACESSÍVEIS
**Severidade:** P2 | **Tipo:** RECOMPENSA INADEQUADA
- Shop oferece itens que não existem em ALL_ITEMS (giants_codex, scrolls S-grade)
- Jogador não pode resgatar recompensas Olympiad

---

### P3 — POLISH (Experiência Geral)

---

#### #19 — MAGIC LAMP SEM TUTORIAL
**Severidade:** P3
- Aba Magic Lamp abre no Lv 20 sem tutorial ou explicação do sistema

---

#### #20 — MENSAGENS DE ABAS VAZIAS AUSENTES
**Severidade:** P3
- Raids vazia Lv 20-29: mostra lista vazia em vez de "Disponível no Lv 30"
- Dolls vazia Season 2: sem badge "Em Breve"

---

## 🗺️ FASE 0–6: ROADMAP DE CORREÇÕES

> ⚠️ **Atenção:** Este roadmap é PROPOSTA apenas. Nenhuma correção deve ser implementada sem aprovação explícita.

---

### 🚨 FASE 0 — Correções Emergenciais (Quebram o Jogo)
**Prioridade:** URGENTE | **Estimativa:** 1–2 dias de dev

| # | Problema | Arquivo | Ação |
|---|---|---|---|
| F0-01 | Over-CP Lv 1 | `StateManager.js` | Remover equippedTalismans, equippedBracelet e clan.level do DEFAULT_STATE |
| F0-02 | StarterJourney Step 6 impossível | `StarterJourneyService.js` | Corrigir condição de verificação de clan.name |
| F0-03 | XP invertido Lv 101 | `LevelEngine.js` | Aplicar fórmula exponencial para Lv 101+ |
| F0-04 | d_tower Quest prematuro (Lv 5) | `quests.js` | Mover d_tower unlock para Lv 40 |
| F0-05 | StarterJourney rewards inexistentes | `StarterJourneyService.js` | Substituir scrl_enchant_wp_d e ls_mid_76 por IDs válidos |
| F0-06 | adena_coins em raid drops | `raids.js` | Substituir por ID válido de moeda (ex: gold) |

---

### ⚠️ FASE 1 — Progressão Core (Afetam Retenção)
**Prioridade:** ALTA | **Estimativa:** 3–5 dias de dev

| # | Problema | Arquivo | Ação |
|---|---|---|---|
| F1-01 | Penhascos de XP (Lv 20, 40, 85) | `LevelEngine.js` | Suavizar curva com fator multiplicador progressivo |
| F1-02 | Deserto de Skills Lv 41–75 | `echo-adapter.js` | Adicionar tier 2.5 (aprox Lv 55–60) com skills intermediárias |
| F1-03 | Raids Tab vazia Lv 20–29 | `raids.js` ou `AppLayout.js` | Mover Raids unlock para Lv 30, ou adicionar raid Lv 20–29 |
| F1-04 | d_craft quest prematuro (Lv 5) | `quests.js` | Mover d_craft unlock para Lv 10 |
| F1-05 | Itens Olympiad Shop quebrados | `olympiad.js` | Substituir IDs por items existentes em ALL_ITEMS |
| F1-06 | Itens Mammon Merchant quebrados | `seven_signs.js` | Substituir IDs por items existentes em ALL_ITEMS |

---

### 🟡 FASE 2 — Conteúdo e Balance (Afetam Engajamento)
**Prioridade:** MÉDIA-ALTA | **Estimativa:** 1–2 semanas de dev

| # | Problema | Arquivo | Ação |
|---|---|---|---|
| F2-01 | Necropolis/Catacombas dead content | `zones.js` | Aumentar XP em 4–7x, ou adicionar recompensa exclusiva |
| F2-02 | Orc Village XP anomalia | `zones.js` | Rebalancear HP/XP dos monstros de Orc Village |
| F2-03 | SHOP_INVENTORY string bug | Shop code | Corrigir estrutura de dados (array → objeto) |
| F2-04 | Crafting recipes quebradas | `crafting.js` | Substituir weapon_orfen_dagger, jewel_baium_ring por IDs válidos |
| F2-05 | Starter Journey kit inicial | `StarterJourneyService.js` | Adicionar poções, weapon e armor starter ao Step 1 |

---

### 🟠 FASE 3 — Economia e Sistemas de Suporte
**Prioridade:** MÉDIA | **Estimativa:** 1 semana de dev

| # | Problema | Arquivo | Ação |
|---|---|---|---|
| F3-01 | Economia Gold por tier | `quests.js` | Escalar recompensas de gold com o gear tier esperado |
| F3-02 | Dolls Tab Lv 1 vazia | `AppLayout.js` | Mover Dolls unlock para Season 2 ativar, ou popular com Season 1 |
| F3-03 | SeasonConfig inconsistência | `SeasonConfig.js` | Fazer getSeasonMaxLevel() ler do Season ativo |
| F3-04 | Tier NG items Lv 90 | `items/*.js` | Auditar e corrigir grade dos 1.086 NG items com reqLvl > 20 |
| F3-05 | Clan default state | `StateManager.js` | Limpar clan.name e clan.level do DEFAULT_STATE |

---

### 🔵 FASE 4 — Conteúdo Lv 96–120 (Endgame Gap)
**Prioridade:** MÉDIA (Season 2+) | **Estimativa:** 2–4 semanas de design + dev

| # | Problema | Arquivo | Ação |
|---|---|---|---|
| F4-01 | Zero zonas Lv 96–120 | `zones.js` | Criar 3–5 zonas endgame (Heaven's Rift, Hellbound, etc.) |
| F4-02 | Zero raids Lv 96–120 | `raids.js` | Criar 2–3 raids endgame (Frintessa, Baium, Antharas) |
| F4-03 | Zero skills Tier 4+ | `echo-adapter.js` | Criar skills Tier 4 para Lv 90+ |
| F4-04 | Season cap vs. code cap | `SeasonConfig.js` | Implementar Season 2 (Lv 41–80) ou ajustar cap |

---

### 🟣 FASE 5 — UX / Tutorial / Polish
**Prioridade:** BAIXA-MÉDIA | **Estimativa:** 3–5 dias

| # | Problema | Ação |
|---|---|---|
| F5-01 | Magic Lamp sem tutorial | Adicionar tooltip/tutorial ao abrir Magic Lamp |
| F5-02 | Aba Raids vazia sem mensagem | Mostrar "Disponível no Lv 30" em vez de lista vazia |
| F5-03 | Aba Dolls com Season 2 content | Adicionar badge "Em Breve - Season 2" nos itens bloqueados |

---

### ⚪ FASE 6 — Polimento Geral
**Prioridade:** BAIXA | **Estimativa:** Ongoing

| # | Problema | Ação |
|---|---|---|
| F6-01 | Textos de tooltip desatualizados | Revisar todos os tooltips |
| F6-02 | Feedback visual durante skill desert | Adicionar feedback de SP acumulado entre skills |
| F6-03 | Histórico de drops de raid | Mostrar últimas recompensas obtidas |

---

## 📂 Documentos de Suporte

| Documento | Conteúdo |
|---|---|
| PLAYER_JOURNEY_AUDIT.md | Auditoria nível a nível (Lv 1 → 120) |
| SYSTEM_COHERENCE_AUDIT.md | Análise de todos os 28 sistemas |
| NEXUS_AND_DEAD_CONTENT_AUDIT.md | SEM NEXO, Dead Content, Referências Quebradas |
| PROGRESSION_BREAKPOINTS.md | 14 breakpoints mapeados com dados concretos |

---

## 🏆 Saúde do Jogo: Diagnóstico Final

### O Que Funciona Bem ✅
- **Arco Lv 1–19**: Progressão suave e bem distribuída (tirando Over-CP inicial)
- **Combat formula**: k/(def+k) é elegante e funciona bem para balancear defesa
- **Zone unlocks Lv 1–40**: Cadência razoável de zonas novas (exceto Orc Village anomalia)
- **Class transfers Lv 20/40/76**: Estrutura de transferência é sólida
- **StarterJourney**: Conceito de onboarding em 7 passos é excelente — precisa de correção de bugs, não redesign

### O Que Mais Precisa de Atenção 🔴
1. **Estado inicial** (DEFAULT_STATE) — causa 3 problemas P0 sozinho
2. **LevelEngine.js** — causa 4 breakpoints (3 cliffs + 1 XP inversion)
3. **143 IDs de itens inválidos** espalhados em sistemas críticos
4. **25 níveis de conteúdo morto** (Lv 96–120) sem nada para fazer

### Potencial do Projeto 🌟
Aden Arena tem uma base de sistema sólida e arquitetura bem planejada. A maioria dos problemas são **bugs de estado inicial**, **referências quebradas** e **gaps de conteúdo** — todos corrigíveis. Com as correções das FASES 0 e 1, o jogo pode ter uma experiência de progressão do Lv 1 ao Lv 40 muito satisfatória para o Season 1.

---

*Auditoria realizada por análise forense estática de código — sem alterações feitas no projeto.*
*Todos os achados baseados em dados verificáveis nos arquivos fonte.*
