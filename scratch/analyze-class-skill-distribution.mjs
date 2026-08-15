globalThis.window = globalThis;
globalThis.window.EchoData = {};
globalThis.window.GameData = {};

await import('../lineage-idle/data/echo-adapter.js');

const E = globalThis.window.EchoData;
const defs = E.SKILL_DEFS_ECHO;
const classSkills = E.CLASS_SKILLS_ECHO;

console.log('=== ANÁLISE DE DISTRIBUIÇÃO DE SKILLS POR CLASSE ===\n');

for (const [classId, skillIds] of Object.entries(classSkills)) {
  const skills = skillIds.map(id => defs[id]).filter(Boolean);
  const dmgSkills = skills.filter(s => s.type === 'active' && !s.name.toLowerCase().includes('heal') && !s.name.toLowerCase().includes('bandage') && !s.name.toLowerCase().includes('drain'));
  const buffSkills = skills.filter(s => s.type === 'buff' || s.type === 'toggle');
  const healSkills = skills.filter(s => s.type === 'heal' || s.name.toLowerCase().includes('heal') || s.name.toLowerCase().includes('drain') || s.name.toLowerCase().includes('vampir') || s.name.toLowerCase().includes('bandage') || s.name.toLowerCase().includes('regen'));
  const passiveSkills = skills.filter(s => s.type === 'passive');

  if (['warg', 'wargBase', 'wargS1', 'wargS2', 'wargS3', 'fighter', 'mage', 'raider', 'orcRaider', 'orcRider', 'vanguardRider', 'destroyer', 'titan', 'monk', 'tyrant', 'artisan', 'scavenger', 'divineTemplar', 'spiritMaster', 'assassin'].includes(classId)) {
    console.log(`[${classId}] Total: ${skills.length} (Dano: ${dmgSkills.length}, Buff: ${buffSkills.length}, Cura/Vamp: ${healSkills.length}, Passivas: ${passiveSkills.length})`);
    skills.forEach(s => console.log(`   - [${s.type}] "${s.name}" (${s.effectText || s.effect || ''})`));
    console.log('');
  }
}
