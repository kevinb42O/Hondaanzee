
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Coffee, Utensils, Bed, ChevronRight } from 'lucide-react';
import { HOTSPOTS } from '../constants.ts';
import { City, Hotspot } from '../types.ts';
import PlaceModal from './PlaceModal.tsx';

interface HotspotsProps {
  city: City;
}

const Hotspots: React.FC<HotspotsProps> = ({ city }) => {
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const cityHotspots = HOTSPOTS
    .filter(spot => spot.city === city.slug)
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

        {cityHotspots.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
            {cityHotspots.map((spot, index) => (
              <div
                key={spot.id}
                className="group cursor-pointer active:scale-[0.98] transition-transform"
                onClick={() => handleHotspotClick(spot)}
              >
                <div className="relative aspect-[4/3] rounded-[1.25rem] sm:rounded-[1.5rem] md:rounded-[2rem] overflow-hidden mb-4 sm:mb-5 shadow-lg shadow-slate-100 md:transition-shadow md:group-hover:shadow-sky-100">
                  <img
                    src={spot.image}
                    alt={spot.name}
                    className="w-full h-full object-cover md:transition-transform md:duration-700 md:group-hover:scale-110"
                    style={{ objectPosition: spot.imagePosition || 'center' }}
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-white/95 backdrop-blur px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-800 shadow-sm border border-white/20">
                    <span className="text-sky-600">{getIcon(spot.type)}</span> {spot.type}
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1.5 sm:mb-2 md:group-hover:text-sky-600 md:transition-colors">{spot.name}</h3>
                <p className="text-slate-500 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 leading-relaxed font-medium">{spot.description}</p>
                {spot.address && (
                  <p className="text-slate-400 text-[10px] sm:text-xs mb-2 font-medium">{spot.address}</p>
                )}
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
                  {spot.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-widest font-black px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg border ${tag === 'Aanrader'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-slate-50 text-slate-600 border-slate-100'
                        }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                {spot.website && (
                  <a
                    href={spot.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-[10px] sm:text-xs text-sky-600 hover:text-sky-700 font-bold hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Bezoek website →
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <a
            href={`https://wa.me/32494816714?text=${encodeURIComponent(`Dag! 👋\n\nIk ben een hondvriendelijke ondernemer in ${city.name} en ik zou graag mijn zaak op hondaanzee.be laten tonen bij de hotspots.\n\nKun je me meer info geven over de mogelijkheden?\n\nBedankt!`)}`}
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
