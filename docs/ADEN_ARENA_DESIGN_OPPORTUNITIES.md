# ADEN ARENA — DESIGN OPPORTUNITIES CATALOG
**Documento:** Catálogo Estruturado de Oportunidades de Design (Lineage II ⟷ Aden Arena)  
**Fase:** Fase 2 — Da Coleta ao Design Estrutural  
**Data:** 16 de Setembro de 2026  
**Status:** CANÔNICO / NÃO-INVASIVO / EM INVESTIGAÇÃO  
**Regra Fundamental:** Uma oportunidade não representa compromisso imediato de implementação. Cada oportunidade documenta o princípio de design, as dependências e o impacto sistêmico.

---

## ÍNDICE DE OPORTUNIDADES

| ID | Título da Oportunidade | Domínio do Aden Arena | Complexidade | Status de Decisão |
|:---:|:---|:---|:---:|:---:|
| **OP-001** | Common Craft como Conversor de Abates Idle em Pergaminhos | Forja / Idle Loop | Média | **ADAPT** |
| **OP-002** | Consumo Diferenciado de Tiros por Tipo de Arma e Multiplicador AoE | Combate / Economia | Baixa | **ADAPT** |
| **OP-003** | Fechamento da Cadeia Econômica de Refino para Equipamentos D/C | Produção / Refino / Gear | Média | **REWORK** |
| **OP-004** | Sistema de Coleções (Collections) como Ralo Eterno de Equipamento | Metagame / Inventário | Média | **ADAPT** |
| **OP-005** | Checkpoints de Segurança na Síntese de Soul Crystals (5 em 5) | Aprimoramento / Gear | Baixa | **ADAPT** |
| **OP-006** | Pity System com Acúmulo de Falhas na Fusão de Dolls | Coleções / Dolls | Baixa | **ADAPT** |
| **OP-007** | Bônus Escalonados de Armadura (3 peças parcial / 5 peças completo) | Equipamentos / Sets | Baixa | **ADAPT** |
| **OP-008** | Afinidade de Armas em Guardiões / Mascotes de Combate | Companheiros / Combate | Média | **INVESTIGATE** |
| **OP-009** | Magic Lamp como Jackpots Ocasionais de EXP/SP durante o Grind | Progressão / Dopamina | Baixa | **ADAPT** |
| **OP-010** | Alinhamento Fiscal e Teto de 10 Lotes no Mercado P2P | Economia / Mercado | Baixa | **ADAPT** |
| **OP-011** | Pergaminhos de Bênção (Item Blessing) como Aprimoramento Seguro | Aprimoramento / Gear | Média | **INVESTIGATE** |
| **OP-012** | Integração do Manor com Sementes e Troca de Refinados | Economia / Agricultura | Média | **KEEP INVESTIGATING** |

---

```text
OPPORTUNITY ID:
OP-001

SOURCE CONCEPT:
Common Craft System (Universal Kill Charge Gauge)

SOURCE:
https://l2wiki.com/essence/mechanics/making/common/

ADEN ARENA SYSTEM:
Produção / Idle Progression Loop

CURRENT STATE:
O jogo possui CraftService com 13 receitas manuais. O jogador acumula milhões de abates no modo idle sem que esses abates gerem insumos de aprimoramento de forma autônoma. Pergaminhos de encantamento dependem quase que exclusivamente de drops de chefes ou compras diretas no Shop.

OBSERVED GAP:
Falta um conversor universal e transparente que transforme o tempo de grinding em insumos utilitários (Enchant Scrolls e itens de bênção), gerando gratificação passiva contínua para o jogador.

DESIGN PRINCIPLE:
O combate contínuo deve alimentar uma barra secundária de utilidade que recompensa a permanência do jogador com capacidade de autoforja de ferramentas essenciais sem intermediação de NPCs.

POSSIBLE ADAPTATION:
Implementar uma barra de "Carga de Criação Comum" na UI de caça que acumula pontos a cada mob derrotado. Ao completar 100%, o jogador pode escolher gastar a carga para tentar gerar Scroll: Enchant Weapon (D/C), Scroll: Enchant Armor (D/C) ou Poções Especiais.

DEPENDENCIES:
InventoryService, catálogo de consumíveis, UI do estágio de combate.

CONFLICTS:
Nenhum. Harmoniza-se com a premissa de um RPG idle autossuficiente.

SEASON 1 IMPACT:
Alto e extremamente positivo. Concede aos jogadores casuais e F2P uma fonte previsível de pergaminhos de encantamento para levar seus sets D-Grade e C-Grade até o seguro +3/+4.

CONTENT GAPS:
Definir tabela de ponderação de pontos ganhos por nível de monstro.

IMPLEMENTATION COMPLEXITY:
Medium

STATUS:
ADAPT
```

