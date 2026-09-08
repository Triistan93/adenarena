import fs from 'fs';
import path from 'path';

const races = ['human', 'elf', 'dark_elf', 'orc', 'dwarf', 'kamael', 'ertheia', 'high_elf'];

function loadAllSkills() {
  const classSkills = {};
  for (const r of races) {
    const dir = path.resolve('lineage-idle/src/data/skills', r);
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
    for (const f of files) {
      const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      classSkills[data.classId] = data.skills;
    }
  }
  return classSkills;
}

const allSkillsByClass = loadAllSkills();
const sharedData = JSON.parse(fs.readFileSync('lineage-idle/src/data/skills/shared/general-skills.json', 'utf8'));

let doc = `# ADEN ARENA IDLE — 2D COMBAT PRESENTATION & 150 SKILLS MASTER ARCHITECTURE

> **Documento Mestre de Referência Técnica, VFX Engine & Catálogo Completo de 150 Habilidades**
> **Versão:** 3.2.0 | **Jogo:** Aden Arena Idle (\`lineage-idle\`) | **Status:** 100% Homologado & Auditado

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

\`\`\`
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
\`\`\`

---

## SEÇÃO 2: REQUISITOS TÉCNICOS & PILHA TECNOLÓGICA

- **Runtime:** Node.js v20+ / Navegadores Evergreen (Chrome, Firefox, Safari, Edge).
- **Camada de Renderização:** WebGL acelerado via PixiJS v8 com fallback automático e gracioso para HTML5 Canvas 2D.
- **Taxa de Quadros Alvo:** 60 FPS estáveis (\`16.67 ms/frame\`).
- **Orçamento de Partículas por Frame:**
  - Habilidades Normais: $\\le 80$ partículas.
  - Habilidades Pesadas / Especialistas: $\\le 120$ partículas.
  - Habilidades Ultimate (Lv80): $\\le 180$ partículas.
  - Habilidades Master Ultimate (Lv90): $\\le 250$ partículas.
- **Chamadas de Desenho (Draw Calls):** $\\le 6$ em habilidades normais, $\\le 12$ no clímax de Master Ultimates.

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
  $$\\text{CD}_{\\text{final}} = \\text{CD}_{\\text{base}} \\times (1 - \\text{CDR}_{\\text{stats}})$$
- **Fórmula de Gasto de Mana:**
  $$\\text{MP}_{\\text{consumo}} = \\text{MP}_{\\text{base}} \\times (1 + (\\text{Nível da Skill} - 1) \\times 0.08)$$
- O motor previne conjurações concorrentes em ultimates de tela cheia (\`allowConcurrent: false\`), impedindo sobreposição caótica de efeitos e saturação da GPU.

---

## SEÇÃO 5: HITBOXES, ALVOS E ÁREAS DE EFEITO (AOE)

O motor suporta 6 geometrias de colisão e seleção de alvos com representação 2D exata:
1. \`point\`: Alvo único de alta precisão (ex: adagas, flechas perfurantes).
2. \`circle\`: Explosões radiais e auras centradas no alvo ou conjurador.
3. \`box\`: Investidas frontais e golpes de escudo.
4. \`line\`: Raios perfurantes e feixes celestiais.
5. \`cone\`: Arcos de espada e golpes ceifadores transversais.
6. \`screen\`: Impacto global presente em Master Ultimates (Lv90).

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
- **Anticipation (0 a 30%):** Windup, ativação da runa de solo, brilho de conjuração (\`castGlow\`), início do zoom punch.
- **Impact / Release (30% a 70%):** Disparo de partículas, onda de choque, hit-stop em tempo real, aplicação de dano e abalo de postura.
- **Recovery / Settle (70% a 100%):** Dissipação suave das partículas via amortecimento cúbico, restauração da iluminação ambiente e retorno da câmera ao repouso.

---

## SEÇÃO 8: EFEITOS DE HIT-STOP E IMPACT FRAMES

O hit-stop desacelera a velocidade de simulação (\`timeScale\`) para valores entre \`0.01\` e \`0.05\`. Para prevenir que loops e cronômetros fiquem eternamente parados, o \`CameraFX\` utiliza temporizadores em tempo real via \`performance.now()\`, garantindo retomada precisa mesmo com escala de tempo zerada.

---

## SEÇÃO 9: SCREEN SHAKE E TRAUMA DE CÂMERA

Baseado no modelo de trauma não-linear quadrático:
$$\\text{Shake} = \\text{Trauma}^2$$
$$\\text{Offset}_X = \\text{Max}_X \\times \\text{Shake} \\times \\sin(t \\times 1.73)$$
$$\\text{Offset}_Y = \\text{Max}_Y \\times \\text{Shake} \\times \\sin(t \\times 2.37)$$
O decaimento linear $(\\text{Trauma} - \\text{decay} \\times dt)$ assegura que a trepidação retorne suavemente a zero sem estalos ou movimentos estáticos desconfortáveis. Controles de acessibilidade permitem desativar ou calibrar a intensidade do efeito.

---

## SEÇÃO 10: ZOOM PUNCH, FOV E FEEDBACK CINEMATOGRÁFICO

Golpes críticos e ultimates acionam uma aproximação rápida de câmera (\`punchZoom\`) entre \`1.04x\` e \`1.12x\`. O retorno ao enquadramento padrão utiliza uma curva de suavização \`ease-out cubic\`:
$$f(t) = 1 - (1 - t)^3$$

---

## SEÇÃO 11: ILUMINAÇÃO DINÂMICA E FAKE LIGHTS

- **Ambient Dimming:** Durante Ultimates e Master Ultimates, o fundo da arena escurece em até 85% (\`rgba(0, 0, 0, 0.85)\`), criando contraste máximo para as partículas brilhantes.
- **Luzes Radiais Falsas:** Partículas e pontos de impacto emitem gradientes radiais desenhados em blend mode aditivo (\`lighter\` / \`add\`), simulando iluminação pontual de alto custo computacional com custo de renderização quase nulo.

---

## SEÇÃO 12: SISTEMA DE SHADERS (GLSL / PIXI FILTERS)

- **ShockwaveFilter:** Deslocamento radial com função senoidal que expande a partir do epicentro.
- **BloomFilter:** Passagem de brilho com extração de altas luzes e desfoque gaussiano acumulativo.
- **ChromaticAberrationFilter:** Separação dos canais Vermelho e Azul em direções opostas durante quebras de postura.
- **HeatHazeFilter:** Distorção ondulatória em tempo real para chamas e magma.
- **Canvas 2D Fallback:** Todas as técnicas possuem implementações geométricas em Canvas 2D com anéis de espessura decrescente e composições de tela.

---

## SEÇÃO 13: BIBLIOTECA DE COMPONENTES DE VFX

A biblioteca unificada (\`VFXComponentLibrary.js\`) fornece métodos padronizados:
- \`spawnSlashArc(x, y, options)\`: Arcos curvos de espada, foices e adagas.
- \`spawnImpactBurst(x, y, options)\`: Fagulhas pontuais e detritos direcionais.
- \`spawnProjectile(startX, startY, targetX, targetY, options)\`: Flechas e mísseis arcanos.
- \`spawnGroundPillar(x, y, options)\`: Pilares de fogo, luz e estacas de gelo.
- \`spawnGroundRune(x, y, options)\`: Círculos de transmutação e runas élficas.
- \`spawnCriticalHitFeedback(x, y, options)\`: Estrelas de impacto e anéis refrativos.
- \`spawnStaggerBreakEffect(x, y)\`: Quebra de postura em estilhaços cristalinos.
- \`spawnTitanbreakerVFX(x, y)\`: Fissura sísmica de destruição colossal.
- \`spawnMeteorVFX(startX, startY, targetX, targetY)\`: Cataclismo de meteoro em chamas.

---

## SEÇÃO 14: ARQUITETURA DE ATLAS E RENDERING 2D

Para máxima performance, todas as partículas e ícones são organizados em atlas de textura compartilhados. A renderização utiliza agrupamento por blend mode (\`source-over\` para sólidos, \`lighter\` para energia mágica), eliminando quebras de lote de renderização (\`batch breaks\`).

---

## SEÇÃO 15: OBJECT POOLING E GESTÃO DE MEMÓRIA

A alocação de objetos em tempo de execução foi totalmente erradicada:
- **Pool de Partículas:** 1.000 instâncias pré-aquecidas (\`VFXPoolManager.particles\`).
- **Pool de Projéteis:** 150 instâncias (\`VFXPoolManager.projectiles\`).
- **Pool de Textos Flutuantes:** 100 instâncias (\`VFXPoolManager.floatingText\`).
- **Pool de Ondas de Choque:** 50 instâncias (\`VFXPoolManager.shockwaves\`).
- **Pool de Fontes de Luz:** 50 instâncias (\`VFXPoolManager.lights\`).
Quando um efeito atinge o fim de sua vida útil, seus parâmetros são limpos e o objeto retorna à lista de disponíveis sem interferência do Coletor de Lixo (\`Garbage Collector\`).

---

## SEÇÃO 16: FLOATING COMBAT TEXT (HUD DE DANO)

Textos de dano possuem estilização visual atrelada ao elemento e tipo de acerto:
- Físico: Branco / Dourado.
- Fogo: Laranja / Vermelho intenso.
- Água / Gelo: Azul celeste.
- Vento: Verde esmeralda.
- Trevas: Violeta profundo.
- Sagrado: Dourado solar com borda branca.
- Críticos exibem fonte alargada com animação \`bounce_shake\`.

---

## SEÇÃO 17: BARRAS DE VIDA, MANA E POSTURA (STAGGER)

A barra de postura (Stagger Bar) opera em sincronia com o \`StaggerEngine\`. Ao atingir 100% de dano de postura, entra em estado \`BREAK\` durante o qual todo o dano recebido pelo monstro é amplificado em 2.0x, acompanhado pelo VFX \`spawnStaggerBreakEffect\`.

---

## SEÇÃO 18: ANÚNCIOS DE ULTIMATE E BANNERS VISUAIS

Ultimates e Master Ultimates projetam banners cinemáticos na interface com tipografia gótica estilizada (\`Cinzel\`), acompanhados por pulsos de luz periférica na tela.

---

## SEÇÃO 19: INTEGRAÇÃO COM COMBATENGINE (DECOUPLED PIPELINE)

O motor de combate emite eventos através de \`dispatchCombatEvent\` sem conhecer PixiJS ou nós do DOM:
\`\`\`javascript
dispatchCombatEvent(CombatEventType.SKILL_CAST, {
  skillId: 'titanbreaker',
  caster: state.hero,
  target: state.activeMonster,
  position: getHeroPoint()
});
\`\`\`
O \`VFXOrchestrator\` captura esses eventos e despacha as timelines visuais de forma completamente desacoplada.

---

## SEÇÃO 20: MAPEAMENTO DAS HABILIDADES COMPARTILHADAS (LV 1–39)

Antes do bloqueio de especialização no Nível 40, personagens utilizam o acervo de 8 habilidades generalistas:
1. **\`wind_strike\`** (Wind, Magia, Projétil) — Dano contínuo para noviços arcanos.
2. **\`flame_strike\`** (Fire, Magia, AoE) — Pequena erupção flamejante em área.
3. **\`hydro_strike\`** (Water, Magia, Single) — Jato pressurizado de água.
4. **\`power_strike\`** (Physical, Combate Melee) — Golpe de espada vigoroso.
5. **\`mortal_blow\`** (Physical, Adaga / Crítico) — Perfuração precisa em pontos vitais.
6. **\`iron_punch\`** (Physical, Contundente) — Soco pesado com alto abalo de postura.
7. **\`heal_light\`** (Holy, Cura Pessoal) — Regeneração celestial de HP.
8. **\`energy_burst\`** (Neutral, Explosão Arcana) — Onda de choque radial em área.

---

## SEÇÕES 21 A 33: O CATÁLOGO COMPLETO DAS 25 CLASSES (150 HABILIDADES)

Abaixo está catalogada cada uma das 25 classes ativas, com suas 6 habilidades oficiais (4 Especialistas + 1 Ultimate Lv80 + 1 Master Ultimate Lv90):

`;

