# ⚔️ Aden Arena — Lineage Idle RPG

> **Lineage Idle RPG** completo rodando na web como Progressive Web App (PWA). Desenvolvido com **React 19**, **Vite**, **TypeScript**, **Tailwind CSS**, **Vanilla JS Game Engine** isolada no Shadow DOM e **Firebase Realtime Database** para sincronização em nuvem e mercado global multiplayer.

---

## 📑 Sumário

1. [Visão Geral do Projeto](#-visão-geral-do-projeto)
2. [Como Rodar Localmente](#-como-rodar-localmente)
3. [Arquitetura: React vs Engine](#-arquitetura-react-vs-engine)
4. [A Regra de Ouro da Interface (UI)](#-a-regra-de-ouro-da-interface-ui)
5. [Guia Rápido: Onde Mexer em Cada Parte](#-guia-rápido-onde-mexer-em-cada-parte)
6. [Estrutura Completa de Pastas](#-estrutura-completa-de-pastas)
7. [Mecânicas Centrais do Jogo](#-mecânicas-centrais-do-jogo)
8. [Comandos & Deploy](#-comandos--deploy)

---

## 🎮 Visão Geral do Projeto

O **Aden Arena** une a nostalgia e complexidade matemática do **Lineage II** com a dinâmica moderna dos RPGs ociosos (*Idle RPGs*):

- **194 Classes & Subclasses** com árvores completas e canônicas.
- **846 Habilidades Autênticas** com validação canônica de armas requeridas.
- **Dual Arsenal System**: 2 slots de armas equipadas simultaneamente com acúmulo de atributos e ressonâncias únicas.
- **Barra de Quebra de Postura (Stagger)**: Quebra de guarda de chefes com multiplicador de 2.0x de dano.
- **Mercado Global Realtime**: Compra e venda de itens entre jogadores via Firebase.
- **Save Automático à Prova de Falhas**: Persistência local (LocalStorage) + Nuvem (Firebase) com anti-duplicação e proteção transacional.
- **3 Modos de Visualização**:
  1. **Idle Game (Principal)**: Interface completa inspirada no client clássico de Lineage II.
  2. **2D Pixel RPG**: Auto-battler retro em canvas HTML5 com spritesheets.
  3. **3D Arena**: Sobrevivência e ação em Three.js.

---

## 🚀 Como Rodar Localmente

### Pré-requisitos
- **Node.js**: Versão 18 ou superior (recomendado 20+ LTS).
- **npm** ou **pnpm/yarn**.

```bash
# 1. Clone o repositório
git clone https://github.com/Triistan93/adenarena.git
cd adenarena

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse no navegador: `http://localhost:5173`

```bash
# Gerar build de produção
npm run build
```

---

## 🏛️ Arquitetura: React vs Engine

O projeto possui uma arquitetura híbrida de alto desempenho:

```
┌─────────────────────────────────────────────────────────────────┐
│                       REACT APPLICATION                         │
│   src/App.tsx · src/components/ · Autenticação · Modais         │
└───────────────────────────────┬─────────────────────────────────┘
                                │ Monta via Shadow DOM
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     VANILLA JS GAME ENGINE                      │
│   lineage-idle/main.js · src/engine/ · src/services/ · 60 FPS   │
└───────────────────────────────┬─────────────────────────────────┘
                                │ Realtime Sync
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FIREBASE CLOUD DATABASE                      │
│   Mercado Global P2P · Cloud Saves · Rankings Multiplayer       │
└─────────────────────────────────────────────────────────────────┘
```

---

## ⚠️ A Regra de Ouro da Interface (UI)

> [!IMPORTANT]
> **A INTERFACE DO JOGO É 100% DEFINIDA EM `src/idle/markup.ts`!**
> 
> Quando o jogo roda, o HTML da interface principal é carregado exclusivamente a partir de:
> 👉 `src/idle/markup.ts`
> 
> Qualquer novo botão, aba, modal ou slot de equipamento deve ser adicionado diretamente em **`src/idle/markup.ts`**. O antigo arquivo estático solto na pasta da engine foi movido para `legado/` para evitar alterações no lugar errado.

---

## 📍 Guia Rápido: Onde Mexer em Cada Parte

| O que você quer alterar? | Arquivo Principal | Arquivos Secundários |
|---|---|---|
| **Estrutura HTML do Jogo** | `src/idle/markup.ts` | `src/idle/IdleGame.tsx` |
| **Estilos Globais e Tema** | `lineage-idle/style.css` | `lineage-idle/src/ui/GameUI.css` |
| **Combate & Ciclo de Ataque** | `lineage-idle/src/engine/CombatEngine.js` | `lineage-idle/main.js` |
| **Stagger / Quebra de Postura** | `lineage-idle/src/engine/StaggerEngine.js` | `lineage-idle/src/ui/GameUI.js` |
| **Dual Arsenal (2 Slots de Armas)** | `lineage-idle/src/services/EquipmentService.js` | `lineage-idle/src/engine/StatsEngine.js` |
| **Ressonância de Armas** | `lineage-idle/src/services/WeaponResonanceService.js` | `lineage-idle/src/ui/GameUI.js` |
| **Habilidades & Validação de Armas** | `lineage-idle/src/engine/SkillEngine.js` | `lineage-idle/data/echo-adapter.js` |
| **Mudança de Classe (Lv 20, 40, 76)** | `lineage-idle/main.js` (`openClassTransferModal`) | `lineage-idle/src/services/CharacterService.js` |
| **Criação de Personagem** | `src/components/CharacterCreation.tsx` | `lineage-idle/src/data/races.js` |
| **Inventário & Equipamentos** | `lineage-idle/src/services/InventoryService.js` | `lineage-idle/src/services/EquipmentService.js` |
| **Cálculo de Atributos (Stats)** | `lineage-idle/src/engine/StatsEngine.js` | `lineage-idle/src/engine/BalanceEngine.js` |
| **Monstros & Spawns** | `lineage-idle/src/data/monsters.js` | `lineage-idle/src/data/raids.js` |
| **Zonas & Mapas** | `lineage-idle/src/data/zones.js` | `lineage-idle/art.js` |
| **Mercado Global & Firebase** | `src/firebase.ts` | `lineage-idle/src/services/MarketService.js` |
| **Sistema de Save** | `lineage-idle/main.js` (`saveGameState`) | `lineage-idle/src/engine/SecurityEngine.js` |
| **Imagens de Classes & Monstros** | `lineage-idle/art.js` | `public/img/` |
| **Modo 2D Pixel** | `src/pixel2d/Aden2DGame.tsx` | `public/assets/2d/` |

---

## 📁 Estrutura Completa de Pastas

### 1. Visão Geral dos Diretórios Principais

```text
adenarena/
├── public/          # Assets estáticos servidos pelo Vite (imagens, sprites, ícones)
├── src/             # Frontend React (modais, auth, markup e modos 2D/3D)
├── lineage-idle/    # Engine completa do jogo (combate, stats, lógica e dados)
├── legado/          # Arquivos históricos e mockups antigos (apenas consulta)
├── api/             # Webhooks serverless (Vercel)
└── dist/            # Build compilado final de produção
```

---

### 2. Detalhamento: `src/` (Camada React)

| Caminho | Descrição |
|---|---|
| `src/App.tsx` | Ponto de entrada React, roteamento de telas e seletor de modos (Idle, 2D, 3D). |
| `src/firebase.ts` | Conexão com Firebase Authentication e Realtime Database (Mercado e Saves). |
| `src/components/` | Telas React: `LoginScreen.tsx`, `AuthModal.tsx` e `CharacterCreation.tsx`. |
| `src/idle/markup.ts` | **Arquivo-chave de UI**: contém o HTML completo da interface injetada no Shadow DOM. |
| `src/idle/IdleGame.tsx` | Componente bridge que inicializa e gerencia a Engine dentro do Shadow DOM. |
| `src/pixel2d/Aden2DGame.tsx` | Auto-battler 2D retro renderizado em HTML5 Canvas compartilhando o estado do jogo. |
| `src/game/` | Modo 3D Arena em Three.js (`Game.ts`, `models.ts`). |

---

### 3. Detalhamento: `lineage-idle/` (Game Engine)

| Subpasta / Arquivo | Função no Jogo |
|---|---|
| `main.js` | Core principal da engine, loop de jogo, eventos de clique e save. |
| `art.js` | Sistema de renderização de avatares (`heroSVG`) e ilustrações de monstros (`monsterSVG`). |
| `style.css` | Folha de estilos visual oficial com tema clássico de Lineage II. |
| `src/engine/` | Motores matemáticos: `CombatEngine`, `StatsEngine`, `SkillEngine`, `StaggerEngine`, `LevelEngine`. |
| `src/services/` | Serviços: `EquipmentService` (Dual Arsenal), `WeaponResonanceService`, `InventoryService`, `MarketService`, `CraftService`, `DyeService`, `PetService`. |
| `src/data/` | Tabelas de monstros (`monsters.js`), raids épicos (`raids.js`), zonas (`zones.js`) e itens (`items/`). |
| `data/echo-adapter.js` | Gerador canônico de todas as **846 habilidades** e **194 árvores de classes**. |

---

### 4. Detalhamento: `public/` (Assets & Ilustrações)

| Pasta | Conteúdo |
|---|---|
| `public/img/` | **119 ilustrações de monstros** (`mon_*.jpg`) e **36 artes de classes** (M e F) em alta resolução. |
| `public/assets/2d/` | Spritesheets de personagens (Knight, Rogue, etc.) e cenários de batalha para o modo 2D. |
| `public/assets/skills/` | Ícones oficiais de habilidades e magias. |

---

### 5. Detalhamento: `legado/` (Apenas Consulta)

| Pasta / Arquivo | O que é |
|---|---|
| `legado/lineage-idle/index.html` | Antigo mockup HTML estático do cliente standalone (substituído por `src/idle/markup.ts`). |
| `legado/lineage-idle/public/` | Cópia antiga de assets da época anterior ao Vite. |
| `legado/scripts/` | Scripts de sincronização de ícones pré-modularização (`sync-icons.js`, `validate-icons.js`). |
| `legado/scratch/` | ~90 scripts de auditoria, testes e migração criados durante o desenvolvimento. |

---

## ⚔️ Mecânicas Centrais do Jogo

### 1. Dual Arsenal & Ressonância de Armas
- O jogador possui dois slots de armas ativos simultâneos: **Arma 1 (`weapon`)** e **Arma 2 (`weapon2`)**.
- Ambos acumulam atributos (P.Atk, M.Atk), cristais de Soul Crystal (SA), encantamentos (+1 a +16) e augmentations.
- Combinações de pares geram **Ressonâncias Ativas** (ex: *Arco + Adaga = Caçador das Sombras*, *Dual + Lança = Senhor da Tempestade*).
- O motor de habilidades (`SkillEngine.js`) valida os requisitos de arma contra qualquer um dos dois slots equipados.

### 2. Barra de Quebra de Postura (Stagger)
- Chefes, Elites e Raids possuem uma barra amarela de postura abaixo do HP.
- Golpes físicos, acertos críticos e magias de impacto reduzem a postura até zero, ativando o estado de **BREAK**:
  - O monstro fica paralisado e impedido de contra-atacar por 5 segundos.
  - Recebe **2.0x de dano crítico com vulnerabilidade total**.

### 3. Mudança de Classe & Consagração de Linhagem (Lv. 20, 40, 76)
- Ao atingir os níveis-chave, o modal de avanço de classe é aberto com as ilustrações completas de cada caminho.
- O jogador pode consagrar até **2 habilidades da classe anterior** para se tornarem passivas permanentes, recebendo 100% de reembolso do SP investido para iniciar a nova jornada.

### 4. Mercado Global Realtime
- Venda e compra de itens entre jogadores em Adena ou Moedas de Ouro.
- Trava de compra com confirmação transacional atômica no Firebase, impedindo duplicação de itens.
- Vendas concluídas offline são automaticamente creditadas ao logar.

---

## 🛠️ Comandos & Deploy

```bash
# Iniciar servidor local
npm run dev

# Validar TypeScript e gerar build
npm run build

# Testar build localmente
npm run preview
```

### Deploy Automático (CI/CD)
O repositório está integrado com a **Vercel**. Todo commit enviado para a branch `main` gera um deploy automático em produção:

```bash
git add .
git commit -m "feat: sua alteracao aqui"
git push origin main
```

---

⚔️ *Que a bênção de Einhasad e a fúria de Gran Kain guiem seu código em Aden!*
