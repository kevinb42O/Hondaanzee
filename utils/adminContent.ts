import { supabase } from './supabaseClient.ts';
import type { Hotspot, Service } from '../types.ts';

export type ContentPlace = {
  id: string; kind: 'hotspot' | 'service'; legacy_id: number; slug: string; city_slug: string;
  version: number; draft_revision_id: string; published_revision_id: string | null;
  archived_at: string | null; updated_at: string;
  draft: { content: Hotspot | Service }; published: { content: Hotspot | Service } | null;
};
export async function adminContent<T>(body: Record<string, unknown>): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Log eerst in met je beheeraccount.');
  const { data, error } = await supabase.functions.invoke('admin-content', {
    body, headers: { 'x-admin-access-token': session.access_token },
  });
  if (error) {
    let message = 'De gegevens konden niet worden verwerkt. Probeer opnieuw.';
    if (error.context instanceof Response) {
      const response = await error.context.json().catch(() => null);
      if (response?.error) message = response.error;
    }
    throw new Error(message);
  }
  return data as T;
}
