# ADEN ARENA — DESIGN GAPS & RESOURCE HEALTH AUDIT
**Documento:** Auditoria Técnica de Lacunas de Design e Mapeamento de Saúde de Recursos  
**Fase:** Fase 2 — Da Coleta ao Design Estrutural  
**Data:** 16 de Setembro de 2026  
**Status:** CANÔNICO / AUDITADO / NÃO-INVASIVO  
**Escopo Principal:** Temporada 1 (Nível 1 ao 40, Graus No-Grade, D-Grade e C-Grade).

---

## 1. MATRIZ OBJETIVA DE DESIGN GAPS

Abaixo está a análise das lacunas estruturais identificadas no código atual do Aden Arena quando confrontado com as leis de design e a base documental canônica:

| Sistema / Domínio | Estado Atual no Aden Arena | Evidência Externa (Lineage II) | Gap de Design Identificado | Impacto no Jogo |
|:---|:---|:---|:---|:---|
| **Cadeia de Forja D/C** | `CRAFTING_RECIPES` possui apenas 13 itens, dos quais apenas 2 criam armadura/arma básica. | Clássico e Essence possuem receitas canônicas completas para todos os sets D e C. | **Ruptura de Forja:** 95% das armas e armaduras D e C não podem ser fabricadas via receitas. | **Crítico:** Desvaloriza artesãos e anões; força o jogador a depender exclusivamente de drops prontos. |
| **Materiais Refinados** | `RefineryService.js` refina 12 materiais nobres (`steel`, `crafted_leather`, `cord`, etc.). | Materiais refinados são o insumo primário de todas as receitas de ferreiro. | **Materiais Órfãos:** Insumos refinados acumulam no inventário sem receptores de consumo na forja. | **Alto:** Jogador investe tempo e Adena no refino mas não tem onde aplicar o produto final. |
| **Drops de Monstros** | `MONSTER_DROPS` entrega centenas de armas e armaduras 100% completas em zonas comuns. | Monstros dropam matérias-primas e peças-chave (`blades`, `patterns`); gear pronta é ultra-rara. | **Hiperabundância de Gear Pronta:** A forja é contornada porque monstros comuns dropam o produto final. | **Crítico:** Quebra a economia de produção; inflaciona o inventário com lixo vendível. |
| **Ralo de Equipamentos** | Equipamentos obsoletos de graus anteriores são liquidados no NPC por ouro irrisório. | Sistema de Coleções (`Collections`) destrói permanentemente armas e armaduras por stats de conta. | **Ausência de Ralo Sacrificial:** Equipamentos dropados no idle não possuem saída permanente de metagame. | **Alto:** Desvalorização rápida de No-Grade e D-Grade; geração excessiva de Adena passiva. |
| **Economia de Tiros (Shots)** | Consumo plano de 1 tiro para qualquer arma ou habilidade no `CombatSimulator.js`. | Arcos consomem 2–4 tiros; magias em área consomem de x1 a x3 tiros conforme o número de alvos. | **Assimetria de Custo de Combate:** Arqueiros e magos AoE caçam com o mesmo custo operacional de guerreiros melee. | **Alto:** Distorce a viabilidade econômica entre classes; favorece desproporcionalmente ranged/AoE. |
| **Autoforja de Grinding** | Combate idle gera apenas ouro, EXP e drops diretos; pergaminhos vêm de boss ou shop. | `Common Craft` acumula carga a cada mob abatido para forjar pergaminhos e utilitários. | **Ausência de Conversor Idle:** Sessões longas de grinding não geram insumos de aprimoramento de forma autônoma. | **Médio:** Jogadores casuais travam a evolução de encanto por falta de pergaminhos. |
| **Checkpoints de Cristais** | Níveis de SA (1 a 15) operam com risco de falha sem marcos rígidos de estabilização. | Soul Crystals (`articles/225.html`) possuem patamares seguros a cada 5 níveis (1, 6, 11, 16). | **Risco de Regressão Severa:** A falha no aprimoramento pode desmotivar o jogador ao zerar o progresso. | **Médio:** Causa aversão ao risco em sistemas de aprimoramento de armas. |
| **Pity System de Dolls** | Fusão de bonecas duplicadas possui taxa fixa sem acúmulo garantido de progresso. | Dolls (`articles/85.html`) acumulam pontos de falha até concederem 100% de sucesso garantido. | **Incerteza Pura em Colecionáveis:** Falhas sucessivas criam sensação de desperdício absoluto de cópias. | **Médio:** Frustração em um pilar que deveria ser de satisfação e colecionismo. |
| **Sinergia de Armaduras** | Sets exigem todas as peças ativas para conceder bônus de conjunto. | Essence (`articles/1710.html`) concede bônus escalonados: Parcial (3 peças) e Completo (5 peças). | **Binariedade de Equipamento:** Ter 4 peças de um conjunto não oferece nenhum benefício tático intermediário. | **Médio:** Desestimula o uso progressivo de peças novas enquanto o set não estiver 100% fechado. |

