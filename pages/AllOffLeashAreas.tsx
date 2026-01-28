
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, X, Star, MapPin, Navigation, TreePine, Palmtree } from 'lucide-react';
import { OFF_LEASH_AREAS } from '../constants.ts';
import { CITIES } from '../cityData.ts';
import { useSEO, SEO_DATA } from '../utils/seo.ts';
import ImagePlaceholder from '../components/ImagePlaceholder.tsx';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon path issues
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const AllOffLeashAreas: React.FC = () => {
  const location = useLocation();
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedArea, setSelectedArea] = useState<number | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const areaDetailRef = useRef<HTMLDivElement>(null);

  useSEO(SEO_DATA.losloopzones);

  // Handle URL parameter for direct area selection
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const areaParam = params.get('area');
    if (areaParam) {
      const areaIndex = parseInt(areaParam, 10);
      if (!isNaN(areaIndex) && areaIndex >= 0 && areaIndex < OFF_LEASH_AREAS.length) {
        setSelectedArea(areaIndex);
        const area = OFF_LEASH_AREAS[areaIndex];
        if (area) {
          setSelectedCity(area.city);
        }
      }
    }
  }, [location.search]);

  // Scroll to area detail when selected
  useEffect(() => {
    if (selectedArea !== null && areaDetailRef.current) {
      setTimeout(() => {
        areaDetailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [selectedArea]);

  const filteredAreas = useMemo(() => {
    let areas = [...OFF_LEASH_AREAS];

    if (selectedCity !== 'all') {
      areas = areas.filter(area => area.city === selectedCity);
    }

    return areas;
  }, [selectedCity]);

  const displayedArea = useMemo(() => {
    if (selectedArea !== null) {
      return OFF_LEASH_AREAS.find((_, index) => index === selectedArea) || null;
    }
    return null;
  }, [selectedArea]);

  const createCustomIcon = (isSelected: boolean) => {
    const uniqueId = `marker-${Math.random().toString(36).substr(2, 9)}`;
    const gradientId = `${uniqueId}-gradient`;
    const filterId = `${uniqueId}-filter`;
    const primaryColor = isSelected ? '#10b981' : '#0ea5e9';
    const secondaryColor = isSelected ? '#059669' : '#0284c7';

    return L.divIcon({
      html: `
        <div class="relative ${isSelected ? 'marker-pulse' : ''}">
          <svg width="44" height="52" viewBox="0 0 44 52" fill="none" xmlns="http://www.w3.org/2000/svg" class="custom-marker-pin">
            <defs>
              <linearGradient id="${gradientId}" x1="22" y1="0" x2="22" y2="44" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="${primaryColor}"/>
                <stop offset="100%" stop-color="${secondaryColor}"/>
              </linearGradient>
              <filter id="${filterId}" x="-20%" y="-10%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="${isSelected ? 'rgba(16, 185, 129, 0.4)' : 'rgba(14, 165, 233, 0.4)'}" flood-opacity="1"/>
              </filter>
            </defs>
            <g filter="url(#${filterId})">
              <path d="M22 2C12.06 2 4 10.06 4 20C4 34 22 50 22 50C22 50 40 34 40 20C40 10.06 31.94 2 22 2Z" fill="url(#${gradientId})"/>
              <circle cx="22" cy="18" r="8" fill="white" fill-opacity="0.95"/>
              <circle cx="22" cy="18" r="4" fill="${primaryColor}"/>
            </g>
          </svg>
        </div>
      `,
      className: '',
      iconSize: [44, 52],
      iconAnchor: [22, 52],
      popupAnchor: [0, -52]
    });
  };

  useEffect(() => {
    if (!mapRef.current) return;

    // Cleanup existing map
    if (leafletInstance.current) {
      leafletInstance.current.remove();
      leafletInstance.current = null;
    }

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      if (!mapRef.current) return;

      // Initialize map centered on Belgian coast
      const map = L.map(mapRef.current, {
        scrollWheelZoom: false,
        zoomControl: true,
      }).setView([51.2154, 2.927], 10);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap, © CARTO'
      }).addTo(map);

      leafletInstance.current = map;

      // Force map to recognize its container size
      setTimeout(() => map.invalidateSize(), 100);

      // Add markers
      markersRef.current = [];
      const bounds = L.latLngBounds([]);

      filteredAreas.forEach((area) => {
        const globalIndex = OFF_LEASH_AREAS.findIndex(a => a.name === area.name && a.city === area.city);
        const isSelected = selectedArea === globalIndex;
        const marker = L.marker([area.lat, area.lng]).addTo(map);

        marker.on('click', () => {
          setSelectedArea(globalIndex);
          map.setView([area.lat, area.lng], 14, { animate: true });
        });

        const cityData = CITIES.find(c => c.slug === area.city);
        marker.bindPopup(`
          <div class="text-center">
            <strong class="text-sky-600 text-lg">${area.name}</strong><br>
            <span class="text-slate-600">${cityData?.name || area.city}</span><br>
            <span class="text-sm text-slate-500">${area.address}</span>
          </div>
        `);

        markersRef.current.push(marker);
        bounds.extend([area.lat, area.lng]);
      });

      // Fit map to show all markers
      if (filteredAreas.length > 0) {
        if (selectedArea !== null && displayedArea) {
          map.setView([displayedArea.lat, displayedArea.lng], 14);
        } else {
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      }

    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (leafletInstance.current) {
        leafletInstance.current.remove();
        leafletInstance.current = null;
      }
    };
  }, [filteredAreas, selectedArea, displayedArea]);

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="animate-in fade-in overflow-x-clip">
      <div className="relative bg-gradient-to-br from-sky-900 via-sky-800 to-sky-900 text-white py-12 sm:py-16 md:py-24 pb-24 sm:pb-32 md:pb-40 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-10 right-10 text-sky-700/30 hidden md:block" style={{ animation: 'float 3s ease-in-out infinite' }}>
          <TreePine size={70} strokeWidth={1.5} />
        </div>
        <div className="absolute bottom-32 right-20 text-sky-700/40 hidden lg:block" style={{ animation: 'float 4s ease-in-out infinite', animationDelay: '1s' }}>
          <Palmtree size={65} strokeWidth={1.5} />
        </div>
        <div className="absolute top-32 left-16 text-sky-700/30 hidden md:block" style={{ animation: 'pulse 3s ease-in-out infinite' }}>
          <MapPin size={60} strokeWidth={1.5} />
        </div>
        <div className="absolute top-1/2 right-8 text-sky-700/25 hidden md:block rotate-12">
          <Star size={50} strokeWidth={1.5} />
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sky-200 font-bold hover:text-sky-400 transition-colors mb-6 sm:mb-8 active:opacity-70 touch-target py-2"
          >
            <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="text-sm sm:text-base">Terug naar home</span>
          </Link>

          <div className="max-w-3xl relative">
            <div className="absolute -left-20 sm:-left-24 md:-left-28 top-0 text-5xl sm:text-6xl md:text-7xl hidden sm:block" style={{ animation: 'float 2.5s ease-in-out infinite' }}>
              🐕
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black mb-4 sm:mb-6 leading-[1.1] tracking-tight">
              Alle <span className="text-sky-400">Losloopzones</span>
            </h1>
            <p className="text-sky-100 text-base sm:text-lg md:text-xl leading-relaxed font-medium">
              Ontdek alle hondenlosloopzones aan de Belgische kust. Filter op stad en klik op een zone voor meer info.
            </p>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] rotate-180" style={{ zIndex: 5 }}>
          <svg className="relative block w-[calc(100%+1.3px)] h-[60px] md:h-[80px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#f8fafc"></path>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-slate-50 min-h-screen -mt-1">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">

          {/* Filters */}
          <div className="mb-6 md:mb-8 bg-white rounded-xl p-4 md:p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-slate-900">Filter op stad</h2>
              {selectedCity !== 'all' && (
                <button
                  onClick={() => {
                    setSelectedCity('all');
                    setSelectedArea(null);
                  }}
                  className="text-sm font-bold text-sky-600 hover:text-sky-700 hover:bg-sky-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                >
                  <X size={16} /> Wis filters
                </button>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">
                <MapPin size={14} className="inline mr-2" />
                Gemeente
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setSelectedCity('all');
                    setSelectedArea(null);
                  }}
                  className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${selectedCity === 'all'
                    ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  Alle ({OFF_LEASH_AREAS.length})
                </button>
                {CITIES.map((city) => {
                  const count = OFF_LEASH_AREAS.filter(a => a.city === city.slug).length;
                  if (count === 0) return null;
                  return (
                    <button
                      key={city.slug}
                      onClick={() => {
                        setSelectedCity(city.slug);
                        setSelectedArea(null);
                      }}
                      className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${selectedCity === city.slug
                        ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                      {city.name} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Full Width Map */}
          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200">
              <div
                ref={mapRef}
                className="w-full h-[500px] md:h-[600px]"
              />
              {selectedArea !== null && displayedArea && (
                <div className="p-4 bg-sky-50 border-t border-sky-200">
                  <button
                    onClick={() => setSelectedArea(null)}
                    className="text-sm text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1"
                  >
                    <X size={16} />
                    Toon alle zones
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Grid Layout */}
          <div ref={areaDetailRef}>
            {displayedArea ? (
              // Single Area Detail View
              <div className="max-w-4xl mx-auto">\n                <button
                onClick={() => setSelectedArea(null)}
                className="mb-4 text-sky-600 hover:text-sky-700 font-bold flex items-center gap-2"
              >
                <X size={20} />
                Terug naar overzicht
              </button>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
                  <div className="relative h-80 bg-slate-200">
                    {displayedArea.image && displayedArea.image !== '/placeholder.webp' ? (
                      <img
                        src={displayedArea.image}
                        alt={displayedArea.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImagePlaceholder areaName={displayedArea.name} className="w-full h-full" />
                    )}
                  </div>
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h2 className="text-3xl font-black text-slate-900 mb-3">{displayedArea.name}</h2>
                        <div className="flex items-center gap-2 text-slate-600 mb-2">
                          <MapPin size={18} className="text-sky-500" />
                          <span className="text-lg">{displayedArea.address}</span>
                        </div>
                        {displayedArea.rating && (
                          <div className="mb-4">
                            {renderStars(displayedArea.rating)}
                          </div>
                        )}
                      </div>
                    </div>

                    {displayedArea.description && (
                      <p className="text-slate-600 text-lg leading-relaxed mb-8">{displayedArea.description}</p>
                    )}

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayedArea.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-sky-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-sky-700 transition-colors shadow-lg shadow-sky-600/30"
                    >
                      <Navigation size={20} />
                      Navigeer naar deze zone
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              // Grid View
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black text-slate-900">
                    {filteredAreas.length} {filteredAreas.length === 1 ? 'zone' : 'zones'} gevonden
                  </h2>
                </div>

                {filteredAreas.length === 0 ? (
                  <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-slate-200">
                    <div className="text-7xl mb-4">🐕</div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Geen zones gevonden</h3>
                    <p className="text-slate-600 text-lg">Probeer een andere stad te selecteren.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAreas.map((area) => {
                      const globalIndex = OFF_LEASH_AREAS.findIndex(a => a.name === area.name && a.city === area.city);
                      const cityData = CITIES.find(c => c.slug === area.city);
                      return (
                        <button
                          key={`${area.city}-${area.name}`}
                          onClick={() => setSelectedArea(globalIndex)}
                          className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-xl hover:border-sky-300 transition-all cursor-pointer group w-full text-left"
                        >
                          <div className="relative h-56 bg-slate-200 overflow-hidden">
                            {area.image && area.image !== '/placeholder.webp' ? (
                              <img
                                src={area.image}
                                alt={area.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            ) : (
                              <ImagePlaceholder areaName={area.name} className="w-full h-full" />
                            )}
                            {area.rating && (
                              <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg">
                                {renderStars(area.rating)}
                              </div>
                            )}
                          </div>
                          <div className="p-5">
                            <h3 className="text-xl font-black text-slate-900 group-hover:text-sky-600 transition-colors mb-3 line-clamp-2">
                              {area.name}
                            </h3>
                            <div className="flex items-center gap-2 text-slate-600 text-sm mb-3">
                              <MapPin size={16} className="text-sky-500 flex-shrink-0" />
                              <span className="font-bold">{cityData?.name || area.city}</span>
                            </div>
                            {area.description && (
                              <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 mb-4">{area.description}</p>
                            )}
                            <div className="pt-3 border-t border-slate-100">
                              <span className="text-sky-600 font-bold text-sm group-hover:gap-2 flex items-center transition-all">
                                Bekijk details
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllOffLeashAreas;
