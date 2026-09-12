# 🗺️ PLAYER JOURNEY AUDIT — Aden Arena
## Auditoria Completa da Jornada do Jogador: Lv 1 → Lv 120

**Versão:** Season 1 (Cap ativo: Lv 40 | Cap no código: Lv 120)
**Data da Auditoria:** Setembro 2026
**Metodologia:** Análise forense de código + dataset de 120 níveis gerado via script

---

## Legenda
- 🟢 COERENTE — Nível funciona bem, progressão sólida
- 🟡 QUESTIONÁVEL — Funciona mas tem falhas de design ou timing inadequado
- 🟠 PROBLEMÁTICO — Bugs, incoerências graves ou danos à progressão
- 🔴 SEM NEXO — Quebrado, dead content, sem propósito claro

**Categorias SEM NEXO:** PREMATURO | TARDIO | REDUNDANTE | OBSOLETO | SEM PROPÓSITO | RECOMPENSA INADEQUADA | PROGRESSÃO INCOERENTE | DEAD CONTENT | CONTRADIÇÃO

---

## ARCO 1 — Early Game (Lv 1–19)
### Resumo do Arco
O primeiro arco cobre a chegada do personagem ao mundo de Aden, passando por zonas básicas como Talking Island, Elven Forest e Dwarven Mine. A estrutura de progressão é bem cadenciada, com uma nova zona a cada 2–4 níveis. O maior problema é que o personagem **nasce superpoderoso** graças ao estado inicial do DEFAULT_STATE, e as **quests diárias são desbloqueadas no Lv 5** com tarefas que exigem sistemas que só existem no Lv 10 e Lv 40.

**Estatísticas do Arco:**
- Total de níveis: 19
- 🟢 COERENTES: 14 | 🟡 QUESTIONÁVEIS: 2 | 🟠 PROBLEMÁTICOS: 1 | 🔴 SEM NEXO: 2

---

### Lv 1 — Chegada ao Mundo 🟠 PROBLEMÁTICO
**Estado do Jogador:**
- HP: 198 | MP: 63 | ATK: 39 | DEF: 25 | CP estimado: ~280 (legítimo)
- Gear Tier: No-Grade (Tier 1)
- CP REAL no DEFAULT_STATE: **1.750** (superando o esperado por 6x)

**Conteúdo Disponível:**
- Zona: Talking Island (Boss: Goblin King)
- Abas: Zones, Character, Inventory, Skills, Shop, Market, Warehouse, Rankings, Codex, Dolls
- Saga: Interlude

**Desbloqueios:** Tudo acima + 10 abas abertas simultaneamente no primeiro login

**Problemas Detectados:**
1. 🔴 CONTRADIÇÃO — DEFAULT_STATE inicializa `fortresses.equippedTalismans: ['talisman_power']` (item de Fortaleza Lv 70) e `equippedBracelet: 'bracelet_steel'` e `clan.level: 1`, gerando 1.750 CP ao nascer
2. 🟠 — ZONE_CP_REQUIREMENTS: talkingIsland.minCp = 200 → jogador nasce com 8.75x o mínimo exigido
3. 🟠 — Elven Forest (minCp=500) e Dark Forest (minCp=800) também trivializadas desde o nascer
4. 🟠 — Inventário inicial completamente vazio (sem potions, sem kit de boas-vindas)
5. 🟠 — Dolls Tab abre no Lv 1 com conteúdo Season 2 bloqueado — aba vazia e confusa

**Classificação:** 🟠 PROBLEMÁTICO | P0 (Over-CP quebra loop de progressão de gear)

---

### Lv 2–4 — Progressão Inicial 🟢 COERENTE
**Estado do Jogador (Lv 4):**
- HP: 282 | MP: 87 | ATK: 51 | DEF: 34 | CP: ~776

**Conteúdo:**
- Lv 3: Elven Forest desbloqueada (Boss: Death Trent)
- Progressão de XP suave: 614 → 1.404 → 2.687 XP por nível

