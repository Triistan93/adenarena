// ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
// ICONS ÔÇö Mapeamento de ├ìcones de Habilidades e Classes
// ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ

export const SKILL_ICONS = {
  // A├ºo & F├¡sico
  power_strike_f: "ÔÜö´©Å­ƒÆÑ",
  mortal_blow: "­ƒùí´©Å­ƒÆÑ",
  stun_attack: "­ƒÆ½",
  triple_slash: "ÔÜö´©ÅÔÜö´©ÅÔÜö´©Å",
  sonicBlasterG: "­ƒöè",
  
  // Magia & Elementos
  wind_strike: "­ƒî¬´©Å",
  energy_bolt_m: "ÔÜí­ƒö«",
  prominence: "ÔÿÇ´©Å­ƒöÑ",
  hydro_blast: "­ƒîè­ƒÆÑ",
  death_spike_n: "­ƒÆÇ­ƒª┤",
  self_heal: "­ƒÆÜ",
  
  // Passivos
  weapon_mastery_f: "­ƒùí´©Å",
  light_armor_f: "­ƒÑï",
  heavy_armor_f: "­ƒøí´©Å",
  boost_hp_f: "ÔØñ´©Å",
  weapon_mastery_m: "­ƒö«",
  robe_mast_m: "­ƒæÿ",
  boost_mana_m: "­ƒîè",
  anti_magic_m: "­ƒøí´©ÅÔ£¿",
  dual_weapon_mast: "ÔÜö´©Å",

  // Buffs
  fighter_will: "ÔÜö´©ÅÔ£¿",
  mage_will: "­ƒö«Ô£¿",
  war_cry: "­ƒô»",
  battle_roar: "­ƒô»­ƒÆÑ",
  gladiators_harmony: "ÔÜö´©ÅÔÜö´©ÅÔ£¿",
  paladins_harmony: "­ƒøí´©ÅÔ£¿",
  haste_buff: "ÔÜí",
  might_buff: "­ƒÆ¬"
};

export function getSkillIcon(skillId) {
  return SKILL_ICONS[skillId] || "Ô£ª";
}