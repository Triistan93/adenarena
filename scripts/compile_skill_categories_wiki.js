import fs from 'fs';
import { CANONICAL_SKILL_REGISTRY_V2 } from '../lineage-idle/src/data/skills/CanonicalSkillRegistryV2.js';
import { isPurgedSkill } from '../lineage-idle/src/services/SkillTagService.js';

const detailed = JSON.parse(fs.readFileSync('./scraped_data_wiki/skills_detailed.json', 'utf8'));

// Build lookup map from skills_detailed.json
const detailedMap = new Map();
for (const s of Object.values(detailed)) {
  if (s.name) {
    const key = s.name.toLowerCase().trim();
    if (!detailedMap.has(key)) detailedMap.set(key, []);
    detailedMap.get(key).push(s);
  }
}

// 4-star and 5-star Master / Heroic skills in Lineage 2 Essence:
const FOUR_STAR_PATTERNS = [
  /legendary archer/i,
  /overwhelming power/i,
  /leopold/i,
  /meteor/i,
  /cacophony of war/i,
  /titan champion/i,
  /ultimate death knight/i,
  /death lord/i,
  /time distortion/i,
  /shelter/i,
  /condemnation/i,
  /holy circle/i,
  /sephiroth/i,
  /dragon strike/i,
  /exclusion/i,
  /dark disruption/i,
  /pa'agrio's touch/i,
  /touch of pa'agrio/i,
  /team building/i,
  /ancient power/i,
  /amadeus/i,
  /prime master/i,
  /fortune time/i,
  /indestructible blade/i,
  /final secret: dual weapons/i,
  /challenger/i,
  /phoenix shield/i,
  /phoenix protection/i,
  /tower shield/i,
  /arcane shield/i,
  /faery shield/i,
  /resonance shield/i,
  /storm screamer's shield/i,
  /archmage's shield/i,
  /enuma elish/i,
  /through strike/i,
  /light discharge/i,
  /spear rumble/i,
  /spear cage/i,
  /spear howl/i,
  /hell scream/i,
  /^hell$/i,
  /dark knight's break/i,
  /supernova/i,
  /destructive shriek/i,
  /demolition formula/i,
  /titans' secrets/i,
  /final secret: grand khavatari/i,
  /burning assault/i,
  /blazing strike/i,
  /fury blade/i,
  /mortal piercing/i,
  /critical assault/i,
  /clone dance/i,
  /shadow blast/i,
  /constraint/i,
  /seclusion/i,
  /soul prison/i,
  /riot/i,
  /winter frostbite/i,
  /over the rainbow/i,
  /excess charge/i,
  /force unleashed/i,
  /sensation/i,
  /tranquility/i,
  /eventide/i,
  /improved sleep/i,
  /miracle/i,
  /dance of medusa/i,
  /song of silence/i,
  /buff thief/i,
  /divine whisper/i,
  /glorious warrior/i,
  /flamenco/i,
  /vivace/i,
  /cantabile/i,
  /wild beat/i,
  /queen's garden/i,
  /rose thorns/i,
  /blooming nightmare/i,
  /flame arrow rain/i,
  /incendiary shot/i,
  /spiral shot/i,
  /vortex shot/i,
  /deadly shooter/i,
  /lightning storm/i,
  /hellfire/i,
  /flame explosion/i,
  /fire spiral/i,
  /void explosion/i,
  /dark spiral/i,
  /thunder explosion/i,
  /wind spiral/i,
  /blazing tempest/i,
  /glacier strike/i,
  /claidheamh soluis/i,
  /wipeout/i,
  /roar of death/i,
  /summon cat emperor/i,
  /summon cubic of secrets/i,
  /summon lord raise/i,
  /summon elemental globe/i,
  /giant's stomp/i,
  /wild growl/i,
  /wild rush/i,
  /earth tremor/i,
  /hammer rumble/i,
  /mechanical masterpiece/i,
  /crushing leap/i,
  /golden stone/i,
  /transcendent blade throw/i
];

