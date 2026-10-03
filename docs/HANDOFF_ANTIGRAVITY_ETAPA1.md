# Handoff para Antigravity — retomada integral da Etapa 1

## Antes de iniciar

Leia integralmente `docs/ESTADO_DE_TRABALHO_CONCORRENTE.md` e a Etapa 1 em `docs/PLANO_DE_LANCAMENTO_ADEN_ARENA.md`. Este handoff é a atribuição mais recente: o usuário pediu ao Antigravity para assumir a continuidade a partir deste savepoint. O Codex pausa alterações até a consolidação voltar ao usuário.

## Objetivo

Concluir a Etapa 1 do plano: provar que jogador novo e save existente completam a jornada principal sem bloqueio, perda de dados ou orientação contraditória. Preserve saves reais e use somente estado/contas descartáveis e Firebase Emulator. Não avance para Etapas 2–5 antes do gate sequencial.

## Estado verificado neste savepoint — 03/10/2026

- `npm test`: **1.490/1.490 testes, 143 suítes, zero falhas**.
- `npm run build`: aprovado. Aviso conhecido de chunks grandes: `index` 2.766,42 kB e `game-data-classes` 1.667,35 kB.
- `git diff --check`: sem erros; somente avisos de conversão LF/CRLF.
- A Etapa 1 continua aberta. O plano aponta como pendências: smoke visual de combate/recompensa na aplicação completa; auditoria final de marcos, objetivos, instruções e bloqueios; e revisar os dois critérios ainda sem check (`Remover bloqueios...` e `Garantir que o jogador sempre saiba...`).
- Já há testes de serviço/handler para combate, recompensa, save, criação, transferências, advisor, badges, Torre, Forja inicial e retorno cloud. Há também smoke visual isolado de criação e login/retorno com Auth/Firestore Emulator. Isso não substitui a pendência do combate/recompensa visual na UI completa.
- `npm run typecheck` falhou anteriormente em arquivos fora das correções desta jornada (`App.tsx`, `ArenaApp.tsx`, `Game.ts`, `Aden2DGame.tsx`, `FirebaseGameService.ts`, `SocialIntegrityService.ts`); não foi reexecutado neste savepoint.
- Serviços/contas de Emulator usados em validações anteriores foram encerrados; não foi verificado nem modificado dado de produção nesta rodada.

## Workspace compartilhado — preservar

O workspace tem muitas alterações locais preexistentes, sem stage ou commit, além de arquivos não rastreados. `git status --short` foi conferido. Há mudanças nos serviços de save, personagem, combate/equipamento, advisor, missões, temporada e UI; testes da Etapa 1; relatórios/scripts; assets `public/img/eval_treasure_hunter*.jpg`; novos módulos `src/idle/CloudSaveQueue.js`/`.d.ts`; logs `firebase-debug.log` e `firestore-debug.log`; e este checkpoint/handoff. Não usar `reset`, `checkout` destrutivo, stage amplo, limpeza de arquivos, commit, push ou deploy. Não apagar logs/arquivos não rastreados sem conferir sua origem e necessidade.

## Próximas ações

1. Reproduzir o fluxo completo da UI autenticada usando apenas Auth/Firestore Emulator demo e perfil de navegador descartável: entrar com personagem salvo, autorizar combate, derrotar inimigo, verificar XP/Adena/drop no ponto de uso, equipar item e confirmar que o save persiste após reload. Manter allowlist de rede restrita a Vite, Emulator local e fontes estritamente necessárias; encerrar somente processos iniciados pela própria validação.
2. Auditar cada orientação/bloqueio restante da jornada frente aos critérios formais da Etapa 1. Reproduzir defeitos antes de corrigir; cobrir regressões com testes focados. Inspecionar com cuidado alterações já presentes; não presumir que pertencem ao novo trabalho.
3. Atualizar diário, plano e este savepoint com evidências, limitações e resultado. Rodar suíte completa, build e `git diff --check` no fim. Não marcar Etapa 1 concluída enquanto algum critério estiver sem evidência.

O handoff não concede autorização para acessar saves reais, publicar ou avançar etapas. Em caso de necessidade de credenciais/dados reais ou de escopo fora da Etapa 1, pare e devolva a decisão ao usuário.
