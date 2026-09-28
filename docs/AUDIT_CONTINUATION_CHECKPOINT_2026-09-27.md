# Ponto de retomada — auditoria funcional (27/09/2026)

## Estado do workspace

- Projeto: `C:\Users\duuha\Downloads\adenarena-main\adenarena-main`
- Branch: `main`
- HEAD: `c02262ef3e171884495e27be287fcae0db246fcc`
- Há alterações locais preexistentes e não commitadas; preservar tudo.
- Nenhum save real foi aberto ou modificado. `LevelEngine.js`, `MarketService.js` e `ExpeditionService.js` estão intactos.
- Sem push, merge ou deploy.

## Último relatório de auditoria ampla

Fonte: `scripts/functional_chain_test_report.json`, gerado às 01:39 BRT de 27/09/2026; snapshot do próprio relatório confirma o mesmo HEAD e `snapshotUnchanged: true`.

- 159 classes e 2.114 relações classe/habilidade; status geral **FAIL**.
- 1.698 efeitos passaram; 436 asserções falharam; 416 casos ficaram sem validação.
- As 436 falhas são 218 falhas em `productionCast` mais 218 falhas dependentes de débito de MP (MP esperado, mas não consumido), em 218 relações de classe/habilidade, 95 IDs de skill e 96 classes. Portanto, não equivalem a 436 defeitos independentes.
- Dentro dessas 218 relações, 211 efeitos estão como `NOT_EXECUTED` (o relatório atribui a pré-condições de aprendizado/execução) e 7 como `NOT_VALIDATED` por falta de contrato independente. A causa de cada falha ainda precisa ser triada; não presumir que todo caso seja bug confirmado nem falso positivo.
- Habilidades com mais ocorrências de falha na matriz: `concentration` (17 classes), `roar_of_death` (9), `call_of_flame` (6), `dreaming_spirit` (6), `detect_weakness` (5), `confusion` (5), `frost_flame` (5) e `shining_prison` (5). Exemplo registrado: `detect_weakness` em `warrior` falha em `productionCast`; o teste então observa 0 MP debitado diante de 50 esperado. Isso é evidência do executor local, ainda exige determinar se a causa é jogo, precondição ou harness.
- As 416 pendências somam: 211 não executadas; 120 não validadas (72 buffs com efeitos sem contrato suportado, 32 sem contrato independente, 16 efeitos de alvo com comportamento sem contrato suportado); 25 bloqueadas por lacuna de conteúdo; 60 bloqueadas por proveniência não comprovada.
- A cobertura independente de efeito configurou 421 contratos para 440 IDs únicos. Os 19 sem mapeamento são: `long_shot`, `assassin_s_secret_notes_2nd_page`, `quick_dash`, `wind_walk`, `berserker_spirit`, `wild_magic`, `magic_barrier`, `hp_recovery`, `mp_recovery`, `unleashed_potential`, `divine_inspiration`, `powerful_fists`, `artful_disarm`, `imminent_piercing`, `moon_influence`, `improved_speed`, `confused_mind`, `tough_skin`, `glorious_warrior_enhanced_abilities`.
- 13 classes/linhagens estão bloqueadas por conteúdo ou proveniência: `werewolf_0`, `werewolf_1`, `werewolf_2`, `shineMakerBase`, `spirit_0`, `marauderBase`, `marauder`, `ertheiaWarrior`, `eviscerator`, `sayhaMageBase`, `sayhaSeer`, `windRiderErth`, `sayhaSeeker` (7 lacunas de conteúdo e 6 de proveniência).
- Passaram 134 transições de promoção no serviço/ViewModel e 134 ativações de subclasses. Essas verificações não renderizaram as interfaces.
- Permanecem sem execução: 20 renderizações de raízes de criação de personagem, 134 renderizações de modal de promoção, bootstrap integral e uma recarga de save real. São critérios adicionais e não entram na soma de 416 casos acima.
- O relatório foi executado com navegador isolado, rede local e harness de auditoria; não executou o bootstrap completo do jogo.

## Mudança em andamento — velocidade de habilidades → recarga

Decisão do usuário: todo bônus de `atkSpd` ou `casting speed` concedido por habilidade deve reduzir o cooldown; velocidade de ataque não deve subir por esse efeito.

- Foi acrescentado primeiro um teste de regressão para buffs ativos legados com `atkSpd`, `atkSpdPercent` e `castSpd`. Ele falhou antes da correção: `getStats().cdr` ficou em `0` em vez de `0.45`.
- `StatsEngine` agora converte os campos numéricos de velocidade de `skillBuffStats` em CDR e não os soma ao `atkSpd` do personagem.
- `node --test test/skill-buff-production-effects.test.js`: **29/29 passaram**. `npm test`: **827 testes, 97 suítes, 0 falhas**. `git diff --check` passou (somente avisos de LF/CRLF já existentes).
- Ainda falta reproduzir a Haste pela sessão visual de navegador. O teste adicional cobre o agregador `getStats` e a conversão no estado ativo; não afirma que todos os caminhos de produção de cada habilidade foram exercitados.

## Próximos passos ao retomar

1. Conferir o diff da mudança atual de cooldown e executar os testes que cobrem buffs ativos, certificações, SA e `canCastSkill`.
2. Identificar os 218 casos de `productionCast` pelo motivo específico de bloqueio, agrupando aliases e falsos positivos antes de alterar o executor; separar casos com efeito sem contrato de bugs reproduzidos no jogo.
3. Corrigir uma causa por vez com regressão e validar pelo caminho de produção; depois regenerar a auditoria e comparar contra 436/416.
4. Manter explicitamente pendentes as interfaces não renderizadas, o bootstrap completo, os 19 contratos sem mapeamento, as lacunas de conteúdo/proveniência e a ausência de validação com save real.

## Atualização — reteste Haste/Acumen (01:58 BRT)

- Branch `main`, HEAD `c02262ef3e171884495e27be287fcae0db246fcc`; o relatório confirmou snapshot inalterado durante a execução.
- `scripts/audit_functional_chain_test.mjs` agora registra **422 asserções falhas** e **409 não validadas** (antes 436/416), entre 2.114 relações de classe/habilidade. As duas métricas são asserções, não uma porcentagem de conclusão, e não devem ser somadas como itens distintos.
- Distribuição de efeitos: 1.705 `PASS`, 204 `NOT_EXECUTED`, 120 `NOT_VALIDATED`, 25 bloqueados por conteúdo e 60 por proveniência. Mantêm-se 19 habilidades sem contrato e 13 classes/linhagens bloqueadas.
- O executor validou buffs Haste/Acumen em nove ocorrências observadas: Haste/Acumen em Werewolf III, Soul Haste em três classes Kamael e Elemental Haste em quatro classes Sylph. Conjuração, gasto de MP e contrato de efeito passaram nesses casos. Não extrapolar para outras classes.
- Testes focais 44/44; suíte integral 829 testes, 97 suítes, 0 falhas. O auditor usa harness modular e não executa o bootstrap integral nem recarrega saves reais.
- Para continuar: triagem das 211 conjurações restantes e débitos associados; cobrir buffs/debuffs sem execução; completar contratos independentes, conteúdo e proveniência; validar UI, bootstrap e recarga de save descartável sem tocar dados reais.

## Save point atualizado — 27 de setembro de 2026, 17:09 BRT

- Fonte L2Wiki Essence verificada no navegador: Warg S0–S3. S0 lista apenas Direct Strike; S1 inclui habilidades de estágio 1; S2 lista Upward Strike, Howling e as três Moon's Graces. URLs: https://l2wiki.com/essence/skills/werewolf_0/ , https://l2wiki.com/essence/skills/werewolf_1/ e https://l2wiki.com/essence/skills/werewolf_2/ .
- Criados nós V2 `wargS0`, `wargS1`, `wargS2` e ligação da classe final; aliases `werewolf_0/1/2/3` resolvem nos quatro estágios. Armor/Weapon Mastery foram ligadas a S1 porque o catálogo local já as atribui a `werewolf_1/2/3`; o ViewModel não as mostra mais em S0. O estágio inicial mantém só a habilidade listada pela fonte.
- As Moon's Graces têm contratos e efeitos no StatsEngine: bônus de Atk. Spd. reduzem cooldown e bônus de Speed reduzem o intervalo entre ataques básicos. 461/461 efeitos das skills únicas observadas passaram no auditor.
- Auditor final `2026-09-27T20:12:11.816Z` (snapshot inalterado): 159 classes, 2.140 relações classe-skill, 62 atribuições bloqueadas, 0 assertions falhas/não validadas; `APPROVAL_BLOCKED`. Entre bloqueios: três raízes com conteúdo ausente/parcial, seis classes Ertheia sem fonte Essence verificável. L2Wiki Essence não lista Ertheia; as notas NCSoft localizadas são para a edição Live, não usadas como prova para Essence. `spirit_0` tem somente duas skills na fonte.
- `npm test`: 941/941 em 97 suítes. Build passou com aviso de chunks acima de 1,5 MB. Serviços protegidos e saves reais intactos; sem commit/push/merge/deploy. Renderização UI, bootstrap completo e reload de save real não foram comprovados pelo auditor.

## Atualização — Blessed Shield pelo bloqueio real (02:10 BRT)

- Reproduzido inicialmente: skill `blessed_shield` falhava na conjuração porque não havia efeito resolvido. Corrigido para fornecer +5 pontos percentuais de bloqueio enquanto um escudo está equipado; sem escudo, o resolver rejeita o buff antes do custo de MP.
- O cálculo de `getStats().block` é consumido por `monsterAttack` via `resolvePlayerBlock`. Teste focal determinístico provou que roll 0,03 bloqueia dano físico quando a habilidade está ativa, não bloqueia dano mágico e deixa de bloquear quando o escudo/buff não se aplica.
- Navegador/harness de produção passou em Prophet e Hierophant: `productionCast=true`, MP esperado/observado 35/35, `block` 0→5→0 ao expirar, contrato PASS.
- Novo relatório: gerado `2026-09-27T05:09:39.997Z`; 2.114 casos, 1.707 efeitos PASS, 202 NOT_EXECUTED, 120 NOT_VALIDATED, 25 bloqueados por conteúdo e 60 por proveniência. Falhas **418**, não validadas **407**. As 209 falhas de conjuração acompanham 209 falhas de débito MP, dependentes da mesma execução.
- Testes focalizados de Blessed Shield passaram; `npm test`: 831/831 em 97 suítes; `git diff --check` sem erros, com avisos de conversão LF/CRLF; os serviços protegidos continuam sem diff.
- Próximo passo: resolver a próxima skill/efeito de maior recorrência por semântica e consumidores reais. Não generalizar o resultado desta habilidade para outras classes/skills. Continuam necessários os 19 contratos faltantes, 13 bloqueios de conteúdo/proveniência, bootstrap, UI e save descartável.

## Atualização — falso positivo de Advanced Block (02:18 BRT)

- Revalidei o estado local e reproduzi a divergência: o caso Hierophant conjurava Advanced Block e debitava MP, mas o auditor media DEF 202→202. A fixture do auditor equipava um escudo sem `def`; os testes focalizados usavam `def: 20`. Causa confirmada como fixture incompleta, não defeito do cálculo de produção.
- Corrigido `scripts/lib/functional-browser.mjs`: escudo auditável declara DEF 20. A execução repetida comprovou DEF 202→204→202, conjuração verdadeira e MP 44/44. O falso positivo foi removido; falhas passaram de 417 a 416, pendências ficaram 406.
- `npm test` passou 833/833 em 97 suítes; `git diff --check` passou, com avisos LF/CRLF apenas. Serviços protegidos sem diff; nenhum save real tocado.
- Foco imediato: auditar grupos de skills cujo cast não é executado. `concentration` é o agrupamento mais recorrente (17 classes) e a descrição canônica declara `Casting Interruption Rate -36`; como o jogo não mostra ainda um consumidor de interrupção de conjuração, não aplicar bônus substituto nem declarar resolvido sem rastrear semântica e caminho de combate.
- Estado geral continua **FAIL**; 159 classes/2.114 casos, 19 contratos de skill sem mapeamento, 13 classes/linhagens bloqueadas, bootstrap integral e reload de save real ainda pendentes.