// Extract passives from classes_echo_defs.js
const echoText = fs.readFileSync('./lineage-idle/src/data/classes/classes_echo_defs.js', 'utf8');
const echoPassives = new Map();
const echoRegex = /{\s*name:\s*["']([^"']+)["'],\s*type:\s*["']Passivo["'][^}]*}/g;
let em;
while ((em = echoRegex.exec(echoText)) !== null) {
  const nameMatch = em[0].match(/name:\s*["']([^"']+)["']/);
  const effectMatch = em[0].match(/effect:\s*["']([^"']+)["']/);
  const descMatch = em[0].match(/desc:\s*["']([^"']+)["']/);
  if (nameMatch) {
    const name = nameMatch[1];
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    if (!isPurgedSkill(slug)) {
      echoPassives.set(name, {
        name,
        effect: effectMatch ? effectMatch[1] : '',
        desc: descMatch ? descMatch[1] : ''
      });
    }
  }
}

// Build consolidated universe
const allSkills = new Map();

for (const [id, s] of Object.entries(CANONICAL_SKILL_REGISTRY_V2)) {
  if (s.disabled || isPurgedSkill(id)) continue;
  const key = s.name.toLowerCase().trim();
  allSkills.set(key, {
    id: s.id,
    name: s.name.trim(),
    type: s.type,
    starRank: s.starRank || 1,
    desc: s.desc || '',
    effect: s.canonicalEffect || '',
    classes: s.classes || []
  });
}

for (const [pName, pDef] of echoPassives.entries()) {
  const key = pName.toLowerCase().trim();
  if (!allSkills.has(key)) {
    allSkills.set(key, {
      id: key.replace(/[^a-z0-9]+/g, '_'),
      name: pName,
      type: 'passive',
      starRank: 1,
      desc: pDef.desc,
      effect: pDef.effect,
      classes: []
    });
  } else {
    allSkills.get(key).isEchoPassive = true;
  }
}

// Explicit Ultimate categorizations for consistency
const ULT_UTIL = new Set([
  'exclusion', 'dark disruption', "pa'agrio's touch", 'team building', 'miracle',
  'tower shield', 'arcane shield', 'dance of medusa', 'song of silence', 'hell scream',
  'buff thief', 'divine whisper', 'sensation', 'tranquility', 'eventide', 'improved sleep',
  'mass vitalize', 'constraint', 'seclusion', 'soul prison', 'riot', 'decoy',
  'summon cat emperor', 'summon cubic of secrets', 'summon lord raise', 'summon elemental globe',
  'roar of death'
].map(s => s.toLowerCase()));

const ULT_BUFF = new Set([
  'legendary archer', 'legendary archer: master', 'overwhelming power', 'overwhelming power: master',
  'cacophony of war', 'cacophony of war: master', 'titan champion', 'titan champion: master',
  'ultimate death knight', 'ultimate death knight: master', 'death lord', 'challenger', 'challenger: master',
  'final secret: dual weapons', 'final secret: grand khavatari', 'phoenix shield', 'phoenix protection',
  'shelter', 'shelter: master', 'ancient power', 'ancient power: master', 'amadeus', 'flamenco', 'vivace',
  'cantabile', 'prime master', 'prime master: master', 'fortune time', 'excess charge', 'excess charge: master',
  'force unleashed', 'faery shield', 'resonance shield', 'storm screamer\'s shield', 'archmage\'s shield',
  'mechanical masterpiece', 'titans\' secrets', 'pa\'agrio\'s glory', 'chant of glory', 'queen\'s garden',
  'glorious warrior: enhanced abilities', 'glorious warrior\'s ability lv. 1', 'glorious warrior\'s ability lv. 2',
  'glorious warrior\'s ability lv. 3', 'tough body: dual weapons', 'gleaming blade', 'resolve to kill'
].map(s => s.toLowerCase()));

function classifySkill(s) {
  const name = s.name.trim();
  const key = name.toLowerCase();
  const wikiEntries = detailedMap.get(key) || [];
  const primaryWiki = wikiEntries[0] || {};
  
  const allCats = new Set();
  wikiEntries.forEach(w => (w.categories || []).forEach(c => allCats.add(c)));

  const desc = (primaryWiki.description || s.desc || s.effect || '').toLowerCase();
  const dur = (primaryWiki.duration || '').toLowerCase();
  const star = s.starRank || 1;

  // 1. Ultimate Determination (4★ and 5★ apex skills)
  const isUlt = (star >= 4 || FOUR_STAR_PATTERNS.some(p => p.test(name))) && !/body of the hell knight|hell knight spirit/i.test(name);

  // 2. Passive Determination
  const isPassive = !isUlt && (s.isEchoPassive || s.type === 'passive' || allCats.has('Other Skills - Passive') ||
    /mastery|boost hp|boost mp|boost mana|hp increase|mp increase|anti magic|magic resistance|training|vital force|critical power|weight limit|sharpness|fast spell|fast hp|fast mp|quick step|agility|spellcraft|iron will|toughness|guidance|shadow sense|acrobatic|mental shield|final frenzy|clear movements|^body of |spirit$|wolf reflexes|tough skin|bone armor|dark thorn shield|expand|master of healing/i.test(name) ||
    (/recovers .* every .* sec/i.test(desc) && /hp recovery|mp recovery/i.test(name)));

  let mainCat = 'ativas';
  if (isUlt) mainCat = 'ultimates';
  else if (isPassive) mainCat = 'passivas';

  // 3. Sub-Category Determination (Ataque, Buff, Utilidades)
  // Recovery / Heal
  const isRecovery = allCats.has('Recovery Skills') || /heal|bandage|recovery|restoration|resurrection|sacrifice|purify|remedy|\bcure\b|salvation|sanctuary|recharge|invigor|eva's blessing/i.test(name) || /recovers hp|restores hp|\bcura\b|\brecupera hp\b/i.test(desc);
  
  // Vampiric / Drain
  const isVamp = /vampir|drain|siphon|blood|leech|drena/i.test(name) || /absorbs .* damage as hp/i.test(desc);
  
  // CC / Debuff
  const isCCDebuff = allCats.has('Debuff/ Anomaly skill') || /stun|shackle|entangle|slow|silence|fear|sleep|root|paralyz|curse|poison|bleed|provoke|aggression|howl|hate|chain strike|disarm|knockback|hex|power break|decay|horror|anchor|spoil|sweeper|corpse burst|medusa|stigma|frostbite|freeze|knockdown|song of silence|improved sleep|winter shackles/i.test(name) || /immobilizes|stuns the|provokes the|decreases enemy|reduces target|petrifies/i.test(desc);

  // Summoning (Pets & Decoys)
  const isSummonOrDecoy = /decoy/i.test(name) || (allCats.has('Summoning Skills') && !/servitor share|servitor wind walk|warrior servitor|assassin servitor|mighty servitor|golem reinforcement|strengthen golem|cubic/i.test(name));

  // Shields, Mobility & Teleports
  const isShieldMobility = /ultimate defense|shelter|barrier|shield deflect|deflect magic|rush|dash|blink|teleport|shadow step|protection|ability to protect|change armor|phoenix protection|arcane shield|tower shield|rush impact|hide|peace|repose|requiem|return|party return|way back/i.test(name) || (allCats.has('Other Skills - Active') && !/acumen|haste|berserker|wind walk|barrier/i.test(name));

  // Cleanses
  const isCleanse = /cleanse|cancel|dispel|break duress|remove debuff/i.test(name);

  // Buff / Self-enhancement
  const hasLongDuration = /min\./i.test(dur) || dur.includes('20 min') || dur.includes('5 min') || dur.includes('1 min') || dur.includes('30 sec') || dur.includes('20 sec');
  const isExplicitBuff = allCats.has('Buffs') || hasLongDuration || /buff|song|dance|aura|warcry|roar|haste|acumen|berserker|might|focus|frenzy|guts|majesty|spirit|blessing|harmony|armor of|battle shield|shield|body|empower|prophecy|chant|rhythm|whisper|guidance|thrill fight|fortune time|snipe|full moon's grace|young moon's grace|moon's grace|secret notes|cacophony of war|servitor|crusader|enchanted rose|ability to attack|ability to protect|elemental spirit|elemental connection|lord knight|destiny|zealot|lionheart|legendary archer|overwhelming power|titan champion|death lord|challenger/i.test(name);

  // Direct Attacks
  const isDirectAttack = allCats.has('Physical Skills') || allCats.has('Magic Skills') || desc.includes('attacks the target') || desc.includes('deals damage') || desc.includes('deals m. damage') || desc.includes('deals p. damage') || desc.includes('power ') || /strike|blow|slash|shot|blast|burst|smash|thrust|punishment|meteor|leopold|condemnation|sephiroth|dragon strike|enuma elish|through strike|light discharge|holy circle/i.test(name);

  let subCat = 'ataque';

  if (isUlt) {
    // ULTIMATE SUB-CATEGORIZATION
    if (ULT_UTIL.has(key) || (/heal|cure|sleep|silence|medusa|purify|resurrection|barrier|shield|decoy|summon/i.test(key) && !ULT_BUFF.has(key))) {
      subCat = 'utilidades';
    } else if (ULT_BUFF.has(key) || (!/strike|slash|shot|blast|burst|smash|thrust|punishment|meteor|leopold|condemnation|sephiroth|dragon strike|enuma elish|through strike|light discharge|holy circle|sweep|rumble|cage|howl|break|explosion|spiral|tempest|stomp|growl|tremor|leap/i.test(key) && (s.type === 'buff' || allCats.has('Buffs')))) {
      subCat = 'buff';
    } else {
      subCat = 'ataque';
    }
  } else if (isPassive) {
    // PASSIVE SUB-CATEGORIZATION
    const isAtkMastery = /(sword|blunt|weapon|dagger|bow|polearm|dual|fist|staff|magic|blade|thorn|arrow|shot|axe|spear|attack|gun|katana|lance|rapier|warg|fighter).*mastery|mastery.*(sword|blunt|weapon|dagger|bow|polearm|dual|fist|staff|magic|gun|katana|lance|rapier|warg)|critical|frenzy|sharpness|combat|penetration|blade of the duelist|master of magic|master of dark magic|master of combat|elemental mastery|spell mastery|soul mastery|dp mastery|bp mastery/i.test(name);
    const isDefUtil = /(armor|heavy|light|robe|shield|sigil|defense).*mastery|mastery.*(armor|heavy|light|robe|shield|sigil)|anti magic|magic resistance|resistance|recovery|weight limit|resist|protection of|tough skin|toughness|bone armor|deflect arrow|wolf reflexes|evasion|expand|master of healing/i.test(name);

    if (isAtkMastery && !isDefUtil) {
      subCat = 'ataque';
    } else if (isDefUtil) {
      subCat = 'utilidades';
    } else {
      subCat = 'buff';
    }
  } else {
    // ACTIVE SUB-CATEGORIZATION
    if (/assassin servitor|secret notes|full moon's grace|young moon's grace/i.test(name)) {
      subCat = 'buff';
    } else if (/decoy|way back/i.test(name)) {
      subCat = 'utilidades';
    } else if (isExplicitBuff && !desc.includes('attacks the target with') && !allCats.has('Physical Skills') && !allCats.has('Magic Skills')) {
      subCat = 'buff';
    } else if (isRecovery || isVamp || isCCDebuff || isSummonOrDecoy || isCleanse || isShieldMobility) {
      subCat = 'utilidades';
    } else if (allCats.has('Buffs') && !allCats.has('Physical Skills') && !allCats.has('Magic Skills')) {
      subCat = 'buff';
    } else if (isDirectAttack) {
      subCat = 'ataque';
    } else if (isExplicitBuff) {
      subCat = 'buff';
    } else {
      subCat = 'ataque';
    }
  }

  return { mainCat, subCat, name, star, id: s.id };
}

const categorized = {
  'ativas_ataque': [],
  'ativas_buff': [],
  'ativas_utilidades': [],
  'passivas_ataque': [],
  'passivas_buff': [],
  'passivas_utilidades': [],
  'ultimates_ataque': [],
  'ultimates_buff': [],
  'ultimates_utilidades': []
};

for (const s of allSkills.values()) {
  const c = classifySkill(s);
  const key = c.mainCat + '_' + c.subCat;
  categorized[key].push(c.name);
}

for (const k of Object.keys(categorized)) {
  categorized[k] = Array.from(new Set(categorized[k])).sort((a, b) => a.localeCompare(b));
}

console.log('FINAL AUTHORITATIVE 9-CATEGORY COUNTS:');
const titles = {
  'ativas_ataque': '⚔️ Ativas — Ataque',
  'ativas_buff': '✨ Ativas — Buff',
  'ativas_utilidades': '🛡️ Ativas — Utilidades (Cura, Vampirismo, Controle, Debuff)',
  'passivas_ataque': '⚔️ Passivas — Ataque (Maestrias de Armas, Crítico, Poder)',
  'passivas_buff': '✨ Passivas — Buff (Auras e Atributos Passivos)',
  'passivas_utilidades': '🛡️ Passivas — Utilidades (Maestrias de Armadura, Defesa, Regen, Resistências)',
  'ultimates_ataque': '👑 Ultimates — Ataque (4★ & 5★ Master / Apex Damage Skills)',
  'ultimates_buff': '👑 Ultimates — Buff (4★ & 5★ Master / Transformation / Stance Buffs)',
  'ultimates_utilidades': '👑 Ultimates — Utilidades (4★ & 5★ Cura Suprema, Imunidade, Controle)'
};

for (const [k, title] of Object.entries(titles)) {
  console.log(`${title}: ${categorized[k].length}`);
}

let report = '# ⚔️ Catálogo Canônico de Habilidades Classificado (Lineage II Essence — 9 Categorias Canônicas)\n\n';
report += `Total de habilidades únicas consolidadas: **${allSkills.size}**\n\n`;
report += `> **Metodologia de Classificação:**\n`;
report += `> 1. **Ultimates (4★ & 5★)**: Habilidades de pico obtidas via **Spellbook 4★**, **Spellbook: [Skill]: Master** e **Heroic/Legendary Spellbook Coupons** no Lineage II Essence (ex: *Legendary Archer*, *Overwhelming Power*, *Cacophony of War*, *Meteor*, *Leopold*, *Indestructible Blade*, *Titan Champion*, *Ultimate Death Knight*, etc.).\n`;
report += `> 2. **Ativas**: Habilidades de combate ativas (1★ a 3★) separadas com base em efeitos reais em Ataque direto, Buffs de auto-aprimoramento e Utilidades (Cura, Vampirismo, Crowd Control, Debuffs e Invocações).\n`;
report += `> 3. **Passivas**: Habilidades passivas separadas em Ataque (Maestrias ofensivas, Crítico, Poder de Ataque), Buff (Auras e atributos passivos contínuos) e Utilidades (Maestrias defensivas de armaduras/escudo, Resistências e Regeneração).\n\n`;
report += `---\n\n`;

for (const [k, title] of Object.entries(titles)) {
  const list = categorized[k];
  report += `## ${title} (${list.length})\n\n`;
  list.forEach(name => {
    report += `- ${name}\n`;
  });
  report += '\n---\n\n';
}

fs.writeFileSync('docs/SKILL_CATEGORIZATION_MANIFEST.md', report, 'utf8');
fs.copyFileSync('docs/SKILL_CATEGORIZATION_MANIFEST.md', 'C:/Users/duuha/Downloads/SKILL_CATEGORIZATION_MANIFEST.md');

console.log('Updated docs/SKILL_CATEGORIZATION_MANIFEST.md and exported to C:/Users/duuha/Downloads/SKILL_CATEGORIZATION_MANIFEST.md');
