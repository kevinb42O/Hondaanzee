import {describe,it,expect} from 'vitest';
import {analyticsInput,isMeasuredPath,referrerCategory} from '../supabase/functions/_shared/siteAnalytics.ts';
describe('private bounded analytics',()=>{
 it('rejects admin, query strings, unsafe and unbounded dimensions',()=>{
  for(const path of ['/admin','/admin/zaken','/_meldpunt-admin','/?email=secret','/../admin'])expect(isMeasuredPath(path)).toBe(false);
  expect(isMeasuredPath('/blankenberge/hotspots/lakaiann')).toBe(true);
  expect(analyticsInput.safeParse({path:'/',event:'pageview',device:'desktop',referrer:'direct',email:'secret'}).success).toBe(false);
 });
 it('reduces referrers to fixed labels without private URL details',()=>{
  expect(referrerCategory('https://www.google.be/search?q=private')).toBe('google');
  expect(referrerCategory('https://google.be.evil.com')).toBe('other');
  expect(referrerCategory('https://l.facebook.com/private')).toBe('facebook');
  expect(referrerCategory('https://www.hondaanzee.be/admin?token=x')).toBe('hondaanzee');
  expect(referrerCategory('')).toBe('direct');
 });
});
