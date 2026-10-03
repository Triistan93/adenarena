import { classPortraitAliases } from '../src/idle/portraitAliases.js';
import CLASS_PORTRAITS_BY_RACE from '../src/idle/generatedClassPortraits.json' with { type: 'json' };

// ================================================================
// Aden / Lineage Idle — Visual Art Module v4 (Full Masterwork Edition)
// Painted High-Definition illustrations for heroes, classes and monsters.
// Supports 36 class variants (M/F) and 119 authentic monster artworks.
// ================================================================

const HERO_IMG = {
  // --- Human Classes (M / F) ---
  human_fighter: "/img/m_human_fighter.webp",
  human_fighter_m: "/img/m_human_fighter.webp",
  human_fighter_f: "/img/f_human_fighter.webp",
  human_warrior: "/img/m_human_warrior.webp",
  human_warrior_m: "/img/m_human_warrior.webp",
  human_warrior_f: "/img/f_human_warrior.webp",
  human_knight: "/img/m_human_knight.webp",
  human_knight_m: "/img/m_human_knight.webp",
  human_knight_f: "/img/f_human_knight.webp",
  human_rogue: "/img/m_human_rogue.webp",
  human_rogue_m: "/img/m_human_rogue.webp",
  human_rogue_f: "/img/f_human_rogue.webp",
  human_gladiator: "/img/m_human_gladiator.webp",
  human_gladiator_m: "/img/m_human_gladiator.webp",
  human_gladiator_f: "/img/f_human_gladiator.webp",
  human_warlord: "/img/m_human_warlord.webp",
  human_warlord_m: "/img/m_human_warlord.webp",
  human_warlord_f: "/img/f_human_warlord.webp",
  human_paladin: "/img/m_human_paladin.webp",
  human_paladin_m: "/img/m_human_paladin.webp",
  human_paladin_f: "/img/f_human_paladin.webp",
  human_darkavenger: "/img/m_human_dark_avenger.webp",
  human_darkavenger_m: "/img/m_human_dark_avenger.webp",
  human_darkavenger_f: "/img/f_human_dark_avenger.webp",
  human_dark_avenger: "/img/m_human_dark_avenger.webp",
  human_dark_avenger_m: "/img/m_human_dark_avenger.webp",
  human_dark_avenger_f: "/img/f_human_dark_avenger.webp",
  human_treasurehunter: "/img/m_human_treasure_hunter.webp",
  human_treasurehunter_m: "/img/m_human_treasure_hunter.webp",
  human_treasurehunter_f: "/img/f_human_treasure_hunter.webp",
  human_treasure_hunter: "/img/m_human_treasure_hunter.webp",
  human_treasure_hunter_m: "/img/m_human_treasure_hunter.webp",
  human_treasure_hunter_f: "/img/f_human_treasure_hunter.webp",
  human_hawkeye: "/img/m_human_hawkeye.webp",
  human_hawkeye_m: "/img/m_human_hawkeye.webp",
  human_hawkeye_f: "/img/f_human_hawkeye.webp",

  // Human 3rd Job / Awakened
  human_duelist: "/img/m_human_duelist.webp",
  human_duelist_m: "/img/m_human_duelist.webp",
  human_duelist_f: "/img/f_human_duelist.webp",
  human_dreadnought: "/img/m_human_dreadnought.webp",
  human_dreadnought_m: "/img/m_human_dreadnought.webp",
  human_dreadnought_f: "/img/f_human_dreadnought.webp",
  human_phoenix_knight: "/img/m_human_phoenix_knight.webp",
  human_phoenix_knight_m: "/img/m_human_phoenix_knight.webp",
  human_phoenix_knight_f: "/img/f_human_phoenix_knight.webp",
  human_phoenixknight: "/img/m_human_phoenix_knight.webp",
  human_hell_knight: "/img/m_human_hell_knight.webp",
  human_hell_knight_m: "/img/m_human_hell_knight.webp",
  human_hell_knight_f: "/img/f_human_hell_knight.webp",
  human_hellknight: "/img/m_human_hell_knight.webp",
  human_adventurer: "/img/m_human_adventurer.webp",
  human_adventurer_m: "/img/m_human_adventurer.webp",
  human_adventurer_f: "/img/f_human_adventurer.webp",
  human_sagittarius: "/img/m_human_sagittarius.webp",
  human_sagittarius_m: "/img/m_human_sagittarius.webp",
  human_sagittarius_f: "/img/f_human_sagittarius.webp",

  // Human Mages
  human_mage: "/img/m_human_mage.webp",
  human_mage_m: "/img/m_human_mage.webp",
  human_mage_f: "/img/f_human_mage.webp",
  human_mystic: "/img/m_human_mage.webp",
  human_mystic_m: "/img/m_human_mage.webp",
  human_mystic_f: "/img/f_human_mage.webp",
  human_humanmistyc: "/img/m_human_mage.webp",
  human_humanmistyc_m: "/img/m_human_mage.webp",
  human_humanmistyc_f: "/img/f_human_mage.webp",
  human_humanwizard: "/img/m_human_wizard.webp",
  human_humanwizard_m: "/img/m_human_wizard.webp",
  human_humanwizard_f: "/img/f_human_wizard.webp",
  human_wizard: "/img/m_human_wizard.webp",
  human_wizard_m: "/img/m_human_wizard.webp",
  human_wizard_f: "/img/f_human_wizard.webp",
  human_sorcerer: "/img/m_human_sorcerer.webp",
  human_sorcerer_m: "/img/m_human_sorcerer.webp",
  human_sorcerer_f: "/img/f_human_sorcerer.webp",
  human_archmage: "/img/m_human_archmage.webp",
  human_archmage_m: "/img/m_human_archmage.webp",
  human_archmage_f: "/img/f_human_archmage.webp",
  human_necromancer: "/img/m_human_necromancer.webp",
  human_necromancer_m: "/img/m_human_necromancer.webp",
  human_necromancer_f: "/img/f_human_necromancer.webp",
  human_soultaker: "/img/m_human_soultaker.webp",
  human_soultaker_m: "/img/m_human_soultaker.webp",
  human_soultaker_f: "/img/f_human_soultaker.webp",
  human_warlock: "/img/m_human_warlock.webp",
  human_warlock_m: "/img/m_human_warlock.webp",
  human_warlock_f: "/img/f_human_warlock.webp",
  human_arcana_lord: "/img/m_human_arcana_lord.webp",
  human_arcana_lord_m: "/img/m_human_arcana_lord.webp",
  human_arcana_lord_f: "/img/f_human_arcana_lord.webp",
  human_arcanalord: "/img/m_human_arcana_lord.webp",
  human_cleric: "/img/m_human_cleric.webp",
  human_cleric_m: "/img/m_human_cleric.webp",
  human_cleric_f: "/img/f_human_cleric.webp",
  human_bishop: "/img/m_human_bishop.webp",
  human_bishop_m: "/img/m_human_bishop.webp",
  human_bishop_f: "/img/f_human_bishop.webp",
  human_cardinal: "/img/m_human_cardinal.webp",
  human_cardinal_m: "/img/m_human_cardinal.webp",
  human_cardinal_f: "/img/f_human_cardinal.webp",
  human_prophet: "/img/m_human_prophet.webp",
  human_prophet_m: "/img/m_human_prophet.webp",
  human_prophet_f: "/img/f_human_prophet.webp",
  human_hierophant: "/img/m_human_hierophant.webp",
  human_hierophant_m: "/img/m_human_hierophant.webp",
  human_hierophant_f: "/img/f_human_hierophant.webp",

  human_deathpilgrim: "/img/m_human_death_knight.webp",
  human_death_knight: "/img/m_human_death_knight.webp",
  human_death_knight_m: "/img/m_human_death_knight.webp",
  human_wargbase: "/img/m_human_warg.webp",
  human_warg: "/img/m_human_warg.webp",
  human_assassinbase: "/img/m_human_assassin_s0.webp",
  human_assassins0: "/img/m_human_assassin_s0.webp",
  human_assassin: "/img/m_human_assassin_s0.webp",
  human_assassin_m: "/img/m_human_assassin_s0.webp",
  human_assassin_f: "/img/f_human_assassin_s0.webp",

  // Generic class aliases (without race prefix)
  gladiator_m: "/img/m_human_gladiator.webp",
  gladiator_f: "/img/f_human_gladiator.webp",
  gladiator: "/img/m_human_gladiator.webp",
  duelist_m: "/img/m_human_duelist.webp",
  duelist_f: "/img/f_human_duelist.webp",
  duelist: "/img/m_human_duelist.webp",
  warlord_m: "/img/m_human_warlord.webp",
  warlord_f: "/img/f_human_warlord.webp",
  warlord: "/img/m_human_warlord.webp",
  dreadnought_m: "/img/m_human_dreadnought.webp",
  dreadnought_f: "/img/f_human_dreadnought.webp",
  dreadnought: "/img/m_human_dreadnought.webp",
  paladin_m: "/img/m_human_paladin.webp",
  paladin_f: "/img/f_human_paladin.webp",
  paladin: "/img/m_human_paladin.webp",
  phoenixknight: "/img/m_human_phoenix_knight.webp",
  phoenixknight_m: "/img/m_human_phoenix_knight.webp",
  phoenixknight_f: "/img/f_human_phoenix_knight.webp",
  darkavenger_m: "/img/m_human_dark_avenger.webp",
  darkavenger_f: "/img/f_human_dark_avenger.webp",
  darkavenger: "/img/m_human_dark_avenger.webp",
  hellknight: "/img/m_human_hell_knight.webp",
  hellknight_m: "/img/m_human_hell_knight.webp",
  hellknight_f: "/img/f_human_hell_knight.webp",
  treasurehunter_m: "/img/m_human_treasure_hunter.webp",
  treasurehunter_f: "/img/f_human_treasure_hunter.webp",
  treasurehunter: "/img/m_human_treasure_hunter.webp",
  adventurer: "/img/m_human_adventurer.webp",
  adventurer_m: "/img/m_human_adventurer.webp",
  adventurer_f: "/img/f_human_adventurer.webp",
  hawkeye_m: "/img/m_human_hawkeye.webp",
  hawkeye_f: "/img/f_human_hawkeye.webp",
  hawkeye: "/img/m_human_hawkeye.webp",
  sagittarius: "/img/m_human_sagittarius.webp",
  sagittarius_m: "/img/m_human_sagittarius.webp",
  sagittarius_f: "/img/f_human_sagittarius.webp",
  sorcerer_m: "/img/m_human_sorcerer.webp",
  sorcerer_f: "/img/f_human_sorcerer.webp",
  sorcerer: "/img/m_human_sorcerer.webp",
  archmage: "/img/m_human_archmage.webp",
  archmage_m: "/img/m_human_archmage.webp",
  archmage_f: "/img/f_human_archmage.webp",
  necromancer_m: "/img/m_human_necromancer.webp",
  necromancer_f: "/img/f_human_necromancer.webp",
  necromancer: "/img/m_human_necromancer.webp",
  soultaker: "/img/m_human_soultaker.webp",
  soultaker_m: "/img/m_human_soultaker.webp",
  soultaker_f: "/img/f_human_soultaker.webp",
  warlock_m: "/img/m_human_warlock.webp",
  warlock_f: "/img/f_human_warlock.webp",
  warlock: "/img/m_human_warlock.webp",
  arcanalord: "/img/m_human_arcana_lord.webp",
  arcanalord_m: "/img/m_human_arcana_lord.webp",
  arcanalord_f: "/img/f_human_arcana_lord.webp",
  cleric_m: "/img/m_human_cleric.webp",
  cleric_f: "/img/f_human_cleric.webp",
  cleric: "/img/m_human_cleric.webp",
  bishop_m: "/img/m_human_bishop.webp",
  bishop_f: "/img/f_human_bishop.webp",
  bishop: "/img/m_human_bishop.webp",
  cardinal: "/img/m_human_cardinal.webp",
  cardinal_m: "/img/m_human_cardinal.webp",
  cardinal_f: "/img/f_human_cardinal.webp",
  prophet_m: "/img/m_human_prophet.webp",
  prophet_f: "/img/f_human_prophet.webp",
  prophet: "/img/m_human_prophet.webp",
  hierophant: "/img/m_human_hierophant.webp",
  hierophant_m: "/img/m_human_hierophant.webp",
  hierophant_f: "/img/f_human_hierophant.webp",

  // --- Elf Classes ---
  elf_fighter: "/img/m_elf_elf_fighter.webp",
  elf_fighter_m: "/img/m_elf_elf_fighter.webp",
  elf_fighter_f: "/img/f_elf_elf_scout.webp",
  elf_mage: "/img/m_elf_elf_mage.webp",
  elf_mage_m: "/img/m_elf_elf_mage.webp",
  elf_mage_f: "/img/f_elf_elf_mage.webp",
  elf_death_knight: "/img/m_elf_elf_fighter.webp",
  elf_death_knight_m: "/img/m_elf_elf_fighter.webp",
  elf_death_knight_f: "/img/f_elf_elf_scout.webp",
  elf_knight: "/img/m_elf_elf_fighter.webp",
  elf_temple_knight: "/img/m_elf_elf_fighter.webp",
  elf_evas_templar: "/img/m_elf_elf_fighter.webp",
  elf_swordsinger: "/img/m_elf_elf_fighter.webp",
  elf_sword_muse: "/img/m_elf_elf_fighter.webp",
  elf_scout: "/img/f_elf_elf_scout.webp",
  elf_plainswalker: "/img/f_elf_elf_scout.webp",
  elf_wind_rider: "/img/f_elf_elf_scout.webp",
  elf_silver_ranger: "/img/f_elf_elf_scout.webp",
  elf_moonlight_sentinel: "/img/f_elf_elf_scout.webp",
  elf_elvenknight: "/img/m_elf_elf_fighter.webp",
  elf_elvenscout: "/img/f_elf_elf_scout.webp",
  elf_elvenwizard: "/img/m_elf_elf_mage.webp",
  elf_elvenwizard_m: "/img/m_elf_elf_mage.webp",
  elf_elvenwizard_f: "/img/f_elf_elf_mage.webp",
  elf_wizard: "/img/m_elf_elf_mage.webp",
  elf_wizard_m: "/img/m_elf_elf_mage.webp",
  elf_wizard_f: "/img/f_elf_elf_mage.webp",
  elf_spellsinger: "/img/m_elf_elf_mage.webp",
  elf_mystic_muse: "/img/m_elf_elf_mage.webp",
  elf_elemental_summoner: "/img/m_elf_elf_mage.webp",
  elf_elemental_master: "/img/m_elf_elf_mage.webp",
  elf_oracle: "/img/f_elf_elf_mage.webp",
  elf_oracle_m: "/img/m_elf_elf_mage.webp",
  elf_oracle_f: "/img/f_elf_elf_mage.webp",
  elf_elder: "/img/f_elf_elf_mage.webp",
  elf_evas_saint: "/img/f_elf_elf_mage.webp",

  // --- Dark Elf Classes ---
  darkelf_fighter: "/img/darkelfskM.png",
  darkelf_fighter_m: "/img/darkelfskM.png",
  darkelf_fighter_f: "/img/darkelfskM.png",
  dark_elf_fighter: "/img/darkelfskM.png",
  dark_elf_fighter_m: "/img/darkelfskM.png",
  dark_elf_fighter_f: "/img/darkelfskM.png",
  darkelf_mage: "/img/f_darkelf_dark_elf_mage.webp",
  darkelf_mage_m: "/img/m_darkelf_dark_elf_mage.webp",
  darkelf_mage_f: "/img/f_darkelf_dark_elf_mage.webp",
  dark_elf_mage: "/img/f_darkelf_dark_elf_mage.webp",
  dark_elf_mage_m: "/img/m_darkelf_dark_elf_mage.webp",
  dark_elf_mage_f: "/img/f_darkelf_dark_elf_mage.webp",
  dark_elf_death_knight: "/img/darkelfskM.png",
  dark_elf_assassin: "/img/darkelfskM.png",
  dark_elf_blood_rose: "/img/f_darkelf_dark_elf_mage.webp",
  darkelf_palusknight: "/img/darkelfskM.png",
  dark_elf_palus_knight: "/img/darkelfskM.png",
  dark_elf_shillien_knight: "/img/darkelfskM.png",
  dark_elf_shillien_templar: "/img/darkelfskM.png",
  dark_elf_abyss_walker: "/img/darkelfskM.png",
  dark_elf_ghost_hunter: "/img/darkelfskM.png",
  dark_elf_phantom_ranger: "/img/darkelfskM.png",
  dark_elf_ghost_sentinel: "/img/darkelfskM.png",
  dark_elf_bladedancer: "/img/darkelfskM.png",
  dark_elf_spectral_dancer: "/img/darkelfskM.png",
  darkelf_darkwizard: "/img/m_darkelf_dark_elf_mage.webp",
  darkelf_darkwizard_m: "/img/m_darkelf_dark_elf_mage.webp",
  darkelf_darkwizard_f: "/img/f_darkelf_dark_elf_mage.webp",
  dark_elf_wizard: "/img/m_darkelf_dark_elf_mage.webp",
  dark_elf_spellhowler: "/img/m_darkelf_dark_elf_mage.webp",
  dark_elf_storm_screamer: "/img/m_darkelf_dark_elf_mage.webp",
  dark_elf_phantom_summoner: "/img/f_darkelf_dark_elf_mage.webp",
  dark_elf_spectral_master: "/img/f_darkelf_dark_elf_mage.webp",
  darkelf_shillienoracle: "/img/f_darkelf_dark_elf_mage.webp",
  dark_elf_shillien_oracle: "/img/f_darkelf_dark_elf_mage.webp",
  dark_elf_shillien_elder: "/img/f_darkelf_dark_elf_mage.webp",
  dark_elf_shillien_saint: "/img/f_darkelf_dark_elf_mage.webp",
  darkelf_elfdeathpilgrim: "/img/darkelfskM.png",
  darkelf_deathpilgrim: "/img/darkelfskM.png",
  darkelf_assassinbase: "/img/darkelfskM.png",
  darkelf_assassins0: "/img/darkelfskM.png",
  darkelf_bloodrosebase: "/img/f_darkelf_dark_elf_mage.webp",
  darkelf_bloodroses1: "/img/f_darkelf_dark_elf_mage.webp",
  darkelf_bloodroses2: "/img/f_darkelf_dark_elf_mage.webp",
  darkelf_bloodroses3: "/img/f_darkelf_dark_elf_mage.webp",
  darkelf_bloodrose: "/img/f_darkelf_dark_elf_mage.webp",

  // --- Orc Classes ---
  orc_fighter: "/img/orcfighterM.png",
  orc_fighter_m: "/img/orcfighterM.png",
  orc_fighter_f: "/img/orcfighterF.png",
  orc_orcraider: "/img/orcfighterM.png",
  orc_raider: "/img/orcfighterM.png",
  orc_destroyer: "/img/orcfighterM.png",
  orc_titan: "/img/orcfighterM.png",
  orc_monk: "/img/orcfighterM.png",
  orc_tyrant: "/img/orcfighterM.png",
  orc_grand_khavatari: "/img/orcfighterM.png",
  orc_rider: "/img/orcfighterM.png",
  orc_orcrider: "/img/orcfighterM.png",
  orc_vanguardrider: "/img/orcfighterM.png",
  orc_vanguard_rider: "/img/orcfighterM.png",
  orc_mage: "/img/orc_mage.png",
  orc_mage_m: "/img/orc_mage.png",
  orc_mage_f: "/img/orc_mage.png",
  orc_shaman: "/img/orc_mage.png",
  orc_overlord: "/img/orc_mage.png",
  orc_dominator: "/img/orc_mage.png",
  orc_warcryer: "/img/orc_mage.png",
  orc_doomcryer: "/img/orc_mage.png",

  // --- Dwarf Classes ---
  dwarf_artisan: "/img/dwarfmaestroM.png",
  dwarf_artisan_m: "/img/dwarfmaestroM.png",
  dwarf_artisan_f: "/img/dwarfmaestroF.png",
  dwarf_fighter: "/img/dwarfmaestroM.png",
  dwarf_shinemakerbase: "/img/dwarfmaestroF.png",
  dwarf_shinemakers1: "/img/dwarfmaestroF.png",
  dwarf_shinemakers2: "/img/dwarfmaestroF.png",
  dwarf_shinemakers3: "/img/dwarfmaestroF.png",
  dwarf_shinemaker: "/img/dwarfmaestroF.png",
  dwarf_mage: "/img/dwarfmaestroM.png",

  // --- Kamael Classes ---
  kamael_soulbreaker: "/img/kamaelshF.png",
  kamael_soulbreaker_m: "/img/m_kamael_kamael_soldier.webp",
  kamael_soulbreaker_f: "/img/kamaelshF.png",
  kamael_kamaelsoldier: "/img/m_kamael_kamael_soldier.webp",
  kamael_fighter: "/img/kamaelDM.png",
  kamael_samuraibase: "/img/kamaelDM.png",
  kamael_samuraibase_m: "/img/kamaelDM.png",
  kamael_samuraibase_f: "/img/kamaelDM.png",
  kamael_hatamoto: "/img/kamaelDM.png",
  kamael_ronin: "/img/kamaelDM.png",
  kamael_samurai: "/img/kamaelDM.png",

  // --- Sylph Classes ---
  sylph_sylphgunner: "/img/sylphM.png",
  sylph_sylphgunner_m: "/img/sylphM.png",
  sylph_sylphgunner_f: "/img/sylphF.png",
  sylph_gunner: "/img/sylphM.png",
  sylph_fighter: "/img/sylphM.png",

  // --- High Elf Classes ---
  highelf_divinetemplars1: "/img/m_elf_elf_fighter.webp",
  highelf_elementweavers1: "/img/m_elf_elf_mage.webp",
  high_elf_divine_templar: "/img/m_elf_elf_fighter.webp",
  high_elf_element_weaver: "/img/m_elf_elf_mage.webp",
  highelf_fighter: "/img/m_elf_elf_fighter.webp",
  highelf_mage: "/img/m_elf_elf_mage.webp",

  // --- Ertheia Classes ---
  ertheia_marauderbase: "/img/m_elf_elf_fighter.webp",
  ertheia_marauderbase_m: "/img/m_elf_elf_fighter.webp",
  ertheia_marauderbase_f: "/img/f_elf_elf_scout.webp",
  ertheia_marauder: "/img/m_elf_elf_fighter.webp",
  ertheia_eviscerator: "/img/f_elf_elf_scout.webp",
  ertheia_sayhamagebase: "/img/f_elf_elf_mage.webp",
  ertheia_sayhamagebase_m: "/img/m_elf_elf_mage.webp",
  ertheia_sayhamagebase_f: "/img/f_elf_elf_mage.webp",
  ertheia_sayhaseer: "/img/f_elf_elf_mage.webp",
  ertheia_sayhaseeker: "/img/f_elf_elf_mage.webp",
  ertheia_storm_blaster: "/img/f_elf_elf_mage.webp",
  ertheia_fighter: "/img/m_elf_elf_fighter.webp",
  ertheia_mage: "/img/f_elf_elf_mage.webp"
};

