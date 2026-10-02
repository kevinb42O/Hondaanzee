import React from 'react';
import { ArrowLeft, ArrowUpRight, MapPin } from 'lucide-react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { HOTSPOTS, SERVICES } from '../constants';
import { CITIES } from '../cityData';
import { getPlaceSEO, useSEO } from '../utils/seo';
import { getPlaceCollectionPath, type PlaceKind } from '../utils/placeRoutes';
import { CATEGORY_COPY, getPlaceCategory, getPlaceFacts, getPlaceIntro, type Place } from '../utils/placePresentation';
import { trackPlaceAction } from '../utils/placeAnalytics';
import type { City } from '../types';
import Breadcrumb from '../components/Breadcrumb';
import PlaceContact from '../components/places/PlaceContact';
import PlaceGallery from '../components/places/PlaceGallery';
import PlaceFacts from '../components/places/PlaceFacts';
import PlacePractical from '../components/places/PlacePractical';
import RelatedPlaces from '../components/places/RelatedPlaces';
import NotFound from './NotFound';
import { resolvePublicPlace, isPlaceBlockVisible } from '../supabase/functions/_shared/placeFields.ts';
import SavePlaceButton from '../components/member/SavePlaceButton.tsx';

interface PlaceDetailProps { kind: PlaceKind }