**Sem problemas** — progressão linear e consistente.

**Classificação:** 🟢 COERENTE

---

### Lv 5 — Desbloqueio de Quests 🔴 SEM NEXO
**Estado do Jogador:**
- HP: 310 | MP: 95 | ATK: 55 | DEF: 37 | CP: ~941
- Zona: Dark Forest (Boss: Dark Forest Matriarch)

**Desbloqueios:** Aba **Quests** (5 missões diárias)

**Problemas Detectados:**
1. 🔴 PREMATURO — `d_craft` (type: 'craft') exige Forja → Forge Tab só abre no **Lv 10** (5 níveis bloqueado)
2. 🔴 PREMATURO — `d_tower` (type: 'tower') exige Torre da Insolência → Tower Tab só abre no **Lv 40** (35 níveis bloqueado!)
3. 🔴 CONTRADIÇÃO — `DAILY_COMPLETION_BONUS` exige TODOS os 5 diários incluindo tower → baú inacessível por 35 níveis
4. 🟡 — Jogador vê 5 missões mas só pode completar 3, sem explicação de por quê as outras estão bloqueadas

**Classificação:** 🔴 SEM NEXO — PREMATURO (Quests Lv 5 com dependências de Lv 10 e Lv 40)

---

### Lv 6 — Progressão Normal 🟢 COERENTE
- HP: 338 | MP: 103 | ATK: 59 | DEF: 40 | CP: ~1.106
- XP necessário: 7.003
- Sem eventos ou problemas.

---

### Lv 7 — Orc Village 🟡 QUESTIONÁVEL
**Estado do Jogador:**
- HP: 366 | MP: 111 | ATK: 63 | DEF: 43 | CP: ~1.271

**Desbloqueios:** Orc Village (Boss: Kasha Orc Overlord)

**Problemas Detectados:**
1. 🟡 PROGRESSÃO INCOERENTE — Orc Village avg HP: **792**, avg XP: **129** → ratio XP/HP: **0.162**
2. 🟡 — Dwarven Mine (Lv 9): avg HP: **352**, avg XP: **140** → ratio XP/HP: **0.398**
3. 🟡 — Dwarven Mine dá **2.46x mais XP** por HP de monstro, com monstros 2.25x mais fracos
4. Resultado: jogador é incentivado a pular Orc Village completamente

**Classificação:** 🟡 QUESTIONÁVEL — PROGRESSÃO INCOERENTE

---

### Lv 8 — Progressão Normal 🟢 COERENTE
- HP: 394 | MP: 119 | ATK: 67 | DEF: 46 | CP: ~1.436
- Sem eventos ou problemas.

---

### Lv 9 — Dwarven Mine 🟢 COERENTE
- HP: 422 | MP: 127 | ATK: 71 | DEF: 49 | CP: ~1.601
- Dwarven Mine desbloqueada (Boss: Dwarven Earth Lord)
- XP eficiente: 0.398 XP/HP

---

### Lv 10 — Forge + Craft Desbloqueados 🟢 COERENTE
**Estado do Jogador:**
- HP: 450 | MP: 135 | ATK: 75 | DEF: 52 | CP: ~1.767

**Desbloqueios:** Abas **Craft** e **Forge** (Forja Imperial)

**Nota positiva:** Finalmente alinha com a quest `d_craft` que foi desbloqueada no Lv 5. Porém os 5 níveis de gap ainda foram um problema.

**Classificação:** 🟢 COERENTE (resolução parcial do problema do Lv 5)

---

### Lv 11–14 — Progressão Normal 🟢 COERENTE
- Kamael Lair desbloqueada no Lv 11 (Boss: Dark Inquisitor Kamael)
- Progressão linear de stats e XP sem problemas
- XP: 30.407 → 37.596 → 45.709 → 54.780 por nível

---

### Lv 15 — Ruined Outpost 🟢 COERENTE
- HP: 590 | CP: ~2.592
- Ruined Outpost desbloqueada (Boss: Outpost Fallen Captain)

---

