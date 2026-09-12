# 📜 ADEN ARENA IDLE — MASTER PROGRESSION CONTRACT
**Versão:** 1.0 (Oficial) · **Status:** Aprovado para Implementação Estruturada · **Data:** 2026-09-12

---

## 1. VISÃO GERAL & PRINCÍPIOS DE DESIGN

Este documento é a **Autoridade Canônica de Design de Jogo e Progressão** do *Aden Arena Idle*. Ele unifica as curvas de evolução, aquisição de habilidades, desbloqueio de sistemas, faixas de equipamento, metas de CP e divisão de temporadas em uma matriz única e coerente.

### Pilares Fundamentais:
1. **Sem Desertos de Conteúdo:** O jogador nunca deve passar mais de 5 níveis sem um ganho perceptível (nova skill, avanço de tier, novo slot, novo sistema ou mudança de grau de equipamento).
2. **Ritmo Anti-Sobrecarga (Anti-Overwhelm):** O jogador no Nível 1 não recebe 10 sistemas simultâneos. Abas e funcionalidades abrem progressivamente conforme a maturidade do personagem.
3. **Identidade de Classe Viva (40–76):** A 2ª evolução de classe no Nível 40 não é um fim estático, mas o ponto de partida de uma especialização contínua com skills em Lv 45, 50, 55, 60, 65 e 70.
4. **Semântica Real de Recompensas:** IDs válidos devem corresponder ao propósito canônico do item (AC = Aden Coins, itens de quest = relíquias com propósito).
### Pilares Fundamentais:
1. **Sem Desertos de Conteúdo:** O jogador nunca deve passar mais de 5 níveis sem um ganho perceptível (nova skill, avanço de tier, novo slot, novo sistema ou mudança de grau de equipamento).
2. **Ritmo Anti-Sobrecarga (Anti-Overwhelm):** O jogador no Nível 1 não recebe 10 sistemas simultâneos. Abas e funcionalidades abrem progressivamente conforme a maturidade do personagem.
3. **Identidade de Classe Viva (40–76):** A 2ª evolução de classe no Nível 40 não é um fim estático, mas o ponto de partida de uma especialização contínua com skills em Lv 45, 50, 55, 60, 65 e 70.
4. **Semântica Real de Recompensas:** IDs válidos devem corresponder ao propósito canônico do item (AC = Aden Coins, itens de quest = relíquias com propósito).
5. **Divisão Rígida por Temporadas (Sem Sobreposição):**
   - **Season 1 (Lv 1–40 inclusive):** O Despertar de Aden. Graus NG, D e C Inicial. 1ª e 2ª Transferências de Classe. Zonas iniciais, Queen Ant e primeiros andares da Torre.
   - **Season 2 (Lv 41–80 inclusive):** A Marcha dos Senhores de Guerra. Graus C, B, A (Lv 62) e S (Lv 76/80). Clãs avançados, Sete Selos, Fortalezas, Noblesse, Awakening (Lv 76) e clímax com a **Ultimate ★★★★ (Lv 80)**.
   - **Season 3 (Lv 81–120 inclusive):** A Fúria dos Antigos. Graus S80, S84 e Primordiais. Grand Bosses Supremos (Antharas, Valakas), Master Ultimates (Lv 90) e Multiverso.

---

## 2. MATRIZ MESTRE DE PROGRESSÃO (MASTER PROGRESSION MATRIX)

