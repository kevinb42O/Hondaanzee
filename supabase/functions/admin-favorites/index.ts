import { getSupabaseAdmin, handleOptions, json } from '../_shared/http.ts';
import { requireAdminUser } from '../_shared/security.ts';

const reply = (body: unknown, status = 200) => {
  const response = json(body, status);
  response.headers.set('Cache-Control', 'no-store');
  return response;
};
Deno.serve(async req => {
  const options = handleOptions(req); if (options) return options;
  if (req.method !== 'POST') return reply({ error: 'Method not allowed' }, 405);
  try { await requireAdminUser(req); } catch { return reply({ error: 'Log in met je beheeraccount.' }, 403); }
  try {
    const raw = await req.text();
    if (raw.length > 256) return reply({ error: 'Het verzoek is te groot.' }, 413);
    const input = JSON.parse(raw);
    if (!input || !['overview', 'counts'].includes(input.action) || Object.keys(input).length !== 1) return reply({ error: 'Kies een geldig overzicht.' }, 400);
    const { data, error } = await getSupabaseAdmin().rpc('admin_favorite_insights');
    if (error) throw error;
    if (input.action === 'counts') return reply({ generated_at: data.generated_at, counts: Object.fromEntries(data.places.filter((p: { place_id: string | null }) => p.place_id).map((p: { place_id: string; saved_count: number }) => [p.place_id, p.saved_count])) });
    return reply(data);
  } catch (error) {
    if (error instanceof SyntaxError) return reply({ error: 'Controleer je verzoek.' }, 400);
    console.error('admin-favorites failed', { type: error instanceof Error ? error.name : 'unknown' });
    return reply({ error: 'De favorietenstatistieken konden niet worden geladen. Probeer opnieuw.' }, 500);
  }
});
