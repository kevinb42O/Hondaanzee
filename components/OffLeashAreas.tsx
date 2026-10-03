import {escapeMapText} from '../utils/mapText.ts';
import {useZoneReviewSummaries} from '../utils/zoneReviews.ts';

import React, { useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, MessageSquare } from 'lucide-react';
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
      } else if (nearestInfo?.area) {
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

  const cityAreas = OFF_LEASH_AREAS.filter(area => area.city === city.slug);

  return (
    <section id="losloopweides" className="city-section city-offleash scroll-mt-28" aria-labelledby="city-offleash-title">
      <div className="city-shell city-offleash-grid">
        <div>
          <div className="city-section-heading">
            <p className="city-eyebrow">Ruimte om te ravotten</p>
            <h2 id="city-offleash-title" className="city-section-title">Losloopweides</h2>
            <p className="city-body-copy">Even stoom afblazen? Ontdek de plekken waar je hond veilig los mag lopen en spelen.</p>
          </div>
          {cityAreas.length > 0 ? (
            <div className="city-offleash-list">
              {cityAreas.map(area => {
                const image = getAreaImage(area);
                return (
                  <Link key={area.slug} to={getOffLeashAreaPath(area.slug)} className="city-offleash-item">
                    {image ? <img src={image} alt={area.name} width={72} height={72} loading="lazy" decoding="async" className="city-offleash-image" style={{ objectPosition: area.imagePosition || 'center' }} /> : <span className="city-offleash-image city-offleash-placeholder"><MapPin size={24} aria-hidden="true" /></span>}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3>{area.name}</h3>
                        {area.operationalStatus === 'temporarily_closed' && <span className="city-rule-label bg-rose-50 text-rose-800 border-rose-200">Tijdelijk gesloten</span>}
                      </div>
                      <p>{area.address}</p>
                      {area.description && <p>{area.description}</p>}
                      <div className="city-offleash-actions">
                        <span className="inline-flex items-center gap-1.5">Bekijk details <ArrowRight size={14} aria-hidden="true" /></span>
                        {reviewCounts[area.slug] > 0 && <span className="inline-flex items-center gap-1.5 text-slate-500"><MessageSquare size={13} aria-hidden="true" />{reviewCounts[area.slug]} {reviewCounts[area.slug] === 1 ? 'review' : 'reviews'}</span>}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="city-offleash-empty">
              <p>In {city.name} zijn momenteel geen officiële losloopweides geregistreerd.{nearestInfo?.area ? ' Er is wel een optie in de buurt.' : ''}</p>
              {nearestInfo?.area && <>
                <p className="city-eyebrow">Dichtstbijzijnde optie · {nearestInfo.city.name}</p>
                <Link to={getOffLeashAreaPath(nearestInfo.area.slug)} className="city-offleash-item">
                  {getAreaImage(nearestInfo.area) && <img src={getAreaImage(nearestInfo.area)} alt={nearestInfo.area.name} width={72} height={72} loading="lazy" decoding="async" className="city-offleash-image" style={{ objectPosition: nearestInfo.area.imagePosition || 'center' }} />}
                  <div className="min-w-0">
                    <h3>{nearestInfo.area.name}</h3>
                    <p>{nearestInfo.area.address}</p>
                    <span className="city-offleash-actions">Bekijk details <ArrowRight size={14} aria-hidden="true" /></span>
                  </div>
                </Link>
              </>}
            </div>
          )}
          <Link to="/losloopzones" className="city-text-link">Bekijk alle losloopzones <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
        <div className="city-offleash-map" aria-label={`Kaart met losloopweides bij ${city.name}`}>
          <div ref={mapRef} style={{ touchAction: 'pan-x pan-y' }} />
          <span className="city-map-hint">Gebruik twee vingers om te zoomen</span>
        </div>
      </div>
    </section>
  );
};

export default OffLeashAreas;
