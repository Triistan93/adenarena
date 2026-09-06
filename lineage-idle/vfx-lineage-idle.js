/*
 * Lineage Idle VFX Pack
 * Standalone Canvas effects. No dependencies.
 *
 * Usage:
 *   const vfx = new LineageVFX({ container: document.querySelector('#arena') });
 *   vfx.play('fireball', { source: { x: 80, y: 220 }, target: { x: 540, y: 160 } });
 */
(function (global) {
  'use strict';

  var META = {
    particles: { rgb: '255,122,69' },
    fireball: { rgb: '255,122,69' },
    ice_shards: { rgb: '150,230,255' },
    wind_blast: { rgb: '126,240,200' },
    arcane_missile: { rgb: '167,139,250' },
    lightning: { rgb: '110,231,255' },
    energy_slash: { rgb: '124,196,255' },
    arrow_rain: { rgb: '217,176,106' },
    cross_slash: { rgb: '232,236,247' },
    spiral_spear: { rgb: '255,170,90' },
    double_shot: { rgb: '255,215,100' },
    power_smash: { rgb: '255,140,40' },
    dark_vortex: { rgb: '180,90,255' },
    holy_beam: { rgb: '255,235,140' },
    holy_heal: { rgb: '100,255,160' },
    buff_aura: { rgb: '255,210,70' },
    whirlwind: { rgb: '180,225,255' },
    frost_slash: { rgb: '140,225,255' },
    frost_blizzard: { rgb: '180,240,255' },
    inferno_slash: { rgb: '255,100,40' },
    inferno_dragon_breath: { rgb: '255,80,20' },
    monster_inferno_pillar: { rgb: '255,80,20' },
    monster_frost_freeze: { rgb: '160,230,255' },
    celestial_strike: { rgb: '255,235,140' },
    hero_skin_aura: { rgb: '140,225,255' },
    lights: { rgb: '242,201,110' },

    // NOVOS EFEITOS ESPECÍFICOS DE MAGOS
    wind_strike: { rgb: '110,245,205' },
    flame_strike: { rgb: '255,115,25' },

    // NOVOS EFEITOS DISTINTOS DE MAGOS (Aéreos e Solo Realistas)
    magic_prominence: { rgb: '255,90,20' },
    magic_meteor: { rgb: '255,60,10' },
    magic_hydro_blast: { rgb: '80,200,255' },
    magic_hurricane: { rgb: '100,240,190' },
    magic_lightning_surge: { rgb: '120,235,255' },
    magic_death_spike: { rgb: '190,90,255' },
    magic_vampiric_drain: { rgb: '230,50,110' },
    magic_dark_mire: { rgb: '140,40,220' },
    magic_solar_flare: { rgb: '255,235,120' },
    magic_holy_sanctuary: { rgb: '255,245,160' },

    // NOVOS EFEITOS DISTINTOS DE GUERREIROS & ARQUEIROS
    snipe_shot: { rgb: '255,230,100' },
    burst_fire: { rgb: '255,160,50' },
    seven_arrow: { rgb: '255,225,120' },
    warrior_backstab: { rgb: '220,30,60' },
    warrior_deadly_blow: { rgb: '255,240,220' },
    warrior_sonic_storm: { rgb: '140,210,255' },
    warrior_triple_slash: { rgb: '200,230,255' },
    warrior_earth_tremor: { rgb: '220,150,60' },
    warrior_force_burst: { rgb: '255,165,40' },
    warrior_spear_whirlwind: { rgb: '255,190,110' }
  };

  var QUALITY = {
    low: { particles: 0.65, blur: 0.7 },
    medium: { particles: 1, blur: 0.95 },
    high: { particles: 1.45, blur: 1.2 }
  };

  function rand(a, b) {
    return a + Math.random() * (b - a);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function distance(a, b) {
    return Math.hypot(b.x - a.x, b.y - a.y);
  }

  function rgba(rgb, alpha) {
    return 'rgba(' + rgb + ',' + clamp(alpha, 0, 1) + ')';
  }

  function colorToRgb(color, fallback) {
    if (!color) return fallback;
    if (typeof color === 'string' && color.indexOf(',') !== -1) return color;
    var match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
    if (!match) return fallback;
    return parseInt(match[1], 16) + ',' + parseInt(match[2], 16) + ',' + parseInt(match[3], 16);
  }

  function point(value, fallback) {
    if (!value) return { x: fallback.x, y: fallback.y };
    return { x: Number(value.x) || 0, y: Number(value.y) || 0 };
  }

  function buildBolt(a, b, jitter) {
    var points = [a, b];
    for (var pass = 0; pass < 6; pass += 1) {
      var next = [];
      for (var i = 0; i < points.length - 1; i += 1) {
        var p = points[i];
        var q = points[i + 1];
        next.push(p, {
          x: (p.x + q.x) / 2 + (Math.random() - 0.5) * jitter,
          y: (p.y + q.y) / 2 + (Math.random() - 0.5) * jitter
        });
      }
      next.push(points[points.length - 1]);
      points = next;
      jitter *= 0.52;
    }
    return points;
  }

  function LineageVFX(options) {
    options = options || {};
    this.container = options.container || document.body;
    this.canvas = options.canvas || null;
    this.quality = QUALITY[options.quality] ? options.quality : 'high';
    this.qualityConfig = QUALITY[this.quality];
    this.maxParticles = options.maxParticles || 2200;
    this.effects = [];
    this.particles = [];
    this.rings = [];
    this.stuckArrows = [];
    this.ambient = options.ambient !== false;
    this.ambientParticles = [];
    this.lightOrbs = [];
    this.flash = 0;
    this.flashRgb = '255,255,255';
    this.time = 0;
    this.lastTime = 0;
    this.running = false;
    this.resizeObserver = null;
    this.dpr = 1;
    this.width = 1;
    this.height = 1;
    this._createdCanvas = false;
    this._setupCanvas();
    this._seedAmbient();
    this._seedLights();
    this.resize();
    this.start();
  }

  LineageVFX.prototype._setupCanvas = function () {
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this._createdCanvas = true;
      this.canvas.className = 'combat-vfx-canvas';
      this.canvas.setAttribute('aria-hidden', 'true');
      this.canvas.style.position = 'absolute';
      this.canvas.style.inset = '0';
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      this.canvas.style.pointerEvents = 'none';
      this.canvas.style.zIndex = String(this.container === document.body ? 20 : 5);
      if (this.container !== document.body && getComputedStyle(this.container).position === 'static') {
        this.container.style.position = 'relative';
      }
      this.container.appendChild(this.canvas);
    }
    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) throw new Error('LineageVFX requires a 2D canvas context.');
    var self = this;
    this._onResize = function () { self.resize(); };
    window.addEventListener('resize', this._onResize);
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(this._onResize);
      this.resizeObserver.observe(this.container);
    }
  };

  LineageVFX.prototype.resize = function () {
    var rect = this.canvas.getBoundingClientRect();
    this.width = rect.width || this.container.clientWidth || window.innerWidth;
    this.height = rect.height || this.container.clientHeight || window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.max(1, Math.floor(this.width * this.dpr));
    this.canvas.height = Math.max(1, Math.floor(this.height * this.dpr));
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  };

  LineageVFX.prototype._seedAmbient = function () {
    for (var i = 0; i < 60; i += 1) {
      this.ambientParticles.push({
        x: Math.random(), y: Math.random(), r: rand(0.6, 2.4),
        speed: rand(0.15, 0.55), sway: rand(0.3, 0.9), phase: rand(0, Math.PI * 2),
        rgb: ['255,122,69', '242,201,110', '167,139,250', '110,231,255'][i % 4]
      });
    }
  };

  LineageVFX.prototype._seedLights = function () {
    for (var i = 0; i < 5; i += 1) {
      this.lightOrbs.push({
        ax: 0.2 + i * 0.15, ay: 0.3 + (i % 3) * 0.18,
        rx: rand(0.14, 0.34), ry: rand(0.1, 0.26), speed: rand(0.25, 0.65),
        phase: rand(0, Math.PI * 2), rgb: ['242,201,110', '110,231,255', '167,139,250'][i % 3],
        radius: rand(55, 125)
      });
    }
  };

  LineageVFX.prototype._addParticle = function (data) {
    if (this.particles.length >= this.maxParticles) return;
    var defaults = {
      x: 0, y: 0, vx: 0, vy: 0, age: 0, max: 50, radius: 2,
      rgb: '255,255,255', gravity: 0, drag: 1, additive: true,
      kind: 'dot', rotation: 0, rotationSpeed: 0
    };
    this.particles.push(Object.assign(defaults, data || {}));
  };

  LineageVFX.prototype._burst = function (x, y, rgb, count, power) {
    var strength = Math.max(1, Number(power) || 1);
    count = Math.floor(count * this.qualityConfig.particles * (1 + Math.min(0.6, strength * 0.08)));
    for (var i = 0; i < count; i += 1) {
      var angle = Math.random() * Math.PI * 2;
      var speed = rand(0.8, Math.max(1.2, power * 1.1));
      this._addParticle({
        x: x, y: y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        max: rand(28, 70), radius: rand(1.1, 3.4), rgb: rgb, drag: 0.95
      });
    }
  };

  LineageVFX.prototype._ring = function (x, y, rgb, max, speed, width) {
    this.rings.push({ x: x, y: y, radius: 4, speed: speed || 4, age: 0, max: max || 36, rgb: rgb, width: width || 2 });
  };

  LineageVFX.prototype._doFlash = function (rgb, amount) {
    this.flashRgb = rgb;
    this.flash = Math.min(1, this.flash + amount);
  };

  LineageVFX.prototype.play = function (type, options) {
    options = options || {};
    if (!META[type] && type !== 'ambient' && type !== 'lights') {
      console.warn('[LineageVFX] Unknown effect:', type);
      return null;
    }
    var fallbackSource = { x: this.width * 0.1, y: this.height * 0.6 };
    var fallbackTarget = { x: this.width * 0.82, y: this.height * 0.45 };
    var effect = {
      type: type,
      age: 0,
      maxAge: options.duration || 0,
      source: point(options.source, fallbackSource),
      target: point(options.target, fallbackTarget),
      rgb: colorToRgb(options.color, META[type] ? META[type].rgb : '242,201,110'),
      power: options.power || 1,
      speed: options.speed,
      options: options,
      state: {}
    };
    this._initializeEffect(effect);
    this.effects.push(effect);
    return effect;
  };

  LineageVFX.prototype._initializeEffect = function (e) {
    var distanceToTarget = distance(e.source, e.target);
    var angle = Math.atan2(e.target.y - e.source.y, e.target.x - e.source.x);
    e.state.angle = angle;
    e.state.distance = distanceToTarget;
    e.state.x = e.source.x;
    e.state.y = e.source.y;

    if (e.type === 'fireball') e.state.speed = e.speed || 5.4;
    if (e.type === 'ice_shards') e.state.speed = e.speed || 6.2;
    if (e.type === 'wind_blast') e.state.speed = e.speed || 7.5;
    if (e.type === 'wind_strike') {
      e.state.speed = e.speed || 6.8;
      e.maxAge = e.maxAge || 750;
      this._doFlash('120,250,210', 0.25);
      this._ring(e.source.x, e.source.y, '110,245,205', 30, 4.0, 2.0);
    }
    if (e.type === 'flame_strike') {
      e.maxAge = e.maxAge || 850;
      e.state.lastFlameSpawn = 0;
      e.state.rotation = 0;
      this._doFlash('255,120,30', 0.4);
      this._ring(e.target.x, e.target.y, '255,120,30', 48, 4.8, 2.8);
      this._ring(e.target.x, e.target.y, '255,210,80', 68, 3.2, 1.8);
    }
    if (e.type === 'arcane_missile') e.state.speed = e.speed || 5.4;
    if (e.type === 'energy_slash') e.state.speed = e.speed || 6.4;
    if (e.type === 'spiral_spear') e.state.speed = e.speed || 7.2;
    if (e.type === 'cross_slash') e.state.age = 0;

    if (e.type === 'double_shot') {
      e.state.speed = e.speed || 9.2;
      e.state.arrow1 = { x: e.source.x, y: e.source.y - 6, active: true, done: false };
      e.state.arrow2 = { x: e.source.x, y: e.source.y + 6, active: false, done: false, delay: 110 };
      e.maxAge = e.maxAge || 1200;
    }

    if (e.type === 'power_smash') {
      e.maxAge = e.maxAge || 520;
      e.state.impacted = false;
      this._doFlash(e.rgb, 0.4);
    }

    if (e.type === 'holy_beam') {
      e.maxAge = e.maxAge || 650;
      e.state.impacted = false;
      this._doFlash('255,245,180', 0.6);
      this._ring(e.target.x, e.target.y, '255,230,120', 50, 4.5, 3);
    }

    if (e.type === 'dark_vortex') {
      e.maxAge = e.maxAge || 850;
      e.state.angle = 0;
      this._ring(e.target.x, e.target.y, '180,90,255', 45, 3.5, 2.5);
    }

    if (e.type === 'whirlwind') {
      e.maxAge = e.maxAge || 580;
      e.state.rotation = 0;
      this._ring(e.target.x, e.target.y, '180,225,255', 48, 5.5, 3);
    }

    if (e.type === 'frost_slash') {
      e.maxAge = e.maxAge || 600;
      e.state.impacted = false;
      this._doFlash('140,225,255', 0.45);
      this._ring(e.target.x, e.target.y, '160,235,255', 52, 6.5, 3.5);
    }

    if (e.type === 'frost_blizzard') {
      e.maxAge = e.maxAge || 950;
      e.state.impacted = false;
      this._doFlash('180,240,255', 0.65);
      this._ring(e.target.x, e.target.y, '200,245,255', 72, 7.5, 4);
      this._ring(e.target.x, e.target.y, '130,210,255', 90, 4.2, 2.2);
    }

    if (e.type === 'inferno_slash') {
      e.maxAge = e.maxAge || 650;
      e.state.impacted = false;
      this._doFlash('255,100,40', 0.55);
      this._ring(e.target.x, e.target.y, '255,130,40', 58, 6.8, 3.8);
      this._ring(e.target.x, e.target.y, '255,220,100', 76, 4.5, 2);
    }

    if (e.type === 'inferno_dragon_breath') {
      e.maxAge = e.maxAge || 950;
      e.state.impacted = false;
      e.state.rotation = 0;
      this._doFlash('255,100,20', 0.75);
      this._ring(e.target.x, e.target.y, '255,80,20', 80, 7.8, 4.5);
      this._ring(e.target.x, e.target.y, '255,180,40', 105, 5.2, 2.8);
      this._ring(e.target.x, e.target.y, '255,240,120', 130, 3.6, 1.8);
    }

    if (e.type === 'monster_inferno_pillar') {
      e.maxAge = e.maxAge || 1200;
      e.state.lastFlameSpawn = 0;
      e.state.rotation = 0;
      var feetY = e.target.y;
      this._doFlash('255,90,20', 0.5);
      this._ring(e.target.x, feetY, '255,90,20', 75, 5.5, 4);
      this._ring(e.target.x, feetY, '255,210,80', 95, 3.8, 2.5);
      // Spawn burst of flames and magma sparks right at bottom edge of card
      for (var fP = 0; fP < 36; fP += 1) {
        var fAng = rand(-Math.PI * 0.85, -Math.PI * 0.15);
        this._addParticle({
          x: e.target.x + rand(-32, 32),
          y: feetY + rand(-4, 4),
          vx: Math.cos(fAng) * rand(1.5, 4.5),
          vy: Math.sin(fAng) * rand(4, 9.5),
          max: rand(50, 95),
          radius: rand(12, 28),
          rgb: '255,110,25',
          rgbInner: '255,250,180',
          kind: 'flame',
          rotation: rand(-0.4, 0.4),
          rotationSpeed: rand(-0.06, 0.06),
          drag: 0.96,
          additive: true
        });
      }
      for (var sP = 0; sP < 28; sP += 1) {
        this._addParticle({
          x: e.target.x + rand(-26, 26),
          y: feetY,
          vx: rand(-2.2, 2.2),
          vy: rand(-7, -2.5),
          max: rand(35, 75),
          radius: rand(2.5, 5.5),
          rgb: '255,240,140',
          kind: 'sparkle',
          rotation: rand(0, 6.28),
          rotationSpeed: rand(-0.3, 0.3),
          additive: true
        });
      }
    }

    if (e.type === 'monster_frost_freeze') {
      e.maxAge = e.maxAge || 1200;
      e.state.lastCrystalSpawn = 0;
      e.state.rotation = 0;
      var feetYFrost = e.target.y;
      this._doFlash('160,230,255', 0.5);
      this._ring(e.target.x, feetYFrost, '180,240,255', 70, 5, 3.5);
      this._ring(e.target.x, feetYFrost, '120,210,255', 90, 3.2, 2);
      // Spawn burst of ice crystals wrapping the body from bottom edge up
      for (var cP = 0; cP < 34; cP += 1) {
        this._addParticle({
          x: e.target.x + rand(-36, 36),
          y: feetYFrost - rand(0, 110),
          vx: rand(-1.2, 1.2),
          vy: rand(-1.5, 0.5),
          max: rand(60, 105),
          radius: rand(7, 16),
          rgb: Math.random() < 0.6 ? '200,245,255' : '140,225,255',
          kind: 'ice_crystal',
          rotation: rand(0, 6.28),
          rotationSpeed: rand(-0.08, 0.08),
          drag: 0.94,
          additive: true
        });
      }
      for (var icSp = 0; icSp < 28; icSp += 1) {
        this._addParticle({
          x: e.target.x + rand(-32, 32),
          y: feetYFrost - rand(10, 100),
          vx: rand(-1.5, 1.5),
          vy: rand(-3, -0.6),
          max: rand(45, 85),
          radius: rand(2.8, 5.8),
          rgb: '255,255,255',
          kind: 'sparkle',
          rotation: rand(0, 6.28),
          rotationSpeed: rand(-0.25, 0.25),
          additive: true
        });
      }
    }

    if (e.type === 'celestial_strike') {
      e.maxAge = e.maxAge || 700;
      e.state.impacted = false;
      this._doFlash('255,245,180', 0.7);
      this._ring(e.target.x, e.target.y, '255,230,120', 65, 5.8, 3.8);
      this._ring(e.target.x, e.target.y, '255,255,255', 85, 3.5, 2);
    }

    if (e.type === 'hero_skin_aura') {
      e.maxAge = e.maxAge || 800;
    }

    // NOVOS EFEITOS DE MAGOS
    if (e.type === 'magic_prominence') {
      e.maxAge = e.maxAge || 1050;
      e.state.lastFlameSpawn = 0;
      e.state.rotation = 0;
      this._doFlash('255,100,20', 0.6);
      this._ring(e.target.x, e.target.y, '255,90,20', 80, 5.8, 4.2);
      this._ring(e.target.x, e.target.y, '255,210,80', 105, 4, 2.5);
    }

    if (e.type === 'magic_meteor') {
      e.maxAge = e.maxAge || 1200;
      e.state.impacted = false;
      e.state.meteorX = e.target.x - 180;
      e.state.meteorY = e.target.y - 320;
    }

    if (e.type === 'magic_hydro_blast') {
      e.maxAge = e.maxAge || 850;
      e.state.impacted = false;
      this._doFlash('100,210,255', 0.5);
      this._ring(e.target.x, e.target.y, '80,200,255', 75, 6.2, 3.8);
    }

    if (e.type === 'magic_hurricane') {
      e.maxAge = e.maxAge || 1100;
      e.state.rotation = 0;
      this._doFlash('100,240,190', 0.45);
      this._ring(e.target.x, e.target.y, '100,240,190', 70, 5.2, 3.2);
    }

    if (e.type === 'magic_lightning_surge') {
      e.maxAge = e.maxAge || 950;
      e.state.sparks = [];
      this._doFlash('150,240,255', 0.7);
      this._ring(e.target.x, e.target.y, '120,235,255', 85, 7.5, 4);
    }

    if (e.type === 'magic_death_spike') {
      e.maxAge = e.maxAge || 750;
      e.state.speed = e.speed || 8.5;
      e.state.impacted = false;
    }

    if (e.type === 'magic_vampiric_drain') {
      e.maxAge = e.maxAge || 950;
      e.state.rotation = 0;
      this._ring(e.target.x, e.target.y, '230,50,110', 65, 4.5, 3.2);
    }

    if (e.type === 'magic_dark_mire') {
      e.maxAge = e.maxAge || 1200;
      e.state.rotation = 0;
      e.state.lastSoulSpawn = 0;
      this._doFlash('140,40,220', 0.45);
      this._ring(e.target.x, e.target.y, '140,40,220', 78, 4.2, 3.5);
    }

    if (e.type === 'magic_solar_flare') {
      e.maxAge = e.maxAge || 750;
      e.state.impacted = false;
      this._doFlash('255,245,180', 0.85);
      this._ring(e.target.x, e.target.y, '255,235,120', 85, 6.5, 4.5);
    }

    if (e.type === 'magic_holy_sanctuary') {
      e.maxAge = e.maxAge || 1200;
      e.state.rotation = 0;
      this._doFlash('255,245,180', 0.55);
      this._ring(e.target.x, e.target.y, '255,245,160', 80, 4.8, 3.5);
    }

    // NOVOS EFEITOS DE GUERREIROS & ARQUEIROS
    if (e.type === 'snipe_shot') {
      e.maxAge = e.maxAge || 550;
      e.state.speed = e.speed || 16.0;
      e.state.impacted = false;
      this._doFlash('255,240,160', 0.55);
    }

    if (e.type === 'burst_fire') {
      e.maxAge = e.maxAge || 700;
      e.state.bullets = [
        { active: true, done: false, x: e.source.x, y: e.source.y - 6, delay: 0 },
        { active: false, done: false, x: e.source.x, y: e.source.y, delay: 80 },
        { active: false, done: false, x: e.source.x, y: e.source.y + 6, delay: 160 }
      ];
      e.state.speed = e.speed || 11.5;
    }

    if (e.type === 'seven_arrow') {
      e.maxAge = e.maxAge || 950;
      e.state.arrows = [];
      for (var saIdx = 0; saIdx < 7; saIdx++) {
        var offsetAngle = (saIdx - 3) * 0.14;
        e.state.arrows.push({
          x: e.source.x,
          y: e.source.y,
          angleOffset: offsetAngle,
          delay: saIdx * 45,
          active: false,
          done: false
        });
      }
      e.state.speed = e.speed || 8.2;
    }

    if (e.type === 'warrior_backstab') {
      e.maxAge = e.maxAge || 600;
      e.state.impacted = false;
      this._doFlash('220,30,60', 0.7);
      this._ring(e.target.x, e.target.y, '220,30,60', 70, 7.5, 4);
    }

    if (e.type === 'warrior_deadly_blow') {
      e.maxAge = e.maxAge || 550;
      e.state.impacted = false;
      this._doFlash('255,250,220', 0.6);
      this._ring(e.target.x, e.target.y, '255,240,220', 65, 7.2, 3.8);
    }

    if (e.type === 'warrior_sonic_storm') {
      e.maxAge = e.maxAge || 750;
      e.state.rotation = 0;
      this._doFlash('140,210,255', 0.6);
      this._ring(e.target.x, e.target.y, '140,210,255', 80, 6.5, 3.5);
    }

    if (e.type === 'warrior_triple_slash') {
      e.maxAge = e.maxAge || 650;
      e.state.impacted = false;
      this._doFlash('200,230,255', 0.55);
      this._ring(e.target.x, e.target.y, '200,230,255', 68, 6.8, 3.6);
    }

    if (e.type === 'warrior_earth_tremor') {
      e.maxAge = e.maxAge || 1050;
      e.state.impacted = false;
      this._doFlash('255,180,70', 0.6);
      this._ring(e.target.x, e.target.y, '220,150,60', 90, 6.5, 4.5);
      this._ring(e.target.x, e.target.y, '180,120,50', 115, 4.2, 2.8);
    }

    if (e.type === 'warrior_force_burst') {
      e.maxAge = e.maxAge || 800;
      e.state.rotation = 0;
      this._doFlash('255,170,40', 0.75);
      this._ring(e.target.x, e.target.y, '255,165,40', 75, 7.8, 4.2);
      this._ring(e.target.x, e.target.y, '255,230,120', 100, 5, 2.5);
    }

    if (e.type === 'warrior_spear_whirlwind') {
      e.maxAge = e.maxAge || 750;
      e.state.rotation = 0;
      this._doFlash('255,190,110', 0.55);
      this._ring(e.target.x, e.target.y, '255,190,110', 76, 6.2, 3.6);
    }

    if (e.type === 'holy_heal') {
      e.maxAge = e.maxAge || 950;
      this._ring(e.source.x, e.source.y, '100,255,160', 44, 4.2, 2.8);
      this._ring(e.source.x, e.source.y, '255,240,150', 58, 2.8, 1.6);
      this._doFlash('160,255,190', 0.35);
      for (var h = 0; h < 24; h += 1) {
        this._addParticle({
          x: e.source.x + rand(-24, 24),
          y: e.source.y + rand(-10, 20),
          vx: rand(-0.8, 0.8),
          vy: rand(-2.8, -1.2),
          max: rand(45, 80),
          radius: rand(2.5, 4.8),
          rgb: Math.random() < 0.6 ? '120,255,170' : '255,235,140',
          kind: 'sparkle',
          rotation: rand(0, 6.28),
          rotationSpeed: rand(-0.15, 0.15),
          additive: true
        });
      }
    }

    if (e.type === 'buff_aura') {
      e.maxAge = e.maxAge || 1100;
      this._ring(e.source.x, e.source.y, e.rgb, 46, 3.8, 3);
      this._doFlash(e.rgb, 0.3);
      for (var b = 0; b < 28; b += 1) {
        this._addParticle({
          x: e.source.x + rand(-20, 20),
          y: e.source.y + rand(-6, 18),
          vx: rand(-0.6, 0.6),
          vy: rand(-2.2, -0.8),
          max: rand(50, 95),
          radius: rand(2.2, 4.2),
          rgb: e.rgb,
          kind: 'sparkle',
          rotation: rand(0, 6.28),
          rotationSpeed: rand(-0.2, 0.2),
          additive: true
        });
      }
    }

    if (e.type === 'particles') {
      this._burst(e.target.x, e.target.y, e.rgb, 46, 4.5);
      e.done = true;
    }

    if (e.type === 'lightning') {
      var start = e.source;
      var end = e.target;
      var main = buildBolt(start, end, Math.min(this.width, this.height) * 0.2);
      var branches = [];
      for (var b = 0; b < 3; b += 1) {
        var at = main[Math.floor(Math.random() * Math.max(1, main.length * 0.55)) + 2];
        if (!at) continue;
        branches.push(buildBolt(at, {
          x: at.x + rand(-this.width * 0.22, this.width * 0.22),
          y: at.y + rand(20, this.height * 0.26)
        }, Math.min(this.width, this.height) * 0.1));
      }
      e.state.points = main;
      e.state.branches = branches;
      e.state.life = 0;
      e.maxAge = e.maxAge || 380;
      this._doFlash(e.rgb, 0.5);
    }

    if (e.type === 'arrow_rain') {
      var area = e.options.targetArea || {};
      e.state.cx = Number(area.x) || e.target.x;
      e.state.cy = Number(area.y) || e.target.y;
      e.state.width = Number(area.width) || 180;
      e.state.height = Number(area.height) || 70;
      e.state.count = e.options.arrowCount || 16;
      e.state.spawned = 0;
      e.state.arrows = [];
      e.state.stuck = [];
      e.maxAge = e.maxAge || 2600;
    }

    if (e.type === 'lights') {
      e.state.rings = [];
      e.maxAge = e.maxAge || 1400;
    }

    if (e.type === 'energy_slash' || e.type === 'spiral_spear') {
      this._drawCasterGlyph(e.source, e.rgb, 1);
    }
  };

  LineageVFX.prototype._drawCasterGlyph = function (p, rgb, pulse) {
    var ctx = this.ctx;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.strokeStyle = rgba(rgb, 0.35 + pulse * 0.45);
    ctx.lineWidth = 1.4;
    ctx.shadowColor = rgba(rgb, 0.8);
    ctx.shadowBlur = 12 * this.qualityConfig.blur;
    ctx.beginPath(); ctx.arc(0, 0, 15 * (1 + pulse * 0.2), 0, Math.PI * 2); ctx.stroke();
    ctx.rotate(this.time * 0.002);
    for (var i = 0; i < 6; i += 1) {
      ctx.rotate(Math.PI / 3);
      ctx.beginPath(); ctx.moveTo(19, 0); ctx.lineTo(25, 0); ctx.stroke();
    }
    ctx.restore();
  };

  LineageVFX.prototype._trail = function (e) {
    var s = e.state;
    var angle = s.angle;
    if (e.type === 'fireball') {
      for (var i = 0; i < 3; i += 1) this._addParticle({
        x: s.x + rand(-3, 3), y: s.y + rand(-3, 3),
        vx: -Math.cos(angle) * rand(0.4, 1.6) + rand(-0.4, 0.4),
        vy: -Math.sin(angle) * rand(0.4, 1.6) - rand(0, 0.6),
        max: rand(18, 40), radius: rand(1, 2.6), rgb: Math.random() < 0.6 ? '255,140,60' : '255,220,140', drag: 0.96
      });
      if (Math.random() < 0.35) this._addParticle({
        x: s.x, y: s.y, vx: rand(-0.3, 0.3), vy: rand(-0.5, 0), max: rand(34, 60),
        radius: rand(3, 6), rgb: '70,55,70', additive: false, kind: 'smoke'
      });
    }
    if (e.type === 'ice_shards') for (var j = 0; j < 2; j += 1) this._addParticle({
      x: s.x + rand(-4, 4), y: s.y + rand(-4, 4), vx: rand(-0.4, 0.4), vy: rand(-0.4, 0.4),
      max: rand(16, 32), radius: rand(0.7, 1.8), rgb: '170,236,255', drag: 0.95
    });
    if (e.type === 'wind_blast' && Math.random() < 0.8) this._addParticle({
      x: s.x + rand(-6, 6), y: s.y + rand(-18, 18),
      vx: -Math.cos(angle) * rand(1, 3), vy: -Math.sin(angle) * rand(1, 3) + rand(-0.5, 0.5),
      max: rand(14, 30), radius: rand(0.6, 1.6), rgb: e.rgb, drag: 0.95
    });
    if (e.type === 'wind_blast' && Math.random() < 0.18) this._addParticle({
      x: s.x, y: s.y + rand(-14, 14), vx: Math.cos(angle) * rand(1, 2.4), vy: rand(-0.8, 0.8),
      max: rand(36, 64), radius: rand(2, 3.6), rgb: '150,220,180', additive: false,
      kind: 'leaf', gravity: 0.03, drag: 0.98, rotation: rand(0, 6.28), rotationSpeed: rand(-0.35, 0.35)
    });
    if (e.type === 'wind_strike') {
      for (var ws = 0; ws < 2; ws += 1) {
        this._addParticle({
          x: s.x + rand(-4, 4), y: s.y + rand(-4, 4),
          vx: -Math.cos(angle) * rand(0.8, 2.4) + rand(-0.4, 0.4),
          vy: -Math.sin(angle) * rand(0.8, 2.4) + rand(-0.4, 0.4),
          max: rand(16, 32), radius: rand(1.2, 2.5),
          rgb: '130,245,210', drag: 0.95, kind: 'sparkle', additive: true
        });
      }
    }
    if (e.type === 'arcane_missile') for (var k = 0; k < 2; k += 1) this._addParticle({
      x: s.x + rand(-3, 3), y: s.y + rand(-3, 3), vx: rand(-0.5, 0.5), vy: rand(-0.5, 0.5),
      max: rand(16, 34), radius: rand(0.7, 1.9), rgb: Math.random() < 0.5 ? e.rgb : '235,225,255', drag: 0.95
    });
  };

  LineageVFX.prototype._impact = function (e, x, y) {
    var rgb = e.rgb;
    this._doFlash(rgb, 0.45);
    if (e.type === 'fireball') {
      this._ring(x, y, '255,150,70', 42, 6.2, 3.4);
      this._ring(x, y, '255,230,170', 56, 3.8, 1.8);
      this._burst(x, y, '255,122,69', 70, 6.6);
      for (var f = 0; f < 18; f += 1) this._addParticle({ x: x + rand(-14, 14), y: y + rand(-8, 8), vx: rand(-0.4, 0.4), vy: rand(-1.8, -0.5), max: rand(60, 110), radius: rand(6, 13), rgb: '70,55,70', additive: false, kind: 'smoke' });
    }
    if (e.type === 'ice_shards') {
      this._ring(x, y, '180,240,255', 46, 5.4, 2.9);
      for (var i = 0; i < 22; i += 1) {
        var a = Math.random() * Math.PI * 2;
        this._addParticle({ x: x, y: y, vx: Math.cos(a) * rand(1.2, 6.2), vy: Math.sin(a) * rand(1.2, 6.2) - 0.6, max: rand(42, 78), radius: rand(3.6, 8.2), rgb: '200,244,255', gravity: 0.12, drag: 0.985, kind: 'shard', rotation: rand(0, 6.28), rotationSpeed: rand(-0.27, 0.27) });
      }
    }
    if (e.type === 'wind_blast') {
      this._ring(x, y, '126,240,200', 44, 4.8, 2.4);
      this._burst(x, y, '126,240,200', 42, 5.2);
      for (var w = 0; w < 12; w += 1) this._addParticle({ x: x, y: y, vx: rand(-3.2, 3.2), vy: rand(-3.2, 1.3), max: rand(48, 86), radius: rand(3.1, 5.4), rgb: '150,220,180', additive: false, kind: 'leaf', gravity: 0.03, drag: 0.98, rotation: rand(0, 6.28), rotationSpeed: rand(-0.34, 0.34) });
    }
    if (e.type === 'wind_strike') {
      this._ring(x, y, '110,245,205', 52, 5.8, 3.2);
      this._ring(x, y, '210,255,235', 70, 3.6, 1.8);
      this._burst(x, y, '110,245,205', 60, 6.2);
      for (var ws = 0; ws < 16; ws += 1) {
        this._addParticle({
          x: x + rand(-12, 12),
          y: y + rand(-12, 12),
          vx: rand(-4.5, 4.5),
          vy: rand(-4.5, 2.0),
          max: rand(40, 75),
          radius: rand(2.8, 5.5),
          rgb: '150,245,215',
          additive: true,
          kind: 'leaf',
          gravity: 0.04,
          drag: 0.96,
          rotation: rand(0, 6.28),
          rotationSpeed: rand(-0.3, 0.3)
        });
      }
    }
    if (e.type === 'arcane_missile') {
      this._ring(x, y, rgb, 44, 5.8, 3);
      this._ring(x, y, '230,220,255', 58, 3.2, 1.3);
      this._burst(x, y, rgb, 58, 5.4);
      this._burst(x, y, '230,220,255', 30, 4.1);
    }
    if (e.type === 'energy_slash') {
      this._ring(x, y, '160,215,255', 36, 6, 3);
      this._burst(x, y, '200,230,255', 48, 6.2);
      this._drawCrossImpact(x, y, '200,230,255');
    }
    if (e.type === 'cross_slash') {
      this._ring(x, y, '232,236,247', 34, 6.6, 2.4);
      this._burst(x, y, '232,236,247', 42, 6.1);
    }
    if (e.type === 'spiral_spear') {
      this._ring(x, y, '255,190,120', 34, 5.6, 2.4);
      this._burst(x, y, '255,170,90', 40, 5.6);
    }
    if (e.type === 'double_shot') {
      this._ring(x, y, '255,220,100', 32, 6.4, 2.2);
      this._burst(x, y, '255,230,140', 28, 4.8);
      for (var ds = 0; ds < 8; ds += 1) {
        this._addParticle({ x: x, y: y, vx: rand(-3.5, 3.5), vy: rand(-3.5, 3.5), max: rand(20, 45), radius: rand(2, 3.8), rgb: '255,230,120', kind: 'sparkle', rotation: rand(0, 6.28), rotationSpeed: rand(-0.2, 0.2), additive: true });
      }
    }
    if (e.type === 'power_smash') {
      this._ring(x, y, '255,140,40', 52, 7.2, 4.2);
      this._ring(x, y, '255,220,120', 68, 4.2, 2.2);
      this._burst(x, y, '255,160,50', 65, 7.5);
      for (var ps = 0; ps < 16; ps += 1) {
        var ang = Math.random() * Math.PI * 2;
        this._addParticle({ x: x, y: y, vx: Math.cos(ang) * rand(2.5, 7.5), vy: Math.sin(ang) * rand(2.5, 7.5) - 1.2, max: rand(45, 85), radius: rand(3.5, 7.5), rgb: '255,180,60', gravity: 0.16, drag: 0.97, kind: 'shard', rotation: rand(0, 6.28), rotationSpeed: rand(-0.3, 0.3) });
      }
    }
    if (e.type === 'holy_beam') {
      this._ring(x, y, '255,245,180', 60, 5.2, 3.6);
      this._ring(x, y, '255,215,100', 80, 3.2, 1.8);
      this._burst(x, y, '255,240,160', 55, 6.2);
      for (var hb = 0; hb < 20; hb += 1) {
        this._addParticle({ x: x + rand(-18, 18), y: y + rand(-12, 12), vx: rand(-1.8, 1.8), vy: rand(-3.5, -0.8), max: rand(40, 80), radius: rand(2.8, 5.2), rgb: '255,240,150', kind: 'sparkle', rotation: rand(0, 6.28), rotationSpeed: rand(-0.15, 0.15), additive: true });
      }
    }
    if (e.type === 'dark_vortex') {
      this._ring(x, y, '180,90,255', 48, 4.4, 3);
      this._burst(x, y, '160,70,240', 48, 5.2);
      for (var dv = 0; dv < 14; dv += 1) {
        this._addParticle({ x: x + rand(-12, 12), y: y + rand(-12, 12), vx: rand(-1.2, 1.2), vy: rand(-1.8, 0.5), max: rand(50, 90), radius: rand(3, 6), rgb: '140,50,220', kind: 'soul_mote', additive: true });
      }
    }
    if (e.type === 'whirlwind') {
      this._ring(x, y, '180,225,255', 54, 6.2, 3.2);
      this._burst(x, y, '190,230,255', 46, 5.8);
      for (var ww = 0; ww < 16; ww += 1) {
        var wAng = Math.random() * Math.PI * 2;
        this._addParticle({ x: x, y: y, vx: Math.cos(wAng) * rand(2, 6), vy: Math.sin(wAng) * rand(2, 6), max: rand(30, 60), radius: rand(2.2, 4.5), rgb: '170,220,255', kind: 'shard', rotation: rand(0, 6.28), rotationSpeed: rand(-0.35, 0.35) });
      }
    }
    if (e.type === 'frost_slash') {
      this._ring(x, y, '160,235,255', 58, 7.5, 3.8);
      this._ring(x, y, '220,250,255', 78, 4.8, 2.2);
      this._burst(x, y, '140,225,255', 65, 7.5);
      for (var fs = 0; fs < 38; fs += 1) {
        var fsAng = Math.random() * Math.PI * 2;
        this._addParticle({
          x: x, y: y,
          vx: Math.cos(fsAng) * rand(2.5, 8.5),
          vy: Math.sin(fsAng) * rand(2.5, 8.5) - 0.8,
          max: rand(40, 80),
          radius: rand(3.5, 8.5),
          rgb: Math.random() < 0.6 ? '210,245,255' : '140,220,255',
          gravity: 0.12,
          drag: 0.98,
          kind: 'shard',
          rotation: rand(0, 6.28),
          rotationSpeed: rand(-0.35, 0.35)
        });
      }
      for (var fsSp = 0; fsSp < 24; fsSp += 1) {
        this._addParticle({
          x: x + rand(-20, 20), y: y + rand(-18, 18),
          vx: rand(-1.5, 1.5), vy: rand(-3.2, -0.6),
          max: rand(45, 85),
          radius: rand(2.5, 5.2),
          rgb: Math.random() < 0.5 ? '255,255,255' : '180,240,255',
          kind: 'sparkle',
          rotation: rand(0, 6.28),
          rotationSpeed: rand(-0.2, 0.2),
          additive: true
        });
      }
      for (var fsm = 0; fsm < 18; fsm += 1) {
        this._addParticle({
          x: x + rand(-22, 22), y: y + rand(-20, 20),
          vx: rand(-1.2, 1.2), vy: rand(-2, -0.2),
          max: rand(45, 90), radius: rand(8, 18),
          rgb: '180,240,255', kind: 'smoke', additive: true
        });
      }
    }
    if (e.type === 'frost_blizzard') {
      this._ring(x, y, '200,245,255', 85, 8.5, 4.5);
      this._ring(x, y, '130,210,255', 110, 5.8, 3);
      this._ring(x, y, '255,255,255', 135, 3.8, 2);
      this._burst(x, y, '180,240,255', 95, 10);
      for (var fb = 0; fb < 60; fb += 1) {
        var fbAng = Math.random() * Math.PI * 2;
        this._addParticle({
          x: x, y: y,
          vx: Math.cos(fbAng) * rand(3.5, 11),
          vy: Math.sin(fbAng) * rand(3.5, 11) - 1.5,
          max: rand(50, 100),
          radius: rand(4.5, 10),
          rgb: Math.random() < 0.5 ? '235,250,255' : '150,230,255',
          gravity: 0.14,
          drag: 0.975,
          kind: 'shard',
          rotation: rand(0, 6.28),
          rotationSpeed: rand(-0.4, 0.4)
        });
      }
      for (var fbSp = 0; fbSp < 36; fbSp += 1) {
        this._addParticle({
          x: x + rand(-35, 35), y: y + rand(-25, 25),
          vx: rand(-2.5, 2.5), vy: rand(-4.5, -1),
          max: rand(50, 95),
          radius: rand(3, 6.5),
          rgb: Math.random() < 0.6 ? '255,255,255' : '160,235,255',
          kind: 'sparkle',
          rotation: rand(0, 6.28),
          rotationSpeed: rand(-0.25, 0.25),
          additive: true
        });
      }
      for (var fbs = 0; fbs < 32; fbs += 1) {
        this._addParticle({
          x: x + rand(-35, 35), y: y + rand(-30, 30),
          vx: rand(-2.5, 2.5), vy: rand(-3, -0.5),
          max: rand(60, 120), radius: rand(12, 28),
          rgb: '160,230,255', kind: 'smoke', additive: true
        });
      }
    }
    if (e.type === 'inferno_slash') {
      this._ring(x, y, '255,100,40', 68, 8.2, 4.5);
      this._ring(x, y, '255,220,90', 92, 5.2, 2.6);
      this._burst(x, y, '255,120,40', 70, 9);
      for (var inf = 0; inf < 45; inf += 1) {
        var infAng = Math.random() * Math.PI * 2;
        this._addParticle({
          x: x, y: y,
          vx: Math.cos(infAng) * rand(3, 9.8),
          vy: Math.sin(infAng) * rand(3, 9.8) - 1.8,
          max: rand(45, 90),
          radius: rand(4, 9),
          rgb: Math.random() < 0.6 ? '255,190,60' : '255,80,30',
          gravity: 0.15,
          drag: 0.97,
          kind: 'shard',
          rotation: rand(0, 6.28),
          rotationSpeed: rand(-0.35, 0.35)
        });
      }
      for (var infSp = 0; infSp < 28; infSp += 1) {
        this._addParticle({
          x: x + rand(-20, 20), y: y + rand(-15, 15),
          vx: rand(-2, 2), vy: rand(-4, -1),
          max: rand(40, 80),
          radius: rand(2.8, 5.5),
          rgb: Math.random() < 0.5 ? '255,245,180' : '255,140,40',
          kind: 'sparkle',
          rotation: rand(0, 6.28),
          rotationSpeed: rand(-0.25, 0.25),
          additive: true
        });
      }
      for (var infS = 0; infS < 24; infS += 1) {
        this._addParticle({
          x: x + rand(-20, 20), y: y + rand(-18, 18),
          vx: rand(-1.2, 1.2), vy: rand(-2.8, -1),
          max: rand(50, 105), radius: rand(9, 22),
          rgb: '255,90,30', kind: 'smoke', additive: true
        });
      }
    }
    if (e.type === 'inferno_dragon_breath') {
      this._ring(x, y, '255,80,20', 88, 9, 5);
      this._ring(x, y, '255,180,40', 115, 6, 3);
      this._ring(x, y, '255,245,120', 140, 4.2, 2);
      this._burst(x, y, '255,100,20', 90, 11);
      for (var idb = 0; idb < 65; idb += 1) {
        var idbAng = Math.random() * Math.PI * 2;
        this._addParticle({
          x: x, y: y,
          vx: Math.cos(idbAng) * rand(3.5, 12),
          vy: Math.sin(idbAng) * rand(3.5, 12) - 2.2,
          max: rand(50, 105),
          radius: rand(4.5, 10),
          rgb: Math.random() < 0.5 ? '255,220,80' : (Math.random() < 0.8 ? '255,110,30' : '255,50,20'),
          gravity: 0.16,
          drag: 0.97,
          kind: 'shard',
          rotation: rand(0, 6.28),
          rotationSpeed: rand(-0.4, 0.4)
        });
      }
      for (var idbSp = 0; idbSp < 40; idbSp += 1) {
        this._addParticle({
          x: x + rand(-35, 35), y: y + rand(-25, 25),
          vx: rand(-3, 3), vy: rand(-5, -1.2),
          max: rand(45, 95),
          radius: rand(3.2, 6.8),
          rgb: Math.random() < 0.5 ? '255,255,200' : '255,160,50',
          kind: 'sparkle',
          rotation: rand(0, 6.28),
          rotationSpeed: rand(-0.3, 0.3),
          additive: true
        });
      }
      for (var idbS = 0; idbS < 36; idbS += 1) {
        this._addParticle({
          x: x + rand(-30, 30), y: y + rand(-25, 25),
          vx: rand(-2, 2), vy: rand(-3.5, -1),
          max: rand(60, 130), radius: rand(14, 30),
          rgb: '255,70,20', kind: 'smoke', additive: true
        });
      }
    }
    if (e.type === 'celestial_strike') {
      this._ring(x, y, '255,245,180', 68, 6.4, 3.8);
      this._ring(x, y, '255,220,100', 90, 4.2, 2);
      this._burst(x, y, '255,235,140', 65, 7.2);
      for (var cs = 0; cs < 28; cs += 1) {
        this._addParticle({
          x: x + rand(-20, 20), y: y + rand(-15, 15),
          vx: rand(-2.5, 2.5), vy: rand(-4, -0.8),
          max: rand(45, 85),
          radius: rand(3, 6),
          rgb: Math.random() < 0.6 ? '255,250,210' : '255,220,110',
          kind: 'sparkle',
          rotation: rand(0, 6.28),
          rotationSpeed: rand(-0.2, 0.2),
          additive: true
        });
      }
    }
  };

  LineageVFX.prototype._drawCrossImpact = function (x, y, rgb) {
    var ctx = this.ctx;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < 2; i += 1) {
      ctx.save();
      ctx.translate(x, y); ctx.rotate(i ? -Math.PI / 4 : Math.PI / 4);
      var gradient = ctx.createLinearGradient(-70, 0, 70, 0);
      gradient.addColorStop(0, rgba(rgb, 0));
      gradient.addColorStop(0.5, rgba(rgb, 0.9));
      gradient.addColorStop(1, rgba(rgb, 0));
      ctx.strokeStyle = gradient; ctx.lineWidth = 3; ctx.shadowColor = rgba(rgb, 0.9); ctx.shadowBlur = 16;
      ctx.beginPath(); ctx.moveTo(-70, 0); ctx.lineTo(70, 0); ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  };

  LineageVFX.prototype._updateProjectile = function (e, dt) {
    var s = e.state;
    s.x += Math.cos(s.angle) * s.speed * (dt / 16);
    s.y += Math.sin(s.angle) * s.speed * (dt / 16);
    this._trail(e);
    if (distance({ x: s.x, y: s.y }, e.target) < s.speed + 5 || distance(e.source, { x: s.x, y: s.y }) > s.distance + 50) {
      this._impact(e, e.target.x, e.target.y);
      e.done = true;
    }
  };

  LineageVFX.prototype._updateArrowRain = function (e, dt) {
    var s = e.state;
    var spawnEvery = (e.maxAge * 0.55) / s.count;
    while (s.spawned < s.count && e.age > s.spawned * spawnEvery) {
      s.spawned += 1;
      s.arrows.push({
        x: s.cx + rand(-s.width / 2, s.width / 2), y: -24,
        vx: rand(1.6, 2.6), vy: rand(6.4, 8), age: 0
      });
    }
    for (var i = s.arrows.length - 1; i >= 0; i -= 1) {
      var a = s.arrows[i];
      a.x += a.vx * (dt / 16); a.y += a.vy * (dt / 16); a.vy += 0.1 * (dt / 16);
      if (a.y >= s.cy) {
        s.stuck.push({ x: a.x, y: s.cy, angle: Math.atan2(a.vy, a.vx), age: 0 });
        this._burst(a.x, s.cy, '120,105,95', 5, 1.8);
        this._burst(a.x, s.cy, '217,176,106', 3, 1.6);
        s.arrows.splice(i, 1);
      }
    }
    for (var j = s.stuck.length - 1; j >= 0; j -= 1) {
      s.stuck[j].age += dt;
      if (s.stuck[j].age > 2200) s.stuck.splice(j, 1);
    }
    if (e.age > e.maxAge && s.arrows.length === 0) e.done = true;
  };

  LineageVFX.prototype._update = function (e, dt) {
    e.age += dt;
    if (e.type === 'fireball' || e.type === 'ice_shards' || e.type === 'wind_blast' || e.type === 'wind_strike' || e.type === 'arcane_missile' || e.type === 'energy_slash' || e.type === 'spiral_spear' || e.type === 'snipe_shot' || e.type === 'magic_death_spike') {
      this._updateProjectile(e, dt);
    } else if (e.type === 'arrow_rain') {
      this._updateArrowRain(e, dt);
    } else if (e.type === 'cross_slash') {
      if (!e.state.impacted && e.age >= 255) {
        e.state.impacted = true;
        this._impact(e, e.target.x, e.target.y);
      }
      if (e.age > (e.maxAge || 560)) e.done = true;
    } else if (e.maxAge && e.age >= e.maxAge) {
      e.done = true;
    }
  };

  LineageVFX.prototype._drawProjectile = function (e) {
    var ctx = this.ctx, s = e.state, rgb = e.rgb;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    if (e.type === 'fireball') {
      var wobble = Math.sin(e.age * 0.01) * 2;
      var fx = s.x - Math.sin(s.angle) * wobble, fy = s.y + Math.cos(s.angle) * wobble;
      var fire = ctx.createRadialGradient(fx, fy, 0, fx, fy, 26);
      fire.addColorStop(0, 'rgba(255,245,210,0.95)'); fire.addColorStop(0.3, rgba(rgb, 0.7)); fire.addColorStop(1, rgba(rgb, 0));
      ctx.fillStyle = fire; ctx.beginPath(); ctx.arc(fx, fy, 26, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,250,235,0.95)'; ctx.beginPath(); ctx.arc(fx, fy, 5.5, 0, Math.PI * 2); ctx.fill();
    }
    if (e.type === 'ice_shards') {
      for (var i = -1; i <= 1; i += 1) {
        var off = i * 7, ix = s.x - Math.sin(s.angle) * off, iy = s.y + Math.cos(s.angle) * off, len = i === 0 ? 16 : 10;
        ctx.save(); ctx.translate(ix, iy); ctx.rotate(s.angle); ctx.fillStyle = i === 0 ? 'rgba(235,250,255,0.95)' : 'rgba(150,230,255,0.7)'; ctx.shadowColor = rgba(rgb, 0.9); ctx.shadowBlur = 14;
        ctx.beginPath(); ctx.moveTo(len, 0); ctx.lineTo(-len * 0.5, 3.4); ctx.lineTo(-len * 0.5, -3.4); ctx.closePath(); ctx.fill(); ctx.restore();
      }
    }
    if (e.type === 'wind_blast') {
      var px = -Math.sin(s.angle), py = Math.cos(s.angle);
      for (var w = 0; w < 3; w += 1) {
        var back = w * 16, bx = s.x - Math.cos(s.angle) * back, by = s.y - Math.sin(s.angle) * back, spread = 20 - w * 4;
        ctx.strokeStyle = rgba(rgb, 0.6 - w * 0.16); ctx.lineWidth = 2 - w * 0.4; ctx.shadowColor = rgba(rgb, 0.7); ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.moveTo(bx - Math.cos(s.angle) * 26 + px * spread, by - Math.sin(s.angle) * 26 + py * spread); ctx.quadraticCurveTo(bx + px * spread * 1.7, by + py * spread * 1.7, bx + Math.cos(s.angle) * 22 + px * spread * 0.4, by + Math.sin(s.angle) * 22 + py * spread * 0.4); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(bx - Math.cos(s.angle) * 26 - px * spread, by - Math.sin(s.angle) * 26 - py * spread); ctx.quadraticCurveTo(bx - px * spread * 1.7, by - py * spread * 1.7, bx + Math.cos(s.angle) * 22 - px * spread * 0.4, by + Math.sin(s.angle) * 22 - py * spread * 0.4); ctx.stroke();
      }
    }
    if (e.type === 'arcane_missile') {
      var arc = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 20); arc.addColorStop(0, 'rgba(240,235,255,0.95)'); arc.addColorStop(0.35, rgba(rgb, 0.65)); arc.addColorStop(1, rgba(rgb, 0));
      ctx.fillStyle = arc; ctx.beginPath(); ctx.arc(s.x, s.y, 20, 0, Math.PI * 2); ctx.fill();
      for (var a = 0; a < 2; a += 1) { var orbit = e.age * 0.006 + a * Math.PI; ctx.fillStyle = 'rgba(235,225,255,0.9)'; ctx.beginPath(); ctx.arc(s.x + Math.cos(orbit) * 12, s.y + Math.sin(orbit) * 12, 2.2, 0, Math.PI * 2); ctx.fill(); }
    }
    if (e.type === 'spiral_spear') {
      ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(e.age * 0.035); ctx.strokeStyle = 'rgba(255,200,140,0.95)'; ctx.lineWidth = 2.4; ctx.shadowColor = rgba(rgb, 0.9); ctx.shadowBlur = 14;
      ctx.beginPath(); ctx.moveTo(-17, 0); ctx.lineTo(17, 0); ctx.stroke(); ctx.fillStyle = 'rgba(255,245,225,0.95)'; ctx.beginPath(); ctx.moveTo(21, 0); ctx.lineTo(14, -3.4); ctx.lineTo(14, 3.4); ctx.closePath(); ctx.fill(); ctx.restore();
    }
    ctx.restore();
  };

  LineageVFX.prototype._drawEnergySlash = function (e) {
    var ctx = this.ctx, s = e.state, grow = clamp(e.age / 190, 0, 1), height = 38 * grow, body = 44 * grow;
    ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.angle); ctx.globalCompositeOperation = 'lighter';
    var gradient = ctx.createLinearGradient(-6, 0, body, 0); gradient.addColorStop(0, 'rgba(255,255,255,0.95)'); gradient.addColorStop(0.45, rgba(e.rgb, 0.75)); gradient.addColorStop(1, 'rgba(60,120,255,0)');
    ctx.fillStyle = gradient; ctx.shadowColor = rgba(e.rgb, 0.95); ctx.shadowBlur = 26 * this.qualityConfig.blur;
    ctx.beginPath(); ctx.moveTo(-4, -height); ctx.quadraticCurveTo(body, 0, -4, height); ctx.quadraticCurveTo(body * 0.32, 0, -4, -height); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(240,250,255,0.9)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-4, -height); ctx.quadraticCurveTo(body, 0, -4, height); ctx.stroke();
    ctx.restore();
  };

  LineageVFX.prototype._drawLightning = function (e) {
    var ctx = this.ctx, alpha = Math.max(0, 1 - e.age / e.maxAge);
    if (alpha <= 0) return;
    var drawBolt = function (points, amount, color, width, blur) {
      ctx.beginPath(); ctx.moveTo(points[0].x, points[0].y);
      for (var i = 1; i < points.length; i += 1) ctx.lineTo(points[i].x, points[i].y);
      ctx.strokeStyle = color; ctx.lineWidth = width; ctx.shadowColor = 'rgba(110,231,255,0.9)'; ctx.shadowBlur = blur; ctx.stroke(); ctx.shadowBlur = 0;
    };
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    drawBolt(e.state.points, alpha * 0.5, rgba('110,200,255', alpha * 0.5), 5, 22);
    drawBolt(e.state.points, alpha, rgba('240,252,255', alpha), 1.4, 8);
    for (var i = 0; i < e.state.branches.length; i += 1) drawBolt(e.state.branches[i], alpha * 0.7, rgba('140,215,255', alpha * 0.7), 1.2, 8);
    ctx.restore();
  };

  LineageVFX.prototype._drawArrow = function (a, alpha) {
    var ctx = this.ctx, angle = Math.atan2(a.vy, a.vx);
    ctx.save(); ctx.translate(a.x, a.y); ctx.rotate(angle); ctx.globalAlpha = alpha == null ? 1 : alpha;
    ctx.strokeStyle = 'rgba(220,220,230,0.25)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-34, 0); ctx.lineTo(-14, 0); ctx.stroke();
    ctx.strokeStyle = 'rgba(210,175,120,0.95)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-13, 0); ctx.lineTo(11, 0); ctx.stroke();
    ctx.fillStyle = 'rgba(240,245,255,0.95)'; ctx.beginPath(); ctx.moveTo(15, 0); ctx.lineTo(9, -3); ctx.lineTo(9, 3); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(230,120,90,0.9)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-13, 0); ctx.lineTo(-17, -4); ctx.moveTo(-10, 0); ctx.lineTo(-14, 4); ctx.stroke(); ctx.restore();
  };

  LineageVFX.prototype._drawArrowRain = function (e) {
    var ctx = this.ctx, s = e.state;
    var telegraphAlpha = clamp(e.age / 300, 0, 1) * (e.age > 1900 ? clamp(1 - (e.age - 1900) / 500, 0, 1) : 1);
    if (telegraphAlpha > 0) {
      ctx.save(); ctx.strokeStyle = rgba(e.rgb, telegraphAlpha * 0.5); ctx.setLineDash([6, 6]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(s.cx, s.cy, s.width / 2, s.height / 2, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
    for (var i = 0; i < s.arrows.length; i += 1) this._drawArrow(s.arrows[i]);
    for (var j = 0; j < s.stuck.length; j += 1) {
      var arrow = s.stuck[j], alpha = clamp(1 - arrow.age / 2200, 0, 1);
      ctx.save(); ctx.translate(arrow.x, arrow.y); ctx.rotate(arrow.angle); ctx.globalAlpha = alpha; ctx.strokeStyle = 'rgba(210,175,120,0.95)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(2, 0); ctx.stroke(); ctx.strokeStyle = 'rgba(230,120,90,0.9)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(-20, -4); ctx.moveTo(-13, 0); ctx.lineTo(-17, 4); ctx.stroke(); ctx.restore();
    }
  };

  LineageVFX.prototype._drawCrossSlash = function (e) {
    var ctx = this.ctx, p = e.target, first = clamp(e.age / 145, 0, 1), second = clamp((e.age - 110) / 145, 0, 1), fade = clamp(1 - Math.max(0, e.age - 360) / 200, 0, 1), length = 84;
    var draw = function (angle, progress) {
      if (progress <= 0) return;
      var len = length * (1 - Math.pow(1 - progress, 3));
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(angle);
      var gradient = ctx.createLinearGradient(-len / 2, 0, len / 2, 0); gradient.addColorStop(0, rgba('124,196,255', 0)); gradient.addColorStop(0.5, rgba('255,255,255', 0.95 * fade)); gradient.addColorStop(1, rgba('124,196,255', 0));
      ctx.strokeStyle = gradient; ctx.lineWidth = 3.5 * (1 - progress * 0.4); ctx.shadowColor = rgba('160,215,255', 0.95); ctx.shadowBlur = 18; ctx.beginPath(); ctx.moveTo(-len / 2, 0); ctx.lineTo(len / 2, 0); ctx.stroke(); ctx.restore();
    };
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; draw(Math.PI / 4, first); draw(-Math.PI / 4, second); ctx.restore();
  };

  LineageVFX.prototype._drawHolyHeal = function (e) {
    var ctx = this.ctx, p = e.source, progress = clamp(e.age / e.maxAge, 0, 1), fade = 1 - progress;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    var angle = e.age * 0.003;
    
    // Círculo mágico de cura no chão (aos pés do herói)
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(1, 0.36);
    ctx.rotate(angle);
    ctx.strokeStyle = rgba('100,255,160', fade * 0.9);
    ctx.lineWidth = 2.4;
    ctx.shadowColor = 'rgba(100,255,160,0.95)';
    ctx.shadowBlur = 16;
    ctx.beginPath(); ctx.arc(0, 0, 44, 0, Math.PI * 2); ctx.stroke();
    for (var i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      ctx.beginPath(); ctx.moveTo(-44, 0); ctx.lineTo(44, 0); ctx.stroke();
    }
    ctx.restore();

    // Pilares sagrados de luz ascendente subindo dos pés
    for (var b = -1; b <= 1; b++) {
      var bx = p.x + b * 18, h = 135 * clamp(e.age / 240, 0, 1);
      var beam = ctx.createLinearGradient(bx, p.y, bx, p.y - h);
      beam.addColorStop(0, rgba('100,255,160', fade * 0.8));
      beam.addColorStop(0.45, rgba('255,245,180', fade * 0.95));
      beam.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = beam;
      ctx.fillRect(bx - 6, p.y - h, 12, h);
    }
    ctx.restore();
  };

  LineageVFX.prototype._drawBuffAura = function (e) {
    var ctx = this.ctx, p = e.source, progress = clamp(e.age / e.maxAge, 0, 1), fade = 1 - progress;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    var waveY = p.y - (progress * 60);
    ctx.save();
    ctx.translate(p.x, waveY);
    ctx.scale(1, 0.35);
    ctx.strokeStyle = rgba(e.rgb, fade * 0.85);
    ctx.lineWidth = 3;
    ctx.shadowColor = rgba(e.rgb, 0.95);
    ctx.shadowBlur = 18;
    ctx.beginPath(); ctx.arc(0, 0, 32 * (0.8 + progress * 0.4), 0, Math.PI * 2); ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(1, 0.35);
    ctx.rotate(e.age * 0.004);
    ctx.strokeStyle = rgba(e.rgb, fade * 0.6);
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(0, 0, 42, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
    ctx.restore();
  };

  LineageVFX.prototype._drawDoubleShot = function (e, dt) {
    var s = e.state, speed = s.speed * (dt / 16);
    var targetDist = distance(e.source, e.target);
    var angle = Math.atan2(e.target.y - e.source.y, e.target.x - e.source.x);

    if (s.arrow1 && !s.arrow1.done) {
      s.arrow1.x += Math.cos(angle) * speed;
      s.arrow1.y += Math.sin(angle) * speed;
      this._drawArrow({ x: s.arrow1.x, y: s.arrow1.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed }, 1);
      if (distance(e.source, s.arrow1) >= targetDist) {
        s.arrow1.done = true;
        this._impact(e, e.target.x, e.target.y - 4);
      }
    }
    if (s.arrow2) {
      if (!s.arrow2.active && e.age >= s.arrow2.delay) s.arrow2.active = true;
      if (s.arrow2.active && !s.arrow2.done) {
        s.arrow2.x += Math.cos(angle) * speed;
        s.arrow2.y += Math.sin(angle) * speed;
        this._drawArrow({ x: s.arrow2.x, y: s.arrow2.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed }, 1);
        if (distance(e.source, s.arrow2) >= targetDist) {
          s.arrow2.done = true;
          this._impact(e, e.target.x, e.target.y + 4);
        }
      }
    }
    if (s.arrow1 && s.arrow1.done && s.arrow2 && s.arrow2.done) e.done = true;
  };

  LineageVFX.prototype._drawPowerSmash = function (e) {
    var ctx = this.ctx, p = e.target, progress = clamp(e.age / e.maxAge, 0, 1), fade = 1 - progress;
    if (!e.state.impacted && e.age >= 100) {
      e.state.impacted = true;
      this._impact(e, p.x, p.y);
    }
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    var slashLen = 75 * clamp(e.age / 120, 0, 1);
    ctx.save();
    ctx.translate(p.x, p.y);
    var grad = ctx.createLinearGradient(0, -slashLen, 0, slashLen * 0.4);
    grad.addColorStop(0, 'rgba(255,255,255,0)');
    grad.addColorStop(0.4, rgba(e.rgb, fade * 0.95));
    grad.addColorStop(1, rgba('255,245,180', fade));
    ctx.strokeStyle = grad;
    ctx.lineWidth = 6 * fade;
    ctx.shadowColor = rgba(e.rgb, 0.95);
    ctx.shadowBlur = 24;
    ctx.beginPath(); ctx.moveTo(0, -slashLen); ctx.lineTo(0, slashLen * 0.4); ctx.stroke();
    ctx.lineWidth = 3 * fade;
    ctx.beginPath(); ctx.moveTo(-slashLen * 0.6, slashLen * 0.3); ctx.lineTo(slashLen * 0.6, slashLen * 0.3); ctx.stroke();
    ctx.restore();
    ctx.restore();
  };

  LineageVFX.prototype._drawDarkVortex = function (e) {
    var ctx = this.ctx, p = e.target, progress = clamp(e.age / e.maxAge, 0, 1), fade = 1 - progress;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    e.state.angle -= 0.08;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(e.state.angle);
    for (var v = 0; v < 3; v++) {
      ctx.rotate((Math.PI * 2) / 3);
      var vGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, 36);
      vGrad.addColorStop(0, rgba('230,170,255', fade * 0.9));
      vGrad.addColorStop(0.5, rgba('160,70,240', fade * 0.6));
      vGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = vGrad;
      ctx.beginPath(); ctx.ellipse(18, 0, 22, 9, 0.4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();

    var heroP = e.source;
    var tProgress = clamp((e.age - 150) / 450, 0, 1);
    if (tProgress > 0 && tProgress < 1) {
      var curX = p.x + (heroP.x - p.x) * tProgress;
      var curY = p.y + (heroP.y - p.y) * tProgress + Math.sin(tProgress * Math.PI) * -35;
      ctx.fillStyle = rgba('200,120,255', fade * 0.95);
      ctx.shadowColor = 'rgba(180,90,255,0.9)';
      ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.arc(curX, curY, 4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  };

  LineageVFX.prototype._drawHolyBeam = function (e) {
    var ctx = this.ctx, p = e.target, progress = clamp(e.age / e.maxAge, 0, 1), fade = 1 - progress;
    if (!e.state.impacted && e.age >= 60) {
      e.state.impacted = true;
      this._impact(e, p.x, p.y);
    }
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    var beamGrad = ctx.createLinearGradient(p.x - 20, 0, p.x + 20, 0);
    beamGrad.addColorStop(0, 'rgba(255,255,255,0)');
    beamGrad.addColorStop(0.5, rgba('255,245,200', fade * 0.95));
    beamGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = beamGrad;
    ctx.fillRect(p.x - 24, 0, 48, p.y);
    ctx.fillStyle = rgba('255,255,255', fade);
    ctx.fillRect(p.x - 8, 0, 16, p.y);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(1, 0.35);
    ctx.rotate(e.age * 0.005);
    ctx.strokeStyle = rgba('255,220,100', fade * 0.9);
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(255,220,100,0.95)';
    ctx.shadowBlur = 18;
    ctx.beginPath(); ctx.arc(0, 0, 44, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
    ctx.restore();
  };

  LineageVFX.prototype._drawWhirlwind = function (e) {
    var ctx = this.ctx, p = e.target, progress = clamp(e.age / e.maxAge, 0, 1), fade = 1 - progress;
    e.state.rotation += 0.18;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(p.x, p.y);
    ctx.rotate(e.state.rotation);
    for (var w = 0; w < 3; w++) {
      ctx.rotate((Math.PI * 2) / 3);
      var wGrad = ctx.createLinearGradient(-35, 0, 35, 0);
      wGrad.addColorStop(0, 'rgba(255,255,255,0)');
      wGrad.addColorStop(0.5, rgba('180,225,255', fade * 0.9));
      wGrad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = wGrad;
      ctx.lineWidth = 3.5;
      ctx.shadowColor = 'rgba(180,225,255,0.95)';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(0, 0, 36 + w * 4, 0, Math.PI * 0.85);
      ctx.stroke();
    }
    ctx.restore();
  };

  LineageVFX.prototype._drawFrostSlash = function (e) {
    var ctx = this.ctx, p = e.target, progress = clamp(e.age / e.maxAge, 0, 1), fade = 1 - progress;
    if (!e.state.impacted && e.age >= 60) {
      e.state.impacted = true;
      this._impact(e, p.x, p.y);
    }
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(p.x, p.y);
    ctx.rotate(-0.45);

    // Dynamic crystalline crescent slash
    var slashLen = 65 * (0.4 + progress * 0.6);
    var slashThick = 9 * (1 - Math.pow(progress, 2));

    var grad = ctx.createLinearGradient(-slashLen, -slashLen * 0.4, slashLen, slashLen * 0.4);
    grad.addColorStop(0, 'rgba(255,255,255,0)');
    grad.addColorStop(0.3, rgba('180,240,255', fade * 0.95));
    grad.addColorStop(0.5, rgba('255,255,255', fade));
    grad.addColorStop(0.7, rgba('110,210,255', fade * 0.85));
    grad.addColorStop(1, 'rgba(110,210,255,0)');

    ctx.strokeStyle = grad;
    ctx.lineWidth = slashThick;
    ctx.lineCap = 'round';
    ctx.shadowColor = 'rgba(140,225,255,0.95)';
    ctx.shadowBlur = 24 * this.qualityConfig.blur;

    ctx.beginPath();
    ctx.arc(0, 0, slashLen, Math.PI * 0.75, Math.PI * 1.5);
    ctx.stroke();

    // Secondary ice crystal flare
    ctx.lineWidth = slashThick * 0.4;
    ctx.strokeStyle = rgba('255,255,255', fade * 0.9);
    ctx.beginPath();
    ctx.arc(0, 0, slashLen * 0.9, Math.PI * 0.8, Math.PI * 1.45);
    ctx.stroke();

    ctx.restore();
  };

  LineageVFX.prototype._drawFrostBlizzard = function (e) {
    var ctx = this.ctx, p = e.target, progress = clamp(e.age / e.maxAge, 0, 1), fade = 1 - progress;
    if (!e.state.impacted && e.age >= 80) {
      e.state.impacted = true;
      this._impact(e, p.x, p.y);
    }
    e.state.rotation += 0.16;

    // Sub-zero frost storm ring and swirling blizzard winds
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(p.x, p.y);

    // Blizzard ground frost glyph
    ctx.save();
    ctx.scale(1, 0.45);
    ctx.rotate(e.state.rotation * 0.4);
    var stormGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 85);
    stormGrad.addColorStop(0, rgba('210,245,255', fade * 0.7));
    stormGrad.addColorStop(0.4, rgba('100,200,255', fade * 0.5));
    stormGrad.addColorStop(0.8, rgba('50,150,255', fade * 0.25));
    stormGrad.addColorStop(1, 'rgba(0,100,255,0)');
    ctx.fillStyle = stormGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 85, 0, Math.PI * 2);
    ctx.fill();

    // Frost runes / spikes in hexagram pattern
    ctx.strokeStyle = rgba('220,250,255', fade * 0.85);
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(140,225,255,0.9)';
    ctx.shadowBlur = 14;
    for (var r = 0; r < 6; r++) {
      ctx.rotate(Math.PI / 3);
      ctx.beginPath();
      ctx.moveTo(0, 20);
      ctx.lineTo(0, 75);
      ctx.moveTo(-10, 50);
      ctx.lineTo(0, 65);
      ctx.lineTo(10, 50);
      ctx.stroke();
    }
    ctx.restore();

    // Whirling sub-zero icy blades
    ctx.rotate(e.state.rotation);
    for (var b = 0; b < 4; b++) {
      ctx.rotate(Math.PI / 2);
      var bGrad = ctx.createLinearGradient(-45, 0, 45, 0);
      bGrad.addColorStop(0, 'rgba(255,255,255,0)');
      bGrad.addColorStop(0.5, rgba('180,240,255', fade * 0.95));
      bGrad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = bGrad;
      ctx.lineWidth = 4;
      ctx.shadowColor = 'rgba(160,235,255,0.95)';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(0, 0, 48 + b * 6, 0, Math.PI * 0.7);
      ctx.stroke();
    }

    ctx.restore();
  };

  LineageVFX.prototype._drawInfernoSlash = function (e) {
    var ctx = this.ctx, p = e.target, progress = clamp(e.age / e.maxAge, 0, 1), fade = 1 - progress;
    if (!e.state.impacted && e.age >= 60) {
      e.state.impacted = true;
      this._impact(e, p.x, p.y);
    }
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(p.x, p.y);
    ctx.rotate(0.38);

    var slashLen = 70 * (0.4 + progress * 0.6);
    var slashThick = 11 * (1 - Math.pow(progress, 2));

    var grad = ctx.createLinearGradient(-slashLen, -slashLen * 0.3, slashLen, slashLen * 0.3);
    grad.addColorStop(0, 'rgba(255,50,0,0)');
    grad.addColorStop(0.25, rgba('255,120,40', fade * 0.95));
    grad.addColorStop(0.5, rgba('255,245,180', fade));
    grad.addColorStop(0.75, rgba('255,80,20', fade * 0.85));
    grad.addColorStop(1, 'rgba(255,50,0,0)');

    ctx.strokeStyle = grad;
    ctx.lineWidth = slashThick;
    ctx.lineCap = 'round';
    ctx.shadowColor = 'rgba(255,100,20,0.95)';
    ctx.shadowBlur = 26 * this.qualityConfig.blur;

    ctx.beginPath();
    ctx.arc(0, 0, slashLen, Math.PI * 0.7, Math.PI * 1.55);
    ctx.stroke();

    // Hot molten core line
    ctx.lineWidth = slashThick * 0.35;
    ctx.strokeStyle = rgba('255,255,220', fade * 0.95);
    ctx.beginPath();
    ctx.arc(0, 0, slashLen * 0.95, Math.PI * 0.75, Math.PI * 1.5);
    ctx.stroke();

    ctx.restore();
  };

  LineageVFX.prototype._drawInfernoDragonBreath = function (e) {
    var ctx = this.ctx, p = e.target, progress = clamp(e.age / e.maxAge, 0, 1), fade = 1 - progress;
    if (!e.state.impacted && e.age >= 75) {
      e.state.impacted = true;
      this._impact(e, p.x, p.y);
    }
    e.state.rotation += 0.14;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(p.x, p.y);

    // 1. Molten Dragon Ground Rune (pentagram of magma fire)
    ctx.save();
    ctx.scale(1, 0.45);
    ctx.rotate(e.state.rotation * 0.3);

    var floorGrad = ctx.createRadialGradient(0, 0, 8, 0, 0, 95);
    floorGrad.addColorStop(0, rgba('255,245,180', fade * 0.8));
    floorGrad.addColorStop(0.35, rgba('255,120,30', fade * 0.6));
    floorGrad.addColorStop(0.75, rgba('220,50,10', fade * 0.3));
    floorGrad.addColorStop(1, 'rgba(180,20,0,0)');
    ctx.fillStyle = floorGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 95, 0, Math.PI * 2);
    ctx.fill();

    // Dragon pentagram star in molten gold
    ctx.strokeStyle = rgba('255,210,90', fade * 0.9);
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(255,100,20,0.95)';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    for (var d = 0; d < 5; d++) {
      var dAng = (d * 4 * Math.PI) / 5 - Math.PI / 2;
      var dx = Math.cos(dAng) * 75;
      var dy = Math.sin(dAng) * 75;
      if (d === 0) ctx.moveTo(dx, dy); else ctx.lineTo(dx, dy);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();

    // 2. Swirling Dragon Fire Claws / Wings
    ctx.rotate(e.state.rotation);
    for (var c = 0; c < 3; c++) {
      ctx.rotate((Math.PI * 2) / 3);
      var clawGrad = ctx.createLinearGradient(-55, 0, 55, 0);
      clawGrad.addColorStop(0, 'rgba(255,50,0,0)');
      clawGrad.addColorStop(0.3, rgba('255,120,40', fade * 0.95));
      clawGrad.addColorStop(0.6, rgba('255,240,180', fade));
      clawGrad.addColorStop(1, 'rgba(255,60,0,0)');
      ctx.strokeStyle = clawGrad;
      ctx.lineWidth = 5.5;
      ctx.shadowColor = 'rgba(255,90,20,0.95)';
      ctx.shadowBlur = 22 * this.qualityConfig.blur;
      ctx.beginPath();
      ctx.arc(0, 0, 56 + c * 8, 0, Math.PI * 0.75);
      ctx.stroke();
    }

    // 3. Central Dragon Eye Flare
    var eyeGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 28 * (1 - progress * 0.4));
    eyeGrad.addColorStop(0, rgba('255,255,230', fade));
    eyeGrad.addColorStop(0.4, rgba('255,180,50', fade * 0.85));
    eyeGrad.addColorStop(1, 'rgba(255,60,0,0)');
    ctx.fillStyle = eyeGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 28, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  LineageVFX.prototype._drawCelestialStrike = function (e) {
    var ctx = this.ctx, p = e.target, progress = clamp(e.age / e.maxAge, 0, 1), fade = 1 - progress;
    if (!e.state.impacted && e.age >= 60) {
      e.state.impacted = true;
      this._impact(e, p.x, p.y);
    }
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // Soft radiant column of divine sunlight (translucent, non-blinding)
    var beamWidth = 40 * (1 - progress * 0.25);
    var beamH = p.y;
    var beamGrad = ctx.createLinearGradient(p.x - beamWidth / 2, 0, p.x + beamWidth / 2, 0);
    beamGrad.addColorStop(0, 'rgba(255,220,100,0)');
    beamGrad.addColorStop(0.3, rgba('255,235,140', fade * 0.38));
    beamGrad.addColorStop(0.5, rgba('255,255,240', fade * 0.52));
    beamGrad.addColorStop(0.7, rgba('255,235,140', fade * 0.38));
    beamGrad.addColorStop(1, 'rgba(255,220,100,0)');

    ctx.fillStyle = beamGrad;
    ctx.shadowColor = 'rgba(255,215,80,0.8)';
    ctx.shadowBlur = 18 * this.qualityConfig.blur;
    ctx.fillRect(p.x - beamWidth / 2, 0, beamWidth, beamH);

    // Divine rotating solar seal on the ground
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(1, 0.38);
    ctx.rotate(e.age * 0.006);
    ctx.strokeStyle = rgba('255,235,120', fade * 0.95);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 52, 0, Math.PI * 2);
    ctx.stroke();

    // 8-point celestial star
    for (var s = 0; s < 4; s++) {
      ctx.rotate(Math.PI / 4);
      ctx.beginPath();
      ctx.moveTo(-45, 0);
      ctx.lineTo(45, 0);
      ctx.stroke();
    }
    ctx.restore();

    ctx.restore();
  };

  LineageVFX.prototype._drawHeroSkinAura = function (e) {
    var ctx = this.ctx, p = e.source, progress = clamp(e.age / e.maxAge, 0, 1), fade = 1 - progress;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(p.x, p.y); // feet of hero
    ctx.scale(1, 0.4);

    var auraRad = 32 + Math.sin(e.age * 0.008) * 4;
    var auraGrad = ctx.createRadialGradient(0, 0, 6, 0, 0, auraRad);
    auraGrad.addColorStop(0, rgba(e.rgb, fade * 0.7));
    auraGrad.addColorStop(0.6, rgba(e.rgb, fade * 0.3));
    auraGrad.addColorStop(1, rgba(e.rgb, 0));

    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(0, 0, auraRad, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = rgba(e.rgb, fade * 0.8);
    ctx.lineWidth = 1.8;
    ctx.rotate(e.age * 0.003);
    ctx.beginPath();
    ctx.arc(0, 0, auraRad * 0.85, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  };

  LineageVFX.prototype._drawMonsterInfernoPillar = function (e) {
    var ctx = this.ctx, p = e.target, progress = clamp(e.age / e.maxAge, 0, 1), fade = 1 - progress;
    var feetY = p.y;
    e.state.rotation += 0.08;

    // Continuously erupt flames from feet upwards while effect is active
    if (e.age - e.state.lastFlameSpawn > 45 && progress < 0.75) {
      e.state.lastFlameSpawn = e.age;
      for (var f = 0; f < 6; f++) {
        var ang = rand(-Math.PI * 0.85, -Math.PI * 0.15);
        this._addParticle({
          x: p.x + rand(-32, 32),
          y: feetY + rand(-4, 8),
          vx: Math.cos(ang) * rand(1, 3.8),
          vy: Math.sin(ang) * rand(3.5, 9),
          max: rand(45, 80),
          radius: rand(11, 26),
          rgb: '255,110,25',
          rgbInner: '255,250,180',
          kind: 'flame',
          rotation: rand(-0.4, 0.4),
          rotationSpeed: rand(-0.07, 0.07),
          drag: 0.965,
          additive: true
        });
      }
      for (var sp = 0; sp < 4; sp++) {
        this._addParticle({
          x: p.x + rand(-25, 25),
          y: feetY,
          vx: rand(-2, 2),
          vy: rand(-6.5, -2.5),
          max: rand(35, 70),
          radius: rand(2.2, 5),
          rgb: '255,240,150',
          kind: 'sparkle',
          rotation: rand(0, 6.28),
          rotationSpeed: rand(-0.25, 0.25),
          additive: true
        });
      }
      for (var sm = 0; sm < 3; sm++) {
        this._addParticle({
          x: p.x + rand(-28, 28),
          y: feetY - rand(15, 60),
          vx: rand(-1, 1),
          vy: rand(-3.5, -1),
          max: rand(55, 95),
          radius: rand(14, 28),
          rgb: '240,70,10',
          kind: 'smoke',
          additive: true
        });
      }
    }

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // 1. Swirling Fire Cauldron Pool at Feet
    ctx.save();
    ctx.translate(p.x, feetY);
    ctx.scale(1, 0.38);
    ctx.rotate(e.state.rotation * 0.4);

    var poolRad = 60 * (0.8 + Math.sin(e.age * 0.01) * 0.2);
    var poolGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, poolRad);
    poolGrad.addColorStop(0, rgba('255,255,210', fade * 0.9));
    poolGrad.addColorStop(0.35, rgba('255,140,30', fade * 0.75));
    poolGrad.addColorStop(0.7, rgba('220,50,10', fade * 0.4));
    poolGrad.addColorStop(1, 'rgba(180,20,0,0)');

    ctx.fillStyle = poolGrad;
    ctx.beginPath();
    ctx.arc(0, 0, poolRad, 0, Math.PI * 2);
    ctx.fill();

    // Fire rune circle around feet
    ctx.strokeStyle = rgba('255,200,70', fade * 0.85);
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(255,90,20,0.95)';
    ctx.shadowBlur = 18 * this.qualityConfig.blur;
    ctx.beginPath();
    ctx.arc(0, 0, poolRad * 0.82, 0, Math.PI * 2);
    ctx.stroke();

    for (var r = 0; r < 6; r++) {
      ctx.rotate(Math.PI / 3);
      ctx.beginPath();
      ctx.moveTo(-poolRad * 0.82, 0);
      ctx.lineTo(poolRad * 0.82, 0);
      ctx.stroke();
    }
    ctx.restore();

    // 2. Rising Fire Column / Labaredas Verticais engolfando o monstro
    var pillarH = 150 * (1 - Math.pow(progress, 3));
    var pGrad = ctx.createLinearGradient(p.x, feetY, p.x, feetY - pillarH);
    pGrad.addColorStop(0, rgba('255,255,220', fade * 0.85));
    pGrad.addColorStop(0.25, rgba('255,140,30', fade * 0.75));
    pGrad.addColorStop(0.65, rgba('240,60,10', fade * 0.45));
    pGrad.addColorStop(1, 'rgba(200,30,0,0)');

    ctx.fillStyle = pGrad;
    ctx.shadowColor = 'rgba(255,100,20,0.95)';
    ctx.shadowBlur = 24 * this.qualityConfig.blur;

    var waveW = 48 + Math.sin(e.age * 0.02) * 8;
    ctx.beginPath();
    ctx.moveTo(p.x - waveW, feetY);
    ctx.quadraticCurveTo(p.x - waveW * 1.3, feetY - pillarH * 0.5, p.x, feetY - pillarH);
    ctx.quadraticCurveTo(p.x + waveW * 1.3, feetY - pillarH * 0.5, p.x + waveW, feetY);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  };

  LineageVFX.prototype._drawMonsterFrostFreeze = function (e) {
    var ctx = this.ctx, p = e.target, progress = clamp(e.age / e.maxAge, 0, 1), fade = 1 - progress;
    var feetY = p.y;
    e.state.rotation += 0.05;

    // Spawn sharp ice shards and cold mist drifting around the body
    if (e.age - e.state.lastCrystalSpawn > 50 && progress < 0.75) {
      e.state.lastCrystalSpawn = e.age;
      for (var c = 0; c < 5; c++) {
        this._addParticle({
          x: p.x + rand(-36, 36),
          y: feetY - rand(0, 85),
          vx: rand(-1.2, 1.2),
          vy: rand(-1.5, 0.5),
          max: rand(50, 90),
          radius: rand(7, 15),
          rgb: Math.random() < 0.6 ? '200,245,255' : '140,225,255',
          kind: 'ice_crystal',
          rotation: rand(0, 6.28),
          rotationSpeed: rand(-0.07, 0.07),
          drag: 0.94,
          additive: true
        });
      }
      for (var sm = 0; sm < 3; sm++) {
        this._addParticle({
          x: p.x + rand(-30, 30),
          y: feetY - rand(5, 75),
          vx: rand(-1, 1),
          vy: rand(-2, -0.4),
          max: rand(55, 100),
          radius: rand(14, 28),
          rgb: '160,230,255',
          kind: 'smoke',
          additive: true
        });
      }
    }

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // 1. Frozen Ice Floor Sheet (gelo alastrando aos pés)
    ctx.save();
    ctx.translate(p.x, feetY);
    ctx.scale(1, 0.38);

    var iceFloorRad = 62 * (0.85 + Math.sin(e.age * 0.008) * 0.15);
    var floorGrad = ctx.createRadialGradient(0, 0, 6, 0, 0, iceFloorRad);
    floorGrad.addColorStop(0, rgba('240,252,255', fade * 0.95));
    floorGrad.addColorStop(0.4, rgba('160,230,255', fade * 0.75));
    floorGrad.addColorStop(0.8, rgba('90,190,255', fade * 0.35));
    floorGrad.addColorStop(1, 'rgba(50,150,255,0)');

    ctx.fillStyle = floorGrad;
    ctx.beginPath();
    ctx.arc(0, 0, iceFloorRad, 0, Math.PI * 2);
    ctx.fill();

    // Hexagonal frost snowflake cracks
    ctx.strokeStyle = rgba('230,250,255', fade * 0.9);
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(140,225,255,0.95)';
    ctx.shadowBlur = 18 * this.qualityConfig.blur;
    for (var i = 0; i < 6; i++) {
      ctx.rotate(Math.PI / 3);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, iceFloorRad * 0.85);
      ctx.moveTo(-10, iceFloorRad * 0.55);
      ctx.lineTo(0, iceFloorRad * 0.7);
      ctx.lineTo(10, iceFloorRad * 0.55);
      ctx.stroke();
    }
    ctx.restore();

    // 2. Glacial Crystal Spikes Cage (Espinhos de Gelo envolvendo o Monstro da base até o topo)
    var cageH = 155 * Math.min(1, e.age / 110);
    ctx.save();
    ctx.translate(p.x, feetY);

    var spikeCount = 7;
    for (var s = 0; s < spikeCount; s++) {
      var sX = ((s - (spikeCount - 1) / 2) / ((spikeCount - 1) / 2)) * 44;
      var sH = (cageH * (0.75 + (Math.abs(sX) < 22 ? 0.25 : 0))) * (1 - progress * 0.22);
      var sW = 9 + (s % 2) * 3;

      var sGrad = ctx.createLinearGradient(sX, 0, sX, -sH);
      sGrad.addColorStop(0, rgba('245,255,255', fade * 0.95));
      sGrad.addColorStop(0.3, rgba('180,240,255', fade * 0.85));
      sGrad.addColorStop(0.8, rgba('110,210,255', fade * 0.6));
      sGrad.addColorStop(1, rgba('255,255,255', fade * 0.95));

      ctx.fillStyle = sGrad;
      ctx.shadowColor = 'rgba(140,230,255,0.95)';
      ctx.shadowBlur = 16 * this.qualityConfig.blur;
      ctx.beginPath();
      ctx.moveTo(sX - sW, 0);
      ctx.lineTo(sX, -sH);
      ctx.lineTo(sX + sW, 0);
      ctx.closePath();
      ctx.fill();

      // Sharp central highlight ridge
      ctx.strokeStyle = rgba('255,255,255', fade * 0.95);
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(sX, 0);
      ctx.lineTo(sX, -sH);
      ctx.stroke();
    }
    ctx.restore();

    ctx.restore();
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // NOVOS RENDERIZADORES DE MAGIAS E TÉCNICAS MARCIAIS (REALISTAS COM CHÃO/PÉS)
  // ═══════════════════════════════════════════════════════════════════════════

  // 1. Prominence (Pilar vulcânico denso e ondas de magma aos pés)
  LineageVFX.prototype._drawMagicProminence = function (e) {
    var ctx = this.ctx, p = e.target, progress = clamp(e.age / e.maxAge, 0, 1), fade = 1 - progress;
    var feetY = p.y;
    e.state.rotation += 0.09;

    if (e.age - e.state.lastFlameSpawn > 40 && progress < 0.8) {
      e.state.lastFlameSpawn = e.age;
      for (var f = 0; f < 5; f++) {
        var fAng = rand(-Math.PI * 0.88, -Math.PI * 0.12);
        this._addParticle({
          x: p.x + rand(-38, 38),
          y: feetY + rand(-3, 6),
          vx: Math.cos(fAng) * rand(1.8, 4.8),
          vy: Math.sin(fAng) * rand(4.5, 10),
          max: rand(45, 85),
          radius: rand(12, 28),
          rgb: '255,100,20',
          rgbInner: '255,250,180',
          kind: 'flame',
          rotation: rand(-0.4, 0.4),
          rotationSpeed: rand(-0.08, 0.08),
          drag: 0.96,
          additive: true
        });
      }
      for (var sp = 0; sp < 4; sp++) {
        this._addParticle({
          x: p.x + rand(-28, 28),
          y: feetY,
          vx: rand(-2.5, 2.5),
          vy: rand(-8, -3),
          max: rand(35, 75),
          radius: rand(2.5, 5.5),
          rgb: '255,245,160',
          kind: 'sparkle',
          rotation: rand(0, 6.28),
          rotationSpeed: rand(-0.3, 0.3),
          additive: true
        });
      }
    }

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // Fissura de magma no chão aos pés
    ctx.save();
    ctx.translate(p.x, feetY);
    ctx.scale(1, 0.38);
    var pRad = 68 * (0.8 + Math.sin(e.age * 0.012) * 0.2);
    var pGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, pRad);
    pGrad.addColorStop(0, rgba('255,255,220', fade * 0.95));
    pGrad.addColorStop(0.35, rgba('255,120,20', fade * 0.8));
    pGrad.addColorStop(0.7, rgba('220,40,10', fade * 0.45));
    pGrad.addColorStop(1, 'rgba(180,20,0,0)');
    ctx.fillStyle = pGrad;
    ctx.beginPath();
    ctx.arc(0, 0, pRad, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Coluna ascendente de fogo
    var colH = 170 * (1 - Math.pow(progress, 2.5));
    var colW = 54 + Math.sin(e.age * 0.02) * 10;
    var colGrad = ctx.createLinearGradient(p.x, feetY, p.x, feetY - colH);
    colGrad.addColorStop(0, rgba('255,255,220', fade * 0.9));
    colGrad.addColorStop(0.25, rgba('255,130,25', fade * 0.8));
    colGrad.addColorStop(0.7, rgba('230,50,10', fade * 0.5));
    colGrad.addColorStop(1, 'rgba(180,20,0,0)');
    ctx.fillStyle = colGrad;
    ctx.shadowColor = 'rgba(255,100,20,0.95)';
    ctx.shadowBlur = 26 * this.qualityConfig.blur;
    ctx.beginPath();
    ctx.moveTo(p.x - colW, feetY);
    ctx.quadraticCurveTo(p.x - colW * 1.3, feetY - colH * 0.5, p.x, feetY - colH);
    ctx.quadraticCurveTo(p.x + colW * 1.3, feetY - colH * 0.5, p.x + colW, feetY);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  // 2. Meteor Strike (Meteoro caindo do céu, cratera ardente e estilhaços)
  LineageVFX.prototype._drawMagicMeteor = function (e) {
    var ctx = this.ctx, p = e.target, progress = clamp(e.age / e.maxAge, 0, 1), fade = 1 - progress;
    var feetY = p.y;
    var dropProgress = clamp(e.age / 380, 0, 1);

    if (dropProgress < 1) {
      // Meteoro caindo
      var curX = (p.x - 160) + 160 * dropProgress;
      var curY = (feetY - 320) + 320 * dropProgress;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      // Rastro de fogo
      var tailGrad = ctx.createLinearGradient(curX - 70, curY - 140, curX, curY);
      tailGrad.addColorStop(0, 'rgba(255,50,0,0)');
      tailGrad.addColorStop(0.5, rgba('255,120,20', 0.6));
      tailGrad.addColorStop(1, rgba('255,255,200', 0.95));
      ctx.strokeStyle = tailGrad;
      ctx.lineWidth = 26;
      ctx.shadowColor = 'rgba(255,100,20,0.95)';
      ctx.shadowBlur = 24 * this.qualityConfig.blur;
      ctx.beginPath();
      ctx.moveTo(curX - 70, curY - 140);
      ctx.lineTo(curX, curY);
      ctx.stroke();

      // Esfera incandescente do meteoro
      var mGrad = ctx.createRadialGradient(curX, curY, 3, curX, curY, 26);
      mGrad.addColorStop(0, 'rgba(255,255,255,1)');
      mGrad.addColorStop(0.4, 'rgba(255,180,40,0.95)');
      mGrad.addColorStop(0.8, 'rgba(240,60,10,0.8)');
      mGrad.addColorStop(1, 'rgba(180,20,0,0)');
      ctx.fillStyle = mGrad;
      ctx.beginPath();
      ctx.arc(curX, curY, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      if (!e.state.impacted) {
        e.state.impacted = true;
        this._doFlash('255,140,40', 0.85);
        this._ring(p.x, feetY, '255,100,20', 105, 8.5, 5);
        this._ring(p.x, feetY, '255,230,100', 135, 5.5, 3);
        // Expelir estilhaços e brasas
        for (var r = 0; r < 28; r++) {
          var rAng = Math.random() * Math.PI * 2;
          this._addParticle({
            x: p.x,
            y: feetY,
            vx: Math.cos(rAng) * rand(3, 9),
            vy: Math.sin(rAng) * rand(3, 9) - 3,
            max: rand(45, 90),
            radius: rand(5, 12),
            rgb: Math.random() < 0.5 ? '255,120,30' : '150,90,50',
            kind: 'rock_debris',
            rotation: rand(0, 6.28),
            rotationSpeed: rand(-0.2, 0.2),
            gravity: 0.2,
            drag: 0.97
          });
        }
      }

      // Cratera de magma na base inferior
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.translate(p.x, feetY);
      ctx.scale(1, 0.4);
      var cRad = 85 * (1 - (progress - 0.3) * 0.5);
      var cGrad = ctx.createRadialGradient(0, 0, 8, 0, 0, cRad);
      cGrad.addColorStop(0, rgba('255,255,230', fade * 0.95));
      cGrad.addColorStop(0.3, rgba('255,130,30', fade * 0.85));
      cGrad.addColorStop(0.7, rgba('200,40,10', fade * 0.4));
      cGrad.addColorStop(1, 'rgba(150,20,0,0)');
      ctx.fillStyle = cGrad;
      ctx.beginPath();
      ctx.arc(0, 0, cRad, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  };

  // 3. Hydro Blast (Torrente gélida de alta pressão e ondas de espuma aos pés)
  LineageVFX.prototype._drawMagicHydroBlast = function (e) {
    var ctx = this.ctx, p = e.target, progress = clamp(e.age / e.maxAge, 0, 1), fade = 1 - progress;
    var feetY = p.y;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // Poça d'água turbulenta na base
    ctx.save();
    ctx.translate(p.x, feetY);
    ctx.scale(1, 0.35);
    var poolRad = 65 * (0.8 + Math.sin(e.age * 0.015) * 0.2);
    var wGrad = ctx.createRadialGradient(0, 0, 6, 0, 0, poolRad);
    wGrad.addColorStop(0, rgba('220,250,255', fade * 0.9));
    wGrad.addColorStop(0.5, rgba('80,200,255', fade * 0.7));
    wGrad.addColorStop(1, 'rgba(30,120,255,0)');
    ctx.fillStyle = wGrad;
    ctx.beginPath();
    ctx.arc(0, 0, poolRad, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Geiser vertical de água e vapor
    var hydrH = 155 * (1 - progress * 0.4);
    var hydrW = 44 + Math.sin(e.age * 0.03) * 8;
    var hGrad = ctx.createLinearGradient(p.x, feetY, p.x, feetY - hydrH);
    hGrad.addColorStop(0, rgba('240,255,255', fade * 0.95));
    hGrad.addColorStop(0.3, rgba('100,215,255', fade * 0.8));
    hGrad.addColorStop(0.8, rgba('50,160,255', fade * 0.45));
    hGrad.addColorStop(1, 'rgba(20,100,255,0)');
    ctx.fillStyle = hGrad;
    ctx.shadowColor = 'rgba(80,200,255,0.95)';
    ctx.shadowBlur = 22 * this.qualityConfig.blur;
    ctx.beginPath();
    ctx.moveTo(p.x - hydrW, feetY);
    ctx.lineTo(p.x - hydrW * 0.7, feetY - hydrH);
    ctx.lineTo(p.x + hydrW * 0.7, feetY - hydrH);
    ctx.lineTo(p.x + hydrW, feetY);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  };

  // 4. Hurricane / Tempest Cyclone (Tufão giratório denso aos pés com folhas e poeira)
  LineageVFX.prototype._drawMagicHurricane = function (e) {
    var ctx = this.ctx, p = e.target, progress = clamp(e.age / e.maxAge, 0, 1), fade = 1 - progress;
    var feetY = p.y;
    e.state.rotation += 0.16;

    if (e.age % 4 === 0 && progress < 0.75) {
      for (var w = 0; w < 2; w++) {
        var wAng = rand(0, 6.28);
        this._addParticle({
          x: p.x + Math.cos(wAng) * rand(10, 42),
          y: feetY - rand(5, 110),
          vx: -Math.sin(wAng) * rand(2.5, 6),
          vy: rand(-3.5, -0.8),
          max: rand(40, 75),
          radius: rand(2.2, 4.5),
          rgb: '150,240,200',
          kind: 'leaf',
          rotation: rand(0, 6.28),
          rotationSpeed: rand(-0.3, 0.3),
          drag: 0.97
        });
      }
    }

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(p.x, feetY);

    // Ciclone cônico de vento
    var coneH = 150 * (1 - progress * 0.3);
    for (var layer = 0; layer < 6; layer++) {
      var lY = -((layer / 6) * coneH);
      var lW = 28 + (layer / 6) * 48;
      ctx.save();
      ctx.translate(0, lY);
      ctx.scale(1, 0.36);
      ctx.rotate(e.state.rotation + layer * 0.4);
      ctx.strokeStyle = rgba('110,240,195', fade * 0.85);
      ctx.lineWidth = 3.5;
      ctx.shadowColor = 'rgba(90,240,190,0.9)';
      ctx.shadowBlur = 16 * this.qualityConfig.blur;
      ctx.beginPath();
      ctx.arc(0, 0, lW, 0, Math.PI * 1.6);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  };

  // Wind Strike (Lâmina mágica cortante de vento supersônica com vórtices de ar e corte de alta precisão)
  LineageVFX.prototype._drawWindStrike = function (e) {
    var ctx = this.ctx, s = e.state;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // Rastro de micro-ciclones e folhas mágicas
    if (Math.random() < 0.7) {
      this._addParticle({
        x: s.x + rand(-8, 8),
        y: s.y + rand(-8, 8),
        vx: -Math.cos(s.angle) * rand(1.5, 4) + rand(-0.8, 0.8),
        vy: -Math.sin(s.angle) * rand(1.5, 4) + rand(-0.8, 0.8),
        max: rand(20, 42),
        radius: rand(1.8, 3.5),
        rgb: '120,245,205',
        kind: 'leaf',
        rotation: rand(0, 6.28),
        rotationSpeed: rand(-0.25, 0.25),
        drag: 0.95
      });
    }

    // Lâmina cortante em arco de vento
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.angle);

    var bladeLen = 52;
    var bladeWidth = 20;

    // Halo externo esmeralda
    var haloGrad = ctx.createLinearGradient(-bladeLen * 0.7, 0, bladeLen * 0.5, 0);
    haloGrad.addColorStop(0, 'rgba(80,240,180,0)');
    haloGrad.addColorStop(0.5, 'rgba(110,250,210,0.5)');
    haloGrad.addColorStop(1, 'rgba(200,255,240,0.9)');

    ctx.fillStyle = haloGrad;
    ctx.shadowColor = 'rgba(90,245,200,0.95)';
    ctx.shadowBlur = 20 * this.qualityConfig.blur;

    // Crescente aerodinâmico afiado
    ctx.beginPath();
    ctx.moveTo(bladeLen * 0.55, 0);
    ctx.quadraticCurveTo(0, -bladeWidth, -bladeLen * 0.7, -bladeWidth * 0.35);
    ctx.quadraticCurveTo(-bladeLen * 0.25, 0, -bladeLen * 0.7, bladeWidth * 0.35);
    ctx.quadraticCurveTo(0, bladeWidth, bladeLen * 0.55, 0);
    ctx.closePath();
    ctx.fill();

    // Núcleo branco brilhante da lâmina cortante
    ctx.strokeStyle = 'rgba(255,255,255,0.95)';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(bladeLen * 0.5, 0);
    ctx.quadraticCurveTo(0, -bladeWidth * 0.5, -bladeLen * 0.4, 0);
    ctx.quadraticCurveTo(0, bladeWidth * 0.5, bladeLen * 0.5, 0);
    ctx.stroke();

    // Arcos de vento giratórios duplos
    for (var w = -1; w <= 1; w += 2) {
      ctx.strokeStyle = 'rgba(170,255,230,0.85)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(-bladeLen * 0.15, w * 9, 13, -0.4, Math.PI * 1.3);
      ctx.stroke();
    }

    ctx.restore();
    ctx.restore();
  };

  // Flame Strike (Explosão ígnea concentrada: anel rúnico no solo, vórtice de labaredas e brasas crepitantes)
  LineageVFX.prototype._drawFlameStrike = function (e) {
    var ctx = this.ctx, p = e.target, progress = clamp(e.age / e.maxAge, 0, 1), fade = 1 - progress;
    var feetY = p.y;
    e.state.rotation = (e.state.rotation || 0) + 0.08;

    // Partículas de brasas e faíscas subindo
    if (e.age % 3 === 0 && progress < 0.75) {
      for (var f = 0; f < 3; f++) {
        var fAngle = rand(0, 6.28);
        var fDist = rand(6, 30);
        this._addParticle({
          x: p.x + Math.cos(fAngle) * fDist,
          y: feetY - rand(2, 22),
          vx: Math.cos(fAngle) * rand(0.5, 2.0),
          vy: rand(-5.5, -2.0),
          max: rand(28, 55),
          radius: rand(1.8, 3.6),
          rgb: Math.random() < 0.6 ? '255,210,80' : '255,90,20',
          kind: 'sparkle',
          rotation: rand(0, 6.28),
          rotationSpeed: rand(-0.25, 0.25),
          additive: true
        });
      }
    }

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // 1. Círculo de invocação ígneo no solo (duplo anel com raios)
    ctx.save();
    ctx.translate(p.x, feetY);
    ctx.scale(1, 0.36);

    var ringRad = 46 * (0.8 + Math.sin(e.age * 0.015) * 0.2);
    ctx.strokeStyle = rgba('255,140,30', fade * 0.9);
    ctx.lineWidth = 2.2;
    ctx.shadowColor = 'rgba(255,100,20,0.9)';
    ctx.shadowBlur = 16 * this.qualityConfig.blur;
    ctx.beginPath();
    ctx.arc(0, 0, ringRad, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = rgba('255,230,100', fade * 0.7);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(0, 0, ringRad * 0.65, 0, Math.PI * 2);
    ctx.stroke();

    // Glifos rotativos do círculo de fogo
    ctx.rotate(e.state.rotation);
    for (var g = 0; g < 6; g++) {
      var gAng = (g / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(gAng) * ringRad * 0.65, Math.sin(gAng) * ringRad * 0.65);
      ctx.lineTo(Math.cos(gAng) * ringRad, Math.sin(gAng) * ringRad);
      ctx.stroke();
    }
    ctx.restore();

    // 2. Labaredas estilizadas espiralando para cima
    var flameH = 90 * (1 - Math.pow(progress, 2.0));
    var flameW = 26 + Math.sin(e.age * 0.04) * 6;

    for (var layer = 0; layer < 3; layer++) {
      var lAngle = e.state.rotation * (layer % 2 === 0 ? 1 : -1) + layer * 2.1;
      var offsetX = Math.sin(lAngle) * 7;
      var fGrad = ctx.createLinearGradient(p.x + offsetX, feetY, p.x, feetY - flameH * (0.8 + layer * 0.1));
      fGrad.addColorStop(0, rgba('255,255,220', fade * 0.95));
      fGrad.addColorStop(0.25, rgba('255,160,30', fade * 0.85));
      fGrad.addColorStop(0.65, rgba('235,60,15', fade * 0.5));
      fGrad.addColorStop(1, 'rgba(180,20,0,0)');

      ctx.fillStyle = fGrad;
      ctx.shadowColor = 'rgba(255,90,20,0.9)';
      ctx.shadowBlur = 18 * this.qualityConfig.blur;

      ctx.beginPath();
      ctx.moveTo(p.x - flameW * 0.8 + offsetX, feetY);
      ctx.quadraticCurveTo(p.x + offsetX * 2, feetY - flameH * 0.55, p.x, feetY - flameH * (0.8 + layer * 0.1));
      ctx.quadraticCurveTo(p.x - offsetX, feetY - flameH * 0.5, p.x + flameW * 0.8 + offsetX, feetY);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  };

  // 5. Lightning Surge / Thunder Storm (Rede elétrica e centelhas azuis crepitando no solo)
  LineageVFX.prototype._drawMagicLightningSurge = function (e) {
    var ctx = this.ctx, p = e.target, progress = clamp(e.age / e.maxAge, 0, 1), fade = 1 - progress;
    var feetY = p.y;

    if (e.age % 6 === 0 && progress < 0.8) {
      for (var s = 0; s < 4; s++) {
        this._addParticle({
          x: p.x + rand(-38, 38),
          y: feetY + rand(-6, 4),
          vx: rand(-3, 3),
          vy: rand(-6, -1),
          max: rand(25, 55),
          radius: rand(1.8, 4.2),
          rgb: '160,240,255',
          kind: 'sparkle',
          rotation: rand(0, 6.28),
          rotationSpeed: rand(-0.35, 0.35),
          additive: true
        });
      }
    }

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // Teia elétrica no solo aos pés
    ctx.save();
    ctx.translate(p.x, feetY);
    ctx.scale(1, 0.38);
    var surgeRad = 72 * (0.8 + Math.sin(e.age * 0.02) * 0.2);
    ctx.strokeStyle = rgba('140,235,255', fade * 0.9);
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(110,231,255,0.95)';
    ctx.shadowBlur = 20 * this.qualityConfig.blur;

    for (var b = 0; b < 5; b++) {
      var bAng = (b / 5) * Math.PI * 2 + (Math.sin(e.age * 0.05 + b) * 0.3);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      var midR = surgeRad * 0.55;
      ctx.lineTo(Math.cos(bAng) * midR + rand(-8, 8), Math.sin(bAng) * midR + rand(-8, 8));
      ctx.lineTo(Math.cos(bAng) * surgeRad, Math.sin(bAng) * surgeRad);
      ctx.stroke();
    }
    ctx.restore();

    // Raio vertical principal
    var boltPoints = buildBolt({ x: p.x, y: 0 }, { x: p.x, y: feetY }, 28);
    ctx.strokeStyle = rgba('245,252,255', fade);
    ctx.lineWidth = 3.5;
    ctx.shadowColor = 'rgba(120,235,255,0.95)';
    ctx.shadowBlur = 22 * this.qualityConfig.blur;
    ctx.beginPath();
    ctx.moveTo(boltPoints[0].x, boltPoints[0].y);
    for (var i = 1; i < boltPoints.length; i++) ctx.lineTo(boltPoints[i].x, boltPoints[i].y);
    ctx.stroke();

    ctx.restore();
  };

  // 6. Death Spike (Estaca óssea sombria veloz perfurando com rastro abissal)
  LineageVFX.prototype._drawMagicDeathSpike = function (e) {
    var ctx = this.ctx, s = e.state, dtProgress = clamp(e.age / 240, 0, 1);
    var curX = e.source.x + (e.target.x - e.source.x) * dtProgress;
    var curY = e.source.y + (e.target.y - e.source.y) * dtProgress;
    var angle = Math.atan2(e.target.y - e.source.y, e.target.x - e.source.x);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(curX, curY);
    ctx.rotate(angle);

    // Rastro de almas
    var trailGrad = ctx.createLinearGradient(-50, 0, 15, 0);
    trailGrad.addColorStop(0, 'rgba(140,40,220,0)');
    trailGrad.addColorStop(0.6, rgba('190,90,255', 0.85));
    trailGrad.addColorStop(1, 'rgba(255,255,255,0.95)');
    ctx.strokeStyle = trailGrad;
    ctx.lineWidth = 6;
    ctx.shadowColor = 'rgba(180,80,255,0.95)';
    ctx.shadowBlur = 18 * this.qualityConfig.blur;
    ctx.beginPath();
    ctx.moveTo(-50, 0);
    ctx.lineTo(15, 0);
    ctx.stroke();

    // Estaca óssea
    ctx.fillStyle = 'rgba(245,240,255,0.98)';
    ctx.beginPath();
    ctx.moveTo(22, 0);
    ctx.lineTo(0, -6);
    ctx.lineTo(-12, 0);
    ctx.lineTo(0, 6);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    if (dtProgress >= 1 && !e.state.impacted) {
      e.state.impacted = true;
      this._doFlash('180,80,255', 0.6);
      this._ring(e.target.x, e.target.y, '180,80,255', 68, 6.5, 3.5);
      for (var sp = 0; sp < 14; sp++) {
        this._addParticle({
          x: e.target.x,
          y: e.target.y,
          vx: rand(-3.5, 3.5),
          vy: rand(-3.5, 3.5),
          max: rand(35, 70),
          radius: rand(3, 6.5),
          rgb: '190,80,255',
          kind: 'soul_mote',
          additive: true
        });
      }
    }
  };

  // 7. Vampiric Drain / Life Drain (Vórtice no monstro + fluxo contínuo de energia vital carmesim sintonizada para o herói + aura de cura no herói)
  LineageVFX.prototype._drawMagicVampiricDrain = function (e) {
    var ctx = this.ctx, p = e.target, heroP = e.source, progress = clamp(e.age / e.maxAge, 0, 1), fade = 1 - progress;
    e.state.rotation = (e.state.rotation || 0) - 0.14;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // ─── FASE 1: Vórtice Sombrio de Extração no Alvo (Monstro) ───
    var targetPulse = Math.sin(progress * Math.PI * 6) * 0.15 + 0.85;
    ctx.save();
    ctx.translate(p.x, p.y);

    // Halo avermelhado profundo e pulsante no peito do monstro
    var coreGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 46 * targetPulse);
    coreGrad.addColorStop(0, rgba('255,60,100', fade * 0.95));
    coreGrad.addColorStop(0.35, rgba('210,25,75', fade * 0.75));
    coreGrad.addColorStop(0.7, rgba('130,10,60', fade * 0.4));
    coreGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 46 * targetPulse, 0, Math.PI * 2);
    ctx.fill();

    // Vórtice espiral de 4 lâminas girando para dentro (sugando a essência)
    ctx.rotate(e.state.rotation);
    for (var v = 0; v < 4; v++) {
      ctx.rotate((Math.PI * 2) / 4);
      var vGrad = ctx.createRadialGradient(0, 0, 3, 0, 0, 44);
      vGrad.addColorStop(0, rgba('255,130,170', fade * 0.95));
      vGrad.addColorStop(0.4, rgba('225,35,85', fade * 0.75));
      vGrad.addColorStop(0.8, rgba('145,15,55', fade * 0.35));
      vGrad.addColorStop(1, 'rgba(100,0,30,0)');
      ctx.fillStyle = vGrad;
      ctx.beginPath();
      ctx.ellipse(18, 0, 24 * targetPulse, 9 * targetPulse, 0.45, 0, Math.PI * 2);
      ctx.fill();
    }

    // Anel rúnico contraindo para o centro (implosão de vida)
    var ringContract = (1 - ((e.age * 0.003) % 1)) * 34 + 6;
    ctx.strokeStyle = rgba('255,90,130', fade * 0.75);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, ringContract, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();

    // ─── FASE 2: Feixes Sinuosos de Energia Vital (Monstro -> Herói) ───
    var dx = heroP.x - p.x;
    var dy = heroP.y - p.y;
    var dist = Math.sqrt(dx * dx + dy * dy);

    // Duas fitas entrelaçadas de luz carmesim fluindo do monstro para o herói
    var streamAlpha = Math.sin(progress * Math.PI) * 0.9;
    if (streamAlpha > 0.05) {
      for (var ribbon = 0; ribbon < 2; ribbon++) {
        var phase = (ribbon === 0 ? 0 : Math.PI) + (e.age * 0.018);
        ctx.beginPath();
        var steps = 24;
        for (var s = 0; s <= steps; s++) {
          var t = s / steps;
          // Ondulação perpendicular ao feixe
          var perpX = -dy / (dist || 1);
          var perpY = dx / (dist || 1);
          var wave = Math.sin(t * Math.PI * 4 + phase) * (18 * Math.sin(t * Math.PI));
          var sx = p.x + dx * t + perpX * wave;
          var sy = p.y + dy * t + perpY * wave - Math.sin(t * Math.PI) * 26; // leve arco superior
          if (s === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.strokeStyle = ribbon === 0 ? rgba('255,70,120', streamAlpha * 0.85) : rgba('244,63,94', streamAlpha * 0.65);
        ctx.lineWidth = ribbon === 0 ? 3 : 2;
        ctx.shadowColor = 'rgba(230,20,70,0.9)';
        ctx.shadowBlur = 12 * this.qualityConfig.blur;
        ctx.stroke();
      }

      // ─── Esferas / Gotas de Vida Drenada viajando continuamente do monstro para o herói ───
      var numOrbs = 7;
      for (var o = 0; o < numOrbs; o++) {
        var orbT = ((e.age * 0.002) + (o / numOrbs)) % 1;
        var perpX2 = -dy / (dist || 1);
        var perpY2 = dx / (dist || 1);
        var orbWave = Math.sin(orbT * Math.PI * 4 + (o % 2 === 0 ? 0 : Math.PI)) * (16 * Math.sin(orbT * Math.PI));
        var ox = p.x + dx * orbT + perpX2 * orbWave;
        var oy = p.y + dy * orbT + perpY2 * orbWave - Math.sin(orbT * Math.PI) * 26;

        var orbFade = Math.sin(orbT * Math.PI) * fade;
        var orbGrad = ctx.createRadialGradient(ox, oy, 1, ox, oy, 9);
        orbGrad.addColorStop(0, rgba('255,255,255', orbFade));
        orbGrad.addColorStop(0.3, rgba('255,100,140', orbFade * 0.95));
        orbGrad.addColorStop(0.7, rgba('220,20,80', orbFade * 0.6));
        orbGrad.addColorStop(1, 'rgba(180,0,50,0)');
        ctx.fillStyle = orbGrad;
        ctx.beginPath();
        ctx.arc(ox, oy, 7, 0, Math.PI * 2);
        ctx.fill();

        // Rastro luminoso da esfera mostrando a direção para o herói
        var trailX = ox - (dx / (dist || 1)) * 14;
        var trailY = oy - (dy / (dist || 1)) * 14;
        ctx.strokeStyle = rgba('255,80,120', orbFade * 0.65);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(trailX, trailY);
        ctx.lineTo(ox, oy);
        ctx.stroke();
      }
    }

    // ─── FASE 3: Absorção e Restauração de Vida no Herói ───
    if (progress > 0.2) {
      var heroAbsorbProg = (progress - 0.2) / 0.8;
      var heroPulse = Math.sin(heroAbsorbProg * Math.PI * 4) * 0.15 + 0.85;

      ctx.save();
      ctx.translate(heroP.x, heroP.y);

      // Aura de vitalidade absorvida ao redor do herói (carmesim brilhante e esmeralda de cura)
      var heroGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 44 * heroPulse);
      heroGrad.addColorStop(0, rgba('255,120,160', fade * 0.8));
      heroGrad.addColorStop(0.4, rgba('244,63,94', fade * 0.55));
      heroGrad.addColorStop(0.75, rgba('52,211,153', fade * 0.4)); // brilho verde esmeralda de cura
      heroGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = heroGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 44 * heroPulse, 0, Math.PI * 2);
      ctx.fill();

      // Anéis de energia ascendendo pelo corpo do herói
      for (var r = 0; r < 2; r++) {
        var ringT = ((heroAbsorbProg * 2 + r * 0.5) % 1);
        var ringY = -ringT * 38;
        var ringR = (1 - ringT) * 22 + 4;
        ctx.strokeStyle = rgba('255,140,180', (1 - ringT) * fade * 0.85);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, ringY, ringR, ringR * 0.45, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    }

    ctx.restore();
  };

  // 8. Dark Mire (Poça abissal escura no solo aos pés do monstro com almas subindo)
  LineageVFX.prototype._drawMagicDarkMire = function (e) {
    var ctx = this.ctx, p = e.target, progress = clamp(e.age / e.maxAge, 0, 1), fade = 1 - progress;
    var feetY = p.y;
    e.state.rotation += 0.04;

    if (e.age - e.state.lastSoulSpawn > 60 && progress < 0.8) {
      e.state.lastSoulSpawn = e.age;
      for (var sm = 0; sm < 4; sm++) {
        this._addParticle({
          x: p.x + rand(-32, 32),
          y: feetY - rand(0, 40),
          vx: rand(-1, 1),
          vy: rand(-3.5, -1.2),
          max: rand(50, 95),
          radius: rand(4, 8),
          rgb: Math.random() < 0.5 ? '160,50,240' : '100,20,180',
          kind: 'soul_mote',
          additive: true
        });
      }
    }

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(p.x, feetY);
    ctx.scale(1, 0.38);

    var mireRad = 70 * (0.85 + Math.sin(e.age * 0.008) * 0.15);
    var mGrad = ctx.createRadialGradient(0, 0, 6, 0, 0, mireRad);
    mGrad.addColorStop(0, rgba('210,120,255', fade * 0.9));
    mGrad.addColorStop(0.45, rgba('140,40,220', fade * 0.75));
    mGrad.addColorStop(0.85, rgba('70,10,140', fade * 0.35));
    mGrad.addColorStop(1, 'rgba(30,0,80,0)');
    ctx.fillStyle = mGrad;
    ctx.beginPath();
    ctx.arc(0, 0, mireRad, 0, Math.PI * 2);
    ctx.fill();

    // Rúnico sombrio
    ctx.rotate(e.state.rotation);
    ctx.strokeStyle = rgba('190,90,255', fade * 0.85);
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(0, 0, mireRad * 0.8, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  };

  // 9. Solar Flare (Feixe solar ofuscante com anéis dourados de refração)
  LineageVFX.prototype._drawMagicSolarFlare = function (e) {
    var ctx = this.ctx, p = e.target, progress = clamp(e.age / e.maxAge, 0, 1), fade = 1 - progress;
    var feetY = p.y;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // Feixe divino
    var beamW = 56 * (1 - progress * 0.4);
    var beamGrad = ctx.createLinearGradient(p.x - beamW / 2, 0, p.x + beamW / 2, 0);
    beamGrad.addColorStop(0, 'rgba(255,235,140,0)');
    beamGrad.addColorStop(0.3, rgba('255,245,180', fade * 0.95));
    beamGrad.addColorStop(0.5, rgba('255,255,255', fade));
    beamGrad.addColorStop(0.7, rgba('255,245,180', fade * 0.95));
    beamGrad.addColorStop(1, 'rgba(255,235,140,0)');
    ctx.fillStyle = beamGrad;
    ctx.shadowColor = 'rgba(255,230,120,0.95)';
    ctx.shadowBlur = 26 * this.qualityConfig.blur;
    ctx.fillRect(p.x - beamW / 2, 0, beamW, feetY + 8);

    // Selo solar na base
    ctx.save();
    ctx.translate(p.x, feetY);
    ctx.scale(1, 0.38);
    ctx.rotate(e.age * 0.008);
    ctx.strokeStyle = rgba('255,235,120', fade * 0.95);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 58, 0, Math.PI * 2);
    ctx.stroke();
    for (var s = 0; s < 4; s++) {
      ctx.rotate(Math.PI / 4);
      ctx.beginPath();
      ctx.moveTo(-50, 0);
      ctx.lineTo(50, 0);
      ctx.stroke();
    }
    ctx.restore();

    ctx.restore();
  };

  // 10. Holy Sanctuary (Selo sagrado rúnico e colunas de luz no solo)
  LineageVFX.prototype._drawMagicHolySanctuary = function (e) {
    var ctx = this.ctx, p = e.target, progress = clamp(e.age / e.maxAge, 0, 1), fade = 1 - progress;
    var feetY = p.y;
    e.state.rotation += 0.006;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(p.x, feetY);
    ctx.scale(1, 0.38);

    var sRad = 74 * (0.85 + Math.sin(e.age * 0.008) * 0.15);
    var sGrad = ctx.createRadialGradient(0, 0, 8, 0, 0, sRad);
    sGrad.addColorStop(0, rgba('255,255,230', fade * 0.95));
    sGrad.addColorStop(0.4, rgba('255,235,140', fade * 0.8));
    sGrad.addColorStop(0.8, rgba('255,210,90', fade * 0.4));
    sGrad.addColorStop(1, 'rgba(255,200,50,0)');
    ctx.fillStyle = sGrad;
    ctx.beginPath();
    ctx.arc(0, 0, sRad, 0, Math.PI * 2);
    ctx.fill();

    ctx.rotate(e.state.rotation);
    ctx.strokeStyle = rgba('255,245,180', fade * 0.95);
    ctx.lineWidth = 2.8;
    ctx.shadowColor = 'rgba(255,225,120,0.95)';
    ctx.shadowBlur = 18 * this.qualityConfig.blur;
    ctx.beginPath();
    ctx.arc(0, 0, sRad * 0.82, 0, Math.PI * 2);
    ctx.stroke();

    for (var r = 0; r < 8; r++) {
      ctx.rotate(Math.PI / 4);
      ctx.beginPath();
      ctx.moveTo(-sRad * 0.82, 0);
      ctx.lineTo(sRad * 0.82, 0);
      ctx.stroke();
    }
    ctx.restore();
  };

  // 11. Snipe Shot / Lethal Shot (Tiro hiper-supersônico em linha com anéis cônicos)
  LineageVFX.prototype._drawSnipeShot = function (e) {
    var ctx = this.ctx, s = e.state, progress = clamp(e.age / e.maxAge, 0, 1), fade = 1 - progress;
    var targetDist = distance(e.source, e.target);
    var angle = Math.atan2(e.target.y - e.source.y, e.target.x - e.source.x);
    var curDist = Math.min(targetDist, (e.age / 16) * s.speed * 1.5);
    var curX = e.source.x + Math.cos(angle) * curDist;
    var curY = e.source.y + Math.sin(angle) * curDist;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // Trilha de plasma perfurante
    var tGrad = ctx.createLinearGradient(e.source.x, e.source.y, curX, curY);
    tGrad.addColorStop(0, 'rgba(255,220,100,0)');
    tGrad.addColorStop(0.7, rgba('255,240,160', fade * 0.9));
    tGrad.addColorStop(1, 'rgba(255,255,255,1)');
    ctx.strokeStyle = tGrad;
    ctx.lineWidth = 4.5;
    ctx.shadowColor = 'rgba(255,220,100,0.95)';
    ctx.shadowBlur = 20 * this.qualityConfig.blur;
    ctx.beginPath();
    ctx.moveTo(e.source.x, e.source.y);
    ctx.lineTo(curX, curY);
    ctx.stroke();

    // Flecha de energia de alta velocidade
    this._drawArrow({ x: curX, y: curY, vx: Math.cos(angle) * 10, vy: Math.sin(angle) * 10 }, 1);

    if (curDist >= targetDist && !s.impacted) {
      s.impacted = true;
      this._doFlash('255,245,180', 0.65);
      this._ring(e.target.x, e.target.y, '255,230,100', 65, 7.8, 4);
      for (var sp = 0; sp < 18; sp++) {
        this._addParticle({
          x: e.target.x,
          y: e.target.y,
          vx: rand(-4.5, 4.5),
          vy: rand(-4.5, 4.5),
          max: rand(25, 60),
          radius: rand(2, 4.8),
          rgb: '255,240,140',
          kind: 'sparkle',
          additive: true
        });
      }
    }
    ctx.restore();
  };

  // 12. Burst Fire / Sharpshooter (Rajada veloz de 3 projéteis de pólvora com faíscas)
  LineageVFX.prototype._drawBurstFire = function (e, dt) {
    var s = e.state, speed = s.speed * (dt / 16);
    var targetDist = distance(e.source, e.target);
    var angle = Math.atan2(e.target.y - e.source.y, e.target.x - e.source.x);

    for (var b = 0; b < s.bullets.length; b++) {
      var bullet = s.bullets[b];
      if (!bullet.active && e.age >= bullet.delay) bullet.active = true;
      if (bullet.active && !bullet.done) {
        bullet.x += Math.cos(angle) * speed;
        bullet.y += Math.sin(angle) * speed;
        this._drawArrow({ x: bullet.x, y: bullet.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed }, 1);
        if (distance(e.source, bullet) >= targetDist) {
          bullet.done = true;
          this._impact(e, e.target.x, e.target.y + (b - 1) * 8);
        }
      }
    }
    if (s.bullets.every(function (bul) { return bul.done; })) e.done = true;
  };

  // 13. Seven Arrow (7 flechas disparadas em leque convergente estelar)
  LineageVFX.prototype._drawSevenArrow = function (e, dt) {
    var s = e.state, speed = s.speed * (dt / 16);
    var targetDist = distance(e.source, e.target);
    var baseAngle = Math.atan2(e.target.y - e.source.y, e.target.x - e.source.x);

    for (var a = 0; a < s.arrows.length; a++) {
      var arr = s.arrows[a];
      if (!arr.active && e.age >= arr.delay) arr.active = true;
      if (arr.active && !arr.done) {
        var curAngle = baseAngle + arr.angleOffset * Math.max(0, 1 - (distance(e.source, arr) / targetDist));
        arr.x += Math.cos(curAngle) * speed;
        arr.y += Math.sin(curAngle) * speed;
        this._drawArrow({ x: arr.x, y: arr.y, vx: Math.cos(curAngle) * speed, vy: Math.sin(curAngle) * speed }, 1);
        if (distance(e.source, arr) >= targetDist) {
          arr.done = true;
          this._impact(e, e.target.x + rand(-10, 10), e.target.y + rand(-10, 10));
        }
      }
    }
    if (s.arrows.every(function (ar) { return ar.done; })) e.done = true;
  };

  // 14. Warrior Backstab (Rasgo em cruz escarlate de alta velocidade e sombras)
  LineageVFX.prototype._drawWarriorBackstab = function (e) {
    var ctx = this.ctx, p = e.target, progress = clamp(e.age / e.maxAge, 0, 1), fade = 1 - progress;
    var feetY = p.y;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // Fumaça de sombras aos pés
    if (e.age < 150) {
      for (var s = 0; s < 3; s++) {
        this._addParticle({
          x: p.x + rand(-24, 24),
          y: feetY - rand(0, 40),
          vx: rand(-1.2, 1.2),
          vy: rand(-2, -0.5),
          max: rand(40, 80),
          radius: rand(10, 20),
          rgb: '40,20,50',
          kind: 'smoke'
        });
      }
    }

    // Rasgo escarlate brutal em cruz
    var slashLen = 78 * clamp(e.age / 110, 0, 1);
    ctx.save();
    ctx.translate(p.x, p.y - 10);
    ctx.rotate(-0.5);

    var grad = ctx.createLinearGradient(-slashLen, 0, slashLen, 0);
    grad.addColorStop(0, 'rgba(255,255,255,0)');
    grad.addColorStop(0.3, rgba('255,50,80', fade * 0.95));
    grad.addColorStop(0.5, rgba('255,255,255', fade));
    grad.addColorStop(0.7, rgba('220,20,50', fade * 0.95));
    grad.addColorStop(1, 'rgba(255,50,80,0)');

    ctx.strokeStyle = grad;
    ctx.lineWidth = 6 * (1 - progress * 0.5);
    ctx.shadowColor = 'rgba(220,20,50,0.95)';
    ctx.shadowBlur = 24 * this.qualityConfig.blur;

    ctx.beginPath();
    ctx.moveTo(-slashLen, 0);
    ctx.lineTo(slashLen, 0);
    ctx.stroke();

    ctx.rotate(1.2);
    ctx.beginPath();
    ctx.moveTo(-slashLen * 0.8, 0);
    ctx.lineTo(slashLen * 0.8, 0);
    ctx.stroke();

    ctx.restore();
    ctx.restore();
  };

  // 15. Warrior Deadly Blow (Golpe frontal perfurante com centelhas e impacto)
  LineageVFX.prototype._drawWarriorDeadlyBlow = function (e) {
    var ctx = this.ctx, p = e.target, progress = clamp(e.age / e.maxAge, 0, 1), fade = 1 - progress;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    var thrustLen = 85 * clamp(e.age / 95, 0, 1);
    ctx.save();
    ctx.translate(p.x, p.y);
    var tGrad = ctx.createLinearGradient(-thrustLen, 0, thrustLen * 0.4, 0);
    tGrad.addColorStop(0, 'rgba(255,255,255,0)');
    tGrad.addColorStop(0.4, rgba('255,245,220', fade));
    tGrad.addColorStop(1, rgba('255,210,120', fade * 0.9));
    ctx.strokeStyle = tGrad;
    ctx.lineWidth = 7 * (1 - progress * 0.6);
    ctx.shadowColor = 'rgba(255,230,150,0.95)';
    ctx.shadowBlur = 22 * this.qualityConfig.blur;
    ctx.beginPath();
    ctx.moveTo(-thrustLen, 0);
    ctx.lineTo(thrustLen * 0.4, 0);
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  };

  // 16. Warrior Sonic Storm (Lâminas de vácuo das espadas duplas rasgando o solo)
  LineageVFX.prototype._drawWarriorSonicStorm = function (e) {
    var ctx = this.ctx, p = e.target, progress = clamp(e.age / e.maxAge, 0, 1), fade = 1 - progress;
    var feetY = p.y;
    e.state.rotation += 0.18;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(p.x, feetY);

    // Três lâminas sônicas cortando o chão ao redor da base
    for (var s = 0; s < 3; s++) {
      ctx.save();
      ctx.scale(1, 0.38);
      ctx.rotate(e.state.rotation + (s * Math.PI * 2) / 3);
      var sRad = 52 + s * 10;
      var sGrad = ctx.createLinearGradient(-sRad, 0, sRad, 0);
      sGrad.addColorStop(0, 'rgba(255,255,255,0)');
      sGrad.addColorStop(0.4, rgba('140,210,255', fade * 0.95));
      sGrad.addColorStop(0.6, rgba('245,252,255', fade));
      sGrad.addColorStop(1, 'rgba(100,190,255,0)');
      ctx.strokeStyle = sGrad;
      ctx.lineWidth = 4.2;
      ctx.shadowColor = 'rgba(120,205,255,0.95)';
      ctx.shadowBlur = 18 * this.qualityConfig.blur;
      ctx.beginPath();
      ctx.arc(0, 0, sRad, 0, Math.PI * 0.85);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  };

  // 17. Warrior Triple Slash (Três cortes ritmados velozes)
  LineageVFX.prototype._drawWarriorTripleSlash = function (e) {
    var ctx = this.ctx, p = e.target, progress = clamp(e.age / e.maxAge, 0, 1), fade = 1 - progress;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(p.x, p.y);

    var angles = [-0.6, 0.2, 0.9];
    var delays = [0, 80, 160];
    for (var s = 0; s < 3; s++) {
      if (e.age >= delays[s]) {
        var sAge = e.age - delays[s];
        var sFade = clamp(1 - sAge / 320, 0, 1);
        var sLen = 72 * clamp(sAge / 90, 0, 1);
        ctx.save();
        ctx.rotate(angles[s]);
        var slGrad = ctx.createLinearGradient(-sLen, 0, sLen, 0);
        slGrad.addColorStop(0, 'rgba(255,255,255,0)');
        slGrad.addColorStop(0.5, rgba('200,230,255', sFade * 0.95));
        slGrad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.strokeStyle = slGrad;
        ctx.lineWidth = 4.5 * sFade;
        ctx.shadowColor = 'rgba(180,225,255,0.95)';
        ctx.shadowBlur = 20 * this.qualityConfig.blur;
        ctx.beginPath();
        ctx.moveTo(-sLen, 0);
        ctx.lineTo(sLen, 0);
        ctx.stroke();
        ctx.restore();
      }
    }
    ctx.restore();
  };

  // 18. Warrior Earth Tremor (Fendas na terra, pedregulhos e ondas sísmicas aos pés)
  LineageVFX.prototype._drawWarriorEarthTremor = function (e) {
    var ctx = this.ctx, p = e.target, progress = clamp(e.age / e.maxAge, 0, 1), fade = 1 - progress;
    var feetY = p.y;

    if (!e.state.impacted) {
      e.state.impacted = true;
      for (var r = 0; r < 24; r++) {
        var rAng = Math.random() * Math.PI * 2;
        this._addParticle({
          x: p.x + rand(-20, 20),
          y: feetY,
          vx: Math.cos(rAng) * rand(2.5, 7.5),
          vy: Math.sin(rAng) * rand(2.5, 7.5) - 3.5,
          max: rand(40, 85),
          radius: rand(4.5, 11),
          rgb: '150,115,75',
          kind: 'rock_debris',
          rotation: rand(0, 6.28),
          rotationSpeed: rand(-0.25, 0.25),
          gravity: 0.22,
          drag: 0.965
        });
      }
    }

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(p.x, feetY);
    ctx.scale(1, 0.38);

    // Fenda sísmica com brilho marrom/dourado
    var cratRad = 80 * (0.9 + Math.sin(e.age * 0.01) * 0.1);
    ctx.strokeStyle = rgba('255,180,70', fade * 0.95);
    ctx.lineWidth = 3.8;
    ctx.shadowColor = 'rgba(220,140,50,0.95)';
    ctx.shadowBlur = 22 * this.qualityConfig.blur;

    for (var f = 0; f < 6; f++) {
      var fAng = (f / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      var midX = Math.cos(fAng) * cratRad * 0.5 + rand(-6, 6);
      var midY = Math.sin(fAng) * cratRad * 0.5 + rand(-6, 6);
      ctx.lineTo(midX, midY);
      ctx.lineTo(Math.cos(fAng) * cratRad, Math.sin(fAng) * cratRad);
      ctx.stroke();
    }
    ctx.restore();
  };

  // 19. Warrior Force Burst (Detonação de chi marcial em esferas concêntricas de energia)
  LineageVFX.prototype._drawWarriorForceBurst = function (e) {
    var ctx = this.ctx, p = e.target, progress = clamp(e.age / e.maxAge, 0, 1), fade = 1 - progress;
    e.state.rotation += 0.14;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(p.x, p.y);

    var burstRad = 62 * (0.5 + progress * 0.7);
    var bGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, burstRad);
    bGrad.addColorStop(0, rgba('255,255,220', fade));
    bGrad.addColorStop(0.35, rgba('255,170,40', fade * 0.85));
    bGrad.addColorStop(0.7, rgba('240,80,20', fade * 0.45));
    bGrad.addColorStop(1, 'rgba(200,40,0,0)');
    ctx.fillStyle = bGrad;
    ctx.beginPath();
    ctx.arc(0, 0, burstRad, 0, Math.PI * 2);
    ctx.fill();

    // Anéis de chi giratórios
    ctx.rotate(e.state.rotation);
    ctx.strokeStyle = rgba('255,230,120', fade * 0.95);
    ctx.lineWidth = 3.5;
    ctx.shadowColor = 'rgba(255,160,30,0.95)';
    ctx.shadowBlur = 20 * this.qualityConfig.blur;
    ctx.beginPath();
    ctx.arc(0, 0, burstRad * 0.85, 0, Math.PI * 1.8);
    ctx.stroke();

    ctx.restore();
  };

  // 20. Warrior Spear Whirlwind (Vórtice giratório de lança)
  LineageVFX.prototype._drawWarriorSpearWhirlwind = function (e) {
    var ctx = this.ctx, p = e.target, progress = clamp(e.age / e.maxAge, 0, 1), fade = 1 - progress;
    var feetY = p.y;
    e.state.rotation += 0.16;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(p.x, feetY);

    for (var l = 0; l < 3; l++) {
      var lY = -((l / 3) * 65);
      ctx.save();
      ctx.translate(0, lY);
      ctx.scale(1, 0.38);
      ctx.rotate(e.state.rotation + l * 0.6);
      var wRad = 52 + l * 12;
      ctx.strokeStyle = rgba('255,190,110', fade * 0.9);
      ctx.lineWidth = 3.8;
      ctx.shadowColor = 'rgba(255,170,80,0.95)';
      ctx.shadowBlur = 18 * this.qualityConfig.blur;
      ctx.beginPath();
      ctx.arc(0, 0, wRad, 0, Math.PI * 1.5);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  };

  LineageVFX.prototype._drawLights = function (e) {
    var ctx = this.ctx;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < this.lightOrbs.length; i += 1) {
      var o = this.lightOrbs[i], x = (o.ax + Math.cos(this.time * 0.001 * o.speed + o.phase) * o.rx) * this.width, y = (o.ay + Math.sin(this.time * 0.001 * o.speed * 1.3 + o.phase) * o.ry) * this.height, radius = o.radius * (0.75 + Math.sin(this.time * 0.002 + o.phase) * 0.25);
      var gradient = ctx.createRadialGradient(x, y, 0, x, y, radius); gradient.addColorStop(0, rgba(o.rgb, 0.5)); gradient.addColorStop(0.4, rgba(o.rgb, 0.16)); gradient.addColorStop(1, rgba(o.rgb, 0)); ctx.fillStyle = gradient; ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
    }
    var sweep = (Math.sin(this.time * 0.00035) * 0.5 + 0.5) * this.width, ray = ctx.createLinearGradient(sweep - 140, 0, sweep + 140, 0); ray.addColorStop(0, rgba(e.rgb, 0)); ray.addColorStop(0.5, rgba(e.rgb, 0.08)); ray.addColorStop(1, rgba(e.rgb, 0)); ctx.fillStyle = ray; ctx.fillRect(sweep - 140, 0, 280, this.height);
    ctx.restore();
  };

  LineageVFX.prototype._drawParticle = function (p, alpha) {
    var ctx = this.ctx;
    if (p.kind === 'dot') {
      ctx.fillStyle = rgba(p.rgb, alpha); ctx.shadowColor = rgba(p.rgb, 0.7); ctx.shadowBlur = 6 * this.qualityConfig.blur; ctx.beginPath(); ctx.arc(p.x, p.y, p.radius * alpha, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    } else if (p.kind === 'smoke') {
      ctx.fillStyle = rgba(p.rgb, alpha * 0.3); ctx.beginPath(); ctx.arc(p.x, p.y, p.radius * (1.6 - alpha * 0.6), 0, Math.PI * 2); ctx.fill();
    } else if (p.kind === 'shard') {
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rotation); ctx.fillStyle = rgba(p.rgb, alpha * 0.9); ctx.shadowColor = rgba(p.rgb, 0.8); ctx.shadowBlur = 8 * this.qualityConfig.blur; ctx.beginPath(); ctx.moveTo(p.radius, 0); ctx.lineTo(-p.radius * 0.6, p.radius * 0.45); ctx.lineTo(-p.radius * 0.6, -p.radius * 0.45); ctx.closePath(); ctx.fill(); ctx.restore();
    } else if (p.kind === 'leaf') {
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rotation); ctx.fillStyle = rgba(p.rgb, alpha * 0.75); ctx.beginPath(); ctx.ellipse(0, 0, p.radius, p.radius * 0.45, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    } else if (p.kind === 'sparkle') {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation || 0);
      ctx.fillStyle = rgba(p.rgb, alpha);
      ctx.shadowColor = rgba(p.rgb, 0.9);
      ctx.shadowBlur = 10 * this.qualityConfig.blur;
      var s = p.radius * (0.8 + alpha * 0.4);
      ctx.beginPath();
      ctx.moveTo(0, -s * 2.2);
      ctx.lineTo(s * 0.4, -s * 0.4);
      ctx.lineTo(s * 2.2, 0);
      ctx.lineTo(s * 0.4, s * 0.4);
      ctx.lineTo(0, s * 2.2);
      ctx.lineTo(-s * 0.4, s * 0.4);
      ctx.lineTo(-s * 2.2, 0);
      ctx.lineTo(-s * 0.4, -s * 0.4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else if (p.kind === 'flame') {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation || 0);
      var fRad = p.radius * (0.6 + alpha * 0.7);
      var fGrad = ctx.createRadialGradient(0, fRad * 0.4, 0, 0, 0, fRad * 1.8);
      fGrad.addColorStop(0, rgba(p.rgbInner || '255,255,220', alpha * 0.95));
      fGrad.addColorStop(0.35, rgba(p.rgb || '255,140,30', alpha * 0.85));
      fGrad.addColorStop(0.75, rgba('240,50,10', alpha * 0.45));
      fGrad.addColorStop(1, 'rgba(180,20,0,0)');
      ctx.fillStyle = fGrad;
      ctx.shadowColor = rgba(p.rgb || '255,120,30', 0.9);
      ctx.shadowBlur = 14 * this.qualityConfig.blur;
      ctx.beginPath();
      // Teardrop / flickering flame polygon
      ctx.moveTo(0, -fRad * 2.2);
      ctx.bezierCurveTo(fRad * 1.2, -fRad * 0.8, fRad * 1.4, fRad * 0.9, 0, fRad * 1.3);
      ctx.bezierCurveTo(-fRad * 1.4, fRad * 0.9, -fRad * 1.2, -fRad * 0.8, 0, -fRad * 2.2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else if (p.kind === 'ice_crystal') {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation || 0);
      var iRad = p.radius * (0.8 + alpha * 0.3);
      ctx.fillStyle = rgba(p.rgb || '180,240,255', alpha * 0.9);
      ctx.shadowColor = 'rgba(140,230,255,0.95)';
      ctx.shadowBlur = 10 * this.qualityConfig.blur;
      // 6-pointed hexagonal ice crystal spike
      ctx.beginPath();
      ctx.moveTo(0, -iRad * 2.2);
      ctx.lineTo(iRad * 0.55, -iRad * 0.55);
      ctx.lineTo(iRad * 1.8, 0);
      ctx.lineTo(iRad * 0.55, iRad * 0.55);
      ctx.lineTo(0, iRad * 2.2);
      ctx.lineTo(-iRad * 0.55, iRad * 0.55);
      ctx.lineTo(-iRad * 1.8, 0);
      ctx.lineTo(-iRad * 0.55, -iRad * 0.55);
      ctx.closePath();
      ctx.fill();
      // Inner frozen core shine
      ctx.fillStyle = rgba('255,255,255', alpha * 0.95);
      ctx.beginPath();
      ctx.arc(0, 0, iRad * 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (p.kind === 'soul_mote') {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.fillStyle = rgba(p.rgb, alpha * 0.85);
      ctx.shadowColor = rgba(p.rgb, 0.95);
      ctx.shadowBlur = 12 * this.qualityConfig.blur;
      ctx.beginPath();
      ctx.arc(0, 0, p.radius * (1 + (1 - alpha)), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (p.kind === 'rock_debris') {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation || 0);
      var rW = p.radius * (0.8 + alpha * 0.2);
      ctx.fillStyle = rgba(p.rgb || '140,110,80', alpha * 0.95);
      ctx.beginPath();
      ctx.moveTo(-rW, -rW * 0.6);
      ctx.lineTo(rW * 0.7, -rW);
      ctx.lineTo(rW, rW * 0.5);
      ctx.lineTo(-rW * 0.4, rW * 0.9);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else if (p.kind === 'blood_drop') {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation || 0);
      var bRad = p.radius * (0.8 + alpha * 0.4);
      ctx.fillStyle = rgba(p.rgb || '220,20,50', alpha * 0.9);
      ctx.shadowColor = 'rgba(180,10,30,0.8)';
      ctx.shadowBlur = 6 * this.qualityConfig.blur;
      ctx.beginPath();
      ctx.ellipse(0, 0, bRad, bRad * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  };

  LineageVFX.prototype._drawAmbient = function () {
    if (!this.ambient) return;
    var ctx = this.ctx;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < this.ambientParticles.length; i += 1) {
      var p = this.ambientParticles[i], x = p.x * this.width, y = p.y * this.height, flicker = 0.35 + 0.65 * Math.abs(Math.sin(this.time * 0.002 + p.phase)), gradient = ctx.createRadialGradient(x, y, 0, x, y, p.r * 5);
      gradient.addColorStop(0, rgba(p.rgb, 0.16 * flicker)); gradient.addColorStop(1, rgba(p.rgb, 0)); ctx.fillStyle = gradient; ctx.beginPath(); ctx.arc(x, y, p.r * 5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  };

  LineageVFX.prototype._updateAmbient = function (dt) {
    if (!this.ambient) return;
    for (var i = 0; i < this.ambientParticles.length; i += 1) {
      var p = this.ambientParticles[i]; p.y -= p.speed * 0.0001 * dt; p.x += Math.sin(this.time * 0.001 * p.sway + p.phase) * 0.00002 * dt;
      if (p.y < -0.02) { p.y = 1.02; p.x = Math.random(); }
    }
  };

  LineageVFX.prototype._frame = function (now) {
    if (!this.running) return;
    var dt = this.lastTime ? Math.min(40, now - this.lastTime) : 16;
    this.lastTime = now; this.time += dt;
    var ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    this._updateAmbient(dt); this._drawAmbient();

    for (var i = this.effects.length - 1; i >= 0; i -= 1) {
      var e = this.effects[i];
      this._update(e, dt);
      if (e.type === 'lights') this._drawLights(e);
      if (e.type === 'lightning') this._drawLightning(e);
      if (e.type === 'arrow_rain') this._drawArrowRain(e);
      if (e.type === 'energy_slash') this._drawEnergySlash(e);
      if (e.type === 'cross_slash') this._drawCrossSlash(e);
      if (e.type === 'double_shot') this._drawDoubleShot(e, dt);
      if (e.type === 'power_smash') this._drawPowerSmash(e);
      if (e.type === 'dark_vortex') this._drawDarkVortex(e);
      if (e.type === 'holy_beam') this._drawHolyBeam(e);
      if (e.type === 'holy_heal') this._drawHolyHeal(e);
      if (e.type === 'buff_aura') this._drawBuffAura(e);
      if (e.type === 'whirlwind') this._drawWhirlwind(e);
      if (e.type === 'frost_slash') this._drawFrostSlash(e);
      if (e.type === 'frost_blizzard') this._drawFrostBlizzard(e);
      if (e.type === 'inferno_slash') this._drawInfernoSlash(e);
      if (e.type === 'inferno_dragon_breath') this._drawInfernoDragonBreath(e);
      if (e.type === 'monster_inferno_pillar') this._drawMonsterInfernoPillar(e);
      if (e.type === 'monster_frost_freeze') this._drawMonsterFrostFreeze(e);
      if (e.type === 'celestial_strike') this._drawCelestialStrike(e);
      if (e.type === 'hero_skin_aura') this._drawHeroSkinAura(e);

      // NOVOS DISPATCHES DE MAGOS
      if (e.type === 'wind_strike') this._drawWindStrike(e);
      if (e.type === 'flame_strike') this._drawFlameStrike(e);
      if (e.type === 'magic_prominence') this._drawMagicProminence(e);
      if (e.type === 'magic_meteor') this._drawMagicMeteor(e);
      if (e.type === 'magic_hydro_blast') this._drawMagicHydroBlast(e);
      if (e.type === 'magic_hurricane') this._drawMagicHurricane(e);
      if (e.type === 'magic_lightning_surge') this._drawMagicLightningSurge(e);
      if (e.type === 'magic_death_spike') this._drawMagicDeathSpike(e);
      if (e.type === 'magic_vampiric_drain') this._drawMagicVampiricDrain(e);
      if (e.type === 'magic_dark_mire') this._drawMagicDarkMire(e);
      if (e.type === 'magic_solar_flare') this._drawMagicSolarFlare(e);
      if (e.type === 'magic_holy_sanctuary') this._drawMagicHolySanctuary(e);

      // NOVOS DISPATCHES DE GUERREIROS & ARQUEIROS
      if (e.type === 'snipe_shot') this._drawSnipeShot(e);
      if (e.type === 'burst_fire') this._drawBurstFire(e, dt);
      if (e.type === 'seven_arrow') this._drawSevenArrow(e, dt);
      if (e.type === 'warrior_backstab') this._drawWarriorBackstab(e);
      if (e.type === 'warrior_deadly_blow') this._drawWarriorDeadlyBlow(e);
      if (e.type === 'warrior_sonic_storm') this._drawWarriorSonicStorm(e);
      if (e.type === 'warrior_triple_slash') this._drawWarriorTripleSlash(e);
      if (e.type === 'warrior_earth_tremor') this._drawWarriorEarthTremor(e);
      if (e.type === 'warrior_force_burst') this._drawWarriorForceBurst(e);
      if (e.type === 'warrior_spear_whirlwind') this._drawWarriorSpearWhirlwind(e);

      if (e.type === 'fireball' || e.type === 'ice_shards' || e.type === 'wind_blast' || e.type === 'arcane_missile' || e.type === 'spiral_spear') this._drawProjectile(e);
      if (e.type === 'energy_slash' || e.type === 'spiral_spear' || e.type === 'frost_slash' || e.type === 'inferno_slash' || e.type === 'inferno_dragon_breath') this._drawCasterGlyph(e.source, e.rgb, clamp(1 - e.age / 500, 0, 1));
      if (e.done) {
        if (typeof e.options.onComplete === 'function') e.options.onComplete(e);
        this.effects.splice(i, 1);
      }
    }

    ctx.save();
    for (var p = this.particles.length - 1; p >= 0; p -= 1) {
      var particle = this.particles[p]; particle.age += dt; particle.vx *= Math.pow(particle.drag, dt / 16); particle.vy = particle.vy * Math.pow(particle.drag, dt / 16) + particle.gravity * (dt / 16); particle.x += particle.vx * (dt / 16); particle.y += particle.vy * (dt / 16); particle.rotation += particle.rotationSpeed * (dt / 16);
      var alpha = 1 - particle.age / particle.max;
      if (alpha <= 0) { this.particles.splice(p, 1); continue; }
      ctx.globalCompositeOperation = particle.additive ? 'lighter' : 'source-over'; this._drawParticle(particle, alpha);
    }
    ctx.globalCompositeOperation = 'lighter';
    for (var r = this.rings.length - 1; r >= 0; r -= 1) {
      var ring = this.rings[r]; ring.age += dt; ring.radius += ring.speed * dt / 16; var ringAlpha = 1 - ring.age / ring.max;
      if (ringAlpha <= 0) { this.rings.splice(r, 1); continue; }
      ctx.strokeStyle = rgba(ring.rgb, ringAlpha * 0.85); ctx.lineWidth = ring.width; ctx.shadowColor = rgba(ring.rgb, 0.9); ctx.shadowBlur = 14 * this.qualityConfig.blur; ctx.beginPath(); ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2); ctx.stroke(); ctx.shadowBlur = 0;
    }
    ctx.restore();

    this.flash *= Math.pow(0.88, dt / 16);
    if (this.flash > 0.02) { ctx.fillStyle = rgba(this.flashRgb, this.flash * 0.1); ctx.fillRect(0, 0, this.width, this.height); }
    var self = this;
    this.raf = requestAnimationFrame(function (next) { self._frame(next); });
  };

  LineageVFX.prototype.start = function () {
    if (this.running) return;
    this.running = true;
    var self = this;
    this.raf = requestAnimationFrame(function (now) { self._frame(now); });
  };

  LineageVFX.prototype.stop = function () {
    this.running = false;
    cancelAnimationFrame(this.raf);
  };

  LineageVFX.prototype.clear = function () {
    this.effects.length = 0; this.particles.length = 0; this.rings.length = 0; this.flash = 0;
  };

  LineageVFX.prototype.destroy = function () {
    this.stop(); this.clear(); window.removeEventListener('resize', this._onResize);
    if (this.resizeObserver) this.resizeObserver.disconnect();
    if (this._createdCanvas && this.canvas.parentNode) this.canvas.parentNode.removeChild(this.canvas);
  };

  global.LineageVFX = LineageVFX;
  global.LINEAGE_VFX_META = META;
})(window);
