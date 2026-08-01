import * as THREE from "three";
import { OutlineEffect } from "three/examples/jsm/effects/OutlineEffect.js";
import {
  ENEMY_TYPES,
  CLASS_META,
  type RaceDef,
  type ClassDef,
  type EnemyType,
  type SkillDef,
} from "./data";
import { SKILL_DEFS } from "../data/skills/index.js";
import {
  SLOTS,
  RARITY_COLOR,
  RARITY_RANK,
  rollItemDrop,
  type ItemDef,
  type ItemSlot,
} from "./items";
import {
  buildPlayer,
  buildEnemy,
  buildProjectileMesh,
  buildOrbMesh,
  buildTree,
  buildHouse,
  buildFountain,
  buildTorch,
  buildNPC,
  buildRock,
  buildFlower,
  buildCrate,
  buildBarrel,
  buildBanner,
  buildCloud,
  buildSkyDome,
} from "./models";

interface Enemy {
  type: EnemyType;
  x: number;
  y: number;
  kx: number;
  ky: number;
  hp: number;
  maxHp: number;
  r: number;
  hitFlash: number;
  attackTimer: number;
  rot: number;
  slowT: number;
  stunT: number;
  telegraph: number; // >0 = winding up, <0 = lunging
  group: THREE.Group;
  flashMats: THREE.Material[];
  baseEmissive: string[];
  baseIntensity: number[];
  spin: boolean;
  boss: boolean;
  score: number;
}

interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  dmg: number;
  r: number;
  color: string;
  life: number;
  mesh: THREE.Mesh;
}

interface Orb {
  x: number;
  y: number;
  r: number;
  life: number;
  heal: number;
  mesh: THREE.Mesh;
  item?: ItemDef;
}

interface Joy {
  id: number;
  bx: number;
  by: number;
  x: number;
  y: number;
}

interface DmgItem {
  sprite: THREE.Sprite;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  tex: THREE.CanvasTexture;
  life: number;
  max: number;
}

interface Ring {
  mesh: THREE.Mesh;
  life: number;
  max: number;
  target: number;
}

interface Beam {
  mesh: THREE.Mesh;
  life: number;
  max: number;
}

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  max: number;
  r: number;
  g: number;
  b: number;
  ambient: boolean;
}

export interface GameResult {
  score: number;
  time: number;
  kills: number;
  bestCombo: number;
  wave: number;
  race: string;
  cls: string;
}

export interface GameConfig {
  race: RaceDef;
  cls: ClassDef;
}

export interface GameCallbacks {
  onPaused: () => void;
  onResumed: () => void;
  onGameOver: (r: GameResult) => void;
}

const TAU = Math.PI * 2;
const S = 0.05; // world units per pixel

function rand(a: number, b: number) {
  return a + Math.random() * (b - a);
}
function clamp(v: number, a: number, b: number) {
  return v < a ? a : v > b ? b : v;
}
function dist2(ax: number, ay: number, bx: number, by: number) {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}
function angleDiff(a: number, b: number) {
  let d = (a - b) % TAU;
  if (d > Math.PI) d -= TAU;
  if (d < -Math.PI) d += TAU;
  return d;
}

export class Game {
  canvas: HTMLCanvasElement;
  hud: HTMLCanvasElement;
  hctx: CanvasRenderingContext2D;
  cfg: GameConfig;
  cb: GameCallbacks;
  dpr = 1;
  w = 0;
  h = 0;
  raf = 0;
  last = 0;
  running = false;
  paused = false;

  // three
  renderer!: THREE.WebGLRenderer;
  effect!: OutlineEffect;
  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;

  // player
  px = 0;
  py = 0;
  pr = 16;
  hp = 100;
  maxHp = 100;
  speed = 230;
  aim = 0;
  lastAttack = -9999;
  invuln = 0;
  playerFlash = 0;
  swing = 0;
  playerGroup!: THREE.Group;
  weaponPivot!: THREE.Group;
  rig!: {
    root: THREE.Group;
    body: THREE.Group;
    head: THREE.Group;
    armR: THREE.Group;
    armL: THREE.Group;
    legR: THREE.Group;
    legL: THREE.Group;
    elbowR: THREE.Group;
    elbowL: THREE.Group;
    kneeR: THREE.Group;
    kneeL: THREE.Group;
  };
  attackT = 0;
  attackDur = 0.22;
  attackKind: "swing" | "thrust" | "chop" | "cast" | "draw" = "swing";
  walkPhase = 0;
  bowDraw = 0; // 0..1 draw progress
  castGlow = 0; // 0..1 magic charge

  // equipment / itemization
  equipped: Partial<Record<ItemSlot, ItemDef>> = {};
  bDmgPct = 0;
  bSpdPct = 0;
  bHp = 0;
  bCdr = 0;
  bCrit = 0;
  bLS = 0;

  // world
  enemies: Enemy[] = [];
  projectiles: Projectile[] = [];
  orbs: Orb[] = [];
  rings: Ring[] = [];
  beams: Beam[] = [];

  // particles
  pPoints!: THREE.Points;
  pPos!: Float32Array;
  pCol!: Float32Array;
  pGeo!: THREE.BufferGeometry;
  particles: Particle[] = [];
  pTex!: THREE.Texture;

  // damage text
  dmgPool: DmgItem[] = [];
  dmgIdx = 0;

  // skills / mana
  skills: SkillDef[] = [];
  skillCd: number[] = [];
  mana = 100;
  manaMax = 100;
  manaRegen = 14;
  buffDmgT = 0;
  buffDmgM = 1;
  buffSpdT = 0;
  buffSpdM = 1;
  buffAtkT = 0;
  buffAtkM = 1;
  shieldT = 0;
  dashT = 0;
  dashVX = 0;
  dashVY = 0;
  dashHit = new Set<Enemy>();
  moving = false;
  npcs: { group: THREE.Group; phase: number }[] = [];
  clouds: THREE.Object3D[] = [];
  sun!: THREE.DirectionalLight;

  // waves
  wave = 0;
  waveState: "intermission" | "fighting" = "intermission";
  intermission = 1.8;
  spawnQueue = 0;
  spawnTimer = 0;
  bossPending = false;
  waveBanner = 0;
  waveBannerText = "";

  // scoring
  score = 0;
  kills = 0;
  combo = 0;
  comboTimer = 0;
  bestCombo = 0;
  elapsed = 0;
  hintTimer = 6.5;

  // fx
  shake = 0;
  hitStop = 0;
  comboPop = 0;

  // input
  keys = new Set<string>();
  mouseX = 0;
  mouseY = 0;
  mouseActive = false;
  lastMouseMove = -9999;
  mouseDown = false;
  touchLeft: Joy | null = null;
  touchRight: Joy | null = null;

  pauseRect = { x: 0, y: 0, s: 44 };
  skillRects: { x: number; y: number; w: number; h: number }[] = [];

  constructor(
    canvas: HTMLCanvasElement,
    hud: HTMLCanvasElement,
    cfg: GameConfig,
    cb: GameCallbacks
  ) {
    this.canvas = canvas;
    this.hud = hud;
    this.hctx = hud.getContext("2d")!;
    this.cfg = cfg;
    this.cb = cb;
    this.maxHp = cfg.cls.hp;
    this.hp = cfg.cls.hp;
    this.speed = cfg.cls.speed;
    
    // NOVO: Linka as skills de acordo com os IDs configurados no arquivo da classe
    this.skills = (cfg.cls.skills || [])
      .map((skillId: string) => SKILL_DEFS[skillId as keyof typeof SKILL_DEFS] as SkillDef)
      .filter(Boolean);
      
    const meta = CLASS_META[cfg.cls.id] ?? { manaMax: 100, manaRegen: 14 };
    this.manaMax = meta.manaMax;
    this.manaRegen = meta.manaRegen;
    this.mana = this.manaMax;
    this.equipped = {};
    this.recalcEquip();
    this.skillCd = this.skills.map(() => 0);
  }

  // ---------- setup ----------
  initThree() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.effect = new OutlineEffect(this.renderer, {
      defaultThickness: 0.004,
      defaultColor: [0.04, 0.04, 0.07],
      defaultAlpha: 0.85,
    });
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#06080f");
    this.scene.fog = new THREE.Fog("#06080f", 18, 78);

    this.camera = new THREE.PerspectiveCamera(55, 1, 0.1, 900);
    this.camera.position.set(0, 20, 14);