// Append classes catalogue
let currentSection = 21;
const classGroups = [
  { title: 'SEÇÃO 21: HUMAN FIGHTER & HUMAN SORCERER', classes: ['human_fighter', 'human_sorcerer'] },
  { title: 'SEÇÃO 22: HUMAN DEATH KNIGHT, HUMAN WARG & HUMAN ASSASSIN', classes: ['human_death_knight', 'human_warg', 'human_assassin'] },
  { title: 'SEÇÃO 23: ELF FIGHTER & ELF MAGE', classes: ['elf_fighter', 'elf_mage'] },
  { title: 'SEÇÃO 24: ELF DEATH KNIGHT', classes: ['elf_death_knight'] },
  { title: 'SEÇÃO 25: DARK ELF FIGHTER & DARK ELF MAGE', classes: ['dark_elf_fighter', 'dark_elf_mage'] },
  { title: 'SEÇÃO 26: DARK ELF DEATH KNIGHT, DARK ELF ASSASSIN & DARK ELF BLOOD ROSE', classes: ['dark_elf_death_knight', 'dark_elf_assassin', 'dark_elf_blood_rose'] },
  { title: 'SEÇÃO 27: ORC FIGHTER & ORC SHAMAN', classes: ['orc_fighter', 'orc_shaman'] },
  { title: 'SEÇÃO 28: ORC VANGUARD RIDER', classes: ['orc_vanguard_rider'] },
  { title: 'SEÇÃO 29: DWARF ARTISAN & DWARF MAGE', classes: ['dwarf_artisan', 'dwarf_mage'] },
  { title: 'SEÇÃO 30: DWARF SHINEMAKER', classes: ['dwarf_shinemaker'] },
  { title: 'SEÇÃO 31: KAMAEL SOULBREAKER & KAMAEL SAMURAI', classes: ['kamael_soulbreaker', 'kamael_samurai'] },
  { title: 'SEÇÃO 32: ERTHEIA STORM BLASTER & ERTHEIA MARAUDER', classes: ['ertheia_storm_blaster', 'ertheia_marauder'] },
  { title: 'SEÇÃO 33: HIGH ELF DIVINE TEMPLAR & HIGH ELF ELEMENT WEAVER', classes: ['high_elf_divine_templar', 'high_elf_element_weaver'] }
];

