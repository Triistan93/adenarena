# ⚙️ AUDITORIA DE COERÊNCIA DE SISTEMAS — Aden Arena
## Análise Sistema a Sistema: Design, Implementação, Integração e Problemas

**Data da Auditoria:** Setembro 2026
**Total de Sistemas Analisados:** 28
**Metodologia:** Análise forense de código-fonte + testes de integração via scripts

---

## Como Ler Este Relatório
- 🟢 COERENTE — Sistema funciona, bem posicionado e integrado
- 🟡 QUESTIONÁVEL — Funciona mas com falhas de design ou timing
- 🟠 PROBLEMÁTICO — Bugs, incoerências graves ou danos à progressão
- 🔴 SEM NEXO — Quebrado, dead content, sem propósito claro

---

## S01 — Progressão de Nível e XP
**Status:** 🟠 PROBLEMÁTICO | **Arquivo Principal:** `LevelEngine.js`

**Propósito:** Definir o custo de XP por nível e recompensar o jogador com SP ao subir.

**Implementação encontrada:**
- 5 faixas de fórmula distintas por range de nível:
  - Lv 1–19: `100 * lvl * (1 + lvl * 0.05)` — progressão quadrática suave
  - Lv 20–39: multiplicador adicional de classe (quadrático)
  - Lv 40–84: fórmula cúbica
  - Lv 85–100: fórmula quártica
  - Lv 101–120: **linear** `15000000000 + (lvl-100) * 800000000` — BUG CRÍTICO
- SP rewards: 8 + floor(nivel * 0.3) SP por nível
- `checkLevelUp()` gerencia ganho de XP e level up

**Problemas:**
- P0 — **XP INVERTIDO Lv 101**: Lv 100→101 exige 33.2B XP, mas Lv 101→102 exige apenas 15.8B (-52%)
- P1 — **3 Penhascos de XP**: Lv 20→21 (7.8x), Lv 40→41 (5.3x), Lv 85→86 (4.4x)
- P1 — **Season Cap inconsistente**: Season 1 = Lv 40 mas `getSeasonMaxLevel()` retorna 120 hardcoded
- P2 — Sem sistema de "rested XP" ou multiplicadores de catch-up para novos jogadores

**Interações com Outros Sistemas:** Class System (transferências em Lv 20/40/76), Zone System (CP gate por zona), Skill System (tier unlocks por nível)

**Recomendação (não implementar):** Corrigir fórmula Lv 101+ para exponencial; suavizar penhascos com fator transition; conectar `getSeasonMaxLevel()` ao SeasonConfig.

---

## S02 — Classes e Transferência de Classe
**Status:** 🟡 QUESTIONÁVEL | **Arquivo:** `CharacterService.js` + `classes_echo_defs.js`

**Propósito:** Definir arquétipos de personagem e permitir especialização progressiva em 3 etapas.

**Implementação encontrada:**
- `checkClassAdvancement()` verificada em: Lv 20, Lv 40, Lv 76
- Arquivo `classes_echo_defs.js`: 305KB com definições completas de todas as classes
- Sistema de 3 transferências alinhado com Skills Tier 1/2/3 (Lv 20/40/76)
- Transferências funcionam corretamente

**Problemas:**
- P1 — Skills Tier 2 disponíveis no Lv 40, próximas (Tier 3) apenas Lv 76 → **35 níveis de gap** entre 2ª e 3ª transferência sem evolução de skills
- P2 — Nenhuma pré-visualização das habilidades da classe alvo antes de escolher transferência
- P3 — DEFAULT_STATE tem clan.level:1 que contribui para over-CP ao nascer

**Interações:** LevelEngine (lock por level), Skill System (tiers), CP System (classe afeta CP base)

---

## S03 — Skill System
**Status:** 🟠 PROBLEMÁTICO | **Arquivo:** `echo-adapter.js` + `classes_echo_defs.js`

**Propósito:** Prover habilidades ativas/passivas que crescem com a classe e o nível.

**Implementação encontrada:**
- Skills geradas **dinamicamente** em runtime por `echo-adapter.js` lendo `CLASSES_ECHO`
- Mapeamento tier→reqLvl: `tier0=Lv1, tier1=Lv20, tier2=Lv40, tier3=Lv76`
- Skills compartilhadas e skills específicas de classe coexistem
- Geração funciona corretamente

