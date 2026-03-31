import { confirmReportInputSchema } from '../_shared/reportSchema.ts';
import { getClientIp, getSupabaseAdmin, handleOptions, json } from '../_shared/http.ts';
import { hashIpAddress } from '../_shared/security.ts';

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
    const input = confirmReportInputSchema.parse(body);
    const supabase = getSupabaseAdmin();
    const clientIp = getClientIp(req);
    const ipAddressHash = await hashIpAddress(clientIp);

    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select('id, public_id')
      .eq('public_id', input.public_id)
      .single();

    if (reportError || !report) {
      throw reportError || new Error('Melding niet gevonden.');
    }

    const { error: confirmError } = await supabase
      .from('report_confirmations')
      .insert({
        report_id: report.id,
        ip_address_hash: ipAddressHash,
      });

    if (confirmError && confirmError.code !== '23505') {
      throw confirmError;
    }

    const { data: updatedReport, error: updatedReportError } = await supabase
      .from('reports')
      .select('confirm_count')
      .eq('id', report.id)
      .single();

    if (updatedReportError || !updatedReport) {
      throw updatedReportError || new Error('Kon bevestigingen niet ophalen.');
    }

    return json({
      ok: true,
      confirm_count: updatedReport.confirm_count,
      already_confirmed: confirmError?.code === '23505',
    });
  } catch (error) {
    console.error('confirm-report failed', error);
    return json(
      {
        error: error instanceof Error ? error.message : 'Onbekende fout bij het bevestigen van een melding.',
      },
      400,
    );
  }
});
