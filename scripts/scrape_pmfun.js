import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';

const TARGET_URL = 'https://lineage.pmfun.com/list/set';
const BASE_URL = 'https://lineage.pmfun.com';
const LOCAL_FALLBACK = 'C:/Users/duuha/.gemini/antigravity/brain/fdc89cbf-4301-4c21-95a1-d6d41c47208a/.system_generated/steps/2/content.md';

const OUTPUT_DIR = path.resolve('scraped_data');
const IMAGES_DIR = path.join(OUTPUT_DIR, 'images');

// Ensure directories exist
fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.mkdirSync(IMAGES_DIR, { recursive: true });

function cleanText(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

function parseBonuses(tdHtml, preserveMdLinks = true) {
  const $ = cheerio.load(`<div>${tdHtml || ''}</div>`);
  if (preserveMdLinks) {
    $('a').each((_, a) => {
      let href = $(a).attr('href') || '';
      if (href && !href.startsWith('http')) {
        href = `${BASE_URL}/${href.replace(/^\/+/, '')}`;
      }
      const text = cleanText($(a).text());
      if (href && text) {
        $(a).replaceWith(`[${text}](${href})`);
      }
    });
  }
  const bonuses = [];
  const lis = $('li');
  if (lis.length > 0) {
    lis.each((_, li) => {
      const t = cleanText($(li).text());
      if (t) bonuses.push(t);
    });
  } else {
    $('br').replaceWith('|||');
    $('p').after('|||');
    const parts = $('body').text().split('|||');
    for (let p of parts) {
      const t = cleanText(p);
      if (t) bonuses.push(t);
    }
  }
  return bonuses;
}

function parsePart(td, $) {
  const imgEl = td.find('img');
  let imgSrc = imgEl.attr('src') || '';
  if (imgSrc && !imgSrc.startsWith('http')) {
    imgSrc = `${BASE_URL}/${imgSrc.replace(/^\/+/, '')}`;
  }
  const imgAlt = imgEl.attr('alt') || imgEl.attr('title') || '';
  
  const linkEl = td.find('a').first();
  let href = linkEl.attr('href') || '';
  if (href && !href.startsWith('http')) {
    href = `${BASE_URL}/${href.replace(/^\/+/, '')}`;
  }
  
  let name = cleanText(linkEl.text()) || imgAlt || cleanText(td.text());
  const imageFileName = imgSrc ? path.basename(imgSrc) : '';

  return {
    name,
    url: href,
    imageUrl: imgSrc,
    imageFileName,
    localImagePath: imageFileName ? `images/${imageFileName}` : ''
  };
}

function parseSetName(td) {
  const clone = td.clone();
  clone.find('br').replaceWith('\n');
  const lines = clone.text().split('\n').map(l => cleanText(l)).filter(Boolean);
  return {
    rawLines: lines,
    fullName: lines.join(' ')
  };
}

async function fetchHtml() {
  console.log(`[1/4] Fetching HTML from ${TARGET_URL}...`);
  try {
    const res = await fetch(TARGET_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    if (res.ok) {
      const text = await res.text();
      console.log(`  Fetched live HTML successfully (${text.length} characters)`);
      return text;
    }
    throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
  } catch (err) {
    console.warn(`  Live fetch failed (${err.message}). Using local fallback...`);
    if (fs.existsSync(LOCAL_FALLBACK)) {
      return fs.readFileSync(LOCAL_FALLBACK, 'utf8');
    }
    throw err;
  }
}

async function downloadImages(imageUrls) {
  console.log(`[3/4] Downloading ${imageUrls.size} unique images...`);
  const queue = Array.from(imageUrls);
  let downloadedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  const CONCURRENCY = 10;
  async function worker() {
    while (queue.length > 0) {
      const url = queue.shift();
      if (!url) continue;
      const fileName = path.basename(url);
      const destPath = path.join(IMAGES_DIR, fileName);

      if (fs.existsSync(destPath) && fs.statSync(destPath).size > 0) {
        skippedCount++;
        continue;
      }

      try {
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
          }
        });
        if (res.ok) {
          const buf = Buffer.from(await res.arrayBuffer());
          fs.writeFileSync(destPath, buf);
          downloadedCount++;
        } else {
          console.warn(`  Failed to download ${url}: HTTP ${res.status}`);
          errorCount++;
        }
      } catch (e) {
        console.warn(`  Error downloading ${url}: ${e.message}`);
        errorCount++;
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
  console.log(`  Images downloaded: ${downloadedCount}, skipped (cached): ${skippedCount}, errors: ${errorCount}`);
}

function buildHtmlCatalog(gradesData, plus6Bonuses, totalSets, totalImages) {
  let cardsHtml = '';
  for (const g of gradesData) {
    const gradeClass = g.grade.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    for (const s of g.sets) {
      let partsListHtml = '';
      for (const p of s.parts) {
        let statsParts = [];
        if (p.sealedPdef) statsParts.push(`Sealed P.Def: ${p.sealedPdef}`);
        if (p.unsealedPdef) statsParts.push(`Unsealed: ${p.unsealedPdef}`);
        if (p.unsealFee) statsParts.push(`Fee: ${p.unsealFee}`);
        if (p.sealedVariant) statsParts.push(`Selado: ${p.sealedVariant.name}`);
        const statsStr = statsParts.length ? `<div class="part-stats">${statsParts.join(' | ')}</div>` : '';

        partsListHtml += `
          <div class="part-item">
            <img class="part-img" src="${p.localImagePath}" alt="${p.name}" loading="lazy" />
            <div class="part-info">
              <a class="part-name" href="${p.url}" target="_blank" title="${p.name}">${p.name}</a>
              ${statsStr}
            </div>
          </div>`;
      }

      let bonusItemsHtml = '';
      for (const b of s.bonusesMd) {
        const renderedBonus = b.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
        bonusItemsHtml += `<li>${renderedBonus}</li>`;
      }

      cardsHtml += `
        <div class="card" data-grade="${g.grade}" data-name="${s.setName.toLowerCase()}" data-bonuses="${s.bonuses.join(' ').toLowerCase()}">
          <div class="card-header">
            <div class="card-title">${s.setName}</div>
            <span class="card-grade ${gradeClass}">${g.grade}</span>
          </div>
          <div class="card-type">${s.type || 'Armor Set'}</div>
          
          <div class="bonuses-section">
            <div class="bonuses-title">Bônus do Set</div>
            <ul class="bonuses-list">
              ${bonusItemsHtml || '<li>Nenhum bônus listado</li>'}
            </ul>
          </div>

          <div class="parts-section">
            <div class="parts-title">Partes (${s.parts.length})</div>
            <div class="parts-list">
              ${partsListHtml}
            </div>
          </div>
        </div>`;
    }
  }

  let plus6Rows = '';
  for (const b of plus6Bonuses) {
    plus6Rows += `
      <tr>
        <td><strong>${b.grade}</strong></td>
        <td>${b.heavyArmor}</td>
        <td>${b.lightArmor}</td>
        <td>${b.robes}</td>
      </tr>`;
  }

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Lineage 2 Armor Sets - Base de Dados Scrapeada</title>
  <style>
    :root {
      --bg: #0d141e;
      --card-bg: #141f2e;
      --border: #22344a;
      --accent: #e5a93b;
      --text: #e2e8f0;
      --text-muted: #94a3b8;
      --tag-bg: #1e293b;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    body { background-color: var(--bg); color: var(--text); padding: 24px; line-height: 1.5; }
    header { max-width: 1200px; margin: 0 auto 24px auto; text-align: center; }
    h1 { color: var(--accent); margin-bottom: 8px; font-size: 2.2rem; }
    .subtitle { color: var(--text-muted); font-size: 0.95rem; margin-bottom: 16px; }
    .controls { max-width: 1200px; margin: 0 auto 24px auto; display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; align-items: center; }
    input[type="text"] { background: var(--card-bg); border: 1px solid var(--border); color: #fff; padding: 10px 16px; border-radius: 8px; width: 320px; font-size: 0.95rem; outline: none; }
    input[type="text"]:focus { border-color: var(--accent); }
    .filter-btn { background: var(--card-bg); border: 1px solid var(--border); color: var(--text); padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 0.85rem; transition: all 0.2s; }
    .filter-btn.active, .filter-btn:hover { background: var(--accent); color: #000; font-weight: bold; border-color: var(--accent); }
    
    .stats-bar { max-width: 1200px; margin: 0 auto 24px auto; background: var(--card-bg); border: 1px solid var(--border); border-radius: 8px; padding: 12px 20px; display: flex; justify-content: space-around; text-align: center; font-size: 0.9rem; }
    .stats-bar span { color: var(--accent); font-weight: bold; }

    .grid { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 20px; }
    .card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px; padding: 20px; display: flex; flex-direction: column; transition: transform 0.2s, border-color 0.2s; }
    .card:hover { border-color: var(--accent); transform: translateY(-3px); }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; border-bottom: 1px solid var(--border); padding-bottom: 10px; }
    .card-title { font-size: 1.15rem; color: #fff; font-weight: 700; }
    .card-grade { background: #b45309; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; text-transform: uppercase; }
    .card-grade.s-grade { background: #b91c1c; }
    .card-grade.a-grade { background: #c2410c; }
    .card-grade.b-grade { background: #b45309; }
    .card-grade.c-grade { background: #15803d; }
    .card-grade.d-grade { background: #0369a1; }
    .card-grade.no-grade { background: #475569; }

    .card-type { font-size: 0.8rem; color: var(--accent); margin-bottom: 12px; font-weight: 600; text-transform: uppercase; }
    
    .bonuses-section { background: rgba(0,0,0,0.25); border-radius: 8px; padding: 12px; margin-bottom: 16px; border-left: 3px solid var(--accent); }
    .bonuses-title { font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 6px; font-weight: bold; }
    .bonuses-list { list-style: none; font-size: 0.85rem; color: #cbd5e1; }
    .bonuses-list li { margin-bottom: 4px; position: relative; padding-left: 14px; }
    .bonuses-list li::before { content: '•'; color: var(--accent); position: absolute; left: 0; font-size: 1rem; line-height: 1; }
    .bonuses-list a { color: #38bdf8; text-decoration: none; }
    .bonuses-list a:hover { text-decoration: underline; }

    .parts-section { margin-top: auto; }
    .parts-title { font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px; font-weight: bold; }
    .parts-list { display: flex; flex-direction: column; gap: 8px; }
    .part-item { display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); padding: 6px 10px; border-radius: 6px; }
    .part-img { width: 32px; height: 32px; border-radius: 4px; background: #0b1118; border: 1px solid #334155; flex-shrink: 0; }
    .part-info { flex: 1; min-width: 0; }
    .part-name { font-size: 0.85rem; font-weight: 500; color: #f1f5f9; text-decoration: none; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .part-name:hover { color: var(--accent); }
    .part-stats { font-size: 0.75rem; color: var(--text-muted); }

    .plus6-section { max-width: 1200px; margin: 40px auto; background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px; padding: 24px; }
    .plus6-section h2 { color: var(--accent); margin-bottom: 16px; text-align: center; }
    table.plus6-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
    table.plus6-table th, table.plus6-table td { padding: 12px; text-align: left; border-bottom: 1px solid var(--border); }
    table.plus6-table th { background: rgba(0,0,0,0.3); color: var(--accent); }
  </style>
</head>
<body>
  <header>
    <h1>Lineage 2 Armor Sets Database</h1>
    <p class="subtitle">Base de dados completa scrapeada de <strong>PMfun.com</strong> com imagens locais, estatísticas e efeitos de set.</p>
  </header>

  <div class="stats-bar">
    <div>Sets Extraídos: <span id="stat-sets">${totalSets}</span></div>
    <div>Grades: <span>S, A, B, C, D, No Grade</span></div>
    <div>Ícones Baixados: <span>${totalImages}</span></div>
    <div>Origem: <span>PMfun (C1 - High Five)</span></div>
  </div>

  <div class="controls">
    <input type="text" id="search" placeholder="Pesquisar por nome do set, parte ou bônus..." oninput="filterCards()" />
    <button class="filter-btn active" onclick="setFilter('ALL', this)">Todos</button>
    <button class="filter-btn" onclick="setFilter('S Grade', this)">S Grade</button>
    <button class="filter-btn" onclick="setFilter('A Grade', this)">A Grade</button>
    <button class="filter-btn" onclick="setFilter('B Grade', this)">B Grade</button>
    <button class="filter-btn" onclick="setFilter('C Grade', this)">C Grade</button>
    <button class="filter-btn" onclick="setFilter('D Grade', this)">D Grade</button>
    <button class="filter-btn" onclick="setFilter('No Grade', this)">No Grade</button>
  </div>

  <div class="grid" id="sets-grid">
    ${cardsHtml}
  </div>

  <div class="plus6-section">
    <h2>+6 Armor Bonuses</h2>
    <table class="plus6-table">
      <thead>
        <tr>
          <th>Grade</th>
          <th>Heavy Armor</th>
          <th>Light Armor</th>
          <th>Robes</th>
        </tr>
      </thead>
      <tbody>
        ${plus6Rows}
      </tbody>
    </table>
  </div>

  <script>
    let currentFilter = 'ALL';

    function setFilter(grade, btn) {
      currentFilter = grade;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterCards();
    }

    function filterCards() {
      const q = document.getElementById('search').value.toLowerCase().trim();
      const cards = document.querySelectorAll('.card');
      let visibleCount = 0;

      cards.forEach(card => {
        const grade = card.getAttribute('data-grade');
        const name = card.getAttribute('data-name');
        const bonuses = card.getAttribute('data-bonuses');

        const matchesGrade = currentFilter === 'ALL' || grade.includes(currentFilter);
        const matchesQuery = !q || name.includes(q) || bonuses.includes(q);

        if (matchesGrade && matchesQuery) {
          card.style.display = 'flex';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      document.getElementById('stat-sets').innerText = visibleCount;
    }
  </script>
</body>
</html>`;
}

async function main() {
  const html = await fetchHtml();
  const $ = cheerio.load(html);

  console.log(`[2/4] Parsing tables, sets, parts, and bonuses...`);

  const tables = $('table.show_list');
  const gradesData = [];
  const imageUrlsToDownload = new Set();
  const plus6Bonuses = [];

  tables.each((tableIdx, tableEl) => {
    const table = $(tableEl);
    let gradeTitle = cleanText(table.find('h4').text());
    if (!gradeTitle) {
      gradeTitle = cleanText(table.find('tr').first().find('td').first().text());
    }

    if (tableIdx === 6) {
      // Table 6: +6 Armor Bonuses
      const rows = table.find('tr');
      for (let r = 1; r < rows.length; r++) {
        const tds = rows.eq(r).find('td');
        if (tds.length >= 4) {
          plus6Bonuses.push({
            grade: cleanText(tds.eq(0).text()),
            heavyArmor: cleanText(tds.eq(1).text()),
            lightArmor: cleanText(tds.eq(2).text()),
            robes: cleanText(tds.eq(3).text())
          });
        }
      }
      return;
    }

    const rows = table.find('tr');
    const headerRow = rows.first();
    const headers = headerRow.find('td').map((_, td) => cleanText($(td).text())).get();

    const sets = [];
    let currentSet = null;

    for (let r = 1; r < rows.length; r++) {
      const row = rows.eq(r);
      const tds = row.find('td');

      if (tableIdx === 0) {
        // S Grade
        if (tds.length >= 6) {
          const nameParsed = parseSetName(tds.eq(0));
          const bonusesMd = parseBonuses(tds.eq(5).html(), true);
          const bonusesRaw = parseBonuses(tds.eq(5).html(), false);
          const part = parsePart(tds.eq(1), $);
          part.sealedPdef = cleanText(tds.eq(2).text());
          part.unsealedPdef = cleanText(tds.eq(3).text());
          part.unsealFee = cleanText(tds.eq(4).text());
          if (part.imageUrl) imageUrlsToDownload.add(part.imageUrl);

          let setType = 'Other';
          if (nameParsed.fullName.toLowerCase().includes('heavy')) setType = 'Heavy Armor Set';
          else if (nameParsed.fullName.toLowerCase().includes('light')) setType = 'Light Armor Set';
          else if (nameParsed.fullName.toLowerCase().includes('robe')) setType = 'Robe Set';
          else if (nameParsed.fullName.toLowerCase().includes('jewelry')) setType = 'Jewelry Set';

          currentSet = {
            grade: gradeTitle,
            setName: nameParsed.fullName,
            rawNameLines: nameParsed.rawLines,
            type: setType,
            bonuses: bonusesRaw,
            bonusesMd: bonusesMd,
            parts: [part]
          };
          sets.push(currentSet);
        } else if (tds.length >= 4 && currentSet) {
          const part = parsePart(tds.eq(0), $);
          part.sealedPdef = cleanText(tds.eq(1).text());
          part.unsealedPdef = cleanText(tds.eq(2).text());
          part.unsealFee = cleanText(tds.eq(3).text());
          if (part.imageUrl) imageUrlsToDownload.add(part.imageUrl);
          currentSet.parts.push(part);
        }
      } else if (tableIdx === 1) {
        // A Grade
        if (tds.length >= 4) {
          const nameParsed = parseSetName(tds.eq(0));
          const bonusesMd = parseBonuses(tds.eq(3).html(), true);
          const bonusesRaw = parseBonuses(tds.eq(3).html(), false);
          const part = parsePart(tds.eq(1), $);
          const unsealedPart = parsePart(tds.eq(2), $);
          part.sealedVariant = unsealedPart;
          if (part.imageUrl) imageUrlsToDownload.add(part.imageUrl);
          if (unsealedPart.imageUrl) imageUrlsToDownload.add(unsealedPart.imageUrl);

          let setType = 'Other';
          if (nameParsed.fullName.toLowerCase().includes('heavy')) setType = 'Heavy Armor Set';
          else if (nameParsed.fullName.toLowerCase().includes('light')) setType = 'Light Armor Set';
          else if (nameParsed.fullName.toLowerCase().includes('robe')) setType = 'Robe Set';

          currentSet = {
            grade: gradeTitle,
            setName: nameParsed.fullName,
            rawNameLines: nameParsed.rawLines,
            type: setType,
            bonuses: bonusesRaw,
            bonusesMd: bonusesMd,
            parts: [part]
          };
          sets.push(currentSet);
        } else if (tds.length >= 2 && currentSet) {
          const part = parsePart(tds.eq(0), $);
          const unsealedPart = parsePart(tds.eq(1), $);
          part.sealedVariant = unsealedPart;
          if (part.imageUrl) imageUrlsToDownload.add(part.imageUrl);
          if (unsealedPart.imageUrl) imageUrlsToDownload.add(unsealedPart.imageUrl);
          currentSet.parts.push(part);
        }
      } else if (tableIdx === 2) {
        // B Grade
        if (tds.length >= 4) {
          const nameParsed = parseSetName(tds.eq(0));
          const type = cleanText(tds.eq(2).text());
          const bonusesMd = parseBonuses(tds.eq(3).html(), true);
          const bonusesRaw = parseBonuses(tds.eq(3).html(), false);
          const part = parsePart(tds.eq(1), $);
          if (part.imageUrl) imageUrlsToDownload.add(part.imageUrl);

          currentSet = {
            grade: gradeTitle,
            setName: nameParsed.fullName,
            rawNameLines: nameParsed.rawLines,
            type: type || 'Armor Set',
            bonuses: bonusesRaw,
            bonusesMd: bonusesMd,
            parts: [part]
          };
          sets.push(currentSet);
        } else if (tds.length >= 1 && currentSet) {
          const part = parsePart(tds.eq(0), $);
          if (part.imageUrl) imageUrlsToDownload.add(part.imageUrl);
          currentSet.parts.push(part);
        }
      } else if (tableIdx >= 3 && tableIdx <= 5) {
        // C, D, No Grade
        if (tds.length >= 6) {
          const nameParsed = parseSetName(tds.eq(0));
          const type = cleanText(tds.eq(2).text());
          const bonusesMd = parseBonuses(tds.eq(3).html(), true);
          const bonusesRaw = parseBonuses(tds.eq(3).html(), false);
          const physicalDefense = cleanText(tds.eq(4).text());
          const mpBoost = cleanText(tds.eq(5).text());
          const part = parsePart(tds.eq(1), $);
          if (part.imageUrl) imageUrlsToDownload.add(part.imageUrl);

          currentSet = {
            grade: gradeTitle,
            setName: nameParsed.fullName,
            rawNameLines: nameParsed.rawLines,
            type: type || 'Armor Set',
            physicalDefense,
            mpBoost,
            bonuses: bonusesRaw,
            bonusesMd: bonusesMd,
            parts: [part]
          };
          sets.push(currentSet);
        } else if (tds.length >= 1 && currentSet) {
          const part = parsePart(tds.eq(0), $);
          if (part.imageUrl) imageUrlsToDownload.add(part.imageUrl);
          currentSet.parts.push(part);
        }
      }
    }

    gradesData.push({
      grade: gradeTitle,
      headers,
      sets
    });
  });

  // Download images
  await downloadImages(imageUrlsToDownload);

  console.log(`[4/4] Writing output files...`);

  const totalSets = gradesData.reduce((acc, g) => acc + g.sets.length, 0);

  // 1. JSON output
  const fullJson = {
    metadata: {
      source: TARGET_URL,
      scrapedAt: new Date().toISOString(),
      totalGrades: gradesData.length,
      totalSets,
      totalImages: imageUrlsToDownload.size
    },
    grades: gradesData,
    plus6ArmorBonuses: plus6Bonuses
  };

  fs.writeFileSync(path.join(OUTPUT_DIR, 'armor_sets.json'), JSON.stringify(fullJson, null, 2), 'utf8');
  console.log(`  Saved: scraped_data/armor_sets.json`);

  fs.writeFileSync(path.join(OUTPUT_DIR, 'plus6_bonuses.json'), JSON.stringify(plus6Bonuses, null, 2), 'utf8');
  console.log(`  Saved: scraped_data/plus6_bonuses.json`);

  // 2. CSV output
  const csvRows = [
    [
      'Grade',
      'Set Name',
      'Set Type',
      'Part Name',
      'Part URL',
      'Image File',
      'Local Image Path',
      'Sealed PDef',
      'Unsealed PDef',
      'Unseal Fee',
      'Physical Defense',
      'MP Boost',
      'Sealed Variant Name',
      'Sealed Variant URL',
      'Set Bonuses'
    ].map(v => `"${v}"`).join(',')
  ];

  for (const gradeObj of gradesData) {
    for (const set of gradeObj.sets) {
      const bonusesStr = set.bonuses.join(' | ');
      for (const part of set.parts) {
        const row = [
          gradeObj.grade,
          set.setName,
          set.type || '',
          part.name,
          part.url,
          part.imageFileName,
          part.localImagePath,
          part.sealedPdef || '',
          part.unsealedPdef || '',
          part.unsealFee || '',
          set.physicalDefense || '',
          set.mpBoost || '',
          part.sealedVariant ? part.sealedVariant.name : '',
          part.sealedVariant ? part.sealedVariant.url : '',
          bonusesStr
        ];
        csvRows.push(row.map(val => `"${(val || '').toString().replace(/"/g, '""')}"`).join(','));
      }
    }
  }

  fs.writeFileSync(path.join(OUTPUT_DIR, 'armor_sets.csv'), csvRows.join('\n'), 'utf8');
  console.log(`  Saved: scraped_data/armor_sets.csv`);

  // 3. Exact user example text format: armor_sets_example_format.txt
  let exampleTextLines = [];

  for (const gradeObj of gradesData) {
    exampleTextLines.push(`================================================================================`);
    exampleTextLines.push(gradeObj.grade.toUpperCase());
    exampleTextLines.push(`================================================================================`);

    for (const set of gradeObj.sets) {
      for (const h of gradeObj.headers) {
        exampleTextLines.push(h);
      }
      
      // If rawNameLines has 2 parts, print them on separate lines (e.g. Imperial Crusader \n Heavy Armor Set)
      if (set.rawNameLines && set.rawNameLines.length > 1) {
        for (const line of set.rawNameLines) {
          exampleTextLines.push(line);
        }
      } else {
        exampleTextLines.push(set.setName);
        if (set.type && !set.setName.includes(set.type)) {
          exampleTextLines.push(set.type);
        }
      }

      // First part
      const p1 = set.parts[0];
      if (p1) {
        exampleTextLines.push(`[${p1.name}](${p1.url})`);
        if (gradeObj.grade.includes('S Grade')) {
          if (p1.sealedPdef) exampleTextLines.push(p1.sealedPdef);
          if (p1.unsealedPdef) exampleTextLines.push(p1.unsealedPdef);
          if (p1.unsealFee) exampleTextLines.push(p1.unsealFee);
        } else if (gradeObj.grade.includes('A Grade')) {
          if (p1.sealedVariant) {
            exampleTextLines.push(`[${p1.sealedVariant.name}](${p1.sealedVariant.url})`);
          }
        }
      }

      // Bonuses
      for (const b of set.bonusesMd) {
        exampleTextLines.push(b);
      }

      if (set.physicalDefense) exampleTextLines.push(`Physical Defense: ${set.physicalDefense}`);
      if (set.mpBoost) exampleTextLines.push(`MP Boost: ${set.mpBoost}`);

      // Remaining parts
      for (let i = 1; i < set.parts.length; i++) {
        const p = set.parts[i];
        exampleTextLines.push(`[${p.name}](${p.url})`);
        if (gradeObj.grade.includes('S Grade')) {
          if (p.sealedPdef) exampleTextLines.push(p.sealedPdef);
          if (p.unsealedPdef) exampleTextLines.push(p.unsealedPdef);
          if (p.unsealFee) exampleTextLines.push(p.unsealFee);
        } else if (gradeObj.grade.includes('A Grade') && p.sealedVariant) {
          exampleTextLines.push(`[${p.sealedVariant.name}](${p.sealedVariant.url})`);
        }
      }
      exampleTextLines.push('');
    }
    exampleTextLines.push('');
  }

  fs.writeFileSync(path.join(OUTPUT_DIR, 'armor_sets_example_format.txt'), exampleTextLines.join('\n'), 'utf8');
  console.log(`  Saved: scraped_data/armor_sets_example_format.txt`);

  // 4. Detailed Markdown: armor_sets.md
  let mdLines = [];
  mdLines.push(`# Lineage 2 Armor Sets - Set Bonuses & Stats`);
  mdLines.push(`> Fonte: [PMfun - Lineage 2 Armor Sets](${TARGET_URL})`);
  mdLines.push(`> Total de Sets: ${totalSets} | Total de Ícones Salvos: ${imageUrlsToDownload.size}`);
  mdLines.push('');
  mdLines.push('## Índice');
  for (const g of gradesData) {
    const anchor = g.grade.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    mdLines.push(`- [${g.grade} (${g.sets.length} sets)](#${anchor})`);
  }
  mdLines.push(`- [+6 Armor Bonuses](#6-armor-bonuses)`);
  mdLines.push('');

  for (const gradeObj of gradesData) {
    const anchor = gradeObj.grade.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    mdLines.push(`---`);
    mdLines.push(`## ${gradeObj.grade} <a id="${anchor}"></a>`);
    mdLines.push('');

    for (const set of gradeObj.sets) {
      mdLines.push(`### ${set.setName}`);
      if (set.type) mdLines.push(`**Tipo:** ${set.type}  `);
      if (set.physicalDefense) mdLines.push(`**Defesa Física do Set:** ${set.physicalDefense} | **Bônus de MP:** ${set.mpBoost}  `);
      mdLines.push('');
      
      mdLines.push('#### Bônus do Set / Modificações:');
      for (const b of set.bonusesMd) {
        mdLines.push(`- ${b}`);
      }
      mdLines.push('');

      mdLines.push('#### Partes do Set:');
      if (gradeObj.grade.includes('S Grade')) {
        mdLines.push('| Ícone | Parte | Sealed P.Def | Unsealed P.Def | Unseal Fee |');
        mdLines.push('|:---:|:---|:---:|:---:|:---:|');
        for (const p of set.parts) {
          const icon = p.localImagePath ? `![${p.name}](${p.localImagePath})` : '';
          mdLines.push(`| ${icon} | [${p.name}](${p.url}) | ${p.sealedPdef || '-'} | ${p.unsealedPdef || '-'} | ${p.unsealFee || '-'} |`);
        }
      } else if (gradeObj.grade.includes('A Grade')) {
        mdLines.push('| Ícone | Parte | Ícone Selado | Parte Selada (Sealed) |');
        mdLines.push('|:---:|:---|:---:|:---|');
        for (const p of set.parts) {
          const icon = p.localImagePath ? `![${p.name}](${p.localImagePath})` : '';
          const sealedIcon = p.sealedVariant && p.sealedVariant.localImagePath ? `![${p.sealedVariant.name}](${p.sealedVariant.localImagePath})` : '';
          const sealedLink = p.sealedVariant ? `[${p.sealedVariant.name}](${p.sealedVariant.url})` : '-';
          mdLines.push(`| ${icon} | [${p.name}](${p.url}) | ${sealedIcon} | ${sealedLink} |`);
        }
      } else {
        mdLines.push('| Ícone | Parte | Link |');
        mdLines.push('|:---:|:---|:---|');
        for (const p of set.parts) {
          const icon = p.localImagePath ? `![${p.name}](${p.localImagePath})` : '';
          mdLines.push(`| ${icon} | **${p.name}** | [Ver detalhes no PMfun](${p.url}) |`);
        }
      }
      mdLines.push('');
    }
  }

  // Add +6 enchant table to Markdown
  mdLines.push(`---`);
  mdLines.push(`## +6 Armor Bonuses <a id="6-armor-bonuses"></a>`);
  mdLines.push('| Grade | Heavy Armor | Light Armor | Robes |');
  mdLines.push('|:---|:---|:---|:---|');
  for (const b of plus6Bonuses) {
    mdLines.push(`| **${b.grade}** | ${b.heavyArmor} | ${b.lightArmor} | ${b.robes} |`);
  }
  mdLines.push('');

  fs.writeFileSync(path.join(OUTPUT_DIR, 'armor_sets.md'), mdLines.join('\n'), 'utf8');
  console.log(`  Saved: scraped_data/armor_sets.md`);

  // 5. Interactive HTML Catalog
  const htmlContent = buildHtmlCatalog(gradesData, plus6Bonuses, totalSets, imageUrlsToDownload.size);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), htmlContent, 'utf8');
  console.log(`  Saved: scraped_data/index.html`);

  console.log(`\n======================================================`);
  console.log(`SCRAPING COMPLETE!`);
  console.log(`Total Sets: ${totalSets}`);
  console.log(`Total Images Downloaded: ${imageUrlsToDownload.size}`);
  console.log(`Output Directory: ${OUTPUT_DIR}`);
  console.log(`Files Generated:`);
  console.log(` - scraped_data/armor_sets.json`);
  console.log(` - scraped_data/armor_sets.csv`);
  console.log(` - scraped_data/armor_sets_example_format.txt`);
  console.log(` - scraped_data/armor_sets.md`);
  console.log(` - scraped_data/plus6_bonuses.json`);
  console.log(` - scraped_data/index.html`);
  console.log(` - scraped_data/images/ (${imageUrlsToDownload.size} PNG icons)`);
  console.log(`======================================================`);
}

main().catch(err => {
  console.error('Fatal Error:', err);
  process.exit(1);
});
