# Plano de épicos e zonas especiais

**Status:** pesquisa web concluída; implementação em andamento.  
**Atualizado em:** 01/10/2026  
**Escopo:** expansão do catálogo de bosses e zonas especiais de Aden Arena, preservando a regra de que Epic Bosses só sejam acessados por encontros/eventos especiais.

## Objetivo

Expandir o roster de Epic Bosses e as zonas especiais sem deixar bosses épicos aparecerem como chefes de mapas comuns. Cada boss deve ter identidade, acesso e kit coerentes com sua zona e arquétipo. Cada monstro deve possuir ao menos uma habilidade reconhecível; Elites e chefes regionais têm habilidades nomeadas próprias; Epic Bosses precisam de comportamento, efeitos e status exclusivos.

## Evidência web e limites de versão

Lineage II mudou entre chronicles, regiões e versões como Essence. Os dados abaixo servem como referências de design, não como lista universal nem como especificação automática do Aden Arena. O servidor precisa definir a versão de referência para cada conteúdo importado ou adaptado.

### Hellbound — Steel Citadel (Chronicle 1.5)

A página de atualização de Hellbound descreve Steel Citadel como hunting ground com progressão por áreas: Base Tower, Tower of Infinitum, Tully's Workshop e Tower of Naia. A entrada depende da confiança/contribuição aos habitantes de Hellbound; completar uma área libera a seguinte. A página lista Demon Prince e Ranku em Tower of Infinitum, Darion em Tully's Workshop, e Epidos e Beleth em Tower of Naia. Beleth é o boss final associado à cidadela. A página identifica explicitamente seu contexto como CT 1.5 Hellbound.

**Aplicação proposta:** adaptar como cadeia de encontros especiais com progresso explícito e bloqueios por etapa; não inserir Beleth em mapa de caça normal. Manter guardiões/subchefes e boss final em registros próprios, vinculados à zona e etapa.

### Celestial Tower (Lineage II Essence)

A documentação do L2Wiki Essence descreve uma zona acessada pelo menu Special Zones, com ciclo semanal e tempo de permanência reiniciado às quartas-feiras. O NPC Yani encaminha jogadores a áreas de níveis 89, 91 e 94. Às sextas, às 22:00, aparecem monstros especiais; Ferion Celestial Emperor surge na área central da faixa de nível 94, que se torna uma zona PvP até 23:00. A página identifica Ferion como boss nível 95 com 4,86 bilhões de HP, e descreve Ferion's Praetorian e uma missão semanal associada.

**Aplicação proposta:** modelar como world event temporizado com faixa de nível, janela PvP, anúncios, entrada e objetivo semanal configuráveis. Horário, custos, HP e recompensas do Essence são referências daquela versão e precisam de balanceamento próprio; não copiar literalmente.

### Fafurion's Nest (Lineage II Essence)

O L2Wiki Essence classifica Fafurion's Nest como Special Zone para nível 88+, com janela de entrada semanal, sala de espera e grupo formado para o encontro. A luta contra Fafurion Water Dragon tem três fases; o cenário muda em limiares de HP e introduz Guarding Stones e dragões invocados. O encerramento distribui recompensas por participação/dano e golpe final. É um bom precedente para tratar Fafurion por evento especial, em vez de deixá-lo como boss de caça em Emerald Grove. Horário, quantidade de participantes, drops e bônus são específicos daquela versão e não devem ser copiados sem adaptação.

### Frost Lord's Castle e Glakias (Lineage II Essence, atualização 4game)

As notas da atualização oficial descrevem Frost Lord's Castle como zona dimensional com entrada em dias/horários definidos e nível mínimo. Há sequência de raid bosses: Slicing ou Reggiesys, depois Royal Counsellor Tiron; derrotar Tiron conduz ao World Boss Glakias. O boss final varia conforme o encontro precedente: Frost Lord Glakias ou Dreadful Frost Lord Glakias. A dificuldade também varia entre normal e difícil. A zona e os encontros estão associados a equipamentos Frost Lord.

**Aplicação proposta:** tratar como evento especial encadeado, com progressão e variante final determinada pelo resultado do encontro anterior. Criar identidades distintas para variantes e dificuldades, garantindo que nenhuma delas apareça em zona comum. Validar economia e recompensas contra o catálogo local antes de definir drops.

### Catálogo Epic do Essence consultado

O índice do L2Wiki Essence consultado categoriza Queen Ant, Core, Orfen, Baium, Zaken, Lilith e Anakim como Epic e Antharas como World Boss, além de listar variantes caóticas de Queen Ant, Core, Orfen e Zaken. Isso difere do registro local do Aden Arena, que inclui Frintezza e Valakas e lista oito bosses. A diferença demonstra que a classificação depende da versão e que o projeto deve manter sua própria taxonomia canônica. Glakias e Ferion são referências adicionais para expansão, mas não devem ser promovidos automaticamente a integrantes de uma lista universal de “épicos”.

## Decisões de produto recomendadas