### Lv 16–19 — Reta Final do Early Game 🟢 COERENTE
- XP crescendo de 75.922 até 115.592 por nível
- Stats crescendo de forma consistente
- Sem novos conteúdos — preparação para o grande salto do Lv 20
- **Lv 19:** HP: 702 | ATK: 111 | CP: ~3.252

---

## ARCO 2 — Mid-Game (Lv 20–39)
### Resumo do Arco
O segundo arco começa com o maior penhasco de XP do jogo (7.8x), seguido pela 1ª Transferência de Classe. Quatro abas novas abrem simultaneamente, mas com problemas: Raids está vazia por 10 níveis, e o Clan é incoerente com o estado padrão. Este arco introduz a mais marcante incoerência de timing do jogo.

**Estatísticas do Arco:**
- Total de níveis: 20
- 🟢 COERENTES: 8 | 🟡 QUESTIONÁVEIS: 6 | 🟠 PROBLEMÁTICOS: 4 | 🔴 SEM NEXO: 2

---

### Lv 20 — 1ª Transferência de Classe + Penhasco XP 🟠 PROBLEMÁTICO
**Estado do Jogador:**
- HP: 730 | MP: 215 | ATK: 115 | DEF: 82 | CP: ~3.417
- XP necessário para este nível: **131.050**
- XP necessário para o PRÓXIMO nível (Lv 21): **1.020.000** ← **7.8x SALTO!**

**Desbloqueios Simultâneos:**
- ✅ 1ª Transferência de Classe (checkClassAdvancement)
- ✅ Skills Tier 1 disponíveis
- ✅ Aba **Raids** abre
- ✅ Aba **Magic Lamp** abre
- ✅ Aba **Clan** abre
- ✅ Aba **Enchant** abre
- ✅ Saga: Prelude of War

**Problemas Detectados:**
1. 🔴 PREMATURO — Raids Tab abre mas primeira Raid (Queen Ant) requer **Lv 30** → 10 níveis de aba vazia
2. 🟡 CONTRADIÇÃO — Clan Tab abre mas DEFAULT_STATE já tem `clan.name: 'Os Guardiões de Aden'` e `clan.level: 1` desde o nascimento
3. 🟠 — Penhasco XP 7.8x sem aumento proporcional de fontes de XP ou qualidade de zona
4. 🟡 — 4 novas abas abertas simultaneamente sobrecarregam o jogador com informação (UX)
5. 🔴 CONTRADIÇÃO — StarterJourney Step 6 já bloqueado: verifica `clan.name !== 'Os Guardiões de Aden'` mas DEFAULT é exatamente esse nome

**Classificação:** 🟠 PROBLEMÁTICO — múltiplas incoerências simultâneas

---

### Lv 21–29 — Grind Pós-Primeira Classe 🟡 QUESTIONÁVEL
**Lv 21:**
- XP exigido: 1.020.000 (salto brutal do Lv 20)
- Sem novos desbloqueios de conteúdo
- Aba Raids visível mas sem raids disponíveis (Lv 20–29 sem raids)

**Lv 25:** Thebes (zona nova desbloqueada)

**Problema persistente:** 9 níveis (21–29) com Raids Tab completamente vazia sem explicação.

**Classificação geral:** 🟡 QUESTIONÁVEL

---

### Lv 30 — Queen Ant (Primeiro Raid) 🟢 COERENTE
- Primeira Raid disponível: Queen Ant (`reqLvl: 30`)
- Resolve parcialmente o problema do Lv 20 (10 níveis depois do esperado)
- Classificação: 🟢 COERENTE (o raid em si é bem posicionado, o problema foi o unlock prematuro da aba)

---

### Lv 32 — Necropolis of Sacrifice 🟡 QUESTIONÁVEL
**Desbloqueios:** Necropolis of Sacrifice (zona alternativa)

**Problema:**
- Necropolis of Sacrifice (Lv 32): avg XP = **287**
- Orcen Ruins (Lv 30): avg XP = **1.570**
- Ratio: **5.5x menos XP** por kill para zona de nível equivalente
- Nenhum incentivo para usar a Necropolis — Dead Content garantido

