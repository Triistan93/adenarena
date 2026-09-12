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
5. **Divisão Rígida por Temporadas:**
   - **Season 1 (Lv 1–40):** O Despertar de Aden (NG, D, C Inicial) · Foco na Fundação e 2ª Classe.
   - **Season 2 (Lv 41–80):** A Marcha dos Senhores de Guerra (C, B, A, S) · Foco em Clãs, Torres, Sete Selos e Despertar (Awakening Lv 76).
   - **Season 3 (Lv 81–120):** A Fúria dos Antigos (S80, S84, Primordial) · Foco em Grand Bosses, Olimpíadas Supremas e Multiverso.

---

## 2. MATRIZ MESTRE DE PROGRESSÃO (MASTER PROGRESSION MATRIX)

| Nível | Estágio de Classe | Ritmo de Skills | Grau de Equip | Zonas Principais | Quests & Sagas | Sistemas Desbloqueados | Desafio / Boss Principal | Meta de CP Sugerida | Season |
|:---:|:---|:---|:---:|:---|:---|:---|:---|:---:|:---:|
| **1** | **Base (Iniciante)** | 2–3 Habilidades Básicas | **No-Grade** | Talking Island | Jornada: Boas-vindas | Combate, Inventário, Perfil, Loja Básica | Goblin King | **150 – 300** | **S1** |
| **5** | Base | +1 Passiva Básica | No-Grade | Elven Forest | Jornada: Primeiras Caçadas | **Quests Diárias & Passe de Batalha** | Death Trent | **450 – 700** | **S1** |
| **10** | Base | Subida de Nível de Skill | No-Grade | Dark Forest / Orc Village | Jornada: O Primeiro Passo | **Forja (Craft & Reciclagem), Monster Dolls** | Dark Matriarch / Kasha | **1.000 – 1.600** | **S1** |
| **15** | Base | Preparação de Classe | No-Grade | Dwarven Mine / Kamael | Jornada: Provações Iniciais | **Mercado & Warehouse (Baú)** | Dwarven Earth Lord | **2.000 – 2.800** | **S1** |
| **20** | **1ª Transferência** | **3–4 Class Skills Iniciais** | **D-Grade** | Ruined Outpost / Howling | Saga de Classe 1 · Jornada Passo 2 | **Clã (Fundação), Lâmpada Mágica, Encantamento (+7)** | Outpost Fallen Captain | **3.500 – 5.500** | **S1** |
| **25** | 1st Job | +1 Passiva de Maestria | D-Grade | Giran Outskirts | Jornada: Desbravador | **Coliseu (Duelos & Ranking)** | Minotaur Knight | **6.500 – 9.000** | **S1** |
| **30** | 1st Job | Aprimoramento de Rotação | D-Grade | Orcen Ruins / Despair | Jornada: Campeão de Aden | **Primeira Raid Mundial (Queen Ant)** | **Queen Ant (Lv 30)** | **10.000 – 14.000** | **S1** |
| **35** | 1st Job | Subida de Níveis de Habilidade | D-Grade Alto | Forsaken Crypt | Preparação para 2ª Classe | Prévia da Torre da Insolência | Crypt Vampire Lord | **14.000 – 18.000** | **S1** |
| **40** | **2ª Transferência** | **SPECIALIZATION (Identidade)** | **C-Grade** | Black Citadel / Gludio Castle | Saga de Classe 2 · **CAP SEASON 1** | **Torre da Insolência (Andares 1-50), Alquimia** | **Core & Orfen (Pre-Raid)** | **20.000 – 28.000** | **S1 / S2** |
| **45** | 2nd Job | **Class Skill Ativa (Rotação)** | C-Grade | Wolf Mountain | Caçadas Intermediárias | Expedições de Masmorras | Alpha Wolf / Harpy | **28.000 – 38.000** | **S2** |
| **50** | 2nd Job | **Class Skill / Passiva Sinergia** | C-Grade Alto | Rift of the Void | Desafios Abissais | Altar de Fusão de Alquimia Avançado | Void Reaver | **40.000 – 55.000** | **S2** |
| **52** | 2nd Job | Subida de Habilidades | **B-Grade** | Emerald Grove | Transição B-Grade | Desbloqueio de Sets B | Treant Guardian | **55.000 – 70.000** | **S2** |
| **55** | 2nd Job | **Specialization Skill (Assinatura)** | B-Grade | Underworld Gate | Portões Subterrâneos | Torre Andares 25–40 | Underworld Behemoth | **70.000 – 90.000** | **S2** |
| **60** | 2nd Job | **Class Skill Avançada** | B-Grade Alto | Necrópoles & Catacumbas | Despertar dos Selos | **Sete Selos (Catacumbas, Seal Stones, Mammon)** | Lilith / Anakim (Pre-Battle) | **90.000 – 115.000** | **S2** |
| **62** | 2nd Job | Aprimoramento | **A-Grade** | Necrópole dos Apóstolos | Transição A-Grade Canônica | Forja A-Grade & Deselamento | Apostate Heretic | **115.000 – 140.000** | **S2** |
| **65** | 2nd Job | **Passive / Utility / Cooldown** | A-Grade | Dragon Valley (Entrada) | Rumo à Nobreza | Fortalezas Territoriais | Cave Banshee | **140.000 – 170.000** | **S2** |
| **70** | 2nd Job | **Advanced Class Skill (Pinnacle)** | A-Grade Alto | Wall of Argos | Início da Saga de Noblesse | Cerco de Fortalezas Avançado | Eye of Splendor | **170.000 – 210.000** | **S2** |
| **75** | 2nd Job | Preparação de Awakening | A-Grade Top | Valley of Saints / Argos | **Quest Noblesse (Partes 1 a 4)** | Confronto contra Barakiel | **Barakiel (Lv 75)** | **210.000 – 250.000** | **S2** |
| **76** | **3ª Transferência (Awakening)** | **MASTERY (Grand Passives)** | **S-Grade Prep** | Aden City / Imperial Tomb | Consagração de Noblesse | **Grand Olympiad Games, Subclasses** | Zaken (Lv 76) | **260.000 – 320.000** | **S2** |
| **80** | Awakening | **ULTIMATE ★★★★ (Pinnacle)** | **S-Grade** | Dragon Valley Profundo | Batalha dos Titãs · **CAP SEASON 2** | Torre Andar 50 (Baium) | **Baium (Lv 80)** | **330.000 – 420.000** | **S2 / S3** |
| **85** | Awakening | Habilidade Mítica | S-Grade Alto | Antharas Lair | Desafio Primordial | Certificações de Subclasse Nível 3 | Behemoth Dragon | **450.000 – 550.000** | **S3** |
| **90** | Master | **Master Ultimate Skill** | **S80 / S84** | Forge of the Gods | Despertar dos Dragões | Batalhas Interdimensionais (2D/3D Arena) | **Antharas (Lv 90)** | **600.000 – 750.000** | **S3** |
| **95** | Master | Maestria Divina | S84 / Primordial | Altar de Shilen | Conflito Celestial | Transformações Divinas Supremas | **Valakas (Lv 95)** | **800.000 – 1.000.000** | **S3** |
| **100+** | Soberano | Transcendência | Soberano | Fendas Dimensionais | Crônica Final | Fim de Jogo Infinito | Frintezza / Grand Dragon | **1.200.000+** | **S3** |

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

