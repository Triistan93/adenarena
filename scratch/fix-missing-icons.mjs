import fs from 'fs';

const iconIndexRaw = fs.readFileSync('./public/img/icons/icon_index.json', 'utf8');
const iconIndex = JSON.parse(iconIndexRaw);

// Fix mappings for the 12 items
iconIndex['cloth_robe'] = 'cloth_robe.png';
iconIndex['cloth_cap'] = 'cloth_cap.png';
iconIndex['cloth_boots'] = 'cloth_boots.png';
iconIndex['cloth_gloves'] = 'cloth_gloves.png';
iconIndex['cloth_pants'] = 'cloth_pants.png';
iconIndex['ring_of_core'] = 'Jewels/GradeS/accessory_ring_of_core_i03.png';
iconIndex['earring_of_orfen'] = 'Jewels/GradeS/accessory_earring_of_orfen_i03.png';
iconIndex['cat_ears'] = 'Acessory/accessory_cat_ear_i00.png';
iconIndex['golden_crown'] = 'Acessory/accessory_crown_i00.png';
iconIndex['nightmare_shield'] = 'Armors/GradeA/imgi_2_shield_shield_of_nightmare_i00.png';
iconIndex['scroll_race_class_change'] = 'Misc/exp_scroll.png';
iconIndex['iron_ore'] = 'Materials/ironore.png';

fs.writeFileSync('./public/img/icons/icon_index.json', JSON.stringify(iconIndex, null, 2), 'utf8');
console.log('Updated icon_index.json cleanly!');
