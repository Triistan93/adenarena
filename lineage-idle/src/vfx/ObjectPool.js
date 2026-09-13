/**
 * ObjectPool.js — High-Performance Object Pooling for Aden Arena Idle 2D VFX.
 * 
 * Eliminates garbage collection spikes and allocations during hot combat loops.
 * Pools particles, projectiles, damage numbers, shockwaves, and lights.
 */

export class ObjectPool {
  /**
   * @param {Function} factory - Function that creates a new instance
   * @param {Function} reset - Function that resets an instance before reuse
   * @param {number} [initialSize=50] - Number of objects to prewarm
   * @param {number} [maxBudget=500] - Hard ceiling on total objects
   */
  constructor(factory, reset, initialSize = 50, maxBudget = 500) {
    if (typeof factory !== 'function') throw new TypeError('Factory must be a function');
    this._factory = factory;
    this._reset = typeof reset === 'function' ? reset : (obj => obj);
    this._maxBudget = maxBudget;
    this._available = [];
    this._active = new Set();

    if (initialSize > 0) {
      this.prewarm(initialSize);
    }
  }

  /**
   * Pre-allocates objects into the pool
   * @param {number} count 
   */
  prewarm(count) {
    const toCreate = Math.min(count, this._maxBudget - (this._available.length + this._active.size));
    for (let i = 0; i < toCreate; i++) {
      const obj = this._factory();
      this._available.push(obj);
    }
  }

  /**
   * Acquires an object from the pool
   * @param {Object} [initData] - Optional parameters passed to reset
   * @returns {Object|null}
   */
  acquire(initData = null) {
    let obj;
    if (this._available.length > 0) {
      obj = this._available.pop();
    } else if (this.totalCount < this._maxBudget) {
      obj = this._factory();
    } else {
      // Budget exceeded: recycle oldest active object if possible
      const iterator = this._active.values();
      obj = iterator.next().value;
      if (obj) {
        this._active.delete(obj);
      } else {
        return null;
      }
    }

    this._reset(obj, initData);
    this._active.add(obj);
    return obj;
  }

  /**
   * Returns an object back to the pool
   * @param {Object} obj 
   */
  release(obj) {
    if (!obj || !this._active.has(obj)) return false;
    this._active.delete(obj);
    this._reset(obj, null);
    if (this._available.length < this._maxBudget) {
      this._available.push(obj);
    }
    return true;
  }

  /**
   * Release all active objects
   */
  releaseAll() {
    for (const obj of this._active) {
      this._reset(obj, null);
      if (this._available.length < this._maxBudget) {
        this._available.push(obj);
      }
    }
    this._active.clear();
  }

  /**
   * Clear entire pool and discard references
   */
  clear() {
    this._active.clear();
    this._available = [];
  }

  get availableCount() {
    return this._available.length;
  }

  get activeCount() {
    return this._active.size;
  }

  get totalCount() {
    return this._available.length + this._active.size;
  }

  get maxBudget() {
    return this._maxBudget;
  }
}

/**
 * Global specialized pools for combat presentation
 */
