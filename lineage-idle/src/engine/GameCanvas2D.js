/**
 * GameCanvas2D.js â€” Motor de Batalha 2D / 32-bits Pixel Art (Estilo Task Bar Hero).
 * Renderiza em HTML5 Canvas o combate com sprites animados, mÃºltiplos biomas, efeitos e dano flutuante.
 */

export class GameCanvas2D {
  constructor(canvasElement, getStateFn = null) {
    this.canvas = canvasElement;
    this.ctx = canvasElement ? canvasElement.getContext('2d') : null;
    this.getState = getStateFn || (() => (typeof window !== 'undefined' && window.state ? window.state : null));
    this.images = {};
    this.loadedImages = {};
    this.floatingTexts = [];
    this.particles = [];
    this.lastTime = performance.now();
    this.heroFrame = 0;
    this.heroFrameTimer = 0;
    this.monsterFrame = 0;
    this.monsterFrameTimer = 0;
    this.heroState = 'idle'; // 'idle', 'attack', 'cast', 'hurt'
    this.heroActionTimer = 0;
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
      hero_dead: '/assets/2d/heroes/knight/Knight_1/Dead.png',
      hero_shinobi_idle: '/assets/2d/heroes/shinobi/Shinobi/Idle.png',
      hero_shinobi_attack: '/assets/2d/heroes/shinobi/Shinobi/Attack_1.png',
      hero_mage_idle: '/assets/2d/heroes/necromancer/Necromancer_1/Idle.png',
      hero_mage_attack: '/assets/2d/heroes/necromancer/Necromancer_1/Attack.png'
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
    this.heroActionTimer = 0.45;
    this.heroFrame = 0;
  }

  triggerHeroHurt() {
    if (this.heroState !== 'attack' && this.heroState !== 'cast') {
      this.heroState = 'hurt';
      this.heroActionTimer = 0.25;
    }
  }

  addDamageNumber(text, x = null, y = null, type = 'normal') {
    if (!this.canvas) return;
    const w = this.canvas.width || 600;
    const h = this.canvas.height || 220;

    const posX = x !== null ? x : (w * 0.72 + (Math.random() * 30 - 15));
    const posY = y !== null ? y : (h * 0.45 + (Math.random() * 20 - 10));

    let color = '#ffffff';
    let fontSize = 15;
    let fontWeight = 'bold';

    if (type === 'crit') {
      color = '#fde047';
      fontSize = 19;
      text = 'âš¡ ' + text;
    } else if (type === 'hero_damage') {
      color = '#f87171';
      fontSize = 14;
    } else if (type === 'heal') {
      color = '#4ade80';
      fontSize = 16;
      text = '+' + text;
    } else if (type === 'miss') {
      color = '#94a3b8';
      text = 'MISS';
    }

    this.floatingTexts.push({
      text: String(text),
      x: posX,
      y: posY,
      startY: posY,
      color,
      fontSize,
      fontWeight,
      opacity: 1,
      vy: -1.5,
      life: 0.9
    });
  }

