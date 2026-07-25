import * as THREE from "three";
import type { ClassDef, EnemyType, RaceDef, RaceId } from "./data";

// ---------- Toon shading ----------
const gradColors = new Uint8Array([
  55, 55, 62, 255, 130, 130, 142, 255, 200, 200, 212, 255, 255, 255, 255, 255,
]);
const gradTex = new THREE.DataTexture(gradColors, 4, 1, THREE.RGBAFormat);
gradTex.needsUpdate = true;
gradTex.minFilter = THREE.NearestFilter;
gradTex.magFilter = THREE.NearestFilter;

function toon(color: string, emi = 0) {
  const m = new THREE.MeshToonMaterial({ color, gradientMap: gradTex });
  if (emi > 0) {
    m.emissive = new THREE.Color(color);
    m.emissiveIntensity = emi;
  }
  return m;
}
function basic(color: string, transparent = false, opacity = 1) {
  return new THREE.MeshBasicMaterial({ color, transparent, opacity });
}
function rand(a: number, b: number) {
  return a + Math.random() * (b - a);
}
function lh(hex: string) {
  const h = hex.replace("#", "");
  const full =
    h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const f = (v: number) => Math.min(255, Math.round(v + (255 - v) * 0.45));
  return `rgb(${f(r)},${f(g)},${f(b)})`;
}
function shadow(r = 0.8) {
  const m = new THREE.Mesh(
    new THREE.CircleGeometry(r, 24),
    basic("#000000", true, 0.3)
  );
  m.rotation.x = -Math.PI / 2;
  m.position.y = 0.02;
  return m;
}
function skinFor(id: RaceId) {
  switch (id) {
    case "orc": return "#9c6b3f";
    case "dwarf": return "#caa06a";
    case "darkelf": return "#b89adf";
    case "elf": return "#f0d2a8";
    case "kamael": return "#e6d8c0";
    default: return "#e8c39a";
  }
}
function hairFor(id: RaceId) {
  switch (id) {
    case "human": return "#6b4a2a";
    case "elf": return "#e8d27a";
    case "darkelf": return "#3a2350";
    case "orc": return "#1a1a1a";
    case "dwarf": return "#7a3a1a";
    case "kamael": return "#dfe7ee";
  }
}
function armorFor(id: string, color: string) {
  const c = color;
  switch (id) {
    case "knight": return { body: "#7d8796", accent: "#c0c8d4", trim: "#3a4252" };
    case "warrior": return { body: c, accent: lh(c), trim: "#3a2a1a" };
    case "rogue": return { body: "#2a2a33", accent: "#4a4a55", trim: c };
    case "archer": return { body: "#3f6b3a", accent: "#5f9a4f", trim: "#7a5a2a" };
    case "mystic": return { body: "#3a4a8a", accent: "#5a6abf", trim: "#d4b04a" };
    case "sentinel": return { body: "#3a7a6a", accent: "#5fbf9f", trim: "#d4b04a" };
    case "assassin": return { body: "#2a1a3a", accent: "#4a2a6a", trim: c };
    case "shillien": return { body: "#3a1a4a", accent: "#6a2a8a", trim: "#d4b04a" };
    case "sorcerer": return { body: "#2a1a4a", accent: "#5a2a8a", trim: "#d4b04a" };
    case "destroyer": return { body: "#5a2a1a", accent: "#8a4a2a", trim: "#3a1a0a" };
    case "monk": return { body: "#c9a05a", accent: "#e0c07a", trim: "#7a5a2a" };
    case "overlord": return { body: "#6a3a1a", accent: "#9a5a2a", trim: "#d4b04a" };
    case "artisan": return { body: "#7a5a2a", accent: "#9a7a4a", trim: "#3a2a1a" };
    case "warsmith": return { body: "#5a5a6a", accent: "#7a7a8a", trim: "#d4b04a" };
    case "berserker": return { body: "#3a6a6a", accent: "#5fbfbf", trim: "#d4b04a" };
    case "soulbreaker": return { body: "#2a5a5a", accent: "#4fbfbf", trim: "#d4b04a" };
    default: return { body: c, accent: lh(c), trim: "#3a2a1a" };
  }
}

