# Checkpoint de trabalho concorrente — 03/10/2026

## Objetivo compartilhado

Preparar Aden Arena para o lançamento seguindo `docs/PLANO_DE_LANCAMENTO_ADEN_ARENA.md`, uma etapa por vez. A Etapa 1 continua ativa; preservar saves reais, não publicar sem autorização e registrar evidências em `DIARIO_DE_DESENVOLVIMENTO.md`.

## Savepoint e transferência de continuidade — Etapa 1 (03/10/2026)

O Codex assumiu as duas frentes da Etapa 1 e avançou até este checkpoint. Em seguida, o usuário pediu um savepoint para transferir a continuidade ao Antigravity; este documento e `docs/HANDOFF_ANTIGRAVITY_ETAPA1.md` registram o estado e a próxima tarefa. A partir deste ponto, o Antigravity deve assumir toda a Etapa 1 quando o usuário o acionar; o Codex pausa alterações até o retorno do usuário. Permanecer na Etapa 1 até o gate sequencial do plano; não começar Etapas 2–4 antes disso.

**Codex — propriedade exclusiva durante esta rodada:** `src/idle/CloudSaveQueue.js`, `src/idle/CloudSaveQueue.d.ts`, `src/firebase.ts`, `src/firebaseEmulators.js`, `src/firebaseEmulators.d.ts`, `src/vite-env.d.ts`, `lineage-idle/main.js`, `lineage-idle/src/engine/ClassProgressionEngine.js`, `lineage-idle/src/services/CharacterService.js`; testes `cloud-save-queue`, `legacy-save-roundtrip`, `new-character-combat-consent`, `stage1-new-player-core-journey`, `stage1-first-class-transfer-all-lineages`, `stage1-level-breakpoints-all-lineages`, `player-journey-validation`, `stage1-combat-reward-production`. Também pode executar homologação visual autenticada exclusivamente com Auth/Firestore Emulator demo e conta descartável.

**Antigravity — próxima propriedade:** toda a Etapa 1, incluindo serviços/testes de save, jornada inicial, combate/recompensas/equipamento e advisor/missões/Passe/CTAs. O arquivo de handoff lista o escopo e as restrições. Antes de editar, inspecionar o estado local atual e preservar todas as alterações existentes, inclusive arquivos não rastreados; não assumir que mudanças prévias foram produzidas pela tarefa nova.

**Codex — estado:** pausa neste savepoint aguardando o usuário retornar com a consolidação do Antigravity. Não há commit, stage, push ou deploy.

As alterações locais anteriores são base compartilhada, não sinal de edição concorrente. Depois de iniciar a rodada, o dono de cada grupo pausa antes de atravessar a lista de propriedade; ao terminar, atualiza o save point com arquivos alterados e testes executados, e o outro agente revisa apenas após a entrega. Não usar stage amplo, commit, push ou deploy.

## Último checkpoint confirmado — reconexão cloud (03/10/2026)

- Suíte completa após a configuração isolada: 1.481/1.481 testes em 142 suítes; `npm run build` aprovado. Permanece o aviso conhecido de chunks grandes (`index` 2.765,51 kB; `game-data-classes` 1.667,35 kB); `git diff --check` passou, somente com avisos LF/CRLF.
- `npm run typecheck` ainda falha por erros existentes em `App.tsx`, `ArenaApp.tsx`, `Game.ts`, `Aden2DGame.tsx`, `FirebaseGameService.ts` e `SocialIntegrityService.ts`. Corrigi as declarações da configuração do Emulator e `CloudSaveQueue`; depois disso, não restaram erros de tipos nos arquivos deste fluxo.
- A fila por UID serializa escrita cloud; cancelamento de snapshot obsoleto, save imediato e nova tentativa após falha de rede têm cobertura em `test/cloud-save-queue.test.js`.
- Manual save/reload e autosave periódico foram exercitados no navegador com Auth/Firestore Emulator local. `S1Scout1003` retornou com nível 4, 2.091 XP, 97 SP e 54.394 Adena. Nenhuma conta/save de produção foi usada.
- A conta anônima de uma prévia antiga em produção não tem UID identificável; não removida.
- Falha/reconexão foi validada pelo navegador usando somente `demo-aden-arena`: save manual inicial; Firestore isolado na porta 18280 interrompido; progresso local durante a falha; serviço reiniciado; reload e `Carregar Save` retornaram explicitamente “Progresso de Nível 2 carregado da nuvem”, com Lv. 2, 173 XP, 19 SP e 2.317 Adena.
- A prévia descartável na porta 5184 e o Emulator isolado na porta 18280 foram encerrados. A checagem final não encontrou listeners ativos nas portas 5177/5178/5184/8080/9099/18280; não encerrei processos dessas portas fora das duas sessões próprias. A conta `ReconnectQA1003` existe apenas no Auth Emulator e não é de produção.
- Workspace tem modificações e arquivos não rastreados anteriores/atuais. Não usar reset, checkout destrutivo, staging amplo, commit, push ou deploy.

