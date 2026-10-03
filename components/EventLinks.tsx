import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { EVENTS, type DogEvent } from '../data/events.ts';
import { getRelatedEvents, getUpcomingEvents, isEventPast } from '../utils/events.ts';
import { useEventClock } from '../utils/useEventClock.ts';

function EventLinks({ events }: { events: DogEvent[] }) {
  return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {events.map(event => <Link key={event.slug} to={`/agenda/${event.slug}`} className="group rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-sky-300 hover:bg-sky-50 focus-visible:outline-sky-600">
      <p className="mb-2 flex items-center gap-2 text-xs font-bold text-sky-700"><CalendarDays size={15} /><time dateTime={event.date}>{event.dateDisplay}</time></p>
      <h3 className="font-black text-slate-900">{event.title}</h3>
      <p className="mt-2 text-sm text-slate-600">{event.cityName} · {event.location}</p>
      {event.status === 'save-the-date' && <p className="mt-2 text-xs font-bold text-amber-700">Datum aangekondigd · details volgen</p>}
      {event.status === 'announced' && <p className="mt-2 text-xs font-bold text-amber-700">Aangekondigd · details controleren</p>}
      <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-sky-700">Bekijk het evenement <ArrowRight size={15} /></span>
    </Link>)}
  </div>;
}

export function RelatedEventLinks({ event }: { event: DogEvent }) {
  const now = useEventClock();
  const related = getRelatedEvents(event, EVENTS, now);
  if (!related.length) return null;
  return <section aria-labelledby="related-events-heading" className="mt-10 sm:mt-12">
    <h2 id="related-events-heading" className="mb-3 text-2xl font-black text-slate-900">Meer uitstappen met je hond</h2>
    <p className="mb-5 text-sm text-slate-600">Ontdek ook deze komende evenementen. Bekijk per editie de praktische informatie en hondenvoorwaarden.</p>
    <EventLinks events={related} />
  </section>;
}

export function CityEventLinks({ citySlug, cityName }: { citySlug: string; cityName: string }) {
  const now = useEventClock();
  const events = getUpcomingEvents(EVENTS, now).filter(event => event.citySlug === citySlug);
  if (!events.length) return null;
  return <section aria-labelledby="city-events-heading" className="city-section city-events">
    <div className="city-shell">
      <h2 id="city-events-heading" className="city-section-title">Met je hond naar een evenement in {cityName}</h2>
      <p className="city-body-copy mb-6">Plan je uitstap met de datum, locatie en hondenvoorwaarden van elke editie.</p>
      <EventLinks events={events} />
      <Link to="/agenda" className="city-text-link">Bekijk de volledige hondenagenda <ArrowRight size={16} /></Link>
    </div>
  </section>;
}

export function ArchivedEventLinks() {
  const now = useEventClock();
  const upcoming = new Set(getUpcomingEvents(EVENTS, now).map(event => event.slug));
  const archived = EVENTS.filter(event => !upcoming.has(event.slug)).sort((a, b) => b.date.localeCompare(a.date));
  if (!archived.length) return null;
  return <details className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
    <summary className="cursor-pointer text-base font-black text-slate-900">{archived.some(e=>!isEventPast(e,now))?'Voorbije en gewijzigde edities':'Voorbije edities'} ({archived.length})</summary>
    <p className="mb-4 mt-3 text-sm text-slate-600">Deze evenementen zijn afgelopen. De informatie blijft beschikbaar per editie; de voorwaarden gelden niet automatisch voor een volgend jaar.</p>
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {archived.map(event => <li key={event.slug}><Link to={`/agenda/${event.slug}`} className="block rounded-xl bg-slate-50 p-4 text-sm font-bold text-sky-700 hover:bg-sky-50 hover:underline">{event.title}<span className="mt-1 block text-xs font-medium text-slate-600"><time dateTime={event.date}>{event.dateDisplay}</time> · {event.cityName}</span></Link></li>)}
    </ul>
  </details>;
}