// ---------- Weapons ----------
export function buildWeapon(shape: string, color: string): THREE.Object3D {
  const g = new THREE.Group();
  const bladeMat = toon(color, 0.3);
  const dark = toon("#2b2f3a");
  switch (shape) {
    case "sword":
    case "dagger":
    case "kris": {
      const len = shape === "dagger" ? 0.7 : shape === "kris" ? 0.95 : 1.2;
      const b = new THREE.Mesh(new THREE.BoxGeometry(len, 0.08, 0.18), bladeMat);
      b.position.x = 0.1 + len / 2;
      g.add(b);
      const guard = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.42), dark);
      guard.position.x = 0.1;
      g.add(guard);
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8), dark);
      handle.rotation.z = Math.PI / 2;
      handle.position.x = -0.06;
      g.add(handle);
      break;
    }
    case "mace":
    case "hammer": {
      const len = shape === "hammer" ? 1.1 : 0.95;
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, len, 8), dark);
      handle.rotation.z = Math.PI / 2;
      handle.position.x = 0.1 + len / 2 - 0.1;
      g.add(handle);
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.42), toon(color, 0.15));
      head.position.x = 0.1 + len;
      g.add(head);
      for (let i = 0; i < 4; i++) {
        const s = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.18, 6), dark);
        const a = (i / 4) * Math.PI * 2;
        s.position.set(0.1 + len, Math.cos(a) * 0.3, Math.sin(a) * 0.3);
        s.rotation.z = -a + Math.PI / 2;
        g.add(s);
      }
      break;
    }
    case "axe": {
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.2, 8), dark);
      handle.rotation.z = Math.PI / 2;
      handle.position.x = 0.65;
      g.add(handle);
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.3), bladeMat);
      blade.position.set(1.2, 0.15, 0);
      g.add(blade);
      break;
    }
    case "spear": {
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.6, 8), dark);
      handle.rotation.z = Math.PI / 2;
      handle.position.x = 0.8;
      g.add(handle);
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.4, 8), bladeMat);
      tip.rotation.z = -Math.PI / 2;
      tip.position.x = 1.6;
      g.add(tip);
      break;
    }
    case "bow": {
      const arc = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.06, 8, 18, Math.PI * 1.2), toon("#6b4a2a"));
      arc.position.x = 0.1;
      g.add(arc);
      const string = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.9, 0.02), toon("#dddddd"));
      string.position.set(0.1, 0, 0);
      g.add(string);
      break;
    }
    case "staff":
    case "wand": {
      const len = shape === "wand" ? 0.9 : 1.3;
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, len, 8), toon("#5a3d22"));
      handle.rotation.z = Math.PI / 2;
      handle.position.x = 0.1 + len / 2;
      g.add(handle);
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), toon(color, 0.9));
      orb.position.x = 0.1 + len;
      g.add(orb);
      break;
    }
    case "scythe": {
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8), dark);
      handle.rotation.z = Math.PI / 2;
      handle.position.x = 0.75;
      g.add(handle);
      const blade = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.07, 8, 16, Math.PI), bladeMat);
      blade.position.set(1.45, 0.2, 0);
      blade.rotation.z = -Math.PI / 2;
      g.add(blade);
      break;
    }
    case "fist": {
      const kn = toon(color, 0.2);
      for (let i = 0; i < 2; i++) {
        const k = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 10), kn);
        k.position.set(0.25, i === 0 ? 0.1 : -0.1, 0);
        g.add(k);
      }
      break;
    }
    case "totem": {
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.9, 0.3), toon("#7a5230"));
      base.position.x = 0.5;
      g.add(base);
      const top = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 10), toon(color, 0.5));
      top.position.x = 0.95;
      g.add(top);
      break;
    }
    case "crossbow": {
      const stock = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.12, 0.12), dark);
      stock.position.x = 0.4;
      g.add(stock);
      for (const s of [-1, 1]) {
        const limb = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.5, 0.08), dark);
        limb.position.set(0.55, s * 0.25, 0);
        g.add(limb);
      }
      break;
    }
    case "dualsword": {
      for (const s of [-1, 1]) {
        const len = 1.0;
        const b = new THREE.Mesh(new THREE.BoxGeometry(len, 0.07, 0.15), bladeMat);
        b.position.set(0.1 + len / 2, s * 0.12, 0);
        g.add(b);
        const guard = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.09, 0.34), dark);
        guard.position.set(0.1, s * 0.12, 0);
        g.add(guard);
      }
      break;
    }
    case "soulblade": {
      const len = 1.2;
      const b = new THREE.Mesh(new THREE.BoxGeometry(len, 0.1, 0.22), toon(color, 1.0));
      b.position.x = 0.1 + len / 2;
      g.add(b);
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8), dark);
      handle.rotation.z = Math.PI / 2;
      handle.position.x = -0.06;
      g.add(handle);
      break;
    }
    default: {
      const b = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.08, 0.18), bladeMat);
      b.position.x = 0.6;
      g.add(b);
    }
  }
  return g;
}

