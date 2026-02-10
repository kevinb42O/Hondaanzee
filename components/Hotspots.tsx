
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Coffee, Utensils, Bed, ChevronRight } from 'lucide-react';
import { HOTSPOTS } from '../constants.ts';
import { City, Hotspot } from '../types.ts';
import PlaceModal from './PlaceModal.tsx';

const HOTSPOT_WHATSAPP_MESSAGE = `Dag! 👋\n\nIk ben een hondvriendelijke ondernemer en ik zou graag mijn zaak op hondaanzee.be laten tonen bij de hotspots.\n\nKun je me meer info geven over de mogelijkheden?\n\nBedankt!`;

interface HotspotsProps {
  city: City;
}

const Hotspots: React.FC<HotspotsProps> = ({ city }) => {
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('Alles');

  const handleHotspotClick = (hotspot: Hotspot) => {
    setSelectedHotspot(hotspot);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedHotspot(null), 300); // Clear after animation
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'Café': return <Coffee size={14} />;
      case 'Restaurant': return <Utensils size={14} />;
      case 'Slapen': return <Bed size={14} />;
      default: return <Star size={14} />;
    }
  };

  // Get unique types from hotspots for this city
  const allCityHotspots = HOTSPOTS.filter(spot => spot.city === city.slug);
  const uniqueTypes = Array.from(new Set(allCityHotspots.map(spot => spot.type)));
  const filterOptions = ['Alles', ...uniqueTypes];

  const cityHotspots = HOTSPOTS
    .filter(spot => {
      if (spot.city !== city.slug) return false;
      if (selectedFilter === 'Alles') return true;
      return spot.type === selectedFilter;
    })
    .sort((a, b) => {
      const aIsAanrader = a.tags.includes('Aanrader') ? 1 : 0;
      const bIsAanrader = b.tags.includes('Aanrader') ? 1 : 0;
      return bIsAanrader - aIsAanrader;
    });

  return (
    <section id="hotspots" className="py-10 sm:py-12 md:py-24 bg-white scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10 md:mb-14 gap-4">
          <div className="max-w-xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 mb-2 sm:mb-3 tracking-tight">Hondvriendelijke Hotspots in {city.name}</h2>
            <p className="text-slate-600 font-medium leading-relaxed text-sm sm:text-base">Geen gedoe aan de deur. Hier zijn jij en je kwispelende vriend meer dan welkom voor koffie, lunch of een verblijf.</p>
          </div>
          <Link
            to="/hotspots"
            className="flex items-center gap-2 text-sky-600 font-bold hover:gap-3 transition-all text-sm md:text-base active:opacity-70 touch-target"
          >
            Bekijk alle locaties <ChevronRight size={18} />
          </Link>
        </div>

        {/* Filter Buttons */}
        {allCityHotspots.length > 0 && (
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-8 sm:mb-10">
            {filterOptions.map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all active:scale-95 ${
                  selectedFilter === filter
                    ? 'bg-sky-600 text-white shadow-lg shadow-sky-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        )}

        {cityHotspots.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10 items-stretch">
            {cityHotspots.map((spot) => (
              <div key={spot.id} className="flex">
                <button
                  type="button"
                  className="group cursor-pointer active:scale-[0.98] transition-transform text-left flex flex-col w-full"
                  onClick={() => handleHotspotClick(spot)}
                >
                  <div className="relative aspect-[4/3] rounded-[1.25rem] sm:rounded-[1.5rem] md:rounded-[2rem] overflow-hidden mb-4 sm:mb-5 shadow-lg shadow-slate-100 md:transition-shadow md:group-hover:shadow-sky-100">
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
                      <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 flex flex-col items-center" style={{ filter: 'drop-shadow(0 2px 8px rgba(161, 98, 7, 0.5))' }}>
                        <svg width="40" height="38" viewBox="0 0 40 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <defs>
                            <linearGradient id="starGold" x1="0" y1="0" x2="40" y2="38" gradientUnits="userSpaceOnUse">
                              <stop offset="0%" stopColor="#fbbf24" />
                              <stop offset="50%" stopColor="#f59e0b" />
                              <stop offset="100%" stopColor="#d97706" />
                            </linearGradient>
                          </defs>
                          <path d="M20 0l5.09 12.26L38.04 14.6 28.02 23.74 30.18 37 20 30.76 9.82 37l2.16-13.26L2 14.6l12.91-2.34z" fill="url(#starGold)" stroke="#fde68a" strokeWidth="1" />
                        </svg>
                        <span className="mt-0.5 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-[0.15em] text-amber-700" style={{ textShadow: '0 0 8px rgba(251, 191, 36, 0.6)' }}>Aanrader</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1.5 sm:mb-2 md:group-hover:text-sky-600 md:transition-colors">{spot.name}</h3>
                  <p className="text-slate-500 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 leading-relaxed font-medium">{spot.description}</p>
                  <div className="mt-auto">
                    {spot.address && (
                      <p className="text-slate-400 text-[10px] sm:text-xs mb-2 font-medium">{spot.address}</p>
                    )}
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
                      {spot.tags.filter(tag => tag !== 'Aanrader').map((tag) => (
                        <span
                          key={tag}
                          className="text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-widest font-black px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg border bg-sky-50 text-sky-600 border-sky-100"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <>
            {selectedFilter !== 'Alles' && allCityHotspots.length > 0 ? (
              <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-8 sm:p-12 text-center">
                <div className="max-w-lg mx-auto">
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">Geen {selectedFilter} in {city.name}</h3>
                  <p className="text-slate-600 font-medium leading-relaxed text-sm sm:text-base">
                    Er zijn momenteel geen hotspots van het type "{selectedFilter}" in {city.name}. Probeer een ander filter of bekijk alle locaties.
                  </p>
                </div>
              </div>
            ) : (
              <a
                href={`https://wa.me/32494816714?text=${encodeURIComponent(HOTSPOT_WHATSAPP_MESSAGE)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 sm:p-12 md:p-16 text-center hover:border-sky-300 hover:bg-sky-50/30 transition-all cursor-pointer group"
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
      </div>

      {/* Modal */}
      <PlaceModal
        place={selectedHotspot}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        accentColor="sky"
      />
    </section>
  );
};

export default Hotspots;
