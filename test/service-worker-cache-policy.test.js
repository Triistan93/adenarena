import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import test from 'node:test';

test('service worker fetches browser modules from the network before cached copies', async () => {
  const handlers = new Map();
  let networkCalls = 0;
  const cache = { put: async () => {} };
  const sandbox = {
    URL,
    Response,
    self: { addEventListener: (type, listener) => handlers.set(type, listener) },
    caches: {
      open: async () => cache,
      match: async () => new Response('stale module', { status: 200 }),
      keys: async () => [],
    },
    fetch: async () => {
      networkCalls += 1;
      return new Response('current module', { status: 200 });
    },
  };

  const source = await readFile(new URL('../public/sw.js', import.meta.url), 'utf8');
  vm.runInNewContext(source, sandbox, { filename: 'public/sw.js' });

  let responsePromise;
  handlers.get('fetch')({
    request: { method: 'GET', mode: 'cors', destination: 'script', url: 'http://localhost:5177/src/components/LoginScreen.tsx' },
    respondWith: promise => { responsePromise = promise; },
  });

  const response = await responsePromise;
  assert.equal(networkCalls, 1);
  assert.equal(await response.text(), 'current module');
});