// ---------- Player ----------
export interface PlayerRig {
  group: THREE.Group;
  weaponPivot: THREE.Group;
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
}

export function buildPlayer(
  race: RaceDef,
  cls: ClassDef
): PlayerRig {
  const group = new THREE.Group();
  const root = new THREE.Group();
  group.add(root);
  const skinC = skinFor(race.id);
  const hairC = hairFor(race.id);
  const armor = armorFor(cls.id, cls.color);
  const skin = toon(skinC);
  const hair = toon(hairC);
  const bodyMat = toon(armor.body);
  const accentMat = toon(armor.accent);
  const trimMat = toon(armor.trim);

  // legs — two-bone chain (hip -> knee -> foot) so the gait can bend
  const legR = new THREE.Group();
  legR.position.set(-0.17, 0.95, 0);
  root.add(legR);
  const legL = new THREE.Group();
  legL.position.set(0.17, 0.95, 0);
  root.add(legL);
  const kneeR = new THREE.Group();
  kneeR.position.y = -0.5;
  legR.add(kneeR);
  const kneeL = new THREE.Group();
  kneeL.position.y = -0.5;
  legL.add(kneeL);
  for (const [hip, knee] of [
    [legR, kneeR],
    [legL, kneeL],
  ] as const) {
    const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.3, 4, 8), bodyMat);
    thigh.position.y = -0.24;
    hip.add(thigh);
    const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.3, 4, 8), accentMat);
    shin.position.y = -0.22;
    knee.add(shin);
    const boot = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.18, 0.42), trimMat);
    boot.position.set(0, -0.42, 0.07);
    knee.add(boot);
  }
  // body pivot (torso + head + arms) at the hip
  const body = new THREE.Group();
  body.position.y = 1.0;
  root.add(body);
  // pelvis
  const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.3, 0.36), bodyMat);
  pelvis.position.y = 0;
  body.add(pelvis);
  // belt
  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.39, 0.39, 0.12, 12), trimMat);
  belt.position.y = 0.12;
  body.add(belt);
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.05), accentMat);
  buckle.position.set(0, 0.12, 0.32);
  body.add(buckle);
  // torso
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 0.5, 4, 12), bodyMat);
  torso.position.y = 0.5;
  body.add(torso);
  // chest plate
  const chest = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.42, 0.34), accentMat);
  chest.position.y = 0.55;
  body.add(chest);
  const chestTrim = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.42, 0.36), trimMat);
  chestTrim.position.set(0, 0.55, 0.02);
  body.add(chestTrim);
  // pauldrons
  for (const s of [-1, 1]) {
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), accentMat);
    p.position.set(s * 0.42, 0.78, 0);
    body.add(p);
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 6), trimMat);
    spike.position.set(s * 0.42, 0.96, 0);
    body.add(spike);
  }
  // arms — two-bone chain (shoulder -> elbow -> hand) so strikes follow through
  const armR = new THREE.Group();
  armR.position.set(-0.46, 0.78, 0);
  body.add(armR);
  const armL = new THREE.Group();
  armL.position.set(0.46, 0.78, 0);
  body.add(armL);
  const elbowR = new THREE.Group();
  elbowR.position.y = -0.4;
  armR.add(elbowR);
  const elbowL = new THREE.Group();
  elbowL.position.y = -0.4;
  armL.add(elbowL);
  for (const [sh, el] of [
    [armR, elbowR],
    [armL, elbowL],
  ] as const) {
    const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.26, 4, 8), skin);
    upper.position.y = -0.18;
    sh.add(upper);
    const fore = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.24, 4, 8), accentMat);
    fore.position.y = -0.16;
    el.add(fore);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 10), skin);
    hand.position.y = -0.34;
    el.add(hand);
  }
  // neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.18, 10), skin);
  neck.position.y = 0.9;
  body.add(neck);
  // head mesh + a pivot for hair/face details
  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.33, 18, 18), skin);
  headMesh.position.y = 1.18;
  body.add(headMesh);
  const head = new THREE.Group();
  head.position.y = 1.18;
  body.add(head);
  // All head-detail positions below are relative to head origin (y≈1.18 in body space)
  // jaw
  const jaw = new THREE.Mesh(new THREE.SphereGeometry(0.26, 14, 14), skin);
  jaw.position.set(0.04, -0.1, 0.12);
  jaw.scale.set(1, 0.7, 1);
  head.add(jaw);
  // nose
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.14, 6), skin);
  nose.rotation.z = -Math.PI / 2;
  nose.position.set(0.34, -0.08, 0);
  head.add(nose);
  // ears
  for (const s of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), skin);
    ear.position.set(0.02, 0.02, s * 0.33);
    ear.scale.set(0.6, 1, 1);
    head.add(ear);
  }
  // eyes
  for (const s of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), toon("#1a1a22"));
    eye.position.set(0.28, 0.04, s * 0.13);
    head.add(eye);
    const shine = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), toon("#ffffff", 0.6));
    shine.position.set(0.32, 0.06, s * 0.13);
    head.add(shine);
  }
  // brows
  for (const s of [-1, 1]) {
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 0.14), hair);
    brow.position.set(0.26, 0.14, s * 0.13);
    brow.rotation.x = s * 0.1;
    head.add(brow);
  }
  // hair by class
  const hairStyle = cls.id;
  if (hairStyle === "knight" || hairStyle === "warsmith") {
    const helm = new THREE.Mesh(new THREE.SphereGeometry(0.36, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.62), accentMat);
    helm.position.y = 0.04;
    head.add(helm);
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.3), trimMat);
    visor.position.set(0.28, 0.04, 0);
    head.add(visor);
    const plume = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.4, 6), toon(cls.color, 0.4));
    plume.position.set(-0.1, 0.37, 0);
    plume.rotation.z = 0.3;
    head.add(plume);
  } else if (hairStyle === "mystic" || hairStyle === "sorcerer" || hairStyle === "shillien" || hairStyle === "soulbreaker") {
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.36, 18, 18, 0, Math.PI * 2, 0, Math.PI * 0.66), hair);
    cap.position.y = 0.06;
    head.add(cap);
    const point = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.5, 10), hair);
    point.position.set(-0.12, 0.32, 0);
    point.rotation.z = 0.5;
    head.add(point);
    const beard = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.22, 0.2), hair);
    beard.position.set(0.3, -0.2, 0);
    head.add(beard);
  } else if (hairStyle === "archer" || hairStyle === "sentinel" || hairStyle === "rogue" || hairStyle === "assassin") {
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.36, 18, 18, 0, Math.PI * 2, 0, Math.PI * 0.55), hair);
    cap.position.y = 0.06;
    head.add(cap);
    for (const s of [-1, 1]) {
      const strand = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.4, 0.08), hair);
      strand.position.set(0.02, -0.08, s * 0.3);
      head.add(strand);
    }
  } else if (hairStyle === "monk" || hairStyle === "berserker") {
    const topknot = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), hair);
    topknot.position.set(-0.1, 0.32, 0);
    head.add(topknot);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.06, 14), trimMat);
    band.position.y = 0.12;
    head.add(band);
  } else if (hairStyle === "destroyer" || hairStyle === "overlord") {
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.37, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5), hair);
    cap.position.y = 0.08;
    head.add(cap);
    const mohawk = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.3, 0.5), hair);
    mohawk.position.set(0, 0.32, 0);
    head.add(mohawk);
  } else {
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.36, 18, 18, 0, Math.PI * 2, 0, Math.PI * 0.62), hair);
    cap.position.y = 0.04;
    head.add(cap);
  }

  // cloak for some classes
  if (["knight", "mystic", "sentinel", "shillien", "soulbreaker", "warsmith"].includes(cls.id)) {
    const cloak = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.6, 14, 1, true), toon(cls.color, 0.12));
    cloak.position.set(-0.05, 0.4, -0.14);
    cloak.rotation.x = 0.12;
    body.add(cloak);
    const clasp = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), accentMat);
    clasp.position.set(0, 0.78, -0.2);
    body.add(clasp);
  }

  if (race.id === "kamael") {
    const wingMat = toon(cls.color, 0.25);
    const wL = new THREE.Mesh(new THREE.ConeGeometry(0.32, 1.0, 4), wingMat);
    wL.position.set(-0.5, 0.6, -0.25);
    wL.rotation.z = 0.7;
    body.add(wL);
    const wR = wL.clone();
    wR.position.x = 0.5;
    wR.rotation.z = -0.7;
    body.add(wR);
  }

  group.add(shadow(0.7));

  // weapon hangs from the elbow/hand so it bends with the forearm
  const weaponPivot = new THREE.Group();
  weaponPivot.position.set(0, -0.34, 0.1);
  weaponPivot.add(buildWeapon(cls.weapon.shape, cls.weapon.color));
  elbowR.add(weaponPivot);

  if (race.id === "orc") group.scale.set(1.18, 1.16, 1.08);
  if (race.id === "dwarf") group.scale.set(0.85, 0.85, 0.85);
  if (race.id === "elf") group.scale.set(0.95, 1.08, 0.95);
  if (race.id === "darkelf") group.scale.set(0.97, 1.04, 0.97);

  group.userData.weaponPivot = weaponPivot;
  return {
    group,
    weaponPivot,
    root,
    body,
    head,
    armR,
    armL,
    legR,
    legL,
    elbowR,
    elbowL,
    kneeR,
    kneeL,
  };
}

