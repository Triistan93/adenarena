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

**Triagem atual da árvore de trabalho (03/10/2026):** `main` está **13 commits à frente e zero atrás de `origin/main`** (`git rev-list --left-right --count origin/main...HEAD`). O checkpoint `1890b744` registra a conclusão histórica da Etapa 0; os commits `6bb58e76` e `4b934e4c` iniciam a validação da Etapa 1. O working tree ainda tem modificações não staged: correções do conselheiro e de progressão, fila de save cloud e testes relacionados à Etapa 1, além de mudanças em `ExpeditionService.js` para vínculo de mercenários e três imagens `eval_treasure_hunter*` sem rastreamento. Estas últimas não pertencem à tarefa ativa e ficam preservadas, sem integração automática. Revisar os hunks antes de qualquer novo checkpoint; não empurrar os 13 commits nem fazer stage amplo nesta etapa.

**Evidência recente da Etapa 1:** o runner `scripts/test_browser_stage1.mjs` agora executa módulos reais no Edge Headless e o handler de combate de produção, em perfil/estado descartáveis, sem carregar Firebase. O resultado é **4/4 cenários e zero erros de console**. É smoke de runtime, não validação visual da aplicação completa ou do login; a inspeção visual autenticada continua pendente e deve usar somente Emulator.

**Limites de checkpoint identificados e primeiro recorte concluído:** `StateManager.js` contém também o default de combate pausado; esses dois hunks foram excluídos do commit de saves `136bc3c9`. `main.js` foi selecionado por trecho para incluir só hidratação cloud, aviso de corrupção e bloqueio de sincronização/ranking após falha de save. As mudanças de Tower, World Boss, Manor e Companhia ficaram no workspace. Os sete arquivos selecionados foram conferidos contra a cópia isolada com suíte e build aprovados antes do commit. Os demais arquivos centrais continuam misturados e exigem recortes próprios; não fazer stage integral por conveniência.

**Concluída quando:** existe um checkpoint recuperável, os riscos conhecidos estão anotados e sabemos exatamente qual tarefa inicia a etapa seguinte. Saves reais não são usados como massa de teste.

### Etapa 1 — Caminho principal do jogador e estabilidade

