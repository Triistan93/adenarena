import './vfx-lineage-idle.js';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function distance(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.hypot(dx, dy);
}

function makeParticle(x, y, opts = {}) {
  return {
    x,
    y,
    vx: opts.vx ?? 0,
    vy: opts.vy ?? 0,
    life: opts.life ?? 0.6,
    maxLife: opts.life ?? 0.6,
    size: opts.size ?? 2,
    color: opts.color ?? '#ffffff',
    alpha: opts.alpha ?? 1,
    drift: opts.drift ?? 0,
    rotation: opts.rotation ?? 0,
    spin: opts.spin ?? 0,
    glow: opts.glow ?? 0
  };
}

function emitBurst(effect, count, opts = {}) {
  const quality = effect.quality || 1;
  const limit = Math.min(count, Math.max(4, Math.round(count * quality)));
  for (let i = 0; i < limit; i++) {
    const angle = (opts.angle ?? 0) + (Math.random() - 0.5) * (opts.spread ?? 0.8);
    const speed = (opts.speed ?? 140) * (0.6 + Math.random() * 0.8);
    effect.particles.push(makeParticle(opts.x ?? effect.x, opts.y ?? effect.y, {
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: (opts.life ?? 0.5) * (0.75 + Math.random() * 0.5),
      size: (opts.size ?? 2) * (0.7 + Math.random() * 0.6),
      color: opts.color ?? effect.color ?? '#ffffff',
      alpha: opts.alpha ?? 0.9,
      glow: opts.glow ?? 0,
      drift: opts.drift ?? 0
    }));
  }
}