**Classificação:** 🟡 QUESTIONÁVEL — RECOMPENSA INADEQUADA

---

### Lv 33–39 — Progressão Final do Mid-Game 🟢 COERENTE
- XP crescendo de forma consistente (mas elevada após o penhasco do Lv 20)
- Novas zonas aparecem periodicamente
- Stats crescendo linearmente
- **Lv 39:** HP: ~1.150 | CP: ~5.800

---

## ARCO 3 — Mid-Late Game (Lv 40–75)
### Resumo do Arco
O terceiro arco é o mais problemático do jogo. Começa com outro penhasco de XP (5.3x), mas desta vez a 2ª Transferência de Classe traz novos sistemas poderosos. O maior problema é o **Deserto de Skills de 35 níveis** — do Lv 41 ao Lv 75 não há nenhum novo skill de classe. As Necrópoles continuam sendo Dead Content.

**Estatísticas do Arco:**
- Total de níveis: 36
- 🟢 COERENTES: 10 | 🟡 QUESTIONÁVEIS: 8 | 🟠 PROBLEMÁTICOS: 10 | 🔴 SEM NEXO: 8

---

### Lv 40 — 2ª Transferência + Penhasco XP + Torre 🟠 PROBLEMÁTICO
**Estado do Jogador:**
- HP: ~1.200 | ATK: ~200 | CP: ~6.200
- XP necessário: **5.600.000**
- XP necessário Lv 41: **29.700.000** ← **5.3x SALTO!**

**Desbloqueios:**
- ✅ 2ª Transferência de Classe
- ✅ Skills Tier 2 (primeiro grupo novo desde Lv 20!)
- ✅ Torre da Insolência
- ✅ Coliseu
- ✅ Olimpíada
- ✅ `d_tower` quest finalmente pode ser completada (35 níveis de espera!)

**Problemas:**
1. 🟠 — Penhasco XP 5.3x no segundo maior wall do jogo
2. 🟠 — Avalanche de sistemas novos: Torre + Coliseu + Olimpíada simultaneamente
3. 🔴 PROGRESSÃO INCOERENTE — Skills Tier 2 agora disponíveis, mas próximo milestone (Tier 3) é o Lv 76 → **35 níveis de Deserto**

**Classificação:** 🟠 PROBLEMÁTICO

---

### Lv 41–75 — DESERTO DE SKILLS (35 Níveis) 🔴 SEM NEXO
**Estado geral:**
- XP crescendo de forma pesada (pós-penhasco do Lv 40)
- Novas zonas aparecem a cada poucos níveis
- **ZERO novos skills de classe por 35 níveis consecutivos**

**Níveis de zona notáveis:**
- Lv 42: Necropolis of Pilgrims (avg XP: 673 vs Black Citadel Lv 40: 4.760 → **7x menos XP**)
- Lv 45: Ant Nest
- Lv 50: Valley of Saints
- Lv 55: Sea of Spores
- Lv 60: Forge of Gods (primeiro acesso)
- Lv 65: Dragon Valley
- Lv 70: Giants Cave
- Lv 75: Ketra Orc Outpost

**Problema Central — Deserto de Skills:**
- Echo-adapter.js mapeamento tier→reqLvl: `tier2=40`, `tier3=76`
- 35 níveis consecutivos sem nenhuma nova habilidade de classe
- Maior feedback de progressão em RPG (ganhar skills) completamente ausente
- Jogador cresce em stats mas não em habilidades

**Lv 42 — Necropolis of Pilgrims 🔴 SEM NEXO:**
- avg XP: 673 vs Black Citadel (Lv 40): 4.760
- Ratio: **7.0x menos XP** — pior Dead Content do jogo

**Classificação geral do arco:** 🔴 SEM NEXO — PROGRESSÃO INCOERENTE (Skill Desert de 35 níveis)

---