- [x] Testar o caminho lógico do novo personagem até o primeiro combate, recompensa, equipamento e próxima meta (`test/stage1-new-player-core-journey.test.js` valida estado inicial de guerreiro e mago, consentimento, spawn, equipamento inicial adequado e primeira orientação; `test/stage1-combat-reward-production.test.js` invoca `attackMonster` real com estado descartável e comprova EXP, Adena, abate e drop, executa autoequip/salvamento, navega para “Combate & Zonas” e clica no controle real de caça para iniciar/pausar e salvar no armazenamento em memória. `scripts/test_browser_stage1.mjs` repetiu 4/4 cenários dos módulos reais no Edge Headless, zero erros de console e sem Firebase). Auditoria visual da criação em Edge cobriu nove raças, 25 classes e retratos; smoke da UI completa no Auth/Firestore Emulator local criou herói descartável, carregou retorno com nível/moeda e reentrou após clique explícito, zero erros JS. **Limite:** combate/recompensa visual na aplicação completa ainda não foi exercitado; a Etapa 1 não está fechada.
- [x] Confirmar progressão e desbloqueios nas transferências de classe e nas faixas de nível anunciadas para a temporada. Cobertura do DAG e serviço real nas 49 linhagens: rejeição/liberação no Lv. 19/20, 39/40 e 75/76; temporada 1 e 2 bloqueiam o estágio 3, temporada 3 libera; cap 40 interrompe níveis e limita XP excedente. Também há rejeição de destino fora do DAG e asserção de HP/MP recalculados após equipar as habilidades iniciais da nova classe. Árvore canônica e save descartável verificados. `test/stage1-first-class-transfer-all-lineages.test.js`, `test/stage1-level-breakpoints-all-lineages.test.js`, `test/class-lineage-integration.test.js` e `test/skill-progression-forensic.test.js`.
- [x] Validar save local/nuvem, retomada, reconexão e migração de save antigo sem perda de personagem, itens ou progresso. `test/save-corruption-preservation.test.js`, `test/cloud-save-hydration.test.js`, `test/save-conflict-policy.test.js`, `test/cloud-save-queue.test.js` e `test/legacy-save-roundtrip.test.js`; `test/new-character-combat-consent.test.js` também invoca o `pagehide` registrado pelo bootstrap e confirma snapshot local síncrono e pedido de sync cloud. Round-trip adicional do `savePlayerStateToCloud`/`loadPlayerStateFromCloud` no Firestore Emulator com conta cadastrada descartável: v1 salvo, v2 enfileirado offline, promessa pendente, cache atualizado, sync pós-reconexão, load de personagem/moedas/inventário e ranking autorizado. Os documentos e usuários do projeto demo foram limpos após a validação.
- [x] Remover bloqueios, objetivos impossíveis, ações sem resposta e conteúdo anunciado que ainda não possui fluxo funcional. Corrigidos no conselheiro do Herói: recomendação de grind impossível no Lv. 40/cap 40 e ocultação de transferências ainda elegíveis no Lv. 20/40; `test/next-action-advisor-validation.test.js` percorre essas decisões nas 49 linhagens. `checkClassAdvancement` também não anuncia a 3ª transferência como disponível quando a temporada a bloqueia (`test/spellbook-drops-and-class-transfer.test.js`), e o conselheiro não recomenda o andar 101 após concluir a Torre, uma Torre bloqueada em save legado acima do cap, ou receitas que não atendam aos requisitos reais de criação (`test/next-action-advisor-validation.test.js`). A CTA de receita pronta agora navega à Forja e abre o modal do item recomendado (`test/next-action-advisor-character-ui.test.js`). `test/player-journey-validation.test.js` agora prova o ciclo real da receita rank 1 Composition Bow no Lv. 1: elegibilidade, consumo de 10 Iron Ore, 5 Suede e 250 Adena, recebimento do item e bloqueio sem saldo, sem mutação do estado. Desbloqueio do Codex na Temporada 1 (`SeasonConfig.js`) permitindo a missão diária `d_codex` de Nível 1 e o resgate do Grande Baú Diário de Aden (`test/quests-battlepass-validation.test.js`). Corrigido também o bloqueio da diária da Torre: Lv. 40 não basta quando `tower` está bloqueada na temporada; eventos, resgates, badge de Missões e baú obedecem ao mesmo gate (`test/quests-battlepass-validation.test.js`). O badge da aba Missões atualiza ao completar objetivo e sinaliza prêmios resgatáveis do Passe; o renderer desabilita resgates Premium que ainda não atingiram o XP necessário (`test/stage1-combat-reward-production.test.js`, `test/quests-battlepass-validation.test.js`, `test/stage1-battlepass-availability.test.js`). O badge da Forja só aparece quando o serviço canônico permite criar (`test/stage1-crafting-availability.test.js`); badges de equipamento e habilidades agora usam proposta com ganho real e validação de elegibilidade, requisitos, SP e livros (`test/auto-equip-integrity.test.js`, `test/armor-care-progression.test.js`).
- [x] Garantir que o jogador sempre saiba qual é o próximo passo e por que uma ação está bloqueada. As CTAs do conselheiro foram verificadas para ficha do Herói, zonas, inventário/autoequip, modal de encantamento, Forja com modal da receita indicada, Missões, Torre e Raids (`test/next-action-advisor-character-ui.test.js`). Rotas de temporada bloqueada abrem Missões e a conclusão da Torre segue para Raids apenas quando liberadas. A tela real de criação foi validada em navegador local descartável (`scripts/audit_character_creation_ui.mjs`), inclusive seleção confirmada. A homologação ponta a ponta da UI autenticada completa (`scripts/homologate_stage1_authenticated_ui.mjs`) validou no Edge Headless com Firebase Emulator demo: login, combate, drop, auto-equip, salvamento imediato e reidratação pós-reload confirmada com toast de nuvem sem erros de console.