function drawGlow(ctx, x, y, r, color, alpha = 1) {
  const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
  grad.addColorStop(0, color.replace(/\s+/g, '') + (alpha > 0.9 ? '' : ''));
  grad.addColorStop(0.2, `${color}cc`);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.beginPath();
  ctx.fillStyle = grad;
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawLine(ctx, x1, y1, x2, y2, width, color, alpha = 1) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

function drawRing(ctx, x, y, radius, color, alpha = 1) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = 2 + radius * 0.08;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function makeEffect(def) {
  return {
    ...def,
    age: 0,
    particles: [],
    startedAt: performance.now(),
    quality: def.quality || 1
  };
}

function resolveVfxHost(root) {
  if (!root) return null;
  if (root.getElementById) {
    return root.getElementById('stage') || root.querySelector?.('#stage') || null;
  }
  if (root.querySelector) {
    return root.querySelector('#stage') || null;
  }
  return null;
}

export function createCombatVFX(root, opts = {}) {
  if (typeof window !== 'undefined' && window.LineageVFX && root) {
    const host = resolveVfxHost(root) || root;
    const qualityConfig = (quality) => {
      const q = String(quality || 'high').toLowerCase();
      if (q === 'low') return { particles: 0.65, blur: 0.7 };
      if (q === 'high') return { particles: 1.45, blur: 1.2 };
      return { particles: 1, blur: 0.95 };
    };
    const engine = new window.LineageVFX({ container: host, quality: opts.quality || 'high' });
    const setQuality = (quality) => {
      const next = String(quality || 'high').toLowerCase();
      engine.quality = next;
      engine.qualityConfig = qualityConfig(next);
      engine.maxParticles = next === 'low' ? 1400 : next === 'high' ? 3200 : 2200;
      if (typeof window !== 'undefined' && window.localStorage) {
        try { window.localStorage.setItem('lineage-idle-vfx-quality', next); } catch (_) {}
      }
    };
    setQuality(opts.quality || 'high');
    return {
      play: (type, options = {}) => engine.play(type, options),
      clear: () => engine.clear(),
      dispose: () => engine.destroy(),
      setQuality,
      canvas: engine.canvas,
      ctx: engine.ctx
    };
  }

  if (!root || typeof window === 'undefined' || !root.getBoundingClientRect) return null;

  const canvas = document.createElement('canvas');
  canvas.className = 'combat-vfx-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  root.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const state = {
    effects: [],
    quality: opts.quality || 'high',
    dpr: Math.min(window.devicePixelRatio || 1, 2),
    raf: null,
    lastTime: performance.now()
  };

  const resize = () => {
    const rect = root.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    canvas.width = width * state.dpr;
    canvas.height = height * state.dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  };

  const setQuality = (quality) => {
    state.quality = quality || 'medium';
    if (typeof window !== 'undefined' && window.localStorage) {
      try { window.localStorage.setItem('lineage-idle-vfx-quality', state.quality); } catch (_) {}
    }
  };

  const qualityFactor = () => {
    const q = String(state.quality || 'medium').toLowerCase();
    if (q === 'low') return 0.65;
    if (q === 'high') return 1.3;
    return 1;
  };

  const update = (dt) => {
    for (let i = state.effects.length - 1; i >= 0; i--) {
      const effect = state.effects[i];
      effect.age += dt;
      effect.life = (effect.life ?? 1) - dt;

      if (effect.type === 'fireball') {
        effect.progress = clamp(effect.age / Math.max(0.2, effect.duration || 0.8), 0, 1);
        effect.x = lerp(effect.source.x, effect.target.x, easeOutCubic(effect.progress));
        effect.y = lerp(effect.source.y, effect.target.y, easeOutCubic(effect.progress));
        effect.y += Math.sin(effect.progress * Math.PI * 3) * 8 * (effect.power || 1);
        effect.trail.push({ x: effect.x, y: effect.y, t: effect.age });
        if (effect.trail.length > 10) effect.trail.shift();
        if (effect.progress >= 1 && effect.particles.length < 24) {
          emitBurst(effect, 18, {
            x: effect.target.x,
            y: effect.target.y,
            angle: Math.PI * 0.5,
            spread: Math.PI * 1.6,
            speed: 180,
            life: 0.55,
            size: 3,
            color: '#ffb347'
          });
        }
        if (effect.progress >= 1) {
          effect.finished = true;
        }
      }

      if (effect.type === 'ice_shards') {
        effect.progress = clamp(effect.age / Math.max(0.2, effect.duration || 0.9), 0, 1);
        effect.x = lerp(effect.source.x, effect.target.x, effect.progress);
        effect.y = lerp(effect.source.y, effect.target.y, effect.progress);
        effect.y += Math.sin(effect.progress * Math.PI * 2) * 6;
        effect.particles.push(makeParticle(effect.x, effect.y, {
          vx: (Math.random() - 0.5) * 60,
          vy: (Math.random() - 0.5) * 40,
          life: 0.45 + Math.random() * 0.25,
          size: 2 + Math.random() * 2,
          color: '#dff8ff',
          alpha: 0.8
        }));
        if (effect.progress >= 1 && effect.particles.length < 40) {
          emitBurst(effect, 14, { x: effect.target.x, y: effect.target.y, angle: Math.PI * 0.25, spread: Math.PI * 1.2, speed: 90, life: 0.6, size: 2, color: '#86e4ff' });
        }
        if (effect.progress >= 1) effect.finished = true;
      }

      if (effect.type === 'wind_blast') {
        effect.progress = clamp(effect.age / Math.max(0.2, effect.duration || 0.7), 0, 1);
        effect.x = lerp(effect.source.x, effect.target.x, effect.progress);
        effect.y = lerp(effect.source.y, effect.target.y, effect.progress);
        effect.y += Math.sin(effect.progress * Math.PI * 4) * 14;
        if (effect.age < effect.duration * 0.8) {
          emitBurst(effect, 2, { x: effect.x, y: effect.y, angle: Math.PI * 0.5 + Math.sin(effect.age * 18) * 0.3, spread: 0.3, speed: 45, life: 0.35, size: 1.5, color: '#7fffd4' });
        }
        if (effect.progress >= 1) effect.finished = true;
      }

      if (effect.type === 'arcane_missile') {
        effect.progress = clamp(effect.age / Math.max(0.2, effect.duration || 0.95), 0, 1);
        effect.x = lerp(effect.source.x, effect.target.x, effect.progress);
        effect.y = lerp(effect.source.y, effect.target.y, effect.progress);
        effect.orbit += dt * 8;
        if (effect.progress < 1) {
          effect.particles.push(makeParticle(effect.x, effect.y, { vx: (Math.random() - 0.5) * 20, vy: (Math.random() - 0.5) * 25, life: 0.5, size: 1.5, color: '#b48cff', alpha: 0.85 }));
        }
        if (effect.progress >= 1 && effect.particles.length < 36) {
          emitBurst(effect, 16, { x: effect.target.x, y: effect.target.y, angle: Math.PI * 0.5, spread: Math.PI * 1.8, speed: 120, life: 0.55, size: 2.3, color: '#e6e4ff' });
        }
        if (effect.progress >= 1) effect.finished = true;
      }

      if (effect.type === 'lightning') {
        effect.progress = clamp(effect.age / Math.max(0.2, effect.duration || 0.55), 0, 1);
        effect.x = lerp(effect.source.x, effect.target.x, effect.progress);
        effect.y = lerp(effect.source.y, effect.target.y, effect.progress);
        effect.flash = Math.max(0, 1 - effect.progress);
        if (effect.progress >= 1) effect.finished = true;
      }

      if (effect.type === 'energy_slash') {
        effect.progress = clamp(effect.age / Math.max(0.2, effect.duration || 0.65), 0, 1);
        effect.x = lerp(effect.source.x, effect.target.x, effect.progress);
        effect.y = lerp(effect.source.y, effect.target.y, effect.progress);
        effect.y += Math.sin(effect.progress * Math.PI) * 26 * (effect.power || 1);
        if (effect.progress < 1) {
          emitBurst(effect, 2, { x: effect.x, y: effect.y, angle: Math.PI * 0.5 + Math.sin(effect.age * 18) * 0.1, spread: 0.2, speed: 35, life: 0.28, size: 1.3, color: '#95e6ff' });
        }
        if (effect.progress >= 1 && effect.particles.length < 18) {
          emitBurst(effect, 10, { x: effect.target.x, y: effect.target.y, angle: Math.PI * 0.2, spread: Math.PI * 1.1, speed: 100, life: 0.4, size: 2.2, color: '#b9f4ff' });
        }
        if (effect.progress >= 1) effect.finished = true;
      }

      if (effect.type === 'arrow_rain') {
        effect.progress = clamp(effect.age / Math.max(0.2, effect.duration || 1.15), 0, 1);
        effect.t = effect.progress;
        if (effect.particles.length < 1) {
          const count = Math.max(6, Math.round((effect.arrowCount || 12) * qualityFactor()));
          for (let i = 0; i < count; i++) {
            const startX = effect.targetArea.x + (Math.random() - 0.5) * (effect.targetArea.width || 160);
            const startY = effect.targetArea.y - 120 - i * 10 - Math.random() * 60;
            const endX = startX + (Math.random() - 0.5) * 22;
            const endY = effect.targetArea.y + (Math.random() - 0.5) * 24;
            effect.particles.push(makeParticle(startX, startY, {
              vx: 0,
              vy: 320 + Math.random() * 120,
              life: 0.9 + Math.random() * 0.2,
              size: 1.4 + Math.random() * 1.2,
              color: '#f4e0b5',
              alpha: 0.95,
              drift: endX - startX
            }));
          }
        }
        for (let p of effect.particles) {
          p.y += dt * p.vy;
          p.x += dt * p.drift * 0.7;
          p.vy += dt * 220;
          p.life -= dt;
        }
        effect.particles = effect.particles.filter((p) => p.life > 0);
        if (effect.progress >= 1 && effect.particles.length === 0) effect.finished = true;
      }

      if (effect.type === 'cross_slash') {
        effect.progress = clamp(effect.age / Math.max(0.2, effect.duration || 0.45), 0, 1);
        effect.x = lerp(effect.source.x, effect.target.x, effect.progress);
        effect.y = lerp(effect.source.y, effect.target.y, effect.progress);
        if (effect.progress < 1) {
          emitBurst(effect, 8, { x: effect.target.x, y: effect.target.y, angle: Math.PI * 0.25, spread: 0.8, speed: 90, life: 0.35, size: 1.8, color: '#f7f6ff' });
        }
        if (effect.progress >= 1) effect.finished = true;
      }

      if (effect.type === 'spiral_spear') {
        effect.progress = clamp(effect.age / Math.max(0.2, effect.duration || 0.95), 0, 1);
        effect.x = lerp(effect.source.x, effect.target.x, effect.progress);
        effect.y = lerp(effect.source.y, effect.target.y, effect.progress);
        effect.rotation = effect.age * 11;
        effect.particles.push(makeParticle(effect.x, effect.y, { vx: (Math.random() - 0.5) * 20, vy: (Math.random() - 0.5) * 18, life: 0.35, size: 1.7, color: '#ffcc66', alpha: 0.95 }));
        if (effect.progress >= 1 && effect.particles.length < 20) {
          emitBurst(effect, 10, { x: effect.target.x, y: effect.target.y, angle: Math.PI * 0.5, spread: Math.PI * 1.4, speed: 100, life: 0.45, size: 2, color: '#ffefb6' });
        }
        if (effect.progress >= 1) effect.finished = true;
      }

      if (effect.finished) {
        state.effects.splice(i, 1);
      }
    }
  };

  const render = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const effect of state.effects) {
      if (!effect) continue;
      const alpha = clamp(1 - effect.age / Math.max(0.2, (effect.duration || 1) + 0.2), 0.15, 1);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      if (effect.type === 'fireball') {
        const r = 10 + (effect.power || 1) * 3;
        drawGlow(ctx, effect.x, effect.y, r * 1.6, '#ff7a23', 0.8);
        drawGlow(ctx, effect.x, effect.y, r * 0.9, '#ffd36a', 0.9);
        ctx.beginPath();
        ctx.fillStyle = '#fff3b0';
        ctx.arc(effect.x, effect.y, r * 0.4, 0, Math.PI * 2);
        ctx.fill();
        if (effect.trail) {
          effect.trail.forEach((point, idx) => {
            const p = idx / Math.max(1, effect.trail.length - 1);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 140, 60, ${0.22 + 0.4 * p})`;
            ctx.lineWidth = 2 + p * 2;
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(effect.x, effect.y);
            ctx.stroke();
          });
        }
      }

      if (effect.type === 'ice_shards') {
        drawGlow(ctx, effect.x, effect.y, 16, '#8ce6ff', 0.5);
        for (let i = 0; i < 3; i++) {
          const spread = (i - 1) * 8;
          ctx.save();
          ctx.translate(effect.x + spread, effect.y - 8 + (i % 2) * 4);
          ctx.rotate((i - 1) * 0.3);
          ctx.beginPath();
          ctx.moveTo(0, -8);
          ctx.lineTo(6, 6);
          ctx.lineTo(0, 10);
          ctx.lineTo(-6, 6);
          ctx.closePath();
          ctx.fillStyle = '#dcf9ff';
          ctx.globalAlpha = 0.8;
          ctx.fill();
          ctx.restore();
        }
      }

      if (effect.type === 'wind_blast') {
        const segments = 10;
        for (let i = 0; i < segments; i++) {
          const t = i / segments;
          const sx = lerp(effect.source.x, effect.target.x, t);
          const sy = lerp(effect.source.y, effect.target.y, t) + Math.sin((t * Math.PI * 3) + effect.age * 12) * (10 + i * 1.4);
          const ex = lerp(effect.source.x, effect.target.x, (i + 1) / segments);
          const ey = lerp(effect.source.y, effect.target.y, (i + 1) / segments) + Math.sin(((i + 1) * Math.PI * 3) + effect.age * 12) * (10 + i * 1.4);
          drawLine(ctx, sx, sy, ex, ey, 1.5 + i * 0.1, '#72f3ca', 0.55 + t * 0.25);
        }
      }

      if (effect.type === 'arcane_missile') {
        const coreR = 8 + (effect.power || 1) * 1.5;
        drawGlow(ctx, effect.x, effect.y, coreR * 2.2, '#874dff', 0.6);
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, coreR, 0, Math.PI * 2);
        ctx.fillStyle = '#cdbeff';
        ctx.fill();
        for (let i = 0; i < 3; i++) {
          const ang = effect.orbit + i * (Math.PI * 2 / 3);
          const ox = effect.x + Math.cos(ang) * (coreR + 8);
          const oy = effect.y + Math.sin(ang) * (coreR + 8);
          ctx.beginPath();
          ctx.arc(ox, oy, 2.2 + i * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = '#92cbff';
          ctx.fill();
        }
      }

      if (effect.type === 'lightning') {
        drawLine(ctx, effect.source.x, effect.source.y, effect.x, effect.y, 3, '#91f3ff', 0.75 + effect.flash * 0.25);
        const midX = (effect.source.x + effect.x) * 0.5;
        const midY = (effect.source.y + effect.y) * 0.5;
        drawLine(ctx, midX, midY - 20, effect.x, effect.y, 2, '#ffffff', 0.5 + effect.flash * 0.2);
      }

      if (effect.type === 'energy_slash') {
        const controlX = (effect.source.x + effect.target.x) * 0.5 + (Math.sin(effect.age * 11) * 40);
        const controlY = (effect.source.y + effect.target.y) * 0.5 - 45;
        ctx.beginPath();
        ctx.moveTo(effect.source.x, effect.source.y);
        ctx.quadraticCurveTo(controlX, controlY, effect.target.x, effect.target.y);
        ctx.strokeStyle = 'rgba(128, 223, 255, 0.85)';
        ctx.lineWidth = 4 + (effect.power || 1) * 1.1;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(effect.source.x, effect.source.y + 5);
        ctx.quadraticCurveTo(controlX, controlY + 9, effect.target.x, effect.target.y + 5);
        ctx.strokeStyle = 'rgba(255,255,255,0.75)';
        ctx.lineWidth = 1.8;
        ctx.stroke();
      }

      if (effect.type === 'arrow_rain') {
        for (const particle of effect.particles) {
          const x = particle.x;
          const y = particle.y;
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(Math.atan2(8, 12));
          ctx.fillStyle = 'rgba(255, 237, 187, 0.9)';
          ctx.fillRect(-6, -1.2, 12, 2.4);
          ctx.fillStyle = '#ff9d2f';
          ctx.fillRect(6, -1.2, 2.5, 2.4);
          ctx.restore();
        }
      }

      if (effect.type === 'cross_slash') {
        drawLine(ctx, effect.source.x, effect.source.y, effect.target.x, effect.target.y, 3.5, '#dff9ff', 0.72);
        drawLine(ctx, effect.source.x + 10, effect.source.y - 10, effect.target.x - 10, effect.target.y + 10, 3.5, '#ffffff', 0.72);
      }

      if (effect.type === 'spiral_spear') {
        const tipX = effect.x + Math.cos(effect.rotation * 0.1) * 16;
        const tipY = effect.y + Math.sin(effect.rotation * 0.1) * 16;
        drawLine(ctx, effect.source.x, effect.source.y, tipX, tipY, 2.5, '#ffcf66', 0.8);
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#ffe5b3';
        ctx.fill();
      }

      for (const particle of effect.particles || []) {
        const lifeRatio = particle.life / particle.maxLife;
        ctx.beginPath();
        ctx.fillStyle = particle.color.replace(/[\da-f]{2}/gi, (m) => m);
        ctx.globalAlpha = clamp(lifeRatio * (particle.alpha ?? 1), 0, 1);
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  };

  const tick = (time) => {
    const dt = Math.min(0.032, (time - state.lastTime) / 1000);
    state.lastTime = time;
    update(dt);
    render();
    state.raf = window.requestAnimationFrame(tick);
  };

  const start = () => {
    if (state.raf != null) return;
    state.lastTime = performance.now();
    state.raf = window.requestAnimationFrame(tick);
  };

  const clear = () => {
    state.effects = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const dispose = () => {
    if (state.raf != null) {
      window.cancelAnimationFrame(state.raf);
      state.raf = null;
    }
    canvas.remove();
  };

  const play = (type, options = {}) => {
    const effect = makeEffect({
      type,
      source: options.source || { x: 0, y: 0 },
      target: options.target || { x: 0, y: 0 },
      targetArea: options.targetArea || null,
      color: options.color || '#ffffff',
      power: Number(options.power) || 1,
      duration: Number(options.duration) || 0.9,
      arrowCount: options.arrowCount || 12,
      life: Number(options.duration) || 0.9,
      trail: [],
      x: options.source?.x || 0,
      y: options.source?.y || 0,
      orbit: 0,
      rotation: 0,
      particles: []
    });

    if (effect.type === 'fireball') {
      effect.particles.push(makeParticle(effect.source.x, effect.source.y, { life: 0.35, size: 2.5, color: '#ffefb6', alpha: 0.95 }));
    }

    if (effect.type === 'arcane_missile') {
      effect.particles.push(makeParticle(effect.source.x, effect.source.y, { life: 0.4, size: 2.2, color: '#b8c8ff', alpha: 0.95 }));
    }

    if (effect.type === 'lightning') {
      effect.flash = 1;
    }

    state.effects.push(effect);
    start();
    return effect;
  };

  resize();
  window.addEventListener('resize', resize);

  const initialQuality = (typeof window !== 'undefined' && window.localStorage) ? window.localStorage.getItem('lineage-idle-vfx-quality') : null;
  if (initialQuality) setQuality(initialQuality);

  return { play, clear, dispose, setQuality, canvas, ctx };
}

let VFX = null;

export function initializeVFX(root = null) {
  const host = resolveVfxHost(root);
  if (VFX?.canvas?.parentNode && VFX.canvas.parentNode !== host) {
    VFX.dispose?.();
  }

  if (VFX?.canvas && VFX.canvas.parentNode === host) {
    return VFX;
  }

  VFX = host ? createCombatVFX(host) : null;
  if (typeof window !== 'undefined' && VFX) {
    window.VFX = VFX;
  }
  return VFX;
}

export { VFX };
