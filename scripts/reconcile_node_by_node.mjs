import { CANONICAL_CLASS_REGISTRY } from '../lineage-idle/src/data/classes/CanonicalClassRegistry.js';
import { CANONICAL_CLASS_REGISTRY_V2 } from '../lineage-idle/src/data/classes/CanonicalClassRegistryV2.js';

const v1 = CANONICAL_CLASS_REGISTRY;
const v2 = CANONICAL_CLASS_REGISTRY_V2;

// Group V1 nodes into categories:
// 1. Direct 1:1 match in V2 (same identity, either same key or snake_case <-> camelCase)
// 2. Merged nodes (e.g. Death Knight 3 racial branches merging into 1 V2 branch; Assassin 2 gender branches merging into 1 V2 branch)
// 3. Gaps in V2 (nodes in V1 that do not have a counterpart in V2)
// 4. Any nodes in V2 that do not come from V1

console.log('=== EXACT NODE-BY-NODE ANALYSIS ===');

// Death Knight analysis
const dk_v1 = Object.keys(v1).filter(k => k.includes('deathknight'));
console.log('V1 Death Knight nodes (' + dk_v1.length + '):', dk_v1);
// human_deathknight_0,1,2,3 (4 nodes)
// elf_deathknight_0,1,2,3 (4 nodes)
// delf_deathknight_0,1,2,3 (4 nodes)
// Total in V1: 12 nodes!
// In V2: deathPilgrim, deathBlade, deathMessenger, deathKnight (4 nodes).
// Node delta for Death Knight: 12 - 4 = -8 nodes.

// Assassin analysis
const ass_v1 = Object.keys(v1).filter(k => k.includes('secret_assassin'));
console.log('\nV1 Secret Assassin nodes (' + ass_v1.length + '):', ass_v1);
// secret_assassin_male_0,1,2,3 (4 nodes)
// secret_assassin_female_0,1,2,3 (4 nodes)
// Total in V1: 8 nodes!
// In V2: assassinS0, assassinS1, assassinS2, assassinS3 (4 nodes)
// Note: assassinDE in V2 corresponds to V1 'assassin' (Dark Elf stage 1).
// Node delta for Secret Assassin: 8 - 4 = -4 nodes.

// Warg/Werewolf analysis
const warg_v1 = Object.keys(v1).filter(k => k.includes('werewolf'));
console.log('\nV1 Werewolf nodes (' + warg_v1.length + '):', warg_v1);
// werewolf_0, werewolf_1, werewolf_2, werewolf_3 (4 nodes)
// In V2: only 'warg' (stage 3).
// werewolf_0, 1, 2 have no node in V2.
// Node delta: 4 - 1 = -3 nodes.

// High Elf Spirit/Element Weaver analysis
const spirit_v1 = Object.keys(v1).filter(k => k.startsWith('spirit_'));
console.log('\nV1 Spirit nodes (' + spirit_v1.length + '):', spirit_v1);
// spirit_0, spirit_1, spirit_2, spirit_3 (4 nodes)
// In V2: spirit_0, elementWeaverS1, elementWeaverS2, elementWeaver (4 nodes).
// All four lineage stages have a corresponding node.

// Dwarf Shine Maker analysis
const sm_v1 = Object.keys(v1).filter(k => k.toLowerCase().includes('shinemaker'));
console.log('\nV1 ShineMaker nodes (' + sm_v1.length + '):', sm_v1);
// shineMakerBase, shinemaker_1, shinemaker_2, shinemaker_3 (4 nodes)
// In V2: shineMakerS1, shineMakerS2, shinemaker (3 nodes).
// shineMakerBase has no node in V2.
// Node delta: 4 - 3 = -1 node.

console.log('\n=== CURRENT CATALOG COUNTS ===');
console.log(`V1 canonical classes: ${Object.keys(v1).length}`);
console.log(`V2 canonical classes: ${Object.keys(v2).length}`);
console.log(`High Elf Element Weaver nodes: ${['spirit_0', 'elementWeaverS1', 'elementWeaverS2', 'elementWeaver'].filter(id => v2[id]).length}/4`);