export function buildNPC(): { group: THREE.Group; weaponPivot: THREE.Group } {
  const races = ["human", "elf", "darkelf", "orc", "dwarf", "kamael"] as RaceId[];
  const r = races[Math.floor(Math.random() * races.length)];
  const clsPool = ["warrior", "archer", "mystic", "rogue", "monk", "sentinel"];
  const clsId = clsPool[Math.floor(Math.random() * clsPool.length)];
  const raceDef: RaceDef = { id: r, name: r, color: "#ccc", blurb: "", classes: [] };
  const cls: ClassDef = {
    id: clsId,
    name: clsId,
    role: "",
    hp: 100,
    speed: 200,
    color: ["#e0b753", "#74d68a", "#a878ff", "#d07a3c", "#c9a05a", "#46c7b8"][Math.floor(Math.random() * 6)],
    desc: "",
    weapon: { id: "sword", name: "", shape: "sword", kind: "melee", damage: 10, cooldown: 400, reach: 80, arc: 0.7, knockback: 100, color: "#ffd76a", emoji: "🗡️" },
  };
  return buildPlayer(raceDef, cls);
}

// ---------- Enemies ----------
export function buildEnemy(type: EnemyType): {
  group: THREE.Group;
  flashMats: THREE.Material[];
  baseEmissive: string[];
  baseIntensity: number[];
} {
  const group = new THREE.Group();
  const flashMats: THREE.Material[] = [];
  const main = toon(type.color);
  const accent = toon(type.accent, 0.35);
  flashMats.push(main);
  const addFlash = (m: THREE.Material) => {
    flashMats.push(m);
    return m;
  };

  switch (type.shape) {
    case "goblin": {
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.7, 14, 14), main);
      b.position.y = 0.8;
      group.add(b);
      const h = new THREE.Mesh(new THREE.SphereGeometry(0.45, 14, 14), main);
      h.position.y = 1.6;
      group.add(h);
      for (const s of [-1, 1]) {
        const ear = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.4, 6), main);
        ear.position.set(s * 0.4, 1.75, 0);
        ear.rotation.z = s * 0.5;
        group.add(ear);
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), toon("#ffec3d", 0.6));
        eye.position.set(0.32, 1.62, s * 0.16);
        group.add(eye);
      }
      break;
    }
    case "spider": {
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.6, 14, 14), main);
      b.position.y = 0.6;
      group.add(b);
      for (let i = 0; i < 4; i++) {
        const a = 0.5 + i * 0.5;
        for (const s of [-1, 1]) {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.1, 6), toon("#3a2a4a"));
          leg.position.set(s * Math.cos(a) * 0.5, 0.55, Math.sin(a) * 0.5);
          leg.rotation.z = s * a;
          group.add(leg);
        }
      }
      const e = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), accent);
      e.position.set(0.32, 0.7, 0);
      group.add(e);
      break;
    }
    case "skeleton": {
      const b = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.34, 1.0, 10), main);
      b.position.y = 1.0;
      group.add(b);
      const h = new THREE.Mesh(new THREE.SphereGeometry(0.4, 14, 14), main);
      h.position.y = 1.7;
      group.add(h);
      for (let i = 0; i < 3; i++) {
        const rib = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.1), addFlash(toon(type.accent)));
        rib.position.y = 0.75 + i * 0.22;
        group.add(rib);
      }
      break;
    }
    case "orc": {
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.95, 14, 14), main);
      b.scale.y = 1.15;
      b.position.y = 1.1;
      group.add(b);
      const h = new THREE.Mesh(new THREE.SphereGeometry(0.5, 14, 14), toon(skinFor("orc")));
      h.position.y = 2.1;
      group.add(h);
      for (const s of [-1, 1]) {
        const tusk = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.4, 6), toon("#fff"));
        tusk.position.set(s * 0.2, 1.9, 0.42);
        group.add(tusk);
      }
      break;
    }
    case "knight": {
      const b = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.4, 0.8), toon("#6b7280"));
      b.position.y = 1.1;
      group.add(b);
      const h = new THREE.Mesh(new THREE.SphereGeometry(0.5, 14, 14), toon("#9aa3b2"));
      h.position.y = 2.0;
      group.add(h);
      const shield = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.0, 0.8), addFlash(toon(type.accent)));
      shield.position.set(0.7, 1.1, 0);
      group.add(shield);
      break;
    }
    case "elemental": {
      const crystal = new THREE.Mesh(new THREE.IcosahedronGeometry(0.85, 0), toon(type.color, 0.9));
      crystal.position.y = 1.1;
      group.add(crystal);
      const halo = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.06, 8, 20), accent);
      halo.position.y = 1.1;
      halo.rotation.x = Math.PI / 2;
      group.add(halo);
      break;
    }
    case "wraith": {
      // ghostly, half-transparent drifter with its own materials (so the
      // shared `main` flash material stays opaque for the hit-flash pass)
      const ghost = toon(type.color);
      ghost.transparent = true;
      ghost.opacity = 0.72;
      addFlash(ghost);
      const wisp = toon(type.color);
      wisp.transparent = true;
      wisp.opacity = 0.42;
      const robe = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.5, 10, 1, true), ghost);
      robe.position.y = 0.9;
      group.add(robe);
      const hood = new THREE.Mesh(new THREE.SphereGeometry(0.36, 12, 12), ghost);
      hood.position.y = 1.7;
      group.add(hood);
      for (const s of [-1, 1]) {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), toon(type.accent, 1));
        eye.position.set(0.28, 1.72, s * 0.12);
        group.add(eye);
      }
      for (let i = 0; i < 4; i++) {
        const t = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.45, 5), wisp);
        const a = (i / 4) * Math.PI * 2;
        t.position.set(Math.cos(a) * 0.42, 0.22, Math.sin(a) * 0.42);
        group.add(t);
      }
      break;
    }
    case "troll": {
      const torso = new THREE.Mesh(new THREE.SphereGeometry(1.0, 14, 14), main);
      torso.scale.set(1.0, 1.2, 0.9);
      torso.position.y = 1.2;
      group.add(torso);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 12), main);
      head.position.y = 2.25;
      group.add(head);
      for (const s of [-1, 1]) {
        const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.8, 4, 8), main);
        arm.position.set(s * 1.0, 1.3, 0);
        arm.rotation.z = s * 0.3;
        group.add(arm);
        const tusk = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.3, 6), toon("#f0ead0"));
        tusk.position.set(s * 0.18, 2.05, 0.4);
        tusk.rotation.x = -0.4;
        group.add(tusk);
      }
      const club = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.24, 1.3, 8), toon("#5a3a22"));
      club.position.set(1.15, 1.0, 0.3);
      club.rotation.z = 0.5;
      group.add(club);
      break;
    }
  }

  group.add(shadow(0.7));
  const baseEmissive = flashMats.map((m) => (m as THREE.MeshToonMaterial).emissive.getHexString());
  const baseIntensity = flashMats.map((m) => (m as THREE.MeshToonMaterial).emissiveIntensity);
  return { group, flashMats, baseEmissive, baseIntensity };
}

