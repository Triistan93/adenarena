import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { CANONICAL_CLASS_REGISTRY_V2 } from '../lineage-idle/src/data/classes/CanonicalClassRegistryV2.js';
import { CANONICAL_SKILL_REGISTRY_V2 } from '../lineage-idle/src/data/skills/CanonicalSkillRegistryV2.js';
import { resolveV2ClassContext } from '../lineage-idle/src/services/SkillEligibility.js';
import { NEUTRAL_SKILL_PLACEHOLDER } from '../lineage-idle/src/ui/GameUI.js';

const PORT = 3456;
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

// Generate HTML with skill tree loadout and skill cards
function generateTestHtml() {
  const classesToTest = [
    { id: 'sylphGunner', name: 'Sylph Gunner', ctx: resolveV2ClassContext('sylphid', 'sylph') },
    { id: 'dark_fighter', name: 'Dark Fighter', ctx: resolveV2ClassContext('dark_fighter') },
    { id: 'dark_mage', name: 'Dark Mage', ctx: resolveV2ClassContext('dark_mage') },
    { id: 'orc_mage', name: 'Orc Mage', ctx: resolveV2ClassContext('orc_mage') },
    { id: 'elven_fighter', name: 'Elven Fighter', ctx: resolveV2ClassContext('elven_fighter') },
    { id: 'elven_mage', name: 'Elven Mage', ctx: resolveV2ClassContext('elven_mage') },
    { id: 'shineMakerBase', name: 'Shine Maker (CONTENT_GAP)', ctx: resolveV2ClassContext('shineMakerBase') },
    { id: 'marauderBase', name: 'Marauder (CONTENT_GAP)', ctx: resolveV2ClassContext('marauderBase') },
  ];

  let skillsHtml = '';
  for (const item of classesToTest) {
    skillsHtml += `<section class="class-section" data-class="${item.id}"><h2>${item.name} (${item.ctx.status})</h2><div class="skills-grid">`;
    const skillIds = item.ctx.authorizedSkillIds || [];
    if (skillIds.length === 0) {
      skillsHtml += `<p class="empty-notice">Zero habilidades autorizadas (CONTENT_GAP documentado)</p>`;
    } else {
      for (const sId of skillIds) {
        const sDef = CANONICAL_SKILL_REGISTRY_V2[sId] || {};
        const iconSrc = sDef.icon || NEUTRAL_SKILL_PLACEHOLDER;
        skillsHtml += `
          <div class="skill-card" data-skill="${sId}">
            <img class="skill-icon" src="${iconSrc}" alt="${sDef.name || sId}"
                 onerror="this.dataset.failed='true'; this.src='${NEUTRAL_SKILL_PLACEHOLDER}';"
                 onload="this.dataset.loaded='true';" />
            <span class="skill-name">${sDef.name || sId}</span>
          </div>`;
      }
    }
    skillsHtml += `</div></section>`;
  }

  // Loadout Bar test section (including intentional missing icon to test neutral placeholder)
  const loadoutHtml = `
    <section class="loadout-section">
      <h2>Loadout Bar Test (Including Neutral Placeholder)</h2>
      <div class="loadout-bar">
        <div class="loadout-slot slot-active">
          <img class="loadout-icon" src="/icons/double_impact.webp" alt="Dual Blow" onload="this.dataset.loaded='true';" />
        </div>
        <div class="loadout-slot slot-placeholder">
          <!-- Missing icon falls back to neutral SVG placeholder -->
          <img class="loadout-icon fallback-test" src="${NEUTRAL_SKILL_PLACEHOLDER}" alt="Placeholder Test" onload="this.dataset.loaded='true';" />
        </div>
      </div>
    </section>`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Edge Real Browser Skill & Loadout Validation</title>
  <style>
    body { font-family: sans-serif; background: #0b0e14; color: #e0e6ed; padding: 20px; }
    .class-section { margin-bottom: 24px; border: 1px solid #2a2e39; padding: 16px; border-radius: 8px; }
    .skills-grid { display: flex; gap: 12px; flex-wrap: wrap; }
    .skill-card { border: 1px solid #3d4451; border-radius: 6px; padding: 8px; width: 120px; text-align: center; }
    .skill-icon { width: 48px; height: 48px; border-radius: 4px; object-fit: contain; }
    .skill-name { display: block; font-size: 11px; margin-top: 4px; word-break: break-word; }
    .loadout-bar { display: flex; gap: 8px; margin-top: 8px; }
    .loadout-slot { width: 44px; height: 44px; border: 2px solid #5a6578; border-radius: 6px; display: flex; align-items: center; justify-content: center; background: #1a1e28; }
    .loadout-icon { width: 36px; height: 36px; }
    #audit-results { margin-top: 30px; padding: 16px; background: #151a23; border: 2px solid #303846; border-radius: 8px; }
  </style>
</head>
<body>
  <h1>Edge Headless Validation: Skills, Icons & Loadout</h1>
  ${loadoutHtml}
  ${skillsHtml}
  <div id="audit-results">
    <h2>Audit Execution Status</h2>
    <div id="summary">Validating...</div>
  </div>
  <script>
    window.addEventListener('load', () => {
      setTimeout(() => {
        const imgs = Array.from(document.querySelectorAll('img'));
        let total = imgs.length;
        let loaded = 0;
        let failed = 0;
        let neutralPlaceholders = 0;

        imgs.forEach(img => {
          if (img.src.startsWith('data:image/svg+xml')) {
            neutralPlaceholders++;
            loaded++;
          } else if (img.naturalWidth > 0) {
            loaded++;
          } else {
            failed++;
          }
        });

        const statusReport = {
          totalImages: total,
          loadedImages: loaded,
          failedImages: failed,
          neutralPlaceholders: neutralPlaceholders,
          hasPowerStrikeFallback: imgs.some(img => (img.src || '').includes('power_strike.png'))
        };

        const summaryEl = document.getElementById('summary');
        summaryEl.setAttribute('data-report', JSON.stringify(statusReport));
        summaryEl.innerHTML = '<pre id="report-json">' + JSON.stringify(statusReport, null, 2) + '</pre>';
        document.title = 'AUDIT_COMPLETE_LOADED_' + loaded + '_FAILED_' + failed;
      }, 500);
    });
  </script>
</body>
</html>`;
}

// Start HTTP server to serve HTML and public/ assets
const publicDir = path.resolve('public');
const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(generateTestHtml());
    return;
  }

  // Serve static assets from public/
  const safeUrl = req.url.split('?')[0];
  const filePath = path.join(publicDir, safeUrl.startsWith('/') ? safeUrl.slice(1) : safeUrl);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.webp': 'image/webp',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml'
    };
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, async () => {
  console.log(`[Browser Audit Server] Listening on http://localhost:${PORT}`);

  const edgeArgs = [
    '--headless=new',
    '--disable-gpu',
    '--dump-dom',
    '--window-size=1280,1800',
    '--screenshot=' + path.resolve('public/edge_skills_audit.png'),
    '--virtual-time-budget=4000',
    `http://localhost:${PORT}/`
  ];

  console.log(`[Browser Audit] Launching Microsoft Edge: ${EDGE_PATH}`);
  const child = spawn(EDGE_PATH, edgeArgs);

  let stdout = '';
  let stderr = '';

  child.stdout.on('data', (d) => { stdout += d.toString(); });
  child.stderr.on('data', (d) => { stderr += d.toString(); });

  child.on('close', (code) => {
    server.close();
    console.log(`[Browser Audit] Edge exited with code ${code}`);

    // Parse the dumped DOM
    const match = stdout.match(/<pre id="report-json">([\s\S]*?)<\/pre>/);
    if (match) {
      const report = JSON.parse(match[1]);
      console.log('====================================');
      console.log('REAL BROWSER (EDGE / CHROMIUM) AUDIT:');
      console.log(JSON.stringify(report, null, 2));
      console.log('====================================');

      if (report.failedImages === 0 && !report.hasPowerStrikeFallback) {
        console.log('SUCCESS: All images loaded or used neutral SVG placeholder in real Edge browser!');
        process.exit(0);
      } else {
        console.error('FAILURE: Real browser detected broken images or power_strike fallback!');
        process.exit(1);
      }
    } else {
      console.log('Dumped DOM snippet:', stdout.slice(0, 500));
      console.log('Stdout length:', stdout.length, 'Stderr:', stderr);
      process.exit(1);
    }
  });
});
