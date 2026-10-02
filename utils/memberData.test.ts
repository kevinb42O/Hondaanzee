import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearPendingSave, placeKey, readPendingSave, rememberPendingSave, safeMemberReturnPath } from './memberStore.ts';
import { MEMBER_CATALOG, resolveSavedPlace } from './memberData.ts';

describe('Member place identity and login return paths', () => {
  it('resolves the current public catalog without conflating kinds or towns', () => {
    expect(MEMBER_CATALOG.length).toBeGreaterThan(150);
    expect(new Set(MEMBER_CATALOG.map(placeKey)).size).toBe(MEMBER_CATALOG.length);
    const place = MEMBER_CATALOG.find(p => p.name === 'Lakaiann')!;
    expect(resolveSavedPlace(place)?.path).toBe('/blankenberge/hotspots/lakaiann');
    const offleash = MEMBER_CATALOG.find(p => p.kind === 'offleash')!;
    expect(resolveSavedPlace(offleash)?.path).toBe(`/losloopzones/${offleash.place_slug}`);
    expect(resolveSavedPlace({ ...place, kind: 'unexpected' } as never)).toBeNull();
    expect(resolveSavedPlace({ ...place, place_slug: 'no-longer-published' })).toBeNull();
  });
  it('only returns to a local public page', () => {
    expect(safeMemberReturnPath('/blankenberge/hotspots/lakaiann')).toBe('/blankenberge/hotspots/lakaiann');
    expect(safeMemberReturnPath('/hotspots?city=de-haan')).toBe('/hotspots?city=de-haan');
    for (const path of ['https://evil.example', '//evil.example', '/\\evil.example', '/admin', '/admin/leden', '/_meldpunt-admin', '/account?next=//evil.example', '/\nevil.example', '']) expect(safeMemberReturnPath(path)).toBe('/account');
  });
});
describe('First favorite carried through registration', () => {
  const storage = new Map<string, string>();
  beforeEach(() => {
    storage.clear();
    vi.stubGlobal('localStorage', { getItem: (key: string) => storage.get(key) || null, setItem: (key: string, value: string) => storage.set(key, value), removeItem: (key: string) => storage.delete(key) });
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-02T18:00:00Z'));
  });
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
  const place = { kind: 'hotspot' as const, city_slug: 'blankenberge', place_slug: 'lakaiann' };
  it('preserves the selected place and expires it after a day', () => {
    rememberPendingSave(place); expect(readPendingSave()).toEqual(place);
    vi.advanceTimersByTime(86400001); expect(readPendingSave()).toBeNull();
    rememberPendingSave(place); clearPendingSave(); expect(readPendingSave()).toBeNull();
  });
  it('ignores malformed browser storage and unavailable storage', () => {
    storage.set('haz-pending-save-v1', '{broken'); expect(readPendingSave()).toBeNull();
    storage.set('haz-pending-save-v1', JSON.stringify({ ...place, kind: 'admin', at: Date.now() })); expect(readPendingSave()).toBeNull();
    storage.set('haz-pending-save-v1', JSON.stringify({ ...place, place_slug: '../private', at: Date.now() })); expect(readPendingSave()).toBeNull();
    vi.stubGlobal('localStorage', { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); }, removeItem: () => { throw new Error('blocked'); } });
    expect(() => rememberPendingSave(place)).not.toThrow(); expect(readPendingSave()).toBeNull(); expect(() => clearPendingSave()).not.toThrow();
  });
});