export function buildProjectileMesh(color: string): THREE.Mesh {
  return new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 10), toon(color, 0.9));
}
export function buildOrbMesh(): THREE.Mesh {
  return new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 12), toon("#5dff8f", 0.8));
}

// ---------- Environment ----------
export function buildHouse(): THREE.Group {
  const g = new THREE.Group();
  const wall = new THREE.Mesh(new THREE.BoxGeometry(3, 2.4, 3), toon("#d8c39a"));
  wall.position.y = 1.2;
  g.add(wall);
  const beam = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.2, 0.2), toon("#6b4a2a"));
  beam.position.y = 2.5;
  g.add(beam);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.5, 1.6, 4), toon("#9c4a2f"));
  roof.position.y = 3.2;
  roof.rotation.y = Math.PI / 4;
  g.add(roof);
  const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.9, 0.4), toon("#7a5a4a"));
  chimney.position.set(0.7, 3.4, -0.6);
  g.add(chimney);
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.2, 0.1), toon("#5a3a22"));
  door.position.set(0, 0.6, 1.5);
  g.add(door);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), toon("#d4b04a"));
  knob.position.set(0.2, 0.6, 1.56);
  g.add(knob);
  for (const s of [-1, 1]) {
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.1), toon("#ffd877", 0.6));
    win.position.set(s * 0.9, 1.5, 1.5);
    g.add(win);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.06, 0.12), toon("#6b4a2a"));
    frame.position.set(s * 0.9, 1.5, 1.5);
    g.add(frame);
  }
  g.add(shadow(1.6));
  return g;
}

