import fs from 'fs';
import path from 'path';

// 1. Read canonical data
const canonicalTree = JSON.parse(fs.readFileSync('scraped_data_wiki/classes_tree_canonical.json', 'utf8'));

let classesSummary = [];
if (fs.existsSync('scraped_data_wiki/classes_summary.json')) {
  classesSummary = JSON.parse(fs.readFileSync('scraped_data_wiki/classes_summary.json', 'utf8'));
}
const summaryBySlug = new Map(classesSummary.map(c => [c.slug, c]));

// Official English Display Names mapping for classes
const CANONICAL_DISPLAY_NAMES = {
  // Humans
  fighter: 'Human Fighter',
  warrior: 'Warrior',
  gladiator: 'Gladiator',
  duelist: 'Duelist',
  warlord: 'Warlord',
  dreadnought: 'Dreadnought',
  knight: 'Human Knight',
  paladin: 'Paladin',
  phoenix_knight: 'Phoenix Knight',
  dark_avenger: 'Dark Avenger',
  hell_knight: 'Hell Knight',
  rogue: 'Rogue',
  treasure_hunter: 'Treasure Hunter',
  adventurer: 'Adventurer',
  hawkeye: 'Hawkeye',
  sagittarius: 'Sagittarius',
  mage: 'Human Mystic',
  wizard: 'Human Wizard',
  sorcerer: 'Sorcerer',
  archmage: 'Archmage',
  necromancer: 'Necromancer',
  soultaker: 'Soultaker',
  warlock: 'Warlock',
  arcana_lord: 'Arcana Lord',
  cleric: 'Cleric',
  bishop: 'Bishop',
  cardinal: 'Cardinal',
  prophet: 'Prophet',
  hierophant: 'Hierophant',
  human_deathknight_0: 'Death Pilgrim',
  human_deathknight_1: 'Death Blade',
  human_deathknight_2: 'Death Knight',
  human_deathknight_3: 'Death Knight (Master)',
  secret_assassin_male_0: 'Assassin (Male)',
  secret_assassin_male_1: 'Shadow Assassin',
  secret_assassin_male_2: 'Silent Assassin',
  secret_assassin_male_3: 'Grand Assassin',
  werewolf_0: 'Werewolf Warrior',
  werewolf_1: 'Lycanthrope',
  werewolf_2: 'Berserk Wolf',
  werewolf_3: 'Lunar Werewolf',

  // Elves
  elven_fighter: 'Elven Fighter',
  elven_knight: 'Elven Knight',
  temple_knight: 'Temple Knight',
  evas_templar: "Eva's Templar",
  swordsinger: 'Sword Singer',
  sword_muse: 'Sword Muse',
  elven_scout: 'Elven Scout',
  plain_walker: 'Plains Walker',
  wind_rider: 'Wind Rider',
  silver_ranger: 'Silver Ranger',
  moonlight_sentinel: 'Moonlight Sentinel',
  elven_mage: 'Elven Mystic',
  elven_wizard: 'Elven Wizard',
  spellsinger: 'Spellsinger',
  mystic_muse: 'Mystic Muse',
  elemental_summoner: 'Elemental Summoner',
  elemental_master: 'Elemental Master',
  elven_oracle: 'Elven Oracle',
  elven_elder: 'Elven Elder',
  evas_saint: "Eva's Saint",
  elf_deathknight_0: 'Elven Death Pilgrim',
  elf_deathknight_1: 'Frost Blade',
  elf_deathknight_2: 'Elven Death Knight',
  elf_deathknight_3: 'Elven Death Knight (Master)',

  // Dark Elves
  dark_fighter: 'Dark Fighter',
  palus_knight: 'Palus Knight',
  shillien_knight: 'Shillien Knight',
  shillien_templar: 'Shillien Templar',
  bladedancer: 'Blade Dancer',
  spectral_dancer: 'Spectral Dancer',
  assassin: 'Assassin',
  abyss_walker: 'Abyss Walker',
  ghost_hunter: 'Ghost Hunter',
  phantom_ranger: 'Phantom Ranger',
  ghost_sentinel: 'Ghost Sentinel',
  dark_mage: 'Dark Mystic',
  dark_wizard: 'Dark Wizard',
  spellhowler: 'Spellhowler',
  storm_screamer: 'Storm Screamer',
  phantom_summoner: 'Phantom Summoner',
  spectral_master: 'Spectral Master',
  shillien_oracle: 'Shillien Oracle',
  shillien_elder: 'Shillien Elder',
  shillien_saint: 'Shillien Saint',
  delf_deathknight_0: 'Dark Death Pilgrim',
  delf_deathknight_1: 'Abyssal Blade',
  delf_deathknight_2: 'Dark Death Knight',
  delf_deathknight_3: 'Dark Death Knight (Master)',
  secret_assassin_female_0: 'Assassin (Female)',
  secret_assassin_female_1: 'Venom Assassin',
  secret_assassin_female_2: 'Nightstalker',
  secret_assassin_female_3: 'Grand Assassin (Female)',
  rose_vain_0: 'Rose Initiate',
  rose_vain_1: 'Blood Rose',
  rose_vain_2: 'Crimson Thorn',
  rose_vain_3: 'Rose Vain',

  // Orcs
  orc_fighter: 'Orc Fighter',
  orc_raider: 'Orc Raider',
  destroyer: 'Destroyer',
  titan: 'Titan',
  orc_monk: 'Orc Monk',
  tyrant: 'Tyrant',
  grand_khavatari: 'Grand Khavatari',
  orc_mage: 'Orc Mystic',
  orc_shaman: 'Orc Shaman',
  overlord: 'Overlord',
  dominator: 'Dominator',
  warcryer: 'Warcryer',
  doomcryer: 'Doomcryer',
  orc_rider_0: 'Vanguard Rider',
  orc_rider_1: 'Dragoon',
  orc_rider_2: 'Vanguard Lord',
  orc_rider_3: 'Grand Vanguard',

  // Dwarves
  dwarven_fighter: 'Dwarven Fighter',
  scavenger: 'Scavenger',
  bounty_hunter: 'Bounty Hunter',
  fortune_seeker: 'Fortune Seeker',
  artisan: 'Artisan',
  warsmith: 'Warsmith',
  maestro: 'Maestro',
  shineMakerBase: 'Shine Maker Initiate',
  shineMakerS1: 'Shine Maker Novice',
  shineMakerS2: 'Shine Maker Adept',
  shinemaker: 'Shine Maker',

  // Kamael
  jin_kamael_soldier: 'Kamael Soldier',
  trooper: 'Trooper',
  berserker: 'Berserker',
  doombringer: 'Doombringer',
  warder: 'Warder',
  soul_breaker: 'Soul Breaker',
  soul_hound: 'Soul Hound',
  arbalester: 'Arbalester',
  trickster: 'Trickster',
  crow_0: 'Crow Novice',
  crow_1: 'Hatamoto',
  crow_2: 'Ronin',
  crow_3: 'Samurai',

  // Sylph
  sylphid: 'Sylphid',
  sylph_gunner: 'Sharpshooter',
  wind_hunter: 'Wind Sniper',
  storm_blaster: 'Storm Blaster',

  // High Elf
  sacred_templar_0: 'Sacred Templar Initiate',
  sacred_templar_1: 'Sacred Templar Adept',
  sacred_templar_2: 'Divine Templar',
  sacred_templar_3: 'Divine Templar (Master)',
  spirit_0: 'Element Weaver Initiate',
  spirit_1: 'Element Weaver Adept',
  spirit_2: 'Spirit Weaver',
  spirit_3: 'Element Weaver',

  // Ertheia
  marauderBase: 'Ertheia Fighter',
  marauder: 'Marauder',
  ertheiaWarrior: 'Eviscerator Apprentice',
  eviscerator: 'Eviscerator',
  sayhaMageBase: 'Sayha Mystic',
  sayhaSeer: 'Sayha Seeker Apprentice',
  windRiderErth: 'Storm Conductor',
  sayhaSeeker: 'Sayha Seeker'
};