---

```text
OPPORTUNITY ID:
OP-002

SOURCE CONCEPT:
Consumo Diferenciado de Tiros por Arma e Multiplicadores AoE

SOURCE:
https://l2wiki.com/essence/articles/936.html

ADEN ARENA SYSTEM:
Combat Engine / Economia de Consumíveis

CURRENT STATE:
Atualmente, o consumo de Soulshots e Spiritshots no CombatSimulator é uniforme (1 por hit/spell), independente se o herói empunha uma adaga leve de ataque rápido, um arco longo de altíssimo impacto à distância ou dispara uma nevasca que atinge 8 inimigos simultaneamente.

OBSERVED GAP:
Classes de arqueiros e magos de dano em área desfrutam de vantagens táticas massivas de posicionamento e limpeza de ondas sem arcar com o custo econômico proporcional de manutenção.

DESIGN PRINCIPLE:
Custo proporcional ao poder de projeção, alcance e impacto em área. A eficiência de limpeza de tela deve ter um preço monetário balanceado para manter a relevância tática das classes de alvo único corpo a corpo.

POSSIBLE ADAPTATION:
Adotar a tabela do Lineage II Essence no CombatSimulator:
- Armas Melee e Magias Single-Target: 1 tiro.
- Arcos: 2 tiros (No-Grade e D-Grade), 3 tiros (C-Grade).
- Habilidades AoE: 1 a 3 alvos = x1; 4 a 8 alvos = x2; 9 a 16 alvos = x3.

DEPENDENCIES:
CombatSimulator.js, auto-shot logic no IdleGame.tsx.

CONFLICTS:
Exige ajuste no volume de geração de Adena nas zonas intermediárias para evitar que arqueiros fiquem sem recursos precocemente.

SEASON 1 IMPACT:
Alto. Restabelece o equilíbrio entre guerreiros corpo a corpo (maior risco físico, menor custo de shots) e arqueiros/magos (menor risco, maior custo de shots).

CONTENT GAPS:
Nenhum. A tabela canônica da fonte está 100% documentada.

IMPLEMENTATION COMPLEXITY:
Low

STATUS:
ADAPT
```

---

```text
OPPORTUNITY ID:
OP-003

SOURCE CONCEPT:
Cadeia Completa de Forja Anã (Raw Resource → Processing → Recipe → Equipment)

SOURCE:
https://l2wiki.com/essence/articles/1033.html / Classic Dwarf Recipe Tree

ADEN ARENA SYSTEM:
Life Activities / RefineryService / CraftService

CURRENT STATE:
O RefineryService processa com perfeição 12 insumos refinados (Steel, Crafted Leather, Coarse Bone Powder, Cord, Braided Hemp, Silver Mold, etc.). No entanto, CRAFTING_RECIPES possui apenas 13 itens (quase todos de bosses ou tomos de habilidade), enquanto os monstros comuns dropam centenas de armas e armaduras prontas.

OBSERVED GAP:
A cadeia econômica está quebrada no elo final: os materiais refinados de mineração, coleta e caça não possuem receitas suficientes de armas e armaduras D-Grade e C-Grade para onde fluir, tornando-se materiais órfãos no inventário.

DESIGN PRINCIPLE:
Todo insumo refinado deve ter ao menos três receitas de equipamento ou aprimoramento como destino canônico. Equipamentos de alto desempenho devem exigir materiais processados para valorizar as profissões.

POSSIBLE ADAPTATION:
Expandir CRAFTING_RECIPES para cobrir os principais conjuntos de Season 1:
- D-Grade: Brigandine Set (consome Steel, Crafted Leather, Iron Ore), Manticore Set (consome Crafted Leather, Cord), Mithril Tunic (consome Braided Hemp, Silver Thread).
- C-Grade: Full Plate Armor (consome Steel Ingot, Crafted Leather), Plated Leather (consome Crafted Leather, Cord), Karmian Robe (consome Braided Hemp, Cotton Thread).
- Armas D/C: Bastard Sword, Elven Bow, Samurai Longsword, Homunkulus Sword.
- Reduzir a taxa de drop de equipamentos 100% prontos de monstros comuns, substituindo-os por padrões (Patterns/Blades) e matérias brutas.

DEPENDENCIES:
CraftService.js, recipes_drops.js, RefineryService.js, ResourceDictionary.js.

CONFLICTS:
Nenhum conflito conceitual. Exige adição cuidadosa de receitas sem alterar contratos de poder existentes.

SEASON 1 IMPACT:
Crítico. Transforma o jogo em uma experiência coesa onde coletar ervas, minerar carvão e caçar peles finalmente serve para forjar o melhor equipamento do personagem.

CONTENT GAPS:
Formalizar a lista de ingredientes exatos por receita (proposta em content_gaps.json).

IMPLEMENTATION COMPLEXITY:
Medium

STATUS:
REWORK
```

