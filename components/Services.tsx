
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, ShoppingBag, ChevronRight } from 'lucide-react';
import { SERVICES } from '../constants.ts';
import { City, Service } from '../types.ts';
import PlaceModal from './PlaceModal.tsx';

interface ServicesProps {
  city: City;
}

const Services: React.FC<ServicesProps> = ({ city }) => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('Alles');

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

  const cityServices = allCityServices.filter(service => {
    if (selectedFilter === 'Alles') return true;
    return service.type === selectedFilter;
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch">
          {cityServices.map((service) => (
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
                    width={400}
                    height={256}
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-white/95 backdrop-blur px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-800 shadow-sm border border-white/20">
                    <span className="text-emerald-600">{getIcon(service.type)}</span> {service.type}
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1.5 sm:mb-2 md:group-hover:text-emerald-600 md:transition-colors">{service.name}</h3>
                <p className="text-slate-500 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 leading-relaxed font-medium">{service.description}</p>
                <div className="mt-auto">
                  {service.address && (
                    <p className="text-slate-400 text-[10px] sm:text-xs mb-2 font-medium">{service.address}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
                    {service.tags.map((tag) => (
                      <span key={tag} className="text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-widest font-black bg-emerald-50 text-emerald-700 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg border border-emerald-100">
                        {tag}
                      </span>
                    ))}
                  </div>
                  {service.website && (
                    <span
                      role="link"
                      className="inline-block text-[10px] sm:text-xs text-emerald-600 hover:text-emerald-700 font-bold hover:underline cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(service.website, '_blank', 'noopener,noreferrer');
                      }}
                    >
                      Bezoek website →
                    </span>
                  )}
                </div>
              </button>
            </div>
          ))}
        </div>
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
