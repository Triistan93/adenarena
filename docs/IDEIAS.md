# Ideias do Aden Arena

**Objetivo:** guardar ideias que surgem durante o desenvolvimento sem interromper a tarefa em andamento.

**Como usar:** registrar a ideia e seu contexto; não tratar o registro como aprovação ou compromisso de implementação. A ideia só entra no plano ativo quando for priorizada junto com o trabalho atual.

## Índice

| ID | Ideia | Área | Status |
|---|---|---|---|
| IDEA-001 | Planejador de atividades offline | Progressão / atividades de vida | Capturada — não priorizada |
| IDEA-002 | Farm automático por lista de materiais e rota entre zonas | Forja / caça / atividades de vida | Capturada — não priorizada |
| IDEA-003 | Kit inicial No-Grade completo por classe | Onboarding / equipamentos | Capturada — não priorizada |
| IDEA-004 | Caixas de evento com itens encapsulados | Eventos / recompensas | Capturada — não priorizada |

---

## IDEA-001 — Planejador de atividades offline

**Registrada em:** 07/10/2026
**Status:** Capturada — não priorizada
**Origem:** ideia surgida durante a análise de balanceamento PvE e profissões.

### Ideia

Criar um painel em que o jogador distribui 100% do tempo de atividade offline entre os modos disponíveis. Por exemplo:

- 20% pesca
- 20% caça de profissão
- 20% mineração
- 20% expedições
- 20% Full Hunt PvE

O jogador também poderia configurar os consumíveis permitidos e definir o que deseja priorizar obter em cada atividade.

### Fluxo desejado

1. O jogador abre o planejador antes de sair do jogo.
2. Distribui o orçamento de tempo entre as atividades, com soma obrigatória de 100%.
3. Configura consumíveis, limites de uso e prioridades de recompensa.
4. Ao retornar, recebe um resumo do tempo gasto, atividades executadas, consumíveis usados e recompensas obtidas.

### Regras e dependências a investigar

- Respeitar os limites atuais do modo offline e a eficiência reduzida das atividades.
- Definir se cada percentual representa tempo de relógio ou ciclos de ação, evitando diferenças escondidas entre atividades.
- Determinar como o sistema trata atividades bloqueadas, falta de ferramentas, inventário cheio ou consumíveis insuficientes.
- Não permitir que o mesmo intervalo offline seja contabilizado integralmente em vários modos.
- Definir se o jogador pode salvar predefinições diferentes, como “materiais”, “experiência” e “Adena”.

### Questões em aberto

- O jogador deve informar apenas percentuais ou também uma ordem de prioridade para quando uma atividade não puder continuar?
- O que acontece com a parcela de tempo de uma atividade que fica sem vigor, ferramenta ou espaço no inventário?
- Como expedições entram no mesmo orçamento e como seus tempos de conclusão são contabilizados?

---

## IDEA-002 — Farm automático por lista de materiais e rota entre zonas

**Registrada em:** 07/10/2026
**Status:** Capturada — não priorizada
**Origem:** ideia surgida ao discutir receitas que exigem materiais de mapas diferentes.

### Ideia

Permitir que o jogador escolha um item que deseja fabricar e peça ao personagem para obter os materiais necessários. O personagem consulta a receita e a quantidade já disponível, farma cada recurso na atividade ou zona correspondente e segue para o próximo objetivo quando atingir a quantidade necessária.

Exemplo: para fabricar uma bota Blue Wolf que requer três materiais encontrados em mapas diferentes, o jogador marca a receita e ativa a coleta automática. O personagem fica na primeira zona até obter a quantidade necessária, viaja à próxima zona e repete o processo para cada material pendente.

### Fluxo desejado

1. O jogador seleciona a receita ou item final na Forja.
2. O jogo apresenta materiais necessários, quantidades possuídas e fontes conhecidas.
3. O jogador escolhe quais materiais quer obter automaticamente e define prioridades ou limites.
4. O personagem vai à fonte selecionada e coleta até completar a quantidade pendente.
5. O sistema atualiza o inventário, avança para o próximo material e continua até concluir a lista ou encontrar um bloqueio.
6. Ao final, informa os materiais obtidos, o que ainda falta e por que a rota parou, se aplicável.

### Regras e dependências a investigar

- Integrar as receitas da Forja com zonas de combate, pesca, caça de profissão, mineração, coleta e expedições.
- Usar apenas fontes e tabelas de recompensa válidas para o nível, ferramentas e maestria do personagem.
- Recalcular a necessidade com base no inventário atual e atualizar a lista quando materiais forem obtidos por outras fontes.
- Definir comportamento para materiais compartilhados por várias receitas, drops aleatórios, fontes temporárias e fontes indisponíveis.
- Considerar consumíveis, vigor, capacidade do inventário, tempo offline e limites de cada atividade.
- Evitar viagens inúteis: verificar a quantidade pendente antes de iniciar cada etapa e encerrar a rota quando a receita já puder ser fabricada.

### Questões em aberto

- O jogador escolhe a ordem dos materiais ou o jogo sugere a rota mais curta/eficiente?
- Materiais obtidos além da quantidade necessária devem ser guardados, vendidos ou limitados por uma opção do jogador?
- Ao encontrar várias fontes para um mesmo item, quais critérios definem a recomendação: tempo, risco, custo, vigor ou qualidade da recompensa?
- O que acontece quando uma receita exige materiais produzidos por refinamento ou por outra receita intermediária?

---

## IDEA-003 — Kit inicial No-Grade completo por classe

