// scripts/check_all_chunks.mjs
async function check() {
  const r = await fetch('https://adenarena.vercel.app/assets/index-CzLXXpIs.js', { cache: 'no-store' });
  const txt = await r.text();
  const chunkMatches = [...txt.matchAll(/"([^"]+\.js)"/g)].map(m => m[1]).filter(s => s.startsWith('assets/'));
  console.log('Dynamic chunks found in index bundle:', [...new Set(chunkMatches)]);
  
  for (const chunk of new Set(chunkMatches)) {
    const chunkUrl = `https://adenarena.vercel.app/${chunk}`;
    const res = await fetch(chunkUrl, { cache: 'no-store' });
    console.log(`Chunk ${chunk}: status ${res.status}, length ${res.headers.get('content-length') || 'unknown'}`);
    if (res.status === 200) {
      const cTxt = await res.text();
      if (cTxt.includes('self_heal')) {
        console.log(`  -> Found self_heal in ${chunk}!`);
        console.log(`     rawType:"Recovery"?`, cTxt.includes('rawType:"Recovery"') || cTxt.includes("rawType:'Recovery'"));
        console.log(`     rawType:"Buff"?`, cTxt.includes('rawType:"Buff"') || cTxt.includes("rawType:'Buff'"));
      }
    }
  }
}
check().catch(console.error);
