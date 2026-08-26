import React, { useEffect, useRef, useCallback } from 'react';

// --- ENUMS & TYPES ---

enum CombatState {
  LOADING,
  IDLE,
  HERO_ATTACK,
  MONSTER_HURT,
  MONSTER_ATTACK,
  HERO_HURT,
  MONSTER_DEAD,
  VICTORY_LOOT,
  DEAD
}

interface FloatingText {
  text: string;
  x: number;
  y: number;
  color: string;
  life: number;
  maxLife: number;
  vy: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface MonsterData {
  name: string;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  xpReward: number;
  goldReward: number;
  iconIndex: number;
  pack: 'low' | 'chaos';
}

// --- SPRITE UTILITIES ---

class SpriteSheet {
  src: string;
  frameCount: number;
  frameWidth: number;
  frameHeight: number;
  image: HTMLImageElement | null = null;
  loaded = false;

  constructor(src: string, frameCount: number, frameWidth?: number, frameHeight?: number) {
    this.src = src;
    this.frameCount = frameCount;
    this.frameWidth = frameWidth || 0;
    this.frameHeight = frameHeight || 0;
  }

  load(): Promise<void> {
    return new Promise((resolve) => {
      this.image = new Image();
      this.image.src = this.src;
      this.image.onload = () => {
        this.loaded = true;
        if (!this.frameWidth) this.frameWidth = (this.image?.width || 0) / this.frameCount;
        if (!this.frameHeight) this.frameHeight = this.image?.height || 0;
        resolve();
      };
      this.image.onerror = () => {
        console.warn("[Aden2D] Failed to load sprite:", this.src);
        resolve();
      };
    });
  }

  drawFrame(ctx: CanvasRenderingContext2D, frameIndex: number, x: number, y: number, scale: number, flipX = false) {
    if (!this.loaded || !this.image) return;
    const frame = frameIndex % this.frameCount;
    ctx.save();
    ctx.translate(x, y);
    if (flipX) ctx.scale(-1, 1);
    ctx.drawImage(
      this.image,
      frame * this.frameWidth, 0, this.frameWidth, this.frameHeight,
      -(this.frameWidth * scale) / 2, -(this.frameHeight * scale) / 2,
      this.frameWidth * scale, this.frameHeight * scale
    );
    ctx.restore();
  }
}

class StaticImage {
  src: string;
  image: HTMLImageElement | null = null;
  loaded = false;

  constructor(src: string) { this.src = src; }