**Problemas:**
- P1 — **DESERTO DE SKILLS Lv 41–75**: 35 níveis consecutivos sem nenhum skill novo de classe
- P1 — Tier 3 disponível apenas no Lv 76: flood simultâneo de skills após longa espera (confuso)
- P2 — Nenhum tier intermediário (ex: tier 2.5 por volta do Lv 55–60)
- P3 — Skills compartilhadas entre classes podem diluir a identidade de cada classe

**Interações:** Class System (tiers por transferência), LevelEngine (reqLvl de cada tier), CP System (skills equipadas afetam CP)

**Recomendação:** Adicionar tier 2.5 com reqLvl=55–58 para quebrar o deserto de 35 níveis.

---

## S04 — Equipamentos, Grades e Tier System
**Status:** 🟡 QUESTIONÁVEL | **Arquivo:** `items/index.js` + `progressionBalance.js`

**Propósito:** Fornecer equipamentos progressivos com tiers de qualidade alinhados à progressão de nível.

**Implementação encontrada:**
- 6 grades: NG/D/C/B/A/S
- Level requirements oficiais: NG=1, D=20, C=40, B=52, A=76, S=80
- `ALL_ITEMS` composição por merge de múltiplos arquivos de itens
- Sistema de tiers bem estruturado conceitualmente

**Problemas:**
- P2 — **1.086 itens com `grade: 'ng'`** incluem itens com `reqLvl` até **90** (contraditório — grade mais básica com requisito de endgame)
- P2 — **Tier 4.5** existe (reqLvl = 61) — tier não-padrão entre B (52) e A (76), sem documentação
- P2 — C-Grade reqLvl = 40 e B-Grade reqLvl = 52 → gap de apenas 12 níveis entre C e B (muito comprimido)
- P2 — Grade S começa Lv 80 mas A começa Lv 76 → apenas 4 níveis entre A e S (trivial)
- P3 — Sem sistema de enhancement/reforge funcional integrado ao tier system

**Interações:** CP System (gear afeta CP via CP_WEIGHTS), Zone System (CP gates por zona), Economy (custo de gear)

---

## S05 — Inventário e Slots
**Status:** 🟠 PROBLEMÁTICO | **Arquivo:** Shop/Inventory code

**Propósito:** Gerenciar itens do jogador com sistema de slots organizado.

**Implementação encontrada:**
- `SHOP_INVENTORY` estrutura definida no código de shop
- Slots de equipamento (arma, armadura, acessórios)

**Problemas:**
- P0 — **SHOP_INVENTORY BUG ESTRUTURAL**: Itens armazenados como **strings** (ex: `"potion_hp"`) sendo iteradas como arrays de caracteres, gerando 127 phantom IDs de 1 caractere: `"p"`, `"o"`, `"t"`, `"i"`, `"o"`, `"n"`, `"_"`, `"h"`, `"p"`...
- P2 — Inventário inicial completamente vazio — sem kit de boas-vindas no primeiro login
- P3 — Sem indicação de quantidade máxima de slots ou aviso de inventário cheio

---

## S06 — Combate e Fórmulas
**Status:** 🟢 COERENTE | **Arquivo:** `main.js` (Lv 5141+, Lv 4848+) + `combatBalance.js`

**Propósito:** Resolver o resultado de ataques do jogador contra monstros.

**Implementação encontrada:**
- `attackMonster()` em main.js linha 5141
- `dealDamage()` em main.js linha 4848
- `calculateDefenseMitigation()`: fórmula `k/(def+k)` onde k=250 físico, k=220 mágico
- Fórmula elegante e matematicamente sólida — mitiga de forma assintótica sem cap duro

**Avaliação:** Sistema de combate é o mais robusto do jogo. A fórmula k/(def+k) é uma das melhores abordagens para mitigação de defesa em idle RPGs.

**Problemas menores:**
- P3 — Auto-combat parece não ter ajuste dinâmico de estratégia por tipo de monstro
- P3 — Críticos não aparecem visivelmente diferenciados no log de combate

**Interações:** Monster System (stats de monstros), CP System (poder do jogador vs. dificuldade da zona), Zone System (CP gates)

---

## S07 — CP (Combat Power)
**Status:** 🟠 PROBLEMÁTICO | **Arquivo:** `CombatPowerService.js` + `cpBalance.js`

**Propósito:** Quantificar o poder do jogador como métrica central de progressão e gating de conteúdo.