---

## 2. RESOURCE HEALTH MAP (MAPA DE SAÚDE DOS RECURSOS)

Abaixo está o mapeamento detalhado da circulação, armazenamento, consumo e papéis dos recursos canônicos no Aden Arena atual:

```text
1. ADENA (🪙)
 ├── Source: Monstros comuns, missões diárias, venda de espólios, raids.
 ├── Storage: state.gold (numérico, ilimitado).
 ├── Consumer: Loja de consumíveis, taxas de refino, taxas de encantamento, taxas de mercado.
 ├── Sink: Taxa imperial de mercado (5%), compra de shots, taxas de forja.
 ├── Progression Role: Combustível operacional contínuo da progressão.
 └── Health Status: SAUDÁVEL (possui fontes ativas e ralos constantes, mas pode inflacionar sem ralo de coleções).

2. ADEN COINS (💎)
 ├── Source: Raids mundiais, World Bosses, chefes épicos, doações.
 ├── Storage: state.adenCoins (numérico).
 ├── Consumer: Cash Shop, Starter Packs, cosméticos, títulos.
 ├── Sink: Compra de itens na Cash Shop.
 ├── Progression Role: Moeda de prestígio e aceleração controlada.
 └── Health Status: SAUDÁVEL (estritamente segregada de Adena comum pelo MASTER_GAME_DATA_CONTRACT).

3. SKILL POINTS - SP (✦)
 ├── Source: Monstros abatidos, conclusão de quests, baús diários.
 ├── Storage: state.sp (numérico).
 ├── Consumer: Desbloqueio e subida de nível de habilidades no CanonicalSkillRegistryV2.
 ├── Sink: Consumo em habilidades ativas e passivas.
 ├── Progression Role: Árvore de evolução do herói.
 └── Health Status: SAUDÁVEL (demanda crescente que acompanha o nível do personagem).

4. PONTOS DE FORJA - CRAFTXP (⚒️)
 ├── Source: Desmanche de equipamentos no Altar / Refino na bancada.
 ├── Storage: state.craftXp (numérico).
 ├── Consumer: Desbloqueio de patamares de criação de itens.
 ├── Sink: Progressão de maestria de forja.
 ├── Progression Role: Nível de artesão do jogador.
 └── Health Status: PARCIAL (acumula facilmente, mas faltam receitas reais para aproveitar os tiers altos).

5. MATÉRIAS-PRIMAS BRUTAS: CAÇA (Pelt, Bone, Suede)
 ├── Source: Profissão de Caça Silvestre (HuntingService), drops de feras.
 ├── Storage: Inventário (slot: 'material', empilhável).
 ├── Consumer: Bancada de Refino (RefineryService).
 ├── Sink: Conversão em Leather, Crafted Leather e Coarse Bone Powder.
 ├── Progression Role: Base para armaduras leves e armas de haste.
 └── Health Status: SAUDÁVEL na entrada e refino, ÓRFÃO na saída da forja.

6. MATÉRIAS-PRIMAS BRUTAS: COLETA (Branch, Stem, Charcoal)
 ├── Source: Profissão de Coleta Botânica (GatheringService), nós de flora.
 ├── Storage: Inventário (slot: 'material', empilhável).
 ├── Consumer: Bancada de Refino (RefineryService).
 ├── Sink: Conversão em Compressed Wood, Varnish, Cord e Braided Hemp.
 ├── Progression Role: Base para arcos, cajados e túnicas mágicas.
 └── Health Status: SAUDÁVEL na entrada e refino, ÓRFÃO na saída da forja.

7. MATÉRIAS-PRIMAS BRUTAS: MINERAÇÃO (Iron Ore, Coal, Silver Nugget, Mithril Ore)
 ├── Source: Profissão de Mineração (MiningService), veios subterrâneos.
 ├── Storage: Inventário (slot: 'material', empilhável).
 ├── Consumer: Bancada de Refino (RefineryService).
 ├── Sink: Conversão em Steel, Steel Ingot, Silver Mold.
 ├── Progression Role: Base para armaduras pesadas, escudos e lâminas metálicas.
 └── Health Status: SAUDÁVEL na entrada e refino, ÓRFÃO na saída da forja.

8. PRODUTOS DE PESCA (Peixes Comuns a Raros)
 ├── Source: Profissão de Pesca (FishingService).
 ├── Storage: Inventário (slot: 'material').
 ├── Consumer: Venda direta em ouro ou permuta por materiais com pescadores.
 ├── Sink: Venda ao NPC / troca por galhos.
 ├── Progression Role: Atividade de lazer / geração de Adena e materiais botânicos.
 └── Health Status: PARCIAL (falta utilidade culinária direta para poções e ensopados de buff temporário).

9. MATERIAIS REFINADOS (Steel, Crafted Leather, Coarse Bone Powder, Cord, Braided Hemp)
 ├── Source: Bancada de Refino (RefineryService.js).
 ├── Storage: Inventário (slot: 'material', empilhável).
 ├── Consumer: CRAFTING_RECIPES (apenas 2 receitas consomem insumos refinados).
 ├── Sink: QUASE INEXISTENTE no ecossistema atual.
 ├── Progression Role: Deveria ser o motor da montagem dos sets D-Grade e C-Grade.
 └── Health Status: [CRITICAL DESIGN GAP] — MATERIAL ÓRFÃO POR AUSÊNCIA DE RECEITAS.

10. CRISTAIS DE FORJA (Crystal D, Crystal C)
 ├── Source: Cristalização de equipamentos quebrados no encantamento ou dissolvidos no Altar.
 ├── Storage: Inventário (slot: 'crystal', empilhável).
 ├── Consumer: Forja de Tomos Sagrados (book_1star, book_2star).
 ├── Sink: Criação de grimórios de classe.
 ├── Progression Role: Moeda de transição mágica entre graus.
 └── Health Status: SAUDÁVEL (possui finalidade estrita e altamente desejada pelo jogador).
```