// Every JPG portrait currently registered above has a byte-identical copy in
// heroes_cropped. Use the registered source directly for those portraits;
// the remaining cropped variants contain distinct artwork and stay enabled.
const HERO_IDENTICAL_CROPS = new Set(
  Object.values(HERO_IMG).filter((path) => path.toLowerCase().endsWith('.jpg'))
);

// Fallback by race only
const RACE_FALLBACK = {
  human: "/img/m_human_fighter.webp",
  elf: "/img/m_elf_elf_fighter.webp",
  darkelf: "/img/darkelfskM.png",
  orc: "/img/orcfighterM.png",
  dwarf: "/img/dwarfmaestroM.png",
  kamael: "/img/kamaelDM.png",
  sylph: "/img/sylphM.png",
  highelf: "/img/m_elf_elf_fighter.webp",
  ertheia: "/img/f_elf_elf_scout.webp"
};

function resolveImg(path) {
  if (typeof window !== 'undefined' && window.__HERO_IMGS && window.__HERO_IMGS[path]) {
    return window.__HERO_IMGS[path];
  }
  return path;
}

const MAGE_CLASSES = new Set([
  'mage', 'wizard', 'mystic', 'cleric', 'sorcerer', 'archmage', 'necromancer', 'soultaker', 
  'warlock', 'arcanalord', 'arcana_lord', 'bishop', 'cardinal', 'prophet', 'hierophant',
  'elvenwizard', 'spellsinger', 'mysticmuse', 'mystic_muse', 'elementalsummoner', 'elemental_summoner', 
  'elementalmaster', 'elemental_master', 'oracle', 'elvenoracle', 'elder', 'elvenelder', 'evassaint', 'evas_saint',
  'darkwizard', 'spellhowler', 'stormscreamer', 'storm_screamer', 'phantomsummoner', 'phantom_summoner', 
  'spectralmaster', 'spectral_master', 'shillienoracle', 'shillienelder', 'shilliensaint', 'shillien_saint', 'shillien',
  'bloodrose', 'bloodroses0', 'bloodroses1', 'bloodroses2', 'bloodroses3', 'dark_elf_blood_rose',
  'orcmage', 'orc_mage', 'shaman', 'orc_shaman', 'overlord', 'dominator', 'warcryer', 'doomcryer',
  'dwarfmage', 'dwarf_mage', 'shinemaker', 'shinemakerbase', 'dwarf_shinemaker',
  'soulbreaker', 'soulbreakerkamael', 'kamael_soulbreaker',
  'sayhamagebase', 'sayhaseer', 'sayhaseeker', 'ertheia_sayhamage', 'ertheia_mage',
  'stormblaster', 'ertheia_storm_blaster',
  'elementweaver', 'elementweavers1', 'high_elf_element_weaver', 'highelf_elementweavers1', 'highelf_mage',
  'humanmistyc', 'humanwizard', 'human_mystic', 'human_wizard', 'human_sorcerer', 'human_archmage',
  'human_necromancer', 'human_soultaker', 'human_warlock', 'human_arcana_lord', 'human_cleric',
  'human_bishop', 'human_cardinal', 'human_prophet', 'human_hierophant',
  'elf_mage', 'elf_wizard', 'elf_spellsinger', 'elf_mystic_muse', 'elf_elemental_summoner',
  'elf_elemental_master', 'elf_oracle', 'elf_elder', 'elf_evas_saint',
  'dark_elf_mage', 'dark_elf_wizard', 'dark_elf_spellhowler', 'dark_elf_storm_screamer',
  'dark_elf_phantom_summoner', 'dark_elf_spectral_master', 'dark_elf_shillien_oracle',
  'dark_elf_shillien_elder', 'dark_elf_shillien_saint'
]);