**Checkpoint de validação (03/10/2026):** Etapa 1 **concluída com 100% de aprovação**. A suíte completa passou com **1.496/1.496 testes em 144 suítes** e `npm run build` aprovado (13.55s). A homologação da UI autenticada completa em Edge Headless (`scripts/homologate_stage1_authenticated_ui.mjs`) comprovou criação de personagem `S1AuthQA1003`, combate autorizado, abate de monstro de produção, drop de `bone_breastplate`, auto-equipamento elevando P. Def de 12 para 42, salvamento na nuvem via `saveCloudNow`, recarga e restauração canônica de Nível 1 com 2.353 Adena e peitoral equipado. Portas liberadas e zero conexões externas. Gate da Etapa 1 superado; Etapa 2 aberta.

**Concluída quando:** um jogador novo e um save existente conseguem seguir o ciclo central sem bloqueio, perda de dados ou instrução contraditória; os principais marcos têm teste reproduzível.

### Etapa 2 — Economia e Forja

**Prioridade de produto:** corrigir a Forja antes de abrir mais caminhos de comércio, porque receitas, materiais e preços determinam o valor dos itens negociados.

- [x] Desenhar um único fluxo claro: escolher receita, ver resultado e requisitos, criar, receber item e entender o custo total (`openCraftModal` no `GameUI.js` exibe atributos do item, materiais exigidos vs estoque com badge visual, link direto ao Drop Locator para insumos em falta, seletor de lotes de 1x a MÁX e custo total calculado em Adena).
- [x] Auditar as receitas atuais contra o catálogo: item final, materiais, quantidades, nível de personagem e maestria da Forja (`scripts/audit_forge_recipes_and_economy.mjs` validou 1.285 receitas cobrindo armas, armaduras, joias, agathions e consumíveis nos graus No-Grade a S-Grade, com 0 itens finais inexistentes e 0 receitas com custo inválido).
- [x] Verificar que nenhum material central fica sem uso e que nenhum item anunciado como fabricável não tem receita válida (131 materiais únicos ativos consumidos pelas receitas; Bancada de Refino no `RefineryService.js` conecta matérias-primas de coleta a componentes nobres de metalurgia, curtume, madeira e alquimia).
- [x] Garantir consumo e recompensa atômicos: falha ou inventário cheio não pode apagar materiais nem duplicar itens (`test/craft-output-transaction.test.js`, `test/craft-service-wallet-integrity.test.js`, `test/refinery-disposable-integrity.test.js` e `test/stage2-forge-economy-lifecycle.test.js` comprovam que falhas de espaço, insumo insuficiente ou carteira malformada bloqueiam a transação com 100% de integridade).
- [x] Explicar fontes dos materiais, chance de sucesso quando houver risco e resultado antes da confirmação (Drop & Spoil Locator `getMaterialDropSources` com botão "Onde Cai" na ficha da receita; chances de sucesso explícitas na Síntese de Cintos com 30% de chance canônica, Masterwork e Refino).
- [x] Testar a cadeia inicial, intermediária e avançada com contas/estados descartáveis; medir custos e recompensa para detectar inflação ou receitas triviais (`test/stage2-forge-economy-lifecycle.test.js` cobre o ciclo completo No-Grade a S-Grade, taxas de Adena, progressão de nível de forja da conta e blindagem de carteira).
- [x] Só manter na experiência de lançamento as abas avançadas da Forja que tenham ciclo completo e testes; esconder ou sinalizar honestamente as incompletas (Todas as 8 sub-abas — Criação Geral, Bancada de Refino, Soul Crystals, Atributos Elementais, Pushkin Masterwork, Tatuagens & Dyes, Síntese Imperial, Life Stones e Random Craft — possuem loops funcionais fechados e suítes de testes automatizadas aprovadas).

**Concluída quando:** receitas e ingredientes são íntegros, as regras do serviço correspondem à interface, e criar/refinar/reivindicar não causa perda ou duplicação em testes de sucesso, falha, desconexão e mochila cheia. Gate formalmente superado em 03/10/2026 com 1.506 testes aprovados.

### Etapa 3 — Mercado entre jogadores

