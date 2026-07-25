// Lineage-inspired data: races, exclusive classes, exclusive weapons, enemies.

export type RaceId =
  | "human"
  | "elf"
  | "darkelf"
  | "orc"
  | "dwarf"
  | "kamael";

export type WeaponShape =
  | "sword"
  | "mace"
  | "dagger"
  | "bow"
  | "staff"
  | "spear"
  | "kris"
  | "scythe"
  | "wand"
  | "axe"
  | "fist"
  | "totem"
  | "hammer"
  | "crossbow"
  | "dualsword"
  | "soulblade";

export interface Weapon {
  id: string;
  name: string;
  shape: WeaponShape;
  kind: "melee" | "ranged";
  damage: number;
  cooldown: number; // ms between attacks
  reach: number; // melee arc radius (logical px)
  arc: number; // melee half-angle (radians)
  knockback: number; // px/s impulse applied to enemies
  projSpeed?: number; // ranged projectile speed px/s
  projSize?: number; // ranged projectile radius
  color: string;
  emoji: string;
}

export interface ClassDef {
  id: string;
  name: string;
  role: string;
  hp: number;
  speed: number; // px/s
  weapon: Weapon;
  color: string; // body accent
  desc: string;
}

export interface RaceDef {
  id: RaceId;
  name: string;
  color: string;
  blurb: string;
  classes: ClassDef[];
}

export interface EnemyType {
  id: string;
  name: string;
  color: string;
  accent: string;
  hp: number;
  speed: number;
  damage: number;
  radius: number;
  score: number;
  shape:
    | "goblin"
    | "spider"
    | "skeleton"
    | "orc"
    | "knight"
    | "elemental"
    | "wraith"
    | "troll";
}

