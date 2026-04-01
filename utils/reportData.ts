import { CITIES } from '../cityData.ts';
import type { ReportInterventionStatus, ReportItem } from '../types.ts';
import { supabase } from './supabaseClient.ts';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './supabasePublicConfig.ts';

export const REPORT_SELECT_COLUMNS = `
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
  confirm_count,
  city_intervention_status,
  city_intervention_note,
  resolved_at
`;

type ReportRow = Omit<ReportItem, 'city_name'>;

const cityNameMap = new Map(CITIES.map((city) => [city.slug, city.name]));

const getAdminInvokeHeaders = async (): Promise<Record<string, string>> => {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  const accessToken = data.session?.access_token;
  if (!accessToken) {
    throw new Error('Je adminsessie ontbreekt. Log opnieuw in.');
  }

  return {
    apikey: SUPABASE_PUBLISHABLE_KEY,
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  };
};

const parseAdminErrorResponse = async (response: Response): Promise<Error> => {
  try {
    const payload = await response.json();
    if (payload && typeof payload.error === 'string' && payload.error.trim()) {
      return new Error(payload.error);
    }
    if (payload && typeof payload.message === 'string' && payload.message.trim()) {
      return new Error(payload.message);
    }
  } catch {
    // Ignore JSON parsing failures and fall back to a generic HTTP error.
  }

  return new Error(`Admin request mislukt (${response.status}).`);
};

const invokeAdminFunction = async <TResponse>(name: string, body: Record<string, unknown>): Promise<TResponse> => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method: 'POST',
    headers: await getAdminInvokeHeaders(),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw await parseAdminErrorResponse(response);
  }

  return response.json() as Promise<TResponse>;
};

export const hydrateReport = (row: ReportRow): ReportItem => ({
  ...row,
  confirm_count: Number(row.confirm_count || 0),
  city_name: cityNameMap.get(row.city_slug) || row.city_slug,
});

export const fetchVisibleReports = async (): Promise<ReportItem[]> => {
  const { data, error } = await supabase
    .from('reports')
    .select(REPORT_SELECT_COLUMNS)
    .eq('status', 'published')
    .eq('is_hidden', false)
    .order('observed_at', { ascending: false });

  if (error) {
    throw error;
  }

  return ((data || []) as ReportRow[]).map(hydrateReport);
};

export const fetchVisibleReportByPublicId = async (publicId: string): Promise<ReportItem | null> => {
  const { data, error } = await supabase
    .from('reports')
    .select(REPORT_SELECT_COLUMNS)
    .eq('public_id', publicId)
    .eq('status', 'published')
    .eq('is_hidden', false)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? hydrateReport(data as ReportRow) : null;
};

export const submitReport = async (payload: unknown): Promise<{ detail_path: string; public_id: string }> => {
  const { data, error } = await supabase.functions.invoke('create-report', {
    body: payload,
  });

  if (error) {
    throw error;
  }

  if (!data?.report?.detail_path || !data?.report?.public_id) {
    throw new Error('De melding werd opgeslagen, maar de detailpagina ontbreekt.');
  }

  return {
    detail_path: data.report.detail_path as string,
    public_id: data.report.public_id as string,
  };
};

export const flagReport = async (publicId: string): Promise<{ report_count: number; is_hidden: boolean }> => {
  const { data, error } = await supabase.functions.invoke('flag-report', {
    body: {
      public_id: publicId,
    },
  });

  if (error) {
    throw error;
  }

  return {
    report_count: Number(data?.report_count || 0),
    is_hidden: Boolean(data?.is_hidden),
  };
};

export const confirmReport = async (
  publicId: string,
): Promise<{ confirm_count: number; already_confirmed: boolean }> => {
  const { data, error } = await supabase.functions.invoke('confirm-report', {
    body: {
      public_id: publicId,
    },
  });

  if (error) {
    throw error;
  }

  return {
    confirm_count: Number(data?.confirm_count || 0),
    already_confirmed: Boolean(data?.already_confirmed),
  };
};

export const fetchAdminReports = async (): Promise<ReportItem[]> => {
  const data = await invokeAdminFunction<{ reports: ReportRow[] }>('list-admin-reports', {});

  return ((data?.reports || []) as ReportRow[]).map(hydrateReport);
};

export const updateAdminReportStatus = async (
  publicId: string,
  cityInterventionStatus: ReportInterventionStatus,
  cityInterventionNote: string,
): Promise<void> => {
  await invokeAdminFunction('update-report-status', {
      public_id: publicId,
      city_intervention_status: cityInterventionStatus,
      city_intervention_note: cityInterventionNote,
  });
};

export const removeAdminReport = async (publicId: string): Promise<void> => {
  await invokeAdminFunction('remove-report', {
    public_id: publicId,
  });
};
