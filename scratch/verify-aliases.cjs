const fs = require('fs');
const data = fs.readFileSync('lineage-idle/data/items.js', 'utf8');

const testIds = [
  'armor_flame_gloves', 'flame_gloves',
  'armor_lightning_armor', 'lightning_armor',
  'armor_avadon_light_boots', 'avadon_light_boots',
  'imperial_staff_sa', 'weapon_imperial_staff_sa',
  'armor_blue_wolf_heavy_armor', 'blue_wolf_heavy_armor'
];

for (const id of testIds) {
  const regex = new RegExp('"' + id + '":\\s*\\{');
  const found = regex.test(data);
  console.log(id.padEnd(30) + ' => ' + (found ? 'FOUND OK' : 'MISSING!'));
}
