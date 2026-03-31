import { describe, expect, it } from 'vitest';
import { OFF_LEASH_AREAS } from '../data/offLeashAreas';
import {
  getOffLeashAreaPath,
  getOffLeashAreasPath,
  resolveOffLeashAreaSelection,
} from './offLeashRoutes.ts';

describe('resolveOffLeashAreaSelection', () => {
  it('selects the requested zone when a valid slug route is used', () => {
    const area = OFF_LEASH_AREAS.find((entry) => entry.slug === 'oostende-schorrepark');
    expect(area).toBeTruthy();

    const result = resolveOffLeashAreaSelection(OFF_LEASH_AREAS, 'oostende-schorrepark', null);

    expect(result).toEqual({
      selectedSlug: 'oostende-schorrepark',
      canonicalPath: null,
      source: 'route',
    });
  });

  it('keeps the generic overview unselected when no slug or legacy query is present', () => {
    const result = resolveOffLeashAreaSelection(OFF_LEASH_AREAS, undefined, null);

    expect(result).toEqual({
      selectedSlug: null,
      canonicalPath: null,
      source: 'none',
    });
  });

  it('converts a legacy area index to the canonical slug path', () => {
    const targetIndex = OFF_LEASH_AREAS.findIndex((entry) => entry.slug === 'blankenberge-vande-puttelaan');
    expect(targetIndex).toBeGreaterThanOrEqual(0);

    const result = resolveOffLeashAreaSelection(OFF_LEASH_AREAS, undefined, String(targetIndex));

    expect(result).toEqual({
      selectedSlug: 'blankenberge-vande-puttelaan',
      canonicalPath: getOffLeashAreaPath('blankenberge-vande-puttelaan'),
      source: 'legacy-query',
    });
  });

  it('falls back safely to the overview when the slug is invalid', () => {
    const result = resolveOffLeashAreaSelection(OFF_LEASH_AREAS, 'bestaat-niet', null);

    expect(result).toEqual({
      selectedSlug: null,
      canonicalPath: getOffLeashAreasPath(),
      source: 'invalid',
    });
  });

  it('falls back safely to the overview when the legacy index is invalid', () => {
    const result = resolveOffLeashAreaSelection(OFF_LEASH_AREAS, undefined, '9999');

    expect(result).toEqual({
      selectedSlug: null,
      canonicalPath: getOffLeashAreasPath(),
      source: 'invalid',
    });
  });

  it('prefers the slug route over a legacy query when both are present', () => {
    const result = resolveOffLeashAreaSelection(
      OFF_LEASH_AREAS,
      'oostende-schorrepark',
      '0',
    );

    expect(result).toEqual({
      selectedSlug: 'oostende-schorrepark',
      canonicalPath: null,
      source: 'route',
    });
  });
});
