# 📜 ADEN ARENA IDLE — MASTER GAME DATA CONTRACT
**Versão:** 1.0 (Oficial) · **Status:** Aprovado como Diretriz Canônica · **Data:** 2026-09-12

---

## 1. INTRODUÇÃO & REGRA DE OURO DA ENGENHARIA DE DADOS

O **MASTER GAME DATA CONTRACT** é o documento que estabelece a **semântica, esquemas de dados, tipagem, limites de poder e regras ontológicas** de todos os objetos e entidades do *Aden Arena Idle*.

> [!CRITICAL]
> **REGRA DE OURO: PROIBIÇÃO DE CRIAÇÃO AUTOMÁTICA DE CONTEÚDO (NO SILENT CONTENT INVENTIONS)**
> Nenhum agente ou engenheiro de software pode inventar habilidades, itens, moedas ou mecânicas arbitrárias durante a implementação de código para preencher lacunas.
> Se durante a implementação de um nível ou classe for detectada a falta de dados, a implementação deve declarar formalmente um **CONTENT GAP**:
> ```text
> [CONTENT GAP]
> Entidade: Classe / Item / Sistema
> Identificador: [ID Alvo]
> Marco / Nível: [ex: Lv 55]
> Arquétipo Requerido: [ex: Fire Signature / Tank Taunt]
> Status: MISSING DESIGN (Requer decisão de Game Design antes da codificação)
> ```

---

## 2. SEMÂNTICA DE MOEDAS & RECURSOS (CURRENCY SEMANTICS)

O jogo opera sob um conjunto fechado de moedas e recursos canônicos. Cada recurso tem destino, armazenamento e restrições semânticas precisas:

| Identificador | Nome em Tela | Tipo Semântico | Localização no State | Empilhável? | Negociável? | Fontes Primárias | Destino de Consumo |
|:---|:---|:---|:---|:---:|:---:|:---|:---|
| `gold` / `adena` | **Adena** 🪙 | Moeda Padrão | `state.gold` (numérico) | Sim (ilimitado) | Sim (Mercado) | Caçadas, Venda de itens, Quests | Loja de Poções, Forja, Encantamento |
| `adena_coins` | **Aden Coins (AC)** 💎 | Moeda Premium / Raid | `state.adenCoins` (numérico) | Sim | Não | Raids Mundiais, World Bosses, Doações | Cash Shop Oficial, Cosméticos, Passes |
| `ancient_adena` / `aa` | **Ancient Adena (AA)** 🏛️ | Moeda dos Sete Selos | `state.sevenSigns.ancientAdena` | Sim | Sim | Troca de Seal Stones com Priest of Dawn | Mercador & Ferreiro de Mammon |
| `sp` | **Skill Points (SP)** ✦ | Recurso de Habilidades | `state.sp` (numérico) | Sim | Não | Monstros, Chefes, Recompensas de Quests | Aprendizado e Nível de Habilidades |
| `craftPoints` / `craftXp` | **Pontos de Forja** ⚒️ | Progresso de Profissão | `state.craftXp` (numérico) | Sim | Não | Desmanche / Reciclagem de Equipamentos | Desbloqueio de Tiers de Criação Real |
| `dailyRaidTickets` | **Ingressos de Raid** 🎟️ | Recurso de Acesso Diário | `state.dailyRaidTickets` (max: 3) | Não | Não | Reset Diário (3 por dia às 00:00) | Desafio a Epic Raid Bosses Diários |
| `epaulettes` | **Knight's Epaulettes** 🎖️ | Moeda de Fortaleza | `state.fortresses.epaulettes` | Sim | Não | Defesa e Conquista de Fortalezas | Comerciante de Fortaleza (Talismãs) |

### Regra Estrita de Integridade:
- `adena_coins` **NUNCA** deve ser convertida para `adena` comum em tempo de execução. Se um drop contiver `adena_coins`, o serviço deve invocar `state.adenCoins += count` e registrar o ganho com badge de raridade lendária (`isAC: true`).
- `adena` padrão como item físico (`slot: 'material'`) é uma representação de inventário apenas quando dropada em pacotes; ao entrar no inventário, é absorvida diretamente em `state.gold`.

---

## 3. SEMÂNTICA DE ITENS & CATEGORIZAÇÃO DE SLOTS (ITEM SEMANTICS)

Todo item registrado no catálogo canônico `ALL_ITEMS` pertence obrigatoriamente a uma das duas grandes categorias: **Equipamento (Paperdoll)** ou **Item de Suporte / Consumo / Missão**.