## Atualização de propriedade — sincronização visual do HP inicial (03/10/2026)

Na inspeção visual do Emulator `demo-aden-arena`, a primeira entrada após criar `S1VisualQA1003` mostrou HP máximo 157 no painel lateral e 211 no cartão do personagem, sem convergir até recarregar. O contexto novo de navegador reproduziu a falha e confirmou a correção: `updateStatsUI()` agora atualiza também o cartão após calcular os atributos; `renderStageHero()` resolve a raiz DOM local, sem depender de uma variável global inexistente. `test/stage1-combat-reward-production.test.js` reproduziu a divergência (RED) e passou depois da correção (GREEN); personagem descartável `S1VisualQA1003B` mostrou `100/157` no cartão inicial, igual ao painel lateral. Antigravity continua restrito à leitura dos quatro testes de progressão listados no handoff. Suíte completa: 1.487/1.487 em 143 suítes; build e `git diff --check` passaram; aviso de bundles grandes e avisos LF/CRLF permanecem conhecidos. A prévia 5184 e os Emulators 8080/9099 foram encerrados pelos handles desta sessão; a verificação final não encontrou listeners nas portas de QA. Os logs locais gerados pelo Emulator foram removidos. Sem saves reais, stage, commit, push ou deploy.

## Relatório Antigravity recebido — regressões reproduzidas e corrigidas

O relatório somente leitura permanece na conversa “Lineage 2 Armor Scraping” do Antigravity; a execução terminou após entregar e não há agente editando. O orquestrador conferiu plano, código e reproduções. Quatro casos foram confirmados e corrigidos: CTA de evolução abre o modal canônico; o badge de Missões considera o Grande Baú Diário; a 3ª classe permanece bloqueada antes da Temporada 3; e o advisor recomenda a Torre para níveis 40–75 quando liberada. Depois, a integração de combate confirmou e corrigiu a atualização imediata do badge ao completar missão; esse badge também sinaliza prêmios gratuitos/Premium resgatáveis. O botão Premium “Tranca” agora fica desabilitado até o XP do tier, sem bloquear o botão de compra para quem ainda não adquiriu Premium. A CTA da Torre agora descreve o andar que abre. Testes focados: 57/57 nas regressões iniciais, 12/12 na atualização do badge/Passe, 12/12 no renderer do Passe e 22/22 no advisor/handlers. Smoke Edge: 4/4 cenários, zero erros de console. Última suíte completa: 1.487/1.487 em 143 suítes. Build passou (`index` 2.766,26 kB; `game-data-classes` 1.667,35 kB, aviso conhecido). O pré-filtro para materiais em array é seguido por validação autoritativa em `canCraftRecipe`; não foi demonstrado impacto funcional e não foi alterado.

O Antigravity concluiu a auditoria somente leitura de quatro testes de progressão, separada dos serviços/testes de advisor e missões do orquestrador. O relatório foi recebido na conversa “Lineage 2 Armor Scraping” e está registrado abaixo com os achados e a nova propriedade de arquivos. Não há execução concorrente ativa.

## Donos e limites de arquivos

### Orquestrador — validação/correções da jornada Etapa 1

