import {z}from 'zod';
export const reviewInput=z.discriminatedUnion('action',[
 z.object({action:z.literal('submit'),areaSlug:z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).max(160),rating:z.number().int().min(1).max(5),name:z.string().trim().min(1).max(50),comment:z.string().trim().max(500),website:z.string().max(1000).optional()}).strict(),
 z.object({action:z.literal('flag'),id:z.uuid(),reason:z.enum(['spam','privacy','abuse','off_topic','other']),website:z.string().max(1000).optional()}).strict(),
]);
