import { flagReportInputSchema } from '../_shared/reportSchema.ts';
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
    const input = flagReportInputSchema.parse(body);
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

    const { error: flagError } = await supabase
      .from('report_flags')
      .insert({
        report_id: report.id,
        ip_address_hash: ipAddressHash,
      });

    if (flagError && flagError.code !== '23505') {
      throw flagError;
    }

    const { data: updatedReport, error: updatedReportError } = await supabase
      .from('reports')
      .select('report_count, is_hidden')
      .eq('id', report.id)
      .single();

    if (updatedReportError || !updatedReport) {
      throw updatedReportError || new Error('Kon flag-status niet ophalen.');
    }

    return json({
      ok: true,
      report_count: updatedReport.report_count,
      is_hidden: updatedReport.is_hidden,
    });
  } catch (error) {
    console.error('flag-report failed', error);
    return json(
      {
        error: error instanceof Error ? error.message : 'Onbekende fout bij het melden van inhoud.',
      },
      400,
    );
  }
});
