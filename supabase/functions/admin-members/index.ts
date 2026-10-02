import { z } from 'zod';
import { getSupabaseAdmin, handleOptions, json } from '../_shared/http.ts';
import { requireAdminUser } from '../_shared/security.ts';

const requestSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('access') }).strict(),
  z.object({ action: z.literal('list'), search: z.string().trim().max(100).default(''), status: z.enum(['', 'active', 'suspended']).default(''), page: z.number().int().min(1).max(10000).default(1) }).strict(),
  z.object({ action: z.literal('detail'), id: z.uuid() }).strict(),
  z.object({ action: z.literal('status'), id: z.uuid(), status: z.enum(['active', 'suspended']) }).strict(),
]);

Deno.serve(async req => {
  const options = handleOptions(req); if (options) return options;
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  let actor;
  try { actor = await requireAdminUser(req); } catch { return json({ error: 'Je account heeft geen toegang tot het beheer.' }, 403); }
  try {
    const raw = await req.text();
    if (raw.length > 2048) return json({ error: 'Het verzoek is te groot.' }, 413);
    const parsed = requestSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return json({ error: 'Controleer je verzoek.' }, 400);
    const input = parsed.data, db = getSupabaseAdmin();
    if (input.action === 'access') return json({ allowed: true });
    if (input.action === 'list') {
      const { data, error } = await db.rpc('admin_list_members', { p_search: input.search, p_status: input.status, p_page: input.page });
      if (error) throw error;
      return json(data);
    }
    const { data: member, error } = await db.from('member_profiles').select('*').eq('id', input.id).maybeSingle();
    if (error) throw error;
    if (!member) return json({ error: 'Dit account bestaat niet meer.' }, 404);
    if (input.action === 'detail') {
      const [dogs, towns, favorites, trips] = await Promise.all([
        db.from('member_dogs').select('name,breed,avatar').eq('member_id', input.id),
        db.from('member_towns').select('city_slug').eq('member_id', input.id),
        db.from('member_favorites').select('*', { head: true, count: 'exact' }).eq('member_id', input.id),
        db.from('member_trips').select('*', { head: true, count: 'exact' }).eq('member_id', input.id),
      ]);
      if ([dogs, towns, favorites, trips].some(result => result.error)) throw new Error('Member detail unavailable');
      return json({ member, dogs: dogs.data, towns: towns.data, favorites_count: favorites.count, trips_count: trips.count });
    }
    if (input.id === actor.id || member.email.toLowerCase() === actor.email?.toLowerCase()) return json({ error: 'Je kunt je eigen beheeraccount niet schorsen.' }, 400);
    // Profile status is authoritative for RLS and shared collections, including
    // already-issued sessions. Update and log together in one database call.
    const { error: updateError } = await db.rpc('admin_set_member_status', { p_id: input.id, p_status: input.status, p_actor: actor.id });
    if (updateError) throw updateError;
    return json({ ok: true });
  } catch (error) {
    console.error('admin-members failed', { type: error instanceof Error ? error.name : 'unknown' });
    return json({ error: 'De ledengegevens konden niet worden verwerkt. Probeer opnieuw.' }, 500);
  }
});
