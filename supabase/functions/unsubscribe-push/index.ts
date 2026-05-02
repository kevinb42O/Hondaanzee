import { getSupabaseAdmin, handleOptions, json } from '../_shared/http.ts';

Deno.serve(async (req) => {
  const optionsResponse = handleOptions(req);
  if (optionsResponse) return optionsResponse;

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const body = (await req.json().catch(() => ({}))) as { endpoint?: string };
    const endpoint = (body.endpoint || '').trim();
    if (!endpoint) {
      return json({ error: 'Endpoint ontbreekt.' }, 400);
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', endpoint);

    if (error) throw error;
    return json({ ok: true });
  } catch (error) {
    console.error('unsubscribe-push failed', error);
    return json(
      { error: error instanceof Error ? error.message : 'Afmelden mislukt.' },
      400,
    );
  }
});
