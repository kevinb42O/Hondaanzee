// Opt-in integration check against the configured backend. Never publishes a
// test review or sends mail. Its one disposable account owns all test writes.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';

if (!process.argv.includes('--run')) {
  console.log('Use node scripts/check-hotspot-community-live.mjs --run for the disposable-account integration check.');
  process.exit(0);
}
const config = fs.readFileSync(new URL('../utils/supabasePublicConfig.ts', import.meta.url), 'utf8');
const base = config.match(/SUPABASE_URL = '([^']+)'/)[1];
const key = config.match(/SUPABASE_PUBLISHABLE_KEY = '([^']+)'/)[1];
const place = { city: 'blankenberge', slug: 'lakaiann' }, placeKey = `${place.city}/${place.slug}`;
async function request(path, { token = key, method = 'GET', body, memberToken } = {}) {
  const response = await fetch(base + path, {
    method,
    headers: { apikey: key, Authorization: `Bearer ${token}`, Origin: 'https://hondaanzee.be', 'Content-Type': 'application/json', ...(memberToken ? { 'x-user-access-token': memberToken } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const raw = await response.text();
  return { status: response.status, data: raw ? JSON.parse(raw) : null };
}
const community = (body, memberToken) => request('/functions/v1/site-community', { method: 'POST', body, memberToken });
const summaries = async () => {
  const result = await request('/rest/v1/rpc/public_hotspot_summaries', { method: 'POST', body: { p_places: [place] } });
  assert.equal(result.status, 200); return result.data[placeKey];
};
const reviews = async () => {
  const result = await request('/rest/v1/rpc/public_hotspot_reviews', { method: 'POST', body: { p_city: place.city, p_slug: place.slug } });
  assert.equal(result.status, 200); return result.data;
};
const settings = await request('/auth/v1/settings');
assert.equal(settings.status, 200);
assert.equal(settings.data.mailer_autoconfirm, true, 'Refusing signup while email confirmation is enabled: no mail may be sent.');
assert.equal(settings.data.disable_signup, false);
assert.ok((await summaries()).place_id);
assert.equal((await reviews()).available, true);
assert.equal((await community({ action: 'like', ...place, liked: true })).status, 401);
assert.equal((await request('/functions/v1/site-reviews', { method: 'POST', body: { action: 'submit', areaSlug: 'voorbeeld', rating: 4, name: 'Test', comment: 'Een eigen ervaring met de hond.' } })).status, 401);

const email = `haz-community-check-${crypto.randomUUID()}@example.invalid`;
const password = crypto.randomBytes(30).toString('base64url');
let token, id, deleted = false;
try {
  const signup = await request('/auth/v1/signup', { method: 'POST', body: { email, password } });
  assert.equal(signup.status, 200); token = signup.data.access_token; id = signup.data.user?.id;
  assert.ok(token && id);
  assert.equal((await community({ action: 'state', ...place }, token)).data.liked, false);
  const likesBefore = (await summaries()).likes;
  const likes = await Promise.all([1, 2].map(() => community({ action: 'like', ...place, liked: true }, token)));
  for (const result of likes) { assert.equal(result.status, 200); assert.equal(result.data.liked, true); }
  assert.equal((await summaries()).likes, likesBefore + 1, 'Concurrent desired-state writes add only one like');
  assert.equal((await community({ action: 'export' }, token)).data.likes.length, 1);
  assert.equal((await community({ action: 'like', ...place, liked: false }, token)).status, 200);
  assert.equal((await summaries()).likes, likesBefore);

  const submit = { action: 'submit', ...place, rating: 4, comment: 'Dit is een tijdelijke technische test die nooit wordt gepubliceerd.', name: 'Technische controle', visitMonth: null, version: null, ownExperience: true };
  assert.equal((await community({ ...submit, member_id: id }, token)).status, 400, 'The client cannot choose ownership');
  const saved = await community(submit, token);
  assert.equal(saved.status, 200); const review = saved.data.review;
  assert.equal(review.status, 'pending'); assert.equal(review.needs_review, true);
  assert.equal(review.has_published, false);
  assert.equal((await reviews()).reviews.some(row => row.id === review.id), false, 'Pending review remains private');
  const exported = await community({ action: 'export' }, token);
  assert.equal(exported.status, 200); assert.equal(exported.data.reviews.length, 1);
  assert.equal(exported.data.reviews[0].versions[0].comment, submit.comment);
  assert.equal(JSON.stringify(exported.data).includes('fingerprint'), false);
  assert.equal((await community(submit, token)).status, 409, 'A stale version cannot overwrite a review');
  const denied = await request('/functions/v1/admin-reviews', { token, method: 'POST', body: { action: 'overview' } });
  assert.equal(denied.status, 403);
  for (const table of ['place_likes', 'hotspot_reviews', 'hotspot_review_versions', 'hotspot_review_actions', 'hotspot_review_flags']) {
    const result = await request(`/rest/v1/${table}?select=*`, { token });
    assert.ok([401, 403].includes(result.status), `${table} must not be directly readable`);
  }
  const privateRpc = await request('/rest/v1/rpc/member_hotspot_export', { token, method: 'POST', body: { p_member: id } });
  assert.ok([401, 403, 404].includes(privateRpc.status));
  const withdrawn = await community({ action: 'withdraw', ...place, version: review.version }, token);
  assert.equal(withdrawn.status, 200); assert.equal(withdrawn.data.review.status, 'withdrawn');
  // Resubmit privately and retain a like so account deletion exercises both cascades.
  assert.equal((await community({ ...submit, version: withdrawn.data.review.version }, token)).status, 200);
  assert.equal((await community({ action: 'like', ...place, liked: true }, token)).status, 200);
  const remove = await request('/functions/v1/member-account', { token, method: 'POST', body: { action: 'delete', email, confirmation: 'VERWIJDER' } });
  assert.equal(remove.status, 200); assert.equal(remove.data.ok, true); deleted = true;
  assert.equal((await summaries()).likes, likesBefore, 'Deleting the member removes their like');
  assert.equal((await community({ action: 'state', ...place }, token)).status, 401);
  assert.equal((await request('/auth/v1/token?grant_type=password', { method: 'POST', body: { email, password } })).status, 400);
  console.log('Live community check passed: guest denial, concurrent idempotent likes, authenticated review, pending privacy, own export, conflicts, admin/table/RPC denial, withdrawal and account deletion. No mail sent or test review published.');
} finally {
  if (token && !deleted) {
    const cleanup = await request('/functions/v1/member-account', { token, method: 'POST', body: { action: 'delete', email, confirmation: 'VERWIJDER' } });
    assert.equal(cleanup.status, 200, 'Disposable account cleanup failed');
    console.log('Disposable community account cleaned up.');
  }
}
