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
    lights: { rgb: '242,201,110' }
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
      this.canvas.setAttribute('aria-hidden', 'true');
      this.canvas.style.position = 'absolute';
      this.canvas.style.inset = '0';
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      this.canvas.style.pointerEvents = 'none';
      this.canvas.style.zIndex = String(this.container === document.body ? 20 : 2);
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
    if (e.type === 'arcane_missile') e.state.speed = e.speed || 5.4;
    if (e.type === 'energy_slash') e.state.speed = e.speed || 6.4;
    if (e.type === 'spiral_spear') e.state.speed = e.speed || 7.2;
    if (e.type === 'cross_slash') e.state.age = 0;

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
    if (e.type === 'fireball' || e.type === 'ice_shards' || e.type === 'wind_blast' || e.type === 'arcane_missile' || e.type === 'energy_slash' || e.type === 'spiral_spear') {
      this._updateProjectile(e, dt);
    }
    if (e.type === 'lightning') {
      if (e.age > e.maxAge) e.done = true;
    }
    if (e.type === 'arrow_rain') this._updateArrowRain(e, dt);
    if (e.type === 'cross_slash') {
      if (!e.state.impacted && e.age >= 255) {
        e.state.impacted = true;
        this._impact(e, e.target.x, e.target.y);
      }
      if (e.age > (e.maxAge || 560)) e.done = true;
    }
    if (e.type === 'lights' && e.age > e.maxAge) e.done = true;
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
      if (e.type === 'fireball' || e.type === 'ice_shards' || e.type === 'wind_blast' || e.type === 'arcane_missile' || e.type === 'spiral_spear') this._drawProjectile(e);
      if (e.type === 'energy_slash' || e.type === 'spiral_spear') this._drawCasterGlyph(e.source, e.rgb, clamp(1 - e.age / 500, 0, 1));
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
