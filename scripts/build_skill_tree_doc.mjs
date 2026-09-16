import fs from 'fs';
import { CLASSES_ECHO } from '../lineage-idle/src/data/classes/classes_echo_defs.js';

const scrapedSkills = JSON.parse(fs.readFileSync('scraped_data_bandit/other/skills.json', 'utf8'));
const iconFiles = new Set(fs.readdirSync('public/icons'));

// Map of skill name -> icon path
const skillIconMap = new Map();
for (const s of scrapedSkills) {
  if (s.data?.name?.en && s.data?.icon) {
    const iconFile = s.data.icon.replace('/', '');
    if (iconFiles.has(iconFile)) {
      skillIconMap.set(s.data.name.en.toLowerCase().trim(), '/icons/' + iconFile);
    }
  }
}

// Fallback manual mappings for modern & key skills
const customSkillIcons = {
  'power strike': '/icons/skill0003.webp',
  'mortal blow': '/icons/skill0016.webp',
  'power shot': '/icons/skill0056.webp',
  'rush': '/icons/skill0484.webp',
  'bandage': '/icons/skill0034.webp',
  'fighter\'s will': '/icons/skill0758.webp',
  'light armor mastery': '/icons/skill0233.webp',
  'heavy armor mastery': '/icons/skill0231.webp',
  'robe mastery': '/icons/skill0234.webp',
  'hp increase': '/icons/skill0211.webp',
  'mp increase': '/icons/skill0213.webp',
  'frenzy': '/icons/skill0176.webp',
  'guts': '/icons/skill0139.webp',
  'battle roar': '/icons/skill0121.webp',
  'lionheart': '/icons/skill0287.webp',
  'spoil': '/icons/skill0254.webp',
  'sweeper': '/icons/skill0042.webp',
  'major heal': '/icons/skill1401.webp',
  'greater heal': '/icons/skill1217.webp',
  'resurrection': '/icons/skill1016.webp',
  'sonic buster': '/icons/skill0009.webp',
  'triple slash': '/icons/skill0007.webp',
  'shield stun': '/icons/skill0092.webp',
  'holy strike': '/icons/skill1027.webp',
  'wind strike': '/icons/skill1177.webp',
  'ice bolt': '/icons/skill1184.webp',
  'hydro blast': '/icons/skill1235.webp',
  'prominence': '/icons/skill1230.webp',
  'death spike': '/icons/skill1148.webp',
  'curse discord': '/icons/skill1269.webp',
  'corpse burst': '/icons/skill1157.webp',
  'vampiric claw': '/icons/skill1159.webp',
  'cunning throw: focus': '/icons/skill0019.webp',
  'cunning arrow: sense': '/icons/skill0101.webp',
  'arrow fall': '/icons/skill0024.webp',
  'ruse': '/icons/skill0484.webp',
  'force unleashed': '/icons/skill0758.webp',
  'favorable cover: saved life': '/icons/skill1401.webp',
  'mystic weapon mastery': '/icons/skill0249.webp',
  'star fall': '/icons/skill1230.webp',
  'transcendent star fall': '/icons/skill1235.webp',
  'shining touch': '/icons/skill1027.webp',
  'fantasia ring': '/icons/skill1164.webp',
  'funky star': '/icons/skill1230.webp',
  'mana flicker': '/icons/skill1050.webp',
  'mount wolf': '/icons/skill0484.webp',
  'wild assault': '/icons/skill0003.webp',
  'wild rush': '/icons/skill0484.webp',
  'burning beast': '/icons/skill0176.webp',
  'pa\'agrio flame': '/icons/skill1002.webp',
  'iaijutsu slash': '/icons/skill0003.webp',
  'maneuver': '/icons/skill0484.webp',
  'clever maneuver': '/icons/skill0016.webp',
  'battojutsu': '/icons/skill0007.webp',
  'perception: battojutsu': '/icons/skill0007.webp',
  'oni summon': '/icons/skill1126.webp',
  'rose petal strike': '/icons/skill0016.webp',
  'crimson thorns': '/icons/skill0263.webp',
  'briar vortex': '/icons/skill1164.webp',
  'queen\'s garden': '/icons/skill1269.webp',
  'werewolf transformation': '/icons/skill0176.webp',
  'double claw strike': '/icons/skill0009.webp',
  'moon\'s grace': '/icons/skill0758.webp',
  'death draw': '/icons/skill0028.webp',
  'death strike': '/icons/skill0003.webp',
  'bone prison': '/icons/skill1164.webp',
  'ultimate death knight': '/icons/skill0176.webp'
};