export function buildTree(): THREE.Group {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 1.6, 8), toon("#6b4a2a"));
  trunk.position.y = 0.8;
  g.add(trunk);
  const f1 = new THREE.Mesh(new THREE.ConeGeometry(1.3, 1.8, 10), toon("#3f7a3a"));
  f1.position.y = 2.2;
  g.add(f1);
  const f2 = new THREE.Mesh(new THREE.ConeGeometry(0.95, 1.4, 10), toon("#4f9148"));
  f2.position.y = 3.0;
  g.add(f2);
  g.add(shadow(1.2));
  return g;
}

export function buildFountain(): THREE.Group {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(2, 2.2, 0.6, 16), toon("#9aa0ad"));
  base.position.y = 0.3;
  g.add(base);
  const water = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 0.2, 16), toon("#4aa8d8", 0.5));
  water.position.y = 0.6;
  g.add(water);
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 1.4, 12), toon("#9aa0ad"));
  pillar.position.y = 1.3;
  g.add(pillar);
  const top = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 12), toon("#4aa8d8", 0.5));
  top.position.y = 2.1;
  g.add(top);
  g.add(shadow(2.2));
  return g;
}

export function buildTorch(): THREE.Group {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 1.8, 8), toon("#3a2a1a"));
  pole.position.y = 0.9;
  g.add(pole);
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.5, 8), toon("#ff9a3c", 1.0));
  flame.position.y = 1.95;
  g.add(flame);
  const light = new THREE.PointLight(0xffa64d, 6, 12);
  light.position.y = 2;
  g.add(light);
  return g;
}

