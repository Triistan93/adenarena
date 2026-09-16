# Plano de Implementação: Reestruturação e Adaptação dos Sistemas 'EXISTING' via Conceitos Canônicos do Lineage II

## 1. Visão Geral e Contexto Estratégico

Na auditoria da Fase 2, identificou-se que embora diversos sistemas constem no repositório com status `EXISTING`, **em termos práticos de gameplay e economia, a grande maioria opera de forma incompleta, fragmentada ou com lógicas genéricas/artificiais que não capturam a profundidade e a funcionalidade real do Lineage II**.

O objetivo deste plano é **utilizar os conceitos, regras e mecânicas comprovadas do Lineage II para reestruturar esses sistemas no Aden Arena**, transformando funcionalidades isoladas em um **ecossistema econômico e de progressão coeso, interligado e funcional para a Season 1 (Níveis 1 a 40)**.

> [!IMPORTANT]
> **OS TRÊS PILARES INTOCÁVEIS (PRESERVAÇÃO ESTRITA):**
> Conforme diretriz mandatória do usuário, os seguintes três sistemas **NÃO SERÃO MODIFICADOS**:
> 1. **Curva Monotônica de EXP (Lv 1–40)** (`LevelEngine.js`).
> 2. **World Trade / Mercado P2P (10 slots por jogador, taxa imperial de 5%)** (`MarketService.js`).
> 3. **Expeditions & Mercenários (Contratos, sinergias e dilemas táticos)** (`ExpeditionService.js`).

---

## 2. Diagnóstico: O que constava como 'EXISTING' e por que não funciona como deveria

| Sistema | O que constava no código | Por que NÃO funciona como deveria | Solução Canônica do Lineage II |
|:---|:---|:---|:---|
| **Forja & Refinaria** | `RefineryService` refina 12 materiais; `CraftService` tem 13 receitas | Os 12 materiais refinados não têm onde ser usados (órfãos). Monstros dropam equipamentos prontos aos montes. Não há receitas de armaduras/armas D-Grade reais. | **Cadeia de Forja D-Grade**: Receitas clássicas (Brigandine, Reinforced, Mithril, Bastard Sword) consumindo os materiais refinados + Peças de equipamentos dos monstros. |
| **Descarte de Equipamentos** | `sellAllJunk` vende gear obsoleta por ouro básico | O jogador acumula centenas de armas/armaduras D e No-Grade no idle. Vendê-las gera inflação de Adena e esvazia o valor dos itens. | **Sistema de Coleções (Collections)**: Sacrifício e destruição permanente de equipamentos antigos para registrar em coleções temáticas com bônus perpétuos de conta. |
| **Consumo de Tiros (Shots)** | Custo plano genérico de tiros universais sem diferenciação de grau | Desvaloriza o crafting de Soulshots/Spiritshots por grau e não dá vantagem ao tiro correto. Em combates idle com distância homogênea, penalizar arcos com múltiplos tiros seria punitivo sem ganho tático. | **Regra Canônica de Tiro & Grau**: Consumo 1:1 justo para todas as armas. Arma exige o tiro da sua grade exata para bônus total (+100% de dano). O tiro Universal opera como curinga concedendo bônus moderado (+30% de dano). Tiros de grau inferior não ativam em armas superiores. |
| **Cristalização no Enchant** | Itens quebram em `crystal_d` / `crystal_c` ao falhar +4 | Cristais não possuem utilidade real na Season 1 além de 2 receitas de tomos. O jogador sente a perda de encantamento como punição sem retorno. | **Utilidade dos Cristais**: Cristais D/C tornam-se o ingrediente essencial para confecção em massa de Soulshots D/C e Tomos Sagrados. |
| **Augmentação (Life Stones)** | Ferreiro aceita Adena se o jogador não tiver a Life Stone; padrão Lv 76 | Bypassa o drop de Life Stones; quebra a itemização; ignora o cap de Season 1 (Lv 40); não consome Gemstones. | **Regra Canônica de Augment**: Exige Life Stone real (Lv 28, 34, 40) + Gemstones D/C. Remove bypass em Adena. Taxa de remoção justa no ferreiro. |
| **Broches & Joias** | Slot existe no paperdoll; `jewelBroochCp = 0`; joias são brincos/anéis | O sistema de Broches e Joias do L2 simplesmente não existe: não há pedras de Ruby, Sapphire, Opal, etc., nem fusão de ranks. | **Broche & Joias de Broche Lv 1 a 5**: Broche abre slots para Ruby (+P.Atk/Shots), Sapphire (+M.Atk/Shots), Diamond (+P.Def), Pearl (+M.Def), Opal (+Stats) com síntese. |
| **Síntese de Itens** | `SynthesisService` permite fundir espadas e armaduras comuns | No Lineage II espadas e armaduras NÃO sofrem fusão gacha de duplicatas (são aprimoradas via Enchant, SA e Augment). | **Síntese Restrita a Artefatos**: A fusão passa a se aplicar estritamente a Joias de Broche, Talismãs e Dolls/Agathions, restaurando a identidade L2. |
| **Conjuntos de Armadura** | Apenas bônus de 5 peças ativas (5/5) | Subir de nível exige combinar peças parciais. Não receber nada até ter as 5 peças empobrece a progressão no início do jogo. | **Bônus Parcial 3/5**: Bônus intermediário ao equipar 3 peças do conjunto, completando com 5 peças. |
| **Atividades de Vida (Life)** | Pesca, Mineração, Coleta, Caça e Manor são minigames isolados | Os itens pescados viram apenas ouro ou iscas. Os recursos de coleta e caça viram materiais que não têm receitas na forja. | **Ciclo Fechado**: Peixes viram Fish Oil (craft) e Guisados (+buff 20min). Couros/metais viram sets D-Grade. Colheita de Manor vira poções de cura/mana. |
| **Chefes de Raids (Season 1)** | Catálogo mistura Queen Ant (40) com chefes de Lv 65 a 100 (Zaken, Baium, etc.) | Chefes de Lv 50 a 100 não pertencem ao escopo da Season 1 e criam ruído no design e na interface. | **Foco Canônico S1**: Pinnacle Bosses da Season 1 centrados em Queen Ant (Lv 40) e Core (Cruma Lv 40). Chefes superiores delimitados para temporadas futuras. |