export const RACES: RaceDef[] = [
  {
    id: "human",
    name: "Human",
    color: "#e0b753",
    blurb: "Adaptable children of Aden. Balanced in all disciplines.",
    classes: [
      {
        id: "warrior",
        name: "Warrior",
        role: "Blademaster",
        hp: 110,
        speed: 235,
        color: "#e0b753",
        weapon: {
          id: "sword",
          name: "Titanium Sword",
          shape: "sword",
          kind: "melee",
          damage: 22,
          cooldown: 340,
          reach: 82,
          arc: 0.72,
          knockback: 150,
          color: "#ffd76a",
          emoji: "🗡️",
        },
        desc: "A balanced swordfighter with swift, reliable strikes.",
      },
      {
        id: "knight",
        name: "Knight",
        role: "Guardian",
        hp: 142,
        speed: 205,
        color: "#c9a23a",
        weapon: {
          id: "mace",
          name: "Heavy Mace",
          shape: "mace",
          kind: "melee",
          damage: 36,
          cooldown: 640,
          reach: 76,
          arc: 0.95,
          knockback: 340,
          color: "#cfd6e0",
          emoji: "🔨",
        },
        desc: "Slow wind-up, earth-shattering blunt-force blows.",
      },
      {
        id: "rogue",
        name: "Rogue",
        role: "Assassin",
        hp: 92,
        speed: 256,
        color: "#d8c27a",
        weapon: {
          id: "dagger",
          name: "Dark Dagger",
          shape: "dagger",
          kind: "melee",
          damage: 14,
          cooldown: 210,
          reach: 66,
          arc: 0.6,
          knockback: 90,
          color: "#7fe9ff",
          emoji: "🗡️",
        },
        desc: "Lightning-fast dagger flurries that shred crowds.",
      },
    ],
  },
  {
    id: "elf",
    name: "Elf",
    color: "#74d68a",
    blurb: "Children of the forest. Graceful, swift, and precise.",
    classes: [
      {
        id: "archer",
        name: "Archer",
        role: "Hawk Eye",
        hp: 96,
        speed: 240,
        color: "#74d68a",
        weapon: {
          id: "bow",
          name: "Noble Bow",
          shape: "bow",
          kind: "ranged",
          damage: 18,
          cooldown: 360,
          reach: 0,
          arc: 0,
          knockback: 60,
          projSpeed: 660,
          projSize: 6,
          color: "#9bf0a8",
          emoji: "🏹",
        },
        desc: "Swift ranged attacker with piercing arrows.",
      },
      {
        id: "mystic",
        name: "Mystic",
        role: "Spellweaver",
        hp: 88,
        speed: 225,
        color: "#7fd1c0",
        weapon: {
          id: "staff",
          name: "Sage Staff",
          shape: "staff",
          kind: "ranged",
          damage: 27,
          cooldown: 560,
          reach: 0,
          arc: 0,
          knockback: 80,
          projSpeed: 560,
          projSize: 10,
          color: "#8fd0ff",
          emoji: "🪄",
        },
        desc: "Channels heavy arcane bolts of great power.",
      },
      {
        id: "sentinel",
        name: "Sentinel",
        role: "Lancer",
        hp: 118,
        speed: 220,
        color: "#6fc77f",
        weapon: {
          id: "spear",
          name: "Elven Spear",
          shape: "spear",
          kind: "melee",
          damage: 26,
          cooldown: 430,
          reach: 126,
          arc: 0.5,
          knockback: 170,
          color: "#bff0c0",
          emoji: "🔱",
        },
        desc: "Long-reach lancer that keeps foes at a distance.",
      },
    ],
  },
  {
    id: "darkelf",
    name: "Dark Elf",
    color: "#a878ff",
    blurb: "Shadow-bound and ruthless. Masters of the night.",
    classes: [
      {
        id: "assassin",
        name: "Assassin",
        role: "Nightblade",
        hp: 90,
        speed: 250,
        color: "#a878ff",
        weapon: {
          id: "kris",
          name: "Kris Dagger",
          shape: "kris",
          kind: "melee",
          damage: 16,
          cooldown: 230,
          reach: 72,
          arc: 0.65,
          knockback: 110,
          color: "#d6a8ff",
          emoji: "🗡️",
        },
        desc: "Relentless close-quarters killer.",
      },
      {
        id: "shillien",
        name: "Shillien",
        role: "Reaper",
        hp: 112,
        speed: 215,
        color: "#8f5cf0",
        weapon: {
          id: "scythe",
          name: "Soul Scythe",
          shape: "scythe",
          kind: "melee",
          damage: 31,
          cooldown: 560,
          reach: 96,
          arc: 1.2,
          knockback: 250,
          color: "#c79bff",
          emoji: "🌙",
        },
        desc: "Wide, sweeping scythe strikes that hit everything.",
      },
      {
        id: "sorcerer",
        name: "Sorcerer",
        role: "Hexer",
        hp: 84,
        speed: 222,
        color: "#b06cff",
        weapon: {
          id: "wand",
          name: "Hex Wand",
          shape: "wand",
          kind: "ranged",
          damage: 23,
          cooldown: 450,
          reach: 0,
          arc: 0,
          knockback: 70,
          projSpeed: 610,
          projSize: 8,
          color: "#e08bff",
          emoji: "🪄",
        },
        desc: "Curses foes with fast dark missiles.",
      },
    ],
  },
  {
    id: "orc",
    name: "Orc",
    color: "#d07a3c",
    blurb: "Brutal and unbreakable. Strength above all.",
    classes: [
      {
        id: "destroyer",
        name: "Destroyer",
        role: "Berserker",
        hp: 152,
        speed: 200,
        color: "#d07a3c",
        weapon: {
          id: "axe",
          name: "Great Axe",
          shape: "axe",
          kind: "melee",
          damage: 44,
          cooldown: 780,
          reach: 88,
          arc: 1.0,
          knockback: 380,
          color: "#ff9a4d",
          emoji: "🪓",
        },
        desc: "Massive damage with a slow, deadly wind-up.",
      },
      {
        id: "monk",
        name: "Monk",
        role: "Fist of Fury",
        hp: 120,
        speed: 248,
        color: "#e08a4a",
        weapon: {
          id: "fist",
          name: "Iron Fists",
          shape: "fist",
          kind: "melee",
          damage: 12,
          cooldown: 170,
          reach: 58,
          arc: 0.75,
          knockback: 80,
          color: "#ffc06a",
          emoji: "✊",
        },
        desc: "A rapid punching combo machine.",
      },
      {
        id: "overlord",
        name: "Overlord",
        role: "Warlord",
        hp: 130,
        speed: 210,
        color: "#c96a30",
        weapon: {
          id: "totem",
          name: "War Totem",
          shape: "totem",
          kind: "ranged",
          damage: 21,
          cooldown: 700,
          reach: 0,
          arc: 0,
          knockback: 120,
          projSpeed: 480,
          projSize: 14,
          color: "#ffb347",
          emoji: "🗿",
        },
        desc: "Lobs explosive totems in a wide arc.",
      },
    ],
  },
  {
    id: "dwarf",
    name: "Dwarf",
    color: "#c9a05a",
    blurb: "Stout masters of craft and unyielding defense.",
    classes: [
      {
        id: "artisan",
        name: "Artisan",
        role: "Forgemaster",
        hp: 146,
        speed: 200,
        color: "#c9a05a",
        weapon: {
          id: "hammer",
          name: "Forge Hammer",
          shape: "hammer",
          kind: "melee",
          damage: 39,
          cooldown: 720,
          reach: 80,
          arc: 1.0,
          knockback: 320,
          color: "#ffd27a",
          emoji: "🔨",
        },
        desc: "Crushes enemies with earth-shaking blows.",
      },
      {
        id: "warsmith",
        name: "Warsmith",
        role: "Engineer",
        hp: 120,
        speed: 215,
        color: "#b98a44",
        weapon: {
          id: "crossbow",
          name: "Heavy Crossbow",
          shape: "crossbow",
          kind: "ranged",
          damage: 25,
          cooldown: 520,
          reach: 0,
          arc: 0,
          knockback: 90,
          projSpeed: 780,
          projSize: 6,
          color: "#e0b870",
          emoji: "🏹",
        },
        desc: "A high-velocity bolt sniper.",
      },
    ],
  },
  {
    id: "kamael",
    name: "Kamael",
    color: "#46c7b8",
    blurb: "Winged warriors of the East. Fierce and disciplined.",
    classes: [
      {
        id: "berserker",
        name: "Berserker",
        role: "Dualist",
        hp: 108,
        speed: 240,
        color: "#46c7b8",
        weapon: {
          id: "dualsword",
          name: "Dual Swords",
          shape: "dualsword",
          kind: "melee",
          damage: 18,
          cooldown: 260,
          reach: 74,
          arc: 0.85,
          knockback: 130,
          color: "#7ff0e0",
          emoji: "⚔️",
        },
        desc: "Twin blades whirling in a storm of steel.",
      },
      {
        id: "soulbreaker",
        name: "Soulbreaker",
        role: "Soulbinder",
        hp: 96,
        speed: 230,
        color: "#3fb0a4",
        weapon: {
          id: "soulblade",
          name: "Soul Blade",
          shape: "soulblade",
          kind: "ranged",
          damage: 29,
          cooldown: 500,
          reach: 0,
          arc: 0,
          knockback: 90,
          projSpeed: 720,
          projSize: 9,
          color: "#9ffff0",
          emoji: "🔮",
        },
        desc: "Hurls condensed soul energy at foes.",
      },
    ],
  },
];