export class VFXPoolManager {
  constructor() {
    // 1. Particle pool (budget 1000 max across all active effects)
    this.particles = new ObjectPool(
      () => ({
        x: 0, y: 0,
        vx: 0, vy: 0,
        ax: 0, ay: 0,
        color: '#ffffff',
        alpha: 1,
        size: 4,
        scale: 1,
        life: 0,
        maxLife: 1000,
        rotation: 0,
        vRot: 0,
        blendMode: 'lighter',
        active: false
      }),
      (p, data) => {
        if (!data) {
          p.active = false;
          p.life = 0;
          p.x = 0; p.y = 0;
          p.vx = 0; p.vy = 0;
          p.ax = 0; p.ay = 0;
          p.rotation = 0; p.vRot = 0;
          p.scale = 1;
          p.alpha = 1;
          return;
        }
        p.x = data.x || 0;
        p.y = data.y || 0;
        p.vx = data.vx || 0;
        p.vy = data.vy || 0;
        p.ax = data.ax || 0;
        p.ay = data.ay || 0;
        p.color = data.color || '#ffcc00';
        p.alpha = data.alpha !== undefined ? data.alpha : 1;
        p.size = data.size || 4;
        p.scale = data.scale || 1;
        p.life = 0;
        p.maxLife = data.maxLife || 800;
        p.rotation = data.rotation || 0;
        p.vRot = data.vRot || 0;
        p.blendMode = data.blendMode || 'lighter';
        p.active = true;
      },
      200,
      1000
    );

    // 2. Projectile pool (budget 150)
    this.projectiles = new ObjectPool(
      () => ({
        x: 0, y: 0,
        targetX: 0, targetY: 0,
        speed: 800,
        progress: 0,
        life: 0,
        maxLife: 3000,
        type: 'arrow',
        color: '#ffffff',
        trail: [],
        active: false,
        onHit: null
      }),
      (proj, data) => {
        if (!data) {
          proj.active = false;
          proj.trail = [];
          proj.onHit = null;
          proj.life = 0;
          return;
        }
        proj.x = data.x || 0;
        proj.y = data.y || 0;
        proj.targetX = data.targetX || 0;
        proj.targetY = data.targetY || 0;
        proj.speed = data.speed || 800;
        proj.progress = 0;
        proj.life = 0;
        proj.maxLife = data.maxLife || 3000;
        proj.type = data.type || 'arrow';
        proj.color = data.color || '#ffffff';
        proj.trail = [];
        proj.active = true;
        proj.onHit = data.onHit || null;
      },
      30,
      150
    );

    // 3. Floating text pool (budget 100)
    this.floatingText = new ObjectPool(
      () => ({
        text: '',
        x: 0, y: 0,
        vy: -40,
        color: '#ffffff',
        scale: 1,
        alpha: 1,
        style: 'normal',
        life: 0,
        maxLife: 1000,
        active: false
      }),
      (ft, data) => {
        if (!data) {
          ft.active = false;
          return;
        }
        ft.text = String(data.text || '');
        ft.x = data.x || 0;
        ft.y = data.y || 0;
        ft.vy = data.vy || -50;
        ft.color = data.color || '#ffffff';
        ft.scale = data.scale || 1;
        ft.alpha = 1;
        ft.style = data.style || 'normal';
        ft.life = 0;
        ft.maxLife = data.maxLife || 1000;
        ft.active = true;
      },
      25,
      100
    );

    // 4. Shockwave pool (budget 50)
    this.shockwaves = new ObjectPool(
      () => ({
        x: 0, y: 0,
        radius: 0,
        maxRadius: 120,
        width: 6,
        color: '#ffffff',
        alpha: 1,
        life: 0,
        duration: 400,
        active: false
      }),
      (sw, data) => {
        if (!data) {
          sw.active = false;
          return;
        }
        sw.x = data.x || 0;
        sw.y = data.y || 0;
        sw.radius = data.radius || 0;
        sw.maxRadius = data.maxRadius || 120;
        sw.width = data.width || 6;
        sw.color = data.color || '#ffffff';
        sw.alpha = 1;
        sw.life = 0;
        sw.duration = data.duration || 400;
        sw.active = true;
      },
      15,
      50
    );

    // 5. Dynamic / Fake Light pool (budget 50)
    this.lights = new ObjectPool(
      () => ({
        x: 0, y: 0,
        radius: 100,
        color: '#ffffff',
        intensity: 1,
        life: 0,
        duration: 500,
        active: false
      }),
      (light, data) => {
        if (!data) {
          light.active = false;
          return;
        }
        light.x = data.x || 0;
        light.y = data.y || 0;
        light.radius = data.radius || 100;
        light.color = data.color || '#ffffff';
        light.intensity = data.intensity !== undefined ? data.intensity : 1;
        light.life = 0;
        light.duration = data.duration || 500;
        light.active = true;
      },
      10,
      50
    );

    // 6. Falling Projectiles pool (Meteors, Arrows, Holy Swords, Ice Shards - budget 150)
    this.fallingProjectiles = new ObjectPool(
      () => ({
        x: 0, y: 0,
        startX: 0, startY: 0,
        targetX: 0, targetY: 0,
        vx: 0, vy: 0,
        angle: 0,
        speed: 800,
        progress: 0,
        delay: 0,
        life: 0,
        maxLife: 4000,
        type: 'meteor', // 'meteor' | 'arrow' | 'holy_sword' | 'ice_shard' | 'dark_spear'
        color: '#ff4400',
        secondaryColor: '#ffbb00',
        trail: [],
        scale: 1,
        stuck: false,
        stuckTime: 0,
        maxStuckTime: 300,
        active: false,
        onImpact: null
      }),
      (fp, data) => {
        if (!data) {
          fp.active = false;
          fp.trail = [];
          fp.onImpact = null;
          fp.life = 0;
          return;
        }
        fp.x = data.startX || 0;
        fp.y = data.startY || 0;
        fp.startX = data.startX || 0;
        fp.startY = data.startY || 0;
        fp.targetX = data.targetX || 0;
        fp.targetY = data.targetY || 0;
        fp.vx = data.vx || 0;
        fp.vy = data.vy || 0;
        fp.angle = data.angle || Math.atan2(fp.targetY - fp.startY, fp.targetX - fp.startX);
        fp.speed = data.speed || 900;
        fp.progress = 0;
        fp.delay = data.delay || 0;
        fp.life = 0;
        fp.maxLife = data.maxLife || 4000;
        fp.type = data.type || 'meteor';
        fp.color = data.color || '#ff4400';
        fp.secondaryColor = data.secondaryColor || '#ffbb00';
        fp.trail = [];
        fp.scale = data.scale || 1;
        fp.stuck = false;
        fp.stuckTime = 0;
        fp.maxStuckTime = data.maxStuckTime || 300;
        fp.active = true;
        fp.onImpact = data.onImpact || null;
      },
      30,
      150
    );

    // 7. Spectral Weapons pool (Floating blades, orbital shields, phantom spears - budget 80)
    this.spectralWeapons = new ObjectPool(
      () => ({
        x: 0, y: 0,
        orbitCenterX: 0, orbitCenterY: 0,
        orbitRadius: 60,
        orbitSpeed: 3,
        orbitAngle: 0,
        angle: 0,
        scale: 1,
        type: 'blade', // 'blade' | 'spear' | 'holy_sword'
        color: '#ffd700',
        secondaryColor: '#ffffff',
        state: 'orbiting', // 'orbiting' | 'thrusting' | 'falling' | 'receding'
        targetX: 0, targetY: 0,
        thrustSpeed: 1200,
        life: 0,
        duration: 2000,
        active: false
      }),
      (sw, data) => {
        if (!data) {
          sw.active = false;
          return;
        }
        sw.x = data.x || 0;
        sw.y = data.y || 0;
        sw.orbitCenterX = data.orbitCenterX || 0;
        sw.orbitCenterY = data.orbitCenterY || 0;
        sw.orbitRadius = data.orbitRadius || 60;
        sw.orbitSpeed = data.orbitSpeed || 3;
        sw.orbitAngle = data.orbitAngle || 0;
        sw.angle = data.angle || 0;
        sw.scale = data.scale || 1;
        sw.type = data.type || 'blade';
        sw.color = data.color || '#ffd700';
        sw.secondaryColor = data.secondaryColor || '#ffffff';
        sw.state = data.state || 'orbiting';
        sw.targetX = data.targetX || 0;
        sw.targetY = data.targetY || 0;
        sw.thrustSpeed = data.thrustSpeed || 1200;
        sw.life = 0;
        sw.duration = data.duration || 2000;
        sw.active = true;
      },
      20,
      80
    );

    // 8. Beams pool (Continuous beams, celestial rays, lightning arcs - budget 40)
    this.beams = new ObjectPool(
      () => ({
        startX: 0, startY: 0,
        endX: 0, endY: 0,
        width: 24,
        coreWidth: 8,
        type: 'holy', // 'holy' | 'dark' | 'lightning' | 'arcane'
        color: '#ffffff',
        outerColor: '#ffd700',
        segments: [],
        life: 0,
        duration: 400,
        alpha: 1,
        active: false
      }),
      (b, data) => {
        if (!data) {
          b.active = false;
          b.segments = [];
          return;
        }
        b.startX = data.startX || 0;
        b.startY = data.startY || 0;
        b.endX = data.endX || 0;
        b.endY = data.endY || 0;
        b.width = data.width || 24;
        b.coreWidth = data.coreWidth || Math.max(4, Math.floor(b.width * 0.35));
        b.type = data.type || 'holy';
        b.color = data.color || '#ffffff';
        b.outerColor = data.outerColor || '#ffd700';
        b.segments = data.segments || [];
        b.life = 0;
        b.duration = data.duration || 400;
        b.alpha = 1;
        b.active = true;
      },
      10,
      40
    );

    // 9. Environmental Fields pool (Ground cracks, fissures, burning fields, mandalas - budget 40)
    this.environmentalFields = new ObjectPool(
      () => ({
        x: 0, y: 0,
        radius: 100,
        maxRadius: 150,
        type: 'fissure', // 'fissure' | 'burning' | 'frozen' | 'mandala' | 'rift' | 'tornado'
        color: '#ff4400',
        secondaryColor: '#220000',
        rotation: 0,
        vRot: 0,
        fractures: [],
        runes: [],
        intensity: 1,
        life: 0,
        duration: 1500,
        alpha: 1,
        active: false
      }),
      (ef, data) => {
        if (!data) {
          ef.active = false;
          ef.fractures = [];
          ef.runes = [];
          return;
        }
        ef.x = data.x || 0;
        ef.y = data.y || 0;
        ef.radius = data.radius || 100;
        ef.maxRadius = data.maxRadius || 150;
        ef.type = data.type || 'fissure';
        ef.color = data.color || '#ff4400';
        ef.secondaryColor = data.secondaryColor || '#220000';
        ef.rotation = data.rotation || 0;
        ef.vRot = data.vRot || 0;
        ef.fractures = data.fractures || [];
        ef.runes = data.runes || [];
        ef.intensity = data.intensity !== undefined ? data.intensity : 1;
        ef.life = 0;
        ef.duration = data.duration || 1500;
        ef.alpha = 1;
        ef.active = true;
      },
      10,
      40
    );

    // 10. Slashes pool (Crescent blades, iaijutsu afterimages, dual cuts - budget 80)
    this.slashes = new ObjectPool(
      () => ({
        x: 0, y: 0,
        radius: 80,
        arc: Math.PI * 0.8,
        rotation: 0,
        color: '#ffffff',
        glowColor: '#38bdf8',
        thickness: 12,
        progress: 0,
        life: 0,
        duration: 250,
        afterimages: [],
        active: false
      }),
      (sl, data) => {
        if (!data) {
          sl.active = false;
          sl.afterimages = [];
          return;
        }
        sl.x = data.x || 0;
        sl.y = data.y || 0;
        sl.radius = data.radius || 80;
        sl.arc = data.arc || Math.PI * 0.8;
        sl.rotation = data.rotation || 0;
        sl.color = data.color || '#ffffff';
        sl.glowColor = data.glowColor || '#38bdf8';
        sl.thickness = data.thickness || 12;
        sl.progress = 0;
        sl.life = 0;
        sl.duration = data.duration || 250;
        sl.afterimages = data.afterimages || [];
        sl.active = true;
      },
      20,
      80
    );
  }

