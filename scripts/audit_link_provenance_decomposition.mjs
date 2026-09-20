import fs from 'fs';
import path from 'path';
import { CANONICAL_CLASS_REGISTRY } from '../lineage-idle/src/data/classes/CanonicalClassRegistry.js';
import { CANONICAL_CLASS_REGISTRY_V2 } from '../lineage-idle/src/data/classes/CanonicalClassRegistryV2.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:\/)/, '$1');
const manifestPath = path.resolve(__dirname, '../docs/INDEPENDENT_CLASS_EXPECTATIONS_MANIFEST.json');
const auditReportPath = path.resolve(__dirname, './class_skill_links_audit_report.json');
const outputPath = path.resolve(__dirname, './link_provenance_decomposition_report.json');

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const auditReport = JSON.parse(fs.readFileSync(auditReportPath, 'utf8'));

const ertheiaClasses = ['marauder', 'ertheiaWarrior', 'eviscerator', 'sayhaSeer', 'windRiderErth', 'sayhaSeeker'];

const classMapV1 = {};
Object.values(CANONICAL_CLASS_REGISTRY).forEach(c => { classMapV1[c.id] = c; });

const linksByClass = {};
auditReport.results.forEach(res => {
    if (!linksByClass[res.classId]) linksByClass[res.classId] = [];
    linksByClass[res.classId].push(res.skillId);
});

// Build V2 skill map for fallback/Ertheia
const v2SkillsByClassV1Id = {};
Object.values(classMapV1).forEach(cls => {
    const classId = cls.id;
    const v2Context = manifest.classes[classId]?.v2Context;
    if (v2Context && v2Context.v2ClassId) {
        const v2Class = CANONICAL_CLASS_REGISTRY_V2[v2Context.v2ClassId];
        if (v2Class && v2Class.skillIds) {
            v2SkillsByClassV1Id[classId] = v2Class.skillIds;
        }
    }
});

const inheritedLinks = [];
const contentGapPositions = [];
const unprovenErtheiaLinks = [];
const perClassSummary = {};

let totalOwn = 0;
let totalInherited = 0;
let totalUnproven = 0;
let totalGap = 0;

function findInheritedFrom(classId, skillId) {
    let currentId = classId;
    let oldestAncestor = null;
    while (currentId) {
        const cls = classMapV1[currentId];
        if (!cls || !cls.parentClassId) break;
        const parentId = cls.parentClassId;
        const parentLinks = linksByClass[parentId] || [];
        const parentV2Skills = v2SkillsByClassV1Id[parentId] || [];
        if (parentLinks.includes(skillId) || parentV2Skills.includes(skillId)) {
            oldestAncestor = parentId;
        }
        currentId = parentId;
    }
    return oldestAncestor;
}

Object.values(CANONICAL_CLASS_REGISTRY).forEach(cls => {
    const classId = cls.id;
    let own = 0;
    let inherited = 0;
    let unproven = 0;
    let gap = 0;
    
    // Determine the skills to process:
    // If it's an Ertheia class, it has skills in V2 but no L2Wiki scrape provenance (maybe not in auditReport)
    // If it's in auditReport, we use those links.
    // Actually, let's just combine them or follow the prompt exactly.
    // "How many skill links does it have in the manifest?" -> actually the prompt means we find the links for the class.
    
    let skillsToProcess = linksByClass[classId] || [];
    
    // For Ertheia, they might be in V2 but not in links
    if (ertheiaClasses.includes(classId) && skillsToProcess.length === 0) {
        skillsToProcess = v2SkillsByClassV1Id[classId] || [];
    }
    
    skillsToProcess.forEach(skillId => {
        if (ertheiaClasses.includes(classId)) {
            unproven++;
            totalUnproven++;
            unprovenErtheiaLinks.push({ classId, skillId });
        } else {
            const inheritedFrom = findInheritedFrom(classId, skillId);
            if (inheritedFrom) {
                inherited++;
                totalInherited++;
                inheritedLinks.push({ classId, skillId, inheritedFrom });
            } else {
                own++;
                totalOwn++;
            }
        }
    });
    
    const expectedSlots = 5;
    const currentSlots = skillsToProcess.length;
    if (currentSlots < expectedSlots) {
        for (let i = currentSlots; i < expectedSlots; i++) {
            gap++;
            totalGap++;
            contentGapPositions.push({ classId, position: i, reason: 'CONTENT_GAP' });
        }
    }
    
    perClassSummary[classId] = {
        total: expectedSlots,
        own,
        inherited,
        unproven,
        gap
    };
});

const theoreticalTotal = 159 * 5;
const calculatedTotal = totalOwn + totalInherited + totalUnproven + totalGap;

const report = {
    meta: {
        generatedAt: new Date().toISOString(),
        theoreticalTotal,
        breakdown: {
            OWN_PROVEN: totalOwn,
            INHERITED: totalInherited,
            UNPROVEN_ERTHEIA: totalUnproven,
            CONTENT_GAP: totalGap
        },
        checksumValid: theoreticalTotal === calculatedTotal
    },
    inheritedLinks,
    contentGapPositions,
    unprovenErtheiaLinks,
    perClassSummary
};

fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));

console.log("Decomposition complete.");
console.log("Theoretical Total: " + theoreticalTotal);
console.log("OWN_PROVEN: " + totalOwn);
console.log("INHERITED: " + totalInherited);
console.log("UNPROVEN_ERTHEIA: " + totalUnproven);
console.log("CONTENT_GAP: " + totalGap);
console.log("Checksum Valid: " + (theoreticalTotal === calculatedTotal));