**Implementação encontrada:**
- `CombatPowerService` delega para `cpBalance.calculateDetailedCombatPower()`
- `CP_WEIGHTS` define peso de cada componente
- Componentes: gear, skills, stats, clan, talisman, bracelet, noblesse, etc.

**Problemas:**
- P0 — **OVER-CP AO NASCER**: DEFAULT_STATE inicializa com talisman_power + bracelet_steel + clan.level:1 → **1.750 CP no Lv 1** quando deveria ser ~280
- P0 — `ZONE_CP_REQUIREMENTS`: talkingIsland=200, elvenForest=500, darkForest=800 → trivializadas desde o nascimento
- P2 — CP não exibe breakdown detalhado ao jogador (impossível saber de onde vem o CP)
- P2 — Weights de clan e fortress são ativos mesmo sem o jogador ter interagido com esses sistemas

---

## S08 — Zonas e Mapa de Progressão
**Status:** 🟡 QUESTIONÁVEL | **Arquivo:** `zones.js`

**Propósito:** Fornecer ambientes de grind progressivos com monstros e bosses temáticos.

**Implementação encontrada:**
- 31 zonas totais, de Talking Island (Lv 1) a Forge of Gods (Lv 95)
- Cada zona: `id`, `name`, `reqLvl`, `monsters[]`, `boss`
- CP gates via `ZONE_CP_REQUIREMENTS` em `progressionBalance.js`

**Problemas:**
- P0 — **ZERO zonas para Lv 96–120** (25 níveis de dead content)
- P1 — Necrópoles/Catacumbas: 4–7x menos XP que zonas principais equivalentes
- P2 — Orc Village (Lv 7): ratio XP/HP = 0.162 vs Dwarven Mine (Lv 9): 0.398 (2.46x mais eficiente)
- P3 — Algumas zonas com temática repetitiva (múltiplas "forest" sem diferenciação visual clara)

---

## S09 — Monstros e Balance
**Status:** 🟡 QUESTIONÁVEL | **Arquivo:** `zones.js` (monstros dentro das zonas)

**Propósito:** Oferecer resistência proporcional ao nível do jogador com XP e gold recompensando o esforço.

**Problemas:**
- P2 — Orc Village anomalia HP/XP (documentado em S08)
- P2 — Necrópoles: monstros com HP alto mas XP muito baixo
- P3 — Sem variação de mecânica entre tipos de monstro (todos são "soco até morrer")
- P3 — Elites não têm mecânica diferenciada além de mais HP/ATK

---

## S10 — Raid Bosses
**Status:** 🟠 PROBLEMÁTICO | **Arquivo:** `raids.js`

**Propósito:** Fornecer desafios de alto nível com recompensas exclusivas, incentivando progressão regular.

**Implementação encontrada:**
- 8+ raids definidas com `reqLvl`, `lvl`, `drops[]`
- Queen Ant (Lv 30), Orfen (Lv 45), Core (Lv 50), Zaken (Lv 60), Baium (Lv 75), Antharas (Lv 80), Valakas (Lv 85), Barakiel (Lv 90+)
- Raids de raid cooldown e sistema de drops

**Problemas:**
- P0 — **`adena_coins`** referenciado em TODOS os 8 drop tables → ID não existe em ALL_ITEMS
- P0 — Barakiel: `staff_goddess_rain_song`, `staff_of_gods` → não existem em ALL_ITEMS
- P1 — Raids Tab abre Lv 20 mas primeiro raid (Queen Ant) é Lv 30 → 10 níveis de tab vazia
- P2 — ZERO raids para Lv 91–120

---

## S11 — Quests (Diárias/Semanais)
**Status:** 🟠 PROBLEMÁTICO | **Arquivo:** `quests.js`

**Propósito:** Fornecer objetivos diários e semanais com loop de reengajamento e recompensas de progressão.

**Implementação encontrada:**
- 5 quests diárias: d_zone, d_raid, d_craft, d_tower, d_boss
- Semanais: w_zone, w_raid, w_boss
- `DAILY_COMPLETION_BONUS`: baú especial ao completar todos os 5 diários

**Problemas:**
- P0 — `d_craft` (type:'craft') unlocks Lv 5 mas Forge Tab é Lv 10 → 5 níveis bloqueado
- P0 — `d_tower` (type:'tower') unlocks Lv 5 mas Tower Tab é Lv 40 → **35 níveis bloqueado**
- P0 — `DAILY_COMPLETION_BONUS` exige todos os 5 incluindo tower → baú inacessível até Lv 40
- P2 — Quests semanais sem escalonamento de recompensa por tier de jogador