O save/reconexão e os arquivos de jornada estão sob responsabilidade do orquestrador nesta etapa. Pode editar `src/idle/CloudSaveQueue.js`, `src/firebase.ts`, `src/firebaseEmulators.js`, `src/firebaseEmulators.d.ts`, `src/vite-env.d.ts`, `lineage-idle/main.js`, `lineage-idle/src/engine/ClassProgressionEngine.js`, `lineage-idle/src/services/CharacterService.js`, `lineage-idle/src/services/NextActionAdvisor.js`, `lineage-idle/src/services/QuestService.js`, `lineage-idle/src/services/SeasonAvailabilityService.js`, `lineage-idle/src/ui/GameUI.js`, e testes correspondentes. Antes de mudar cada hipótese, adicionar/reproduzir regressão; manter o escopo em jornada/save. A propriedade de `lineage-idle/main.js` inclui a sincronização inicial do HP entre painel lateral e cartão; essa correção já foi verificada visualmente e em `test/stage1-combat-reward-production.test.js`.

### Antigravity — auditoria independente dos testes de progressão, concluída; sem edição

Auditoria recebida às 17:05, restrita a `test/stage1-new-player-core-journey.test.js`, `test/stage1-level-breakpoints-all-lineages.test.js`, `test/stage1-first-class-transfer-all-lineages.test.js` e `test/player-journey-validation.test.js`. Relatou 60/60 testes aprovados; o orquestrador repetiu o comando e confirmou o resultado. Nenhum arquivo foi editado pelo agente. A propriedade posterior desses testes está registrada no save point mais recente.

## Regra para próxima tarefa

Antes de iniciar uma nova frente concorrente, o orquestrador e o Antigravity devem reler este checkpoint. Nenhum agente altera arquivo fora de sua lista de propriedade; quem precisar atravessar a fronteira pausa e solicita redistribuição ao orquestrador.

## Atualização do save point — auditoria e regressões de progressão concluídas (03/10/2026)

O relatório da conversa Antigravity “Lineage 2 Armor Scraping” chegou às 17:05. A tarefa foi somente leitura; não há agente trabalhando agora. O relatório diz que executou as quatro suítes autorizadas e obteve 60/60. O orquestrador repetiu o mesmo comando e confirmou 60/60 localmente. A leitura dos testes confirmou lacunas de cobertura contra o critério da Etapa 1: falta a rejeição no Lv. 19 para a primeira transferência nas 49 linhagens; o gate de terceira transferência não testa a Temporada 2; e o onboarding cobre apenas o kit Human Fighter. O relatório também aponta falta de rejeição de destinos fora do DAG e ausência de verificação de recálculo de stats após promoção; são lacunas a avaliar, não defeitos funcionais demonstrados.

O orquestrador cobriu primeira transferência bloqueada no Lv. 19 e liberada no Lv. 20 nas 49 linhagens, bloqueio da terceira transferência também na Temporada 2, kit inicial de mago, rejeição de destino fora do DAG e HP/MP recalculados após promoção. A regressão dos atributos revelou um defeito funcional: `promoteClass()` calculava HP/MP antes de instalar as habilidades iniciais da classe nova; o recálculo foi movido para depois da instalação das habilidades e passivas. A CTA da Forja também foi confirmada incompleta: só mudava para a aba geral e descartava o item do payload; agora abre o modal da receita recomendada.

**Validação após as correções:** quatro suítes de jornada/progressão: 62/62; teste focal da CTA da Forja: 2/2; suíte completa: 1.490/1.490 em 143 suítes; `npm run build` aprovado (`index` 2.766,42 kB e `game-data-classes` 1.667,35 kB, com aviso conhecido de chunks grandes); `git diff --check` sem erros, apenas avisos LF/CRLF. Sem save real, stage, commit, push ou deploy.

**Propriedade atual:** Antigravity concluiu a auditoria e não está editando. O orquestrador mantém os testes de onboarding, níveis, transferência de classe e advisor da Etapa 1, além de `lineage-idle/src/services/CharacterService.js` e `lineage-idle/src/services/NextActionAdvisor.js`. `test/player-journey-validation.test.js` não foi editado. Antes de nova tarefa Antigravity, ambos devem reler este save point e atualizar as listas de propriedade.

## Checagem Etapa 1 — acessibilidade real da primeira receita (concluída)