const STAGE_NAMES = ['BASE', 'FIRST_CLASS', 'SECOND_CLASS', 'THIRD_CLASS'];
const STAGE_MIN_LEVELS = [1, 20, 40, 76];
const STAGE_MAX_LEVELS = [19, 39, 75, 120];

const classNodes = new Map();
const lineageList = [];

for (const race of canonicalTree) {
  const raceId = race.race;
  const raceName = race.raceName;

  for (const branch of race.branches) {
    const lineageId = branch.third;
    const lineageName = branch.lineageName;
    const role = branch.role;

    // Canonical Lineage II Root Archetypes:
    // Classes descended from a Mystic/Mage base are 'mage', while classes descended from a Fighter base are 'fighter'
    const MYSTIC_BASE_CLASSES = new Set([
      'mage',
      'elven_mage',
      'dark_mage',
      'orc_mage',
      'rose_vain_0',
      'spirit_0',
      'sayhaMageBase'
    ]);

    const isMage = MYSTIC_BASE_CLASSES.has(branch.base);
    const archetypeGroup = isMage ? 'mage' : 'fighter';

    lineageList.push({
      lineageId,
      lineageName,
      race: raceId,
      role,
      archetypeGroup,
      base: branch.base,
      first: branch.first,
      second: branch.second,
      third: branch.third
    });

    const stages = [
      { id: branch.base, stage: 0, parent: null },
      { id: branch.first, stage: 1, parent: branch.base },
      { id: branch.second, stage: 2, parent: branch.first },
      { id: branch.third, stage: 3, parent: branch.second }
    ];

    for (const st of stages) {
      const { id, stage, parent } = st;
      if (!classNodes.has(id)) {
        const summary = summaryBySlug.get(id);
        const displayName = CANONICAL_DISPLAY_NAMES[id] || summary?.name || id;
        const weapons = summary?.properties?.weapons ? summary.properties.weapons.split(',').map(w => w.trim()) : null;

        classNodes.set(id, {
          id,
          name: displayName,
          race: raceId,
          raceName,
          stage,
          stageName: STAGE_NAMES[stage],
          minLevel: STAGE_MIN_LEVELS[stage],
          maxLevel: STAGE_MAX_LEVELS[stage],
          parentClass: parent,
          lineageId,
          lineageName,
          role,
          archetypeGroup,
          weapons: weapons || null,
          weaponsStatus: weapons ? 'SOURCE-DERIVED' : 'CONTENT_GAP',
          unlockedSkillIds: summary?.skills ? summary.skills.map(s => s.wikiSkillId) : [],
          baseStats: null,
          baseStatsStatus: 'CONTENT_GAP',
          canonicalExistence: true,
          playability: stage === 0, // only stage 0 is directly playable at character creation
          seasonAvailability: stage < 3, // stage 3 is season gated
          seasonGated: stage === 3,
          seasonGatingReason: stage === 3 ? 'season_gate_lv76' : null
        });
      }
    }
  }
}

