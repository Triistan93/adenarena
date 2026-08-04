import fs from 'fs';
import path from 'path';

const publicImg = path.join(process.cwd(), 'public', 'img');

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const allPhysicalFiles = getAllFiles(publicImg).map(p => '/' + path.relative(process.cwd(), p).replace(/\\/g, '/').replace(/^public\//, ''));

const heroImagesMap = {};

// Add identity mappings for all physical files
allPhysicalFiles.forEach(p => {
  heroImagesMap[p] = p;
  heroImagesMap[p.toLowerCase()] = p;
});

// Add aliases for legacy codinomes
const legacyAliases = {
  "/img/human_fighter.png": "/img/Races/Human/Fighter/human_fighter.png",
  "/img/humanpalaM.png": "/img/Races/Human/Fighter/human_fighter.png",
  "/img/humanpalaF.png": "/img/Races/Human/Fighter/human_fighter.png",
  "/img/human_mage.png": "/img/Races/Human/Mage/human_mage.png",
  "/img/humanmageF.png": "/img/Races/Human/Mage/human_mage.png",
  "/img/humanmageM.png": "/img/Races/Human/Mage/human_mage.png",
  "/img/human_mageb.png": "/img/Races/Human/Mage/human_mageb.png",

  "/img/elf_fighter.png": "/img/Races/Elf/Fighter/elf_fighter.png",
  "/img/elvenKnightM.png": "/img/Races/Elf/Fighter/elf_fighter.png",
  "/img/elfswsF.png": "/img/Races/Elf/Fighter/elf_fighter.png",
  "/img/elfwswM.png": "/img/Races/Elf/Fighter/elf_fighter.png",
  "/img/elf_mage.png": "/img/Races/Elf/Mage/elf_mage.png",
  "/img/elfmageM.png": "/img/Races/Elf/Mage/elf_mage.png",
  "/img/elfmageF.png": "/img/Races/Elf/Mage/elf_mage.png",

  "/img/darkelf_fighter.png": "/img/Races/DarkElf/Fighter/darkelf_fighter.png",
  "/img/darkelfskM.png": "/img/Races/DarkElf/Fighter/darkelf_fighter.png",
  "/img/darkelfskF.png": "/img/Races/DarkElf/Fighter/darkelf_fighter.png",
  "/img/darkelf_mage.png": "/img/Races/DarkElf/Mage/darkelf_mage.png",
  "/img/darkelfmageF.png": "/img/Races/DarkElf/Mage/darkelf_mage.png",
  "/img/darkelfmageM.png": "/img/Races/DarkElf/Mage/darkelf_mage.png",

  "/img/orc_fighter.png": "/img/Races/Orcs/Fighter/orc_fighter.png",
  "/img/orcfighterM.png": "/img/Races/Orcs/Fighter/orc_fighter.png",
  "/img/orcfighterF.png": "/img/Races/Orcs/Fighter/orc_fighter.png",
  "/img/orc_mage.png": "/img/Races/Orcs/Mage/orc_mage.png",
  "/img/orcDM.png": "/img/Races/Orcs/Mage/orc_mage.png",

  "/img/dwarf_artisan.png": "/img/Races/Dwarfs/Fighter/dwarf_artisan.png",
  "/img/dwarfmaestroM.png": "/img/Races/Dwarfs/Fighter/dwarf_artisan.png",

  "/img/kamael_soulbreaker.png": "/img/Races/Kamael/Fighter/kamael_soulbreaker.png",
  "/img/kamaelDM.png": "/img/Races/Kamael/Fighter/kamael_soulbreaker.png",
  "/img/kamaelshF.png": "/img/Races/Kamael/Fighter/kamael_soulbreaker.png"
};

Object.assign(heroImagesMap, legacyAliases);

const tsContent = `// Auto-generated mapping of all physical and legacy asset paths in public/img/

export const HERO_IMAGES: Record<string, string> = ${JSON.stringify(heroImagesMap, null, 2)};

// Expose to the vanilla JS art module running inside the shadow DOM
if (typeof window !== 'undefined') {
  (window as any).__HERO_IMGS = HERO_IMAGES;
}
`;

fs.writeFileSync(path.join(process.cwd(), 'src', 'idle', 'heroImages.ts'), tsContent);
console.log('Successfully updated src/idle/heroImages.ts with', Object.keys(heroImagesMap).length, 'entries!');