export const ENEMY_TYPES: EnemyType[] = [
  {
    id: "goblin",
    name: "Goblin",
    color: "#6fae3f",
    accent: "#bff07a",
    hp: 26,
    speed: 96,
    damage: 8,
    radius: 13,
    score: 10,
    shape: "goblin",
  },
  {
    id: "spider",
    name: "Cave Spider",
    color: "#9b59ff",
    accent: "#d6b3ff",
    hp: 16,
    speed: 142,
    damage: 6,
    radius: 10,
    score: 12,
    shape: "spider",
  },
  {
    id: "skeleton",
    name: "Skeleton",
    color: "#d8d2c0",
    accent: "#ffffff",
    hp: 42,
    speed: 82,
    damage: 12,
    radius: 15,
    score: 18,
    shape: "skeleton",
  },
  {
    id: "orc",
    name: "Orc Raider",
    color: "#c0703a",
    accent: "#ffb27a",
    hp: 72,
    speed: 70,
    damage: 16,
    radius: 20,
    score: 28,
    shape: "orc",
  },
  {
    id: "knight",
    name: "Dark Knight",
    color: "#8a8f9c",
    accent: "#dfe4ee",
    hp: 130,
    speed: 56,
    damage: 22,
    radius: 25,
    score: 48,
    shape: "knight",
  },
  {
    id: "elemental",
    name: "Elemental",
    color: "#36c5d6",
    accent: "#aef3ff",
    hp: 54,
    speed: 64,
    damage: 14,
    radius: 16,
    score: 32,
    shape: "elemental",
  },
  {
    id: "wraith",
    name: "Wraith",
    color: "#7d8aa8",
    accent: "#dfe7ff",
    hp: 30,
    speed: 150,
    damage: 10,
    radius: 14,
    score: 22,
    shape: "wraith",
  },
  {
    id: "troll",
    name: "Cave Troll",
    color: "#6a7a44",
    accent: "#c6d29a",
    hp: 140,
    speed: 48,
    damage: 24,
    radius: 26,
    score: 40,
    shape: "troll",
  },
];

export function getRace(id: RaceId): RaceDef {
  return RACES.find((r) => r.id === id) ?? RACES[0];
}

