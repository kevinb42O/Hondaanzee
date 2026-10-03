import {escapeMapText} from '../utils/mapText.ts';
import {useZoneReviewSummaries} from '../utils/zoneReviews.ts';

import React, { useMemo, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Navigation, Info, ExternalLink, MessageSquare } from 'lucide-react';
import { City, OffLeashArea } from '../types.ts';
import { CITIES } from '../cityData.ts';
import { OFF_LEASH_AREAS } from '../constants.ts';
import { getDistanceFromLatLonInKm } from '../utils/geo.ts';
import { getOffLeashAreaPath } from '../utils/offLeashRoutes.ts';
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

const getAreaImage = (area: OffLeashArea) =>
  [area.image, ...(area.images || [])].find(image => image && image !== '/placeholder.webp');

const getAreaPopup = (area: OffLeashArea, nearest = false) => {
  const image = getAreaImage(area);
  return `
    <div class="p-2 font-sans min-w-[180px] max-w-[240px]">
      ${nearest ? '<span class="text-[10px] uppercase font-black text-sky-600 block mb-1">Dichtstbijzijnde</span>' : ''}
      <div class="flex items-start gap-3 mb-2">
        ${image ? `<img src="${escapeMapText(image)}" alt="${escapeMapText(area.name)}" width="64" height="64" loading="lazy" decoding="async" class="h-16 w-16 rounded-lg object-cover shrink-0" style="object-position:${escapeMapText(area.imagePosition || 'center')}"/>` : ''}
        <div>
          <b class="text-slate-900 text-sm leading-tight">${escapeMapText(area.name)}</b>
          ${area.operationalStatus === 'temporarily_closed' ? '<span class="block mt-1 text-[10px] font-bold text-rose-700">Tijdelijk gesloten</span>' : ''}
        </div>
      </div>
      <p class="text-slate-500 text-xs mb-2">${escapeMapText(area.address)}</p>
      ${area.description ? `<p class="text-slate-400 text-[10px] leading-relaxed">${escapeMapText(area.description)}</p>` : ''}
    </div>
  `;
};

const OffLeashAreas: React.FC<OffLeashAreasProps> = ({ city }) => {
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletInstance = useRef<L.Map | null>(null);
  const {summaries:reviewSummaries}=useZoneReviewSummaries();
  const reviewCounts=Object.fromEntries(Object.entries(reviewSummaries).map(([slug,data])=>[slug,data.count]));

  const nearestInfo = useMemo(() => {
    const cityAreas = OFF_LEASH_AREAS.filter(area => area.city === city.slug);
    if (cityAreas.length > 0) return null;

    let nearestCity = CITIES[0];
    let minDistance = Infinity;

    CITIES.forEach((c) => {
      const cAreas = OFF_LEASH_AREAS.filter(area => area.city === c.slug);
      if (c.slug === city.slug || cAreas.length === 0) return;

      const dist = getDistanceFromLatLonInKm(city.lat, city.lng, c.lat, c.lng);

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

      // Standard OpenStreetMap tiles do not require an API key.
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxNativeZoom: 19,
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
        areasToShow.forEach(area => {
          const marker = L.marker([area.lat, area.lng]).addTo(map)
            .bindPopup(getAreaPopup(area));
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

        const nearestMarker = L.marker([nearestInfo.area.lat, nearestInfo.area.lng]).addTo(map)
          .bindPopup(getAreaPopup(nearestInfo.area, true));

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
      <div className="site-shell">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-start">
          <div>
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
                    const image = getAreaImage(area);
                    return (
                      <button
                        key={area.slug}
                        onClick={() => {
                          navigate(getOffLeashAreaPath(area.slug));
                        }}
                        className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 transition-all hover:shadow-md hover:border-emerald-300 group flex items-start gap-4 cursor-pointer w-full text-left"
                      >
                        {image ? (
                          <img
                            src={image}
                            alt={area.name}
                            width={80}
                            height={80}
                            loading="lazy"
                            decoding="async"
                            className="h-16 w-16 md:h-20 md:w-20 rounded-xl object-cover shrink-0"
                            style={{ objectPosition: area.imagePosition || 'center' }}
                          />
                        ) : (
                          <div className="h-16 w-16 md:h-20 md:w-20 rounded-xl flex items-center justify-center shrink-0 shadow-inner bg-emerald-50 text-emerald-600">
                            <MapPin size={24} />
                          </div>
                        )}
                        <div className="flex-grow min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="text-lg font-black text-slate-900 leading-tight">{area.name}</h3>
                            {area.operationalStatus === 'temporarily_closed' && (
                              <span className="bg-rose-100 text-rose-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Tijdelijk gesloten</span>
                            )}
                          </div>
                          <p className="text-slate-500 font-medium mb-2 text-xs md:text-sm flex items-center gap-1.5">
                            {area.address}
                          </p>
                          {area.description && (
                            <p className="text-slate-400 text-xs mb-3 leading-relaxed">{area.description}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                            <div className="inline-flex items-center gap-1.5 text-sky-600 font-bold text-xs">
                              Bekijk details →
                            </div>
                            {reviewCounts[area.slug] > 0 && (
                              <div className="inline-flex items-center gap-1 text-slate-400 font-semibold text-[10px]">
                                <MessageSquare size={11} />
                                {reviewCounts[area.slug]} {reviewCounts[area.slug] === 1 ? 'review' : 'reviews'}
                              </div>
                            )}
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
                      {getAreaImage(nearestInfo.area) ? (
                        <img
                          src={getAreaImage(nearestInfo.area)}
                          alt={nearestInfo.area.name}
                          width={56}
                          height={56}
                          loading="lazy"
                          decoding="async"
                          className="h-14 w-14 rounded-lg object-cover shrink-0"
                          style={{ objectPosition: nearestInfo.area.imagePosition || 'center' }}
                        />
                      ) : (
                        <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-200 text-slate-400">
                          <Navigation size={20} />
                        </div>
                      )}
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

          <div className="lg:sticky lg:top-28 h-[280px] sm:h-[350px] md:h-[400px] lg:h-[480px] relative group">
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

          </div>
        </div>
      </div>
    </section>
  );
};

export default OffLeashAreas;