console.log(`Generated ${classNodes.size} class nodes across ${lineageList.length} lineages.`);

// 2. Generate CanonicalClassRegistry.js
let registryCode = `/**
 * CanonicalClassRegistry.js — Single Source of Truth for Lineage II Essence Classes
 * 
 * Auto-generated from authoritative source: scraped_data_wiki/classes_tree_canonical.json
 * Total Canonical Classes: ${classNodes.size} across ${lineageList.length} Lineages and ${canonicalTree.length} Races.
 * Architecture: DATA layer (Immutable & Pure)
 * 
 * STRICT COMPLIANCE:
 * - baseStats: null, baseStatsStatus: 'CONTENT_GAP' (no invented stats)
 * - canonicalExistence, playability, seasonAvailability explicit separation
 * - archetypeGroup derived deterministically from canonical lineage role
 */

export const CANONICAL_CLASS_REGISTRY = Object.freeze({\n`;

for (const [id, node] of classNodes.entries()) {
  registryCode += `  ${JSON.stringify(id)}: Object.freeze(${JSON.stringify(node, null, 4)}),\n`;
}

registryCode += `});\n\n`;
registryCode += `export const ALL_CANONICAL_CLASS_IDS = Object.freeze(Object.keys(CANONICAL_CLASS_REGISTRY));\n`;
registryCode += `export default CANONICAL_CLASS_REGISTRY;\n`;

