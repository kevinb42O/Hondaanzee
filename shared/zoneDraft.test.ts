import{describe,expect,it}from'vitest';import{zoneRequest,mergeZone}from'../supabase/functions/_shared/zoneDraft.ts';import{reviewInput}from'../supabase/functions/_shared/reviewInput.ts';
const id='10000000-0000-4000-8000-000000000001';
describe('zone and review input boundaries',()=>{
 it('rejects identity/rating edits and external images in the content patch',()=>{
  for(const patch of[{slug:'replacement'},{rating:5},{image:'https://example.com/x.jpg'},{lat:91},{lng:NaN}])expect(zoneRequest.safeParse({action:'save',id,version:1,patch}).success).toBe(false);
 });
 it('preserves legacy fields and requires confirmed hours and a closure explanation',()=>{
  const original={name:'Zone',image:'/original.webp',custom:'keep',rating:4};expect(mergeZone(original,{name:'New'})).toEqual({...original,name:'New'});
  expect(()=>mergeZone(original,{access:'hours'})).toThrow('openingstijden');
  expect(()=>mergeZone(original,{operationalStatus:'temporarily_closed'})).toThrow('sluiting');
 });
 it('does not let public callers supply identity, status or an account id',()=>{
  const submit={action:'submit',areaSlug:'test-zone',rating:3,name:'Bezoeker',comment:'Ervaring'};
  expect(reviewInput.safeParse(submit).success).toBe(true);
  for(const extra of[{status:'published'},{user_id:id},{zone_id:id},{rating:3.5},{name:' '}])expect(reviewInput.safeParse({...submit,...extra}).success).toBe(false);
 });
});