---

## S12 — Battle Pass
**Status:** 🟡 QUESTIONÁVEL | **Arquivo:** Battle Pass data

**Propósito:** Sistema de missões de temporada com recompensas progressivas.

**Problemas:**
- P2 — Missões do Battle Pass podem ter dependências dos mesmos sistemas com problemas (tower, craft)
- P3 — Sem indicação de expiração ou urgência de tempo no Battle Pass

---

## S13 — Starter Journey (Onboarding)
**Status:** 🔴 SEM NEXO | **Arquivo:** `StarterJourneyService.js`

**Propósito:** Guiar o jogador pelos 7 primeiros sistemas do jogo.

**Implementação encontrada:**
- 7 passos de onboarding progressivos
- Recompensas em cada passo para incentivar conclusão

**Problemas:**
- P0 — **Step 2 rewards `scrl_enchant_wp_d`** → ID não existe em ALL_ITEMS
- P0 — **Step 3 rewards `ls_mid_76`** → ID não existe em ALL_ITEMS
- P0 — **Step 6**: verifica `clan.name !== 'Os Guardiões de Aden'` mas DEFAULT_STATE = exatamente esse nome → **matematicamente impossível de completar**
- P2 — Sem tutorial de CP (o sistema mais importante do jogo não é explicado)
- P2 — Nenhum passo cobre a Torre da Insolência ou Olimpíada

---

## S14 — Shop e Economia
**Status:** 🟡 QUESTIONÁVEL | **Arquivo:** Shop data

**Propósito:** Permitir aquisição de itens com gold e moedas especiais.

**Problemas:**
- P0 — SHOP_INVENTORY bug estrutural (strings iteradas char-a-char, 127 phantom IDs)
- P2 — Sem indicação clara de qual moeda usar para cada tipo de item

---

## S15 — Gold e Moedas
**Status:** 🟡 QUESTIONÁVEL | **Arquivos:** `quests.js`, economy data

**Propósito:** Fornecer sistema econômico com múltiplas moedas para diferentes sistemas.

**Moedas identificadas:** Gold (principal), SP, Ancient Adena, Olympiad Tokens, Adena

**Problemas:**
- P1 — `adena_coins` referenciado em raids mas não existe em ALL_ITEMS (qual é o ID correto?)
- P2 — Distribuição de gold por quests não escala proporcionalmente com custo de gear por tier
- P2 — Múltiplas moedas sem tutorial claro de quando usar cada uma

---

## S16 — Crafting (Forja)
**Status:** 🟡 QUESTIONÁVEL | **Arquivo:** craft/forge data

**Propósito:** Permitir criação de equipamentos via receitas com materiais coletados.

**Problemas:**
- P0 — Recipes referenciam `weapon_orfen_dagger`, `jewel_baium_ring` → não existem em ALL_ITEMS
- P1 — Forge Tab abre Lv 10 mas quest d_craft desbloqueia no Lv 5 (5 níveis antes)
- P2 — Sem indicação de quais materiais dropam em quais zonas

---

## S17 — Enchantment / Reforge
**Status:** 🟡 QUESTIONÁVEL | **Arquivo:** Enchant system

**Propósito:** Melhorar itens além de seu nível base via encantamento.

**Problemas:**
- P1 — Itens de encantamento (scroll_enchant_weapon_a, scroll_enchant_weapon_s) no Mammon Merchant não existem em ALL_ITEMS
- P2 — Sem indicação clara de chance de sucesso/falha ao jogador
- P3 — Sem sistema de proteção ou seguro de item

---

## S18 — Códex
**Status:** 🟢 COERENTE | **Arquivo:** codex data

**Propósito:** Registrar monstros, itens e bosses encontrados pelo jogador.

**Avaliação:** Sistema funciona conforme esperado. Abre no Lv 1.

**Problemas menores:**
- P3 — Códex não indica quais itens ainda precisam ser coletados

---

## S19 — Dolls
**Status:** 🔴 SEM NEXO | **Arquivo:** doll system

**Propósito:** Sistema de bonecas/artefatos com buffs especiais para o personagem.

