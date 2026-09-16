# ADEN ARENA ⟷ LINEAGE II ESSENCE: CROSS-REFERENCE & DESIGN INTELLIGENCE

**Documento:** Relatório Técnico de Mapeamento Cruzado e Inteligência de Design  
**Fase:** Fase 2 — Da Coleta ao Design Estrutural  
**Data:** 16 de Setembro de 2026  
**Status:** CANÔNICO / AUDITADO / NÃO-INVASIVO  
**Regra Fundamental:** `LINEAGE II KNOWLEDGE ≠ ADEN ARENA CANON` (Extração de princípios de design, sem cópia automática de valores, sem contaminação do escopo da Season 1).

---

## 1. INTRODUÇÃO & OBJETIVOS ESTRATÉGICOS

A Fase 1 concluiu com êxito o levantamento documental factual de 39 artigos e catálogos das Knowledge Bases do **Lineage II Essence** (`docs/LINEAGE_II_KNOWLEDGE_EXTRACTION_REPORT.md` e `knowledge/lineage2/*.json`). 

O objetivo da presente Fase 2 é responder às questões centrais de produto e engenharia de jogos:
1. **O que aprendemos com o Lineage II?** Quais são as leis sistêmicas que tornam o Lineage II um dos ecossistemas de MMORPG mais duradouros da história?
2. **Quais conceitos resolvem gargalos existentes no Aden Arena?** (Ex.: excesso de itens sem função, quebra de elos entre refino e forja, desbalanceamento de consumo de tiros em arcos/magias).
3. **Quais sistemas já existem e devem ser aprofundados?** (Ex.: Life Activities 2.0, síntese de Dolls, forja de receitas).
4. **Quais mecânicas faltam e quais são completamente incompatíveis?**
5. **Quais ideias devem permanecer apenas como referência ou exigem investigação aprofundada?**

---

## 2. ADEN ARENA SYSTEM MAP (ESTADO ATUAL DO REPOSITÓRIO)

Com base na auditoria minuciosa do repositório (`src/`, `lineage-idle/`, `docs/` e contratos canônicos), o Aden Arena possui hoje a seguinte topologia de sistemas comprovadamente implementados no código:

```text
ADEN ARENA CORE ARCHITECTURE
├── CHARACTER & PROGRESSION
│   ├── Level & EXP Engine (LevelEngine.js, max Lv 120, Season 1 Cap Lv 40)
│   ├── Combat Power Engine (CombatPowerService.js — 14 eixos de cálculo de CP)
│   ├── Class Lineage & Specialization (CanonicalClassRegistryV2.js, 4 estágios)
│   ├── Skills Engine (CanonicalSkillRegistryV2.js, 160 skills ativas/passivas/buffs)
│   ├── Subclass Certification (SubclassCertificationService.js)
│   └── Noblesse Saga (NoblesseService.js, quest de Barakiel)
│
├── EQUIPMENT & PAPERDOLL
│   ├── Paperdoll Clássico (20 slots formais governados pelo MASTER_GAME_DATA_CONTRACT.md)
│   ├── Weapon & Armor Grades (No-Grade, D-Grade, C-Grade, B, A, S)
│   ├── Enchantment Engine (EnchantmentService.js — +1 a +16, limites seguros, cristalização)
│   ├── Soul Crystals / Special Abilities (CraftService.js — SA estágios 1 a 15)
│   ├── Augmentation / Life Stones (AugmentationService.js)
│   ├── Elemental Attribute System (ElementalService.js — Fogo, Água, Vento, Terra, Sagrado, Trevas)
│   ├── Weapon Resonance (WeaponResonanceService.js)
│   └── Brooches & Talismans (Talismans.js, Jewels.js)
│
├── LIFE ACTIVITIES & PRODUCTION
│   ├── Fishing System (FishingService.js — zonas, iscas, varas, minigame de tensão, auto-fish)
│   ├── Hunting System (HuntingService.js — presas, facas, iscagem, aproximação tática, curtume)
│   ├── Gathering System (GatheringService.js — flora, foices, bolsas, nós, fitoterapia)
│   ├── Mining System (MiningService.js — veios, picaretas, lamparinas, escoramento, prospecção)
│   ├── Refinery Service (RefineryService.js — bancada de refino de madeira, couros, pós e metais)
│   ├── Expedition Framework (ExpeditionService.js — mercenários, sinergias, dilemas morais)
│   ├── Manor System (ManorService.js — sementes, colheita agrícola e permuta provincial)
│   └── Classic Crafting (CraftService.js — 13 receitas ativas, critical craft, masterwork)
│
├── ECONOMY & COMMERCE
│   ├── Currencies Canônicas (Adena, Aden Coins, Ancient Adena, SP, CraftXp, Epaulettes)
│   ├── Merchant Guild Shop (ShopService.js — itens gerais, estoque místico com reroll)
│   ├── Cash & Donation Shop (CashShopService.js — starter packs, heirloom gear, cosméticos)
│   ├── P2P Auction Market (MarketService.js — mercado de Giran, taxa imperial de 5%, sync Cloud)
│   └── Alchemy Crucible (AlchemyService.js — dissolução de equipamentos por grade em essências)
│
└── CONTENT & CHALLENGES
    ├── Hunting Zones (zones.js — Zonas 1 a 5, balanceamento de monstros e KPM)
    ├── Daily Missions & Battle Pass (QuestService.js — cotas diárias e semanais)
    ├── Tower of Insolence (TowerService.js — escalada de andares)
    ├── Daily Raids (RaidService.js — 3 ingressos diários, instâncias e chefes épicos)
    ├── World Bosses (WorldBossService.js — invasões sincronizadas UTC: QA, Zaken, Baium, Antharas)
    ├── Colosseum / PvP Arena (ColosseumService.js — duelos assíncronos e ranking)
    ├── Seven Signs (SevenSignsService.js — catacumbas, necrópoles, Lilith/Anakim, Mammon)
    └── Territorial Fortresses (FortressService.js — cerco de fortalezas secundárias)
```

