# Visual Prototype 2D — Animated Character Combat
### Lineage Idle / Aden Arena — Vertical Slice Isolada

Este diretório contém o **protótipo visual local completamente isolado** concebido para testar a transição dos atuais heróis e monstros de representações estáticas (cards) para **personagens 2D animados em combate**, inspirado no formato visual de títulos idle contemporâneos (como *Taskbar Hero*).

> **Aviso de Isolamento:**
> Este protótipo não altera o runtime de produção, saves, mecânicas de cálculo de dano nem registries oficiais do Aden Arena. Ele existe de forma autocontida em `visual-prototype-2d/`.

---

## 1. Como Executar Localmente

### A. Executar os Testes Automatizados (Node.js Test Runner)
Na raiz da pasta `visual-prototype-2d/`, execute:
```bash
npm test
```
*(Executa os 12 testes unitários formais que cobrem resolução de assets, state machine, âncoras espaciais e ciclo de vida).*

### B. Executar a Interface Visual no Navegador
Como o projeto utiliza ES Modules nativos (`import`/`export`) e carrega imagens via `Canvas`, ele deve ser servido via um servidor HTTP local simples:

Com **Node.js**:
```bash
npx serve .
# Acesse http://localhost:3000 no navegador
```
Ou com **Python**:
```bash
python -m http.server 8080
# Acesse http://localhost:8080 no navegador
```
Ou utilizando a extensão **Live Server** do VS Code abrindo o arquivo `index.html`.

---

## 2. Visão Geral da Arquitetura

O protótipo foi construído em arquitetura orientada a dados (*data-driven*) sem heurísticas de string:

```
visual-prototype-2d/
├── index.html                           # Interface visual escura com Canvas 1280x720 e HUD reativo
├── package.json                         # Configuração de módulo ES e script npm test
├── test/
│   └── prototype.test.js                # Suite com 12 testes unitários automatizados
├── public/assets/
│   ├── hero/                            # Sprite sheets 128x128 (Idle, Attack_1, Attack_2, Fireball, Flame_jet, Hurt, Dead)
│   ├── monster/                         # Sprite sheets 128x128 (Idle, Attack, Hurt, Dead)
│   ├── bg/                              # Cenários de combate (Forge of the Gods, Dragon Valley)
│   └── static/                          # Imagens estáticas originais para teste de comparação A/B
└── src/
    ├── main.js                          # Loop de renderização (requestAnimationFrame), HUD e eventos
    ├── data/
    │   ├── CharacterVisualRegistry.js   # Contrato formal: classId -> visual profile -> animation set -> weapon
    │   ├── AnimationRegistry.js         # Definição de clips, frames (128x128), FPS e eventos de keyframe
    │   └── PrototypeSkillRegistry.js    # Definição de habilidades (Fireball, Magma Spike, Meteor)
    ├── renderer/
    │   ├── AssetResolver.js             # Validação estrita (retorna MISSING_ASSET em caso de erro, sem fallback silencioso)
    │   ├── CombatActor.js               # Modelo do ator, estados (IDLE, ATTACKING, CASTING, HIT, DEAD) e âncoras
    │   ├── CharacterAnimator.js         # Controlador de playback de sprites e respiração procedural
    │   └── CharacterRenderer.js         # Renderização de sombras dinâmicas, hit flash, auras e modo estático
    ├── scenes/
    │   └── CombatScene.js               # Orquestrador de câmera (zoom, shake), cenário, partículas e combate
    └── vfx/
        └── PrototypeSkillVfx.js         # Engine de partículas, projéteis, fissuras sísmicas e números flutuantes
```

---

## 3. Âncoras Espaciais Precisas (Spatial Anchors)

Diferente de sistemas rudimentares que calculam efeitos apenas a partir do centro da imagem (`x, y`), cada `CombatActor` disponibiliza 5 âncoras espaciais independentes:

| Âncora | Localização Anatômica | Aplicação |
|---|---|---|
| `feet` | Ponto inferior do contato com o solo | Erupções de solo (Magma Spike), sombras projetadas |
| `chest` | Centro de massa / esterno | Projéteis direcionados (Fireball), impactos de flecha, números de dano |
| `center` | Centro geométrico | Auras mágicas esféricas, esferas de proteção |
| `head` | Topo do crânio | Ícones de buff/debuff, balões de diálogo |
| `castPoint` | Ponta do cajado / mão projetada | Origem de projéteis e explosões de canalização |

---

## 4. Recursos e Interatividade da Demo

- **Ações de Combate**:
  - `Ataque Básico` (`Tecla 1`): Golpe físico rápido com impacto de faíscas.
  - `Fireball` (`Tecla 2`): Projétil direcional com cauda de fumaça disparado da ponta do cajado até o tórax do monstro.
  - `Magma Spike` (`Tecla 3`): Fissura vulcânica que irrompe diretamente sob os pés do monstro, gerando tremor sísmico na câmera.
  - `Meteor (Ultimate 4★)` (`Tecla 4`): Escurecimento cinematográfico da tela, zoom dinâmico na cena, queda de bólido estelar e shockwaves concêntricas de impacto.
- **Modo de Comparação A/B** (`Tecla C`): Alterna instantaneamente entre o **Card Estático** e o **Personagem 2D Animado**, permitindo avaliar a diferença de legibilidade, dinamismo e peso visual.
- **Debug de Âncoras**: Permite visualizar na tela os pontos vetoriais exatos de ancoragem com cores de destaque.
- **Auto-Combate** (`Tecla Espaço`): Ciclo scriptado contínuo demonstrando o fluxo autônomo de batalha idle.
- **Troca de Classes**: Permite alternar dinamicamente entre *Human Sorcerer*, *Archmage* e *Duelist*.