  load(): Promise<void> {
    return new Promise((resolve) => {
      this.image = new Image();
      this.image.src = this.src;
      this.image.onload = () => { this.loaded = true; resolve(); };
      this.image.onerror = () => { console.warn("[Aden2D] Failed:", this.src); resolve(); };
    });
  }
}

// --- MONSTER GENERATOR ---

const MONSTER_NAMES = [
  'Goblin', 'Orc', 'Skeleton', 'Imp', 'Bat', 'Slime', 'Wolf', 'Spider',
  'Zombie', 'Ghoul', 'Wraith', 'Troll', 'Kobold', 'Harpy', 'Minotaur',
  'Demon', 'Golem', 'Lich', 'Drake', 'Wyrm', 'Shade', 'Banshee',
  'Gargoyle', 'Chimera', 'Basilisk', 'Cerberus', 'Hydra', 'Phoenix',
  'Titan', 'Behemoth', 'Dragon', 'Nightmare', 'Abomination', 'Archon',
  'Revenant', 'Specter', 'Dread Knight', 'Naga', 'Succubus', 'Wyvern',
  'Shadow Fiend', 'Doom Guard', 'Elder Lich', 'Ancient Dragon',
  'Corrupted Angel', 'Void Walker', 'Dark Overlord', 'World Boss'
];

function generateMonster(playerLevel: number): MonsterData {
  const tier = Math.min(47, Math.floor(playerLevel / 2));
  const nameIndex = Math.min(tier, MONSTER_NAMES.length - 1);
  const variance = 0.8 + Math.random() * 0.4;
  const levelMult = 1 + playerLevel * 0.15;
  const iconIndex = (Math.floor(Math.random() * 48) + 1);
  const pack = Math.random() > 0.5 ? 'chaos' : 'low' as const;

  return {
    name: MONSTER_NAMES[nameIndex],
    hp: Math.floor(20 * levelMult * variance),
    maxHp: Math.floor(20 * levelMult * variance),
    atk: Math.floor(3 * levelMult * variance),
    def: Math.floor(2 * levelMult * variance),
    xpReward: Math.floor(8 * levelMult * variance),
    goldReward: Math.floor(5 * levelMult * variance),
    iconIndex,
    pack,
  };
}

// --- HERO SPRITE MAPPING ---

interface HeroSpriteSet {
  idle: SpriteSheet;
  attack: SpriteSheet;
  hurt: SpriteSheet;
  dead: SpriteSheet;
  run: SpriteSheet;
}

function getHeroSpritePath(gameClass: string): string {
  const classMap: Record<string, string> = {
    fighter: 'knight/Knight_1',
    warrior: 'knight/Knight_2',
    knight: 'knight/Knight_3',
    paladin: 'knight/Knight_1',
    dark_avenger: 'knight/Knight_2',
    treasure_hunter: 'shinobi/Shinobi',
    hawkeye: 'shinobi/Fighter',
    adventurer: 'shinobi/Samurai',
    rogue: 'shinobi/Shinobi',
    wizard: 'wizard/Fire Wizard',
    sorcerer: 'wizard/Lightning Mage',
    necromancer: 'necromancer/Necromancer_1',
    cleric: 'wizard/Wanderer Magican',
    bishop: 'wizard/Wanderer Magican',
    prophet: 'wizard/Fire Wizard',
    elder: 'wizard/Lightning Mage',
    shillien_knight: 'vampire/Vampire_1',
    bladedancer: 'vampire/Vampire_2',
    phantom_ranger: 'vampire/Vampire_1',
    spellhowler: 'vampire/Vampire_2',
    phantom_summoner: 'necromancer/Necromancer_2',
    shillien_elder: 'wizard/Fire Wizard',
    destroyer: 'knight/Knight_3',
    tyrant: 'shinobi/Fighter',
    overlord: 'knight/Knight_2',
    warcryer: 'knight/Knight_1',
    bounty_hunter: 'shinobi/Samurai',
    warsmith: 'knight/Knight_3',
    berserker: 'shinobi/Fighter',
    soulbreaker: 'shinobi/Shinobi',
    inspector: 'wizard/Lightning Mage',
  };
  return classMap[gameClass] || 'knight/Knight_1';
}

function buildHeroSprites(gameClass: string): HeroSpriteSet {
  const basePath = getHeroSpritePath(gameClass);
  const base = `/assets/2d/heroes/${basePath}`;

  // Frame counts differ per pack. Use conservative estimates.
  // Knight: Idle(4), Attack(6), Hurt(2), Dead(6), Run(7)
  // Shinobi/Wizard/Necromancer: similar patterns
  // We auto-detect frame count from image width
  return {
    idle: new SpriteSheet(`${base}/Idle.png`, 4),
    attack: new SpriteSheet(`${base}/Attack_1.png`, 6),
    hurt: new SpriteSheet(`${base}/Hurt.png`, 2),
    dead: new SpriteSheet(`${base}/Dead.png`, 6),
    run: new SpriteSheet(`${base}/Run.png`, 7),
  };
}

// --- BATTLEGROUND MAPPING ---

const BATTLEGROUNDS = [
  '/assets/2d/backgrounds/battlegrounds/PNG/Battleground1/Bright/Battleground1.png',
  '/assets/2d/backgrounds/battlegrounds/PNG/Battleground2/Bright/Battleground2.png',
  '/assets/2d/backgrounds/battlegrounds/PNG/Battleground3/Bright/Battleground3.png',
  '/assets/2d/backgrounds/battlegrounds/PNG/Battleground4/Bright/Battleground4.png',
];

function getBattleground(zoneIndex: number): string {
  return BATTLEGROUNDS[zoneIndex % BATTLEGROUNDS.length];
}

// --- MAIN COMPONENT ---

export default function Aden2DGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<CombatState>(CombatState.LOADING);
  const isDeadRef = useRef(false);

