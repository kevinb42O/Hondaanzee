export const PUSH_TITLE_LIMIT = 120;
export const PUSH_BODY_LIMIT = 400;

export function normalizePushUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '/';
  if (/^[a-z][a-z\d+.-]*:/i.test(trimmed) || trimmed.startsWith('/')) return trimmed;
  return `/${trimmed}`;
}

export function pushUrlError(value: string): string | null {
  const normalized = normalizePushUrl(value);
  if (normalized.length > 2048 || /[\s\\]/.test(normalized)) return 'Gebruik een geldige link zonder spaties of backslashes.';
  if (normalized.startsWith('//')) return 'Gebruik een volledig https-adres voor een externe website.';
  if (normalized.startsWith('/')) return null;
  try {
    const url = new URL(normalized);
    if (['https:', 'http:'].includes(url.protocol) && !url.username && !url.password) return null;
  } catch { /* Invalid or unsupported URL. */ }
  return 'Gebruik een websitepad of een volledig https-adres.';
}

export interface PushLogEntry {
  id: string; title: string; body: string | null; url: string | null;
  sent_count: number; failed_count: number; total_count: number;
  sent_by: string | null; created_at: string;
}

export function pushDeliveryLabel(entry: Pick<PushLogEntry, 'sent_count' | 'failed_count' | 'total_count'>): string {
  if (entry.total_count === 0) return 'Geen ontvangers';
  if (entry.sent_count === 0) return 'Niet afgeleverd';
  return entry.failed_count > 0 ? 'Deels afgeleverd' : 'Afgeleverd';
}
