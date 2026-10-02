// Opt-in live integration check. Creates one disposable account, never sends
// mail, logs no passwords/tokens and deletes its own data through the app API.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';

if (!process.argv.includes('--run')) {
  console.log('Use node scripts/check-member-auth-live.mjs --run for the live disposable-account check.');
  process.exit(0);
}
const config = fs.readFileSync(new URL('../utils/supabasePublicConfig.ts', import.meta.url), 'utf8');
const base = config.match(/SUPABASE_URL = '([^']+)'/)[1];
const key = config.match(/SUPABASE_PUBLISHABLE_KEY = '([^']+)'/)[1];
async function request(path, { token = key, method = 'GET', body } = {}) {
  const response = await fetch(base + path, { method, headers: { apikey: key, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const text = await response.text();
  return { status: response.status, data: text ? JSON.parse(text) : null };
}
const settings = await request('/auth/v1/settings');
assert.equal(settings.status, 200);
assert.equal(settings.data.mailer_autoconfirm, true, 'Refusing signup while email confirmation is enabled: no emails may be sent.');
assert.equal(settings.data.disable_signup, false);
const email = `haz-password-check-${crypto.randomUUID()}@example.invalid`;
const password = crypto.randomBytes(30).toString('base64url');
let token, id, deleted = false;
try {
  const signup = await request('/auth/v1/signup', { method: 'POST', body: { email, password } });
  assert.equal(signup.status, 200, 'Password registration must succeed');
  token = signup.data.access_token; id = signup.data.user?.id;
  assert.ok(token && id, 'Registration must immediately return an authenticated session');
  const profile = await request(`/rest/v1/member_profiles?id=eq.${id}&select=id,status`, { token });
  assert.deepEqual(profile.data, [{ id, status: 'active' }]);
  const favorite = await request('/rest/v1/member_favorites', { token, method: 'POST', body: { member_id: id, kind: 'hotspot', city_slug: 'blankenberge', place_slug: 'lakaiann' } });
  assert.equal(favorite.status, 201);
  const favorites = await request(`/rest/v1/member_favorites?member_id=eq.${id}&select=place_slug`, { token });
  assert.deepEqual(favorites.data, [{ place_slug: 'lakaiann' }]);
  const wrong = await request('/auth/v1/token?grant_type=password', { method: 'POST', body: { email, password: 'wrong-password' } });
  assert.equal(wrong.status, 400, 'Wrong passwords must not authenticate');
  const login = await request('/auth/v1/token?grant_type=password', { method: 'POST', body: { email, password } });
  assert.equal(login.status, 200);
  token = login.data.access_token;
  const denied = await request('/functions/v1/admin-members', { token, method: 'POST', body: { action: 'access' } });
  assert.equal(denied.status, 403, 'Members must not get admin access');
  const remove = await request('/functions/v1/member-account', { token, method: 'POST', body: { action: 'delete', email, confirmation: 'VERWIJDER' } });
  assert.equal(remove.status, 200); assert.equal(remove.data.ok, true); deleted = true;
  const afterDelete = await request('/auth/v1/token?grant_type=password', { method: 'POST', body: { email, password } });
  assert.equal(afterDelete.status, 400, 'Deleted accounts must not authenticate');
  console.log('Live password registration, direct access, saved favourite, wrong-password rejection, repeat login, admin denial and account deletion: OK. No mail sent.');
} finally {
  if (token && !deleted) {
    const cleanup = await request('/functions/v1/member-account', { token, method: 'POST', body: { action: 'delete', email, confirmation: 'VERWIJDER' } });
    assert.equal(cleanup.status, 200, 'Disposable account cleanup failed');
    console.log('Disposable test account cleaned up.');
  }
}
