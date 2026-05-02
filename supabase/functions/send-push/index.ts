import webpush from 'npm:web-push@3.6.7';
import { getSupabaseAdmin, handleOptions, json } from '../_shared/http.ts';
import { requireAdminUser } from '../_shared/security.ts';

interface SendBody {
  title?: string;
  body?: string;
  url?: string;
}

Deno.serve(async (req) => {
  const optionsResponse = handleOptions(req);
  if (optionsResponse) return optionsResponse;

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const adminUser = await requireAdminUser(req);

    const publicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const privateKey = Deno.env.get('VAPID_PRIVATE_KEY');
    const subject = Deno.env.get('VAPID_SUBJECT') || 'mailto:info@hondaanzee.be';

    if (!publicKey || !privateKey) {
      return json({ error: 'VAPID keys niet geconfigureerd.' }, 500);
    }

    webpush.setVapidDetails(subject, publicKey, privateKey);

    const payload = (await req.json().catch(() => ({}))) as SendBody;
    const title = (payload.title || '').trim();
    const messageBody = (payload.body || '').trim();
    const url = (payload.url || '/').trim() || '/';

    if (!title || title.length > 120) {
      return json({ error: 'Titel is verplicht (max 120 tekens).' }, 400);
    }
    if (messageBody.length > 400) {
      return json({ error: 'Bericht is te lang (max 400 tekens).' }, 400);
    }
    if (!/^(https?:\/\/|\/)/.test(url)) {
      return json({ error: 'Ongeldige URL.' }, 400);
    }

    const supabase = getSupabaseAdmin();
    const { data: subs, error: subsError } = await supabase
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth');

    if (subsError) throw subsError;

    const subscriptions = subs || [];
    const notification = JSON.stringify({ title, body: messageBody, url, tag: `haz-${Date.now()}` });

    let sent = 0;
    let failed = 0;
    const expiredIds: string[] = [];

    await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            notification,
            { TTL: 60 * 60 * 24 },
          );
          sent += 1;
        } catch (err: unknown) {
          failed += 1;
          const status = (err as { statusCode?: number })?.statusCode;
          if (status === 404 || status === 410) {
            expiredIds.push(sub.id);
          } else {
            console.error('push send failed', sub.endpoint, err);
          }
        }
      }),
    );

    if (expiredIds.length > 0) {
      await supabase.from('push_subscriptions').delete().in('id', expiredIds);
    }

    await supabase.from('push_notifications_log').insert({
      title,
      body: messageBody || null,
      url,
      sent_count: sent,
      failed_count: failed,
      total_count: subscriptions.length,
      sent_by: adminUser.email || adminUser.id,
    });

    return json({
      ok: true,
      sent,
      failed,
      total: subscriptions.length,
      expired: expiredIds.length,
    });
  } catch (error) {
    console.error('send-push failed', error);
    return json(
      { error: error instanceof Error ? error.message : 'Verzenden mislukt.' },
      400,
    );
  }
});
