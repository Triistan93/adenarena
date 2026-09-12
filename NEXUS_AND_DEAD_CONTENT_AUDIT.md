# 💀 AUDITORIA DE NEXO E CONTEÚDO MORTO — Aden Arena
## Análise Forense: SEM NEXO, Dead Content, Referências Quebradas e Contradições

**Data da Auditoria:** Setembro 2026
**Metodologia:** Script de auditoria automática + revisão manual de todos os sistemas

---

## Introdução
Esta auditoria cataloga especificamente os elementos do jogo que se enquadram nas categorias:
- **SEM NEXO**: Conteúdo presente no código mas sem propósito funcional ou narrativo
- **DEAD CONTENT**: Conteúdo que existe mas é impossível ou extremamente desvantajoso acessar
- **REFERÊNCIAS QUEBRADAS**: IDs de itens/sistemas que não existem no conjunto de dados
- **CONTRADIÇÕES**: Sistemas que se contradizem mutuamente

**Total de Issues Catalogados:** 47 issues distintos (além dos 143 broken item IDs)

---

## 1. REFERÊNCIAS QUEBRADAS (143 IDs Inválidos)

Esta seção cataloga todos os IDs de itens referenciados em sistemas do jogo mas ausentes em `ALL_ITEMS`.

---

### 1.1 Olympiad Shop — Itens Inexistentes
**Arquivo:** `lineage-idle/src/data/olympiad.js`
**Impacto:** P1 — Jogador ganha Olympiad Tokens mas não pode resgatar parte das recompensas

| ID do Item | Sistema | Status |
|---|---|---|
| `giants_codex` | Olympiad Shop | ❌ Não existe em ALL_ITEMS |
| `blessed_scroll_weapon_s` | Olympiad Shop | ❌ Não existe em ALL_ITEMS |
| `blessed_scroll_armor_s` | Olympiad Shop | ❌ Não existe em ALL_ITEMS |

**Análise:** Estes 3 itens são recompensas premium de Olimpíada. A ausência significa que jogadores que acumulam Olympiad Tokens para resgatar estes itens encontrarão erro ou ausência silenciosa.

---

### 1.2 Mammon Merchant Catalog — Itens Inexistentes
**Arquivo:** `lineage-idle/src/data/seven_signs.js`
**Impacto:** P1 — Loja especial do Seven Signs tem 6 itens inexistentes

| ID do Item | Sistema | Status |
|---|---|---|
| `scroll_enchant_weapon_a` | Mammon Merchant | ❌ Não existe em ALL_ITEMS |
| `scroll_enchant_weapon_s` | Mammon Merchant | ❌ Não existe em ALL_ITEMS |
| `giants_codex_mastery` | Mammon Merchant | ❌ Não existe em ALL_ITEMS |
| `life_stone_top_76` | Mammon Merchant | ❌ Não existe em ALL_ITEMS |
| `ancient_dye_str_con` | Mammon Merchant | ❌ Não existe em ALL_ITEMS |
| `ancient_dye_int_men` | Mammon Merchant | ❌ Não existe em ALL_ITEMS |

**Análise:** O Mammon Merchant é uma loja prestígio do Seven Signs. 6 dos seus itens mais valiosos são inexistentes — a loja mais exclusiva do jogo está parcialmente vazia.

---

### 1.3 Raid Boss Drop Tables — adena_coins Universal
**Arquivo:** `lineage-idle/src/data/raids.js`
**Impacto:** P0 — Todos os 8 raids têm drops quebrados

| Raid Boss | ID Quebrado | Nível |
|---|---|---|
| Queen Ant | `adena_coins` | Lv 30 |
| Orfen | `adena_coins` | Lv 45 |
| Core | `adena_coins` | Lv 50 |
| Zaken | `adena_coins` | Lv 60 |
| Baium | `adena_coins` | Lv 75 |
| Antharas | `adena_coins` | Lv 80 |
| Valakas | `adena_coins` | Lv 85 |
| Barakiel | `adena_coins`, `staff_goddess_rain_song`, `staff_of_gods` | Lv 90+ |