---

## 3. METODOLOGIA DE CROSS-REFERENCE

Para cada sistema ou mecânica documental encontrada na Knowledge Base do Lineage II Essence, aplicamos uma classificação de status e uma recomendação de ação de design:

### Classificação de Relação (Relationship Status)
- **`EXISTING`**: O Aden Arena já possui implementação funcional equivalente no repositório.
- **`PARTIAL`**: O Aden Arena possui a fundação ou estrutura de dados, mas a implementação está incompleta ou fragmentada.
- **`MISSING`**: O sistema não existe no código atual do Aden Arena.
- **`CONFLICTING`**: O conceito existe, mas a filosofia/design de implementação entra em choque com os contratos do Aden Arena.
- **`REDUNDANT`**: Adicionar o conceito criaria duplicação desnecessária com sistemas já estabelecidos.
- **`UNKNOWN`**: Não há evidências documentais ou técnicas suficientes para validar a compatibilidade.

### Classificação de Ação (Design Action)
- **`ALREADY SOLVED`**: O Aden Arena já resolveu essa necessidade com arquitetura adequada ou superior.
- **`ADAPT`**: O princípio de design é excelente e deve ser adaptado respeitando as especificidades de um idle RPG.
- **`REWORK`**: O sistema atual do Aden Arena precisa ser reestruturado conceitualmente utilizando o princípio da fonte.
- **`INVESTIGATE`**: Há grande potencial conceitual, mas exige prototipagem ou pesquisa complementar antes de aprovação.
- **`IGNORE`**: O conceito não agrega valor ao Aden Arena ou viola suas premissas essenciais.
- **`BLOCKED`**: Depende de sistemas ausentes que só pertencerão a temporadas futuras (ex.: Season 2 ou 3).

---

## 4. MATRIZ GERAL: LINEAGE II ⟷ ADEN ARENA CROSS-REFERENCE

