const fs = require('fs');
const data = fs.readFileSync('lineage-idle/data/items.js', 'utf8');

// Sample a few items from different categories and verify their icon paths
const checks = [
  'tallum_blade',
  'hp_potion_s',
  'earring_of_antharas',
  'accessory_cat_ear_i00',
  'agathion_leo',
  'adena',
  'leather',
  'composition_bow',
  'full_plate_heavy_armor',
  'brigandine_armor_heavy',
  'draconic_armor',
  'ring_of_valakas',
  'talisman_baium',
  'pendant_fire_dragon',
  'spellbook_1star'
];

for (const id of checks) {
  const regex = new RegExp('"' + id + '".*?"icon":"([^"]+)"');
  const m = data.match(regex);
  if (m) {
    console.log(id.padEnd(30) + ' => ' + m[1]);
    // Verify file exists
    const fullPath = 'public/img/icons/' + m[1];
    const exists = fs.existsSync(fullPath);
    console.log('  ' + fullPath + ' ' + (exists ? '  OK' : '  MISSING!'));
  } else {
    console.log(id.padEnd(30) + ' => NOT FOUND in items.js');
  }
}

// Count totals
const iconMapMatch = data.match(/const ICON_MAP = \{([\s\S]*?)\};/);
if (iconMapMatch) {
  const entries = iconMapMatch[1].match(/"[^"]+"/g);
  console.log('\nICON_MAP entries: ' + (entries ? entries.length / 2 : 0));
}
