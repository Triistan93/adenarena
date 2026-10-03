# Plano de desenvolvimento para lançamento — Aden Arena

**Versão:** 1.0
**Atualizado:** 03/10/2026
**Objetivo:** levar o modo Idle de Aden Arena a uma versão estável, compreensível e publicável, trabalhando uma prioridade por vez.

Este é o roteiro ativo de lançamento. `MASTER_PLAN.md` e as auditorias antigas continuam como arquivo de ideias e evidências; não são uma fila de implementação. Todo diagnóstico antigo deve ser confirmado no código e no jogo antes de virar tarefa.

## Direção do lançamento

O jogador deve conseguir entrar, entender o próximo objetivo, lutar, progredir, obter e equipar itens, criar equipamentos, negociar com segurança e participar de um clã com propósito. Cada sistema publicado precisa ter um ciclo completo, feedback claro, persistência confiável e uma forma de testar o resultado.

**Regra de escopo:** terminar um ciclo pequeno e verificável antes de iniciar outro. Ideias de arte, telas, chefes e mecânicas novas vão para o estacionamento enquanto não forem necessárias para corrigir um defeito ou concluir a etapa atual.

## Como vamos manter o foco

1. Manter somente **uma etapa ativa** e **uma tarefa concreta ativa**.
2. Dividir a tarefa em até três passos verificáveis; encerrar cada sessão deixando registrado o que passou, o que falhou e o próximo passo.
3. Antes de começar uma ideia nova, conferir se ela pertence à tarefa ativa. Se desviar, vou avisar: “Isso foge da etapa atual. Quer concluir **[tarefa atual]** ou trocar oficialmente para **[nova ideia]**?”
4. Se você escolher trocar, atualizamos a prioridade conscientemente e guardamos a tarefa anterior no ponto em que parou. Não trato a mudança como falha.
5. Não começar geração de arte, reformulação visual ou sistema novo como consequência automática de uma conversa sobre outro assunto.
6. Corrigir imediatamente um bloqueador de lançamento, perda de save, falha de segurança ou regressão grave, mesmo fora da etapa, registrando por que a prioridade mudou.

## Etapas e critérios de conclusão

### Etapa 0 — Fechar o que já está em andamento

**Estado: concluída.** Todos os grupos de alterações locais foram triados, testados com cobertura automatizada, verificados contra integridade de builds e persistência, e consolidados em commits seletivos recuperáveis.

- [x] Agrupar as mudanças locais por sistema, sem descartar ou sobrescrever arquivos.
- [x] Rodar testes, verificação de tipos e build; separar falha nova de falha preexistente.
- [x] Abrir a versão local e confirmar os fluxos alterados que afetam a experiência do jogador.
- [x] Marcar cada grupo como pronto para integrar, precisa de correção ou estacionado; preparar um checkpoint/commit coerente após revisar o conteúdo.


**Inventário inicial (03/10/2026):**

