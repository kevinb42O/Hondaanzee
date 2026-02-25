
import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Stethoscope, ShoppingBag, MapPin, Filter, X } from 'lucide-react';
import { SERVICES } from '../constants.ts';
import { CITIES } from '../cityData.ts';
import { useSEO, SEO_DATA } from '../utils/seo.ts';
import PlaceModal from '../components/PlaceModal.tsx';
import { Service } from '../types.ts';

const AllServices: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleServiceClick = (service: Service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedService(null), 300); // Clear after animation
  };

  // Apply SEO metadata
  useSEO(SEO_DATA.diensten);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'Dierenarts': return <Stethoscope size={14} />;
      case 'Dierenspeciaalzaak': return <ShoppingBag size={14} />;
      default: return <Stethoscope size={14} />;
    }
  };

  const filteredServices = useMemo(() => {
    return SERVICES.filter(service => {
      const cityMatch = selectedCity === 'all' || service.city === selectedCity;
      const typeMatch = selectedType === 'all' || service.type === selectedType;
      return cityMatch && typeMatch;
    }).sort((a, b) => {
      const aIsAanrader = a.tags.includes('Aanrader') ? 1 : 0;
      const bIsAanrader = b.tags.includes('Aanrader') ? 1 : 0;
      return bIsAanrader - aIsAanrader;
    });
  }, [selectedCity, selectedType]);

  const types = ['all', ...Array.from(new Set(SERVICES.map(service => service.type)))];
  const citiesWithServices = useMemo(() => {
    const citySet = new Set(SERVICES.map(service => service.city));
    return CITIES.filter(city => citySet.has(city.slug));
  }, []);

  const getCityName = (slug: string) => {
    return CITIES.find(city => city.slug === slug)?.name || slug;
  };

  const hasFilters = selectedCity !== 'all' || selectedType !== 'all';

  return (
    <div className="animate-in fade-in overflow-x-hidden">
      <div className="relative pt-12 sm:pt-16 md:pt-24 pb-24 sm:pb-32 md:pb-40 overflow-hidden min-h-[50vh] flex items-center text-white">
        {/* Background Image */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(/diensten.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        >
          <div className="absolute inset-0 bg-slate-900/60"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-sky-900/90 via-sky-900/40 to-slate-900/40"></div>
        </div>
        {/* Decorative Elements */}

        <div className="absolute top-1/2 right-8 text-sky-700/20 hidden md:block rotate-12">
          <ShoppingBag size={50} strokeWidth={1.5} />
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sky-200 font-bold hover:text-white transition-colors mb-6 sm:mb-8 active:opacity-70 touch-target py-2"
          >
            <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="text-sm sm:text-base">Terug naar home</span>
          </Link>

          <div className="max-w-3xl relative">
            <div className="absolute -left-20 top-0 text-6xl hidden xl:block animate-bounce" style={{ animationDuration: '2s', animationDelay: '0.5s' }}>
              🏥
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black mb-4 sm:mb-6 leading-[1.1] tracking-tight">
              Praktische <span className="text-sky-300">Diensten</span>
            </h1>
            <p className="text-sky-100 text-base sm:text-lg md:text-xl leading-relaxed font-medium">
              Alle dierenartsen en dierenwinkels aan de Belgische kust waar je met je hond terecht kunt.
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

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 sm:py-12 md:py-16">
        {/* Filters */}
        <div className="bg-white border-2 border-slate-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 mb-8 sm:mb-12 shadow-sm">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="bg-sky-100 text-sky-600 p-2 sm:p-2.5 rounded-xl">
              <Filter size={18} className="sm:w-5 sm:h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Filters</h2>
            {hasFilters && (
              <button
                onClick={() => {
                  setSelectedCity('all');
                  setSelectedType('all');
                }}
                className="ml-auto text-sm font-bold text-slate-500 hover:text-sky-600 transition-colors flex items-center gap-2"
              >
                <X size={16} /> Wis filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* City Filter */}
            <fieldset>
              <legend className="block text-sm font-bold text-slate-700 mb-3">
                <MapPin size={14} className="inline mr-2" />
                Gemeente
              </legend>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCity('all')}
                  className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${selectedCity === 'all'
                    ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  Alle
                </button>
                {citiesWithServices.map(city => (
                  <button
                    key={city.slug}
                    onClick={() => setSelectedCity(city.slug)}
                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${selectedCity === city.slug
                      ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Type Filter */}
            <fieldset>
              <legend className="block text-sm font-bold text-slate-700 mb-3">
                Type
              </legend>
              <div className="flex flex-wrap gap-2">
                {types.map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${selectedType === type
                      ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                  >
                    {type !== 'all' && <span className="opacity-70">{getIcon(type)}</span>}
                    {type === 'all' ? 'Alle' : type}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 sm:mb-8">
          <p className="text-slate-600 font-bold text-sm sm:text-base">
            <span className="text-sky-600 text-lg sm:text-xl">{filteredServices.length}</span> {filteredServices.length === 1 ? 'dienst' : 'diensten'} gevonden
          </p>
        </div>

        {/* Services Grid */}
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {filteredServices.map((service) => (
              <button
                key={service.id}
                type="button"
                className="group cursor-pointer active:scale-[0.98] transition-transform text-left flex flex-col h-full"
                onClick={() => handleServiceClick(service)}
              >
                <div className="relative aspect-[16/9] rounded-[1.25rem] sm:rounded-[1.5rem] overflow-hidden mb-4 sm:mb-5 shadow-lg shadow-slate-100 md:transition-shadow md:group-hover:shadow-sky-100">
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
                    <span className="text-sky-600">{getIcon(service.type)}</span> {service.type}
                  </div>
                  {service.tags.includes('Aanrader') && (
                    <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-sm px-2.5 py-1.5 rounded-full" style={{ filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3))' }}>
                      <svg width="16" height="16" viewBox="0 0 40 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <linearGradient id="starGoldAllServices" x1="0" y1="0" x2="40" y2="38" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#fbbf24" />
                            <stop offset="50%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#d97706" />
                          </linearGradient>
                        </defs>
                        <path d="M20 0l5.09 12.26L38.04 14.6 28.02 23.74 30.18 37 20 30.76 9.82 37l2.16-13.26L2 14.6l12.91-2.34z" fill="url(#starGoldAllServices)" />
                      </svg>
                      <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-[0.15em] text-amber-300">Aanrader</span>
                    </div>
                  )}
                  <a
                    href={`/${service.city}`}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-slate-900/90 backdrop-blur text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1 text-[9px] sm:text-[10px] font-black uppercase tracking-wider hover:bg-sky-600 transition-colors cursor-pointer no-underline"
                  >
                    <MapPin size={10} /> {getCityName(service.city)}
                  </a>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1.5 sm:mb-2 md:group-hover:text-sky-600 md:transition-colors">{service.name}</h3>
                <p className="text-slate-500 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 leading-relaxed font-medium">{service.description}</p>
                {service.address && (
                  <p className="text-slate-400 text-[10px] sm:text-xs mb-2 font-medium">{service.address}</p>
                )}
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 mt-auto">
                  {service.tags.filter(tag => tag !== 'Aanrader').map((tag) => (
                    <span key={tag} className="text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-widest font-black bg-sky-50 text-sky-700 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg border border-sky-100">
                      {tag}
                    </span>
                  ))}
                </div>
                {service.website && (
                  <a
                    href={service.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-[10px] sm:text-xs text-sky-600 hover:text-sky-700 font-bold hover:underline cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    Bezoek website →
                  </a>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 sm:py-20 md:py-24">
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 sm:p-12 md:p-16 max-w-2xl mx-auto">
              <div className="text-slate-300 mb-6">
                <Stethoscope size={48} className="mx-auto" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">Geen diensten gevonden</h3>
              <p className="text-slate-600 font-medium leading-relaxed mb-6">
                Er zijn geen diensten die aan deze filters voldoen. Probeer andere filters te selecteren.
              </p>
              {hasFilters && (
                <button
                  onClick={() => {
                    setSelectedCity('all');
                    setSelectedType('all');
                  }}
                  className="inline-flex items-center gap-2 bg-sky-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-sky-700 transition-colors"
                >
                  <X size={16} /> Wis alle filters
                </button>
              )}
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
    </div>
  );
};

export default AllServices;
