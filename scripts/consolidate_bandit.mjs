import fs from 'fs';
import path from 'path';

const BASE_DIR = path.resolve('scraped_data_bandit');

function readJsonSafe(relPath) {
  const fullPath = path.join(BASE_DIR, relPath);
  if (fs.existsSync(fullPath)) {
    try {
      return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    } catch (e) {
      console.warn(`Error reading ${relPath}:`, e.message);
    }
  }
  return null;
}

export function consolidate() {
  console.log('[Consolidate] Reading all category files...');

  const craftBook = readJsonSafe('multicraft/craft_book.json') || [];
  const armorSets = readJsonSafe('multicraft/armor_sets.json') || [];
  const jewelrySets = readJsonSafe('multicraft/jewelry_sets.json') || [];

  const weapons = readJsonSafe('weapons/weapons.json') || [];
  const armors = readJsonSafe('armors/armors.json') || [];
  const accessories = readJsonSafe('accessories/accessories.json') || [];

  const shots = readJsonSafe('other/shots.json') || [];
  const resources = readJsonSafe('other/resources.json') || [];
  const classes = readJsonSafe('other/classes.json') || [];
  const skills = readJsonSafe('other/skills.json') || [];
  const locations = readJsonSafe('other/locations.json') || [];

  const bosses = readJsonSafe('npc/bosses.json') || [];
  const mammons = readJsonSafe('npc/mammons.json') || [];
  const monsters = readJsonSafe('npc/monsters.json') || [];
  const citizens = readJsonSafe('npc/citizens.json') || [];

  const masterData = {
    metadata: {
      site: 'https://l2bandit.camp/',
      scrapedAt: new Date().toISOString(),
      counts: {
        craftBook: craftBook.length,
        armorSets: armorSets.length,
        jewelrySets: jewelrySets.length,
        weapons: weapons.length,
        armors: armors.length,
        accessories: accessories.length,
        shots: shots.length,
        resources: resources.length,
        classes: classes.length,
        skills: skills.length,
        locations: locations.length,
        bosses: bosses.length,
        mammons: mammons.length,
        monsters: monsters.length,
        citizens: citizens.length,
        totalEntities: (
          craftBook.length + armorSets.length + jewelrySets.length +
          weapons.length + armors.length + accessories.length +
          shots.length + resources.length + classes.length +
          skills.length + locations.length + bosses.length +
          mammons.length + monsters.length + citizens.length
        )
      }
    },
    multicraft: {
      craftBook,
      armorSets,
      jewelrySets
    },
    weapons,
    armors,
    accessories,
    other: {
      shots,
      resources,
      classes,
      skills,
      locations
    },
    npc: {
      bosses,
      mammons,
      monsters,
      citizens
    }
  };

  const masterPath = path.join(BASE_DIR, 'l2bandit_all.json');
  fs.writeFileSync(masterPath, JSON.stringify(masterData, null, 2), 'utf8');
  console.log(`[Consolidate] Saved master dataset: ${masterPath} (${(fs.statSync(masterPath).size / (1024 * 1024)).toFixed(2)} MB)`);

  // CSV 1: Items & Equipment (Weapons, Armors, Accessories, Shots, Resources)
  const allItems = [...weapons, ...armors, ...accessories, ...shots, ...resources];
  const itemCsvHeaders = ['Category', 'Subtype', 'ID', 'Name_EN', 'Name_RU', 'Grade', 'PAtk', 'MAtk', 'PDef', 'MDef', 'Icon', 'Description_EN'];
  const itemCsvRows = [itemCsvHeaders.join(',')];
  for (const item of allItems) {
    const d = item.data || item;
    const nameEn = d.name?.en || d.name || '';
    const nameRu = d.name?.ru || '';
    const descEn = d.description?.en || '';
    const icon = d.icon || '';
    const row = [
      item.category || item.type || '',
      item.subtype || item.type || '',
      d.id || item.key || '',
      `"${nameEn.toString().replace(/"/g, '""')}"`,
      `"${nameRu.toString().replace(/"/g, '""')}"`,
      item.grade || d.grade || '',
      item.pAtk || d.pAtk || '',
      item.mAtk || d.mAtk || '',
      item.pDef || d.pDef || '',
      item.mDef || d.mDef || '',
      icon,
      `"${descEn.toString().replace(/"/g, '""').replace(/\n/g, ' ')}"`
    ];
    itemCsvRows.push(row.join(','));
  }
  fs.writeFileSync(path.join(BASE_DIR, 'l2bandit_equipment_and_items.csv'), itemCsvRows.join('\n'), 'utf8');

  // CSV 2: Craft Book
  const craftCsvHeaders = ['ID', 'Name_EN', 'Name_RU', 'Grade', 'Craft_Level', 'Type', 'Icon'];
  const craftCsvRows = [craftCsvHeaders.join(',')];
  for (const c of craftBook) {
    const d = c.data || c;
    const row = [
      c.key || d.id || '',
      `"${(d.name?.en || '').replace(/"/g, '""')}"`,
      `"${(d.name?.ru || '').replace(/"/g, '""')}"`,
      c.grade || '',
      c.craftLvl || '',
      c.type || '',
      d.icon || ''
    ];
    craftCsvRows.push(row.join(','));
  }
  fs.writeFileSync(path.join(BASE_DIR, 'l2bandit_craft_book.csv'), craftCsvRows.join('\n'), 'utf8');

  // CSV 3: Bosses & Monsters
  const allMobs = [
    ...bosses.map(b => ({ ...b, role: 'Boss' })),
    ...monsters.map(m => ({ ...m, role: 'Monster' })),
    ...citizens.map(c => ({ ...c, role: 'Citizen' }))
  ];
  const mobCsvHeaders = ['Role', 'ID', 'Name_EN', 'Name_RU', 'Level', 'Race', 'EXP', 'Icon'];
  const mobCsvRows = [mobCsvHeaders.join(',')];
  for (const m of allMobs) {
    const d = m.data || m;
    const row = [
      m.role || '',
      m.key || d.npcName || '',
      `"${(d.name?.en || '').replace(/"/g, '""')}"`,
      `"${(d.name?.ru || '').replace(/"/g, '""')}"`,
      m.level || d.level || '',
      m.race?.name?.en || '',
      m.exp || '',
      d.icon || ''
    ];
    mobCsvRows.push(row.join(','));
  }
  fs.writeFileSync(path.join(BASE_DIR, 'l2bandit_npcs_and_monsters.csv'), mobCsvRows.join('\n'), 'utf8');

  // CSV 4: Skills
  const skillCsvHeaders = ['ID', 'Name_EN', 'Name_RU', 'Type', 'Levels', 'Icon'];
  const skillCsvRows = [skillCsvHeaders.join(',')];
  for (const s of skills) {
    const d = s.data || s;
    const row = [
      s.key || d.unitName || '',
      `"${(d.name?.en || '').replace(/"/g, '""')}"`,
      `"${(d.name?.ru || '').replace(/"/g, '""')}"`,
      s.type || '',
      s.levels || '',
      d.icon || ''
    ];
    skillCsvRows.push(row.join(','));
  }
  fs.writeFileSync(path.join(BASE_DIR, 'l2bandit_skills.csv'), skillCsvRows.join('\n'), 'utf8');

  console.log('[Consolidate] Generated 4 CSV spreadsheets.');

  // Build Interactive Catalog: index.html
  buildHtmlCatalog(masterData);

  // Build README.md
  buildReadme(masterData);

  console.log('[Consolidate] All tasks completed successfully!');
}

