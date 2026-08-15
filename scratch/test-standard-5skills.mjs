// Teste de padronização de 5 skills por classe (2 Dano, 2 Buffs, 1 Cura/Vampirismo)

globalThis.window = globalThis;
globalThis.window.EchoData = {};
globalThis.window.GameData = {};

await import('../lineage-idle/data/echo-adapter.js');

const E = globalThis.window.EchoData;
const defs = E.SKILL_DEFS_ECHO;
const classSkills = E.CLASS_SKILLS_ECHO;

console.log('=== TESTE DO NOVO PADRÃO DE 5 SKILLS (2 DANO, 2 BUFFS, 1 CURA/VAMP) ===\n');

function isSustainSkill(s) {
  if (!s) return false;
  const name = (s.name || '').toLowerCase();
  const desc = (s.desc || s.effectText || s.effect || s.info || '').toLowerCase();
  return s.type === 'heal' || 
         name.includes('heal') || name.includes('bandage') || name.includes('drain') || 
         name.includes('vampir') || name.includes('bite') || name.includes('lifesteal') || 
         name.includes('shield') || name.includes('barrier') || name.includes('aegis') || 
         name.includes('recupera') || name.includes('absorv') || name.includes('regen') ||
         desc.includes('hp') && (desc.includes('recupera') || desc.includes('cura') || desc.includes('roubo') || desc.includes('absorve') || desc.includes('lifesteal'));
}

function isBuffSkill(s) {
  if (!s) return false;
  return (s.type === 'buff' || s.type === 'toggle' || s.type === 'passive') && !isSustainSkill(s);
}

function isDamageSkill(s) {
  if (!s) return false;
  return s.type === 'active' && !isSustainSkill(s);
}

// Curador para 5 skills por classe
function curate5SkillsForClass(classId, allClassSkillIds) {
  const skills = (allClassSkillIds || []).map(id => defs[id]).filter(Boolean);
  
  const dmgPool = skills.filter(isDamageSkill);
  const buffPool = skills.filter(isBuffSkill);
  const sustainPool = skills.filter(isSustainSkill);

  // Ordena por starRank / tier decrescente (as mais fortes primeiro)
  dmgPool.sort((a, b) => (b.starRank || b.tier || 0) - (a.starRank || a.tier || 0));
  buffPool.sort((a, b) => (b.starRank || b.tier || 0) - (a.starRank || a.tier || 0));
  sustainPool.sort((a, b) => (b.starRank || b.tier || 0) - (a.starRank || a.tier || 0));

  const chosenDmg = dmgPool.slice(0, 2);
  const chosenBuff = buffPool.slice(0, 2);
  const chosenSustain = sustainPool.slice(0, 1);

  return {
    damage: chosenDmg,
    buffs: chosenBuff,
    sustain: chosenSustain,
    all: [...chosenDmg, ...chosenBuff, ...chosenSustain]
  };
}

const sampleClasses = ['warg', 'wargBase', 'orcFighter', 'raider', 'orcRaider', 'orcRider', 'vanguardRider', 'fighter', 'mage', 'elfFighter', 'darkFighter', 'assassin', 'scavenger', 'artisan', 'divineTemplar', 'spiritMaster', 'ertheiaFighter', 'ertheiaMage'];

sampleClasses.forEach(cls => {
  const curated = curate5SkillsForClass(cls, classSkills[cls]);
  console.log(`[${cls}] Total: ${curated.all.length} | Dano (${curated.damage.length}): ${curated.damage.map(s => s.name).join(', ')} | Buffs (${curated.buffs.length}): ${curated.buffs.map(s => s.name).join(', ')} | Sustentação (${curated.sustain.length}): ${curated.sustain.map(s => s.name).join(', ')}`);
});