### 3.1. Equipamentos do Paperdoll Clássico (Exatamente 20 Slots)
Qualquer item que possua atributos combativos diretos deve apontar para um dos slots formais do Paperdoll:
- **Armas:** `weapon` (Mão Primária), `weapon2` (Mão Secundária / Dual / Escudo)
- **Armaduras Principais:** `helmet` (Cabeça), `chest` (Peito), `legs` (Pernas), `gloves` (Luvas), `boots` (Botas)
- **Acessórios de Defesa Mágica (Joias):** `necklace` (Colar), `earring1` / `earring2` (Brincos), `ring1` / `ring2` (Anéis)
- **Acessórios de Poder / Utilitários:** `cloak` (Capa), `belt` (Cinto), `hair1` / `hair2` (Acessórios Visuais / Tiaras)
- **Artefatos Especiais:** `brooch` (Broche de Joias), `agathion_bracelet` (Bracelete de Agathion), `talisman_bracelet` (Bracelete de Talismãs)

### 3.2. Itens de Suporte, Consumo e Missão (Não Equipáveis)
- **`slot: 'quest'` (Itens de Missão):**
  - **Exemplo Canônico:** `staff_goddess_rain_song` (Cajado da Deusa Barakiel).
  - **Regras:** Não equipável, não vendível na loja comum, não transferível via mercado, drop garantido 100% sob a respectiva etapa de quest.
- **`slot: 'currency'` (Moedas Físicas / Fichas):**
  - **Exemplo Canônico:** `adena_coins`, `ancient_adena`.
  - **Regras:** Empilhável, aciona incremento direto na carteira do estado.
- **`slot: 'consumable'` / `'potion'` / `'scroll'`:**
  - Poções de Vida/Mana (`hp_potion_s/m/l/xl`, `mp_potion_s/m/l/xl`).
  - Pergaminhos de Encantamento (`scroll_of_enchant_weapon`, `scroll_blessed_weapon`, etc.).
  - Soulshots & Spiritshots (`soulshot_ng/d/c/b/a/s`).
- **`slot: 'material'` (Materiais de Forja):**
  - Minérios, couros, fios e Cristais de Cristalização (`crystal_d/c/b/a/s`).
- **`slot: 'spellbook'` (Grimórios de Habilidade):**
  - Tomos Sagrados de 1★ a 4★ utilizados para aprender habilidades avançadas.
  - Tomo 4★ é **exclusivo** de Epic Bosses e Raids Nível 70+.

---

## 4. CONTRATO CANÔNICO DE GRAUS DE EQUIPAMENTO (EQUIPMENT GRADE CONTRACT)

A escala canônica de equipamentos governa o poder dos itens, as penalidades de uso indevido e o balanceamento numérico:

| Grau | Nível Exigido | Nível Máximo | Multiplicador Base Atk | Multiplicador Base Def | Custo de Cristalização | Penalidade se Nível Insuficiente |
|:---:|:---:|:---:|:---:|:---:|:---|:---|
| **No-Grade (NG)** | **1** | 19 | 1.0x | 1.0x | N/A (Não cristalizável) | Nenhuma |
| **D-Grade** | **20** | 39 | 1.8x | 1.6x | `crystal_d` (Tier 2) | -30% Velocidade, -20% Acerto |
| **C-Grade** | **40** | 51 | 3.2x | 2.8x | `crystal_c` (Tier 3) | -50% Velocidade, -35% Acerto |
| **B-Grade** | **52** | 61 | 5.5x | 4.8x | `crystal_b` (Tier 4) | -65% Velocidade, -50% Acerto |
| **A-Grade** | **62** | 75 | 9.0x | 7.8x | `crystal_a` (Tier 5) | -80% Velocidade, -70% Acerto |
| **S-Grade** | **76** | 84 | 15.0x | 13.0x | `crystal_s` (Tier 6) | -90% Velocidade, Imobilidade parcial |
| **S84 / Top** | **85** | 120 | 25.0x | 22.0x | `crystal_s` + Essência Primordial | Inutilizável |

> [!WARNING]
> Fica formalmente proibido qualquer código que utilize `req.level: 76` para armaduras ou armas de Grau A. O marco oficial é **Nível 62**.

---

## 5. CICLO DE VIDA DE HABILIDADES & ESPECIALIZAÇÃO PROGRESSIVA

O desenvolvimento das classes obedece à filosofia de **Especialização Temática Progressiva** dividida em 8 degraus:

```text
[Lv 1–19]   INICIAÇÃO: Habilidades Gerais do Arquétipo (Ataque Físico Simples, Cura Menor, Dardo Arcano)
[Lv 20–39]  1ª CLASSE: Habilidades de Linhagem da Primeira Especialização
[Lv 40]     ESPECIALIZAÇÃO: Habilidade de Assinatura que fixa a Identidade de Classe
[Lv 45]     ROTAÇÃO: Habilidade Ativa Primária de Combate Contínuo
[Lv 50]     SINERGIA: Passiva de Aprimoramento ou Buff Pessoal Tático
[Lv 55]     ASSINATURA DE ARQUÉTIPO: Golpe ou Feitiço característico da classe
[Lv 60]     ALTO CALIBRE: Habilidade de Dano Concentrado ou Efeito em Área
[Lv 65]     UTILIDADE / SOBREVIVÊNCIA: Mecânica Defensiva, Esquiva, Escudo ou Redução de Cooldown
[Lv 70]     PINÁCULO DA 2ª CLASSE: O golpe mais poderoso antes do Despertar
[Lv 76]     AWAKENING (3ª CLASSE): Maestrias Absolutas e Passivas de Nobreza
[Lv 80]     ULTIMATE ★★★★: Golpe Definitivo de Classe (Clímax da Season 2)
[Lv 90]     MASTER ULTIMATE: Habilidade Transcendental (Season 3)
```

