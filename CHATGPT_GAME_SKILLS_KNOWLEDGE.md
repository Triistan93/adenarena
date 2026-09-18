# 🎮 MASTER GAME DEVELOPMENT SKILLS & INSTRUCTION KNOWLEDGE BASE

> Este documento consolida todas as 22 especialidades e playbooks técnicos utilizados no desenvolvimento do **Aden Arena**.
> Pode ser enviado diretamente para a seção **Knowledge** do seu Custom GPT ou Projeto no ChatGPT.

## 📑 Índice de Habilidades e Especialidades

1. [audio-design](#audio-design)
2. [content--anti-slop-frontend](#content--anti-slop-frontend)
3. [content--ui-ux-pro-max](#content--ui-ux-pro-max)
4. [create-game-assets](#create-game-assets)
5. [development--code-reviewer](#development--code-reviewer)
6. [development--code-simplification](#development--code-simplification)
7. [development--git-workflow-mastery](#development--git-workflow-mastery)
8. [development--systematic-debugging](#development--systematic-debugging)
9. [development--test-driven-development](#development--test-driven-development)
10. [development--threejs-game-skills](#development--threejs-game-skills)
11. [development--vite-config](#development--vite-config)
12. [game-ai](#game-ai)
13. [game-feel](#game-feel)
14. [game-ui-ux](#game-ui-ux)
15. [input-systems](#input-systems)
16. [performance-optimization](#performance-optimization)
17. [rpg](#rpg)
18. [save-systems](#save-systems)
19. [shader-programming](#shader-programming)
20. [threejs-gltf-loading](#threejs-gltf-loading)
21. [threejs-materials-lighting](#threejs-materials-lighting)
22. [threejs-scene-setup](#threejs-scene-setup)

---


<a id="audio-design"></a>
# SKILL: audio-design

---
name: audio-design
description: >
  Implement game audio practice — bus/mixer architecture and gain in decibels,
  ducking (sidechain), adaptive/dynamic music via layering and re-sequencing,
  SFX variation, and beat synchronization. Engine-neutral. Use when the user
  mentions audio mixing, audio buses, adaptive/dynamic music, ducking, SFX
  variation, music layers, or syncing gameplay to the beat.
---

# Audio design

Game audio is a **mixing graph plus a music system**. Route every sound through a
small set of buses so you can balance and process groups; make music *react* to
play through layering and re-sequencing rather than looping one track. This skill
teaches the portable practice; bind it to `godot-audio`, Unity's AudioMixer, or
middleware (FMOD/Wwise) for concrete APIs.

## When to use

- Use to design a bus/mixer layout, set group volumes, and apply effects (reverb,
  compression, EQ) to groups of sounds.
- Use to duck music/ambience under dialogue or impacts (sidechain).
- Use to build adaptive music that responds to combat/exploration intensity.
- Use to add SFX variation (pitch/sample randomization) and sync events to a beat.

**When *not* to use:** for the engine's concrete audio nodes/streams, use
`godot-audio` or the engine's audio skill. Loading/streaming and asset import are
engine concerns. For UI sliders that drive bus volume, see the engine UI skill.

## Core workflow

1. **Lay out buses, not per-sound volume.** A typical tree: `Master ← {Music,
   SFX, Ambience, UI, Voice}`. Everything plays into a bus; the player's settings
   sliders map to bus volumes. Never set hundreds of clip volumes by hand.
2. **Work in decibels, not linear.** Perceived loudness is logarithmic. Volume
   controls and automation should operate in dB; convert only at the edges.
3. **Leave headroom.** Mix so the Master peaks below 0 dBFS (aim for a target
   loudness, e.g. around -14 to -16 LUFS for many games) to avoid clipping.
4. **Duck competing sources** with a sidechain compressor (or volume automation):
   when voice/important SFX plays, the music bus dips, then recovers.
5. **Make music adaptive** via *vertical* layering (stems faded in/out) and/or
   *horizontal* re-sequencing (swap segments at musical boundaries). See the
   reference.
6. **Vary repeated SFX** with small random pitch/volume offsets and sample pools
   so footsteps and hits don't sound robotic.
7. **Verify on real output.** Listen on headphones and speakers; check that the
   mix balances, ducking is audible but not pumping, and music transitions land
   on the beat — never assume from the editor meters alone.

## Patterns

### 1. Bus routing and dB gain

```gdscript
# Route sounds to named buses; control GROUPS, not individual clips.
sfx_player.bus = "SFX"
music_player.bus = "Music"

# Map a 0..1 settings slider to decibels (linear_to_db), the perceptual unit.
func set_bus_volume(bus_name: String, slider01: float) -> void:
    var idx := AudioServer.get_bus_index(bus_name)
    var db := linear_to_db(clamp(slider01, 0.0001, 1.0))   # 0 -> silence, 1 -> 0 dB
    AudioServer.set_bus_volume_db(idx, db)
# RIGHT: slider -> dB via linear_to_db. WRONG: assigning slider01 straight as dB
# (a "0.5" would be only +0.5 dB — almost no change — and 0 would be 0 dB, full).
```

### 2. Ducking via sidechain (music dips under voice)

```gdscript
# A compressor on the MUSIC bus, keyed by the VOICE bus, lowers music while
# dialogue plays, then releases. This is "sidechain ducking".
# Setup (engine-specific): add a compressor effect to the Music bus and set its
# sidechain to the Voice bus. Then tune:
#   threshold: level on Voice that triggers ducking (e.g. -30 dB)
#   ratio:     how hard to duck (e.g. 8:1 for a clear dip)
#   attack:    fast (~10 ms) so music gets out of the way promptly
#   release:   slow (~300-500 ms) so it recovers smoothly, not pumping
# No-middleware alternative: tween the Music bus volume down on voice start and
# back up on voice end.
func duck_music(active: bool) -> void:
    var target_db := -12.0 if active else 0.0
    create_tween().tween_method(
        func(v): set_bus_volume_db("Music", v), current_music_db, target_db, 0.25)
```

### 3. SFX variation (kill the "machine gun" repeat)

```gdscript
# Randomize pitch slightly and pick from a sample pool so repeats feel organic.
func play_varied(samples: Array, bus := "SFX") -> void:
    var p := AudioStreamPlayer.new()
    p.stream = samples[randi() % samples.size()]   # rotate through several takes
    p.bus = bus
    p.pitch_scale = randf_range(0.94, 1.06)         # +/- ~6% pitch wobble
    add_child(p); p.play()
    p.finished.connect(p.queue_free)                # clean up one-shots
```

### 4. Beat-synced events (quantize to the music grid)

```gdscript
# Schedule gameplay/visuals on musical time, not frame time, so they land on beat.
const BPM := 120.0
var seconds_per_beat := 60.0 / BPM

func current_beat(playback_position_sec: float) -> int:
    return int(playback_position_sec / seconds_per_beat)

# Quantize an action to the NEXT beat boundary instead of firing immediately.
func time_until_next_beat(pos: float) -> float:
    return seconds_per_beat - fmod(pos, seconds_per_beat)
# Drive timing from the audio playback clock, which is steadier than frame delta.
```

## Pitfalls

- **Treating slider values as dB.** Volume is logarithmic; map `0..1` through
  `linear_to_db` (and back with `db_to_linear`). A linear slider on raw amplitude
  feels like it does nothing until the very bottom.
- **Per-clip volume instead of buses** makes a global balance pass impossible and
  bloats save/settings. Mix on buses.
- **Clipping the master.** Summed sounds exceed 0 dBFS and distort. Leave
  headroom; put a limiter on Master as a safety net, not as the mixer.
- **Pumping ducking**: too-fast release or too-high ratio makes music audibly
  breathe. Lengthen release; lower ratio.
- **Looping a single music track** for the whole game feels flat. Use layers or
  segments that respond to state (see the reference).
- **Beat sync off frame time.** `delta` drifts; read the **audio playback
  position** for musical timing, and account for output latency.
- **Unbounded one-shot players**: spawning AudioStreamPlayers without freeing
  them leaks. Free on `finished`, or use a small pool.

## References

- `references/adaptive-music.md` — vertical layering vs horizontal re-sequencing,
  transition timing (bars/quantize), stingers, intensity mapping, and crossfades.

## Related skills

- `godot-audio` — buses, `AudioStreamPlayer`, effects, and sync-to-beat in Godot.
- `input-systems` — trigger audio from input actions.
- `physics-tuning` — collision events that drive impact SFX.
- `platformer`, `roguelike` — genres whose feel leans on audio feedback.



### [Reference: audio-design / adaptive-music.md]

# Adaptive (dynamic) music

Adaptive music changes with gameplay instead of looping one track. Two techniques
dominate, and they combine:

- **Vertical layering (re-orchestration)** — several stems (drums, bass, melody,
  tension pad) play in sync; you fade layers in/out to change intensity without
  changing the underlying loop. Seamless because all layers share the same
  timeline.
- **Horizontal re-sequencing** — the track is split into segments (intro, loop A,
  loop B, combat, outro); you switch which segment plays next, transitioning at
  musical boundaries (bar/phrase) so the change lands on beat.

## Vertical layering

All layers are the same length and start together; only their volumes change.

```gdscript
# Keep N stem players in sync (same position), and fade volumes by intensity.
var layers := { "base": p_base, "drums": p_drums, "tension": p_tension }

func start_layers() -> void:
    for p in layers.values():
        p.volume_db = -80.0       # start silent
        p.play()                  # all begin together -> stay sample-aligned
    layers["base"].volume_db = 0.0

func set_intensity(level: int) -> void:   # 0 calm .. 2 combat
    _fade(layers["drums"],   0.0 if level >= 1 else -80.0)
    _fade(layers["tension"], 0.0 if level >= 2 else -80.0)

func _fade(p, target_db: float, t := 0.8) -> void:
    create_tween().tween_property(p, "volume_db", target_db, t)
```

Tips: author stems at the same BPM/length and bounce them aligned. Fades of
~0.5–1.5 s feel musical; instant cuts feel mechanical. Because layers never
restart, intensity can change any time without losing sync.

## Horizontal re-sequencing

Switch segments at safe musical points so transitions don't sound abrupt.

```gdscript
# Request a section change; apply it only at the next bar boundary.
var pending_section := ""
const BPM := 120.0
const BEATS_PER_BAR := 4
var sec_per_bar := 60.0 / BPM * BEATS_PER_BAR

func request_section(name: String) -> void:
    pending_section = name        # don't switch mid-bar; queue it

func on_bar_boundary(pos: float) -> void:
    if pending_section != "":
        crossfade_to(pending_section, 0.2)   # short crossfade across the seam
        pending_section = ""
```

Transition strategies, roughly increasing in polish:

- **Immediate crossfade** — quick volume blend; fine for low-stakes changes.
- **Quantized switch** — wait for the next beat/bar/phrase, then switch. The
  default for music that should stay "in time".
- **Transition segments** — short bridge clips written to connect A→B musically.
- **Stingers** — one-shot musical accents layered over the bed for events (boss
  appears, secret found) without altering the loop.

## Mapping gameplay to intensity

Drive the music from a small, smoothed intensity value rather than raw events:

```gdscript
# Combine signals into 0..1, smooth it, then map to layers/sections with hysteresis.
func intensity_from_state(enemies_near: int, player_hp01: float) -> float:
    var raw = clamp(enemies_near / 5.0, 0.0, 1.0) * (1.0 - 0.4 * player_hp01)
    intensity = lerp(intensity, raw, 0.05)   # smooth so it doesn't flicker
    return intensity

# Hysteresis: require crossing different thresholds up vs down so the music
# doesn't oscillate when intensity hovers at a boundary.
func level_from_intensity(i: float, current: int) -> int:
    if current < 1 and i > 0.6: return 1
    if current >= 1 and i < 0.4: return 0
    return current
```

## Practical notes

- **Drive timing from the audio clock**, not frame delta, and account for output
  latency when scheduling.
- **Loop points** must be sample-accurate; gaps or clicks betray the seam. Author
  loops to bar boundaries and test the wrap.
- **Middleware** (FMOD, Wwise) implements layering, quantized transitions, and
  parameter-driven intensity natively — reach for it when the music system grows
  beyond a handful of stems/segments.
- **Budget**: many simultaneous stems cost voices and memory. Stream long music;
  keep stem counts modest on low-end targets.



---


<a id="content--anti-slop-frontend"></a>
# SKILL: content--anti-slop-frontend

---
name: anti-slop-frontend
description: Anti-slop frontend framework for AI agents. Enforces better layout, typography, motion, and spacing to counter
  generic AI-generated boilerplate UIs. Use when building frontend, countering generic AI UIs, need distinctive visual design,
  image-to-code pipeline.
domain: content
author: oyi77
license: Apache-2.0
subdomain: content-creation
tags:
- frontend
- design
- ui
- anti-slop
- taste
- typography
- motion
- image-to-code
version: 1.0.0
---


## Overview

Anti-slop frontend design framework based on [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill). Provides 13 specialized skills that enforce distinctive, production-grade visual design — countering the generic, soulless UIs that AI agents typically generate.

The framework covers layout systems, typography hierarchies, motion design, spacing discipline, and image-to-code pipelines across three visual style variants.

## Implementation Skills

- Configure agents, anti, better, boilerplate, building settings before first use


### taste-skill (v2)

Core design taste engine. Injects layout/typography/color/motion constraints into agent output to prevent generic patterns.

- **When to use**: Every frontend generation task as a baseline quality filter.
- **Key principles**: White space is intentional, type scales are non-negotiable, color palettes have hierarchy, motion serves purpose.

### taste-skill-v1

Legacy taste skill for backward compatibility with existing agent pipelines.

### gpt-taste

GPT-specific taste calibration — adapts design constraints for GPT-based code generators.

### image-to-code

Screenshot-to-production-code pipeline. Takes a reference image and generates pixel-accurate frontend code.

- **When to use**: Converting mockups, competitor screenshots, or design references into working code.
- **Process**: Image analysis → layout extraction → component mapping → responsive code generation.

### redesign-existing-projects

Audit and redesign existing frontend projects. Identifies anti-patterns and applies taste-skill improvements.

- **When to use**: Inheriting ugly codebases, post-MVP polish, design debt cleanup.
- **Process**: Visual audit → priority matrix → incremental redesign → before/after validation.

### high-end-visual-design

Premium visual design patterns — luxury brand aesthetics, editorial layouts, cinematic compositions.

- **When to use**: High-end brand sites, portfolio showcases, product launch pages.

### full-output-enforcement

Ensures agents produce complete, production-ready output — no placeholder content, no stub components, no TODO comments.

### minimalist-ui

Minimalist design system — reduction to essentials, generous whitespace, restrained color palettes.

- **Key principles**: Remove until it breaks, then stop. Every element must earn its place.

### industrial-brutalist-ui

Industrial brutalist design system — raw typography, exposed structure, intentional roughness, anti-polish aesthetics.

- **Key principles**: Honesty in materials, function over decoration, embrace the grid.

### stitch-design-taste

Design taste layer for Stitch-based component generation — ensures consistent quality across stitched UI components.

## Image Generation Skills

- Configure agents, anti, better, boilerplate, building settings before first use


### imagegen-frontend-web

Generate web-specific visual assets — hero images, section backgrounds, illustration sets — with consistent style matching the frontend design system.

### imagegen-frontend-mobile

Generate mobile-specific visual assets — splash screens, onboarding illustrations, app store screenshots.

### brandkit

Generate cohesive brand identity kits — logo variants, color palettes, typography pairings, icon sets, pattern libraries.

## Visual Style Variants

- Configure agents, anti, better, boilerplate, building settings before first use


### Soft/Premium
- Rounded corners, subtle gradients, soft shadows
- Warm neutral palettes with accent pops
- Smooth easing curves on transitions
- High whitespace ratio, generous padding

### Minimalist
- Sharp edges or very subtle radius
- Monochrome + single accent color
- Immediate transitions (100-200ms)
- Grid-disciplined, content-first layouts

### Industrial Brutalist
- No border radius, raw edges
- High contrast black/white with one bold accent
- No animation or hard cuts
- Exposed grid lines, visible structure

## Installation

```bash
npx skills add Leonxlnx/taste-skill
```

## When to Use

**Trigger phrases:**
- "anti slop frontend"
- "Building any frontend UI from scratch"
- "Countering generic AI-generated boilerplate designs"
- "Need distinctive, production-grade visual design"


- Building any frontend UI from scratch
- Countering generic AI-generated boilerplate designs
- Need distinctive, production-grade visual design
- Running an image-to-code conversion pipeline
- Redesigning existing projects with poor visual quality
- Generating brand-consistent visual assets

## How to Use

1. Define content goal (traffic, engagement, conversion, brand awareness)
2. Research target audience pain points and search intent
3. Generate content using appropriate AI tools
4. Edit and humanize output for authenticity
5. Optimize for target platform (SEO, hashtags, format)
6. Schedule and distribute across channels
7. Measure performance and iterate

## When NOT to Use

- Task is about content strategy, not creation (use strategy skills)
- Task is about content distribution (use distribution skills)
- You need to analyze content performance (use analytics skills)
- Task is about content moderation (use moderation tools)
- You don't have content guidelines
- Task requires domain expertise (consult experts)


## Red Flags

- **AI-generated content sounds robotic**: Always run through humanizer before publishing
- **Engagement dropping week-over-week**: Content fatigue or algorithm change — vary formats
- **Duplicate content across platforms**: Adapt content per platform, don't just cross-post
- **No content calendar**: Sporadic posting kills audience retention
- **Ignoring analytics**: Content without measurement is just publishing, not marketing

## Verification

- [ ] Skill output matches expected behavior

## Process

1. Analyze the task requirements
2. Apply domain expertise
3. Verify output quality

## Anti-Rationalization Table

| Rationalization | Reality |
|---|---|
| "Good enough content works" | Quality content drives engagement. Mediocre content gets ignored. |
| "I will optimize later" | SEO and distribution need optimization from the start. |
| "Templates are good enough" | Templates are a starting point. Custom content outperforms generic. |


---


<a id="content--ui-ux-pro-max"></a>
# SKILL: content--ui-ux-pro-max

---
name: ui-ux-pro-max
description: Industry-specific design intelligence — 161 reasoning rules, 99 UX guidelines, 161 color palettes, 57 font pairings,
  49 UI styles. Use when building professional UI, need industry-specific design, generating design systems, choosing colors
  or typography.
domain: content
author: oyi77
license: Apache-2.0
subdomain: content-creation
tags:
- ui
- ux
- design
- design-system
- color-palette
- typography
- accessibility
version: 1.0.0
---


## Overview

UI/UX Pro Max: comprehensive design intelligence for AI coding assistants. 161 industry-specific reasoning rules, 99 UX guidelines, 161 color palettes, 57 font pairings, and 49 UI styles — all searchable and template-ready.

Source: [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)

## Capabilities

- Apply industry-specific design rules across 8 sectors
- Generate complete design systems from requirements
- Search color palettes by mood, industry, or brand
- Match font pairings for different contexts
- Apply 99 UX guidelines systematically
- Build UI component templates from style definitions

## When to Use

**Trigger phrases:**
- "ui ux pro max"
- "Building professional UI for a specific industry"
- "Need color palette or font pairing recommendations"
- "Creating or auditing a design system"


- Building professional UI for a specific industry
- Need color palette or font pairing recommendations
- Creating or auditing a design system
- Translating business requirements into visual design
- Ensuring UX best practices in implementation

## Supported Platforms

Claude, Cursor, Copilot, Windsurf — works as a skill in any AI coding assistant.

## Industry Categories (161 Rules)

| Industry | Focus Areas |
|----------|-------------|
| Tech/SaaS | Dashboards, pricing pages, onboarding flows, data density |
| Finance | Trust signals, data tables, compliance UI, security indicators |
| Healthcare | Accessibility-first, clear hierarchy, calm palettes, HIPAA-aware |
| E-commerce | Product cards, checkout flow, urgency cues, mobile-first |
| Services | Booking flows, testimonials, CTAs, trust badges |
| Creative | Portfolio layouts, bold typography, immersive visuals |
| Lifestyle | Social proof, aspirational imagery, engagement loops |
| Emerging Tech | AI/ML dashboards, blockchain explorers, IoT panels |

## UX Guidelines (99 Items)

Organized by category:
- **Navigation** (12): Menu patterns, breadcrumbs, search, mobile nav
- **Forms** (15): Input validation, error states, multi-step, autocomplete
- **Content** (11): Typography hierarchy, whitespace, reading patterns
- **Interaction** (13): Feedback, loading states, animations, gestures
- **Accessibility** (14): WCAG compliance, screen readers, contrast, focus
- **Mobile** (12): Touch targets, gestures, responsive breakpoints
- **Conversion** (10): CTAs, social proof, urgency, A/B patterns
- **Data Display** (12): Tables, charts, dashboards, empty states

## Color Palettes (161)

Searchable by mood, industry, or brand archetype:
- Professional/Corporate (blue-gray, navy, slate)
- Energetic/Creative (coral, violet, teal)
- Calm/Healthcare (sage, sky, lavender)
- Luxury/Premium (gold, charcoal, cream)
- Tech/Modern (electric blue, neon green, dark mode)

## Font Pairings (57)

Matched for context:
- **SaaS/Dashboard**: Inter + JetBrains Mono
- **Editorial**: Playfair Display + Source Sans Pro
- **E-commerce**: DM Sans + Space Grotesk
- **Creative**: Clash Display + Satoshi
- **Enterprise**: IBM Plex Sans + IBM Plex Mono

## Usage

```
User: "Design a healthcare dashboard"
Agent: Applies healthcare industry rules, selects calm palette, pairs IBM Plex Sans, follows data display UX guidelines

User: "What colors for a fintech app?"
Agent: Searches finance palettes, recommends trust-building blues with accent greens for positive metrics
```

## How to Use

1. Define content goal (traffic, engagement, conversion, brand awareness)
2. Research target audience pain points and search intent
3. Generate content using appropriate AI tools
4. Edit and humanize output for authenticity
5. Optimize for target platform (SEO, hashtags, format)
6. Schedule and distribute across channels
7. Measure performance and iterate

## When NOT to Use

- Task is about content strategy, not creation (use strategy skills)
- Task is about content distribution (use distribution skills)
- You need to analyze content performance (use analytics skills)
- Task is about content moderation (use moderation tools)
- You don't have content guidelines
- Task requires domain expertise (consult experts)


## Red Flags

- **AI-generated content sounds robotic**: Always run through humanizer before publishing
- **Engagement dropping week-over-week**: Content fatigue or algorithm change — vary formats
- **Duplicate content across platforms**: Adapt content per platform, don't just cross-post
- **No content calendar**: Sporadic posting kills audience retention
- **Ignoring analytics**: Content without measurement is just publishing, not marketing

## Verification

- [ ] Skill output matches expected behavior

## Process

1. Analyze the task requirements
2. Apply domain expertise
3. Verify output quality

## Anti-Rationalization Table

| Rationalization | Reality |
|---|---|
| "Good enough content works" | Quality content drives engagement. Mediocre content gets ignored. |
| "I will optimize later" | SEO and distribution need optimization from the start. |
| "Templates are good enough" | Templates are a starting point. Custom content outperforms generic. |


---


<a id="create-game-assets"></a>
# SKILL: create-game-assets

---
name: create-game-assets
description: Plan, generate, source, normalize, and validate cohesive visual game assets. Use for art direction, style bibles, sprites, tilesets, backgrounds, UI art, icons, textures, concept art, or 3D asset briefs.
---

# Create Game Assets

Turn a game's visual intent into a consistent, engine-ready asset set. Treat image generation as
one production tool inside a controlled pipeline, never as proof that an asset is shippable.

## Core workflow

1. **Inspect before inventing.** Find existing screenshots, concept art, sprites, models, fonts,
   import settings, camera framing, target resolution, and naming conventions. Preserve a coherent
   existing direction unless the user asks for a redesign.
2. **Lock the technical frame.** Record engine, 2D/3D, camera/view, native display size, asset
   dimensions, world scale, transparency, palette, filtering, animation frames, texture budget,
   and target platforms. Use `assets/art-direction-brief.md` as a copyable brief.
3. **Name the visual system.** Define shape language, silhouette priorities, value structure,
   palette roles, materials, lighting, detail density, edge treatment, and motion character. Use
   concrete visual properties; do not substitute a living artist's name for an art direction.
4. **Make an asset manifest.** Copy `assets/asset-manifest.json`, then list every required asset,
   state, variant, size, pivot, collision role, source, license, and approval status. Separate
   production assets from disposable greybox placeholders.
5. **Approve one visual target.** Create or select a representative hero asset or small style
   board before producing a full set. Judge it at actual game scale and against a gameplay
   background. If the user delegated the choice, pick the strongest viable direction and record
   the decision instead of blocking.
6. **Produce related assets as families.** Reuse the approved target as an edit/reference input.
   Keep palette, view, proportions, lighting, outline, and texture density invariant. Generate
   small coherent batches; avoid unrelated one-off prompts that drift.
7. **Normalize deterministically.** Crop, size, anchor, slice, name, compress, and check alpha with
   ordinary image/DCC tools. Never trust generated grids, transparency, seams, pivots, topology,
   or dimensions without inspection. Use the bundled scripts for raster QA and contact sheets.
8. **Import with engine-native settings.** Set filtering, mipmaps, pixels-per-unit/world scale,
   color space, compression, sprite slicing, texture types, materials, and collision deliberately.
   Read the relevant engine skill before editing engine files.
9. **Validate in context.** Inspect a contact sheet and the actual game at native resolution.
   Check silhouette, scale, animation stability, seams, legibility, palette, collision fit, memory,
   and compression artifacts. Iterate on the source asset, not only on runtime compensations.
10. **Record provenance.** Keep the source URL/tool, license or generation note, edit history, and
    restrictions beside the manifest. Preserve embedded provenance metadata when the pipeline can.

## Choose the production path

| Need | Default path |
|------|--------------|
| Existing asset needs a controlled change | Edit the original/reference; state what must remain unchanged |
| New 2D visual family | Approve seed → generate/source family → normalize → preview → import |
| True pixel art | Use generated work as a draft; enforce grid, palette, clusters, and frames with pixel tools |
| Tileable surface or tileset | Produce a small family; repair seams; test repeated 3×3 before approval |
| UI art or icons | Keep text and interaction code-native; prefer SVG/vector for simple geometric symbols |
| 3D model or material | Use concepts as reference; author/clean in a DCC; validate topology, UVs, scale, pivots, and LODs |
| No generation/edit tool is available | Build the brief and manifest; source licensed assets or keep explicit greybox placeholders |
| Audio asset | Route sound implementation and mixing to `audio-design`; still track source/license in the manifest |

## Image-generation handoff

When a capable image generation or editing tool is installed, use it for live visual creation. If
the workspace exposes an `imagegen` skill, read and follow it for the actual generation/edit call;
this skill owns the game-art brief, constraints, normalization, and acceptance gates.

Build prompts from these blocks:

```text
ROLE/PURPOSE: production asset for [gameplay role]
SUBJECT: [specific object/character and action]
VIEW: [orthographic/top-down/side/three-quarter], [camera and facing]
ART DIRECTION: [shape language], [palette roles], [materials], [edge treatment]
GAME-SCALE READ: [silhouette and focal details that must survive at WxH]
TECHNICAL OUTPUT: [dimensions/aspect], [transparent or scene background], [frame/slot count]
LOCKS: preserve [identity, proportions, palette, costume, lighting, line weight]
EXCLUDE: text, labels, mockup frames, scenery, duplicate objects, cropped edges, signatures
```

For edits, say both what changes and what stays fixed. Ask for transparent output through the
tool's native transparency option when available, then verify the alpha channel—prompt wording
alone does not guarantee transparency.

## Raster QA recipes

Inspect constraints and emit a machine-readable report:

```bash
python scripts/asset_report.py assets/player-idle.png \
  --expect-size 64x64 --require-alpha --max-colors 48 --json
```

Build a nearest-neighbor contact sheet over a checkerboard:

```bash
python scripts/build_preview_sheet.py output/player/*.png \
  --out output/player-preview.png --columns 4 --cell-size 192
```

Run script paths relative to this skill directory, or resolve the installed skill path first.
Both scripts require Python 3.10+ and Pillow. Install the only dependency with
`python -m pip install -r scripts/requirements.txt` when it is not already available.

## Quality gates

- **Cohesion:** related assets share palette roles, line/edge treatment, view, light direction,
  scale, and detail density.
- **Gameplay read:** silhouettes and state changes remain clear at native resolution, in motion,
  and over real backgrounds.
- **Technical fit:** exact size/frame count, usable alpha, stable anchors/pivots, correct color
  space/filtering, no clipped content, no accidental labels or baked mockup chrome.
- **Animation:** identity, volume, proportions, costume, facing, and baseline do not drift; timing
  and anticipation read in an in-engine preview.
- **Tiles/backgrounds:** required edges tile without seams; repetition is tolerable; parallax
  layers have intentional depth and no baked collision cues.
- **3D:** transforms, scale, pivot, normals, UVs, materials, topology, rig, collision proxies,
  LODs, and runtime format are checked rather than inferred from a render.
- **Rights:** every shipped file has recorded provenance and terms compatible with the project.

Do not call an asset production-ready from a prompt result alone. Approval requires the relevant
technical checks plus an in-engine or native-scale visual inspection.

## References

- For visual-system decisions and maintaining consistency, read
  `references/art-direction.md`.
- For sprites, animation strips, tiles, backgrounds, UI art, and engine import settings, read
  `references/raster-pipeline.md`.
- For concept-to-mesh, textures, glTF/GLB, LOD, collision, and runtime validation, read
  `references/three-d-pipeline.md`.
- For licenses, generated-media records, and provenance, read
  `references/provenance.md`.

## Related skills

- `game-ui-ux` for layout, navigation, readability, and accessible interaction.
- `game-feel`, `shader-programming`, and `audio-design` for presentation after the source art fits.
- Engine import/rendering skills such as `godot-tilemap`, `unity-tilemap-2d`,
  `pixijs-rendering`, and `threejs-gltf-loading`.



### [Reference: create-game-assets / art-direction.md]

# Art direction and consistency

Use this reference when a game needs a new visual direction, a style refresh, or a way to keep
many assets coherent across generation sessions and contributors.

## Describe a system, not a mood word

Define each axis explicitly:

| Axis | Questions to settle |
|------|---------------------|
| Shape | Rounded, angular, chunky, slender, geometric, organic? Which shapes signal friendly, dangerous, rare, or interactive? |
| Silhouette | What must read at game scale? Which parts may never merge into the body mass? |
| Value | How many value bands? Is the subject readable in grayscale against common backgrounds? |
| Color | What roles do accent, danger, reward, neutral, environment, and UI colors play? |
| Edge | Hard pixel clusters, clean vector edges, ink line, painterly lost edges, soft 3D bevels? |
| Material | How do metal, cloth, skin, stone, foliage, glass, and magic differ? |
| Light | Direction, softness, contrast, ambient color, rim light, baked shading policy? |
| Detail | Where is detail concentrated? What disappears at the native viewing size? |
| Camera | Orthographic/perspective, angle, focal length, horizon, facing and turn conventions? |
| Motion | Snappy, elastic, weighty, restrained? How far may forms deform in animation? |

Avoid phrases such as “beautiful,” “cinematic,” or “high quality” without observable constraints.
Avoid using a living artist's name as the style definition. Translate references into properties
such as palette, geometry, composition, material, lighting, and mark-making.

## Build a visual target

1. Capture the real game viewport and native resolution.
2. Place a representative character/object, environment patch, effect, and HUD fragment together.
3. Show common and worst-case backgrounds.
4. Add a small palette with semantic roles rather than an unlabelled color cloud.
5. Record do/don't examples: acceptable silhouette, forbidden outline drift, allowed texture noise.
6. Approve this target before producing a large catalog.

The target is a contract, not inspiration. Later outputs should be compared against it at the same
size and under the same background/light assumptions.

## Keep a family coherent

- Reuse one approved seed/reference for related variants.
- Keep a stable prompt card with the invariant blocks separate from the asset-specific block.
- Generate related items in small batches when shared scale and lighting matter.
- Change one variable per edit pass; broad “make it better” edits increase drift.
- Carry explicit color values or a palette image when color identity matters.
- Keep naming, pivots, canvas size, and padding deterministic outside the model.
- Reject outputs that are attractive alone but belong to a different visual system.

## Evaluate at three distances

1. **Thumbnail/native game scale:** gameplay identity and state must read immediately.
2. **Working scale:** edge quality, anatomy, seams, clusters, and material cues are inspectable.
3. **Context:** the asset sits in a real gameplay capture with lighting, effects, UI, and neighbors.

An asset that only succeeds when zoomed in is not successful game art.

## Common drift signals

- character height, head ratio, limb thickness, or costume layers change between states
- outline color/width changes between adjacent assets
- highlights imply different light directions
- palette grows with near-duplicate colors and muddy intermediates
- texture/noise density increases on later generations
- camera angle or object projection changes across an isometric/top-down set
- ground contact and shadow footprint move unpredictably
- UI icons mix filled, outlined, beveled, and painterly treatments

When drift appears, return to the approved seed and use a constrained edit. Do not keep editing a
drifted derivative until it becomes the new accidental reference.



### [Reference: create-game-assets / provenance.md]

# Asset rights and provenance

Use this reference for generated, purchased, commissioned, open, or remixed assets. This is a
production recordkeeping workflow, not legal advice.

## Record per shipped asset

- stable asset ID and repository path
- creator/source URL or vendor order
- acquisition or generation date
- source tool/model/version when generated
- original prompt/reference IDs when available
- license name/version and a saved copy or link to the terms
- attribution text and placement requirements
- whether commercial use, modification, redistribution, or AI training is restricted
- edits, derivatives, and the person/tool responsible
- approval status and reviewer

The bundled `assets/asset-manifest.json` has fields for these records. Keep proof of purchase and
license snapshots outside a public repository when they contain personal or account data.

## Decision rules

1. Do not treat “free,” “royalty-free,” search-engine-visible, or model-generated as a license.
2. Verify terms at the original source, not a repost or aggregator preview.
3. Keep attribution through atlas packing, renaming, conversion, and derivative edits.
4. Check whether a marketplace license permits redistribution of raw source files; shipping a game
   and publishing editable source assets can have different permissions.
5. Do not request direct imitation of a living artist. Describe visual properties or use references
   the project has permission to edit.
6. Preserve content credentials/provenance metadata where the file pipeline supports it. If
   optimization strips metadata, retain the corresponding manifest record.
7. Review each store/platform's current disclosure rules before submission; rules change faster
   than this skill.

## Useful primary references

- [Creative Commons license chooser](https://creativecommons.org/chooser/)
- [SPDX license list](https://spdx.org/licenses/)
- [OpenAI content provenance](https://openai.com/index/advancing-content-provenance/)
- [Steamworks documentation](https://partner.steamgames.com/doc/home)

When terms are unclear or the release is commercially important, flag the ambiguity for a human
rights review rather than guessing.



### [Reference: create-game-assets / raster-pipeline.md]

# Raster, sprite, tile, background, and UI pipeline

Use this reference for production 2D art and raster textures. Generated output is source material;
dimensions, grids, alpha, anchors, and import settings remain deterministic engineering concerns.

## Sprites and animation

1. Approve one idle/neutral seed at the final view and approximate game scale.
2. Lock canvas size, baseline/ground point, facing, palette, outline, proportions, and costume.
3. For a short animation, request the whole action as one strip or sheet referenced to the seed.
   Independent frame requests drift more. Treat the returned grid as a candidate, not exact data.
4. Slice and normalize frames with one shared scale and one shared anchor—usually bottom-center.
5. If frame 1 must equal a shipped idle pose, restore the exact seed after slicing.
6. Preview as a contact sheet and in motion. Check volume, foot sliding, silhouette, and cadence.

For true pixel art, enforce a real pixel grid after generation. Remove blended pseudo-pixels,
single-pixel noise, excess colors, banding, and inconsistent clusters. Resize only with
nearest-neighbor unless a deliberate preprocessing pass says otherwise.

## Tiles and repeatable textures

- Define tile dimensions and neighbor rules before creating art.
- Produce a base, transitions, corners, isolated pieces, and decoration as one visual family.
- Keep gameplay edges and collision meaning legible; decorative shadows must not imply false walls.
- Test seamless materials in a 3×3 repeat at full size and at minified camera scale.
- Inspect terrain combinations in the engine's autotile/terrain system, not only in a sheet.
- Keep padding/extrusion compatible with the engine/atlas tool to prevent texture bleeding.

## Backgrounds and parallax

- Split sky, far, mid, near, and foreground layers according to intended parallax speed.
- Avoid unique landmarks near horizontal seams when layers must scroll/repeat.
- Preserve a low-contrast playfield behind characters and projectiles.
- Keep focal detail away from HUD safe areas and critical navigation silhouettes.
- Export layers independently with overlap so camera movement cannot expose gaps.

## UI art and icons

- Keep labels, numbers, dynamic copy, focus state, and accessibility text code-native.
- Generate or draw ornament, frames, portraits, and texture—not rasterized functional text.
- Prefer one established icon family. Simple geometric symbols should usually be SVG/vector.
- Provide normal, hover/focus, pressed, disabled, selected, and warning states when art changes.
- Design scalable panels as 9-slice/nine-patch assets; verify corners and borders at several sizes.

## Import checkpoints

**Godot 4.7:** choose nearest filtering for crisp pixel art; use mipmaps when non-pixel textures
shrink substantially; set repeat only for textures designed to tile; verify `Sprite2D`,
`TileSet`, atlas regions, and animation frames in the editor.

**Unity 6.3 LTS:** set Texture Type to Sprite (2D and UI), choose Single/Multiple correctly, set a
consistent Pixels Per Unit, filter mode, compression, mipmaps, mesh type, and sprite slicing.
Disable Read/Write unless runtime pixel access is actually required because it adds memory cost.

**Phaser/PixiJS/web:** keep atlas metadata and image filenames stable; use nearest sampling and
integer camera scaling for pixel art; prevent browser/CSS resizing from introducing blur; inspect
texture bleeding under the real renderer.

## Primary documentation

- [Godot 4.7 Image](https://docs.godotengine.org/en/4.7/classes/class_image.html)
- [Godot 4.7 Texture2D](https://docs.godotengine.org/en/4.7/classes/class_texture2d.html)
- [Unity sprite import settings](https://docs.unity3d.com/Manual/texture-type-sprite.html)
- [Phaser asset concepts](https://docs.phaser.io/phaser/concepts/loader)
- [PixiJS Assets guide](https://pixijs.com/8.x/guides/components/assets)



### [Reference: create-game-assets / three-d-pipeline.md]

# 3D concept-to-runtime pipeline

Use this reference when the output is a model, material, texture set, rig, animation, or 3D prop
family. An appealing render proves appearance only; it does not prove production geometry.

## Default pipeline

1. Lock camera/view, scale, gameplay footprint, material language, polygon/texture budgets, target
   engine, renderer, and platform.
2. Create or select orthographic/turnaround concepts with consistent proportions. Treat generated
   multi-view sheets as references that still require geometric interpretation.
3. Author or clean the model in a DCC such as Blender. Inspect topology, normals, watertightness,
   UVs, texel density, material slots, rig, weights, and animation clips.
4. Apply/normalize transforms and set a gameplay-meaningful origin and pivot.
5. Create simplified collision proxies. Do not use a detailed render mesh as default collision.
6. Define LODs and material/texture reuse for repeated or distant objects.
7. Export using the engine's preferred interchange path. Use GLB/glTF 2.0 as the general runtime
   delivery default when the target supports it; keep editable DCC sources separately.
8. Import into the real engine, check scale/orientation/materials/animation, profile memory and draw
   calls, and capture representative screenshots before approval.

## Geometry gates

- silhouette fits gameplay and LOD transitions preserve it
- no accidental internal faces, non-manifold regions, inverted normals, or degenerate geometry
- deformation loops support the required rig motion
- pivots/origins support doors, wheels, pickups, weapons, placement, and snapping
- units and forward/up axes match the project convention
- collision proxies match gameplay intent without excessive detail

## Material and texture gates

- use consistent PBR channel conventions and color spaces
- avoid baking lighting into base color unless the art direction explicitly requires it
- pack channels only when the target pipeline documents the mapping
- keep texel density consistent across an asset family
- size textures from on-screen coverage; source resolution is not a runtime budget
- reuse materials/atlases where it reduces draw calls without harming iteration
- validate normal-map orientation and compression in the target renderer

## Generated 3D caution

If a tool can generate meshes, inspect the result with the same gates as an authored mesh. Never
infer clean topology, UVs, rigging, licensing, or efficient materials from a preview render. Keep
the tool/version and generation input in the asset manifest.

## Primary documentation

- [Khronos glTF registry and 2.0.1 specification](https://registry.khronos.org/glTF/)
- [Godot 4.7 importing 3D scenes](https://docs.godotengine.org/en/4.7/tutorials/assets_pipeline/importing_3d_scenes/index.html)
- [Unity model import settings](https://docs.unity3d.com/Manual/class-ModelImporter.html)
- [Unreal Engine importing static meshes](https://dev.epicgames.com/documentation/en-us/unreal-engine/importing-static-meshes-using-fbx-in-unreal-engine)
- [three.js GLTFLoader](https://threejs.org/docs/#examples/en/loaders/GLTFLoader)



### [Asset Doc: create-game-assets / art-direction-brief.md]

# Art direction brief

## Game frame

- Player fantasy:
- Core verbs:
- Engine and renderer:
- Target platforms:
- Camera/view/facing:
- Native viewport and common display scale:
- Typical asset size on screen:

## Visual system

- Shape language:
- Silhouette priorities:
- Value structure:
- Palette roles and exact swatches:
- Materials and surface cues:
- Edge/line treatment:
- Lighting direction and contrast:
- Detail density and focal hierarchy:
- Motion character:
- Explicit exclusions:

## Technical contract

- Asset dimensions/aspect:
- Alpha/background:
- Grid/tile/frame size:
- Anchor/pivot/baseline:
- Filtering/mipmaps/compression:
- Color space:
- Texture/poly/material budgets:
- Naming and folders:

## Visual target

- Approved seed/reference paths:
- Required do/don't examples:
- Native-scale gameplay capture:
- Approval owner/date:



---


<a id="development--code-reviewer"></a>
# SKILL: development--code-reviewer

---
name: code-reviewer
description: Professional code review skill. Review local changes or PRs for correctness, maintainability, and best practices.
  Based on playbooks.com community skill. Use when working with code reviewer.
domain: development
author: oyi77
license: Apache-2.0
subdomain: software-development
tags:
- code
- coding
- reviewer
- software-engineering
- testing
persona: "name: \"Linus Torvalds\"\n  title: \"The Kernel Guardian - Master of Code Quality\"\n  expertise: [\"Code Review\"\
  , \"C Programming\", \"Linux Development\", \"Git\", \"Open Source\"]\n  philosophy: \"Talk is cheap. Show me the code.\"\
  \n  credentials:\n    - \"Created Linux kernel (used by 3B+ devices)\"\n    - \"Created Git (version control used by 90%\
  \ of devs)\"\n    - \"Maintains Linux with 20M+ lines of code\"\n    - \"Known for brutal but fair code reviews\"\n    -\
  \ \"Linux Foundation Technical Advisory Board\"\n  principles:\n    - \"Code quality matters more than developer feelings\"\
  \n    - \"Simplicity is better than complexity\"\n    - \"No broken window - fix small issues immediately\"\n    - \"Show\
  \ me the code, not the excuses\"\n    - \"Performance matters at scale\"\n    - \"Security is not optional\"\n    - \"Break\
  \ things to learn, then fix properly\"\n"
version: 1.0.0
---


# Code Reviewer Skill

## Overview

Perform professional code reviews targeting local changes or remote PRs to improve correctness and maintainability. This skill is based on the popular code-reviewer skill from playbooks.com.

**Purpose**: Professional code reviews  
**Scope**: Any codebase  
**Output**: Actionable feedback

---


## Anti-Rationalization Table

| Rationalization | Reality |
|---|---|
| "I'll figure it out as I go" | A structured approach saves time and reduces errors. Follow the workflow in this skill rather than improvising. |
| "I already know this topic" | Familiarity breeds shortcuts. Use the checklist to verify you haven't missed critical steps. |
| "This doesn't apply to my situation" | The patterns here generalize across contexts. Adapt, don't skip — the underlying principles hold. |
| "One more tool will fix it" | Adding complexity rarely solves process gaps. Master the core workflow first. |

## When to Use
**Trigger phrases:**
- "code reviewer"
- "Professional code review skill"


- Review PRs before merging
- Review local changes before committing
- Improve code quality
- Catch bugs early
- Ensure best practices

## When NOT to Use

- Trivial changes (< 10 lines, obvious fix) - quick self-review is enough
- Emergency hotfixes - review after deployment, not before
- Auto-generated code (formatting, builds) - review the generator instead
- WIP branches - wait until feature is complete
- Personal experiment branches that won't be merged

---

## Review Process

- Configure based, best, changes, code, community settings before first use


### 1. Gather Context
```
1. Identify the scope of changes
2. Understand the codebase structure
3. Check related tests
4. Look at dependency changes
```

### 2. Analyze Changes
```
1. Check for correctness
2. Look for edge cases
3. Verify error handling
4. Check security issues
5. Assess performance impact
```

### 3. Provide Feedback
```
1. Categorize issues (blocking, suggested, optional)
2. Provide specific examples
3. Suggest alternatives
4. Acknowledge good patterns
```

---

## Review Checklist

- Configure based, best, changes, code, community settings before first use


### Correctness
- Does the code do what it's supposed to?
- Are edge cases handled?
- Are there potential runtime errors?
- Does it handle null/undefined?

### Security
- Input validation
- SQL injection prevention
- XSS prevention
- Authentication/authorization
- Secrets management

### Performance
- Database queries optimization
- Memory usage
- Algorithmic complexity
- Caching opportunities

### Maintainability
- Code organization
- Naming conventions
- Comment quality
- Function complexity
- Test coverage

### Best Practices
- Language idioms
- Framework conventions
- Design patterns
- Error handling
- Logging

---

## Output Format

- Configure based, best, changes, code, community settings before first use


### Summary
```
## Code Review Summary

- Configure based, best, changes, code, community settings before first use


### Overall
- **Verdict**: [Approve / Request Changes / Approve with Comments]
- **Issues Found**: X blocking, Y suggested, Z optional

### Files Changed
- [file1.ts] - X changes
- [file2.js] - Y changes
```

### Detailed Feedback
```
## Issues

- Configure based, best, changes, code, community settings before first use


### 🔴 Blocking (Must Fix)
1. [File:Line] - Issue description
   - Why it's a problem
   - Suggested fix

### 🟡 Suggested (Recommended)
1. [File:Line] - Suggestion
   - Rationale
   - Example

### 🟢 Optional (Nice to Have)
1. [File:Line] - Optional improvement
```

---

## Integration

- Configure based, best, changes, code, community settings before first use


### With GitHub
```
1. Run: gh pr view <number> --json body
2. Get diff: gh pr diff <number>
3. Review and comment
```

### With Git
```
1. Get changes: git diff HEAD~1
2. Analyze code
3. Generate feedback
```

---

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "This is a trivial change, skip review" | Even 1-line changes can break production - always review |
| "I'll fix the small issues later" | Small issues accumulate - fix them now (Broken Windows Theory) |
| "The tests pass, that's enough" | Tests passing doesn't mean code is readable or maintainable |
| "I don't want to hurt their feelings" | Honest feedback makes better code - be kind but direct |
| "This follows the pattern used elsewhere" | If the pattern is wrong, don't replicate it - suggest improvement |
| "It's too late to change the architecture" | Better to fix it now than live with bad architecture longer |

## Red Flags

- Approving PRs without checking out the branch locally
- Review comments that only say "LGTM" or "Looks good"
- Skipping security review for auth/login changes
- Not running tests before approving
- Ignoring failing CI checks
- Approving code you don't understand
- Review time > 3 days for small PRs

## Best Practices

Recommended practices for code-reviewer.

- Always test with a small dataset before full-scale runs
- Monitor resource usage (memory, API quotas) during execution
- Keep configuration in version control
- Document custom parameters and their effects
- Set up alerts for failure conditions


### Do's
✅ Be specific and actionable  
✅ Provide code examples  
✅ Acknowledge good patterns  
✅ Consider the author's intent  
✅ Focus on important issues  

### Don'ts
❌ Don't be nitpicky  
❌ Don't rewrite code without explaining  
❌ Don't ignore context  
❌ Don't forget security  

---


---

## Verification

After completing a code review, confirm:

- [ ] Review covers all changed files (none skipped)
- [ ] Each blocking issue (🔴) has clear fix suggestion with code example
- [ ] Security-sensitive changes (auth, payments, API) verified explicitly
- [ ] Tests exist for new functionality (or explicit note why not)
- [ ] Linter passes on changed files (no type errors, no lint warnings)
- [ ] Review verdict is clear: **Approve** / **Request Changes** / **Approve with Comments**
- [ ] Author can act on feedback without needing clarification

## Version History

- **v1.0** (2026-02-27) - Initial creation
  - Based on playbooks.com code-reviewer

---

## Related Skills

- [frontend-design](../../content/frontend-design/SKILL.md) - Design skills
- testing - Test coverage
- [skill-performance-monitor](../../core/skill-performance-monitor/SKILL.md) - Track improvements

## Process

1. Analyze the task requirements
2. Apply domain expertise
3. Verify output quality



---


<a id="development--code-simplification"></a>
# SKILL: development--code-simplification

---
name: code-simplification
description: Simplifies code for clarity. Use when code is overly complex, has unnecessary abstractions, or when refactoring
  for readability.
domain: development
author: oyi77
license: Apache-2.0
subdomain: software-development
tags:
- code
- coding
- simplification
- software-engineering
- testing
version: 1.0.0
---


# Code Simplification Skill

Simplifies code to improve clarity and maintainability. Prioritizes readability over cleverness.

## Overview

This skill helps you refactor complex code into simpler, more understandable versions. It's about making code easier to read, reason about, and maintain—not about writing the shortest possible code. The goal is to remove unnecessary complexity while preserving functionality.

## When to Use

**Trigger phrases:**
- "code simplification"
- "When code has overly complex logic that's hard to understand"
- "When there are unnecessary abstractions or layers"
- "When refactoring for readability during code review"


- When code has overly complex logic that's hard to understand
- When there are unnecessary abstractions or layers
- When refactoring for readability during code review
- When removing dead code or unused functionality
- When debugging and the code is too convoluted to follow
- When onboarding new developers and code is confusing

## The Process

1. **Identify complexity** – Read the code and pinpoint what makes it hard to understand (complex conditionals, nested logic, unclear naming, unnecessary abstractions)

2. **Simplify** – Refactor to improve clarity:
   - Rename variables/functions for clarity
   - Flatten nested conditionals
   - Extract complex expressions into named variables
   - Remove duplicate code
   - Replace clever tricks with straightforward approaches
   - Remove dead code and unused features

3. **Verify behavior unchanged** – Ensure functionality is preserved:
   - Run tests to confirm nothing broke
   - Manually verify behavior if no tests exist
   - Compare outputs before and after refactoring

4. **Commit** – Merge the simplification with a descriptive commit message

## When NOT to Use

- Task is about deployment, not development (use deploy skills)
- Task is about code review, not writing (use review skills)
- You need to understand existing code first (use research skills)
- Task is about testing only (use test skills)
- Requirements are unclear (clarify first)
- Task is trivially simple (single line fix)


## Red Flags

- **Simplifying working code without tests** – Removing complexity blindly can introduce bugs. Always have tests or verify behavior first.

- **Removing "unused" code that actually has hidden dependencies** – Just because code looks unused doesn't mean it's safe to delete. Check references, dynamic access, or runtime behavior.

- **Over-simplifying to the point of losing functionality** – Sometimes complexity exists for a reason. Simplify for clarity, not for the sake of fewer lines.

- **Refactoring without understanding** – Don't change code you don't understand. First understand the purpose, then simplify.

- **Making things "simpler" that are actually more fragile** – Simplicity should mean clearer intent, not fewer safeguards.

## Verification

- Tests pass after refactoring
- Behavior is unchanged (same inputs produce same outputs)
- Code is measurably simpler:
  - Fewer lines of code (where meaningful)
  - Lower cognitive complexity (decision points are easier to trace)
  - Clearer naming and structure
  - Reduced nesting and fewer conditional branches
- Code review feedback confirms improved readability
## Notes

- This skill integrates with the broader 1ai-skills ecosystem for development workflows
- Combine with related skills for maximum impact across your pipeline
- Monitor output quality and iterate on configuration based on results
- Keep dependencies up to date for security and performance
- Document custom workflows and configurations for team knowledge sharing

## Process

```python
# Example: TDD workflow
def test_user_creation():
    user = create_user(name="Alice", email="alice@example.com")
    assert user.name == "Alice"
    assert user.email == "alice@example.com"
    assert user.created_at is not None

def test_user_creation_invalid_email():
    with pytest.raises(ValidationError):
        create_user(name="Alice", email="invalid")
```

1. Analyze the task requirements
2. Apply domain expertise
3. Verify output quality

## Anti-Rationalization Table

| Rationalization | Reality |
|---|---|
| "Tests slow me down" | Bugs slow you down 10x more. Tests are speed, not overhead. |
| "I will refactor later" | Technical debt compounds. Refactor as you go. |
| "It works on my machine" | If it is not in CI, it does not work. Ship proof, not claims. |


---


<a id="development--git-workflow-mastery"></a>
# SKILL: development--git-workflow-mastery

---
name: git-workflow-mastery
description: Master Git workflows including branching strategies, interactive rebase, cherry-pick, bisect, worktrees, and advanced merge conflict resolution. Use when working with git workflow mastery.
domain: development
author: oyi77
license: Apache-2.0
subdomain: software-development
tags:
- git
- version-control
- branching
- rebase
- worktrees
- merge
version: 1.0.0
---

# Git Workflow Mastery

## When to Use
**Trigger phrases:**
- "git workflow mastery"
- "Master Git workflows including branching strategies, interactive rebase, cherry-"


- When setting up branching strategy for a team
- When resolving complex merge conflicts
- When bisecting to find bug-introducing commits
- When managing multiple features in parallel with worktrees
- When cleaning up commit history before a PR
- When recovering from a broken Git state (detached HEAD, lost commits)
- When setting up CI/CD pipeline triggers per branch

## When NOT to Use

- For simple add-commit-push workflows
- When the team already has a working Git workflow
- When you only need to clone and pull — no branching or history manipulation

## Overview

Advanced Git workflows for professional development teams. Covers Git Flow, GitHub Flow, trunk-based development, interactive rebase, worktrees, and conflict resolution. This skill assumes you already know `git add`, `git commit`, `git push`, and `git pull`. It covers the next tier: history manipulation, parallel workspace management, binary-search debugging, and safe collaboration patterns.

Git is a Directed Acyclic Graph (DAG) of commits. Understanding this — that branches are just pointers, that rebase rewrites topology, that the reflog tracks every pointer movement — is the foundation of mastery. Every operation in this skill builds on that mental model.

## Branching Strategies

### Git Flow (release-oriented)

```
main        ───●──────●────────────●──────────
                \    /            /
develop         ●──●──●──●──●──●──●──●
                     \    /  \    /
feature/foo          ●──●    ●──●
                              \
release/v1.1                  ●──●
```

Best for projects with scheduled releases and long-lived feature branches.

```bash
# Initialize Git Flow (default branch names)
git flow init -d

# Start a feature
git flow feature start user-auth
# Work, commit, then finish (merges to develop)
git flow feature finish user-auth

# Start a release
git flow release start v1.1.0
# Bump version, fix last bugs, then finish (merges to main + develop)
git flow release finish v1.1.0

# Hotfix from main
git flow hotfix start 1.1.1
git flow hotfix finish 1.1.1
```

### GitHub Flow (continuous deployment)

```
main  ●──●──●──●──●──●──●──●──●
         \    /      \    /
feat     ●──●        ●──●
```

One permanent branch (`main`). Feature branches branch off, are reviewed via PR, and merge back. Deploy after every merge.

```bash
# Start from up-to-date main
git checkout main
git pull origin main
git checkout -b feat/user-auth

# Work, commit, push for review
git push -u origin feat/user-auth

# After PR merges, delete local branch
git branch -d feat/user-auth
git fetch origin --prune
```

### Trunk-Based Development (fast CI)

```
main  ●──●──●──●──●──●──●──●──●──●
         \/          \/
         └─short-lived─┘
```

Short-lived feature branches (hours, not days). No branch lives longer than one sprint. Every commit to main is deployable.

```bash
# Ultra-short feature branch
git checkout -b fix/login-crash
git commit -m "fix: handle null session in login handler"
git push -u origin fix/login-crash
# PR → merge immediately
```

**Branch naming conventions:**

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feat/` | New feature | `feat/user-auth` |
| `fix/` | Bug fix | `fix/login-crash` |
| `chore/` | Maintenance | `chore/upgrade-deps` |
| `docs/` | Documentation | `docs/api-readme` |
| `refactor/` | Code restructuring | `refactor/auth-module` |
| `test/` | Adding tests | `test/auth-flow` |
| `perf/` | Performance | `perf/query-cache` |
| `release/` | Release prep | `release/v1.1.0` |

### Conventional Commits

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

```bash
# Standard
git commit -m "feat(auth): add OAuth2 login flow"

# Breaking change (note the !)
git commit -m "feat(api)!: change response format from XML to JSON"

# With body (multiline)
git commit -m "fix(cache): evict stale entries on write

Previously the cache only evicted on TTL expiry.
Now it evicts the stale key on every write to prevent
serving outdated data during high-throughput writes.

Closes #142"
```

## Interactive Rebase

Interactive rebase rewrites commit history by reordering, squashing, fixing up, dropping, or rewording commits. Use it before opening a PR to present a clean, logical history.

### Basic Operations

```bash
# Rebase the last 3 commits
git rebase -i HEAD~3

# This opens an editor with:
# pick a1b2c3d feat: add login form
# pick e4f5g6h fix: validate email field
# pick i7j8k9l fix: handle empty password
```

**Rebase commands:**

| Command | Short | Effect |
|---------|-------|--------|
| `pick` | `p` | Use commit as-is |
| `reword` | `r` | Edit commit message only |
| `squash` | `s` | Combine with previous commit, keep both messages |
| `fixup` | `f` | Combine with previous commit, discard message |
| `drop` | `d` | Remove commit entirely |
| `edit` | `e` | Stop to amend commit content |

### Squash Worked Commits

```bash
# Before: messy history with 6 fixup commits
# After: one clean feature commit

# Step 1: find the base commit (before your feature branch)
git merge-base HEAD main
# Returns: abc1234

# Step 2: rebase onto main (also integrates latest changes)
git rebase -i main
# In the editor, reorder so your feature commits are together,
# then mark them as 'squash' or 'fixup'

# Step 3: resolve any conflicts during rebase
git add <resolved-file>
git rebase --continue
```

### Split a Commit

```bash
# Start an edit on the commit to split
git rebase -i HEAD~3
# Mark the target commit as 'edit' (e), save, close

# Reset to the commit before it, keeping changes staged
git reset HEAD^

# Now stage files in logical groups
git add src/auth/
git commit -m "feat(auth): add login handler"
git add src/db/
git commit -m "feat(db): add users migration"
git add tests/
git commit -m "test(auth): add login flow tests"

git rebase --continue
```

### Reorder Commits

```bash
# In the rebase editor, move lines up/down.
# Safer to move dependent commits after their dependencies.

# Git will replay commits in the order listed.
# Conflicts may arise if adjacent commits touch the same files.
```

### Rebase onto a Different Branch

```bash
# Rebase feature branch onto latest main
git checkout feat/user-auth
git rebase main

# If feature is based on another feature that was merged
git rebase --onto main base-branch feat/user-auth
# Takes commits from base-branch..feat/user-auth and replays on main
```

### Edit the Root Commit

```bash
# First commit is special — --root reaches it
git rebase -i --root
```

## Cherry-Pick

Apply specific commits from one branch to another without merging the full history.

### Basic Cherry-Pick

```bash
# Apply a single commit to current branch
git checkout release/v1.0
git cherry-pick abc123

# Apply a range of commits (exclusive of first, inclusive of last)
git cherry-pick abc123..def456

# Apply from a different branch without checking it out
git cherry-pick feature/new-api -- src/api/handler.ts
```

### Cherry-Pick Options

```bash
# Don't create commits, just apply changes to working tree
git cherry-pick -n abc123

# Keep original authorship but edit message
git cherry-pick -e abc123

# Add a note in the commit message saying where it came from
git cherry-pick -x abc123
# Results in: "(cherry picked from commit abc123)" in message

# Preserve the original committer date
git cherry-pick --no-commit-date abc123
```

### Cherry-Pick with Conflicts

```bash
git cherry-pick abc123
# CONFLICT in src/app.ts

# Fix conflicts, then:
git add src/app.ts
git cherry-pick --continue

# Or abort entirely:
git cherry-pick --abort
```

### Cherry-Pick Strategy for Hotfix Backport

```bash
# 1. Fix on main
git checkout main
git commit -m "fix: resolve payment race condition"

# 2. Get the commit hash
HASH=$(git rev-parse HEAD)

# 3. Backport to release branch
git checkout release/v1.0
git cherry-pick "$HASH"
```

### Cherry-Pick a Branch onto Another

```bash
# Apply all commits on feature-branch that aren't on main
git cherry-pick main..feature-branch
```

## Bisect

Binary-search through history to find the exact commit that introduced a bug. Works in O(log n) time — 10 steps for 1000 commits.

### Manual Bisect

```bash
# Start bisect session
git bisect start

# Mark current commit as bad (has the bug)
git bisect bad                     # or: git bisect bad HEAD

# Mark a known-good commit (before bug appeared)
git bisect good v1.0               # or: git bisect good abc1234

# Git checks out a midpoint commit. Test it, then:
git bisect good   # if bug is absent
git bisect bad    # if bug is present

# Repeat until Git identifies the first bad commit
# abc1234 is the first bad commit
```

### Scripted Bisect (Fully Automated)

Write a test script that exits 0 (good) or non-zero (bad):

```bash
# Create a test script that reproduces the bug
cat > /tmp/test-bug.sh << 'EOF'
#!/bin/bash
# Build and run the test
npm run build
npm test -- --grep "login should fail with invalid token"
EOF
chmod +x /tmp/test-bug.sh

# Let bisect run it automatically
git bisect start HEAD v1.0
git bisect run /tmp/test-bug.sh
# Git outputs: "abc1234 is the first bad commit"
```

### Bisect with Skip (Flaky Tests)

```bash
# If a commit can't be tested (build breaks unrelated to your bug)
git bisect start HEAD v1.0
git bisect run /tmp/test-bug.sh
# If it hangs or fails to build, git bisect run will mark it as
# untestable (skip) and try other commits

# Manual skip:
git bisect skip
```

### Bisect with Logging

```bash
# Log each bisect step for debugging
git bisect start HEAD v1.0
git bisect run sh -c "npm run build && npm test 2>&1 | tee /tmp/bisect-log.txt"
```

### Bisect Reset

```bash
# Always reset when done, even if you cancel mid-way
git bisect reset
```

## Worktrees

Git worktrees allow checking out multiple branches simultaneously in separate directories, all sharing the same Git repository.

### Basic Worktree Operations

```bash
# Create a worktree for a new feature branch
git worktree add ../feat/user-auth -b feat/user-auth

# Create a worktree on an existing branch
git worktree add ../fix/crash fix/login-crash

# List all worktrees
git worktree list
# /repo/main           abc1234 [main]
# /repo/../feat/auth   def5678 [feat/user-auth]
# /repo/../fix/crash   987def6 [fix/crash]
```

### Worktree Lifecycle

```bash
# Create worktree with a specific commit (detached HEAD)
git worktree add ../debug/deploy-tag v1.0.0

# Create worktree and lock it (prevents pruning)
git worktree add --lock ../release/v1.1 release/v1.1

# Remove a worktree (safe — doesn't lose commits)
git worktree remove ../feat/user-auth

# Remove a locked worktree
git worktree remove --force ../release/v1.1

# Prune stale worktree references (after manually deleting the directory)
git worktree prune
```

### Worktree for Code Review

```bash
# Review a PR branch without disturbing your current work
git worktree add ../review/pr-42 feature/pr-42
cd ../review/pr-42
npm install
npm test
# Review done: remove cleanly
cd /repo/main
git worktree remove ../review/pr-42
```

### Worktree for Emergency Hotfix

```bash
# Current branch: feat/user-auth (mid-work, dirty tree)
# Emergency: fix production crash

# Create worktree on main → hotfix branch
git worktree add ../hotfix/crash main
cd ../hotfix/crash
git checkout -b hotfix/payment-null
# Fix, commit, push, PR
git add .
git commit -m "fix: handle null payment amount"
git push -u origin hotfix/payment-null

# Delete worktree after merge
cd /repo/main
git worktree remove ../hotfix/crash
```

### Worktree with .gitignore Safety

```bash
# Always add the worktree directory to .gitignore
echo ".worktrees/" >> .gitignore
git add .gitignore
git commit -m "chore: ignore worktree directory"

# Create worktree inside the project (cleaner)
git worktree add .worktrees/my-feature -b feat/new-feature
```

## Common Issues & Troubleshooting

### Detached HEAD State

**What happened:** You checked out a commit hash instead of a branch name. HEAD points directly to a commit, not a branch reference.

```text
You are in 'detached HEAD' state. You can look around, make experimental
changes and commit them, and you can discard any commits you make in this
state without impacting any branches...
```

**Recovery scenarios:**

```bash
# Scenario 1: You just want to go back to a branch (no new commits)
git checkout main

# Scenario 2: You made commits and want to keep them
git checkout -b new-branch-name
# Now your commits are on 'new-branch-name'
# Then merge or PR as normal

# Scenario 3: You made commits and want them on an existing branch
git checkout existing-branch
git cherry-pick detached-branch..HEAD
# Replace detached-branch with the commit hash you started at

# Scenario 4: You made commits but don't want them
git checkout main  # Git warns you, but it's fine
# The commits will eventually be garbage-collected
```

### Complex Merge Conflict Resolution

**Step-by-step for nasty conflicts:**

```bash
# When rebase hits a conflict:
git rebase main
# CONFLICT (content): Merge conflict in src/config.ts

# 1. Open the conflicted file
#    <<<<<<< HEAD       — current branch's version
#    =======            — divider
#    >>>>>>> featur     — incoming branch's version

# 2. Resolve manually, or use a merge tool
git mergetool           # Opens configured tool (vimdiff, VS Code, etc.)

# 3. Once resolved:
git add src/config.ts
git rebase --continue

# To abort the entire rebase:
git rebase --abort
```

**Conflict patterns and resolutions:**

| Conflict Pattern | Strategy |
|---|---|
| Both sides added the same function | Compare implementations, keep the correct one |
| One side deleted, other modified | `git checkout --ours/--theirs src/file.ts` to pick |
| Whitespace/formatting only | `git rebase -X theirs` to auto-resolve with incoming |
| Binary file conflict | Pick one side: `git checkout --theirs logo.png` |
| Rename/add conflict | Manually reconcile the rename with the new file |
| Multiple files, same pattern | Use a script to batch-resolve known-safe patterns |

```bash
# Accept all 'ours' or 'theirs' for a specific file
git checkout --ours src/config.ts
git add src/config.ts

# Accept all 'ours' for ALL conflicted files
git diff --name-only --diff-filter=U | xargs git checkout --ours
git add -u
```

### Reflog Recovery (Lost Commits)

**When you need it:** After a bad rebase, accidental branch delete, or `git reset --hard` that went too far.

```bash
# View every action that moved HEAD
git reflog
# abc1234 HEAD@{0}: checkout: moving from main to feat/auth
# def5678 HEAD@{1}: commit: fix: handle empty username
# 9876abc HEAD@{2}: commit: feat: add login form
# fedcba9 HEAD@{3}: rebase finished: returning to refs/heads/feat/auth

# Restore to a previous state
git reset --hard HEAD@{2}

# Or create a branch at a reflog entry (safer)
git branch recover-branch HEAD@{3}

# View reflog for a specific branch
git reflog show feat/auth

# Show reflog timeline with relative times
git reflog --date=relative
```

### Force Push Safety

```bash
# Safe force push — only succeeds if your local branch is based on
# the remote's current tip (prevents overwriting others' work)
git push --force-with-lease origin feat/auth

# Even safer: specify expected remote ref
git push --force-with-lease=feat/auth:origin/feat/auth

# Nuclear option (use ONLY on personal branches)
git push --force origin feat/auth
```

### Lost Work After Stash Drop

```bash
# List all stashes, including dropped ones
git fsck --unreachable | grep commit | cut -d' ' -f3 | xargs git log --mergeless --oneline

# Or use gitk to explore dangling commits
gitk --all $(git fsck --unreachable | grep commit | cut -d' ' -f3)

# Create a branch from the dangling commit
git branch recover-stash abc1234
```

### Undoing Things

```bash
# Undo last commit but keep changes staged
git reset --soft HEAD~1

# Undo last commit and unstage changes
git reset --mixed HEAD~1    # (default)

# Undo last commit and discard changes entirely
git reset --hard HEAD~1

# Undo a published commit (creates a new commit)
git revert HEAD
git revert abc1234          # Revert specific commit

# Amend the last commit (don't do this after push)
git add forgotten-file.ts
git commit --amend --no-edit

# Amend message only
git commit --amend -m "fix: better commit message"
```

### Cleanup and Optimization

```bash
# Remove local branches that no longer exist on remote
git fetch --prune
git branch -vv | grep ': gone]' | awk '{print $1}' | xargs git branch -d

# Squash all fixup commits in your branch
git rebase -i --autosquash main
# (use git commit --fixup=HASH during development for auto-matching)

# Compact repository (reduces disk usage)
git gc --aggressive --prune=now

# Remove untracked files
git clean -fd          # Dry-run first with -n
git clean -fdn         # Preview what will be removed
```

## Red Flags

| Situation | Risk | Action |
|-----------|------|--------|
| Force pushing to shared branches | Destroys collaborators' history | Use `--force-with-lease` or never force push |
| Rebasing a branch others have pulled | Divergent histories, confusion | Communicate before force-push; coordinate pull timing |
| Interactive rebase on published commits | Rewriting public history | Only rebase unpublished commits |
| Cherry-pick without `-x` on hotfix branches | No traceability back to source | Use `-x` to annotate cherry-picks |
| Merge commits in a feature branch | Cluttered history before review | Squash or rebase before PR |
| Working with dirty working tree | Accidental commit of unrelated changes | Commit or stash before switching context |
| Long-lived feature branches | Merge hell, integration pain | Keep branches <1 sprint; rebase daily |
| Not running `git worktree prune` after manual delete | Stale worktree references | Prune after removing worktree directories |
| Using `git reset --hard` without checking `git status` | Losing uncommitted work | Always `git stash` or check `status` first |

## Monetization

This skill generates income through the following channels:

### 1. Git Workflow Consulting ($150-400/hr)

Companies adopting Git or migrating from centralized VCS (SVN, TFS, Perforce) need workflow setup and team training.

**Services:**
- Branch strategy design and CONTRIBUTING.md documentation
- CI/CD trigger setup per branch strategy
- Migration from SVN/TFS to Git with history preservation
- Team training workshop (half-day or full-day)
- Code review culture implementation using GitHub/GitLab flows

**Outreach:** Target startups scaling from 5→20+ engineers (the point where Git chaos sets in).

### 2. Automated Git Audit Tool ($500-2,000/project)

Build a CLI tool that scans a repo and reports:
- Branch naming convention violations
- Merge commit frequency in feature branches
- Commit message quality (Conventional Commits compliance)
- Stale branch age and count
- Large file tracking and BFG cleanup candidates

```bash
# Example output:
$ git-audit .
❌ Branch naming: 3 branches don't match convention (fix/ vs fix-)
❌ Merge commits: 12 merge commits in feature branches
⚠️  Commit quality: 40% pass Conventional Commits
ℹ️  Stale branches: 8 branches untouched >30 days
ℹ️  Large files: 2 files >10MB should use Git LFS
```

### 3. Emergency Git Recovery Service ($100-500/incident)

Developers frequently lose work through bad rebases, force pushes, or accidental branch deletion. Offer a recovery service:

```bash
# Example recovery workflow for a client
ssh client-server
cd /repo
git reflog
# Find lost state
git branch rescue-branch HEAD@{5}
git format-patch main..rescue-branch --stdout > recovery.patch
# Apply on client's fresh clone
```

Package this as an automated CLI tool + premium human-assisted recovery.

### 4. Git Automation Scripts / SaaS ($10-50/month per seat)

Build scripts that automate common complex workflows:

```bash
# Example: automated release branch creation + version bump
git-auto-release --type minor --message "release: v1.2.0"

# Example: bulk rebase all feature branches onto updated main
git-rebase-all

# Example: squash all fixup commits across all branches
git-bulk-squash
```

Sell as npm package or marketplace extension (GitHub Actions, GitLab CI templates).

### 5. Training Content ($27-297/course)

- "Git Mastery for Teams" — video course (6 modules, 3 hours)
- "Git Recovery Playbook" — PDF guide with 20 disaster-recovery scenarios
- "Git Workflow Templates" — reusable branching docs + hooks scripts

### 6. Internal Adoption for Your Team

Directly reduces integration time, CI pipeline failures, and onboarding overhead:
- **Measured impact:** Teams adopting Git Flow or trunk-based development reduce merge-conflict resolution time by 60-80%
- **Onboarding:** New engineers reach shipping velocity 2-3x faster with documented conventions
- **CI reliability:** Clean history means cleaner CI triggers — fewer false-positive failures

## Verification

- [ ] Branch strategy documented in CONTRIBUTING.md
- [ ] Commit messages follow Conventional Commits
- [ ] PRs have clean, squashed history
- [ ] No merge conflicts on main branch
- [ ] All team members understand the chosen branching model
- [ ] Reflog checked when recovering lost work
- [ ] Worktrees cleaned up after feature completion (`git worktree prune`)
- [ ] Test suite passes after every rebase operation
- [ ] CI pipeline triggers correctly per branch type
- [ ] Remote branches pruned with `git fetch --prune` on schedule

## Process

1. **Prepare** — Gather requirements, verify prerequisites, set up environment
2. **Choose strategy** — Select branching model based on release cadence (Git Flow, GitHub Flow, trunk-based)
3. **Branch naming** — Use convention: feat/, fix/, chore/, docs/, refactor/, test/, perf/
4. **Commit messages** — Follow Conventional Commits format with scope and body
5. **Interactive rebase** — Clean up history before merge using squash, fixup, reword
6. **Cherry-pick** — Apply specific commits to other branches for hotfix backport
7. **Bisect** — Binary search for bug-introducing commits using manual or scripted mode
8. **Worktrees** — Parallel work on multiple branches with lifecycle management
9. **Verify** — Validate output meets requirements, document results, clean up

## Anti-Rationalization Table

| Rationalization | Reality |
|---|---|
| "I will clean up commits later" | You never do. Interactive rebase before every PR. |
| "Force push is fine on my branch" | Force push destroys history. Use --force-with-lease if you must. |
| "Merge commits are fine" | Squash or rebase keeps history linear and readable |
| "Git bisect is overkill" | It finds the exact bug-introducing commit in O(log n) time |
| "I can just reset --hard and redo it" | You lose uncommitted work and the reflog entry might be your only lifeline |
| "The merge conflict is too complex, I'll start over" | Conflict resolution is a skill. Use mergetool, learn the patterns, persist. |
| "Worktrees are just for large projects" | Any project with context-switching benefits from isolated workspaces |
| "Reflog is only for emergencies" | Check reflog regularly — it's the best undo button you have |



---


<a id="development--systematic-debugging"></a>
# SKILL: development--systematic-debugging

---
name: systematic-debugging
description: Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes
domain: development
author: oyi77
license: Apache-2.0
subdomain: software-development
tags:
- coding
- debugging
- software-engineering
- systematic
- testing
persona: "name: \"Richard Feynman\"\n  title: \"The Great Explainer - Master of Root Cause Analysis\"\n  expertise: [\"Root\
  \ Cause Analysis\", \"Scientific Method\", \"Problem Decomposition\", \"Hypothesis Testing\"]\n  philosophy: \"The first\
  \ principle is that you must not fool yourself - and you are the easiest person to fool.\"\n  credentials:\n    - \"Nobel\
  \ Prize in Physics for work on quantum electrodynamics\"\n    - \"Investigated the Challenger disaster\"\n    - \"Famous\
  \ for explaining complex ideas simply\"\n  principles:\n    - \"Write down what you know\"\n    - \"Write down what you\
  \ think you know\"\n    - \"Test your assumptions\"\n    - \"The simplest explanation is usually the correct one\"\n"
version: 1.0.0
---


# Systematic Debugging

## Overview

Random fixes waste time and create new bugs. Quick patches mask underlying issues.

**Core principle:** ALWAYS find root cause before attempting fixes. Symptom fixes are failure.

**Violating the letter of this process is violating the spirit of debugging.**

## The Iron Law

```
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
```

If you haven't completed Phase 1, you cannot propose fixes.


## Anti-Rationalization Table

| Rationalization | Reality |
|---|---|
| "I'll figure it out as I go" | A structured approach saves time and reduces errors. Follow the workflow in this skill rather than improvising. |
| "I already know this topic" | Familiarity breeds shortcuts. Use the checklist to verify you haven't missed critical steps. |
| "This doesn't apply to my situation" | The patterns here generalize across contexts. Adapt, don't skip — the underlying principles hold. |
| "One more tool will fix it" | Adding complexity rarely solves process gaps. Master the core workflow first. |

## When to Use

**Trigger phrases:**
- "systematic debugging"
- "Any bug, test failure, or unexpected behavior"
- "Performance problems"
- "Build failures"

- Any bug, test failure, or unexpected behavior
- Performance problems
- Build failures

**Use especially when:**
- Under time pressure
- "Quick fix" seems obvious
- Previous fix didn't work

## Four Phases

- Configure before, behavior, debugging, encountering, failure settings before first use


### Phase 1: Root Cause Investigation

1. **Read errors carefully** — Don't skip warnings
2. **Reproduce consistently** — Can you trigger reliably?
3. **Check recent changes** — What changed recently?
4. **Trace data flow** — Find where bad value originates
5. **Add diagnostics** — In multi-component systems

### Phase 2: Pattern Analysis
- Find working examples in codebase
- Compare against references
- Identify differences

### Phase 3: Hypothesis & Testing
1. Form hypothesis: "X is root cause because Y"
2. Test with smallest change
3. Verify before continuing
4. If unknown, say "I don't know"

### Phase 4: Implementation
1. Create failing test first
2. Fix ONE thing at a time
3. Verify fix works
4. If 3+ fixes failed → question architecture
   - Is this pattern fundamentally sound?
   - Are we "sticking with it through sheer inertia"?
   - Should we refactor architecture vs. continue fixing symptoms?

   **Discuss with your human partner before attempting more fixes**

   This is NOT a failed hypothesis - this is a wrong architecture.

## Red Flags - STOP and Follow Process

If you catch yourself thinking:
- "Quick fix for now, investigate later"
- "Just try changing X and see if it works"
- "Add multiple changes, run tests"
- "Skip the test, I'll manually verify"
- "It's probably X, let me fix that"
- "I don't fully understand but this might work"
- "Pattern says X but I'll adapt it differently"
- "Here are the main problems: [lists fixes without investigation]"
- Proposing solutions before tracing data flow
- **"One more fix attempt" (when already tried 2+)**
- **Each fix reveals new problem in different place**

**ALL of these mean: STOP. Return to Phase 1.**

**If 3+ fixes failed:** Question the architecture (see Phase 4.5)

## your human partner's Signals You're Doing It Wrong

**Watch for these redirections:**
- "Is that not happening?" - You assumed without verifying
- "Will it show us...?" - You should have added evidence gathering
- "Stop guessing" - You're proposing fixes without understanding
- "Ultrathink this" - Question fundamentals, not just symptoms
- "We're stuck?" (frustrated) - Your approach isn't working

**When you see these:** STOP. Return to Phase 1.

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "Issue is simple, don't need process" | Simple issues have root causes too. Process is fast for simple bugs. |
| "Emergency, no time for process" | Systematic debugging is FASTER than guess-and-check thrashing. |
| "Just try this first, then investigate" | First fix sets the pattern. Do it right from the start. |
| "I'll write test after confirming fix works" | Untested fixes don't stick. Test first proves it. |
| "Multiple fixes at once saves time" | Can't isolate what worked. Causes new bugs. |
| "Reference too long, I'll adapt the pattern" | Partial understanding guarantees bugs. Read it completely. |
| "I see the problem, let me fix it" | Seeing symptoms ≠ understanding root cause. |
| "One more fix attempt" (after 2+ failures) | 3+ failures = architectural problem. Question pattern, don't fix again. |

## Quick Reference

| Phase | Key Activities | Success Criteria |
|-------|---------------|------------------|
| **1. Root Cause** | Read errors, reproduce, check changes, gather evidence | Understand WHAT and WHY |
| **2. Pattern** | Find working examples, compare | Identify differences |
| **3. Hypothesis** | Form theory, test minimally | Confirmed or new hypothesis |
| **4. Implementation** | Create test, fix, verify | Bug resolved, tests pass |

## When Process Reveals "No Root Cause"

If systematic investigation reveals issue is truly environmental, timing-dependent, or external:

1. You've completed the process
2. Document what you investigated
3. Implement appropriate handling (retry, timeout, error message)
4. Add monitoring/logging for future investigation

**But:** 95% of "no root cause" cases are incomplete investigation.

## Supporting Techniques

These techniques are part of systematic debugging and available in this directory:

- **`root-cause-tracing.md`** - Trace bugs backward through call stack to find original trigger
- **`defense-in-depth.md`** - Add validation at multiple layers after finding root cause
- **`condition-based-waiting.md`** - Replace arbitrary timeouts with condition polling

**Related skills:**
- **superpowers:test-driven-development** - For creating failing test case (Phase 4, Step 1)
- **superpowers:verification-before-completion** - Verify fix worked before claiming success

## Real-World Impact

From debugging sessions:
- Systematic approach: 15-30 minutes to fix
- Random fixes approach: 2-3 hours of thrashing
- First-time fix rate: 95% vs 40%
- New bugs introduced: Near zero vs common

## When to Use

- Any bug, test failure, or unexpected behavior
- Before proposing any fix
- When something isn't working as expected
- Performance issues or crashes

## When NOT to Use

- Quick exploratory work where root cause doesn't matter
- When you're just gathering information
- For confirming known issues (already have root cause)

## Common Mistakes

- Fixing symptoms instead of root cause
- Making changes without understanding why they work
- Random trial-and-error debugging
- Not documenting what you tried
- Skipping the reproduction step
- Accepting "works now" without understanding why

## Red Flags

- Agent applies fixes without understanding the root cause
- Debug output is left in production code after the fix
- Watch for shortcuts and skipped steps

## Verification

After completing this skill, confirm:

- [ ] Root cause is identified and documented before applying fixes
- [ ] Debug output is removed from production code
- [ ] All required outputs generated
- [ ] Success criteria met

## Process

1. Analyze the task requirements
2. Apply domain expertise
3. Verify output quality



---


<a id="development--test-driven-development"></a>
# SKILL: development--test-driven-development

---
name: test-driven-development
description: Use when implementing any feature or bugfix, before writing implementation code
domain: development
author: oyi77
license: Apache-2.0
subdomain: software-development
tags:
- coding
- driven
- software-engineering
- test
- testing
version: 1.0.0
---

persona:
  name: "Domain Expert"
  title: "Master of Test Driven Development"
  expertise: ['Specialized Knowledge', 'Best Practices', 'Industry Standards']
  philosophy: "Excellence through expertise."
  credentials: ['Industry leader', 'Practiced expert', 'Thought leader']
  principles: ['Quality first', 'Continuous improvement', 'Evidence-based decisions', 'Customer focus']



# Test-Driven Development (TDD)

## World-Class Expert Persona

**Kent Beck** - Creator of Test-Driven Development and Extreme Programming
- **Credentials**: Author of "Test-Driven Development by Example", "Extreme Programming Explained", pioneered TDD methodology
- **Expertise**: Test-first development, evolutionary design, refactoring, agile practices, software craftsmanship
- **Philosophy**: "I'm not a great programmer; I'm just a good programmer with great habits" - TDD is the habit that makes good programmers great
- **Core Principles**:
  - Red-Green-Refactor is sacred - never skip steps
  - Tests are specifications, not afterthoughts
  - Small steps prevent big mistakes
  - Confidence comes from passing tests, not clever code
  - Design emerges from refactoring, not upfront planning
  - If it's hard to test, the design is wrong

## Overview

Write the test first. Watch it fail. Write minimal code to pass.


## Anti-Rationalization Table

| Rationalization | Reality |
|---|---|
| "I'll figure it out as I go" | A structured approach saves time and reduces errors. Follow the workflow in this skill rather than improvising. |
| "I already know this topic" | Familiarity breeds shortcuts. Use the checklist to verify you haven't missed critical steps. |
| "This doesn't apply to my situation" | The patterns here generalize across contexts. Adapt, don't skip — the underlying principles hold. |
| "One more tool will fix it" | Adding complexity rarely solves process gaps. Master the core workflow first. |

## When to Use

**Trigger phrases:**
- "test driven development"
- "New features"
- "Bug fixes"
- "Refactoring"

- New features
- Bug fixes
- Refactoring

**Exceptions:**
- Throwaway prototypes
- Generated code

## The Iron Law
```
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
```
Write code before test? Delete it. Start over.

## Red-Green-Refactor

- Configure before, bugfix, code, development, driven settings before first use


### RED: Write Failing Test
Write minimal test showing expected behavior.

```
test('retries 3 times', async () => {
  let attempts = 0;
  const op = () => { attempts++; return attempts >= 3 ? 'ok' : fail(); };
  expect(await retry(op)).toBe('ok');
  expect(attempts).toBe(3);
});
```

**Requirements:** One behavior, clear name, real code

### GREEN: Minimal Code
Write simplest code to pass the test.
- No "while I'm here" improvements
- Just make it pass

### REFACTOR: Clean Up
- Improve code structure
- Keep tests passing
- Don't add new behavior
      if (i === 2) throw e;
    }
  }
  throw new Error('unreachable');
}
```
Just enough to pass
</Good>

<Bad>
```typescript
async function retryOperation<T>(
  fn: () => Promise<T>,
  options?: {
    maxRetries?: number;
    backoff?: 'linear' | 'exponential';
    onRetry?: (attempt: number) => void;
  }
): Promise<T> {
  // YAGNI
}
```
Over-engineered
</Bad>

Don't add features, refactor other code, or "improve" beyond the test.

### Verify GREEN
- Run tests
- Confirm passes
- Fix code, not test

### REFACTOR
After green: remove duplication, improve names

### Repeat
Next failing test for next feature.

## Good Tests
- **Minimal:** One thing per test
- **Clear:** Name describes behavior
- **Shows intent:** Demonstrates desired API

**"Tests after achieve the same goals - it's spirit not ritual"**

No. Tests-after answer "What does this do?" Tests-first answer "What should this do?"

Tests-after are biased by your implementation. You test what you built, not what's required. You verify remembered edge cases, not discovered ones.

Tests-first force edge case discovery before implementing. Tests-after verify you remembered everything (you didn't).

30 minutes of tests after ≠ TDD. You get coverage, lose proof tests work.

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "Too simple to test" | Simple code breaks. Test takes 30 seconds. |
| "I'll test after" | Tests passing immediately prove nothing. |
| "Tests after achieve same goals" | Tests-after = "what does this do?" Tests-first = "what should this do?" |
| "Already manually tested" | Ad-hoc ≠ systematic. No record, can't re-run. |
| "Deleting X hours is wasteful" | Sunk cost fallacy. Keeping unverified code is technical debt. |
| "Keep as reference, write tests first" | You'll adapt it. That's testing after. Delete means delete. |
| "Need to explore first" | Fine. Throw away exploration, start with TDD. |
| "Test hard = design unclear" | Listen to test. Hard to test = hard to use. |
| "TDD will slow me down" | TDD faster than debugging. Pragmatic = test-first. |
| "Manual test faster" | Manual doesn't prove edge cases. You'll re-test every change. |
| "Existing code has no tests" | You're improving it. Add tests for existing code. |

## Red Flags - STOP and Start Over

- Code before test
- Test after implementation
- Test passes immediately
- Can't explain why test failed
- Tests added "later"
- Rationalizing "just this once"
- "I already manually tested it"
- "Tests after achieve the same purpose"
- "It's about spirit not ritual"
- "Keep as reference" or "adapt existing code"
- "Already spent X hours, deleting is wasteful"
- "TDD is dogmatic, I'm being pragmatic"
- "This is different because..."

**All of these mean: Delete code. Start over with TDD.**

## Example: Bug Fix

**Bug:** Empty email accepted

**RED**
```typescript
test('rejects empty email', async () => {
  const result = await submitForm({ email: '' });
  expect(result.error).toBe('Email required');
});
```

**Verify RED**
```bash
$ npm test
FAIL: expected 'Email required', got undefined
```

**GREEN**
```typescript
function submitForm(data: FormData) {
  if (!data.email?.trim()) {
    return { error: 'Email required' };
  }
  // ...
}
```

**Verify GREEN**
```bash
$ npm test
PASS
```

**REFACTOR**
Extract validation for multiple fields if needed.

## Verification Checklist

Before marking work complete:

- [ ] Every new function/method has a test
- [ ] Watched each test fail before implementing
- [ ] Each test failed for expected reason (feature missing, not typo)
- [ ] Wrote minimal code to pass each test
- [ ] All tests pass
- [ ] Output pristine (no errors, warnings)
- [ ] Tests use real code (mocks only if unavoidable)
- [ ] Edge cases and errors covered

Can't check all boxes? You skipped TDD. Start over.

## When Stuck

| Problem | Solution |
|---------|----------|
| Don't know how to test | Write wished-for API. Write assertion first. Consult your human partner. |
| Test too complicated | Design too complicated. Simplify interface. |
| Must mock everything | Code too coupled. Use dependency injection. |
| Test setup huge | Extract helpers. Still complex? Simplify design. |

## Debugging Integration

Bug found? Write failing test reproducing it. Follow TDD cycle. Test proves fix and prevents regression.

Never fix bugs without a test.

## Testing Anti-Patterns

When adding mocks or test utilities, read @testing-anti-patterns.md to avoid common pitfalls:
- Testing mock behavior instead of real behavior
- Adding test-only methods to production classes
- Mocking without understanding dependencies

## Final Rule

```
Production code → test exists and failed first
Otherwise → not TDD
```

## When to Use

- Implementing any feature
- Fixing any bug
- Before writing implementation code

## When NOT to Use

- Exploratory work
- Quick prototyping
- When test infrastructure isn't available

## Quick Reference

- Write test first, watch it fail
- Write minimal code to pass
- Refactor
- No exceptions without explicit approval

## Common Mistakes

- Writing tests after code
- Not watching test fail first
- Writing too much code to pass test
- Skipping refactoring step
- Not using the testing-anti-patterns guide

## Red Flags

- Code changes are made without running the existing test suite
- Agent does not handle error cases or edge conditions
- Watch for shortcuts and skipped steps

## Verification

After completing this skill, confirm:

- [ ] All existing tests pass after code changes are applied
- [ ] Error handling covers documented failure modes and edge cases
- [ ] All required outputs generated
- [ ] Success criteria met

## Process

1. Analyze the task requirements
2. Apply domain expertise
3. Verify output quality



---


<a id="development--threejs-game-skills"></a>
# SKILL: development--threejs-game-skills

---
name: threejs-game-skills
description: Three.js Game Skills — Real-time 3D game engines in the browser, character controllers, skeletal animation mixers, raycasting collision, particle spell effects, combat hit-boxes, camera lerping, and game state orchestration. Use when developing 3D browser games, RPG combat stages, and interactive game mechanics with Three.js.
domain: development
author: oyi77
license: Apache-2.0
subdomain: game-development
tags:
- threejs
- game-engine
- animation
- combat
- rpg
- webgl
version: 1.0.0
---

# Three.js Game Skills

## Overview
Three.js Game Skills provides game development patterns for real-time 3D web games. It covers character animation state machines, combat visual effects (slashes, projectiles, impacts, buffs), camera following algorithms, asset loading pipelines, and game loop synchronization.

## Core Capabilities

1. **Skeletal Animation State Machine (AnimationMixer)**:
   - Seamless cross-fading between Idle, Run, Attack, Hit, and Cast animations (`action.crossFadeTo(nextAction, duration, true)`).
   - Event-driven animation triggers aligned with attack speed and casting speed stats.

2. **RPG Combat Visual Effects (VFX)**:
   - Particle emitters for spell impacts (Mage fireballs, Lightning bolts, Dragon breath).
   - Dynamic weapon trail meshes and hit-spark decals using GPU instancing.
   - Screen-space floating damage numbers projected from 3D world coordinates to 2D HUD.

3. **Cinematic Camera Controller**:
   - Smooth camera lerp tracking behind the hero or centering combat matchups (`camera.position.lerp(targetPos, delta * 5)`).
   - Dynamic camera shake on heavy critical strikes and boss ultimate attacks.

4. **Procedural Terrains & Dungeon Environments**:
   - Tiled dungeon floors, atmospheric volumetric fog (`THREE.FogExp2`), torches with flickering point lights, and skyboxes.

5. **Audio-Visual Sync**:
   - Positional 3D audio (`THREE.PositionalAudio`) and sound effect triggering synchronized with weapon swings and monster cries.

## When to Use
- Building or upgrading the 3D combat stage, boss raid arenas, and monster encounters.
- Implementing 3D weapon models, glowing enchant particle trails (+4 blue glow, +16 red aura).



---


<a id="development--vite-config"></a>
# SKILL: development--vite-config

---
name: vite-config
description: Vite build tool configuration — plugins, SSR, library mode, environment variables, dev server proxy. Use when working with vite config.
domain: development
author: oyi77
license: Apache-2.0
subdomain: software-development
tags:
- coding
- config
- software-engineering
- testing
- vite
version: 1.0.0
---


## Overview

Vite is a next-generation frontend build tool that leverages native ES modules for instant dev server start and Rollup-based builds for production. This skill covers configuration patterns for React, Vue, Svelte, library mode, and SSR.

## Capabilities

- Instant dev server start with native ESM
- Lightning-fast HMR (Hot Module Replacement)
- Optimized production builds with Rollup
- Plugin system compatible with Rollup plugins
- Library mode for building npm packages
- SSR support for frameworks like Next.js/Nuxt
- Environment variables with `import.meta.env`
- CSS preprocessing (Sass, Less, PostCSS, Tailwind)
- Asset handling (images, fonts, JSON)
- Dev server proxy for API requests

## When to Use
**Trigger phrases:**
- "vite config"
- "Vite build tool configuration — plugins, SSR, library mode, environment variable"


- Starting new frontend projects (React, Vue, Svelte, Solid)
- Building npm libraries for distribution
- Migrating from Webpack (faster builds)
- Need fast dev server with HMR
- Building SSR applications
- Monorepo setups with shared config

## When NOT to Use

- Task is about deployment, not development (use deploy skills)
- Task is about code review, not writing (use review skills)
- You need to understand existing code first (use research skills)
- Task is about testing only (use test skills)
- Requirements are unclear (clarify first)
- Task is trivially simple (single line fix)


## Pseudo Code

The vite-config workflow follows a standard pipeline pattern.

Core flow:
```
# vite-config primary flow
input = prepare(raw_data)
result = process(input, config={build, config, configuration, environment, library})
validate(result)
deliver(result)
```

Error handling:
```
on error:
  log(error_details)
  retry_with_backoff(max=3)
  if still_failing: alert_and_escalate()
```


### Basic Configuration
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
        },
      },
    },
  },
});
```

### Environment Variables
```bash
# .env
VITE_API_URL=https://api.example.com
VITE_APP_TITLE=My App

# .env.production
VITE_API_URL=https://api.production.com

# .env.local (gitignored)
VITE_API_KEY=secret
```

```typescript
// Usage in code
const apiUrl = import.meta.env.VITE_API_URL;
const title = import.meta.env.VITE_APP_TITLE;
const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;
```

### Library Mode
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'MyLib',
      formats: ['es', 'cjs', 'umd'],
      fileName: (format) => `my-lib.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: { globals: { react: 'React', 'react-dom': 'ReactDOM' } },
    },
  },
  plugins: [dts()], // Generate .d.ts files
});
```

### Tailwind CSS Integration
```typescript
// vite.config.ts
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
});

// src/index.css
@import "tailwindcss";
```

### SSR Configuration
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        client: 'src/entry-client.tsx',
        server: 'src/entry-server.tsx',
      },
    },
  },
});

// server.ts (Node.js SSR)
import express from 'express';
import { createServer as createViteServer } from 'vite';

async function createServer() {
  const app = express();
  const vite = await createViteServer({ server: { middlewareMode: true } });
  app.use(vite.middlewares);
  
  app.use('*', async (req, res) => {
    const template = fs.readFileSync('index.html', 'utf-8');
    const { render } = await vite.ssrLoadModule('/src/entry-server.tsx');
    const html = await render(req.originalUrl);
    res.status(200).set({ 'Content-Type': 'text/html' }).end(
      template.replace('<!--app-html-->', html)
    );
  });
  
  app.listen(3000);
}
createServer();
```

### Plugin Configuration
```typescript
// vite.config.ts
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';
import { VitePWA } from 'vite-plugin-pwa';
import checker from 'vite-plugin-checker';

export default defineConfig({
  plugins: [
    react(),
    legacy({ targets: ['defaults', 'not IE 11'] }),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: { globPatterns: ['**/*.{js,css,html,ico,png,svg}'] },
    }),
    checker({ typescript: true, eslint: { lintCommand: 'eslint src' } }),
  ],
});
```

## Error Handling

| Error | Cause | Fix |
|-------|-------|-----|
| `Pre-transform error` | Invalid import or syntax | Check import paths and syntax |
| `CSS not loading` | Missing PostCSS/Sass | `npm install -D sass` or `postcss` |
| `HMR not working` | File outside root | Move files into project root |
| `Build failed: chunk size` | Large bundle | Use `manualChunks` or dynamic imports |
| `env not defined` | Missing `VITE_` prefix | All env vars must start with `VITE_` |

## Common Patterns

Proven patterns for vite-config usage.

- **Batch processing**: Process multiple items in parallel for throughput
- **Retry with backoff**: Handle transient failures gracefully
- **Rate limiting**: Respect API limits with configurable delays
- **Logging**: Structured logging for debugging and audit trails


### Multi-Page App
```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        admin: 'admin/index.html',
      },
    },
  },
});
```

### CSS Modules
```typescript
// Component.module.css
.button { background: blue; color: white; }

// Component.tsx
import styles from './Component.module.css';
function Component() {
  return <button className={styles.button}>Click</button>;
}
```

### Global CSS Variables
```css
:root {
  --color-primary: #3b82f6;
  --color-surface: #ffffff;
  --font-sans: 'Inter', sans-serif;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-surface: #1a1a1a;
  }
}
```

### Dev Server HTTPS
```typescript
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  plugins: [basicSsl()],
  server: { https: true },
});
```

## How to Use

1. Understand the requirement and existing codebase patterns
2. Design the solution with error handling and testability in mind
3. Implement incrementally with tests for each change
4. Verify against expected outcomes (manual and automated)
5. Document usage, edge cases, and integration points
6. Review with team before merging to shared branches

## Red Flags

- **Skipping tests to ship faster**: Untested code breaks in production when you least expect it
- **No error handling in production code**: Unhandled errors crash services and lose user data
- **Hardcoded configuration values**: Hardcoded values prevent environment switching and leak secrets
- **Ignoring security implications**: Missing input validation, auth bypasses, and injection vulnerabilities
- **Over-engineering simple solutions**: Premature abstraction adds complexity without proportional benefit

## Verification

- [ ] Skill output matches expected behavior

## Process

1. Analyze the task requirements
2. Apply domain expertise
3. Verify output quality

## Anti-Rationalization Table

| Rationalization | Reality |
|---|---|
| "Tests slow me down" | Bugs slow you down 10x more. Tests are speed, not overhead. |
| "I will refactor later" | Technical debt compounds. Refactor as you go. |
| "It works on my machine" | If it is not in CI, it does not work. Ship proof, not claims. |


---


<a id="game-ai"></a>
# SKILL: game-ai

---
name: game-ai
description: >
  Design NPC and enemy decision-making with finite state machines, behavior
  trees, steering behaviors, and A* pathfinding — engine-neutral algorithms
  that pair with the detected engine's navigation API. Use when building enemy
  AI, an FSM or behavior tree, steering/flocking, or pathfinding, or when the
  user mentions state machine, behavior tree, blackboard, A*, navmesh, seek, or
  patrol/chase.
---

# Game AI: decisions, steering, and pathfinding

Build believable NPC behavior from three separable layers: **decide** (what to
do), **steer** (how to move there), and **path** (how to route around the map).
Keep them decoupled — a behavior tree picks a target, the pathfinder produces
waypoints, steering follows them. This skill teaches the engine-neutral
algorithms; bind them to your engine via the related skills below.

## When to use

- Use when implementing enemy/NPC logic: patrols, chase/flee, guard states,
  group movement, or "find a path to the player".
- Use to choose between an **FSM** (few clear states), a **behavior tree** (many
  reactive behaviors with priorities), or **steering** (smooth local movement).
- Use when integrating pathfinding: A* on a grid/graph, or driving an engine
  navmesh agent.

**When *not* to use:** for the engine's concrete navmesh/agent API and baking,
use `unity-navmesh`, `unreal-behavior-trees`, or Godot's `NavigationAgent2D/3D`
(see that engine skill). For movement/collision feel, use `physics-tuning`. For
spawning waves along lanes, see the `tower-defense` genre skill.

## Core workflow

1. **Pick the decision model by complexity.** 2–5 states with obvious
   transitions → FSM. Many behaviors, priorities, interruption, reuse → behavior
   tree. Continuous "how strongly do I want each option" → utility scoring.
2. **Separate decision from motion.** The decision layer outputs an *intent*
   (target position, action). Steering or pathfinding turns intent into motion.
3. **Path on the right graph.** Grid tiles, waypoint graph, or a baked navmesh.
   Fewer nodes = faster A*. Prefer the engine's navmesh for 3D; A* on a grid for
   tile games.
4. **Steer along the path**, not straight to the goal — follow the next waypoint,
   advancing when close, so agents round corners.
5. **Recompute paths sparingly.** Pathfind on a timer or when the goal moves a
   tile, not every frame. Cache the path; only the waypoint index advances.
6. **Verify by observation.** Watch the agent: does it reach the goal, get stuck
   on corners, oscillate between states? Draw the path and current state on
   screen while tuning.

## Patterns

### 1. Finite state machine (one state object, explicit transitions)

```gdscript
# Each state is a small object with enter/update/exit. The machine owns "current".
class_name State
func enter(agent): pass
func update(agent, dt) -> State: return null   # return a new state to transition
func exit(agent): pass

# --- Chase state: returns Patrol when the player escapes sight range ---
class Chase extends State:
    func update(agent, dt) -> State:
        if not agent.can_see(agent.target):
            return Patrol.new()                 # transition by returning next state
        agent.move_toward(agent.target.position, dt)
        return null                             # null = stay in this state

# --- Driver: call once per frame ---
func tick(dt):
    var next = current.update(self, dt)
    if next != null:
        current.exit(self); next.enter(self); current = next
```

Keep transition logic *inside* states (or in a table), never as a growing pile
of `if` flags. One state owns one behavior; that is what keeps an FSM readable.

### 2. Behavior tree tick (composite nodes return a status)

```gdscript
# A node's tick() returns SUCCESS, FAILURE, or RUNNING (still working this frame).
enum Status { SUCCESS, FAILURE, RUNNING }

# Sequence: run children in order; stop at the first non-SUCCESS (logical AND).
func sequence_tick(children, agent, dt) -> int:
    for child in children:
        var s = child.tick(agent, dt)
        if s != Status.SUCCESS:
            return s                 # FAILURE or RUNNING short-circuits the sequence
    return Status.SUCCESS

# Selector: try children until one succeeds or is RUNNING (logical OR / fallback).
func selector_tick(children, agent, dt) -> int:
    for child in children:
        var s = child.tick(agent, dt)
        if s != Status.FAILURE:
            return s                 # SUCCESS or RUNNING stops the search
    return Status.FAILURE
```

A guard AI reads top-down: `Selector[ Sequence[CanSeePlayer?, Chase], Patrol ]`
— chase if visible, otherwise patrol. See `references/behavior-trees.md` for
leaf nodes, decorators (Inverter, Cooldown), and a blackboard.

### 3. Steering: seek and arrive (smooth, frame-rate independent)

```gdscript
# Seek: accelerate toward a target at full speed. Steering = desired - current.
func seek(pos, vel, target, max_speed, max_force) -> Vector2:
    var desired = (target - pos).normalized() * max_speed
    return (desired - vel).limit_length(max_force)   # a force, not a teleport

# Arrive: like seek, but ramp speed down inside slow_radius so it stops cleanly.
func arrive(pos, vel, target, max_speed, max_force, slow_radius) -> Vector2:
    var offset = target - pos
    var dist = offset.length()
    if dist < 0.001: return -vel                      # already there: kill drift
    var ramped = max_speed * min(dist / slow_radius, 1.0)
    var desired = offset / dist * ramped
    return (desired - vel).limit_length(max_force)

# Per frame: vel += steering * dt; pos += vel * dt   (always scale by dt)
```

### 4. A* heuristic must not overestimate (or paths stop being shortest)

```python
# Match the heuristic to the movement. An ADMISSIBLE heuristic (never larger
# than the true remaining cost) keeps A* optimal.
def heuristic(a, b):
    dx, dy = abs(a.x - b.x), abs(a.y - b.y)
    # return dx + dy             # Manhattan: 4-direction grids (no diagonals)
    return (dx + dy) + (1.414 - 2) * min(dx, dy)   # octile: 8-direction grids
# f(n) = g(n) + h(n): g = cost from start, h = heuristic to goal.
# Overestimating h is faster but no longer guarantees the shortest path.
```

The full A* loop (priority queue, `came_from` reconstruction, grid + waypoint
graphs) is in `references/pathfinding.md`.

## Pitfalls

- **Pathfinding every frame** tanks the frame rate. Recompute on a timer or only
  when the target moves to a new tile; follow the cached waypoints in between.
- **Steering straight to the goal** instead of to the next waypoint makes agents
  hug walls and corners. Follow the path; advance the waypoint when within radius.
- **Inadmissible A\* heuristic** (e.g. Euclidean distance scaled up, or Manhattan
  on a diagonal grid) returns fast but *non-shortest* paths. Pick the heuristic
  that matches your allowed moves.
- **Behavior tree leaves that never return RUNNING** for multi-frame actions
  (walking, playing an animation) cause the tree to restart the action every
  tick. Return RUNNING until the action completes.
- **FSM transition spaghetti**: scattering `if state == ...` checks everywhere
  recreates the mess an FSM exists to prevent. Keep transitions in the state.
- **No line-of-sight or stuck check** → agents grind into walls forever. Add a
  timeout that forces a repath or a state change.

## References

- `references/pathfinding.md` — complete A* (priority queue, reconstruction),
  grid vs waypoint graphs, when to defer to an engine navmesh.
- `references/behavior-trees.md` — node taxonomy, leaf/decorator implementations,
  blackboard, and FSM-vs-BT selection.

## Related skills

- `unity-navmesh`, `unreal-behavior-trees` — concrete engine AI/navigation APIs.
- `physics-tuning` — movement, collision response, and agent radius.
- `procedural-gen` — generating the graph/level the AI navigates.
- `tower-defense`, `fps-shooter` — genres that compose this skill.



### [Reference: game-ai / behavior-trees.md]

# Behavior trees, FSMs, and the blackboard

A **behavior tree** (BT) is a tree of nodes ticked from the root each frame.
Every node's `tick()` returns one of three statuses:

- `SUCCESS` — the node finished its job this frame.
- `FAILURE` — the node could not do its job.
- `RUNNING` — the node needs more frames (a walk, an animation, a wait).

Control flows down from the root; status flows back up. The shape of the tree
*is* the priority logic, which is why BTs scale to many behaviors far better than
a flat FSM.

## Node taxonomy

| Category | Node | Behavior |
|---|---|---|
| Composite | **Sequence** | Tick children left→right; return on first non-`SUCCESS`. Logical AND. |
| Composite | **Selector** (Fallback) | Tick children left→right; return on first non-`FAILURE`. Logical OR. |
| Composite | **Parallel** | Tick all children; succeed/fail on a policy (e.g. N must succeed). |
| Decorator | **Inverter** | Swap `SUCCESS`↔`FAILURE`; pass `RUNNING` through. |
| Decorator | **Repeat / RepeatUntilFail** | Re-tick a child a number of times. |
| Decorator | **Cooldown / Timeout** | Gate or time-limit a child. |
| Leaf | **Condition** | Test the world/blackboard → `SUCCESS`/`FAILURE` (no side effects). |
| Leaf | **Action** | Do something; return `RUNNING` until complete. |

## Stateful composites and RUNNING

Naive composites restart from the first child every tick. For multi-frame
actions, a composite must **remember which child was RUNNING** and resume there:

```gdscript
class Sequence:
    var children = []
    var _running = 0                 # index of the child that returned RUNNING

    func tick(agent, dt) -> int:
        while _running < children.size():
            var s = children[_running].tick(agent, dt)
            if s == Status.RUNNING:
                return Status.RUNNING        # resume here next frame
            if s == Status.FAILURE:
                _running = 0                 # whole sequence fails; reset
                return Status.FAILURE
            _running += 1                    # child SUCCESS -> advance
        _running = 0                         # reached the end -> sequence succeeds
        return Status.SUCCESS
```

A Selector is the mirror image: it advances on `FAILURE`, returns on `SUCCESS`
or `RUNNING`, and resets its index when a child succeeds.

## Leaf examples

```gdscript
# Condition leaf: pure test, no side effects.
class CanSeePlayer:
    func tick(agent, dt) -> int:
        return Status.SUCCESS if agent.can_see(agent.blackboard.player) else Status.FAILURE

# Action leaf: multi-frame, returns RUNNING until it arrives.
class MoveTo:
    var key  # blackboard key holding the destination
    func tick(agent, dt) -> int:
        var dest = agent.blackboard.get(key)
        if dest == null: return Status.FAILURE
        agent.move_toward(dest, dt)
        return Status.SUCCESS if agent.position.distance_to(dest) < 4.0 else Status.RUNNING
```

A complete guard, as a tree:

```
Selector
├── Sequence            # attack branch (highest priority)
│   ├── CanSeePlayer
│   ├── MoveTo(player)
│   └── Attack
└── Patrol              # fallback when nothing else applies
```

## The blackboard

The **blackboard** is the shared memory that decouples nodes: conditions read it,
actions write it, and no node holds a hard reference to another. Store the
current target, last-known position, home point, path, and timers there. This is
what lets the same `MoveTo` action serve chase, patrol, and flee subtrees.

```gdscript
# A blackboard is just a typed key/value store on the agent.
agent.blackboard = {
    "player": null,            # set by perception each tick
    "home": Vector2(100, 100),
    "path": [],                # filled by the pathfinder
}
```

## FSM vs behavior tree — choosing

| Use an FSM when… | Use a behavior tree when… |
|---|---|
| 2–5 clearly named states | Many behaviors with priorities |
| Transitions are obvious and few | Behaviors interrupt/preempt each other |
| Behavior rarely changes | You want to reuse subtrees across enemies |
| You want the simplest thing | You need designer-tunable, data-driven AI |

Many shipping games use **both**: an FSM for top-level mode (Idle / Combat /
Dead) and a behavior tree inside the Combat state. Start with an FSM; graduate a
state to a behavior tree when its `if` logic outgrows a few transitions.

## Utility AI (brief)

When "how *much* do I want each option" matters more than discrete states, score
each candidate action with a utility function and pick the highest:

```
score(action) = sum of weighted considerations, each a 0..1 curve of a fact
choose the action with the maximum score (optionally softmax for variety)
```

Utility scales to nuanced trade-offs (heal vs attack vs flee by health/ammo/
distance) but is harder to debug than a tree. Reach for it when a BT's branching
becomes a thicket of conditions.



### [Reference: game-ai / pathfinding.md]

# Pathfinding: A* in full

A* finds the shortest path on a **graph** (nodes + weighted edges). A grid is
just one kind of graph. The algorithm is the same whether nodes are tiles, rooms,
or navmesh polygons — only `neighbors()` and `cost()` change.

A* keeps a priority queue (the *frontier*) ordered by `f = g + h`, where `g` is
the known cost from the start and `h` is a heuristic estimate to the goal. It is
optimal **iff** `h` never overestimates the true remaining cost (it is
*admissible*). With `h = 0`, A* degenerates to Dijkstra's algorithm.

## Complete A* (engine-neutral Python)

```python
import heapq

def a_star(graph, start, goal):
    # Priority queue of (f_score, tie, node). heapq pops the SMALLEST first.
    frontier = [(0, 0, start)]
    came_from = {start: None}      # node -> node we reached it from
    cost_so_far = {start: 0.0}     # node -> best known g cost from start
    counter = 0                    # stable tie-breaker so heapq never compares nodes

    while frontier:
        _, _, current = heapq.heappop(frontier)
        if current == goal:
            break                  # early exit: we popped the goal, path is optimal

        for nxt in graph.neighbors(current):
            new_cost = cost_so_far[current] + graph.cost(current, nxt)
            # Relax: accept this edge only if it improves the best known cost.
            if nxt not in cost_so_far or new_cost < cost_so_far[nxt]:
                cost_so_far[nxt] = new_cost
                priority = new_cost + heuristic(nxt, goal)   # f = g + h
                counter += 1
                heapq.heappush(frontier, (priority, counter, nxt))
                came_from[nxt] = current

    return came_from, cost_so_far

def reconstruct_path(came_from, start, goal):
    if goal not in came_from:
        return None                # unreachable
    path = []
    node = goal
    while node != start:
        path.append(node)
        node = came_from[node]
    path.append(start)
    path.reverse()                 # came_from points backward; flip to start->goal
    return path
```

Key correctness points:

- **Check the goal when *popping*, not when pushing.** Testing on push breaks as
  soon as edges have varying cost; testing on pop is always correct.
- **Relaxation** (`new_cost < cost_so_far[nxt]`) lets a node be improved if a
  cheaper route is found later — essential with non-uniform movement costs.
- **Tie-breaker**: push a monotonic counter alongside the node so the heap never
  has to order two equal-`f` nodes by the node object itself.

## Heuristics by movement type

| Allowed moves | Heuristic | Formula (`dx=|ax-bx|`, `dy=|ay-by|`) |
|---|---|---|
| 4-directional grid | Manhattan | `dx + dy` |
| 8-directional grid | Octile | `(dx + dy) + (sqrt(2) - 2) * min(dx, dy)` |
| Any-angle / Euclidean space | Euclidean | `sqrt(dx*dx + dy*dy)` |

Scale the heuristic by the minimum step cost so it stays in the same units as
`g`. If `h` can exceed the true cost, A* is faster but returns non-optimal paths
(this is the "weighted A*" trade-off — use it deliberately, not by accident).

## Grid graph adapter

```python
class GridGraph:
    def __init__(self, walls, width, height):
        self.walls, self.w, self.h = walls, width, height
    def in_bounds(self, p): return 0 <= p[0] < self.w and 0 <= p[1] < self.h
    def passable(self, p):  return p not in self.walls
    def neighbors(self, p):
        x, y = p
        candidates = [(x+1,y),(x-1,y),(x,y+1),(x,y-1)]   # add diagonals for octile
        return [c for c in candidates if self.in_bounds(c) and self.passable(c)]
    def cost(self, a, b):
        return 1.0                  # uniform; return terrain weight for varied cost
```

## When to use an engine navmesh instead

Hand-rolled grid A* is ideal for 2D tile games and for understanding the
algorithm. For 3D worlds, arbitrary geometry, dynamic obstacle avoidance, and
agent radius/height, prefer the engine's baked navigation:

- **Unity** — bake a NavMesh and drive a `NavMeshAgent` (see `unity-navmesh`).
- **Unreal** — Nav Mesh Bounds + `AIController` MoveTo (see `unreal-behavior-trees`).
- **Godot** — `NavigationRegion2D/3D` + `NavigationAgent2D/3D`, querying
  `NavigationServer` for paths.

These handle path smoothing, off-mesh links, and crowd avoidance you would
otherwise reimplement. Use A* directly when the world is a discrete grid/graph or
when you need full control over the cost function.

## Performance notes

- Shrink the graph before optimizing the search: merge open areas, use waypoint
  graphs instead of dense grids, or precompute connected regions.
- Cap pathfinding work per frame (a budget of N searches), and queue the rest.
- For many agents heading to the same goal, compute one **flow field** (a
  Dijkstra pass from the goal outward) and have every agent follow the gradient,
  instead of running A* per agent.



---


<a id="game-feel"></a>
# SKILL: game-feel

---
name: game-feel
description: >
  Add "juice" and game feel that makes actions satisfying — screen shake, hit-stop/freeze
  frames, tweened/eased motion, squash & stretch, knockback, and layered audio-visual
  feedback — as engine-neutral techniques that pair with the detected engine's tween,
  particle, and camera APIs. Use when the user mentions game feel, juice, "make it feel
  good/punchy", screen shake, hit stop, screen freeze, easing, squash and stretch, impact
  frames, or feedback/polish on hits, jumps, pickups, and deaths.
---

# Game feel (juice)

The difference between a mechanic that *works* and one that feels *good* is feedback: the
layered, slightly-exaggerated response an action provokes. This skill covers the engine-
neutral techniques — screen shake, hit-stop, easing, squash & stretch, knockback, and stacked
feedback — and tells you how to apply them without burying the underlying simulation. It
**adds polish on top of** an existing mechanic; it does not implement the mechanic.

## When to use

- Use when an action (hit, jump, dash, pickup, death, button press) is mechanically correct
  but feels weak, weightless, or unsatisfying, and you want it to feel responsive and punchy.
- Use to add screen shake, hit-stop/freeze frames, eased motion, squash & stretch, knockback,
  flashes, or to layer multiple feedback channels onto one event.
- Use to decide *how much* juice is enough and where it crosses into noise.

**When *not* to use:** for the raw controller math (jump height, coyote time) use the
`platformer` genre and the engine movement skill. For camera *follow/deadzone/orbit* framing
use `camera-systems` (this skill only triggers the shake). For mixing, ducking, and adaptive
music use `audio-design`. For shader-based dissolves/flashes use `shader-programming` and the
engine shader skill. For the concrete tween/particle node APIs, use the engine animation skill
(`godot-animation`, `unity-animation`).

## Core principle: feedback is layered and exaggerated

One satisfying hit is usually **5–8 tiny responses firing together** within ~100 ms: a sound,
a particle burst, a brief hit-stop, a flash, a knockback, a small screen shake, and a number
popping up. Each is cheap; stacked, they read as "impact". Two rules keep it from becoming a
mess: **(1)** exaggerate *briefly* and return to rest (juice is transient, not a new resting
state); **(2)** scale juice to event importance — a footstep is not a boss death.

## Core workflow

1. **Confirm the event hooks exist.** Juice attaches to discrete events: `on_hit`, `on_land`,
   `on_pickup`, `on_death`, `on_fire`. If the mechanic doesn't emit these, add them first.
2. **Pick feedback channels per event** from the menu (sound, particles, shake, hit-stop,
   flash, knockback, tween, number pop). Start with 2–3; add until it reads, then stop.
3. **Make motion eased, not linear.** Route scale/position/UI changes through a tween with an
   ease (overshoot for "pop", ease-out for "settle"). Linear motion feels robotic.
4. **Reserve hit-stop and shake for impact.** They are the strongest, most abusable tools —
   short durations, scaled to importance, and never on routine actions.
5. **Keep feedback off the critical simulation.** Shake moves the *camera/visual*, not the
   body; hit-stop uses time scale or a real-time pause, not a gameplay-logic stall.
6. **Tune by importance tiers.** Define small/medium/large feedback presets and assign events
   to a tier, so the whole game's juice stays consistent and proportional.
7. **Verify by playing and watching.** Trigger the event repeatedly; confirm the feedback
   fires, returns to rest, and is not nauseating or input-blocking. Report what you observed
   (does shake decay? does input still register during hit-stop?).

## Patterns

### 1. Screen shake by decaying "trauma" (smooth, not a random jitter)

```gdscript
# Godot 4.7. Store trauma 0..1; shake = trauma^2 so small hits barely move, big hits punch.
# Drives a Camera2D OFFSET (the visual), never the player body. Decays every frame.
@export var decay := 1.2          # trauma lost per second
@export var max_offset := Vector2(12, 8)
@export var max_roll := 0.1       # radians
var trauma := 0.0
var _t := 0.0

func add_trauma(amount: float) -> void:
    trauma = clampf(trauma + amount, 0.0, 1.0)   # hits ADD; they don't reset

func _process(dt: float) -> void:
    if trauma <= 0.0: return
    trauma = maxf(trauma - decay * dt, 0.0)
    var shake := trauma * trauma                  # quadratic: gentle low, sharp high
    _t += dt * 30.0
    # Smooth pseudo-random via sampled noise/sin, NOT rand each frame (that buzzes).
    offset = Vector2(max_offset.x * shake * sin(_t * 1.7),
                     max_offset.y * shake * sin(_t * 2.3))
    rotation = max_roll * shake * sin(_t * 1.1)
# Unity 6.3 LTS: identical model on a CinemachineCamera via CinemachineBasicMultiChannelPerlin
# (set AmplitudeGain/FrequencyGain from trauma^2) — see camera-systems.
```

### 2. Hit-stop / freeze frame (sell impact by briefly stopping time)

```gdscript
# Godot 4.7. Drop time scale, then restore after a REAL-TIME delay (unaffected by time_scale).
func hit_stop(duration := 0.08, scale := 0.05) -> void:
    Engine.time_scale = scale
    # 4th arg ignore_time_scale=true → the timer still fires while the game is frozen.
    await get_tree().create_timer(duration, true, false, true).timeout
    Engine.time_scale = 1.0
```

```csharp
// Unity 6.3 LTS (C#). WaitForSecondsRealtime ignores Time.timeScale, so the timer still elapses.
IEnumerator HitStop(float duration = 0.08f, float scale = 0.05f) {
    Time.timeScale = scale;
    yield return new WaitForSecondsRealtime(duration);
    Time.timeScale = 1f;            // RIGHT: real-time wait. WRONG: WaitForSeconds (never resumes at scale 0)
}
```

### 3. Squash & stretch + overshoot via an eased tween (the "pop")

```gdscript
# Godot 4.7. Conserve volume: stretch one axis, squash the other, then spring back with overshoot.
func pop(node: Node2D) -> void:
    node.scale = Vector2(1.3, 0.7)                       # instant squash on the event
    var tw := create_tween()
    tw.tween_property(node, "scale", Vector2.ONE, 0.18) \
      .set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)   # BACK = overshoots past 1, settles
# RIGHT: ease back (TRANS_BACK/ELASTIC) for life. WRONG: linear tween → mechanical, dead.
```

### 4. A feedback bundle scaled by importance (keep juice proportional)

```gdscript
# One call per event; the tier decides intensity so the whole game stays consistent.
func feedback(event_pos: Vector2, tier: String) -> void:
    match tier:
        "small":  AudioBus.play("tick");  Camera.add_trauma(0.15)
        "medium": AudioBus.play("hit");   Camera.add_trauma(0.4);  hit_stop(0.05); spawn_particles(event_pos, 6)
        "large":  AudioBus.play("boom");  Camera.add_trauma(0.8);  hit_stop(0.12); spawn_particles(event_pos, 30); flash_white(0.06)
```

## Pitfalls

- **Shaking the player/body instead of the camera offset** desyncs collision and aim. Shake
  the camera (or a visual pivot), never the simulated transform.
- **Random offset every frame** buzzes like static. Drive shake from sampled noise/sin and a
  decaying trauma value so it's smooth and self-ending.
- **Hit-stop with `WaitForSeconds` / a scaled timer** never resumes (at time scale 0 the timer
  never advances). Use a real-time wait (`WaitForSecondsRealtime`, or Godot's
  `ignore_time_scale` timer).
- **Hit-stop on every frame of a held attack** locks the game. Trigger it once per impact.
- **Linear tweens everywhere** feel robotic. Ease almost everything; reserve overshoot
  (BACK/ELASTIC) for "pop" and ease-out for "settle".
- **Permanent exaggeration** (scale never returns, shake never decays) becomes the new normal
  and stops reading as feedback. Juice must return to rest.
- **Over-juicing routine actions** (full shake + hit-stop on every footstep) causes nausea and
  hides real impacts. Scale to importance; add a "reduce screen shake"/"reduce flashing"
  accessibility option.
- **Feedback that blocks input** (long freeze, un-cancelable animation) hurts responsiveness.
  Keep juice short and let input buffer through it.

## References

- For the trauma-shake math, easing-curve cheat sheet (which ease for pop vs settle), knockback
  + flash + number-pop recipes, importance-tier presets, and per-engine tween/particle bindings,
  read `references/feedback-recipes.md`.

## Related skills

- `camera-systems` — owns camera follow/deadzone/orbit; this skill only feeds it shake trauma.
- `godot-animation`, `unity-animation` — concrete tween/AnimationPlayer/particle APIs juice rides on.
- `audio-design` — the sound layer of every feedback bundle; ducking and SFX variation.
- `physics-tuning` — knockback forces and the timestep juice must not destabilize.
- `platformer`, `fps-shooter`, `roguelike` — genres whose moment-to-moment feel this elevates.



### [Reference: game-feel / feedback-recipes.md]

# Feedback recipes — depth for `game-feel`

Detail the `game-feel` body defers here: the shake math, easing cheat sheet, the rest of the
feedback menu (knockback, flash, number pop, freeze), importance-tier presets, and the
per-engine bindings for tweens and particles. All snippets target **Godot 4.7** and **Unity 6.3 LTS**.

## 1. The trauma model (why shake feels good)

Track a single `trauma` value in `[0, 1]`. Events **add** trauma; it **decays** linearly each
frame. The actual shake amount is `trauma^2` (or `trauma^3`) so:

- small/frequent events barely nudge the screen (low trauma, squared → tiny),
- big events punch hard (high trauma, squared → near full),
- shake **always ends** on its own because trauma decays to 0.

Offset and rotation are `max_* * shake * noise(t)`. Sample a noise function or summed sines
across time — never a fresh `rand()` per frame, which produces a harsh buzz instead of a shake.

```gdscript
# 1D value-noise-ish sampler without an addon: layered sines at incommensurate rates.
func _shake_axis(seed: float, t: float) -> float:
    return 0.6 * sin(t * 11.0 + seed) + 0.4 * sin(t * 23.0 + seed * 2.0)
```

Tunable starting points: `max_offset = (8..16, 6..10) px`, `max_roll = 0.05..0.12 rad`,
`decay = 1.0..1.5` trauma/sec, per-hit trauma `0.15` (light) → `0.8` (heavy).

## 2. Easing cheat sheet — which curve for which job

| Goal | Ease | Godot `Tween` | Notes |
|------|------|---------------|-------|
| UI/element "pop" in | overshoot | `TRANS_BACK`, `EASE_OUT` | shoots past target, settles back |
| Bouncy, lively land | bounce/elastic | `TRANS_ELASTIC`/`TRANS_BOUNCE`, `EASE_OUT` | use sparingly; reads as cartoonish |
| Settle / decelerate | ease-out | `TRANS_CUBIC`/`TRANS_QUAD`, `EASE_OUT` | the default for "comes to rest" |
| Anticipation / wind-up | ease-in | `TRANS_CUBIC`, `EASE_IN` | slow start before a fast action |
| Smooth A→B both ends | ease-in-out | `TRANS_SINE`, `EASE_IN_OUT` | camera moves, menu slides |

Unity 6.3 LTS has no built-in tween library; options in order of preference: `Vector3.SmoothDamp`
for spring-like follow, `Mathf.SmoothStep`/hand-rolled ease in a coroutine, Animator curves,
or a third-party tween package if the project already uses one. Keep the *curve choice* the
same regardless of tool.

```csharp
// Unity 6.3 LTS: a minimal eased scale "pop" in a coroutine (no external deps).
IEnumerator Pop(Transform t, float dur = 0.18f) {
    t.localScale = new Vector3(1.3f, 0.7f, 1f);            // squash on the event
    for (float e = 0; e < dur; e += Time.deltaTime) {
        float k = e / dur;
        float back = 1f + 2.7f * Mathf.Pow(1 - k, 2) * (k - 0); // overshoot-ish
        t.localScale = Vector3.Lerp(t.localScale, Vector3.one, k * k);
        yield return null;
    }
    t.localScale = Vector3.one;
}
```

## 3. The rest of the feedback menu

- **Flash:** tint the sprite/material white for 1–3 frames on hit (`modulate`/material color),
  then tween back. Cheap, hugely legible.
- **Knockback:** apply an impulse away from the hit normal, clamped and short; let
  `physics-tuning` own stability. Pair with brief control lockout, not a long one.
- **Number/text pop:** spawn a damage number that rises, fades, and eases out; randomize the
  horizontal drift so stacked hits fan out.
- **Particles:** a short burst at the contact point (sparks, dust, debris). Pool them
  (`performance-optimization`) — do not instance-and-free per hit.
- **Freeze frame:** the hit-stop in the body; scale duration to importance (0.04 s light →
  0.15 s heavy). Optionally freeze only the attacker+target, not the whole world.
- **Anticipation & follow-through:** a tiny wind-up before a big action and a settle after read
  as weight; this is animation, not code (engine animation skill).
- **Chromatic/▒vignette/zoom punch:** post-process nudges for big moments; keep brief.

## 4. Importance tiers (keep the whole game proportional)

Define three presets and assign every juicy event to one. This is what stops a game from
feeling either dead (under-juiced) or exhausting (everything maxed).

| Tier | Trauma | Hit-stop | Particles | Extra | Example events |
|------|:------:|:--------:|:---------:|-------|----------------|
| small | 0.10–0.20 | none | 0–4 | tick SFX | footstep, UI hover, coin |
| medium | 0.30–0.50 | 0.04–0.06 s | 6–12 | flash | normal hit, jump-land, pickup |
| large | 0.70–1.00 | 0.10–0.15 s | 20–40 | flash + zoom + number | crit, boss hit, death, explosion |

## 5. Accessibility (ship these toggles)

- **Reduce screen shake** (scale trauma output by a 0–100% setting, default ~60–80%).
- **Reduce/disable flashing** (photosensitivity) — replace white flashes with a static tint.
- **Reduce camera motion** — cut shake roll and zoom punches.

These pair with `game-ui-ux` (settings menu) and `input-systems` (accessibility section).

## 6. Per-engine binding summary

- **Godot 4.7:** `create_tween()` + `tween_property().set_trans().set_ease()`; `GPUParticles2D/3D`
  one-shot; `Engine.time_scale` + `ignore_time_scale` timer; shake on `Camera2D.offset`.
- **Unity 6.3 LTS:** coroutines + `SmoothDamp`/curves (or a tween package); `ParticleSystem.Play()`;
  `Time.timeScale` + `WaitForSecondsRealtime`; shake via `CinemachineBasicMultiChannelPerlin`
  amplitude/frequency driven by `trauma^2` (see `camera-systems`).
- **Web (Phaser/Pixi/three):** tween via the engine/library tween; `this.cameras.main.shake()`
  in Phaser; `requestAnimationFrame`-driven eases elsewhere.



---


<a id="game-ui-ux"></a>
# SKILL: game-ui-ux

---
name: game-ui-ux
description: >
  Design and build game UI/UX — HUDs, menus, and overlays — that survive every screen: anchor-
  based responsive layout, resolution/aspect scaling and safe areas, keyboard/gamepad focus
  navigation, a screen/menu state stack, and event-driven (not polled) HUD updates. Engine-
  neutral patterns that pair with the detected engine's UI skill. Use when the user mentions
  HUD, health bar, main menu, pause menu, settings screen, UI layout, anchors, UI scaling,
  aspect ratio, safe area, controller/keyboard menu navigation, or wiring UI to game state.
---

# Game UI/UX

Build HUDs and menus that stay correct on a phone, an ultrawide monitor, and a TV across a
gamepad and a mouse. This skill owns the engine-neutral UI architecture — responsive layout,
scaling, focus navigation, screen flow, and how UI talks to game state — and defers the
concrete widget API to the engine UI skill.

## When to use

- Use when building a HUD (health/ammo/score), a menu (main/pause/settings), an inventory or
  shop screen, or any overlay, and you want it to scale and navigate correctly.
- Use to fix UI that breaks at other resolutions/aspect ratios, ignores notches/safe areas,
  can't be used with a controller, or is wired to game state by per-frame polling.
- Use to structure screen flow (title → game → pause → settings) as a stack, not flag soup.

**When *not* to use:** for the engine's concrete UI nodes/components and styling, use
`godot-ui-control` or Unity UI (UGUI/UI Toolkit). For *visual* punch (button pop, damage
numbers, shake) use `game-feel`. For branching conversation UI use `dialogue-systems`. For
translating UI strings, that is localization (see `references/` and `input-systems` for
rebinding screens). For card/board layout specifics, the `card-game` genre composes this skill.

## Core workflow

1. **Pick a layout model: anchors + containers, never absolute pixels.** Anchor elements to
   edges/corners/center and let containers (rows, columns, grids) flow children. Absolute
   `(x, y)` positions break at the first new resolution.
2. **Choose a scaling strategy** for the whole UI: a reference resolution that scales to fit
   (most games), plus a policy for extra width/height on other aspect ratios (letterbox,
   expand, or anchor HUD corners outward).
3. **Respect the safe area.** Inset critical UI from screen edges so notches, rounded corners,
   and TV overscan don't clip it.
4. **Make every screen keyboard/gamepad navigable.** Set an initial focused control per screen,
   define focus order/neighbors, and show a clear focus highlight. Mouse and focus must coexist.
5. **Model screens as a stack.** Push (pause over game), pop (resume), with input + visibility
   handed to the top screen. This makes overlays and "back" trivial.
6. **Drive the HUD from events, not polling.** The HUD subscribes to `health_changed`,
   `score_changed`, etc. and updates only when they fire — it does not read game state every
   frame.
7. **Verify across screens and devices.** Resize the window, switch aspect ratios, unplug the
   mouse and navigate by gamepad only, and confirm focus, scaling, and safe-area insets. Report
   what you actually observed at which resolutions.

## Patterns

### 1. Anchors + containers, not absolute coordinates

```gdscript
# Godot 4.7. Anchor a HUD label to the TOP-LEFT; let a container flow a row of hearts.
func _ready() -> void:
    $Score.set_anchors_preset(Control.PRESET_TOP_LEFT)   # sticks to the corner at any size
    # An HBoxContainer auto-lays-out children left-to-right; never position hearts by hand.
    for i in lives:
        $Hearts.add_child(make_heart())                   # HBoxContainer spaces them for you
# Unity 6.3 LTS uGUI: set RectTransform anchors to the corner; use a HorizontalLayoutGroup.
# RIGHT: anchors + layout groups. WRONG: rect.anchoredPosition = new Vector2(640, 360) (1080p-only).
```

### 2. Scale to a reference resolution (one UI, many screens)

```text
# Godot 4.7 — Project Settings > Display > Window > Stretch:
#   Mode = "canvas_items", Aspect = "expand", reference size e.g. 1920x1080.
#   UI scales to the window; "expand" reveals extra space you anchor HUD corners into.
# Unity 6.3 LTS — Canvas > CanvasScaler:
#   UI Scale Mode = "Scale With Screen Size", Reference Resolution = 1920x1080,
#   Match = 0.5 (blend width/height) — pick 1.0 if your HUD is height-critical.
```

### 3. Safe-area inset for notches / overscan

```gdscript
# Godot 4.7. Inset a margin container to the OS-reported safe rect (phones, TVs).
func _apply_safe_area() -> void:
    var safe: Rect2i = DisplayServer.get_display_safe_area()
    var win := DisplayServer.window_get_size()
    $Margin.add_theme_constant_override("margin_left", safe.position.x)
    $Margin.add_theme_constant_override("margin_top",  safe.position.y)
    $Margin.add_theme_constant_override("margin_right", win.x - safe.end.x)
    $Margin.add_theme_constant_override("margin_bottom", win.y - safe.end.y)
# Unity 6.3 LTS: read Screen.safeArea (Rect in pixels) and set a panel's anchorMin/anchorMax to
# safeArea.position / (position+size) normalized by Screen.width/height.
```

### 4. Gamepad/keyboard focus (UI is unusable on a controller without it)

```gdscript
# Godot 4.7. Give each screen a default focus and wire neighbors so a stick/d-pad walks it.
func _on_screen_shown() -> void:
    $PlayButton.grab_focus()                               # always focus SOMETHING on open
$PlayButton.focus_neighbor_bottom = $SettingsButton.get_path()
$SettingsButton.focus_neighbor_top = $PlayButton.get_path()
# Unity 6.3 LTS: EventSystem.SetSelectedGameObject(playButton) on enable; set each Selectable's
# Navigation (Explicit or Automatic). RIGHT: a control is focused on open. WRONG: nothing
# selected → the gamepad does nothing and the player is stuck.
```

### 5. Event-driven HUD (decouple UI from game logic)

```gdscript
# RIGHT: HUD reacts to a signal; it updates only when health actually changes.
func _ready() -> void:
    player.health_changed.connect(_on_health_changed)     # emitted by gameplay
func _on_health_changed(current: int, max: int) -> void:
    $HealthBar.value = float(current) / max
# WRONG: func _process(dt): $HealthBar.value = player.hp / player.max_hp  # polls every frame,
# couples UI to the player's internals, and runs work even when nothing changed.
```

## Pitfalls

- **Absolute pixel positions / a single design resolution.** Looks right on your monitor, broken
  everywhere else. Anchor to edges/center and flow with containers.
- **No aspect-ratio policy.** 16:9-only layouts crop or letterbox badly on ultrawide and phones.
  Decide expand vs letterbox and anchor HUD to corners that move outward.
- **Ignoring the safe area.** HUD under a notch or lost to TV overscan. Inset critical elements.
- **No initial focus / no focus neighbors.** The game is unplayable on a gamepad; players land
  on a menu with nothing selected. Always focus one control and define navigation.
- **Polling game state in `_process`/`Update`.** Couples UI to internals and wastes work. Push
  updates via signals/events.
- **Tiny fixed font sizes.** Unreadable on a TV-at-distance or a small phone. Scale text with the
  UI and offer a text-size option.
- **Menu flow as boolean flags** (`isPaused`, `inSettings`, …) becomes unmanageable. Use a
  screen stack with push/pop.
- **Hardcoded English strings baked into layout.** Translations overflow buttons. Externalize
  strings and let containers size to content (see `references/`).
- **Mouse-only or focus-only.** Support both; switching input device should not strand the user.

## References

- For stretch/scale modes per engine, the safe-area math, a complete focus-navigation and
  screen-stack pattern, diegetic vs non-diegetic UI, accessibility (text size, contrast,
  colorblind-safe state), and localization-ready layout, read `references/layout-and-flow.md`.

## Related skills

- `godot-ui-control`, Unity UI (UGUI/UI Toolkit) — the concrete widgets, themes, and styling.
- `game-feel` — button pops, transitions, and HUD juice that ride on top of this layout.
- `dialogue-systems` — conversation/choice UI that lives inside this UI shell.
- `input-systems` — device switching, rebinding screens, and accessible controls.
- `rpg`, `card-game`, `tower-defense`, `visual-novel` — UI-heavy genres that compose this skill.



### [Reference: game-ui-ux / layout-and-flow.md]

# Layout, scaling & flow — depth for `game-ui-ux`

Detail the `game-ui-ux` body defers here: per-engine scaling modes, safe-area math, a complete
focus + screen-stack pattern, diegetic UI, accessibility, and localization-ready layout. Snippets
target **Godot 4.7** and **Unity 6.3 LTS**.

## 1. Scaling modes per engine

**Godot 4.7** (Project Settings → Display → Window → Stretch):

| Setting | Choose | Effect |
|---------|--------|--------|
| Mode | `canvas_items` | UI scales with the window (vs `viewport` = pixel-exact, `disabled` = none) |
| Aspect | `expand` | shows more world/UI space on odd ratios; `keep` letterboxes |
| Scale | `1.0`+ | global UI multiplier |

Anchor HUD corners so `expand` puts the extra space where you want it. `keep_width`/`keep_height`
pin one axis for hard 16:9 designs.

**Unity 6.3 LTS** (`CanvasScaler` on each Canvas):

- `UI Scale Mode = Scale With Screen Size`.
- `Reference Resolution = 1920×1080` (or your art's design size).
- `Screen Match Mode = Match Width Or Height`, `Match = 0.5` (blend). Use `1.0` if vertical
  layout must never clip, `0.0` if horizontal must not.
- `Reference Pixels Per Unit = 100` for sprite-based UI.

## 2. Safe-area math

The OS reports a safe rectangle inside the screen (excludes notch, rounded corners, and — on TVs
— overscan margins). Inset only **critical** UI (health, timers, prompts); decorative art can
bleed to the edge.

```text
# Normalized anchors from a pixel safe rect (engine-neutral):
anchorMin = (safe.x / screenW,                 safe.y / screenH)
anchorMax = ((safe.x + safe.w) / screenW,       (safe.y + safe.h) / screenH)
# Re-apply on resolution change / orientation change, not once at startup.
```

- **Godot:** `DisplayServer.get_display_safe_area()` → `Rect2i` in pixels; reapply on
  `size_changed`.
- **Unity:** `Screen.safeArea` → `Rect` in pixels; recompute when `Screen.width/height` or
  `Screen.orientation` changes (cache the last applied rect to avoid per-frame work).

## 3. Focus navigation (full pattern)

Requirements for controller/keyboard usability:

1. **Initial focus** on every screen open (`grab_focus()` / `EventSystem.SetSelectedGameObject`).
2. **Explicit neighbors** for predictable movement (Godot `focus_neighbor_*`; Unity `Navigation`
   = Explicit with up/down/left/right, or Automatic for simple grids).
3. **Visible focus style** distinct from hover (theme focus stylebox / Unity Selectable
   transition). Never rely on color alone (see accessibility).
4. **Wrap or stop** intentionally at list ends; trap focus inside modal dialogs.
5. **Device coexistence:** moving the mouse can update selection; a gamepad press acts on the
   focused control. Don't clear focus when the mouse moves.

```gdscript
# Godot 4.7: trap focus inside a modal so the stick can't escape to the game behind it.
func open_modal() -> void:
    _prev_focus = get_viewport().gui_get_focus_owner()
    $Modal.show(); $Modal/OK.grab_focus()
func close_modal() -> void:
    $Modal.hide()
    if is_instance_valid(_prev_focus): _prev_focus.grab_focus()
```

## 4. Screen/menu stack

Model screens as a stack of UI states; the top owns input and is visible. Push for overlays,
pop for "back". This generalizes pause, settings-over-pause, and confirm dialogs.

```gdscript
# Godot 4.7 sketch (a CanvasLayer per screen; pausing the tree under an overlay):
var _stack: Array[Control] = []
func push(screen: Control) -> void:
    if _stack.size() > 0: _stack.back().set_process_input(false)
    _stack.append(screen); add_child(screen); screen.grab_focus_default()
func pop() -> void:
    var top := _stack.pop_back(); top.queue_free()
    if _stack.size() > 0:
        _stack.back().set_process_input(true); _stack.back().grab_focus_default()
# Pause overlay: get_tree().paused = true and set the overlay's process_mode = ALWAYS.
```

This mirrors the state-stack idea in `love2d-core`'s `references/state-stack.md`, applied to UI.

## 5. Diegetic vs non-diegetic UI

- **Non-diegetic:** drawn on the screen plane, outside the fiction (most HUDs). Cheapest, clearest.
- **Diegetic:** UI that exists in the world (ammo counter on the gun, health on the suit). More
  immersive, more work, can hurt readability. Use for key elements, keep a non-diegetic fallback.
- **Spatial/world-space:** floating health bars, damage numbers — anchor to world position,
  clamp to screen edges when off-screen, and scale with distance (3D).

## 6. Accessibility (bake in, don't bolt on)

- **Text size option** and never hardcode tiny fonts; size to a percentage of reference height.
- **Contrast & color independence:** don't encode state in color alone — add icon/shape/text.
  Provide colorblind-safe palettes.
- **Scalable hit targets** for touch (≥ ~9 mm); padding around small buttons.
- **Reduce-motion / reduce-flashing** toggles (coordinate with `game-feel`).
- **Full keyboard + gamepad** reachability (section 3); don't gate actions behind mouse-only.

## 7. Localization-ready layout

- Externalize strings (Godot `tr()` + translation CSV/PO; Unity Localization package). Never bake
  display text into layout logic.
- Let containers **size to content** so longer translations (German is ~30% longer) don't clip.
  Avoid fixed-width buttons sized to English.
- Leave room for RTL mirroring and different number/date formats.
- Keep icons separate from text so only strings need translating.



---


<a id="input-systems"></a>
# SKILL: input-systems

---
name: input-systems
description: >
  Architect game input — action mapping (abstracting keys into named actions),
  rebinding with conflict detection and persistence, multi-device support
  (keyboard, gamepad, touch), analog deadzones, and feel features like input
  buffering and coyote time, plus accessibility. Engine-neutral. Use when the
  user mentions input mapping, rebind controls, gamepad support, deadzone, input
  buffering, coyote time, or accessible controls.
---

# Input systems

Never wire gameplay to raw keys. Map physical inputs (a key, a button, a touch)
to named **actions** (`jump`, `interact`, `move`), and let gameplay read actions.
That one indirection gives you rebinding, multi-device support, and accessibility
almost for free. This skill is the engine-neutral architecture; bind it to
`unity-input-system`, `unreal-enhanced-input`, or Godot's `InputMap`.

## When to use

- Use to design an input layer: actions, bindings, multiple devices, and a
  rebinding UI with conflict detection and saved bindings.
- Use to add analog handling (deadzones, sensitivity) and game-feel features
  (input buffering, coyote time).
- Use to make controls accessible (full remapping, hold-vs-toggle, sensitivity,
  no required simultaneous presses).

**When *not* to use:** for an engine's concrete input package/API, use
`unity-input-system`, `unreal-enhanced-input`, or Godot's InputMap. For the
movement/jump *physics* the buffer feeds, see `physics-tuning` and the engine
movement skill. Persisting bindings to disk is `save-systems`.

## Core workflow

1. **Define actions, not keys.** Gameplay asks "is `jump` pressed?", never "is
   Space pressed?". Actions are the stable contract; bindings are data.
2. **Bind per device.** Each action holds bindings for keyboard, gamepad, and
   touch. The active device is whichever last sent input; swap UI prompts to match.
3. **Read the right edge.** Use *pressed-this-frame* (edge) for discrete actions
   (jump, interact) and *held* (level) for continuous ones (move, aim). Confusing
   the two causes double-fires or missed presses.
4. **Filter analog input.** Apply a deadzone to sticks/triggers so resting drift
   reads as zero, and scale sensitivity/curve to taste.
5. **Buffer for feel.** Remember a pressed action for a short window so a slightly
   early press still fires (input buffering); allow a jump shortly after leaving a
   ledge (coyote time).
6. **Make rebinding first-class.** A UI that captures the next input, detects
   conflicts, and persists bindings — and a reset-to-default. Save via
   `save-systems`.
7. **Verify on every device** and with rebinds: keyboard, gamepad, touch; rebind
   an action mid-game and confirm gameplay and prompts follow.

## Patterns

### 1. Actions over raw keys; edge vs held

```gdscript
# Gameplay reads ACTIONS. The mapping from key/button to action lives in data.
# Discrete (edge): fire once on the press frame.
if Input.is_action_just_pressed("jump"):
    try_jump()
# Continuous (held): read every frame as an axis.
var move := Input.get_axis("move_left", "move_right")   # -1..1
player.velocity.x = move * RUN_SPEED
# RIGHT: name actions ("jump"); rebinding/devices just change the binding data.
# WRONG: `if Input.is_key_pressed(KEY_SPACE)` — unrebindable, keyboard-only,
# and `is_key_pressed` is a held check that would re-fire jump every frame.
```

Engine equivalents: Godot `InputMap` + `Input.is_action_just_pressed`; Unity
Input System `InputAction` / action maps; Unreal Enhanced Input `Input Actions` +
`Input Mapping Contexts`.

### 2. Analog deadzone and sensitivity

```gdscript
# Raw sticks never rest at exactly zero. Apply a RADIAL deadzone (on the vector
# length), not per-axis, so diagonals aren't clipped into the axes.
func apply_deadzone(stick: Vector2, dead := 0.2, sens := 1.0) -> Vector2:
    var mag := stick.length()
    if mag < dead:
        return Vector2.ZERO                      # inside deadzone -> no movement
    # Rescale so motion ramps from 0 at the edge of the deadzone, not from `dead`.
    var scaled := (mag - dead) / (1.0 - dead)
    return stick.normalized() * pow(scaled, sens)  # sens>1 = finer near center
# WRONG: clamping each axis separately — it carves a square hole and snaps to axes.
```

### 3. Input buffering + coyote time (forgiving, responsive feel)

```gdscript
# Buffer: a jump pressed slightly BEFORE landing still triggers on touchdown.
# Coyote: a jump pressed slightly AFTER walking off a ledge still works.
const BUFFER := 0.12   # seconds an early press stays "remembered"
const COYOTE := 0.10   # seconds after leaving ground you can still jump
var _buffer_timer := 0.0
var _coyote_timer := 0.0

func _physics_process(dt):
    _buffer_timer -= dt
    _coyote_timer = COYOTE if is_on_floor() else _coyote_timer - dt
    if Input.is_action_just_pressed("jump"):
        _buffer_timer = BUFFER                  # remember the press
    if _buffer_timer > 0.0 and _coyote_timer > 0.0:
        velocity.y = JUMP_VELOCITY
        _buffer_timer = 0.0; _coyote_timer = 0.0  # consume both so it fires once
```

### 4. Rebinding with conflict detection

```gdscript
# Capture the next physical input, reject duplicates, then persist.
func rebind(action: String, event: InputEvent) -> bool:
    for other in actions:                        # conflict check across actions
        if other != action and binding_of(other) == event:
            return false                         # already used -> let UI warn/swap
    set_binding(action, event)                   # engine: erase old + add new event
    save_bindings()                              # persist (see save-systems)
    return true
# Always provide "reset to defaults", and never let the player unbind a key they
# need to reach the menu without an alternative.
```

## Pitfalls

- **Hardcoding keys** in gameplay blocks rebinding, locks out gamepad/touch, and
  scatters input logic. Read named actions only.
- **Edge vs held confusion**: using a held check for jump re-fires every frame;
  using an edge check for movement drops held input. Match the check to the action.
- **Per-axis deadzones** clip diagonal stick input and snap movement to the axes.
  Use a radial deadzone on the vector magnitude.
- **No buffering/coyote time** makes tight platformers feel unfair even when the
  physics are correct — players "clearly pressed jump". Add small windows.
- **Rebinding without conflict handling** lets two actions share a key, or strands
  the player by unbinding menu access. Detect conflicts; guarantee a way back.
- **Not swapping prompts on device change** shows "Press Space" to a gamepad
  player. Track the last-used device and switch glyphs.
- **Ignoring accessibility**: required simultaneous presses, no remap, fixed
  sensitivity, hold-only actions. Offer remap, toggle-vs-hold, and sensitivity.
- **Reading input in the wrong loop**: poll held state in the physics step for
  consistent movement; capture discrete presses so none are missed between frames.

## References

- `references/buffering-and-accessibility.md` — buffering/coyote tuning, jump feel
  (variable height, apex), device detection and prompt swapping, touch controls,
  and an accessibility checklist (remap, toggle/hold, sensitivity, latency).

## Related skills

- `unity-input-system`, `unreal-enhanced-input` — concrete engine input APIs
  (Godot uses `InputMap` + the `Input` singleton).
- `save-systems` — persist custom key bindings and input settings.
- `physics-tuning` — the movement the buffer/coyote windows feed into.
- `platformer`, `fps-shooter` — genres whose feel depends on input handling.



### [Reference: input-systems / buffering-and-accessibility.md]

# Input buffering, game feel, devices, and accessibility

The action layer makes controls work; these refinements make them feel good and
reach more players.

## Buffering and coyote time, tuned

Both convert "I pressed it at almost the right moment" into success:

- **Input buffer** — when an action is pressed but can't fire yet (mid-air jump,
  attack during recovery), remember it for a short window and fire the instant it
  becomes valid. Typical window: ~100–150 ms (≈6–9 frames at 60 Hz).
- **Coyote time** — allow a ground action (jump) for a brief window *after*
  leaving the ledge. Typical window: ~80–120 ms. Players perceive the edge as
  generous, not buggy.

Tuning notes:

- Express windows in **seconds**, not frames, so they're frame-rate independent.
- **Consume** the buffer when it fires, and reset coyote on a successful jump, so
  one press = one action (no double jumps from a lingering buffer).
- Too-long windows feel mushy or cause unintended actions; too-short feel
  punishing. Tune by playtest, per game.

## Jump feel (where input meets physics)

Input handling and `physics-tuning` together create jump feel:

- **Variable height**: full gravity while rising only if the button is held; if
  released early, increase downward acceleration (or cut upward velocity) so a tap
  is a short hop. Read the *held* state for this, the *edge* for the initial jump.
- **Apex hang**: reduce gravity near the top of the arc for a brief float — gives
  air control and reads as responsive.
- **Fast fall / increased fall gravity**: heavier gravity on the way down than up
  makes jumps feel snappy rather than floaty.

These are physics tweaks driven by input state; keep the input layer reporting
edge/held cleanly so the controller can apply them.

## Device detection and prompt swapping

- Track the **last-used device**: when an event arrives, note whether it was
  keyboard/mouse, a specific gamepad type, or touch. Switch on-screen button
  glyphs and tutorials to match.
- Don't assume a single gamepad layout — Xbox, PlayStation, and Switch differ in
  face-button labels. Map to abstract glyphs (South/East/West/North) and localize
  the icon set.
- Support **hot-swapping**: a player may start on keyboard and pick up a
  controller mid-session. Re-resolve prompts on device change without a restart.

## Touch controls

- Provide on-screen controls sized for thumbs (virtual stick / buttons) or
  gesture mappings, routed through the **same action layer** as physical input.
- A virtual stick should use a **floating origin** (anchor where the thumb lands)
  and a radial deadzone, just like a physical stick.
- Avoid relying on precise multi-touch chords; offer larger hit areas and
  forgiving timing. Test on a range of screen sizes.

## Accessibility checklist

Input is one of the highest-impact accessibility surfaces. Aim for:

- **Full remapping** of every action, for every device, with conflict detection
  and reset-to-default.
- **Toggle vs hold** options for actions that default to hold (aim, crouch,
  sprint) — sustained presses are painful or impossible for some players.
- **No required simultaneous inputs** for essential actions; offer single-input
  alternatives or sequential equivalents.
- **Adjustable sensitivity and deadzone** for sticks and aim, plus optional
  aim assist.
- **Adjustable timing windows** where feasible (extend buffer/coyote, slow QTEs),
  or a "hold instead of mash" option for repeated-press prompts.
- **Stick/axis inversion** (X and Y independently) for camera and movement.
- **Input latency**: process discrete presses promptly and avoid adding
  artificial delay; perceived lag harms both feel and accessibility.

## Loop placement

- Read **held/axis** state in the fixed/physics step so movement is consistent
  with the simulation (see `physics-tuning`).
- Capture **discrete presses** as events (or via a just-pressed flag latched each
  frame) so a press between physics ticks is never lost.
- Save custom bindings and input settings through `save-systems` and reload them
  at startup before the first frame of gameplay.



---


<a id="performance-optimization"></a>
# SKILL: performance-optimization

---
name: performance-optimization
description: >
  Find and fix game performance problems methodically — measure with the engine profiler first,
  reason about the frame-time budget, locate the CPU-vs-GPU bottleneck, then apply the right fix:
  object pooling, draw-call batching, fewer allocations/GC spikes, and asset budgets. Engine-
  neutral method that pairs with each engine's profiler. Use when the user mentions performance,
  optimize, low/dropping FPS, frame drops, stutter, lag, profiler, frame budget, draw calls,
  batching, garbage collection/GC spikes, object pooling, or "the game runs slow".
---

# Performance optimization

Performance work is a measurement discipline, not a bag of tricks. The method is always the
same: **profile → find the one bottleneck → fix that → measure again**. This skill teaches that
loop and the highest-leverage fixes (pooling, batching, allocation control, asset budgets), and
points you at each engine's profiler. It pairs with `physics-tuning` for simulation cost.

## When to use

- Use when the frame rate is low or uneven, the game stutters/hitches, or it must hit a target
  (60 FPS desktop, 30/60 mobile) and currently doesn't.
- Use to decide *what* to optimize: profile, read the frame budget, and identify whether the CPU
  or GPU is the bottleneck before changing any code.
- Use to apply specific fixes: object pooling, draw-call/batch reduction, removing per-frame
  allocations and GC spikes, and setting asset budgets.

**When *not* to use:** for physics jitter/tunneling/timestep specifically, use `physics-tuning`.
For the engine's concrete profiler UI and rendering settings, use that
engine skill (`godot-export` covers some build settings; engine cores cover the rest). This skill
is the cross-engine method and the shared fixes.

## The golden rule: measure first, never guess

Most performance "fixes" applied without profiling target the wrong thing and add complexity for
no gain. **Do not optimize code you have not measured.** Open the profiler, find the single
biggest cost in a representative scene on representative hardware, and fix that. Re-measure to
confirm the fix helped before moving on. Profile a **release/optimized build** where it matters —
editor and debug builds lie (editor overhead, no compiler optimization).

## Core workflow

1. **Define the target and reproduce.** State the goal (e.g. 60 FPS = 16.67 ms/frame) and find a
   repeatable worst-case scene. "Sometimes slow" is unfixable; a reproducible spike is fixable.
2. **Profile before touching code.** Run the engine profiler and read the frame: total frame
   time, and the split between CPU (game logic, physics, scripts) and GPU (rendering).
3. **Find the bottleneck — CPU or GPU.** If GPU time ≫ CPU, attack draw calls/overdraw/shaders/
   resolution. If CPU time dominates, attack scripts/physics/allocations. Fixing the wrong side
   does nothing.
4. **Fix the single biggest cost.** Prefer an **algorithmic** win (do less work, cache, spatial
   partition, run less often) over micro-optimizing a hot line. Apply the matching shared fix
   (pooling, batching, allocation removal).
5. **Re-measure on the same scene/hardware.** Confirm the number moved. Keep or revert based on
   data, not intuition.
6. **Set budgets so it stays fixed.** Per-frame ms budgets per subsystem, plus asset budgets
   (texture sizes, triangle counts, draw-call ceilings); add a perf check to verification.
7. **Report measured numbers.** State before/after frame time, the bottleneck found, and the fix
   — never "should be faster". If you could only measure in-editor, say so.

## Patterns

### 1. Frame budget math (turn "feels slow" into a number)

```text
target FPS → frame budget:   60 FPS = 16.67 ms   |   30 FPS = 33.3 ms   |   120 FPS = 8.33 ms
The WHOLE frame (CPU sim + render submit + GPU) must fit the budget; the GPU runs in parallel,
so the slower of CPU-frame and GPU-frame sets your FPS. Allocate sub-budgets, e.g. @60 FPS:
  gameplay/scripts ~5 ms · physics ~3 ms · rendering(CPU submit) ~4 ms · UI/other ~2 ms · slack.
If one subsystem blows its slice, that's your target — not whatever you assumed.
```

### 2. Measure with the engine profiler (do this before any fix)

```text
Godot 4.7 : Debugger ▸ Profiler (script/physics time) and Monitors tab (FPS, draw calls, memory).
            In code: Performance.get_monitor(Performance.TIME_PROCESS) and
            Performance.get_monitor(Performance.RENDER_TOTAL_DRAW_CALLS_IN_FRAME).
Unity 6.3 LTS   : Profiler window (CPU/GPU/Memory/Rendering modules) + Frame Debugger for draw calls.
            In code: a ProfilerRecorder tracking "CPU Main Thread Frame Time" for a HUD/log.
Unreal 5  : `stat unit` (Frame/Game/Draw/GPU ms), `stat fps`, `stat scenerendering` (draw calls);
            Unreal Insights for deep traces.
# Read the split: is the Draw/GPU line the biggest, or the Game/CPU line? That decides the fix.
```

### 3. Object pooling (stop allocating/freeing in hot loops)

```gdscript
# Bullets, particles, enemies, damage numbers: reuse a fixed set instead of instantiate()/free()
# every frame — that thrashes memory and (in C#) feeds the GC.
var _pool: Array[Node] = []
func acquire() -> Node:
    var n: Node = _pool.pop_back() if not _pool.is_empty() else bullet_scene.instantiate()
    n.set_process(true); n.visible = true
    return n
func release(n: Node) -> void:
    n.set_process(false); n.visible = false       # disable + hide; DON'T free
    _pool.append(n)                                # back to the pool for reuse
# RIGHT: pre-warm the pool at load; reuse. WRONG: instantiate()/queue_free() per shot.
```

### 4. Cut draw calls (the most common GPU-side win)

```text
Each unique material/texture/state change is roughly a draw call; thousands of them stall the GPU.
- Atlas textures and share materials so sprites/meshes batch into one call.
- Identical meshes → GPU instancing (Unity), MultiMesh / MultiMeshInstance (Godot), Instanced
  Static Mesh (Unreal).
- Static geometry → static batching / baking; mark non-moving objects static.
- Reduce overdraw: limit large overlapping transparent/particle layers (they re-shade pixels).
- Fewer real-time lights/shadows; bake lighting where it doesn't move.
Measure draw calls before and after — the count should drop, and so should GPU frame time.
```

### 5. Kill per-frame allocations (GC spikes = stutter)

```csharp
// Unity 6.3 LTS (C#). Allocating every frame fills the managed heap; the GC then stalls a frame.
// WRONG (allocates each call): foreach (var e in FindObjectsOfType<Enemy>()) ...  // + LINQ, new[]
// RIGHT: cache references once, reuse buffers, avoid LINQ/boxing in Update.
void Update() {
    _hits = Physics.RaycastNonAlloc(ray, _hitBuffer);   // reuse a preallocated array
    for (int i = 0; i < _hits; i++) { /* ... */ }       // no per-frame allocation
}
// Godot/GDScript: avoid building new arrays/dictionaries every frame in _process; reuse them.
```

## Pitfalls

- **Optimizing without profiling.** The intuitive culprit is usually wrong. Measure first, every
  time.
- **Profiling the editor / a debug build.** Editor overhead and unoptimized code mislead. Profile
  a release build on target hardware for real numbers.
- **Fixing the wrong side.** Micro-optimizing CPU code when the GPU is the bottleneck (or vice
  versa) changes nothing. Check the CPU-vs-GPU split first.
- **Micro-optimizing over algorithm.** Shaving a function when an O(n²) loop or a per-frame
  full-scene query is the real cost. Reduce the work, don't polish it.
- **Instantiate/free in hot loops.** Spawning and destroying bullets/particles every frame causes
  fragmentation and GC spikes. Pool them.
- **Per-frame allocations / LINQ / boxing in `Update`** (C#) feed the GC → periodic hitches.
  Cache and reuse.
- **Draw-call explosion** from unique materials and unbatched sprites/meshes. Atlas, share
  materials, instance, batch.
- **Overdraw** from stacked transparents/particles/full-screen effects re-shading pixels.
- **No budgets.** Without per-subsystem ms and asset ceilings, performance silently regresses;
  enforce them in your build/CI checks.
- **Optimizing too early.** Don't contort a prototype for performance before it's fun or measured.

## References

- For per-engine profiler walkthroughs, the CPU-vs-GPU triage flowchart, a complete pooling
  manager, batching/instancing rules per engine, allocation/GC guidance, LOD/culling, and asset
  budgets (texture sizes, triangle counts, audio, mobile thermals), read
  `references/profiling-and-budgets.md`.

## Related skills

- `physics-tuning` — simulation cost, fixed-step budget, sleeping bodies, broadphase layers.
- `godot-export` — release/build settings that affect measured performance.
- `procedural-gen`, `game-ai` — common CPU hotspots (generation, pathfinding) to budget and defer.
- `roguelike`, `tower-defense`, `survival-crafting` — entity-heavy genres that need pooling/budgets.



### [Reference: performance-optimization / profiling-and-budgets.md]

# Profiling & budgets — depth for `performance-optimization`

Detail the body defers here: per-engine profiler walkthroughs, the CPU-vs-GPU triage flow, a
pooling manager, batching/instancing rules, allocation/GC guidance, LOD/culling, and asset
budgets. Targets **Godot 4.7**, **Unity 6.3 LTS**, **Unreal 5.8**.

## 1. CPU-vs-GPU triage (decide before you fix)

```text
1. Read total frame time vs your budget (16.67 ms @60).
2. Compare CPU-frame time and GPU-frame time:
     GPU >> CPU  → GPU-bound  → draw calls, overdraw, shader cost, resolution, lights/shadows.
     CPU >> GPU  → CPU-bound  → scripts, physics, pathfinding, allocations/GC, too many nodes.
     Both high / alternating → find the per-frame spike in the timeline (one function/system).
3. Within the bound side, sort costs descending and attack the top one only.
4. Re-measure. If it didn't move the frame time, you fixed the wrong thing — revert and re-triage.
```

A GPU-bound game won't speed up from faster C#; a CPU-bound game won't speed up from fewer draw
calls. This split is the single most important decision in performance work.

## 2. Per-engine profiler quick start

**Godot 4.7**
- Editor: **Debugger ▸ Profiler** (per-function script + physics time, frame time), and the
  **Monitors** tab (FPS, draw calls, video/static memory, object/node counts).
- Code: `Performance.get_monitor(Performance.TIME_PROCESS)` (process ms),
  `Performance.TIME_PHYSICS_PROCESS`, `Performance.RENDER_TOTAL_DRAW_CALLS_IN_FRAME`,
  `Performance.RENDER_TOTAL_PRIMITIVES_IN_FRAME`, `Performance.MEMORY_STATIC`.
- Visual debugging: viewport **View Information / View Frame Time** overlays.

**Unity 6.3 LTS**
- **Profiler** window: CPU Usage, GPU Usage, Rendering, Memory modules. Use **Deep Profile**
  sparingly (high overhead, skews numbers).
- **Frame Debugger** to step draw calls and see what breaks batching (SetPass calls, batches).
- Code: `ProfilerRecorder` tracking `"CPU Main Thread Frame Time"` (Unity 6.3 LTS000 manual) for an
  in-build HUD/CSV; `FrameTimingManager` for CPU/GPU frame times.
- **Profile a Development build on device** (`Autoconnect Profiler`), not just the editor.

**Unreal 5**
- Console: `stat unit` (Frame / Game / Draw / GPU ms), `stat fps`, `stat scenerendering`
  (draw calls, primitives), `stat game`, `stat gpu`.
- **Unreal Insights** for full timeline traces; `ProfileGPU` (Ctrl+Shift+,) for a GPU breakdown.

## 3. Pooling manager (generic)

```text
class Pool<T>:
    free: list
    create_fn, reset_fn
    prewarm(n):  for n → free.push(create_fn())          # allocate up front, off the hot path
    acquire():   t = free.pop() or create_fn(); activate(t); return t
    release(t):  reset_fn(t); deactivate(t); free.push(t)  # never destroy; recycle
```

Pool anything spawned frequently and briefly: bullets, shells, particles, damage numbers,
enemies in waves, audio one-shots. Pre-warm at load to avoid first-use hitches. Cap the pool and
decide an overflow policy (grow, or recycle the oldest).

## 4. Batching & instancing rules

- **What breaks a batch:** a different material, texture, or render state between objects. Share
  materials and **atlas** textures so runs of objects submit as one draw call.
- **Identical meshes, many instances** → GPU instancing: Unity (enable *GPU Instancing* on the
  material) / Godot `MultiMesh` + `MultiMeshInstance2D/3D` / Unreal Instanced Static Mesh or
  Hierarchical ISM.
- **Static geometry** → static batching (Unity), mark static; bake where possible.
- **2D** → texture atlases + a shared material batch sprites; avoid per-sprite materials.
- **UI** → minimize canvas rebuilds (Unity: split static/dynamic canvases); a changing element
  shouldn't dirty the whole canvas.
- **Lights/shadows** → bake static lighting; cap real-time shadow casters; cull small shadows.

## 5. Allocation / GC guidance

- **C# (Unity):** no per-frame `new`, no LINQ in `Update`, avoid boxing (e.g. `enum` as dictionary
  key), use `NonAlloc` physics queries, reuse `List`/arrays (`Clear()` not realloc), prefer
  structs for small hot data, cache `GetComponent`/`Find` results. The goal is **0 B GC.Alloc per
  frame** in steady state.
- **GDScript (Godot):** don't build new `Array`/`Dictionary` each `_process`; reuse; prefer typed
  arrays; avoid heavy work in `_process` that belongs on a timer/signal.
- **General:** strings are a classic hidden allocator (concatenation, formatting) — build them
  rarely, cache results.

## 6. Do-less techniques (algorithmic wins)

- **Run less often:** update AI/HUD/expensive checks on a timer or every N frames, not every
  frame; stagger across frames (time-slicing).
- **Spatial partition:** grid/quadtree/octree so queries touch nearby objects only, not all N.
- **LOD & culling:** lower detail at distance; frustum/occlusion culling; despawn off-screen
  far entities.
- **Cache results:** memoize pathfinding, line-of-sight, and derived data; invalidate on change.
- **Defer/Amortize:** spread procedural generation and loading across frames to avoid spikes.

## 7. Asset budgets (prevent regressions at the source)

| Asset | Typical desktop budget | Mobile budget | Notes |
|-------|------------------------|---------------|-------|
| Texture max size | 2048–4096 | 1024–2048 | use mipmaps; compress (BCn / ASTC) |
| Character triangles | 30k–80k | 5k–20k | LODs for distance |
| Draw calls / frame | low thousands | a few hundred | the count that matters most on mobile |
| Real-time lights | a few | 1–2 + baked | bake the rest |
| Audio | streamed music, short SFX in memory | same | don't decompress everything at load |

Mobile adds **thermal throttling**: a game that hits 60 FPS for 2 minutes then drops is
overheating — target headroom, cap frame rate, and reduce sustained GPU load.



---


<a id="rpg"></a>
# SKILL: rpg

---
name: rpg
description: >
  Build an RPG: stats and leveling, inventory and equipment, quests, branching dialogue, save/load,
  and combat. Use for an RPG/JRPG, or designing stat, inventory, quest, or combat systems.
---

# RPG

A playbook for role-playing games — stats and progression, inventory/equipment, quests,
dialogue, and combat. This is a **compositional** skill: it ties data-driven content,
dialogue, and saving together. It does not re-teach those primitives; it defines the systems
that make growth and choice feel meaningful, and points to the skills that implement each.

## When to use

- Use when building an RPG/JRPG/action-RPG: the player has **stats that grow**, an
  **inventory**, **quests**, **dialogue**, and persistent progress.
- Use when designing a leveling curve, a damage formula, an inventory/equipment model, or a
  quest state machine.

**When *not* to use:** permadeath dungeon runs with no persistent character → `roguelike`.
Pure conversation/branching story → `visual-novel`. Open-world needs/crafting/base-building →
`survival-crafting`. For the dialogue engine itself, use `dialogue-systems`.

## Core loop

**Explore → encounter (fight / talk / solve) → earn rewards (XP, loot, story) → grow
(level up, gear up, unlock) → take on harder content.** The fantasy is *getting stronger and
shaping who your character is*; every system should feed that growth-and-choice loop.

## Must-have systems

1. **Stats + leveling** — base attributes, derived combat stats, XP curve, level-up gains.
2. **Inventory + equipment** — data-defined items, stacking, slots, stat modifiers.
3. **Combat** — turn-based or action; damage formula, status effects, win/loss.
4. **Quests** — objectives, state machine (available→active→complete→turned-in), rewards.
5. **Dialogue** — branching lines, conditions on game state, choices that matter.
6. **Save/load** — persist character, inventory, quest progress, world flags, with versioning.
7. **Economy + progression gating** — gold/shops; gate power behind level/quest/region.
8. **UI** — HUD, inventory, quest log, dialogue box, character sheet.

## Design knobs

| Knob | Effect | Notes |
|------|--------|-------|
| XP curve shape | pacing of power | Fast early, slow late (see refs). |
| Stat→derived scaling | build diversity | One attribute shouldn't dominate. |
| Damage formula | tactical feel | Subtractive vs. ratio mitigation (refs). |
| Random variance / crit | swinginess | ±10% and ~1.5× crit are safe defaults. |
| Drop rates / economy | reward cadence | Avoid trivializing shops with loot. |
| Power gating | difficulty gating | Level/region/quest locks. |
| Reversible modifiers | buff/gear correctness | Layer mods; never edit base stats. |
| Choice consequence | role-play weight | Quest/dialogue flags should branch outcomes. |

## Patterns

### 1. Derived stats from base attributes (recompute, never store as truth)

```python
# Pseudocode. Base attributes are the only "truth"; combat stats are derived each time.
def derive(base, mods):
    s = apply_modifiers(base, mods)          # base + flat adds + percent, then clamp
    return {
        "max_hp":  20 + s["VIT"] * 8,
        "attack":  s["STR"] * 2,
        "defense": s["VIT"] + s["AGI"] * 0.5,
    }
# Equipping pushes a modifier; unequipping pops it. HP/attack recompute automatically.
```

### 2. XP curve + level-up

```python
# Pseudocode. Quadratic curve: fast early levels, long late ones.
def xp_to_next(level, base=100): return base * level * level

def gain_xp(actor, amount):
    actor.xp += amount
    while actor.xp >= xp_to_next(actor.level):
        actor.xp -= xp_to_next(actor.level)
        actor.level += 1
        actor.base["STR"] += 2; actor.base["VIT"] += 2   # grant gains / skill points
        on_level_up(actor)                                # heal, unlock, notify
```

### 3. Quest objective update driven by game events

```python
# Pseudocode. Game events advance matching objectives; completion grants rewards.
def on_event(kind, data):
    for q in active_quests:
        for obj in q.objectives:
            if obj.event == kind and matches(obj, data) and not obj.done:
                obj.count += 1
                if obj.count >= obj.needed: obj.done = True
        if all(o.done for o in q.objectives):
            q.state = "complete"                # turn-in grants xp/gold/items
```

## Pitfalls / failure modes

- **Editing base stats for buffs/gear** → values drift and corrupt on save/reload. Keep a
  modifier layer; push/pop it (Pattern 1).
- **Storing derived stats as truth** → desync after a stat change. Recompute from base.
- **Runaway XP/damage numbers** → either an exponential curve with no cap or a subtractive
  formula at huge values. Pick a curve and a formula family deliberately (refs).
- **Content as code** → every item/quest hardcoded. Define items, enemies, and quests as
  **data** (`godot-resources` / `unity-scriptableobjects`).
- **Save format with no version field** → old saves break on update. Add a `version` and a
  migration path from day one (see `save-systems`).
- **Choices without consequences** → dialogue branches that reconverge immediately feel hollow.
  Set flags that actually change later quests/world state.
- **Quest progress not persisted** → reloading loses mid-quest state. Save quest state, not
  just completion.

## Composition (build it from these skills)

- **Dialogue:** `dialogue-systems` (Yarn Spinner / Ink) — branching lines, conditions, variables.
- **Persistence:** `save-systems` — character, inventory, quest flags, world state, versioning.
- **Content data:** `godot-resources` / `unity-scriptableobjects` — items, enemies, quests, skills as assets.
- **Combat AI:** `game-ai` for enemy behavior; for turn order reuse the scheduler idea in `roguelike`.
- **UI:** `game-ui-ux` for HUD/menu layout, resolution scaling, and controller/keyboard nav; `godot-ui-control` for the concrete inventory, quest log, character sheet, and dialogue box.
- **World:** `level-design` plus your engine's tilemap/3D skill (`godot-tilemap`, `godot-3d-essentials`).

## References

- For stat/damage formulas, leveling curves, turn-vs-action combat timelines, inventory/equipment
  data shapes, and the quest state model, read `references/stats-combat-quests.md`.



### [Reference: rpg / stats-combat-quests.md]

# RPG stats, combat, and quests (depth)

Formulas and data shapes behind `SKILL.md`. Engine-neutral pseudocode. Treat every number
as a starting point to tune against playtests, not a law.

## 1. Stat block: base, derived, and modifiers

Separate **base** attributes from **derived** combat stats so a single attribute change
ripples predictably, and keep **modifiers** in their own layer so buffs/equipment are
reversible without corrupting base values.

```python
# Base attributes (what leveling/allocation changes)
base = { "STR": 10, "AGI": 10, "INT": 10, "VIT": 10 }

# Derived stats are pure functions of base (+ modifiers). Recompute; never store as truth.
def derive(base, mods):
    s = sum_layers(base, mods)                  # base + flat + percent modifiers
    return {
        "max_hp":  20 + s["VIT"] * 8,
        "attack":  s["STR"] * 2,
        "defense": s["VIT"] * 1 + s["AGI"] * 0.5,
        "crit":    min(0.05 + s["AGI"] * 0.005, 0.50),   # cap it
        "speed":   s["AGI"],
    }
```

Modifier layers (apply in this order): **base → flat adds → percent multipliers → clamp**.
Equipping an item pushes a modifier; unequipping pops the same one. This avoids the classic
"buff wore off and left me at the wrong HP" bug.

## 2. Damage formulas

Two common families — pick one and stay consistent:

```python
# (a) Subtractive: defense flatly reduces damage. Simple; high defense can trivialize hits.
dmg = max(1, attacker.attack - defender.defense)        # floor at 1 so nothing is immune

# (b) Ratio/mitigation: defense gives diminishing % reduction. Scales smoothly to high numbers.
mitigation = defender.defense / (defender.defense + K)  # K ~ 100; tune the curve
dmg = attacker.attack * (1 - mitigation)

# Layer on: random variance (±10%), crit multiplier, and type effectiveness.
dmg *= rng.range(0.9, 1.1)
if is_crit: dmg *= 1.5
dmg *= type_multiplier(attacker.element, defender.element)   # 0.5 / 1.0 / 2.0
```

Subtractive feels "tactical" at low numbers; ratio scales better for big late-game values.

## 3. Leveling curves

XP-to-next-level shapes the whole pace. Three common curves:

```python
# Linear-ish (gentle):     next = base * level
# Quadratic (classic JRPG):next = base * level^2
# Exponential (steep):     next = base * growth^level     # growth ~1.2–1.5

def xp_to_next(level, base=100, kind="quadratic", growth=1.3):
    if kind == "linear":      return base * level
    if kind == "quadratic":   return base * level * level
    if kind == "exponential": return int(base * (growth ** level))
```

Guidance: keep early levels fast (reward in minutes) and stretch later ones. Grant stat gains
and/or skill points on level-up; telegraph the next unlock to pull players forward.

## 4. Turn-based vs. action combat timelines

| | Turn-based | Action |
|---|---|---|
| Time | Discrete; pause to choose | Real-time; reflexes matter |
| Initiative | Speed stat / ATB gauge orders turns | Cooldowns / attack timing |
| Strength | Deep tactics, accessible | Visceral, skill-expressive |
| Build with | A turn scheduler (see `roguelike` Pattern 2) | The engine movement/physics skill |

ATB ("active time battle") is a hybrid: a gauge fills by `speed`; when full, the actor may act.

## 5. Inventory and equipment data

```python
# Items are data, not code. Define them as resources/assets (see godot-resources /
# unity-scriptableobjects) and reference by id.
item = {
    "id": "iron_sword", "name": "Iron Sword", "slot": "weapon",
    "stackable": False, "max_stack": 1,
    "modifiers": [ {"stat": "STR", "type": "flat", "value": 3} ],
    "value": 50,
}
# Inventory = list of (item_id, count). Equipment = slot -> item_id.
# Equipping applies the item's modifiers (push); unequipping removes them (pop).
```

## 6. Quest state model

```python
# A quest is a small state machine with objectives. Persist its state in the save.
quest = {
    "id": "missing_cat", "state": "available",   # available -> active -> complete -> turned_in
    "objectives": [ {"id": "find_cat", "done": False, "count": 0, "needed": 1} ],
    "rewards": { "xp": 150, "gold": 30, "items": ["iron_sword"] },
}
# Game events (kill, pickup, talk) update matching objectives; when all done, state=complete.
# Dialogue conditions read quest state; turning in grants rewards and advances dependent quests.
```

Keep quest *definitions* as data and quest *progress* in the save. Gate dialogue lines and
NPC behavior on quest state via `dialogue-systems` conditions/variables.



---


<a id="save-systems"></a>
# SKILL: save-systems

---
name: save-systems
description: >
  Design save/load for game state — choosing what to serialize, file formats,
  save slots, atomic crash-safe writes, schema versioning and migration, and
  autosave. Engine-neutral. Use when the user mentions save system, save/load,
  game state persistence, save slots, autosave, save file corruption, or
  migrating old saves to a new version.
---

# Save systems

A save file is a **serialized snapshot of game state** that survives restarts.
The hard parts aren't writing bytes — they're choosing *what* to save, writing it
so a crash mid-save can't corrupt it, and reading *old* saves after you ship a
patch. Get those three right and the rest is plumbing.

## When to use

- Use to persist progress: player stats, inventory, world flags, settings,
  positions — across sessions and game updates.
- Use to design save slots, quicksave/autosave, and crash-safe writes.
- Use when old save files break after a content/code change (versioning &
  migration).

**When *not* to use:** for Roblox cloud persistence specifics, use
`roblox-datastores`. For the data model the save serializes (resources/SOs), use
`godot-resources` / `unity-scriptableobjects`. For Godot's `FileAccess`/
`ResourceSaver` and `user://` paths, defer to the Godot engine skill while
applying the patterns here.

## Core workflow

1. **Decide what state is authoritative.** Save the *data* (hp, position, seed,
   unlocked flags), not engine objects or scene nodes. You will reconstruct
   objects from data on load — never serialize live node references.
2. **Define a versioned schema.** Every save embeds a `version` integer. This is
   the single most important field for a game you intend to patch.
3. **Pick a format.** JSON/text for readability and debuggability; a binary
   format for size/speed or mild tamper-resistance. Start with JSON.
4. **Write atomically.** Serialize to a temp file, flush, then rename over the
   real file. A crash leaves either the old save or the new one — never a
   half-written one.
5. **Load defensively.** Read version → migrate up to current → validate →
   instantiate. Keep a backup of the last good save and fall back on parse error.
6. **Autosave on safe boundaries** (level change, checkpoint), throttled, and to a
   separate slot so it can't clobber a manual save.
7. **Verify**: save, fully quit, relaunch, load — and confirm by inspection that
   state matches. Test loading a save from the previous version.

## Patterns

### 1. Serialize state as plain data (not engine objects)

```gdscript
# Build a dictionary of pure data. Each savable object reports its own state.
func capture_state() -> Dictionary:
    return {
        "version": SAVE_VERSION,                 # ALWAYS stamp the schema version
        "player": { "hp": player.hp, "pos": [player.position.x, player.position.y] },
        "inventory": player.inventory.to_array(),  # ids + counts, not Item nodes
        "flags": world.flags,                    # e.g. {"met_guard": true}
        "seed": world.seed,                      # regenerate procedural content
    }

# On load, RECONSTRUCT objects from the data — do not expect live references back.
func apply_state(data: Dictionary) -> void:
    player.hp = data["player"]["hp"]
    player.position = Vector2(data["player"]["pos"][0], data["player"]["pos"][1])
    player.inventory.from_array(data["inventory"])
    world.flags = data["flags"]
```

### 2. Atomic, crash-safe write (temp + rename)

```gdscript
# RIGHT: write to a temp file, then atomically rename over the target.
func save_atomic(path: String, data: Dictionary) -> void:
    var tmp := path + ".tmp"
    var f := FileAccess.open(tmp, FileAccess.WRITE)
    f.store_string(JSON.stringify(data))
    f.flush()                                    # ensure bytes hit disk
    f.close()
    DirAccess.rename_absolute(tmp, path)         # replaces the target; atomic on POSIX
# WRONG: opening `path` directly and writing in place — a crash mid-write leaves a
# truncated, unloadable save and destroys the player's progress.
```

Rename-over-target is atomic on POSIX (same volume); on Windows a replace-by-rename
isn't guaranteed atomic, so keep the previous file as `path + ".bak"` before the
rename — that backup is what actually guarantees you can recover from a bad write.

### 3. Versioned load with migration

```python
SAVE_VERSION = 3

def load_save(raw_bytes):
    data = parse(raw_bytes)                  # JSON/binary -> dict
    v = data.get("version", 0)
    if v > SAVE_VERSION:
        raise NewerSaveError(v)              # save is from a newer build; refuse
    while v < SAVE_VERSION:                   # apply migrations in order, v -> v+1
        data = MIGRATIONS[v](data)
        v += 1
        data["version"] = v
    validate(data)                            # check required keys / ranges
    return data

# Each migration is a pure function from one version's shape to the next.
def migrate_1_to_2(d):
    d["flags"] = {k: True for k in d.pop("completed_quests", [])}  # list -> set-map
    return d
MIGRATIONS = {1: migrate_1_to_2, 2: migrate_2_to_3}
```

### 4. Save slots + throttled autosave

```gdscript
const SLOT_PATH := "user://save_%d.json"      # manual slots 0..N
const AUTOSAVE_PATH := "user://autosave.json"  # separate file: never clobbers a slot
var _autosave_cooldown := 0.0

func autosave_if_due(dt: float) -> void:
    _autosave_cooldown -= dt
    if _autosave_cooldown <= 0.0:
        save_atomic(AUTOSAVE_PATH, capture_state())
        _autosave_cooldown = 60.0             # throttle: at most once a minute
# Trigger an immediate autosave on checkpoints/level transitions, not mid-combat.
```

## Pitfalls

- **Serializing engine objects/node paths** ties saves to scene structure;
  renaming a node breaks every old save. Save data, rebuild objects on load.
- **No version field.** The day you ship a patch, every existing save is a
  guessing game. Stamp `version` from version 1.
- **In-place writes** corrupt saves on crash/power loss. Always temp-write then
  rename; keep a `.bak`.
- **Trusting the file blindly.** Saves get truncated, hand-edited, or
  cloud-synced stale. Validate on load and fall back to backup on failure.
- **Floats and locale.** Text serializers can drop precision or use comma
  decimal separators in some locales. Use a locale-invariant serializer.
- **Autosave clobbering manual saves**, or firing mid-action and saving an
  inconsistent state. Use a dedicated autosave slot and save on safe boundaries.
- **Storing secrets or trusting client saves in multiplayer.** A local save is
  player-controlled; never treat it as authoritative for online state. For cloud,
  handle the device's data limits and conflicts (`roblox-datastores`).

## References

- `references/versioning-and-migration.md` — schema evolution strategies, the
  migration chain, backups/rollback, format trade-offs (JSON vs binary), and a
  load-time validation checklist.

## Related skills

- `roblox-datastores` — cloud persistence, request limits, session locking.
- `godot-resources`, `unity-scriptableobjects` — the data model you serialize.
- `procedural-gen` — store the seed to regenerate worlds instead of saving them.
- `rpg`, `survival-crafting`, `visual-novel` — genres that compose this skill.



### [Reference: save-systems / versioning-and-migration.md]

# Save versioning, migration, and robustness

Saves outlive the code that wrote them. A player who saved in v1.0 expects to
load in v1.4 after an update. Plan for schema evolution from the first release.

## The version field is non-negotiable

Stamp every save with an integer `version` (or a structured `{major, minor}` if
you need it). On load:

1. Read `version`.
2. If it is **newer** than the running build → refuse with a clear message
   ("This save is from a newer version"). Do not guess at fields you don't know.
3. If it is **older** → run migrations in sequence until it matches the current
   version.
4. Validate, then instantiate.

Prefer a single monotonic integer. Semantic two-part versions are only worth it
if you genuinely branch save compatibility across release lines.

## The migration chain

Write each migration as a **pure function** `vN -> vN+1` and apply them in order.
This keeps any version reachable to current with small, testable steps — never a
giant "convert anything to latest" function.

```python
SAVE_VERSION = 4

MIGRATIONS = {
    1: migrate_1_to_2,   # added "flags" map
    2: migrate_2_to_3,   # split "name" into first/last
    3: migrate_3_to_4,   # inventory items gained a "durability" field
}

def upgrade(data):
    v = data.get("version", 1)
    while v < SAVE_VERSION:
        data = MIGRATIONS[v](data)
        v += 1
        data["version"] = v
    return data
```

Guidelines:

- **Additive changes are easy**: new field with a default. The migration just
  inserts the default for old saves.
- **Renames/restructures**: move/transform in the migration; never read both old
  and new names in game code.
- **Removed fields**: drop them in the migration so later steps see a clean shape.
- **Keep old migrations forever.** Deleting `migrate_1_to_2` strands every v1
  save. They are cheap to keep and must remain a faithful record.
- **Test the chain**: keep a corpus of real saves from each shipped version and
  assert they load after every change (this is your regression net).

## Backups and rollback

- Before overwriting, copy the current save to `*.bak`. On a failed load of the
  primary, try the backup automatically.
- For autosaves, rotate a small ring (autosave_0..2) so a bad autosave doesn't
  destroy the only recent state.
- Consider a checksum/hash of the payload to detect truncation or corruption
  (distinct from anti-tamper, which a determined local player can always defeat).

## Format trade-offs

| Format | Pros | Cons | Use when |
|---|---|---|---|
| JSON / text | Human-readable, debuggable, diff-able, easy migration | Larger, slower, trivially editable | Default; most games |
| Binary (engine) | Compact, fast, mildly opaque | Hard to debug/migrate, version-fragile | Large state, perf-critical |
| Key/value store | Simple, robust per-key | No structure, manual schema | Settings, small flag sets |
| Cloud KV (e.g. DataStore) | Cross-device | Quotas, latency, conflicts | Online/cross-device saves |

Whatever the on-disk format, keep an **in-memory dictionary/struct** as the
canonical shape and (de)serialize at the boundary. Migrations then operate on
that neutral shape, not on format-specific bytes.

## Load-time validation checklist

- Required keys present; types correct (string vs number vs bool).
- Numbers within sane ranges (no NaN/Infinity; hp ≥ 0; indices in bounds).
- Enum/id values still exist in current content (an item id removed in a patch
  must be handled — drop it or substitute, don't crash).
- References resolve (a quest id points to a known quest).
- On any failure: log, fall back to backup, and if all else fails, fail *loudly*
  to the player rather than silently loading a broken state.

## What to store vs recompute

- **Store** authoritative, non-derivable state: choices, unlocked flags, RNG
  seed, inventory, positions.
- **Recompute** derived data on load (full stat tables from base + modifiers,
  procedural maps from the seed). Saving derived data invites desync when the
  formula changes in a patch — and bloats the file.



---


<a id="shader-programming"></a>
# SKILL: shader-programming

---
name: shader-programming
description: >
  Write game shaders from cross-engine fundamentals — the vertex→fragment
  pipeline, coordinate spaces, UV math, and common 2D/3D effects (tint, UV
  scroll, dissolve, outline, fresnel rim, vignette) in GLSL with HLSL
  equivalents. Use when the user mentions shaders, fragment/pixel shader, vertex
  shader, UV, GLSL, HLSL, or effects like dissolve, outline, or rim light.
---

# Shader programming (cross-engine)

Shaders are small programs that run **per vertex** and **per pixel** on the GPU.
The concepts — the pipeline, coordinate spaces, UVs, and how common effects are
built — port across engines; only the language dialect and built-in variable
names change. This skill teaches those portable fundamentals in GLSL with HLSL
equivalents; use `godot-shaders` (or Unity/Unreal material docs) for the exact
engine syntax and built-ins.

## When to use

- Use to understand or write vertex/fragment shaders and to reason about UVs,
  coordinate spaces, and the GPU pipeline.
- Use to build common effects: tint/recolor, scrolling textures, dissolve,
  outlines, fresnel/rim light, vignette, color grading.
- Use to translate a shader concept between GLSL and HLSL, or between engines.

**When *not* to use:** for an engine's exact shader language and built-ins, use
`godot-shaders` (Godot shading language) or the engine's material docs. For full
particle VFX systems, see `unreal-niagara`. For post-process *stacks*, defer to
the engine's renderer settings.

## Core workflow

1. **Know which stage you're in.** The **vertex** shader transforms each vertex
   into clip space and passes data (UVs, normals) onward; the **fragment/pixel**
   shader runs per rasterized pixel and outputs a color. Most game effects live
   in the fragment stage.
2. **Track coordinate spaces.** Positions move model → world → view → clip space;
   normals belong in world or view space. Mixing spaces is the most common bug.
3. **Drive effects with UVs and time.** UVs are `0..1` texture coordinates;
   offset, scale, or distort them, and animate with a `time` uniform.
4. **Work per pixel, branch-light.** Prefer `mix`, `step`, `smoothstep`, and
   `clamp` over `if` where possible; GPUs run pixels in lockstep and dislike
   divergent branches.
5. **Pass data via uniforms** (constant per draw) and **varyings** (interpolated
   vertex→fragment). Keep texture samples few; they dominate cost.
6. **Verify visually and on target hardware.** Shaders that look right on desktop
   can break on mobile (precision, missing features). Test where it ships.

## Patterns

GLSL-style fragment snippets (close to Godot's `canvas_item`/`spatial`
shaders and OpenGL). See `references/effects.md` for the HLSL equivalents and
the full outline/fresnel/vignette shaders.

### 1. Fragment basics: sample, tint, and combine

```glsl
// Per-pixel: read the texture at this UV, multiply by a color (tint), keep alpha.
uniform sampler2D tex;
uniform vec4 tint;          // e.g. (1,0,0,1) reddens; multiply is non-destructive
in vec2 uv;                 // interpolated 0..1 texture coordinate (a "varying")
out vec4 frag;
void main() {
    vec4 c = texture(tex, uv);   // HLSL: tex.Sample(samp, uv)
    frag = c * tint;             // component-wise multiply tints without clipping
}
```

### 2. Scrolling UVs (animated texture) — frame-rate independent

```glsl
// Add time * speed to the UV to scroll. fract() wraps it into 0..1 so it tiles.
uniform sampler2D tex;
uniform float time;          // seconds, supplied by the engine
uniform vec2 scroll_speed;   // UV units per second, e.g. (0.1, 0.0)
in vec2 uv;
out vec4 frag;
void main() {
    vec2 scrolled = fract(uv + scroll_speed * time);  // HLSL: frac(...)
    frag = texture(tex, scrolled);
}
// Drive with a real time uniform, not a per-frame accumulator, so speed is stable.
```

### 3. Dissolve (threshold a noise map, glow the edge)

```glsl
// Hide pixels where noise < threshold; tint a thin band at the boundary.
uniform sampler2D tex;
uniform sampler2D noise_tex;     // grayscale noise, 0..1
uniform float amount;            // 0 = fully visible, 1 = fully dissolved
uniform float edge = 0.05;       // width of the glowing edge band
uniform vec4 edge_color;
in vec2 uv;
out vec4 frag;
void main() {
    vec4 c = texture(tex, uv);
    float n = texture(noise_tex, uv).r;
    if (n < amount) discard;                 // cut away dissolved pixels
    float e = smoothstep(amount, amount + edge, n);  // 0 at the edge -> 1 inside
    frag = mix(edge_color, c, e);            // HLSL: lerp(edge_color, c, e)
}
```

### 4. Fresnel rim light (3D) — brighten glancing angles

```glsl
// Rim = 1 where the surface faces away from the camera (silhouette glow).
in vec3 world_normal;        // normalized, world space (from the vertex stage)
in vec3 view_dir;            // normalized, surface -> camera, world space
uniform float power = 3.0;
uniform vec3 rim_color;
out vec4 frag;
void main() {
    float f = pow(1.0 - clamp(dot(world_normal, view_dir), 0.0, 1.0), power);
    frag = vec4(rim_color * f, 1.0);   // add to lighting; f peaks at the silhouette
}
// Correctness: normal and view_dir MUST be in the same space and normalized.
```

## Pitfalls

- **Mixing coordinate spaces** (lighting a world-space normal against a
  view-space light) yields subtly wrong shading. Pick one space and convert
  everything into it.
- **Forgetting to normalize** interpolated normals/directions: interpolation
  shortens vectors, so `dot()` results drift. `normalize()` in the fragment stage.
- **UV assumptions across engines.** Some engines flip V (top-left vs bottom-left
  origin); a texture may appear upside-down. Know your engine's convention.
- **Heavy branching / dynamic loops** stall GPUs. Prefer `step`/`smoothstep`/
  `mix`; reserve `if`/`discard` for genuinely cheap early-outs.
- **`discard` defeats early-Z** and can hurt performance on tiled mobile GPUs;
  prefer alpha blending where you can.
- **Precision on mobile**: `highp` vs `mediump` matters; large UVs or time values
  in low precision shimmer. Use adequate precision for coordinates and time.
- **Assuming GLSL == HLSL.** `mix`↔`lerp`, `fract`↔`frac`, `texture()`↔`.Sample()`,
  `vec2`↔`float2`, column- vs row-major matrices. See the reference mapping.

## References

- `references/effects.md` — full outline (2D sprite + 3D), vignette, and color
  grading shaders; the GLSL↔HLSL function/type mapping table; per-engine notes
  (Godot `canvas_item`/`spatial`, Unity ShaderLab/HLSL, Unreal material nodes).

## Related skills

- `godot-shaders` — Godot shading language syntax, built-ins, and screen-reading.
- `unreal-niagara` — GPU particle VFX (a different shader use).
- `procedural-gen` — the noise that drives dissolve and procedural texturing.



### [Reference: shader-programming / effects.md]

# Shader effects and GLSL↔HLSL mapping

Full versions of the effects sketched in `SKILL.md`, plus the dialect mapping you
need to port a shader between engines. Examples are GLSL-style; the mapping table
shows the HLSL form.

## GLSL ↔ HLSL quick reference

| GLSL | HLSL | Note |
|---|---|---|
| `vec2/3/4`, `mat3/4` | `float2/3/4`, `float3x3/4x4` | vectors and matrices |
| `mix(a, b, t)` | `lerp(a, b, t)` | linear interpolation |
| `fract(x)` | `frac(x)` | fractional part |
| `mod(a, b)` | `fmod(a, b)` | sign differs for negatives — verify |
| `texture(samp, uv)` | `tex.Sample(samp, uv)` | sampler is a separate object in HLSL |
| `inversesqrt(x)` | `rsqrt(x)` | |
| `mat * vec` (column-major) | `mul(vec, mat)` (row-major) | matrix order/convention differs |
| `gl_Position` / `out` color | `SV_Position` / `SV_Target` | stage outputs via semantics |
| `dFdx/dFdy` | `ddx/ddy` | screen-space derivatives |

Also watch: clip-space depth range (OpenGL `-1..1` vs D3D `0..1`) and UV/clip Y
orientation differ between APIs — engines usually normalize this for you, but it
surfaces when porting raw shaders.

## 2D sprite outline (sample the alpha neighborhood)

```glsl
// Draw an outline where a transparent pixel is adjacent to an opaque one.
uniform sampler2D tex;
uniform vec2 texel_size;     // (1/width, 1/height) of the texture
uniform vec4 outline_color;
in vec2 uv;
out vec4 frag;
void main() {
    vec4 c = texture(tex, uv);
    if (c.a > 0.5) { frag = c; return; }          // inside the sprite: unchanged
    // sample 4 neighbors; if any is opaque, this empty pixel is on the border
    float a = max(max(texture(tex, uv + vec2( texel_size.x, 0)).a,
                      texture(tex, uv + vec2(-texel_size.x, 0)).a),
                  max(texture(tex, uv + vec2(0,  texel_size.y)).a,
                      texture(tex, uv + vec2(0, -texel_size.y)).a));
    frag = (a > 0.5) ? outline_color : vec4(0.0);  // border pixel -> outline
}
```

For thicker or smoother outlines, sample 8 neighbors (include diagonals) or do a
small distance-field pass. In 3D, outlines are usually done differently: render
back-faces scaled outward along normals, or detect edges from depth/normal
discontinuities in a post-process.

## Vignette (darken the screen edges) — post-process

```glsl
// Darken pixels by distance from screen center. screen_uv is 0..1 across the view.
uniform sampler2D screen_tex;
uniform float strength = 0.6;   // 0 = none, 1 = strong
uniform float radius = 0.75;    // where darkening begins
in vec2 screen_uv;
out vec4 frag;
void main() {
    vec3 c = texture(screen_tex, screen_uv).rgb;
    float d = distance(screen_uv, vec2(0.5));      // 0 center .. ~0.707 corner
    float v = smoothstep(radius, radius * 0.5, d); // 1 in center, ->0 at edges
    frag = vec4(c * mix(1.0 - strength, 1.0, v), 1.0);
}
```

## Color grading via a curve (brightness/contrast/saturation)

```glsl
// Order matters: contrast around 0.5, then saturation, then brightness.
uniform sampler2D screen_tex;
uniform float brightness = 0.0;   // additive
uniform float contrast   = 1.0;   // multiplicative around mid-gray
uniform float saturation = 1.0;
in vec2 screen_uv;
out vec4 frag;
void main() {
    vec3 c = texture(screen_tex, screen_uv).rgb;
    c = (c - 0.5) * contrast + 0.5;                       // contrast
    float luma = dot(c, vec3(0.2126, 0.7152, 0.0722));    // Rec.709 luminance
    c = mix(vec3(luma), c, saturation);                   // saturation
    c += brightness;                                      // brightness
    frag = vec4(clamp(c, 0.0, 1.0), 1.0);
}
```

The luminance weights `(0.2126, 0.7152, 0.0722)` are the Rec.709 coefficients —
green dominates perceived brightness. For LUT-based grading, sample a color
lookup texture indexed by the pixel's RGB instead.

## Per-engine notes

- **Godot (4.x) — `gdshader`.** Godot's shading language is GLSL-like with a
  `shader_type` (`canvas_item` for 2D, `spatial` for 3D). It provides built-ins:
  `UV`, `COLOR`, `TIME`, `TEXTURE`, `SCREEN_TEXTURE`, `NORMAL`, `VIEW`. Write
  `fragment()` / `vertex()` functions. Map the GLSL examples here onto those
  built-ins. See `godot-shaders`.
- **Unity — ShaderLab + HLSL.** Shaders live in `.shader` files (ShaderLab
  blocks) or Shader Graph. Code is HLSL: `float4`, `lerp`, `tex2D`/`.Sample`,
  `SV_Target`. URP/HDRP supply include files for lighting and transforms.
- **Unreal — Material Editor (node graph) + HLSL.** Most authoring is visual
  nodes; Custom nodes embed HLSL. Concepts (UVs, fresnel via a Fresnel node,
  panner for UV scroll) map directly to the patterns here.

## Performance checklist

- Minimize texture samples; they are the dominant cost. Reuse a sample instead of
  re-reading.
- Prefer math (`smoothstep`, `mix`) to branches and `discard`.
- Compute heavy values per vertex (then interpolate) when per-pixel precision
  isn't required.
- Use appropriate precision on mobile (`mediump` for color, higher for UV/time).
- Avoid dependent texture reads (sampling using a value read from another texture)
  on low-end GPUs where possible.



---


<a id="threejs-gltf-loading"></a>
# SKILL: threejs-gltf-loading

---
name: threejs-gltf-loading
description: >
  Load glTF/GLB models in three.js with GLTFLoader and play their skinned
  animations with AnimationMixer, including DRACO/Meshopt-compressed meshes and
  KTX2 textures. Use when importing 3D models into three.js — when the user
  mentions glTF, GLB, GLTFLoader, AnimationMixer, animation clips, DRACOLoader, or
  "load a 3D model". For scene/camera/renderer setup use threejs-scene-setup; for
  materials and lights use threejs-materials-lighting.
---

# three.js glTF Loading

Load `.gltf`/`.glb` models and play their animations in three.js, including
compressed geometry (DRACO/Meshopt) and textures (KTX2). Patterns target
**r184**; preserve an existing project's pinned release unless migration is requested.

## When to use

- Use to import a 3D model, add it to the scene, inspect its node hierarchy, and
  play baked/skinned animation clips with an `AnimationMixer`.
- Use when files are `.gltf`/`.glb`, or code imports `GLTFLoader` /
  `DRACOLoader` / `KTX2Loader` from `three/addons/loaders/...`.

**When *not* to use:** creating the renderer/camera/loop → `threejs-scene-setup`.
Tuning surface look, lights, or shadows on the loaded model →
`threejs-materials-lighting`. Authoring/exporting the model itself (Blender) is out
of scope; prefer glTF over OBJ/FBX for runtime.

## Core workflow

1. **Why glTF.** It's a transmission format: binary vertex data, PBR materials, and
   animations are ready to render with minimal parsing. Prefer it over OBJ (no scene
   graph, no animation) and FBX (heavy) for the web.
2. **Load with `GLTFLoader`.** `loader.load(url, onLoad, onProgress, onError)`. The
   result `gltf` has `gltf.scene` (the `Object3D` root), `gltf.animations`
   (`AnimationClip[]`), `gltf.cameras`, and `gltf.asset`.
3. **Add `gltf.scene` to your scene** and frame it. Inspect the hierarchy with
   `traverse` / `getObjectByName` to find the parts you'll control.
4. **Play animations with an `AnimationMixer`.** One mixer per animated root;
   `mixer.clipAction(clip).play()`; advance with `mixer.update(delta)` every frame.
5. **Decode compressed assets.** Attach a `DRACOLoader` (and/or `KTX2Loader` +
   Meshopt) so DRACO meshes and KTX2 textures load; point the decoders at their
   files.
6. **Verify what loaded** — log the scene graph and `gltf.animations`, and confirm
   the model is visible (right scale, lit) and the clip actually plays.

## Patterns

### 1. Load a model and frame it

```js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
loader.load(
  'assets/robot.glb',
  (gltf) => {
    const root = gltf.scene;
    scene.add(root);
    // Inspect: gltf.animations is an array of AnimationClip.
    console.log('clips:', gltf.animations.map((c) => c.name));
  },
  (event) => console.log(`${(event.loaded / event.total) * 100}% loaded`),
  (error) => console.error('glTF load failed:', error)
);
```

### 2. Play a skinned animation with AnimationMixer

```js
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let mixer;                                  // declare outside so the loop can see it
const clock = new THREE.Clock();

new GLTFLoader().load('assets/character.glb', (gltf) => {
  scene.add(gltf.scene);
  mixer = new THREE.AnimationMixer(gltf.scene);          // one mixer per animated root
  const clip = THREE.AnimationClip.findByName(gltf.animations, 'Run')
            ?? gltf.animations[0];
  mixer.clipAction(clip).play();
});

renderer.setAnimationLoop(() => {
  const dt = clock.getDelta();
  if (mixer) mixer.update(dt);              // advance the animation by real seconds
  renderer.render(scene, camera);
});
```

### 3. Cross-fade between two clips

```js
const actions = {};
mixer = new THREE.AnimationMixer(gltf.scene);
for (const clip of gltf.animations) {
  actions[clip.name] = mixer.clipAction(clip);
}
actions['Idle'].play();

function transitionTo(name, duration = 0.3) {
  const next = actions[name];
  next.reset().play();
  for (const [n, action] of Object.entries(actions)) {
    if (n !== name) action.crossFadeTo(next, duration, false);
  }
}
```

### 4. DRACO-compressed geometry

```js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const draco = new DRACOLoader();
// Point at the decoder files you ship (or a pinned CDN copy of the same version).
draco.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.184.0/examples/jsm/libs/draco/');

const loader = new GLTFLoader();
loader.setDRACOLoader(draco);
loader.load('assets/city-draco.glb', (gltf) => scene.add(gltf.scene));
```

### 5. Find and animate a named part

```js
new GLTFLoader().load('assets/car.glb', (gltf) => {
  scene.add(gltf.scene);
  const wheels = [];
  gltf.scene.traverse((node) => {
    if (node.name.startsWith('Wheel')) wheels.push(node);
  });
  renderer.setAnimationLoop(() => {
    const dt = clock.getDelta();
    for (const w of wheels) w.rotation.x += dt * 4;
    renderer.render(scene, camera);
  });
});
```

## Pitfalls

- **Model loads but is invisible** → it has lit (PBR) materials and the scene has no
  light or environment. Add a light or `scene.environment` (see
  `threejs-materials-lighting`), and check scale — glTF is in metres, so a 0.01-scaled
  asset is tiny.
- **`load` is async** → `gltf` only exists inside the callback; declare `mixer`/refs
  outside and assign them in the callback, or use `await loader.loadAsync(url)`.
- **Animation never moves** → you didn't call `mixer.update(delta)` each frame, or you
  passed milliseconds instead of seconds (use `clock.getDelta()`), or you forgot
  `action.play()`.
- **DRACO/KTX2 model fails** → the decoder/transcoder path is wrong or version-
  mismatched. `setDecoderPath`/`setTranscoderPath` must point at files matching your
  three.js version.
- **Multiple mixers fighting** → use **one** `AnimationMixer` per animated root and
  create all actions from it; don't make a new mixer per clip.
- **Baked-in transforms surprise you** → exporters sometimes bake scale/rotation onto
  child nodes. Dump the hierarchy (names + position/rotation/scale) before relying on
  a node's local transform; re-export from the source if the rig is unusable.
- **Origins are off** → re-parent a part under a fresh `Object3D` to give it a clean
  pivot rather than fighting baked offsets.

## References

- For the full decode/transcode setup (DRACO + Meshopt + KTX2 together), `loadAsync`
  + a `LoadingManager` progress bar, reusing models with `SkeletonUtils.clone`, and
  exporter guidance (apply transforms, one clean root), read
  `references/loaders-and-animation.md`.

## Related skills

- `threejs-scene-setup` — the renderer, camera, and loop this model renders into.
- `threejs-materials-lighting` — lighting/environment so PBR models look right.
- `fps-shooter` — a 3D genre that composes three.js skills.



### [Reference: threejs-gltf-loading / loaders-and-animation.md]

# three.js glTF: loaders, compression & animation detail (r150+)

Depth behind the glTF skill: combining decoders, async loading with progress,
cloning skinned meshes, and exporter hygiene.

## Compression: DRACO, Meshopt, KTX2

A production glTF pipeline often compresses geometry (DRACO or Meshopt) and
textures (KTX2/Basis). Attach the matching loaders to `GLTFLoader`:

```js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

const VERSION = '0.184.0';
const base = `https://cdn.jsdelivr.net/npm/three@${VERSION}/examples/jsm/libs/`;

const draco = new DRACOLoader().setDecoderPath(`${base}draco/`);
const ktx2 = new KTX2Loader().setTranscoderPath(`${base}basis/`).detectSupport(renderer);

const loader = new GLTFLoader()
  .setDRACOLoader(draco)
  .setKTX2Loader(ktx2)
  .setMeshoptDecoder(MeshoptDecoder);

loader.load('assets/scene.glb', (gltf) => scene.add(gltf.scene));
```

Notes:

- The decoder/transcoder files must match your three.js version. Ship them with
  your app or pin a CDN copy to the same version; a mismatch throws at load time.
- `ktx2.detectSupport(renderer)` requires the renderer to exist first.
- Compression shrinks downloads but adds CPU/Worker decode time; measure both.

## Async loading with a progress bar

```js
import { LoadingManager } from 'three';

const manager = new LoadingManager();
manager.onProgress = (url, loaded, total) => {
  setBarWidth(`${(loaded / total) * 100}%`);
};
manager.onLoad = () => hideLoadingScreen();

const loader = new GLTFLoader(manager);

// Promise form — clean with async/await and Promise.all for many assets.
const [hero, level] = await Promise.all([
  loader.loadAsync('assets/hero.glb'),
  loader.loadAsync('assets/level.glb'),
]);
scene.add(hero.scene, level.scene);
```

A `LoadingManager` aggregates progress across every loader that shares it, so one
bar can cover models, textures, and audio.

## Reusing a model many times

Adding the same `gltf.scene` to the scene twice does not duplicate it — it moves
it. To place many instances of an animated character, clone with `SkeletonUtils`
so the skinned mesh and its skeleton are cloned correctly (a plain `.clone()` does
not duplicate the skeleton):

```js
import { clone as skeletonClone } from 'three/addons/utils/SkeletonUtils.js';

const base = (await loader.loadAsync('assets/enemy.glb')).scene;
for (let i = 0; i < 10; i++) {
  const instance = skeletonClone(base);
  instance.position.x = i * 2;
  scene.add(instance);
  const mixer = new THREE.AnimationMixer(instance);   // each clone needs its own mixer
  mixer.clipAction(baseClips[0]).play();
  mixers.push(mixer);                                  // update all in the loop
}
```

For static (non-skinned) meshes, prefer `InstancedMesh` for thousands of copies —
it draws them in one call.

## AnimationMixer detail

- One `AnimationMixer` per animated root object; create every `AnimationAction`
  from that mixer (`mixer.clipAction(clip)`).
- `action.play()` starts it; `action.stop()`/`action.reset()` rewind it.
- Looping: `action.setLoop(THREE.LoopRepeat)` (default) or `THREE.LoopOnce` with
  `action.clampWhenFinished = true` to hold the final pose.
- `action.timeScale` speeds/slows a clip; `action.weight` blends two playing
  clips (e.g. walk↔run by speed).
- Blend transitions with `from.crossFadeTo(to, duration, warp)` or
  `to.crossFadeFrom(from, duration, warp)`.
- Listen for completion: `mixer.addEventListener('finished', (e) => {...})`.

Always advance with real time: `mixer.update(clock.getDelta())` inside the loop.

## Exporter hygiene (Blender → glTF)

Most "model looks wrong" issues are authoring problems, not loader bugs:

- **Apply transforms** before export (Object → Apply → All Transforms) so nodes have
  identity position/rotation/scale; otherwise baked offsets fight runtime control.
- **One clean root.** Aim for a single root `Object3D` with no transform and
  meaningful child names, so you can re-parent parts to the scene cheaply.
- **Author in metres**, real-world scale. Avoid scaling parents.
- **Name your nodes and clips** — you'll look them up by name (`getObjectByName`,
  `AnimationClip.findByName`).
- Prefer `.glb` (single binary file) for the web; it bundles geometry, textures,
  and animation into one request.



---


<a id="threejs-materials-lighting"></a>
# SKILL: threejs-materials-lighting

---
name: threejs-materials-lighting
description: >
  Light and shade a three.js scene: choose materials (MeshStandardMaterial PBR vs
  unlit MeshBasicMaterial), add ambient/hemisphere/directional/point/spot lights,
  turn on shadow maps, and use an environment map (IBL) for realistic reflections.
  Use when a three.js model looks black, flat, or wrong — when the user mentions
  three.js materials, MeshStandardMaterial, lights, shadows, envMap, or PBR. For
  renderer/loop setup use threejs-scene-setup; for loading models use
  threejs-gltf-loading.
---

# three.js Materials & Lighting

Make three.js surfaces look right: pick the correct material, light the scene,
enable shadows, and add image-based lighting. Patterns target **r184**, verified
against **r184** (lighting is physically based by default since r155).

## When to use

- Use when a mesh renders black or flat, when choosing a material, adding lights,
  enabling shadows, or setting up environment-map reflections (IBL).
- Use when code constructs `MeshStandardMaterial`, `DirectionalLight`, etc., or sets
  `renderer.shadowMap.enabled` or `scene.environment`.

**When *not* to use:** the renderer/camera/loop → `threejs-scene-setup`. Loading
models (whose PBR materials this complements) → `threejs-gltf-loading`. Custom
GLSL/`ShaderMaterial` is its own topic; for the portable concept see
`shader-programming`.

## Core workflow

1. **Pick a material by need.** `MeshStandardMaterial` (PBR: `roughness`,
   `metalness`, reacts to lights/IBL) for realism; `MeshPhysicalMaterial` for
   clearcoat/transmission; `MeshBasicMaterial` (unlit, ignores lights) for UI/flat;
   `MeshNormalMaterial`/`MeshDepthMaterial` for debugging.
2. **Add light, or nothing shows.** Lit materials need a light source and/or
   `scene.environment`. Combine a soft fill (`AmbientLight`/`HemisphereLight`) with a
   key `DirectionalLight`.
3. **Mind light intensity.** Since r155, lighting is physically based; modern
   intensities are higher than old tutorials (a key `DirectionalLight` ≈ 1–3).
4. **Enable shadows in three places.** `renderer.shadowMap.enabled = true`, the
   light's `castShadow = true`, and each mesh's `castShadow`/`receiveShadow`. Then
   fit the light's shadow camera to the scene.
5. **Use an environment map for grounded reflections.** Assign an equirectangular or
   PMREM-processed texture to `scene.environment`; PBR materials pick it up
   automatically.
6. **Verify under real lighting** — confirm the surface responds to the key light
   (highlights move), shadows land where expected, and reflections look plausible.

## Patterns

### 1. PBR material under a 3-light rig

```js
import * as THREE from 'three';

const material = new THREE.MeshStandardMaterial({
  color: 0xcc4444,
  roughness: 0.5,     // 0 = mirror, 1 = fully matte
  metalness: 0.0,     // 0 = dielectric (plastic/wood), 1 = metal
});
const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), material);
scene.add(mesh);

// Soft sky/ground fill + a directional key light.
scene.add(new THREE.HemisphereLight(0xbbddff, 0x443322, 1.0)); // sky, ground, intensity
const key = new THREE.DirectionalLight(0xffffff, 2.5);
key.position.set(5, 10, 7);
scene.add(key);
```

### 2. Unlit material (no light needed)

```js
// MeshBasicMaterial ignores lights — for flat color, UI, or sprites/labels.
const flat = new THREE.MeshBasicMaterial({ color: 0x44aa88 });
// A textured color map should be tagged sRGB so colors aren't washed out:
const tex = new THREE.TextureLoader().load('assets/logo.png');
tex.colorSpace = THREE.SRGBColorSpace;
const logo = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
```

### 3. Shadows (the three required switches + camera fit)

```js
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;     // softer edges

const sun = new THREE.DirectionalLight(0xffffff, 3);
sun.position.set(8, 12, 6);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);                   // default 512; raise for crisp
// DirectionalLight uses an OrthographicCamera — fit it tightly to the scene:
const cam = sun.shadow.camera;
cam.near = 1; cam.far = 40;
cam.left = -15; cam.right = 15; cam.top = 15; cam.bottom = -15;
scene.add(sun);

mesh.castShadow = true;
ground.receiveShadow = true;                          // a plane to catch the shadow
```

### 4. PBR textures on a material

```js
const loader = new THREE.TextureLoader();
const colorMap = loader.load('assets/brick_color.jpg');
colorMap.colorSpace = THREE.SRGBColorSpace;           // color maps are sRGB
const normalMap = loader.load('assets/brick_normal.jpg'); // data maps stay linear
const roughMap  = loader.load('assets/brick_rough.jpg');

const brick = new THREE.MeshStandardMaterial({
  map: colorMap,
  normalMap,
  roughnessMap: roughMap,
  metalness: 0,
});
```

### 5. Image-based lighting from an HDR environment

```js
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

new RGBELoader().load('assets/studio.hdr', (hdr) => {
  hdr.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = hdr;     // lights + reflects all PBR materials
  scene.background = hdr;       // optional: show it as the backdrop
});
// Optional cinematic tone curve:
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
```

## Pitfalls

- **Mesh is pure black** → a lit material with no light and no `scene.environment`.
  Add a light or an environment map; to confirm geometry, temporarily swap to
  `MeshBasicMaterial`/`MeshNormalMaterial`.
- **Scene too dark even with lights** → old tutorial intensities. r155+ is physically
  based; raise intensities (key light ≈ 2–3) or add an environment map.
- **Shadows don't appear** → you missed one of the three switches
  (`renderer.shadowMap.enabled`, `light.castShadow`, mesh `castShadow`/
  `receiveShadow`).
- **Shadows are cut off or blocky** → the `DirectionalLight`'s orthographic
  `shadow.camera` frustum is too big/small or doesn't cover the scene; tighten
  `left/right/top/bottom/near/far` and raise `shadow.mapSize`. Visualise it with
  `new THREE.CameraHelper(light.shadow.camera)`.
- **Shadow acne / peter-panning** → adjust `light.shadow.bias` (small negative) and
  `light.shadow.normalBias`.
- **Colors look washed out / too bright** → color (albedo) textures need
  `texture.colorSpace = THREE.SRGBColorSpace`; normal/roughness/metalness maps must
  stay linear (leave them as `NoColorSpace`).
- **PointLight shadows tank performance** → a point light renders the scene 6 times
  (cube map). Prefer one shadow-casting `DirectionalLight`; use cheaper fakes
  elsewhere.

## References

- For the material cheat-sheet (which `Mesh*Material` for which look), light types
  and their parameters/units, transparency vs `alphaTest` ordering, and the
  `PMREMGenerator`/`RoomEnvironment` route to IBL without an HDR file, read
  `references/materials-lights-table.md`.

## Related skills

- `threejs-scene-setup` — renderer, camera, and loop (set `shadowMap`, tone mapping).
- `threejs-gltf-loading` — models arrive with PBR materials this skill tunes.
- `shader-programming` — custom shader effects (engine-agnostic concept).



### [Reference: threejs-materials-lighting / materials-lights-table.md]

# three.js materials, lights & IBL reference (r155+)

Lookup tables and detail behind the materials & lighting skill.

## Material cheat-sheet

| Material | Lit? | Use for | Key params |
|----------|:----:|---------|-----------|
| `MeshBasicMaterial` | no | UI, flat color, billboards, debug | `color`, `map`, `wireframe` |
| `MeshStandardMaterial` | yes (PBR) | most realistic surfaces | `roughness`, `metalness`, `map`, `normalMap`, `roughnessMap`, `metalnessMap`, `aoMap`, `emissive` |
| `MeshPhysicalMaterial` | yes (PBR+) | car paint, glass, coatings | adds `clearcoat`, `transmission`, `ior`, `sheen` |
| `MeshPhongMaterial` | yes (legacy) | cheap shiny look, older tutorials | `shininess`, `specular` |
| `MeshLambertMaterial` | yes (legacy) | cheap matte | `color`, `map` |
| `MeshNormalMaterial` | no | debug orientation (no light needed) | — |
| `MeshDepthMaterial` | no | debug depth / custom depth | — |
| `MeshToonMaterial` | yes | cel-shaded look | `gradientMap` |

Default to `MeshStandardMaterial`. It responds to lights **and** `scene.environment`,
matches glTF's PBR model, and is the safe choice for imported assets.

### Common PBR intuition

- `metalness`: 0 for non-metals (plastic, wood, skin), 1 for bare metal. Avoid
  in-between values except for transitions (rust, wear).
- `roughness`: 0 = sharp mirror reflection, 1 = fully diffuse. Most real surfaces
  sit 0.3–0.8.
- Metals get their color from the albedo (`color`/`map`); dielectrics reflect the
  environment near-white.

## Light types

| Light | Direction/shape | Casts shadows | Notes |
|-------|-----------------|:-------------:|-------|
| `AmbientLight(color, intensity)` | uniform, everywhere | no | flat fill; no form |
| `HemisphereLight(sky, ground, intensity)` | sky-to-ground gradient | no | great cheap outdoor fill |
| `DirectionalLight(color, intensity)` | parallel rays (sun) | yes (orthographic) | the usual key/shadow light |
| `PointLight(color, intensity, distance, decay)` | omni from a point | yes (6× cost) | bulbs, torches |
| `SpotLight(color, intensity, distance, angle, penumbra, decay)` | cone | yes (perspective) | flashlights, stage |
| `RectAreaLight(color, intensity, w, h)` | soft rectangle | no | softboxes, screens (needs init helper) |

Since r155 lighting is physically based and the old `physicallyCorrectLights`
toggle was removed. Practical starting intensities: key `DirectionalLight` 2–3,
`HemisphereLight`/`AmbientLight` fill ≈ 0.5–1.5. `PointLight`/`SpotLight` use
inverse-square `decay` (default 2), so they fall off fast — increase intensity or
reduce `decay` if a lamp seems too dim.

### Shadow camera by light type

- `DirectionalLight` → `OrthographicCamera`; you set `left/right/top/bottom/near/far`.
  Fit it tightly; oversized frustums waste shadow-map resolution.
- `SpotLight` → `PerspectiveCamera`; `fov` follows the spot `angle`, aspect is
  automatic.
- `PointLight` → 6 renders (cube faces); only `near`/`far` matter, and it's the
  most expensive shadow.

Tuning knobs: `light.shadow.mapSize` (default 512×512; raise to 1024/2048 for
crisper edges at memory cost), `light.shadow.bias` (small negative to fix acne),
`light.shadow.normalBias`, and `renderer.shadowMap.type` (`BasicShadowMap`,
`PCFShadowMap`, `PCFSoftShadowMap`, `VSMShadowMap`). Visualise the frustum with
`new THREE.CameraHelper(light.shadow.camera)`.

## Transparency & sorting

- Set `material.transparent = true` and `material.opacity` for blended transparency;
  three.js sorts transparent objects back-to-front, which can still mis-order
  intersecting geometry.
- For binary cutouts (foliage, chain-link), prefer `material.alphaTest = 0.5` with
  `transparent = false` — it writes depth and avoids sort artifacts.
- `material.side` = `FrontSide` (default), `BackSide` (interiors/skyboxes), or
  `DoubleSide` (planes, leaves).
- `depthWrite = false` on overlapping additive/transparent effects (particles) so
  they don't occlude each other.

## IBL without an HDR file: PMREM + RoomEnvironment

When you don't have an `.hdr`, generate a neutral studio environment procedurally:

```js
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
// dispose pmrem when done if you only need it once: pmrem.dispose();
```

`PMREMGenerator` pre-filters any environment (HDR, RoomEnvironment, or a rendered
scene) into the mip-mapped format PBR materials sample for reflections at varying
roughness. Assigning the result to `scene.environment` lights every
`MeshStandardMaterial`/`MeshPhysicalMaterial` without adding explicit lights.

Pair IBL with tone mapping for a filmic result:
`renderer.toneMapping = THREE.ACESFilmicToneMapping` and adjust
`renderer.toneMappingExposure`.



---


<a id="threejs-scene-setup"></a>
# SKILL: threejs-scene-setup

---
name: threejs-scene-setup
description: >
  Stand up a three.js scene: import maps and the three/addons path, the
  Scene/PerspectiveCamera/WebGLRenderer trio, the setAnimationLoop render loop,
  responsive resize, and OrbitControls. Use when starting or debugging a three.js
  app — when the user mentions three.js, THREE.Scene, WebGLRenderer,
  PerspectiveCamera, the render loop, resizing, or OrbitControls. For models use
  threejs-gltf-loading; for materials/lights use threejs-materials-lighting.
---

# three.js Scene Setup

Create the foundation of a three.js app: module loading, the
scene/camera/renderer trio, the render loop, responsive resizing, and camera
controls. Patterns target **r184**. Read the installed `three` version before
changing an existing project because examples and addons move across releases.

## When to use

- Use when bootstrapping a three.js scene, fixing a blank/black canvas, making the
  canvas responsive, setting up the animation loop, or adding `OrbitControls`.
- Use when `package.json` depends on `three` and code does `import * as THREE from
  'three'`.

**When *not* to use:** loading `.gltf`/`.glb` models or skinned animation →
`threejs-gltf-loading`. Materials, lights, shadows, environment maps →
`threejs-materials-lighting`. 2D rendering → `pixijs-rendering`.

## Core workflow

1. **Load three.js as an ES module with an import map.** Since r147 the bare
   specifier `'three'` and `'three/addons/'` must be mapped (in HTML or by a
   bundler). Addons (controls, loaders) live under `three/addons/...`.
2. **Create the trio.** A `Scene` (root of the graph), a `PerspectiveCamera(fov,
   aspect, near, far)` moved back from the origin, and a `WebGLRenderer` whose
   `domElement` is in the DOM. Set size and `pixelRatio`.
3. **Add a mesh.** `new Mesh(geometry, material)` and `scene.add(mesh)`. With a
   lit material you also need a light (see `threejs-materials-lighting`).
4. **Drive a render loop with `renderer.setAnimationLoop(fn)`.** It's the modern,
   WebXR-/WebGPU-safe replacement for hand-rolled `requestAnimationFrame`. Use a
   `Clock` for delta time.
5. **Handle resize** so the camera aspect and renderer match the canvas; update
   `camera.aspect`, call `updateProjectionMatrix()`, and `renderer.setSize(...)`.
6. **Add `OrbitControls`** for orbit/pan/zoom while developing. Confirm something
   actually renders (a lit cube, the controls responding) before assuming success.

## Patterns

### 1. HTML import map + module entry (no bundler)

```html
<canvas id="c"></canvas>
<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@0.184.0/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.184.0/examples/jsm/"
  }
}
</script>
<script type="module" src="./main.js"></script>
```

With a bundler (Vite/webpack), skip the import map and just
`npm i three`; the same `import` statements resolve.

### 2. Scene + camera + renderer

```js
// main.js
import * as THREE from 'three';

const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // cap for perf
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x101018);

const camera = new THREE.PerspectiveCamera(
  60,                                   // vertical field of view (degrees)
  window.innerWidth / window.innerHeight, // aspect
  0.1,                                  // near
  100                                   // far
);
camera.position.set(3, 2, 5);
camera.lookAt(0, 0, 0);

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshNormalMaterial()        // unlit; shows orientation without a light
);
scene.add(cube);
```

### 3. The render loop (setAnimationLoop + Clock)

```js
const clock = new THREE.Clock();

renderer.setAnimationLoop(() => {
  const dt = clock.getDelta();          // seconds since last frame
  cube.rotation.x += dt;                // frame-rate independent
  cube.rotation.y += dt * 0.7;
  renderer.render(scene, camera);
});
// renderer.setAnimationLoop(null); // stop the loop
```

### 4. Responsive resize

```js
function onResize() {
  const w = window.innerWidth, h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();      // required after changing aspect
  renderer.setSize(w, h);
}
window.addEventListener('resize', onResize);
```

### 5. OrbitControls (orbit / pan / zoom)

```js
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;          // inertial feel
controls.target.set(0, 0, 0);

renderer.setAnimationLoop(() => {
  controls.update();                    // needed every frame when damping is on
  renderer.render(scene, camera);
});
```

## Pitfalls

- **`Failed to resolve module specifier "three"`** → missing import map (or bundler
  config). Map both `"three"` and `"three/addons/"`; addon paths must end with `/`.
- **Black canvas, no errors** → camera is at the origin (inside/behind the object),
  or you used a lit material (`MeshStandardMaterial`) with no light. Move the camera
  back; use `MeshNormalMaterial`/`MeshBasicMaterial` to verify geometry first.
- **Nothing animates** → you never called `renderer.render` inside the loop, or you
  call `setAnimationLoop` but render outside it.
- **Stretched / squashed view on resize** → you resized the renderer but didn't
  update `camera.aspect` + `updateProjectionMatrix()`.
- **Blurry or jagged on HiDPI** → set `renderer.setPixelRatio(...)`; cap it (≈2) so
  4K/retina screens don't tank performance.
- **OrbitControls feel dead** → with `enableDamping = true` you must call
  `controls.update()` every frame.
- **Old tutorials use `<script src="three.min.js">`** → since r147 three.js ships
  ES modules only; use `type="module"` + import maps.

## References

- For coordinate conventions, the scene-graph (`Group`, parent/child transforms,
  `Object3D` add/remove), `OrthographicCamera` for 2.5D, and disposing of
  geometries/materials/textures to avoid leaks, read `references/scene-graph.md`.

## Related skills

- `threejs-materials-lighting` — give surfaces a lit look (lights, shadows, PBR).
- `threejs-gltf-loading` — load 3D models and play their animations.
- `pixijs-rendering` — 2D rendering in the browser.
- `fps-shooter` — a 3D genre template that composes three.js skills.



### [Reference: threejs-scene-setup / scene-graph.md]

# three.js scene graph, cameras & cleanup (r150+)

Depth behind the scene-setup skill: coordinate conventions, the `Object3D`
hierarchy, the orthographic camera, and resource disposal.

## Coordinates & conventions

- Right-handed coordinate system: **+X right, +Y up, +Z toward the viewer**. A fresh
  `PerspectiveCamera` looks down **-Z**.
- Rotations are in **radians** (except `PerspectiveCamera`'s `fov`, which is degrees).
  Use `THREE.MathUtils.degToRad(deg)` when you think in degrees.
- Units are arbitrary but be consistent. glTF models are authored in metres; pick a
  scale and stick to it across the project.

## The Object3D hierarchy

Every visual thing (`Mesh`, `Group`, `Camera`, `Light`) extends `Object3D` and has
`position`, `rotation`, `quaternion`, and `scale`. Children inherit their parent's
transform.

```js
import * as THREE from 'three';

const turret = new THREE.Group();         // empty transform node
turret.add(barrelMesh);                   // child, positioned relative to turret
scene.add(turret);
turret.rotation.y = Math.PI / 4;          // rotates the whole group

barrelMesh.removeFromParent();            // detach (r129+)
scene.add(barrelMesh);                    // re-parent to the scene root
```

Useful traversal/lookup helpers:

```js
scene.getObjectByName('Player');          // first descendant with that .name
root.traverse((obj) => { /* visit every descendant */ });
obj.getWorldPosition(new THREE.Vector3()); // world-space position
```

Avoid scaling parents of physics/gameplay objects: non-unit parent scale compounds
through children and makes world-space math (raycasts, distances) error-prone.

## PerspectiveCamera vs OrthographicCamera

- **PerspectiveCamera(fov, aspect, near, far)** — objects shrink with distance.
  Default for 3D. Keep `near`/`far` as tight as the scene allows; a huge far/near
  ratio wrecks depth precision (z-fighting).
- **OrthographicCamera(left, right, top, bottom, near, far)** — no perspective;
  ideal for 2.5D, isometric, or CAD-like views. Size the frustum to the aspect:

```js
const aspect = window.innerWidth / window.innerHeight;
const d = 5;
const cam = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 0.1, 100);
// On resize, recompute left/right from the new aspect, then updateProjectionMatrix().
```

After changing any projection property (`aspect`, `fov`, frustum extents, `zoom`)
call `camera.updateProjectionMatrix()`.

## Disposing of resources (avoiding leaks)

three.js cannot garbage-collect GPU memory for you. Removing an object from the
scene frees nothing on the GPU; you must dispose geometries, materials, and
textures explicitly.

```js
function disposeObject(obj) {
  obj.traverse((node) => {
    if (node.geometry) node.geometry.dispose();
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    for (const mat of materials) {
      if (!mat) continue;
      for (const key of Object.keys(mat)) {
        const value = mat[key];
        if (value && value.isTexture) value.dispose(); // map, normalMap, etc.
      }
      mat.dispose();
    }
  });
  obj.removeFromParent();
}
```

Also dispose render targets (`renderTarget.dispose()`) and, on full teardown, the
renderer (`renderer.dispose()`). When swapping levels, dispose the old level's
subtree before loading the next, or memory grows every transition.

## Stopping and restarting the loop

`renderer.setAnimationLoop(fn)` starts the loop; `setAnimationLoop(null)` stops it
(e.g. when the tab is hidden via the Page Visibility API, or a menu is open). This
is also the loop required by WebXR — `requestAnimationFrame` does not drive XR
frames.

## Render-on-demand

For static scenes or editors, you don't need a continuous loop. Render only when
something changes (input, controls' `change` event, a tween step):

```js
let needsRender = true;
controls.addEventListener('change', () => { needsRender = true; });
renderer.setAnimationLoop(() => {
  if (!needsRender) return;
  needsRender = false;
  renderer.render(scene, camera);
});
```

This cuts GPU/battery use dramatically for non-animated content.



---

