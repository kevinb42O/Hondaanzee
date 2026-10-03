
import React, { useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Stethoscope, ShoppingBag, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { SERVICES } from '../constants.ts';
import { City } from '../types.ts';
import { getServiceDetailPath } from '../utils/placeRoutes.ts';
import SavePlaceButton from './member/SavePlaceButton.tsx';

interface ServicesProps {
  city: City;
}

const INITIAL_SHOW = 6;

const Services: React.FC<ServicesProps> = ({ city }) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('Alles');
  const [showAll, setShowAll] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const getIcon = (type: string) => {
    switch (type) {
      case 'Dierenarts': return <Stethoscope size={14} />;
      case 'Dierenspeciaalzaak': return <ShoppingBag size={14} />;
      default: return <Stethoscope size={14} />;
    }
  };

  const allCityServices = SERVICES.filter(service => service.city === city.slug);
  const uniqueTypes = Array.from(new Set(allCityServices.map(s => s.type)));
  const filterOptions = ['Alles', ...uniqueTypes];

  const cityServices = allCityServices
    .filter(service => {
      if (selectedFilter === 'Alles') return true;
      return service.type === selectedFilter;
    })
    .sort((a, b) => {
      const aIsAanrader = a.tags.includes('Aanrader') ? 1 : 0;
      const bIsAanrader = b.tags.includes('Aanrader') ? 1 : 0;
      return bIsAanrader - aIsAanrader;
    });

  if (allCityServices.length === 0) return null;

  return (
    <section id="diensten" className="city-section city-services scroll-mt-28">
      <div className="city-shell">
        <div className="city-section-heading city-section-heading-row">
          <div className="max-w-xl">
            <h2 className="city-section-title">Praktische diensten in {city.name}</h2>
            <p className="city-body-copy">Dierenartsen en winkels waar jij en je hond met een gerust hart terecht kunt.</p>
          </div>
          {allCityServices.length > 3 && (
            <Link
              to="/diensten"
              className="city-text-link"
            >
              Bekijk alle diensten <ChevronRight size={18} />
            </Link>
          )}
        </div>

        {/* Filter Buttons */}
        {uniqueTypes.length > 1 && (
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

        {cityServices.length > 0 ? (
        <>
        <div ref={gridRef} className="city-places-grid city-services-grid">
          {(showAll ? cityServices : cityServices.slice(0, INITIAL_SHOW)).map((service) => (
            <div key={service.id} className="relative flex">
                <SavePlaceButton compact place={{ kind: 'service', city_slug: service.city, place_slug: service.slug }} className="absolute right-3 top-3 z-10" />
              <Link
                to={getServiceDetailPath(service)}
                state={{ from: `${location.pathname}${location.search}${location.hash}` }}
                className="group cursor-pointer active:scale-[0.98] transition-transform text-left flex flex-col w-full"
              >
                <div className="city-place-image">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover md:transition-transform md:duration-700 md:group-hover:scale-110"
                    style={{ objectPosition: service.imagePosition || 'center' }}
                    width={400}
                    height={256}
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-white/95 backdrop-blur px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-800 shadow-sm border border-white/20">
                    <span className="text-emerald-600">{getIcon(service.type)}</span> {service.type}
                  </div>
                  {service.tags.includes('Aanrader') && (
                    <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-sm px-2.5 py-1.5 rounded-full" style={{ filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3))' }}>
                      <svg width="16" height="16" viewBox="0 0 40 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <linearGradient id="starGoldServices" x1="0" y1="0" x2="40" y2="38" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#fbbf24" />
                            <stop offset="50%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#d97706" />
                          </linearGradient>
                        </defs>
                        <path d="M20 0l5.09 12.26L38.04 14.6 28.02 23.74 30.18 37 20 30.76 9.82 37l2.16-13.26L2 14.6l12.91-2.34z" fill="url(#starGoldServices)" />
                      </svg>
                      <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-[0.15em] text-amber-300">Aanrader</span>
                    </div>
                  )}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1.5 sm:mb-2 md:group-hover:text-emerald-600 md:transition-colors">{service.name}</h3>
                <p className="text-slate-500 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 leading-relaxed font-medium">{service.description}</p>
                <div className="mt-auto">
                  {service.address && (
                    <p className="text-slate-400 text-[10px] sm:text-xs mb-2 font-medium">{service.address}</p>
                  )}
                  <div className="city-place-tags">
                    {service.tags.filter(tag => tag !== 'Aanrader').slice(0, 3).map((tag) => (
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
        {cityServices.length > INITIAL_SHOW && (
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
                  Toon alle {cityServices.length} diensten
                  <ChevronDown size={18} className="transition-transform group-hover:translate-y-0.5" />
                </>
              )}
            </button>
          </div>
        )}
        </>
        ) : (
          <div className="city-empty-state">
            <div className="max-w-lg mx-auto">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">Geen {selectedFilter} in {city.name}</h3>
              <p className="city-body-copy">
                Er zijn momenteel geen diensten van het type "{selectedFilter}" in {city.name}. Probeer een ander filter.
              </p>
            </div>
          </div>
        )}
      </div>

    </section>
  );
};

export default Services;
