import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const read = (file) => fs.readFileSync(path.resolve(file), 'utf8');

test('production build cannot enable the client-side admin console', () => {
  const source = read('lineage-idle/main.js');

  assert.match(source, /const ADMIN_CONSOLE_ENABLED = import\.meta\.env\.DEV/);
  assert.match(source, /function openAdminModal\(\) \{\s*if \(!ADMIN_CONSOLE_ENABLED\) return;/);
  assert.match(source, /if \(ADMIN_CONSOLE_ENABLED && isAdminCmd\)/);
  assert.match(source, /if \(lower\.startsWith\('\/\/'\) && !ADMIN_CONSOLE_ENABLED\)/);
});

test('Firestore rules do not grant unrestricted writes to every authenticated user', () => {
  const rules = read('firestore.rules');

  assert.doesNotMatch(rules, /allow create, update, delete: if isAuthenticated\(\) \|\| isServerAdmin\(\);/);
  assert.doesNotMatch(rules, /allow write, delete: if isAuthenticated\(\) \|\| isServerAdmin\(\);/);
  assert.match(rules, /match \/server_meta\/\{docId\} \{\s*allow read: if isAuthenticated\(\);\s*allow write, delete: if isServerAdmin\(\);/);
});