| Nível | Estágio de Classe | Ritmo de Skills | Grau de Equip | Zonas Principais | Quests & Sagas | Sistemas Desbloqueados | Desafio / Boss Principal | Meta de CP Sugerida | Season |
|:---:|:---|:---|:---:|:---|:---|:---|:---|:---:|:---:|
| **1** | **Base (Iniciante)** | 2–3 Habilidades Básicas | **No-Grade** | Talking Island | Jornada: Boas-vindas | Combate, Inventário, Perfil, Loja Básica | Goblin King | **150 – 300** | **Season 1** |
| **5** | Base | +1 Passiva Básica | No-Grade | Elven Forest | Jornada: Primeiras Caçadas | **Quests Diárias & Passe de Batalha** | Death Trent | **450 – 700** | **Season 1** |
| **10** | Base | Subida de Nível de Skill | No-Grade | Dark Forest / Orc Village | Jornada: O Primeiro Passo | **Forja (Craft & Reciclagem), Monster Dolls** | Dark Matriarch / Kasha | **1.000 – 1.600** | **Season 1** |
| **15** | Base | Preparação de Classe | No-Grade | Dwarven Mine / Kamael | Jornada: Provações Iniciais | **Mercado & Warehouse (Baú)** | Dwarven Earth Lord | **2.000 – 2.800** | **Season 1** |
| **20** | **1ª Transferência** | **3–4 Class Skills Iniciais** | **D-Grade** | Ruined Outpost / Howling | Saga de Classe 1 · Jornada Passo 2 | **Clã (Fundação), Lâmpada Mágica, Encantamento (+7)** | Outpost Fallen Captain | **3.500 – 5.500** | **Season 1** |
| **25** | 1st Job | +1 Passiva de Maestria | D-Grade | Giran Outskirts | Jornada: Desbravador | **Coliseu (Duelos & Ranking)** | Minotaur Knight | **6.500 – 9.000** | **Season 1** |
| **30** | 1st Job | Aprimoramento de Rotação | D-Grade | Orcen Ruins / Despair | Jornada: Campeão de Aden | **Primeira Raid Mundial (Queen Ant)** | **Queen Ant (Lv 30)** | **10.000 – 14.000** | **Season 1** |
| **35** | 1st Job | Subida de Níveis de Habilidade | D-Grade Alto | Forsaken Crypt | Preparação para 2ª Classe | Prévia da Torre da Insolência | Crypt Vampire Lord | **14.000 – 18.000** | **Season 1** |
| **40** | **2ª Transferência** | **SPECIALIZATION (Identidade)** | **C-Grade** | Black Citadel / Gludio Castle | Saga de Classe 2 · **CLÍMAX DA SEASON 1** | **Torre da Insolência (Andares 1-15), Alquimia** | **Core & Orfen (Pre-Raid)** | **20.000 – 28.000** | **Season 1** |
| **41** | 2nd Job | Transição de Temporada | C-Grade | Entrada de Wolf Mountain | Início da Saga da Season 2 | **Abertura Oficial da Season 2** | Wolf Pack Leader | **24.000 – 32.000** | **Season 2** |
| **45** | 2nd Job | **Class Skill Ativa (Rotação)** | C-Grade | Wolf Mountain | Caçadas Intermediárias | Expedições de Masmorras | Alpha Wolf / Harpy | **28.000 – 38.000** | **Season 2** |
| **50** | 2nd Job | **Class Skill / Passiva Sinergia** | C-Grade Alto | Rift of the Void | Desafios Abissais | Altar de Fusão de Alquimia Avançado | Void Reaver | **40.000 – 55.000** | **Season 2** |
| **52** | 2nd Job | Subida de Habilidades | **B-Grade** | Emerald Grove | Transição B-Grade | Desbloqueio de Sets B (Zubei, Avadon, Doom) | Treant Guardian | **55.000 – 70.000** | **Season 2** |
| **55** | 2nd Job | **Specialization Skill (Assinatura)** | B-Grade | Underworld Gate | Portões Subterrâneos | Torre Andares 16–35 | Underworld Behemoth | **70.000 – 90.000** | **Season 2** |
| **60** | 2nd Job | **Class Skill Avançada** | B-Grade Alto | Necrópoles & Catacumbas | Despertar dos Selos | **Sete Selos (Catacumbas, Seal Stones, Mammon)** | Lilith / Anakim (Pre-Battle) | **90.000 – 115.000** | **Season 2** |
| **62** | 2nd Job | Aprimoramento | **A-Grade** | Necrópole dos Apóstolos | Transição A-Grade Canônica | Forja A-Grade & Deselamento (Dark Crystal, Tallum)| Apostate Heretic | **115.000 – 140.000** | **Season 2** |
| **65** | 2nd Job | **Passive / Utility / Cooldown** | A-Grade | Dragon Valley (Entrada) | Rumo à Nobreza | Fortalezas Territoriais & Talismãs | Cave Banshee | **140.000 – 170.000** | **Season 2** |
| **70** | 2nd Job | **Advanced Class Skill (Pinnacle)** | A-Grade Alto | Wall of Argos | Início da Saga de Noblesse | Cerco de Fortalezas Avançado | Eye of Splendor | **170.000 – 210.000** | **Season 2** |
| **75** | 2nd Job | Preparação de Awakening | A-Grade Top | Valley of Saints / Argos | **Quest Noblesse (Partes 1 a 4)** | Confronto contra Barakiel (100% Staff Drop) | **Barakiel (Lv 75)** | **210.000 – 250.000** | **Season 2** |
| **76** | **3ª Transferência (Awakening)** | **MASTERY (Grand Passives)** | **S-Grade Prep** | Aden City / Imperial Tomb | Consagração de Noblesse | **Grand Olympiad Games, Subclasses** | Zaken (Lv 76) | **260.000 – 320.000** | **Season 2** |
| **80** | Awakening | **ULTIMATE ★★★★ (Pinnacle)** | **S-Grade** | Dragon Valley Profundo | Batalha dos Titãs · **CLÍMAX DA SEASON 2** | Torre Andar 50 (Baium) | **Baium (Lv 80)** | **330.000 – 420.000** | **Season 2** |
| **81** | Awakening | Transição de Temporada | S-Grade | Entrada de Antharas Lair | Início da Saga da Season 3 | **Abertura Oficial da Season 3** | Dragon Scout | **380.000 – 460.000** | **Season 3** |
| **85** | Awakening | Habilidade Mítica | S-Grade Alto | Antharas Lair | Desafio Primordial | Certificações de Subclasse Nível 3 | Behemoth Dragon | **450.000 – 550.000** | **Season 3** |
| **90** | Master | **Master Ultimate Skill** | **S80 / S84** | Forge of the Gods | Despertar dos Dragões | Batalhas Interdimensionais (2D/3D Arena) | **Antharas (Lv 90)** | **600.000 – 750.000** | **Season 3** |
| **95** | Master | Maestria Divina | S84 / Primordial | Altar de Shilen | Conflito Celestial | Transformações Divinas Supremas | **Valakas (Lv 95)** | **800.000 – 1.000.000** | **Season 3** |
| **100+** | Soberano | Transcendência | Soberano | Fendas Dimensionais | Crônica Final | Fim de Jogo Infinito | Frintezza / Grand Dragon | **1.200.000+** | **Season 3** |