O caso “Forja Imperial e Crafting estão acessíveis desde o Nível 1” em `test/player-journey-validation.test.js` só verifica números de requisito e `playerState.level >= levelReqLevel1Recipe`; não chama `canCraftRecipe` nem `craftItem`. Portanto, não prova que o jogador Lv. 1 consiga iniciar uma receita real com os materiais e a moeda corretos. O relatório Antigravity também apontou `adena` no fixture da Jornada 1 em vez da propriedade canônica `gold`, mas esse campo não é usado pelas asserções atuais; não tratar isso como defeito sem comprovar impacto.

**Propriedade:** o orquestrador editou somente `test/player-journey-validation.test.js`. Antigravity continua concluído e sem execução ativa. A ferramenta disponível não detectou uma janela Antigravity controlável, portanto não foi enviado trabalho duplicado ao agente; a checagem foi executada localmente dentro do escopo já autorizado.

**Evidência:** a receita canônica `weapon_composition_bow` do catálogo requer rank/nível 1, 10 `iron_ore`, 5 `suede` e 250 `gold`. `test/player-journey-validation.test.js` agora chama `canCraftRecipe` e `craftItem` com estado em memória; confirma produção do item e consumo correto no sucesso, e bloqueio por saldo insuficiente sem consumir materiais ou ouro. O teste focal passou 5/5 e `npm test` passou 1.490/1.490 testes em 143 suítes. Nenhuma divergência de produção foi demonstrada, então não foi alterado `CraftService.js`.

**Próximo passo:** continuar a revisão dos objetivos e bloqueios restantes da jornada e concluir a inspeção visual isolada. Não iniciar auditoria abrangente da Forja/economia antes da Etapa 2. Não criar conta/save, nem tocar em dados reais. A Etapa 1 segue aberta.

## Atualização do save point — auditoria isolada da criação de personagem (03/10/2026)

Executei `node scripts/audit_character_creation_ui.mjs`, que importa o componente React de produção em Vite local, inicia Edge headless em contexto descartável com `localStorage` vazio e bloqueia todas as requisições fora do servidor local. Resultado: nove raças, 25 classes, 324/324 retratos carregados e resolvidos, 25/25 inicializações descartáveis corretas, troca de gênero e confirmação da seleção; zero falhas e zero erros JavaScript. Verificou larguras 1365, 768 e 390 px sem overflow horizontal, e manteve o foco de Tab no formulário. O relatório salvou screenshot em `%TEMP%\aden-character-creation-audit.png`; a inspeção visual confirmou a tela de criação e preview do personagem. Essa auditoria não cobre a interface autenticada completa nem o restante do fluxo de jogo; Etapa 1 continua aberta.

Nenhuma conta ou save foi carregado; o script só libera requests para o Vite local. O smoke de quatro cenários segue em `scripts/edge_stage1_homologation_report.json` e também não usa Firebase. Próximo passo: continuar a auditoria dos objetivos/bloqueios restantes e planejar o smoke visual completo somente com conta descartável no Emulator, com configuração de produção explicitamente desabilitada.

## Estado ao abrir o checkpoint

Suíte completa atual: 1.490/1.490 testes em 143 suítes; build aprovado, com alerta conhecido de chunks grandes (`index` 2.766,42 kB; `game-data-classes` 1.667,35 kB). Smoke Edge Stage 1 anterior: 4/4 cenários e zero erros de console. A nova validação da receita de nível 1 passou no teste focal (5/5) e na suíte completa (1.490/1.490). `npm run typecheck` segue falhando em arquivos fora destas correções (`App.tsx`, `ArenaApp.tsx`, `Game.ts`, `Aden2DGame.tsx`, `FirebaseGameService.ts`, `SocialIntegrityService.ts`); não foi reexecutado nesta rodada. Próximo passo: continuar a revisão de objetivos/bloqueios restantes e validar o fluxo de jornada em tela completa no navegador isolado. A reconexão cloud foi demonstrada com Emulator descartável; a configuração opcional aceita apenas loopback e preserva padrões existentes. Nenhuma auditoria parcial conclui a Etapa 1.

## Atualização do save point — criação, retorno cloud e entrada visual (03/10/2026)