| Grupo local | Arquivos/área | Evidência disponível | Situação nesta etapa |
|---|---|---|---|
| Inicialização e segurança de save | `src/main.tsx`, `StateManager.js`, `IdleGame.tsx`, `SaveConflictPolicy.js` | Integridade/backup, hidratação/conflito local-nuvem e preservação após falha de recuperação testados; teste de corrupção 3/3; suíte mais recente 1.387/1.387 e build passam | **Pronto para checkpoint com limitações registradas.** Startup não limpa saves; corrupção sem backup bloqueia salvamento local/cloud; recuperação mantém cópias originais; hidratação mantém referência canônica; local mais recente só vence para a mesma conta. Round-trip no Auth/Firestore Emulator confirmou atualização pela cópia local mais recente e bloqueio de owner diferente. Fluxo visual autenticado e concorrência/relógios divergentes ficam para os gates das Etapas 1 e 5 |
| Combate na inicialização | `GameBootstrap.js`, `StateManager.js`, `CombatStartupPolicy.js` e testes | Regressão RED/GREEN do corpo de boot; 37 testes direcionados; suíte isolada 1.324/1.324 e build aprovados | **Checkpoint local concluído: `340858d9`.** Personagem novo aguarda o jogador; save explicitamente pausado não inicia combate; save ativo retoma. Testes confirmam saldo preservado, sem novo starter kit nem regravação do save durante o boot. Smoke de navegador anterior permanece como evidência parcial; fluxo completo do jogador segue na Etapa 1 |
| Login e navegação | `LoginScreen`, CSS global, `markup.ts`, tema, navegação dos pilares e guia contextual | Suíte atual 1.387/1.387 e build passam; em `127.0.0.1:5178` o login foi revisado em 1280×720, o CTA gratuito abriu a sessão local descartável existente e os pilares Herói e Mochila foram acessados; os sete submenus de Herói apareceram com rótulos e descrições | **Validado parcialmente.** A composição do login e o acesso às telas Herói/Mochila estão coerentes na área de trabalho, e o guia contextual abre com o conteúdo da aba selecionada. Ainda falta revisão em tela estreita e navegação por teclado/foco. A sessão carregou `Stage0Visual`, um estado local descartável; nenhum login, sync cloud ou save de produção foi usado. Modo tela cheia segue removido |
| Chefes, eventos e Torre | cenas de World Boss/Raid, retratos, Tower Presentation e conexão no `main.js` | 33 testes direcionados e suíte atual 1.383/1.383 passaram; contrato cobre cena própria do Baium, raids, Torre em dez capítulos, retratos e conexão ao combate; auditoria anterior confirmou 71 arquivos referenciados e 18 com margem geométrica | **Precisa validação visual.** A UI dos encontros ainda não foi aberta num estado que cumpra os desbloqueios. Revisão visual no combate e verificação de corte dos 71 retratos continuam pendentes; não declarar cobertura integral |
| Expedições, ofícios e Manor | atlas por atividade, rotas, sementes, colheita, Manager e guia | testes de mapa/Manor e Companhia passaram; no navegador descartável o Manor abriu, comprou 1 Dark Coda por 100 Adena e mostrou estoque 1/plantio ativo; nível 20 permitiu abrir Atlas/Companhia; correção recente impede troca de colheita quando mochila cheia; guia atualizado conferido visualmente no build local | Visualmente, o Atlas informa 2 regiões acessíveis e exibe o destino selecionado, risco, recompensa e diretrizes. A Companhia abre e lista quatro trabalhos. O Manor pelo atalho da Companhia mostra feudos/sementes e estado de estoque. A compra visual do Manor passou em rodada anterior. O guia agora distingue Mural de ordens locais do Atlas de expedições e não promete mais impostos de castelo; textos atualizados vistos no modal. Falta confirmar troca de colheita/reconexão e revisar responsividade do painel direito |
| Mercenários e acampamento | raridades, vínculo, contratos, trabalho e melhorias | 14 testes de serviço/progressão; teste de integração Shadow DOM; fluxo visual no Auth/Firestore Emulator descartável | **Despacho confirmado e fluxo corrigido.** Contratação de Vanya por 5.000 e despacho para Treinamento por 1.000 atualizaram saldo, log, seletor e equipe em missão. Ainda falta validar retorno/reconexão e responsividade a 1212×720; não integrar sem revisão visual do grupo completo |
| Cache PWA | política de atualização do service worker | Regressão focada e suíte atual 1.383/1.383 passaram; commit local `6fd50487` | **Pronto para checkpoint.** Falta confirmar atualização do bundle vigente no smoke test pré-deploy |
| Infraestrutura de prévia descartável | Firebase Auth/Firestore Emulator e gate de configuração | 3 testes direcionados passaram; build atual passou com a flag desligada; criação de personagem e tela principal verificadas em sessão efêmera | **Pronto para checkpoint.** Commit local separado `2780720e`; não enviado ao remoto; flag de emulador é bloqueada no build de produção |
| Conteúdo visual | retratos em `MON_IMG` e diretório de chefes | Auditoria técnica encontrou 71 caminhos únicos em `/img/bosses/`; todos os arquivos existem, têm alfa e ficam abaixo de 300 KiB. Dimensões: 51 em 640×427, 10 em 640×640, 10 em 640×960. Teste direcionado de chefes/Torre passou (30/30); a geometria de corpo inteiro cobre 18 recortes | Ainda não aprovado: o jogo exibe o retrato em um quadro vertical e a maioria dos assets é horizontal; 53 têm menos de 16 px entre o alfa visível e alguma borda. Isso é sinal para inspeção, não prova isolada de anatomia cortada. Não gerar/substituir arte nesta Etapa 0; fazer validação visual e listar quais exigem reenquadramento |