**Análise Crítica:** `adena_coins` não existe em `ALL_ITEMS`. O ID correto provavelmente deveria ser `adena` ou `gold`. Esta referência quebrada afeta **TODOS OS 8 RAID BOSSES DO JOGO**. Barakiel tem 3 referências quebradas (a mais grave).

---

### 1.4 Starter Journey — Recompensas Inválidas
**Arquivo:** `lineage-idle/src/services/StarterJourneyService.js`
**Impacto:** P0 — Onboarding dá recompensas de itens inexistentes nos passos 2 e 3

| Passo | ID Quebrado | Descrição Esperada |
|---|---|---|
| Step 2 | `scrl_enchant_wp_d` | Scroll de Encantamento de Arma D-Grade |
| Step 3 | `ls_mid_76` | Life Stone Mid 76 |

**Análise:** O onboarding — a primeira experiência do jogador — entrega recompensas que não existem. O jogador completa os primeiros passos e não recebe nada (ou recebe erro silencioso).

---

### 1.5 Crafting Recipes — Itens de Output Inexistentes
**Arquivo:** craft recipes data
**Impacto:** P1 — Receitas de crafting produzem itens inexistentes

| Receita | Item Output | Status |
|---|---|---|
| Orfen Dagger Recipe | `weapon_orfen_dagger` | ❌ Não existe em ALL_ITEMS |
| Baium Ring Recipe | `jewel_baium_ring` | ❌ Não existe em ALL_ITEMS |

---

### 1.6 Bug Estrutural: SHOP_INVENTORY — String Iteration
**Arquivo:** Shop system code
**Impacto:** P0 — 127 phantom IDs de 1 caractere gerados automaticamente

**Descrição Técnica:**
```
// Como está (BUGADO):
SHOP_INVENTORY = ["potion_hp", "potion_mp", ...]
// Ao iterar como array de caracteres:
→ "p", "o", "t", "i", "o", "n", "_", "h", "p" → 9 phantom IDs por item!

// Como deveria ser:
SHOP_INVENTORY = [{id: "potion_hp", ...}, ...]
```

**Resultado:** O script de auditoria encontrou 127 IDs de 1 único caractere ("a", "d", "e", "i", "l", "m", "n", "o", "p", "r", "s", "t", etc.) sendo tratados como IDs de item válidos, inflaçando o contador de itens quebrados.

**Nota:** O total de 143 "broken IDs" inclui estes 127 phantom IDs. Os IDs genuinamente quebrados (de sistemas reais) são 16.

---

## 2. CONTEÚDO MORTO (Dead Content)

### 2.1 Necrópoles e Catacumbas — XP Inviável
**Arquivo:** `lineage-idle/src/data/zones.js`
**Impacto:** P1 — Zonas alternativas são completamente ignoradas

**Dados comparativos:**

| Zona | Nível | Avg XP/kill | Zona de referência | Avg XP Ref | Ratio |
|---|---|---|---|---|---|
| Necropolis of Sacrifice | 32 | **287** | Orcen Ruins (Lv30) | 1.570 | **5.5x menos** |
| Necropolis of Pilgrims | 42 | **673** | Black Citadel (Lv40) | 4.760 | **7.0x menos** |
| Catacomb of Dark Omens | varies | muito baixo | zona equivalente | muito alto | ~5-6x menos |

**Análise:** As Necrópoles foram desenhadas como alternativas para variedade, mas com XP 5–7x inferior às zonas principais de mesmo nível, nenhum jogador racional as escolhe. São zonas completas (modelos, monstros, bosses) com conteúdo funcionalmente morto.