**Problemas:**
- P1 — Tab abre no **Lv 1** mas todo conteúdo relevante (boss dolls, clan dolls, siege dolls) bloqueado atrás da Season 2 (não ativa)
- P1 — Jogador vê aba vazia ou quase vazia desde o início do jogo
- P2 — Sem indicação de quando Season 2 será ativada ou o que desbloqueia

---

## S20 — Torre da Insolência
**Status:** 🟡 QUESTIONÁVEL | **Arquivo:** tower system

**Propósito:** Desafio de progressão por andares com recompensas crescentes.

**Problemas:**
- P0 — Quest d_tower disponível no Lv 5 mas Torre só abre no Lv 40
- P2 — Sem indicação de andares máximos ou progressão esperada por nível

---

## S21 — Coliseu
**Status:** 🟢 COERENTE | **Arquivo:** colosseum data
- Abre Lv 40 (alinhado com 2ª transferência)
- Desafio PvE de arena adequado para o mid-game

---

## S22 — Olimpíada
**Status:** 🟡 QUESTIONÁVEL | **Arquivo:** `olympiad.js`

**Propósito:** Competição PvP sazonal com recompensas de prestígio.

**Problemas:**
- P1 — Olympiad Shop: `giants_codex`, `blessed_scroll_weapon_s`, `blessed_scroll_armor_s` → não existem em ALL_ITEMS
- P2 — Recompensas de prestígio (Olympiad Tokens) sem uso claro se shop está quebrado

---

## S23 — Seven Signs
**Status:** 🟠 PROBLEMÁTICO | **Arquivo:** `seven_signs.js`

**Propósito:** Sistema sazonal de facções com Mammon Merchant de itens especiais.

**Problemas:**
- P1 — Mammon Merchant Catalog: `scroll_enchant_weapon_a`, `scroll_enchant_weapon_s`, `giants_codex_mastery`, `life_stone_top_76`, `ancient_dye_str_con`, `ancient_dye_int_men` → não existem em ALL_ITEMS
- P1 — Sistema de facções (Seal of Seraphim vs Dawn) pode estar sem conteúdo funcional

---

## S24 — Fortalezas
**Status:** 🟡 QUESTIONÁVEL | **Arquivo:** fortress system

**Propósito:** Controle de território com recompensas de talisman e bracelet.

**Problemas:**
- P0 — DEFAULT_STATE equipa `talisman_power` e `bracelet_steel` desde o Lv 1 → contribui para over-CP
- P2 — Sistema de siege de fortaleza pode estar incompleto (Season 2 content)

---

## S25 — Clan
**Status:** 🔴 SEM NEXO | **Arquivo:** `StateManager.js` + clan system

**Propósito:** Sistema de guilds com benefícios progressivos para membros.

**Problemas:**
- P0 — DEFAULT_STATE: `clan.name: 'Os Guardiões de Aden'`, `clan.level: 1` desde Lv 1 (antes do unlock real no Lv 20)
- P0 — Contribui diretamente para o Over-CP bug via CP_WEIGHTS
- P0 — Bloqueia StarterJourney Step 6 permanentemente
- P1 — Narrativamente incoerente: jogador "não tem clan" visualmente mas tem no estado interno

---

## S26 — Auto-Combat e Idle/Offline
**Status:** 🟢 COERENTE | **Arquivo:** main.js (combat loop)

**Propósito:** Permitir progressão automática (idle) enquanto o jogador está offline.

**Avaliação:** Loop de auto-combat funciona via `attackMonster()`. Sistema idle opera corretamente.

**Problemas menores:**
- P3 — Sem relatório detalhado do que aconteceu durante período offline

---

## S27 — Noblesse
**Status:** 🟡 QUESTIONÁVEL | **Arquivo:** noblesse system

**Propósito:** Status especial desbloqueado via quest pós-3ª transferência com benefícios únicos.

**Problemas:**
- P1 — DEFAULT_STATE inicializa noblesse com valores pré-populados antes do jogador fazer a quest
- P2 — Benefícios de noblesse não claramente comunicados ao jogador

---

## S28 — Magic Lamp
**Status:** 🟡 QUESTIONÁVEL | **Arquivo:** magic lamp system

**Propósito:** Sistema de recompensas aleatórias (gacha) com Magic Lamp Points.

**Problemas:**
- P1 — Abre no Lv 20 sem nenhum tutorial ou explicação ao jogador
- P2 — Taxa de drops não documentada na UI