    const hemi = new THREE.HemisphereLight(0xbcd4ff, 0x2a3a1a, 0.9);
    this.scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff0d0, 1.1);
    sun.position.set(18, 26, 12);
    this.scene.add(sun);
    this.sun = sun;
    const fill = new THREE.DirectionalLight(0x88aaff, 0.35);
    fill.position.set(-10, 8, -6);
    this.scene.add(fill);
    const glow = new THREE.PointLight(0xffd27a, 0.5, 60);
    glow.position.set(0, 8, 4);
    this.scene.add(glow);

    // sky + sun disc
    const sky = buildSkyDome();
    sky.name = "sky";
    this.scene.add(sky);
    const sunDisc = new THREE.Mesh(
      new THREE.SphereGeometry(8, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xfff2c0 })
    );
    sunDisc.name = "sun";
    sunDisc.position.set(120, 90, -160);
    this.scene.add(sunDisc);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(2000, 2000, 1, 1),
      new THREE.MeshLambertMaterial({ color: "#4a7a3a" })
    );
    ground.rotation.x = -Math.PI / 2;
    (ground.material as THREE.Material).userData.outlineParameters = {
      visible: false,
    };
    this.scene.add(ground);
    // stone plaza under the village
    const plaza = new THREE.Mesh(
      new THREE.CircleGeometry(20, 40),
      new THREE.MeshLambertMaterial({ color: "#9a9a8a" })
    );
    plaza.rotation.x = -Math.PI / 2;
    plaza.position.y = 0.03;
    (plaza.material as THREE.Material).userData.outlineParameters = {
      visible: false,
    };
    this.scene.add(plaza);
    // path ring
    const path = new THREE.Mesh(
      new THREE.RingGeometry(13, 15, 48),
      new THREE.MeshLambertMaterial({ color: "#b0a890" })
    );
    path.rotation.x = -Math.PI / 2;
    path.position.y = 0.04;
    (path.material as THREE.Material).userData.outlineParameters = {
      visible: false,
    };
    this.scene.add(path);

    // particles
    this.pTex = this.makeCircleTexture();
    this.pPos = new Float32Array(900 * 3);
    this.pCol = new Float32Array(900 * 3);
    this.pGeo = new THREE.BufferGeometry();
    this.pGeo.setAttribute("position", new THREE.BufferAttribute(this.pPos, 3));
    this.pGeo.setAttribute("color", new THREE.BufferAttribute(this.pCol, 3));
    this.pPoints = new THREE.Points(
      this.pGeo,
      new THREE.PointsMaterial({
        size: 0.55,
        map: this.pTex,
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      })
    );
    this.pPoints.frustumCulled = false;
    this.scene.add(this.pPoints);

    this.initDamagePool(40);
  }

  makeCircleTexture() {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const x = c.getContext("2d")!;
    const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.4, "rgba(255,255,255,0.8)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c);
    return t;
  }

  initDamagePool(n: number) {
    for (let i = 0; i < n; i++) {
      const canvas = document.createElement("canvas");
      canvas.width = 200;
      canvas.height = 100;
      const ctx = canvas.getContext("2d")!;
      const tex = new THREE.CanvasTexture(canvas);
      const mat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        depthTest: false,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(1.8, 0.9, 1);
      sprite.visible = false;
      sprite.renderOrder = 999;
      this.scene.add(sprite);
      this.dmgPool.push({ sprite, canvas, ctx, tex, life: 0, max: 0.8 });
    }
  }

  spawnText(wx: number, wy: number, wz: number, text: string, color: string) {
    const item = this.dmgPool[this.dmgIdx];
    this.dmgIdx = (this.dmgIdx + 1) % this.dmgPool.length;
    const ctx = item.ctx;
    ctx.clearRect(0, 0, 200, 100);
    ctx.font = "800 56px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 8;
    ctx.strokeStyle = "rgba(0,0,0,0.7)";
    ctx.strokeText(text, 100, 50);
    ctx.fillStyle = color;
    ctx.fillText(text, 100, 50);
    item.tex.needsUpdate = true;
    item.sprite.position.set(wx, wy, wz);
    item.sprite.visible = true;
    item.life = 0.8;
    item.max = 0.8;
  }

  updateDamage(dt: number) {
    for (const it of this.dmgPool) {
      if (it.life <= 0) continue;
      it.life -= dt;
      it.sprite.position.y += dt * 1.6;
      const m = it.sprite.material as THREE.SpriteMaterial;
      m.opacity = clamp(it.life / it.max, 0, 1);
      const pop = it.life > it.max - 0.12 ? 1.35 : 1;
      it.sprite.scale.set(1.8 * pop, 0.9 * pop, 1);
      if (it.life <= 0) it.sprite.visible = false;
    }
  }

  resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.renderer.setSize(this.w, this.h, false);
    if (this.effect && (this.effect as any).setSize)
      (this.effect as any).setSize(this.w, this.h);
    this.camera.aspect = this.w / this.h;
    this.camera.updateProjectionMatrix();
    this.canvas.style.width = this.w + "px";
    this.canvas.style.height = this.h + "px";
    this.hud.width = Math.floor(this.w * this.dpr);
    this.hud.height = Math.floor(this.h * this.dpr);
    this.hud.style.width = this.w + "px";
    this.hud.style.height = this.h + "px";
  }

  start() {
    this.initThree();
    this.resize();
    this.px = 0;
    this.py = 0;
    const built = buildPlayer(this.cfg.race, this.cfg.cls);
    this.playerGroup = built.group;
    this.weaponPivot = built.weaponPivot;
    this.rig = {
      root: built.root,
      body: built.body,
      head: built.head,
      armR: built.armR,
      armL: built.armL,
      legR: built.legR,
      legL: built.legL,
      elbowR: built.elbowR,
      elbowL: built.elbowL,
      kneeR: built.kneeR,
      kneeL: built.kneeL,
    };
    this.scene.add(this.playerGroup);
    this.buildWorld();
    this.initAmbient();
    this.bind();
    this.running = true;
    this.paused = false;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.loop);
  }

  initAmbient() {
    for (let i = 0; i < 110; i++) this.particles.push(this.makeAmbient());
  }
  makeAmbient(): Particle {
    const leaf = Math.random() < 0.4;
    return {
      x: rand(-30, 30),
      y: rand(0.5, 8),
      z: rand(-30, 30),
      vx: rand(-0.5, 0.5),
      vy: leaf ? rand(-0.3, 0.3) : rand(0.3, 1.0),
      vz: rand(-0.5, 0.5),
      life: rand(2, 6),
      max: 6,
      r: leaf ? 120 : 255,
      g: leaf ? 180 : 220,
      b: leaf ? 70 : 150,
      ambient: true,
    };
  }

  // ---------- events ----------
  bind() {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("resize", this.onResize);
    this.canvas.addEventListener("pointerdown", this.onPointerDown);
    this.canvas.addEventListener("pointermove", this.onPointerMove);
    window.addEventListener("pointerup", this.onPointerUp);
    window.addEventListener("pointercancel", this.onPointerUp);
    this.canvas.addEventListener("contextmenu", this.onContext);
  }
  unbind() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("resize", this.onResize);
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    this.canvas.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerup", this.onPointerUp);
    window.removeEventListener("pointercancel", this.onPointerUp);
    this.canvas.removeEventListener("contextmenu", this.onContext);
  }
  destroy() {
    this.running = false;
    this.paused = false;
    cancelAnimationFrame(this.raf);
    this.unbind();
    if (this.renderer) {
      this.disposeScene();
      this.renderer.dispose();
    }
  }

  disposeScene() {
    if (!this.scene) return;
    for (let i = this.scene.children.length - 1; i >= 0; i--) {
      const o = this.scene.children[i];
      this.scene.remove(o);
      this.disposeGroup(o);
    }
  }

  onKeyDown = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase();
    if (k === "escape") {
      this.togglePause();
      return;
    }
    if (!this.running) return;
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(k))
      e.preventDefault();
    this.keys.add(k);
    if (k === "1" || k === "q") this.castSkill(0);
    if (k === "2" || k === "e") this.castSkill(1);
  };
  onKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.key.toLowerCase());
  };
  onResize = () => {
    if (this.renderer) this.resize();
  };
  onContext = (e: Event) => e.preventDefault();

  onPointerDown = (e: PointerEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // pause button
    if (
      x >= this.pauseRect.x &&
      x <= this.pauseRect.x + this.pauseRect.s &&
      y >= this.pauseRect.y &&
      y <= this.pauseRect.y + this.pauseRect.s
    ) {
      if (this.running) this.pause();
      return;
    }
    // skill buttons
    for (let i = 0; i < this.skillRects.length; i++) {
      const r = this.skillRects[i];
      if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) {
        this.castSkill(i);
        return;
      }
    }
    if (e.pointerType === "mouse") {
      this.mouseActive = true;
      this.lastMouseMove = performance.now();
      this.mouseX = x;
      this.mouseY = y;
      this.mouseDown = true;
      return;
    }
    if (x < this.w * 0.5) {
      this.touchLeft = { id: e.pointerId, bx: x, by: y, x: 0, y: 0 };
    } else {
      this.touchRight = { id: e.pointerId, bx: x, by: y, x: 0, y: 0 };
    }
  };
  onPointerMove = (e: PointerEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (e.pointerType === "mouse") {
      this.mouseActive = true;
      this.lastMouseMove = performance.now();
      this.mouseX = x;
      this.mouseY = y;
      return;
    }
    const max = 56;
    if (this.touchLeft && e.pointerId === this.touchLeft.id) {
      let dx = x - this.touchLeft.bx;
      let dy = y - this.touchLeft.by;
      const m = Math.hypot(dx, dy);
      if (m > max) {
        dx = (dx / m) * max;
        dy = (dy / m) * max;
      }
      this.touchLeft.x = dx;
      this.touchLeft.y = dy;
    }
    if (this.touchRight && e.pointerId === this.touchRight.id) {
      let dx = x - this.touchRight.bx;
      let dy = y - this.touchRight.by;
      const m = Math.hypot(dx, dy);
      if (m > max) {
        dx = (dx / m) * max;
        dy = (dy / m) * max;
      }
      this.touchRight.x = dx;
      this.touchRight.y = dy;
    }
  };
  onPointerUp = (e: PointerEvent) => {
    if (e.pointerType === "mouse") {
      this.mouseDown = false;
      return;
    }
    if (this.touchLeft && e.pointerId === this.touchLeft.id) this.touchLeft = null;
    if (this.touchRight && e.pointerId === this.touchRight.id)
      this.touchRight = null;
  };

  togglePause() {
    if (this.running) this.pause();
    else if (this.paused) this.resume();
  }
  pause() {
    if (!this.running) return;
    this.running = false;
    this.paused = true;
    this.cb.onPaused();
  }
  resume() {
    if (!this.paused) return;
    this.paused = false;
    this.running = true;
    this.last = performance.now();
    this.cb.onResumed();
  }

  loop = (t: number) => {
    this.raf = requestAnimationFrame(this.loop);
    let dt = (t - this.last) / 1000;
    this.last = t;
    if (dt > 0.05) dt = 0.05;
    if (dt < 0) dt = 0;

    if (this.hitStop > 0) {
      this.hitStop -= dt;
      this.render();
      return;
    }
    if (this.running) this.update(dt);
    this.render();
  };

  // ---------- update ----------
  update(dt: number) {
    this.elapsed += dt;
    this.score += dt * 2;
    if (this.invuln > 0) this.invuln -= dt;
    if (this.playerFlash > 0) this.playerFlash -= dt;
    if (this.swing > 0) this.swing -= dt;
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.combo = 0;
    }
    if (this.comboPop > 0) this.comboPop -= dt;
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 55);
    if (this.hintTimer > 0) this.hintTimer -= dt;
    if (this.waveBanner > 0) this.waveBanner -= dt;

    // buffs / mana
    if (this.buffDmgT > 0) this.buffDmgT -= dt;
    if (this.buffSpdT > 0) this.buffSpdT -= dt;
    if (this.buffAtkT > 0) this.buffAtkT -= dt;
    if (this.shieldT > 0) this.shieldT -= dt;
    this.mana = Math.min(this.manaMax, this.mana + this.manaRegen * dt);
    for (let i = 0; i < this.skillCd.length; i++)
      if (this.skillCd[i] > 0)
        this.skillCd[i] -= dt * (1 + this.bCdr / 100);

    // movement
    let mx = 0;
    let my = 0;
    if (this.keys.has("a") || this.keys.has("arrowleft")) mx -= 1;
    if (this.keys.has("d") || this.keys.has("arrowright")) mx += 1;
    if (this.keys.has("w") || this.keys.has("arrowup")) my -= 1;
    if (this.keys.has("s") || this.keys.has("arrowdown")) my += 1;
    if (this.touchLeft) {
      const m = Math.hypot(this.touchLeft.x, this.touchLeft.y);
      if (m > 4) {
        mx = this.touchLeft.x / 56;
        my = this.touchLeft.y / 56;
      }
    }
    const ml = Math.hypot(mx, my);
    this.moving = ml > 0.1;
    if (ml > 1) {
      mx /= ml;
      my /= ml;
    }
    const spd =
      this.speed *
      (this.buffSpdT > 0 ? this.buffSpdM : 1) *
      (1 + this.bSpdPct / 100);
    this.px = clamp(this.px + mx * spd * dt, -2000, 2000);
    this.py = clamp(this.py + my * spd * dt, -2000, 2000);

    this.updateAim();

    const attackHeld =
      this.keys.has(" ") ||
      this.keys.has("j") ||
      this.mouseDown ||
      !!this.touchRight;
    if (attackHeld) this.tryAttack();

    // dash
    if (this.dashT > 0) {
      this.dashT -= dt;
      this.px += this.dashVX * dt;
      this.py += this.dashVY * dt;
      this.invuln = Math.max(this.invuln, 0.05);
      this.spawnParticles(
        this.px + rand(-10, 10),
        this.py + rand(-10, 10),
        this.cfg.cls.weapon.color,
        2,
        2
      );
      for (const e of this.enemies) {
        if (this.dashHit.has(e)) continue;
        if (dist2(e.x, e.y, this.px, this.py) < (e.r + this.pr + 6) ** 2) {
          this.dashHit.add(e);
          this.damageEnemy(e, this.cfg.cls.weapon.damage * 2.2, this.aim);
        }
      }
      if (this.dashT <= 0) this.dashHit.clear();
    }

    for (const e of this.enemies) this.updateEnemy(e, dt);
    this.updateProjectiles(dt);
    this.updateOrbs(dt);
    this.updateParticles(dt);
    this.updateRings(dt);
    this.updateBeams(dt);
    this.updateDamage(dt);
    this.updateWaves(dt);
    this.updateNPCs();

    this.syncPlayer();
    this.animatePlayer(dt);
    this.updateCamera();
  }

  updateAim() {
    const now = performance.now();
    if (this.mouseActive && now - this.lastMouseMove < 1500) {
      this.aim = Math.atan2(
        this.mouseY - this.h / 2,
        this.mouseX - this.w / 2
      );
    } else if (this.touchRight) {
      const m = Math.hypot(this.touchRight.x, this.touchRight.y);
      if (m > 6) this.aim = Math.atan2(this.touchRight.y, this.touchRight.x);
    } else {
      let best: Enemy | null = null;
      let bd = Infinity;
      for (const e of this.enemies) {
        const d = dist2(e.x, e.y, this.px, this.py);
        if (d < bd) {
          bd = d;
          best = e;
        }
      }
      if (best) this.aim = Math.atan2(best.y - this.py, best.x - this.px);
    }
  }

  tryAttack() {
    const w = this.cfg.cls.weapon;
    const now = performance.now();
    const cd = w.cooldown / (this.buffAtkT > 0 ? this.buffAtkM : 1);
    if (now - this.lastAttack < cd) return;
    this.lastAttack = now;
    const mult = this.buffDmgT > 0 ? this.buffDmgM : 1;
    this.triggerAttackAnim();

    if (w.kind === "melee") {
      this.swing = 0.18;
      for (const e of this.enemies) {
        const d = Math.hypot(e.x - this.px, e.y - this.py);
        if (d < w.reach + e.r) {
          const ang = Math.atan2(e.y - this.py, e.x - this.px);
          const diff = Math.abs(angleDiff(ang, this.aim));
          const pad = Math.atan2(e.r, Math.max(d, 1));
          if (diff < w.arc + pad) {
            this.damageEnemy(e, w.damage * mult, this.aim);
            e.kx += Math.cos(this.aim) * w.knockback;
            e.ky += Math.sin(this.aim) * w.knockback;
          }
        }
      }
      this.spawnRing(this.px, this.py, w.reach, w.color);
      this.spawnParticles(
        this.px + Math.cos(this.aim) * w.reach * 0.5,
        this.py + Math.sin(this.aim) * w.reach * 0.5,
        w.color,
        8,
        3
      );
      this.shake = Math.max(this.shake, 3 + w.damage * 0.1);
    } else {
      const ps = w.projSpeed ?? 600;
      const pr = w.projSize ?? 6;
      this.spawnProjectile(
        this.px + Math.cos(this.aim) * (this.pr + 4),
        this.py + Math.sin(this.aim) * (this.pr + 4),
        Math.cos(this.aim) * ps,
        Math.sin(this.aim) * ps,
        w.damage * mult,
        pr,
        w.color
      );
      this.spawnParticles(
        this.px + Math.cos(this.aim) * 20,
        this.py + Math.sin(this.aim) * 20,
        w.color,
        4,
        2
      );
      this.shake = Math.max(this.shake, 2);
    }
  }

  spawnProjectile(x: number, y: number, vx: number, vy: number, dmg: number, r: number, color: string) {
    const mesh = buildProjectileMesh(color);
    mesh.position.set(x * S, 0.9, y * S);
    this.scene.add(mesh);
    this.projectiles.push({ x, y, vx, vy, dmg, r, color, life: 1.6, mesh });
  }

  updateEnemy(e: Enemy, dt: number) {
    const dx = this.px - e.x;
    const dy = this.py - e.y;
    const d = Math.hypot(dx, dy) || 1;
    const nx = dx / d;
    const ny = dy / d;
    let sp = e.type.speed;
    if (e.stunT > 0) sp = 0;
    else if (e.slowT > 0) sp *= 0.4;
    e.x += (nx * sp + e.kx) * dt;
    e.y += (ny * sp + e.ky) * dt;
    e.kx *= 0.86;
    e.ky *= 0.86;
    if (e.hitFlash > 0) e.hitFlash -= dt;
    if (e.slowT > 0) e.slowT -= dt;
    if (e.stunT > 0) e.stunT -= dt;
    if (e.attackTimer > 0) e.attackTimer -= dt;

    if (d < this.pr + e.r + 6 && e.attackTimer <= 0 && e.telegraph === 0) {
      e.telegraph = 0.4; // wind-up
    }
    if (e.telegraph > 0) {
      e.telegraph -= dt;
      // wind-up: lean back, raise
      const wp = 1 - e.telegraph / 0.4;
      e.group.position.y = wp * 0.2;
      e.group.rotation.x = -wp * 0.3;
      e.group.scale.setScalar(1 + wp * 0.06);
      if (e.telegraph <= 0) {
        e.telegraph = -0.18; // lunge
        if (d < this.pr + e.r + 14) {
          this.damagePlayer(e.type.damage);
          this.px = clamp(this.px - nx * 6, -2000, 2000);
          this.py = clamp(this.py - ny * 6, -2000, 2000);
        }
        e.kx -= nx * 200;
        e.ky -= ny * 200;
        e.attackTimer = 0.9;
      }
    } else if (e.telegraph < 0) {
      e.telegraph += dt;
      const lp = -e.telegraph / 0.18;
      e.group.position.y = (1 - lp) * 0.2;
      e.group.rotation.x = (1 - lp) * 0.3;
      e.group.scale.setScalar(1 + (1 - lp) * 0.06);
      if (e.telegraph >= 0) {
        e.telegraph = 0;
        e.group.rotation.x = 0;
        e.group.scale.setScalar(1);
      }
    }

    // visual sync
    e.group.position.set(e.x * S, 0, e.y * S);
    if (e.spin) {
      e.rot += dt * 1.5;
      e.group.rotation.y = e.rot;
      e.group.position.y = Math.sin(performance.now() * 0.003 + e.x) * 0.15;
    } else {
      e.group.rotation.y = -Math.atan2(ny, nx);
      e.group.position.y =
        Math.abs(Math.sin(performance.now() * 0.012 + e.rot)) * 0.16;
    }
    const f = clamp(e.hitFlash / 0.12, 0, 1);
    for (let i = 0; i < e.flashMats.length; i++) {
      const fm = e.flashMats[i] as THREE.MeshToonMaterial;
      if (f > 0) {
        fm.emissive.setRGB(1, 1, 1);
        fm.emissiveIntensity = f * 0.9;
      } else {
        fm.emissive.set(e.baseEmissive[i]);
        fm.emissiveIntensity = e.baseIntensity[i];
      }
    }
  }

  updateProjectiles(dt: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      p.mesh.position.set(p.x * S, 0.9, p.y * S);
      let dead =
        p.life <= 0 ||
        p.x < -2100 ||
        p.x > 2100 ||
        p.y < -2100 ||
        p.y > 2100;
      if (!dead) {
        for (const e of this.enemies) {
          if (dist2(p.x, p.y, e.x, e.y) < (p.r + e.r) ** 2) {
            this.damageEnemy(e, p.dmg, Math.atan2(p.vy, p.vx));
            dead = true;
            break;
          }
        }
      }
      if (dead) {
        this.scene.remove(p.mesh);
        this.projectiles.splice(i, 1);
      }
    }
  }

  updateOrbs(dt: number) {
    for (let i = this.orbs.length - 1; i >= 0; i--) {
      const o = this.orbs[i];
      o.life -= dt;
      const bob = 0.5 + Math.sin(performance.now() * 0.005 + o.x) * 0.12;
      o.mesh.position.set(o.x * S, o.item ? bob + 0.15 : bob, o.y * S);
      if (o.item) {
        // tumbling gem so the loot reads as special
        o.mesh.rotation.y += dt * 2.2;
        o.mesh.rotation.x += dt * 1.3;
      }
      if (dist2(o.x, o.y, this.px, this.py) < (o.r + this.pr + 4) ** 2) {
        if (o.item) {
          const it = o.item;
          const col = RARITY_COLOR[it.rarity];
          const res = this.equipItem(it);
          this.spawnText(this.px * S, 1.75, this.py * S, it.icon + " " + it.name, col);
          this.spawnText(
            this.px * S,
            1.5,
            this.py * S,
            "[" + it.rarity.toUpperCase() + "] " + res,
            col
          );
          this.spawnParticles(this.px, this.py, col, 18, 4);
          this.shake = Math.max(this.shake, 4);
        } else {
          this.hp = Math.min(this.maxHp, this.hp + o.heal);
          this.spawnText(this.px * S, 1.6, this.py * S, "+" + o.heal, "#5dff8f");
          this.spawnParticles(this.px, this.py, "#5dff8f", 10, 3);
        }
        this.scene.remove(o.mesh);
        this.orbs.splice(i, 1);
        continue;
      }
      if (o.life <= 0) {
        this.scene.remove(o.mesh);
        this.orbs.splice(i, 1);
      }
    }
  }

  updateParticles(dt: number) {
    let count = 0;
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;
      p.vx *= 0.92;
      p.vy *= 0.92;
      p.vz *= 0.92;
      p.life -= dt;
      if (p.life <= 0) {
        if (p.ambient) {
          p.x = this.px * S + rand(-30, 30);
          p.z = this.py * S + rand(-30, 30);
          p.y = rand(0.5, 8);
          p.vx = rand(-0.4, 0.4);
          p.vy = rand(0.3, 1.0);
          p.vz = rand(-0.4, 0.4);
          p.life = rand(2, 6);
          p.max = 6;
        } else {
          this.particles.splice(i, 1);
          continue;
        }
      }
      const idx = count * 3;
      const inten = clamp(p.life / p.max, 0, 1);
      this.pPos[idx] = p.x;
      this.pPos[idx + 1] = p.y;
      this.pPos[idx + 2] = p.z;
      this.pCol[idx] = (p.r / 255) * inten;
      this.pCol[idx + 1] = (p.g / 255) * inten;
      this.pCol[idx + 2] = (p.b / 255) * inten;
      count++;
    }
    this.pGeo.setDrawRange(0, Math.min(count, 900));
    (this.pGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    (this.pGeo.attributes.color as THREE.BufferAttribute).needsUpdate = true;
  }

  updateRings(dt: number) {
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i];
      r.life -= dt;
      const t = 1 - r.life / r.max;
      const sc = 0.3 + (r.target - 0.3) * t;
      r.mesh.scale.set(sc, sc, sc);
      (r.mesh.material as THREE.MeshBasicMaterial).opacity = clamp(
        r.life / r.max,
        0,
        1
      );
      if (r.life <= 0) {
        this.scene.remove(r.mesh);
        this.rings.splice(i, 1);
      }
    }
  }
  updateBeams(dt: number) {
    for (let i = this.beams.length - 1; i >= 0; i--) {
      const b = this.beams[i];
      b.life -= dt;
      (b.mesh.material as THREE.MeshBasicMaterial).opacity = clamp(
        b.life / b.max,
        0,
        1
      );
      if (b.life <= 0) {
        this.scene.remove(b.mesh);
        this.beams.splice(i, 1);
      }
    }
  }

  // ---------- equipment / itemization ----------
  recalcEquip() {
    let dmg = 0;
    let spd = 0;
    let hp = 0;
    let cdr = 0;
    let crit = 0;
    let ls = 0;
    for (const s of SLOTS) {
      const it = this.equipped[s];
      if (!it) continue;
      dmg += it.dmgPct ?? 0;
      spd += it.speedPct ?? 0;
      hp += it.hp ?? 0;
      cdr += it.cdr ?? 0;
      crit += it.crit ?? 0;
      ls += it.lifesteal ?? 0;
    }
    const prevHp = this.bHp;
    this.bDmgPct = dmg;
    this.bSpdPct = spd;
    this.bHp = hp;
    this.bCdr = cdr;
    this.bCrit = crit;
    this.bLS = ls;
    const delta = hp - prevHp;
    if (delta !== 0) {
      this.maxHp = Math.max(1, this.maxHp + delta);
      this.hp = clamp(this.hp + Math.max(0, delta), 1, this.maxHp);
    }
  }

  equipItem(item: ItemDef): string {
    const cur = this.equipped[item.slot];
    const upgrade = !cur || RARITY_RANK[item.rarity] > RARITY_RANK[cur.rarity];
    if (upgrade) {
      this.equipped[item.slot] = item;
      this.recalcEquip();
      return cur ? "upgraded" : "equipped";
    }
    return "kept " + (cur?.name ?? item.name);
  }

  makeItemOrb(color: string): THREE.Mesh {
    const g = new THREE.Group();
    const gem = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.34, 0),
      new THREE.MeshBasicMaterial({ color })
    );
    g.add(gem);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.5, 0.04, 8, 20),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.7 })
    );
    ring.rotation.x = Math.PI / 2;
    g.add(ring);
    return g as unknown as THREE.Mesh;
  }

  // ---------- combat ----------
  damageEnemy(e: Enemy, dmg: number, _ang: number) {
    // equipment: damage % then a crit roll that doubles the hit
    let d = dmg * (1 + this.bDmgPct / 100);
    const crit = this.bCrit > 0 && Math.random() < this.bCrit / 100;
    if (crit) d *= 2;
    d = Math.max(1, d);
    e.hp -= d;
    e.hitFlash = 0.12;
    this.spawnText(
      e.x * S,
      1.3,
      e.y * S,
      (crit ? "CRIT " : "") + String(Math.round(d)),
      crit ? "#ffd24a" : "#ffffff"
    );
    if (crit) {
      this.shake = Math.max(this.shake, 3);
      this.spawnParticles(e.x, e.y, "#ffd24a", 7, 3);
    }
    this.spawnParticles(e.x, e.y, e.type.accent, 5, 2);
    // lifesteal: a sliver of the wound comes back to you
    if (this.bLS > 0 && this.hp < this.maxHp) {
      const heal = d * (this.bLS / 100);
      if (heal >= 2 && Math.random() < 0.35) {
        this.hp = Math.min(this.maxHp, this.hp + heal);
        this.spawnText(this.px * S, 1.5, this.py * S, "+" + Math.round(heal), "#5dff8f");
      }
    }
    if (e.hp <= 0) this.killEnemy(e);
  }

  killEnemy(e: Enemy) {
    const idx = this.enemies.indexOf(e);
    if (idx < 0) return;
    this.enemies.splice(idx, 1);
    this.kills++;
    this.combo++;
    this.comboTimer = 2.2;
    if (this.combo > this.bestCombo) this.bestCombo = this.combo;
    this.comboPop = 0.3;
    const mult = Math.min(1 + this.combo * 0.08, 3);
    this.score += e.score * mult;
    this.spawnParticles(e.x, e.y, e.type.color, e.boss ? 28 : 14, e.boss ? 5 : 3);
    this.spawnRing(e.x, e.y, e.r * 3, e.type.color);
    this.shake = Math.max(this.shake, e.boss ? 12 : 5);
    if (e.boss) this.hitStop = 0.05;
    if (Math.random() < 0.13) {
      const mesh = buildOrbMesh();
      mesh.position.set(e.x * S, 0.5, e.y * S);
      this.scene.add(mesh);
      this.orbs.push({ x: e.x, y: e.y, r: 9, life: 8, heal: 18, mesh });
    }
    // equipment drop — bosses always drop, everyone else scales with the wave
    const drop = rollItemDrop(this.wave, e.boss);
    if (drop) {
      const col = RARITY_COLOR[drop.rarity];
      const mesh = this.makeItemOrb(col);
      mesh.position.set(e.x * S, 0.6, e.y * S);
      this.scene.add(mesh);
      this.orbs.push({ x: e.x, y: e.y, r: 12, life: 14, heal: 0, item: drop, mesh });
    }
    this.disposeGroup(e.group);
    this.scene.remove(e.group);
  }

  damagePlayer(amount: number) {
    if (this.shieldT > 0) {
      this.spawnText(this.px * S, 1.6, this.py * S, "BLOCK", "#7fd0ff");
      return;
    }
    if (this.invuln > 0) return;
    this.hp -= amount;
    this.invuln = 0.6;
    this.playerFlash = 0.35;
    this.shake = Math.max(this.shake, 9);
    this.hitStop = 0.04;
    this.spawnText(this.px * S, 1.6, this.py * S, "-" + Math.round(amount), "#ff5a5a");
    if (this.hp <= 0) {
      this.hp = 0;
      this.gameOver();
    }
  }

  // ---------- skills ----------
  castSkill(i: number) {
    if (!this.running || this.paused) return;
    const sk = this.skills[i];
    if (!sk) return;
    if (this.skillCd[i] > 0) return;
    if (this.mana < sk.mana) {
      this.spawnText(this.px * S, 1.8, this.py * S, "NO MANA", "#ff9090");
      return;
    }
    this.mana -= sk.mana;
    this.skillCd[i] = sk.cooldown;
    this.triggerAttackAnim();
    this.applySkill(sk);
  }

  applySkill(sk: SkillDef) {
    const w = this.cfg.cls.weapon;
    const dmg = w.damage * (sk.damage ?? 1);
    switch (sk.kind) {
      case "aoe":
      case "nova": {
        this.damageArea(this.px, this.py, sk.radius ?? 120, dmg, {
          slow: sk.slow ?? 0,
          stun: sk.stun ?? false,
          knock: w.knockback,
        });
        this.spawnRing(this.px, this.py, sk.radius ?? 120, w.color);
        this.spawnParticles(this.px, this.py, w.color, 18, 4);
        this.shake = Math.max(this.shake, 7);
        break;
      }
      case "point": {
        const tx = this.px + Math.cos(this.aim) * (sk.range ?? 280);
        const ty = this.py + Math.sin(this.aim) * (sk.range ?? 280);
        this.damageArea(tx, ty, sk.radius ?? 120, dmg, {
          slow: sk.slow ?? 0,
          knock: w.knockback,
        });
        this.spawnRing(tx, ty, sk.radius ?? 120, w.color);
        this.spawnParticles(tx, ty, w.color, 18, 4);
        this.shake = Math.max(this.shake, 7);
        break;
      }
      case "beam": {
        const range = sk.range ?? 320;
        this.damageBeam(this.px, this.py, this.aim, range, dmg, w.knockback);
        this.spawnBeam(this.px, this.py, this.aim, range, w.color);
        this.shake = Math.max(this.shake, 6);
        break;
      }
      case "dash": {
        this.dashT = sk.duration ?? 0.16;
        const ds = 950;
        this.dashVX = Math.cos(this.aim) * ds;
        this.dashVY = Math.sin(this.aim) * ds;
        this.dashHit.clear();
        this.spawnParticles(this.px, this.py, w.color, 12, 4);
        break;
      }
      case "projectile": {
        const n = sk.count ?? 1;
        const spread = sk.spread ?? 0.3;
        for (let k = 0; k < n; k++) {
          const a =
            this.aim +
            (n === 1 ? 0 : (k / (n - 1) - 0.5) * spread * 2);
          const ps = (w.projSpeed ?? 600) * 1.05;
          this.spawnProjectile(
            this.px + Math.cos(a) * (this.pr + 4),
            this.py + Math.sin(a) * (this.pr + 4),
            Math.cos(a) * ps,
            Math.sin(a) * ps,
            dmg,
            (w.projSize ?? 6) + 1,
            w.color
          );
        }
        this.shake = Math.max(this.shake, 5);
        break;
      }
      case "heal": {
        this.hp = Math.min(this.maxHp, this.hp + this.maxHp * (sk.amount ?? 0.3));
        this.spawnText(
          this.px * S,
          1.8,
          this.py * S,
          "+" + Math.round(this.maxHp * (sk.amount ?? 0.3)),
          "#5dff8f"
        );
        this.spawnParticles(this.px, this.py, "#5dff8f", 14, 4);
        if (sk.buff === "damage" && sk.buffAmount) {
          this.buffDmgT = sk.duration ?? 6;
          this.buffDmgM = sk.buffAmount;
        }
        if (sk.buff === "shield") {
          this.shieldT = sk.duration ?? 3;
          this.spawnText(this.px * S, 1.8, this.py * S, "SHIELD!", "#7fd0ff");
        }
        break;
      }
      case "buff": {
        if (sk.buff === "damage") {
          this.buffDmgT = sk.duration ?? 8;
          this.buffDmgM = sk.amount ?? 1.4;
          this.spawnText(this.px * S, 1.8, this.py * S, "POWER!", w.color);
        } else if (sk.buff === "speed") {
          this.buffSpdT = sk.duration ?? 8;
          this.buffSpdM = sk.amount ?? 1.4;
          this.spawnText(this.px * S, 1.8, this.py * S, "SPEED!", w.color);
        } else if (sk.buff === "atkspeed") {
          this.buffAtkT = sk.duration ?? 5;
          this.buffAtkM = sk.amount ?? 2;
          this.spawnText(this.px * S, 1.8, this.py * S, "FLURRY!", w.color);
        } else if (sk.buff === "shield") {
          this.shieldT = sk.duration ?? 3;
          this.spawnText(this.px * S, 1.8, this.py * S, "SHIELD!", "#7fd0ff");
        }
        this.spawnParticles(this.px, this.py, w.color, 14, 4);
        break;
      }
    }
  }

  damageArea(
    cx: number,
    cy: number,
    r: number,
    dmg: number,
    opts: { slow?: number; stun?: boolean; knock?: number; angle?: number; arcHalf?: number } = {}
  ) {
    for (const e of this.enemies) {
      const d = Math.hypot(e.x - cx, e.y - cy);
      if (d < r + e.r) {
        if (opts.angle !== undefined) {
          const a = Math.atan2(e.y - cy, e.x - cx);
          const pad = Math.atan2(e.r, Math.max(d, 1));
          if (Math.abs(angleDiff(a, opts.angle)) > (opts.arcHalf ?? Math.PI) + pad)
            continue;
        }
        this.damageEnemy(e, dmg, Math.atan2(e.y - cy, e.x - cx));
        if (opts.slow) e.slowT = Math.max(e.slowT, 1.5);
        if (opts.stun) e.stunT = Math.max(e.stunT, 1.2);
        if (opts.knock) {
          const a = Math.atan2(e.y - cy, e.x - cx);
          e.kx += Math.cos(a) * opts.knock;
          e.ky += Math.sin(a) * opts.knock;
        }
      }
    }
  }

  damageBeam(cx: number, cy: number, ang: number, range: number, dmg: number, knock: number) {
    const cos = Math.cos(ang);
    const sin = Math.sin(ang);
    const width = 26;
    for (const e of this.enemies) {
      const ex = e.x - cx;
      const ey = e.y - cy;
      const proj = ex * cos + ey * sin;
      if (proj < 0 || proj > range) continue;
      const perp = Math.abs(-ex * sin + ey * cos);
      if (perp < width + e.r) {
        this.damageEnemy(e, dmg, ang);
        e.kx += cos * knock;
        e.ky += sin * knock;
      }
    }
  }

  spawnRing(x: number, y: number, radius: number, color: string) {
    const mesh = new THREE.Mesh(
      new THREE.RingGeometry(0.85, 1.0, 36),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x * S, 0.06, y * S);
    this.scene.add(mesh);
    this.rings.push({ mesh, life: 0.45, max: 0.45, target: radius * S });
  }

  spawnBeam(x: number, y: number, ang: number, range: number, color: string) {
    const len = range * S;
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(len, 0.7, 0.7),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    mesh.position.set(
      (x + Math.cos(ang) * range / 2) * S,
      0.9,
      (y + Math.sin(ang) * range / 2) * S
    );
    mesh.rotation.y = -ang;
    this.scene.add(mesh);
    this.beams.push({ mesh, life: 0.25, max: 0.25 });
  }

  spawnParticles(px: number, py: number, color: string, count: number, spread: number) {
    const c = this.parseHex(color);
    if (this.particles.length > 820) return;
    for (let i = 0; i < count; i++) {
      const a = rand(0, TAU);
      const sp = rand(1, spread * 2.5);
      this.particles.push({
        x: px * S,
        y: 0.8,
        z: py * S,
        vx: Math.cos(a) * sp,
        vy: rand(0.5, 2.5),
        vz: Math.sin(a) * sp,
        life: rand(0.25, 0.55),
        max: 0.55,
        r: c.r,
        g: c.g,
        b: c.b,
        ambient: false,
      });
    }
  }

  // ---------- waves ----------
  updateWaves(dt: number) {
    if (this.waveState === "intermission") {
      this.intermission -= dt;
      if (this.intermission <= 0) this.startNextWave();
    } else {
      this.spawnTimer -= dt;
      if (this.spawnQueue > 0 && this.spawnTimer <= 0 && this.enemies.length < 34) {
        this.spawnFromWave();
        this.spawnQueue--;
        this.spawnTimer = rand(0.25, 0.55);
      }
      if (this.spawnQueue === 0 && this.enemies.length === 0) {
        this.score += 60 + this.wave * 12;
        this.waveBanner = 2.4;
        this.waveBannerText = `WAVE ${this.wave} CLEARED`;
        this.hp = Math.min(this.maxHp, this.hp + this.maxHp * 0.12);
        this.spawnParticles(this.px, this.py, "#ffd76a", 24, 5);
        this.waveState = "intermission";
        this.intermission = 3.2;
      }
    }
  }

  startNextWave() {
    this.wave++;
    this.bossPending = this.wave % 5 === 0;
    const count = Math.min(6 + Math.floor(this.wave * 1.6), 28);
    this.spawnQueue = count + (this.bossPending ? 1 : 0);
    this.waveState = "fighting";
    this.waveBanner = 2.0;
    this.waveBannerText = this.bossPending
      ? `WAVE ${this.wave} — BOSS`
      : `WAVE ${this.wave}`;
  }

  spawnFromWave() {
    if (this.bossPending) {
      this.bossPending = false;
      this.spawnEnemy(ENEMY_TYPES[4], true);
      return;
    }
    const w = this.wave;
    let pool: EnemyType[];
    if (w < 2) pool = [ENEMY_TYPES[0], ENEMY_TYPES[1]];
    else if (w < 4) pool = [ENEMY_TYPES[0], ENEMY_TYPES[1], ENEMY_TYPES[2]];
    else if (w < 7)
      pool = [
        ENEMY_TYPES[0],
        ENEMY_TYPES[1],
        ENEMY_TYPES[2],
        ENEMY_TYPES[3],
        ENEMY_TYPES[6],
      ];
    else
      pool = [
        ENEMY_TYPES[1],
        ENEMY_TYPES[2],
        ENEMY_TYPES[3],
        ENEMY_TYPES[4],
        ENEMY_TYPES[5],
        ENEMY_TYPES[6],
        ENEMY_TYPES[7],
      ];
    let type = pool[Math.floor(Math.random() * pool.length)];
    if (Math.random() < 0.06 && w > 3) type = ENEMY_TYPES[4];
    this.spawnEnemy(type, false);
  }

  spawnEnemy(type: EnemyType, boss: boolean) {
    const s = boss ? 1 : 1 + this.wave * 0.1;
    const maxHp = (boss ? type.hp * 3 : type.hp) * s;
    const r = boss ? type.radius * 1.4 : type.radius;
    const angle = rand(0, TAU);
    const dist = 360;
    const ex = this.px + Math.cos(angle) * dist;
    const ey = this.py + Math.sin(angle) * dist;
    const built = buildEnemy(type);
    built.group.position.set(ex * S, 0, ey * S);
    this.scene.add(built.group);
    const e: Enemy = {
      type,
      x: ex,
      y: ey,
      kx: 0,
      ky: 0,
      hp: maxHp,
      maxHp,
      r,
      hitFlash: 0,
      attackTimer: rand(0, 0.5),
      rot: rand(0, TAU),
      slowT: 0,
      stunT: 0,
      telegraph: 0,
      group: built.group,
      flashMats: built.flashMats,
      baseEmissive: built.baseEmissive,
      baseIntensity: built.baseIntensity,
      spin: type.shape === "elemental",
      boss,
      score: boss ? type.score * 5 : type.score,
    };
    this.enemies.push(e);
  }

  // ---------- sync / camera ----------
  syncPlayer() {
    this.playerGroup.position.set(this.px * S, 0, this.py * S);
    this.playerGroup.rotation.y = -this.aim;
  }

  animatePlayer(dt: number) {
    const t = performance.now() * 0.001;
    const r = this.rig;
    if (!r) return;

    // ---- locomotion: a real bent-knee gait with weight shift ----
    const move = this.moving ? 1 : 0;
    this.walkPhase += dt * (this.moving ? 10 : 1.8);
    const ph = this.walkPhase;
    const sR = Math.sin(ph);
    const sL = Math.sin(ph + Math.PI);
    const hipA = 0.7 * move;
    // thighs swing forward and back from the hip
    r.legR.rotation.x = sR * hipA;
    r.legL.rotation.x = sL * hipA;
    // knees bend hard on the push-off / lift, with a soft resting bend so the
    // stance never looks bolted straight
    r.kneeR.rotation.x = 0.18 + move * (0.12 + Math.max(0, -sR) * 0.95);
    r.kneeL.rotation.x = 0.18 + move * (0.12 + Math.max(0, -sL) * 0.95);
    // the spine twists against the lead leg and leans into the stride
    r.body.rotation.y = -sR * 0.2 * move;
    r.body.rotation.z = sR * 0.05 * move;
    r.body.rotation.x = (this.moving ? 0.1 : 0) + Math.sin(t * 2) * 0.02;
    // two-beat vertical bob per stride (down on each footfall)
    r.root.position.y = this.moving
      ? Math.abs(Math.sin(ph)) * 0.07
      : Math.sin(t * 2) * 0.025;
    // arms counter-swing opposite the legs; the elbow trails the swing
    const armSwing = 0.75 * move;
    const idleSway = Math.sin(t * 2) * 0.05;
    let aRx = -sR * armSwing;
    let aLx = -sL * armSwing;
    let aRz = 0.06 + idleSway * 0.4;
    let aLz = -0.06 - idleSway * 0.4;
    let eRx = 0.28 + move * Math.max(0, sR) * 0.55;
    let eLx = 0.28 + move * Math.max(0, sL) * 0.55;

    // ---- attack: pose targets per weapon style ----
    if (this.attackT > 0) {
      this.attackT -= dt;
      const p = 1 - this.attackT / this.attackDur; // 0..1
      const e = p < 0.5 ? p * 2 : (1 - p) * 2; // 0..1..0 ease
      switch (this.attackKind) {
        case "swing": {
          aRz = -1.3 + e * 2.6;
          aRx = -0.3 + Math.sin(p * Math.PI) * 0.4;
          eRx = 0.35 + (1 - e) * 1.2; // cocked elbow that whips straight through the cut
          r.body.rotation.y = -0.3 + e * 0.6;
          aLx = 0.3;
          aLz = 0.4 - e * 0.3;
          eLx = 0.6;
          break;
        }
        case "chop": {
          aRx = -2.2 + e * 3.0;
          aRz = -0.3;
          eRx = 1.5 * (1 - e) + 0.2; // high wind-up, then snaps down
          r.body.rotation.x = -0.2 + e * 0.5;
          eLx = 0.4;
          break;
        }
        case "thrust": {
          aRx = -0.2 - e * 0.5;
          aRz = -0.2;
          eRx = 1.3 * (1 - e); // elbow fully extends at the point
          r.body.position.z = e * 0.18;
          eLx = 0.5;
          break;
        }
        case "draw": {
          this.bowDraw = e;
          aRx = -0.4 - e * 0.3;
          aRz = -0.6;
          eRx = 1.0 + e * 0.7; // draw elbow pulls back with the string
          aLx = -0.2;
          aLz = 0.5;
          eLx = 0.3;
          break;
        }
        case "cast": {
          this.castGlow = e;
          const up = Math.sin(p * Math.PI);
          aRx = -1.6 - up * 0.6;
          aRz = -0.5;
          eRx = 0.8 + up * 0.4;
          aLx = -1.6 - up * 0.6;
          aLz = 0.5;
          eLx = 0.8 + up * 0.4;
          r.body.rotation.x = -0.15 - up * 0.1;
          break;
        }
      }
    } else {
      r.body.position.z *= 0.8;
      this.bowDraw *= 0.85;
      this.castGlow *= 0.85;
    }

    // ---- smooth every joint toward its target; this is what finally
    //      kills the rigid "stop-motion" snapping between poses ----
    const k = Math.min(1, dt * 16);
    r.armR.rotation.x += (aRx - r.armR.rotation.x) * k;
    r.armR.rotation.z += (aRz - r.armR.rotation.z) * k;
    r.armL.rotation.x += (aLx - r.armL.rotation.x) * k;
    r.armL.rotation.z += (aLz - r.armL.rotation.z) * k;
    r.elbowR.rotation.x += (eRx - r.elbowR.rotation.x) * k;
    r.elbowL.rotation.x += (eLx - r.elbowL.rotation.x) * k;

    // the head tracks the body's twist a touch, over a faint idle look-around
    r.head.rotation.y = Math.sin(t * 0.7) * 0.12 - r.body.rotation.y * 0.3;
    r.head.rotation.x = Math.sin(t * 0.5) * 0.05;

    // magic charge glow on weapon orb
    this.weaponPivot.traverse((o) => {
      const m = o as THREE.Mesh;
      const mat = m.material as THREE.MeshToonMaterial | undefined;
      if (mat && mat.emissive && mat.emissive.getHex() !== 0) {
        const base = (mat.userData.baseEmi as number) ?? mat.emissiveIntensity;
        if (mat.userData.baseEmi === undefined) mat.userData.baseEmi = base;
        mat.emissiveIntensity = this.castGlow > 0.02
          ? 0.3 + this.castGlow * 1.5
          : base;
      }
    });

    // player flash
    if (this.playerFlash > 0 && Math.floor(performance.now() / 60) % 2 === 0)
      r.root.position.y += 0.12;
  }

  triggerAttackAnim() {
    const w = this.cfg.cls.weapon;
    this.attackT = this.attackDur;
    switch (w.shape) {
      case "sword":
      case "dualsword":
      case "kris":
      case "dagger":
        this.attackKind = "swing";
        this.attackDur = 0.22;
        break;
      case "mace":
      case "hammer":
      case "axe":
      case "fist":
        this.attackKind = "chop";
        this.attackDur = 0.3;
        break;
      case "spear":
        this.attackKind = "thrust";
        this.attackDur = 0.22;
        break;
      case "bow":
      case "crossbow":
        this.attackKind = "draw";
        this.attackDur = 0.26;
        break;
      case "staff":
      case "wand":
      case "totem":
      case "soulblade":
      case "scythe":
        this.attackKind = "cast";
        this.attackDur = 0.3;
        break;
      default:
        this.attackKind = "swing";
        this.attackDur = 0.22;
    }
    this.attackT = this.attackDur;
  }

  buildWorld() {
    const fountain = buildFountain();
    fountain.position.set(0, 0, -8);
    this.scene.add(fountain);
    const houses = 8;
    for (let i = 0; i < houses; i++) {
      const a = (i / houses) * TAU;
      const h = buildHouse();
      h.position.set(Math.cos(a) * 17, 0, Math.sin(a) * 17 - 2);
      h.rotation.y = -a + Math.PI / 2;
      h.scale.setScalar(rand(0.9, 1.15));
      this.scene.add(h);
    }
    for (let i = 0; i < 16; i++) {
      const a = rand(0, TAU);
      const d = rand(22, 42);
      const tr = buildTree();
      tr.position.set(Math.cos(a) * d, 0, Math.sin(a) * d);
      tr.scale.setScalar(rand(0.8, 1.3));
      this.scene.add(tr);
    }
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * TAU;
      const t = buildTorch();
      t.position.set(Math.cos(a) * 3, 0, Math.sin(a) * 3 - 8);
      this.scene.add(t);
    }
    // rocks
    for (let i = 0; i < 10; i++) {
      const a = rand(0, TAU);
      const d = rand(14, 40);
      const r = buildRock();
      r.position.set(Math.cos(a) * d, 0, Math.sin(a) * d);
      r.rotation.y = rand(0, TAU);
      this.scene.add(r);
    }
    // flowers
    for (let i = 0; i < 40; i++) {
      const a = rand(0, TAU);
      const d = rand(10, 45);
      const f = buildFlower();
      f.position.set(Math.cos(a) * d, 0, Math.sin(a) * d);
      f.rotation.y = rand(0, TAU);
      this.scene.add(f);
    }
    // crates + barrels near houses
    for (let i = 0; i < 6; i++) {
      const a = rand(0, TAU);
      const d = rand(15, 19);
      const c = Math.random() < 0.5 ? buildCrate() : buildBarrel();
      c.position.set(Math.cos(a) * d, 0, Math.sin(a) * d);
      c.rotation.y = rand(0, TAU);
      this.scene.add(c);
    }
    // banners
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * TAU + Math.PI / 4;
      const b = buildBanner();
      b.position.set(Math.cos(a) * 9, 0, Math.sin(a) * 9 - 4);
      b.rotation.y = -a;
      this.scene.add(b);
    }
    // clouds
    for (let i = 0; i < 8; i++) {
      const cl = buildCloud();
      cl.position.set(rand(-80, 80), rand(20, 34), rand(-80, 80));
      cl.scale.setScalar(rand(1.5, 3));
      this.scene.add(cl);
      this.clouds.push(cl);
    }
    // NPCs
    for (let i = 0; i < 6; i++) {
      const npc = buildNPC();
      const a = rand(0, TAU);
      const d = rand(4, 9);
      npc.group.position.set(Math.cos(a) * d, 0, Math.sin(a) * d - 2);
      npc.group.rotation.y = -a + Math.PI;
      npc.group.scale.setScalar(0.95);
      this.scene.add(npc.group);
      this.npcs.push({ group: npc.group, phase: rand(0, TAU) });
    }
  }

  updateNPCs() {
    const t = performance.now() * 0.001;
    for (const n of this.npcs) {
      n.group.position.y = Math.sin(t * 1.6 + n.phase) * 0.05;
      n.group.rotation.y += Math.sin(t * 0.5 + n.phase) * 0.002;
    }
    for (const c of this.clouds) {
      c.position.x += 0.5 * (1 / 60);
      if (c.position.x > 90) c.position.x = -90;
    }
  }

  updateCamera() {
    const tx = this.px * S;
    const tz = this.py * S;
    const desired = new THREE.Vector3(tx, 9, tz + 11);
    this.camera.position.lerp(desired, 0.1);
    if (this.shake > 0.2) {
      this.camera.position.x += rand(-this.shake, this.shake) * 0.05;
      this.camera.position.y += rand(-this.shake, this.shake) * 0.05;
    }
    this.camera.lookAt(tx, 1.6, tz);
    // keep sky + sun centered on camera
    const sky = this.scene.getObjectByName("sky");
    if (sky) sky.position.copy(this.camera.position);
    const sun = this.scene.getObjectByName("sun");
    if (sun) sun.position.set(
      this.camera.position.x + 120,
      90,
      this.camera.position.z - 160
    );
  }

  disposeGroup(g: THREE.Object3D) {
    g.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      if (m.material) {
        const mat = m.material as THREE.Material | THREE.Material[];
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else mat.dispose();
      }
    });
  }

  gameOver() {
    this.running = false;
    const result: GameResult = {
      score: Math.floor(this.score),
      time: this.elapsed,
      kills: this.kills,
      bestCombo: this.bestCombo,
      wave: this.wave,
      race: this.cfg.race.name,
      cls: this.cfg.cls.name,
    };
    this.cb.onGameOver(result);
  }

  // ---------- render ----------
  render() {
    this.effect.render(this.scene, this.camera);
    this.drawHud();
  }

  drawHud() {
    const ctx = this.hctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.w, this.h);
    ctx.textBaseline = "alphabetic";

    const prog = clamp(this.wave / 30, 0, 1);
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(0, 0, this.w, 4);
    ctx.fillStyle = this.cfg.race.color;
    ctx.fillRect(0, 0, this.w * prog, 4);

    // score
    this.roundRect(ctx, 14, 14, 214, 84, 12);
    ctx.fillStyle = "rgba(10,14,26,0.55)";
    ctx.fill();
    ctx.textAlign = "left";
    ctx.fillStyle = "#fff";
    ctx.font = "800 30px Cinzel, serif";
    ctx.fillText(String(Math.floor(this.score)), 26, 48);
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = "600 12px Inter, sans-serif";
    ctx.fillText("SCORE", 26, 64);
    const mm = Math.floor(this.elapsed / 60);
    const ss = Math.floor(this.elapsed % 60);
    ctx.fillText(
      `KILLS ${this.kills}   ${mm}:${ss.toString().padStart(2, "0")}`,
      26,
      84
    );

    // hp + mana
    const hy = 108;
    this.roundRect(ctx, 14, hy, 214, 64, 12);
    ctx.fillStyle = "rgba(10,14,26,0.55)";
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "600 12px Inter, sans-serif";
    ctx.fillText(`${this.cfg.cls.name} · ${this.cfg.race.name}`, 26, hy + 16);
    const barW = 190;
    const bx = 26;
    // hp
    let by = hy + 24;
    this.bar(ctx, bx, by, barW, 8, clamp(this.hp / this.maxHp, 0, 1), this.hp / this.maxHp > 0.3 ? "#5dff8f" : "#ff5a5a");
    // mana
    by = hy + 42;
    this.bar(ctx, bx, by, barW, 8, clamp(this.mana / this.manaMax, 0, 1), "#4aa8ff");

    // wave banner
    const phase = Math.floor((this.wave - 1) / 3) + 1;
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = "700 13px Inter, sans-serif";
    if (this.waveState === "intermission" && this.wave > 0) {
      ctx.fillText(
        `NEXT WAVE IN ${Math.ceil(this.intermission)}s`,
        this.w / 2,
        30
      );
    } else {
      ctx.fillText(`PHASE ${phase}  ·  WAVE ${this.wave}`, this.w / 2, 30);
    }
    if (this.waveBanner > 0) {
      const a = clamp(this.waveBanner / 0.6, 0, 1);
      ctx.globalAlpha = a;
      ctx.font = "900 34px Cinzel, serif";
      ctx.fillStyle = this.cfg.race.color;
      ctx.fillText(this.waveBannerText, this.w / 2, 84);
      ctx.globalAlpha = 1;
    }

    // combo
    if (this.combo >= 2) {
      const mult = Math.min(1 + this.combo * 0.08, 3);
      const pop = 1 + this.comboPop * 1.5;
      ctx.save();
      ctx.translate(this.w / 2, 132);
      ctx.scale(pop, pop);
      ctx.font = "900 28px Cinzel, serif";
      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba(0,0,0,0.6)";
      const txt = `COMBO x${mult.toFixed(1)}`;
      ctx.strokeText(txt, 0, 0);
      ctx.fillStyle = this.cfg.race.color;
      ctx.fillText(txt, 0, 0);
      ctx.restore();
    }

    // hint
    if (this.hintTimer > 0) {
      const a = clamp(this.hintTimer / 2, 0, 1);
      ctx.globalAlpha = a;
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.font = "600 14px Inter, sans-serif";
      ctx.fillText(
        "MOVE WASD/Arrows · AIM Mouse · ATTACK Click/Space · SKILLS 1/2 · PAUSE Esc",
        this.w / 2,
        this.h - 96
      );
      ctx.globalAlpha = 1;
    }

    // skill bar
    this.skillRects = [];
    const n = this.skills.length;
    const bw = Math.min(72, (this.w - 40) / Math.max(n, 1) - 8);
    const gap = 10;
    const totalW = n * bw + (n - 1) * gap;
    const startX = (this.w - totalW) / 2;
    const sy = this.h - 78;
    for (let i = 0; i < n; i++) {
      const rx = startX + i * (bw + gap);
      const r = { x: rx, y: sy, w: bw, h: 60 };
      this.skillRects.push(r);
      const sk = this.skills[i];
      const cd = this.skillCd[i];
      const onCd = cd > 0;
      const noMana = this.mana < sk.mana;
      ctx.globalAlpha = onCd || noMana ? 0.5 : 1;
      this.roundRect(ctx, rx, sy, bw, 60, 12);
      ctx.fillStyle = "rgba(10,14,26,0.7)";
      ctx.fill();
      ctx.strokeStyle = this.cfg.cls.weapon.color;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.textAlign = "center";
      ctx.font = "26px serif";
      ctx.fillStyle = "#fff";
      ctx.fillText(sk.emoji, rx + bw / 2, sy + 30);
      ctx.font = "700 11px Inter, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fillText((i + 1).toString(), rx + 8, sy + 14);
      ctx.fillStyle = "rgba(150,200,255,0.9)";
      ctx.fillText(String(sk.mana), rx + bw - 8, sy + 14);
      if (onCd) {
        const frac = cd / sk.cooldown;
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(rx, sy, bw, 60 * frac);
        ctx.fillStyle = "#fff";
        ctx.font = "700 16px Inter, sans-serif";
        ctx.fillText(cd.toFixed(1), rx + bw / 2, sy + 38);
      }
      ctx.globalAlpha = 1;
    }

    // pause button
    this.pauseRect.x = this.w - this.pauseRect.s - 16;
    this.pauseRect.y = 16;
    // ---- equipped gear row (left panel, under the vitals) ----
    const gy = 184;
    this.roundRect(ctx, 14, gy, 214, 54, 12);
    ctx.fillStyle = "rgba(10,14,26,0.55)";
    ctx.fill();
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = "600 11px Inter, sans-serif";
    ctx.fillText("EQUIPMENT", 24, gy + 14);
    const cellW = 60;
    const gx0 = 24;
    const gy0 = gy + 22;
    for (let i = 0; i < SLOTS.length; i++) {
      const slot = SLOTS[i];
      const it = this.equipped[slot];
      const x = gx0 + i * (cellW + 6);
      this.roundRect(ctx, x, gy0, cellW, 24, 5);
      ctx.fillStyle = it ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.04)";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = it ? RARITY_COLOR[it.rarity] : "rgba(255,255,255,0.12)";
      ctx.stroke();
      if (it) {
        ctx.textAlign = "left";
        ctx.font = "13px serif";
        ctx.fillStyle = "#fff";
        ctx.fillText(it.icon, x + 6, gy0 + 17);
        ctx.font = "700 8.5px Inter, sans-serif";
        ctx.fillStyle = RARITY_COLOR[it.rarity];
        const nm = it.name.length > 8 ? it.name.slice(0, 7) + "…" : it.name;
        ctx.fillText(nm, x + 22, gy0 + 15);
      } else {
        ctx.textAlign = "left";
        ctx.font = "700 8px Inter, sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.fillText(slot.toUpperCase(), x + 6, gy0 + 15);
      }
    }
    ctx.textAlign = "left";

    // ---- pause button ----
    this.roundRect(ctx, this.pauseRect.x, this.pauseRect.y, this.pauseRect.s, this.pauseRect.s, 10);
    ctx.fillStyle = "rgba(10,14,26,0.6)";
    ctx.fill();
    const px = this.pauseRect.x + this.pauseRect.s / 2;
    const py = this.pauseRect.y + this.pauseRect.s / 2;
    ctx.fillStyle = "#fff";
    ctx.fillRect(px - 7, py - 9, 5, 18);
    ctx.fillRect(px + 2, py - 9, 5, 18);
  }

  bar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, frac: number, color: string) {
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    this.roundRect(ctx, x, y, w, h, 4);
    ctx.fill();
    ctx.fillStyle = color;
    this.roundRect(ctx, x, y, w * frac, h, 4);
    ctx.fill();
  }

  roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  parseHex(hex: string) {
    const h = hex.replace("#", "");
    const full =
      h.length === 3
        ? h
            .split("")
            .map((c) => c + c)
            .join("")
        : h;
    const n = parseInt(full, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
}