---

## 3. Revisão Requerida do Usuário

> [!WARNING]
> **MIGRAÇÃO DE DROPS DE MONSTROS (PRODUTO PRONTO → MATERIAIS & PATTERNS):**
> No código atual, monstros comuns dropam centenas de armas e armaduras 100% completas diretamente, o que anula a necessidade de coletar, minerar ou usar a Forja.
> **Adaptação proposta**: Na faixa de níveis 20 a 40 (D-Grade), monstros comuns passarão a dropar predominantemente matérias-primas e pedaços de equipamento (*patterns/pieces*), reservando o drop de itens 100% inteiros e prontos para **Monstros Campeões, Baús de Tesouro e Chefes de Raids**. 
> Isso reativa imediatamente a Forja e a Refinaria como sistemas centrais de jogo.

> [!NOTE]
> **REFINAMENTO DA SÍNTESE DE DUPLICATAS:**
> O atual `SynthesisService.js` permitia fundir espadas duplicadas em "Synthesis Ranks 1 a 5". No Lineage II, duplicatas de armas são usadas para **tentativas arriscadas de Enchant (+4 a +16)**, **Cristalização para Shots** ou **depósito em Coleções de Conta**. A síntese será redirecionada para seu propósito canônico real: **Joias de Broche, Talismãs e Dolls**.

---

## 4. Questões Abertas (Decisões de Design)

1. **Taxa de Drop de Pedaços de Equipamento (*Key Materials*)**:
   - *Opção A (Recomendada)*: Monstros D-Grade dropam 1 a 3 pedaços (*ex: Bastard Sword Blade*), e a receita exige 4 pedaços + materiais refinados (Steel + Leather).
   - *Opção B*: Forja simplificada exigindo apenas materiais refinados (Steel, Leather, Cord) e Adena, sem necessidade de fragmentos específicos de receita.