| # | Conceito Lineage II Essence | Sistema Aden Arena Correspondente | Status no Aden Arena | Ação de Design | Impacto na Season 1 |
|:---:|:---|:---|:---:|:---:|:---:|
| **01** | **Universal Soulshots/Spiritshots** | `consumables.js` / `CombatSimulator.js` | `CONFLICTING` | `ADAPT` | **Alto** (Ajusta consumo por tipo de arma e AoE) |
| **02** | **Consumo AoE Escalonado (x1 a x3)** | Sistema de Dano em Área | `MISSING` | `ADAPT` | **Médio** (Balanceia classes com wave clear alto) |
| **03** | **Armor Set System (3/5 peças)** | `rarity_sets.js` / `EquipmentService.js` | `PARTIAL` | `ADAPT` | **Alto** (Desbloqueia bônus parciais de sets D/C) |
| **04** | **Safe Enchant (+3 armas / +4 armaduras)** | `EnchantmentService.js` | `EXISTING` | `ALREADY SOLVED` | **Neutro** (Já aderente aos contratos canônicos) |
| **05** | **Cristalização vs Destruição no Enchant** | `EnchantmentService.js` | `EXISTING` | `ALREADY SOLVED` | **Neutro** (Cristalização em Gemstones/Crystals já adotada) |
| **06** | **Soul Crystals (Ensoul Slots 1 & 2)** | `CraftService.js` (SA 1-15) | `PARTIAL` | `REWORK` | **Alto** (Checkpoints de segurança a cada 5 níveis) |
| **07** | **Life Stones & Augmentation** | `AugmentationService.js` | `EXISTING` | `ALREADY SOLVED` | **Baixo** (Implementado e funcional) |
| **08** | **Talismãs & Braceletes** | `talismans.js` / Paperdoll | `EXISTING` | `ALREADY SOLVED` | **Médio** (Slot ativo no Paperdoll) |
| **09** | **Broches & Joias (Ruby, Sapphire)** | `jewels.js` / Paperdoll | `EXISTING` | `ALREADY SOLVED` | **Médio** (Slot ativo no Paperdoll) |
| **10** | **Monster Dolls & Boss Dolls** | `lineage-idle` Dolls / Contrato CP | `PARTIAL` | `ADAPT` | **Alto** (Pity system de síntese contra streaks de azar) |
| **11** | **Common Craft (Universal Kill Charge)** | Sistema de Forja Idle | `MISSING` | `ADAPT` | **Crítico** (Converte abates em pergaminhos/recursos) |
| **12** | **Classic Dwarf Crafting (D/C Recipes)** | `CraftService.js` (13 receitas) | `PARTIAL` | `REWORK` | **Crítico** (Faltam 95% das receitas de equipamentos D/C) |
| **13** | **Refinery & Processamento** | `RefineryService.js` | `EXISTING` | `REWORK` | **Crítico** (Refino existe mas não tem sink na forja) |
| **14** | **Life Activities (Fish/Hunt/Mine/Gather)** | `LifeActivityCore.js` & Services | `EXISTING` | `ADAPT` | **Alto** (Atividades ricas mas desconectadas da forja) |
| **15** | **Expeditions & Mercenários** | `ExpeditionService.js` | `EXISTING` | `ALREADY SOLVED` | **Médio** (Sistema de dilemas e sinergias maduro) |
| **16** | **Manor System (Feudos e Sementes)** | `ManorService.js` | `PARTIAL` | `INVESTIGATE` | **Baixo** (Implementação embrionária, requer expansão) |
| **17** | **Collections (Queima Permanente de Gear)** | Metagame / Codex de Itens | `MISSING` | `ADAPT` | **Crítico** (Ralo vital para equipamentos obsoletos do idle) |
| **18** | **Aden Laboratory (Pesquisa de Stats)** | Pesquisa de Atributos | `MISSING` | `BLOCKED` | **Nenhum** (`[SEASON 1 OUT OF SCOPE]` — Lv 76+) |
| **19** | **Hidden Power (Dye Potential)** | `DyeService.js` | `PARTIAL` | `BLOCKED` | **Nenhum** (`[SEASON 1 OUT OF SCOPE]` — Pós-Awakening) |
| **20** | **Guardians (Pets com Bônus de Craft)** | `PetService.js` | `PARTIAL` | `ADAPT` | **Médio** (Afinidade por arma e aceleração de craft) |
| **21** | **Magic Lamp (Jackpots de EXP/SP)** | `magicLampBalance.js` | `PARTIAL` | `ADAPT` | **Alto** (Pacing de dopamina durante grind contínuo) |
| **22** | **World Trade / Mercado (10 slots, 5%)** | `MarketService.js` | `EXISTING` | `ADAPT` | **Médio** (Taxa imperial 5% existe; alinhar teto de lotes) |
| **23** | **Curva Monotônica de EXP (Lv 1–40)** | `LevelEngine.js` | `EXISTING` | `ALREADY SOLVED` | **Neutro** (Tabela canônica alinhada aos contratos) |
| **24** | **Queen Ant Raid (Pinnacle Boss S1)** | `WorldBossService.js` / `RaidService.js` | `EXISTING` | `ALREADY SOLVED` | **Neutro** (Chefe de fechamento da Season 1 no Lv 40) |