---

```text
OPPORTUNITY ID:
OP-004

SOURCE CONCEPT:
Collections System (Account-Wide Gear Sacrificial Sink)

SOURCE:
https://l2wiki.com/essence/mechanics/collections/

ADEN ARENA SYSTEM:
Metagame / Gestão de Inventário / Ralo Econômico

CURRENT STATE:
Equipamentos No-Grade e D-Grade obsoletos acumulados durante horas de caça idle são liquidados no botão de venda em massa (`sellAllJunk`) por valores irrisórios de Adena, acelerando a inflação e esvaziando o valor intrínseco dos itens.

OBSERVED GAP:
Inexistência de um ralo definitivo que consuma o excesso de armas e armaduras dropadas no idle, convertendo-as em progressão de longo prazo para toda a conta.

DESIGN PRINCIPLE:
O sacrifício definitivo de itens descartáveis em troca de atributos permanentes pequenos e cumulativos estabiliza o valor de mercado de itens de todos os patamares.

POSSIBLE ADAPTATION:
Criar o módulo de Coleções no CardCodexService para a Season 1:
- Coleção "Pioneiros da Ilha": Registrar Dagger, Short Spear, Hunting Bow e Club (+15 Max HP).
- Coleção "Guarda de Gludio": Registrar Brigandine Breastplate e Gaiters (+5 P.Def).
- Coleção "Artesãos de Dion": Registrar Bastard Sword +3 e Elven Bow +3 (+8 P.Atk).
Ao registrar o item, ele é consumido permanentemente do inventário e a coleção é ativada para todos os personagens da conta.

DEPENDENCIES:
CardCodexService.js, InventoryService.js, CombatPowerService.js.

CONFLICTS:
Deve respeitar o teto orçamentário de CP do MASTER_GAME_DATA_CONTRACT (Codex CP não pode estourar o limite de metagame).

SEASON 1 IMPACT:
Muito alto. Estimula o jogador a buscar itens variados de zonas anteriores para preencher seu catálogo.

CONTENT GAPS:
Definir os 12 conjuntos de coleções exclusivos da Season 1 (Lv 1–40).

IMPLEMENTATION COMPLEXITY:
Medium

STATUS:
ADAPT
```

---

