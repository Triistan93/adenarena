# Progressão de materiais e forja — matriz aplicada e pendências

## Objetivo

As profissões de Coleta, Mineração, Caça e Pesca devem complementar o PvE: o combate continua dando XP e Adena, enquanto as profissões abastecem uma cadeia de materiais que permite fabricar equipamentos. O acesso precisa acompanhar o avanço do personagem e a maestria do ofício, do primeiro material à etapa final.

A matriz abaixo foi aplicada aos quatro ofícios. Ela compara o estado atual com o alvo de nível 120 e registra separadamente os ajustes econômicos que ainda dependem de simulação.

## Estado anterior por nível de personagem

| Nível | Acesso declarado | Resultado observado |
|---:|---|---|
| 1 | A primeira zona de cada profissão declara requisito 15. | O atlas não libera zona alguma. Porém, serviços iniciam a atividade na zona inicial salva sem validar esse requisito; o personagem pode receber materiais apesar do cadeado visual. |
| 15–39 | Zonas são liberadas gradualmente, conforme os `minLevel` estáticos de cada catálogo. | A tabela abaixo mostra o requisito atual por região. |
| 40 | Últimas regiões de Coleta e Mineração já estão liberadas. | Todas as seis zonas de cada profissão ficam disponíveis até o nível 40. |
| 41–120 | Não há novos gates de profissão definidos. | O nível 120 obtém as mesmas famílias de materiais já disponíveis no nível 40; o restante do avanço do personagem não abre novas regiões. |

O cap padrão no `StateManager` é 40. A configuração futura da Temporada 4 indica nível máximo 120, e o jogo também aceita cap definido pelo servidor. A progressão das profissões deve funcionar nos dois regimes.

## Zonas e materiais antes da alteração

Os IDs abaixo são os materiais emitidos pelos alvos de cada região. Alguns passam por troca/refino antes de entrar numa receita de equipamento.

| Ofício | Nível atual da zona | Região | Materiais principais |
|---|---:|---|---|
| Coleta | 15 | Campos e Prados de Gludio | `branch`, `charcoal`, `cord`, `cotton_thread` |
| Coleta | 20 | Pântanos Férteis de Dion | `braided_hemp`, `cord`, `varnish`, `branch`, `charcoal` |
| Coleta | 26 | Colinas e Pomares de Giran | `compressed_wood`, `varnish`, `mold_glue`, `silver_thread`, `cotton_thread`, `charcoal` |
| Coleta | 32 | Florestas Gélidas de Oren | `compressed_wood`, `mold_lubricant`, `mold_glue` |
| Coleta | 36 | Planalto Sagrado de Aden | `enria`, `compressed_wood`, `silver_thread` |
| Coleta | 40 | Vale Vulcânico de Goddard | `compressed_wood`, `enria` |
| Mineração | 15 | Galerias de Carvão de Gludio | `coal`, `iron_ore` |
| Mineração | 22 | Minas Ancestrais dos Anões | `iron_ore`, `synthetic_cokes`, `silver_nugget`, `coal` |
| Mineração | 28 | Pedreira das Colinas de Dion | `iron_ore`, `steel`, `silver_nugget`, `mithril_ore`, `synthetic_cokes` |
| Mineração | 34 | Veio Profundo das Gargantas de Giran | `mithril_ore`, `silver_nugget`, `synthetic_cokes`, `steel`, `iron_ore` |
| Mineração | 38 | Fosso Glacial de Schuttgart | `oriharukon_ore`, `mithril_ore`, `iron_ore` |
| Mineração | 40 | Forja dos Deuses de Goddard | `adamantite`, `oriharukon_ore` |
| Caça | 15 | Bosques de Talking Island | `leather`, `cord`, `cotton_thread`, `bone` |
| Caça | 18 | Planícies de Gludio | `leather`, `bone`, `synthetic_cokes`, `braided_hemp`, `crafted_leather` |
| Caça | 22 | Colinas e Pântanos de Dion | `crafted_leather`, `synthetic_cokes`, `suede`, `leather`, `cord`, `bone` |
| Caça | 26 | Selva Litorânea de Giran | `crafted_leather`, `enria`, `cord`, `metallic_thread` |
| Caça | 32 | Terras Nevadas de Oren | `crafted_leather`, `varnish`, `oriharukon_ore`, `durable_metal_plate` |
| Caça | 38 | Picos Rochosos de Goddard | `crafted_leather`, `enria`, `oriharukon_ore`, `metallic_thread` |
| Pesca | 15 | Costa de Talking Island | `branch`, `leather`, `cotton_thread`, `charcoal` |
| Pesca | 18 | Porto de Gludin | `branch`, `suede`, `mithril_ore`, `silver_thread`, `oriharukon_ore` |
| Pesca | 22 | Lago de Elven Village | `iron_ore`, `coal`, `charcoal`, `metallic_fiber` |
| Pesca | 26 | Rio de Dion | `braided_hemp`, `bone`, `steel`, `crafted_leather`, `steel_ingot` |
| Pesca | 32 | Costa de Giran | `oriharukon_ore`, `silver_nugget`, `coal`, `silver_mold` |
| Pesca | 38 | Lago Innadril | `mithril_ore`, `steel`, `crafted_leather`, `adamantite` |