function buildReadme(master) {
  const c = master.metadata.counts;
  const md = `# L2Bandit.camp - Base de Dados Scrapeada

Base de dados completa extraída de [L2Bandit.camp](https://l2bandit.camp/).

## Resumo dos Dados Coletados

| Categoria | Subcategoria / Seção | Quantidade de Registros |
| :--- | :--- | :--- |
| **Multicraft** | Craft Book (Receitas) | **${c.craftBook}** |
| | Armor Sets (Conjuntos de Armadura) | **${c.armorSets}** |
| | Jewelry Sets (Conjuntos de Joias) | **${c.jewelrySets}** |
| **Weapons** | Daggers, Swords, Bows, Blunts, Spears, Fists, Magic, Duals (11 subtipos) | **${c.weapons}** |
| **Armors** | Heavy, Light, Magic, Gloves, Boots, Helmets, Shields, Sigils (8 subtipos) | **${c.armors}** |
| **Accessories** | Necklaces, Earrings, Rings | **${c.accessories}** |
| **Other** | Shots & Resources | **${c.shots + c.resources}** |
| | Classes (Árvores de Evolução) | **${c.classes}** |
| | Skills (Habilidades Ativas e Passivas) | **${c.skills}** |
| | Locations (Territórios & Zonas) | **${c.locations}** |
| **NPC** | Bosses (Chefes de Raide) | **${c.bosses}** |
| | Mammons (Merchant & Blacksmith) | **${c.mammons}** |
| | Monsters (Monstros do Mundo) | **${c.monsters}** |
| | Citizens (NPCs de Cidades) | **${c.citizens}** |
| **TOTAL GERAL** | **Todas as Categorias** | **${c.totalEntities}** |

---

## Estrutura dos Arquivos

- \`images/\`: Diretório com todos os ícones em formato WebP baixados localmente.
- \`multicraft/\`: \`craft_book.json\`, \`armor_sets.json\`, \`jewelry_sets.json\`.
- \`weapons/\`: \`weapons.json\` e arquivos individuais por tipo de arma.
- \`armors/\`: \`armors.json\` e arquivos individuais por tipo de armadura.
- \`accessories/\`: \`accessories.json\` e arquivos individuais por tipo de joia.
- \`other/\`: \`shots.json\`, \`resources.json\`, \`classes.json\`, \`skills.json\`, \`locations.json\`.
- \`npc/\`: \`bosses.json\`, \`mammons.json\`, \`monsters.json\`, \`citizens.json\`.
- \`l2bandit_all.json\`: Arquivo master consolidado.
- Planilhas CSV:
  - \`l2bandit_equipment_and_items.csv\`
  - \`l2bandit_craft_book.csv\`
  - \`l2bandit_npcs_and_monsters.csv\`
  - \`l2bandit_skills.csv\`
- \`index.html\`: Catálogo interativo para pesquisa e visualização no navegador.
`;
  fs.writeFileSync(path.join(BASE_DIR, 'README.md'), md, 'utf8');
}