```text
OPPORTUNITY ID:
OP-005

SOURCE CONCEPT:
Checkpoints Determinísticos de Síntese de Soul Crystals (Checkpoints 1/6/11/16)

SOURCE:
https://l2wiki.com/essence/articles/225.html

ADEN ARENA SYSTEM:
Soul Crystals / CraftService (SA)

CURRENT STATE:
A progressão de Special Ability (SA) no CraftService utiliza estágios de 1 a 15, mas a probabilidade de falha sem patamares seguros pode causar frustração ou estagnação no aprimoramento de armas.

OBSERVED GAP:
Falta uma demarcação clara de marcos de segurança onde o jogador tem certeza de que seu cristal não regredirá além daquele marco ao falhar em níveis superiores.

DESIGN PRINCIPLE:
Sistemas probabilísticos de alto custo precisam de patamares de segurança (*safety milestones*) para incentivar o jogador a arriscar novas tentativas sem medo de regressão catastrófica.

POSSIBLE ADAPTATION:
Incorporar a regra do L2Wiki Essence:
- Nível 1 a 5: falha retorna para Nível 1.
- Nível 6 a 10: falha retorna para Nível 6.
- Nível 11 a 15: falha retorna para Nível 11.

DEPENDENCIES:
CraftService.js, data/items/soul_crystals.js.

CONFLICTS:
Nenhum. Totalmente compatível com a progressão atual.

SEASON 1 IMPACT:
Médio. Melhora a sensação de conquista ao atingir o Nível 5 de Soul Crystal na transição para o Nível 40.

CONTENT GAPS:
Nenhum. Regra matemática explícita na fonte.

IMPLEMENTATION COMPLEXITY:
Low

STATUS:
ADAPT
```

---

```text
OPPORTUNITY ID:
OP-006

SOURCE CONCEPT:
Pity System com Acúmulo de Pontos de Falha em Síntese de Dolls

SOURCE:
https://l2wiki.com/essence/articles/85.html

ADEN ARENA SYSTEM:
Dolls System / Altar de Síntese

CURRENT STATE:
A fusão de Dolls duplicadas possui taxa percentual de sucesso, mas streaks prolongadas de azar podem gerar frustração aguda em jogadores que acumulam cópias sem conseguir evoluir a boneca.

OBSERVED GAP:
Ausência de um medidor visual de piedade que garanta que X falhas consecutivas resultem em 100% de sucesso na tentativa subsequente.

DESIGN PRINCIPLE:
O azar estatístico extremo deve ter uma válvula de escape (*pity guarantee*) que transforme cada falha em progresso mensurável rumo à vitória garantida.

POSSIBLE ADAPTATION:
Ao tentar sintetizar duas Dolls de mesmo nível:
- Cada falha adiciona +10 pontos na barra de piedade daquele tipo de Doll.
- Ao atingir 100 pontos, a próxima fusão tem taxa de sucesso de 100% garantida, zerando a barra em seguida.

DEPENDENCIES:
SynthesisService.js, UI do Altar de Síntese.

CONFLICTS:
Nenhum. Alinha-se diretamente aos princípios éticos do Project Eva.

SEASON 1 IMPACT:
Médio. Mantém o engajamento na busca de Monster Dolls nas zonas de caça.

CONTENT GAPS:
Nenhum.

IMPLEMENTATION COMPLEXITY:
Low

STATUS:
ADAPT
```

---

```text
OPPORTUNITY ID:
OP-007

SOURCE CONCEPT:
Bônus Escalonados de Armaduras (3 Peças Parcial / 5 Peças Completo)

SOURCE:
https://l2wiki.com/essence/articles/1710.html

ADEN ARENA SYSTEM:
EquipmentService / Sets de Armadura

CURRENT STATE:
Muitos conjuntos exigem que o jogador equipe todas as peças para receber qualquer atributo de conjunto. Equipar 4 peças de 5 não fornece benefício parcial em vários casos.

OBSERVED GAP:
A progressão de vestimenta é binária (tudo ou nada), desvalorizando o esforço intermediário do jogador que já obteve o Peito, a Calça e as Luvas, mas ainda não encontrou as Botas.

DESIGN PRINCIPLE:
Recompensar o progresso incremental através de tiers intermediários de sinergia.

POSSIBLE ADAPTATION:
Configurar em `rarity_sets.js`:
- Bônus Parcial (3 peças): Concede +5% Max HP e bônus leve de P.Def.
- Bônus Completo (5 peças): Concede o bônus pleno de identidade (ex.: Brigandine = +5% P.Def, +153 HP, +Resistência a Escudo).

DEPENDENCIES:
EquipmentService.js, rarity_sets.js.

CONFLICTS:
Nenhum.

SEASON 1 IMPACT:
Alto. Suaviza a transição de No-Grade para D-Grade e C-Grade.

CONTENT GAPS:
Parametrizar os bônus parciais dos 8 conjuntos principais de Season 1.

IMPLEMENTATION COMPLEXITY:
Low

STATUS:
ADAPT
```