## Onde o sistema não corresponde ao objetivo

1. **O primeiro acesso está desalinhado:** todos os primeiros territórios exigem nível 15, mas os estados novos já apontam para eles e os métodos `start*` não repetem o gate de nível. O serviço pode conceder materiais que o mapa apresenta como bloqueados.
2. **As regiões param de progredir no nível 40:** o último grupo de materiais abre muito antes do cap 120. É preciso ampliar a curva para que as regiões finais acompanhem as etapas avançadas do personagem.
3. **A maestria do ofício não restringe os alvos por nível:** as zonas escolhem entre seus nós e os bônus do ofício/tool influenciam a qualidade; não existe um `minSkillLevel` por material/alvo. Os níveis das ferramentas chegam a 25, mas a habilidade de coleta/mineração chega a 40 e Caça/Pesca a 30.
4. **Corrigido:** os quatro ofícios leem o nível canônico em `lifeActivities`. Saves antigos migram preservando o maior nível e a fração de XP; Coleta/Mineração, Pesca e Caça espelham o resultado nos campos antigos que ainda são lidos por UI e sistemas auxiliares.
5. **Parcial:** `mold_glue` e `mold_lubricant` agora têm entradas canônicas e nomes próprios no inventário. A auditoria original estava errada sobre `steel_ingot`: ele já existe no catálogo/dicionário, mas ainda falta confirmar um consumidor nas receitas de forja/refino. Os três materiais ainda precisam de simulação de custo/benefício antes de adicionar novas receitas.
6. **O catálogo de equipamento não acompanha o cap 120:** uma varredura de `ALL_ITEMS` encontrou equipamento com requisito de personagem até o nível 90. O catálogo atual tem duas peças entre 86 e 90 e nenhuma faixa de equipamento 91–120.
7. **Nível para equipar e nível para fabricar são coisas distintas:** a Forja mostra o nível de uso do item, mas sua disponibilidade na tela depende de materiais e nível de Forja; ela permite fabricar algo que o personagem ainda não pode equipar. O serviço agora também confere o nível de Forja, para que não seja apenas uma trava visual. A regra sobre fabricar antes de poder equipar deve continuar explícita no balanceamento.

## Regras aplicadas e trabalho de balanceamento pendente

- Cada etapa tem três controles: **nível do personagem** abre regiões; **maestria** abre regiões e raridades de materiais; **nível de Forja** valida a receita tanto na interface quanto no serviço.
- As seis zonas usam marcos de personagem **1, 20, 40, 60, 85 e 120** e maestria **1, 5, 10, 15, 20 e 25**. Alvos por raridade usam a mesma curva de maestria: comum 1, incomum 5, raro 10, épico 15 e lendário 25.
- Um estado de zona antigo que fique bloqueado é movido para a região mais alta acessível quando o ofício está ocioso e sem recompensa pendente. Atividades pendentes não são descartadas.
- O cap40 abre as três primeiras regiões; caps60,85 e120 avançam as regiões seguintes. O atlas e os serviços usam os mesmos dados de gate. Ações manuais, AFK e offline escolhem alvos elegíveis pela maestria.
- Ainda é necessário cruzar os novos marcos com receitas/itens fabricáveis em cada etapa, em especial os itens de nível91–120 ausentes do catálogo, e conferir consumidores para `mold_glue`, `mold_lubricant` e `steel_ingot`.
- Quantidades, preços e XP não foram alterados nesta entrega. O próximo balanceamento deve comparar tempo por insumo, custos de ferramenta/consumível/refino, vendas e poder do equipamento com rotas de PvE para evitar que profissão substitua o combate ou vire etapa obrigatória.

## Método e limites

O mapa de zonas foi lido dos catálogos de cada profissão e os resultados cruzados com os outputs dos nós/alvos. O catálogo de receitas foi avaliado com `generateAllCraftingRecipes(ALL_ITEMS)` (998 chaves de receita, com aliases) e as 16 receitas da Refinaria. A distribuição de fontes/consumidores foi normalizada pelos aliases canônicos. Não rodei testes ou build para esta auditoria.


