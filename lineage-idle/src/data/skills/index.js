// Auto-generated skills index
export const ALL_LOADED_SKILLS = new Map();

import human_assassinData from './human/human_assassin.json' with { type: 'json' };
import human_death_knightData from './human/human_death_knight.json' with { type: 'json' };
import human_fighterData from './human/human_fighter.json' with { type: 'json' };
import human_sorcererData from './human/human_sorcerer.json' with { type: 'json' };
import human_wargData from './human/human_warg.json' with { type: 'json' };
import elf_death_knightData from './elf/elf_death_knight.json' with { type: 'json' };
import elf_fighterData from './elf/elf_fighter.json' with { type: 'json' };
import elf_mageData from './elf/elf_mage.json' with { type: 'json' };
import dark_elf_assassinData from './dark_elf/dark_elf_assassin.json' with { type: 'json' };
import dark_elf_blood_roseData from './dark_elf/dark_elf_blood_rose.json' with { type: 'json' };
import dark_elf_death_knightData from './dark_elf/dark_elf_death_knight.json' with { type: 'json' };
import dark_elf_fighterData from './dark_elf/dark_elf_fighter.json' with { type: 'json' };
import dark_elf_mageData from './dark_elf/dark_elf_mage.json' with { type: 'json' };
import orc_fighterData from './orc/orc_fighter.json' with { type: 'json' };
import orc_shamanData from './orc/orc_shaman.json' with { type: 'json' };
import orc_vanguard_riderData from './orc/orc_vanguard_rider.json' with { type: 'json' };
import dwarf_artisanData from './dwarf/dwarf_artisan.json' with { type: 'json' };
import dwarf_mageData from './dwarf/dwarf_mage.json' with { type: 'json' };
import dwarf_shinemakerData from './dwarf/dwarf_shinemaker.json' with { type: 'json' };
import kamael_samuraiData from './kamael/kamael_samurai.json' with { type: 'json' };
import kamael_soulbreakerData from './kamael/kamael_soulbreaker.json' with { type: 'json' };
import ertheia_marauderData from './ertheia/ertheia_marauder.json' with { type: 'json' };
import ertheia_storm_blasterData from './ertheia/ertheia_storm_blaster.json' with { type: 'json' };
import high_elf_divine_templarData from './high_elf/high_elf_divine_templar.json' with { type: 'json' };
import high_elf_element_weaverData from './high_elf/high_elf_element_weaver.json' with { type: 'json' };
import sharedData from './shared/general-skills.json' with { type: 'json' };

const allSources = [
  ...human_assassinData.skills,
  ...human_death_knightData.skills,
  ...human_fighterData.skills,
  ...human_sorcererData.skills,
  ...human_wargData.skills,
  ...elf_death_knightData.skills,
  ...elf_fighterData.skills,
  ...elf_mageData.skills,
  ...dark_elf_assassinData.skills,
  ...dark_elf_blood_roseData.skills,
  ...dark_elf_death_knightData.skills,
  ...dark_elf_fighterData.skills,
  ...dark_elf_mageData.skills,
  ...orc_fighterData.skills,
  ...orc_shamanData.skills,
  ...orc_vanguard_riderData.skills,
  ...dwarf_artisanData.skills,
  ...dwarf_mageData.skills,
  ...dwarf_shinemakerData.skills,
  ...kamael_samuraiData.skills,
  ...kamael_soulbreakerData.skills,
  ...ertheia_marauderData.skills,
  ...ertheia_storm_blasterData.skills,
  ...high_elf_divine_templarData.skills,
  ...high_elf_element_weaverData.skills,
  ...sharedData.skills
];

for (const s of allSources) {
  ALL_LOADED_SKILLS.set(s.identity.id, s);
}
export default ALL_LOADED_SKILLS;