  const handleRespawn = useCallback(() => {
    const w = window as any;
    if (w.getGameState) {
      const s = w.getGameState();
      s.hp = s.maxHp;
      s.mp = s.maxMp;
    }
    isDeadRef.current = false;
    gameStateRef.current = CombatState.IDLE;
  }, []);

  const handleExit = useCallback(() => {
    const w = window as any;
    if (w.onReactSetMode) w.onReactSetMode('idle');
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    let animFrameId: number;
    let lastTime = performance.now();
    let isRunning = true;

    // --- Resize ---
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.imageSmoothingEnabled = false;
    };
    window.addEventListener('resize', resize);
    resize();

    // --- Shared state access ---
    const w = window as any;
    const getState = () => w.getGameState ? w.getGameState() : {
      hp: 100, maxHp: 100, mp: 50, maxMp: 50, xp: 0, gold: 0, level: 1,
      name: 'Hero', class: 'fighter', zone: 0
    };

    const playerState = getState();
    const playerClass = playerState.class || 'fighter';
    const zoneIndex = typeof playerState.zone === 'number' ? playerState.zone : 0;

    // --- Load resources ---
    const bgImage = new StaticImage(getBattleground(zoneIndex));
    const heroSprites = buildHeroSprites(playerClass);

    // Pre-load a pool of monster icons (load 12 random ones)
    const monsterIcons: StaticImage[] = [];
    for (let i = 0; i < 12; i++) {
      const idx = Math.floor(Math.random() * 48) + 1;
      const pack = Math.random() > 0.5 ? 'chaos-32x' : 'low-level-32x';
      monsterIcons.push(new StaticImage(`/assets/2d/monsters/${pack}/PNG/Transperent/Icon${idx}.png`));
    }

    let resourcesLoaded = false;
    const knightAttackFallback = new SpriteSheet('/assets/2d/heroes/knight/Knight_1/Attack 1.png', 6);

    Promise.all([
      bgImage.load(),
      heroSprites.idle.load(),
      heroSprites.attack.load().catch(() => knightAttackFallback.load()),
      heroSprites.hurt.load(),
      heroSprites.dead.load(),
      heroSprites.run.load(),
      knightAttackFallback.load(),
      ...monsterIcons.map(m => m.load()),
    ]).then(() => {
      // Fix attack sprite — some packs use "Attack 1.png" instead of "Attack_1.png"
      if (!heroSprites.attack.loaded) {
        heroSprites.attack = knightAttackFallback;
      }
      resourcesLoaded = true;
      gameStateRef.current = CombatState.IDLE;
    });

    // --- Entities ---
    const hero = {
      frameTimer: 0,
      frameIndex: 0,
      animSpeed: 150,
      flashTimer: 0,
    };

    const monster = {
      bobTimer: 0,
      flashTimer: 0,
      alpha: 1,
      currentIconIdx: 0,
    };

    let currentMonster = generateMonster(playerState.level || 1);
    monster.currentIconIdx = Math.floor(Math.random() * monsterIcons.length);

    let combatState = CombatState.IDLE;
    let stateTimer = 0;

    // --- Visual effects ---
    let floats: FloatingText[] = [];
    let particles: Particle[] = [];

    const addFloat = (text: string, x: number, y: number, color: string) => {
      floats.push({ text, x, y, color, life: 1200, maxLife: 1200, vy: -0.06 });
    };

    const burst = (x: number, y: number, color: string, count: number) => {
      for (let i = 0; i < count; i++) {
        particles.push({
          x, y,
          vx: (Math.random() - 0.5) * 5,
          vy: (Math.random() - 1) * 5,
          life: 400 + Math.random() * 400,
          maxLife: 800,
          color,
          size: 2 + Math.random() * 4,
        });
      }
    };

    // --- Draw helpers ---
    const drawBar = (x: number, y: number, w: number, h: number, pct: number, fg: string, bg = '#333') => {
      ctx.fillStyle = bg;
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = fg;
      ctx.fillRect(x, y, w * Math.max(0, Math.min(1, pct)), h);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, w, h);
    };