function normalizeRace(race) {
  const r = String(race || 'human').toLowerCase().replace(/[\s_-]+/g, '');
  if (r.includes('dark')) return 'darkelf';
  if (r.includes('high')) return 'highelf';
  if (r.includes('orc')) return 'orc';
  if (r.includes('dwarf')) return 'dwarf';
  if (r.includes('kamael')) return 'kamael';
  if (r.includes('sylph')) return 'sylph';
  if (r.includes('ertheia')) return 'ertheia';
  if (r.includes('elf')) return 'elf';
  return 'human';
}

export function heroImgPath(race, cls, gender) {
  const r = normalizeRace(race);
  const c = String(cls || 'fighter').toLowerCase().replace(/[\s-]+/g, '_');
  const g = String(gender || 'M').toLowerCase();
  const isFemale = g === 'f';

  const registeredPortraits = typeof window !== 'undefined' ? window.__CLASS_PORTRAITS?.[r] : null;
  const portraits = registeredPortraits || CLASS_PORTRAITS_BY_RACE[r];
  let generatedPortrait = null;
  if (portraits) {
    for (const key of classPortraitAliases(r, c)) {
      const portrait = portraits[key]?.[isFemale ? 'F' : 'M'];
      if (portrait) {
        generatedPortrait = portrait;
        break;
      }
    }
  }
  if (generatedPortrait) return generatedPortrait;

  const genderKey = `${r}_${c}_${isFemale ? 'f' : 'm'}`;
  if (HERO_IMG[genderKey]) return resolveImg(HERO_IMG[genderKey]);

  const directKey = `${r}_${c}`;
  if (HERO_IMG[directKey]) return resolveImg(HERO_IMG[directKey]);

  const rawClsKey = `${c}_${isFemale ? 'f' : 'm'}`;
  if (HERO_IMG[rawClsKey]) return resolveImg(HERO_IMG[rawClsKey]);

  if (HERO_IMG[c]) return resolveImg(HERO_IMG[c]);

  const isMage = MAGE_CLASSES.has(c) || MAGE_CLASSES.has(c.replace(/^human_|^elf_|^dark_elf_|^darkelf_|^orc_|^dwarf_|^kamael_|^ertheia_|^highelf_|^high_elf_/, ''));
  const archetype = isMage ? 'mage' : 'fighter';
  const archGenderKey = `${r}_${archetype}_${isFemale ? 'f' : 'm'}`;
  if (HERO_IMG[archGenderKey]) return resolveImg(HERO_IMG[archGenderKey]);

  const archKey = `${r}_${archetype}`;
  if (HERO_IMG[archKey]) return resolveImg(HERO_IMG[archKey]);

  const fallback = RACE_FALLBACK[r] || "/img/m_human_fighter.webp";
  return resolveImg(fallback);
}

