/**
 * GameCanvas2D.js â€” Motor de Batalha 2D / 32-bits Pixel Art (Estilo Task Bar Hero).
 * Renderiza em HTML5 Canvas o combate contÃ­nuo com sprites, animaÃ§Ãµes, efeitos e nÃºmeros de dano flutuantes.
 */

export class GameCanvas2D {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement ? canvasElement.getContext('2d') : null;
    this.images = {};
    this.loadedImages = {};
    this.floatingTexts = [];
    this.particles = [];
    this.lastTime = performance.now();
    this.heroFrame = 0;
    this.heroFrameTimer = 0;
    this.monsterFrame = 0;
    this.monsterFrameTimer = 0;
    this.heroState = 'idle'; // 'idle', 'run', 'attack', 'cast', 'hurt'
    this.heroActionTimer = 0;
    this.isCompactMode = false;
    this.isRunning = false;
    this.animationId = null;

    if (this.canvas) {
      this.init();
    }
  }

  init() {
    this.loadSpriteAssets();
    this.startLoop();
  }

  loadSpriteAssets() {
    const assetsToLoad = {
      hero_idle: '/assets/2d/heroes/knight/Knight_1/Idle.png',
      hero_run: '/assets/2d/heroes/knight/Knight_1/Run.png',
      hero_attack1: '/assets/2d/heroes/knight/Knight_1/Attack 1.png',
      hero_attack2: '/assets/2d/heroes/knight/Knight_1/Attack 2.png',
      hero_hurt: '/assets/2d/heroes/knight/Knight_1/Hurt.png',
      hero_dead: '/assets/2d/heroes/knight/Knight_1/Dead.png'
    };

    for (const [key, src] of Object.entries(assetsToLoad)) {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        this.loadedImages[key] = img;
      };
      this.images[key] = img;
    }
  }

  triggerHeroAttack(isSkill = false) {
    this.heroState = isSkill ? 'cast' : 'attack';
    this.heroActionTimer = 0.45; // DuraÃ§Ã£o da animaÃ§Ã£o de ataque em segundos
    this.heroFrame = 0;
  }

  triggerHeroHurt() {
    if (this.heroState !== 'attack') {
      this.heroState = 'hurt';
      this.heroActionTimer = 0.25;
    }
  }

  addDamageNumber(text, x, y, type = 'normal') {
    let color = '#ffffff';
    let fontSize = 14;
    let fontWeight = 'bold';

    if (type === 'crit') {
      color = '#fde047';
      fontSize = 18;
      text = 'âš¡ ' + text;
    } else if (type === 'hero_damage') {
      color = '#f87171';
      fontSize = 14;
    } else if (type === 'heal') {
      color = '#4ade80';
      fontSize = 15;
      text = '+' + text;
    } else if (type === 'miss') {
      color = '#94a3b8';
      text = 'MISS';
    }

    this.floatingTexts.push({
      text: String(text),
      x: x + (Math.random() * 20 - 10),
      y: y + (Math.random() * 10 - 5),
      startY: y,
      color,
      fontSize,
      fontWeight,
      opacity: 1,
      vy: -1.4,
      life: 0.9
    });
  }

  addHitEffect(x, y, isSoulshot = false) {
    const pCount = isSoulshot ? 12 : 6;
    const color = isSoulshot ? '#38bdf8' : '#fbbf24';
    for (let i = 0; i < pCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: Math.random() * 3 + 2,
        life: 0.4,
        maxLife: 0.4
      });
    }
  }

  startLoop() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();

    const loop = (now) => {
      const dt = Math.min((now - this.lastTime) / 1000, 0.1);
      this.lastTime = now;
      this.update(dt);
      this.render();
      if (this.isRunning) {
        this.animationId = requestAnimationFrame(loop);
      }
    };
    this.animationId = requestAnimationFrame(loop);
  }

  stopLoop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  update(dt) {
    // Atualizar estado da aÃ§Ã£o do herÃ³i
    if (this.heroActionTimer > 0) {
      this.heroActionTimer -= dt;
      if (this.heroActionTimer <= 0) {
        this.heroState = 'idle';
      }
    }

    // Timer de frames do herÃ³i
    this.heroFrameTimer += dt;
    if (this.heroFrameTimer >= 0.12) {
      this.heroFrameTimer = 0;
      this.heroFrame = (this.heroFrame + 1) % 4;
    }

    // Timer de frames do monstro
    this.monsterFrameTimer += dt;
    if (this.monsterFrameTimer >= 0.15) {
      this.monsterFrameTimer = 0;
      this.monsterFrame = (this.monsterFrame + 1) % 4;
    }

    // Atualizar textos flutuantes
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.life -= dt;
      ft.opacity = Math.max(0, ft.life / 0.9);
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // Atualizar partÃ­culas
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  render(gameState = null) {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.imageSmoothingEnabled = false;

    // 1. Fundo Gradiente e ChÃ£o Pixel Art
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#090a0f');
    bgGrad.addColorStop(0.65, '#1e1b4b');
    bgGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // ChÃ£o de Pedra / Masmorra de Aden
    const groundY = h - 28;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, groundY, w, 28);
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, groundY, w, 3);

    // PadrÃ£o de lajotas no chÃ£o
    ctx.fillStyle = '#0f172a';
    for (let x = 0; x < w; x += 32) {
      ctx.fillRect(x, groundY + 3, 1, 25);
    }

    // 2. PosiÃ§Ãµes dos Combatentes
    const heroX = Math.round(w * 0.28);
    const heroY = groundY - 48;
    const monsterX = Math.round(w * 0.72);
    const monsterY = groundY - 48;

    // Sombra sob os pÃ©s
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath();
    ctx.ellipse(heroX + 16, groundY - 2, 22, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(monsterX + 16, groundY - 2, 24, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. Renderizar HerÃ³i
    let heroImg = this.loadedImages.hero_idle;
    if (this.heroState === 'attack') heroImg = this.loadedImages.hero_attack1 || this.loadedImages.hero_idle;
    else if (this.heroState === 'cast') heroImg = this.loadedImages.hero_attack2 || this.loadedImages.hero_idle;
    else if (this.heroState === 'hurt') heroImg = this.loadedImages.hero_hurt || this.loadedImages.hero_idle;

    if (heroImg && heroImg.complete && heroImg.naturalWidth > 0) {
      const frameWidth = Math.round(heroImg.naturalWidth / 4) || heroImg.naturalWidth;
      const frameHeight = heroImg.naturalHeight;
      const srcX = (this.heroFrame % 4) * frameWidth;
      ctx.drawImage(heroImg, srcX, 0, frameWidth, frameHeight, heroX - 16, heroY - 12, 64, 64);
    } else {
      // Fallback estilizado de pixel art enquanto os sprites carregam
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(heroX, heroY, 28, 44);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(heroX + 4, heroY + 6, 20, 10);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(heroX + 22, heroY + 14, 16, 4); // Espada
    }

    // 4. Renderizar Monstro
    // Efeito de pulso no monstro
    const bobY = Math.sin(Date.now() / 200) * 2;
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(monsterX, monsterY + bobY, 32, 44);
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(monsterX + 4, monsterY + 8 + bobY, 24, 12);
    ctx.fillStyle = '#fde047';
    ctx.fillRect(monsterX + 8, monsterY + 12 + bobY, 4, 4); // Olhos
    ctx.fillRect(monsterX + 20, monsterY + 12 + bobY, 4, 4);

    // Barra de Vida do Monstro
    const mobHpPercent = gameState && gameState.enemy ? Math.max(0, gameState.enemy.hp / (gameState.enemy.maxHp || 1)) : 0.75;
    const mobBarW = 50;
    const mobBarX = monsterX - 8;
    const mobBarY = monsterY - 16;
    ctx.fillStyle = '#18181b';
    ctx.fillRect(mobBarX, mobBarY, mobBarW, 6);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(mobBarX + 1, mobBarY + 1, Math.round((mobBarW - 2) * mobHpPercent), 4);

    // 5. PartÃ­culas e Efeitos de Impacto
    for (const p of this.particles) {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }

    // 6. Textos Flutuantes de Dano
    ctx.textAlign = 'center';
    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = ft.opacity;
      ctx.font = `${ft.fontWeight} ${ft.fontSize}px 'Cinzel', sans-serif`;
      ctx.fillStyle = '#000000';
      ctx.fillText(ft.text, ft.x + 1, ft.y + 1); // Sombra
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }
}