    const drawTextOutlined = (text: string, x: number, y: number, color: string, size = 20) => {
      ctx.font = `bold ${size}px monospace`;
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 4;
      ctx.strokeText(text, x, y);
      ctx.fillStyle = color;
      ctx.fillText(text, x, y);
    };

    // --- GAME LOOP ---
    const loop = (time: number) => {
      if (!isRunning) return;
      const dt = time - lastTime;
      lastTime = time;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!resourcesLoaded) {
        ctx.fillStyle = '#0a0c14';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawTextOutlined('⚔ Carregando...', canvas.width / 2, canvas.height / 2, '#ffd700', 32);
        animFrameId = requestAnimationFrame(loop);
        return;
      }

      // Read live state
      const s = getState();
      combatState = gameStateRef.current;
      const heroScale = Math.min(3.5, canvas.height / 200);
      const heroX = canvas.width * 0.28;
      const heroY = canvas.height * 0.68;
      const monsterX = canvas.width * 0.72;
      const monsterBaseY = canvas.height * 0.65;

      // --- Update ---
      stateTimer += dt;
      hero.frameTimer += dt;
      monster.bobTimer += dt;
      if (hero.flashTimer > 0) hero.flashTimer -= dt;
      if (monster.flashTimer > 0) monster.flashTimer -= dt;

      // Advance hero frame
      if (hero.frameTimer >= hero.animSpeed) {
        hero.frameTimer = 0;
        hero.frameIndex++;
      }

