import fs from 'fs';
import path from 'path';

const chunk0Path = path.resolve('scraped_data_wiki/raw_passives/passives_chunk_0.json');
const chunk1Path = path.resolve('scraped_data_wiki/raw_passives/passives_chunk_1.json');
const chunk2Path = path.resolve('scraped_data_wiki/raw_passives/passives_chunk_2.json');

const outClassesSummary = path.resolve('scraped_data_wiki/classes_passives_summary.json');
const outUniqueSkills = path.resolve('scraped_data_wiki/unique_passives_inventory.json');

const chunk0 = fs.existsSync(chunk0Path) ? JSON.parse(fs.readFileSync(chunk0Path, 'utf8')) : [];
const chunk1 = fs.existsSync(chunk1Path) ? JSON.parse(fs.readFileSync(chunk1Path, 'utf8')) : [];
const chunk2 = fs.existsSync(chunk2Path) ? JSON.parse(fs.readFileSync(chunk2Path, 'utf8')) : [];

const allClasses = [...chunk0, ...chunk1, ...chunk2];
console.log(`Loaded chunks: chunk0=${chunk0.length}, chunk1=${chunk1.length}, chunk2=${chunk2.length}. Total classes: ${allClasses.length}`);

fs.writeFileSync(outClassesSummary, JSON.stringify(allClasses, null, 2));
console.log(`Saved merged classes passives to: ${outClassesSummary}`);

// Extract unique skills across all classes
const uniqueSkillsMap = new Map();

for (const cls of allClasses) {
  for (const skill of (cls.skills || [])) {
    const id = skill.wikiSkillId;
    if (!uniqueSkillsMap.has(id)) {
      uniqueSkillsMap.set(id, {
        wikiSkillId: id,
        rank: skill.rank,
        subrank: skill.subrank,
        href: skill.href,
        url: skill.url,
        icon: skill.icon,
        iconFile: skill.iconFile,
        categories: [skill.category],
        classes: [cls.slug],
        sampleClass: cls.slug
      });
    } else {
      const existing = uniqueSkillsMap.get(id);
      if (!existing.categories.includes(skill.category)) {
        existing.categories.push(skill.category);
      }
      if (!existing.classes.includes(cls.slug)) {
        existing.classes.push(cls.slug);
      }
    }
  }
}

const uniqueSkillsList = Array.from(uniqueSkillsMap.values()).sort((a, b) => a.wikiSkillId - b.wikiSkillId);
console.log(`Extracted ${uniqueSkillsList.length} unique skills across all classes!`);

// Check overlap with existing skills_detailed.json
const detailedPath = path.resolve('scraped_data_wiki/skills_detailed.json');
let detailedSkills = [];
if (fs.existsSync(detailedPath)) {
  detailedSkills = JSON.parse(fs.readFileSync(detailedPath, 'utf8'));
}

const existingIds = new Set(detailedSkills.map(s => s.wikiSkillId));
const missingSkills = uniqueSkillsList.filter(s => !existingIds.has(s.wikiSkillId));
const existingPassives = uniqueSkillsList.filter(s => existingIds.has(s.wikiSkillId));

console.log(`Existing in skills_detailed.json: ${existingPassives.length}`);
console.log(`New/Missing skills needing details: ${missingSkills.length}`);

const inventory = {
  totalClassesScraped: allClasses.length,
  totalUniqueSkills: uniqueSkillsList.length,
  alreadyInDetailed: existingPassives.length,
  missingFromDetailed: missingSkills.length,
  uniqueSkills: uniqueSkillsList,
  missingSkillsList: missingSkills
};

fs.writeFileSync(outUniqueSkills, JSON.stringify(inventory, null, 2));
console.log(`Saved unique passives inventory to: ${outUniqueSkills}`);
