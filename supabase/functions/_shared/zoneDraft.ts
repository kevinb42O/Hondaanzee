import { z } from 'zod';
import { CONTENT_CITIES } from './contentDraft.ts';
const text=(n:number)=>z.string().trim().max(n);
const link=text(1000).refine(value=>{if(!value)return true;try{const u=new URL(value);return ['http:','https:'].includes(u.protocol)&&!u.username&&!u.password;}catch{return false;}},'Gebruik een volledige http- of https-link.');
export const zonePatch=z.object({
 name:text(200).min(1),description:text(12000).min(1),address:text(400).min(1),
 lat:z.number().finite().min(-90).max(90),lng:z.number().finite().min(-180).max(180),
 access:z.enum(['unknown','always','hours']),openingHours:z.object({open:z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),close:z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/)}).strict().nullable(),
 operationalStatus:z.enum(['unknown','open','temporarily_closed']),closureNote:text(1500),reopensOn:text(10).refine(v=>!v||/^\d{4}-\d{2}-\d{2}$/.test(v)),
 features:z.object({fenced:z.enum(['yes','no','unknown']),water:z.enum(['yes','no','unknown']),parking:z.enum(['yes','no','unknown']),accessible:z.enum(['yes','no','unknown'])}).partial().strict(),
 sourceUrl:link,lastVerifiedAt:text(10).refine(v=>!v||/^\d{4}-\d{2}-\d{2}$/.test(v)),visibility:z.enum(['visible','archived']),
}).partial().strict();
const media=z.object({image:text(1000),images:z.array(text(1000)).max(30),imagePosition:text(80).regex(/^(center|center top|center bottom|left center|right center|[0-9]{1,3}% [0-9]{1,3}%|center [0-9]{1,3}%)$/)}).strict();
export const zoneRequest=z.discriminatedUnion('action',[
 z.object({action:z.literal('list')}).strict(),z.object({action:z.literal('detail'),id:z.uuid()}).strict(),
 z.object({action:z.literal('save'),id:z.uuid(),version:z.number().int().positive(),patch:zonePatch,media:media.optional()}).strict(),
 z.object({action:z.literal('create'),city:z.enum(CONTENT_CITIES),slug:z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).max(160),patch:zonePatch.required({name:true,description:true,address:true,lat:true,lng:true})}).strict(),
]);
export function mergeZone(original:Record<string,unknown>,patch:z.infer<typeof zonePatch>){
 const content={...original,...patch,...(patch.features?{features:{...(original.features as object||{}),...patch.features}}:{})};
 if(content.access==='hours'&&!content.openingHours)throw new Error('Vul bevestigde openingstijden in.');
 if(content.operationalStatus==='temporarily_closed'&&!String(content.closureNote||'').trim())throw new Error('Geef een toelichting bij de tijdelijke sluiting.');
 return content;
}
