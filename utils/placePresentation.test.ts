import { describe, expect, it } from 'vitest';
import { SERVICES, HOTSPOTS } from '../constants';
import { getPlaceCategory, getPlaceFacts, getPlaceImages, getPlaceIntro } from './placePresentation';

describe('Business presentation uses supplied facts', () => {
  it('does not turn a water bowl or a terrace into permission to enter indoors', () => {
    const place = { ...HOTSPOTS[0], summary: undefined, tags: ['Terras', 'Waterbak aanwezig', 'Aanrader'] };
    expect(getPlaceFacts(place)).toEqual({ dog: ['Waterbak aanwezig'], other: ['Terras'] });
    expect(getPlaceIntro(place, 'Blankenberge')).toBe('Koffiebar in Blankenberge.');
  });
  it('keeps actual restrictions and dog facilities without interpreting them', () => {
    const place = { ...HOTSPOTS[0], tags: ['Max 2 honden', 'Kleine honden welkom', 'Indoor toegelaten', 'Hondensnacks'] };
    expect(getPlaceFacts(place).dog).toEqual(place.tags);
  });
  it('does not manufacture dog conditions or reasons for recommendations', () => {
    const place = { ...HOTSPOTS[0], tags: ['Aanrader', 'Specialty Coffee'] };
    expect(getPlaceFacts(place)).toEqual({ dog: [], other: ['Specialty Coffee'] });
  });
  it('selects a category for every kind of business', () => {
    expect(getPlaceCategory(HOTSPOTS[0])).toBe('food');
    expect(getPlaceCategory(HOTSPOTS.find(place => place.type === 'Slapen')!)).toBe('stay');
    expect(getPlaceCategory(SERVICES.find(place => place.type === 'Dierenarts')!)).toBe('care');
    expect(getPlaceCategory(SERVICES.find(place => place.type === 'Dierenspeciaalzaak')!)).toBe('shop');
    expect(getPlaceCategory(HOTSPOTS.find(place => place.type === 'Shoppen')!)).toBe('shop');
  });
  it('uses real photo galleries without duplicating an image', () => {
    expect(getPlaceImages({ ...HOTSPOTS[0], images: ['/one.webp', '/two.webp', '/one.webp'] })).toEqual(['/one.webp', '/two.webp']);
    expect(getPlaceImages({ ...SERVICES[0], images: [] })).toEqual([SERVICES[0].image]);
  });
  it('preserves a supplied introduction and does not create medical urgency', () => {
    expect(getPlaceIntro({ ...HOTSPOTS[0], summary: 'Een eigen introductie.' }, 'Blankenberge')).toBe('Een eigen introductie.');
    expect(getPlaceIntro({ ...SERVICES[0], summary: undefined }, 'Oostende')).toBe('Dierenarts in Oostende.');
  });
});