for (const group of classGroups) {
  doc += `\n### ${group.title}\n\n`;

  for (const cid of group.classes) {
    const skills = allSkillsByClass[cid] || [];
    doc += `#### Classe: \`${cid}\` (${skills.length} Habilidades)\n\n`;
    doc += `| Slot | Habilidade | ID | Elemento | Função | Duração | Orçamento Partículas | Cooldown |\n`;
    doc += `|:---:|:---|:---|:---:|:---:|:---:|:---:|:---:|\n`;

    for (let i = 0; i < skills.length; i++) {
      const s = skills[i];
      const slotName = i === 4 ? '**Lv80 Ult**' : (i === 5 ? '**Lv90 Master**' : `Slot ${i + 1}`);
      doc += `| ${slotName} | **${s.identity.name}** | \`${s.identity.id}\` | ${s.identity.element} | ${s.identity.role} | ${s.timeline.totalDuration} ms | ${s.performance.particleBudget} max | ${s.gameplay.cooldown / 1000}s |\n`;
    }
    doc += `\n`;

    // Detailed breakdown per skill
    for (const s of skills) {
      doc += `##### Detalhes: \`${s.identity.id}\` (${s.identity.name})\n`;
      doc += `- **Descrição:** ${s.identity.description}\n`;
      doc += `- **Multiplicador de Dano:** ${s.gameplay.damageMultiplier}x | **Stagger:** ${s.gameplay.staggerDamage} | **Crítico:** ${s.gameplay.critModifier}x\n`;
      doc += `- **Armas Requeridas:** \`${s.gameplay.requiredWeapon.join(', ')}\`\n`;
      doc += `- **Game Feel:** Shake ${s.game_feel.cameraShake.intensity} (decaimento ${s.game_feel.cameraShake.decay}) | Hit-Stop: ${s.game_feel.hitStop.duration}ms\n`;
      doc += `- **Assinatura VFX:** \`${s.signature.uniqueVfxSignature}\` | **PoolKey:** \`${s.performance.poolKey}\`\n\n`;
    }
  }
}

