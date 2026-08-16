---
name: scroll-world
description: Scroll World — Interactive scroll-driven 3D worlds, scroll-bound camera choreography, narrative storytelling timelines, parallax spatial progression, section pinning, and immersive scrollytelling experiences. Use when building scroll-driven 3D journeys, interactive lore timelines, map transitions, and narrative world explorations.
domain: content
author: oyi77
license: Apache-2.0
subdomain: interactive-storytelling
tags:
- scrollytelling
- 3d-world
- camera-path
- parallax
- narrative
- threejs
version: 1.0.0
---

# Scroll World

## Overview
Scroll World is a specialized framework for connecting user scroll gestures to dynamic 3D camera paths, stage transitions, narrative quest timelines, and world exploration. It bridges high-precision scroll inputs (via Lenis or GSAP ScrollTrigger) with WebGL/Three.js camera coordinates, lighting changes, and environmental evolutions.

## Architecture & Core Mechanics

1. **Scroll-Driven Camera Splines (`THREE.CatmullRomCurve3`)**:
   - Defining 3D spline trajectories that guide the camera through cities, dungeons, and landscapes based on scroll progress `0.0 -> 1.0`.
   - Smooth interpolation (`curve.getPointAt(progress)`) ensuring buttery-smooth camera movements.

2. **Section Pinning & Narrative Landmarks**:
   - Pinning interactive UI HUDs (e.g. Boss descriptions, Raid milestones, Noblesse quest steps) while the 3D world rotates into focus.
   - Triggering stage events (weather change, dragon appearance, volcanic eruption) as the user passes specific scroll thresholds.

3. **Smooth Scroll Normalization**:
   - Decoupling erratic mousewheel ticks with momentum smoothing (using virtual scroll physics or lerped scroll positions).
   - High-fidelity mobile touch compatibility with touch-action gestures.

4. **Multi-Layered Spatial Parallax**:
   - Foreground UI elements, mid-ground character models, and deep-background skyboxes moving at proportional depth speeds to create profound immersion.

5. **Performance & Off-Screen Culling**:
   - Freezing expensive 3D animation calculations when the scroll section is out of the viewport.
   - Dynamic Level of Detail (LOD) adjustments based on camera distance during scroll traversals.

## When to Use
- Building interactive world maps (Talking Island -> Gludio -> Dion -> Giran -> Goddard -> Aden).
- Crafting lore presentations, saga intros, class progression timelines, and hero memorial chronicles.
