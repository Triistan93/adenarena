import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';

async function test() {
  const tmpDir = fs.mkdtempSync(os.tmpdir() + '/edge-cdp-prod-');
  const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--remote-debugging-port=9222',
    '--headless=new',
    '--user-data-dir=' + tmpDir,
    '--no-first-run',
    '--no-default-browser-check',
    'https://adenarena.vercel.app/'
  ]);

  await new Promise(r => setTimeout(r, 2500));
  const listRes = await fetch('http://127.0.0.1:9222/json/list');
  const tabs = await listRes.json();
  console.log('Open tabs:', tabs.map(t => ({ id: t.id, url: t.url, title: t.title })));
  
  const target = tabs.find(t => t.url.includes('adenarena.vercel.app')) || tabs[0];
  console.log('Target WS:', target.webSocketDebuggerUrl);

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  console.log('WS connected!');

  let msgId = 1;
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      const handler = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id === id) {
          ws.removeEventListener('message', handler);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  // Wait for page to load
  await new Promise(r => setTimeout(r, 2000));

  const evalRes = await send('Runtime.evaluate', {
    expression: 'JSON.stringify({ title: document.title, url: window.location.href, rootExists: !!document.getElementById("root"), bodyHtmlLength: document.body.innerHTML.length })'
  });
  console.log('Eval result:', JSON.parse(evalRes.result.value));

  ws.close();
  edge.kill();
  edge.on('exit', () => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    console.log('Edge exited and temp dir cleaned');
  });
}

test().catch(console.error);