## Investigação adicional — Concentration (02:22 BRT)

- Rastreado `Casting Interruption Rate -36` do catálogo canônico. `CombatEventType.SKILL_INTERRUPT` é apenas uma declaração, sem ocorrência de emissão/consumo de interrupção de skill do jogador. `attackMonster` lança a skill e paga MP/cooldown no mesmo tick, sem canalização do player.
- Existe interrupção de canalização fatal de monstros por stagger, mas é o sentido inverso e não representa resistência do conjurador. Não substituir por CDR, dado que interrupção é semanticamente diferente de velocidade de ataque/conjuração.
- Portanto `concentration` (17 classes) está bloqueada por falta de mecânica de canalização de skills do jogador, e não por falha de classe/árvore ou custo. O resolver deve continuar bloqueando o buff até um consumidor fiel existir. Próxima triagem deve buscar outros efeitos explícitos com consumidores reais, sem inventar comportamento para descrições placeholder.

## Fonte externa sobre skills de controle

- Consulta à página de atualização oficial Lineage II Essence da 4game: `Dreaming Spirit` aparece na lista de habilidades de anomalia/debuff, confirmando que deve atuar no alvo, não como buff próprio. A página não especifica duração do efeito. Atribuir 30 segundos de fontes de Chronicles antigas não é evidência válida para esta variante Essence.
- Referência: https://eu.4game.com/patchnotes/lineage2essence/281/ (17/02/2021; patch histórico, insuficiente para provar parâmetros atuais de duração).
- Essa evidência dá a família do efeito, mas ainda falta uma duração verificável compatível com a habilidade/versão que o catálogo local reproduz; manter o caso pendente sem inventar o prazo.

## Atualização — Vitalize e debuffs recebidos de monstros (02:33 BRT)

- Implementado e provado o contrato explícito de `Vitalize`: Power 460 cura via `calculateHealAmount` e remove apenas debuffs de combate do monstro. O parser usa a descrição mais completa porque `canonicalEffect` local está truncado após `P. Atk. redu`.
- `MonsterAIEngine.processMonsterAttack` já criava `monster_hex`/`monster_gloom` por 10s e 20%, mas seus estados nunca alteravam atributos. `StatsEngine.getStats` agora reduz P.Def/M.Def enquanto ativos; teste chama o produtor real para obter Hex e Gloom, confirma que o dano mitigado piora e verifica restauração após expirar. Lista de cleanse deliberadamente restrita a IDs gerados por esse produtor; buffs regulares e outras chaves `monster_*` permanecem.
- Harness de navegador chamou `attackMonster` para Vitalize em Elder, Eva's Saint, Shillien Elder e Shillien Saint. Nas quatro ocorrências: cast verdadeiro, MP 84/84, cura e remoção de ambos debuffs reais produzidos por `MonsterAIEngine`.
- Relatório de 2026-09-27T05:32:03Z: 159 classes, 2.114 casos, 1.712 efeitos PASS, 197 NOT_EXECUTED, 120 NOT_VALIDATED, 25 BLOCKED_CONTENT_GAP, 60 BLOCKED_UNPROVEN_PROVENANCE; **408 assertions failed, 402 unvalidated**, status FAIL. Também confirma Advanced Block no Hierophant PASS com DEF 202→204→202.
- `npm test`: 836/836, 97 suítes. `git diff --check` passa (avisos LF/CRLF); `LevelEngine.js`, `MarketService.js` e `ExpeditionService.js` sem diff; nenhum save real tocado.
- Próxima triagem: grupos recorrentes de buff/control não executados, mantendo conteúdo, proveniência, contratos faltantes (19), bootstrap e reload de save como pendentes.

## Atualização — 27 de setembro de 2026, 02:55 BRT

A decisão mais recente do usuário autoriza adaptações criativas e balanceadas para habilidades cujo efeito não se encaixe no jogo atual. Isso substitui a conclusão antiga de Concentration pendente por falta de canalização; a investigação continua válida, a decisão foi atualizada.

- `Concentration`: +36% de resistência aos debuffs de combate aplicados por monstros. Hex/Gloom de monstros Support têm 25% de chance base, reduzida a 16% com o buff. `MonsterAIEngine.processMonsterAttack` confirmou a resistência pela rolagem real; `getStats` mede 0→0,36→0 ao expirar. 17 casos de classe passaram em cast, MP, efeito e ausência de CDR/Atk Spd indevido. Três casos adicionais permanecem bloqueados por proveniência.
- `Detect Weakness`: adaptada do placeholder para uma marca no monstro atual, +8% dano recebido por 8 s; custo existente e cooldown de 10 s preservados. Cinco casos de classe passaram pelo cast real. A auditoria de navegador confirmou 77 de dano marcado contra 72 sem marca na mesma configuração; serviço confirma +8% antes do arredondamento e restauração após expiração.
- Cobertura adicional: `detectWeaknessDamageAmplification` testa o consumidor no caminho real `attackMonster`; o contrato e `build_functional_evidence.mjs` mantêm o comportamento medido após regeneração.
- Auditor mais recente (`2026-09-27T05:54:07.928Z`): 159 registros/2.114 skill-cases; 1.734 PASS, 175 NOT_EXECUTED, 120 NOT_VALIDATED, 25 bloqueados por conteúdo, 60 por proveniência; 364 assertions failed, 380 unvalidated. Status geral **FAIL**. Falhas de cast e MP representam pares da mesma execução, não bugs distintos.
- `npm test`: 840/840, 97 suítes. Testes focados: 55/55. Serviços protegidos sem diff; nenhum save real foi tocado; sem push, merge ou deploy.
- Pendências: 19 IDs sem contrato independente, 13 linhagens bloqueadas, 175 casos sem execução, 120 sem validação, 364 assertions falhadas e 380 não validadas; bootstrap integral e reload real de save permanecem fora da cobertura. A próxima rodada deve seguir classe/skill por classe/skill, reproduzir a causa e adaptar efeitos semanticamente vazios com regressão de produção.

## Atualização — 27 de setembro de 2026, 03:00 BRT

- Adaptações autorizadas e validadas em caminhos reais: `Concentration` agora dá +36% de resistência a debuffs de monstros (Hex/Gloom: 25%→16%), sem alterar CDR/Atk Spd; `Detect Weakness` marca o alvo para +8% de dano recebido por 8 s; `Roar of Death` reduz P. Atk/M. Atk do monstro em 15% por 10 s. Foram comprovadas 17 ocorrências de Concentration, cinco de Detect Weakness e nove de Roar of Death. Roar reduziu um ataque observado de 73 para 62; Detect Weakness aumentou o dano auditado de 72 para 77. Esses resultados limitam-se às variantes exercitadas.
- O gerador preserva contratos de efeitos revisados e o executor valida deltas combinados e atributos inalterados, evitando que regeneração reintroduza falsos resultados.
- Auditoria de `2026-09-27T05:59:00.986Z`: 159 registros, 2.114 relações classe/skill; 1.743 PASS, 166 NOT_EXECUTED, 120 NOT_VALIDATED, 25 bloqueadas por conteúdo e 60 por proveniência. 346 assertions failed, 371 unvalidated; status continua **FAIL**. As asserções falhas/não validadas não representam necessariamente bugs únicos.
- `npm test`: 842/842 em 97 suítes. Serviços protegidos intactos; nenhum save real tocado; sem push/merge/deploy.
- Continuar pela auditoria de classes/skills. Permanecem 19 IDs sem contrato independente, 13 bloqueios de conteúdo/proveniência, 166 casos não executados, 120 sem validação, além de bootstrap integral e reload de save descartável sem prova.

## Atualização — 27 de setembro de 2026, 03:04 BRT

- `Lionheart` mantém o bônus PvE canônico de +3% e adapta as resistências a paralisia/hold/sono/choque/cancelamento de buff para +25% de resistência aos debuffs de combate aplicados por monstros. Teste determinístico usa o produtor real `MonsterAIEngine.processMonsterAttack`: a mesma rolagem aplica debuff sem Lionheart e é resistida com a habilidade ativa.
- Harness de navegador validou 10 ocorrências: Duelist, Orc Monk, Tyrant, Grand Khavatari, Artisan, Warsmith, Maestro, Shine Maker S1/S2 e Shinemaker. Cast, MP, contrato e efeito passaram; dano PvE medido 227→233. Isso cobre apenas essas ocorrências.
- Relatório `2026-09-27T06:03:43.252Z`: 159 classes, 2.114 casos; 346 asserções falhas e 361 não validadas. Global continua **FAIL**. Permanecem 19 IDs sem contrato independente, casos sem execução e validação, 13 bloqueios de conteúdo/proveniência, sem bootstrap completo ou reload de save.
- `npm test`: 842/842 em 97 suítes. Serviços protegidos intactos, nenhum save real alterado; sem push/merge/deploy. `git diff --check` sem erros, com avisos de LF/CRLF.

## Atualização — 27 de setembro de 2026, 03:06 BRT

- `Damage Reflection` já refletia 3% no caminho real de `monsterAttack`, mas o contrato do auditor estava configurado como buff numérico e produzia NOT_VALIDATED. Corrigi o tipo do contrato para testar dano recebido/refletido em combate, sem mudança no efeito de produção.
- Dark Avenger passou com 69 recebidos/2 refletidos; Hell Knight 57/1, conforme arredondamento para inteiro. As duas variantes passaram cast, custo de MP e efeito.
- Auditoria às `2026-09-27T06:05:19.747Z`: 159 classes, 2.114 relações, 346 asserções falhas, 359 não validadas; status global ainda **FAIL**. `npm test`: 842/842 em 97 suítes. Nenhum save real tocado; serviços protegidos intactos; sem push/merge/deploy; bootstrap/reload completo pendente.

## Atualização — 27 de setembro de 2026, 03:11 BRT

- `Provoke`: adaptada de taunt/redução de resistência a lanças para vulnerabilidade de 5% ao dano recebido por 10 s em combate solo. Warlord e Dreadnought passaram no cast, 54 MP, efeito e expiração; dano real marcado 130 vs 124 sem marca.
- `Dreaming Spirit`: sono adaptado para redução de 12% de P./M. Atk do monstro por 8 s, efeito aplicado pelos seis casos Orc Mage, Orc Shaman, Overlord, Dominator, Warcryer e Doomcryer. Teste confirma o consumidor de ataque no combate real e restauração após expiração.
- Matriz do relatório `2026-09-27T06:11:10.900Z`: 159 classes, 2.114 relações; 1.763 PASS, 158 NOT_EXECUTED, 108 NOT_VALIDATED, 25 bloqueios de conteúdo e 60 de proveniência; 330 asserções falhadas e 351 não validadas. Status **FAIL**.
- `npm test`: 844/844 em 97 suítes. Saves reais intocados; serviços protegidos intactos; sem push/merge/deploy. Bootstrap/reload completo e contratos independentes faltantes continuam pendentes.

## Atualização — 27 de setembro de 2026, 03:13 BRT

