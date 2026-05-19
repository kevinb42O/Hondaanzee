import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Clock, X, PartyPopper, Mail, Sparkles, Heart } from 'lucide-react';
import { EVENTS } from '../data/events.ts';
import { useSEO, SEO_DATA } from '../utils/seo.ts';
import Breadcrumb from '../components/Breadcrumb.tsx';

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

  useSEO(SEO_DATA.agenda);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filteredEvents = EVENTS
    .filter(e => selectedSeason === 'all' || e.season === selectedSeason)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const seasons = ['all', ...Array.from(new Set(EVENTS.map(e => e.season)))];

  const formatDateCountdown = (dateStr: string) => {
    const eventDate = new Date(dateStr);
    const now = new Date();
    const diffTime = eventDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'Afgelopen';
    if (diffDays === 0) return 'Vandaag!';
    if (diffDays === 1) return 'Morgen!';
    if (diffDays <= 7) return `Nog ${diffDays} dagen`;
    if (diffDays <= 30) return `Nog ${Math.ceil(diffDays / 7)} weken`;
    return `Nog ${Math.ceil(diffDays / 30)} maanden`;
  };

  return (
    <div className="animate-in fade-in overflow-x-hidden">
      {/* Hero Section */}
      <div data-header-hero="light" className="relative pt-12 sm:pt-16 md:pt-24 pb-24 sm:pb-32 md:pb-40 overflow-hidden min-h-[50vh] flex items-center text-white">
        {/* Background Image */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(/kwispelfestival-hero.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center 80%',
            backgroundAttachment: 'fixed',
          }}
        >
          <div className="absolute inset-0 bg-slate-900/60"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-slate-900/40"></div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 right-10 text-slate-700/30 hidden md:block" style={{ animation: 'float 3.5s ease-in-out infinite' }}>
          <PartyPopper size={70} strokeWidth={1.5} />
        </div>
        <div className="absolute top-32 left-16 text-slate-700/30 hidden md:block" style={{ animation: 'pulse 3s ease-in-out infinite' }}>
          <Calendar size={60} strokeWidth={1.5} />
        </div>
        <div className="absolute top-1/2 right-8 text-slate-700/25 hidden md:block rotate-12">
          <Sparkles size={50} strokeWidth={1.5} />
        </div>
        <div className="absolute bottom-40 left-20 text-slate-700/30 hidden lg:block" style={{ animation: 'float 3s ease-in-out infinite', animationDelay: '0.5s' }}>
          <Heart size={55} strokeWidth={1.5} />
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-slate-300 font-bold hover:text-sky-400 transition-colors mb-6 sm:mb-8 active:opacity-70 touch-target py-2"
          >
            <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="text-sm sm:text-base">Terug naar home</span>
          </Link>

          <Breadcrumb
            variant="light"
            className="mb-4 sm:mb-6"
            items={[
              { label: 'Home', to: '/' },
              { label: 'Agenda' },
            ]}
          />

          <div className="max-w-3xl relative">
            <div className="absolute -left-20 top-0 text-6xl hidden xl:block" style={{ animation: 'float 2.5s ease-in-out infinite' }}>
              🎉
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black mb-4 sm:mb-6 leading-[1.1] tracking-tight">
              Hondvriendelijke <span className="text-sky-400">Evenementen</span>
            </h1>
            <p className="text-slate-300 text-base sm:text-lg md:text-xl leading-relaxed font-medium">
              Alle hondvriendelijke evenementen aan de Belgische kust in 2026. Van gezellige festivals tot sportieve wandelingen — ontdek wat er te beleven valt voor jou en je viervoeter!
            </p>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute -bottom-3 left-0 w-full overflow-hidden leading-[0] z-10">
          <div className="wave-animation" style={{ display: 'flex', width: '200%' }}>
            <svg
              className="block h-[60px] sm:h-[80px] md:h-[120px]"
              style={{ minWidth: '100%', flex: '0 0 50%' }}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
            >
              <path
                d="M0,60 C200,20 400,100 600,60 C800,20 1000,100 1200,60 L1200,120 L0,120 Z"
                className="fill-current text-white"
              />
            </svg>
            <svg
              className="block h-[60px] sm:h-[80px] md:h-[120px]"
              style={{ minWidth: '100%', flex: '0 0 50%' }}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
            >
              <path
                d="M0,60 C200,20 400,100 600,60 C800,20 1000,100 1200,60 L1200,120 L0,120 Z"
                className="fill-current text-white"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Content Area with Standard White Background to match Wave */}
      <div className="bg-white min-h-[40vh] py-8 sm:py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Season Filter */}
        <div className="bg-white border-2 border-slate-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 mb-8 sm:mb-12 shadow-sm">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="bg-sky-100 text-sky-600 p-2 sm:p-2.5 rounded-xl">
              <Calendar size={18} className="sm:w-5 sm:h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Filter op seizoen</h2>
            {selectedSeason !== 'all' && (
              <button
                onClick={() => setSelectedSeason('all')}
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
              const countdown = formatDateCountdown(event.date);
              const isPast = countdown === 'Afgelopen';

              return (
                <Link
                  key={event.id}
                  to={`/agenda/${event.slug}`}
                  className={`group cursor-pointer active:scale-[0.98] transition-transform text-left flex flex-col ${isPast ? 'opacity-60' : ''}`}
                >
                  <div className="relative aspect-[4/3] rounded-[1.25rem] sm:rounded-[1.5rem] md:rounded-[2rem] overflow-hidden mb-4 sm:mb-5 shadow-lg shadow-slate-100 md:transition-shadow md:group-hover:shadow-sky-100">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover md:transition-transform md:duration-700 md:group-hover:scale-110"
                      style={{ objectPosition: event.imagePosition || 'center' }}
                      width={400}
                      height={256}
                      loading="lazy"
                      decoding="async"
                    />
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
                    {event.price.toLowerCase().includes('gratis') && (
                      <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 flex items-center gap-1.5 bg-emerald-500/90 backdrop-blur-sm px-2.5 py-1.5 rounded-full">
                        <Sparkles size={12} className="text-emerald-100" />
                        <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-[0.1em] text-white">Gratis</span>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 md:group-hover:text-sky-600 md:transition-colors">{event.title}</h3>
                    {event.tags.includes('Top-event') && (
                      <div className="flex items-center gap-1 bg-gradient-to-r from-amber-400 to-amber-500 px-2 py-1 rounded-md shadow-md shadow-amber-500/30">
                        <Sparkles size={11} className="text-amber-50" />
                        <span className="text-[8px] sm:text-[9px] font-extrabold uppercase tracking-[0.15em] text-white">Top</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sky-600 text-xs sm:text-sm font-bold mb-2">{event.subtitle}</p>
                  <p className="text-slate-500 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 leading-relaxed font-medium">{event.description}</p>

                  <div className="mt-auto">
                    {/* Date & Time */}
                    <div className="flex items-center gap-4 text-slate-400 text-[10px] sm:text-xs mb-2 font-medium">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {event.dateDisplay}</span>
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
                Er zijn momenteel geen evenementen voor dit seizoen. Bekijk alle seizoenen om het volledige overzicht te zien.
              </p>
              <button
                onClick={() => setSelectedSeason('all')}
                className="inline-flex items-center gap-2 bg-sky-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-sky-700 transition-colors"
              >
                <X size={16} /> Wis filter
              </button>
            </div>
          </div>
        )}

        {/* CTA Section - Gradient matches standard page color at bottom */}
        <div className="mt-16 sm:mt-20 bg-gradient-to-br from-sky-50 to-white border-2 border-sky-100 rounded-3xl p-8 sm:p-12 text-center shadow-sm">
          <div className="text-4xl mb-4">🐾</div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4">
            Iets te doen voor honden aan de kust?
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-6 font-medium">
            Organiseer je zelf een event of heb je een gouden tip die niet op onze kaart mag ontbreken? Laat het ons weten en we zetten je op de meest complete kustgids van België.
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
