# 📋 PROGRESSION BREAKPOINTS — Aden Arena
## Mapa Completo dos Pontos de Quebra, Travamento e Incoerência na Progressão

**Data da Auditoria:** Setembro 2026
**Total de Breakpoints Identificados:** 14
**Distribuição:** P0: 5 | P1: 6 | P2: 3

---

## Visão Geral: Linha do Tempo da Progressão

```
Lv   1 ◄── BP-01: Over-CP Nascimento (P0)
Lv   5 ◄── BP-02: Quests Prematuras (P0)
Lv   7 ◄── BP-03: Orc Village XP Anomalia (P2)
Lv  10 ────── Forge/Craft abrem (resolve parcialmente BP-02)
Lv  20 ◄── BP-04: Penhasco XP 7.8x + System Bombs (P0/P1)
Lv  20 ◄── BP-05: Raids Tab vazia 10 níveis (P1)
Lv  30 ────── Queen Ant disponível (resolve parcialmente BP-05)
Lv  32 ◄── BP-06: Necropolis Dead Content XP (P1)
Lv  40 ◄── BP-07: Penhasco XP 5.3x + d_tower resolve (P1)
Lv  41 ◄── BP-08: Deserto de Skills COMEÇA (P1)
Lv  42 ◄── BP-09: Necropolis of Pilgrims (pior Dead Content) (P1)
Lv  76 ◄── BP-10: 3ª Transferência + Skills Flood (P1)
Lv  85 ◄── BP-11: Penhasco XP Final 4.4x (P1)
Lv  95 ────── Forge of Gods: última zona
Lv  96 ◄── BP-12: Content Wall Total (P0)
Lv 101 ◄── BP-13: XP Invertido -52% (P0)
Lv 101 ◄── BP-14: Deserto Total de Conteúdo (P0)
Lv 120 ────── Fim do código
```

---

## BP-01: Lv 1 — Over-CP ao Nascer
**Severidade:** P0 | **Tipo:** CONTRADIÇÃO | **Sistema:** StateManager + CP System

### Descrição
O personagem é criado com 1.750 CP quando deveria ter aproximadamente 280 CP. Isso ocorre porque o `DEFAULT_STATE()` pré-equipa itens de alto nível antes do jogador ter feito qualquer progressão.

### Dados Concretos
```
CP LEGÍTIMO AO NASCER:
  HP: 198, MP: 63, ATK: 39, DEF: 25 → ~280 CP estimado

CP REAL (DEFAULT_STATE):
  + talisman_power (item de Fortaleza Lv 70+): contribui ~800 CP
  + bracelet_steel (bracelet de tier alto): contribui ~400 CP  
  + clan.level: 1: contribui ~200 CP (via CP_WEIGHTS)
  = 1.750 CP TOTAL ao nascer

ZONA_CP_REQUIREMENTS:
  talkingIsland.minCp = 200  → player nasce com 8.75x o mínimo
  elvenForest.minCp   = 500  → player nasce com 3.5x o mínimo
  darkForest.minCp    = 800  → player nasce com 2.19x o mínimo
```

### Causa Raiz
Arquivo: `lineage-idle/src/core/StateManager.js` — método `DEFAULT_STATE()`
```javascript
// BUGADO — itens que deveriam ser conquistados estão no estado inicial:
fortresses: {
  equippedTalismans: ['talisman_power'],
  equippedBracelet: 'bracelet_steel',
}
clan: { level: 1, name: 'Os Guardiões de Aden' }
```

### Impacto no Jogador
- Loop de progressão de equipamento **completamente desincentivado** nas primeiras 3 zonas
- Jogador nunca experimenta a satisfação de "melhorar gear e desbloquear nova zona"
- A progressão de gear (o núcleo de um idle RPG) começa sem impacto

### Classificação SEM NEXO
🔴 CONTRADIÇÃO — O sistema de CP gates existe para criar progressão, mas o estado inicial ignora esse design.

### Solução Proposta (não implementar)
Remover `equippedTalismans`, `equippedBracelet` e resetar `clan.level` do DEFAULT_STATE.

---

## BP-02: Lv 5 — Quests Prematuras / Bloqueio do Baú Diário
**Severidade:** P0 | **Tipo:** PREMATURO | **Sistema:** Quest System + Tab Unlocks

### Descrição
A aba de Quests desbloqueia no Lv 5, mas 2 das 5 missões diárias dependem de sistemas que só existem em níveis muito superiores. O baú diário (recompensa de completar todos os 5) fica bloqueado por 35 níveis.