---

## 5. ANÁLISE SISTÊMICA DETALHADA: O QUE APRENDEMOS COM CADA DOMÍNIO

### 5.1 O Paradoxo da Forja e dos Drops: O Elo Perdido do Aden Arena
- **Lição do Lineage II**: No Lineage II clássico e no Essence, a economia é sustentada pelo fato de que equipamentos de ponta raramente caem prontos de monstros comuns. Monstros dropam matérias-primas (`Iron Ore`, `Coal`, `Animal Bone`) e fragmentos de receita (`Key Materials`), que são processados por artesãos ou forjados no Common Craft.
- **Diagnóstico no Aden Arena**: O Aden Arena possui um motor de Life Activities e Refino (`RefineryService.js`) altamente sofisticado, capaz de produzir `Steel`, `Crafted Leather`, `Coarse Bone Powder`, `Cord`, etc. Contudo, em `recipes_drops.js`, monstros comuns dropam equipamentos completos diretamente (`MONSTER_DROPS` possui centenas de armas e armaduras prontas), enquanto `CRAFTING_RECIPES` possui apenas 13 receitas ativas.
- **Princípio Extraído**: A atividade de coleta e mineração perde tração se o combate regular entrega o produto final já pronto sem esforço de montagem.
- **Decisão**: `REWORK`. O Aden Arena deve criar cadeias onde monstros comuns dropam recursos e peças-chave, e a forja de armas/armaduras D-Grade e C-Grade seja o meio primário de obtenção de equipamentos de qualidade superior.

### 5.2 O Papel Macroestabilizador das Coleções (Collections)
- **Lição do Lineage II Essence**: O sistema de Coleções do Essence é o maior ralo de equipamentos do jogo. Conforme o jogador evolui do Grau D para o C, suas armas antigas não viram ouro insignificante em NPCs; elas são permanentemente sacrificadas no catálogo de coleções para conceder +10 P.Atk, +15 Max HP ou +1% Crit Damage eternamente para todos os personagens da conta.
- **Diagnóstico no Aden Arena**: No Aden Arena, equipamentos obsoletos acumulam no inventário ou são vendidos em massa (`sellAllJunk` por 50% do valor base). Isso gera inflação monetária de Adena e remove o apego emocional a itens de graus anteriores.
- **Princípio Extraído**: Transformar lixo e itens intermediários em progresso permanente de metagame através do sacrifício definitivo.
- **Decisão**: `ADAPT`. Adaptar o modelo de Coleções para o Aden Arena Season 1 como um ralo orgânico para o excedente de itens do modo idle.

### 5.3 O Consumo Balanceado de Soulshots & Spiritshots
- **Lição do Lineage II Essence**: A Tabela canônica (`items_spiritshots_and_soulshots.html`) estabelece que:
  - Armas corpo a corpo de Grau NG a B consomem **1 tiro por golpe**.
  - Arcos consomem de **2 a 4 tiros por disparo** (compensando o alcance seguro e o alto dano por hit).
  - Habilidades que atingem múltiplos alvos (AoE) aplicam multiplicadores estritos: 1 a 3 alvos = x1; 4 a 8 alvos = x2; 9 a 16 alvos = x3.
- **Diagnóstico no Aden Arena**: Atualmente, o simulador de combate do Aden Arena trata o consumo de tiros de forma linear, desfavorecendo guerreiros de curto alcance e barateando excessivamente classes de arqueiros e magos de dano em área massivo.
- **Princípio Extraído**: Custo proporcional ao poder de projeção e alcance. Quem ataca à distância ou limpa telas inteiras deve gastar mais consumíveis para manter a sustentabilidade econômica.
- **Decisão**: `ADAPT`. Incorporar a regra canônica de consumo de tiros no `CombatSimulator.js` e nos loops do idle.

