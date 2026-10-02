import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CITIES } from '../../cityData.ts';
import { resolveSavedPlace, type SavedPlace } from '../../utils/memberData.ts';

export default function FavoriteMap({ places }: { places: SavedPlace[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [tileError, setTileError] = useState(false);
  const groups = CITIES.map(city => ({ city, places: places.filter(p => p.city_slug === city.slug).map(resolveSavedPlace).filter(Boolean) })).filter(g => g.places.length);
  const signature = places.map(p => `${p.kind}/${p.city_slug}/${p.place_slug}`).join(',');
  useEffect(() => {
    if (!ref.current || !groups.length) return;
    const map = L.map(ref.current, { scrollWheelZoom: false }).setView([51.19, 2.9], 10);
    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(map);
    tiles.on('tileerror', () => setTileError(true));
    const points: L.LatLngExpression[] = [];
    for (const group of groups) {
      const position: L.LatLngExpression = [group.city.lat, group.city.lng]; points.push(position);
      const marker = L.marker(position, { icon: L.divIcon({ className: 'member-map-pin', html: `<span>${group.places.length}</span>`, iconSize: [42, 42], iconAnchor: [21, 42] }), title: `${group.city.name}: ${group.places.length} bewaarde plekken`, keyboard: true }).addTo(map);
      marker.on('click', () => setSelected(group.city.slug));
    }
    if (points.length === 1) map.setView(points[0], 12); else map.fitBounds(L.latLngBounds(points), { padding: [45, 45], maxZoom: 12 });
    const observer = new ResizeObserver(() => map.invalidateSize()); observer.observe(ref.current);
    return () => { observer.disconnect(); map.remove(); };
  }, [signature]);
  return <div className="member-map-layout"><div><div className="member-favorite-map" ref={ref} aria-label="Kaart van je favorieten per kustgemeente" /><p className="member-map-caption">De bolletjes groeperen je plekken per gemeente. Open een plek voor het precieze adres.</p>{tileError && <p className="member-error" role="status">De kaartachtergrond kon niet laden. Je plekken blijven beschikbaar in de lijst.</p>}</div><div className="member-map-list">{groups.filter(g => !selected || g.city.slug === selected).map(g => <section key={g.city.slug}><button type="button" className="member-text-button" onClick={() => setSelected(selected === g.city.slug ? null : g.city.slug)}>{g.city.name}<span>{g.places.length}</span></button>{g.places.map(p => <Link key={p.key} to={p.path}><img src={p.image} alt="" /><span><strong>{p.name}</strong><small>{p.address}</small></span></Link>)}</section>)}{selected && <button className="member-button member-button-small" onClick={() => setSelected(null)}>Alle gemeenten tonen</button>}</div></div>;
}