### Dados Concretos
```
Quests Tab Unlock: Lv 5

Quest d_craft (type: 'craft'):
  → Depende de: Forge Tab
  → Forge Tab unlock: Lv 10
  → Gap: 5 níveis bloqueado

Quest d_tower (type: 'tower'):
  → Depende de: Tower Tab (Torre da Insolência)
  → Tower Tab unlock: Lv 40
  → Gap: 35 NÍVEIS BLOQUEADO!

DAILY_COMPLETION_BONUS:
  → Requer: d_zone + d_raid + d_craft + d_tower + d_boss (TODOS os 5)
  → d_tower bloqueado até Lv 40
  → Baú inacessível: Lv 5 até Lv 39 = 35 níveis sem baú diário
```

### Causa Raiz
Arquivos:
- `lineage-idle/src/data/quests.js` — quests com unlock_level: 5 mas dependências de sistemas Lv 10 e 40
- `lineage-idle/src/ui/AppLayout.js` — `TAB_UNLOCK_LEVELS`: forge=10, tower=40

### Impacto no Jogador
- Jogador vê 5 quests no Lv 5 mas só pode completar 3
- Sem explicação de por que as outras estão "inacessíveis"
- A recompensa mais valiosa do loop diário bloqueada por 35 níveis = 87.5% do Season 1

### Classificação SEM NEXO
🔴 PREMATURO — Quests são exibidas antes de seus sistemas pré-requisitos existirem.

### Solução Proposta (não implementar)
- Mover `d_tower` unlock para Lv 40 (alinhado com Tower Tab)
- Mover `d_craft` unlock para Lv 10 (alinhado com Forge Tab)
- Ou: fazer DAILY_COMPLETION_BONUS exigir apenas as quests disponíveis no nível atual

---

## BP-03: Lv 7 — Anomalia XP Orc Village
**Severidade:** P2 | **Tipo:** PROGRESSÃO INCOERENTE | **Sistema:** Zone System

### Dados Concretos
```
Orc Village (Lv 7):
  Avg Monster HP: 792
  Avg Monster XP: 129
  Ratio XP/HP: 0.162

Dwarven Mine (Lv 9):
  Avg Monster HP: 352   ← 2.25x MENOS HP
  Avg Monster XP: 140   ← MAS 8.5% MAIS XP
  Ratio XP/HP: 0.398    ← 2.46x MAIS EFICIENTE
```

### Causa Raiz
`lineage-idle/src/data/zones.js` — valores de `hp` e `xp` dos monstros de Orc Village mal balanceados.

### Impacto no Jogador
- Orc Village é objetivamente inferior para farming de XP
- Jogador racional ignora a zona e vai direto para Dwarven Mine
- Uma zona completa desperdiçada como progressão

### Solução Proposta (não implementar)
Reduzir HP dos monstros de Orc Village em ~50% ou aumentar XP em 2–3x.

---

## BP-04: Lv 20 — Penhasco XP + Multiple System Bombs
**Severidade:** P0/P1 | **Tipo:** PROGRESSÃO INCOERENTE | **Sistema:** LevelEngine + Multiple

### Dados Concretos
```
Lv 20 XP necessário: 131.050
Lv 21 XP necessário: 1.020.000
Multiplicador: 7.8x ← MAIOR PENHASCO DO JOGO

Sistemas que abrem SIMULTANEAMENTE no Lv 20:
  ✅ 1ª Transferência de Classe
  ✅ Skills Tier 1
  ✅ Raids Tab (mas raids só Lv 30!)
  ✅ Magic Lamp Tab
  ✅ Clan Tab (mas clan já existe desde Lv 1!)
  ✅ Enchant Tab
  ✅ Nova Saga: Prelude of War
```

### Causa Raiz
`lineage-idle/src/engine/LevelEngine.js` — mudança de fórmula XP no Lv 20 sem fator de transição suavizada.

### Impacto no Jogador
1. Atinge o Lv 20 com sensação de conquista (1ª transferência!)
2. Olha o XP necessário para Lv 21 e vê 7.8x mais
3. É bombardeado com 4 novas abas simultaneamente (sobrecarga de informação)
4. Descobre que Raids está vazia
5. Percebe que Clan já existia antes de abrir a aba (desorientação)