**Registrada em:** 07/10/2026
**Status:** Capturada — não priorizada
**Origem:** ideia surgida durante a revisão de kits iniciais para o balanceamento PvE.

### Ideia

Entregar a cada personagem novo um conjunto inicial completo No-Grade, adequado à classe: arma, armadura, joias, capa e demais slots previstos para o sistema de equipamento. O kit também pode incluir suprimentos para tornar o começo mais acolhedor e permitir que o jogador experimente o combate sem ficar imediatamente sem recursos.

### Conteúdo inicial sugerido

- Conjunto de equipamento No-Grade válido para a classe, respeitando tipo de arma, armadura e restrições de equipamento.
- Soulshots ou Spiritshots No-Grade compatíveis com a arma e a classe.
- Poções iniciais de HP e, quando aplicável, MP.
- Um pequeno pacote de consumíveis úteis para a jornada inicial, sem conceder bônus permanentes excessivos.
- Possível item cosmético de boas-vindas, separado dos atributos do equipamento.

### Regras e dependências a investigar

- Gerar o kit a partir da classe canônica e validar que todos os itens podem ser equipados por ela.
- Definir quais slots recebem itens no início e quais devem ser desbloqueados pela progressão.
- Evitar duplicação do kit ao recriar, migrar ou carregar um personagem existente.
- Balancear a quantidade de tiros e poções para o tempo esperado até as primeiras recompensas obtidas em jogo.
- Definir se equipamento e consumíveis são vinculados ao personagem ou podem ser transferidos.

### Questões em aberto

- O conjunto deve ser funcionalmente completo desde o primeiro minuto ou parte dele deve ser concedida por missões de onboarding?
- Joias, capa e acessórios No-Grade devem conceder atributos ou servir primeiro como apresentação dos slots do sistema?
- O kit varia por classe, raça ou ambos?

---

## IDEA-004 — Caixas de evento com itens encapsulados

**Registrada em:** 07/10/2026
**Status:** Capturada — não priorizada
**Origem:** proposta inspirada nas caixas de evento de Lineage II.

### Ideia

Criar caixas que armazenam recompensas encapsuladas. O jogador recebe a caixa como um item; ao usá-la, o conteúdo é revelado e os itens são entregues ao inventário ou à caixa de recompensas pendentes, caso não haja espaço.

### Proposta de caixas e conteúdos

| Caixa | Fonte / ocasião | Conteúdo sugerido |
|---|---|---|
| Caixa de Boas-Vindas de Aden | Criação do personagem ou missão inicial, uma vez por personagem | Pacote No-Grade da classe, Soulshots/Spiritshots, poções HP/MP e um cosmético simples de boas-vindas. |
| Caixa de Participação | Eventos curtos e atividades comunitárias | Adena em quantidade pequena, consumíveis, materiais básicos de forja e uma chance baixa de cosmético temático. |
| Caixa do Caçador | Marcos de abates ou evento PvE | Soulshots/Spiritshots, poções, materiais de monstros, itens de apoio temporários e chance de visual temático. |
| Caixa do Artesão | Eventos de pesca, caça de profissão, mineração e coleta | Ferramentas ou consumíveis de profissão, vigor conforme as regras do jogo, materiais variados e chance de decoração/cosmético. |
| Caixa de Expedição | Conclusão de expedições ou eventos de exploração | Materiais raros de fabricação, moeda do evento e chance de item cosmético ligado à região. |
| Caixa de Marco Sazonal | Etapas importantes de um evento sazonal | Recompensa garantida de participação, moeda sazonal e escolha entre pacotes de consumíveis ou materiais; cosméticos em marcos maiores. |

As caixas podem misturar uma recompensa garantida com uma tabela de bônus. As chances e os itens possíveis devem ser exibidos antes da abertura. O foco sugerido é valor de uso, fabricação e aparência, evitando que uma caixa de participação entregue equipamento permanente muito acima da progressão normal.

### Fluxo desejado

1. O jogador obtém a caixa em uma fonte claramente identificada.
2. A descrição informa se a caixa é vinculada, seu prazo e as categorias de conteúdo.
3. Antes de abrir, o jogador consulta a lista de itens e as chances de resultados aleatórios.
4. Ao usar a caixa, o conteúdo é gerado uma única vez e entregue ao inventário.
5. Se o inventário estiver cheio, a recompensa fica pendente para resgate, sem desaparecer.

### Regras e dependências a investigar

- Definir raridade, quantidade, vínculo, prazo de validade e elegibilidade de cada caixa.
- Evitar abertura duplicada por repetição de ação, recarga da interface ou falha de rede.
- Distinguir caixas obtidas uma vez por personagem, por conta, por evento e por atividade repetível.
- Definir proteção contra resultados inúteis, duplicatas cosméticas e acúmulo de consumíveis.
- Garantir transparência nas probabilidades e preservar a economia de materiais e Adena.
- Criar identidade visual e descrição próprias para cada evento sem alterar as regras de recompensa escondidas.

### Questões em aberto

- As caixas de eventos serão obtidas por participação, metas de progressão, login ou combinação desses meios?
- Quais recompensas podem ser negociadas e quais devem ficar vinculadas?
- Caixas sazonais antigas permanecem abríveis depois do evento ou expiram?
- Para recompensas de equipamento, é melhor entregar o item diretamente ou oferecer uma escolha entre opções adequadas à classe?

---

## Histórico de priorização

| Data | Decisão |
|---|---|
| 07/10/2026 | Criado o documento. Quatro ideias foram registradas para preservar o foco no balanceamento PvE em andamento. |
