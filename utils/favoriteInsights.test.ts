import { describe, expect, it } from 'vitest';
import { favoriteAdminPath, favoriteCsv, favoritePublicPath, filterFavoritePlaces, type FavoritePlace } from './favoriteInsights.ts';
const fixture = (changes: Partial<FavoritePlace>): FavoritePlace => ({ place_id:'place-a',kind:'hotspot',city_slug:'oostende',place_slug:'cafe',name:'Café aan Zee',type:'Café',image:'',status:'published',temporarily_closed:false,saved_count:4,recent7_count:1,recent30_count:2,last_saved_at:'2026-10-02T14:00:00Z',...changes });
const filters = { query:'',city:'',kind:'',status:'',metric:'saved_count' as const,includeEmpty:false };
describe('favorite insights', () => {
  it('separates current totals from still-saved recent additions and sorts ties consistently', () => {
    const a=fixture({name:'A',saved_count:9,recent7_count:1}),b=fixture({place_id:'b',name:'B',saved_count:4,recent7_count:3}),c=fixture({place_id:'c',name:'C',saved_count:6,recent7_count:3});
    expect(filterFavoritePlaces([a,b,c],filters,{}).map(p=>p.name)).toEqual(['A','C','B']);
    expect(filterFavoritePlaces([a,b,c],{...filters,metric:'recent7_count'},{}).map(p=>p.name)).toEqual(['C','B','A']);
  });
  it('searches accents and city names, combines filters and retains unavailable places', () => {
    const a=fixture({}),b=fixture({place_id:null,status:'unlinked',kind:'offleash',name:'Duinen'});
    expect(filterFavoritePlaces([a,b],{...filters,query:'cafe',city:'oostende',kind:'hotspot'},{oostende:'Oostende'})).toEqual([a]);
    expect(filterFavoritePlaces([a,b],{...filters,status:'unavailable'},{})).toEqual([b]);
    expect(filterFavoritePlaces([a,b],{...filters,query:'Oosténde'},{oostende:'Oostende'})).toHaveLength(2);
  });
  it('distinguishes a true zero from an empty recent cohort', () => {
    const a=fixture({recent7_count:0}),b=fixture({saved_count:0,recent7_count:0});
    expect(filterFavoritePlaces([a,b],{...filters,metric:'recent7_count'},{})).toEqual([]);
    expect(filterFavoritePlaces([a,b],{...filters,metric:'recent7_count',includeEmpty:true},{})).toHaveLength(2);
    expect(filterFavoritePlaces([a,b],filters,{})).toEqual([a]);
  });
  it('never builds public or editor links for missing catalog records', () => {
    expect(favoritePublicPath(fixture({kind:'offleash'}))).toBe('/losloopzones/cafe');
    expect(favoriteAdminPath(fixture({kind:'offleash'}))).toBe('/admin/losloopzones/place-a');
    expect(favoritePublicPath(fixture({status:'archived'}))).toBeNull();
    expect(favoritePublicPath(fixture({status:'draft'}))).toBeNull();
    expect(favoritePublicPath(fixture({status:'unlinked',place_id:null}))).toBeNull();
    expect(favoriteAdminPath(fixture({place_id:null}))).toBeNull();
  });
  it('exports the selected records with safe spreadsheet cells, quotes and no member data', () => {
    const csv=favoriteCsv([fixture({name:'=HYPERLINK("evil")'}),fixture({status:'unlinked',place_id:null,name:'Lost; place'})],{oostende:'Oostende'});
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('"\'=HYPERLINK(""evil"")"');
    expect(csv).toContain('"Lost; place"');
    expect(csv).toContain('Toegevoegd laatste 7 dagen (nog bewaard)');
    expect(csv.split('\r\n')).toHaveLength(3);
    expect(csv).not.toMatch(/member_id|e-mailadres|account_id/);
  });
});