## Implementação (02/10/2026)

Aplicada a curva acima nos catálogos de Pesca, Caça, Coleta e Mineração. `LifeActivityCore` agora limita XP pelo cap de cada profissão (30 para Pesca/Caça e 40 para Coleta/Mineração), consolida as quatro progressões e migra saves preservando nível e progresso percentual. Pesca automática/offline e Caça concedem XP ao estado canônico; campos locais permanecem sincronizados para compatibilidade. Os alvos elegíveis respeitam a maestria também durante AFK/offline. O serviço de Craft valida nível de Forja.

Verificação desta entrega: `node --check` nos quatro serviços, core e quatro telas, além de `git diff --check`; não rodei testes nem build.

## Cadeia concluída — equipamento e materiais (02/10/2026)

### Equipamento fabricável por faixa

| Nível para equipar | Grau/conjunto | Materiais de profissão que entram na cadeia |
|---:|---|---|
| 1–19 | No-Grade | Minério de ferro da Mineração + couro da Caça refinado em camurça. |
| 20–39 | D-Grade | Minério/aço da Mineração, madeira comprimida/cordão da Coleta e couro da Caça; a Pesca pode fornecer insumos auxiliares. |
| 40–51 | C-Grade | Aço, pó de osso, madeira comprimida, verniz e fibras; Caça/Pesca passam a abastecer ingredientes complementares. |
| 52–61 | B-Grade | Mithril, aço, placa durável e tecidos; Mineração, Coleta e Caça dão rotas diretas, com Pesca para insumos. |
| 62–75 | A-Grade | Oriharukon, adamantite, enria e materiais têxteis/couro avançado. |
| 76–84 | S / Frost Lord | Equipamentos S e armas Frost Lord existentes; continuam combinando drops de PvE e materiais de atividade. |
| **85–120** | **S84 Primordial** | **31 equipamentos craftáveis: 13 armas, três armaduras principais (heavy/light/robe), capacetes, botas, luvas, calças, escudo, capa e sigilo.** Requerem nível de Forja 10, Cristal S, Essência Primordial e insumos de metal, madeira, curtume e pesca/refino. Permanecem equipáveis durante toda a faixa 85–120, conforme o contrato de progressão. |

O personagem precisa atingir o nível indicado para **equipar** cada peça. Craft continua dependendo do nível de Forja e dos materiais; assim, um jogador pode fabricar antecipadamente e guardar o item até cumprir o nível de uso.

### Fontes da Essência Primordial

A Essência é um material lendário que pode vir de qualquer um dos quatro ofícios no marco de personagem 85, desde que a maestria alcance 25:

| Ofício | Fonte | Região aberta em |
|---|---|---:|
| Coleta | Flor do Coração Primordial | 85 — Planalto Sagrado de Aden |
| Mineração | Geodo de Essência Primordial | 85 — Fosso Glacial de Schuttgart |
| Caça | Wyvern Primordial de Oren | 85 — Terras Nevadas de Oren |
| Pesca | Esturjão Primordial | 85 — Costa de Giran |

As quatro rotas evitam exigir que o jogador treine uma profissão específica para obter esse componente. As zonas de nível120 mantêm rotas de maior risco/recompensa e fornecem a mesma família de materiais avançados.

### Materiais avançados e receitas de refino

- `mold_glue`: obtida na Coleta ou refinada de verniz + cordão (Forja 4). Consumida nas armaduras Primordiais.
- `mold_lubricant`: obtido na Coleta ou refinado de óleo puro de peixe + cola + verniz (Forja 6). Consumido em armas/capas/sigilos Primordiais.
- `steel_ingot`: obtido na troca de peixes ou refinado de aço + mithril + molde de prata (Forja 8). Consumido nas peças Primordiais.
- `suede`: o couro obtido na Caça agora pode ser refinado em camurça (Forja 1), completando a rota de material necessária para equipamento No-Grade.

As receitas Primordiais requerem Forja 10. Todas as entradas foram verificadas no catálogo; a geração atual contém 31 equipamentos únicos Primordiais, 1.060 chaves de receita (incluindo aliases) e nenhum insumo de receita sem definição em `ALL_ITEMS`.

### Verificação e limites

As quatro rotas da Essência, os consumidores dos três materiais antes sem uso e a existência de todos os ingredientes foram conferidos por leitura dos catálogos e geração de receitas. `node --check` nos módulos alterados e `git diff --check` passaram. Não rodei testes nem build. As quantidades/custos desta primeira versão criam sinks e requisitos de progressão; a taxa real de obtenção por hora e o poder das peças ainda precisam de ajuste após teste jogável.
