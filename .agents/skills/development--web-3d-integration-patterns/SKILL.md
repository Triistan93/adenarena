---
name: web-3d-integration-patterns
description: Web 3D Integration Patterns — WebGL, WebGPU, Three.js, React Three Fiber, GLTF/GLB asset loading, post-processing pipelines, shadow DOM canvas integration, and 60fps rendering optimization. Use when integrating interactive 3D elements, avatars, stage backgrounds, and procedural 3D effects into web apps.
domain: development
author: oyi77
license: Apache-2.0
subdomain: web-graphics
tags:
- webgl
- webgpu
- threejs
- 3d-graphics
- shaders
- performance
version: 1.0.0
---

# Web 3D Integration Patterns

## Overview
Web 3D Integration Patterns standardizes the architecture for embedding performant, interactive 3D canvases, particle systems, and 3D character/world viewports directly into modern web frameworks (React, Vue, Vanilla JS, Shadow DOM).

## Key Architecture Patterns

1. **Canvas Lifecycle & Memory Management**:
   - Proper allocation and disposal of Geometries, Materials, and Textures (`geometry.dispose()`, `material.dispose()`, `renderer.dispose()`).
   - Handling window resize events via `ResizeObserver` with DPR capping (`Math.min(window.devicePixelRatio, 2)`) to avoid GPU thermal throttling on high-res displays.

2. **Shadow DOM & DOM Integration**:
   - Mounting Three.js `renderer.domElement` cleanly within Shadow DOM containers (`shadowRoot.querySelector('#canvas-3d')`).
   - Maintaining pointer event pass-through and transparent backdrop blending (`alpha: true`, `preserveDrawingBuffer: false`).

3. **GLTF/GLB Asset Streaming & Cache**:
   - Asynchronous loading with `GLTFLoader` and `DRACOLoader` for mesh compression.
   - InstancedMesh for rendering hundreds of repeated 3D objects (monsters, particles, props) in a single draw call.

4. **Lighting & Visual Atmosphere**:
   - Directional lights with soft shadow mapping (`PCFSoftShadowMap`).
   - Ambient hemisphere lighting, bloom post-processing (`UnrealBloomPass`), and environment map reflections (`PMREMGenerator`).

5. **Frame Loop Optimization (60+ FPS)**:
   - Delta-time based animation updates (`clock.getDelta()`).
   - Pausing render loops when canvas is off-screen using `IntersectionObserver`.

## When to Use
- Building 3D stage viewports, battle scenes, monster models, or 3D weapon showcases.
- Adding interactive 3D cards, parallax depth layers, and custom WebGL shaders to web applications.