---

## 3. AUDITORIA DETALHADA DE ITEMIZATION

Cruzando `lineage-idle/src/data/items/` com os contratos canônicos e a Knowledge Base:

### 3.1 Categorias de Itens e Materiais Órfãos
1. **Insumos Refinados Sem Ralo Suficiente**:
   - `steel`: Refinado a partir de Iron Ore e Coal. Utilizado em apenas 1 receita (`armor_full_plate_heavy_armor`). Falta em espadas de ferro, machados e peitorais D-Grade.
   - `crafted_leather`: Refinado a partir de Leather e Cord. Utilizado em apenas 1 receita. Falta em conjuntos leves D-Grade (Manticore, Reinforced).
   - `cord`: Refinado a partir de Cotton Thread. Utilizado em apenas 1 receita intermediária. Falta em arcos e flechas.
   - `braided_hemp`: Refinado a partir de Stem e Cord. Nenhuma receita de equipamento consome este item.
   - `coarse_bone_powder`: Refinado a partir de Bone. Nenhuma receita de arma ou armadura o utiliza atualmente.
   - `silver_mold`: Refinado na bancada. Não é consumido por nenhuma receita de joia ou armadura.

2. **Equipamentos sem Cadeia de Progressão de Forja**:
   - Das 246 armas em `ALL_ITEMS`, mais de **230 armas** só podem ser obtidas se caírem prontas de monstros ou forem compradas no Shop. Não há como forjá-las com materiais obtidos nas Life Activities.
   - Das 88 armaduras principais (peitorais), apenas **2 armaduras** possuem receita na forja.

