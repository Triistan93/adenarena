import { Composio } from '@composio/core';
import fs from 'fs';
import path from 'path';

// Load .env.local
const envPath = path.resolve('.env.local');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      process.env[key] = val;
    }
  }
}

async function main() {
  const composio = new Composio({ apiKey: process.env.COMPOSIO_API_KEY });
  const session = await composio.create('admin_adenarena');
  console.log('Session ID:', session.sessionId);

  console.log('\n--- 1. Executing COMPOSIO_SEARCH_TOOLS for "github" ---');
  const searchResult = await session.execute('COMPOSIO_SEARCH_TOOLS', {
    query: 'github star or create issue'
  });
  console.log('Search Results:', JSON.stringify(searchResult, null, 2));

  console.log('\n--- 2. Checking GitHub Authorization Link ---');
  const authResponse = await session.authorize('github');
  console.log('GitHub Connection Details:', JSON.stringify(authResponse, null, 2));
}

main();
