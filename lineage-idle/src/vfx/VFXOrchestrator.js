/**
 * VFXOrchestrator.js — Master 2D Combat Presentation Engine for Aden Arena Idle.
 * 
 * Ties together:
 * - CombatEventBus -> Event-driven listener
 * - TimelineSystem -> Multi-phase choreography
 * - VFXComponentLibrary -> Visual particle & mesh components
 * - CameraFX -> Decaying trauma shake, hit stop, zoom punch
 * - LightingFX -> Fake/dynamic radial lights & ambient dimming
 * - ShaderSystem -> Radial shockwaves, bloom, chromatic aberration
 * - ObjectPool -> Zero-allocation memory management
 */

import { combatEvents, CombatEventType } from './CombatEvent.js';
import { globalVFXPool } from './ObjectPool.js';
import { globalCameraFX } from './CameraFX.js';
import { globalLightingFX } from './LightingFX.js';
import { globalShaderSystem } from './ShaderSystem.js';
import { globalTimelineManager } from './TimelineSystem.js';
import { VFXComponentLibrary } from './VFXComponentLibrary.js';
import { ALL_LOADED_SKILLS } from '../data/skills/index.js';
import { SoundFX } from './SoundFX.js';

export class VFXOrchestrator {
  constructor(options = {}) {
    this.enabled = options.enabled !== false;
    this.pool = globalVFXPool;
    this.camera = globalCameraFX;
    this.lighting = globalLightingFX;
    this.shaders = globalShaderSystem;
    this.timelines = globalTimelineManager;
    this.sound = SoundFX;

    this._unsubscribeEvents = [];
    this._skillDefRegistry = new Map(ALL_LOADED_SKILLS);

    this.stageElement = null;
    this.canvas = null;
    this.ctx = null;
    this._animFrameId = null;
    this._resizeObserver = null;
    this._running = false;
    this._lastFrameTime = 0;

    // Profiler & Telemetry
    this.profilerEnabled = options.profilerEnabled !== false;
    this._fps = 60.0;
    this._frameTimeMs = 16.6;
    this._frameCount = 0;
    this._fpsAccumulator = 0;
    this._profilerElement = null;

    // Ultimate Banner
    this._bannerElement = null;
    this._bannerTimeout = null;

    // VFX Quality / LOD
    this.quality = (options.quality || 'HIGH').toUpperCase();
    this.qualityMultiplier = this.quality === 'LOW' ? 0.5 : (this.quality === 'MEDIUM' ? 0.75 : 1.0);
    this._hasWillChange = false;
    this._f3KeyHandler = null;

    // Telegraphs & Warning Zones
    this._activeTelegraphs = [];

    this._bindCombatEvents();
  }

  /**
   * Returns whether a skill has an active multi-phase timeline in this orchestrator
   * @param {string} skillId 
   * @returns {boolean}
   */
  hasSkill(skillId) {
    return this._skillDefRegistry.has(skillId);
  }

  /**
   * Sets LOD / VFX Quality level dynamically
   * @param {'LOW'|'MEDIUM'|'HIGH'|'ULTRA'} level 
   */
  setQuality(level) {
    const q = String(level || 'HIGH').toUpperCase();
    this.quality = q;
    if (q === 'LOW') this.qualityMultiplier = 0.50;
    else if (q === 'MEDIUM') this.qualityMultiplier = 0.75;
    else this.qualityMultiplier = 1.0;
  }

  /**
   * Registers a skill definition for timeline execution
   * @param {string} skillId 
   * @param {Object} skillDef 
   */
  registerSkillDefinition(skillId, skillDef) {
    if (skillId && skillDef) {
      this._skillDefRegistry.set(skillId, skillDef);
    }
  }

  /**
   * Bulk registers skill definitions
   */
  registerSkills(skillMap) {
    if (skillMap && typeof skillMap === 'object') {
      for (const [id, def] of Object.entries(skillMap)) {
        this.registerSkillDefinition(id, def);
      }
    }
  }

  /**
   * Mounts the VFX overlay canvas and camera controller directly to the combat stage.
   * @param {HTMLElement} stageElement - The #stage element from the Shadow DOM.
   */
  mount(stageElement) {
    if (!stageElement) return;
    if (this.stageElement === stageElement && this._running) return;

    if (this.stageElement && this.stageElement !== stageElement) {
      this.unmount();
    }

    this.stageElement = stageElement;

    // Check if canvas already exists or create an overlay canvas
    let canvas = stageElement.querySelector('.vfx-stage-canvas');
    if (!canvas) {
      const doc = stageElement.ownerDocument || (typeof document !== 'undefined' ? document : null);
      if (doc && doc.createElement) {
        canvas = doc.createElement('canvas');
        canvas.className = 'vfx-stage-canvas';
        stageElement.appendChild(canvas);
      }
    }
    this.canvas = canvas;
    this.ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;

    this._resizeCanvas();

    if (typeof ResizeObserver !== 'undefined' && stageElement) {
      this._resizeObserver = new ResizeObserver(() => {
        this._resizeCanvas();
      });
      this._resizeObserver.observe(stageElement);
    }

    if (this.profilerEnabled) {
      this._createProfilerDOM();
    }

    if (typeof window !== 'undefined') {
      window.toggleVFXProfiler = (enable) => this.toggleProfiler(enable);
      if (!this._f3KeyHandler) {
        this._f3KeyHandler = (e) => {
          if (e && e.key === 'F3') {
            e.preventDefault();
            this.toggleProfiler();
          }
        };
        window.addEventListener('keydown', this._f3KeyHandler);
      }
    }

    // Start 60 FPS animation and physics loop
    this._running = true;
    this._lastFrameTime = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();

    const tick = (now) => {
      if (!this._running) return;
      const curNow = (typeof now === 'number') ? now : ((typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now());
      const dtMs = Math.min(Math.max(1, curNow - (this._lastFrameTime || curNow)), 100);
      this._lastFrameTime = curNow;

      this.update(dtMs);

      // Telemetry: update FPS with moving window
      this._frameCount++;
      this._fpsAccumulator += dtMs;
      if (this._fpsAccumulator >= 350) {
        this._fps = (this._frameCount * 1000) / this._fpsAccumulator;
        this._frameTimeMs = this._fpsAccumulator / this._frameCount;
        this._frameCount = 0;
        this._fpsAccumulator = 0;
        this._updateProfilerDOM();
      }

      // Apply camera shake, zoom, and rotation transform directly to #stage
      if (this.stageElement && this.stageElement.style) {
        const { offsetX, offsetY, zoom, rotation } = this.camera;
        if (zoom !== 1 || Math.abs(offsetX) > 0.01 || Math.abs(offsetY) > 0.01 || Math.abs(rotation) > 0.0005) {
          this.stageElement.style.transform = `translate3d(${offsetX.toFixed(2)}px, ${offsetY.toFixed(2)}px, 0) scale(${zoom.toFixed(4)}) rotate(${rotation.toFixed(4)}rad)`;
          if (!this._hasWillChange) {
            this.stageElement.style.willChange = 'transform';
            this._hasWillChange = true;
          }
        } else if (this.stageElement.style.transform) {
          this.stageElement.style.transform = '';
          if (this._hasWillChange) {
            this.stageElement.style.willChange = '';
            this._hasWillChange = false;
          }
        }

        // Ambient dimming class for stage
        if (this.lighting && this.lighting._ambientAlpha > 0.1) {
          if (this.stageElement.classList && !this.stageElement.classList.contains('stage-dimmed')) {
            this.stageElement.classList.add('stage-dimmed');
          }
        } else if (this.stageElement.classList && this.stageElement.classList.contains('stage-dimmed')) {
          this.stageElement.classList.remove('stage-dimmed');
        }
      }

      // Render Canvas overlay
      if (this.ctx && this.canvas) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.render(this.ctx, this.canvas.width, this.canvas.height);
      }

      if (typeof requestAnimationFrame !== 'undefined') {
        this._animFrameId = requestAnimationFrame(tick);
      }
    };

    if (typeof requestAnimationFrame !== 'undefined') {
      this._animFrameId = requestAnimationFrame(tick);
    }
  }

