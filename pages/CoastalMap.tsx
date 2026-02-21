import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { CITIES } from '../cityData.ts';
import { getDistanceFromLatLonInKm } from '../utils/geo.ts';
import { ArrowLeft } from 'lucide-react';
import { CoastalMapRenderer } from '../components/CoastalMapRenderer.tsx';
import { useSEO, SEO_DATA } from '../utils/seo.ts';

const CoastalMap: React.FC = () => {
    useSEO(SEO_DATA.kaart);
    const mapRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const [hoveredCity, setHoveredCity] = useState<string | null>(null);
    const [userCity, setUserCity] = useState<string | null>(null);
    const [showInstructions, setShowInstructions] = useState<boolean>(() => {
        // Check if user has dismissed instructions before
        if (globalThis.window !== undefined) {
            return !localStorage.getItem('mapInstructionsDismissed');
        }
        return true;
    });

    // --- Geolocation Logic ---
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLat = position.coords.latitude;
                    const userLng = position.coords.longitude;

                    // Find closest city
                    let closestCity = null;
                    let minDistance = Infinity;

                    CITIES.forEach(city => {
                        const distance = getDistanceFromLatLonInKm(userLat, userLng, city.lat, city.lng);
                        if (distance < minDistance) {
                            minDistance = distance;
                            closestCity = city.slug;
                        }
                    });

                    if (closestCity) {
                        setUserCity(closestCity);
                    }
                },
                (_error) => {
                }
            );
        }
    }, []);

    return (
        <div className="h-[calc(100vh-80px)] w-full relative overflow-hidden bg-slate-950">
            {/* Professional Background Layer */}
            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_0%,#0e7490_0%,#083344_40%,#020617_100%)]" />

            {/* Subtle Noise Texture for "Paper/Premium" Feel */}
            <div
                className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }}
            />

            <div ref={mapRef} className="absolute inset-4 z-0 focus:outline-none kaart-wrapper" />

            <CoastalMapRenderer
                mapRef={mapRef}
                userCity={userCity}
                onHoverCity={setHoveredCity}
            />

            {/* Top Bar Controls */}
            <div className="absolute top-4 left-4 right-4 z-[999] flex justify-between items-start pointer-events-none">
                <button
                    onClick={() => navigate('/')}
                    className="pointer-events-auto bg-white/90 backdrop-blur-md shadow-xl p-3 rounded-2xl hover:bg-white transition-all active:scale-95 text-slate-700 border border-white/50"
                    aria-label="Terug naar home"
                >
                    <ArrowLeft size={24} />
                </button>
                {/* sr-only label for back button */}

                <div className="pointer-events-auto bg-white/90 backdrop-blur-md shadow-xl px-4 py-2 rounded-2xl border border-white/50 text-center transition-all duration-300">
                    <h1 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                        {hoveredCity || 'Kustkaart'}
                    </h1>
                </div>

                <div className="w-12"></div> {/* Spacer for balance */}
            </div>

            {/* Combined Instructions & Legend - Unified Design */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[999] w-[90%] max-w-md md:max-w-xl duration-300 ease-out">
                <div className="bg-white/90 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/50 overflow-hidden">
                    {/* Instructions Section */}
                    {showInstructions && (
                        <div className="relative bg-gradient-to-r from-sky-50 to-blue-50 p-3 border-b border-sky-200">
                            <button
                                onClick={() => {
                                    setShowInstructions(false);
                                    localStorage.setItem('mapInstructionsDismissed', 'true');
                                }}
                                className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded-full bg-sky-200/50 hover:bg-sky-300/70 transition-colors text-sky-700 text-xs font-bold"
                                aria-label="Instructies sluiten"
                            >
                                ✕
                            </button>
                            <h3 className="text-xs md:text-sm font-black text-sky-900 mb-1.5 pr-6 uppercase tracking-wider">💡 Hoe te gebruiken</h3>
                            <ul className="text-[10px] md:text-xs text-sky-800 space-y-0.5 md:space-y-1">
                                <li>• <strong>Klik</strong> op een gemeente voor details</li>
                                <li>• <strong>Zoom</strong> met scroll of knoppen</li>
                                <li>• <strong>Kleuren</strong> tonen huidige hondenregels</li>
                            </ul>
                        </div>
                    )}

                    {/* Legend Section */}
                    <div className="p-1.5 md:p-3 flex items-center justify-between gap-1 md:gap-4">
                        <div className="flex-1 flex flex-col items-center gap-1 py-1.5 md:py-2 rounded-xl bg-emerald-50/50">
                            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600 border-2 border-white shadow-sm ring-1 ring-emerald-200"></div>
                            <span className="text-[9px] md:text-xs font-black uppercase text-emerald-700 tracking-wider">Vrij</span>
                        </div>
                        <div className="flex-1 flex flex-col items-center gap-1 py-1.5 md:py-2 rounded-xl bg-orange-50/50">
                            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-gradient-to-b from-orange-400 to-orange-600 border-2 border-white shadow-sm ring-1 ring-orange-200"></div>
                            <span className="text-[9px] md:text-xs font-black uppercase text-orange-700 tracking-wider">Deels</span>
                        </div>
                        <div className="flex-1 flex flex-col items-center gap-1 py-1.5 md:py-2 rounded-xl bg-rose-50/50">
                            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-gradient-to-b from-rose-500 to-rose-700 border-2 border-white shadow-sm ring-1 ring-rose-200"></div>
                            <span className="text-[9px] md:text-xs font-black uppercase text-rose-700 tracking-wider">Verboden</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoastalMap;

