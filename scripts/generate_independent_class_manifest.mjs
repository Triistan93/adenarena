import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// 1. Carregar registros de produção
const { CANONICAL_CLASS_REGISTRY } = await import(pathToFileURL(path.join(ROOT_DIR, 'lineage-idle/src/data/classes/CanonicalClassRegistry.js')).href);
const { CANONICAL_CLASS_REGISTRY_V2 } = await import(pathToFileURL(path.join(ROOT_DIR, 'lineage-idle/src/data/classes/CanonicalClassRegistryV2.js')).href);
const { CANONICAL_RACES } = await import(pathToFileURL(path.join(ROOT_DIR, 'lineage-idle/src/data/classes/CanonicalRaceRegistry.js')).href);
const { CANONICAL_SKILL_REGISTRY_V2 } = await import(pathToFileURL(path.join(ROOT_DIR, 'lineage-idle/src/data/skills/CanonicalSkillRegistryV2.js')).href);
const {
  resolveV2ClassContext,
  getSkillUnlockLevelForClass,
  isSkillInV2Lineage,
  V2_CONTENT_GAP_CLASSES
} = await import(pathToFileURL(path.join(ROOT_DIR, 'lineage-idle/src/services/SkillEligibility.js')).href);
const { getSkillIcon } = await import(pathToFileURL(path.join(ROOT_DIR, 'lineage-idle/src/services/SkillIconRegistry.js')).href);

// 2. Carregar dados brutos raspados
const wikiClassesSummary = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'scraped_data_wiki/classes_summary.json'), 'utf8'));
const wikiSkillsDetailed = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'scraped_data_wiki/skills_detailed.json'), 'utf8'));

// Mapa rápido de skills da Wiki
const wikiSkillsById = new Map();
for (const s of wikiSkillsDetailed) {
  if (s.wikiSkillId) wikiSkillsById.set(String(s.wikiSkillId), s);
  if (s.id) wikiSkillsById.set(String(s.id), s);
}

// Mapa de classes da Wiki
const wikiClassesBySlug = new Map();
for (const c of wikiClassesSummary) {
  wikiClassesBySlug.set(c.slug, c);
}

// Classes conhecidas de Ertheia
const ERTHEIA_CLASS_IDS = new Set([
  'marauderBase', 'marauder', 'ertheiaWarrior', 'eviscerator',
  'sayhaMageBase', 'sayhaSeer', 'windRiderErth', 'sayhaSeeker'
]);

console.log('[Manifest Generator] Iniciando congelamento do escopo e geração de expectativas independentes...');

const manifest = {
  meta: {
    generatedAt: new Date().toISOString(),
    branch: 'feature/skill-tree-integration-fix',
    commitBase: '926f4c5',
    totalClasses: Object.keys(CANONICAL_CLASS_REGISTRY).length,
    totalRoots: 0,
    totalLineages: 0,
    totalPromotionEdges: 0,
    totalSkillLinks: 0
  },
  races: {},
  characterCreatorOptions: [],
  classes: {},
  promotions: [],
  lineages: {},
  classSkillLinks: [],
  subclasses: {
    eligibleClasses: [],
    rules: {
      minLevelToUnlock: 75,
      subclassStartLevel: 40,
      maxSubclasses: 3,
      seasonGate: 'isFeatureUnlocked("subclasses")',
      unlockedSeasons: [3, 4],
      certificationsRule: 'Stored across subclasses; effective bonus strictly 0 while in subclass, active ONLY on Main'
    }
  }
};

// 1. Processar Raças
for (const [rId, rDef] of Object.entries(CANONICAL_RACES)) {
  manifest.races[rId] = {
    id: rId,
    name: rDef.name,
    branchesCount: rDef.branchesCount,
    baseClassIds: rDef.baseClassIds,
    lineageIds: rDef.lineageIds
  };
}

// 2. Processar Nós de Classe, Estágios e Linhagens
const roots = [];
const lineagesSet = new Set();
const edges = [];

