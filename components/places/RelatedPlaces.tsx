import React from 'react';
import HotspotSocialSummary from './HotspotSocialSummary.tsx';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CITIES } from '../../cityData';
import type { Place } from '../../utils/placePresentation';
import { getPlaceDetailPath, type PlaceKind } from '../../utils/placeRoutes';

export default function RelatedPlaces({ places, kind, cityName, from }: { places: Place[]; kind: PlaceKind; cityName: string; from: string }) {
  if (!places.length) return null;
  return <section className="border-t border-slate-300/80 py-10 sm:py-14" aria-labelledby="related-title">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4"><h2 id="related-title" className="text-2xl font-semibold tracking-tight text-slate-900">Ook in {cityName}</h2><Link to={`/${places[0].city}`} className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-sky-800">Ontdek {cityName}<ArrowUpRight size={17} aria-hidden="true" /></Link></div>
    <div className="grid gap-6 sm:grid-cols-3">
      {places.map(place => <Link key={getPlaceDetailPath(place, kind)} to={getPlaceDetailPath(place, kind)} state={{ from }} className="group min-w-0 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-700">
        <img src={place.image} alt={place.name} width={600} height={400} loading="lazy" decoding="async" className="aspect-[3/2] w-full rounded-lg object-cover" style={{ objectPosition: place.imagePosition || 'center' }} />
        {kind==='hotspot'&&<div className="mt-3"><HotspotSocialSummary place={{city:place.city,slug:place.slug}}/></div>}
        <p className="mt-4 text-xs font-medium text-slate-500">{place.type} · {CITIES.find(city => city.slug === place.city)?.name}</p>
        <div className="mt-1 flex items-start justify-between gap-3"><h3 className="text-lg font-semibold tracking-tight text-slate-900 group-hover:text-sky-800">{place.name}</h3><ArrowUpRight size={19} className="mt-1 shrink-0 text-slate-500" aria-hidden="true" /></div>
      </Link>)}
    </div>
  </section>;
}
