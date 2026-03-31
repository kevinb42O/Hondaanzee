import { createReportInputSchema, buildObservedAt } from '../_shared/reportSchema.ts';
import { getClientIp, getSupabaseAdmin, handleOptions, json } from '../_shared/http.ts';
import { hashIpAddress } from '../_shared/security.ts';

const OOSTENDE_WEBHOOK_ENV = 'OOSTENDE_ALERT_WEBHOOK_URL';

const maybeNotifyOostende = async (
  report: {
    id: string;
    public_id: string;
    city_slug: string;
    category: string;
    location_text: string;
    description: string;
    observed_at: string;
  },
  supabase: ReturnType<typeof getSupabaseAdmin>,
) => {
  if (report.city_slug !== 'oostende' || report.category !== 'gif') {
    return;
  }

  const webhookUrl = Deno.env.get(OOSTENDE_WEBHOOK_ENV);

  if (!webhookUrl) {
    return;
  }

  try {
    const payload = {
      source: 'HondAanZee Meldpunt Gif & Overlast',
      city_slug: report.city_slug,
      category: report.category,
      public_id: report.public_id,
      report_url: `https://hondaanzee.be/meldpunt/${report.public_id}`,
      location_text: report.location_text,
      description: report.description,
      observed_at: report.observed_at,
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    await supabase
      .from('reports')
      .update({
        city_intervention_status: response.ok ? 'forwarded' : 'pending',
        city_intervention_note: response.ok
          ? 'Automatisch doorgestuurd naar stadsdiensten Oostende.'
          : 'Doorgifte naar stadsdiensten faalde.',
      })
      .eq('id', report.id);
  } catch (error) {
    console.error('Oostende notification failed', error);
    await supabase
      .from('reports')
      .update({
        city_intervention_status: 'pending',
        city_intervention_note: 'Doorgifte naar stadsdiensten kon niet worden afgerond.',
      })
      .eq('id', report.id);
  }
};

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
    const input = createReportInputSchema.parse(body);
    const clientIp = getClientIp(req);

    const supabase = getSupabaseAdmin();
    const ipAddressHash = await hashIpAddress(clientIp);
    const observedAt = buildObservedAt(input);
    const interventionStatus =
      input.city_slug === 'oostende' && input.category === 'gif' ? 'pending' : 'not_applicable';

    const { data, error } = await supabase
      .from('reports')
      .insert({
        category: input.category,
        city_slug: input.city_slug,
        location_text: input.location_text,
        description: input.description,
        observed_at: observedAt,
        status: 'published',
        ip_address_hash: ipAddressHash,
        city_intervention_status: interventionStatus,
      })
      .select(`
        id,
        public_id,
        city_slug,
        category,
        location_text,
        description,
        observed_at
      `)
      .single();

    if (error || !data) {
      throw error || new Error('Melding kon niet worden opgeslagen.');
    }

    await maybeNotifyOostende(data, supabase);

    return json({
      report: {
        public_id: data.public_id,
        observed_at: data.observed_at,
        detail_path: `/meldpunt/${data.public_id}`,
      },
    }, 201);
  } catch (error) {
    console.error('create-report failed', error);
    return json(
      {
        error: error instanceof Error ? error.message : 'Onbekende fout bij het opslaan van de melding.',
      },
      400,
    );
  }
});
