import fs from 'node:fs';
import { CANONICAL_CLASS_REGISTRY } from '../lineage-idle/src/data/classes/CanonicalClassRegistry.js';
import { CANONICAL_CLASS_REGISTRY_V2 } from '../lineage-idle/src/data/classes/CanonicalClassRegistryV2.js';

// Analyze all 159 vs 142 by race and stage
const v1ByRace = {};
const v2ByRace = {};

for (const [id, c] of Object.entries(CANONICAL_CLASS_REGISTRY)) {
  if (!v1ByRace[c.race]) v1ByRace[c.race] = { total: 0, s0: 0, s1: 0, s2: 0, s3: 0, classes: [] };
  v1ByRace[c.race].total++;
  v1ByRace[c.race]['s' + c.stage]++;
  v1ByRace[c.race].classes.push({ id, name: c.name, stage: c.stage, lineageId: c.lineageId });
}

for (const [id, c] of Object.entries(CANONICAL_CLASS_REGISTRY_V2)) {
  // Infer race from lineage or id
  let race = 'unknown';
  if (id.startsWith('elf') || ['templeKnight', 'evaTemplar', 'swordSinger', 'swordMuse', 'plainsWalker', 'windRider', 'silverRanger', 'moonlightSentinel', 'mysticMuse', 'elementalSummoner', 'elementalMaster', 'evaSaint'].includes(id)) race = 'elf';
  else if (id.startsWith('darkElf') || id.startsWith('shillien') || ['palusKnight', 'bladeDancer', 'spectralDancer', 'abyssWalker', 'ghostHunter', 'phantomRanger', 'ghostSentinel', 'darkWizard', 'stormScreamer', 'phantomSummoner', 'spectralMaster', 'bloodRoseBase', 'bloodRoseS1', 'bloodRoseS2', 'bloodRose', 'assassinDE'].includes(id)) race = 'darkelf';
  else if (id.startsWith('orc') || ['raider', 'destroyer', 'titan', 'monk', 'tyrant', 'grandKhavatari', 'shaman', 'overlord', 'dominator', 'warcryer', 'doomcryer', 'rider', 'dragoon', 'vanguardRider', 'grandVanguard'].includes(id)) race = 'orc';
  else if (id.startsWith('dwarf') || ['scavenger', 'bountyHunter', 'fortuneSeeker', 'artisanDwarf', 'warsmith', 'maestro', 'shineMakerS1', 'shineMakerS2', 'shinemaker'].includes(id)) race = 'dwarf';
  else if (id.startsWith('kamael') || ['trooper', 'berserker', 'doombringer', 'soulFinder', 'soulBreakerKamael', 'soulHound', 'warder', 'soulRanger', 'trickster', 'inspector', 'judicator', 'samuraiBase', 'hatamoto', 'ronin', 'samurai'].includes(id)) race = 'kamael';
  else if (['sylphGunner', 'sharpshooter', 'windSniper', 'stormBlaster'].includes(id)) race = 'sylph';
  else if (['highElfBase', 'lightTemplar', 'holyTemplar', 'divineTemplar', 'elementWeaverS1', 'elementWeaverS2', 'elementWeaver'].includes(id)) race = 'highelf';
  else race = 'human';

  if (!v2ByRace[race]) v2ByRace[race] = { total: 0, s0: 0, s1: 0, s2: 0, s3: 0, classes: [] };
  v2ByRace[race].total++;
  v2ByRace[race]['s' + c.stage]++;
  v2ByRace[race].classes.push({ id, name: c.name, stage: c.stage, lineageId: c.lineageId });
}

console.log('=== RACE BREAKDOWN COMPARISON (159 vs 142) ===');
const allRaces = new Set([...Object.keys(v1ByRace), ...Object.keys(v2ByRace)]);
for (const r of allRaces) {
  const c1 = v1ByRace[r] || { total: 0, s0: 0, s1: 0, s2: 0, s3: 0 };
  const c2 = v2ByRace[r] || { total: 0, s0: 0, s1: 0, s2: 0, s3: 0 };
  const diff = c1.total - c2.total;
  console.log(`Race: ${r.padEnd(10)} | V1 (159): ${String(c1.total).padStart(2)} (s0:${c1.s0}, s1:${c1.s1}, s2:${c1.s2}, s3:${c1.s3}) | V2 (142): ${String(c2.total).padStart(2)} (s0:${c2.s0}, s1:${c2.s1}, s2:${c2.s2}, s3:${c2.s3}) | Delta: ${diff >= 0 ? '+' : ''}${diff}`);
}
