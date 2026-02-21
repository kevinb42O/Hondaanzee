import React, { useMemo, useState } from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';
import { HOTSPOTS, SERVICES } from '../constants.ts';
import { Hotspot, Service } from '../types.ts';
import PlaceModal from './PlaceModal.tsx';

interface LocalHeroProps {
  citySlug: string;
  cityName: string;
}

type Place = (Hotspot | Service) & { _source: 'hotspot' | 'service' };

const LocalHero: React.FC<LocalHeroProps> = ({ citySlug, cityName }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Hotspot | Service | null>(null);

  // Combine hotspots + services for this city, tag with source
  const allPlaces: Place[] = useMemo(() => {
    const hotspots: Place[] = HOTSPOTS.filter(h => h.city === citySlug).map(h => ({ ...h, _source: 'hotspot' as const }));
    const services: Place[] = SERVICES.filter(s => s.city === citySlug).map(s => ({ ...s, _source: 'service' as const }));
    return [...hotspots, ...services];
  }, [citySlug]);

  // Pick a random place, preferring Aanrader-tagged ones
  const hero: Place | null = useMemo(() => {
    if (allPlaces.length === 0) return null;
    const aanraders = allPlaces.filter(p => p.tags.includes('Aanrader'));
    const pool = aanraders.length > 0 ? aanraders : allPlaces;
    return pool[Math.floor(Math.random() * pool.length)];
  }, [allPlaces]);

  if (!hero) return null;

  const isAanrader = hero.tags.includes('Aanrader');
  const accentColor = hero._source === 'hotspot' ? 'sky' : 'emerald';

  const handleClick = () => {
    setSelectedPlace(hero);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedPlace(null), 300);
  };

  return (
    <>
      <div className="mt-6 sm:mt-8">
        <button
          type="button"
          onClick={handleClick}
          className="w-full text-left group cursor-pointer"
        >
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-amber-200/60 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 shadow-lg shadow-amber-100/40 hover:shadow-xl hover:shadow-amber-200/50 transition-all duration-300">
            {/* Sparkle decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.07]">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 0L55 35L90 30L60 50L90 70L55 65L50 100L45 65L10 70L40 50L10 30L45 35Z" fill="#f59e0b" />
              </svg>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-6">
              {/* Image */}
              <div className="relative w-full sm:w-28 md:w-32 h-40 sm:h-28 md:h-32 flex-shrink-0 rounded-xl sm:rounded-2xl overflow-hidden shadow-md">
                <img
                  src={hero.image}
                  alt={hero.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  style={{ objectPosition: hero.imagePosition || 'center' }}
                  width={128}
                  height={128}
                  loading="lazy"
                  decoding="async"
                />
                {isAanrader && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-slate-900/80 backdrop-blur-sm px-2 py-1 rounded-full">
                    <svg width="12" height="12" viewBox="0 0 40 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="starGoldLocalHero" x1="0" y1="0" x2="40" y2="38" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="#fbbf24" />
                          <stop offset="50%" stopColor="#f59e0b" />
                          <stop offset="100%" stopColor="#d97706" />
                        </linearGradient>
                      </defs>
                      <path d="M20 0l5.09 12.26L38.04 14.6 28.02 23.74 30.18 37 20 30.76 9.82 37l2.16-13.26L2 14.6l12.91-2.34z" fill="url(#starGoldLocalHero)" />
                    </svg>
                    <span className="text-[8px] font-extrabold uppercase tracking-[0.15em] text-amber-300">Aanrader</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-amber-100 text-amber-600 p-1.5 rounded-lg">
                    <Sparkles size={14} />
                  </div>
                  <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-amber-600">
                    Lokale tip in {cityName}
                  </span>
                </div>
                <h4 className="text-base sm:text-lg font-black text-slate-900 mb-1 group-hover:text-amber-700 transition-colors truncate">
                  {hero.name}
                </h4>
                <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed line-clamp-2 mb-3">
                  {hero.description}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {hero.tags.filter(t => t !== 'Aanrader').slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-[8px] sm:text-[9px] uppercase tracking-widest font-black bg-amber-100/60 text-amber-700 px-2 py-1 rounded-md border border-amber-200/50"
                    >
                      {tag}
                    </span>
                  ))}
                  <span className={`ml-auto text-xs font-bold group-hover:underline flex items-center gap-1 ${accentColor === 'emerald' ? 'text-emerald-600' : 'text-sky-600'}`}>
                    Bekijk <ExternalLink size={12} />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* Modal */}
      <PlaceModal
        place={selectedPlace}
        isOpen={isModalOpen}
        onClose={handleClose}
        accentColor={accentColor}
      />
    </>
  );
};

export default LocalHero;
