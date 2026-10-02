import { afterEach, describe, expect, it, vi } from 'vitest';
import { communityInput } from '../supabase/functions/_shared/communityInput.ts';
import { clearCommunityIntent, readCommunityIntent, rememberCommunityIntent, reviewScore, reviewStatus, type OwnReview } from './hotspotCommunity.ts';

afterEach(()=>vi.unstubAllGlobals());
describe('public contribution boundary',()=>{
 const review={action:'submit',city:'oostende',slug:'voorbeeld',rating:4,comment:'Een fijne ontvangst met onze hond binnen.',name:'Baasje',visitMonth:null,version:null,ownExperience:true};
 it('rejects client supplied ownership and publication fields',()=>{
  expect(communityInput.safeParse(review).success).toBe(true);
  for(const extra of[{member_id:'spoofed'},{status:'published'},{public_rating:5}])expect(communityInput.safeParse({...review,...extra}).success).toBe(false);
 });
 it('requires an experience declaration, valid score, context and meaningful text',()=>{
  for(const patch of[{ownExperience:false},{rating:0},{rating:6},{rating:4.5},{comment:'   '},{name:''},{version:0},{visitMonth:'2026-13-01'},{slug:'../admin'}])expect(communityInput.safeParse({...review,...patch}).success).toBe(false);
 });
 it('accepts only desired like state, never a counter or arbitrary toggle',()=>{
  expect(communityInput.safeParse({action:'like',city:'oostende',slug:'voorbeeld',liked:true}).success).toBe(true);
  expect(communityInput.safeParse({action:'like',city:'oostende',slug:'voorbeeld',count:99}).success).toBe(false);
 });
 it('keeps unreviewed and zero-rated states distinct',()=>{
  expect(reviewScore({count:0,average:null})).toBe(null);
  expect(reviewScore({count:1,average:4})).toBe('4,0');
 });
 it('does not tell the author that a rejected edit is published',()=>{
  const own:OwnReview={id:'review',version:3,status:'published',needs_review:false,has_published:true,rejected_edit:true,rating:2,comment:'Afgewezen wijziging',name:'Baasje',visit_month:null};
  expect(reviewStatus(own)).toContain('Je wijziging is niet gepubliceerd');
  expect(reviewStatus({...own,needs_review:true})).toContain('wacht op controle');
  expect(reviewStatus({...own,rejected_edit:false})).toBe('Je review is gepubliceerd.');
 });
});
describe('return after account creation',()=>{
 const memory=new Map<string,string>();
 const mockStorage=()=>{memory.clear();vi.stubGlobal('sessionStorage',{getItem:(k:string)=>memory.get(k)??null,setItem:(k:string,v:string)=>memory.set(k,v),removeItem:(k:string)=>memory.delete(k)});};
 it('retains the requested place and expires old intent',()=>{
  mockStorage();rememberCommunityIntent({city:'oostende',slug:'voorbeeld'},'review');expect(readCommunityIntent()?.action).toBe('review');
  const [key,raw]=[...memory.entries()][0];memory.set(key,JSON.stringify({...JSON.parse(raw),at:Date.now()-1800001}));expect(readCommunityIntent()).toBeNull();expect(memory.size).toBe(0);
 });
 it('rejects malformed stored routes and tolerates unavailable storage',()=>{
  mockStorage();rememberCommunityIntent({city:'oostende',slug:'voorbeeld'},'like');const [key,raw]=[...memory.entries()][0];memory.set(key,JSON.stringify({...JSON.parse(raw),slug:'//elsewhere'}));expect(readCommunityIntent()).toBeNull();
  vi.stubGlobal('sessionStorage',{getItem:()=>{throw new Error('disabled');},setItem:()=>{throw new Error('disabled');},removeItem:()=>{throw new Error('disabled');}});expect(()=>rememberCommunityIntent({city:'oostende',slug:'voorbeeld'},'like')).not.toThrow();expect(readCommunityIntent()).toBeNull();expect(()=>clearCommunityIntent()).not.toThrow();
 });
});