Esses grupos misturam mudanças em `lineage-idle/main.js`, `lineage-idle/src/ui/GameUI.js`, CSS compartilhado e `src/idle/markup.ts`, então não devem ser enviados juntos em um commit amplo sem separar e revisar os trechos de cada funcionalidade. A revisão visual usa apenas personagem descartável no Firebase Emulator local; nenhum save real deve ser operado para validar mecânicas. A flag `VITE_FIREBASE_EMULATORS=true` conecta Auth e Firestore somente a `127.0.0.1` e é rejeitada em build de produção.

**Triagem da árvore de trabalho (03/10/2026):** `main` está três commits locais à frente de `origin/main` (`4098fced`, `6fd50487`, `2780720e`) e ainda contém alterações não staged. Os três commits já têm finalidade distinta (preservar save na inicialização, atualizar módulos PWA, prévia local com Emulator); não reescrever nem empurrar antes da revisão do conjunto. O diff restante divide-se em: (1) segurança/hidratação de saves, com testes direcionados passando, mas integração visual pendente; (2) Manor, Atlas e Companhia, com compra/plantio e despacho parcialmente conferidos e retorno/reconexão ainda pendentes; (3) cenas e assets de bosses/Torre, com contratos automatizados mas inspeção dos retratos em combate faltando; (4) login/navegação e temas, agora conferidos visualmente em viewport desktop, faltando telas estreitas e foco de teclado. Os grupos (2) e (3) atravessam `main.js`/`GameUI.js`; (4) atravessa `markup.ts` e folhas globais. Portanto nenhum deles está pronto para stage integral; os hunks precisam ser separados e cada subset revalidado antes do checkpoint.

**Limites de checkpoint identificados e primeiro recorte concluído:** `StateManager.js` contém também o default de combate pausado; esses dois hunks foram excluídos do commit de saves `136bc3c9`. `main.js` foi selecionado por trecho para incluir só hidratação cloud, aviso de corrupção e bloqueio de sincronização/ranking após falha de save. As mudanças de Tower, World Boss, Manor e Companhia ficaram no workspace. Os sete arquivos selecionados foram conferidos contra a cópia isolada com suíte e build aprovados antes do commit. Os demais arquivos centrais continuam misturados e exigem recortes próprios; não fazer stage integral por conveniência.

**Concluída quando:** existe um checkpoint recuperável, os riscos conhecidos estão anotados e sabemos exatamente qual tarefa inicia a etapa seguinte. Saves reais não são usados como massa de teste.

### Etapa 1 — Caminho principal do jogador e estabilidade

- [x] Testar do login até o primeiro combate, primeira recompensa, equipamento e próxima meta (Validado via `test/stage1-new-player-core-journey.test.js`: criação segura em Talking Island com combate pausado, acionamento por consentimento, vitória com concessão de EXP/Adena, drop e equipamento na mochila com recálculo dinâmico de atributos).
- [ ] Confirmar progressão e desbloqueios nas transferências de classe e nas faixas de nível anunciadas para a temporada.
- [ ] Validar save local/nuvem, retomada, reconexão e migração de save antigo sem perda de personagem, itens ou progresso.
- [ ] Remover bloqueios, objetivos impossíveis, ações sem resposta e conteúdo anunciado que ainda não possui fluxo funcional.
- [ ] Garantir que o jogador sempre saiba qual é o próximo passo e por que uma ação está bloqueada.

**Concluída quando:** um jogador novo e um save existente conseguem seguir o ciclo central sem bloqueio, perda de dados ou instrução contraditória; os principais marcos têm teste reproduzível.

### Etapa 2 — Economia e Forja

**Prioridade de produto:** corrigir a Forja antes de abrir mais caminhos de comércio, porque receitas, materiais e preços determinam o valor dos itens negociados.

