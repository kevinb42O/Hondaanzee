import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CITIES } from '../cityData.ts';
import { COASTAL_PATHS } from './CoastalPathsData.ts'; // Import local path data
import { ArrowLeft } from 'lucide-react';

const CoastalMap: React.FC = () => {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletInstance = useRef<L.Map | null>(null);
    const navigate = useNavigate();

    // Initial SVG dimensions (from the original SVG viewBox)
    const svgWidth = 625;
    const svgHeight = 372;
    const mapBounds: L.LatLngBoundsExpression = [[0, 0], [svgHeight, svgWidth]];

    const [hoveredCity, setHoveredCity] = useState<string | null>(null);
    const [userCity, setUserCity] = useState<string | null>(null);
    const [showInstructions, setShowInstructions] = useState<boolean>(() => {
        // Check if user has dismissed instructions before
        if (typeof window !== 'undefined') {
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
                        const distance = Math.sqrt(
                            Math.pow(city.lat - userLat, 2) + Math.pow(city.lng - userLng, 2)
                        );
                        if (distance < minDistance) {
                            minDistance = distance;
                            closestCity = city.slug;
                        }
                    });

                    if (closestCity) {
                        setUserCity(closestCity);
                    }
                },
                (error) => {
                    console.log("Geolocation error or denied:", error);
                }
            );
        }
    }, []);

    useEffect(() => {
        if (!mapRef.current) return;

        if (leafletInstance.current) {
            leafletInstance.current.remove();
            leafletInstance.current = null;
        }

        // Initialize map
        const map = L.map(mapRef.current, {
            crs: L.CRS.Simple,
            minZoom: -1,
            maxZoom: 2,
            zoomSnap: 0.1,
            zoomDelta: 0.1,
            boxZoom: true,
            zoomControl: false,
            dragging: true,
            scrollWheelZoom: true,
            doubleClickZoom: false,
            attributionControl: false
        });

        leafletInstance.current = map;
        map.fitBounds(mapBounds);
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Construct SVG Element manually using extracted paths
        const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgElement.setAttribute('preserveAspectRatio', 'xMidYMid slice');
        svgElement.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
        svgElement.setAttribute('xmlns', "http://www.w3.org/2000/svg");

        // Styling matches previous implementation
        svgElement.style.width = '100%';
        svgElement.style.height = '100%';
        svgElement.style.overflow = 'visible'; // Allow shadows to extend beyond viewBox
        svgElement.classList.add('map-3d-shadow');

        // Create a temporary container to measure bounding boxes
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.visibility = 'hidden';
        tempContainer.style.width = '0px';
        tempContainer.style.height = '0px';
        document.body.appendChild(tempContainer);

        // Clone for measurement
        const measureSvg = svgElement.cloneNode(false) as SVGElement;
        tempContainer.appendChild(measureSvg);

        // Group to hold labels
        const labelGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        labelGroup.setAttribute('class', 'map-labels');

        // Create paths and labels for each city
        CITIES.forEach(city => {
            // Find matching path key
            const pathKey = Object.keys(COASTAL_PATHS).find(key => city.name.includes(key));
            const pathData = pathKey ? COASTAL_PATHS[pathKey] : null;

            if (pathData) {
                const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                path.setAttribute('d', pathData);
                path.setAttribute('id', `sector-${city.slug}`);
                path.classList.add('kust-gemeente'); // Retain CSS class for styling

                // --- Dynamic Status Coloring ---
                const today = new Date();
                const currentMonth = today.getMonth() + 1;
                const currentDay = today.getDate();
                const dateString = `${currentMonth.toString().padStart(2, '0')}-${currentDay.toString().padStart(2, '0')}`;

                let currentStatus = city.rules.winter.status; // Default to winter

                if (city.rules.summer) {
                    const start = city.rules.summer.start;
                    const end = city.rules.summer.end;

                    if (start && end) {
                        // Simple string comparison works for MM-DD format
                        // Handle year wrapping if needed (e.g. winter start > end), but summer usually within year
                        if (dateString >= start && dateString <= end) {
                            currentStatus = city.rules.summer.status;
                        }
                    }
                }

                let fillColor = '#F0C674'; // Default Sand

                // Map status to Legend Colors (Tailwind matches)
                if (currentStatus === 'JA' || (currentStatus as string) === 'VRIJ') {
                    fillColor = '#10b981'; // Emerald-500 (VRIJ)
                } else if (currentStatus === 'DEELS') {
                    fillColor = '#f97316'; // Orange-500 (DEELS)
                } else if (currentStatus === 'NEE' || (currentStatus as string) === 'VERBODEN') {
                    fillColor = '#e11d48'; // Rose-600 (VERBODEN)
                }

                path.style.fill = fillColor;
                path.style.stroke = '#00607c'; // Ocean blue stroke
                path.style.strokeWidth = '2px';

                // Event Listeners
                path.addEventListener('mouseenter', () => {
                    path.style.fill = '#FFC107'; // Brighter gold on hover
                    setHoveredCity(city.name);

                    const label = svgElement.querySelector(`#label-${city.slug}`) as SVGTextElement;
                    if (label) {
                        label.setAttribute('fill', '#FFC107');
                        label.setAttribute('font-weight', '800');
                        label.setAttribute('font-size', '12px');
                        label.style.textShadow = '0px 0px 8px rgba(0,0,0,0.5)';
                    }
                });

                path.addEventListener('mouseleave', () => {
                    path.style.fill = fillColor; // Reset to dynamic status color
                    setHoveredCity(null);

                    const label = svgElement.querySelector(`#label-${city.slug}`) as SVGTextElement;
                    if (label) {
                        label.setAttribute('fill', 'white');
                        label.setAttribute('font-weight', '600');
                        label.setAttribute('font-size', '8px');
                        label.style.textShadow = 'none';
                    }
                });

                path.addEventListener('click', () => {
                    navigate(`/${city.slug}`);
                });

                svgElement.appendChild(path);

                // --- Label Logic ---
                // Add path to measurement SVG to get BBox
                const measurePath = path.cloneNode(true) as SVGPathElement;
                measureSvg.appendChild(measurePath);
                const bbox = measurePath.getBBox();

                // Use the visual center
                let centerX = bbox.x + bbox.width / 2;
                let centerY = bbox.y + bbox.height / 2;

                // Special positioning for Zeebrugge - place it between Blankenberge and Knokke
                if (city.slug === 'zeebrugge') {
                    centerX = 490; // Moved further west
                    centerY = 45;  // Moved further north (into the sea)
                } else if (city.slug === 'nieuwpoort') {
                    centerX = 165;
                    centerY = 245; // Moved further right/down (closer to land)
                } else if (city.slug === 'middelkerke') {
                    centerX = 215;
                    centerY = 210; // Moved further right/down (closer to land)
                }

                // Use a FIXED offset for all cities to create aligned, polished appearance
                const fixedOffset = 60; // All labels end at the same distance from their city center

                const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                text.setAttribute('id', `label-${city.slug}`); // Add ID for targeting

                // Refined Positioning
                const rotation = 50; // pointing AT the city

                text.setAttribute('x', centerX.toString());
                text.setAttribute('y', centerY.toString());
                // translate(-fixedOffset, 0) moves the anchor point "back" into the sea
                text.setAttribute('transform', `rotate(${rotation}, ${centerX}, ${centerY}) translate(-${fixedOffset}, 0)`);

                text.setAttribute('text-anchor', 'end'); // Text ends at the anchor point (closest to city)
                text.setAttribute('fill', 'white');
                text.setAttribute('font-size', '8px');
                text.setAttribute('font-weight', '600');
                text.setAttribute('font-family', "'Poppins', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif");
                text.style.pointerEvents = 'none';
                text.style.letterSpacing = '0.3px';
                text.style.transition = 'all 0.3s ease'; // Smooth transition for hover

                text.textContent = city.name.replace(' - ', '-');

                labelGroup.appendChild(text);
            }
        });

        // Append labels AFTER paths so they stay on top
        svgElement.appendChild(labelGroup);

        // --- Render User Location Pin --- /* NEW */
        if (userCity) {
            const userCityData = CITIES.find(c => c.slug === userCity);
            if (userCityData) {
                // Recalculate center for pin placement (same logic as labels)
                // Find matching path key
                const pathKey = Object.keys(COASTAL_PATHS).find(key => userCityData.name.includes(key));
                const pathData = pathKey ? COASTAL_PATHS[pathKey] : null;

                if (pathData) {
                    // Create dummy path to measure
                    const measurePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    measurePath.setAttribute('d', pathData);
                    measureSvg.appendChild(measurePath);
                    const bbox = measurePath.getBBox();

                    let pinX = bbox.x + bbox.width / 2;
                    let pinY = bbox.y + bbox.height / 2;

                    // Apply same offsets if any specific ones exist (simplified reusing known logic)
                    if (userCityData.slug === 'zeebrugge') { pinX = 490; pinY = 45; }
                    else if (userCityData.slug === 'nieuwpoort') { pinX = 165; pinY = 245; }
                    else if (userCityData.slug === 'middelkerke') { pinX = 215; pinY = 210; }

                    // Move pin slightly towards land relative to label
                    // Or just put it right AT the "city center" (the new adjusted X/Y)

                    // Create Pin Group
                    const pinGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
                    pinGroup.setAttribute('transform', `translate(${pinX}, ${pinY})`);
                    pinGroup.style.pointerEvents = 'none'; // CRITICAL: Ignore clicks so city underneath is clickable

                    // Circle/Dot
                    const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                    dot.setAttribute('r', '4');
                    dot.setAttribute('fill', '#DC2626'); // Red-600
                    dot.setAttribute('stroke', 'white');
                    dot.setAttribute('stroke-width', '2');

                    // Use a simpler SVG Path for a "Pin" shape or Icon
                    // Let's us a simple circle with a pulse

                    // Pulse Animation
                    const pulse = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                    pulse.setAttribute('r', '8');
                    pulse.setAttribute('fill', 'rgba(220, 38, 38, 0.4)');

                    const anim = document.createElementNS("http://www.w3.org/2000/svg", "animate");
                    anim.setAttribute('attributeName', 'r');
                    anim.setAttribute('from', '4');
                    anim.setAttribute('to', '12');
                    anim.setAttribute('dur', '1.5s');
                    anim.setAttribute('repeatCount', 'indefinite');
                    pulse.appendChild(anim);

                    const animOp = document.createElementNS("http://www.w3.org/2000/svg", "animate");
                    animOp.setAttribute('attributeName', 'opacity');
                    animOp.setAttribute('from', '0.8');
                    animOp.setAttribute('to', '0');
                    animOp.setAttribute('dur', '1.5s');
                    animOp.setAttribute('repeatCount', 'indefinite');
                    pulse.appendChild(animOp);

                    pinGroup.appendChild(pulse);
                    pinGroup.appendChild(dot);

                    svgElement.appendChild(pinGroup);
                }
            }
        }

        // Clean up temp
        document.body.removeChild(tempContainer);

        // Add to map using L.svgOverlay
        L.svgOverlay(svgElement, mapBounds, { interactive: true }).addTo(map);

        return () => {
            if (leafletInstance.current) {
                leafletInstance.current.remove();
                leafletInstance.current = null;
            }
        };
    }, [navigate, userCity]);

    return (
        <div className="h-[calc(100vh-80px)] w-full relative bg-[#00607c] p-4">
            <div ref={mapRef} className="absolute inset-4 z-0 focus:outline-none kaart-wrapper" />

            {/* Top Bar Controls */}
            <div className="absolute top-4 left-4 right-4 z-[999] flex justify-between items-start pointer-events-none">
                <button
                    onClick={() => navigate('/')}
                    className="pointer-events-auto bg-white/90 backdrop-blur-md shadow-xl p-3 rounded-2xl hover:bg-white transition-all active:scale-95 text-slate-700 border border-white/50"
                >
                    <ArrowLeft size={24} />
                </button>

                <div className="pointer-events-auto bg-white/90 backdrop-blur-md shadow-xl px-4 py-2 rounded-2xl border border-white/50 text-center transition-all duration-300">
                    <h1 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                        {hoveredCity ? hoveredCity : 'Kustkaart'}
                    </h1>
                </div>

                <div className="w-12"></div> {/* Spacer for balance */}
            </div>

            {/* Combined Instructions & Legend - Unified Design */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[999] w-[90%] max-w-md">
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
                                aria-label="Dismiss instructions"
                            >
                                ✕
                            </button>
                            <h3 className="text-xs font-black text-sky-900 mb-1.5 pr-6 uppercase tracking-wider">💡 Hoe te gebruiken</h3>
                            <ul className="text-[10px] text-sky-800 space-y-0.5">
                                <li>• <strong>Klik</strong> op een gemeente voor details</li>
                                <li>• <strong>Zoom</strong> met scroll of knoppen</li>
                                <li>• <strong>Kleuren</strong> tonen huidige hondenregels</li>
                            </ul>
                        </div>
                    )}

                    {/* Legend Section */}
                    <div className="p-1.5 flex items-center justify-between gap-1">
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
        </div>
    );
};

export default CoastalMap;