function getSkillIcon(sName) {
  const norm = sName.toLowerCase().trim();
  if (customSkillIcons[norm]) return customSkillIcons[norm];
  for (const [k, v] of Object.entries(customSkillIcons)) {
    if (norm.includes(k) || k.includes(norm)) return v;
  }
  if (skillIconMap.has(norm)) return skillIconMap.get(norm);
  return '/icons/skill0000.webp';
}

const classIconMap = {
  fighter: '/icons/fighter.webp',
  warrior: '/icons/warrior.webp',
  gladiator: '/icons/gladiator.webp',
  duelist: '/icons/duelist.webp',
  warlord: '/icons/warlord.webp',
  dreadnought: '/icons/dreadnought.webp',
  knight: '/icons/knight.webp',
  paladin: '/icons/paladin.webp',
  phoenixKnight: '/icons/phoenix_knight.webp',
  darkAvenger: '/icons/dark_avenger.webp',
  hellKnight: '/icons/hell_knight.webp',
  rogue: '/icons/rogue.webp',
  treasureHunter: '/icons/treasure_hunter.webp',
  adventurer: '/icons/adventurer.webp',
  hawkeye: '/icons/hawkeye.webp',
  sagittarius: '/icons/sagittarius.webp',
  mage: '/icons/mage.webp',
  wizard: '/icons/wizard.webp',
  sorcerer: '/icons/sorcerer.webp',
  archmage: '/icons/archmage.webp',
  necromancer: '/icons/necromancer.webp',
  soultaker: '/icons/soultaker.webp',
  warlock: '/icons/warlock.webp',
  arcanaLord: '/icons/arcana_lord.webp',
  cleric: '/icons/cleric.webp',
  bishop: '/icons/bishop.webp',
  cardinal: '/icons/cardinal.webp',
  prophet: '/icons/prophet.webp',
  hierophant: '/icons/hierophant.webp',
  deathPilgrim: '/icons/hell_knight.webp',
  deathBlade: '/icons/hell_knight.webp',
  deathMessenger: '/icons/hell_knight.webp',
  deathKnight: '/icons/hell_knight.webp',
  wargBase: '/icons/warlord.webp',
  wargS0: '/icons/warlord.webp',
  wargS1: '/icons/warlord.webp',
  wargS2: '/icons/warlord.webp',
  wargS3: '/icons/warlord.webp',
  warg: '/icons/warlord.webp',
  assassinS0: '/icons/assasin.webp',
  assassinS1: '/icons/assasin.webp',
  assassinS2: '/icons/abyss_walker.webp',
  assassinS3: '/icons/ghost_hunter.webp',
  elfFighter: '/icons/fighter.webp',
  elvenKnight: '/icons/elven_knight.webp',
  templeKnight: '/icons/temple_knight.webp',
  evaTemplar: '/icons/evas_templar.webp',
  swordSinger: '/icons/sword_singer.webp',
  swordMuse: '/icons/sword_muse.webp',
  elfScout: '/icons/rogue.webp',
  plainsWalker: '/icons/plain_walker.webp',
  windRider: '/icons/wind_rider.webp',
  silverRanger: '/icons/silver_ranger.webp',
  moonlightSentinel: '/icons/moonlight_sentinel.webp',
  elfMage: '/icons/mage.webp',
  elvenWizard: '/icons/elven_wizard.webp',
  spellsinger: '/icons/spellsinger.webp',
  mysticMuse: '/icons/mystic_muse.webp',
  elementalSummoner: '/icons/elemental_summoner.webp',
  elementalMaster: '/icons/elemental_master.webp',
  elfOracle: '/icons/cleric.webp',
  elfElder: '/icons/elder.webp',
  evaSaint: '/icons/evas_saint.webp',
  darkElfFighter: '/icons/fighter.webp',
  palusKnight: '/icons/palus_knight.webp',
  shillienKnight: '/icons/shillien_knight.webp',
  shillienTemplar: '/icons/shillien_templar.webp',
  bladeDancer: '/icons/blade_dancer.webp',
  spectralDancer: '/icons/spectral_dancer.webp',
  assassinDE: '/icons/assasin.webp',
  abyssWalker: '/icons/abyss_walker.webp',
  ghostHunter: '/icons/ghost_hunter.webp',
  phantomRanger: '/icons/phantom_ranger.webp',
  ghostSentinel: '/icons/ghost_sentinel.webp',
  darkElfMage: '/icons/mage.webp',
  darkWizard: '/icons/dark_wizard.webp',
  spellhowler: '/icons/spellhowler.webp',
  stormScreamer: '/icons/storm_screamer.webp',
  phantomSummoner: '/icons/phantom_summoner.webp',
  spectralMaster: '/icons/spectral_master.webp',
  shillienOracle: '/icons/cleric.webp',
  shillienElder: '/icons/shillien_elder.webp',
  shillienSaint: '/icons/shillien_saint.webp',
  bloodRoseBase: '/icons/abyss_walker.webp',
  bloodRoseS1: '/icons/abyss_walker.webp',
  bloodRoseS2: '/icons/abyss_walker.webp',
  bloodRoseS3: '/icons/abyss_walker.webp',
  bloodRose: '/icons/abyss_walker.webp',
  orcFighter: '/icons/orc_fighter.webp',
  raider: '/icons/orc_raider.webp',
  destroyer: '/icons/destroyer.webp',
  titan: '/icons/titan.webp',
  monk: '/icons/orc_monk.webp',
  tyrant: '/icons/tyrant.webp',
  grandKhavatari: '/icons/grand_khavatari.webp',
  rider: '/icons/orc_raider.webp',
  dragoon: '/icons/destroyer.webp',
  vanguardRider: '/icons/titan.webp',
  grandVanguard: '/icons/titan.webp',
  orcMage: '/icons/orc_mage.webp',
  shaman: '/icons/orc_shaman.webp',
  overlord: '/icons/overlord.webp',
  dominator: '/icons/dominator.webp',
  warcryer: '/icons/warcryer.webp',
  doomcryer: '/icons/doomcryer.webp',
  dwarfFighter: '/icons/dwarven_fighter.webp',
  scavenger: '/icons/scavenger.webp',
  bountyHunter: '/icons/bounty_hunter.webp',
  fortuneSeeker: '/icons/fortune_seeker.webp',
  artisanDwarf: '/icons/artisan.webp',
  warsmith: '/icons/warsmith.webp',
  maestro: '/icons/maestro.webp',
  shineMakerBase: '/icons/warsmith.webp',
  shineMakerS1: '/icons/warsmith.webp',
  shineMakerS2: '/icons/warsmith.webp',
  shineMakerS3: '/icons/warsmith.webp',
  shinemaker: '/icons/warsmith.webp',
  shinemakerS1: '/icons/warsmith.webp',
  shinemakerS2: '/icons/warsmith.webp',
  shinemakerS3: '/icons/warsmith.webp',
  kamaelSoldier: '/icons/fighter.webp',
  trooper: '/icons/warrior.webp',
  berserker: '/icons/gladiator.webp',
  doombringer: '/icons/duelist.webp',
  soulFinder: '/icons/rogue.webp',
  soulBreakerKamael: '/icons/abyss_walker.webp',
  soulHound: '/icons/ghost_hunter.webp',
  warder: '/icons/rogue.webp',
  soulRanger: '/icons/silver_ranger.webp',
  trickster: '/icons/phantom_ranger.webp',
  samuraiBase: '/icons/duelist.webp',
  hatamoto: '/icons/gladiator.webp',
  ronin: '/icons/duelist.webp',
  samurai: '/icons/duelist.webp',
  sylphGunner: '/icons/hawkeye.webp',
  sharpshooter: '/icons/silver_ranger.webp',
  windSniper: '/icons/phantom_ranger.webp',
  stormBlaster: '/icons/sagittarius.webp',
  highElfBase: '/icons/paladin.webp',
  divineTemplarBase: '/icons/paladin.webp',
  divineTemplarS1: '/icons/paladin.webp',
  lightTemplar: '/icons/paladin.webp',
  divineTemplarS2: '/icons/paladin.webp',
  holyTemplar: '/icons/paladin.webp',
  divineTemplarS3: '/icons/paladin.webp',
  divineTemplar: '/icons/paladin.webp',
  elementWeaverBase: '/icons/archmage.webp',
  elementWeaverS1: '/icons/archmage.webp',
  elementWeaverS2: '/icons/archmage.webp',
  elementWeaverS3: '/icons/archmage.webp',
  elementWeaver: '/icons/archmage.webp',
  marauderBase: '/icons/tyrant.webp',
  marauder: '/icons/tyrant.webp',
  ertheiaWarrior: '/icons/grand_khavatari.webp',
  eviscerator: '/icons/grand_khavatari.webp',
  sayhaMageBase: '/icons/spellsinger.webp',
  sayhaSeer: '/icons/spellsinger.webp',
  windRiderErth: '/icons/mystic_muse.webp',
  sayhaSeeker: '/icons/mystic_muse.webp'
};