2. **Ativação Inicial do Sistema de Coleções**:
   - Deseja que a tela de Coleções já inicie com ~15 coleções clássicas de Season 1 (No-Grade e D-Grade, focadas em P.Atk, P.Def, Max HP, Max MP, Accuracy e Weight Limit)?

---

## 5. Arquitetura dos Sistemas Propostos & Mudanças

```text
┌───────────────────────────────────────────────────────────────────────────────┐
│                    NOVO ECOSSISTEMA ECONÔMICO ADEN ARENA                      │
└───────────────────────────────────────────────────────────────────────────────┘
  [Grind Idle: Monstros] ──► Dropam: Recursos Brutos + Pedaços + Adena
            │                      │
            │                      ▼
            │               [Life Activities: Mina/Coleta/Caça/Pesca]
            │                      │
            ▼                      ▼
    [Gera Craft Points]     [Refinaria 2.0: Steel, Leather, Cord, Fish Oil]
            │                      │
            ▼                      ▼
  [Common Craft L2]         [Forja Clássica: Sets D-Grade (Brigandine, etc.)]
   (Shots, Poções)                 │
                                   ▼
                   [Equipamentos Equipados & Encantados]
                                   │
              ┌────────────────────┴────────────────────┐
              ▼                                         ▼
      [Falha no Enchant]                       [Equipamento Obsoleto]
              ▼                                         ▼
   [Cristais D/C Gerados]                      [Sistema de Coleções]
              ▼                                (Destruição Permanente
   [Ingrediente para Shots]                      para Stats de Conta)
```

---

## 6. Alterações Propostas Arquivo por Arquivo

### 6.1 Núcleo de Forja e Refino (Craft & Refinery)

#### [MODIFY] [`RefineryService.js`](file:///D:/BROWSER/AdenArena/lineage-idle/src/services/lifeActivities/RefineryService.js)
- Adicionar refino de subprodutos da pesca: `fish_oil` (Óleo de Peixe) e `pure_fish_oil` a partir de peixes capturados.
- Assegurar que os 12 materiais refinados (`steel`, `crafted_leather`, `braided_hemp`, `cord`, `coarse_bone_powder`, `silver_mold`, `cokes`, `varnish`) possuam peso e taxonomia unificados com a forja.

#### [MODIFY] [`recipes_drops.js`](file:///D:/BROWSER/AdenArena/lineage-idle/src/data/items/recipes_drops.js) e [`CraftService.js`](file:///D:/BROWSER/AdenArena/lineage-idle/src/services/CraftService.js)
- Substituir o gerador procedural genérico por um **catálogo canônico de receitas D-Grade e C-Grade**:
  - Armaduras: *Brigandine Tunic/Gaiters/Helmet/Boots/Gloves, Reinforced Leather Set, Manticore Skin Set, Knowledge Robe Set, Mithril Tunic/Hose*.
  - Armas: *Bastard Sword, Claymore, Elven Bow, Gastraphetes, Staff of Life, Heavy Mace, Crimson Sword, Tomahawk*.
  - Escudos e Acessórios: *Brigandine Shield, Hoplon, Elven Jewelry*.
- Todas as receitas consumirão os materiais refinados da `RefineryService`.
- Adicionar receita canônica de produção de Soulshots D/C: `crystal_d` + `soul_ore` = `soulshot_d` em pacotes de 500 unidades.

---

### 6.2 Sistema de Coleções de Conta (Collections) — Novo Ralo Canônico de Gear

#### [NEW] [`CollectionService.js`](file:///D:/BROWSER/AdenArena/lineage-idle/src/services/CollectionService.js)
- Criar serviço canônico de coleções de conta.
- Cada entrada de coleção possui:
  - `id`, `name`, `category` (Armas, Armaduras, Acessórios, Gerais), `requiredItems: [{ itemId, enchantLvl }]`.
  - `stats`: bônus permanentes aplicados ao personagem (`patk`, `pdef`, `maxHp`, `maxMp`, `critRate`, etc.).