NÍVEL 40 (Consagração da 2ª Classe & Cap Season 1):
├── 2ª Transferência de Classe (Especialização Completa)
├── Torre da Insolência (Andares 1 a 50)
├── Alquimia & Altar de Elixires
└── Missão Diária da Torre (d_tower liberada)
```

---

## 6. SEMÂNTICA DE RECOMPENSAS (REWARD SEMANTICS AUDIT)

A estabilização técnica corrigiu referências quebradas para evitar exceções em tempo de execução. A próxima etapa de produto deve restabelecer o propósito conceitual de cada item:

1. **`adena_coins` (Aden Coins / AC):**
   - **Problema:** Foi mapeado para `adena` comum nos drops de Raids.
   - **Resolução de Produto:** Registrar formalmente `adena_coins` no catálogo de itens como **Moeda Especial / Moeda de Cash** (`slot: 'currency'`). Raids e World Bosses devem dropar AC real para uso na loja especial, mantendo a sensação de recompensa valiosa.
2. **`staff_goddess_rain_song` (Cajado da Deusa Barakiel):**
   - **Problema:** Foi substituído por pergaminhos abençoados genéricos.
   - **Resolução de Produto:** Registrar `staff_goddess_rain_song` como item de quest autêntico de Lineage II no inventário (`slot: 'quest'`), mantendo o drop de 100% de Barakiel na etapa 3 da saga de Noblesse.
3. **`giants_codex` & `life_stone_top_76`:**
   - Registrados formalmente para recompensas de Olimpíadas e Mammon quando os respectivos estágios forem ativados.

---

## 7. SISTEMA DE DOLLS COMO PROGRESSÃO REAL

As Dolls não são cosméticos decorativos; elas compõem um **Pilar de Poder Híbrido (Coleção + Gear Passivo + Síntese)**:

1. **Monster Dolls (Comuns / Iniciais):**
   - Obtidas por drop raro (0.8%) de monstros comuns em Talking Island, Elven Forest e Gludio.
   - Fornecem atributos leves e específicos (ex: Goblin = HP/Atk; Lobo = Crit/Speed; Orc = Def/HP).
   - Introduzem o jogador ao Altar de Síntese já no Nível 10.
2. **Boss Dolls (Raras, Épicas e Lendárias):**
   - Obtidas exclusivamente através de Raids Mundiais (Queen Ant, Core, Orfen, Zaken, Baium, Antharas, Valakas).
   - Fornecem bônus de combate pesados (+15 a +160 Atk, Crit Dmg, Vampirismo).
3. **Escalonamento no StatsEngine:**
   - Cada Doll possui 5 níveis de poder (`statsByLvl`).
   - A fusão de 2 Dolls do mesmo tipo permite subir para o próximo nível de poder, criando um dreno sustentável de cópias repetidas.

---

## 8. DIRETRIZES DE IMPLEMENTAÇÃO EM SPRINTS CONCÊNTRICAS

A execução futura deve respeitar rigorosamente a ordem em blocos:
- **Sprint 1 — Reward Semantics:** Formalizar `adena_coins` como item de moeda especial e `staff_goddess_rain_song` como item de quest no catálogo oficial.
- **Sprint 2 — Tab Pacing:** Reordenar os unlocks no `AppLayout.js` conforme o degrau anti-sobrecarga estabelecido na Seção 5 (ex: Forja/Dolls Lv 10, Mercado Lv 15, etc.).
- **Sprint 3 — Skill Progression (41–75):** Preenchimento do intervalo Lv 41–75 nas árvores de classe (Skills ativas e passivas em Lv 45, 50, 55, 60, 65, 70).
- **Sprint 4 — Curva de XP & Cliffs:** Suavização matemática dos multiplicadores de XP no `LevelEngine.js` para Lv 20, 40 e 85.
