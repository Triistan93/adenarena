// scripts/check_prod_identity.mjs
async function check() {
  const res = await fetch('https://adenarena.vercel.app/', { cache: 'no-store' });
  const html = await res.text();
  const scriptMatches = [...html.matchAll(/src="([^"]+)"/g)].map(m => m[1]);
  console.log('Scripts in HTML:', scriptMatches);
  
  for (const s of scriptMatches) {
    if (s.includes('assets/')) {
      const url = new URL(s, 'https://adenarena.vercel.app').href;
      const r = await fetch(url, { cache: 'no-store' });
      const txt = await r.text();
      console.log('Bundle:', s, 'Length:', txt.length);
      console.log('  has "elf_plainswalker":', txt.includes('elf_plainswalker'));
      console.log('  has "rawType:\\"Recovery\\"":', txt.includes('rawType:"Recovery"') || txt.includes("rawType:'Recovery'"));
      console.log('  has "windridererth":', txt.includes('windridererth'));
      console.log('  has "dark_elf_palus_knight":', txt.includes('dark_elf_palus_knight'));
      console.log('  has "starterSkill:\\"hellfire\\"":', txt.includes('starterSkill:"hellfire"'));
    }
  }
}
check().catch(console.error);
