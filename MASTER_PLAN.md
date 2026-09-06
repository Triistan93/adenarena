# ⚔️ Plano Mestre de Melhorias e Implementações — Aden Arena (Lineage Idle RPG)
> **Versão Unificada v5** — Consolida o plano original (Níveis 1-4), a revisão de foco 100% Idle (Nível 5), e todos os complementos adicionados (Níveis 6-17). Documento único de referência para evolução do projeto rumo ao padrão comercial 10/10.
>
> **Escopo confirmado:** o plano cobre exclusivamente o modo **Idle** (`src/idle/markup.ts` + `lineage-idle/`). Modos 2D e 3D foram removidos do escopo.

---

## 📌 Índice Executivo

1. Quick Wins & Polimento de UI/UX
2. Core Engine, Sinergias de Combate & IA de Chefes
3. Sistemas End-Game Clássicos de Lineage II
4. Arquitetura React ↔ Shadow DOM, Anti-Cheat & Segurança Firebase
5. Sistema de Cosméticos VFX — Sem Status, 100% Idle
6. Economia, Balanceamento e Anti-Inflação
7. Onboarding, Retenção e Live-Ops
8. Infraestrutura, Performance e Escalabilidade
9. Monetização Ética & Analytics
10. Acessibilidade, Localização e Polimento Final
11. Reformulação Completa do Sistema de Clãs
12. Rankings Multi-Categoria com Recompensas Escalonadas (Anti-Bot)
13. Sistema Matemático Central de Balanceamento (BalanceEngine)
14. Simplificação de Consumíveis (Scroll / Soulshot / Spiritshot Universais)
15. IA de Combate para Monstros & Sistema de Dificuldade Progressiva
16. Sistema de Síntese na Forja
17. Reformulação de Soul Crystals & Atributos Elementais

---

## 🥇 NÍVEL 1: Quick Wins & Polimento de Interface (`src/idle/markup.ts`)

### 1.1. HUD de Ressonância Dupla & Tooltip Comparativo
- **Onde alterar:** `src/idle/markup.ts`, `lineage-idle/src/ui/GameUI.js`, `lineage-idle/style.css`
- Orbe central luminoso (`#dual-resonance-orb`) entre os slots de armas, exibindo ícone dinâmico da Ressonância ativa e tooltip com bônus acumulados (P.Atk, M.Atk, SA, Augmentation).

### 1.2. Feedback Explosivo na Janela de BREAK (Stagger 2.0x)
- **Onde alterar:** `src/idle/markup.ts`, `lineage-idle/src/engine/StaggerEngine.js`, `lineage-idle/src/ui/GameUI.css`
- Cronômetro regressivo de alta precisão e bordas douradas pulsantes ao zerar a postura; números de dano crítico em tipografia Ouro Carmesim durante a vulnerabilidade total.

### 1.3. Auto-Soulshots & Blessed Spiritshots na Barra de Atalhos
- **Onde alterar:** `src/idle/markup.ts`, `lineage-idle/src/engine/CombatEngine.js`, `lineage-idle/src/services/InventoryService.js`
- Slots dedicados com toggle automático (clique direito ativa o brilho giratório clássico do L2).
- **Atualizado pelo Nível 14:** consumo passa a ser de soulshot/blessed spiritshot **universais**, com efeito visual escalando pela grade da arma/item equipado.

### 1.4. Auto-Cristalização & Filtro de Inventário por Grade
- **Onde alterar:** `src/idle/markup.ts`, `lineage-idle/src/services/InventoryService.js`
- Botão de conversão em massa de equipamentos não utilizados em Cristais (D/C/B/A/S) para alimentar o `CraftService.js`.

---

## ⚔️ NÍVEL 2: Core Engine, Sinergias de Combate & IA de Chefes

### 2.1. Sistema de Procs Ativos na Matriz de Ressonância
- **Onde alterar:** `lineage-idle/src/services/WeaponResonanceService.js`, `lineage-idle/src/engine/CombatEngine.js`
- Arco + Adaga (*Caçador das Sombras*): 18% de chance no crítico de ignorar 35% da P.Def por 4s.
- Dual Sword + Lança (*Senhor da Tempestade*): +25% dano de Stagger e dano em área.
- Cajado + Espada Mágica (*Arcanista Imperial*): 15% de chance de resetar cooldown da próxima magia de impacto.

