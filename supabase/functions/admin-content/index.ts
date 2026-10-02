import { contentDraftRequest, mergeContentDraft } from '../_shared/contentDraft.ts';
import { getSupabaseAdmin, handleOptions, json } from '../_shared/http.ts';
import { requireAdminUser } from '../_shared/security.ts';

const selection = 'id,kind,legacy_id,slug,city_slug,version,draft_revision_id,published_revision_id,archived_at,updated_at,draft:content_place_revisions!content_places_draft_revision_fk(content),published:content_place_revisions!content_places_published_revision_fk(content)';
Deno.serve(async req => {
  const options = handleOptions(req);
  if (options) return options;
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  let actor;
  try { actor = await requireAdminUser(req); } catch { return json({ error: 'Log in met je beheeraccount om zaken te beheren.' }, 403); }
  try {
    const raw = await req.text();
    if (new TextEncoder().encode(raw).length > 65536) return json({ error: 'Het verzoek is te groot.' }, 413);
    const parsed = contentDraftRequest.safeParse(JSON.parse(raw));
    if (!parsed.success) return json({ error: parsed.error.issues[0]?.message || 'Controleer de ingevoerde gegevens.' }, 400);
    const input = parsed.data;
    const db = getSupabaseAdmin();
    if (input.action === 'list') {
      const { data, error } = await db.from('content_places').select(selection).order('updated_at', { ascending: false }).limit(1000);
      if (error) throw error;
      return json({ places: data });
    }
    if (input.action === 'create') {
      const content = mergeContentDraft(input.kind, { tags: [], image: '', website: '' }, input.patch);
      const { data, error } = await db.rpc('create_content_place_draft', { p_kind: input.kind, p_city: input.city, p_slug: input.slug, p_content: content, p_actor_id: actor.id });
      if (error) throw error;
      return json(data, 201);
    }
    const { data: place, error } = await db.from('content_places').select(selection).eq('id', input.id).maybeSingle();
    if (error) throw error;
    if (!place) return json({ error: 'Deze zaak bestaat niet.' }, 404);
    if (input.action === 'detail') return json({ place });
    const draft = place.draft as unknown as { content: Record<string, unknown> };
    const content = mergeContentDraft(place.kind, draft.content, input.patch);
    const { data, error: saveError } = await db.rpc('save_content_place_draft', { p_place_id: input.id, p_expected_version: input.version, p_content: content, p_actor_id: actor.id });
    if (saveError) throw saveError;
    return json(data);
  } catch (error) {
    const message = typeof error === 'object' && error && 'message' in error ? String(error.message) : '';
    if (message.includes('VERSION_CONFLICT')) return json({ error: 'Deze zaak is intussen gewijzigd. Herlaad de laatste versie voordat je opnieuw opslaat.', code: 'VERSION_CONFLICT' }, 409);
    if (typeof error === 'object' && error && 'code' in error && error.code === '23505') return json({ error: 'Deze zaak-URL bestaat al. Kies een andere slug.' }, 409);
    if (error instanceof SyntaxError) return json({ error: 'Ongeldig verzoek.' }, 400);
    if (error instanceof Error && (message.startsWith('Kies een categorie') || message.startsWith('Openingstijden'))) return json({ error: message }, 400);
    console.error('admin-content failed', { code: typeof error === 'object' && error && 'code' in error ? error.code : 'unknown' });
    return json({ error: 'De wijziging kon niet worden verwerkt. Probeer opnieuw.' }, 500);
  }
});
