import React from 'react';
import { PawPrint } from 'lucide-react';
import { getPlaceCategory, getPlaceFacts, type Place } from '../../utils/placePresentation';

export default function PlaceFacts({ place }: { place: Place }) {
  const { dog } = getPlaceFacts(place);
  const category = getPlaceCategory(place);
  return <section data-place-dog-info className="border-t border-slate-300/80 pt-6" aria-labelledby="dog-info-title">
    <div className="mb-5 flex items-center gap-3"><PawPrint size={23} className="text-sky-800" aria-hidden="true" /><h2 id="dog-info-title" className="text-xl font-semibold tracking-tight text-slate-900">{category === 'care' ? 'Met je huisdier' : 'Met je hond'}</h2></div>
    {dog.length > 0 ? <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
      {dog.map(tag => <li key={tag} className="flex items-start gap-3 text-[15px] leading-relaxed text-slate-800"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-700" aria-hidden="true" />{tag}</li>)}
    </ul> : <p className="text-[15px] leading-relaxed text-slate-700">De specifieke hondenvoorwaarden zijn niet apart vermeld. Vraag de zaak vooraf wat mogelijk is.</p>}
    {dog.length > 0 && <p className="mt-5 text-sm leading-relaxed text-slate-500">Volgens de gegevens in deze vermelding. Vraag de zaak naar eventuele voorwaarden voor je bezoek.</p>}
  </section>;
}
