import { getSupabaseAdmin, handleOptions, json } from '../_shared/http.ts';

interface SubscribeBody {
  endpoint?: string;
  keys?: { p256dh?: string; auth?: string };
  user_agent?: string;
}

Deno.serve(async (req) => {
  const optionsResponse = handleOptions(req);
  if (optionsResponse) return optionsResponse;

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const body = (await req.json().catch(() => ({}))) as SubscribeBody;
    const endpoint = (body.endpoint || '').trim();
    const p256dh = (body.keys?.p256dh || '').trim();
    const auth = (body.keys?.auth || '').trim();
    const userAgent = (body.user_agent || req.headers.get('user-agent') || '').slice(0, 512);

    if (!endpoint || !p256dh || !auth) {
      return json({ error: 'Ongeldige push-aanmelding.' }, 400);
    }
    if (!/^https:\/\//i.test(endpoint)) {
      return json({ error: 'Ongeldig endpoint.' }, 400);
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          endpoint,
          p256dh,
          auth,
          user_agent: userAgent || null,
          last_seen_at: new Date().toISOString(),
        },
        { onConflict: 'endpoint' },
      );

    if (error) throw error;

    return json({ ok: true });
  } catch (error) {
    console.error('subscribe-push failed', error);
    return json(
      { error: error instanceof Error ? error.message : 'Aanmelden mislukt.' },
      400,
    );
  }
});
