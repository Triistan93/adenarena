import fs from 'fs';
import path from 'path';

const itemsJsPath = path.join(process.cwd(), 'lineage-idle/data/items.js');
let itemsJsContent = fs.readFileSync(itemsJsPath, 'utf8');

// Strip exports and window assignments for safe evaluation in Node VM
itemsJsContent += '\n; globalThis._TEST_ALL_ITEMS = ALL_ITEMS;';

const context = {};
const fn = new Function(itemsJsContent);
fn.call(context);

const allItems = globalThis._TEST_ALL_ITEMS || {};
const items = [];

for (const [id, def] of Object.entries(allItems)) {
  if (['material', 'consumable'].includes(def.slot)) continue;
  const reqLvl = def.req?.level || (def.tier === 5 ? 76 : (def.tier === 4.5 ? 61 : (def.tier === 4 ? 52 : (def.tier === 3 ? 40 : (def.tier === 2 ? 20 : 1)))));
  items.push({ id, ...def, reqLvl });
}

// Group items by level requirement
const levelGroups = {};
for (const item of items) {
  const lvl = item.reqLvl;
  levelGroups[lvl] = levelGroups[lvl] || [];
  levelGroups[lvl].push(item);
}

const sortedLevels = Object.keys(levelGroups).map(Number).sort((a, b) => a - b);

console.log(`Total equipamentos catalogados no jogo: ${items.length}\n`);

for (const lvl of sortedLevels) {
  const list = levelGroups[lvl];
  const gradeName = lvl >= 76 ? 'S-Grade (Nível 76+)' : (lvl >= 61 ? 'A-Grade (Nível 61-75)' : (lvl >= 52 ? 'B-Grade (Nível 52-60)' : (lvl >= 40 ? 'C-Grade (Nível 40-51)' : (lvl >= 20 ? 'D-Grade (Nível 20-39)' : 'No-Grade (Nível 1-19)'))));
  console.log(`\n==============================================`);
  console.log(`🛡️ ${gradeName} — ${list.length} Equipamentos`);
  console.log(`==============================================`);
  list.sort((a, b) => a.slot.localeCompare(b.slot) || a.name.localeCompare(b.name));
  list.forEach(i => {
    let statInfo = '';
    if (i.atk) statInfo += `Atk +${i.atk} `;
    if (i.matk) statInfo += `M.Atk +${i.matk} `;
    if (i.def) statInfo += `Def +${i.def} `;
    if (i.mdef) statInfo += `M.Def +${i.mdef} `;
    if (i.crit) statInfo += `Crit +${i.crit}% `;
    if (i.eva) statInfo += `Eva +${i.eva} `;
    if (i.speed) statInfo += `Speed +${i.speed} `;
    if (i.hp) statInfo += `HP +${i.hp} `;
    if (i.mp) statInfo += `MP +${i.mp} `;

    console.log(`• [${i.slot.toUpperCase()}] ${i.name} — ${statInfo.trim() || 'Especial'}`);
  });
}