- `Hamstring` (`Speed -30%`) adaptada para reduzir `atkSpd` do monstro em 30% por 30 s. Isso alimenta o cálculo de cadência autônoma (`1500 / atkSpd`) em produção; Dark Avenger e Hell Knight passaram no cast, MP, delta 2→1,4 e expiração. Teste focal mede o intervalo derivado, não o wall-clock de múltiplos ticks.
- Provoke (2 classes), Dreaming Spirit (6), Hamstring (2), Damage Reflection (2) e Lionheart (10 variantes) passaram nos efeitos e condições auditados desta rodada. Resultados não se extrapolam às demais classes.
- Relatório `2026-09-27T06:13:18.983Z`: 159 classes/2.114 relações, 1.765 PASS, 156 NOT_EXECUTED, 108 NOT_VALIDATED, 25 bloqueios de conteúdo, 60 de proveniência; 326 assertions failed, 349 unvalidated. Status **FAIL**.
- `npm test`: 845/845 em 97 suítes; sem save real alterado; serviços protegidos intactos; sem push/merge/deploy. Bootstrap/reload real segue sem validação.

## Atualização — 27 de setembro de 2026, 03:25 BRT

- `Ultimate Evasion`: buff-cancel resist convertido em 80% resistência a debuffs de monstros por 30 s. Prova real confirmou evasão física (HP controle 715→646, buff mantém 715) e Gloom aplicado sem buff/resistido com buff. As 24 ocorrências da matriz passaram cast, MP e efeito.
- `Mana Effect Boost`: parser/agregador agora consomem `MP Recovery Rate +5.1` além de Max MP +20%; teste focal confirma ambos os stats e matriz passou em Oracle, Elder e Eva's Saint.
- Relatório `2026-09-27T06:25:49.044Z`: 1.800 PASS, 148 NOT_EXECUTED, 81 NOT_VALIDATED, 25 bloqueios de conteúdo, 60 proveniência; 310 assertions failed, 314 unvalidated; 159 classes/2.114 relações, estado **FAIL**.
- `npm test`: 848/848 em 97 suítes; serviços protegidos intactos, saves reais não alterados; sem push/merge/deploy. Bootstrap/reload real ainda sem prova.

## Atualização — 27 de setembro de 2026, 03:31 BRT

- `Long Shot` (alcance de arco sem significado tático no combate solo) adaptada para +5% P. Atk somente com arco/besta. Teste garante ausência do bônus com espada; onze variantes passaram na matriz e `attackMonster` mediu 124→130 de dano.
- Auditoria `2026-09-27T06:31:42.530Z`: 1.811 PASS, 148 NOT_EXECUTED, 70 NOT_VALIDATED, 25 bloqueios por conteúdo, 60 por proveniência; 310 assertions failed, 303 unvalidated; 159 classes/2.114 relações, status **FAIL**.
- `npm test`: 849/849, 97 suítes. Serviços protegidos intactos; saves reais não tocados; sem push/merge/deploy. Bootstrap e reload real pendentes.

## Atualização — 27 de setembro de 2026, 03:41 BRT

- `Frost Flame` estava tipada como `buff`, embora a descrição canônica peça dano contínuo por 15 s; o executor não conseguia lançá-la. Alterei para habilidade ativa e liguei um DOT ao tick de `attackMonster`: 15 pulsos de 1 s somando 50% do dano resolvido do acerto; recast renova a duração sem atrasar o próximo pulso.
- Regressão no serviço cobre número, cadência, refresh e expiração; a matriz de navegador confirmou 15 eventos com queda de HP e expiração em cada herança: Orc Shaman, Overlord, Dominator, Warcryer e Doomcryer. Isso valida essas cinco ocorrências, não outras skills/classes.
- Relatório `2026-09-27T06:41:10.010Z`, mesmo HEAD `c02262ef3e171884495e27be287fcae0db246fcc`: 159 classes/2.114 relações; 1.816 PASS, 143 NOT_EXECUTED, 70 NOT_VALIDATED, 25 bloqueios de conteúdo e 60 bloqueios de proveniência; 300 assertions failed e 298 unvalidated. Global continua **FAIL**.
- Testes focados 65/65 e suíte completa 850/850 em 97 suítes. `LevelEngine.js`, `MarketService.js`, `ExpeditionService.js` intactos; saves reais sem alteração; nenhum push/merge/deploy. O harness ainda não executa o bootstrap completo nem recarrega save real.
- Próximo: continuar pelos efeitos sem execução/contratos pendentes; manter pendentes os bloqueios de conteúdo/proveniência e a cobertura de promoções, SA/cristais, Foundation, armaduras e atributos até evidência equivalente.

## Atualização — 27 de setembro de 2026, 03:46 BRT

- `Shining Prison` era Hold sem consumidor no combate idle de alvo único. Adaptada para -25% da cadência do monstro por 6 s, aplicada como debuff real e consumida pelo cálculo de ataque autônomo. Nos cinco casos da matriz, `attackSpeed` caiu de 2 para 1,5, expirou aos 6 s e restaurou 2.
- Frost Flame passou novamente pelas cinco heranças com 15 ticks e expiração correta. Corrigido um race no limite do DOT: o último tick agora é aplicado quando o próximo frame chega poucos milissegundos depois da duração. Regressão focal cobre esse atraso.
- Relatório `2026-09-27T06:46:10.000Z`, HEAD `c02262ef3e171884495e27be287fcae0db246fcc`: 159 classes/2.114 casos; status de efeitos 1.821 PASS, 138 NOT_EXECUTED, 70 NOT_VALIDATED, 25 bloqueados por conteúdo e 60 por proveniência. 290 assertions falhadas, 293 sem validação; nenhum efeito está classificado FAIL, mas o status global segue **FAIL** por falta de cobertura e bloqueios.
- Testes focados de Shining Prison/Frost Flame passaram; `npm test`: 851/851 em 97 suítes. Serviços protegidos intocados, saves reais intocados, sem push/merge/deploy. Bootstrap completo/reload de save real pendentes.
- Continuar com contratos/skills não executados e depois auditar restante de classes/promoções, SA/cristais, Foundation, armaduras e atributos. Não generalizar estes cinco casos para todo o catálogo.

## Atualização — 27 de setembro de 2026, 03:51 BRT

- `Anchor`: paralisia não existe como ação bloqueada no combate idle; adaptada para -35% da cadência do alvo por 3 s. Serviço e matriz provaram 2→1,3→2 em Necromancer e Soultaker.
- `Shackle` e `Dryad Root`: Hold adaptado para -25% da cadência por 4 s. A matriz contém só quatro relações dessas duas skills: Paladin/Phoenix Knight e Prophet/Hierophant, todas PASS; não afirmar cobertura das demais classes declaradas no registry.
- Shining Prison (5), Frost Flame (5), Anchor (2), Shackle (2) e Dryad Root (2) passaram em 16 relações totais. Frost Flame manteve 15 ticks; os outros efeitos restauram cadência após expiração.
- Relatório `2026-09-27T06:51:07.332Z`, HEAD `c02262ef3e171884495e27be287fcae0db246fcc`: 1.827 PASS, 132 NOT_EXECUTED, 70 NOT_VALIDATED, 25 content gap, 60 provenance gap, 278 assertions failed e 287 unvalidated; 159 classes/2.114 relações. Global permanece **FAIL**; zero efeitos com status `FAIL` não comprova cobertura completa.
- `npm test`: 853/853 em 97 suítes. Nenhum save real alterado; serviços protegidos intactos; sem push/merge/deploy. Bootstrap e reload real seguem pendentes.
- Continuar a auditoria do catálogo e das áreas restantes do objetivo. As quatro relações de Shackle/Dryad Root não representam cobertura de todas as classes das habilidades.

## Atualização — 27 de setembro de 2026, 03:57 BRT

- `Silence` bloqueia agora a skill especial do monstro quando o tipo é mágico, sem impedir ataques básicos mágicos e sem iniciar o cooldown da skill bloqueada. A duração de adaptação é 6 s.
- Prova por `monsterAttack`: Spellhowler: 97 dano no controle/69 sob Silence; Storm Screamer: 81/58. O controle consumiu recarga (timestamps 144.000/146.800); alvo silenciado manteve `_skillCooldownUntil=0`. Em ambos `magicSkillsSilenced` foi 0→1→0 e o efeito expirou.
- Relatório `2026-09-27T06:56:47.516Z`, HEAD `c02262ef3e171884495e27be287fcae0db246fcc`: 1.829 PASS, 130 NOT_EXECUTED, 70 NOT_VALIDATED, 25 content gap, 60 provenance gap; 274 assertions failed, 285 unvalidated; 159 classes/2.114 relações. Global segue **FAIL** e há 13 classes/linhagens bloqueadas; bootstrap/reload real pendentes.
- `npm test`: 854/854 em 97 suítes. Saves reais sem alteração, serviços protegidos intactos, sem push/merge/deploy.
- Próximo: trabalhar no restante do catálogo e nos sistemas nomeados no objetivo; estas duas variantes não provam as demais classes.

## Atualização — 27 de setembro de 2026, 03:59 BRT

- `Curse Fear` adaptada de medo sem consumidor para -15% P. Atk/M. Atk do monstro por 5 s. O caminho de ataque do monstro usa os stats e remove a penalidade após a expiração.
- Matriz confirmou Necromancer e Soultaker: P./M. Atk 100→85→100, cast e MP corretos. Só estas duas relações foram exercitadas.
- Relatório `2026-09-27T06:59:15.405Z`, HEAD `c02262ef3e171884495e27be287fcae0db246fcc`: 1.831 PASS, 128 NOT_EXECUTED, 70 NOT_VALIDATED, 25 content gap, 60 provenance gap; 270 assertions failed e 283 unvalidated; 159 classes/2.114 relações. Global segue **FAIL**.
- `npm test`: 855/855 em 97 suítes. Saves reais sem alteração, serviços protegidos intactos, sem push/merge/deploy. Bootstrap completo/reload de save real pendentes.
- Continuar as skills sem execução/contrato e auditar promoções/trocas, SA/cristais, Foundation, armaduras e atributos com evidência própria.

## Atualização — 27 de setembro de 2026, 04:04 BRT

- `Sleep` impede o monstro de agir durante 2 s pelo guard em `monsterAttack`; durante esse intervalo não causa dano nem consome cooldown inimigo, e o ataque volta após expiração.
- Matriz de produção: em Spellsinger e Mystic Muse, ataque de controle causou 97/81 dano, sob Sleep 0/0, após 2 s 97/81; cooldown permaneceu 0 dormindo e voltou a ser aplicado após acordar; estado `actionsDisabled` 0→1→0.
- Relatório `2026-09-27T07:04:14.759Z`, HEAD `c02262ef3e171884495e27be287fcae0db246fcc`: 1.833 PASS, 126 NOT_EXECUTED, 70 NOT_VALIDATED, 25 content gap, 60 provenance gap; 266 assertions failed, 281 unvalidated; 159 classes/2.114 relações. Global permanece **FAIL**.
- `npm test`: 856/856 em 97 suítes. Saves reais intactos, serviços protegidos sem alterações, nenhum push/merge/deploy. Bootstrap completo/reload real ainda pendentes.
- Continuar o restante de skills/classes e áreas (promoções, SA/cristais, Foundation, armaduras e atributos). Sleep só foi provada em duas ocorrências.

## Atualização — 27 de setembro de 2026, 04:08 BRT