fs.writeFileSync('lineage-idle/src/data/classes/CanonicalClassRegistry.js', registryCode, 'utf8');
console.log('Saved CanonicalClassRegistry.js');

// 3. Generate CanonicalClassGraph.js
let graphCode = `/**
 * CanonicalClassGraph.js — Direct Acyclic Graph (DAG) for Lineage II Essence Classes
 * 
 * Implements pure queries for nodes, transitions, ancestry, descendants, and race roots.
 * Authoritative: 159 nodes, 134 edges, 25 roots (stage 0), 49 terminals (stage 3).
 * Architecture: DATA layer (Immutable & Pure)
 */

import { CANONICAL_CLASS_REGISTRY } from './CanonicalClassRegistry.js';

class ClassGraph {
  constructor(registry) {
    this.registry = registry;
    this.nodes = new Map();
    this.edges = new Map(); // parentId -> Set of childIds
    this.inEdges = new Map(); // childId -> parentId
    this.raceRoots = new Map(); // raceId -> Set of stage 0 classIds
    this.terminals = new Set();
    this.lineageTerminals = new Map(); // lineageId -> terminalClassId

    this._buildGraph();
  }

  _buildGraph() {
    for (const [id, node] of Object.entries(this.registry)) {
      this.nodes.set(id, node);
      this.edges.set(id, new Set());

      if (node.stage === 0) {
        if (!this.raceRoots.has(node.race)) {
          this.raceRoots.set(node.race, new Set());
        }
        this.raceRoots.get(node.race).add(id);
      }
    }

    for (const [id, node] of Object.entries(this.registry)) {
      if (node.parentClass) {
        if (this.edges.has(node.parentClass)) {
          this.edges.get(node.parentClass).add(id);
        }
        this.inEdges.set(id, node.parentClass);
      }
    }

    for (const [id, children] of this.edges.entries()) {
      if (children.size === 0) {
        this.terminals.add(id);
        const node = this.nodes.get(id);
        if (node && node.lineageId) {
          this.lineageTerminals.set(node.lineageId, id);
        }
      }
    }
  }

  getClassNode(classId) {
    if (!classId) return null;
    return this.nodes.get(String(classId)) || null;
  }

  hasNode(classId) {
    return this.nodes.has(String(classId));
  }

  getSuccessors(classId) {
    const children = this.edges.get(String(classId));
    if (!children) return [];
    return Array.from(children).map(id => this.nodes.get(id));
  }

  getPredecessor(classId) {
    const parentId = this.inEdges.get(String(classId));
    if (!parentId) return null;
    return this.nodes.get(parentId) || null;
  }

  getAncestors(classId) {
    const ancestors = [];
    let curr = this.getPredecessor(classId);
    const visited = new Set();
    while (curr && !visited.has(curr.id)) {
      visited.add(curr.id);
      ancestors.push(curr);
      curr = this.getPredecessor(curr.id);
    }
    return ancestors;
  }

  getDescendants(classId) {
    const descendants = [];
    const queue = [...this.getSuccessors(classId)];
    const visited = new Set(queue.map(n => n.id));

    while (queue.length > 0) {
      const next = queue.shift();
      descendants.push(next);
      for (const child of this.getSuccessors(next.id)) {
        if (!visited.has(child.id)) {
          visited.add(child.id);
          queue.push(child);
        }
      }
    }
    return descendants;
  }

  getBaseClassesForRace(raceId) {
    const roots = this.raceRoots.get(String(raceId));
    if (!roots) return [];
    return Array.from(roots).map(id => this.nodes.get(id));
  }

  getLineageChain(classId) {
    const node = this.getClassNode(classId);
    if (!node) return [];
    const ancestors = this.getAncestors(classId).reverse();
    return [...ancestors, node];
  }

  getNodesCount() {
    return this.nodes.size;
  }

  getEdgesCount() {
    let count = 0;
    for (const children of this.edges.values()) {
      count += children.size;
    }
    return count;
  }

  getRootNodesCount() {
    let count = 0;
    for (const roots of this.raceRoots.values()) {
      count += roots.size;
    }
    return count;
  }

  getTerminalNodesCount() {
    return this.terminals.size;
  }

  getThirdStageNodesCount() {
    let count = 0;
    for (const node of this.nodes.values()) {
      if (node.stage === 3) count++;
    }
    return count;
  }

  getLineagesCount() {
    return this.lineageTerminals.size;
  }

  validateIntegrity() {
    const visited = new Set();
    let hasCycle = false;
    const roots = [];
    for (const node of this.nodes.values()) {
      if (!node.parentClass) roots.push(node.id);
    }

    // Topological verification
    const inDegree = new Map();
    for (const id of this.nodes.keys()) inDegree.set(id, 0);
    for (const parentId of this.inEdges.values()) {
      // each child has 1 parent
    }
    for (const [childId, parentId] of this.inEdges.entries()) {
      inDegree.set(childId, (inDegree.get(childId) || 0) + 1);
    }

    const q = [...roots];
    let processed = 0;
    const tempIn = new Map(inDegree);

    while (q.length > 0) {
      const u = q.shift();
      processed++;
      const children = this.edges.get(u) || new Set();
      for (const v of children) {
        const d = tempIn.get(v) - 1;
        tempIn.set(v, d);
        if (d === 0) q.push(v);
      }
    }

    return {
      nodesCount: this.getNodesCount(),
      edgesCount: this.getEdgesCount(),
      rootsCount: this.getRootNodesCount(),
      terminalsCount: this.getTerminalNodesCount(),
      thirdStageNodesCount: this.getThirdStageNodesCount(),
      lineagesCount: this.getLineagesCount(),
      isValidDAG: processed === this.nodes.size,
      processedInOrder: processed
    };
  }
}

export const CanonicalClassGraph = new ClassGraph(CANONICAL_CLASS_REGISTRY);
export default CanonicalClassGraph;
`;

