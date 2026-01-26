
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CITIES } from '../cityData.ts';
import { MapPin, ArrowLeft, Navigation } from 'lucide-react';

// No image imports needed as we use custom divIcons

const CoastalMap: React.FC = () => {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletInstance = useRef<L.Map | null>(null);
    const navigate = useNavigate();
    const [isLocating, setIsLocating] = useState(false);

    const handleLocateMe = () => {
        if (!leafletInstance.current) return;

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;

                // Add or update user marker
                const userIcon = L.divIcon({
                    className: 'custom-pin-container',
                    html: `
                        <div style="width: 16px; height: 16px; background-color: #3b82f6; border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                            <div style="position: absolute; top: -8px; left: -8px; right: -8px; bottom: -8px; background-color: rgba(59, 130, 246, 0.5); border-radius: 50%; opacity: 0.7; animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
                        </div>
                    `,
                    iconSize: [16, 16],
                    iconAnchor: [8, 8]
                });

                // Check if user marker already exists
                // For simplicity, we just add a new one and pan
                L.marker([latitude, longitude], { icon: userIcon, zIndexOffset: 1000 })
                    .addTo(leafletInstance.current!)
                    .bindPopup("Je bent hier")
                    .openPopup();

                leafletInstance.current!.setView([latitude, longitude], 13);
                setIsLocating(false);
            },
            (err) => {
                console.error(err);
                alert("Kon locatie niet bepalen check je instellingen.");
                setIsLocating(false);
            }
        );
    };

    useEffect(() => {
        if (!mapRef.current) return;

        if (leafletInstance.current) {
            leafletInstance.current.remove();
            leafletInstance.current = null;
        }

        // Initialize map
        const map = L.map(mapRef.current, {
            zoomControl: false,
            scrollWheelZoom: true,
            dragging: !L.Browser.mobile, // Disable drag on mobile to allow page scroll, or keep it enabled if full page map
        });

        leafletInstance.current = map;

        // "Voyager" style (Clean & Colorful)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap &copy; CARTO',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        const markers: L.Marker[] = [];

        // Add markers for each city
        CITIES.forEach((city) => {
            // Determine status for coloring
            const now = new Date();
            const month = now.getMonth() + 1;
            const day = now.getDate();
            const currentDateStr = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

            const rules = city.rules;
            const summer = rules.summer;
            let activeStatus = rules.winter.status;

            if (summer && currentDateStr >= summer.start && currentDateStr <= summer.end) {
                activeStatus = summer.status;
                if (summer.startTime && summer.endTime) {
                    if (currentTimeStr >= summer.startTime && currentTimeStr <= summer.endTime) {
                        activeStatus = 'NEE';
                    }
                }
            }

            const colorMap: Record<string, string> = {
                'JA': '#10b981', // Emerald 500
                'DEELS': '#f97316', // Orange 500
                'NEE': '#e11d48'  // Rose 600
            };
            const color = colorMap[activeStatus] || '#0ea5e9';

            // Use SVG Data URI to strictly avoid Leaflet's divIcon white background usage
            const svgString = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40" width="32" height="40">
                    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="black" flood-opacity="0.3"/>
                    </filter>
                    <g filter="url(#shadow)">
                        <path d="M16 40 C16 40 4 26 4 16 C4 9.37 9.37 4 16 4 C22.63 4 28 9.37 28 16 C28 26 16 40 16 40Z" fill="${color}" stroke="white" stroke-width="3"/>
                        <circle cx="16" cy="16" r="4" fill="white" fill-opacity="0.8"/>
                    </g>
                </svg>
            `.trim();

            const encodedSvg = `data:image/svg+xml;base64,${btoa(svgString)}`;

            const customIcon = L.icon({
                iconUrl: encodedSvg,
                iconSize: [32, 40],
                iconAnchor: [16, 40],
                popupAnchor: [0, -40],
                className: 'custom-pin-icon' // Just in case, but img tags don't get white background by default
            });

            const marker = L.marker([city.lat, city.lng], { icon: customIcon }).addTo(map);
            markers.push(marker);

            marker.bindPopup(`
                <div style="font-family: inherit; text-align: center; min-width: 200px; padding: 4px;">
                    <div style="width: 100%; height: 100px; border-radius: 8px; background-color: #f1f5f9; margin-bottom: 8px; overflow: hidden; position: relative;">
                        <img src="${city.image}" style="width: 100%; height: 100%; object-fit: cover;" alt="${city.name}" />
                        <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);"></div>
                        <h3 style="position: absolute; bottom: 4px; left: 8px; color: white; font-weight: 900; font-size: 16px; text-shadow: 0 1px 3px rgba(0,0,0,0.8); margin: 0;">${city.name}</h3>
                    </div>
                    
                    <span style="background-color: ${color}; color: white; padding: 4px 10px; border-radius: 99px; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; display: inline-block; margin-bottom: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                        ${activeStatus === 'JA' ? 'Vrij Toegankelijk' : activeStatus === 'DEELS' ? 'Beperkt Toegankelijk' : 'Verboden'}
                    </span>
                    
                    <button 
                        class="btn-navigate"
                        style="width: 100%; padding: 10px; background-color: #0f172a; color: white; font-weight: 700; border-radius: 12px; font-size: 12px; border: none; cursor: pointer; transition: background-color 0.2s;"
                        onmouseover="this.style.backgroundColor='#0284c7'"
                        onmouseout="this.style.backgroundColor='#0f172a'"
                    >
                        Bekijk details
                    </button>
                </div>
            `, {
                closeButton: false,
                className: 'custom-popup',
                minWidth: 220
            });

            marker.on('popupopen', () => {
                const btn = document.querySelector('.leaflet-popup-content .btn-navigate');
                if (btn) {
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        navigate(`/${city.slug}`);
                    });
                }
            });
        });

        // Smart fit bounds to show all cities with some padding
        if (markers.length > 0) {
            const group = L.featureGroup(markers);
            map.fitBounds(group.getBounds().pad(0.1));
        }

        return () => {
            if (leafletInstance.current) {
                leafletInstance.current.remove();
                leafletInstance.current = null;
            }
        };
    }, [navigate]);

    return (
        <div className="h-[calc(100vh-80px)] w-full relative bg-slate-100">
            <div ref={mapRef} className="absolute inset-0 z-0 focus:outline-none" />

            {/* Top Bar Controls */}
            <div className="absolute top-4 left-4 right-4 z-[999] flex justify-between items-start pointer-events-none">
                <button
                    onClick={() => navigate('/')}
                    className="pointer-events-auto bg-white/90 backdrop-blur-md shadow-xl p-3 rounded-2xl hover:bg-white transition-all active:scale-95 text-slate-700 border border-white/50"
                >
                    <ArrowLeft size={24} />
                </button>

                <div className="pointer-events-auto bg-white/90 backdrop-blur-md shadow-xl px-4 py-2 rounded-2xl border border-white/50 text-center">
                    <h1 className="text-sm font-black text-slate-900 uppercase tracking-widest">Kustkaart</h1>
                </div>

                <button
                    onClick={handleLocateMe}
                    className={`pointer-events-auto bg-white/90 backdrop-blur-md shadow-xl p-3 rounded-2xl hover:bg-white transition-all active:scale-95 border border-white/50 ${isLocating ? 'text-sky-500 animate-pulse' : 'text-slate-700'}`}
                >
                    <Navigation size={24} className={isLocating ? "animate-spin" : ""} />
                </button>
            </div>

            {/* Legend - Floating Bottom */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[999] w-[90%] max-w-sm">
                <div className="bg-white/90 backdrop-blur-xl shadow-2xl rounded-2xl p-1.5 flex items-center justify-between gap-1 border border-white/50">
                    <div className="flex-1 flex flex-col items-center gap-1 py-1.5 rounded-xl bg-emerald-50/50">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-sm ring-1 ring-emerald-200"></div>
                        <span className="text-[9px] font-black uppercase text-emerald-700 tracking-wider">Vrij</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-1 py-1.5 rounded-xl bg-orange-50/50">
                        <div className="w-3 h-3 rounded-full bg-orange-500 border-2 border-white shadow-sm ring-1 ring-orange-200"></div>
                        <span className="text-[9px] font-black uppercase text-orange-700 tracking-wider">Deels</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-1 py-1.5 rounded-xl bg-rose-50/50">
                        <div className="w-3 h-3 rounded-full bg-rose-600 border-2 border-white shadow-sm ring-1 ring-rose-200"></div>
                        <span className="text-[9px] font-black uppercase text-rose-700 tracking-wider">Verboden</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoastalMap;