doc += `---

## SEÇÃO 34: GUIA DE IMPLEMENTAÇÃO, EXTENSÃO E TESTES AUTOMATIZADOS

### Suíte de Auditoria Automática
O projeto possui 4 auditores de conformidade contínua executáveis via \`node --test\`:

1. **\`test/skill-schema.test.js\`**: Validação estrutural de todas as habilidades contra \`skill.schema.json\` (9 seções obrigatórias).
2. **\`test/all-skills-vfx-coverage.test.js\`**: Garantia de 100% de cobertura de VFX, timelines e parâmetros de câmera.
3. **\`test/skill-identity-auditor.test.js\`**: Verificação da matriz elemental de 25 classes e progressão de estágios.
4. **\`test/skill-performance.test.js\`**: Garantia dos tetos de partículas (80 / 120 / 180 / 250), draw calls e pooling.

Comando de verificação completa:
\`\`\`bash
node --test test/skill-schema.test.js test/all-skills-vfx-coverage.test.js test/skill-identity-auditor.test.js test/skill-performance.test.js
\`\`\`

---
*Aden Arena Idle — 2D Combat Presentation Engine. Todos os direitos reservados.*
`;

fs.writeFileSync('docs/ALL_SKILLS_VFX_COMBAT_MASTER_PROMPT.md', doc);
console.log('Successfully generated docs/ALL_SKILLS_VFX_COMBAT_MASTER_PROMPT.md with all 34 sections!');