// ---------- Skills & Magic ----------
export type SkillKind =
  | "aoe"
  | "nova"
  | "point"
  | "beam"
  | "dash"
  | "projectile"
  | "heal"
  | "buff";

export interface SkillDef {
  id: string;
  name: string;
  emoji: string;
  kind: SkillKind;
  cooldown: number; // seconds
  mana: number;
  damage?: number; // multiplier of weapon damage
  radius?: number; // world px
  range?: number; // world px (point/beam)
  count?: number; // projectiles
  spread?: number; // radians
  duration?: number; // buff/dash seconds
  buff?: "damage" | "speed" | "atkspeed" | "shield";
  amount?: number; // buff mult or heal fraction
  buffAmount?: number; // secondary buff mult (for heal+buff skills)
  slow?: number; // 0..1 (1 = freeze)
  stun?: boolean;
  desc: string;
}

export const SKILLS: Record<string, SkillDef[]> = {
  warrior: [
    { id: "whirl", name: "Whirlwind", emoji: "🌀", kind: "aoe", cooldown: 6, mana: 30, radius: 130, damage: 1.6, desc: "Spin to damage all nearby foes." },
    { id: "charge", name: "Charge", emoji: "💥", kind: "dash", cooldown: 5, mana: 25, damage: 2.2, duration: 0.18, desc: "Dash forward, crushing enemies." },
  ],
  knight: [
    { id: "bash", name: "Shield Bash", emoji: "🛡️", kind: "nova", cooldown: 7, mana: 35, radius: 130, damage: 1.3, slow: 0.5, desc: "Concussive bash that slows." },
    { id: "sanctuary", name: "Sanctuary", emoji: "✨", kind: "heal", cooldown: 12, mana: 50, amount: 0.4, duration: 3, buff: "shield", desc: "Heal and gain a temporary shield." },
  ],
  rogue: [
    { id: "shadowstep", name: "Shadowstep", emoji: "👤", kind: "dash", cooldown: 4, mana: 22, damage: 2.0, duration: 0.16, desc: "Blink to strike from the shadows." },
    { id: "fan", name: "Fan of Knives", emoji: "🔪", kind: "aoe", cooldown: 7, mana: 30, radius: 115, damage: 1.0, desc: "Burst of blades around you." },
  ],
  archer: [
    { id: "multi", name: "Multishot", emoji: "🏹", kind: "projectile", cooldown: 5, mana: 25, count: 3, spread: 0.42, damage: 1.0, desc: "Fire a spread of arrows." },
    { id: "volley", name: "Volley", emoji: "🌧️", kind: "point", cooldown: 8, mana: 35, range: 300, radius: 120, damage: 1.3, desc: "Rain arrows on a distant point." },
  ],
  mystic: [
    { id: "meteor", name: "Meteor", emoji: "☄️", kind: "point", cooldown: 8, mana: 45, range: 320, radius: 130, damage: 1.8, desc: "Call down a devastating meteor." },
    { id: "frost", name: "Frost Nova", emoji: "❄️", kind: "nova", cooldown: 7, mana: 30, radius: 150, damage: 1.0, slow: 0.6, desc: "Freeze and shatter nearby foes." },
  ],
  sentinel: [
    { id: "impale", name: "Impale", emoji: "🔱", kind: "beam", cooldown: 6, mana: 30, range: 340, damage: 1.6, desc: "Pierce a line of enemies." },
    { id: "warcry", name: "War Cry", emoji: "📣", kind: "buff", cooldown: 12, mana: 40, buff: "damage", amount: 1.4, duration: 8, desc: "Boost your damage." },
  ],
  assassin: [
    { id: "shadowstep", name: "Shadowstep", emoji: "👤", kind: "dash", cooldown: 4, mana: 20, damage: 2.2, duration: 0.16, desc: "Blink strike from darkness." },
    { id: "poison", name: "Poison Cloud", emoji: "☠️", kind: "aoe", cooldown: 8, mana: 35, radius: 120, damage: 1.2, slow: 0.4, desc: "Toxic cloud that slows." },
  ],
  shillien: [
    { id: "deathcoil", name: "Death Coil", emoji: "🌑", kind: "aoe", cooldown: 8, mana: 45, radius: 150, damage: 1.8, desc: "A massive scythe sweep." },
    { id: "siphon", name: "Siphon", emoji: "🩸", kind: "heal", cooldown: 10, mana: 40, amount: 0.3, buff: "damage", buffAmount: 1.3 as any, duration: 6, desc: "Drain life and empower strikes." },
  ],
  sorcerer: [
    { id: "chain", name: "Chain Lightning", emoji: "⚡", kind: "nova", cooldown: 6, mana: 35, radius: 160, damage: 1.4, desc: "Arc lightning to all nearby." },
    { id: "darkpulse", name: "Dark Pulse", emoji: "🌑", kind: "beam", cooldown: 7, mana: 30, range: 320, damage: 1.5, desc: "Fire a beam of dark energy." },
  ],
  destroyer: [
    { id: "earth", name: "Earthshatter", emoji: "🌋", kind: "aoe", cooldown: 9, mana: 50, radius: 150, damage: 2.0, stun: true, desc: "Stun and crush the earth." },
    { id: "enrage", name: "Enrage", emoji: "😡", kind: "buff", cooldown: 14, mana: 40, buff: "damage", amount: 1.5, duration: 8, desc: "Massively boost damage." },
  ],
  monk: [
    { id: "flurry", name: "Flurry", emoji: "🥊", kind: "buff", cooldown: 8, mana: 30, buff: "atkspeed", amount: 2.2, duration: 5, desc: "Unleash a flurry of blows." },
    { id: "chi", name: "Chi Heal", emoji: "💚", kind: "heal", cooldown: 10, mana: 40, amount: 0.35, desc: "Restore health with chi." },
  ],
  overlord: [
    { id: "warcry", name: "War Cry", emoji: "📣", kind: "buff", cooldown: 12, mana: 40, buff: "damage", amount: 1.4, duration: 8, desc: "Empower your attacks." },
    { id: "meteortotem", name: "Meteor Totem", emoji: "🗿", kind: "point", cooldown: 7, mana: 35, range: 300, radius: 120, damage: 1.4, desc: "Hurl an explosive totem." },
  ],
  artisan: [
    { id: "forge", name: "Forge Bomb", emoji: "💣", kind: "point", cooldown: 8, mana: 45, range: 240, radius: 130, damage: 2.0, desc: "Lob a devastating bomb." },
    { id: "steam", name: "Steam Shield", emoji: "💨", kind: "buff", cooldown: 12, mana: 40, buff: "shield", duration: 3, desc: "Gain a temporary shield." },
  ],
  warsmith: [
    { id: "pierce", name: "Piercing Shot", emoji: "➹", kind: "beam", cooldown: 6, mana: 30, range: 420, damage: 1.6, desc: "A piercing long-range bolt." },
    { id: "trap", name: "Trap", emoji: "🪤", kind: "point", cooldown: 7, mana: 30, range: 260, radius: 110, damage: 1.2, slow: 0.5, desc: "Set a slowing explosive trap." },
  ],
  berserker: [
    { id: "blade", name: "Blade Storm", emoji: "🌪️", kind: "aoe", cooldown: 6, mana: 30, radius: 130, damage: 1.4, desc: "Whirl twin blades wildly." },
    { id: "enrage", name: "Enrage", emoji: "😡", kind: "buff", cooldown: 12, mana: 40, buff: "damage", amount: 1.5, duration: 8, desc: "Boost damage in a frenzy." },
  ],
  soulbreaker: [
    { id: "soulrend", name: "Soul Rend", emoji: "🔮", kind: "beam", cooldown: 6, mana: 35, range: 360, damage: 1.8, desc: "Rend souls with a beam." },
    { id: "soullink", name: "Soul Link", emoji: "🔗", kind: "heal", cooldown: 10, mana: 40, amount: 0.25, buff: "damage", buffAmount: 1.3 as any, duration: 6, desc: "Heal and empower via soul link." },
  ],
};

export const CLASS_META: Record<
  string,
  { manaMax: number; manaRegen: number }
> = {
  warrior: { manaMax: 100, manaRegen: 14 },
  knight: { manaMax: 100, manaRegen: 12 },
  rogue: { manaMax: 100, manaRegen: 15 },
  archer: { manaMax: 110, manaRegen: 15 },
  mystic: { manaMax: 120, manaRegen: 16 },
  sentinel: { manaMax: 100, manaRegen: 14 },
  assassin: { manaMax: 95, manaRegen: 16 },
  shillien: { manaMax: 110, manaRegen: 15 },
  sorcerer: { manaMax: 115, manaRegen: 16 },
  destroyer: { manaMax: 110, manaRegen: 12 },
  monk: { manaMax: 110, manaRegen: 15 },
  overlord: { manaMax: 110, manaRegen: 14 },
  artisan: { manaMax: 110, manaRegen: 13 },
  warsmith: { manaMax: 110, manaRegen: 15 },
  berserker: { manaMax: 100, manaRegen: 15 },
  soulbreaker: { manaMax: 115, manaRegen: 16 },
};