export const ResolvedPlaceDetail: React.FC<PlaceDetailProps & { place: Place; cityData: City; preview?:boolean }> = ({ kind, place: draft, cityData, preview=false }) => {
  const place = resolvePublicPlace(draft);
  const location = useLocation();
  const navigate = useNavigate();
  const category = getPlaceCategory(place);
  const copy = CATEGORY_COPY[category];
  const facts = getPlaceFacts(place);
  const collectionPath = getPlaceCollectionPath(kind);
  const collection = kind === 'hotspot' ? HOTSPOTS : SERVICES;
  const related = collection.filter(entry => entry.city === place.city && entry.slug !== place.slug)
    .sort((a, b) => Number(b.type === place.type) - Number(a.type === place.type) || a.name.localeCompare(b.name, 'nl')).slice(0, 3);
  const paragraphs = place.description.split(/\n\s*\n/).map(paragraph => paragraph.trim()).filter(Boolean);
  const heroTitle = place.name;
  useSEO(preview?{title:`Concept: ${place.name} | Hond aan Zee`,description:'Voorbeeld van een nog niet gepubliceerde vermelding.',canonical:`https://hondaanzee.be${location.pathname}`,noindex:true}:getPlaceSEO(place, cityData, kind));

  const back = () => {
    if (window.history.state?.idx > 0) return navigate(-1);
    const from = typeof location.state?.from === 'string' ? location.state.from : null;
    navigate(from || `/${place.city}`);
  };

  return <div data-place-category={category} className="min-h-full bg-[#f6f5f1] text-slate-900">
    <div className="mx-auto max-w-[1280px] px-5 pt-28 sm:px-8 lg:px-12">
      <div className="mb-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-slate-300/80 pb-5 sm:mb-10">
        <button onClick={preview ? undefined : back} type="button" className="inline-flex min-h-[44px] shrink-0 items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"><ArrowLeft size={17} aria-hidden="true" />Terug</button>
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: cityData.name, to: `/${place.city}` }, { label: kind === 'hotspot' ? 'Hotspots' : 'Diensten', to: collectionPath }, { label: place.name }]} />
      </div>

      <div className="grid items-start gap-8 pb-10 sm:gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14 lg:pb-14">
        <div className="min-w-0 lg:py-5">
          <p className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold uppercase tracking-[0.16em] text-sky-800"><span>{copy.label}</span><span className="h-px w-6 bg-sky-800/40" aria-hidden="true" /><span>{cityData.name}</span></p>
          <h1 className="mb-5 break-words text-[clamp(2.25rem,4vw,3.75rem)] font-semibold leading-[1.08] tracking-[-0.045em]" style={{ overflowWrap: 'anywhere' }}>{heroTitle}</h1>
          <p className="max-w-lg text-lg leading-relaxed text-slate-600">{getPlaceIntro(place, cityData.name)}</p>
          <p className="mt-4 flex items-start gap-2 text-sm leading-relaxed text-slate-500"><MapPin size={16} className="mt-0.5 shrink-0" aria-hidden="true" />{place.address}</p>
          <div className="mt-7"><PlaceContact place={place} kind={kind} /></div>
          {!preview && <div className="mt-4"><SavePlaceButton place={{ kind, city_slug: place.city, place_slug: place.slug }} /></div>}
          <nav aria-label="Op deze zaakpagina" className="mt-7 flex flex-wrap gap-x-5 gap-y-1 border-t border-slate-300/80 pt-4 text-sm font-medium text-slate-600">
            <a href="#over-de-zaak" className="inline-flex min-h-[44px] items-center underline decoration-slate-300 underline-offset-4 hover:text-slate-900">Over de zaak</a>
            <a href="#praktisch" className="inline-flex min-h-[44px] items-center underline decoration-slate-300 underline-offset-4 hover:text-slate-900">{category === 'care' ? 'Afspraak & adres' : 'Praktisch'}</a>
            {isPlaceBlockVisible(place, 'gallery') && <a href="#fotos" className="inline-flex min-h-[44px] items-center underline decoration-slate-300 underline-offset-4 hover:text-slate-900">Foto's</a>}
          </nav>
          {isPlaceBlockVisible(place, 'dogInfo') && <div id="met-je-hond" className="mt-3 scroll-mt-28"><PlaceFacts place={place} /></div>}
        </div>
        {isPlaceBlockVisible(place, 'gallery') && <PlaceGallery key={place.slug} place={place} />}
      </div>

      <div className="grid items-start gap-8 pb-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16 lg:pb-16">
        <div className="min-w-0">
          <section id="over-de-zaak" aria-labelledby="about-title" className="scroll-mt-28 pb-8 sm:pb-10">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">De zaak</p>
            <h2 id="about-title" className="mb-5 text-2xl font-semibold tracking-tight">Over {place.name}</h2>
            <div className="max-w-[65ch] space-y-4 text-[16px] leading-[1.85] text-slate-700">{paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
            {place.recommendationNote && <div className="mt-7 border-l-2 border-sky-700 pl-5"><h3 className="mb-2 text-sm font-semibold text-sky-800">Onze tip</h3><p className="max-w-[65ch] text-[15px] leading-relaxed text-slate-700">{place.recommendationNote}</p></div>}
          </section>
          {facts.other.length > 0 && <section aria-labelledby="offering-title" className="border-t border-slate-300/80 pt-7">
            <h2 id="offering-title" className="mb-4 text-lg font-semibold tracking-tight">{category === 'stay' ? 'Het verblijf' : category === 'care' ? 'In de praktijk' : category === 'shop' ? 'In de winkel' : 'De zaak in het kort'}</h2>
            <ul className="flex flex-wrap gap-x-5 gap-y-3 text-sm text-slate-600">{facts.other.map(tag => <li key={tag} className="border-l border-slate-300 pl-3">{tag}</li>)}</ul>
          </section>}
        </div>
        <aside id="praktisch" className="scroll-mt-28 lg:sticky lg:top-28">
          <PlacePractical place={place} kind={kind} />
          {place.sameAs?.length ? <div className="mt-5 px-1"><h2 className="mb-2 text-sm font-semibold text-slate-600">Officiële links</h2><ul>{place.sameAs.map(url => <li key={url}><a href={url} target="_blank" rel="noopener noreferrer" onClick={() => trackPlaceAction(place, kind, 'social')} className="inline-flex min-h-[44px] max-w-full items-center gap-2 break-all text-sm text-sky-800 underline underline-offset-4">{url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}<ArrowUpRight size={15} className="shrink-0" aria-hidden="true" /></a></li>)}</ul></div> : null}
        </aside>
      </div>
      <RelatedPlaces places={related} kind={kind} cityName={cityData.name} from={location.pathname} />
    </div>
  </div>;
};

const PlaceDetail: React.FC<PlaceDetailProps> = ({ kind }) => {
  const { city, slug } = useParams<{ city: string; slug: string }>();
  const collection = kind === 'hotspot' ? HOTSPOTS : SERVICES;
  const place = collection.find(entry => entry.city === city && entry.slug === slug);
  const cityData = CITIES.find(entry => entry.slug === city);
  if (!place || !cityData) return <NotFound />;
  return <ResolvedPlaceDetail key={`${kind}/${city}/${slug}`} kind={kind} place={place} cityData={cityData} />;
};
export default PlaceDetail;
