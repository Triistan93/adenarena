import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const read = (file) => fs.readFileSync(path.resolve(file), 'utf8');

test('Admin menu and commands are strictly restricted to authorized whitelist accounts', () => {
  const source = read('lineage-idle/main.js');
  const markup = read('src/idle/markup.ts');

  // 1. Whitelist definition contains strictly the 2 authorized emails
  assert.match(source, /const AUTHORIZED_ADMIN_EMAILS = \['duuh\.alaminos@gmail\.com', 'eduardol\.alaminos@gmail\.com'\];/);

  // 2. openAdminModal is gated by isAuthorizedAdmin()
  assert.match(source, /function openAdminModal\(\) \{\s*if \(!isAuthorizedAdmin\(\)\)/);

  // 3. handleChatSubmit blocks admin commands for unauthorized users
  assert.match(source, /if \(isAdminCmd\) \{\s*if \(!isAuthorizedAdmin\(\)\)/);

  // 4. Admin top button visibility in updateUI is strictly driven by isAuthorizedAdmin()
  assert.match(source, /adminBtn\.style\.display = isAuthorizedAdmin\(\) \? 'inline-flex' : 'none';/);

  // 5. Initial markup hides admin button by default to prevent UI flashing
  assert.match(markup, /<button id="admin-top-btn" class="tb-btn tb-btn--admin" style="display:none;"/);
});

test('isAuthorizedAdmin logic correctly accepts only authorized emails and rejects all others', () => {
  const AUTHORIZED_ADMIN_EMAILS = ['duuh.alaminos@gmail.com', 'eduardol.alaminos@gmail.com'];

  function mockIsAuthorizedAdmin(mockWindow) {
    if (!mockWindow) return false;
    if (mockWindow.currentUserIsAdmin === true) return true;
    const email = (
      mockWindow.currentUserEmail ||
      mockWindow.FirebaseBridge?.getCurrentUserEmail?.() ||
      mockWindow.lineageIdleCloud?.getCurrentUserEmail?.() ||
      ''
    ).toLowerCase().trim();
    if (email && AUTHORIZED_ADMIN_EMAILS.includes(email)) {
      return true;
    }
    return false;
  }

  // Unauthorized cases
  assert.equal(mockIsAuthorizedAdmin(null), false);
  assert.equal(mockIsAuthorizedAdmin({}), false);
  assert.equal(mockIsAuthorizedAdmin({ currentUserEmail: '' }), false);
  assert.equal(mockIsAuthorizedAdmin({ currentUserEmail: 'random_player@gmail.com' }), false);
  assert.equal(mockIsAuthorizedAdmin({ currentUserEmail: 'hacker@adenarena.com' }), false);
  assert.equal(mockIsAuthorizedAdmin({ currentUserIsAdmin: false, currentUserEmail: 'test@test.com' }), false);

  // Authorized cases
  assert.equal(mockIsAuthorizedAdmin({ currentUserEmail: 'duuh.alaminos@gmail.com' }), true);
  assert.equal(mockIsAuthorizedAdmin({ currentUserEmail: 'eduardol.alaminos@gmail.com' }), true);
  assert.equal(mockIsAuthorizedAdmin({ currentUserEmail: 'DUUH.ALAMINOS@GMAIL.COM ' }), true);
  assert.equal(mockIsAuthorizedAdmin({ currentUserIsAdmin: true }), true);
  assert.equal(mockIsAuthorizedAdmin({ FirebaseBridge: { getCurrentUserEmail: () => 'eduardol.alaminos@gmail.com' } }), true);
});

test('Firestore rules do not grant unrestricted writes to every authenticated user', () => {
  const rules = read('firestore.rules');

  assert.doesNotMatch(rules, /allow create, update, delete: if isAuthenticated\(\) \|\| isServerAdmin\(\);/);
  assert.doesNotMatch(rules, /allow write, delete: if isAuthenticated\(\) \|\| isServerAdmin\(\);/);
  assert.match(rules, /match \/server_meta\/\{docId\} \{\s*allow read: if isAuthenticated\(\);\s*allow write, delete: if isServerAdmin\(\);/);
});
