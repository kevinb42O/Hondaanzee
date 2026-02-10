
import React, { useMemo, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Navigation, Info, Clock, ExternalLink } from 'lucide-react';
import { City, OffLeashArea } from '../types.ts';
import { CITIES } from '../cityData.ts';
import { OFF_LEASH_AREAS } from '../constants.ts';
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

interface OffLeashAreasProps {
  city: City;
}

const createCustomIcon = (isOpen: boolean, isPulsing: boolean) => {
  const uniqueId = `marker-${Math.random().toString(36).substring(2, 11)}`;
  const gradientId = `${uniqueId}-gradient`;
  const filterId = `${uniqueId}-filter`;
  const primaryColor = isOpen ? '#10b981' : '#f43f5e';
  const secondaryColor = isOpen ? '#059669' : '#e11d48';
  const glowColor = isOpen ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)';

  return L.divIcon({
    html: `
      <div class="relative ${isPulsing ? 'marker-pulse' : ''}">
        <svg width="44" height="52" viewBox="0 0 44 52" fill="none" xmlns="http://www.w3.org/2000/svg" class="custom-marker-pin">
          <defs>
            <linearGradient id="${gradientId}" x1="22" y1="0" x2="22" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="${primaryColor}"/>
              <stop offset="100%" stop-color="${secondaryColor}"/>
            </linearGradient>
            <filter id="${filterId}" x="-20%" y="-10%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="${glowColor}" flood-opacity="1"/>
            </filter>
          </defs>
          <g filter="url(#${filterId})">
            <path d="M22 2C12.06 2 4 10.06 4 20C4 34 22 50 22 50C22 50 40 34 40 20C40 10.06 31.94 2 22 2Z" fill="url(#${gradientId})"/>
            <circle cx="22" cy="18" r="8" fill="white" fill-opacity="0.95"/>
            <circle cx="22" cy="18" r="4" fill="${primaryColor}"/>
          </g>
          ${isOpen ? `
            <circle cx="36" cy="10" r="6" fill="#10b981"/>
            <circle cx="36" cy="10" r="4" fill="white"/>
            <circle cx="36" cy="10" r="2" fill="#10b981"/>
          ` : ''}
        </svg>
      </div>
    `,
    className: '',
    iconSize: [44, 52],
    iconAnchor: [22, 52],
    popupAnchor: [0, -52]
  });
};