function getClassIcon(cId) {
  return classIconMap[cId] || '/icons/fighter.webp';
}

function getRace(cId) {
  let curr = CLASSES_ECHO[cId];
  while (curr) {
    if (curr.race) return curr.race;
    if (!curr.parent) break;
    curr = CLASSES_ECHO[curr.parent];
  }
  return 'other';
}

// Canonical lines of 3rd classes
const finalClasses = [
  // Human Melee / Archer
  'duelist', 'dreadnought', 'phoenixKnight', 'hellKnight', 'adventurer', 'sagittarius',
  // Human Mages / Healers
  'archmage', 'soultaker', 'arcanaLord', 'cardinal', 'hierophant',
  // Human Specials
  'deathKnight', 'warg', 'assassinS3',
  // Elf Melee / Archer
  'evaTemplar', 'swordMuse', 'windRider', 'moonlightSentinel',
  // Elf Mages / Healers
  'mysticMuse', 'elementalMaster', 'evaSaint',
  // Dark Elf Melee / Archer
  'shillienTemplar', 'spectralDancer', 'ghostHunter', 'ghostSentinel',
  // Dark Elf Mages / Healers
  'stormScreamer', 'spectralMaster', 'shillienSaint', 'bloodRose',
  // Orc Melee / Mounted
  'titan', 'grandKhavatari', 'grandVanguard',
  // Orc Mages
  'dominator', 'doomcryer',
  // Dwarf
  'fortuneSeeker', 'maestro', 'shinemaker',
  // Kamael
  'doombringer', 'soulHound', 'trickster', 'samurai',
  // Sylph
  'stormBlaster',
  // High Elf
  'divineTemplar', 'elementWeaver',
  // Ertheia
  'eviscerator', 'sayhaSeeker'
];

