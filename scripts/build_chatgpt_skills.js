import fs from 'fs';
import path from 'path';

const skillsBaseDir = path.join('.agents', 'skills');
const skillDirs = fs.readdirSync(skillsBaseDir).filter(f => fs.statSync(path.join(skillsBaseDir, f)).isDirectory());

let masterDoc = '# 🎮 MASTER GAME DEVELOPMENT SKILLS & INSTRUCTION KNOWLEDGE BASE\n\n';
masterDoc += '> Este documento consolida todas as 22 especialidades e playbooks técnicos utilizados no desenvolvimento do **Aden Arena**.\n';
masterDoc += '> Pode ser enviado diretamente para a seção **Knowledge** do seu Custom GPT ou Projeto no ChatGPT.\n\n';
masterDoc += '## 📑 Índice de Habilidades e Especialidades\n\n';

skillDirs.forEach((dir, i) => {
  const anchor = dir.toLowerCase().replace(/[^a-z0-9_-]/g, '');
  masterDoc += `${i + 1}. [${dir}](#${anchor})\n`;
});
masterDoc += '\n---\n\n';

for (const dir of skillDirs) {
  const fullDirPath = path.join(skillsBaseDir, dir);
  const skillMdPath = path.join(fullDirPath, 'SKILL.md');
  const anchor = dir.toLowerCase().replace(/[^a-z0-9_-]/g, '');
  
  if (fs.existsSync(skillMdPath)) {
    const content = fs.readFileSync(skillMdPath, 'utf8');
    masterDoc += `\n<a id="${anchor}"></a>\n`;
    masterDoc += `# SKILL: ${dir}\n\n`;
    masterDoc += `${content}\n\n`;
  }

  // References folder
  const refDir = path.join(fullDirPath, 'references');
  if (fs.existsSync(refDir) && fs.statSync(refDir).isDirectory()) {
    const refFiles = fs.readdirSync(refDir).filter(f => f.endsWith('.md'));
    for (const refFile of refFiles) {
      const refContent = fs.readFileSync(path.join(refDir, refFile), 'utf8');
      masterDoc += `\n### [Reference: ${dir} / ${refFile}]\n\n${refContent}\n\n`;
    }
  }

  // Assets folder docs if any
  const assetsDir = path.join(fullDirPath, 'assets');
  if (fs.existsSync(assetsDir) && fs.statSync(assetsDir).isDirectory()) {
    const assetFiles = fs.readdirSync(assetsDir).filter(f => f.endsWith('.md'));
    for (const aFile of assetFiles) {
      const aContent = fs.readFileSync(path.join(assetsDir, aFile), 'utf8');
      masterDoc += `\n### [Asset Doc: ${dir} / ${aFile}]\n\n${aContent}\n\n`;
    }
  }

  masterDoc += '\n---\n\n';
}

fs.writeFileSync('CHATGPT_GAME_SKILLS_KNOWLEDGE.md', masterDoc, 'utf8');
fs.writeFileSync('C:/Users/duuha/Downloads/CHATGPT_GAME_SKILLS_KNOWLEDGE.md', masterDoc, 'utf8');
console.log('Successfully generated CHATGPT_GAME_SKILLS_KNOWLEDGE.md');
console.log('Total length:', masterDoc.length);