const OffLeashAreas: React.FC<OffLeashAreasProps> = ({ city }) => {
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletInstance = useRef<L.Map | null>(null);

  const isAreaOpen = (area: OffLeashArea): boolean => {
    if (!area.openingHours) return true; // Default to always open if not specified

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    return currentTime >= area.openingHours.open && currentTime <= area.openingHours.close;
  };

  const nearestInfo = useMemo(() => {
    const cityAreas = OFF_LEASH_AREAS.filter(area => area.city === city.slug);
    if (cityAreas.length > 0) return null;

    let nearestCity = CITIES[0];
    let minDistance = Infinity;

    CITIES.forEach((c) => {
      const cAreas = OFF_LEASH_AREAS.filter(area => area.city === c.slug);
      if (c.slug === city.slug || cAreas.length === 0) return;

      const dist = Math.sqrt(
        Math.pow(c.lat - city.lat, 2) + Math.pow(c.lng - city.lng, 2)
      );

      if (dist < minDistance) {
        minDistance = dist;
        nearestCity = c;
      }
    });

    const nearestAreas = OFF_LEASH_AREAS.filter(area => area.city === nearestCity.slug);
    const nearestArea = nearestAreas.length > 0 ? nearestAreas[0] : null;
    return {
      city: nearestCity,
      area: nearestArea,
      distanceLabel: minDistance < 0.1 ? 'Vlakbij' : 'In de buurt'
    };
  }, [city]);

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

      // Initialize map
      const map = L.map(mapRef.current, {
        scrollWheelZoom: false,
        zoomControl: false,
        dragging: !L.Browser.mobile,
        touchZoom: true
      });

      leafletInstance.current = map;

      // Modern colorful map style - Carto Voyager (colorful & modern)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Force map to recognize its container size
      setTimeout(() => map.invalidateSize(), 100);

      const cityAreas = OFF_LEASH_AREAS.filter(area => area.city === city.slug);
      const areasToShow = cityAreas;
      const hasAreas = areasToShow.length > 0;
      const markers: L.Marker[] = [];

      if (hasAreas) {
        areasToShow.forEach((area, index) => {
          const isOpen = isAreaOpen(area);
          // TEMPORARILY USE DEFAULT MARKER FOR TESTING

          const marker = L.marker([area.lat, area.lng]).addTo(map)
            .bindPopup(`
            <div class="p-2 font-sans min-w-[180px] max-w-[240px]">
              <div class="flex items-center justify-between mb-2">
                 <b class="text-slate-900 text-sm leading-tight">${area.name}</b>
                 <span class="px-2 py-0.5 rounded text-[9px] font-black uppercase ${isOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}">
                    ${isOpen ? 'Open' : 'Gesloten'}
                 </span>
              </div>
              <p class="text-slate-500 text-xs mb-2">${area.address}</p>
              ${area.description ? `<p class="text-slate-400 text-[10px] mb-2 leading-relaxed">${area.description}</p>` : ''}
              <div class="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold border-t pt-2 border-slate-100">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                ${area.openingHours ? `${area.openingHours.open} - ${area.openingHours.close}` : '24/7 Toegankelijk'}
              </div>
            </div>
          `);
          markers.push(marker);
        });

        if (markers.length > 1) {
          const group = L.featureGroup(markers);
          map.fitBounds(group.getBounds().pad(0.4));
        } else if (markers.length === 1 && cityAreas.length > 0) {
          map.setView([cityAreas[0].lat, cityAreas[0].lng], 15);
        }
      } else if (nearestInfo) {
        const currentMarker = L.circleMarker([city.lat, city.lng], {
          color: '#0284c7',
          fillColor: '#0ea5e9',
          fillOpacity: 0.2,
          radius: 12
        }).addTo(map).bindPopup(`<b class="font-sans">${city.name} Centrum</b>`);

        const isOpen = isAreaOpen(nearestInfo.area);
        const nearestMarker = L.marker([nearestInfo.area.lat, nearestInfo.area.lng]).addTo(map)
          .bindPopup(`
             <div class="p-2 font-sans min-w-[160px]">
              <span class="text-[10px] uppercase font-black text-sky-600 block mb-1">Dichtstbijzijnde</span>
              <div class="flex items-center justify-between mb-2">
                 <b class="text-slate-900 text-sm leading-tight">${nearestInfo.area.name}</b>
                 <span class="px-2 py-0.5 rounded text-[9px] font-black uppercase ${isOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}">
                    ${isOpen ? 'Open' : 'Gesloten'}
                 </span>
              </div>
              <p class="text-slate-500 text-xs">${nearestInfo.area.address}</p>
            </div>
          `);

        const group = L.featureGroup([currentMarker, nearestMarker]);
        map.fitBounds(group.getBounds().pad(0.5));
      } else {
        map.setView([city.lat, city.lng], 13);
      }

    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (leafletInstance.current) {
        leafletInstance.current.remove();
        leafletInstance.current = null;
      }
    };
  }, [city, nearestInfo]);

  return (
    <section className="py-10 sm:py-12 md:py-24 bg-slate-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-stretch">
          <div className="flex flex-col justify-center">
            <div className="mb-6 sm:mb-8 md:mb-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 mb-2 sm:mb-3 tracking-tight">Losloopweides</h2>
              <p className="text-slate-600 font-medium leading-relaxed max-w-2xl text-xs sm:text-sm md:text-base">
                Even stoom afblazen? In deze zones mag je hond veilig loslopen en spelen met andere viervoeters.
              </p>
            </div>

            {OFF_LEASH_AREAS.some(area => area.city === city.slug) ? (
              <>
                <div className="space-y-4">
                  {OFF_LEASH_AREAS.filter(area => area.city === city.slug).map((area) => {
                    const isOpen = isAreaOpen(area);
                    const globalIndex = OFF_LEASH_AREAS.findIndex(a => a.name === area.name && a.city === area.city);
                    return (
                      <button
                        key={area.name}
                        onClick={() => {
                          navigate(`/losloopzones?area=${globalIndex}`);
                        }}
                        className={`bg-white p-5 md:p-6 rounded-2xl border transition-all hover:shadow-md group flex items-start gap-4 cursor-pointer w-full text-left ${isOpen ? 'border-slate-200 hover:border-emerald-300' : 'border-slate-100 opacity-80'}`}
                      >
                        <div className={`h-10 w-10 md:h-12 md:w-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${isOpen ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-400'}`}>
                          <MapPin size={24} />
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-black text-slate-900 leading-tight">{area.name}</h3>
                            {isOpen ? (
                              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Open</span>
                            ) : (
                              <span className="bg-rose-100 text-rose-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Gesloten</span>
                            )}
                          </div>
                          <p className="text-slate-500 font-medium mb-2 text-xs md:text-sm flex items-center gap-1.5">
                            {area.address}
                          </p>
                          {area.description && (
                            <p className="text-slate-400 text-xs mb-3 leading-relaxed">{area.description}</p>
                          )}
                          <div className="flex items-center gap-4">
                            {area.openingHours && (
                              <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase">
                                <Clock size={12} /> {area.openingHours.open} - {area.openingHours.close}
                              </div>
                            )}
                            <div className="inline-flex items-center gap-1.5 text-sky-600 font-bold text-xs">
                              Bekijk details →
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-6">
                  <Link
                    to="/losloopzones"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-sky-600 text-white rounded-xl font-bold text-sm hover:bg-sky-700 transition-colors shadow-md hover:shadow-lg active:scale-95 w-full sm:w-auto"
                  >
                    Bekijk alle losloopzones
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </>
            ) : (
              <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 text-center lg:text-left">
                <div className="bg-amber-50 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto lg:mx-0 mb-6 text-amber-500">
                  <Info size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Geen losloopweides in {city.name}</h3>
                <p className="text-slate-500 font-medium mb-8 leading-relaxed text-sm">
                  Er zijn momenteel geen officiële losloopweides geregistreerd in deze gemeente.
                </p>

                {nearestInfo && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left">
                    <span className="text-[10px] uppercase font-black tracking-widest text-sky-600 mb-2 block">Dichtstbijzijnde optie</span>
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-200 text-slate-400">
                        <Navigation size={20} />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="font-bold text-slate-900 text-sm truncate">{nearestInfo.area.name}</h4>
                        <p className="text-slate-500 text-[11px] font-medium">{nearestInfo.city.name} ({nearestInfo.distanceLabel})</p>
                      </div>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nearestInfo.area.name + ' ' + nearestInfo.area.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto p-2 bg-white rounded-full text-slate-400 hover:text-sky-600 transition-colors shadow-sm"
                      >
                        <ExternalLink size={16} />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="aspect-[4/3] lg:aspect-auto min-h-[280px] sm:min-h-[350px] md:min-h-[400px] relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-100 to-emerald-50 rounded-[1.5rem] sm:rounded-[2rem]" />
            <div className="absolute -inset-1 bg-gradient-to-br from-sky-400/20 via-emerald-400/20 to-cyan-400/20 rounded-[1.75rem] sm:rounded-[2.25rem] blur-sm opacity-60 md:group-hover:opacity-100 transition-opacity duration-500" />
            <div ref={mapRef} className="absolute inset-0 border-2 sm:border-4 border-white/80 shadow-xl sm:shadow-2xl shadow-sky-500/10 ring-1 ring-slate-200/50 rounded-[1.5rem] sm:rounded-[2rem]" style={{ touchAction: 'pan-x pan-y' }} />
            <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 z-[20] lg:hidden">
              <div className="bg-white/95 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[9px] sm:text-[10px] font-black uppercase text-slate-600 shadow-lg border border-white/50 flex items-center gap-1.5 sm:gap-2">
                <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                </svg>
                Pinch om te zoomen
              </div>
            </div>
            <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-[20] flex flex-col gap-1.5 sm:gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2 bg-white/95 backdrop-blur-md px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border border-emerald-100 shadow-lg shadow-emerald-500/10">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 ring-2 ring-emerald-400/30"></div>
                <span className="text-[9px] sm:text-[10px] font-black uppercase text-emerald-700">Nu open</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 bg-white/95 backdrop-blur-md px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border border-rose-100 shadow-lg shadow-rose-500/10">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-gradient-to-br from-rose-400 to-rose-600"></div>
                <span className="text-[9px] sm:text-[10px] font-black uppercase text-rose-700">Gesloten</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OffLeashAreas;