**Possíveis soluções (NÃO implementar):**
- Aumentar XP das necrópoles em 4–7x para paridade
- Adicionar drops exclusivos de necrópole (ex: itens de necromancia, moeda especial)
- Criar mecânica especial (buffs de "energia sombria") para compensar XP menor

---

### 2.2 Zonas Lv 96–120 — Inexistentes
**Arquivo:** `lineage-idle/src/data/zones.js`
**Impacto:** P0 — 25 níveis de total vazio

**Análise:**
- Última zona: `forgeOfGods` — `reqLvl: 95`
- `ZONES` array tem 31 entradas, nenhuma com `reqLvl > 95`
- `getSeasonMaxLevel()` em `SeasonConfig.js` retorna **120** hardcoded
- Resultado: 25 níveis (96–120) sem NENHUMA zona, monstro, ou boss

**Timeline do Content Wall:**
```
Lv 90 → Barakiel Raid disponível
Lv 95 → Forge of Gods (ÚLTIMA ZONA)
Lv 96 → ☠️ VOID — Nada
Lv 97 → ☠️ VOID — Nada
...
Lv 120 → ☠️ VOID — Nada
```

---

### 2.3 Aba Dolls — Conteúdo Season 2 Bloqueado
**Arquivo:** dolls system
**Impacto:** P1 — Tab visível desde Lv 1, conteúdo indisponível

**Conteúdo identificado como Season 2:**
- Boss Dolls (drops de raids específicas de Season 2)
- Clan Dolls (requerem nível de clan alto)
- Siege Dolls (siege de castelo = Season 2 feature)

**Análise:** O jogador vê a aba desde o Lv 1, entra, vê itens bloqueados sem explicação de quando estarão disponíveis. Gera confusão e frustração desnecessária.

---

## 3. CONTEÚDO PREMATURO

### 3.1 Quests Diárias no Lv 5 (d_craft, d_tower)
**Arquivo:** `lineage-idle/src/data/quests.js` + `lineage-idle/src/ui/AppLayout.js`

| Quest | Unlock | Depende de | Unlock Real | Gap |
|---|---|---|---|---|
| d_craft | Lv 5 | Forge Tab | Lv 10 | **5 níveis** |
| d_tower | Lv 5 | Tower Tab | Lv 40 | **35 níveis** |

**Impacto do DAILY_COMPLETION_BONUS:**
- Baú especial = completar TODOS os 5 diários
- d_tower necessário para o baú
- Baú inacessível dos Lv 5 ao Lv 39 (35 níveis!)
- Jogador vê a recompensa mas não pode pegá-la por mais de 80% do Season 1

---

### 3.2 Raids Tab Lv 20 — Queen Ant Só no Lv 30
**Arquivo:** `lineage-idle/src/ui/AppLayout.js` + `lineage-idle/src/data/raids.js`

- Raids Tab: abre **Lv 20**
- Queen Ant (`reqLvl: 30`): disponível **Lv 30**
- 10 níveis de aba completamente vazia sem mensagem explicativa

---

### 3.3 Clan Tab Lv 20 — Clan Já Ativo desde Lv 1
**Arquivo:** `lineage-idle/src/core/StateManager.js`

- Clan Tab: abre **Lv 20**
- `DEFAULT_STATE()`: `clan.name: 'Os Guardiões de Aden'`, `clan.level: 1` — desde o **Lv 1**
- Incoerência narrativa: o sistema diz que clan abre no Lv 20, mas o estado já tem um clan ativo

---

## 4. PROGRESSÃO INCOERENTE

### 4.1 XP Invertido Lv 101 (Bug Matemático)
**Arquivo:** `lineage-idle/src/engine/LevelEngine.js`

**Dados:**
```
Lv 99  → 100: XP necessário = 32.400.000.000
Lv 100 → 101: XP necessário = 33.200.000.000  (aumento de 2.5% ✓)
Lv 101 → 102: XP necessário = 15.800.000.000  (QUEDA DE 52% ← BUG!)
Lv 102 → 103: XP necessário = 16.600.000.000  (volta a aumentar)
```

