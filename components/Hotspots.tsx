
import React from 'react';
import { Star, Coffee, Utensils, Bed, ChevronRight } from 'lucide-react';
import { HOTSPOTS } from '../constants.ts';

const Hotspots: React.FC = () => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'Café': return <Coffee size={14} />;
      case 'Restaurant': return <Utensils size={14} />;
      case 'Hotel': return <Bed size={14} />;
      default: return <Star size={14} />;
    }
  };

  return (
    <section id="hotspots" className="py-10 sm:py-12 md:py-24 bg-white scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10 md:mb-14 gap-4">
          <div className="max-w-xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 mb-2 sm:mb-3 tracking-tight">Hondvriendelijke Hotspots</h2>
            <p className="text-slate-600 font-medium leading-relaxed text-sm sm:text-base">Geen gedoe aan de deur. Hier zijn jij en je kwispelende vriend meer dan welkom voor koffie, lunch of een verblijf.</p>
          </div>
          <button className="flex items-center gap-2 text-sky-600 font-bold hover:gap-3 transition-all text-sm md:text-base active:opacity-70 touch-target">
            Bekijk alle locaties <ChevronRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
          {HOTSPOTS.map((spot, index) => (
            <div key={spot.id} className="group cursor-pointer active:scale-[0.98] transition-transform">
              <div className="relative aspect-[4/3] rounded-[1.25rem] sm:rounded-[1.5rem] md:rounded-[2rem] overflow-hidden mb-4 sm:mb-5 shadow-lg shadow-slate-100 md:transition-shadow md:group-hover:shadow-sky-100">
                <img 
                  src={spot.image} 
                  alt={spot.name} 
                  className="w-full h-full object-cover md:transition-transform md:duration-700 md:group-hover:scale-110"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-white/95 backdrop-blur px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-800 shadow-sm border border-white/20">
                  <span className="text-sky-600">{getIcon(spot.type)}</span> {spot.type}
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1.5 sm:mb-2 md:group-hover:text-sky-600 md:transition-colors">{spot.name}</h3>
              <p className="text-slate-500 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 leading-relaxed font-medium">{spot.description}</p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {spot.tags.map((tag) => (
                  <span key={tag} className="text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-widest font-black bg-slate-50 text-slate-600 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg border border-slate-100">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hotspots;