// ---- Monster image map (119 High-Definition Artworks) ----
export const MON_IMG = {
  // Talking Island
  "goblin": "/img/mon_goblin.jpg",
  "goblinThief": "/img/mon_goblinthief.jpg",
  "armoredGoblin": "/img/mon_armoredgoblin.jpg",
  "goblinMage": "/img/mon_goblinmage.jpg",
  "talkingIslandWerewolf": "/img/mon_islandwerewolfleader.jpg",
  "islandWerewolfLeader": "/img/mon_islandwerewolfleader.jpg",
  "goblinKing": "/img/bosses/goblinKing.webp",

  // Elven Forest
  "wolf": "/img/mon_wolf.jpg",
  "grayWolf": "/img/mon_graywolf.jpg",
  "rootWitch": "/img/mon_rootwitch.jpg",
  "rootWolf": "/img/mon_rootwolf.jpg",
  "greenDryad": "/img/mon_greendryad.jpg",
  "sporeFungus": "/img/mon_sporefungus.jpg",
  "kabooOrcFighter": "/img/mon_kabooorcchampion.jpg",
  "kabooOrcChampion": "/img/mon_kabooorcchampion.jpg",
  "deathTrent": "/img/bosses/deathTrent.webp",
  "deathTreant": "/img/mon_deathtreant.jpg",

  // Dark Forest
  "spider": "/img/mon_spider.jpg",
  "caveSpider": "/img/mon_spider.jpg",
  "swampWalker": "/img/mon_swampwalker.jpg",
  "swampBeast": "/img/mon_swampbeast.jpg",
  "lesserDarkHorror": "/img/mon_lesserdarkhorror.jpg",
  "marshStalker": "/img/mon_marshstalker.jpg",
  "shadowFangWolf": "/img/mon_shadownfangdirewolf.jpg",
  "shadowFangDireWolf": "/img/mon_shadownfangdirewolf.jpg",
  "darkForestMatriarch": "/img/bosses/darkForestMatriarch.webp",

  // Orc Village
  "orc": "/img/mon_orcwarrior.jpg",
  "orcWarrior": "/img/mon_orcwarrior.jpg",
  "kashaWolf": "/img/mon_kashawolf.jpg",
  "kashaBear": "/img/mon_kashabear.jpg",
  "kashaOrcArcher": "/img/mon_kashaorcarcher.jpg",
  "kashaOrcBerserker": "/img/mon_kashaorcberserker.jpg",
  "kashaOrcOverlord": "/img/bosses/kashaOrcOverlord.webp",

  // Dwarven Mine
  "kobold": "/img/mon_koboldminer.jpg",
  "koboldMiner": "/img/mon_koboldminer.jpg",
  "koboldForeman": "/img/mon_koboldforeman.jpg",
  "koboldLeader": "/img/mon_koboldforeman.jpg",
  "goblinBrigand": "/img/mon_goblinbrigand.jpg",
  "mineCaveBat": "/img/mon_mithrilcavebat.jpg",
  "mithrilCaveBat": "/img/mon_mithrilcavebat.jpg",
  "mithrilGolem": "/img/mon_mithrilgolem.jpg",
  "dwarvenEarthLord": "/img/bosses/dwarvenEarthLord.webp",
  "dwarvenMineGuardian": "/img/mon_dwarvenmineguardian.jpg",

  // Kamael Lair
  "kamaelScout": "/img/mon_kamaelscout.jpg",
  "soullessScout": "/img/mon_soullessscout.jpg",
  "spitefulGhost": "/img/mon_spitefulsoulghost.jpg",
  "spitefulSoulGhost": "/img/mon_spitefulsoulghost.jpg",
  "crimsonWarder": "/img/mon_crimsonwarder.jpg",
  "kamaelInfiltrator": "/img/mon_kamaelinfiltrator.jpg",
  "darkInquisitorKamael": "/img/bosses/darkInquisitorKamael.webp",
  "kamaelInquisitor": "/img/mon_kamaelinquisitor.jpg",

  // Ruined Outpost
  "ruinedGoblinThief": "/img/mon_ruinedgoblinthief.jpg",
  "ruinedOrc": "/img/mon_ruinedorc.jpg",
  "outpostMarksman": "/img/mon_outpostmarksman.jpg",
  "ruinedDeserter": "/img/mon_ruineddeserter.jpg",
  "shadowMercenary": "/img/mon_shadowmercenary.jpg",
  "outpostFallenCaptain": "/img/bosses/outpostFallenCaptain.webp",

  // Howling Moor
  "direWolf": "/img/mon_mountaindirewolf.jpg",
  "babyTiamat": "/img/mon_babytiamat.jpg",
  "crimsonBabyDragon": "/img/mon_crimsonbabydragon.jpg",
  "ancientSatyr": "/img/mon_ancientsatyr.jpg",
  "satyrWarlord": "/img/mon_satyrwarlord.jpg",
  "alphaWolf": "/img/bosses/alphaWolf.webp",

  // Giran Outskirts
  "skeleton": "/img/mon_skeleton.jpg",
  "skeletonArcher": "/img/mon_skeletonarcher.jpg",
  "deathRider": "/img/mon_deathrider.jpg",
  "giranGargoyle": "/img/mon_girangargoyle.jpg",
  "giranGladiator": "/img/mon_girangladiator.jpg",
  "minotaurKnight": "/img/bosses/minotaurKnight.webp",

  // Orcen Ruins
  "orcenRuinsOrc": "/img/mon_orcenruinsorc.jpg",
  "cursedWarrior": "/img/mon_cursedwarrior.jpg",
  "ruinShamanOrc": "/img/mon_ruinshamanorc.jpg",
  "tombLooterOrc": "/img/mon_tomblooterorc.jpg",
  "ancientOrcExecutioner": "/img/mon_ancientorcexecutioner.jpg",
  "orcenOverlord": "/img/bosses/orcenOverlord.webp",

  // Forsaken Crypt
  "darkMage": "/img/mon_darkmage.jpg",
  "corpseWorm": "/img/mon_corpseworm.jpg",
  "furiousSouls": "/img/mon_furioussoul.jpg",
  "furiousSoul": "/img/mon_furioussoul.jpg",
  "cryptVampire": "/img/mon_cryptvampire.jpg",
  "devilBone": "/img/mon_devilbone.jpg",
  "cryptLord": "/img/bosses/cryptLord.webp",

  // Black Citadel
  "deathKnight": "/img/mon_deathknight.jpg",
  "deathWizard": "/img/mon_deathwizard.jpg",
  "citadelDarkPriest": "/img/mon_citadeldarkpriest.jpg",
  "blackDragonWhelp": "/img/mon_blackdragonwhelp.jpg",
  "blackDragon": "/img/mon_blackdragon.jpg",
  "flamingDemonLord": "/img/bosses/flamingDemonLord.webp",

  // Gludio Castle
  "knight": "/img/mon_knight.jpg",
  "cursedKnight": "/img/mon_cursedknight.jpg",
  "mutantKnight": "/img/mon_mutantknight.jpg",
  "gludioRoyalArcher": "/img/mon_gludioroyalarcher.jpg",
  "gludioSorcerer": "/img/mon_gludiosorcerer.jpg",
  "gludioShieldMaster": "/img/mon_gludioshieldmaster.jpg",
  "gludioCommander": "/img/bosses/gludioCommander.webp",

  // Wolf Mountain
  "mountainWolf": "/img/mon_mountainwolf.jpg",
  "mountainDireWolf": "/img/mon_mountaindirewolf.jpg",
  "frostStalkerWolf": "/img/mon_froststalkerwolf.jpg",
  "mountainSnowBear": "/img/mon_mountainsnowbear.jpg",
  "frostFangBehemoth": "/img/mon_frostfangbehemoth.jpg",
  "mountainAlphaWolf": "/img/bosses/mountainAlphaWolf.webp",
  "snowWolf": "/img/mon_snowwolf.jpg",

  // Rift of the Void
  "voidCreature": "/img/mon_voidcreature.jpg",
  "voidBrute": "/img/mon_voidbrute.jpg",
  "voidStalker": "/img/mon_voidstalker.jpg",
  "beholder": "/img/mon_beholder.jpg",
  "voidArchonEntity": "/img/mon_voidarchonentity.jpg",
  "voidDragonLord": "/img/bosses/voidDragonLord.webp",

  // Emerald Grove
  "emeraldSnake": "/img/mon_emeraldsnake.jpg",
  "emeraldDrake": "/img/mon_emeralddrake.jpg",
  "jadeGolem": "/img/mon_jadegolem.jpg",
  "groveSpiritMage": "/img/mon_grovespiritmage.jpg",
  "emeraldDragon": "/img/bosses/emeraldDragon.webp",
  "ancientEmeraldDragon": "/img/mon_ancienteemeralddragon.jpg",
  "fafurion": "/img/bosses/fafurion.webp",
  "fafurionWaterSovereign": "/img/bosses/fafurion.webp",

  // Gates of the Underworld
  "blazingWerewolf": "/img/mon_blazingwerewolf.jpg",
  "swiftBlaze": "/img/mon_swiftblaze.jpg",
  "infernalHound": "/img/mon_infernalhound.jpg",
  "lavaFiend": "/img/mon_lavafiend.jpg",
  "flameOverlordDemon": "/img/mon_underworldflameoverlord.jpg",
  "underworldFlameOverlord": "/img/mon_underworldflameoverlord.jpg",
  "cerberus": "/img/bosses/cerberus.webp",

  // Valley of Saints
  "saintEye": "/img/mon_beholder.jpg",
  "saintGuardian": "/img/mon_knight.jpg",
  "splendorLight": "/img/mon_furioussoul.jpg",
  "celestialArchon": "/img/mon_darkmage.jpg",
  "divineSeraphim": "/img/mon_deathknight.jpg",
  "splendorKnight": "/img/bosses/splendorKnight.webp",

  // Swamp of Screams
  "swampStrikers": "/img/mon_swampwalker.jpg",
  "corruptedSpiders": "/img/mon_spider.jpg",
  "screamingSouls": "/img/mon_furioussoul.jpg",
  "stakatoWarrior": "/img/mon_swampwalker.jpg",
  "stakatoQueenBrood": "/img/mon_swampbeast.jpg",
  "swampAbomination": "/img/bosses/swampAbomination.webp",

  // Aden City
  "royalKnight": "/img/mon_knight.jpg",
  "highMage": "/img/mon_darkmage.jpg",
  "adenCrossbowman": "/img/mon_outpostmarksman.jpg",
  "adenPaladin": "/img/mon_knight.jpg",
  "adenHighJusticiar": "/img/mon_gludiocommander.jpg",
  "adenCommander": "/img/bosses/adenCommander.webp",

  // Dragon Valley
  "dragon": "/img/mon_blackdragon.jpg",
  "dragonKnight": "/img/mon_knight.jpg",
  "frostKnight": "/img/mon_cursedknight.jpg",
  "frostLordDragon": "/img/mon_blackdragon.jpg",
  "glakias": "/img/bosses/glakias.webp",
  "glakiasDreadful": "/img/bosses/glakias-dreadful.webp",
  "ferion": "/img/bosses/ferion.webp",
  "ferion_praetorian": "/img/bosses/ferion_praetorian.webp",
  "beleth": "/img/bosses/beleth.webp",
  "demon_prince": "/img/bosses/demon_prince.webp",
  "ranku": "/img/bosses/ranku.webp",
  "darion": "/img/bosses/darion.webp",
  "epidos": "/img/bosses/epidos.webp",
  "reggiesys": "/img/bosses/reggiesys.webp",
  "tiron": "/img/bosses/tiron.webp",
  "pailaka_fire_sprite_king": "/img/bosses/pailaka_fire_sprite_king.webp",
  "pailaka_ice_guardian": "/img/bosses/pailaka_ice_guardian.webp",
  "pailaka_gargoyle_lord": "/img/bosses/pailaka_gargoyle_lord.webp",
  "pailaka_infernal_sentinel": "/img/bosses/pailaka_infernal_sentinel.webp",
  "pailaka_corrupted_drake": "/img/bosses/pailaka_corrupted_drake.webp",
  "pailaka_lesser_drake_lord": "/img/bosses/pailaka_lesser_drake_lord.webp",
  "necro_sacrifice_boss": "/img/bosses/necro_sacrifice_boss.webp",
  "necro_pilgrim_boss": "/img/bosses/necro_pilgrim_boss.webp",
  "necro_worship_boss": "/img/bosses/necro_worship_boss.webp",
  "necro_patriot_boss": "/img/bosses/necro_patriot_boss.webp",
  "necro_ascetic_boss": "/img/bosses/necro_ascetic_boss.webp",
  "necro_martyr_boss": "/img/bosses/necro_martyr_boss.webp",
  "necro_apostle_boss": "/img/bosses/necro_apostle_boss.webp",
  "necro_disciple_boss": "/img/bosses/necro_disciple_boss.webp",
  "kamaloka_25": "/img/bosses/kamaloka_25.webp",
  "kamaloka_49": "/img/bosses/kamaloka_49.webp",
  "guarding_stone": "/img/bosses/guarding_stone.webp",
  "dragonValleyOverlord": "/img/bosses/dragonValleyOverlord.webp",
  "lindvior": "/img/bosses/lindvior.webp",

  // Imperial Tomb
  "tombGuardian": "/img/mon_deathknight.jpg",
  "sepulcherArchon": "/img/mon_darkmage.jpg",
  "undeadKnight": "/img/mon_skeleton.jpg",
  "imperialGhostMage": "/img/mon_darkmage.jpg",
  "lichLord": "/img/mon_darkmage.jpg",
  "deathKing": "/img/bosses/deathKing.webp",

  // Antharas' Lair
  "caveDrake": "/img/mon_ancienteemeralddragon.jpg",
  "magmaBeast": "/img/mon_lavafiend.jpg",
  "earthDrake": "/img/mon_ancienteemeralddragon.jpg",
  "caveWyrmBehemoth": "/img/mon_antharas.jpg",
  "antharasBehemoth": "/img/bosses/antharasBehemoth.webp",
  "antharas": "/img/bosses/antharas.webp",

  // Forge of the Gods
  "valakasMinion": "/img/mon_crimsonbabydragon.jpg",
  "lavaGolem": "/img/mon_lavafiend.jpg",
  "flameArchon": "/img/mon_underworldflameoverlord.jpg",
  "flameGiantDragon": "/img/mon_valakas.jpg",
  "vulcanLord": "/img/bosses/vulcanLord.webp",
  "valakas": "/img/bosses/valakas.webp",

  // Epic Raid Bosses
  "queenAnt": "/img/bosses/queen-ant.webp",
  "queen_ant": "/img/bosses/queen-ant.webp",
  "queen_ant_world": "/img/bosses/queen-ant.webp",
  "core": "/img/bosses/core.webp",
  "orfen": "/img/bosses/orfen.webp",
  "zaken": "/img/bosses/zaken.webp",
  "zaken_world": "/img/bosses/zaken.webp",
  "baium": "/img/bosses/baium.webp",
  "baium_world": "/img/bosses/baium.webp",
  "antharas_world": "/img/bosses/antharas.webp",
  "valakas_world": "/img/bosses/valakas.webp",
  // Tower of Insolence floor bosses (created at runtime by TowerService).
  "tower_floor_10": "/img/bosses/tower_hallate.webp",
  "tower_floor_20": "/img/bosses/tower_kernea.webp",
  "tower_floor_30": "/img/bosses/tower_varan.webp",
  "tower_floor_40": "/img/bosses/tower_kavatan.webp",
  "tower_floor_50": "/img/bosses/baium.webp",
  "tower_floor_60": "/img/bosses/tower_galaxia.webp",
  "tower_floor_70": "/img/bosses/tower_shielhead.webp",
  "tower_floor_80": "/img/bosses/tower_golkonda.webp",
  "tower_floor_90": "/img/bosses/tower_verdelet.webp",
  "tower_floor_100": "/img/bosses/tower_arcanjo.webp",
  "frintezza": "/img/bosses/frintezza.webp",
  "barakiel": "/img/mon_barakiel.webp",
  "freya": "/img/mon_freya.jpg",
  "demonKing": "/img/mon_demonking.jpg"
};