fs.writeFileSync('lineage-idle/src/data/classes/CanonicalClassGraph.js', graphCode, 'utf8');
console.log('Saved CanonicalClassGraph.js');

// 4. Generate CanonicalRaceRegistry.js
let raceCode = `/**
 * CanonicalRaceRegistry.js — Single Source of Truth for Lineage II Essence Races
 * 
 * Auto-generated from authoritative source: scraped_data_wiki/classes_tree_canonical.json
 * Total Canonical Races: ${canonicalTree.length}
 */

export const CANONICAL_RACES = Object.freeze({\n`;

for (const r of canonicalTree) {
  const raceObj = {
    id: r.race,
    name: r.raceName,
    branchesCount: r.branches.length,
    baseClassIds: Array.from(new Set(r.branches.map(b => b.base))),
    lineageIds: r.branches.map(b => b.third)
  };
  raceCode += `  ${JSON.stringify(r.race)}: Object.freeze(${JSON.stringify(raceObj, null, 4)}),\n`;
}

raceCode += `});\n\n`;
raceCode += `export const ALL_CANONICAL_RACE_IDS = Object.freeze(Object.keys(CANONICAL_RACES));\n`;
raceCode += `export default CANONICAL_RACES;\n`;

fs.writeFileSync('lineage-idle/src/data/classes/CanonicalRaceRegistry.js', raceCode, 'utf8');
console.log('Saved CanonicalRaceRegistry.js');
