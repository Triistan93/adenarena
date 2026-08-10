// ═══════════════════════════════════════════
// ICONS — Mapeamento de Ícones de Habilidades e Classes
// ═══════════════════════════════════════════

export const SKILL_ICONS = {
  // Aço & Físico
  power_strike_f: "⚔️💥",
  mortal_blow: "🗡️💥",
  stun_attack: "💫",
  triple_slash: "⚔️⚔️⚔️",
  sonicBlasterG: "🔊",
  
  // Magia & Elementos
  wind_strike: "🌪️",
  energy_bolt_m: "⚡🔮",
  prominence: "☀️🔥",
  hydro_blast: "🌊💥",
  death_spike_n: "💀🦴",
  self_heal: "💚",
  
  // Passivos
  weapon_mastery_f: "🗡️",
  light_armor_f: "🥋",
  heavy_armor_f: "🛡️",
  boost_hp_f: "❤️",
  weapon_mastery_m: "🔮",
  robe_mast_m: "👘",
  boost_mana_m: "🌊",
  anti_magic_m: "🛡️✨",
  dual_weapon_mast: "⚔️",

  // Buffs
  fighter_will: "⚔️✨",
  mage_will: "🔮✨",
  war_cry: "📯",
  battle_roar: "📯💥",
  gladiators_harmony: "⚔️⚔️✨",
  paladins_harmony: "🛡️✨",
  haste_buff: "⚡",
  might_buff: "💪"
};

export function getSkillIcon(skillId) {
  return SKILL_ICONS[skillId] || "✦";
}