- [ ] Desenhar um único fluxo claro: escolher receita, ver resultado e requisitos, criar, receber item e entender o custo total.
- [ ] Auditar as receitas atuais contra o catálogo: item final, materiais, quantidades, nível de personagem e maestria da Forja.
- [ ] Verificar que nenhum material central fica sem uso e que nenhum item anunciado como fabricável não tem receita válida.
- [ ] Garantir consumo e recompensa atômicos: falha ou inventário cheio não pode apagar materiais nem duplicar itens.
- [ ] Explicar fontes dos materiais, chance de sucesso quando houver risco e resultado antes da confirmação.
- [ ] Testar a cadeia inicial, intermediária e avançada com contas/estados descartáveis; medir custos e recompensa para detectar inflação ou receitas triviais.
- [ ] Só manter na experiência de lançamento as abas avançadas da Forja que tenham ciclo completo e testes; esconder ou sinalizar honestamente as incompletas.

**Concluída quando:** receitas e ingredientes são íntegros, as regras do serviço correspondem à interface, e criar/refinar/reivindicar não causa perda ou duplicação em testes de sucesso, falha, desconexão e mochila cheia.

### Etapa 3 — Mercado entre jogadores

- [ ] Definir claramente o que pode ser listado, limites, preço mínimo/máximo, taxa, duração e cancelamento.
- [ ] Testar listar, buscar/filtrar, comprar, cancelar, expirar e recuperar o item/ouro em falhas.
- [ ] Garantir transação única e idempotente: duas compras simultâneas não podem vender o mesmo item nem cobrar duas vezes.
- [ ] Validar propriedade e quantidade no servidor; cliente não decide saldo, preço final ou item entregue.
- [ ] Revisar regras do Firestore, autenticação, autorização e dados públicos; negar operações inseguras por padrão.
- [ ] Testar com duas contas descartáveis e ambiente seguro; verificar concorrência, latência, desconexão e indisponibilidade da nuvem.
- [ ] Informar estado da listagem e histórico ao comprador e vendedor, sem depender apenas do log de combate.

**Concluída quando:** o ciclo completo funciona para dois jogadores de teste, compras simultâneas são seguras, regras de nuvem foram verificadas e nenhuma falha perde ou duplica moeda/itens.

### Etapa 4 — Clãs com um propósito coerente

**Princípio:** clã é uma atividade coletiva. Propriedade de castelo e cerco precisam ser disputadas e operadas por clãs; não fazem sentido como renda passiva pessoal numa tela individual.

- [ ] Definir o ciclo mínimo: descobrir/criar clã, solicitar entrada ou convidar, aceitar, administrar cargos e sair/dissolver.
- [ ] Corrigir o estado inicial: personagem novo começa sem clã, sem bônus de CP ou benefícios que nunca desbloqueou.
- [ ] Estabelecer permissões explícitas para líder, oficiais e membros, verificadas também nos serviços e na nuvem.
- [ ] Escolher um objetivo coletivo de lançamento — por exemplo, contratos/expedições de clã com contribuição e recompensa compartilhada — e implementá-lo de ponta a ponta.
- [ ] Tirar domínio de castelo e impostos passivos do ciclo individual; cerco fica fora do lançamento até existir disputa entre clãs com regras, agenda e resultado verificáveis.
- [ ] Testar criação, entrada, saída, promoção, remoção, offline e disputa entre duas contas/clãs descartáveis.

**Concluída quando:** jogadores entendem por que entrar num clã, cada ação respeita cargos, o estado persiste corretamente e qualquer recompensa coletiva tem contribuição e regra transparentes.

### Etapa 5 — Preparação e publicação

- [ ] Definir escopo e notas da versão; remover ou rotular recursos incompletos, sem anunciar o que não está pronto.
- [ ] Rodar suíte completa, typecheck e build a partir de um estado conhecido; registrar avisos restantes.
- [ ] Fazer smoke test de login, novo personagem, retorno de save, combate, Forja, Mercado, clã e uso em telas estreitas.
- [ ] Revisar erros de console, links/rotas, carregamento de imagens e estado offline/reconexão.
- [ ] Revisar regras de segurança e confirmar que credenciais e dados de teste não são publicados.
- [ ] Publicar primeiro uma versão candidata; fazer smoke test pós-deploy e manter um caminho de rollback.