- Ao depositar o item, ele é **removido definitivamente do inventário (destruído)** e a entrada da coleção é registrada no `state.collections`.
- Integração direta com `CombatPowerService.js` para refletir o CP das coleções desbloqueadas.

#### [NEW] [`collections.js`](file:///D:/BROWSER/AdenArena/lineage-idle/src/data/collections.js)
- Catálogo de coleções da Season 1:
  - *Infantaria de Gludio (No-Grade)*
  - *Legião de Ferro (D-Grade Heavy: Brigandine)*
  - *Patrulheiros das Sombras (D-Grade Light: Manticore & Reinforced)*
  - *Círculo dos Magos de Dion (D-Grade Robe: Knowledge)*
  - *Armamento Pesado de Gludin (Bastard Sword + Claymore)*
  - *Precisão Élfica (Elven Bow + Gastraphetes)*

---

### 6.3 Mecânica de Tiros (Shots) e Bônus de Conjunto

#### [MODIFY] [`CombatEngine.js`](file:///c:/Users/duuha/Downloads/adenarena-main/adenarena-main/lineage-idle/src/engine/CombatEngine.js) / [`main.js`](file:///c:/Users/duuha/Downloads/adenarena-main/adenarena-main/lineage-idle/main.js)
- Implementar regra de ativação por grau e consumo justo 1:1:
  - Consumo: exatamente 1 tiro por ataque para todas as armas (sem penalidade arbitrária de 2–4 tiros para arcos, dada a distância homogênea em jogo idle).
  - Tiro dedicado da grade da arma (`soulshot_ng`, `soulshot_d`, `soulshot_c`): concede **+100% de dano** (2.0x).
  - Tiro universal (`soulshot_universal`, `spiritshot_universal`): atua como coringa automático para qualquer grau, concedendo **+30% de dano** (1.30x).
  - Tiros de grau inferior ao da arma não ativam em armas superiores (ex: arma D com apenas shot NG não consome o tiro e mantém dano base 1.0x).
  - Prioridade inteligente: se houver tiros dedicados e universais no inventário, consome primeiro o tiro dedicado para entregar o multiplicador máximo (+100%).

#### [MODIFY] [`EquipmentService.js`](file:///D:/BROWSER/AdenArena/lineage-idle/src/services/EquipmentService.js)
- Implementar suporte canônico a **Bônus Parcial de Conjuntos de Armadura (3/5 peças)**:
  - 3 peças: Concede 50% dos bônus de atributos defensivos do conjunto.
  - 5 peças: Concede 100% dos bônus estatísticos + efeitos especiais exclusivos do set completo.

---

### 6.4 Augmentação e Encantamento Canônico

#### [MODIFY] [`AugmentationService.js`](file:///D:/BROWSER/AdenArena/lineage-idle/src/services/AugmentationService.js)
- **Eliminar o bypass de Adena**: A augmentação passa a exigir a presença obrigatória de uma **Life Stone** no inventário.
- Adicionar custo em **Gemstones** conforme o grau da arma (D-Grade = 5x Gemstone D; C-Grade = 10x Gemstone C).
- Adequar o pool de Life Stones para o escopo da Season 1:
  - `life_stone_28` (No-Grade / D-Grade básica)
  - `life_stone_34` (D-Grade intermediária)
  - `life_stone_40` (D-Grade TOP / C-Grade)
- As pedras passam a dropar de Monstros Campeões e Raid Bosses da Season 1.

#### [MODIFY] [`EnchantmentService.js`](file:///D:/BROWSER/AdenArena/lineage-idle/src/services/EnchantmentService.js)
- Ajustar cálculo de cristais gerados na quebra (+4 em diante): número de cristais proporcional ao valor e nível de encantamento do item quebrado.
- Suporte explícito a `scroll_blessed_weapon` e `scroll_blessed_armor`: na falha, o item **não quebra em cristais**, mantendo-se intacto com encantamento resetado para +0 ou para o limite seguro (+3/+4).

---

### 6.5 Broches e Joias de Broche Canônicas