### 5.4 Checkpoints de Segurança na Síntese de Cristais e Pity em Dolls
- **Lição do Lineage II Essence**:
  - Em Soul Crystals (`items_soul_crystals.html`), a síntese possui patamares inquebráveis a cada 5 níveis (1 a 5 cai para 1; 6 a 10 cai para 6; 11 a 15 cai para 11). O jogador sabe que, ao atingir o Nível 6 ou 11, seu investimento nunca retrocederá além daquele marco.
  - Em Dolls (`items_dolls.html`), cada falha na fusão acumula pontos de piedade (*Guaranteed Compounding*) até atingir 100% de garantia.
- **Diagnóstico no Aden Arena**: Em jogos idle, perder semanas de progresso por uma sequência de 5 falhas consecutivas de RNG é a principal causa de abandono de jogadores (*churn*).
- **Princípio Extraído**: Proteção matemática contra a perda catastrófica de progresso.
- **Decisão**: `ADAPT`. Adotar checkpoints seguros de 5 em 5 níveis e acúmulo de pontos de pity em sistemas de síntese probabilística.

---

## 6. O QUE O ADEN ARENA JÁ FAZ MELHOR QUE O LINEAGE II

A auditoria comprova que o Aden Arena não é um mero clone defasado; em diversas áreas, a arquitetura do Aden Arena é **mais moderna, justa e elegante** que a do Lineage II original:

1. **Economia Não-Pretatória**: Enquanto o Lineage II Essence oficial é conhecido por mecanismos agressivos de monetização (gacha pesado, caixas promocionais diárias e venda direta de poder na loja), o Aden Arena fundamenta-se nos princípios do **Project Eva** e do **MASTER_GAME_DATA_CONTRACT.md**: respeito ao esforço do jogador, recompensas ganhas por horas de gameplay e moedas com funções semânticas estritas.
2. **Framework de Expedições com Dilemas Morais**: O `ExpeditionService.js` do Aden Arena supera qualquer sistema de expedição do Lineage II, combinando traços de mercenários, sinergias táticas de esquadrão e escolhas narrativas ramificadas (*Dilemmas*) que afetam os espólios.
3. **Profundidade Interativa nas Life Activities**:
   - A pesca do Aden Arena (`FishingService.js`) possui combate de linha em tempo real com estados de tensão, fadiga do peixe e ações táticas (`Reel`, `Yield`, `Force`, `Rest`).
   - A caça silvestre (`HuntingService.js`) possui rastreamento por direção do vento, iscagem e escolha de táticas de aproximação furtiva.
   - A mineração e coleta possuem perigos ambientais (*Hazards*) e mecânicas de escoramento de galerias.
4. **Governança Estrita de Combat Power (CP)**: O cálculo de CP no Aden Arena obedece ao contrato de **70% de poder nos equipamentos e no máximo 15% em colecionáveis/dolls**, impedindo desbalanceamentos absurdos onde sistemas auxiliares superam as armas principais.

---

## 7. MATRIZ DE DECISÕES DE ARQUITETURA

| Área de Design | Decisão Estratégica | Justificativa Técnica |
|:---|:---|:---|
| **Season 1 Scope (Lv 1–40)** | **CONGELAR RIGOROSAMENTE** | Sistemas A-Grade, S-Grade, Awakening e Aden Lab permanecem como referência para Seasons 2 e 3. |
| **Crafting & Drops** | **RECONECTAR CADEIAS QUEBRADAS** | Criar receitas canônicas D e C que consumam os materiais refinados da bancada de Life Activities. |
| **Shots Economy** | **ADOTAR CONSUMO ESCALONADO** | Balancear arcos (2–4 tiros) e magias AoE (x1 a x3) contra armas melee (1 tiro). |
| **Collections** | **PROJETAR MÓDULO S1** | Criar coleções de No-Grade e D-Grade para queimar surplus de itens dropados no idle. |
| **Common Craft** | **ADOTAR COMO FEATURE IDLE** | Implementar a barra de carga universal por abates para fabricação de pergaminhos. |
| **Dolls & Crystals** | **INCORPORAR PITY E CHECKPOINTS** | Checkpoints a cada 5 níveis de cristal e pity bar determinística em fusão de dolls. |

---
**Fim do Documento.**