- Adaptada `Erosion` para -10% P. Def e M. Def do alvo por 5 s, porque a descrição anterior não correspondia a nenhum efeito de combate mensurável. O efeito usa o consumidor existente de defesa de monstros, expira e restaura os valores; as fórmulas de mitigação física e mágica respondem à defesa reduzida.
- Prova do auditor no caminho `main.attackMonster`: somente `secret_assassin_male_3` e `secret_assassin_female_3` (2 relações). Aprendizado, equipamento e cast passaram; custo 50 MP; ambas as defesas 100→90→100; expiração observada em 5 s. Não inferir cobertura de outros skills/classes.
- Relatório `2026-09-27T07:08:37.468Z`, HEAD `c02262ef3e171884495e27be287fcae0db246fcc`: 159 classes, 2.114 relações; 1.835 PASS, 124 NOT_EXECUTED, 70 NOT_VALIDATED, 25 bloqueios de conteúdo, 60 de proveniência; 262 assertions failed e 279 unvalidated. 422/440 contratos de efeito configurados; 18 skills seguem sem contrato. Status global continua **FAIL/BLOQUEADO**.
- `npm test`: 857/857 em 97 suítes. Serviços protegidos (`LevelEngine.js`, `MarketService.js`, `ExpeditionService.js`) intactos. Nenhum save real alterado; bootstrap integral/reload de save real pendentes; sem push/merge/deploy.
- Retomar catálogo de efeitos não executados/não validados e as demais áreas do escopo. Uma adaptação criativa por vez, com equilíbrio explícito e prova no caminho real; aprovação integral continua bloqueada.

## Atualização — 27 de setembro de 2026, 04:12 BRT

- Adaptado `Wind Walk`: movimento não tem efeito no combate de cartas; converte `Speed +20` em +5% de redução de recarga por 10 s, sem aumento de `atkSpd`.
- A matriz achou três relações da skill: `werewolf_1` e `werewolf_2` bloqueadas por lacuna de conteúdo; só `werewolf_3` passou pelo caminho executável. Não inferir para outras classes.
- Relatório `2026-09-27T07:12:33.902Z`: 159 classes, 2.114 relações; 1.836 PASS, 124 NOT_EXECUTED, 70 NOT_VALIDATED, 25 content gap, 60 provenance gap; 260 assertions failed e 278 unvalidated. Contratos 423/440; 17 skills sem contrato. Status geral **FAIL/BLOQUEADO**, incluindo 13 classes/linhagens e bootstrap/reload real pendentes.
- `npm test`: 858/858 em 97 suítes. Erosion: 2 relações executadas; Wind Walk: 1 executada e 2 bloqueadas. Serviços protegidos (`LevelEngine.js`, `MarketService.js`, `ExpeditionService.js`) intactos; saves reais sem alteração; sem push/merge/deploy.
- Retomar auditoria das skills sem contrato e das relações pendentes; preservar rastreabilidade e não extrapolar uma amostra para o catálogo inteiro.

## Atualização — 27 de setembro de 2026, 04:14 BRT

- `Magic Barrier` adaptada para +10% M. Def por 10 s, que alimenta a defesa mágica efetiva do jogador.
- Auditoria encontrou duas relações: `werewolf_2` bloqueada por lacuna de conteúdo; `werewolf_3` executada com sucesso (cast, MP, M. Def 185→203 e expiração em 10 s). Teste `getStats` confirmou o bônus. Evidência de uma única classe executável.
- Relatório `2026-09-27T07:14:29.656Z`: 159 classes, 2.114 relações; 1.837 PASS, 124 NOT_EXECUTED, 68 NOT_VALIDATED, 25 content gap, 60 provenance gap; 258 assertions failed, 277 unvalidated; 424/440 contratos e 16 skills sem contrato. Global continua **FAIL/BLOQUEADO**; 13 classes/linhagens, bootstrap integral e reload real seguem pendentes.
- Provas destas adaptações: Erosion 2 relações PASS; Wind Walk 1 PASS/2 bloqueadas; Magic Barrier 1 PASS/1 bloqueada. Não generalizar além disso.
- `npm test`: 859/859 em 97 suítes. `LevelEngine.js`, `MarketService.js`, `ExpeditionService.js` intactos; saves reais intocados; sem push/merge/deploy. Próximo: revisar as 16 skills sem contrato e as relações não executadas/não validadas.

## Atualização — 27 de setembro de 2026, 04:21 BRT

- `HP Recovery` e `MP Recovery` agora alimentam a regeneração usada pelo combate: +1% HP máximo por nível no tick de 10 s e +0,5 MP por nível no tick de 5 s.
- Reproduzi e corrigi falha de ponto flutuante no acumulador de HP: 50×0,2 s ficava logo abaixo de 10 e suprimia o tick. A comparação de HP/MP agora usa tolerância pequena.
- Matriz no `main.attackMonster`: 50 ticks em `werewolf_3` recuperaram 12 HP e 1 MP; ambas as skills passaram. `werewolf_2` está bloqueada por lacuna de conteúdo. Escopo comprovado: somente essas duas variantes executáveis.
- Relatório `2026-09-27T07:21:20.817Z`: 159 classes, 2.114 relações; 1.839 PASS, 124 NOT_EXECUTED, 66 NOT_VALIDATED, 25 content gap, 60 provenance gap; 258 assertions failed e 275 unvalidated. 426/440 contratos; 14 skills sem contrato. Global **FAIL/BLOQUEADO**; proveniência/conteúdo e reload/bootstrap real seguem pendentes.
- `npm test`: 861/861 em 97 suítes. Serviços protegidos (`LevelEngine.js`, `MarketService.js`, `ExpeditionService.js`) intactos; saves reais sem alteração; sem push/merge/deploy. Retomar pelas skills sem contrato e sistemas ainda não cobertos.

## Atualização — 27 de setembro de 2026, 04:26 BRT