// Monsters without painted art get a tinted SVG silhouette
const MON_SVG_FALLBACK = {};

// ---- Shared map data ----
export const ZONE_COORDS = {
  talkingIsland: { x: 45, y: 205 }, elvenForest: { x: 90, y: 160 },
  darkForest: { x: 115, y: 185 }, ruinedOutpost: { x: 140, y: 150 },
  orcVillage: { x: 175, y: 35 }, 
  dwarvenMine: { x: 125, y: 25 },
  kamaelLair: { x: 80, y: 40 }, 
  howlingMoor: { x: 150, y: 120 },
  giranOutskirts: { x: 200, y: 160 }, orcenRuins: { x: 225, y: 135 },
  forsakenCrypt: { x: 250, y: 165 }, blackCitadel: { x: 275, y: 140 },
  gludioCastle: { x: 175, y: 185 }, riftOfTheVoid: { x: 290, y: 110 },
  wolfMountain: { x: 260, y: 90 }, emeraldGrove: { x: 230, y: 60 },
  underworldGate: { x: 280, y: 55 }, adenCity: { x: 310, y: 80 },
  dragonValley: { x: 335, y: 45 }
};
export const ZONE_ORDER = [
  "talkingIsland", "elvenForest", "darkForest", "ruinedOutpost", 
  "orcVillage", "dwarvenMine", "kamaelLair", "howlingMoor", 
  "giranOutskirts", "orcenRuins", "forsakenCrypt", "blackCitadel", 
  "gludioCastle", "riftOfTheVoid", "wolfMountain", "emeraldGrove", 
  "underworldGate", "adenCity", "dragonValley"
];