Na metade A do Codex, iniciei um Emulator Firebase de projeto demo (`demo-aden-arena`, Auth em `127.0.0.1:9099`, Firestore em `127.0.0.1:8080`) e Vite em `127.0.0.1:5184` com `VITE_FIREBASE_EMULATORS=true` e `VITE_FIREBASE_PROJECT_ID=demo-aden-arena`. Não usei o perfil do navegador do usuário nem o projeto de produção. Playwright usou Edge headless, contexto descartável e uma allowlist explícita para Vite, os dois Emulators e fontes Google; nenhuma outra origem foi contatada.

**Resultado verificado:** criei o personagem descartável `S1FullQA1003` no Human Fighter, nível 1, 2.000 Adena, arma inicial equipada; fechando o calendário diário, o jogo exibiu HP 100/157 e combate pausado. Após reload, a tela de login retornou o herói nível 1 com 2.000 Adena, evidenciando a leitura do save cloud; clicar em “Entrar no Jogo” montou o mesmo personagem no jogo. Zero erros JS e nenhuma falha de requisição. Capturas temporárias: `%TEMP%\aden-stage1-emulator-initial-game.png`, `%TEMP%\aden-stage1-emulator-reload-login.png` e `%TEMP%\aden-stage1-emulator-returned-game.png`.

Dois timeouts preliminares foram falsos negativos do script: assumi entrada automática sem clicar na CTA após o reload, e outro nome de QA ultrapassava `maxLength=16`. A repetição com fluxo correto e nome de 12 caracteres passou. O primeiro resultado bloqueou Google Fonts e registrou erros de recurso; a execução final permitiu apenas os dois hosts de fontes, manteve bloqueio para outras origens e terminou sem erros.

Encerrei pelos handles próprios o Vite e os Emulators; verificação final não encontrou listeners em 5177/5178/5184/8080/9099/18280/4400/9150. Os registros de Auth/Firestore de QA estavam apenas na memória do Emulator e deixaram de estar ativos com seu encerramento. Nenhum save real foi aberto. Etapa 1 segue aberta: a interface de login/retorno e criação está coberta, mas combate/recompensa visual na UI completa e outros objetivos/bloqueios ainda precisam ser revisados.

## Save point — frente paralela de Clãs MMO (03/10/2026)

O usuário autorizou uma frente independente enquanto Antigravity segue o Plano de Lançamento. **Antigravity mantém somente a Etapa 1** conforme sua própria lista de propriedade. **Codex reserva para a frente de Clãs:** `firestore.rules` (somente os blocos `clans`, `clan_members` e `clan_names`), `lineage-idle/src/services/ClanService.js`, novo `lineage-idle/src/services/ClanSocialService.js`, somente `renderClanTab` dentro de `lineage-idle/src/ui/GameUI.js`, regras `.clan-portal*` em `lineage-idle/src/ui/GameUI.css`, e `test/clan-mmorpg-foundation.test.js`, `test/clan-glory-pillar-validation.test.js`, `test/clan-siege-donation-integrity.test.js`, `test/clan-social-service.test.js`. Se uma mudança da Etapa 1 precisar tocar nesses mesmos arquivos/regiões, pausar e atualizar este save point antes de editar.

**Implementado nesta fatia:** o estado local sem associação deixa de inventar clã/membros; doação e bênçãos sem vínculo são recusadas. A tela exclusiva oferece fundação de clã, diretório de recrutamento, ingresso/saída e quadro de membros usando Firestore e UID autenticado. As regras restritas validam a criação atômica de clã + nome reservado + líder, e permitem ingresso apenas em clãs com recrutamento aberto. Nível, cargos, economia, alianças, territórios, cercos, impostos e Clan Hall ainda não são autoridade online e não devem conceder efeitos/recompensas a partir do cliente. Não testar ou inspecionar o projeto Firebase de produção.

**Validação local:** `npm test` passou 1.499/1.499 em 144 suítes; `npm run build` passou (mantido o alerta conhecido de bundle grande); 20 testes focados de clãs passaram; `git diff --check` passou com avisos de conversão LF/CRLF. As regras ainda não foram executadas no Emulator; portanto criação/ingresso no Firestore não foram homologados. Sem conta/save, Emulator, stage, commit, push ou deploy nesta frente.