### Solução Proposta (não implementar)
- Suavizar curva com fator de transição gradual (ex: 2x, 3x, 5x ao longo de 3 níveis)
- Espaçar desbloqueios: Raids Lv 30, Clan Lv 20, Magic Lamp Lv 25

---

## BP-05: Lv 20–29 — Raid Tab Vazia (10 Níveis)
**Severidade:** P1 | **Tipo:** PREMATURO | **Sistema:** Raids + Tab Unlocks

### Dados Concretos
```
Raids Tab unlock: Lv 20
Raid disponível mais cedo (Queen Ant): reqLvl = 30
Gap: 10 NÍVEIS de tab completamente vazia
```

### Impacto no Jogador
- Jogador vê aba "Raids" no menu por 10 níveis
- Abre a aba e encontra lista vazia
- Sem mensagem explicativa de "próximo raid disponível no Lv 30"

### Solução Proposta (não implementar)
Opção A: Mover Raids Tab unlock para Lv 30.
Opção B: Adicionar raid de nível 20–29 (ex: mini-boss Lv 25).
Opção C: Exibir mensagem "Raids disponíveis no Lv 30" com countdown de nível.

---

## BP-06: Lv 32 — Necropolis of Sacrifice Dead Content
**Severidade:** P1 | **Tipo:** RECOMPENSA INADEQUADA | **Sistema:** Zone System

### Dados Concretos
```
Necropolis of Sacrifice (Lv 32):
  Avg XP/kill: 287

Orcen Ruins (Lv 30) — zona de nível MENOR:
  Avg XP/kill: 1.570

Ratio: Necropolis dá 5.5x MENOS XP que Orcen Ruins
       (que é de 2 níveis a menos!)
```

### Impacto no Jogador
- Zona de nível 32 é 5.5x menos eficiente que zona de nível 30
- Nenhum jogador racional escolhe a Necropolis
- Conteúdo completo (modelos, monstros, boss) totalmente ignorado

### Solução Proposta (não implementar)
Aumentar XP dos monstros da Necropolis em 5x, ou adicionar loot exclusivo (tokens de necromancia) que compensem o XP menor.

---

## BP-07: Lv 40 — Penhasco XP + Sistema de Quests Completo
**Severidade:** P1 | **Tipo:** PROGRESSÃO INCOERENTE | **Sistema:** LevelEngine + Quests

### Dados Concretos
```
Lv 40 XP necessário: 5.600.000
Lv 41 XP necessário: 29.700.000
Multiplicador: 5.3x ← SEGUNDO MAIOR PENHASCO

Sistemas que abrem no Lv 40:
  ✅ 2ª Transferência de Classe
  ✅ Skills Tier 2 (20 níveis de espera desde Lv 20)
  ✅ Torre da Insolência (d_tower quest FINALMENTE funciona!)
  ✅ Coliseu
  ✅ Olimpíada
```

### Nota Positiva
O Lv 40 tem mais justificativa contextual que o Lv 20 (mais sistemas chegando), mas o penhasco de 5.3x ainda é abrupto.

### Classificação
🟠 PROBLEMÁTICO — XP cliff severo mas com justificativa de transferência.

---

## BP-08: Lv 41–75 — Deserto de Skills (35 Níveis)
**Severidade:** P1 | **Tipo:** PROGRESSÃO INCOERENTE | **Sistema:** Skill System

### Dados Concretos
```
Skills Tier 2: disponíveis no Lv 40
Skills Tier 3: disponíveis no Lv 76

Gap: 35 NÍVEIS SEM NENHUM SKILL NOVO DE CLASSE

Mapeamento em echo-adapter.js:
  tier0 → reqLvl: 1
  tier1 → reqLvl: 20
  tier2 → reqLvl: 40
  tier3 → reqLvl: 76  ← 36 níveis depois do tier2!
```

### Impacto no Jogador
Imagine jogar 35 níveis de um RPG sem ganhar uma única habilidade nova. O indicador mais forte de progressão (novos poderes) está completamente ausente por **87.5% da distância entre a 2ª e 3ª transferência**.

Stats crescem, mas a identidade do personagem fica estagnada.

### Causa Raiz
`lineage-idle/data/echo-adapter.js` — falta de tier intermediário entre tier2 (Lv 40) e tier3 (Lv 76).

### Solução Proposta (não implementar)
Adicionar `tier2.5` com `reqLvl: 55` ou `reqLvl: 58` para quebrar o deserto no meio.

---