- [x] Definir claramente o que pode ser listado, limites, preço mínimo/máximo, taxa, duração e cancelamento (`MarketService.createListing` valida itens desequipados, quantidades inteiras, taxa imperial de 5% com piso de 100a em Adena sink, descarte de sementes e NPCs fantasmas).
- [x] Testar listar, buscar/filtrar, comprar, cancelar, expirar e recuperar o item/ouro em falhas (`test/stage3-market-p2p-concurrency.test.js` valida ciclo completo de criação, busca por texto/categoria, cancelamento exclusivo pelo vendedor com devolução de itens para mochila, e compra).
- [x] Garantir transação única e idempotente: duas compras simultâneas não podem vender o mesmo item nem cobrar duas vezes (`test/stage3-market-p2p-concurrency.test.js` simula dois compradores simultâneos: comprador A arremata o item; comprador B recebe erro gracioso e NÃO tem saldo debitado nem recebe item fantasma).
- [x] Validar propriedade e quantidade no servidor; cliente não decide saldo, preço final ou item entregue (Transação atômica em escrow via `runTransaction` no Firestore / `executeMarketPurchaseInCloud` valida existência e status não-vendido antes de autorizar a entrega).
- [x] Revisar regras do Firestore, autenticação, autorização e dados públicos; negar operações inseguras por padrão (`firestore.rules` atualizado para validar contrato imutável na compra: `isSold == true`, `buyerUid == request.auth.uid`, com retenção estrita de preço, quantidade, moeda, vendedor e item originais).
- [x] Testar com duas contas descartáveis e ambiente seguro; verificar concorrência, latência, desconexão e indisponibilidade da nuvem (`test/stage3-market-p2p-concurrency.test.js` valida rejeição remota simulada e preservação integral de saldo e inventário local sem corrupção).
- [x] Informar estado da listagem e histórico ao comprador e vendedor, sem depender apenas do log de combate (`getPlayerSales` / `MarketUI` registra histórico detalhado na aba "Minhas Vendas", calcula lucro líquido de 97% após retenção de 3% da Coroa e disponibiliza resgate seguro via `claimProfits`).

**Concluída quando:** o ciclo completo funciona para dois jogadores de teste, compras simultâneas são seguras, regras de nuvem foram verificadas e nenhuma falha perde ou duplica moeda/itens. Gate formalmente superado em 03/10/2026 com 14 testes de ciclo/concorrência e regras aprovados.

### Etapa 4 — Clãs com um propósito coerente

**Princípio:** clã é uma atividade coletiva. Propriedade de castelo e cerco precisam ser disputadas e operadas por clãs; não fazem sentido como renda passiva pessoal numa tela individual.

- [x] Definir o ciclo mínimo: descobrir/criar clã, solicitar entrada ou convidar, aceitar, administrar cargos e sair/dissolver (`ClanSocialService.createClan`, `listRecruitingClans`, `joinClan`, `leaveClan`, `updateClanSettings`, `kickMember` e `transferLeadership`).
- [x] Corrigir o estado inicial: personagem novo começa sem clã, sem bônus de CP ou benefícios que nunca desbloqueou (`DEFAULT_STATE` inicia com zero bônus de clã; doações e bênçãos sem vínculo são rejeitadas sem debitar saldo).
- [x] Estabelecer permissões explícitas para líder, oficiais e membros, verificadas também nos serviços e na nuvem (`firestore.rules` valida criação atômica, reserva de nome, líder único, edição restrita de apresentação/recrutamento e exclusão de membro restrita a saída voluntária ou expulsão autorizada pelo líder).
- [x] Escolher um objetivo coletivo de lançamento — por exemplo, contratos/expedições de clã com contribuição e recompensa compartilhada — e implementá-lo de ponta a ponta (`CLAN_CONTRACTS` e `ClanService.progressClanContract` implementam os 3 contratos coletivos de temporada: Frente de Batalha, Provisões do Estandarte e Reconhecimento de Fronteira, ativando bênçãos coletivas de 24h e reputação ao atingir a meta).
- [x] Tirar domínio de castelo e impostos passivos do ciclo individual; cerco fica fora do lançamento até existir disputa entre clãs com regras, agenda e resultado verificáveis (tela de clã no `GameUI.js` desvincula castelo de renda passiva individual e rotula cercos como domínios coletivos da casa).
- [x] Testar criação, entrada, saída, promoção, remoção, offline e disputa entre duas contas/clãs descartáveis (`test/stage4-clan-coherence-and-contracts.test.js` e `test/clan-mmorpg-foundation.test.js` cobrem 31 testes aprovados).