let doc = '# 🌟 CATÁLOGO COMPLETO DE CLASSES & HABILIDADES — LINEAGE II ESSENCE (CELESTIAL DESTINY - 29/07/2026)\n\n';
doc += '> Atualizado com base no patch 3629 (Celestial Destiny) do Lineage II Essence.\n';
doc += '> Contém a árvore completa de habilidades desde o Nível 1 até a 3ª Classe, incluindo ícones oficiais, tipo, efeito e tempo de recarga.\n\n';

for (const finalId of finalClasses) {
  const s3 = CLASSES_ECHO[finalId];
  if (!s3) continue;
  const s2Id = s3.parent;
  const s2 = CLASSES_ECHO[s2Id];
  const s1Id = s2?.parent;
  const s1 = CLASSES_ECHO[s1Id];
  const s0Id = s1?.parent || s1Id; // fallback
  const s0 = CLASSES_ECHO[s0Id] || s1;

  const race = getRace(finalId);

  doc += `## ⚔️ Linhagem: ${s3.name} (${race.toUpperCase()})\n\n`;

  // Stage 0
  if (s0 && s0 !== s1) {
    doc += `### Classe Base Lvl 1-19: ${s0.name} ![Icon](${getClassIcon(s0Id)})\n`;
    doc += `* **ID:** \`${s0Id}\` | **Ícone da Classe:** \`${getClassIcon(s0Id)}\`\n`;
    doc += `* **Descrição:** ${s0.desc || 'Classe inicial'}\n`;
    doc += `    --- Skills:\n`;
    if (s0.skills && s0.skills.length > 0) {
      for (const sk of s0.skills) {
        doc += `        • **${sk.name}** ![Skill](${getSkillIcon(sk.name)}) [${sk.type || 'Ativo'}] (Recarga: \`${sk.cooldown || 'N/A'}\`) — ${sk.effect || ''} ${sk.desc ? `*(${sk.desc})*` : ''}\n`;
      }
    } else {
      doc += `        • *Nenhuma habilidade adicional registrada nesta etapa.*\n`;
    }
    doc += '\n';
  }

  // Stage 1
  if (s1) {
    doc += `### Primeira Classe lvl 20-39: ${s1.name} ![Icon](${getClassIcon(s1Id)})\n`;
    doc += `* **ID:** \`${s1Id}\` | **Ícone da Classe:** \`${getClassIcon(s1Id)}\`\n`;
    doc += `* **Descrição:** ${s1.desc || 'Primeira transferência de classe'}\n`;
    doc += `    --- Skills:\n`;
    if (s1.skills && s1.skills.length > 0) {
      for (const sk of s1.skills) {
        doc += `        • **${sk.name}** ![Skill](${getSkillIcon(sk.name)}) [${sk.type || 'Ativo'}] (Recarga: \`${sk.cooldown || 'N/A'}\`) — ${sk.effect || ''} ${sk.desc ? `*(${sk.desc})*` : ''}\n`;
      }
    } else {
      doc += `        • *Nenhuma habilidade adicional registrada nesta etapa.*\n`;
    }
    doc += '\n';
  }

  // Stage 2
  if (s2) {
    doc += `### segunda Classe lvl 40-75: ${s2.name} ![Icon](${getClassIcon(s2Id)})\n`;
    doc += `* **ID:** \`${s2Id}\` | **Ícone da Classe:** \`${getClassIcon(s2Id)}\`\n`;
    doc += `* **Descrição:** ${s2.desc || 'Segunda transferência de classe'}\n`;
    doc += `    --- Skills:\n`;
    if (s2.skills && s2.skills.length > 0) {
      for (const sk of s2.skills) {
        doc += `        • **${sk.name}** ![Skill](${getSkillIcon(sk.name)}) [${sk.type || 'Ativo'}] (Recarga: \`${sk.cooldown || 'N/A'}\`) — ${sk.effect || ''} ${sk.desc ? `*(${sk.desc})*` : ''}\n`;
      }
    } else {
      doc += `        • *Nenhuma habilidade adicional registrada nesta etapa.*\n`;
    }
    doc += '\n';
  }

  // Stage 3
  doc += `### Terceira Classe lvl 76+: ${s3.name} ![Icon](${getClassIcon(finalId)})\n`;
  doc += `* **ID:** \`${finalId}\` | **Ícone da Classe:** \`${getClassIcon(finalId)}\`\n`;
  doc += `* **Descrição:** ${s3.desc || 'Terceira transferência de classe (Ascensão Celestial)'}\n`;
  doc += `    --- Skills:\n`;
  if (s3.skills && s3.skills.length > 0) {
    for (const sk of s3.skills) {
      doc += `        • **${sk.name}** ![Skill](${getSkillIcon(sk.name)}) [${sk.type || 'Ativo'}] (Recarga: \`${sk.cooldown || 'N/A'}\`) — ${sk.effect || ''} ${sk.desc ? `*(${sk.desc})*` : ''}\n`;
    }
  } else {
    doc += `        • *Nenhuma habilidade adicional registrada nesta etapa.*\n`;
  }
  doc += '\n---\n\n';
}

fs.writeFileSync('docs/L2_ESSENCE_CELESTIAL_DESTINY_SKILL_TREE.md', doc, 'utf8');
console.log('Successfully written docs/L2_ESSENCE_CELESTIAL_DESTINY_SKILL_TREE.md');
console.log('Total document size:', doc.length, 'bytes');
console.log('Total document lines:', doc.split('\n').length);