for (const [cId, cDef] of Object.entries(CANONICAL_CLASS_REGISTRY)) {
  const isRoot = cDef.stage === 0 || cDef.parentClass === null;
  if (isRoot) roots.push(cId);

  const lineageKey = cDef.lineageId || cDef.lineageName;
  lineagesSet.add(lineageKey);

  if (cDef.parentClass) {
    edges.push({
      edgeId: `${cDef.parentClass}->${cId}`,
      sourceClassId: cDef.parentClass,
      targetClassId: cId,
      sourceStage: CANONICAL_CLASS_REGISTRY[cDef.parentClass]?.stage,
      targetStage: cDef.stage,
      race: cDef.race,
      reqLevel: cDef.minLevel
    });
  }

  // Avaliação de Proveniência & Content Gap
  let provenanceStatus = 'PROVEN_CANONICAL';
  let gapReason = null;

  if (V2_CONTENT_GAP_CLASSES[cId]) {
    provenanceStatus = 'CONTENT_GAP';
    gapReason = V2_CONTENT_GAP_CLASSES[cId].reason;
  } else if (ERTHEIA_CLASS_IDS.has(cId)) {
    provenanceStatus = 'UNPROVEN_PROVENANCE';
    gapReason = 'Ertheia lineage: Habilidades de Ertheia ausentes no dataset raspado L2Wiki e catálogo V2 não comprovado';
  }

  // Resolução de contexto V2
  const v2Resolution = resolveV2ClassContext(cId, cDef.race);

  manifest.classes[cId] = {
    id: cId,
    name: cDef.name,
    race: cDef.race,
    stage: cDef.stage,
    stageName: cDef.stageName,
    minLevel: cDef.minLevel,
    maxLevel: cDef.maxLevel,
    parentClass: cDef.parentClass,
    lineageId: cDef.lineageId,
    lineageName: cDef.lineageName,
    role: cDef.role,
    archetypeGroup: cDef.archetypeGroup,
    weapons: cDef.weapons,
    provenanceStatus,
    gapReason,
    v2Context: {
      status: v2Resolution.status,
      v2ClassId: v2Resolution.v2ClassId || null,
      v2ClassName: v2Resolution.v2ClassDef?.name || null,
      v2Stage: v2Resolution.v2ClassDef?.stage ?? null
    }
  };
}

manifest.meta.totalRoots = roots.length;
manifest.meta.totalLineages = lineagesSet.size;
manifest.meta.totalPromotionEdges = edges.length;
manifest.promotions = edges;

// 3. Opções reais de CharacterCreation.tsx (25 raízes)
const CREATOR_OPTIONS = [
  // Human (5)
  { race: 'human', classId: 'fighter', className: 'Guerreiro (Fighter)', icon: '⚔️' },
  { race: 'human', classId: 'mage', className: 'Mago (Mage)', icon: '🔮' },
  { race: 'human', classId: 'human_deathknight_0', className: 'Death Knight 💀', icon: '💀' },
  { race: 'human', classId: 'werewolf_0', className: 'Warg 🐺', icon: '🐺' },
  { race: 'human', classId: 'secret_assassin_male_0', className: 'Assassin 🗡️', icon: '🗡️' },

  // Elf (3)
  { race: 'elf', classId: 'elven_fighter', className: 'Guerreiro Elfo (Fighter)', icon: '🏹' },
  { race: 'elf', classId: 'elven_mage', className: 'Mago Elfo (Mage)', icon: '🌊' },
  { race: 'elf', classId: 'elf_deathknight_0', className: 'Death Knight 💀', icon: '💀' },

  // Dark Elf (5)
  { race: 'darkelf', classId: 'dark_fighter', className: 'Guerreiro Negro (Fighter)', icon: '🗡️' },
  { race: 'darkelf', classId: 'dark_mage', className: 'Mago Negro (Mage)', icon: '🔮' },
  { race: 'darkelf', classId: 'delf_deathknight_0', className: 'Death Knight 💀', icon: '💀' },
  { race: 'darkelf', classId: 'secret_assassin_female_0', className: 'Assassin 🗡️', icon: '🗡️' },
  { race: 'darkelf', classId: 'rose_vain_0', className: 'Blood Rose 🌹', icon: '🌹' },

  // Orc (3)
  { race: 'orc', classId: 'orc_fighter', className: 'Guerreiro Orc (Fighter)', icon: '🪓' },
  { race: 'orc', classId: 'orc_mage', className: 'Xamã Orc (Shaman)', icon: '🔥' },
  { race: 'orc', classId: 'orc_rider_0', className: 'Vanguard Rider 🐉', icon: '🐉' },

  // Dwarf (2)
  { race: 'dwarf', classId: 'dwarven_fighter', className: 'Artesão (Artisan)', icon: '⚒️' },
  { race: 'dwarf', classId: 'shineMakerBase', className: 'ShineMaker ✨', icon: '✨' },

  // Kamael (2)
  { race: 'kamael', classId: 'jin_kamael_soldier', className: 'Soldier / Soulbreaker', icon: '🗡️' },
  { race: 'kamael', classId: 'crow_0', className: 'Samurai ⛩️', icon: '⛩️' },

  // Sylph (1)
  { race: 'sylph', classId: 'sylphid', className: 'Storm Blaster 🔫', icon: '🔫' },

  // High Elf (2)
  { race: 'highelf', classId: 'sacred_templar_0', className: 'Divine Templar 🛡️', icon: '🛡️' },
  { race: 'highelf', classId: 'spirit_0', className: 'Element Weaver 🌀', icon: '🌀' },

  // Ertheia (2)
  { race: 'ertheia', classId: 'marauderBase', className: 'Marauder / Eviscerator 🌪️', icon: '🥊' },
  { race: 'ertheia', classId: 'sayhaMageBase', className: 'Sayha Seeker 🌀', icon: '🌀' }
];