## BP-09: Lv 42 — Necropolis of Pilgrims (Pior Dead Content)
**Severidade:** P1 | **Tipo:** DEAD CONTENT | **Sistema:** Zone System

### Dados Concretos
```
Necropolis of Pilgrims (Lv 42):
  Avg XP/kill: 673

Black Citadel (Lv 40) — 2 níveis MENOR:
  Avg XP/kill: 4.760

Ratio: Necropolis 7.0x MENOS XP que zona de nível inferior!
```

**Esta é a pior zona do jogo em termos de eficiência relativa.**

---

## BP-10: Lv 76 — 3ª Transferência + Skills Flood
**Severidade:** P1 | **Tipo:** PROGRESSÃO INCOERENTE | **Sistema:** Class System + Skills

### Descrição
O Lv 76 é um grande evento positivo (3ª transferência, Skills Tier 3, Grade A gear), mas o **flood simultâneo de todos os Skills Tier 3** após 35 níveis de espera pode ser confuso ao invés de satisfatório.

### Dados Concretos
```
Skills esperando desde Lv 40: todos os tier3 de classe
Liberados no Lv 76: TODOS de uma vez (potencialmente 10–20 skills)

Grade A gear: reqLvl 76
Grade S gear: reqLvl 80 (apenas 4 níveis depois!)
```

### Impacto
- Flood de informação após longa espera
- Gap A→S de apenas 4 níveis (trivial depois do longo A grind)

---

## BP-11: Lv 85–86 — Penhasco XP Final
**Severidade:** P1 | **Tipo:** PROGRESSÃO INCOERENTE | **Sistema:** LevelEngine

### Dados Concretos
```
Lv 85 XP necessário: 4.360.000.000
Lv 86 XP necessário: 19.060.000.000
Multiplicador: 4.4x ← TERCEIRO MAIOR PENHASCO

Conteúdo novo no Lv 85–86: NENHUM
```

### Impacto
Muro de XP abrupto sem nenhum sistema, zona ou skill nova para justificá-lo. O jogador grinda a mesma zona com 4.4x mais custo por nível sem nenhuma recompensa de progressão.

---

## BP-12: Lv 95–96 — Fim do Conteúdo (Content Wall)
**Severidade:** P0 | **Tipo:** DEAD CONTENT | **Sistema:** Zone System

### Dados Concretos
```
Lv 95: Forge of Gods — ÚLTIMA ZONA DO JOGO
Lv 96: ☠️ NENHUMA ZONA
Lv 97-120: ☠️ NENHUMA ZONA, NENHUM BOSS, NENHUM SISTEMA NOVO

getSeasonMaxLevel(): retorna 120
Zonas existentes: ZERO acima de Lv 95
Gap: 25 NÍVEIS DE VOID COMPLETO
```

### Impacto no Jogador
Qualquer jogador que chegue ao Lv 96 literalmente não tem NADA para fazer. O jogo continua mostrando níveis disponíveis (até 120) mas não há conteúdo para progredir.

---

## BP-13: Lv 101 — XP Invertido (Bug Matemático)
**Severidade:** P0 | **Tipo:** PROGRESSÃO INCOERENTE | **Sistema:** LevelEngine

### Dados Concretos
```
XP por nível na faixa 85–105:
  Lv 85→86:  4.360.000.000 →  19.060.000.000  (4.4x ↑)
  Lv 90→91: 12.000.000.000 →  25.000.000.000  (2.1x ↑)
  Lv 95→96: 22.000.000.000 →  31.000.000.000  (1.4x ↑)
  Lv 99→100:29.000.000.000 →  33.200.000.000  (1.1x ↑)
  Lv 100→101:33.200.000.000 → 15.800.000.000  (-52% ← BUG!)
  Lv 101→102:15.800.000.000 → 16.600.000.000  (+5% ↑)
  Lv 102→103:16.600.000.000 → 17.400.000.000  (+5% ↑)
```

### Causa Raiz
```javascript
// LevelEngine.js — Lv 101+:
xpForLevel = 15000000000 + (lvl - 100) * 800000000
// Lv 101: 15.000.000.000 + 1 * 800.000.000 = 15.800.000.000
// vs Lv 100: 33.200.000.000 — QUEDA DE 52%!
```

A fórmula linear começa em um valor muito abaixo do último nível da fórmula anterior.

### Impacto no Jogador
O "hardest endgame" é matematicamente mais fácil de progredir por nível que o mid-late game Lv 85–100. A progressão regride ao invés de avançar no ponto mais crítico do jogo.

