import React from 'react';
import { ArrowUpRight, MapPin, Phone } from 'lucide-react';
import { CATEGORY_COPY, directionsUrl, getPlaceCategory, type Place } from '../../utils/placePresentation';
import { trackPlaceAction } from '../../utils/placeAnalytics';
import type { PlaceKind } from '../../utils/placeRoutes';

export default function PlaceContact({ place, kind }: { place: Place; kind: PlaceKind }) {
  const copy = CATEGORY_COPY[getPlaceCategory(place)];
  const button = 'inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-700';
  return (
    <div data-place-actions className="flex flex-wrap gap-2.5">
      {place.website && <a href={place.website} target="_blank" rel="noopener noreferrer" onClick={() => trackPlaceAction(place, kind, 'website')} className={`${button} bg-slate-900 text-white hover:bg-slate-700`}>
        {place.websiteLabel || copy.website}<ArrowUpRight size={17} aria-hidden="true" />
      </a>}
      <a href={directionsUrl(place.address)} target="_blank" rel="noopener noreferrer" onClick={() => trackPlaceAction(place, kind, 'route')} className={`${button} border border-slate-300 bg-white text-slate-900 hover:border-slate-500`}><MapPin size={17} aria-hidden="true" />Route</a>
      {place.phone && <a href={`tel:${place.phone}`} onClick={() => trackPlaceAction(place, kind, 'telefoon')} className={`${button} border border-slate-300 bg-white text-slate-900 hover:border-slate-500`}><Phone size={17} aria-hidden="true" />Bel de zaak</a>}
    </div>
  );
}