---

## 📊 Tabela Resumo de Sistemas

| Sistema | Status | Unlock Lv | P0 | P1 | P2 | Observação |
|---|---|---|---|---|---|---|
| S01 XP/Níveis | 🟠 | 1 | 1 | 2 | 1 | XP invertido Lv101 |
| S02 Classes | 🟡 | 1/20/40/76 | 0 | 1 | 1 | Skill desert |
| S03 Skills | 🟠 | 1/20/40/76 | 0 | 2 | 1 | 35-level desert |
| S04 Gear | 🟡 | 1 | 0 | 0 | 4 | NG items até Lv90 |
| S05 Inventário | 🟠 | 1 | 1 | 0 | 1 | Shop string bug |
| S06 Combate | 🟢 | 1 | 0 | 0 | 0 | Sistema sólido |
| S07 CP | 🟠 | 1 | 1 | 0 | 2 | Over-CP Lv1 |
| S08 Zonas | 🟡 | 1 | 1 | 2 | 1 | 25 níveis vazios |
| S09 Monstros | 🟡 | 1 | 0 | 0 | 2 | XP anomalias |
| S10 Raids | 🟠 | 20 | 1 | 2 | 0 | adena_coins quebrado |
| S11 Quests | 🟠 | 5 | 2 | 0 | 1 | d_tower 35 níveis |
| S12 Battle Pass | 🟡 | 1 | 0 | 0 | 1 | Dependências quebradas |
| S13 Onboarding | 🔴 | 1 | 2 | 0 | 2 | Step 6 impossível |
| S14 Shop | 🟡 | 1 | 1 | 0 | 1 | String bug |
| S15 Economia | 🟡 | 1 | 0 | 1 | 2 | adena_coins inexistente |
| S16 Crafting | 🟡 | 10 | 1 | 1 | 1 | Recipes quebradas |
| S17 Enchant | 🟡 | 20 | 0 | 1 | 2 | Scrolls inexistentes |
| S18 Códex | 🟢 | 1 | 0 | 0 | 0 | Funciona bem |
| S19 Dolls | 🔴 | 1 | 0 | 2 | 1 | Season 2 content |
| S20 Torre | 🟡 | 40 | 1 | 0 | 1 | Quest prematuro Lv5 |
| S21 Coliseu | 🟢 | 40 | 0 | 0 | 0 | Bem posicionado |
| S22 Olimpíada | 🟡 | 40+ | 0 | 1 | 1 | Shop quebrado |
| S23 Seven Signs | 🟠 | varies | 0 | 2 | 0 | Mammon sem itens |
| S24 Fortalezas | 🟡 | varies | 1 | 0 | 1 | Contribui over-CP |
| S25 Clan | 🔴 | 20 | 2 | 1 | 0 | Default state quebrado |
| S26 Auto-Combat | 🟢 | 1 | 0 | 0 | 1 | Idle funciona |
| S27 Noblesse | 🟡 | 76 | 0 | 1 | 1 | Pre-populado |
| S28 Magic Lamp | 🟡 | 20 | 0 | 1 | 1 | Sem tutorial |

---

## Mapa de Dependências Críticas

```
DEFAULT_STATE (StateManager.js)
  ├── clan.level:1 → CP System → Over-CP Bug (P0)
  ├── equippedTalismans → CP System → Over-CP Bug (P0)
  ├── equippedBracelet → CP System → Over-CP Bug (P0)
  └── clan.name:'Os Guardiões de Aden' → StarterJourney Step 6 IMPOSSÍVEL (P0)

LevelEngine.js
  ├── Lv 20 cliff (7.8x) → XP System P1
  ├── Lv 40 cliff (5.3x) → XP System P1
  ├── Lv 85 cliff (4.4x) → XP System P1
  └── Lv 101 linear formula → XP INVERSION P0

quests.js
  ├── d_craft unlock Lv5 → depends on Forge (Lv10) = PREMATURO P0
  └── d_tower unlock Lv5 → depends on Tower (Lv40) = PREMATURO P0

echo-adapter.js
  └── tier2=Lv40 → tier3=Lv76 = 35-LEVEL SKILL DESERT P1

zones.js
  └── ZERO zones Lv96-120 = DEAD CONTENT P0
```

---

*Auditoria apenas — sem alterações no projeto*
*Análise baseada em código-fonte, não em runtime*