---

## BP-14: Lv 101–120 — Deserto Total de Conteúdo
**Severidade:** P0 | **Tipo:** DEAD CONTENT | **Sistema:** Zones + Raids + Skills

### Dados Concretos
```
Lv 101–120: 20 NÍVEIS CONSECUTIVOS SEM:
  ❌ Zonas de grind
  ❌ Monstros
  ❌ Bosses
  ❌ Raids
  ❌ Skills Tier 4+
  ❌ Gear Tier 7+
  ❌ Qualquer conteúdo novo

getSeasonMaxLevel(): 120 (promete 120 níveis)
Conteúdo real disponível: até Lv 95 (75 níveis)
Gap de "conteúdo prometido": 25 níveis (Lv 96–120)
```

---

## 📊 Tabela Consolidada de Breakpoints

| ID | Nível | Nome | Severidade | Tipo | Causa Principal |
|---|---|---|---|---|---|
| BP-01 | Lv 1 | Over-CP ao Nascer | P0 | CONTRADIÇÃO | StateManager DEFAULT_STATE |
| BP-02 | Lv 5–39 | Quests Prematuras | P0 | PREMATURO | quests.js unlock_level vs TAB_UNLOCK_LEVELS |
| BP-03 | Lv 7–9 | Orc Village XP Anomalia | P2 | PROGRESSÃO INCOERENTE | zones.js monster balance |
| BP-04 | Lv 20 | Penhasco XP 7.8x | P0/P1 | PROGRESSÃO INCOERENTE | LevelEngine.js fórmula |
| BP-05 | Lv 20–29 | Raids Tab Vazia 10 Níveis | P1 | PREMATURO | AppLayout.js TAB_UNLOCK_LEVELS |
| BP-06 | Lv 32 | Necropolis XP 5.5x menor | P1 | RECOMPENSA INADEQUADA | zones.js monster XP |
| BP-07 | Lv 40 | Penhasco XP 5.3x | P1 | PROGRESSÃO INCOERENTE | LevelEngine.js fórmula |
| BP-08 | Lv 41–75 | Deserto de Skills 35 Níveis | P1 | PROGRESSÃO INCOERENTE | echo-adapter.js tier mapping |
| BP-09 | Lv 42 | Necropolis XP 7.0x menor | P1 | DEAD CONTENT | zones.js monster XP |
| BP-10 | Lv 76 | Skills Flood pós-Deserto | P1 | PROGRESSÃO INCOERENTE | echo-adapter.js tier3 timing |
| BP-11 | Lv 85–86 | Penhasco XP 4.4x | P1 | PROGRESSÃO INCOERENTE | LevelEngine.js fórmula |
| BP-12 | Lv 96 | Content Wall Total | P0 | DEAD CONTENT | zones.js (inexistência) |
| BP-13 | Lv 101 | XP Invertido -52% | P0 | PROGRESSÃO INCOERENTE | LevelEngine.js fórmula linear |
| BP-14 | Lv 101–120 | Deserto Total 20 Níveis | P0 | DEAD CONTENT | zones.js + raids.js |

---

## Zonas de Progressão Saudável (Sem Breakpoints)

Nem tudo é problema. Estas faixas funcionam bem:

| Faixa | Status | Por que funciona |
|---|---|---|
| Lv 1–6 | ✅ Bom | Curva XP suave, zonas espaçadas adequadamente |
| Lv 8–19 | ✅ Bom | Progressão linear consistente, zona nova a cada 2–4 níveis |
| Lv 30–39 | ✅ Razoável | XP pesado mas consistente, Queen Ant disponível |
| Lv 40–75 | ⚠️ Parcial | XP OK mas skill desert prejudica a sensação de progressão |
| Lv 76–84 | ✅ Bom | 3ª transferência, skills Tier 3, gear A/S — ritmo bom |
| Lv 86–94 | ✅ Razoável | XP pesado mas conteúdo sólido |

---

## Distribuição de Severidade

| Severidade | Qtd | % | Descrição |
|---|---|---|---|
| P0 — Crítico | 5 | 36% | Quebram a experiência fundamentalmente |
| P1 — Muito Importante | 6 | 43% | Prejudicam fortemente a retenção |
| P2 — Importante | 3 | 21% | Inconsistências que pioram a experiência |
| **TOTAL** | **14** | **100%** | |

---

*Auditoria apenas — nenhuma alteração foi feita no projeto*