  /**
   * Release all objects across all sub-pools
   */
  releaseAll() {
    this.particles.releaseAll();
    this.projectiles.releaseAll();
    this.floatingText.releaseAll();
    this.shockwaves.releaseAll();
    this.lights.releaseAll();
    this.fallingProjectiles.releaseAll();
    this.spectralWeapons.releaseAll();
    this.beams.releaseAll();
    this.environmentalFields.releaseAll();
    this.slashes.releaseAll();
  }

  /**
   * Get stats for performance monitoring
   */
  getStats() {
    return {
      particles: { active: this.particles.activeCount, available: this.particles.availableCount },
      projectiles: { active: this.projectiles.activeCount, available: this.projectiles.availableCount },
      floatingText: { active: this.floatingText.activeCount, available: this.floatingText.availableCount },
      shockwaves: { active: this.shockwaves.activeCount, available: this.shockwaves.availableCount },
      lights: { active: this.lights.activeCount, available: this.lights.availableCount },
      fallingProjectiles: { active: this.fallingProjectiles.activeCount, available: this.fallingProjectiles.availableCount },
      spectralWeapons: { active: this.spectralWeapons.activeCount, available: this.spectralWeapons.availableCount },
      beams: { active: this.beams.activeCount, available: this.beams.availableCount },
      environmentalFields: { active: this.environmentalFields.activeCount, available: this.environmentalFields.availableCount },
      slashes: { active: this.slashes.activeCount, available: this.slashes.availableCount }
    };
  }
}

export const globalVFXPool = new VFXPoolManager();