1. Preservar o roster atual de oito Epic Bosses do Aden Arena e criar uma tabela extensível para novos bosses. Não remover nem recategorizar silenciosamente os atuais.
2. Tratar Antharas, Valakas e demais Epic/World Bosses como encontros exclusivos do sistema de evento/raid, sem spawn em mapas de combate comuns.
3. Adicionar Glakias, Ferion, Fafurion e Lindvior como candidatos de expansão; Beleth como boss de encerramento de Steel Citadel. Confirmar identidades finais e categoria interna com o roster do projeto.
4. Reutilizar famílias mecânicas em encontros regionais apenas como implementação compartilhada; cada Elite e boss tem habilidade própria, nome e telemetria, e cada Epic Boss tem efeitos, status e fases exclusivos.
5. Não reproduzir horários, níveis, HP, custos, drops ou calendário de versões Essence/Chronicle sem conversão para o ritmo, economia e estrutura do servidor Aden Arena.

## Plano de implementação

### Fase 0 — Fixar o cânone e preservar estado

- Conferir o roster de `RAID_BOSSES`, `WorldBossService`, zonas, registros de eventos, IDs e spawns.
- Definir os sistemas existentes que controlam entrada, horário, estado do encontro, morte/respawn, loot e anúncio.
- Especificar versão de referência por conteúdo: Hellbound CT 1.5 como inspiração histórica; Celestial Tower e Frost Lord's Castle como inspiração Essence; conteúdo original Aden Arena claramente rotulado.
- Registrar IDs canônicos sem aliases ambíguos e marcar cópias de Epic Boss em zonas comuns para remoção planejada.

### Fase 1 — Catálogo e contratos de dados

- Criar manifesto de zonas especiais com `zoneId`, categoria, requisitos, janela, elegibilidade, entradas/saídas, etapas, PvP, limites, bosses, recompensas e fonte.
- Criar manifesto de encounters com boss/variante, zona/etapa, categoria (`regional`, `elite`, `raid`, `epic`, `world`), habilidades, estados, fases, anúncios, vitória e recompensas.
- Auditar IDs duplicados e exigir que boss de evento tenha uma única origem de spawn ativa por encontro.
- Acrescentar validação que rejeite Epic/World Boss em spawn de zona comum, salvo fixture explícita de evento.

### Fase 2 — Integridade do acesso aos Epic/World Bosses

- Encontrar spawns comuns de Antharas, Valakas e outros bosses da classe especial.
- [x] Remover Antharas e Valakas como bosses de caça comum. Antharas' Lair agora usa seu Guardião Behemoth como boss regional; Forge of the Gods usa Vulcan Lord. Os dois dragões continuam disponíveis pelos catálogos de Raid e World Boss.
- [x] Encaminhar Lindvior ao `RaidService` e Fafurion a Fafurion's Nest; criar mecânicas/recompensas próprias e substituir os bosses comuns por Ancient Emerald Dragon e Dragon Valley High Overlord.
- [x] A regressão de integridade agora percorre todos os IDs do catálogo de Raid e World Boss e rejeita qualquer um configurado como boss de caça comum.
- [x] Criar Fafurion's Nest como instância especial semanal em duas etapas: Pedra Guardiã e Fafurion. O Dragão tem três fases de arena com escalada de ataque e status periódico próprio.
- [x] Remover a entrada genérica antiga de Fafurion no RaidService; o ID `fafurion` agora identifica apenas o boss final do Ninho.
- A ocorrência confirmada no código local era `lineage-idle/src/data/zones.js`: Antharas Lair e Forge of the Gods apontavam diretamente para Antharas e Valakas. A regressão `test/combat-zone-integrity.test.js` agora protege a separação entre spawn comum e acesso especial.
- Substituir ocorrências comuns por boss regional adequado à zona, preservando nível, raça, arquétipo e progressão do mapa.
- Encaminhar bosses especiais somente pelos eventos/raids existentes, com entrada elegível e estado de ciclo controlado por serviço.
- Testar que um boss não possa estar ativo simultaneamente em zona comum e evento, e que vitória, recompensa, respawn e saída ocorram uma vez.

### Fase 3 — Zona especial piloto: Frost Lord's Castle

- [x] Implementar como instância diária em três etapas: Reggiesys, Tiron e Glakias. O HP restante do jogador após Tiron determina a forma final de Glakias; a interface mostra os requisitos de nível/CP e o encadeamento.
- [x] Definir no protótipo a variante de Glakias pela vida restante do jogador após Tiron como regra adaptada ao desafio solo; a regra pode ser recalibrada após telemetria de balanceamento.
- Separar estado do evento de estado individual do save para impedir entrada em etapas incompatíveis.
- Implementar agenda configurável, elegibilidade, anúncio, progressão, bloqueio de reentrada e encerramento/limpeza.
- Decidir se Glakias e suas duas formas entram como Epic, World Boss ou categoria original do servidor.

### Fase 4 — Hellbound e Celestial Tower

