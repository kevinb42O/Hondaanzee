
import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, ShoppingBag, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { SERVICES } from '../constants.ts';
import { City, Service } from '../types.ts';
import PlaceModal from './PlaceModal.tsx';

interface ServicesProps {
  city: City;
}

const INITIAL_SHOW = 6;

const Services: React.FC<ServicesProps> = ({ city }) => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('Alles');
  const [showAll, setShowAll] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  const handleServiceClick = (service: Service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedService(null), 300); // Clear after animation
  };

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
    <section id="diensten" className="py-10 sm:py-12 md:py-24 bg-slate-50 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10 md:mb-14 gap-4">
          <div className="max-w-xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 mb-2 sm:mb-3 tracking-tight">Praktische Diensten in {city.name}</h2>
            <p className="text-slate-600 font-medium leading-relaxed text-sm sm:text-base">Dierenartsen en winkels waar jij en je hond met een gerust hart terecht kunt.</p>
          </div>
          {allCityServices.length > 3 && (
            <Link
              to="/diensten"
              className="flex items-center gap-2 text-emerald-600 font-bold hover:gap-3 transition-all text-sm md:text-base active:opacity-70 touch-target"
            >
              Bekijk alle diensten <ChevronRight size={18} />
            </Link>
          )}
        </div>

        {/* Filter Buttons */}
        {uniqueTypes.length > 1 && (
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-8 sm:mb-10">
            {filterOptions.map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all active:scale-95 ${
                  selectedFilter === filter
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        )}

        {cityServices.length > 0 ? (
        <>
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch">
          {(showAll ? cityServices : cityServices.slice(0, INITIAL_SHOW)).map((service) => (
            <div key={service.id} className="flex">
              <button
                type="button"
                className="group cursor-pointer active:scale-[0.98] transition-transform text-left flex flex-col w-full"
                onClick={() => handleServiceClick(service)}
              >
                <div className="relative aspect-[16/9] rounded-[1.25rem] sm:rounded-[1.5rem] overflow-hidden mb-4 sm:mb-5 shadow-lg shadow-slate-100 md:transition-shadow md:group-hover:shadow-emerald-100">
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
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
                    {service.tags.filter(tag => tag !== 'Aanrader').map((tag) => (
                      <span key={tag} className="text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-widest font-black bg-emerald-50 text-emerald-700 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg border border-emerald-100">
                        {tag}
                      </span>
                    ))}
                  </div>
                  {service.website && (
                    <a
                      href={service.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-[10px] sm:text-xs text-emerald-600 hover:text-emerald-700 font-bold hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Bezoek website →
                    </a>
                  )}
                </div>
              </button>
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
              className="group flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-bold text-sm sm:text-base bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 border-2 border-transparent hover:border-emerald-200 transition-all duration-300 active:scale-95 shadow-sm hover:shadow-md"
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
          <div className="bg-white border-2 border-slate-200 rounded-3xl p-8 sm:p-12 text-center">
            <div className="max-w-lg mx-auto">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">Geen {selectedFilter} in {city.name}</h3>
              <p className="text-slate-600 font-medium leading-relaxed text-sm sm:text-base">
                Er zijn momenteel geen diensten van het type "{selectedFilter}" in {city.name}. Probeer een ander filter.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <PlaceModal
        place={selectedService}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        accentColor="emerald"
      />
    </section>
  );
};

export default Services;