## ARCO 4 — Late Game (Lv 76–100)
### Resumo do Arco
A 3ª Transferência de Classe no Lv 76 é o grande evento do late game. Skills Tier 3 chegam de uma só vez após 35 níveis de espera. A progressão de zona é sólida até o Lv 95 (forgeOfGods), depois entra no territory of dead content. O penhasco de XP Lv 85→86 é o último grande wall antes do endgame.

**Estatísticas do Arco:**
- Total de níveis: 25
- 🟢 COERENTES: 12 | 🟡 QUESTIONÁVEIS: 6 | 🟠 PROBLEMÁTICOS: 5 | 🔴 SEM NEXO: 2

---

### Lv 76 — 3ª Transferência de Classe + Skills Tier 3 🟠 PROBLEMÁTICO
**Estado do Jogador:**
- HP: ~3.500 | ATK: ~450 | CP: ~18.000

**Desbloqueios:**
- ✅ 3ª Transferência de Classe (Noblesse quest)
- ✅ Skills Tier 3 — avalanche de skills após 35 níveis de espera
- ✅ Grade A gear disponível (reqLvl: 76)

**Problemas:**
1. 🟠 — Flood de skills simultâneos após 35 níveis — pode ser confuso ao invés de satisfatório
2. 🟡 — Gear Grade A e S começam em Lv 76 e 80 respectivamente — gear progression comprimida no final

**Classificação:** 🟡 QUESTIONÁVEL (bom evento, timing correto, mas flood de skills causa confusão)

---

### Lv 77–84 — Progressão Late Game 🟢 COERENTE
- Stats crescendo consistentemente
- Gear tiers A (Lv 76) e S (Lv 80) adicionam variedade de equipment
- Zonas de alto nível: Forge of Gods area, Plains of the Lizardmen

---

### Lv 85–86 — Penhasco XP Final 🟠 PROBLEMÁTICO
- XP Lv 85: **4.360.000.000**
- XP Lv 86: **19.060.000.000** ← **4.4x SALTO!**
- Terceiro e último penhasco antes do conteúdo endgame
- Sem novo conteúdo para justificar o aumento abrupto

**Classificação:** 🟠 PROBLEMÁTICO — PROGRESSÃO INCOERENTE

---

### Lv 87–94 — Endgame Content 🟢 COERENTE
- Zonas endgame com boa progressão de XP
- Raids de alto nível disponíveis (Frintessa, Barakiel)
- Stats chegando ao pico para Season 1

---

### Lv 95 — Forge of Gods (Última Zona) 🟡 QUESTIONÁVEL
**Estado do Jogador:**
- HP: ~6.000+ | CP: ~40.000+

**Conteúdo:**
- forgeOfGods = última zona do jogo
- A partir daqui: **ZERO conteúdo novo**

**Classificação:** 🟡 QUESTIONÁVEL — marcar claramente como "última zona da Season 1"

---

### Lv 96–100 — Zona de Transição (Dead Content Preview) 🔴 SEM NEXO
- Sem zonas novas
- Sem raids novas
- Sem skills novas
- Apenas grinding nas zonas do Lv 95
- Prepare-se para o deserto total do Lv 101+

**Classificação:** 🔴 SEM NEXO — DEAD CONTENT (5 níveis de grinding sem nada novo)

---

## ARCO 5 — End Game (Lv 101–120): DESERTO TOTAL 🔴🔴🔴
### Resumo do Arco
O pior estado do jogo. 20 níveis com ZERO conteúdo novo. Combinado com um bug matemático que faz o XP cair 52% ao invés de aumentar no Lv 101. Qualquer jogador que chegue aqui encontra uma experiência completamente quebrada.

**Estatísticas do Arco:**
- Total de níveis: 20
- 🟢 COERENTES: 0 | 🟡 QUESTIONÁVEIS: 0 | 🟠 PROBLEMÁTICOS: 0 | 🔴 SEM NEXO: 20

---