function buildHtmlCatalog(master) {
  const c = master.metadata.counts;
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>L2Bandit.camp - Base de Dados Completa</title>
  <style>
    :root {
      --bg: #0b0f19;
      --card-bg: #111827;
      --border: #1f2937;
      --accent: #f59e0b;
      --accent-hover: #d97706;
      --text: #f3f4f6;
      --text-muted: #9ca3af;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    body { background: var(--bg); color: var(--text); padding: 20px; }
    header { max-width: 1300px; margin: 0 auto 20px auto; text-align: center; }
    h1 { color: var(--accent); margin-bottom: 6px; font-size: 2.2rem; }
    .subtitle { color: var(--text-muted); font-size: 0.95rem; margin-bottom: 16px; }

    .stats-bar { max-width: 1300px; margin: 0 auto 20px auto; background: var(--card-bg); border: 1px solid var(--border); border-radius: 10px; padding: 14px 20px; display: flex; flex-wrap: wrap; justify-content: space-around; gap: 12px; font-size: 0.85rem; text-align: center; }
    .stat-item span { display: block; color: var(--accent); font-weight: bold; font-size: 1.1rem; margin-bottom: 2px; }

    .nav-tabs { max-width: 1300px; margin: 0 auto 20px auto; display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
    .tab-btn { background: var(--card-bg); border: 1px solid var(--border); color: var(--text); padding: 8px 14px; border-radius: 8px; cursor: pointer; font-size: 0.85rem; transition: all 0.2s; font-weight: 500; }
    .tab-btn.active, .tab-btn:hover { background: var(--accent); color: #000; font-weight: bold; border-color: var(--accent); }

    .search-container { max-width: 600px; margin: 0 auto 24px auto; text-align: center; }
    input#search { width: 100%; background: var(--card-bg); border: 1px solid var(--border); color: #fff; padding: 12px 18px; border-radius: 8px; font-size: 1rem; outline: none; }
    input#search:focus { border-color: var(--accent); }

    .grid { max-width: 1300px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
    .card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 10px; padding: 16px; display: flex; gap: 14px; align-items: flex-start; transition: transform 0.2s, border-color 0.2s; }
    .card:hover { border-color: var(--accent); transform: translateY(-2px); }
    .card-icon { width: 44px; height: 44px; border-radius: 6px; background: #050811; border: 1px solid #374151; flex-shrink: 0; object-fit: contain; }
    .card-body { flex: 1; min-width: 0; }
    .card-title { font-size: 0.95rem; font-weight: 600; color: #fff; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .card-subtitle { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 6px; }
    .card-badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; font-weight: bold; background: #374151; color: #e5e7eb; margin-right: 6px; }
    .card-badge.grade-s { background: #b91c1c; }
    .card-badge.grade-a { background: #c2410c; }
    .card-badge.grade-b { background: #b45309; }
    .card-badge.grade-c { background: #15803d; }
    .card-badge.grade-d { background: #0369a1; }
    .card-desc { font-size: 0.75rem; color: #9ca3af; margin-top: 6px; line-height: 1.3; max-height: 48px; overflow: hidden; text-overflow: ellipsis; }
    
    .loading-msg { text-align: center; color: var(--text-muted); padding: 40px; font-size: 1.1rem; }
  </style>
</head>
<body>
  <header>
    <h1>L2Bandit.camp Database</h1>
    <p class="subtitle">Base de dados completa offline extraída de <strong>L2Bandit.camp</strong> com busca em tempo real e ícones locais.</p>
  </header>

  <div class="stats-bar">
    <div class="stat-item"><span>${c.totalEntities}</span>Total Registros</div>
    <div class="stat-item"><span>${c.weapons}</span>Armas</div>
    <div class="stat-item"><span>${c.armors}</span>Armaduras</div>
    <div class="stat-item"><span>${c.armorSets + c.jewelrySets}</span>Sets</div>
    <div class="stat-item"><span>${c.craftBook}</span>Crafts</div>
    <div class="stat-item"><span>${c.skills}</span>Skills</div>
    <div class="stat-item"><span>${c.bosses}</span>Bosses</div>
    <div class="stat-item"><span>${c.monsters}</span>Monstros</div>
  </div>

  <div class="nav-tabs" id="category-tabs">
    <button class="tab-btn active" onclick="switchCategory('weapons', this)">Weapons (${c.weapons})</button>
    <button class="tab-btn" onclick="switchCategory('armors', this)">Armors (${c.armors})</button>
    <button class="tab-btn" onclick="switchCategory('armorSets', this)">Armor Sets (${c.armorSets})</button>
    <button class="tab-btn" onclick="switchCategory('jewelrySets', this)">Jewelry Sets (${c.jewelrySets})</button>
    <button class="tab-btn" onclick="switchCategory('accessories', this)">Accessories (${c.accessories})</button>
    <button class="tab-btn" onclick="switchCategory('craftBook', this)">Craft Book (${c.craftBook})</button>
    <button class="tab-btn" onclick="switchCategory('skills', this)">Skills (${c.skills})</button>
    <button class="tab-btn" onclick="switchCategory('bosses', this)">Bosses (${c.bosses})</button>
    <button class="tab-btn" onclick="switchCategory('monsters', this)">Monsters (${c.monsters})</button>
    <button class="tab-btn" onclick="switchCategory('citizens', this)">Citizens (${c.citizens})</button>
    <button class="tab-btn" onclick="switchCategory('shots', this)">Shots (${c.shots})</button>
    <button class="tab-btn" onclick="switchCategory('resources', this)">Resources (${c.resources})</button>
    <button class="tab-btn" onclick="switchCategory('classes', this)">Classes (${c.classes})</button>
    <button class="tab-btn" onclick="switchCategory('locations', this)">Locations (${c.locations})</button>
  </div>

  <div class="search-container">
    <input type="text" id="search" placeholder="Pesquisar por nome (EN / RU) ou tipo..." oninput="filterCurrent()" />
  </div>

  <div class="grid" id="items-grid">
    <div class="loading-msg">Carregando dados...</div>
  </div>

  <script>
    let currentCategory = 'weapons';
    let loadedData = null;

    async function init() {
      const res = await fetch('l2bandit_all.json');
      loadedData = await res.json();
      renderCategory();
    }

    function switchCategory(cat, btn) {
      currentCategory = cat;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('search').value = '';
      renderCategory();
    }

    function getCategoryList() {
      if (!loadedData) return [];
      switch (currentCategory) {
        case 'weapons': return loadedData.weapons || [];
        case 'armors': return loadedData.armors || [];
        case 'armorSets': return loadedData.multicraft.armorSets || [];
        case 'jewelrySets': return loadedData.multicraft.jewelrySets || [];
        case 'accessories': return loadedData.accessories || [];
        case 'craftBook': return loadedData.multicraft.craftBook || [];
        case 'skills': return loadedData.other.skills || [];
        case 'bosses': return loadedData.npc.bosses || [];
        case 'monsters': return loadedData.npc.monsters || [];
        case 'citizens': return loadedData.npc.citizens || [];
        case 'shots': return loadedData.other.shots || [];
        case 'resources': return loadedData.other.resources || [];
        case 'classes': return loadedData.other.classes || [];
        case 'locations': return loadedData.other.locations || [];
        default: return [];
      }
    }

    function renderCategory() {
      const list = getCategoryList();
      const q = document.getElementById('search').value.toLowerCase().trim();
      const grid = document.getElementById('items-grid');

      const filtered = list.filter(item => {
        if (!q) return true;
        const d = item.data || item;
        const nameEn = (d.name?.en || d.name || '').toLowerCase();
        const nameRu = (d.name?.ru || '').toLowerCase();
        const type = (item.type || item.subtype || '').toLowerCase();
        return nameEn.includes(q) || nameRu.includes(q) || type.includes(q);
      });

      if (filtered.length === 0) {
        grid.innerHTML = '<div class="loading-msg">Nenhum item encontrado.</div>';
        return;
      }

      // Render first 200 items for snappy performance
      const toRender = filtered.slice(0, 200);
      grid.innerHTML = toRender.map(item => {
        const d = item.data || item;
        const nameEn = d.name?.en || d.name || 'Item';
        const nameRu = d.name?.ru || '';
        let iconName = d.icon || d.helmet || d.necklace || '';
        if (iconName.startsWith('/')) iconName = iconName.replace(/^\\//, '');
        const iconSrc = iconName ? 'images/' + iconName : '';

        const grade = item.grade || d.grade || '';
        const gradeClass = grade ? 'grade-' + grade.toLowerCase() : '';
        const type = item.subtype || item.type || '';
        const desc = d.description?.en || d.description?.ru || '';

        return \`
          <div class="card">
            \${iconSrc ? \`<img class="card-icon" src="\${iconSrc}" alt="\${nameEn}" onerror="this.style.opacity=0.3" />\` : '<div class="card-icon"></div>'}
            <div class="card-body">
              <div class="card-title" title="\${nameEn}">\${nameEn}</div>
              \${nameRu ? \`<div class="card-subtitle">\${nameRu}</div>\` : ''}
              <div>
                \${grade ? \`<span class="card-badge \${gradeClass}">Grade \${grade}</span>\` : ''}
                \${type ? \`<span class="card-badge">\${type}</span>\` : ''}
                \${item.level ? \`<span class="card-badge">Lv \${item.level}</span>\` : ''}
              </div>
              \${desc ? \`<div class="card-desc" title="\${desc}">\${desc}</div>\` : ''}
            </div>
          </div>
        \`;
      }).join('');
    }

    function filterCurrent() {
      renderCategory();
    }

    window.onload = init;
  </script>
</body>
</html>`;
  fs.writeFileSync(path.join(BASE_DIR, 'index.html'), html, 'utf8');
}

if (process.argv[1]?.includes('consolidate_bandit')) {
  consolidate();
}
