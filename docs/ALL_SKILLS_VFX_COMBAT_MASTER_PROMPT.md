# ADEN ARENA IDLE — 2D COMBAT PRESENTATION & 150 SKILLS MASTER ARCHITECTURE

> **Documento Mestre de Referência Técnica, VFX Engine & Catálogo Completo de 150 Habilidades**
> **Versão:** 3.2.0 | **Jogo:** Aden Arena Idle (`lineage-idle`) | **Status:** 100% Homologado & Auditado

---

## ÍNDICE GERAL DE SEÇÕES

- [SEÇÃO 1: VISÃO GERAL DA ARQUITETURA](#seção-1-visão-geral-da-arquitetura)
- [SEÇÃO 2: REQUISITOS TÉCNICOS & PILHA TECNOLÓGICA](#seção-2-requisitos-técnicos--pilha-tecnológica)
- [SEÇÃO 3: TAXONOMIA DE COMBATE E SLOTS](#seção-3-taxonomia-de-combate-e-slots)
- [SEÇÃO 4: SISTEMA DE COOLDOWN E GASTO DE MANA](#seção-4-sistema-de-cooldown-e-gasto-de-mana)
- [SEÇÃO 5: HITBOXES, ALVOS E ÁREAS DE EFEITO (AOE)](#seção-5-hitboxes-alvos-e-áreas-de-efeito-aoe)
- [SEÇÃO 6: CRITICAL HITS, BREAK E REAÇÕES](#seção-6-critical-hits-break-e-reações)
- [SEÇÃO 7: TIMELINE E COREOGRAFIA DE HABILIDADES](#seção-7-timeline-e-coreografia-de-habilidades)
- [SEÇÃO 8: EFEITOS DE HIT-STOP E IMPACT FRAMES](#seção-8-efeitos-de-hit-stop-e-impact-frames)
- [SEÇÃO 9: SCREEN SHAKE E TRAUMA DE CÂMERA](#seção-9-screen-shake-e-trauma-de-câmera)
- [SEÇÃO 10: ZOOM PUNCH, FOV E FEEDBACK CINEMATOGRÁFICO](#seção-10-zoom-punch-fov-e-feedback-cinematográfico)
- [SEÇÃO 11: ILUMINAÇÃO DINÂMICA E FAKE LIGHTS](#seção-11-iluminação-dinâmica-e-fake-lights)
- [SEÇÃO 12: SISTEMA DE SHADERS (GLSL / PIXI FILTERS)](#seção-12-sistema-de-shaders-glsl--pixi-filters)
- [SEÇÃO 13: BIBLIOTECA DE COMPONENTES DE VFX](#seção-13-biblioteca-de-componentes-de-vfx)
- [SEÇÃO 14: ARQUITETURA DE ATLAS E RENDERING 2D](#seção-14-arquitetura-de-atlas-e-rendering-2d)
- [SEÇÃO 15: OBJECT POOLING E GESTÃO DE MEMÓRIA](#seção-15-object-pooling-e-gestão-de-memória)
- [SEÇÃO 16: FLOATING COMBAT TEXT (HUD DE DANO)](#seção-16-floating-combat-text-hud-de-dano)
- [SEÇÃO 17: BARRAS DE VIDA, MANA E POSTURA (STAGGER)](#seção-17-barras-de-vida-mana-e-postura-stagger)
- [SEÇÃO 18: ANÚNCIOS DE ULTIMATE E BANNERS VISUAIS](#seção-18-anúncios-de-ultimate-e-banners-visuais)
- [SEÇÃO 19: INTEGRAÇÃO COM COMBATENGINE (DECOUPLED PIPELINE)](#seção-19-integração-com-combatengine-decoupled-pipeline)
- [SEÇÃO 20: MAPEAMENTO DAS HABILIDADES COMPARTILHADAS (LV 1–39)](#seção-20-mapeamento-das-habilidades-compartilhadas-lv-139)
- [SEÇÕES 21 A 33: O CATÁLOGO COMPLETO DAS 25 CLASSES (150 HABILIDADES)](#seções-21-a-33-o-catálogo-completo-das-25-classes-150-habilidades)
- [SEÇÃO 34: GUIA DE IMPLEMENTAÇÃO, EXTENSÃO E TESTES AUTOMATIZADOS](#seção-34-guia-de-implementação-extensão-e-testes-automatizados)

---

## SEÇÃO 1: VISÃO GERAL DA ARQUITETURA

O sistema de combate e apresentação visual do **Aden Arena Idle** transcende o modelo tradicional de jogos 2D com simples sprites estáticos. Ele adota uma arquitetura inspirada em **Action RPGs e jogos de luta modernos**, estruturada em camadas independentes e orquestradas por eventos:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CombatEngine (Simulação)                        │
│             (Stats, Cooldowns, Dano, Stagger, Boss Phases)             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Emite CombatEvent (Decoupled)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        CombatEventEmitter Bus                          │
│     (SkillCast, SkillHit, SkillCrit, SkillDamage, SkillStagger, etc.)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                            VFXOrchestrator                             │
│     Coordena Linhas do Tempo, Shaders, Câmera, Luz e Partículas        │
├─────────────────┬──────────────────┬─────────────────┬─────────────────┤
│ TimelineSystem  │    CameraFX      │   LightingFX    │  ShaderSystem   │
│ - Anticipation  │ - Trauma Decay   │ - Ambient Dim   │ - Shockwaves    │
│ - Impact        │ - Real HitStop   │ - Fake Lights   │ - Bloom Burst   │
│ - Recovery      │ - Zoom Punch     │ - Impact Flash  │ - Chromatic Abb │
└────────┬────────┴────────┬─────────┴────────┬────────┴────────┬────────┘
         │                 │                  │                 │
         └─────────────────┼──────────────────┴─────────────────┘
                           ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         VFXComponentLibrary                            │
│  (SlashArcs, Projectiles, ImpactBursts, Pillars, Runes, Ultimates)     │
├────────────────────────────────────────────────────────────────────────┤
│                       ObjectPool (Zero Allocs)                         │
│       Particles (1000) | Projectiles (150) | Shockwaves (50)           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       Rendering 2D / Canvas / PixiJS                   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## SEÇÃO 2: REQUISITOS TÉCNICOS & PILHA TECNOLÓGICA

- **Runtime:** Node.js v20+ / Navegadores Evergreen (Chrome, Firefox, Safari, Edge).
- **Camada de Renderização:** WebGL acelerado via PixiJS v8 com fallback automático e gracioso para HTML5 Canvas 2D.
- **Taxa de Quadros Alvo:** 60 FPS estáveis (`16.67 ms/frame`).
- **Orçamento de Partículas por Frame:**
  - Habilidades Normais: $\le 80$ partículas.
  - Habilidades Pesadas / Especialistas: $\le 120$ partículas.
  - Habilidades Ultimate (Lv80): $\le 180$ partículas.
  - Habilidades Master Ultimate (Lv90): $\le 250$ partículas.
- **Chamadas de Desenho (Draw Calls):** $\le 6$ em habilidades normais, $\le 12$ no clímax de Master Ultimates.

---

## SEÇÃO 3: TAXONOMIA DE COMBATE E SLOTS

O Aden Arena Idle padroniza todas as 25 classes ativas em uma grade progressiva de 6 slots rigorosamente balanceados:

| Slot | Categoria | Nível Mínimo | Raridade | Função Tática Principal |
|:---:|:---|:---:|:---:|:---|
| **1** | Core 1 | Lv 40 | 1★ | Abertura de combate, controle de grupo ou projétil primário |
| **2** | Core 2 | Lv 40 | 1★ | Dano em área (AoE), rajada elemental ou quebra de guarda |
| **3** | Specialization | Lv 40 | 2★ | Buff de postura, defesa de emergência, utilidade ou mobilidade |
| **4** | Elemental Specialization | Lv 40/76 | 3★ | Finalizador elemental de alto multiplicador de Stagger |
| **5** | Ultimate | Lv 80 | 4★ | Impacto colossal cinematográfico, requer Tomo Sagrado 4★ |
| **6** | Master Ultimate | Lv 90 | 5★ | Transcendência primordial que abala todo o cenário de combate |

---

## SEÇÃO 4: SISTEMA DE COOLDOWN E GASTO DE MANA

- **Fórmula de Tempo de Recarga:**
  $$\text{CD}_{\text{final}} = \text{CD}_{\text{base}} \times (1 - \text{CDR}_{\text{stats}})$$
- **Fórmula de Gasto de Mana:**
  $$\text{MP}_{\text{consumo}} = \text{MP}_{\text{base}} \times (1 + (\text{Nível da Skill} - 1) \times 0.08)$$
- O motor previne conjurações concorrentes em ultimates de tela cheia (`allowConcurrent: false`), impedindo sobreposição caótica de efeitos e saturação da GPU.

---

## SEÇÃO 5: HITBOXES, ALVOS E ÁREAS DE EFEITO (AOE)

O motor suporta 6 geometrias de colisão e seleção de alvos com representação 2D exata:
1. `point`: Alvo único de alta precisão (ex: adagas, flechas perfurantes).
2. `circle`: Explosões radiais e auras centradas no alvo ou conjurador.
3. `box`: Investidas frontais e golpes de escudo.
4. `line`: Raios perfurantes e feixes celestiais.
5. `cone`: Arcos de espada e golpes ceifadores transversais.
6. `screen`: Impacto global presente em Master Ultimates (Lv90).

---

## SEÇÃO 6: CRITICAL HITS, BREAK E REAÇÕES

O feedback de impacto varia dinamicamente conforme a importância do golpe:

| Nível de Impacto | Hit-Stop | Shake (Trauma) | Shader Refrativo | Flash de Tela |
|:---|:---:|:---:|:---|:---|
| **Golpe Normal** | 40–60 ms | 0.12–0.25 | Anel refrativo sutil | Nenhum |
| **Crítico Pesado** | 80–100 ms | 0.45–0.55 | Aberração cromática (6px) | Flash âmbar (0.3 opacidade) |
| **Stagger Break** | 100–120 ms | 0.60–0.70 | Onda de choque dupla radial | Estilhaço azul gelo |
| **Master Ultimate** | 160–180 ms | 1.00 (máximo) | Aberração cromática + Bloom 2.0 | Flash branco puro (0.6 opacidade) |

---

## SEÇÃO 7: TIMELINE E COREOGRAFIA DE HABILIDADES

Cada habilidade possui um arquivo de linha do tempo determinístico dividido em 3 fases:
- **Anticipation (0 a 30%):** Windup, ativação da runa de solo, brilho de conjuração (`castGlow`), início do zoom punch.
- **Impact / Release (30% a 70%):** Disparo de partículas, onda de choque, hit-stop em tempo real, aplicação de dano e abalo de postura.
- **Recovery / Settle (70% a 100%):** Dissipação suave das partículas via amortecimento cúbico, restauração da iluminação ambiente e retorno da câmera ao repouso.

---

## SEÇÃO 8: EFEITOS DE HIT-STOP E IMPACT FRAMES

O hit-stop desacelera a velocidade de simulação (`timeScale`) para valores entre `0.01` e `0.05`. Para prevenir que loops e cronômetros fiquem eternamente parados, o `CameraFX` utiliza temporizadores em tempo real via `performance.now()`, garantindo retomada precisa mesmo com escala de tempo zerada.

---

## SEÇÃO 9: SCREEN SHAKE E TRAUMA DE CÂMERA

Baseado no modelo de trauma não-linear quadrático:
$$\text{Shake} = \text{Trauma}^2$$
$$\text{Offset}_X = \text{Max}_X \times \text{Shake} \times \sin(t \times 1.73)$$
$$\text{Offset}_Y = \text{Max}_Y \times \text{Shake} \times \sin(t \times 2.37)$$
O decaimento linear $(\text{Trauma} - \text{decay} \times dt)$ assegura que a trepidação retorne suavemente a zero sem estalos ou movimentos estáticos desconfortáveis. Controles de acessibilidade permitem desativar ou calibrar a intensidade do efeito.

---

## SEÇÃO 10: ZOOM PUNCH, FOV E FEEDBACK CINEMATOGRÁFICO

Golpes críticos e ultimates acionam uma aproximação rápida de câmera (`punchZoom`) entre `1.04x` e `1.12x`. O retorno ao enquadramento padrão utiliza uma curva de suavização `ease-out cubic`:
$$f(t) = 1 - (1 - t)^3$$

---

## SEÇÃO 11: ILUMINAÇÃO DINÂMICA E FAKE LIGHTS

- **Ambient Dimming:** Durante Ultimates e Master Ultimates, o fundo da arena escurece em até 85% (`rgba(0, 0, 0, 0.85)`), criando contraste máximo para as partículas brilhantes.
- **Luzes Radiais Falsas:** Partículas e pontos de impacto emitem gradientes radiais desenhados em blend mode aditivo (`lighter` / `add`), simulando iluminação pontual de alto custo computacional com custo de renderização quase nulo.

---

## SEÇÃO 12: SISTEMA DE SHADERS (GLSL / PIXI FILTERS)

- **ShockwaveFilter:** Deslocamento radial com função senoidal que expande a partir do epicentro.
- **BloomFilter:** Passagem de brilho com extração de altas luzes e desfoque gaussiano acumulativo.
- **ChromaticAberrationFilter:** Separação dos canais Vermelho e Azul em direções opostas durante quebras de postura.
- **HeatHazeFilter:** Distorção ondulatória em tempo real para chamas e magma.
- **Canvas 2D Fallback:** Todas as técnicas possuem implementações geométricas em Canvas 2D com anéis de espessura decrescente e composições de tela.

---

## SEÇÃO 13: BIBLIOTECA DE COMPONENTES DE VFX

A biblioteca unificada (`VFXComponentLibrary.js`) fornece métodos padronizados:
- `spawnSlashArc(x, y, options)`: Arcos curvos de espada, foices e adagas.
- `spawnImpactBurst(x, y, options)`: Fagulhas pontuais e detritos direcionais.
- `spawnProjectile(startX, startY, targetX, targetY, options)`: Flechas e mísseis arcanos.
- `spawnGroundPillar(x, y, options)`: Pilares de fogo, luz e estacas de gelo.
- `spawnGroundRune(x, y, options)`: Círculos de transmutação e runas élficas.
- `spawnCriticalHitFeedback(x, y, options)`: Estrelas de impacto e anéis refrativos.
- `spawnStaggerBreakEffect(x, y)`: Quebra de postura em estilhaços cristalinos.
- `spawnTitanbreakerVFX(x, y)`: Fissura sísmica de destruição colossal.
- `spawnMeteorVFX(startX, startY, targetX, targetY)`: Cataclismo de meteoro em chamas.

---

## SEÇÃO 14: ARQUITETURA DE ATLAS E RENDERING 2D

Para máxima performance, todas as partículas e ícones são organizados em atlas de textura compartilhados. A renderização utiliza agrupamento por blend mode (`source-over` para sólidos, `lighter` para energia mágica), eliminando quebras de lote de renderização (`batch breaks`).

---

## SEÇÃO 15: OBJECT POOLING E GESTÃO DE MEMÓRIA

A alocação de objetos em tempo de execução foi totalmente erradicada:
- **Pool de Partículas:** 1.000 instâncias pré-aquecidas (`VFXPoolManager.particles`).
- **Pool de Projéteis:** 150 instâncias (`VFXPoolManager.projectiles`).
- **Pool de Textos Flutuantes:** 100 instâncias (`VFXPoolManager.floatingText`).
- **Pool de Ondas de Choque:** 50 instâncias (`VFXPoolManager.shockwaves`).
- **Pool de Fontes de Luz:** 50 instâncias (`VFXPoolManager.lights`).
Quando um efeito atinge o fim de sua vida útil, seus parâmetros são limpos e o objeto retorna à lista de disponíveis sem interferência do Coletor de Lixo (`Garbage Collector`).

---

## SEÇÃO 16: FLOATING COMBAT TEXT (HUD DE DANO)

Textos de dano possuem estilização visual atrelada ao elemento e tipo de acerto:
- Físico: Branco / Dourado.
- Fogo: Laranja / Vermelho intenso.
- Água / Gelo: Azul celeste.
- Vento: Verde esmeralda.
- Trevas: Violeta profundo.
- Sagrado: Dourado solar com borda branca.
- Críticos exibem fonte alargada com animação `bounce_shake`.

---

## SEÇÃO 17: BARRAS DE VIDA, MANA E POSTURA (STAGGER)

A barra de postura (Stagger Bar) opera em sincronia com o `StaggerEngine`. Ao atingir 100% de dano de postura, entra em estado `BREAK` durante o qual todo o dano recebido pelo monstro é amplificado em 2.0x, acompanhado pelo VFX `spawnStaggerBreakEffect`.

---

## SEÇÃO 18: ANÚNCIOS DE ULTIMATE E BANNERS VISUAIS

Ultimates e Master Ultimates projetam banners cinemáticos na interface com tipografia gótica estilizada (`Cinzel`), acompanhados por pulsos de luz periférica na tela.

---

## SEÇÃO 19: INTEGRAÇÃO COM COMBATENGINE (DECOUPLED PIPELINE)

O motor de combate emite eventos através de `dispatchCombatEvent` sem conhecer PixiJS ou nós do DOM:
```javascript
dispatchCombatEvent(CombatEventType.SKILL_CAST, {
  skillId: 'titanbreaker',
  caster: state.hero,
  target: state.activeMonster,
  position: getHeroPoint()
});
```
O `VFXOrchestrator` captura esses eventos e despacha as timelines visuais de forma completamente desacoplada.

---

## SEÇÃO 20: MAPEAMENTO DAS HABILIDADES COMPARTILHADAS (LV 1–39)

Antes do bloqueio de especialização no Nível 40, personagens utilizam o acervo de 8 habilidades generalistas:
1. **`wind_strike`** (Wind, Magia, Projétil) — Dano contínuo para noviços arcanos.
2. **`flame_strike`** (Fire, Magia, AoE) — Pequena erupção flamejante em área.
3. **`hydro_strike`** (Water, Magia, Single) — Jato pressurizado de água.
4. **`power_strike`** (Physical, Combate Melee) — Golpe de espada vigoroso.
5. **`mortal_blow`** (Physical, Adaga / Crítico) — Perfuração precisa em pontos vitais.
6. **`iron_punch`** (Physical, Contundente) — Soco pesado com alto abalo de postura.
7. **`heal_light`** (Holy, Cura Pessoal) — Regeneração celestial de HP.
8. **`energy_burst`** (Neutral, Explosão Arcana) — Onda de choque radial em área.

---

## SEÇÕES 21 A 33: O CATÁLOGO COMPLETO DAS 25 CLASSES (150 HABILIDADES)

Abaixo está catalogada cada uma das 25 classes ativas, com suas 6 habilidades oficiais (4 Especialistas + 1 Ultimate Lv80 + 1 Master Ultimate Lv90):


### SEÇÃO 21: HUMAN FIGHTER & HUMAN SORCERER

#### Classe: `human_fighter` (6 Habilidades)

| Slot | Habilidade | ID | Elemento | Função | Duração | Orçamento Partículas | Cooldown |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---:|
| Slot 1 | **Investida de Escudo** | `shield_bash` | Physical | control | 450 ms | 45 max | 4s |
| Slot 2 | **Golpe Ceifador** | `cleave_strike` | Physical | area | 490 ms | 55 max | 5s |
| Slot 3 | **Postura de Ferro** | `iron_stance` | Physical | tank | 530 ms | 65 max | 6s |
| Slot 4 | **Pancada Atordoante** | `concussive_stun` | Physical | finisher | 570 ms | 75 max | 7s |
| **Lv80 Ult** | **Titanbreaker** | `titanbreaker` | Physical | burst | 1100 ms | 160 max | 25s |
| **Lv90 Master** | **Master: Titanbreaker** | `master_titanbreaker` | Physical | burst | 1500 ms | 220 max | 40s |

##### Detalhes: `shield_bash` (Investida de Escudo)
- **Descrição:** Investida de Escudo — Habilidade Especialista de human_fighter.
- **Multiplicador de Dano:** 1.4x | **Stagger:** 25 | **Crítico:** 1.4x
- **Armas Requeridas:** `sword, blunt, shield`
- **Game Feel:** Shake 0.25 (decaimento 1.8) | Hit-Stop: 50ms
- **Assinatura VFX:** `vfx_sig_human_fighter_shield_bash_0` | **PoolKey:** `pool_shield_bash`

##### Detalhes: `cleave_strike` (Golpe Ceifador)
- **Descrição:** Golpe Ceifador — Habilidade Especialista de human_fighter.
- **Multiplicador de Dano:** 1.5999999999999999x | **Stagger:** 33 | **Crítico:** 1.5x
- **Armas Requeridas:** `sword, blunt, shield`
- **Game Feel:** Shake 0.33 (decaimento 1.8) | Hit-Stop: 60ms
- **Assinatura VFX:** `vfx_sig_human_fighter_cleave_strike_1` | **PoolKey:** `pool_cleave_strike`

##### Detalhes: `iron_stance` (Postura de Ferro)
- **Descrição:** Postura de Ferro — Habilidade Especialista de human_fighter.
- **Multiplicador de Dano:** 1.7999999999999998x | **Stagger:** 41 | **Crítico:** 1.5999999999999999x
- **Armas Requeridas:** `sword, blunt, shield`
- **Game Feel:** Shake 0.41000000000000003 (decaimento 1.8) | Hit-Stop: 70ms
- **Assinatura VFX:** `vfx_sig_human_fighter_iron_stance_2` | **PoolKey:** `pool_iron_stance`

##### Detalhes: `concussive_stun` (Pancada Atordoante)
- **Descrição:** Pancada Atordoante — Habilidade Especialista de human_fighter.
- **Multiplicador de Dano:** 2x | **Stagger:** 49 | **Crítico:** 1.7x
- **Armas Requeridas:** `sword, blunt, shield`
- **Game Feel:** Shake 0.49 (decaimento 1.8) | Hit-Stop: 80ms
- **Assinatura VFX:** `vfx_sig_human_fighter_concussive_stun_3` | **PoolKey:** `pool_concussive_stun`

##### Detalhes: `titanbreaker` (Titanbreaker)
- **Descrição:** Titanbreaker — Habilidade Ultimate (★★★★) de human_fighter.
- **Multiplicador de Dano:** 3.6x | **Stagger:** 100 | **Crítico:** 2x
- **Armas Requeridas:** `sword, blunt, shield`
- **Game Feel:** Shake 0.8 (decaimento 1.8) | Hit-Stop: 120ms
- **Assinatura VFX:** `vfx_sig_human_fighter_titanbreaker_4` | **PoolKey:** `pool_titanbreaker`

##### Detalhes: `master_titanbreaker` (Master: Titanbreaker)
- **Descrição:** Master: Titanbreaker — Habilidade Master Ultimate (★★★★★) de human_fighter.
- **Multiplicador de Dano:** 5.2x | **Stagger:** 180 | **Crítico:** 2.5x
- **Armas Requeridas:** `sword, blunt, shield`
- **Game Feel:** Shake 1 (decaimento 1.8) | Hit-Stop: 160ms
- **Assinatura VFX:** `vfx_sig_human_fighter_master_titanbreaker_5` | **PoolKey:** `pool_master_titanbreaker`

#### Classe: `human_sorcerer` (6 Habilidades)

| Slot | Habilidade | ID | Elemento | Função | Duração | Orçamento Partículas | Cooldown |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---:|
| Slot 1 | **Bola de Fogo** | `fireball` | Fire | burst | 450 ms | 45 max | 4s |
| Slot 2 | **Espinho de Magma** | `magma_spike` | Magma | area | 490 ms | 55 max | 5s |
| Slot 3 | **Raio Sagrado** | `holy_bolt` | Holy | burst | 530 ms | 65 max | 6s |
| Slot 4 | **Nova Flamejante** | `flame_nova` | Fire | area | 570 ms | 75 max | 7s |
| **Lv80 Ult** | **Meteor** | `meteor` | Fire | burst | 1100 ms | 160 max | 25s |
| **Lv90 Master** | **Master: Meteor** | `master_meteor` | Fire | burst | 1500 ms | 220 max | 40s |

##### Detalhes: `fireball` (Bola de Fogo)
- **Descrição:** Bola de Fogo — Habilidade Especialista de human_sorcerer.
- **Multiplicador de Dano:** 1.4x | **Stagger:** 25 | **Crítico:** 1.4x
- **Armas Requeridas:** `staff, wand`
- **Game Feel:** Shake 0.25 (decaimento 1.8) | Hit-Stop: 50ms
- **Assinatura VFX:** `vfx_sig_human_sorcerer_fireball_0` | **PoolKey:** `pool_fireball`

##### Detalhes: `magma_spike` (Espinho de Magma)
- **Descrição:** Espinho de Magma — Habilidade Especialista de human_sorcerer.
- **Multiplicador de Dano:** 1.5999999999999999x | **Stagger:** 33 | **Crítico:** 1.5x
- **Armas Requeridas:** `staff, wand`
- **Game Feel:** Shake 0.33 (decaimento 1.8) | Hit-Stop: 60ms
- **Assinatura VFX:** `vfx_sig_human_sorcerer_magma_spike_1` | **PoolKey:** `pool_magma_spike`

##### Detalhes: `holy_bolt` (Raio Sagrado)
- **Descrição:** Raio Sagrado — Habilidade Especialista de human_sorcerer.
- **Multiplicador de Dano:** 1.7999999999999998x | **Stagger:** 41 | **Crítico:** 1.5999999999999999x
- **Armas Requeridas:** `staff, wand`
- **Game Feel:** Shake 0.41000000000000003 (decaimento 1.8) | Hit-Stop: 70ms
- **Assinatura VFX:** `vfx_sig_human_sorcerer_holy_bolt_2` | **PoolKey:** `pool_holy_bolt`

##### Detalhes: `flame_nova` (Nova Flamejante)
- **Descrição:** Nova Flamejante — Habilidade Especialista de human_sorcerer.
- **Multiplicador de Dano:** 2x | **Stagger:** 49 | **Crítico:** 1.7x
- **Armas Requeridas:** `staff, wand`
- **Game Feel:** Shake 0.49 (decaimento 1.8) | Hit-Stop: 80ms
- **Assinatura VFX:** `vfx_sig_human_sorcerer_flame_nova_3` | **PoolKey:** `pool_flame_nova`

##### Detalhes: `meteor` (Meteor)
- **Descrição:** Meteor — Habilidade Ultimate (★★★★) de human_sorcerer.
- **Multiplicador de Dano:** 3.6x | **Stagger:** 100 | **Crítico:** 2x
- **Armas Requeridas:** `staff, wand`
- **Game Feel:** Shake 0.8 (decaimento 1.8) | Hit-Stop: 120ms
- **Assinatura VFX:** `vfx_sig_human_sorcerer_meteor_4` | **PoolKey:** `pool_meteor`

##### Detalhes: `master_meteor` (Master: Meteor)
- **Descrição:** Master: Meteor — Habilidade Master Ultimate (★★★★★) de human_sorcerer.
- **Multiplicador de Dano:** 5.2x | **Stagger:** 180 | **Crítico:** 2.5x
- **Armas Requeridas:** `staff, wand`
- **Game Feel:** Shake 1 (decaimento 1.8) | Hit-Stop: 160ms
- **Assinatura VFX:** `vfx_sig_human_sorcerer_master_meteor_5` | **PoolKey:** `pool_master_meteor`


### SEÇÃO 22: HUMAN DEATH KNIGHT, HUMAN WARG & HUMAN ASSASSIN

#### Classe: `human_death_knight` (6 Habilidades)

| Slot | Habilidade | ID | Elemento | Função | Duração | Orçamento Partículas | Cooldown |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---:|
| Slot 1 | **Lâmina de Cinzas** | `cinderblade` | Fire | burst | 450 ms | 45 max | 4s |
| Slot 2 | **Garra Infernal** | `hellfire_grasp` | Fire | control | 490 ms | 55 max | 5s |
| Slot 3 | **Véu de Cinzas** | `ashen_shroud` | Dark | tank | 530 ms | 65 max | 6s |
| Slot 4 | **Julgamento Infernal** | `infernal_judgment` | Fire | finisher | 570 ms | 75 max | 7s |
| **Lv80 Ult** | **Infernal Apocalypse** | `infernal_apocalypse` | Fire | finisher | 1100 ms | 160 max | 25s |
| **Lv90 Master** | **Master: Infernal Apocalypse** | `master_infernal_apocalypse` | Fire | finisher | 1500 ms | 220 max | 40s |

##### Detalhes: `cinderblade` (Lâmina de Cinzas)
- **Descrição:** Lâmina de Cinzas — Habilidade Especialista de human_death_knight.
- **Multiplicador de Dano:** 1.4x | **Stagger:** 25 | **Crítico:** 1.4x
- **Armas Requeridas:** `two_handed_sword, sword`
- **Game Feel:** Shake 0.25 (decaimento 1.8) | Hit-Stop: 50ms
- **Assinatura VFX:** `vfx_sig_human_death_knight_cinderblade_0` | **PoolKey:** `pool_cinderblade`

##### Detalhes: `hellfire_grasp` (Garra Infernal)
- **Descrição:** Garra Infernal — Habilidade Especialista de human_death_knight.
- **Multiplicador de Dano:** 1.5999999999999999x | **Stagger:** 33 | **Crítico:** 1.5x
- **Armas Requeridas:** `two_handed_sword, sword`
- **Game Feel:** Shake 0.33 (decaimento 1.8) | Hit-Stop: 60ms
- **Assinatura VFX:** `vfx_sig_human_death_knight_hellfire_grasp_1` | **PoolKey:** `pool_hellfire_grasp`

##### Detalhes: `ashen_shroud` (Véu de Cinzas)
- **Descrição:** Véu de Cinzas — Habilidade Especialista de human_death_knight.
- **Multiplicador de Dano:** 1.7999999999999998x | **Stagger:** 41 | **Crítico:** 1.5999999999999999x
- **Armas Requeridas:** `two_handed_sword, sword`
- **Game Feel:** Shake 0.41000000000000003 (decaimento 1.8) | Hit-Stop: 70ms
- **Assinatura VFX:** `vfx_sig_human_death_knight_ashen_shroud_2` | **PoolKey:** `pool_ashen_shroud`

##### Detalhes: `infernal_judgment` (Julgamento Infernal)
- **Descrição:** Julgamento Infernal — Habilidade Especialista de human_death_knight.
- **Multiplicador de Dano:** 2x | **Stagger:** 49 | **Crítico:** 1.7x
- **Armas Requeridas:** `two_handed_sword, sword`
- **Game Feel:** Shake 0.49 (decaimento 1.8) | Hit-Stop: 80ms
- **Assinatura VFX:** `vfx_sig_human_death_knight_infernal_judgment_3` | **PoolKey:** `pool_infernal_judgment`

##### Detalhes: `infernal_apocalypse` (Infernal Apocalypse)
- **Descrição:** Infernal Apocalypse — Habilidade Ultimate (★★★★) de human_death_knight.
- **Multiplicador de Dano:** 3.6x | **Stagger:** 100 | **Crítico:** 2x
- **Armas Requeridas:** `two_handed_sword, sword`
- **Game Feel:** Shake 0.8 (decaimento 1.8) | Hit-Stop: 120ms
- **Assinatura VFX:** `vfx_sig_human_death_knight_infernal_apocalypse_4` | **PoolKey:** `pool_infernal_apocalypse`

##### Detalhes: `master_infernal_apocalypse` (Master: Infernal Apocalypse)
- **Descrição:** Master: Infernal Apocalypse — Habilidade Master Ultimate (★★★★★) de human_death_knight.
- **Multiplicador de Dano:** 5.2x | **Stagger:** 180 | **Crítico:** 2.5x
- **Armas Requeridas:** `two_handed_sword, sword`
- **Game Feel:** Shake 1 (decaimento 1.8) | Hit-Stop: 160ms
- **Assinatura VFX:** `vfx_sig_human_death_knight_master_infernal_apocalypse_5` | **PoolKey:** `pool_master_infernal_apocalypse`

#### Classe: `human_warg` (6 Habilidades)

| Slot | Habilidade | ID | Elemento | Função | Duração | Orçamento Partículas | Cooldown |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---:|
| Slot 1 | **Mordida Selvagem** | `savage_bite` | Physical | burst | 450 ms | 45 max | 4s |
| Slot 2 | **Uivo de Matilha** | `pack_howl` | Physical | buff | 490 ms | 55 max | 5s |
| Slot 3 | **Salto Feral** | `feral_pounce` | Physical | mobility | 530 ms | 65 max | 6s |
| Slot 4 | **Forma Bestial** | `beast_form` | Physical | buff | 570 ms | 75 max | 7s |
| **Lv80 Ult** | **Primal Overrun** | `primal_overrun` | Physical | mobility | 1100 ms | 160 max | 25s |
| **Lv90 Master** | **Master: Primal Overrun** | `master_primal_overrun` | Physical | mobility | 1500 ms | 220 max | 40s |

##### Detalhes: `savage_bite` (Mordida Selvagem)
- **Descrição:** Mordida Selvagem — Habilidade Especialista de human_warg.
- **Multiplicador de Dano:** 1.4x | **Stagger:** 25 | **Crítico:** 1.4x
- **Armas Requeridas:** `fist, claws, any`
- **Game Feel:** Shake 0.25 (decaimento 1.8) | Hit-Stop: 50ms
- **Assinatura VFX:** `vfx_sig_human_warg_savage_bite_0` | **PoolKey:** `pool_savage_bite`

##### Detalhes: `pack_howl` (Uivo de Matilha)
- **Descrição:** Uivo de Matilha — Habilidade Especialista de human_warg.
- **Multiplicador de Dano:** 1.5999999999999999x | **Stagger:** 33 | **Crítico:** 1.5x
- **Armas Requeridas:** `fist, claws, any`
- **Game Feel:** Shake 0.33 (decaimento 1.8) | Hit-Stop: 60ms
- **Assinatura VFX:** `vfx_sig_human_warg_pack_howl_1` | **PoolKey:** `pool_pack_howl`

##### Detalhes: `feral_pounce` (Salto Feral)
- **Descrição:** Salto Feral — Habilidade Especialista de human_warg.
- **Multiplicador de Dano:** 1.7999999999999998x | **Stagger:** 41 | **Crítico:** 1.5999999999999999x
- **Armas Requeridas:** `fist, claws, any`
- **Game Feel:** Shake 0.41000000000000003 (decaimento 1.8) | Hit-Stop: 70ms
- **Assinatura VFX:** `vfx_sig_human_warg_feral_pounce_2` | **PoolKey:** `pool_feral_pounce`

##### Detalhes: `beast_form` (Forma Bestial)
- **Descrição:** Forma Bestial — Habilidade Especialista de human_warg.
- **Multiplicador de Dano:** 2x | **Stagger:** 49 | **Crítico:** 1.7x
- **Armas Requeridas:** `fist, claws, any`
- **Game Feel:** Shake 0.49 (decaimento 1.8) | Hit-Stop: 80ms
- **Assinatura VFX:** `vfx_sig_human_warg_beast_form_3` | **PoolKey:** `pool_beast_form`

##### Detalhes: `primal_overrun` (Primal Overrun)
- **Descrição:** Primal Overrun — Habilidade Ultimate (★★★★) de human_warg.
- **Multiplicador de Dano:** 3.6x | **Stagger:** 100 | **Crítico:** 2x
- **Armas Requeridas:** `fist, claws, any`
- **Game Feel:** Shake 0.8 (decaimento 1.8) | Hit-Stop: 120ms
- **Assinatura VFX:** `vfx_sig_human_warg_primal_overrun_4` | **PoolKey:** `pool_primal_overrun`

##### Detalhes: `master_primal_overrun` (Master: Primal Overrun)
- **Descrição:** Master: Primal Overrun — Habilidade Master Ultimate (★★★★★) de human_warg.
- **Multiplicador de Dano:** 5.2x | **Stagger:** 180 | **Crítico:** 2.5x
- **Armas Requeridas:** `fist, claws, any`
- **Game Feel:** Shake 1 (decaimento 1.8) | Hit-Stop: 160ms
- **Assinatura VFX:** `vfx_sig_human_warg_master_primal_overrun_5` | **PoolKey:** `pool_master_primal_overrun`

#### Classe: `human_assassin` (6 Habilidades)

| Slot | Habilidade | ID | Elemento | Função | Duração | Orçamento Partículas | Cooldown |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---:|
| Slot 1 | **Clone de Sombra** | `shadow_clone` | Dark | buff | 450 ms | 45 max | 4s |
| Slot 2 | **Golpe Sombrio** | `gloom_strike` | Dark | burst | 490 ms | 55 max | 5s |
| Slot 3 | **Passo do Véu** | `veil_step` | Dark | mobility | 530 ms | 65 max | 6s |
| Slot 4 | **Execução Noturna** | `night_execution` | Dark | finisher | 570 ms | 75 max | 7s |
| **Lv80 Ult** | **Nightfall Execution** | `nightfall_execution` | Dark | finisher | 1100 ms | 160 max | 25s |
| **Lv90 Master** | **Master: Nightfall Execution** | `master_nightfall_execution` | Dark | finisher | 1500 ms | 220 max | 40s |

##### Detalhes: `shadow_clone` (Clone de Sombra)
- **Descrição:** Clone de Sombra — Habilidade Especialista de human_assassin.
- **Multiplicador de Dano:** 1.4x | **Stagger:** 25 | **Crítico:** 1.4x
- **Armas Requeridas:** `dagger, dual_daggers`
- **Game Feel:** Shake 0.25 (decaimento 1.8) | Hit-Stop: 50ms
- **Assinatura VFX:** `vfx_sig_human_assassin_shadow_clone_0` | **PoolKey:** `pool_shadow_clone`

##### Detalhes: `gloom_strike` (Golpe Sombrio)
- **Descrição:** Golpe Sombrio — Habilidade Especialista de human_assassin.
- **Multiplicador de Dano:** 1.5999999999999999x | **Stagger:** 33 | **Crítico:** 1.5x
- **Armas Requeridas:** `dagger, dual_daggers`
- **Game Feel:** Shake 0.33 (decaimento 1.8) | Hit-Stop: 60ms
- **Assinatura VFX:** `vfx_sig_human_assassin_gloom_strike_1` | **PoolKey:** `pool_gloom_strike`

##### Detalhes: `veil_step` (Passo do Véu)
- **Descrição:** Passo do Véu — Habilidade Especialista de human_assassin.
- **Multiplicador de Dano:** 1.7999999999999998x | **Stagger:** 41 | **Crítico:** 1.5999999999999999x
- **Armas Requeridas:** `dagger, dual_daggers`
- **Game Feel:** Shake 0.41000000000000003 (decaimento 1.8) | Hit-Stop: 70ms
- **Assinatura VFX:** `vfx_sig_human_assassin_veil_step_2` | **PoolKey:** `pool_veil_step`

##### Detalhes: `night_execution` (Execução Noturna)
- **Descrição:** Execução Noturna — Habilidade Especialista de human_assassin.
- **Multiplicador de Dano:** 2x | **Stagger:** 49 | **Crítico:** 1.7x
- **Armas Requeridas:** `dagger, dual_daggers`
- **Game Feel:** Shake 0.49 (decaimento 1.8) | Hit-Stop: 80ms
- **Assinatura VFX:** `vfx_sig_human_assassin_night_execution_3` | **PoolKey:** `pool_night_execution`

##### Detalhes: `nightfall_execution` (Nightfall Execution)
- **Descrição:** Nightfall Execution — Habilidade Ultimate (★★★★) de human_assassin.
- **Multiplicador de Dano:** 3.6x | **Stagger:** 100 | **Crítico:** 2x
- **Armas Requeridas:** `dagger, dual_daggers`
- **Game Feel:** Shake 0.8 (decaimento 1.8) | Hit-Stop: 120ms
- **Assinatura VFX:** `vfx_sig_human_assassin_nightfall_execution_4` | **PoolKey:** `pool_nightfall_execution`

##### Detalhes: `master_nightfall_execution` (Master: Nightfall Execution)
- **Descrição:** Master: Nightfall Execution — Habilidade Master Ultimate (★★★★★) de human_assassin.
- **Multiplicador de Dano:** 5.2x | **Stagger:** 180 | **Crítico:** 2.5x
- **Armas Requeridas:** `dagger, dual_daggers`
- **Game Feel:** Shake 1 (decaimento 1.8) | Hit-Stop: 160ms
- **Assinatura VFX:** `vfx_sig_human_assassin_master_nightfall_execution_5` | **PoolKey:** `pool_master_nightfall_execution`


### SEÇÃO 23: ELF FIGHTER & ELF MAGE

#### Classe: `elf_fighter` (6 Habilidades)

| Slot | Habilidade | ID | Elemento | Função | Duração | Orçamento Partículas | Cooldown |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---:|
| Slot 1 | **Flecha Aquática** | `aqua_arrow` | Water | burst | 450 ms | 45 max | 4s |
| Slot 2 | **Passo da Maré** | `tide_step` | Water | mobility | 490 ms | 55 max | 5s |
| Slot 3 | **Guarda de Névoa** | `mist_guard` | Water | tank | 530 ms | 65 max | 6s |
| Slot 4 | **Rajada de Correnteza** | `riptide_volley` | Water | area | 570 ms | 75 max | 7s |
| **Lv80 Ult** | **Tidal Ascension** | `tidal_ascension` | Water | mobility | 1100 ms | 160 max | 25s |
| **Lv90 Master** | **Master: Tidal Ascension** | `master_tidal_ascension` | Water | mobility | 1500 ms | 220 max | 40s |

##### Detalhes: `aqua_arrow` (Flecha Aquática)
- **Descrição:** Flecha Aquática — Habilidade Especialista de elf_fighter.
- **Multiplicador de Dano:** 1.4x | **Stagger:** 25 | **Crítico:** 1.4x
- **Armas Requeridas:** `bow, dagger`
- **Game Feel:** Shake 0.25 (decaimento 1.8) | Hit-Stop: 50ms
- **Assinatura VFX:** `vfx_sig_elf_fighter_aqua_arrow_0` | **PoolKey:** `pool_aqua_arrow`

##### Detalhes: `tide_step` (Passo da Maré)
- **Descrição:** Passo da Maré — Habilidade Especialista de elf_fighter.
- **Multiplicador de Dano:** 1.5999999999999999x | **Stagger:** 33 | **Crítico:** 1.5x
- **Armas Requeridas:** `bow, dagger`
- **Game Feel:** Shake 0.33 (decaimento 1.8) | Hit-Stop: 60ms
- **Assinatura VFX:** `vfx_sig_elf_fighter_tide_step_1` | **PoolKey:** `pool_tide_step`

##### Detalhes: `mist_guard` (Guarda de Névoa)
- **Descrição:** Guarda de Névoa — Habilidade Especialista de elf_fighter.
- **Multiplicador de Dano:** 1.7999999999999998x | **Stagger:** 41 | **Crítico:** 1.5999999999999999x
- **Armas Requeridas:** `bow, dagger`
- **Game Feel:** Shake 0.41000000000000003 (decaimento 1.8) | Hit-Stop: 70ms
- **Assinatura VFX:** `vfx_sig_elf_fighter_mist_guard_2` | **PoolKey:** `pool_mist_guard`

##### Detalhes: `riptide_volley` (Rajada de Correnteza)
- **Descrição:** Rajada de Correnteza — Habilidade Especialista de elf_fighter.
- **Multiplicador de Dano:** 2x | **Stagger:** 49 | **Crítico:** 1.7x
- **Armas Requeridas:** `bow, dagger`
- **Game Feel:** Shake 0.49 (decaimento 1.8) | Hit-Stop: 80ms
- **Assinatura VFX:** `vfx_sig_elf_fighter_riptide_volley_3` | **PoolKey:** `pool_riptide_volley`

##### Detalhes: `tidal_ascension` (Tidal Ascension)
- **Descrição:** Tidal Ascension — Habilidade Ultimate (★★★★) de elf_fighter.
- **Multiplicador de Dano:** 3.6x | **Stagger:** 100 | **Crítico:** 2x
- **Armas Requeridas:** `bow, dagger`
- **Game Feel:** Shake 0.8 (decaimento 1.8) | Hit-Stop: 120ms
- **Assinatura VFX:** `vfx_sig_elf_fighter_tidal_ascension_4` | **PoolKey:** `pool_tidal_ascension`

##### Detalhes: `master_tidal_ascension` (Master: Tidal Ascension)
- **Descrição:** Master: Tidal Ascension — Habilidade Master Ultimate (★★★★★) de elf_fighter.
- **Multiplicador de Dano:** 5.2x | **Stagger:** 180 | **Crítico:** 2.5x
- **Armas Requeridas:** `bow, dagger`
- **Game Feel:** Shake 1 (decaimento 1.8) | Hit-Stop: 160ms
- **Assinatura VFX:** `vfx_sig_elf_fighter_master_tidal_ascension_5` | **PoolKey:** `pool_master_tidal_ascension`

#### Classe: `elf_mage` (6 Habilidades)

| Slot | Habilidade | ID | Elemento | Função | Duração | Orçamento Partículas | Cooldown |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---:|
| Slot 1 | **Explosão Hídrica** | `hydro_blast` | Water | burst | 450 ms | 45 max | 4s |
| Slot 2 | **Nevasca** | `blizzard` | Ice | area | 490 ms | 55 max | 5s |
| Slot 3 | **Onda Curativa** | `healing_wave` | Holy | heal | 530 ms | 65 max | 6s |
| Slot 4 | **Surto de Maré** | `tidal_surge` | Water | finisher | 570 ms | 75 max | 7s |
| **Lv80 Ult** | **Glacial Cataclysm** | `glacial_cataclysm` | Water | area | 1100 ms | 160 max | 25s |
| **Lv90 Master** | **Master: Glacial Cataclysm** | `master_glacial_cataclysm` | Water | area | 1500 ms | 220 max | 40s |

##### Detalhes: `hydro_blast` (Explosão Hídrica)
- **Descrição:** Explosão Hídrica — Habilidade Especialista de elf_mage.
- **Multiplicador de Dano:** 1.4x | **Stagger:** 25 | **Crítico:** 1.4x
- **Armas Requeridas:** `staff, wand`
- **Game Feel:** Shake 0.25 (decaimento 1.8) | Hit-Stop: 50ms
- **Assinatura VFX:** `vfx_sig_elf_mage_hydro_blast_0` | **PoolKey:** `pool_hydro_blast`

##### Detalhes: `blizzard` (Nevasca)
- **Descrição:** Nevasca — Habilidade Especialista de elf_mage.
- **Multiplicador de Dano:** 1.5999999999999999x | **Stagger:** 33 | **Crítico:** 1.5x
- **Armas Requeridas:** `staff, wand`
- **Game Feel:** Shake 0.33 (decaimento 1.8) | Hit-Stop: 60ms
- **Assinatura VFX:** `vfx_sig_elf_mage_blizzard_1` | **PoolKey:** `pool_blizzard`

##### Detalhes: `healing_wave` (Onda Curativa)
- **Descrição:** Onda Curativa — Habilidade Especialista de elf_mage.
- **Multiplicador de Dano:** 1.7999999999999998x | **Stagger:** 41 | **Crítico:** 1.5999999999999999x
- **Armas Requeridas:** `staff, wand`
- **Game Feel:** Shake 0.41000000000000003 (decaimento 1.8) | Hit-Stop: 70ms
- **Assinatura VFX:** `vfx_sig_elf_mage_healing_wave_2` | **PoolKey:** `pool_healing_wave`

##### Detalhes: `tidal_surge` (Surto de Maré)
- **Descrição:** Surto de Maré — Habilidade Especialista de elf_mage.
- **Multiplicador de Dano:** 2x | **Stagger:** 49 | **Crítico:** 1.7x
- **Armas Requeridas:** `staff, wand`
- **Game Feel:** Shake 0.49 (decaimento 1.8) | Hit-Stop: 80ms
- **Assinatura VFX:** `vfx_sig_elf_mage_tidal_surge_3` | **PoolKey:** `pool_tidal_surge`

##### Detalhes: `glacial_cataclysm` (Glacial Cataclysm)
- **Descrição:** Glacial Cataclysm — Habilidade Ultimate (★★★★) de elf_mage.
- **Multiplicador de Dano:** 3.6x | **Stagger:** 100 | **Crítico:** 2x
- **Armas Requeridas:** `staff, wand`
- **Game Feel:** Shake 0.8 (decaimento 1.8) | Hit-Stop: 120ms
- **Assinatura VFX:** `vfx_sig_elf_mage_glacial_cataclysm_4` | **PoolKey:** `pool_glacial_cataclysm`

##### Detalhes: `master_glacial_cataclysm` (Master: Glacial Cataclysm)
- **Descrição:** Master: Glacial Cataclysm — Habilidade Master Ultimate (★★★★★) de elf_mage.
- **Multiplicador de Dano:** 5.2x | **Stagger:** 180 | **Crítico:** 2.5x
- **Armas Requeridas:** `staff, wand`
- **Game Feel:** Shake 1 (decaimento 1.8) | Hit-Stop: 160ms
- **Assinatura VFX:** `vfx_sig_elf_mage_master_glacial_cataclysm_5` | **PoolKey:** `pool_master_glacial_cataclysm`


### SEÇÃO 24: ELF DEATH KNIGHT

#### Classe: `elf_death_knight` (6 Habilidades)

| Slot | Habilidade | ID | Elemento | Função | Duração | Orçamento Partículas | Cooldown |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---:|
| Slot 1 | **Fio de Gelo** | `frost_edge` | Ice | burst | 450 ms | 45 max | 4s |
| Slot 2 | **Olhar Estilhaçante** | `shattering_gaze` | Ice | control | 490 ms | 55 max | 5s |
| Slot 3 | **Véu de Gelo Amaldiçoado** | `cursed_frost_veil` | Ice | tank | 530 ms | 65 max | 6s |
| Slot 4 | **Julgamento Glacial** | `glacial_judgment` | Ice | finisher | 570 ms | 75 max | 7s |
| **Lv80 Ult** | **Frostmourne Judgment** | `frostmourne_judgment` | Ice | finisher | 1100 ms | 160 max | 25s |
| **Lv90 Master** | **Master: Frostmourne Judgment** | `master_frostmourne_judgment` | Ice | finisher | 1500 ms | 220 max | 40s |

##### Detalhes: `frost_edge` (Fio de Gelo)
- **Descrição:** Fio de Gelo — Habilidade Especialista de elf_death_knight.
- **Multiplicador de Dano:** 1.4x | **Stagger:** 25 | **Crítico:** 1.4x
- **Armas Requeridas:** `sword, rapier`
- **Game Feel:** Shake 0.25 (decaimento 1.8) | Hit-Stop: 50ms
- **Assinatura VFX:** `vfx_sig_elf_death_knight_frost_edge_0` | **PoolKey:** `pool_frost_edge`

##### Detalhes: `shattering_gaze` (Olhar Estilhaçante)
- **Descrição:** Olhar Estilhaçante — Habilidade Especialista de elf_death_knight.
- **Multiplicador de Dano:** 1.5999999999999999x | **Stagger:** 33 | **Crítico:** 1.5x
- **Armas Requeridas:** `sword, rapier`
- **Game Feel:** Shake 0.33 (decaimento 1.8) | Hit-Stop: 60ms
- **Assinatura VFX:** `vfx_sig_elf_death_knight_shattering_gaze_1` | **PoolKey:** `pool_shattering_gaze`

##### Detalhes: `cursed_frost_veil` (Véu de Gelo Amaldiçoado)
- **Descrição:** Véu de Gelo Amaldiçoado — Habilidade Especialista de elf_death_knight.
- **Multiplicador de Dano:** 1.7999999999999998x | **Stagger:** 41 | **Crítico:** 1.5999999999999999x
- **Armas Requeridas:** `sword, rapier`
- **Game Feel:** Shake 0.41000000000000003 (decaimento 1.8) | Hit-Stop: 70ms
- **Assinatura VFX:** `vfx_sig_elf_death_knight_cursed_frost_veil_2` | **PoolKey:** `pool_cursed_frost_veil`

##### Detalhes: `glacial_judgment` (Julgamento Glacial)
- **Descrição:** Julgamento Glacial — Habilidade Especialista de elf_death_knight.
- **Multiplicador de Dano:** 2x | **Stagger:** 49 | **Crítico:** 1.7x
- **Armas Requeridas:** `sword, rapier`
- **Game Feel:** Shake 0.49 (decaimento 1.8) | Hit-Stop: 80ms
- **Assinatura VFX:** `vfx_sig_elf_death_knight_glacial_judgment_3` | **PoolKey:** `pool_glacial_judgment`

##### Detalhes: `frostmourne_judgment` (Frostmourne Judgment)
- **Descrição:** Frostmourne Judgment — Habilidade Ultimate (★★★★) de elf_death_knight.
- **Multiplicador de Dano:** 3.6x | **Stagger:** 100 | **Crítico:** 2x
- **Armas Requeridas:** `sword, rapier`
- **Game Feel:** Shake 0.8 (decaimento 1.8) | Hit-Stop: 120ms
- **Assinatura VFX:** `vfx_sig_elf_death_knight_frostmourne_judgment_4` | **PoolKey:** `pool_frostmourne_judgment`

##### Detalhes: `master_frostmourne_judgment` (Master: Frostmourne Judgment)
- **Descrição:** Master: Frostmourne Judgment — Habilidade Master Ultimate (★★★★★) de elf_death_knight.
- **Multiplicador de Dano:** 5.2x | **Stagger:** 180 | **Crítico:** 2.5x
- **Armas Requeridas:** `sword, rapier`
- **Game Feel:** Shake 1 (decaimento 1.8) | Hit-Stop: 160ms
- **Assinatura VFX:** `vfx_sig_elf_death_knight_master_frostmourne_judgment_5` | **PoolKey:** `pool_master_frostmourne_judgment`


### SEÇÃO 25: DARK ELF FIGHTER & DARK ELF MAGE

#### Classe: `dark_elf_fighter` (6 Habilidades)

| Slot | Habilidade | ID | Elemento | Função | Duração | Orçamento Partículas | Cooldown |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---:|
| Slot 1 | **Fio Venenoso** | `venom_edge` | Dark | burst | 450 ms | 45 max | 4s |
| Slot 2 | **Sifão de Vida** | `life_siphon` | Dark | heal | 490 ms | 55 max | 5s |
| Slot 3 | **Investida Umbral** | `umbral_dash` | Dark | mobility | 530 ms | 65 max | 6s |
| Slot 4 | **Corte Mutilante** | `crippling_slash` | Dark | debuff | 570 ms | 75 max | 7s |
| **Lv80 Ult** | **Abyssal Rupture** | `abyssal_rupture` | Dark | damage | 1100 ms | 160 max | 25s |
| **Lv90 Master** | **Master: Abyssal Rupture** | `master_abyssal_rupture` | Dark | damage | 1500 ms | 220 max | 40s |

##### Detalhes: `venom_edge` (Fio Venenoso)
- **Descrição:** Fio Venenoso — Habilidade Especialista de dark_elf_fighter.
- **Multiplicador de Dano:** 1.4x | **Stagger:** 25 | **Crítico:** 1.4x
- **Armas Requeridas:** `dual_swords, dagger`
- **Game Feel:** Shake 0.25 (decaimento 1.8) | Hit-Stop: 50ms
- **Assinatura VFX:** `vfx_sig_dark_elf_fighter_venom_edge_0` | **PoolKey:** `pool_venom_edge`

##### Detalhes: `life_siphon` (Sifão de Vida)
- **Descrição:** Sifão de Vida — Habilidade Especialista de dark_elf_fighter.
- **Multiplicador de Dano:** 1.5999999999999999x | **Stagger:** 33 | **Crítico:** 1.5x
- **Armas Requeridas:** `dual_swords, dagger`
- **Game Feel:** Shake 0.33 (decaimento 1.8) | Hit-Stop: 60ms
- **Assinatura VFX:** `vfx_sig_dark_elf_fighter_life_siphon_1` | **PoolKey:** `pool_life_siphon`

##### Detalhes: `umbral_dash` (Investida Umbral)
- **Descrição:** Investida Umbral — Habilidade Especialista de dark_elf_fighter.
- **Multiplicador de Dano:** 1.7999999999999998x | **Stagger:** 41 | **Crítico:** 1.5999999999999999x
- **Armas Requeridas:** `dual_swords, dagger`
- **Game Feel:** Shake 0.41000000000000003 (decaimento 1.8) | Hit-Stop: 70ms
- **Assinatura VFX:** `vfx_sig_dark_elf_fighter_umbral_dash_2` | **PoolKey:** `pool_umbral_dash`

##### Detalhes: `crippling_slash` (Corte Mutilante)
- **Descrição:** Corte Mutilante — Habilidade Especialista de dark_elf_fighter.
- **Multiplicador de Dano:** 2x | **Stagger:** 49 | **Crítico:** 1.7x
- **Armas Requeridas:** `dual_swords, dagger`
- **Game Feel:** Shake 0.49 (decaimento 1.8) | Hit-Stop: 80ms
- **Assinatura VFX:** `vfx_sig_dark_elf_fighter_crippling_slash_3` | **PoolKey:** `pool_crippling_slash`

##### Detalhes: `abyssal_rupture` (Abyssal Rupture)
- **Descrição:** Abyssal Rupture — Habilidade Ultimate (★★★★) de dark_elf_fighter.
- **Multiplicador de Dano:** 3.6x | **Stagger:** 100 | **Crítico:** 2x
- **Armas Requeridas:** `dual_swords, dagger`
- **Game Feel:** Shake 0.8 (decaimento 1.8) | Hit-Stop: 120ms
- **Assinatura VFX:** `vfx_sig_dark_elf_fighter_abyssal_rupture_4` | **PoolKey:** `pool_abyssal_rupture`

##### Detalhes: `master_abyssal_rupture` (Master: Abyssal Rupture)
- **Descrição:** Master: Abyssal Rupture — Habilidade Master Ultimate (★★★★★) de dark_elf_fighter.
- **Multiplicador de Dano:** 5.2x | **Stagger:** 180 | **Crítico:** 2.5x
- **Armas Requeridas:** `dual_swords, dagger`
- **Game Feel:** Shake 1 (decaimento 1.8) | Hit-Stop: 160ms
- **Assinatura VFX:** `vfx_sig_dark_elf_fighter_master_abyssal_rupture_5` | **PoolKey:** `pool_master_abyssal_rupture`

#### Classe: `dark_elf_mage` (6 Habilidades)

| Slot | Habilidade | ID | Elemento | Função | Duração | Orçamento Partículas | Cooldown |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---:|
| Slot 1 | **Furacão** | `hurricane` | Wind | area | 450 ms | 45 max | 4s |
| Slot 2 | **Corrente de Raios** | `chain_lightning` | Lightning | burst | 490 ms | 55 max | 5s |
| Slot 3 | **Maldição das Sombras** | `curse_of_shadow` | Dark | debuff | 530 ms | 65 max | 6s |
| Slot 4 | **Corte de Rajada** | `gale_slash` | Wind | burst | 570 ms | 75 max | 7s |
| **Lv80 Ult** | **Tempest of the Abyss** | `tempest_of_the_abyss` | Wind | area | 1100 ms | 160 max | 25s |
| **Lv90 Master** | **Master: Tempest of the Abyss** | `master_tempest_of_the_abyss` | Wind | area | 1500 ms | 220 max | 40s |

##### Detalhes: `hurricane` (Furacão)
- **Descrição:** Furacão — Habilidade Especialista de dark_elf_mage.
- **Multiplicador de Dano:** 1.4x | **Stagger:** 25 | **Crítico:** 1.4x
- **Armas Requeridas:** `staff, spellbook`
- **Game Feel:** Shake 0.25 (decaimento 1.8) | Hit-Stop: 50ms
- **Assinatura VFX:** `vfx_sig_dark_elf_mage_hurricane_0` | **PoolKey:** `pool_hurricane`

##### Detalhes: `chain_lightning` (Corrente de Raios)
- **Descrição:** Corrente de Raios — Habilidade Especialista de dark_elf_mage.
- **Multiplicador de Dano:** 1.5999999999999999x | **Stagger:** 33 | **Crítico:** 1.5x
- **Armas Requeridas:** `staff, spellbook`
- **Game Feel:** Shake 0.33 (decaimento 1.8) | Hit-Stop: 60ms
- **Assinatura VFX:** `vfx_sig_dark_elf_mage_chain_lightning_1` | **PoolKey:** `pool_chain_lightning`

##### Detalhes: `curse_of_shadow` (Maldição das Sombras)
- **Descrição:** Maldição das Sombras — Habilidade Especialista de dark_elf_mage.
- **Multiplicador de Dano:** 1.7999999999999998x | **Stagger:** 41 | **Crítico:** 1.5999999999999999x
- **Armas Requeridas:** `staff, spellbook`
- **Game Feel:** Shake 0.41000000000000003 (decaimento 1.8) | Hit-Stop: 70ms
- **Assinatura VFX:** `vfx_sig_dark_elf_mage_curse_of_shadow_2` | **PoolKey:** `pool_curse_of_shadow`

##### Detalhes: `gale_slash` (Corte de Rajada)
- **Descrição:** Corte de Rajada — Habilidade Especialista de dark_elf_mage.
- **Multiplicador de Dano:** 2x | **Stagger:** 49 | **Crítico:** 1.7x
- **Armas Requeridas:** `staff, spellbook`
- **Game Feel:** Shake 0.49 (decaimento 1.8) | Hit-Stop: 80ms
- **Assinatura VFX:** `vfx_sig_dark_elf_mage_gale_slash_3` | **PoolKey:** `pool_gale_slash`

##### Detalhes: `tempest_of_the_abyss` (Tempest of the Abyss)
- **Descrição:** Tempest of the Abyss — Habilidade Ultimate (★★★★) de dark_elf_mage.
- **Multiplicador de Dano:** 3.6x | **Stagger:** 100 | **Crítico:** 2x
- **Armas Requeridas:** `staff, spellbook`
- **Game Feel:** Shake 0.8 (decaimento 1.8) | Hit-Stop: 120ms
- **Assinatura VFX:** `vfx_sig_dark_elf_mage_tempest_of_the_abyss_4` | **PoolKey:** `pool_tempest_of_the_abyss`

##### Detalhes: `master_tempest_of_the_abyss` (Master: Tempest of the Abyss)
- **Descrição:** Master: Tempest of the Abyss — Habilidade Master Ultimate (★★★★★) de dark_elf_mage.
- **Multiplicador de Dano:** 5.2x | **Stagger:** 180 | **Crítico:** 2.5x
- **Armas Requeridas:** `staff, spellbook`
- **Game Feel:** Shake 1 (decaimento 1.8) | Hit-Stop: 160ms
- **Assinatura VFX:** `vfx_sig_dark_elf_mage_master_tempest_of_the_abyss_5` | **PoolKey:** `pool_master_tempest_of_the_abyss`


### SEÇÃO 26: DARK ELF DEATH KNIGHT, DARK ELF ASSASSIN & DARK ELF BLOOD ROSE

#### Classe: `dark_elf_death_knight` (6 Habilidades)

| Slot | Habilidade | ID | Elemento | Função | Duração | Orçamento Partículas | Cooldown |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---:|
| Slot 1 | **Fio Voltaico** | `voltaic_edge` | Lightning | burst | 450 ms | 45 max | 4s |
| Slot 2 | **Julgamento da Tempestade** | `storm_judgment` | Lightning | finisher | 490 ms | 55 max | 5s |
| Slot 3 | **Véu de Trovão** | `thunder_veil` | Lightning | tank | 530 ms | 65 max | 6s |
| Slot 4 | **Garra Eletrizante** | `shocking_grasp` | Lightning | control | 570 ms | 75 max | 7s |
| **Lv80 Ult** | **Voltaic Requiem** | `voltaic_requiem` | Lightning | burst | 1100 ms | 160 max | 25s |
| **Lv90 Master** | **Master: Voltaic Requiem** | `master_voltaic_requiem` | Lightning | burst | 1500 ms | 220 max | 40s |

##### Detalhes: `voltaic_edge` (Fio Voltaico)
- **Descrição:** Fio Voltaico — Habilidade Especialista de dark_elf_death_knight.
- **Multiplicador de Dano:** 1.4x | **Stagger:** 25 | **Crítico:** 1.4x
- **Armas Requeridas:** `two_handed_sword, sword`
- **Game Feel:** Shake 0.25 (decaimento 1.8) | Hit-Stop: 50ms
- **Assinatura VFX:** `vfx_sig_dark_elf_death_knight_voltaic_edge_0` | **PoolKey:** `pool_voltaic_edge`

##### Detalhes: `storm_judgment` (Julgamento da Tempestade)
- **Descrição:** Julgamento da Tempestade — Habilidade Especialista de dark_elf_death_knight.
- **Multiplicador de Dano:** 1.5999999999999999x | **Stagger:** 33 | **Crítico:** 1.5x
- **Armas Requeridas:** `two_handed_sword, sword`
- **Game Feel:** Shake 0.33 (decaimento 1.8) | Hit-Stop: 60ms
- **Assinatura VFX:** `vfx_sig_dark_elf_death_knight_storm_judgment_1` | **PoolKey:** `pool_storm_judgment`

##### Detalhes: `thunder_veil` (Véu de Trovão)
- **Descrição:** Véu de Trovão — Habilidade Especialista de dark_elf_death_knight.
- **Multiplicador de Dano:** 1.7999999999999998x | **Stagger:** 41 | **Crítico:** 1.5999999999999999x
- **Armas Requeridas:** `two_handed_sword, sword`
- **Game Feel:** Shake 0.41000000000000003 (decaimento 1.8) | Hit-Stop: 70ms
- **Assinatura VFX:** `vfx_sig_dark_elf_death_knight_thunder_veil_2` | **PoolKey:** `pool_thunder_veil`

##### Detalhes: `shocking_grasp` (Garra Eletrizante)
- **Descrição:** Garra Eletrizante — Habilidade Especialista de dark_elf_death_knight.
- **Multiplicador de Dano:** 2x | **Stagger:** 49 | **Crítico:** 1.7x
- **Armas Requeridas:** `two_handed_sword, sword`
- **Game Feel:** Shake 0.49 (decaimento 1.8) | Hit-Stop: 80ms
- **Assinatura VFX:** `vfx_sig_dark_elf_death_knight_shocking_grasp_3` | **PoolKey:** `pool_shocking_grasp`

##### Detalhes: `voltaic_requiem` (Voltaic Requiem)
- **Descrição:** Voltaic Requiem — Habilidade Ultimate (★★★★) de dark_elf_death_knight.
- **Multiplicador de Dano:** 3.6x | **Stagger:** 100 | **Crítico:** 2x
- **Armas Requeridas:** `two_handed_sword, sword`
- **Game Feel:** Shake 0.8 (decaimento 1.8) | Hit-Stop: 120ms
- **Assinatura VFX:** `vfx_sig_dark_elf_death_knight_voltaic_requiem_4` | **PoolKey:** `pool_voltaic_requiem`

##### Detalhes: `master_voltaic_requiem` (Master: Voltaic Requiem)
- **Descrição:** Master: Voltaic Requiem — Habilidade Master Ultimate (★★★★★) de dark_elf_death_knight.
- **Multiplicador de Dano:** 5.2x | **Stagger:** 180 | **Crítico:** 2.5x
- **Armas Requeridas:** `two_handed_sword, sword`
- **Game Feel:** Shake 1 (decaimento 1.8) | Hit-Stop: 160ms
- **Assinatura VFX:** `vfx_sig_dark_elf_death_knight_master_voltaic_requiem_5` | **PoolKey:** `pool_master_voltaic_requiem`

#### Classe: `dark_elf_assassin` (6 Habilidades)

| Slot | Habilidade | ID | Elemento | Função | Duração | Orçamento Partículas | Cooldown |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---:|
| Slot 1 | **Rajada Tóxica** | `toxic_flurry` | Poison | area | 450 ms | 45 max | 4s |
| Slot 2 | **Presa Venenosa** | `venom_fang` | Poison | burst | 490 ms | 55 max | 5s |
| Slot 3 | **Toxina Sombria** | `shadow_toxin` | Dark | debuff | 530 ms | 65 max | 6s |
| Slot 4 | **Dose Letal** | `lethal_dose` | Poison | finisher | 570 ms | 75 max | 7s |
| **Lv80 Ult** | **Venomous Eclipse** | `venomous_eclipse` | Dark | damage | 1100 ms | 160 max | 25s |
| **Lv90 Master** | **Master: Venomous Eclipse** | `master_venomous_eclipse` | Dark | damage | 1500 ms | 220 max | 40s |

##### Detalhes: `toxic_flurry` (Rajada Tóxica)
- **Descrição:** Rajada Tóxica — Habilidade Especialista de dark_elf_assassin.
- **Multiplicador de Dano:** 1.4x | **Stagger:** 25 | **Crítico:** 1.4x
- **Armas Requeridas:** `dual_daggers, dagger`
- **Game Feel:** Shake 0.25 (decaimento 1.8) | Hit-Stop: 50ms
- **Assinatura VFX:** `vfx_sig_dark_elf_assassin_toxic_flurry_0` | **PoolKey:** `pool_toxic_flurry`

##### Detalhes: `venom_fang` (Presa Venenosa)
- **Descrição:** Presa Venenosa — Habilidade Especialista de dark_elf_assassin.
- **Multiplicador de Dano:** 1.5999999999999999x | **Stagger:** 33 | **Crítico:** 1.5x
- **Armas Requeridas:** `dual_daggers, dagger`
- **Game Feel:** Shake 0.33 (decaimento 1.8) | Hit-Stop: 60ms
- **Assinatura VFX:** `vfx_sig_dark_elf_assassin_venom_fang_1` | **PoolKey:** `pool_venom_fang`

##### Detalhes: `shadow_toxin` (Toxina Sombria)
- **Descrição:** Toxina Sombria — Habilidade Especialista de dark_elf_assassin.
- **Multiplicador de Dano:** 1.7999999999999998x | **Stagger:** 41 | **Crítico:** 1.5999999999999999x
- **Armas Requeridas:** `dual_daggers, dagger`
- **Game Feel:** Shake 0.41000000000000003 (decaimento 1.8) | Hit-Stop: 70ms
- **Assinatura VFX:** `vfx_sig_dark_elf_assassin_shadow_toxin_2` | **PoolKey:** `pool_shadow_toxin`

##### Detalhes: `lethal_dose` (Dose Letal)
- **Descrição:** Dose Letal — Habilidade Especialista de dark_elf_assassin.
- **Multiplicador de Dano:** 2x | **Stagger:** 49 | **Crítico:** 1.7x
- **Armas Requeridas:** `dual_daggers, dagger`
- **Game Feel:** Shake 0.49 (decaimento 1.8) | Hit-Stop: 80ms
- **Assinatura VFX:** `vfx_sig_dark_elf_assassin_lethal_dose_3` | **PoolKey:** `pool_lethal_dose`

##### Detalhes: `venomous_eclipse` (Venomous Eclipse)
- **Descrição:** Venomous Eclipse — Habilidade Ultimate (★★★★) de dark_elf_assassin.
- **Multiplicador de Dano:** 3.6x | **Stagger:** 100 | **Crítico:** 2x
- **Armas Requeridas:** `dual_daggers, dagger`
- **Game Feel:** Shake 0.8 (decaimento 1.8) | Hit-Stop: 120ms
- **Assinatura VFX:** `vfx_sig_dark_elf_assassin_venomous_eclipse_4` | **PoolKey:** `pool_venomous_eclipse`

##### Detalhes: `master_venomous_eclipse` (Master: Venomous Eclipse)
- **Descrição:** Master: Venomous Eclipse — Habilidade Master Ultimate (★★★★★) de dark_elf_assassin.
- **Multiplicador de Dano:** 5.2x | **Stagger:** 180 | **Crítico:** 2.5x
- **Armas Requeridas:** `dual_daggers, dagger`
- **Game Feel:** Shake 1 (decaimento 1.8) | Hit-Stop: 160ms
- **Assinatura VFX:** `vfx_sig_dark_elf_assassin_master_venomous_eclipse_5` | **PoolKey:** `pool_master_venomous_eclipse`

#### Classe: `dark_elf_blood_rose` (6 Habilidades)

| Slot | Habilidade | ID | Elemento | Função | Duração | Orçamento Partículas | Cooldown |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---:|
| Slot 1 | **Maldição Espinhosa** | `thorned_hex` | Dark | debuff | 450 ms | 45 max | 4s |
| Slot 2 | **Dreno Carmesim** | `crimson_drain` | Blood | heal | 490 ms | 55 max | 5s |
| Slot 3 | **Toque Murchante** | `wilting_touch` | Dark | debuff | 530 ms | 65 max | 6s |
| Slot 4 | **Réquiem da Rosa** | `rose_requiem` | Dark | finisher | 570 ms | 75 max | 7s |
| **Lv80 Ult** | **Crimson Requiem** | `crimson_requiem` | Dark | debuff | 1100 ms | 160 max | 25s |
| **Lv90 Master** | **Master: Crimson Requiem** | `master_crimson_requiem` | Dark | debuff | 1500 ms | 220 max | 40s |

##### Detalhes: `thorned_hex` (Maldição Espinhosa)
- **Descrição:** Maldição Espinhosa — Habilidade Especialista de dark_elf_blood_rose.
- **Multiplicador de Dano:** 1.4x | **Stagger:** 25 | **Crítico:** 1.4x
- **Armas Requeridas:** `whip, rapier, wand`
- **Game Feel:** Shake 0.25 (decaimento 1.8) | Hit-Stop: 50ms
- **Assinatura VFX:** `vfx_sig_dark_elf_blood_rose_thorned_hex_0` | **PoolKey:** `pool_thorned_hex`

##### Detalhes: `crimson_drain` (Dreno Carmesim)
- **Descrição:** Dreno Carmesim — Habilidade Especialista de dark_elf_blood_rose.
- **Multiplicador de Dano:** 1.5999999999999999x | **Stagger:** 33 | **Crítico:** 1.5x
- **Armas Requeridas:** `whip, rapier, wand`
- **Game Feel:** Shake 0.33 (decaimento 1.8) | Hit-Stop: 60ms
- **Assinatura VFX:** `vfx_sig_dark_elf_blood_rose_crimson_drain_1` | **PoolKey:** `pool_crimson_drain`

##### Detalhes: `wilting_touch` (Toque Murchante)
- **Descrição:** Toque Murchante — Habilidade Especialista de dark_elf_blood_rose.
- **Multiplicador de Dano:** 1.7999999999999998x | **Stagger:** 41 | **Crítico:** 1.5999999999999999x
- **Armas Requeridas:** `whip, rapier, wand`
- **Game Feel:** Shake 0.41000000000000003 (decaimento 1.8) | Hit-Stop: 70ms
- **Assinatura VFX:** `vfx_sig_dark_elf_blood_rose_wilting_touch_2` | **PoolKey:** `pool_wilting_touch`

##### Detalhes: `rose_requiem` (Réquiem da Rosa)
- **Descrição:** Réquiem da Rosa — Habilidade Especialista de dark_elf_blood_rose.
- **Multiplicador de Dano:** 2x | **Stagger:** 49 | **Crítico:** 1.7x
- **Armas Requeridas:** `whip, rapier, wand`
- **Game Feel:** Shake 0.49 (decaimento 1.8) | Hit-Stop: 80ms
- **Assinatura VFX:** `vfx_sig_dark_elf_blood_rose_rose_requiem_3` | **PoolKey:** `pool_rose_requiem`

##### Detalhes: `crimson_requiem` (Crimson Requiem)
- **Descrição:** Crimson Requiem — Habilidade Ultimate (★★★★) de dark_elf_blood_rose.
- **Multiplicador de Dano:** 3.6x | **Stagger:** 100 | **Crítico:** 2x
- **Armas Requeridas:** `whip, rapier, wand`
- **Game Feel:** Shake 0.8 (decaimento 1.8) | Hit-Stop: 120ms
- **Assinatura VFX:** `vfx_sig_dark_elf_blood_rose_crimson_requiem_4` | **PoolKey:** `pool_crimson_requiem`

##### Detalhes: `master_crimson_requiem` (Master: Crimson Requiem)
- **Descrição:** Master: Crimson Requiem — Habilidade Master Ultimate (★★★★★) de dark_elf_blood_rose.
- **Multiplicador de Dano:** 5.2x | **Stagger:** 180 | **Crítico:** 2.5x
- **Armas Requeridas:** `whip, rapier, wand`
- **Game Feel:** Shake 1 (decaimento 1.8) | Hit-Stop: 160ms
- **Assinatura VFX:** `vfx_sig_dark_elf_blood_rose_master_crimson_requiem_5` | **PoolKey:** `pool_master_crimson_requiem`


### SEÇÃO 27: ORC FIGHTER & ORC SHAMAN

#### Classe: `orc_fighter` (6 Habilidades)

| Slot | Habilidade | ID | Elemento | Função | Duração | Orçamento Partículas | Cooldown |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---:|
| Slot 1 | **Fúria do Totem** | `totem_rage` | Fire | buff | 450 ms | 45 max | 4s |
| Slot 2 | **Talho Brutal** | `brutal_cleave` | Physical | area | 490 ms | 55 max | 5s |
| Slot 3 | **Pisão de Guerra** | `war_stomp` | Physical | control | 530 ms | 65 max | 6s |
| Slot 4 | **Frenesi Sanguinário** | `blood_frenzy` | Physical | buff | 570 ms | 75 max | 7s |
| **Lv80 Ult** | **Worldbreaker Roar** | `worldbreaker_roar` | Physical | finisher | 1100 ms | 160 max | 25s |
| **Lv90 Master** | **Master: Worldbreaker Roar** | `master_worldbreaker_roar` | Physical | finisher | 1500 ms | 220 max | 40s |

##### Detalhes: `totem_rage` (Fúria do Totem)
- **Descrição:** Fúria do Totem — Habilidade Especialista de orc_fighter.
- **Multiplicador de Dano:** 1.4x | **Stagger:** 25 | **Crítico:** 1.4x
- **Armas Requeridas:** `two_handed_axe, blunt, fist`
- **Game Feel:** Shake 0.25 (decaimento 1.8) | Hit-Stop: 50ms
- **Assinatura VFX:** `vfx_sig_orc_fighter_totem_rage_0` | **PoolKey:** `pool_totem_rage`

##### Detalhes: `brutal_cleave` (Talho Brutal)
- **Descrição:** Talho Brutal — Habilidade Especialista de orc_fighter.
- **Multiplicador de Dano:** 1.5999999999999999x | **Stagger:** 33 | **Crítico:** 1.5x
- **Armas Requeridas:** `two_handed_axe, blunt, fist`
- **Game Feel:** Shake 0.33 (decaimento 1.8) | Hit-Stop: 60ms
- **Assinatura VFX:** `vfx_sig_orc_fighter_brutal_cleave_1` | **PoolKey:** `pool_brutal_cleave`

##### Detalhes: `war_stomp` (Pisão de Guerra)
- **Descrição:** Pisão de Guerra — Habilidade Especialista de orc_fighter.
- **Multiplicador de Dano:** 1.7999999999999998x | **Stagger:** 41 | **Crítico:** 1.5999999999999999x
- **Armas Requeridas:** `two_handed_axe, blunt, fist`
- **Game Feel:** Shake 0.41000000000000003 (decaimento 1.8) | Hit-Stop: 70ms
- **Assinatura VFX:** `vfx_sig_orc_fighter_war_stomp_2` | **PoolKey:** `pool_war_stomp`

##### Detalhes: `blood_frenzy` (Frenesi Sanguinário)
- **Descrição:** Frenesi Sanguinário — Habilidade Especialista de orc_fighter.
- **Multiplicador de Dano:** 2x | **Stagger:** 49 | **Crítico:** 1.7x
- **Armas Requeridas:** `two_handed_axe, blunt, fist`
- **Game Feel:** Shake 0.49 (decaimento 1.8) | Hit-Stop: 80ms
- **Assinatura VFX:** `vfx_sig_orc_fighter_blood_frenzy_3` | **PoolKey:** `pool_blood_frenzy`

##### Detalhes: `worldbreaker_roar` (Worldbreaker Roar)
- **Descrição:** Worldbreaker Roar — Habilidade Ultimate (★★★★) de orc_fighter.
- **Multiplicador de Dano:** 3.6x | **Stagger:** 100 | **Crítico:** 2x
- **Armas Requeridas:** `two_handed_axe, blunt, fist`
- **Game Feel:** Shake 0.8 (decaimento 1.8) | Hit-Stop: 120ms
- **Assinatura VFX:** `vfx_sig_orc_fighter_worldbreaker_roar_4` | **PoolKey:** `pool_worldbreaker_roar`

##### Detalhes: `master_worldbreaker_roar` (Master: Worldbreaker Roar)
- **Descrição:** Master: Worldbreaker Roar — Habilidade Master Ultimate (★★★★★) de orc_fighter.
- **Multiplicador de Dano:** 5.2x | **Stagger:** 180 | **Crítico:** 2.5x
- **Armas Requeridas:** `two_handed_axe, blunt, fist`
- **Game Feel:** Shake 1 (decaimento 1.8) | Hit-Stop: 160ms
- **Assinatura VFX:** `vfx_sig_orc_fighter_master_worldbreaker_roar_5` | **PoolKey:** `pool_master_worldbreaker_roar`

#### Classe: `orc_shaman` (6 Habilidades)

| Slot | Habilidade | ID | Elemento | Função | Duração | Orçamento Partículas | Cooldown |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---:|
| Slot 1 | **Totem de Chamas** | `flame_totem` | Fire | buff | 450 ms | 45 max | 4s |
| Slot 2 | **Cântico de Guerra** | `war_chant` | Fire | buff | 490 ms | 55 max | 5s |
| Slot 3 | **Raio de Brasa** | `ember_bolt` | Fire | burst | 530 ms | 65 max | 6s |
| Slot 4 | **Solo Escaldante** | `scorching_ground` | Fire | area | 570 ms | 75 max | 7s |
| **Lv80 Ult** | **Apocalypse Totem** | `apocalypse_totem` | Fire | buff | 1100 ms | 160 max | 25s |
| **Lv90 Master** | **Master: Apocalypse Totem** | `master_apocalypse_totem` | Fire | buff | 1500 ms | 220 max | 40s |

##### Detalhes: `flame_totem` (Totem de Chamas)
- **Descrição:** Totem de Chamas — Habilidade Especialista de orc_shaman.
- **Multiplicador de Dano:** 1.4x | **Stagger:** 25 | **Crítico:** 1.4x
- **Armas Requeridas:** `totem, staff, blunt`
- **Game Feel:** Shake 0.25 (decaimento 1.8) | Hit-Stop: 50ms
- **Assinatura VFX:** `vfx_sig_orc_shaman_flame_totem_0` | **PoolKey:** `pool_flame_totem`

##### Detalhes: `war_chant` (Cântico de Guerra)
- **Descrição:** Cântico de Guerra — Habilidade Especialista de orc_shaman.
- **Multiplicador de Dano:** 1.5999999999999999x | **Stagger:** 33 | **Crítico:** 1.5x
- **Armas Requeridas:** `totem, staff, blunt`
- **Game Feel:** Shake 0.33 (decaimento 1.8) | Hit-Stop: 60ms
- **Assinatura VFX:** `vfx_sig_orc_shaman_war_chant_1` | **PoolKey:** `pool_war_chant`

##### Detalhes: `ember_bolt` (Raio de Brasa)
- **Descrição:** Raio de Brasa — Habilidade Especialista de orc_shaman.
- **Multiplicador de Dano:** 1.7999999999999998x | **Stagger:** 41 | **Crítico:** 1.5999999999999999x
- **Armas Requeridas:** `totem, staff, blunt`
- **Game Feel:** Shake 0.41000000000000003 (decaimento 1.8) | Hit-Stop: 70ms
- **Assinatura VFX:** `vfx_sig_orc_shaman_ember_bolt_2` | **PoolKey:** `pool_ember_bolt`

##### Detalhes: `scorching_ground` (Solo Escaldante)
- **Descrição:** Solo Escaldante — Habilidade Especialista de orc_shaman.
- **Multiplicador de Dano:** 2x | **Stagger:** 49 | **Crítico:** 1.7x
- **Armas Requeridas:** `totem, staff, blunt`
- **Game Feel:** Shake 0.49 (decaimento 1.8) | Hit-Stop: 80ms
- **Assinatura VFX:** `vfx_sig_orc_shaman_scorching_ground_3` | **PoolKey:** `pool_scorching_ground`

##### Detalhes: `apocalypse_totem` (Apocalypse Totem)
- **Descrição:** Apocalypse Totem — Habilidade Ultimate (★★★★) de orc_shaman.
- **Multiplicador de Dano:** 3.6x | **Stagger:** 100 | **Crítico:** 2x
- **Armas Requeridas:** `totem, staff, blunt`
- **Game Feel:** Shake 0.8 (decaimento 1.8) | Hit-Stop: 120ms
- **Assinatura VFX:** `vfx_sig_orc_shaman_apocalypse_totem_4` | **PoolKey:** `pool_apocalypse_totem`

##### Detalhes: `master_apocalypse_totem` (Master: Apocalypse Totem)
- **Descrição:** Master: Apocalypse Totem — Habilidade Master Ultimate (★★★★★) de orc_shaman.
- **Multiplicador de Dano:** 5.2x | **Stagger:** 180 | **Crítico:** 2.5x
- **Armas Requeridas:** `totem, staff, blunt`
- **Game Feel:** Shake 1 (decaimento 1.8) | Hit-Stop: 160ms
- **Assinatura VFX:** `vfx_sig_orc_shaman_master_apocalypse_totem_5` | **PoolKey:** `pool_master_apocalypse_totem`


### SEÇÃO 28: ORC VANGUARD RIDER

#### Classe: `orc_vanguard_rider` (6 Habilidades)

| Slot | Habilidade | ID | Elemento | Função | Duração | Orçamento Partículas | Cooldown |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---:|
| Slot 1 | **Investida Flamejante** | `flaming_charge` | Physical | mobility | 450 ms | 45 max | 4s |
| Slot 2 | **Lança de Brasas** | `spear_of_embers` | Physical | burst | 490 ms | 55 max | 5s |
| Slot 3 | **Atropelamento** | `trample` | Physical | control | 530 ms | 65 max | 6s |
| Slot 4 | **Lança de Fogo Selvagem** | `wildfire_lance` | Fire | finisher | 570 ms | 75 max | 7s |
| **Lv80 Ult** | **Inferno Charge** | `inferno_charge` | Physical | mobility | 1100 ms | 160 max | 25s |
| **Lv90 Master** | **Master: Inferno Charge** | `master_inferno_charge` | Physical | mobility | 1500 ms | 220 max | 40s |

##### Detalhes: `flaming_charge` (Investida Flamejante)
- **Descrição:** Investida Flamejante — Habilidade Especialista de orc_vanguard_rider.
- **Multiplicador de Dano:** 1.4x | **Stagger:** 25 | **Crítico:** 1.4x
- **Armas Requeridas:** `spear, lance, blunt`
- **Game Feel:** Shake 0.25 (decaimento 1.8) | Hit-Stop: 50ms
- **Assinatura VFX:** `vfx_sig_orc_vanguard_rider_flaming_charge_0` | **PoolKey:** `pool_flaming_charge`

##### Detalhes: `spear_of_embers` (Lança de Brasas)
- **Descrição:** Lança de Brasas — Habilidade Especialista de orc_vanguard_rider.
- **Multiplicador de Dano:** 1.5999999999999999x | **Stagger:** 33 | **Crítico:** 1.5x
- **Armas Requeridas:** `spear, lance, blunt`
- **Game Feel:** Shake 0.33 (decaimento 1.8) | Hit-Stop: 60ms
- **Assinatura VFX:** `vfx_sig_orc_vanguard_rider_spear_of_embers_1` | **PoolKey:** `pool_spear_of_embers`

##### Detalhes: `trample` (Atropelamento)
- **Descrição:** Atropelamento — Habilidade Especialista de orc_vanguard_rider.
- **Multiplicador de Dano:** 1.7999999999999998x | **Stagger:** 41 | **Crítico:** 1.5999999999999999x
- **Armas Requeridas:** `spear, lance, blunt`
- **Game Feel:** Shake 0.41000000000000003 (decaimento 1.8) | Hit-Stop: 70ms
- **Assinatura VFX:** `vfx_sig_orc_vanguard_rider_trample_2` | **PoolKey:** `pool_trample`

##### Detalhes: `wildfire_lance` (Lança de Fogo Selvagem)
- **Descrição:** Lança de Fogo Selvagem — Habilidade Especialista de orc_vanguard_rider.
- **Multiplicador de Dano:** 2x | **Stagger:** 49 | **Crítico:** 1.7x
- **Armas Requeridas:** `spear, lance, blunt`
- **Game Feel:** Shake 0.49 (decaimento 1.8) | Hit-Stop: 80ms
- **Assinatura VFX:** `vfx_sig_orc_vanguard_rider_wildfire_lance_3` | **PoolKey:** `pool_wildfire_lance`

##### Detalhes: `inferno_charge` (Inferno Charge)
- **Descrição:** Inferno Charge — Habilidade Ultimate (★★★★) de orc_vanguard_rider.
- **Multiplicador de Dano:** 3.6x | **Stagger:** 100 | **Crítico:** 2x
- **Armas Requeridas:** `spear, lance, blunt`
- **Game Feel:** Shake 0.8 (decaimento 1.8) | Hit-Stop: 120ms
- **Assinatura VFX:** `vfx_sig_orc_vanguard_rider_inferno_charge_4` | **PoolKey:** `pool_inferno_charge`

##### Detalhes: `master_inferno_charge` (Master: Inferno Charge)
- **Descrição:** Master: Inferno Charge — Habilidade Master Ultimate (★★★★★) de orc_vanguard_rider.
- **Multiplicador de Dano:** 5.2x | **Stagger:** 180 | **Crítico:** 2.5x
- **Armas Requeridas:** `spear, lance, blunt`
- **Game Feel:** Shake 1 (decaimento 1.8) | Hit-Stop: 160ms
- **Assinatura VFX:** `vfx_sig_orc_vanguard_rider_master_inferno_charge_5` | **PoolKey:** `pool_master_inferno_charge`


### SEÇÃO 29: DWARF ARTISAN & DWARF MAGE

#### Classe: `dwarf_artisan` (6 Habilidades)

| Slot | Habilidade | ID | Elemento | Função | Duração | Orçamento Partículas | Cooldown |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---:|
| Slot 1 | **Martelada** | `hammer_slam` | Earth | burst | 450 ms | 45 max | 4s |
| Slot 2 | **Invocar Construto** | `construct_summon` | Earth | buff | 490 ms | 55 max | 5s |
| Slot 3 | **Blindagem Reforçada** | `reinforced_plating` | Metal | tank | 530 ms | 65 max | 6s |
| Slot 4 | **Atordoamento Sísmico** | `seismic_stun` | Earth | control | 570 ms | 75 max | 7s |
| **Lv80 Ult** | **Forge Colossus** | `forge_colossus` | Earth | damage | 1100 ms | 160 max | 25s |
| **Lv90 Master** | **Master: Forge Colossus** | `master_forge_colossus` | Earth | damage | 1500 ms | 220 max | 40s |

##### Detalhes: `hammer_slam` (Martelada)
- **Descrição:** Martelada — Habilidade Especialista de dwarf_artisan.
- **Multiplicador de Dano:** 1.4x | **Stagger:** 25 | **Crítico:** 1.4x
- **Armas Requeridas:** `hammer, blunt, wrench`
- **Game Feel:** Shake 0.25 (decaimento 1.8) | Hit-Stop: 50ms
- **Assinatura VFX:** `vfx_sig_dwarf_artisan_hammer_slam_0` | **PoolKey:** `pool_hammer_slam`

##### Detalhes: `construct_summon` (Invocar Construto)
- **Descrição:** Invocar Construto — Habilidade Especialista de dwarf_artisan.
- **Multiplicador de Dano:** 1.5999999999999999x | **Stagger:** 33 | **Crítico:** 1.5x
- **Armas Requeridas:** `hammer, blunt, wrench`
- **Game Feel:** Shake 0.33 (decaimento 1.8) | Hit-Stop: 60ms
- **Assinatura VFX:** `vfx_sig_dwarf_artisan_construct_summon_1` | **PoolKey:** `pool_construct_summon`

##### Detalhes: `reinforced_plating` (Blindagem Reforçada)
- **Descrição:** Blindagem Reforçada — Habilidade Especialista de dwarf_artisan.
- **Multiplicador de Dano:** 1.7999999999999998x | **Stagger:** 41 | **Crítico:** 1.5999999999999999x
- **Armas Requeridas:** `hammer, blunt, wrench`
- **Game Feel:** Shake 0.41000000000000003 (decaimento 1.8) | Hit-Stop: 70ms
- **Assinatura VFX:** `vfx_sig_dwarf_artisan_reinforced_plating_2` | **PoolKey:** `pool_reinforced_plating`

##### Detalhes: `seismic_stun` (Atordoamento Sísmico)
- **Descrição:** Atordoamento Sísmico — Habilidade Especialista de dwarf_artisan.
- **Multiplicador de Dano:** 2x | **Stagger:** 49 | **Crítico:** 1.7x
- **Armas Requeridas:** `hammer, blunt, wrench`
- **Game Feel:** Shake 0.49 (decaimento 1.8) | Hit-Stop: 80ms
- **Assinatura VFX:** `vfx_sig_dwarf_artisan_seismic_stun_3` | **PoolKey:** `pool_seismic_stun`

##### Detalhes: `forge_colossus` (Forge Colossus)
- **Descrição:** Forge Colossus — Habilidade Ultimate (★★★★) de dwarf_artisan.
- **Multiplicador de Dano:** 3.6x | **Stagger:** 100 | **Crítico:** 2x
- **Armas Requeridas:** `hammer, blunt, wrench`
- **Game Feel:** Shake 0.8 (decaimento 1.8) | Hit-Stop: 120ms
- **Assinatura VFX:** `vfx_sig_dwarf_artisan_forge_colossus_4` | **PoolKey:** `pool_forge_colossus`

##### Detalhes: `master_forge_colossus` (Master: Forge Colossus)
- **Descrição:** Master: Forge Colossus — Habilidade Master Ultimate (★★★★★) de dwarf_artisan.
- **Multiplicador de Dano:** 5.2x | **Stagger:** 180 | **Crítico:** 2.5x
- **Armas Requeridas:** `hammer, blunt, wrench`
- **Game Feel:** Shake 1 (decaimento 1.8) | Hit-Stop: 160ms
- **Assinatura VFX:** `vfx_sig_dwarf_artisan_master_forge_colossus_5` | **PoolKey:** `pool_master_forge_colossus`

#### Classe: `dwarf_mage` (6 Habilidades)

| Slot | Habilidade | ID | Elemento | Função | Duração | Orçamento Partículas | Cooldown |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---:|
| Slot 1 | **Terremoto** | `terremoto` | Earth | area | 450 ms | 45 max | 4s |
| Slot 2 | **Rochedo** | `rochedo` | Earth | burst | 490 ms | 55 max | 5s |
| Slot 3 | **Golem de Metal** | `golem_de_metal` | Metal | buff | 530 ms | 65 max | 6s |
| Slot 4 | **Garra Metálica** | `garra_metalica` | Metal | burst | 570 ms | 75 max | 7s |
| **Lv80 Ult** | **Earthforge Cataclysm** | `earthforge_cataclysm` | Earth | area | 1100 ms | 160 max | 25s |
| **Lv90 Master** | **Master: Earthforge Cataclysm** | `master_earthforge_cataclysm` | Earth | area | 1500 ms | 220 max | 40s |

##### Detalhes: `terremoto` (Terremoto)
- **Descrição:** Terremoto — Habilidade Especialista de dwarf_mage.
- **Multiplicador de Dano:** 1.4x | **Stagger:** 25 | **Crítico:** 1.4x
- **Armas Requeridas:** `earth_staff, hammer, blunt`
- **Game Feel:** Shake 0.25 (decaimento 1.8) | Hit-Stop: 50ms
- **Assinatura VFX:** `vfx_sig_dwarf_mage_terremoto_0` | **PoolKey:** `pool_terremoto`

##### Detalhes: `rochedo` (Rochedo)
- **Descrição:** Rochedo — Habilidade Especialista de dwarf_mage.
- **Multiplicador de Dano:** 1.5999999999999999x | **Stagger:** 33 | **Crítico:** 1.5x
- **Armas Requeridas:** `earth_staff, hammer, blunt`
- **Game Feel:** Shake 0.33 (decaimento 1.8) | Hit-Stop: 60ms
- **Assinatura VFX:** `vfx_sig_dwarf_mage_rochedo_1` | **PoolKey:** `pool_rochedo`

##### Detalhes: `golem_de_metal` (Golem de Metal)
- **Descrição:** Golem de Metal — Habilidade Especialista de dwarf_mage.
- **Multiplicador de Dano:** 1.7999999999999998x | **Stagger:** 41 | **Crítico:** 1.5999999999999999x
- **Armas Requeridas:** `earth_staff, hammer, blunt`
- **Game Feel:** Shake 0.41000000000000003 (decaimento 1.8) | Hit-Stop: 70ms
- **Assinatura VFX:** `vfx_sig_dwarf_mage_golem_de_metal_2` | **PoolKey:** `pool_golem_de_metal`

##### Detalhes: `garra_metalica` (Garra Metálica)
- **Descrição:** Garra Metálica — Habilidade Especialista de dwarf_mage.
- **Multiplicador de Dano:** 2x | **Stagger:** 49 | **Crítico:** 1.7x
- **Armas Requeridas:** `earth_staff, hammer, blunt`
- **Game Feel:** Shake 0.49 (decaimento 1.8) | Hit-Stop: 80ms
- **Assinatura VFX:** `vfx_sig_dwarf_mage_garra_metalica_3` | **PoolKey:** `pool_garra_metalica`

##### Detalhes: `earthforge_cataclysm` (Earthforge Cataclysm)
- **Descrição:** Earthforge Cataclysm — Habilidade Ultimate (★★★★) de dwarf_mage.
- **Multiplicador de Dano:** 3.6x | **Stagger:** 100 | **Crítico:** 2x
- **Armas Requeridas:** `earth_staff, hammer, blunt`
- **Game Feel:** Shake 0.8 (decaimento 1.8) | Hit-Stop: 120ms
- **Assinatura VFX:** `vfx_sig_dwarf_mage_earthforge_cataclysm_4` | **PoolKey:** `pool_earthforge_cataclysm`

##### Detalhes: `master_earthforge_cataclysm` (Master: Earthforge Cataclysm)
- **Descrição:** Master: Earthforge Cataclysm — Habilidade Master Ultimate (★★★★★) de dwarf_mage.
- **Multiplicador de Dano:** 5.2x | **Stagger:** 180 | **Crítico:** 2.5x
- **Armas Requeridas:** `earth_staff, hammer, blunt`
- **Game Feel:** Shake 1 (decaimento 1.8) | Hit-Stop: 160ms
- **Assinatura VFX:** `vfx_sig_dwarf_mage_master_earthforge_cataclysm_5` | **PoolKey:** `pool_master_earthforge_cataclysm`


### SEÇÃO 30: DWARF SHINEMAKER

#### Classe: `dwarf_shinemaker` (6 Habilidades)

| Slot | Habilidade | ID | Elemento | Função | Duração | Orçamento Partículas | Cooldown |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---:|
| Slot 1 | **Martelo Radiante** | `radiant_hammer` | Holy | burst | 450 ms | 45 max | 4s |
| Slot 2 | **Luz Guia** | `guiding_light` | Holy | buff | 490 ms | 55 max | 5s |
| Slot 3 | **Forja Celestial** | `celestial_forge` | Holy | buff | 530 ms | 65 max | 6s |
| Slot 4 | **Golpe do Sol Poente** | `sunfall_smash` | Holy | finisher | 570 ms | 75 max | 7s |
| **Lv80 Ult** | **Divine Forge** | `divine_forge` | Holy | buff | 1100 ms | 160 max | 25s |
| **Lv90 Master** | **Master: Divine Forge** | `master_divine_forge` | Holy | buff | 1500 ms | 220 max | 40s |

##### Detalhes: `radiant_hammer` (Martelo Radiante)
- **Descrição:** Martelo Radiante — Habilidade Especialista de dwarf_shinemaker.
- **Multiplicador de Dano:** 1.4x | **Stagger:** 25 | **Crítico:** 1.4x
- **Armas Requeridas:** `radiant_hammer, shield, blunt`
- **Game Feel:** Shake 0.25 (decaimento 1.8) | Hit-Stop: 50ms
- **Assinatura VFX:** `vfx_sig_dwarf_shinemaker_radiant_hammer_0` | **PoolKey:** `pool_radiant_hammer`

##### Detalhes: `guiding_light` (Luz Guia)
- **Descrição:** Luz Guia — Habilidade Especialista de dwarf_shinemaker.
- **Multiplicador de Dano:** 1.5999999999999999x | **Stagger:** 33 | **Crítico:** 1.5x
- **Armas Requeridas:** `radiant_hammer, shield, blunt`
- **Game Feel:** Shake 0.33 (decaimento 1.8) | Hit-Stop: 60ms
- **Assinatura VFX:** `vfx_sig_dwarf_shinemaker_guiding_light_1` | **PoolKey:** `pool_guiding_light`

##### Detalhes: `celestial_forge` (Forja Celestial)
- **Descrição:** Forja Celestial — Habilidade Especialista de dwarf_shinemaker.
- **Multiplicador de Dano:** 1.7999999999999998x | **Stagger:** 41 | **Crítico:** 1.5999999999999999x
- **Armas Requeridas:** `radiant_hammer, shield, blunt`
- **Game Feel:** Shake 0.41000000000000003 (decaimento 1.8) | Hit-Stop: 70ms
- **Assinatura VFX:** `vfx_sig_dwarf_shinemaker_celestial_forge_2` | **PoolKey:** `pool_celestial_forge`

##### Detalhes: `sunfall_smash` (Golpe do Sol Poente)
- **Descrição:** Golpe do Sol Poente — Habilidade Especialista de dwarf_shinemaker.
- **Multiplicador de Dano:** 2x | **Stagger:** 49 | **Crítico:** 1.7x
- **Armas Requeridas:** `radiant_hammer, shield, blunt`
- **Game Feel:** Shake 0.49 (decaimento 1.8) | Hit-Stop: 80ms
- **Assinatura VFX:** `vfx_sig_dwarf_shinemaker_sunfall_smash_3` | **PoolKey:** `pool_sunfall_smash`

##### Detalhes: `divine_forge` (Divine Forge)
- **Descrição:** Divine Forge — Habilidade Ultimate (★★★★) de dwarf_shinemaker.
- **Multiplicador de Dano:** 3.6x | **Stagger:** 100 | **Crítico:** 2x
- **Armas Requeridas:** `radiant_hammer, shield, blunt`
- **Game Feel:** Shake 0.8 (decaimento 1.8) | Hit-Stop: 120ms
- **Assinatura VFX:** `vfx_sig_dwarf_shinemaker_divine_forge_4` | **PoolKey:** `pool_divine_forge`

##### Detalhes: `master_divine_forge` (Master: Divine Forge)
- **Descrição:** Master: Divine Forge — Habilidade Master Ultimate (★★★★★) de dwarf_shinemaker.
- **Multiplicador de Dano:** 5.2x | **Stagger:** 180 | **Crítico:** 2.5x
- **Armas Requeridas:** `radiant_hammer, shield, blunt`
- **Game Feel:** Shake 1 (decaimento 1.8) | Hit-Stop: 160ms
- **Assinatura VFX:** `vfx_sig_dwarf_shinemaker_master_divine_forge_5` | **PoolKey:** `pool_master_divine_forge`


### SEÇÃO 31: KAMAEL SOULBREAKER & KAMAEL SAMURAI

#### Classe: `kamael_soulbreaker` (6 Habilidades)

| Slot | Habilidade | ID | Elemento | Função | Duração | Orçamento Partículas | Cooldown |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---:|
| Slot 1 | **Ruptura da Alma** | `soul_rend` | Dark | burst | 450 ms | 45 max | 4s |
| Slot 2 | **Perfuração Abissal** | `abyssal_pierce` | Dark | burst | 490 ms | 55 max | 5s |
| Slot 3 | **Dreno de Essência** | `essence_drain` | Dark | heal | 530 ms | 65 max | 6s |
| Slot 4 | **Marca Sombria** | `shadowmark` | Dark | debuff | 570 ms | 75 max | 7s |
| **Lv80 Ult** | **Soul Devastation** | `soul_devastation` | Dark | heal | 1100 ms | 160 max | 25s |
| **Lv90 Master** | **Master: Soul Devastation** | `master_soul_devastation` | Dark | heal | 1500 ms | 220 max | 40s |

##### Detalhes: `soul_rend` (Ruptura da Alma)
- **Descrição:** Ruptura da Alma — Habilidade Especialista de kamael_soulbreaker.
- **Multiplicador de Dano:** 1.4x | **Stagger:** 25 | **Crítico:** 1.4x
- **Armas Requeridas:** `rapier, ancient_sword`
- **Game Feel:** Shake 0.25 (decaimento 1.8) | Hit-Stop: 50ms
- **Assinatura VFX:** `vfx_sig_kamael_soulbreaker_soul_rend_0` | **PoolKey:** `pool_soul_rend`

##### Detalhes: `abyssal_pierce` (Perfuração Abissal)
- **Descrição:** Perfuração Abissal — Habilidade Especialista de kamael_soulbreaker.
- **Multiplicador de Dano:** 1.5999999999999999x | **Stagger:** 33 | **Crítico:** 1.5x
- **Armas Requeridas:** `rapier, ancient_sword`
- **Game Feel:** Shake 0.33 (decaimento 1.8) | Hit-Stop: 60ms
- **Assinatura VFX:** `vfx_sig_kamael_soulbreaker_abyssal_pierce_1` | **PoolKey:** `pool_abyssal_pierce`

##### Detalhes: `essence_drain` (Dreno de Essência)
- **Descrição:** Dreno de Essência — Habilidade Especialista de kamael_soulbreaker.
- **Multiplicador de Dano:** 1.7999999999999998x | **Stagger:** 41 | **Crítico:** 1.5999999999999999x
- **Armas Requeridas:** `rapier, ancient_sword`
- **Game Feel:** Shake 0.41000000000000003 (decaimento 1.8) | Hit-Stop: 70ms
- **Assinatura VFX:** `vfx_sig_kamael_soulbreaker_essence_drain_2` | **PoolKey:** `pool_essence_drain`

##### Detalhes: `shadowmark` (Marca Sombria)
- **Descrição:** Marca Sombria — Habilidade Especialista de kamael_soulbreaker.
- **Multiplicador de Dano:** 2x | **Stagger:** 49 | **Crítico:** 1.7x
- **Armas Requeridas:** `rapier, ancient_sword`
- **Game Feel:** Shake 0.49 (decaimento 1.8) | Hit-Stop: 80ms
- **Assinatura VFX:** `vfx_sig_kamael_soulbreaker_shadowmark_3` | **PoolKey:** `pool_shadowmark`

##### Detalhes: `soul_devastation` (Soul Devastation)
- **Descrição:** Soul Devastation — Habilidade Ultimate (★★★★) de kamael_soulbreaker.
- **Multiplicador de Dano:** 3.6x | **Stagger:** 100 | **Crítico:** 2x
- **Armas Requeridas:** `rapier, ancient_sword`
- **Game Feel:** Shake 0.8 (decaimento 1.8) | Hit-Stop: 120ms
- **Assinatura VFX:** `vfx_sig_kamael_soulbreaker_soul_devastation_4` | **PoolKey:** `pool_soul_devastation`

##### Detalhes: `master_soul_devastation` (Master: Soul Devastation)
- **Descrição:** Master: Soul Devastation — Habilidade Master Ultimate (★★★★★) de kamael_soulbreaker.
- **Multiplicador de Dano:** 5.2x | **Stagger:** 180 | **Crítico:** 2.5x
- **Armas Requeridas:** `rapier, ancient_sword`
- **Game Feel:** Shake 1 (decaimento 1.8) | Hit-Stop: 160ms
- **Assinatura VFX:** `vfx_sig_kamael_soulbreaker_master_soul_devastation_5` | **PoolKey:** `pool_master_soul_devastation`

#### Classe: `kamael_samurai` (6 Habilidades)

| Slot | Habilidade | ID | Elemento | Função | Duração | Orçamento Partículas | Cooldown |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---:|
| Slot 1 | **Golpe Iaijutsu** | `iaijutsu_strike` | Physical | burst | 450 ms | 45 max | 4s |
| Slot 2 | **Passo de Rajada** | `gale_step` | Wind | mobility | 490 ms | 55 max | 5s |
| Slot 3 | **Fio Silencioso** | `silent_edge` | Physical | burst | 530 ms | 65 max | 6s |
| Slot 4 | **Forma da Tempestade** | `tempest_form` | Wind | buff | 570 ms | 75 max | 7s |
| **Lv80 Ult** | **Heaven-Cutting Tempest** | `heaven_cutting_tempest` | Physical | burst | 1100 ms | 160 max | 25s |
| **Lv90 Master** | **Master: Heaven-Cutting Tempest** | `master_heaven_cutting_tempest` | Physical | burst | 1500 ms | 220 max | 40s |

##### Detalhes: `iaijutsu_strike` (Golpe Iaijutsu)
- **Descrição:** Golpe Iaijutsu — Habilidade Especialista de kamael_samurai.
- **Multiplicador de Dano:** 1.4x | **Stagger:** 25 | **Crítico:** 1.4x
- **Armas Requeridas:** `katana, dual_swords`
- **Game Feel:** Shake 0.25 (decaimento 1.8) | Hit-Stop: 50ms
- **Assinatura VFX:** `vfx_sig_kamael_samurai_iaijutsu_strike_0` | **PoolKey:** `pool_iaijutsu_strike`

##### Detalhes: `gale_step` (Passo de Rajada)
- **Descrição:** Passo de Rajada — Habilidade Especialista de kamael_samurai.
- **Multiplicador de Dano:** 1.5999999999999999x | **Stagger:** 33 | **Crítico:** 1.5x
- **Armas Requeridas:** `katana, dual_swords`
- **Game Feel:** Shake 0.33 (decaimento 1.8) | Hit-Stop: 60ms
- **Assinatura VFX:** `vfx_sig_kamael_samurai_gale_step_1` | **PoolKey:** `pool_gale_step`

##### Detalhes: `silent_edge` (Fio Silencioso)
- **Descrição:** Fio Silencioso — Habilidade Especialista de kamael_samurai.
- **Multiplicador de Dano:** 1.7999999999999998x | **Stagger:** 41 | **Crítico:** 1.5999999999999999x
- **Armas Requeridas:** `katana, dual_swords`
- **Game Feel:** Shake 0.41000000000000003 (decaimento 1.8) | Hit-Stop: 70ms
- **Assinatura VFX:** `vfx_sig_kamael_samurai_silent_edge_2` | **PoolKey:** `pool_silent_edge`

##### Detalhes: `tempest_form` (Forma da Tempestade)
- **Descrição:** Forma da Tempestade — Habilidade Especialista de kamael_samurai.
- **Multiplicador de Dano:** 2x | **Stagger:** 49 | **Crítico:** 1.7x
- **Armas Requeridas:** `katana, dual_swords`
- **Game Feel:** Shake 0.49 (decaimento 1.8) | Hit-Stop: 80ms
- **Assinatura VFX:** `vfx_sig_kamael_samurai_tempest_form_3` | **PoolKey:** `pool_tempest_form`

##### Detalhes: `heaven_cutting_tempest` (Heaven-Cutting Tempest)
- **Descrição:** Heaven-Cutting Tempest — Habilidade Ultimate (★★★★) de kamael_samurai.
- **Multiplicador de Dano:** 3.6x | **Stagger:** 100 | **Crítico:** 2x
- **Armas Requeridas:** `katana, dual_swords`
- **Game Feel:** Shake 0.8 (decaimento 1.8) | Hit-Stop: 120ms
- **Assinatura VFX:** `vfx_sig_kamael_samurai_heaven_cutting_tempest_4` | **PoolKey:** `pool_heaven_cutting_tempest`

##### Detalhes: `master_heaven_cutting_tempest` (Master: Heaven-Cutting Tempest)
- **Descrição:** Master: Heaven-Cutting Tempest — Habilidade Master Ultimate (★★★★★) de kamael_samurai.
- **Multiplicador de Dano:** 5.2x | **Stagger:** 180 | **Crítico:** 2.5x
- **Armas Requeridas:** `katana, dual_swords`
- **Game Feel:** Shake 1 (decaimento 1.8) | Hit-Stop: 160ms
- **Assinatura VFX:** `vfx_sig_kamael_samurai_master_heaven_cutting_tempest_5` | **PoolKey:** `pool_master_heaven_cutting_tempest`


### SEÇÃO 32: ERTHEIA STORM BLASTER & ERTHEIA MARAUDER

#### Classe: `ertheia_storm_blaster` (6 Habilidades)

| Slot | Habilidade | ID | Elemento | Função | Duração | Orçamento Partículas | Cooldown |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---:|
| Slot 1 | **Disparo de Rajada** | `gale_shot` | Wind | burst | 450 ms | 45 max | 4s |
| Slot 2 | **Armadilha Ciclone** | `cyclone_trap` | Wind | control | 490 ms | 55 max | 5s |
| Slot 3 | **Dança dos Céus** | `sky_dance` | Wind | mobility | 530 ms | 65 max | 6s |
| Slot 4 | **Rajada de Tempestade** | `tempest_barrage` | Wind | area | 570 ms | 75 max | 7s |
| **Lv80 Ult** | **Cyclone Barrage** | `cyclone_barrage` | Wind | area | 1100 ms | 160 max | 25s |
| **Lv90 Master** | **Master: Cyclone Barrage** | `master_cyclone_barrage` | Wind | area | 1500 ms | 220 max | 40s |

##### Detalhes: `gale_shot` (Disparo de Rajada)
- **Descrição:** Disparo de Rajada — Habilidade Especialista de ertheia_storm_blaster.
- **Multiplicador de Dano:** 1.4x | **Stagger:** 25 | **Crítico:** 1.4x
- **Armas Requeridas:** `magic_cannon, fist, staff`
- **Game Feel:** Shake 0.25 (decaimento 1.8) | Hit-Stop: 50ms
- **Assinatura VFX:** `vfx_sig_ertheia_storm_blaster_gale_shot_0` | **PoolKey:** `pool_gale_shot`

##### Detalhes: `cyclone_trap` (Armadilha Ciclone)
- **Descrição:** Armadilha Ciclone — Habilidade Especialista de ertheia_storm_blaster.
- **Multiplicador de Dano:** 1.5999999999999999x | **Stagger:** 33 | **Crítico:** 1.5x
- **Armas Requeridas:** `magic_cannon, fist, staff`
- **Game Feel:** Shake 0.33 (decaimento 1.8) | Hit-Stop: 60ms
- **Assinatura VFX:** `vfx_sig_ertheia_storm_blaster_cyclone_trap_1` | **PoolKey:** `pool_cyclone_trap`

##### Detalhes: `sky_dance` (Dança dos Céus)
- **Descrição:** Dança dos Céus — Habilidade Especialista de ertheia_storm_blaster.
- **Multiplicador de Dano:** 1.7999999999999998x | **Stagger:** 41 | **Crítico:** 1.5999999999999999x
- **Armas Requeridas:** `magic_cannon, fist, staff`
- **Game Feel:** Shake 0.41000000000000003 (decaimento 1.8) | Hit-Stop: 70ms
- **Assinatura VFX:** `vfx_sig_ertheia_storm_blaster_sky_dance_2` | **PoolKey:** `pool_sky_dance`

##### Detalhes: `tempest_barrage` (Rajada de Tempestade)
- **Descrição:** Rajada de Tempestade — Habilidade Especialista de ertheia_storm_blaster.
- **Multiplicador de Dano:** 2x | **Stagger:** 49 | **Crítico:** 1.7x
- **Armas Requeridas:** `magic_cannon, fist, staff`
- **Game Feel:** Shake 0.49 (decaimento 1.8) | Hit-Stop: 80ms
- **Assinatura VFX:** `vfx_sig_ertheia_storm_blaster_tempest_barrage_3` | **PoolKey:** `pool_tempest_barrage`

##### Detalhes: `cyclone_barrage` (Cyclone Barrage)
- **Descrição:** Cyclone Barrage — Habilidade Ultimate (★★★★) de ertheia_storm_blaster.
- **Multiplicador de Dano:** 3.6x | **Stagger:** 100 | **Crítico:** 2x
- **Armas Requeridas:** `magic_cannon, fist, staff`
- **Game Feel:** Shake 0.8 (decaimento 1.8) | Hit-Stop: 120ms
- **Assinatura VFX:** `vfx_sig_ertheia_storm_blaster_cyclone_barrage_4` | **PoolKey:** `pool_cyclone_barrage`

##### Detalhes: `master_cyclone_barrage` (Master: Cyclone Barrage)
- **Descrição:** Master: Cyclone Barrage — Habilidade Master Ultimate (★★★★★) de ertheia_storm_blaster.
- **Multiplicador de Dano:** 5.2x | **Stagger:** 180 | **Crítico:** 2.5x
- **Armas Requeridas:** `magic_cannon, fist, staff`
- **Game Feel:** Shake 1 (decaimento 1.8) | Hit-Stop: 160ms
- **Assinatura VFX:** `vfx_sig_ertheia_storm_blaster_master_cyclone_barrage_5` | **PoolKey:** `pool_master_cyclone_barrage`

#### Classe: `ertheia_marauder` (6 Habilidades)

| Slot | Habilidade | ID | Elemento | Função | Duração | Orçamento Partículas | Cooldown |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---:|
| Slot 1 | **Investida Redemoinho** | `whirlwind_dash` | Wind | mobility | 450 ms | 45 max | 4s |
| Slot 2 | **Rajada Espiritual** | `spirit_gale` | Wind | burst | 490 ms | 55 max | 5s |
| Slot 3 | **Corte Duplo de Rajada** | `twin_gust_slash` | Wind | burst | 530 ms | 65 max | 6s |
| Slot 4 | **Véu da Tempestade** | `tempest_veil` | Wind | buff | 570 ms | 75 max | 7s |
| **Lv80 Ult** | **Tempest Breaker** | `tempest_breaker` | Wind | mobility | 1100 ms | 160 max | 25s |
| **Lv90 Master** | **Master: Tempest Breaker** | `master_tempest_breaker` | Wind | mobility | 1500 ms | 220 max | 40s |

##### Detalhes: `whirlwind_dash` (Investida Redemoinho)
- **Descrição:** Investida Redemoinho — Habilidade Especialista de ertheia_marauder.
- **Multiplicador de Dano:** 1.4x | **Stagger:** 25 | **Crítico:** 1.4x
- **Armas Requeridas:** `wind_daggers, fist, dual_swords`
- **Game Feel:** Shake 0.25 (decaimento 1.8) | Hit-Stop: 50ms
- **Assinatura VFX:** `vfx_sig_ertheia_marauder_whirlwind_dash_0` | **PoolKey:** `pool_whirlwind_dash`

##### Detalhes: `spirit_gale` (Rajada Espiritual)
- **Descrição:** Rajada Espiritual — Habilidade Especialista de ertheia_marauder.
- **Multiplicador de Dano:** 1.5999999999999999x | **Stagger:** 33 | **Crítico:** 1.5x
- **Armas Requeridas:** `wind_daggers, fist, dual_swords`
- **Game Feel:** Shake 0.33 (decaimento 1.8) | Hit-Stop: 60ms
- **Assinatura VFX:** `vfx_sig_ertheia_marauder_spirit_gale_1` | **PoolKey:** `pool_spirit_gale`

##### Detalhes: `twin_gust_slash` (Corte Duplo de Rajada)
- **Descrição:** Corte Duplo de Rajada — Habilidade Especialista de ertheia_marauder.
- **Multiplicador de Dano:** 1.7999999999999998x | **Stagger:** 41 | **Crítico:** 1.5999999999999999x
- **Armas Requeridas:** `wind_daggers, fist, dual_swords`
- **Game Feel:** Shake 0.41000000000000003 (decaimento 1.8) | Hit-Stop: 70ms
- **Assinatura VFX:** `vfx_sig_ertheia_marauder_twin_gust_slash_2` | **PoolKey:** `pool_twin_gust_slash`

##### Detalhes: `tempest_veil` (Véu da Tempestade)
- **Descrição:** Véu da Tempestade — Habilidade Especialista de ertheia_marauder.
- **Multiplicador de Dano:** 2x | **Stagger:** 49 | **Crítico:** 1.7x
- **Armas Requeridas:** `wind_daggers, fist, dual_swords`
- **Game Feel:** Shake 0.49 (decaimento 1.8) | Hit-Stop: 80ms
- **Assinatura VFX:** `vfx_sig_ertheia_marauder_tempest_veil_3` | **PoolKey:** `pool_tempest_veil`

##### Detalhes: `tempest_breaker` (Tempest Breaker)
- **Descrição:** Tempest Breaker — Habilidade Ultimate (★★★★) de ertheia_marauder.
- **Multiplicador de Dano:** 3.6x | **Stagger:** 100 | **Crítico:** 2x
- **Armas Requeridas:** `wind_daggers, fist, dual_swords`
- **Game Feel:** Shake 0.8 (decaimento 1.8) | Hit-Stop: 120ms
- **Assinatura VFX:** `vfx_sig_ertheia_marauder_tempest_breaker_4` | **PoolKey:** `pool_tempest_breaker`

##### Detalhes: `master_tempest_breaker` (Master: Tempest Breaker)
- **Descrição:** Master: Tempest Breaker — Habilidade Master Ultimate (★★★★★) de ertheia_marauder.
- **Multiplicador de Dano:** 5.2x | **Stagger:** 180 | **Crítico:** 2.5x
- **Armas Requeridas:** `wind_daggers, fist, dual_swords`
- **Game Feel:** Shake 1 (decaimento 1.8) | Hit-Stop: 160ms
- **Assinatura VFX:** `vfx_sig_ertheia_marauder_master_tempest_breaker_5` | **PoolKey:** `pool_master_tempest_breaker`


### SEÇÃO 33: HIGH ELF DIVINE TEMPLAR & HIGH ELF ELEMENT WEAVER

#### Classe: `high_elf_divine_templar` (6 Habilidades)

| Slot | Habilidade | ID | Elemento | Função | Duração | Orçamento Partículas | Cooldown |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---:|
| Slot 1 | **Baluarte Divino** | `divine_bulwark` | Holy | tank | 450 ms | 45 max | 4s |
| Slot 2 | **Labareda da Retribuição** | `retribution_flare` | Holy | burst | 490 ms | 55 max | 5s |
| Slot 3 | **Proteção Sagrada** | `sacred_ward` | Holy | tank | 530 ms | 65 max | 6s |
| Slot 4 | **Julgamento de Light Point** | `light_point_judgment` | Holy | finisher | 570 ms | 75 max | 7s |
| **Lv80 Ult** | **Heaven's Aegis** | `heavens_aegis` | Holy | tank | 1100 ms | 160 max | 25s |
| **Lv90 Master** | **Master: Heaven's Aegis** | `master_heavens_aegis` | Holy | tank | 1500 ms | 220 max | 40s |

##### Detalhes: `divine_bulwark` (Baluarte Divino)
- **Descrição:** Baluarte Divino — Habilidade Especialista de high_elf_divine_templar.
- **Multiplicador de Dano:** 1.4x | **Stagger:** 25 | **Crítico:** 1.4x
- **Armas Requeridas:** `divine_shield, sword, mace`
- **Game Feel:** Shake 0.25 (decaimento 1.8) | Hit-Stop: 50ms
- **Assinatura VFX:** `vfx_sig_high_elf_divine_templar_divine_bulwark_0` | **PoolKey:** `pool_divine_bulwark`

##### Detalhes: `retribution_flare` (Labareda da Retribuição)
- **Descrição:** Labareda da Retribuição — Habilidade Especialista de high_elf_divine_templar.
- **Multiplicador de Dano:** 1.5999999999999999x | **Stagger:** 33 | **Crítico:** 1.5x
- **Armas Requeridas:** `divine_shield, sword, mace`
- **Game Feel:** Shake 0.33 (decaimento 1.8) | Hit-Stop: 60ms
- **Assinatura VFX:** `vfx_sig_high_elf_divine_templar_retribution_flare_1` | **PoolKey:** `pool_retribution_flare`

##### Detalhes: `sacred_ward` (Proteção Sagrada)
- **Descrição:** Proteção Sagrada — Habilidade Especialista de high_elf_divine_templar.
- **Multiplicador de Dano:** 1.7999999999999998x | **Stagger:** 41 | **Crítico:** 1.5999999999999999x
- **Armas Requeridas:** `divine_shield, sword, mace`
- **Game Feel:** Shake 0.41000000000000003 (decaimento 1.8) | Hit-Stop: 70ms
- **Assinatura VFX:** `vfx_sig_high_elf_divine_templar_sacred_ward_2` | **PoolKey:** `pool_sacred_ward`

##### Detalhes: `light_point_judgment` (Julgamento de Light Point)
- **Descrição:** Julgamento de Light Point — Habilidade Especialista de high_elf_divine_templar.
- **Multiplicador de Dano:** 2x | **Stagger:** 49 | **Crítico:** 1.7x
- **Armas Requeridas:** `divine_shield, sword, mace`
- **Game Feel:** Shake 0.49 (decaimento 1.8) | Hit-Stop: 80ms
- **Assinatura VFX:** `vfx_sig_high_elf_divine_templar_light_point_judgment_3` | **PoolKey:** `pool_light_point_judgment`

##### Detalhes: `heavens_aegis` (Heaven's Aegis)
- **Descrição:** Heaven's Aegis — Habilidade Ultimate (★★★★) de high_elf_divine_templar.
- **Multiplicador de Dano:** 3.6x | **Stagger:** 100 | **Crítico:** 2x
- **Armas Requeridas:** `divine_shield, sword, mace`
- **Game Feel:** Shake 0.8 (decaimento 1.8) | Hit-Stop: 120ms
- **Assinatura VFX:** `vfx_sig_high_elf_divine_templar_heavens_aegis_4` | **PoolKey:** `pool_heavens_aegis`

##### Detalhes: `master_heavens_aegis` (Master: Heaven's Aegis)
- **Descrição:** Master: Heaven's Aegis — Habilidade Master Ultimate (★★★★★) de high_elf_divine_templar.
- **Multiplicador de Dano:** 5.2x | **Stagger:** 180 | **Crítico:** 2.5x
- **Armas Requeridas:** `divine_shield, sword, mace`
- **Game Feel:** Shake 1 (decaimento 1.8) | Hit-Stop: 160ms
- **Assinatura VFX:** `vfx_sig_high_elf_divine_templar_master_heavens_aegis_5` | **PoolKey:** `pool_master_heavens_aegis`

#### Classe: `high_elf_element_weaver` (6 Habilidades)

| Slot | Habilidade | ID | Elemento | Função | Duração | Orçamento Partículas | Cooldown |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---:|
| Slot 1 | **Combo da Tríade** | `triad_combo` | Fire | burst | 450 ms | 45 max | 4s |
| Slot 2 | **Fusão Elemental** | `elemental_fusion` | Fire | area | 490 ms | 55 max | 5s |
| Slot 3 | **Tempestade em Cascata** | `cascading_storm` | Water | area | 530 ms | 65 max | 6s |
| Slot 4 | **Maré da Fênix** | `phoenix_tide` | Fire | finisher | 570 ms | 75 max | 7s |
| **Lv80 Ult** | **Prismatic Genesis** | `prismatic_genesis` | Fire | area | 1100 ms | 160 max | 25s |
| **Lv90 Master** | **Master: Prismatic Genesis** | `master_prismatic_genesis` | Fire | area | 1500 ms | 220 max | 40s |

##### Detalhes: `triad_combo` (Combo da Tríade)
- **Descrição:** Combo da Tríade — Habilidade Especialista de high_elf_element_weaver.
- **Multiplicador de Dano:** 1.4x | **Stagger:** 25 | **Crítico:** 1.4x
- **Armas Requeridas:** `prism_staff, orb, wand`
- **Game Feel:** Shake 0.25 (decaimento 1.8) | Hit-Stop: 50ms
- **Assinatura VFX:** `vfx_sig_high_elf_element_weaver_triad_combo_0` | **PoolKey:** `pool_triad_combo`

##### Detalhes: `elemental_fusion` (Fusão Elemental)
- **Descrição:** Fusão Elemental — Habilidade Especialista de high_elf_element_weaver.
- **Multiplicador de Dano:** 1.5999999999999999x | **Stagger:** 33 | **Crítico:** 1.5x
- **Armas Requeridas:** `prism_staff, orb, wand`
- **Game Feel:** Shake 0.33 (decaimento 1.8) | Hit-Stop: 60ms
- **Assinatura VFX:** `vfx_sig_high_elf_element_weaver_elemental_fusion_1` | **PoolKey:** `pool_elemental_fusion`

##### Detalhes: `cascading_storm` (Tempestade em Cascata)
- **Descrição:** Tempestade em Cascata — Habilidade Especialista de high_elf_element_weaver.
- **Multiplicador de Dano:** 1.7999999999999998x | **Stagger:** 41 | **Crítico:** 1.5999999999999999x
- **Armas Requeridas:** `prism_staff, orb, wand`
- **Game Feel:** Shake 0.41000000000000003 (decaimento 1.8) | Hit-Stop: 70ms
- **Assinatura VFX:** `vfx_sig_high_elf_element_weaver_cascading_storm_2` | **PoolKey:** `pool_cascading_storm`

##### Detalhes: `phoenix_tide` (Maré da Fênix)
- **Descrição:** Maré da Fênix — Habilidade Especialista de high_elf_element_weaver.
- **Multiplicador de Dano:** 2x | **Stagger:** 49 | **Crítico:** 1.7x
- **Armas Requeridas:** `prism_staff, orb, wand`
- **Game Feel:** Shake 0.49 (decaimento 1.8) | Hit-Stop: 80ms
- **Assinatura VFX:** `vfx_sig_high_elf_element_weaver_phoenix_tide_3` | **PoolKey:** `pool_phoenix_tide`

##### Detalhes: `prismatic_genesis` (Prismatic Genesis)
- **Descrição:** Prismatic Genesis — Habilidade Ultimate (★★★★) de high_elf_element_weaver.
- **Multiplicador de Dano:** 3.6x | **Stagger:** 100 | **Crítico:** 2x
- **Armas Requeridas:** `prism_staff, orb, wand`
- **Game Feel:** Shake 0.8 (decaimento 1.8) | Hit-Stop: 120ms
- **Assinatura VFX:** `vfx_sig_high_elf_element_weaver_prismatic_genesis_4` | **PoolKey:** `pool_prismatic_genesis`

##### Detalhes: `master_prismatic_genesis` (Master: Prismatic Genesis)
- **Descrição:** Master: Prismatic Genesis — Habilidade Master Ultimate (★★★★★) de high_elf_element_weaver.
- **Multiplicador de Dano:** 5.2x | **Stagger:** 180 | **Crítico:** 2.5x
- **Armas Requeridas:** `prism_staff, orb, wand`
- **Game Feel:** Shake 1 (decaimento 1.8) | Hit-Stop: 160ms
- **Assinatura VFX:** `vfx_sig_high_elf_element_weaver_master_prismatic_genesis_5` | **PoolKey:** `pool_master_prismatic_genesis`

---

## SEÇÃO 34: GUIA DE IMPLEMENTAÇÃO, EXTENSÃO E TESTES AUTOMATIZADOS

### Suíte de Auditoria Automática
O projeto possui 4 auditores de conformidade contínua executáveis via `node --test`:

1. **`test/skill-schema.test.js`**: Validação estrutural de todas as habilidades contra `skill.schema.json` (9 seções obrigatórias).
2. **`test/all-skills-vfx-coverage.test.js`**: Garantia de 100% de cobertura de VFX, timelines e parâmetros de câmera.
3. **`test/skill-identity-auditor.test.js`**: Verificação da matriz elemental de 25 classes e progressão de estágios.
4. **`test/skill-performance.test.js`**: Garantia dos tetos de partículas (80 / 120 / 180 / 250), draw calls e pooling.

Comando de verificação completa:
```bash
node --test test/skill-schema.test.js test/all-skills-vfx-coverage.test.js test/skill-identity-auditor.test.js test/skill-performance.test.js
```

---
*Aden Arena Idle — 2D Combat Presentation Engine. Todos os direitos reservados.*