---

```text
OPPORTUNITY ID:
OP-008

SOURCE CONCEPT:
Afinidade de Armas em Guardiões e Companheiros de Combate

SOURCE:
https://l2wiki.com/essence/articles/55.html

ADEN ARENA SYSTEM:
PetService / Companheiros de Combate

CURRENT STATE:
Mascotes e companheiros fornecem atributos genéricos ou habilidades isoladas sem levar em consideração a classe e a arma empunhada pelo herói principal.

OBSERVED GAP:
Falta de sinergia tática entre o arquétipo do herói e o pet escolhido.

DESIGN PRINCIPLE:
A criação de laços simbióticos entre o herói e seu companheiro amplia as opções táticas e a personalização de builds.

POSSIBLE ADAPTATION:
Associar cada mascote a uma categoria de armamento:
- Lobo: Concede buff adicional se o herói empunhar Adagas ou Lanças.
- Falcão: Concede buff adicional se o herói empunhar Arcos.
- Búfalo: Concede buff adicional se o herói empunhar Espadas Pesadas ou Machados.
- Kookaburra: Concede buff adicional se o herói empunhar Cajados Mágicos.

DEPENDENCIES:
PetService.js, CombatSimulator.js.

CONFLICTS:
Requer validação com o sistema atual de pets para evitar sobrecarga de bônus de CP.

SEASON 1 IMPACT:
Médio.

CONTENT GAPS:
Mapear compatibilidade com os pets atualmente existentes no Aden Arena.

IMPLEMENTATION COMPLEXITY:
Medium

STATUS:
INVESTIGATE
```

---

```text
OPPORTUNITY ID:
OP-009

SOURCE CONCEPT:
Lâmpada Mágica (Magic Lamp) como Jackpots de EXP/SP durante o Grind

SOURCE:
https://l2wiki.com/essence/mechanics/dailymission/

ADEN ARENA SYSTEM:
Progressão / LevelEngine / Retenção

CURRENT STATE:
O ganho de EXP e SP em combates idle é rigorosamente uniforme e linear a cada abate de monstro.

OBSERVED GAP:
A ausência de momentos ocasionais de pico (*spikes de dopamina*) torna sessões longas de caça excessivamente previsíveis.

DESIGN PRINCIPLE:
Introduzir pequenas variações e recompensas estocásticas que quebram a monotonia do grind sem desestabilizar a curva matemática geral.

POSSIBLE ADAPTATION:
Ativar a Lâmpada Mágica (já presente conceitualmente no `magicLampBalance.js`):
- A cada 1.000 monstros abatidos, 1 Lâmpada é concedida.
- Ao abrir, sorteia Lâmpada Verde (65% - 1x pacote de EXP), Azul (30% - 3x pacote), Roxa (4% - mega pacote de SP) ou Vermelha (1% - jackpot massivo de EXP/SP).

DEPENDENCIES:
LevelEngine.js, QuestService.js.

CONFLICTS:
Deve respeitar estritamente a monotonicidade do MASTER_PROGRESSION_CONTRACT (não pode permitir saltos absurdos de níveis).

SEASON 1 IMPACT:
Alto. Proporciona momentos empolgantes durante o grinding.

CONTENT GAPS:
Nenhum. Coeficientes já calibrados no `magicLampBalance.js`.

IMPLEMENTATION COMPLEXITY:
Low

STATUS:
ADAPT
```

---