**Concluída quando:** a versão candidata passa os fluxos críticos em produção, os dados reais permanecem intactos e há plano de recuperação caso o deploy falhe.

## Depois do lançamento — estacionamento

Não iniciar antes das etapas acima, a menos que revele um bloqueador real:

- novas famílias de arte, retratos e cenas de chefes;
- reformulações visuais amplas e novos modos de tela;
- testar uma navegação por pop-ups centrais translúcidos para Combate, Herói, Império e Glória;
- guerras de castelo, renda/impostos de domínio e política de alianças;
- expansão de sistemas avançados da Forja e novos tiers de receita;
- sistemas novos de mercenários, eventos, mapas, atividades ou conteúdo end-game;
- auditoria total de todas as áreas que não pertençam aos fluxos críticos de lançamento.

As ideias continuam registradas; estacionar significa proteger o foco e não perder a ideia.

## Checklist de término para cada tarefa

- [ ] O comportamento foi confirmado no ponto de uso, não só pela existência do arquivo.
- [ ] Há teste para regra de serviço/integração relevante e resultado local revisado.
- [ ] Saves e transações foram protegidos; cenários de erro foram considerados.
- [ ] Diário atualizado com evidências, resultado, limites e próximo passo.
- [ ] O próximo passo continua dentro da etapa ativa.

## Fontes do plano e limites atuais

- O `DIARIO_DE_DESENVOLVIMENTO.md` registra a cadeia recente de materiais/receitas e os riscos/validações ainda pendentes de áreas como profissões e save.
- `docs/MATRIZ_PROGRESSAO_MATERIAIS_E_FORJA.md` é a referência atual para faixas de nível, maestria e materiais; custos e ritmo ainda dependem de validação jogável.
- `SYSTEM_COHERENCE_AUDIT.md` e `docs/ADEN_ARENA_DESIGN_GAPS.md` são diagnósticos de setembro de 2026. Alguns dados conflitam com mudanças mais recentes; usar como lista de perguntas, nunca como verdade sem reprodução.
- O branch `main` estava alinhado com `origin/main` na elaboração deste plano, mas havia várias modificações e arquivos locais não commitados. A Etapa 0 existe para revisar esse trabalho antes de integrar ou ampliar o escopo.

## Estado atual

**Etapa ativa:** 1 — Caminho principal do jogador e estabilidade.
**Tarefa ativa:** Confirmar progressão e desbloqueios nas transferências de classe e nas faixas de nível anunciadas para a temporada.
**Próximo passo:** Validar a 1ª Transferência de Classe no nível 20 nas 49 linhagens (diálogo de escolha no DAG canônico, recálculo de stats, atualização imediata da árvore de habilidades e persistência).

**Checkpoints concluídos da Etapa 0 (03/10/2026):**
- `136bc3c9`: `fix(save): preserve recovery data and canonical cloud state` (segurança de saves, fallback e hidratação canônica).
- `340858d9`: `fix(combat): respect paused state when starting the game` (combate pausado no boot, sem starter kit indevido).
- `338652e7`: `fix(manor-camp): validate manor crop lifecycle and mercenary camp progression` (ciclo completo do Manor, limite de 150 slots, despacho/resgate do Acampamento Mercenário).
- `edb3aa6b`: `fix(atlas-guide): align expedition map layout and responsive tutorial navigation` (layout cartográfico do Atlas e navegação responsiva do guia).
- `dce44509`: `feat(bosses-tower): register canonical raid scenes, tower presentation and boss portraits` (cenas de bosses/raids, Torre da Insolência em capítulos e 71 retratos canônicos).
- `e7ff7115`: `feat(ui-theme): enhance portal login, pillar navigation and grimoire theme` (portal de login, navegação dos pilares e tema grimoire).
- `f5b89e11`: `feat(ui): integrate company hub, manor modal, tower chapters and raid scenes in main and GameUI` (conectores de UI no main.js e GameUI.js integrados).
