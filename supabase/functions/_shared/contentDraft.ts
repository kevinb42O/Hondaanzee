import { z } from 'zod';

export const CONTENT_CITIES = ['blankenberge', 'zeebrugge', 'knokke-heist', 'de-haan', 'wenduine', 'bredene', 'oostende', 'middelkerke', 'nieuwpoort', 'koksijde', 'de-panne'] as const;
export const HOTSPOT_TYPES = ['Café', 'Koffiebar', 'Slapen', 'Restaurant', 'Brasserie', 'Shoppen'] as const;
export const SERVICE_TYPES = ['Dierenarts', 'Dierenspeciaalzaak'] as const;
const text = (max: number) => z.string().trim().max(max);
const webUrl = text(1000).refine(value => {
  if (!value) return true;
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password; } catch { return false; }
}, 'Gebruik een volledige http- of https-link.');

// Patch only editable fields. Identity, unknown legacy properties and every
// image reference are retained from the server's original complete object.
export const contentDraftPatch = z.object({
  name: text(200).min(1), type: z.enum([...HOTSPOT_TYPES, ...SERVICE_TYPES]),
  description: text(12000).min(1), address: text(400).min(1),
  summary: text(1200), recommendationNote: text(2000),
  phone: text(80), website: webUrl, websiteLabel: text(100),
  tags: z.array(text(80).min(1)).max(30),
  sameAs: z.array(webUrl.refine(value => !!value)).max(15),
  openingHours: z.object(Object.fromEntries(['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'].map(day => [day, text(100).nullable().optional()]))).strict(),
  openingHoursNote: text(1000), openingHoursWeatherDependent: z.boolean(),
}).partial().strict();

export const contentDraftRequest = z.discriminatedUnion('action', [
  z.object({ action: z.literal('list') }).strict(),
  z.object({ action: z.literal('detail'), id: z.uuid() }).strict(),
  z.object({ action: z.literal('save'), id: z.uuid(), version: z.number().int().positive(), patch: contentDraftPatch }).strict(),
  z.object({ action: z.literal('create'), kind: z.enum(['hotspot', 'service']), city: z.enum(CONTENT_CITIES), slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).max(160), patch: contentDraftPatch.required({ name: true, type: true, description: true, address: true }) }).strict(),
]);

export function mergeContentDraft(kind: string, original: Record<string, unknown>, patch: z.infer<typeof contentDraftPatch>) {
  const types: readonly string[] = kind === 'hotspot' ? HOTSPOT_TYPES : SERVICE_TYPES;
  if (patch.type && !types.includes(patch.type)) throw new Error('Kies een categorie die bij deze vermelding past.');
  if (kind === 'service' && ['openingHours', 'openingHoursNote', 'openingHoursWeatherDependent'].some(field => field in patch)) throw new Error('Openingstijden zijn alleen beschikbaar voor hotspots.');
  return { ...original, ...patch };
}