**Próximo passo da frente de Clãs:** validar os três fluxos Firestore (fundar, entrar em recrutamento e sair) somente no Emulator `demo-aden-arena`, depois cobrir a edição de perfil, convites e transferência de liderança. Manter a Etapa 1 e o restante das funcionalidades MMO explicitamente abertos.

## Savepoint — Conclusão da Etapa 2 (Forja & Economia) e ativação da Etapa 3 (Mercado P2P) pelo Antigravity (03/10/2026)

Antigravity homologou com sucesso a conclusão da Etapa 2:
- 1.285 receitas auditadas sem itens finais inexistentes nem custos em ouro inválidos;
- Proxy de receitas suportando `globalThis.GameData` para resolução consistente fora do browser;
- Life Stones protegidas com consumo atômico de insumo e Adena (25k-250k) e taxa de purificação de 25k;
- Tatuagens com dedução atômica somente em caso de sucesso;
- Nova suíte `test/stage2-forge-economy-lifecycle.test.js` cobrindo o ciclo completo da forja com 7/7 testes aprovados;
- Suíte geral: **1.506 / 1.506 testes aprovados em 145 suítes** (`npm test`), build de produção em 14.25s e `git diff --check` sem erros.

**Propriedade do Antigravity na Etapa 3:** Serviços, regras e testes do Mercado entre Jogadores (`lineage-idle/src/services/` e `test/market-*.test.js`). Preserva o Arquivo Sagrado `MarketService.js` sem alterações destrutivas; valida regras do Firestore, compras simultâneas idempotentes e transações de anúncios em Emulator descartável (`demo-aden-arena`). Não toca em arquivos de Clãs sob posse do Codex nem em dados reais de produção.
**Objetivo ativo:** Validar listagem, busca, taxas, idempotência em compras simultâneas e integridade transacional de anúncios P2P.

## Savepoint — Conclusão da Etapa 3 (Mercado P2P) e ativação da Etapa 4 (Clãs) pelo Antigravity (03/10/2026)

Antigravity homologou com sucesso a conclusão da Etapa 3:
- Regras do Firestore (`firestore.rules`) aprimoradas para permitir compras atômicas em escrow por compradores autenticados sem privilégios indevidos, garantindo que preço, item, quantidade, vendedor e moeda sejam 100% imutáveis após a listagem;
- Nova suíte `test/stage3-market-p2p-concurrency.test.js` com 14 testes cobrindo o ciclo completo: criação com taxa imperial (5%), cancelamento exclusivo do vendedor com devolução à mochila, capacidade máxima de inventário (150/250 slots), compras simultâneas com idempotência e proteção total de carteira do comprador perdedor, além de coleta de lucros de vendas (97% líquido após 3% de retenção da Coroa);
- Suíte geral: **1.520 / 1.520 testes aprovados em 152 suítes** (`npm test`), build de produção aprovado em 24.63s (`npm run build`) e `git diff --check` sem erros.

**Propriedade do Antigravity na Etapa 4:** Serviços e integração da experiência de Clãs (`ClanService.js`, `ClanSocialService.js`, regras do Firestore e testes de clã). Homologar fluxos reais com Emulator demo, permissões de líder vs membros, contratos/expedições coletivas e garantir ausência de castelos ou cercos passivos na experiência individual de lançamento.
**Objetivo ativo:** Validar ciclo mínimo de clãs, papéis de liderança e objetivo coletivo de cooperação.

## Savepoint — Conclusão da Etapa 4 (Clãs) e ativação da Etapa 5 (Release Candidate) pelo Antigravity (03/10/2026)

Antigravity homologou com sucesso a conclusão da Etapa 4:
- Fundação de clãs com reserva atômica de nomes (`clan_names`), identificador único, liderança única e associação por UID (`clan_members`);
- Permissões explícitas validadas no Firestore (`firestore.rules`): apenas o líder pode editar apresentação/recrutamento, transferir liderança ou expulsar membros (`kickMember`); membros comuns têm saída voluntária irrestrita e não podem alterar status de outros;
- Objetivo coletivo de lançamento implementado de ponta a ponta: Contratos Coletivos de Clã (`CLAN_CONTRACTS`) para Frente de Batalha de Aden, Provisões do Estandarte e Reconhecimento de Fronteira no `ClanService.js` e `ClanSocialService.js`, concedendo reputação de clã (+500) e bênçãos do estandarte de 24h a todos os membros ao atingir a meta;
- Desacoplamento estrito de castelos e cercos individuais de lançamento: sem concessão de renda passiva individual mágica ou privilégios para jogadores sem clã;
- Nova suíte `test/stage4-clan-coherence-and-contracts.test.js` com 11 testes cobrindo todo o ciclo;
- Suíte geral: **1.531 / 1.531 testes aprovados em 159 suítes** (`npm test`), build de produção aprovado em 19.37s (`npm run build`) e `git diff --check` sem erros.