---

## 3. RITMO DE HABILIDADES & FIM DO DESERTO (LV 41–75)

A curva de habilidades é redesenhada para eliminar o hiato entre a 2ª classe (Lv 40) e o Awakening (Lv 76):

```text
Lv 1–19   → INICIAÇÃO: 2-3 Habilidades Básicas de Raça/Arquétipo
Lv 20–39  → 1ST JOB: 3-4 Habilidades da Linha (ex: Palus Knight / Knight / Rogue)
Lv 40     → SPECIALIZATION: Skill de Assinatura da 2ª Classe (ex: Sting, Hex, Judgment)
Lv 45     → CLASS SKILL: Habilidade de Rotação Ativa Primária
Lv 50     → SYNERGY PASSIVE: Bônus Passivo ou Buff Tático de Grupo/Auto
Lv 55     → SIGNATURE MOVE: Habilidade Especializada do Arquétipo
Lv 60     → HIGH-TIER CLASS SKILL: Ataque Pesado ou Feitiço de Área
Lv 65     → DEFENSIVE / UTILITY: Mecânica de Sobrevivência, Esquiva ou Dano Crítico
Lv 70     → PINNACLE PRE-AWAKENING: A habilidade mais destrutiva da 2ª Classe
Lv 76     → AWAKENING MASTERY: Passivas de Maestria Lendária e Desbloqueio de Herói
Lv 80     → ULTIMATE ★★★★: O golpe definitivo de classe (Grimório 4 Estrelas)
```

---

## 4. ESCALONAMENTO DE EQUIPAMENTOS (CANONICAL GRADES)

A transição de equipamentos segue a progressão canônica de Lineage II ajustada ao ritmo do Idle:

| Grau | Nível Exigido | Faixa Ativa | Características de Balanceamento |
|:---:|:---:|:---:|:---|
| **No-Grade (NG)** | Lv 1 | 1 – 19 | Equipamentos de treino e recompensas de Talking Island. Sem penalidade de grau. |
| **D-Grade** | Lv 20 | 20 – 39 | Primeiro salto significativo de P.Atk/P.Def. Recompensas da 1ª Classe e Forja Inicial. |
| **C-Grade** | Lv 40 | 40 – 51 | Entrada da 2ª Classe. Armas com Soul Crystal inicial e conjuntos com bônus de Set C. |
| **B-Grade** | Lv 52 | 52 – 61 | Armaduras clássicas (Zubei, Avadon, Blue Wolf, Doom). Grandes saltos de CP. |
| **A-Grade** | **Lv 62** | 62 – 75 | Sets de prestígio (Dark Crystal, Tallum, Majestic, Nightmare). Armas A com SA 11/12. |
| **S-Grade** | Lv 76 / 80 | 76 – 85 | Sets Imperiais (Imperial Crusader, Draconic, Major Arcana). Armas S com SA 13. |
| **S84 / Top** | Lv 85+ | 85 – 120 | Equipamentos Dinásticos e Primordiais dos Chefes Supremos. |