```text
OPPORTUNITY ID:
OP-010

SOURCE CONCEPT:
Alinhamento Fiscal e Teto de 10 Lotes do World Trade no Mercado P2P

SOURCE:
https://l2wiki.com/essence/articles/1138.html

ADEN ARENA SYSTEM:
MarketService.js (Mercado de Giran)

CURRENT STATE:
O MarketService possui taxa imperial de 5% e sincronização via Cloud, mas a quantidade de lotes por jogador e os prazos de expiração precisam de consolidação formal para evitar spam no banco de dados.

OBSERVED GAP:
Risco de congestionamento de anúncios antigos ou de jogadores monopolizarem as páginas de comércio.

DESIGN PRINCIPLE:
Escassez artificial de slots de venda força o jogador a precificar adequadamente e a girar seu estoque com inteligência.

POSSIBLE ADAPTATION:
- Limitar formalmente a 10 lotes simultâneos por conta (incluindo vendidos pendentes e ativos).
- Estabelecer validade de 14 dias para o anúncio, com devolução automática para o inventário após esse prazo.
- Cobrar taxa de listagem inicial em Adena equivalente a 5% do valor anunciado como ralo imediato contra anúncios abusivos.

DEPENDENCIES:
MarketService.js, Firebase/Firestore storage.

CONFLICTS:
Nenhum. Estabiliza a infraestrutura de dados e a macroeconomia.

SEASON 1 IMPACT:
Médio.

CONTENT GAPS:
Nenhum.

IMPLEMENTATION COMPLEXITY:
Low

STATUS:
ADAPT
```

---

```text
OPPORTUNITY ID:
OP-011

SOURCE CONCEPT:
Pergaminhos de Bênção de Equipamento (Item Blessing)

SOURCE:
https://l2wiki.com/essence/articles/194.html

ADEN ARENA SYSTEM:
Enchantment / Aprimoramento Não-Destrutivo

CURRENT STATE:
O aprimoramento de equipamentos apoia-se fortemente em pergaminhos de encanto que quebram o item em caso de falha acima do limite seguro.

OBSERVED GAP:
Falta um aprimoramento secundário de prestígio que forneça atributos extras sem risco de perda do item no fim da Season 1.

DESIGN PRINCIPLE:
Oferecer eixos de melhoria seguros para jogadores que atingiram o limite seguro (+3/+4) e não desejam arriscar a destruição de seu equipamento principal.

POSSIBLE ADAPTATION:
Permitir a aplicação de *Scroll of Blessing* em armas e armaduras de Grau C para conceder status "Abençoado", conferindo +2 Combat Power fixo e bônus de 5% na eficácia de Soulshots sem chance de quebra do item.

DEPENDENCIES:
EnchantmentService.js, CombatPowerService.js.

CONFLICTS:
Requer calibrar com cuidado os bônus para não inflacionar o CP.

SEASON 1 IMPACT:
Médio. Excelente atividade de endgame para o Nível 40.

CONTENT GAPS:
Definir a fonte exata dos pergaminhos de bênção (recompensa de reides da Queen Ant ou forja especial).

IMPLEMENTATION COMPLEXITY:
Medium

STATUS:
INVESTIGATE
```

---

```text
OPPORTUNITY ID:
OP-012

SOURCE CONCEPT:
Manor System Integrado com Refino e Cidades de Feudo

SOURCE:
https://l2wiki.com/essence/articles/1033.html

ADEN ARENA SYSTEM:
ManorService.js / Life Activities

CURRENT STATE:
O ManorService existe como estrutura embrionária (`state.manorData`), permitindo comprar sementes e colher colheitas básicas de Gludio, mas opera isolado do restante da economia.

OBSERVED GAP:
O Manor não alimenta nenhuma cadeia de produção de poções, forja ou culinária.

DESIGN PRINCIPLE:
Mecânicas agrícolas e feudais devem gerar insumos consumíveis ou reagentes específicos de tinturas e óleos de refino.

POSSIBLE ADAPTATION:
Conectar os cultivos colhidos no Manor (como Trigo Gélido de Gludio e Ervas Feudais) à criação de poções avançadas de Haste e Varnish of Purity no RefineryService.

DEPENDENCIES:
ManorService.js, RefineryService.js, ShopService.js.

CONFLICTS:
Complexidade adicional de gerenciamento para o jogador casual de idle.

SEASON 1 IMPACT:
Baixo na Season 1; mais relevante para a Season 2 com cerco de castelos e taxas territoriais.

CONTENT GAPS:
Catálogo de sementes e recompensas das províncias de Dion e Giran.

IMPLEMENTATION COMPLEXITY:
Medium

STATUS:
KEEP INVESTIGATING
```

---
**Fim do Catálogo de Oportunidades.**
