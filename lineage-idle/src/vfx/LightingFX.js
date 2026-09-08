/**
 * LightingFX.js — 2D Fake & Dynamic Lighting Engine for Aden Arena Idle.
 * 
 * Supports:
 * - Ambient arena dimming (cinematic darkening on Ultimates & Master Ultimates)
 * - Radial fake lights (cast glow, ground runes, projectile lights)
 * - Impact light flashes with fast decay
 * - Additive blend mode compositing with Canvas 2D fallback
 */

export class LightingFX {
  constructor(options = {}) {
    this.enabled = options.enabled !== false;
    this.ambientColor = options.defaultAmbient || 'rgba(0, 0, 0, 0)';
    this.currentAmbient = 'rgba(0, 0, 0, 0)';
    this._ambientAlpha = 0.0;
    this._targetAmbientAlpha = 0.0;
    this._ambientDimDuration = 0;
    this._ambientDimElapsed = 0;
    this._ambientRestoreDuration = 0;
    this._isRestoringAmbient = false;

    // Active light sources
    this.activeLights = [];
    this.maxLights = options.maxLights || 30;
  }

  /**
   * Dims the arena background for dramatic ultimate skill emphasis.
   * @param {string} [dimColor='rgba(0, 0, 0, 0.6)'] 
   * @param {number} [durationMs=400] 
   * @param {number} [restoreDurationMs=300] 
   */
  dimAmbient(dimColor = 'rgba(0, 0, 0, 0.6)', durationMs = 400, restoreDurationMs = 300) {
    if (!this.enabled) return;
    this.currentAmbient = dimColor;
    this._ambientAlpha = 0.6;
    this._ambientDimDuration = durationMs;
    this._ambientDimElapsed = 0;
    this._ambientRestoreDuration = restoreDurationMs;
    this._isRestoringAmbient = false;
  }

  /**
   * Adds a point light source (cast glow, projectile glow, or impact flash).
   * @param {number} x 
   * @param {number} y 
   * @param {string} color 
   * @param {number} radius 
   * @param {number} [intensity=1.0] 
   * @param {number} [durationMs=350] 
   */
  addLight(x, y, color, radius, intensity = 1.0, durationMs = 350) {
    if (!this.enabled) return;
    if (this.activeLights.length >= this.maxLights) {
      this.activeLights.shift(); // Evict oldest
    }

    this.activeLights.push({
      x,
      y,
      color,
      radius,
      initialRadius: radius,
      intensity,
      initialIntensity: intensity,
      duration: Math.max(1, durationMs),
      elapsed: 0
    });
  }

  /**
   * Helper to spawn an instant impact flash light
   */
  addImpactFlash(x, y, color = '#ffd700', radius = 180, intensity = 1.2, durationMs = 200) {
    this.addLight(x, y, color, radius, intensity, durationMs);
  }

  /**
   * Helper to spawn a persistent casting glow
   */
  addCastGlow(x, y, color = '#60a5fa', radius = 120, intensity = 0.8, durationMs = 500) {
    this.addLight(x, y, color, radius, intensity, durationMs);
  }

  /**
   * Update all lighting states
   * @param {number} dtMs - Elapsed milliseconds
   */
  update(dtMs) {
    // 1. Update Ambient Dimming
    if (this._ambientAlpha > 0) {
      this._ambientDimElapsed += dtMs;
      if (!this._isRestoringAmbient) {
        if (this._ambientDimElapsed >= this._ambientDimDuration) {
          this._isRestoringAmbient = true;
          this._ambientDimElapsed = 0;
        }
      } else {
        const restoreProgress = Math.min(1.0, this._ambientDimElapsed / Math.max(1, this._ambientRestoreDuration));
        this._ambientAlpha = 0.6 * (1.0 - restoreProgress);
        if (restoreProgress >= 1.0) {
          this._ambientAlpha = 0.0;
          this._isRestoringAmbient = false;
        }
      }
    }

    // 2. Update Point Lights
    for (let i = this.activeLights.length - 1; i >= 0; i--) {
      const light = this.activeLights[i];
      light.elapsed += dtMs;
      const progress = Math.min(1.0, light.elapsed / light.duration);
      // Linear intensity decay
      light.intensity = light.initialIntensity * (1.0 - progress);
      // Slight expansion on decay
      light.radius = light.initialRadius * (1.0 + progress * 0.2);

      if (progress >= 1.0) {
        this.activeLights.splice(i, 1);
      }
    }
  }

  /**
   * Render lighting pass onto a 2D canvas context
   * @param {CanvasRenderingContext2D} ctx 
   * @param {number} width 
   * @param {number} height 
   */
  renderCanvas(ctx, width, height) {
    if (!this.enabled || (!this._ambientAlpha && this.activeLights.length === 0)) return;

    ctx.save();

    // 1. Ambient dimming layer
    if (this._ambientAlpha > 0) {
      ctx.globalAlpha = this._ambientAlpha;
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);
    }

    // 2. Additive Radial Lights
    if (this.activeLights.length > 0) {
      ctx.globalCompositeOperation = 'lighter';
      for (const light of this.activeLights) {
        if (light.intensity <= 0 || light.radius <= 0) continue;
        const grad = ctx.createRadialGradient(
          light.x, light.y, 0,
          light.x, light.y, light.radius
        );
        grad.addColorStop(0, light.color);
        grad.addColorStop(1, 'transparent');

        ctx.globalAlpha = Math.min(1.0, Math.max(0, light.intensity));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(light.x, light.y, light.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  /**
   * Clear all lights and reset ambient
   */
  reset() {
    this.activeLights = [];
    this._ambientAlpha = 0;
    this._isRestoringAmbient = false;
  }
}

export const globalLightingFX = new LightingFX();