3. **Recursos com Apenas um Sistema de Consumo vs. Múltiplos Sistemas**:
   - *Excelente integração*: `crystal_d` e `crystal_c` atuam como elo entre quebra de equipamentos e forja de livros de habilidade.
   - *Isolamento excessivo*: Peixes pescados só servem para serem vendidos ou permutados por madeira; não alimentam a forja de elixires ou rações para mascotes.

---

## 4. AUDITORIA DA ESCALA DE EQUIPAMENTOS DA SEASON 1 (LV 1–40)

```text
NO-GRADE (Lv 1–19)
├── Aquisição: Quests iniciais de Talking Island, monstros da Zona 1, Loja de Iniciantes.
├── Encantamento: Permitido (+3 seguro).
├── Transição: Natural e rápida até o nível 20.
└── GAP IDENTIFICADO: Itens No-Grade obsoletos não têm destino além de venda ao NPC por migalhas.
    SOLUÇÃO: Ativação de Coleções de No-Grade (Talking Island Pioneer).

D-GRADE (Lv 20–39)
├── Aquisição: Drops de monstros da Zona 2, Loja de Giran, pouquíssimas receitas.
├── Encantamento: Seguro até +3 em armas e +4 em armaduras de peça única.
├── Transição: Salto substancial de poder e CP no Nível 20.
└── GAP IDENTIFICADO: Os principais sets (Brigandine, Manticore, Mithril) não têm receitas de criação na forja.
    SOLUÇÃO: Adicionar receitas clássicas canônicas que consumam Steel, Crafted Leather e Braided Hemp.

C-GRADE (Lv 40 — Clímax da Season 1)
├── Aquisição: Drops de monstros da Zona 3, Reides de Queen Ant, Loja Avançada.
├── Encantamento: Seguro +3/+4; preparação para o topo do poder da Season 1.
├── Transição: 2ª Transferência de Classe (Specialization) e entrada na Torre da Insolência.
└── GAP IDENTIFICADO: Inexistência de bônus parciais de conjunto e ausência de receitas para Samurai Longsword e Plated Leather.
    SOLUÇÃO: Configuração de bônus de 3 peças em rarity_sets.js e cadastro de receitas C-Grade.
```

---

## 5. AUDITORIA MACROECONÔMICA: BALANÇO DE FAUCETS E SINKS

### Diagnóstico de Fluxo Monetário de Adena:
- **Faucets (Geração)**:
  - Abate contínuo de monstros no modo idle gera de 5.000 a 50.000 Adena por hora no início e dezenas de milhares nas zonas 2 e 3.
  - Venda em massa de equipamentos dropados prontos (`sellAllJunk`) injeta grandes volumes de ouro no sistema sem custo para o jogador.
- **Sinks (Drenos Existentes)**:
  - Consumo contínuo de Soulshots e Spiritshots (dreno eficiente).
  - Taxas de refino na bancada de Life Activities (dreno moderado).
  - Taxa imperial de listagem no Mercado (5% do valor — dreno excelente).
  - Custos de encantamento e compra de poções.
- **Risco Macroeconômico Detectado**:
  - Como monstros dropam equipamentos prontos com frequência alta, o jogador vende dezenas de itens por sessão, gerando **pressão inflacionária de Adena**.
  - **Ajuste Recomendado**: Reduzir a taxa de drop de itens inteiros em favor de matérias-primas e padrões, e canalizar o excedente de itens para o sistema de **Coleções** (onde o item é destruído sem gerar ouro).

---
**Fim da Auditoria de Gaps e Saúde de Recursos.**