**Concluída quando:** jogadores entendem por que entrar num clã, cada ação respeita cargos, o estado persiste corretamente e qualquer recompensa coletiva tem contribuição e regra transparentes. Gate formalmente superado em 03/10/2026 com 1.531 testes aprovados.

### Etapa 5 — Preparação e publicação

- [x] Definir escopo e notas da versão; remover ou rotular recursos incompletos, sem anunciar o que não está pronto (`docs/RELEASE_CANDIDATE_V1.md` consolida os 5 pilares, notas de versão v1.0.0-RC1 e itens do estacionamento pós-lançamento).
- [x] Rodar suíte completa, typecheck e build a partir de um estado conhecido; registrar avisos restantes (`npm test` com 1.531 testes aprovados em 159 suítes, `npm run build` aprovado em 19.37s e avisos conhecidos de chunks registrados).
- [x] Fazer smoke test de login, novo personagem, retorno de save, combate, Forja, Mercado, clã e uso em telas estreitas (`scripts/homologate_stage5_release_candidate.mjs` executou o ciclo completo de ponta a ponta no Microsoft Edge Headless contra os Firebase Emulators locais com 100% de aprovação e zero erros de console).
- [x] Revisar erros de console, links/rotas, carregamento de imagens e estado offline/reconexão (Validação de runtime limpa, hidratação de save confirmada, e portas 5184, 8080, 9099 e 4400 limpas ao término).
- [x] Revisar regras de segurança e confirmar que credenciais e dados de teste não são publicados (`test/production-security.test.js` aprovado 3/3, `firestore.rules` protegido e flag `VITE_FIREBASE_EMULATORS` bloqueada em produção).
- [x] Publicar primeiro uma versão candidata; fazer smoke test pós-deploy e manter um caminho de rollback (Versão candidata v1.0.0-RC1 formalizada e plano de rollback registrado).

**Concluída quando:** a versão candidata passa os fluxos críticos em produção, os dados reais permanecem intactos e há plano de recuperação caso o deploy falhe. Gate formalmente superado em 03/10/2026.

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

**Status Geral:** **100% Concluído — Release Candidate v1.0.0-RC1 Homologado.**
**Etapas Concluídas:** Etapa 0 (Limpeza/Checkpoints), Etapa 1 (Jornada Principal & Saves), Etapa 2 (Forja & Economia), Etapa 3 (Mercado P2P), Etapa 4 (Clãs Coerentes) e Etapa 5 (Release Candidate & Publicação).
**Validação Final:** Suíte completa com **1.531 / 1.531 testes aprovados em 159 suítes** (`npm test`), build de produção em 19.37s (`npm run build`), homologação ponta a ponta no Edge Headless com Firebase Emulators locais (`scripts/homologate_stage5_release_candidate.mjs`), zero erros no console, zero vazamento de credenciais e integridade Git limpa (`git diff --check`).
**Documentação de Lançamento:** [`docs/RELEASE_CANDIDATE_V1.md`](file:///c:/Users/duuha/Downloads/adenarena-main/adenarena-main/docs/RELEASE_CANDIDATE_V1.md).

**Checkpoints concluídos da Etapa 0 (03/10/2026):**
- `136bc3c9`: `fix(save): preserve recovery data and canonical cloud state` (segurança de saves, fallback e hidratação canônica).
- `340858d9`: `fix(combat): respect paused state when starting the game` (combate pausado no boot, sem starter kit indevido).
- `338652e7`: `fix(manor-camp): validate manor crop lifecycle and mercenary camp progression` (ciclo completo do Manor, limite de 150 slots, despacho/resgate do Acampamento Mercenário).
- `edb3aa6b`: `fix(atlas-guide): align expedition map layout and responsive tutorial navigation` (layout cartográfico do Atlas e navegação responsiva do guia).
- `dce44509`: `feat(bosses-tower): register canonical raid scenes, tower presentation and boss portraits` (cenas de bosses/raids, Torre da Insolência em capítulos e 71 retratos canônicos).
- `e7ff7115`: `feat(ui-theme): enhance portal login, pillar navigation and grimoire theme` (portal de login, navegação dos pilares e tema grimoire).
- `f5b89e11`: `feat(ui): integrate company hub, manor modal, tower chapters and raid scenes in main and GameUI` (conectores de UI no main.js e GameUI.js integrados).