- Adaptado `Berserker Spirit` com trade-off clássico de ataque/defesa, usando como referência as notas oficiais da NCSoft (https://www.lineage2.com/en-us/news/Death-Knight-Reborn-Patch-Notes). Regra Aden Arena por 8 s: +5% P. Atk, +10% M. Atk, +10% CDR (duas fontes de +5% speed viram cooldown), -5% P. Def, -10% M. Def e -2 Evasion. É balanceamento local; não atribuir esses números como regra oficial do L2.
- Só `werewolf_3` pôde executar: aprendizado/equipamento/cast, custo de 15 MP, deltas de ATK/MATK/CDR/DEF/M.DEF/Evasion e restauração após 8 s passaram. `werewolf_2` segue bloqueada por lacuna de conteúdo. Uma variante comprovada.
- Relatório `2026-09-27T07:26:16.476Z`: 159 classes, 2.114 relações; 1.840 PASS, 124 NOT_EXECUTED, 65 NOT_VALIDATED, 25 content gap, 60 provenance gap; 256 assertions failed e 274 unvalidated; 427/440 contratos, 13 skills sem contrato. Global **FAIL/BLOQUEADO**; 13 classes/linhagens, bootstrap e reload real pendentes.
- `npm test`: 862/862 em 97 suítes. Serviços protegidos sem mudanças; saves reais intactos; sem push/merge/deploy. Continuar as 13 skills sem contrato e os sistemas SA/cristais, Foundation, armaduras, atributos, classes/trocas com evidência independente.

## Atualização — 27 de setembro de 2026, 04:29 BRT

- Adaptados `Wild Magic` (+5 pontos percentuais de chance crítica compartilhada por 8 s, já que o jogo não separa crítico mágico) e `Improved Speed` (+10% CDR por 12 s; movimento não tem consumidor no combate ocioso). Nenhum deles aumenta `atkSpd`.
- Referências oficiais NCSoft para a família de efeito: https://www.lineage2.com/en-us/news/lineage-ii-classic-generous-cats-event-july-2024 e https://www.lineage2.com/en-us/news/Death-Knight-Reborn-Patch-Notes . Valores e duração são adaptação/balanceamento Aden Arena.
- Matriz: as variantes executáveis de `werewolf_3` passaram; as variantes registradas em `werewolf_2` seguem bloqueadas por lacuna de conteúdo. Berserker Spirit passou em werewolf_3; amostras não cobrem outras classes.
- Relatório `2026-09-27T07:29:16.555Z`: 159 classes, 2.114 relações; 1.842 PASS, 124 NOT_EXECUTED, 63 NOT_VALIDATED, 25 content gap, 60 provenance gap; 252 assertions failed, 272 unvalidated; 429/440 contratos e 11 skills sem contrato. Global **FAIL/BLOQUEADO**.
- `npm test`: 864/864 em 97 suítes. Serviços protegidos/saves reais intactos; sem push/merge/deploy. Prosseguir pelas 11 skills sem contrato e demais áreas da auditoria.

## Atualização — 27 de setembro de 2026, 04:32 BRT

- Corrigido `Powerful Fists` em `main.attackMonster`: agora efetua dois golpes físicos e cada golpe calcula mitigação contra 75% da P. Def efetiva do alvo (25% de defesa ignorada); cada porção gera seu evento e o total do HP debitado coincide com a soma.
- Prova na única variante executável, `werewolf_3`: cast/custo 84 MP passaram; 2×11.653 dano, P. Def de referência 100→75 em ambos, HP do alvo 1.000.000.000→999.976.694. Não extrapolar a outras classes.
- Lacuna: o modelo de monstros não possui `Shield Defense` separado; essa cláusula do texto local não tem consumidor distinto e continua sem validação. Não declarar a descrição integral coberta.
- Relatório `2026-09-27T07:32:26.939Z`: 159 classes, 2.114 relações; 1.843 PASS, 124 NOT_EXECUTED, 62 NOT_VALIDATED, 25 content gap, 60 provenance gap; 252 assertions failed, 271 unvalidated; 430/440 contratos observados, 10 skills sem contrato. Global **FAIL/BLOQUEADO**.
- `npm test`: 865/865 em 97 suítes. Serviços protegidos intactos; saves reais sem alteração; sem push/merge/deploy. Permanecem contratos ausentes, conteúdo/proveniência, reload/bootstrap real e domínios SA/cristais/Foundation/equipamento/trocas.

## Continuidade — auditoria de skills (04:40 BRT)

Último avanço: Glorious Warrior: Enhanced Abilities foi implementada como CON +1/MEN +1 por 10 s. A prova real passou apenas para `werewolf_3`: 15 MP debitados; HP máximo +10, MP máximo +1 e M. Def. +1; expiração restaurou os valores. Não generalizar a outras variantes/classes. O auditor mede agora também `primaryStats` em buffs.

Estado: auditoria `2026-09-27T07:40:03.191Z`, 159 classes, 2.114 relações, 252 assertions failed, 270 unvalidated; 431/440 contratos, 9 sem contrato: `assassin_s_secret_notes_2nd_page`, `quick_dash`, `unleashed_potential`, `divine_inspiration`, `artful_disarm`, `imminent_piercing`, `moon_influence`, `confused_mind`, `tough_skin`. `npm test` passou 866/866 (97 suítes). Global continua **FAIL/BLOQUEADO**; proveniência independente 146 não validadas/13 bloqueadas; bootstrap e reload real de saves ainda não executados.

Retomar investigando as nove habilidades sem contrato e efeitos sem correspondência com o combate por cartas. Para efeito sem consumidor, propor/adotar equivalente criativo e equilibrado apenas quando semanticamente sustentado; explicitar balanceamento local e validar cast, custo, delta e expiração pelo caminho de produção. Preservar saves reais e `LevelEngine.js`, `MarketService.js`, `ExpeditionService.js`; não fazer push, merge ou deploy.

## Continuidade — Tough Skin e auditoria (04:46 BRT)

Última correção: `Tough Skin` agora é passiva (+20% Debuff Resist), conforme a ficha Warg local em `classes_echo_defs.js`. Antes, estava como buff sem consumidor. A resistência alimenta o cálculo de Hex/Gloom no `MonsterAIEngine`. Regressão: rolagem 0,22 aplica debuff sem skill e é resistida com skill. A auditoria pelo `StatsEngine.getStats` aprovou somente a relação `werewolf_3` (0→0,20); não extrapolar a outras classes.

Estado do auditor: `2026-09-27T07:44:40.890Z`, 159 classes, 2.114 relações, 250 assertions failed, 269 unvalidated, 432/440 contratos; oito IDs sem contrato: `assassin_s_secret_notes_2nd_page`, `quick_dash`, `unleashed_potential`, `divine_inspiration`, `artful_disarm`, `imminent_piercing`, `moon_influence`, `confused_mind`. `npm test`: 867/867 em 97 suítes. Status global **FAIL/BLOQUEADO**; conteúdo/proveniência, bootstrap integral e reload real continuam pendentes.

Retomar pelos oito efeitos, comparando os placeholders canônicos às descrições detalhadas do catálogo Warg local e a fontes independentes quando disponíveis. Aplicar equivalente criativo apenas com base semântica razoável; testar aprendizado, custo, cálculo e efeito consumido pelo combate. Proteger saves reais e `LevelEngine.js`, `MarketService.js`, `ExpeditionService.js`; sem push/merge/deploy.

Ressalva aberta de Tough Skin: a ficha local Warg (`classes_echo_defs.js`) diz passiva 2★ +20% Debuff Resist, enquanto a entrada canônica original preserva `rawType: Buff` e cooldown de 10 min. A implementação testada segue a ficha local como adaptação; a proveniência/conciliação entre variantes continua pendente, portanto o PASS comprova o comportamento implementado, não a fidelidade integral à skill oficial.

## Continuidade — Confused Mind e auditoria (04:51 BRT)

`Confused Mind` não conjurava, pois seu registro era placeholder. Adaptei a transformação sem consumidor no combate por cartas para Postura Feral por 8 s: +10% P. Def., +10% M. Def., +5% CDR, sem aumento de `atkSpd`. Auditor de produção: apenas `werewolf_3` executou e passou cast, custo 15 MP, deltas (DEF 182→198, M.DEF 185→203, CDR 0→0,05) e expiração. `werewolf_2` segue bloqueada por lacuna de conteúdo.

Divergência aberta: ficha local `classes_echo_defs.js` descreve transformação instantânea/cooldown 30 s; registro canônico diz tipo Buff/cooldown 60 s. A duração e os bônus são uma adaptação de balanceamento local inspirada nos efeitos de transformação Warg descritos no registro `unleashed_potential`, não equivalência oficial. Tough Skin também tem conflito de fonte previamente registrado.

Última auditoria `2026-09-27T07:49:22.057Z`: 159 classes, 2.114 relações; 248 assertions failed, 268 unvalidated; 433/440 contratos, sete sem contrato: `assassin_s_secret_notes_2nd_page`, `quick_dash`, `unleashed_potential`, `divine_inspiration`, `artful_disarm`, `imminent_piercing`, `moon_influence`. Global **FAIL/BLOQUEADO**; conteúdo/proveniência e reload/bootstrap real pendentes. `npm test`: 868/868 em 97 suítes.

Teste Valakas tinha flake estatístico comprovado (40 execuções permitiam WR 90%); agora usa seed fixo e 100 combates reproduzíveis, resultado 96% WR, 1,58x SM e 167,6 s. Próximo: investigar os sete efeitos sem contrato e resolver divergências de fonte sem extrapolar a amostra de `werewolf_3`.

## Continuidade — Assassin Notes, adaptações Warg e auditoria (05:18 BRT)

Assassin's Secret Notes foram corrigidas de ataques para buffs. Fonte primária de patch notes: https://eu.4game.com/patchnotes/lineage2essence/426/ . O auditor de produção passou Page 1 e Page 2 nas evoluções masculina e feminina 2/3. Os bônus de precisão agora influenciam o teste real de erro por diferença de nível (−5 pp por ponto de precisão; regra local); velocidade de ataque reduz CDR e `atkSpd` não sobe. A Page 3 consta como elegível a `assassinS2` no registro de skill, mas não está no roster canônico de cinco skills desse estágio, então não foi exercitada. Ainda é preciso decidir como incluí-la sem quebrar a regra de cinco skills.

Adaptações locais, cada uma com contrato e teste no cálculo de produção: Quick Dash = +5% CDR por 2s; Artful Disarm = −20% P. Atk. do alvo por 5s; Imminent Piercing = −15% P. Def. do alvo por 5s; Moon Influence = postura 12s (+15% P. Atk., +10% P./M. Def., +10% CDR e +10% resistência a debuff), cooldown 10 min. O executor real provou as quatro apenas em `werewolf_3`; `werewolf_1` e `werewolf_2` continuam content-gap. A descrição encontrada para Moon Influence indica completar WP e transformar, que não existe como subsistema no combate por cartas; os bônus e duração acima são decisão de balanceamento local, não dados oficiais. Referência informativa: https://loe.promo/wiki/item/spellbook-moon-influence-103005 .

Auditoria `2026-09-27T08:18:36.100Z`: 159 classes, 2.114 relações, 248 falhas, 260 não validadas; 438/440 contratos. Restam `unleashed_potential` e `divine_inspiration` sem contrato. 124 relações ainda falham no cast/custo de MP; ainda não isolaram a causa. 13 classes têm lacuna de conteúdo, a proveniência independente não foi testada e o bootstrap/reload de save real não foi executado. Global continua **FAIL/BLOQUEADO**.

`npm test`: 871/871 em 97 suítes; `git diff --check` limpo. Serviços protegidos intactos; nenhum save real foi lido ou modificado; sem push/merge/deploy.

Retomar pelos contratos de Unleashed Potential e Divine Inspiration, pelas falhas de cast em `main.attackMonster` e pela incoerência Page 3 vs cinco skills por estágio. Não extrapolar as provas Warg de `werewolf_3` para variantes/estágios bloqueados.

## Continuidade — Warg, Assassin Notes e estado atual (05:29 BRT)

`Unleashed Potential` e `Divine Inspiration` agora têm adaptações explícitas e consumidores: o primeiro fornece +8% P. Atk., +5% CDR e +5% resistência a debuffs por rank, já que não existe sistema WP/formas; o segundo fornece +10% de duração aos buffs próprios por rank porque o combate não limita slots. Ambos provaram o cálculo somente em `werewolf_3`; `werewolf_2` segue content-gap.

Auditoria `2026-09-27T08:24:03.400Z`: 159 classes, 2.114 relações; 1.856 PASS, 124 NOT_EXECUTED, 49 NOT_VALIDATED, 25 content-gap e 60 provenance-gap; 440/440 contratos implementados, 248 assertions failed e 258 unvalidated. Global **FAIL/BLOQUEADO**. As 124 relações ainda falham em conjuração/custo de MP no executor e a causa não está isolada. Treze classes têm lacuna de conteúdo; 146 proveniências sem verificação independente; bootstrap/reload de save real sem execução.

Assassin Notes Pages 1/2 passaram nas quatro relações masculina/feminina de classes 2/3. A Page 3 não está nos cinco `skillIds` de `assassinS2`, embora conste elegível nesse estágio na skill registry; não inventar uma sexta vaga. Decidir substituição preservando a regra de cinco skills por evolução.

Quick Dash, Artful Disarm, Imminent Piercing, Moon Influence e os dois passivos acima só têm resultado de efeito PASS em `werewolf_3`; `werewolf_1/2` continuam bloqueadas. Assassin Page 3 não foi executada. Os números das adaptações são balanceamento local; descrições não alegam equivalência oficial. Fonte das Secret Notes: https://eu.4game.com/patchnotes/lineage2essence/426/ .

`npm test`: 872/872 em 97 suítes. `git diff --check` sem erros de whitespace (avisos LF/CRLF). Serviços protegidos intactos; nenhum save real acessado; sem push/merge/deploy.

Retomar isolando as 124 falhas de cast pelo executor de produção, cobrindo as 49 relações não validadas e resolvendo a inclusão da Page 3 no limite de cinco skills. Não declarar aprovação integral a partir de contratos ou amostra `werewolf_3`.

## Atualização de continuidade — 05:36 BRT

Foram criadas adaptações criativas para efeitos sem equivalente no combate por cartas: `Word of Fear` reduz P./M. Atk. do monstro em 12% por 5 s; `Shadow Step` reduz a cadência de ataque em 20% por 5 s. São valores de balanceamento local. Prova via `main.attackMonster`: Hierophant conjurou Word of Fear 1/1; Adventurer e Ghost Hunter conjuraram Shadow Step 2/2, todos debitando MP e aplicando efeitos que expiram.

`Freezing Flame` tinha descrição de dano por 10 s mas caía no caminho de buff sem efeito. Agora é ataque com dano contínuo: metade do hit inicial repartida em dez ticks de 1 s. Warcryer e Doomcryer passaram no fluxo real 2/2, incluindo cast, débito de MP, aplicação e expiração, cada uma com os dez eventos de dano.

Auditoria `2026-09-27T08:35:35.518Z`: 159 classes/2.114 relações; 238 assertions failed, 253 unvalidated; 1.861 PASS, 119 NOT_EXECUTED, 49 NOT_VALIDATED, 25 content-gap e 60 provenance-gap. 440/440 skills únicas têm contrato; execução não está completa. Global **FAIL/BLOQUEADO**. 13 classes/linhagens seguem sem conteúdo suficiente, proveniência independente não foi exercitada, cinco raízes de criação têm conteúdo bloqueado, a UI de promoções não foi renderizada e bootstrap/reload real/save real continuam sem validação.

`npm test`: 876/876 em 97 suítes. `npm run build` passou, com aviso de chunk JS >1,5 MB. `git diff --check` sem erro de whitespace (avisos LF/CRLF). Sem saves reais, push, merge ou deploy; serviços protegidos intactos.

Próximo: analisar os 238 asserts que falham e reduzir NOT_EXECUTED/NOT_VALIDATED com causa comprovada. Não extrapolar as três adaptações às relações ou classes não listadas. Preservar o limite de cinco skills por evolução e a pendência de Assassin Notes Page 3.

## Atualização de continuidade — 05:45 BRT

Mais três adaptações testadas no combate de produção: `Disarm` enfraquece P. Atk. do monstro em 20%/2 s; `Shillien's Stigma` aplica +10% dano recebido e −10% M. Def./8 s; `Elemental Wind Walk` dá +5% CDR/10 s sem mudar atkSpd. Relações aprovadas: Doombringer 1/1 para Disarm (Eviscerator bloqueada por proveniência); Shillien Elder/Saint 2/2; Sylph Gunner/Wind Hunter/Storm Blaster 3/3. Cast e MP foram confirmados.

Auditoria `2026-09-27T08:44:28.506Z`: 159 classes/2.114 relações, 226 assertions failed e 247 unvalidated; 1.867 PASS, 113 NOT_EXECUTED, 49 NOT_VALIDATED, 25 content-gap e 60 provenance-gap. Global **FAIL/BLOQUEADO**. `npm test`: 880/880 em 97 suítes. Build passou com aviso de chunk >1,5 MB. `git diff --check` sem erros de whitespace, avisos CRLF.

Retomar pelas 113 relações não executadas e 49 não validadas, com o restante do escopo original ainda aberto (classes/proveniência/UI/bootstrap, SA/cristais, Foundation, armaduras, stats e trocas). Não validar classes por extrapolação. Manter preservação de saves e serviços protegidos; sem push/merge/deploy.

## Continuidade — atualização 11:35 BRT, 27/09/2026

**Estado do repositório:** `main`, HEAD `c02262ef3e171884495e27be287fcae0db246fcc`. Alterações preexistentes preservadas. `LevelEngine.js`, `MarketService.js` e `ExpeditionService.js` sem diff. Saves reais sem leitura/escrita; não houve push/merge/deploy.

**Correções/efeitos recentes**
- Executor: deixou de ler sempre o `skillIds` do nó V2 genérico compartilhado e agora consome `classSkillIds` específico da evolução e valida progressão com `{class, race}`. Isso remove a execução falsa de `Call of Flame` para Elfos/Elfos Negros.
- `Call of Flame` Humano: quebra P./M. Def do monstro −15%/5 s, 2/2 relações; `Call of Frost` Elf: P. Atk +5% e dano PvE +2%/10 s, 2/2; `Call of Lightning` Dark Elf: ação do monstro bloqueada por 1 s, 2/2. Efeitos locais adaptados e consumidos por `main.attackMonster`.
- `Entangle`: cadência do monstro −20%/4 s, 2/2.
- `Silent Move`: evasão contra skills físicas/mágicas do monstro +10%/8 s, 2/2.
- `Fake Death`: P./M. Def +15% e resistência a debuff +10%/4 s, 4/4.
- `Ultimate Defense`: P./M. Def +60%/10 s, 1/1 no roster medido.
- `Guts`: +400 P. Def, +35% P. Def e +25% resistência a debuffs/10 s, 2/2.

**Validação mais recente**
- Auditor `scripts/functional_chain_test_report.json`, gerado `2026-09-27T14:32:19.888Z`: 159 classes; 2.114 relações de skill. Efeitos: 1.884 PASS, 98 NOT_EXECUTED, 47 NOT_VALIDATED, 25 BLOCKED_CONTENT_GAP, 60 BLOCKED_UNPROVEN_PROVENANCE. 196 assertions failed vêm de 98 casts sem execução e respectivos débitos MP que não ocorreram. O status geral continua **FAIL/BLOQUEADO**.
- `npm test`: 888/888 em 97 suítes. `npm run build`: sucesso, com aviso de chunk JS >1,5 MB. `git diff --check`: sem erros, somente avisos de normalização LF/CRLF.

**Impedimentos/scope pendente:** 98 relações ainda não chegaram ao cast; 47 efeitos sem prova terminal; 13 IDs de classe com lacuna de conteúdo; proveniência independente continua sem validação; bootstrap completo, renderização real da UI de promoções e reload de saves reais não testados. Auditoria global também precisa cobrir promoções/trocas, SA/cristais, Foundation, armaduras e atributos com evidência própria. As aprovações por skill acima são apenas para relações e consumidores mencionados.

**Retomar:** agrupar as 98 falhas por causa de elegibilidade/cooldown/dispatch e investigar sem falsificar `preconditionsMet`; depois fechar efeitos não validados com contrato e consumidor testável. Preservar saves/services protegidos; sem push, merge ou deploy.

## Atualização 11:37 BRT — Dark Panther's Help (27/09/2026)

`Dark Panther's Help` agora conjura pelo caminho real. O servitor não tem ator autônomo neste combate; seu ataque adicional foi mapeado para +5% dano PvE do proprietário por 6 s, com cooldown/custo mantidos. Teste unitário confirmou 100→105 no dano efetivo e expiração; auditor `main.attackMonster` confirmou 2/2 (Dark Avenger, Hell Knight).

Relatório regenerado `2026-09-27T14:36:23.196Z`: 159 classes, 2.114 relações, 1.886 efeitos PASS; 96 NOT_EXECUTED; 47 NOT_VALIDATED; 25 BLOCKED_CONTENT_GAP; 60 BLOCKED_UNPROVEN_PROVENANCE. As 192 assertions failed equivalem a 96 casts rejeitados + asserts de débito MP; status global **FAIL/BLOQUEADO**.

`npm test` passou 889/889 em 97 suítes; `npm run build` passou com aviso de chunk JS acima de 1,5 MB. Sem alteração em `LevelEngine.js`, `MarketService.js`, `ExpeditionService.js`; nenhum save real acessado; sem push/merge/deploy.

Continuar a partir dos 96 casts não executados: identificar, por habilidade, se a causa é ausência de contrato/efeito, regra de elegibilidade, condição tática, cooldown ou dispatch. Não marcar efeitos como aprovados quando o cast não ocorreu. Seguem pendentes também os 47 não validados, gaps de conteúdo/proveniência e as áreas SA/cristais, Foundation, classes/promoções/trocas, armaduras e atributos.

## Continuidade — Sacrifice e Shelter Master (11:49 BRT)

- `Sacrifice` reconhece agora o Power 350 da cura canônica e usa a adaptação solo: paga 10% do HP máximo, não pode deixar o personagem abaixo de 1 HP e cura o próprio personagem. O ramo de cura marca o cast no ciclo de combate. A prova registra separadamente custo e cura pelos setters de HP durante `main.attackMonster`, evitando inferência enganosa quando a cura chega a Max HP.
- Paladin e Phoenix Knight passaram em cast e débito de 15 MP; custo observado foi 85/858 HP e 122/1229 HP, respectivamente, e HP final não ultrapassou Max HP.
- `Shelter: Master`: buff local de +60% P./M. Def. e +25% resistência a debuffs durante 10 s, mantendo cooldown de 3 min. Essa adaptação substitui invulnerabilidade e cura do grupo, que não têm suporte literal no combate solo. A matriz mediu a relação de `evaSaint`; não executou relação para `shillienSaint`. Teste separado confirmou mitigação de dano e chance real de resistência a debuff.
- Auditor regenerado `2026-09-27T14:53:36.654Z`: 159 classes, 2.114 relações; 1.889 PASS, 93 NOT_EXECUTED, 47 NOT_VALIDATED, 25 BLOCKED_CONTENT_GAP e 60 BLOCKED_UNPROVEN_PROVENANCE. Ainda 186 assertions dependentes de cast/MP e 225 sem validação final. Status global **FAIL/BLOQUEADO**; 442 contratos únicos observados não significam que todas as relações/classes estejam verificadas.
- `npm test`: 892/892 em 97 suítes; build passou com aviso de chunk JS >1,5 MB; `git diff --check` sem erros de whitespace, apenas avisos LF/CRLF. Serviços protegidos intactos; sem acesso a saves reais, push, merge ou deploy.
- Retomar pelos 93 casts e 47 efeitos restantes, separando gaps de conteúdo e proveniência das skills testáveis. Bootstrap e reload de save real, UI de promoções, SA/cristais, Foundation, armaduras/status e trocas ainda carecem de validações próprias. Não generalizar resultados das duas classes de Sacrifice ou Shelter às demais classes.

## Atualização de 27/09/2026 — auditoria de habilidades

A matriz ampla passou a mostrar 2.029 relações de skill aprovadas, zero falhas e 85 relações sem validação por conteúdo/proveniência de 13 classes. Todos os 442 IDs únicos observados têm contrato. As três skills sem representação em outras classes (`Increase Power`, `Body to Mind` e `Mystic Spiral`) foram executadas separadamente pelo caminho de produção; isso valida seus efeitos, mas não valida as classes onde estão atribuídas.

Corrigidos dois efeitos que não executavam: Increase Power (+20% P./M. Atk. e bônus de choque ligado à chance real de stun, conforme a variante Lv. 1 consultada) e Body to Mind (sem custo de MP, converte 10% do HP máximo em até 90 MP conforme o Power 90 do cadastro local). A página L2Wiki da variante Body to Mind Lv. 1 confirma a conversão HP→MP, mas mostra Power 60. Fontes: https://l2wiki.com/essence/skills/trooper/1432_1_0.html e https://l2wiki.com/essence/skills/dark_wizard/1157_1_0.html. Corrigidos ainda falsos negativos da prova de reflexão/cura no executor.

O estado global continua `APPROVAL_BLOCKED`: UI das 20 raízes de criação e 134 promoções sem renderização real, bootstrap/save real não exercitados e 13 classes permanecem bloqueadas por proveniência ou conteúdo. `npm test` e build integrais precisam ser repetidos após este lote; nada foi commitado, enviado, mesclado ou publicado.

**Verificação final desta retomada:** `npm test` 930/930, 97 suítes; build passou com aviso de chunk acima de 1,5 MB; `git diff --check` sem erro (avisos de normalização LF/CRLF). Typecheck falha em erros de TS/TSX fora deste lote (`src/App.tsx`, `src/ArenaApp.tsx`, `src/game/Game.ts`, `src/firebase.ts`); esses arquivos não foram alterados aqui. Auditor funcional: 0 falhas e 85 relações bloqueadas, portanto sem aprovação integral.

## Retomada 19:14 UTC / 16:14 BRT — Warg e auditoria ampla (27/09/2026)

A fonte consultada confirma `Growing Potential` (ID 88454) como skill de Warg; a página atribuída a `Unleashed Potential` ID 88453 não existe na árvore Essence. Link: https://l2wiki.com/essence/skills/werewolf_3/88454_1_0.html . Atualizei o roster/atribuição e a progressão; efeito local adaptado (+5% P. Atk., P. Def. e M. Def.) chega ao `StatsEngine`. Save de teste sintético confirma remoção do legado incorreto e reembolso de 30 SP. Teste de regressão 3/3.

Auditoria regenerada em `2026-09-27T19:14:29.867Z`: 159 classes, 2.113 relações, 0 assertions failed / 0 assertions unvalidated; 84 vínculos de skill ainda bloqueados por conteúdo/proveniência em 13 IDs. Dos 159 registros de classe, 146 continuam sem validação independente da proveniência (7 gaps de conteúdo, 6 sem fonte). Os 442 contratos de efeitos configurados não demonstram isoladamente a atribuição correta ou execução de todas as classes/skills. Global `APPROVAL_BLOCKED`; UI de criação/promoção, bootstrap completo e reload de save real não comprovados.

Verificações: `npm test` 934/934 (97 suítes); build passou com aviso de chunk acima de 1,5 MB; `git diff --check` sem erro (avisos de normalização LF/CRLF). Branch `main`, HEAD `c02262ef3e171884495e27be287fcae0db246fcc`; saves reais preservados, serviços protegidos intactos; sem commit/push/merge/deploy.

## Continuidade 19:20 UTC / 16:20 BRT — ShineMaker (27/09/2026)

A NCSoft confirma a classe exclusiva de Dwarf, a cadeia Dwarven Maker → Earth Maker → Wind Maker → Soul Maker → Shine Maker e habilidades próprias: https://www.lineage2.com/news/shinemaker-patch-notes-november-2023 . O runtime Echo local tinha as promoções 1–3 como Highelf e ligava a primeira ao `highElfBase`, apesar de já existir a raiz Dwarf `shineMakerBase`. Corrigidos raça e pai da promoção; regressão verifica a cadeia e a opção de promoção pelo `ClassProgressionEngine`.

Ainda há diferença estrutural: fonte oficial tem cinco classes, o jogo local modela estágios 0–3. O catálogo de skills de ShineMaker (que ainda diverge das habilidades da fonte) continua pendente de reconciliação/adaptação e permanece bloqueado na auditoria. Não adicionei quinta promoção nem alterei schema.

`npm test` 935/935; build passou com aviso de chunks >1,5 MB. Auditor `2026-09-27T19:20:36.905Z`: 159 classes, 2.113 relações, 0 assertions falhas/não validadas, 84 vínculos bloqueados; estado geral `APPROVAL_BLOCKED`. Diff-check sem erros, só avisos LF/CRLF. Serviços protegidos e saves reais preservados; sem commit/push/merge/deploy.

## Retomada 19:48 UTC / 16:48 BRT — ShineMaker: skills e efeitos

A fonte oficial NCSoft confirma ShineMaker como classe mágica híbrida exclusiva dos anões; habilidades com nomes e números criados no Aden Arena não aparecem como habilidades oficiais. Fonte de referência: https://www.lineage2.com/news/shinemaker-patch-notes-november-2023 . Não atribuir os efeitos inventados à NCSoft/L2Wiki. Os 18 registros locais do Aden Arena foram explicitamente marcados como `adenarena-local-adaptation`, preservando as 1.176 skills sourced e 142 classes sourced nos contadores da validação.

Consertada a causa das 14 habilidades Stage 1–3 que não executavam ou eram mapeadas a Guerreiro genérico: faltavam IDs no registro V2, buffs não resolviam stats/duração, Purifying Light não entrava em cura/cleanse, Divine Crystal Aegis caía como ataque, efeitos de controle eram só texto e curas de grupo não tinham consumidor solo. Incluído o kit de quatro skills da raiz local. Efeitos de ataque/defesa, debuffs, stun, lentidão, cura, cleanse, buffs e passiva condicional de maça/hammer agora têm consumidores reais. Remoção do CONTENT_GAP só no nó ShineMaker cuja classe e raça são verificáveis; contexto rejeita outras raças. Regressões e o executor de navegador exercitam `main.attackMonster` e `StatsEngine.getStats`.

Resultado da matriz `2026-09-27T19:47:35.374Z`: 159 classes, 2.127 casos, 458 IDs únicos com contrato; 0 assertions falhas e 0 não validadas. As 44 aparições de skills ShineMaker incluindo herança passaram. `APPROVAL_BLOCKED` permanece por 84 atribuições bloqueadas em 12 classes com lacunas de conteúdo/proveniência e porque o executor não carrega o bootstrap completo nem prova save/reload real. Diferença estrutural ainda aberta: o jogo mantém estágios 0–3, enquanto a fonte oficial lista cinco classes no caminho; não foi inventada a quinta promoção nem suas skills.

Verificação: `npm test` 939/939 em 97 suítes; `npm run build` passou com aviso de chunks >1,5 MB; `git diff --check` sem erro de whitespace (avisos normais LF/CRLF). Branch `main`, HEAD `c02262ef3e171884495e27be287fcae0db246fcc`; `LevelEngine.js`, `MarketService.js` e `ExpeditionService.js` sem diff; saves reais preservados; sem commit/push/merge/deploy. Próximos bloqueios: procedência/atribuições restantes, reconciliar a quinta etapa ShineMaker, outros 12 nós de classe bloqueados e bootstrap/save real.

## Retomada 18:46 BRT — passivas Dwarf

Corrigidas três passivas com efeito ausente/incompleto: Dwarven Weapon Mastery (ataque por nível, 60% menos MP em skills físicas e stun com espada/blunt), Dwarven Armor Mastery (+160 P.Def, +10 evasão e −5% chance de crítico recebido, heavy/light) e Dwarven Recovery Mastery (regeneração de HP/MP nos ticks reais). A cláusula de spear multi-target foi adaptada a +10% de dano somente em ataque básico de lança. Percentuais de 30 pp para “certain chance” e 10% no ataque básico são balanceamento local, não números oficiais.

Validação final: testes focais 122/122; suíte completa 959/959 em 101 suítes; build passou com o aviso de chunk >1,5 MB; `git diff --check` sem erros. Auditor `2026-09-27T21:51:52.974Z`, snapshot inalterado: 159 classes, 2.140 relações, 0 assertions falhas/não validadas, 461 contratos e 477 abas de skill renderizadas; 134 promoções pelo serviço/ViewModel e 134 ativações de subclasse. Auditor já executa `GameBootstrap`/`main.init` e save/reload com dados semeados em perfil descartável; nenhum save real foi aberto.

Estado integral continua `APPROVAL_BLOCKED`: 62 atribuições em 9 classes (3 lacunas de conteúdo e 6 de procedência); 22 raízes de criação e 134 telas de promoção não renderizadas. Os contratos de efeito não substituem prova semântica individual. Próximo passo: continuar a auditoria por famílias e consumidores de skills, sem generalizar os três casos Dwarf. Serviços protegidos intactos; sem commit/push/merge/deploy.

## Retomada 18:57 BRT — Sacral Masteries

Sacral Weapon Mastery agora concede o valor da fonte por nível (P. Atk. +60/+120/+200/+300 aos níveis 20/40/63/70) somente com espada de uma mão e escudo. Sacral Armor Mastery concede P./M. Def. +50/+100/+150/+200 aos mesmos níveis somente com armadura pesada. Fontes L2Wiki estão registradas em `DIARIO_DE_DESENVOLVIMENTO.md`. A regressão anterior de incremento arbitrário foi substituída por verificações das condições e valores.

Validação: 130 testes em duas suites focais; `npm test` 962/962 em 102 suítes; build passou com aviso de chunk >1,5 MB. Auditor `2026-09-27T21:57:16.725Z`, snapshot inalterado: 159 classes, 2.140 relações, 0 assertions falhas/não validadas, 461 contratos e 477 abas renderizadas. Permanece `APPROVAL_BLOCKED`: 62 vínculos em 9 classes (3 lacunas de conteúdo, 6 sem proveniência); 22 telas de criação e 134 telas de promoção não renderizadas.

As correções são evidência apenas para essas passivas Divine Templar. Prosseguir com outras classes/consumidores sem inferir cobertura global. Nenhum save real, serviço protegido, commit, push, merge ou deploy alterado.

## Retomada 19:03 BRT — Element Weaver Armor Mastery

Corrigi a passiva 87782 segundo seu registro canônico: P./M. Def. +20/+30, +100 HP base, +3 MP regen e −15% cooldown mágico, todos condicionados a robe. O bônus de HP passa pelo multiplicador de CON existente. A validação da recarga executa `canCastSkill` com uma habilidade mágica e uma física; sem robe, nenhum bônus é aplicado. O teste reproduziu o defeito e ficou verde com a correção.

Validação: focal 126/126; suíte 963/963 em 103 suítes; build aprovado com alerta conhecido de chunks acima de 1,5 MB. Auditor `2026-09-27T22:02:47.261Z`: 159 classes, 2.140 casos, 62 vínculos bloqueados, 0 assertions falhas/não validadas; 461 efeitos e 477 abas de skills passaram no executor. Status geral segue `APPROVAL_BLOCKED`, com 3 lacunas de conteúdo e 6 lacunas de procedência em 9 classes.

Limite: resultado cobre só essa passiva. As telas de criação/promoção ainda não estão integralmente comprovadas por renderização; saves reais permanecem intocados. Serviços protegidos sem diff; nenhum commit, push, merge ou deploy.

## Retomada 19:07 BRT — Elemental Acumen

A descrição canônica local de Elemental Acumen (88250) declara, sob armadura leve, Casting Spd. +200, M. Skill Cooldown −3%, HP +700, MP +700 e WIT +1. O runtime já roteava velocidade e recarga, mas omitia HP/MP/WIT. Corrigi os três atributos, condicionados à armadura leve; o WIT entra no cálculo normal de MP. Teste reproduz o valor faltante e percorre o gate real `canCastSkill`.

Validação conjunta de Element Weaver e Elemental Acumen: 127 testes focais; `npm test` 964/964 em 104 suítes; build passou com aviso conhecido de chunks grandes. Auditor atualizado `2026-09-27T22:07:15.728Z`: 159 classes, 2.140 relações, 62 vínculos bloqueados, 0 falhas e 0 não validadas; 461 contratos e 477 abas renderizadas. Estado global ainda `APPROVAL_BLOCKED` por 3 lacunas de conteúdo e 6 de procedência em 9 classes.

Os registros locais sustentam esses dois casos, sem alegar conferência independente atual no L2Wiki. Cobertura não generalizável às demais skills/classes. Saves reais e serviços protegidos preservados; sem commit/push/merge/deploy.

## Retomada 19:10 BRT — Rogue's Armor Mastery

A passiva 47332 tinha descrição para seis classes Rogue, mas nenhum bônus chegava ao cálculo real. Implementei, somente com armadura leve, P. Def. +150, P. Evasion +9, −10% crítico recebido e Skill Power +1% para poderes físicos e mágicos. O teste percorre as seis classes, checa a incompatibilidade de equipamento, chama o modificador real de dano de habilidade e força uma rolagem crítica determinística em `MonsterAIEngine`.

Validação das três passivas corrigidas: focal 128/128; `npm test` 965/965 em 105 suítes; build passou (aviso preexistente de chunk acima de 1,5 MB). Auditor `2026-09-27T22:10:39.530Z`: 159 classes, 2.140 casos, 62 atribuições bloqueadas, 0 assertions falhas/não validadas, 461 contratos e 477 abas. Estado permanece `APPROVAL_BLOCKED`: 3 lacunas de conteúdo e 6 de procedência em 9 classes; isso ainda não comprova todas as skills.

Branch e HEAD sem troca; saves reais preservados; serviços protegidos sem diff; nenhum commit, push, merge ou deploy.

## Retomada 19:15 BRT — masteries Combat, Death e Expert

Corrigi efeitos faltantes/inexatos em três masteries de armadura. Combat Armor Mastery, em 4 classes, aplica +135 P. Def., +60 M. Def., +10 evasão e +0,10 MP por tick (adaptação do +10% MP Recovery Rate à unidade consumida pelo loop), somente com armadura heavy/light. Death Armor Mastery agora dá +15 P. Def. em 10 classes, heavy/light, corrigindo o valor anterior +10. Expert Armor Mastery em 3 classes concede +200 HP base, +100 P./M. Def. e +5 evasão, somente com light.

Testes focais 131/131; suíte completa 968/968 em 108 suítes; build aprovado com aviso existente de chunks grandes. Auditor `2026-09-27T22:14:57.640Z`: 159 classes, 2.140 casos, 62 vínculos bloqueados, zero falhas/não validadas; 461 contratos, 477 abas. Ainda `APPROVAL_BLOCKED`, com 3 lacunas de conteúdo e 6 de procedência em 9 classes. Estas evidências não se generalizam para as outras skills/classes.

Nenhum save real ou serviço protegido alterado; branch `main` e HEAD mantidos; sem commit, push, merge ou deploy.

## Retomada 19:19 BRT — Wizard/Summoner Armor Mastery

As duas masteries tinham efeitos ausentes: Wizard (7 classes) e Summoner (5 classes) agora aplicam M. Def. +30 e +15% de resistência mágica; Wizard ainda recebe P. Def. +30/HP +60 com robe, Summoner com robe ou light. O novo atributo de mitigação mágica é separado da redução geral e recebe o tipo real do ataque em `main.js`, de modo que o bônus não reduz ataques físicos.

Teste focal 132/132, cobrindo as 12 classes, equipamentos válidos/inválidos, caster da `MonsterAIEngine`, mitigação de M. Def. e a redução de dano com atkType real. `npm test` 969/969 em 109 suítes; build aprovado com alerta conhecido de chunks grandes. Auditor `2026-09-27T22:18:44.697Z`: 159 classes, 2.140 casos, 62 atribuições bloqueadas, sem assertions falhas/não validadas; 461 contratos e 477 abas. Status geral `APPROVAL_BLOCKED`: 3 lacunas de conteúdo e 6 de proveniência em 9 classes.

Dados de efeito são registros locais, sem alegação de fonte externa atualizada. Saves reais e serviços protegidos preservados; sem commit/push/merge/deploy.

## Continuidade 19:26 BRT — Templar's Armor Mastery (27/09/2026)

A skill canônica local 88050 atribui Templar's Armor Mastery a Evas Templar e Shillien Templar, sob armadura pesada: +320 P. Def., +160 M. Def., +5% Shield Defense, −35% dano crítico básico recebido, +10% MP Recovery Rate, +5% Bow Resistance e +5% Firearms Resistance. Corrigi os efeitos atualmente representáveis: os bônus defensivos e recuperação só ativam com armadura pesada; Shield Defense soma 5 pontos percentuais ao bloqueio apenas com escudo equipado; a redução de crítico básico é aplicada no caminho de dano recebido e não reduz críticos de skills; MP Recovery Rate foi mapeado ao mesmo +0,10 MP/tick usado nas outras masteries locais.

O executor de combate não diferencia ataques de arco e armas de fogo: `MonsterAIEngine` só classifica ataque físico/mágico e os dados de monstros não declaram `weaponType`. Não inventei uma resistência que não possa ser acionada; Bow/Firearms Resistance continuam pendentes até o modelo de ataque carregar essa procedência. A descrição local não foi conferida independentemente em fonte externa nesta retomada.

Regressão primeiro reproduzida em vermelho (P. Def. ausente), depois verde por StatsEngine, MonsterAIEngine, `resolvePlayerBlock` e função de redução conectada ao ataque real em `main.js`. `npm test`: 971/971 em 111 suítes. `npm run build` passou em 17,16 s; permanece o aviso conhecido de chunks JS acima de 1,5 MB. Auditor funcional gerado em `2026-09-27T22:26:02.644Z`: 159 classes, 2.140 casos classe-skill, 62 atribuições bloqueadas em 9 classes (3 gaps de conteúdo e 6 de proveniência), zero assertions falhas/não validadas; 461/461 contratos de efeito e 477/477 abas de skill renderizadas. O status permanece `APPROVAL_BLOCKED`; a renderização real de telas de criação/promoção e a prova de procedência de 9 classes continuam pendentes. O reload de save foi feito apenas com dados semeados em perfil descartável, sem abrir saves reais.

Branch `main`, HEAD `c02262ef3e171884495e27be287fcae0db246fcc`; `LevelEngine.js`, `MarketService.js` e `ExpeditionService.js` sem alterações. Nenhum commit, push, merge ou deploy.

## Continuidade 19:31 BRT — resistência a ataques de arco no bestiário (27/09/2026)

Complemento à nota anterior de Templar's Armor Mastery: o bestiário local identifica cinco inimigos por nomes de arqueiro/atirador/besteiro (`kashaOrcArcher`, `outpostMarksman`, `skeletonArcher`, `gludioRoyalArcher`, `adenCrossbowman`). Marquei os quatro arqueiros/atiradores com `weaponType: bow` e o besteiro com `weaponType: crossbow`; `CombatEngine.pickRandomMonster` copia os campos da definição ao encontro ativo, e `MonsterAIEngine.processMonsterAttack` preserva a família no ataque. O consumidor agora aplica os 5% da passiva às famílias bow/crossbow no dano recebido. Os nomes são conteúdo autoral do bestiário local, não identificação de arma confirmada por fonte oficial externa.

Nenhum monstro local declara arma de fogo. `firearmsResistancePercent` está disponível na ficha calculada e o redutor aceita arma `firearm`/`gun`, mas não há encontro real para provar esse ramo ponta a ponta; mantê-lo explicitamente não validado até existir conteúdo de arma de fogo. A busca externa por páginas de monstros locais não encontrou fontes, então não usei procedência externa para classificar esses nomes.

Regressões Templar cobrem Evas e Shillien Templar, cinco definições, passagem pelo `MonsterAIEngine`, redução para bow/crossbow/firearm sintético e ausência de redução contra espada; 2/2 focais passaram. `npm test`: 972/972, 111 suítes. `npm run build` passou em 17,21 s, mantendo aviso de chunks acima de 1,5 MB. Auditor funcional reexecutado depois da mudança: `APPROVAL_BLOCKED`, 159 classes, 2.140 relações classe-skill, 62 atribuições bloqueadas em 9 classes (3 gaps de conteúdo e 6 sem procedência comprovada), zero assertions falhas/não validadas, 461/461 contratos e 477/477 abas renderizadas. Não confundir renderização da janela de skills com validação visual de todas as telas de criação e promoção.

Nenhum save real aberto; serviços protegidos sem alterações; branch `main`, HEAD `c02262ef3e171884495e27be287fcae0db246fcc`; sem commit/push/merge/deploy.

## Continuidade 19:54 BRT — Armor Care, progressão e crítico de habilidade (27/09/2026)

Corrigi uma omissão real de atribuição: Armor Care não aparecia na árvore de Eva's Templar nem na de Shillien Templar, embora estivesse no catálogo. A fonte usa IDs diferentes por classe (Eva 88053, Shillien 88055); rank 1 exige nível 76, rank 2 nível 84. Registrei ambos os IDs, acrescentei a skill às duas classes finais e fiz o adaptador respeitar o limite de dois níveis e as exigências de nível por rank. `SkillEngine.spendSP` agora cobra os custos encontrados nas páginas consultadas: 5.800 SP para Eva rank 1, 4.900 SP para Shillien rank 1 e 240.000 SP no rank 2 para ambas. Regressão exercita aprendizado real por cada classe, bloqueio aos 83 sem gasto, aquisição no 84 e rejeição acima do máximo.

Armor Care agora aplica crítico de habilidade física (chance 1%/3% e dano crítico +3%/+8%), redução de crítico recebido (2%/4%) e +10% de dano PvE no rank 2. Como o combate não possui atualmente ataques que ignorem defesa de escudo, adaptei esse componente ao sistema existente: +3/+8 pontos de bloqueio quando o personagem equipa escudo. A checagem mede o atributo e o `resolvePlayerBlock`; sem escudo o bônus não entra. A prova isolada em navegador chama `main.attackMonster` com Templar's Rush e rolagens controladas: rank 0 não critica a 0,5%, rank 1 critica; rank 2 critica a 2,9%, mas não a 3%, e o dano crítico do rank 2 supera o rank 1.

Fontes verificadas no L2Wiki: [Eva's Templar 88053 rank 1](https://l2wiki.com/essence/skills/evas_templar/88053_1_0.html), [Eva's Templar rank 2](https://l2wiki.com/essence/skills/evas_templar/88053_2_0.html), [Shillien Templar 88055 rank 1](https://l2wiki.com/essence/skills/shillien_templar/88055_1_0.html) e [Shillien Templar rank 2](https://l2wiki.com/essence/skills/shillien_templar/88055_2_0.html).

Validação após as alterações: `npm test` 974/974 em 112 suítes; `npm run build` passou, com o aviso conhecido de chunks acima de 1,5 MB; teste de navegador da skill passou. Auditor gerado em `2026-09-27T22:54:13.243Z`: 159 classes, 2.142 relações classe-skill, 62 atribuições bloqueadas em 9 classes (3 lacunas de conteúdo e 6 de procedência), 0 assertions falhas/não validadas e 462/462 contratos de efeitos. A aprovação geral continua `APPROVAL_BLOCKED`; contratos de efeito passando não resolvem a procedência de 9 classes nem as telas de criação/promoção que ainda não foram exercitadas visualmente.

Nenhum save real foi aberto ou migrado. `LevelEngine.js`, `MarketService.js` e `ExpeditionService.js` permanecem sem diff. Branch `main`, HEAD `c02262ef3e171884495e27be287fcae0db246fcc`; sem commit, push, merge ou deploy.

## Continuidade 23:06 BRT — nomes da progressão Ertheia e nova auditoria (27/09/2026)

A pesquisa distinguiu o índice Essence do L2Wiki (que lista Sylph, mas não Ertheia) das classes Ertheia de outras versões. O patch oficial europeu confirma os nomes Marauder e Cloud Breaker; uma wiki comunitária específica de Ertheia documenta as sequências Marauder → Ripper → Eviscerator e Ertheia Wizard → Cloud Breaker → Stratomancer → Sayha's Seer; notas oficiais da NCSoft confirmam as classes finais Eviscerator e Sayha's Seer. Usei essas fontes somente para corrigir os nomes da progressão, não para declarar corretas as habilidades locais.

Corrigi os nomes apresentados pelos três registros de classe e pelo manifesto de auditoria. Mantive todos os IDs internos, limites de nível e relações de promoção. Adicionei aliases para os nomes novos e para nomes legados; teste confirma resolução para os IDs já existentes. As seis classes avançadas continuam bloqueadas por procedência, e as duas raízes Ertheia continuam como lacunas de conteúdo: a pesquisa não comprovou as listas locais de skills.

Regressão primeiro falhou em `ertheiaWarrior` (esperado Ripper, encontrado Eviscerator); depois os três testes de nomes, IDs, relações e aliases passaram. `npm test`: 977/977 em 112 suítes. `npm run build` passou, com o aviso conhecido de chunks maiores que 1,5 MB. Auditor funcional de `2026-09-27T23:06:03.992Z`: 159 classes, 2.142 relações classe-skill, 62 atribuições bloqueadas, zero assertions falhas/não validadas; 462/462 contratos e 477/477 renderizações da janela de skills passaram. Os 134 ViewModels de promoção e 134 ativações de subclasses passaram. Bootstrap/reload passou em perfil descartável.

O gate segue `APPROVAL_BLOCKED`: 3 raízes com conteúdo ausente, 6 classes Ertheia sem procedência das skills; a auditoria ainda não renderiza 22 telas de criação e 134 modais de promoção. Não generalizar a validação das telas de skills para essas interfaces.

Nenhum save real foi aberto; serviços protegidos sem diff; `main`/`c02262ef3e171884495e27be287fcae0db246fcc`; sem commit, push, merge ou deploy.

## Continuidade 22:01 BRT — skills Kamael atribuídas a outras classes (27/09/2026)

Corrigi atribuições explícitas: `Kamael's Dignity` e `Pride of Kamael` não ficam mais elegíveis para Ertheia Fighter; `Overwhelming Power` agora pertence somente a Doombringer, conforme a atualização oficial de Essence que o adiciona à seção de classes Kamael. Removi essa skill das árvores de Titan e Eviscerator; substituí o slot de Titan por `Frenzy`, que o catálogo já identifica como skill de Titan. Mantive todos os IDs de skills e classes para compatibilidade.

A árvore de Eviscerator ficou com quatro skills locais em vez das cinco anteriores; não inventei uma substituta sem procedência. A homologação agora documenta essa lacuna e mantém Eviscerator bloqueada até haver uma skill Ertheia comprovada. Regressões reproduziram as atribuições indevidas antes das correções e verificam a rejeição pela elegibilidade real `isSkillNativeOrAvailableNow`.

`npm test`: 979/979 em 112 suítes. `npm run build` passou em 54,14 s, com aviso de chunks acima de 1,5 MB. Auditor funcional gerado em `2026-09-28T01:01:13.692Z`: `APPROVAL_BLOCKED`, 159 classes, 2.140 casos classe-skill, 61 atribuições bloqueadas, zero assertions falhas/não validadas; 462/462 contratos e 477/477 renderizações de janela de skills passaram. Continuam 3 lacunas de conteúdo e 6 classes sem procedência suficiente; 22 telas de criação e 134 modais de promoção seguem sem renderização visual.

Fonte: [notas oficiais de Lineage II Essence — Death Knight update](https://eu.4game.com/patchnotes/lineage2essence/196/), incluindo a seção de novas skills de Doombringer e skills Kamael.

Nenhum save real foi aberto; `LevelEngine.js`, `MarketService.js` e `ExpeditionService.js` sem alterações; branch `main`, HEAD `c02262ef3e171884495e27be287fcae0db246fcc`; sem commit, push, merge ou deploy.
