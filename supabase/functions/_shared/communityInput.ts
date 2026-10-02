import { z } from 'zod';
const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).max(160);
const place = { city: slug, slug };
export const communityInput = z.discriminatedUnion('action', [
 z.object({ action: z.literal('export') }).strict(),
 z.object({ action: z.literal('state'), ...place }).strict(),
 z.object({ action: z.literal('like'), ...place, liked: z.boolean() }).strict(),
 z.object({ action: z.literal('submit'), ...place, rating: z.number().int().min(1).max(5), comment: z.string().trim().min(20).max(1000), name: z.string().trim().min(1).max(50), visitMonth: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])-01$/).nullable(), version: z.number().int().positive().nullable(), ownExperience: z.literal(true), website: z.string().max(1000).default('') }).strict(),
 z.object({ action: z.literal('withdraw'), ...place, version: z.number().int().positive() }).strict(),
 z.object({ action: z.literal('flag'), id: z.uuid(), reason: z.enum(['spam','privacy','abuse','off_topic','other']) }).strict(),
]);