export function buildRock(): THREE.Group {
  const g = new THREE.Group();
  const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.6, 0), toon("#7a7a82"));
  rock.position.y = 0.3;
  rock.scale.set(rand(0.8, 1.4), rand(0.6, 1.0), rand(0.8, 1.3));
  g.add(rock);
  g.add(shadow(0.7));
  return g;
}

export function buildFlower(): THREE.Group {
  const g = new THREE.Group();
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 6), toon("#3f7a3a"));
  stem.position.y = 0.2;
  g.add(stem);
  const colors = ["#ff6b9d", "#ffd877", "#b07aff", "#ff8a5c"];
  const c = colors[Math.floor(Math.random() * colors.length)];
  for (let i = 0; i < 5; i++) {
    const petal = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), toon(c));
    const a = (i / 5) * Math.PI * 2;
    petal.position.set(Math.cos(a) * 0.1, 0.42, Math.sin(a) * 0.1);
    g.add(petal);
  }
  const center = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), toon("#ffec3d"));
  center.position.y = 0.42;
  g.add(center);
  return g;
}

export function buildCrate(): THREE.Group {
  const g = new THREE.Group();
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), toon("#8a5a2a"));
  box.position.y = 0.45;
  g.add(box);
  for (const s of [-1, 1]) {
    const band = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.1, 0.1), toon("#5a3a1a"));
    band.position.set(0, 0.45, s * 0.45);
    g.add(band);
  }
  g.add(shadow(0.6));
  return g;
}