- [x] **Steel Citadel:** protótipo diário em cinco etapas: Demon Prince, Ranku, Darion, Epidos e Beleth; adaptação Hellbound CT 1.5 em ordem linear, sem dependência de reputação não existente.
- [x] **Celestial Tower:** evento de sexta-feira, 22:00–23:00 UTC, com Praetorian e Ferion em etapas sequenciais; acesso semanal, requisitos e recompensas adaptados.
- A versão atual comprime as três áreas em uma sequência curta de dois encontros. PvP, grupo e contribuição distribuída ficam fora do protótipo solo; a missão semanal e as faixas 89/91/94 são conteúdo de expansão.
- [ ] Implementar expiração/saída por desconexão e anúncios globais; o protótipo atual é solo e não mantém grupo ou contribuição distribuída.
- Entregar cada zona atrás de configuração/feature flag para permitir balanceamento isolado e rollback.

### Fase 5 — Cobertura do bestiário e kits

- [x] Cobrir os 177 monstros: habilidades existentes foram mantidas; registros antigos sem `skill` recebem uma habilidade temática baseada em nome, elemento, magia e traits. `test/monster-skill-coverage.test.js` garante nome, tipo de dano, multiplicador e recarga.
- [ ] Revisar manualmente a adequação temática das habilidades geradas e separar ataques diretos, buffs, controle e passivos.
- [x] Aplicar estados anunciados de stun, root, bleed e poison com duração, chance reduzida por resistência, limpeza e feedback; danos periódicos são processados no combate.
- [x] Dar nomes e parâmetros às habilidades de Elites e bosses; as habilidades de lacunas usam templates temáticos com parâmetros por categoria e arquétipo.
- [x] Fafurion e Lindvior possuem status próprios e fases que alteram o combate; outros Epic Bosses mantêm suas mecânicas exclusivas do catálogo atual.
- Balancear com testes determinísticos para solo/grupo, imunidades, resistência, repetição de status e recompensa.

### Fase 6 — Integração, UX e liberação

- [x] Integrar Fafurion’s Nest, Frost Lord’s Castle, Steel Citadel e Celestial Tower à central “Combate & Zonas”, junto das jornadas solo de Kamaloka e Pailaka; separar jornadas diárias dos desafios especiais e exibir faixa de nível, CP, encontros, agenda e recompensas.
- [x] Reformular Song of Ice and Fire e Devil’s Legacy como jornadas Pailaka de três encontros, com mecânicas próprias nas lutas finais; aplicar também o limite superior de nível cadastrado para Kamaloka/Pailaka.
- Apresentar calendário, requisitos, estado, grupo/instância, recompensas e aviso de PvP antes da entrada.
- Cobrir acesso inválido, janela expirada, chefe morto, desconexão, derrota, vitória, reentrada e encerramento.
- Validar save descartável, persistência/restart, concorrência de grupos, limites de recompensa, telemetria e UI pelo navegador autorizado.
- Liberar uma zona de cada vez; medir participação/conclusão/recompensas, ajustar e então abrir a próxima.

## Critérios de aceite

- Nenhum Epic/World Boss do roster ativo aparece em spawn de zona comum.
- Todo Epic/World Boss tem acesso rastreável a evento/raid; vitória, loot e respawn são idempotentes.
- Toda zona especial tem fonte/versionamento, requisitos legíveis, rota de entrada/saída e encerramento robusto.
- Cada um dos 177 monstros tem uma habilidade funcional adequada ao kit; Elites e bosses têm habilidade própria e nomeada; cada Epic Boss tem efeitos/status/mecânicas exclusivos.
- Testes de dados garantem unicidade, categoria, vínculo zona-etapa, cobertura e ausência de spawns épicos em mapa comum.
- Dificuldade e economia são definidas para Aden Arena, sem assumir compatibilidade de valores Essence/Chronicle.

## Fontes consultadas

- NCsoft/Lineage II Legacy, atualização CT 1.5 Hellbound — Steel Citadel, Tower of Naia e encontros: <https://legacy-lineage2.com/news/hellbound_03.html>
- Lineage II Essence Knowledge Base, Celestial Tower — acesso, áreas e evento de Ferion: <https://l2wiki.com/essence/locations/special_zones/celestial_tower/>
- Lineage II Essence Knowledge Base, Fafurion's Nest — janela especial, fases e recompensas de evento: <https://l2wiki.com/essence/articles/3131.html>
- 4game/Lineage II Essence, atualização Frost Lord — zona, progressão, variantes de Glakias e itens: <https://eu.4game.com/en/patchnotes/lineage2essence/329/>
- Lineage II Essence Knowledge Base, índice de bosses — classificação e calendário publicados para essa versão: <https://l2wiki.com/essence/npcs/bosses/>

Páginas consultadas em 01/10/2026 por Firecrawl. L2Wiki corresponde a Lineage II Essence; a fonte de Steel Citadel corresponde a Chronicle 1.5. Mecânicas e valores precisam ser revalidados antes da implementação final.
