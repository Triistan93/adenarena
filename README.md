# ⚔️ Aden Arena / Lineage Idle RPG

> **Lineage Idle RPG** completo rodando na web como Progressive Web App (PWA). Desenvolvido com **React 19**, **Vite**, **TypeScript**, **Tailwind CSS**, **Vanilla JS Game Engine** isolada no Shadow DOM e **Firebase Realtime Database** para sincronização em nuvem e mercado global multiplayer.

---

## 📑 Sumário

- [1. Visão Geral do Projeto](#1-visão-geral-do-projeto)
- [2. Como Rodar Localmente](#2-como-rodar-localmente)
- [3. Arquitetura do Projeto](#3-arquitetura-do-projeto)
  - [Visão Macro: React vs Engine Vanilla](#visão-macro-react-vs-engine-vanilla)
  - [⚠️ Regra de Ouro da Interface (Onde Editar o HTML)](#️-regra-de-ouro-da-interface-onde-editar-o-html)
- [4. Guia Rápido: Onde Mexer em Cada Parte](#4-guia-rápido-onde-mexer-em-cada-parte)
  - [Interface, Layouts e Estilos (UI/UX)](#interface-layouts-e-estilos-uiux)
  - [Mecânicas de Combate, Postura e Dano](#mecânicas-de-combate-postura-e-dano)
  - [Dual Arsenal & Ressonância de Armas](#dual-arsenal--ressonância-de-armas)
  - [Classes, Habilidades e Mudança de Classe (20, 40, 76)](#classes-habilidades-e-mudança-de-classe-20-40-76)
  - [Inventário, Itens, Equipamentos e Paperdoll](#inventário-itens-equipamentos-e-paperdoll)
  - [Monstros, Chefes Épicos, Zonas e Drops](#monstros-chefes-épicos-zonas-e-drops)
  - [Mercado Global & Firebase Sync](#mercado-global--firebase-sync)
  - [Sistema de Save & Persistência](#sistema-de-save--persistência)
  - [Sistema de Artes e Ilustrações](#sistema-de-artes-e-ilustrações)
  - [Modo 2D Pixel Canvas](#modo-2d-pixel-canvas)
- [5. Estrutura Completa de Pastas](#5-estrutura-completa-de-pastas)
- [6. Comandos Úteis & Fluxo de Deploy](#6-comandos-úteis--fluxo-de-deploy)

---

## 1. Visão Geral do Projeto

O **Aden Arena** une a nostalgia e complexidade matemática do **Lineage II** com a dinâmica moderna dos RPGs ociosos (*Idle RPGs*):
- **194 Classes & Subclasses** com árvores completas e canônicas.
- **846 Habilidades Autênticas** com validação estrita de armas requeridas.
- **Dual Arsenal System**: 2 slots de armas equipadas simultaneamente com acúmulo de atributos e ressonâncias únicas.
- **Barra de Quebra de Postura (Stagger)**: Quebra de guarda de chefes com multiplicador de 2.0x de dano.
- **Mercado Global Realtime**: Compra e venda de itens entre jogadores via Firebase.
- **Save Automático à Prova de Falhas**: Persistência local (LocalStorage) + Nuvem (Firebase) com anti-duplicação e proteção transacional.
- **3 Modos de Visualização**:
  1. **Idle Game (Principal)**: Interface completa inspirada no client clássico de Lineage II.
  2. **2D Pixel RPG**: Auto-battler retro em canvas HTML5 com spritesheets.
  3. **3D Arena**: Sobrevivência e ação em Three.js.

---

## 2. Como Rodar Localmente

### Pré-requisitos
- **Node.js**: Versão 18 ou superior (recomendado Node 20+ LTS).
- **npm** ou **yarn/pnpm**.

### Passo a Passo

1. **Clone o repositório:**
   \`\`\`bash
   git clone https://github.com/Triistan93/adenarena.git
   cd adenarena
   \`\`\`

2. **Instale as dependências:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Inicie o servidor de desenvolvimento:**
   \`\`\`bash
   npm run dev
   \`\`\`
   O Vite iniciará o servidor local em `http://localhost:5173`.

4. **Gerar Build de Produção:**
   \`\`\`bash
   npm run build
   \`\`\`
   Gera a pasta `dist/` otimizada para produção.

---

## 3. Arquitetura do Projeto

### Visão Macro: React vs Engine Vanilla

O projeto possui uma arquitetura híbrida de alto desempenho:
1. **Shell React (Vite + TypeScript + Tailwind)**:
   - Controla autenticação, criação de personagem, modais modernos e alternância de modos de jogo (`src/App.tsx`, `src/components/`).
   - Monta o jogo principal dentro de um contêiner no arquivo `src/idle/IdleGame.tsx`.
2. **Motor do Jogo (Vanilla JS no Shadow DOM)**:
   - Todo o loop do jogo, cálculos de combate, menus clássicos de Lineage, inventário e sistemas vivem na pasta `lineage-idle/` e são injetados de forma isolada dentro do Shadow DOM pelo `IdleGame.tsx`.
   - Isso garante desempenho bruto de 60 FPS sem gargalos de re-render do React.

---

### ⚠️ Regra de Ouro da Interface (Onde Editar o HTML)

> [!IMPORTANT]
> **NÃO EDITE A INTERFACE EM `lineage-idle/index.html`!**
> Quando o jogo roda via React (`npm run dev`), o HTML da interface principal é carregado exclusivamente a partir de:
> 👉 `src/idle/markup.ts`
> 
> Se você adicionar um botão, aba ou slot de equipamento, adicione em `src/idle/markup.ts`. O arquivo `lineage-idle/index.html` é apenas um mockup estático legado.

---

## 4. Guia Rápido: Onde Mexer em Cada Parte

| O que você quer alterar? | Arquivo Principal | Arquivos Secundários |
|---|---|---|
| **Estrutura HTML do Jogo** | `src/idle/markup.ts` | `src/idle/IdleGame.tsx` |
| **Estilos Globais e Tema Clássico** | `lineage-idle/style.css` | `lineage-idle/src/ui/GameUI.css` |
| **Combate & Ciclo de Ataque** | `lineage-idle/src/engine/CombatEngine.js` | `lineage-idle/main.js` (`attackMonster`) |
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

### Detalhes das Principais Mecânicas

#### ⚔️ Dual Arsenal & Ressonâncias
- Os slots de armas ativos são `weapon` (Slot 1) e `weapon2` (Slot 2).
- Ambos somam **P.Atk**, **M.Atk**, cristais de Soul Crystal (SA), encantamentos e aumentos em `StatsEngine.js`.
- O serviço `WeaponResonanceService.js` detecta combinações ativas (ex: Arco + Adaga ativa *Caçador das Sombras*, Dual + Lança ativa *Senhor da Tempestade*, etc.) concedendo bônus passivos e efeitos de sangramento/vácuo durante o combate.

#### 🛡️ Barra de Quebra de Postura (Stagger Bar)
- Todo monstro Boss, Elite ou Raid possui uma barra amarela de postura abaixo da barra de HP (`StaggerEngine.js`).
- Ao sofrer ataques físicos, críticos e magias de impacto, a postura cai até 0, entrando em estado de **BREAK**:
  - O chefe fica paralisado e não contra-ataca por 5 segundos.
  - Recebe **2.0x de dano crítico e vulnerabilidade total**.

#### 📜 Mudança de Classe (Lv. 20, 40, 76)
- Ao atingir os marcos de nível, o modal `class-transfer-modal` é invocado via `openClassTransferModal` em `lineage-idle/main.js`.
- Exibe os **Avatares Ilustrados** de cada classe candidata, bônus de atributos e arquétipos.
- A **Consagração de Linhagem** permite selecionar até 2 habilidades da classe anterior para se tornarem passivas permanentes, reembolsando 100% do SP investido.

#### 🏪 Mercado Global (Firebase)
- Configurado em `src/firebase.ts`.
- Permite anunciar itens à venda em Adena ou Moedas de Ouro.
- Compras e retiradas possuem travas de segurança atômicas para prevenir duplicação de itens.
- As vendas ocorridas offline são sincronizadas automaticamente com o jogador ao abrir o jogo ou recolher as recompensas.

---

## 5. Estrutura Completa de Pastas

\`\`\`
adenarena/
├── dist/                          # Build final de produção
├── public/                        # Arquivos estáticos servidos pelo Vite
│   ├── assets/                    # Sprites 2D, ícones e efeitos
│   │   ├── 2d/heroes/             # Spritesheets de heróis (Knight, Rogue, Mage, etc.)
│   │   └── 2d/backgrounds/        # Cenários de batalha em pixel art
│   ├── img/                       # 119 ilustrações de monstros e 36 de classes (M/F)
│   ├── favicon.png
│   └── manifest.webmanifest       # Configuração PWA
│
├── src/                           # Camada React & Integrações
│   ├── App.tsx                    # Roteador de telas e controle de modos (Idle, 2D, 3D)
│   ├── firebase.ts                # Conexão Firebase (Auth, Database, Mercado Realtime)
│   ├── components/                # Componentes React
│   │   ├── AuthModal.tsx          # Modal de Login / Registro
│   │   ├── CharacterCreation.tsx  # Tela de criação e troca de classe/raça
│   │   └── LoginScreen.tsx        # Tela inicial de entrada
│   ├── idle/                      # Conexão do Modo Idle
│   │   ├── IdleGame.tsx           # Monta a Engine Vanilla dentro do Shadow DOM
│   │   ├── markup.ts              # 🚨 HTML COMPLETO DA UI DO JOGO IDLE
│   │   └── heroImages.ts          # Registro e mapa de avatares
│   ├── pixel2d/
│   │   └── Aden2DGame.tsx         # Auto-battler 2D em HTML5 Canvas
│   └── game/                      # Modo 3D Arena em Three.js
│
├── lineage-idle/                  # 🎮 ENGINE CLÁSSICA DO JOGO
│   ├── main.js                    # Core principal, loop do jogo, saves e bindings
│   ├── art.js                     # Resolução visual de avatares e monstros (heroSVG / monsterSVG)
│   ├── style.css                  # Folha de estilos principal do jogo idle
│   ├── relic-ui-system.css        # Estilos das relíquias e paperdoll
│   ├── theme-grimoire.css         # Efeitos visuais sombrios de UI
│   ├── vfx.js                     # Partículas, números flutuantes e animações
│   │
│   ├── data/                      # Dados legados e adaptadores
│   │   ├── echo-adapter.js        # Gerador das 846 habilidades e 194 classes canônicas
│   │   └── affixes.js             # Sufixos e afixos de itens raros
│   │
│   └── src/                       # Módulos modernos da Engine
│       ├── core/                  # Gerenciador de estado reativo (StateManager.js)
│       ├── engine/                # Motores de cálculo
│       │   ├── CombatEngine.js    # Fórmulas de ataque e dano
│       │   ├── StaggerEngine.js   # Sistema de quebra de postura e BREAK
│       │   ├── StatsEngine.js     # Fórmulas de atributos, bônus de sets e itens
│       │   ├── SkillEngine.js     # Validação e execução de habilidades
│       │   ├── LevelEngine.js     # Curva de XP e subida de nível
│       │   ├── BalanceEngine.js   # Penalidades de grau e monstros campeões
│       │   └── SecurityEngine.js  # Sanitização e validação de saves
│       ├── services/              # Serviços de negócio
│       │   ├── EquipmentService.js        # Equipar/desequipar nos slots (Slot 1 e 2)
│       │   ├── WeaponResonanceService.js  # Lógica de ressonâncias de armas
│       │   ├── InventoryService.js        # Manipulação de itens e capacidade
│       │   ├── CharacterService.js        # Promoção de classe e renascimento
│       │   ├── MarketService.js           # Lógica do mercado global
│       │   ├── CraftService.js            # Sistema de forja e receitas
│       │   ├── DyeService.js              # Tatuagens e símbolos de Henna
│       │   ├── PetService.js              # Invocação e bônus de mascotes
│       │   └── QuestService.js            # Missões e conquistas
│       ├── data/                  # Tabelas de dados
│       │   ├── monsters.js        # Monstros normais e atributos
│       │   ├── raids.js           # Chefes de Raid épicos (Antharas, Baium, etc.)
│       │   ├── items/             # Catálogo de armas, armaduras e consumíveis
│       │   ├── classes/           # Definições de classes
│       │   └── zones.js           # Zonas de caça e níveis recomendados
│       └── ui/                    # Renderizadores de UI específicos
│           ├── GameUI.js          # Helpers de DOM e tooltips
│           └── GameUI.css         # Estilos específicos de componentes
│
├── package.json                   # Dependências e scripts
├── vite.config.ts                 # Configuração do Vite
└── tsconfig.json                  # Configuração TypeScript
\`\`\`

---

## 6. Comandos Úteis & Fluxo de Deploy

### Scripts npm
| Comando | O que faz |
|---|---|
| `npm run dev` | Inicia o servidor local Vite com Hot Module Replacement. |
| `npm run build` | Valida tipagens TypeScript e gera o bundle minificado em `dist/`. |
| `npm run preview` | Testa localmente o build de produção gerado em `dist/`. |

### Fluxo de Deploy (CI/CD Automático)
O projeto está configurado com integração contínua na **Vercel**:
- Todo push para a branch `main` dispara automaticamente um novo build e deploy em produção:
  \`\`\`bash
  git add .
  git commit -m "feat(sistema): sua mensagem clara aqui"
  git push origin main
  \`\`\`
- O link público atualiza automaticamente em poucos segundos.
- Após o deploy, usuários podem atualizar a aba com `Ctrl + F5` para carregar a versão mais recente do Service Worker PWA.

---

### 💡 Dicas para Novos Desenvolvedores

1. **Sempre teste o build antes de commitar:**
   Execute `npm run build` para garantir que nenhuma importação quebrada ou erro de tipagem passe batido.
2. **Acesso ao Estado Global no Console:**
   No navegador com o jogo aberto, você pode inspecionar e testar comandos no console via `window.getGameState()`, `window.state` ou `window.EchoData`.
3. **Imagens e Assets:**
   Ao adicionar novas imagens de monstros ou classes, coloque-as em `public/img/` e mapeie em `lineage-idle/art.js`. O Vite serve os arquivos de `public/` diretamente na raiz `/img/...`.

---

⚔️ *Que a bênção de Einhasad e a fúria de Gran Kain guiem seu código em Aden!*
