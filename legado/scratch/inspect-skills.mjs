globalThis.window = globalThis;
globalThis.EchoData = {};

async function main() {
  await import('../adenarena/lineage-idle/data/echo-adapter.js');
  const { HEROIC_SKILLS } = await import('../adenarena/lineage-idle/src/data/olympiad.js');

  const echoDefs = globalThis.EchoData?.SKILL_DEFS_ECHO || {};
  const skillEntries = Object.entries(echoDefs);
  console.log('Total Echo Skills count:', skillEntries.length);

  const uniqueSkillsMap = new Map();

  for (const [id, def] of skillEntries) {
    const name = def.name || id;
    if (!uniqueSkillsMap.has(name)) {
      uniqueSkillsMap.set(name, {
        id,
        name,
        type: def.type || (def.passive ? 'passive' : 'active'),
        desc: def.desc || '',
        category: def.category || (def.type === 'buff' ? 'Buff / Suporte' : (def.type === 'magic' ? 'Magia Ofensiva' : (def.passive ? 'Passiva' : 'Ataque Físico')))
      });
    }
  }

  // Add Heroic Skills & Noblesse Blessing
  for (const [id, def] of Object.entries(HEROIC_SKILLS)) {
    uniqueSkillsMap.set(def.name, {
      id,
      name: def.name,
      type: def.type,
      desc: def.desc,
      category: 'Habilidade Heroica (Grand Olympiad)'
    });
  }

  uniqueSkillsMap.set('Blessing of Noble', {
    id: 'blessing_of_noble',
    name: 'Blessing of Noble 👑',
    type: 'buff',
    desc: 'Bênção Sagrada da Nobreza de Aden: Preserva todos os buffs ao renascer.',
    category: 'Saga de Noblesse'
  });

  console.log('Total Unique Skills in Game:', uniqueSkillsMap.size);

  const list = Array.from(uniqueSkillsMap.values());
  return list;
}

main().then(list => {
  console.log('Sample 10 skills:');
  console.log(list.slice(0, 10));
});
