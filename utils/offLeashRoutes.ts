import type { OffLeashArea } from '../types.ts';

const OFF_LEASH_AREAS_PATH = '/losloopzones';

export type OffLeashSelectionSource = 'route' | 'legacy-query' | 'none' | 'invalid';

export interface ResolvedOffLeashAreaSelection {
  selectedSlug: string | null;
  canonicalPath: string | null;
  source: OffLeashSelectionSource;
}

export const getOffLeashAreasPath = (): string => OFF_LEASH_AREAS_PATH;

export const getOffLeashAreaPath = (slug: string): string => `${OFF_LEASH_AREAS_PATH}/${slug}`;

export const findOffLeashAreaBySlug = (
  areas: OffLeashArea[],
  slug?: string | null,
): OffLeashArea | null => {
  if (!slug) return null;
  return areas.find((area) => area.slug === slug) || null;
};

export const resolveOffLeashAreaSelection = (
  areas: OffLeashArea[],
  slugParam?: string,
  legacyAreaParam?: string | null,
): ResolvedOffLeashAreaSelection => {
  if (slugParam) {
    const matchedArea = findOffLeashAreaBySlug(areas, slugParam);
    if (matchedArea) {
      return {
        selectedSlug: matchedArea.slug,
        canonicalPath: null,
        source: 'route',
      };
    }

    return {
      selectedSlug: null,
      canonicalPath: getOffLeashAreasPath(),
      source: 'invalid',
    };
  }

  if (legacyAreaParam != null) {
    const areaIndex = Number.parseInt(legacyAreaParam, 10);
    const matchedArea =
      Number.isInteger(areaIndex) && areaIndex >= 0 && areaIndex < areas.length
        ? areas[areaIndex]
        : null;

    if (matchedArea) {
      return {
        selectedSlug: matchedArea.slug,
        canonicalPath: getOffLeashAreaPath(matchedArea.slug),
        source: 'legacy-query',
      };
    }

    return {
      selectedSlug: null,
      canonicalPath: getOffLeashAreasPath(),
      source: 'invalid',
    };
  }

  return {
    selectedSlug: null,
    canonicalPath: null,
    source: 'none',
  };
};
