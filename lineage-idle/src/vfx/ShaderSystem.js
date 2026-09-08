/**
 * ShaderSystem.js — WebGL Shader Filters & Canvas 2D Fallback Post-Processing.
 * 
 * Provides:
 * - Radial Shockwave / Refraction Ripple
 * - Bloom & High-Intensity Glow
 * - Chromatic Aberration (RGB channel shift on heavy crits and breaks)
 * - Heat Haze / Magma Fire Distortion
 * - Seamless fallback to Canvas 2D procedural rendering if WebGL is unavailable
 */

export class ShaderSystem {
  constructor(options = {}) {
    this.enabled = options.enabled !== false;
    this.useWebGL = false; // Detected at runtime

    // Active shader effects
    this.shockwaves = [];
    this.bloomIntensity = 0.0;
    this._bloomDuration = 0;
    this._bloomElapsed = 0;

    this.chromaticOffset = 0.0;
    this._chromaticDuration = 0;
    this._chromaticElapsed = 0;

    this.heatHazeStrength = 0.0;
    this._heatHazeDuration = 0;
    this._heatHazeElapsed = 0;
    this._time = 0;
  }

  /**
   * Initializes WebGL / Pixi filter bindings if a Pixi app is provided.
   * @param {Object} [pixiApp] 
   */
  init(pixiApp = null) {
    if (pixiApp && pixiApp.renderer) {
      this.useWebGL = true;
      this._pixiApp = pixiApp;
    } else {
      this.useWebGL = false;
    }
  }

  /**
   * Triggers a radial shockwave distortion expanding outward from a point.
   * @param {number} x 
   * @param {number} y 
   * @param {Object} [options] { maxRadius, speed, amplitude, wavelength }
   */
  triggerShockwave(x, y, options = {}) {
    if (!this.enabled) return;
    this.shockwaves.push({
      x,
      y,
      radius: 0,
      maxRadius: options.maxRadius || 240,
      speed: options.speed || 600, // pixels per sec
      amplitude: options.amplitude || 15,
      wavelength: options.wavelength || 40,
      elapsed: 0,
      duration: ((options.maxRadius || 240) / (options.speed || 600)) * 1000
    });
  }

  /**
   * Triggers high-intensity bloom burst.
   * @param {number} intensity - 0.0 to 2.0
   * @param {number} durationMs - Duration in milliseconds
   */
  triggerBloom(intensity = 1.0, durationMs = 300) {
    if (!this.enabled) return;
    this.bloomIntensity = Math.max(this.bloomIntensity, intensity);
    this._bloomDuration = Math.max(1, durationMs);
    this._bloomElapsed = 0;
  }

  /**
   * Triggers chromatic aberration channel splitting.
   * @param {number} offsetPixels - RGB offset (e.g. 4px - 12px)
   * @param {number} durationMs 
   */
  triggerChromaticAberration(offsetPixels = 8, durationMs = 180) {
    if (!this.enabled) return;
    this.chromaticOffset = Math.max(this.chromaticOffset, offsetPixels);
    this._chromaticDuration = Math.max(1, durationMs);
    this._chromaticElapsed = 0;
  }

  /**
   * Triggers heat haze ripple distortion (for Fire / Magma / Solar skills).
   * @param {number} strength 
   * @param {number} durationMs 
   */
  triggerHeatHaze(strength = 1.0, durationMs = 600) {
    if (!this.enabled) return;
    this.heatHazeStrength = Math.max(this.heatHazeStrength, strength);
    this._heatHazeDuration = Math.max(1, durationMs);
    this._heatHazeElapsed = 0;
  }

  /**
   * Update shader state per frame.
   * @param {number} dtMs - Elapsed milliseconds
   */
  update(dtMs) {
    this._time += dtMs / 1000.0;

    // 1. Update Shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.elapsed += dtMs;
      sw.radius += (sw.speed * dtMs) / 1000.0;
      if (sw.radius >= sw.maxRadius || sw.elapsed >= sw.duration) {
        this.shockwaves.splice(i, 1);
      }
    }

    // 2. Update Bloom decay
    if (this.bloomIntensity > 0) {
      this._bloomElapsed += dtMs;
      const progress = Math.min(1.0, this._bloomElapsed / this._bloomDuration);
      this.bloomIntensity *= (1.0 - progress * 0.1);
      if (progress >= 1.0) {
        this.bloomIntensity = 0.0;
      }
    }

    // 3. Update Chromatic Aberration decay
    if (this.chromaticOffset > 0) {
      this._chromaticElapsed += dtMs;
      const prog = Math.min(1.0, this._chromaticElapsed / this._chromaticDuration);
      this.chromaticOffset *= (1.0 - prog * 0.2);
      if (prog >= 1.0) {
        this.chromaticOffset = 0.0;
      }
    }

    // 4. Update Heat Haze decay
    if (this.heatHazeStrength > 0) {
      this._heatHazeElapsed += dtMs;
      const prog = Math.min(1.0, this._heatHazeElapsed / this._heatHazeDuration);
      this.heatHazeStrength *= (1.0 - prog * 0.05);
      if (prog >= 1.0) {
        this.heatHazeStrength = 0.0;
      }
    }
  }

  /**
   * Render Canvas 2D fallback effects for active shaders
   * @param {CanvasRenderingContext2D} ctx 
   * @param {number} width 
   * @param {number} height 
   */
  renderCanvasFallback(ctx, width, height) {
    if (!this.enabled) return;

    // 1. Radial shockwave rings
    if (this.shockwaves.length > 0) {
      ctx.save();
      for (const sw of this.shockwaves) {
        const progress = Math.min(1.0, sw.radius / sw.maxRadius);
        const alpha = Math.max(0, 1.0 - progress) * 0.7;
        const ringWidth = Math.max(2, sw.amplitude * (1.0 - progress));

        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
        ctx.lineWidth = ringWidth;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Inner refraction ring
        ctx.strokeStyle = `rgba(180, 220, 255, ${(alpha * 0.5).toFixed(3)})`;
        ctx.lineWidth = ringWidth * 0.5;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, Math.max(0, sw.radius - 8), 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 2. Chromatic aberration edge tinting (Canvas simulation)
    if (this.chromaticOffset > 1.0) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = Math.min(0.3, this.chromaticOffset / 30);
      ctx.fillStyle = '#ff0055';
      ctx.fillRect(-this.chromaticOffset, 0, width, height);
      ctx.fillStyle = '#00ddff';
      ctx.fillRect(this.chromaticOffset, 0, width, height);
      ctx.restore();
    }
  }

  /**
   * Reset all shader states
   */
  reset() {
    this.shockwaves = [];
    this.bloomIntensity = 0;
    this.chromaticOffset = 0;
    this.heatHazeStrength = 0;
  }
}

export const globalShaderSystem = new ShaderSystem();