### Regras dos Elementos Mágicos:
Toda habilidade mágica e encantamento elemental obedece à oposição elementar canônica:
- **Fogo (Fire)** $\leftrightarrow$ **Água (Water)**
- **Vento (Wind)** $\leftrightarrow$ **Terra (Earth)**
- **Sagrado (Holy)** $\leftrightarrow$ **Trevas (Dark)**
- Habilidades físicas operam sob o elemento **Neutro / Físico**.
- Dano causado contra monstros fracos ao elemento oposto recebe bônus de **+25% a +50%**.

---

## 6. ORÇAMENTO DE PODER & LIMITES DE DOLLS (DOLLS POWER BUDGET)

Para garantir que as Dolls atuem como um sistema de colecionismo saudável sem quebrar a economia de equipamentos:

1. **Classificação das Dolls:**
   - **Monster Dolls (Comuns):** Esculpidas a partir de monstros regulares das zonas de caça. Concedem bônus moderados.
   - **Boss Dolls (Épicas / Lendárias):** Conquistadas exclusivamente em Raids Mundiais. Concedem atributos de combate elevados.
2. **Teto Orçamentário de Atributos:**
   - **Regra dos 70/15:** Os Equipamentos do Paperdoll devem fornecer no mínimo **65% a 70%** do poder do personagem. As Dolls reunidas podem representar no máximo **12% a 15%** do CP total.
   - Monster Dolls no Nível 10 não podem conceder mais que **+5 P.Atk** ou **+30 HP** por unidade no Nível 1.
3. **Mecânica de Síntese:**
   - Para subir uma Doll de Nível (1 a 5), o jogador deve fundir **duas cópias idênticas de mesmo nível**, com chance calculada e taxa de ouro proporcional.

---

## 7. CONTRATO MATEMÁTICO DE COMBAT POWER (CP)

O cálculo de Combat Power (`calcRealCP`) unifica os 14 eixos de poder do personagem. Nenhum sistema isolado pode explodir o CP inicial:

$$\text{Total CP} = \text{Base CP} + \text{Equip CP} + \text{Skills CP} + \text{Enchant CP} + \text{Dolls CP} + \text{Codex CP} + \text{Social CP}$$

- **Base CP no Nível 1:** Exatamente **150 CP** (personagem recém-criado, sem equipamentos).
- **CP Alvo no Nível 10:** 1.000 a 1.600 CP (com equipamentos No-Grade básicos e 1 Doll Lv 1).
- **CP Alvo no Nível 20:** 3.500 a 5.500 CP (com conclusão da 1ª Classe e armas D-Grade).
- **CP Alvo no Nível 40 (Cap Season 1):** 20.000 a 28.000 CP (Sets C-Grade completos + encantamento seguro +7).
- **CP Alvo no Nível 76 (Awakening):** 260.000 a 320.000 CP.
- **CP Alvo no Nível 80 (Cap Season 2):** 330.000 a 420.000 CP.

---

## 8. DEFINIÇÃO RÍGIDA DE TEMPORADAS (SEASON BOUNDARIES)

Fica vedada a existência de níveis híbridos ou sobrepostos entre temporadas no runtime:

```text
SEASON 1:
├── Escopo: Níveis 1 a 40 (inclusive)
├── Teto de Nível (Max Level): 40
├── Graus Permitidos: No-Grade, D-Grade, C-Grade Inicial
├── Abas Ativas: Zonas, Perfil, Inventário, Habilidades, Loja, Quests, Forja, Dolls, Mercado, Baú, Clã, Lâmpada, Encantamento, Coliseu, Raids
└── Clímax: 2ª Transferência de Classe + Conquista dos primeiros andares da Torre da Insolência

SEASON 2:
├── Escopo: Níveis 41 a 80 (inclusive)
├── Teto de Nível (Max Level): 80
├── Graus Permitidos: C-Grade, B-Grade (Lv 52), A-Grade (Lv 62), S-Grade (Lv 76/80)
├── Sistemas Adicionais: Torre 16-50, Sete Selos (Lv 60), Fortalezas (Lv 65), Noblesse (Lv 75), Grand Olympiad (Lv 76)
└── Clímax: Awakening (Lv 76) + Aquisição da Ultimate Skill ★★★★ (Lv 80)

SEASON 3:
├── Escopo: Níveis 81 a 120 (inclusive)
├── Teto de Nível (Max Level): 120
├── Graus Permitidos: S80, S84, Primordial, Soberano
└── Clímax: Master Ultimates (Lv 90) + Confronto Celestial com Antharas e Valakas
```
