import type { Hotspot, Service } from '../types.ts';

export type PlaceKind = 'hotspot' | 'service';

export const slugifyPlaceName = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const getHotspotDetailPath = (hotspot: Pick<Hotspot, 'city' | 'slug'>): string =>
  `/${hotspot.city}/hotspots/${hotspot.slug}`;

export const getServiceDetailPath = (service: Pick<Service, 'city' | 'slug'>): string =>
  `/${service.city}/diensten/${service.slug}`;

export const getPlaceDetailPath = (
  place: Pick<Hotspot | Service, 'city' | 'slug'>,
  kind: PlaceKind,
): string => (kind === 'hotspot' ? getHotspotDetailPath(place) : getServiceDetailPath(place));

export const getPlaceCollectionPath = (kind: PlaceKind): string =>
  kind === 'hotspot' ? '/hotspots' : '/diensten';

export const getPlaceTypeLabel = (kind: PlaceKind): string =>
  kind === 'hotspot' ? 'Hotspot' : 'Dienst';