**Causa:** Mudança de fórmula no Lv 101:
- Lv 1–100: fórmulas escalonadas (quadrática → cúbica → quártica)
- Lv 101+: `15000000000 + (lvl-100) * 800000000` → começa em 15.8B (abaixo do Lv 100!)

**Impacto:** O "endgame máximo" é matematicamente mais fácil de progredir por nível que o mid-late game. A dificuldade **regride** ao invés de avançar.

---

### 4.2 Penhascos de XP (3 Cliffs Abruptos)

| Transição | XP Antes | XP Depois | Fator | Severidade |
|---|---|---|---|---|
| Lv 20 → 21 | 131.050 | 1.020.000 | **7.8x** | P1 |
| Lv 40 → 41 | 5.600.000 | 29.700.000 | **5.3x** | P1 |
| Lv 85 → 86 | 4.360.000.000 | 19.060.000.000 | **4.4x** | P1 |

**Padrão:** Os cliffs de Lv 20 e 40 coincidem com transferências de classe, o que dá algum contexto — mas o salto de 7.8x e 5.3x é desproporcional. Lv 85 não tem nenhuma justificativa.

---

### 4.3 Deserto de Skills (Lv 41–75 sem Skills)
**Arquivo:** `lineage-idle/data/echo-adapter.js`

**Mapeamento tier→reqLvl atual:**
```javascript
tier0: reqLvl = 1
tier1: reqLvl = 20
tier2: reqLvl = 40
tier3: reqLvl = 76  ← 36 níveis de gap!
```

**35 níveis consecutivos** (Lv 41–75) sem nenhum novo skill de classe. Em um RPG, ganhar habilidades é o principal sinal de progressão além de stats.

---

### 4.4 Anomalia XP Orc Village vs Dwarven Mine
**Arquivo:** `lineage-idle/src/data/zones.js`

| Zona | Nível | Avg Monster HP | Avg XP | Ratio XP/HP |
|---|---|---|---|---|
| Orc Village | 7 | 792 | 129 | **0.162** |
| Dwarven Mine | 9 | 352 | 140 | **0.398** |

- Dwarven Mine: monstros 2.25x mais fracos, mas dão 2.46x mais XP por HP
- Resultado: zona de nível 9 é mais eficiente que zona de nível 7
- Jogador é incentivado a **pular** Orc Village

---

## 5. CONTRADIÇÕES SISTÊMICAS

### 5.1 Over-CP no Lv 1 (1.750 CP por Estado Padrão)
**Arquivo:** `lineage-idle/src/core/StateManager.js`

**DEFAULT_STATE() inicializa:**
```javascript
fortresses: {
  equippedTalismans: ['talisman_power'],  // ← item de Fortaleza Lv 70!
  equippedBracelet: 'bracelet_steel',     // ← bracelet de tier alto
}
clan: {
  level: 1,  // ← contribui para CP_WEIGHTS
}
```

**CP_REQUIREMENTS vs CP_REAL:**
```
talkingIsland.minCp = 200    | CP Lv1 real = ~280
elvenForest.minCp   = 500    | CP Lv1 com DEFAULT = 1.750
darkForest.minCp    = 800    |
```

**Resultado:** O jogador trivializa 3 zonas desde o nascimento sem nenhum esforço de progressão de gear.

---

### 5.2 Clan Default = 'Os Guardiões de Aden' (Bloqueia Step 6)
**Arquivos:** `StateManager.js` + `StarterJourneyService.js`

```javascript
// StateManager.js DEFAULT_STATE():
clan: { name: 'Os Guardiões de Aden', level: 1 }

// StarterJourneyService.js Step 6:
if (state.clan.name !== 'Os Guardiões de Aden') {
  // completa o passo
}
// ← NUNCA será true porque o nome padrão É 'Os Guardiões de Aden'!
```

