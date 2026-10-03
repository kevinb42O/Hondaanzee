import HotspotSocialSummary from './places/HotspotSocialSummary.tsx';

import React, { useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Star, Coffee, Utensils, Bed, ShoppingBag, Wine, Beer, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { HOTSPOTS } from '../constants.ts';
import { City } from '../types.ts';
import { getHotspotDetailPath } from '../utils/placeRoutes.ts';
import SavePlaceButton from './member/SavePlaceButton.tsx';
import LocalHero from './LocalHero.tsx';

const HOTSPOT_WHATSAPP_MESSAGE = `Dag! 👋\n\nIk ben een hondvriendelijke ondernemer en ik zou graag mijn zaak op hondaanzee.be laten tonen bij de hotspots.\n\nKun je me meer info geven over de mogelijkheden?\n\nBedankt!`;

interface HotspotsProps {
  city: City;
}

const INITIAL_SHOW = 6;

const Hotspots: React.FC<HotspotsProps> = ({ city }) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('Alles');
  const [showAll, setShowAll] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const getIcon = (type: string) => {
    switch (type) {
      case 'Café': return <Beer size={14} />;
      case 'Koffiebar': return <Coffee size={14} />;
      case 'Restaurant': return <Utensils size={14} />;
      case 'Brasserie': return <Wine size={14} />;
      case 'Slapen': return <Bed size={14} />;
      case 'Shoppen': return <ShoppingBag size={14} />;
      default: return <Star size={14} />;
    }
  };

  // Get unique types from hotspots for this city
  const allCityHotspots = HOTSPOTS.filter(spot => spot.city === city.slug);
  const hasShoppenTag = allCityHotspots.some((spot) => spot.tags.includes('Shoppen'));
  const uniqueTypes = Array.from(new Set([
    ...allCityHotspots.map(spot => spot.type),
    ...(hasShoppenTag ? ['Shoppen'] : []),
  ]));
  const filterOptions = ['Alles', ...uniqueTypes];

  const cityHotspots = HOTSPOTS
    .filter(spot => {
      if (spot.city !== city.slug) return false;
      if (selectedFilter === 'Alles') return true;
      return spot.type === selectedFilter || spot.tags.includes(selectedFilter);
    })
    .sort((a, b) => {
      const aIsAanrader = a.tags.includes('Aanrader') ? 1 : 0;
      const bIsAanrader = b.tags.includes('Aanrader') ? 1 : 0;
      return bIsAanrader - aIsAanrader;
    });

  return (
    <section id="hotspots" className="city-section city-hotspots scroll-mt-28">
      <div className="city-shell">
        <div className="city-section-heading city-section-heading-row">
          <div className="max-w-xl">
            <h2 className="city-section-title">Hondvriendelijke hotspots in {city.name}</h2>
            <p className="city-body-copy">Geen gedoe aan de deur. Hier zijn jij en je kwispelende vriend meer dan welkom voor koffie, lunch of een verblijf.</p>
          </div>
          <Link
            to="/hotspots"
            className="city-text-link"
          >
            Bekijk alle locaties <ChevronRight size={18} />
          </Link>
        </div>

        {/* Filter Buttons */}
        {allCityHotspots.length > 0 && (
          <div className="city-filters" role="group" aria-label="Filter op type locatie">
            {filterOptions.map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className="city-filter"
                aria-pressed={selectedFilter === filter}
              >
                {filter}
              </button>
            ))}
          </div>
        )}

        {cityHotspots.length > 0 ? (
          <>
          <div ref={gridRef} className="city-places-grid">
            {(showAll ? cityHotspots : cityHotspots.slice(0, INITIAL_SHOW)).map((spot) => (
              <div key={spot.id} className="relative flex">
                <SavePlaceButton compact place={{ kind: 'hotspot', city_slug: spot.city, place_slug: spot.slug }} className="absolute right-3 top-3 z-10" />
                <Link
                  to={getHotspotDetailPath(spot)}
                  state={{ from: `${location.pathname}${location.search}${location.hash}` }}
                  className="group cursor-pointer active:scale-[0.98] transition-transform text-left flex flex-col w-full"
                >
                  <div className="city-place-image">
                    <img
                      src={spot.image}
                      alt={spot.name}
                      className="w-full h-full object-cover md:transition-transform md:duration-700 md:group-hover:scale-110"
                      width={400}
                      height={256}
                      style={{ objectPosition: spot.imagePosition || 'center' }}
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-white/95 backdrop-blur px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-800 shadow-sm border border-white/20">
                      <span className="text-sky-600">{getIcon(spot.type)}</span> {spot.type}
                    </div>
                    {spot.tags.includes('Aanrader') && (
                      <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-sm px-2.5 py-1.5 rounded-full" style={{ filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3))' }}>
                        <svg width="16" height="16" viewBox="0 0 40 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <defs>
                            <linearGradient id="starGoldHotspots" x1="0" y1="0" x2="40" y2="38" gradientUnits="userSpaceOnUse">
                              <stop offset="0%" stopColor="#fbbf24" />
                              <stop offset="50%" stopColor="#f59e0b" />
                              <stop offset="100%" stopColor="#d97706" />
                            </linearGradient>
                          </defs>
                          <path d="M20 0l5.09 12.26L38.04 14.6 28.02 23.74 30.18 37 20 30.76 9.82 37l2.16-13.26L2 14.6l12.91-2.34z" fill="url(#starGoldHotspots)" />
                        </svg>
                        <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-[0.15em] text-amber-300">Aanrader</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1.5 sm:mb-2 md:group-hover:text-sky-600 md:transition-colors">{spot.name}</h3>
                  <HotspotSocialSummary place={{city:spot.city,slug:spot.slug}}/>
                  <p className="text-slate-500 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 leading-relaxed font-medium">{spot.description}</p>
                  <div className="mt-auto">
                    {spot.address && (
                      <p className="text-slate-400 text-[10px] sm:text-xs mb-2 font-medium">{spot.address}</p>
                    )}
                    <div className="city-place-tags">
                      {spot.tags.filter(tag => tag !== 'Aanrader').slice(0, 3).map((tag) => (
                        <span key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Show more / Show less button */}
          {cityHotspots.length > INITIAL_SHOW && (
            <div className="flex justify-center mt-8 sm:mt-10">
              <button
                onClick={() => {
                  if (showAll && gridRef.current) {
                    gridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                  setShowAll(!showAll);
                }}
                className="city-button"
              >
                {showAll ? (
                  <>
                    Toon minder
                    <ChevronUp size={18} className="transition-transform group-hover:-translate-y-0.5" />
                  </>
                ) : (
                  <>
                    Toon alle {cityHotspots.length} hotspots
                    <ChevronDown size={18} className="transition-transform group-hover:translate-y-0.5" />
                  </>
                )}
              </button>
            </div>
          )}
          </>
        ) : (
          <>
            {selectedFilter !== 'Alles' && allCityHotspots.length > 0 ? (
              <div className="city-empty-state">
                <div className="max-w-lg mx-auto">
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">Geen {selectedFilter} in {city.name}</h3>
                  <p className="city-body-copy">
                    Er zijn momenteel geen hotspots van het type "{selectedFilter}" in {city.name}. Probeer een ander filter of bekijk alle locaties.
                  </p>
                </div>
              </div>
            ) : (
              <a
                href={`https://wa.me/32494816714?text=${encodeURIComponent(HOTSPOT_WHATSAPP_MESSAGE)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block city-empty-state group"
              >
                <div className="max-w-lg mx-auto">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mb-3 sm:mb-4 group-hover:text-sky-600 transition-colors">Wil je jouw zaak hier tonen?</h3>
                  <p className="text-slate-600 font-medium leading-relaxed text-sm sm:text-base mb-6">
                    Ben jij een hondvriendelijke ondernemer in {city.name}? Laat je zaak hier zien en bereik duizenden hondeneigenaars die op zoek zijn naar de beste plekjes aan de kust.
                  </p>
                  <div className="inline-flex items-center gap-2 text-sky-600 font-bold text-sm sm:text-base group-hover:gap-3 transition-all">
                    <Coffee size={20} />
                    <Utensils size={20} />
                    <Bed size={20} />
                  </div>
                  <p className="text-sky-600 font-bold text-xs sm:text-sm mt-4 group-hover:underline">
                    📱 Klik om bericht te sturen via WhatsApp
                  </p>
                </div>
              </a>
            )}
          </>
        )}
        <LocalHero compact citySlug={city.slug} cityName={city.name} />
      </div>
    </section>
  );
};

export default Hotspots;
