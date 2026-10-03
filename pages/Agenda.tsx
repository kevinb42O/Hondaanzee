import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, X, Mail } from 'lucide-react';
import { EVENTS, type EventRegion } from '../data/events.ts';
import EventVisual from '../components/EventVisual.tsx';
import { ArchivedEventLinks } from '../components/EventLinks.tsx';
import { EVENT_REGION_LABELS, getAgendaStructuredData, getEventCountdown, isEventPast } from '../utils/events.ts';
import { useEventClock } from '../utils/useEventClock.ts';
import { useSEO, SEO_DATA } from '../utils/seo.ts';
import DirectoryHero from '../components/DirectoryHero.tsx';

const SEASON_EMOJI: Record<string, string> = {
  Lente: '🌸',
  Zomer: '☀️',
  Herfst: '🍂',
  Winter: '❄️',
};

const SEASON_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Lente: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  Zomer: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  Herfst: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  Winter: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
};

const Agenda: React.FC = () => {
  const [selectedSeason, setSelectedSeason] = useState<string>('all');

  const [selectedRegion, setSelectedRegion] = useState<EventRegion | 'all'>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<'upcoming' | 'past'>('upcoming');
  const now = useEventClock();
  useSEO({ ...SEO_DATA.agenda, structuredData: getAgendaStructuredData(EVENTS, now) });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const periodEvents = EVENTS.filter(event => selectedPeriod === 'past' ? isEventPast(event, now) : !isEventPast(event, now));
  const filteredEvents = periodEvents
    .filter(event => selectedSeason === 'all' || event.season === selectedSeason)
    .filter(event => selectedRegion === 'all' || (event.region || 'kust') === selectedRegion)
    .sort((a, b) => selectedPeriod === 'past' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date));
  const seasons = ['all', ...['Lente', 'Zomer', 'Herfst', 'Winter'].filter(season => periodEvents.some(event => event.season === season))];
  const resetFilters = () => { setSelectedSeason('all'); setSelectedRegion('all'); };

  return (
    <div className="animate-in fade-in overflow-x-hidden">
      <DirectoryHero
        kind="agenda"
        count={EVENTS.filter(event => !isEventPast(event, now)).length}
        imageCredit={{ name: 'Dogs & Friends', href: 'https://dogsandfriends.be/index-nl.php' }}
      />

      {/* Agenda overview */}
      <div id="agenda-filters" className="bg-slate-50 min-h-[40vh] pb-8 pt-2 sm:pb-12 sm:pt-4 md:pb-16">
        <div className="site-shell">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="inline-flex rounded-2xl bg-slate-100 p-1" role="group" aria-label="Periode">
            {([['upcoming', 'Komende evenementen'], ['past', 'Voorbije edities']] as const).map(([period, label]) => (
              <button key={period} type="button" aria-pressed={selectedPeriod === period} onClick={() => { setSelectedPeriod(period); resetFilters(); }} className={`px-4 py-3 rounded-xl text-sm font-bold transition-colors ${selectedPeriod === period ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600 hover:text-sky-700'}`}>{label}</button>
            ))}
          </div>
          <p className="text-sm text-slate-500">Gegevens gecontroleerd op 3 oktober 2026. Bekijk de bron voor actuele tickets.</p>
        </div>
        {/* Season and region filters */}
        <div className="bg-white border-2 border-slate-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 mb-8 sm:mb-12 shadow-sm">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="bg-sky-100 text-sky-600 p-2 sm:p-2.5 rounded-xl">
              <Calendar size={18} className="sm:w-5 sm:h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Kies je uitstap</h2>
            {(selectedSeason !== 'all' || selectedRegion !== 'all') && (
              <button
                onClick={resetFilters}
                className="ml-auto text-sm font-bold text-slate-500 hover:text-sky-600 transition-colors flex items-center gap-2"
              >
                <X size={16} /> Wis filter
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {seasons.map(season => (
              <button
                key={season}
                type="button"
                aria-pressed={selectedSeason === season}
                onClick={() => setSelectedSeason(season)}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${selectedSeason === season
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                {season === 'all' ? '🗓️ Alle seizoenen' : `${SEASON_EMOJI[season] || ''} ${season}`}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Regio">
          {(['all', 'kust', 'west-vlaanderen', 'belgie', 'zeeland'] as const).map(region => (
            <button key={region} type="button" aria-pressed={selectedRegion === region} onClick={() => setSelectedRegion(region)} className={`px-4 py-2 rounded-xl font-bold text-sm border transition-colors ${selectedRegion === region ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-sky-400'}`}>
              {region === 'all' ? 'Alle regio’s' : EVENT_REGION_LABELS[region]}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div className="mb-6 sm:mb-8">
          <p className="text-slate-600 font-bold text-sm sm:text-base">
            <span className="text-sky-600 text-lg sm:text-xl">{filteredEvents.length}</span> {filteredEvents.length === 1 ? 'evenement' : 'evenementen'} gevonden
          </p>
        </div>

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10 items-stretch">
            {filteredEvents.map((event) => {
              const seasonColor = SEASON_COLORS[event.season] || SEASON_COLORS.Lente;
              const countdown = getEventCountdown(event, now);
              const isPast = isEventPast(event, now);

              return (
                <Link
                  key={event.id}
                  to={`/agenda/${event.slug}`}
                  className={`group cursor-pointer active:scale-[0.98] transition-transform text-left flex flex-col ${isPast ? 'opacity-60' : ''}`}
                >
                  <div className="relative aspect-[4/3] rounded-[1.25rem] sm:rounded-[1.5rem] md:rounded-[2rem] overflow-hidden mb-4 sm:mb-5 shadow-lg shadow-slate-100 md:transition-shadow md:group-hover:shadow-sky-100">
                    <EventVisual event={event} className="md:transition-transform md:duration-700 md:group-hover:scale-105" />
                    {/* Season Badge */}
                    <div className={`absolute top-3 sm:top-4 left-3 sm:left-4 ${seasonColor.bg} backdrop-blur px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-wider ${seasonColor.text} shadow-sm border ${seasonColor.border}`}>
                      <Calendar size={10} /> {event.season}
                    </div>
                    {/* City Badge */}
                    <span
                      className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-slate-900/90 backdrop-blur text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1 text-[9px] sm:text-[10px] font-black uppercase tracking-wider"
                    >
                      <MapPin size={10} /> {event.cityName}
                    </span>
                    {/* Countdown Badge */}
                    {!isPast && (
                      <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 flex items-center gap-1.5 bg-sky-600/90 backdrop-blur-sm px-2.5 py-1.5 rounded-full">
                        <Clock size={12} className="text-sky-200" />
                        <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-[0.1em] text-white">{countdown}</span>
                      </div>
                    )}
                    {isPast && (
                      <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 flex items-center gap-1.5 bg-slate-600/90 backdrop-blur-sm px-2.5 py-1.5 rounded-full">
                        <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-300">Afgelopen</span>
                      </div>
                    )}
                    {/* Free badge */}
                    {event.isAccessibleForFree === true && (
                      <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 flex items-center gap-1.5 bg-emerald-500/90 backdrop-blur-sm px-2.5 py-1.5 rounded-full">

                        <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-[0.1em] text-white">Gratis</span>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 md:group-hover:text-sky-600 md:transition-colors">{event.title}</h2>
                    {event.tags.includes('Top-event') && (
                      <div className="flex items-center gap-1 bg-gradient-to-r from-amber-400 to-amber-500 px-2 py-1 rounded-md shadow-md shadow-amber-500/30">

                        <span className="text-[8px] sm:text-[9px] font-extrabold uppercase tracking-[0.15em] text-white">Top</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sky-600 text-xs sm:text-sm font-bold mb-2">{event.subtitle}</p>
                  <div className="flex flex-wrap gap-2 mb-2 text-[11px] font-bold text-slate-500">
                    <span>{EVENT_REGION_LABELS[event.region || 'kust']}</span>
                    {event.status === 'save-the-date' && <span className="text-amber-700">Save the date · details volgen</span>}
                    {event.status === 'announced' && <span className="text-amber-700">Aangekondigd · details controleren</span>}
                    {event.imageKind === 'poster' && <span>Officiële affiche</span>}
                    {event.imageKind === 'photo' && event.imageCaption && <span>Sfeerbeeld · bron bij details</span>}
                  </div>
                  <p className="text-slate-500 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 leading-relaxed font-medium">{event.description}</p>

                  <div className="mt-auto">
                    {/* Date & Time */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500 text-[10px] sm:text-xs mb-2 font-medium">
                      <span className="flex items-center gap-1"><Calendar size={12} /> <time dateTime={event.date}>{event.dateDisplay}</time></span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {event.timeDisplay}</span>
                    </div>
                    {/* Location */}
                    <p className="text-slate-400 text-[10px] sm:text-xs mb-3 font-medium flex items-center gap-1">
                      <MapPin size={12} /> {event.location}, {event.cityName}
                    </p>
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {event.tags.filter(tag => tag !== 'Top-event').slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-widest font-black px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg border bg-sky-50 text-sky-600 border-sky-100"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 sm:py-20 md:py-24">
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 sm:p-12 md:p-16 max-w-2xl mx-auto">
              <div className="text-slate-300 mb-6">
                <Calendar size={48} className="mx-auto" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
                Geen evenementen gevonden
              </h3>
              <p className="text-slate-600 font-medium leading-relaxed mb-6">
                Er zijn geen evenementen die bij deze filters passen. Kies een andere regio of bekijk alle seizoenen.
              </p>
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-2 bg-sky-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-sky-700 transition-colors"
              >
                <X size={16} /> Wis filter
              </button>
            </div>
          </div>
        )}

        {selectedPeriod === 'upcoming' && <ArchivedEventLinks />}

        {/* CTA Section - Gradient matches standard page color at bottom */}
        <div className="mt-16 sm:mt-20 bg-gradient-to-br from-sky-50 to-white border-2 border-sky-100 rounded-3xl p-8 sm:p-12 text-center shadow-sm">
          <div className="text-4xl mb-4">🐾</div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4">
            Iets te doen voor honden aan de kust?
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-6 font-medium">
            Organiseer je zelf een event of heb je een gouden tip die niet op onze kaart mag ontbreken? Stuur ons de datum, locatie, hondenvoorwaarden en een link naar de organisator. Dan kunnen we de informatie controleren en de agenda aanvullen.
          </p>
          <a
            href="https://wa.me/32494816714?text=Dag!%20%F0%9F%91%8B%0A%0AIk%20wil%20graag%20een%20hondvriendelijk%20evenement%20aanmelden%20voor%20de%20Agenda%20op%20hondaanzee.be.%0A%0ABedankt!"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-sky-600 text-white px-8 py-4 rounded-2xl font-black text-lg hover:bg-sky-700 transition-all shadow-lg shadow-sky-600/30 hover:shadow-sky-600/50 transform hover:-translate-y-0.5"
          >
            <Mail size={20} />
            Meld je event aan
          </a>
          <div className="mt-6">
            <a 
              href="mailto:info@hondaanzee.be"
              className="text-sky-600 font-bold text-base sm:text-lg hover:underline inline-flex items-center gap-2"
            >
              <Mail size={18} />
              info@hondaanzee.be
            </a>
          </div>
        </div>
      </div>
    </div>

    </div>
  );
};

export default Agenda;
