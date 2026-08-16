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