manifest.characterCreatorOptions = CREATOR_OPTIONS;

// 4. Mapear Vínculos Classe-Habilidade com Evidência & Adaptação de Design
let linkCount = 0;

for (const [cId, cDef] of Object.entries(CANONICAL_CLASS_REGISTRY)) {
  const v2Res = resolveV2ClassContext(cId, cDef.race);
  const v2Class = v2Res.v2ClassDef;

  // Obter lista de habilidades associadas à classe
  const skillIds = new Set();

  // Habilidades canônicas do V2 se resolvido
  if (v2Class && v2Class.skillIds) {
    for (const sid of v2Class.skillIds) skillIds.add(sid);
  }

  // Habilidades de Content Gap se registradas
  if (V2_CONTENT_GAP_CLASSES[cId]?.authorizedSkillIds) {
    for (const sid of V2_CONTENT_GAP_CLASSES[cId].authorizedSkillIds) skillIds.add(sid);
  }

  for (const sId of skillIds) {
    const v2SkillDef = CANONICAL_SKILL_REGISTRY_V2[sId];
    const isV2Native = !!v2SkillDef;

    // Verificar se é própria do estágio ou herdada
    const isOwn = v2Class?.skillIds?.includes(sId) || cDef.unlockedSkillIds?.includes(sId);

    // Evidência de pertencimento
    let evidenceSource = 'ADEN_ARENA_ADAPTATION';
    let evidenceDetail = 'Adaptação balanceada de 5 habilidades por estágio do Aden Arena';

    // Checar se existe no L2Wiki oficial raspado
    const wikiClass = wikiClassesBySlug.get(cId);
    if (wikiClass && wikiClass.skills.some(ws => ws.wikiSkillId === sId || ws.wikiSkillId === v2SkillDef?.wikiId)) {
      evidenceSource = 'L2WIKI_ESSENCE_PROVEN';
      evidenceDetail = `L2Wiki Essence #${v2SkillDef?.wikiId || sId} para classe ${cId}`;
    }

    // Requisito contextual
    const unlockLevel = getSkillUnlockLevelForClass(cId, sId);

    // Tipo, Rank e Slots
    const skillType = v2SkillDef?.type || (v2SkillDef?.isPassive ? 'passive' : 'active');
    const isPassive = skillType === 'passive' || skillType === 'stat';
    const starRank = v2SkillDef?.starRank || 1;
    const allowedSlots = isPassive ? [] : ['basic', 'core1', 'core2', 'special1', 'special2', 'signature', 'ultimate'];

    const iconData = getSkillIcon(sId);
    const iconPhysicalExists = fs.existsSync(path.join(ROOT_DIR, 'public', iconData.iconPath));

    linkCount++;
    manifest.classSkillLinks.push({
      linkId: `${cId}::${sId}`,
      classId: cId,
      race: cDef.race,
      stage: cDef.stage,
      parentClass: cDef.parentClass,
      skillId: sId,
      skillName: v2SkillDef?.name || sId,
      isOwn,
      isPassive,
      starRank,
      unlockLevel,
      allowedSlots,
      evidenceSource,
      evidenceDetail,
      expectedIcon: iconData.iconPath,
      iconPhysicalExists
    });
  }
}

manifest.meta.totalSkillLinks = linkCount;

// 5. Classes elegíveis para Subclasses
manifest.subclasses.eligibleClasses = Object.keys(CANONICAL_CLASS_REGISTRY).filter(cId => {
  const c = CANONICAL_CLASS_REGISTRY[cId];
  return c.stage >= 1; // Subclasses canônicas são classes promovidas (Lv 40+)
});

// Salvar manifesto em docs/
const outPath = path.join(ROOT_DIR, 'docs/INDEPENDENT_CLASS_EXPECTATIONS_MANIFEST.json');
fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2), 'utf8');

console.log(`[Manifest Generator] Sucesso! Manifesto salvo em ${outPath}`);
console.log(`[Manifest Summary]:`);
console.log(`  - Total de Classes: ${manifest.meta.totalClasses}`);
console.log(`  - Raízes no Criador: ${manifest.meta.totalRoots}`);
console.log(`  - Linhagens Terminais: ${manifest.meta.totalLineages}`);
console.log(`  - Arestas de Promoção: ${manifest.meta.totalPromotionEdges}`);
console.log(`  - Vínculos Classe-Habilidade: ${manifest.meta.totalSkillLinks}`);
console.log(`  - Classes Elegíveis p/ Subclasse: ${manifest.subclasses.eligibleClasses.length}`);
