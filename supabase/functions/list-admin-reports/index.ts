import { adminListReportsInputSchema } from '../_shared/reportSchema.ts';
import { getSupabaseAdmin, handleOptions, json } from '../_shared/http.ts';
import { assertAdminKey } from '../_shared/security.ts';

Deno.serve(async (req) => {
  const optionsResponse = handleOptions(req);
  if (optionsResponse) {
    return optionsResponse;
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const body = await req.json();
    const input = adminListReportsInputSchema.parse(body);
    await assertAdminKey(input.admin_key);

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('reports')
      .select(`
        id,
        public_id,
        category,
        city_slug,
        location_text,
        description,
        observed_at,
        created_at,
        status,
        is_hidden,
        report_count,
        city_intervention_status,
        city_intervention_note,
        resolved_at
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      throw error;
    }

    return json({ reports: data || [] });
  } catch (error) {
    console.error('list-admin-reports failed', error);
    return json(
      { error: error instanceof Error ? error.message : 'Kon adminmeldingen niet laden.' },
      400,
    );
  }
});
