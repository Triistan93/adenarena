# 🚀 Notas de Lançamento — Aden Arena: Idle Chronicles
## Versão Candidata v1.0.0-RC1 (Release Candidate)

**Data de Emissão:** 03 de Outubro de 2026
**Status do Projeto:** Homologado com 100% de Aprovação
**Suíte de Testes:** 1.531 / 1.531 testes aprovados em 159 suítes (`npm test`)
**Build de Produção:** Aprovado via Vite (`dist/` gerado sem falhas)
**Formatação e Git:** `git diff --check` aprovado sem erros

---

### 1. Resumo Executivo da Versão

Aden Arena: Idle Chronicles atinge a maturidade para publicação estável, segura e coesa. O modo Idle foi completamente blindado contra perdas de dados, bloqueios de jornada, inconsistências econômicas e vulnerabilidades de concorrência.

Todos os 5 pilares do plano de lançamento foram concluídos e homologados através de testes automatizados e execuções no navegador Microsoft Edge Headless contra emuladores locais do Firebase.

---

### 2. Destaques dos Sistemas Publicados

#### 🛡️ Etapa 1 — Caminho Principal do Jogador & Estabilidade
- **Criação & Arquétipos:** Suporte às 9 raças canônicas, 25 classes base e 49 linhagens autênticas do Lineage II Essence;
- **Combate & Ciclo Central:** Combate idle responsivo, cálculo defensivo de monstros, drops de equipamentos e consumíveis, e auto-equipamento inteligente ERS;
- **Persistência Confiável:** Salvamento híbrido (Local + Cloud Firestore) com proteção contra corrupção, fila de sincronização por UID e reidratação garantida pós-reconexão;
- **Desbloqueios & Gating:** Acesso à Forja e Codex desde o Nível 1 na Temporada 1, desbloqueando a missão diária `d_codex` e o Grande Baú Diário de Aden.

#### ⚒️ Etapa 2 — Forja Imperial & Economia Fechada
- **Catálogo de Receitas:** 1.285 receitas canônicas auditadas (No-Grade a S-Grade) com 0 itens faltantes e 0 custos inválidos;
- **Insumos & Matérias-Primas:** 131 materiais integrados à Bancada de Refino (metalurgia, curtume, madeira e alquimia);
- **Life Stones & Augmentação:** Consumo atômico de pedras de Life Stone e Adena canônica (25k a 250k) com taxa de purificação de 25.000 Adena;
- **Tatuagens & Dyes:** Validação estrita com teto líquido de +5 por atributo e cobrança atômica somente em caso de sucesso.

#### 🪙 Etapa 3 — Mercado Central de Giran (P2P Real-Time)
- **Comércio Livre:** Negociação direta entre jogadores em Adena (🪙) ou Aden Coins (👑);
- **Taxas Imperiais:** Taxa de anúncio de 5% (mínimo 100 Adena) como ralo econômico e taxa de conclusão de 3% para a Coroa de Aden (lucro líquido de 97%);
- **Concorrência & Idempotência:** Transação atômica ACID no Cloud Firestore impedindo compras simultâneas colidentes, sem perda de moedas ou concessão de itens fantasmas;
- **Cancelamento & Extrato:** Devolução atômica à mochila ao cancelar anúncios e aba "Minhas Vendas" para resgate seguro de lucros.

#### 🏰 Etapa 4 — Clãs & Casas do Reino
- **Fundação & Nomes:** Reserva atômica de nomes exclusivos no Firestore, liderança única e associação por UID;
- **Governança & Cargos:** Apenas o líder pode editar apresentação, recrutamento, expulsar integrantes ou transferir a liderança; saída voluntária desimpedida para membros;
- **Objetivos Coletivos de Temporada:** Três contratos de cooperação ativos (Frente de Batalha, Provisões do Estandarte e Reconhecimento de Fronteira) concedendo +500 Reputação e Bênção do Estandarte de 24h a todos os membros ao atingir a meta;
- **Desacoplamento de Castelos:** Posse individual e renda passiva de castelos removidas do ciclo solo; cercos organizados como domínios coletivos de clã.

---

### 3. Estacionamento (Roadmap Pós-Lançamento)

Ficam conscientemente preservados para atualizações e temporadas posteriores:
- Disputas de Cerco a Castelos em tempo real entre clãs e alianças de jogadores;
- Guerras territoriais e tributação entre castelos rivais;
- Expansões de arte e novos retratos de chefes;
- Desbloqueio do Estágio 3 (3ª transferência de classe) previsto para a Temporada 3.

---

### 4. Checklist de Segurança e Publicação

- [x] Variáveis de ambiente de desenvolvimento (`VITE_FIREBASE_EMULATORS`) bloqueadas em ambiente de produção;
- [x] Zero credenciais, chaves privadas ou tokens sensíveis no código-fonte ou no repositório;
- [x] Whitelist de administração restrita exclusivamente às contas autorizadas;
- [x] Regras de segurança do Firestore (`firestore.rules`) testadas e em conformidade estrita;
- [x] Suíte completa (`npm test`) com 1.531 testes aprovados;
- [x] Build de produção (`npm run build`) validado.

---

### 5. Plano de Rollback

Caso ocorra qualquer anomalia crítica após o deploy de produção:
1. Reverter o deploy no provedor de hospedagem para a versão anterior através do painel de CI/CD ou rollback de commit;
2. Os dados de jogadores persistidos no Cloud Firestore permanecem compatíveis e não sofrem alterações destrutivas;
3. O branch `main` mantém os checkpoints recuperáveis consolidados na Etapa 0 (`136bc3c9`, `340858d9`, etc.).
