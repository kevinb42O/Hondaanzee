import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Accessibility, Calendar, ChevronRight, Clock, Globe, Mail, MapPin, PartyPopper, Phone, Sparkles, Tag, TreePine, Utensils } from 'lucide-react';
import ImageModal from './ImageModal.tsx';
import LocalHero from './LocalHero.tsx';
import type { DogEvent } from '../data/events.ts';

const SEASON_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Lente: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  Zomer: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  Herfst: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  Winter: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
};

const renderDescriptionWithHighlight = (event: DogEvent) => {
  if (!event.descriptionHighlight || !event.description.includes(event.descriptionHighlight)) {
    return event.description;
  }

  const [before, after] = event.description.split(event.descriptionHighlight);

  return (
    <>
      {before}
      <strong className="font-black text-slate-900">{event.descriptionHighlight}</strong>
      {after}
    </>
  );
};

interface EventDetailContentProps {
  event: DogEvent;
  onNavigate?: () => void;
}

const EventDetailContent: React.FC<EventDetailContentProps> = ({ event, onNavigate }) => {
  const [isEventImageModalOpen, setIsEventImageModalOpen] = useState(false);
  const [eventImageIndex, setEventImageIndex] = useState(0);
  const seasonColor = SEASON_COLORS[event.season] || SEASON_COLORS.Lente;

  return (
    <>
      <div className="relative h-[35vh] sm:h-[40vh] md:h-[50vh] min-h-[320px]">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
          style={{ objectPosition: event.imagePosition || 'center' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 md:p-12">
          <div className="flex flex-wrap gap-2 mb-2 sm:mb-3">
            <span className={`${seasonColor.bg} ${seasonColor.text} px-3 py-1 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider border ${seasonColor.border}`}>
              {event.season}
            </span>
            <span className="bg-white/20 backdrop-blur text-white px-3 py-1 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider">
              {event.category}
            </span>
            {event.price.toLowerCase().includes('gratis') && (
              <span className="bg-emerald-500/90 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={14} /> Gratis
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 sm:gap-4 mb-1 sm:mb-2">
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
              {event.title}
            </h1>
            {event.tags.includes('Top-event') && (
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-amber-500 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg shadow-lg shadow-amber-500/40">
                <Sparkles size={16} className="sm:w-5 sm:h-5 text-amber-50" />
                <span className="text-[10px] sm:text-xs md:text-sm font-extrabold uppercase tracking-[0.15em] text-white whitespace-nowrap">Top</span>
              </div>
            )}
          </div>
          <p className="text-sky-300 text-base sm:text-lg md:text-xl font-bold">{event.subtitle}</p>
        </div>
      </div>

      <div className="p-5 sm:p-8 md:p-12 lg:p-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-12">
          <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4 sm:p-5 text-center">
            <Calendar size={24} className="mx-auto text-sky-600 mb-2 sm:w-7 sm:h-7" />
            <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Datum</p>
            <p className="text-sm sm:text-lg font-black text-slate-900">{event.dateDisplay}</p>
          </div>
          <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4 sm:p-5 text-center">
            <Clock size={24} className="mx-auto text-sky-600 mb-2 sm:w-7 sm:h-7" />
            <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Uur</p>
            <p className="text-sm sm:text-lg font-black text-slate-900">{event.timeDisplay}</p>
          </div>
          <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4 sm:p-5 text-center">
            <MapPin size={24} className="mx-auto text-sky-600 mb-2 sm:w-7 sm:h-7" />
            <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Locatie</p>
            <p className="text-sm sm:text-lg font-black text-slate-900">{event.location}</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 sm:p-5 text-center">
            <Tag size={24} className="mx-auto text-emerald-600 mb-2 sm:w-7 sm:h-7" />
            <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Prijs</p>
            <p className="text-sm sm:text-lg font-black text-emerald-700">{event.price}</p>
          </div>
        </div>

        <div className="mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 mb-4 sm:mb-5 flex items-center gap-2 sm:gap-3">
            <PartyPopper size={26} className="text-sky-600 sm:w-8 sm:h-8" />
            Over dit evenement
          </h2>
          <p className="text-slate-600 text-base sm:text-lg md:text-xl leading-relaxed font-medium">
            {renderDescriptionWithHighlight(event)}
          </p>
          {event.detailGallery && (
            <div className="mt-6 sm:mt-8 bg-gradient-to-br from-emerald-50 via-white to-sky-50 border border-emerald-100 rounded-2xl p-4 sm:p-6">
              <div className="mb-4 sm:mb-5">
                {event.detailGallery.eyebrow && (
                  <p className="text-[11px] sm:text-xs font-black uppercase tracking-[0.25em] text-emerald-600 mb-2">
                    {event.detailGallery.eyebrow}
                  </p>
                )}
                <h3 className="text-lg sm:text-2xl font-black text-slate-900 mb-2">
                  {event.detailGallery.title}
                </h3>
                {event.detailGallery.description && (
                  <p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed">
                    {event.detailGallery.description}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                {event.detailGallery.images.map((image, index) => (
                  <button
                    key={image.src}
                    type="button"
                    onClick={() => {
                      setEventImageIndex(index);
                      setIsEventImageModalOpen(true);
                    }}
                    className="group text-left bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all"
                  >
                    <div className="bg-slate-100 p-3 sm:p-4">
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="w-full h-[320px] sm:h-[460px] object-contain rounded-xl bg-white"
                        loading="lazy"
                      />
                    </div>
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5">
                      <p className="text-slate-900 text-sm sm:text-base font-black mb-1">{image.label}</p>
                      <p className="text-slate-500 text-xs sm:text-sm font-semibold">Klik om groter te bekijken</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {event.highlights.length > 0 && (
          <div className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 mb-4 sm:mb-5 flex items-center gap-2 sm:gap-3">
              <Sparkles size={26} className="text-sky-600 sm:w-8 sm:h-8" />
              Wat te verwachten
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {event.highlights.map((highlight) => (
                <div key={highlight} className="bg-slate-50 border border-slate-100 rounded-xl p-4 sm:p-5 flex items-center gap-3 font-bold text-slate-700 text-base sm:text-lg">
                  <ChevronRight size={18} className="text-sky-600 flex-shrink-0 sm:w-5 sm:h-5" />
                  {highlight}
                </div>
              ))}
            </div>
          </div>
        )}

        {event.accessibility && event.accessibility.length > 0 && (
          <div className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 mb-4 sm:mb-5 flex items-center gap-2 sm:gap-3">
              <Accessibility size={26} className="text-sky-600 sm:w-8 sm:h-8" />
              Toegankelijkheid
            </h2>
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 sm:p-7">
              <ul className="space-y-3">
                {event.accessibility.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-slate-700 text-base sm:text-lg font-medium">
                    <span className="text-blue-500 mt-0.5 text-lg">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 mb-4 sm:mb-5 flex items-center gap-2 sm:gap-3">
            <MapPin size={26} className="text-sky-600 sm:w-8 sm:h-8" />
            Praktische info
          </h2>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 sm:p-7 space-y-4 sm:space-y-5">
            <div className="flex items-start gap-3">
              <MapPin size={20} className="text-sky-600 flex-shrink-0 mt-0.5 sm:w-6 sm:h-6" />
              <div>
                <p className="font-bold text-slate-900 text-base sm:text-lg">{event.location}</p>
                <p className="text-slate-500 text-sm sm:text-base">{event.address}</p>
              </div>
            </div>
            {event.phone && (
              <div className="flex items-center gap-3">
                <Phone size={20} className="text-sky-600 flex-shrink-0 sm:w-6 sm:h-6" />
                <a href={`tel:${event.phone}`} className="text-sky-600 font-bold text-base sm:text-lg hover:underline">{event.phone}</a>
              </div>
            )}
            {event.email && (
              <div className="flex items-center gap-3">
                <Mail size={20} className="text-sky-600 flex-shrink-0 sm:w-6 sm:h-6" />
                <a href={`mailto:${event.email}`} className="text-sky-600 font-bold text-base sm:text-lg hover:underline">{event.email}</a>
              </div>
            )}
            {event.website && (
              <div className="flex items-center gap-3">
                <Globe size={20} className="text-sky-600 flex-shrink-0 sm:w-6 sm:h-6" />
                <a href={event.website} target="_blank" rel="noopener noreferrer" className="text-sky-600 font-bold text-base sm:text-lg hover:underline break-all">{event.websiteLabel || event.website}</a>
              </div>
            )}
            {event.additionalLinks?.map((link) => (
              <div key={link.url} className="flex items-center gap-3">
                <Globe size={20} className="text-sky-600 flex-shrink-0 sm:w-6 sm:h-6" />
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sky-600 font-bold text-base sm:text-lg hover:underline break-all">{link.label}</a>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3 mb-8 sm:mb-12">
          {event.tags.filter(tag => tag !== 'Top-event').map((tag) => (
            <span
              key={tag}
              className="text-[10px] sm:text-xs uppercase tracking-widest font-black px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border bg-sky-50 text-sky-600 border-sky-100"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 border-2 border-sky-100 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10">
          <div className="flex items-center gap-3 mb-4 sm:mb-5">
            <div className="bg-sky-100 text-sky-600 p-2.5 rounded-xl">
              <Sparkles size={22} />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Meer ontdekken in {event.cityName}
            </h2>
          </div>
          <p className="text-slate-600 text-base sm:text-lg font-medium leading-relaxed mb-6">
            {event.category === 'Wandeling'
              ? `Trek je wandelschoenen aan voor ${event.cityName}! Ontdek ook de leukste losloopzones en hondvriendelijke plekken in de buurt.`
              : `Honger gekregen na het festival? Ontdek de leukste hondvriendelijke terrassen, restaurants en plekjes in ${event.cityName}.`
            }
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <Link
              to={`/${event.citySlug}`}
              onClick={onNavigate}
              className="flex items-center gap-3 bg-white border border-sky-100 rounded-xl p-4 hover:border-sky-300 hover:shadow-md transition-all group"
            >
              <div className="bg-sky-100 text-sky-600 p-2 rounded-lg group-hover:bg-sky-200 transition-colors">
                <MapPin size={18} />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm sm:text-base">Strandregels</p>
                <p className="text-slate-500 text-xs sm:text-sm">{event.cityName}</p>
              </div>
              <ChevronRight size={16} className="ml-auto text-slate-300 group-hover:text-sky-500 transition-colors" />
            </Link>
            <Link
              to="/hotspots"
              onClick={onNavigate}
              className="flex items-center gap-3 bg-white border border-sky-100 rounded-xl p-4 hover:border-sky-300 hover:shadow-md transition-all group"
            >
              <div className="bg-amber-100 text-amber-600 p-2 rounded-lg group-hover:bg-amber-200 transition-colors">
                <Utensils size={18} />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm sm:text-base">Hotspots</p>
                <p className="text-slate-500 text-xs sm:text-sm">Cafés & restaurants</p>
              </div>
              <ChevronRight size={16} className="ml-auto text-slate-300 group-hover:text-sky-500 transition-colors" />
            </Link>
            <Link
              to="/losloopzones"
              onClick={onNavigate}
              className="flex items-center gap-3 bg-white border border-sky-100 rounded-xl p-4 hover:border-sky-300 hover:shadow-md transition-all group"
            >
              <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg group-hover:bg-emerald-200 transition-colors">
                <TreePine size={18} />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm sm:text-base">Losloopzones</p>
                <p className="text-slate-500 text-xs sm:text-sm">Vrij loslopen</p>
              </div>
              <ChevronRight size={16} className="ml-auto text-slate-300 group-hover:text-sky-500 transition-colors" />
            </Link>
          </div>

          <LocalHero citySlug={event.citySlug} cityName={event.cityName} />
        </div>
      </div>

      {event.detailGallery && (
        <ImageModal
          images={event.detailGallery.images.map((image) => image.src)}
          altText={`${event.title} - Stratier flyers`}
          isOpen={isEventImageModalOpen}
          onClose={() => setIsEventImageModalOpen(false)}
          initialIndex={eventImageIndex}
        />
      )}
    </>
  );
};

export default EventDetailContent;