      // --- State machine ---
      if (combatState === CombatState.IDLE) {
        if (stateTimer > 1800) {
          gameStateRef.current = CombatState.HERO_ATTACK;
          combatState = CombatState.HERO_ATTACK;
          stateTimer = 0;
          hero.frameIndex = 0;
          hero.frameTimer = 0;
        }
      }
      else if (combatState === CombatState.HERO_ATTACK) {
        const dur = heroSprites.attack.frameCount * hero.animSpeed;
        if (stateTimer > dur) {
          // Calculate real damage
          const playerAtk = s.base?.atk || 10;
          const dmg = Math.max(1, Math.floor((playerAtk + s.level * 2) * (0.8 + Math.random() * 0.4) - currentMonster.def * 0.5));
          currentMonster.hp -= dmg;
          monster.flashTimer = 300;
          addFloat(`-${dmg}`, monsterX, monsterBaseY - 60, '#ff4444');
          burst(monsterX, monsterBaseY, '#ff6633', 12);

          gameStateRef.current = CombatState.MONSTER_HURT;
          combatState = CombatState.MONSTER_HURT;
          stateTimer = 0;
        }
      }
      else if (combatState === CombatState.MONSTER_HURT) {
        if (stateTimer > 400) {
          if (currentMonster.hp <= 0) {
            gameStateRef.current = CombatState.MONSTER_DEAD;
            combatState = CombatState.MONSTER_DEAD;
            stateTimer = 0;
            hero.frameIndex = 0;
          } else {
            gameStateRef.current = CombatState.MONSTER_ATTACK;
            combatState = CombatState.MONSTER_ATTACK;
            stateTimer = 0;
          }
        }
      }
      else if (combatState === CombatState.MONSTER_ATTACK) {
        if (stateTimer > 800) {
          const mDmg = Math.max(1, Math.floor(currentMonster.atk * (0.8 + Math.random() * 0.4) - (s.base?.def || 2) * 0.3));
          
          // Deduct from real state
          if (w.getGameState) {
            const rs = w.getGameState();
            rs.hp = Math.max(0, (rs.hp || 0) - mDmg);
          }

          hero.flashTimer = 300;
          addFloat(`-${mDmg}`, heroX, heroY - 60, '#ff4444');
          burst(heroX, heroY, '#ff4444', 8);

          gameStateRef.current = CombatState.HERO_HURT;
          combatState = CombatState.HERO_HURT;
          stateTimer = 0;
        }
      }
      else if (combatState === CombatState.HERO_HURT) {
        if (stateTimer > 400) {
          const currentHp = w.getGameState ? w.getGameState().hp : s.hp;
          if (currentHp <= 0) {
            gameStateRef.current = CombatState.DEAD;
            combatState = CombatState.DEAD;
            isDeadRef.current = true;
            hero.frameIndex = 0;
          } else {
            gameStateRef.current = CombatState.IDLE;
            combatState = CombatState.IDLE;
            stateTimer = 0;
          }
        }
      }
      else if (combatState === CombatState.MONSTER_DEAD) {
        monster.alpha = Math.max(0, 1 - stateTimer / 800);
        if (stateTimer > 800) {
          // Apply rewards to real state
          if (w.getGameState) {
            const rs = w.getGameState();
            rs.gold = (rs.gold || 0) + currentMonster.goldReward;
            rs.xp = (rs.xp || 0) + currentMonster.xpReward;
            try { if (w.checkLevelUp) w.checkLevelUp(); } catch (_) {}
            try { if (w.saveGameState) w.saveGameState(); } catch (_) {}
          }
          addFloat(`+${currentMonster.xpReward} XP`, canvas.width / 2, canvas.height * 0.4, '#ffff00');
          addFloat(`+${currentMonster.goldReward} Adena`, canvas.width / 2, canvas.height * 0.45, '#ffd700');

          gameStateRef.current = CombatState.VICTORY_LOOT;
          combatState = CombatState.VICTORY_LOOT;
          stateTimer = 0;
        }
      }
      else if (combatState === CombatState.VICTORY_LOOT) {
        if (stateTimer > 1500) {
          // Spawn new monster
          const lvl = w.getGameState ? w.getGameState().level : s.level;
          currentMonster = generateMonster(lvl || 1);
          monster.alpha = 1;
          monster.currentIconIdx = Math.floor(Math.random() * monsterIcons.length);
          gameStateRef.current = CombatState.IDLE;
          combatState = CombatState.IDLE;
          stateTimer = 0;
        }
      }

      // --- RENDER ---