**Resultado:** Step 6 do onboarding é **matematicamente impossível** de completar. Jogador fica preso ou ignora o sistema.

---

### 5.3 Season 1 Cap = Lv 40, Código Cap = Lv 120
**Arquivo:** `lineage-idle/src/core/SeasonConfig.js`

```javascript
// Season 1 definida com:
maxLevel: 40

// getSeasonMaxLevel():
return 120  // ← hardcoded! Ignora o season config!
```

**Consequência:**
- Sistema de nível permite progressão até Lv 120
- Mas Season 1 foi desenhada apenas para Lv 1–40
- 80 níveis de "conteúdo prometido" que não existe na Season atual

---

## 6. TABELA CONSOLIDADA DE ISSUES SEM NEXO

| ID | Tipo | Sev | Sistema | Descrição | Nível Afetado |
|---|---|---|---|---|---|
| NX-01 | CONTRADIÇÃO | P0 | StateManager | Over-CP 1.750 ao nascer | Lv 1 |
| NX-02 | PREMATURO | P0 | Quests | d_tower quest vs Tower Lv 40 | Lv 5–39 |
| NX-03 | PREMATURO | P0 | Quests | d_craft quest vs Forge Lv 10 | Lv 5–9 |
| NX-04 | CONTRADIÇÃO | P0 | StarterJourney | Step 6 impossível (clan name) | Lv 1+ |
| NX-05 | DEAD CONTENT | P0 | Zones | Zero zonas Lv 96–120 | Lv 96–120 |
| NX-06 | PROGRESSÃO INCOERENTE | P0 | LevelEngine | XP invertido Lv 101 (-52%) | Lv 101+ |
| NX-07 | DEAD CONTENT | P0 | All Raids | adena_coins inexistente em 8 raids | Lv 30–90 |
| NX-08 | RECOMPENSA INADEQUADA | P0 | StarterJourney | scrl_enchant_wp_d inexistente | Lv 1 (Step 2) |
| NX-09 | RECOMPENSA INADEQUADA | P0 | StarterJourney | ls_mid_76 inexistente | Lv 1 (Step 3) |
| NX-10 | CONTRADIÇÃO | P1 | Shop | SHOP_INVENTORY string bug (127 phantom IDs) | Todos |
| NX-11 | DEAD CONTENT | P1 | Olympiad | giants_codex inexistente na shop | Lv 40+ |
| NX-12 | DEAD CONTENT | P1 | Olympiad | blessed_scroll_weapon_s inexistente | Lv 40+ |
| NX-13 | DEAD CONTENT | P1 | Olympiad | blessed_scroll_armor_s inexistente | Lv 40+ |
| NX-14 | DEAD CONTENT | P1 | Seven Signs | 6 itens Mammon inexistentes | Lv varies |
| NX-15 | PROGRESSÃO INCOERENTE | P1 | LevelEngine | XP cliff Lv 20→21 (7.8x) | Lv 20 |
| NX-16 | PROGRESSÃO INCOERENTE | P1 | LevelEngine | XP cliff Lv 40→41 (5.3x) | Lv 40 |
| NX-17 | PROGRESSÃO INCOERENTE | P1 | LevelEngine | XP cliff Lv 85→86 (4.4x) | Lv 85 |
| NX-18 | PROGRESSÃO INCOERENTE | P1 | Skills | Deserto de skills Lv 41–75 (35 níveis) | Lv 41–75 |
| NX-19 | PREMATURO | P1 | Raids | Raids Tab Lv 20 sem Queen Ant até Lv 30 | Lv 20–29 |
| NX-20 | CONTRADIÇÃO | P1 | Clan | Clan pré-inicializado vs Tab unlock Lv 20 | Lv 1–19 |
| NX-21 | SEM PROPÓSITO | P1 | Dolls | Tab Lv 1 com conteúdo Season 2 bloqueado | Lv 1+ |
| NX-22 | CONTRADIÇÃO | P1 | SeasonConfig | Season 1 cap=40 vs getSeasonMaxLevel()=120 | Todos |
| NX-23 | DEAD CONTENT | P1 | Zones | Necropolis XP 5.5x–7x menor que alternativas | Lv 32–42 |
| NX-24 | RECOMPENSA INADEQUADA | P1 | Crafting | weapon_orfen_dagger, jewel_baium_ring inexistentes | varies |
| NX-25 | PROGRESSÃO INCOERENTE | P2 | Zones | Orc Village ratio XP/HP 2.46x pior que Dwarven Mine | Lv 7–9 |
| NX-26 | PROGRESSÃO INCOERENTE | P2 | Items | 1.086 NG items com reqLvl até 90 | varies |
| NX-27 | PROGRESSÃO INCOERENTE | P2 | Items | Tier 4.5 não-documentado entre B e A | Lv 52–76 |
| NX-28 | SEM PROPÓSITO | P2 | Inventory | Kit inicial vazio sem boas-vindas | Lv 1 |
| NX-29 | SEM PROPÓSITO | P3 | Magic Lamp | Tab sem tutorial no Lv 20 | Lv 20 |
| NX-30 | SEM PROPÓSITO | P3 | Raids | Aba vazia sem mensagem "Disponível Lv 30" | Lv 20–29 |

