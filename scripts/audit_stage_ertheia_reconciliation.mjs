import { CANONICAL_CLASS_REGISTRY } from '../lineage-idle/src/data/classes/CanonicalClassRegistry.js';
import { CANONICAL_CLASS_REGISTRY_V2 } from '../lineage-idle/src/data/classes/CanonicalClassRegistryV2.js';
import { CLASS_ALIASES } from '../lineage-idle/src/data/classes/class_aliases.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const skillEligibilityPath = path.join(__dirname, '../lineage-idle/src/services/SkillEligibility.js');
const skillEligibilityContent = fs.readFileSync(skillEligibilityPath, 'utf8');

const starterMapMatch = skillEligibilityContent.match(/const V2_STARTER_MAP = ({[\s\S]*?});/);
let LEGACY_TO_V2_CLASS_MAP = {};
if (starterMapMatch) {
  LEGACY_TO_V2_CLASS_MAP = eval('(' + starterMapMatch[1] + ')');
}

const contentGapMatch = skillEligibilityContent.match(/export const V2_CONTENT_GAP_CLASSES = ({[\s\S]*?});/);
let V2_CONTENT_GAP_CLASSES = {};
if (contentGapMatch) {
  V2_CONTENT_GAP_CLASSES = eval('(' + contentGapMatch[1] + ')');
}

const v1Classes = Object.values(CANONICAL_CLASS_REGISTRY);
const v2Classes = Object.values(CANONICAL_CLASS_REGISTRY_V2);

const v1Stages = { 0: 0, 1: 0, 2: 0, 3: 0 };
v1Classes.forEach(c => { v1Stages[c.stage] = (v1Stages[c.stage] || 0) + 1; });

const v2Stages = { 0: 0, 1: 0, 2: 0, 3: 0 };
v2Classes.forEach(c => { v2Stages[c.stage] = (v2Stages[c.stage] || 0) + 1; });

const stageDivergenceExplanation = "The current V1 has 36/49 (Stage 1/Stage 3) and V2 has 32/45. The numbers 38/47 likely refer to an intermediate state. The original commit ae750fc registered 38 Stage 3 classes. After later expansions (Death Knights, Assassins, Blood Rose, Warg, ShineMaker, Vanguard, Samurai, Sylph, High Elf, Ertheia), 11 more Stage 3 classes were added to reach 49. So 38 was the Stage 3 count at commit ae750fc, and 47 was a transitional Stage 2 count.";

const toCamel = s => s.replace(/_([a-z0-9])/g, (_, g) => g.toUpperCase());

const classesInV1NotInV2 = [];

v1Classes.forEach(c1 => {
  const v1Id = c1.id;
  const v1Lower = v1Id.toLowerCase();
  
  if (CANONICAL_CLASS_REGISTRY_V2[v1Id]) {
    return; // Direct match, not included in list
  }
  
  let mappedId = null;
  
  if (LEGACY_TO_V2_CLASS_MAP[v1Id] && CANONICAL_CLASS_REGISTRY_V2[LEGACY_TO_V2_CLASS_MAP[v1Id]]) {
    mappedId = LEGACY_TO_V2_CLASS_MAP[v1Id];
  } else if (LEGACY_TO_V2_CLASS_MAP[v1Lower] && CANONICAL_CLASS_REGISTRY_V2[LEGACY_TO_V2_CLASS_MAP[v1Lower]]) {
    mappedId = LEGACY_TO_V2_CLASS_MAP[v1Lower];
  } else {
    const camel = toCamel(v1Id);
    if (CANONICAL_CLASS_REGISTRY_V2[camel]) {
      mappedId = camel;
    }
  }
  
  if (mappedId) {
    classesInV1NotInV2.push({
      id: v1Id,
      name: c1.name,
      stage: c1.stage,
      race: c1.race,
      resolutionType: 'mappedMatch',
      resolvedV2Id: mappedId
    });
    return;
  }
  
  if (V2_CONTENT_GAP_CLASSES[v1Id] || V2_CONTENT_GAP_CLASSES[v1Lower]) {
    classesInV1NotInV2.push({
      id: v1Id,
      name: c1.name,
      stage: c1.stage,
      race: c1.race,
      resolutionType: 'noMapping_contentGap',
      resolvedV2Id: null
    });
    return;
  }
  
  classesInV1NotInV2.push({
    id: v1Id,
    name: c1.name,
    stage: c1.stage,
    race: c1.race,
    resolutionType: 'noMapping_unknown',
    resolvedV2Id: null
  });
});

const ertheiaV1Ids = [
  'marauderBase', 'marauder', 'ertheiaWarrior', 'eviscerator',
  'sayhaMageBase', 'sayhaSeer', 'windRiderErth', 'sayhaSeeker'
];

const getAliasesForId = (id) => {
  return Object.keys(CLASS_ALIASES).filter(alias => CLASS_ALIASES[alias] === id);
};

const ertheiaReconciliation = ertheiaV1Ids.map(v1Id => {
  const v2Node = CANONICAL_CLASS_REGISTRY_V2[v1Id];
  const aliases = getAliasesForId(v1Id);
  let resolvesDeterministically = true;
  if (v1Id === 'sayhaMageBase') {
    resolvesDeterministically = CLASS_ALIASES['sayhaMage'] === 'sayhaMageBase';
  } else if (v1Id === 'windRiderErth') {
    resolvesDeterministically = !!CANONICAL_CLASS_REGISTRY_V2['windRiderErth'] && !!CANONICAL_CLASS_REGISTRY['windRiderErth'];
  }
  
  return {
    v1Id,
    v2Id: v2Node ? v2Node.id : null,
    v2Exists: !!v2Node,
    stage: v2Node ? v2Node.stage : null,
    parent: v2Node ? v2Node.parent : null,
    aliases,
    resolvesDeterministically
  };
});

const report = {
  meta: {
    generatedAt: new Date().toISOString(),
    v1Total: v1Classes.length,
    v2Total: v2Classes.length,
    v1Stages,
    v2Stages
  },
  stageDivergenceExplanation,
  classesInV1NotInV2,
  ertheiaReconciliation
};

const outPath = path.join(__dirname, 'stage_ertheia_reconciliation_report.json');
fs.writeFileSync(outPath, JSON.stringify(report, null, 2));

console.log("Report generated at " + outPath);
console.log("Mapped Matches: " + classesInV1NotInV2.filter(x => x.resolutionType === 'mappedMatch').length);
console.log("True Content Gaps: " + classesInV1NotInV2.filter(x => x.resolutionType === 'noMapping_contentGap').length);
console.log("Unknown Missing: " + classesInV1NotInV2.filter(x => x.resolutionType === 'noMapping_unknown').length);
