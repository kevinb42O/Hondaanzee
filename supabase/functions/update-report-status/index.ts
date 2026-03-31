import { adminUpdateReportInputSchema } from '../_shared/reportSchema.ts';
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
    const input = adminUpdateReportInputSchema.parse(body);
    await assertAdminKey(input.admin_key);

    const supabase = getSupabaseAdmin();
    const nextResolvedAt =
      input.city_intervention_status === 'resolved' ? new Date().toISOString() : null;

    const { data, error } = await supabase
      .from('reports')
      .update({
        city_intervention_status: input.city_intervention_status,
        city_intervention_note: input.city_intervention_note || null,
        resolved_at: nextResolvedAt,
      })
      .eq('public_id', input.public_id)
      .select(`
        id,
        public_id,
        city_slug,
        city_intervention_status,
        city_intervention_note,
        resolved_at
      `)
      .single();

    if (error || !data) {
      throw error || new Error('Kon melding niet updaten.');
    }

    return json({ report: data });
  } catch (error) {
    console.error('update-report-status failed', error);
    return json(
      { error: error instanceof Error ? error.message : 'Kon interventiestatus niet opslaan.' },
      400,
    );
  }
});