---

## 7. MAPA DE CALOR — Densidade de Problemas por Faixa de Nível

```
Lv   1 ████████████ P0×4 P1×2 (Over-CP, quests prematuras, starter journey)
Lv   5 ████████     P0×2 P1×1 (d_craft, d_tower desbloqueiam errado)
Lv   7 ████         P2×1 (Orc Village anomalia XP)
Lv  10 ██           P0×1 (d_craft resolve, forge abre)
Lv  20 ██████████   P0×1 P1×3 (raids tab vazia, clan, XP cliff 7.8x)
Lv  30 ████         P1×1 (Queen Ant disponível — 10 atrasos depois)
Lv  32 ████         P1×1 (Necropolis 5.5x menos XP — Dead Content)
Lv  40 ████████     P0×1 P1×2 (XP cliff 5.3x, skill desert começa)
Lv  41 ████████████ P1×1 (35 níveis de skill desert — mais longo do jogo)
...    (Lv 41–75 = skill desert persistente)
Lv  42 ████         P1×1 (Necropolis 7x menos XP — pior dead content)
Lv  76 ████         P1×1 (skill flood após 35 níveis)
Lv  85 ████████     P1×1 (XP cliff 4.4x)
Lv  95 ████         ---- (última zona — fim do conteúdo real)
Lv  96 ████████████ P0×1 (dead content começa — 25 níveis de vazio)
Lv 101 ████████████ P0×2 (XP invertido + dead content total)
Lv 120 ████████████ P0×1 (fim do código, zero conteúdo)

Intensidade: ████ = Leve | ████████ = Moderado | ████████████ = Crítico
```

---

## Resumo Executivo de Nexo e Dead Content

| Categoria | Quantidade | Severidade Máx |
|---|---|---|
| Referências Quebradas (reais) | 16 IDs distintos | P0 |
| Bug estrutural SHOP_INVENTORY (phantom) | 127 IDs phantom | P0 (bug) |
| Dead Content (zonas/sistemas) | 5 clusters | P0 |
| Conteúdo Prematuro | 4 casos | P0 |
| Contradições Sistêmicas | 6 contradições | P0 |
| Progressão Incoerente | 7 breakpoints | P0–P1 |
| **TOTAL ISSUES** | **30 issues distintos** | P0 (maioria) |

---

*Auditoria apenas — nenhuma alteração foi feita no projeto*
*Análise baseada 100% em código-fonte via scripts de inspeção*
