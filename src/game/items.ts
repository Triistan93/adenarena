// ========================================
// Aden Arena — Itemization / loot module
// Equipment drops that bend the numbers:
// damage %, move speed %, flat HP, cooldown
// reduction, crit chance and lifesteal.
// ========================================

export type ItemSlot = "armor" | "trinket" | "boots";
export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export const RARITY_COLOR: Record<Rarity, string> = {
  common: "#b9c2cf",
  uncommon: "#4fd07a",
  rare: "#4aa8ff",
  epic: "#c08bff",
  legendary: "#ffb347",
};

export const RARITY_RANK: Record<Rarity, number> = {
  common: 0,
  uncommon: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
};

const RARITY_WEIGHT: Record<Rarity, number> = {
  common: 60,
  uncommon: 30,
  rare: 13,
  epic: 4.5,
  legendary: 1.2,
};

export interface ItemDef {
  id: string;
  name: string;
  slot: ItemSlot;
  rarity: Rarity;
  icon: string;
  dmgPct?: number;
  speedPct?: number;
  hp?: number;
  cdr?: number;
  crit?: number;
  lifesteal?: number;
  desc: string;
  dropWeight: number;
  minWave: number;
}

export const SLOTS: ItemSlot[] = ["armor", "trinket", "boots"];

export const ITEMS: ItemDef[] = [
  // ---------- ARMOR (chest) ----------
  { id: "padded_vest", name: "Padded Vest", slot: "armor", rarity: "common", icon: "🧥", hp: 22, desc: "Quilted layers that turn a glancing blow.", dropWeight: 3, minWave: 1 },
  { id: "studded_leather", name: "Studded Leather", slot: "armor", rarity: "uncommon", icon: "🧥", hp: 38, dmgPct: 3, desc: "Hardened hide, ringed with iron studs.", dropWeight: 3, minWave: 3 },
  { id: "chainmail", name: "Chainmail", slot: "armor", rarity: "rare", icon: "🛡", hp: 64, dmgPct: 6, desc: "Thousands of interlocked rings.", dropWeight: 2, minWave: 6 },
  { id: "berserker_girdle", name: "Berserker Girdle", slot: "armor", rarity: "rare", icon: "🛡", dmgPct: 12, crit: 5, desc: "Binds the rage to the ribs.", dropWeight: 2, minWave: 10 },
  { id: "plate_of_valor", name: "Plate of Valor", slot: "armor", rarity: "epic", icon: "🛡", hp: 105, dmgPct: 10, desc: "Forged for those who hold the line.", dropWeight: 1.5, minWave: 12 },
  { id: "aegis_of_aden", name: "Aegis of Aden", slot: "armor", rarity: "legendary", icon: "🛡", hp: 185, dmgPct: 15, cdr: 5, desc: "The kingdom's last word in steel.", dropWeight: 1, minWave: 22 },

  // ---------- BOOTS ----------
  { id: "worn_sandals", name: "Worn Sandals", slot: "boots", rarity: "common", icon: "👡", speedPct: 4, desc: "Barely held together by hope.", dropWeight: 3, minWave: 1 },
  { id: "leather_boots", name: "Leather Boots", slot: "boots", rarity: "uncommon", icon: "🥾", speedPct: 7, hp: 12, desc: "Broken in over a hundred roads.", dropWeight: 3, minWave: 3 },
  { id: "swiftstride", name: "Swiftstride", slot: "boots", rarity: "rare", icon: "🥾", speedPct: 11, hp: 22, desc: "The ground seems to hurry past.", dropWeight: 2, minWave: 7 },
  { id: "monk_wrap", name: "Monk's Wraps", slot: "boots", rarity: "rare", icon: "🥾", speedPct: 8, cdr: 8, desc: "Silent steps, quicker hands.", dropWeight: 2, minWave: 10 },
  { id: "windrunner", name: "Windrunner", slot: "boots", rarity: "epic", icon: "👢", speedPct: 16, hp: 44, desc: "Woven from the breath of storms.", dropWeight: 1.5, minWave: 14 },
  { id: "titan_greaves", name: "Titan Greaves", slot: "boots", rarity: "epic", icon: "👢", hp: 120, dmgPct: 5, desc: "Each step cracks the flagstones.", dropWeight: 1.5, minWave: 18 },
  { id: "hermes_greaves", name: "Hermes Greaves", slot: "boots", rarity: "legendary", icon: "👢", speedPct: 22, cdr: 5, hp: 60, desc: "Winged at the heel, blessed by thieves.", dropWeight: 1, minWave: 24 },

  // ---------- TRINKETS ----------
  { id: "copper_band", name: "Copper Band", slot: "trinket", rarity: "common", icon: "💍", crit: 3, desc: "A lucky ring, green at the edges.", dropWeight: 3, minWave: 1 },
  { id: "wolf_fang_charm", name: "Wolf-Fang Charm", slot: "trinket", rarity: "uncommon", icon: "📿", crit: 6, dmgPct: 3, desc: "Still warm from the kill.", dropWeight: 3, minWave: 3 },
  { id: "scholars_mark", name: "Scholar's Mark", slot: "trinket", rarity: "uncommon", icon: "📿", cdr: 10, hp: 20, desc: "A seal that quickens the mind.", dropWeight: 2.5, minWave: 5 },
  { id: "ruby_pendant", name: "Ruby Pendant", slot: "trinket", rarity: "rare", icon: "📿", crit: 9, dmgPct: 6, lifesteal: 3, desc: "Pulses like a second heart.", dropWeight: 2, minWave: 8 },
  { id: "vampire_seal", name: "Vampire Seal", slot: "trinket", rarity: "epic", icon: "💍", crit: 12, lifesteal: 8, dmgPct: 8, desc: "It drinks, and so do you.", dropWeight: 1.5, minWave: 15 },
  { id: "seer_orb", name: "Seer's Orb", slot: "trinket", rarity: "epic", icon: "🔮", cdr: 12, crit: 10, desc: "You finish the spell before you start it.", dropWeight: 1.5, minWave: 18 },
  { id: "soul_gem", name: "Soul Gem", slot: "trinket", rarity: "legendary", icon: "💎", crit: 16, lifesteal: 12, dmgPct: 12, cdr: 8, desc: "A captured star, hungry for more.", dropWeight: 1, minWave: 26 },
];

export const ITEM_BY_ID: Record<string, ItemDef> = (() => {
  const m: Record<string, ItemDef> = {};
  for (const it of ITEMS) m[it.id] = it;
  return m;
})();

// Roll a drop for a kill. Bosses are guaranteed loot; everyone else
// scales gently with wave depth, and rarity leans upward as you climb.
export function rollItemDrop(wave: number, boss: boolean): ItemDef | null {
  const chance = boss ? 1 : Math.min(0.05 + wave * 0.0045, 0.24);
  if (Math.random() > chance) return null;
  const pool = ITEMS.filter((i) => i.minWave <= Math.max(1, wave));
  if (!pool.length) return null;
  const boost = 1 + wave * 0.012;
  let total = 0;
  const ws = pool.map((i) => {
    let w = RARITY_WEIGHT[i.rarity] * i.dropWeight;
    if (i.rarity === "epic" || i.rarity === "legendary") w *= boost;
    total += w;
    return w;
  });
  let r = Math.random() * total;
  for (let i = 0; i < pool.length; i++) {
    r -= ws[i];
    if (r <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}
