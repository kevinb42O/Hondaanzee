import React from 'react';
import { ArrowUpRight, Clock, MapPin, Phone } from 'lucide-react';
import { CATEGORY_COPY, directionsUrl, getPlaceCategory, type Place } from '../../utils/placePresentation';
import { trackPlaceAction } from '../../utils/placeAnalytics';
import type { PlaceKind } from '../../utils/placeRoutes';
import type { OpeningHours } from '../../types';

const DAYS = [['ma', 'Maandag'], ['di', 'Dinsdag'], ['wo', 'Woensdag'], ['do', 'Donderdag'], ['vr', 'Vrijdag'], ['za', 'Zaterdag'], ['zo', 'Zondag']] as const;

function Hours({ hours, note }: { hours: OpeningHours; note?: string }) {
  return <div data-place-hours>
    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900"><Clock size={17} aria-hidden="true" />Openingstijden</h3>
    <dl className="space-y-2 text-sm">
      {DAYS.filter(([key]) => hours[key] !== undefined).map(([key, label]) => <div key={key} className="flex justify-between gap-4"><dt className="text-slate-600">{label}</dt><dd className="text-right font-medium text-slate-900">{hours[key] ?? 'Gesloten'}</dd></div>)}
    </dl>
    {note && <p className="mt-4 text-sm leading-relaxed text-slate-600">{note}</p>}
    <p className="mt-4 text-xs leading-relaxed text-slate-500">Feestdagen en uitzonderingen kunnen afwijken. Controleer de actuele uren bij de zaak.</p>
  </div>;
}

export default function PlacePractical({ place, kind }: { place: Place; kind: PlaceKind }) {
  const copy = CATEGORY_COPY[getPlaceCategory(place)];
  const linkClass = 'inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-sky-800 underline decoration-sky-800/30 underline-offset-4 hover:decoration-sky-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4';
  return <section data-place-practical aria-labelledby="practical-title" className="rounded-xl border border-slate-200 bg-white p-6 sm:p-7">
    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Praktisch</p>
    <h2 id="practical-title" className="mb-6 text-2xl font-semibold tracking-tight text-slate-900">{copy.title}</h2>
    <div className="space-y-6 divide-y divide-slate-200">
      <div>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900"><MapPin size={17} aria-hidden="true" />Adres</h3>
        <address className="text-[15px] not-italic leading-relaxed text-slate-700">{place.address}</address>
        <a href={directionsUrl(place.address)} target="_blank" rel="noopener noreferrer" onClick={() => trackPlaceAction(place, kind, 'route')} className={linkClass}>Open in Google Maps<ArrowUpRight size={15} aria-hidden="true" /></a>
      </div>
      {place.phone && <div className="pt-6"><h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-900"><Phone size={17} aria-hidden="true" />Telefoon</h3><a href={`tel:${place.phone}`} onClick={() => trackPlaceAction(place, kind, 'telefoon')} className={linkClass}>{place.phone}</a></div>}
      {'openingHours' in place && place.openingHours && <div className="pt-6"><Hours hours={place.openingHours} note={place.openingHoursNote} /></div>}
      <div className="pt-6">
        <p className="text-sm leading-relaxed text-slate-600">{'openingHoursNote' in place && place.openingHoursNote && !place.openingHours ? place.openingHoursNote : copy.note}</p>
        {place.website && <a href={place.website} target="_blank" rel="noopener noreferrer" onClick={() => trackPlaceAction(place, kind, 'website')} className={`${linkClass} mt-2`}>{place.websiteLabel || copy.website}<ArrowUpRight size={15} aria-hidden="true" /></a>}
      </div>
    </div>
  </section>;
}