### 4.1. Regra Definitiva de Graus de Equipamento (Fonte Única da Verdade)
Fica formalmente estipulado que a escala oficial é:
- **No-Grade:** Níveis 1 a 19
- **D-Grade:** Níveis 20 a 39
- **C-Grade:** Níveis 40 a 51
- **B-Grade:** Níveis 52 a 61
- **A-Grade:** **Níveis 62 a 75**
- **S-Grade:** Níveis 76 a 85 (Awakening / S-Grade Clássico)
- **S84 / Primordial:** Níveis 85 a 120

> [!IMPORTANT]
> Qualquer menção em documentação antiga ou código legado a "Grade A = Nível 76" é declarada **definitivamente obsoleta e revogada**. O marco canônico de Grade A é **Nível 62**.

### 4.2. Contrato Matemático de XP (XP Mathematical Contract)
Para assegurar uma curva de progressão natural e sem rupturas ou inversões aberrantes, o motor de níveis (`LevelEngine.js`) deve satisfazer obrigatoriamente duas propriedades matemáticas em toda a faixa de níveis (1 a 120):
1. **Monotonicidade Estrita de XP por Nível:**
   $$\forall L \in [1, 119], \quad \text{XP\_REQ}(L + 1) > \text{XP\_REQ}(L)$$
   É estritamente proibida qualquer inversão de exigência de XP (como a queda de -52% detectada anteriormente no Lv 101).
2. **Taxa de Crescimento Suave e Limitada:**
   $$\text{GrowthRate}(L) = \frac{\text{XP\_REQ}(L + 1)}{\text{XP\_REQ}(L)} \le 1.45 \quad (\text{exceto marcos de classe: máximo } 1.80)$$
   Eliminam-se cliffs verticais como os 7.8x no Lv 20 e 5.3x no Lv 40. A progressão recompensa esforço linear e constante, sem muros invisíveis.

---

## 5. HIERARQUIA DE DESBLOQUEIO DE TELAS & ABAS (ANTI-SOBRECARGA)

Para que o início do jogo seja intuitivo e instigante, os sistemas são revelados em degraus bem definidos:

```text
NÍVEL 1 (Fundação Imediata):
├── Zonas de Caça (Talking Island)
├── Personagem & Equipamento (Paperdoll clássico)
├── Inventário
├── Habilidades (Árvore Básica)
└── Loja Local (Poções e Itens Iniciais)

NÍVEL 5 (Objetivos Recorrentes):
├── Missões Diárias (3 ativas: Monstros, Chefes, Codex)
└── Passe de Batalha (Trilha Grátis e Premium)

NÍVEL 10 (Primeiro Power Spike):
├── Forja Real (Criação de Itens, Reciclagem e Desmanche)
├── Missão Diária da Forja (d_craft liberada)
└── Monster Dolls (Coleção, Síntese e Drop Orgânico de Monstros Iniciais)

NÍVEL 15 (Economia & Guarda):
├── Mercado (Market / Trade)
└── Warehouse (Baú de Armazenamento Central)

NÍVEL 20 (Primeira Grande Evolução):
├── 1ª Transferência de Classe (Quests de Classe)
├── Clãs (Criação, Nomenclatura e Doações)
├── Lâmpada Mágica (Magic Lamp EXP & Craft)
├── Encantamento de Equipamentos (+1 a +7 Seguro)
└── Prévia Informativa de Raids (Card da Queen Ant no Lv 30)

NÍVEL 25 (Competitividade Inicial):
└── Grande Coliseu (Duelos e Ranking de Gladiadores)

NÍVEL 30 (Primeiro Confronto Mundial):
└── Masmorras Diárias & Epic Raids (Desbloqueio da Queen Ant)

NÍVEL 40 (Consagração da 2ª Classe & Clímax da Season 1):
├── 2ª Transferência de Classe (Especialização Completa)
├── Torre da Insolência (Andares 1 a 15 - Conteúdo Inicial da Season 1)
├── Alquimia & Altar de Elixires
└── Missão Diária da Torre (d_tower liberada)

NÍVEL 41+ (Temporada 2 - Expansão de Guerra):
└── Torre da Insolência Andares 16 a 50, Sete Selos (Lv 60), Fortalezas (Lv 65) e Awakening (Lv 76)
```

