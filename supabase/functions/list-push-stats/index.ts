import { getSupabaseAdmin, handleOptions, json } from '../_shared/http.ts';
import { requireAdminUser } from '../_shared/security.ts';

Deno.serve(async (req) => {
  const optionsResponse = handleOptions(req);
  if (optionsResponse) return optionsResponse;

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    await requireAdminUser(req);

    const supabase = getSupabaseAdmin();

    const [{ count: subscriberCount, error: countError }, { data: log, error: logError }] =
      await Promise.all([
        supabase.from('push_subscriptions').select('id', { count: 'exact', head: true }),
        supabase
          .from('push_notifications_log')
          .select('id, title, body, url, sent_count, failed_count, total_count, sent_by, created_at')
          .order('created_at', { ascending: false })
          .limit(25),
      ]);

    if (countError) throw countError;
    if (logError) throw logError;

    return json({
      subscriber_count: subscriberCount || 0,
      log: log || [],
    });
  } catch (error) {
    console.error('list-push-stats failed', error);
    return json(
      { error: error instanceof Error ? error.message : 'Statistieken niet beschikbaar.' },
      400,
    );
  }
});