  /**
   * Resizes the canvas to match stage client dimensions.
   */
  _resizeCanvas() {
    if (!this.canvas || !this.stageElement) return;
    const rect = this.stageElement.getBoundingClientRect ? this.stageElement.getBoundingClientRect() : null;
    const width = rect && rect.width > 0 ? Math.floor(rect.width) : (this.stageElement.clientWidth || 800);
    const height = rect && rect.height > 0 ? Math.floor(rect.height) : (this.stageElement.clientHeight || 450);

    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
  }

  /**
   * Unmounts and tears down RAF loop, banners, and observers.
   */
  unmount() {
    this._running = false;
    if (this._animFrameId && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(this._animFrameId);
      this._animFrameId = null;
    }
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
    if (typeof window !== 'undefined' && this._f3KeyHandler) {
      window.removeEventListener('keydown', this._f3KeyHandler);
      this._f3KeyHandler = null;
    }
    if (this._bannerTimeout) {
      clearTimeout(this._bannerTimeout);
      this._bannerTimeout = null;
    }
    if (this._bannerElement && this._bannerElement.parentNode && typeof this._bannerElement.parentNode.removeChild === 'function') {
      this._bannerElement.parentNode.removeChild(this._bannerElement);
    }
    this._bannerElement = null;

    if (this._profilerElement && this._profilerElement.parentNode && typeof this._profilerElement.parentNode.removeChild === 'function') {
      this._profilerElement.parentNode.removeChild(this._profilerElement);
    }
    this._profilerElement = null;

    if (this.stageElement && this.stageElement.style) {
      this.stageElement.style.transform = '';
      if (this.stageElement.classList) {
        this.stageElement.classList.remove('stage-dimmed');
      }
    }
    if (this.canvas && this.canvas.parentNode && typeof this.canvas.parentNode.removeChild === 'function') {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    this.canvas = null;
    this.ctx = null;
    this.stageElement = null;
  }

  /**
   * Displays an animated cinematic announcement banner across the stage for Ultimates
   * @param {Object} def - The skill definition
   */
  showUltimateBanner(def) {
    if (!this.stageElement) return;
    const isMaster = def.identity?.tier === 'master_ultimate' || def.tier === 5;
    const tierBadgeText = isMaster ? '★★★★★ MASTER ULTIMATE' : '★★★★ ULTIMATE';
    const skillName = def.identity?.name || def.name || 'ULTIMATE';
    const doc = this.stageElement.ownerDocument || (typeof document !== 'undefined' ? document : null);
    if (!doc) return;

    if (!this._bannerElement || !this._bannerElement.parentNode) {
      let banner = this.stageElement.querySelector('.vfx-ultimate-banner');
      if (!banner && doc.createElement) {
        banner = doc.createElement('div');
        banner.className = 'vfx-ultimate-banner';
        this.stageElement.appendChild(banner);
      }
      this._bannerElement = banner;
    }

    if (!this._bannerElement) return;

    this._bannerElement.innerHTML = `
      <div class="vfx-ultimate-content ${isMaster ? 'master' : ''}">
        <div class="vfx-ultimate-badge">${tierBadgeText}</div>
        <div class="vfx-ultimate-title">${skillName}</div>
        <div class="vfx-ultimate-flare"></div>
      </div>
    `;

    this._bannerElement.classList.remove('active');
    if (typeof this._bannerElement.offsetWidth !== 'undefined') {
      void this._bannerElement.offsetWidth;
    }
    this._bannerElement.classList.add('active');

    if (this._bannerTimeout) {
      clearTimeout(this._bannerTimeout);
    }
    this._bannerTimeout = setTimeout(() => {
      if (this._bannerElement) {
        this._bannerElement.classList.remove('active');
      }
    }, 1500);
  }

  /**
   * Spawns an animated circular telegraph warning zone on the ground
   */
  spawnTelegraphCircle(options = {}) {
    const telegraph = {
      id: 'tg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      type: 'circle',
      x: options.x ?? 380,
      y: options.y ?? 310,
      radius: options.radius || 110,
      duration: options.duration || 4000,
      life: 0,
      color: options.color || '#ef4444',
      label: options.label || 'GOLPE FATAL',
      onComplete: options.onComplete || null
    };
    this._activeTelegraphs.push(telegraph);
    return telegraph;
  }

  /**
   * Spawns an animated conical telegraph warning zone
   */
  spawnTelegraphCone(options = {}) {
    const telegraph = {
      id: 'tg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      type: 'cone',
      sourceX: options.sourceX ?? 380,
      sourceY: options.sourceY ?? 300,
      targetX: options.targetX ?? 120,
      targetY: options.targetY ?? 300,
      angle: options.angle || Math.PI / 4, // 45 deg spread
      range: options.range || 260,
      duration: options.duration || 3500,
      life: 0,
      color: options.color || '#f59e0b',
      label: options.label || 'SOPRO DEVASTADOR',
      onComplete: options.onComplete || null
    };
    this._activeTelegraphs.push(telegraph);
    return telegraph;
  }

  /**
   * Clears all active telegraph zones (e.g. on Stagger Break or monster defeat)
   */
  clearTelegraphs() {
    this._activeTelegraphs = [];
  }

  /**
   * Clears all active VFX, particles, projectiles, telegraphs, and resets active visual state.
   * Invoked on monster defeat, zone transition, or stage reset to prevent visual residue artifacts.
   */
  clear() {
    this.pool.releaseAll();
    this._activeTelegraphs = [];
    if (this.timelines && typeof this.timelines.cancelAll === 'function') {
      this.timelines.cancelAll();
    }
    if (this.camera && typeof this.camera.reset === 'function') {
      this.camera.reset();
    }
    if (this.lighting && typeof this.lighting.reset === 'function') {
      this.lighting.reset();
    }
    if (this.shaders && typeof this.shaders.reset === 'function') {
      this.shaders.reset();
    }
    if (this.stageElement && this.stageElement.style) {
      this.stageElement.style.transform = '';
      if (this._hasWillChange) {
        this.stageElement.style.willChange = '';
        this._hasWillChange = false;
      }
    }
    if (this.stageElement && this.stageElement.classList) {
      this.stageElement.classList.remove('stage-dimmed');
    }
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  /**
   * Triggers a cinematic entrance presentation for Epic & World Bosses
   * @param {Object} boss 
   */
  triggerBossIntro(boss) {
    if (!boss) return;
    const bossName = boss.name || 'CHEFE ÉPICO';
    const bossTitle = boss.title || 'Lorde Ancestral';

    // 1. Camera punch zoom & trauma
    this.camera.punchZoom(1.16, 900);
    this.camera.addTrauma(0.55);

    // 2. Dramatic ambient dimming + radial spotlight
    this.lighting.dimAmbient('rgba(0, 0, 0, 0.85)', 1400, 600);
    this.lighting.addCastGlow(380, 290, '#f59e0b', 200, 1.4);

    // 3. Chromatic aberration flash
    this.shaders.triggerChromaticAberration(8, 400);

    // 4. Procedural boss roar
    this.sound.playBossRoar();

    // 5. Cinematic announcement banner
    if (this.stageElement) {
      const doc = this.stageElement.ownerDocument || (typeof document !== 'undefined' ? document : null);
      if (doc && doc.createElement) {
        if (!this._bannerElement || !this._bannerElement.parentNode) {
          let banner = this.stageElement.querySelector('.vfx-ultimate-banner');
          if (!banner) {
            banner = doc.createElement('div');
            banner.className = 'vfx-ultimate-banner';
            this.stageElement.appendChild(banner);
          }
          this._bannerElement = banner;
        }

        if (this._bannerElement) {
          this._bannerElement.innerHTML = `
            <div class="vfx-ultimate-content boss-intro">
              <div class="vfx-ultimate-badge">🐉 ENCONTRO DE CHEFE MUNDIAL</div>
              <div class="vfx-ultimate-title">${bossName}</div>
              <div class="vfx-boss-subtitle" style="font-size:12px; color:#fde68a; letter-spacing:0.12em; text-transform:uppercase; margin-top:2px;">${bossTitle}</div>
              <div class="vfx-ultimate-flare"></div>
            </div>
          `;
          this._bannerElement.classList.remove('active');
          if (typeof this._bannerElement.offsetWidth !== 'undefined') {
            void this._bannerElement.offsetWidth;
          }
          this._bannerElement.classList.add('active');

          if (this._bannerTimeout) clearTimeout(this._bannerTimeout);
          this._bannerTimeout = setTimeout(() => {
            if (this._bannerElement) {
              this._bannerElement.classList.remove('active');
            }
          }, 2400);
        }
      }
    }
  }

  /**
   * Triggers the boss Enrage state (<30% HP)
   * @param {{x: number, y: number}} [pos]
   */
  triggerBossEnrage(pos) {
    const targetPos = pos || { x: 380, y: 300 };

    // 1. Camera reaction
    this.camera.addTrauma(0.5);
    this.camera.flash('#ef4444', 350, 0.45);
    this.camera.hitStop(80);

    // 2. Chromatic & radial shockwave
    this.shaders.triggerChromaticAberration(10, 350);
    this.shaders.triggerShockwave(targetPos.x, targetPos.y, {
      maxRadius: 220,
      width: 10,
      color: '#ef4444',
      duration: 500
    });

    // 3. Audio roar
    this.sound.playBossRoar();

    // 4. Enrage floating banner on stage
    this.pool.floatingText.acquire({
      text: '🔥 ENRAGE! (ATK +30%, VEL +25%)',
      x: targetPos.x,
      y: targetPos.y - 70,
      color: '#ef4444',
      style: 'crit'
    });

    // 5. CSS class for pulsating crimson flame aura
    const mEl = this.stageElement?.querySelector?.('#stage-monster') || this.stageElement?.querySelector?.('#monster');
    if (mEl && mEl.classList) {
      mEl.classList.add('is-enraged');
    }
  }

  /**
   * Returns live performance and telemetry metrics
   */
  getPerformanceMetrics() {
    return {
      fps: Math.round(this._fps * 10) / 10,
      frameTimeMs: Math.round(this._frameTimeMs * 10) / 10,
      activeParticles: this.pool.particles._active.size,
      activeProjectiles: this.pool.projectiles._active.size,
      activeShockwaves: this.pool.shockwaves._active.size,
      activeFloatingText: this.pool.floatingText._active.size,
      activeLights: this.lighting.activeLights.length,
      trauma: Math.round(this.camera.trauma * 100) / 100,
      isFrozen: this.camera.isFrozen,
      zoom: Math.round(this.camera.zoom * 1000) / 1000,
      running: this._running,
      profilerEnabled: this.profilerEnabled
    };
  }

  /**
   * Toggles the on-screen profiler badge
   */
  toggleProfiler(enable) {
    this.profilerEnabled = enable !== undefined ? enable : !this.profilerEnabled;
    if (this.profilerEnabled) {
      this._createProfilerDOM();
    } else if (this._profilerElement && this._profilerElement.parentNode && typeof this._profilerElement.parentNode.removeChild === 'function') {
      this._profilerElement.parentNode.removeChild(this._profilerElement);
      this._profilerElement = null;
    }
  }

  _createProfilerDOM() {
    if (!this.stageElement) return;
    const doc = this.stageElement.ownerDocument || (typeof document !== 'undefined' ? document : null);
    if (!doc || !doc.createElement) return;

    if (!this._profilerElement || !this._profilerElement.parentNode) {
      let badge = this.stageElement.querySelector('.vfx-profiler-badge');
      if (!badge) {
        badge = doc.createElement('div');
        badge.className = 'vfx-profiler-badge';
        badge.title = 'VFX 60FPS Profiler (Clique para alternar)';
        badge.onclick = () => this.toggleProfiler(false);
        this.stageElement.appendChild(badge);
      }
      this._profilerElement = badge;
    }
    this._updateProfilerDOM();
  }

  _updateProfilerDOM() {
    if (!this._profilerElement || !this.profilerEnabled) return;
    const fps = this._fps.toFixed(1);
    const ms = this._frameTimeMs.toFixed(1);
    const pCount = this.pool.particles._active.size;
    const fpsClass = this._fps >= 55 ? 'fps-good' : (this._fps >= 30 ? 'fps-warn' : 'fps-bad');

    this._profilerElement.innerHTML = `
      <span class="vfx-p-val ${fpsClass}">${fps} FPS</span>
      <span class="vfx-p-sep">•</span>
      <span class="vfx-p-val">${ms}ms</span>
      <span class="vfx-p-sep">•</span>
      <span class="vfx-p-val">P: ${pCount}</span>
      <span class="vfx-p-sep">•</span>
      <span class="vfx-p-val">T: ${this.camera.trauma.toFixed(2)}</span>
    `;
  }

  /**
   * Wire up event bus listeners
   */
  _bindCombatEvents() {
    // 1. Skill Cast
    this._unsubscribeEvents.push(
      combatEvents.on(CombatEventType.SKILL_CAST, (ev) => {
        this.handleSkillCast(ev);
      })
    );

    // 2. Skill Hit
    this._unsubscribeEvents.push(
      combatEvents.on(CombatEventType.SKILL_HIT, (ev) => {
        this.handleSkillHit(ev);
      })
    );

    // 3. Skill Crit
    this._unsubscribeEvents.push(
      combatEvents.on(CombatEventType.SKILL_CRIT, (ev) => {
        this.handleSkillCrit(ev);
      })
    );

    // 4. Skill Damage
    this._unsubscribeEvents.push(
      combatEvents.on(CombatEventType.SKILL_DAMAGE, (ev) => {
        this.handleSkillDamage(ev);
      })
    );

    // 5. Skill Stagger Break
    this._unsubscribeEvents.push(
      combatEvents.on(CombatEventType.SKILL_STAGGER, (ev) => {
        this.handleSkillStagger(ev);
      })
    );

    // 6. Camera Shake
    this._unsubscribeEvents.push(
      combatEvents.on(CombatEventType.CAMERA_SHAKE, (ev) => {
        this.camera.addTrauma(ev.intensity || 0.3);
      })
    );

    // 7. Time Dilation
    this._unsubscribeEvents.push(
      combatEvents.on(CombatEventType.TIME_DILATION, (ev) => {
        this.camera.hitStop(ev.duration || 80, ev.timeScale || 0.0);
      })
    );
  }

  handleSkillCast(ev) {
    const def = this._skillDefRegistry.get(ev.skillId) || ev.def;
    if (!def) return;

    const sourcePos = ev.sourcePos || ev.position || { x: 120, y: 300 };
    const targetPos = ev.targetPos || { x: 380, y: 300 };

    const isUltimate = def.identity?.tier === 'ultimate' || def.identity?.tier === 'master_ultimate' || (def.tier && def.tier >= 4);
    const isMaster = def.identity?.tier === 'master_ultimate';

    // Ambient dimming & Cinematic Banner for Ultimates and Master Ultimates
    if (isUltimate) {
      this.showUltimateBanner(def);
      this.lighting.dimAmbient('rgba(0, 0, 0, 0.65)', 500, 400);
      this.camera.punchZoom(1.08, 300);
      if (isMaster) {
        this.shaders.triggerBloom(1.5, 400);
      }
      SoundFX.playUltimateFanfare(isMaster);
    } else {
      const element = def.identity?.element || def.element || 'Physical';
      const castTime = def.gameplay?.castTime || 220;
      SoundFX.playWindup(element, castTime);
    }

    // Cast glow
    if (def.lighting?.castGlow) {
      this.lighting.addCastGlow(
        sourcePos.x,
        sourcePos.y,
        def.lighting.castGlow.color || '#60a5fa',
        def.lighting.castGlow.radius || 120,
        def.lighting.castGlow.intensity || 0.8
      );
    }

    // Run Timeline
    if (def.timeline) {
      this.timelines.start(ev.skillId, def.timeline, {
        sourcePos,
        targetPos,
        def,
        onAction: (act) => this._executeTimelineAction(act, sourcePos, targetPos, def)
      }).onAction((act) => {
        this._executeTimelineAction(act, sourcePos, targetPos, def);
      });
    } else {
      // Graceful fallback for basic or legacy skills without multi-phase timelines
      this.camera.addTrauma(0.18);
      VFXComponentLibrary.spawnSlashArc(targetPos.x, targetPos.y, { color: '#ffd700' });
      VFXComponentLibrary.spawnImpactBurst(targetPos.x, targetPos.y, { color: '#ffd700', particleCount: 16 });
      SoundFX.playElementalImpact(def.identity?.element || def.element || 'Physical', false);
    }
  }

  handleSkillHit(ev) {
    const targetPos = ev.targetPos || { x: 380, y: 300 };

    // Standard hit impact
    VFXComponentLibrary.spawnImpactBurst(targetPos.x, targetPos.y, {
      color: ev.isCrit ? '#ff9500' : '#ffd700',
      particleCount: ev.isCrit ? 24 : 14
    });

    // Audio feedback
    SoundFX.playElementalImpact(ev.element || 'Physical', ev.isCrit);

    // Camera feedback
    if (ev.isCrit) {
      this.camera.addTrauma(0.35);
      this.camera.hitStop(60);
    } else {
      this.camera.addTrauma(0.12);
    }
  }

  handleSkillCrit(ev) {
    const targetPos = ev.targetPos || { x: 380, y: 300 };
    const tier = ev.critTier || 'normal';

    VFXComponentLibrary.spawnCriticalHitFeedback(targetPos.x, targetPos.y, { critTier: tier });
    SoundFX.playCritical();
    
    if (tier === 'colossal') {
      this.camera.addTrauma(0.75);
      this.camera.hitStop(120);
      this.shaders.triggerChromaticAberration(10, 250);
      this.camera.flash('#ffdd66', 150, 0.4);
    } else if (tier === 'heavy') {
      this.camera.addTrauma(0.45);
      this.camera.hitStop(80);
      this.shaders.triggerChromaticAberration(6, 180);
    } else {
      this.camera.addTrauma(0.25);
      this.camera.hitStop(50);
    }
  }

  handleSkillDamage(ev) {
    const targetPos = ev.targetPos || { x: 380, y: 300 };
    
    // Comprehensive elemental color mapping for floating combat text
    let numColor = '#ffffff';
    if (ev.isCrit) {
      numColor = '#ff4d4d';
    } else if (ev.element) {
      const elemLower = String(ev.element).toLowerCase();
      if (elemLower.includes('fire') || elemLower.includes('magma')) numColor = '#ff7a00';
      else if (elemLower.includes('water') || elemLower.includes('ice')) numColor = '#38bdf8';
      else if (elemLower.includes('wind')) numColor = '#34d399';
      else if (elemLower.includes('earth')) numColor = '#d97706';
      else if (elemLower.includes('dark')) numColor = '#a855f7';
      else if (elemLower.includes('holy')) numColor = '#fbbf24';
      else if (elemLower.includes('physical')) numColor = '#f8fafc';
    }

    this.pool.floatingText.acquire({
      text: ev.isMiss ? 'MISS' : `${ev.damage}`,
      x: targetPos.x + (Math.random() - 0.5) * 40,
      y: targetPos.y - 30,
      color: numColor,
      style: ev.isCrit ? 'crit' : 'normal'
    });
  }

  handleSkillStagger(ev) {
    const targetPos = ev.targetPos || { x: 380, y: 300 };
    if (ev.isBreak) {
      VFXComponentLibrary.spawnStaggerBreakEffect(targetPos.x, targetPos.y);
      SoundFX.playStaggerBreak();
      this.camera.addTrauma(0.6);
      this.camera.hitStop(100);
      this.shaders.triggerShockwave(targetPos.x, targetPos.y, { maxRadius: 200, speed: 700 });
      this.shaders.triggerChromaticAberration(8, 200);

      // Flash & pulse posture bar
      const sBar = this.stageElement?.querySelector?.('.stage-stagger-bar') || this.stageElement?.querySelector?.('#monster-stagger-bar');
      if (sBar) {
        sBar.classList.add('is-broken');
        setTimeout(() => {
          if (sBar) sBar.classList.remove('is-broken');
        }, 3000);
      }
    }
  }

  _executeTimelineAction(action, sourcePos, targetPos, def) {
    const params = action.params || {};

    switch (action.type) {
      case 'vfx':
        if (params.type === 'slash_arc') {
          VFXComponentLibrary.spawnSlashArc(targetPos.x, targetPos.y, params);
        } else if (params.type === 'impact_burst') {
          VFXComponentLibrary.spawnImpactBurst(targetPos.x, targetPos.y, params);
        } else if (params.type === 'ground_pillar') {
          VFXComponentLibrary.spawnGroundPillar(targetPos.x, targetPos.y, params);
        } else if (params.type === 'ground_rune') {
          VFXComponentLibrary.spawnGroundRune(sourcePos.x, sourcePos.y, params);
        } else if (params.type === 'projectile') {
          VFXComponentLibrary.spawnProjectile(sourcePos.x, sourcePos.y, targetPos.x, targetPos.y, params);
        } else if (params.type === 'titanbreaker') {
          VFXComponentLibrary.spawnTitanbreakerVFX(targetPos.x, targetPos.y, params);
        } else if (params.type === 'meteor_rain' || params.type === 'meteor') {
          VFXComponentLibrary.spawnMeteorRain(targetPos.x, targetPos.y, params);
        } else if (params.type === 'arrow_rain') {
          VFXComponentLibrary.spawnArrowRain(sourcePos.x, sourcePos.y, targetPos.x, targetPos.y, params.count);
        } else if (params.type === 'holy_sword_rain') {
          VFXComponentLibrary.spawnHolySwordRain(targetPos.x, targetPos.y, params.count);
        } else if (params.type === 'ice_shard_rain') {
          VFXComponentLibrary.spawnIceShardRain(targetPos.x, targetPos.y, params.count);
        } else if (params.type === 'dark_spear_rain') {
          VFXComponentLibrary.spawnDarkSpearRain(targetPos.x, targetPos.y, params.count);
        } else if (params.type === 'energy_beam' || params.type === 'beam') {
          VFXComponentLibrary.spawnEnergyBeam(sourcePos.x, sourcePos.y, targetPos.x, targetPos.y, params.beamType || 'holy', params);
        } else if (params.type === 'tornado_vortex' || params.type === 'tornado') {
          VFXComponentLibrary.spawnTornadoVortex(targetPos.x, targetPos.y, params);
        } else if (params.type === 'ground_fissure' || params.type === 'fissure') {
          VFXComponentLibrary.spawnGroundFissure(targetPos.x, targetPos.y, params);
        } else if (params.type === 'holy_mandala' || params.type === 'mandala') {
          VFXComponentLibrary.spawnHolyMandala(targetPos.x, targetPos.y, params);
        } else if (params.type === 'dark_shadow_rift' || params.type === 'rift') {
          VFXComponentLibrary.spawnDarkShadowRift(targetPos.x, targetPos.y, params);
        } else if (params.type === 'blade_slash') {
          VFXComponentLibrary.spawnBladeSlash(targetPos.x, targetPos.y, params);
        } else if (params.type === 'orbital_blades') {
          VFXComponentLibrary.spawnOrbitalBlades(sourcePos.x, sourcePos.y, params.count, params);
        } else if (params.type === 'prismatic_genesis') {
          VFXComponentLibrary.spawnPrismaticGenesisVFX(targetPos.x, targetPos.y);
        } else if (params.type === 'critical_impact') {
          VFXComponentLibrary.spawnCriticalHitFeedback(targetPos.x, targetPos.y, params);
        } else if (params.type === 'stagger_break') {
          VFXComponentLibrary.spawnStaggerBreakEffect(targetPos.x, targetPos.y);
        }
        break;

      case 'camera_fx':
        if (params.shake) this.camera.addTrauma(params.shake);
        if (params.hitStop) this.camera.hitStop(params.hitStop);
        if (params.zoom) this.camera.punchZoom(params.zoom, params.duration || 200);
        if (params.flash) this.camera.flash(params.flash.color || '#ffffff', params.flash.duration || 120, params.flash.opacity || 0.3);
        if (params.impactFrame) this.camera.triggerImpactFrame(params.impactFrame.durationMs || 35, params.impactFrame.flashColor || '#ffffff');
        break;

      case 'lighting':
        if (params.type === 'impact_flash') {
          this.lighting.addImpactFlash(targetPos.x, targetPos.y, params.color, params.radius, params.intensity, params.duration);
        } else if (params.type === 'ambient_dim') {
          this.lighting.dimAmbient(params.color, params.duration, params.restoreDuration);
        }
        break;

      case 'shader':
        if (params.type === 'shockwave') {
          this.shaders.triggerShockwave(targetPos.x, targetPos.y, params);
        } else if (params.type === 'bloom') {
          this.shaders.triggerBloom(params.intensity, params.duration);
        } else if (params.type === 'chromatic') {
          this.shaders.triggerChromaticAberration(params.offset, params.duration);
        }
        break;

      case 'sfx':
        if (params.type === 'windup') {
          SoundFX.playWindup(params.element || def.identity?.element || def.element || 'Physical', params.duration);
        } else if (params.type === 'impact') {
          SoundFX.playElementalImpact(params.element || def.identity?.element || def.element || 'Physical', params.isCrit);
        } else if (params.type === 'ultimate') {
          SoundFX.playUltimateFanfare(params.isMaster);
        } else if (params.type === 'stagger_break') {
          SoundFX.playStaggerBreak();
        } else if (params.type === 'crit') {
          SoundFX.playCritical();
        } else if (params.type === 'hit') {
          SoundFX.playHit();
        } else if (params.type === 'boss_roar') {
          SoundFX.playBossRoar();
        } else if (params.type === 'meteor_rain') {
          SoundFX.playMeteorRain();
        } else if (params.type === 'arrow_rain') {
          SoundFX.playArrowRain();
        } else if (params.type === 'holy_sword_rain') {
          SoundFX.playHolySwordRain();
        } else if (params.type === 'beam') {
          SoundFX.playBeam(params.beamType || 'holy');
        } else if (params.type === 'tornado') {
          SoundFX.playTornado();
        } else if (params.type === 'fissure') {
          SoundFX.playFissure();
        } else if (params.type === 'ice_shard') {
          SoundFX.playIceShard();
        }
        break;
    }
  }

  /**
   * Main per-frame update loop
   * @param {number} dtMs 
   */
  update(dtMs) {
    if (!this.enabled) return;

    // Advance camera, lighting, shaders, and timelines
    this.camera.update(dtMs);
    this.lighting.update(dtMs);
    this.shaders.update(dtMs);
    this.timelines.update(dtMs);

    const dt = dtMs / 1000.0;

    // Advance active particles in pool
    for (const p of this.pool.particles._active) {
      p.life += dtMs;
      if (!Number.isFinite(p.life) || !Number.isFinite(p.maxLife) || p.maxLife <= 0 || p.life >= p.maxLife || !Number.isFinite(p.x) || !Number.isFinite(p.y)) {
        this.pool.particles.release(p);
        continue;
      }
      p.vx += (p.ax || 0) * dt;
      p.vy += (p.ay || 0) * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rotation += (p.vRot || 0) * dt;
      p.alpha = Math.max(0, 1 - (p.life / p.maxLife));
      if (p.alpha <= 0) {
        this.pool.particles.release(p);
      }
    }

    // Advance active projectiles
    for (const proj of this.pool.projectiles._active) {
      proj.life = (proj.life || 0) + dtMs;
      const maxLife = proj.maxLife || 3000;
      if (!Number.isFinite(proj.x) || !Number.isFinite(proj.y) || !Number.isFinite(proj.targetX) || !Number.isFinite(proj.targetY) || proj.life >= maxLife) {
        this.pool.projectiles.release(proj);
        continue;
      }
      const dx = proj.targetX - proj.x;
      const dy = proj.targetY - proj.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const step = (proj.speed || 800) * dt;

      if (!Number.isFinite(dist) || dist <= step || dist < 8) {
        proj.x = proj.targetX;
        proj.y = proj.targetY;
        if (typeof proj.onHit === 'function') {
          try { proj.onHit(proj); } catch (_) {}
        }
        this.pool.projectiles.release(proj);
      } else {
        proj.x += (dx / dist) * step;
        proj.y += (dy / dist) * step;
      }
    }

    // Advance shockwaves
    for (const sw of this.pool.shockwaves._active) {
      sw.life += dtMs;
      if (!Number.isFinite(sw.life) || !sw.duration || sw.life >= sw.duration || !Number.isFinite(sw.x) || !Number.isFinite(sw.y)) {
        this.pool.shockwaves.release(sw);
        continue;
      }
      const prog = Math.min(1, sw.life / sw.duration);
      sw.radius = sw.maxRadius * prog;
      sw.alpha = Math.max(0, 1 - prog);
    }

    // Advance floating text
    for (const ft of this.pool.floatingText._active) {
      ft.life += dtMs;
      if (!Number.isFinite(ft.life) || !ft.maxLife || ft.life >= ft.maxLife || !Number.isFinite(ft.x) || !Number.isFinite(ft.y)) {
        this.pool.floatingText.release(ft);
        continue;
      }
      ft.y += (ft.vy || -40) * dt;
      ft.alpha = Math.max(0, 1 - (ft.life / ft.maxLife));
    }

    // Advance falling projectiles (Meteors, Arrows, Swords, Shards)
    for (const fp of this.pool.fallingProjectiles._active) {
      fp.life = (fp.life || 0) + dtMs;
      const maxLife = fp.maxLife || 4000;
      if (!Number.isFinite(fp.x) || !Number.isFinite(fp.y) || !Number.isFinite(fp.targetX) || !Number.isFinite(fp.targetY) || fp.life >= maxLife) {
        this.pool.fallingProjectiles.release(fp);
        continue;
      }
      if (fp.delay > 0) {
        fp.delay -= dtMs;
        continue;
      }
      if (fp.stuck) {
        fp.stuckTime = (fp.stuckTime || 0) + dtMs;
        if (fp.stuckTime >= (fp.maxStuckTime || 1200)) {
          this.pool.fallingProjectiles.release(fp);
        }
        continue;
      }
      const dx = fp.targetX - fp.x;
      const dy = fp.targetY - fp.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const step = (fp.speed || 900) * dt;

      if (!Number.isFinite(dist) || dist <= step || dist < 12) {
        fp.x = fp.targetX;
        fp.y = fp.targetY;
        if (typeof fp.onImpact === 'function') {
          try { fp.onImpact(fp); } catch (_) {}
        }
        if (fp.type === 'arrow') {
          fp.stuck = true;
          fp.stuckTime = 0;
        } else {
          this.pool.fallingProjectiles.release(fp);
        }
      } else {
        fp.x += (dx / dist) * step;
        fp.y += (dy / dist) * step;
        fp.angle = Math.atan2(dy, dx);
      }
    }

    // Advance spectral weapons
    for (const sw of this.pool.spectralWeapons._active) {
      sw.life += dtMs;
      if (!Number.isFinite(sw.life) || !sw.duration || sw.life >= sw.duration) {
        this.pool.spectralWeapons.release(sw);
        continue;
      }
      if (sw.state === 'orbiting') {
        sw.orbitAngle += (sw.orbitSpeed || 3) * dt;
        sw.x = sw.orbitCenterX + Math.cos(sw.orbitAngle) * (sw.orbitRadius || 60);
        sw.y = sw.orbitCenterY + Math.sin(sw.orbitAngle) * ((sw.orbitRadius || 60) * 0.45);
        sw.angle = sw.orbitAngle + Math.PI / 2;
      }
    }

    // Advance beams
    for (const b of this.pool.beams._active) {
      b.life += dtMs;
      if (!Number.isFinite(b.life) || !b.duration || b.life >= b.duration) {
        this.pool.beams.release(b);
        continue;
      }
      b.alpha = Math.max(0, 1 - (b.life / b.duration));
    }

    // Advance environmental fields
    for (const ef of this.pool.environmentalFields._active) {
      ef.life += dtMs;
      if (!Number.isFinite(ef.life) || !ef.duration || ef.life >= ef.duration) {
        this.pool.environmentalFields.release(ef);
        continue;
      }
      ef.rotation += (ef.vRot || 0) * dt;
      ef.alpha = Math.max(0, 1 - (ef.life / ef.duration));
    }

    // Advance slashes
    for (const sl of this.pool.slashes._active) {
      sl.life += dtMs;
      if (!Number.isFinite(sl.life) || !sl.duration || sl.life >= sl.duration) {
        this.pool.slashes.release(sl);
        continue;
      }
      sl.progress = Math.min(1, sl.life / sl.duration);
    }

    // Advance active telegraphs
    for (let i = this._activeTelegraphs.length - 1; i >= 0; i--) {
      const tg = this._activeTelegraphs[i];
      tg.life += dtMs;
      if (!Number.isFinite(tg.life) || !tg.duration || tg.life >= tg.duration) {
        if (typeof tg.onComplete === 'function') {
          try { tg.onComplete(tg); } catch (_) {}
        }
        this._activeTelegraphs.splice(i, 1);
      }
    }
  }

  /**
   * Main Canvas 2D render pass
   * @param {CanvasRenderingContext2D} ctx 
   * @param {number} width 
   * @param {number} height 
   */
  render(ctx, width, height) {
    if (!this.enabled) return;

    ctx.save();

    // 1. Apply camera transform (only in headless/standalone canvas mode; if mounted to stageElement, CSS transform on #stage handles it)
    if (!this.stageElement) {
      if (this.camera.zoom !== 1.0 || this.camera.offsetX !== 0 || this.camera.offsetY !== 0 || this.camera.rotation !== 0) {
        ctx.translate(width / 2, height / 2);
        ctx.scale(this.camera.zoom, this.camera.zoom);
        ctx.rotate(this.camera.rotation);
        ctx.translate(-width / 2 + this.camera.offsetX, -height / 2 + this.camera.offsetY);
      }
    }

    // 2. Render Lighting (ambient dim + radial lights)
    this.lighting.renderCanvas(ctx, width, height);

    // 2.3 Environmental Fields (Ground fissures, rifts, mandalas, storms)
    VFXComponentLibrary.renderEnvironmentalFields(ctx, this.pool.environmentalFields._active);

    // 2.4 Slashes (Crescent blade cuts)
    VFXComponentLibrary.renderSlashes(ctx, this.pool.slashes._active);

    // 2.5 Beams (Continuous celestial/dark/lightning rays)
    VFXComponentLibrary.renderBeams(ctx, this.pool.beams._active);

    // 2.6 Falling Projectiles (Meteors, Arrows, Holy Swords, Ice Shards)
    VFXComponentLibrary.renderFallingProjectiles(ctx, this.pool.fallingProjectiles._active);

    // 2.7 Spectral Weapons (Floating orbiting blades/shields)
    VFXComponentLibrary.renderSpectralWeapons(ctx, this.pool.spectralWeapons._active);

    // 2.8 Render Active Ground Telegraphs
    for (const tg of this._activeTelegraphs) {
      const progress = Math.min(1.0, tg.life / tg.duration);
      const remainingSec = Math.max(0, (tg.duration - tg.life) / 1000).toFixed(1);
      const pulse = 0.8 + 0.2 * Math.sin(tg.life * 0.012);

      ctx.save();
      if (tg.type === 'circle') {
        ctx.save();
        ctx.translate(tg.x, tg.y);
        ctx.scale(1.0, 0.45);

        // Outer pulsing danger ring
        ctx.beginPath();
        ctx.arc(0, 0, tg.radius, 0, Math.PI * 2);
        ctx.strokeStyle = tg.color;
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.85 * pulse;
        if (typeof ctx.setLineDash === 'function') ctx.setLineDash([8, 6]);
        ctx.stroke();

        // Inward growing progress fill
        ctx.beginPath();
        ctx.arc(0, 0, tg.radius * progress, 0, Math.PI * 2);
        ctx.fillStyle = tg.color;
        ctx.globalAlpha = 0.25 + 0.15 * progress;
        if (typeof ctx.setLineDash === 'function') ctx.setLineDash([]);
        ctx.fill();
        ctx.restore();

        // Warning label with remaining seconds
        ctx.save();
        ctx.font = 'bold 12px "Cinzel", serif, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = tg.color;
        ctx.shadowBlur = 8;
        ctx.globalAlpha = 0.95;
        ctx.fillText(`⚠️ ${tg.label} [${remainingSec}s]`, tg.x, tg.y - tg.radius * 0.45 - 8);
        ctx.restore();

      } else if (tg.type === 'cone') {
        const dx = tg.targetX - tg.sourceX;
        const dy = tg.targetY - tg.sourceY;
        const baseAngle = Math.atan2(dy, dx);
        const halfAngle = tg.angle / 2;

        ctx.save();
        ctx.translate(tg.sourceX, tg.sourceY);
        ctx.scale(1.0, 0.55);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, tg.range, baseAngle - halfAngle, baseAngle + halfAngle);
        ctx.closePath();
        ctx.strokeStyle = tg.color;
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.85 * pulse;
        if (typeof ctx.setLineDash === 'function') ctx.setLineDash([8, 6]);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, tg.range * progress, baseAngle - halfAngle, baseAngle + halfAngle);
        ctx.closePath();
        ctx.fillStyle = tg.color;
        ctx.globalAlpha = 0.22 + 0.18 * progress;
        if (typeof ctx.setLineDash === 'function') ctx.setLineDash([]);
        ctx.fill();
        ctx.restore();

        const midX = tg.sourceX + (dx * 0.5);
        const midY = tg.sourceY + (dy * 0.5) - 15;
        ctx.save();
        ctx.font = 'bold 12px "Cinzel", serif, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = tg.color;
        ctx.shadowBlur = 8;
        ctx.fillText(`⚠️ ${tg.label} [${remainingSec}s]`, midX, midY);
        ctx.restore();
      }
      ctx.restore();
    }

    // 3. Render Particles (Batched without per-particle save/restore for dots)
    ctx.globalCompositeOperation = 'lighter';
    for (const p of this.pool.particles._active) {
      if (p.shape === 'spark') {
        const angle = Math.atan2(p.vy, p.vx);
        const len = Math.max(p.size * 2, Math.sqrt(p.vx * p.vx + p.vy * p.vy) * 0.05);
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(angle);
        ctx.fillRect(-len / 2, -p.size / 2, len, p.size);
        ctx.restore();
      } else if (p.shape === 'shard') {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation || 0);
        ctx.beginPath();
        ctx.moveTo(p.size * 1.4, 0);
        ctx.lineTo(0, p.size * 0.7);
        ctx.lineTo(-p.size * 1.4, 0);
        ctx.lineTo(0, -p.size * 0.7);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else {
        // High-performance hot path for circular dot particles (no save/restore)
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalCompositeOperation = 'source-over';

    // 4. Render Projectiles (Batched)
    for (const proj of this.pool.projectiles._active) {
      ctx.fillStyle = proj.color;
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Render Shockwaves (Batched)
    for (const sw of this.pool.shockwaves._active) {
      ctx.strokeStyle = sw.color;
      ctx.globalAlpha = sw.alpha;
      ctx.lineWidth = sw.width * (1 - (sw.life / sw.duration));
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 6. Render Floating Damage Numbers (Single font state setup)
    ctx.textAlign = 'center';
    for (const ft of this.pool.floatingText._active) {
      ctx.globalAlpha = ft.alpha;
      ctx.fillStyle = ft.color;
      ctx.font = ft.style === 'crit' ? 'bold 16px "Cinzel", sans-serif' : '14px "Cinzel", sans-serif';
      ctx.fillText(ft.text, ft.x, ft.y);
    }

    // 7. Render Shader Post-Processing (Canvas fallback)
    this.shaders.renderCanvasFallback(ctx, width, height);

    // 8. Screen Flash overlay
    if (this.camera.flashAlpha > 0) {
      ctx.save();
      ctx.globalAlpha = this.camera.flashAlpha;
      ctx.fillStyle = this.camera.flashColor;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    ctx.restore();
  }

  /**
   * Destroy and unbind
   */
  destroy() {
    this.unmount();
    for (const unsub of this._unsubscribeEvents) {
      unsub();
    }
    this._unsubscribeEvents = [];
    this.pool.releaseAll();
    this.camera.reset();
    this.lighting.reset();
    this.shaders.reset();
    this.timelines.cancelAll();
  }
}

export const globalVFXOrchestrator = new VFXOrchestrator();