### 2.2. Mecânica Canônica de Over-Hit (+25% EXP/SP Bonus)
- **Onde alterar:** `lineage-idle/src/engine/CombatEngine.js`, `lineage-idle/src/engine/LevelEngine.js`
- Abater monstros com skills marcadas `overhit: true` gera bônus proporcional ao dano excedente.

### 2.3. Chefes Épicos com Canalização Interrompível por Stagger
- **Onde alterar:** `lineage-idle/src/data/raids.js`, `lineage-idle/src/engine/StaggerEngine.js`
- Raid Bosses iniciam cast fatal aos 50%/25% de HP; zerar Stagger durante o cast interrompe e estende a janela de BREAK para 8s.

---

## 👑 NÍVEL 3: Sistemas End-Game Clássicos de Lineage II

### 3.1. Grand Olympiad Assíncrona (Arena PvP & Status de Herói)
- **Onde alterar:** `src/firebase.ts`, `src/idle/markup.ts`, `lineage-idle/src/services/OlympiadService.js`
- Combates 1v1 automatizados contra snapshots de builds reais salvas no Firebase; Top 1 mensal recebe aura de **Herói de Aden** e acesso a armas Hero.

### 3.2. Ciclo Semanal dos Sete Signos (Seven Signs: Dawn vs Dusk)
- **Onde alterar:** `src/firebase.ts`, `lineage-idle/src/data/zones.js`
- Disputa semanal entre Dawn e Dusk; a facção vencedora libera o Ferreiro de Mammon para SA e equipamentos selados.

### 3.3. Certificações de Subclasse (Lv 65, 70, 75, 80)
- **Onde alterar:** `lineage-idle/src/services/CharacterService.js`, `lineage-idle/src/engine/StatsEngine.js`
- Desbloqueio de passivas lendárias (*Counter Haste*, *Counter Barrier*).

---

## 🛡️ NÍVEL 4: Arquitetura React ↔ Shadow DOM & Segurança Cloud

### 4.1. Event Bus Tipado (`EngineEventBus.ts`)
- **Onde alterar:** `src/idle/IdleGame.tsx`, `lineage-idle/main.js`
- Barramento de eventos tipado sincronizando modais React, trocas de modo e notificações de vendas do Mercado.

### 4.2. Validação Anti-Cheat de Save Deltas (`SecurityEngine.js`)
- **Onde alterar:** `lineage-idle/src/engine/SecurityEngine.js`, `src/firebase.ts`
- Verificação do ganho máximo teórico de Adena/EXP por segundo com assinatura HMAC antes de persistir.

### 4.3. Blindagem Transacional no Mercado Global
- **Onde alterar:** `lineage-idle/src/services/MarketService.js`
- `runTransaction` atômico com escrow, evitando duplicação em compras simultâneas.

---

## 🎨 NÍVEL 5: Sistema de Cosméticos VFX — Sem Status, 100% Idle

### 5.1. Aura do Card do Herói (`#hero-card-aura`)
- **Onde alterar:** `src/idle/markup.ts`, `lineage-idle/style.css`, novo `lineage-idle/src/services/CosmeticService.js`

### 5.2. Ícones Exclusivos de Item/Título (Frame do Ícone)
- **Onde alterar:** `InventoryService.js`, novo `public/assets/frames/`

### 5.3. VFX de Equipar (Feedback de Ação, Não de Poder)
- **Onde alterar:** `CombatEngine.js` (hook `onEquip`/`onCast`), `GameUI.js`

### 5.4. Loja de Cosméticos — Catálogo Sem Progressão
- **Onde alterar:** `src/idle/markup.ts` (aba "Cosméticos"), `src/firebase.ts`
- **Checklist obrigatório:** nenhum cosmético pode ser lido por `StatsEngine.js`, `CombatEngine.js` ou `BalanceEngine.js`.

---

## 🧮 NÍVEL 6: Economia, Balanceamento e Anti-Inflação

### 6.1. Sorvedouros de Adena (Adena Sinks) Estruturais
- **Onde alterar:** `MarketService.js`, `BalanceEngine.js`

