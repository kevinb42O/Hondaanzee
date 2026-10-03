import { z } from 'zod';
export const analyticsInput = z.object({
 path: z.string().max(240).regex(/^\/(?:[a-z0-9-]+(?:\/[a-z0-9-]+)*)?$/),
 event: z.enum(['pageview','website','route','telefoon','social','ticket','email']),
 referrer: z.enum(['direct','google','bing','facebook','instagram','hondaanzee','other']),
 device: z.enum(['mobile','tablet','desktop']),
}).strict();
export function referrerCategory(value: string): string {
 if (!value) return 'direct';
 try {
  const host = new URL(value).hostname.toLowerCase();
  if (/^(www\.)?hondaanzee\.be$/.test(host)) return 'hondaanzee';
  if (/(^|\.)google\.(com|be|nl|fr|de|co\.uk)$/.test(host)) return 'google';
  for (const name of ['bing','facebook','instagram']) if (host === `${name}.com` || host.endsWith(`.${name}.com`)) return name;
 } catch { /* never store malformed referrers */ }
 return 'other';
}
export function isMeasuredPath(path: string) {
 return analyticsInput.shape.path.safeParse(path).success && path !== '/admin' && !path.startsWith('/admin/') && path !== '/_meldpunt-admin' && path !== '/account' && !path.startsWith('/account/') && !path.startsWith('/uitstap/');
}