export const RACE_COLOR = {
  human: "#e8c39a", elf: "#f0d8b0", darkelf: "#c9b0e8",
  orc: "#9c6b3f", dwarf: "#caa06a", kamael: "#e6d8c0", ertheia: "#d8b48a",
};
export const RACE_HAIR = {
  human: "#5a3a1a", elf: "#e2d070", darkelf: "#241840",
  orc: "#151515", dwarf: "#6a2a0a", kamael: "#d8e4f0", ertheia: "#9a5a2a",
};
export const CLASS_COLOR = {
  fighter: "#b89030", mage: "#4858b8", artisan: "#a06828", soulbreaker: "#2a9a8c",
  warrior: "#c89838", archer: "#4aa060", mystic: "#5aaa98", rogue: "#b8a848",
};
export const CLASS_LIGHT = {
  fighter: "#e8c860", mage: "#8898e8", artisan: "#d8a048", soulbreaker: "#6ae0cc",
  warrior: "#f0d878", archer: "#8ae0a8", mystic: "#98e0cc", rogue: "#e0d078",
};

function getAssetUrl(p) {
  if (!p) return '';
  if (p.startsWith('http://') || p.startsWith('https://') || p.startsWith('data:')) return p;
  const cleanPath = p.replace(/^\//, '');
  let baseUrl = '';
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) {
    baseUrl = import.meta.env.BASE_URL;
  } else if (typeof window !== 'undefined' && window.__BASE_URL__) {
    baseUrl = window.__BASE_URL__;
  }
  if (baseUrl) {
    if (!baseUrl.endsWith('/')) baseUrl += '/';
    return baseUrl + cleanPath;
  }
  return '/' + cleanPath;
}