### 6.2. Curva de Progressão Anti-"Parede de Vidro"
- **Onde alterar:** `LevelEngine.js`, `BalanceEngine.js`

### 6.3. Simulador de Economia (Offline)
- **Onde alterar:** `tools/economy-sim.js`

---

## 🎯 NÍVEL 7: Onboarding, Retenção e Live-Ops

### 7.1. Tutorial Guiado Progressivo (Primeiros 10 Minutos)
### 7.2. Recompensa Diária & Missões de Retorno
### 7.3. Calendário de Eventos Live-Ops
### 7.4. Guildas / Clãs e Chat Social → absorvido pelo Nível 11

---

## 🏗️ NÍVEL 8: Infraestrutura, Performance e Escalabilidade

### 8.1. Regras de Segurança do Firebase (Security Rules)
### 8.2. Migração de Escritas Críticas para Cloud Functions
### 8.3. Otimização de Payload e Sharding de Dados
### 8.4. Testes Automatizados (Unitários + E2E)

---

## 💰 NÍVEL 9: Monetização Ética & Analytics

### 9.1. Modelo de Monetização Cosmético-First
### 9.2. Funil de Analytics (Aquisição → Retenção → Monetização)
### 9.3. Testes A/B de Balanceamento e UI

---

## ♿ NÍVEL 10: Acessibilidade, Localização e Polimento Final

### 10.1. Internacionalização (i18n)
### 10.2. Acessibilidade Básica
### 10.3. Modo Offline/Reconexão Resiliente
### 10.4. Checklist de Lançamento Comercial

---

## 🏰 NÍVEL 11: Reformulação Completa do Sistema de Clãs

### 11.1. Criação e Listagem Automática
### 11.2. Fluxo de Solicitação de Entrada e Notificação do Líder
### 11.3. Hierarquia, Permissões e Vida do Clã

---

## 🏆 NÍVEL 12: Rankings Multi-Categoria com Recompensas Escalonadas (Anti-Bot)

### 12.1. Categorias de Ranking
### 12.2. Verificação Anti-Bot para Elegibilidade
### 12.3. Estrutura de Recompensas Escalonadas
### 12.4. Painel Unificado de Rankings

---

## 🧮 NÍVEL 13: Sistema Matemático Central de Balanceamento (BalanceEngine)

### 13.1. Modelo de Poder Unificado (Power Budget)
### 13.2. Triângulo de Papéis (Rock-Paper-Scissors entre Arquétipos)
### 13.3. Script de Auditoria de Balanceamento (Offline)
### 13.4. Fórmula Única de Combat Power (CP)

---

## 🧪 NÍVEL 14: Simplificação de Consumíveis (Scroll / Soulshot / Spiritshot Universais)

### 14.1. Scroll de Encantamento Universal
### 14.2. Soulshot Universal (Dano Físico)
### 14.3. Blessed Spiritshot Universal (Dano Mágico)
### 14.4. Impacto na Economia

---

## 🐲 NÍVEL 15: IA de Combate para Monstros & Sistema de Dificuldade Progressiva

### 15.1. IA de Combate por Perfil de Monstro
### 15.2. Habilidades de Monstro Reaproveitando o SkillEngine
### 15.3. Sistema de Sagas e Mapas por Faixa de Nível
### 15.4. Sistema de 4 Níveis de Dificuldade (Pós-Saga II)
### 15.5. Recompensas Progressivas por Dificuldade

---

## 🔨 NÍVEL 16: Sistema de Síntese na Forja

### 16.1. Regra Base de Síntese
### 16.2. Níveis de Forja (Gating Progressivo)
### 16.3. Taxa de Sucesso e Risco
### 16.4. Interface da Forja

---

## 💎 NÍVEL 17: Reformulação de Soul Crystals & Atributos Elementais (Encrustação)

### 17.1. Tela Dedicada de Encrustação
### 17.2. Custo e Gating por Nível
### 17.3. Sinergia com Elementos de Monstro/Mapa
### 17.4. Migração de Contas Existentes

---

## ✅ Pendências em Aberto
1. **Nível 15.3** — nomes e bosses das Sagas na faixa 41–75.
2. **Nível 17.4** — decidir se a migração de elemento excedente reduz automaticamente ou só trava novos ganhos.
