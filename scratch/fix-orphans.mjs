import fs from 'fs';

const iconIndexPath = './public/img/icons/icon_index.json';
const iconIndex = JSON.parse(fs.readFileSync(iconIndexPath, 'utf8'));

// Add aliases for item IDs directly in icon_index.json
iconIndex['ring_of_core'] = 'accessory_ring_of_core_i03.png';
iconIndex['earring_of_orfen'] = 'accessory_earring_of_orfen_i03.png';
iconIndex['cat_ears'] = 'accessory_cat_ear_i00.png';
iconIndex['golden_crown'] = 'accessory_crown_i00.png';
iconIndex['nightmare_shield'] = 'imgi_2_shield_shield_of_nightmare_i00.png';
iconIndex['scroll_race_class_change'] = 'exp_scroll.png';
iconIndex['iron_ore'] = 'ironore.png';

fs.writeFileSync(iconIndexPath, JSON.stringify(iconIndex, null, 2), 'utf8');
console.log('Added 7 alias keys to icon_index.json!');