---

## 6. SEMÂNTICA DE RECOMPENSAS (REWARD SEMANTICS AUDIT)

A estabilização técnica corrigiu referências quebradas para evitar exceções em tempo de execução. A próxima etapa de produto deve restabelecer o propósito conceitual de cada item:

1. **`adena_coins` (Aden Coins / AC):**
   - **Semântica:** Moeda especial de cash / raid (`slot: 'currency'`).
   - **Regra:** Empilhável, intransferível via mercado comum, utilizável na Cash Shop. Dropada em quantidades medidas de Raids e Chefes Mundiais.
2. **`staff_goddess_rain_song` (Cajado da Deusa Barakiel):**
   - **Semântica:** Item chave de missão (`slot: 'quest'`).
   - **Regra:** Não equipável, não vendível, drop garantido (100%) ao derrotar Barakiel durante a etapa 3 da saga de Noblesse.
3. **`giants_codex` & `life_stone_top_76`:**
   - Registrados formalmente para recompensas de Olimpíadas e Mammon quando os respectivos estágios forem ativados.

---

## 7. SISTEMA DE DOLLS COMO PROGRESSÃO REAL

As Dolls não são cosméticos decorativos; elas compõem um **Pilar de Poder Híbrido (Coleção + Gear Passivo + Síntese)**:

1. **Monster Dolls (Comuns / Iniciais):**
   - Obtidas por drop raro (0.8%) de monstros comuns em Talking Island, Elven Forest e Gludio.
   - Fornecem atributos leves e específicos (ex: Goblin = HP/Atk; Lobo = Crit/Speed; Orc = Def/HP).
   - Introduzem o jogador ao Altar de Síntese no Nível 10.
2. **Boss Dolls (Raras, Épicas e Lendárias):**
   - Obtidas exclusivamente através de Raids Mundiais (Queen Ant, Core, Orfen, Zaken, Baium, Antharas, Valakas).
   - Fornecem bônus de combate pesados (+15 a +160 Atk, Crit Dmg, Vampirismo).
3. **Escalonamento no StatsEngine:**
   - Cada Doll possui 5 níveis de poder (`statsByLvl`).
   - A fusão de 2 Dolls do mesmo tipo permite subir para o próximo nível de poder, criando um dreno sustentável de cópias repetidas.

### 7.1. Limite e Orçamento de Poder de Dolls (Anti-Over-CP)
Para impedir que Dolls suplantem a importância dos Equipamentos e quebrem o balanceamento:
- **Teto Orçamentário de Atributos:** O conjunto total de Dolls ativas não pode exceder **12% a 15%** do CP total do personagem.
- **Primazia do Equipamento:** O equipamento (Arma, Armadura, Joias) deve representar no mínimo **65% a 70%** do poder de combate efetivo.
- **Escala de Monster Dolls:** No Nível 10–20, uma Monster Doll Lv 1 concede no máximo +5 P.Atk ou +30 HP (aproximadamente 2% a 3% do CP do jogador), agindo como auxílio tático e não como salto desproporcional de poder.

---

## 8. DIRETRIZES DE EXECUÇÃO EM SPRINTS CONCÊNTRICAS

A execução futura deve respeitar rigorosamente a ordem em blocos:
- **Marco 0:** Aprovação e Congelamento do `MASTER_GAME_DATA_CONTRACT.md`.
- **Sprint 1:** Implementação da Semântica de Recompensas (`adena_coins` e `staff_goddess_rain_song` no catálogo oficial).
- **Sprint 2:** Pacing de Telas e Abas (`AppLayout.js`) conforme degrau anti-sobrecarga da Seção 5.
- **Sprint 3:** Normalização Matemática da Curva de XP no `LevelEngine.js` atendendo ao Contrato Matemático.
- **Sprint 4:** Arquitetura da Skill Tree Unificada & Cadência de Habilidades Lv 41–75.
- **Sprint 5:** Playtest de Estabilidade e Balanceamento da Season 1.