      // Background
      if (bgImage.loaded && bgImage.image) {
        ctx.drawImage(bgImage.image, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = '#1a1e2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Semi-transparent ground shade
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(0, canvas.height * 0.78, canvas.width, canvas.height * 0.22);

      // --- Draw Hero ---
      ctx.save();
      if (hero.flashTimer > 0) {
        ctx.filter = 'sepia(1) hue-rotate(-50deg) saturate(5) brightness(1.5)';
      }
      let activeSprite = heroSprites.idle;
      if (combatState === CombatState.HERO_ATTACK) activeSprite = heroSprites.attack;
      else if (combatState === CombatState.HERO_HURT) activeSprite = heroSprites.hurt;
      else if (combatState === CombatState.DEAD) activeSprite = heroSprites.dead;

      // Clamp frame on death
      let heroFrame = hero.frameIndex;
      if (combatState === CombatState.DEAD && heroFrame >= activeSprite.frameCount) {
        heroFrame = activeSprite.frameCount - 1;
      }
      activeSprite.drawFrame(ctx, heroFrame, heroX, heroY, heroScale);
      ctx.restore();

      // --- Draw Monster ---
      const iconObj = monsterIcons[monster.currentIconIdx];
      if (iconObj?.loaded && iconObj.image && combatState !== CombatState.VICTORY_LOOT) {
        ctx.save();
        ctx.globalAlpha = monster.alpha;
        if (monster.flashTimer > 0) {
          ctx.filter = 'sepia(1) hue-rotate(-50deg) saturate(5) brightness(1.5)';
        }

        let mY = monsterBaseY;
        if (combatState === CombatState.IDLE) {
          mY += Math.sin(monster.bobTimer * 0.004) * 8;
        } else if (combatState === CombatState.MONSTER_ATTACK) {
          mY -= 15; // lunge
        }

        const mScale = Math.min(5, canvas.height / 160);
        const mSize = 32 * mScale;
        ctx.translate(monsterX, mY);
        ctx.scale(-1, 1); // face hero
        ctx.drawImage(iconObj.image, -mSize / 2, -mSize / 2, mSize, mSize);
        ctx.restore();
      }

      // --- Draw Particles ---
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // gravity
        p.life -= dt;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
      ctx.globalAlpha = 1;

      // --- Draw Floating Texts ---
      ctx.textAlign = 'center';
      for (let i = floats.length - 1; i >= 0; i--) {
        const ft = floats[i];
        ft.y += ft.vy * dt;
        ft.life -= dt;
        if (ft.life <= 0) { floats.splice(i, 1); continue; }
        ctx.globalAlpha = Math.max(0, ft.life / ft.maxLife);
        ctx.font = 'bold 26px monospace';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;
        ctx.strokeText(ft.text, ft.x, ft.y);
        ctx.fillStyle = ft.color;
        ctx.fillText(ft.text, ft.x, ft.y);
      }
      ctx.globalAlpha = 1;

      // --- HUD ---
      const liveState = w.getGameState ? w.getGameState() : s;

      // Top-left: Hero info panel (Responsive for mobile & 4K)
      const isMobileScreen = canvas.width < 600;
      const panelW = Math.min(340, Math.max(180, canvas.width * (isMobileScreen ? 0.6 : 0.38)));
      ctx.fillStyle = 'rgba(0,0,0,0.72)';
      roundRect(ctx, 8, 8, panelW, 110, 8);
      ctx.fill();

      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffd700';
      ctx.font = isMobileScreen ? 'bold 14px monospace' : 'bold 18px monospace';
      ctx.fillText(`⚔ ${liveState.name || 'Hero'}  Lv.${liveState.level || 1}`, 18, 30);

      // HP bar
      ctx.fillStyle = '#aaa';
      ctx.font = '11px monospace';
      ctx.fillText('HP', 18, 52);
      drawBar(40, 41, panelW - 55, 14, (liveState.hp || 0) / (liveState.maxHp || 1), '#e44', '#333');
      ctx.fillStyle = '#fff';
      ctx.font = '10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${Math.floor(liveState.hp || 0)}/${liveState.maxHp || 0}`, panelW - 5, 53);

      // MP bar
      ctx.textAlign = 'left';
      ctx.fillStyle = '#aaa';
      ctx.font = '11px monospace';
      ctx.fillText('MP', 18, 72);
      drawBar(40, 61, panelW - 55, 14, (liveState.mp || 0) / (liveState.maxMp || 1), '#44f', '#333');
      ctx.fillStyle = '#fff';
      ctx.font = '10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${Math.floor(liveState.mp || 0)}/${liveState.maxMp || 0}`, panelW - 5, 73);

      // XP bar
      ctx.textAlign = 'left';
      ctx.fillStyle = '#aaa';
      ctx.font = '11px monospace';
      ctx.fillText('XP', 18, 92);
      const nextXp = (liveState.level || 1) * 150;
      drawBar(40, 81, panelW - 55, 10, (liveState.xp || 0) / nextXp, '#ff4', '#333');
      ctx.fillStyle = '#fff';
      ctx.font = '10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${liveState.xp || 0}/${nextXp}`, panelW - 5, 91);

      // Top-right: Gold
      ctx.textAlign = 'right';
      const goldText = `💰 ${(liveState.gold || 0).toLocaleString()} Adena`;
      ctx.font = isMobileScreen ? 'bold 13px monospace' : 'bold 17px monospace';
      const goldW = Math.min(260, ctx.measureText(goldText).width + 24);
      ctx.fillStyle = 'rgba(0,0,0,0.72)';
      roundRect(ctx, canvas.width - goldW - 12, 8, goldW, 34, 8);
      ctx.fill();
      ctx.fillStyle = '#ffd700';
      ctx.fillText(goldText, canvas.width - 20, 30);

      // Bottom center: Monster HP
      if (combatState !== CombatState.VICTORY_LOOT && combatState !== CombatState.DEAD && combatState !== CombatState.LOADING) {
        ctx.textAlign = 'center';
        const mBarW = Math.min(360, canvas.width * 0.5);
        const mBarX = (canvas.width - mBarW) / 2;
        const mBarY = canvas.height - 65;

        ctx.fillStyle = 'rgba(0,0,0,0.65)';
        roundRect(ctx, mBarX - 12, mBarY - 30, mBarW + 24, 55, 8);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px monospace';
        ctx.fillText(`🐉 ${currentMonster.name}`, canvas.width / 2, mBarY - 10);

        drawBar(mBarX, mBarY, mBarW, 16, currentMonster.hp / currentMonster.maxHp, '#e44', '#333');
        ctx.fillStyle = '#fff';
        ctx.font = '11px monospace';
        ctx.fillText(`${Math.max(0, currentMonster.hp)}/${currentMonster.maxHp}`, canvas.width / 2, mBarY + 13);
      }

      // Death overlay
      if (combatState === CombatState.DEAD) {
        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawTextOutlined('☠ YOU DIED ☠', canvas.width / 2, canvas.height / 2 - 30, '#ff4444', 52);
        drawTextOutlined('Clique em Respawn para continuar', canvas.width / 2, canvas.height / 2 + 20, '#aaa', 18);
      }

      animFrameId = requestAnimationFrame(loop);
    };

    animFrameId = requestAnimationFrame(loop);

    return () => {
      isRunning = false;
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animFrameId);
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#0a0c14' }}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated',
        }}
      />

      {/* Exit Button */}
      <button
        onClick={handleExit}
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          padding: '8px 16px',
          background: 'rgba(0,0,0,0.7)',
          border: '2px solid #555',
          color: '#ccc',
          fontFamily: 'monospace',
          fontSize: 13,
          cursor: 'pointer',
          borderRadius: 6,
          zIndex: 10,
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#ffd700'; e.currentTarget.style.color = '#ffd700'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#555'; e.currentTarget.style.color = '#ccc'; }}
      >
        ← Voltar ao Idle
      </button>

      {/* Respawn Button (visible when dead) */}
      {isDeadRef.current && (
        <button
          onClick={handleRespawn}
          style={{
            position: 'absolute',
            top: '60%',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '14px 36px',
            background: 'linear-gradient(135deg, #b91c1c, #991b1b)',
            border: '3px solid #fca5a5',
            color: '#fff',
            fontFamily: 'monospace',
            fontSize: 22,
            fontWeight: 'bold',
            cursor: 'pointer',
            borderRadius: 12,
            textTransform: 'uppercase',
            zIndex: 20,
            letterSpacing: 2,
            boxShadow: '0 0 20px rgba(255,0,0,0.4)',
          }}
        >
          ⚡ Respawn
        </button>
      )}
    </div>
  );
}

// --- Canvas helpers ---
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