  addHitEffect(x = null, y = null, isSoulshot = false) {
    if (!this.canvas) return;
    const w = this.canvas.width || 600;
    const h = this.canvas.height || 220;
    const posX = x !== null ? x : (w * 0.72);
    const posY = y !== null ? y : (h * 0.55);

    const pCount = isSoulshot ? 16 : 8;
    const color = isSoulshot ? '#38bdf8' : '#fbbf24';
    for (let i = 0; i < pCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3.5 + 1.5;
      this.particles.push({
        x: posX,
        y: posY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: Math.random() * 4 + 2,
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
    if (this.heroActionTimer > 0) {
      this.heroActionTimer -= dt;
      if (this.heroActionTimer <= 0) {
        this.heroState = 'idle';
      }
    }

    this.heroFrameTimer += dt;
    if (this.heroFrameTimer >= 0.12) {
      this.heroFrameTimer = 0;
      this.heroFrame = (this.heroFrame + 1) % 4;
    }

    this.monsterFrameTimer += dt;
    if (this.monsterFrameTimer >= 0.15) {
      this.monsterFrameTimer = 0;
      this.monsterFrame = (this.monsterFrame + 1) % 4;
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.life -= dt;
      ft.opacity = Math.max(0, ft.life / 0.9);
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

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

  render() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    
    // Auto-ajuste de resoluÃ§Ã£o nÃ­tida
    if (this.canvas.parentElement) {
      const pW = this.canvas.parentElement.clientWidth;
      const pH = this.canvas.parentElement.clientHeight;
      if (pW > 100 && (this.canvas.width !== pW || this.canvas.height !== pH)) {
        this.canvas.width = pW;
        this.canvas.height = Math.max(180, pH);
      }
    }

    const w = this.canvas.width || 600;
    const h = this.canvas.height || 220;
    const state = typeof this.getState === 'function' ? this.getState() : null;

    ctx.imageSmoothingEnabled = false;

    // 1. CenÃ¡rio TemÃ¡tico em Pixel Art
    const zoneName = (state?.zone || 'talking_island').toLowerCase();
    const isForest = zoneName.includes('island') || zoneName.includes('forest') || zoneName.includes('valley');
    const isUndead = zoneName.includes('ruin') || zoneName.includes('death') || zoneName.includes('cemetery') || zoneName.includes('crypt') || zoneName.includes('grounds');

    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    if (isUndead) {
      bgGrad.addColorStop(0, '#090514');
      bgGrad.addColorStop(0.65, '#2e1065');
      bgGrad.addColorStop(1, '#0f172a');
    } else if (isForest) {
      bgGrad.addColorStop(0, '#064e3b');
      bgGrad.addColorStop(0.65, '#065f46');
      bgGrad.addColorStop(1, '#022c22');
    } else {
      bgGrad.addColorStop(0, '#1e1b4b');
      bgGrad.addColorStop(0.65, '#312e81');
      bgGrad.addColorStop(1, '#0f172a');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // ChÃ£o de Pedra / Terra Pixel Art
    const groundY = h - 36;
    ctx.fillStyle = isUndead ? '#1e1b4b' : (isForest ? '#14532d' : '#1e293b');
    ctx.fillRect(0, groundY, w, 36);
    ctx.fillStyle = isUndead ? '#3b0764' : (isForest ? '#166534' : '#334155');
    ctx.fillRect(0, groundY, w, 4);

    // Detalhes do chÃ£o pixel art
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    for (let x = 0; x < w; x += 28) {
      ctx.fillRect(x, groundY + 4, 1, 32);
    }

    // 2. PosiÃ§Ãµes dos Combatentes
    const heroX = Math.round(w * 0.28);
    const heroY = groundY - 56;
    const monsterX = Math.round(w * 0.72);
    const monsterY = groundY - 56;

    // Sombras sob os pÃ©s
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.ellipse(heroX + 24, groundY - 2, 26, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(monsterX + 24, groundY - 2, 28, 8, 0, 0, Math.PI * 2);
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
      ctx.drawImage(heroImg, srcX, 0, frameWidth, frameHeight, heroX - 16, heroY - 14, 80, 80);
    } else {
      // Fallback em Pixel Art
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(heroX, heroY, 32, 50);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(heroX + 4, heroY + 6, 24, 12);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(heroX + 26, heroY + 16, 20, 4);
    }

    // Header / Barra de Vida do HerÃ³i no Canvas
    const heroName = state?.charName || state?.heroName || 'HerÃ³i';
    const heroLvl = state?.level || 1;
    const heroHp = state?.hp || 100;
    const heroMaxHp = state?.maxHp || 100;
    const heroHpPct = Math.max(0, Math.min(1, heroHp / heroMaxHp));

    ctx.font = "bold 11px 'Cinzel', serif";
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fde047';
    ctx.fillText(`${heroName} (Nv. ${heroLvl})`, heroX + 16, heroY - 22);

    // Barra HP HerÃ³i
    ctx.fillStyle = '#09090b';
    ctx.fillRect(heroX - 16, heroY - 16, 64, 6);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(heroX - 15, heroY - 15, Math.round(62 * heroHpPct), 4);

    // 4. Renderizar Monstro
    const bobY = Math.sin(Date.now() / 200) * 3;
    ctx.fillStyle = isUndead ? '#7c3aed' : (isForest ? '#dc2626' : '#ea580c');
    ctx.fillRect(monsterX, monsterY + bobY, 38, 52);
    ctx.fillStyle = '#18181b';
    ctx.fillRect(monsterX + 4, monsterY + 8 + bobY, 30, 14);
    ctx.fillStyle = '#fde047';
    ctx.fillRect(monsterX + 8, monsterY + 12 + bobY, 5, 5); // Olhos
    ctx.fillRect(monsterX + 24, monsterY + 12 + bobY, 5, 5);

    // Header / Barra de Vida do Monstro no Canvas
    const monsterName = state?.enemy?.name || 'Monstro de Aden';
    const monsterLvl = state?.enemy?.lvl || state?.level || 1;
    const monsterHp = state?.enemy?.hp || 100;
    const monsterMaxHp = state?.enemy?.maxHp || 100;
    const monsterHpPct = Math.max(0, Math.min(1, monsterHp / monsterMaxHp));

    ctx.font = "bold 11px 'Cinzel', serif";
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fca5a5';
    ctx.fillText(`${monsterName} (Nv. ${monsterLvl})`, monsterX + 16, monsterY - 22 + bobY);

    // Barra HP Monstro
    ctx.fillStyle = '#09090b';
    ctx.fillRect(monsterX - 16, monsterY - 16 + bobY, 64, 6);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(monsterX - 15, monsterY - 15 + bobY, Math.round(62 * monsterHpPct), 4);

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
      ctx.fillText(ft.text, ft.x + 1, ft.y + 1);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }
}