### Lv 101 — XP Invertido (Bug Crítico) 🔴 SEM NEXO
**Estado do Jogador:**
- Stats: máximos para as fórmulas existentes
- XP Lv 100 → 101: **33.200.000.000**
- XP Lv 101 → 102: **15.800.000.000** ← **QUEDA DE 52%!!!**

**Causa Raiz:**
- `LevelEngine.js`: fórmula para Lv 101+ usa progressão **linear**: `15000000000 + (lvl-100) * 800000000`
- Deveria ser exponencial para manter curva crescente
- O "endgame" se torna mais fácil de progredir que o mid-game Lv 85–100

**Conteúdo Disponível:** NADA. Zero zonas. Zero monstros. Zero bosses.

**Classificação:** 🔴 SEM NEXO — PROGRESSÃO INCOERENTE + DEAD CONTENT

---

### Lv 102–120 — Deserto Absoluto 🔴 SEM NEXO
**19 níveis consecutivos com:**
- ❌ ZERO zonas
- ❌ ZERO monstros novos
- ❌ ZERO bosses
- ❌ ZERO skills novas
- ❌ ZERO conteúdo de qualquer natureza

**`getSeasonMaxLevel()` retorna 120** mas não há conteúdo para nenhum destes níveis.

**Impacto:** Se um jogador chega aqui (improvável com o Season 1 cap de Lv 40 ativo), a experiência é completamente quebrada.

**Classificação:** 🔴 SEM NEXO — DEAD CONTENT (definitivo)

---

## Resumo de Problemas por Arco

| Arco | Níveis | 🟢 | 🟡 | 🟠 | 🔴 | Pior Problema |
|---|---|---|---|---|---|---|
| ARCO 1 (1–19) | 19 | 14 | 2 | 1 | 2 | Over-CP Lv 1 + Quests Prematuras |
| ARCO 2 (20–39) | 20 | 8 | 6 | 4 | 2 | Penhasco XP 7.8x + Raids Tab vazia |
| ARCO 3 (40–75) | 36 | 10 | 8 | 10 | 8 | Deserto de Skills 35 níveis |
| ARCO 4 (76–100) | 25 | 12 | 6 | 5 | 2 | Penhasco XP 4.4x + Dead Content 96–100 |
| ARCO 5 (101–120) | 20 | 0 | 0 | 0 | 20 | XP Invertido + Deserto Total |
| **TOTAL** | **120** | **44** | **22** | **20** | **34** | |

---

## Top 10 Problemas Críticos por Nível

| # | Nível | Problema | Severidade | Tipo |
|---|---|---|---|---|
| 1 | Lv 1 | Over-CP 1.750 (DEFAULT_STATE pré-equipa itens) | P0 | CONTRADIÇÃO |
| 2 | Lv 5 | d_tower quest bloqueada por 35 níveis | P0 | PREMATURO |
| 3 | Lv 101 | XP cai 52% ao invés de aumentar | P0 | PROGRESSÃO INCOERENTE |
| 4 | Lv 101–120 | ZERO conteúdo por 20 níveis | P0 | DEAD CONTENT |
| 5 | Lv 1 | StarterJourney Step 6 matematicamente impossível | P0 | CONTRADIÇÃO |
| 6 | Lv 20 | Penhasco XP 7.8x + Raids vazia 10 níveis | P1 | PROGRESSÃO INCOERENTE |
| 7 | Lv 41–75 | Deserto de Skills 35 níveis (echo-adapter.js) | P1 | PROGRESSÃO INCOERENTE |
| 8 | Lv 32,42 | Necrópoles 5–7x menos XP (Dead Content) | P1 | RECOMPENSA INADEQUADA |
| 9 | Lv 40 | Penhasco XP 5.3x + avalanche de sistemas | P1 | PROGRESSÃO INCOERENTE |
| 10 | Lv 85–86 | Penhasco XP 4.4x sem conteúdo novo | P1 | PROGRESSÃO INCOERENTE |

---

*Gerado a partir de levels_audit_cache.json + análise forense de código-fonte*
*Auditoria somente — sem alterações no projeto*