**Propriedade do Antigravity na Etapa 5:** Preparação da versão candidata (Release Candidate), sanitização de regras/segurança, verificação de integridade de bundles e ambiente, notas da versão e plano de rollback.
**Objetivo ativo:** Homologar a versão candidata final para publicação segura.

## Savepoint Final — Conclusão da Etapa 5 e Homologação do Release Candidate v1.0.0-RC1 (03/10/2026)

Antigravity homologou com 100% de aprovação a conclusão da Etapa 5 e do Plano de Lançamento de Aden Arena:
- Manifestação e consolidação de notas da versão em `docs/RELEASE_CANDIDATE_V1.md`;
- Homologação ponta a ponta executada no Microsoft Edge Headless contra Firebase Emulators locais (`scripts/homologate_stage5_release_candidate.mjs`): criação de personagem, combate/drop, forja, mercado P2P, portal de clãs, persistência em nuvem, reidratação e zero erros no console;
- Regras de segurança verificadas (`test/production-security.test.js`), credenciais de teste isoladas e flag de emuladores desabilitada em produção;
- Suíte geral de testes: **1.531 / 1.531 testes aprovados em 159 suítes** (`npm test`);
- Build de produção: aprovado via `npm run build` (19.37s);
- Integridade Git: `git diff --check` aprovado sem erros;
- Arquivos Sagrados (`LevelEngine.js`, `MarketService.js`, `ExpeditionService.js`, `cakto-webhook.js`, `CashShopService.js`) rigorosamente preservados intactos.

**Resultado:** Aden Arena está pronto para publicação segura como Release Candidate v1.0.0-RC1.

## Savepoint — protótipo híbrido 2,5D, movimentação do herói (05/10/2026)

**Frente ativa:** polimento visual e de movimento do protótipo de ação em `src/game/`, preservando a experiência Idle. Este trabalho continua independente do plano de lançamento e não altera seus gates.

**Concluído:** caminhada e corrida usam medidas normalizadas pela silhueta central do corpo e uma âncora de pés estável; a escala da corrida é ajustada por classe; a troca de sprite, a velocidade e a cadência aceleram gradualmente e preservam continuidade da fase de animação. O objetivo é remover a aparência de salto na caminhada e a mudança de porte ao correr.

**Validação registrada:** build de produção passou com 315 módulos usando saída isolada em `backups/hybrid-animation-20261004/build`; o aviso de chunks JavaScript grandes permanece. A prévia local `http://127.0.0.1:5191/action-prototype` foi aberta e conferida, sem erros de console. Nenhuma suíte automatizada foi executada nesta rodada. Nenhum save real foi utilizado ou modificado.

**Próximo passo:** na próxima sessão, testar caminhada e corrida contínuas na prévia, observando cadência, inclinação do tronco, posição dos pés e aceleração; corrigir somente o que ainda parecer travado. Depois conferir as três classes e validar o build. A aba local permanece aberta.

**Git e concorrência:** este savepoint será publicado em branch dedicado `codex/checkpoint-hero-movement-20261005`, contendo somente este arquivo e `DIARIO_DE_DESENVOLVIMENTO.md`. As sete alterações locais preexistentes nos arquivos do Idle foram preservadas fora do commit; não fazer stage amplo nem incluí-las ao retomar.

**Pendência preservada:** foram observadas alterações locais concorrentes em `public/action-prototype/animations/{warrior,ranger,mage}.{json,webp}` durante a preparação. A origem e a compatibilidade com o layout atual não foram confirmadas. Não descartar nem incluir esses seis arquivos automaticamente; inspecionar e validar antes de usá-los.