#### [NEW] [`broochJewels.js`](file:///D:/BROWSER/AdenArena/lineage-idle/src/data/items/broochJewels.js)
- Definição canônica das joias de broche:
  - **Ruby** (Lv 1 a 5): +P.Atk e +Bônus de dano de Soulshot.
  - **Sapphire** (Lv 1 a 5): +M.Atk e +Bônus de dano de Spiritshot.
  - **Diamond** (Lv 1 a 5): +P.Def e +Resistência a Crítico Físico.
  - **Pearl** (Lv 1 a 5): +M.Def e +Resistência a Crítico Mágico.
  - **Opal** (Lv 1 a 5): +Todos os Atributos Básicos e Dano de Habilidades.
- Definição do Broche D-Grade (2 slots) e Broche C-Grade (3 slots).

#### [MODIFY] [`SynthesisService.js`](file:///D:/BROWSER/AdenArena/lineage-idle/src/services/SynthesisService.js)
- **Remover a fusão de espadas/armaduras duplicadas** (`isGear`).
- Focar o motor de síntese exclusivamente em:
  1. Fusão de Joias de Broche (ex: Ruby Lv 1 + Ruby Lv 1 = Ruby Lv 2 com chance calculada).
  2. Fusão de Talismãs (Talisman of Aden / Talisman of Eva).
  3. Síntese de Dolls / Agathions.

#### [MODIFY] [`cpBalance.js`](file:///D:/BROWSER/AdenArena/lineage-idle/src/data/balance/cpBalance.js)
- Ativar o cálculo de `jewelBroochCp` (que atualmente estava zerado fixo `const jewelBroochCp = 0;`), somando os valores de CP proporcionais aos níveis das joias de broche equipadas no jogador.

---

### 6.6 Integração das Atividades de Vida (Life Activities)

#### [MODIFY] [`FishingService.js`](file:///D:/BROWSER/AdenArena/lineage-idle/src/services/FishingService.js)
- O peixe pescado pode ser processado na bancada de Culinária/Alquimia:
  - *Guisado de Peixe do Lago*: Consumível com duração de 20 minutos (+10% P.Atk, +10% M.Atk).
  - *Óleo de Peixe*: Ingrediente indispensável para lubrificação de engrenagens de arcos e armaduras leves na forja.

#### [MODIFY] [`ManorService.js`](file:///D:/BROWSER/AdenArena/lineage-idle/src/services/ManorService.js)
- As colheitas agrícolas de sementes (Desert Wheat, Cactoid Seed) são entregues nos feudos em troca de ingredientes raros de forja (`Varnish of Purity`, `Enori`, `Stem`) ou processadas em Poções de Cura Concentradas.

---

## 7. Plano de Verificação e Qualidade

### 7.1 Testes Automatizados Unitários e de Integração
- Executar suíte completa canônica de testes:
  ```powershell
  npm test
  ```
- Criar novos testes dedicados para os subsistemas adaptados:
  - `tests/unit/craftServiceCanonical.test.js`: Validar receitas D-Grade consumindo materiais de refino.
  - `tests/unit/collectionService.test.js`: Validar remoção física do item do inventário e concessão cumulativa de atributos e CP.
  - `tests/unit/shotConsumptionScaled.test.js`: Validar consumo de 2-4 tiros em arcos e multiplicadores x1/x2/x3 em magias AoE.
  - `tests/unit/broochJewelsSynthesis.test.js`: Validar fusão de joias de broche Lv 1 a 5 e cálculo correto no CP.
  - `tests/unit/armorPartialBonus.test.js`: Validar bônus 3/5 e 5/5 de conjuntos de armadura.

### 7.2 Verificação de Build
- Garantir integridade de build de produção sem quebras ou dependências circulares:
  ```powershell
  npm run build
  ```

### 7.3 Verificação de Não-Regressão dos 3 Pilares Intocáveis
- Assegurar que a Curva de EXP (`LevelEngine.js`), o Mercado (`MarketService.js`) e as Expedições (`ExpeditionService.js`) mantenham 100% dos seus testes e comportamentos originais inalterados.
