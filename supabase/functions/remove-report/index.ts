import { adminRemoveReportInputSchema } from '../_shared/reportSchema.ts';
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
    const input = adminRemoveReportInputSchema.parse(body);
    await assertAdminKey(input.admin_key);

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('reports')
      .update({
        status: 'removed',
        is_hidden: true,
      })
      .eq('public_id', input.public_id)
      .select('id, public_id, status, is_hidden')
      .single();

    if (error || !data) {
      throw error || new Error('Kon melding niet verwijderen.');
    }

    return json({ report: data });
  } catch (error) {
    console.error('remove-report failed', error);
    return json(
      { error: error instanceof Error ? error.message : 'Kon melding niet verwijderen.' },
      400,
    );
  }
});