// ================================================================
//  heroSVG(race, cls, aura, mode)
// ================================================================
export function heroSVG(raceOrState, clsParam, genderParam, aura, mode) {
  let race = raceOrState;
  let cls = clsParam;
  let gender = genderParam;

  if (typeof raceOrState === 'object' && raceOrState !== null) {
    race = raceOrState.race || raceOrState.heroRace || raceOrState.playerRace || 'human';
    cls = raceOrState.class || raceOrState.heroClass || raceOrState.playerClass || 'fighter';
    gender = raceOrState.gender || raceOrState.charGender || raceOrState.sex || 'M';
    aura = raceOrState.aura;
    mode = raceOrState.mode;
  } else if (typeof genderParam === 'string' && (genderParam === 'full' || genderParam === 'bust')) {
    mode = genderParam;
    aura = null;
    gender = 'M';
  }

  race = String(race || 'human').toLowerCase();
  cls = String(cls || 'fighter').toLowerCase();
  gender = String(gender || 'M').toUpperCase();

  const src = getAssetUrl(heroImgPath(race, cls, gender));
  const border = aura || "#8a6a24";

  if (mode === "bust") {
    return `<div class="hero-svg hero-bust" style="position:relative;width:100%;height:100%;overflow:hidden;border-radius:50%;">
      <img src="${src}" alt="${race} ${cls}" draggable="false" onerror="this.onerror=null; this.src='${getAssetUrl('img/m_human_fighter.webp')}';"
        style="width:100%;height:100%;object-fit:cover;object-position:center 15%;filter:drop-shadow(0 0 6px ${border});" />
      <div style="position:absolute;inset:0;border-radius:50%;border:2px solid ${border};box-shadow:inset 0 0 20px rgba(0,0,0,0.6);pointer-events:none;"></div>
    </div>`;
  }

  if (mode === "portrait") {
    // For portrait frames, prefer the cropped artwork that eliminates side dead space
    const originalPath = heroImgPath(race, cls, gender);
    const croppedPath = originalPath.replace(/^\/img\//, '/img/heroes_cropped/');
    const portraitPath = originalPath.endsWith('.webp') || HERO_IDENTICAL_CROPS.has(originalPath)
      ? originalPath
      : croppedPath;
    const portraitSrc = getAssetUrl(portraitPath);

    return `<div class="hero-svg hero-portrait" style="position:relative;width:100%;height:100%;overflow:hidden;display:flex;align-items:flex-end;justify-content:center;">
      <img src="${portraitSrc}" alt="${race} ${cls}" draggable="false" onerror="this.onerror=null; this.src='${src}';"
        style="width:100%;height:100%;object-fit:contain;object-position:center bottom;filter:drop-shadow(0 8px 20px rgba(0,0,0,0.85)) drop-shadow(0 0 10px ${border || 'rgba(212,167,68,0.25)'});" />
    </div>`;
  }

  return `<div class="hero-svg hero-full" style="width:100%;height:100%;position:relative;">
    <img src="${src}" alt="${race} ${cls}" draggable="false" onerror="this.onerror=null; this.src='${getAssetUrl('img/m_human_fighter.webp')}';"
      style="width:100%;height:100%;object-fit:contain;object-position:center bottom;filter:drop-shadow(0 8px 16px rgba(0,0,0,0.7)) drop-shadow(0 0 4px ${border || 'transparent'});" />
  </div>`;
}

// ================================================================
//  monsterSVG(id, opts)
// ================================================================
export function monsterSVG(idOrObj, opts) {
  let safeId = idOrObj;
  let safeOpts = opts || {};

  if (typeof idOrObj === 'object' && idOrObj !== null) {
    safeId = idOrObj.id || idOrObj.monsterId || idOrObj.key || idOrObj.name || '';
    if (idOrObj.boss || idOrObj.isBoss) {
      safeOpts = { ...safeOpts, crown: true };
    }
  }

  safeId = String(safeId || '').trim();
  const baseKey = safeId.replace(/^chaos_/i, '');
  const cleanKey = safeId.replace(/\s+/g, '');
  const lowerCleanKey = cleanKey.toLowerCase();
  const isChaos = safeId.startsWith('chaos_') || safeOpts?.isChaosBoss;

  let imgSrc = MON_IMG[safeId]
    || MON_IMG[baseKey]
    || MON_IMG[cleanKey]
    || MON_IMG[lowerCleanKey]
    || MON_IMG['mon_' + lowerCleanKey]
    || MON_IMG['mon_' + baseKey.toLowerCase()]
    || (Object.entries(MON_IMG).find(([k]) => k.toLowerCase() === lowerCleanKey || k.toLowerCase() === baseKey.toLowerCase())?.[1])
    || '/img/mon_goblin.jpg';

  const crown = isChaos
    ? `<div style="position:absolute;top:-10px;left:50%;transform:translateX(-50%);font-size:24px;filter:drop-shadow(0 0 10px #ef4444);z-index:2;animation:pulse 1.5s infinite;">🔥👑🔥</div>`
    : (safeOpts?.crown
      ? `<div style="position:absolute;top:-8px;left:50%;transform:translateX(-50%);font-size:22px;filter:drop-shadow(0 0 6px #f0c840);z-index:2;">👑</div>`
      : "");

  const resolvedSrc = getAssetUrl(resolveImg(imgSrc));
  const glow = isChaos
    ? "drop-shadow(0 0 16px rgba(239,68,68,0.9)) drop-shadow(0 0 24px rgba(168,85,247,0.7))"
    : (safeOpts?.crown ? "drop-shadow(0 0 10px rgba(240,200,64,0.5))" : "drop-shadow(0 6px 12px rgba(0,0,0,0.6))");

  return `<div class="mon-svg" style="width:100%;height:100%;position:relative;">
    ${crown}
    <img src="${resolvedSrc}" alt="${safeId}" draggable="false" onerror="this.onerror=null; this.src='${getAssetUrl('img/mon_goblin.jpg')}';"
      style="width:100%;height:100%;object-fit:contain;object-position:center bottom;filter:${glow};" />
  </div>`;
}

export function mapBackdrop() {
  return `
    <image href="/img/map.png" x="0" y="0" width="360" height="240" preserveAspectRatio="none" opacity="0.9" />
    <rect width="360" height="240" fill="#1a1408" opacity="0.2" style="mix-blend-mode: multiply;" />
  `;
}
