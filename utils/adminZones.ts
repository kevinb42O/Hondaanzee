import type{OffLeashArea}from'../types.ts';import{adminFunction}from'./adminContent.ts';
export type ZoneRecord={id:string;kind:'offleash';legacy_id:number;slug:string;city_slug:string;version:number;draft_revision_id:string;published_revision_id:string|null;archived_at:string|null;updated_at:string;draft:{content:OffLeashArea};published:{content:OffLeashArea}|null};
export type ReviewOverview={counts:Record<string,number>;places?:Record<string,{published:number;pending:number;attention:number;average:number|null;likes:number}>;zones:Record<string,{published:number;pending:number;attention:number;average:number|null}>};
export const adminZones=<T,>(body:Record<string,unknown>)=>adminFunction<T>('admin-zones',body);