export function buildBarrel(): THREE.Group {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 1.1, 14), toon("#7a4a2a"));
  body.position.y = 0.55;
  g.add(body);
  for (const y of [0.25, 0.85]) {
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.47, 0.47, 0.08, 14), toon("#3a2a1a"));
    ring.position.y = y;
    g.add(ring);
  }
  g.add(shadow(0.5));
  return g;
}

export function buildBanner(): THREE.Group {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3, 8), toon("#3a2a1a"));
  pole.position.y = 1.5;
  g.add(pole);
  const flag = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.7, 0.04), toon("#c93030"));
  flag.position.set(0.5, 2.3, 0);
  g.add(flag);
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.15, 0.05), toon("#ffd877"));
  stripe.position.set(0.5, 2.3, 0);
  g.add(stripe);
  return g;
}

export function buildCloud(): THREE.Mesh {
  const g = new THREE.Group();
  const m = new THREE.MeshLambertMaterial({
    color: "#ffffff",
    transparent: true,
    opacity: 0.92,
  });
  for (let i = 0; i < 4; i++) {
    const s = new THREE.Mesh(new THREE.SphereGeometry(rand(1.2, 2.2), 10, 10), m);
    s.position.set(rand(-2, 2), rand(-0.4, 0.4), rand(-1, 1));
    s.scale.y = 0.6;
    g.add(s);
  }
  return g as unknown as THREE.Mesh;
}

export function buildSkyDome(): THREE.Mesh {
  const geo = new THREE.SphereGeometry(400, 32, 16);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: {
      top: { value: new THREE.Color("#1a2a5a") },
      mid: { value: new THREE.Color("#5a7abf") },
      bot: { value: new THREE.Color("#ffd8a8") },
    },
    vertexShader: `
      varying vec3 vPos;
      void main(){ vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
    `,
    fragmentShader: `
      varying vec3 vPos;
      uniform vec3 top; uniform vec3 mid; uniform vec3 bot;
      void main(){
        float h = normalize(vPos).y;
        vec3 c = h > 0.0 ? mix(mid, top, clamp(h*1.4,0.0,1.0)) : mix(mid, bot, clamp(-h*2.0,0.0,1.0));
        gl_FragColor = vec4(c, 1.0);
      }
    `,
  });
  return new THREE.Mesh(geo, mat);
}

export const RACE_IDS: RaceId[] = [
  "human", "elf", "darkelf", "orc", "dwarf", "kamael",
];
